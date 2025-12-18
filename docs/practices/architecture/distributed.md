# 分布式系统设计

## 介绍

RuoYi-Plus-UniApp采用**单体架构 + 分布式组件**的混合设计模式,在保持单体应用简洁性的同时,通过引入分布式组件来解决高并发、高可用等问题。

**核心特性:**

- **读写分离** - 基于Dynamic-Datasource实现主从数据库自动切换
- **分布式锁** - 支持Redisson和Lock4j两种分布式锁方案
- **消息队列** - 集成RocketMQ实现异步解耦和削峰填谷
- **任务调度** - 集成SnailJob实现分布式定时任务管理
- **多数据源** - 支持MySQL、Oracle、PostgreSQL、SQLServer多数据库
- **事务管理** - 支持分布式事务和跨数据源事务

## 读写分离

### 数据源配置

使用**Dynamic-Datasource**实现读写分离,在`application.yml`中配置主从数据源:

```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    dynamic:
      primary: master           # 默认数据源(写操作)
      strict: true              # 严格模式
      datasource:
        # 主库(读写)
        master:
          type: ${spring.datasource.type}
          driverClassName: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://${DB_HOST:127.0.0.1}:${DB_PORT:3306}/${DB_NAME:ryplus_uni}
          username: ${DB_USERNAME:root}
          password: ${DB_PASSWORD:root}
        # 从库(只读)
        slave:
          lazy: true
          type: ${spring.datasource.type}
          driverClassName: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://${DB_SLAVE_HOST:127.0.0.1}:${DB_SLAVE_PORT:3306}/${DB_SLAVE_NAME:ryplus_uni}
          username: ${DB_SLAVE_USERNAME:root}
          password: ${DB_SLAVE_PASSWORD:root}
      hikari:
        maxPoolSize: 20
        minIdle: 10
```

### @DS注解使用

```java
import com.baomidou.dynamic.datasource.annotation.DS;

@Service
public class GenTableServiceImpl implements IGenTableService {

    // 动态切换到指定数据源
    @DS("#genTable.dataName")
    @Override
    public PageResult<GenTable> pageDbTables(GenTable genTable, PageQuery pageQuery) {
        LinkedHashMap<String, Table<?>> tablesMap = ServiceProxy.metadata().tables();
        return PageResult.of(page);
    }

    // SpEL表达式支持参数动态切换
    @DS("#dataName")
    @Override
    public List<GenTableColumn> listDbTableColumnsByName(String tableName, String dataName) {
        Table<?> table = ServiceProxy.metadata().table(tableName);
        return tableColumns;
    }
}
```

**注解使用方式:**

| 使用方式 | 示例 | 说明 |
|---------|------|------|
| 类级别 | `@DS("slave")` | 整个类的方法使用该数据源 |
| 方法级别 | `@DS("master")` | 方法级别优先级高于类级别 |
| 参数值 | `@DS("#dataName")` | 根据参数值动态切换 |
| 对象属性 | `@DS("#user.tenantId")` | 根据对象属性动态切换 |

### 跨数据源事务

使用`@DSTransactional`注解支持跨数据源事务:

```java
import com.baomidou.dynamic.datasource.annotation.DSTransactional;

@DSTransactional  // 支持跨数据源事务
@Override
public void importGenTables(List<GenTable> tableList, String dataName) {
    for (GenTable table : tableList) {
        GenUtils.initTable(table);
        table.setDataName(dataName);

        boolean result = genTableDao.insert(table);
        if (result) {
            // 使用@DS切换数据源查询列信息
            List<GenTableColumn> columns =
                SpringUtils.getAopProxy(this)
                    .listDbTableColumnsByName(tableName, dataName);
            genTableColumnDao.batchSave(columns);
        }
    }
}
```

### 主从延迟处理

```java
// 方案1: 强制读主库
@DS("master")
public User getUserAfterSave(Long userId) {
    return userMapper.selectById(userId);
}

// 方案2: 使用缓存
public void saveUser(User user) {
    userMapper.insert(user);
    RedisUtils.setCacheObject("user:" + user.getUserId(), user);
}
```

## 分布式锁

### Redisson分布式锁

**RedisUtils工具类封装:**

```java
// 获取可重入锁
RLock lock = RedisUtils.getLock(lockKey);

// 获取公平锁
RLock fairLock = RedisUtils.getFairLock(lockKey);

// 获取读锁
RLock readLock = RedisUtils.getReadLock(lockKey);

// 获取写锁
RLock writeLock = RedisUtils.getWriteLock(lockKey);
```

**基本使用示例:**

```java
public void createOrder(Long userId, Long productId) {
    String lockKey = "order:create:" + userId + ":" + productId;
    RLock lock = RedisUtils.getLock(lockKey);

    try {
        // 尝试获取锁,最多等待10秒,锁自动释放时间30秒
        boolean acquired = lock.tryLock(10, 30, TimeUnit.SECONDS);

        if (acquired) {
            try {
                processOrder(userId, productId);
            } finally {
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
```

**读写锁示例:**

```java
// 读取配置(共享锁) - 多个线程可同时持有
public String getConfig(String key) {
    RLock readLock = RedisUtils.getReadLock("config:" + key);
    try {
        readLock.lock(10, TimeUnit.SECONDS);
        return configMapper.selectByKey(key);
    } finally {
        readLock.unlock();
    }
}

// 更新配置(独占锁) - 其他读写都会阻塞
public void updateConfig(String key, String value) {
    RLock writeLock = RedisUtils.getWriteLock("config:" + key);
    try {
        writeLock.lock(30, TimeUnit.SECONDS);
        configMapper.updateByKey(key, value);
        RedisUtils.deleteObject("cache:config:" + key);
    } finally {
        writeLock.unlock();
    }
}
```

### Lock4j注解锁

```java
import com.baomidou.lock.annotation.Lock4j;

@Service
public class SysLoginService {

    // 使用Lock4j防止并发绑定
    @Lock4j
    public void bindSocialAccount(AuthUser authUserData) {
        String authId = authUserData.getSource() + authUserData.getUuid();

        // 检查是否已绑定
        List<SysSocialVo> checkList = sysSocialService.listSocialsByAuthId(authId);
        if (CollUtil.isNotEmpty(checkList)) {
            throw ServiceException.of("此三方账号已经被绑定!");
        }

        // 执行绑定逻辑
        sysSocialService.add(bo);
    }
}
```

**Lock4j注解参数:**

```java
@Lock4j(
    name = "custom-lock",           // 锁名称
    keys = {"#userId", "#orderId"}, // 锁key(支持SpEL)
    expire = 30000,                 // 过期时间(毫秒)
    acquireTimeout = 10000,         // 获取超时(毫秒)
    lockType = Lock4jType.REENTRANT // 锁类型
)
```

### 分布式锁最佳实践

```java
// ✅ 推荐: 锁粒度细,超时时间合理
@Lock4j(keys = "#userId", expire = 30000, acquireTimeout = 10000)
public void updateUser(Long userId) { }

// ❌ 错误: 锁粒度太粗
@Lock4j
public void updateUser(Long userId) { }

// ✅ 避免死锁: 按ID顺序加锁
public void transfer(Long fromId, Long toId, BigDecimal amount) {
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

## 消息队列

### RocketMQ配置

```yaml
rocketmq:
  enabled: ${ROCKETMQ_ENABLED:false}
  name-server: ${ROCKETMQ_NAME_SERVER:127.0.0.1:9876}
  cluster-name: ${ROCKETMQ_CLUSTER_NAME:RuoYiCluster}
  broker-addr: ${ROCKETMQ_BROKER_ADDR:127.0.0.1:10911}

  producer:
    group: ${ROCKETMQ_PRODUCER_GROUP:ruoyi-producer-group-dev}
    send-message-timeout: 3000
    max-message-size: 4194304
    retry-times-when-send-failed: 2
    auto-create-topic: true

  consumer:
    consume-thread-min: 20
    consume-thread-max: 64
    pull-batch-size: 32
```

### 消息发送

**RMSendUtil工具类:**

| 方法 | 说明 | 适用场景 |
|------|------|---------|
| `send(topic, message)` | 同步发送 | 重要消息,需确认结果 |
| `sendAsync(topic, message, callback)` | 异步发送 | 不需立即确认 |
| `sendOneWay(topic, message)` | 单向发送 | 日志、监控等不重要消息 |
| `sendDelay(topic, message, delayLevel)` | 延迟消息 | 订单超时取消等 |
| `sendWithTag(topic, tag, message)` | 带标签消息 | 消费者按标签过滤 |
| `sendBatch(topic, messages)` | 批量发送 | 大量消息 |

**使用示例:**

```java
// 同步发送
SendResult result = RMSendUtil.send("order-topic", order);
if (result.getSendStatus() == SendStatus.SEND_OK) {
    log.info("订单消息发送成功: msgId={}", result.getMsgId());
}

// 异步发送
RMSendUtil.sendAsync("notification-topic", notification, result -> {
    log.info("通知消息发送成功: msgId={}", result.getMsgId());
});

// 延迟消息: 30分钟后消费
RMSendUtil.sendDelay("order-timeout-topic", message, DelayLevel.THIRTY_MINUTES);

// 带标签消息
RMSendUtil.sendWithTag("user-register-topic", "VIP", user);
```

### 消息消费

```java
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;

// 基础消费者
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    selectorExpression = "*"  // *表示接收所有
)
public class OrderMessageListener implements RocketMQListener<Order> {
    @Override
    public void onMessage(Order order) {
        log.info("收到订单消息: orderId={}", order.getOrderId());
        processOrder(order);
    }
}

// Tag过滤消费
@RocketMQMessageListener(
    topic = "user-register-topic",
    consumerGroup = "vip-user-consumer",
    selectorExpression = "VIP"  // 只消费VIP标签
)
public class VipUserListener implements RocketMQListener<User> { }

// 顺序消费
@RocketMQMessageListener(
    topic = "order-status-topic",
    consumerGroup = "order-status-consumer",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费模式
)
public class OrderStatusListener implements RocketMQListener<OrderStatus> { }
```

### 消息幂等性

```java
@Override
public void onMessage(PaymentMessage message) {
    String messageId = message.getMessageId();

    // 检查消息是否已处理过
    if (RedisUtils.hasKey("payment:processed:" + messageId)) {
        log.warn("消息已处理,跳过: messageId={}", messageId);
        return;
    }

    try {
        processPayment(message);
        // 标记消息已处理(24小时过期)
        RedisUtils.setCacheObject(
            "payment:processed:" + messageId,
            true,
            Duration.ofHours(24)
        );
    } catch (Exception e) {
        log.error("支付处理失败: messageId={}", messageId, e);
        throw e;  // 抛出异常触发重试
    }
}
```

## 任务调度

### SnailJob配置

```yaml
snail-job:
  enabled: ${SNAIL_JOB_ENABLED:false}
  group: ${app.id}
  token: ${SNAIL_JOB_TOKEN:SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT}
  server:
    host: ${SNAIL_JOB_HOST:127.0.0.1}
    port: ${SNAIL_JOB_PORT:17888}
  namespace: ${spring.profiles.active}
  port: 2${server.port}
  rpc-type: grpc
```

### 定时任务使用

```java
import org.springframework.scheduling.annotation.Scheduled;

@Component
public class DataStatisticsJob {

    // 每小时统计一次
    @Scheduled(cron = "0 0 * * * ?")
    public void statisticsUserData() {
        log.info("开始统计用户数据...");
        try {
            doStatistics();
            log.info("用户数据统计完成");
        } catch (Exception e) {
            log.error("用户数据统计失败", e);
        }
    }

    // 每天凌晨2点清理
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredData() {
        cleanData();
    }

    // 每5分钟检查(上次执行完成后)
    @Scheduled(fixedDelay = 300000)
    public void checkOrderTimeout() {
        checkTimeout();
    }
}
```

**常用Cron表达式:**

| 表达式 | 说明 |
|--------|------|
| `0 0 2 * * ?` | 每天凌晨2点 |
| `0 0 * * * ?` | 每小时整点 |
| `0 */30 * * * ?` | 每30分钟 |
| `0 0 9 ? * MON` | 每周一上午9点 |
| `0 0 1 1 * ?` | 每月1号凌晨1点 |

### 防止任务重复执行

```java
@Scheduled(cron = "0 0 1 * * ?")
public void execute() {
    String lockKey = "scheduled:task:daily";
    RLock lock = RedisUtils.getLock(lockKey);

    try {
        // 只有一个节点能获取成功
        if (lock.tryLock(0, 3600, TimeUnit.SECONDS)) {
            try {
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
```

## 分布式事务

### 本地事务

```java
@Transactional(rollbackFor = Exception.class)
public void createOrder(Order order) {
    orderMapper.insert(order);
    inventoryMapper.deduct(order.getProductId(), order.getQuantity());
    pointsMapper.add(order.getUserId(), order.getAmount());
    // 任何步骤失败,所有操作都会回滚
}
```

**事务传播行为:**

| 传播行为 | 说明 |
|---------|------|
| `REQUIRED` | 加入当前事务,如果没有则新建(默认) |
| `REQUIRES_NEW` | 总是新建事务,独立于外层事务 |
| `NESTED` | 嵌套事务,可以独立回滚 |

### 最终一致性

```java
// 生产者: 事务提交后发送消息
@Transactional(rollbackFor = Exception.class)
public void createOrder(Order order) {
    orderMapper.insert(order);

    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                RMSendUtil.send("order-created-topic", order);
            }
        }
    );
}

// 消费者: 扣减库存
@RocketMQMessageListener(topic = "order-created-topic", consumerGroup = "inventory-consumer")
public class InventoryListener implements RocketMQListener<Order> {
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void onMessage(Order order) {
        inventoryMapper.deduct(order.getProductId(), order.getQuantity());
        // 失败会重试,保证最终一致性
    }
}
```

## 服务容错

### 限流

```java
// 基于Redis的限流
public boolean tryAcquire(String key) {
    long permits = RedisUtils.rateLimiter(
        "rate:limit:" + key,
        RateType.OVERALL,
        10,  // 每秒10个令牌
        1    // 1秒
    );
    return permits >= 0;
}

// 注解式限流
@RateLimiter(key = "#request.remoteAddr", time = 60, count = 5, limitType = LimitType.IP)
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBo loginBo, HttpServletRequest request) {
    return R.ok(loginVo);
}
```

### 降级

```java
public Product getProductDetail(Long productId) {
    try {
        return productMapper.selectById(productId);
    } catch (Exception e) {
        log.error("查询商品详情失败,返回降级数据", e);
        // 返回缓存或默认数据
        Product product = RedisUtils.getCacheObject("product:" + productId);
        if (product == null) {
            product = new Product();
            product.setProductName("商品暂时无法查看");
        }
        return product;
    }
}
```

### 熔断

```java
private AtomicInteger failureCount = new AtomicInteger(0);
private AtomicBoolean circuitOpen = new AtomicBoolean(false);
private static final int FAILURE_THRESHOLD = 5;
private static final long TIMEOUT = 60000;

public PaymentResult callPayment(PaymentRequest request) {
    // 检查熔断器状态
    if (circuitOpen.get()) {
        if (System.currentTimeMillis() - circuitOpenTime > TIMEOUT) {
            circuitOpen.set(false);  // 半开状态
            failureCount.set(0);
        } else {
            throw new ServiceException("支付服务暂时不可用");
        }
    }

    try {
        PaymentResult result = thirdPartyPayment(request);
        failureCount.set(0);
        return result;
    } catch (Exception e) {
        if (failureCount.incrementAndGet() >= FAILURE_THRESHOLD) {
            circuitOpen.set(true);
            circuitOpenTime = System.currentTimeMillis();
        }
        throw new ServiceException("支付失败", e);
    }
}
```

## 常见问题

### 1. 读写分离主从延迟

**问题**: 主库写入后从从库读不到最新数据

**解决**: 强制读主库或使用缓存

```java
@DS("master")
public User getUserAfterSave(Long userId) {
    return userMapper.selectById(userId);
}
```

### 2. 分布式锁死锁

**问题**: 多个线程相互等待锁

**解决**: 按固定顺序加锁

```java
Long first = fromId < toId ? fromId : toId;
Long second = fromId < toId ? toId : fromId;
// 按顺序加锁
```

### 3. 消息重复消费

**问题**: 网络抖动导致消息被重复消费

**解决**: 幂等性处理

```java
if (RedisUtils.hasKey("processed:" + messageId)) {
    return;  // 已处理,跳过
}
processMessage();
RedisUtils.setCacheObject("processed:" + messageId, true, Duration.ofHours(24));
```

### 4. 任务重复执行

**问题**: 多节点同时执行同一定时任务

**解决**: 使用分布式锁,只有一个节点能获取成功

### 5. RocketMQ消息积压

**问题**: 消费速度慢导致消息积压

**解决**: 增加消费线程数或异步处理

```java
@RocketMQMessageListener(
    topic = "order-topic",
    consumeThreadMin = 20,
    consumeThreadMax = 64
)
```

## 总结

分布式系统设计核心原则:

1. **数据源选择**: 写主库,读从库,强一致性读主库
2. **分布式锁**: 锁粒度要细,设置合理超时,避免死锁
3. **消息队列**: 保证幂等性,合理设置重试策略
4. **任务调度**: 使用分布式锁防止重复执行
5. **事务管理**: 本地事务用`@Transactional`,跨数据源用`@DSTransactional`
6. **服务容错**: 限流、降级、熔断三板斧
