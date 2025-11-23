# 安全防护概览

## 介绍

RuoYi-Plus 框架提供了一套完整的企业级安全防护体系,涵盖认证授权、数据加密、敏感数据脱敏、接口安全、防攻击等多个层面。安全体系基于 Sa-Token 认证框架构建,结合国密算法、数据权限控制、多租户隔离等企业级特性,为应用提供全方位的安全保障。

**核心特性:**

- **统一认证授权** - 基于 Sa-Token 实现的登录认证、权限验证、角色控制,支持多用户体系和多设备类型
- **多层加密体系** - 支持 AES、RSA、SM2、SM4 等多种加密算法,涵盖数据传输加密和数据存储加密
- **敏感数据脱敏** - 内置 15 种脱敏策略,自动处理手机号、身份证、银行卡等敏感信息
- **接口安全防护** - 提供幂等性控制、限流保护、API 签名验证等接口安全机制
- **多租户隔离** - 完善的租户数据隔离机制,确保不同租户数据完全隔离
- **审计日志** - 完整的操作日志和登录日志记录,支持安全审计和问题追溯

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
│  │ 限流控制 │  │ 幂等控制 │  │ API签名  │  │ 防重放   │         │
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
| `ruoyi-common-security` | 安全配置模块 | 路由拦截、白名单配置、Actuator 认证 |
| `ruoyi-common-satoken` | 认证授权模块 | 登录认证、权限校验、Token 管理 |
| `ruoyi-common-encrypt` | 数据加密模块 | 字段加密、接口加密、密钥管理 |
| `ruoyi-common-sensitive` | 数据脱敏模块 | 敏感数据脱敏、自定义脱敏策略 |
| `ruoyi-common-ratelimiter` | 限流模块 | 接口限流、IP 限流、用户限流 |
| `ruoyi-common-idempotent` | 幂等性模块 | 防重复提交、幂等性保障 |

---

## 认证授权

### Sa-Token 认证框架

RuoYi-Plus 基于 Sa-Token 1.44.0 实现统一认证授权,支持丰富的认证场景:

#### 核心能力

- **登录认证** - 账号密码、短信验证码、社交登录、微信登录等多种方式
- **权限验证** - 基于注解的细粒度权限控制
- **角色控制** - 灵活的角色权限管理
- **Token 管理** - Token 创建、刷新、踢出、禁用等
- **多端登录** - 支持 PC、APP、小程序等多端同时在线或互斥

#### 登录实现

```java
/**
 * 用户登录示例
 */
@PostMapping("/login")
public R<Map<String, Object>> login(@RequestBody LoginBody loginBody) {
    // 验证码校验
    validateCaptcha(loginBody.getCode(), loginBody.getUuid());

    // 用户认证
    LoginUser loginUser = authenticate(loginBody.getUsername(), loginBody.getPassword());

    // 登录参数配置
    SaLoginParameter loginParameter = new SaLoginParameter()
        .setDevice(loginBody.getDevice())       // 设备类型
        .setTimeout(expireTime)                 // 过期时间
        .setActiveTimeout(activeTimeout);       // 活跃超时

    // 执行登录
    LoginHelper.login(loginUser, loginParameter);

    // 返回 Token
    return R.ok(Map.of(
        "token", StpUtil.getTokenValue(),
        "expireIn", StpUtil.getTokenTimeout()
    ));
}
```

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

// 忽略验证 - 无需登录即可访问
@SaIgnore
@GetMapping("/captcha")
public R<CaptchaVo> getCaptcha() {
    return R.ok(captchaService.createCaptcha());
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
}
```

登录 ID 格式采用 `userType:userId` 的形式,支持同一用户在不同终端使用不同权限:

```java
// 获取登录 ID
String loginId = userType.getUserType() + ":" + userId;  // 如: "pc:10001"

// 执行登录
StpUtil.login(loginId, loginParameter);
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
    - /captcha
    # 静态资源
    - /static/**
    - /public/**
    # API 文档
    - /swagger-ui/**
    - /v3/api-docs/**
    - /doc.html
    # 健康检查
    - /actuator/health
    - /actuator/info
```

#### 安全拦截器配置

系统自动配置 Sa-Token 拦截器,对非白名单路径进行登录验证:

```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    // 注册 Sa-Token 路由拦截器
    registry.addInterceptor(new SaInterceptor(handler -> {
            AllUrlHandler allUrlHandler = SpringUtils.getBean(AllUrlHandler.class);

            // 登录验证逻辑
            SaRouter
                .match(allUrlHandler.getUrls())  // 匹配需要验证的 URL
                .check(StpUtil::checkLogin);    // 执行登录检查
        }))
        .addPathPatterns("/**")                       // 拦截所有路径
        .excludePathPatterns(securityProperties.getExcludes())  // 排除白名单
        .excludePathPatterns(ssePath);                // 排除 SSE 路径
}
```

### Actuator 监控认证

Spring Boot Actuator 端点采用 HTTP Basic 认证保护:

```java
@Bean
public SaServletFilter getSaServletFilter() {
    String username = SpringUtils.getProperty("spring.boot.admin.client.username");
    String password = SpringUtils.getProperty("spring.boot.admin.client.password");

    return new SaServletFilter()
        .addInclude("/actuator", "/actuator/**")
        .setAuth(obj -> {
            SaHttpBasicUtil.check(username + ":" + password);
        })
        .setError(e -> {
            HttpServletResponse response = ServletUtils.getResponse();
            response.setContentType("application/json");
            return SaResult.error(e.getMessage()).setCode(HttpStatus.UNAUTHORIZED);
        });
}
```

---

## 数据加密

### 加密算法支持

框架内置多种加密算法,满足不同安全等级需求:

| 算法类型 | 说明 | 适用场景 |
|---------|------|----------|
| `BASE64` | Base64 编码 | 简单数据编码,非安全场景 |
| `AES` | 对称加密算法 | 高性能加密,适合大量数据 |
| `RSA` | 非对称加密算法 | 密钥交换,数字签名 |
| `SM2` | 国密非对称算法 | 国产化安全要求场景 |
| `SM4` | 国密对称算法 | 国产化安全要求场景 |

### 字段级加密

使用 `@EncryptField` 注解实现数据库字段自动加解密:

```java
/**
 * 用户实体
 */
public class SysUser {

    /** 用户ID */
    private Long userId;

    /** 用户名 */
    private String userName;

    /** 手机号 - 自动加密存储 */
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phonenumber;

    /** 身份证号 - 使用国密算法加密 */
    @EncryptField(algorithm = AlgorithmType.SM4)
    private String idCard;

    /** 邮箱 - 自动加密存储 */
    @EncryptField
    private String email;
}
```

加密配置:

```yaml
# 加密配置
mybatis-encryptor:
  # 是否启用加密
  enabled: true
  # 默认加密算法
  algorithm: AES
  # AES 加密密钥
  password: 1234567890123456
  # 编码方式
  encode: BASE64
```

### 接口级加密

使用 `@ApiEncrypt` 注解实现接口请求/响应加密:

```java
/**
 * 用户登录 - 请求参数加密传输
 */
@ApiEncrypt(request = true, response = false)
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody loginBody) {
    return R.ok(loginService.login(loginBody));
}

/**
 * 获取用户敏感信息 - 响应数据加密传输
 */
@ApiEncrypt(request = false, response = true)
@GetMapping("/sensitive-info")
public R<UserSensitiveVo> getSensitiveInfo() {
    return R.ok(userService.getSensitiveInfo());
}
```

接口加密配置:

```yaml
# API 加密配置
api-decrypt:
  # 是否启用
  enabled: true
  # 加密算法
  algorithm: RSA
  # RSA 公钥(前端加密用)
  public-key: MIGfMA0GCSq...
  # RSA 私钥(后端解密用)
  private-key: MIICdgIBADANBg...
```

### 加密工具类

框架提供统一的加密工具类:

```java
// AES 加密
String encrypted = EncryptUtils.encryptByAes("明文数据", aesKey);
String decrypted = EncryptUtils.decryptByAes(encrypted, aesKey);

// RSA 加密
String encrypted = EncryptUtils.encryptByRsa("明文数据", publicKey);
String decrypted = EncryptUtils.decryptByRsa(encrypted, privateKey);

// SM2 国密加密
String encrypted = EncryptUtils.encryptBySm2("明文数据", publicKey);
String decrypted = EncryptUtils.decryptBySm2(encrypted, privateKey);

// SM4 国密加密
String encrypted = EncryptUtils.encryptBySm4("明文数据", sm4Key);
String decrypted = EncryptUtils.decryptBySm4(encrypted, sm4Key);

// MD5 摘要
String md5 = EncryptUtils.md5("原始数据");

// SHA256 摘要
String sha256 = EncryptUtils.sha256("原始数据");
```

---

## 敏感数据脱敏

### 脱敏策略

框架内置 15 种常用脱敏策略:

| 策略 | 说明 | 示例 |
|------|------|------|
| `PHONE` | 手机号脱敏 | `138****8888` |
| `ID_CARD` | 身份证脱敏 | `110***********1234` |
| `EMAIL` | 邮箱脱敏 | `t**@example.com` |
| `BANK_CARD` | 银行卡脱敏 | `6222***********1234` |
| `CHINESE_NAME` | 中文姓名脱敏 | `张*` |
| `ADDRESS` | 地址脱敏 | `北京市朝阳区****` |
| `FIXED_PHONE` | 固定电话脱敏 | `010-****8888` |
| `PASSWORD` | 密码脱敏 | `******` |
| `IPV4` | IPv4 地址脱敏 | `192.168.*.*` |
| `IPV6` | IPv6 地址脱敏 | `2001:db8:****:****` |
| `CAR_LICENSE` | 车牌号脱敏 | `京A****8` |
| `USER_ID` | 用户 ID 脱敏 | 随机数字 |
| `FIRST_MASK` | 首字符保留 | `张***` |
| `CLEAR` | 清空 | 空字符串 |
| `CLEAR_TO_NULL` | 置空 | `null` |

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
}
```

返回给前端的数据会自动脱敏:

```json
{
  "userId": 1,
  "userName": "admin",
  "phonenumber": "138****8888",
  "idCard": "110***********1234",
  "email": "a**@example.com",
  "address": "北京市朝阳区****"
}
```

### 条件脱敏

支持基于权限的条件脱敏,管理员可查看完整数据:

```java
/**
 * 敏感数据服务接口
 */
public interface SensitiveService {

    /**
     * 判断是否脱敏
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
// 仅管理员可查看完整手机号
@Sensitive(strategy = SensitiveStrategy.PHONE, roleKey = "admin")
private String phonenumber;

// 具有权限可查看完整身份证
@Sensitive(strategy = SensitiveStrategy.ID_CARD, perms = "system:user:sensitive")
private String idCard;
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
```

幂等性配置:

```yaml
# 幂等性配置
repeat-submit:
  # 是否启用
  enabled: true
  # 间隔时间(毫秒)
  interval: 5000
```

### 限流保护

接口限流防止恶意请求:

```java
/**
 * 发送短信验证码 - 限流保护
 */
@RateLimiter(key = "sms:code:", time = 60, count = 1, message = "一分钟内只能发送一次")
@PostMapping("/sms/code")
public R<Void> sendSmsCode(@RequestBody SmsCodeBo bo) {
    return toAjax(smsService.sendSmsCode(bo));
}

/**
 * 用户登录 - IP 限流
 */
@RateLimiter(key = "login:", time = 60, count = 5,
             limitType = LimitType.IP, message = "登录失败次数过多,请稍后再试")
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody loginBody) {
    return R.ok(loginService.login(loginBody));
}
```

限流类型:

- `DEFAULT` - 默认限流,基于方法
- `IP` - IP 限流
- `USER` - 用户限流
- `CLUSTER` - 集群限流

### XSS 防护

框架自动过滤 XSS 攻击:

```yaml
# XSS 防护配置
xss:
  # 是否启用
  enabled: true
  # 排除路径
  excludes:
    - /system/notice/*
    - /system/config/*
  # 匹配路径
  urlPatterns:
    - /system/*
    - /business/*
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

---

## 数据权限

### 数据权限控制

系统支持多种数据权限模式:

| 模式 | 说明 |
|------|------|
| 全部数据权限 | 可查看所有数据 |
| 自定义数据权限 | 按配置的部门查看 |
| 本部门数据权限 | 仅查看本部门数据 |
| 本部门及以下数据权限 | 查看本部门及下级部门数据 |
| 仅本人数据权限 | 仅查看自己的数据 |

使用数据权限注解:

```java
/**
 * 查询用户列表 - 数据权限控制
 */
@DataScope(deptAlias = "d", userAlias = "u")
public List<SysUser> selectUserList(SysUserBo bo) {
    return userMapper.selectUserList(bo);
}
```

### 多租户隔离

完善的租户数据隔离机制:

```yaml
# 租户配置
tenant:
  # 是否启用
  enabled: true
  # 忽略的表
  ignore-tables:
    - sys_dict_type
    - sys_dict_data
    - sys_config
```

租户数据自动过滤:

```java
// 所有查询自动添加租户条件
SELECT * FROM sys_user WHERE tenant_id = '000000' AND ...

// 新增数据自动填充租户ID
INSERT INTO sys_user (tenant_id, ...) VALUES ('000000', ...)
```

---

## 审计日志

### 操作日志

记录用户的操作行为:

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
```

操作日志类型:

- `INSERT` - 新增
- `UPDATE` - 修改
- `DELETE` - 删除
- `GRANT` - 授权
- `EXPORT` - 导出
- `IMPORT` - 导入
- `FORCE` - 强退
- `GENCODE` - 生成代码
- `CLEAN` - 清空数据

### 登录日志

自动记录用户登录行为:

```java
/**
 * 登录日志信息
 */
public class SysLogininfor {
    /** 用户账号 */
    private String userName;
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

---

## 最佳实践

### 1. 密码安全

```java
/**
 * 密码加密存储
 */
public String encryptPassword(String password) {
    // 使用 BCrypt 加密,自动加盐
    return BCrypt.hashpw(password, BCrypt.gensalt());
}

/**
 * 密码验证
 */
public boolean matches(String rawPassword, String encodedPassword) {
    return BCrypt.checkpw(rawPassword, encodedPassword);
}
```

密码策略建议:
- 最小长度 8 位
- 必须包含大小写字母、数字、特殊字符
- 定期强制修改密码
- 禁止使用弱密码

### 2. Token 安全

```yaml
# Sa-Token 配置
sa-token:
  # token 名称
  token-name: Authorization
  # token 前缀
  token-prefix: Bearer
  # token 有效期(秒),-1 代表永不过期
  timeout: 86400
  # token 临时有效期(秒)
  active-timeout: 1800
  # 是否允许同一账号并发登录
  is-concurrent: true
  # 在多人登录同一账号时,是否共用一个 token
  is-share: false
  # token 风格
  token-style: uuid
  # 是否输出操作日志
  is-log: false
```

### 3. 敏感配置加密

使用 Jasypt 加密敏感配置:

```yaml
# 数据库密码加密
spring:
  datasource:
    password: ENC(加密后的密码)

# Jasypt 配置
jasypt:
  encryptor:
    password: ${JASYPT_ENCRYPTOR_PASSWORD}
    algorithm: PBEWithMD5AndDES
```

### 4. 安全响应头

配置安全响应头:

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

        // 防止点击劫持
        httpResponse.setHeader("X-Frame-Options", "SAMEORIGIN");
        // 防止 XSS
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        // 防止 MIME 类型嗅探
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        // 内容安全策略
        httpResponse.setHeader("Content-Security-Policy", "default-src 'self'");

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

    public static String desensitize(String log) {
        // 手机号脱敏
        log = PHONE_PATTERN.matcher(log).replaceAll("$1****$2");
        // 身份证脱敏
        log = ID_CARD_PATTERN.matcher(log).replaceAll("$1***********$2");
        return log;
    }
}
```

---

## 常见问题

### 1. Token 过期如何处理?

**问题原因:**
- Token 超过有效期
- 用户长时间未操作超过临时有效期
- 管理员强制下线用户

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
```

踢人下线:

```java
// 踢出指定用户
StpUtil.kickout(userId);

// 踢出指定 Token
StpUtil.kickoutByTokenValue(tokenValue);
```

### 3. 加密字段查询如何处理?

**问题原因:**
- 加密后的数据无法直接进行模糊查询
- 加密数据可能包含特殊字符

**解决方案:**

使用可搜索加密或摘要索引:

```java
/**
 * 用户实体 - 支持加密字段查询
 */
public class SysUser {

    /** 手机号(加密存储) */
    @EncryptField
    private String phonenumber;

    /** 手机号后四位(用于查询) */
    private String phoneLast4;
}

// 保存时同时存储后四位
user.setPhoneLast4(phone.substring(phone.length() - 4));

// 查询时使用后四位匹配
wrapper.eq(SysUser::getPhoneLast4, phoneLast4);
```

### 4. 如何自定义脱敏策略?

**解决方案:**

扩展 `SensitiveStrategy` 枚举或实现自定义 Handler:

```java
/**
 * 自定义脱敏策略 - 银行账户
 */
BANK_ACCOUNT(s -> {
    if (s == null || s.length() <= 8) {
        return s;
    }
    return s.substring(0, 4) + "****" + s.substring(s.length() - 4);
});
```

### 5. 限流配置不生效?

**问题原因:**
- Redis 未正确配置
- 限流 key 冲突
- 注解使用方式错误

**解决方案:**

检查 Redis 配置和限流注解:

```yaml
# 确保 Redis 正确配置
spring:
  redis:
    host: localhost
    port: 6379
```

```java
// 正确使用限流注解
@RateLimiter(
    key = "unique:key:",      // 确保 key 唯一
    time = 60,                // 时间窗口
    count = 10,               // 最大次数
    limitType = LimitType.IP  // 限流类型
)
```

---

## 安全检查清单

### 部署前安全检查

- [ ] 修改所有默认密码(数据库、Redis、管理员账号等)
- [ ] 配置 HTTPS,禁用 HTTP
- [ ] 关闭调试模式和详细错误信息
- [ ] 配置防火墙,仅开放必要端口
- [ ] 启用 SQL 注入防护
- [ ] 启用 XSS 防护
- [ ] 配置安全响应头
- [ ] 检查敏感配置是否加密
- [ ] 配置操作日志和登录日志
- [ ] 设置合理的 Token 过期时间
- [ ] 配置密码强度策略
- [ ] 启用验证码防护

### 定期安全审计

- [ ] 检查异常登录记录
- [ ] 审计敏感操作日志
- [ ] 检查权限配置是否合理
- [ ] 更新安全依赖版本
- [ ] 检查证书有效期
- [ ] 测试备份恢复流程
