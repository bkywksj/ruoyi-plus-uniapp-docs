# MyBatisPlus增强 (mybatis)

## 模块简介

`ruoyi-common-mybatis` 是 Ruoyi-Plus-Uniapp 框架的数据访问增强模块，基于 MyBatis-Plus 进行深度定制和功能扩展。该模块提供了强大的查询增强、数据权限控制、分页支持等功能，极大简化了数据访问层的开发。

## 核心特性

### 🚀 查询增强 (Query Enhancement)
- **PlusQuery**: 字符串列名查询增强器，支持聚合函数和智能条件处理
- **PlusLambdaQuery**: Lambda表达式查询增强器，类型安全的查询构建
- **智能条件处理**: 自动过滤 null 值和空集合，避免无效查询条件

### 🛡️ 数据权限控制 (Data Permission)
- **注解式权限控制**: 通过 `@DataPermission` 注解轻松实现数据权限
- **多种权限类型**: 支持部门权限、角色权限、用户权限等
- **动态权限策略**: 基于当前用户上下文动态生成权限SQL

### 📄 分页增强 (Pagination Enhancement)
- **PageQuery**: 统一的分页查询参数封装
- **PageResult**: 标准化分页结果返回格式
- **自动分页**: 无需手动处理分页逻辑，框架自动注入分页参数

### 🏗️ 三层架构支持 (Three-Layer Architecture)
- **IBaseService**: 通用服务接口，支持 Entity、BO、VO 三层转换
- **BaseServiceImpl**: 基础服务实现类，减少80%样板代码
- **BaseMapperPlus**: 增强的Mapper接口，提供更多便捷方法

### ⚡ 性能优化 (Performance Optimization)
- **字段自动填充**: 创建时间、更新时间、创建人等字段自动填充
- **数据库监控**: 集成数据源监控，实时了解数据库性能
- **SQL注入防护**: 内置SQL注入检测和防护机制

## 模块架构

```text
ruoyi-common-mybatis/
├── annotation/              # 注解定义
│   ├── DataPermission      # 数据权限注解
│   └── DataColumn          # 数据列权限注解
├── aspect/                 # 切面处理
│   └── DataPermissionAspect # 数据权限切面
├── config/                 # 配置类
│   ├── MybatisPlusConfig   # MyBatis-Plus配置
│   └── MyBatisDataSourceMonitor # 数据源监控
├── core/                   # 核心组件
│   ├── domain/             # 领域模型
│   │   ├── BaseEntity      # 基础实体类
│   │   ├── PageQuery       # 分页查询参数
│   │   └── PageResult      # 分页结果封装
│   ├── mapper/             # Mapper接口
│   │   └── BaseMapperPlus  # 增强Mapper基类
│   ├── query/              # 查询增强
│   │   ├── PlusQuery       # 字符串查询增强
│   │   └── PlusLambdaQuery # Lambda查询增强
│   └── service/            # 服务接口
│       ├── IBaseService    # 基础服务接口
│       └── impl/
│           └── BaseServiceImpl # 基础服务实现
├── enums/                  # 枚举定义
│   ├── DataBaseType        # 数据库类型
│   └── DataScopeType       # 数据权限类型
├── handler/                # 处理器
│   ├── InjectionMetaObjectHandler    # 字段自动填充
│   ├── PlusDataPermissionHandler     # 数据权限处理
│   ├── PlusPostInitTableInfoHandler  # 表信息初始化
│   └── MybatisExceptionHandler       # 异常处理
├── helper/                 # 辅助工具
│   ├── DataBaseHelper      # 数据库工具
│   └── DataPermissionHelper # 数据权限工具
└── interceptor/            # 拦截器
    └── PlusDataPermissionInterceptor # 数据权限拦截器
```

## 核心组件详解

### 1. 查询增强器 (Query Enhancement)

#### PlusQuery - 字符串列名查询

```java
// 基础查询
PlusQuery<User> query = PlusQuery.of(User.class)
    .eq("user_name", "张三")
    .like("nick_name", "admin")
    .gt("create_time", DateUtils.beginOfDay(new Date()));

// 聚合查询支持
PlusQuery<User> query = PlusQuery.of(User.class)
    .select("dept_id")
    .sum("age", "total_age")
    .count("*", "user_count")
    .groupBy("dept_id");

// 智能条件处理 - 自动过滤无效值
PlusQuery<User> query = PlusQuery.of(User.class)
    .eq("status", null)     // 自动忽略
    .in("dept_id", List.of()) // 自动忽略
    .between("age", 18, null); // 自动转为 >= 18
```

#### PlusLambdaQuery - Lambda表达式查询

```java
// 类型安全的查询构建
PlusLambdaQuery<User> query = PlusLambdaQuery.of(User.class)
    .eq(User::getUserName, "张三")
    .like(User::getNickName, "admin")
    .gt(User::getCreateTime, DateUtils.beginOfDay(new Date()));

// 链式调用，流畅API
List<User> users = PlusLambdaQuery.of(User.class)
    .eq(User::getStatus, "0")
    .orderByDesc(User::getCreateTime)
    .list();
```

### 2. 三层架构支持 (Three-Layer Architecture)

#### IBaseService - 通用服务接口

```java
/**
 * 用户服务实现三层架构
 * T: User (Entity) - 数据库实体
 * B: UserBo (Business Object) - 业务对象
 * V: UserVo (View Object) - 视图对象
 */
@Service
public class UserServiceImpl extends BaseServiceImpl<UserMapper, User, UserBo, UserVo> 
    implements IUserService {

    // 继承大量通用方法，无需重复实现
    // - get(id) - 根据ID查询并返回VO
    // - list(bo) - 根据BO条件查询并返回VO列表  
    // - page(bo, pageQuery) - 分页查询
    // - add(bo) - 新增
    // - update(bo) - 更新
    // - delete(id) - 删除
}
```

#### 使用示例

```java
@RestController
public class UserController {

    @Autowired
    private IUserService userService;

    // 分页查询用户
    @PostMapping("/page")
    public R<PageResult<UserVo>> page(@RequestBody UserBo bo, PageQuery pageQuery) {
        PageResult<UserVo> result = userService.page(bo, pageQuery);
        return R.ok(result);
    }

    // 新增用户
    @PostMapping
    public R<Long> add(@Validated(AddGroup.class) @RequestBody UserBo bo) {
        Long userId = userService.add(bo);
        return R.ok(userId);
    }

    // 更新用户
    @PutMapping
    public R<Void> update(@Validated(EditGroup.class) @RequestBody UserBo bo) {
        boolean result = userService.update(bo);
        return R.status(result);
    }

    // 删除用户
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        boolean result = userService.delete(id);
        return R.status(result);
    }
}
```

### 3. 数据权限控制 (Data Permission)

#### 注解式权限控制

```java
@Service
public class UserServiceImpl extends BaseServiceImpl<UserMapper, User, UserBo, UserVo> {

    // 部门数据权限 - 只能查看本部门及下级部门数据
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id")
    })
    @Override
    public List<UserVo> list(UserBo bo) {
        return super.list(bo);
    }

    // 用户数据权限 - 只能查看自己创建的数据
    @DataPermission({
        @DataColumn(key = "userName", value = "create_by")
    })
    public List<UserVo> listMyCreated(UserBo bo) {
        return super.list(bo);
    }
}
```

#### 权限配置

```java
// 数据权限类型枚举
public enum DataScopeType {
    ALL(1, "全部数据权限"),
    CUSTOM(2, "自定数据权限"), 
    DEPT(3, "部门数据权限"),
    DEPT_AND_CHILD(4, "部门及以下数据权限"),
    SELF(5, "仅本人数据权限");
}
```

### 4. 分页增强 (Pagination Enhancement)

#### PageQuery - 分页查询参数

```java
public class UserBo extends PageQuery {
    private String userName;
    private String status;
    // ... 其他查询条件
}

// 控制器中使用
@PostMapping("/page") 
public R<PageResult<UserVo>> page(@RequestBody UserBo bo) {
    // 自动处理分页参数，无需手动设置
    PageResult<UserVo> result = userService.page(bo);
    return R.ok(result);
}
```

#### PageResult - 分页结果封装

```java
// 标准分页结果格式
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "records": [...],      // 数据列表
        "total": 100,         // 总记录数
        "size": 10,           // 每页大小
        "current": 1,         // 当前页
        "pages": 10           // 总页数
    }
}
```

### 5. BaseEntity - 基础实体类

```java
@Data
@EqualsAndHashCode(callSuper = false)
public class User extends BaseEntity {
    
    // 业务字段
    private String userName;
    private String nickName;
    private String status;
    
    // BaseEntity 已包含以下通用字段:
    // - id: 主键ID
    // - createDept: 创建部门  
    // - createBy: 创建者
    // - createTime: 创建时间
    // - updateBy: 更新者
    // - updateTime: 更新时间
    // - remark: 备注
    // - version: 乐观锁版本号
    // - delFlag: 删除标志
    // - tenantId: 租户ID
}
```

### 6. 字段自动填充 (Auto Fill)

```java
// 字段自动填充配置
@Component
public class InjectionMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        // 新增时自动填充
        this.strictInsertFill(metaObject, "createTime", Date.class, new Date());
        this.strictInsertFill(metaObject, "createBy", String.class, getLoginUserId());
        this.strictInsertFill(metaObject, "createDept", String.class, getLoginDeptId());
        // ...
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        // 更新时自动填充
        this.strictUpdateFill(metaObject, "updateTime", Date.class, new Date());
        this.strictUpdateFill(metaObject, "updateBy", String.class, getLoginUserId());
        // ...
    }
}
```

## 配置与使用

### 1. 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mybatis</artifactId>
    <version>${ruoyi.version}</version>
</dependency>
```

### 2. 数据库配置

```yaml
# application.yml
spring:
  datasource:
    dynamic:
      primary: master
      strict: false
      datasource:
        master:
          driver-class-name: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://localhost:3306/ruoyi_plus
          username: root
          password: root
```

### 3. MyBatis-Plus配置

```java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        
        // 数据权限插件
        interceptor.addInnerInterceptor(new DataPermissionInterceptor());
        
        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        
        return interceptor;
    }
}
```

## 最佳实践

### 1. 服务层开发

```java
// 继承BaseServiceImpl，获得丰富的通用方法
@Service
public class UserServiceImpl extends BaseServiceImpl<UserMapper, User, UserBo, UserVo> 
    implements IUserService {

    // 只需实现特殊的业务逻辑
    @Override
    public boolean resetPassword(Long userId, String newPassword) {
        return lambdaUpdate()
            .eq(User::getId, userId)
            .set(User::getPassword, SecurityUtils.encryptPassword(newPassword))
            .set(User::getUpdateTime, new Date())
            .update();
    }
    
    // 使用查询增强器构建复杂查询
    @Override
    public List<UserVo> listActiveUsers(String deptId) {
        return of()
            .eq(User::getStatus, "0")
            .eq(User::getDeptId, deptId)
            .orderByDesc(User::getCreateTime)
            .list();
    }
}
```

### 2. 复杂查询构建

```java
// 使用PlusLambdaQuery构建复杂查询
public List<UserVo> searchUsers(UserSearchBo bo) {
    return PlusLambdaQuery.of(User.class)
        .like(StringUtils.isNotBlank(bo.getUserName()), User::getUserName, bo.getUserName())
        .eq(StringUtils.isNotBlank(bo.getStatus()), User::getStatus, bo.getStatus())
        .in(CollUtil.isNotEmpty(bo.getDeptIds()), User::getDeptId, bo.getDeptIds())
        .between(Objects.nonNull(bo.getStartTime()) && Objects.nonNull(bo.getEndTime()),
                User::getCreateTime, bo.getStartTime(), bo.getEndTime())
        .orderByDesc(User::getCreateTime)
        .list();
}
```

### 3. 数据权限使用

```java
// 在Service方法上添加数据权限注解
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "create_by")
})
public PageResult<UserVo> page(UserBo bo, PageQuery pageQuery) {
    // 框架会自动在SQL中添加数据权限条件
    return super.page(bo, pageQuery);
}
```

### 4. 错误处理

```java
// 统一异常处理
@ControllerAdvice
public class MybatisExceptionHandler {

    @ExceptionHandler(DuplicateKeyException.class)
    public R<Void> handleDuplicateKeyException(DuplicateKeyException e) {
        log.error("数据库操作异常", e);
        return R.fail("数据重复，请检查后重试");
    }
    
    @ExceptionHandler(DataAccessException.class)
    public R<Void> handleDataAccessException(DataAccessException e) {
        log.error("数据访问异常", e);
        return R.fail("数据操作失败");
    }
}
```

## 注意事项

### 1. 性能注意事项
- **大量数据查询**: 使用分页查询避免一次性加载过多数据
- **N+1问题**: 合理使用关联查询或批量查询解决
- **索引优化**: 确保查询条件字段建立合适的索引

### 2. 数据权限注意事项  
- **权限范围**: 明确每个数据权限注解的作用范围
- **性能影响**: 数据权限会增加SQL复杂度，注意性能影响
- **权限测试**: 充分测试各种权限场景，确保数据安全

### 3. 事务管理
- **事务边界**: 在Service层方法上合理设置事务边界
- **异常回滚**: 确保异常情况下事务能正确回滚
- **只读事务**: 查询操作使用只读事务提高性能

### 4. 代码规范
- **命名规范**: 遵循Java命名规范，保持代码可读性
- **注释规范**: 重要方法添加完整的JavaDoc注释
- **异常处理**: 合理处理数据访问异常，提供友好的错误信息

通过使用 ruoyi-common-mybatis 模块，可以显著提高数据访问层的开发效率，减少样板代码，同时提供强大的数据权限控制和查询增强功能。
