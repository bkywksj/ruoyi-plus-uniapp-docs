# 权限认证 (satoken) 

## 概述

Sa-Token权限认证模块是基于Sa-Token框架的权限认证组件，提供了完整的用户认证与权限控制功能。该模块采用JWT简单模式，结合Caffeine + Redis二级缓存架构，为系统提供高性能、可扩展的权限管理解决方案。

## 核心特性

- **JWT无状态认证**：基于JWT的Token认证，支持分布式部署
- **二级缓存架构**：Caffeine本地缓存 + Redis分布式缓存
- **多用户体系**：支持不同类型用户(PC、APP等)的权限管理
- **多设备支持**：同一用户可在多种设备上登录
- **租户隔离**：支持多租户环境下的用户管理
- **统一异常处理**：友好的认证授权异常响应

## 模块结构

```text
ruoyi-common-satoken/
├── config/
│   └── SaTokenConfig.java              # Sa-Token配置类
├── core/
│   ├── dao/
│   │   └── PlusSaTokenDao.java         # 增强Token存储层
│   └── service/
│       └── SaPermissionImpl.java      # 权限管理实现类
├── handler/
│   └── SaTokenExceptionHandler.java   # 异常处理器
└── utils/
    └── LoginHelper.java               # 登录鉴权助手工具
```

## 依赖配置

### Maven依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-satoken</artifactId>
</dependency>
```

### 核心依赖说明

```xml
<!-- Sa-Token框架 - 提供权限认证核心功能 -->
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-spring-boot3-starter</artifactId>
</dependency>

<!-- Sa-Token JWT集成 - 提供基于JWT的token支持 -->
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-jwt</artifactId>
</dependency>

<!-- Caffeine - 提供本地缓存支持 -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

## 配置说明

### 基础配置

#### 内置配置文件：`common-satoken.yml`

```yaml
# Sa-Token配置
sa-token:
  # 允许动态设置 token 有效期
  dynamic-active-timeout: true
  # 允许从 请求参数 读取 token
  is-read-body: true
  # 允许从 header 读取 token
  is-read-header: true
  # 关闭 cookie 鉴权 从根源杜绝 csrf 漏洞风险
  is-read-cookie: false
  # token前缀
  token-prefix: "Bearer"
```

#### 应用配置文件：`application.yml`

```yaml
################## 安全认证配置 ##################
# Sa-Token配置
sa-token:
  # token名称 (同时也是cookie名称)
  token-name: Authorization
  # 是否允许同一账号并发登录 (为true时允许一起登录, 为false时新登录挤掉旧登录)
  is-concurrent: true
  # 在多人登录同一账号时，是否共用一个token (为true时所有登录共用一个token, 为false时每次登录新建一个token)
  is-share: false
  # jwt秘钥
  jwt-secret-key: xxxxxxxxxxxxxxxx
```

#### 配置项详细说明

| 配置项 | 类型 | 默认值 | 说明 |
|-------|-----|-------|------|
| `token-name` | String | Authorization | Token名称，用于HTTP Header和Cookie |
| `is-concurrent` | Boolean | true | 是否允许同一账号并发登录 |
| `is-share` | Boolean | false | 多人登录同账号时是否共用Token |
| `jwt-secret-key` | String | - | JWT签名密钥，生产环境务必修改 |
| `dynamic-active-timeout` | Boolean | true | 是否允许动态设置Token有效期 |
| `is-read-body` | Boolean | true | 是否从请求体中读取Token |
| `is-read-header` | Boolean | true | 是否从请求头中读取Token |
| `is-read-cookie` | Boolean | false | 是否从Cookie中读取Token |
| `token-prefix` | String | Bearer | Token前缀，用于Header验证 |

### 自动配置

模块通过`SaTokenConfig`类提供自动配置：

```java
@AutoConfiguration
@PropertySource(value = "classpath:common-satoken.yml", factory = YmlPropertySourceFactory.class)
public class SaTokenConfig {
    
    @Bean
    public StpLogic getStpLogicJwt() {
        return new StpLogicJwtForSimple();
    }
    
    @Bean
    public StpInterface stpInterface() {
        return new SaPermissionImpl();
    }
    
    @Bean
    public SaTokenDao saTokenDao() {
        return new PlusSaTokenDao();
    }
    
    @Bean
    public SaTokenExceptionHandler saTokenExceptionHandler() {
        return new SaTokenExceptionHandler();
    }
}
```

## 核心组件

### 1. 增强Token存储层 (PlusSaTokenDao)

采用二级缓存架构，提供高性能Token存储：

```java
public class PlusSaTokenDao implements SaTokenDaoBySessionFollowObject {
    
    // Caffeine本地缓存，5秒过期，容量1000
    private static final Cache<String, Object> CAFFEINE = Caffeine.newBuilder()
        .expireAfterWrite(5, TimeUnit.SECONDS)
        .initialCapacity(100)
        .maximumSize(1000)
        .build();
        
    // 优先从本地缓存获取，未命中则查询Redis
    @Override
    public String get(String key) {
        Object o = CAFFEINE.get(key, k -> RedisUtils.getCacheObject(key));
        return (String) o;
    }
}
```

**性能优化特点**：
- 一级缓存：Caffeine本地缓存，提供毫秒级访问
- 二级缓存：Redis分布式缓存，支持集群数据共享
- 写入时失效本地缓存，保证数据一致性
- 搜索结果缓存，减少重复查询

### 2. 权限管理实现 (SaPermissionImpl)

实现Sa-Token的权限接口，支持两种查询模式：

```java
public class SaPermissionImpl implements StpInterface {
    
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
}
```

### 3. 登录鉴权助手 (LoginHelper)

提供便捷的登录认证和用户信息获取功能：

```java
public class LoginHelper {
    
    // 用户登录
    public static void login(LoginUser loginUser, SaLoginParameter loginParameter) {
        StpUtil.login(loginUser.getLoginId(), loginParameter);
        StpUtil.getTokenSession().set(LOGIN_USER, loginUser);
    }
    
    // 获取当前用户信息
    public static <T extends LoginUser> T getLoginUser() {
        SaSession session = StpUtil.getTokenSession();
        return (T) session.get(LOGIN_USER);
    }
}
```

### 4. 异常处理器 (SaTokenExceptionHandler)

统一处理认证授权异常：

```java
@RestControllerAdvice
public class SaTokenExceptionHandler {
    
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e) {
        return R.fail(HttpStatus.HTTP_FORBIDDEN, "没有访问权限，请联系管理员授权");
    }
    
    @ExceptionHandler(NotLoginException.class)
    public R<Void> handleNotLoginException(NotLoginException e) {
        return R.fail(HttpStatus.HTTP_UNAUTHORIZED, "认证失败，无法访问系统资源");
    }
}
```

## 使用示例

### 用户登录

```java
@Service
public class LoginService {
    
    public String login(String username, String password) {
        // 验证用户信息
        LoginUser loginUser = authenticateUser(username, password);
        
        // 创建登录参数
        SaLoginParameter loginParameter = new SaLoginParameter()
            .setDevice("web")           // 设备类型
            .setTimeout(7200);          // 2小时过期
        
        // 执行登录
        LoginHelper.login(loginUser, loginParameter);
        
        // 返回Token
        return StpUtil.getTokenValue();
    }
}
```

### Token使用方式

根据配置，系统支持多种Token传递方式：

#### 1. HTTP Header方式（推荐）
```javascript
// 前端发送请求时携带Token
fetch('/api/userInfo', {
    headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
    }
})
```

#### 2. 请求参数方式
```javascript
// URL参数方式
fetch('/api/userInfo?Authorization=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...')

// 表单参数方式
const formData = new FormData();
formData.append('Authorization', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...');
```

### 并发登录控制

系统提供灵活的并发登录控制策略：

```java
@Service
public class ConcurrentLoginService {
    
    /**
     * 配置 is-concurrent: true, is-share: false
     * 允许多设备登录，每次登录生成新Token
     */
    public void multiDeviceLogin() {
        // 用户在Web端登录
        LoginHelper.login(loginUser, new SaLoginParameter().setDevice("web"));
        
        // 用户在APP端登录（不会挤掉Web端）
        LoginHelper.login(loginUser, new SaLoginParameter().setDevice("app"));
        
        // 两个Token都有效，互不影响
    }
    
    /**
     * 配置 is-concurrent: false
     * 单一登录，新登录挤掉旧登录
     */
    public void singleLogin() {
        // 第一次登录
        String token1 = login(loginUser);  // Token有效
        
        // 第二次登录会使第一次登录失效
        String token2 = login(loginUser);  // token1失效，token2有效
    }
}
```

### 获取用户信息

```java
@RestController
public class UserController {
    
    @GetMapping("/userInfo")
    public R<LoginUser> getUserInfo() {
        // 获取当前登录用户
        LoginUser loginUser = LoginHelper.getLoginUser();
        
        // 获取用户基本信息
        Long userId = LoginHelper.getUserId();
        String userName = LoginHelper.getUserName();
        String tenantId = LoginHelper.getTenantId();
        
        return R.ok(loginUser);
    }
}
```

### 权限验证

```java
@RestController
public class SystemController {
    
    @GetMapping("/admin/users")
    @SaCheckPermission("system:user:list")  // 权限验证注解
    public R<List<User>> listUsers() {
        // 或者编程式权限验证
        StpUtil.checkPermission("system:user:list");
        
        return R.ok(userService.listUsers());
    }
    
    @GetMapping("/admin/config")
    @SaCheckRole("admin")  // 角色验证注解
    public R<Config> getConfig() {
        // 编程式角色验证
        StpUtil.checkRole("admin");
        
        return R.ok(configService.getConfig());
    }
}
```

### 权限判断

```java
@Service
public class BusinessService {
    
    public void processData() {
        // 判断是否登录
        if (!LoginHelper.isLogin()) {
            throw new ServiceException("请先登录");
        }
        
        // 判断是否为超级管理员
        if (LoginHelper.isSuperAdmin()) {
            // 超级管理员逻辑
            processSuperAdminData();
        } else {
            // 普通用户逻辑
            processNormalUserData();
        }
        
        // 判断是否为租户管理员
        if (LoginHelper.isTenantAdmin()) {
            // 租户管理员逻辑
            processTenantAdminData();
        }
    }
}
```

## 多用户体系支持

### 用户类型和设备支持

```java
// 支持不同用户类型登录
public enum UserType {
    SYS_USER("sys_user", "系统用户"),
    APP_USER("app_user", "应用用户");
    
    public static UserType getUserType(String loginId) {
        return Arrays.stream(values())
            .filter(type -> loginId.startsWith(type.getLoginType()))
            .findFirst()
            .orElse(SYS_USER);
    }
}

// 不同设备类型登录
SaLoginParameter webLogin = new SaLoginParameter().setDevice("web");
SaLoginParameter appLogin = new SaLoginParameter().setDevice("app");
SaLoginParameter miniLogin = new SaLoginParameter().setDevice("mini");
```

### 微信生态集成

```java
// 获取微信相关信息
String appid = LoginHelper.getAppid();       // 微信应用ID
String unionid = LoginHelper.getUnionid();   // 微信UnionID
String openid = LoginHelper.getOpenid();     // 微信OpenID
```

## 性能优化

### 缓存策略

1. **本地缓存**：使用Caffeine缓存热点数据，5秒过期
2. **分布式缓存**：使用Redis存储Token信息，支持集群
3. **读写策略**：读取优先本地缓存，写入失效本地缓存
4. **搜索优化**：缓存搜索结果，避免重复查询

### 性能监控

```java
// Token存储性能统计
public void monitorCachePerformance() {
    CacheStats stats = CAFFEINE.stats();
    log.info("缓存命中率: {}", stats.hitRate());
    log.info("缓存请求次数: {}", stats.requestCount());
    log.info("缓存加载次数: {}", stats.loadCount());
}
```

## 安全配置

### Token安全

- **Token名称**：使用"Authorization"作为Header和Cookie名称
- **前缀验证**：Token必须以"Bearer "开头
- **CSRF防护**：禁用Cookie读取Token，防止CSRF攻击
- **JWT签名**：使用强密钥进行JWT签名验证
- **动态过期**：支持动态调整Token有效期
- **多端隔离**：不同设备Token相互隔离

#### JWT密钥安全要求

```yaml
# 生产环境JWT密钥配置建议
sa-token:
  jwt-secret-key: ${JWT_SECRET_KEY:xxxxxxxxxxxxxxx}  # 使用环境变量
```

**密钥安全建议**：
1. **长度要求**：至少32个字符
2. **复杂性**：包含大小写字母、数字和特殊字符
3. **唯一性**：每个环境使用不同的密钥
4. **保密性**：通过环境变量或配置中心管理
5. **定期更换**：建议定期更换密钥

#### 并发登录安全策略

| 场景 | is-concurrent | is-share | 安全特点 |
|------|--------------|----------|----------|
| 单设备登录 | false | - | 最高安全性，新登录挤掉旧登录 |
| 多设备独立Token | true | false | 平衡安全性，每设备独立Token |
| 多设备共享Token | true | true | 便利性高，安全性较低 |

### 权限控制

- **细粒度权限**：支持菜单级别的权限控制
- **角色权限**：基于角色的权限管理
- **租户隔离**：多租户环境下的数据隔离
- **超级管理员**：系统级别的最高权限

## 异常处理

系统提供三种主要异常的统一处理：

| 异常类型 | HTTP状态码 | 错误信息 |
|---------|-----------|---------|
| NotLoginException | 401 | 认证失败，无法访问系统资源 |
| NotPermissionException | 403 | 没有访问权限，请联系管理员授权 |
| NotRoleException | 403 | 没有访问权限，请联系管理员授权 |

## 最佳实践

### 1. Token管理

```java
// 设置合理的Token过期时间
SaLoginParameter loginParameter = new SaLoginParameter()
    .setTimeout(7200)           // 2小时过期
    .setActiveTimeout(1800);    // 30分钟无操作自动过期

// 主动续期Token
StpUtil.renewTimeout(7200);

// 根据业务场景选择合适的并发登录策略
// 1. 金融类应用：单设备登录
SaLoginParameter singleDevice = new SaLoginParameter()
    .setDevice("web");  // 配合 is-concurrent: false

// 2. 办公类应用：多设备独立Token
SaLoginParameter multiDevice = new SaLoginParameter()
    .setDevice("web");  // 配合 is-concurrent: true, is-share: false

// 3. 社交类应用：多设备共享Token
SaLoginParameter sharedToken = new SaLoginParameter()
    .setDevice("web");  // 配合 is-concurrent: true, is-share: true
```

### 2. 权限验证

```java
// 优先使用注解方式进行权限验证
@SaCheckPermission("system:user:add")
public R<Void> addUser(User user) {
    // 业务逻辑
}

// 复杂权限逻辑使用编程式验证
if (StpUtil.hasPermission("system:user:edit") || LoginHelper.isSuperAdmin()) {
    // 执行编辑操作
}
```

### 3. 异常处理

```java
// 业务层主动检查登录状态
public void businessMethod() {
    if (!LoginHelper.isLogin()) {
        throw new ServiceException("用户未登录");
    }
    // 业务逻辑
}
```

### 4. 缓存使用

```java
// 合理设置缓存过期时间
public void setCacheData(String key, Object value) {
    // 热点数据设置较长过期时间
    RedisUtils.setCacheObject(key, value, Duration.ofHours(1));
}
```

## 扩展指南

### 自定义权限实现

```java
@Component
public class CustomPermissionService implements PermissionService {
    
    @Override
    public Set<String> listMenuPermissions(Long userId) {
        // 自定义权限查询逻辑
        return customPermissionQuery(userId);
    }
    
    @Override
    public Set<String> listRolePermissions(Long userId) {
        // 自定义角色查询逻辑
        return customRoleQuery(userId);
    }
}
```

### 自定义Token存储

```java
@Component
public class CustomSaTokenDao extends PlusSaTokenDao {
    
    @Override
    public String get(String key) {
        // 自定义获取逻辑
        return customGet(key);
    }
    
    @Override
    public void set(String key, String value, long timeout) {
        // 自定义存储逻辑
        customSet(key, value, timeout);
    }
}
```

## 故障排查

### 常见问题

1. **Token无效**
   - 检查Token格式是否正确（Bearer前缀）
   - 检查Token是否过期
   - 检查Redis连接是否正常

2. **权限验证失败**
   - 检查用户是否拥有对应权限
   - 检查权限标识是否正确
   - 检查PermissionService实现是否正确

3. **缓存问题**
   - 检查Caffeine配置是否合理
   - 检查Redis配置是否正确
   - 监控缓存命中率和性能

### 调试建议

```java
// 开启Sa-Token调试日志
logging:
  level:
    cn.dev33.satoken: DEBUG

// 监控Token信息
public void debugToken() {
    log.info("Token值: {}", StpUtil.getTokenValue());
    log.info("登录ID: {}", StpUtil.getLoginId());
    log.info("Token剩余时间: {}", StpUtil.getTokenTimeout());
}
```

## JWT认证模式详解

### JWT简单模式架构

系统采用Sa-Token的JWT简单模式（`StpLogicJwtForSimple`），实现无状态认证：

```java
/**
 * JWT简单模式特点：
 * 1. Token本身包含用户信息，不依赖后端存储
 * 2. 签发时将数据写入Token，校验时从Token读取
 * 3. 适合分布式架构，各节点独立验证
 */
@Bean
public StpLogic getStpLogicJwt() {
    return new StpLogicJwtForSimple();
}
```

### JWT Token结构

```text
JWT Token 组成：
┌─────────────────────────────────────────────────────────────┐
│  Header   │   Payload   │   Signature                       │
│  (头部)    │   (载荷)    │   (签名)                          │
├───────────┼─────────────┼───────────────────────────────────┤
│ {         │ {           │ HMACSHA256(                       │
│  "alg":   │  "tenantId":│   base64(header) + "." +          │
│  "HS256", │  "000000",  │   base64(payload),                │
│  "typ":   │  "userId":  │   secret                          │
│  "JWT"    │  1,         │ )                                 │
│ }         │  "userName":│                                   │
│           │  "admin",   │                                   │
│           │  "deptId":  │                                   │
│           │  100,       │                                   │
│           │  "exp":..., │                                   │
│           │  "iat":...  │                                   │
│           │ }           │                                   │
└───────────┴─────────────┴───────────────────────────────────┘
```

### Token扩展信息

登录时系统自动将关键信息写入Token扩展字段：

```java
public static void login(LoginUser loginUser, SaLoginParameter loginParameter) {
    loginParameter = ObjectUtil.defaultIfNull(loginParameter, new SaLoginParameter());

    // 执行登录并设置扩展信息
    StpUtil.login(loginUser.getLoginId(),
        loginParameter
            .setExtra(TENANT_ID, loginUser.getTenantId())      // 租户ID
            .setExtra(USER_ID, loginUser.getUserId())          // 用户ID
            .setExtra(USER_NAME, loginUser.getUserName())      // 用户名
            .setExtra(DEPT_ID, loginUser.getDeptId())          // 部门ID
            .setExtra(DEPT_NAME, loginUser.getDeptName())      // 部门名称
            .setExtra(DEPT_CATEGORY, loginUser.getDeptCategory()) // 部门类别
    );

    // Session中存储完整用户信息
    StpUtil.getTokenSession().set(LOGIN_USER, loginUser);
}
```

### 扩展字段常量定义

```java
public class LoginHelper {
    /** Session中存储的登录用户信息key */
    public static final String LOGIN_USER = "loginUser";
    /** Token扩展信息中的租户ID key */
    public static final String TENANT_ID = "tenantId";
    /** Token扩展信息中的用户ID key */
    public static final String USER_ID = "userId";
    /** Token扩展信息中的用户名 key */
    public static final String USER_NAME = "userName";
    /** Token扩展信息中的部门ID key */
    public static final String DEPT_ID = "deptId";
    /** Token扩展信息中的部门名称 key */
    public static final String DEPT_NAME = "deptName";
    /** Token扩展信息中的部门类别 key */
    public static final String DEPT_CATEGORY = "deptCategory";
}
```

## 二级缓存架构深度分析

### 缓存层次设计

```text
缓存查询流程：
┌─────────────┐     命中     ┌─────────────┐
│  客户端请求  │─────────────▶│  返回数据   │
└─────┬───────┘              └─────────────┘
      │ 未命中                       ▲
      ▼                              │
┌─────────────┐     命中     ┌───────┴─────┐
│ Caffeine    │─────────────▶│  缓存数据   │
│ (L1本地缓存) │              └─────────────┘
│ 5秒过期     │                      ▲
│ 容量1000    │                      │
└─────┬───────┘                      │
      │ 未命中                       │
      ▼                              │
┌─────────────┐     命中     ┌───────┴─────┐
│  Redis      │─────────────▶│  加载并缓存 │
│ (L2分布式)  │              │  到L1       │
└─────┬───────┘              └─────────────┘
      │ 未命中
      ▼
┌─────────────┐
│  返回 null  │
└─────────────┘
```

### Caffeine缓存配置

```java
public class PlusSaTokenDao implements SaTokenDaoBySessionFollowObject {

    /**
     * Caffeine本地缓存配置
     * - expireAfterWrite(5s): 写入5秒后过期，平衡性能与一致性
     * - initialCapacity(100): 初始容量100，减少扩容开销
     * - maximumSize(1000): 最大容量1000，防止内存溢出
     */
    private static final Cache<String, Object> CAFFEINE = Caffeine.newBuilder()
        .expireAfterWrite(5, TimeUnit.SECONDS)
        .initialCapacity(100)
        .maximumSize(1000)
        .build();
}
```

### 读写策略详解

#### 读取策略

```java
@Override
public String get(String key) {
    // Caffeine.get() 使用加载函数：
    // 1. 先查本地缓存
    // 2. 未命中则执行加载函数查询Redis
    // 3. 将Redis结果存入本地缓存
    Object o = CAFFEINE.get(key, k -> RedisUtils.getCacheObject(key));
    return (String) o;
}

@Override
public Object getObject(String key) {
    // 对象类型同样采用加载函数模式
    Object o = CAFFEINE.get(key, k -> RedisUtils.getCacheObject(key));
    return o;
}
```

#### 写入策略

```java
@Override
public void set(String key, String value, long timeout) {
    if (timeout == 0 || timeout <= NOT_VALUE_EXPIRE) {
        return;
    }

    // 写入Redis
    if (timeout == NEVER_EXPIRE) {
        RedisUtils.setCacheObject(key, value);
    } else {
        RedisUtils.setCacheObject(key, value, Duration.ofSeconds(timeout));
    }

    // 关键：写入后失效本地缓存，保证一致性
    CAFFEINE.invalidate(key);
}
```

#### 更新策略

```java
@Override
public void update(String key, String value) {
    // 保持原过期时间的更新
    if (RedisUtils.hasKey(key)) {
        RedisUtils.setCacheObject(key, value, true);  // true表示保持TTL
        CAFFEINE.invalidate(key);  // 失效本地缓存
    }
}
```

#### 删除策略

```java
@Override
public void delete(String key) {
    if (RedisUtils.deleteObject(key)) {
        CAFFEINE.invalidate(key);  // 双删保证一致性
    }
}
```

### 过期时间精度补偿

```java
@Override
public long getTimeout(String key) {
    long timeout = RedisUtils.getTimeToLive(key);
    // Sa-Token使用秒，Redis返回毫秒
    // 加1秒补偿精度损失，防止边界条件问题
    return timeout < 0 ? timeout : timeout / 1000 + 1;
}
```

### 搜索结果缓存

```java
@Override
public List<String> searchData(String prefix, String keyword, int start, int size, boolean sortType) {
    String keyStr = prefix + "*" + keyword + "*";

    // 搜索结果也缓存到Caffeine，减少重复搜索
    return (List<String>) CAFFEINE.get(keyStr, k -> {
        Collection<String> keys = RedisUtils.keys(keyStr);
        List<String> list = new ArrayList<>(keys);
        return SaFoxUtil.searchList(list, start, size, sortType);
    });
}
```

## 权限查询机制详解

### 权限接口实现

系统实现`StpInterface`接口，支持两种查询模式：

```java
public class SaPermissionImpl implements StpInterface {

    /**
     * 获取用户菜单权限列表
     *
     * 支持两种查询方式：
     * 1. 当前用户权限：从登录用户信息中直接获取
     * 2. 跨用户权限查询：通过PermissionService查询指定用户权限
     */
    @Override
    public List<String> getPermissionList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();

        // 判断是否为跨用户权限查询
        if (ObjectUtil.isNull(loginUser) || !loginUser.getLoginId().equals(loginId)) {
            return getPermissionFromService(loginId);
        }

        // 当前用户权限查询：直接从Session获取
        return new ArrayList<>(loginUser.getMenuPermission());
    }
}
```

### 权限查询流程

```text
权限查询决策流程：
┌─────────────────────────────────────────┐
│           StpUtil.hasPermission()       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     SaPermissionImpl.getPermissionList  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         ┌────────┴────────┐
         │ 是当前登录用户？ │
         └────────┬────────┘
              ┌───┴───┐
              │       │
            是│       │否
              ▼       ▼
┌─────────────────┐ ┌─────────────────────┐
│ LoginUser对象   │ │ PermissionService   │
│ .getMenuPerm()  │ │ .listMenuPerms()    │
└─────────────────┘ └─────────────────────┘
```

### 跨用户权限查询

```java
/**
 * 通过PermissionService查询指定用户的菜单权限
 * 适用于：A用户查询B用户的权限
 */
private List<String> getPermissionFromService(Object loginId) {
    PermissionService permissionService = getPermissionService();
    if (ObjectUtil.isNotNull(permissionService)) {
        // 解析loginId获取真实的用户ID
        // loginId格式："userType:userId"，如 "pc_user:1"
        List<String> list = StringUtils.splitToList(loginId.toString(), ":");
        Long userId = Long.parseLong(list.get(1));
        return new ArrayList<>(permissionService.listMenuPermissions(userId));
    } else {
        throw ServiceException.of("PermissionService 实现类不存在");
    }
}
```

### LoginId格式说明

```java
/**
 * LoginId 采用 "userType:userId" 格式
 *
 * 示例：
 * - pc_user:1      -> PC用户，ID为1
 * - app_user:100   -> APP用户，ID为100
 * - openapi_user:500 -> OpenAPI用户，ID为500
 */
public enum UserType {
    PC_USER("pc_user", "PC用户"),
    APP_USER("app_user", "APP用户"),
    OPENAPI_USER("openapi_user", "OpenAPI用户");

    public static UserType getUserType(String loginId) {
        return Arrays.stream(values())
            .filter(type -> loginId.startsWith(type.getLoginType()))
            .findFirst()
            .orElse(PC_USER);
    }
}
```

## 登录参数详解

### SaLoginParameter参数

```java
/**
 * Sa-Token登录参数配置
 */
public class LoginParameterExample {

    public void loginWithFullParams(LoginUser loginUser) {
        SaLoginParameter loginParameter = new SaLoginParameter()
            // 设备类型：用于多设备登录控制
            .setDevice("web")
            // Token有效期（秒）：0表示使用默认值
            .setTimeout(7200)
            // Token最低活跃频率（秒）：在此时间内无操作则Token失效
            .setActiveTimeout(1800)
            // 是否记住我：true时Token有效期延长
            .setIsLastingCookie(false)
            // Token前缀：自定义Token命名前缀
            .setTokenPrefix("Bearer")
            // 扩展信息：自定义写入Token的数据
            .setExtra("customKey", "customValue");

        LoginHelper.login(loginUser, loginParameter);
    }
}
```

### 设备类型控制

```java
/**
 * 不同设备类型的登录隔离
 */
public class DeviceLoginExample {

    /**
     * Web端登录
     */
    public String webLogin(LoginUser loginUser) {
        SaLoginParameter webParam = new SaLoginParameter()
            .setDevice("web")
            .setTimeout(7200);     // 2小时
        LoginHelper.login(loginUser, webParam);
        return StpUtil.getTokenValue();
    }

    /**
     * APP端登录
     */
    public String appLogin(LoginUser loginUser) {
        SaLoginParameter appParam = new SaLoginParameter()
            .setDevice("app")
            .setTimeout(604800);   // 7天
        LoginHelper.login(loginUser, appParam);
        return StpUtil.getTokenValue();
    }

    /**
     * 小程序端登录
     */
    public String miniLogin(LoginUser loginUser) {
        SaLoginParameter miniParam = new SaLoginParameter()
            .setDevice("mini")
            .setTimeout(2592000);  // 30天
        LoginHelper.login(loginUser, miniParam);
        return StpUtil.getTokenValue();
    }
}
```

### 活跃超时控制

```java
/**
 * Token活跃超时机制
 * 用户在activeTimeout时间内无操作则Token失效
 */
public class ActiveTimeoutExample {

    public void loginWithActiveTimeout(LoginUser loginUser) {
        SaLoginParameter param = new SaLoginParameter()
            .setDevice("web")
            .setTimeout(86400)        // Token有效期：24小时
            .setActiveTimeout(1800);  // 活跃超时：30分钟无操作则失效

        LoginHelper.login(loginUser, param);
    }

    /**
     * 手动续签Token活跃时间
     */
    public void renewActive() {
        // 更新Token活跃时间为指定秒数
        StpUtil.renewTimeout(7200);
    }
}
```

## 异常处理详解

### 异常处理器实现

```java
@Slf4j
@RestControllerAdvice
@Order(1)  // 优先级高于全局异常处理器
public class SaTokenExceptionHandler {

    @Autowired(required = false)
    private MenuService menuService;

    /**
     * 处理权限码校验失败异常
     * 增强功能：查询权限对应的菜单名称，提供更友好的错误提示
     */
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e,
                                                 HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String permission = e.getPermission();

        log.error("请求地址'{}',权限码校验失败,缺少权限'{}'", requestUri, permission);

        // 查询权限对应的菜单名称
        String menuName = null;
        if (menuService != null && StringUtils.isNotBlank(permission)) {
            try {
                menuName = menuService.getMenuNameByPerms(permission);
            } catch (Exception ex) {
                log.warn("查询权限[{}]对应的菜单名称失败: {}", permission, ex.getMessage());
            }
        }

        // 构建错误消息：包含菜单名称和权限码
        String message = MessageUtils.message(I18nKeys.Permission.NO_ACCESS,
                                               menuName, permission);
        return R.fail(HttpStatus.HTTP_FORBIDDEN, message);
    }
}
```

### 异常类型详解

| 异常类型 | 触发场景 | HTTP状态码 | 处理方式 |
|---------|---------|-----------|---------|
| `NotLoginException` | Token无效/过期/未提供 | 401 | 引导用户重新登录 |
| `NotPermissionException` | 缺少权限码 | 403 | 显示缺少的权限名称 |
| `NotRoleException` | 缺少角色权限 | 403 | 提示联系管理员 |
| `DisableServiceException` | 账号被封禁 | 403 | 显示封禁原因和时间 |
| `NotSafeException` | 二次认证失败 | 401 | 引导进行二次认证 |

### NotLoginException类型细分

```java
/**
 * 未登录异常的详细类型
 */
public class NotLoginExceptionDetails {

    public void handleNotLogin(NotLoginException e) {
        String type = e.getType();

        switch (type) {
            case NotLoginException.NOT_TOKEN:
                // 未提供Token
                log.error("请求未携带Token");
                break;
            case NotLoginException.INVALID_TOKEN:
                // Token无效
                log.error("Token无效或已被篡改");
                break;
            case NotLoginException.TOKEN_TIMEOUT:
                // Token已过期
                log.error("Token已过期，请重新登录");
                break;
            case NotLoginException.BE_REPLACED:
                // 被踢下线
                log.error("账号在其他设备登录，当前Token被踢出");
                break;
            case NotLoginException.KICK_OUT:
                // 被强制注销
                log.error("账号被管理员强制下线");
                break;
            default:
                log.error("未知的登录异常类型: {}", type);
        }
    }
}
```

## 用户信息获取详解

### 多来源获取策略

```java
/**
 * 获取当前登录用户信息
 *
 * 支持两种场景：
 * 1. 普通登录：从 Token Session 获取
 * 2. OpenAPI 请求：从请求上下文 Storage 获取
 */
@SuppressWarnings("unchecked cast")
public static <T extends LoginUser> T getLoginUser() {
    // 优先从 Storage 获取（OpenAPI 场景）
    try {
        T user = (T) SaHolder.getStorage().get(LOGIN_USER);
        if (user != null) {
            return user;
        }
    } catch (Exception ignored) {
        // Storage 不可用时忽略
    }

    // 从 Token Session 获取（普通登录场景）
    SaSession session = StpUtil.getTokenSession();
    if (ObjectUtil.isNull(session)) {
        return null;
    }
    return (T) session.get(LOGIN_USER);
}
```

### 快速属性获取

```java
/**
 * 从Token扩展信息快速获取常用属性
 * 无需加载完整LoginUser对象
 */
public class QuickPropertyAccess {

    // 获取用户ID（从Token扩展信息）
    public Long getUserId() {
        return Convert.toLong(getExtra(USER_ID));
    }

    // 获取用户名（从Token扩展信息）
    public String getUserName() {
        return Convert.toStr(getExtra(USER_NAME));
    }

    // 获取租户ID（从Token扩展信息）
    public String getTenantId() {
        return Convert.toStr(getExtra(TENANT_ID));
    }

    // 获取部门信息（从Token扩展信息）
    public Long getDeptId() {
        return Convert.toLong(getExtra(DEPT_ID));
    }

    public String getDeptName() {
        return Convert.toStr(getExtra(DEPT_NAME));
    }

    public String getDeptCategory() {
        return Convert.toStr(getExtra(DEPT_CATEGORY));
    }

    // 安全获取扩展信息
    private Object getExtra(String key) {
        try {
            return StpUtil.getExtra(key);
        } catch (Exception e) {
            return null;
        }
    }
}
```

### 微信生态信息获取

```java
/**
 * 获取微信相关信息
 * 这些信息存储在LoginUser对象中，需要加载完整对象
 */
public class WechatInfoAccess {

    // 获取微信应用ID
    public static String getAppid() {
        LoginUser loginUser = getLoginUser();
        return loginUser != null ? loginUser.getAppid() : null;
    }

    // 获取微信UnionID（跨应用用户标识）
    public static String getUnionid() {
        LoginUser loginUser = getLoginUser();
        return loginUser != null ? loginUser.getUnionid() : null;
    }

    // 获取微信OpenID（应用内用户标识）
    public static String getOpenid() {
        LoginUser loginUser = getLoginUser();
        return loginUser != null ? loginUser.getOpenid() : null;
    }
}
```

## 管理员判断机制

### 超级管理员判断

```java
/**
 * 超级管理员判断逻辑
 * 超管用户ID固定为1
 */
public class SuperAdminCheck {

    /**
     * 判断指定用户是否为超级管理员
     */
    public static boolean isSuperAdmin(Long userId) {
        return SystemConstants.SUPER_ADMIN_ID.equals(userId);
    }

    /**
     * 判断当前登录用户是否为超级管理员
     */
    public static boolean isSuperAdmin() {
        return isSuperAdmin(getUserId());
    }
}
```

### 租户管理员判断

```java
/**
 * 租户管理员判断逻辑
 * 基于角色权限判断
 */
public class TenantAdminCheck {

    /**
     * 判断是否为租户管理员（基于角色权限集合）
     */
    public static boolean isTenantAdmin(Set<String> rolePermission) {
        if (CollUtil.isEmpty(rolePermission)) {
            return false;
        }
        return rolePermission.contains(TenantConstants.TENANT_ADMIN_ROLE_KEY);
    }

    /**
     * 判断当前用户是否为租户管理员
     */
    public static boolean isTenantAdmin() {
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return false;
        }
        return Convert.toBool(isTenantAdmin(loginUser.getRolePermission()));
    }
}
```

### 角色权限判断

```java
/**
 * 角色权限判断工具方法
 */
public class RoleCheck {

    /**
     * 获取当前用户的角色标识列表
     */
    public static Set<String> getRoleKeys() {
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return Collections.emptySet();
        }
        return loginUser.getRolePermission();
    }

    /**
     * 判断当前用户是否拥有指定角色
     */
    public static boolean hasRole(String roleKey) {
        Set<String> roleKeys = getRoleKeys();
        return roleKeys.contains(roleKey);
    }

    /**
     * 判断当前用户是否拥有任意一个指定角色
     */
    public static boolean hasAnyRole(String... roleKeys) {
        Set<String> userRoleKeys = getRoleKeys();
        for (String roleKey : roleKeys) {
            if (userRoleKeys.contains(roleKey)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断用户角色集合与可见角色集合是否有交集
     */
    public static boolean hasAnyRole(Set<String> userRoles, Set<String> visibleRoles) {
        if (userRoles == null || userRoles.isEmpty()) {
            return false;
        }
        return userRoles.stream().anyMatch(visibleRoles::contains);
    }
}
```

## 模块集成

### Redis模块集成

```java
/**
 * Sa-Token与Redis模块的集成
 * PlusSaTokenDao使用RedisUtils进行数据存储
 */
public class RedisIntegration {

    // Token数据存储
    public void setToken(String key, String value, long timeout) {
        if (timeout == NEVER_EXPIRE) {
            RedisUtils.setCacheObject(key, value);
        } else {
            RedisUtils.setCacheObject(key, value, Duration.ofSeconds(timeout));
        }
    }

    // Token数据获取
    public String getToken(String key) {
        return RedisUtils.getCacheObject(key);
    }

    // Token过期时间查询
    public long getTokenTimeout(String key) {
        return RedisUtils.getTimeToLive(key);
    }

    // Token搜索（支持通配符）
    public Collection<String> searchTokens(String pattern) {
        return RedisUtils.keys(pattern);
    }
}
```

### 租户模块集成

```java
/**
 * Sa-Token与多租户模块的集成
 * 登录时自动设置租户上下文
 */
public class TenantIntegration {

    /**
     * 登录时设置租户信息
     */
    public void login(LoginUser loginUser, SaLoginParameter param) {
        // 租户ID写入Token扩展信息
        param.setExtra(TENANT_ID, loginUser.getTenantId());

        StpUtil.login(loginUser.getLoginId(), param);
    }

    /**
     * 获取当前租户ID
     */
    public String getTenantId() {
        return Convert.toStr(StpUtil.getExtra(TENANT_ID));
    }

    /**
     * 租户隔离的权限查询
     */
    public List<String> getTenantPermissions(Long userId, String tenantId) {
        // 在指定租户上下文中查询权限
        return TenantHelper.dynamic(tenantId, () -> {
            return permissionService.listMenuPermissions(userId);
        });
    }
}
```

### Web模块集成

```java
/**
 * Sa-Token与Web模块的集成
 * 自动处理Token读取和异常响应
 */
public class WebIntegration {

    /**
     * Token读取配置
     * 支持从Header、Body、Cookie读取
     */
    @Configuration
    public class TokenReadConfig {
        // 从Header读取（推荐）
        // Authorization: Bearer xxx

        // 从请求参数读取
        // ?Authorization=xxx

        // Cookie读取已禁用，防止CSRF
    }

    /**
     * 统一响应格式
     */
    @ExceptionHandler(NotLoginException.class)
    public R<Void> handleNotLogin(NotLoginException e) {
        return R.fail(HttpStatus.HTTP_UNAUTHORIZED, "认证失败");
    }
}
```

## 测试策略

### 单元测试示例

```java
/**
 * LoginHelper单元测试
 */
@DisplayName("LoginHelper 登录助手工具类测试")
class LoginHelperTest extends BaseUnitTest {

    @Nested
    @DisplayName("超级管理员判断测试")
    class SuperAdminTests {

        @Test
        @DisplayName("isSuperAdmin(userId) - 超级管理员ID应返回true")
        void testIsSuperAdminWithSuperAdminId() {
            assertTrue(LoginHelper.isSuperAdmin(SystemConstants.SUPER_ADMIN_ID));
        }

        @Test
        @DisplayName("isSuperAdmin(userId) - 普通用户ID应返回false")
        void testIsSuperAdminWithNormalUserId() {
            assertFalse(LoginHelper.isSuperAdmin(2L));
            assertFalse(LoginHelper.isSuperAdmin(100L));
        }

        @Test
        @DisplayName("isSuperAdmin(userId) - null值应返回false")
        void testIsSuperAdminWithNull() {
            assertFalse(LoginHelper.isSuperAdmin(null));
        }
    }

    @Nested
    @DisplayName("租户管理员判断测试")
    class TenantAdminTests {

        @Test
        @DisplayName("isTenantAdmin - 包含admin角色应返回true")
        void testIsTenantAdminWithAdminRole() {
            Set<String> roles = new HashSet<>();
            roles.add(TenantConstants.TENANT_ADMIN_ROLE_KEY);

            assertTrue(LoginHelper.isTenantAdmin(roles));
        }

        @Test
        @DisplayName("isTenantAdmin - 空集合应返回false")
        void testIsTenantAdminWithEmptySet() {
            assertFalse(LoginHelper.isTenantAdmin(new HashSet<>()));
        }
    }
}
```

### Mock测试示例

```java
@Nested
@DisplayName("用户信息获取测试 (Mock)")
class GetLoginUserTests {

    @Test
    @DisplayName("getLoginUser - 从 Storage 获取用户")
    void testGetLoginUserFromStorage() {
        LoginUser mockUser = createMockLoginUser(1L, "000000", "admin");

        try (MockedStatic<SaHolder> saHolderMock = Mockito.mockStatic(SaHolder.class)) {
            var mockStorage = mock(SaStorage.class);
            saHolderMock.when(SaHolder::getStorage).thenReturn(mockStorage);
            when(mockStorage.get(LOGIN_USER)).thenReturn(mockUser);

            LoginUser result = LoginHelper.getLoginUser();

            assertNotNull(result);
            assertEquals(1L, result.getUserId());
        }
    }

    @Test
    @DisplayName("getLoginUser - Storage为空时从Session获取")
    void testGetLoginUserFromSession() {
        LoginUser mockUser = createMockLoginUser(2L, "000001", "testUser");

        try (MockedStatic<SaHolder> saHolderMock = Mockito.mockStatic(SaHolder.class);
             MockedStatic<StpUtil> stpUtilMock = Mockito.mockStatic(StpUtil.class)) {

            var mockStorage = mock(SaStorage.class);
            saHolderMock.when(SaHolder::getStorage).thenReturn(mockStorage);
            when(mockStorage.get(LOGIN_USER)).thenReturn(null);

            SaSession mockSession = mock(SaSession.class);
            stpUtilMock.when(StpUtil::getTokenSession).thenReturn(mockSession);
            when(mockSession.get(LOGIN_USER)).thenReturn(mockUser);

            LoginUser result = LoginHelper.getLoginUser();

            assertNotNull(result);
            assertEquals(2L, result.getUserId());
        }
    }
}
```

### 集成测试示例

```java
/**
 * Sa-Token模块集成测试
 */
@SpringBootTest
@DisplayName("Sa-Token集成测试")
class SaTokenIntegrationTest {

    @Autowired
    private SaTokenDao saTokenDao;

    @Test
    @DisplayName("Token存储和获取")
    void testTokenStorage() {
        String key = "test:token:1";
        String value = "eyJhbGciOiJIUzI1NiJ9...";

        // 存储Token
        saTokenDao.set(key, value, 3600);

        // 获取Token
        String result = saTokenDao.get(key);
        assertEquals(value, result);

        // 验证过期时间
        long timeout = saTokenDao.getTimeout(key);
        assertTrue(timeout > 0 && timeout <= 3601);

        // 删除Token
        saTokenDao.delete(key);
        assertNull(saTokenDao.get(key));
    }

    @Test
    @DisplayName("缓存命中率测试")
    void testCacheHitRate() {
        String key = "test:cache:hit";
        String value = "testValue";

        saTokenDao.set(key, value, 3600);

        // 连续访问测试缓存命中
        for (int i = 0; i < 100; i++) {
            String result = saTokenDao.get(key);
            assertEquals(value, result);
        }

        // 第一次从Redis加载，后续从Caffeine获取
        // 预期99%以上命中本地缓存
    }
}
```

### 性能测试示例

```java
/**
 * Sa-Token性能测试
 */
@DisplayName("Sa-Token性能测试")
class SaTokenPerformanceTest {

    @Test
    @DisplayName("Token读取性能-本地缓存")
    void testLocalCacheReadPerformance() {
        String key = "perf:token:local";
        saTokenDao.set(key, "value", 3600);

        // 预热
        for (int i = 0; i < 100; i++) {
            saTokenDao.get(key);
        }

        // 性能测试
        long start = System.currentTimeMillis();
        for (int i = 0; i < 10000; i++) {
            saTokenDao.get(key);
        }
        long elapsed = System.currentTimeMillis() - start;

        // 本地缓存读取应在100ms内完成1万次
        assertTrue(elapsed < 100, "本地缓存读取性能不达标");
    }

    @Test
    @DisplayName("Token写入性能")
    void testWritePerformance() {
        long start = System.currentTimeMillis();
        for (int i = 0; i < 1000; i++) {
            saTokenDao.set("perf:write:" + i, "value" + i, 3600);
        }
        long elapsed = System.currentTimeMillis() - start;

        // 1000次写入应在1秒内完成
        assertTrue(elapsed < 1000, "写入性能不达标");
    }
}
```

## 高级用法

### 自定义权限实现

```java
/**
 * 自定义权限服务实现
 * 替换默认的SaPermissionImpl
 */
@Component
public class CustomSaPermissionImpl implements StpInterface {

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private RoleService roleService;

    @Override
    public List<String> getPermissionList(Object loginId, String authType) {
        // 自定义权限查询逻辑
        Long userId = parseUserId(loginId);

        // 可以添加缓存、权限继承等自定义逻辑
        Set<String> permissions = permissionService.listMenuPermissions(userId);

        // 添加数据权限
        permissions.addAll(getDataPermissions(userId));

        return new ArrayList<>(permissions);
    }

    @Override
    public List<String> getRoleList(Object loginId, String authType) {
        Long userId = parseUserId(loginId);
        return new ArrayList<>(roleService.listRolePermissions(userId));
    }

    private Long parseUserId(Object loginId) {
        List<String> list = StringUtils.splitToList(loginId.toString(), ":");
        return Long.parseLong(list.get(1));
    }

    private Set<String> getDataPermissions(Long userId) {
        // 自定义数据权限逻辑
        return Collections.emptySet();
    }
}
```

### 自定义Token存储

```java
/**
 * 自定义Token存储实现
 * 扩展PlusSaTokenDao
 */
@Component
public class CustomSaTokenDao extends PlusSaTokenDao {

    @Autowired
    private TokenAuditService auditService;

    @Override
    public void set(String key, String value, long timeout) {
        // 记录Token创建日志
        if (key.contains("token")) {
            auditService.logTokenCreation(key, timeout);
        }
        super.set(key, value, timeout);
    }

    @Override
    public void delete(String key) {
        // 记录Token删除日志
        if (key.contains("token")) {
            auditService.logTokenDeletion(key);
        }
        super.delete(key);
    }

    @Override
    public String get(String key) {
        String value = super.get(key);
        // 记录Token访问日志
        if (value != null && key.contains("token")) {
            auditService.logTokenAccess(key);
        }
        return value;
    }
}
```

### 多用户体系扩展

```java
/**
 * 扩展用户类型支持
 */
public enum ExtendedUserType {

    PC_USER("pc_user", "PC用户"),
    APP_USER("app_user", "APP用户"),
    OPENAPI_USER("openapi_user", "OpenAPI用户"),
    WECHAT_USER("wechat_user", "微信用户"),
    MINI_USER("mini_user", "小程序用户"),
    H5_USER("h5_user", "H5用户");

    private final String loginType;
    private final String description;

    /**
     * 根据登录ID获取用户类型
     */
    public static ExtendedUserType getUserType(String loginId) {
        return Arrays.stream(values())
            .filter(type -> loginId.startsWith(type.getLoginType()))
            .findFirst()
            .orElse(PC_USER);
    }

    /**
     * 构建登录ID
     */
    public String buildLoginId(Long userId) {
        return this.loginType + ":" + userId;
    }
}
```

## 注意事项

### 1. Token安全

```java
/**
 * Token安全注意事项
 */
public class TokenSecurityNotes {

    /**
     * JWT密钥安全要求
     * 1. 长度至少32个字符
     * 2. 包含大小写字母、数字和特殊字符
     * 3. 每个环境使用不同密钥
     * 4. 通过环境变量或配置中心管理
     * 5. 定期更换密钥
     */
    public void jwtSecretRequirements() {
        // 正确：使用环境变量
        // sa-token.jwt-secret-key: ${JWT_SECRET_KEY}

        // 错误：硬编码密钥
        // sa-token.jwt-secret-key: mySecretKey123
    }

    /**
     * Token传输安全
     * 1. 使用HTTPS传输Token
     * 2. 禁用Cookie存储Token，防止CSRF
     * 3. Token不要暴露在URL中（GET请求）
     */
    public void tokenTransportSecurity() {
        // 正确：Header传递
        // Authorization: Bearer xxx

        // 避免：URL参数传递
        // /api/user?token=xxx （容易被日志记录）
    }
}
```

### 2. 缓存一致性

```java
/**
 * 缓存一致性注意事项
 */
public class CacheConsistencyNotes {

    /**
     * Caffeine本地缓存的一致性保证
     *
     * 问题：分布式环境下，节点A更新Token，节点B的本地缓存仍是旧数据
     *
     * 解决方案：
     * 1. 设置较短的过期时间（5秒）
     * 2. 写入时主动失效本地缓存
     * 3. 关键操作直接访问Redis
     */
    public void localCacheConsistency() {
        // 当前实现：5秒过期 + 写入时失效
        // 最大不一致窗口：5秒
    }

    /**
     * 强制刷新缓存
     */
    public void forceRefreshCache(String key) {
        // 直接从Redis获取最新数据
        Object value = RedisUtils.getCacheObject(key);
        // 更新本地缓存
        CAFFEINE.put(key, value);
    }
}
```

### 3. 并发登录控制

```java
/**
 * 并发登录控制注意事项
 */
public class ConcurrentLoginNotes {

    /**
     * 并发登录策略选择
     *
     * | 场景 | is-concurrent | is-share | 说明 |
     * |------|--------------|----------|------|
     * | 金融类 | false | - | 单设备登录，最高安全 |
     * | 办公类 | true | false | 多设备独立Token |
     * | 社交类 | true | true | 多设备共享Token |
     */
    public void concurrentLoginStrategy() {
        // 金融类应用：单设备登录
        // 新登录会踢掉旧登录

        // 办公类应用：多设备独立
        // Web、APP、小程序各自独立Token

        // 社交类应用：多设备共享
        // 所有设备使用同一个Token
    }

    /**
     * 踢人下线操作
     */
    public void kickOut(Long userId) {
        // 踢掉指定用户的所有登录
        StpUtil.kickout(userId);

        // 踢掉指定设备的登录
        StpUtil.kickoutByDevice("web");
    }
}
```

### 4. 权限缓存

```java
/**
 * 权限缓存注意事项
 */
public class PermissionCacheNotes {

    /**
     * 权限变更后的处理
     *
     * 问题：管理员修改用户权限后，用户的Token中仍是旧权限
     *
     * 解决方案：
     * 1. 强制用户重新登录
     * 2. 更新Session中的用户信息
     * 3. 使用实时权限查询（性能较低）
     */
    public void handlePermissionChange(Long userId) {
        // 方案1：强制用户重新登录
        StpUtil.kickout(userId);

        // 方案2：更新Session中的用户信息
        List<String> tokenList = StpUtil.getTokenValueListByLoginId(userId);
        for (String token : tokenList) {
            SaSession session = StpUtil.getTokenSessionByToken(token);
            if (session != null) {
                LoginUser loginUser = (LoginUser) session.get(LOGIN_USER);
                loginUser.setMenuPermission(newPermissions);
                session.set(LOGIN_USER, loginUser);
            }
        }
    }
}
```

### 5. 分布式部署

```java
/**
 * 分布式部署注意事项
 */
public class DistributedDeploymentNotes {

    /**
     * Redis配置要求
     * 1. 所有节点使用同一个Redis实例/集群
     * 2. 确保Redis高可用（主从、哨兵、集群）
     * 3. 合理设置连接池参数
     */
    public void redisConfiguration() {
        // 建议配置
        // spring.redis.lettuce.pool.max-active: 100
        // spring.redis.lettuce.pool.max-idle: 50
        // spring.redis.lettuce.pool.min-idle: 10
    }

    /**
     * 负载均衡注意事项
     * 1. 无需会话粘滞（JWT无状态）
     * 2. 注意本地缓存的一致性窗口
     * 3. 时钟同步（JWT过期验证）
     */
    public void loadBalancerConfiguration() {
        // 不需要配置session sticky
        // 各节点可独立验证JWT Token
    }
}
```

## 扩展故障排查

### 4. Token频繁失效

**问题描述**：用户登录后Token很快失效

**可能原因**：
- activeTimeout设置过短
- 多节点时钟不同步
- Redis连接不稳定

**解决方案**：

```java
// 1. 检查Token配置
public void checkTokenConfig() {
    // 查看Token有效期配置
    long timeout = SaManager.getConfig().getTimeout();
    long activeTimeout = SaManager.getConfig().getActiveTimeout();

    log.info("Token有效期: {}秒", timeout);
    log.info("活跃超时: {}秒", activeTimeout);
}

// 2. 检查时钟同步
public void checkClockSync() {
    // 各节点执行，比对时间差
    log.info("当前时间: {}", System.currentTimeMillis());
}

// 3. 手动续签Token
public void renewToken() {
    // 在关键操作后续签
    StpUtil.renewTimeout(7200);
}
```

### 5. 权限验证不生效

**问题描述**：配置了权限注解但未生效

**可能原因**：
- AOP未正确配置
- 注解作用在私有方法
- 权限数据未正确加载

**解决方案**：

```java
// 1. 确认AOP配置
@Configuration
@EnableAspectJAutoProxy(exposeProxy = true)
public class AopConfig {}

// 2. 检查权限数据
public void debugPermission() {
    List<String> permissions = StpUtil.getPermissionList();
    List<String> roles = StpUtil.getRoleList();

    log.info("当前用户权限: {}", permissions);
    log.info("当前用户角色: {}", roles);
}

// 3. 手动验证权限
public void manualCheck() {
    boolean hasPermission = StpUtil.hasPermission("system:user:add");
    log.info("是否有system:user:add权限: {}", hasPermission);
}
```

### 6. 多租户权限混乱

**问题描述**：不同租户的用户权限互相影响

**可能原因**：
- 租户上下文未正确设置
- 权限查询未考虑租户隔离
- 缓存key未包含租户信息

**解决方案**：

```java
// 1. 确认登录时设置租户信息
public void loginWithTenant(LoginUser loginUser, SaLoginParameter param) {
    param.setExtra(TENANT_ID, loginUser.getTenantId());
    StpUtil.login(loginUser.getLoginId(), param);
}

// 2. 权限查询时考虑租户
public List<String> getPermissionsWithTenant(Long userId) {
    String tenantId = LoginHelper.getTenantId();
    return TenantHelper.dynamic(tenantId, () -> {
        return permissionService.listMenuPermissions(userId);
    });
}

// 3. 检查当前租户上下文
public void debugTenant() {
    String tenantId = LoginHelper.getTenantId();
    log.info("当前租户ID: {}", tenantId);
}
```

### 7. OpenAPI场景用户信息获取失败

**问题描述**：OpenAPI调用时获取不到用户信息

**可能原因**：
- Storage未正确设置
- Token验证失败
- 用户信息未写入Storage

**解决方案**：

```java
// 1. OpenAPI请求前设置用户信息到Storage
public void setupOpenApiContext(LoginUser loginUser) {
    SaHolder.getStorage().set(LOGIN_USER, loginUser);
}

// 2. 确认获取逻辑
public LoginUser getLoginUser() {
    // 优先从Storage获取
    try {
        LoginUser user = (LoginUser) SaHolder.getStorage().get(LOGIN_USER);
        if (user != null) {
            return user;
        }
    } catch (Exception ignored) {}

    // 再从Session获取
    SaSession session = StpUtil.getTokenSession();
    return session != null ? (LoginUser) session.get(LOGIN_USER) : null;
}
```

### 8. 高并发下Token验证变慢

**问题描述**：高并发时Token验证响应时间增加

**可能原因**：
- Redis连接池不足
- Caffeine缓存命中率低
- 网络延迟

**解决方案**：

```java
// 1. 增加Redis连接池
// spring.redis.lettuce.pool.max-active: 200
// spring.redis.lettuce.pool.max-idle: 100

// 2. 调整Caffeine配置
private static final Cache<String, Object> CAFFEINE = Caffeine.newBuilder()
    .expireAfterWrite(10, TimeUnit.SECONDS)  // 延长过期时间
    .initialCapacity(500)
    .maximumSize(5000)  // 增加容量
    .build();

// 3. 监控缓存命中率
public void monitorCache() {
    CacheStats stats = CAFFEINE.stats();
    log.info("缓存命中率: {}%", stats.hitRate() * 100);
    log.info("请求总数: {}", stats.requestCount());
}
```
