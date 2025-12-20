# 数据模型与DTO

## 概述

数据模型与DTO（Data Transfer Object）是ruoyi-plus-uniapp中用于数据传输和业务交互的核心组件。本模块提供了统一的数据传输规范、响应体系和各种业务模型，确保系统各层之间的数据交互规范化和类型安全。

## 模块结构

```text
domain/
├── R.java                    # 统一响应体
├── dto/                      # 数据传输对象
│   ├── UserDTO.java         # 用户数据传输对象
│   ├── DeptDTO.java         # 部门数据传输对象
│   ├── RoleDTO.java         # 角色数据传输对象
│   ├── PostDTO.java         # 岗位数据传输对象
│   ├── DictTypeDTO.java     # 字典类型DTO
│   ├── DictDataDTO.java     # 字典数据DTO
│   ├── OssDTO.java          # 对象存储DTO
│   ├── PaymentDTO.java      # 支付配置DTO
│   ├── PlatformDTO.java     # 平台配置DTO
│   └── UserOnlineDTO.java   # 在线用户DTO
├── model/                    # 业务模型
│   ├── LoginUser.java       # 登录用户模型
│   ├── LoginBody.java       # 登录基础模型
│   ├── PasswordLoginBody.java   # 密码登录模型
│   ├── SmsLoginBody.java        # 短信登录模型
│   ├── EmailLoginBody.java      # 邮箱登录模型
│   ├── SocialLoginBody.java     # 社交登录模型
│   ├── PlatformLoginBody.java   # 平台登录模型
│   └── RegisterBody.java       # 注册模型
└── vo/                       # 视图对象
    └── DictItemVo.java      # 字典项视图对象
```

## 统一响应体系

### `R<T>` 统一响应类

`R<T>` 是系统的统一响应封装类，提供标准化的API响应格式，支持泛型和国际化。

#### 基本结构

```java
@Data
@NoArgsConstructor
public class R<T> implements Serializable {
    
    /**
     * 成功状态码 (200)
     */
    public static final int SUCCESS = HttpStatus.SUCCESS;
    
    /**
     * 失败状态码 (500)
     */
    public static final int FAIL = HttpStatus.ERROR;
    
    /**
     * 消息状态码
     */
    private int code;
    
    /**
     * 消息内容（支持国际化）
     */
    private String msg;
    
    /**
     * 数据对象
     */
    private T data;
}
```

#### 核心特性

**自动国际化支持**

```java
// 自动判断是否为国际化键
private static String processMessage(String message, Object... args) {
    if (StringUtils.isBlank(message)) {
        return null;
    }
    // 使用正则表达式判断国际化键格式
    if (RegexValidator.isValidI18nKey(message)) {
        return MessageUtils.message(message, args);
    }
    return message;
}
```

**链式操作支持**

```java
// 成功响应
R<User> result = R.ok(user);
R<List<User>> result = R.ok("查询成功", userList);

// 失败响应
R<Void> result = R.fail("操作失败");
R<Void> result = R.fail("user.not.found", userId);

// 条件响应
R<Void> result = R.status(count > 0);
R<Void> result = R.status(success, "操作成功", "操作失败");
```

#### 使用示例

```java
@RestController
public class UserController {
    
    @GetMapping("/getUser/{id}")
    public R<UserVo> getUser(@PathVariable Long id) {
        UserVo user = userService.get(id);
        return R.ok(user);
    }
    
    @PostMapping("/addUser")
    public R<Long> addUser(@RequestBody UserBo bo) {
        Long userId = userService.add(bo);
        return R.ok("user.create.success", userId);
    }
    
    @DeleteMapping("/deleteUser/{id}")
    public R<Void> deleteUser(@PathVariable Long id) {
        boolean success = userService.delete(id);
        return R.status(success, "删除成功", "删除失败");
    }
}
```

#### 响应格式示例

```json
// 成功响应
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "userId": 1,
        "userName": "admin"
    }
}

// 失败响应
{
    "code": 500,
    "msg": "用户不存在",
    "data": null
}

// 列表响应
{
    "code": 200,
    "msg": "查询成功", 
    "data": [
        {"userId": 1, "userName": "admin"},
        {"userId": 2, "userName": "test"}
    ]
}
```

## 数据传输对象 (DTO)

DTO 用于不同层之间的数据传输，通常用于Service层返回数据给Controller层。

### 用户相关 DTO

#### UserDTO - 用户数据传输对象

```java
@Data
@NoArgsConstructor
public class UserDTO implements Serializable {
    
    private Long userId;
    private Long deptId;
    private String userName;
    private String nickName;
    private String userType;
    private String email;
    private String phone;
    private String gender;
    private String status;
    private Date createTime;
    
    // ... 其他字段
}
```

#### DeptDTO - 部门数据传输对象

```java
@Data
@NoArgsConstructor
public class DeptDTO implements Serializable {
    
    private Long deptId;
    private Long parentId;
    private String deptName;
    
    // ... 其他字段
}
```

#### RoleDTO - 角色数据传输对象

```java
@Data
@NoArgsConstructor
public class RoleDTO implements Serializable {
    
    private Long roleId;
    private String roleName;
    private String roleKey;
    
    /**
     * 数据范围
     * 1：全部数据权限 
     * 2：自定数据权限 
     * 3：本部门数据权限 
     * 4：本部门及以下数据权限 
     * 5：仅本人数据权限 
     * 6：部门及以下或本人数据权限
     */
    private String dataScope;
    
    // ... 其他字段
}
```

### 字典相关 DTO

#### DictTypeDTO - 字典类型DTO

```java
@Data
@NoArgsConstructor
public class DictTypeDTO implements Serializable {
    
    private Long dictId;
    private String dictName;
    private String dictType;
    private String remark;
    
    // ... 其他字段
}
```

#### DictDataDTO - 字典数据DTO

```java
@Data
@NoArgsConstructor
public class DictDataDTO implements Serializable {
    
    private String dictLabel;
    private String dictValue;
    private String isDefault;
    private String remark;
    
    // ... 其他字段
}
```

### 业务相关 DTO

#### PaymentDTO - 支付配置DTO

```java
@Data
public class PaymentDTO implements Serializable {
    
    private Long id;
    private String type;
    private String mchName;
    private String mchId;
    private String mchKey;
    private String apiV3Key;
    private String notifyUrl;
    private String status;
    
    // ============= 便捷方法 =============
    
    /**
     * 判断是否为启用状态
     */
    public boolean isEnabled() {
        return DictEnableStatus.ENABLE.getValue().equals(this.status);
    }
    
    /**
     * 判断是否为微信支付
     */
    public boolean isWechatPayment() {
        return "WECHAT".equals(this.type);
    }
    
    /**
     * 掩码处理商户密钥（用于日志输出）
     */
    public String getMaskedMchKey() {
        if (mchKey == null || mchKey.length() <= 8) {
            return "****";
        }
        return mchKey.substring(0, 4) + "****" + mchKey.substring(mchKey.length() - 4);
    }
}
```

#### PlatformDTO - 平台配置DTO

```java
@Data
public class PlatformDTO implements Serializable {
    
    private Long id;
    private String type;
    private String name;
    private String appid;
    private String secret;
    private String paymentIds;
    private String status;
    
    /**
     * 检查是否支持指定的支付配置
     */
    public boolean supportsPayment(Long paymentId) {
        return getPaymentIdList().contains(paymentId);
    }
}
```

## 业务模型 (Model)

业务模型主要用于封装业务逻辑相关的数据结构，通常包含业务行为和状态信息。

### 登录用户模型

#### LoginUser - 登录用户身份权限

```java
@Data
@NoArgsConstructor
public class LoginUser implements Serializable {
    
    private String tenantId;
    private Long userId;
    private Long deptId;
    private String token;
    private String userType;
    private Long loginTime;
    private Long expireTime;
    private String ipaddr;
    private Set<String> menuPermission;
    private Set<String> rolePermission;
    private String userName;
    private String nickName;
    private List<RoleDTO> roles;
    private List<PostDTO> posts;
    
    /**
     * 获取登录id
     */
    public String getLoginId() {
        if (userType == null) {
            throw new IllegalArgumentException("用户类型不能为空");
        }
        if (userId == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        return userType + ":" + userId;
    }
}
```

### 登录请求模型

#### LoginBody - 登录基础模型

```java
@Data
public class LoginBody implements Serializable {
    
    /**
     * 认证方式
     */
    @NotBlank(message = I18nKeys.Auth.TYPE_REQUIRED)
    private String authType;
    
    /**
     * 验证码
     */
    private String code;
    
    /**
     * 唯一标识
     */
    private String uuid;
}
```

#### PasswordLoginBody - 密码登录模型

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class PasswordLoginBody extends LoginBody {
    
    @NotBlank(message = I18nKeys.User.USERNAME_REQUIRED)
    @Length(min = 2, max = 30, message = I18nKeys.User.USERNAME_LENGTH_INVALID)
    private String userName;
    
    @NotBlank(message = I18nKeys.User.PASSWORD_REQUIRED)
    @Length(min = 5, max = 30, message = I18nKeys.User.PASSWORD_LENGTH_INVALID)
    private String password;
}
```

#### SmsLoginBody - 短信登录模型

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class SmsLoginBody extends LoginBody {
    
    @NotBlank(message = I18nKeys.User.PHONE_REQUIRED)
    private String phone;
    
    @NotBlank(message = I18nKeys.VerifyCode.SMS_REQUIRED)
    private String smsCode;
}
```

#### EmailLoginBody - 邮箱登录模型

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class EmailLoginBody extends LoginBody {
    
    @NotBlank(message = I18nKeys.User.EMAIL_REQUIRED)
    @Email(message = I18nKeys.User.EMAIL_FORMAT_INVALID)
    private String email;
    
    @NotBlank(message = I18nKeys.VerifyCode.EMAIL_REQUIRED)
    private String emailCode;
}
```

#### SocialLoginBody - 社交登录模型

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class SocialLoginBody extends LoginBody {
    
    @NotBlank(message = I18nKeys.SocialLogin.SOURCE_REQUIRED)
    private String source;
    
    @NotBlank(message = I18nKeys.SocialLogin.AUTH_CODE_REQUIRED)
    private String socialCode;
    
    @NotBlank(message = I18nKeys.SocialLogin.STATE_REQUIRED)
    private String socialState;
}
```

#### RegisterBody - 注册模型

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class RegisterBody extends LoginBody {
    
    @NotBlank(message = I18nKeys.User.USERNAME_REQUIRED)
    @Length(min = 2, max = 30, message = I18nKeys.User.USERNAME_LENGTH_INVALID)
    private String userName;
    
    @NotBlank(message = I18nKeys.User.PASSWORD_REQUIRED)
    @Length(min = 5, max = 30, message = I18nKeys.User.PASSWORD_LENGTH_INVALID)
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).*$", 
             message = I18nKeys.User.PASSWORD_COMPLEXITY_INVALID)
    private String password;
    
    private String userType;
}
```

## 视图对象 (VO)

视图对象主要用于前端展示，通常包含格式化后的数据和额外的展示属性。

### DictItemVo - 字典项视图对象

```java
@Data
public class DictItemVo implements Serializable {
    
    private String label;
    private String value;
    private String status;
    private String elTagType;
    private String elTagClass;
    
    /**
     * 快速创建字典项
     */
    public static DictItemVo of(String label, String value) {
        DictItemVo item = new DictItemVo();
        item.setLabel(label);
        item.setValue(value);
        return item;
    }
    
    /**
     * 创建带标签类型的字典项
     */
    public static DictItemVo of(String label, String value, String elTagType) {
        DictItemVo item = new DictItemVo();
        item.setLabel(label);
        item.setValue(value);
        item.setElTagType(elTagType);
        return item;
    }
}
```

## 设计原则与最佳实践

### 1. 命名规范

#### DTO 命名规范

```java
// ✅ 正确命名
UserDTO.java          // 用户数据传输对象
DeptDTO.java          // 部门数据传输对象
PaymentDTO.java       // 支付配置数据传输对象

// ❌ 错误命名
User.java             // 容易与实体类混淆
UserInfo.java         // 含义不明确
UserTransfer.java     // 命名冗余
```

#### Model 命名规范

```java
// ✅ 正确命名
LoginUser.java        // 登录用户模型
LoginBody.java        // 登录请求模型
RegisterBody.java     // 注册请求模型

// ❌ 错误命名
LoginRequest.java     // 不符合Body约定
LoginModel.java       // 含义模糊
LoginParam.java       // 混淆参数概念
```

#### VO 命名规范

```java
// ✅ 正确命名
UserVo.java           // 用户视图对象
DictItemVo.java       // 字典项视图对象
MenuTreeVo.java       // 菜单树视图对象

// ❌ 错误命名
UserView.java         // 不符合VO约定
UserDisplay.java      // 含义不明确
```

### 2. 数据传输层次

```
Controller Layer
       ↕
    Bo/Vo Objects    # 业务对象/视图对象
       ↕
  Service Layer
       ↕
    DTO Objects      # 数据传输对象
       ↕
   Entity Objects    # 实体对象
```

### 3. 字段设计原则

#### 必要字段

```java
@Data
public class UserDTO implements Serializable {
    
    // ✅ 序列化版本号
    @Serial
    private static final long serialVersionUID = 1L;
    
    // ✅ 主键ID
    private Long userId;
    
    // ✅ 核心业务字段
    private String userName;
    private String nickName;
    
    // ✅ 状态字段
    private String status;
    
    // ✅ 时间字段
    private Date createTime;
}
```

#### 可选字段处理

```java
@Data
public class PaymentDTO implements Serializable {
    
    // 基础字段
    private String mchId;
    private String mchKey;
    
    // 可选字段 - 开发环境配置
    private String devNotifyUrl;
    private String devCertPath;
    
    /**
     * 判断是否有开发环境配置
     */
    public boolean hasDevConfig() {
        return (devNotifyUrl != null && !devNotifyUrl.trim().isEmpty())
            || (devCertPath != null && !devCertPath.trim().isEmpty());
    }
    
    /**
     * 获取实际配置（优先使用开发环境）
     */
    public String getActualNotifyUrl(boolean isDev) {
        if (isDev && hasDevConfig()) {
            return devNotifyUrl;
        }
        return notifyUrl;
    }
}
```

### 4. 业务方法设计

#### 状态判断方法

```java
@Data
public class PaymentDTO implements Serializable {
    
    private String status;
    private String type;
    
    /**
     * 判断是否为启用状态
     */
    public boolean isEnabled() {
        return DictEnableStatus.ENABLE.getValue().equals(this.status);
    }
    
    /**
     * 判断是否为微信支付
     */
    public boolean isWechatPayment() {
        return "WECHAT".equals(this.type);
    }
    
    /**
     * 判断是否配置了APIv3
     */
    public boolean hasApiV3Config() {
        return apiV3Key != null && !apiV3Key.trim().isEmpty()
            && certSerialNo != null && !certSerialNo.trim().isEmpty();
    }
}
```

#### 数据转换方法

```java
@Data
public class PlatformDTO implements Serializable {
    
    private String paymentIds;  // "1,2,3"
    
    /**
     * 获取支付配置ID列表
     */
    public List<Long> getPaymentIdList() {
        if (paymentIds == null || paymentIds.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        return Arrays.stream(paymentIds.split(","))
            .map(String.class::trim)
            .filter(s -> !s.isEmpty())
            .map(Long::parseLong)
            .collect(Collectors.toList());
    }
    
    /**
     * 设置支付配置ID列表
     */
    public void setPaymentIdList(List<Long> paymentIdList) {
        if (paymentIdList == null || paymentIdList.isEmpty()) {
            this.paymentIds = "";
        } else {
            this.paymentIds = paymentIdList.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        }
    }
}
```

### 5. 安全性考虑

#### 敏感信息掩码

```java
@Data
public class PaymentDTO implements Serializable {
    
    private String mchKey;
    private String apiV3Key;
    
    /**
     * 掩码处理商户密钥（用于日志输出）
     */
    public String getMaskedMchKey() {
        if (mchKey == null || mchKey.length() <= 8) {
            return "****";
        }
        return mchKey.substring(0, 4) + "****" + mchKey.substring(mchKey.length() - 4);
    }
    
    @Override
    public String toString() {
        return "PaymentDTO{" +
                "id=" + id +
                ", mchName='" + mchName + '\'' +
                ", mchId='" + mchId + '\'' +
                ", mchKey='" + getMaskedMchKey() + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
```

## 使用场景与示例

### 1. Controller 层使用

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    /**
     * 查询用户列表
     */
    @GetMapping
    public R<List<UserVo>> listUsers() {
        List<UserDTO> userDTOs = userService.listUsers();
        List<UserVo> userVos = MapstructUtils.convert(userDTOs, UserVo.class);
        return R.ok(userVos);
    }
    
    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public R<UserVo> getUser(@PathVariable Long id) {
        UserDTO userDTO = userService.getUser(id);
        UserVo userVo = MapstructUtils.convert(userDTO, UserVo.class);
        return R.ok(userVo);
    }
    
    /**
     * 创建用户
     */
    @PostMapping
    public R<Long> createUser(@Validated(AddGroup.class) @RequestBody UserBo userBo) {
        UserDTO userDTO = MapstructUtils.convert(userBo, UserDTO.class);
        Long userId = userService.createUser(userDTO);
        return R.ok("用户创建成功", userId);
    }
}
```

### 2. Service 层使用

```java
@Service
public class UserServiceImpl implements UserService {
    
    /**
     * 创建用户
     */
    @Override
    public Long createUser(UserDTO userDTO) {
        // 参数校验
        ValidatorUtils.validate(userDTO, AddGroup.class);
        
        // DTO 转 Entity
        User user = MapstructUtils.convert(userDTO, User.class);
        
        // 业务逻辑处理
        user.setCreateTime(new Date());
        user.setStatus(DictEnableStatus.ENABLE.getValue());
        
        // 保存用户
        userRepository.save(user);
        
        return user.getUserId();
    }
    
    /**
     * 获取用户信息
     */
    @Override
    public UserDTO getUser(Long userId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw ServiceException.of("用户不存在");
        }
        
        // Entity 转 DTO
        UserDTO userDTO = MapstructUtils.convert(user, UserDTO.class);
        
        return userDTO;
    }
}
```

### 3. 登录认证使用

```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    /**
     * 密码登录
     */
    @PostMapping("/login/password")
    public R<LoginResult> passwordLogin(@Validated @RequestBody PasswordLoginBody loginBody) {
        LoginUser loginUser = authService.passwordLogin(loginBody);
        LoginResult result = buildLoginResult(loginUser);
        return R.ok("登录成功", result);
    }
    
    /**
     * 短信登录
     */
    @PostMapping("/login/sms")
    public R<LoginResult> smsLogin(@Validated @RequestBody SmsLoginBody loginBody) {
        LoginUser loginUser = authService.smsLogin(loginBody);
        LoginResult result = buildLoginResult(loginUser);
        return R.ok("登录成功", result);
    }
    
    /**
     * 社交登录
     */
    @PostMapping("/login/social")
    public R<LoginResult> socialLogin(@Validated @RequestBody SocialLoginBody loginBody) {
        LoginUser loginUser = authService.socialLogin(loginBody);
        LoginResult result = buildLoginResult(loginUser);
        return R.ok("登录成功", result);
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public R<Void> register(@Validated @RequestBody RegisterBody registerBody) {
        authService.register(registerBody);
        return R.ok("注册成功");
    }
    
    /**
     * 构建登录结果
     */
    private LoginResult buildLoginResult(LoginUser loginUser) {
        LoginResult result = new LoginResult();
        result.setToken(loginUser.getToken());
        result.setExpireTime(loginUser.getExpireTime());
        
        // 用户信息
        UserInfo userInfo = new UserInfo();
        userInfo.setUserId(loginUser.getUserId());
        userInfo.setUserName(loginUser.getUserName());
        userInfo.setNickName(loginUser.getNickName());
        userInfo.setRoles(loginUser.getRoles());
        userInfo.setPermissions(loginUser.getMenuPermission());
        
        result.setUserInfo(userInfo);
        return result;
    }
}
```

## 业务验证与扩展功能

### 1. 业务验证

```java
@Data
public class PaymentDTO implements Serializable {
    
    /**
     * 检查必要的配置项是否完整
     */
    public boolean isConfigComplete() {
        // 基础配置检查
        if (mchId == null || mchId.trim().isEmpty()) {
            return false;
        }
        if (mchName == null || mchName.trim().isEmpty()) {
            return false;
        }
        
        // 根据支付类型验证不同的必要参数
        return switch (type) {
            case "wechat" -> 
                mchKey != null && !mchKey.trim().isEmpty()
                && certPath != null && !certPath.trim().isEmpty();
            case "alipay" -> 
                mchKey != null && !mchKey.trim().isEmpty();
            case "balance" -> true;
            default -> false;
        };
    }
    
    /**
     * 获取配置摘要信息（用于日志）
     */
    public String getConfigSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("商户[").append(mchName).append("]");
        summary.append("(").append(mchId).append(")");
        summary.append(" 类型:").append(type != null ? type : "未知");
        summary.append(" 状态:").append("1".equals(status) ? "启用" : "禁用");
        if (hasApiV3Config()) {
            summary.append(" [支持APIv3]");
        }
        return summary.toString();
    }
}
```

## 数据转换工具

### MapStruct 对象映射

```java
// 基本转换
UserDTO userDTO = MapstructUtils.convert(user, UserDTO.class);
UserVo userVo = MapstructUtils.convert(userDTO, UserVo.class);

// 列表转换
List<UserVo> userVos = MapstructUtils.convert(userDTOs, UserVo.class);

// Map转对象
UserDTO userDTO = MapstructUtils.convert(userMap, UserDTO.class);
```

### 手动转换示例

```java
/**
 * 用户实体转DTO
 */
public class UserConverter {

    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setNickName(user.getNickName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());
        dto.setCreateTime(user.getCreateTime());

        return dto;
    }

    public static List<UserDTO> toDTOList(List<User> users) {
        if (users == null) {
            return Collections.emptyList();
        }
        return users.stream()
                    .map(UserConverter::toDTO)
                    .collect(Collectors.toList());
    }
}
```

## 数据模型测试

### 单元测试示例

```java
/**
 * R响应类测试
 */
class RTest {

    @Test
    void testOkWithData() {
        User user = new User();
        user.setUserId(1L);
        user.setUserName("test");

        R<User> result = R.ok(user);

        assertEquals(R.SUCCESS, result.getCode());
        assertNotNull(result.getData());
        assertEquals(1L, result.getData().getUserId());
    }

    @Test
    void testFail() {
        R<Void> result = R.fail("操作失败");

        assertEquals(R.FAIL, result.getCode());
        assertEquals("操作失败", result.getMsg());
        assertNull(result.getData());
    }

    @Test
    void testStatus() {
        R<Void> success = R.status(true);
        R<Void> fail = R.status(false);

        assertEquals(R.SUCCESS, success.getCode());
        assertEquals(R.FAIL, fail.getCode());
    }
}

/**
 * DTO转换测试
 */
class DTOConvertTest {

    @Test
    void testUserDTOConvert() {
        User user = new User();
        user.setUserId(1L);
        user.setUserName("admin");
        user.setNickName("管理员");

        UserDTO dto = MapstructUtils.convert(user, UserDTO.class);

        assertNotNull(dto);
        assertEquals(user.getUserId(), dto.getUserId());
        assertEquals(user.getUserName(), dto.getUserName());
        assertEquals(user.getNickName(), dto.getNickName());
    }

    @Test
    void testPaymentDTOMethods() {
        PaymentDTO payment = new PaymentDTO();
        payment.setStatus("1");
        payment.setType("WECHAT");
        payment.setMchKey("1234567890abcdef");

        assertTrue(payment.isEnabled());
        assertTrue(payment.isWechatPayment());
        assertEquals("1234****cdef", payment.getMaskedMchKey());
    }
}

/**
 * 登录模型校验测试
 */
class LoginBodyValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testPasswordLoginBody_Valid() {
        PasswordLoginBody body = new PasswordLoginBody();
        body.setAuthType("password");
        body.setUserName("admin");
        body.setPassword("admin123");

        Set<ConstraintViolation<PasswordLoginBody>> violations = validator.validate(body);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testPasswordLoginBody_Invalid() {
        PasswordLoginBody body = new PasswordLoginBody();
        body.setAuthType("password");
        body.setUserName(""); // 空用户名
        body.setPassword("123"); // 密码太短

        Set<ConstraintViolation<PasswordLoginBody>> violations = validator.validate(body);
        assertFalse(violations.isEmpty());
        assertEquals(2, violations.size());
    }
}
```

## 注意事项

### 1. 序列化兼容性

```java
// 始终声明 serialVersionUID
@Data
public class UserDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    // ...
}
```

### 2. 空值安全

```java
// 使用Optional或默认值处理可能为空的字段
public String getDisplayName() {
    return Optional.ofNullable(nickName)
                   .filter(s -> !s.isEmpty())
                   .orElse(userName);
}
```

### 3. 不可变性考虑

```java
// 对于集合类型字段，返回不可变副本
public List<Long> getPaymentIdList() {
    if (paymentIds == null) {
        return Collections.emptyList();
    }
    return Collections.unmodifiableList(parsePaymentIds());
}
```

### 4. 敏感信息处理

```java
// 重写toString避免输出敏感信息
@Override
public String toString() {
    return "PaymentDTO{mchId='" + mchId + "', mchKey='****'}";
}

// 使用@JsonIgnore避免序列化敏感字段
@JsonIgnore
private String secretKey;
```

### 5. 线程安全

```java
// DTO通常是不可变的，天然线程安全
// 如果包含可变字段，考虑使用同步或不可变集合
private final List<String> roles = new CopyOnWriteArrayList<>();
```

## 总结

数据模型与DTO系统是ruoyi-plus-uniapp中数据传输的核心基础设施，本文档涵盖了：

1. **统一响应体系** - `R<T>` 类提供标准化的API响应格式，支持国际化
2. **数据传输对象** - 用于不同层之间的数据传输，包含用户、角色、字典等
3. **业务模型** - 封装业务逻辑相关数据，如登录用户、登录请求等
4. **视图对象** - 面向前端展示的数据结构
5. **设计原则** - 命名规范、字段设计、安全性考虑
6. **使用场景** - Controller层、Service层、认证场景的实际应用
7. **数据转换** - MapStruct工具的使用方法

遵循这些规范和最佳实践，可以确保系统各层之间的数据交互规范化、类型安全，提高代码的可维护性和可读性。
