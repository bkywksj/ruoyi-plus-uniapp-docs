# MyBatisPlus增强 (mybatis)

## 模块简介

`ruoyi-common-mybatis` 是 Ruoyi-Plus-Uniapp 框架的数据访问增强模块，基于 MyBatis-Plus 3.5.16 进行深度定制和功能扩展。该模块提供了强大的查询增强、数据权限控制、分页支持、多数据库兼容等功能，极大简化了数据访问层的开发。

**核心特性:**

- **查询增强器** - PlusQuery 和 PlusLambdaQuery 提供智能条件处理和聚合函数支持
- **数据权限控制** - 通过注解实现细粒度的数据访问控制，支持 SpEL 表达式
- **分页增强** - PageQuery 和 PageResult 提供标准化的分页查询与结果封装
- **增强Mapper** - BaseMapperPlus 提供 Entity-VO 自动转换、批量操作等便捷方法
- **字段自动填充** - 创建时间、更新时间、创建人等字段自动填充
- **多数据库支持** - 自动识别 MySQL、Oracle、PostgreSQL、SQL Server 并生成兼容 SQL
- **ID生成策略** - 基于网卡信息的雪花算法，确保集群环境下 ID 不重复
- **SQL性能分析** - 集成 P6Spy 提供 SQL 执行监控

## 模块架构

```text
ruoyi-common-mybatis/
├── annotation/                          # 注解定义
│   ├── DataPermission.java             # 数据权限组注解
│   └── DataColumn.java                 # 数据列权限注解
├── aspect/                              # 切面处理
│   └── DataPermissionAspect.java       # 数据权限切面
├── config/                              # 配置类
│   ├── MybatisAutoConfiguration.java   # MyBatis-Plus 自动配置
│   └── MyBatisDataSourceMonitor.java   # Anyline 数据源监控器
├── core/                                # 核心组件
│   ├── domain/
│   │   └── BaseEntity.java             # 基础实体类
│   ├── mapper/
│   │   └── BaseMapperPlus.java         # 增强 Mapper 基类
│   ├── page/
│   │   ├── PageQuery.java              # 分页查询参数
│   │   └── PageResult.java             # 分页结果封装
│   ├── query/
│   │   ├── PlusQuery.java              # 字符串列名查询增强
│   │   └── PlusLambdaQuery.java        # Lambda 查询增强
│   └── dao/
│       ├── IBaseDao.java               # 基础 DAO 接口
│       └── impl/BaseDaoImpl.java       # 基础 DAO 实现
├── enums/                               # 枚举定义
│   ├── DataBaseType.java               # 数据库类型枚举
│   └── DataScopeType.java              # 数据权限类型枚举
├── handler/                             # 处理器
│   ├── InjectionMetaObjectHandler.java # 字段自动填充处理器
│   ├── PlusDataPermissionHandler.java  # 数据权限 SQL 处理器
│   ├── PlusPostInitTableInfoHandler.java # 表信息初始化处理器
│   └── MybatisExceptionHandler.java    # MyBatis 异常处理器
├── helper/                              # 辅助工具
│   ├── DataBaseHelper.java             # 数据库工具类
│   └── DataPermissionHelper.java       # 数据权限工具类
└── interceptor/
    └── PlusDataPermissionInterceptor.java # 数据权限拦截器
```

## 自动配置机制

模块通过 `MybatisAutoConfiguration` 类实现自动配置，当引入依赖后自动装配所有组件。

```java
@Slf4j
@AutoConfiguration
@EnableTransactionManagement(proxyTargetClass = true)
@MapperScan("${mybatis-plus.mapperPackage}")
@PropertySource(value = "classpath:common-mybatis.yml", factory = YmlPropertySourceFactory.class)
public class MybatisAutoConfiguration {
    // 自动配置实现
}
```

**自动装配的组件:**

| 组件 | 说明 | Bean 名称 |
|------|------|-----------|
| `MybatisPlusInterceptor` | 拦截器插件链 | mybatisPlusInterceptor |
| `DataPermissionAspect` | 数据权限切面 | dataPermissionAspect |
| `MetaObjectHandler` | 字段自动填充 | metaObjectHandler |
| `IdentifierGenerator` | 雪花ID生成器 | idGenerator |
| `MybatisExceptionHandler` | 异常处理器 | mybatisExceptionHandler |
| `PostInitTableInfoHandler` | 表信息处理器 | postInitTableInfoHandler |
| `DataSourceMonitor` | 数据源监控器 | dataSourceMonitor |

**拦截器执行顺序:**

拦截器的顺序非常重要，系统按以下顺序注册:

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

    // 1. 多租户插件（必须第一位）
    try {
        TenantLineInnerInterceptor tenant = SpringUtils.getBean(TenantLineInnerInterceptor.class);
        interceptor.addInnerInterceptor(tenant);
    } catch (BeansException ignore) {
        // 多租户插件未配置时忽略
    }

    // 2. 数据权限拦截器
    interceptor.addInnerInterceptor(dataPermissionInterceptor());

    // 3. 分页插件
    interceptor.addInnerInterceptor(paginationInnerInterceptor());

    // 4. 乐观锁插件
    interceptor.addInnerInterceptor(optimisticLockerInnerInterceptor());

    return interceptor;
}
```

## 核心组件详解

### 1. 查询增强器

#### PlusQuery - 字符串列名查询

`PlusQuery` 提供基于字符串列名的查询增强，支持聚合函数和智能条件处理。

**核心特性:**

- 自动过滤 null 值和空字符串，避免无效查询条件
- BETWEEN 条件智能降级（单边界值自动转为 `>=` 或 `<=`）
- IN/NOT IN 集合元素自动过滤无效值
- 内置 SQL 注入检查保护
- 完整的聚合函数支持（SUM、MIN、MAX、COUNT、AVG）

```java
// 基础查询 - 自动过滤无效值
PlusQuery<User> query = PlusQuery.of(User.class)
    .eq("user_name", "张三")           // 有效条件
    .eq("status", null)               // 自动忽略
    .like("nick_name", "")            // 自动忽略
    .gt("create_time", startDate);

// 智能 BETWEEN 处理
PlusQuery<User> query = PlusQuery.of(User.class)
    .between("age", 18, null);  // 自动转为 age >= 18

// 聚合查询
PlusQuery<User> query = PlusQuery.of(User.class)
    .select("dept_id")
    .sum("age", "total_age")          // SUM(age) as total_age
    .count("*", "user_count")         // COUNT(*) as user_count
    .groupBy("dept_id");

// 开启 SQL 注入检查
PlusQuery<User> query = PlusQuery.of(User.class)
    .checkSqlInjection()              // 开启检查
    .eq("user_name", userInput);

// 跨数据库兼容的 LIKE 查询（用于非字符串字段）
PlusQuery<User> query = PlusQuery.of(User.class)
    .likeCast("id", "123");           // 将 id 字段转为字符串后模糊匹配
```

#### PlusLambdaQuery - Lambda表达式查询

`PlusLambdaQuery` 提供类型安全的 Lambda 表达式查询，编译期校验字段名称。

```java
// 类型安全的查询构建
PlusLambdaQuery<User> query = PlusLambdaQuery.of(User.class)
    .eq(User::getUserName, "张三")
    .like(User::getNickName, keyword)
    .gt(User::getCreateTime, startDate)
    .orderByDesc(User::getCreateTime);

// 聚合查询
PlusLambdaQuery<User> query = PlusLambdaQuery.of(User.class)
    .sum(User::getAge, User::getTotalAge)
    .count(User::getId, User::getUserCount)
    .groupBy(User::getDeptId);

// 跨数据库兼容的 LIKE 查询
PlusLambdaQuery<User> query = PlusLambdaQuery.of(User.class)
    .likeCast(User::getId, "123");    // 各数据库生成不同SQL

// 与 PlusQuery 相互转换
PlusQuery<User> stringQuery = PlusLambdaQuery.of(User.class)
    .eq(User::getStatus, "0")
    .toQuery();                       // 转为字符串列名查询
```

**跨数据库 LIKE 兼容:**

| 数据库 | 生成的 SQL |
|--------|-----------|
| MySQL | `column LIKE '%value%'` |
| PostgreSQL | `CAST(column AS VARCHAR) LIKE '%value%'` |
| Oracle | `TO_CHAR(column) LIKE '%value%'` |
| SQL Server | `CAST(column AS NVARCHAR(MAX)) LIKE '%value%'` |

### 2. 增强 Mapper 接口

`BaseMapperPlus` 扩展了 MyBatis-Plus 的 BaseMapper，提供丰富的便捷方法。

```java
/**
 * 用户 Mapper 接口
 * @param T - User 实体类
 * @param V - UserVo 视图对象
 */
public interface UserMapper extends BaseMapperPlus<User, UserVo> {
}
```

**核心方法分类:**

#### 查询构造器快捷方法

```java
// 获取 Lambda 查询构造器
PlusLambdaQuery<User> query = userMapper.of()
    .eq(User::getStatus, "0");

// 获取字符串列名查询构造器
PlusQuery<User> query = userMapper.query()
    .eq("status", "0");

// 获取更新构造器
LambdaUpdateWrapper<User> update = userMapper.update()
    .set(User::getStatus, "1");
```

#### 单条查询与转换

```java
// 根据ID查询并自动转换为VO
UserVo userVo = userMapper.getVoById(1L);

// 指定返回类型
UserDetailVo detailVo = userMapper.getVoById(1L, UserDetailVo.class);

// 条件查询单条记录
UserVo userVo = userMapper.getVo(
    Wrappers.lambdaQuery(User.class).eq(User::getUserName, "admin")
);

// 控制多结果时是否抛异常
UserVo userVo = userMapper.getVo(wrapper, false);  // 不抛异常，返回第一条
```

#### 批量查询与转换

```java
// 根据ID集合批量查询
List<UserVo> userVos = userMapper.listVoByIds(Arrays.asList(1L, 2L, 3L));

// 条件查询列表
List<UserVo> userVos = userMapper.listVo(
    Wrappers.lambdaQuery(User.class).eq(User::getStatus, "0")
);

// 查询所有
List<UserVo> allUsers = userMapper.listVo();

// 自定义转换
List<String> userNames = userMapper.mapList(wrapper, obj -> ((User) obj).getUserName());
```

#### 分页查询

```java
// 分页查询并自动转换为VO
IPage<UserVo> page = userMapper.pageVo(
    new Page<>(1, 10),
    Wrappers.lambdaQuery(User.class).eq(User::getStatus, "0")
);

// 指定VO类型
IPage<UserDetailVo> page = userMapper.pageVo(
    new Page<>(1, 10),
    wrapper,
    UserDetailVo.class
);
```

#### 批量操作

```java
// 批量插入
userMapper.batchInsert(userList);

// 带批次大小的批量插入
userMapper.batchInsert(userList, 500);

// 批量更新
userMapper.batchUpdateById(userList);

// 批量插入或更新（智能判断）
userMapper.batchSave(userList);
```

### 3. 基础实体类

`BaseEntity` 提供了通用的审计字段和扩展支持。

```java
@Data
public class BaseEntity implements Serializable {

    /** 搜索值（非数据库字段） */
    @JsonIgnore
    @TableField(exist = false)
    private String searchValue;

    /** 创建部门 */
    @TableField(fill = FieldFill.INSERT, jdbcType = JdbcType.BIGINT)
    private Long createDept;

    /** 创建者 */
    @TableField(fill = FieldFill.INSERT, jdbcType = JdbcType.BIGINT)
    private Long createBy;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT, jdbcType = JdbcType.TIMESTAMP)
    private Date createTime;

    /** 更新者 */
    @TableField(fill = FieldFill.INSERT_UPDATE, jdbcType = JdbcType.BIGINT)
    private Long updateBy;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE, jdbcType = JdbcType.TIMESTAMP)
    private Date updateTime;

    /** 请求参数（非数据库字段） */
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @TableField(exist = false)
    private Map<String, Object> params = new HashMap<>();
}
```

**使用示例:**

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class User extends BaseEntity {

    @TableId(type = IdType.ASSIGN_ID)
    private Long userId;

    private String userName;

    private String nickName;

    private String status;

    // BaseEntity 已包含: createDept, createBy, createTime, updateBy, updateTime
}
```

### 4. 字段自动填充

`InjectionMetaObjectHandler` 实现了字段的自动填充逻辑。

```java
@Slf4j
public class InjectionMetaObjectHandler implements MetaObjectHandler {

    private static final Long DEFAULT_USER_ID = -1L;

    @Override
    public void insertFill(MetaObject metaObject) {
        if (metaObject.getOriginalObject() instanceof BaseEntity baseEntity) {
            // 设置创建时间和更新时间
            Date current = ObjectUtil.defaultIfNull(baseEntity.getCreateTime(), new Date());
            baseEntity.setCreateTime(current);
            baseEntity.setUpdateTime(current);

            // 填充创建人信息
            if (ObjectUtil.isNull(baseEntity.getCreateBy())) {
                LoginUser loginUser = getLoginUser();
                if (ObjectUtil.isNotNull(loginUser)) {
                    baseEntity.setCreateBy(loginUser.getUserId());
                    baseEntity.setUpdateBy(loginUser.getUserId());
                    baseEntity.setCreateDept(loginUser.getDeptId());
                } else {
                    baseEntity.setCreateBy(DEFAULT_USER_ID);
                    baseEntity.setUpdateBy(DEFAULT_USER_ID);
                }
            }
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        if (metaObject.getOriginalObject() instanceof BaseEntity baseEntity) {
            baseEntity.setUpdateTime(new Date());
            Long userId = LoginHelper.getUserId();
            baseEntity.setUpdateBy(userId != null ? userId : DEFAULT_USER_ID);
        }
    }
}
```

### 5. 分页组件

#### PageQuery - 分页查询参数

```java
@Data
public class PageQuery implements Serializable {

    /** 每页大小 */
    private Integer pageSize;

    /** 当前页码 */
    private Integer pageNum;

    /** 排序列（支持多列） */
    private String orderByColumn;

    /** 排序方向（asc/desc） */
    private String isAsc;

    /** 构建 MyBatis-Plus 分页对象 */
    public <T> Page<T> build() {
        Integer pageNum = ObjectUtil.defaultIfNull(getPageNum(), 1);
        Integer pageSize = ObjectUtil.defaultIfNull(getPageSize(), Integer.MAX_VALUE);
        Page<T> page = new Page<>(pageNum, pageSize);

        // 构建排序条件
        List<OrderItem> orderItems = buildOrderItem();
        if (CollUtil.isNotEmpty(orderItems)) {
            page.addOrder(orderItems);
        }
        return page;
    }
}
```

**排序支持:**

```java
// 单字段排序
// {isAsc: "asc", orderByColumn: "id"} → ORDER BY id ASC

// 多字段相同方向排序
// {isAsc: "asc", orderByColumn: "id,createTime"} → ORDER BY id ASC, create_time ASC

// 多字段不同方向排序
// {isAsc: "asc,desc", orderByColumn: "id,createTime"} → ORDER BY id ASC, create_time DESC
```

#### PageResult - 分页结果封装

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class PageResult<T> implements Serializable {

    /** 数据记录列表 */
    private List<T> records;

    /** 总记录数 */
    private long total;

    /** 当前页码 */
    private long current;

    /** 每页大小 */
    private long size;

    /** 是否为最后一页 */
    private boolean last;

    // 静态工厂方法
    public static <T> PageResult<T> of() { ... }
    public static <T> PageResult<T> of(IPage<T> page) { ... }
    public static <T> PageResult<T> of(List<T> records) { ... }
    public static <T> PageResult<T> of(List<T> records, long current, long size) { ... }

    // 数据类型转换
    public <R> PageResult<R> convert(Class<R> targetClass) { ... }
    public <R> PageResult<R> map(Function<T, R> converter) { ... }

    // 分页信息
    public long getPages() { ... }
    public boolean hasPrevious() { ... }
    public boolean hasNext() { ... }
}
```

**使用示例:**

```java
// 从 MyBatis-Plus 分页对象构建
Page<User> page = userMapper.selectPage(pageQuery.build(), wrapper);
PageResult<UserVo> result = PageResult.of(page).convert(UserVo.class);

// 手动分页
List<User> allUsers = userMapper.selectList(null);
PageResult<User> result = PageResult.of(allUsers, 1, 10);

// 类型转换
PageResult<UserDetailVo> detailResult = result.map(user -> {
    UserDetailVo vo = new UserDetailVo();
    BeanUtils.copyProperties(user, vo);
    vo.setDeptName(getDeptName(user.getDeptId()));
    return vo;
});
```

## 数据权限控制

### 权限类型枚举

`DataScopeType` 定义了六种数据权限类型，使用 SpEL 表达式构建 SQL 条件。

```java
public enum DataScopeType {

    /** 全部数据权限 */
    ALL("1", "全部数据权限", "", ""),

    /** 自定义数据权限 */
    CUSTOM("2", "自定义数据权限",
        " #{#deptName} IN ( #{@sdss.getRoleCustom( #user.roleId )} ) ",
        " 1 = 0 "),

    /** 部门数据权限 */
    DEPT("3", "部门数据权限",
        " #{#deptName} = #{#user.deptId} ",
        " 1 = 0 "),

    /** 部门及以下数据权限 */
    DEPT_AND_CHILD("4", "部门及以下数据权限",
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} )",
        " 1 = 0 "),

    /** 仅本人数据权限 */
    SELF("5", "仅本人数据权限",
        " #{#userName} = #{#user.userId} ",
        " 1 = 0 "),

    /** 部门及以下或本人 */
    DEPT_AND_CHILD_OR_SELF("6", "部门及以下或本人数据",
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} ) OR #{#userName} = #{#user.userId} ",
        " 1 = 0 ");
}
```

**SpEL 内置变量:**

| 变量 | 说明 |
|------|------|
| `#user` | 当前登录用户信息（LoginUser） |
| `#deptName` | 部门字段占位符 |
| `#userName` | 用户字段占位符 |
| `@sdss` | 系统数据权限服务（ISysDataScopeService） |

### 权限注解使用

#### @DataPermission 注解

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataPermission {

    /** 数据权限配置数组 */
    DataColumn[] value();

    /** 权限拼接标识符（OR 或 AND） */
    String joinStr() default "";
}
```

#### @DataColumn 注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DataColumn {

    /** 占位符关键字，默认 "deptName" */
    String[] key() default "deptName";

    /** 占位符替换值，默认 "dept_id" */
    String[] value() default "dept_id";

    /** 权限标识符（拥有此标识符的角色不拼接数据过滤SQL） */
    String permission() default "";
}
```

**使用示例:**

```java
@Service
public class UserServiceImpl {

    @Autowired
    private UserMapper userMapper;

    // 部门数据权限 - 只能查看本部门数据
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id")
    })
    public List<UserVo> listDeptUsers(UserBo bo) {
        return userMapper.listVo(buildQueryWrapper(bo));
    }

    // 部门及用户权限 - 查看本部门或自己创建的数据
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id"),
        @DataColumn(key = "userName", value = "create_by")
    })
    public List<UserVo> listAccessibleUsers(UserBo bo) {
        return userMapper.listVo(buildQueryWrapper(bo));
    }

    // 多表关联的权限控制
    @DataPermission({
        @DataColumn(key = "deptName", value = "u.dept_id")  // 指定表别名
    })
    public List<UserVo> listWithDept(UserBo bo) {
        return userMapper.selectUserWithDept(bo);
    }

    // 跳过特定权限标识
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id", permission = "system:user:all")
    })
    public List<UserVo> listWithPermissionCheck(UserBo bo) {
        // 拥有 system:user:all 权限的用户不受数据权限限制
        return userMapper.listVo(buildQueryWrapper(bo));
    }
}
```

### 数据权限助手

`DataPermissionHelper` 提供数据权限的工具方法。

```java
// 临时忽略数据权限执行查询
List<User> allUsers = DataPermissionHelper.ignore(() -> {
    return userMapper.selectList(null);
});

// 忽略权限执行无返回值操作
DataPermissionHelper.ignore(() -> {
    userMapper.delete(Wrappers.lambdaQuery(User.class)
        .like(User::getUserName, "test_"));
});

// 设置权限上下文变量
DataPermissionHelper.setVariable("customDeptIds", Arrays.asList(1L, 2L, 3L));

// 获取权限上下文变量
List<Long> deptIds = DataPermissionHelper.getVariable("customDeptIds");
```

## 数据库工具类

`DataBaseHelper` 提供跨数据库兼容的工具方法。

### 数据库类型判断

```java
// 判断当前数据库类型
if (DataBaseHelper.isMySql()) {
    // MySQL 特定逻辑
}

if (DataBaseHelper.isOracle()) {
    // Oracle 特定逻辑
}

if (DataBaseHelper.isPostgreSql()) {
    // PostgreSQL 特定逻辑
}

if (DataBaseHelper.isSqlServer()) {
    // SQL Server 特定逻辑
}

// 获取数据库类型枚举
DataBaseType dbType = DataBaseHelper.getDataBaseType();
```

### 跨数据库 FIND_IN_SET

```java
// 检查值是否在逗号分隔的字段中
String condition = DataBaseHelper.findInSet("100", "role_ids");
// MySQL: find_in_set('100', role_ids) <> 0
// Oracle: instr(','||role_ids||',' , ',100,') <> 0
// PostgreSQL: (select strpos(','||role_ids||',' , ',100,')) <> 0
// SQL Server: charindex(',100,' , ','+role_ids+',') <> 0

// 检查值不在逗号分隔的字段中
String condition = DataBaseHelper.findNotInSet("100", "role_ids");
```

### 字段类型转换

```java
// 将字段转换为字符串类型（用于非字符串字段的 LIKE 查询）
String expr = DataBaseHelper.castToVarchar("id");
// MySQL: id（支持隐式转换）
// PostgreSQL: CAST(id AS VARCHAR)
// Oracle: TO_CHAR(id)
// SQL Server: CAST(id AS NVARCHAR(MAX))

// 判断是否需要显式类型转换
if (DataBaseHelper.needCastForLike()) {
    // 非 MySQL 数据库需要显式转换
}
```

### 数据源管理

```java
// 获取所有数据源名称
List<String> dataSources = DataBaseHelper.getDataSourceNameList();
// 返回: ["master", "slave1", "slave2"]

// 清除数据库类型缓存（数据源配置变更后调用）
DataBaseHelper.clearCache();
```

## 配置指南

### Maven 依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mybatis</artifactId>
</dependency>
```

**模块依赖说明:**

| 依赖 | 说明 |
|------|------|
| `ruoyi-common-core` | 核心模块，提供基础功能 |
| `ruoyi-common-satoken` | 认证模块，提供数据权限支持 |
| `dynamic-datasource` | 动态数据源支持 |
| `mybatis-plus` | MyBatis-Plus 增强功能 |
| `p6spy` | SQL 性能分析 |
| `anyline` | 数据库操作环境支持 |

### 数据源配置

```yaml
spring:
  datasource:
    dynamic:
      # 主数据源
      primary: master
      # 严格匹配数据源
      strict: false
      datasource:
        master:
          type: com.zaxxer.hikari.HikariDataSource
          driver-class-name: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://localhost:3306/ruoyi_plus?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
          username: root
          password: root
        slave:
          type: com.zaxxer.hikari.HikariDataSource
          driver-class-name: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://localhost:3306/ruoyi_plus_slave?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
          username: root
          password: root
```

### MyBatis-Plus 配置

```yaml
mybatis-plus:
  # Mapper 包扫描路径
  mapperPackage: plus.ruoyi.**.mapper
  # Mapper XML 路径
  mapperLocations: classpath*:mapper/**/*Mapper.xml
  # 类型别名包
  typeAliasesPackage: plus.ruoyi.**.domain

  configuration:
    # 驼峰命名转换
    map-underscore-to-camel-case: true
    # 缓存开关
    cache-enabled: true
    # 日志实现
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl

  global-config:
    # 关闭 banner
    banner: false
    db-config:
      # 主键策略：雪花算法
      id-type: ASSIGN_ID
      # 逻辑删除字段
      logic-delete-field: delFlag
      logic-delete-value: 2
      logic-not-delete-value: 0
      # 字段填充策略
      insert-strategy: NOT_NULL
      update-strategy: NOT_NULL
      where-strategy: NOT_NULL
```

### P6Spy SQL 监控

```yaml
# 开发环境开启 SQL 打印
spring:
  datasource:
    dynamic:
      datasource:
        master:
          driver-class-name: com.p6spy.engine.spy.P6SpyDriver
          url: jdbc:p6spy:mysql://localhost:3306/ruoyi_plus
```

```properties
# spy.properties
appender=com.baomidou.mybatisplus.extension.p6spy.P6SpyLogger
logMessageFormat=com.baomidou.mybatisplus.extension.p6spy.P6SpyFormat
modulelist=com.baomidou.mybatisplus.extension.p6spy.MybatisPlusLogFactory,com.p6spy.engine.outage.P6OutageFactory
outagedetection=true
outagedetectioninterval=2
```

## 最佳实践

### 1. 服务层开发规范

```java
@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserMapper userMapper;

    /**
     * 分页查询用户
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id")
    })
    @Override
    public PageResult<UserVo> pageList(UserBo bo, PageQuery pageQuery) {
        // 使用增强查询构造器
        LambdaQueryWrapper<User> wrapper = userMapper.of()
            .eq(User::getStatus, "0")
            .like(User::getUserName, bo.getUserName())
            .between(User::getCreateTime, bo.getBeginTime(), bo.getEndTime())
            .orderByDesc(User::getCreateTime);

        // 执行分页查询并转换
        IPage<UserVo> page = userMapper.pageVo(pageQuery.build(), wrapper);
        return PageResult.of(page);
    }

    /**
     * 新增用户
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long insertUser(UserBo bo) {
        User user = MapstructUtils.convert(bo, User.class);
        // 字段自动填充: createBy, createTime, createDept, updateBy, updateTime
        userMapper.insert(user);
        return user.getUserId();
    }

    /**
     * 批量更新用户状态
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(List<Long> userIds, String status) {
        return userMapper.update()
            .set(User::getStatus, status)
            .in(User::getUserId, userIds)
            .update();
    }
}
```

### 2. 复杂查询构建

```java
/**
 * 多条件动态查询
 */
public List<UserVo> complexQuery(UserSearchBo bo) {
    return userMapper.of()
        // 基础条件 - 自动过滤无效值
        .eq(User::getStatus, bo.getStatus())
        .like(User::getUserName, bo.getUserName())
        .like(User::getNickName, bo.getNickName())

        // 范围查询 - 智能处理单边界值
        .between(User::getCreateTime, bo.getBeginTime(), bo.getEndTime())
        .between(User::getAge, bo.getMinAge(), bo.getMaxAge())

        // 集合条件 - 自动过滤空集合和无效元素
        .in(User::getDeptId, bo.getDeptIds())
        .in(User::getRoleId, bo.getRoleIds())

        // 排序
        .orderByAsc(User::getDeptId)
        .orderByDesc(User::getCreateTime)

        // 执行查询并转换
        .listVo();
}

/**
 * 聚合统计查询
 */
public List<Map<String, Object>> statisticsByDept() {
    return userMapper.query()
        .select("dept_id")
        .count("*", "user_count")
        .sum("age", "total_age")
        .avg("age", "avg_age")
        .groupBy("dept_id")
        .having("count(*) > 5")
        .selectMaps();
}
```

### 3. 数据权限最佳实践

```java
/**
 * 需要数据权限控制的查询
 */
@DataPermission({
    @DataColumn(key = "deptName", value = "d.dept_id"),
    @DataColumn(key = "userName", value = "u.create_by")
})
public List<UserVo> listWithPermission(UserBo bo) {
    return userMapper.selectUserList(bo);
}

/**
 * 系统级查询 - 忽略数据权限
 */
public Long countAllUsers() {
    return DataPermissionHelper.ignore(() -> {
        return userMapper.selectCount(null);
    });
}

/**
 * 定时任务中的查询 - 无用户上下文
 */
@Scheduled(cron = "0 0 1 * * ?")
public void dailyStatistics() {
    // 定时任务无登录用户，需要忽略数据权限
    DataPermissionHelper.ignore(() -> {
        List<User> users = userMapper.selectList(null);
        // 统计处理...
    });
}
```

### 4. 批量操作优化

```java
/**
 * 大批量数据插入
 */
@Transactional(rollbackFor = Exception.class)
public void batchInsertUsers(List<UserBo> boList) {
    List<User> users = MapstructUtils.convert(boList, User.class);

    // 使用分批插入，每批 500 条
    userMapper.batchInsert(users, 500);
}

/**
 * 批量更新或插入
 */
@Transactional(rollbackFor = Exception.class)
public void syncUsers(List<UserBo> boList) {
    List<User> users = MapstructUtils.convert(boList, User.class);

    // 智能判断插入或更新
    userMapper.batchSave(users, 500);
}
```

## 常见问题

### 1. 数据权限不生效

**问题原因:**
- 方法未添加 `@DataPermission` 注解
- 注解中的字段名与实际 SQL 不匹配
- 多租户插件干扰了数据权限处理

**解决方案:**

```java
// 确保注解配置正确
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id")  // 与表字段一致
})
public List<UserVo> list(UserBo bo) {
    // 如果是多表查询，需要指定表别名
    // @DataColumn(key = "deptName", value = "u.dept_id")
    return userMapper.listVo(wrapper);
}
```

### 2. 智能条件处理未生效

**问题原因:**
- 使用了原生的 `QueryWrapper` 或 `LambdaQueryWrapper`
- 条件值为空字符串但不是 null

**解决方案:**

```java
// 使用增强查询器
PlusLambdaQuery<User> query = PlusLambdaQuery.of(User.class)
    .eq(User::getUserName, userName);  // 空字符串自动过滤

// 而不是原生的
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(StringUtils.isNotBlank(userName), User::getUserName, userName);  // 需手动判断
```

### 3. 分页排序 SQL 注入

**问题原因:**
- 排序字段直接拼接到 SQL 中
- 未对排序参数进行校验

**解决方案:**

```java
// PageQuery 内置了 SQL 注入防护
private List<OrderItem> buildOrderItem() {
    // 使用 SqlUtil.escapeOrderBySql 过滤危险字符
    String orderBy = SqlUtil.escapeOrderBySql(orderByColumn);
    // 驼峰转下划线
    orderBy = StringUtils.camelToUnderscore(orderBy);
    // ...
}

// 自定义排序时也要注意
PlusLambdaQuery.of(User.class)
    .checkSqlInjection()  // 开启 SQL 注入检查
    .orderByDesc(User::getCreateTime);  // 使用 Lambda 表达式更安全
```

### 4. 多数据源切换问题

**问题原因:**
- 动态数据源注解位置不正确
- 事务边界影响数据源切换

**解决方案:**

```java
@Service
public class UserServiceImpl {

    // 数据源注解放在方法上
    @DS("slave")
    public List<UserVo> listFromSlave(UserBo bo) {
        return userMapper.listVo(wrapper);
    }

    // 事务内不要切换数据源
    @Transactional
    public void doSomething() {
        // 事务内使用主数据源
        userMapper.insert(user);

        // 不要在这里切换到从库查询
        // userMapper.listVo(wrapper);  // 可能失败
    }
}
```

### 5. 字段自动填充不生效

**问题原因:**
- 实体类未继承 `BaseEntity`
- 使用了原生 SQL 或 XML 中的 SQL
- 字段上缺少 `@TableField(fill = ...)` 注解

**解决方案:**

```java
// 确保实体类继承 BaseEntity
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    // 业务字段...
}

// 如果不继承 BaseEntity，需要手动添加注解
@Data
public class CustomEntity {
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}

// 使用 Mapper 方法而不是原生 SQL
userMapper.insert(user);      // ✓ 会触发自动填充
userMapper.updateById(user);  // ✓ 会触发自动填充

// XML 中的 SQL 不会触发自动填充
// <insert id="customInsert">INSERT INTO ...</insert>  // ✗ 不会填充
```

### 6. 跨数据库兼容问题

**问题原因:**
- 使用了特定数据库的 SQL 语法
- LIKE 查询对非字符串字段不兼容

**解决方案:**

```java
// 使用 DataBaseHelper 生成兼容 SQL
String condition = DataBaseHelper.findInSet(roleId, "role_ids");

// 非字符串字段的 LIKE 查询
PlusLambdaQuery.of(User.class)
    .likeCast(User::getId, "123");  // 自动适配各数据库

// 条件分支处理
if (DataBaseHelper.isMySql()) {
    // MySQL 特定处理
} else if (DataBaseHelper.isPostgreSql()) {
    // PostgreSQL 特定处理
}
```

通过使用 `ruoyi-common-mybatis` 模块，可以显著提高数据访问层的开发效率，减少样板代码，同时提供强大的数据权限控制和查询增强功能。模块的智能条件处理、自动类型转换、多数据库兼容等特性，使开发者能够专注于业务逻辑的实现。
