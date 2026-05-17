# 异常处理最佳实践

## 介绍

RuoYi-Plus 框架提供了完善的异常处理体系,通过统一的异常处理机制确保系统稳定性和友好的错误反馈。框架采用分层的异常处理架构,从基础异常类到全局异常处理器,构建了一套完整的异常管理方案。

**核心特性:**

- **分层异常体系** - 提供 BaseException、BaseBusinessException、ServiceException 等多层次异常类,适应不同业务场景
- **全局异常处理** - 通过 GlobalExceptionHandler 统一捕获和处理各类异常,返回规范的错误响应
- **友好错误提示** - 自动转换 Java 类型为中文描述,JSON 解析错误详细定位,提升用户体验
- **业务错误码** - 支持自定义业务错误码,方便前端识别和处理特定业务异常
- **参数验证集成** - 深度集成 Bean Validation,自动处理参数校验异常并返回友好提示
- **链式调用支持** - ServiceException 提供流畅的 API,支持链式设置错误码、详细信息等
- **国际化支持** - 异常消息支持国际化,通过错误码自动匹配多语言文案
- **SSE 特殊处理** - 针对 Server-Sent Events 连接中断等特殊场景提供定制化处理
- **模块化设计** - 不同模块可扩展自己的异常处理器,如 MyBatis、Redis、SaToken 等

## 异常体系架构

### 异常类层次

框架采用三层异常类设计:

```text
RuntimeException
  └── BaseException                  # 基础异常类
        ├── BaseBusinessException    # 业务异常基类
        │     └── ServiceException   # 业务逻辑异常(最常用)
        ├── UserException            # 用户相关异常
        │     ├── CaptchaException   # 验证码异常
        │     └── CaptchaExpireException # 验证码过期异常
        ├── FileException            # 文件操作异常
        └── SseException             # SSE 连接异常
```

### BaseException 基础异常

BaseException 是所有自定义异常的基类,提供了统一的异常信息管理机制,支持国际化消息、错误码、模块标识等功能。

```java
package plus.ruoyi.common.core.exception.base;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public abstract class BaseException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 所属模块
     */
    private String module;

    /**
     * 错误码
     */
    private String code;

    /**
     * 错误码对应的参数
     */
    private Object[] args;

    /**
     * 错误消息
     */
    private String defaultMessage;

    public BaseException(String module, String code, Object[] args, String defaultMessage) {
        this.module = module;
        this.code = code;
        this.args = args;
        this.defaultMessage = defaultMessage;
    }

    @Override
    public String getMessage() {
        String message = null;
        // 如果有国际化错误码,优先使用国际化消息
        if (StringUtils.isNotBlank(code) && RegexValidator.isValidI18nKey(code)) {
            message = MessageUtils.message(code, args);
        }
        if (message == null) {
            message = defaultMessage;
        }
        return message;
    }

    /**
     * 带原因异常的构造方法
     */
    public BaseException(String defaultMessage, Throwable cause) {
        super(cause);
        this.defaultMessage = defaultMessage;
    }
}
```

**设计要点:**

- 继承自 RuntimeException,支持非受检异常
- 支持国际化错误码自动解析
- 支持占位符参数动态替换
- 支持异常链追踪原始异常

### BaseBusinessException 业务异常基类

BaseBusinessException 继承自 BaseException,专门用于处理业务逻辑中的异常,支持业务错误码和详细错误信息。

```java
package plus.ruoyi.common.core.exception.base;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public abstract class BaseBusinessException extends BaseException {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 业务错误码
     */
    private Integer businessCode;

    /**
     * 详细错误信息,用于内部调试
     */
    private String detailMessage;

    /**
     * 设置错误提示
     *
     * @param message 错误提示
     * @return 当前对象,支持链式调用
     */
    public BaseBusinessException setMessage(String message) {
        super.setDefaultMessage(message);
        return this;
    }

    /**
     * 设置详细错误信息
     *
     * @param detailMessage 详细错误信息
     * @return 当前对象,支持链式调用
     */
    public BaseBusinessException setDetailMessage(String detailMessage) {
        this.detailMessage = detailMessage;
        return this;
    }

    /**
     * 设置业务错误码
     *
     * @param businessCode 业务错误码
     * @return 当前对象,支持链式调用
     */
    public BaseBusinessException setBusinessCode(Integer businessCode) {
        this.businessCode = businessCode;
        return this;
    }
}
```

**设计要点:**

- 支持业务错误码,方便前端识别特定业务异常
- 支持详细错误信息,用于内部调试和日志记录
- 提供链式调用 API,代码更简洁优雅

### ServiceException 业务逻辑异常

ServiceException 是最常用的业务异常类,继承自 BaseBusinessException,提供了丰富的构造方法和便捷的静态工厂方法。

```java
package plus.ruoyi.common.core.exception;

public final class ServiceException extends BaseBusinessException {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 构造业务异常
     *
     * @param message 错误提示
     */
    public ServiceException(String message) {
        super(message);
    }

    /**
     * 构造业务异常(支持占位符)
     *
     * @param message 错误提示(可包含占位符 {})
     * @param args    占位符参数
     */
    public ServiceException(String message, Object... args) {
        super(StrFormatter.format(message, args));
    }

    /**
     * 构造业务异常
     *
     * @param message      错误提示
     * @param businessCode 业务错误码
     */
    public ServiceException(String message, Integer businessCode) {
        super(message, businessCode);
    }

    /**
     * 构造业务异常(支持占位符)
     *
     * @param message      错误提示(可包含占位符 {})
     * @param businessCode 业务错误码
     * @param args         占位符参数
     */
    public ServiceException(String message, Integer businessCode, Object... args) {
        super(StrFormatter.format(message, args), businessCode);
    }

    /**
     * 构造业务异常(带原因)
     *
     * @param message 错误提示
     * @param cause   原因异常
     */
    public ServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    // ========== 静态工厂方法 ==========

    /**
     * 快速创建异常
     *
     * @param message 错误提示
     * @return 业务异常实例
     */
    public static ServiceException of(String message) {
        return new ServiceException(message);
    }

    /**
     * 快速创建异常(支持占位符)
     *
     * @param message 错误提示(可包含占位符 {})
     * @param args    占位符参数
     * @return 业务异常实例
     */
    public static ServiceException of(String message, Object... args) {
        return new ServiceException(message, args);
    }

    /**
     * 条件抛出异常
     *
     * @param condition 条件
     * @param message   错误提示
     */
    public static void throwIf(boolean condition, String message) {
        if (condition) {
            throw new ServiceException(message);
        }
    }

    /**
     * 条件抛出异常(支持占位符)
     *
     * @param condition 条件
     * @param message   错误提示(可包含占位符 {})
     * @param args      占位符参数
     */
    public static void throwIf(boolean condition, String message, Object... args) {
        if (condition) {
            throw new ServiceException(message, args);
        }
    }

    /**
     * 非空检查
     *
     * @param object  待检查对象
     * @param message 错误提示
     */
    public static void notNull(Object object, String message) {
        if (object == null) {
            throw new ServiceException(message);
        }
    }

    /**
     * 非空检查(支持占位符)
     *
     * @param object  待检查对象
     * @param message 错误提示(可包含占位符 {})
     * @param args    占位符参数
     */
    public static void notNull(Object object, String message, Object... args) {
        if (object == null) {
            throw new ServiceException(message, args);
        }
    }
}
```

**设计要点:**

- 提供多种构造方法,适应不同使用场景
- 支持占位符参数,方便动态消息构建
- 提供静态工厂方法 `of()`,代码更简洁
- 提供条件抛出 `throwIf()`,减少 if 判断代码
- 提供非空检查 `notNull()`,常用场景快捷使用

## 全局异常处理器

### GlobalExceptionHandler 实现

GlobalExceptionHandler 通过 `@RestControllerAdvice` 注解实现全局异常捕获,统一处理各类异常并返回规范的 JSON 响应。

```java
package plus.ruoyi.common.web.handler;

@Slf4j
@RestControllerAdvice
@Order(Integer.MAX_VALUE)
public class GlobalExceptionHandler {

    /**
     * 处理HTTP请求方法不支持异常
     * 场景: 客户端使用了不被支持的HTTP方法(如POST接口使用GET请求)
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<Void> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException e,
                                                        HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',不支持'{}'请求", requestUri, e.getMethod());
        return R.fail(HttpStatus.HTTP_BAD_METHOD, e.getMessage());
    }

    /**
     * 处理业务逻辑异常
     * 场景: 自定义的业务异常,通常包含特定的业务错误码
     */
    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e, HttpServletRequest request) {
        log.error(e.getMessage());
        Integer businessCode = e.getBusinessCode();
        // 如果有业务错误码则使用,否则使用默认错误响应
        return ObjectUtil.isNotNull(businessCode) ? R.fail(businessCode, e.getMessage()) : R.fail(e.getMessage());
    }

    /**
     * 处理SSE认证失败异常
     * 场景: Server-Sent Events连接时认证失败
     * 注意: 返回String类型以适配SSE响应格式
     */
    @ResponseStatus(org.springframework.http.HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(SseException.class)
    public String handleNotLoginException(SseException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.debug("请求地址'{}',认证失败'{}',无法访问系统资源", requestUri, e.getMessage());
        return JsonUtils.toJsonString(R.fail(HttpStatus.HTTP_UNAUTHORIZED, "认证失败，无法访问系统资源"));
    }

    /**
     * 处理路径变量缺失异常
     * 场景: @PathVariable注解的参数在URL中缺失
     * 例如: 接口定义为/user/{id},但请求URL为/user/
     */
    @ExceptionHandler(MissingPathVariableException.class)
    public R<Void> handleMissingPathVariableException(MissingPathVariableException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求路径中缺少必需的路径变量'{}',发生系统异常.", requestUri);
        return R.fail(String.format("请求路径中缺少必需的路径变量[%s]", e.getVariableName()));
    }

    /**
     * 处理方法参数类型不匹配异常
     * 场景: 请求参数无法转换为目标类型
     * 例如: 接口期望Integer类型,但传入了非数字字符串
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public R<Void> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e,
                                                               HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求参数类型不匹配'{}',发生系统异常.", requestUri);

        // 将Java类型转换为友好的中文描述
        String typeName = e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "未知类型";
        String friendlyType = convertJavaTypeToFriendly(typeName);

        return R.fail(String.format("参数[%s]格式错误,应为%s类型,实际输入: %s",
                e.getName(), friendlyType, e.getValue()));
    }

    /**
     * 将Java类型转换为友好的中文描述
     *
     * @param javaType Java类型简单名称
     * @return 友好的中文类型描述
     */
    private String convertJavaTypeToFriendly(String javaType) {
        return switch (javaType) {
            case "Integer", "int" -> "整数";
            case "Long", "long" -> "长整数";
            case "Double", "double", "Float", "float" -> "数字";
            case "Boolean", "boolean" -> "布尔值(true/false)";
            case "String" -> "文本";
            case "Date", "LocalDate" -> "日期";
            case "LocalDateTime", "Instant", "ZonedDateTime" -> "日期时间";
            case "LocalTime" -> "时间";
            case "BigDecimal" -> "精确数字";
            default -> javaType; // 未匹配到的保留原类型名
        };
    }

    /**
     * 处理404异常 - 找不到处理器
     * 场景: 请求的URL没有对应的Controller方法
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public R<Void> handleNoHandlerFoundException(NoHandlerFoundException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}'不存在.", requestUri);
        return R.fail(HttpStatus.HTTP_NOT_FOUND, e.getMessage());
    }

    /**
     * 处理静态资源不存在异常
     * 场景: 访问的静态资源文件不存在(如图片、CSS、JS等)
     * 只记录警告信息,不抛出异常,避免污染日志
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public R<Void> handleNoResourceFoundException(NoResourceFoundException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.warn("静态资源不存在: {}", requestUri);
        return R.fail(HttpStatus.HTTP_NOT_FOUND, "静态资源不存在");
    }

    /**
     * 处理IO异常(特别处理SSE连接中断)
     * 场景: 网络连接中断,特别是SSE长连接断开
     * 注意: SSE连接中断是正常现象,不返回错误响应
     */
    @ResponseStatus(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(IOException.class)
    public void handleRuntimeException(IOException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        if (requestUri.contains("sse")) {
            // SSE连接经常性中断(如用户关闭浏览器),属于正常现象,直接忽略
            return;
        }
        log.error("请求地址'{}',连接中断", requestUri, e);
    }

    /**
     * 处理运行时异常
     * 场景: 未被其他异常处理器捕获的RuntimeException
     */
    @ExceptionHandler(RuntimeException.class)
    public R<Void> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',发生未知异常.", requestUri, e);
        return R.fail(e.getMessage());
    }

    /**
     * 处理系统异常(兜底异常处理器)
     * 场景: 所有未被上述处理器捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',发生系统异常.", requestUri, e);
        return R.fail(e.getMessage());
    }
}
```

**处理器优先级:**

- 使用 `@Order(Integer.MAX_VALUE)` 设置最低优先级
- 模块化异常处理器(如 MybatisExceptionHandler、SaTokenExceptionHandler)可以设置更高优先级
- 优先级从高到低: 模块异常处理器 → 全局异常处理器

### 参数验证异常处理

框架深度集成 Bean Validation,自动处理参数校验异常并返回友好提示。

```java
/**
 * 处理数据绑定异常
 * 场景: 表单数据绑定到对象时发生的验证失败
 * 例如: @Valid注解的表单对象验证失败
 */
@ExceptionHandler(BindException.class)
public R<Void> handleBindException(BindException e) {
    log.error(e.getMessage());
    // 提取所有验证错误信息并拼接
    String message = StreamUtils.join(e.getAllErrors(),
                                     DefaultMessageSourceResolvable::getDefaultMessage, ", ");
    return R.fail(message);
}

/**
 * 处理约束违反异常
 * 场景: Bean Validation注解验证失败
 * 例如: @NotNull、@Size等注解验证不通过
 */
@ExceptionHandler(ConstraintViolationException.class)
public R<Void> constraintViolationException(ConstraintViolationException e) {
    log.error(e.getMessage());
    // 提取所有约束违反信息并拼接
    String message = StreamUtils.join(e.getConstraintViolations(),
                                     ConstraintViolation::getMessage, ", ");
    return R.fail(message);
}

/**
 * 处理方法参数验证异常
 * 场景: @RequestBody + @Valid注解的JSON对象验证失败
 */
@ExceptionHandler(MethodArgumentNotValidException.class)
public R<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
    log.error(e.getMessage());
    // 提取绑定结果中的所有错误信息
    String message = StreamUtils.join(e.getBindingResult().getAllErrors(),
                                     DefaultMessageSourceResolvable::getDefaultMessage, ", ");
    return R.fail(message);
}
```

**验证异常类型:**

- **BindException** - 表单数据绑定验证失败
- **ConstraintViolationException** - Bean Validation 注解验证失败
- **MethodArgumentNotValidException** - `@RequestBody` + `@Valid` 验证失败

### JSON 解析异常处理

框架提供了智能的 JSON 解析错误处理,能够准确定位错误位置并提供友好的错误提示。

```java
/**
 * 处理JSON解析异常
 * 场景: 请求体JSON格式错误,Jackson无法解析
 * 例如: JSON语法错误、缺少引号、括号不匹配等
 */
@ExceptionHandler(JsonParseException.class)
public R<Void> handleJsonParseException(JsonParseException e, HttpServletRequest request) {
    String requestUri = request.getRequestURI();
    log.error("请求地址'{}' 发生 JSON 解析异常: {}", requestUri, e.getMessage());

    // 提取位置信息(行列号)
    String location = "";
    if (e.getLocation() != null) {
        location = String.format("(第%d行,第%d列)",
                e.getLocation().getLineNr(),
                e.getLocation().getColumnNr());
    }

    return R.fail(HttpStatus.HTTP_BAD_REQUEST,
            String.format("请求数据格式错误%s,请检查JSON格式是否正确", location));
}

/**
 * 处理HTTP消息读取异常
 * 场景: 请求体无法读取或转换为目标对象
 * 例如: JSON字段类型不匹配、必填字段缺失等
 */
@ExceptionHandler(HttpMessageNotReadableException.class)
public R<Void> handleHttpMessageNotReadableException(HttpMessageNotReadableException e,
                                                       HttpServletRequest request) {
    log.error("请求地址'{}', 参数解析失败: {}", request.getRequestURI(), e.getMessage());

    // 获取根本原因
    Throwable cause = e.getMostSpecificCause();
    String errorMessage = cause.getMessage();

    // 解析并返回友好的错误消息
    String friendlyMessage = parseHttpMessageError(errorMessage);
    return R.fail(HttpStatus.HTTP_BAD_REQUEST, friendlyMessage);
}

/**
 * 解析HTTP消息读取错误,提取关键信息
 *
 * @param errorMessage 原始错误消息
 * @return 友好的错误提示
 */
private String parseHttpMessageError(String errorMessage) {
    if (errorMessage == null) {
        return "请求参数格式错误";
    }

    // 缺少请求体
    if (errorMessage.contains("Required request body is missing")) {
        return "缺少请求体数据";
    }

    // JSON字段类型不匹配
    if (errorMessage.contains("Cannot deserialize value of type")) {
        Pattern typePattern = Pattern.compile(
            "Cannot deserialize value of type `([^`]+)`.*from ([^:]+)",
            Pattern.CASE_INSENSITIVE
        );
        Matcher typeMatcher = typePattern.matcher(errorMessage);

        if (typeMatcher.find()) {
            String javaType = typeMatcher.group(1);
            String fromValue = typeMatcher.group(2);

            // 提取类型简单名称
            String simpleType = javaType.substring(javaType.lastIndexOf('.') + 1);
            String friendlyType = convertJavaTypeToFriendly(simpleType);

            return String.format("字段值格式错误,应为%s类型,实际输入: %s",
                               friendlyType, fromValue.trim());
        }
        return "请求参数类型不匹配";
    }

    // 枚举值不匹配
    if (errorMessage.contains("not one of the values accepted for Enum")) {
        Pattern enumPattern = Pattern.compile("\\[([^\\]]+)\\]", Pattern.CASE_INSENSITIVE);
        Matcher enumMatcher = enumPattern.matcher(errorMessage);

        if (enumMatcher.find()) {
            String acceptedValues = enumMatcher.group(1);
            return String.format("枚举值不正确,允许的值: [%s]", acceptedValues);
        }
        return "枚举值不正确";
    }

    // JSON语法错误
    if (errorMessage.contains("Unexpected character") ||
        errorMessage.contains("Unexpected end-of-input") ||
        errorMessage.contains("was expecting")) {
        return "JSON格式错误,请检查语法是否正确";
    }

    // 默认错误消息
    return "请求参数格式错误";
}
```

**智能错误解析:**

- 自动提取 JSON 错误位置(行号、列号)
- 智能识别类型不匹配错误并转换为中文描述
- 自动提取枚举允许值列表
- 识别 JSON 语法错误类型

## 业务异常使用

### 基本用法

在 Service 层业务逻辑中抛出 ServiceException:

```java
@Service
public class OrderServiceImpl implements IOrderService {

    private final IOrderDao orderDao;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(OrderBo bo) {
        if (bo.getId() == null) {
            throw ServiceException.of("订单ID不能为空");
        }
        if (!orderDao.exists(bo.getId())) {
            throw ServiceException.of("订单不存在");
        }
        Order entity = MapstructUtils.convert(bo, Order.class);
        return orderDao.updateById(entity);
    }
}
```

**使用说明:**

- 使用 `ServiceException.of()` 静态工厂方法创建异常
- 异常会被 GlobalExceptionHandler 自动捕获
- 自动返回规范的 JSON 响应: `{ "code": 500, "msg": "订单ID不能为空" }`

### 占位符参数

使用占位符动态构建错误消息:

```java
@Override
public OrderVo get(Long id) {
    Order entity = orderDao.getById(id);
    if (entity == null) {
        throw ServiceException.of("订单不存在: ID={}", id);
    }
    return MapstructUtils.convert(entity, OrderVo.class);
}

@Override
@Transactional(rollbackFor = Exception.class)
public boolean cancelOrder(String orderNo, Long userId) {
    Order existingOrder = orderDao.getByOrderNoAndUserId(orderNo, userId);

    if (existingOrder == null) {
        throw ServiceException.of("未找到订单或无权限操作: {}", orderNo);
    }

    // 检查订单状态
    if (!DictOrderStatus.PENDING.getValue().equals(existingOrder.getOrderStatus())) {
        throw ServiceException.of("订单状态不允许取消,当前状态: {}",
                                 existingOrder.getOrderStatus());
    }

    existingOrder.setOrderStatus(DictOrderStatus.CANCELLED.getValue());
    return orderDao.updateById(existingOrder);
}
```

**使用说明:**

- 占位符使用 `{}` 语法,由 Hutool 的 StrFormatter 解析
- 支持多个占位符,按顺序替换
- 提升错误消息的可读性和可维护性

### 业务错误码

使用业务错误码标识特定业务异常:

```java
@Service
public class ProductServiceImpl implements IProductService {

    private static final Integer ERROR_CODE_INSUFFICIENT_STOCK = 1001;
    private static final Integer ERROR_CODE_PRODUCT_OFFLINE = 1002;
    private static final Integer ERROR_CODE_PRICE_CHANGED = 1003;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(Long productId, Integer quantity) {
        Product product = productDao.getById(productId);

        // 检查商品是否下架
        if (!product.getOnline()) {
            throw ServiceException.of("商品已下架", ERROR_CODE_PRODUCT_OFFLINE);
        }

        // 检查库存
        if (product.getStock() < quantity) {
            throw ServiceException.of("库存不足,剩余库存: {}",
                                    ERROR_CODE_INSUFFICIENT_STOCK,
                                    product.getStock());
        }

        // 检查价格是否变化
        BigDecimal currentPrice = product.getPrice();
        if (!currentPrice.equals(orderBo.getExpectedPrice())) {
            throw ServiceException.of("商品价格已变化,当前价格: {}",
                                    ERROR_CODE_PRICE_CHANGED,
                                    currentPrice);
        }

        // 扣减库存并创建订单
        product.setStock(product.getStock() - quantity);
        productDao.updateById(product);

        return true;
    }
}
```

**响应示例:**

```json
{
  "code": 1001,
  "msg": "库存不足,剩余库存: 5",
  "data": null
}
```

**前端处理:**

```typescript
try {
  await createOrder(productId, quantity)
} catch (error) {
  if (error.code === 1001) {
    // 库存不足,跳转到通知页面
    uni.showModal({
      title: '提示',
      content: error.msg,
      showCancel: false
    })
  } else if (error.code === 1002) {
    // 商品下架,返回列表页
    uni.navigateBack()
  } else if (error.code === 1003) {
    // 价格变化,刷新商品信息
    await refreshProduct()
  }
}
```

### 条件抛出

使用 `throwIf()` 简化条件判断代码:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean batchDelete(Collection<Long> ids) {
    // 传统写法
    if (CollUtil.isEmpty(ids)) {
        throw ServiceException.of("ID集合不能为空");
    }

    // 使用 throwIf 简化
    ServiceException.throwIf(CollUtil.isEmpty(ids), "ID集合不能为空");

    beforeDelete(ids);
    return orderDao.deleteByIds(ids);
}

@Override
public OrderVo getByOutTradeNo(String outTradeNo, boolean syncPaymentStatus) {
    // 使用 throwIf 简化多个条件判断
    ServiceException.throwIf(StringUtils.isBlank(outTradeNo), "订单号不能为空");

    Order order = orderDao.getByOrderNo(outTradeNo);
    ServiceException.throwIf(order == null, "订单不存在: {}", outTradeNo);

    return MapstructUtils.convert(order, OrderVo.class);
}
```

**使用说明:**

- `throwIf()` 会在条件为 true 时抛出异常
- 减少 if 判断代码,逻辑更清晰
- 支持占位符参数和业务错误码

### 非空检查

使用 `notNull()` 快捷进行非空检查:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public Long add(OrderBo bo) {
    // 传统写法
    if (bo == null) {
        throw ServiceException.of("订单参数不能为空");
    }
    if (bo.getUserId() == null) {
        throw ServiceException.of("用户ID不能为空");
    }

    // 使用 notNull 简化
    ServiceException.notNull(bo, "订单参数不能为空");
    ServiceException.notNull(bo.getUserId(), "用户ID不能为空");
    ServiceException.notNull(bo.getGoodsId(), "商品ID不能为空");
    ServiceException.notNull(bo.getPrice(), "商品价格不能为空");

    Order entity = MapstructUtils.convert(bo, Order.class);
    orderDao.insert(entity);
    return entity.getId();
}
```

**使用说明:**

- `notNull()` 会在对象为 null 时抛出异常
- 常用于参数校验场景
- 支持占位符参数

### 异常链追踪

保留原始异常信息,方便问题排查:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public CreateOrderVo createOrder(CreateOrderBo bo) {
    try {
        log.info("开始创建订单: goodsId={}, userId={}", bo.getGoodsId(), bo.getUserId());

        // 数据校验
        validateOrderData(bo);

        // 保存订单
        Order order = new Order();
        // ... 设置订单属性
        orderDao.insert(order);

        // 构建返回对象
        CreateOrderVo vo = new CreateOrderVo();
        // ... 设置返回属性

        log.info("订单创建成功: orderId={}, orderNo={}", order.getId(), order.getOrderNo());
        return vo;

    } catch (Exception e) {
        log.error("创建订单失败: goodsId={}, userId={}, 错误: {}",
                bo.getGoodsId(), bo.getUserId(), e.getMessage(), e);
        throw new ServiceException("创建订单失败: " + e.getMessage(), e);
    }
}
```

**使用说明:**

- 使用带 Throwable 参数的构造方法保留异常链
- 日志中会输出完整的异常堆栈
- 方便追踪问题根源

## 模块化异常处理

### MybatisExceptionHandler

处理 MyBatis 相关异常:

```java
package plus.ruoyi.common.mybatis.handler;

@Slf4j
@RestControllerAdvice
@Order(Integer.MAX_VALUE - 100)
public class MybatisExceptionHandler {

    /**
     * 处理主键或唯一键冲突异常
     */
    @ExceptionHandler(DuplicateKeyException.class)
    public R<Void> handleDuplicateKeyException(DuplicateKeyException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',数据库唯一约束冲突", requestUri, e);
        return R.fail("数据重复,请检查唯一性约束字段");
    }

    /**
     * 处理数据库操作异常
     */
    @ExceptionHandler(MyBatisSystemException.class)
    public R<Void> handleMyBatisSystemException(MyBatisSystemException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',数据库操作异常", requestUri, e);
        return R.fail("数据库操作失败");
    }
}
```

### SaTokenExceptionHandler

处理 SaToken 认证授权异常:

```java
package plus.ruoyi.common.satoken.handler;

@Slf4j
@RestControllerAdvice
@Order(Integer.MAX_VALUE - 200)
public class SaTokenExceptionHandler {

    /**
     * 处理未登录异常
     */
    @ExceptionHandler(NotLoginException.class)
    public R<Void> handleNotLoginException(NotLoginException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.debug("请求地址'{}',认证失败'{}',无法访问系统资源", requestUri, e.getMessage());
        return R.fail(HttpStatus.HTTP_UNAUTHORIZED, "认证失败,无法访问系统资源");
    }

    /**
     * 处理权限不足异常
     */
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',权限不足'{}'", requestUri, e.getMessage());
        return R.fail(HttpStatus.HTTP_FORBIDDEN, "没有访问权限,请联系管理员授权");
    }

    /**
     * 处理角色不足异常
     */
    @ExceptionHandler(NotRoleException.class)
    public R<Void> handleNotRoleException(NotRoleException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',角色不足'{}'", requestUri, e.getMessage());
        return R.fail(HttpStatus.HTTP_FORBIDDEN, "没有访问权限,请联系管理员授权");
    }
}
```

### RedisExceptionHandler

处理 Redis 连接异常:

```java
package plus.ruoyi.common.redis.handler;

@Slf4j
@RestControllerAdvice
@Order(Integer.MAX_VALUE - 150)
public class RedisExceptionHandler {

    /**
     * 处理Redis连接异常
     */
    @ExceptionHandler(RedisConnectionException.class)
    public R<Void> handleRedisConnectionException(RedisConnectionException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',Redis连接失败", requestUri, e);
        return R.fail("缓存服务连接失败,请稍后重试");
    }
}
```

**优先级说明:**

- GlobalExceptionHandler: `Integer.MAX_VALUE` (最低优先级)
- MybatisExceptionHandler: `Integer.MAX_VALUE - 100`
- RedisExceptionHandler: `Integer.MAX_VALUE - 150`
- SaTokenExceptionHandler: `Integer.MAX_VALUE - 200` (最高优先级)

## 最佳实践

### 1. 合理划分异常类型

**✅ 推荐:**

```java
@Service
public class UserServiceImpl implements IUserService {

    @Override
    public UserVo get(Long id) {
        // 参数校验失败 - 使用 ServiceException
        ServiceException.notNull(id, "用户ID不能为空");

        User user = userDao.getById(id);

        // 业务规则校验失败 - 使用 ServiceException
        ServiceException.notNull(user, "用户不存在");

        // 状态检查失败 - 使用 ServiceException
        ServiceException.throwIf(user.getDeleted(), "用户已删除");
        ServiceException.throwIf(!user.getStatus(), "用户已禁用");

        return MapstructUtils.convert(user, UserVo.class);
    }
}
```

**❌ 不推荐:**

```java
@Override
public UserVo get(Long id) {
    // 不要使用通用的 RuntimeException
    if (id == null) {
        throw new RuntimeException("用户ID不能为空");
    }

    // 不要使用 IllegalArgumentException 处理业务异常
    User user = userDao.getById(id);
    if (user == null) {
        throw new IllegalArgumentException("用户不存在");
    }

    return MapstructUtils.convert(user, UserVo.class);
}
```

**原因:**

- ServiceException 会被全局异常处理器正确处理
- 提供统一的错误响应格式
- 支持业务错误码和国际化

### 2. 使用业务错误码

**✅ 推荐:**

```java
public class ErrorCode {
    // 用户模块错误码
    public static final Integer USER_NOT_FOUND = 2001;
    public static final Integer USER_DISABLED = 2002;
    public static final Integer USER_DELETED = 2003;

    // 订单模块错误码
    public static final Integer ORDER_NOT_FOUND = 3001;
    public static final Integer ORDER_STATUS_INVALID = 3002;
    public static final Integer INSUFFICIENT_STOCK = 3003;
}

@Service
public class UserServiceImpl implements IUserService {

    @Override
    public UserVo get(Long id) {
        User user = userDao.getById(id);
        ServiceException.throwIf(user == null, "用户不存在", ErrorCode.USER_NOT_FOUND);
        ServiceException.throwIf(user.getDeleted(), "用户已删除", ErrorCode.USER_DELETED);
        ServiceException.throwIf(!user.getStatus(), "用户已禁用", ErrorCode.USER_DISABLED);

        return MapstructUtils.convert(user, UserVo.class);
    }
}
```

**前端处理:**

```typescript
// 前端可以根据错误码做特殊处理
const handleUserError = (error: any) => {
  switch (error.code) {
    case 2001: // USER_NOT_FOUND
      uni.showToast({ title: '用户不存在', icon: 'none' })
      uni.navigateBack()
      break
    case 2002: // USER_DISABLED
      uni.showModal({ title: '提示', content: '账号已禁用,请联系管理员' })
      break
    case 2003: // USER_DELETED
      uni.showToast({ title: '用户已删除', icon: 'none' })
      uni.navigateBack()
      break
    default:
      uni.showToast({ title: error.msg, icon: 'none' })
  }
}
```

### 3. 完善的日志记录

**✅ 推荐:**

```java
@Override
@Transactional(rollbackFor = Exception.class)
public CreateOrderVo createOrder(CreateOrderBo bo) {
    try {
        log.info("开始创建订单: goodsId={}, userId={}, price={}",
                bo.getGoodsId(), bo.getUserId(), bo.getPrice());

        validateOrderData(bo);

        Order order = new Order();
        // ... 设置订单属性
        orderDao.insert(order);

        log.info("订单创建成功: orderId={}, orderNo={}", order.getId(), order.getOrderNo());

        return buildCreateOrderVo(order);

    } catch (ServiceException e) {
        // 业务异常直接抛出,不记录完整堆栈
        log.warn("创建订单业务校验失败: goodsId={}, userId={}, 原因: {}",
                bo.getGoodsId(), bo.getUserId(), e.getMessage());
        throw e;

    } catch (Exception e) {
        // 系统异常记录完整堆栈
        log.error("创建订单系统异常: goodsId={}, userId={}, 错误: {}",
                bo.getGoodsId(), bo.getUserId(), e.getMessage(), e);
        throw new ServiceException("创建订单失败: " + e.getMessage(), e);
    }
}
```

**日志级别:**

- **INFO** - 正常业务流程的关键节点
- **WARN** - 业务校验失败(预期内的异常)
- **ERROR** - 系统异常(非预期的异常)

### 4. 事务回滚处理

**✅ 推荐:**

```java
@Service
public class OrderServiceImpl implements IOrderService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(CreateOrderBo bo) {
        // 1. 校验参数
        validateOrderData(bo);

        // 2. 扣减库存
        boolean stockDeducted = productService.deductStock(bo.getGoodsId(), bo.getQuantity());
        ServiceException.throwIf(!stockDeducted, "库存扣减失败");

        // 3. 创建订单
        Order order = buildOrder(bo);
        orderDao.insert(order);

        // 4. 创建支付记录
        paymentService.createPayment(order.getOrderNo(), order.getTotalAmount());

        // 任何步骤抛出 Exception 都会回滚事务
        return true;
    }
}
```

**注意事项:**

- 使用 `@Transactional(rollbackFor = Exception.class)` 确保所有异常都回滚
- ServiceException 继承自 RuntimeException,会自动回滚
- 不要捕获异常后不抛出,否则事务不会回滚

### 5. 避免敏感信息泄露

**✅ 推荐:**

```java
@Override
public UserVo login(String username, String password) {
    User user = userDao.getByUsername(username);

    // 不要暴露具体是用户名还是密码错误
    if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
        throw ServiceException.of("用户名或密码错误");
    }

    // 不要在错误消息中包含敏感信息
    ServiceException.throwIf(!user.getStatus(), "账号已禁用,请联系管理员");

    return buildUserVo(user);
}
```

**❌ 不推荐:**

```java
@Override
public UserVo login(String username, String password) {
    User user = userDao.getByUsername(username);

    // ❌ 不要暴露用户是否存在
    if (user == null) {
        throw ServiceException.of("用户不存在: {}", username);
    }

    // ❌ 不要暴露密码错误的具体原因
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw ServiceException.of("密码错误,正确的密码长度为: {}", user.getPassword().length());
    }

    return buildUserVo(user);
}
```

### 6. 统一异常处理顺序

**✅ 推荐:**

```java
@Service
public class OrderServiceImpl implements IOrderService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateOrderStatus(Long orderId, String newStatus) {
        // 1. 参数校验(最先)
        ServiceException.notNull(orderId, "订单ID不能为空");
        ServiceException.notNull(newStatus, "订单状态不能为空");

        // 2. 数据存在性校验
        Order order = orderDao.getById(orderId);
        ServiceException.notNull(order, "订单不存在");

        // 3. 业务规则校验
        ServiceException.throwIf(order.getDeleted(), "订单已删除,无法修改状态");

        // 4. 状态转换规则校验
        validateStatusTransition(order.getOrderStatus(), newStatus);

        // 5. 执行业务逻辑
        order.setOrderStatus(newStatus);
        return orderDao.updateById(order);
    }

    private void validateStatusTransition(String oldStatus, String newStatus) {
        // 状态转换规则校验
        if (DictOrderStatus.CANCELLED.getValue().equals(oldStatus)) {
            throw ServiceException.of("已取消的订单无法修改状态");
        }
        if (DictOrderStatus.COMPLETED.getValue().equals(oldStatus)) {
            throw ServiceException.of("已完成的订单无法修改状态");
        }
        // ... 更多规则
    }
}
```

**校验顺序:**

1. 参数校验(非空、格式等)
2. 数据存在性校验
3. 权限校验
4. 业务规则校验
5. 状态转换规则校验
6. 执行业务逻辑

### 7. 自定义业务异常类

对于特定领域,可以创建专用的异常类:

**✅ 推荐:**

```java
// 支付相关异常
public class PayException extends BaseBusinessException {

    public PayException(String message) {
        super(message);
    }

    public PayException(String message, Integer businessCode) {
        super(message, businessCode);
    }

    public static PayException of(String message) {
        return new PayException(message);
    }

    public static PayException insufficientBalance(BigDecimal balance, BigDecimal required) {
        return new PayException(
            String.format("余额不足,当前余额: %s,需要: %s", balance, required),
            PayErrorCode.INSUFFICIENT_BALANCE
        );
    }

    public static PayException paymentTimeout() {
        return new PayException("支付超时", PayErrorCode.PAYMENT_TIMEOUT);
    }
}

// 在 GlobalExceptionHandler 中添加处理器
@ExceptionHandler(PayException.class)
public R<Void> handlePayException(PayException e) {
    log.error("支付异常: {}", e.getMessage());
    return ObjectUtil.isNotNull(e.getBusinessCode())
        ? R.fail(e.getBusinessCode(), e.getMessage())
        : R.fail(e.getMessage());
}
```

**使用场景:**

```java
@Service
public class PaymentServiceImpl implements IPaymentService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PayResult pay(Long userId, BigDecimal amount) {
        User user = userDao.getById(userId);

        // 使用专用异常类
        if (user.getBalance().compareTo(amount) < 0) {
            throw PayException.insufficientBalance(user.getBalance(), amount);
        }

        // 扣减余额
        user.setBalance(user.getBalance().subtract(amount));
        userDao.updateById(user);

        return PayResult.success();
    }
}
```

## 常见问题

### 1. 异常被吞掉,没有返回给前端

**问题原因:**

- 在 Service 层捕获了异常但没有重新抛出
- 使用了错误的异常处理方式

**❌ 错误示例:**

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean createOrder(CreateOrderBo bo) {
    try {
        validateOrderData(bo);

        Order order = buildOrder(bo);
        orderDao.insert(order);

        return true;
    } catch (Exception e) {
        log.error("创建订单失败", e);
        return false; // ❌ 异常被吞掉,前端收到 success 响应
    }
}
```

**✅ 正确做法:**

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean createOrder(CreateOrderBo bo) {
    try {
        validateOrderData(bo);

        Order order = buildOrder(bo);
        orderDao.insert(order);

        return true;
    } catch (ServiceException e) {
        // 业务异常直接抛出
        log.warn("创建订单业务校验失败: {}", e.getMessage());
        throw e;
    } catch (Exception e) {
        // 系统异常转换为 ServiceException 后抛出
        log.error("创建订单系统异常", e);
        throw new ServiceException("创建订单失败: " + e.getMessage(), e);
    }
}
```

### 2. 事务不回滚

**问题原因:**

- 捕获了异常但没有抛出
- 事务注解没有配置 `rollbackFor = Exception.class`
- 异常类型不是 RuntimeException 的子类

**❌ 错误示例:**

```java
@Override
@Transactional  // ❌ 默认只回滚 RuntimeException
public boolean createOrder(CreateOrderBo bo) {
    try {
        // 扣减库存
        productService.deductStock(bo.getGoodsId(), bo.getQuantity());

        // 创建订单
        Order order = buildOrder(bo);
        orderDao.insert(order);

        return true;
    } catch (Exception e) {
        log.error("创建订单失败", e);
        return false; // ❌ 异常被捕获,事务不回滚
    }
}
```

**✅ 正确做法:**

```java
@Override
@Transactional(rollbackFor = Exception.class)  // ✅ 配置回滚所有异常
public boolean createOrder(CreateOrderBo bo) {
    // 扣减库存
    productService.deductStock(bo.getGoodsId(), bo.getQuantity());

    // 创建订单
    Order order = buildOrder(bo);
    orderDao.insert(order);

    return true;
    // ✅ 任何异常都会导致事务回滚
}
```

### 3. 异常消息不友好

**问题原因:**

- 直接抛出原始异常消息
- 没有对技术错误进行业务化翻译

**❌ 错误示例:**

```java
@Override
public UserVo get(Long id) {
    try {
        User user = userDao.getById(id);
        return MapstructUtils.convert(user, UserVo.class);
    } catch (Exception e) {
        // ❌ 抛出原始异常消息,用户看不懂
        throw new ServiceException(e.getMessage());
    }
}
```

前端收到: `"Could not open JDBC Connection for transaction; nested exception is..."`

**✅ 正确做法:**

```java
@Override
public UserVo get(Long id) {
    try {
        ServiceException.notNull(id, "用户ID不能为空");

        User user = userDao.getById(id);
        ServiceException.notNull(user, "用户不存在");

        return MapstructUtils.convert(user, UserVo.class);
    } catch (ServiceException e) {
        // 业务异常直接抛出
        throw e;
    } catch (DataAccessException e) {
        // 数据库异常转换为友好消息
        log.error("查询用户失败: id={}", id, e);
        throw new ServiceException("查询用户信息失败,请稍后重试");
    } catch (Exception e) {
        // 其他异常统一处理
        log.error("获取用户信息异常: id={}", id, e);
        throw new ServiceException("系统繁忙,请稍后重试");
    }
}
```

前端收到: `"用户不存在"` 或 `"查询用户信息失败,请稍后重试"`

### 4. 并发场景下的异常处理

**问题场景:**

多个用户同时下单,导致库存扣减异常。

**❌ 错误示例:**

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean createOrder(CreateOrderBo bo) {
    Product product = productDao.getById(bo.getGoodsId());

    // ❌ 并发场景下可能超卖
    if (product.getStock() < bo.getQuantity()) {
        throw ServiceException.of("库存不足");
    }

    product.setStock(product.getStock() - bo.getQuantity());
    productDao.updateById(product);

    Order order = buildOrder(bo);
    orderDao.insert(order);

    return true;
}
```

**✅ 正确做法 - 使用乐观锁:**

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean createOrder(CreateOrderBo bo) {
    Product product = productDao.getById(bo.getGoodsId());

    ServiceException.throwIf(product.getStock() < bo.getQuantity(), "库存不足");

    // 使用乐观锁更新库存
    boolean success = productDao.deductStockWithOptimisticLock(
        product.getId(),
        bo.getQuantity(),
        product.getVersion()
    );

    // 乐观锁更新失败,说明库存被其他事务修改
    ServiceException.throwIf(!success, "库存扣减失败,请重试");

    Order order = buildOrder(bo);
    orderDao.insert(order);

    return true;
}
```

**Mapper 实现:**

```java
@Update("UPDATE t_product SET stock = stock - #{quantity}, version = version + 1 " +
        "WHERE id = #{productId} AND version = #{version} AND stock >= #{quantity}")
boolean deductStockWithOptimisticLock(@Param("productId") Long productId,
                                      @Param("quantity") Integer quantity,
                                      @Param("version") Integer version);
```

### 5. 跨服务调用的异常处理

**问题场景:**

微服务架构下,调用其他服务失败时的异常处理。

**✅ 推荐做法:**

```java
@Service
public class OrderServiceImpl implements IOrderService {

    @Autowired
    private PaymentFeignClient paymentFeignClient;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CreateOrderVo createOrder(CreateOrderBo bo) {
        try {
            // 1. 创建订单
            Order order = buildOrder(bo);
            orderDao.insert(order);

            // 2. 调用支付服务创建支付记录
            R<PaymentVo> result = paymentFeignClient.createPayment(
                order.getOrderNo(),
                order.getTotalAmount()
            );

            // 3. 检查调用结果
            if (!result.isSuccess()) {
                log.error("创建支付记录失败: orderNo={}, msg={}",
                         order.getOrderNo(), result.getMsg());
                throw ServiceException.of("创建支付记录失败: {}", result.getMsg());
            }

            return buildCreateOrderVo(order);

        } catch (ServiceException e) {
            throw e;
        } catch (FeignException e) {
            // Feign 调用异常
            log.error("调用支付服务异常", e);
            throw new ServiceException("支付服务暂时不可用,请稍后重试");
        } catch (Exception e) {
            log.error("创建订单失败", e);
            throw new ServiceException("创建订单失败: " + e.getMessage(), e);
        }
    }
}
```

**要点:**

- 检查远程调用的返回结果
- 将 Feign 异常转换为友好的业务异常
- 记录详细的错误日志,包括调用参数和返回值

## 总结

RuoYi-Plus 框架的异常处理体系提供了完善的异常管理机制:

**异常类设计:**

- BaseException - 基础异常,支持国际化和模块化
- BaseBusinessException - 业务异常基类,支持业务错误码
- ServiceException - 最常用的业务异常,提供丰富的 API

**全局异常处理:**

- GlobalExceptionHandler - 统一捕获和处理各类异常
- 模块化异常处理器 - 针对特定模块的异常处理(MyBatis、SaToken、Redis 等)
- 友好的错误提示 - 自动转换技术错误为业务化描述

**最佳实践:**

- 合理划分异常类型,使用 ServiceException 处理业务异常
- 使用业务错误码标识特定业务异常,方便前端识别
- 完善的日志记录,区分业务异常和系统异常
- 正确配置事务回滚,确保数据一致性
- 避免敏感信息泄露,提供友好的错误提示
- 统一异常处理顺序,先校验参数再执行业务逻辑

通过遵循这些最佳实践,可以构建健壮、友好的异常处理机制,提升系统稳定性和用户体验。
