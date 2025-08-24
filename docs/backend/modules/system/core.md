# 核心功能 (core)

## 概述

系统核心包(`plus.ruoyi.system.core`)是整个系统的核心业务模块，负责处理用户管理、权限控制、部门组织、菜单管理、角色管理等基础功能。该模块采用经典的三层架构设计，包含控制器层(Controller)、服务层(Service)、数据访问层(Mapper)以及数据传输对象(BO/VO/Entity)。

## 模块结构

```
plus.ruoyi.system.core/
├── controller/          # 控制器层 - RESTful API接口
├── service/            # 服务层 - 业务逻辑处理
│   └── impl/          # 服务层实现类
├── mapper/            # 数据访问层 - MyBatis映射器
├── domain/            # 数据模型层
│   ├── entity/        # 实体类 - 数据库表映射
│   ├── bo/            # 业务对象 - Business Object
│   └── vo/            # 视图对象 - View Object
└── listener/          # 事件监听器
```

## 核心领域实体

### 用户管理(User)
- **SysUser** - 用户实体，包含用户基本信息、状态、部门关联等
- **SysUserBo** - 用户业务对象，用于接收和传递用户业务数据
- **SysUserVo** - 用户视图对象，用于前端展示和数据导出
- **SysUserExportVo** - 用户导出专用视图对象

### 角色管理(Role)
- **SysRole** - 角色实体，定义系统角色及其权限范围
- **SysRoleBo** - 角色业务对象，包含角色信息和关联的菜单、部门权限
- **SysRoleVo** - 角色视图对象，用于前端展示

### 部门管理(Dept)
- **SysDept** - 部门实体，支持树形组织结构
- **SysDeptBo** - 部门业务对象，包含部门信息和验证规则
- **SysDeptVo** - 部门视图对象，支持树形结构展示

### 菜单管理(Menu)
- **SysMenu** - 菜单实体，定义系统菜单和权限结构
- **SysMenuBo** - 菜单业务对象，包含菜单配置和验证
- **SysMenuVo** - 菜单视图对象，支持树形菜单展示

### 岗位管理(Post)
- **SysPost** - 岗位实体，定义用户岗位信息
- **SysPostBo** - 岗位业务对象
- **SysPostVo** - 岗位视图对象

### 关联关系实体
- **SysUserRole** - 用户角色关联关系
- **SysRoleMenu** - 角色菜单权限关联关系
- **SysRoleDept** - 角色部门数据权限关联关系
- **SysUserPost** - 用户岗位关联关系
- **SysSocial** - 社会化登录关联关系

## 服务层架构

### 基础服务接口

#### ISysUserService - 用户管理服务
**核心功能：**
- 用户CRUD操作：增删改查、批量操作
- 用户认证：登录验证、密码管理、状态控制
- 用户关联：角色分配、岗位分配、部门归属
- 数据导入导出：Excel批量导入导出用户信息
- 用户查询：按部门、角色、岗位等维度查询用户

**关键方法：**
- `listUsersByDeptId()` - 根据部门查询用户
- `listUsersByRoleIds()` / `listUsersByPostIds()` - 根据角色/岗位查询用户
- `checkUserNameUnique()` / `checkEmailUnique()` / `checkPhoneUnique()` - 用户信息唯一性校验
- `insertUser()` / `updateUser()` / `deleteUserByIds()` - 用户增删改操作
- `resetPwd()` / `updateUserProfile()` - 密码重置和个人信息更新

#### ISysRoleService - 角色管理服务
**核心功能：**
- 角色CRUD操作和权限管理
- 角色菜单权限分配和数据权限控制
- 用户角色关联管理
- 角色状态管理和数据范围控制

**关键方法：**
- `listRolesByUserId()` - 查询用户拥有的角色
- `listRolePermissionsByUserId()` - 查询用户角色权限
- `insertRole()` / `updateRole()` - 角色增删改，包含权限分配
- `authDataScope()` - 角色数据权限授权
- `insertAuthUsers()` / `deleteAuthUsers()` - 角色用户授权管理

#### ISysDeptService - 部门管理服务
**核心功能：**
- 部门树形结构管理
- 部门CRUD操作和层级关系维护
- 部门数据权限校验
- 部门用户关联查询

**关键方法：**
- `getDeptTree()` - 获取部门树结构
- `buildDeptTreeSelect()` - 构建前端下拉树
- `checkDeptNameUnique()` - 部门名称唯一性校验
- `hasChildByDeptId()` / `checkDeptExistUser()` - 部门关联关系检查
- `checkDeptDataScope()` - 部门数据权限校验

#### ISysMenuService - 菜单管理服务
**核心功能：**
- 菜单树形结构管理
- 前端路由配置生成
- 用户菜单权限查询
- 租户菜单权限控制

**关键方法：**
- `listMenuByUserId()` - 根据用户查询可访问菜单
- `buildRouters()` - 构建前端路由配置
- `listMenuPermissionsByUserId()` - 查询用户菜单权限
- `buildMenuTreeOptions()` - 构建菜单树选择器
- `buildTenantPackageMenuTreeOptions()` - 构建租户套餐菜单树

## 控制器层设计

### RESTful API设计原则
所有控制器都遵循统一的RESTful API设计规范：

#### SysUserController - 用户管理API
**主要端点：**
- `GET /system/user/getUserInfo` - 获取当前用户信息
- `GET /system/user/pageUsers` - 分页查询用户列表
- `GET /system/user/getUser/{userId}` - 根据用户编号获取详细信息
- `GET /system/user/getUserWithRoles/{userId}` - 根据用户编号获取授权角色
- `GET /system/user/getUserOptions` - 根据用户ID串批量获取用户基础信息
- `GET /system/user/listUsersByDeptId/{deptId}` - 获取部门下的所有用户信息
- `POST /system/user/addUser` - 新增用户
- `PUT /system/user/updateUser` - 修改用户
- `PUT /system/user/resetUserPwd` - 重置密码
- `PUT /system/user/changeUserStatus` - 状态修改
- `DELETE /system/user/deleteUsers/{userIds}` - 删除用户
- `POST /system/user/exportUsers` - 导出用户列表
- `POST /system/user/templateUsers` - 获取导入模板
- `POST /system/user/importUsers` - 导入数据

#### SysRoleController - 角色管理API
**主要端点：**
- `GET /system/role/pageRoles` - 获取角色信息列表
- `GET /system/role/getRole/{roleId}` - 根据角色编号获取详细信息
- `GET /system/role/getRoleOptions` - 获取角色选择框列表
- `GET /system/role/getRoleDeptTree/{roleId}` - 获取对应角色部门树列表
- `POST /system/role/addRole` - 新增角色
- `PUT /system/role/updateRole` - 修改保存角色
- `PUT /system/role/updateRoleDataScope` - 修改保存数据权限
- `PUT /system/role/changeRoleStatus` - 状态修改
- `DELETE /system/role/deleteRoles/{roleIds}` - 删除角色
- `POST /system/role/exportRoles` - 导出角色信息列表

#### SysDeptController - 部门管理API
**主要端点：**
- `GET /system/dept/listDepts` - 获取部门列表
- `GET /system/dept/listDeptsExcludeChild/{deptId}` - 查询部门列表(排除节点)
- `GET /system/dept/getDept/{deptId}` - 根据部门编号获取详细信息
- `GET /system/dept/listNormalDeptsByIds` - 获取部门选择框列表
- `GET /system/dept/getDeptTreeOptions` - 获取部门树列表
- `POST /system/dept/addDept` - 新增部门
- `PUT /system/dept/updateDept` - 修改部门
- `DELETE /system/dept/deleteDept/{deptId}` - 删除部门

#### SysMenuController - 菜单管理API
**主要端点：**
- `GET /system/menu/getRouters` - 获取路由信息
- `GET /system/menu/listMenus` - 获取菜单列表
- `GET /system/menu/getMenu/{menuId}` - 根据菜单编号获取详细信息
- `GET /system/menu/getMenuTreeOptions` - 获取菜单下拉树列表
- `GET /system/menu/getRoleMenuTree/{roleId}` - 加载对应角色菜单列表树
- `GET /system/menu/getTenantPackageMenuTree/{packageId}` - 加载对应租户套餐菜单列表树
- `POST /system/menu/addMenu` - 新增菜单
- `PUT /system/menu/updateMenu` - 修改菜单
- `DELETE /system/menu/deleteMenu/{menuId}` - 删除菜单

#### SysPostController - 岗位管理API
**主要端点：**
- `GET /system/post/pagePosts` - 获取岗位列表
- `GET /system/post/getPost/{postId}` - 根据岗位编号获取详细信息
- `GET /system/post/getPostOptions` - 获取岗位选择框列表
- `POST /system/post/addPost` - 新增岗位
- `PUT /system/post/updatePost` - 修改岗位
- `DELETE /system/post/deletePosts/{postIds}` - 删除岗位
- `POST /system/post/exportPosts` - 导出岗位列表

#### SysUserRoleController - 用户角色授权API
**主要端点：**
- `GET /system/user-role/pageRoleAuthorizedUsers` - 分页查询角色已授权用户列表
- `GET /system/user-role/pageRoleUnauthorizedUsers` - 查询角色未授权用户列表
- `PUT /system/user-role/revokeUserRole` - 撤销用户角色
- `PUT /system/user-role/batchRevokeUserRoles` - 批量撤销用户角色
- `PUT /system/user-role/batchGrantUserRoles` - 批量授权用户角色
- `PUT /system/user-role/assignUserRoles` - 用户授权角色

#### SysProfileController - 个人信息API
**主要端点：**
- `GET /system/user/getUserProfile` - 个人信息
- `PUT /system/user/updateUserProfile` - 修改用户信息
- `PUT /system/user/updateUserPassword` - 修改密码
- `POST /system/user/uploadAvatar` - 头像上传

#### SysSocialController - 社会化关系API
**主要端点：**
- `GET /system/social/getSocialBindingList` - 查询社会化关系列表

### 统一响应格式
所有API接口都返回统一的响应格式`R<T>`：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

## 数据传输对象设计

### 三层数据对象架构

#### Entity - 实体类
直接映射数据库表结构，使用MyBatis-Plus注解：
- `@TableName` - 指定数据库表名
- `@TableId` - 主键标识
- `@TableLogic` - 逻辑删除标识
- 继承`TenantEntity`或`BaseEntity`获得公共字段

#### BO - 业务对象(Business Object)
用于接收前端请求参数和业务逻辑处理：
- 包含数据验证注解(`@NotBlank`, `@Size`, `@Email`等)
- 使用`@AutoMapper`自动映射到Entity
- 继承`BaseEntity`获得创建时间、更新时间等公共字段

#### VO - 视图对象(View Object)
用于前端展示和数据导出：
- 使用`@ExcelProperty`支持Excel导出
- 使用`@ExcelDictFormat`支持字典数据转换
- 使用`@AutoMapper`从Entity自动映射
- 实现`Serializable`接口支持序列化

### 特殊视图对象

#### RouterVo - 路由配置对象
用于构建前端动态路由：
```java
public class RouterVo {
    private String name;        // 路由名字
    private String path;        // 路由地址  
    private String component;   // 组件地址
    private MetaVo meta;        // 路由元信息
    private List<RouterVo> children; // 子路由
}
```

#### MetaVo - 路由元信息对象
定义路由在前端的展示属性：
```java
public class MetaVo {
    private String title;       // 路由显示名称
    private String icon;        // 菜单图标
    private boolean noCache;    // 是否缓存
    private String link;        // 外链地址
    private String i18nKey;     // 国际化键
}
```

## 数据访问层设计

### MyBatis-Plus集成
所有Mapper接口都继承`BaseMapperPlus<Entity, Vo>`，提供：
- 基础CRUD操作的泛型实现
- 自动实体到VO的映射转换
- 分页查询支持
- 条件构造器支持

### 主要Mapper接口
- **SysUserMapper** - 用户数据访问，包含复杂的用户角色关联查询
- **SysRoleMapper** - 角色数据访问，支持权限相关的复杂查询
- **SysDeptMapper** - 部门数据访问，支持树形结构查询
- **SysMenuMapper** - 菜单数据访问，支持用户权限菜单查询
- **SysRoleMenuMapper** - 角色菜单关联关系数据访问
- **SysUserRoleMapper** - 用户角色关联关系数据访问

### XML映射文件
位于`resources/mapper/system`目录下，定义复杂的SQL查询：
- 支持动态SQL和结果映射
- 处理多表关联查询
- 优化查询性能

## 核心业务特性

### 权限控制体系

#### 菜单权限
- 三级菜单结构：目录(M) → 菜单(C) → 按钮(F)
- 基于角色的菜单权限分配
- 动态路由生成，根据用户权限加载对应菜单

#### 数据权限
支持6种数据权限范围：
1. **全部数据权限** - 可查看所有数据
2. **自定数据权限** - 可查看指定部门的数据
3. **本部门数据权限** - 只能查看本部门数据
4. **本部门及以下数据权限** - 可查看本部门及下级部门数据
5. **仅本人数据权限** - 只能查看自己的数据
6. **部门及以下或本人数据权限** - 部门数据或个人数据

#### 按钮权限
通过权限标识(`perms`)控制页面按钮的显示和操作权限，格式：`模块:功能:操作`
例如：`system:user:query`, `system:role:add`, `system:dept:edit`

### 多租户支持

#### 租户隔离
- 所有核心实体继承`TenantEntity`，自动包含租户ID
- 数据查询自动添加租户过滤条件
- 租户套餐控制菜单权限范围

#### 租户管理特性
- 租户套餐菜单分配，过滤系统核心管理功能
- 租户管理员权限控制
- 跨租户数据隔离保证

### 缓存策略

#### Redis缓存集成
使用Spring Cache注解实现缓存管理：
- `@Cacheable` - 查询结果缓存
- `@CacheEvict` - 缓存失效清理
- `@Caching` - 复杂缓存操作组合

#### 主要缓存配置
- **用户缓存** - `CacheNames.SYS_USER_NAME`：用户基本信息缓存
- **部门缓存** - `CacheNames.SYS_DEPT`：部门信息和部门树结构缓存
- **角色缓存** - 角色权限和用户角色关系缓存

### 数据验证体系

#### 业务对象验证
BO类使用JSR-303注解进行数据验证：
- `@NotBlank` - 非空字符串验证
- `@NotNull` - 非空对象验证
- `@Size` - 字符串长度验证
- `@Email` - 邮箱格式验证
- `@Pattern` - 正则表达式验证

#### 业务逻辑验证
Service层实现复杂的业务规则验证：
- 唯一性校验：用户名、邮箱、手机号唯一性
- 关联关系校验：删除前检查是否存在关联数据
- 权限校验：数据权限和操作权限验证
- 状态校验：父级状态对子级的影响验证

## 核心业务流程

### 用户管理流程

#### 用户注册/新增
1. **数据验证** - 验证用户信息格式和唯一性
2. **密码加密** - 使用BCrypt对密码进行加密
3. **默认角色** - 分配默认角色和部门
4. **数据保存** - 保存用户基本信息
5. **关联关系** - 建立用户-角色、用户-岗位关联关系
6. **缓存更新** - 清理相关缓存

#### 用户权限查询
1. **用户验证** - 验证用户身份和状态
2. **角色查询** - 查询用户关联的所有角色
3. **权限合并** - 合并多个角色的菜单权限
4. **数据权限** - 根据角色确定数据访问范围
5. **菜单构建** - 构建用户可访问的菜单树
6. **路由生成** - 生成前端动态路由配置

### 角色权限管理流程

#### 角色权限分配
1. **角色验证** - 验证角色信息和权限
2. **菜单权限** - 分配角色可访问的菜单和按钮
3. **数据权限** - 设置角色的数据访问范围
4. **关联更新** - 更新角色-菜单、角色-部门关联关系
5. **权限生效** - 清理缓存，权限立即生效
6. **用户通知** - 通知相关用户权限变更

### 部门组织管理流程

#### 部门结构调整
1. **结构验证** - 验证部门层级关系的合理性
2. **权限检查** - 检查当前用户对部门的操作权限
3. **关联影响** - 分析对用户、角色数据权限的影响
4. **祖先路径** - 自动维护部门的ancestors祖先路径
5. **缓存更新** - 更新部门树相关的所有缓存
6. **权限重算** - 重新计算受影响用户的数据权限

## 技术特性

### 框架集成
- **Spring Boot** - 应用框架和依赖注入
- **MyBatis-Plus** - ORM框架，提供强大的CRUD和查询构造器
- **Sa-Token** - 权限认证框架，支持多端登录和权限控制
- **Hutool** - Java工具库，提供丰富的工具方法
- **MapStruct** - 对象映射框架，自动生成BO/VO转换代码

### 性能优化
- **分页查询** - 所有列表查询都支持分页，避免大数据量问题
- **懒加载** - 关联数据按需加载，减少不必要的数据库查询
- **批量操作** - 支持批量插入、更新、删除操作
- **查询优化** - 使用索引优化常用查询，合理使用缓存

### 安全特性
- **SQL注入防护** - MyBatis预编译SQL防止注入攻击
- **权限注解** - `@SaCheckPermission`注解确保接口访问权限
- **数据脱敏** - 敏感信息的加密存储和传输
- **操作审计** - `@Log`注解记录重要操作日志

## 配置和扩展

### 国际化支持
- 支持多语言菜单标题和提示信息
- 使用`i18nKey`字段实现前端国际化
- 统一的国际化键命名规范

### 自定义扩展
- **验证规则扩展** - 可在BO类中添加自定义验证注解
- **业务逻辑扩展** - Service层提供`beforeSave`、`beforeDelete`等钩子方法
- **权限规则扩展** - 支持自定义数据权限过滤规则

### 监听器机制
- **SysUserImportListener** - 用户导入数据处理监听器
- 支持自定义业务事件监听器扩展

## 最佳实践建议

### 开发规范
1. **分层职责明确** - Controller只处理请求响应，Service处理业务逻辑，Mapper只负责数据访问
2. **异常处理统一** - 使用`ServiceException`处理业务异常，统一异常响应格式
3. **事务管理** - 在Service层方法上使用`@Transactional`确保数据一致性
4. **权限控制严格** - 每个接口都要配置合适的权限注解

### 性能建议
1. **合理使用缓存** - 对频繁查询的数据进行缓存，注意缓存更新策略
2. **避免N+1查询** - 使用关联查询代替循环查询
3. **分页查询** - 大数据量查询必须使用分页
4. **索引优化** - 为常用查询字段建立合适的数据库索引

### 安全建议
1. **权限最小化** - 按照最小权限原则分配用户权限
2. **数据权限** - 严格控制用户的数据访问范围
3. **密码安全** - 使用强密码策略和安全的加密算法
4. **操作审计** - 记录重要操作的审计日志

## 依赖关系

### 内部依赖
- `plus.ruoyi.common.core` - 公共核心组件
- `plus.ruoyi.common.mybatis` - MyBatis增强组件
- `plus.ruoyi.common.satoken` - 权限认证组件
- `plus.ruoyi.common.tenant` - 多租户组件
- `plus.ruoyi.common.redis` - Redis缓存组件

### 外部依赖
- Spring Boot Web - Web开发框架
- MyBatis-Plus - ORM增强框架
- Sa-Token - 权限认证框架
- Hutool - Java工具库
- MapStruct - 对象映射框架

该模块是整个系统的基础，为其他业务模块提供用户认证、权限控制、组织管理等核心服务支撑。所有的业务功能都需要依赖core模块提供的基础能力。
