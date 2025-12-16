# 认证授权

## 介绍

RuoYi-Plus 基于 Sa-Token 1.44.0 构建完整的认证授权体系，支持多种认证方式、细粒度权限控制、多端设备管理、数据权限过滤、多租户隔离等企业级特性。

**核心特性：**

- **多种认证方式** - 密码、短信、邮箱、社交登录、小程序登录
- **细粒度权限控制** - `@SaCheckPermission`、`@SaCheckRole`、`@DataPermission`
- **灵活会话管理** - Token 创建、刷新、续期、踢出、黑名单
- **多端设备支持** - PC、APP、小程序多端登录，支持互斥或并发模式
- **多租户隔离** - 租户有效性验证、租户切换、动态租户

---

## 认证架构

### 策略模式设计

系统采用策略模式实现多种认证方式：

```java
public interface IAuthStrategy {
    Map<String, IAuthStrategy> STRATEGY_MAP = new ConcurrentHashMap<>();

    static AuthTokenVo login(String body, String authType) {
        IAuthStrategy authStrategy = STRATEGY_MAP.get(authType);
        if (authStrategy == null) {
            throw ServiceException.of("不支持的认证类型: " + authType);
        }
        return authStrategy.doLogin(body);
    }

    AuthTokenVo doLogin(String body);

    default void register(String authType) {
        STRATEGY_MAP.put(authType, this);
    }
}
```

### 支持的认证类型

| 认证类型 | 策略实现 | 适用场景 |
|---------|---------|----------|
| `password` | `PasswordAuthStrategy` | PC端、管理后台 |
| `sms` | `SmsAuthStrategy` | 移动端、无密码登录 |
| `email` | `EmailAuthStrategy` | 邮箱注册用户 |
| `social` | `SocialAuthStrategy` | GitHub、微信等第三方登录 |
| `xcx` | `MiniAppAuthStrategy` | 微信小程序 |

---

## 密码认证

### 登录实现

```java
@Component("password")
@RequiredArgsConstructor
public class PasswordAuthStrategy implements IAuthStrategy {

    @Override
    public AuthTokenVo doLogin(String body) {
        PasswordLoginBody loginBody = JsonUtils.parseObject(body, PasswordLoginBody.class);
        ValidatorUtils.validate(loginBody);

        // 验证码校验
        validateCaptcha(loginBody.getCode(), loginBody.getUuid());

        // 用户名密码认证
        LoginUser loginUser = loginService.login(
            loginBody.getUsername(), loginBody.getPassword(), loginBody.getAuthType()
        );

        // 执行登录
        SaLoginParameter loginParameter = new SaLoginParameter()
            .setDevice(loginBody.getDevice())
            .setExtra("ip", ServletUtils.getClientIP());
        LoginHelper.login(loginUser, loginParameter);

        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .build();
    }
}
```

### 重试保护

```java
private void checkLoginRetryLimit(String username) {
    String cacheKey = CacheConstants.PWD_ERR_CNT_KEY + username;
    Integer retryCount = RedisUtils.getCacheObject(cacheKey);

    int maxRetryCount = passwordConfig.getMaxRetryCount();
    int lockTime = passwordConfig.getLockTime();

    if (retryCount != null && retryCount >= maxRetryCount) {
        throw ServiceException.of(
            String.format("密码错误次数过多,账户已锁定%d分钟", lockTime)
        );
    }
}

private void recordLoginFailure(String username) {
    String cacheKey = CacheConstants.PWD_ERR_CNT_KEY + username;
    Integer retryCount = RedisUtils.getCacheObject(cacheKey);
    retryCount = (retryCount == null) ? 1 : retryCount + 1;
    RedisUtils.setCacheObject(cacheKey, retryCount, lockTime, TimeUnit.MINUTES);
}
```

### 密码强度验证

```java
public static void validate(String password) {
    if (password.length() < 8 || password.length() > 20) {
        throw ServiceException.of("密码长度必须8-20位");
    }

    int complexity = 0;
    if (password.matches(".*[A-Z].*")) complexity++;
    if (password.matches(".*[a-z].*")) complexity++;
    if (password.matches(".*\\d.*")) complexity++;
    if (password.matches(".*[!@#$%^&*()].*")) complexity++;

    if (complexity < 3) {
        throw ServiceException.of("密码必须包含大写、小写、数字、特殊字符中的至少3种");
    }
}
```

---

## 短信认证

```java
@Component("sms")
public class SmsAuthStrategy implements IAuthStrategy {

    @Override
    public AuthTokenVo doLogin(String body) {
        SmsLoginBody loginBody = JsonUtils.parseObject(body, SmsLoginBody.class);

        // 验证短信验证码
        boolean valid = smsService.validateSmsCode(
            loginBody.getPhoneNumber(), loginBody.getSmsCode()
        );
        if (!valid) {
            throw ServiceException.of("验证码错误或已过期");
        }

        // 查询或自动注册用户
        SysUser user = userService.selectUserByPhonenumber(loginBody.getPhoneNumber());
        if (user == null && registerConfig.isEnabled()) {
            user = autoRegisterUser(loginBody.getPhoneNumber());
        }

        LoginUser loginUser = buildLoginUser(user);
        LoginHelper.login(loginUser, new SaLoginParameter().setDevice(loginBody.getDevice()));

        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .build();
    }
}
```

### 发送频率限制

```java
@RateLimiter(key = "sms:send:", time = 60, count = 1, limitType = LimitType.IP)
public void sendSmsCode(String phoneNumber) {
    // 检查1小时内发送次数
    String frequencyKey = CacheConstants.SMS_FREQUENCY_KEY + phoneNumber;
    Integer count = RedisUtils.getCacheObject(frequencyKey);
    if (count != null && count >= 5) {
        throw ServiceException.of("发送过于频繁,请稍后再试");
    }

    String code = RandomStringUtils.randomNumeric(6);
    RedisUtils.setCacheObject(CacheConstants.SMS_CODE_KEY + phoneNumber, code, 5, TimeUnit.MINUTES);
    sendSmsMessage(phoneNumber, code);
}
```

---

## 社交登录

### 配置

```yaml
social:
  enabled: true
  type:
    github:
      client-id: ${GITHUB_CLIENT_ID}
      client-secret: ${GITHUB_CLIENT_SECRET}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/github
    wechat_open:
      client-id: ${WECHAT_APP_ID}
      client-secret: ${WECHAT_APP_SECRET}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/wechat_open
```

### 回调处理

```java
@SaIgnore
@GetMapping("/social/callback/{source}")
public R<AuthTokenVo> socialCallback(@PathVariable String source,
                                      @RequestParam String code,
                                      @RequestParam String state) {
    // 获取第三方用户信息
    AuthResponse<AuthUser> response = SocialUtils.loginAuth(source, code, state, socialProperties);
    if (!response.ok()) {
        return R.fail(response.getMsg());
    }

    // 登录或注册
    AuthTokenVo token = loginService.socialLogin(response.getData(), tenantId, inviteCode);
    return R.ok(token);
}
```

---

## 权限验证

### 注解方式

```java
// 权限验证
@SaCheckPermission("system:user:list")
@GetMapping("/list")
public TableDataInfo<SysUserVo> list(SysUserBo bo) {
    return userService.selectPageUserList(bo);
}

// 角色验证
@SaCheckRole("admin")
@PostMapping("/resetPwd")
public R<Void> resetPwd(@RequestBody SysUserBo bo) {
    return toAjax(userService.resetPwd(bo));
}

// OR 模式
@SaCheckPermission(value = {"system:user:add", "system:user:edit"}, mode = SaMode.OR)
@PostMapping("/save")
public R<Void> save(@RequestBody SysUserBo bo) { ... }

// AND 模式
@SaCheckPermission(value = {"system:user:remove", "system:user:confirm"}, mode = SaMode.AND)
@DeleteMapping("/{userIds}")
public R<Void> remove(@PathVariable Long[] userIds) { ... }

// 忽略验证
@SaIgnore
@GetMapping("/captcha")
public R<CaptchaVo> getCaptcha() { ... }
```

### 编程式验证

```java
// 检查权限
if (!StpUtil.hasPermission("system:user:query")) {
    throw NotPermissionException.of("system:user:query");
}

// 检查角色
if (!StpUtil.hasRole("admin")) {
    throw NotRoleException.of("admin");
}

// 检查本人数据
if (!LoginHelper.getUserId().equals(userId) && !LoginHelper.isSuperAdmin()) {
    throw ServiceException.of("只能操作自己的数据");
}
```

### 权限数据源

```java
@Component
public class SaPermissionImpl implements StpInterface {

    @Override
    public List<String> getPermissionList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser != null && loginUser.getLoginId().equals(loginId)) {
            return new ArrayList<>(loginUser.getMenuPermission());
        }
        return getPermissionFromService(loginId);
    }

    @Override
    public List<String> getRoleList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser != null && loginUser.getLoginId().equals(loginId)) {
            return new ArrayList<>(loginUser.getRolePermission());
        }
        return getRoleFromService(loginId);
    }
}
```

---

## 数据权限

### 使用注解

```java
@DataPermission({
    @DataColumn(key = "deptName", value = "d.dept_id"),
    @DataColumn(key = "userName", value = "u.user_id")
})
List<SysUserVo> selectUserList(@Param("user") SysUserBo user);
```

### 权限类型

| 类型 | 说明 |
|------|------|
| `ALL` | 全部数据权限 |
| `CUSTOM` | 自定义部门列表 |
| `DEPT` | 仅本部门数据 |
| `DEPT_AND_CHILD` | 本部门及以下 |
| `SELF` | 仅本人数据 |

### 忽略数据权限

```java
public void exportUserData(HttpServletResponse response) {
    List<SysUser> users = DataPermissionHelper.ignore(() -> {
        return userMapper.selectList(null);
    });
    ExcelUtils.exportExcel(users, "用户数据", SysUserVo.class, response);
}
```

---

## 会话管理

### Token 配置

```yaml
sa-token:
  token-name: Authorization
  token-prefix: Bearer
  timeout: 86400           # 24小时
  active-timeout: 1800     # 30分钟无操作过期
  is-concurrent: true      # 允许并发登录
  is-share: false          # 不共享Token
  token-style: uuid
  jwt-secret-key: ${JWT_SECRET_KEY}
```

### Token 续期

```java
public String refreshToken() {
    if (!StpUtil.isLogin()) {
        throw ServiceException.of("请先登录");
    }
    StpUtil.renewTimeout(86400);  // 延长24小时
    return StpUtil.getTokenValue();
}
```

### 多端登录控制

```java
// 同端互斥登录
public void pcExclusiveLogin(LoginUser loginUser) {
    SaLoginParameter parameter = new SaLoginParameter()
        .setDevice("PC")
        .setTimeout(86400);
    LoginHelper.login(loginUser, parameter);
}

// 获取用户所有在线设备
public List<TokenDevice> listOnlineDevices(Long userId) {
    List<String> tokenList = StpUtil.getTokenValueListByLoginId("pc:" + userId);
    // ... 构建设备列表
}

// 踢出指定设备
public void kickoutDevice(String token) {
    StpUtil.kickoutByTokenValue(token);
}
```

---

## 多租户认证

### 租户验证

```java
public void checkTenant(String tenantId) {
    if (!TenantHelper.isEnable()) return;

    SysTenant tenant = tenantService.selectByTenantId(tenantId);
    if (tenant == null) {
        throw TenantException.of("租户不存在");
    }
    if (TenantStatus.DISABLE.getCode().equals(tenant.getStatus())) {
        throw TenantException.of("租户已被禁用");
    }
    if (tenant.getExpireTime() != null && tenant.getExpireTime().before(new Date())) {
        throw TenantException.of("租户已过期");
    }
}
```

### 动态租户

```java
// 忽略租户执行
TenantHelper.ignore(() -> {
    return userMapper.selectList(null);
});

// 指定租户执行
TenantHelper.dynamic(tenantId, () -> {
    return orderMapper.selectList(null);
});
```

---

## 验证码

### 图形验证码

```java
public CaptchaVo createCaptcha() {
    String uuid = IdUtils.fastSimpleUUID();
    AbstractCaptcha captcha = new LineCaptcha(160, 60, 4, 100);
    String code = captcha.getCode();

    RedisUtils.setCacheObject(CacheConstants.CAPTCHA_CODE_KEY + uuid, code, 5, TimeUnit.MINUTES);

    return CaptchaVo.builder()
        .uuid(uuid)
        .img(captcha.getImageBase64Data())
        .build();
}
```

---

## 安全检查清单

### 认证安全

- [ ] 密码使用 BCrypt 加密存储
- [ ] 登录失败次数限制（5次锁定10分钟）
- [ ] 验证码防护（登录、注册）
- [ ] IP 限流保护

### Token 安全

- [ ] Token 有效期设置合理（24小时）
- [ ] 活跃超时配置（30分钟）
- [ ] Token 使用 HTTPS 传输
- [ ] Token 前缀配置（Bearer）

### 权限安全

- [ ] 所有接口添加权限注解
- [ ] 敏感操作双重验证
- [ ] 数据权限过滤
- [ ] 租户数据隔离

---

## 常见问题

### 1. Token 无法自动续期

**解决方案：**

```yaml
sa-token:
  timeout: 86400
  active-timeout: 1800
```

```java
// 拦截器中更新活跃时间
if (StpUtil.isLogin()) {
    StpUtil.updateLastActiveTime();
}
```

### 2. 权限验证不生效

**解决方案：**

```java
// 调试权限
System.out.println("是否登录: " + StpUtil.isLogin());
System.out.println("权限列表: " + StpUtil.getPermissionList());
System.out.println("角色列表: " + StpUtil.getRoleList());
```

### 3. 社交登录回调失败

**检查项：**
- 回调地址配置是否正确
- State 参数是否匹配
- 授权是否被用户拒绝
