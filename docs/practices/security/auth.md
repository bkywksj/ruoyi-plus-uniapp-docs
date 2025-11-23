# 认证授权最佳实践

## 介绍

RuoYi-Plus 基于 Sa-Token 1.44.0 构建了完整的认证授权体系,支持多种认证方式、细粒度权限控制、多端设备管理、数据权限过滤、多租户隔离等企业级特性。框架采用策略模式实现可扩展的认证体系,支持密码、短信、邮箱、社交账号等多种认证方式,并通过注解和编程式两种方式提供灵活的权限控制能力。

**核心特性:**

- **多种认证方式** - 支持密码、短信验证码、邮箱验证码、社交登录(GitHub/Gitee/微信/QQ)、小程序登录、扫码登录等多种认证方式,采用策略模式实现可扩展架构
- **细粒度权限控制** - 基于注解的接口级权限控制(`@SaCheckPermission`、`@SaCheckRole`)、数据权限过滤(`@DataPermission`)、行级和列级安全,支持权限、角色、逻辑组合等多种校验方式
- **灵活的会话管理** - Token 创建、刷新、续期、踢出等完整的会话生命周期管理,支持分布式 Session 存储(Redis),提供 Token 黑名单、设备管理、并发控制等高级功能
- **多端设备支持** - 支持 PC、APP、小程序等多端登录,可配置互斥或并发模式,支持单点登录(SSO)、设备指纹识别、异地登录检测
- **社交账号集成** - 基于 JustAuth 支持 GitHub、Gitee、微信、QQ、微博、钉钉、飞书等 20+ 主流平台的第三方登录,支持账号绑定/解绑、自动注册、邀请码集成
- **多租户隔离** - 完善的多租户认证体系,支持租户有效性验证、租户切换、动态租户、租户过期检查,确保租户间数据和权限完全隔离
- **安全防护机制** - 验证码保护(图形/滑动/短信)、登录失败锁定、IP限流、异常登录检测、防暴力破解、会话固定攻击防护、CSRF/XSS防护

---

## 认证架构

### 策略模式设计

系统采用策略模式实现多种认证方式,每种认证类型对应一个策略实现,实现了高度的可扩展性和可维护性:

```java
/**
 * 认证策略接口
 */
public interface IAuthStrategy {

    /**
     * 策略映射表 - 存储所有已注册的认证策略
     */
    Map<String, IAuthStrategy> STRATEGY_MAP = new ConcurrentHashMap<>();

    /**
     * 登录方法(静态工厂方法)
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
     * 执行登录(抽象方法,由各策略实现)
     *
     * @param body 登录请求体
     * @return 认证令牌
     */
    AuthTokenVo doLogin(String body);

    /**
     * 策略注册(Spring Bean 自动注册)
     */
    default void register(String authType) {
        STRATEGY_MAP.put(authType, this);
    }
}
```

### 支持的认证类型

| 认证类型 | 策略实现 | 说明 | 适用场景 |
|---------|---------|------|----------|
| `password` | `PasswordAuthStrategy` | 账号密码登录 | PC 端、管理后台、传统 Web 应用 |
| `sms` | `SmsAuthStrategy` | 短信验证码登录 | 移动端、无密码登录、快速注册 |
| `email` | `EmailAuthStrategy` | 邮箱验证码登录 | 邮箱注册用户、国际化应用 |
| `social` | `SocialAuthStrategy` | 社交账号登录 | GitHub、Gitee、微信、QQ等第三方登录 |
| `xcx` | `MiniAppAuthStrategy` | 微信小程序登录 | 小程序端、微信生态 |
| `mobile` | `MobileAuthStrategy` | 手机号一键登录 | APP 端、运营商认证 |

### 认证流程架构

```
┌──────────────────────────────────────────────────────────────────┐
│                         认证请求入口                               │
│                     AuthController.login()                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ 解析认证类型    │
                    │  (authType)    │
                    └────────┬───────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Password │      │   SMS    │      │  Social  │
    │ Strategy │      │ Strategy │      │ Strategy │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                 │                  │
         │ 1. 验证码校验   │ 1. 短信验证     │ 1. OAuth回调
         │ 2. 密码验证     │ 2. 用户查询     │ 2. 获取用户信息
         │ 3. 用户查询     │ 3. 自动注册     │ 3. 绑定/注册
         │                 │                  │
         └─────────────────┼──────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 构建 LoginUser │
                  │  (用户信息)    │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 租户验证       │
                  │ (多租户模式)   │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 加载权限       │
                  │  (角色+菜单)   │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 执行登录       │
                  │ LoginHelper    │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 生成 Token     │
                  │  (Sa-Token)    │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 记录登录日志   │
                  │  (异步事件)    │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 返回令牌       │
                  │ AuthTokenVo    │
                  └────────────────┘
```

---

## 密码认证

### 密码登录实现

```java
/**
 * 密码认证策略实现
 */
@Component("password")
@RequiredArgsConstructor
public class PasswordAuthStrategy implements IAuthStrategy {

    private final SysLoginService loginService;
    private final ISysCaptchaService captchaService;

    @Override
    public AuthTokenVo doLogin(String body) {
        // 1. 解析登录信息
        PasswordLoginBody loginBody = JsonUtils.parseObject(body, PasswordLoginBody.class);
        ValidatorUtils.validate(loginBody);

        // 2. 验证码校验(防止暴力破解)
        validateCaptcha(loginBody.getCode(), loginBody.getUuid());

        // 3. 用户名密码认证
        LoginUser loginUser = loginService.login(
            loginBody.getUsername(),
            loginBody.getPassword(),
            loginBody.getAuthType()
        );

        // 4. 记录登录日志(异步)
        LoginHelper.recordLoginInfo(loginUser.getUserId());

        // 5. 配置登录参数
        SaLoginParameter loginParameter = new SaLoginParameter()
            .setDevice(loginBody.getDevice())                    // 设备类型(PC/APP/MINI)
            .setTimeout(loginBody.getTimeout())                  // Token过期时间
            .setActiveTimeout(loginBody.getActiveTimeout())      // 活跃超时时间
            .setExtra("ip", ServletUtils.getClientIP())          // 登录IP
            .setExtra("userAgent", ServletUtils.getUserAgent())  // 设备信息
            .setExtra("loginTime", System.currentTimeMillis());  // 登录时间

        // 6. 执行登录(生成Token并存储Session)
        LoginHelper.login(loginUser, loginParameter);

        // 7. 返回 Token 信息
        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .tokenType("Bearer")
            .build();
    }

    /**
     * 验证码校验
     */
    private void validateCaptcha(String code, String uuid) {
        String captchaKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;
        String captcha = RedisUtils.getCacheObject(captchaKey);

        if (captcha == null) {
            throw new CaptchaExpireException();
        }

        if (!code.equalsIgnoreCase(captcha)) {
            throw new CaptchaException();
        }

        // 验证成功后删除验证码(一次性使用)
        RedisUtils.deleteObject(captchaKey);
    }
}
```

### 密码验证与重试保护

```java
/**
 * 登录服务实现
 */
@Service
@RequiredArgsConstructor
public class SysLoginService {

    private final ISysUserService userService;
    private final PasswordConfig passwordConfig;

    /**
     * 用户登录
     */
    public LoginUser login(String username, String password, String authType) {
        // 1. 检查登录重试次数
        checkLoginRetryLimit(username);

        // 2. 查询用户信息
        SysUser user = userService.selectUserByUserName(username);
        if (user == null) {
            // 记录失败次数(防止用户枚举攻击,不提示用户是否存在)
            recordLoginFailure(username);
            throw ServiceException.of("用户名或密码错误");
        }

        // 3. 验证密码
        if (!BCrypt.checkpw(password, user.getPassword())) {
            recordLoginFailure(username);
            throw ServiceException.of("用户名或密码错误");
        }

        // 4. 验证用户状态
        validateUserStatus(user);

        // 5. 验证租户状态(多租户模式)
        if (TenantHelper.isEnable()) {
            validateTenantStatus(user.getTenantId());
        }

        // 6. 清除失败次数
        clearLoginFailureCount(username);

        // 7. 更新登录信息(最后登录时间、IP)
        updateUserLoginInfo(user.getUserId());

        // 8. 构建登录用户对象
        return buildLoginUser(user);
    }

    /**
     * 检查登录重试限制
     */
    private void checkLoginRetryLimit(String username) {
        String cacheKey = CacheConstants.PWD_ERR_CNT_KEY + username;
        Integer retryCount = RedisUtils.getCacheObject(cacheKey);

        if (retryCount == null) {
            return;
        }

        int maxRetryCount = passwordConfig.getMaxRetryCount();
        int lockTime = passwordConfig.getLockTime();

        if (retryCount >= maxRetryCount) {
            throw ServiceException.of(
                String.format("密码错误次数过多,账户已锁定%d分钟,请稍后再试", lockTime)
            );
        }
    }

    /**
     * 记录登录失败
     */
    private void recordLoginFailure(String username) {
        String cacheKey = CacheConstants.PWD_ERR_CNT_KEY + username;
        Integer retryCount = RedisUtils.getCacheObject(cacheKey);

        retryCount = (retryCount == null) ? 1 : retryCount + 1;

        int maxRetryCount = passwordConfig.getMaxRetryCount();
        int lockTime = passwordConfig.getLockTime();

        // 存储失败次数,设置过期时间
        RedisUtils.setCacheObject(cacheKey, retryCount, lockTime, TimeUnit.MINUTES);

        int remainingRetries = maxRetryCount - retryCount;
        if (remainingRetries > 0) {
            throw ServiceException.of(
                String.format("用户名或密码错误,剩余尝试次数: %d", remainingRetries)
            );
        }
    }

    /**
     * 清除登录失败次数
     */
    private void clearLoginFailureCount(String username) {
        String cacheKey = CacheConstants.PWD_ERR_CNT_KEY + username;
        RedisUtils.deleteObject(cacheKey);
    }

    /**
     * 验证用户状态
     */
    private void validateUserStatus(SysUser user) {
        if (UserStatus.DELETED.getCode().equals(user.getDelFlag())) {
            throw ServiceException.of("用户已被删除");
        }

        if (UserStatus.DISABLE.getCode().equals(user.getStatus())) {
            throw ServiceException.of("用户已被禁用,请联系管理员");
        }
    }

    /**
     * 验证租户状态
     */
    private void validateTenantStatus(String tenantId) {
        SysTenant tenant = tenantService.selectByTenantId(tenantId);

        if (tenant == null) {
            throw TenantException.of("租户不存在");
        }

        if (TenantStatus.DISABLE.getCode().equals(tenant.getStatus())) {
            throw TenantException.of("租户已被禁用,请联系管理员");
        }

        if (tenant.getExpireTime() != null && tenant.getExpireTime().before(new Date())) {
            throw TenantException.of("租户已过期,请联系管理员续费");
        }
    }
}
```

### 密码强度策略

```java
/**
 * 密码强度验证器
 */
public class PasswordStrengthValidator {

    /**
     * 验证密码强度
     */
    public static void validate(String password) {
        // 1. 长度检查(至少8位)
        if (password.length() < 8) {
            throw ServiceException.of("密码长度不能少于8位");
        }

        if (password.length() > 20) {
            throw ServiceException.of("密码长度不能超过20位");
        }

        // 2. 复杂度检查(至少包含3种字符类型)
        int complexity = 0;
        boolean hasUpperCase = password.matches(".*[A-Z].*");
        boolean hasLowerCase = password.matches(".*[a-z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecialChar = password.matches(".*[!@#$%^&*()_+=\\-\\[\\]{};:'\",.<>?/|\\\\].*");

        if (hasUpperCase) complexity++;
        if (hasLowerCase) complexity++;
        if (hasDigit) complexity++;
        if (hasSpecialChar) complexity++;

        if (complexity < 3) {
            throw ServiceException.of("密码必须包含大写字母、小写字母、数字、特殊字符中的至少3种");
        }

        // 3. 弱密码检查
        checkWeakPassword(password);

        // 4. 连续字符检查
        checkConsecutiveChars(password);

        // 5. 重复字符检查
        checkRepeatingChars(password);
    }

    /**
     * 弱密码字典
     */
    private static final Set<String> WEAK_PASSWORDS = Set.of(
        "12345678", "password", "admin123", "qwerty123", "abc123456",
        "11111111", "password123", "123456789", "qwertyuiop"
    );

    /**
     * 检查弱密码
     */
    private static void checkWeakPassword(String password) {
        if (WEAK_PASSWORDS.contains(password.toLowerCase())) {
            throw ServiceException.of("密码过于简单,请使用更复杂的密码");
        }
    }

    /**
     * 检查连续字符(如: 123、abc、xyz)
     */
    private static void checkConsecutiveChars(String password) {
        int consecutiveCount = 0;

        for (int i = 0; i < password.length() - 1; i++) {
            if (password.charAt(i + 1) == password.charAt(i) + 1) {
                consecutiveCount++;
                if (consecutiveCount >= 3) {
                    throw ServiceException.of("密码不能包含连续的字符序列");
                }
            } else {
                consecutiveCount = 0;
            }
        }
    }

    /**
     * 检查重复字符(如: aaa、111)
     */
    private static void checkRepeatingChars(String password) {
        int repeatingCount = 1;

        for (int i = 0; i < password.length() - 1; i++) {
            if (password.charAt(i) == password.charAt(i + 1)) {
                repeatingCount++;
                if (repeatingCount >= 3) {
                    throw ServiceException.of("密码不能包含3个或以上重复字符");
                }
            } else {
                repeatingCount = 1;
            }
        }
    }

    /**
     * 密码强度评分(0-100)
     */
    public static int scorePassword(String password) {
        int score = 0;

        // 长度得分(最多30分)
        score += Math.min(password.length() * 3, 30);

        // 大写字母(10分)
        if (password.matches(".*[A-Z].*")) {
            score += 10;
        }

        // 小写字母(10分)
        if (password.matches(".*[a-z].*")) {
            score += 10;
        }

        // 数字(10分)
        if (password.matches(".*\\d.*")) {
            score += 10;
        }

        // 特殊字符(20分)
        if (password.matches(".*[!@#$%^&*()].*")) {
            score += 20;
        }

        // 混合字符类型(20分)
        int types = 0;
        if (password.matches(".*[A-Z].*")) types++;
        if (password.matches(".*[a-z].*")) types++;
        if (password.matches(".*\\d.*")) types++;
        if (password.matches(".*[!@#$%^&*()].*")) types++;
        if (types >= 3) {
            score += 20;
        }

        return Math.min(score, 100);
    }

    /**
     * 获取密码强度等级
     */
    public static String getStrengthLevel(String password) {
        int score = scorePassword(password);

        if (score < 40) {
            return "弱";
        } else if (score < 70) {
            return "中";
        } else {
            return "强";
        }
    }
}
```

---

## 短信验证码认证

### 短信登录实现

```java
/**
 * 短信认证策略实现
 */
@Component("sms")
@RequiredArgsConstructor
public class SmsAuthStrategy implements IAuthStrategy {

    private final ISysUserService userService;
    private final ISmsService smsService;
    private final RegisterConfig registerConfig;

    @Override
    public AuthTokenVo doLogin(String body) {
        // 1. 解析登录信息
        SmsLoginBody loginBody = JsonUtils.parseObject(body, SmsLoginBody.class);
        ValidatorUtils.validate(loginBody);

        // 2. 验证短信验证码
        boolean valid = smsService.validateSmsCode(
            loginBody.getPhoneNumber(),
            loginBody.getSmsCode()
        );

        if (!valid) {
            throw ServiceException.of("验证码错误或已过期");
        }

        // 3. 根据手机号查询用户
        SysUser user = userService.selectUserByPhonenumber(loginBody.getPhoneNumber());

        // 4. 用户不存在则自动注册(如果启用)
        if (user == null) {
            if (!registerConfig.isEnabled()) {
                throw ServiceException.of("该手机号未注册,请先注册");
            }

            user = autoRegisterUser(loginBody.getPhoneNumber());
        }

        // 5. 验证用户状态
        validateUserStatus(user);

        // 6. 构建登录用户对象
        LoginUser loginUser = buildLoginUser(user);

        // 7. 执行登录
        LoginHelper.login(loginUser, new SaLoginParameter()
            .setDevice(loginBody.getDevice())
            .setExtra("loginType", "sms"));

        // 8. 返回 Token
        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .build();
    }

    /**
     * 自动注册用户
     */
    private SysUser autoRegisterUser(String phoneNumber) {
        log.info("手机号 {} 首次登录,自动注册账号", phoneNumber);

        SysUser user = new SysUser();

        // 生成用户名(手机号)
        user.setUserName(phoneNumber);

        // 生成昵称(脱敏手机号)
        user.setNickName(phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(7));

        // 生成随机密码
        String randomPassword = RandomStringUtils.randomAlphanumeric(16);
        user.setPassword(BCrypt.hashpw(randomPassword, BCrypt.gensalt()));

        // 设置手机号
        user.setPhonenumber(phoneNumber);

        // 设置用户类型
        user.setUserType(UserType.APP.getUserType());

        // 设置默认状态
        user.setStatus(UserStatus.OK.getCode());

        // 保存用户
        userService.insertUser(user);

        // 发送欢迎短信(异步)
        sendWelcomeSms(phoneNumber);

        return user;
    }

    /**
     * 发送欢迎短信
     */
    @Async
    public void sendWelcomeSms(String phoneNumber) {
        try {
            smsService.sendMessage(phoneNumber, "SMS_WELCOME", Map.of());
        } catch (Exception e) {
            log.error("发送欢迎短信失败", e);
        }
    }
}
```

### 短信验证码服务

```java
/**
 * 短信服务实现
 */
@Service
@RequiredArgsConstructor
public class SmsServiceImpl implements ISmsService {

    private final SmsProperties smsProperties;

    /**
     * 发送短信验证码
     */
    @RateLimiter(key = "sms:send:", time = 60, count = 1, limitType = LimitType.IP)
    public void sendSmsCode(String phoneNumber) {
        // 1. 验证手机号格式
        if (!PhoneUtil.isMobile(phoneNumber)) {
            throw ServiceException.of("手机号格式不正确");
        }

        // 2. 检查发送频率限制
        checkSendFrequency(phoneNumber);

        // 3. 生成6位数字验证码
        String code = RandomStringUtils.randomNumeric(6);

        // 4. 存储到 Redis(5分钟有效期)
        String cacheKey = CacheConstants.SMS_CODE_KEY + phoneNumber;
        RedisUtils.setCacheObject(cacheKey, code, 5, TimeUnit.MINUTES);

        // 5. 调用短信服务商发送
        sendSmsMessage(phoneNumber, code);

        log.info("发送短信验证码成功, 手机号: {}", phoneNumber);
    }

    /**
     * 验证短信验证码
     */
    public boolean validateSmsCode(String phoneNumber, String code) {
        String cacheKey = CacheConstants.SMS_CODE_KEY + phoneNumber;
        String cachedCode = RedisUtils.getCacheObject(cacheKey);

        if (cachedCode == null) {
            return false;
        }

        // 验证成功后删除验证码(一次性使用)
        boolean valid = cachedCode.equals(code);
        if (valid) {
            RedisUtils.deleteObject(cacheKey);
        }

        return valid;
    }

    /**
     * 检查发送频率限制
     */
    private void checkSendFrequency(String phoneNumber) {
        String frequencyKey = CacheConstants.SMS_FREQUENCY_KEY + phoneNumber;
        Integer count = RedisUtils.getCacheObject(frequencyKey);

        if (count != null && count >= 5) {
            throw ServiceException.of("发送过于频繁,请稍后再试");
        }

        // 记录发送次数(1小时内最多5次)
        count = (count == null) ? 1 : count + 1;
        RedisUtils.setCacheObject(frequencyKey, count, 1, TimeUnit.HOURS);
    }

    /**
     * 调用短信服务商发送
     */
    private void sendSmsMessage(String phoneNumber, String code) {
        // 使用 SMS4J 框架发送短信
        SmsBlend smsBlend = SmsFactory.createSmsBlend(smsProperties.getProvider());

        Map<String, String> params = Map.of("code", code);

        SmsResponse response = smsBlend.sendMessage(
            phoneNumber,
            smsProperties.getTemplateId(),
            params
        );

        if (!response.isSuccess()) {
            throw ServiceException.of("短信发送失败: " + response.getErrMessage());
        }
    }
}
```

---

## 社交登录

### 社交登录配置

支持 20+ 主流第三方平台登录:

```yaml
# 社交登录配置
social:
  # 是否启用
  enabled: true

  # 平台配置
  type:
    # GitHub 登录
    github:
      client-id: ${GITHUB_CLIENT_ID}
      client-secret: ${GITHUB_CLIENT_SECRET}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/github

    # Gitee 登录
    gitee:
      client-id: ${GITEE_CLIENT_ID}
      client-secret: ${GITEE_CLIENT_SECRET}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/gitee

    # 微信开放平台(扫码登录)
    wechat_open:
      client-id: ${WECHAT_APP_ID}
      client-secret: ${WECHAT_APP_SECRET}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/wechat_open

    # QQ 互联
    qq:
      client-id: ${QQ_APP_ID}
      client-secret: ${QQ_APP_KEY}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/qq

    # 钉钉
    dingtalk:
      client-id: ${DINGTALK_APP_KEY}
      client-secret: ${DINGTALK_APP_SECRET}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/dingtalk

    # 飞书
    feishu:
      client-id: ${FEISHU_APP_ID}
      client-secret: ${FEISHU_APP_SECRET}
      redirect-uri: ${APP_DOMAIN}/auth/social/callback/feishu
```

### 社交登录流程

```java
/**
 * 社交登录控制器
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
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
        // 1. 检查平台配置
        SocialLoginConfigProperties config = socialProperties.getType().get(source);
        if (config == null) {
            return R.fail(source + "平台账号暂不支持");
        }

        // 2. 构建认证请求
        AuthRequest authRequest = SocialUtils.getAuthRequest(source, socialProperties);

        // 3. 构建状态参数(包含租户ID、回调域名、邀请码等)
        Map<String, String> state = new HashMap<>();
        state.put("source", source);
        state.put("tenantId", TenantHelper.getTenantId());
        state.put("domain", domain);
        state.put("state", AuthStateUtils.createState());

        if (StringUtils.isNotBlank(inviteCode)) {
            state.put("inviteCode", inviteCode);
        }

        // 4. 生成授权 URL
        String stateStr = Base64.encode(JsonUtils.toJsonString(state), StandardCharsets.UTF_8);
        String authorizeUrl = authRequest.authorize(stateStr);

        return R.ok("操作成功", authorizeUrl);
    }

    /**
     * 第二步: 授权回调
     */
    @SaIgnore
    @GetMapping("/social/callback/{source}")
    public R<AuthTokenVo> socialCallback(@PathVariable String source,
                                          @RequestParam String code,
                                          @RequestParam String state) {
        // 1. 解析状态参数
        String stateJson = Base64.decodeStr(state, StandardCharsets.UTF_8);
        Map<String, String> stateMap = JsonUtils.parseMap(stateJson);

        String tenantId = stateMap.get("tenantId");
        String inviteCode = stateMap.get("inviteCode");

        // 2. 获取第三方用户信息
        AuthResponse<AuthUser> response = SocialUtils.loginAuth(
            source,
            code,
            state,
            socialProperties
        );

        if (!response.ok()) {
            return R.fail(response.getMsg());
        }

        AuthUser authUser = response.getData();

        // 3. 登录或注册
        AuthTokenVo token = loginService.socialLogin(authUser, tenantId, inviteCode);

        return R.ok(token);
    }

    /**
     * 第三步: 绑定社交账号(已登录用户)
     */
    @PostMapping("/socialBind")
    public R<Void> socialBind(@RequestBody SocialLoginBody loginBody) {
        // 1. 获取第三方登录信息
        AuthResponse<AuthUser> response = SocialUtils.loginAuth(
            loginBody.getSource(),
            loginBody.getSocialCode(),
            loginBody.getSocialState(),
            socialProperties
        );

        if (!response.ok()) {
            return R.fail(response.getMsg());
        }

        // 2. 检查是否已被其他用户绑定
        SysSocialUser existBinding = socialUserService.selectByAuthId(response.getData().getUuid());
        if (existBinding != null && !existBinding.getUserId().equals(LoginHelper.getUserId())) {
            return R.fail("该社交账号已被其他用户绑定");
        }

        // 3. 绑定社交账号
        loginService.bindSocialAccount(response.getData());

        return R.ok();
    }

    /**
     * 解绑社交账号
     */
    @DeleteMapping("/socialUnbind/{socialId}")
    public R<Void> socialUnbind(@PathVariable Long socialId) {
        // 检查是否为本人的绑定
        SysSocialUser socialUser = socialUserService.selectById(socialId);
        if (socialUser == null || !socialUser.getUserId().equals(LoginHelper.getUserId())) {
            return R.fail("无权解绑该社交账号");
        }

        boolean success = socialUserService.deleteSocialUser(socialId);
        return success ? R.ok() : R.fail("解绑失败");
    }
}
```

### 社交登录服务实现

```java
/**
 * 社交登录服务实现
 */
@Service
@RequiredArgsConstructor
public class SocialLoginService {

    private final ISysUserService userService;
    private final ISysSocialUserService socialUserService;
    private final RegisterConfig registerConfig;

    /**
     * 社交账号登录
     */
    @Lock4j(keys = "#authUser.uuid", acquireTimeout = 3000, expire = 5000)
    public AuthTokenVo socialLogin(AuthUser authUser, String tenantId, String inviteCode) {
        // 1. 查询是否已绑定
        SysSocialUser socialUser = socialUserService.selectByAuthId(authUser.getUuid());

        LoginUser loginUser;

        if (socialUser != null) {
            // 已绑定 - 直接登录
            SysUser user = userService.selectUserById(socialUser.getUserId());

            if (user == null) {
                throw ServiceException.of("绑定的用户不存在,请联系管理员");
            }

            // 验证用户状态
            validateUserStatus(user);

            // 更新社交账号信息(头像、昵称可能变化)
            updateSocialUserInfo(socialUser, authUser);

            loginUser = buildLoginUser(user);

        } else {
            // 未绑定 - 自动注册或提示绑定

            if (!registerConfig.isEnabled()) {
                throw ServiceException.of("该社交账号未绑定,请先登录并绑定账号");
            }

            // 自动注册新用户
            SysUser newUser = autoRegisterSocialUser(authUser, tenantId, inviteCode);

            loginUser = buildLoginUser(newUser);
        }

        // 执行登录
        LoginHelper.login(loginUser, new SaLoginParameter()
            .setExtra("loginType", "social")
            .setExtra("source", authUser.getSource()));

        // 返回 Token
        return AuthTokenVo.builder()
            .accessToken(StpUtil.getTokenValue())
            .expireIn(StpUtil.getTokenTimeout())
            .build();
    }

    /**
     * 自动注册社交用户
     */
    @Transactional(rollbackFor = Exception.class)
    private SysUser autoRegisterSocialUser(AuthUser authUser, String tenantId, String inviteCode) {
        log.info("社交账号 {} 首次登录,自动注册用户", authUser.getUuid());

        // 1. 创建用户
        SysUser user = new SysUser();

        // 生成唯一用户名: platform_randomString(8)
        user.setUserName(authUser.getSource() + "_" + RandomStringUtils.randomAlphanumeric(8));

        // 设置昵称(来自第三方平台)
        user.setNickName(authUser.getNickname());

        // 设置头像(来自第三方平台)
        user.setAvatar(authUser.getAvatar());

        // 设置邮箱(如果有)
        user.setEmail(authUser.getEmail());

        // 生成随机密码(用户不知道,只能通过社交登录)
        String randomPassword = RandomStringUtils.randomAlphanumeric(32);
        user.setPassword(BCrypt.hashpw(randomPassword, BCrypt.gensalt()));

        // 设置用户类型
        user.setUserType(UserType.APP.getUserType());

        // 设置租户ID
        user.setTenantId(tenantId);

        // 2. 处理邀请码(如果有)
        if (StringUtils.isNotBlank(inviteCode)) {
            processInviteCode(user, inviteCode);
        }

        // 3. 保存用户
        userService.insertUser(user);

        // 4. 绑定社交账号
        SysSocialUser socialUser = new SysSocialUser();
        socialUser.setUserId(user.getUserId());
        socialUser.setAuthId(authUser.getUuid());
        socialUser.setSource(authUser.getSource());
        socialUser.setOpenId(authUser.getUuid());
        socialUser.setUserName(authUser.getUsername());
        socialUser.setNickName(authUser.getNickname());
        socialUser.setEmail(authUser.getEmail());
        socialUser.setAvatar(authUser.getAvatar());
        socialUser.setAccessToken(authUser.getToken().getAccessToken());
        socialUser.setExpireIn(authUser.getToken().getExpireIn());
        socialUser.setRefreshToken(authUser.getToken().getRefreshToken());

        socialUserService.insertSocialUser(socialUser);

        log.info("社交用户注册成功: userId={}, source={}", user.getUserId(), authUser.getSource());

        return user;
    }

    /**
     * 处理邀请码
     */
    private void processInviteCode(SysUser user, String inviteCode) {
        // 1. 验证邀请码
        SysInviteCode invite = inviteCodeService.selectByCode(inviteCode);

        if (invite == null) {
            throw ServiceException.of("邀请码不存在");
        }

        if (invite.getStatus().equals(InviteCodeStatus.USED.getCode())) {
            throw ServiceException.of("邀请码已被使用");
        }

        if (invite.getExpireTime() != null && invite.getExpireTime().before(new Date())) {
            throw ServiceException.of("邀请码已过期");
        }

        // 2. 分配角色和部门
        if (invite.getRoleId() != null) {
            user.setRoleIds(new Long[]{invite.getRoleId()});
        }

        if (invite.getDeptId() != null) {
            user.setDeptId(invite.getDeptId());
        }

        // 3. 标记邀请码已使用
        inviteCodeService.markAsUsed(inviteCode, user.getUserId());
    }

    /**
     * 更新社交账号信息
     */
    private void updateSocialUserInfo(SysSocialUser socialUser, AuthUser authUser) {
        boolean needUpdate = false;

        if (!Objects.equals(socialUser.getNickName(), authUser.getNickname())) {
            socialUser.setNickName(authUser.getNickname());
            needUpdate = true;
        }

        if (!Objects.equals(socialUser.getAvatar(), authUser.getAvatar())) {
            socialUser.setAvatar(authUser.getAvatar());
            needUpdate = true;
        }

        if (needUpdate) {
            socialUserService.updateSocialUser(socialUser);
        }
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

/**
 * 多个注解组合 - 必须同时满足
 */
@SaCheckLogin  // 必须登录
@SaCheckRole("admin")  // 必须是管理员
@SaCheckPermission("system:config:remove")  // 必须有删除权限
@DeleteMapping("/{configIds}")
public R<Void> remove(@PathVariable Long[] configIds) {
    return toAjax(configService.deleteConfigByIds(configIds));
}
```

### 编程式验证

在业务代码中进行权限验证:

```java
/**
 * 权限验证示例
 */
@Service
@RequiredArgsConstructor
public class UserService {

    /**
     * 检查是否有权限
     */
    public void checkPermission(Long userId) {
        // 1. 检查是否登录
        if (!StpUtil.isLogin()) {
            throw ServiceException.of("请先登录");
        }

        // 2. 检查权限
        if (!StpUtil.hasPermission("system:user:query")) {
            throw NotPermissionException.of("system:user:query");
        }

        // 3. 检查角色
        if (!StpUtil.hasRole("admin")) {
            throw NotRoleException.of("admin");
        }

        // 4. 检查是否为本人数据
        if (!LoginHelper.getUserId().equals(userId) && !LoginHelper.isSuperAdmin()) {
            throw ServiceException.of("只能操作自己的数据");
        }
    }

    /**
     * 检查任意权限(OR模式)
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
     * 检查全部权限(AND模式)
     */
    public boolean hasAllPermissions(String... permissions) {
        for (String permission : permissions) {
            if (!StpUtil.hasPermission(permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 检查任意角色(OR模式)
     */
    public boolean hasAnyRole(String... roles) {
        for (String role : roles) {
            if (StpUtil.hasRole(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查全部角色(AND模式)
     */
    public boolean hasAllRoles(String... roles) {
        for (String role : roles) {
            if (!StpUtil.hasRole(role)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 安全执行(需要特定权限)
     */
    public <T> T executeWithPermission(String permission, Supplier<T> supplier) {
        if (!StpUtil.hasPermission(permission)) {
            throw NotPermissionException.of(permission);
        }
        return supplier.get();
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

        // 当前用户权限查询(从缓存获取)
        if (loginUser != null && loginUser.getLoginId().equals(loginId)) {
            return new ArrayList<>(loginUser.getMenuPermission());
        }

        // 跨用户权限查询(查询数据库)
        return getPermissionFromService(loginId);
    }

    @Override
    public List<String> getRoleList(Object loginId, String authType) {
        LoginUser loginUser = LoginHelper.getLoginUser();

        // 当前用户角色查询(从缓存获取)
        if (loginUser != null && loginUser.getLoginId().equals(loginId)) {
            return new ArrayList<>(loginUser.getRolePermission());
        }

        // 跨用户角色查询(查询数据库)
        return getRoleFromService(loginId);
    }

    /**
     * 从服务层查询权限
     */
    private List<String> getPermissionFromService(Object loginId) {
        // 解析登录ID格式: userType:userId
        Long userId = extractUserId(loginId);

        // 查询用户菜单权限
        PermissionService permissionService = SpringUtils.getBean(PermissionService.class);
        Set<String> permissions = permissionService.listMenuPermissions(userId);

        return new ArrayList<>(permissions);
    }

    /**
     * 从服务层查询角色
     */
    private List<String> getRoleFromService(Object loginId) {
        // 解析登录ID格式: userType:userId
        Long userId = extractUserId(loginId);

        // 查询用户角色
        RoleService roleService = SpringUtils.getBean(RoleService.class);
        Set<String> roles = roleService.listRoleKeysByUserId(userId);

        return new ArrayList<>(roles);
    }

    /**
     * 提取用户ID
     */
    private Long extractUserId(Object loginId) {
        String loginIdStr = String.valueOf(loginId);

        // 格式: userType:userId (如: pc:10001)
        if (loginIdStr.contains(":")) {
            String[] parts = loginIdStr.split(":");
            return Long.parseLong(parts[1]);
        }

        return Long.parseLong(loginIdStr);
    }
}
```

### 数据权限注解

```java
/**
 * 数据权限注解使用示例
 */
@Service
public class UserService {

    /**
     * 查询用户列表 - 数据权限过滤
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id"),
        @DataColumn(key = "userName", value = "user_id")
    })
    public List<SysUser> selectUserList(SysUserBo bo) {
        return userMapper.selectUserList(bo);
    }

    /**
     * 查询订单列表 - 多表关联数据权限
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "u.dept_id"),
        @DataColumn(key = "userName", value = "o.user_id")
    })
    public List<Order> selectOrderList(OrderBo bo) {
        return orderMapper.selectOrderList(bo);
    }

    /**
     * 导出用户数据 - 忽略数据权限(管理员导出全量数据)
     */
    public void exportUserData(HttpServletResponse response) {
        List<SysUser> users = DataPermissionHelper.ignore(() -> {
            // 在此闭包内执行的查询会忽略数据权限过滤
            return userMapper.selectList(null);
        });

        ExcelUtils.exportExcel(users, "用户数据", SysUserVo.class, response);
    }
}
```

### 数据权限Helper

```java
/**
 * 数据权限辅助类
 */
public class DataPermissionHelper {

    /**
     * 开启忽略数据权限(可重入)
     */
    public static void enableIgnore() {
        InterceptorIgnoreHelper.handle(IgnoreStrategy.builder().dataPermission(true).build());
    }

    /**
     * 关闭忽略数据权限
     */
    public static void disableIgnore() {
        InterceptorIgnoreHelper.clearIgnoreStrategy();
    }

    /**
     * 在忽略数据权限的环境下执行(无返回值)
     */
    public static void ignore(Runnable runnable) {
        enableIgnore();
        try {
            runnable.run();
        } finally {
            disableIgnore();
        }
    }

    /**
     * 在忽略数据权限的环境下执行(有返回值)
     */
    public static <T> T ignore(Supplier<T> supplier) {
        enableIgnore();
        try {
            return supplier.get();
        } finally {
            disableIgnore();
        }
    }

    /**
     * 设置数据权限参数
     */
    public static void setVariable(String key, Object value) {
        Map<String, Object> variables = getVariableMap();
        variables.put(key, value);
    }

    /**
     * 获取数据权限参数
     */
    public static Object getVariable(String key) {
        Map<String, Object> variables = getVariableMap();
        return variables.get(key);
    }

    /**
     * 获取参数Map
     */
    private static Map<String, Object> getVariableMap() {
        Map<String, Object> variables = DATA_PERMISSION_VARIABLES.get();
        if (variables == null) {
            variables = new HashMap<>();
            DATA_PERMISSION_VARIABLES.set(variables);
        }
        return variables;
    }

    /**
     * 清除数据权限参数
     */
    public static void clearVariable() {
        DATA_PERMISSION_VARIABLES.remove();
    }

    private static final ThreadLocal<Map<String, Object>> DATA_PERMISSION_VARIABLES = new ThreadLocal<>();
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

  # Token 前缀(格式: Bearer {token})
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

  # JWT 密钥(仅 jwt-simple 模式使用)
  jwt-secret-key: ${JWT_SECRET_KEY}

  # Cookie 配置
  cookie:
    # 是否开启 Cookie
    is-enable: false
    # Cookie 作用域
    domain:
    # Cookie 路径
    path: /
    # Cookie 是否只读
    http-only: true
    # Cookie 是否只能 HTTPS 传输
    secure: true
    # Cookie SameSite 策略(None、Lax、Strict)
    same-site: Lax
```

### Token 续期

实现自动续期和手动刷新:

```java
/**
 * Token 续期实现
 */
@Component
public class TokenService {

    /**
     * 自动续期 - 在每次请求时更新活跃时间
     */
    public void updateLastActiveTime() {
        if (StpUtil.isLogin()) {
            // 更新 Token 的最后活跃时间
            // 如果剩余时间 > active-timeout,不会续期
            // 如果剩余时间 <= active-timeout,会自动续期
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

        // 刷新 Token(延长有效期,默认延长 timeout 时间)
        StpUtil.renewTimeout(86400);  // 延长24小时

        log.info("Token 续期成功: {}", oldToken);

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

        // 获取设备类型
        String device = (String) StpUtil.getTokenSession().get("device");

        // 先踢出旧 Token
        StpUtil.logout();

        // 重新登录生成新 Token
        StpUtil.login(loginId, new SaLoginParameter().setDevice(device));

        String newToken = StpUtil.getTokenValue();

        log.info("生成新 Token 成功: {}", newToken);

        return newToken;
    }

    /**
     * 检查 Token 是否即将过期
     */
    public boolean willExpireSoon() {
        if (!StpUtil.isLogin()) {
            return false;
        }

        long timeout = StpUtil.getTokenTimeout();

        // 剩余时间小于 30 分钟视为即将过期
        return timeout > 0 && timeout < 1800;
    }

    /**
     * 获取 Token 剩余时间(秒)
     */
    public long getTokenRemainTime() {
        if (!StpUtil.isLogin()) {
            return -1;
        }

        return StpUtil.getTokenTimeout();
    }
}
```

### Token 续期拦截器

```java
/**
 * Token 自动续期拦截器
 */
@Component
public class TokenRefreshInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) {
        // 检查是否登录
        if (StpUtil.isLogin()) {
            // 检查 Token 剩余时间
            long timeout = StpUtil.getTokenTimeout();

            // 剩余时间小于 30 分钟,自动续期 7 天
            if (timeout > 0 && timeout < 1800) {
                StpUtil.renewTimeout(7 * 24 * 3600);
                log.info("Token 自动续期: loginId={}", StpUtil.getLoginId());
            }

            // 更新最后活跃时间
            StpUtil.updateLastActiveTime();
        }

        return true;
    }
}
```

### 多端登录控制

配置不同设备的登录策略:

```java
/**
 * 多端登录配置
 */
@Service
public class MultiDeviceService {

    /**
     * 同端互斥登录 - PC端只能一处登录
     */
    public void pcExclusiveLogin(LoginUser loginUser) {
        SaLoginParameter parameter = new SaLoginParameter()
            .setDevice("PC")                      // 设备类型
            .setIsLastingCookie(true)             // 记住我(持久化Cookie)
            .setTimeout(86400)                    // 24小时过期
            .setExtra("deviceInfo", getDeviceInfo());

        // is-concurrent=false 时,同设备类型只能一处登录
        LoginHelper.login(loginUser, parameter);
    }

    /**
     * 跨端并发登录 - PC和手机可同时在线
     */
    public void multiDeviceLogin(LoginUser loginUser, String deviceType) {
        SaLoginParameter parameter = new SaLoginParameter()
            .setDevice(deviceType)                 // PC、APP、MINI
            .setExtra("ip", ServletUtils.getClientIP())
            .setExtra("loginTime", System.currentTimeMillis())
            .setExtra("deviceInfo", getDeviceInfo());

        // 不同设备类型可以同时在线
        LoginHelper.login(loginUser, parameter);
    }

    /**
     * 获取用户所有在线设备
     */
    public List<TokenDevice> listOnlineDevices(Long userId) {
        List<TokenDevice> devices = new ArrayList<>();

        // 获取用户所有 Token
        List<String> tokenList = StpUtil.getTokenValueListByLoginId("pc:" + userId);
        tokenList.addAll(StpUtil.getTokenValueListByLoginId("app:" + userId));
        tokenList.addAll(StpUtil.getTokenValueListByLoginId("mini:" + userId));

        for (String token : tokenList) {
            SaSession session = StpUtil.getTokenSessionByToken(token);

            TokenDevice device = TokenDevice.builder()
                .token(token)
                .device((String) session.get("device"))
                .ip((String) session.get("ip"))
                .loginTime(new Date((Long) session.get("loginTime")))
                .deviceInfo((String) session.get("deviceInfo"))
                .lastActiveTime(new Date(session.getLastActiveTime()))
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
        log.info("踢出设备成功: token={}", token);
    }

    /**
     * 踢出所有设备
     */
    public void kickoutAllDevices(Long userId) {
        // 踢出所有设备类型
        StpUtil.kickout("pc:" + userId);
        StpUtil.kickout("app:" + userId);
        StpUtil.kickout("mini:" + userId);

        log.info("踢出所有设备成功: userId={}", userId);
    }

    /**
     * 获取设备信息
     */
    private String getDeviceInfo() {
        HttpServletRequest request = ServletUtils.getRequest();
        String userAgent = request.getHeader("User-Agent");

        return DeviceUtils.parseDeviceInfo(userAgent);
    }
}
```

### 会话并发控制

```java
/**
 * 会话并发控制
 */
@Service
public class SessionConcurrencyService {

    /**
     * 限制最大并发会话数
     */
    public void limitMaxConcurrentSessions(Long userId, int maxSessions) {
        // 获取用户所有 Token
        List<String> tokenList = StpUtil.getTokenValueListByLoginId("pc:" + userId);

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
                log.info("踢出早期会话: token={}", tokenList.get(i));
            }
        }
    }

    /**
     * 检测并发登录
     */
    public void detectConcurrentLogin(Long userId) {
        List<String> tokenList = StpUtil.getTokenValueListByLoginId("pc:" + userId);

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

    /**
     * 检测异地登录
     */
    public void detectRemoteLogin(Long userId) {
        List<String> tokenList = StpUtil.getTokenValueListByLoginId("pc:" + userId);

        if (tokenList.size() < 2) {
            return;
        }

        // 获取所有登录IP
        Set<String> ipSet = new HashSet<>();
        for (String token : tokenList) {
            SaSession session = StpUtil.getTokenSessionByToken(token);
            String ip = (String) session.get("ip");
            ipSet.add(ip);
        }

        // 如果IP不同,可能存在异地登录
        if (ipSet.size() > 1) {
            log.warn("用户 {} 可能存在异地登录, IP数量: {}, IP列表: {}",
                userId, ipSet.size(), ipSet);

            // 发送异地登录通知
            sendRemoteLoginNotification(userId, ipSet);
        }
    }

    /**
     * 发送异地登录通知
     */
    @Async
    public void sendRemoteLoginNotification(Long userId, Set<String> ipSet) {
        // 发送邮件/短信通知用户
        log.info("发送异地登录通知: userId={}, ips={}", userId, ipSet);
    }
}
```

---

## 多租户认证

### 租户隔离

系统支持完善的多租户认证体系:

```java
/**
 * 租户认证服务
 */
@Service
@RequiredArgsConstructor
public class TenantAuthService {

    private final ISysTenantService tenantService;
    private final ISysUserService userService;

    /**
     * 租户有效性检查
     */
    public void checkTenant(String tenantId) {
        if (!TenantHelper.isEnable()) {
            return;
        }

        if (StringUtils.isBlank(tenantId)) {
            throw TenantException.of("租户ID不能为空");
        }

        // 查询租户信息
        SysTenant tenant = tenantService.selectByTenantId(tenantId);

        if (tenant == null) {
            throw TenantException.of("租户不存在");
        }

        if (TenantStatus.DISABLE.getCode().equals(tenant.getStatus())) {
            throw TenantException.of("租户已被禁用,请联系管理员");
        }

        if (tenant.getExpireTime() != null &&
            tenant.getExpireTime().before(new Date())) {
            throw TenantException.of("租户已过期,请联系管理员续费");
        }

        // 检查租户套餐权限
        if (tenant.getPackageId() != null) {
            checkPackagePermissions(tenant.getPackageId());
        }
    }

    /**
     * 租户切换
     */
    @Transactional(rollbackFor = Exception.class)
    public void switchTenant(String tenantId) {
        // 1. 检查租户有效性
        checkTenant(tenantId);

        // 2. 检查用户是否有该租户权限
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (!canAccessTenant(loginUser.getUserId(), tenantId)) {
            throw TenantException.of("无权访问该租户");
        }

        // 3. 切换租户上下文
        TenantHelper.setTenantId(tenantId);

        // 4. 更新 Token 中的租户信息
        StpUtil.getTokenSession().set(LoginHelper.TENANT_KEY, tenantId);

        // 5. 重新加载用户信息(新租户的角色权限)
        loginUser.setTenantId(tenantId);
        reloadUserPermissions(loginUser);

        // 6. 更新登录用户信息
        StpUtil.getTokenSession().set(LoginHelper.LOGIN_USER_KEY, loginUser);

        log.info("租户切换成功: userId={}, tenantId={}", loginUser.getUserId(), tenantId);
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

    /**
     * 重新加载用户权限
     */
    private void reloadUserPermissions(LoginUser loginUser) {
        // 重新查询用户角色
        Set<String> roles = roleService.selectRoleKeysByUserId(loginUser.getUserId());
        loginUser.setRolePermission(roles);

        // 重新查询用户权限
        Set<String> permissions = menuService.selectMenuPermsByUserId(loginUser.getUserId());
        loginUser.setMenuPermission(permissions);
    }

    /**
     * 检查套餐权限
     */
    private void checkPackagePermissions(Long packageId) {
        SysTenantPackage tenantPackage = packageService.selectById(packageId);

        if (tenantPackage == null) {
            throw TenantException.of("租户套餐不存在");
        }

        if (TenantStatus.DISABLE.getCode().equals(tenantPackage.getStatus())) {
            throw TenantException.of("租户套餐已被禁用");
        }
    }

    /**
     * 获取用户可访问的租户列表
     */
    public List<SysTenant> getUserTenants(Long userId) {
        if (LoginHelper.isSuperAdmin(userId)) {
            // 超级管理员可访问所有租户
            return tenantService.selectList(new SysTenantBo());
        }

        // 查询用户关联的租户
        List<String> tenantIds = userService.getUserTenantIds(userId);

        return tenantService.selectByTenantIds(tenantIds);
    }
}
```

### 动态租户管理

```java
/**
 * 动态租户辅助类
 */
public class TenantHelper {

    private static final ThreadLocal<String> DYNAMIC_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> IGNORE_TENANT = new ThreadLocal<>();

    /**
     * 开启忽略租户(可重入)
     */
    public static void enableIgnore() {
        IGNORE_TENANT.set(true);
    }

    /**
     * 关闭忽略租户
     */
    public static void disableIgnore() {
        IGNORE_TENANT.remove();
    }

    /**
     * 在忽略租户的环境下执行
     */
    public static void ignore(Runnable runnable) {
        enableIgnore();
        try {
            runnable.run();
        } finally {
            disableIgnore();
        }
    }

    /**
     * 在忽略租户的环境下执行(有返回值)
     */
    public static <T> T ignore(Supplier<T> supplier) {
        enableIgnore();
        try {
            return supplier.get();
        } finally {
            disableIgnore();
        }
    }

    /**
     * 设置动态租户ID
     */
    public static void setTenantId(String tenantId) {
        DYNAMIC_TENANT.set(tenantId);
    }

    /**
     * 获取当前租户ID(优先级: 动态租户 > 登录用户租户 > 请求头租户 > 默认租户)
     */
    public static String getTenantId() {
        // 1. 动态租户(优先级最高)
        String tenantId = DYNAMIC_TENANT.get();
        if (StringUtils.isNotBlank(tenantId)) {
            return tenantId;
        }

        // 2. 登录用户租户
        if (StpUtil.isLogin()) {
            LoginUser loginUser = LoginHelper.getLoginUser();
            if (loginUser != null && StringUtils.isNotBlank(loginUser.getTenantId())) {
                return loginUser.getTenantId();
            }
        }

        // 3. 请求头租户
        HttpServletRequest request = ServletUtils.getRequest();
        if (request != null) {
            String headerTenant = request.getHeader(TenantConstants.TENANT_HEADER_NAME);
            if (StringUtils.isNotBlank(headerTenant)) {
                return headerTenant;
            }
        }

        // 4. 默认租户
        return TenantConstants.DEFAULT_TENANT_ID;
    }

    /**
     * 清除动态租户
     */
    public static void clearTenantId() {
        DYNAMIC_TENANT.remove();
    }

    /**
     * 是否忽略租户
     */
    public static boolean isIgnore() {
        return Boolean.TRUE.equals(IGNORE_TENANT.get());
    }

    /**
     * 是否启用租户
     */
    public static boolean isEnable() {
        return Convert.toBool(SpringUtils.getProperty("tenant.enabled"), false);
    }

    /**
     * 在指定租户环境下执行
     */
    public static <T> T dynamic(String tenantId, Supplier<T> supplier) {
        String originalTenant = getTenantId();
        setTenantId(tenantId);
        try {
            return supplier.get();
        } finally {
            if (originalTenant != null) {
                setTenantId(originalTenant);
            } else {
                clearTenantId();
            }
        }
    }
}
```

---

## 验证码实现

### 图形验证码

```java
/**
 * 验证码服务实现
 */
@Service
@RequiredArgsConstructor
public class CaptchaService implements ISysCaptchaService {

    private final CaptchaProperties captchaProperties;

    /**
     * 生成图形验证码
     */
    public CaptchaVo createCaptcha() {
        // 1. 生成唯一标识
        String uuid = IdUtils.fastSimpleUUID();

        // 2. 创建验证码对象
        AbstractCaptcha captcha = createCaptchaInstance();

        // 3. 获取验证码文本
        String code = captcha.getCode();

        // 4. 存储到 Redis(5分钟有效期)
        String cacheKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;
        RedisUtils.setCacheObject(cacheKey, code, 5, TimeUnit.MINUTES);

        // 5. 获取验证码图片(Base64)
        String imageBase64 = captcha.getImageBase64Data();

        // 6. 返回结果
        return CaptchaVo.builder()
            .uuid(uuid)
            .img(imageBase64)
            .build();
    }

    /**
     * 验证图形验证码
     */
    public boolean validateCaptcha(String uuid, String code) {
        String cacheKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;
        String cachedCode = RedisUtils.getCacheObject(cacheKey);

        if (cachedCode == null) {
            return false;
        }

        // 验证码不区分大小写
        boolean valid = cachedCode.equalsIgnoreCase(code);

        // 验证成功后删除(一次性使用)
        if (valid) {
            RedisUtils.deleteObject(cacheKey);
        }

        return valid;
    }

    /**
     * 创建验证码实例
     */
    private AbstractCaptcha createCaptchaInstance() {
        int width = 160;
        int height = 60;
        int codeCount = 4;
        int lineCount = 100;

        CaptchaType type = captchaProperties.getType();

        switch (type) {
            case CIRCLE:
                // 圆圈干扰验证码
                return new CircleCaptcha(width, height, codeCount, lineCount);

            case LINE:
                // 线段干扰验证码
                return new LineCaptcha(width, height, codeCount, lineCount);

            case SHEAR:
                // 扭曲干扰验证码(难度最高)
                return new ShearCaptcha(width, height, codeCount, lineCount);

            default:
                return new LineCaptcha(width, height, codeCount, lineCount);
        }
    }
}
```

### 滑动验证码

```java
/**
 * 滑动验证码服务
 */
@Service
@RequiredArgsConstructor
public class SliderCaptchaService {

    /**
     * 生成滑动验证码
     */
    public SliderCaptchaVo createSliderCaptcha() {
        // 1. 生成唯一标识
        String token = IdUtils.fastSimpleUUID();

        // 2. 随机选择背景图片
        String backgroundImage = selectRandomBackground();

        // 3. 随机生成滑块位置(X坐标)
        int sliderX = RandomUtil.randomInt(100, 250);

        // 4. 生成滑块图片
        String sliderImage = generateSliderImage(backgroundImage, sliderX);

        // 5. 存储正确的X坐标到Redis(5分钟有效期)
        String cacheKey = CacheConstants.SLIDER_CAPTCHA_KEY + token;
        RedisUtils.setCacheObject(cacheKey, sliderX, 5, TimeUnit.MINUTES);

        // 6. 返回结果
        return SliderCaptchaVo.builder()
            .token(token)
            .backgroundImage(backgroundImage)
            .sliderImage(sliderImage)
            .build();
    }

    /**
     * 验证滑动验证码
     */
    public boolean validateSliderCaptcha(String token, int userX) {
        String cacheKey = CacheConstants.SLIDER_CAPTCHA_KEY + token;
        Integer correctX = RedisUtils.getCacheObject(cacheKey);

        if (correctX == null) {
            return false;
        }

        // 允许5像素误差
        boolean valid = Math.abs(userX - correctX) <= 5;

        // 验证成功后删除
        if (valid) {
            RedisUtils.deleteObject(cacheKey);
        }

        return valid;
    }

    /**
     * 选择随机背景图片
     */
    private String selectRandomBackground() {
        List<String> backgrounds = List.of(
            "/captcha/bg1.jpg",
            "/captcha/bg2.jpg",
            "/captcha/bg3.jpg"
        );

        int index = RandomUtil.randomInt(backgrounds.size());
        return backgrounds.get(index);
    }

    /**
     * 生成滑块图片
     */
    private String generateSliderImage(String backgroundImage, int sliderX) {
        // 使用图片处理库生成滑块缺口图片
        // 返回 Base64 编码的图片
        return "data:image/png;base64,...";
    }
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
        String encryptedPassword = BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
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
        PasswordStrengthValidator.validate(password);
    }

    /**
     * 登录失败处理
     */
    public void handleLoginFailure(String username) {
        String key = CacheConstants.PWD_ERR_CNT_KEY + username;

        // 获取失败次数
        Integer errCount = RedisUtils.getCacheObject(key);
        errCount = (errCount == null) ? 0 : errCount;

        errCount++;

        // 记录失败次数
        RedisUtils.setCacheObject(key, errCount, 10, TimeUnit.MINUTES);

        // 失败次数过多,锁定账户
        if (errCount >= 5) {
            throw ServiceException.of("密码错误次数过多,账户已被锁定10分钟");
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
            .setExtra("loginTime", System.currentTimeMillis())
            .setExtra("deviceFingerprint", generateDeviceFingerprint());

        // 执行登录
        LoginHelper.login(loginUser, parameter);

        return StpUtil.getTokenValue();
    }

    /**
     * Token 安全校验
     */
    public void validateToken(String token) {
        // 1. Token 格式校验
        if (StringUtils.isBlank(token)) {
            throw ServiceException.of("Token不能为空");
        }

        // 2. Token 有效性校验
        if (!StpUtil.getStpLogic().getTokenValueByToken(token, false).equals(token)) {
            throw ServiceException.of("Token无效");
        }

        // 3. IP 校验(可选)
        SaSession session = StpUtil.getTokenSessionByToken(token, false);
        if (session != null) {
            String loginIp = (String) session.get("ip");
            String currentIp = ServletUtils.getClientIP();

            if (!loginIp.equals(currentIp)) {
                log.warn("IP地址发生变化,登录IP: {}, 当前IP: {}", loginIp, currentIp);
                // 可选择是否踢出用户
                // StpUtil.kickoutByTokenValue(token);
            }
        }

        // 4. UserAgent 校验(可选)
        if (session != null) {
            String loginUA = (String) session.get("userAgent");
            String currentUA = ServletUtils.getUserAgent();

            if (!Objects.equals(loginUA, currentUA)) {
                log.warn("UserAgent发生变化");
            }
        }
    }

    /**
     * 生成设备指纹
     */
    private String generateDeviceFingerprint() {
        HttpServletRequest request = ServletUtils.getRequest();

        String userAgent = request.getHeader("User-Agent");
        String acceptLanguage = request.getHeader("Accept-Language");
        String acceptEncoding = request.getHeader("Accept-Encoding");

        String fingerprint = userAgent + "|" + acceptLanguage + "|" + acceptEncoding;

        return DigestUtils.md5Hex(fingerprint);
    }

    /**
     * Token 黑名单
     */
    public void blacklistToken(String token) {
        String key = CacheConstants.TOKEN_BLACKLIST_KEY + token;
        long timeout = StpUtil.getStpLogic().getTokenTimeoutByToken(token);

        // 在 Token 过期前一直保存在黑名单中
        if (timeout > 0) {
            RedisUtils.setCacheObject(key, true, timeout, TimeUnit.SECONDS);
        }
    }

    /**
     * 检查 Token 是否在黑名单中
     */
    public boolean isTokenBlacklisted(String token) {
        String key = CacheConstants.TOKEN_BLACKLIST_KEY + token;
        return Boolean.TRUE.equals(RedisUtils.getCacheObject(key));
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
        return menuService.selectMenuPermsByUserId(userId);
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
    @CacheEvict(value = {
        CacheNames.SYS_USER_PERMISSION,
        CacheNames.SYS_USER_ROLE
    }, key = "#userId")
    public void refreshUserPermission(Long userId) {
        log.info("刷新用户权限缓存: userId={}", userId);

        // 如果用户在线,强制踢出重新登录
        if (StpUtil.isLogin("pc:" + userId)) {
            StpUtil.kickout("pc:" + userId);
        }
        if (StpUtil.isLogin("app:" + userId)) {
            StpUtil.kickout("app:" + userId);
        }
    }

    /**
     * 批量刷新权限
     */
    public void batchRefreshPermissions(List<Long> userIds) {
        userIds.forEach(this::refreshUserPermission);
    }

    /**
     * 刷新所有在线用户权限
     */
    public void refreshAllOnlineUsers() {
        // 获取所有在线用户
        List<String> loginIds = StpUtil.searchTokenValue("", 0, -1, false);

        Set<Long> userIds = loginIds.stream()
            .map(this::extractUserId)
            .collect(Collectors.toSet());

        batchRefreshPermissions(new ArrayList<>(userIds));
    }

    private Long extractUserId(String loginId) {
        if (loginId.contains(":")) {
            return Long.parseLong(loginId.split(":")[1]);
        }
        return Long.parseLong(loginId);
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
    public void checkUserLoginLimit(String username) {
        String key = CacheConstants.LOGIN_LIMIT_KEY + username;
        Integer count = RedisUtils.getCacheObject(key);

        count = (count == null) ? 1 : count + 1;

        if (count > 5) {
            throw ServiceException.of("该账号登录尝试次数过多,请5分钟后再试");
        }

        RedisUtils.setCacheObject(key, count, 5, TimeUnit.MINUTES);
    }

    /**
     * 验证码验证
     */
    public void requireCaptchaAfterFailures(String username) {
        String key = CacheConstants.PWD_ERR_CNT_KEY + username;
        Integer errCount = RedisUtils.getCacheObject(key);

        // 失败3次后要求验证码
        if (errCount != null && errCount >= 3) {
            throw ServiceException.of("请输入验证码");
        }
    }

    /**
     * 异常登录检测
     */
    public void detectAbnormalLogin(LoginUser loginUser) {
        String key = CacheConstants.LOGIN_HISTORY_KEY + loginUser.getUserId();

        // 获取登录历史
        List<LoginHistory> history = RedisUtils.getCacheObject(key);
        if (history == null) {
            history = new ArrayList<>();
        }

        if (!history.isEmpty()) {
            LoginHistory last = history.get(history.size() - 1);

            // 检测异常登录地点
            String lastLocation = IpUtils.getLocationByIp(last.getIp());
            String currentLocation = IpUtils.getLocationByIp(ServletUtils.getClientIP());

            if (!lastLocation.equals(currentLocation)) {
                // 发送异常登录通知
                sendAbnormalLoginNotification(loginUser, lastLocation, currentLocation);
            }

            // 检测异常登录时间(如凌晨登录)
            int hour = LocalDateTime.now().getHour();
            if (hour >= 2 && hour <= 5) {
                log.warn("用户 {} 在凌晨 {} 点登录,可能存在异常", loginUser.getUserId(), hour);
            }
        }

        // 记录本次登录
        LoginHistory current = new LoginHistory();
        current.setIp(ServletUtils.getClientIP());
        current.setTime(new Date());
        current.setDevice(ServletUtils.getUserAgent());
        history.add(current);

        // 保留最近10次登录记录
        if (history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }

        RedisUtils.setCacheObject(key, history, 30, TimeUnit.DAYS);
    }

    /**
     * 发送异常登录通知
     */
    @Async
    public void sendAbnormalLoginNotification(LoginUser loginUser,
                                               String lastLocation,
                                               String currentLocation) {
        log.warn("检测到异常登录: userId={}, 上次登录地点: {}, 本次登录地点: {}",
            loginUser.getUserId(), lastLocation, currentLocation);

        // 发送邮件/短信通知
        mailService.sendAbnormalLoginMail(
            loginUser.getEmail(),
            lastLocation,
            currentLocation
        );
    }
}
```

---

## 常见问题

### 1. Token 无法自动续期?

**问题原因:**
- 未开启 Token 活跃续期
- `active-timeout` 配置不正确
- 请求未携带 Token
- 拦截器未生效

**解决方案:**

```yaml
# 正确配置
sa-token:
  timeout: 86400           # 固定过期时间(24小时)
  active-timeout: 1800     # 活跃续期时间(30分钟)
```

```java
// 在拦截器中更新活跃时间
@Component
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
- Code 已被使用

**解决方案:**

```java
// 检查回调地址
@GetMapping("/social/callback/{source}")
public R<AuthTokenVo> callback(@PathVariable String source,
                                @RequestParam String code,
                                @RequestParam String state) {
    try {
        // 1. 验证 state
        if (!AuthStateUtils.isValid(state)) {
            return R.fail("无效的state参数");
        }

        // 2. 处理授权
        AuthRequest authRequest = SocialUtils.getAuthRequest(source, socialProperties);
        AuthResponse<AuthUser> response = authRequest.login(
            AuthCallback.builder()
                .code(code)
                .state(state)
                .build()
        );

        if (!response.ok()) {
            log.error("社交登录失败: source={}, msg={}", source, response.getMsg());
            return R.fail(response.getMsg());
        }

        // 3. 登录成功
        return R.ok(handleSocialLogin(response.getData()));

    } catch (Exception e) {
        log.error("社交登录回调异常: source={}", source, e);
        return R.fail("登录失败: " + e.getMessage());
    }
}
```

### 3. 权限验证不生效?

**问题原因:**
- 权限注解位置错误(只能用在 public 方法上)
- 权限数据未加载
- 权限缓存未更新
- Sa-Token 拦截器未生效

**解决方案:**

```java
// 检查权限数据加载
@Service
public class PermissionDebugService {

    /**
     * 调试用户权限
     */
    public void debugUserPermission(Long userId) {
        // 1. 检查是否登录
        System.out.println("是否登录: " + StpUtil.isLogin());

        // 2. 检查登录ID
        System.out.println("登录ID: " + StpUtil.getLoginId());

        // 3. 检查权限列表
        List<String> permissions = StpUtil.getPermissionList();
        System.out.println("权限列表: " + permissions);

        // 4. 检查角色列表
        List<String> roles = StpUtil.getRoleList();
        System.out.println("角色列表: " + roles);

        // 5. 检查指定权限
        boolean hasPerm = StpUtil.hasPermission("system:user:list");
        System.out.println("是否有system:user:list权限: " + hasPerm);

        // 6. 检查权限数据源
        if (permissions.isEmpty()) {
            System.out.println("警告: 权限列表为空,请检查 SaPermissionImpl 实现");
        }
    }
}
```

### 4. 多租户认证失败?

**问题原因:**
- 租户ID未传递
- 租户已过期或禁用
- 租户配置错误
- 租户拦截器未生效

**解决方案:**

```java
// 租户认证调试
@Service
public class TenantAuthDebugService {

    /**
     * 调试租户认证
     */
    public void debugTenantAuth() {
        // 1. 检查租户功能是否启用
        System.out.println("租户功能启用: " + TenantHelper.isEnable());

        // 2. 获取当前租户ID
        System.out.println("当前租户ID: " + TenantHelper.getTenantId());

        // 3. 检查动态租户
        System.out.println("是否忽略租户: " + TenantHelper.isIgnore());

        // 4. 检查请求头租户
        HttpServletRequest request = ServletUtils.getRequest();
        if (request != null) {
            String headerTenant = request.getHeader(TenantConstants.TENANT_HEADER_NAME);
            System.out.println("请求头租户ID: " + headerTenant);
        }

        // 5. 检查登录用户租户
        if (StpUtil.isLogin()) {
            LoginUser loginUser = LoginHelper.getLoginUser();
            System.out.println("登录用户租户ID: " + loginUser.getTenantId());
        }
    }
}
```

### 5. Session 数据丢失?

**问题原因:**
- Redis 连接异常
- Session 超时
- Token 被踢出
- 序列化问题

**解决方案:**

```java
// Session 数据管理
@Service
public class SessionDataManagement {

    /**
     * 安全存储 Session 数据
     */
    public void safeSetSessionData(String key, Object value) {
        try {
            if (!StpUtil.isLogin()) {
                throw ServiceException.of("用户未登录");
            }

            SaSession session = StpUtil.getTokenSession();
            if (session != null) {
                session.set(key, value);
                log.info("Session 数据存储成功: key={}", key);
            } else {
                log.error("Session 不存在");
            }
        } catch (Exception e) {
            log.error("存储Session数据失败: key={}", key, e);
            throw ServiceException.of("Session数据存储失败");
        }
    }

    /**
     * 安全获取 Session 数据
     */
    public <T> T safeGetSessionData(String key, Class<T> clazz) {
        try {
            if (!StpUtil.isLogin()) {
                return null;
            }

            SaSession session = StpUtil.getTokenSession();
            if (session != null) {
                Object value = session.get(key);
                if (value != null) {
                    return clazz.cast(value);
                }
            }
        } catch (Exception e) {
            log.error("获取Session数据失败: key={}", key, e);
        }
        return null;
    }

    /**
     * 检查 Session 有效性
     */
    public boolean isSessionValid() {
        try {
            if (!StpUtil.isLogin()) {
                return false;
            }

            SaSession session = StpUtil.getTokenSession();
            return session != null && !session.getTokenSignList().isEmpty();
        } catch (Exception e) {
            log.error("检查Session有效性失败", e);
            return false;
        }
    }

    /**
     * 刷新 Session
     */
    public void refreshSession() {
        if (StpUtil.isLogin()) {
            StpUtil.renewTimeout(86400);
            log.info("Session 刷新成功");
        }
    }
}
```

---

## 安全检查清单

### 认证安全检查

- [ ] 密码使用 BCrypt 加密存储(成本因子 ≥ 10)
- [ ] 实施密码强度策略(长度 ≥ 8,包含3种字符类型)
- [ ] 登录失败次数限制(5次)
- [ ] 账户锁定机制(失败5次锁定10分钟)
- [ ] 验证码防护(登录、注册、找回密码)
- [ ] IP 限流保护(60秒10次)
- [ ] 用户名限流保护(5分钟5次)
- [ ] 异常登录检测与通知(异地登录、凌晨登录)
- [ ] 登录日志记录(IP、设备、时间、地点)
- [ ] 弱密码检测(字典匹配、连续字符、重复字符)

### Token 安全检查

- [ ] Token 有效期设置合理(24小时)
- [ ] 活跃超时配置(30分钟无操作过期)
- [ ] Token 使用 HTTPS 传输
- [ ] Token 存储在安全位置(不在 URL、localStorage)
- [ ] Token 前缀配置(Bearer)
- [ ] IP 绑定验证(可选,防止 Token 被盗用)
- [ ] UserAgent 验证(可选)
- [ ] 设备指纹验证(可选)
- [ ] Token 刷新机制
- [ ] Token 黑名单机制
- [ ] Token 自动续期(剩余时间 < 30分钟)

### 权限安全检查

- [ ] 所有接口添加权限注解
- [ ] 敏感操作双重验证
- [ ] 数据权限过滤
- [ ] 租户数据隔离
- [ ] 权限缓存及时更新
- [ ] 超级管理员权限限制
- [ ] API 接口访问日志
- [ ] 定期审计权限配置
- [ ] 权限继承关系正确
- [ ] 角色权限分离

### 会话安全检查

- [ ] 并发会话数限制
- [ ] 单点登录配置正确
- [ ] 会话固定攻击防护
- [ ] Session 数据加密
- [ ] 退出登录清理完整
- [ ] Remember Me 安全实现
- [ ] CSRF 防护
- [ ] XSS 防护
- [ ] 会话超时处理
- [ ] 设备管理功能

### 多租户安全检查

- [ ] 租户ID验证
- [ ] 租户状态检查(启用/禁用)
- [ ] 租户过期检查
- [ ] 租户套餐权限检查
- [ ] 租户数据完全隔离
- [ ] 跨租户访问控制
- [ ] 租户切换审计
- [ ] 租户配置独立
