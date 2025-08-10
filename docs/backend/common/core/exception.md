# 异常处理

## 概述

ruoyi-common-core 提供了一套完整的异常处理体系，采用分层设计和统一管理的方式，确保系统异常的规范化处理。该体系支持国际化消息、错误码管理、异常分类等功能，为系统提供稳定可靠的异常处理机制。

## 异常体系架构

### 层次结构

```
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

异常可以自动转换为统一的响应格式 R&lt;T&gt;。

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

## 注意事项

### 1. 性能考虑

- 异常创建有性能开销，避免在循环中频繁抛出
- 使用静态工厂方法减少对象创建
- 异常信息避免过长，影响日志性能

### 2. 内存管理

- 避免在异常中保存大对象引用
- 及时释放异常相关资源
- 注意异常对象的生命周期

### 3. 安全考虑

- 不要在异常消息中暴露敏感信息
- 对外接口的异常消息要做脱敏处理
- 记录异常日志时注意数据安全

### 4. 国际化注意

- 异常消息的参数顺序在不同语言中可能不同
- 使用占位符时要考虑语法结构差异
- 测试多语言环境下的异常显示

### 5. 向后兼容

- 新增异常类型要保持API稳定
- 错误码一旦发布不要随意修改
- 消息格式变更要考虑客户端兼容性
