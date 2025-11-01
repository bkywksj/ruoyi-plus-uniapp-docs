# API 设计规范

RuoYi-Plus 项目的API接口设计规范，包含RESTful设计、响应格式、错误处理等最佳实践。

## 📋 设计原则

### 1. RESTful 风格

采用 RESTful 架构风格设计API，使用HTTP动词表示操作类型。

```java
// ✅ 好的RESTful设计
@RestController
@RequestMapping("/api/users")
public class UserController {

    // GET /api/users - 获取用户列表
    @GetMapping
    public R<PageResult<UserVo>> getUsers(@RequestParam Map<String, Object> params) {
        return R.ok(userService.queryPageList(params));
    }

    // GET /api/users/123 - 获取指定用户
    @GetMapping("/{id}")
    public R<UserVo> getUser(@PathVariable Long id) {
        return R.ok(userService.selectUserById(id));
    }

    // POST /api/users - 创建用户
    @PostMapping
    public R<UserVo> createUser(@RequestBody UserBo user) {
        return R.ok(userService.insertUser(user));
    }

    // PUT /api/users/123 - 更新用户
    @PutMapping("/{id}")
    public R<UserVo> updateUser(@PathVariable Long id, @RequestBody UserBo user) {
        user.setUserId(id);
        return R.ok(userService.updateUser(user));
    }

    // DELETE /api/users/123 - 删除用户
    @DeleteMapping("/{id}")
    public R<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
        return R.ok();
    }

    // PATCH /api/users/123/status - 部分更新（状态）
    @PatchMapping("/{id}/status")
    public R<Void> updateUserStatus(@PathVariable Long id, @RequestBody StatusBo status) {
        userService.updateUserStatus(id, status.getStatus());
        return R.ok();
    }
}

// ❌ 不好的设计
@RestController
@RequestMapping("/api/user")
public class UserController {

    @PostMapping("/getUserList")  // 应该用GET
    public R<List<UserVo>> getUserList() { }

    @GetMapping("/addUser")       // 应该用POST
    public R<Void> addUser() { }

    @PostMapping("/updateUser")   // 应该用PUT
    public R<Void> updateUser() { }
}
```

### 2. 统一响应格式

所有API接口使用统一的响应格式。

```java
/**
 * 统一响应结果
 */
@Data
public class R<T> implements Serializable {

    /** 成功 */
    public static final int SUCCESS = 200;

    /** 失败 */
    public static final int FAIL = 500;

    private int code;
    private String msg;
    private T data;

    public static <T> R<T> ok() {
        return restResult(null, SUCCESS, "操作成功");
    }

    public static <T> R<T> ok(T data) {
        return restResult(data, SUCCESS, "操作成功");
    }

    public static <T> R<T> ok(String msg) {
        return restResult(null, SUCCESS, msg);
    }

    public static <T> R<T> ok(String msg, T data) {
        return restResult(data, SUCCESS, msg);
    }

    public static <T> R<T> fail() {
        return restResult(null, FAIL, "操作失败");
    }

    public static <T> R<T> fail(String msg) {
        return restResult(null, FAIL, msg);
    }

    public static <T> R<T> fail(T data) {
        return restResult(data, FAIL, "操作失败");
    }

    public static <T> R<T> fail(String msg, T data) {
        return restResult(data, FAIL, msg);
    }

    public static <T> R<T> fail(int code, String msg) {
        return restResult(null, code, msg);
    }

    private static <T> R<T> restResult(T data, int code, String msg) {
        R<T> r = new R<>();
        r.setCode(code);
        r.setData(data);
        r.setMsg(msg);
        return r;
    }
}

// 使用示例
@RestController
public class UserController {

    @GetMapping("/users/{id}")
    public R<UserVo> getUser(@PathVariable Long id) {
        UserVo user = userService.selectUserById(id);
        return R.ok(user);
    }

    @PostMapping("/users")
    public R<Long> createUser(@RequestBody UserBo user) {
        Long userId = userService.insertUser(user);
        return R.ok("用户创建成功", userId);
    }

    @DeleteMapping("/users/{id}")
    public R<Void> deleteUser(@PathVariable Long id) {
        boolean success = userService.deleteUserById(id);
        return success ? R.ok("删除成功") : R.fail("删除失败");
    }
}
```

### 3. 分页响应格式

统一的分页响应格式。

```java
/**
 * 分页响应结果
 */
@Data
public class PageResult<T> implements Serializable {

    /** 总记录数 */
    private Long total;

    /** 列表数据 */
    private List<T> records;

    /** 当前页码 */
    private Long current;

    /** 每页显示记录数 */
    private Long size;

    /** 总页数 */
    private Long pages;

    public static <T> PageResult<T> build(Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(page.getRecords());
        result.setTotal(page.getTotal());
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setPages(page.getPages());
        return result;
    }

    public static <T> PageResult<T> build(List<T> list, Long total) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(list);
        result.setTotal(total);
        return result;
    }
}

// 分页查询示例
@GetMapping("/users")
public R<PageResult<UserVo>> getUsers(UserQuery query, PageQuery pageQuery) {
    PageResult<UserVo> result = userService.queryPageList(query, pageQuery);
    return R.ok(result);
}
```

## 🔗 URL 设计

### 资源命名

```java
// ✅ 好的资源命名
/api/users                    // 用户资源
/api/users/123               // 特定用户
/api/users/123/roles         // 用户的角色
/api/users/123/permissions   // 用户的权限
/api/departments             // 部门资源
/api/departments/456/users   // 部门下的用户

// ❌ 不好的资源命名
/api/user                    // 单数形式
/api/getUserList            // 动词形式
/api/user_management        // 下划线分隔
/api/users-list             // 混合命名
```

### 查询参数

```java
// ✅ 好的查询参数设计
@GetMapping("/users")
public R<PageResult<UserVo>> getUsers(
    @RequestParam(defaultValue = "1") Integer page,
    @RequestParam(defaultValue = "10") Integer size,
    @RequestParam(required = false) String name,
    @RequestParam(required = false) String email,
    @RequestParam(required = false) String status,
    @RequestParam(required = false) String sort,
    @RequestParam(required = false) String order) {

    // 构建查询条件
    UserQuery query = UserQuery.builder()
        .name(name)
        .email(email)
        .status(status)
        .build();

    PageQuery pageQuery = PageQuery.builder()
        .pageNum(page)
        .pageSize(size)
        .orderByColumn(sort)
        .isAsc("asc".equalsIgnoreCase(order))
        .build();

    return R.ok(userService.queryPageList(query, pageQuery));
}

// 使用示例
// GET /api/users?page=1&size=20&name=admin&status=active&sort=createTime&order=desc
```

### 过滤和搜索

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    // 基础过滤
    @GetMapping
    public R<PageResult<UserVo>> getUsers(UserQuery query, PageQuery pageQuery) {
        return R.ok(userService.queryPageList(query, pageQuery));
    }

    // 搜索功能
    @GetMapping("/search")
    public R<List<UserVo>> searchUsers(@RequestParam String keyword) {
        List<UserVo> users = userService.searchUsers(keyword);
        return R.ok(users);
    }

    // 高级搜索
    @PostMapping("/search")
    public R<PageResult<UserVo>> advancedSearch(@RequestBody UserSearchBo searchBo, PageQuery pageQuery) {
        PageResult<UserVo> result = userService.advancedSearch(searchBo, pageQuery);
        return R.ok(result);
    }
}

@Data
public class UserSearchBo {
    private String keyword;
    private List<String> statuses;
    private List<Long> departmentIds;
    private DateRange createTimeRange;
    private DateRange loginTimeRange;
}
```

## 📊 状态码设计

### HTTP状态码

```java
@RestController
public class UserController {

    // 200 OK - 成功
    @GetMapping("/users/{id}")
    public ResponseEntity<UserVo> getUser(@PathVariable Long id) {
        UserVo user = userService.selectUserById(id);
        return ResponseEntity.ok(user);
    }

    // 201 Created - 创建成功
    @PostMapping("/users")
    public ResponseEntity<UserVo> createUser(@RequestBody UserBo user) {
        UserVo createdUser = userService.insertUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // 204 No Content - 删除成功
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    // 400 Bad Request - 请求参数错误
    @PostMapping("/users")
    public ResponseEntity<R<Void>> createUser(@Valid @RequestBody UserBo user) {
        // Spring Validation 会自动返回400状态码
        return ResponseEntity.ok(R.ok());
    }

    // 404 Not Found - 资源不存在
    @GetMapping("/users/{id}")
    public ResponseEntity<UserVo> getUser(@PathVariable Long id) {
        UserVo user = userService.selectUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
}
```

### 业务状态码

```java
/**
 * 业务状态码枚举
 */
public enum BusinessCode {

    SUCCESS(200, "操作成功"),

    // 系统异常 1000-1999
    SYSTEM_ERROR(1000, "系统异常"),
    SYSTEM_BUSY(1001, "系统繁忙"),
    SYSTEM_TIMEOUT(1002, "系统超时"),

    // 参数异常 2000-2999
    PARAM_ERROR(2000, "参数错误"),
    PARAM_MISSING(2001, "缺少必要参数"),
    PARAM_INVALID(2002, "参数格式不正确"),

    // 认证异常 3000-3999
    AUTH_FAILED(3000, "认证失败"),
    TOKEN_INVALID(3001, "Token无效"),
    TOKEN_EXPIRED(3002, "Token已过期"),

    // 权限异常 4000-4999
    PERMISSION_DENIED(4000, "权限不足"),
    ACCESS_FORBIDDEN(4001, "访问被拒绝"),

    // 用户异常 5000-5999
    USER_NOT_FOUND(5001, "用户不存在"),
    USER_EXISTS(5002, "用户已存在"),
    PASSWORD_ERROR(5003, "密码错误"),
    ACCOUNT_DISABLED(5004, "账户已被禁用"),

    // 业务异常 6000-9999
    DEPT_NOT_FOUND(6001, "部门不存在"),
    ROLE_NOT_FOUND(6002, "角色不存在");

    private final Integer code;
    private final String message;

    BusinessCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    // getter methods...
}

// 使用示例
@Service
public class UserServiceImpl implements IUserService {

    public UserVo selectUserById(Long userId) {
        UserVo user = baseMapper.selectVoById(userId);
        if (ObjectUtil.isNull(user)) {
            throw new ServiceException(BusinessCode.USER_NOT_FOUND.getCode(),
                                     BusinessCode.USER_NOT_FOUND.getMessage());
        }
        return user;
    }
}
```

## 📝 请求响应设计

### 请求体设计

```java
// ✅ 好的请求体设计
@Data
@Valid
public class CreateUserRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度在2-20之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$",
             message = "密码必须包含大小写字母和数字，长度至少8位")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotNull(message = "部门ID不能为空")
    private Long departmentId;

    private List<Long> roleIds;
}

@Data
@Valid
public class UpdateUserRequest {

    @Size(min = 2, max = 20, message = "用户名长度在2-20之间")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    private Long departmentId;
    private List<Long> roleIds;
    private String status;
}

// ❌ 不好的请求体设计
@Data
public class UserRequest {
    private String action; // 不应该在请求体中指定操作类型
    private Map<String, Object> data; // 不应该使用通用Map
}
```

### 响应体设计

```java
// ✅ 好的响应体设计
@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String status;
    private String statusName;
    private DepartmentResponse department;
    private List<RoleResponse> roles;
    private Date createTime;
    private Date updateTime;
}

@Data
public class DepartmentResponse {
    private Long id;
    private String name;
    private String code;
}

@Data
public class RoleResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
}

// ❌ 不好的响应体设计
@Data
public class UserResponse {
    private Map<String, Object> user; // 不应该使用通用Map
    private List<Map<String, Object>> roles; // 缺少类型安全
}
```

## 🔒 安全设计

### 输入验证

```java
@RestController
@Validated
public class UserController {

    @PostMapping("/users")
    public R<UserVo> createUser(@Valid @RequestBody CreateUserRequest request) {
        // Spring Validation会自动验证
        return R.ok(userService.createUser(request));
    }

    @GetMapping("/users/{id}")
    public R<UserVo> getUser(@PathVariable @Positive(message = "用户ID必须为正数") Long id) {
        return R.ok(userService.selectUserById(id));
    }

    @GetMapping("/users")
    public R<PageResult<UserVo>> getUsers(
        @RequestParam @Min(value = 1, message = "页码最小为1") Integer page,
        @RequestParam @Range(min = 1, max = 100, message = "每页记录数在1-100之间") Integer size) {

        return R.ok(userService.queryPageList(page, size));
    }
}
```

### 权限控制

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @SaCheckPermission("system:user:list")
    @GetMapping
    public R<PageResult<UserVo>> getUsers() {
        return R.ok(userService.queryPageList());
    }

    @SaCheckPermission("system:user:add")
    @PostMapping
    public R<UserVo> createUser(@RequestBody CreateUserRequest request) {
        return R.ok(userService.createUser(request));
    }

    @SaCheckPermission("system:user:edit")
    @PutMapping("/{id}")
    public R<UserVo> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return R.ok(userService.updateUser(id, request));
    }

    @SaCheckPermission("system:user:remove")
    @DeleteMapping("/{id}")
    public R<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return R.ok();
    }
}
```

### 数据脱敏

```java
@Data
public class UserResponse {
    private Long id;
    private String username;

    @JsonSerialize(using = PhoneDesensitizeSerializer.class)
    private String phone;

    @JsonSerialize(using = EmailDesensitizeSerializer.class)
    private String email;

    @JsonIgnore
    private String password; // 敏感信息不返回
}

/**
 * 手机号脱敏序列化器
 */
public class PhoneDesensitizeSerializer extends JsonSerializer<String> {
    @Override
    public void serialize(String value, JsonGenerator gen, SerializerProvider serializers)
            throws IOException {
        if (StringUtils.isNotBlank(value) && value.length() == 11) {
            String desensitized = value.substring(0, 3) + "****" + value.substring(7);
            gen.writeString(desensitized);
        } else {
            gen.writeString(value);
        }
    }
}
```

## 📚 API文档

### OpenAPI规范

```java
@Tag(name = "用户管理", description = "用户相关的增删改查操作")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Operation(summary = "获取用户列表", description = "分页查询用户列表，支持条件筛选")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "400", description = "参数错误"),
        @ApiResponse(responseCode = "401", description = "未认证"),
        @ApiResponse(responseCode = "403", description = "权限不足")
    })
    @GetMapping
    public R<PageResult<UserVo>> getUsers(
        @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页记录数", example = "10") @RequestParam(defaultValue = "10") Integer size,
        @Parameter(description = "用户名", example = "admin") @RequestParam(required = false) String username,
        @Parameter(description = "状态", example = "active") @RequestParam(required = false) String status) {

        return R.ok(userService.queryPageList(page, size, username, status));
    }

    @Operation(summary = "创建用户", description = "创建新用户")
    @PostMapping
    public R<UserVo> createUser(
        @Parameter(description = "用户信息") @Valid @RequestBody CreateUserRequest request) {

        return R.ok(userService.createUser(request));
    }
}
```

API设计规范确保了接口的一致性、可维护性和易用性，为前端开发和第三方集成提供了清晰的契约。