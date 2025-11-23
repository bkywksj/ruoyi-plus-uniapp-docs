# API安全

API安全是Web应用安全的核心组成部分,涵盖接口的认证授权、访问控制、数据保护、攻击防护等多个方面。RuoYi-Plus框架提供了完整的API安全解决方案,包括接口限流、重复提交防护、签名验证、数据加密、权限控制、日志审计等机制,确保API接口的安全可靠运行。

**核心特性:**

- **接口限流** - 基于Redis令牌桶算法,支持全局限流、IP限流、集群限流
- **重复提交防护** - 基于Redis分布式锁,防止表单重复提交
- **API签名验证** - MD5签名+时间戳验证,防止请求篡改和重放攻击
- **数据加密传输** - AES+RSA混合加密,保障数据传输安全
- **权限认证** - Sa-Token框架,支持权限和角色的细粒度控制
- **XSS防护** - 多模式XSS检测,防止跨站脚本攻击
- **操作日志** - 自动记录接口访问日志,支持审计追溯

---

## 接口限流

### 限流机制概述

接口限流是保护系统的重要手段,可以防止恶意请求、爬虫攻击、流量洪峰等对系统造成过载。RuoYi-Plus基于Redis和Redisson实现分布式限流。

```
限流架构
├── 注解层
│   └── @RateLimiter          # 限流注解
├── 切面层
│   └── RateLimiterAspect     # 限流切面处理
├── 枚举层
│   └── LimitType             # 限流类型枚举
└── 存储层
    └── Redis + Redisson      # 分布式限流存储
```

### 限流类型

框架支持三种限流策略:

```java
/**
 * 限流类型枚举
 */
public enum LimitType {

    /**
     * 全局限流
     * 所有请求共享同一个限流配额
     * 适用: 系统级别的流量控制
     */
    DEFAULT,

    /**
     * IP限流
     * 每个客户端IP独立限流
     * 适用: 防止单个IP的恶意请求
     */
    IP,

    /**
     * 集群限流
     * 每个集群节点独立限流
     * 适用: 分布式部署时的节点级限流
     */
    CLUSTER

}
```

### 限流注解使用

```java
/**
 * 限流注解
 * 基于令牌桶算法实现的接口限流
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimiter {

    /**
     * 限流key
     * 支持SpEL表达式,如: #user.id
     */
    String key() default "";

    /**
     * 限流时间窗口(单位:秒)
     * 默认60秒
     */
    int time() default 60;

    /**
     * 限流次数阈值
     * 在时间窗口内允许的最大请求次数
     * 默认100次
     */
    int count() default 100;

    /**
     * 限流类型
     * DEFAULT: 全局限流
     * IP: IP限流
     * CLUSTER: 集群限流
     */
    LimitType limitType() default LimitType.DEFAULT;

    /**
     * 触发限流时的提示消息
     * 支持国际化key
     */
    String message() default "{rate.limiter.message}";

    /**
     * 限流策略在Redis中的存活时间(单位:秒)
     * 默认1天
     */
    int timeout() default 86400;

}
```

### 使用示例

```java
/**
 * 用户控制器
 * 演示限流配置
 */
@RestController
@RequestMapping("/user")
public class UserController {

    /**
     * 用户列表查询 - 全局限流
     * 所有用户每分钟最多访问100次
     */
    @RateLimiter(time = 60, count = 100)
    @GetMapping("/list")
    public R<List<SysUser>> list() {
        return R.ok(userService.selectUserList());
    }

    /**
     * 登录接口 - IP限流
     * 每个IP每分钟最多尝试5次登录
     */
    @RateLimiter(time = 60, count = 5, limitType = LimitType.IP,
        message = "登录尝试次数过多,请稍后再试")
    @PostMapping("/login")
    public R<LoginVo> login(@RequestBody LoginBody body) {
        return R.ok(loginService.login(body));
    }

    /**
     * 发送短信验证码 - IP限流
     * 每个IP每分钟最多发送3条短信
     */
    @RateLimiter(time = 60, count = 3, limitType = LimitType.IP,
        message = "短信发送频率过高,请稍后再试")
    @PostMapping("/sendSms")
    public R<Void> sendSms(@RequestParam String phone) {
        smsService.sendVerifyCode(phone);
        return R.ok();
    }

    /**
     * 导出用户数据 - 用户级限流
     * 使用SpEL表达式按用户ID限流
     * 每个用户每小时最多导出5次
     */
    @RateLimiter(key = "#userId", time = 3600, count = 5,
        message = "导出操作过于频繁,请稍后再试")
    @GetMapping("/export")
    public void export(@RequestParam Long userId, HttpServletResponse response) {
        userService.exportExcel(userId, response);
    }

    /**
     * 敏感操作 - 严格限流
     * 每个用户每天最多操作3次
     */
    @RateLimiter(key = "sensitive:#userId", time = 86400, count = 3,
        limitType = LimitType.DEFAULT,
        message = "敏感操作次数已达上限")
    @PostMapping("/sensitiveOp")
    public R<Void> sensitiveOperation(@RequestParam Long userId) {
        return R.ok();
    }

}
```

### 限流切面实现

```java
/**
 * 限流切面处理器
 * 基于Redisson实现分布式限流
 */
@Aspect
@Slf4j
public class RateLimiterAspect {

    private final RedissonClient redissonClient;

    /**
     * 限流前置检查
     */
    @Before("@annotation(rateLimiter)")
    public void doBefore(JoinPoint point, RateLimiter rateLimiter)
            throws Throwable {
        // 获取限流参数
        int time = rateLimiter.time();
        int count = rateLimiter.count();
        int timeout = rateLimiter.timeout();

        // 生成限流缓存key
        String combineKey = getCombineKey(rateLimiter, point);

        // 获取Redisson限流器
        RRateLimiter limiter = redissonClient.getRateLimiter(combineKey);

        // 设置限流策略
        RateType rateType = rateLimiter.limitType() == LimitType.CLUSTER
            ? RateType.PER_CLIENT
            : RateType.OVERALL;

        // 尝试设置限流配置(仅首次生效)
        limiter.trySetRate(rateType, count, time, RateIntervalUnit.SECONDS);
        // 设置过期时间
        limiter.expire(Duration.ofSeconds(timeout));

        // 尝试获取令牌
        if (!limiter.tryAcquire()) {
            String message = rateLimiter.message();
            // 支持国际化
            if (message.startsWith("{") && message.endsWith("}")) {
                message = MessageUtils.message(
                    message.substring(1, message.length() - 1)
                );
            }
            throw new ServiceException(message);
        }

        log.debug("限流检查通过, key: {}, count: {}/{}, time: {}s",
            combineKey, 1, count, time);
    }

    /**
     * 生成限流缓存key
     */
    private String getCombineKey(RateLimiter rateLimiter, JoinPoint point) {
        StringBuilder sb = new StringBuilder("rate_limit:");

        // 添加请求URI
        ServletRequestAttributes attributes = (ServletRequestAttributes)
            RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            sb.append(attributes.getRequest().getRequestURI()).append(":");
        }

        // 添加限流类型标识
        LimitType limitType = rateLimiter.limitType();
        if (limitType == LimitType.IP) {
            sb.append(ServletUtils.getClientIP()).append(":");
        } else if (limitType == LimitType.CLUSTER) {
            sb.append(redissonClient.getId()).append(":");
        }

        // 解析SpEL表达式生成自定义key
        String key = rateLimiter.key();
        if (StrUtil.isNotBlank(key)) {
            MethodSignature signature = (MethodSignature) point.getSignature();
            Method method = signature.getMethod();
            Object[] args = point.getArgs();

            // SpEL表达式解析
            ExpressionParser parser = new SpelExpressionParser();
            EvaluationContext context = new StandardEvaluationContext();
            String[] paramNames = signature.getParameterNames();
            for (int i = 0; i < paramNames.length; i++) {
                context.setVariable(paramNames[i], args[i]);
            }
            String parsedKey = parser.parseExpression(key)
                .getValue(context, String.class);
            sb.append(parsedKey);
        }

        return sb.toString();
    }

}
```

### 限流配置建议

| 接口类型 | 建议限流配置 | 说明 |
|----------|-------------|------|
| 登录接口 | 5-10次/分钟/IP | 防止暴力破解 |
| 验证码接口 | 3次/分钟/IP | 防止短信轰炸 |
| 查询接口 | 100-1000次/分钟 | 防止爬虫 |
| 写入接口 | 10-50次/分钟 | 防止数据污染 |
| 导出接口 | 5次/小时/用户 | 防止资源滥用 |
| 敏感操作 | 3次/天/用户 | 保护关键操作 |

---

## 重复提交防护

### 防重机制概述

重复提交是Web应用常见问题,可能导致数据重复、支付重复等严重后果。RuoYi-Plus参考美团GTIS防重系统设计,基于Redis实现分布式防重机制。

```
防重提交工作流程:
1. 请求到达 → 生成唯一标识(URL + Token + 参数MD5)
2. 检查Redis是否存在该标识
3. 不存在 → 存入Redis,执行业务逻辑
4. 存在 → 拒绝请求,返回重复提交提示
5. 业务成功 → 保留Redis缓存
6. 业务失败 → 删除Redis缓存(允许重试)
```

### 防重注解

```java
/**
 * 防重复提交注解
 * 基于Redis分布式锁实现
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RepeatSubmit {

    /**
     * 重复提交检测间隔时间
     * 在此时间内的重复请求将被拒绝
     * 默认5000毫秒(5秒)
     */
    int interval() default 5000;

    /**
     * 时间单位
     * 默认毫秒
     */
    TimeUnit timeUnit() default TimeUnit.MILLISECONDS;

    /**
     * 重复提交时的提示消息
     * 支持国际化key
     */
    String message() default "{repeat.submit.message}";

}
```

### 使用示例

```java
/**
 * 订单控制器
 * 演示防重复提交配置
 */
@RestController
@RequestMapping("/order")
public class OrderController {

    /**
     * 创建订单 - 5秒内防重
     * 使用默认配置
     */
    @RepeatSubmit
    @PostMapping("/create")
    public R<Order> createOrder(@RequestBody OrderCreateBo bo) {
        return R.ok(orderService.createOrder(bo));
    }

    /**
     * 支付订单 - 10秒内防重
     * 自定义间隔时间
     */
    @RepeatSubmit(interval = 10, timeUnit = TimeUnit.SECONDS,
        message = "支付请求处理中,请勿重复提交")
    @PostMapping("/pay")
    public R<PayResult> payOrder(@RequestBody PayOrderBo bo) {
        return R.ok(payService.pay(bo));
    }

    /**
     * 取消订单 - 3秒内防重
     */
    @RepeatSubmit(interval = 3000,
        message = "订单取消中,请稍候...")
    @PostMapping("/cancel/{orderId}")
    public R<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return R.ok();
    }

    /**
     * 退款申请 - 30秒内防重
     * 敏感操作使用较长间隔
     */
    @RepeatSubmit(interval = 30, timeUnit = TimeUnit.SECONDS,
        message = "退款申请处理中,请勿重复提交")
    @PostMapping("/refund")
    public R<Void> refundOrder(@RequestBody RefundBo bo) {
        orderService.refund(bo);
        return R.ok();
    }

}
```

### 防重切面实现

```java
/**
 * 防重复提交切面处理器
 * 基于Redis实现分布式防重
 */
@Aspect
@Slf4j
public class RepeatSubmitAspect {

    private static final String REPEAT_SUBMIT_KEY = "repeat_submit:";

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 请求前检查
     * 生成唯一标识并检查是否重复
     */
    @Before("@annotation(repeatSubmit)")
    public void doBefore(JoinPoint point, RepeatSubmit repeatSubmit)
            throws Throwable {
        // 获取请求信息
        HttpServletRequest request = ServletUtils.getRequest();
        String url = request.getRequestURI();

        // 获取用户Token
        String token = StpUtil.getTokenValue();
        if (StrUtil.isBlank(token)) {
            token = request.getSession().getId();
        }

        // 获取请求参数
        Object[] args = point.getArgs();
        String params = argsArrayToString(args);

        // 生成唯一标识: MD5(token:参数)
        String submitKey = SecureUtil.md5(token + ":" + params);
        String cacheKey = REPEAT_SUBMIT_KEY + url + ":" + submitKey;

        // 检查是否存在
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cacheKey))) {
            String message = repeatSubmit.message();
            if (message.startsWith("{") && message.endsWith("}")) {
                message = MessageUtils.message(
                    message.substring(1, message.length() - 1)
                );
            }
            throw new ServiceException(message);
        }

        // 存入Redis
        long interval = repeatSubmit.timeUnit()
            .toMillis(repeatSubmit.interval());
        redisTemplate.opsForValue().set(cacheKey, "", interval,
            TimeUnit.MILLISECONDS);

        // 保存key到ThreadLocal,用于后续处理
        RepeatSubmitHolder.set(cacheKey);
    }

    /**
     * 请求成功后保留缓存
     * 防止在间隔时间内再次提交
     */
    @AfterReturning("@annotation(repeatSubmit)")
    public void doAfterReturning(RepeatSubmit repeatSubmit) {
        // 成功后保留缓存,不做处理
        RepeatSubmitHolder.remove();
    }

    /**
     * 请求失败后删除缓存
     * 允许用户重试
     */
    @AfterThrowing("@annotation(repeatSubmit)")
    public void doAfterThrowing(RepeatSubmit repeatSubmit) {
        String cacheKey = RepeatSubmitHolder.get();
        if (StrUtil.isNotBlank(cacheKey)) {
            redisTemplate.delete(cacheKey);
        }
        RepeatSubmitHolder.remove();
    }

    /**
     * 将参数数组转换为字符串
     * 用于生成唯一标识
     */
    private String argsArrayToString(Object[] args) {
        StringBuilder sb = new StringBuilder();
        for (Object arg : args) {
            if (arg != null && !isFilterObject(arg)) {
                sb.append(JsonUtils.toJsonString(arg));
            }
        }
        return sb.toString();
    }

    /**
     * 过滤不参与签名的对象类型
     */
    private boolean isFilterObject(Object o) {
        return o instanceof HttpServletRequest
            || o instanceof HttpServletResponse
            || o instanceof MultipartFile
            || o instanceof MultipartFile[];
    }

}
```

---

## API签名验证

### 签名机制概述

API签名是保障接口安全的重要手段,通过对请求参数进行签名,可以防止请求被篡改和重放。RuoYi-Plus提供完整的OpenAPI签名验证机制。

```
签名验证流程:
1. 客户端生成时间戳
2. 客户端计算签名: MD5(appKey + timestamp + appSecret)
3. 客户端发送请求,携带appKey、timestamp、sign
4. 服务端验证时间戳是否在有效期内(防重放)
5. 服务端验证签名是否有效(防篡改)
6. 服务端验证签名是否重复使用(防重放)
7. 验证通过,执行业务逻辑
```

### 签名注解

```java
/**
 * 开放API接口标识注解
 * 标注此注解的接口需要进行签名验证
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OpenApi {

    /**
     * 接口说明
     */
    String value() default "";

}
```

### 签名工具类

```java
/**
 * OpenAPI签名工具类
 * 提供签名生成和验证功能
 */
public class OpenApiSignUtils {

    /**
     * 生成签名
     * 签名算法: MD5(appKey + timestamp + appSecret)
     *
     * @param appKey 应用Key
     * @param timestamp 时间戳(毫秒)
     * @param appSecret 应用密钥
     * @return MD5签名(32位小写)
     */
    public static String generateSign(String appKey, String timestamp,
            String appSecret) {
        String signStr = appKey + timestamp + appSecret;
        return SecureUtil.md5(signStr).toLowerCase();
    }

    /**
     * 验证签名
     *
     * @param appKey 应用Key
     * @param timestamp 时间戳
     * @param appSecret 应用密钥
     * @param sign 待验证的签名
     * @return 验证结果
     */
    public static boolean verifySign(String appKey, String timestamp,
            String appSecret, String sign) {
        String expectedSign = generateSign(appKey, timestamp, appSecret);
        return expectedSign.equals(sign);
    }

    /**
     * 验证时间戳是否在有效期内
     * 防止重放攻击
     *
     * @param timestamp 时间戳(毫秒)
     * @param expireSeconds 有效期(秒)
     * @return 验证结果
     */
    public static boolean verifyTimestamp(String timestamp, int expireSeconds) {
        try {
            long ts = Long.parseLong(timestamp);
            long now = System.currentTimeMillis();
            // 允许前后误差
            return Math.abs(now - ts) <= expireSeconds * 1000L;
        } catch (NumberFormatException e) {
            return false;
        }
    }

}
```

### 签名拦截器

```java
/**
 * OpenAPI认证拦截器
 * 处理开放API的签名验证和权限控制
 */
@Slf4j
public class OpenApiInterceptor implements HandlerInterceptor {

    private static final String HEADER_APP_KEY = "X-App-Key";
    private static final String HEADER_TIMESTAMP = "X-Timestamp";
    private static final String HEADER_SIGN = "X-Sign";

    /** 时间戳有效期(秒) */
    private static final int TIMESTAMP_EXPIRE_SECONDS = 300;

    /** 签名缓存前缀 */
    private static final String SIGN_CACHE_PREFIX = "openapi:sign:";

    private final RedisTemplate<String, Object> redisTemplate;
    private final ISysClientService clientService;

    @Override
    public boolean preHandle(HttpServletRequest request,
            HttpServletResponse response, Object handler) throws Exception {

        // 判断是否为OpenApi接口
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        OpenApi openApi = handlerMethod.getMethodAnnotation(OpenApi.class);
        if (openApi == null) {
            return true;
        }

        // 获取请求参数(支持请求头和URL参数两种方式)
        String appKey = getParam(request, HEADER_APP_KEY, "appKey");
        String timestamp = getParam(request, HEADER_TIMESTAMP, "timestamp");
        String sign = getParam(request, HEADER_SIGN, "sign");

        // 验证参数完整性
        if (StrUtil.hasBlank(appKey, timestamp, sign)) {
            throw new ServiceException("签名参数不完整");
        }

        // 1. 验证时间戳(防重放攻击)
        if (!OpenApiSignUtils.verifyTimestamp(timestamp, TIMESTAMP_EXPIRE_SECONDS)) {
            throw new ServiceException("请求已过期,请检查系统时间");
        }

        // 2. 验证签名是否已使用(防重放攻击)
        String signCacheKey = SIGN_CACHE_PREFIX + sign;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(signCacheKey))) {
            throw new ServiceException("签名已使用,请重新签名");
        }

        // 3. 获取客户端信息
        SysClient client = clientService.selectByAppKey(appKey);
        if (client == null) {
            throw new ServiceException("无效的AppKey");
        }

        // 4. 验证客户端状态
        if (!"0".equals(client.getStatus())) {
            throw new ServiceException("客户端已禁用");
        }

        // 5. 验证客户端有效期
        if (client.getExpireTime() != null
                && client.getExpireTime().before(new Date())) {
            throw new ServiceException("客户端授权已过期");
        }

        // 6. 验证IP白名单
        String clientIp = ServletUtils.getClientIP();
        if (StrUtil.isNotBlank(client.getWhiteIps())) {
            List<String> whiteIps = StrUtil.split(client.getWhiteIps(), ',');
            if (!whiteIps.contains(clientIp)) {
                throw new ServiceException("IP地址不在白名单内");
            }
        }

        // 7. 验证签名
        if (!OpenApiSignUtils.verifySign(appKey, timestamp,
                client.getAppSecret(), sign)) {
            throw new ServiceException("签名验证失败");
        }

        // 8. 缓存签名(防止重复使用)
        redisTemplate.opsForValue().set(signCacheKey, "",
            TIMESTAMP_EXPIRE_SECONDS, TimeUnit.SECONDS);

        // 9. 设置租户上下文
        if (StrUtil.isNotBlank(client.getTenantId())) {
            TenantHelper.setDynamic(client.getTenantId());
        }

        // 10. 记录调用统计
        recordApiCall(client, request);

        log.debug("OpenAPI验证通过, appKey: {}, api: {}",
            appKey, request.getRequestURI());
        return true;
    }

    /**
     * 获取请求参数
     * 优先从请求头获取,其次从URL参数获取
     */
    private String getParam(HttpServletRequest request,
            String headerName, String paramName) {
        String value = request.getHeader(headerName);
        if (StrUtil.isBlank(value)) {
            value = request.getParameter(paramName);
        }
        return value;
    }

    /**
     * 记录API调用统计
     */
    private void recordApiCall(SysClient client, HttpServletRequest request) {
        // 异步记录调用日志
        AsyncManager.me().execute(() -> {
            clientService.incrementCallCount(client.getId());
        });
    }

}
```

### 客户端调用示例

```java
/**
 * OpenAPI客户端调用示例
 */
public class OpenApiClientExample {

    private static final String APP_KEY = "your_app_key";
    private static final String APP_SECRET = "your_app_secret";
    private static final String BASE_URL = "https://api.example.com";

    /**
     * 调用OpenAPI接口
     */
    public String callApi(String apiPath, Map<String, Object> params) {
        // 1. 生成时间戳
        String timestamp = String.valueOf(System.currentTimeMillis());

        // 2. 生成签名
        String sign = OpenApiSignUtils.generateSign(APP_KEY, timestamp, APP_SECRET);

        // 3. 构建请求
        HttpRequest request = HttpRequest.get(BASE_URL + apiPath)
            .header("X-App-Key", APP_KEY)
            .header("X-Timestamp", timestamp)
            .header("X-Sign", sign)
            .form(params);

        // 4. 发送请求
        HttpResponse response = request.execute();

        return response.body();
    }

    /**
     * POST请求示例
     */
    public String postApi(String apiPath, Object body) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String sign = OpenApiSignUtils.generateSign(APP_KEY, timestamp, APP_SECRET);

        HttpResponse response = HttpRequest.post(BASE_URL + apiPath)
            .header("X-App-Key", APP_KEY)
            .header("X-Timestamp", timestamp)
            .header("X-Sign", sign)
            .header("Content-Type", "application/json")
            .body(JsonUtils.toJsonString(body))
            .execute();

        return response.body();
    }

}
```

---

## 数据加密传输

### 加密机制概述

敏感数据在网络传输过程中需要加密保护。RuoYi-Plus采用AES+RSA混合加密方案,兼顾安全性和性能。

```
混合加密流程:
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
5. 返回加密后的响应数据
```

### 加密注解

```java
/**
 * API加密注解
 * 用于标注需要加密传输的接口
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ApiEncrypt {

    /**
     * 是否对响应进行加密
     * true: 加密响应数据
     * false: 不加密响应数据(默认)
     */
    boolean response() default false;

}
```

### 使用示例

```java
/**
 * 安全相关控制器
 * 演示API加密配置
 */
@RestController
@RequestMapping("/secure")
public class SecureController {

    /**
     * 用户登录 - 请求解密,响应加密
     * 密码等敏感信息需要加密传输
     */
    @ApiEncrypt(response = true)
    @PostMapping("/login")
    public R<LoginVo> login(@RequestBody LoginBody body) {
        // body已自动解密
        LoginVo loginVo = loginService.login(body);
        // 返回数据会自动加密
        return R.ok(loginVo);
    }

    /**
     * 修改密码 - 仅请求解密
     * 新旧密码需要加密传输
     */
    @ApiEncrypt
    @PostMapping("/updatePassword")
    public R<Void> updatePassword(@RequestBody UpdatePasswordBo bo) {
        userService.updatePassword(bo);
        return R.ok();
    }

    /**
     * 获取敏感信息 - 仅响应加密
     */
    @ApiEncrypt(response = true)
    @GetMapping("/sensitiveInfo")
    public R<SensitiveInfoVo> getSensitiveInfo() {
        SensitiveInfoVo vo = userService.getSensitiveInfo();
        return R.ok(vo);
    }

    /**
     * 提交敏感数据 - 双向加密
     */
    @ApiEncrypt(response = true)
    @PostMapping("/submitSensitive")
    public R<SubmitResult> submitSensitiveData(@RequestBody SensitiveDataBo bo) {
        SubmitResult result = dataService.submit(bo);
        return R.ok(result);
    }

}
```

### 加密过滤器

```java
/**
 * 加密过滤器
 * 处理请求解密和响应加密
 */
@Slf4j
public class CryptoFilter implements Filter {

    private final EncryptorProperties properties;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // 获取目标方法的@ApiEncrypt注解
        ApiEncrypt apiEncrypt = getApiEncrypt(httpRequest);
        if (apiEncrypt == null) {
            chain.doFilter(request, response);
            return;
        }

        // 处理请求解密
        if (isEncryptedRequest(httpRequest)) {
            httpRequest = decryptRequest(httpRequest);
        }

        // 是否需要响应加密
        if (apiEncrypt.response()) {
            // 包装响应用于捕获输出
            EncryptResponseWrapper responseWrapper =
                new EncryptResponseWrapper(httpResponse);

            // 执行业务逻辑
            chain.doFilter(httpRequest, responseWrapper);

            // 加密响应数据
            encryptResponse(responseWrapper, httpResponse);
        } else {
            chain.doFilter(httpRequest, response);
        }
    }

    /**
     * 解密请求
     */
    private HttpServletRequest decryptRequest(HttpServletRequest request)
            throws IOException {
        // 获取加密的AES密钥
        String encryptedKey = request.getHeader("encrypt-key");
        if (StrUtil.isBlank(encryptedKey)) {
            throw new ServiceException("缺少加密密钥");
        }

        // RSA私钥解密AES密钥
        String aesKey = EncryptUtils.decryptByRsa(
            encryptedKey, properties.getPrivateKey()
        );

        // 读取加密的请求体
        String encryptedBody = IoUtil.read(request.getInputStream(),
            StandardCharsets.UTF_8);

        // AES解密请求体
        String decryptedBody = EncryptUtils.decryptByAes(encryptedBody, aesKey);

        // 返回解密后的请求包装器
        return new DecryptRequestWrapper(request, decryptedBody);
    }

    /**
     * 加密响应
     */
    private void encryptResponse(EncryptResponseWrapper wrapper,
            HttpServletResponse response) throws IOException {
        // 获取原始响应内容
        String originalContent = wrapper.getContent();

        // 生成随机AES密钥
        String aesKey = RandomUtil.randomString(32);

        // AES加密响应数据
        String encryptedContent = EncryptUtils.encryptByAes(
            originalContent, aesKey
        );

        // RSA公钥加密AES密钥
        String encryptedKey = EncryptUtils.encryptByRsa(
            aesKey, properties.getPublicKey()
        );

        // 设置响应头
        response.setHeader("encrypt-key", encryptedKey);
        response.setContentType("text/plain;charset=UTF-8");

        // 写入加密后的响应
        response.getWriter().write(encryptedContent);
    }

}
```

### 前端加密实现

```typescript
/**
 * 前端加密工具
 * 配合后端@ApiEncrypt使用
 */
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

// RSA公钥(从服务端获取)
const RSA_PUBLIC_KEY = 'MIIBIjANBgkqhki...'

/**
 * 生成随机AES密钥
 */
function generateAesKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}

/**
 * AES加密
 */
function encryptByAes(data: string, key: string): string {
  const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

/**
 * AES解密
 */
function decryptByAes(data: string, key: string): string {
  const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * RSA加密
 */
function encryptByRsa(data: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(RSA_PUBLIC_KEY)
  return encrypt.encrypt(data) || ''
}

/**
 * RSA解密(需要私钥,通常在服务端进行)
 */
function decryptByRsa(data: string, privateKey: string): string {
  const decrypt = new JSEncrypt()
  decrypt.setPrivateKey(privateKey)
  return decrypt.decrypt(data) || ''
}

/**
 * 发送加密请求
 */
export async function sendEncryptedRequest(url: string, data: any) {
  // 1. 生成随机AES密钥
  const aesKey = generateAesKey()

  // 2. AES加密请求数据
  const encryptedData = encryptByAes(JSON.stringify(data), aesKey)

  // 3. RSA加密AES密钥
  const encryptedKey = encryptByRsa(aesKey)

  // 4. 发送请求
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'encrypt-key': encryptedKey
    },
    body: encryptedData
  })

  // 5. 检查响应是否加密
  const responseKey = response.headers.get('encrypt-key')
  if (responseKey) {
    // 解密响应(需要服务端返回解密用的密钥,或使用约定的密钥)
    const encryptedResponse = await response.text()
    // 实际场景中,服务端通常使用新的AES密钥加密响应
    // 这里简化处理
    return JSON.parse(encryptedResponse)
  }

  return response.json()
}
```

---

## 权限认证

### Sa-Token权限框架

RuoYi-Plus基于Sa-Token框架实现权限认证,支持权限和角色的细粒度控制。

```
权限认证架构
├── 认证层
│   ├── StpUtil              # 会话工具类
│   └── LoginHelper          # 登录助手工具
├── 权限层
│   ├── SaPermissionImpl     # 权限接口实现
│   └── @SaCheckPermission   # 权限校验注解
├── 角色层
│   ├── @SaCheckRole         # 角色校验注解
│   └── @SaCheckLogin        # 登录校验注解
└── 配置层
    └── SecurityProperties   # 安全配置属性
```

### 权限注解使用

```java
/**
 * 用户管理控制器
 * 演示权限认证配置
 */
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    /**
     * 查询用户列表
     * 需要 system:user:list 权限
     */
    @SaCheckPermission("system:user:list")
    @GetMapping("/list")
    public TableDataInfo<SysUserVo> list(SysUserBo bo) {
        return userService.selectPageList(bo);
    }

    /**
     * 新增用户
     * 需要 system:user:add 权限
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", operType = DictOperType.INSERT)
    @PostMapping
    public R<Void> add(@Validated @RequestBody SysUserBo bo) {
        userService.insertUser(bo);
        return R.ok();
    }

    /**
     * 修改用户
     * 需要 system:user:edit 权限
     */
    @SaCheckPermission("system:user:edit")
    @Log(title = "用户管理", operType = DictOperType.UPDATE)
    @PutMapping
    public R<Void> edit(@Validated @RequestBody SysUserBo bo) {
        userService.updateUser(bo);
        return R.ok();
    }

    /**
     * 删除用户
     * 需要 system:user:remove 权限
     */
    @SaCheckPermission("system:user:remove")
    @Log(title = "用户管理", operType = DictOperType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        userService.deleteUserByIds(userIds);
        return R.ok();
    }

    /**
     * 重置密码
     * 同时需要 system:user:edit 和 system:user:resetPwd 权限
     */
    @SaCheckPermission(value = {"system:user:edit", "system:user:resetPwd"},
        mode = SaMode.AND)
    @Log(title = "用户管理", operType = DictOperType.UPDATE)
    @PutMapping("/resetPwd")
    public R<Void> resetPwd(@RequestBody SysUserBo bo) {
        userService.resetPwd(bo);
        return R.ok();
    }

    /**
     * 导出用户
     * 需要 system:user:export 权限
     */
    @SaCheckPermission("system:user:export")
    @Log(title = "用户管理", operType = DictOperType.EXPORT)
    @PostMapping("/export")
    public void export(SysUserBo bo, HttpServletResponse response) {
        userService.export(bo, response);
    }

}
```

### 角色校验

```java
/**
 * 角色校验示例
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    /**
     * 管理员专用接口
     * 需要 admin 角色
     */
    @SaCheckRole("admin")
    @GetMapping("/dashboard")
    public R<DashboardVo> dashboard() {
        return R.ok(dashboardService.getData());
    }

    /**
     * 超级管理员专用接口
     * 需要 superadmin 角色
     */
    @SaCheckRole("superadmin")
    @GetMapping("/system/config")
    public R<List<SysConfig>> getSystemConfig() {
        return R.ok(configService.selectList());
    }

    /**
     * 多角色校验(OR关系)
     * 拥有 admin 或 manager 角色即可访问
     */
    @SaCheckRole(value = {"admin", "manager"}, mode = SaMode.OR)
    @GetMapping("/reports")
    public R<List<Report>> getReports() {
        return R.ok(reportService.selectList());
    }

    /**
     * 多角色校验(AND关系)
     * 必须同时拥有 admin 和 audit 角色
     */
    @SaCheckRole(value = {"admin", "audit"}, mode = SaMode.AND)
    @GetMapping("/audit/logs")
    public R<List<AuditLog>> getAuditLogs() {
        return R.ok(auditService.selectList());
    }

}
```

### 排除认证路径

```java
/**
 * 安全配置属性
 * 配置无需认证的路径
 */
@Data
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {

    /**
     * 排除认证的路径列表
     */
    private String[] excludes = {};

}
```

配置示例:

```yaml
# application.yml
security:
  excludes:
    # 登录注册
    - /auth/login
    - /auth/register
    - /auth/logout
    # 验证码
    - /captcha/**
    # 静态资源
    - /static/**
    - /public/**
    # 文档
    - /v3/api-docs/**
    - /swagger-ui/**
    - /doc.html
    # 健康检查
    - /actuator/health
    - /actuator/info
    # 开放API
    - /api/public/**
```

### 跳过认证注解

```java
/**
 * 使用@SaIgnore跳过认证
 */
@RestController
@RequestMapping("/public")
public class PublicController {

    /**
     * 公开接口 - 无需登录
     */
    @SaIgnore
    @GetMapping("/notice")
    public R<List<Notice>> getPublicNotice() {
        return R.ok(noticeService.getPublicNotice());
    }

    /**
     * 公开接口 - 获取应用配置
     */
    @SaIgnore
    @GetMapping("/config")
    public R<AppConfig> getAppConfig() {
        return R.ok(configService.getAppConfig());
    }

}
```

---

## 操作日志

### 日志注解

```java
/**
 * 操作日志注解
 * 自动记录接口的操作日志
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {

    /**
     * 模块名称
     */
    String title() default "";

    /**
     * 操作类型
     */
    DictOperType operType() default DictOperType.OTHER;

    /**
     * 是否保存请求参数
     * 默认true
     */
    boolean isSaveRequestData() default true;

    /**
     * 是否保存响应参数
     * 默认true
     */
    boolean isSaveResponseData() default true;

    /**
     * 排除指定的请求参数
     * 用于过滤敏感参数
     */
    String[] excludeParamNames() default {};

}
```

### 操作类型枚举

```java
/**
 * 操作类型枚举
 */
public enum DictOperType {

    /** 其他 */
    OTHER,

    /** 新增 */
    INSERT,

    /** 修改 */
    UPDATE,

    /** 删除 */
    DELETE,

    /** 授权 */
    GRANT,

    /** 导出 */
    EXPORT,

    /** 导入 */
    IMPORT,

    /** 强退 */
    FORCE_EXIT,

    /** 修改状态 */
    CHANGE_STATUS,

    /** 清空数据 */
    CLEAN_UP

}
```

### 使用示例

```java
/**
 * 角色管理控制器
 * 演示操作日志记录
 */
@RestController
@RequestMapping("/system/role")
public class SysRoleController {

    /**
     * 新增角色
     * 记录完整的请求和响应参数
     */
    @Log(title = "角色管理", operType = DictOperType.INSERT)
    @SaCheckPermission("system:role:add")
    @PostMapping
    public R<Void> add(@Validated @RequestBody SysRoleBo bo) {
        roleService.insertRole(bo);
        return R.ok();
    }

    /**
     * 修改角色
     * 排除敏感参数
     */
    @Log(title = "角色管理", operType = DictOperType.UPDATE,
        excludeParamNames = {"password", "oldPassword"})
    @SaCheckPermission("system:role:edit")
    @PutMapping
    public R<Void> edit(@Validated @RequestBody SysRoleBo bo) {
        roleService.updateRole(bo);
        return R.ok();
    }

    /**
     * 删除角色
     * 不保存响应参数
     */
    @Log(title = "角色管理", operType = DictOperType.DELETE,
        isSaveResponseData = false)
    @SaCheckPermission("system:role:remove")
    @DeleteMapping("/{roleIds}")
    public R<Void> remove(@PathVariable Long[] roleIds) {
        roleService.deleteRoleByIds(roleIds);
        return R.ok();
    }

    /**
     * 导出角色
     * 不保存请求和响应参数(数据量大)
     */
    @Log(title = "角色管理", operType = DictOperType.EXPORT,
        isSaveRequestData = false, isSaveResponseData = false)
    @SaCheckPermission("system:role:export")
    @PostMapping("/export")
    public void export(SysRoleBo bo, HttpServletResponse response) {
        roleService.export(bo, response);
    }

}
```

---

## XSS防护

### XSS检测模式

框架支持三种XSS检测模式:

```java
/**
 * XSS检测模式
 */
public enum Mode {

    /**
     * 基础模式
     * 检测: script标签、事件处理器(onclick等)、伪协议(javascript:)、
     *       危险标签(object/applet/embed/form/iframe等)
     * 适用: 大多数业务场景
     */
    BASIC,

    /**
     * 严格模式
     * 在基础模式上增加:
     * - HTML实体编码检测(&#数字;)
     * - URL编码检测(%3c等)
     * - Unicode编码检测(\x \u)
     * - 危险函数检测(eval/document/window等)
     * - data伪协议检测
     * 适用: 安全要求高的场景
     */
    STRICT,

    /**
     * 宽松模式
     * 仅检测: script标签、伪协议、iframe/object/embed
     * 适用: 需要允许部分HTML的场景(富文本等)
     */
    LENIENT

}
```

### XSS注解使用

```java
/**
 * XSS防护注解
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = XssValidator.class)
public @interface Xss {

    String message() default "参数包含非法字符";

    Mode mode() default Mode.BASIC;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
```

### 使用示例

```java
/**
 * 评论请求体
 * 演示XSS防护配置
 */
public class CommentBo {

    /**
     * 评论标题 - 基础XSS检测
     */
    @Xss(message = "标题不能包含脚本代码")
    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题最长100个字符")
    private String title;

    /**
     * 评论内容 - 严格XSS检测
     */
    @Xss(mode = Xss.Mode.STRICT, message = "内容存在安全风险")
    @NotBlank(message = "内容不能为空")
    @Size(max = 2000, message = "内容最长2000个字符")
    private String content;

    /**
     * 富文本内容 - 宽松模式
     * 允许基本HTML标签
     */
    @Xss(mode = Xss.Mode.LENIENT, message = "富文本包含危险脚本")
    private String richText;

}
```

---

## 最佳实践

### 1. API安全设计原则

```
安全设计原则:
├── 最小权限原则 - 只授予必要的权限
├── 纵深防御原则 - 多层安全防护
├── 默认拒绝原则 - 默认禁止,显式允许
├── 失败安全原则 - 异常时拒绝访问
└── 审计追溯原则 - 完整的操作日志
```

### 2. 接口安全配置清单

```java
/**
 * 安全接口示例
 * 综合运用各种安全机制
 */
@RestController
@RequestMapping("/secure/order")
public class SecureOrderController {

    /**
     * 创建订单
     * 安全措施:
     * 1. @SaCheckPermission - 权限控制
     * 2. @RepeatSubmit - 防重复提交
     * 3. @RateLimiter - 接口限流
     * 4. @Log - 操作日志
     * 5. @Validated - 参数校验
     * 6. @Xss - XSS防护(在BO中配置)
     */
    @SaCheckPermission("order:create")
    @RepeatSubmit(interval = 10, timeUnit = TimeUnit.SECONDS)
    @RateLimiter(time = 60, count = 10, limitType = LimitType.IP)
    @Log(title = "订单管理", operType = DictOperType.INSERT)
    @PostMapping("/create")
    public R<Order> createOrder(@Validated @RequestBody OrderCreateBo bo) {
        return R.ok(orderService.createOrder(bo));
    }

    /**
     * 支付订单
     * 敏感操作:
     * 1. 更严格的权限控制
     * 2. 请求加密
     * 3. 更长的防重间隔
     * 4. 更严格的限流
     */
    @SaCheckPermission(value = {"order:pay", "finance:operate"},
        mode = SaMode.AND)
    @ApiEncrypt(response = true)
    @RepeatSubmit(interval = 30, timeUnit = TimeUnit.SECONDS)
    @RateLimiter(time = 60, count = 3, limitType = LimitType.IP)
    @Log(title = "订单支付", operType = DictOperType.UPDATE,
        excludeParamNames = {"cardNo", "cvv", "password"})
    @PostMapping("/pay")
    public R<PayResult> payOrder(@Validated @RequestBody PayOrderBo bo) {
        return R.ok(payService.pay(bo));
    }

}
```

### 3. 敏感接口保护

```java
/**
 * 敏感接口保护示例
 */
@RestController
@RequestMapping("/sensitive")
public class SensitiveController {

    /**
     * 获取敏感配置
     * 多重保护: 角色+权限+IP限制
     */
    @SaCheckRole("superadmin")
    @SaCheckPermission("system:config:sensitive")
    @RateLimiter(time = 3600, count = 10, limitType = LimitType.IP)
    @Log(title = "敏感配置", operType = DictOperType.OTHER)
    @GetMapping("/config")
    public R<SensitiveConfig> getSensitiveConfig() {
        // 额外检查IP白名单
        String clientIp = ServletUtils.getClientIP();
        if (!isInWhiteList(clientIp)) {
            throw new ServiceException("IP不在白名单内");
        }
        return R.ok(configService.getSensitiveConfig());
    }

}
```

### 4. 错误处理安全

```java
/**
 * 全局异常处理器
 * 安全的错误响应
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理权限异常
     * 不暴露具体权限信息
     */
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e) {
        log.warn("权限不足: {}", e.getMessage());
        return R.fail(HttpStatus.FORBIDDEN, "没有访问权限");
    }

    /**
     * 处理限流异常
     */
    @ExceptionHandler(RateLimiterException.class)
    public R<Void> handleRateLimiterException(RateLimiterException e) {
        log.warn("触发限流: {}", e.getMessage());
        return R.fail(HttpStatus.TOO_MANY_REQUESTS, "请求过于频繁,请稍后再试");
    }

    /**
     * 处理签名异常
     * 不暴露签名细节
     */
    @ExceptionHandler(SignatureException.class)
    public R<Void> handleSignatureException(SignatureException e) {
        log.warn("签名验证失败: {}", e.getMessage());
        return R.fail(HttpStatus.UNAUTHORIZED, "请求验证失败");
    }

}
```

---

## 常见问题

### 1. 限流配置不生效

**问题原因:**
- Redis未正确配置
- 注解未被扫描
- 切面顺序问题

**解决方案:**

```java
// 1. 检查Redis配置
@Configuration
public class RedisConfig {
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
            .setAddress("redis://localhost:6379")
            .setDatabase(0);
        return Redisson.create(config);
    }
}

// 2. 确保切面生效
@EnableAspectJAutoProxy
@ComponentScan("plus.ruoyi.common.ratelimiter")
public class RateLimiterConfig {
}

// 3. 检查切面顺序
@Aspect
@Order(1)  // 设置优先级
public class RateLimiterAspect {
}
```

### 2. 防重提交误判

**问题原因:**
- Token获取失败
- 参数序列化问题
- Redis缓存时间设置不当

**解决方案:**

```java
// 1. 确保能获取到用户标识
private String getUserKey() {
    String token = StpUtil.getTokenValue();
    if (StrUtil.isBlank(token)) {
        // 未登录用户使用Session ID
        return ServletUtils.getRequest().getSession().getId();
    }
    return token;
}

// 2. 处理特殊参数类型
private String argsArrayToString(Object[] args) {
    StringBuilder sb = new StringBuilder();
    for (Object arg : args) {
        if (arg != null && !isFilterObject(arg)) {
            try {
                sb.append(JsonUtils.toJsonString(arg));
            } catch (Exception e) {
                // 序列化失败时使用hashCode
                sb.append(arg.hashCode());
            }
        }
    }
    return sb.toString();
}

// 3. 根据业务调整间隔时间
@RepeatSubmit(interval = 10000)  // 10秒,避免网络延迟导致的误判
```

### 3. API签名时间戳验证失败

**问题原因:**
- 客户端与服务端时间不同步
- 时区问题
- 有效期设置过短

**解决方案:**

```java
// 1. 增加时间容差
public static boolean verifyTimestamp(String timestamp, int expireSeconds) {
    try {
        long ts = Long.parseLong(timestamp);
        long now = System.currentTimeMillis();
        // 允许前后5分钟的误差
        long tolerance = 5 * 60 * 1000L;
        return Math.abs(now - ts) <= expireSeconds * 1000L + tolerance;
    } catch (NumberFormatException e) {
        return false;
    }
}

// 2. 提供时间同步接口
@SaIgnore
@GetMapping("/api/time")
public R<Long> getServerTime() {
    return R.ok(System.currentTimeMillis());
}

// 3. 客户端计算时间差
public class ApiClient {
    private long timeDiff = 0;

    public void syncTime() {
        long clientTime = System.currentTimeMillis();
        long serverTime = getServerTime();
        timeDiff = serverTime - clientTime;
    }

    public String getTimestamp() {
        return String.valueOf(System.currentTimeMillis() + timeDiff);
    }
}
```

### 4. 加密传输性能问题

**问题原因:**
- RSA加密大数据性能低
- 每次请求都生成密钥

**解决方案:**

```java
// 1. 使用混合加密(AES加密数据,RSA加密密钥)
// 已在框架中实现

// 2. 缓存AES密钥(会话级别)
@Component
public class CryptoKeyCache {
    private final Map<String, String> keyCache = new ConcurrentHashMap<>();

    public String getOrCreateKey(String sessionId) {
        return keyCache.computeIfAbsent(sessionId,
            k -> RandomUtil.randomString(32));
    }
}

// 3. 选择性加密(只加密敏感接口)
// 不要对所有接口使用@ApiEncrypt
@ApiEncrypt  // 只在必要时使用
@PostMapping("/sensitive")
public R<Void> sensitiveOp() { ... }
```

### 5. XSS检测影响富文本

**问题原因:**
- 严格模式误杀正常HTML
- 富文本需要允许部分标签

**解决方案:**

```java
// 1. 富文本使用宽松模式
@Xss(mode = Xss.Mode.LENIENT)
private String richContent;

// 2. 自定义白名单过滤
public String sanitizeHtml(String html) {
    // 使用OWASP Java HTML Sanitizer
    PolicyFactory policy = new HtmlPolicyBuilder()
        .allowElements("p", "div", "span", "br", "b", "i", "u",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "a", "img")
        .allowUrlProtocols("https")
        .allowAttributes("href").onElements("a")
        .allowAttributes("src", "alt").onElements("img")
        .toFactory();
    return policy.sanitize(html);
}

// 3. 前端过滤+后端验证
// 前端: 使用DOMPurify等库过滤
// 后端: 使用白名单验证
```

---

## 安全检查清单

### 接口认证

- [ ] 所有接口默认需要认证
- [ ] 公开接口显式使用@SaIgnore标注
- [ ] 敏感接口使用多重认证(权限+角色)
- [ ] Token有效期设置合理

### 访问控制

- [ ] 实现细粒度的权限控制
- [ ] 重要操作记录审计日志
- [ ] 配置接口限流保护
- [ ] 配置重复提交防护

### 数据保护

- [ ] 敏感数据加密传输
- [ ] 请求参数XSS检测
- [ ] 响应数据脱敏处理
- [ ] 日志中敏感信息脱敏

### 错误处理

- [ ] 统一异常处理机制
- [ ] 错误响应不暴露敏感信息
- [ ] 异常情况记录详细日志
- [ ] 生产环境关闭调试信息

---

API安全是一个持续演进的过程,需要根据业务发展和安全威胁的变化不断调整和优化。建议定期进行安全评估,及时更新安全策略,确保API接口的安全可靠运行。
