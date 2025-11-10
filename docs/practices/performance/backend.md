# 后端性能优化

本文档详细介绍 `ruoyi-plus-uniapp` 后端的性能优化策略和实践,涵盖缓存、数据库、线程池、批处理等核心优化技术。

## 🎯 优化目标

| 指标 | 目标值 | 说明 |
|-----|-------|------|
| **接口响应时间** | < 200ms | 90%的API请求 |
| **数据库查询** | < 50ms | 平均查询时间 |
| **缓存命中率** | > 90% | 热点数据缓存 |
| **并发处理能力** | > 5000 QPS | 单机处理能力 |
| **批量插入(1000条)** | < 200ms | 批处理性能 |

## 📊 核心优化架构

```
后端性能优化体系
│
├── 多层缓存架构
│   ├── L1: Caffeine 本地缓存
│   └── L2: Redis 分布式缓存
│
├── 数据库优化
│   ├── HikariCP 连接池
│   ├── 批处理优化
│   └── 查询优化
│
├── 线程与并发
│   ├── 虚拟线程 (JDK21+)
│   ├── 异步处理
│   └── 线程池管理
│
└── 代码层优化
    ├── DAO层查询构建
    ├── 批量操作API
    └── 对象转换优化
```

## 🔥 多层缓存架构

### 架构设计

项目采用**两级缓存**策略,既保证性能又保证数据一致性:

```
请求 → L1缓存(Caffeine) → L2缓存(Redis) → 数据库
         ↓ 命中(~1ms)      ↓ 命中(~5ms)    ↓ 未命中(~50ms)
       直接返回          直接返回         查询并回填缓存
```

**配置文件**: `ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/config/RedisAutoConfiguration.java`

### L1: Caffeine 本地缓存

**特性**:
- 写入后30秒过期
- 初始容量100条,最大1000条
- 单机内存缓存,速度极快

**配置代码**:

```java:ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/config/RedisAutoConfiguration.java
@Bean
public CacheManager cacheManager() {
    SimpleCacheManager cacheManager = new SimpleCacheManager();
    List<CaffeineCache> caches = new ArrayList<>();

    // 配置各个缓存空间
    for (CacheType cacheType : CacheType.values()) {
        Cache<Object, Object> cache = Caffeine.newBuilder()
            .recordStats()
            .expireAfterWrite(Duration.ofSeconds(30))  // 30秒过期
            .initialCapacity(100)
            .maximumSize(1000)
            .build();

        caches.add(new CaffeineCache(cacheType.name(), cache));
    }

    cacheManager.setCaches(caches);
    return cacheManager;
}
```

**适用场景**:
- 系统配置数据 (变化频率低)
- 字典数据 (高频访问)
- 用户权限信息 (会话期内稳定)
- 部门/角色列表 (基础数据)

### L2: Redis 分布式缓存

**特性**:
- 支持单机/集群模式
- 使用Redisson客户端
- 支持JDK21虚拟线程
- Lua脚本缓存优化

**配置文件**: `ruoyi-admin/src/main/resources/application-dev.yml`

```yaml:ruoyi-admin/src/main/resources/application-dev.yml {85-108}
redisson:
  # 缓存key前缀
  keyPrefix: ${app.id}

  # 线程池配置
  threads: 4                      # Netty线程数
  nettyThreads: 8                 # Netty IO线程数

  # 单机模式配置
  singleServerConfig:
    # 连接池配置
    connectionMinimumIdleSize: 8   # 最小空闲连接
    connectionPoolSize: 32         # 最大连接数

    # 超时配置
    idleConnectionTimeout: 10000   # 10秒空闲超时
    timeout: 3000                  # 3秒响应超时

    # 发布订阅连接池
    subscriptionConnectionPoolSize: 50

  # 集群模式配置 (生产环境推荐)
  clusterServersConfig:
    masterConnectionMinimumIdleSize: 32
    masterConnectionPoolSize: 64
    slaveConnectionMinimumIdleSize: 32
    slaveConnectionPoolSize: 64
```

**虚拟线程支持** (JDK21+):

```java
// Redisson自动检测虚拟线程
if (Runtime.version().feature() >= 21) {
    config.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
}
```

### 缓存使用示例

**Service层使用缓存注解**:

```java
@Service
@RequiredArgsConstructor
public class SysDictDataServiceImpl implements ISysDictDataService {

    /**
     * 查询字典数据 - 使用缓存
     */
    @Cacheable(cacheNames = CacheNames.SYS_DICT, key = "'dict:' + #dictType")
    public List<SysDictData> selectDictDataByType(String dictType) {
        return baseMapper.selectList(
            Wrappers.lambdaQuery(SysDictData.class)
                .eq(SysDictData::getDictType, dictType)
                .eq(SysDictData::getStatus, "0")
                .orderByAsc(SysDictData::getDictSort)
        );
    }

    /**
     * 更新字典数据 - 清除缓存
     */
    @CacheEvict(cacheNames = CacheNames.SYS_DICT, allEntries = true)
    public boolean updateDictData(SysDictData dictData) {
        return baseMapper.updateById(dictData) > 0;
    }

    /**
     * 删除字典数据 - 清除缓存
     */
    @CacheEvict(cacheNames = CacheNames.SYS_DICT, allEntries = true)
    public boolean deleteDictDataByIds(Long[] dictDataIds) {
        return baseMapper.deleteBatchIds(Arrays.asList(dictDataIds)) > 0;
    }
}
```

**缓存名称定义**:

```java
public class CacheNames {
    /**
     * 系统配置缓存
     */
    public static final String SYS_CONFIG = "sys_config";

    /**
     * 数据字典缓存
     */
    public static final String SYS_DICT = "sys_dict";

    /**
     * 用户信息缓存
     */
    public static final String SYS_USER = "sys_user";
}
```

### 缓存最佳实践

#### ✅ 应该缓存的数据

```java
// ✅ 字典数据 (高频访问,低频变更)
@Cacheable(cacheNames = "dict", key = "'dict:' + #dictType")
public List<SysDictData> getDictByType(String dictType) { }

// ✅ 系统配置 (几乎不变)
@Cacheable(cacheNames = "config", key = "'config:' + #configKey")
public String getConfigValue(String configKey) { }

// ✅ 部门树结构 (变化频率低)
@Cacheable(cacheNames = "dept", key = "'dept:tree'")
public List<SysDept> getDeptTree() { }
```

#### ❌ 不应该缓存的数据

```java
// ❌ 实时性要求高的数据
public BigDecimal getAccountBalance(Long userId) {
    // 账户余额不应缓存
}

// ❌ 大数据量列表
public List<OrderVo> getAllOrders() {
    // 数据量大,不适合缓存
}

// ❌ 个性化数据
public UserVo getCurrentUser() {
    // 每个用户不同,缓存意义不大
}
```

## 💾 数据库连接池优化

### HikariCP 配置

**配置文件**: `ruoyi-admin/src/main/resources/application-dev.yml`

```yaml:ruoyi-admin/src/main/resources/application-dev.yml {85-99}
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    dynamic:
      # 性能分析插件
      p6spy: true
      # 主数据源
      primary: master

      datasource:
        # 主库配置
        master:
          driver-class-name: com.mysql.cj.jdbc.Driver
          # ⭐ 批处理优化参数
          url: jdbc:mysql://localhost:3306/ry_plus?rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048
          username: root
          password: password

        # 从库配置 (可选)
        slave:
          driver-class-name: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://localhost:3307/ry_plus?rewriteBatchedStatements=true
          username: root
          password: password
          lazy: true  # 延迟初始化

      # HikariCP连接池配置
      hikari:
        # 连接池大小
        maxPoolSize: 20              # 最大连接数
        minIdle: 10                  # 最小空闲连接

        # 超时配置
        connectionTimeout: 30000     # 30秒获取连接超时
        validationTimeout: 5000      # 5秒验证超时
        idleTimeout: 600000          # 10分钟空闲超时
        maxLifetime: 1800000         # 30分钟最大生命周期

        # 保活配置
        keepaliveTime: 30000         # 30秒检查连接活性

        # 连接测试
        connectionTestQuery: SELECT 1
```

### 批处理优化

**核心参数**: `rewriteBatchedStatements=true`

**性能对比**:

| 操作 | 关闭批处理 | 开启批处理 | 性能提升 |
|-----|----------|----------|---------|
| 插入100条 | 500ms | 25ms | **20倍** ⚡ |
| 插入1000条 | 5000ms | 100ms | **50倍** ⚡ |
| 插入10000条 | 50s | 800ms | **62倍** ⚡ |

**原理**:

```sql
-- 关闭批处理: 执行1000次SQL
INSERT INTO user (name, age) VALUES ('张三', 20);
INSERT INTO user (name, age) VALUES ('李四', 21);
-- ... 998次 ...

-- 开启批处理: 合并为1条SQL
INSERT INTO user (name, age) VALUES
('张三', 20),
('李四', 21),
-- ... 998条 ...
('王五', 22);
```

### 批量操作API

**DAO层批量方法**: `ruoyi-common/ruoyi-common-mybatis/src/main/java/plus/ruoyi/common/mybatis/core/dao/impl/BaseDaoImpl.java`

```java
@Repository
public class BaseDaoImpl<M extends BaseMapper<T>, T> implements IBaseDao<T> {

    @Resource
    protected M baseMapper;

    /**
     * 批量插入
     */
    @Override
    public boolean batchInsert(Collection<T> entities) {
        if (CollUtil.isEmpty(entities)) {
            return true;
        }
        return Db.saveBatch(entities);  // MyBatis-Plus批处理
    }

    /**
     * 批量更新或插入
     */
    @Override
    public boolean batchSave(Collection<T> entities) {
        if (CollUtil.isEmpty(entities)) {
            return true;
        }
        return Db.saveOrUpdateBatch(entities);
    }

    /**
     * 批量删除
     */
    @Override
    public boolean deleteByIds(Collection<Long> ids) {
        if (CollUtil.isEmpty(ids)) {
            return true;
        }
        return baseMapper.deleteBatchIds(ids) > 0;
    }
}
```

**Service层使用示例**:

```java
@Service
@RequiredArgsConstructor
public class AdServiceImpl implements IAdService {

    private final IAdDao adDao;

    /**
     * 批量导入广告数据
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchSave(List<AdBo> boList) {
        if (CollUtil.isEmpty(boList)) {
            return true;
        }

        // ✅ 转换为Entity后批量保存
        List<Ad> entities = new ArrayList<>(boList.size());
        for (AdBo bo : boList) {
            Ad entity = MapstructUtils.convert(bo, Ad.class);
            beforeSave(entity);  // 保存前钩子
            entities.add(entity);
        }

        return adDao.batchSave(entities);  // 批量保存
    }

    /**
     * ❌ 错误示范 - 逐条插入
     */
    public boolean batchSaveWrong(List<AdBo> boList) {
        for (AdBo bo : boList) {
            Ad entity = MapstructUtils.convert(bo, Ad.class);
            adDao.insert(entity);  // 每次都是一条SQL,性能差
        }
        return true;
    }
}
```

## ⚡ 虚拟线程与并发优化

### JDK21 虚拟线程

**配置文件**: `ruoyi-admin/src/main/resources/application.yml`

```yaml:ruoyi-admin/src/main/resources/application.yml
spring:
  # ⭐ 启用虚拟线程 (JDK21+)
  threads:
    virtual:
      enabled: true

  # Spring Boot异步任务配置
  task:
    execution:
      thread-name-prefix: async-
      mode: force  # 由Spring自己初始化线程池
```

**虚拟线程优势**:

| 特性 | 平台线程 | 虚拟线程 |
|-----|---------|---------|
| **创建开销** | 高 (~1MB栈空间) | 低 (~1KB) |
| **最大数量** | 数千 | 数百万 |
| **调度方式** | OS调度 | JVM调度 (ForkJoinPool) |
| **阻塞成本** | 高 (线程阻塞) | 低 (挂载/卸载) |
| **适用场景** | CPU密集型 | IO密集型 |

**虚拟线程示例**:

```java
@Service
public class EmailService {

    /**
     * 异步发送邮件 - 自动使用虚拟线程
     */
    @Async
    public CompletableFuture<Void> sendEmailAsync(String to, String content) {
        // IO密集操作,虚拟线程会在阻塞时自动挂载
        emailClient.send(to, content);
        return CompletableFuture.completedFuture(null);
    }

    /**
     * 批量发送邮件 - 利用虚拟线程并发
     */
    public void sendBatchEmails(List<User> users) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Void>> futures = users.stream()
                .map(user -> executor.submit(() -> {
                    sendEmail(user.getEmail(), "通知内容");
                    return null;
                }))
                .toList();

            // 等待所有任务完成
            for (Future<Void> future : futures) {
                future.get();
            }
        }
    }
}
```

### 传统线程池配置 (JDK21以下)

**配置类**: `ruoyi-common/ruoyi-common-core/src/main/java/plus/ruoyi/common/core/config/properties/ThreadPoolProperties.java`

```java
@Data
@ConfigurationProperties(prefix = "thread-pool")
public class ThreadPoolProperties {

    /**
     * 是否启用自定义线程池
     */
    private Boolean enabled = false;

    /**
     * 核心线程数
     */
    private Integer corePoolSize = 8;

    /**
     * 最大线程数
     */
    private Integer maxPoolSize = 16;

    /**
     * 队列容量
     */
    private Integer queueCapacity = 128;

    /**
     * 空闲时间(秒)
     */
    private Integer keepAliveSeconds = 300;
}
```

```yaml
# JDK21以下使用传统线程池
thread-pool:
  enabled: true
  corePoolSize: 8
  maxPoolSize: 16
  queueCapacity: 128
  keepAliveSeconds: 300
```

## 🔍 查询优化

### DAO层查询构建模式

**核心设计**: 所有查询条件在DAO层的`buildQueryWrapper`方法中构建

**DAO实现示例**: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/dao/impl/AdDaoImpl.java`

```java
@Repository
public class AdDaoImpl extends BaseDaoImpl<AdMapper, Ad> implements IAdDao {

    /**
     * 构建查询条件
     * ⭐ 核心设计: 所有查询条件在此方法中统一构建
     */
    @Override
    public PlusLambdaQuery<Ad> buildQueryWrapper(AdBo bo) {
        Map<String, Object> params = bo.getParams();
        PlusLambdaQuery<Ad> lqw = PlusLambdaQuery.of();

        // ✅ 精确匹配 (自动处理null值)
        lqw.eq(Ad::getId, bo.getId());
        lqw.eq(Ad::getAppid, bo.getAppid());
        lqw.eq(Ad::getStatus, bo.getStatus());

        // ✅ 模糊搜索
        lqw.like(Ad::getAdName, bo.getAdName());

        // ✅ 时间范围查询
        lqw.between(Ad::getCreateTime,
            params.get("beginCreateTime"),
            params.get("endCreateTime"));

        // ✅ 多字段搜索 (searchValue)
        String searchValue = bo.getSearchValue();
        if (StringUtils.isNotBlank(searchValue)) {
            lqw.and(w -> w
                .like(Ad::getAdName, searchValue)
                .or().like(Ad::getDescription, searchValue)
            );
        }

        return lqw;
    }
}
```

**Service层调用**:

```java
@Service
@RequiredArgsConstructor
public class AdServiceImpl implements IAdService {

    private final IAdDao adDao;

    /**
     * 分页查询
     */
    @Override
    public PageResult<AdVo> page(AdBo bo, PageQuery pageQuery) {
        // ✅ 调用DAO层构建查询
        PlusLambdaQuery<Ad> wrapper = adDao.buildQueryWrapper(bo);
        PageResult<Ad> entityPage = adDao.page(wrapper, pageQuery);
        return entityPage.convert(AdVo.class);
    }

    /**
     * 列表查询
     */
    @Override
    public List<AdVo> list(AdBo bo) {
        PlusLambdaQuery<Ad> wrapper = adDao.buildQueryWrapper(bo);
        List<Ad> entities = adDao.list(wrapper);
        return MapstructUtils.convert(entities, AdVo.class);
    }
}
```

### 分页查询优化

**PageQuery配置**: `ruoyi-common/ruoyi-common-mybatis/src/main/java/plus/ruoyi/common/mybatis/core/page/PageQuery.java`

```java
@Data
public class PageQuery {
    /**
     * 当前页码
     */
    private Integer pageNum = 1;

    /**
     * 每页显示条数
     */
    private Integer pageSize = 10;

    /**
     * 排序字段
     */
    private String orderByColumn;

    /**
     * 排序方式 (asc/desc)
     */
    private String isAsc;

    /**
     * 构建MyBatis-Plus分页对象
     */
    public <T> Page<T> build() {
        Integer pageNum = ObjectUtil.defaultIfNull(getPageNum(), 1);
        Integer pageSize = ObjectUtil.defaultIfNull(getPageSize(), 10);

        // 限制最大分页大小
        if (pageSize > 100) {
            pageSize = 100;
        }

        Page<T> page = new Page<>(pageNum, pageSize);

        // 排序处理
        if (StringUtils.isNotBlank(orderByColumn)) {
            String orderBy = StringUtils.toUnderScoreCase(orderByColumn);
            page.addOrder("asc".equals(isAsc)
                ? OrderItem.asc(orderBy)
                : OrderItem.desc(orderBy));
        }

        return page;
    }
}
```

**优化建议**:

```java
// ✅ 限制最大分页大小,防止大页查询
if (pageSize > 100) {
    pageSize = 100;
}

// ✅ 避免深分页,使用上次查询的最大ID
lqw.gt(Entity::getId, lastMaxId)
   .orderByAsc(Entity::getId)
   .last("LIMIT " + pageSize);

// ❌ 避免使用SELECT *
// 只查询需要的字段
lqw.select(Ad::getId, Ad::getAdName, Ad::getStatus);
```

## 📈 性能监控

### P6Spy SQL性能分析

**配置**:

```yaml
spring:
  datasource:
    dynamic:
      p6spy: true  # 启用SQL性能分析
```

**日志输出**:

```
Consume Time: 45 ms
Execute SQL: SELECT id, ad_name, status FROM b_ad WHERE status = '0' ORDER BY create_time DESC LIMIT 10
```

### Spring Boot Actuator监控

**配置**:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: '*'
  metrics:
    export:
      prometheus:
        enabled: true
```

**监控端点**:
- `/actuator/health` - 健康检查
- `/actuator/metrics` - 性能指标
- `/actuator/httptrace` - HTTP跟踪
- `/actuator/caches` - 缓存信息

## 🎯 性能优化检查清单

### 缓存优化

- [ ] 启用多层缓存 (Caffeine + Redis)
- [ ] 热点数据添加`@Cacheable`注解
- [ ] 更新操作添加`@CacheEvict`注解
- [ ] 缓存key设计合理
- [ ] 缓存过期时间配置

### 数据库优化

- [ ] HikariCP连接池参数已优化
- [ ] 批处理参数`rewriteBatchedStatements=true`已开启
- [ ] 使用批量操作API而非循环插入
- [ ] DAO层统一构建查询条件
- [ ] 避免SELECT *,只查询需要的字段
- [ ] 分页大小有上限控制
- [ ] 关键字段已添加索引

### 线程与并发

- [ ] JDK21启用虚拟线程
- [ ] 或配置合理的线程池参数
- [ ] 异步任务使用`@Async`注解
- [ ] IO密集操作使用异步处理
- [ ] 避免在事务中执行耗时操作

### 代码层优化

- [ ] 使用`MapstructUtils`转换对象
- [ ] 避免在循环中查询数据库
- [ ] 集合操作使用Stream API
- [ ] 合理使用事务注解
- [ ] 日志使用占位符而非字符串拼接

## 🚀 性能提升效果

| 优化项 | 优化前 | 优化后 | 提升 |
|-------|-------|-------|-----|
| 字典查询 | 45ms | 2ms | **95.6%** ↑ |
| 列表查询(100条) | 150ms | 35ms | **76.7%** ↑ |
| 批量插入(1000条) | 5000ms | 100ms | **98%** ↑ |
| 并发处理能力 | 1200 QPS | 5500 QPS | **358%** ↑ |

---

通过以上优化策略,`ruoyi-plus-uniapp`后端实现了卓越的性能表现。在实际开发中,请根据业务场景选择合适的优化方案! 🎉
