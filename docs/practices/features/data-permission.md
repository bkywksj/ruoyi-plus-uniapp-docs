# 数据权限最佳实践

## 概述

数据权限是企业级应用中实现数据隔离和访问控制的核心功能。RuoYi-Plus框架提供了一套基于MyBatis-Plus拦截器的数据权限解决方案，通过注解配置实现自动SQL条件注入，支持多种数据范围类型，能够满足大多数企业的数据隔离需求。

### 核心特性

- **声明式配置** - 通过`@DataPermission`和`@DataColumn`注解声明数据权限规则
- **自动SQL注入** - 基于MyBatis-Plus拦截器自动为SQL添加权限过滤条件
- **多种数据范围** - 支持全部数据、自定义、本部门、部门及以下、仅本人等多种范围
- **SpEL表达式** - 使用Spring Expression Language构建灵活的权限SQL
- **缓存优化** - 部门层级和角色权限数据支持缓存，提升查询性能
- **可重入忽略** - 支持在特殊场景下临时禁用数据权限过滤

### 适用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| 部门数据隔离 | 用户只能查看本部门数据 | 部门经理只能看到本部门员工 |
| 层级数据管理 | 上级部门可查看下级部门数据 | 总经理可查看所有子公司数据 |
| 个人数据保护 | 用户只能查看自己创建的数据 | 销售人员只能看到自己的客户 |
| 自定义权限 | 根据角色配置特定部门的访问权限 | 区域经理可查看指定区域数据 |

## 架构设计

### 整体架构

数据权限系统由以下核心组件构成：

```
┌─────────────────────────────────────────────────────────────┐
│                        业务层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Service   │  │    DAO      │  │   Mapper    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         │    @DataPermission/@DataColumn  │                 │
│         │                │                │                 │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据权限拦截层                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         PlusDataPermissionInterceptor               │   │
│  │                     │                               │   │
│  │                     ▼                               │   │
│  │         PlusDataPermissionHandler                   │   │
│  │           │                   │                     │   │
│  │           ▼                   ▼                     │   │
│  │    DataScopeType       DataPermissionHelper         │   │
│  │    (权限范围枚举)        (权限助手工具)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据支撑层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │LoginHelper  │  │SysDataScope │  │  缓存服务   │         │
│  │ (用户信息)  │  │  Service    │  │ (Redis)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 职责 | 位置 |
|------|------|------|
| `@DataPermission` | 数据权限注解，配置权限规则数组 | ruoyi-common-mybatis |
| `@DataColumn` | 数据列注解，配置占位符和表字段映射 | ruoyi-common-mybatis |
| `DataScopeType` | 数据范围枚举，定义权限类型和SQL模板 | ruoyi-common-mybatis |
| `PlusDataPermissionHandler` | 权限处理器，负责构建过滤SQL | ruoyi-common-mybatis |
| `DataPermissionHelper` | 权限助手，提供上下文管理和忽略控制 | ruoyi-common-mybatis |
| `ISysDataScopeService` | 数据范围服务，获取部门和角色权限数据 | ruoyi-system |

### 执行流程

```
1. SQL执行请求
       │
       ▼
2. PlusDataPermissionInterceptor 拦截
       │
       ▼
3. 检查是否存在 @DataPermission 注解
       │
       ├── 无注解 ──► 跳过权限过滤
       │
       ▼
4. 获取当前用户信息 (LoginHelper)
       │
       ├── 超级管理员/租户管理员 ──► 跳过权限过滤
       │
       ▼
5. 遍历用户角色，获取数据范围类型
       │
       ▼
6. 根据 DataScopeType 构建 SQL 条件
       │
       ▼
7. 使用 SpEL 解析 SQL 模板
       │
       ▼
8. 将权限条件追加到原 SQL
       │
       ▼
9. 执行最终 SQL
```

## 数据范围类型

### DataScopeType枚举

系统预定义了六种数据范围类型，每种类型对应不同的权限控制策略：

```java
public enum DataScopeType {
    /**
     * 全部数据权限
     * 不添加任何过滤条件，可查看所有数据
     */
    ALL("1", "全部数据权限", "", ""),

    /**
     * 自定义数据权限
     * 根据角色配置的部门列表进行过滤
     */
    CUSTOM("2", "自定义数据权限",
        " #{#deptName} IN ( #{@sdss.getRoleCustom( #user.roleId )} ) ",
        " 1 = 0 "),

    /**
     * 部门数据权限
     * 只能查看本部门的数据
     */
    DEPT("3", "部门数据权限",
        " #{#deptName} = #{#user.deptId} ",
        " 1 = 0 "),

    /**
     * 部门及以下数据权限
     * 可以查看本部门及所有子部门的数据
     */
    DEPT_AND_CHILD("4", "部门及以下数据权限",
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} )",
        " 1 = 0 "),

    /**
     * 仅本人数据权限
     * 只能查看自己创建的数据
     */
    SELF("5", "仅本人数据权限",
        " #{#userName} = #{#user.userId} ",
        " 1 = 0 "),

    /**
     * 部门及以下或本人数据权限
     * 可以查看本部门及子部门的数据，或自己创建的数据
     */
    DEPT_AND_CHILD_OR_SELF("6", "部门及以下或本人数据",
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} ) OR #{#userName} = #{#user.userId} ",
        " 1 = 0 ");
}
```

### SQL模板说明

| 模板变量 | 说明 | 来源 |
|----------|------|------|
| `#deptName` | 部门字段占位符 | `@DataColumn`注解的key属性 |
| `#userName` | 用户字段占位符 | `@DataColumn`注解的key属性 |
| `#user.deptId` | 当前用户部门ID | LoginUser对象 |
| `#user.userId` | 当前用户ID | LoginUser对象 |
| `#user.roleId` | 当前角色ID | 遍历用户角色时设置 |
| `@sdss` | 数据范围服务Bean | ISysDataScopeService |

### 权限级别对比

| 权限类型 | 查看范围 | 适用角色 | 典型场景 |
|----------|----------|----------|----------|
| ALL | 全部数据 | 超级管理员 | 系统管理 |
| CUSTOM | 指定部门 | 区域经理 | 跨部门协作 |
| DEPT_AND_CHILD | 本部门及下级 | 部门经理 | 部门管理 |
| DEPT | 仅本部门 | 普通主管 | 部门内协作 |
| DEPT_AND_CHILD_OR_SELF | 本部门及下级或本人 | 项目经理 | 项目管理 |
| SELF | 仅本人 | 普通员工 | 个人数据 |

## 注解使用

### @DataPermission注解

`@DataPermission`注解用于标记需要进行数据权限过滤的Mapper方法或接口类：

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataPermission {

    /**
     * 数据权限配置数组
     */
    DataColumn[] value();

    /**
     * 权限拼接标识符
     * 如不填，默认 select 用 OR，其他语句用 AND
     */
    String joinStr() default "";
}
```

### @DataColumn注解

`@DataColumn`注解用于配置数据权限的占位符映射关系：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataColumn {

    /**
     * 占位符关键字，默认为 "deptName"
     */
    String[] key() default "deptName";

    /**
     * 占位符替换值，默认为 "dept_id"
     * 对应数据库表中的字段名
     */
    String[] value() default "dept_id";

    /**
     * 权限标识符
     * 拥有此标识符的角色将不会拼接此角色的数据过滤SQL
     */
    String permission() default "";
}
```

### 基本使用示例

#### 在Mapper接口上标注（类级别）

```java
/**
 * 部门Mapper接口
 * 类级别注解会应用到所有方法
 */
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id")
})
public interface SysDeptMapper extends BaseMapper<SysDept> {

    // 所有方法都会应用数据权限过滤
    List<SysDept> selectDeptList(SysDept dept);

    Long countDeptById(Long deptId);
}
```

#### 在Mapper方法上标注（方法级别）

```java
public interface SysDeptMapper extends BaseMapper<SysDept> {

    /**
     * 根据角色ID查询部门列表
     * 方法级别注解优先于类级别
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id")
    })
    List<Long> selectDeptListByRoleId(@Param("roleId") Long roleId);

    // 此方法不会应用数据权限过滤
    SysDept selectDeptById(Long deptId);
}
```

#### 多表联查场景

```java
/**
 * 用户DAO实现类
 * 联表查询时需要指定表别名
 */
@Repository
public class SysUserDaoImpl implements ISysUserDao {

    @Autowired
    private SysUserMapper userMapper;

    /**
     * 分页查询用户列表（联表查询）
     * 需要指定每个字段的表别名
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "d.dept_id"),
        @DataColumn(key = "userName", value = "u.user_id")
    })
    @Override
    public Page<SysUserVo> selectPageUserList(PageQuery pageQuery, SysUserBo bo) {
        // u 是用户表别名，d 是部门表别名
        return userMapper.selectPageUserList(pageQuery.build(), bo);
    }
}
```

### 权限标识符使用

通过`permission`属性，可以让拥有特定权限标识符的用户绕过数据权限过滤：

```java
@DataPermission({
    @DataColumn(
        key = "deptName",
        value = "dept_id",
        permission = "system:user:all"  // 拥有此权限的用户可查看全部数据
    )
})
public interface SysUserMapper extends BaseMapper<SysUser> {

    List<SysUser> selectUserList(SysUser user);
}
```

**使用场景：**
- 某些特殊角色需要跨部门查看数据
- 数据分析岗位需要全量数据访问权限
- 审计人员需要查看所有操作记录

### 联接符配置

`joinStr`属性用于指定多个权限条件的连接方式：

```java
// 默认行为：SELECT 语句用 OR，UPDATE/DELETE 用 AND
@DataPermission(value = {
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "user_id")
})

// 强制使用 AND 连接（更严格的权限控制）
@DataPermission(value = {
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "user_id")
}, joinStr = "AND")

// 强制使用 OR 连接
@DataPermission(value = {
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "user_id")
}, joinStr = "OR")
```

## DataPermissionHelper工具类

### 核心功能

`DataPermissionHelper`提供了数据权限的运行时控制能力：

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class DataPermissionHelper {

    /**
     * 临时禁用数据权限执行操作（无返回值）
     */
    public static void ignore(Runnable handle) {
        enableIgnore();
        try {
            handle.run();
        } finally {
            disableIgnore();
        }
    }

    /**
     * 临时禁用数据权限执行操作（有返回值）
     */
    public static <T> T ignore(Supplier<T> handle) {
        enableIgnore();
        try {
            return handle.get();
        } finally {
            disableIgnore();
        }
    }

    /**
     * 设置上下文变量
     */
    public static void setVariable(String key, Object value) {
        // ...
    }

    /**
     * 获取上下文变量
     */
    public static <T> T getVariable(String key) {
        // ...
    }
}
```

### 忽略权限过滤

在某些特殊场景下，需要临时禁用数据权限过滤：

```java
@Service
public class ReportService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private OrderMapper orderMapper;

    /**
     * 生成全量用户报表
     * 需要统计所有用户数据，忽略数据权限
     */
    public ReportData generateUserReport() {
        // 方式一：使用Lambda表达式（推荐）
        List<User> allUsers = DataPermissionHelper.ignore(() -> {
            return userMapper.selectList(null);
        });

        // 处理报表数据
        return buildReport(allUsers);
    }

    /**
     * 批量处理订单（无返回值）
     */
    public void batchProcessOrders() {
        // 方式一：无返回值的Lambda
        DataPermissionHelper.ignore(() -> {
            orderMapper.updateBatchStatus();
        });

        // 方式二：手动控制（不推荐，容易忘记关闭）
        DataPermissionHelper.enableIgnore();
        try {
            orderMapper.deleteExpiredOrders();
        } finally {
            DataPermissionHelper.disableIgnore();
        }
    }
}
```

### 上下文变量传递

在复杂场景下，可以通过上下文变量传递额外参数：

```java
@Service
public class CustomPermissionService {

    /**
     * 基于自定义规则查询数据
     */
    public List<Data> queryWithCustomRule(Long targetDeptId) {
        // 设置自定义变量
        DataPermissionHelper.setVariable("customDeptId", targetDeptId);
        DataPermissionHelper.setVariable("queryTime", LocalDateTime.now());

        // 执行查询（权限SQL可以使用这些变量）
        return dataMapper.selectList(null);
    }

    /**
     * 获取上下文变量
     */
    public void checkContext() {
        Long deptId = DataPermissionHelper.getVariable("customDeptId");
        LocalDateTime time = DataPermissionHelper.getVariable("queryTime");
        // ...
    }
}
```

## 数据范围服务

### ISysDataScopeService接口

数据范围服务负责获取角色自定义权限和部门层级数据：

```java
public interface ISysDataScopeService {

    /**
     * 获取角色自定义权限数据
     * 返回角色被授权的部门ID集合，格式："1,2,3"
     */
    String getRoleCustom(Long roleId);

    /**
     * 获取部门及以下权限数据
     * 返回部门及其所有子部门的ID集合，格式："1,2,3"
     */
    String getDeptAndChild(Long deptId);
}
```

### 实现类说明

```java
@RequiredArgsConstructor
@Service("sdss")  // Bean名称，用于SpEL表达式中调用
public class SysDataScopeServiceImpl implements ISysDataScopeService {

    private final ISysRoleDeptDao roleDeptDao;
    private final ISysDeptDao deptDao;

    /**
     * 获取角色自定义权限数据
     * 结果会被缓存，缓存key为角色ID
     */
    @Cacheable(cacheNames = CacheNames.SYS_ROLE_CUSTOM, key = "#roleId")
    @Override
    public String getRoleCustom(Long roleId) {
        if (ObjectUtil.isNull(roleId)) {
            return "-1";  // 无权限
        }

        List<SysRoleDept> roleDeptList = roleDeptDao.listByRoleId(roleId);

        if (CollUtil.isNotEmpty(roleDeptList)) {
            return StreamUtils.join(roleDeptList,
                rd -> Convert.toStr(rd.getDeptId()));
        }

        return "-1";
    }

    /**
     * 获取部门及以下权限数据
     * 递归查询所有子部门，包含当前部门
     */
    @Cacheable(cacheNames = CacheNames.SYS_DEPT_AND_CHILD, key = "#deptId")
    @Override
    public String getDeptAndChild(Long deptId) {
        if (ObjectUtil.isNull(deptId)) {
            return "-1";
        }

        // 获取所有子部门ID
        List<Long> deptIds = deptDao.listChildrenDeptIds(deptId);

        // 添加当前部门
        if (!deptIds.contains(deptId)) {
            deptIds.add(deptId);
        }

        if (CollUtil.isNotEmpty(deptIds)) {
            return StreamUtils.join(deptIds, Convert::toStr);
        }

        return "-1";
    }
}
```

### 缓存策略

| 缓存名称 | 缓存Key | 说明 | 失效场景 |
|----------|---------|------|----------|
| `SYS_ROLE_CUSTOM` | 角色ID | 角色自定义部门权限 | 角色权限变更时 |
| `SYS_DEPT_AND_CHILD` | 部门ID | 部门及子部门层级 | 部门结构变更时 |

**缓存清理时机：**
- 修改角色数据权限配置时
- 新增、修改、删除部门时
- 调整部门层级关系时

## 角色数据权限配置

### 管理端配置界面

在系统管理 > 角色管理中，可以为每个角色配置数据权限：

1. **数据范围** - 选择权限类型
   - 全部数据权限
   - 自定义数据权限
   - 本部门数据权限
   - 本部门及以下数据权限
   - 仅本人数据权限

2. **自定义部门** - 当选择"自定义数据权限"时
   - 勾选角色可访问的部门
   - 支持多选
   - 部门数据存储在`sys_role_dept`表

### 数据库表结构

**角色表 sys_role：**

```sql
CREATE TABLE sys_role (
    role_id     BIGINT PRIMARY KEY,
    role_name   VARCHAR(30) NOT NULL,
    role_key    VARCHAR(100) NOT NULL,
    data_scope  CHAR(1) DEFAULT '1',  -- 数据范围：1全部 2自定义 3本部门 4本部门及以下 5仅本人
    -- 其他字段...
);
```

**角色部门关联表 sys_role_dept：**

```sql
CREATE TABLE sys_role_dept (
    role_id  BIGINT NOT NULL,
    dept_id  BIGINT NOT NULL,
    PRIMARY KEY (role_id, dept_id)
);
```

### 配置示例

```sql
-- 创建区域经理角色
INSERT INTO sys_role (role_id, role_name, role_key, data_scope)
VALUES (100, '区域经理', 'area_manager', '2');  -- 自定义权限

-- 配置可访问的部门（华东区、上海分公司、南京分公司）
INSERT INTO sys_role_dept (role_id, dept_id) VALUES (100, 101);
INSERT INTO sys_role_dept (role_id, dept_id) VALUES (100, 102);
INSERT INTO sys_role_dept (role_id, dept_id) VALUES (100, 103);

-- 创建部门主管角色
INSERT INTO sys_role (role_id, role_name, role_key, data_scope)
VALUES (101, '部门主管', 'dept_leader', '4');  -- 本部门及以下

-- 创建普通员工角色
INSERT INTO sys_role (role_id, role_name, role_key, data_scope)
VALUES (102, '普通员工', 'employee', '5');  -- 仅本人
```

## 最佳实践

### 1. 合理规划数据权限粒度

```java
// ✅ 推荐：根据业务需求选择合适的权限粒度

// 场景1：员工管理 - 需要部门和用户双重过滤
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "user_id")
})
public interface SysUserMapper extends BaseMapper<SysUser> {}

// 场景2：部门管理 - 只需要部门过滤
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id")
})
public interface SysDeptMapper extends BaseMapper<SysDept> {}

// 场景3：公共配置 - 不需要数据权限
public interface SysConfigMapper extends BaseMapper<SysConfig> {}
```

### 2. 联表查询正确指定别名

```java
// ✅ 推荐：明确指定表别名，避免字段冲突
@DataPermission({
    @DataColumn(key = "deptName", value = "d.dept_id"),  // 部门表别名 d
    @DataColumn(key = "userName", value = "u.user_id")   // 用户表别名 u
})
public Page<SysUserVo> selectPageUserList(Page<SysUser> page, SysUserBo bo);

// ❌ 避免：不指定别名，可能导致字段歧义
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "user_id")
})
public Page<SysUserVo> selectPageUserList(Page<SysUser> page, SysUserBo bo);
```

### 3. 使用permission属性实现特殊权限

```java
// ✅ 推荐：通过权限标识符实现灵活的权限控制
@DataPermission({
    @DataColumn(
        key = "deptName",
        value = "dept_id",
        permission = "system:data:all"  // 拥有此权限可查看全部
    ),
    @DataColumn(
        key = "userName",
        value = "create_by",
        permission = "system:data:audit"  // 审计权限
    )
})
public interface AuditLogMapper extends BaseMapper<AuditLog> {}
```

### 4. 批量操作时临时禁用权限

```java
@Service
public class DataMigrationService {

    /**
     * 数据迁移任务
     * 需要访问全量数据，临时禁用权限过滤
     */
    @Transactional
    public void migrateData() {
        // ✅ 推荐：使用Lambda方式，自动管理权限状态
        List<OldData> allData = DataPermissionHelper.ignore(() -> {
            return oldDataMapper.selectList(null);
        });

        // 处理迁移逻辑
        for (OldData data : allData) {
            NewData newData = convertData(data);
            DataPermissionHelper.ignore(() -> {
                newDataMapper.insert(newData);
            });
        }
    }
}
```

### 5. 定时任务中的权限处理

```java
@Component
public class StatisticsTask {

    /**
     * 每日统计任务
     * 定时任务无用户上下文，需要特殊处理
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void dailyStatistics() {
        // 方式一：忽略数据权限
        DataPermissionHelper.ignore(() -> {
            // 统计全量数据
            Long totalUsers = userMapper.selectCount(null);
            Long totalOrders = orderMapper.selectCount(null);
            // 保存统计结果
            saveStatistics(totalUsers, totalOrders);
        });

        // 方式二：模拟管理员身份（如果需要记录操作人）
        // LoginHelper.loginByDevice(adminUserId, DeviceType.PC);
        // try {
        //     // 执行业务逻辑
        // } finally {
        //     StpUtil.logout();
        // }
    }
}
```

### 6. 缓存失效处理

```java
@Service
public class SysDeptServiceImpl implements ISysDeptService {

    @Autowired
    private CacheManager cacheManager;

    /**
     * 新增部门
     * 需要清理部门层级缓存
     */
    @Override
    @Transactional
    public Long insertDept(SysDeptBo bo) {
        Long deptId = deptDao.insert(bo);

        // 清理父部门的子部门缓存
        clearDeptCache(bo.getParentId());

        return deptId;
    }

    /**
     * 修改部门
     */
    @Override
    @Transactional
    public int updateDept(SysDeptBo bo) {
        // 清理相关缓存
        clearDeptCache(bo.getDeptId());
        clearDeptCache(bo.getParentId());

        return deptDao.update(bo);
    }

    /**
     * 清理部门缓存
     */
    private void clearDeptCache(Long deptId) {
        Cache cache = cacheManager.getCache(CacheNames.SYS_DEPT_AND_CHILD);
        if (cache != null && deptId != null) {
            cache.evict(deptId);
        }
    }
}
```

### 7. 测试中的权限处理

```java
@SpringBootTest
class UserServiceTest {

    @Autowired
    private UserMapper userMapper;

    /**
     * 测试时需要忽略数据权限
     * 否则可能因无用户上下文导致失败
     */
    @Test
    void testSelectAllUsers() {
        List<User> users = DataPermissionHelper.ignore(() -> {
            return userMapper.selectList(null);
        });

        assertNotNull(users);
        assertTrue(users.size() > 0);
    }

    /**
     * 模拟登录用户进行测试
     */
    @Test
    void testSelectWithPermission() {
        // 模拟登录
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(1L);
        loginUser.setDeptId(100L);
        // 设置角色和权限...

        DataPermissionHelper.setVariable("user", loginUser);

        List<User> users = userMapper.selectList(null);
        // 验证结果符合权限规则
    }
}
```

## 常见问题

### 1. 数据权限不生效

**问题原因：**
- Mapper方法或类未添加`@DataPermission`注解
- 注解配置的key与DataScopeType中的变量不匹配
- 用户是超级管理员或租户管理员（自动跳过权限过滤）

**解决方案：**

```java
// 检查注解配置是否正确
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),  // key必须是deptName或userName
    @DataColumn(key = "userName", value = "user_id")
})

// 检查用户角色的数据范围配置
// 确保角色的data_scope字段值正确（1-6）
```

### 2. 联表查询字段冲突

**问题原因：**
- 多表联查时未指定表别名
- 字段名在多个表中都存在

**解决方案：**

```java
// ✅ 正确：指定表别名
@DataPermission({
    @DataColumn(key = "deptName", value = "u.dept_id"),  // 用户表
    @DataColumn(key = "userName", value = "u.user_id")
})
public List<UserVo> selectUserWithDept();

// SQL中的别名要与注解配置一致
// SELECT u.*, d.dept_name
// FROM sys_user u
// LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
```

### 3. 定时任务无法获取用户信息

**问题原因：**
- 定时任务在独立线程中执行，没有用户上下文
- SaToken的Storage容器未初始化

**解决方案：**

```java
@Scheduled(cron = "0 0 1 * * ?")
public void scheduledTask() {
    // 方式一：忽略数据权限（推荐）
    DataPermissionHelper.ignore(() -> {
        // 执行不需要权限过滤的操作
        doTask();
    });

    // 方式二：捕获异常处理
    try {
        doTask();
    } catch (ServiceException e) {
        if (e.getMessage().contains("无法获取有效的用户身份信息")) {
            log.warn("定时任务无用户上下文，使用ignore模式重试");
            DataPermissionHelper.ignore(() -> doTask());
        }
    }
}
```

### 4. 多角色权限合并问题

**问题原因：**
- 用户拥有多个角色时，权限条件的合并方式不符合预期
- 默认SELECT用OR连接，UPDATE/DELETE用AND连接

**解决方案：**

```java
// 使用joinStr属性明确指定连接方式
@DataPermission(value = {
    @DataColumn(key = "deptName", value = "dept_id")
}, joinStr = "OR")  // 或 "AND"

// 系统会遍历用户的所有角色，为每个角色生成权限SQL
// 然后用joinStr指定的方式连接
// 结果示例（OR连接）：
// (dept_id IN (1,2,3)) OR (dept_id = 100) OR (user_id = 1)
```

### 5. 权限SQL导致查询性能下降

**问题原因：**
- IN条件包含大量值
- 部门层级过深，子部门数量过多
- 缺少合适的索引

**解决方案：**

```sql
-- 1. 确保相关字段有索引
CREATE INDEX idx_user_dept ON sys_user(dept_id);
CREATE INDEX idx_user_create_by ON sys_user(create_by);

-- 2. 优化部门层级结构，避免层级过深

-- 3. 对于大量部门的场景，考虑使用临时表
-- 或者重新设计权限方案
```

### 6. 缓存数据不一致

**问题原因：**
- 修改部门或角色权限后未清理缓存
- 分布式环境下缓存同步问题

**解决方案：**

```java
@Service
public class SysRoleServiceImpl {

    @Autowired
    private CacheManager cacheManager;

    /**
     * 修改角色数据权限
     */
    @Transactional
    public void updateDataScope(Long roleId, String dataScope, List<Long> deptIds) {
        // 更新角色数据范围
        roleMapper.updateDataScope(roleId, dataScope);

        // 更新角色部门关联
        roleDeptMapper.deleteByRoleId(roleId);
        for (Long deptId : deptIds) {
            roleDeptMapper.insert(new SysRoleDept(roleId, deptId));
        }

        // 清理缓存
        Cache cache = cacheManager.getCache(CacheNames.SYS_ROLE_CUSTOM);
        if (cache != null) {
            cache.evict(roleId);
        }

        // 分布式环境下可以发布事件通知其他节点
        // eventPublisher.publishEvent(new RolePermissionChangedEvent(roleId));
    }
}
```

## 扩展与定制

### 自定义数据范围类型

如果预置的六种数据范围不能满足需求，可以扩展`DataScopeType`枚举：

```java
// 注意：枚举不能直接扩展，需要修改源码
// 或者通过自定义ISysDataScopeService实现特殊逻辑

@Service("sdss")
public class CustomDataScopeServiceImpl implements ISysDataScopeService {

    /**
     * 自定义方法：获取跨区域权限
     */
    public String getRegionDepts(String regionCode) {
        // 根据区域编码获取部门列表
        List<Long> deptIds = deptMapper.selectDeptIdsByRegion(regionCode);
        return StreamUtils.join(deptIds, Convert::toStr);
    }
}

// 在DataScopeType中使用（需要修改源码）
CUSTOM_REGION("7", "跨区域权限",
    " #{#deptName} IN ( #{@sdss.getRegionDepts( #user.regionCode )} ) ",
    " 1 = 0 ");
```

### 动态权限规则

通过`DataPermissionHelper`实现动态权限：

```java
@Service
public class DynamicPermissionService {

    /**
     * 根据业务规则动态设置权限
     */
    public List<Order> queryOrders(OrderQuery query) {
        // 根据业务逻辑动态设置权限参数
        if (query.isVip()) {
            // VIP用户可以查看更多数据
            DataPermissionHelper.setVariable("extraDeptIds", "1,2,3,4,5");
        }

        // 设置时间范围限制
        DataPermissionHelper.setVariable("startTime", query.getStartTime());
        DataPermissionHelper.setVariable("endTime", query.getEndTime());

        return orderMapper.selectList(query);
    }
}
```

### 集成外部权限系统

```java
@Service("sdss")
public class ExternalDataScopeServiceImpl implements ISysDataScopeService {

    @Autowired
    private ExternalPermissionClient permissionClient;

    @Override
    public String getRoleCustom(Long roleId) {
        // 从外部权限系统获取角色权限
        List<Long> deptIds = permissionClient.getRolePermissions(roleId);

        if (CollUtil.isNotEmpty(deptIds)) {
            return StreamUtils.join(deptIds, Convert::toStr);
        }
        return "-1";
    }

    @Override
    public String getDeptAndChild(Long deptId) {
        // 从外部系统获取部门层级
        List<Long> deptIds = permissionClient.getDeptHierarchy(deptId);

        if (CollUtil.isNotEmpty(deptIds)) {
            return StreamUtils.join(deptIds, Convert::toStr);
        }
        return "-1";
    }
}
```

## 性能优化建议

### 1. 索引优化

```sql
-- 为数据权限相关字段创建索引
CREATE INDEX idx_dept_id ON business_table(dept_id);
CREATE INDEX idx_create_by ON business_table(create_by);
CREATE INDEX idx_create_dept ON business_table(create_dept);

-- 复合索引（根据实际查询模式）
CREATE INDEX idx_dept_user ON business_table(dept_id, create_by);
```

### 2. 缓存优化

```java
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            // 数据权限缓存TTL设置
            .entryTtl(Duration.ofHours(2));

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withCacheConfiguration(CacheNames.SYS_ROLE_CUSTOM,
                config.entryTtl(Duration.ofMinutes(30)))
            .withCacheConfiguration(CacheNames.SYS_DEPT_AND_CHILD,
                config.entryTtl(Duration.ofHours(1)))
            .build();
    }
}
```

### 3. 批量操作优化

```java
@Service
public class BatchOperationService {

    /**
     * 批量导出数据
     * 避免每条数据都触发权限检查
     */
    public void exportData() {
        // 一次性获取有权限的数据ID
        List<Long> authorizedIds = DataPermissionHelper.ignore(() -> {
            return getAuthorizedDataIds();
        });

        // 分批处理
        Lists.partition(authorizedIds, 1000).forEach(batch -> {
            List<Data> dataList = dataMapper.selectBatchIds(batch);
            exportBatch(dataList);
        });
    }
}
```

## 总结

RuoYi-Plus框架的数据权限系统通过以下核心特性，实现了灵活、高效的数据访问控制：

1. **声明式配置** - 通过注解简化权限配置，降低开发成本
2. **多种权限类型** - 支持从全部到仅本人的多级权限粒度
3. **自动SQL注入** - 基于拦截器自动处理，业务代码无侵入
4. **SpEL表达式** - 提供灵活的权限SQL构建能力
5. **缓存优化** - 权限数据缓存提升查询性能
6. **可控忽略** - 支持特殊场景下临时禁用权限过滤

在实际应用中，需要根据业务需求合理规划数据权限策略，注意性能优化和缓存管理，确保系统既安全又高效。
