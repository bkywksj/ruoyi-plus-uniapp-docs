# API 设计规范

RuoYi-Plus 项目的API接口设计规范，包含RESTful设计、响应格式、错误处理等最佳实践。

## 设计原则

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

## URL 设计

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

## 状态码设计

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

## 请求响应设计

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

## 安全设计

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

## API文档

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

## 版本控制

### URL 版本控制

```java
// ✅ 推荐 - URL路径版本控制
@RestController
@RequestMapping("/api/v1/users")
public class UserV1Controller {

    @GetMapping("/{id}")
    public R<UserVo> getUser(@PathVariable Long id) {
        return R.ok(userService.selectUserById(id));
    }
}

@RestController
@RequestMapping("/api/v2/users")
public class UserV2Controller {

    @GetMapping("/{id}")
    public R<UserDetailVo> getUser(@PathVariable Long id) {
        // V2版本返回更详细的用户信息
        return R.ok(userService.selectUserDetailById(id));
    }
}
```

### 请求头版本控制

```java
// 通过请求头指定版本
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping(value = "/{id}", headers = "X-API-Version=1")
    public R<UserVo> getUserV1(@PathVariable Long id) {
        return R.ok(userService.selectUserById(id));
    }

    @GetMapping(value = "/{id}", headers = "X-API-Version=2")
    public R<UserDetailVo> getUserV2(@PathVariable Long id) {
        return R.ok(userService.selectUserDetailById(id));
    }
}
```

### 版本兼容策略

```java
/**
 * 版本兼容处理
 */
@Component
public class ApiVersionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                            Object handler) throws Exception {
        String version = request.getHeader("X-API-Version");
        if (StringUtils.isBlank(version)) {
            version = "1"; // 默认版本
        }

        // 将版本信息存入请求属性
        request.setAttribute("apiVersion", version);
        return true;
    }
}

// 在 Service 层根据版本处理
@Service
public class UserServiceImpl implements IUserService {

    public Object getUserByVersion(Long id, String version) {
        return switch (version) {
            case "2" -> selectUserDetailById(id);
            default -> selectUserById(id);
        };
    }
}
```

---

## 错误处理规范

### 全局异常处理

```java
/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e, HttpServletRequest request) {
        log.error("请求地址: {}, 业务异常: {}", request.getRequestURI(), e.getMessage());
        return R.fail(e.getCode(), e.getMessage());
    }

    /**
     * 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Map<String, String>> handleValidException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return R.fail(BusinessCode.PARAM_ERROR.getCode(), "参数校验失败", errors);
    }

    /**
     * 参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    public R<Void> handleBindException(BindException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        return R.fail(BusinessCode.PARAM_ERROR.getCode(), message);
    }

    /**
     * 约束违反异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public R<Void> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining(", "));
        return R.fail(BusinessCode.PARAM_ERROR.getCode(), message);
    }

    /**
     * 权限不足异常
     */
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e) {
        return R.fail(BusinessCode.PERMISSION_DENIED.getCode(), "权限不足: " + e.getMessage());
    }

    /**
     * 认证失败异常
     */
    @ExceptionHandler(NotLoginException.class)
    public R<Void> handleNotLoginException(NotLoginException e) {
        return R.fail(BusinessCode.AUTH_FAILED.getCode(), "认证失败: " + e.getMessage());
    }

    /**
     * 请求方法不支持异常
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<Void> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        return R.fail(BusinessCode.PARAM_ERROR.getCode(),
            "不支持的请求方法: " + e.getMethod());
    }

    /**
     * 资源不存在异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public R<Void> handleNoHandlerFoundException(NoHandlerFoundException e) {
        return R.fail(404, "资源不存在: " + e.getRequestURL());
    }

    /**
     * 系统异常
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e, HttpServletRequest request) {
        log.error("请求地址: {}, 系统异常: ", request.getRequestURI(), e);
        return R.fail(BusinessCode.SYSTEM_ERROR.getCode(), "系统繁忙，请稍后重试");
    }
}
```

### 错误响应格式

```java
/**
 * 错误详情响应
 */
@Data
@Builder
public class ErrorDetail {
    /** 错误码 */
    private Integer code;

    /** 错误信息 */
    private String message;

    /** 错误详情 */
    private String detail;

    /** 请求路径 */
    private String path;

    /** 时间戳 */
    private Long timestamp;

    /** 追踪ID */
    private String traceId;

    /** 字段错误列表 */
    private List<FieldError> fieldErrors;

    @Data
    @Builder
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }
}

// 使用示例
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorDetail> handleValidException(
    MethodArgumentNotValidException e, HttpServletRequest request) {

    List<ErrorDetail.FieldError> fieldErrors = e.getBindingResult().getFieldErrors()
        .stream()
        .map(error -> ErrorDetail.FieldError.builder()
            .field(error.getField())
            .message(error.getDefaultMessage())
            .rejectedValue(error.getRejectedValue())
            .build())
        .collect(Collectors.toList());

    ErrorDetail errorDetail = ErrorDetail.builder()
        .code(400)
        .message("参数校验失败")
        .path(request.getRequestURI())
        .timestamp(System.currentTimeMillis())
        .traceId(MDC.get("traceId"))
        .fieldErrors(fieldErrors)
        .build();

    return ResponseEntity.badRequest().body(errorDetail);
}
```

---

## 批量操作设计

### 批量查询

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    /**
     * 批量查询用户 - GET 方式
     */
    @GetMapping("/batch")
    public R<List<UserVo>> getUsersByIds(
        @RequestParam @Size(max = 100, message = "一次最多查询100条") List<Long> ids) {

        return R.ok(userService.selectUsersByIds(ids));
    }

    /**
     * 批量查询用户 - POST 方式（推荐，URL长度无限制）
     */
    @PostMapping("/batch/query")
    public R<List<UserVo>> batchQueryUsers(
        @RequestBody @Valid BatchQueryRequest request) {

        return R.ok(userService.selectUsersByIds(request.getIds()));
    }
}

@Data
public class BatchQueryRequest {
    @NotEmpty(message = "ID列表不能为空")
    @Size(max = 100, message = "一次最多查询100条")
    private List<Long> ids;
}
```

### 批量创建

```java
/**
 * 批量创建用户
 */
@PostMapping("/batch")
@SaCheckPermission("system:user:add")
public R<BatchCreateResult> batchCreateUsers(
    @RequestBody @Valid @Size(max = 100, message = "一次最多创建100条") List<CreateUserRequest> requests) {

    BatchCreateResult result = userService.batchCreateUsers(requests);
    return R.ok(result);
}

@Data
public class BatchCreateResult {
    /** 成功数量 */
    private Integer successCount;

    /** 失败数量 */
    private Integer failCount;

    /** 成功的ID列表 */
    private List<Long> successIds;

    /** 失败详情 */
    private List<FailDetail> failDetails;

    @Data
    public static class FailDetail {
        private Integer index;
        private String reason;
        private Object data;
    }
}
```

### 批量更新

```java
/**
 * 批量更新用户状态
 */
@PatchMapping("/batch/status")
@SaCheckPermission("system:user:edit")
public R<BatchUpdateResult> batchUpdateStatus(
    @RequestBody @Valid BatchUpdateStatusRequest request) {

    BatchUpdateResult result = userService.batchUpdateStatus(
        request.getIds(), request.getStatus());
    return R.ok(result);
}

@Data
public class BatchUpdateStatusRequest {
    @NotEmpty(message = "ID列表不能为空")
    @Size(max = 100, message = "一次最多更新100条")
    private List<Long> ids;

    @NotBlank(message = "状态不能为空")
    private String status;
}
```

### 批量删除

```java
/**
 * 批量删除用户
 */
@DeleteMapping("/batch")
@SaCheckPermission("system:user:remove")
public R<BatchDeleteResult> batchDeleteUsers(
    @RequestBody @Valid BatchDeleteRequest request) {

    BatchDeleteResult result = userService.batchDeleteUsers(request.getIds());
    return R.ok(result);
}

@Data
public class BatchDeleteRequest {
    @NotEmpty(message = "ID列表不能为空")
    @Size(max = 100, message = "一次最多删除100条")
    private List<Long> ids;

    /** 是否强制删除 */
    private Boolean force = false;
}

@Data
public class BatchDeleteResult {
    private Integer successCount;
    private Integer failCount;
    private List<Long> failedIds;
    private List<String> failReasons;
}
```

---

## 并发控制设计

### 乐观锁控制

```java
// 实体类添加版本字段
@Data
public class User {
    private Long id;
    private String username;

    @Version
    private Integer version;
}

// 更新时携带版本号
@Data
public class UpdateUserRequest {
    private Long id;
    private String username;

    @NotNull(message = "版本号不能为空")
    private Integer version;
}

// Controller
@PutMapping("/{id}")
public R<UserVo> updateUser(@PathVariable Long id,
                            @RequestBody @Valid UpdateUserRequest request) {
    try {
        UserVo user = userService.updateUserWithVersion(id, request);
        return R.ok(user);
    } catch (OptimisticLockException e) {
        return R.fail(BusinessCode.CONCURRENT_CONFLICT.getCode(),
            "数据已被其他用户修改，请刷新后重试");
    }
}
```

### 悲观锁控制

```java
/**
 * 使用分布式锁保护关键操作
 */
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final RedissonClient redissonClient;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean payOrder(Long orderId) {
        String lockKey = "order:pay:" + orderId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁，等待3秒，锁自动释放时间30秒
            if (lock.tryLock(3, 30, TimeUnit.SECONDS)) {
                try {
                    // 执行支付逻辑
                    return doPayOrder(orderId);
                } finally {
                    lock.unlock();
                }
            } else {
                throw ServiceException.of("订单正在处理中，请勿重复操作");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw ServiceException.of("操作被中断");
        }
    }
}
```

### 幂等性设计

```java
/**
 * 幂等性注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    /** 幂等键的前缀 */
    String prefix() default "";

    /** 幂等键的参数表达式 */
    String key() default "";

    /** 过期时间（秒） */
    int expireTime() default 10;

    /** 提示消息 */
    String message() default "请勿重复提交";
}

// 使用示例
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    /**
     * 创建订单 - 幂等性保护
     */
    @PostMapping
    @Idempotent(prefix = "order:create", key = "#request.userId", expireTime = 5)
    public R<OrderVo> createOrder(@RequestBody @Valid CreateOrderRequest request) {
        return R.ok(orderService.createOrder(request));
    }

    /**
     * 支付订单 - 幂等性保护
     */
    @PostMapping("/{orderId}/pay")
    @Idempotent(prefix = "order:pay", key = "#orderId", expireTime = 30)
    public R<PayResult> payOrder(@PathVariable Long orderId,
                                 @RequestBody @Valid PayRequest request) {
        return R.ok(orderService.payOrder(orderId, request));
    }
}
```

---

## 缓存策略设计

### 接口缓存

```java
@RestController
@RequestMapping("/api/config")
public class ConfigController {

    /**
     * 获取系统配置 - 使用缓存
     */
    @GetMapping("/{key}")
    @Cacheable(cacheNames = "sys:config", key = "#key")
    public R<ConfigVo> getConfig(@PathVariable String key) {
        return R.ok(configService.getByKey(key));
    }

    /**
     * 更新系统配置 - 清除缓存
     */
    @PutMapping("/{key}")
    @CacheEvict(cacheNames = "sys:config", key = "#key")
    public R<ConfigVo> updateConfig(@PathVariable String key,
                                    @RequestBody @Valid UpdateConfigRequest request) {
        return R.ok(configService.updateByKey(key, request));
    }
}
```

### 响应头缓存控制

```java
@RestController
@RequestMapping("/api/static")
public class StaticResourceController {

    /**
     * 获取静态资源 - 设置缓存头
     */
    @GetMapping("/image/{id}")
    public ResponseEntity<Resource> getImage(@PathVariable Long id) {
        Resource resource = resourceService.getImage(id);

        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS))
            .eTag(resourceService.getImageETag(id))
            .body(resource);
    }

    /**
     * 获取动态数据 - 禁止缓存
     */
    @GetMapping("/realtime/{id}")
    public ResponseEntity<RealtimeData> getRealtimeData(@PathVariable Long id) {
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noCache())
            .body(dataService.getRealtimeData(id));
    }
}
```

---

## 限流设计

### 接口限流注解

```java
/**
 * 限流注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimiter {
    /** 限流键 */
    String key() default "";

    /** 限流时间窗口（秒） */
    int time() default 60;

    /** 限流次数 */
    int count() default 100;

    /** 限流类型 */
    LimitType limitType() default LimitType.DEFAULT;

    /** 提示消息 */
    String message() default "访问过于频繁，请稍后重试";
}

public enum LimitType {
    /** 默认按IP限流 */
    DEFAULT,
    /** 按用户ID限流 */
    USER,
    /** 全局限流 */
    GLOBAL
}

// 使用示例
@RestController
@RequestMapping("/api/sms")
public class SmsController {

    /**
     * 发送验证码 - IP限流
     */
    @PostMapping("/code")
    @RateLimiter(key = "sms:code", time = 60, count = 3, message = "验证码发送过于频繁")
    public R<Void> sendCode(@RequestBody @Valid SendCodeRequest request) {
        smsService.sendCode(request.getPhone());
        return R.ok();
    }
}
```

### 全局限流配置

```java
@Configuration
public class RateLimiterConfig {

    /**
     * IP限流器
     */
    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .limitForPeriod(100)
            .timeoutDuration(Duration.ofMillis(500))
            .build();

        return RateLimiterRegistry.of(config);
    }
}

// 限流拦截器
@Component
@RequiredArgsConstructor
public class RateLimiterInterceptor implements HandlerInterceptor {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                            Object handler) throws Exception {

        if (handler instanceof HandlerMethod handlerMethod) {
            RateLimiter rateLimiter = handlerMethod.getMethodAnnotation(RateLimiter.class);
            if (rateLimiter != null) {
                String key = buildKey(rateLimiter, request);
                if (!tryAcquire(key, rateLimiter.time(), rateLimiter.count())) {
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write(
                        JsonUtils.toJsonString(R.fail(429, rateLimiter.message()))
                    );
                    return false;
                }
            }
        }
        return true;
    }

    private boolean tryAcquire(String key, int time, int count) {
        String luaScript = """
            local current = redis.call('incr', KEYS[1])
            if current == 1 then
                redis.call('expire', KEYS[1], ARGV[1])
            end
            return current
            """;

        Long current = redisTemplate.execute(
            new DefaultRedisScript<>(luaScript, Long.class),
            List.of(key), time
        );

        return current != null && current <= count;
    }
}
```

---

## 日志规范

### 请求日志记录

```java
/**
 * API日志注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiLog {
    /** 操作描述 */
    String value() default "";

    /** 业务类型 */
    BusinessType businessType() default BusinessType.OTHER;

    /** 是否保存请求参数 */
    boolean isSaveRequestData() default true;

    /** 是否保存响应数据 */
    boolean isSaveResponseData() default true;
}

// 日志切面
@Slf4j
@Aspect
@Component
public class ApiLogAspect {

    @Around("@annotation(apiLog)")
    public Object around(ProceedingJoinPoint point, ApiLog apiLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        String traceId = MDC.get("traceId");

        // 获取请求信息
        HttpServletRequest request = getRequest();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String ip = ServletUtils.getClientIP(request);

        // 记录请求日志
        log.info("[{}] {} {} - IP: {} - 开始处理", traceId, method, uri, ip);

        Object result;
        try {
            result = point.proceed();

            long costTime = System.currentTimeMillis() - startTime;
            log.info("[{}] {} {} - 处理完成 - 耗时: {}ms", traceId, method, uri, costTime);

        } catch (Exception e) {
            long costTime = System.currentTimeMillis() - startTime;
            log.error("[{}] {} {} - 处理失败 - 耗时: {}ms - 异常: {}",
                traceId, method, uri, costTime, e.getMessage());
            throw e;
        }

        return result;
    }
}
```

### 审计日志

```java
/**
 * 操作日志记录
 */
@Data
public class OperLog {
    private Long id;
    private String title;
    private String businessType;
    private String method;
    private String requestMethod;
    private String operatorType;
    private String operName;
    private String operUrl;
    private String operIp;
    private String operParam;
    private String jsonResult;
    private Integer status;
    private String errorMsg;
    private Date operTime;
    private Long costTime;
}

// 保存操作日志
@Service
@RequiredArgsConstructor
public class OperLogServiceImpl implements IOperLogService {

    private final IOperLogDao operLogDao;

    @Async
    @Override
    public void recordOperLog(OperLog operLog) {
        operLogDao.insert(operLog);
    }
}
```

---

## 常见问题与解决方案

### 1. 大数据量分页查询

**问题**: 深度分页性能差

```java
// ❌ 不好的做法 - 深度分页
@GetMapping("/users")
public R<PageResult<UserVo>> getUsers(
    @RequestParam(defaultValue = "1") Integer page,
    @RequestParam(defaultValue = "10") Integer size) {

    // 当 page 很大时，SQL: LIMIT 1000000, 10 性能很差
    return R.ok(userService.page(page, size));
}

// ✅ 好的做法 - 游标分页
@GetMapping("/users")
public R<CursorPageResult<UserVo>> getUsers(
    @RequestParam(required = false) Long cursor,
    @RequestParam(defaultValue = "10") Integer size) {

    // SQL: WHERE id > cursor ORDER BY id LIMIT 10
    return R.ok(userService.cursorPage(cursor, size));
}

@Data
public class CursorPageResult<T> {
    private List<T> records;
    private Long nextCursor;
    private Boolean hasMore;
}
```

### 2. 大文件上传

```java
/**
 * 分片上传
 */
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    /**
     * 初始化分片上传
     */
    @PostMapping("/init")
    public R<InitUploadResult> initUpload(@RequestBody InitUploadRequest request) {
        return R.ok(uploadService.initUpload(request));
    }

    /**
     * 上传分片
     */
    @PostMapping("/chunk")
    public R<Void> uploadChunk(
        @RequestParam String uploadId,
        @RequestParam Integer chunkIndex,
        @RequestParam MultipartFile file) {

        uploadService.uploadChunk(uploadId, chunkIndex, file);
        return R.ok();
    }

    /**
     * 合并分片
     */
    @PostMapping("/merge")
    public R<FileInfo> mergeChunks(@RequestBody MergeRequest request) {
        return R.ok(uploadService.mergeChunks(request));
    }
}
```

### 3. 长时间操作

```java
/**
 * 异步任务处理
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    /**
     * 提交异步任务
     */
    @PostMapping
    public R<TaskInfo> submitTask(@RequestBody TaskRequest request) {
        String taskId = taskService.submitTask(request);
        return R.ok(TaskInfo.builder()
            .taskId(taskId)
            .status("PENDING")
            .checkUrl("/api/tasks/" + taskId)
            .build());
    }

    /**
     * 查询任务状态
     */
    @GetMapping("/{taskId}")
    public R<TaskInfo> getTaskStatus(@PathVariable String taskId) {
        return R.ok(taskService.getTaskStatus(taskId));
    }

    /**
     * 获取任务结果
     */
    @GetMapping("/{taskId}/result")
    public R<Object> getTaskResult(@PathVariable String taskId) {
        return R.ok(taskService.getTaskResult(taskId));
    }
}

@Data
@Builder
public class TaskInfo {
    private String taskId;
    private String status; // PENDING, RUNNING, SUCCESS, FAILED
    private Integer progress;
    private String message;
    private String checkUrl;
    private Object result;
}
```

### 4. 跨域处理

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}

// 或使用注解
@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/users")
public class UserController {
    // ...
}
```

---

## API 设计检查清单

开发 API 接口时，请确认以下事项：

### 设计规范
- [ ] <Ok/> 使用 RESTful 风格设计
- [ ] <Ok/> 使用正确的 HTTP 方法
- [ ] <Ok/> 资源命名使用复数形式
- [ ] <Ok/> URL 使用小写和连字符

### 请求处理
- [ ] <Ok/> 添加参数校验注解
- [ ] <Ok/> 使用 BO 对象接收参数
- [ ] <Ok/> 处理空值和边界情况

### 响应格式
- [ ] <Ok/> 使用统一的响应格式
- [ ] <Ok/> 返回合适的状态码
- [ ] <Ok/> 使用 VO 对象返回数据

### 安全性
- [ ] <Ok/> 添加权限注解
- [ ] <Ok/> 敏感数据脱敏
- [ ] <Ok/> 防止 SQL 注入和 XSS

### 性能
- [ ] <Ok/> 合理使用缓存
- [ ] <Ok/> 批量操作有数量限制
- [ ] <Ok/> 分页查询有合理默认值

### 文档
- [ ] <Ok/> 添加 OpenAPI 注解
- [ ] <Ok/> 参数和响应有清晰描述
- [ ] <Ok/> 示例数据完整

---

## 总结

**API 设计核心原则**:

1. **RESTful 风格** - 使用标准 HTTP 方法和资源命名
2. **统一响应格式** - 所有接口返回格式一致
3. **完善的错误处理** - 提供清晰的错误信息
4. **安全第一** - 参数校验、权限控制、数据脱敏
5. **性能优化** - 缓存、限流、分页优化
6. **良好的文档** - 使用 OpenAPI 规范

遵循这些规范，可以设计出一致、安全、高性能的 API 接口，为前端开发和第三方集成提供良好的开发体验。