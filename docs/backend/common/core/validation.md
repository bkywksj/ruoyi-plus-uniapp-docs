# 参数校验 (Validation Framework)

## 模块简介

参数校验模块提供了一套完整的数据验证框架，基于 Jakarta Bean Validation (JSR-303) 标准，集成了国际化支持、自定义校验注解和分组校验功能。该模块不仅支持标准的校验注解，还提供了针对业务场景的专用校验器。

## 核心特性

### 国际化支持
- 支持简化的国际化键格式
- 自动消息插值处理
- 多语言错误提示

### 自定义校验注解
- XSS 攻击防护校验
- 字典值校验
- 枚举值校验

### 分组校验
- 新增操作校验组
- 编辑操作校验组
- 查询操作校验组

### 性能优化
- 快速失败模式
- 枚举值缓存机制
- 高效的正则表达式匹配

## 校验框架配置

### 全局校验器配置

```java
@AutoConfiguration(before = ValidationAutoConfiguration.class)
public class ValidatorConfig {
    
    @Bean
    public Validator validator(MessageSource messageSource) {
        try (LocalValidatorFactoryBean factoryBean = new LocalValidatorFactoryBean()) {
            // 设置自定义的国际化消息拦截器
            factoryBean.setMessageInterpolator(new I18nMessageInterceptor(messageSource));
            
            // 使用 HibernateValidator 校验器
            factoryBean.setProviderClass(HibernateValidator.class);
            
            // 配置快速失败模式
            Properties properties = new Properties();
            properties.setProperty("hibernate.validator.fail_fast", "true");
            factoryBean.setValidationProperties(properties);
            
            factoryBean.afterPropertiesSet();
            return factoryBean.getValidator();
        }
    }
}
```

### 国际化消息拦截器

```java
@Component
public class I18nMessageInterceptor implements MessageInterpolator {
    
    private final MessageSource messageSource;
    private final MessageInterpolator defaultInterpolator;
    
    @Override
    public String interpolate(String messageTemplate, Context context, Locale locale) {
        if (StringUtils.isBlank(messageTemplate)) {
            return messageTemplate;
        }
        
        String trimmedTemplate = messageTemplate.trim();
        
        // 判断是否为简化的国际化键格式
        if (RegexValidator.isValidI18nKey(trimmedTemplate)) {
            try {
                // 获取国际化消息
                String i18nMessage = messageSource.getMessage(trimmedTemplate, null, locale);
                
                // 将国际化消息交给默认插值器处理约束属性
                return defaultInterpolator.interpolate(i18nMessage, context, locale);
                
            } catch (Exception e) {
                return trimmedTemplate;
            }
        }
        
        // 其他情况委托给默认插值器处理
        return defaultInterpolator.interpolate(messageTemplate, context, locale);
    }
}
```

**特性说明:**
- 支持简化的国际化键格式（无需花括号）
- 自动处理约束属性插值
- 降级处理机制，确保系统稳定性

## 校验分组 (Validation Groups)

### 基础分组定义

#### 新增操作校验组
```java
/**
 * 新增操作校验分组
 * 用于标识新增操作时需要进行的字段校验
 */
public interface AddGroup {
}
```

#### 编辑操作校验组
```java
/**
 * 编辑操作校验分组
 * 用于标识编辑操作时需要进行的字段校验
 */
public interface EditGroup {
}
```

#### 查询操作校验组
```java
/**
 * 查询操作校验分组
 * 用于标识查询操作时需要进行的字段校验
 */
public interface QueryGroup {
}
```

### 分组校验使用示例

```java
public class UserBo {
    
    @Null(groups = AddGroup.class, message = "新增时ID必须为空")
    @NotNull(groups = EditGroup.class, message = "编辑时ID不能为空")
    @Min(value = 1, groups = EditGroup.class, message = "ID必须大于0")
    private Long id;
    
    @NotBlank(groups = {AddGroup.class, EditGroup.class}, message = "用户名不能为空")
    @Length(min = 2, max = 30, groups = {AddGroup.class, EditGroup.class})
    private String userName;
    
    @Email(groups = {AddGroup.class, EditGroup.class}, message = "邮箱格式不正确")
    private String email;
    
    @Size(min = 1, max = 50, groups = QueryGroup.class, message = "查询用户名长度必须在1-50之间")
    private String queryUserName;
}
```

### Controller 中的分组使用

```java
@RestController
@RequestMapping("/users")
public class UserController {
    
    @PostMapping
    public R<Long> add(@Validated(AddGroup.class) @RequestBody UserBo bo) {
        return R.ok(userService.add(bo));
    }
    
    @PutMapping
    public R<Void> update(@Validated(EditGroup.class) @RequestBody UserBo bo) {
        return R.status(userService.update(bo));
    }
    
    @GetMapping
    public R<List<UserVo>> list(@Validated(QueryGroup.class) UserBo query) {
        return R.ok(userService.list(query));
    }
}
```

## 自定义校验注解

### 1. XSS 攻击防护校验

#### 注解定义

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.CONSTRUCTOR, ElementType.PARAMETER})
@Constraint(validatedBy = {XssValidator.class})
public @interface Xss {
    
    /**
     * XSS检测模式
     */
    enum Mode {
        /** 基础模式：检测常见的HTML标签和脚本 */
        BASIC,
        /** 严格模式：检测更多潜在的XSS攻击向量 */
        STRICT,
        /** 宽松模式：仅检测明显的脚本标签 */
        LENIENT
    }
    
    Mode mode() default Mode.BASIC;
    
    String message() default "输入内容包含潜在的XSS攻击代码，请检查并移除脚本标签";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
```

#### 校验器实现

```java
@Slf4j
public class XssValidator implements ConstraintValidator<Xss, String> {
    
    private Xss.Mode mode;
    
    // 基础模式正则表达式
    private static final Pattern BASIC_XSS_PATTERN = Pattern.compile("""
        (?i)(
        <[^>]*script[^>]*>|
        <[^>]*on\\w+\\s*=|
        <[^>]*style\\s*=.*expression\\s*\\(|
        javascript\\s*:|
        vbscript\\s*:|
        <[^>]*src\\s*=\\s*["']?\\s*javascript\\s*:|
        <\\s*/?.*(script|object|applet|embed|form|iframe|frameset|frame)\\s*[^>]*>
        )
        """);
    
    // 严格模式正则表达式
    private static final Pattern STRICT_XSS_PATTERN = Pattern.compile("""
        (?i)(
        <[^>]*script[^>]*>|
        <[^>]*on\\w+\\s*=|
        <[^>]*style\\s*=.*expression\\s*\\(|
        (javascript|vbscript)\\s*:|
        data\\s*:.*text/html|
        <[^>]*src\\s*=\\s*["']?\\s*(javascript|vbscript|data)\\s*:|
        (&#\\d+;?)|(&#x[0-9a-f]+;?)|
        (%3c|%3e|%22|%27|%2f|%5c)|
        (\\\\x[0-9a-f]{2})|(\\\\u[0-9a-f]{4})|
        (eval|expression)\\s*\\(|
        String\\s*\\.\\s*fromCharCode|
        (document|window)\\s*\\.|
        (alert|confirm|prompt)\\s*\\(|
        <\\s*/?.*(script|object|applet|embed|form|iframe|frameset|frame|meta|link|style|base)\\s*[^>]*>
        )
        """);
    
    // 宽松模式正则表达式
    private static final Pattern LENIENT_XSS_PATTERN = Pattern.compile("""
        (?i)(
        <\\s*script[^>]*>.*?</\\s*script\\s*>|
        (javascript|vbscript)\\s*:|
        <\\s*(iframe|object|embed)[^>]*>
        )
        """);
    
    @Override
    public void initialize(Xss annotation) {
        this.mode = annotation.mode();
        log.debug("初始化XSS校验器: mode={}", mode);
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (StringUtils.isBlank(value)) {
            return true;
        }
        
        try {
            boolean containsXss = switch (mode) {
                case BASIC -> detectBasicXss(value);
                case STRICT -> detectStrictXss(value);
                case LENIENT -> detectLenientXss(value);
            };
            
            if (containsXss) {
                log.warn("检测到XSS攻击代码: mode={}, value={}", mode,
                    value.length() > 100 ? value.substring(0, 100) + "..." : value);
                buildCustomErrorMessage(context, value);
                return false;
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("XSS检测异常: mode={}, value={}", mode, value, e);
            return false;
        }
    }
    
    // 静态工具方法
    public static boolean containsXss(String value, Xss.Mode mode) {
        if (StringUtils.isBlank(value)) {
            return false;
        }
        
        XssValidator validator = new XssValidator();
        return switch (mode) {
            case BASIC -> validator.detectBasicXss(value);
            case STRICT -> validator.detectStrictXss(value);
            case LENIENT -> validator.detectLenientXss(value);
        };
    }
}
```

#### 使用示例

```java
public class UserBo {
    
    @Xss(message = "用户名不能包含脚本代码")
    private String userName;
    
    @Xss(mode = Xss.Mode.STRICT, message = "评论内容存在安全风险")
    private String comment;
    
    @Xss(mode = Xss.Mode.LENIENT, message = "富文本内容包含危险脚本")
    private String richText;
}
```

### 2. 字典值校验

#### 注解定义

```java
@Documented
@Constraint(validatedBy = DictPatternValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface DictPattern {
    
    /**
     * 字典类型编码
     */
    String dictType();
    
    /**
     * 多值分隔符
     */
    String separator() default ",";
    
    /**
     * 是否允许空值
     */
    boolean allowEmpty() default true;
    
    String message() default "字典值无效，不在[{dictType}]字典范围内";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
```

#### 校验器实现

```java
@Slf4j
public class DictPatternValidator implements ConstraintValidator<DictPattern, String> {
    
    private String dictType;
    private String separator;
    private boolean allowEmpty;
    private DictService dictService;
    
    @Override
    public void initialize(DictPattern annotation) {
        this.dictType = annotation.dictType();
        this.separator = annotation.separator();
        this.allowEmpty = annotation.allowEmpty();
        
        log.debug("初始化字典校验器: dictType={}, separator={}, allowEmpty={}",
            dictType, separator, allowEmpty);
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // 空值检查
        if (StringUtils.isBlank(value)) {
            return allowEmpty;
        }
        
        // 字典类型检查
        if (StringUtils.isBlank(dictType)) {
            log.warn("字典类型不能为空");
            return false;
        }
        
        try {
            // 延迟获取字典服务实例
            if (dictService == null) {
                dictService = SpringUtils.getBean(DictService.class);
            }
            
            // 调用字典服务获取标签
            String dictLabel = dictService.getDictLabel(dictType, value, separator);
            
            // 检查是否所有值都有效
            if (StringUtils.isBlank(dictLabel)) {
                log.debug("字典值校验失败: dictType={}, value={}", dictType, value);
                buildCustomErrorMessage(context, value);
                return false;
            }
            
            // 对于多值情况，检查返回的标签中是否包含空字符串
            if (value.contains(separator)) {
                String[] labels = dictLabel.split(separator);
                for (String label : labels) {
                    if (StringUtils.isBlank(label.trim())) {
                        log.debug("字典值校验失败，包含无效值: dictType={}, value={}", dictType, value);
                        buildCustomErrorMessage(context, value);
                        return false;
                    }
                }
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("字典值校验异常: dictType={}, value={}", dictType, value, e);
            return false;
        }
    }
    
    private void buildCustomErrorMessage(ConstraintValidatorContext context, String invalidValue) {
        context.disableDefaultConstraintViolation();
        
        String customMessage = String.format("字典值[%s]无效，不在[%s]字典范围内", invalidValue, dictType);
        context.buildConstraintViolationWithTemplate(customMessage)
            .addConstraintViolation();
    }
}
```

#### 使用示例

```java
public class UserBo {
    
    @DictPattern(dictType = "sys_user_sex", message = "性别字典值无效")
    private String gender;
    
    @DictPattern(dictType = "sys_user_status", separator = ";", message = "状态值无效")
    private String statusList;
    
    @DictPattern(dictType = "sys_user_type", allowEmpty = false)
    private String userType;
}
```

### 3. 枚举值校验

#### 注解定义

```java
@Documented
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
@Repeatable(EnumPattern.List.class)
@Constraint(validatedBy = {EnumPatternValidator.class})
public @interface EnumPattern {
    
    /**
     * 需要校验的枚举类型
     */
    Class<? extends Enum<?>> type();
    
    /**
     * 枚举类型中用于校验的字段名称
     */
    String fieldName();
    
    /**
     * 是否允许空值
     */
    boolean allowEmpty() default true;
    
    String message() default "输入值不在枚举[{type}.{fieldName}]范围内";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * 多重注解容器
     */
    @Documented
    @Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
    @Retention(RUNTIME)
    @interface List {
        EnumPattern[] value();
    }
}
```

#### 校验器实现

```java
@Slf4j
public class EnumPatternValidator implements ConstraintValidator<EnumPattern, Object> {
    
    private Class<? extends Enum<?>> enumType;
    private String fieldName;
    private boolean allowEmpty;
    
    /**
     * 枚举值缓存：key为"enumType-fieldName"，value为有效值集合
     */
    private static final ConcurrentHashMap<String, Set<Object>> ENUM_VALUE_CACHE = new ConcurrentHashMap<>();
    
    @Override
    public void initialize(EnumPattern annotation) {
        this.enumType = annotation.type();
        this.fieldName = annotation.fieldName();
        this.allowEmpty = annotation.allowEmpty();
        
        log.debug("初始化枚举校验器: enumType={}, fieldName={}, allowEmpty={}",
            enumType.getSimpleName(), fieldName, allowEmpty);
        
        // 预加载枚举值到缓存
        preloadEnumValues();
    }
    
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (isEmptyValue(value)) {
            return allowEmpty;
        }
        
        try {
            Set<Object> validValues = getValidEnumValues();
            boolean isValid = validValues.contains(value);
            
            if (!isValid) {
                log.debug("枚举值校验失败: enumType={}, fieldName={}, value={}, validValues={}",
                    enumType.getSimpleName(), fieldName, value, validValues);
                buildCustomErrorMessage(context, value, validValues);
            }
            
            return isValid;
            
        } catch (Exception e) {
            log.error("枚举值校验异常: enumType={}, fieldName={}, value={}",
                enumType.getSimpleName(), fieldName, value, e);
            return false;
        }
    }
    
    private void preloadEnumValues() {
        String cacheKey = getCacheKey();
        if (!ENUM_VALUE_CACHE.containsKey(cacheKey)) {
            try {
                Set<Object> validValues = extractEnumValues();
                ENUM_VALUE_CACHE.put(cacheKey, validValues);
                log.debug("枚举值缓存加载完成: key={}, values={}", cacheKey, validValues);
            } catch (Exception e) {
                log.error("枚举值缓存加载失败: enumType={}, fieldName={}",
                    enumType.getSimpleName(), fieldName, e);
            }
        }
    }
    
    private Set<Object> extractEnumValues() {
        return Arrays.stream(enumType.getEnumConstants())
            .map(enumConstant -> {
                try {
                    return ReflectUtils.invokeGetter(enumConstant, fieldName);
                } catch (Exception e) {
                    log.warn("获取枚举字段值失败: enum={}, fieldName={}",
                        enumConstant, fieldName, e);
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    }
    
    // 缓存管理方法
    public static void clearCache() {
        ENUM_VALUE_CACHE.clear();
        log.debug("枚举值缓存已清理");
    }
    
    public static int getCacheSize() {
        return ENUM_VALUE_CACHE.size();
    }
}
```

#### 使用示例

```java
public class OrderBo {
    
    // 校验订单状态枚举的code字段
    @EnumPattern(type = OrderStatusEnum.class, fieldName = "code", message = "订单状态无效")
    private String status;
    
    // 校验性别枚举的value字段
    @EnumPattern(type = GenderEnum.class, fieldName = "value")
    private Integer gender;
    
    // 多重校验（同时校验多个枚举）
    @EnumPattern(type = StatusEnum.class, fieldName = "code")
    @EnumPattern(type = TypeEnum.class, fieldName = "value")
    private String statusOrType;
}
```

## 校验工具类

### ValidatorUtils 工具类

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ValidatorUtils {
    
    private static final Validator VALIDATOR = SpringUtils.getBean(Validator.class);
    
    /**
     * 校验对象参数（抛出异常）
     */
    public static <T> void validate(T object, Class<?>... groups) {
        if (object == null) {
            throw new IllegalArgumentException("校验对象不能为null");
        }
        
        Set<ConstraintViolation<T>> violations = VALIDATOR.validate(object, groups);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining("; "));
            
            throw new ConstraintViolationException("参数校验失败 - " + errorMessage, violations);
        }
    }
    
    /**
     * 校验对象参数（返回校验结果）
     */
    public static <T> Set<ConstraintViolation<T>> validateAndReturn(T object, Class<?>... groups) {
        if (object == null) {
            throw new IllegalArgumentException("校验对象不能为null");
        }
        
        return VALIDATOR.validate(object, groups);
    }
    
    /**
     * 校验对象的指定属性
     */
    public static <T> void validateProperty(T object, String propertyName, Class<?>... groups) {
        if (object == null) {
            throw new IllegalArgumentException("校验对象不能为null");
        }
        if (StringUtils.isBlank(propertyName)) {
            throw new IllegalArgumentException("属性名称不能为空");
        }
        
        Set<ConstraintViolation<T>> violations = VALIDATOR.validateProperty(object, propertyName, groups);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("属性校验失败", violations);
        }
    }
    
    /**
     * 校验属性值
     */
    public static <T> void validateValue(Class<T> beanType, String propertyName, Object value, Class<?>... groups) {
        if (beanType == null) {
            throw new IllegalArgumentException("对象类型不能为null");
        }
        if (StringUtils.isBlank(propertyName)) {
            throw new IllegalArgumentException("属性名称不能为空");
        }
        
        Set<ConstraintViolation<T>> violations = VALIDATOR.validateValue(beanType, propertyName, value, groups);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("属性值校验失败", violations);
        }
    }
    
    /**
     * 检查对象是否校验通过
     */
    public static <T> boolean isValid(T object, Class<?>... groups) {
        if (object == null) {
            return false;
        }
        
        Set<ConstraintViolation<T>> violations = VALIDATOR.validate(object, groups);
        return violations.isEmpty();
    }
    
    /**
     * 获取校验错误信息字符串
     */
    public static <T> String getValidationErrors(T object, Class<?>... groups) {
        if (object == null) {
            return "校验对象为null";
        }
        
        Set<ConstraintViolation<T>> violations = VALIDATOR.validate(object, groups);
        if (violations.isEmpty()) {
            return "";
        }
        
        return violations.stream()
            .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
            .collect(Collectors.joining("; "));
    }
}
```

#### 使用示例

```java
@Service
public class UserService {
    
    public void createUser(UserBo userBo) {
        // 手动触发校验
        ValidatorUtils.validate(userBo, AddGroup.class);
        
        // 检查是否校验通过
        if (!ValidatorUtils.isValid(userBo, AddGroup.class)) {
            String errors = ValidatorUtils.getValidationErrors(userBo, AddGroup.class);
            throw new ServiceException("参数校验失败: " + errors);
        }
        
        // 校验单个属性
        ValidatorUtils.validateProperty(userBo, "userName", AddGroup.class);
        
        // 校验属性值
        ValidatorUtils.validateValue(UserBo.class, "userName", "testUser", AddGroup.class);
    }
}
```

## 国际化消息配置

### 消息文件示例

#### messages.properties
```properties
# 通用验证消息
common.required=必须填写
common.length.invalid=长度必须在{min}到{max}个字符之间
common.id.required=主键ID不能为空

# 用户相关验证消息
user.username.required=用户名不能为空
user.username.length.invalid=用户名长度必须在{min}到{max}个字符之间
user.password.required=用户密码不能为空
user.password.length.invalid=用户密码长度必须在{min}到{max}个字符之间
user.email.format.invalid=邮箱格式错误
user.phone.format.invalid=手机号格式错误

# 验证码相关消息
verify.code.captcha.required=图形验证码不能为空
verify.code.captcha.invalid=图形验证码错误
verify.code.sms.required=短信验证码不能为空
verify.code.sms.invalid=短信验证码错误
```

#### messages_en.properties
```properties
# Common validation messages
common.required=Required
common.length.invalid=Length must be between {min} and {max} characters
common.id.required=Primary key ID cannot be empty

# User related validation messages
user.username.required=Username cannot be empty
user.username.length.invalid=Username length must be between {min} and {max} characters
user.password.required=User password cannot be empty
user.password.length.invalid=User password length must be between {min} and {max} characters
user.email.format.invalid=Invalid email format
user.phone.format.invalid=Invalid phone number format

# Verification code related messages
verify.code.captcha.required=Captcha cannot be empty
verify.code.captcha.invalid=Invalid captcha
verify.code.sms.required=SMS verification code cannot be empty
verify.code.sms.invalid=Invalid SMS verification code
```

### 国际化使用示例

```java
public class UserBo {
    
    @NotBlank(message = "user.username.required")
    @Length(min = 2, max = 30, message = "user.username.length.invalid")
    private String userName;
    
    @NotBlank(message = "user.password.required")
    @Length(min = 5, max = 30, message = "user.password.length.invalid")
    private String password;
    
    @Email(message = "user.email.format.invalid")
    private String email;
}
```

## 正则表达式校验

### RegexValidator 工具类

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RegexValidator extends Validator {
    
    /**
     * 验证国际化键格式是否正确
     */
    public static boolean isValidI18nKey(CharSequence i18nKey) {
        return isMatchPattern(RegexPatternPool.I18N_KEY, i18nKey);
    }
    
    /**
     * 验证用户账号格式是否正确
     */
    public static boolean isValidAccount(CharSequence account) {
        return isMatchPattern(RegexPatternPool.ACCOUNT, account);
    }
    
    /**
     * 验证状态值格式是否正确（0或1）
     */
    public static boolean isValidStatus(CharSequence status) {
        return isMatchPattern(RegexPatternPool.BINARY_STATUS, status);
    }
    
    /**
     * 验证字典类型格式是否正确
     */
    public static boolean isValidDictType(CharSequence dictType) {
        return isMatchPattern(RegexPatternPool.DICT_TYPE, dictType);
    }
    
    /**
     * 验证密码强度是否符合要求
     */
    public static boolean isStrongPassword(CharSequence password) {
        return isMatchPattern(RegexPatternPool.STRONG_PASSWORD, password);
    }
    
    /**
     * 验证权限标识格式是否正确
     */
    public static boolean isValidPermission(CharSequence permission) {
        return isMatchPattern(RegexPatternPool.PERMISSION, permission);
    }
}
```

### 正则表达式模式定义

```java
public interface RegexPatterns extends RegexPool {
    
    /**
     * 国际化键格式：英文段.英文段.英文段...（至少2段）
     */
    String I18N_KEY = "^[a-zA-Z][a-zA-Z0-9_]*(?:\\.[a-zA-Z][a-zA-Z0-9_]*)+$";
    
    /**
     * 字典类型：小写字母开头，只能包含小写字母、数字、下划线
     */
    String DICT_TYPE = "^[a-z][a-z0-9_]*$";
    
    /**
     * 权限标识格式：模块:操作:资源 或 空字符串
     */
    String PERMISSION = "^$|^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+:[a-zA-Z0-9_]+$";
    
    /**
     * 用户账号：字母开头，5-16位，可包含字母、数字、下划线
     */
    String ACCOUNT = "^[a-zA-Z][a-zA-Z0-9_]{4,15}$";
    
    /**
     * 强密码：至少8位，必须包含大小写字母、数字、特殊字符
     */
    String STRONG_PASSWORD = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    
    /**
     * 通用状态：0(正常) 或 1(停用)
     */
    String BINARY_STATUS = "^[01]$";
}
```

## 复杂校验场景

### 1. 条件校验

```java
public class ConditionalValidationBo {
    
    @NotNull
    private String type;
    
    // 当type为"email"时，email字段必须填写且格式正确
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @ConditionalValidator(condition = "type", value = "email")
    private String email;
    
    // 当type为"phone"时，phone字段必须填写且格式正确
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    @ConditionalValidator(condition = "type", value = "phone")
    private String phone;
}
```

### 2. 跨字段校验

```java
@CrossFieldValidator
public class PasswordChangeBo {
    
    @NotBlank(message = "原密码不能为空")
    private String oldPassword;
    
    @NotBlank(message = "新密码不能为空")
    @Length(min = 8, max = 32, message = "新密码长度必须在8-32位之间")
    private String newPassword;
    
    @NotBlank(message = "确认密码不能为空")
    private String confirmPassword;
    
    // 自定义校验方法
    @AssertTrue(message = "新密码不能与原密码相同")
    public boolean isNewPasswordDifferent() {
        return !Objects.equals(oldPassword, newPassword);
    }
    
    @AssertTrue(message = "两次输入的密码不一致")
    public boolean isPasswordConfirmed() {
        return Objects.equals(newPassword, confirmPassword);
    }
}
```

### 3. 集合元素校验

```java
public class BatchOperationBo {
    
    @NotEmpty(message = "操作列表不能为空")
    @Size(max = 100, message = "批量操作最多支持100条记录")
    @Valid  // 关键：启用集合元素校验
    private List<@Valid UserBo> users;
    
    @NotEmpty(message = "角色ID列表不能为空")
    private List<@NotNull @Min(1) Long> roleIds;
    
    @Valid
    private Map<@NotBlank String, @Valid UserBo> userMap;
}
```

### 4. 嵌套对象校验

```java
public class OrderBo {
    
    @NotNull(message = "订单信息不能为空")
    @Valid  // 启用嵌套对象校验
    private OrderDetailBo orderDetail;
    
    @NotNull(message = "收货地址不能为空")
    @Valid
    private AddressBo shippingAddress;
    
    @NotEmpty(message = "订单项不能为空")
    @Valid
    private List<@Valid OrderItemBo> orderItems;
}

public class OrderDetailBo {
    
    @NotBlank(message = "订单编号不能为空")
    private String orderNo;
    
    @NotNull(message = "订单金额不能为空")
    @DecimalMin(value = "0.01", message = "订单金额必须大于0")
    private BigDecimal amount;
}
```

## 性能优化

### 1. 快速失败模式

```java
// 全局配置快速失败
@Bean
public Validator validator() {
    ValidatorFactory factory = Validation.byProvider(HibernateValidator.class)
        .configure()
        .addProperty("hibernate.validator.fail_fast", "true")
        .buildValidatorFactory();
    return factory.getValidator();
}
```

### 2. 校验缓存优化

```java
@Service
public class CachedValidationService {
    
    private final LoadingCache<String, Set<ConstraintViolation<Object>>> validationCache;
    
    public CachedValidationService() {
        this.validationCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(10))
            .build(this::performValidation);
    }
    
    public boolean isValid(Object object, String cacheKey) {
        try {
            Set<ConstraintViolation<Object>> violations = validationCache.get(cacheKey);
            return violations.isEmpty();
        } catch (Exception e) {
            // 缓存失效时直接校验
            return ValidatorUtils.isValid(object);
        }
    }
    
    private Set<ConstraintViolation<Object>> performValidation(String cacheKey) {
        // 根据缓存键执行实际校验逻辑
        return Collections.emptySet();
    }
}
```

### 3. 异步校验

```java
@Service
public class AsyncValidationService {
    
    @Async
    public CompletableFuture<ValidationResult> validateAsync(Object object, Class<?>... groups) {
        try {
            Set<ConstraintViolation<Object>> violations = 
                SpringUtils.getBean(Validator.class).validate(object, groups);
            
            ValidationResult result = new ValidationResult();
            result.setValid(violations.isEmpty());
            result.setViolations(violations);
            
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }
}
```

## 测试支持

### 校验测试工具

```java
@TestConfiguration
public class ValidationTestConfig {
    
    @Bean
    @Primary
    public Validator testValidator() {
        return Validation.buildDefaultValidatorFactory().getValidator();
    }
}

@ExtendWith(SpringExtension.class)
@Import(ValidationTestConfig.class)
public class ValidationTest {
    
    @Autowired
    private Validator validator;
    
    @Test
    public void testUserBoValidation() {
        UserBo userBo = new UserBo();
        userBo.setUserName(""); // 空用户名，应该校验失败
        
        Set<ConstraintViolation<UserBo>> violations = validator.validate(userBo, AddGroup.class);
        
        assertThat(violations).isNotEmpty();
        assertThat(violations)
            .extracting(ConstraintViolation::getMessage)
            .contains("用户名不能为空");
    }
    
    @Test
    public void testXssValidation() {
        UserBo userBo = new UserBo();
        userBo.setUserName("<script>alert('xss')</script>");
        
        Set<ConstraintViolation<UserBo>> violations = validator.validate(userBo);
        
        assertThat(violations).isNotEmpty();
        assertThat(violations)
            .extracting(ConstraintViolation::getMessage)
            .anyMatch(msg -> msg.contains("XSS"));
    }
    
    @Test
    public void testDictPatternValidation() {
        UserBo userBo = new UserBo();
        userBo.setGender("invalid_gender");
        
        Set<ConstraintViolation<UserBo>> violations = validator.validate(userBo);
        
        assertThat(violations).isNotEmpty();
        assertThat(violations)
            .extracting(ConstraintViolation::getMessage)
            .anyMatch(msg -> msg.contains("字典值无效"));
    }
}
```

### Mock 校验服务

```java
@TestComponent
public class MockValidationService {
    
    public static <T> Set<ConstraintViolation<T>> mockValidationViolations(
            Class<T> beanClass, String propertyPath, String message) {
        
        ConstraintViolation<T> violation = mock(ConstraintViolation.class);
        when(violation.getPropertyPath()).thenReturn(mock(Path.class));
        when(violation.getPropertyPath().toString()).thenReturn(propertyPath);
        when(violation.getMessage()).thenReturn(message);
        
        return Set.of(violation);
    }
    
    public static <T> void assertValidationError(Set<ConstraintViolation<T>> violations, 
                                               String propertyPath, String expectedMessage) {
        assertThat(violations)
            .filteredOn(v -> v.getPropertyPath().toString().equals(propertyPath))
            .extracting(ConstraintViolation::getMessage)
            .contains(expectedMessage);
    }
}
```

## 最佳实践

### 1. 校验分组设计原则

```java
// ✅ 推荐：明确的分组命名
public interface UserAddGroup {}
public interface UserEditGroup {}
public interface UserQueryGroup {}

// ❌ 避免：通用分组名称
public interface CreateGroup {}
public interface UpdateGroup {}
```

### 2. 自定义校验注解设计

```java
// ✅ 推荐：可配置的校验注解
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String[] regions() default {"CN"}; // 支持多个地区
    boolean strict() default false;     // 严格模式
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// ❌ 避免：硬编码的校验注解
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ChinaPhoneValidator.class)
public @interface ChinaPhone {
    String message() default "中国手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

### 3. 错误信息国际化

```java
// ✅ 推荐：使用国际化键
@NotBlank(message = "user.username.required")
private String userName;

// ✅ 推荐：支持参数的国际化键
@Length(min = 2, max = 30, message = "user.username.length.invalid")
private String userName;

// ❌ 避免：硬编码中文消息
@NotBlank(message = "用户名不能为空")
private String userName;
```

### 4. 校验性能优化

```java
// ✅ 推荐：使用快速失败模式
ValidatorFactory factory = Validation.byProvider(HibernateValidator.class)
    .configure()
    .addProperty("hibernate.validator.fail_fast", "true")
    .buildValidatorFactory();

// ✅ 推荐：缓存校验结果
@Cacheable(value = "validation", key = "#object.hashCode() + '_' + #groups")
public Set<ConstraintViolation<Object>> validate(Object object, Class<?>... groups) {
    return validator.validate(object, groups);
}

// ❌ 避免：重复创建Validator实例
public boolean isValid(Object object) {
    Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
    return validator.validate(object).isEmpty();
}
```

### 5. 异常处理最佳实践

```java
@RestControllerAdvice
public class ValidationExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidationException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        String errorMessage = bindingResult.getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining("; "));
        
        return R.fail("参数校验失败: " + errorMessage);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public R<Void> handleConstraintViolationException(ConstraintViolationException e) {
        String errorMessage = e.getConstraintViolations().stream()
            .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
            .collect(Collectors.joining("; "));
        
        return R.fail("参数校验失败: " + errorMessage);
    }
}
```

## 注意事项

### 1. 校验顺序
1. 基础格式校验（@NotNull, @NotBlank）
2. 格式校验（@Email, @Pattern）
3. 业务校验（@DictPattern, @EnumPattern）
4. 安全校验（@Xss）

### 2. 性能考虑
- 启用快速失败模式减少校验时间
- 合理使用校验缓存
- 避免在循环中重复校验

### 3. 国际化支持
- 所有错误信息都应支持国际化
- 使用参数化消息模板
- 提供降级处理机制

### 4. 安全注意事项
- XSS校验应覆盖所有用户输入
- 字典值校验防止恶意输入
- 敏感信息不应出现在错误消息中

### 5. 维护性
- 校验规则应该可配置
- 复杂校验逻辑应该单元测试
- 定期review和更新校验规则

## 总结

参数校验模块提供了完整的数据验证解决方案，包括：

- **标准校验支持**: 基于 Jakarta Bean Validation 标准
- **国际化集成**: 自动消息插值和多语言支持
- **自定义校验器**: XSS防护、字典值校验、枚举值校验
- **分组校验**: 灵活的校验场景控制
- **性能优化**: 快速失败、缓存机制、异步校验
- **测试支持**: 完整的测试工具和Mock支持

通过合理使用这些功能，可以构建出安全、高效、可维护的参数校验体系，确保系统的数据质量和安全性。
