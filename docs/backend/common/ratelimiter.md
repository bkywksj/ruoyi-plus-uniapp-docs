# 限流功能模块 (ratelimiter) 

## 概述

限流功能模块（ruoyi-common-ratelimiter）提供基于Redis和令牌桶算法的分布式限流功能，支持多种限流策略，可以有效防止接口被恶意刷新或超频访问。

## 核心特性

- **多种限流策略**：支持全局限流、IP限流、集群限流
- **分布式支持**：基于Redis实现跨实例限流
- **令牌桶算法**：使用Redisson的高性能限流算法
- **SpEL表达式**：支持动态key生成，灵活配置限流规则
- **AOP切面**：基于注解的无侵入式使用方式
- **国际化支持**：支持多语言错误提示信息

## 架构设计

### 模块依赖

```xml
<dependencies>
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
</dependencies>
```

### 自动配置

模块采用Spring Boot自动配置机制，无需手动配置即可使用：

```java
@AutoConfiguration(after = RedisConfiguration.class)
public class RateLimiterConfig {
    @Bean
    public RateLimiterAspect rateLimiterAspect() {
        return new RateLimiterAspect();
    }
}
```

## 限流类型

### LimitType 枚举

```java
public enum LimitType {
    /**
     * 默认策略全局限流
     */
    DEFAULT,

    /**
     * 根据请求者IP进行限流
     */
    IP,

    /**
     * 实例限流(集群多后端实例)
     */
    CLUSTER
}
```

### 策略说明

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| DEFAULT | 全局限流，所有请求共享限流配额 | 保护系统资源，控制总体流量 |
| IP | 基于客户端IP地址进行独立限流 | 防止恶意攻击，单IP流量控制 |
| CLUSTER | 基于集群节点进行限流 | 集群环境负载均衡 |

## 使用方法

### 基本使用

在需要限流的方法上添加 `@RateLimiter` 注解：

```java
@RateLimiter(time = 60, count = 10)
public void basicMethod() {
    // 60秒内最多访问10次
}
```

### IP限流

```java
@RateLimiter(time = 60, count = 10, limitType = LimitType.IP)
public void ipLimitMethod() {
    // 每个IP在60秒内最多访问10次
}
```

### 动态Key限流

支持使用SpEL表达式生成动态key：

```java
// 基于用户ID限流
@RateLimiter(key = "#userId", time = 60, count = 10)
public void userLimitMethod(String userId) {
    // 每个用户60秒内最多访问10次
}

// 复杂SpEL表达式
@RateLimiter(key = "#{#user.id + ':' + #action}", time = 60, count = 5)
public void complexKeyMethod(User user, String action) {
    // 基于用户ID和操作类型的组合限流
}

// 模板表达式格式
@RateLimiter(key = "#{#userId}-#{#type}", time = 300, count = 20)
public void templateMethod(String userId, String type) {
    // 使用模板表达式格式
}
```

### 自定义错误消息

```java
@RateLimiter(
    time = 60, 
    count = 10, 
    message = "访问过于频繁，请稍后再试"
)
public void customMessageMethod() {
    // 自定义限流提示消息
}

// 使用国际化消息
@RateLimiter(
    time = 60, 
    count = 10, 
    message = "user.login.limit.exceeded"
)
public void i18nMessageMethod() {
    // 使用国际化消息key
}
```

## 注解参数详解

### @RateLimiter 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| key | String | "" | 限流缓存key，支持SpEL表达式 |
| time | int | 60 | 限流时间窗口，单位秒 |
| count | int | 100 | 时间窗口内允许的最大请求次数 |
| limitType | LimitType | DEFAULT | 限流类型策略 |
| message | String | I18nKeys.Request.RATE_LIMIT_EXCEEDED | 限流触发时的提示消息 |
| timeout | int | 86400 | 限流策略在Redis中的存活时间，单位秒 |

### 参数配置建议

#### 时间窗口 (time)
- **60**：1分钟时间窗口（常用）
- **300**：5分钟时间窗口
- **3600**：1小时时间窗口
- **86400**：1天时间窗口

#### 限流次数 (count)
- **登录接口**：5-10次/分钟
- **查询接口**：100-1000次/分钟
- **写入接口**：10-50次/分钟
- **敏感操作**：1-5次/分钟

#### 超时时间 (timeout)
- **86400**：1天（默认，推荐）
- **3600**：1小时（短期限流）
- **7200**：2小时

## SpEL表达式支持

### 基本用法

限流模块支持丰富的SpEL表达式功能：

```java
// 引用方法参数
@RateLimiter(key = "#userId", time = 60, count = 10)
public void method1(String userId) { }

// 引用对象属性
@RateLimiter(key = "#user.id", time = 60, count = 10)
public void method2(User user) { }

// 复杂表达式
@RateLimiter(key = "#{#user.id + '-' + #user.type}", time = 60, count = 10)
public void method3(User user) { }

// 引用Spring Bean
@RateLimiter(key = "#{@userService.getCurrentUserId()}", time = 60, count = 10)
public void method4() { }
```

### 表达式格式

支持两种SpEL表达式格式：

1. **简单表达式**：`#variable` 格式
2. **模板表达式**：`#{expression}` 格式

### 配置文件

SpEL扩展配置（spel-extension.json）：

```json
{
  "plus.ruoyi.common.ratelimiter.annotation.RateLimiter@key": {
    "method": {
      "parameters": true
    }
  }
}
```

## 缓存Key生成规则

### Key格式

最终生成的完整缓存key格式：
```
rate_limit:请求URI:限流标识:自定义key
```

### 生成逻辑

1. **基础前缀**：`rate_limit`
2. **请求URI**：实现不同接口独立限流
3. **限流标识**：
    - IP限流：客户端IP地址
    - 集群限流：Redis客户端实例ID
    - 全局限流：无额外标识
4. **自定义key**：注解中配置的key值

### 示例

```java
// 假设请求URI为 /api/user/info，客户端IP为 192.168.1.100

@RateLimiter(key = "getUserInfo", limitType = LimitType.IP)
public void getUserInfo() { }
// 生成的key: rate_limit:/api/user/info:192.168.1.100:getUserInfo

@RateLimiter(key = "#userId", limitType = LimitType.DEFAULT)  
public void updateUser(String userId) { }
// 生成的key: rate_limit:/api/user/update:user123 (假设userId="user123")
```

## 实际应用场景

### 1. 登录接口保护

```java
@PostMapping("/login")
@RateLimiter(
    time = 300,           // 5分钟窗口
    count = 5,            // 最多5次尝试
    limitType = LimitType.IP,
    message = "登录尝试过于频繁，请5分钟后再试"
)
public Result login(@RequestBody LoginRequest request) {
    // 登录逻辑
}
```

### 2. 短信发送限流

```java
@PostMapping("/sms/send")
@RateLimiter(
    key = "#phone",       // 基于手机号限流
    time = 60,            // 1分钟窗口
    count = 1,            // 最多1次
    message = "短信发送过于频繁，请1分钟后再试"
)
public Result sendSms(@RequestParam String phone) {
    // 发送短信逻辑
}
```

### 3. 用户操作限流

```java
@PostMapping("/user/update")
@RateLimiter(
    key = "#{@securityUtils.getUserId()}",  // 基于当前用户限流
    time = 60,
    count = 10,
    message = "操作过于频繁，请稍后再试"
)
public Result updateProfile(@RequestBody UserProfile profile) {
    // 更新用户资料逻辑
}
```

### 4. API接口保护

```java
@GetMapping("/api/data/export")
@RateLimiter(
    time = 3600,          // 1小时窗口
    count = 10,           // 最多10次导出
    limitType = LimitType.IP,
    message = "导出操作过于频繁，请1小时后再试"
)
public Result exportData(@RequestParam String type) {
    // 数据导出逻辑
}
```

## 异常处理

### 限流异常

当触发限流时，会抛出 `ServiceException` 异常：

```java
try {
    // 调用被限流保护的方法
    someService.rateLimitedMethod();
} catch (ServiceException e) {
    // 处理限流异常
    log.warn("触发限流: {}", e.getMessage());
    return Result.error(e.getMessage());
}
```

### 全局异常处理

建议在全局异常处理器中统一处理限流异常：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ServiceException.class)
    public Result handleServiceException(ServiceException e) {
        return Result.error(e.getMessage());
    }
}
```

## 监控与运维

### 日志记录

限流切面会自动记录限流信息：

```
限制令牌 => 10, 剩余令牌 => 5, 缓存key => 'rate_limit:/api/user/info:192.168.1.100:getUserInfo'
```

### Redis监控

可以通过Redis命令监控限流状态：

```bash
# 查看所有限流key
redis-cli KEYS "rate_limit:*"

# 查看特定key的值
redis-cli GET "rate_limit:/api/user/info:192.168.1.100:getUserInfo"

# 查看key的过期时间
redis-cli TTL "rate_limit:/api/user/info:192.168.1.100:getUserInfo"
```

## 最佳实践

### 1. 合理设置参数

```java
// ✅ 推荐：根据业务特性设置合理的限流参数
@RateLimiter(time = 60, count = 100, limitType = LimitType.IP)
public void queryData() { }

// ❌ 不推荐：限流过于严格影响正常使用
@RateLimiter(time = 60, count = 1, limitType = LimitType.DEFAULT)
public void normalQuery() { }
```

### 2. 选择合适的限流类型

```java
// ✅ 推荐：敏感操作使用IP限流
@RateLimiter(limitType = LimitType.IP, time = 300, count = 5)
public void sensitiveOperation() { }

// ✅ 推荐：资源密集型操作使用全局限流
@RateLimiter(limitType = LimitType.DEFAULT, time = 60, count = 10)
public void expensiveOperation() { }
```

### 3. 使用有意义的Key

```java
// ✅ 推荐：使用业务相关的key
@RateLimiter(key = "#userId", time = 60, count = 10)
public void userOperation(String userId) { }

// ✅ 推荐：组合多个维度
@RateLimiter(key = "#{#userId + ':' + #operationType}", time = 60, count = 5)
public void complexOperation(String userId, String operationType) { }
```

### 4. 提供友好的错误提示

```java
// ✅ 推荐：提供明确的错误提示
@RateLimiter(
    time = 60, 
    count = 10,
    message = "操作过于频繁，请1分钟后重试"
)
public void operation() { }

// ✅ 推荐：使用国际化消息
@RateLimiter(
    time = 60,
    count = 10, 
    message = "rate.limit.user.operation.exceeded"
)
public void i18nOperation() { }
```

## 常见问题

### Q1: 限流不生效？

**可能原因**：
1. Redis连接配置错误
2. 方法调用方式不正确（需要通过Spring代理调用）
3. 注解配置错误

**解决方案**：
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

### Q2: SpEL表达式不生效？

**可能原因**：
1. 表达式语法错误
2. 参数名获取失败
3. Bean引用错误

**解决方案**：
```java
// ✅ 正确的SpEL表达式格式
@RateLimiter(key = "#userId")              // 简单参数引用
@RateLimiter(key = "#user.id")             // 对象属性引用  
@RateLimiter(key = "#{#userId + ':' + #type}") // 复杂表达式
@RateLimiter(key = "#{@userService.getCurrentUserId()}") // Bean方法调用
```

### Q3: 集群环境限流不准确？

**可能原因**：
1. Redis配置不一致
2. 系统时间不同步
3. 限流类型选择错误

**解决方案**：
1. 确保所有节点使用相同的Redis配置
2. 同步各节点系统时间
3. 根据需求选择正确的限流类型

## 总结

RuoYi-Plus-Uniapp限流功能模块提供了完善的分布式限流解决方案，具有以下优势：

- **简单易用**：基于注解的使用方式，无侵入式集成
- **功能强大**：支持多种限流策略和灵活配置
- **性能优秀**：基于Redis和令牌桶算法，高性能低延迟
- **扩展性好**：支持SpEL表达式和自定义配置

通过合理使用限流功能，可以有效保护系统资源，提升应用的稳定性和安全性。
