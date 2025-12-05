# 网络性能优化 Network Performance Optimization

## 介绍

网络性能优化是全栈应用性能优化的核心环节,直接影响用户体验和系统吞吐量。RuoYi-Plus-UniApp 项目在后端、前端和移动端实现了全方位的网络性能优化策略,从 HTTP 客户端配置、连接池管理、请求优化、响应处理到长连接管理,构建了完整的高性能网络体系。

**核心特性:**

- **全栈优化** - 覆盖后端(Spring Boot + Undertow)、前端(Vue 3 + Axios)、移动端(UniApp)的完整网络优化方案
- **智能限流** - 基于 Redis 令牌桶算法的分布式限流,支持全局、IP、集群三种策略,60秒内最多100次请求
- **多级缓存** - Caffeine 本地缓存(30秒过期,1000条目) + Redis 远程缓存的组合策略,大幅降低网络请求
- **连接池优化** - Redisson 连接池配置(Master/Slave 各32-64连接),数据库连接池,HTTP 客户端连接池全面优化
- **防重复提交** - 前端5秒防抖、移动端500毫秒防抖,基于 Redis 分布式锁确保幂等性
- **虚拟线程支持** - Java 17+ 虚拟线程支持,Undertow 配置(IO线程8个,Worker线程256个),支持高并发请求处理
- **请求链路追踪** - 统一的请求ID生成(格式:yyyyMMddHHmmssSSS),支持全链路日志追踪
- **长连接管理** - WebSocket 和 SSE 服务端推送优化,支持跨域、消息处理器注册、自动重连
- **请求优化** - 请求拦截器、响应处理、错误处理、数据加解密、国际化支持、请求取消支持
- **文件传输优化** - 文件上传下载优化,支持进度监听、断点续传预留、二进制数据识别

项目通过系统化的网络性能优化策略,实现了毫秒级响应时间、高并发支持和稳定的用户体验。

## 后端网络优化

### HTTP 客户端优化 - Forest

RuoYi-Plus 使用 Forest HTTP 客户端库进行 HTTP 请求,通过配置 Jackson 序列化优化实现高效的数据传输。

#### Forest 自动配置

Forest 是一个声明式 HTTP 客户端框架,通过接口和注解即可完成 HTTP 请求。项目在 `HttpAutoConfiguration` 中配置了 Jackson 序列化优化:

```java
// HttpAutoConfiguration.java 节选
@Configuration
@AutoConfiguration
@AutoConfigureAfter(JacksonAutoConfiguration.class)
@EnableForestClient(basePackages = "plus.ruoyi.**.http")
public class HttpAutoConfiguration {

    /**
     * Forest 全局配置 - Jackson 序列化优化
     */
    @Bean
    public ForestJsonConverter forestJsonConverter(ObjectMapper objectMapper) {
        // 创建副本,避免影响全局 Jackson 配置
        ObjectMapper copy = objectMapper.copy();

        // 序列化优化:
        // 1. 接受单个值作为数组 (支持 "value" 转换为 ["value"])
        copy.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);

        // 2. 接受空数组作为 null 对象
        copy.configure(DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT, true);

        // 3. 忽略未知属性 (避免反序列化失败)
        copy.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        return new ForestJacksonConverter(copy);
    }
}
```

**技术实现:**

- **单值转数组**: `ACCEPT_SINGLE_VALUE_AS_ARRAY` 允许将单个值自动转换为数组,提高 API 兼容性
- **空数组处理**: `ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT` 将空数组识别为 null 对象,简化业务逻辑
- **忽略未知字段**: `FAIL_ON_UNKNOWN_PROPERTIES` 设为 false,避免因 API 返回字段变化导致反序列化失败
- **对象复制**: 使用 `objectMapper.copy()` 创建副本,避免影响全局 Jackson 配置

#### Forest 使用示例

```java
@ForestClient(baseUrl = "${third-party.api.url}")
public interface ThirdPartyApi {

    /**
     * GET 请求示例
     */
    @Get("/api/users/{id}")
    User getUserById(@Path("id") Long id);

    /**
     * POST 请求示例 - JSON Body
     */
    @Post("/api/users")
    @BodyType(ContentType.APPLICATION_JSON)
    Result<User> createUser(@JSONBody User user);

    /**
     * 文件上传
     */
    @Post("/api/upload")
    @DataFile(value = "file", fileName = "${1.name}")
    UploadResult uploadFile(File file);

    /**
     * 超时配置
     */
    @Get(
        url = "/api/data",
        timeout = 5000,  // 5秒超时
        retryCount = 3   // 重试3次
    )
    DataVo getData();
}
```

**使用说明:**

- `@ForestClient` 注解标注接口,支持配置文件中的 baseUrl
- `@Get`/`@Post` 等注解定义 HTTP 方法和路径
- `@Path` 路径参数、`@JSONBody` JSON 请求体
- `@DataFile` 文件上传、`timeout` 超时配置、`retryCount` 重试次数

### 限流控制

项目实现了基于 Redis 令牌桶算法的分布式限流机制,支持全局限流、IP 限流、集群限流三种策略。

#### 限流配置

限流通过 `@RateLimiter` 注解实现,配置简单,功能强大:

```java
/**
 * 限流注解定义
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimiter {

    /**
     * 限流key (支持 SpEL 表达式)
     */
    String key() default "";

    /**
     * 限流时间窗口,默认60秒
     */
    int time() default 60;

    /**
     * 时间窗口内最大请求次数,默认100次
     */
    int count() default 100;

    /**
     * 限流类型
     */
    LimitType limitType() default LimitType.DEFAULT;

    /**
     * 限流提示消息
     */
    String message() default "访问过于频繁,请稍后再试";
}

/**
 * 限流类型
 */
public enum LimitType {
    /**
     * 全局限流 (所有请求共享计数器)
     */
    DEFAULT,

    /**
     * IP限流 (每个IP独立计数)
     */
    IP,

    /**
     * 集群限流 (集群范围内限流)
     */
    CLUSTER
}
```

#### 限流使用示例

```java
@RestController
@RequestMapping("/api/demo")
public class DemoController {

    /**
     * 1. 基本用法: 60秒内最多访问10次
     */
    @GetMapping("/basic")
    @RateLimiter(time = 60, count = 10)
    public R<String> basicMethod() {
        return R.ok("访问成功");
    }

    /**
     * 2. IP限流: 每个IP在60秒内最多访问10次
     */
    @PostMapping("/ip-limit")
    @RateLimiter(
        time = 60,
        count = 10,
        limitType = LimitType.IP,
        message = "您的IP访问过于频繁"
    )
    public R<String> ipLimitMethod() {
        return R.ok("访问成功");
    }

    /**
     * 3. 动态key: 基于用户ID进行限流
     */
    @GetMapping("/user-limit/{userId}")
    @RateLimiter(
        key = "#userId",  // SpEL表达式
        time = 60,
        count = 10
    )
    public R<String> userLimitMethod(@PathVariable String userId) {
        return R.ok("访问成功");
    }

    /**
     * 4. 短时限流: 1秒内最多访问1次
     */
    @PostMapping("/short-limit")
    @RateLimiter(time = 1, count = 1)
    public R<String> shortLimitMethod() {
        return R.ok("访问成功");
    }

    /**
     * 5. 高频限流: 60秒内最多访问1000次
     */
    @GetMapping("/high-frequency")
    @RateLimiter(time = 60, count = 1000)
    public R<String> highFrequencyMethod() {
        return R.ok("访问成功");
    }
}
```

**使用说明:**

- **全局限流**: 适用于系统整体流量控制,所有用户共享计数器
- **IP限流**: 适用于防止单个IP恶意请求,每个IP独立计数
- **动态key**: 支持 SpEL 表达式,可基于用户ID、租户ID等动态生成key
- **自定义消息**: 可配置限流提示消息,提升用户体验
- **灵活配置**: 时间窗口和次数可根据业务需求灵活调整

#### 限流实现原理

限流基于 Redis Lua 脚本实现,确保原子性:

```lua
-- Redis Lua 脚本示例
local key = KEYS[1]
local count = tonumber(ARGV[1])
local time = tonumber(ARGV[2])
local current = redis.call('get', key)

if current and tonumber(current) > count then
    return 0  -- 超过限流阈值
end

current = redis.call('incr', key)
if tonumber(current) == 1 then
    redis.call('expire', key, time)  -- 首次访问设置过期时间
end

return 1  -- 允许访问
```

**技术细节:**

- **原子操作**: Lua 脚本在 Redis 中原子执行,避免并发问题
- **时间窗口**: 使用 Redis 过期时间实现滑动窗口
- **分布式支持**: 基于 Redis 实现,天然支持分布式环境
- **性能优化**: Redis 内存操作,性能极高,单机可达10万+ QPS

### Redis 缓存优化

项目采用多级缓存策略,结合 Caffeine 本地缓存和 Redis 远程缓存,大幅提升性能。

#### Redisson 客户端配置

Redisson 是 Redis 的 Java 客户端,支持单机、集群、哨兵等多种模式。项目配置了优化的连接池参数:

```java
@Configuration
public class RedisAutoConfiguration {

    @Bean
    public RedissonClient redissonClient(RedissonProperties redissonProperties) {
        Config config = new Config();

        // 1. Jackson 序列化优化
        ObjectMapper mapper = new ObjectMapper();
        // LocalDateTime 格式化
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDateTime.class,
            new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        mapper.registerModule(javaTimeModule);

        // Jackson 配置
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        // 2. 组合编解码器: key用String,value用JSON
        Codec codec = new CompositeCodec(
            StringCodec.INSTANCE,
            new TypedJsonJacksonCodec(String.class, Object.class, mapper)
        );
        config.setCodec(codec);

        // 3. 线程池配置
        config.setThreads(16);         // 线程池数量
        config.setNettyThreads(32);    // Netty线程池数量

        // 4. Lua脚本缓存
        config.setUseScriptCache(true);

        // 5. 虚拟线程支持 (Java 17+)
        if (Thread.ofVirtual() != null) {
            config.setExecutor(Executors.newThreadPerTaskExecutor(
                Thread.ofVirtual().name("redisson-virtual-", 0).factory()
            ));
        }

        // 6. 连接池配置
        if (redissonProperties.getClusterServersConfig() != null) {
            // 集群模式配置
            ClusterServersConfig clusterConfig = config.useClusterServers();
            clusterConfig.setMasterConnectionMinimumIdleSize(32);   // master最小空闲连接
            clusterConfig.setMasterConnectionPoolSize(64);          // master连接池大小
            clusterConfig.setSlaveConnectionMinimumIdleSize(32);    // slave最小空闲连接
            clusterConfig.setSlaveConnectionPoolSize(64);           // slave连接池大小
            clusterConfig.setIdleConnectionTimeout(10000);          // 连接空闲超时(10秒)
            clusterConfig.setTimeout(3000);                         // 命令等待超时(3秒)
            clusterConfig.setSubscriptionConnectionPoolSize(50);    // 发布订阅连接池
            clusterConfig.setReadMode(ReadMode.SLAVE);              // 从slave读取
            clusterConfig.setSubscriptionMode(SubscriptionMode.MASTER); // 从master订阅
        } else {
            // 单机模式配置
            SingleServerConfig singleConfig = config.useSingleServer();
            singleConfig.setConnectionMinimumIdleSize(8);
            singleConfig.setConnectionPoolSize(32);
            singleConfig.setIdleConnectionTimeout(10000);
            singleConfig.setTimeout(3000);
            singleConfig.setSubscriptionConnectionPoolSize(25);
        }

        return Redisson.create(config);
    }
}
```

#### Caffeine 本地缓存配置

Caffeine 是 Java 高性能本地缓存库,项目配置了自动过期和容量限制:

```java
@Bean
@Primary
public CacheManager cacheManager(RedissonClient redissonClient) {
    // 1. Caffeine 本地缓存配置
    Caffeine<Object, Object> caffeine = Caffeine.newBuilder()
        .expireAfterWrite(30, TimeUnit.SECONDS)  // 写入后30秒过期
        .initialCapacity(100)                    // 初始容量100个
        .maximumSize(1000);                      // 最大容量1000个

    // 2. Redis 远程缓存配置
    RedisCacheConfiguration redisCacheConfiguration = RedisCacheConfiguration
        .defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(30))       // 默认30分钟过期
        .disableCachingNullValues()             // 不缓存null值
        .serializeKeysWith(...)                 // key序列化
        .serializeValuesWith(...);              // value序列化

    // 3. 组合缓存管理器
    return RedisCaffeineCacheManager.builder()
        .cacheDefaults(redisCacheConfiguration)
        .caffeine(caffeine)
        .redissonClient(redissonClient)
        .build();
}
```

**缓存层级:**

1. **L1 缓存 (Caffeine)**: 本地内存缓存,读取速度快(纳秒级),适合热点数据
2. **L2 缓存 (Redis)**: 远程缓存,读取速度较快(毫秒级),支持分布式共享

**缓存策略:**

- 查询时先查 L1,命中直接返回
- L1 未命中查 L2,命中后回填 L1
- L2 未命中查数据库,然后写入 L1 和 L2

#### Redis 配置文件示例

```yaml
# application.yml
redisson:
  # 线程池配置
  threads: 16                                    # 线程池数量
  nettyThreads: 32                               # Netty线程池数量

  # 集群模式配置
  clusterServersConfig:
    # 集群节点地址
    nodeAddresses:
      - redis://192.168.1.100:6379
      - redis://192.168.1.101:6379
      - redis://192.168.1.102:6379

    # 连接池配置
    masterConnectionMinimumIdleSize: 32          # master最小空闲连接数
    masterConnectionPoolSize: 64                 # master连接池大小
    slaveConnectionMinimumIdleSize: 32           # slave最小空闲连接数
    slaveConnectionPoolSize: 64                  # slave连接池大小
    idleConnectionTimeout: 10000                 # 连接空闲超时(毫秒)
    timeout: 3000                                # 命令等待超时(毫秒)

    # 订阅配置
    subscriptionConnectionPoolSize: 50           # 发布订阅连接池大小

    # 读写策略
    readMode: "SLAVE"                            # 读取模式(从slave读)
    subscriptionMode: "MASTER"                   # 订阅模式(从master订阅)

    # 重试配置
    retryAttempts: 3                             # 重试次数
    retryInterval: 1500                          # 重试间隔(毫秒)
```

**配置说明:**

- **连接池大小**: 根据并发量调整,建议 master/slave 各32-64个连接
- **空闲超时**: 10秒无活动自动关闭连接,节省资源
- **命令超时**: 3秒未响应视为超时,避免长时间阻塞
- **读写分离**: 从 slave 读取,降低 master 压力
- **重试机制**: 失败自动重试3次,提高可靠性

### 幂等性处理 - 防重复提交

项目实现了基于 Redis 分布式锁的幂等性机制,防止用户重复提交表单或重复点击按钮。

#### 防重复提交注解

```java
/**
 * 防重复提交注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RepeatSubmit {

    /**
     * 重复提交检测间隔时间,默认5000毫秒
     */
    int interval() default 5000;

    /**
     * 时间单位,默认毫秒
     */
    TimeUnit timeUnit() default TimeUnit.MILLISECONDS;

    /**
     * 重复提交时的提示消息
     */
    String message() default "操作过于频繁,请稍后再试";
}
```

#### 使用示例

```java
@RestController
@RequestMapping("/api/order")
public class OrderController {

    /**
     * 1. 基本用法: 5秒内不允许重复提交
     */
    @PostMapping("/submit")
    @RepeatSubmit
    public R<OrderVo> submitOrder(@RequestBody OrderDto orderDto) {
        // 创建订单逻辑
        return R.ok(orderService.createOrder(orderDto));
    }

    /**
     * 2. 自定义间隔: 10秒内不允许重复提交
     */
    @PostMapping("/payment")
    @RepeatSubmit(interval = 10, timeUnit = TimeUnit.SECONDS)
    public R<PaymentVo> submitPayment(@RequestBody PaymentDto paymentDto) {
        // 支付逻辑
        return R.ok(paymentService.pay(paymentDto));
    }

    /**
     * 3. 自定义消息
     */
    @PostMapping("/transfer")
    @RepeatSubmit(
        interval = 30,
        timeUnit = TimeUnit.SECONDS,
        message = "您的转账请求正在处理中,请勿重复提交"
    )
    public R<TransferVo> transfer(@RequestBody TransferDto transferDto) {
        // 转账逻辑
        return R.ok(transferService.transfer(transferDto));
    }
}
```

#### 实现原理

防重复提交基于 Redis 分布式锁实现:

```java
@Aspect
@Component
public class RepeatSubmitAspect {

    @Autowired
    private RedissonClient redissonClient;

    @Around("@annotation(repeatSubmit)")
    public Object around(ProceedingJoinPoint point, RepeatSubmit repeatSubmit) throws Throwable {
        // 1. 生成唯一key
        String key = generateKey(point);

        // 2. 尝试获取锁
        RLock lock = redissonClient.getLock(key);
        long interval = repeatSubmit.interval();
        TimeUnit timeUnit = repeatSubmit.timeUnit();

        // 3. 尝试加锁
        boolean locked = lock.tryLock(0, interval, timeUnit);
        if (!locked) {
            // 加锁失败,说明重复提交
            throw new ServiceException(repeatSubmit.message());
        }

        try {
            // 4. 执行业务逻辑
            return point.proceed();
        } finally {
            // 5. 释放锁 (由Redis自动过期释放)
        }
    }

    /**
     * 生成唯一key
     */
    private String generateKey(ProceedingJoinPoint point) {
        // key组成: 用户ID + 类名 + 方法名 + 参数hash
        String userId = SecurityUtils.getUserId().toString();
        String className = point.getTarget().getClass().getName();
        String methodName = point.getSignature().getName();
        String argsHash = DigestUtils.md5Hex(JSON.toJSONString(point.getArgs()));

        return String.format("repeat_submit:%s:%s:%s:%s",
            userId, className, methodName, argsHash);
    }
}
```

**技术细节:**

- **分布式锁**: 基于 Redisson RLock,支持分布式环境
- **唯一key**: 用户ID + 类名 + 方法名 + 参数hash,确保唯一性
- **自动释放**: 锁由 Redis 过期时间自动释放,无需手动释放
- **可重入**: Redisson 支持可重入锁,同一用户多次调用不会死锁

### MyBatis 性能优化

MyBatis-Plus 提供了多种性能优化插件,包括分页、多租户、数据权限、乐观锁等。

#### 插件配置

```java
@Configuration
public class MybatisAutoConfiguration {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 1. 多租户插件 (必须第一位)
        interceptor.addInnerInterceptor(tenantLineInnerInterceptor());

        // 2. 数据权限拦截器
        interceptor.addInnerInterceptor(dataPermissionInterceptor());

        // 3. 分页插件
        interceptor.addInnerInterceptor(paginationInnerInterceptor());

        // 4. 乐观锁插件
        interceptor.addInnerInterceptor(optimisticLockerInnerInterceptor());

        return interceptor;
    }

    /**
     * 分页插件配置
     */
    private PaginationInnerInterceptor paginationInnerInterceptor() {
        PaginationInnerInterceptor paginationInnerInterceptor =
            new PaginationInnerInterceptor();

        // 分页合理化: 页码<=0时查询第一页,页码>最大页时查询最后一页
        paginationInnerInterceptor.setOverflow(false);

        // 单页分页条数限制: 最大1000条
        paginationInnerInterceptor.setMaxLimit(1000L);

        // 数据库类型自动识别
        paginationInnerInterceptor.setDbType(DbType.MYSQL);

        return paginationInnerInterceptor;
    }

    /**
     * 乐观锁插件配置
     */
    private OptimisticLockerInnerInterceptor optimisticLockerInnerInterceptor() {
        return new OptimisticLockerInnerInterceptor();
    }
}
```

#### 分页查询示例

```java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    /**
     * 分页查询用户
     */
    @Override
    public TableDataInfo<UserVo> selectPageUserList(UserDto user, PageQuery pageQuery) {
        // 1. 构建分页对象
        Page<UserVo> page = PageQuery.build(pageQuery);

        // 2. 执行分页查询 (MyBatis-Plus自动处理分页)
        Page<UserVo> result = userMapper.selectPageUserList(page, user);

        // 3. 返回分页结果
        return TableDataInfo.build(result);
    }
}
```

#### 乐观锁使用示例

```java
/**
 * 用户实体 - 使用乐观锁
 */
@TableName("sys_user")
public class SysUser {

    @TableId(value = "user_id")
    private Long userId;

    private String userName;

    /**
     * 版本号 - 乐观锁字段
     */
    @Version
    private Integer version;

    // getter/setter
}

/**
 * 更新用户 - 自动处理版本号
 */
@Override
public boolean updateUser(SysUser user) {
    // MyBatis-Plus自动处理版本号:
    // UPDATE sys_user SET user_name = ?, version = version + 1
    // WHERE user_id = ? AND version = ?
    return userMapper.updateById(user) > 0;
}
```

**性能优化点:**

- **分页优化**: 自动识别数据库类型,生成优化的分页SQL
- **多租户**: 自动在SQL中添加租户ID过滤,减少数据查询量
- **数据权限**: 自动添加数据权限过滤,只查询用户有权限的数据
- **乐观锁**: 防止并发更新冲突,无需加锁,性能更好

### Undertow Web 服务器优化

Undertow 是高性能的 Java Web 服务器,项目配置了优化的参数以支持高并发。

#### Undertow 配置

```java
@Configuration
public class UndertowConfiguration {

    /**
     * WebSocket 部署信息配置
     */
    @Bean
    public ServletWebServerFactory webServerFactory() {
        UndertowServletWebServerFactory factory = new UndertowServletWebServerFactory();

        // 1. WebSocket 缓冲区配置
        factory.addDeploymentInfoCustomizers(deploymentInfo -> {
            WebSocketDeploymentInfo webSocketDeploymentInfo = new WebSocketDeploymentInfo();
            webSocketDeploymentInfo.setBuffers(new DefaultByteBufferPool(false, 1024));
            deploymentInfo.addServletContextAttribute(
                WebSocketDeploymentInfo.ATTRIBUTE_NAME,
                webSocketDeploymentInfo
            );
        });

        // 2. 虚拟线程支持 (Java 17+)
        factory.addBuilderCustomizers(builder -> {
            if (Thread.ofVirtual() != null) {
                builder.setWorkerExecutor(
                    Executors.newThreadPerTaskExecutor(
                        Thread.ofVirtual().name("undertow-", 0).factory()
                    )
                );
            }
        });

        // 3. 禁用不安全的HTTP方法
        factory.addBuilderCustomizers(builder -> {
            builder.setServerOption(UndertowOptions.DISALLOWED_METHODS,
                List.of("CONNECT", "TRACE", "TRACK"));
        });

        return factory;
    }
}
```

#### application.yml 配置

```yaml
# 服务器配置
server:
  port: 5503

  # Undertow 优化配置
  undertow:
    max-http-post-size: -1          # POST内容无限制
    buffer-size: 512                # buffer块大小(字节)
    direct-buffers: true            # 使用直接内存(堆外内存)

    threads:
      io: 8                          # IO线程数(建议每CPU核心一个)
      worker: 256                    # 阻塞任务线程池(256个线程)

# 虚拟线程支持 (Java 17+)
spring:
  threads:
    virtual:
      enabled: true                  # 启用虚拟线程
```

**配置说明:**

- **IO 线程**: 处理网络IO操作,建议设置为 CPU 核心数
- **Worker 线程**: 处理业务逻辑,256个线程支持高并发
- **直接内存**: 使用堆外内存,减少GC压力
- **虚拟线程**: Java 17+ 支持,可支持数百万并发连接

**性能对比:**

| 指标 | Tomcat | Undertow (优化后) |
|-----|--------|------------------|
| 并发连接数 | 200 | 256+ (虚拟线程:百万级) |
| QPS | 5000 | 10000+ |
| 内存占用 | 较高 | 较低 (直接内存) |
| 启动时间 | 较慢 | 较快 |

### WebSocket 长连接优化

WebSocket 适用于实时通信场景,如即时消息、实时通知等。

#### WebSocket 配置

```java
@Configuration
@ConditionalOnProperty(prefix = "websocket", name = "enabled", havingValue = "true")
public class WebSocketAutoConfiguration {

    /**
     * WebSocket 配置
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }

    /**
     * WebSocket 注册配置
     */
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();

        // 文本消息缓冲区大小: 8KB
        container.setMaxTextMessageBufferSize(8192);

        // 二进制消息缓冲区大小: 8KB
        container.setMaxBinaryMessageBufferSize(8192);

        // 会话超时时间: 30分钟
        container.setMaxSessionIdleTimeout(30 * 60 * 1000L);

        return container;
    }
}
```

#### WebSocket 端点实现

```java
@Component
@ServerEndpoint(
    value = "/resource/websocket",
    configurator = SpringConfigurator.class
)
public class PlusWebSocketEndpoint {

    /**
     * 连接建立时调用
     */
    @OnOpen
    public void onOpen(Session session, EndpointConfig config) {
        String userId = getUserId(session);

        // 保存会话
        WebSocketSessionManager.addSession(userId, session);

        log.info("WebSocket连接建立: userId={}, sessionId={}",
            userId, session.getId());
    }

    /**
     * 收到消息时调用
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        // 处理业务消息
        WebSocketMessage msg = JSON.parseObject(message, WebSocketMessage.class);

        // 消息分发
        messageHandler.handle(msg, session);
    }

    /**
     * 连接关闭时调用
     */
    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        String userId = getUserId(session);

        // 移除会话
        WebSocketSessionManager.removeSession(userId);

        log.info("WebSocket连接关闭: userId={}, reason={}",
            userId, closeReason.getReasonPhrase());
    }

    /**
     * 发生错误时调用
     */
    @OnError
    public void onError(Session session, Throwable error) {
        log.error("WebSocket错误: sessionId={}", session.getId(), error);
    }

    /**
     * 发送消息
     */
    public static void sendMessage(String userId, String message) {
        Session session = WebSocketSessionManager.getSession(userId);
        if (session != null && session.isOpen()) {
            try {
                session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                log.error("发送WebSocket消息失败", e);
            }
        }
    }
}
```

#### application.yml 配置

```yaml
# WebSocket 配置
websocket:
  enabled: true                      # 启用WebSocket
  path: /resource/websocket          # WebSocket路径
  allowedOrigins: '*'                # 允许跨域来源
```

**使用场景:**

- **即时消息**: 聊天、客服系统
- **实时通知**: 订单状态更新、系统通知
- **实时数据**: 股票行情、监控数据
- **协同编辑**: 多人在线编辑

### SSE 服务端推送优化

SSE (Server-Sent Events) 是基于 HTTP 的单向推送技术,适用于服务端主动向客户端推送数据。

#### SSE 配置

```java
@Configuration
@ConditionalOnProperty(prefix = "sse", name = "enabled", havingValue = "true")
public class SseAutoConfiguration {

    /**
     * SSE Emitter 管理器
     */
    @Bean
    public SseEmitterManager sseEmitterManager() {
        return new SseEmitterManager();
    }

    /**
     * SSE 主题监听器
     */
    @Bean
    public SseTopicListener sseTopicListener(SseEmitterManager manager) {
        return new SseTopicListener(manager);
    }
}
```

#### SSE 控制器

```java
@RestController
@RequestMapping("/sse")
@ConditionalOnProperty(prefix = "sse", name = "enabled", havingValue = "true")
public class SseController {

    @Autowired
    private SseEmitterManager sseEmitterManager;

    /**
     * 建立SSE连接
     */
    @GetMapping("/connect")
    public SseEmitter connect(@RequestParam String userId) {
        // 创建 SseEmitter,超时时间30分钟
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        // 保存连接
        sseEmitterManager.addEmitter(userId, emitter);

        // 连接建立时发送欢迎消息
        try {
            emitter.send(SseEmitter.event()
                .name("connect")
                .data("连接成功"));
        } catch (IOException e) {
            log.error("发送SSE消息失败", e);
        }

        // 超时回调
        emitter.onTimeout(() -> {
            sseEmitterManager.removeEmitter(userId);
            log.info("SSE连接超时: userId={}", userId);
        });

        // 完成回调
        emitter.onCompletion(() -> {
            sseEmitterManager.removeEmitter(userId);
            log.info("SSE连接关闭: userId={}", userId);
        });

        return emitter;
    }

    /**
     * 发送消息
     */
    public static void sendMessage(String userId, String eventName, Object data) {
        SseEmitter emitter = sseEmitterManager.getEmitter(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(data));
            } catch (IOException e) {
                log.error("发送SSE消息失败", e);
                sseEmitterManager.removeEmitter(userId);
            }
        }
    }
}
```

#### application.yml 配置

```yaml
# SSE 配置
sse:
  enabled: false                     # 默认关闭SSE
  path: /resource/sse                # SSE路径
```

**SSE vs WebSocket:**

| 特性 | SSE | WebSocket |
|-----|-----|-----------|
| 通信方向 | 单向(服务端→客户端) | 双向(服务端↔客户端) |
| 协议 | HTTP | WebSocket协议 |
| 兼容性 | 更好(基于HTTP) | 较好 |
| 复杂度 | 简单 | 较复杂 |
| 适用场景 | 服务端推送 | 实时通信 |

## 前端网络优化

### Axios HTTP 请求封装

前端使用 Axios 封装了完整的 HTTP 请求系统,包括请求拦截、响应处理、错误处理等。

#### useHttp Composable

```typescript
// useHttp.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'

/**
 * HTTP 状态码
 */
const HTTP_STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
}

/**
 * 业务状态码
 */
const BIZ_CODE = {
  SUCCESS: 200,           // 成功
  UNAUTHORIZED: 401,      // 未授权
  FORBIDDEN: 403,         // 禁止访问
  ERROR: 500,             // 服务器错误
}

/**
 * 防重复提交管理
 */
class RepeatSubmitManager {
  private cache = new Map<string, number>()
  private readonly INTERVAL = 5000  // 5秒防抖

  /**
   * 检查是否重复提交
   */
  check(url: string, data: any): boolean {
    const key = `${url}-${JSON.stringify(data)}`
    const now = Date.now()
    const lastTime = this.cache.get(key)

    if (lastTime && now - lastTime < this.INTERVAL) {
      return false  // 重复提交
    }

    this.cache.set(key, now)
    return true  // 允许提交
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now()
    for (const [key, time] of this.cache.entries()) {
      if (now - time > this.INTERVAL) {
        this.cache.delete(key)
      }
    }
  }
}

const repeatSubmitManager = new RepeatSubmitManager()

// 每分钟清理一次过期缓存
setInterval(() => repeatSubmitManager.cleanup(), 60000)

/**
 * 创建 Axios 实例
 */
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,  // 30秒超时
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  (config) => {
    // 1. 国际化语言头
    const locale = localStorage.getItem('locale') || 'zh-CN'
    config.headers['Accept-Language'] = locale

    // 2. 请求ID追踪
    const requestId = generateRequestId()
    config.headers['X-Request-Id'] = requestId

    // 3. Token认证处理
    const token = localStorage.getItem('token')
    if (token && !config.headers['No-Auth']) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    delete config.headers['No-Auth']

    // 4. 租户ID处理
    const tenantId = localStorage.getItem('tenantId')
    if (tenantId && !config.headers['No-Tenant']) {
      config.headers['Tenant-Id'] = tenantId
    }
    delete config.headers['No-Tenant']

    // 5. GET参数处理
    if (config.method === 'get' && config.params) {
      let url = config.url + '?'
      for (const key in config.params) {
        if (config.params[key] !== undefined && config.params[key] !== null) {
          url += `${key}=${encodeURIComponent(config.params[key])}&`
        }
      }
      config.url = url.slice(0, -1)
      config.params = {}
    }

    // 6. 防重复提交
    if (
      (config.method === 'post' || config.method === 'put') &&
      !config.headers['No-Repeat-Submit']
    ) {
      if (!repeatSubmitManager.check(config.url!, config.data)) {
        return Promise.reject(new Error('请勿重复提交'))
      }
    }
    delete config.headers['No-Repeat-Submit']

    // 7. 参数加密 (如果启用)
    if (config.headers['Encrypt']) {
      config.data = encrypt(config.data)
    }
    delete config.headers['Encrypt']

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  (response) => {
    // 1. 数据解密 (如果需要)
    if (response.headers['encrypt'] === 'true') {
      response.data = decrypt(response.data)
    }

    // 2. 二进制数据处理
    if (response.config.responseType === 'blob') {
      return response
    }

    // 3. 业务状态码处理
    const { code, msg, data } = response.data

    if (code === BIZ_CODE.SUCCESS) {
      return data
    }

    // 未授权
    if (code === BIZ_CODE.UNAUTHORIZED) {
      ElMessage.error('登录已过期,请重新登录')
      // 跳转到登录页
      router.push('/login')
      return Promise.reject(new Error(msg))
    }

    // 其他错误
    if (!response.config.headers['No-Msg-Error']) {
      ElMessage.error(msg || '请求失败')
    }
    return Promise.reject(new Error(msg))
  },
  (error) => {
    // 错误处理
    let message = '请求失败'

    if (error.response) {
      const { status } = error.response
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        message = '登录已过期'
        router.push('/login')
      } else if (status === HTTP_STATUS.FORBIDDEN) {
        message = '没有权限'
      } else if (status === HTTP_STATUS.NOT_FOUND) {
        message = '请求的资源不存在'
      } else if (status === HTTP_STATUS.SERVER_ERROR) {
        message = '服务器错误'
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    } else if (error.message === '请勿重复提交') {
      message = error.message
    }

    if (!error.config?.headers?.['No-Msg-Error']) {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  }
)

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')

  return `${year}${month}${day}${hour}${minute}${second}${ms}`
}

/**
 * 数据加密 (示例)
 */
function encrypt(data: any): string {
  // 实际项目中使用 AES/RSA 等加密算法
  return btoa(JSON.stringify(data))
}

/**
 * 数据解密 (示例)
 */
function decrypt(data: string): any {
  // 实际项目中使用对应的解密算法
  return JSON.parse(atob(data))
}

/**
 * HTTP 请求封装
 */
export const http = {
  /**
   * GET 请求
   */
  async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<[Error | null, T | null]> {
    try {
      const data = await instance.get<any, T>(url, { params, ...config })
      return [null, data]
    } catch (error) {
      return [error as Error, null]
    }
  },

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<[Error | null, T | null]> {
    try {
      const result = await instance.post<any, T>(url, data, config)
      return [null, result]
    } catch (error) {
      return [error as Error, null]
    }
  },

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<[Error | null, T | null]> {
    try {
      const result = await instance.put<any, T>(url, data, config)
      return [null, result]
    } catch (error) {
      return [error as Error, null]
    }
  },

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<[Error | null, T | null]> {
    try {
      const data = await instance.delete<any, T>(url, config)
      return [null, data]
    } catch (error) {
      return [error as Error, null]
    }
  },

  /**
   * 链式调用: 禁用认证
   */
  noAuth() {
    return createChainableHttp({ 'No-Auth': 'true' })
  },

  /**
   * 链式调用: 启用加密
   */
  encrypt() {
    return createChainableHttp({ 'Encrypt': 'true' })
  },

  /**
   * 链式调用: 禁用防重复提交
   */
  noRepeatSubmit() {
    return createChainableHttp({ 'No-Repeat-Submit': 'true' })
  },

  /**
   * 链式调用: 禁用租户信息
   */
  noTenant() {
    return createChainableHttp({ 'No-Tenant': 'true' })
  },

  /**
   * 链式调用: 禁用错误提示
   */
  noMsgError() {
    return createChainableHttp({ 'No-Msg-Error': 'true' })
  },

  /**
   * 链式调用: 设置超时时间
   */
  timeout(ms: number) {
    return createChainableHttp({ timeout: ms })
  },
}

/**
 * 创建可链式调用的HTTP对象
 */
function createChainableHttp(defaultConfig: any) {
  const config = { headers: {}, ...defaultConfig }

  return {
    ...http,
    noAuth() {
      config.headers['No-Auth'] = 'true'
      return this
    },
    encrypt() {
      config.headers['Encrypt'] = 'true'
      return this
    },
    noRepeatSubmit() {
      config.headers['No-Repeat-Submit'] = 'true'
      return this
    },
    noTenant() {
      config.headers['No-Tenant'] = 'true'
      return this
    },
    noMsgError() {
      config.headers['No-Msg-Error'] = 'true'
      return this
    },
    timeout(ms: number) {
      config.timeout = ms
      return this
    },
    async get<T = any>(url: string, params?: any): Promise<[Error | null, T | null]> {
      return http.get<T>(url, params, config)
    },
    async post<T = any>(url: string, data?: any): Promise<[Error | null, T | null]> {
      return http.post<T>(url, data, config)
    },
    async put<T = any>(url: string, data?: any): Promise<[Error | null, T | null]> {
      return http.put<T>(url, data, config)
    },
    async delete<T = any>(url: string): Promise<[Error | null, T | null]> {
      return http.delete<T>(url, config)
    },
  }
}
```

#### 使用示例

```typescript
// 1. 基本用法
const [err, users] = await http.get<User[]>('/api/users')
if (err) {
  console.error('获取用户列表失败:', err)
  return
}
console.log('用户列表:', users)

// 2. 链式调用: 禁用认证 + 加密
const [err, token] = await http
  .noAuth()
  .encrypt()
  .post<LoginResult>('/api/login', { username, password })

// 3. 自定义超时
const [err, data] = await http
  .timeout(20000)
  .get<Data>('/api/data')

// 4. 禁用错误提示
const [err, result] = await http
  .noMsgError()
  .post('/api/action', data)

// 5. 组合使用
const [err, result] = await http
  .noAuth()
  .noRepeatSubmit()
  .noMsgError()
  .timeout(10000)
  .post('/api/public/submit', formData)
```

**优化特性:**

- **防重复提交**: 5秒内的重复请求自动拦截
- **请求ID追踪**: 每个请求自动生成唯一ID,便于日志追踪
- **错误统一处理**: 自动处理401、403、404、500等错误
- **数据加密**: 支持请求/响应数据加密
- **链式调用**: 支持灵活的配置组合

### 浏览器缓存优化

前端实现了完善的缓存系统,包括会话缓存(sessionStorage)和本地缓存(localStorage)。

#### 缓存工具类

```typescript
// cache.ts

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  APP_ID: 'ruoyi-plus',                    // 应用ID前缀
  LOCAL_CACHE_CLEANUP_INTERVAL: 3600000,  // 本地缓存清理间隔(1小时)
  DEFAULT_EXPIRE_TIME: 86400,             // 默认过期时间(24小时)
}

/**
 * 缓存包装器
 */
interface CacheWrapper<T> {
  value: T
  expireTime?: number  // 过期时间戳
}

/**
 * 会话缓存 (sessionStorage)
 */
export const sessionCache = {
  /**
   * 设置缓存
   */
  set(key: string, value: string): void {
    try {
      const fullKey = `${CACHE_CONFIG.APP_ID}:${key}`
      sessionStorage.setItem(fullKey, value)
    } catch (error) {
      console.error('设置会话缓存失败:', error)
    }
  },

  /**
   * 获取缓存
   */
  get(key: string): string | null {
    try {
      const fullKey = `${CACHE_CONFIG.APP_ID}:${key}`
      return sessionStorage.getItem(fullKey)
    } catch (error) {
      console.error('获取会话缓存失败:', error)
      return null
    }
  },

  /**
   * 设置JSON对象
   */
  setJSON<T = any>(key: string, value: T): void {
    this.set(key, JSON.stringify(value))
  },

  /**
   * 获取JSON对象
   */
  getJSON<T = any>(key: string): T | null {
    const value = this.get(key)
    if (!value) return null

    try {
      return JSON.parse(value) as T
    } catch (error) {
      console.error('解析JSON失败:', error)
      return null
    }
  },

  /**
   * 获取数字
   */
  getNumber(key: string): number | null {
    const value = this.get(key)
    if (!value) return null

    const num = Number(value)
    return isNaN(num) ? null : num
  },

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  },

  /**
   * 删除缓存
   */
  remove(key: string): void {
    try {
      const fullKey = `${CACHE_CONFIG.APP_ID}:${key}`
      sessionStorage.removeItem(fullKey)
    } catch (error) {
      console.error('删除会话缓存失败:', error)
    }
  },

  /**
   * 清除所有会话缓存
   */
  clearAll(): void {
    try {
      const prefix = `${CACHE_CONFIG.APP_ID}:`
      const keys = Object.keys(sessionStorage)

      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('清除会话缓存失败:', error)
    }
  },
}

/**
 * 本地缓存 (localStorage)
 */
export const localCache = {
  /**
   * 设置缓存 (支持过期时间)
   */
  set(key: string, value: string, expireSeconds?: number): void {
    try {
      const fullKey = `${CACHE_CONFIG.APP_ID}:${key}`
      const wrapper: CacheWrapper<string> = { value }

      if (expireSeconds) {
        wrapper.expireTime = Date.now() + expireSeconds * 1000
      }

      localStorage.setItem(fullKey, JSON.stringify(wrapper))
    } catch (error) {
      console.error('设置本地缓存失败:', error)
    }
  },

  /**
   * 获取缓存 (自动检查过期)
   */
  get(key: string): string | null {
    try {
      const fullKey = `${CACHE_CONFIG.APP_ID}:${key}`
      const item = localStorage.getItem(fullKey)

      if (!item) return null

      const wrapper: CacheWrapper<string> = JSON.parse(item)

      // 检查是否过期
      if (wrapper.expireTime && Date.now() > wrapper.expireTime) {
        this.remove(key)
        return null
      }

      return wrapper.value
    } catch (error) {
      console.error('获取本地缓存失败:', error)
      // 删除损坏的缓存
      this.remove(key)
      return null
    }
  },

  /**
   * 设置JSON对象
   */
  setJSON<T = any>(key: string, value: T, expireSeconds?: number): void {
    this.set(key, JSON.stringify(value), expireSeconds)
  },

  /**
   * 获取JSON对象
   */
  getJSON<T = any>(key: string): T | null {
    const value = this.get(key)
    if (!value) return null

    try {
      return JSON.parse(value) as T
    } catch (error) {
      console.error('解析JSON失败:', error)
      return null
    }
  },

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  },

  /**
   * 删除缓存
   */
  remove(key: string): void {
    try {
      const fullKey = `${CACHE_CONFIG.APP_ID}:${key}`
      localStorage.removeItem(fullKey)
    } catch (error) {
      console.error('删除本地缓存失败:', error)
    }
  },

  /**
   * 清除所有本地缓存
   */
  clearAll(): void {
    try {
      const prefix = `${CACHE_CONFIG.APP_ID}:`
      const keys = Object.keys(localStorage)

      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('清除本地缓存失败:', error)
    }
  },

  /**
   * 手动清理过期缓存
   */
  cleanup(): void {
    try {
      const prefix = `${CACHE_CONFIG.APP_ID}:`
      const keys = Object.keys(localStorage)

      keys.forEach((fullKey) => {
        if (!fullKey.startsWith(prefix)) return

        const item = localStorage.getItem(fullKey)
        if (!item) return

        try {
          const wrapper: CacheWrapper<any> = JSON.parse(item)

          // 删除过期缓存
          if (wrapper.expireTime && Date.now() > wrapper.expireTime) {
            localStorage.removeItem(fullKey)
          }
        } catch {
          // 删除损坏的缓存
          localStorage.removeItem(fullKey)
        }
      })
    } catch (error) {
      console.error('清理过期缓存失败:', error)
    }
  },

  /**
   * 获取缓存统计信息
   */
  getStats(): { totalKeys: number; appKeys: number; usagePercent: number } {
    try {
      const prefix = `${CACHE_CONFIG.APP_ID}:`
      const keys = Object.keys(localStorage)

      const totalKeys = keys.length
      const appKeys = keys.filter((key) => key.startsWith(prefix)).length

      // 计算占用空间 (粗略估算)
      let totalSize = 0
      keys.forEach((key) => {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
        }
      })

      // localStorage通常限制为5MB
      const usagePercent = (totalSize / (5 * 1024 * 1024)) * 100

      return {
        totalKeys,
        appKeys,
        usagePercent: Math.round(usagePercent * 100) / 100,
      }
    } catch (error) {
      console.error('获取缓存统计失败:', error)
      return { totalKeys: 0, appKeys: 0, usagePercent: 0 }
    }
  },
}

/**
 * 应用启动时清理过期缓存
 */
localCache.cleanup()

/**
 * 定时清理过期缓存 (每小时)
 */
setInterval(() => {
  localCache.cleanup()
}, CACHE_CONFIG.LOCAL_CACHE_CLEANUP_INTERVAL)
```

#### 使用示例

```typescript
// 1. 会话缓存 (页面关闭即清除)
sessionCache.set('currentTab', 'home')
const tab = sessionCache.get('currentTab')

// 存储对象
sessionCache.setJSON('userInfo', { id: 1, name: '张三' })
const userInfo = sessionCache.getJSON<User>('userInfo')

// 2. 本地缓存 (永久保存,除非手动删除或过期)
localCache.set('theme', 'dark')
const theme = localCache.get('theme')

// 设置过期时间: 7天后过期
localCache.set('token', 'abc123', 7 * 24 * 3600)

// 存储对象: 1小时后过期
localCache.setJSON('config', { lang: 'zh-CN' }, 3600)

// 3. 缓存管理
localCache.has('token')           // 检查是否存在
localCache.remove('token')        // 删除缓存
localCache.clearAll()             // 清除所有缓存
localCache.cleanup()              // 手动清理过期缓存

// 4. 缓存统计
const stats = localCache.getStats()
console.log('缓存统计:', stats)
// { totalKeys: 10, appKeys: 5, usagePercent: 1.2 }
```

**缓存策略:**

- **会话缓存**: 临时数据,页面关闭即清除(如当前Tab、表单状态)
- **本地缓存**: 持久数据,需手动删除或设置过期时间(如Token、主题配置)
- **自动过期**: 支持设置过期时间,过期自动删除
- **自动清理**: 每小时自动清理过期缓存,避免占用过多空间
- **命名空间**: 使用应用ID前缀,避免多应用冲突

## 移动端网络优化

### UniApp HTTP 请求封装

移动端使用 UniApp 原生 API 封装了完整的 HTTP 请求系统,支持防重复提交、应用初始化等待、数据加解密等功能。

#### useHttp Composable

```typescript
// useHttp.ts (移动端)
import type { UploadFileOption, RequestOptions, DownloadFileOption } from '@uni-helper/uni-app-types'

/**
 * 防重复提交管理 (移动端优化: 500ms防抖)
 */
interface SubmitInfo {
  key: string
  time: number
}

let lastSubmit: SubmitInfo | null = null

const checkRepeatSubmit = (url: string, data: any): boolean => {
  const key = `${url}-${JSON.stringify(data)}`
  const now = Date.now()

  if (lastSubmit && lastSubmit.key === key && now - lastSubmit.time < 500) {
    return false  // 重复提交
  }

  lastSubmit = { key, time: now }
  return true
}

/**
 * 应用初始化等待
 */
const waitForAppInit = async (timeout = 10000): Promise<boolean> => {
  const startTime = Date.now()

  // 等待租户ID初始化
  while (!uni.getStorageSync('tenantId')) {
    if (Date.now() - startTime > timeout) {
      return false  // 超时
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return true
}

/**
 * 请求配置
 */
interface HttpConfig {
  noAuth?: boolean           // 禁用认证
  encrypt?: boolean          // 启用加密
  noRepeatSubmit?: boolean   // 禁用防重复提交
  noTenant?: boolean         // 禁用租户信息
  skipWait?: boolean         // 跳过初始化等待
  noMsgError?: boolean       // 禁用错误提示
  timeout?: number           // 超时时间
}

/**
 * 构建请求
 */
async function buildRequest(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  config: HttpConfig = {}
): Promise<RequestOptions> {
  // 1. 等待应用初始化 (除非跳过)
  if (!config.skipWait) {
    const initialized = await waitForAppInit(config.timeout)
    if (!initialized) {
      throw new Error('应用初始化超时')
    }
  }

  // 2. URL处理
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`

  // 3. 请求头构建
  const header: Record<string, string> = {
    'Content-Type': 'application/json;charset=utf-8',
  }

  // 国际化语言头
  const locale = uni.getStorageSync('locale') || 'zh-CN'
  header['Accept-Language'] = locale

  // 请求ID生成
  const now = new Date()
  const requestId =
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}` +
    `${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}` +
    `${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}` +
    `${String(now.getMilliseconds()).padStart(3, '0')}`
  header['X-Request-Id'] = requestId

  // 认证处理
  if (!config.noAuth) {
    const token = uni.getStorageSync('token')
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
  }

  // 租户处理
  if (!config.noTenant) {
    const tenantId = uni.getStorageSync('tenantId')
    if (tenantId) {
      header['Tenant-Id'] = tenantId
    }
  }

  // 4. 防重复提交
  if (
    (method === 'POST' || method === 'PUT') &&
    !config.noRepeatSubmit
  ) {
    if (!checkRepeatSubmit(fullUrl, data)) {
      throw new Error('请勿重复提交')
    }
  }

  // 5. 参数处理
  let requestData = data
  let requestUrl = fullUrl

  if (method === 'GET' && data) {
    // GET请求参数拼接到URL
    const params = new URLSearchParams()
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        params.append(key, String(data[key]))
      }
    }
    requestUrl = `${fullUrl}?${params.toString()}`
    requestData = undefined
  }

  // 6. 加密处理
  if (config.encrypt && requestData) {
    requestData = encrypt(requestData)
  }

  return {
    url: requestUrl,
    method,
    header,
    data: requestData,
    timeout: config.timeout || 30000,
  }
}

/**
 * 响应处理
 */
function handleResponse(response: any, config: HttpConfig = {}): any {
  // 1. 解密处理
  if (response.header?.encrypt === 'true') {
    response.data = decrypt(response.data)
  }

  // 2. 二进制数据识别
  const contentType = response.header?.['content-type'] || ''
  if (
    contentType.includes('image/') ||
    contentType.includes('video/') ||
    contentType.includes('audio/') ||
    contentType.includes('application/pdf')
  ) {
    return response  // 返回完整响应
  }

  // 3. 业务状态码处理
  const { code, msg, data } = response.data

  if (code === 200) {
    return data
  }

  // 未授权
  if (code === 401) {
    if (!config.noMsgError) {
      uni.showToast({ title: '登录已过期', icon: 'none' })
    }
    // 跳转到登录页
    uni.reLaunch({ url: '/pages/login/index' })
    throw new Error(msg)
  }

  // 其他错误
  if (!config.noMsgError) {
    uni.showToast({ title: msg || '请求失败', icon: 'none' })
  }
  throw new Error(msg)
}

/**
 * 错误处理
 */
function handleError(error: any, config: HttpConfig = {}): never {
  let message = '请求失败'

  if (error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      message = '请求超时'
    } else if (error.errMsg.includes('fail')) {
      message = '网络错误'
    }
  } else if (error.message === '应用初始化超时') {
    message = error.message
  } else if (error.message === '请勿重复提交') {
    message = error.message
  }

  if (!config.noMsgError) {
    uni.showToast({ title: message, icon: 'none' })
  }

  throw error
}

/**
 * 数据加密 (示例)
 */
function encrypt(data: any): string {
  // 实际项目中使用 AES/RSA 等加密算法
  return btoa(JSON.stringify(data))
}

/**
 * 数据解密 (示例)
 */
function decrypt(data: string): any {
  // 实际项目中使用对应的解密算法
  return JSON.parse(atob(data))
}

/**
 * HTTP 请求封装
 */
export const http = {
  /**
   * GET 请求
   */
  async get<T = any>(
    url: string,
    data?: any,
    config?: HttpConfig
  ): Promise<[Error | null, T | null]> {
    try {
      const requestConfig = await buildRequest(url, 'GET', data, config)

      const response: any = await new Promise((resolve, reject) => {
        uni.request({
          ...requestConfig,
          success: resolve,
          fail: reject,
        })
      })

      const result = handleResponse(response, config)
      return [null, result]
    } catch (error) {
      handleError(error, config)
      return [error as Error, null]
    }
  },

  /**
   * POST 请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: HttpConfig
  ): Promise<[Error | null, T | null]> {
    try {
      const requestConfig = await buildRequest(url, 'POST', data, config)

      const response: any = await new Promise((resolve, reject) => {
        uni.request({
          ...requestConfig,
          success: resolve,
          fail: reject,
        })
      })

      const result = handleResponse(response, config)
      return [null, result]
    } catch (error) {
      handleError(error, config)
      return [error as Error, null]
    }
  },

  /**
   * PUT 请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: HttpConfig
  ): Promise<[Error | null, T | null]> {
    try {
      const requestConfig = await buildRequest(url, 'PUT', data, config)

      const response: any = await new Promise((resolve, reject) => {
        uni.request({
          ...requestConfig,
          success: resolve,
          fail: reject,
        })
      })

      const result = handleResponse(response, config)
      return [null, result]
    } catch (error) {
      handleError(error, config)
      return [error as Error, null]
    }
  },

  /**
   * DELETE 请求
   */
  async delete<T = any>(
    url: string,
    config?: HttpConfig
  ): Promise<[Error | null, T | null]> {
    try {
      const requestConfig = await buildRequest(url, 'DELETE', undefined, config)

      const response: any = await new Promise((resolve, reject) => {
        uni.request({
          ...requestConfig,
          success: resolve,
          fail: reject,
        })
      })

      const result = handleResponse(response, config)
      return [null, result]
    } catch (error) {
      handleError(error, config)
      return [error as Error, null]
    }
  },

  /**
   * 文件上传
   */
  async upload<T = any>(options: {
    url: string
    filePath: string
    name?: string
    formData?: Record<string, any>
    header?: Record<string, string>
  }): Promise<[Error | null, T | null]> {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL
      const fullUrl = options.url.startsWith('http')
        ? options.url
        : `${baseURL}${options.url}`

      // 构建请求头
      const header: Record<string, string> = {
        ...options.header,
      }

      // 认证处理
      const token = uni.getStorageSync('token')
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      // 租户处理
      const tenantId = uni.getStorageSync('tenantId')
      if (tenantId) {
        header['Tenant-Id'] = tenantId
      }

      const response: any = await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: fullUrl,
          filePath: options.filePath,
          name: options.name || 'file',
          formData: options.formData,
          header,
          success: resolve,
          fail: reject,
        })
      })

      // 解析响应
      const data = JSON.parse(response.data)
      if (data.code === 200) {
        return [null, data.data]
      } else {
        throw new Error(data.msg || '上传失败')
      }
    } catch (error) {
      uni.showToast({ title: '上传失败', icon: 'none' })
      return [error as Error, null]
    }
  },

  /**
   * 文件下载
   */
  async download(options: {
    url: string
    filePath?: string
  }): Promise<[Error | null, { tempFilePath: string } | null]> {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL
      const fullUrl = options.url.startsWith('http')
        ? options.url
        : `${baseURL}${options.url}`

      // 构建请求头
      const header: Record<string, string> = {}

      // 认证处理
      const token = uni.getStorageSync('token')
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      const response: any = await new Promise((resolve, reject) => {
        uni.downloadFile({
          url: fullUrl,
          filePath: options.filePath,
          header,
          success: resolve,
          fail: reject,
        })
      })

      return [null, { tempFilePath: response.tempFilePath }]
    } catch (error) {
      uni.showToast({ title: '下载失败', icon: 'none' })
      return [error as Error, null]
    }
  },

  /**
   * 链式调用
   */
  noAuth() {
    return createChainableHttp({ noAuth: true })
  },
  encrypt() {
    return createChainableHttp({ encrypt: true })
  },
  noRepeatSubmit() {
    return createChainableHttp({ noRepeatSubmit: true })
  },
  noTenant() {
    return createChainableHttp({ noTenant: true })
  },
  skipWait() {
    return createChainableHttp({ skipWait: true })
  },
  noMsgError() {
    return createChainableHttp({ noMsgError: true })
  },
  timeout(ms: number) {
    return createChainableHttp({ timeout: ms })
  },
}

/**
 * 创建可链式调用的HTTP对象
 */
function createChainableHttp(defaultConfig: HttpConfig) {
  const config: HttpConfig = { ...defaultConfig }

  return {
    ...http,
    noAuth() {
      config.noAuth = true
      return this
    },
    encrypt() {
      config.encrypt = true
      return this
    },
    noRepeatSubmit() {
      config.noRepeatSubmit = true
      return this
    },
    noTenant() {
      config.noTenant = true
      return this
    },
    skipWait() {
      config.skipWait = true
      return this
    },
    noMsgError() {
      config.noMsgError = true
      return this
    },
    timeout(ms: number) {
      config.timeout = ms
      return this
    },
    async get<T = any>(url: string, data?: any): Promise<[Error | null, T | null]> {
      return http.get<T>(url, data, config)
    },
    async post<T = any>(url: string, data?: any): Promise<[Error | null, T | null]> {
      return http.post<T>(url, data, config)
    },
    async put<T = any>(url: string, data?: any): Promise<[Error | null, T | null]> {
      return http.put<T>(url, data, config)
    },
    async delete<T = any>(url: string): Promise<[Error | null, T | null]> {
      return http.delete<T>(url, config)
    },
  }
}
```

#### 使用示例

```typescript
// 1. 直接返回数据
const [err, users] = await http.get<User[]>('/api/users')
if (err) {
  console.error('获取用户列表失败:', err)
  return
}
console.log('用户列表:', users)

// 2. 链式调用: 禁用认证 + 加密 + 跳过等待
const [err, token] = await http
  .noAuth()
  .encrypt()
  .skipWait()
  .post<LoginResult>('/api/login', { username, password })

// 3. 设置超时
const [err, captcha] = await http
  .timeout(20000)
  .get<CaptchaVo>('/auth/imgCode')

// 4. 文件上传
uni.chooseImage({
  count: 1,
  success: async (res) => {
    const tempFilePath = res.tempFilePaths[0]

    const [err, result] = await http.upload<UploadResult>({
      url: '/api/upload',
      filePath: tempFilePath,
      name: 'file',
      formData: { type: 'avatar' },
    })

    if (!err) {
      console.log('上传成功:', result)
    }
  },
})

// 5. 文件下载
const [err, downloadResult] = await http.download({
  url: '/api/download/file.pdf',
  filePath: `${wx.env.USER_DATA_PATH}/file.pdf`,
})

if (!err) {
  console.log('下载成功:', downloadResult.tempFilePath)
}
```

**移动端优化特性:**

- **防重复提交**: 500毫秒防抖(比前端更短,适合移动端快速操作)
- **应用初始化等待**: 确保租户ID等必要信息已初始化后再发送请求
- **二进制数据识别**: 自动识别图片、视频、音频、PDF等二进制数据
- **文件上传/下载**: 完整的文件传输支持
- **链式调用**: 灵活的配置组合

## 性能监控与最佳实践

### 性能监控指标

#### 后端性能指标

```yaml
# 推荐性能目标

# 1. 响应时间
- API响应时间 (P50): < 100ms
- API响应时间 (P95): < 500ms
- API响应时间 (P99): < 1000ms

# 2. 并发性能
- 单实例QPS: > 1000
- 集群QPS: > 10000
- 并发连接数: > 256

# 3. 资源占用
- CPU使用率: < 70%
- 内存使用率: < 80%
- 网络带宽使用率: < 80%

# 4. 缓存性能
- Redis命中率: > 90%
- Caffeine命中率: > 80%
- 缓存响应时间: < 10ms

# 5. 数据库性能
- SQL查询时间 (P95): < 100ms
- 慢查询占比: < 1%
- 连接池利用率: 30%-70%
```

#### 前端性能指标

```yaml
# 推荐性能目标

# 1. 加载性能
- 首屏加载时间 (FCP): < 1.5s
- 页面完全加载时间 (LCP): < 2.5s
- 首次可交互时间 (TTI): < 3.5s

# 2. 交互性能
- 首次输入延迟 (FID): < 100ms
- 累计布局偏移 (CLS): < 0.1
- 页面切换时间: < 300ms

# 3. 资源优化
- JS bundle大小: < 500KB (gzip后)
- CSS bundle大小: < 100KB (gzip后)
- 图片总大小: < 2MB
- 静态资源缓存命中率: > 90%

# 4. 网络性能
- API请求时间 (P50): < 200ms
- API请求时间 (P95): < 1000ms
- 并发请求数: < 6
```

#### 移动端性能指标

```yaml
# 推荐性能目标

# 1. 启动性能
- 冷启动时间: < 3s
- 热启动时间: < 1s
- 首屏渲染时间: < 2s

# 2. 交互性能
- 页面切换时间: < 300ms
- 滚动帧率: > 55 FPS
- 动画帧率: > 55 FPS

# 3. 网络性能
- API请求时间 (P50): < 300ms
- API请求时间 (P95): < 1500ms
- 离线缓存命中率: > 80%

# 4. 资源占用
- 内存占用: < 150MB
- 包大小: < 10MB
- 图片缓存大小: < 50MB
```

### 网络优化最佳实践

#### 1. 请求优化

```typescript
// ❌ 错误示例: 串行请求
async function loadUserData() {
  const user = await getUser()
  const orders = await getOrders(user.id)
  const addresses = await getAddresses(user.id)
  return { user, orders, addresses }
}

// ✅ 正确示例: 并行请求
async function loadUserData() {
  const [user, orders, addresses] = await Promise.all([
    getUser(),
    getOrders(),
    getAddresses(),
  ])
  return { user, orders, addresses }
}

// ✅ 更好示例: 批量请求
async function loadUserData() {
  // 后端提供批量查询接口
  const data = await getBatchUserData({
    includeOrders: true,
    includeAddresses: true,
  })
  return data
}
```

#### 2. 缓存策略

```typescript
// ✅ 分层缓存策略
class DataService {
  private memoryCache = new Map<string, any>()       // L1: 内存缓存
  private localCache = localCache                    // L2: localStorage
  private redisCache = await useRedis()              // L3: Redis缓存

  async getData(key: string): Promise<any> {
    // 1. 查询内存缓存
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)
    }

    // 2. 查询本地缓存
    const localData = this.localCache.get(key)
    if (localData) {
      this.memoryCache.set(key, localData)
      return localData
    }

    // 3. 查询Redis缓存
    const redisData = await this.redisCache.get(key)
    if (redisData) {
      this.localCache.set(key, redisData, 300)  // 5分钟
      this.memoryCache.set(key, redisData)
      return redisData
    }

    // 4. 查询数据库
    const dbData = await this.queryFromDatabase(key)

    // 5. 写入缓存
    this.memoryCache.set(key, dbData)
    this.localCache.set(key, dbData, 300)
    await this.redisCache.set(key, dbData, 1800)  // 30分钟

    return dbData
  }
}
```

#### 3. 连接池配置

```yaml
# ❌ 错误配置: 连接池过小
spring:
  datasource:
    hikari:
      minimum-idle: 5
      maximum-pool-size: 10

# ✅ 正确配置: 根据并发量调整
spring:
  datasource:
    hikari:
      minimum-idle: 10              # 最小空闲连接
      maximum-pool-size: 30         # 最大连接数
      connection-timeout: 30000     # 连接超时(30秒)
      idle-timeout: 600000          # 空闲超时(10分钟)
      max-lifetime: 1800000         # 最大生命周期(30分钟)

# ✅ Redis连接池配置
redisson:
  clusterServersConfig:
    masterConnectionPoolSize: 64
    slaveConnectionPoolSize: 64
    masterConnectionMinimumIdleSize: 32
    slaveConnectionMinimumIdleSize: 32
```

#### 4. 限流和熔断

```java
// ✅ 组合使用限流和熔断
@RestController
public class OrderController {

    /**
     * 限流 + 熔断 + 降级
     */
    @PostMapping("/order/submit")
    @RateLimiter(time = 60, count = 100)              // 限流: 60秒100次
    @SentinelResource(                                 // 熔断
        value = "submitOrder",
        blockHandler = "submitOrderBlockHandler",      // 限流降级
        fallback = "submitOrderFallback"               // 异常降级
    )
    public R<OrderVo> submitOrder(@RequestBody OrderDto order) {
        return R.ok(orderService.submitOrder(order));
    }

    /**
     * 限流降级处理
     */
    public R<OrderVo> submitOrderBlockHandler(OrderDto order, BlockException e) {
        log.warn("提交订单被限流: {}", e.getMessage());
        return R.fail("当前提交人数过多,请稍后再试");
    }

    /**
     * 异常降级处理
     */
    public R<OrderVo> submitOrderFallback(OrderDto order, Throwable e) {
        log.error("提交订单异常: {}", e.getMessage());
        return R.fail("订单提交失败,请重试");
    }
}
```

#### 5. 压缩和优化

```yaml
# 应用配置
server:
  # 启用Gzip压缩
  compression:
    enabled: true
    mime-types:
      - text/html
      - text/xml
      - text/plain
      - text/css
      - text/javascript
      - application/javascript
      - application/json
      - application/xml
    min-response-size: 1024        # 最小压缩大小(1KB)

spring:
  # Jackson序列化优化
  jackson:
    default-property-inclusion: non_null   # 忽略null字段
    date-format: yyyy-MM-dd HH:mm:ss      # 日期格式
    time-zone: GMT+8                       # 时区
```

```typescript
// 前端: Vite打包优化
// vite.config.ts
export default defineConfig({
  build: {
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'utils': ['axios', 'dayjs'],
        },
      },
    },

    // 代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,     // 移除console
        drop_debugger: true,    // 移除debugger
      },
    },

    // 资源压缩
    assetsInlineLimit: 4096,   // 小于4KB的资源内联

    // CSS代码分割
    cssCodeSplit: true,
  },
})
```

### 性能测试工具

#### 后端性能测试

```bash
# 1. JMeter 压力测试
# 测试目标: 1000并发,持续10分钟

# 2. ab (Apache Bench)
ab -n 10000 -c 100 http://localhost:5503/api/users

# 3. wrk
wrk -t 12 -c 400 -d 30s http://localhost:5503/api/users

# 4. JProfiler / VisualVM
# 监控CPU、内存、线程、GC等
```

#### 前端性能测试

```bash
# 1. Lighthouse
lighthouse https://your-site.com --view

# 2. WebPageTest
# https://www.webpagetest.org/

# 3. Chrome DevTools
# Performance面板、Network面板、Coverage面板

# 4. Bundle Analyzer
npm run build -- --report
```

## 常见问题

### 1. 请求超时如何处理?

**问题原因:**
- 网络延迟高
- 服务端处理慢
- 超时时间设置过短

**解决方案:**

```typescript
// 前端: 增加超时时间
const [err, data] = await http.timeout(60000).get('/api/slow-api')

// 后端: 优化慢查询
// 1. 添加数据库索引
CREATE INDEX idx_user_name ON sys_user(user_name);

// 2. 分页查询大数据量
Page<User> page = PageQuery.build(pageQuery);
userMapper.selectPageUserList(page, user);

// 3. 异步处理
@Async
public CompletableFuture<Result> processSlowTask() {
    // 耗时任务异步处理
    return CompletableFuture.completedFuture(result);
}
```

### 2. 如何防止接口被刷?

**问题原因:**
- 恶意用户高频请求
- 爬虫攻击
- 缺少限流机制

**解决方案:**

```java
// 1. IP限流
@RateLimiter(time = 60, count = 10, limitType = LimitType.IP)
public R<String> sendSms(@RequestParam String phone) {
    return R.ok(smsService.sendCode(phone));
}

// 2. 用户限流
@RateLimiter(
    key = "#userId",
    time = 60,
    count = 5
)
public R<String> transfer(String userId, BigDecimal amount) {
    return R.ok(transferService.transfer(userId, amount));
}

// 3. 验证码验证
@PostMapping("/login")
public R<LoginResult> login(@RequestBody LoginDto loginDto) {
    // 验证验证码
    if (!captchaService.verify(loginDto.getCaptchaKey(), loginDto.getCaptchaCode())) {
        return R.fail("验证码错误");
    }

    return R.ok(authService.login(loginDto));
}
```

### 3. 大文件上传如何优化?

**问题原因:**
- 文件过大导致上传慢
- 网络不稳定导致上传失败
- 缺少断点续传

**解决方案:**

```typescript
// 前端: 分片上传
async function uploadLargeFile(file: File) {
  const CHUNK_SIZE = 5 * 1024 * 1024  // 5MB一片
  const chunks = Math.ceil(file.size / CHUNK_SIZE)

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    // 上传分片
    await http.upload({
      url: '/api/upload/chunk',
      filePath: chunk,
      formData: {
        fileName: file.name,
        chunkIndex: i,
        totalChunks: chunks,
      },
    })
  }

  // 合并分片
  await http.post('/api/upload/merge', {
    fileName: file.name,
    totalChunks: chunks,
  })
}
```

```java
// 后端: 处理分片上传
@PostMapping("/upload/chunk")
public R<Void> uploadChunk(
    @RequestParam("file") MultipartFile file,
    @RequestParam("fileName") String fileName,
    @RequestParam("chunkIndex") int chunkIndex,
    @RequestParam("totalChunks") int totalChunks
) {
    // 保存分片到临时目录
    String tempDir = "/temp/upload/" + fileName;
    File chunkFile = new File(tempDir, "chunk_" + chunkIndex);
    file.transferTo(chunkFile);

    return R.ok();
}

@PostMapping("/upload/merge")
public R<String> mergeChunks(
    @RequestBody MergeChunksDto dto
) {
    // 合并分片
    String tempDir = "/temp/upload/" + dto.getFileName();
    File outputFile = new File("/upload/" + dto.getFileName());

    try (FileOutputStream fos = new FileOutputStream(outputFile)) {
        for (int i = 0; i < dto.getTotalChunks(); i++) {
            File chunkFile = new File(tempDir, "chunk_" + i);
            Files.copy(chunkFile.toPath(), fos);
        }
    }

    // 删除临时文件
    FileUtils.deleteDirectory(new File(tempDir));

    return R.ok(outputFile.getAbsolutePath());
}
```

### 4. Redis 连接池耗尽如何处理?

**问题原因:**
- 连接池配置过小
- 连接泄漏(未释放)
- 并发量过高

**解决方案:**

```yaml
# 1. 增大连接池
redisson:
  clusterServersConfig:
    # 增大连接池大小
    masterConnectionPoolSize: 128
    slaveConnectionPoolSize: 128
    masterConnectionMinimumIdleSize: 64
    slaveConnectionMinimumIdleSize: 64

    # 增加超时时间
    idleConnectionTimeout: 30000
    timeout: 5000

# 2. 监控连接池状态
management:
  endpoints:
    web:
      exposure:
        include: metrics,health
  metrics:
    enable:
      redisson: true
```

```java
// 3. 正确使用Redis客户端
@Service
public class UserService {

    @Autowired
    private RedissonClient redissonClient;

    // ❌ 错误: 不释放锁
    public void wrongMethod() {
        RLock lock = redissonClient.getLock("key");
        lock.lock();
        // 业务逻辑
        // 忘记释放锁!
    }

    // ✅ 正确: 自动释放锁
    public void correctMethod() {
        RLock lock = redissonClient.getLock("key");
        try {
            lock.lock();
            // 业务逻辑
        } finally {
            lock.unlock();
        }
    }

    // ✅ 更好: 使用try-with-resources
    public void betterMethod() {
        RLock lock = redissonClient.getLock("key");
        lock.lock(10, TimeUnit.SECONDS);  // 10秒后自动释放
        try {
            // 业务逻辑
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### 5. 前端请求被拦截(CORS)如何解决?

**问题原因:**
- 跨域请求被浏览器拦截
- 后端未配置CORS
- 请求头不符合CORS规范

**解决方案:**

```java
// 后端: 配置CORS
@Configuration
public class CorsConfiguration {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 允许的来源
        config.addAllowedOriginPattern("*");

        // 允许的请求头
        config.addAllowedHeader("*");

        // 允许的HTTP方法
        config.addAllowedMethod("*");

        // 允许携带凭证
        config.setAllowCredentials(true);

        // 预检请求缓存时间(1小时)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
```

```typescript
// 前端: 开发环境代理
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5503',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### 6. WebSocket 连接频繁断开如何处理?

**问题原因:**
- 网络不稳定
- 服务端超时配置过短
- 缺少心跳机制

**解决方案:**

```typescript
// 前端: WebSocket 重连机制
class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private reconnectCount = 0
  private readonly MAX_RECONNECT = 5

  connect(url: string) {
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log('WebSocket连接成功')
      this.reconnectCount = 0
      this.startHeartbeat()
    }

    this.ws.onclose = () => {
      console.log('WebSocket连接关闭')
      this.stopHeartbeat()
      this.reconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
    }

    this.ws.onmessage = (event) => {
      // 处理消息
      this.handleMessage(event.data)
    }
  }

  /**
   * 重连
   */
  private reconnect() {
    if (this.reconnectCount >= this.MAX_RECONNECT) {
      console.error('WebSocket重连次数超过限制')
      return
    }

    this.reconnectTimer = window.setTimeout(() => {
      console.log(`WebSocket重连 (${this.reconnectCount + 1}/${this.MAX_RECONNECT})`)
      this.reconnectCount++
      this.connect(this.ws!.url)
    }, 3000)
  }

  /**
   * 心跳
   */
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)  // 每30秒发送一次心跳
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 发送消息
   */
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  /**
   * 关闭连接
   */
  close() {
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.ws?.close()
  }
}
```

```java
// 后端: 增加超时时间
@Bean
public ServletServerContainerFactoryBean createWebSocketContainer() {
    ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();

    // 会话超时时间: 1小时
    container.setMaxSessionIdleTimeout(60 * 60 * 1000L);

    return container;
}
```

## 总结

网络性能优化是全栈应用的核心优化方向,RuoYi-Plus-UniApp 项目通过系统化的优化策略实现了高性能、高可用的网络体系:

**后端优化:**
- HTTP 客户端优化(Forest + Jackson)
- 限流控制(Redis 令牌桶)
- 多级缓存(Caffeine + Redis)
- 连接池优化(Redisson、HikariCP)
- 防重复提交(Redis 分布式锁)
- Web 服务器优化(Undertow + 虚拟线程)
- 长连接管理(WebSocket、SSE)

**前端优化:**
- HTTP 请求封装(Axios)
- 请求拦截和响应处理
- 防重复提交(5秒防抖)
- 请求链路追踪
- 浏览器缓存优化

**移动端优化:**
- HTTP 请求封装(UniApp)
- 防重复提交(500ms防抖)
- 应用初始化等待
- 文件上传下载优化

通过合理配置和使用这些优化策略,可以实现:
- **高性能**: API 响应时间 P95 < 500ms,QPS > 10000
- **高并发**: 支持256+并发连接,虚拟线程支持百万级连接
- **高可用**: 限流、熔断、降级,故障自动恢复
- **好体验**: 首屏加载 < 2s,页面切换 < 300ms

持续监控性能指标,根据实际情况调整配置,是保持系统高性能的关键。
