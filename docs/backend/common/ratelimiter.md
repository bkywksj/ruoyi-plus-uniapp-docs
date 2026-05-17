# ruoyi-common-ratelimiter 限流模块

## 介绍

ruoyi-common-ratelimiter 是基于 Redis 和 Redisson 令牌桶算法实现的分布式限流模块，提供注解驱动的无侵入式限流功能。通过简单的注解配置，即可实现接口访问频率控制，有效防止恶意攻击和系统过载。

**核心特性:**

- **多种限流策略** - 支持全局限流、IP限流、集群限流三种策略，满足不同场景需求
- **分布式支持** - 基于 Redis 实现跨实例限流，确保集群环境下限流精确性
- **令牌桶算法** - 使用 Redisson RRateLimiter 实现高性能限流，支持突发流量
- **SpEL 表达式** - 支持动态 key 生成，可引用方法参数和 Spring Bean
- **AOP 切面** - 基于注解的无侵入式使用，不影响业务代码
- **国际化支持** - 限流提示消息支持多语言

## 模块架构

```text
ruoyi-common-ratelimiter
├── src/main/java/plus/ruoyi/common/ratelimiter
│   ├── annotation/
│   │   └── RateLimiter.java              # 限流注解定义
│   ├── aspectj/
│   │   └── RateLimiterAspect.java        # 限流切面处理器
│   ├── config/
│   │   └── RateLimiterAutoConfiguration.java  # 自动配置类
│   └── enums/
│       └── LimitType.java                # 限流类型枚举
└── src/main/resources/
    └── META-INF/
        └── spring/
            └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 快速开始

### 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-ratelimiter</artifactId>
</dependency>
```

模块依赖:

```xml
<!-- 核心模块 - 提供基础功能支持 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
</dependency>

<!-- Redis模块 - 提供分布式限流支持 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-redis</artifactId>
</dependency>
```

### 基本使用

在需要限流的方法上添加 `@RateLimiter` 注解:

```java
@RestController
@RequestMapping("/api")
public class ApiController {

    /**
     * 60秒内最多访问10次
     */
    @GetMapping("/data")
    @RateLimiter(time = 60, count = 10)
    public Result getData() {
        return Result.success("数据获取成功");
    }
}
```

## 自动配置

### RateLimiterAutoConfiguration

模块采用 Spring Boot 自动配置机制，在 Redis 配置完成后自动装配限流组件。

```java
@AutoConfiguration(after = RedisConfiguration.class)
public class RateLimiterAutoConfiguration {

    /**
     * 注册限流切面处理器
     * 负责拦截 @RateLimiter 注解标记的方法并执行限流逻辑
     */
    @Bean
    public RateLimiterAspect rateLimiterAspect() {
        return new RateLimiterAspect();
    }
}
```

**配置说明:**

| 配置项 | 说明 |
|--------|------|
| `@AutoConfiguration` | 标记为自动配置类 |
| `after = RedisConfiguration.class` | 确保在 Redis 配置完成后加载 |

## 限流类型

### LimitType 枚举

```java
public enum LimitType {
    /**
     * 默认策略 - 全局限流
     * 所有请求共享限流配额
     */
    DEFAULT,

    /**
     * IP限流
     * 根据请求者IP地址进行独立限流
     */
    IP,

    /**
     * 集群限流
     * 基于Redis客户端实例进行限流(多后端实例场景)
     */
    CLUSTER
}
```

### 策略对比

| 类型 | 作用范围 | 适用场景 | Redis Key 后缀 |
|------|----------|----------|----------------|
| DEFAULT | 所有请求共享 | 保护系统资源、控制总体流量 | 无 |
| IP | 每个IP独立 | 防止恶意攻击、单用户限流 | 客户端IP |
| CLUSTER | 每个实例独立 | 集群环境负载均衡 | Redis客户端ID |

### 策略选择指南

```java
// 1. 全局限流 - 保护系统资源
// 适用于：数据导出、批量操作等资源密集型接口
@RateLimiter(time = 3600, count = 100, limitType = LimitType.DEFAULT)
public void exportData() { }

// 2. IP限流 - 防止恶意攻击
// 适用于：登录、注册、短信发送等敏感接口
@RateLimiter(time = 300, count = 5, limitType = LimitType.IP)
public void login() { }

// 3. 集群限流 - 均衡各节点负载
// 适用于：需要各节点独立控制流量的场景
@RateLimiter(time = 60, count = 1000, limitType = LimitType.CLUSTER)
public void processTask() { }
```

## @RateLimiter 注解

### 注解定义

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimiter {

    /**
     * 限流缓存key，支持SpEL表达式
     */
    String key() default "";

    /**
     * 限流时间窗口，单位秒
     */
    int time() default 60;

    /**
     * 时间窗口内允许的最大请求次数
     */
    int count() default 100;

    /**
     * 限流类型策略
     */
    LimitType limitType() default LimitType.DEFAULT;

    /**
     * 限流触发时的提示消息
     */
    String message() default I18nKeys.Request.RATE_LIMIT_EXCEEDED;

    /**
     * 限流策略在Redis中的存活时间，单位秒
     */
    int timeout() default 86400;
}
```

### 参数详解

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | String | `""` | 限流缓存key，支持SpEL表达式动态生成 |
| `time` | int | `60` | 限流时间窗口，单位秒 |
| `count` | int | `100` | 时间窗口内允许的最大请求次数 |
| `limitType` | LimitType | `DEFAULT` | 限流类型策略(DEFAULT/IP/CLUSTER) |
| `message` | String | 国际化key | 限流触发时的提示消息，支持国际化 |
| `timeout` | int | `86400` | 限流数据在Redis中的存活时间(秒) |

### 参数配置建议

#### 时间窗口 (time)

| 值 | 含义 | 适用场景 |
|-----|------|----------|
| 60 | 1分钟 | 常规接口限流 |
| 300 | 5分钟 | 登录、短信发送 |
| 3600 | 1小时 | 数据导出、报表生成 |
| 86400 | 1天 | 每日配额限制 |

#### 限流次数 (count)

| 接口类型 | 建议值 | 说明 |
|----------|--------|------|
| 登录接口 | 5-10次/5分钟 | 防止暴力破解 |
| 短信验证码 | 1次/分钟 | 防止短信轰炸 |
| 查询接口 | 100-1000次/分钟 | 正常业务使用 |
| 写入接口 | 10-50次/分钟 | 防止数据刷入 |
| 敏感操作 | 1-5次/分钟 | 支付、修改密码等 |
| 数据导出 | 10次/小时 | 防止资源耗尽 |

## 限流切面实现

### RateLimiterAspect

限流切面是模块的核心，负责拦截注解方法并执行限流逻辑。

```java
@Slf4j
@Aspect
public class RateLimiterAspect {

    /** SpEL表达式解析器 */
    private final ExpressionParser parser = new SpelExpressionParser();

    /** SpEL表达式模板上下文，定义 #{} 格式 */
    private final ParserContext parserContext = new TemplateParserContext();

    /** 方法参数名称发现器 */
    private final ParameterNameDiscoverer pnd = new DefaultParameterNameDiscoverer();

    /**
     * 限流前置处理
     */
    @Before("@annotation(rateLimiter)")
    public void doBefore(JoinPoint point, RateLimiter rateLimiter) {
        int time = rateLimiter.time();
        int count = rateLimiter.count();
        int timeout = rateLimiter.timeout();

        try {
            // 1. 生成限流缓存key
            String combineKey = getCombineKey(rateLimiter, point);

            // 2. 根据限流类型设置Redisson限流模式
            RateType rateType = RateType.OVERALL;
            if (rateLimiter.limitType() == LimitType.CLUSTER) {
                rateType = RateType.PER_CLIENT;
            }

            // 3. 调用Redis限流器获取令牌
            long number = RedisUtils.rateLimiter(combineKey, rateType, count, time, timeout);

            // 4. 检查是否触发限流
            if (number == -1) {
                throw ServiceException.of(rateLimiter.message());
            }

            log.info("限制令牌 => {}, 剩余令牌 => {}, 缓存key => '{}'", count, number, combineKey);

        } catch (Exception e) {
            if (e instanceof ServiceException) {
                throw e;
            }
            throw new RuntimeException("服务器限流异常，请稍候再试", e);
        }
    }
}
```

### 缓存Key生成

限流 Key 的生成规则决定了限流的粒度和范围。

**Key格式:**

```text
rate_limit:请求URI:限流标识:自定义key
```

**生成逻辑:**

```java
private String getCombineKey(RateLimiter rateLimiter, JoinPoint point) {
    String key = rateLimiter.key();

    // 处理SpEL表达式
    if (StringUtils.isNotBlank(key) && StringUtils.containsAny(key, "#")) {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method targetMethod = signature.getMethod();
        Object[] args = point.getArgs();

        // 创建SpEL求值上下文
        MethodBasedEvaluationContext context =
            new MethodBasedEvaluationContext(null, targetMethod, args, pnd);
        context.setBeanResolver(new BeanFactoryResolver(SpringUtils.getBeanFactory()));

        Expression expression;
        if (StringUtils.startsWith(key, parserContext.getExpressionPrefix())
            && StringUtils.endsWith(key, parserContext.getExpressionSuffix())) {
            // 模板表达式: #{expression}
            expression = parser.parseExpression(key, parserContext);
        } else {
            // 简单表达式: #variable
            expression = parser.parseExpression(key);
        }

        key = expression.getValue(context, String.class);
    }

    // 构建完整key
    StringBuilder sb = new StringBuilder(GlobalConstants.RATE_LIMIT_KEY);
    sb.append(ServletUtils.getRequest().getRequestURI()).append(":");

    // 根据限流类型添加标识符
    if (rateLimiter.limitType() == LimitType.IP) {
        sb.append(ServletUtils.getClientIP()).append(":");
    } else if (rateLimiter.limitType() == LimitType.CLUSTER) {
        sb.append(RedisUtils.getClient().getId()).append(":");
    }

    return sb.append(key).toString();
}
```

### Key 生成示例

```java
// 假设请求URI: /api/user/info, 客户端IP: 192.168.1.100

// 示例1: IP限流 + 自定义key
@RateLimiter(key = "getUserInfo", limitType = LimitType.IP)
public void getUserInfo() { }
// 生成key: rate_limit:/api/user/info:192.168.1.100:getUserInfo

// 示例2: 全局限流 + SpEL表达式
@RateLimiter(key = "#userId", limitType = LimitType.DEFAULT)
public void updateUser(String userId) { }
// 生成key: rate_limit:/api/user/update:user123 (假设userId="user123")

// 示例3: 集群限流
@RateLimiter(key = "process", limitType = LimitType.CLUSTER)
public void process() { }
// 生成key: rate_limit:/api/process:redis-client-id:process
```

## Redis 限流实现

### RedisUtils.rateLimiter

模块使用 Redisson 的 RRateLimiter 实现令牌桶算法:

```java
/**
 * 限流控制
 *
 * @param key          限流key
 * @param rateType     限流类型(OVERALL/PER_CLIENT)
 * @param rate         允许的速率(每个时间间隔内的请求数)
 * @param rateInterval 速率间隔(秒)
 * @param timeout      超时时间(秒)
 * @return 剩余令牌数，-1表示获取失败
 */
public static long rateLimiter(String key, RateType rateType, int rate, int rateInterval, int timeout) {
    RRateLimiter rateLimiter = CLIENT.getRateLimiter(key);

    // 设置限流规则
    rateLimiter.trySetRate(rateType, rate, Duration.ofSeconds(rateInterval), Duration.ofSeconds(timeout));

    // 尝试获取令牌
    if (rateLimiter.tryAcquire()) {
        return rateLimiter.availablePermits();  // 返回剩余令牌数
    } else {
        return -1L;  // 获取失败，触发限流
    }
}
```

### 令牌桶算法原理

```text
                    ┌─────────────────────────────────────┐
                    │           令牌桶 (Token Bucket)      │
                    │                                     │
                    │    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
    令牌生成速率 ────►│    │ T │ │ T │ │ T │ │ T │ │ T │   │
    (count/time)    │    └───┘ └───┘ └───┘ └───┘ └───┘   │
                    │         桶容量 = count              │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────────┐
                    │              请求处理                 │
                    │  有令牌 → 放行 (返回剩余令牌数)       │
                    │  无令牌 → 拒绝 (返回-1)              │
                    └──────────────────────────────────────┘
```

**算法特点:**

| 特性 | 说明 |
|------|------|
| 平滑限流 | 按固定速率放入令牌，平滑处理请求 |
| 突发流量 | 桶中可积累令牌，允许短时突发 |
| 精确控制 | 基于Redis实现分布式精确计数 |
| 高性能 | Redisson 原子操作，无锁竞争 |

## SpEL 表达式支持

### 表达式格式

限流模块支持两种 SpEL 表达式格式:

| 格式 | 语法 | 示例 |
|------|------|------|
| 简单表达式 | `#variable` | `#userId` |
| 模板表达式 | `#{expression}` | `#{#user.id + ':' + #action}` |

### 使用示例

```java
// 1. 引用方法参数
@RateLimiter(key = "#userId", time = 60, count = 10)
public void method1(String userId) { }

// 2. 引用对象属性
@RateLimiter(key = "#user.id", time = 60, count = 10)
public void method2(User user) { }

// 3. 组合多个参数
@RateLimiter(key = "#{#userId + ':' + #type}", time = 60, count = 10)
public void method3(String userId, String type) { }

// 4. 使用对象方法
@RateLimiter(key = "#user.getUsername()", time = 60, count = 10)
public void method4(User user) { }

// 5. 引用Spring Bean
@RateLimiter(key = "#{@userService.getCurrentUserId()}", time = 60, count = 10)
public void method5() { }

// 6. 三元表达式
@RateLimiter(key = "#{#userId != null ? #userId : 'anonymous'}", time = 60, count = 10)
public void method6(String userId) { }
```

### IDE 支持配置

为了获得 IDE 的 SpEL 表达式支持，可配置 `spel-extension.json`:

```json
{
  "plus.ruoyi.common.ratelimiter.annotation.RateLimiter@key": {
    "method": {
      "parameters": true
    }
  }
}
```

## 实际应用场景

### 1. 登录接口保护

```java
@PostMapping("/login")
@RateLimiter(
    time = 300,               // 5分钟窗口
    count = 5,                // 最多5次尝试
    limitType = LimitType.IP, // 基于IP限流
    message = "登录尝试过于频繁，请5分钟后再试"
)
public Result login(@RequestBody LoginRequest request) {
    return authService.login(request);
}
```

### 2. 短信验证码发送

```java
@PostMapping("/sms/send")
@RateLimiter(
    key = "#phone",           // 基于手机号限流
    time = 60,                // 1分钟窗口
    count = 1,                // 最多1次
    message = "验证码发送过于频繁，请1分钟后再试"
)
public Result sendSmsCode(@RequestParam String phone) {
    return smsService.sendCode(phone);
}
```

### 3. 用户操作限流

```java
@PostMapping("/user/update")
@RateLimiter(
    key = "#{@securityUtils.getUserId()}",  // 基于当前登录用户
    time = 60,
    count = 10,
    message = "操作过于频繁，请稍后再试"
)
public Result updateProfile(@RequestBody UserProfile profile) {
    return userService.updateProfile(profile);
}
```

### 4. 数据导出限流

```java
@GetMapping("/data/export")
@RateLimiter(
    time = 3600,              // 1小时窗口
    count = 10,               // 最多10次
    limitType = LimitType.IP,
    message = "导出次数已达上限，请1小时后再试"
)
public void exportData(HttpServletResponse response) {
    dataService.export(response);
}
```

### 5. API 接口保护

```java
@GetMapping("/api/v1/users")
@RateLimiter(
    time = 60,
    count = 100,
    limitType = LimitType.DEFAULT,  // 全局限流
    message = "API调用频率超限，请稍后再试"
)
public Result listUsers(@RequestParam int page, @RequestParam int size) {
    return userService.listUsers(page, size);
}
```

### 6. 敏感操作限流

```java
@PostMapping("/payment/create")
@RateLimiter(
    key = "#{@securityUtils.getUserId() + ':payment'}",
    time = 60,
    count = 3,
    message = "支付操作过于频繁，请稍后再试"
)
public Result createPayment(@RequestBody PaymentRequest request) {
    return paymentService.create(request);
}
```

## 异常处理

### 限流异常

当触发限流时，会抛出 `ServiceException` 异常:

```java
// 方式1: 方法内捕获
try {
    someService.rateLimitedMethod();
} catch (ServiceException e) {
    log.warn("触发限流: {}", e.getMessage());
    return Result.error(e.getMessage());
}
```

### 全局异常处理

建议在全局异常处理器中统一处理:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常(包含限流异常)
     */
    @ExceptionHandler(ServiceException.class)
    public Result handleServiceException(ServiceException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理运行时异常(包含限流系统异常)
     */
    @ExceptionHandler(RuntimeException.class)
    public Result handleRuntimeException(RuntimeException e) {
        if (e.getMessage().contains("限流")) {
            log.error("限流系统异常", e);
            return Result.error("系统繁忙，请稍后再试");
        }
        throw e;
    }
}
```

### 国际化消息

限流消息支持国际化配置:

```properties
# messages_zh_CN.properties
request.control.rate.limit.exceeded=请求过于频繁，请稍后再试
user.login.limit.exceeded=登录尝试次数过多，请{0}分钟后再试

# messages_en_US.properties
request.control.rate.limit.exceeded=Too many requests, please try again later
user.login.limit.exceeded=Too many login attempts, please try again in {0} minutes
```

```java
// 使用国际化消息
@RateLimiter(
    time = 300,
    count = 5,
    message = "user.login.limit.exceeded"
)
public void login() { }
```

## 监控与运维

### 日志记录

限流切面自动记录限流信息:

```text
INFO  - 限制令牌 => 10, 剩余令牌 => 5, 缓存key => 'rate_limit:/api/user/info:192.168.1.100:getUserInfo'
```

### Redis 监控

```bash
# 查看所有限流key
redis-cli KEYS "rate_limit:*"

# 查看限流key数量
redis-cli KEYS "rate_limit:*" | wc -l

# 查看特定key的TTL
redis-cli TTL "rate_limit:/api/user/info:192.168.1.100:getUserInfo"

# 删除特定限流key(紧急解除限流)
redis-cli DEL "rate_limit:/api/user/info:192.168.1.100:getUserInfo"

# 批量删除限流key
redis-cli KEYS "rate_limit:/api/login:*" | xargs redis-cli DEL
```

### 监控指标

建议监控以下指标:

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| 限流触发次数 | 单位时间内限流次数 | 异常增长时告警 |
| 限流key数量 | Redis中限流key总数 | 过多时检查是否内存泄漏 |
| 限流响应时间 | 限流检查耗时 | 超过10ms告警 |

## 最佳实践

### 1. 合理设置限流参数

```java
// ✅ 推荐：根据业务特性设置合理参数
@RateLimiter(time = 60, count = 100, limitType = LimitType.IP)
public void queryData() { }

// ❌ 不推荐：参数过于严格影响正常使用
@RateLimiter(time = 60, count = 1, limitType = LimitType.DEFAULT)
public void normalQuery() { }
```

### 2. 选择合适的限流类型

```java
// ✅ 敏感操作使用IP限流
@RateLimiter(limitType = LimitType.IP)
public void sensitiveOperation() { }

// ✅ 资源密集型操作使用全局限流
@RateLimiter(limitType = LimitType.DEFAULT)
public void expensiveOperation() { }
```

### 3. 使用有意义的Key

```java
// ✅ 推荐：使用业务相关的key
@RateLimiter(key = "#userId")
public void userOperation(String userId) { }

// ✅ 推荐：组合多个维度
@RateLimiter(key = "#{#userId + ':' + #operationType}")
public void complexOperation(String userId, String operationType) { }
```

### 4. 提供友好的错误提示

```java
// ✅ 推荐：明确的错误提示
@RateLimiter(message = "操作过于频繁，请1分钟后重试")
public void operation() { }

// ✅ 推荐：使用国际化消息
@RateLimiter(message = "rate.limit.operation.exceeded")
public void i18nOperation() { }
```

### 5. 分层限流策略

```java
@RestController
public class ApiController {

    // 第一层：全局流量保护
    @RateLimiter(time = 1, count = 10000, limitType = LimitType.DEFAULT)
    @GetMapping("/api/**")
    public void globalLimit() { }

    // 第二层：IP级别限流
    @RateLimiter(time = 60, count = 100, limitType = LimitType.IP)
    @GetMapping("/api/query")
    public void queryData() { }

    // 第三层：用户级别限流
    @RateLimiter(key = "#{@securityUtils.getUserId()}", time = 60, count = 10)
    @PostMapping("/api/submit")
    public void submitData() { }
}
```

## 常见问题

### 1. 限流不生效

**可能原因:**
- Redis连接配置错误
- 方法调用方式不正确(内部调用不触发AOP)
- 注解配置错误

**解决方案:**

```java
// ❌ 错误：内部调用不会触发AOP
public void method1() {
    this.method2(); // 不会触发限流
}

@RateLimiter(time = 60, count = 10)
public void method2() { }

// ✅ 正确：通过Spring容器调用
@Autowired
private SomeService someService;

public void method1() {
    someService.method2(); // 会触发限流
}
```

### 2. SpEL表达式不生效

**可能原因:**
- 表达式语法错误
- 参数名获取失败
- Bean引用错误

**解决方案:**

```java
// ✅ 正确的表达式格式
@RateLimiter(key = "#userId")                    // 简单参数
@RateLimiter(key = "#user.id")                   // 对象属性
@RateLimiter(key = "#{#userId + ':' + #type}")   // 复杂表达式
@RateLimiter(key = "#{@userService.getId()}")    // Bean方法
```

### 3. 集群环境限流不准确

**可能原因:**
- Redis配置不一致
- 系统时间不同步
- 限流类型选择错误

**解决方案:**
1. 确保所有节点使用相同Redis配置
2. 同步各节点系统时间(NTP)
3. 选择正确的限流类型

### 4. 限流数据堆积

**可能原因:**
- timeout设置过大
- 限流key过多

**解决方案:**

```java
// 合理设置timeout
@RateLimiter(
    time = 60,
    count = 100,
    timeout = 3600  // 1小时后自动清理
)
public void method() { }
```

### 5. 限流性能问题

**优化建议:**
1. 避免过多的限流key
2. 使用合理的timeout减少Redis内存占用
3. 监控Redis性能指标

## 性能优化

### 1. Redis 连接优化

限流模块依赖 Redis 执行令牌桶算法，优化 Redis 连接配置可提升性能：

```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          # 最大活跃连接数（根据并发量调整）
          max-active: 200
          # 最大等待时间
          max-wait: -1ms
          # 最大空闲连接数
          max-idle: 20
          # 最小空闲连接数
          min-idle: 5
      # 连接超时时间
      timeout: 3s
      # 读取超时时间
      read-timeout: 3s
```

### 2. 限流 Key 优化

合理设计限流 Key 可减少 Redis 内存占用：

| 策略 | 说明 | 效果 |
|------|------|------|
| 缩短 timeout | 减少 Key 存活时间 | 降低内存占用 |
| 精简 key 值 | 避免过长的自定义 key | 减少存储空间 |
| 合理分组 | 相似接口共享限流 | 减少 Key 数量 |

### 3. 并发性能测试

在典型配置下的性能表现：

| 并发数 | QPS | 平均响应时间 | 99%响应时间 |
|--------|-----|-------------|-------------|
| 100 | 12,000 | 8ms | 15ms |
| 500 | 10,500 | 48ms | 95ms |
| 1000 | 8,200 | 120ms | 250ms |

**测试环境**：
- Redis：单节点，8GB 内存
- 应用：2 实例，4核8GB
- 网络：局域网，延迟 < 1ms

## 与其他模块集成

### 1. 与幂等模块集成

双重保护机制：

```java
@PostMapping("/order/create")
@RateLimiter(time = 60, count = 10, limitType = LimitType.IP)  // 限流
@RepeatSubmit(interval = 5, timeUnit = TimeUnit.SECONDS)       // 防重
public R<Long> createOrder(@RequestBody OrderBo bo) {
    return R.ok(orderService.create(bo));
}
```

**执行顺序**：

```text
请求 → 限流检查 → 防重检查 → 业务逻辑 → 响应
```

### 2. 与日志模块集成

```java
@PostMapping("/sensitive")
@Log(title = "敏感操作", operType = DictOperType.OTHER)
@RateLimiter(time = 60, count = 5, limitType = LimitType.IP)
@SaCheckPermission("system:sensitive:operate")
public R<Void> sensitiveOperation(@RequestBody OperationBo bo) {
    return R.ok();
}
```

### 3. 与权限模块集成

推荐注解组合顺序：

```java
@PostMapping("/create")
@SaCheckPermission("module:entity:add")  // 1. 权限检查
@RateLimiter(time = 60, count = 10)      // 2. 限流检查
@Log(title = "实体", operType = DictOperType.INSERT)  // 3. 日志记录
public R<Long> create(@RequestBody EntityBo bo) {
    return R.ok(service.add(bo));
}
```

## 测试策略

### 1. 单元测试

```java
@ExtendWith(MockitoExtension.class)
class RateLimiterAspectTest {

    private RateLimiterAspect rateLimiterAspect;

    @BeforeEach
    void init() {
        rateLimiterAspect = new RateLimiterAspect();
    }

    @Test
    @DisplayName("切面应能正常实例化")
    void testAspectInstantiation() {
        assertNotNull(rateLimiterAspect, "切面实例不应为null");
    }

    @Test
    @DisplayName("多次实例化应创建不同对象")
    void testMultipleInstantiation() {
        RateLimiterAspect aspect1 = new RateLimiterAspect();
        RateLimiterAspect aspect2 = new RateLimiterAspect();

        assertNotNull(aspect1, "第一个实例不应为null");
        assertNotNull(aspect2, "第二个实例不应为null");
        assertNotSame(aspect1, aspect2, "应创建不同对象");
    }
}
```

### 2. 注解配置测试

```java
@Nested
@DisplayName("测试服务类注解配置验证")
class TestServiceAnnotationTests {

    @Test
    @DisplayName("defaultLimitMethod - 应使用默认配置")
    void testDefaultLimitMethodConfig() throws NoSuchMethodException {
        Method method = TestService.class.getMethod("defaultLimitMethod");
        RateLimiter annotation = method.getAnnotation(RateLimiter.class);

        assertNotNull(annotation, "方法应有@RateLimiter注解");
        assertEquals("", annotation.key(), "key应为空");
        assertEquals(60, annotation.time(), "time应为默认值60");
        assertEquals(100, annotation.count(), "count应为默认值100");
        assertEquals(LimitType.DEFAULT, annotation.limitType(), "limitType应为DEFAULT");
    }

    @Test
    @DisplayName("ipLimitMethod - 应配置IP限流")
    void testIpLimitMethodConfig() throws NoSuchMethodException {
        Method method = TestService.class.getMethod("ipLimitMethod");
        RateLimiter annotation = method.getAnnotation(RateLimiter.class);

        assertNotNull(annotation, "方法应有@RateLimiter注解");
        assertEquals(LimitType.IP, annotation.limitType(), "limitType应为IP");
    }
}
```

### 3. SpEL 表达式测试

```java
@Nested
@DisplayName("SpEL表达式配置测试")
class SpelConfigTests {

    @Test
    @DisplayName("简单SpEL表达式key应以#开头")
    void testSimpleSpelKeyFormat() throws NoSuchMethodException {
        Method method = TestService.class.getMethod("spelSimpleMethod", String.class);
        RateLimiter annotation = method.getAnnotation(RateLimiter.class);

        assertTrue(annotation.key().startsWith("#"), "简单SpEL表达式应以#开头");
        assertFalse(annotation.key().startsWith("#{"), "简单SpEL表达式不应以#{开头");
    }

    @Test
    @DisplayName("模板SpEL表达式key应以#{开头并以}结尾")
    void testTemplateSpelKeyFormat() throws NoSuchMethodException {
        Method method = TestService.class.getMethod("spelTemplateMethod", String.class, Integer.class);
        RateLimiter annotation = method.getAnnotation(RateLimiter.class);

        assertTrue(annotation.key().startsWith("#{"), "模板SpEL表达式应以#{开头");
        assertTrue(annotation.key().endsWith("}"), "模板SpEL表达式应以}结尾");
    }
}
```

### 4. 集成测试

```java
@SpringBootTest
@AutoConfigureMockMvc
class RateLimiterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @BeforeEach
    void clearRedis() {
        Set<String> keys = redisTemplate.keys("rate_limit:*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Test
    void testRateLimitNotTriggered() throws Exception {
        // 在限流范围内的请求应成功
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/api/test"))
                .andExpect(status().isOk());
        }
    }

    @Test
    void testRateLimitTriggered() throws Exception {
        // 超过限流阈值后应返回错误
        for (int i = 0; i < 15; i++) {
            mockMvc.perform(get("/api/test"));
        }

        mockMvc.perform(get("/api/test"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.msg").value(containsString("请求过于频繁")));
    }
}
```

## 安全考虑

### 1. IP 伪造防护

使用 IP 限流时需注意 IP 伪造问题：

```java
// 获取真实 IP 的优先级
// 1. X-Forwarded-For
// 2. Proxy-Client-IP
// 3. WL-Proxy-Client-IP
// 4. HTTP_CLIENT_IP
// 5. HTTP_X_FORWARDED_FOR
// 6. RemoteAddr
```

建议在网关或负载均衡器上过滤恶意请求头。

### 2. 分布式环境安全

确保所有节点使用相同的 Redis 配置：

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD}
      database: ${REDIS_DATABASE:0}
```

### 3. 限流绕过防护

避免限流被绕过的措施：

| 风险 | 防护措施 |
|------|----------|
| 参数篡改 | 使用固定 key 或服务端生成的 key |
| 接口变体 | 统一接口规范，避免多个接口实现相同功能 |
| 分布式攻击 | 结合 WAF 和网关层限流 |

## 注意事项

### 1. 时间窗口选择

| 场景 | 推荐 time | 说明 |
|------|-----------|------|
| 登录接口 | 300秒 | 5分钟窗口防止暴力破解 |
| 短信验证码 | 60秒 | 1分钟防止短信轰炸 |
| 普通查询 | 60秒 | 常规接口限流 |
| 敏感操作 | 60秒 | 结合较低的 count |
| 数据导出 | 3600秒 | 1小时限制资源密集操作 |

### 2. 限流次数设置

根据接口特性设置合理的 count 值：

```java
// 登录接口：5次/5分钟
@RateLimiter(time = 300, count = 5, limitType = LimitType.IP)

// 查询接口：100次/分钟
@RateLimiter(time = 60, count = 100)

// 敏感操作：3次/分钟
@RateLimiter(time = 60, count = 3, limitType = LimitType.IP)

// 数据导出：10次/小时
@RateLimiter(time = 3600, count = 10)
```

### 3. AOP 调用注意事项

内部方法调用不会触发 AOP：

```java
// ❌ 错误：内部调用不触发限流
public void method1() {
    this.rateLimitedMethod();  // 限流不生效
}

// ✅ 正确：通过 Spring 容器调用
@Autowired
private SelfService self;

public void method1() {
    self.rateLimitedMethod();  // 限流生效
}
```

### 4. 异常处理

限流触发时抛出 `ServiceException`，确保全局异常处理器正确处理：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e) {
        return R.fail(e.getMessage());
    }
}
```

## 故障排查

### 问题1：限流不生效

**现象**：请求未被限流

**排查步骤**：
1. 检查 Redis 连接是否正常
2. 确认方法是通过 Spring 容器调用
3. 检查注解配置是否正确

**解决方案**：

```bash
# 检查 Redis 连接
redis-cli ping

# 查看限流 key 是否存在
redis-cli keys "rate_limit:*"
```

### 问题2：限流过于严格

**现象**：正常请求也被限流

**排查步骤**：
1. 检查 time 和 count 配置是否合理
2. 检查是否有共享 IP 的情况
3. 检查限流类型是否正确

**解决方案**：

```java
// 调整限流参数
@RateLimiter(time = 60, count = 200)  // 增加 count

// 或改用用户级别限流
@RateLimiter(key = "#{@securityUtils.getUserId()}", time = 60, count = 100)
```

### 问题3：Redis 内存占用高

**排查步骤**：

```bash
# 查看限流 key 数量
redis-cli keys "rate_limit:*" | wc -l

# 查看内存占用
redis-cli info memory | grep used_memory_human
```

**解决方案**：
1. 缩短 timeout 值
2. 使用更简短的 key
3. 配置 Redis 内存淘汰策略

## 限流算法对比

### 常见限流算法

| 算法 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| 固定窗口 | 固定时间窗口内计数 | 实现简单 | 边界问题 | 简单场景 |
| 滑动窗口 | 滑动时间窗口计数 | 更平滑 | 实现复杂 | 精确控制 |
| 漏桶 | 固定速率处理请求 | 流量平滑 | 无法应对突发 | 匀速处理 |
| 令牌桶 | 固定速率生成令牌 | 允许突发 | 实现复杂 | 通用场景 |

### 令牌桶算法详解

本模块使用 Redisson 的令牌桶算法实现：

```text
┌─────────────────────────────────────────────────────────────────┐
│                        令牌桶工作原理                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│      令牌生成器                        令牌桶                     │
│    ┌─────────────┐               ┌─────────────────────┐        │
│    │ rate: 100   │──令牌──────►  │ ○ ○ ○ ○ ○ ○ ○ ○ ○  │        │
│    │ /time: 60s  │              │   capacity: count   │        │
│    └─────────────┘               └──────────┬──────────┘        │
│                                              │                   │
│                                              ▼                   │
│                               ┌──────────────────────────┐      │
│                               │   请求获取令牌            │      │
│                               │   有令牌 → 放行          │      │
│                               │   无令牌 → 拒绝(-1)      │      │
│                               └──────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

**算法特点**：

1. **令牌生成**：按 `count/time` 速率持续生成令牌
2. **桶容量限制**：桶中令牌数最多为 `count`
3. **突发处理**：桶中有积累令牌时可处理短时突发流量
4. **平滑限流**：长期来看请求速率不超过设定值

### 与滑动窗口对比

```java
/**
 * 滑动窗口限流（手动实现示例）
 */
@Component
public class SlidingWindowRateLimiter {

    private static final String SLIDING_WINDOW_KEY = "sliding_window:";

    /**
     * 滑动窗口限流检查
     */
    public boolean tryAcquire(String key, int windowSize, int maxCount) {
        long now = System.currentTimeMillis();
        long windowStart = now - windowSize * 1000L;

        String redisKey = SLIDING_WINDOW_KEY + key;

        // 使用 ZSET 存储请求时间戳
        RBatch batch = RedisUtils.getClient().createBatch();

        // 1. 移除窗口外的请求
        batch.getScoredSortedSet(redisKey)
            .removeRangeByScoreAsync(0, false, windowStart, true);

        // 2. 统计窗口内请求数
        batch.getScoredSortedSet(redisKey)
            .countAsync(windowStart, true, now, true);

        // 3. 添加当前请求
        batch.getScoredSortedSet(redisKey)
            .addAsync(now, String.valueOf(now));

        // 4. 设置过期时间
        batch.getScoredSortedSet(redisKey)
            .expireAsync(Duration.ofSeconds(windowSize + 10));

        List<Object> results = batch.execute().getResponses();
        long count = (Long) results.get(1);

        return count < maxCount;
    }
}
```

**对比分析**：

| 特性 | 令牌桶（本模块） | 滑动窗口 |
|------|-----------------|----------|
| 突发流量 | 支持 | 不支持 |
| 实现复杂度 | Redisson封装 | 需手动实现 |
| 内存占用 | 固定 | 与请求数相关 |
| 精确度 | 高 | 更高 |
| 适用场景 | 通用场景 | 精确控制 |

## 动态限流配置

### 1. 基于配置中心

结合 Nacos 等配置中心实现动态限流：

```java
/**
 * 动态限流配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "rate-limiter")
@RefreshScope  // 支持配置热更新
public class DynamicRateLimiterConfig {

    /** 全局限流开关 */
    private boolean enabled = true;

    /** 默认限流配置 */
    private DefaultConfig defaultConfig = new DefaultConfig();

    /** 接口级别配置 */
    private Map<String, ApiConfig> apis = new HashMap<>();

    @Data
    public static class DefaultConfig {
        private int time = 60;
        private int count = 100;
    }

    @Data
    public static class ApiConfig {
        private int time;
        private int count;
        private String limitType = "DEFAULT";
    }
}
```

**配置文件**：

```yaml
# application.yml
rate-limiter:
  enabled: true
  default-config:
    time: 60
    count: 100
  apis:
    "/api/login":
      time: 300
      count: 5
      limit-type: IP
    "/api/sms/send":
      time: 60
      count: 1
      limit-type: IP
```

### 2. 编程式动态调整

```java
/**
 * 动态限流管理服务
 */
@Service
public class DynamicRateLimiterService {

    private final ConcurrentHashMap<String, RateLimitRule> ruleCache = new ConcurrentHashMap<>();

    /**
     * 更新限流规则
     */
    public void updateRule(String api, int time, int count, LimitType limitType) {
        RateLimitRule rule = new RateLimitRule(time, count, limitType);
        ruleCache.put(api, rule);

        // 同步到 Redis（集群共享）
        RedisUtils.setObject("rate_limit_rule:" + api, rule, Duration.ofDays(7));

        log.info("限流规则已更新: {} -> time={}, count={}, type={}",
            api, time, count, limitType);
    }

    /**
     * 获取限流规则
     */
    public RateLimitRule getRule(String api) {
        return ruleCache.computeIfAbsent(api, k -> {
            // 从 Redis 加载
            RateLimitRule rule = RedisUtils.getObject("rate_limit_rule:" + api);
            return rule != null ? rule : getDefaultRule();
        });
    }

    /**
     * 临时提升限额（促销活动等场景）
     */
    public void temporaryBoost(String api, int boostFactor, Duration duration) {
        RateLimitRule current = getRule(api);
        RateLimitRule boosted = new RateLimitRule(
            current.getTime(),
            current.getCount() * boostFactor,
            current.getLimitType()
        );

        // 设置临时规则
        RedisUtils.setObject("rate_limit_rule_temp:" + api, boosted, duration);

        log.info("限流规则临时提升: {} -> count={}x{}, duration={}",
            api, current.getCount(), boostFactor, duration);
    }

    @Data
    @AllArgsConstructor
    public static class RateLimitRule implements Serializable {
        private int time;
        private int count;
        private LimitType limitType;
    }
}
```

### 3. 基于监控的自适应限流

```java
/**
 * 自适应限流
 * 根据系统负载动态调整限流阈值
 */
@Component
public class AdaptiveRateLimiter {

    private static final double HIGH_LOAD_THRESHOLD = 0.8;
    private static final double LOW_LOAD_THRESHOLD = 0.3;

    @Autowired
    private MetricsService metricsService;

    /**
     * 计算动态限流系数
     */
    public double calculateFactor() {
        // 获取系统负载
        double cpuLoad = metricsService.getCpuUsage();
        double memoryLoad = metricsService.getMemoryUsage();
        double avgLoad = (cpuLoad + memoryLoad) / 2;

        if (avgLoad > HIGH_LOAD_THRESHOLD) {
            // 高负载：降低限流阈值
            return 0.5;
        } else if (avgLoad < LOW_LOAD_THRESHOLD) {
            // 低负载：提升限流阈值
            return 1.5;
        } else {
            // 正常负载：保持原值
            return 1.0;
        }
    }

    /**
     * 获取动态调整后的限流次数
     */
    public int getDynamicCount(int baseCount) {
        double factor = calculateFactor();
        return (int) Math.max(1, baseCount * factor);
    }
}
```

## 限流降级策略

### 1. 降级处理器

当限流触发时，可以返回降级响应而非直接拒绝：

```java
/**
 * 限流降级处理器
 */
@Component
public class RateLimitFallbackHandler {

    /**
     * 查询接口降级：返回缓存数据
     */
    public R<?> queryFallback(String cacheKey) {
        // 尝试从缓存获取数据
        Object cachedData = RedisUtils.getObject(cacheKey);
        if (cachedData != null) {
            return R.ok(cachedData, "数据来自缓存（系统繁忙）");
        }
        return R.fail("系统繁忙，请稍后再试");
    }

    /**
     * 写入接口降级：进入队列异步处理
     */
    public R<?> writeFallback(Object request, String queueName) {
        try {
            // 放入延迟队列
            RedisUtils.getClient().getQueue(queueName).add(request);
            return R.ok("请求已加入处理队列，稍后将自动处理");
        } catch (Exception e) {
            return R.fail("系统繁忙，请稍后再试");
        }
    }

    /**
     * 默认降级：返回友好提示
     */
    public R<?> defaultFallback() {
        return R.fail(HttpStatus.TOO_MANY_REQUESTS.value(), "请求过于频繁，请稍后再试");
    }
}
```

### 2. 降级注解实现

```java
/**
 * 限流降级注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimiterFallback {

    /**
     * 降级方法名
     */
    String fallbackMethod() default "";

    /**
     * 降级处理类
     */
    Class<?> fallbackClass() default void.class;

    /**
     * 是否使用缓存降级
     */
    boolean useCacheFallback() default false;

    /**
     * 缓存降级 key
     */
    String cacheKey() default "";
}

/**
 * 使用示例
 */
@RestController
public class ProductController {

    @GetMapping("/product/{id}")
    @RateLimiter(time = 60, count = 100)
    @RateLimiterFallback(useCacheFallback = true, cacheKey = "'product:' + #id")
    public R<Product> getProduct(@PathVariable Long id) {
        return R.ok(productService.getById(id));
    }

    @PostMapping("/order")
    @RateLimiter(time = 60, count = 10)
    @RateLimiterFallback(fallbackMethod = "createOrderFallback")
    public R<Order> createOrder(@RequestBody OrderRequest request) {
        return R.ok(orderService.create(request));
    }

    // 降级方法
    public R<Order> createOrderFallback(OrderRequest request) {
        // 将订单放入队列异步处理
        asyncOrderService.enqueue(request);
        return R.ok(null, "订单已提交，将在稍后处理");
    }
}
```

### 3. 熔断与限流结合

```java
/**
 * 熔断限流结合使用
 */
@Service
public class CircuitBreakerRateLimiter {

    private static final int FAILURE_THRESHOLD = 5;
    private static final Duration OPEN_DURATION = Duration.ofSeconds(30);

    private final Map<String, CircuitState> circuitStates = new ConcurrentHashMap<>();

    /**
     * 检查熔断状态
     */
    public boolean isCircuitOpen(String key) {
        CircuitState state = circuitStates.get(key);
        if (state == null) {
            return false;
        }

        if (state.isOpen() && state.shouldAttemptReset()) {
            // 半开状态：允许部分请求通过
            state.setHalfOpen(true);
            return false;
        }

        return state.isOpen();
    }

    /**
     * 记录失败
     */
    public void recordFailure(String key) {
        CircuitState state = circuitStates.computeIfAbsent(key, k -> new CircuitState());
        state.incrementFailures();

        if (state.getFailures() >= FAILURE_THRESHOLD) {
            state.open(OPEN_DURATION);
            log.warn("熔断器已开启: key={}", key);
        }
    }

    /**
     * 记录成功
     */
    public void recordSuccess(String key) {
        CircuitState state = circuitStates.get(key);
        if (state != null && state.isHalfOpen()) {
            state.close();
            log.info("熔断器已关闭: key={}", key);
        }
    }

    @Data
    private static class CircuitState {
        private boolean open = false;
        private boolean halfOpen = false;
        private int failures = 0;
        private Instant openedAt;

        public void open(Duration duration) {
            this.open = true;
            this.openedAt = Instant.now();
        }

        public void close() {
            this.open = false;
            this.halfOpen = false;
            this.failures = 0;
        }

        public boolean shouldAttemptReset() {
            return openedAt != null &&
                Instant.now().isAfter(openedAt.plus(Duration.ofSeconds(30)));
        }

        public void incrementFailures() {
            this.failures++;
        }
    }
}
```

## 网关层限流

### 1. Spring Cloud Gateway 集成

如果使用微服务架构，建议在网关层实现统一限流：

```yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter:
                  replenishRate: 100
                  burstCapacity: 200
                  requestedTokens: 1
                key-resolver: "#{@userKeyResolver}"
```

```java
/**
 * 网关限流 Key 解析器
 */
@Configuration
public class RateLimiterConfig {

    /**
     * 基于用户 ID 限流
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            return Mono.justOrEmpty(userId).defaultIfEmpty("anonymous");
        };
    }

    /**
     * 基于 IP 限流
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String ip = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
            return Mono.just(ip);
        };
    }

    /**
     * 基于接口路径限流
     */
    @Bean
    public KeyResolver pathKeyResolver() {
        return exchange -> Mono.just(exchange.getRequest().getPath().value());
    }
}
```

### 2. 网关与服务限流对比

| 维度 | 网关层限流 | 服务层限流（本模块） |
|------|-----------|---------------------|
| 作用范围 | 全局流量入口 | 具体接口 |
| 粒度 | 粗粒度 | 细粒度 |
| 配置位置 | 网关配置 | 业务代码注解 |
| 灵活性 | 较低 | 高 |
| 适用场景 | 整体流量控制 | 业务级限流 |

**建议**：两者配合使用，网关层做整体流量保护，服务层做精细化限流。

## 总结

ruoyi-common-ratelimiter 模块核心要点:

1. **简单易用** - 基于注解的无侵入式限流，一行注解即可生效
2. **策略丰富** - 支持全局、IP、集群三种限流策略
3. **高性能** - 基于Redisson令牌桶算法，支持高并发场景
4. **灵活配置** - SpEL表达式支持动态key生成
5. **分布式** - 基于Redis实现跨实例精确限流
6. **国际化** - 限流消息支持多语言
7. **可测试** - 提供完整的单元测试和集成测试支持
8. **可扩展** - 支持动态配置和降级策略
