# 第三方服务集成最佳实践

## 概述

RuoYi-Plus-UniApp 项目集成了多种第三方服务，为企业应用提供完整的业务支撑能力。通过模块化设计和统一的配置管理，实现了支付、登录、短信、存储、微信生态、AI大模型等核心功能的快速接入。

**核心价值:**

- **开箱即用** - 预集成主流第三方服务，快速启用
- **灵活配置** - 支持多租户、多配置、动态切换
- **统一管理** - 统一的配置中心和监控管理
- **安全可靠** - 证书加密存储、敏感信息脱敏

**集成服务:**

| 分类 | 服务 | 框架/SDK | 状态 |
|------|------|---------|------|
| 支付 | 微信支付、支付宝、余额支付 | WxJava、自研 | ✅ |
| 登录 | 微信、QQ、微博等20+平台 | JustAuth | ✅ |
| 短信 | 阿里云、腾讯云等多厂商 | SMS4J | ✅ |
| 存储 | 阿里云OSS、MinIO等6种 | AWS SDK S3 | ✅ |
| 微信 | 小程序、公众号 | WxJava | ✅ |
| 邮件 | SMTP邮件发送 | Spring Mail | ✅ |
| AI | OpenAI、通义千问等 | LangChain4j | ✅ |
| 消息 | RocketMQ消息队列 | RocketMQ Client | ✅ |
| 任务 | SnailJob定时任务 | SnailJob Client | ✅ |

---

## 支付集成

### 模块架构

项目采用支付核心抽象层 + 多渠道实现的架构，支持微信支付、支付宝、余额支付等多种支付方式。

**模块结构:**

```
ruoyi-common-pay/
├── ruoyi-common-pay-core/          # 支付核心模块
│   ├── PayConfig.java              # 支付配置
│   ├── PayStrategy.java            # 支付策略接口
│   └── PayFactory.java             # 支付工厂
├── ruoyi-common-pay-wechat/        # 微信支付
│   ├── WxPayStrategy.java          # 微信支付策略
│   └── WxPayV3Strategy.java        # 微信支付V3
├── ruoyi-common-pay-alipay/        # 支付宝支付
│   └── AlipayStrategy.java         # 支付宝策略
└── ruoyi-common-pay-balance/       # 余额支付
    └── BalancePayStrategy.java     # 余额支付策略
```

### 支付配置

**启用支付模块:**

```yaml
module:
  pay-enabled: true  # 启用支付模块
```

**支付方式枚举:**

```java
public enum PayType {
    WECHAT("WECHAT", "微信支付"),
    ALIPAY("ALIPAY", "支付宝"),
    BALANCE("BALANCE", "余额支付"),
    POINTS("POINTS", "积分支付");

    private final String code;
    private final String desc;
}
```

### 微信支付集成

**依赖配置:**

```xml
<dependency>
    <groupId>com.github.binarywang</groupId>
    <artifactId>weixin-java-pay</artifactId>
    <version>4.7.6.B</version>
</dependency>
```

**配置示例:**

```java
@Configuration
public class WxPayConfig {

    /**
     * 微信支付配置
     * 支持v2和v3两种版本
     */
    @Bean
    public WxPayService wxPayService() {
        WxPayConfig config = new WxPayConfig();
        config.setAppId("wx1234567890");
        config.setMchId("1234567890");
        config.setMchKey("your-mch-key");

        // V3配置
        config.setApiV3Key("your-api-v3-key");
        config.setPrivateKeyPath("/path/to/apiclient_key.pem");
        config.setPrivateCertPath("/path/to/apiclient_cert.pem");

        WxPayService wxPayService = new WxPayServiceImpl();
        wxPayService.setConfig(config);
        return wxPayService;
    }
}
```

**支付流程:**

```java
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final WxPayService wxPayService;

    /**
     * 创建支付订单
     */
    public Map<String, String> createPayOrder(PayOrderBo bo) {
        // 1. 创建支付请求
        WxPayUnifiedOrderV3Request request = new WxPayUnifiedOrderV3Request();
        request.setAppid(wxPayService.getConfig().getAppId());
        request.setMchid(wxPayService.getConfig().getMchId());
        request.setDescription(bo.getDescription());
        request.setOutTradeNo(bo.getOrderNo());
        request.setNotifyUrl("https://your-domain.com/pay/notify");

        // 金额信息
        WxPayUnifiedOrderV3Request.Amount amount = new WxPayUnifiedOrderV3Request.Amount();
        amount.setTotal(bo.getAmount().multiply(new BigDecimal("100")).intValue());
        request.setAmount(amount);

        // 2. 调用下单接口
        WxPayUnifiedOrderV3Result result = wxPayService.unifiedOrderV3(request);

        // 3. 返回支付参数
        return buildPayParams(result);
    }

    /**
     * 处理支付回调
     */
    public void handlePayNotify(String xmlData) {
        // 1. 验证签名
        WxPayOrderNotifyV3Result result = wxPayService.parseOrderNotifyV3Result(
            xmlData,
            new WxPayOrderNotifyV3Result.DecryptNotifyResult()
        );

        // 2. 验证订单
        String outTradeNo = result.getOutTradeNo();
        PayOrder order = payOrderMapper.selectByOrderNo(outTradeNo);

        if (order == null || order.isPaid()) {
            return;
        }

        // 3. 更新订单状态
        order.setStatus(PayStatus.SUCCESS);
        order.setPayTime(LocalDateTime.now());
        order.setTransactionId(result.getTransactionId());
        payOrderMapper.updateById(order);

        // 4. 业务处理
        processBusinessLogic(order);
    }
}
```

### 支付宝集成

**配置示例:**

```java
@Configuration
public class AlipayConfig {

    @Bean
    public AlipayClient alipayClient() {
        return new DefaultAlipayClient(
            "https://openapi.alipay.com/gateway.do",
            "your-app-id",
            "your-private-key",
            "json",
            "UTF-8",
            "alipay-public-key",
            "RSA2"
        );
    }
}
```

**支付示例:**

```java
@Service
@RequiredArgsConstructor
public class AlipayService {

    private final AlipayClient alipayClient;

    /**
     * APP支付
     */
    public String appPay(PayOrderBo bo) throws AlipayApiException {
        AlipayTradeAppPayRequest request = new AlipayTradeAppPayRequest();

        AlipayTradeAppPayModel model = new AlipayTradeAppPayModel();
        model.setSubject(bo.getSubject());
        model.setOutTradeNo(bo.getOrderNo());
        model.setTotalAmount(bo.getAmount().toString());
        model.setProductCode("QUICK_MSECURITY_PAY");

        request.setBizModel(model);
        request.setNotifyUrl("https://your-domain.com/pay/alipay/notify");

        AlipayTradeAppPayResponse response = alipayClient.sdkExecute(request);
        return response.getBody();
    }

    /**
     * 处理回调
     */
    public void handleNotify(Map<String, String> params) throws AlipayApiException {
        // 1. 验签
        boolean signVerified = AlipaySignature.rsaCheckV1(
            params,
            "alipay-public-key",
            "UTF-8",
            "RSA2"
        );

        if (!signVerified) {
            throw new ServiceException("验签失败");
        }

        // 2. 处理业务
        String outTradeNo = params.get("out_trade_no");
        String tradeNo = params.get("trade_no");
        String tradeStatus = params.get("trade_status");

        if ("TRADE_SUCCESS".equals(tradeStatus)) {
            // 支付成功处理
            updateOrderStatus(outTradeNo, tradeNo);
        }
    }
}
```

### 多租户支付配置

项目支持多租户隔离的支付配置：

```java
@Service
public class PayConfigService {

    /**
     * 根据租户获取支付配置
     */
    public PayConfig getPayConfig(Long tenantId, PayType payType) {
        // 1. 从数据库查询配置
        PayConfig config = payConfigMapper.selectOne(
            Wrappers.<PayConfig>lambdaQuery()
                .eq(PayConfig::getTenantId, tenantId)
                .eq(PayConfig::getPayType, payType)
                .eq(PayConfig::getStatus, "1")
        );

        if (config == null) {
            throw new ServiceException("支付配置不存在");
        }

        // 2. 解密敏感信息
        config.setMchKey(decrypt(config.getMchKey()));
        config.setApiV3Key(decrypt(config.getApiV3Key()));

        return config;
    }
}
```

---

## 第三方登录集成

### JustAuth 框架

项目集成 JustAuth 框架，支持20+第三方平台的OAuth登录。

**依赖配置:**

```xml
<dependency>
    <groupId>me.zhyd.oauth</groupId>
    <artifactId>JustAuth</artifactId>
    <version>1.16.6</version>
</dependency>
```

### 配置示例

```yaml
justauth:
  # 回调地址根域名
  address: ${JUSTAUTH_ADDRESS:http://localhost}

  type:
    # 微信开放平台
    wechat_open:
      client-id: ${WECHAT_OPEN_CLIENT_ID:your-app-id}
      client-secret: ${WECHAT_OPEN_CLIENT_SECRET:your-app-secret}
      redirect-uri: ${justauth.address}/socialCallback?source=wechat_open

    # 微信公众号
    wechat_mp:
      client-id: ${WECHAT_MP_CLIENT_ID:your-app-id}
      client-secret: ${WECHAT_MP_CLIENT_SECRET:your-app-secret}
      redirect-uri: ${justauth.address}/socialCallback?source=wechat_mp

    # QQ登录
    qq:
      client-id: ${QQ_CLIENT_ID:your-app-id}
      client-secret: ${QQ_CLIENT_SECRET:your-app-key}
      redirect-uri: ${justauth.address}/socialCallback?source=qq

    # 微博登录
    weibo:
      client-id: ${WEIBO_CLIENT_ID:your-app-key}
      client-secret: ${WEIBO_CLIENT_SECRET:your-app-secret}
      redirect-uri: ${justauth.address}/socialCallback?source=weibo

    # 钉钉登录
    dingtalk:
      client-id: ${DINGTALK_CLIENT_ID:your-app-id}
      client-secret: ${DINGTALK_CLIENT_SECRET:your-app-secret}
      redirect-uri: ${justauth.address}/socialCallback?source=dingtalk

    # Gitee登录
    gitee:
      client-id: ${GITEE_CLIENT_ID:your-client-id}
      client-secret: ${GITEE_CLIENT_SECRET:your-client-secret}
      redirect-uri: ${justauth.address}/socialCallback?source=gitee

    # 支付宝钱包登录
    alipay_wallet:
      client-id: ${ALIPAY_CLIENT_ID:your-app-id}
      client-secret: ${ALIPAY_CLIENT_SECRET:your-private-key}
      alipay-public-key: ${ALIPAY_PUBLIC_KEY:alipay-public-key}
      redirect-uri: ${justauth.address}/socialCallback?source=alipay_wallet
```

### 登录流程实现

```java
@RestController
@RequestMapping("/social")
@RequiredArgsConstructor
public class SocialLoginController {

    private final AuthRequestFactory authRequestFactory;
    private final SocialUserService socialUserService;

    /**
     * 获取授权URL
     */
    @GetMapping("/login/{source}")
    public R<String> login(@PathVariable String source) {
        AuthRequest authRequest = authRequestFactory.get(source);
        String authorizeUrl = authRequest.authorize(AuthStateUtils.createState());
        return R.ok(authorizeUrl);
    }

    /**
     * 第三方登录回调
     */
    @GetMapping("/callback")
    public R<LoginVo> callback(@RequestParam String source,
                                @RequestParam String code,
                                @RequestParam String state) {
        // 1. 获取AuthRequest
        AuthRequest authRequest = authRequestFactory.get(source);

        // 2. 获取第三方用户信息
        AuthResponse<AuthUser> response = authRequest.login(
            AuthCallback.builder()
                .code(code)
                .state(state)
                .build()
        );

        if (!response.ok()) {
            throw new ServiceException("第三方登录失败: " + response.getMsg());
        }

        AuthUser authUser = response.getData();

        // 3. 绑定或创建本地用户
        SysUser user = socialUserService.bindOrCreateUser(source, authUser);

        // 4. 生成Token
        String token = LoginHelper.loginByDevice(
            new LoginUser(user.getUserId(), user.getUserName()),
            DeviceType.PC
        );

        // 5. 返回登录信息
        LoginVo loginVo = new LoginVo();
        loginVo.setAccessToken(token);
        loginVo.setUserInfo(BeanUtil.toBean(user, UserInfoVo.class));

        return R.ok(loginVo);
    }
}
```

### 用户绑定逻辑

```java
@Service
@RequiredArgsConstructor
public class SocialUserService {

    private final SysUserMapper userMapper;
    private final SocialUserMapper socialUserMapper;

    /**
     * 绑定或创建用户
     */
    public SysUser bindOrCreateUser(String source, AuthUser authUser) {
        // 1. 查找是否已绑定
        SocialUser socialUser = socialUserMapper.selectOne(
            Wrappers.<SocialUser>lambdaQuery()
                .eq(SocialUser::getSource, source)
                .eq(SocialUser::getUuid, authUser.getUuid())
        );

        if (socialUser != null) {
            // 已绑定，返回本地用户
            return userMapper.selectById(socialUser.getUserId());
        }

        // 2. 未绑定，创建新用户
        SysUser newUser = new SysUser();
        newUser.setUserName(generateUsername(source, authUser));
        newUser.setNickName(authUser.getNickname());
        newUser.setAvatar(authUser.getAvatar());
        newUser.setEmail(authUser.getEmail());
        newUser.setStatus("0");
        userMapper.insert(newUser);

        // 3. 创建绑定关系
        SocialUser bind = new SocialUser();
        bind.setUserId(newUser.getUserId());
        bind.setSource(source);
        bind.setUuid(authUser.getUuid());
        bind.setAccessToken(authUser.getToken().getAccessToken());
        bind.setExpireIn(authUser.getToken().getExpireIn());
        bind.setRefreshToken(authUser.getToken().getRefreshToken());
        socialUserMapper.insert(bind);

        return newUser;
    }
}
```

### Redis 状态缓存

```java
@Configuration
public class SocialAutoConfiguration {

    /**
     * 配置OAuth认证状态缓存
     */
    @Bean
    public AuthStateCache authStateCache(RedissonClient redissonClient) {
        return new AuthStateRedisCache(redissonClient);
    }
}

public class AuthStateRedisCache implements AuthStateCache {

    private final RedissonClient redissonClient;
    private static final String CACHE_KEY_PREFIX = "oauth:state:";

    @Override
    public void cache(String key, String value) {
        RBucket<String> bucket = redissonClient.getBucket(CACHE_KEY_PREFIX + key);
        bucket.set(value, 3, TimeUnit.MINUTES);
    }

    @Override
    public String get(String key) {
        RBucket<String> bucket = redissonClient.getBucket(CACHE_KEY_PREFIX + key);
        return bucket.get();
    }

    @Override
    public boolean containsKey(String key) {
        return redissonClient.getBucket(CACHE_KEY_PREFIX + key).isExists();
    }
}
```

---

## 短信服务集成

### SMS4J 框架

项目集成 SMS4J 框架，支持阿里云、腾讯云等多家短信服务商。

**依赖配置:**

```xml
<dependency>
    <groupId>org.dromara.sms4j</groupId>
    <artifactId>sms4j-spring-boot-starter</artifactId>
    <version>3.3.4</version>
</dependency>
```

### 配置示例

```yaml
sms:
  # 配置类型: yaml配置
  config-type: yaml

  # 短信拦截（测试环境建议开启）
  restricted: true
  minute-max: 1      # 每分钟最多1条
  account-max: 30    # 每日最多30条

  # 多厂商配置
  blends:
    # 阿里云短信
    alibaba:
      supplier: alibaba
      access-key-id: ${SMS_ALI_ACCESS_KEY:your-access-key}
      access-key-secret: ${SMS_ALI_ACCESS_SECRET:your-access-secret}
      signature: ${SMS_ALI_SIGNATURE:your-signature}
      sdk-app-id: ${SMS_ALI_SDK_APP_ID:your-app-id}

    # 腾讯云短信
    tencent:
      supplier: tencent
      access-key-id: ${SMS_TENCENT_ACCESS_KEY:your-secret-id}
      access-key-secret: ${SMS_TENCENT_ACCESS_SECRET:your-secret-key}
      signature: ${SMS_TENCENT_SIGNATURE:your-signature}
      sdk-app-id: ${SMS_TENCENT_SDK_APP_ID:your-sdk-app-id}

    # 云片短信
    yunpian:
      supplier: yunpian
      access-key-id: ${SMS_YUNPIAN_API_KEY:your-api-key}
```

### 发送短信

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SmsBlend smsBlend;
    private final SmsLogMapper smsLogMapper;

    /**
     * 发送验证码短信
     */
    public void sendCode(String phone, String code) {
        // 1. 构建短信内容
        Map<String, String> params = new HashMap<>();
        params.put("code", code);

        // 2. 发送短信
        SmsResponse response = smsBlend.sendMessage(
            phone,
            "SMS_123456789",  // 模板ID
            params
        );

        // 3. 记录日志
        SmsLog log = new SmsLog();
        log.setPhone(phone);
        log.setTemplateId("SMS_123456789");
        log.setParams(JSON.toJSONString(params));
        log.setStatus(response.isSuccess() ? "1" : "0");
        log.setMessage(response.getMessage());
        smsLogMapper.insert(log);

        // 4. 检查结果
        if (!response.isSuccess()) {
            log.error("短信发送失败: {}", response.getMessage());
            throw new ServiceException("短信发送失败");
        }
    }

    /**
     * 发送通知短信
     */
    public void sendNotice(String phone, String templateId, Map<String, String> params) {
        SmsResponse response = smsBlend.sendMessage(phone, templateId, params);

        // 记录日志
        saveSmsLog(phone, templateId, params, response);
    }

    /**
     * 批量发送
     */
    public void batchSend(List<String> phones, String templateId, Map<String, String> params) {
        phones.forEach(phone -> {
            try {
                sendNotice(phone, templateId, params);
            } catch (Exception e) {
                log.error("发送短信失败: phone={}, error={}", phone, e.getMessage());
            }
        });
    }
}
```

### 验证码管理

```java
@Service
@RequiredArgsConstructor
public class SmsCodeService {

    private final RedisCache redisCache;
    private final SmsService smsService;

    private static final String SMS_CODE_KEY = "sms:code:";
    private static final int CODE_EXPIRE = 5;  // 5分钟

    /**
     * 发送验证码
     */
    public void sendCode(String phone) {
        // 1. 检查发送频率
        String cacheKey = SMS_CODE_KEY + phone;
        if (redisCache.hasKey(cacheKey)) {
            throw new ServiceException("验证码已发送，请勿重复获取");
        }

        // 2. 生成验证码
        String code = RandomUtil.randomNumbers(6);

        // 3. 发送短信
        smsService.sendCode(phone, code);

        // 4. 缓存验证码
        redisCache.setCacheObject(cacheKey, code, CODE_EXPIRE, TimeUnit.MINUTES);
    }

    /**
     * 验证验证码
     */
    public boolean verifyCode(String phone, String code) {
        String cacheKey = SMS_CODE_KEY + phone;
        String cachedCode = redisCache.getCacheObject(cacheKey);

        if (cachedCode == null) {
            return false;
        }

        boolean verified = cachedCode.equals(code);

        // 验证成功后删除
        if (verified) {
            redisCache.deleteObject(cacheKey);
        }

        return verified;
    }
}
```

---

## 对象存储集成

### 多存储支持

项目基于 AWS SDK S3 实现，支持6种对象存储服务。

**存储类型:**

```java
public enum OssType {
    LOCAL("本地存储"),
    ALIYUN("阿里云OSS"),
    QCLOUD("腾讯云COS"),
    QINIU("七牛云"),
    MINIO("MinIO"),
    OBS("华为云OBS");
}
```

**依赖配置:**

```xml
<!-- AWS S3 SDK -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
</dependency>

<!-- Netty HTTP客户端 -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>netty-nio-client</artifactId>
</dependency>

<!-- S3传输管理器 -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3-transfer-manager</artifactId>
</dependency>
```

### OSS 配置

```java
@Data
public class OssClientConfig {

    /** 租户ID */
    private Long tenantId;

    /** 访问站点 */
    private String endpoint;

    /** 自定义域名 */
    private String domain;

    /** 前缀 */
    private String prefix;

    /** ACCESS_KEY */
    private String accessKey;

    /** SECRET_KEY */
    private String secretKey;

    /** 存储空间名 */
    private String bucketName;

    /** 存储区域 */
    private String region;

    /** 是否HTTPS */
    private Boolean isHttps;

    /** 桶权限类型(0-private 1-public 2-custom) */
    private String accessPolicy;
}
```

### 文件上传

```java
@Service
@RequiredArgsConstructor
public class OssService {

    private final OssFactory ossFactory;
    private final SysOssMapper ossMapper;

    /**
     * 上传文件
     */
    public SysOss upload(MultipartFile file) {
        // 1. 获取OSS客户端
        OssClient ossClient = ossFactory.getDefault();

        // 2. 生成文件名
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = IdUtil.simpleUUID() + suffix;

        // 3. 上传文件
        UploadResult result = ossClient.upload(
            file.getInputStream(),
            fileName,
            file.getContentType()
        );

        // 4. 保存记录
        SysOss oss = new SysOss();
        oss.setFileName(originalFilename);
        oss.setOriginalName(originalFilename);
        oss.setFileSuffix(suffix);
        oss.setUrl(result.getUrl());
        oss.setService(ossClient.getConfigKey());
        oss.setFileSize(file.getSize());
        ossMapper.insert(oss);

        return oss;
    }

    /**
     * 下载文件
     */
    public void download(Long ossId, HttpServletResponse response) {
        SysOss oss = ossMapper.selectById(ossId);

        if (oss == null) {
            throw new ServiceException("文件不存在");
        }

        OssClient ossClient = ossFactory.get(oss.getService());

        try {
            InputStream inputStream = ossClient.getObjectContent(oss.getUrl());

            response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
            response.setHeader("Content-Disposition",
                "attachment; filename=" + URLEncoder.encode(oss.getOriginalName(), "UTF-8"));

            IoUtil.copy(inputStream, response.getOutputStream());
        } catch (Exception e) {
            throw new ServiceException("文件下载失败");
        }
    }

    /**
     * 删除文件
     */
    public void delete(Long ossId) {
        SysOss oss = ossMapper.selectById(ossId);

        if (oss == null) {
            return;
        }

        OssClient ossClient = ossFactory.get(oss.getService());
        ossClient.delete(oss.getUrl());

        ossMapper.deleteById(ossId);
    }
}
```

### MinIO 配置示例

```java
@Configuration
public class MinioConfig {

    @Bean
    public OssClient minioClient() {
        OssClientConfig config = new OssClientConfig();
        config.setEndpoint("http://127.0.0.1:9000");
        config.setAccessKey("ruoyi");
        config.setSecretKey("ruoyi123");
        config.setBucketName("ruoyi");
        config.setRegion("us-east-1");
        config.setIsHttps(false);

        return new S3OssClient(config);
    }
}
```

---

## 微信生态集成

### 微信小程序

**依赖配置:**

```xml
<dependency>
    <groupId>com.github.binarywang</groupId>
    <artifactId>weixin-java-miniapp</artifactId>
    <version>4.7.6.B</version>
</dependency>
```

**模块启用:**

```yaml
module:
  miniapp-enabled: true  # 启用小程序模块
```

**登录流程:**

```java
@Service
@RequiredArgsConstructor
public class MiniappAuthService {

    private final WxMaService wxMaService;

    /**
     * 小程序登录
     */
    public LoginVo login(String code) {
        try {
            // 1. 调用wx.login获取的code
            WxMaJscode2SessionResult session = wxMaService.getUserService()
                .getSessionInfo(code);

            String openid = session.getOpenid();
            String sessionKey = session.getSessionKey();

            // 2. 查找或创建用户
            SysUser user = findOrCreateUserByOpenid(openid);

            // 3. 缓存sessionKey
            redisCache.setCacheObject("miniapp:session:" + openid, sessionKey);

            // 4. 生成Token
            String token = LoginHelper.loginByDevice(
                new LoginUser(user.getUserId(), user.getUserName()),
                DeviceType.APP
            );

            LoginVo loginVo = new LoginVo();
            loginVo.setAccessToken(token);
            loginVo.setOpenid(openid);

            return loginVo;
        } catch (WxErrorException e) {
            throw new ServiceException("小程序登录失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    public WxMaUserInfo getUserInfo(String encryptedData, String iv, String sessionKey) {
        try {
            return wxMaService.getUserService()
                .getUserInfo(sessionKey, encryptedData, iv);
        } catch (WxErrorException e) {
            throw new ServiceException("获取用户信息失败");
        }
    }
}
```

**生成小程序码:**

```java
@Service
@RequiredArgsConstructor
public class WxMaQrcodeService {

    private final WxMaService wxMaService;

    /**
     * 生成小程序码
     */
    public byte[] createQrcode(String scene, String page, Integer width) {
        try {
            WxMaCodeLineColor lineColor = new WxMaCodeLineColor("0", "0", "0");

            byte[] qrcodeBytes = wxMaService.getQrcodeService()
                .createWxaCodeUnlimitBytes(scene, page, width, true, lineColor, false);

            return qrcodeBytes;
        } catch (WxErrorException e) {
            throw new ServiceException("生成小程序码失败");
        }
    }
}
```

**订阅消息:**

```java
@Service
@RequiredArgsConstructor
public class WxMaSubscribeService {

    private final WxMaService wxMaService;

    /**
     * 发送订阅消息
     */
    public void sendSubscribeMsg(String openid, String templateId, Map<String, String> data) {
        try {
            WxMaSubscribeMessage message = new WxMaSubscribeMessage();
            message.setToUser(openid);
            message.setTemplateId(templateId);
            message.setPage("pages/index/index");

            List<WxMaSubscribeMessage.MsgData> msgDataList = data.entrySet().stream()
                .map(entry -> new WxMaSubscribeMessage.MsgData(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

            message.setData(msgDataList);

            wxMaService.getMsgService().sendSubscribeMsg(message);
        } catch (WxErrorException e) {
            log.error("发送订阅消息失败: {}", e.getMessage());
        }
    }
}
```

### 微信公众号

**依赖配置:**

```xml
<dependency>
    <groupId>com.github.binarywang</groupId>
    <artifactId>weixin-java-mp</artifactId>
    <version>4.7.6.B</version>
</dependency>
```

**模块启用:**

```yaml
module:
  mp-enabled: true  # 启用公众号模块
```

**JS-SDK 签名:**

```java
@Service
@RequiredArgsConstructor
public class WxMpJsApiService {

    private final WxMpService wxMpService;

    /**
     * 创建JS-SDK签名
     */
    public WxJsapiSignature createJsapiSignature(String url) {
        try {
            return wxMpService.createJsapiSignature(url);
        } catch (WxErrorException e) {
            throw new ServiceException("创建签名失败");
        }
    }
}
```

**模板消息:**

```java
@Service
@RequiredArgsConstructor
public class WxMpTemplateService {

    private final WxMpService wxMpService;

    /**
     * 发送模板消息
     */
    public void sendTemplateMsg(String openid, String templateId, Map<String, String> data) {
        try {
            WxMpTemplateMessage message = new WxMpTemplateMessage();
            message.setToUser(openid);
            message.setTemplateId(templateId);
            message.setUrl("https://your-domain.com/detail");

            data.forEach((key, value) -> {
                message.addData(new WxMpTemplateData(key, value));
            });

            wxMpService.getTemplateMsgService().sendTemplateMsg(message);
        } catch (WxErrorException e) {
            log.error("发送模板消息失败: {}", e.getMessage());
        }
    }
}
```

---

## AI大模型集成

### LangChain4j 框架

项目集成 LangChain4j 框架，支持 OpenAI、通义千问、Claude、Ollama 等多种大模型。

**依赖配置:**

```xml
<!-- LangChain4j核心 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>0.35.0</version>
</dependency>

<!-- OpenAI -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai</artifactId>
</dependency>

<!-- 通义千问 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-dashscope</artifactId>
</dependency>

<!-- Claude -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-anthropic</artifactId>
</dependency>

<!-- Ollama -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-ollama</artifactId>
</dependency>
```

### 配置示例

```yaml
langchain4j:
  enabled: true
  default-provider: deepseek
  default-model: deepseek-chat
  timeout: 60s
  max-retries: 3

  # DeepSeek配置
  deepseek:
    api-key: ${DEEPSEEK_API_KEY:your-api-key}
    base-url: https://api.deepseek.com
    model-name: deepseek-chat
    temperature: 0.7
    top-p: 1.0
    max-tokens: 2048
    enabled: true

  # 通义千问配置
  qianwen:
    api-key: ${QIANWEN_API_KEY:your-api-key}
    model-name: qwen-max
    enabled: false

  # Claude配置
  claude:
    api-key: ${CLAUDE_API_KEY:your-api-key}
    model-name: claude-3-opus-20240229
    enabled: false

  # OpenAI配置
  openai:
    api-key: ${OPENAI_API_KEY:your-api-key}
    model-name: gpt-4
    enabled: false

  # Ollama配置
  ollama:
    base-url: http://localhost:11434
    model-name: llama2
    enabled: false

  # 对话配置
  chat:
    stream-enabled: true
    history-size: 10
    session-timeout: 30
    memory-enabled: true
    memory-store-type: redis

  # 嵌入配置
  embedding:
    model-name: text-embedding-3-small
    dimension: 1536
    batch-size: 100

  # RAG配置
  rag:
    enabled: false
    max-results: 5
    min-score: 0.7
    chunk-size: 500
    chunk-overlap: 50
    vector-store-type: memory
```

### 对话模式

```java
public enum ChatMode {
    /** 单轮对话 */
    SINGLE,

    /** 多轮连续对话 */
    CONTINUOUS,

    /** 检索增强生成(RAG) */
    RAG,

    /** 函数调用 */
    FUNCTION
}
```

### 聊天服务

```java
@Service
@RequiredArgsConstructor
public class AiChatService {

    private final ChatService chatService;
    private final ChatMemoryManager memoryManager;

    /**
     * 单轮对话
     */
    public String chat(String message) {
        return chatService.chat(
            message,
            ChatMode.SINGLE,
            null  // 无会话ID
        );
    }

    /**
     * 多轮对话
     */
    public String chatWithHistory(String sessionId, String message) {
        return chatService.chat(
            message,
            ChatMode.CONTINUOUS,
            sessionId
        );
    }

    /**
     * 流式对话
     */
    public void streamChat(String message, Consumer<String> callback) {
        chatService.streamChat(
            message,
            ChatMode.SINGLE,
            null,
            callback
        );
    }

    /**
     * RAG对话
     */
    public String ragChat(String message, List<Document> documents) {
        return chatService.chatWithDocuments(
            message,
            documents,
            ChatMode.RAG,
            null
        );
    }

    /**
     * 清除会话记忆
     */
    public void clearHistory(String sessionId) {
        memoryManager.clear(sessionId);
    }
}
```

### 向量嵌入

```java
@Service
@RequiredArgsConstructor
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;

    /**
     * 文本向量化
     */
    public List<Float> embed(String text) {
        Response<Embedding> response = embeddingModel.embed(text);
        return response.content().vectorAsList();
    }

    /**
     * 批量向量化
     */
    public List<List<Float>> embedBatch(List<String> texts) {
        Response<List<Embedding>> response = embeddingModel.embedAll(texts);
        return response.content().stream()
            .map(Embedding::vectorAsList)
            .collect(Collectors.toList());
    }
}
```

### RAG 服务

```java
@Service
@RequiredArgsConstructor
public class RagService {

    private final EmbeddingService embeddingService;
    private final VectorStore vectorStore;
    private final ChatService chatService;

    /**
     * 添加文档到向量库
     */
    public void addDocument(String content) {
        // 1. 文档分块
        List<String> chunks = splitDocument(content, 500, 50);

        // 2. 向量化
        List<List<Float>> embeddings = embeddingService.embedBatch(chunks);

        // 3. 存储到向量库
        for (int i = 0; i < chunks.size(); i++) {
            vectorStore.add(
                IdUtil.simpleUUID(),
                embeddings.get(i),
                chunks.get(i)
            );
        }
    }

    /**
     * 检索相关文档
     */
    public List<Document> retrieve(String query, int topK) {
        // 1. 查询向量化
        List<Float> queryEmbedding = embeddingService.embed(query);

        // 2. 向量检索
        List<VectorSearchResult> results = vectorStore.search(
            queryEmbedding,
            topK,
            0.7  // 最小相似度
        );

        // 3. 转换为文档
        return results.stream()
            .map(result -> new Document(result.getContent()))
            .collect(Collectors.toList());
    }

    /**
     * RAG问答
     */
    public String answer(String question) {
        // 1. 检索相关文档
        List<Document> documents = retrieve(question, 5);

        // 2. 生成回答
        return chatService.chatWithDocuments(
            question,
            documents,
            ChatMode.RAG,
            null
        );
    }
}
```

---

## 邮件服务集成

### 配置示例

```yaml
mail:
  enabled: ${MAIL_ENABLED:false}
  host: ${MAIL_HOST:smtp.163.com}
  port: ${MAIL_PORT:465}
  from: ${MAIL_FROM:your-email@163.com}
  user: ${MAIL_USERNAME:your-email@163.com}
  pass: ${MAIL_PASSWORD:your-password}
  starttls-enable: true
  ssl-enable: true
  auth: true

  # 编码
  default-encoding: UTF-8

  # 超时设置
  timeout: 5000
```

### 邮件发送

```java
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    /**
     * 发送简单文本邮件
     */
    public void sendSimpleMail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
    }

    /**
     * 发送HTML邮件
     */
    public void sendHtmlMail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new ServiceException("邮件发送失败");
        }
    }

    /**
     * 发送带附件的邮件
     */
    public void sendAttachmentMail(String to, String subject, String content, File attachment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            helper.addAttachment(attachment.getName(), attachment);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new ServiceException("邮件发送失败");
        }
    }
}
```

---

## 消息队列集成

### RocketMQ 配置

```yaml
rocketmq:
  enabled: ${ROCKETMQ_ENABLED:false}
  name-server: ${ROCKETMQ_NAME_SERVER:127.0.0.1:9876}
  producer:
    group: ${app.id}-producer
    send-message-timeout: 3000
    retry-times-when-send-failed: 2
  consumer:
    group: ${app.id}-consumer
```

### 消息发送

```java
@Service
@RequiredArgsConstructor
public class MessageProducer {

    private final RocketMQTemplate rocketMQTemplate;

    /**
     * 同步发送
     */
    public void sendSync(String topic, String message) {
        SendResult result = rocketMQTemplate.syncSend(topic, message);
        log.info("消息发送成功: {}", result.getMsgId());
    }

    /**
     * 异步发送
     */
    public void sendAsync(String topic, String message) {
        rocketMQTemplate.asyncSend(topic, message, new SendCallback() {
            @Override
            public void onSuccess(SendResult result) {
                log.info("消息发送成功: {}", result.getMsgId());
            }

            @Override
            public void onException(Throwable e) {
                log.error("消息发送失败", e);
            }
        });
    }

    /**
     * 延时发送
     */
    public void sendDelay(String topic, String message, int delayLevel) {
        rocketMQTemplate.syncSend(topic,
            MessageBuilder.withPayload(message).build(),
            3000,
            delayLevel
        );
    }
}
```

### 消息消费

```java
@Service
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    selectorExpression = "*"
)
public class OrderMessageConsumer implements RocketMQListener<String> {

    @Override
    public void onMessage(String message) {
        log.info("收到订单消息: {}", message);

        try {
            // 处理业务逻辑
            processOrder(message);
        } catch (Exception e) {
            log.error("消息处理失败", e);
            throw e;  // 抛出异常触发重试
        }
    }
}
```

---

## 定时任务集成

### SnailJob 配置

```yaml
snail-job:
  enabled: ${SNAIL_JOB_ENABLED:false}
  group: ${app.id}
  port: ${SNAIL_PORT:28080}
  server:
    host: ${SNAIL_JOB_HOST:127.0.0.1}
    port: ${SNAIL_JOB_PORT:17888}
  namespace: default
```

### 定时任务定义

```java
@Component
public class OrderTask {

    /**
     * 订单超时取消
     */
    @SnailJob(
        name = "订单超时取消",
        cron = "0 */10 * * * ?",  // 每10分钟执行一次
        description = "取消超时未支付的订单"
    )
    public void cancelTimeoutOrders() {
        log.info("开始执行订单超时取消任务");

        // 查询超时订单
        List<Order> timeoutOrders = orderMapper.selectList(
            Wrappers.<Order>lambdaQuery()
                .eq(Order::getStatus, OrderStatus.PENDING)
                .lt(Order::getCreateTime, LocalDateTime.now().minusMinutes(30))
        );

        // 批量取消
        timeoutOrders.forEach(order -> {
            order.setStatus(OrderStatus.CANCELLED);
            orderMapper.updateById(order);
        });

        log.info("订单超时取消任务完成，取消{}个订单", timeoutOrders.size());
    }
}
```

---

## 最佳实践

### 1. 配置管理

```java
/**
 * 第三方服务配置统一管理
 */
@Service
public class ThirdPartyConfigService {

    /**
     * 从数据库动态加载配置
     */
    public <T> T getConfig(Long tenantId, String configType, Class<T> clazz) {
        ThirdPartyConfig config = configMapper.selectOne(
            Wrappers.<ThirdPartyConfig>lambdaQuery()
                .eq(ThirdPartyConfig::getTenantId, tenantId)
                .eq(ThirdPartyConfig::getConfigType, configType)
                .eq(ThirdPartyConfig::getStatus, "1")
        );

        if (config == null) {
            throw new ServiceException("配置不存在");
        }

        // 解密敏感信息
        String decryptedConfig = decrypt(config.getConfigValue());

        return JSON.parseObject(decryptedConfig, clazz);
    }
}
```

### 2. 异常处理

```java
/**
 * 第三方服务调用异常处理
 */
@Aspect
@Component
public class ThirdPartyExceptionHandler {

    @Around("@annotation(thirdPartyCall)")
    public Object handle(ProceedingJoinPoint pjp, ThirdPartyCall thirdPartyCall) {
        try {
            return pjp.proceed();
        } catch (Exception e) {
            log.error("第三方服务调用失败: {}", e.getMessage());

            // 记录调用日志
            saveCallLog(pjp, e);

            // 根据配置决定是否抛出异常
            if (thirdPartyCall.throwException()) {
                throw new ServiceException("第三方服务调用失败");
            }

            return null;
        }
    }
}
```

### 3. 限流控制

```java
/**
 * 第三方服务调用限流
 */
@Service
public class ThirdPartyRateLimiter {

    private final RateLimiter payLimiter = RateLimiter.create(10.0);  // 每秒10次
    private final RateLimiter smsLimiter = RateLimiter.create(1.0);   // 每秒1次

    public void checkPayLimit() {
        if (!payLimiter.tryAcquire(1, TimeUnit.SECONDS)) {
            throw new ServiceException("支付请求过于频繁");
        }
    }

    public void checkSmsLimit() {
        if (!smsLimiter.tryAcquire(1, TimeUnit.SECONDS)) {
            throw new ServiceException("短信发送过于频繁");
        }
    }
}
```

### 4. 重试机制

```java
/**
 * 第三方服务调用重试
 */
@Service
public class ThirdPartyRetryService {

    @Retryable(
        value = {ServiceException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String callWithRetry(Callable<String> callable) {
        try {
            return callable.call();
        } catch (Exception e) {
            throw new ServiceException("调用失败");
        }
    }
}
```

### 5. 监控告警

```java
/**
 * 第三方服务监控
 */
@Component
public class ThirdPartyMonitor {

    @Scheduled(fixedRate = 60000)
    public void checkServiceHealth() {
        // 检查支付服务
        checkPaymentService();

        // 检查短信服务
        checkSmsService();

        // 检查OSS服务
        checkOssService();
    }

    private void checkPaymentService() {
        try {
            // 调用测试接口
            paymentService.testConnection();
        } catch (Exception e) {
            // 发送告警
            sendAlert("支付服务异常: " + e.getMessage());
        }
    }
}
```

---

## 常见问题

### 1. 支付回调验签失败

**问题原因:**
- 证书配置错误
- 回调URL不正确
- 签名算法不匹配

**解决方案:**

```java
// 检查证书配置
WxPayConfig config = wxPayService.getConfig();
log.info("证书路径: {}", config.getPrivateCertPath());
log.info("证书序列号: {}", config.getCertificateSerialNumber());

// 验证签名
boolean verified = wxPayService.checkSignature(
    headers.get("Wechatpay-Signature"),
    headers.get("Wechatpay-Timestamp"),
    headers.get("Wechatpay-Nonce"),
    body
);
```

### 2. 第三方登录回调失败

**问题原因:**
- 回调地址配置错误
- state参数校验失败
- Redis缓存过期

**解决方案:**

```yaml
# 确保回调地址正确
justauth:
  address: https://your-domain.com
  type:
    wechat_open:
      redirect-uri: ${justauth.address}/socialCallback?source=wechat_open
```

### 3. 短信发送失败

**问题原因:**
- 签名不正确
- 模板ID错误
- 达到发送上限

**解决方案:**

```yaml
# 检查短信配置
sms:
  restricted: true
  minute-max: 1
  account-max: 30
  blends:
    alibaba:
      signature: 正确的签名  # 必须在短信平台申请
```

### 4. OSS上传失败

**问题原因:**
- 访问密钥错误
- 存储桶权限不足
- 网络连接超时

**解决方案:**

```java
// 检查配置
OssClientConfig config = ossFactory.getConfig("default");
log.info("Endpoint: {}", config.getEndpoint());
log.info("Bucket: {}", config.getBucketName());

// 测试连接
try {
    ossClient.listBuckets();
} catch (Exception e) {
    log.error("OSS连接失败", e);
}
```

### 5. AI大模型调用超时

**问题原因:**
- 网络延迟
- 模型响应慢
- 超时设置过短

**解决方案:**

```yaml
langchain4j:
  timeout: 120s  # 增加超时时间
  max-retries: 3  # 启用重试

  deepseek:
    max-tokens: 1024  # 减少生成长度
    temperature: 0.7
```

---

## 总结

第三方服务集成是企业应用的重要组成部分。通过本文档介绍的最佳实践:

1. **支付集成** - 微信支付、支付宝，支持v2/v3版本
2. **登录集成** - JustAuth支持20+平台OAuth登录
3. **短信集成** - SMS4J支持多厂商切换
4. **存储集成** - 基于S3协议支持6种对象存储
5. **微信生态** - 小程序、公众号完整集成
6. **AI大模型** - LangChain4j支持主流大模型
7. **消息队列** - RocketMQ异步消息处理
8. **定时任务** - SnailJob分布式任务调度

建议在实际使用中:
- 统一配置管理，支持多租户隔离
- 完善异常处理和重试机制
- 添加监控告警，及时发现问题
- 做好限流控制，避免超出配额
- 敏感信息加密存储，确保安全
