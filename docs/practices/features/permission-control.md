# 权限控制最佳实践

## 介绍

RuoYi-Plus 框架基于 Sa-Token 实现了完善的权限控制体系,提供了细粒度的接口级权限管理、角色权限管理、菜单权限管理等功能。通过声明式的权限注解,可以轻松实现对 Controller 方法的访问控制。

**核心特性:**

- **接口级权限控制** - 使用 `@SaCheckPermission` 注解控制接口访问权限
- **角色级权限控制** - 使用 `@SaCheckRole` 注解控制角色访问权限
- **匿名访问支持** - 使用 `@SaIgnore` 注解跳过认证校验
- **灵活的权限组合** - 支持 AND/OR 逻辑组合多个权限条件
- **多用户体系支持** - 支持 PC、APP 等多种用户类型的权限隔离
- **多租户权限隔离** - 支持租户级别的权限数据隔离
- **动态权限加载** - 权限数据从数据库动态加载,支持实时更新

## 权限体系架构

### RBAC 权限模型

框架采用标准的 RBAC(Role-Based Access Control)权限模型:

```
用户(User) ←→ 角色(Role) ←→ 菜单/权限(Menu/Permission)
    │              │                    │
    │              │                    │
    ▼              ▼                    ▼
sys_user      sys_role           sys_menu
    │              │                    │
    │              │                    │
    ▼              ▼                    ▼
sys_user_role ────┘                    │
                                       │
sys_role_menu ─────────────────────────┘
```

**核心表结构:**

| 表名 | 说明 | 关联关系 |
|------|------|----------|
| `sys_user` | 用户表 | - |
| `sys_role` | 角色表 | - |
| `sys_menu` | 菜单权限表 | - |
| `sys_user_role` | 用户-角色关联表 | 多对多 |
| `sys_role_menu` | 角色-菜单关联表 | 多对多 |

### 权限数据流

```
1. 用户登录
   ↓
2. 查询用户角色(sys_user_role)
   ↓
3. 查询角色菜单权限(sys_role_menu → sys_menu)
   ↓
4. 权限标识存入 LoginUser.menuPermission
   ↓
5. 权限标识存入 Token Session
   ↓
6. 接口访问时,Sa-Token 校验权限
```

### 权限实现类

Sa-Token 权限管理实现类 `SaPermissionImpl`:

```java
package plus.ruoyi.common.satoken.core.service;

/**
 * Sa-Token权限管理实现类
 * 实现Sa-Token的StpInterface接口，提供权限和角色的查询功能
 * 支持两种查询模式：
 * 1. 当前登录用户权限查询：直接从LoginUser获取权限信息
 * 2. 跨用户权限查询：通过PermissionService查询其他用户权限
 */
public class SaPermissionImpl implements StpInterface {

    /**
     * 获取用户菜单权限列表
     */
    @Override
    public List<String> getPermissionList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();

        // 判断是否为跨用户权限查询
        if (ObjectUtil.isNull(loginUser) || !loginUser.getLoginId().equals(loginId)) {
            return getPermissionFromService(loginId);
        }

        // 当前用户权限查询
        return new ArrayList<>(loginUser.getMenuPermission());
    }

    /**
     * 获取用户角色权限列表
     */
    @Override
    public List<String> getRoleList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();

        // 判断是否为跨用户角色查询
        if (ObjectUtil.isNull(loginUser) || !loginUser.getLoginId().equals(loginId)) {
            return getRoleFromService(loginId);
        }

        // 当前用户角色查询
        return new ArrayList<>(loginUser.getRolePermission());
    }
}
```

**实现原理:**

- 用户登录时,权限信息存储在 `LoginUser` 对象中
- `LoginUser` 对象存储在 Sa-Token 的 Token Session 中
- 权限校验时,从 Session 中获取权限列表进行匹配
- 支持跨用户权限查询(A 用户查询 B 用户权限)

## 权限注解使用

### @SaCheckPermission 权限校验

`@SaCheckPermission` 用于校验用户是否拥有指定的权限标识:

```java
package plus.ruoyi.system.core.controller;

@Validated
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    private final ISysUserService userService;

    /**
     * 查询用户列表
     * 需要 system:user:query 权限
     */
    @SaCheckPermission("system:user:query")
    @GetMapping("/list")
    public R<TableDataInfo<SysUserVo>> list(SysUserBo bo, PageQuery pageQuery) {
        return R.ok(userService.listPage(bo, pageQuery));
    }

    /**
     * 新增用户
     * 需要 system:user:add 权限
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", operType = DictOperType.INSERT)
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody SysUserBo bo) {
        return R.status(userService.add(bo));
    }

    /**
     * 修改用户
     * 需要 system:user:edit 权限
     */
    @SaCheckPermission("system:user:edit")
    @Log(title = "用户管理", operType = DictOperType.UPDATE)
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody SysUserBo bo) {
        return R.status(userService.update(bo));
    }

    /**
     * 删除用户
     * 需要 system:user:delete 权限
     */
    @SaCheckPermission("system:user:delete")
    @Log(title = "用户管理", operType = DictOperType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        return R.status(userService.deleteByIds(userIds));
    }
}
```

**使用说明:**

- 权限标识格式: `模块:功能:操作`,如 `system:user:query`
- 注解可以放在方法上或类上
- 放在类上表示该类所有方法都需要该权限

### 多权限组合

**AND 模式(默认):**

```java
// 需要同时拥有两个权限
@SaCheckPermission({"system:user:query", "system:user:edit"})
@GetMapping("/detail")
public R<SysUserVo> detail(Long userId) {
    return R.ok(userService.getById(userId));
}
```

**OR 模式:**

```java
// 拥有任意一个权限即可
@SaCheckPermission(value = {"system:user:query", "system:user:edit"}, mode = SaMode.OR)
@GetMapping("/detail")
public R<SysUserVo> detail(Long userId) {
    return R.ok(userService.getById(userId));
}
```

**权限或角色组合:**

```java
// 拥有权限 或者 拥有指定角色都可以访问
@SaCheckPermission(value = "system:menu:query", orRole = TenantConstants.TENANT_ADMIN_ROLE_KEY)
@GetMapping("/listMenus")
public R<List<SysMenuVo>> listMenus(SysMenuBo menuBo) {
    List<SysMenuVo> menuVoList = menuService.listMenus(menuBo, LoginHelper.getUserId());
    return R.ok(menuVoList);
}
```

### @SaCheckRole 角色校验

`@SaCheckRole` 用于校验用户是否拥有指定的角色:

```java
package plus.ruoyi.system.core.controller;

@Validated
@RestController
@RequestMapping("/system/menu")
public class SysMenuController {

    private final ISysMenuService menuService;

    /**
     * 新增菜单
     * 仅超级管理员可操作
     */
    @SaCheckRole(TenantConstants.SUPER_ADMIN_ROLE_KEY)
    @SaCheckPermission("system:menu:add")
    @Log(title = "菜单管理", operType = DictOperType.INSERT)
    @PostMapping("/addMenu")
    public R<Long> addMenu(@Validated @RequestBody SysMenuBo menuBo) {
        return R.ok(menuService.insertMenu(menuBo));
    }

    /**
     * 修改菜单
     * 仅超级管理员可操作
     */
    @SaCheckRole(TenantConstants.SUPER_ADMIN_ROLE_KEY)
    @SaCheckPermission("system:menu:update")
    @Log(title = "菜单管理", operType = DictOperType.UPDATE)
    @PutMapping("/updateMenu")
    public R<Void> updateMenu(@Validated @RequestBody SysMenuBo menuBo) {
        return R.status(menuService.updateMenu(menuBo));
    }

    /**
     * 删除菜单
     * 仅超级管理员可操作
     */
    @SaCheckRole(TenantConstants.SUPER_ADMIN_ROLE_KEY)
    @SaCheckPermission("system:menu:delete")
    @Log(title = "菜单管理", operType = DictOperType.DELETE)
    @DeleteMapping("/deleteMenu/{menuId}")
    public R<Void> deleteMenu(@PathVariable("menuId") Long menuId) {
        return R.status(menuService.deleteMenuById(menuId));
    }
}
```

**多角色组合:**

```java
// AND 模式: 需要同时拥有两个角色
@SaCheckRole({"admin", "manager"})
@GetMapping("/admin")
public R<Void> admin() {
    return R.ok();
}

// OR 模式: 拥有任意一个角色即可
@SaCheckRole(value = {"admin", "manager"}, mode = SaMode.OR)
@GetMapping("/manager")
public R<Void> manager() {
    return R.ok();
}
```

### @SaIgnore 跳过认证

`@SaIgnore` 用于标记接口跳过 Sa-Token 认证:

```java
package plus.ruoyi.system.auth.controller;

@RestController
public class AuthController {

    private final IAuthService authService;

    /**
     * 登录接口
     * 跳过认证校验
     */
    @SaIgnore
    @PostMapping("/login")
    public R<LoginVo> login(@Validated @RequestBody PasswordLoginBody body) {
        return R.ok(authService.login(body));
    }

    /**
     * 获取验证码
     * 跳过认证校验
     */
    @SaIgnore
    @GetMapping("/captcha")
    public R<CaptchaVo> captcha() {
        return R.ok(authService.captcha());
    }

    /**
     * 退出登录
     * 跳过认证校验(已登录用户调用)
     */
    @SaIgnore
    @PostMapping("/logout")
    public R<Void> logout() {
        authService.logout();
        return R.ok();
    }
}
```

**使用场景:**

- 登录/注册接口
- 验证码接口
- 公开数据查询接口
- 第三方回调接口(如支付回调)
- 静态资源接口

### 注解组合使用

`@SaCheckPermission` 和 `@SaCheckRole` 可以组合使用:

```java
/**
 * 获取租户套餐菜单树
 * 需要超级管理员角色 且 需要菜单查询权限
 */
@SaCheckRole(TenantConstants.SUPER_ADMIN_ROLE_KEY)
@SaCheckPermission("system:menu:query")
@GetMapping(value = "/getTenantPackageMenuTree/{packageId}")
public R<MenuTreeSelectVo> getTenantPackageMenuTree(@PathVariable("packageId") Long packageId) {
    // 获取所有菜单列表
    List<SysMenuVo> menuVoList = menuService.listMenuByUserId(LoginHelper.getUserId());
    MenuTreeSelectVo selectVo = new MenuTreeSelectVo();
    selectVo.setCheckedKeys(menuService.listMenuIdsByPackageId(packageId));
    selectVo.setMenus(menuService.buildTenantPackageMenuTreeOptions(menuVoList));
    return R.ok(selectVo);
}
```

**组合逻辑:**

- 多个注解默认是 AND 关系
- 先校验角色,再校验权限
- 任一校验失败则拒绝访问

## LoginHelper 工具类

`LoginHelper` 提供了丰富的用户信息获取和权限判断方法:

### 基本用法

```java
// 获取当前登录用户信息
LoginUser loginUser = LoginHelper.getLoginUser();

// 获取用户ID
Long userId = LoginHelper.getUserId();

// 获取用户账号
String userName = LoginHelper.getUserName();

// 获取租户ID
String tenantId = LoginHelper.getTenantId();

// 获取部门ID
Long deptId = LoginHelper.getDeptId();

// 获取部门名称
String deptName = LoginHelper.getDeptName();

// 判断是否已登录
boolean isLogin = LoginHelper.isLogin();
```

### 权限判断

```java
// 判断是否为超级管理员
boolean isSuperAdmin = LoginHelper.isSuperAdmin();

// 判断指定用户是否为超级管理员
boolean isSuperAdmin = LoginHelper.isSuperAdmin(userId);

// 判断是否为租户管理员
boolean isTenantAdmin = LoginHelper.isTenantAdmin();

// 获取当前用户角色列表
Set<String> roleKeys = LoginHelper.getRoleKeys();

// 判断是否拥有指定角色
boolean hasRole = LoginHelper.hasRole("admin");

// 判断是否拥有任意一个指定角色
boolean hasAnyRole = LoginHelper.hasAnyRole("admin", "manager");
```

### 用户登录

```java
// 用户登录
LoginUser loginUser = buildLoginUser(user);
SaLoginParameter loginParameter = new SaLoginParameter()
    .setDevice(device)  // 设备类型
    .setTimeout(timeout);  // 超时时间

LoginHelper.login(loginUser, loginParameter);
```

### 微信用户信息

```java
// 获取微信应用ID
String appid = LoginHelper.getAppid();

// 获取微信UnionID
String unionid = LoginHelper.getUnionid();

// 获取微信OpenID
String openid = LoginHelper.getOpenid();
```

## 权限标识规范

### 命名规范

权限标识采用三段式命名: `模块:功能:操作`

```
system:user:query    # 系统模块-用户功能-查询操作
system:user:add      # 系统模块-用户功能-新增操作
system:user:edit     # 系统模块-用户功能-编辑操作
system:user:delete   # 系统模块-用户功能-删除操作
system:user:export   # 系统模块-用户功能-导出操作
system:user:import   # 系统模块-用户功能-导入操作
```

### 常用操作类型

| 操作 | 标识 | 说明 |
|------|------|------|
| 查询 | query | 列表查询、详情查询 |
| 新增 | add | 新增数据 |
| 编辑 | edit | 修改数据 |
| 删除 | delete | 删除数据 |
| 导出 | export | 导出数据 |
| 导入 | import | 导入数据 |
| 审核 | audit | 审核数据 |
| 发布 | publish | 发布数据 |

### 权限标识示例

**系统管理模块:**

```
system:user:query     # 用户查询
system:user:add       # 用户新增
system:user:edit      # 用户编辑
system:user:delete    # 用户删除
system:user:export    # 用户导出
system:user:import    # 用户导入
system:user:resetPwd  # 重置密码

system:role:query     # 角色查询
system:role:add       # 角色新增
system:role:edit      # 角色编辑
system:role:delete    # 角色删除

system:menu:query     # 菜单查询
system:menu:add       # 菜单新增
system:menu:update    # 菜单修改
system:menu:delete    # 菜单删除
```

**业务模块:**

```
mall:goods:query      # 商品查询
mall:goods:add        # 商品新增
mall:goods:edit       # 商品编辑
mall:goods:delete     # 商品删除
mall:goods:onShelf    # 商品上架
mall:goods:offShelf   # 商品下架

mall:order:query      # 订单查询
mall:order:add        # 订单新增
mall:order:edit       # 订单编辑
mall:order:delete     # 订单删除
mall:order:ship       # 订单发货
mall:order:refund     # 订单退款
```

## 菜单权限配置

### 菜单类型

| 类型 | 值 | 说明 |
|------|------|------|
| 目录 | M | 菜单目录,不对应页面 |
| 菜单 | C | 菜单项,对应页面 |
| 按钮 | F | 按钮/操作权限 |

### 菜单配置示例

**目录配置:**

```sql
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, icon)
VALUES ('系统管理', 0, 1, 'system', NULL, 'M', '0', '0', '', 'system');
```

**菜单配置:**

```sql
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, icon)
VALUES ('用户管理', 1, 1, 'user', 'system/user/index', 'C', '0', '0', 'system:user:query', 'user');
```

**按钮配置:**

```sql
-- 用户新增按钮
INSERT INTO sys_menu (menu_name, parent_id, order_num, menu_type, perms)
VALUES ('用户新增', 100, 1, 'F', 'system:user:add');

-- 用户修改按钮
INSERT INTO sys_menu (menu_name, parent_id, order_num, menu_type, perms)
VALUES ('用户修改', 100, 2, 'F', 'system:user:edit');

-- 用户删除按钮
INSERT INTO sys_menu (menu_name, parent_id, order_num, menu_type, perms)
VALUES ('用户删除', 100, 3, 'F', 'system:user:delete');
```

### 菜单字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| menu_name | 菜单名称 | 用户管理 |
| parent_id | 父菜单ID | 0(顶级) |
| order_num | 显示顺序 | 1 |
| path | 路由地址 | user |
| component | 组件路径 | system/user/index |
| menu_type | 菜单类型 | M/C/F |
| visible | 是否显示 | 0(显示)/1(隐藏) |
| status | 状态 | 0(正常)/1(停用) |
| perms | 权限标识 | system:user:query |
| icon | 菜单图标 | user |

## 角色权限配置

### 角色类型

| 角色 | 标识 | 说明 |
|------|------|------|
| 超级管理员 | superadmin | 拥有所有权限,不受权限控制 |
| 租户管理员 | tenantadmin | 租户内最高权限,可管理租户内用户 |
| 普通角色 | 自定义 | 按需分配权限 |

### 超级管理员判断

```java
/**
 * 判断是否为超级管理员
 * 超级管理员ID固定为1
 */
public static boolean isSuperAdmin(Long userId) {
    return SystemConstants.SUPER_ADMIN_ID.equals(userId);
}
```

### 租户管理员判断

```java
/**
 * 判断是否为租户管理员
 * 通过角色标识判断
 */
public static boolean isTenantAdmin(Set<String> rolePermission) {
    if (CollUtil.isEmpty(rolePermission)) {
        return false;
    }
    return rolePermission.contains(TenantConstants.TENANT_ADMIN_ROLE_KEY);
}
```

### 角色数据权限

角色可以配置数据权限范围:

| 数据范围 | 值 | 说明 |
|----------|------|------|
| 全部数据权限 | 1 | 可访问所有数据 |
| 自定义数据权限 | 2 | 按部门自定义 |
| 本部门数据权限 | 3 | 仅本部门数据 |
| 本部门及以下数据权限 | 4 | 本部门及子部门 |
| 仅本人数据权限 | 5 | 仅自己的数据 |

## 最佳实践

### 1. 权限粒度设计

**✅ 推荐:**

```java
// 细粒度权限设计,便于灵活分配
@SaCheckPermission("system:user:query")
@GetMapping("/list")
public R<List<SysUserVo>> list() { ... }

@SaCheckPermission("system:user:add")
@PostMapping
public R<Long> add() { ... }

@SaCheckPermission("system:user:edit")
@PutMapping
public R<Void> edit() { ... }

@SaCheckPermission("system:user:delete")
@DeleteMapping
public R<Void> delete() { ... }
```

**❌ 不推荐:**

```java
// 粗粒度权限,不够灵活
@SaCheckPermission("system:user")
@GetMapping("/list")
public R<List<SysUserVo>> list() { ... }

@SaCheckPermission("system:user")
@PostMapping
public R<Long> add() { ... }
```

### 2. 敏感操作多重校验

**✅ 推荐:**

```java
/**
 * 删除菜单
 * 需要超级管理员角色 + 菜单删除权限
 */
@SaCheckRole(TenantConstants.SUPER_ADMIN_ROLE_KEY)
@SaCheckPermission("system:menu:delete")
@Log(title = "菜单管理", operType = DictOperType.DELETE)
@DeleteMapping("/deleteMenu/{menuId}")
public R<Void> deleteMenu(@PathVariable("menuId") Long menuId) {
    // 业务层再次校验
    if (menuService.hasChildByMenuId(menuId)) {
        return R.warn("存在子菜单,不允许删除");
    }
    if (menuService.checkMenuExistRole(menuId)) {
        return R.warn("菜单已分配,不允许删除");
    }
    return R.status(menuService.deleteMenuById(menuId));
}
```

### 3. 合理使用 orRole 参数

**✅ 推荐:**

```java
/**
 * 查询菜单列表
 * 拥有权限 或者 拥有租户管理员角色 都可以访问
 */
@SaCheckPermission(value = "system:menu:query", orRole = TenantConstants.TENANT_ADMIN_ROLE_KEY)
@GetMapping("/listMenus")
public R<List<SysMenuVo>> listMenus(SysMenuBo menuBo) {
    return R.ok(menuService.listMenus(menuBo, LoginHelper.getUserId()));
}
```

**适用场景:**

- 租户管理员需要管理菜单,但不想给所有权限
- 某些功能对特定角色开放,不需要单独配置权限

### 4. Service 层权限补充

**✅ 推荐:**

```java
@Service
public class SysUserServiceImpl implements ISysUserService {

    @Override
    public int deleteByIds(Long[] userIds) {
        // 业务层权限校验
        for (Long userId : userIds) {
            // 不能删除超级管理员
            ServiceException.throwIf(LoginHelper.isSuperAdmin(userId),
                    "不允许操作超级管理员用户");

            // 不能删除当前用户
            ServiceException.throwIf(userId.equals(LoginHelper.getUserId()),
                    "当前用户不能删除");
        }
        return userMapper.deleteByIds(Arrays.asList(userIds));
    }

    @Override
    public boolean resetPassword(SysUserBo bo) {
        // 检查数据权限
        checkUserDataScope(bo.getUserId());
        // 执行重置密码
        return userMapper.updateById(user) > 0;
    }

    /**
     * 校验用户数据权限
     */
    private void checkUserDataScope(Long userId) {
        if (LoginHelper.isSuperAdmin()) {
            return;
        }
        // 查询当前用户可操作的用户范围
        List<Long> userIds = listUserIdsByDataScope();
        ServiceException.throwIf(!userIds.contains(userId),
                "没有权限访问用户数据");
    }
}
```

### 5. 接口匿名访问控制

**✅ 推荐:**

```java
/**
 * 支付回调接口
 * 必须使用 @SaIgnore,否则第三方无法调用
 */
@SaIgnore
@PostMapping("/notify/wechat")
public String wechatNotify(@RequestBody String body) {
    // 验证签名
    if (!verifySign(body)) {
        return "FAIL";
    }
    // 处理回调
    payService.handleWechatNotify(body);
    return "SUCCESS";
}

/**
 * 公开数据查询接口
 */
@SaIgnore
@GetMapping("/public/config")
public R<Map<String, String>> getPublicConfig() {
    return R.ok(configService.getPublicConfig());
}
```

**安全建议:**

- 匿名接口仅用于必要场景(登录、注册、回调等)
- 回调接口要验证签名
- 公开接口不要暴露敏感数据

### 6. 动态权限控制

**✅ 推荐:**

```java
@Service
public class ArticleServiceImpl implements IArticleService {

    @Override
    public boolean canEdit(Long articleId) {
        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            return false;
        }

        // 超级管理员可编辑所有
        if (LoginHelper.isSuperAdmin()) {
            return true;
        }

        // 作者可编辑自己的文章
        if (article.getCreateBy().equals(LoginHelper.getUserId())) {
            return true;
        }

        // 编辑角色可编辑
        if (LoginHelper.hasRole("editor")) {
            return true;
        }

        return false;
    }

    @Override
    public void update(ArticleBo bo) {
        // 动态权限校验
        ServiceException.throwIf(!canEdit(bo.getId()), "没有编辑权限");
        // 执行更新
        articleMapper.updateById(article);
    }
}
```

## 前端权限控制

### 路由权限

前端根据后端返回的路由信息动态生成菜单:

```typescript
// 获取路由信息
const getRouters = async () => {
  const { data } = await getRoutersApi()
  // 根据权限过滤路由
  const accessRoutes = filterAsyncRoutes(data, roles)
  // 动态添加路由
  accessRoutes.forEach(route => {
    router.addRoute(route)
  })
}
```

### 按钮权限

使用 `v-hasPermi` 指令控制按钮显示:

```vue
<template>
  <div class="user-list">
    <!-- 查询按钮 -->
    <el-button v-hasPermi="['system:user:query']" @click="handleQuery">
      查询
    </el-button>

    <!-- 新增按钮 -->
    <el-button v-hasPermi="['system:user:add']" @click="handleAdd">
      新增
    </el-button>

    <!-- 编辑按钮 -->
    <el-button v-hasPermi="['system:user:edit']" @click="handleEdit">
      编辑
    </el-button>

    <!-- 删除按钮 -->
    <el-button v-hasPermi="['system:user:delete']" @click="handleDelete">
      删除
    </el-button>
  </div>
</template>
```

### 角色权限

使用 `v-hasRole` 指令控制角色显示:

```vue
<template>
  <div>
    <!-- 仅管理员可见 -->
    <el-button v-hasRole="['admin']">
      管理员功能
    </el-button>

    <!-- 管理员或编辑可见 -->
    <el-button v-hasRole="['admin', 'editor']">
      管理功能
    </el-button>
  </div>
</template>
```

### 权限判断方法

```typescript
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()

// 判断是否有权限
const hasPermission = (permission: string) => {
  return permissionStore.permissions.includes(permission)
}

// 判断是否有角色
const hasRole = (role: string) => {
  return permissionStore.roles.includes(role)
}

// 使用示例
if (hasPermission('system:user:edit')) {
  // 显示编辑按钮
}

if (hasRole('admin')) {
  // 显示管理功能
}
```

## 常见问题

### 1. 权限校验不生效

**问题原因:**

- 接口缺少 `@Validated` 注解
- Sa-Token 配置不正确
- 权限标识不匹配

**解决方案:**

```java
// 1. 确保类上有 @Validated 注解
@Validated
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    // 2. 确保权限标识与数据库一致
    @SaCheckPermission("system:user:query")  // 检查数据库中是否有此权限
    @GetMapping("/list")
    public R<List<SysUserVo>> list() { ... }
}
```

### 2. 超级管理员也被拦截

**问题原因:**

- 超级管理员权限没有特殊处理

**解决方案:**

框架已内置超级管理员全权限,检查 `SaPermissionImpl`:

```java
@Override
public List<String> getPermissionList(Object loginId, String authType) {
    LoginUser loginUser = LoginHelper.getLoginUser();
    // 超级管理员拥有所有权限
    if (LoginHelper.isSuperAdmin(loginUser.getUserId())) {
        return Collections.singletonList("*:*:*");
    }
    return new ArrayList<>(loginUser.getMenuPermission());
}
```

### 3. 权限缓存问题

**问题原因:**

- 权限修改后缓存未更新

**解决方案:**

```java
@Service
public class SysRoleServiceImpl implements ISysRoleService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateRole(SysRoleBo bo) {
        // 更新角色
        roleMapper.updateById(role);

        // 更新角色菜单关联
        roleMenuMapper.deleteByRoleId(bo.getRoleId());
        insertRoleMenu(bo);

        // 清除权限缓存(让用户重新登录刷新权限)
        // 或者通知前端刷新权限
        return true;
    }
}
```

### 4. 多租户权限隔离

**问题原因:**

- 租户之间权限数据混淆

**解决方案:**

```java
@Service
public class SysMenuServiceImpl implements ISysMenuService {

    @Override
    public List<SysMenu> listMenuTreeByUserId(Long userId) {
        // 自动添加租户条件
        // TenantHelper 会自动过滤当前租户数据
        return menuMapper.listMenuTreeByUserId(userId);
    }
}
```

### 5. 接口权限与按钮权限不一致

**问题原因:**

- 前端按钮显示但后端拒绝访问
- 权限标识前后端不一致

**解决方案:**

```java
// 后端权限标识
@SaCheckPermission("system:user:edit")
@PutMapping
public R<Void> edit(@RequestBody SysUserBo bo) { ... }
```

```vue
<!-- 前端权限标识必须一致 -->
<el-button v-hasPermi="['system:user:edit']" @click="handleEdit">
  编辑
</el-button>
```

## 总结

RuoYi-Plus 框架的权限控制体系提供了完善的访问控制机制:

**核心组件:**

- `@SaCheckPermission` - 接口权限校验注解
- `@SaCheckRole` - 角色权限校验注解
- `@SaIgnore` - 跳过认证注解
- `LoginHelper` - 登录鉴权助手工具类
- `SaPermissionImpl` - Sa-Token 权限实现类

**最佳实践:**

- 采用细粒度权限设计,便于灵活分配
- 敏感操作使用多重校验(角色+权限+业务校验)
- 合理使用 `orRole` 参数简化权限配置
- Service 层补充业务级权限校验
- 匿名接口仅用于必要场景,注意安全
- 前后端权限标识保持一致

**权限分工:**

| 层级 | 责任 | 实现方式 |
|------|------|----------|
| Controller | 接口访问控制 | `@SaCheckPermission`、`@SaCheckRole` |
| Service | 业务规则校验 | `LoginHelper`、`ServiceException` |
| DAO | 数据范围控制 | 数据权限注解、SQL 条件 |
| 前端 | 界面元素控制 | `v-hasPermi`、`v-hasRole` |

通过遵循这些最佳实践,可以构建安全、灵活、可维护的权限控制体系。
