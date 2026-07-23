# 最佳实践

欢迎来到 RuoYi-Plus-UniApp 最佳实践指南！这里汇集了项目开发、部署、运维等各个环节的最佳实践经验。

## 工程化

提升开发效率的工程化实践和工具使用指南。

### Claude Code

AI 辅助开发工具 Claude Code 的使用指南：

- [Skills 技能系统](/practices/engineering/claude-code-skills) - 自定义技能扩展 Claude Code 能力
- [Commands 自定义命令](/practices/engineering/claude-code-commands) - 创建和使用自定义命令
- [Hooks 钩子机制](/practices/engineering/claude-code-hooks) - 钩子系统实现自动化流程
- [MCP 服务器配置](/practices/engineering/claude-code-mcp) - MCP 服务器集成配置
- [Sub-Agents 子代理](/practices/engineering/claude-code-agents) - 子代理系统使用

### 其他工具

- [代码生成器使用](/practices/engineering/code-generator) - 快速生成 CRUD 代码

## 开发规范

统一的开发规范是团队协作的基础，确保代码质量和可维护性。

- [代码规范](/practices/standards/coding) - 统一的代码编写规范
- [API设计规范](/practices/standards/api-design) - RESTful API 设计标准
- [命名规范](/practices/standards/naming) - 项目中的命名约定
- [注释规范](/practices/standards/comment) - 代码注释的标准格式
- [Git使用规范](/practices/standards/git) - Git 提交和分支管理规范
- [数据库规范](/practices/standards/database) - 数据库设计和使用规范
- [前端开发规范](/practices/standards/frontend) - 前端代码规范

## 架构设计

良好的架构设计是系统稳定性和可扩展性的保障。

- [系统架构设计](/practices/architecture/system) - 整体系统架构设计原则
- [数据库设计](/practices/architecture/database) - 数据库设计规范和优化
- [缓存策略](/practices/architecture/cache) - 缓存使用策略和最佳实践
- [分布式设计](/practices/architecture/distributed) - 分布式系统设计要点
- [多租户架构](/practices/architecture/multi-tenant) - 多租户系统设计

## 后端开发

后端开发的最佳实践和设计模式。

- [Service层最佳实践](/practices/backend/service-layer) - 服务层设计和实现
- [Controller层最佳实践](/practices/backend/controller-layer) - 控制器层规范
- [数据访问层优化](/practices/backend/data-access) - DAO 层优化技巧
- [事务管理策略](/practices/backend/transaction) - 事务处理最佳实践
- [异常处理机制](/practices/backend/exception-handling) - 统一异常处理
- [数据校验最佳实践](/practices/backend/validation) - 参数校验规范

## 功能开发

常见功能模块的开发指南。

- [权限控制实现](/practices/features/permission-control) - 权限系统设计
- [数据权限设计](/practices/features/data-permission) - 数据级权限控制
- [定时任务开发](/practices/features/scheduled-jobs) - 定时任务最佳实践
- [消息推送实现](/practices/features/message-push) - 消息推送方案
- [文件处理方案](/practices/features/file-processing) - 文件上传下载
- [Excel操作优化](/practices/features/excel-operations) - Excel 导入导出
- [第三方集成策略](/practices/features/third-party-integration) - 第三方服务集成
- [国际化实现方案](/practices/features/i18n) - 多语言支持

## 安全指南

安全是系统运行的重要保障，需要从多个维度进行防护。

- [安全总览](/practices/security/overview) - 系统安全整体概述
- [认证与授权](/practices/security/auth) - 用户认证和授权安全
- [数据安全](/practices/security/data) - 数据存储和传输安全
- [API安全](/practices/security/api) - API 接口安全防护
- [客户端安全](/practices/security/client) - 前端和移动端安全
- [安全审计](/practices/security/audit) - 安全审计和日志记录

## 部署运维

高效的部署运维流程确保系统稳定运行。

- [Docker部署指南](/practices/devops/docker-deploy) - Docker 容器化部署

---

## 为什么需要最佳实践？

- **提高开发效率** - 统一的规范减少沟通成本
- **保证代码质量** - 规范的流程确保代码质量
- **降低维护成本** - 良好的架构便于后期维护
- **提升系统性能** - 优化策略提升用户体验
- **增强系统安全** - 安全实践保护系统和数据

## 如何使用这些实践？

1. **循序渐进** - 根据项目阶段选择相应的实践指南
2. **结合实际** - 根据具体业务场景调整实践方案
3. **持续改进** - 在实践中不断优化和完善流程
4. **团队协作** - 确保团队成员都遵循相同的实践标准

---

## 技术栈概览

RuoYi-Plus-UniApp 是一个全栈框架，采用当前主流的技术栈构建。

### 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | LTS 长期支持版本 |
| Spring Boot | 3.5.12 | 核心框架 |
| MyBatis-Plus | 3.5.16 | ORM 增强框架 |
| Sa-Token | 1.44.0 | 权限认证框架 |
| Redisson | 3.52.0 | Redis 客户端 |
| Hutool | 5.8.40 | Java 工具类库 |
| Warm-Flow | 1.8.1 | 工作流引擎 |
| SnailJob | 1.8.0 | 分布式任务调度 |
| LangChain4j | 0.35.0 | AI 大模型集成 |
| WxJava | 4.7.6.B | 微信开发套件 |

### 后端模块架构

```text
ruoyi-plus-uniapp-workflow/
├── ruoyi-admin/                 # 后端主模块(启动入口)
├── ruoyi-common/                # 通用模块(31个子模块)
│   ├── ruoyi-common-core        # 核心工具类
│   ├── ruoyi-common-mybatis     # MyBatis-Plus配置
│   ├── ruoyi-common-redis       # Redis缓存模块
│   ├── ruoyi-common-satoken     # Sa-Token认证配置
│   ├── ruoyi-common-excel       # Excel导入导出
│   ├── ruoyi-common-oss         # 对象存储
│   ├── ruoyi-common-sms         # 短信模块
│   ├── ruoyi-common-mail        # 邮件模块
│   ├── ruoyi-common-job         # 定时任务
│   ├── ruoyi-common-tenant      # 多租户模块
│   └── ...                      # 更多模块
├── ruoyi-modules/               # 业务模块(5个子模块)
│   ├── ruoyi-system             # 系统管理模块
│   ├── ruoyi-generator          # 代码生成器
│   ├── ruoyi-workflow           # 工作流模块
│   ├── ruoyi-business           # 业务扩展模块
│   └── ruoyi-mall               # 商城模块
└── ruoyi-extend/                # 扩展模块
    ├── ruoyi-monitor-admin      # Spring Boot Admin监控
    └── ruoyi-snailjob-server    # 任务调度服务端
```

### 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.x | 渐进式 JavaScript 框架 |
| TypeScript | 5.7.x | JavaScript 超集 |
| Vite | 6.x | 下一代前端构建工具 |
| Element Plus | 2.x | Vue 3 组件库 |
| Pinia | 2.x | Vue 状态管理 |
| Vue Router | 4.x | 路由管理 |
| UnoCSS | 65.x | 原子化 CSS 引擎 |

### 移动端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0+ | 跨平台开发框架 |
| Vue | 3.4.x | 渐进式 JavaScript 框架 |
| TypeScript | 5.7.x | JavaScript 超集 |
| Pinia | 2.0.x | Vue 状态管理 |
| WD UI | 自维护 | 移动端 UI 组件库 |

---

## 分层架构详解

### 经典三层架构

RuoYi-Plus 采用经典的三层架构设计，各层职责明确。

```text
┌─────────────────────────────────────────────────────────┐
│                    Controller 层                         │
│    职责：请求接收、参数校验、权限控制、结果封装              │
├─────────────────────────────────────────────────────────┤
│                     Service 层                           │
│    职责：业务逻辑处理、事务管理、缓存处理                    │
├─────────────────────────────────────────────────────────┤
│                      DAO 层                              │
│    职责：数据访问、SQL 执行、结果映射                        │
└─────────────────────────────────────────────────────────┘
```

### Controller 层规范

Controller 层作为请求入口，应遵循以下原则：

**标准 Controller 模板：**

```java
@Validated                          // 启用参数校验
@RequiredArgsConstructor            // 构造函数注入
@RestController                     // RESTful API
@RequestMapping("/system/user")     // 统一请求前缀
public class SysUserController {

    /* 业务服务 - 只注入 Service 接口 */
    private final ISysUserService userService;
    private final ISysRoleService roleService;

    /**
     * 分页查询用户列表
     */
    @SaCheckPermission("system:user:query")
    @GetMapping("/pageUsers")
    public R<PageResult<SysUserVo>> pageUsers(SysUserBo user, PageQuery pageQuery) {
        return R.ok(userService.pageUsers(user, pageQuery));
    }

    /**
     * 新增用户
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", operType = DictOperType.INSERT)
    @RepeatSubmit()
    @PostMapping("/addUser")
    public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
        return R.ok(userService.insertUser(bo));
    }
}
```

**核心注解说明：**

| 注解 | 说明 |
|------|------|
| `@Validated` | 启用类级别参数校验 |
| `@RequiredArgsConstructor` | Lombok 构造函数注入 |
| `@SaCheckPermission` | Sa-Token 权限检查 |
| `@Log` | 操作日志记录 |
| `@RepeatSubmit` | 防重复提交 |
| `@ApiEncrypt` | 请求/响应数据加密 |

### Service 层规范

Service 层是业务逻辑的核心，应遵循以下原则：

**标准 Service 模板：**

```java
@Slf4j
@RequiredArgsConstructor
@Service
public class SysUserServiceImpl implements ISysUserService {

    /* DAO 层 - 只注入 DAO 接口，不注入 Mapper */
    private final ISysUserDao userDao;
    private final ISysRoleDao roleDao;
    private final ISysDeptDao deptDao;

    /* 可选依赖 - 使用 @Autowired(required = false) */
    @Autowired(required = false)
    private PayService payService;

    /**
     * 新增用户
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long insertUser(SysUserBo bo) {
        // 1. 参数校验
        validateUserData(bo);

        // 2. 业务逻辑处理
        SysUser user = MapstructUtils.convert(bo, SysUser.class);
        user.setPassword(BCrypt.hashpw(bo.getPassword()));

        // 3. 数据持久化
        userDao.insert(user);

        // 4. 处理关联数据
        insertUserRoles(user.getUserId(), bo.getRoleIds());

        return user.getUserId();
    }

    /**
     * 带缓存的查询 - 使用 AOP 代理
     */
    @Cacheable(cacheNames = CacheNames.SYS_NICKNAME, key = "#userId")
    public String getNickNameById(Long userId) {
        return userDao.selectNickNameById(userId);
    }

    /**
     * 同类方法调用缓存 - 需要使用 AOP 代理
     */
    public String getNickName(Long userId) {
        // 通过 AOP 代理调用，确保缓存生效
        return SpringUtils.getAopProxy(this).getNickNameById(userId);
    }
}
```

**核心原则：**

1. **只注入 DAO** - 不注入 Mapper，保持层级清晰
2. **事务管理** - 使用 `@Transactional` 注解
3. **缓存集成** - 使用 `@Cacheable` 等注解
4. **AOP 代理** - 同类方法调用时使用 `SpringUtils.getAopProxy()`

### DAO 层规范

DAO 层负责数据访问，封装对 Mapper 的调用：

```java
@RequiredArgsConstructor
@Repository
public class SysUserDaoImpl implements ISysUserDao {

    private final SysUserMapper baseMapper;

    @Override
    public SysUserVo selectVoById(Long userId) {
        return baseMapper.selectVoById(userId);
    }

    @Override
    public List<SysUserVo> selectVoList(SysUserBo bo) {
        LambdaQueryWrapper<SysUser> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<SysUser> buildQueryWrapper(SysUserBo bo) {
        return Wrappers.<SysUser>lambdaQuery()
            .like(StringUtils.isNotBlank(bo.getUserName()), SysUser::getUserName, bo.getUserName())
            .eq(StringUtils.isNotBlank(bo.getStatus()), SysUser::getStatus, bo.getStatus())
            .between(bo.getBeginTime() != null && bo.getEndTime() != null,
                SysUser::getCreateTime, bo.getBeginTime(), bo.getEndTime());
    }
}
```

---

## 权限控制体系

### Sa-Token 集成

RuoYi-Plus 使用 Sa-Token 实现权限控制，提供了丰富的权限检查方式。

**权限注解使用：**

```java
// 单一权限检查
@SaCheckPermission("system:user:query")

// 多权限 OR 模式（满足任一即可）
@SaCheckPermission(value = {"system:user:query", "system:user:add"}, mode = SaMode.OR)

// 多权限 AND 模式（必须全部满足）
@SaCheckPermission(value = {"system:user:query", "system:user:export"}, mode = SaMode.AND)

// 角色检查
@SaCheckRole("admin")

// 跳过认证（公开接口）
@SaIgnore
```

**权限字符串规范：**

格式：`模块:功能:操作`

| 操作 | 说明 | 示例 |
|------|------|------|
| query | 查询 | `system:user:query` |
| add | 新增 | `system:user:add` |
| update | 修改 | `system:user:update` |
| delete | 删除 | `system:user:delete` |
| export | 导出 | `system:user:export` |
| import | 导入 | `system:user:import` |

### 数据权限控制

RuoYi-Plus 支持细粒度的数据权限控制：

```java
// 检查用户数据权限
userService.checkUserDataScope(userId);

// 检查部门数据权限
deptService.checkDeptDataScope(deptId);

// 绕过租户限制
TenantHelper.ignore(() -> {
    // 这里的代码不受租户限制
    return userDao.selectById(userId);
});
```

---

## 缓存策略

### Spring Cache 集成

RuoYi-Plus 使用 Spring Cache + Redis 实现缓存：

```java
// 缓存名称常量
public interface CacheNames {
    String SYS_NICKNAME = "sys:nickname";
    String SYS_USER = "sys:user";
    String SYS_ROLE = "sys:role";
    String SYS_DICT = "sys:dict";
}

// 缓存使用示例
@Cacheable(cacheNames = CacheNames.SYS_NICKNAME, key = "#userId")
public String getNickNameById(Long userId) {
    return userDao.selectNickNameById(userId);
}

@CacheEvict(cacheNames = CacheNames.SYS_USER, key = "#userId")
public void updateUser(Long userId, SysUserBo bo) {
    // 更新用户后自动清除缓存
}

@CachePut(cacheNames = CacheNames.SYS_USER, key = "#result.userId")
public SysUserVo insertUser(SysUserBo bo) {
    // 新增用户后更新缓存
}
```

### 缓存注意事项

1. **同类方法调用** - 需要使用 AOP 代理

```java
// ✅ 正确 - 使用 AOP 代理
public String getNickName(Long userId) {
    return SpringUtils.getAopProxy(this).getNickNameById(userId);
}

// ❌ 错误 - 直接调用，缓存不生效
public String getNickName(Long userId) {
    return this.getNickNameById(userId);
}
```

2. **缓存键设计** - 使用有意义的键名

```java
// ✅ 推荐 - 使用模块前缀
@Cacheable(cacheNames = "sys:user:detail", key = "#userId")

// ❌ 不推荐 - 键名过于简单
@Cacheable(cacheNames = "user", key = "#id")
```

---

## 参数校验

### Bean Validation 使用

RuoYi-Plus 使用 JSR-303 规范进行参数校验：

**BO 对象定义：**

```java
@Data
public class SysUserBo extends BaseEntity {

    /**
     * 主键id
     */
    @NotNull(message = "主键id不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空", groups = { AddGroup.class, EditGroup.class })
    @Size(min = 2, max = 30, message = "用户名长度在2-30之间")
    private String userName;

    /**
     * 手机号
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    /**
     * 邮箱
     */
    @Email(message = "邮箱格式不正确")
    private String email;
}
```

**Controller 层使用：**

```java
// 使用分组校验
@PostMapping("/addUser")
public R<Long> addUser(@Validated(AddGroup.class) @RequestBody SysUserBo bo) {
    return R.ok(userService.insertUser(bo));
}

@PutMapping("/updateUser")
public R<Void> updateUser(@Validated(EditGroup.class) @RequestBody SysUserBo bo) {
    return R.status(userService.updateUser(bo));
}
```

**常用校验注解：**

| 注解 | 说明 |
|------|------|
| `@NotNull` | 不能为 null |
| `@NotBlank` | 字符串不能为空白 |
| `@NotEmpty` | 集合/数组不能为空 |
| `@Size` | 长度/大小限制 |
| `@Min` / `@Max` | 数值范围 |
| `@Pattern` | 正则表达式匹配 |
| `@Email` | 邮箱格式 |
| `@Positive` | 必须为正数 |

---

## 事务管理

### Spring 事务使用

**基本事务配置：**

```java
@Transactional(rollbackFor = Exception.class)
public Long insertUser(SysUserBo bo) {
    // 业务逻辑
}
```

**事务传播行为：**

```java
// 默认传播行为 - 加入当前事务
@Transactional(rollbackFor = Exception.class)
public void methodA() {
    // ...
}

// 新建独立事务
@Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRES_NEW)
public void logOperation() {
    // 日志记录，独立事务，不影响主事务
}

// 嵌套事务
@Transactional(rollbackFor = Exception.class, propagation = Propagation.NESTED)
public void nestedMethod() {
    // 嵌套事务，可以独立回滚
}
```

**事务失效场景及解决方案：**

```java
// ❌ 事务失效 - 同类方法调用
public void methodA() {
    this.methodB();  // 事务不生效
}

@Transactional
public void methodB() {
    // ...
}

// ✅ 解决方案 - 使用 AOP 代理
public void methodA() {
    SpringUtils.getAopProxy(this).methodB();
}
```

---

## Excel 导入导出

### 导出功能

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

**导出 VO 定义：**

```java
@Data
public class SysUserExportVo {

    @ExcelProperty("用户ID")
    private Long userId;

    @ExcelProperty("用户名")
    private String userName;

    @ExcelProperty("手机号")
    @ExcelMask(type = MaskType.PHONE)  // 手机号脱敏
    private String phone;

    @ExcelProperty("状态")
    @ExcelDictConverter(dictType = "sys_normal_disable")  // 字典转换
    private String status;

    @ExcelProperty("创建时间")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    private Date createTime;
}
```

### 导入功能

```java
/**
 * 导入用户数据
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

**导入监听器：**

```java
@Slf4j
@RequiredArgsConstructor
public class SysUserImportListener extends AnalysisEventListener<SysUserImportVo> {

    private final ISysUserService userService;
    private final List<SysUserImportVo> list = new ArrayList<>();

    @Override
    public void invoke(SysUserImportVo data, AnalysisContext context) {
        list.add(data);
        // 每100条处理一次
        if (list.size() >= 100) {
            saveData();
            list.clear();
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 处理剩余数据
        saveData();
    }

    private void saveData() {
        userService.batchInsert(list);
    }
}
```

---

## 异常处理

### 统一异常处理

RuoYi-Plus 使用全局异常处理器统一处理异常：

```java
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
    public R<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        return R.fail(message);
    }

    /**
     * 权限不足异常
     */
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e) {
        return R.fail(403, "权限不足: " + e.getMessage());
    }
}
```

**Service 层抛出异常：**

```java
// 抛出业务异常
if (user == null) {
    throw new ServiceException("用户不存在");
}

// 抛出带状态码的异常
throw new ServiceException(500, "服务器内部错误");
```

---

## 操作日志

### @Log 注解使用

```java
// 新增操作日志
@Log(title = "用户管理", operType = DictOperType.INSERT)
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    return R.ok(userService.insertUser(bo));
}

// 修改操作日志
@Log(title = "用户管理", operType = DictOperType.UPDATE)
@PutMapping("/updateUser")
public R<Void> updateUser(@Validated @RequestBody SysUserBo bo) {
    return R.status(userService.updateUser(bo));
}

// 删除操作日志
@Log(title = "用户管理", operType = DictOperType.DELETE)
@DeleteMapping("/deleteUsers/{userIds}")
public R<Void> deleteUsers(@PathVariable Long[] userIds) {
    return R.status(userService.deleteUserByIds(userIds));
}
```

**操作类型枚举：**

| 类型 | 说明 |
|------|------|
| INSERT | 新增 |
| UPDATE | 修改 |
| DELETE | 删除 |
| EXPORT | 导出 |
| IMPORT | 导入 |
| QUERY | 查询 |
| GRANT | 授权 |
| FORCE | 强制操作 |
| CLEAN | 清理 |
| GENCODE | 代码生成 |

---

## 防重复提交

### @RepeatSubmit 注解使用

```java
// 默认配置（5秒内防重复）
@RepeatSubmit()
@PostMapping("/addUser")
public R<Long> addUser(@Validated @RequestBody SysUserBo bo) {
    return R.ok(userService.insertUser(bo));
}

// 自定义配置
@RepeatSubmit(interval = 10000, message = "操作过于频繁，请稍后重试")
@PostMapping("/pay")
public R<Void> pay(@RequestBody PayRequest request) {
    return R.ok(payService.pay(request));
}
```

**使用场景：**

| 场景 | 是否使用 |
|------|----------|
| 新增操作 | 是 使用 |
| 修改操作 | 是 使用 |
| 支付操作 | 是 使用 |
| 查询操作 | 否 不使用 |
| 删除操作 | 可选 |

---

## 多租户支持

### 租户隔离

RuoYi-Plus 支持 SaaS 多租户架构：

```java
// 获取当前租户ID
String tenantId = TenantHelper.getTenantId();

// 判断是否启用多租户
if (TenantHelper.isEnable()) {
    // 多租户相关逻辑
}

// 绕过租户限制
TenantHelper.ignore(() -> {
    // 这里的代码不受租户限制
    return userDao.selectById(userId);
});

// 动态切换租户
TenantHelper.setDynamic(targetTenantId);
try {
    // 使用目标租户的数据
} finally {
    TenantHelper.clearDynamic();
}
```

### 租户配额检查

```java
// 检查用户名额
if (TenantHelper.isEnable()) {
    if (!tenantService.checkAccountBalance(TenantHelper.getTenantId())) {
        return R.fail("当前租户下用户名额不足，请联系管理员");
    }
}
```

---

## 事件发布与监听

### 应用事件机制

使用 Spring 事件机制实现模块解耦：

**定义事件：**

```java
@Getter
public class OrderPaySuccessEvent extends ApplicationEvent {
    private final Long orderId;
    private final BigDecimal amount;

    public OrderPaySuccessEvent(Object source, Long orderId, BigDecimal amount) {
        super(source);
        this.orderId = orderId;
        this.amount = amount;
    }
}
```

**发布事件：**

```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void payOrder(Long orderId) {
        Order order = orderDao.selectById(orderId);
        // 更新订单状态
        order.setStatus(OrderStatus.PAID);
        orderDao.updateById(order);

        // 发布支付成功事件
        eventPublisher.publishEvent(new OrderPaySuccessEvent(this, orderId, order.getAmount()));
    }
}
```

**监听事件：**

```java
@Slf4j
@Component
public class OrderEventListener {

    /**
     * 同步监听
     */
    @EventListener
    public void onOrderPaySuccess(OrderPaySuccessEvent event) {
        log.info("订单支付成功: orderId={}, amount={}", event.getOrderId(), event.getAmount());
        // 发送通知、更新统计等
    }

    /**
     * 异步监听
     */
    @Async
    @EventListener
    public void onOrderPaySuccessAsync(OrderPaySuccessEvent event) {
        // 异步处理，不阻塞主流程
    }
}
```

---

## 性能优化

### 查询优化

```java
// ✅ 推荐 - 只查询需要的字段
LambdaQueryWrapper<SysUser> wrapper = Wrappers.<SysUser>lambdaQuery()
    .select(SysUser::getUserId, SysUser::getUserName, SysUser::getNickName)
    .eq(SysUser::getStatus, "0");

// ✅ 推荐 - 使用流式查询处理大数据量
baseMapper.selectList(wrapper, resultContext -> {
    SysUser user = resultContext.getResultObject();
    // 逐条处理，避免内存溢出
});

// ✅ 推荐 - 批量操作
userDao.insertBatch(userList, 1000);  // 每批1000条

// ❌ 避免 - N+1 查询
for (Long userId : userIds) {
    SysUser user = userDao.selectById(userId);  // 循环查询数据库
}

// ✅ 改进 - 批量查询
List<SysUser> users = userDao.selectBatchIds(userIds);
```

### 缓存优化

```java
// 使用本地缓存减少 Redis 访问
@Cacheable(cacheNames = "local:config", key = "#key", cacheManager = "caffeineCacheManager")
public String getLocalConfig(String key) {
    return configDao.selectByKey(key);
}

// 多级缓存
public User getUser(Long userId) {
    // 1. 先查本地缓存
    User user = localCache.get(userId);
    if (user != null) {
        return user;
    }

    // 2. 再查 Redis
    user = redisCache.get("user:" + userId);
    if (user != null) {
        localCache.put(userId, user);
        return user;
    }

    // 3. 最后查数据库
    user = userDao.selectById(userId);
    if (user != null) {
        redisCache.set("user:" + userId, user, 1, TimeUnit.HOURS);
        localCache.put(userId, user);
    }
    return user;
}
```

---

## 单元测试

### Service 层测试

```java
@SpringBootTest
class SysUserServiceImplTest {

    @Autowired
    private ISysUserService userService;

    @MockitoBean
    private ISysUserDao userDao;

    @Test
    void testGetUserById() {
        // Given
        Long userId = 1L;
        SysUserVo mockUser = new SysUserVo();
        mockUser.setUserId(userId);
        mockUser.setUserName("admin");
        when(userDao.selectVoById(userId)).thenReturn(mockUser);

        // When
        SysUserVo result = userService.getUserById(userId);

        // Then
        assertNotNull(result);
        assertEquals("admin", result.getUserName());
        verify(userDao).selectVoById(userId);
    }

    @Test
    void testInsertUser() {
        // Given
        SysUserBo bo = new SysUserBo();
        bo.setUserName("testuser");
        bo.setPassword("123456");

        when(userDao.insert(any())).thenReturn(1);

        // When
        Long userId = userService.insertUser(bo);

        // Then
        assertNotNull(userId);
        verify(userDao).insert(any());
    }
}
```

### Controller 层测试

```java
@WebMvcTest(SysUserController.class)
class SysUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ISysUserService userService;

    @Test
    void testPageUsers() throws Exception {
        // Given
        PageResult<SysUserVo> pageResult = new PageResult<>();
        pageResult.setRecords(List.of());
        pageResult.setTotal(0L);
        when(userService.pageUsers(any(), any())).thenReturn(pageResult);

        // When & Then
        mockMvc.perform(get("/system/user/pageUsers")
                .param("pageNum", "1")
                .param("pageSize", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

---

## 开发检查清单

### Controller 层检查

- [ ] 类上添加 `@Validated` 注解
- [ ] 类上添加 `@RequiredArgsConstructor` 注解
- [ ] 只注入 Service 接口，不注入 Mapper
- [ ] 每个方法都有权限控制
- [ ] 写操作添加日志记录
- [ ] 新增/修改操作添加防重复提交
- [ ] 敏感接口添加加密传输
- [ ] 参数使用合适的校验注解

### Service 层检查

- [ ] 只注入 DAO 接口，不注入 Mapper
- [ ] 复杂业务使用事务管理
- [ ] 合理使用缓存
- [ ] 同类方法调用使用 AOP 代理
- [ ] 异常使用 ServiceException 抛出
- [ ] 大数据量操作使用批量处理

### 代码规范检查

- [ ] 方法命名遵循规范
- [ ] 变量命名有意义
- [ ] 代码注释完整
- [ ] 无魔法数字
- [ ] 无重复代码

---

## 快速开始指南

### 1. 环境准备

**必需环境：**

- JDK 17+
- Maven 3.9+
- MySQL 5.7+
- Redis 7.0+
- Node.js 18+

### 2. 后端启动

```bash
# 克隆项目
git clone https://github.com/xxx/ruoyi-plus-uniapp-workflow.git

# 进入项目目录
cd ruoyi-plus-uniapp-workflow

# 执行 SQL 脚本
mysql -u root -p < script/sql/ruoyi.sql

# 修改配置文件
vim ruoyi-admin/src/main/resources/application-dev.yml

# 启动项目
mvn spring-boot:run -pl ruoyi-admin
```

### 3. 前端启动

```bash
# 进入前端目录
cd plus-ui

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 4. 移动端启动

```bash
# 进入移动端目录
cd plus-uniapp

# 安装依赖
pnpm install

# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin
```

---

## 学习路径建议

### 新手入门

1. **了解框架** - 阅读项目 README 和系统架构文档
2. **环境搭建** - 按照快速开始指南搭建本地环境
3. **代码规范** - 学习编码规范和命名规范
4. **简单功能** - 尝试使用代码生成器生成 CRUD 代码

### 进阶学习

1. **分层架构** - 深入理解 Controller/Service/DAO 层设计
2. **权限系统** - 学习 Sa-Token 权限控制
3. **缓存策略** - 掌握 Redis 缓存使用
4. **事务管理** - 理解 Spring 事务机制

### 高级进阶

1. **多租户** - 学习 SaaS 多租户架构设计
2. **工作流** - 掌握 Warm-Flow 工作流引擎
3. **分布式** - 了解分布式锁、分布式事务
4. **性能优化** - 学习 SQL 优化、缓存优化、JVM 调优

---

## 总结

RuoYi-Plus-UniApp 最佳实践涵盖了以下核心内容：

1. **分层架构** - Controller/Service/DAO 职责明确，层级清晰
2. **权限控制** - 基于 Sa-Token 的细粒度权限管理
3. **参数校验** - 使用 Bean Validation 进行请求验证
4. **缓存策略** - Spring Cache + Redis 多级缓存
5. **事务管理** - Spring 声明式事务管理
6. **异常处理** - 全局统一异常处理机制
7. **日志记录** - 操作日志自动记录
8. **防重复提交** - 幂等性保证
9. **多租户支持** - SaaS 架构支持
10. **性能优化** - 批量处理、SQL 优化、缓存优化

遵循这些最佳实践，可以构建出高质量、易维护、高性能的企业级应用系统
