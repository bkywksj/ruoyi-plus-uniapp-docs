# API安全

## 介绍

RuoYi-Plus 提供完整的API安全解决方案，包括接口限流、重复提交防护、签名验证、数据加密、权限控制等机制。

**核心特性：**

- **接口限流** - 基于Redis令牌桶算法，支持全局/IP/集群限流
- **重复提交防护** - 基于Redis分布式锁，防止表单重复提交
- **API签名验证** - MD5签名+时间戳验证，防止篡改和重放攻击
- **数据加密传输** - AES+RSA混合加密
- **权限认证** - Sa-Token框架细粒度控制
- **操作日志** - 自动记录接口访问日志

---

## 接口限流

### 限流类型

```java
public enum LimitType {
    DEFAULT,  // 全局限流，所有请求共享配额
    IP,       // IP限流，每个客户端IP独立
    CLUSTER   // 集群限流，每个节点独立
}
```

### 限流注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimiter {
    String key() default "";           // 限流key，支持SpEL
    int time() default 60;             // 时间窗口(秒)
    int count() default 100;           // 允许的最大请求次数
    LimitType limitType() default LimitType.DEFAULT;
    String message() default "{rate.limiter.message}";
}
```

### 使用示例

```java
@RestController
@RequestMapping("/user")
public class UserController {

    // 全局限流：每分钟100次
    @RateLimiter(time = 60, count = 100)
    @GetMapping("/list")
    public R<List<SysUser>> list() {
        return R.ok(userService.selectUserList());
    }

    // IP限流：每个IP每分钟5次登录
    @RateLimiter(time = 60, count = 5, limitType = LimitType.IP,
        message = "登录尝试次数过多,请稍后再试")
    @PostMapping("/login")
    public R<LoginVo> login(@RequestBody LoginBody body) {
        return R.ok(loginService.login(body));
    }

    // 用户级限流：SpEL表达式
    @RateLimiter(key = "#userId", time = 3600, count = 5,
        message = "导出操作过于频繁")
    @GetMapping("/export")
    public void export(@RequestParam Long userId, HttpServletResponse response) {
        userService.exportExcel(userId, response);
    }
}
```

### 限流配置建议

| 接口类型 | 建议配置 | 说明 |
|---------|---------|------|
| 登录接口 | 5-10次/分钟/IP | 防止暴力破解 |
| 验证码 | 3次/分钟/IP | 防止短信轰炸 |
| 查询接口 | 100-1000次/分钟 | 防止爬虫 |
| 写入接口 | 10-50次/分钟 | 防止数据污染 |
| 导出接口 | 5次/小时/用户 | 防止资源滥用 |

---

## 重复提交防护

### 防重注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RepeatSubmit {
    int interval() default 5000;       // 检测间隔(毫秒)
    TimeUnit timeUnit() default TimeUnit.MILLISECONDS;
    String message() default "{repeat.submit.message}";
}
```

### 使用示例

```java
@RestController
@RequestMapping("/order")
public class OrderController {

    // 5秒内防重
    @RepeatSubmit
    @PostMapping("/create")
    public R<Order> createOrder(@RequestBody OrderCreateBo bo) {
        return R.ok(orderService.createOrder(bo));
    }

    // 10秒内防重
    @RepeatSubmit(interval = 10, timeUnit = TimeUnit.SECONDS,
        message = "支付请求处理中,请勿重复提交")
    @PostMapping("/pay")
    public R<PayResult> payOrder(@RequestBody PayOrderBo bo) {
        return R.ok(payService.pay(bo));
    }
}
```

### 防重机制

```text
工作流程:
1. 请求到达 → 生成唯一标识(URL + Token + 参数MD5)
2. 检查Redis是否存在该标识
3. 不存在 → 存入Redis，执行业务逻辑
4. 存在 → 拒绝请求，返回重复提交提示
5. 业务失败 → 删除Redis缓存(允许重试)
```

---

## API签名验证

### 签名流程

```text
1. 客户端生成时间戳
2. 计算签名: MD5(appKey + timestamp + appSecret)
3. 发送请求，携带appKey、timestamp、sign
4. 服务端验证时间戳有效期(防重放)
5. 服务端验证签名(防篡改)
6. 验证签名是否重复使用(防重放)
```

### 签名工具

```java
public class OpenApiSignUtils {

    // 生成签名
    public static String generateSign(String appKey, String timestamp,
            String appSecret) {
        String signStr = appKey + timestamp + appSecret;
        return SecureUtil.md5(signStr).toLowerCase();
    }

    // 验证签名
    public static boolean verifySign(String appKey, String timestamp,
            String appSecret, String sign) {
        String expectedSign = generateSign(appKey, timestamp, appSecret);
        return expectedSign.equals(sign);
    }

    // 验证时间戳
    public static boolean verifyTimestamp(String timestamp, int expireSeconds) {
        try {
            long ts = Long.parseLong(timestamp);
            long now = System.currentTimeMillis();
            return Math.abs(now - ts) <= expireSeconds * 1000L;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
```

### OpenAPI注解

```java
@OpenApi("获取用户信息")
@GetMapping("/user/info")
public R<UserInfo> getUserInfo(@RequestParam Long userId) {
    return R.ok(userService.getById(userId));
}
```

### 客户端调用

```java
public class OpenApiClient {
    private static final String APP_KEY = "your_app_key";
    private static final String APP_SECRET = "your_app_secret";

    public String callApi(String apiPath, Map<String, Object> params) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String sign = OpenApiSignUtils.generateSign(APP_KEY, timestamp, APP_SECRET);

        return HttpRequest.get(BASE_URL + apiPath)
            .header("X-App-Key", APP_KEY)
            .header("X-Timestamp", timestamp)
            .header("X-Sign", sign)
            .form(params)
            .execute()
            .body();
    }
}
```

---

## 数据加密传输

### 加密注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiEncrypt {
    boolean response() default false;  // 是否加密响应
}
```

### 使用示例

```java
@RestController
@RequestMapping("/secure")
public class SecureController {

    // 请求解密，响应加密
    @ApiEncrypt(response = true)
    @PostMapping("/login")
    public R<LoginVo> login(@RequestBody LoginBody body) {
        return R.ok(loginService.login(body));
    }

    // 仅请求解密
    @ApiEncrypt
    @PostMapping("/updatePassword")
    public R<Void> updatePassword(@RequestBody UpdatePasswordBo bo) {
        userService.updatePassword(bo);
        return R.ok();
    }
}
```

### 混合加密流程

```text
请求加密:
1. 前端生成32位随机AES密钥
2. 使用AES密钥加密请求数据
3. 使用RSA公钥加密AES密钥
4. 将加密的AES密钥放入请求头(encrypt-key)
5. 将加密数据作为请求体发送

响应加密:
1. 后端生成32位随机AES密钥
2. 使用AES密钥加密响应数据
3. 使用RSA公钥加密AES密钥
4. 将加密的AES密钥放入响应头
```

---

## 权限认证

### 权限注解

```java
// 权限验证
@SaCheckPermission("system:user:list")
@GetMapping("/list")
public TableDataInfo<SysUserVo> list(SysUserBo bo) {
    return userService.selectPageList(bo);
}

// 角色验证
@SaCheckRole("admin")
@PostMapping("/resetPwd")
public R<Void> resetPwd(@RequestBody SysUserBo bo) {
    return toAjax(userService.resetPwd(bo));
}

// OR模式
@SaCheckPermission(value = {"system:user:add", "system:user:edit"}, mode = SaMode.OR)
@PostMapping("/save")
public R<Void> save(@RequestBody SysUserBo bo) { ... }

// AND模式
@SaCheckPermission(value = {"system:user:remove", "system:user:confirm"}, mode = SaMode.AND)
@DeleteMapping("/{userIds}")
public R<Void> remove(@PathVariable Long[] userIds) { ... }

// 跳过认证
@SaIgnore
@GetMapping("/captcha")
public R<CaptchaVo> getCaptcha() { ... }
```

### 排除认证路径

```yaml
security:
  excludes:
    - /auth/login
    - /auth/register
    - /captcha/**
    - /static/**
    - /v3/api-docs/**
    - /actuator/health
```

---

## 操作日志

### 日志注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Log {
    String title() default "";                    // 模块名称
    DictOperType operType() default DictOperType.OTHER;  // 操作类型
    boolean isSaveRequestData() default true;     // 保存请求参数
    boolean isSaveResponseData() default true;    // 保存响应参数
    String[] excludeParamNames() default {};      // 排除的参数名
}
```

### 操作类型

```java
public enum DictOperType {
    OTHER,        // 其他
    INSERT,       // 新增
    UPDATE,       // 修改
    DELETE,       // 删除
    GRANT,        // 授权
    EXPORT,       // 导出
    IMPORT,       // 导入
    FORCE_EXIT,   // 强退
    CHANGE_STATUS,// 修改状态
    CLEAN_UP      // 清空数据
}
```

### 使用示例

```java
@Log(title = "用户管理", operType = DictOperType.INSERT)
@SaCheckPermission("system:user:add")
@PostMapping
public R<Void> add(@Validated @RequestBody SysUserBo bo) {
    userService.insertUser(bo);
    return R.ok();
}

// 排除敏感参数
@Log(title = "用户管理", operType = DictOperType.UPDATE,
    excludeParamNames = {"password", "oldPassword"})
@PutMapping
public R<Void> edit(@RequestBody SysUserBo bo) {
    userService.updateUser(bo);
    return R.ok();
}

// 不保存响应(数据量大)
@Log(title = "用户管理", operType = DictOperType.EXPORT,
    isSaveRequestData = false, isSaveResponseData = false)
@PostMapping("/export")
public void export(SysUserBo bo, HttpServletResponse response) {
    userService.export(bo, response);
}
```

---

## 安全检查清单

### 接口认证

- [ ] 所有接口默认需要认证
- [ ] 公开接口显式使用 `@SaIgnore` 标注
- [ ] 敏感接口使用多重认证(权限+角色)
- [ ] Token有效期设置合理

### 访问控制

- [ ] 实现细粒度的权限控制
- [ ] 重要操作记录审计日志
- [ ] 配置接口限流保护
- [ ] 配置重复提交防护

### 数据保护

- [ ] 敏感数据加密传输
- [ ] 日志中敏感信息脱敏
- [ ] 错误响应不暴露敏感信息

---

## 常见问题

### 1. 限流配置不生效

**解决方案：**
```java
// 检查Redis配置
@Bean
public RedissonClient redissonClient() {
    Config config = new Config();
    config.useSingleServer()
        .setAddress("redis://localhost:6379");
    return Redisson.create(config);
}

// 确保切面生效
@EnableAspectJAutoProxy
@ComponentScan("plus.ruoyi.common.ratelimiter")
public class RateLimiterConfig { }
```

### 2. 防重提交误判

**解决方案：**
```java
// 确保能获取到用户标识
private String getUserKey() {
    String token = StpUtil.getTokenValue();
    if (StrUtil.isBlank(token)) {
        return ServletUtils.getRequest().getSession().getId();
    }
    return token;
}

// 调整间隔时间
@RepeatSubmit(interval = 10000)  // 10秒，避免网络延迟导致的误判
```

### 3. API签名时间戳验证失败

**解决方案：**
```java
// 增加时间容差
public static boolean verifyTimestamp(String timestamp, int expireSeconds) {
    long ts = Long.parseLong(timestamp);
    long now = System.currentTimeMillis();
    long tolerance = 5 * 60 * 1000L;  // 允许5分钟误差
    return Math.abs(now - ts) <= expireSeconds * 1000L + tolerance;
}

// 提供时间同步接口
@SaIgnore
@GetMapping("/api/time")
public R<Long> getServerTime() {
    return R.ok(System.currentTimeMillis());
}
```

### 4. 加密传输性能问题

**解决方案：**
- 使用AES+RSA混合加密(AES加密数据，RSA加密密钥)
- 缓存AES密钥(会话级别)
- 只对敏感接口使用 `@ApiEncrypt`

