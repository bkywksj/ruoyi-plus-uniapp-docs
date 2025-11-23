# 安全防护概览

## 介绍

RuoYi-Plus 框架提供了一套完整的企业级安全防护体系,涵盖认证授权、数据加密、敏感数据脱敏、接口安全、防攻击等多个层面。安全体系基于 Sa-Token 1.44.0 认证框架构建,结合国密算法SM2/SM4、数据权限控制、多租户隔离等企业级特性,为应用提供全方位的安全保障。

**核心特性:**

- **统一认证授权** - 基于 Sa-Token 实现的登录认证、权限验证、角色控制,支持多用户体系(PC/APP/MINI)和多设备类型,采用 JWT Simple 模式实现无状态认证
- **多层加密体系** - 支持 AES、RSA、SM2、SM4、Base64 等多种加密算法,涵盖数据传输加密(`@ApiEncrypt`)和数据存储加密(`@EncryptField`),满足国产化安全要求
- **敏感数据脱敏** - 内置 14 种脱敏策略,自动处理手机号、身份证、银行卡、邮箱等敏感信息,支持基于角色/权限的条件脱敏,集成 Jackson 序列化
- **接口安全防护** - 提供幂等性控制(`@RepeatSubmit`)、三级限流保护(`@RateLimiter`)、XSS 过滤、SQL 注入防护等接口安全机制,基于 Redisson 实现分布式限流
- **多租户隔离** - 完善的租户数据隔离机制,基于 MyBatis-Plus 拦截器自动过滤租户数据,确保不同租户数据完全隔离,支持忽略表配置
- **审计日志** - 完整的操作日志(`@Log`)和登录日志记录,支持 9 种业务类型,记录用户行为、IP 地址、操作系统、浏览器等信息,支持安全审计和问题追溯

---

## 安全架构体系

### 整体架构

RuoYi-Plus 安全体系采用分层架构设计,从网络层到应用层提供多重防护:

```
┌─────────────────────────────────────────────────────────────┐
│                      应用安全层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 认证授权 │  │ 数据加密 │  │ 数据脱敏 │  │ 审计日志 │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      接口安全层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 限流控制 │  │ 幂等控制 │  │ API加密  │  │ XSS防护  │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      数据安全层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 数据权限 │  │ 租户隔离 │  │ 字段加密 │  │ SQL防注入│         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      基础设施层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ HTTPS   │  │ 防火墙   │  │ 密钥管理 │  │ 安全配置 │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 模块组成

安全体系由多个功能模块组成,各模块协同工作提供完整防护:

| 模块 | 说明 | 核心功能 |
|------|------|----------|
| `ruoyi-common-security` | 安全配置模块 | Sa-Token 拦截器配置、URL 白名单管理、Actuator HTTP Basic 认证 |
| `ruoyi-common-satoken` | 认证授权模块 | JWT Simple 认证、权限校验(`SaPermissionImpl`)、Token DAO(`PlusSaTokenDao`)、多用户体系 |
| `ruoyi-common-encrypt` | 数据加密模块 | 字段加密(`@EncryptField`)、接口加密(`@ApiEncrypt`)、AES/RSA/SM2/SM4 算法 |
| `ruoyi-common-sensitive` | 数据脱敏模块 | 敏感数据脱敏(`@Sensitive`)、14 种脱敏策略、基于角色/权限的条件脱敏 |
| `ruoyi-common-ratelimiter` | 限流模块 | 接口限流(`@RateLimiter`)、IP/用户/集群三级限流、Redisson 令牌桶算法 |
| `ruoyi-common-idempotent` | 幂等性模块 | 防重复提交(`@RepeatSubmit`)、基于 Redis 分布式锁、MD5 幂等 Key 生成 |
| `ruoyi-common-log` | 日志模块 | 操作日志(`@Log`)、登录日志、异步日志处理、9 种业务类型 |

---

## 认证授权

### Sa-Token 认证框架

RuoYi-Plus 基于 Sa-Token 1.44.0 实现统一认证授权,支持丰富的认证场景。Sa-Token 是一个轻量级 Java 权限认证框架,专注于解决权限认证、Session 会话、单点登录、OAuth2 等一系列安全问题。

#### 核心配置

Sa-Token 采用 JWT Simple 模式实现无状态认证:

```yaml
# common-satoken.yml
sa-token:
  # Token 名称(同时也是 Cookie 名称)
  token-name: Authorization

  # Token 前缀
  token-prefix: Bearer

  # Token 有效期(单位:秒),-1 代表永不过期
  timeout: 2592000

  # Token 临时有效期(指定时间内无操作就视为 Token 过期)(单位:秒)
  active-timeout: -1

  # 是否允许同一账号并发登录(为 true 时允许一起登录,为 false 时新登录挤掉旧登录)
  is-concurrent: true

  # 在多人登录同一账号时,是否共用一个 Token(为 true 时所有登录共用一个 Token,为 false 时每次登录新建一个 Token)
  is-share: false

  # Token 风格(可选值:uuid、simple-uuid、random-32、random-64、random-128、tik)
  token-style: uuid

  # 是否输出操作日志
  is-log: false

  # JWT 配置
  jwt-secret-key: ${JWT_SECRET_KEY}
```

**技术实现:**

Sa-Token 通过环境变量 `JWT_SECRET_KEY` 读取 JWT 密钥,支持动态配置。框架默认使用 UUID 风格生成 Token,每次登录创建新的 Token(is-share: false),支持同一账号并发登录(is-concurrent: true)。Token 有效期默认 30 天(2592000 秒),不设置活跃超时(active-timeout: -1)。

#### 核心能力

- **登录认证** - 账号密码、短信验证码、社交登录(JustAuth)、微信登录(WxJava)等多种方式
- **权限验证** - 基于注解的细粒度权限控制,支持 `@SaCheckPermission`、`@SaCheckRole`、`@SaCheckLogin` 等
- **角色控制** - 灵活的角色权限管理,支持多角色、角色继承
- **Token 管理** - Token 创建、刷新、踢出、禁用等全生命周期管理
- **多端登录** - 支持 PC、APP、小程序等多端同时在线或互斥登录,基于设备类型隔离

#### 登录实现

**核心登录流程:**

```java
/**
 * 用户登录示例
 */
@ApiEncrypt(response = true)
@PostMapping("/login")
public R<Map<String, Object>> login(@RequestBody LoginBody loginBody) {
    // 1. 验证码校验
    validateCaptcha(loginBody.getCode(), loginBody.getUuid());

    // 2. 用户认证(验证用户名密码)
    LoginUser loginUser = authenticate(loginBody.getUsername(), loginBody.getPassword());

    // 3. 登录参数配置
    SaLoginParameter loginParameter = new SaLoginParameter()
        .setDevice(loginBody.getDevice())       // 设备类型(pc/app/mini)
        .setTimeout(expireTime)                 // 过期时间
        .setActiveTimeout(activeTimeout);       // 活跃超时

    // 4. 执行登录(生成 Token)
    LoginHelper.login(loginUser, loginParameter);

    // 5. 返回 Token 信息
    return R.ok(Map.of(
        "token", StpUtil.getTokenValue(),
        "expireIn", StpUtil.getTokenTimeout()
    ));
}
```

**LoginHelper 工具类实现:**

`LoginHelper` 是框架封装的统一登录辅助类,支持多用户体系和多设备类型:

```java
public class LoginHelper {

    /**
     * 登录系统(支持多用户体系)
     * @param loginUser 登录用户信息
     * @param loginParameter 登录参数(设备类型、过期时间等)
     */
    public static void login(LoginUser loginUser, SaLoginParameter loginParameter) {
        // 构造登录 ID: userType:userId (如: pc:10001)
        String loginId = loginUser.getUserType().getUserType() + ":" + loginUser.getUserId();

        // 执行登录,Sa-Token 会生成 Token 并存储用户信息
        StpUtil.login(loginId, loginParameter);

        // 将完整的用户信息存储到 Token Session 中
        StpUtil.getTokenSession().set(LOGIN_USER_KEY, loginUser);
    }

    /**
     * 获取当前登录用户信息
     */
    public static LoginUser getLoginUser() {
        return (LoginUser) StpUtil.getTokenSession().get(LOGIN_USER_KEY);
    }

    /**
     * 判断是否为超级管理员
     */
    public static boolean isSuperAdmin() {
        return isSuperAdmin(getLoginUser().getUserId());
    }

    /**
     * 判断是否为超级管理员
     * @param userId 用户ID
     */
    public static boolean isSuperAdmin(Long userId) {
        return UserConstants.SUPER_ADMIN_ID.equals(userId);
    }
}
```

**技术实现:**

登录流程首先验证验证码(防止暴力破解),然后通过用户名密码认证(BCrypt 加密验证),构造 `LoginUser` 对象包含用户 ID、用户名、部门ID、角色列表、权限列表等信息。登录时使用 `userType:userId` 格式作为登录 ID(如 `pc:10001`),支持同一用户在不同端使用不同权限。Sa-Token 会生成 UUID 风格的 Token,并将 `LoginUser` 对象存储到 Token Session 中,后续请求通过 Token 即可获取完整用户信息。

#### 权限注解

框架提供多种权限注解用于接口安全控制:

```java
// 权限验证 - 必须具有指定权限才能访问
@SaCheckPermission("system:user:list")
@GetMapping("/list")
public TableDataInfo<SysUserVo> list(SysUserBo bo) {
    return userService.selectPageUserList(bo);
}

// 角色验证 - 必须具有指定角色才能访问
@SaCheckRole("admin")
@PostMapping("/resetPwd")
public R<Void> resetPwd(@RequestBody SysUserBo bo) {
    return toAjax(userService.resetPwd(bo));
}

// 登录验证 - 必须登录才能访问
@SaCheckLogin
@GetMapping("/getInfo")
public R<Map<String, Object>> getInfo() {
    return R.ok(userService.getUserInfo());
}

// 忽略验证 - 无需登录即可访问(白名单)
@SaIgnore
@GetMapping("/captcha")
public R<CaptchaVo> getCaptcha() {
    return R.ok(captchaService.createCaptcha());
}

// 权限或角色验证 - 满足任一条件即可访问
@SaCheckPermission(value = {"system:user:add", "system:user:edit"}, mode = SaMode.OR)
@PostMapping("/save")
public R<Void> save(@RequestBody SysUserBo bo) {
    return toAjax(userService.save(bo));
}

// 多权限验证 - 必须同时具有所有权限
@SaCheckPermission(value = {"system:user:edit", "system:user:grant"}, mode = SaMode.AND)
@PutMapping("/grant")
public R<Void> grant(@RequestBody UserRoleBo bo) {
    return toAjax(userService.grantRole(bo));
}
```

**权限验证实现:**

Sa-Token 通过 `SaPermissionImpl` 实现权限接口,从 `LoginUser` 中获取权限列表进行验证:

```java
@Component
public class SaPermissionImpl implements StpInterface {

    /**
     * 获取用户权限列表
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        return new ArrayList<>(loginUser.getMenuPermission());
    }

    /**
     * 获取用户角色列表
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        return new ArrayList<>(loginUser.getRolePermission());
    }
}
```

#### 多用户体系

系统支持同一用户表的多种用户类型,实现灵活的权限控制矩阵:

```java
/**
 * 用户类型枚举
 */
public enum UserType {
    /** PC端用户 */
    PC("pc"),
    /** APP端用户 */
    APP("app"),
    /** 小程序用户 */
    MINI("mini");

    private final String userType;

    UserType(String userType) {
        this.userType = userType;
    }

    public String getUserType() {
        return userType;
    }
}
```

登录 ID 格式采用 `userType:userId` 的形式,支持同一用户在不同终端使用不同权限:

```java
// 构造登录 ID
String loginId = userType.getUserType() + ":" + userId;  // 如: "pc:10001"

// 执行登录
StpUtil.login(loginId, loginParameter);

// 获取当前登录的用户类型
String userType = loginId.split(":")[0];  // "pc"

// 获取当前登录的用户ID
Long userId = Long.parseLong(loginId.split(":")[1]);  // 10001
```

**多设备登录控制:**

通过 `SaLoginParameter` 的 `setDevice()` 方法实现多设备登录控制:

```java
// PC 端登录
SaLoginParameter pcLogin = new SaLoginParameter().setDevice("pc");
StpUtil.login("pc:10001", pcLogin);

// APP 端登录(同一用户,不同设备)
SaLoginParameter appLogin = new SaLoginParameter().setDevice("app");
StpUtil.login("app:10001", appLogin);

// 踢出指定设备
StpUtil.kickoutByDevice("10001", "pc");
```

### 路径安全配置

#### 白名单配置

通过配置文件定义无需认证的路径:

```yaml
# application.yml
security:
  excludes:
    # 登录相关
    - /login
    - /register
    - /logout
    - /captcha
    - /sms/code
    # 静态资源
    - /static/**
    - /public/**
    - /favicon.ico
    # API 文档
    - /swagger-ui/**
    - /v3/api-docs/**
    - /doc.html
    - /webjars/**
    # 健康检查
    - /actuator/health
    - /actuator/info
    # SSE 推送
    - /resource/sse/**
```

**AllUrlHandler 白名单管理:**

`AllUrlHandler` 负责管理所有需要认证的 URL,实现动态白名单:

```java
@Component
public class AllUrlHandler {

    private final SecurityProperties securityProperties;

    /**
     * 获取所有需要认证的 URL(排除白名单)
     */
    public List<String> getUrls() {
        List<String> urls = new ArrayList<>();
        urls.add("/**");  // 默认所有路径都需要认证
        return urls;
    }

    /**
     * 判断是否为白名单路径
     */
    public boolean isExclude(String path) {
        return securityProperties.getExcludes().stream()
            .anyMatch(pattern -> new AntPathMatcher().match(pattern, path));
    }
}
```

#### 安全拦截器配置

系统通过 `SecurityAutoConfiguration` 自动配置 Sa-Token 拦截器,对非白名单路径进行登录验证:

```java
@Configuration
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityAutoConfiguration implements WebMvcConfigurer {

    private final SecurityProperties securityProperties;

    @Value("${sse.path:/resource/sse}")
    private String ssePath;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 路由拦截器
        registry.addInterceptor(new SaInterceptor(handler -> {
                AllUrlHandler allUrlHandler = SpringUtils.getBean(AllUrlHandler.class);

                // 登录验证逻辑
                SaRouter
                    .match(allUrlHandler.getUrls())  // 匹配需要验证的 URL
                    .notMatch(securityProperties.getExcludes())  // 排除白名单
                    .check(StpUtil::checkLogin);    // 执行登录检查
            }))
            .addPathPatterns("/**")                       // 拦截所有路径
            .excludePathPatterns(securityProperties.getExcludes())  // 排除白名单
            .excludePathPatterns(ssePath);                // 排除 SSE 路径
    }
}
```

**技术实现:**

Sa-Token 拦截器通过 `SaRouter.match()` 方法匹配所有路径(`/**`),然后通过 `notMatch()` 排除白名单路径,最后通过 `check(StpUtil::checkLogin)` 执行登录检查。如果 Token 无效或过期,会抛出 `NotLoginException` 异常,全局异常处理器会捕获并返回 401 状态码。

### Actuator 监控认证

Spring Boot Actuator 端点采用 HTTP Basic 认证保护,防止未授权访问:

```java
@Bean
public SaServletFilter getSaServletFilter() {
    String username = SpringUtils.getProperty("spring.boot.admin.client.username");
    String password = SpringUtils.getProperty("spring.boot.admin.client.password");

    return new SaServletFilter()
        .addInclude("/actuator", "/actuator/**")
        .setAuth(obj -> {
            // HTTP Basic 认证
            SaHttpBasicUtil.check(username + ":" + password);
        })
        .setError(e -> {
            HttpServletResponse response = ServletUtils.getResponse();
            response.setContentType("application/json;charset=UTF-8");
            return SaResult.error(e.getMessage()).setCode(HttpStatus.UNAUTHORIZED);
        });
}
```

**配置示例:**

```yaml
# Actuator 认证配置
spring.boot.admin.client:
  username: ${MONITOR_USERNAME:ruoyi}
  password: ${MONITOR_PASSWORD:123456}
```

**技术实现:**

HTTP Basic 认证要求客户端在请求头中携带 `Authorization: Basic base64(username:password)` 格式的认证信息。`SaHttpBasicUtil.check()` 会解析认证头并验证用户名密码,验证失败会抛出异常并返回 401 状态码。

### 密码安全策略

#### 密码加密存储

系统使用 BCrypt 算法加密密码,自动加盐防止彩虹表攻击:

```java
/**
 * 密码加密存储
 */
public String encryptPassword(String password) {
    // 使用 BCrypt 加密,自动生成随机盐值
    return BCrypt.hashpw(password, BCrypt.gensalt());
}

/**
 * 密码验证
 */
public boolean matches(String rawPassword, String encodedPassword) {
    return BCrypt.checkpw(rawPassword, encodedPassword);
}
```

#### 密码重试锁定

系统支持密码重试次数限制,超过次数自动锁定账户:

```yaml
# 密码策略配置
user:
  password:
    # 密码最大错误次数
    maxRetryCount: 5
    # 锁定时间(分钟)
    lockTime: 10
```

**实现逻辑:**

```java
/**
 * 验证密码并记录错误次数
 */
public void validatePassword(String username, String password) {
    String cacheKey = CacheConstants.PWD_ERR_CNT_KEY + username;
    Integer retryCount = RedisUtils.getCacheObject(cacheKey);

    if (retryCount == null) {
        retryCount = 0;
    }

    // 检查是否已锁定
    if (retryCount >= maxRetryCount) {
        throw new UserException("密码错误次数过多,账户已锁定,请10分钟后再试");
    }

    // 验证密码
    SysUser user = userMapper.selectUserByUserName(username);
    if (user == null || !BCrypt.checkpw(password, user.getPassword())) {
        // 密码错误,增加错误次数
        retryCount++;
        RedisUtils.setCacheObject(cacheKey, retryCount, lockTime, TimeUnit.MINUTES);
        throw new UserException("用户名或密码错误(剩余" + (maxRetryCount - retryCount) + "次尝试)");
    }

    // 密码正确,清除错误次数
    RedisUtils.deleteObject(cacheKey);
}
```

---

## 数据加密

### 加密算法支持

框架内置多种加密算法,满足不同安全等级需求:

| 算法类型 | 说明 | 适用场景 | 密钥长度 |
|---------|------|----------|---------|
| `BASE64` | Base64 编码 | 简单数据编码,非安全场景 | - |
| `AES` | 对称加密算法 | 高性能加密,适合大量数据 | 128/192/256 位 |
| `RSA` | 非对称加密算法 | 密钥交换,数字签名 | 1024/2048/4096 位 |
| `SM2` | 国密非对称算法 | 国产化安全要求场景 | 256 位 |
| `SM4` | 国密对称算法 | 国产化安全要求场景 | 128 位 |

**加密器实现:**

框架为每种算法提供了独立的加密器实现:

- `AesEncryptor` - AES 对称加密器,支持 ECB、CBC、GCM 模式
- `RsaEncryptor` - RSA 非对称加密器,支持公钥加密/私钥解密
- `Sm2Encryptor` - SM2 国密非对称加密器
- `Sm4Encryptor` - SM4 国密对称加密器
- `Base64Encryptor` - Base64 编码器
- `HexEncryptor` - HEX 十六进制编码器

### 字段级加密

使用 `@EncryptField` 注解实现数据库字段自动加解密:

```java
/**
 * 用户实体
 */
@TableName("sys_user")
public class SysUser {

    /** 用户ID */
    @TableId(value = "user_id")
    private Long userId;

    /** 用户名 */
    private String userName;

    /** 手机号 - 自动加密存储 */
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phonenumber;

    /** 身份证号 - 使用国密算法加密 */
    @EncryptField(algorithm = AlgorithmType.SM4)
    private String idCard;

    /** 邮箱 - 自动加密存储(使用默认算法) */
    @EncryptField
    private String email;

    /** 银行卡号 - RSA 加密 */
    @EncryptField(algorithm = AlgorithmType.RSA)
    private String bankCard;
}
```

加密配置:

```yaml
# 数据库字段加密配置
mybatis-encryptor:
  # 是否启用加密
  enabled: true

  # 默认加密算法(不指定时使用)
  algorithm: AES

  # AES 加密密钥(16/24/32 字节)
  password: ${AES_PASSWORD:1234567890123456}

  # 编码方式(BASE64 或 HEX)
  encode: BASE64

  # RSA 公钥(用于加密)
  rsa-public-key: ${RSA_PUBLIC_KEY}

  # RSA 私钥(用于解密)
  rsa-private-key: ${RSA_PRIVATE_KEY}

  # SM2 公钥
  sm2-public-key: ${SM2_PUBLIC_KEY}

  # SM2 私钥
  sm2-private-key: ${SM2_PRIVATE_KEY}

  # SM4 密钥
  sm4-password: ${SM4_PASSWORD}
```

**技术实现:**

MyBatis-Plus 通过类型处理器(`TypeHandler`)实现字段加解密。框架提供 `EncryptTypeHandler` 拦截器,在插入/更新时自动加密标注了 `@EncryptField` 的字段,在查询时自动解密。加密过程:原始数据 → 加密算法 → Base64/HEX 编码 → 存储到数据库。解密过程:数据库数据 → Base64/HEX 解码 → 解密算法 → 原始数据。

### 接口级加密

使用 `@ApiEncrypt` 注解实现接口请求/响应加密:

```java
/**
 * 用户登录 - 请求参数加密传输
 */
@ApiEncrypt(request = true, response = false)
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody loginBody) {
    // loginBody 会自动解密
    return R.ok(loginService.login(loginBody));
}

/**
 * 获取用户敏感信息 - 响应数据加密传输
 */
@ApiEncrypt(request = false, response = true)
@GetMapping("/sensitive-info")
public R<UserSensitiveVo> getSensitiveInfo() {
    // 返回数据会自动加密
    return R.ok(userService.getSensitiveInfo());
}

/**
 * 用户注册 - 请求和响应都加密
 */
@ApiEncrypt(request = true, response = true)
@PostMapping("/register")
public R<RegisterVo> register(@RequestBody RegisterBody registerBody) {
    return R.ok(userService.register(registerBody));
}
```

接口加密配置:

```yaml
# API 接口加密配置
api-decrypt:
  # 是否启用
  enabled: ${API_DECRYPT_ENABLED:true}

  # 加密算法(RSA/SM2)
  algorithm: ${API_DECRYPT_ALGORITHM:RSA}

  # RSA 公钥(前端加密用,后端解密验证)
  public-key: ${API_DECRYPT_PUBLIC_KEY:MIGfMA0GCSq...}

  # RSA 私钥(后端解密用)
  private-key: ${API_DECRYPT_PRIVATE_KEY:MIICdgIBADANBg...}

  # Header 名称(前端传递加密密钥)
  header-flag: encrypt-key
```

**加密流程:**

1. **请求加密**(前端 → 后端):
   - 前端生成随机 AES 密钥
   - 使用 AES 密钥加密请求体
   - 使用后端 RSA 公钥加密 AES 密钥
   - 将加密后的 AES 密钥放入请求头 `encrypt-key`
   - 将加密后的请求体作为请求参数发送

2. **响应加密**(后端 → 前端):
   - 后端从请求头获取加密的 AES 密钥
   - 使用 RSA 私钥解密得到 AES 密钥
   - 使用 AES 密钥加密响应体
   - 返回加密后的响应体

**技术实现:**

框架通过 `ApiDecryptRequestBodyAdvice` 和 `ApiEncryptResponseBodyAdvice` 实现请求/响应的自动加解密。`@ApiEncrypt` 注解标记的接口会被拦截,根据 `request` 和 `response` 参数决定是否加解密请求体和响应体。

### 加密工具类

框架提供统一的加密工具类 `EncryptUtils`:

```java
// AES 对称加密
String aesKey = "1234567890123456";  // 16字节密钥
String encrypted = EncryptUtils.encryptByAes("明文数据", aesKey);
String decrypted = EncryptUtils.decryptByAes(encrypted, aesKey);

// RSA 非对称加密
KeyPair keyPair = EncryptUtils.generateRsaKeyPair();
String publicKey = Base64.encode(keyPair.getPublic().getEncoded());
String privateKey = Base64.encode(keyPair.getPrivate().getEncoded());

String encrypted = EncryptUtils.encryptByRsa("明文数据", publicKey);
String decrypted = EncryptUtils.decryptByRsa(encrypted, privateKey);

// SM2 国密非对称加密
KeyPair sm2KeyPair = EncryptUtils.generateSm2KeyPair();
String sm2PublicKey = Base64.encode(sm2KeyPair.getPublic().getEncoded());
String sm2PrivateKey = Base64.encode(sm2KeyPair.getPrivate().getEncoded());

String encrypted = EncryptUtils.encryptBySm2("明文数据", sm2PublicKey);
String decrypted = EncryptUtils.decryptBySm2(encrypted, sm2PrivateKey);

// SM4 国密对称加密
String sm4Key = "1234567890123456";  // 16字节密钥
String encrypted = EncryptUtils.encryptBySm4("明文数据", sm4Key);
String decrypted = EncryptUtils.decryptBySm4(encrypted, sm4Key);

// MD5 摘要(不可逆)
String md5 = EncryptUtils.md5("原始数据");
String md5WithSalt = EncryptUtils.md5("原始数据", "盐值");

// SHA256 摘要(不可逆)
String sha256 = EncryptUtils.sha256("原始数据");

// Base64 编码/解码
String encoded = EncryptUtils.base64Encode("原始数据");
String decoded = EncryptUtils.base64Decode(encoded);

// HEX 编码/解码
String hexEncoded = EncryptUtils.hexEncode("原始数据");
String hexDecoded = EncryptUtils.hexDecode(hexEncoded);
```

---

## 敏感数据脱敏

### 脱敏策略

框架内置 14 种常用脱敏策略,通过 `SensitiveStrategy` 枚举定义:

| 策略 | 说明 | 原始数据示例 | 脱敏后示例 |
|------|------|------------|-----------|
| `PHONE` | 手机号脱敏(保留前3后4位) | `13812345678` | `138****5678` |
| `ID_CARD` | 身份证脱敏(保留前3后4位) | `110101199001011234` | `110***********1234` |
| `EMAIL` | 邮箱脱敏(保留首字符和域名) | `test@example.com` | `t***@example.com` |
| `BANK_CARD` | 银行卡脱敏(保留前4后4位) | `6222021234567890123` | `6222***********0123` |
| `CHINESE_NAME` | 中文姓名脱敏(保留姓) | `张三` | `张*` |
| `ADDRESS` | 地址脱敏(保留省市,隐藏详细地址) | `北京市朝阳区建国路1号` | `北京市朝阳区****` |
| `FIXED_PHONE` | 固定电话脱敏(保留区号和后4位) | `010-12345678` | `010-****5678` |
| `PASSWORD` | 密码脱敏(全部隐藏) | `password123` | `******` |
| `IPV4` | IPv4 地址脱敏(保留前两段) | `192.168.1.100` | `192.168.*.*` |
| `IPV6` | IPv6 地址脱敏(保留前两段) | `2001:db8:85a3::8a2e:370:7334` | `2001:db8:****:****` |
| `CAR_LICENSE` | 车牌号脱敏(保留省份和最后一位) | `京A12345` | `京A****5` |
| `USER_ID` | 用户 ID 脱敏(随机数字替换) | `1234567890` | `9876543210` |
| `FIRST_MASK` | 首字符保留,其余隐藏 | `张三丰` | `张**` |
| `CLEAR` | 清空为空字符串 | `任意内容` | `` |

### 使用方式

使用 `@Sensitive` 注解标记需要脱敏的字段:

```java
/**
 * 用户信息 VO
 */
public class SysUserVo {

    /** 用户ID */
    private Long userId;

    /** 用户名 */
    private String userName;

    /** 手机号 - 脱敏显示 */
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phonenumber;

    /** 身份证号 - 脱敏显示 */
    @Sensitive(strategy = SensitiveStrategy.ID_CARD)
    private String idCard;

    /** 邮箱 - 脱敏显示 */
    @Sensitive(strategy = SensitiveStrategy.EMAIL)
    private String email;

    /** 家庭地址 - 脱敏显示 */
    @Sensitive(strategy = SensitiveStrategy.ADDRESS)
    private String address;

    /** 银行卡号 - 脱敏显示 */
    @Sensitive(strategy = SensitiveStrategy.BANK_CARD)
    private String bankCard;

    /** 密码 - 完全隐藏 */
    @Sensitive(strategy = SensitiveStrategy.PASSWORD)
    private String password;
}
```

返回给前端的数据会自动脱敏:

```json
{
  "userId": 1,
  "userName": "admin",
  "phonenumber": "138****5678",
  "idCard": "110***********1234",
  "email": "t***@example.com",
  "address": "北京市朝阳区****",
  "bankCard": "6222***********0123",
  "password": "******"
}
```

### 条件脱敏

支持基于权限或角色的条件脱敏,管理员可查看完整数据:

```java
/**
 * 敏感数据服务接口
 */
public interface SensitiveService {

    /**
     * 判断是否脱敏
     * @param roleKey 角色标识
     * @param perms 权限标识
     * @return true-需要脱敏,false-不脱敏
     */
    boolean isSensitive(String roleKey, String perms);
}

/**
 * 敏感数据服务实现
 */
@Service
public class SensitiveServiceImpl implements SensitiveService {

    @Override
    public boolean isSensitive(String roleKey, String perms) {
        // 超级管理员不脱敏
        if (LoginHelper.isSuperAdmin()) {
            return false;
        }

        // 具有指定权限不脱敏
        if (StringUtils.isNotBlank(perms)) {
            return !StpUtil.hasPermission(perms);
        }

        // 具有指定角色不脱敏
        if (StringUtils.isNotBlank(roleKey)) {
            return !StpUtil.hasRole(roleKey);
        }

        return true;
    }
}
```

使用条件脱敏:

```java
// 仅管理员角色可查看完整手机号
@Sensitive(strategy = SensitiveStrategy.PHONE, roleKey = "admin")
private String phonenumber;

// 具有指定权限可查看完整身份证
@Sensitive(strategy = SensitiveStrategy.ID_CARD, perms = "system:user:sensitive")
private String idCard;

// 同时指定角色和权限(满足任一条件即可查看)
@Sensitive(strategy = SensitiveStrategy.BANK_CARD, roleKey = "admin", perms = "system:user:bank")
private String bankCard;
```

**技术实现:**

脱敏通过 Jackson `JsonSerializer` 实现。框架提供 `SensitiveJsonSerializer` 序列化器,在序列化 JSON 时检查字段上的 `@Sensitive` 注解,根据策略进行脱敏处理。条件脱敏通过调用 `SensitiveService.isSensitive()` 方法判断当前用户是否有权查看完整数据,如果有权限则不脱敏,否则按策略脱敏。

### 自定义脱敏策略

支持自定义脱敏策略,扩展 `SensitiveStrategy` 枚举:

```java
/**
 * 自定义脱敏策略 - 银行账户(保留前4后4位)
 */
BANK_ACCOUNT(s -> {
    if (s == null || s.length() <= 8) {
        return s;
    }
    return s.substring(0, 4) + "****" + s.substring(s.length() - 4);
});

/**
 * 自定义脱敏策略 - 护照号(保留前2后2位)
 */
PASSPORT(s -> {
    if (s == null || s.length() <= 4) {
        return s;
    }
    return s.substring(0, 2) + "****" + s.substring(s.length() - 2);
});
```

---

## 接口安全

### 幂等性控制

防止接口重复提交,保证操作幂等性:

```java
/**
 * 创建订单 - 幂等性保护
 */
@RepeatSubmit(interval = 5000, message = "请勿重复提交订单")
@PostMapping("/order")
public R<Long> createOrder(@RequestBody OrderBo bo) {
    return R.ok(orderService.createOrder(bo));
}

/**
 * 提交表单 - 默认5秒内不允许重复提交
 */
@RepeatSubmit
@PostMapping("/submit")
public R<Void> submit(@RequestBody FormBo bo) {
    return toAjax(formService.submit(bo));
}

/**
 * 支付接口 - 10秒内不允许重复提交
 */
@RepeatSubmit(interval = 10000, message = "支付请求处理中,请勿重复提交")
@PostMapping("/pay")
public R<PayVo> pay(@RequestBody PayBo bo) {
    return R.ok(payService.pay(bo));
}
```

幂等性配置:

```yaml
# 幂等性配置
repeat-submit:
  # 是否启用
  enabled: true

  # 默认间隔时间(毫秒)
  interval: 5000

  # Redis Key 前缀
  prefix: repeat_submit:
```

**技术实现:**

`@RepeatSubmit` 通过 `RepeatSubmitAspect` 切面实现。拦截逻辑:
1. 获取请求的 URL、参数、用户 Token 等信息
2. 计算请求的 MD5 哈希值作为唯一标识
3. 使用 Redis `SET NX EX` 命令尝试设置幂等 Key(Key 不存在才设置成功)
4. 如果设置成功,放行请求;如果设置失败,说明重复提交,拒绝请求
5. Key 的过期时间为 `interval` 参数指定的时间

**幂等 Key 生成逻辑:**

```java
/**
 * 生成幂等 Key
 */
private String generateRepeatKey(ProceedingJoinPoint point) {
    String url = ServletUtils.getRequest().getRequestURI();
    String params = JSON.toJSONString(point.getArgs());
    String token = StpUtil.getTokenValue();

    // 计算 MD5: url + params + token
    String key = url + params + token;
    return DigestUtils.md5Hex(key);
}
```

### 限流保护

接口限流防止恶意请求,支持三种限流类型:

#### 1. 默认限流(方法级)

```java
/**
 * 查询用户列表 - 每分钟最多调用 100 次
 */
@RateLimiter(time = 60, count = 100)
@GetMapping("/list")
public TableDataInfo<SysUserVo> list(SysUserBo bo) {
    return userService.selectPageUserList(bo);
}
```

#### 2. IP 限流

```java
/**
 * 发送验证码 - IP 限流,每个 IP 每分钟最多 1 次
 */
@RateLimiter(key = "sms:code:", time = 60, count = 1, limitType = LimitType.IP)
@PostMapping("/sms/code")
public R<Void> sendSmsCode(@RequestBody SmsCodeBo bo) {
    return toAjax(smsService.sendSmsCode(bo));
}

/**
 * 用户登录 - IP 限流,每个 IP 每分钟最多 5 次
 */
@RateLimiter(key = "login:", time = 60, count = 5, limitType = LimitType.IP,
             message = "登录失败次数过多,请稍后再试")
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody loginBody) {
    return R.ok(loginService.login(loginBody));
}

/**
 * 获取验证码 - IP 限流,每个 IP 每分钟最多 20 次
 */
@RateLimiter(time = 60, count = 20, limitType = LimitType.IP)
@GetMapping("/captcha")
public R<CaptchaVo> getCaptcha() {
    return R.ok(captchaService.createCaptcha());
}
```

#### 3. 用户限流

```java
/**
 * 提交工单 - 用户限流,每个用户每天最多 10 次
 */
@RateLimiter(key = "ticket:create:", time = 86400, count = 10, limitType = LimitType.USER)
@PostMapping("/ticket")
public R<Void> createTicket(@RequestBody TicketBo bo) {
    return toAjax(ticketService.createTicket(bo));
}
```

#### 4. 集群限流

```java
/**
 * 发送邮件 - 集群限流,所有节点共享配额,每小时最多 1000 次
 */
@RateLimiter(key = "mail:send:", time = 3600, count = 1000, limitType = LimitType.CLUSTER)
@PostMapping("/mail/send")
public R<Void> sendMail(@RequestBody MailBo bo) {
    return toAjax(mailService.sendMail(bo));
}
```

#### 5. 动态 Key(SpEL 表达式)

```java
/**
 * 发送短信 - 基于手机号限流,每个手机号每分钟最多 1 次
 */
@RateLimiter(key = "#phone", time = 60, count = 1, message = "一分钟内只能发送一次验证码")
@PostMapping("/sms/send/{phone}")
public R<Void> sendSms(@PathVariable String phone) {
    return toAjax(smsService.sendSms(phone));
}
```

限流配置:

```yaml
# 限流配置
rate-limiter:
  # 是否启用
  enabled: true

  # Redis Key 前缀
  prefix: rate_limit:
```

**技术实现:**

`@RateLimiter` 通过 `RateLimiterAspect` 切面实现,基于 Redisson 的 `RRateLimiter`(令牌桶算法):

```java
/**
 * 限流切面
 */
@Around("@annotation(rateLimiter)")
public Object around(ProceedingJoinPoint point, RateLimiter rateLimiter) throws Throwable {
    String key = generateKey(point, rateLimiter);

    // 创建 Redisson 限流器
    RRateLimiter limiter = redissonClient.getRateLimiter(key);

    // 设置速率:在 time 时间内最多 count 次
    limiter.trySetRate(RateType.OVERALL, rateLimiter.count(), rateLimiter.time(), RateIntervalUnit.SECONDS);

    // 尝试获取令牌
    if (limiter.tryAcquire()) {
        return point.proceed();
    } else {
        throw new ServiceException(rateLimiter.message());
    }
}

/**
 * 生成限流 Key
 */
private String generateKey(ProceedingJoinPoint point, RateLimiter rateLimiter) {
    String key = rateLimiter.key();
    LimitType limitType = rateLimiter.limitType();

    switch (limitType) {
        case IP:
            key = key + ServletUtils.getClientIP();
            break;
        case USER:
            key = key + LoginHelper.getUserId();
            break;
        case CLUSTER:
            // 集群限流不添加额外标识
            break;
        default:
            // 默认限流使用方法签名
            key = key + point.getSignature().toShortString();
    }

    return CacheConstants.RATE_LIMIT_KEY + key;
}
```

### XSS 防护

框架自动过滤 XSS 攻击,防止恶意脚本注入:

```yaml
# XSS 防护配置
xss:
  # 是否启用
  enabled: true

  # 排除路径(这些路径允许 HTML 标签)
  excludes:
    - /system/notice/*
    - /system/config/*

  # 匹配路径(仅过滤这些路径)
  urlPatterns:
    - /system/*
    - /business/*
```

**技术实现:**

XSS 防护通过 `XssFilter` 过滤器实现,包装 `HttpServletRequest` 并重写 `getParameter()`、`getParameterValues()`、`getHeader()` 等方法,对所有输入进行 HTML 转义:

```java
/**
 * XSS 过滤包装器
 */
public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        return cleanXSS(value);
    }

    @Override
    public String[] getParameterValues(String name) {
        String[] values = super.getParameterValues(name);
        if (values == null) {
            return null;
        }
        String[] cleanValues = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            cleanValues[i] = cleanXSS(values[i]);
        }
        return cleanValues;
    }

    /**
     * 清理 XSS
     */
    private String cleanXSS(String value) {
        if (value == null) {
            return null;
        }
        // 移除危险标签
        value = value.replaceAll("<script", "&lt;script");
        value = value.replaceAll("</script>", "&lt;/script&gt;");
        value = value.replaceAll("<iframe", "&lt;iframe");
        value = value.replaceAll("javascript:", "");
        value = value.replaceAll("onerror=", "");
        value = value.replaceAll("onclick=", "");
        return value;
    }
}
```

### SQL 注入防护

MyBatis-Plus 自动防止 SQL 注入,并提供额外防护:

```java
/**
 * 查询用户列表 - 安全的查询方式
 */
public List<SysUser> selectUserList(SysUserBo bo) {
    return baseMapper.selectList(new LambdaQueryWrapper<SysUser>()
        // 使用 Lambda 表达式,避免字段名注入
        .like(StringUtils.isNotBlank(bo.getUserName()), SysUser::getUserName, bo.getUserName())
        .eq(StringUtils.isNotBlank(bo.getStatus()), SysUser::getStatus, bo.getStatus())
        // 使用参数绑定,避免值注入
        .between(bo.getBeginTime() != null && bo.getEndTime() != null,
                 SysUser::getCreateTime, bo.getBeginTime(), bo.getEndTime())
    );
}
```

**不安全的查询方式(禁止使用):**

```java
// ❌ 错误示例:直接拼接 SQL
String sql = "SELECT * FROM sys_user WHERE user_name LIKE '%" + userName + "%'";

// ❌ 错误示例:使用字符串字段名
wrapper.like("user_name", userName);  // 字段名可能被注入

// ✅ 正确示例:使用 Lambda 表达式
wrapper.like(SysUser::getUserName, userName);  // 类型安全,防注入
```

**MyBatis-Plus 防注入机制:**

- **参数绑定**: 所有参数使用 `#{}` 占位符,JDBC 会自动进行参数化查询
- **字段名校验**: Lambda 表达式确保字段名是实体类的真实属性,无法注入
- **值转义**: 自动转义特殊字符如单引号、双引号等

---

## 数据权限

### 数据权限控制

系统支持多种数据权限模式,满足不同业务场景:

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| 全部数据权限 | 可查看所有数据 | 超级管理员、系统管理员 |
| 自定义数据权限 | 按配置的部门查看 | 跨部门管理、特殊业务场景 |
| 本部门数据权限 | 仅查看本部门数据 | 部门经理、部门主管 |
| 本部门及以下数据权限 | 查看本部门及下级部门数据 | 分管领导、区域经理 |
| 仅本人数据权限 | 仅查看自己的数据 | 普通员工、业务员 |

使用数据权限注解:

```java
/**
 * 查询用户列表 - 数据权限控制
 */
@DataScope(deptAlias = "d", userAlias = "u")
public List<SysUser> selectUserList(SysUserBo bo) {
    return userMapper.selectUserList(bo);
}

/**
 * 查询订单列表 - 数据权限控制
 */
@DataScope(deptAlias = "dept", userAlias = "user")
public List<Order> selectOrderList(OrderBo bo) {
    return orderMapper.selectOrderList(bo);
}
```

**SQL 示例:**

```sql
-- 全部数据权限(无额外条件)
SELECT * FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
WHERE u.del_flag = '0'

-- 本部门数据权限
SELECT * FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
WHERE u.del_flag = '0' AND d.dept_id = 100

-- 本部门及以下数据权限
SELECT * FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
WHERE u.del_flag = '0' AND (d.dept_id = 100 OR FIND_IN_SET(100, d.ancestors))

-- 仅本人数据权限
SELECT * FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
WHERE u.del_flag = '0' AND u.user_id = 1
```

### 多租户隔离

完善的租户数据隔离机制,基于 MyBatis-Plus 拦截器实现:

```yaml
# 租户配置
tenant:
  # 是否启用多租户
  enabled: ${TENANT_ENABLED:true}

  # 忽略的表(这些表不进行租户过滤)
  ignore-tables:
    - sys_dict_type
    - sys_dict_data
    - sys_config
    - sys_tenant
    - sys_tenant_package
    - gen_table
    - gen_table_column
```

租户数据自动过滤:

```java
// 所有查询自动添加租户条件
SELECT * FROM sys_user WHERE tenant_id = '000000' AND ...

// 新增数据自动填充租户ID
INSERT INTO sys_user (tenant_id, user_name, ...) VALUES ('000000', 'admin', ...)

// 更新数据自动添加租户条件
UPDATE sys_user SET user_name = 'admin' WHERE tenant_id = '000000' AND user_id = 1

// 删除数据自动添加租户条件
DELETE FROM sys_user WHERE tenant_id = '000000' AND user_id = 1
```

**技术实现:**

多租户通过 `TenantLineInnerInterceptor` 拦截器实现,拦截所有 SQL 语句并自动添加 `tenant_id` 条件:

```java
/**
 * 多租户拦截器配置
 */
@Bean
public TenantLineInnerInterceptor tenantLineInnerInterceptor() {
    return new TenantLineInnerInterceptor(new TenantLineHandler() {

        /**
         * 获取当前租户ID
         */
        @Override
        public Expression getTenantId() {
            String tenantId = TenantHelper.getTenantId();
            return new StringValue(tenantId);
        }

        /**
         * 判断是否忽略该表
         */
        @Override
        public boolean ignoreTable(String tableName) {
            return tenantProperties.getIgnoreTables().contains(tableName);
        }
    });
}
```

---

## 审计日志

### 操作日志

记录用户的操作行为,支持 9 种业务类型:

```java
/**
 * 删除用户 - 记录操作日志
 */
@Log(title = "用户管理", businessType = BusinessType.DELETE)
@SaCheckPermission("system:user:remove")
@DeleteMapping("/{userIds}")
public R<Void> remove(@PathVariable Long[] userIds) {
    return toAjax(userService.deleteUserByIds(userIds));
}

/**
 * 新增用户 - 记录操作日志
 */
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@SaCheckPermission("system:user:add")
@PostMapping
public R<Void> add(@RequestBody SysUserBo bo) {
    return toAjax(userService.insertUser(bo));
}

/**
 * 导出用户数据 - 记录操作日志
 */
@Log(title = "用户管理", businessType = BusinessType.EXPORT)
@SaCheckPermission("system:user:export")
@PostMapping("/export")
public void export(HttpServletResponse response, SysUserBo bo) {
    List<SysUserVo> list = userService.selectUserList(bo);
    ExcelUtils.exportExcel(list, "用户数据", SysUserVo.class, response);
}
```

操作日志类型:

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| `INSERT` | 新增 | 创建用户、添加角色等 |
| `UPDATE` | 修改 | 编辑用户、修改配置等 |
| `DELETE` | 删除 | 删除用户、删除数据等 |
| `GRANT` | 授权 | 分配角色、授予权限等 |
| `EXPORT` | 导出 | 导出 Excel、导出数据等 |
| `IMPORT` | 导入 | 导入 Excel、批量导入等 |
| `FORCE` | 强退 | 强制用户下线 |
| `GENCODE` | 生成代码 | 使用代码生成器 |
| `CLEAN` | 清空数据 | 清空日志、清空缓存等 |

**操作日志实体:**

```java
/**
 * 操作日志信息
 */
public class SysOperLog {
    /** 日志主键 */
    private Long operId;
    /** 租户ID */
    private String tenantId;
    /** 操作模块 */
    private String title;
    /** 业务类型 */
    private Integer businessType;
    /** 请求方法 */
    private String method;
    /** 请求方式(GET/POST/PUT/DELETE) */
    private String requestMethod;
    /** 操作人员 */
    private String operName;
    /** 操作人员类型(PC/APP/MINI) */
    private String operatorType;
    /** 部门名称 */
    private String deptName;
    /** 请求URL */
    private String operUrl;
    /** 操作IP */
    private String operIp;
    /** 操作地点 */
    private String operLocation;
    /** 请求参数 */
    private String operParam;
    /** 返回结果 */
    private String jsonResult;
    /** 操作状态(0正常 1异常) */
    private Integer status;
    /** 错误消息 */
    private String errorMsg;
    /** 操作时间 */
    private Date operTime;
    /** 消耗时间(毫秒) */
    private Long costTime;
}
```

**技术实现:**

操作日志通过 `LogAspect` 切面实现,拦截标注了 `@Log` 注解的方法:

```java
/**
 * 操作日志切面
 */
@Around("@annotation(controllerLog)")
public Object around(ProceedingJoinPoint point, Log controllerLog) throws Throwable {
    long startTime = System.currentTimeMillis();

    try {
        // 执行方法
        Object result = point.proceed();

        // 记录正常日志
        long costTime = System.currentTimeMillis() - startTime;
        asyncLogService.saveOperLog(buildOperLog(point, controllerLog, result, costTime, null));

        return result;
    } catch (Exception e) {
        // 记录异常日志
        long costTime = System.currentTimeMillis() - startTime;
        asyncLogService.saveOperLog(buildOperLog(point, controllerLog, null, costTime, e));
        throw e;
    }
}
```

日志记录采用异步处理,不影响主业务性能。

### 登录日志

自动记录用户登录行为,包括登录成功和登录失败:

```java
/**
 * 登录日志信息
 */
public class SysLogininfor {
    /** 访问ID */
    private Long infoId;
    /** 租户ID */
    private String tenantId;
    /** 用户账号 */
    private String userName;
    /** 客户端类型(PC/APP/MINI) */
    private String clientKey;
    /** 设备类型 */
    private String deviceType;
    /** 登录IP */
    private String ipaddr;
    /** 登录地点 */
    private String loginLocation;
    /** 浏览器类型 */
    private String browser;
    /** 操作系统 */
    private String os;
    /** 登录状态(0成功 1失败) */
    private String status;
    /** 提示消息 */
    private String msg;
    /** 登录时间 */
    private Date loginTime;
}
```

**登录日志记录:**

```java
/**
 * 记录登录成功日志
 */
public void recordLoginSuccess(String username) {
    SysLogininfor logininfor = new SysLogininfor();
    logininfor.setTenantId(TenantHelper.getTenantId());
    logininfor.setUserName(username);
    logininfor.setClientKey(LoginHelper.getClientKey());
    logininfor.setDeviceType(LoginHelper.getDeviceType());
    logininfor.setIpaddr(ServletUtils.getClientIP());
    logininfor.setLoginLocation(AddressUtils.getRealAddressByIP(logininfor.getIpaddr()));
    logininfor.setBrowser(ServletUtils.getBrowser());
    logininfor.setOs(ServletUtils.getOs());
    logininfor.setStatus("0");
    logininfor.setMsg("登录成功");
    logininfor.setLoginTime(new Date());

    asyncLogService.saveLogininfor(logininfor);
}

/**
 * 记录登录失败日志
 */
public void recordLoginFailure(String username, String message) {
    SysLogininfor logininfor = new SysLogininfor();
    logininfor.setUserName(username);
    logininfor.setIpaddr(ServletUtils.getClientIP());
    logininfor.setStatus("1");
    logininfor.setMsg(message);
    logininfor.setLoginTime(new Date());

    asyncLogService.saveLogininfor(logininfor);
}
```

---

## 最佳实践

### 1. 密码安全策略

#### 密码强度要求

```java
/**
 * 密码强度验证
 */
public boolean validatePasswordStrength(String password) {
    // 最小长度 8 位
    if (password.length() < 8) {
        throw new ServiceException("密码长度不能少于8位");
    }

    // 必须包含大写字母
    if (!password.matches(".*[A-Z].*")) {
        throw new ServiceException("密码必须包含大写字母");
    }

    // 必须包含小写字母
    if (!password.matches(".*[a-z].*")) {
        throw new ServiceException("密码必须包含小写字母");
    }

    // 必须包含数字
    if (!password.matches(".*\\d.*")) {
        throw new ServiceException("密码必须包含数字");
    }

    // 必须包含特殊字符
    if (!password.matches(".*[!@#$%^&*()].*")) {
        throw new ServiceException("密码必须包含特殊字符");
    }

    return true;
}
```

#### 弱密码检测

```java
/**
 * 弱密码字典
 */
private static final Set<String> WEAK_PASSWORDS = Set.of(
    "12345678", "password", "admin123", "qwerty123",
    "abc123456", "11111111", "password123"
);

/**
 * 检测弱密码
 */
public boolean isWeakPassword(String password) {
    return WEAK_PASSWORDS.contains(password.toLowerCase());
}
```

#### 定期强制修改密码

```java
/**
 * 检查密码是否需要修改
 */
public boolean needChangePassword(SysUser user) {
    if (user.getPasswordUpdateTime() == null) {
        return true;
    }

    // 密码超过 90 天未修改,强制修改
    long days = ChronoUnit.DAYS.between(
        user.getPasswordUpdateTime().toInstant(),
        Instant.now()
    );

    return days >= 90;
}
```

### 2. Token 安全最佳实践

#### Token 刷新机制

```java
/**
 * 刷新 Token
 */
public String refreshToken() {
    // 检查当前 Token 是否即将过期(剩余时间 < 30分钟)
    long timeout = StpUtil.getTokenTimeout();
    if (timeout > 0 && timeout < 1800) {
        // 续签 Token,延长 7 天
        StpUtil.renewTimeout(7 * 24 * 3600);
    }

    return StpUtil.getTokenValue();
}
```

#### Token 黑名单

```java
/**
 * 将 Token 加入黑名单
 */
public void blacklistToken(String token) {
    String key = CacheConstants.TOKEN_BLACKLIST_KEY + token;
    long timeout = StpUtil.getTokenTimeoutByToken(token);

    // 在 Token 过期前一直保存在黑名单中
    RedisUtils.setCacheObject(key, true, timeout, TimeUnit.SECONDS);
}

/**
 * 检查 Token 是否在黑名单中
 */
public boolean isTokenBlacklisted(String token) {
    String key = CacheConstants.TOKEN_BLACKLIST_KEY + token;
    return RedisUtils.hasKey(key);
}
```

### 3. 敏感配置加密

使用 Jasypt 加密敏感配置:

```yaml
# 数据库密码加密
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ry-plus
    username: root
    password: ENC(加密后的密码)

# Redis 密码加密
spring:
  redis:
    password: ENC(加密后的密码)

# Jasypt 配置
jasypt:
  encryptor:
    # 加密密钥(通过环境变量传入)
    password: ${JASYPT_ENCRYPTOR_PASSWORD}
    # 加密算法
    algorithm: PBEWithMD5AndDES
    # 迭代次数
    iv-generator-classname: org.jasypt.iv.NoIvGenerator
```

**加密配置值:**

```bash
# 使用命令行工具加密
java -cp jasypt-1.9.3.jar org.jasypt.intf.cli.JasyptPBEStringEncryptionCLI \
  input="your_password" \
  password="your_jasypt_key" \
  algorithm=PBEWithMD5AndDES

# 输出:
# ----OUTPUT----
# ENC(加密后的密码)
```

### 4. 安全响应头配置

配置安全响应头防止常见攻击:

```java
@Bean
public FilterRegistrationBean<SecurityHeaderFilter> securityHeaderFilter() {
    FilterRegistrationBean<SecurityHeaderFilter> registration = new FilterRegistrationBean<>();
    registration.setFilter(new SecurityHeaderFilter());
    registration.addUrlPatterns("/*");
    return registration;
}

public class SecurityHeaderFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // X-Frame-Options: 防止点击劫持
        httpResponse.setHeader("X-Frame-Options", "SAMEORIGIN");

        // X-XSS-Protection: 启用浏览器 XSS 防护
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");

        // X-Content-Type-Options: 防止 MIME 类型嗅探
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");

        // Content-Security-Policy: 内容安全策略
        httpResponse.setHeader("Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'");

        // Strict-Transport-Security: 强制 HTTPS
        httpResponse.setHeader("Strict-Transport-Security",
            "max-age=31536000; includeSubDomains");

        // Referrer-Policy: 控制 Referer 头
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions-Policy: 控制浏览器特性
        httpResponse.setHeader("Permissions-Policy",
            "geolocation=(), microphone=(), camera=()");

        chain.doFilter(request, response);
    }
}
```

### 5. 日志脱敏

记录日志时自动脱敏敏感信息:

```java
/**
 * 日志脱敏工具
 */
public class LogDesensitizer {

    private static final Pattern PHONE_PATTERN =
        Pattern.compile("(1[3-9]\\d)\\d{4}(\\d{4})");
    private static final Pattern ID_CARD_PATTERN =
        Pattern.compile("(\\d{3})\\d{11}(\\d{4})");
    private static final Pattern BANK_CARD_PATTERN =
        Pattern.compile("(\\d{4})\\d+(\\d{4})");
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("(\\w)[\\w.]*(@[\\w.]+)");

    /**
     * 脱敏日志内容
     */
    public static String desensitize(String log) {
        if (log == null) {
            return null;
        }

        // 手机号脱敏: 138****5678
        log = PHONE_PATTERN.matcher(log).replaceAll("$1****$2");

        // 身份证脱敏: 110***********1234
        log = ID_CARD_PATTERN.matcher(log).replaceAll("$1***********$2");

        // 银行卡脱敏: 6222***********0123
        log = BANK_CARD_PATTERN.matcher(log).replaceAll("$1****$2");

        // 邮箱脱敏: t***@example.com
        log = EMAIL_PATTERN.matcher(log).replaceAll("$1***$2");

        return log;
    }
}
```

**使用示例:**

```java
// 记录日志前先脱敏
String logContent = "用户登录成功: 手机号=13812345678, 邮箱=test@example.com";
log.info(LogDesensitizer.desensitize(logContent));
// 输出: 用户登录成功: 手机号=138****5678, 邮箱=t***@example.com
```

### 6. HTTPS 配置

生产环境必须启用 HTTPS:

```yaml
# application-prod.yml
server:
  port: 443
  ssl:
    # 启用 SSL
    enabled: true
    # 证书路径
    key-store: classpath:ssl/server.jks
    # 证书密码
    key-store-password: ${SSL_PASSWORD}
    # 证书类型
    key-store-type: JKS
    # 证书别名
    key-alias: server

  # HTTP 自动重定向到 HTTPS
  http:
    port: 80
```

**HTTP 重定向配置:**

```java
@Bean
public TomcatServletWebServerFactory servletContainer() {
    TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
        @Override
        protected void postProcessContext(Context context) {
            SecurityConstraint constraint = new SecurityConstraint();
            constraint.setUserConstraint("CONFIDENTIAL");
            SecurityCollection collection = new SecurityCollection();
            collection.addPattern("/*");
            constraint.addCollection(collection);
            context.addConstraint(constraint);
        }
    };

    // 添加 HTTP 连接器
    tomcat.addAdditionalTomcatConnectors(createHttpConnector());
    return tomcat;
}

private Connector createHttpConnector() {
    Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
    connector.setScheme("http");
    connector.setPort(80);
    connector.setSecure(false);
    connector.setRedirectPort(443);
    return connector;
}
```

### 7. 防止暴力破解

#### 验证码保护

```java
/**
 * 登录接口 - 验证码保护
 */
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody loginBody) {
    // 验证码校验
    validateCaptcha(loginBody.getCode(), loginBody.getUuid());

    // 执行登录
    return R.ok(loginService.login(loginBody));
}

/**
 * 验证码校验
 */
private void validateCaptcha(String code, String uuid) {
    String cacheKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;
    String captcha = RedisUtils.getCacheObject(cacheKey);

    if (captcha == null) {
        throw new CaptchaException("验证码已过期");
    }

    if (!code.equalsIgnoreCase(captcha)) {
        throw new CaptchaException("验证码错误");
    }

    // 验证成功后删除验证码
    RedisUtils.deleteObject(cacheKey);
}
```

#### 滑动验证

```java
/**
 * 滑动验证码验证
 */
@PostMapping("/verify-slider")
public R<Boolean> verifySlider(@RequestBody SliderVerifyBo bo) {
    String cacheKey = CacheConstants.SLIDER_KEY + bo.getToken();
    Integer correctX = RedisUtils.getCacheObject(cacheKey);

    if (correctX == null) {
        throw new ServiceException("验证已过期,请重新验证");
    }

    // 允许 5 像素误差
    boolean success = Math.abs(bo.getX() - correctX) <= 5;

    if (success) {
        // 验证成功,设置通过标记
        RedisUtils.setCacheObject(cacheKey + ":passed", true, 5, TimeUnit.MINUTES);
    }

    return R.ok(success);
}
```

---

## 常见问题

### 1. Token 过期如何处理?

**问题原因:**
- Token 超过有效期(`timeout`)
- 用户长时间未操作超过临时有效期(`active-timeout`)
- 管理员强制下线用户
- Token 被加入黑名单

**解决方案:**

前端统一处理 401 错误:

```typescript
// 响应拦截器
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地 Token
      useUserStore().logout()
      // 跳转登录页
      router.push('/login')
      // 提示用户
      ElMessage.error('登录已过期,请重新登录')
    }
    return Promise.reject(error)
  }
)
```

后端 Token 续签:

```java
/**
 * 自动续签 Token
 */
@Component
public class TokenRefreshInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 检查 Token 剩余时间
        long timeout = StpUtil.getTokenTimeout();

        // 剩余时间小于 30 分钟,自动续签 7 天
        if (timeout > 0 && timeout < 1800) {
            StpUtil.renewTimeout(7 * 24 * 3600);
        }

        return true;
    }
}
```

### 2. 如何实现单点登录?

**解决方案:**

Sa-Token 支持多种单点登录模式:

```yaml
# 同端互斥登录(同一账号只能在一处登录)
sa-token:
  is-concurrent: false

# 同端多处登录(同一账号可以多处登录)
sa-token:
  is-concurrent: true
  is-share: false

# 同端多处登录,共享同一 Token
sa-token:
  is-concurrent: true
  is-share: true
```

踢人下线:

```java
// 踢出指定用户(所有设备)
StpUtil.kickout(userId);

// 踢出指定 Token
StpUtil.kickoutByTokenValue(tokenValue);

// 踢出指定设备
StpUtil.kickoutByDevice(userId, "pc");

// 封禁用户(禁止登录)
StpUtil.disable(userId, 3600);  // 禁用 1 小时
```

### 3. 加密字段如何查询?

**问题原因:**
- 加密后的数据无法直接进行模糊查询
- 加密数据可能包含特殊字符
- 不同加密算法生成的密文不同

**解决方案:**

#### 方案1: 使用摘要索引

```java
/**
 * 用户实体 - 支持加密字段查询
 */
public class SysUser {

    /** 手机号(加密存储) */
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phonenumber;

    /** 手机号 MD5(用于精确查询) */
    private String phonenumberMd5;
}

// 保存时计算 MD5
user.setPhonenumberMd5(DigestUtils.md5Hex(phone));

// 查询时使用 MD5 匹配
String searchMd5 = DigestUtils.md5Hex(searchPhone);
wrapper.eq(SysUser::getPhonenumberMd5, searchMd5);
```

#### 方案2: 后四位明文索引

```java
/**
 * 用户实体 - 支持模糊查询
 */
public class SysUser {

    /** 手机号(加密存储) */
    @EncryptField
    private String phonenumber;

    /** 手机号后四位(明文,用于模糊查询) */
    private String phoneLast4;
}

// 保存时同时存储后四位
user.setPhoneLast4(phone.substring(phone.length() - 4));

// 查询时使用后四位匹配
wrapper.like(SysUser::getPhoneLast4, searchLast4);
```

### 4. 如何自定义脱敏策略?

**解决方案:**

扩展 `SensitiveStrategy` 枚举:

```java
/**
 * 自定义脱敏策略 - 护照号(保留前2后2位)
 */
PASSPORT(s -> {
    if (s == null || s.length() <= 4) {
        return s;
    }
    return s.substring(0, 2) + "****" + s.substring(s.length() - 2);
}),

/**
 * 自定义脱敏策略 - 营业执照(保留前4后4位)
 */
BUSINESS_LICENSE(s -> {
    if (s == null || s.length() <= 8) {
        return s;
    }
    return s.substring(0, 4) + "**********" + s.substring(s.length() - 4);
});
```

使用自定义策略:

```java
@Sensitive(strategy = SensitiveStrategy.PASSPORT)
private String passportNo;

@Sensitive(strategy = SensitiveStrategy.BUSINESS_LICENSE)
private String businessLicense;
```

### 5. 限流配置不生效?

**问题原因:**
- Redis 未正确配置或连接失败
- 限流 Key 冲突导致多个接口共享限流配额
- 注解使用方式错误
- Redisson 客户端未正确初始化

**解决方案:**

#### 1. 检查 Redis 配置

```yaml
# 确保 Redis 正确配置
spring:
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD}
    database: ${REDIS_DATABASE:0}
```

#### 2. 确保限流 Key 唯一

```java
// ❌ 错误:多个接口使用相同 Key
@RateLimiter(key = "api:", time = 60, count = 10)
@PostMapping("/api1")
public R<Void> api1() { ... }

@RateLimiter(key = "api:", time = 60, count = 10)
@PostMapping("/api2")
public R<Void> api2() { ... }

// ✅ 正确:每个接口使用不同 Key
@RateLimiter(key = "api1:", time = 60, count = 10)
@PostMapping("/api1")
public R<Void> api1() { ... }

@RateLimiter(key = "api2:", time = 60, count = 10)
@PostMapping("/api2")
public R<Void> api2() { ... }
```

#### 3. 正确使用限流注解

```java
// ✅ 完整配置
@RateLimiter(
    key = "sms:send:",        // 唯一 Key
    time = 60,                // 时间窗口(秒)
    count = 1,                // 最大次数
    limitType = LimitType.IP, // 限流类型
    message = "操作过于频繁,请稍后再试"  // 错误提示
)
```

### 6. 多租户数据隔离失效?

**问题原因:**
- 租户拦截器未生效
- 某些表在忽略列表中
- 自定义 SQL 未添加租户条件
- 租户上下文丢失

**解决方案:**

#### 1. 检查租户配置

```yaml
tenant:
  enabled: true  # 确保启用
  ignore-tables:  # 检查是否误加入忽略列表
    - sys_dict_type
    - sys_dict_data
```

#### 2. 自定义 SQL 手动添加租户条件

```xml
<!-- MyBatis XML -->
<select id="selectCustomList" resultType="SysUser">
    SELECT * FROM sys_user
    WHERE tenant_id = #{tenantId}  <!-- 手动添加租户条件 -->
    AND del_flag = '0'
</select>
```

#### 3. 临时忽略租户过滤

```java
// 某些场景需要跨租户查询(谨慎使用)
TenantHelper.ignore(() -> {
    // 这里的查询会忽略租户过滤
    return userMapper.selectList(null);
});
```

---

## 安全检查清单

### 部署前安全检查

- [ ] **密码安全**
  - [ ] 修改所有默认密码(数据库、Redis、管理员账号等)
  - [ ] 配置密码强度策略(最小长度、复杂度要求)
  - [ ] 启用密码重试锁定机制(最大5次,锁定10分钟)
  - [ ] 配置密码定期强制修改(建议90天)

- [ ] **网络安全**
  - [ ] 配置 HTTPS,禁用 HTTP 或强制重定向
  - [ ] 配置防火墙,仅开放必要端口(80/443/22)
  - [ ] 配置安全响应头(X-Frame-Options、CSP 等)
  - [ ] 启用 HSTS(HTTP Strict Transport Security)

- [ ] **应用安全**
  - [ ] 关闭调试模式(`spring.profiles.active=prod`)
  - [ ] 关闭详细错误信息(`server.error.include-message=never`)
  - [ ] 启用 SQL 注入防护(MyBatis-Plus 默认启用)
  - [ ] 启用 XSS 防护(`xss.enabled=true`)
  - [ ] 配置 CORS 白名单,禁止跨域访问

- [ ] **认证授权**
  - [ ] 配置合理的 Token 过期时间(建议30天)
  - [ ] 配置 Token 临时有效期(建议30分钟无操作过期)
  - [ ] 配置登录验证码(防止暴力破解)
  - [ ] 配置滑动验证(高风险操作)
  - [ ] 配置 Actuator 端点认证

- [ ] **数据安全**
  - [ ] 启用字段加密(`mybatis-encryptor.enabled=true`)
  - [ ] 配置加密密钥(通过环境变量传入,不写入配置文件)
  - [ ] 启用敏感数据脱敏(`@Sensitive` 注解)
  - [ ] 启用多租户隔离(`tenant.enabled=true`)
  - [ ] 配置数据权限控制(`@DataScope` 注解)

- [ ] **接口安全**
  - [ ] 启用接口限流(`@RateLimiter` 注解)
  - [ ] 启用幂等性控制(`@RepeatSubmit` 注解)
  - [ ] 启用 API 加密(`@ApiEncrypt` 注解,高敏感接口)
  - [ ] 配置接口白名单(公开接口使用 `@SaIgnore`)

- [ ] **日志审计**
  - [ ] 启用操作日志(`@Log` 注解)
  - [ ] 启用登录日志(自动记录)
  - [ ] 配置日志脱敏(敏感信息不记录到日志)
  - [ ] 配置日志保留期限(建议180天)
  - [ ] 配置日志备份策略

- [ ] **配置安全**
  - [ ] 使用 Jasypt 加密敏感配置
  - [ ] 通过环境变量传入密钥,不写入配置文件
  - [ ] 检查配置文件权限(仅应用进程可读)
  - [ ] 禁止配置文件提交到版本控制

### 定期安全审计

- [ ] **每周检查**
  - [ ] 检查异常登录记录(异地登录、凌晨登录等)
  - [ ] 检查失败登录记录(密码错误次数过多)
  - [ ] 检查限流触发记录(频繁触发限流的 IP)
  - [ ] 检查幂等性触发记录(重复提交行为)

- [ ] **每月检查**
  - [ ] 审计敏感操作日志(删除、导出、授权等)
  - [ ] 检查权限配置是否合理(权限过大、权限过小)
  - [ ] 检查数据权限配置(是否有越权访问)
  - [ ] 检查租户隔离是否生效(跨租户访问)

- [ ] **每季度检查**
  - [ ] 更新安全依赖版本(Spring Boot、Sa-Token 等)
  - [ ] 检查 SSL 证书有效期(提前30天续期)
  - [ ] 测试备份恢复流程(确保数据可恢复)
  - [ ] 进行渗透测试(模拟攻击场景)
  - [ ] 审查代码安全(静态代码分析)

---

## 总结

RuoYi-Plus 框架提供了完善的企业级安全防护体系,覆盖认证授权、数据加密、敏感数据脱敏、接口安全、审计日志等多个层面。开发者应遵循最佳实践,正确配置和使用各项安全功能,确保应用的安全性和稳定性。

**核心要点:**

1. **认证授权**: 基于 Sa-Token 实现,支持多用户体系、多设备登录、JWT Simple 模式
2. **数据加密**: 支持 AES/RSA/SM2/SM4 多种算法,提供字段加密和接口加密
3. **数据脱敏**: 内置 14 种脱敏策略,支持条件脱敏,集成 Jackson 序列化
4. **接口安全**: 提供限流、幂等、XSS 防护、SQL 注入防护等机制
5. **审计日志**: 完整记录操作日志和登录日志,支持安全审计
6. **最佳实践**: 密码安全、Token 安全、配置加密、HTTPS、日志脱敏等

**安全建议:**

- 生产环境必须启用 HTTPS
- 定期更新安全依赖版本
- 定期进行安全审计和渗透测试
- 遵循最小权限原则
- 敏感配置通过环境变量传入
- 定期备份数据并测试恢复流程
