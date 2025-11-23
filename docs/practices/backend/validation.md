# 参数校验最佳实践

## 介绍

RuoYi-Plus 框架深度集成了 Bean Validation(JSR-380)规范,提供了完善的参数校验机制。通过声明式的校验注解和分组校验功能,可以优雅地实现请求参数的自动验证,减少重复的校验代码,提升代码可维护性。

**核心特性:**

- **声明式校验** - 使用注解声明校验规则,代码简洁直观
- **分组校验** - 支持 AddGroup、EditGroup、QueryGroup 等校验分组,同一字段不同场景使用不同规则
- **国际化支持** - 校验消息支持国际化,通过 I18nKeys 统一管理错误提示
- **嵌套校验** - 支持嵌套对象的级联校验,使用 @Valid 注解触发
- **自定义校验** - 支持自定义校验注解和校验器,满足特殊业务需求
- **XSS 防护** - 提供 @Xss 注解防止脚本注入攻击
- **全局异常处理** - 校验失败自动返回友好的错误提示

## 基础校验注解

### 常用校验注解

Bean Validation 提供了丰富的内置校验注解:

| 注解 | 说明 | 适用类型 |
|------|------|----------|
| `@NotNull` | 值不能为 null | 所有类型 |
| `@NotBlank` | 字符串不能为 null 且去除空格后长度大于 0 | String |
| `@NotEmpty` | 集合/数组/Map 不能为 null 且不能为空 | Collection/Array/Map |
| `@Size` | 限制长度或大小 | String/Collection/Array/Map |
| `@Min` | 数值最小值 | 数值类型 |
| `@Max` | 数值最大值 | 数值类型 |
| `@DecimalMin` | 精确数值最小值 | BigDecimal/String |
| `@DecimalMax` | 精确数值最大值 | BigDecimal/String |
| `@Positive` | 必须为正数 | 数值类型 |
| `@PositiveOrZero` | 必须为正数或零 | 数值类型 |
| `@Negative` | 必须为负数 | 数值类型 |
| `@NegativeOrZero` | 必须为负数或零 | 数值类型 |
| `@Email` | 邮箱格式 | String |
| `@Pattern` | 正则表达式匹配 | String |
| `@Past` | 必须是过去的时间 | Date/LocalDate/LocalDateTime |
| `@Future` | 必须是将来的时间 | Date/LocalDate/LocalDateTime |
| `@Digits` | 数字格式(整数位数和小数位数) | 数值类型 |
| `@Length` | 字符串长度范围(Hibernate Validator) | String |
| `@Range` | 数值范围(Hibernate Validator) | 数值类型 |
| `@URL` | URL 格式(Hibernate Validator) | String |

### 基本用法示例

```java
package plus.ruoyi.system.config.domain.bo;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = SysConfig.class, reverseConvertGenerate = false)
public class SysConfigBo extends BaseEntity {

    /**
     * 参数主键
     */
    private Long configId;

    /**
     * 参数名称
     */
    @NotBlank(message = "参数名称不能为空")
    @Size(min = 0, max = 100, message = "参数名称不能超过{max}个字符")
    private String configName;

    /**
     * 参数键名
     */
    @NotBlank(message = "参数键名不能为空")
    @Size(min = 0, max = 100, message = "参数键名长度不能超过{max}个字符")
    private String configKey;

    /**
     * 参数键值
     */
    @NotBlank(message = "参数键值不能为空")
    @Size(min = 0, max = 500, message = "参数键值长度不能超过{max}个字符")
    private String configValue;

    /**
     * 系统内置(Y是 N否)
     */
    private String configType;

    /**
     * 备注
     */
    private String remark;
}
```

**使用说明:**

- `@NotBlank` 用于字符串非空校验,会自动 trim
- `@Size` 的 message 支持占位符 `{max}`、`{min}`
- 多个注解可以叠加使用,都会进行校验

### 数值校验示例

```java
package plus.ruoyi.business.mall.domain.bo;

@Data
public class CreateOrderBo implements Serializable {

    /**
     * 商品ID
     */
    @NotNull(message = "商品ID不能为空")
    private Long goodsId;

    /**
     * 商品名称
     */
    @NotBlank(message = "商品名称不能为空")
    private String goodsName;

    /**
     * 商品价格
     */
    @NotNull(message = "商品价格不能为空")
    @DecimalMin(value = "0.01", message = "商品价格不能小于0.01元")
    private BigDecimal price;

    /**
     * 购买数量
     */
    @NotNull(message = "购买数量不能为空")
    @Min(value = 1, message = "购买数量不能小于1")
    private Long quantity;

    /**
     * 订单总金额(系统计算)
     */
    private BigDecimal totalAmount;
}
```

**使用说明:**

- `@NotNull` 用于对象类型非空校验
- `@DecimalMin` 用于 BigDecimal 类型的最小值校验
- `@Min` 用于整数类型的最小值校验

### 用户信息校验示例

```java
package plus.ruoyi.system.core.domain.bo;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = SysUser.class, reverseConvertGenerate = false)
public class SysUserBo extends BaseEntity {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 部门ID
     */
    private Long deptId;

    /**
     * 用户账号
     */
    @Xss(message = "用户账号不能包含脚本字符")
    @NotBlank(message = "用户账号不能为空")
    @Size(min = 0, max = 30, message = "用户账号长度不能超过{max}个字符")
    private String userName;

    /**
     * 用户昵称
     */
    @Xss(message = "用户昵称不能包含脚本字符")
    @NotBlank(message = "用户昵称不能为空")
    @Size(min = 0, max = 30, message = "用户昵称长度不能超过{max}个字符")
    private String nickName;

    /**
     * 用户邮箱
     */
    @Email(message = "邮箱格式不正确")
    @Size(min = 0, max = 50, message = "邮箱长度不能超过{max}个字符")
    private String email;

    /**
     * 角色组
     */
    @Size(min = 1, message = "用户角色不能为空")
    private Long[] roleIds;
}
```

**使用说明:**

- `@Xss` 是框架自定义注解,用于防止 XSS 攻击
- `@Email` 用于邮箱格式校验
- `@Size` 可用于数组长度校验

## 校验分组

### 分组接口定义

框架预定义了三个校验分组接口:

```java
package plus.ruoyi.common.core.validate;

/**
 * 新增操作校验分组
 * 用于标识新增操作时需要进行的字段校验
 *
 * 常见使用场景:
 * - 新增时ID字段必须为空(使用@Null校验)
 * - 新增时必填字段不能为空(使用@NotNull、@NotBlank校验)
 * - 新增时需要进行唯一性校验的字段
 */
public interface AddGroup {
}
```

```java
package plus.ruoyi.common.core.validate;

/**
 * 编辑操作校验分组
 * 用于标识编辑操作时需要进行的字段校验
 *
 * 常见使用场景:
 * - 编辑时ID字段不能为空(使用@NotNull校验)
 * - 编辑时可选填字段的格式校验
 * - 编辑时需要进行数据存在性校验的字段
 */
public interface EditGroup {
}
```

```java
package plus.ruoyi.common.core.validate;

/**
 * 查询操作校验分组
 * 用于标识查询操作时需要进行的字段校验
 *
 * 常见使用场景:
 * - 分页查询时页码和每页条数的范围校验
 * - 查询时必要条件字段的非空校验
 */
public interface QueryGroup {
}
```

### 分组校验使用

在 Bo 对象中使用分组:

```java
package plus.ruoyi.system.core.domain.bo;

@Data
public class SysRoleBo {

    /**
     * 角色ID
     * 新增时必须为空,编辑时必须不为空
     */
    @Null(groups = AddGroup.class, message = "新增时ID必须为空")
    @NotNull(groups = EditGroup.class, message = "编辑时ID不能为空")
    @Min(value = 1, groups = EditGroup.class, message = "ID必须大于0")
    private Long roleId;

    /**
     * 角色名称
     * 新增和编辑时都必填
     */
    @NotBlank(groups = {AddGroup.class, EditGroup.class}, message = "角色名称不能为空")
    @Size(max = 30, groups = {AddGroup.class, EditGroup.class}, message = "角色名称长度不能超过{max}个字符")
    private String roleName;

    /**
     * 角色权限字符串
     * 新增和编辑时都必填
     */
    @NotBlank(groups = {AddGroup.class, EditGroup.class}, message = "权限字符不能为空")
    @Size(max = 100, groups = {AddGroup.class, EditGroup.class}, message = "权限字符长度不能超过{max}个字符")
    private String roleKey;

    /**
     * 显示顺序
     * 新增时必填
     */
    @NotNull(groups = AddGroup.class, message = "显示顺序不能为空")
    private Integer roleSort;

    /**
     * 备注
     * 可选字段,仅校验长度
     */
    @Size(max = 500, message = "备注长度不能超过{max}个字符")
    private String remark;
}
```

在 Controller 中使用分组:

```java
package plus.ruoyi.system.core.controller;

@Validated
@RestController
@RequestMapping("/system/role")
public class SysRoleController {

    private final ISysRoleService roleService;

    /**
     * 新增角色
     * 使用 AddGroup 分组校验
     */
    @PostMapping
    public R<Long> add(@Validated(AddGroup.class) @RequestBody SysRoleBo bo) {
        return R.ok(roleService.add(bo));
    }

    /**
     * 修改角色
     * 使用 EditGroup 分组校验
     */
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody SysRoleBo bo) {
        return R.status(roleService.update(bo));
    }

    /**
     * 查询角色列表
     * 使用 QueryGroup 分组校验(如果需要)
     */
    @GetMapping("/list")
    public R<List<SysRoleVo>> list(@Validated(QueryGroup.class) SysRoleBo bo) {
        return R.ok(roleService.list(bo));
    }
}
```

**代码生成器模板:**

```java
// 代码生成器生成的 Controller 模板
@Validated
@RestController
@RequestMapping("/${moduleName}/${businessName}")
public class ${ClassName}Controller {

    /**
     * 新增${functionName}
     */
    @PostMapping
    public R<${pkColumn.javaType}> add${BusinessName}(@Validated(AddGroup.class) @RequestBody ${ClassName}Bo bo) {
        return R.ok(${className}Service.add(bo));
    }

    /**
     * 修改${functionName}
     */
    @PutMapping
    public R<Void> update${BusinessName}(@Validated(EditGroup.class) @RequestBody ${ClassName}Bo bo) {
        return R.status(${className}Service.update(bo));
    }
}
```

### 分组校验规则

| 场景 | 分组 | ID 字段 | 必填字段 | 可选字段 |
|------|------|---------|----------|----------|
| 新增 | AddGroup | `@Null` 必须为空 | `@NotNull`/`@NotBlank` | 仅格式校验 |
| 编辑 | EditGroup | `@NotNull` 不能为空 | `@NotNull`/`@NotBlank` | 仅格式校验 |
| 查询 | QueryGroup | 可选 | 根据业务需求 | 仅格式校验 |

## Controller 层校验

### @Validated 与 @Valid 的区别

| 特性 | @Validated | @Valid |
|------|------------|--------|
| 来源 | Spring 框架 | JSR-380 标准 |
| 分组校验 | ✅ 支持 | ❌ 不支持 |
| 嵌套校验 | ❌ 不支持 | ✅ 支持 |
| 使用位置 | 类、方法、参数 | 方法、参数、字段 |

**推荐使用方式:**

- Controller 类上使用 `@Validated`
- 方法参数使用 `@Validated(分组.class)` 进行分组校验
- 嵌套对象字段使用 `@Valid` 触发级联校验

### 基本校验

```java
@Validated
@RestController
@RequestMapping("/api/order")
public class OrderPayController {

    private final IOrderService orderService;

    /**
     * 创建订单
     * 使用 @Validated 触发校验
     */
    @PostMapping("/create")
    public R<CreateOrderVo> createOrder(@Validated @RequestBody CreateOrderBo bo) {
        return R.ok(orderService.createOrder(bo));
    }

    /**
     * 取消订单
     * 直接在参数上使用校验注解
     */
    @PostMapping("/cancel")
    public R<Void> cancelOrder(
            @Validated @NotBlank(message = "订单号不能为空") @RequestParam String orderNo) {
        Long userId = LoginHelper.getUserId();
        return R.status(orderService.cancelOrder(orderNo, userId));
    }

    /**
     * 查询订单状态
     * 路径参数校验
     */
    @GetMapping("/status/{orderNo}")
    public R<Void> queryOrderStatus(
            @Validated @NotBlank(message = "订单号不为空") @PathVariable String orderNo) {
        // 查询逻辑
        return R.ok();
    }
}
```

### 嵌套对象校验

```java
@Data
public class OrderBo {

    @NotNull(message = "订单信息不能为空")
    @Valid  // 触发嵌套对象校验
    private OrderInfoBo orderInfo;

    @NotEmpty(message = "商品列表不能为空")
    @Valid  // 触发集合中每个元素的校验
    private List<OrderItemBo> items;

    @Valid  // 可选嵌套对象,不为空时进行校验
    private ReceiverInfoBo receiverInfo;
}

@Data
public class OrderInfoBo {

    @NotBlank(message = "订单号不能为空")
    private String orderNo;

    @NotNull(message = "订单金额不能为空")
    @DecimalMin(value = "0.01", message = "订单金额必须大于0")
    private BigDecimal totalAmount;
}

@Data
public class OrderItemBo {

    @NotNull(message = "商品ID不能为空")
    private Long goodsId;

    @NotBlank(message = "商品名称不能为空")
    private String goodsName;

    @NotNull(message = "购买数量不能为空")
    @Min(value = 1, message = "购买数量至少为1")
    private Integer quantity;
}
```

### 集合参数校验

```java
@Validated
@RestController
@RequestMapping("/api/batch")
public class BatchController {

    /**
     * 批量删除
     * 校验 ID 集合不能为空
     */
    @DeleteMapping
    public R<Void> batchDelete(
            @NotEmpty(message = "ID集合不能为空") @RequestBody List<Long> ids) {
        return R.status(service.batchDelete(ids));
    }

    /**
     * 批量新增
     * 校验集合不为空且每个元素都符合规则
     */
    @PostMapping("/add")
    public R<Void> batchAdd(
            @NotEmpty(message = "数据列表不能为空")
            @Valid @RequestBody List<ItemBo> items) {
        return R.status(service.batchAdd(items));
    }

    /**
     * 批量更新状态
     */
    @PutMapping("/status")
    public R<Void> batchUpdateStatus(
            @NotEmpty(message = "ID集合不能为空") @RequestParam List<Long> ids,
            @NotBlank(message = "状态不能为空") @RequestParam String status) {
        return R.status(service.batchUpdateStatus(ids, status));
    }
}
```

## 国际化消息

### I18nKeys 常量定义

框架使用 I18nKeys 统一管理国际化消息 Key:

```java
package plus.ruoyi.common.core.constant;

/**
 * 国际化消息 Key 常量
 */
public interface I18nKeys {

    interface Auth {
        String TYPE_REQUIRED = "auth.type.required";
        String CODE_REQUIRED = "auth.code.required";
        String CODE_EXPIRED = "auth.code.expired";
        String CODE_ERROR = "auth.code.error";
    }

    interface User {
        String USERNAME_REQUIRED = "user.username.required";
        String USERNAME_LENGTH_INVALID = "user.username.length.invalid";
        String PASSWORD_REQUIRED = "user.password.required";
        String PASSWORD_LENGTH_INVALID = "user.password.length.invalid";
        String EMAIL_FORMAT_INVALID = "user.email.format.invalid";
        String PHONE_FORMAT_INVALID = "user.phone.format.invalid";
    }

    interface Common {
        String ID_REQUIRED = "common.id.required";
        String NAME_REQUIRED = "common.name.required";
        String PARAM_ERROR = "common.param.error";
    }
}
```

### 使用国际化消息

```java
package plus.ruoyi.common.core.domain.model;

@Data
public class PasswordLoginBody extends LoginBody {

    /**
     * 用户名
     */
    @NotBlank(message = I18nKeys.User.USERNAME_REQUIRED)
    @Length(min = 2, max = 30, message = I18nKeys.User.USERNAME_LENGTH_INVALID)
    private String userName;

    /**
     * 用户密码
     */
    @NotBlank(message = I18nKeys.User.PASSWORD_REQUIRED)
    @Length(min = 5, max = 30, message = I18nKeys.User.PASSWORD_LENGTH_INVALID)
    private String password;
}
```

### 消息资源文件

在 `messages.properties` 中定义消息:

```properties
# 认证相关
auth.type.required=认证方式不能为空
auth.code.required=验证码不能为空
auth.code.expired=验证码已过期
auth.code.error=验证码错误

# 用户相关
user.username.required=用户名不能为空
user.username.length.invalid=用户名长度必须在{min}到{max}个字符之间
user.password.required=密码不能为空
user.password.length.invalid=密码长度必须在{min}到{max}个字符之间
user.email.format.invalid=邮箱格式不正确
user.phone.format.invalid=手机号格式不正确

# 通用
common.id.required=ID不能为空
common.name.required=名称不能为空
common.param.error=参数错误
```

英文消息文件 `messages_en.properties`:

```properties
# Authentication
auth.type.required=Authentication type is required
auth.code.required=Verification code is required
auth.code.expired=Verification code has expired
auth.code.error=Verification code is incorrect

# User
user.username.required=Username is required
user.username.length.invalid=Username length must be between {min} and {max} characters
user.password.required=Password is required
user.password.length.invalid=Password length must be between {min} and {max} characters
user.email.format.invalid=Invalid email format
user.phone.format.invalid=Invalid phone number format

# Common
common.id.required=ID is required
common.name.required=Name is required
common.param.error=Invalid parameter
```

## 自定义校验

### @Xss 防 XSS 攻击注解

框架提供了 @Xss 注解用于防止 XSS 脚本注入:

```java
package plus.ruoyi.common.core.xss;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * 自定义 XSS 校验注解
 * 防止脚本注入攻击
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.CONSTRUCTOR, ElementType.PARAMETER})
@Constraint(validatedBy = XssValidator.class)
public @interface Xss {

    String message() default "不允许包含脚本字符";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

校验器实现:

```java
package plus.ruoyi.common.core.xss;

import cn.hutool.core.util.ReUtil;
import cn.hutool.http.HtmlUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * XSS 校验器
 */
public class XssValidator implements ConstraintValidator<Xss, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        // 清除所有 HTML 标签后与原值比较
        return value.equals(HtmlUtil.cleanHtmlTag(value));
    }
}
```

使用示例:

```java
@Data
public class SysUserBo {

    @Xss(message = "用户账号不能包含脚本字符")
    @NotBlank(message = "用户账号不能为空")
    @Size(max = 30, message = "用户账号长度不能超过{max}个字符")
    private String userName;

    @Xss(message = "用户昵称不能包含脚本字符")
    @NotBlank(message = "用户昵称不能为空")
    @Size(max = 30, message = "用户昵称长度不能超过{max}个字符")
    private String nickName;
}
```

### 自定义手机号校验注解

```java
package plus.ruoyi.common.core.validate;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * 手机号校验注解
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = PhoneValidator.class)
@Documented
public @interface Phone {

    String message() default "手机号格式不正确";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * 是否允许为空
     */
    boolean nullable() default false;
}
```

校验器实现:

```java
package plus.ruoyi.common.core.validate;

import cn.hutool.core.lang.Validator;
import cn.hutool.core.util.StrUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * 手机号校验器
 */
public class PhoneValidator implements ConstraintValidator<Phone, String> {

    private boolean nullable;

    @Override
    public void initialize(Phone phone) {
        this.nullable = phone.nullable();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // 如果允许为空且值为空,则通过
        if (nullable && StrUtil.isBlank(value)) {
            return true;
        }
        // 如果不允许为空但值为空,则不通过
        if (!nullable && StrUtil.isBlank(value)) {
            return false;
        }
        // 使用 Hutool 的手机号校验
        return Validator.isMobile(value);
    }
}
```

使用示例:

```java
@Data
public class UserRegisterBo {

    @NotBlank(message = "用户名不能为空")
    private String userName;

    @Phone(message = "手机号格式不正确")
    private String phone;

    @Phone(nullable = true, message = "备用手机号格式不正确")
    private String backupPhone;
}
```

### 自定义身份证号校验注解

```java
package plus.ruoyi.common.core.validate;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * 身份证号校验注解
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = IdCardValidator.class)
@Documented
public @interface IdCard {

    String message() default "身份证号格式不正确";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * 是否允许为空
     */
    boolean nullable() default false;
}
```

校验器实现:

```java
package plus.ruoyi.common.core.validate;

import cn.hutool.core.lang.Validator;
import cn.hutool.core.util.StrUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * 身份证号校验器
 */
public class IdCardValidator implements ConstraintValidator<IdCard, String> {

    private boolean nullable;

    @Override
    public void initialize(IdCard idCard) {
        this.nullable = idCard.nullable();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (nullable && StrUtil.isBlank(value)) {
            return true;
        }
        if (!nullable && StrUtil.isBlank(value)) {
            return false;
        }
        // 使用 Hutool 的身份证校验
        return Validator.isCitizenId(value);
    }
}
```

### 自定义枚举值校验注解

```java
package plus.ruoyi.common.core.validate;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * 枚举值校验注解
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = EnumValueValidator.class)
@Documented
public @interface EnumValue {

    String message() default "枚举值不正确";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * 允许的枚举值
     */
    String[] values();

    /**
     * 是否允许为空
     */
    boolean nullable() default false;
}
```

校验器实现:

```java
package plus.ruoyi.common.core.validate;

import cn.hutool.core.util.ArrayUtil;
import cn.hutool.core.util.StrUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * 枚举值校验器
 */
public class EnumValueValidator implements ConstraintValidator<EnumValue, String> {

    private String[] values;
    private boolean nullable;

    @Override
    public void initialize(EnumValue enumValue) {
        this.values = enumValue.values();
        this.nullable = enumValue.nullable();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (nullable && StrUtil.isBlank(value)) {
            return true;
        }
        if (!nullable && StrUtil.isBlank(value)) {
            return false;
        }
        return ArrayUtil.contains(values, value);
    }
}
```

使用示例:

```java
@Data
public class OrderBo {

    @NotBlank(message = "订单状态不能为空")
    @EnumValue(values = {"pending", "paid", "shipped", "completed", "cancelled"},
               message = "订单状态不正确,允许值: pending, paid, shipped, completed, cancelled")
    private String orderStatus;

    @EnumValue(values = {"wechat", "alipay"}, nullable = true,
               message = "支付方式不正确")
    private String paymentMethod;
}
```

## 异常处理集成

### 全局校验异常处理

框架在 GlobalExceptionHandler 中统一处理校验异常:

```java
package plus.ruoyi.common.web.handler;

@Slf4j
@RestControllerAdvice
@Order(Integer.MAX_VALUE)
public class GlobalExceptionHandler {

    /**
     * 处理数据绑定异常
     * 场景: 表单数据绑定到对象时发生的验证失败
     */
    @ExceptionHandler(BindException.class)
    public R<Void> handleBindException(BindException e) {
        log.error(e.getMessage());
        String message = StreamUtils.join(e.getAllErrors(),
                DefaultMessageSourceResolvable::getDefaultMessage, ", ");
        return R.fail(message);
    }

    /**
     * 处理约束违反异常
     * 场景: Bean Validation 注解验证失败
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public R<Void> constraintViolationException(ConstraintViolationException e) {
        log.error(e.getMessage());
        String message = StreamUtils.join(e.getConstraintViolations(),
                ConstraintViolation::getMessage, ", ");
        return R.fail(message);
    }

    /**
     * 处理方法参数验证异常
     * 场景: @RequestBody + @Valid 注解的 JSON 对象验证失败
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.error(e.getMessage());
        String message = StreamUtils.join(e.getBindingResult().getAllErrors(),
                DefaultMessageSourceResolvable::getDefaultMessage, ", ");
        return R.fail(message);
    }
}
```

### 异常响应示例

校验失败时返回的响应格式:

```json
{
  "code": 500,
  "msg": "商品ID不能为空, 商品名称不能为空, 商品价格不能为空",
  "data": null
}
```

单个字段校验失败:

```json
{
  "code": 500,
  "msg": "手机号格式不正确",
  "data": null
}
```

## 最佳实践

### 1. 合理使用校验分组

**✅ 推荐:**

```java
@Data
public class ArticleBo {

    /**
     * 文章ID
     * 新增时必须为空,编辑时必须存在
     */
    @Null(groups = AddGroup.class, message = "新增时ID必须为空")
    @NotNull(groups = EditGroup.class, message = "编辑时ID不能为空")
    private Long id;

    /**
     * 文章标题
     * 新增和编辑时都必填
     */
    @NotBlank(groups = {AddGroup.class, EditGroup.class}, message = "文章标题不能为空")
    @Size(max = 200, message = "文章标题不能超过{max}个字符")
    private String title;

    /**
     * 文章内容
     * 新增时必填,编辑时可选
     */
    @NotBlank(groups = AddGroup.class, message = "文章内容不能为空")
    private String content;

    /**
     * 发布状态
     * 仅在编辑时校验
     */
    @EnumValue(values = {"draft", "published", "archived"},
               groups = EditGroup.class, message = "发布状态不正确")
    private String status;
}
```

**❌ 不推荐:**

```java
@Data
public class ArticleBo {

    // ❌ 没有使用分组,无法区分新增和编辑场景
    @NotNull(message = "ID不能为空")
    private Long id;

    @NotBlank(message = "文章标题不能为空")
    private String title;
}
```

### 2. 校验消息清晰明确

**✅ 推荐:**

```java
@Data
public class UserBo {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度必须在{min}到{max}个字符之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    private String userName;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在{min}到{max}个字符之间")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "密码必须包含大小写字母和数字")
    private String password;

    @Email(message = "邮箱格式不正确,请输入有效的邮箱地址")
    private String email;
}
```

**❌ 不推荐:**

```java
@Data
public class UserBo {

    // ❌ 消息不够明确
    @NotBlank(message = "错误")
    @Size(min = 2, max = 20, message = "长度错误")
    private String userName;

    // ❌ 使用默认消息,用户看不懂
    @NotBlank
    @Size(min = 6, max = 20)
    private String password;
}
```

### 3. 前后端校验配合

**✅ 推荐:**

前端进行基础校验,提升用户体验;后端进行完整校验,确保数据安全。

```typescript
// 前端校验 - 即时反馈
const rules = {
  userName: [
    { required: true, message: '用户名不能为空' },
    { min: 2, max: 20, message: '用户名长度必须在2到20个字符之间' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
  ],
  password: [
    { required: true, message: '密码不能为空' },
    { min: 6, max: 20, message: '密码长度必须在6到20个字符之间' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确' }
  ]
}
```

```java
// 后端校验 - 安全保障
@Data
public class UserBo {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度必须在{min}到{max}个字符之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    @Xss(message = "用户名不能包含脚本字符")
    private String userName;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在{min}到{max}个字符之间")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;
}
```

### 4. 避免过度校验

**✅ 推荐:**

```java
@Data
public class QueryBo {

    // 查询参数通常不需要严格的非空校验
    private String keyword;

    // 分页参数有默认值,不需要 @NotNull
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    // 日期范围可选
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
```

**❌ 不推荐:**

```java
@Data
public class QueryBo {

    // ❌ 搜索关键词不应该必填
    @NotBlank(message = "关键词不能为空")
    private String keyword;

    // ❌ 分页参数有默认值,不需要必填校验
    @NotNull(message = "页码不能为空")
    private Integer pageNum;

    @NotNull(message = "每页条数不能为空")
    private Integer pageSize;
}
```

### 5. 使用自定义校验封装复杂规则

**✅ 推荐:**

```java
// 使用自定义注解封装复杂校验逻辑
@Data
public class OrderBo {

    @Phone(message = "收货人手机号格式不正确")
    private String receiverPhone;

    @IdCard(nullable = true, message = "身份证号格式不正确")
    private String idCard;

    @EnumValue(values = {"express", "ems", "sf"}, message = "快递类型不正确")
    private String expressType;
}
```

**❌ 不推荐:**

```java
// ❌ 在每个字段上重复写正则表达式
@Data
public class OrderBo {

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "收货人手机号格式不正确")
    private String receiverPhone;

    @Pattern(regexp = "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$",
             message = "身份证号格式不正确")
    private String idCard;
}
```

### 6. Service 层补充业务校验

**✅ 推荐:**

```java
@Service
public class OrderServiceImpl implements IOrderService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(CreateOrderBo bo) {
        // 1. Bean Validation 已完成基础校验
        // 2. Service 层进行业务规则校验

        // 检查商品是否存在
        Product product = productDao.getById(bo.getGoodsId());
        ServiceException.notNull(product, "商品不存在");

        // 检查商品是否上架
        ServiceException.throwIf(!product.getOnline(), "商品已下架");

        // 检查库存是否充足
        ServiceException.throwIf(product.getStock() < bo.getQuantity(),
                "库存不足,剩余库存: {}", product.getStock());

        // 检查价格是否一致(防止前端篡改)
        ServiceException.throwIf(!product.getPrice().equals(bo.getPrice()),
                "商品价格已变化,请刷新页面");

        // 创建订单
        Order order = buildOrder(bo, product);
        orderDao.insert(order);

        return order.getId();
    }
}
```

**校验分工:**

| 校验类型 | 位置 | 说明 |
|----------|------|------|
| 格式校验 | Bo + Bean Validation | 非空、长度、格式等 |
| 业务校验 | Service | 数据存在性、状态、权限等 |
| 数据校验 | DAO/数据库 | 唯一约束、外键约束等 |

## 常见问题

### 1. @Validated 不生效

**问题原因:**

- Controller 类上没有添加 `@Validated` 注解
- 方法参数上没有添加 `@Validated` 或 `@Valid`
- 校验注解没有指定分组但使用了分组校验

**✅ 正确做法:**

```java
@Validated  // 类上必须添加
@RestController
@RequestMapping("/api/user")
public class UserController {

    @PostMapping
    public R<Long> add(@Validated(AddGroup.class) @RequestBody UserBo bo) {
        // 方法参数上必须添加 @Validated
        return R.ok(userService.add(bo));
    }
}
```

```java
@Data
public class UserBo {

    // 校验注解必须指定分组
    @NotBlank(groups = AddGroup.class, message = "用户名不能为空")
    private String userName;
}
```

### 2. 嵌套对象校验不生效

**问题原因:**

- 嵌套对象字段上没有添加 `@Valid` 注解

**❌ 错误示例:**

```java
@Data
public class OrderBo {

    // ❌ 缺少 @Valid,嵌套对象不会被校验
    @NotNull(message = "收货信息不能为空")
    private ReceiverInfoBo receiverInfo;
}
```

**✅ 正确做法:**

```java
@Data
public class OrderBo {

    // ✅ 添加 @Valid 触发嵌套校验
    @NotNull(message = "收货信息不能为空")
    @Valid
    private ReceiverInfoBo receiverInfo;
}
```

### 3. 集合元素校验不生效

**问题原因:**

- 集合字段上没有添加 `@Valid` 注解

**❌ 错误示例:**

```java
@Data
public class BatchBo {

    // ❌ 只校验集合不为空,不校验元素
    @NotEmpty(message = "数据列表不能为空")
    private List<ItemBo> items;
}
```

**✅ 正确做法:**

```java
@Data
public class BatchBo {

    // ✅ 添加 @Valid 校验集合中的每个元素
    @NotEmpty(message = "数据列表不能为空")
    @Valid
    private List<ItemBo> items;
}
```

### 4. 分组校验规则冲突

**问题原因:**

- 同一字段在不同分组中的校验规则相互矛盾

**❌ 错误示例:**

```java
@Data
public class UserBo {

    // ❌ 新增时必须为空,但 @NotNull 没有指定分组
    @NotNull(message = "ID不能为空")  // 所有场景都生效
    @Null(groups = AddGroup.class, message = "新增时ID必须为空")
    private Long id;
}
```

**✅ 正确做法:**

```java
@Data
public class UserBo {

    // ✅ 明确指定每个注解的分组
    @Null(groups = AddGroup.class, message = "新增时ID必须为空")
    @NotNull(groups = EditGroup.class, message = "编辑时ID不能为空")
    private Long id;
}
```

### 5. 校验消息占位符不生效

**问题原因:**

- 占位符格式错误或注解不支持

**❌ 错误示例:**

```java
@Data
public class UserBo {

    // ❌ @NotBlank 不支持 {min} 和 {max} 占位符
    @NotBlank(message = "用户名长度必须在{min}到{max}之间")
    private String userName;
}
```

**✅ 正确做法:**

```java
@Data
public class UserBo {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度必须在{min}到{max}个字符之间")
    private String userName;
}
```

**支持的占位符:**

| 注解 | 支持的占位符 |
|------|-------------|
| `@Size` | `{min}`, `{max}` |
| `@Length` | `{min}`, `{max}` |
| `@Min` | `{value}` |
| `@Max` | `{value}` |
| `@DecimalMin` | `{value}` |
| `@DecimalMax` | `{value}` |
| `@Range` | `{min}`, `{max}` |
| `@Digits` | `{integer}`, `{fraction}` |

## 总结

RuoYi-Plus 框架的参数校验体系提供了完善的验证机制:

**核心组件:**

- Bean Validation 注解 - 声明式校验规则
- 校验分组(AddGroup/EditGroup/QueryGroup) - 同一字段不同场景的校验
- 自定义校验注解 - 封装复杂校验逻辑
- 全局异常处理 - 统一返回友好错误信息

**最佳实践:**

- 合理使用校验分组,区分新增/编辑/查询场景
- 校验消息清晰明确,使用占位符动态显示参数
- 前后端配合校验,前端提升体验,后端保证安全
- 避免过度校验,查询参数通常不需要严格的非空校验
- 使用自定义注解封装复杂校验逻辑
- Service 层补充业务规则校验

**校验分工:**

- Controller 层 - 基础格式校验(Bean Validation)
- Service 层 - 业务规则校验(ServiceException)
- DAO 层 - 数据约束校验(数据库约束)

通过遵循这些最佳实践,可以构建健壮、可维护的参数校验体系,提升系统安全性和用户体验。
