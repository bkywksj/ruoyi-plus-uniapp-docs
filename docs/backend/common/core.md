# 核心模块 (common-core) 概览

## 模块简介

`ruoyi-common-core` 是RuoYi-Plus-Uniapp框架的核心基础模块，为整个系统提供通用的基础功能和工具支持。该模块采用无业务逻辑的设计理念，专注于提供可复用的技术组件和工具类，是所有其他模块的基础依赖。

### 设计理念

- **零业务耦合**：不包含任何业务逻辑，纯技术组件设计
- **高度可复用**：提供通用的基础设施，可被任意业务模块引用
- **面向接口**：定义服务接口规范，支持多种实现方式
- **国际化优先**：所有消息支持自动国际化处理
- **安全第一**：内置XSS防护、参数校验等安全机制

## 核心特性

### 统一响应体系

- 提供标准化的API响应格式 `R<T>`
- 支持国际化消息自动处理
- 统一的状态码管理体系
- 成功/失败/警告多种响应状态

### 安全防护机制

- XSS攻击防护（`@Xss`注解）
- SQL注入防护工具
- 参数校验与数据验证
- 字典值校验（`@DictPattern`注解）

### 丰富的工具类库

- 字符串处理增强（`StringUtils`）
- 流式操作工具（`StreamUtils`）
- 日期时间工具（`DateUtils`）
- 反射操作工具（`ReflectUtils`）
- 网络地址工具（`NetUtils`）
- Spring容器工具（`SpringUtils`）

### 数据模型支持

- 登录认证模型系列（密码、短信、邮箱、社交登录）
- 数据传输对象（DTO）规范
- 视图对象（VO）规范

### 高性能配置

- 虚拟线程支持（JDK 21+）
- 异步任务配置
- 线程池优化管理

## 模块架构

### 目录结构

```text
ruoyi-common-core/
├── config/                     # 配置管理
│   └── properties/             # 配置属性类
│       ├── AppProperties       # 应用配置属性
│       └── ThreadPoolProperties# 线程池配置属性
├── constant/                   # 系统常量
│   ├── CacheConstants          # 缓存常量
│   ├── CacheNames              # 缓存名称
│   ├── Constants               # 通用常量
│   ├── GlobalConstants         # 全局Redis Key常量
│   ├── HttpStatus              # HTTP状态码
│   ├── SystemConstants         # 系统常量
│   └── TenantConstants         # 租户常量
├── converter/                  # 类型转换器
│   ├── LongListConverter       # Long列表转换器
│   └── StringListConverter     # String列表转换器
├── dict/                       # 字典枚举
│   ├── DictUserGender          # 用户性别
│   ├── DictEnableStatus        # 启用状态
│   ├── DictOrderStatus         # 订单状态
│   ├── DictPaymentMethod       # 支付方式
│   └── ...                     # 更多字典枚举
├── domain/                     # 数据模型
│   ├── R                       # 统一响应类
│   ├── dto/                    # 数据传输对象
│   ├── model/                  # 业务模型
│   │   ├── LoginBody           # 登录请求基类
│   │   ├── PasswordLoginBody   # 密码登录请求
│   │   ├── SmsLoginBody        # 短信登录请求
│   │   ├── EmailLoginBody      # 邮箱登录请求
│   │   ├── SocialLoginBody     # 社交登录请求
│   │   ├── LoginUser           # 登录用户信息
│   │   └── RegisterBody        # 注册请求
│   └── vo/                     # 视图对象
├── enums/                      # 枚举定义
│   ├── AuthType                # 认证类型
│   ├── UserType                # 用户类型
│   └── DateTimeFormat          # 日期格式
├── exception/                  # 异常体系
│   ├── ServiceException        # 业务异常
│   ├── SseException            # SSE异常
│   ├── base/                   # 基础异常类
│   ├── user/                   # 用户异常
│   └── file/                   # 文件异常
├── factory/                    # 工厂类
│   └── YmlPropertySourceFactory# YAML属性源工厂
├── service/                    # 通用服务接口
│   ├── UserService             # 用户服务
│   ├── DictService             # 字典服务
│   ├── DeptService             # 部门服务
│   ├── RoleService             # 角色服务
│   ├── PostService             # 岗位服务
│   ├── OssService              # OSS服务
│   ├── TenantService           # 租户服务
│   └── PermissionService       # 权限服务
├── utils/                      # 工具类库
│   ├── SpringUtils             # Spring工具
│   ├── StringUtils             # 字符串工具
│   ├── StreamUtils             # 流工具
│   ├── DateUtils               # 日期工具
│   ├── MessageUtils            # 消息工具
│   ├── ServletUtils            # Servlet工具
│   ├── ThreadUtils             # 线程工具
│   ├── NetUtils                # 网络工具
│   ├── ObjectUtils             # 对象工具
│   ├── ValidatorUtils          # 校验工具
│   ├── RequestIdUtils          # 请求ID工具
│   ├── TypeParameterResolver   # 类型参数解析器
│   ├── file/                   # 文件工具
│   ├── ip/                     # IP地址工具
│   ├── reflect/                # 反射工具
│   └── regex/                  # 正则工具
├── validate/                   # 校验框架
│   ├── AddGroup                # 新增校验组
│   ├── EditGroup               # 编辑校验组
│   ├── QueryGroup              # 查询校验组
│   ├── dicts/                  # 字典校验
│   ├── enumd/                  # 枚举校验
│   └── message/                # 消息处理
└── xss/                        # XSS防护
    ├── Xss                     # XSS注解
    └── XssValidator            # XSS校验器
```

## 模块依赖

### Maven依赖配置

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
</dependency>
```

### 主要依赖清单

| 依赖 | 说明 |
|------|------|
| `spring-context-support` | Spring框架核心容器支持 |
| `spring-web` | Spring Web模块基础支持 |
| `spring-boot-starter-aop` | Spring AOP面向切面编程 |
| `spring-boot-starter-validation` | 参数校验框架 |
| `jakarta.servlet-api` | Servlet容器API |
| `commons-lang3` | Apache通用工具类库 |
| `hutool-core` | HuTool核心工具包 |
| `hutool-http` | HuTool HTTP工具包 |
| `hutool-extra` | HuTool扩展工具包 |
| `ip2region` | IP地址定位库 |
| `mapstruct-plus-spring-boot-starter` | 对象映射工具 |
| `lombok` | 代码简化工具 |

### 依赖关系图

```
ruoyi-common-core (核心模块)
    ├── spring-context-support
    ├── spring-web
    ├── spring-boot-starter-aop
    ├── spring-boot-starter-validation
    ├── jakarta.servlet-api
    ├── commons-lang3
    ├── hutool-core
    ├── hutool-http
    ├── hutool-extra
    ├── ip2region
    ├── mapstruct-plus-spring-boot-starter
    └── lombok
```

## 核心组件详解

### 1. 统一响应类 R

`R<T>` 是框架的统一API响应封装类，提供标准化的响应格式。

#### 源码实现

```java
@Data
@NoArgsConstructor
public class R<T> implements Serializable {

    /** 成功状态码 (200) */
    public static final int SUCCESS = HttpStatus.SUCCESS;

    /** 失败状态码 (500) */
    public static final int FAIL = HttpStatus.ERROR;

    /** 消息状态码 */
    private int code;

    /** 消息内容 */
    private String msg;

    /** 数据对象 */
    private T data;

    /**
     * 处理国际化消息
     * 自动判断是否为国际化键，如果是则进行翻译
     */
    private static String processMessage(String message, Object... args) {
        if (StringUtils.isBlank(message)) {
            return null;
        }
        if (RegexValidator.isValidI18nKey(message)) {
            return MessageUtils.message(message, args);
        }
        return message;
    }
}
```

#### 使用示例

```java
// 成功响应（无数据）
return R.ok();

// 成功响应（带数据）
return R.ok(user);

// 成功响应（自定义消息）
return R.ok("操作成功", data);

// 成功响应（国际化消息）
return R.ok("user.create.success", user);

// 失败响应
return R.fail("操作失败");

// 失败响应（带错误码）
return R.fail(HttpStatus.UNAUTHORIZED, "认证失败");

// 失败响应（国际化带参数）
return R.fail("user.not.found", userId);

// 警告响应
return R.warn("数据可能不完整");

// 条件响应
return R.status(result > 0);  // 成功或失败

// 条件响应（自定义消息）
return R.status(flag, "保存成功", "保存失败");

// 判断响应状态
if (R.isSuccess(response)) {
    // 处理成功逻辑
}

// 获取响应数据
User user = R.getData(response);
```

#### 响应格式

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "name": "张三"
  }
}
```

#### 状态码定义

| 状态码 | 常量 | 说明 |
|--------|------|------|
| 200 | `SUCCESS` | 操作成功 |
| 401 | `UNAUTHORIZED` | 未授权 |
| 403 | `FORBIDDEN` | 禁止访问 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 500 | `ERROR` | 服务器错误 |
| 601 | `WARN` | 警告消息 |

### 2. 业务异常 ServiceException

`ServiceException` 是框架的核心业务异常类，支持占位符消息格式化。

#### 源码实现

```java
public final class ServiceException extends BaseBusinessException {

    /**
     * 构造业务异常（支持占位符）
     */
    public ServiceException(String message, Object... args) {
        super(StrFormatter.format(message, args));
    }

    /**
     * 快速创建异常
     */
    public static ServiceException of(String message) {
        return new ServiceException(message);
    }

    /**
     * 快速创建异常（支持占位符）
     */
    public static ServiceException of(String message, Object... args) {
        return new ServiceException(message, args);
    }

    /**
     * 条件抛出异常
     */
    public static void throwIf(boolean condition, String message) {
        if (condition) {
            throw new ServiceException(message);
        }
    }

    /**
     * 非空检查
     */
    public static void notNull(Object object, String message) {
        if (object == null) {
            throw new ServiceException(message);
        }
    }
}
```

#### 使用示例

```java
// 直接抛出
throw new ServiceException("用户不存在");

// 使用占位符
throw new ServiceException("用户{}不存在", userId);

// 快速创建
throw ServiceException.of("操作失败");
throw ServiceException.of("用户{}已被禁用", username);

// 带错误码
throw ServiceException.of("余额不足", 1001);

// 条件抛出
ServiceException.throwIf(user == null, "用户不存在");
ServiceException.throwIf(age < 0, "年龄{}无效", age);

// 非空检查
ServiceException.notNull(order, "订单不存在");
ServiceException.notNull(config, "配置{}未找到", configKey);
```

### 3. Spring工具类 SpringUtils

`SpringUtils` 扩展自HuTool的`SpringUtil`，提供Spring容器操作的便捷方法。

#### 源码实现

```java
@Component
public final class SpringUtils extends SpringUtil {

    /**
     * 判断BeanFactory中是否包含指定Bean
     */
    public static boolean containsBean(String name) {
        return getBeanFactory().containsBean(name);
    }

    /**
     * 判断指定Bean是否为单例模式
     */
    public static boolean isSingleton(String name) {
        return getBeanFactory().isSingleton(name);
    }

    /**
     * 获取指定Bean的类型
     */
    public static Class<?> getType(String name) {
        return getBeanFactory().getType(name);
    }

    /**
     * 获取AOP代理对象
     */
    @SuppressWarnings("unchecked")
    public static <T> T getAopProxy(T invoker) {
        return (T) getBean(invoker.getClass());
    }

    /**
     * 获取Spring应用上下文
     */
    public static ApplicationContext context() {
        return getApplicationContext();
    }

    /**
     * 判断是否运行在虚拟线程模式
     */
    public static boolean isVirtual() {
        return Threading.VIRTUAL.isActive(getBean(Environment.class));
    }
}
```

#### 使用示例

```java
// 获取Bean（按类型）
UserService userService = SpringUtils.getBean(UserService.class);

// 获取Bean（按名称）
Object bean = SpringUtils.getBean("userService");

// 获取Bean（按名称和类型）
UserService service = SpringUtils.getBean("userService", UserService.class);

// 检查Bean是否存在
boolean exists = SpringUtils.containsBean("userService");

// 检查是否为单例
boolean singleton = SpringUtils.isSingleton("userService");

// 获取Bean类型
Class<?> type = SpringUtils.getType("userService");

// 获取AOP代理对象（用于同类方法调用）
UserService proxy = SpringUtils.getAopProxy(this);
proxy.otherMethod();  // 可触发AOP

// 获取应用上下文
ApplicationContext context = SpringUtils.context();

// 检查虚拟线程模式
if (SpringUtils.isVirtual()) {
    // 使用虚拟线程执行器
}

// 获取配置属性
String value = SpringUtils.getProperty("app.name");
```

### 4. 流工具类 StreamUtils

`StreamUtils` 提供集合流式操作的便捷方法，简化常见的集合转换操作。

#### 核心方法

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `filter` | 过滤集合元素 | `List<E>` |
| `findFirst` | 查找第一个匹配元素 | `Optional<E>` |
| `findAny` | 查找任意匹配元素 | `Optional<E>` |
| `join` | 拼接集合元素 | `String` |
| `sorted` | 排序集合 | `List<E>` |
| `toIdentityMap` | 集合转Map（元素为value） | `Map<K, V>` |
| `toMap` | 集合转Map（自定义key/value） | `Map<K, V>` |
| `groupByKey` | 按键分组 | `Map<K, List<E>>` |
| `groupBy2Key` | 按两个键分组 | `Map<K, Map<U, List<E>>>` |
| `toList` | 集合转换为List | `List<T>` |
| `toSet` | 集合转换为Set | `Set<T>` |
| `merge` | 合并两个Map | `Map<K, V>` |

#### 使用示例

```java
List<User> users = userService.list();

// 过滤
List<User> activeUsers = StreamUtils.filter(users, user -> user.getStatus() == 1);

// 查找
Optional<User> admin = StreamUtils.findFirst(users, user -> "admin".equals(user.getUsername()));
User adminUser = StreamUtils.findFirstValue(users, user -> "admin".equals(user.getUsername()));

// 拼接
String names = StreamUtils.join(users, User::getName);  // 默认逗号分隔
String ids = StreamUtils.join(users, u -> String.valueOf(u.getId()), ";");  // 分号分隔

// 排序
List<User> sortedUsers = StreamUtils.sorted(users, Comparator.comparing(User::getCreateTime));

// 集合转Map（ID为key，User为value）
Map<Long, User> userMap = StreamUtils.toIdentityMap(users, User::getId);

// 集合转Map（ID为key，Name为value）
Map<Long, String> nameMap = StreamUtils.toMap(users, User::getId, User::getName);

// 按部门分组
Map<Long, List<User>> deptUsers = StreamUtils.groupByKey(users, User::getDeptId);

// 两级分组（部门 -> 角色 -> 用户列表）
Map<Long, Map<Long, List<User>>> groupedUsers = StreamUtils.groupBy2Key(users, User::getDeptId, User::getRoleId);

// 集合转换
List<Long> ids = StreamUtils.toList(users, User::getId);
Set<String> nameSet = StreamUtils.toSet(users, User::getName);

// 合并两个Map
Map<Long, String> merged = StreamUtils.merge(map1, map2, (v1, v2) -> v1 + "," + v2);
```

### 5. 全局常量 GlobalConstants

定义系统全局使用的Redis Key常量。

```java
public interface GlobalConstants {

    /** 全局 redis key 前缀 */
    String GLOBAL_REDIS_KEY = "global:";

    /** 验证码 redis key */
    String CAPTCHA_CODE_KEY = GLOBAL_REDIS_KEY + "captcha_codes:";

    /** 防重提交 redis key */
    String REPEAT_SUBMIT_KEY = GLOBAL_REDIS_KEY + "repeat_submit:";

    /** 限流 redis key */
    String RATE_LIMIT_KEY = GLOBAL_REDIS_KEY + "rate_limit:";

    /** 三方认证 redis key */
    String SOCIAL_AUTH_CODE_KEY = GLOBAL_REDIS_KEY + "social_auth_codes:";
}
```

### 6. XSS防护注解

#### @Xss 注解

```java
@Xss(mode = Xss.Mode.STRICT, message = "用户名包含危险字符")
private String userName;
```

#### 检测模式

| 模式 | 说明 |
|------|------|
| `BASIC` | 检测常见HTML标签和脚本 |
| `STRICT` | 检测更多攻击向量 |
| `LENIENT` | 仅检测明显脚本标签 |

### 7. 校验框架

#### 校验分组

```java
// 新增校验组
public interface AddGroup { }

// 编辑校验组
public interface EditGroup { }

// 查询校验组
public interface QueryGroup { }
```

#### 字典值校验

```java
public class UserBo {
    @DictPattern(dictType = "sys_user_sex", message = "性别值无效")
    private String gender;

    @DictPattern(dictType = "sys_user_status", separator = ";")
    private String statusList;
}
```

#### 枚举值校验

```java
public class OrderBo {
    @EnumPattern(type = OrderStatusEnum.class, fieldName = "code")
    private String status;
}
```

#### 使用示例

```java
@RestController
public class UserController {

    @PostMapping("/users")
    public R<Long> add(@Validated(AddGroup.class) @RequestBody UserBo bo) {
        return R.ok(userService.add(bo));
    }

    @PutMapping("/users")
    public R<Void> update(@Validated(EditGroup.class) @RequestBody UserBo bo) {
        return R.status(userService.update(bo));
    }
}
```

### 8. 服务接口定义

核心模块定义了多个服务接口，供业务模块实现：

| 接口 | 说明 |
|------|------|
| `UserService` | 用户服务（查询用户信息、权限等） |
| `DictService` | 字典服务（获取字典数据） |
| `DeptService` | 部门服务（部门查询） |
| `RoleService` | 角色服务（角色查询） |
| `PostService` | 岗位服务（岗位查询） |
| `OssService` | OSS服务（文件上传） |
| `OssConfigService` | OSS配置服务 |
| `TenantService` | 租户服务（多租户支持） |
| `PermissionService` | 权限服务（权限校验） |
| `PaymentService` | 支付服务（支付相关） |
| `PlatformService` | 平台服务（平台信息） |
| `OpenApiService` | OpenAPI服务 |

### 9. 登录模型

框架支持多种登录方式，每种方式都有对应的模型类：

```java
// 密码登录
public class PasswordLoginBody extends LoginBody {
    private String username;
    private String password;
    private String code;      // 验证码
    private String uuid;      // 验证码标识
}

// 短信登录
public class SmsLoginBody extends LoginBody {
    private String phonenumber;
    private String smsCode;
}

// 邮箱登录
public class EmailLoginBody extends LoginBody {
    private String email;
    private String emailCode;
}

// 社交登录
public class SocialLoginBody extends LoginBody {
    private String source;        // 第三方平台
    private String code;          // 授权码
    private String state;         // 状态参数
}

// 平台登录（小程序等）
public class PlatformLoginBody extends LoginBody {
    private String platformType;  // 平台类型
    private String platformCode;  // 平台授权码
}
```

### 10. 字典枚举

框架内置了丰富的字典枚举：

| 枚举类 | 字典类型 | 说明 |
|--------|----------|------|
| `DictUserGender` | `sys_user_gender` | 用户性别 |
| `DictEnableStatus` | `sys_enable_status` | 启用状态 |
| `DictDisplaySetting` | `sys_display_setting` | 显示设置 |
| `DictBooleanFlag` | `sys_boolean_flag` | 布尔标志 |
| `DictOperResult` | `sys_oper_result` | 操作结果 |
| `DictOperType` | `sys_oper_type` | 操作类型 |
| `DictNoticeType` | `sys_notice_type` | 通知类型 |
| `DictNoticeStatus` | `sys_notice_status` | 通知状态 |
| `DictMessageType` | `sys_message_type` | 消息类型 |
| `DictFileType` | `sys_file_type` | 文件类型 |
| `DictPlatformType` | `sys_platform_type` | 平台类型 |
| `DictAuditStatus` | `sys_audit_status` | 审核状态 |
| `DictOrderStatus` | `sys_order_status` | 订单状态 |
| `DictPaymentMethod` | `sys_payment_method` | 支付方式 |

#### 字典枚举示例

```java
@Getter
@AllArgsConstructor
public enum DictUserGender {
    FEMALE("0", "女"),
    MALE("1", "男"),
    UNKNOWN("2", "未知");

    public static final String DICT_TYPE = "sys_user_gender";

    private final String value;
    private final String label;

    public static DictUserGender getByValue(String value) {
        return Arrays.stream(values())
            .filter(e -> e.getValue().equals(value))
            .findFirst()
            .orElse(null);
    }
}
```

## 使用指南

### 1. 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
</dependency>
```

### 2. 创建Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public R<UserVo> getUser(@PathVariable Long id) {
        UserVo user = userService.getUser(id);
        ServiceException.notNull(user, "用户不存在");
        return R.ok(user);
    }

    @PostMapping
    public R<Long> createUser(@Validated(AddGroup.class) @RequestBody UserBo bo) {
        Long userId = userService.createUser(bo);
        return R.ok(userId);
    }

    @PutMapping
    public R<Void> updateUser(@Validated(EditGroup.class) @RequestBody UserBo bo) {
        boolean success = userService.updateUser(bo);
        return R.status(success);
    }

    @DeleteMapping("/{ids}")
    public R<Void> deleteUsers(@PathVariable Long[] ids) {
        ServiceException.throwIf(ids == null || ids.length == 0, "请选择要删除的用户");
        boolean success = userService.deleteUsers(ids);
        return R.status(success, "删除成功", "删除失败");
    }
}
```

### 3. 创建业务对象

```java
@Data
public class UserBo {

    @NotNull(groups = EditGroup.class, message = "用户ID不能为空")
    private Long id;

    @NotBlank(groups = {AddGroup.class, EditGroup.class}, message = "用户名不能为空")
    @Xss(message = "用户名包含危险字符")
    private String username;

    @NotBlank(groups = AddGroup.class, message = "密码不能为空")
    private String password;

    @DictPattern(dictType = "sys_user_gender", message = "性别值无效")
    private String gender;

    @Email(message = "邮箱格式不正确")
    private String email;
}
```

### 4. 使用工具类

```java
@Service
public class UserServiceImpl implements UserService {

    public void processUsers(List<User> users) {
        // 过滤活跃用户
        List<User> activeUsers = StreamUtils.filter(users, u -> u.getStatus() == 1);

        // 转换为Map
        Map<Long, User> userMap = StreamUtils.toIdentityMap(users, User::getId);

        // 获取用户名列表
        String names = StreamUtils.join(users, User::getName, ",");

        // 按部门分组
        Map<Long, List<User>> deptUsers = StreamUtils.groupByKey(users, User::getDeptId);

        // 检查Bean是否存在
        if (SpringUtils.containsBean("emailService")) {
            EmailService emailService = SpringUtils.getBean(EmailService.class);
            emailService.send(names);
        }

        // 虚拟线程检查
        if (SpringUtils.isVirtual()) {
            log.info("当前运行在虚拟线程模式");
        }
    }
}
```

## 最佳实践

### 1. 异常处理规范

```java
// 使用静态工厂方法
throw ServiceException.of("用户不存在");

// 支持占位符
throw ServiceException.of("用户{}不存在", userId);

// 条件抛出
ServiceException.throwIf(user == null, "用户不存在");

// 非空检查
ServiceException.notNull(config, "配置不存在");
```

### 2. 响应规范

```java
// 成功响应
return R.ok(data);

// 失败响应
return R.fail("操作失败");

// 条件响应
return R.status(result > 0);

// 国际化消息
return R.ok("user.create.success");
```

### 3. 参数校验

```java
// 组合校验
public class UserBo {
    @NotBlank(groups = {AddGroup.class, EditGroup.class})
    @Xss(message = "包含危险字符")
    private String username;

    @DictPattern(dictType = "sys_user_sex")
    private String gender;
}
```

### 4. 流式操作

```java
// 优先使用StreamUtils
List<Long> ids = StreamUtils.toList(users, User::getId);

// 而不是
List<Long> ids = users.stream().map(User::getId).collect(Collectors.toList());
```

## 类型转换器

### LongListConverter

用于将逗号分隔的字符串与 `List<Long>` 之间进行转换，常用于数据库存储多个ID的场景。

```java
@Data
public class UserBo {
    /**
     * 角色ID列表，存储格式：1,2,3
     */
    @TableField(typeHandler = LongListConverter.class)
    private List<Long> roleIds;
}
```

**转换示例：**

| 数据库值 | Java对象 |
|----------|----------|
| `"1,2,3"` | `[1L, 2L, 3L]` |
| `""` | `[]` |
| `null` | `null` |

### StringListConverter

用于将逗号分隔的字符串与 `List<String>` 之间进行转换。

```java
@Data
public class ConfigBo {
    /**
     * 允许的文件扩展名，存储格式：jpg,png,gif
     */
    @TableField(typeHandler = StringListConverter.class)
    private List<String> allowedExtensions;
}
```

**使用场景：**

- 多选标签存储
- 权限列表存储
- 文件扩展名白名单

## 配置属性

### AppProperties

应用配置属性类，用于读取应用级别的配置信息。

```java
@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /** 应用名称 */
    private String name = "RuoYi-Plus";

    /** 版本信息 */
    private String version = "1.0.0";

    /** 版权年份 */
    private String copyrightYear = "2024";

    /** 是否开启验证码 */
    private Boolean captchaEnabled = true;

    /** 验证码类型 */
    private String captchaType = "math";

    /** 文件路径 */
    private String profile = "/ruoyi/uploadPath";

    /** 获取IP地址开关 */
    private Boolean addressEnabled = false;
}
```

**配置示例：**

```yaml
app:
  name: RuoYi-Plus
  version: 1.0.0
  captcha-enabled: true
  captcha-type: math  # math-数字计算, char-字符验证
  address-enabled: true
```

### ThreadPoolProperties

线程池配置属性，支持自定义线程池参数。

```java
@Data
@ConfigurationProperties(prefix = "thread-pool")
public class ThreadPoolProperties {

    /** 是否启用线程池 */
    private boolean enabled = true;

    /** 核心线程数 */
    private int corePoolSize = Runtime.getRuntime().availableProcessors();

    /** 最大线程数 */
    private int maxPoolSize = corePoolSize * 2;

    /** 队列容量 */
    private int queueCapacity = 500;

    /** 线程存活时间（秒） */
    private int keepAliveSeconds = 60;

    /** 拒绝策略 */
    private String rejectedPolicy = "CallerRunsPolicy";
}
```

**配置示例：**

```yaml
thread-pool:
  enabled: true
  core-pool-size: 8
  max-pool-size: 16
  queue-capacity: 1000
  keep-alive-seconds: 300
  rejected-policy: CallerRunsPolicy  # CallerRunsPolicy, AbortPolicy, DiscardPolicy
```

**拒绝策略说明：**

| 策略 | 说明 |
|------|------|
| `CallerRunsPolicy` | 调用者线程执行任务 |
| `AbortPolicy` | 抛出异常拒绝任务 |
| `DiscardPolicy` | 静默丢弃任务 |
| `DiscardOldestPolicy` | 丢弃最旧任务后重试 |

## 常见问题

### Q1: R类的国际化消息如何配置？

国际化消息自动识别以下格式的key：

```java
// 以下格式会自动翻译
R.ok("user.create.success");          // key格式
R.fail("error.user.not.found", userId); // 支持占位符

// 普通消息不翻译
R.ok("操作成功");
```

**配置文件 `messages.properties`：**

```properties
user.create.success=用户创建成功
error.user.not.found=用户[{0}]不存在
```

### Q2: 如何在同类方法中调用触发AOP？

使用 `SpringUtils.getAopProxy()` 获取代理对象：

```java
@Service
public class UserServiceImpl {

    @Transactional
    public void methodA() {
        // 直接调用不会触发AOP
        // this.methodB();

        // 使用代理对象调用，可触发AOP
        SpringUtils.getAopProxy(this).methodB();
    }

    @Transactional
    public void methodB() {
        // 事务逻辑
    }
}
```

### Q3: StreamUtils与Java Stream API如何选择？

优先使用 `StreamUtils`，原因：

1. **空值保护**：自动处理null集合，避免NPE
2. **代码简洁**：方法链更短
3. **序列化安全**：返回可变List，避免序列化问题

```java
// 推荐
List<Long> ids = StreamUtils.toList(users, User::getId);

// 不推荐（可能NPE，返回不可变List）
List<Long> ids = users.stream().map(User::getId).toList();
```

### Q4: ServiceException的占位符格式？

使用 `{}` 作为占位符，支持多个参数：

```java
throw new ServiceException("用户{}在部门{}中不存在", userId, deptId);
// 输出：用户123在部门456中不存在

throw ServiceException.of("余额不足，当前{}，需要{}", current, required);
// 输出：余额不足，当前100，需要200
```

### Q5: 如何自定义校验分组？

创建自定义分组接口：

```java
// 定义分组
public interface ImportGroup { }
public interface ExportGroup { }

// 使用分组
@Data
public class FileBo {
    @NotBlank(groups = ImportGroup.class)
    private String filePath;

    @NotBlank(groups = ExportGroup.class)
    private String exportPath;
}

// 控制器中使用
@PostMapping("/import")
public R<Void> importFile(@Validated(ImportGroup.class) @RequestBody FileBo bo) {
    return R.ok();
}
```

### Q6: 虚拟线程模式如何启用？

在 JDK 21+ 环境下，通过配置启用：

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

代码中检查虚拟线程状态：

```java
if (SpringUtils.isVirtual()) {
    log.info("当前运行在虚拟线程模式");
}
```

**虚拟线程优势：**

- 更高的并发能力
- 更低的内存占用
- 简化异步编程模型

## 注意事项

- **线程安全**：所有工具类都是线程安全的
- **空值处理**：StreamUtils方法都有空值保护
- **序列化**：不使用`.toList()`新语法，避免不可变List序列化问题
- **虚拟线程**：JDK 21+环境下可启用虚拟线程模式
- **国际化**：`R`类自动识别国际化键并翻译
- **编码规范**：遵循阿里巴巴Java开发手册
- **类型转换**：使用内置转换器处理集合类型的数据库存储
- **配置优先级**：YAML配置优先级高于默认值
- **异常链**：ServiceException支持异常链，保留原始异常信息
