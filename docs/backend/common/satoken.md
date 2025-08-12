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
