# 认证授权最佳实践

## 介绍

RuoYi-Plus 基于 Sa-Token 1.44.0 构建了完整的认证授权体系,支持多种认证方式、细粒度权限控制、多端设备管理等企业级特性。本文档详细介绍认证授权的最佳实践,包括登录认证、权限验证、角色管理、社交登录、多租户认证等核心功能的实现和使用方法。

**核心特性:**

- **多种认证方式** - 支持账号密码、短信验证码、社交登录、扫码登录等多种认证方式
- **细粒度权限控制** - 基于注解的接口级权限控制,支持权限、角色、逻辑组合等多种校验方式
- **灵活的会话管理** - Token 创建、刷新、续期、踢出等完整的会话生命周期管理
- **多端设备支持** - 支持 PC、APP、小程序等多端登录,可配置互斥或并发模式
- **社交账号集成** - 支持 GitHub、Gitee、微信、QQ 等主流平台的第三方登录
- **多租户隔离** - 完善的多租户认证体系,确保租户间数据和权限完全隔离

---

## 认证策略

### 策略模式设计

系统采用策略模式实现多种认证方式,每种认证类型对应一个策略实现:

```java
/**
 * 认证策略接口
 */
public interface IAuthStrategy {

    /**
     * 登录方法
     *
     * @param body     登录请求体(JSON字符串)
     * @param authType 认证类型
     * @return 认证令牌
     */
    static AuthTokenVo login(String body, String authType) {
        // 获取对应的认证策略
        IAuthStrategy authStrategy = STRATEGY_MAP.get(authType);
        if (authStrategy == null) {
            throw ServiceException.of("不支持的认证类型: " + authType);
        }
        // 执行认证策略
        return authStrategy.doLogin(body);
    }

    /**
     * 执行登录
     */
    AuthTokenVo doLogin(String body);
}
```

### 支持的认证类型

| 认证类型 | 说明 | 使用场景 |
|---------|------|----------|
| `password` | 账号密码登录 | PC 端、管理后台 |
| `sms` | 短信验证码登录 | 移动端、无密码登录 |
| `email` | 邮箱验证码登录 | 邮箱注册用户 |
| `social` | 社交账号登录 | GitHub、Gitee、微信等 |
| `xcx` | 微信小程序登录 | 小程序端 |
| `mobile` | 手机号一键登录 | APP 端 |

### 密码登录实现

```java
/**
 * 密码认证策略
 */
@Component("password")
public class PasswordAuthStrategy implements IAuthStrategy {

    private final SysLoginService loginService;

    @Override
    public AuthTokenVo doLogin(String body) {
        // 解析登录信息
        LoginBody loginBody = JsonUtils.parseObject(body, LoginBody.class);
        ValidatorUtils.validate(loginBody);

        // 验证码校验
        validateCaptcha(loginBody.getCode(), loginBody.getUuid());

        // 用户名密码认证
        LoginUser loginUser = loginService.login(
            loginBody.getUsername(),
            loginBody.getPassword(),
            loginBody.getAuthType()
        );

        // 记录登录日志
        LoginHelper.recordLoginInfo(loginUser.getUserId());

        // 执行登录
        SaLoginParameter loginParameter = new SaLoginParameter()
            .setDevice(loginBody.getDevice())           // 设备类型
            .setTimeout(loginBody.getTimeout())         // 过期时间
            .setActiveTimeout(loginBody.getActiveTimeout()); // 活跃超时

        LoginHelper.login(loginUser, loginParameter);

        // 返回 Token
        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .build();
    }

    /**
     * 验证码校验
     */
    private void validateCaptcha(String code, String uuid) {
        String captchaKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;
        String captcha = CacheUtils.get(captchaKey);

        if (captcha == null) {
            throw ServiceException.of("验证码已过期");
        }
        if (!code.equalsIgnoreCase(captcha)) {
            throw ServiceException.of("验证码错误");
        }
        // 删除验证码
        CacheUtils.evict(captchaKey);
    }
}
```

### 短信验证码登录

```java
/**
 * 短信认证策略
 */
@Component("sms")
public class SmsAuthStrategy implements IAuthStrategy {

    private final SysUserService userService;
    private final ISmsService smsService;

    @Override
    public AuthTokenVo doLogin(String body) {
        // 解析登录信息
        SmsLoginBody loginBody = JsonUtils.parseObject(body, SmsLoginBody.class);
        ValidatorUtils.validate(loginBody);

        // 验证短信验证码
        boolean valid = smsService.validateSmsCode(
            loginBody.getPhoneNumber(),
            loginBody.getSmsCode()
        );
        if (!valid) {
            throw ServiceException.of("验证码错误或已过期");
        }

        // 根据手机号查询用户
        SysUser user = userService.selectUserByPhonenumber(loginBody.getPhoneNumber());
        if (user == null) {
            throw ServiceException.of("该手机号未注册");
        }

        // 构建登录用户信息
        LoginUser loginUser = buildLoginUser(user);

        // 执行登录
        LoginHelper.login(loginUser, new SaLoginParameter()
            .setDevice(loginBody.getDevice()));

        // 返回 Token
        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .build();
    }
}
```

---

## 权限验证

### 注解方式

框架提供丰富的权限注解用于接口级权限控制:

#### 基础权限注解

```java
/**
 * 权限验证 - 必须拥有指定权限
 */
@SaCheckPermission("system:user:list")
@GetMapping("/list")
public TableDataInfo<SysUserVo> list(SysUserBo bo) {
    return userService.selectPageUserList(bo);
}

/**
 * 角色验证 - 必须拥有指定角色
 */
@SaCheckRole("admin")
@PostMapping("/resetPwd")
public R<Void> resetPwd(@RequestBody SysUserBo bo) {
    return toAjax(userService.resetPwd(bo));
}

/**
 * 登录验证 - 必须登录才能访问
 */
@SaCheckLogin
@GetMapping("/getInfo")
public R<Map<String, Object>> getInfo() {
    return R.ok(userService.getUserInfo());
}

/**
 * 忽略验证 - 无需登录即可访问
 */
@SaIgnore
@GetMapping("/captcha")
public R<CaptchaVo> getCaptcha() {
    return R.ok(captchaService.createCaptcha());
}
```

#### 逻辑组合注解

```java
/**
 * OR 模式 - 满足其中一个权限即可
 */
@SaCheckPermission(value = {
    "system:user:add",
    "system:user:edit"
}, mode = SaMode.OR)
@PostMapping("/save")
public R<Void> save(@RequestBody SysUserBo bo) {
    return toAjax(userService.save(bo));
}

/**
 * AND 模式 - 必须同时拥有多个权限
 */
@SaCheckPermission(value = {
    "system:user:remove",
    "system:user:confirm"
}, mode = SaMode.AND)
@DeleteMapping("/{userIds}")
public R<Void> remove(@PathVariable Long[] userIds) {
    return toAjax(userService.deleteUserByIds(userIds));
}

/**
 * 角色 OR 权限 - 拥有角色或权限之一即可
 */
@SaCheckRole("admin")
@SaCheckPermission(value = "system:config:edit", mode = SaMode.OR)
@PutMapping
public R<Void> edit(@RequestBody SysConfigBo bo) {
    return toAjax(configService.updateConfig(bo));
}
```

### 编程式验证

在业务代码中进行权限验证:

```java
/**
 * 权限验证示例
 */
public class UserService {

    /**
     * 检查是否有权限
     */
    public void checkPermission(Long userId) {
        // 检查是否登录
        if (!StpUtil.isLogin()) {
            throw ServiceException.of("请先登录");
        }

        // 检查权限
        if (!StpUtil.hasPermission("system:user:query")) {
            throw ServiceException.of("无权限访问");
        }

        // 检查角色
        if (!StpUtil.hasRole("admin")) {
            throw ServiceException.of("需要管理员角色");
        }

        // 检查是否为本人数据
        if (!LoginHelper.getUserId().equals(userId) && !LoginHelper.isSuperAdmin()) {
            throw ServiceException.of("只能操作自己的数据");
        }
    }

    /**
     * 检查任意权限
     */
    public boolean hasAnyPermission(String... permissions) {
        for (String permission : permissions) {
            if (StpUtil.hasPermission(permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查全部权限
     */
    public boolean hasAllPermissions(String... permissions) {
        for (String permission : permissions) {
            if (!StpUtil.hasPermission(permission)) {
                return false;
            }
        }
        return true;
    }
}
```

### 权限数据源

Sa-Token 从 `SaPermissionImpl` 获取用户的权限和角色信息:

```java
/**
 * Sa-Token 权限管理实现
 */
@Component
public class SaPermissionImpl implements StpInterface {

    @Override
    public List<String> getPermissionList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();

        // 当前用户权限查询
        if (loginUser != null && loginUser.getLoginId().equals(loginId)) {
            return new ArrayList<>(loginUser.getMenuPermission());
        }

        // 跨用户权限查询
        return getPermissionFromService(loginId);
    }

    @Override
    public List<String> getRoleList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();

        // 当前用户角色查询
        if (loginUser != null && loginUser.getLoginId().equals(loginId)) {
            return new ArrayList<>(loginUser.getRolePermission());
        }

        // 跨用户角色查询
        return getRoleFromService(loginId);
    }

    /**
     * 从服务层查询权限
     */
    private List<String> getPermissionFromService(Object loginId) {
        PermissionService permissionService = SpringUtils.getBean(PermissionService.class);
        Long userId = extractUserId(loginId);
        return new ArrayList<>(permissionService.listMenuPermissions(userId));
    }
}
```

---

## 会话管理

### Token 配置

合理配置 Token 参数确保安全性和用户体验:

```yaml
# Sa-Token 配置
sa-token:
  # Token 名称(同时也是 Cookie 名称)
  token-name: Authorization
  # Token 前缀
  token-prefix: Bearer
  # Token 有效期(秒),-1 代表永不过期
  timeout: 86400                # 24小时
  # Token 临时有效期(秒),在指定时间内无操作则视为过期
  active-timeout: 1800          # 30分钟
  # 是否允许同一账号并发登录(为 false 时新登录挤掉旧登录)
  is-concurrent: true
  # 在多人登录同一账号时,是否共用一个 Token
  is-share: false
  # Token 风格(uuid、simple-uuid、random-32、random-64、random-128、tik)
  token-style: uuid
  # 是否在初始化配置时打印版本字符画
  is-print: false
```

### Token 续期

实现自动续期和手动刷新:

```java
/**
 * Token 续期实现
 */
public class TokenService {

    /**
     * 自动续期 - 在每次请求时更新活跃时间
     */
    public void updateLastActiveTime() {
        if (StpUtil.isLogin()) {
            // 更新 Token 的最后活跃时间
            StpUtil.updateLastActiveTime();
        }
    }

    /**
     * 手动刷新 Token - 延长 Token 有效期
     */
    public String refreshToken() {
        if (!StpUtil.isLogin()) {
            throw ServiceException.of("请先登录");
        }

        // 获取当前 Token
        String oldToken = StpUtil.getTokenValue();

        // 刷新 Token(延长有效期)
        StpUtil.renewTimeout(86400);

        return oldToken;
    }

    /**
     * 生成新 Token - 替换旧 Token
     */
    public String generateNewToken() {
        if (!StpUtil.isLogin()) {
            throw ServiceException.of("请先登录");
        }

        // 获取登录 ID
        Object loginId = StpUtil.getLoginId();

        // 先踢出旧 Token
        StpUtil.logout();

        // 重新登录生成新 Token
        StpUtil.login(loginId);

        return StpUtil.getTokenValue();
    }
}
```

### 多端登录控制

配置不同设备的登录策略:

```java
/**
 * 多端登录配置
 */
public class MultiDeviceConfig {

    /**
     * 同端互斥登录 - PC端只能一处登录
     */
    public void pcExclusiveLogin(LoginUser loginUser) {
        SaLoginParameter parameter = new SaLoginParameter()
            .setDevice("PC")
            .setIsLastingCookie(true)     // 记住我
            .setTimeout(86400);            // 24小时

        // is-concurrent=false 时,同设备类型只能一处登录
        LoginHelper.login(loginUser, parameter);
    }

    /**
     * 跨端并发登录 - PC和手机可同时在线
     */
    public void multiDeviceLogin(LoginUser loginUser, String deviceType) {
        SaLoginParameter parameter = new SaLoginParameter()
            .setDevice(deviceType)         // PC、APP、MINI
            .setExtra("ip", ServletUtils.getClientIP())
            .setExtra("loginTime", System.currentTimeMillis());

        // 不同设备类型可以同时在线
        LoginHelper.login(loginUser, parameter);
    }

    /**
     * 获取用户所有在线设备
     */
    public List<TokenDevice> listOnlineDevices(Long userId) {
        List<TokenDevice> devices = new ArrayList<>();

        // 获取用户所有 Token
        List<String> tokenList = StpUtil.getTokenValueListByLoginId(userId);

        for (String token : tokenList) {
            SaSession session = StpUtil.getTokenSessionByToken(token);

            TokenDevice device = TokenDevice.builder()
                .token(token)
                .device((String) session.get("device"))
                .ip((String) session.get("ip"))
                .loginTime((Long) session.get("loginTime"))
                .build();

            devices.add(device);
        }

        return devices;
    }

    /**
     * 踢出指定设备
     */
    public void kickoutDevice(String token) {
        StpUtil.kickoutByTokenValue(token);
    }
}
```

---

## 社交登录

### 支持的平台

系统基于 JustAuth 实现第三方登录,支持主流平台:

| 平台 | 标识 | 说明 |
|------|------|------|
| GitHub | `github` | GitHub 账号登录 |
| Gitee | `gitee` | Gitee 账号登录 |
| 微信开放平台 | `wechat_open` | 微信扫码登录 |
| 微信公众号 | `wechat_mp` | 公众号授权登录 |
| QQ | `qq` | QQ 账号登录 |
| 微博 | `weibo` | 微博账号登录 |

### 社交登录配置

```yaml
# 社交登录配置
social:
  type:
    # GitHub 登录配置
    github:
      client-id: ${GITHUB_CLIENT_ID}
      client-secret: ${GITHUB_CLIENT_SECRET}
      redirect-uri: http://localhost:8080/auth/social/callback

    # Gitee 登录配置
    gitee:
      client-id: ${GITEE_CLIENT_ID}
      client-secret: ${GITEE_CLIENT_SECRET}
      redirect-uri: http://localhost:8080/auth/social/callback

    # 微信开放平台配置
    wechat_open:
      client-id: ${WECHAT_APP_ID}
      client-secret: ${WECHAT_APP_SECRET}
      redirect-uri: http://localhost:8080/auth/social/callback
```

### 社交登录流程

```java
/**
 * 社交登录控制器
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final SocialProperties socialProperties;
    private final SysLoginService loginService;

    /**
     * 第一步: 获取授权 URL
     */
    @SaIgnore
    @GetMapping("/socialBindUrl/{source}")
    public R<String> socialBindUrl(@PathVariable String source,
                                    @RequestParam String domain,
                                    @RequestParam(required = false) String inviteCode) {
        // 检查平台配置
        SocialLoginConfigProperties config = socialProperties.getType().get(source);
        if (config == null) {
            return R.fail(source + "平台账号暂不支持");
        }

        // 构建认证请求
        AuthRequest authRequest = SocialUtils.getAuthRequest(source, socialProperties);

        // 构建状态参数
        Map<String, String> state = new HashMap<>();
        state.put("tenantId", TenantHelper.getTenantId());
        state.put("domain", domain);
        state.put("state", AuthStateUtils.createState());
        if (StringUtils.isNotBlank(inviteCode)) {
            state.put("inviteCode", inviteCode);
        }

        // 生成授权 URL
        String stateStr = Base64.encode(JsonUtils.toJsonString(state), StandardCharsets.UTF_8);
        String authorizeUrl = authRequest.authorize(stateStr);

        return R.ok("操作成功", authorizeUrl);
    }

    /**
     * 第二步: 授权回调
     */
    @SaIgnore
    @GetMapping("/social/callback")
    public R<AuthTokenVo> socialCallback(@RequestParam String code,
                                          @RequestParam String state) {
        // 解析状态参数
        String stateJson = Base64.decodeStr(state, StandardCharsets.UTF_8);
        Map<String, String> stateMap = JsonUtils.parseMap(stateJson);

        String source = stateMap.get("source");
        String tenantId = stateMap.get("tenantId");

        // 获取第三方用户信息
        AuthResponse<AuthUser> response = SocialUtils.loginAuth(source, code, state, socialProperties);
        if (!response.ok()) {
            return R.fail(response.getMsg());
        }

        AuthUser authUser = response.getData();

        // 登录或注册
        AuthTokenVo token = loginService.socialLogin(authUser, tenantId);

        return R.ok(token);
    }

    /**
     * 第三步: 绑定社交账号(已登录用户)
     */
    @PostMapping("/socialBind")
    public R<Void> socialBind(@RequestBody SocialLoginBody loginBody) {
        // 获取第三方登录信息
        AuthResponse<AuthUser> response = SocialUtils.loginAuth(
            loginBody.getSource(),
            loginBody.getSocialCode(),
            loginBody.getSocialState(),
            socialProperties
        );

        if (!response.ok()) {
            return R.fail(response.getMsg());
        }

        // 绑定社交账号
        loginService.bindSocialAccount(response.getData());

        return R.ok();
    }

    /**
     * 解绑社交账号
     */
    @DeleteMapping("/socialUnbind/{socialId}")
    public R<Void> socialUnbind(@PathVariable Long socialId) {
        boolean success = socialUserService.deleteSocialUser(socialId);
        return success ? R.ok() : R.fail("解绑失败");
    }
}
```

### 社交登录服务

```java
/**
 * 社交登录服务实现
 */
@Service
public class SocialLoginService {

    private final ISysUserService userService;
    private final ISysSocialService socialService;

    /**
     * 社交账号登录
     */
    public AuthTokenVo socialLogin(AuthUser authUser, String tenantId) {
        // 查询是否已绑定
        SysSocialUser socialUser = socialService.selectByAuthId(authUser.getUuid());

        LoginUser loginUser;

        if (socialUser != null) {
            // 已绑定 - 直接登录
            SysUser user = userService.getUserById(socialUser.getUserId());
            if (user == null) {
                throw ServiceException.of("绑定的用户不存在");
            }
            loginUser = buildLoginUser(user);
        } else {
            // 未绑定 - 自动注册
            SysUser newUser = registerSocialUser(authUser, tenantId);
            loginUser = buildLoginUser(newUser);
        }

        // 执行登录
        LoginHelper.login(loginUser);

        // 返回 Token
        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .build();
    }

    /**
     * 自动注册社交用户
     */
    private SysUser registerSocialUser(AuthUser authUser, String tenantId) {
        SysUser user = new SysUser();
        user.setUserName(generateUsername(authUser));
        user.setNickName(authUser.getNickname());
        user.setAvatar(authUser.getAvatar());
        user.setEmail(authUser.getEmail());
        user.setUserType(UserType.APP.getUserType());

        // 保存用户
        userService.insertUser(user);

        // 绑定社交账号
        SysSocialUser socialUser = new SysSocialUser();
        socialUser.setUserId(user.getUserId());
        socialUser.setAuthId(authUser.getUuid());
        socialUser.setSource(authUser.getSource());
        socialUser.setAccessToken(authUser.getToken().getAccessToken());

        socialService.insertSocialUser(socialUser);

        return user;
    }
}
```

---

## 多租户认证

### 租户隔离

系统支持完善的多租户认证体系:

```java
/**
 * 租户认证处理
 */
public class TenantAuthService {

    /**
     * 租户有效性检查
     */
    public void checkTenant(String tenantId) {
        if (!TenantHelper.isEnable()) {
            return;
        }

        if (StringUtils.isBlank(tenantId)) {
            throw ServiceException.of("租户ID不能为空");
        }

        // 查询租户信息
        SysTenant tenant = tenantService.selectByTenantId(tenantId);

        if (tenant == null) {
            throw ServiceException.of("租户不存在");
        }

        if (TenantStatus.DISABLE.getCode().equals(tenant.getStatus())) {
            throw ServiceException.of("租户已被禁用");
        }

        if (tenant.getExpireTime() != null &&
            tenant.getExpireTime().before(new Date())) {
            throw ServiceException.of("租户已过期");
        }
    }

    /**
     * 租户切换
     */
    public void switchTenant(String tenantId) {
        // 检查租户有效性
        checkTenant(tenantId);

        // 检查用户是否有该租户权限
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (!canAccessTenant(loginUser.getUserId(), tenantId)) {
            throw ServiceException.of("无权访问该租户");
        }

        // 切换租户上下文
        TenantHelper.setTenantId(tenantId);

        // 更新 Token 中的租户信息
        StpUtil.getTokenSession().set(LoginHelper.TENANT_ID, tenantId);

        // 更新登录用户信息
        loginUser.setTenantId(tenantId);
        StpUtil.getTokenSession().set(LoginHelper.LOGIN_USER, loginUser);
    }

    /**
     * 检查用户是否可访问租户
     */
    private boolean canAccessTenant(Long userId, String tenantId) {
        // 超级管理员可访问所有租户
        if (LoginHelper.isSuperAdmin(userId)) {
            return true;
        }

        // 查询用户的租户权限
        List<String> userTenants = userService.getUserTenantIds(userId);
        return userTenants.contains(tenantId);
    }
}
```

### 租户配置获取

```java
/**
 * 获取租户配置
 */
@SaCheckRole(TenantConstants.SUPER_ADMIN_ROLE_KEY)
@GetMapping("/getTenantConfig")
public R<TenantConfigVo> getTenantConfig() {
    TenantConfigVo vo = new TenantConfigVo();

    // 设置租户功能是否启用
    vo.setTenantEnabled(TenantHelper.isEnable());

    if (!vo.getTenantEnabled()) {
        return R.ok(vo);
    }

    // 查询所有租户列表
    List<SysTenantVo> tenantList = tenantService.list(new SysTenantBo());

    // 转换为前端展示对象
    List<TenantOptionVo> options = MapstructUtils.convert(tenantList, TenantOptionVo.class);

    vo.setTenantList(options);

    return R.ok(vo);
}
```

---

## 最佳实践

### 1. 安全的密码认证

```java
/**
 * 密码认证最佳实践
 */
public class PasswordAuthBestPractice {

    /**
     * 密码加密存储
     */
    public void encryptPassword(SysUser user, String rawPassword) {
        // 使用 BCrypt 加密,自动加盐
        String encryptedPassword = BCrypt.hashpw(rawPassword, BCrypt.gensalt());
        user.setPassword(encryptedPassword);
    }

    /**
     * 密码验证
     */
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }

    /**
     * 密码强度验证
     */
    public void validatePasswordStrength(String password) {
        // 长度检查
        if (password.length() < 8) {
            throw ServiceException.of("密码长度不能少于8位");
        }

        // 复杂度检查
        boolean hasUpperCase = password.matches(".*[A-Z].*");
        boolean hasLowerCase = password.matches(".*[a-z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecialChar = password.matches(".*[!@#$%^&*()].*");

        int complexity = 0;
        if (hasUpperCase) complexity++;
        if (hasLowerCase) complexity++;
        if (hasDigit) complexity++;
        if (hasSpecialChar) complexity++;

        if (complexity < 3) {
            throw ServiceException.of("密码必须包含大写字母、小写字母、数字、特殊字符中的至少3种");
        }
    }

    /**
     * 登录失败处理
     */
    public void handleLoginFailure(String username) {
        String key = CacheConstants.PWD_ERR_CNT_KEY + username;

        // 获取失败次数
        Integer errCount = CacheUtils.get(key);
        errCount = errCount == null ? 0 : errCount;

        errCount++;

        // 记录失败次数
        CacheUtils.put(key, errCount, Duration.ofMinutes(10));

        // 失败次数过多,锁定账户
        if (errCount >= 5) {
            userService.lockAccount(username, Duration.ofMinutes(30));
            throw ServiceException.of("密码错误次数过多,账户已被锁定30分钟");
        }

        throw ServiceException.of(String.format("密码错误,剩余尝试次数: %d", 5 - errCount));
    }
}
```

### 2. Token 安全管理

```java
/**
 * Token 安全最佳实践
 */
public class TokenSecurityBestPractice {

    /**
     * 生成安全的 Token
     */
    public String generateSecureToken(LoginUser loginUser) {
        // 配置登录参数
        SaLoginParameter parameter = new SaLoginParameter()
            .setDevice(loginUser.getDeviceType())
            .setTimeout(86400)              // 24小时过期
            .setActiveTimeout(1800)         // 30分钟无操作过期
            .setExtra("ip", ServletUtils.getClientIP())
            .setExtra("userAgent", ServletUtils.getUserAgent())
            .setExtra("loginTime", System.currentTimeMillis());

        // 执行登录
        LoginHelper.login(loginUser, parameter);

        return StpUtil.getTokenValue();
    }

    /**
     * Token 安全校验
     */
    public void validateToken(String token) {
        // Token 格式校验
        if (StringUtils.isBlank(token)) {
            throw ServiceException.of("Token不能为空");
        }

        // Token 有效性校验
        if (!StpUtil.getTokenValueByToken(token).equals(token)) {
            throw ServiceException.of("Token无效");
        }

        // IP 校验
        SaSession session = StpUtil.getTokenSessionByToken(token);
        String loginIp = (String) session.get("ip");
        String currentIp = ServletUtils.getClientIP();

        if (!loginIp.equals(currentIp)) {
            log.warn("IP地址发生变化,登录IP: {}, 当前IP: {}", loginIp, currentIp);
            // 可选择是否踢出用户
            // StpUtil.kickoutByTokenValue(token);
        }

        // UserAgent 校验
        String loginUA = (String) session.get("userAgent");
        String currentUA = ServletUtils.getUserAgent();

        if (!loginUA.equals(currentUA)) {
            log.warn("UserAgent发生变化");
        }
    }

    /**
     * 定期清理过期 Token
     */
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
    public void cleanExpiredTokens() {
        // Sa-Token 会自动清理过期 Token
        log.info("开始清理过期Token");
    }
}
```

### 3. 权限缓存优化

```java
/**
 * 权限缓存优化
 */
public class PermissionCacheBestPractice {

    /**
     * 缓存用户权限
     */
    @Cacheable(value = CacheNames.SYS_USER_PERMISSION, key = "#userId")
    public Set<String> getUserPermissions(Long userId) {
        return permissionService.selectPermissionByUserId(userId);
    }

    /**
     * 缓存用户角色
     */
    @Cacheable(value = CacheNames.SYS_USER_ROLE, key = "#userId")
    public Set<String> getUserRoles(Long userId) {
        return roleService.selectRoleKeysByUserId(userId);
    }

    /**
     * 刷新用户权限缓存
     */
    public void refreshUserPermission(Long userId) {
        // 清除权限缓存
        CacheUtils.evict(CacheNames.SYS_USER_PERMISSION, userId);
        CacheUtils.evict(CacheNames.SYS_USER_ROLE, userId);

        // 如果用户在线,强制踢出重新登录
        if (StpUtil.isLogin(userId)) {
            StpUtil.kickout(userId);
        }
    }

    /**
     * 批量刷新权限
     */
    public void batchRefreshPermissions(List<Long> userIds) {
        userIds.forEach(this::refreshUserPermission);
    }
}
```

### 4. 防暴力破解

```java
/**
 * 防暴力破解最佳实践
 */
public class AntiBruteForceBestPractice {

    /**
     * IP 限流
     */
    @RateLimiter(key = "login:ip:", time = 60, count = 10, limitType = LimitType.IP)
    public void checkIpLoginLimit() {
        // 同一IP 60秒内最多尝试10次
    }

    /**
     * 用户名限流
     */
    @RateLimiter(key = "login:user:", time = 300, count = 5, limitType = LimitType.USER)
    public void checkUserLoginLimit(String username) {
        // 同一用户名 5分钟内最多尝试5次
    }

    /**
     * 验证码验证
     */
    public void requireCaptchaAfterFailures(String username) {
        String key = CacheConstants.PWD_ERR_CNT_KEY + username;
        Integer errCount = CacheUtils.get(key);

        // 失败3次后要求验证码
        if (errCount != null && errCount >= 3) {
            throw ServiceException.of("请输入验证码");
        }
    }

    /**
     * 异常登录检测
     */
    public void detectAbnormalLogin(LoginUser loginUser) {
        String key = "login:history:" + loginUser.getUserId();

        // 获取登录历史
        List<LoginHistory> history = CacheUtils.get(key);

        if (history != null && !history.isEmpty()) {
            LoginHistory last = history.get(history.size() - 1);

            // 检测异常登录地点
            if (!isSameLocation(last.getIp(), ServletUtils.getClientIP())) {
                // 发送异常登录通知
                sendAbnormalLoginNotification(loginUser);
            }
        }

        // 记录本次登录
        LoginHistory current = new LoginHistory();
        current.setIp(ServletUtils.getClientIP());
        current.setTime(new Date());
        history.add(current);

        // 保留最近10次登录记录
        if (history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }

        CacheUtils.put(key, history, Duration.ofDays(30));
    }
}
```

### 5. 会话并发控制

```java
/**
 * 会话并发控制
 */
public class SessionConcurrencyControl {

    /**
     * 限制最大并发会话数
     */
    public void limitMaxConcurrentSessions(Long userId, int maxSessions) {
        // 获取用户所有 Token
        List<String> tokenList = StpUtil.getTokenValueListByLoginId(userId);

        if (tokenList.size() > maxSessions) {
            // 踢出最早的会话
            int kickCount = tokenList.size() - maxSessions;

            // 按登录时间排序
            tokenList.sort((t1, t2) -> {
                SaSession s1 = StpUtil.getTokenSessionByToken(t1);
                SaSession s2 = StpUtil.getTokenSessionByToken(t2);

                Long time1 = (Long) s1.get("loginTime");
                Long time2 = (Long) s2.get("loginTime");

                return time1.compareTo(time2);
            });

            // 踢出早期会话
            for (int i = 0; i < kickCount; i++) {
                StpUtil.kickoutByTokenValue(tokenList.get(i));
            }
        }
    }

    /**
     * 检测并发登录
     */
    public void detectConcurrentLogin(Long userId) {
        List<String> tokenList = StpUtil.getTokenValueListByLoginId(userId);

        if (tokenList.size() > 1) {
            log.warn("用户 {} 存在并发登录, Token数量: {}", userId, tokenList.size());

            // 获取所有登录设备信息
            tokenList.forEach(token -> {
                SaSession session = StpUtil.getTokenSessionByToken(token);
                log.info("设备: {}, IP: {}, 登录时间: {}",
                    session.get("device"),
                    session.get("ip"),
                    new Date((Long) session.get("loginTime"))
                );
            });
        }
    }
}
```

---

## 常见问题

### 1. Token 无法自动续期?

**问题原因:**
- 未开启 Token 活跃续期
- active-timeout 配置不正确
- 请求未携带 Token

**解决方案:**

```yaml
# 正确配置
sa-token:
  timeout: 86400           # 固定过期时间
  active-timeout: 1800     # 活跃续期时间
```

```java
// 在拦截器中更新活跃时间
public class TokenRefreshInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) {
        if (StpUtil.isLogin()) {
            // 更新最后活跃时间
            StpUtil.updateLastActiveTime();
        }
        return true;
    }
}
```

### 2. 社交登录回调失败?

**问题原因:**
- 回调地址配置错误
- State 参数不匹配
- 授权被用户拒绝

**解决方案:**

```java
// 检查回调地址
@GetMapping("/social/callback")
public R<AuthTokenVo> callback(@RequestParam String code,
                                @RequestParam String state) {
    try {
        // 验证 state
        if (!AuthStateUtils.isValid(state)) {
            return R.fail("无效的state参数");
        }

        // 处理授权
        AuthResponse<AuthUser> response = authRequest.login(code);

        if (!response.ok()) {
            log.error("社交登录失败: {}", response.getMsg());
            return R.fail(response.getMsg());
        }

        // 登录成功
        return R.ok(handleSocialLogin(response.getData()));

    } catch (Exception e) {
        log.error("社交登录回调异常", e);
        return R.fail("登录失败: " + e.getMessage());
    }
}
```

### 3. 权限验证不生效?

**问题原因:**
- 权限注解位置错误
- 权限数据未加载
- 权限缓存未更新

**解决方案:**

```java
// 检查权限数据加载
public class PermissionDebugService {

    /**
     * 调试用户权限
     */
    public void debugUserPermission(Long userId) {
        // 检查是否登录
        System.out.println("是否登录: " + StpUtil.isLogin());

        // 检查登录ID
        System.out.println("登录ID: " + StpUtil.getLoginId());

        // 检查权限列表
        List<String> permissions = StpUtil.getPermissionList();
        System.out.println("权限列表: " + permissions);

        // 检查角色列表
        List<String> roles = StpUtil.getRoleList();
        System.out.println("角色列表: " + roles);

        // 检查指定权限
        boolean hasPerm = StpUtil.hasPermission("system:user:list");
        System.out.println("是否有system:user:list权限: " + hasPerm);
    }
}
```

### 4. 多租户认证失败?

**问题原因:**
- 租户ID未传递
- 租户已过期或禁用
- 租户配置错误

**解决方案:**

```java
// 租户认证调试
public class TenantAuthDebugService {

    /**
     * 调试租户认证
     */
    public void debugTenantAuth() {
        // 检查租户功能是否启用
        System.out.println("租户功能启用: " + TenantHelper.isEnable());

        // 获取当前租户ID
        System.out.println("当前租户ID: " + TenantHelper.getTenantId());

        // 检查动态租户
        System.out.println("动态租户: " + TenantHelper.isDynamic());

        // 检查租户忽略
        System.out.println("是否忽略租户: " + TenantHelper.isIgnore());
    }

    /**
     * 手动设置租户
     */
    public void setTenant(String tenantId) {
        TenantHelper.setTenantId(tenantId);
    }
}
```

### 5. Session 数据丢失?

**问题原因:**
- Redis 连接异常
- Session 超时
- Token 被踢出

**解决方案:**

```java
// Session 数据管理
public class SessionDataManagement {

    /**
     * 安全存储 Session 数据
     */
    public void safeSetSessionData(String key, Object value) {
        try {
            SaSession session = StpUtil.getTokenSession();
            if (session != null) {
                session.set(key, value);
            }
        } catch (Exception e) {
            log.error("存储Session数据失败", e);
        }
    }

    /**
     * 安全获取 Session 数据
     */
    public <T> T safeGetSessionData(String key, Class<T> clazz) {
        try {
            SaSession session = StpUtil.getTokenSession();
            if (session != null) {
                return (T) session.get(key);
            }
        } catch (Exception e) {
            log.error("获取Session数据失败", e);
        }
        return null;
    }

    /**
     * 检查 Session 有效性
     */
    public boolean isSessionValid() {
        try {
            SaSession session = StpUtil.getTokenSession();
            return session != null && !session.getTokenSignList().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
}
```

---

## 安全检查清单

### 认证安全检查

- [ ] 密码使用 BCrypt 加密存储
- [ ] 实施密码强度策略(长度、复杂度)
- [ ] 登录失败次数限制(5次)
- [ ] 账户锁定机制(失败次数过多)
- [ ] 验证码防护(登录、注册、找回密码)
- [ ] IP 限流保护(60秒10次)
- [ ] 用户名限流保护(5分钟5次)
- [ ] 异常登录检测与通知
- [ ] 登录日志记录(IP、设备、时间)

### Token 安全检查

- [ ] Token 有效期设置合理(24小时)
- [ ] 活跃超时配置(30分钟)
- [ ] Token 使用 HTTPS 传输
- [ ] Token 存储在安全位置(不在 URL)
- [ ] Token 前缀配置(Bearer)
- [ ] IP 绑定验证(可选)
- [ ] UserAgent 验证(可选)
- [ ] Token 刷新机制
- [ ] Token 黑名单机制

### 权限安全检查

- [ ] 所有接口添加权限注解
- [ ] 敏感操作双重验证
- [ ] 数据权限过滤
- [ ] 租户数据隔离
- [ ] 权限缓存及时更新
- [ ] 超级管理员权限限制
- [ ] API 接口访问日志
- [ ] 定期审计权限配置

### 会话安全检查

- [ ] 并发会话数限制
- [ ] 单点登录配置正确
- [ ] 会话固定攻击防护
- [ ] Session 数据加密
- [ ] 退出登录清理完整
- [ ] Remember Me 安全实现
- [ ] CSRF 防护
- [ ] XSS 防护
