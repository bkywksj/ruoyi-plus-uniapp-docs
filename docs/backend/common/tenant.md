# 多租户 (tenant)

## 概述

租户插件模块（`ruoyi-common-tenant`）是一个企业级多租户解决方案，提供了数据库、缓存、认证等多个层面的完整租户隔离功能。该模块基于MyBatis-Plus的TenantLineInnerInterceptor实现SQL自动改写，结合Redisson的NameMapper实现Redis键前缀隔离，通过TenantSaTokenDao实现认证数据隔离，确保不同租户的数据完全隔离，避免数据泄露和混淆。

多租户架构是SaaS（Software as a Service）应用的核心技术，通过共享应用实例为多个租户提供服务，同时保证租户间数据的完全隔离。本模块采用"共享数据库、共享Schema、共享表"的轻量级多租户模式，通过在每张表中添加`tenant_id`字段实现逻辑隔离。

## 核心特性

- **数据库隔离** - 基于MyBatis-Plus TenantLineInnerInterceptor自动为SQL添加租户条件
- **缓存隔离** - Redis缓存键和Spring Cache自动添加租户前缀
- **认证隔离** - SaToken认证数据添加全局前缀，确保会话隔离
- **动态租户** - 支持运行时切换租户上下文，线程级别和全局级别
- **忽略机制** - 支持跳过租户过滤的场景，支持重入调用
- **始终生效** - 底层隔离始终启用，`tenant.enable`仅控制业务功能
- **配置灵活** - 支持系统固定排除表和配置文件排除表

## 模块架构

### 目录结构

```text
ruoyi-common-tenant/
├── src/main/java/plus/ruoyi/common/tenant/
│   ├── config/                          # 配置类
│   │   └── TenantAutoConfiguration.java # 自动配置（始终启用）
│   ├── core/                            # 核心组件
│   │   ├── TenantEntity.java            # 多租户实体基类
│   │   └── TenantSaTokenDao.java        # 多租户认证数据层
│   ├── exception/                       # 异常类
│   │   └── TenantException.java         # 多租户异常
│   ├── handle/                          # 处理器
│   │   ├── PlusTenantLineHandler.java   # SQL租户处理器
│   │   └── TenantKeyPrefixHandler.java  # Redis键前缀处理器
│   ├── helper/                          # 工具类
│   │   └── TenantHelper.java            # 租户助手工具类
│   ├── manager/                         # 管理器
│   │   └── TenantSpringCacheManager.java # 多租户缓存管理器
│   └── properties/                      # 配置属性
│       └── TenantProperties.java        # 租户配置属性
├── src/test/java/                       # 测试类
│   └── plus/ruoyi/common/tenant/
│       └── helper/TenantHelperTest.java # TenantHelper单元测试
└── pom.xml                              # Maven配置
```

### 依赖关系

```xml
<dependencies>
    <!-- MyBatis模块 - 提供数据库访问与租户隔离（可选） -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-mybatis</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Redis模块 - 提供缓存支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>
</dependencies>
```

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    TenantHelper                          │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   │    │
│  │  │ isEnable  │  │ getTenantId│  │ ignore/dynamic   │   │    │
│  │  │           │  │           │  │                   │   │    │
│  │  │ 检查开关   │  │ 获取租户ID │  │ 切换租户上下文    │   │    │
│  │  └───────────┘  └───────────┘  └───────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                      Isolation Layer                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  Database       │ │    Redis        │ │   SaToken       │   │
│  │  Isolation      │ │    Isolation    │ │   Isolation     │   │
│  │                 │ │                 │ │                 │   │
│  │PlusTenantLine   │ │TenantKeyPrefix  │ │TenantSaTokenDao │   │
│  │  Handler        │ │  Handler        │ │                 │   │
│  │                 │ │                 │ │                 │   │
│  │ SQL自动改写     │ │ Redis键前缀     │ │ 认证数据前缀    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Storage Layer                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │    MySQL        │ │     Redis       │ │     Redis       │   │
│  │  tenant_id字段  │ │  tenant:key     │ │ global::satoken │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 快速开始

### 1. 添加依赖

在 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-tenant</artifactId>
</dependency>
```

### 2. 配置文件

在 `application.yml` 中添加配置：

```yaml
# 多租户配置
tenant:
  # 是否启用多租户业务功能
  enable: true
  # 排除表列表（这些表不会应用租户过滤）
  excludes:
    - sys_dict_type
    - sys_dict_data
    - sys_config
```

### 3. 数据库设计

在需要租户隔离的表中添加 `tenant_id` 字段：

```sql
CREATE TABLE user_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(20) NOT NULL COMMENT '租户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) COMMENT '邮箱',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id)
) COMMENT='用户信息表';
```

### 4. 实体类配置

继承 `TenantEntity` 类：

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user_info")
public class UserInfo extends TenantEntity {

    /** 主键ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户名 */
    private String username;

    /** 邮箱 */
    private String email;
}
```

## 自动配置详解

### TenantAutoConfiguration

多租户自动配置类，配置所有租户隔离组件，**所有组件始终启用**以确保数据一致性：

```java
@EnableConfigurationProperties(TenantProperties.class)
@AutoConfiguration(after = {RedisAutoConfiguration.class})
public class TenantAutoConfiguration {

    // MyBatis-Plus多租户配置（始终启用）
    @ConditionalOnClass(TenantLineInnerInterceptor.class)
    @AutoConfiguration
    static class MybatisPlusConfiguration {
        @Bean
        public TenantLineInnerInterceptor tenantLineInnerInterceptor(
            TenantProperties tenantProperties) {
            return new TenantLineInnerInterceptor(
                new PlusTenantLineHandler(tenantProperties));
        }
    }

    // Redisson多租户键前缀处理器（始终启用）
    @Bean
    public RedissonAutoConfigurationCustomizer tenantRedissonCustomizer(
        RedissonProperties redissonProperties) {
        return config -> {
            TenantKeyPrefixHandler nameMapper =
                new TenantKeyPrefixHandler(redissonProperties.getKeyPrefix());
            // 设置单机模式或集群模式的NameMapper
            // ...
        };
    }

    // 多租户缓存管理器（始终启用）
    @Primary
    @Bean
    public CacheManager tenantCacheManager() {
        return new TenantSpringCacheManager();
    }

    // 多租户认证数据持久层（始终启用）
    @Primary
    @Bean
    public SaTokenDao tenantSaTokenDao() {
        return new TenantSaTokenDao();
    }
}
```

**设计理念**：

- **底层隔离始终生效** - 数据库、Redis、SaToken的租户隔离始终启用
- **业务开关独立控制** - `tenant.enable`仅控制业务层功能
- **避免数据混乱** - 即使关闭租户功能，数据也有明确的租户归属

## TenantHelper 工具类

### 核心方法

TenantHelper是多租户操作的核心工具类，提供租户相关的所有操作方法：

```java
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class TenantHelper {

    // 动态租户Redis键前缀
    private static final String DYNAMIC_TENANT_KEY =
        GlobalConstants.GLOBAL_REDIS_KEY + "dynamicTenant";

    // 线程本地动态租户存储
    private static final ThreadLocal<String> TEMP_DYNAMIC_TENANT =
        new ThreadLocal<>();

    // 租户忽略重入计数器
    private static final ThreadLocal<Stack<Integer>> REENTRANT_IGNORE =
        ThreadLocal.withInitial(Stack::new);
}
```

### 检查租户状态

```java
// 检查多租户功能是否启用
public static boolean isEnable() {
    return Convert.toBool(SpringUtils.getProperty("tenant.enable"), false);
}
```

### 获取当前租户ID

```java
// 获取当前有效的租户ID
// 优先级：动态租户 > 登录用户租户 > 请求头租户 > 默认租户
public static String getTenantId() {
    // 如果租户功能未开启，直接返回默认租户 保证数据隔离
    if (!isEnable()) {
        return TenantConstants.DEFAULT_TENANT_ID;
    }

    // 优先获取动态租户
    String tenantId = getDynamic();
    if (StringUtils.isBlank(tenantId)) {
        // 从登录用户信息获取
        tenantId = LoginHelper.getTenantId();
    }
    if (StringUtils.isBlank(tenantId)) {
        // 从请求中获取（包含域名识别和请求头获取）
        try {
            tenantId = SpringUtils.getBean(TenantService.class).getTenantIdByRequest();
        } catch (Exception ignored) {
            // 忽略获取请求失败的异常（比如非Web环境）
        }
    }
    return StringUtils.isNotBlank(tenantId) ? tenantId : TenantConstants.DEFAULT_TENANT_ID;
}
```

### 租户ID获取优先级

```
┌─────────────────────────────────────────────────────────────┐
│                  getTenantId() 获取优先级                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 动态租户 (TenantHelper.setDynamic)                       │
│     ↓ 如果为空                                               │
│  2. 登录用户租户 (LoginHelper.getTenantId)                   │
│     ↓ 如果为空                                               │
│  3. 请求租户 (TenantService.getTenantIdByRequest)            │
│     - 域名识别                                               │
│     - 请求头 X-Tenant-Id                                     │
│     ↓ 如果为空                                               │
│  4. 默认租户 (TenantConstants.DEFAULT_TENANT_ID = "000000")  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 忽略租户模式

在某些场景下需要跳过租户过滤，如管理员查看所有租户数据：

```java
// 方式一：使用Runnable（无返回值）
TenantHelper.ignore(() -> {
    // 这里的数据库操作不会添加租户条件
    userService.getAllUsers();
});

// 方式二：使用Supplier（有返回值）
List<User> allUsers = TenantHelper.ignore(() -> {
    return userService.getAllUsers();
});
```

**忽略模式实现原理**：

```java
private static void enableIgnore() {
    IgnoreStrategy ignoreStrategy = getIgnoreStrategy();
    if (ObjectUtil.isNull(ignoreStrategy)) {
        InterceptorIgnoreHelper.handle(
            IgnoreStrategy.builder().tenantLine(true).build());
    } else {
        ignoreStrategy.setTenantLine(true);
    }

    // 重入计数 - 支持嵌套调用
    Stack<Integer> reentrantStack = REENTRANT_IGNORE.get();
    reentrantStack.push(reentrantStack.size() + 1);
}

private static void disableIgnore() {
    IgnoreStrategy ignoreStrategy = getIgnoreStrategy();
    if (ObjectUtil.isNotNull(ignoreStrategy)) {
        // 检查是否还有其他忽略策略
        boolean noOtherIgnoreStrategy =
            !Boolean.TRUE.equals(ignoreStrategy.getDynamicTableName())
            && !Boolean.TRUE.equals(ignoreStrategy.getBlockAttack())
            && !Boolean.TRUE.equals(ignoreStrategy.getIllegalSql())
            && !Boolean.TRUE.equals(ignoreStrategy.getDataPermission())
            && CollectionUtil.isEmpty(ignoreStrategy.getOthers());

        Stack<Integer> reentrantStack = REENTRANT_IGNORE.get();
        boolean empty = reentrantStack.isEmpty() || reentrantStack.pop() == 1;

        if (noOtherIgnoreStrategy && empty) {
            // 清除所有忽略策略
            InterceptorIgnoreHelper.clearIgnoreStrategy();
        } else if (empty) {
            // 只关闭租户忽略
            ignoreStrategy.setTenantLine(false);
        }
    }
}
```

**重入支持**：

```java
// 支持嵌套调用，只有最外层调用时才真正关闭忽略模式
TenantHelper.ignore(() -> {
    // 第一层忽略
    TenantHelper.ignore(() -> {
        // 第二层忽略 - 仍然有效
        userService.doSomething();
    });
    // 第二层结束，但忽略模式仍然有效
    orderService.doSomething();
});
// 最外层结束，忽略模式真正关闭
```

### 动态租户切换

运行时切换到指定租户执行操作：

```java
// 方式一：使用Runnable（无返回值）
TenantHelper.dynamic("tenant123", () -> {
    // 这里的操作都在tenant123租户下执行
    dataService.queryData();
});

// 方式二：使用Supplier（有返回值）
List<Data> data = TenantHelper.dynamic("tenant123", () -> {
    return dataService.queryData();
});

// 方式三：手动控制（线程级别）
TenantHelper.setDynamic("tenant123");
try {
    // 业务代码
} finally {
    TenantHelper.clearDynamic();
}

// 方式四：全局动态租户（存储到Redis，跨请求生效）
TenantHelper.setDynamic("tenant123", true);  // global = true
```

**动态租户存储机制**：

```java
public static void setDynamic(String tenantId, boolean global) {
    if (!isEnable()) {
        return;
    }

    // 未登录或非全局模式，只在线程内生效
    if (!LoginHelper.isLogin() || !global) {
        TEMP_DYNAMIC_TENANT.set(tenantId);
        return;
    }

    // 存储到Redis，跨请求生效（有效期10天）
    String cacheKey = DYNAMIC_TENANT_KEY + ":" + LoginHelper.getUserId();
    RedisUtils.setCacheObject(cacheKey, tenantId, Duration.ofDays(10));
    SaHolder.getStorage().set(cacheKey, tenantId);
}
```

## 数据库租户隔离

### PlusTenantLineHandler

SQL租户处理器，实现MyBatis-Plus的TenantLineHandler接口：

```java
@Slf4j
public class PlusTenantLineHandler implements TenantLineHandler {

    // 系统固定排除表（硬编码，防止用户误配置）
    private static final Set<String> SYSTEM_EXCLUDE_TABLES = Set.of(
        "sys_tenant",           // 租户表
        "sys_tenant_package",   // 租户套餐表
        "sys_gen_table",        // 代码生成表
        "sys_gen_table_column", // 代码生成列
        "sys_menu",             // 菜单表
        "sys_role_menu",        // 角色菜单关联
        "sys_role_dept",        // 角色部门关联
        "sys_user_role",        // 用户角色关联
        "sys_user_post",        // 用户岗位关联
        "sys_oss_config",       // OSS配置表
        "flow_spel"             // 工作流SpEL表
    );

    private final Set<String> excludeTables;

    public PlusTenantLineHandler(TenantProperties tenantProperties) {
        // 合并系统排除表和配置排除表
        this.excludeTables = Stream.concat(
            SYSTEM_EXCLUDE_TABLES.stream(),
            tenantProperties.getExcludes() != null ?
                tenantProperties.getExcludes().stream() : Stream.empty()
        )
        .map(String::toLowerCase)
        .collect(Collectors.toSet());

        log.info("多租户拦截器已启用（始终生效），排除表: {}", excludeTables);
    }

    @Override
    public Expression getTenantId() {
        // 直接使用TenantHelper.getTenantId()，它已经保证返回有效值
        return new StringValue(TenantHelper.getTenantId());
    }

    @Override
    public boolean ignoreTable(String tableName) {
        if (StringUtils.isBlank(tableName)) {
            return true;
        }
        return excludeTables.contains(tableName.toLowerCase());
    }
}
```

### SQL改写示例

**查询语句**：

```sql
-- 原始SQL
SELECT * FROM user_info WHERE status = 1

-- 改写后SQL
SELECT * FROM user_info WHERE status = 1 AND tenant_id = '000000'
```

**插入语句**：

```sql
-- 原始SQL
INSERT INTO user_info (username, email) VALUES ('test', 'test@example.com')

-- 改写后SQL
INSERT INTO user_info (username, email, tenant_id)
VALUES ('test', 'test@example.com', '000000')
```

**更新语句**：

```sql
-- 原始SQL
UPDATE user_info SET email = 'new@example.com' WHERE id = 1

-- 改写后SQL
UPDATE user_info SET email = 'new@example.com'
WHERE id = 1 AND tenant_id = '000000'
```

**删除语句**：

```sql
-- 原始SQL
DELETE FROM user_info WHERE id = 1

-- 改写后SQL
DELETE FROM user_info WHERE id = 1 AND tenant_id = '000000'
```

### 排除表配置

```yaml
tenant:
  enable: true
  excludes:
    # 系统配置表（全局共享）
    - sys_config
    # 字典表（全局共享）
    - sys_dict_type
    - sys_dict_data
    # 地区表（全局共享）
    - sys_area
    # 你的自定义全局表
    - your_global_table
```

## 缓存租户隔离

### TenantKeyPrefixHandler

Redis键前缀处理器，继承KeyPrefixHandler，为Redis键添加租户前缀：

```java
@Slf4j
public class TenantKeyPrefixHandler extends KeyPrefixHandler {

    public TenantKeyPrefixHandler(String keyPrefix) {
        super(keyPrefix);
    }

    @Override
    public String map(String name) {
        if (StringUtils.isBlank(name)) {
            return null;
        }

        try {
            // 检查是否忽略租户处理
            if (InterceptorIgnoreHelper.willIgnoreTenantLine("")) {
                return super.map(name);
            }
        } catch (NoClassDefFoundError ignore) {
            // 某些服务不需要MyBatis-Plus，忽略类找不到的错误
        }

        // 全局键不需要租户前缀
        if (StringUtils.contains(name, GlobalConstants.GLOBAL_REDIS_KEY)) {
            return super.map(name);
        }

        // 获取租户ID（永远不为null）
        String tenantId = TenantHelper.getTenantId();
        log.debug("Redis键添加租户前缀: {} -> {}:{}", name, tenantId, name);

        // 如果已经包含租户前缀，直接返回
        if (StringUtils.startsWith(name, tenantId + StringUtils.EMPTY)) {
            return super.map(name);
        }

        // 添加租户前缀
        return super.map(tenantId + ":" + name);
    }

    @Override
    public String unmap(String name) {
        // 移除租户前缀...
    }
}
```

**Redis键转换示例**：

```
原始键名              转换后键名
user:info:123    →   000000:user:info:123
order:detail:456 →   tenant123:order:detail:456
global::config   →   global::config  (全局键不转换)
```

### TenantSpringCacheManager

Spring Cache多租户缓存管理器：

```java
@Slf4j
public class TenantSpringCacheManager extends PlusSpringCacheManager {

    @Override
    public Cache getCache(String name) {
        // 检查是否忽略租户处理
        if (InterceptorIgnoreHelper.willIgnoreTenantLine("")) {
            return super.getCache(name);
        }

        // 全局缓存不添加租户前缀
        if (StringUtils.contains(name, GlobalConstants.GLOBAL_REDIS_KEY)) {
            return super.getCache(name);
        }

        // 获取租户ID（永远不为null）
        String tenantId = TenantHelper.getTenantId();

        // 如果已经包含租户前缀，直接返回
        if (StringUtils.startsWith(name, tenantId)) {
            return super.getCache(name);
        }

        // 添加租户前缀
        return super.getCache(tenantId + ":" + name);
    }
}
```

**Spring Cache使用示例**：

```java
@Service
public class UserService {

    // 租户级缓存 - 自动添加租户前缀
    @Cacheable(value = "userData", key = "#userId")
    public UserData getUserData(String userId) {
        // 实际缓存键：000000:userData::userId
        return userMapper.selectById(userId);
    }

    // 全局缓存 - 使用global::前缀，不添加租户前缀
    @Cacheable(value = "global::systemConfig", key = "#key")
    public String getSystemConfig(String key) {
        return TenantHelper.ignore(() -> {
            // 实际缓存键：global::systemConfig::key
            return configMapper.selectByKey(key);
        });
    }
}
```

## 认证租户隔离

### TenantSaTokenDao

SaToken认证数据多租户持久层，为所有认证数据添加全局前缀：

```java
public class TenantSaTokenDao extends PlusSaTokenDao {

    @Override
    public String get(String key) {
        return super.get(GlobalConstants.GLOBAL_REDIS_KEY + key);
    }

    @Override
    public void set(String key, String value, long timeout) {
        super.set(GlobalConstants.GLOBAL_REDIS_KEY + key, value, timeout);
    }

    @Override
    public void delete(String key) {
        super.delete(GlobalConstants.GLOBAL_REDIS_KEY + key);
    }

    @Override
    public Object getObject(String key) {
        return super.getObject(GlobalConstants.GLOBAL_REDIS_KEY + key);
    }

    @Override
    public void setObject(String key, Object object, long timeout) {
        super.setObject(GlobalConstants.GLOBAL_REDIS_KEY + key, object, timeout);
    }

    // ... 其他方法同样添加全局前缀
}
```

**认证数据存储示例**：

```
原始键名                    存储键名
satoken:login:token:xxx  →  global::satoken:login:token:xxx
satoken:login:session:1  →  global::satoken:login:session:1
```

## TenantEntity 实体基类

### 类定义

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class TenantEntity extends BaseEntity {

    /**
     * 租户ID
     * 用于标识数据属于哪个租户，实现数据隔离
     */
    private String tenantId;
}
```

### 使用示例

```java
// 租户实体 - 继承TenantEntity
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_info")
public class OrderInfo extends TenantEntity {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String orderNo;

    private BigDecimal amount;

    private Integer status;
}

// 全局实体 - 继承BaseEntity（不需要租户隔离）
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_config")
public class SysConfig extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String configKey;

    private String configValue;
}
```

## TenantException 异常类

```java
public class TenantException extends BaseException {

    @Serial
    private static final long serialVersionUID = 1L;

    public TenantException(String code, Object... args) {
        super("tenant", code, args, null);
    }
}
```

**使用示例**：

```java
if (StringUtils.isBlank(tenantId)) {
    throw new TenantException("tenant.not.found");
}

if (!tenantService.isValidTenant(tenantId)) {
    throw new TenantException("tenant.invalid", tenantId);
}
```

## 配置属性

### TenantProperties

```java
@Data
@ConfigurationProperties(prefix = "tenant")
public class TenantProperties {

    /**
     * 是否启用多租户功能
     */
    private Boolean enable;

    /**
     * 多租户排除表列表
     */
    private List<String> excludes;
}
```

### 完整配置示例

```yaml
# 多租户配置
tenant:
  # 启用多租户功能
  enable: true
  # 排除表配置
  excludes:
    # 系统配置
    - sys_config
    # 字典数据
    - sys_dict_type
    - sys_dict_data
    # 公共通知
    - sys_notice
    # 地区数据
    - sys_area
```

### 租户相关常量

```java
public interface TenantConstants {

    /** 超级管理员ID */
    Long SUPER_ADMIN_ID = 1L;

    /** 超级管理员角色 roleKey */
    String SUPER_ADMIN_ROLE_KEY = "superadmin";

    /** 租户管理员角色 roleKey */
    String TENANT_ADMIN_ROLE_KEY = "admin";

    /** 租户管理员角色名称 */
    String TENANT_ADMIN_ROLE_NAME = "管理员";

    /** 默认租户ID */
    String DEFAULT_TENANT_ID = "000000";
}
```

## 使用场景

### 1. SaaS多租户应用

```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    // 查询当前租户的订单 - 自动添加租户条件
    public List<Order> getCurrentTenantOrders() {
        return orderMapper.selectList(null);
    }

    // 管理员查看所有租户的订单
    public List<Order> getAllTenantsOrders() {
        return TenantHelper.ignore(() -> {
            return orderMapper.selectList(null);
        });
    }

    // 数据迁移：将数据从一个租户转移到另一个租户
    public void migrateData(String fromTenant, String toTenant) {
        // 从源租户获取数据
        List<Order> orders = TenantHelper.dynamic(fromTenant, () -> {
            return orderMapper.selectList(null);
        });

        // 写入目标租户
        TenantHelper.dynamic(toTenant, () -> {
            orders.forEach(order -> {
                order.setId(null); // 清除ID，插入新记录
                orderMapper.insert(order);
            });
        });
    }
}
```

### 2. 多租户报表系统

```java
@Service
public class ReportService {

    @Autowired
    private ReportGenerator reportGenerator;

    // 生成当前租户报表 - 缓存自动添加租户前缀
    @Cacheable(value = "report", key = "#type + ':' + #month")
    public Report generateMonthlyReport(String type, String month) {
        return reportGenerator.generate(type, month);
    }

    // 生成全局报表（所有租户汇总）
    @Cacheable(value = "global::report", key = "#type + ':' + #month")
    public Report generateGlobalReport(String type, String month) {
        return TenantHelper.ignore(() -> {
            return reportGenerator.generateGlobal(type, month);
        });
    }

    // 生成多租户对比报表
    public Map<String, Report> generateCompareReport(List<String> tenantIds) {
        Map<String, Report> reports = new HashMap<>();
        for (String tenantId : tenantIds) {
            Report report = TenantHelper.dynamic(tenantId, () -> {
                return reportGenerator.generate("summary", LocalDate.now().toString());
            });
            reports.put(tenantId, report);
        }
        return reports;
    }
}
```

### 3. 系统管理功能

```java
@Service
public class SystemService {

    @Autowired
    private ConfigMapper configMapper;

    @Autowired
    private TenantConfigMapper tenantConfigMapper;

    // 系统配置管理（全局，不受租户影响）
    public void updateSystemConfig(String key, String value) {
        TenantHelper.ignore(() -> {
            configMapper.updateByKey(key, value);
        });
    }

    // 租户特定配置 - 自动应用租户条件
    public void updateTenantConfig(String key, String value) {
        tenantConfigMapper.updateByKey(key, value);
    }

    // 获取系统配置（带缓存）
    @Cacheable(value = "global::config", key = "#key")
    public String getSystemConfig(String key) {
        return TenantHelper.ignore(() -> {
            return configMapper.selectValueByKey(key);
        });
    }
}
```

### 4. 定时任务处理

```java
@Slf4j
@Component
public class TenantDataSyncTask {

    @Autowired
    private TenantMapper tenantMapper;

    @Autowired
    private DataSyncService dataSyncService;

    // 遍历所有租户执行数据同步
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
    public void syncAllTenantsData() {
        // 获取所有租户
        List<String> tenantIds = TenantHelper.ignore(() -> {
            return tenantMapper.selectAllTenantIds();
        });

        // 逐个租户执行同步
        for (String tenantId : tenantIds) {
            try {
                TenantHelper.dynamic(tenantId, () -> {
                    dataSyncService.syncData();
                });
                log.info("租户[{}]数据同步完成", tenantId);
            } catch (Exception e) {
                log.error("租户[{}]数据同步失败: {}", tenantId, e.getMessage());
            }
        }
    }
}
```

### 5. 消息队列处理

```java
@Slf4j
@Component
public class OrderMessageConsumer {

    @Autowired
    private OrderService orderService;

    @RocketMQMessageListener(
        topic = "order-topic",
        consumerGroup = "order-consumer-group"
    )
    public void onMessage(OrderMessage message) {
        // 消息中携带租户ID
        String tenantId = message.getTenantId();

        // 在指定租户上下文中处理消息
        TenantHelper.dynamic(tenantId, () -> {
            orderService.processOrder(message.getOrderId());
        });
    }
}
```

## 最佳实践

### 1. 数据库设计规范

```sql
-- ✅ 正确：租户表包含tenant_id字段和索引
CREATE TABLE order_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(20) NOT NULL COMMENT '租户ID',
    order_no VARCHAR(32) NOT NULL COMMENT '订单号',
    amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    status TINYINT DEFAULT 0 COMMENT '订单状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_tenant_order_no (tenant_id, order_no)
) COMMENT='订单表';

-- ✅ 正确：全局表不包含tenant_id字段
CREATE TABLE sys_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_config_key (config_key)
) COMMENT='系统配置表';
```

### 2. 实体类设计规范

```java
// ✅ 正确：租户实体继承TenantEntity
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_info")
public class OrderInfo extends TenantEntity {
    // tenantId字段自动继承，无需手动定义
    private Long id;
    private String orderNo;
    private BigDecimal amount;
}

// ✅ 正确：全局实体继承BaseEntity
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_config")
public class SysConfig extends BaseEntity {
    // 不继承TenantEntity，不需要租户隔离
    private Long id;
    private String configKey;
    private String configValue;
}

// ❌ 错误：租户实体手动添加tenantId
@Data
@TableName("order_info")
public class OrderInfo {
    private Long id;
    private String tenantId;  // 应该通过继承获得
}
```

### 3. 服务层设计规范

```java
@Service
public class DataService {

    // ✅ 正确：常规业务方法，自动应用租户过滤
    public List<Order> getOrders() {
        return orderMapper.selectList(null);
    }

    // ✅ 正确：系统管理方法，明确使用忽略模式
    public List<Order> getAllOrdersForAdmin() {
        return TenantHelper.ignore(() -> {
            return orderMapper.selectList(null);
        });
    }

    // ✅ 正确：跨租户操作，使用动态租户
    public void copyData(String fromTenant, String toTenant) {
        List<Order> data = TenantHelper.dynamic(fromTenant, () -> {
            return orderMapper.selectList(null);
        });

        TenantHelper.dynamic(toTenant, () -> {
            data.forEach(order -> {
                order.setId(null);
                orderMapper.insert(order);
            });
        });
    }

    // ❌ 错误：手动拼接租户条件
    public List<Order> getOrdersByTenant(String tenantId) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Order::getTenantId, tenantId);  // 不需要手动添加
        return orderMapper.selectList(wrapper);
    }
}
```

### 4. 缓存使用规范

```java
@Service
public class CacheService {

    // ✅ 正确：租户级缓存，自动添加租户前缀
    @Cacheable(value = "userInfo", key = "#userId")
    public UserInfo getUserInfo(Long userId) {
        return userMapper.selectById(userId);
    }

    // ✅ 正确：全局缓存，使用global::前缀
    @Cacheable(value = "global::systemConfig", key = "#key")
    public String getSystemConfig(String key) {
        return TenantHelper.ignore(() -> {
            return configMapper.selectValueByKey(key);
        });
    }

    // ✅ 正确：清除租户缓存
    @CacheEvict(value = "userInfo", key = "#userId")
    public void updateUser(Long userId, UserInfo user) {
        userMapper.updateById(user);
    }

    // ✅ 正确：清除所有租户的某个缓存
    public void clearAllTenantsCache(String cacheName) {
        TenantHelper.ignore(() -> {
            // 获取所有租户
            List<String> tenantIds = tenantMapper.selectAllIds();
            tenantIds.forEach(tenantId -> {
                RedisUtils.deleteKeys(tenantId + ":" + cacheName + "*");
            });
        });
    }
}
```

### 5. 安全使用规范

```java
@Service
public class SecurityService {

    // ✅ 正确：权限检查后再执行忽略操作
    public List<Order> getAllOrders() {
        // 先检查权限
        if (!SecurityUtils.hasRole("superadmin")) {
            throw new ServiceException("无权限查看所有租户数据");
        }
        return TenantHelper.ignore(() -> {
            return orderMapper.selectList(null);
        });
    }

    // ✅ 正确：跨租户操作需要记录日志
    public void crossTenantOperation(String targetTenant, Runnable operation) {
        String currentTenant = TenantHelper.getTenantId();
        log.info("跨租户操作: {} -> {}", currentTenant, targetTenant);

        TenantHelper.dynamic(targetTenant, operation);

        log.info("跨租户操作完成");
    }

    // ❌ 错误：无权限检查直接忽略租户
    public List<Order> unsafeGetAllOrders() {
        return TenantHelper.ignore(() -> {
            return orderMapper.selectList(null);
        });
    }
}
```

## 常见问题

### 1. 查询不到数据

**问题原因**：
- 当前登录用户的租户ID与数据的tenant_id不匹配
- 表被错误地配置到排除列表
- 未正确设置动态租户

**解决方案**：

```java
// 1. 检查当前租户ID
String tenantId = TenantHelper.getTenantId();
log.info("当前租户ID: {}", tenantId);

// 2. 检查数据的租户ID
Order order = TenantHelper.ignore(() -> {
    return orderMapper.selectById(orderId);
});
log.info("数据租户ID: {}", order.getTenantId());

// 3. 确认是否需要切换租户
if (!tenantId.equals(order.getTenantId())) {
    // 需要在指定租户下操作
    TenantHelper.dynamic(order.getTenantId(), () -> {
        // 业务操作
    });
}
```

### 2. 缓存数据错乱

**问题原因**：
- 全局缓存没有使用 `global::` 前缀
- 在忽略模式下写入了租户缓存
- 缓存键没有正确添加租户前缀

**解决方案**：

```java
// ✅ 正确：全局缓存使用global::前缀
@Cacheable(value = "global::systemConfig", key = "#key")
public String getSystemConfig(String key) {
    return TenantHelper.ignore(() -> {
        return configMapper.selectValueByKey(key);
    });
}

// ✅ 正确：租户缓存不使用global::前缀
@Cacheable(value = "userData", key = "#userId")
public UserData getUserData(Long userId) {
    return userMapper.selectById(userId);
}

// 手动检查Redis键
// 租户缓存：000000:userData::1
// 全局缓存：global::systemConfig::key
```

### 3. 认证会话异常

**问题原因**：
- TenantSaTokenDao未正确注入
- 全局前缀配置不一致
- Redis连接异常

**解决方案**：

```java
// 检查SaTokenDao是否为多租户版本
SaTokenDao saTokenDao = SpringUtils.getBean(SaTokenDao.class);
log.info("SaTokenDao类型: {}", saTokenDao.getClass().getName());
// 应该是: TenantSaTokenDao

// 检查认证数据Redis键
// 正确格式：global::satoken:login:token:xxx
String key = "global::satoken:login:token:" + token;
String value = RedisUtils.getCacheObject(key);
```

### 4. 性能问题

**问题原因**：
- tenant_id字段没有索引
- 大量跨租户查询
- 缓存未命中率高

**解决方案**：

```sql
-- 1. 为tenant_id字段添加索引
ALTER TABLE order_info ADD INDEX idx_tenant_id (tenant_id);

-- 2. 创建复合索引优化常用查询
ALTER TABLE order_info ADD INDEX idx_tenant_status (tenant_id, status);
ALTER TABLE order_info ADD INDEX idx_tenant_create_time (tenant_id, create_time);
```

```java
// 3. 批量操作时使用单次动态租户切换
TenantHelper.dynamic(targetTenant, () -> {
    // 批量操作在同一个租户上下文中执行
    batchInsert(dataList);
});

// 4. 合理使用缓存
@Cacheable(value = "orderList", key = "#status + ':' + #page")
public Page<Order> getOrdersByStatus(Integer status, int page) {
    return orderMapper.selectPage(new Page<>(page, 10),
        new LambdaQueryWrapper<Order>().eq(Order::getStatus, status));
}
```

### 5. 动态租户切换失效

**问题原因**：
- 在异步线程中丢失租户上下文
- 未正确清除动态租户设置
- 嵌套调用时上下文混乱

**解决方案**：

```java
// 1. 异步线程传递租户上下文
String tenantId = TenantHelper.getTenantId();
CompletableFuture.runAsync(() -> {
    TenantHelper.dynamic(tenantId, () -> {
        // 异步任务在正确的租户上下文中执行
        asyncService.doSomething();
    });
});

// 2. 确保使用try-finally清除
TenantHelper.setDynamic("tenant123");
try {
    businessService.doSomething();
} finally {
    TenantHelper.clearDynamic();  // 确保清除
}

// 3. 推荐使用Lambda方式（自动清除）
TenantHelper.dynamic("tenant123", () -> {
    businessService.doSomething();
});  // 自动清除
```

## 调试方法

### 开启SQL日志

```yaml
# 开启MyBatis-Plus SQL日志
logging:
  level:
    com.baomidou.mybatisplus: DEBUG
    plus.ruoyi.common.tenant: DEBUG
```

### 检查租户状态

```java
@RestController
@RequestMapping("/debug/tenant")
public class TenantDebugController {

    @GetMapping("/status")
    public Map<String, Object> getTenantStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enable", TenantHelper.isEnable());
        status.put("currentTenantId", TenantHelper.getTenantId());
        status.put("dynamicTenantId", TenantHelper.getDynamic());
        status.put("loginTenantId", LoginHelper.getTenantId());
        return status;
    }
}
```

### 监控Redis键

```bash
# 查看租户相关键
redis-cli keys "*:userData:*"

# 查看全局键
redis-cli keys "global::*"

# 查看动态租户键
redis-cli keys "global::dynamicTenant:*"
```
