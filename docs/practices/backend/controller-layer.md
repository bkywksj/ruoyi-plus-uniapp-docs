# Controller 层最佳实践

本文档详细介绍 RuoYi-Plus-UniApp 项目中 Controller 层的设计原则和最佳实践，基于项目实际源码总结。

## 介绍

Controller 层是 MVC 架构中的表现层，负责接收 HTTP 请求、调用业务逻辑、返回响应结果。在 RuoYi-Plus 框架中，Controller 层采用 RESTful 风格设计，结合 Spring MVC、Sa-Token、Bean Validation 等技术，实现了统一的请求处理规范。

**核心特性：**

- **统一注解配置** - 使用 `@Validated`、`@RequiredArgsConstructor`、`@RestController` 标准配置
- **权限控制** - 集成 Sa-Token 实现细粒度的权限检查
- **参数校验** - 支持 Bean Validation 注解和分组校验
- **操作日志** - 使用 `@Log` 注解自动记录操作日志
- **防重复提交** - 使用 `@RepeatSubmit` 防止重复请求
- **统一响应** - 使用 `R<T>` 封装统一的响应格式
- **国际化支持** - 使用 `I18nKeys` 常量支持多语言

---

## 核心设计原则

### 1. Controller 职责

Controller 层作为请求入口，主要职责包括：

- **请求接收** - 接收 HTTP 请求并解析参数
- **参数校验** - 使用注解进行参数验证
- **权限控制** - 使用 Sa-Token 进行权限检查
- **调用 Service** - 调用 Service 层处理业务逻辑
- **返回结果** - 统一封装返回结果

**关键原则**：Controller 层只做调度，不写业务逻辑。

### 2. 单一职责原则

每个 Controller 只负责一个功能模块：

```java
// ✅ 正确 - 单一职责
@RestController
@RequestMapping("/system/user")
public class SysUserController { /* 只处理用户相关请求 */ }

@RestController
@RequestMapping("/system/role")
public class SysRoleController { /* 只处理角色相关请求 */ }

// ❌ 错误 - 职责混乱
@RestController
@RequestMapping("/system")
public class SystemController {
    // 混合了用户、角色、部门等多个模块的处理
}
```

### 3. 薄 Controller 原则

Controller 层应该保持"薄"，将业务逻辑下沉到 Service 层：

```java
// ✅ 正确 - 薄 Controller
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    return R.ok(userService.insertUser(bo));
}

// ❌ 错误 - 胖 Controller（业务逻辑不应该在 Controller 中）
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    // 大量业务逻辑...
    if (checkUserNameExists(bo.getUserName())) {
        return R.fail("用户名已存在");
    }
    bo.setPassword(encryptPassword(bo.getPassword()));
    bo.setCreateTime(new Date());
    Long userId = userMapper.insert(bo);
    insertUserRoles(userId, bo.getRoleIds());
    insertUserPosts(userId, bo.getPostIds());
    return R.ok(userId);
}
```

---

## Controller 类设计

### 标准 Controller 定义

```java
@Validated                          // ✅ 启用参数校验
@RequiredArgsConstructor            // ✅ 构造函数注入
@RestController                     // ✅ RESTful API
@RequestMapping("/system/user")     // ✅ 统一请求前缀
public class SysUserController {

    /* 业务服务 */
    private final ISysUserService userService;      // ✅ 只注入 Service 接口
    private final ISysRoleService roleService;
    private final ISysPostService postService;
    private final ISysDeptService deptService;

    // 方法实现...
}
```

**设计要点：**

- <Ok/> 使用 `@Validated` 启用类级别参数校验
- <Ok/> 使用 `@RequiredArgsConstructor` 进行依赖注入
- <Ok/> 使用 `@RestController` 自动序列化 JSON
- <Ok/> 只注入 Service 层接口
- <No/> 不注入 DAO 或 Mapper
- <No/> 不注入其他 Controller

### 依赖注入规范

```java
// ✅ 推荐 - 构造函数注入
@RequiredArgsConstructor
@RestController
public class SysUserController {
    private final ISysUserService userService;
    private final ISysRoleService roleService;
}

// ❌ 不推荐 - 字段注入
@RestController
public class SysUserController {
    @Autowired
    private ISysUserService userService;
    @Autowired
    private ISysRoleService roleService;
}
```

**构造函数注入的优势：**

1. 依赖明确，便于单元测试
2. 避免循环依赖
3. 符合不可变性原则
4. IDE 自动检测未注入的依赖

---

## 标准 CRUD 接口

### 1. 分页查询

```java
/**
 * 查询用户列表
 */
@SaCheckPermission(value = {"system:user:query", "system:notice:add", "system:notice:update"}, mode = SaMode.OR)
@GetMapping("/pageUsers")
public R<PageResult<SysUserVo>> pageUsers(SysUserBo user, PageQuery pageQuery) {
    return R.ok(userService.pageUsers(user, pageQuery));
}
```

**实现要点：**

- <Ok/> 使用 `@GetMapping` 进行查询操作
- <Ok/> 添加 `@SaCheckPermission` 权限控制
- <Ok/> 支持多权限 OR 模式（`mode = SaMode.OR`）
- <Ok/> 使用 `R.ok()` 封装成功结果
- <Ok/> 参数使用 Bo 和 PageQuery 对象
- <Ok/> 返回 `PageResult<Vo>` 分页结果

### 2. 单条查询

```java
/**
 * 根据用户编号获取详细信息
 *
 * @param userId 用户ID
 */
@SaCheckPermission("system:user:query")
@GetMapping(value = {"/getUser/", "/getUser/{userId}"})
public R<SysUserInfoVo> getUser(@PathVariable(value = "userId", required = false) Long userId) {
    SysUserInfoVo userInfoVo = new SysUserInfoVo();
    if (ObjectUtil.isNotNull(userId)) {
        userService.checkUserDataScope(userId);
        SysUserVo sysUser = userService.getUserWithRolesById(userId);
        userInfoVo.setUser(sysUser);
        userInfoVo.setRoleIds(roleService.listRoleIdsByUserId(userId));
        // ... 更多数据组装
    }
    // 查询角色列表供选择
    SysRoleBo roleBo = new SysRoleBo();
    roleBo.setStatus(DictEnableStatus.ENABLE.getValue());
    List<SysRoleVo> roles = roleService.list(roleBo);
    userInfoVo.setRoles(roles);
    return R.ok(userInfoVo);
}
```

**实现要点：**

- <Ok/> 支持多路径映射（新增时无 ID，编辑时有 ID）
- <Ok/> 使用 `@PathVariable(required = false)` 可选路径参数
- <Ok/> 执行数据权限检查（`checkUserDataScope`）
- <Ok/> 组装关联数据返回

### 3. 新增

```java
/**
 * 新增用户
 */
@SaCheckPermission("system:user:add")
@Log(title = "用户管理", operType = DictOperType.INSERT)
@RepeatSubmit()
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    // 数据权限检查
    deptService.checkDeptDataScope(bo.getDeptId());

    // 唯一性校验
    if (!userService.isUserNameUnique(bo.getUserName(), bo.getUserId())) {
        return R.fail("新增用户'" + bo.getUserName() + "'失败，登录账号已存在");
    } else if (StringUtils.isNotEmpty(bo.getPhone()) && !userService.isPhoneUnique(bo.getPhone(), bo.getUserId())) {
        return R.fail("新增用户'" + bo.getUserName() + "'失败，手机号码已存在");
    } else if (StringUtils.isNotEmpty(bo.getEmail()) && !userService.isEmailUnique(bo.getEmail(), bo.getUserId())) {
        return R.fail("新增用户'" + bo.getUserName() + "'失败，邮箱账号已存在");
    }

    // 租户用户名额检查
    if (TenantHelper.isEnable()) {
        if (!tenantService.checkAccountBalance(TenantHelper.getTenantId())) {
            return R.fail("当前租户下用户名额不足，请联系管理员");
        }
    }

    // 密码加密
    bo.setPassword(BCrypt.hashpw(bo.getPassword()));
    return R.ok(userService.insertUser(bo));
}
```

**实现要点：**

- <Ok/> 使用 `@PostMapping` 进行新增操作
- <Ok/> 添加 `@Log` 记录操作日志
- <Ok/> 添加 `@RepeatSubmit` 防重复提交
- <Ok/> 使用 `@Validated` 触发参数校验
- <Ok/> 执行数据权限检查
- <Ok/> 执行唯一性校验
- <Ok/> 密码加密处理
- <Ok/> 返回新增记录的 ID

### 4. 修改

```java
/**
 * 修改用户
 */
@SaCheckPermission("system:user:update")
@Log(title = "用户管理", operType = DictOperType.UPDATE)
@RepeatSubmit()
@PutMapping("/updateUser")
public R<Void> updateUser(@Validated @RequestBody SysUserBo bo) {
    // 操作权限检查（不允许修改超级管理员）
    userService.checkUserAllowed(bo.getUserId());
    // 数据权限检查
    userService.checkUserDataScope(bo.getUserId());
    deptService.checkDeptDataScope(bo.getDeptId());

    // 唯一性校验
    if (!userService.isUserNameUnique(bo.getUserName(), bo.getUserId())) {
        return R.fail("修改用户'" + bo.getUserName() + "'失败，登录账号已存在");
    } else if (StringUtils.isNotEmpty(bo.getPhone()) && !userService.isPhoneUnique(bo.getPhone(), bo.getUserId())) {
        return R.fail("修改用户'" + bo.getUserName() + "'失败，手机号码已存在");
    } else if (StringUtils.isNotEmpty(bo.getEmail()) && !userService.isEmailUnique(bo.getEmail(), bo.getUserId())) {
        return R.fail("修改用户'" + bo.getUserName() + "'失败，邮箱账号已存在");
    }

    userService.updateUser(bo);
    return R.ok();
}
```

**实现要点：**

- <Ok/> 使用 `@PutMapping` 进行修改操作
- <Ok/> 先检查操作权限（`checkUserAllowed`）
- <Ok/> 再检查数据权限（`checkUserDataScope`）
- <Ok/> 返回类型为 `R<Void>`

### 5. 删除

```java
/**
 * 删除用户
 *
 * @param userIds 用户ID串
 */
@SaCheckPermission("system:user:delete")
@Log(title = "用户管理", operType = DictOperType.DELETE)
@DeleteMapping("/deleteUsers/{userIds}")
public R<Void> deleteUsers(@NotEmpty(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long[] userIds) {
    // 不允许删除当前登录用户
    if (ArrayUtil.contains(userIds, LoginHelper.getUserId())) {
        return R.fail("当前用户不能删除");
    }
    return R.status(userService.deleteUserByIds(userIds));
}
```

**实现要点：**

- <Ok/> 使用 `@DeleteMapping` 进行删除操作
- <Ok/> 使用 `@NotEmpty` 校验 ID 数组不为空
- <Ok/> 使用 `I18nKeys` 支持国际化错误信息
- <Ok/> 支持批量删除
- <Ok/> 防止删除当前登录用户

---

## 高级功能接口

### 1. 数据导出

```java
/**
 * 导出用户列表
 */
@Log(title = "用户管理", operType = DictOperType.EXPORT)
@SaCheckPermission("system:user:export")
@PostMapping("/exportUsers")
public void exportUsers(SysUserBo user, PageQuery pageQuery, HttpServletResponse response) {
    PageResult<SysUserExportVo> pageResult = userService.pageUserExports(user, pageQuery);
    ExcelUtil.exportExcel(pageResult.getRecords(), "用户数据", SysUserExportVo.class, response);
}
```

**实现要点：**

- <Ok/> 返回类型为 `void`，直接写入 response
- <Ok/> 使用 `ExcelUtil.exportExcel()` 导出 Excel
- <Ok/> 使用专门的导出 Vo（`SysUserExportVo`）
- <Ok/> 第二个参数是工作表名称

### 2. 导出模板

```java
/**
 * 获取导入模板
 */
@PostMapping("/templateUsers")
public void templateUsers(HttpServletResponse response) {
    ExcelUtil.exportExcel(new ArrayList<>(), "用户数据模板", SysUserImportVo.class, response);
}
```

**实现要点：**

- <Ok/> 传入空列表导出模板
- <Ok/> 模板名称使用"xxx模板"格式
- <Ok/> 使用导入 Vo 类（包含导入提示注解）

### 3. 数据导入

```java
/**
 * 导入数据
 *
 * @param file 导入文件
 */
@Log(title = "用户管理", operType = DictOperType.IMPORT)
@SaCheckPermission("system:user:import")
@PostMapping(value = "/importUsers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public R<Void> importUsers(@RequestPart("file") MultipartFile file) throws Exception {
    ExcelResult<SysUserImportVo> result = ExcelUtil.importExcel(
        file.getInputStream(),
        SysUserImportVo.class,
        new SysUserImportListener()
    );
    return R.ok(result.getAnalysis());
}
```

**实现要点：**

- <Ok/> 使用 `consumes = MediaType.MULTIPART_FORM_DATA_VALUE` 接收文件
- <Ok/> 使用 `@RequestPart` 接收文件参数
- <Ok/> 使用自定义 Listener 处理导入逻辑
- <Ok/> 返回导入分析结果

### 4. 状态变更

```java
/**
 * 状态修改
 */
@SaCheckPermission("system:user:update")
@Log(title = "用户管理", operType = DictOperType.UPDATE)
@PutMapping("/changeUserStatus")
public R<Void> changeUserStatus(@RequestBody SysUserBo user) {
    userService.checkUserAllowed(user.getUserId());
    userService.checkUserDataScope(user.getUserId());
    userService.updateUserStatus(user.getUserId(), user.getStatus());
    return R.ok();
}
```

### 5. 密码重置

```java
/**
 * 重置密码
 */
@ApiEncrypt
@SaCheckPermission("system:user:resetPwd")
@Log(title = "用户管理", operType = DictOperType.UPDATE)
@PutMapping("/resetUserPwd")
public R<Void> resetUserPwd(@RequestBody SysUserBo user) {
    userService.checkUserAllowed(user.getUserId());
    userService.checkUserDataScope(user.getUserId());
    user.setPassword(BCrypt.hashpw(user.getPassword()));
    userService.resetUserPwd(user.getUserId(), user.getPassword());
    return R.ok();
}
```

**实现要点：**

- <Ok/> 使用 `@ApiEncrypt` 加密传输敏感数据
- <Ok/> 使用 BCrypt 加密密码

---

## 认证相关接口

### 1. 用户登录

```java
/**
 * 用户登录方法
 * 根据不同的认证类型调用相应的认证策略进行用户登录
 *
 * @param body 包含登录信息的JSON字符串
 * @return 返回登录结果，包括访问令牌等信息
 */
@SaIgnore
@ApiEncrypt
@PostMapping("/userLogin")
public R<AuthTokenVo> userLogin(@RequestBody String body) {
    // 解析JSON字符串为LoginBody对象
    LoginBody loginBody = JsonUtils.parseObject(body, LoginBody.class);
    // 验证LoginBody对象的必填字段
    ValidatorUtils.validate(loginBody);
    // 检查租户是否有效
    loginService.checkTenant(TenantHelper.getTenantId());
    // 根据认证类型选择对应的认证策略进行登录
    return R.ok(IAuthStrategy.login(body, loginBody.getAuthType()));
}
```

**实现要点：**

- <Ok/> 使用 `@SaIgnore` 跳过认证检查（登录接口不需要登录）
- <Ok/> 使用 `@ApiEncrypt` 加密传输
- <Ok/> 接收 String 类型参数，手动解析 JSON
- <Ok/> 使用 `ValidatorUtils.validate()` 手动触发校验
- <Ok/> 支持策略模式处理不同登录类型

### 2. 用户退出

```java
/**
 * 用户退出登录
 */
@SaIgnore
@PostMapping("/userLogout")
public R<Void> userLogout() {
    loginService.logout();
    return R.ok(I18nKeys.User.LOGOUT_SUCCESS);
}
```

### 3. 用户注册

```java
/**
 * 用户注册
 */
@SaIgnore
@ApiEncrypt
@PostMapping("/userRegister")
public R<Void> userRegister(@Validated @RequestBody RegisterBody user) {
    // 检查是否有邀请码
    boolean hasInviteCode = StringUtils.isNotBlank(user.getInviteCode());

    // 如果没有邀请码，检查系统是否开启公开注册功能
    if (!hasInviteCode && !configService.getRegisterEnabled(TenantHelper.getTenantId())) {
        return R.fail("当前系统未开放公开注册，请使用邀请码注册！");
    }

    registerService.registerPcUser(user);
    return R.ok();
}
```

### 4. 获取当前用户信息

```java
/**
 * 获取用户信息
 *
 * @return 用户信息
 */
@GetMapping("/getUserInfo")
public R<UserInfoVo> getUserInfo() {
    UserInfoVo userInfoVo = new UserInfoVo();
    LoginUser loginUser = LoginHelper.getLoginUser();

    // 超级管理员特殊处理
    if (TenantHelper.isEnable() && LoginHelper.isSuperAdmin()) {
        TenantHelper.clearDynamic();
    }

    SysUserVo user = userService.getUserWithRolesById(loginUser.getUserId());
    if (ObjectUtil.isNull(user)) {
        return R.fail("没有权限访问用户数据!");
    }

    userInfoVo.setUser(user);
    userInfoVo.setPermissions(loginUser.getMenuPermission());
    userInfoVo.setRoles(loginUser.getRolePermission());
    return R.ok(userInfoVo);
}
```

---

## 参数校验

### 1. 路径参数校验

```java
// 单个 ID 参数
@GetMapping("/getRole/{roleId}")
public R<SysRoleVo> getRole(
    @NotNull(message = I18nKeys.Common.ID_REQUIRED)
    @PathVariable Long roleId
) {
    roleService.checkRoleDataScope(roleId);
    return R.ok(roleService.getRoleById(roleId));
}

// ID 数组参数
@DeleteMapping("/deleteRoles/{roleIds}")
public R<Void> deleteRoles(
    @NotEmpty(message = I18nKeys.Common.ID_REQUIRED)
    @PathVariable Long[] roleIds
) {
    return R.status(roleService.deleteRoleByIds(roleIds));
}
```

**校验注解：**

- <Ok/> `@NotNull` - 不能为 null
- <Ok/> `@NotEmpty` - 集合/数组不能为空
- <Ok/> 使用 `I18nKeys` 常量定义错误信息

### 2. 请求参数校验

```java
// 可选参数
@GetMapping("/getUserOptions")
public R<List<SysUserVo>> getUserOptions(
    @RequestParam(required = false) Long[] userIds,
    @RequestParam(required = false) Long deptId
) {
    return R.ok(userService.listUsersByIdsAndDeptId(
        ArrayUtil.isEmpty(userIds) ? null : List.of(userIds),
        deptId
    ));
}

// 必填参数
@GetMapping("/listUsersByDeptId/{deptId}")
public R<List<SysUserVo>> listUsersByDeptId(
    @NotNull(message = "部门id不为空")
    @PathVariable Long deptId
) {
    return R.ok(userService.listUsersByDeptId(deptId));
}
```

### 3. 请求体参数校验

```java
// 新增时的校验
@PostMapping("/addRole")
public R<Long> addRole(@Validated @RequestBody SysRoleBo bo) {
    // 业务校验
    roleService.checkRoleAllowed(bo);
    if (!roleService.checkRoleNameUnique(bo)) {
        return R.fail("新增角色'" + bo.getRoleName() + "'失败，角色名称已存在");
    } else if (!roleService.checkRoleKeyUnique(bo)) {
        return R.fail("新增角色'" + bo.getRoleName() + "'失败，角色权限已存在");
    }
    return R.ok(roleService.insertRole(bo));
}
```

### 4. 分组校验

```java
// 使用分组校验
@PostMapping("/addAd")
public R<Long> addAd(@Validated(AddGroup.class) @RequestBody AdBo bo) {
    return R.ok(adService.add(bo));
}

@PutMapping("/updateAd")
public R<Void> updateAd(@Validated(EditGroup.class) @RequestBody AdBo bo) {
    return R.status(adService.update(bo));
}
```

**Bo 对象定义：**

```java
@Data
public class AdBo extends BaseEntity {

    /**
     * 主键id
     */
    @NotNull(message = "主键id不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 广告名称
     */
    @NotBlank(message = "广告名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String adName;

    /**
     * 状态
     */
    private String status;
}
```

---

## 权限控制

### 1. 单一权限检查

```java
@SaCheckPermission("system:role:query")
@GetMapping("/pageRoles")
public R<PageResult<SysRoleVo>> pageRoles(SysRoleBo role, PageQuery pageQuery) {
    return R.ok(roleService.page(role, pageQuery));
}
```

### 2. 多权限 OR 模式

```java
// 满足任一权限即可
@SaCheckPermission(value = {"system:user:query", "system:notice:add", "system:notice:update"}, mode = SaMode.OR)
@GetMapping("/pageUsers")
public R<PageResult<SysUserVo>> pageUsers(SysUserBo user, PageQuery pageQuery) {
    return R.ok(userService.pageUsers(user, pageQuery));
}
```

### 3. 多权限 AND 模式

```java
// 必须同时满足所有权限
@SaCheckPermission(value = {"system:user:query", "system:user:export"}, mode = SaMode.AND)
@PostMapping("/exportSpecialUsers")
public void exportSpecialUsers(...) {
    // ...
}
```

### 4. 角色检查

```java
// 检查是否为超级管理员角色
@SaCheckRole(TenantConstants.SUPER_ADMIN_ROLE_KEY)
@GetMapping("/getTenantConfig")
public R<TenantConfigVo> getTenantConfig() {
    // ...
}
```

### 5. 跳过认证

```java
// 登录、注册等公开接口使用 @SaIgnore
@SaIgnore
@PostMapping("/userLogin")
public R<AuthTokenVo> userLogin(@RequestBody String body) {
    // ...
}
```

### 6. 数据权限检查

```java
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    // 检查部门数据权限
    deptService.checkDeptDataScope(bo.getDeptId());
    // ...
}

@PutMapping("/updateUser")
public R<Void> updateUser(@Validated @RequestBody SysUserBo bo) {
    // 检查用户数据权限
    userService.checkUserDataScope(bo.getUserId());
    // 检查部门数据权限
    deptService.checkDeptDataScope(bo.getDeptId());
    // ...
}
```

**权限字符串规范：**

- 格式：`模块:功能:操作`
- 示例：`system:user:query` 表示"系统模块-用户-查询"
- <Ok/> 每个接口都应该有权限控制
- <Ok/> 权限字符串要与前端菜单配置一致

---

## 操作日志

### 使用 @Log 注解

```java
@Log(title = "用户管理", operType = DictOperType.INSERT)
@PostMapping("/addUser")
public R<Long> addUser(...) { }

@Log(title = "用户管理", operType = DictOperType.UPDATE)
@PutMapping("/updateUser")
public R<Void> updateUser(...) { }

@Log(title = "用户管理", operType = DictOperType.DELETE)
@DeleteMapping("/deleteUsers/{userIds}")
public R<Void> deleteUsers(...) { }

@Log(title = "用户管理", operType = DictOperType.EXPORT)
@PostMapping("/exportUsers")
public void exportUsers(...) { }

@Log(title = "用户管理", operType = DictOperType.IMPORT)
@PostMapping("/importUsers")
public R<Void> importUsers(...) { }
```

**操作类型枚举：**

```java
public interface DictOperType {
    String INSERT = "INSERT";   // 新增
    String UPDATE = "UPDATE";   // 修改
    String DELETE = "DELETE";   // 删除
    String EXPORT = "EXPORT";   // 导出
    String IMPORT = "IMPORT";   // 导入
    String QUERY  = "QUERY";    // 查询
    String GRANT  = "GRANT";    // 授权
    String FORCE  = "FORCE";    // 强制操作
    String CLEAN  = "CLEAN";    // 清理
    String GENCODE = "GENCODE"; // 代码生成
}
```

**使用规范：**

- <Ok/> 所有写操作（增删改）必须添加日志
- <Ok/> 导入导出操作必须添加日志
- <No/> 普通查询操作不需要添加日志

---

## 防重复提交

### 使用 @RepeatSubmit 注解

```java
@RepeatSubmit()
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    return R.ok(userService.insertUser(bo));
}

@RepeatSubmit()
@PutMapping("/updateUser")
public R<Void> updateUser(@Validated @RequestBody SysUserBo bo) {
    return R.status(userService.updateUser(bo));
}
```

**使用场景：**

- <Ok/> 新增操作 - 防止重复创建
- <Ok/> 修改操作 - 防止重复更新
- <Ok/> 支付操作 - 防止重复支付
- <No/> 查询操作 - 不需要
- <No/> 删除操作 - 可选（通常幂等）

**注解参数：**

```java
@RepeatSubmit(
    interval = 5000,        // 间隔时间（毫秒），默认 5000
    message = "请勿重复提交"  // 提示消息
)
```

**原理：** 使用 Redis 存储请求标识，在指定时间内相同请求会被拒绝。

---

## 统一返回值

### R 工具类使用

```java
// 返回成功结果 - 带数据
R.ok(data)

// 返回成功结果 - 带消息
R.ok(I18nKeys.User.LOGOUT_SUCCESS)

// 返回成功结果 - 无数据
R.ok()

// 返回操作状态
R.status(boolean result)

// 返回失败结果
R.fail("错误信息")

// 返回失败结果 - 指定状态码
R.fail(500, "服务器错误")
```

### 返回类型规范

| 操作类型 | 返回类型 | 示例 |
|---------|---------|------|
| 分页查询 | `R<PageResult<Vo>>` | `R<PageResult<SysUserVo>>` |
| 列表查询 | `R<List<Vo>>` | `R<List<SysRoleVo>>` |
| 单条查询 | `R<Vo>` | `R<SysUserVo>` |
| 新增 | `R<Long>` | 返回新增记录的 ID |
| 修改 | `R<Void>` | 无返回数据 |
| 删除 | `R<Void>` | 无返回数据 |
| 文件导出 | `void` | 直接写入 response |

---

## API 加密

### 使用 @ApiEncrypt 注解

```java
@ApiEncrypt
@PostMapping("/userLogin")
public R<AuthTokenVo> userLogin(@RequestBody String body) {
    // 请求和响应数据会自动加解密
}

@ApiEncrypt
@PutMapping("/resetUserPwd")
public R<Void> resetUserPwd(@RequestBody SysUserBo user) {
    // 密码等敏感数据加密传输
}
```

**使用场景：**

- <Ok/> 登录接口（密码传输）
- <Ok/> 注册接口（密码传输）
- <Ok/> 密码重置（密码传输）
- <Ok/> 支付相关（敏感数据）

---

## 社交认证接口

### 1. 获取授权 URL

```java
/**
 * 获取社交认证跳转URL
 */
@SaIgnore
@GetMapping("/socialBindUrl/{source}")
public R<String> socialBindUrl(
    @NotBlank(message = "source不能为空") @PathVariable("source") String source,
    @RequestParam String domain,
    @RequestParam(required = false) String inviteCode
) {
    // 获取指定平台的配置信息
    SocialLoginConfigProperties obj = socialProperties.getType().get(source);
    if (ObjectUtil.isNull(obj)) {
        return R.fail(source + "平台账号暂不支持");
    }

    AuthRequest authRequest = SocialUtils.getAuthRequest(source, socialProperties);
    HashMap<String, String> map = MapUtil.newHashMap();
    map.put("tenantId", TenantHelper.getTenantId());
    map.put("domain", domain);
    map.put("state", AuthStateUtils.createState());
    if (StringUtils.isNotBlank(inviteCode)) {
        map.put("inviteCode", inviteCode);
    }

    String authorizeUrl = authRequest.authorize(
        Base64.encode(JsonUtils.toJsonString(map), StandardCharsets.UTF_8)
    );
    return R.ok("操作成功", authorizeUrl);
}
```

### 2. 绑定社交账号

```java
/**
 * 前端回调绑定授权
 */
@PostMapping("/socialBind")
public R<Void> socialBind(@RequestBody SocialLoginBody loginBody) {
    AuthResponse<AuthUser> response = SocialUtils.loginAuth(
        loginBody.getSource(),
        loginBody.getSocialCode(),
        loginBody.getSocialState(),
        socialProperties
    );

    if (!response.ok()) {
        return R.fail(response.getMsg());
    }

    loginService.bindSocialAccount(response.getData());
    return R.ok();
}
```

### 3. 解绑社交账号

```java
/**
 * 取消社交授权
 */
@DeleteMapping(value = "/socialUnbind/{socialId}")
public R<Void> socialUnbind(
    @NotNull(message = "社交绑定id不能为空")
    @PathVariable Long socialId
) {
    boolean rows = socialUserService.batchDelete(List.of(socialId));
    return rows ? R.ok() : R.fail("取消授权失败");
}
```

---

## 异常处理

### 统一异常处理机制

Controller 层不需要 try-catch，异常会被全局异常处理器捕获：

```java
// ✅ 正确 - 让异常向上抛出
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    return R.ok(userService.insertUser(bo));
}

// ❌ 错误 - 不要在 Controller 层捕获异常
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    try {
        return R.ok(userService.insertUser(bo));
    } catch (Exception e) {
        return R.fail(e.getMessage());
    }
}
```

### 业务校验返回错误

```java
// 使用 R.fail() 返回业务错误
@PostMapping("/addRole")
public R<Long> addRole(@Validated @RequestBody SysRoleBo bo) {
    if (!roleService.checkRoleNameUnique(bo)) {
        return R.fail("新增角色'" + bo.getRoleName() + "'失败，角色名称已存在");
    }
    return R.ok(roleService.insertRole(bo));
}
```

**异常处理原则：**

- <Ok/> Service 层抛出 `ServiceException`
- <Ok/> Controller 层不捕获异常
- <Ok/> 全局异常处理器统一处理
- <Ok/> 业务校验失败使用 `R.fail()` 返回

---

## 最佳实践

### 1. 接口命名规范

```java
// ✅ 推荐的命名方式
@GetMapping("/pageUsers")           // 分页查询
@GetMapping("/listUsers")           // 列表查询
@GetMapping("/getUser/{id}")        // 单条查询
@PostMapping("/addUser")            // 新增
@PutMapping("/updateUser")          // 修改
@DeleteMapping("/deleteUsers/{ids}")// 删除
@PostMapping("/exportUsers")        // 导出
@PostMapping("/importUsers")        // 导入
@PutMapping("/changeUserStatus")    // 状态变更

// ❌ 不推荐的命名
@GetMapping("/query")               // 太简单，语义不明
@PostMapping("/save")               // 新增和修改混用
@GetMapping("/getUserList")         // 冗余，list 和 page 混淆
```

### 2. 方法排序规范

```java
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    // 1. 查询类方法
    @GetMapping("/pageUsers")
    public R<PageResult<SysUserVo>> pageUsers(...) { }

    @GetMapping("/getUser/{userId}")
    public R<SysUserVo> getUser(...) { }

    @GetMapping("/listUsers")
    public R<List<SysUserVo>> listUsers(...) { }

    // 2. 新增方法
    @PostMapping("/addUser")
    public R<Long> addUser(...) { }

    // 3. 修改方法
    @PutMapping("/updateUser")
    public R<Void> updateUser(...) { }

    @PutMapping("/changeUserStatus")
    public R<Void> changeUserStatus(...) { }

    // 4. 删除方法
    @DeleteMapping("/deleteUsers/{userIds}")
    public R<Void> deleteUsers(...) { }

    // 5. 导入导出方法
    @PostMapping("/exportUsers")
    public void exportUsers(...) { }

    @PostMapping("/importUsers")
    public R<Void> importUsers(...) { }
}
```

### 3. 注释规范

```java
/**
 * 根据用户编号获取详细信息
 *
 * @param userId 用户ID（必填）
 * @return 用户详细信息，包含角色、岗位等关联数据
 */
@SaCheckPermission("system:user:query")
@GetMapping("/getUser/{userId}")
public R<SysUserInfoVo> getUser(
    @NotNull(message = I18nKeys.Common.ID_REQUIRED)
    @PathVariable Long userId
) {
    // ...
}
```

### 4. 避免 N+1 查询

```java
// ✅ 正确 - Service 层一次性查询关联数据
@GetMapping("/getUser/{userId}")
public R<SysUserInfoVo> getUser(@PathVariable Long userId) {
    return R.ok(userService.getUserWithDetails(userId));
}

// ❌ 错误 - Controller 层多次调用
@GetMapping("/getUser/{userId}")
public R<SysUserInfoVo> getUser(@PathVariable Long userId) {
    SysUserVo user = userService.getUserById(userId);
    List<SysRoleVo> roles = roleService.listRolesByUserId(userId);
    List<SysPostVo> posts = postService.listPostsByUserId(userId);
    // ... 组装数据
}
```

### 5. 敏感数据处理

```java
// 密码不返回给前端
@GetMapping("/getUser/{userId}")
public R<SysUserVo> getUser(@PathVariable Long userId) {
    SysUserVo user = userService.getUserById(userId);
    user.setPassword(null);  // 清除密码
    return R.ok(user);
}

// 或在 Vo 中使用 @JsonIgnore
public class SysUserVo {
    @JsonIgnore
    private String password;
}
```

---

## 常见问题

### 1. 参数校验不生效

**问题原因：**
- 类上缺少 `@Validated` 注解
- 方法参数缺少 `@Valid` 或 `@Validated` 注解

**解决方案：**
```java
@Validated  // 类上必须添加
@RestController
public class UserController {

    @PostMapping("/add")
    public R<Long> add(
        @Validated @RequestBody UserBo bo  // 参数上添加
    ) {
        // ...
    }
}
```

### 2. 分组校验不生效

**问题原因：**
- 使用了 `@Valid` 而不是 `@Validated`

**解决方案：**
```java
// ✅ 正确 - 使用 @Validated 指定分组
@PostMapping("/add")
public R<Long> add(@Validated(AddGroup.class) @RequestBody UserBo bo) { }

// ❌ 错误 - @Valid 不支持分组
@PostMapping("/add")
public R<Long> add(@Valid @RequestBody UserBo bo) { }
```

### 3. 路径参数为 null

**问题原因：**
- `@PathVariable` 的 `required` 属性默认为 `true`

**解决方案：**
```java
// 支持可选路径参数
@GetMapping(value = {"/get/", "/get/{id}"})
public R<UserVo> get(
    @PathVariable(value = "id", required = false) Long id
) {
    // id 可能为 null
}
```

### 4. 文件上传失败

**问题原因：**
- 缺少 `consumes` 声明
- 参数注解使用错误

**解决方案：**
```java
@PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public R<Void> importData(@RequestPart("file") MultipartFile file) {
    // ...
}
```

### 5. 权限检查不生效

**问题原因：**
- 接口使用了 `@SaIgnore` 注解
- 权限字符串配置错误

**解决方案：**
```java
// 确保权限字符串与菜单配置一致
@SaCheckPermission("system:user:query")  // 要与数据库中的权限字符串一致
@GetMapping("/pageUsers")
public R<PageResult<SysUserVo>> pageUsers(...) { }
```

---

## 代码检查清单

开发 Controller 层代码时，请确认以下事项：

### 类级别

- [ ] 类上添加 `@Validated` 注解
- [ ] 类上添加 `@RequiredArgsConstructor` 注解
- [ ] 类上添加 `@RestController` 注解
- [ ] 类上添加 `@RequestMapping` 注解
- [ ] 只注入 Service 层接口，不注入 Mapper

### 方法级别

- [ ] 每个方法都有 `@SaCheckPermission` 权限控制
- [ ] 写操作添加 `@Log` 记录日志
- [ ] 新增/修改操作添加 `@RepeatSubmit` 防重复提交
- [ ] 敏感数据接口添加 `@ApiEncrypt` 加密传输
- [ ] 公开接口添加 `@SaIgnore` 跳过认证

### 参数级别

- [ ] 路径参数使用 `@PathVariable` 接收
- [ ] JSON 参数使用 `@RequestBody` 接收
- [ ] 查询参数使用 Bo 对象或 `@RequestParam` 接收
- [ ] 文件参数使用 `@RequestPart` 接收
- [ ] 参数使用合适的校验注解
- [ ] 新增/修改使用分组校验

### 业务规范

- [ ] 不在 Controller 层写业务逻辑
- [ ] 不捕获异常，让异常向上抛出
- [ ] 业务校验失败使用 `R.fail()` 返回
- [ ] 统一使用 `R<T>` 封装返回值
- [ ] 执行数据权限检查

---

## 总结

**Controller 层核心原则：**

1. **职责清晰** - 只做调度，不写业务逻辑
2. **权限控制** - 每个接口都要有权限检查
3. **参数校验** - 使用注解进行参数验证
4. **防重复提交** - 写操作使用 `@RepeatSubmit`
5. **操作日志** - 写操作使用 `@Log` 记录
6. **统一返回值** - 使用 `R<T>` 封装结果
7. **RESTful 规范** - 使用合适的 HTTP 方法
8. **异常处理** - 不捕获异常，让全局处理器统一处理
9. **数据安全** - 敏感数据加密传输，密码不返回

遵循这些原则，可以编写出清晰、规范、易维护的 Controller 层代码。
