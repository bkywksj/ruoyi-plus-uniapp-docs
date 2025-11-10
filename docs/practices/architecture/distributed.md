# 分布式系统设计

> **RuoYi-Plus-UniApp 全栈框架分布式架构设计方案**
>
> 本文档详细介绍项目的分布式系统设计,包括数据源切换、分布式锁、消息队列、任务调度等分布式特性的实现方案与最佳实践。

---

## 架构概览

### 分布式架构设计

RuoYi-Plus-UniApp采用**单体架构 + 分布式组件**的混合设计模式,在保持单体应用简洁性的同时,通过引入分布式组件来解决高并发、高可用等问题。

```
┌─────────────────────────────────────────────────────────────────┐
│                      RuoYi-Plus-UniApp 应用                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web 应用层  │  │ Mobile 应用层 │  │  Admin 应用层 │          │
│  │   (Nginx)    │  │   (UniApp)    │  │   (Vue 3)    │          │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘          │
│         │                 │                   │                   │
│         └─────────────────┴───────────────────┘                   │
│                            │                                      │
│         ┌──────────────────▼──────────────────┐                  │
│         │       Spring Boot 应用服务层         │                  │
│         │  ┌────────────────────────────────┐ │                  │
│         │  │     业务模块 (ruoyi-modules)    │ │                  │
│         │  ├────────────────────────────────┤ │                  │
│         │  │  通用模块 (ruoyi-common-*)      │ │                  │
│         │  └────────────────────────────────┘ │                  │
│         └──────────────────┬──────────────────┘                  │
│                            │                                      │
│    ┌───────────────────────┴───────────────────────┐             │
│    │                                                │             │
│    ▼                                                ▼             │
│ ┌──────────────┐                          ┌──────────────┐       │
│ │  持久化层     │                          │  分布式组件   │       │
│ ├──────────────┤                          ├──────────────┤       │
│ │ 主库(Master) │                          │ Redis 集群   │       │
│ │ 从库(Slave)  │                          │ (缓存+锁)    │       │
│ │ 读写分离     │                          └──────────────┘       │
│ └──────────────┘                                   │              │
│                                           ┌────────┴────────┐     │
│                                           ▼                 ▼     │
│                                  ┌──────────────┐ ┌──────────────┐│
│                                  │  RocketMQ    │ │  SnailJob    ││
│                                  │  (消息队列)   │ │ (任务调度)   ││
│                                  └──────────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 核心特性

RuoYi-Plus-UniApp的分布式设计具有以下核心特性:

- **读写分离** - 基于Dynamic-Datasource实现主从数据库自动切换
- **分布式锁** - 支持Redisson和Lock4j两种分布式锁方案
- **消息队列** - 集成RocketMQ实现异步解耦和削峰填谷
- **任务调度** - 集成SnailJob实现分布式定时任务管理
- **多数据源** - 支持MySQL、Oracle、PostgreSQL、SQLServer多数据库
- **事务管理** - 支持分布式事务和跨数据源事务

参考: `ruoyi-plus-uniapp/pom.xml:1-540`

---

## 读写分离

### 架构设计

项目使用**Dynamic-Datasource**实现读写分离,通过主从数据库配置和`@DS`注解实现数据源的动态切换。

```
                       ┌─────────────────┐
                       │   应用服务层     │
                       └────────┬────────┘
                                │
                    ┌───────────▼──────────┐
                    │ Dynamic-Datasource   │
                    │  (动态数据源路由)     │
                    └────┬────────────┬────┘
                         │            │
              写操作 ────►│            │◄──── 读操作
                         │            │
                    ┌────▼────┐  ┌────▼────┐
                    │  Master │  │  Slave  │
                    │ (主库)   │  │ (从库)  │
                    │  写+读   │  │  只读   │
                    └─────────┘  └─────────┘
                         │            │
                    MySQL Replication ──►
```

### 配置方式

**1. 数据源配置**

在`application.yml`中配置主从数据源:

```yaml
################## 数据源配置 ##################
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    dynamic:
      # 设置默认数据源(写操作)
      primary: master
      # 严格模式 匹配不到数据源则报错
      strict: true
      # 各个数据源配置
      datasource:
        # 主库数据源(读写)
        master:
          type: ${spring.datasource.type}
          driverClassName: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://${DB_HOST:127.0.0.1}:${DB_PORT:3306}/${DB_NAME:ryplus_uni}?useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true
          username: ${DB_USERNAME:root}
          password: ${DB_PASSWORD:root}
        # 从库数据源(只读)
        slave:
          lazy: true  # 懒加载
          type: ${spring.datasource.type}
          driverClassName: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://${DB_SLAVE_HOST:127.0.0.1}:${DB_SLAVE_PORT:3306}/${DB_SLAVE_NAME:ryplus_uni}?useUnicode=true&characterEncoding=utf8
          username: ${DB_SLAVE_USERNAME:root}
          password: ${DB_SLAVE_PASSWORD:root}
      # 连接池配置
      hikari:
        maxPoolSize: 20
        minIdle: 10
        connectionTimeout: 30000
        idleTimeout: 600000
        maxLifetime: 1800000
```

参考: `ruoyi-admin/src/main/resources/application-dev.yml:28-100`

**2. 使用@DS注解切换数据源**

在Service或Mapper方法上使用`@DS`注解指定数据源:

```java
import com.baomidou.dynamic.datasource.annotation.DS;
import org.springframework.stereotype.Service;

/**
 * 代码生成业务表服务实现类
 */
@Service
public class GenTableServiceImpl implements IGenTableService {

    /**
     * 分页查询数据库表列表
     * 使用动态数据源切换到指定数据源
     *
     * @param genTable  查询条件
     * @param pageQuery 分页参数
     * @return 分页结果
     */
    @DS("#genTable.dataName")  // 动态切换到指定数据源
    @Override
    public PageResult<GenTable> pageDbTables(GenTable genTable, PageQuery pageQuery) {
        // 查询数据库表元数据
        LinkedHashMap<String, Table<?>> tablesMap = ServiceProxy.metadata().tables();
        // 处理查询结果...
        return PageResult.of(page);
    }

    /**
     * 根据表名查询列信息
     *
     * @param tableName 表名称
     * @param dataName  数据源名称
     * @return 列信息列表
     */
    @DS("#dataName")  // SpEL表达式,支持参数动态切换
    @Override
    public List<GenTableColumn> listDbTableColumnsByName(String tableName, String dataName) {
        Table<?> table = ServiceProxy.metadata().table(tableName);
        // 处理列信息...
        return tableColumns;
    }
}
```

参考: `ruoyi-modules/ruoyi-generator/src/main/java/plus/ruoyi/generator/service/GenTableServiceImpl.java:124-362`

### @DS注解详解

**1. 支持的注解位置**

```java
// 1. 类级别 - 整个类的方法都使用该数据源
@DS("slave")
public class UserServiceImpl {
    // 所有方法默认使用slave数据源
}

// 2. 方法级别 - 方法级别优先级高于类级别
@DS("slave")
public class UserServiceImpl {

    @DS("master")  // 该方法使用master数据源
    public void saveUser(User user) {
        // 写操作使用主库
    }

    public List<User> listUsers() {
        // 读操作使用从库(类级别的slave)
    }
}
```

**2. SpEL表达式支持**

```java
// 1. 参数值切换
@DS("#dataName")
public void query(String dataName) {
    // 根据参数值动态切换数据源
}

// 2. 对象属性切换
@DS("#user.tenantId")
public void saveUser(User user) {
    // 根据对象属性动态切换
}

// 3. 方法返回值切换
@DS("#session.getAttribute('tenant')")
public void process() {
    // 根据会话属性切换
}
```

**3. 数据源标识**

内置数据源标识:
- `master` - 主库(默认)
- `slave` - 从库
- 其他自定义标识(如`oracle`、`postgres`等)

### 分布式事务支持

**1. @DSTransactional注解**

Dynamic-Datasource提供了`@DSTransactional`注解来支持跨数据源事务:

```java
import com.baomidou.dynamic.datasource.annotation.DSTransactional;

/**
 * 导入数据库表结构
 * 跨数据源事务支持
 */
@DSTransactional  // 支持跨数据源事务
@Override
public void importGenTables(List<GenTable> tableList, String dataName) {
    try {
        for (GenTable table : tableList) {
            // 初始化表信息
            GenUtils.initTable(table);
            table.setDataName(dataName);

            // 保存表信息(可能在不同数据源)
            boolean result = genTableDao.insert(table);
            if (result) {
                // 查询并保存列信息(使用@DS切换数据源)
                List<GenTableColumn> columns =
                    SpringUtils.getAopProxy(this)
                        .listDbTableColumnsByName(tableName, dataName);
                genTableColumnDao.batchSave(columns);
            }
        }
    } catch (Exception e) {
        throw ServiceException.of("导入失败：" + e.getMessage());
    }
}
```

参考: `ruoyi-modules/ruoyi-generator/src/main/java/plus/ruoyi/generator/service/GenTableServiceImpl.java:289-323`

**2. 同步数据库事务**

```java
/**
 * 同步数据库表结构
 * 支持跨数据源事务
 */
@DSTransactional
@Override
public void syncDatabase(Long tableId) {
    GenTable table = genTableDao.getGenTableById(tableId);

    // 从数据库重新获取列信息(可能跨数据源)
    List<GenTableColumn> dbTableColumns =
        SpringUtils.getAopProxy(this)
            .listDbTableColumnsByName(table.getTableName(), table.getDataName());

    // 批量保存更新后的列信息
    if (CollUtil.isNotEmpty(saveColumns)) {
        genTableColumnDao.batchSave(saveColumns);
    }

    // 删除数据库中已不存在的列
    if (CollUtil.isNotEmpty(delColumns)) {
        List<Long> ids = StreamUtils.toList(delColumns, GenTableColumn::getColumnId);
        genTableColumnDao.deleteByIds(ids);
    }
}
```

参考: `ruoyi-modules/ruoyi-generator/src/main/java/plus/ruoyi/generator/service/GenTableServiceImpl.java:710-786`

### 读写分离最佳实践

**1. 主库写,从库读**

```java
public class UserServiceImpl {

    /**
     * 保存用户 - 使用主库
     */
    @DS("master")  // 明确指定主库
    public void saveUser(User user) {
        userMapper.insert(user);
    }

    /**
     * 查询用户列表 - 使用从库
     */
    @DS("slave")  // 使用从库
    public List<User> listUsers() {
        return userMapper.selectList(null);
    }
}
```

**2. 主从延迟处理**

```java
/**
 * 处理主从延迟问题
 * 插入后立即查询使用主库
 */
public Long saveAndGetId(User user) {
    // 1. 插入使用主库
    userMapper.insert(user);
    Long userId = user.getUserId();

    // 2. 立即查询也使用主库(避免主从延迟)
    User result = userMapper.selectById(userId);
    return result.getUserId();
}
```

**3. 强制使用主库**

某些场景下需要强制使用主库读取最新数据:

```java
/**
 * 强制从主库读取
 * 场景: 支付后立即查询订单状态
 */
@DS("master")  // 强制主库
public Order getOrderById(Long orderId) {
    return orderMapper.selectById(orderId);
}
```

---

## 分布式锁

### 架构设计

项目支持两种分布式锁实现方案:

1. **Redisson分布式锁** - 基于Redis实现,支持可重入、公平锁、读写锁等
2. **Lock4j注解锁** - 基于AOP实现,支持注解声明式锁

```
                    ┌─────────────────┐
                    │   应用服务层     │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
       ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
       │Redisson │     │ Lock4j  │     │手动锁   │
       │  锁API  │     │ @Lock4j │     │ RedLock │
       └────┬────┘     └────┬────┘     └────┬────┘
            │               │               │
            └───────────────┴───────────────┘
                            │
                    ┌───────▼───────┐
                    │  Redis 集群   │
                    │  (锁存储)     │
                    └───────────────┘
```

### Redisson分布式锁

**1. 基本用法**

```java
import org.redisson.api.RLock;
import plus.ruoyi.common.redis.utils.RedisUtils;

/**
 * Redisson分布式锁基本使用
 */
public class OrderService {

    /**
     * 使用分布式锁防止重复下单
     */
    public void createOrder(Long userId, Long productId) {
        // 构建锁的key
        String lockKey = "order:create:" + userId + ":" + productId;

        // 获取锁对象
        RLock lock = RedisUtils.getLock(lockKey);

        try {
            // 尝试获取锁,最多等待10秒,锁自动释放时间30秒
            boolean acquired = lock.tryLock(10, 30, TimeUnit.SECONDS);

            if (acquired) {
                try {
                    // 执行业务逻辑
                    // 1. 检查库存
                    // 2. 创建订单
                    // 3. 扣减库存
                    processOrder(userId, productId);
                } finally {
                    // 释放锁
                    lock.unlock();
                }
            } else {
                throw new ServiceException("系统繁忙,请稍后再试");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServiceException("获取锁失败");
        }
    }
}
```

**2. RedisUtils工具类**

项目封装了RedisUtils工具类简化锁的使用:

```java
package plus.ruoyi.common.redis.utils;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

/**
 * Redis工具类
 */
public class RedisUtils {

    private static RedissonClient CLIENT = SpringUtils.getBean(RedissonClient.class);

    /**
     * 获取可重入锁
     *
     * @param key 锁的key
     * @return RLock对象
     */
    public static RLock getLock(String key) {
        return CLIENT.getLock(key);
    }

    /**
     * 获取公平锁
     *
     * @param key 锁的key
     * @return RLock对象
     */
    public static RLock getFairLock(String key) {
        return CLIENT.getFairLock(key);
    }

    /**
     * 获取读锁
     *
     * @param key 锁的key
     * @return RLock对象
     */
    public static RLock getReadLock(String key) {
        return CLIENT.getReadWriteLock(key).readLock();
    }

    /**
     * 获取写锁
     *
     * @param key 锁的key
     * @return RLock对象
     */
    public static RLock getWriteLock(String key) {
        return CLIENT.getReadWriteLock(key).writeLock();
    }
}
```

参考: `ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/utils/RedisUtils.java:618-627`

**3. 可重入锁示例**

```java
/**
 * 可重入锁示例
 * 同一线程可以多次获取同一把锁
 */
public class InventoryService {

    public void updateInventory(Long productId, Integer quantity) {
        String lockKey = "inventory:" + productId;
        RLock lock = RedisUtils.getLock(lockKey);

        try {
            lock.lock(30, TimeUnit.SECONDS);

            // 业务逻辑1
            deductInventory(productId, quantity);

            // 可重入: 同一线程再次获取锁
            updateInventoryLog(productId, quantity);

        } finally {
            lock.unlock();
        }
    }

    private void updateInventoryLog(Long productId, Integer quantity) {
        String lockKey = "inventory:" + productId;
        RLock lock = RedisUtils.getLock(lockKey);

        try {
            // 可重入: 再次获取同一把锁
            lock.lock(10, TimeUnit.SECONDS);

            // 记录日志
            inventoryLogMapper.insert(new InventoryLog(productId, quantity));

        } finally {
            lock.unlock();
        }
    }
}
```

**4. 公平锁示例**

```java
/**
 * 公平锁示例
 * 按照请求的顺序获取锁
 */
public class TicketService {

    /**
     * 抢购火车票(按先后顺序)
     */
    public void bookTicket(Long userId, Long trainId) {
        String lockKey = "ticket:book:" + trainId;
        RLock lock = RedisUtils.getFairLock(lockKey);  // 公平锁

        try {
            // 公平锁会按照请求的顺序依次获取
            lock.lock(30, TimeUnit.SECONDS);

            // 1. 检查余票
            // 2. 创建订单
            // 3. 扣减余票
            processBooking(userId, trainId);

        } finally {
            lock.unlock();
        }
    }
}
```

**5. 读写锁示例**

```java
/**
 * 读写锁示例
 * 读锁共享,写锁独占
 */
public class ConfigService {

    /**
     * 读取配置(共享锁)
     */
    public String getConfig(String key) {
        String lockKey = "config:" + key;
        RLock readLock = RedisUtils.getReadLock(lockKey);

        try {
            readLock.lock(10, TimeUnit.SECONDS);

            // 多个线程可以同时持有读锁
            return configMapper.selectByKey(key);

        } finally {
            readLock.unlock();
        }
    }

    /**
     * 更新配置(独占锁)
     */
    public void updateConfig(String key, String value) {
        String lockKey = "config:" + key;
        RLock writeLock = RedisUtils.getWriteLock(lockKey);

        try {
            writeLock.lock(30, TimeUnit.SECONDS);

            // 写锁是独占的,其他读写都会阻塞
            configMapper.updateByKey(key, value);

            // 清除缓存
            RedisUtils.deleteObject("cache:config:" + key);

        } finally {
            writeLock.unlock();
        }
    }
}
```

### Lock4j注解锁

**1. @Lock4j注解基本用法**

Lock4j提供了声明式的分布式锁,通过注解即可使用:

```java
import com.baomidou.lock.annotation.Lock4j;

/**
 * 登录服务
 */
@Service
public class SysLoginService {

    /**
     * 绑定第三方用户
     * 使用Lock4j防止并发绑定
     */
    @Lock4j  // 自动加锁,方法执行完自动释放
    public void bindSocialAccount(AuthUser authUserData) {
        // 构建第三方用户唯一标识
        String authId = authUserData.getSource() + authUserData.getUuid();

        // 转换第三方用户信息
        SysSocialBo bo = BeanUtil.toBean(authUserData, SysSocialBo.class);
        BeanUtil.copyProperties(authUserData.getToken(), bo);

        // 设置关联信息
        Long userId = LoginHelper.getUserId();
        bo.setUserId(userId);
        bo.setAuthId(authId);

        // 检查该第三方账号是否已被其他用户绑定
        List<SysSocialVo> checkList = sysSocialService.listSocialsByAuthId(authId);
        if (CollUtil.isNotEmpty(checkList)) {
            throw ServiceException.of("此三方账号已经被绑定!");
        }

        // 查询当前用户是否已绑定同平台的其他账号
        SysSocialBo params = new SysSocialBo();
        params.setUserId(userId);
        params.setSource(bo.getSource());
        List<SysSocialVo> list = sysSocialService.list(params);

        if (CollUtil.isEmpty(list)) {
            // 新增绑定
            sysSocialService.add(bo);
        } else {
            // 更新绑定
            bo.setId(list.get(0).getId());
            sysSocialService.update(bo);
        }
    }
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/auth/service/SysLoginService.java:86-126`

**2. 自定义锁key**

```java
/**
 * 使用SpEL表达式自定义锁key
 */
@Service
public class OrderService {

    /**
     * 创建订单
     * key支持SpEL表达式
     */
    @Lock4j(keys = {"#userId", "#productId"},
            expire = 30000,  // 锁过期时间30秒
            acquireTimeout = 10000)  // 获取锁超时时间10秒
    public void createOrder(Long userId, Long productId, Integer quantity) {
        // 锁的key为: order:userId:productId
        // 业务逻辑...
    }

    /**
     * 支付订单
     * 使用订单号作为锁key
     */
    @Lock4j(keys = "#orderNo")
    public void payOrder(String orderNo) {
        // 锁的key为: order:orderNo
        // 业务逻辑...
    }
}
```

**3. Lock4j注解参数详解**

```java
@Lock4j(
    // 锁的名称(支持SpEL表达式)
    name = "custom-lock",

    // 锁的key(支持SpEL表达式)
    keys = {"#userId", "#orderId"},

    // 锁过期时间(毫秒)
    expire = 30000,

    // 获取锁超时时间(毫秒)
    acquireTimeout = 10000,

    // 锁类型(可重入锁、公平锁、读锁、写锁)
    lockType = Lock4jType.REENTRANT
)
```

### 分布式锁最佳实践

**1. 锁粒度要细**

```java
// ❌ 错误: 锁粒度太粗
@Lock4j
public void updateUserInfo(User user) {
    // 更新用户信息
}

// ✅ 正确: 按用户ID加锁
@Lock4j(keys = "#user.userId")
public void updateUserInfo(User user) {
    // 只锁定当前用户
}
```

**2. 设置合理的超时时间**

```java
// ❌ 错误: 没有设置超时,可能永久等待
RLock lock = RedisUtils.getLock(lockKey);
lock.lock();  // 永久等待

// ✅ 正确: 设置超时时间
RLock lock = RedisUtils.getLock(lockKey);
boolean acquired = lock.tryLock(10, 30, TimeUnit.SECONDS);
if (acquired) {
    try {
        // 业务逻辑
    } finally {
        lock.unlock();
    }
}
```

**3. 避免死锁**

```java
// ❌ 错误: 可能导致死锁
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    RLock lock1 = RedisUtils.getLock("account:" + fromId);
    RLock lock2 = RedisUtils.getLock("account:" + toId);

    lock1.lock();
    lock2.lock();  // 可能导致死锁
    // 业务逻辑
}

// ✅ 正确: 按ID顺序加锁,避免死锁
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // 按ID大小排序,保证加锁顺序一致
    Long first = fromId < toId ? fromId : toId;
    Long second = fromId < toId ? toId : fromId;

    RLock lock1 = RedisUtils.getLock("account:" + first);
    RLock lock2 = RedisUtils.getLock("account:" + second);

    try {
        lock1.lock(30, TimeUnit.SECONDS);
        lock2.lock(30, TimeUnit.SECONDS);

        // 业务逻辑

    } finally {
        lock2.unlock();
        lock1.unlock();
    }
}
```

**4. 锁续期**

```java
/**
 * 长时间任务使用看门狗机制
 */
public void processLongTask(Long taskId) {
    String lockKey = "task:" + taskId;
    RLock lock = RedisUtils.getLock(lockKey);

    try {
        // 不指定leaseTime,使用看门狗机制自动续期
        lock.lock();

        // 长时间任务(看门狗会自动续期)
        processTask(taskId);

    } finally {
        lock.unlock();
    }
}
```

---

## 消息队列

### 架构设计

项目集成了**RocketMQ**消息队列,用于实现异步处理、系统解耦和削峰填谷。

```
┌─────────────────────────────────────────────────────────────┐
│                      RocketMQ 架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                        ┌──────────────┐   │
│  │   Producer   │───── 发送消息 ─────────►│  NameServer │   │
│  │  (生产者)     │                        │  (路由中心)   │   │
│  └──────────────┘                        └───────┬──────┘   │
│         │                                        │           │
│         │                                        │           │
│         ▼                                        ▼           │
│  ┌──────────────┐                        ┌──────────────┐   │
│  │    Broker    │◄────── 拉取路由 ───────│   Consumer   │   │
│  │  (消息存储)   │                        │   (消费者)    │   │
│  │              │                        │              │   │
│  │ ┌──────────┐ │                        │ ┌──────────┐ │   │
│  │ │  Topic1  │ │                        │ │ Listener │ │   │
│  │ ├──────────┤ │                        │ └──────────┘ │   │
│  │ │  Topic2  │ │                        └──────────────┘   │
│  │ └──────────┘ │                                           │
│  └──────────────┘                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 配置方式

**1. RocketMQ配置**

在`application.yml`中配置RocketMQ:

```yaml
################## 消息队列配置 ##################
--- # rocketmq 配置
rocketmq:
  # 是否启用 RocketMQ
  enabled: ${ROCKETMQ_ENABLED:false}
  # NameServer 地址（多个用分号分隔）
  name-server: ${ROCKETMQ_NAME_SERVER:127.0.0.1:9876}
  # 集群名称
  cluster-name: ${ROCKETMQ_CLUSTER_NAME:RuoYiCluster}
  # Broker 地址
  broker-addr: ${ROCKETMQ_BROKER_ADDR:127.0.0.1:10911}

  # 生产者配置
  producer:
    # 生产者组名
    group: ${ROCKETMQ_PRODUCER_GROUP:ruoyi-producer-group-dev}
    # 发送消息超时时间（毫秒）
    send-message-timeout: ${ROCKETMQ_PRODUCER_MESSAGE_TIMEOUT:3000}
    # 消息最大大小（4MB）
    max-message-size: ${ROCKETMQ_PRODUCER_MESSAGE_SIZE:4194304}
    # 发送失败重试次数
    retry-times-when-send-failed: ${ROCKETMQ_PRODUCER_RETRY_FAILED:2}
    # 异步发送失败重试次数
    retry-times-when-send-async-failed: ${ROCKETMQ_PRODUCER_RETRY_ASYNC_FAILED:2}
    # 压缩消息阈值（超过 4KB 自动压缩）
    compress-message-body-threshold: ${ROCKETMQ_PRODUCER_MESSAGE_BODY_THRESHOLD:4096}
    # 是否自动创建 Topic
    auto-create-topic: ${ROCKETMQ_PRODUCER_AUTO_CREATE_TOPIC:true}
    # 批量发送消息的最大数量
    batch-size: ${ROCKETMQ_PRODUCER_BATCH_SIZE:100}
    # 是否启用消息发送日志
    enable-log: ${ROCKETMQ_PRODUCER_ENABLE_LOG:true}

  # 消费者配置
  consumer:
    # 消费线程池最小线程数
    consume-thread-min: 20
    # 消费线程池最大线程数
    consume-thread-max: 64
    # 消息拉取批次大小
    pull-batch-size: 32
```

参考: `ruoyi-admin/src/main/resources/application-dev.yml:164-200`

**2. 自动配置类**

项目封装了RocketMQ自动配置类:

```java
package plus.ruoyi.common.rocketmq.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import plus.ruoyi.common.rocketmq.util.RMDiagnosticUtil;
import plus.ruoyi.common.rocketmq.util.RMSendUtil;
import plus.ruoyi.common.rocketmq.util.RMTopicUtil;

/**
 * RocketMQ 自动配置类
 * <p>
 * 集成 RocketMQ 消息队列框架，提供以下功能：
 * <ul>
 * <li>自动配置生产者和消费者</li>
 * <li>提供 RocketMQTemplate 工具类</li>
 * <li>支持注解式消费者 @RocketMQMessageListener</li>
 * <li>自动初始化静态工具类（RMSendUtil、RMTopicUtil、RMDiagnosticUtil）</li>
 * </ul>
 * <p>
 * 配置启用条件：需要在配置文件中设置 rocketmq.enabled=true
 *
 * @author 路北
 * @date 2025-11-02
 */
@Slf4j
@AutoConfiguration
@ConditionalOnProperty(prefix = "rocketmq", name = "enabled", havingValue = "true")
@EnableConfigurationProperties(RocketMQProperties.class)
public class RocketMQAutoConfiguration {

    private final RocketMQProperties properties;

    /**
     * 构造函数：打印 RocketMQ 配置信息
     */
    public RocketMQAutoConfiguration(RocketMQProperties properties) {
        this.properties = properties;
        log.info("========================================");
        log.info("🚀 RocketMQ 模块开始初始化");
        log.info("  - NameServer: {}", properties.getNameServer());
        log.info("  - 集群名称: {}", properties.getClusterName());
        log.info("  - Broker地址: {}", properties.getBrokerAddr());
        log.info("  - 生产者组: {}", properties.getProducer().getGroup());
        log.info("  - 发送超时: {}ms", properties.getProducer().getSendMsgTimeout());
        log.info("  - 自动创建Topic: {}", properties.getProducer().getAutoCreateTopic());
        log.info("  - 消费线程: {}-{}",
            properties.getConsumer().getConsumeThreadMin(),
            properties.getConsumer().getConsumeThreadMax());
        log.info("========================================");
    }

    /**
     * 初始化 RMSendUtil 工具类
     */
    @Bean
    public Object rmSendUtilInitializer(RocketMQTemplate rocketMQTemplate) {
        RMSendUtil.init(rocketMQTemplate, properties);
        return new Object();
    }

    /**
     * 初始化 RMTopicUtil 工具类
     */
    @Bean
    public Object rmTopicUtilInitializer() {
        RMTopicUtil.init(properties);
        return new Object();
    }

    /**
     * 初始化 RMDiagnosticUtil 工具类
     */
    @Bean
    public Object rmDiagnosticUtilInitializer() {
        RMDiagnosticUtil.init(properties);
        return new Object();
    }

    /**
     * RocketMQ 启动完成日志 + 自动诊断
     */
    @Bean
    public Object rocketMQStartupLogger() {
        log.info("========================================");
        log.info("✅ RocketMQ 客户端启动完成！");
        log.info("========================================");

        // 自动诊断 Broker 连接状态
        try {
            RMDiagnosticUtil.diagnose();
        } catch (Exception e) {
            log.warn("⚠️ Broker 状态检查失败: {}", e.getMessage());
        }

        return new Object();
    }
}
```

参考: `ruoyi-common/ruoyi-common-rocketmq/src/main/java/plus/ruoyi/common/rocketmq/config/RocketMQAutoConfiguration.java:1-112`

### 生产者

**1. RMSendUtil工具类**

项目封装了`RMSendUtil`工具类简化消息发送:

```java
package plus.ruoyi.common.rocketmq.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import plus.ruoyi.common.rocketmq.enums.DelayLevel;

/**
 * RocketMQ 消息生产者工具类
 * <p>
 * 提供简化的消息发送 API，封装 RocketMQTemplate 的常用操作
 * </p>
 *
 * @author 路北
 * @date 2025-11-03
 */
@Slf4j
public class RMSendUtil {

    private static RocketMQTemplate rocketMQTemplate;
    private static RocketMQProperties properties;

    /**
     * 初始化工具类
     */
    public static void init(RocketMQTemplate template, RocketMQProperties props) {
        rocketMQTemplate = template;
        properties = props;
        log.debug("RMSendUtil 初始化完成");
    }

    // ==================== 同步发送 ====================

    /**
     * 同步发送消息
     * <p>最简单的发送方式，阻塞等待响应，保证可靠性</p>
     *
     * @param topic   Topic 名称
     * @param message 消息对象
     * @return 发送结果
     */
    public static SendResult send(String topic, Object message) {
        return send(topic, message, properties.getProducer().getSendMsgTimeout());
    }

    /**
     * 同步发送消息（自定义超时时间）
     *
     * @param topic   Topic 名称
     * @param message 消息对象
     * @param timeout 超时时间（毫秒）
     * @return 发送结果
     */
    public static SendResult send(String topic, Object message, int timeout) {
        checkTemplateAvailable();

        // 自动创建 Topic（如果启用）
        if (properties.getProducer().getAutoCreateTopic()) {
            autoCreateTopic(topic);
        }

        return doSyncSend(() -> rocketMQTemplate.syncSend(topic, message, timeout),
                         topic, "同步发送");
    }

    // ==================== 异步发送 ====================

    /**
     * 异步发送消息（完整回调）
     * <p>不阻塞主线程，通过回调通知发送结果</p>
     *
     * @param topic    Topic 名称
     * @param message  消息对象
     * @param callback 回调接口
     */
    public static void sendAsync(String topic, Object message, SendCallback callback) {
        sendAsync(topic, message, callback, properties.getProducer().getSendMsgTimeout());
    }

    /**
     * 异步发送消息（简化回调，仅处理成功）
     *
     * @param topic           Topic 名称
     * @param message         消息对象
     * @param successCallback 成功回调
     */
    public static void sendAsync(String topic, Object message,
                                 Consumer<SendResult> successCallback) {
        sendAsync(topic, message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                successCallback.accept(sendResult);
            }

            @Override
            public void onException(Throwable e) {
                log.error("❌ 异步消息发送失败: topic={}", topic, e);
            }
        });
    }

    // ==================== 单向发送 ====================

    /**
     * 单向发送消息（不等待响应）
     * <p>性能最高但不保证可靠性，适合日志、监控等不重要消息</p>
     *
     * @param topic   Topic 名称
     * @param message 消息对象
     */
    public static void sendOneWay(String topic, Object message) {
        checkTemplateAvailable();

        if (properties.getProducer().getAutoCreateTopic()) {
            autoCreateTopic(topic);
        }

        if (properties.getProducer().getEnableLog()) {
            log.info("📤 单向发送消息: topic={}, message={}", topic, message);
        }

        rocketMQTemplate.sendOneWay(topic, message);
    }

    // ==================== 延迟消息 ====================

    /**
     * 发送延迟消息
     * <p>RocketMQ 支持 18 个固定延迟级别</p>
     *
     * @param topic      Topic 名称
     * @param message    消息对象
     * @param delayLevel 延迟级别枚举
     * @return 发送结果
     */
    public static SendResult sendDelay(String topic, Object message, DelayLevel delayLevel) {
        return sendDelay(topic, message, delayLevel.getLevel());
    }

    // ==================== 带标签消息 ====================

    /**
     * 发送带标签的消息
     * <p>消费者可以通过标签过滤消息</p>
     *
     * @param topic   Topic 名称
     * @param tag     消息标签
     * @param message 消息对象
     * @return 发送结果
     */
    public static SendResult sendWithTag(String topic, String tag, Object message) {
        return sendWithTag(topic, tag, message,
                          properties.getProducer().getSendMsgTimeout());
    }

    // ==================== 批量发送 ====================

    /**
     * 批量发送消息
     *
     * @param topic    Topic 名称
     * @param messages 消息集合
     */
    public static void sendBatch(String topic, Collection<?> messages) {
        checkTemplateAvailable();

        if (messages == null || messages.isEmpty()) {
            log.warn("⚠️ 批量发送消息为空，跳过发送");
            return;
        }

        if (properties.getProducer().getAutoCreateTopic()) {
            autoCreateTopic(topic);
        }

        if (properties.getProducer().getEnableLog()) {
            log.info("📤 批量发送消息: topic={}, count={}", topic, messages.size());
        }

        // 分批发送
        int batchSize = properties.getProducer().getBatchSize();
        int count = 0;

        for (Object message : messages) {
            rocketMQTemplate.sendOneWay(topic, message);
            count++;

            if (count % batchSize == 0 && properties.getProducer().getEnableLog()) {
                log.info("   已发送 {} / {} 条消息", count, messages.size());
            }
        }

        if (properties.getProducer().getEnableLog()) {
            log.info("✅ 批量发送完成: 共发送 {} 条消息", messages.size());
        }
    }

    // ==================== 事务消息 ====================

    /**
     * 发送事务消息
     * <p>事务消息需要配合 @RocketMQTransactionListener 使用</p>
     *
     * @param topic   Topic 名称
     * @param message 消息对象
     */
    public static void sendTransaction(String topic, Object message) {
        String transactionId = String.valueOf(System.currentTimeMillis());
        sendTransaction(topic, message, transactionId, null);
    }

    // ==================== 私有辅助方法 ====================

    private static void checkTemplateAvailable() {
        if (rocketMQTemplate == null) {
            throw new IllegalStateException(
                "RocketMQTemplate 未初始化，请检查：\n" +
                "1. rocketmq.enabled 是否设置为 true\n" +
                "2. rocketmq-spring-boot-starter 依赖是否已引入\n" +
                "3. Spring 容器是否已启动"
            );
        }
    }

    private static void autoCreateTopic(String topic) {
        try {
            String topicName = topic.contains(":") ? topic.split(":")[0] : topic;
            RMTopicUtil.createTopic(topicName);
        } catch (Exception e) {
            log.warn("⚠️ 自动创建Topic失败: {}, 错误: {}", topic, e.getMessage());
        }
    }
}
```

参考: `ruoyi-common/ruoyi-common-rocketmq/src/main/java/plus/ruoyi/common/rocketmq/util/RMSendUtil.java:1-544`

**2. 同步发送示例**

```java
/**
 * 同步发送消息
 * 适用于重要消息,需要确认发送结果
 */
public class OrderService {

    /**
     * 创建订单后发送消息
     */
    public void createOrder(Order order) {
        // 1. 保存订单
        orderMapper.insert(order);

        // 2. 同步发送消息
        SendResult result = RMSendUtil.send("order-topic", order);

        // 3. 检查发送结果
        if (result.getSendStatus() == SendStatus.SEND_OK) {
            log.info("订单消息发送成功: msgId={}", result.getMsgId());
        } else {
            log.error("订单消息发送失败");
            // 处理发送失败情况
        }
    }
}
```

**3. 异步发送示例**

```java
/**
 * 异步发送消息
 * 适用于不需要立即确认结果的场景
 */
public class NotificationService {

    /**
     * 发送通知消息
     */
    public void sendNotification(Notification notification) {
        // 异步发送,不阻塞主流程
        RMSendUtil.sendAsync("notification-topic", notification, result -> {
            // 成功回调
            log.info("通知消息发送成功: msgId={}", result.getMsgId());
        });

        // 立即返回,不等待发送结果
    }
}
```

**4. 延迟消息示例**

```java
/**
 * 延迟消息示例
 * 用于订单超时取消等场景
 */
public class OrderTimeoutService {

    /**
     * 发送订单超时检查消息
     * 30分钟后检查订单是否支付
     */
    public void scheduleOrderTimeout(Long orderId) {
        OrderTimeoutMessage message = new OrderTimeoutMessage();
        message.setOrderId(orderId);
        message.setCreateTime(System.currentTimeMillis());

        // 发送延迟消息: 30分钟后消费
        SendResult result = RMSendUtil.sendDelay(
            "order-timeout-topic",
            message,
            DelayLevel.THIRTY_MINUTES  // 延迟级别
        );

        log.info("订单超时检查消息已发送: orderId={}, msgId={}",
                 orderId, result.getMsgId());
    }
}
```

**5. 带标签消息示例**

```java
/**
 * 带标签消息
 * 消费者可以根据标签过滤消息
 */
public class UserService {

    /**
     * 发送用户注册消息
     */
    public void registerUser(User user) {
        // 根据用户类型设置标签
        String tag = user.getUserType();  // VIP, NORMAL等

        // 发送带标签的消息
        RMSendUtil.sendWithTag("user-register-topic", tag, user);
    }
}
```

### 消费者

**1. @RocketMQMessageListener注解**

使用`@RocketMQMessageListener`注解创建消费者:

```java
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.stereotype.Component;

/**
 * 订单消息消费者
 */
@Component
@RocketMQMessageListener(
    topic = "order-topic",              // Topic名称
    consumerGroup = "order-consumer",   // 消费者组
    selectorExpression = "*"            // Tag过滤表达式, *表示接收所有
)
public class OrderMessageListener implements RocketMQListener<Order> {

    /**
     * 消费消息
     *
     * @param order 订单对象
     */
    @Override
    public void onMessage(Order order) {
        try {
            log.info("收到订单消息: orderId={}", order.getOrderId());

            // 处理业务逻辑
            // 1. 更新库存
            // 2. 发送通知
            // 3. 记录日志
            processOrder(order);

            log.info("订单消息处理成功: orderId={}", order.getOrderId());

        } catch (Exception e) {
            log.error("订单消息处理失败: orderId={}", order.getOrderId(), e);
            // 抛出异常会触发重试
            throw e;
        }
    }

    private void processOrder(Order order) {
        // 业务处理逻辑
    }
}
```

**2. Tag过滤消费**

```java
/**
 * VIP用户注册消息消费者
 * 只消费tag=VIP的消息
 */
@Component
@RocketMQMessageListener(
    topic = "user-register-topic",
    consumerGroup = "vip-user-consumer",
    selectorExpression = "VIP"  // 只消费VIP标签的消息
)
public class VipUserListener implements RocketMQListener<User> {

    @Override
    public void onMessage(User user) {
        log.info("VIP用户注册: userId={}", user.getUserId());
        // VIP用户专属处理逻辑
    }
}

/**
 * 普通用户注册消息消费者
 * 只消费tag=NORMAL的消息
 */
@Component
@RocketMQMessageListener(
    topic = "user-register-topic",
    consumerGroup = "normal-user-consumer",
    selectorExpression = "NORMAL"  // 只消费NORMAL标签的消息
)
public class NormalUserListener implements RocketMQListener<User> {

    @Override
    public void onMessage(User user) {
        log.info("普通用户注册: userId={}", user.getUserId());
        // 普通用户处理逻辑
    }
}
```

**3. 并发消费**

```java
/**
 * 并发消费示例
 */
@Component
@RocketMQMessageListener(
    topic = "log-topic",
    consumerGroup = "log-consumer",
    consumeMode = ConsumeMode.CONCURRENTLY,  // 并发消费模式
    consumeThreadMax = 64  // 最大消费线程数
)
public class LogMessageListener implements RocketMQListener<String> {

    @Override
    public void onMessage(String logMessage) {
        // 多线程并发消费,提升吞吐量
        processLog(logMessage);
    }
}
```

**4. 顺序消费**

```java
/**
 * 顺序消费示例
 * 保证同一订单的消息按顺序消费
 */
@Component
@RocketMQMessageListener(
    topic = "order-status-topic",
    consumerGroup = "order-status-consumer",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费模式
)
public class OrderStatusListener implements RocketMQListener<OrderStatus> {

    @Override
    public void onMessage(OrderStatus status) {
        // 同一订单的状态变更消息会按顺序消费
        // 创建 -> 支付 -> 发货 -> 完成
        updateOrderStatus(status);
    }
}
```

### 消息队列最佳实践

**1. 消息幂等性**

```java
/**
 * 保证消息幂等性
 * 防止重复消费
 */
@Component
@RocketMQMessageListener(
    topic = "payment-topic",
    consumerGroup = "payment-consumer"
)
public class PaymentListener implements RocketMQListener<PaymentMessage> {

    @Override
    public void onMessage(PaymentMessage message) {
        String messageId = message.getMessageId();

        // 1. 检查消息是否已经处理过
        if (RedisUtils.hasKey("payment:processed:" + messageId)) {
            log.warn("消息已处理,跳过: messageId={}", messageId);
            return;
        }

        try {
            // 2. 处理支付逻辑
            processPayment(message);

            // 3. 标记消息已处理(设置过期时间24小时)
            RedisUtils.setCacheObject(
                "payment:processed:" + messageId,
                true,
                Duration.ofHours(24)
            );

        } catch (Exception e) {
            log.error("支付处理失败: messageId={}", messageId, e);
            throw e;
        }
    }
}
```

**2. 消息重试策略**

```java
/**
 * 消息重试策略
 */
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    maxReconsumeTimes = 3  // 最大重试次数
)
public class OrderListener implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        try {
            // 处理订单
            processOrder(order);

        } catch (BusinessException e) {
            // 业务异常,不重试,记录日志
            log.error("业务处理失败: orderId={}, reason={}",
                     order.getOrderId(), e.getMessage());
            // 不抛出异常,消息不会重试

        } catch (Exception e) {
            // 系统异常,重试
            log.error("系统异常: orderId={}", order.getOrderId(), e);
            // 抛出异常,触发重试
            throw e;
        }
    }
}
```

**3. 消息积压处理**

```java
/**
 * 动态调整消费线程数处理积压
 */
@Component
@RocketMQMessageListener(
    topic = "high-traffic-topic",
    consumerGroup = "high-traffic-consumer",
    consumeThreadMin = 20,   // 最小线程数
    consumeThreadMax = 64    // 最大线程数
)
public class HighTrafficListener implements RocketMQListener<Message> {

    @Override
    public void onMessage(Message message) {
        // 快速处理,避免积压
        processMessage(message);
    }
}
```

---

## 任务调度

### 架构设计

项目集成了**SnailJob**分布式任务调度框架,支持定时任务的统一管理和执行。

```
┌─────────────────────────────────────────────────────────────┐
│                   SnailJob 任务调度架构                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            SnailJob 调度中心(Server)                  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  任务管理  │  调度管理  │  日志收集  │  监控告警 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│          ┌──────────┼──────────┐                             │
│          │          │          │                             │
│     ┌────▼────┐┌────▼────┐┌───▼─────┐                       │
│     │ Client1 ││ Client2 ││ Client3 │                       │
│     │ (节点1) ││ (节点2) ││ (节点3) │                       │
│     └─────────┘└─────────┘└─────────┘                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              任务执行流程                             │   │
│  │  1. Server: 触发任务调度                             │   │
│  │  2. Client: 接收任务,执行@Scheduled方法              │   │
│  │  3. Client: 上报执行结果和日志                       │   │
│  │  4. Server: 记录执行日志,监控任务状态                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 配置方式

**1. SnailJob配置**

在`application.yml`中配置SnailJob:

```yaml
################## 定时任务配置 ##################
--- # snail-job 配置
snail-job:
  # 是否启用定时任务
  enabled: ${SNAIL_JOB_ENABLED:false}
  # 需要在 SnailJob 后台组管理创建对应名称的组
  group: ${app.id}
  # SnailJob 接入验证令牌 详见 script/sql/ry_job.sql `sj_group_config`表
  token: ${SNAIL_JOB_TOKEN:SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT}
  server:
    # 调度中心地址
    host: ${SNAIL_JOB_HOST:127.0.0.1}
    # 调度中心端口
    port: ${SNAIL_JOB_PORT:17888}
  # 命名空间UUID 详见 script/sql/ry_job.sql `sj_namespace`表`unique_id`字段
  namespace: ${spring.profiles.active}
  # 随主应用端口漂移
  port: 2${server.port}
  # 客户端ip指定
  host: ${SNAIL_JOB_CLIENT_HOST:}
  # RPC类型: netty, grpc
  rpc-type: grpc
```

参考: `ruoyi-admin/src/main/resources/application-dev.yml:142-162`

**2. 自动配置类**

```java
package plus.ruoyi.common.job.config;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import com.aizuda.snailjob.client.common.appender.SnailLogbackAppender;
import com.aizuda.snailjob.client.common.event.SnailClientStartingEvent;
import com.aizuda.snailjob.client.starter.EnableSnailJob;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * SnailJob 定时任务自动配置类
 * <p>
 * 集成 SnailJob 分布式任务调度框架，提供以下功能：
 * <ul>
 * <li>启用 Spring 定时任务支持</li>
 * <li>启用 SnailJob 客户端</li>
 * <li>配置日志收集器，用于任务执行日志的统一管理</li>
 * </ul>
 * <p>
 * 配置启用条件：需要在配置文件中设置 snail-job.enabled=true
 *
 * @author opensnail
 * @date 2024-05-17
 */
@AutoConfiguration
@ConditionalOnProperty(prefix = "snail-job", name = "enabled", havingValue = "true")
@EnableScheduling  // 启用Spring定时任务
@EnableSnailJob    // 启用SnailJob客户端
public class JobAutoConfiguration {

    /**
     * SnailJob 客户端启动事件监听器
     * <p>
     * 在 SnailJob 客户端启动时自动配置日志收集器，
     * 将应用的日志输出发送到 SnailJob 服务端进行统一管理和查看
     *
     * @param event SnailJob 客户端启动事件
     */
    @EventListener(SnailClientStartingEvent.class)
    public void onStarting(SnailClientStartingEvent event) {
        // 获取 Logback 日志上下文
        LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();

        // 创建 SnailJob 专用的日志追加器
        SnailLogbackAppender<ILoggingEvent> ca = new SnailLogbackAppender<>();
        ca.setName("snail_log_appender");
        ca.start();

        // 将日志追加器添加到根日志记录器，实现日志统一收集
        Logger rootLogger = lc.getLogger(Logger.ROOT_LOGGER_NAME);
        rootLogger.addAppender(ca);
    }

}
```

参考: `ruoyi-common/ruoyi-common-job/src/main/java/plus/ruoyi/common/job/config/JobAutoConfiguration.java:1-60`

### 定时任务使用

**1. 创建定时任务**

使用Spring的`@Scheduled`注解创建定时任务:

```java
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 系统数据统计任务
 */
@Component
public class DataStatisticsJob {

    /**
     * 每小时统计一次用户数据
     * Cron表达式: 0 0 * * * ? (每小时的0分0秒执行)
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void statisticsUserData() {
        log.info("开始统计用户数据...");

        try {
            // 1. 统计活跃用户数
            // 2. 统计新增用户数
            // 3. 统计用户留存率
            doStatistics();

            log.info("用户数据统计完成");

        } catch (Exception e) {
            log.error("用户数据统计失败", e);
        }
    }

    /**
     * 每天凌晨2点清理过期数据
     * Cron表达式: 0 0 2 * * ? (每天凌晨2点执行)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredData() {
        log.info("开始清理过期数据...");

        try {
            // 1. 清理过期日志
            // 2. 清理过期文件
            // 3. 清理过期会话
            cleanData();

            log.info("过期数据清理完成");

        } catch (Exception e) {
            log.error("过期数据清理失败", e);
        }
    }

    /**
     * 每5分钟检查一次订单超时
     * fixedDelay: 上次执行完成后5分钟再执行
     */
    @Scheduled(fixedDelay = 300000)  // 5分钟 = 300000毫秒
    public void checkOrderTimeout() {
        log.info("开始检查订单超时...");

        try {
            // 1. 查询未支付订单
            // 2. 检查是否超时
            // 3. 取消超时订单
            checkTimeout();

            log.info("订单超时检查完成");

        } catch (Exception e) {
            log.error("订单超时检查失败", e);
        }
    }
}
```

**2. Cron表达式说明**

```
Cron表达式格式: 秒 分 时 日 月 周 [年]

常用示例:
- 每天凌晨2点:        0 0 2 * * ?
- 每小时整点:          0 0 * * * ?
- 每30分钟:           0 */30 * * * ?
- 每天中午12点:        0 0 12 * * ?
- 每周一上午9点:       0 0 9 ? * MON
- 每月1号凌晨1点:      0 0 1 1 * ?
- 每季度第一天:        0 0 0 1 1,4,7,10 ?
```

**3. SnailJob后台管理**

在SnailJob后台可以:

- **任务管理**: 启动/停止/暂停任务
- **执行记录**: 查看任务执行历史
- **日志查看**: 实时查看任务执行日志
- **告警配置**: 配置任务失败告警
- **手动触发**: 手动执行定时任务

### 分布式任务调度特性

**1. 任务分片**

```java
/**
 * 任务分片示例
 * 将大任务拆分到多个节点并行执行
 */
@Component
public class DataProcessJob {

    @Scheduled(cron = "0 0 1 * * ?")
    public void processData() {
        // SnailJob会自动分配分片参数
        // 例如: 总分片数=10, 当前分片=0
        int shardingTotal = getShardingTotal();
        int shardingIndex = getShardingIndex();

        log.info("开始处理数据: 分片={}/{}", shardingIndex, shardingTotal);

        // 根据分片参数处理数据
        // 例如: 节点1处理userId % 10 = 0的数据
        //       节点2处理userId % 10 = 1的数据
        List<User> users = userMapper.selectBySharding(shardingIndex, shardingTotal);

        for (User user : users) {
            processUser(user);
        }

        log.info("数据处理完成: 分片={}/{}", shardingIndex, shardingTotal);
    }
}
```

**2. 任务故障转移**

```java
/**
 * 任务故障转移
 * 某个节点宕机后,任务会自动转移到其他节点执行
 */
@Component
public class ImportantJob {

    @Scheduled(cron = "0 */10 * * * ?")
    public void execute() {
        log.info("节点 {} 开始执行任务", getNodeId());

        try {
            // 执行重要任务
            executeImportantTask();

        } catch (Exception e) {
            log.error("任务执行失败", e);
            // 如果节点宕机,SnailJob会将任务转移到其他节点
        }
    }
}
```

**3. 任务依赖**

```java
/**
 * 任务依赖关系
 * 在SnailJob后台配置任务依赖
 */
@Component
public class DependentJobs {

    /**
     * 任务A: 数据同步
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void syncData() {
        log.info("开始同步数据...");
        // 同步数据
    }

    /**
     * 任务B: 数据统计
     * 依赖任务A完成后执行
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void statisticsData() {
        log.info("开始统计数据...");
        // 统计数据
    }

    /**
     * 任务C: 生成报表
     * 依赖任务B完成后执行
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void generateReport() {
        log.info("开始生成报表...");
        // 生成报表
    }
}
```

---

## 分布式事务

### 本地事务

**1. @Transactional注解**

```java
import org.springframework.transaction.annotation.Transactional;

/**
 * 本地事务示例
 */
@Service
public class OrderService {

    /**
     * 创建订单
     * 使用Spring事务管理
     */
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(Order order) {
        // 1. 保存订单
        orderMapper.insert(order);

        // 2. 扣减库存
        inventoryMapper.deduct(order.getProductId(), order.getQuantity());

        // 3. 增加积分
        pointsMapper.add(order.getUserId(), order.getAmount());

        // 如果任何步骤失败,所有操作都会回滚
    }
}
```

**2. 事务传播行为**

```java
/**
 * 事务传播行为示例
 */
@Service
public class UserService {

    /**
     * REQUIRED: 加入当前事务,如果没有则新建
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {
        // 加入外层事务
    }

    /**
     * REQUIRES_NEW: 总是新建事务
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // 独立事务,不受外层事务影响
    }

    /**
     * NESTED: 嵌套事务
     */
    @Transactional(propagation = Propagation.NESTED)
    public void method3() {
        // 嵌套事务,可以独立回滚
    }
}
```

### 跨数据源事务

**1. @DSTransactional注解**

```java
import com.baomidou.dynamic.datasource.annotation.DSTransactional;

/**
 * 跨数据源事务示例
 * 支持多数据源之间的事务
 */
@Service
public class DataSyncService {

    /**
     * 同步数据到多个数据源
     */
    @DSTransactional  // 跨数据源事务
    public void syncData(Data data) {
        // 1. 保存到主库
        saveTurbo(data);

        // 2. 同步到其他数据源
        syncToOracle(data);
        syncToPostgres(data);

        // 如果任何步骤失败,所有数据源的操作都会回滚
    }

    @DS("master")
    private void saveToMaster(Data data) {
        dataMapper.insert(data);
    }

    @DS("oracle")
    private void syncToOracle(Data data) {
        oracleMapper.insert(data);
    }

    @DS("postgres")
    private void syncToPostgres(Data data) {
        postgresMapper.insert(data);
    }
}
```

参考: `ruoyi-modules/ruoyi-generator/src/main/java/plus/ruoyi/generator/service/GenTableServiceImpl.java:289-323`

### 最终一致性

对于跨系统的分布式事务,推荐使用消息队列实现最终一致性:

```java
/**
 * 基于消息队列的最终一致性
 */
@Service
public class OrderService {

    /**
     * 创建订单
     */
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(Order order) {
        // 1. 本地事务: 保存订单
        orderMapper.insert(order);

        // 2. 发送消息(本地事务提交后)
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    // 事务提交后发送消息
                    RMSendUtil.send("order-created-topic", order);
                }
            }
        );
    }
}

/**
 * 库存服务消费消息
 */
@Component
@RocketMQMessageListener(topic = "order-created-topic",
                         consumerGroup = "inventory-consumer")
public class InventoryListener implements RocketMQListener<Order> {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void onMessage(Order order) {
        // 3. 本地事务: 扣减库存
        inventoryMapper.deduct(order.getProductId(), order.getQuantity());

        // 如果扣减失败,消息会重试,保证最终一致性
    }
}
```

---

## 服务容错

### 限流

**1. 基于Redis的限流**

```java
/**
 * 基于Redis的限流
 * 使用令牌桶算法
 */
public class RateLimitService {

    /**
     * 限流: 每秒最多10个请求
     */
    public boolean tryAcquire(String key) {
        // 令牌桶算法
        // rate: 每秒生成的令牌数
        // rateInterval: 时间间隔(秒)
        long permits = RedisUtils.rateLimiter(
            "rate:limit:" + key,
            RateType.OVERALL,  // 全局限流
            10,                // 每秒10个令牌
            1                  // 1秒
        );

        return permits >= 0;  // >= 0表示获取成功
    }

    /**
     * API接口限流
     */
    public void apiRequest(String apiKey) {
        if (!tryAcquire(apiKey)) {
            throw new ServiceException("请求过于频繁,请稍后再试");
        }

        // 执行业务逻辑
        processApi(apiKey);
    }
}
```

参考: `ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/utils/RedisUtils.java:587-602`

**2. @RateLimiter注解限流**

```java
import plus.ruoyi.common.ratelimiter.annotation.RateLimiter;

/**
 * 注解式限流
 */
@RestController
@RequestMapping("/api")
public class ApiController {

    /**
     * 登录接口限流
     * 每个IP每分钟最多5次请求
     */
    @RateLimiter(key = "#request.remoteAddr",
                 time = 60,
                 count = 5,
                 limitType = LimitType.IP)
    @PostMapping("/login")
    public R<LoginVo> login(@RequestBody LoginBo loginBo, HttpServletRequest request) {
        // 登录逻辑
        return R.ok(loginVo);
    }

    /**
     * 发送短信限流
     * 每个用户每天最多10次
     */
    @RateLimiter(key = "#phone",
                 time = 86400,  // 24小时
                 count = 10,
                 limitType = LimitType.DEFAULT)
    @PostMapping("/sms/send")
    public R<Void> sendSms(@RequestParam String phone) {
        // 发送短信
        return R.ok();
    }
}
```

### 降级

```java
/**
 * 服务降级示例
 */
@Service
public class ProductService {

    /**
     * 查询商品详情
     * 失败时返回降级数据
     */
    public Product getProductDetail(Long productId) {
        try {
            // 尝试从数据库查询
            return productMapper.selectById(productId);

        } catch (Exception e) {
            log.error("查询商品详情失败,返回降级数据: productId={}", productId, e);

            // 返回降级数据(缓存或默认数据)
            return getProductFromCache(productId);
        }
    }

    /**
     * 从缓存获取降级数据
     */
    private Product getProductFromCache(Long productId) {
        Product product = RedisUtils.getCacheObject("product:" + productId);
        if (product == null) {
            // 返回默认数据
            product = new Product();
            product.setProductId(productId);
            product.setProductName("商品暂时无法查看");
        }
        return product;
    }
}
```

### 熔断

```java
/**
 * 熔断器示例
 */
@Service
public class PaymentService {

    private AtomicInteger failureCount = new AtomicInteger(0);
    private AtomicBoolean circuitOpen = new AtomicBoolean(false);
    private long circuitOpenTime = 0;

    private static final int FAILURE_THRESHOLD = 5;  // 失败阈值
    private static final long TIMEOUT = 60000;       // 熔断器打开时间60秒

    /**
     * 调用第三方支付
     */
    public PaymentResult callPayment(PaymentRequest request) {
        // 1. 检查熔断器状态
        if (circuitOpen.get()) {
            // 熔断器打开,检查是否可以半开
            if (System.currentTimeMillis() - circuitOpenTime > TIMEOUT) {
                // 尝试半开状态
                circuitOpen.set(false);
                failureCount.set(0);
            } else {
                // 熔断器仍然打开,快速失败
                throw new ServiceException("支付服务暂时不可用,请稍后再试");
            }
        }

        try {
            // 2. 调用第三方支付
            PaymentResult result = thirdPartyPayment(request);

            // 3. 成功,重置计数器
            failureCount.set(0);
            return result;

        } catch (Exception e) {
            // 4. 失败,增加计数
            int failures = failureCount.incrementAndGet();

            if (failures >= FAILURE_THRESHOLD) {
                // 5. 达到阈值,打开熔断器
                circuitOpen.set(true);
                circuitOpenTime = System.currentTimeMillis();
                log.error("支付服务熔断器打开: 连续失败{}次", failures);
            }

            throw new ServiceException("支付失败", e);
        }
    }
}
```

---

## 最佳实践

### 1. 数据源使用原则

```java
// ✅ 推荐: 明确指定数据源
@DS("slave")
public List<User> queryUsers() {
    return userMapper.selectList(null);
}

// ❌ 不推荐: 依赖默认数据源
public List<User> queryUsers() {
    // 不明确,容易出错
    return userMapper.selectList(null);
}
```

### 2. 分布式锁使用原则

```java
// ✅ 推荐: 锁粒度细,超时时间合理
@Lock4j(keys = "#userId", expire = 30000, acquireTimeout = 10000)
public void updateUser(Long userId) {
    // 只锁定当前用户
}

// ❌ 不推荐: 锁粒度粗,没有超时
@Lock4j
public void updateUser(Long userId) {
    // 锁定整个方法,粒度太粗
}
```

### 3. 消息队列使用原则

```java
// ✅ 推荐: 保证幂等性
@Override
public void onMessage(Order order) {
    String messageId = order.getMessageId();
    if (RedisUtils.hasKey("processed:" + messageId)) {
        return;  // 已处理,跳过
    }
    processOrder(order);
    RedisUtils.setCacheObject("processed:" + messageId, true, Duration.ofHours(24));
}

// ❌ 不推荐: 没有幂等性保护
@Override
public void onMessage(Order order) {
    processOrder(order);  // 可能重复消费
}
```

### 4. 任务调度使用原则

```java
// ✅ 推荐: 任务执行时间合理,有异常处理
@Scheduled(cron = "0 0 2 * * ?")
public void cleanData() {
    try {
        doClean();
    } catch (Exception e) {
        log.error("清理数据失败", e);
        // 发送告警
    }
}

// ❌ 不推荐: 任务执行时间长,没有异常处理
@Scheduled(fixedDelay = 1000)  // 每秒执行
public void heavyTask() {
    // 执行耗时任务,可能导致任务堆积
}
```

---

## 常见问题

### 1. 读写分离主从延迟问题

**问题**: 主库写入后立即从从库读取,读不到最新数据

**原因**: 主从数据库存在同步延迟

**解决方案**:

```java
/**
 * 方案1: 强制读主库
 */
@DS("master")
public User getUserAfterSave(Long userId) {
    // 强制从主库读取
    return userMapper.selectById(userId);
}

/**
 * 方案2: 延迟读取
 */
public User getUserWithDelay(Long userId) {
    // 等待主从同步
    Thread.sleep(100);
    return userMapper.selectById(userId);
}

/**
 * 方案3: 使用缓存
 */
public void saveUser(User user) {
    // 1. 保存到主库
    userMapper.insert(user);

    // 2. 同步写入缓存
    RedisUtils.setCacheObject("user:" + user.getUserId(), user);
}
```

### 2. 分布式锁死锁问题

**问题**: 多个线程相互等待锁,导致死锁

**原因**: 加锁顺序不一致

**解决方案**:

```java
/**
 * 解决方案: 按固定顺序加锁
 */
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // 按ID大小排序,保证加锁顺序一致
    Long first = fromId < toId ? fromId : toId;
    Long second = fromId < toId ? toId : fromId;

    RLock lock1 = RedisUtils.getLock("account:" + first);
    RLock lock2 = RedisUtils.getLock("account:" + second);

    try {
        lock1.lock(30, TimeUnit.SECONDS);
        lock2.lock(30, TimeUnit.SECONDS);

        // 转账逻辑

    } finally {
        lock2.unlock();
        lock1.unlock();
    }
}
```

### 3. 消息重复消费问题

**问题**: 消息被重复消费,导致数据重复

**原因**: 网络抖动、消费失败重试等

**解决方案**:

```java
/**
 * 解决方案: 幂等性处理
 */
@Override
public void onMessage(PaymentMessage message) {
    String messageId = message.getMessageId();

    // 1. 使用分布式锁+缓存保证幂等
    String lockKey = "payment:lock:" + messageId;
    RLock lock = RedisUtils.getLock(lockKey);

    try {
        if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
            // 2. 检查是否已处理
            if (RedisUtils.hasKey("payment:processed:" + messageId)) {
                return;
            }

            // 3. 处理支付
            processPayment(message);

            // 4. 标记已处理
            RedisUtils.setCacheObject(
                "payment:processed:" + messageId,
                true,
                Duration.ofDays(1)
            );
        }
    } finally {
        lock.unlock();
    }
}
```

### 4. 任务重复执行问题

**问题**: 多个节点同时执行同一个定时任务

**原因**: 每个节点都会执行@Scheduled任务

**解决方案**:

```java
/**
 * 解决方案: 使用分布式锁
 */
@Component
public class ScheduledTask {

    @Scheduled(cron = "0 0 1 * * ?")
    public void execute() {
        String lockKey = "scheduled:task:daily";
        RLock lock = RedisUtils.getLock(lockKey);

        try {
            // 尝试获取锁,只有一个节点能获取成功
            if (lock.tryLock(0, 3600, TimeUnit.SECONDS)) {
                try {
                    // 执行任务
                    executeTask();
                } finally {
                    lock.unlock();
                }
            } else {
                log.info("任务正在其他节点执行,跳过");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 5. RocketMQ消息积压问题

**问题**: 消费速度慢,消息大量积压

**原因**: 消费线程数不足,业务处理慢

**解决方案**:

```java
/**
 * 解决方案1: 增加消费线程数
 */
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    consumeThreadMin = 20,    // 增加最小线程数
    consumeThreadMax = 64     // 增加最大线程数
)
public class OrderListener implements RocketMQListener<Order> {
    @Override
    public void onMessage(Order order) {
        // 快速处理
    }
}

/**
 * 解决方案2: 异步处理
 */
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer"
)
public class OrderListener implements RocketMQListener<Order> {

    @Async  // 异步处理
    @Override
    public void onMessage(Order order) {
        // 耗时处理放到线程池
        processOrder(order);
    }
}
```

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-10
**维护者**: RuoYi-Plus-UniApp 开发团队
