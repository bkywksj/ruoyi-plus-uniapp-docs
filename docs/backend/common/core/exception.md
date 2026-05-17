# 异常处理

## 概述

ruoyi-common-core 提供了一套完整的异常处理体系，采用分层设计和统一管理的方式，确保系统异常的规范化处理。该体系支持国际化消息、错误码管理、异常分类等功能，为系统提供稳定可靠的异常处理机制。

## 异常体系架构

### 层次结构

```text
BaseException (基础异常)
├── BaseBusinessException (业务异常基类)
│   ├── ServiceException (通用业务异常)
│   └── SseException (SSE专用异常)
└── 模块化异常
    ├── UserException (用户异常)
    ├── FileException (文件异常)
    └── CaptchaException (验证码异常)
```

### 设计原则

- **分层设计**: 基础异常 → 业务异常 → 模块异常
- **国际化支持**: 所有异常消息支持多语言
- **错误码管理**: 统一的错误码体系
- **链式操作**: 支持流式API调用
- **向下兼容**: 保持API稳定性

## 核心异常类

### 1. BaseException (基础异常类)

所有自定义异常的根基类，提供国际化消息和错误码支持。

```java
public abstract class BaseException extends RuntimeException {
    private String module;          // 所属模块
    private String code;            // 错误码
    private Object[] args;          // 错误码参数
    private String defaultMessage;  // 默认错误消息
}
```

**核心特性:**
- 自动国际化消息处理
- 支持模块化错误管理
- 错误码参数化支持
- 异常链传递

**使用示例:**

```java
// 基础构造
throw new UserException("user.not.found", userId);

// 带模块信息
throw new UserException("user", "password.invalid", null, "密码错误");

// 带原因异常
throw new FileException("file.upload.failed", cause);
```

### 2. BaseBusinessException (业务异常基类)

继承自 BaseException，专门用于业务逻辑异常处理。

```java
public abstract class BaseBusinessException extends BaseException {
    private Integer businessCode;   // 业务错误码
    private String detailMessage;   // 详细错误信息

    // 支持链式调用
    public BaseBusinessException setMessage(String message) { /* ... */ }
    public BaseBusinessException setBusinessCode(Integer code) { /* ... */ }
    public BaseBusinessException setDetailMessage(String detail) { /* ... */ }
}
```

**适用场景:**
- 业务规则验证失败
- 数据状态不正确
- 业务流程异常

**使用示例:**

```java
// 链式设置
throw new ServiceException("订单状态错误")
    .setBusinessCode(4001)
    .setDetailMessage("订单已支付，无法取消");

// 快速创建
throw ServiceException.of("库存不足", 4002);
```

## 模块化异常

### 1. ServiceException (通用业务异常)

最常用的业务异常类，适用于大部分业务场景。

```java
public final class ServiceException extends BaseBusinessException {

    // 基础构造方法
    public ServiceException(String message);
    public ServiceException(String message, Integer businessCode);
    public ServiceException(String message, Integer businessCode, String detailMessage);

    // 静态工厂方法
    public static ServiceException of(String message);
    public static ServiceException of(String message, Integer businessCode);

    // 条件抛出
    public static void throwIf(boolean condition, String message);
    public static void notNull(Object object, String message);
}
```

**使用场景:**

```java
// 参数校验
ServiceException.notNull(user, "用户不能为空");

// 条件判断
ServiceException.throwIf(balance < amount, "余额不足");

// 业务规则
if (order.getStatus().equals("PAID")) {
        throw ServiceException.of("订单已支付，无法修改", 4001);
}

// 国际化消息
        throw ServiceException.of("order.status.invalid");
```

### 2. UserException (用户异常)

专门处理用户相关的异常，如登录、注册、权限等。

```java
public class UserException extends BaseException {
    private static final String MODULE = "user";

    // 构造方法
    public UserException(String code, Object... args);
    public UserException(String code, Object[] args, String defaultMessage);

    // 静态工厂方法
    public static UserException of(String code, Object... args);
    public static void throwIf(boolean condition, String code, Object... args);
    public static void notNull(Object object, String code, Object... args);
}
```

**常用错误码:**

```java
public interface UserErrors {
    String ACCOUNT_NOT_EXISTS = "user.account.not.exists";
    String PASSWORD_MISMATCH = "user.password.mismatch";
    String ACCOUNT_DISABLED = "user.account.disabled";
    String SESSION_EXPIRED = "user.session.expired";
    String PASSWORD_RETRY_LOCKED = "user.password.retry.locked";
}
```

**使用示例:**

```java
// 账户不存在
throw UserException.of("user.account.not.exists", username);

// 密码错误次数
throw UserException.of("user.password.retry.count", retryCount);

// 账户锁定
throw UserException.of("user.password.retry.locked", retryCount, lockTime);

// 条件检查
UserException.throwIf(user == null, "user.not.found", userId);
```

### 3. FileException (文件异常)

专门处理文件操作相关的异常。

```java
public class FileException extends BaseException {
    private static final String MODULE = "file";

    public static FileException of(String code, Object... args);
    public static FileException of(String defaultMessage);
}
```

**使用示例:**

```java
// 文件大小超限
throw FileException.of("file.upload.size.exceed.limit", maxSize);

// 文件类型不支持
throw FileException.of("file.upload.type.not.supported");

// 文件上传失败
throw FileException.of("文件上传失败: " + e.getMessage());
```

### 4. CaptchaException (验证码异常)

处理验证码相关的异常。

```java
// 验证码错误
public class CaptchaException extends UserException {
    public static CaptchaException of() {
        return new CaptchaException();
    }
}

// 验证码过期
public class CaptchaExpireException extends UserException {
    public static CaptchaExpireException of() {
        return new CaptchaExpireException();
    }
}
```

**使用示例:**

```java
// 验证码校验
if (!captchaService.validate(code, uuid)) {
        throw CaptchaException.of();
}

// 验证码过期
        if (captchaService.isExpired(uuid)) {
        throw CaptchaExpireException.of();
}
```

## 国际化支持

### 消息键定义

异常消息支持国际化，通过 I18nKeys 接口统一管理消息键。

```java
public interface I18nKeys {

    interface User {
        String ACCOUNT_NOT_EXISTS = "user.account.not.exists";
        String PASSWORD_MISMATCH = "user.password.mismatch";
        String ACCOUNT_DISABLED = "user.account.disabled";
        String SESSION_EXPIRED = "user.session.expired";
        String PASSWORD_RETRY_LOCKED = "user.password.retry.locked";
    }

    interface FileUpload {
        String SIZE_EXCEED_LIMIT = "file.upload.size.exceed.limit";
        String TYPE_NOT_SUPPORTED = "file.upload.type.not.supported";
        String FAILED = "file.upload.failed";
    }

    interface VerifyCode {
        String CAPTCHA_INVALID = "verify.code.captcha.invalid";
        String CAPTCHA_EXPIRED = "verify.code.captcha.expired";
        String SMS_INVALID = "verify.code.sms.invalid";
    }
}
```

### 自动消息处理

BaseException 会自动识别国际化键并进行消息转换。

```java
@Override
public String getMessage() {
    String message = null;
    // 检查是否为国际化键格式
    if (StringUtils.isNotBlank(code) && RegexValidator.isValidI18nKey(code)) {
        message = MessageUtils.message(code, args);
    }
    if (message == null) {
        message = defaultMessage;
    }
    return message;
}
```

### 多语言配置

**messages.properties (默认-中文)**

```properties
user.account.not.exists=对不起, 您的账号：{0} 不存在
user.password.mismatch=用户不存在/密码错误
user.account.disabled=对不起，您的账号：{0} 已禁用，请联系管理员
user.password.retry.locked=密码输入错误{0}次，帐户锁定{1}分钟
file.upload.size.exceed.limit=上传的文件大小超出限制的文件大小！允许的文件最大大小是：{0}MB！
```

**messages_en.properties (英文)**

```properties
user.account.not.exists=Sorry, your account: {0} does not exist
user.password.mismatch=User does not exist/password error
user.account.disabled=Sorry, your account: {0} has been disabled, please contact the administrator
user.password.retry.locked=Password input error {0} times, account locked for {1} minutes
file.upload.size.exceed.limit=The uploaded file size exceeds the limit! Maximum allowed file size is: {0}MB!
```

## 与响应体系集成

### 异常自动转换

异常可以自动转换为统一的响应格式 `R<T>`。

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e) {
        return R.fail(e.getMessage());
    }
    
    @ExceptionHandler(UserException.class)
    public R<Void> handleUserException(UserException e) {
        return R.fail(e.getMessage());
    }
    
    @ExceptionHandler(FileException.class)
    public R<Void> handleFileException(FileException e) {
        return R.fail(e.getMessage());
    }
}
```

### 业务逻辑中的使用

```java
@Service
public class UserService {
    
    public UserVo login(LoginBo bo) {
        // 用户不存在
        User user = userMapper.selectByUsername(bo.getUsername());
        UserException.notNull(user, "user.account.not.exists", bo.getUsername());
        
        // 账户被禁用
        UserException.throwIf("0".equals(user.getStatus()), 
            "user.account.disabled", user.getUsername());
        
        // 密码错误
        if (!passwordEncoder.matches(bo.getPassword(), user.getPassword())) {
            throw UserException.of("user.password.mismatch");
        }
        
        return MapstructUtils.convert(user, UserVo.class);
    }
    
    public void updateUser(UserBo bo) {
        // 参数校验
        ServiceException.notNull(bo.getId(), "用户ID不能为空");
        
        // 业务校验
        User existUser = userMapper.selectById(bo.getId());
        ServiceException.throwIf(existUser == null, "用户不存在");
        
        // 状态检查
        if ("1".equals(existUser.getDelFlag())) {
            throw ServiceException.of("用户已删除，无法修改", 4001);
        }
    }
}
```

## 异常处理最佳实践

### 1. 异常选择指南

```java
// ✅ 推荐: 使用具体的异常类型
throw UserException.of("user.not.found", userId);

// ❌ 不推荐: 使用通用异常
throw new RuntimeException("用户不存在");

// ✅ 推荐: 业务异常使用ServiceException
throw ServiceException.of("订单状态错误", 4001);

// ✅ 推荐: 条件检查使用静态方法
ServiceException.throwIf(amount <= 0, "金额必须大于0");
```

### 2. 错误消息规范

```java
// ✅ 推荐: 使用国际化键
throw UserException.of("user.password.invalid");

// ✅ 推荐: 带参数的国际化
throw UserException.of("user.login.locked", lockTime);

// ❌ 不推荐: 硬编码中文消息
throw new ServiceException("用户名不能为空");

// ✅ 推荐: 英文默认消息
throw ServiceException.of("Username cannot be empty");
```

### 3. 异常链传递

```java
// ✅ 推荐: 保留原异常信息
try {
    userMapper.insert(user);
} catch (DataAccessException e) {
    throw ServiceException.of("用户创建失败", e);
}

// ✅ 推荐: 记录详细错误
catch (Exception e) {
    log.error("用户服务异常: userId={}, error={}", userId, e.getMessage(), e);
    throw ServiceException.of("系统内部错误");
}
```

### 4. 业务异常设计

```java
@Service
public class OrderService {
    
    public void cancelOrder(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        
        // 参数校验异常
        ServiceException.notNull(order, "订单不存在");
        
        // 业务规则异常
        if ("PAID".equals(order.getStatus())) {
            throw ServiceException.of("order.cannot.cancel.paid", 4001)
                .setDetailMessage("订单号: " + order.getOrderNo());
        }
        
        if ("DELIVERED".equals(order.getStatus())) {
            throw ServiceException.of("order.cannot.cancel.delivered", 4002);
        }
        
        // 执行取消逻辑
        order.setStatus("CANCELLED");
        orderMapper.updateById(order);
    }
}
```

### 5. 异常日志记录

```java
@Component
public class ExceptionLogger {
    
    private static final Logger log = LoggerFactory.getLogger(ExceptionLogger.class);
    
    @EventListener
    public void handleServiceException(ServiceException e) {
        // 业务异常记录为WARN级别
        log.warn("业务异常: code={}, message={}", e.getBusinessCode(), e.getMessage());
    }
    
    @EventListener
    public void handleUserException(UserException e) {
        // 用户异常记录为INFO级别
        log.info("用户异常: module={}, code={}, message={}", 
            e.getModule(), e.getCode(), e.getMessage());
    }
    
    @EventListener
    public void handleSystemException(Exception e) {
        // 系统异常记录为ERROR级别
        log.error("系统异常: ", e);
    }
}
```

## 自定义异常

### 创建模块异常

```java
// 1. 继承BaseException
public class PaymentException extends BaseException {
    
    private static final String MODULE = "payment";
    
    public PaymentException(String code, Object... args) {
        super(MODULE, code, args, null);
    }
    
    public PaymentException(String code, Object[] args, String defaultMessage) {
        super(MODULE, code, args, defaultMessage);
    }
    
    // 静态工厂方法
    public static PaymentException of(String code, Object... args) {
        return new PaymentException(code, args);
    }
    
    public static void throwIf(boolean condition, String code, Object... args) {
        if (condition) {
            throw new PaymentException(code, args);
        }
    }
}

// 2. 定义错误码
public interface PaymentErrors {
    String INSUFFICIENT_BALANCE = "payment.insufficient.balance";
    String PAYMENT_EXPIRED = "payment.expired";
    String INVALID_PAYMENT_METHOD = "payment.method.invalid";
}

// 3. 使用示例
public class PaymentService {
    
    public void processPayment(PaymentBo bo) {
        // 余额不足
        PaymentException.throwIf(balance < amount, 
            PaymentErrors.INSUFFICIENT_BALANCE, balance, amount);
        
        // 支付方式无效
        if (!isValidPaymentMethod(bo.getMethod())) {
            throw PaymentException.of(PaymentErrors.INVALID_PAYMENT_METHOD, bo.getMethod());
        }
    }
}
```

### 特殊异常处理

```java
// SSE推送异常
public class SseException extends BaseBusinessException {
    
    public SseException(String message) {
        super(message);
    }
    
    public static SseException of(String message) {
        return new SseException(message);
    }
    
    public static SseException of(String message, Integer businessCode) {
        return new SseException(message, businessCode);
    }
}

// 使用示例
@RestController
public class SseController {
    
    @GetMapping("/sse")
    public SseEmitter subscribe() {
        try {
            return sseService.createConnection();
        } catch (Exception e) {
            throw SseException.of("SSE连接创建失败: " + e.getMessage());
        }
    }
}
```

## 异常链跟踪与调试

### 异常追踪标识

在分布式系统中，异常追踪需要关联请求ID便于问题定位。

```java
/**
 * 可追踪异常接口
 */
public interface TraceableException {

    /**
     * 获取追踪ID
     */
    String getTraceId();

    /**
     * 获取跨度ID
     */
    String getSpanId();

    /**
     * 获取异常发生时间
     */
    LocalDateTime getOccurredAt();
}

/**
 * 带追踪信息的业务异常
 */
public class TraceableServiceException extends ServiceException
        implements TraceableException {

    private final String traceId;
    private final String spanId;
    private final LocalDateTime occurredAt;

    public TraceableServiceException(String message) {
        super(message);
        this.traceId = TraceContext.getTraceId();
        this.spanId = TraceContext.getSpanId();
        this.occurredAt = LocalDateTime.now();
    }

    public static TraceableServiceException of(String message) {
        return new TraceableServiceException(message);
    }

    @Override
    public String getTraceId() {
        return traceId;
    }

    @Override
    public String getSpanId() {
        return spanId;
    }

    @Override
    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }
}
```

### 异常上下文收集器

```java
/**
 * 异常上下文收集器
 * 自动收集异常发生时的上下文信息
 */
@Component
@Slf4j
public class ExceptionContextCollector {

    @Autowired
    private HttpServletRequest request;

    /**
     * 收集异常上下文
     */
    public ExceptionContext collect(Exception e) {
        ExceptionContext context = new ExceptionContext();

        // 基础信息
        context.setExceptionType(e.getClass().getName());
        context.setMessage(e.getMessage());
        context.setTimestamp(LocalDateTime.now());

        // 请求信息
        if (request != null) {
            context.setRequestUri(request.getRequestURI());
            context.setRequestMethod(request.getMethod());
            context.setClientIp(ServletUtils.getClientIP(request));
            context.setUserAgent(request.getHeader("User-Agent"));
        }

        // 用户信息
        try {
            LoginUser loginUser = LoginHelper.getLoginUser();
            if (loginUser != null) {
                context.setUserId(loginUser.getUserId());
                context.setUsername(loginUser.getUsername());
                context.setTenantId(loginUser.getTenantId());
            }
        } catch (Exception ignored) {
            // 未登录状态忽略
        }

        // 追踪信息
        context.setTraceId(TraceContext.getTraceId());
        context.setSpanId(TraceContext.getSpanId());

        // 堆栈信息（仅保留前20行）
        context.setStackTrace(getStackTrace(e, 20));

        return context;
    }

    /**
     * 获取堆栈信息
     */
    private String getStackTrace(Exception e, int maxLines) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);

        String[] lines = sw.toString().split("\n");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(lines.length, maxLines); i++) {
            sb.append(lines[i]).append("\n");
        }

        if (lines.length > maxLines) {
            sb.append("... ").append(lines.length - maxLines).append(" more lines\n");
        }

        return sb.toString();
    }
}

/**
 * 异常上下文实体
 */
@Data
public class ExceptionContext {

    /** 异常类型 */
    private String exceptionType;

    /** 异常消息 */
    private String message;

    /** 发生时间 */
    private LocalDateTime timestamp;

    /** 请求URI */
    private String requestUri;

    /** 请求方法 */
    private String requestMethod;

    /** 客户端IP */
    private String clientIp;

    /** User-Agent */
    private String userAgent;

    /** 用户ID */
    private Long userId;

    /** 用户名 */
    private String username;

    /** 租户ID */
    private String tenantId;

    /** 追踪ID */
    private String traceId;

    /** 跨度ID */
    private String spanId;

    /** 堆栈信息 */
    private String stackTrace;
}
```

### 异常调试工具

```java
/**
 * 异常调试工具类
 */
public final class ExceptionDebugUtils {

    private ExceptionDebugUtils() {}

    /**
     * 格式化异常信息用于调试
     */
    public static String formatForDebug(Exception e) {
        StringBuilder sb = new StringBuilder();

        sb.append("=== Exception Debug Info ===\n");
        sb.append("Type: ").append(e.getClass().getName()).append("\n");
        sb.append("Message: ").append(e.getMessage()).append("\n");
        sb.append("Time: ").append(LocalDateTime.now()).append("\n");

        if (e instanceof BaseException be) {
            sb.append("Module: ").append(be.getModule()).append("\n");
            sb.append("Code: ").append(be.getCode()).append("\n");
            sb.append("Args: ").append(Arrays.toString(be.getArgs())).append("\n");
        }

        if (e instanceof BaseBusinessException bbe) {
            sb.append("BusinessCode: ").append(bbe.getBusinessCode()).append("\n");
            sb.append("DetailMessage: ").append(bbe.getDetailMessage()).append("\n");
        }

        // 根因分析
        Throwable rootCause = getRootCause(e);
        if (rootCause != e) {
            sb.append("Root Cause: ").append(rootCause.getClass().getName()).append("\n");
            sb.append("Root Message: ").append(rootCause.getMessage()).append("\n");
        }

        sb.append("=== End Debug Info ===\n");

        return sb.toString();
    }

    /**
     * 获取异常根因
     */
    public static Throwable getRootCause(Throwable t) {
        Throwable cause = t;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
    }

    /**
     * 检查异常链中是否包含指定类型
     */
    public static boolean containsExceptionType(Throwable t, Class<? extends Throwable> type) {
        Throwable current = t;
        while (current != null) {
            if (type.isInstance(current)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    /**
     * 从异常链中提取指定类型的异常
     */
    @SuppressWarnings("unchecked")
    public static <T extends Throwable> Optional<T> extractException(
            Throwable t, Class<T> type) {
        Throwable current = t;
        while (current != null) {
            if (type.isInstance(current)) {
                return Optional.of((T) current);
            }
            current = current.getCause();
        }
        return Optional.empty();
    }
}
```

## 异常指标监控

### 异常计数器

```java
/**
 * 异常监控指标收集器
 */
@Component
@Slf4j
public class ExceptionMetricsCollector {

    private final MeterRegistry meterRegistry;

    // 异常计数器
    private final ConcurrentMap<String, Counter> exceptionCounters =
            new ConcurrentHashMap<>();

    // 异常发生时间分布
    private final Timer exceptionTimer;

    public ExceptionMetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.exceptionTimer = Timer.builder("exception.handling.time")
                .description("异常处理耗时")
                .register(meterRegistry);
    }

    /**
     * 记录异常发生
     */
    public void recordException(Exception e) {
        String exceptionType = e.getClass().getSimpleName();

        // 增加异常计数
        Counter counter = exceptionCounters.computeIfAbsent(exceptionType,
                type -> Counter.builder("exception.count")
                        .tag("type", type)
                        .tag("module", getModule(e))
                        .description("异常发生次数")
                        .register(meterRegistry));
        counter.increment();

        // 记录业务码分布
        if (e instanceof BaseBusinessException bbe && bbe.getBusinessCode() != null) {
            Counter.builder("exception.business.code")
                    .tag("code", String.valueOf(bbe.getBusinessCode()))
                    .register(meterRegistry)
                    .increment();
        }
    }

    /**
     * 记录异常处理耗时
     */
    public void recordHandlingTime(Runnable task) {
        exceptionTimer.record(task);
    }

    /**
     * 获取异常模块
     */
    private String getModule(Exception e) {
        if (e instanceof BaseException be) {
            return StringUtils.defaultIfBlank(be.getModule(), "unknown");
        }
        return "system";
    }

    /**
     * 获取异常统计摘要
     */
    public Map<String, Long> getExceptionSummary() {
        Map<String, Long> summary = new HashMap<>();
        exceptionCounters.forEach((type, counter) ->
                summary.put(type, (long) counter.count()));
        return summary;
    }
}
```

### 异常告警服务

```java
/**
 * 异常告警服务
 * 当异常频率超过阈值时触发告警
 */
@Service
@Slf4j
public class ExceptionAlertService {

    @Autowired
    private NotificationService notificationService;

    // 异常计数窗口（滑动窗口）
    private final ConcurrentMap<String, SlidingWindowCounter> windowCounters =
            new ConcurrentHashMap<>();

    // 告警阈值配置
    @Value("${exception.alert.threshold:100}")
    private int alertThreshold;

    @Value("${exception.alert.window-seconds:60}")
    private int windowSeconds;

    /**
     * 记录异常并检查是否需要告警
     */
    public void recordAndCheck(Exception e) {
        String key = e.getClass().getSimpleName();

        SlidingWindowCounter counter = windowCounters.computeIfAbsent(key,
                k -> new SlidingWindowCounter(windowSeconds));

        long count = counter.incrementAndGet();

        // 检查是否超过阈值
        if (count >= alertThreshold && shouldAlert(key)) {
            triggerAlert(e, count);
        }
    }

    /**
     * 检查是否应该发送告警（防止告警风暴）
     */
    private boolean shouldAlert(String exceptionType) {
        String alertKey = "exception:alert:" + exceptionType;
        // 使用Redis实现告警抑制，5分钟内只告警一次
        return RedisUtils.setObjectIfAbsent(alertKey, "1", Duration.ofMinutes(5));
    }

    /**
     * 触发告警
     */
    private void triggerAlert(Exception e, long count) {
        ExceptionAlert alert = new ExceptionAlert();
        alert.setExceptionType(e.getClass().getName());
        alert.setMessage(e.getMessage());
        alert.setCount(count);
        alert.setWindowSeconds(windowSeconds);
        alert.setThreshold(alertThreshold);
        alert.setTimestamp(LocalDateTime.now());

        log.warn("异常告警: {} 在{}秒内发生{}次，超过阈值{}",
                alert.getExceptionType(), windowSeconds, count, alertThreshold);

        // 发送通知
        notificationService.sendAlert(alert);
    }
}

/**
 * 滑动窗口计数器
 */
public class SlidingWindowCounter {

    private final int windowSeconds;
    private final ConcurrentLinkedQueue<Long> timestamps = new ConcurrentLinkedQueue<>();

    public SlidingWindowCounter(int windowSeconds) {
        this.windowSeconds = windowSeconds;
    }

    public long incrementAndGet() {
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);

        // 添加当前时间戳
        timestamps.add(now);

        // 清理过期时间戳
        while (!timestamps.isEmpty() && timestamps.peek() < windowStart) {
            timestamps.poll();
        }

        return timestamps.size();
    }
}
```

### 异常统计报表

```java
/**
 * 异常统计报表服务
 */
@Service
@Slf4j
public class ExceptionReportService {

    @Autowired
    private ExceptionLogMapper exceptionLogMapper;

    /**
     * 生成日报
     */
    @Scheduled(cron = "0 0 8 * * ?")
    public void generateDailyReport() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        ExceptionReport report = buildReport(yesterday, yesterday);
        sendReport(report);
    }

    /**
     * 生成周报
     */
    @Scheduled(cron = "0 0 9 ? * MON")
    public void generateWeeklyReport() {
        LocalDate endDate = LocalDate.now().minusDays(1);
        LocalDate startDate = endDate.minusDays(6);
        ExceptionReport report = buildReport(startDate, endDate);
        sendReport(report);
    }

    /**
     * 构建异常报表
     */
    public ExceptionReport buildReport(LocalDate startDate, LocalDate endDate) {
        ExceptionReport report = new ExceptionReport();
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setGeneratedAt(LocalDateTime.now());

        // 查询异常统计数据
        List<ExceptionStat> stats = exceptionLogMapper.selectExceptionStats(
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay());

        // 按类型分组统计
        Map<String, Long> byType = stats.stream()
                .collect(Collectors.groupingBy(
                        ExceptionStat::getExceptionType,
                        Collectors.summingLong(ExceptionStat::getCount)));
        report.setByType(byType);

        // 按模块分组统计
        Map<String, Long> byModule = stats.stream()
                .collect(Collectors.groupingBy(
                        ExceptionStat::getModule,
                        Collectors.summingLong(ExceptionStat::getCount)));
        report.setByModule(byModule);

        // 按小时分布
        Map<Integer, Long> byHour = stats.stream()
                .collect(Collectors.groupingBy(
                        ExceptionStat::getHour,
                        Collectors.summingLong(ExceptionStat::getCount)));
        report.setByHour(byHour);

        // Top 10 异常
        List<ExceptionStat> top10 = stats.stream()
                .sorted(Comparator.comparing(ExceptionStat::getCount).reversed())
                .limit(10)
                .collect(Collectors.toList());
        report.setTop10Exceptions(top10);

        // 总计
        report.setTotalCount(stats.stream()
                .mapToLong(ExceptionStat::getCount).sum());

        return report;
    }

    /**
     * 发送报表
     */
    private void sendReport(ExceptionReport report) {
        // 发送邮件或消息通知
        log.info("异常报表已生成: {} ~ {}, 总计: {} 次异常",
                report.getStartDate(), report.getEndDate(), report.getTotalCount());
    }
}

/**
 * 异常报表实体
 */
@Data
public class ExceptionReport {
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime generatedAt;
    private Long totalCount;
    private Map<String, Long> byType;
    private Map<String, Long> byModule;
    private Map<Integer, Long> byHour;
    private List<ExceptionStat> top10Exceptions;
}
```

## 分布式系统异常处理

### 远程调用异常包装

```java
/**
 * 远程调用异常
 * 用于封装远程服务调用失败
 */
public class RemoteServiceException extends BaseBusinessException {

    private final String serviceName;
    private final String methodName;
    private final int httpStatus;
    private final String remoteMessage;

    public RemoteServiceException(String serviceName, String methodName,
            int httpStatus, String remoteMessage) {
        super("远程服务调用失败: " + serviceName + "." + methodName);
        this.serviceName = serviceName;
        this.methodName = methodName;
        this.httpStatus = httpStatus;
        this.remoteMessage = remoteMessage;
    }

    public static RemoteServiceException of(String serviceName, String methodName,
            int httpStatus, String remoteMessage) {
        return new RemoteServiceException(serviceName, methodName,
                httpStatus, remoteMessage);
    }

    // Getters...
}

/**
 * Feign 异常解码器
 */
@Component
public class FeignExceptionDecoder implements ErrorDecoder {

    private final ObjectMapper objectMapper;

    @Override
    public Exception decode(String methodKey, Response response) {
        String serviceName = extractServiceName(methodKey);
        String methodName = extractMethodName(methodKey);

        try {
            // 尝试解析远程响应体
            String body = Util.toString(response.body().asReader(StandardCharsets.UTF_8));
            R<?> result = objectMapper.readValue(body, R.class);

            return RemoteServiceException.of(
                    serviceName,
                    methodName,
                    response.status(),
                    result.getMsg());
        } catch (Exception e) {
            return RemoteServiceException.of(
                    serviceName,
                    methodName,
                    response.status(),
                    "远程服务响应解析失败");
        }
    }

    private String extractServiceName(String methodKey) {
        // 从 methodKey 提取服务名
        int index = methodKey.indexOf('#');
        return index > 0 ? methodKey.substring(0, index) : methodKey;
    }

    private String extractMethodName(String methodKey) {
        // 从 methodKey 提取方法名
        int index = methodKey.indexOf('#');
        return index > 0 ? methodKey.substring(index + 1) : methodKey;
    }
}
```

### 熔断降级异常

```java
/**
 * 熔断异常
 */
public class CircuitBreakerException extends BaseBusinessException {

    private final String circuitBreakerName;
    private final String state;

    public CircuitBreakerException(String circuitBreakerName, String state) {
        super("服务熔断: " + circuitBreakerName);
        this.circuitBreakerName = circuitBreakerName;
        this.state = state;
        this.setBusinessCode(5001);
    }

    public static CircuitBreakerException of(String name) {
        return new CircuitBreakerException(name, "OPEN");
    }
}

/**
 * 降级异常
 */
public class FallbackException extends BaseBusinessException {

    private final String originalService;
    private final Exception originalException;

    public FallbackException(String originalService, Exception originalException) {
        super("服务降级: " + originalService);
        this.originalService = originalService;
        this.originalException = originalException;
        this.setBusinessCode(5002);
    }

    public static FallbackException of(String service, Exception cause) {
        return new FallbackException(service, cause);
    }
}

/**
 * 通用降级处理器
 */
@Component
@Slf4j
public class GenericFallbackHandler {

    /**
     * 处理远程调用降级
     */
    public <T> T handleFallback(String serviceName, String method,
            Throwable throwable, Supplier<T> defaultSupplier) {
        log.warn("服务降级: {}.{}, 原因: {}", serviceName, method,
                throwable.getMessage());

        // 记录降级指标
        recordFallbackMetric(serviceName, method);

        // 返回默认值或抛出降级异常
        if (defaultSupplier != null) {
            return defaultSupplier.get();
        }

        throw FallbackException.of(serviceName, (Exception) throwable);
    }

    private void recordFallbackMetric(String serviceName, String method) {
        // 记录降级次数
        Counter.builder("service.fallback")
                .tag("service", serviceName)
                .tag("method", method)
                .register(Metrics.globalRegistry)
                .increment();
    }
}
```

### 分布式事务异常

```java
/**
 * 分布式事务异常
 */
public class DistributedTransactionException extends BaseBusinessException {

    private final String xid;
    private final String branchId;
    private final TransactionPhase phase;

    public DistributedTransactionException(String xid, String branchId,
            TransactionPhase phase, String message) {
        super(message);
        this.xid = xid;
        this.branchId = branchId;
        this.phase = phase;
        this.setBusinessCode(5003);
    }

    public static DistributedTransactionException commitFailed(String xid, String branchId) {
        return new DistributedTransactionException(xid, branchId,
                TransactionPhase.COMMIT, "分布式事务提交失败");
    }

    public static DistributedTransactionException rollbackFailed(String xid, String branchId) {
        return new DistributedTransactionException(xid, branchId,
                TransactionPhase.ROLLBACK, "分布式事务回滚失败");
    }

    public enum TransactionPhase {
        PREPARE, COMMIT, ROLLBACK
    }
}
```

## 异常恢复策略

### 重试机制

```java
/**
 * 可重试异常标记接口
 */
public interface RetryableException {

    /**
     * 最大重试次数
     */
    default int getMaxRetries() {
        return 3;
    }

    /**
     * 重试间隔（毫秒）
     */
    default long getRetryInterval() {
        return 1000L;
    }

    /**
     * 是否使用指数退避
     */
    default boolean useExponentialBackoff() {
        return true;
    }
}

/**
 * 可重试的业务异常
 */
public class RetryableServiceException extends ServiceException
        implements RetryableException {

    private final int maxRetries;
    private final long retryInterval;

    public RetryableServiceException(String message, int maxRetries, long retryInterval) {
        super(message);
        this.maxRetries = maxRetries;
        this.retryInterval = retryInterval;
    }

    public static RetryableServiceException of(String message) {
        return new RetryableServiceException(message, 3, 1000L);
    }

    @Override
    public int getMaxRetries() {
        return maxRetries;
    }

    @Override
    public long getRetryInterval() {
        return retryInterval;
    }
}

/**
 * 重试执行器
 */
@Component
@Slf4j
public class RetryExecutor {

    /**
     * 执行可重试操作
     */
    public <T> T executeWithRetry(Supplier<T> operation, RetryableException config) {
        int attempts = 0;
        Exception lastException = null;

        while (attempts < config.getMaxRetries()) {
            try {
                return operation.get();
            } catch (Exception e) {
                lastException = e;
                attempts++;

                if (attempts < config.getMaxRetries()) {
                    long delay = calculateDelay(config, attempts);
                    log.warn("操作失败，第{}次重试，延迟{}ms: {}",
                            attempts, delay, e.getMessage());
                    sleep(delay);
                }
            }
        }

        log.error("重试{}次后仍然失败", config.getMaxRetries());
        throw ServiceException.of("操作失败，已重试" + config.getMaxRetries() + "次");
    }

    /**
     * 计算重试延迟
     */
    private long calculateDelay(RetryableException config, int attempt) {
        if (config.useExponentialBackoff()) {
            // 指数退避: delay * 2^(attempt-1)
            return config.getRetryInterval() * (1L << (attempt - 1));
        }
        return config.getRetryInterval();
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 补偿机制

```java
/**
 * 可补偿异常接口
 */
public interface CompensatableException {

    /**
     * 获取补偿操作
     */
    Runnable getCompensation();

    /**
     * 是否需要补偿
     */
    default boolean needsCompensation() {
        return true;
    }
}

/**
 * 补偿执行器
 */
@Component
@Slf4j
public class CompensationExecutor {

    @Autowired
    private CompensationLogMapper compensationLogMapper;

    /**
     * 执行带补偿的操作
     */
    @Transactional(rollbackFor = Exception.class)
    public <T> T executeWithCompensation(
            Supplier<T> operation,
            Runnable compensation,
            String operationName) {

        // 记录补偿日志
        CompensationLog log = new CompensationLog();
        log.setOperationName(operationName);
        log.setStatus("PENDING");
        log.setCreatedAt(LocalDateTime.now());
        compensationLogMapper.insert(log);

        try {
            T result = operation.get();

            // 操作成功，标记补偿日志为完成
            log.setStatus("COMPLETED");
            compensationLogMapper.updateById(log);

            return result;
        } catch (Exception e) {
            // 执行补偿
            try {
                compensation.run();
                log.setStatus("COMPENSATED");
            } catch (Exception ce) {
                log.setStatus("COMPENSATION_FAILED");
                log.setErrorMessage(ce.getMessage());
            }
            compensationLogMapper.updateById(log);

            throw e;
        }
    }
}
```

### 降级策略

```java
/**
 * 降级策略接口
 */
public interface DegradationStrategy<T> {

    /**
     * 获取降级结果
     */
    T degrade(Exception cause);

    /**
     * 判断是否应该降级
     */
    boolean shouldDegrade(Exception e);
}

/**
 * 默认值降级策略
 */
public class DefaultValueDegradation<T> implements DegradationStrategy<T> {

    private final T defaultValue;
    private final Set<Class<? extends Exception>> degradeOnExceptions;

    public DefaultValueDegradation(T defaultValue,
            Class<? extends Exception>... exceptions) {
        this.defaultValue = defaultValue;
        this.degradeOnExceptions = Set.of(exceptions);
    }

    @Override
    public T degrade(Exception cause) {
        return defaultValue;
    }

    @Override
    public boolean shouldDegrade(Exception e) {
        return degradeOnExceptions.stream()
                .anyMatch(type -> type.isInstance(e));
    }
}

/**
 * 缓存降级策略
 */
@Component
public class CacheDegradation<T> implements DegradationStrategy<T> {

    @Autowired
    private RedisUtils redisUtils;

    private final String cacheKeyPrefix;

    public CacheDegradation(String cacheKeyPrefix) {
        this.cacheKeyPrefix = cacheKeyPrefix;
    }

    @Override
    @SuppressWarnings("unchecked")
    public T degrade(Exception cause) {
        // 从缓存获取上一次成功的结果
        String cacheKey = cacheKeyPrefix + ":last_success";
        return (T) redisUtils.getCacheObject(cacheKey);
    }

    @Override
    public boolean shouldDegrade(Exception e) {
        // 远程调用异常时降级
        return e instanceof RemoteServiceException;
    }

    /**
     * 缓存成功结果
     */
    public void cacheSuccess(T result) {
        String cacheKey = cacheKeyPrefix + ":last_success";
        redisUtils.setCacheObject(cacheKey, result, Duration.ofHours(1));
    }
}
```

## 事务与异常处理

### 事务回滚规则

```java
/**
 * 事务回滚配置示例
 */
@Service
@Slf4j
public class TransactionalExceptionService {

    /**
     * 默认回滚规则：RuntimeException和Error会触发回滚
     */
    @Transactional
    public void defaultRollback() {
        // ServiceException extends RuntimeException，会触发回滚
        throw ServiceException.of("业务异常");
    }

    /**
     * 指定回滚异常类型
     */
    @Transactional(rollbackFor = ServiceException.class)
    public void specificRollback() {
        throw ServiceException.of("指定回滚");
    }

    /**
     * 排除特定异常不回滚
     */
    @Transactional(noRollbackFor = WarningException.class)
    public void noRollbackForWarning() {
        throw new WarningException("警告异常，不回滚");
    }

    /**
     * 多异常规则
     */
    @Transactional(
            rollbackFor = {ServiceException.class, UserException.class},
            noRollbackFor = {SkipException.class}
    )
    public void multipleRules() {
        // 复杂回滚规则
    }
}

/**
 * 警告异常（不触发回滚）
 */
public class WarningException extends BaseBusinessException {
    public WarningException(String message) {
        super(message);
    }
}
```

### 异常后事务处理

```java
/**
 * 事务后异常处理器
 */
@Component
@Slf4j
public class TransactionExceptionHandler {

    @Autowired
    private ExceptionLogService exceptionLogService;

    /**
     * 事务提交后记录异常
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAfterCommit(ExceptionEvent event) {
        // 事务已提交，安全地记录异常日志
        exceptionLogService.saveLog(event.getException());
    }

    /**
     * 事务回滚后处理
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_ROLLBACK)
    public void handleAfterRollback(ExceptionEvent event) {
        log.warn("事务已回滚，异常: {}", event.getException().getMessage());

        // 发送告警通知
        notifyRollback(event);
    }

    /**
     * 异常事件
     */
    @Getter
    @AllArgsConstructor
    public static class ExceptionEvent {
        private final Exception exception;
        private final String transactionId;
    }
}
```

### 嵌套事务异常

```java
/**
 * 嵌套事务异常处理示例
 */
@Service
@Slf4j
public class NestedTransactionService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private LogMapper logMapper;

    /**
     * 主事务
     */
    @Transactional(rollbackFor = Exception.class)
    public void mainTransaction(UserBo bo) {
        // 保存用户
        userMapper.insert(bo.toUser());

        try {
            // 嵌套事务：保存日志
            saveLogInNewTransaction(bo);
        } catch (Exception e) {
            // 日志保存失败不影响主事务
            log.warn("日志保存失败，但不影响主事务: {}", e.getMessage());
        }

        // 继续主事务逻辑...
    }

    /**
     * 独立事务保存日志
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void saveLogInNewTransaction(UserBo bo) {
        OperationLog log = new OperationLog();
        log.setOperation("CREATE_USER");
        log.setData(JsonUtils.toJsonString(bo));
        logMapper.insert(log);

        // 即使这里抛异常，只回滚日志事务，不影响主事务
        if (someCondition()) {
            throw ServiceException.of("日志保存条件不满足");
        }
    }
}
```

## 单元测试中的异常处理

### 异常断言测试

```java
/**
 * 异常测试示例
 */
@SpringBootTest
class ExceptionTest {

    @Autowired
    private UserService userService;

    /**
     * 测试异常抛出
     */
    @Test
    void testServiceException() {
        // 使用 assertThrows 验证异常
        ServiceException exception = assertThrows(
                ServiceException.class,
                () -> userService.getUser(null)
        );

        assertEquals("用户ID不能为空", exception.getMessage());
    }

    /**
     * 测试异常类型和消息
     */
    @Test
    void testUserException() {
        UserException exception = assertThrows(
                UserException.class,
                () -> userService.login("nonexistent", "password")
        );

        // 验证异常详情
        assertEquals("user", exception.getModule());
        assertEquals("user.account.not.exists", exception.getCode());
    }

    /**
     * 测试业务码
     */
    @Test
    void testBusinessCode() {
        ServiceException exception = assertThrows(
                ServiceException.class,
                () -> orderService.cancelOrder(123L)
        );

        assertEquals(4001, exception.getBusinessCode());
    }

    /**
     * 测试异常链
     */
    @Test
    void testExceptionChain() {
        Exception exception = assertThrows(
                ServiceException.class,
                () -> fileService.uploadFile(null)
        );

        // 验证根因
        Throwable rootCause = ExceptionDebugUtils.getRootCause(exception);
        assertInstanceOf(NullPointerException.class, rootCause);
    }
}
```

### Mock异常测试

```java
/**
 * Mock异常测试
 */
@ExtendWith(MockitoExtension.class)
class MockExceptionTest {

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    /**
     * Mock数据库异常
     */
    @Test
    void testDatabaseException() {
        // 模拟数据库异常
        when(userMapper.selectById(anyLong()))
                .thenThrow(new DataAccessException("DB连接失败") {});

        ServiceException exception = assertThrows(
                ServiceException.class,
                () -> userService.getUser(1L)
        );

        assertTrue(exception.getMessage().contains("系统异常"));
    }

    /**
     * 验证异常后的行为
     */
    @Test
    void testExceptionBehavior() {
        when(userMapper.insert(any()))
                .thenThrow(ServiceException.of("用户已存在"));

        assertThrows(ServiceException.class,
                () -> userService.createUser(new UserBo()));

        // 验证异常后没有执行后续操作
        verify(userMapper, never()).updateById(any());
    }
}
```

### 异常测试工具类

```java
/**
 * 异常测试工具类
 */
public final class ExceptionTestUtils {

    private ExceptionTestUtils() {}

    /**
     * 断言抛出指定异常并验证消息
     */
    public static <T extends Exception> T assertThrowsWithMessage(
            Class<T> exceptionClass,
            String expectedMessage,
            Executable executable) {

        T exception = assertThrows(exceptionClass, executable);
        assertEquals(expectedMessage, exception.getMessage());
        return exception;
    }

    /**
     * 断言抛出ServiceException并验证业务码
     */
    public static ServiceException assertServiceException(
            int expectedCode,
            Executable executable) {

        ServiceException exception = assertThrows(ServiceException.class, executable);
        assertEquals(expectedCode, exception.getBusinessCode());
        return exception;
    }

    /**
     * 断言抛出UserException并验证错误码
     */
    public static UserException assertUserException(
            String expectedCode,
            Executable executable) {

        UserException exception = assertThrows(UserException.class, executable);
        assertEquals(expectedCode, exception.getCode());
        return exception;
    }

    /**
     * 断言不抛出异常
     */
    public static void assertNoException(Executable executable) {
        assertDoesNotThrow(executable);
    }
}
```

## 注意事项

### 1. 性能考虑

- 异常创建有性能开销，避免在循环中频繁抛出
- 使用静态工厂方法减少对象创建
- 异常信息避免过长，影响日志性能
- 堆栈跟踪获取代价较大，非必要不调用 `getStackTrace()`
- 考虑使用异常池化技术处理高频异常场景

```java
// ❌ 不推荐：循环中抛出异常
for (Item item : items) {
    if (!validate(item)) {
        throw ServiceException.of("验证失败: " + item.getId());
    }
}

// ✅ 推荐：收集错误后统一处理
List<String> errors = new ArrayList<>();
for (Item item : items) {
    if (!validate(item)) {
        errors.add("验证失败: " + item.getId());
    }
}
if (!errors.isEmpty()) {
    throw ServiceException.of("批量验证失败: " + String.join(", ", errors));
}
```

### 2. 内存管理

- 避免在异常中保存大对象引用
- 及时释放异常相关资源
- 注意异常对象的生命周期
- 异常消息字符串避免拼接大量数据
- 使用弱引用存储异常上下文中的临时对象

```java
// ❌ 不推荐：保存大对象
public class BadException extends ServiceException {
    private byte[] largeData; // 可能导致内存泄漏
}

// ✅ 推荐：只保存必要信息
public class GoodException extends ServiceException {
    private String dataId; // 只保存ID，需要时再查询
}
```

### 3. 安全考虑

- 不要在异常消息中暴露敏感信息
- 对外接口的异常消息要做脱敏处理
- 记录异常日志时注意数据安全
- 避免在异常消息中包含SQL语句、密码、密钥等敏感数据
- 生产环境关闭详细堆栈信息返回

```java
// ❌ 不推荐：暴露敏感信息
throw ServiceException.of("用户密码错误: " + password);
throw ServiceException.of("SQL执行失败: " + sql);

// ✅ 推荐：脱敏处理
throw ServiceException.of("用户认证失败");
throw ServiceException.of("数据查询异常，请联系管理员");
```

### 4. 国际化注意

- 异常消息的参数顺序在不同语言中可能不同
- 使用占位符时要考虑语法结构差异
- 测试多语言环境下的异常显示
- 确保所有国际化键都有对应的翻译
- 默认消息应该是通用的英文描述

```java
// 中文：用户 {0} 登录失败，原因：{1}
// 英文：Login failed for user {0}, reason: {1}
// 日文：ユーザー{0}のログインに失敗しました。理由：{1}

throw UserException.of("user.login.failed", username, reason);
```

### 5. 向后兼容

- 新增异常类型要保持API稳定
- 错误码一旦发布不要随意修改
- 消息格式变更要考虑客户端兼容性
- 弃用旧异常时提供迁移路径
- 版本升级时保持异常行为一致

```java
// 保持向后兼容的异常升级
@Deprecated
public class OldException extends ServiceException {
    // 保留旧异常，标记废弃
}

public class NewException extends ServiceException {
    // 新异常提供更多功能

    public static NewException fromOld(OldException old) {
        // 提供从旧异常转换的方法
        return new NewException(old.getMessage());
    }
}
```

### 6. 异常文档化

- 在方法签名中声明可能抛出的异常
- 使用 Javadoc 描述异常触发条件
- 维护异常错误码对照表
- 为 API 消费者提供异常处理指南

```java
/**
 * 用户登录
 *
 * @param username 用户名
 * @param password 密码
 * @return 登录用户信息
 * @throws UserException 当用户不存在时抛出 user.account.not.exists
 * @throws UserException 当密码错误时抛出 user.password.mismatch
 * @throws UserException 当账户被锁定时抛出 user.password.retry.locked
 */
public LoginUser login(String username, String password) throws UserException {
    // 实现...
}
```

### 7. 日志级别规范

- **ERROR**: 系统级异常、数据库异常、外部服务不可用
- **WARN**: 业务异常、参数校验失败、可恢复的错误
- **INFO**: 正常的业务流程异常（如用户名已存在）
- **DEBUG**: 调试信息、异常堆栈详情

```java
@ExceptionHandler(Exception.class)
public R<Void> handleException(Exception e) {
    if (e instanceof ServiceException) {
        log.warn("业务异常: {}", e.getMessage());
    } else if (e instanceof UserException) {
        log.info("用户异常: {}", e.getMessage());
    } else {
        log.error("系统异常: ", e);
    }
    return R.fail(e.getMessage());
}
```
