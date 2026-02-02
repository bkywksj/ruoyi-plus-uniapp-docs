# 系统核心模块 (System Core)

## 模块概述

系统核心模块(`ruoyi-system/core`)是 RuoYi-Plus 框架的基础业务模块,负责处理用户管理、角色权限、部门组织、菜单管理、岗位管理等核心功能。该模块采用经典的分层架构设计,提供完整的 RBAC(基于角色的访问控制)权限体系,支持多租户隔离、数据权限控制、动态路由生成等企业级特性。

**核心特性:**

- **完整的 RBAC 权限体系** - 支持用户、角色、菜单、部门、岗位的多维度权限控制
- **灵活的数据权限** - 提供 6 种数据权限范围,支持自定义数据权限规则
- **多租户支持** - 基于租户 ID 的数据隔离,支持租户套餐菜单控制
- **动态路由生成** - 根据用户权限动态构建前端路由配置
- **树形组织结构** - 支持无限层级的部门树和菜单树
- **社交登录集成** - 支持第三方社交账号绑定和登录
- **角色邀请机制** - 支持通过邀请码快速分配角色权限
- **数据缓存优化** - 使用 Redis 缓存提升查询性能
- **操作审计日志** - 记录关键操作的审计日志

## 模块结构

系统核心模块采用标准的三层架构设计,包含以下目录结构:

```
plus.ruoyi.system.core/
├── controller/          # 控制器层 - RESTful API 接口
│   ├── SysUserController.java           # 用户管理接口
│   ├── SysRoleController.java           # 角色管理接口
│   ├── SysDeptController.java           # 部门管理接口
│   ├── SysMenuController.java           # 菜单管理接口
│   ├── SysPostController.java           # 岗位管理接口
│   ├── SysProfileController.java        # 个人信息接口
│   ├── SysUserRoleController.java       # 用户角色授权接口
│   ├── SysSocialController.java         # 社交关系接口
│   └── SysRoleInviteController.java     # 角色邀请接口
│
├── service/            # 服务层 - 业务逻辑处理
│   ├── ISysUserService.java             # 用户服务接口
│   ├── ISysRoleService.java             # 角色服务接口
│   ├── ISysDeptService.java             # 部门服务接口
│   ├── ISysMenuService.java             # 菜单服务接口
│   ├── ISysPostService.java             # 岗位服务接口
│   ├── ISysSocialService.java           # 社交服务接口
│   ├── ISysRoleInviteService.java       # 角色邀请服务接口
│   ├── ISysPermissionService.java       # 权限服务接口
│   ├── ISysDataScopeService.java        # 数据权限服务接口
│   └── impl/                            # 服务实现类
│
├── dao/                # 数据访问层 - 数据库操作
│   ├── ISysUserDao.java                 # 用户数据访问接口
│   ├── ISysRoleDao.java                 # 角色数据访问接口
│   ├── ISysDeptDao.java                 # 部门数据访问接口
│   ├── ISysMenuDao.java                 # 菜单数据访问接口
│   ├── ISysPostDao.java                 # 岗位数据访问接口
│   ├── ISysSocialDao.java               # 社交数据访问接口
│   ├── ISysUserRoleDao.java             # 用户角色关联数据访问接口
│   ├── ISysRoleMenuDao.java             # 角色菜单关联数据访问接口
│   ├── ISysRoleDeptDao.java             # 角色部门关联数据访问接口
│   ├── ISysUserPostDao.java             # 用户岗位关联数据访问接口
│   └── impl/                            # 数据访问实现类
│
├── domain/             # 数据模型层
│   ├── SysUser.java                     # 用户实体
│   ├── SysRole.java                     # 角色实体
│   ├── SysDept.java                     # 部门实体
│   ├── SysMenu.java                     # 菜单实体
│   ├── SysPost.java                     # 岗位实体
│   ├── SysSocial.java                   # 社交关系实体
│   ├── SysUserRole.java                 # 用户角色关联实体
│   ├── SysRoleMenu.java                 # 角色菜单关联实体
│   ├── SysRoleDept.java                 # 角色部门关联实体
│   ├── SysUserPost.java                 # 用户岗位关联实体
│   ├── SysCache.java                    # 缓存配置实体
│   ├── bo/                              # 业务对象(Business Object)
│   │   ├── SysUserBo.java
│   │   ├── SysRoleBo.java
│   │   ├── SysDeptBo.java
│   │   ├── SysMenuBo.java
│   │   ├── SysPostBo.java
│   │   ├── SysSocialBo.java
│   │   ├── SysUserProfileBo.java
│   │   ├── SysUserPasswordBo.java
│   │   ├── CreateRoleInviteBo.java
│   │   └── RoleInviteQueryBo.java
│   └── vo/                              # 视图对象(View Object)
│       ├── SysUserVo.java
│       ├── SysRoleVo.java
│       ├── SysDeptVo.java
│       ├── SysMenuVo.java
│       ├── SysPostVo.java
│       ├── SysSocialVo.java
│       ├── SysUserExportVo.java
│       ├── SysUserInfoVo.java
│       ├── UserInfoVo.java
│       ├── RouterVo.java
│       └── MetaVo.java
│
├── mapper/             # MyBatis Mapper 接口(XML 映射)
│   └── ...
│
└── listener/           # 事件监听器
    └── SysUserImportListener.java       # 用户导入监听器
```

## 技术架构

### 分层架构设计

系统核心模块采用经典的三层架构模式,各层职责清晰:

**1. 控制器层(Controller)**
- 负责接收 HTTP 请求,处理请求参数
- 调用服务层完成业务逻辑
- 返回统一的响应格式 `R<T>`
- 使用 `@SaCheckPermission` 注解进行权限控制
- 使用 `@Log` 注解记录操作日志
- 使用 `@RepeatSubmit` 注解防止重复提交

**2. 服务层(Service)**
- 实现核心业务逻辑
- 处理事务管理
- 进行数据验证和业务规则校验
- 调用数据访问层完成数据操作
- 处理缓存更新和失效

**3. 数据访问层(Dao)**
- 封装数据库操作
- 提供基础的 CRUD 方法
- 处理复杂的关联查询
- 支持分页查询和条件构造

### 核心技术栈

**框架集成:**
- **Spring Boot 3.5.6** - 应用框架和依赖注入
- **MyBatis-Plus 3.5.14** - ORM 框架,提供强大的 CRUD 和查询构造器
- **Sa-Token 1.44.0** - 权限认证框架,支持多端登录和权限控制
- **Redisson 3.51.0** - Redis 客户端,提供分布式锁和缓存支持
- **Hutool 5.8.40** - Java 工具库,提供丰富的工具方法

**数据模型:**
- **Entity** - 实体类,直接映射数据库表结构
- **BO(Business Object)** - 业务对象,用于接收前端请求参数
- **VO(View Object)** - 视图对象,用于前端展示和数据导出

**注解支持:**
- `@TableName` - 指定数据库表名
- `@TableId` - 主键标识
- `@TableLogic` - 逻辑删除标识
- `@TableField` - 字段配置
- `@SaCheckPermission` - 权限校验
- `@Log` - 操作日志记录
- `@Cacheable` / `@CacheEvict` - 缓存管理

### 数据权限体系

系统支持 6 种数据权限范围,通过角色配置实现灵活的数据访问控制:

1. **全部数据权限** - 可查看所有数据,不受部门限制
2. **自定数据权限** - 可查看指定部门的数据,通过角色-部门关联配置
3. **本部门数据权限** - 只能查看本部门的数据
4. **本部门及以下数据权限** - 可查看本部门及下级部门的数据
5. **仅本人数据权限** - 只能查看自己创建的数据
6. **部门及以下或本人数据权限** - 可查看部门数据或个人数据

数据权限通过 SQL 拦截器实现,在查询时自动添加数据权限过滤条件,确保用户只能访问授权范围内的数据。

### 多租户支持

系统核心模块全面支持多租户架构:

**租户隔离机制:**
- 所有核心实体继承 `TenantEntity`,自动包含 `tenantId` 字段
- 数据查询自动添加租户过滤条件,确保数据隔离
- 租户套餐控制菜单权限范围,限制租户可访问的功能模块

**租户管理特性:**
- 租户套餐菜单分配,过滤系统核心管理功能
- 租户管理员权限控制,防止越权操作
- 跨租户数据隔离保证,确保数据安全

**超级管理员:**
- 超级管理员不受租户限制,可管理所有租户数据
- 支持动态切换租户上下文,方便运维管理

## 核心领域实体

系统核心模块包含多个领域实体,每个实体都对应数据库中的一张表,通过 MyBatis-Plus 注解进行映射。所有实体都继承自 `TenantEntity` 或 `BaseEntity`,自动获得租户隔离、创建时间、更新时间等公共字段。

### 用户实体(SysUser)

用户实体是系统的核心实体之一,存储用户的基本信息和状态。

**主要字段:**
- `userId` - 用户ID,主键
- `deptId` - 部门ID,关联部门表
- `userName` - 用户账号,登录用名,唯一
- `nickName` - 用户昵称,显示名称
- `userType` - 用户类型,区分系统用户和普通用户
- `email` - 用户邮箱,唯一,可用于登录
- `phone` - 手机号码,唯一,可用于登录
- `gender` - 用户性别
- `avatar` - 用户头像地址
- `password` - 密码,BCrypt 加密存储
- `status` - 账号状态,正常/停用
- `isDeleted` - 逻辑删除标识
- `loginIp` - 最后登录IP
- `loginDate` - 最后登录时间
- `tenantId` - 租户ID,继承自 TenantEntity

**特性:**
- 继承 `TenantEntity`,支持多租户隔离
- 使用 `@TableLogic` 注解实现逻辑删除
- 密码字段使用 `@TableField` 配置插入和更新策略
- 支持用户名、邮箱、手机号三种登录方式

### 角色实体(SysRole)

角色实体定义系统中的角色信息和权限范围。

**主要字段:**
- `roleId` - 角色ID,主键
- `roleName` - 角色名称
- `roleKey` - 角色权限字符串,用于权限标识
- `roleSort` - 显示顺序
- `dataScope` - 数据范围,控制数据权限
- `menuCheckStrictly` - 菜单树选择项是否关联显示
- `deptCheckStrictly` - 部门树选择项是否关联显示
- `status` - 角色状态,正常/停用
- `isDeleted` - 逻辑删除标识
- `remark` - 备注
- `tenantId` - 租户ID

**特性:**
- 支持 6 种数据权限范围配置
- 通过 `roleKey` 进行权限标识,如 `admin`、`common`
- 支持菜单权限和数据权限的独立配置
- 角色可以关联多个菜单和部门

### 部门实体(SysDept)

部门实体定义组织架构的树形结构。

**主要字段:**
- `deptId` - 部门ID,主键
- `parentId` - 父部门ID,构建树形结构
- `ancestors` - 祖级列表,存储所有父级ID,用逗号分隔
- `deptName` - 部门名称
- `orderNum` - 显示顺序
- `leader` - 负责人
- `phone` - 联系电话
- `email` - 邮箱
- `status` - 部门状态,正常/停用
- `isDeleted` - 逻辑删除标识
- `tenantId` - 租户ID

**特性:**
- 支持无限层级的树形结构
- 通过 `ancestors` 字段快速查询所有上级部门
- 父部门停用时,子部门自动停用
- 删除部门时检查是否存在子部门和关联用户

### 菜单实体(SysMenu)

菜单实体定义系统的菜单结构和权限标识。

**主要字段:**
- `menuId` - 菜单ID,主键
- `menuName` - 菜单名称
- `parentId` - 父菜单ID,构建树形结构
- `orderNum` - 显示顺序
- `path` - 路由地址
- `component` - 组件路径
- `queryParam` - 路由参数
- `isFrame` - 是否为外链
- `isCache` - 是否缓存
- `menuType` - 菜单类型,目录(M)/菜单(C)/按钮(F)
- `visible` - 显示状态,显示/隐藏
- `status` - 菜单状态,正常/停用
- `perms` - 权限标识,如 `system:user:list`
- `icon` - 菜单图标
- `i18nKey` - 国际化键
- `remark` - 备注

**特性:**
- 支持三级菜单结构:目录→菜单→按钮
- 通过 `perms` 字段定义权限标识,用于按钮级权限控制
- 支持外链菜单和内部路由
- 支持菜单缓存配置,提升页面切换性能
- 支持国际化菜单标题

### 岗位实体(SysPost)

岗位实体定义用户的岗位信息。

**主要字段:**
- `postId` - 岗位ID,主键
- `deptId` - 部门ID,岗位归属部门
- `postCode` - 岗位编码,唯一
- `postName` - 岗位名称
- `postSort` - 显示顺序
- `status` - 状态,正常/停用
- `remark` - 备注
- `tenantId` - 租户ID

**特性:**
- 岗位归属于特定部门
- 一个用户可以拥有多个岗位
- 岗位编码唯一,用于业务标识
- 支持岗位排序和状态控制

### 社交关系实体(SysSocial)

社交关系实体存储用户与第三方社交平台的绑定关系。

**主要字段:**
- `id` - 主键ID
- `userId` - 用户ID,关联系统用户
- `tenantId` - 租户ID
- `authId` - 第三方平台的用户唯一ID
- `source` - 第三方平台标识,如 `gitee`、`github`、`wechat`
- `openId` - 第三方平台的 OpenID
- `userName` - 第三方平台的用户名
- `nickName` - 第三方平台的昵称
- `email` - 第三方平台的邮箱
- `avatar` - 第三方平台的头像
- `accessToken` - 访问令牌
- `expireIn` - 令牌过期时间
- `refreshToken` - 刷新令牌
- `accessCode` - 授权码
- `unionId` - 第三方平台的 UnionID

**特性:**
- 支持多种第三方社交平台绑定
- 一个用户可以绑定多个社交账号
- 支持社交账号登录和绑定
- 存储第三方平台的令牌信息,支持自动刷新

### 关联关系实体

系统通过多个关联关系实体实现用户、角色、菜单、部门、岗位之间的多对多关系。

**SysUserRole - 用户角色关联**
- `userId` - 用户ID
- `roleId` - 角色ID
- 一个用户可以拥有多个角色
- 一个角色可以分配给多个用户

**SysRoleMenu - 角色菜单关联**
- `roleId` - 角色ID
- `menuId` - 菜单ID
- 定义角色可以访问的菜单和按钮权限
- 一个角色可以关联多个菜单
- 一个菜单可以分配给多个角色

**SysRoleDept - 角色部门关联**
- `roleId` - 角色ID
- `deptId` - 部门ID
- 定义角色的数据权限范围
- 仅在数据权限为"自定数据权限"时使用
- 一个角色可以关联多个部门

**SysUserPost - 用户岗位关联**
- `userId` - 用户ID
- `postId` - 岗位ID
- 一个用户可以拥有多个岗位
- 一个岗位可以分配给多个用户

## 服务层架构

服务层是系统核心模块的业务逻辑层,负责处理所有的业务规则、数据验证、事务管理和缓存控制。每个服务接口都定义了清晰的业务方法,由对应的实现类完成具体的业务逻辑。

### 用户服务(ISysUserService)

用户服务是系统最核心的服务之一,提供完整的用户管理功能。

**核心功能:**

**1. 用户查询**
- `pageUsers()` - 分页查询用户列表,支持多条件筛选
- `pageUserExports()` - 分页查询用户导出列表,用于 Excel 导出
- `pageRoleAuthorizedUsers()` - 分页查询已分配角色的用户列表
- `pageRoleUnauthorizedUsers()` - 分页查询未分配角色的用户列表
- `getUserByUserName()` - 通过用户名查询用户
- `getUserByPhone()` - 通过手机号查询用户
- `getUserByEmail()` - 通过邮箱查询用户
- `getUserById()` - 通过用户ID查询用户
- `getUserByNameKeyword()` - 根据用户名或昵称模糊查询用户
- `getUserWithRolesById()` - 通过用户ID查询用户(带角色信息)
- `listUsersByIdsAndDeptId()` - 通过用户ID串和部门ID查询用户列表
- `listUsersByDeptId()` - 通过部门ID查询当前部门所有用户

**2. 用户管理**
- `insertUser()` - 新增用户信息,包含角色和岗位分配
- `registerPcUser()` - 注册PC端用户信息
- `updateUser()` - 修改用户信息,包含角色和岗位更新
- `assignUserRoles()` - 分配用户角色
- `updateUserStatus()` - 修改用户状态(启用/停用)
- `updateUserProfile()` - 修改用户基本信息
- `updateUserAvatar()` - 修改用户头像
- `updateUserNickNameAvatar()` - 更新用户昵称和头像
- `resetUserPwd()` - 重置用户密码
- `deleteUserById()` - 通过用户ID删除用户
- `deleteUserByIds()` - 批量删除用户信息

**3. 用户验证**
- `isUserNameUnique()` - 判断用户名称是否唯一
- `isPhoneUnique()` - 判断手机号码是否唯一
- `isEmailUnique()` - 判断邮箱是否唯一
- `checkUserAllowed()` - 判断用户是否允许操作
- `checkUserDataScope()` - 校验用户是否有数据权限

**4. 用户关联查询**
- `getUserRoleGroup()` - 根据用户ID查询用户所属角色组
- `getUserPostGroup()` - 根据用户ID查询用户所属岗位组

### 角色服务(ISysRoleService)

角色服务负责角色管理和权限分配功能。

**核心功能:**

**1. 角色查询**
- `get()` - 根据ID查询角色详情
- `list()` - 查询角色列表,支持条件筛选
- `page()` - 分页查询角色列表
- `getRoleById()` - 通过角色ID查询角色
- `listRolesByUserId()` - 根据用户ID查询角色列表
- `listRolesWithAuthByUserId()` - 根据用户ID查询角色列表(包含被授权状态)
- `listRolesByIds()` - 根据角色ID列表批量查询角色

**2. 角色管理**
- `insertRole()` - 新增角色,包含菜单权限和数据权限配置
- `updateRole()` - 修改角色,包含权限更新
- `updateRoleDataScope()` - 修改角色数据权限范围
- `updateRoleStatus()` - 修改角色状态
- `batchDelete()` - 批量删除角色
- `batchSave()` - 批量保存角色

**3. 角色权限查询**
- `listRolePermissionsByUserId()` - 根据用户ID查询角色权限标识集合
- `listRoleIdsByUserId()` - 根据用户ID获取角色ID列表
- `listMenuIdsByRoleId()` - 根据角色ID查询菜单ID列表

**4. 角色验证**
- `isRoleNameUnique()` - 判断角色名称是否唯一
- `isRoleKeyUnique()` - 判断角色权限字符串是否唯一
- `checkRoleAllowed()` - 判断角色是否允许操作
- `checkRoleDataScope()` - 校验角色是否有数据权限

### 菜单服务(ISysMenuService)

菜单服务负责菜单管理和动态路由生成功能。

**核心功能:**

**1. 菜单查询**
- `listMenuByUserId()` - 根据用户查询系统菜单列表
- `listMenus()` - 查询菜单列表,支持条件筛选
- `listMenuTreeByUserId()` - 根据用户ID查询菜单树信息
- `getMenuById()` - 根据菜单ID查询菜单详情

**2. 菜单权限查询**
- `listMenuPermissionsByUserId()` - 根据用户ID查询权限标识集合
- `listMenuPermissionsByRoleId()` - 根据角色ID查询权限标识集合
- `listMenuIdsByRoleId()` - 根据角色ID查询菜单ID列表
- `listMenuIdsByPackageId()` - 根据租户套餐ID查询菜单ID列表

**3. 菜单树构建**
- `buildRouters()` - 构建前端路由所需要的菜单树
- `buildMenuTreeOptions()` - 构建菜单下拉树选择器
- `buildRoleMenuTree()` - 构建角色菜单树(用于角色授权)
- `buildTenantPackageMenuTree()` - 构建租户套餐菜单树

**4. 菜单管理**
- `insertMenu()` - 新增菜单
- `updateMenu()` - 修改菜单
- `deleteMenuById()` - 删除菜单
- `isMenuNameUnique()` - 判断菜单名称是否唯一
- `hasChildByMenuId()` - 是否存在子菜单

### 部门服务(ISysDeptService)

部门服务负责组织架构的树形结构管理。

**核心功能:**

**1. 部门查询**
- `list()` - 查询部门列表,支持条件筛选
- `getDeptById()` - 根据部门ID查询部门详情
- `listNormalDeptsByIds()` - 根据部门ID列表查询正常状态的部门
- `listDeptsByUserId()` - 根据用户ID查询部门列表

**2. 部门树构建**
- `buildDeptTree()` - 构建部门树结构
- `buildDeptTreeOptions()` - 构建部门下拉树选择器
- `buildRoleDeptTree()` - 构建角色部门树(用于数据权限配置)

**3. 部门管理**
- `insertDept()` - 新增部门,自动维护祖先路径
- `updateDept()` - 修改部门,更新子部门的祖先路径
- `deleteDeptById()` - 删除部门,检查子部门和关联用户
- `updateDeptStatus()` - 修改部门状态,级联更新子部门

**4. 部门验证**
- `isDeptNameUnique()` - 判断部门名称是否唯一
- `hasChildByDeptId()` - 是否存在子部门
- `checkDeptExistUser()` - 检查部门是否存在用户
- `checkDeptDataScope()` - 校验部门数据权限

### 岗位服务(ISysPostService)

岗位服务负责岗位信息管理。

**核心功能:**
- `list()` - 查询岗位列表
- `page()` - 分页查询岗位列表
- `getPostById()` - 根据岗位ID查询岗位详情
- `listPostIdsByUserId()` - 根据用户ID查询岗位ID列表
- `insertPost()` - 新增岗位
- `updatePost()` - 修改岗位
- `deletePostByIds()` - 批量删除岗位
- `isPostCodeUnique()` - 判断岗位编码是否唯一
- `isPostNameUnique()` - 判断岗位名称是否唯一

### 其他核心服务

**ISysSocialService - 社交关系服务**
- 管理用户与第三方社交平台的绑定关系
- 支持社交账号登录和解绑
- 查询用户的社交绑定列表

**ISysRoleInviteService - 角色邀请服务**
- 创建角色邀请码,快速分配角色权限
- 查询和管理邀请码
- 通过邀请码加入角色

**ISysPermissionService - 权限服务**
- 刷新用户权限缓存
- 获取用户的菜单权限和角色权限
- 权限验证和校验

**ISysDataScopeService - 数据权限服务**
- 获取用户的数据权限范围
- 构建数据权限SQL过滤条件
- 数据权限拦截和过滤

## 控制器层设计

控制器层是系统核心模块的接口层,负责接收HTTP请求、处理请求参数、调用服务层完成业务逻辑、返回统一的响应格式。所有控制器都遵循RESTful API设计规范,使用Sa-Token进行权限控制,使用统一的响应格式`R<T>`。

### 统一响应格式

所有API接口都返回统一的响应格式:

```java
public class R<T> {
    private int code;        // 响应码,200表示成功
    private String message;  // 响应消息
    private T data;          // 响应数据
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": 1,
    "userName": "admin",
    "nickName": "管理员"
  }
}
```

### 用户管理控制器(SysUserController)

用户管理控制器提供完整的用户管理API接口。

**主要端点:**

**1. 用户信息查询**
- `GET /system/user/getUserInfo` - 获取当前登录用户信息
- `GET /system/user/pageUsers` - 分页查询用户列表
- `GET /system/user/getUser/{userId}` - 根据用户ID获取详细信息
- `GET /system/user/getUserWithRoles/{userId}` - 根据用户ID获取用户及角色信息
- `GET /system/user/getUserOptions` - 根据用户ID串批量获取用户基础信息
- `GET /system/user/listUsersByDeptId/{deptId}` - 获取部门下的所有用户信息

**2. 用户管理操作**
- `POST /system/user/addUser` - 新增用户
- `PUT /system/user/updateUser` - 修改用户
- `PUT /system/user/resetUserPwd` - 重置用户密码
- `PUT /system/user/changeUserStatus` - 修改用户状态
- `DELETE /system/user/deleteUsers/{userIds}` - 批量删除用户

**3. 用户数据导入导出**
- `POST /system/user/exportUsers` - 导出用户列表到Excel
- `POST /system/user/templateUsers` - 下载用户导入模板
- `POST /system/user/importUsers` - 从Excel导入用户数据

**权限控制:**
- 使用`@SaCheckPermission`注解进行权限校验
- 支持多权限组合,如`@SaCheckPermission(value = {"system:user:query", "system:notice:add"}, mode = SaMode.OR)`
- 自动校验用户数据权限,确保只能操作授权范围内的数据

### 角色管理控制器(SysRoleController)

角色管理控制器提供角色和权限管理API接口。

**主要端点:**
- `GET /system/role/pageRoles` - 分页查询角色列表
- `GET /system/role/getRole/{roleId}` - 根据角色ID获取详细信息
- `GET /system/role/getRoleOptions` - 获取角色选择框列表
- `GET /system/role/getRoleDeptTree/{roleId}` - 获取角色部门树列表(数据权限)
- `POST /system/role/addRole` - 新增角色
- `PUT /system/role/updateRole` - 修改角色
- `PUT /system/role/updateRoleDataScope` - 修改角色数据权限
- `PUT /system/role/changeRoleStatus` - 修改角色状态
- `DELETE /system/role/deleteRoles/{roleIds}` - 批量删除角色
- `POST /system/role/exportRoles` - 导出角色列表

### 部门管理控制器(SysDeptController)

部门管理控制器提供组织架构管理API接口。

**主要端点:**
- `GET /system/dept/listDepts` - 获取部门列表
- `GET /system/dept/listDeptsExcludeChild/{deptId}` - 查询部门列表(排除指定节点及其子节点)
- `GET /system/dept/getDept/{deptId}` - 根据部门ID获取详细信息
- `GET /system/dept/listNormalDeptsByIds` - 获取正常状态的部门列表
- `GET /system/dept/getDeptTreeOptions` - 获取部门树选择器
- `POST /system/dept/addDept` - 新增部门
- `PUT /system/dept/updateDept` - 修改部门
- `DELETE /system/dept/deleteDept/{deptId}` - 删除部门

### 菜单管理控制器(SysMenuController)

菜单管理控制器提供菜单和路由管理API接口。

**主要端点:**
- `GET /system/menu/getRouters` - 获取当前用户的路由信息(用于前端动态路由)
- `GET /system/menu/listMenus` - 获取菜单列表
- `GET /system/menu/getMenu/{menuId}` - 根据菜单ID获取详细信息
- `GET /system/menu/getMenuTreeOptions` - 获取菜单下拉树列表
- `GET /system/menu/getRoleMenuTree/{roleId}` - 加载角色菜单列表树(用于角色授权)
- `GET /system/menu/getTenantPackageMenuTree/{packageId}` - 加载租户套餐菜单列表树
- `POST /system/menu/addMenu` - 新增菜单
- `PUT /system/menu/updateMenu` - 修改菜单
- `DELETE /system/menu/deleteMenu/{menuId}` - 删除菜单

### 岗位管理控制器(SysPostController)

岗位管理控制器提供岗位信息管理API接口。

**主要端点:**
- `GET /system/post/pagePosts` - 分页查询岗位列表
- `GET /system/post/getPost/{postId}` - 根据岗位ID获取详细信息
- `GET /system/post/getPostOptions` - 获取岗位选择框列表
- `POST /system/post/addPost` - 新增岗位
- `PUT /system/post/updatePost` - 修改岗位
- `DELETE /system/post/deletePosts/{postIds}` - 批量删除岗位
- `POST /system/post/exportPosts` - 导出岗位列表

### 其他控制器

**SysProfileController - 个人信息控制器**
- `GET /system/user/getUserProfile` - 获取个人信息
- `PUT /system/user/updateUserProfile` - 修改个人信息
- `PUT /system/user/updateUserPassword` - 修改密码
- `POST /system/user/uploadAvatar` - 上传头像

**SysUserRoleController - 用户角色授权控制器**
- `GET /system/user-role/pageRoleAuthorizedUsers` - 分页查询角色已授权用户列表
- `GET /system/user-role/pageRoleUnauthorizedUsers` - 分页查询角色未授权用户列表
- `PUT /system/user-role/revokeUserRole` - 撤销用户角色
- `PUT /system/user-role/batchRevokeUserRoles` - 批量撤销用户角色
- `PUT /system/user-role/batchGrantUserRoles` - 批量授权用户角色
- `PUT /system/user-role/assignUserRoles` - 用户授权角色

**SysSocialController - 社交关系控制器**
- `GET /system/social/getSocialBindingList` - 查询社交关系列表
- `DELETE /system/social/unbindSocial/{socialId}` - 解绑社交账号

**SysRoleInviteController - 角色邀请控制器**
- `POST /system/role-invite/createInvite` - 创建角色邀请码
- `GET /system/role-invite/pageInvites` - 分页查询邀请码列表
- `POST /system/role-invite/joinByInvite` - 通过邀请码加入角色

## 数据访问层设计

数据访问层(Dao)负责封装数据库操作,提供基础的CRUD方法和复杂的关联查询。系统采用MyBatis-Plus作为ORM框架,通过Dao接口和实现类完成数据访问。

### Dao接口设计

所有Dao接口都继承自MyBatis-Plus的基础接口,提供通用的数据库操作方法。

**核心Dao接口:**
- `ISysUserDao` - 用户数据访问接口
- `ISysRoleDao` - 角色数据访问接口
- `ISysDeptDao` - 部门数据访问接口
- `ISysMenuDao` - 菜单数据访问接口
- `ISysPostDao` - 岗位数据访问接口
- `ISysSocialDao` - 社交关系数据访问接口
- `ISysUserRoleDao` - 用户角色关联数据访问接口
- `ISysRoleMenuDao` - 角色菜单关联数据访问接口
- `ISysRoleDeptDao` - 角色部门关联数据访问接口
- `ISysUserPostDao` - 用户岗位关联数据访问接口

### 数据访问特性

**1. 基础CRUD操作**
- 继承MyBatis-Plus提供的基础方法
- 支持单条和批量的增删改查操作
- 自动处理租户隔离和逻辑删除

**2. 条件查询**
- 使用LambdaQueryWrapper构建查询条件
- 支持动态SQL和复杂条件组合
- 自动添加数据权限过滤条件

**3. 分页查询**
- 集成MyBatis-Plus分页插件
- 支持物理分页和性能优化
- 返回`PageResult<T>`统一分页结果

**4. 关联查询**
- 通过XML映射文件定义复杂的关联查询
- 支持一对多、多对多关系查询
- 优化查询性能,避免N+1问题

## 核心业务特性

系统核心模块实现了多个重要的业务特性,为整个系统提供基础支撑。

### 权限控制体系

系统实现了完整的RBAC权限控制体系,包括菜单权限、数据权限和按钮权限。

**1. 菜单权限**
- 三级菜单结构:目录(M) → 菜单(C) → 按钮(F)
- 基于角色的菜单权限分配
- 动态路由生成,根据用户权限加载对应菜单
- 支持菜单显示/隐藏控制
- 支持外链菜单和内部路由

**2. 数据权限**

系统支持6种数据权限范围,通过角色配置实现灵活的数据访问控制:

- **全部数据权限** - 可查看所有数据,不受部门限制
- **自定数据权限** - 可查看指定部门的数据,通过角色-部门关联配置
- **本部门数据权限** - 只能查看本部门的数据
- **本部门及以下数据权限** - 可查看本部门及下级部门的数据
- **仅本人数据权限** - 只能查看自己创建的数据
- **部门及以下或本人数据权限** - 可查看部门数据或个人数据

数据权限通过MyBatis-Plus拦截器实现,在查询时自动添加数据权限过滤条件,确保用户只能访问授权范围内的数据。

**3. 按钮权限**

通过权限标识(`perms`)控制页面按钮的显示和操作权限:
- 权限标识格式:`模块:功能:操作`
- 示例:`system:user:query`、`system:role:add`、`system:dept:edit`
- 前端通过权限标识控制按钮显示
- 后端通过`@SaCheckPermission`注解校验操作权限

### 缓存策略

系统使用Redis缓存提升查询性能,减少数据库访问。

**缓存配置:**
- **用户缓存** - 缓存用户基本信息和权限信息
- **部门缓存** - 缓存部门信息和部门树结构
- **角色缓存** - 缓存角色权限和用户角色关系
- **菜单缓存** - 缓存菜单树和路由信息

**缓存管理:**
- 使用Spring Cache注解管理缓存
- `@Cacheable` - 查询结果缓存
- `@CacheEvict` - 缓存失效清理
- `@Caching` - 复杂缓存操作组合
- 数据更新时自动清理相关缓存

### 数据验证体系

系统实现了完整的数据验证机制,确保数据的准确性和一致性。

**1. 参数验证**

使用JSR-303注解进行参数验证:
- `@NotBlank` - 非空字符串验证
- `@NotNull` - 非空对象验证
- `@Size` - 字符串长度验证
- `@Email` - 邮箱格式验证
- `@Pattern` - 正则表达式验证

**2. 业务规则验证**

Service层实现复杂的业务规则验证:
- **唯一性校验** - 用户名、邮箱、手机号唯一性
- **关联关系校验** - 删除前检查是否存在关联数据
- **权限校验** - 数据权限和操作权限验证
- **状态校验** - 父级状态对子级的影响验证

### 事务管理

系统使用Spring事务管理确保数据一致性。

**事务配置:**
- Service层方法使用`@Transactional`注解
- 支持事务传播和隔离级别配置
- 异常回滚机制,确保数据完整性
- 嵌套事务支持,处理复杂业务场景

**事务最佳实践:**
- 事务方法尽量简短,避免长事务
- 避免在事务中调用外部服务
- 合理使用事务传播级别
- 注意事务失效场景(如自调用)

### 安全特性

系统实现了多层次的安全防护机制。

**1. 密码安全**
- 使用BCrypt算法加密存储密码
- 支持密码强度策略配置
- 密码重置需要验证身份
- 定期提醒用户修改密码

**2. SQL注入防护**
- MyBatis预编译SQL防止注入攻击
- 参数化查询,避免拼接SQL
- 输入参数验证和过滤

**3. 操作审计**
- 使用`@Log`注解记录重要操作
- 记录操作人、操作时间、操作内容
- 支持操作日志查询和导出

## 最佳实践

### 开发规范

**1. 分层职责明确**
- Controller只处理请求响应,不包含业务逻辑
- Service处理业务逻辑,不直接操作数据库
- Dao只负责数据访问,不包含业务判断
- 避免跨层调用,保持架构清晰

**2. 异常处理统一**
- 使用`ServiceException`处理业务异常
- 统一异常响应格式
- 避免在Controller层捕获异常
- 记录异常日志,便于问题排查

**3. 事务管理规范**
- 在Service层方法上使用`@Transactional`
- 事务方法尽量简短,避免长事务
- 注意事务传播级别的选择
- 避免事务失效场景

**4. 权限控制严格**
- 每个接口都要配置合适的权限注解
- 使用`@SaCheckPermission`进行权限校验
- 数据权限自动过滤,确保数据安全
- 敏感操作需要二次验证

### 性能优化建议

**1. 合理使用缓存**
- 对频繁查询的数据进行缓存
- 注意缓存更新策略,避免脏数据
- 使用缓存预热,提升首次访问速度
- 设置合理的缓存过期时间

**2. 避免N+1查询**
- 使用关联查询代替循环查询
- 批量查询优化,减少数据库访问
- 使用MyBatis-Plus的批量操作方法

**3. 分页查询必须**
- 大数据量查询必须使用分页
- 合理设置分页大小,避免一次查询过多数据
- 使用物理分页,提升查询性能

**4. 索引优化**
- 为常用查询字段建立索引
- 避免在索引字段上使用函数
- 定期分析慢查询,优化SQL

### 安全建议

**1. 权限最小化**
- 按照最小权限原则分配用户权限
- 定期审查用户权限,及时回收不必要的权限
- 避免直接分配超级管理员权限

**2. 数据权限控制**
- 严格控制用户的数据访问范围
- 使用数据权限过滤,防止越权访问
- 敏感数据需要额外的权限控制

**3. 密码安全策略**
- 使用强密码策略,要求密码复杂度
- 定期提醒用户修改密码
- 密码错误次数限制,防止暴力破解
- 重要操作需要二次验证

**4. 操作审计完整**
- 记录重要操作的审计日志
- 包含操作人、操作时间、操作内容、操作结果
- 定期审查操作日志,发现异常行为
- 审计日志不可篡改,确保可追溯性

### 代码质量建议

**1. 代码规范**
- 遵循阿里巴巴Java开发手册
- 使用统一的代码格式化工具
- 变量命名清晰,见名知意
- 添加必要的注释,说明复杂逻辑

**2. 单元测试**
- 为核心业务逻辑编写单元测试
- 测试覆盖率达到70%以上
- 使用Mock框架隔离依赖
- 定期运行测试,确保代码质量

**3. 代码审查**
- 重要功能需要代码审查
- 关注代码质量、性能、安全性
- 及时发现和修复潜在问题
- 分享最佳实践,提升团队水平

## 总结

系统核心模块是RuoYi-Plus框架的基础,提供了完整的用户管理、角色权限、部门组织、菜单管理等核心功能。模块采用经典的三层架构设计,实现了完整的RBAC权限体系,支持多租户隔离、数据权限控制、动态路由生成等企业级特性。

通过合理使用缓存、优化查询、严格的权限控制和完善的数据验证,系统核心模块为整个应用提供了稳定、安全、高效的基础服务。开发者在使用时应遵循最佳实践,确保代码质量和系统安全。
