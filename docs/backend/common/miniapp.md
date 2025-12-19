# 微信小程序模块文档

## 概述

`ruoyi-common-miniapp` 是基于WxJava的微信小程序服务模块，为RuoYi-Plus-UniApp提供完整的微信小程序后端服务能力。该模块基于 `weixin-java-miniapp` 开发，支持多小程序实例配置、动态配置管理、消息处理、小程序码生成等核心功能。

**核心特性：**

- **多小程序支持** - 支持同时管理多个微信小程序配置
- **动态配置管理** - 运行时动态添加、移除小程序配置
- **消息路由处理** - 内置消息路由器，支持多种消息类型处理
- **小程序码生成** - 支持多种小程序码生成方式
- **订阅消息推送** - 提供便捷的订阅消息发送工具
- **统一消息通道** - 集成统一消息接口，支持多渠道消息推送

## 模块架构

```
┌─────────────────────────────────────────────────────────────────┐
│                   微信小程序模块架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              MiniappAutoConfiguration                      │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐ │ │
│  │  │   WxMaService   │  │   MiniappConfigInitializer      │ │ │
│  │  │  (核心服务)      │  │  (配置初始化器)                  │ │ │
│  │  └─────────────────┘  └─────────────────────────────────┘ │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐ │ │
│  │  │WxMaMessageRouter│  │   MiniappMessageChannel         │ │ │
│  │  │  (消息路由)      │  │  (统一消息通道)                  │ │ │
│  │  └─────────────────┘  └─────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    工具类层                                │ │
│  │  ┌─────────────────────┐  ┌─────────────────────────────┐ │ │
│  │  │   WxMaQrcodeUtils   │  │   WxMaSubscribeUtils        │ │ │
│  │  │  (小程序码生成)      │  │  (订阅消息发送)              │ │ │
│  │  └─────────────────────┘  └─────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 模块结构

```
ruoyi-common-miniapp/
├── src/main/java/plus/ruoyi/common/miniapp/
│   ├── config/
│   │   └── MiniappAutoConfiguration.java    # 小程序服务自动配置类
│   ├── initializer/
│   │   └── MiniappConfigInitializer.java    # 配置初始化器
│   ├── channel/
│   │   └── MiniappMessageChannel.java       # 统一消息通道实现
│   └── utils/
│       ├── WxMaQrcodeUtils.java             # 小程序码生成工具
│       └── WxMaSubscribeUtils.java          # 订阅消息发送工具
└── src/main/resources/META-INF/spring/
    └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 依赖配置

### Maven依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-miniapp</artifactId>
</dependency>
```

### 核心依赖

```xml
<dependencies>
    <!-- 核心模块 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>
    <!-- 微信小程序SDK -->
    <dependency>
        <groupId>com.github.binarywang</groupId>
        <artifactId>weixin-java-miniapp</artifactId>
    </dependency>
</dependencies>
```

## 自动配置机制

### MiniappAutoConfiguration

模块提供自动配置类 `MiniappAutoConfiguration`，基于Spring Boot自动配置机制实现：

```java
@Slf4j
@AutoConfiguration
@ConditionalOnProperty(prefix = "module", name = "miniapp-enabled", havingValue = "true", matchIfMissing = true)
public class MiniappAutoConfiguration {

    /**
     * 注册微信小程序核心服务
     * 设置最大重试次数为3次，提高接口调用的容错性
     */
    @Bean
    public WxMaService wxMaService() {
        WxMaServiceImpl wxMaService = new WxMaServiceImpl();
        wxMaService.setMaxRetryTimes(3);
        return wxMaService;
    }

    /**
     * 注册消息路由器
     * 配置不同类型消息的处理器
     */
    @Bean
    public WxMaMessageRouter wxMaMessageRouter(WxMaService wxMaService) {
        final WxMaMessageRouter router = new WxMaMessageRouter(wxMaService);
        router
            .rule().handler(logHandler).next()
            .rule().async(false).content("订阅消息").handler(subscribeMsgHandler).end()
            .rule().async(false).content("文本").handler(textHandler).end()
            .rule().async(false).content("图片").handler(picHandler).end()
            .rule().async(false).content("二维码").handler(qrcodeHandler).end();
        return router;
    }

    /**
     * 注册配置初始化器
     */
    @Bean
    public MiniappConfigInitializer wxMaApplicationRunner(
            PlatformService platformService, WxMaService wxMaService) {
        return new MiniappConfigInitializer(platformService, wxMaService);
    }

    /**
     * 注册小程序订阅消息通道
     */
    @Bean
    public MiniappMessageChannel miniappMessageChannel() {
        return new MiniappMessageChannel();
    }
}
```

**配置装配条件：**

| 注解 | 说明 |
|------|------|
| `@AutoConfiguration` | 标记为Spring Boot自动配置类 |
| `@ConditionalOnProperty(prefix = "module", name = "miniapp-enabled", havingValue = "true", matchIfMissing = true)` | 默认启用，可通过配置关闭 |

**注册组件：**

| 组件 | 说明 |
|------|------|
| `WxMaService` | 微信小程序核心服务，设置最大重试3次 |
| `WxMaMessageRouter` | 消息路由器，配置内置消息处理器 |
| `MiniappConfigInitializer` | 配置初始化器，启动时加载小程序配置 |
| `MiniappMessageChannel` | 统一消息通道，支持MessagePushService发送 |

### 内置消息处理器

| 处理器 | 触发条件 | 功能描述 |
|--------|----------|----------|
| `logHandler` | 所有消息 | 记录消息日志并回复确认信息 |
| `subscribeMsgHandler` | 内容为"订阅消息" | 发送订阅消息示例 |
| `textHandler` | 内容为"文本" | 处理文本消息并回复 |
| `picHandler` | 内容为"图片" | 处理图片消息 |
| `qrcodeHandler` | 内容为"二维码" | 生成并发送二维码 |

## 配置初始化

### MiniappConfigInitializer

配置初始化器实现 `ApplicationRunner` 接口，在应用启动时自动加载小程序配置：

```java
@Slf4j
public class MiniappConfigInitializer implements ApplicationRunner {

    private final PlatformService platformService;
    private final WxMaService wxMaService;

    @Override
    public void run(ApplicationArguments args) {
        init();
    }

    /**
     * 初始化小程序配置
     * 从数据库加载所有微信小程序类型的平台配置
     */
    public void init() {
        List<PlatformDTO> platformDTOList = platformService.listPlatformsByType(
            DictPlatformType.MP_WEIXIN.getValue(), null);

        if (CollUtil.isEmpty(platformDTOList)) {
            log.info("未找到微信小程序配置，跳过初始化");
            return;
        }

        wxMaService.setMultiConfigs(
            platformDTOList.stream()
                .map(this::buildWxMaConfig)
                .collect(Collectors.toMap(
                    WxMaDefaultConfigImpl::getAppid,
                    config -> config,
                    (first, second) -> {
                        log.warn("发现重复的appid配置: {}, 保留第一个配置", first.getAppid());
                        return first;
                    })));

        log.info("初始化微信小程序配置成功:{}", StreamUtils.join(platformDTOList,
            platformDTO -> StringUtils.format("{}({})", platformDTO.getName(), platformDTO.getAppid()), ", "));
    }

    /**
     * 添加单个配置
     */
    public void addConfig(PlatformDTO platform) {
        if (platform == null || StringUtils.isBlank(platform.getAppid())) {
            log.warn("平台配置为空或appid为空，跳过添加");
            return;
        }

        if (!DictPlatformType.MP_WEIXIN.getValue().equals(platform.getType())) {
            log.debug("平台类型[{}]不是微信小程序，跳过添加", platform.getType());
            return;
        }

        try {
            WxMaDefaultConfigImpl config = buildWxMaConfig(platform);
            wxMaService.addConfig(platform.getAppid(), config);
            log.info("成功添加微信小程序配置: appid={}, name={}", platform.getAppid(), platform.getName());
        } catch (Exception e) {
            log.error("添加微信小程序配置失败: appid={}", platform.getAppid(), e);
        }
    }

    /**
     * 移除单个配置
     */
    public void removeConfig(String appid) {
        if (StringUtils.isBlank(appid)) {
            return;
        }
        try {
            wxMaService.removeConfig(appid);
            log.info("成功移除微信小程序配置: appid={}", appid);
        } catch (Exception e) {
            log.debug("移除微信小程序配置失败或配置不存在: appid={}", appid);
        }
    }

    /**
     * 构建微信小程序配置
     */
    private WxMaDefaultConfigImpl buildWxMaConfig(PlatformDTO platform) {
        WxMaDefaultConfigImpl config = new WxMaDefaultConfigImpl();
        config.setAppid(platform.getAppid());
        config.setSecret(platform.getSecret());
        config.setToken(platform.getToken());
        config.setAesKey(platform.getAeskey());
        return config;
    }
}
```

**核心方法：**

| 方法 | 说明 |
|------|------|
| `init()` | 初始化所有小程序配置 |
| `addConfig(PlatformDTO)` | 动态添加单个配置 |
| `removeConfig(String)` | 移除指定appid的配置 |

## 小程序码生成

### WxMaQrcodeUtils

提供小程序码生成的静态工具类，支持多种类型的小程序码：

```java
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class WxMaQrcodeUtils {

    /**
     * 生成小程序码（不限次数）- 推荐使用
     * 适用于需要的码数量极多的业务场景
     * 最多生成10万个（永久有效）
     *
     * @param appid 小程序appid
     * @param scene 场景值（最大32个可见字符）
     * @param page  页面路径
     * @param width 二维码宽度（默认430，最小280，最大1280）
     * @return 二维码字节数组
     */
    public static byte[] createUnlimitQrcode(String appid, String scene, String page, Integer width);

    /**
     * 生成普通小程序码（有限次数）
     * @param appid 小程序appid
     * @param path  页面路径（必填，如：pages/index/index?id=123）
     * @param width 二维码宽度
     * @return 二维码字节数组
     */
    public static byte[] createQrcode(String appid, String path, Integer width);

    /**
     * 生成小程序二维码（正方形）
     * @param appid 小程序appid
     * @param path  页面路径
     * @param width 二维码宽度
     * @return 二维码字节数组
     */
    public static byte[] createMiniQrcode(String appid, String path, Integer width);
}
```

### 小程序码类型对比

| 方法 | 码类型 | 次数限制 | 参数传递 | 适用场景 |
|------|--------|----------|----------|----------|
| `createUnlimitQrcode` | 圆形小程序码 | 不限次数 | scene参数（32字符） | 推广、分享 |
| `createQrcode` | 圆形小程序码 | 10万次 | path中的query参数 | 特定页面 |
| `createMiniQrcode` | 正方形二维码 | 10万次 | path中的query参数 | 打印场景 |

### 使用示例

```java
@Service
public class QrcodeService {

    /**
     * 生成分享海报二维码
     */
    public byte[] generateShareQrcode(String appid, Long userId) {
        // 使用不限次数的小程序码
        String scene = "u=" + userId;  // 场景值，最多32字符
        String page = "pages/share/index";  // 跳转页面

        return WxMaQrcodeUtils.createUnlimitQrcode(appid, scene, page, 430);
    }

    /**
     * 生成商品详情二维码
     */
    public byte[] generateProductQrcode(String appid, Long productId) {
        // 参数直接放在path中
        String path = "pages/product/detail?id=" + productId;

        return WxMaQrcodeUtils.createQrcode(appid, path);
    }

    /**
     * 生成门店二维码（打印用）
     */
    public byte[] generateStoreQrcode(String appid, Long storeId) {
        String path = "pages/store/index?storeId=" + storeId;

        // 生成正方形二维码，适合打印
        return WxMaQrcodeUtils.createMiniQrcode(appid, path, 1280);
    }
}
```

### 环境版本自动切换

工具类会根据Spring运行环境自动切换小程序版本：

| 环境 | envVersion |
|------|------------|
| dev | develop（开发版） |
| 其他 | release（正式版） |

## 订阅消息发送

### WxMaSubscribeUtils

提供订阅消息发送的静态工具类：

```java
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class WxMaSubscribeUtils {

    /**
     * 发送订阅消息
     *
     * @param appid      小程序appid
     * @param openid     用户openid
     * @param templateId 模板ID
     * @param data       模板数据（key为字段名，value为字段值）
     * @return 是否发送成功
     */
    public static boolean send(String appid, String openid, String templateId,
                               Map<String, String> data);

    /**
     * 发送订阅消息（带跳转页面）
     */
    public static boolean send(String appid, String openid, String templateId,
                               Map<String, String> data, String page);

    /**
     * 发送订阅消息（完整参数）
     *
     * @param miniprogramState 跳转版本：developer/trial/formal
     */
    public static boolean send(String appid, String openid, String templateId,
                               Map<String, String> data, String page, String miniprogramState);

    /**
     * 批量发送订阅消息
     *
     * @param openids 用户openid列表
     * @return 成功发送的数量
     */
    public static int batchSend(String appid, List<String> openids, String templateId,
                                Map<String, String> data);

    /**
     * 发送订阅消息（使用MsgData列表）
     */
    public static boolean sendWithMsgData(String appid, String openid, String templateId,
                                          List<WxMaSubscribeMessage.MsgData> msgDataList);
}
```

### 使用示例

```java
@Service
public class OrderNotifyService {

    /**
     * 发送订单发货通知
     */
    public void sendShipNotify(String appid, String openid, Order order) {
        Map<String, String> data = new HashMap<>();
        data.put("thing1", "订单编号" + order.getOrderNo());
        data.put("time2", DateUtils.format(order.getShipTime()));
        data.put("thing3", "您的订单已发货，请注意查收");

        String page = "pages/order/detail?id=" + order.getId();

        boolean success = WxMaSubscribeUtils.send(appid, openid, "templateId", data, page);

        if (!success) {
            log.warn("发货通知发送失败: orderId={}", order.getId());
        }
    }

    /**
     * 批量发送活动通知
     */
    public void batchSendActivityNotify(String appid, List<String> openids, Activity activity) {
        Map<String, String> data = new HashMap<>();
        data.put("thing1", activity.getName());
        data.put("time2", DateUtils.format(activity.getStartTime()));
        data.put("thing3", "活动即将开始，点击查看详情");

        int successCount = WxMaSubscribeUtils.batchSend(appid, openids, "templateId", data);

        log.info("活动通知发送完成: 总数={}, 成功={}", openids.size(), successCount);
    }
}
```

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 43101 | 用户拒绝接受消息 | 引导用户重新授权 |
| 47003 | 模板参数不准确 | 检查模板字段和数据 |
| 41030 | page路径不正确 | 检查页面路径是否存在 |

## 统一消息通道

### MiniappMessageChannel

实现 `MessageChannel` 接口，支持通过统一消息服务发送小程序订阅消息：

```java
@Slf4j
public class MiniappMessageChannel implements MessageChannel {

    @Override
    public String getChannelType() {
        return "miniapp";
    }

    @Override
    public String getChannelName() {
        return "微信小程序订阅消息";
    }

    @Override
    public MessageResult send(MessageContext context) {
        Map<String, Object> params = context.getParams();

        String appid = (String) params.get("appid");
        String openid = (String) params.get("openid");
        String templateId = (String) params.get("templateId");
        Map<String, String> data = (Map<String, String>) params.get("data");
        String page = (String) params.get("page");

        boolean success = WxMaSubscribeUtils.send(appid, openid, templateId, data, page);

        if (success) {
            return MessageResult.success(context.getMessageId(), getChannelType(), null);
        } else {
            return MessageResult.fail(context.getMessageId(), getChannelType(), null,
                "SEND_FAIL", "小程序订阅消息发送失败");
        }
    }

    @Override
    public boolean isEnabled() {
        return true;  // 始终启用
    }

    @Override
    public int getPriority() {
        return 4;  // 高优先级
    }

    @Override
    public boolean healthCheck() {
        try {
            return SpringUtils.getBean(WxMaService.class) != null;
        } catch (Exception e) {
            return false;
        }
    }
}
```

**必填参数：**

| 参数 | 说明 | 类型 |
|------|------|------|
| `params.appid` | 小程序appid | String |
| `params.openid` | 用户openid | String |
| `params.templateId` | 模板ID | String |
| `params.data` | 模板数据 | `Map<String, String>` |

**可选参数：**

| 参数 | 说明 | 类型 |
|------|------|------|
| `params.page` | 跳转页面路径 | String |
| `params.miniprogramState` | 跳转版本 | String |

### 使用示例

```java
@Service
public class NotificationService {

    @Autowired
    private MessagePushService messagePushService;

    public void sendMiniappNotify(Long userId, String appid, String openid) {
        Map<String, Object> params = new HashMap<>();
        params.put("appid", appid);
        params.put("openid", openid);
        params.put("templateId", "your_template_id");
        params.put("data", Map.of(
            "thing1", "订单已支付",
            "time2", "2025-01-01 12:00:00",
            "thing3", "感谢您的购买"
        ));
        params.put("page", "pages/order/detail?id=123");

        MessageContext context = MessageContext.ofParams(userId, params);

        messagePushService.push("miniapp", context);
    }
}
```

## 配置说明

### 应用配置

```yaml
# 模块启用配置
module:
  # 小程序模块默认启用，设置为false可关闭
  miniapp-enabled: true
```

### 平台配置

在平台管理中添加微信小程序配置：

```java
PlatformDTO platform = new PlatformDTO();
platform.setType(DictPlatformType.MP_WEIXIN.getValue());
platform.setAppid("your-appid");
platform.setSecret("your-secret");
platform.setToken("your-token");        // 消息加解密token
platform.setAeskey("your-aeskey");      // 消息加解密密钥
platform.setName("小程序名称");
```

**配置参数说明：**

| 参数 | 说明 | 必填 |
|------|------|------|
| `type` | 平台类型，固定为 `DictPlatformType.MP_WEIXIN` | 是 |
| `appid` | 小程序AppID | 是 |
| `secret` | 小程序AppSecret | 是 |
| `token` | 消息校验Token | 否 |
| `aeskey` | 消息加解密密钥 | 否 |
| `name` | 小程序名称（用于日志展示） | 否 |

## API使用指南

### 基础服务调用

```java
@Service
public class MiniappService {

    @Autowired
    private WxMaService wxMaService;

    /**
     * 获取用户信息
     */
    public WxMaUserInfo getUserInfo(String appid, String sessionKey,
                                    String encryptedData, String ivStr) {
        try {
            wxMaService.switchoverTo(appid);
            return wxMaService.getUserService()
                .getUserInfo(sessionKey, encryptedData, ivStr);
        } catch (WxErrorException e) {
            log.error("获取用户信息失败", e);
            throw new RuntimeException("获取用户信息失败");
        }
    }

    /**
     * 登录凭证校验
     */
    public WxMaJscode2SessionResult login(String appid, String code) {
        try {
            wxMaService.switchoverTo(appid);
            return wxMaService.jsCode2SessionInfo(code);
        } catch (WxErrorException e) {
            log.error("登录凭证校验失败", e);
            throw new RuntimeException("登录失败");
        }
    }

    /**
     * 获取手机号
     */
    public WxMaPhoneNumberInfo getPhoneNumber(String appid, String code) {
        try {
            wxMaService.switchoverTo(appid);
            return wxMaService.getUserService().getNewPhoneNoInfo(code);
        } catch (WxErrorException e) {
            log.error("获取手机号失败", e);
            throw new RuntimeException("获取手机号失败");
        }
    }

    /**
     * 获取AccessToken
     */
    public String getAccessToken(String appid) {
        try {
            wxMaService.switchoverTo(appid);
            return wxMaService.getAccessToken();
        } catch (WxErrorException e) {
            log.error("获取AccessToken失败", e);
            throw new RuntimeException("获取AccessToken失败");
        }
    }
}
```

### 动态配置管理

```java
@Service
public class MiniappConfigService {

    @Autowired
    private MiniappConfigInitializer configInitializer;

    /**
     * 添加小程序配置
     */
    public void addMiniappConfig(PlatformDTO platform) {
        if (StringUtils.isBlank(platform.getAppid()) ||
            StringUtils.isBlank(platform.getSecret())) {
            throw new IllegalArgumentException("AppId和Secret不能为空");
        }

        configInitializer.addConfig(platform);
        log.info("成功添加小程序配置: {}", platform.getName());
    }

    /**
     * 移除小程序配置
     */
    public void removeMiniappConfig(String appid) {
        configInitializer.removeConfig(appid);
        log.info("成功移除小程序配置: {}", appid);
    }

    /**
     * 刷新所有配置
     */
    public void refreshConfigs() {
        configInitializer.init();
        log.info("刷新小程序配置完成");
    }
}
```

### 配置验证

```java
public boolean validateConfig(String appid) {
    try {
        wxMaService.switchoverTo(appid);
        String accessToken = wxMaService.getAccessToken();
        return StringUtils.isNotBlank(accessToken);
    } catch (Exception e) {
        log.error("配置验证失败: appid={}", appid, e);
        return false;
    }
}
```

## 最佳实践

### 1. 多小程序切换

```java
@Service
public class MultiMiniappService {

    @Autowired
    private WxMaService wxMaService;

    /**
     * 正确的多小程序切换方式
     */
    public void handleMultiAppRequest(String appid1, String appid2) {
        // 操作第一个小程序
        wxMaService.switchoverTo(appid1);
        String token1 = wxMaService.getAccessToken();

        // 切换到第二个小程序
        wxMaService.switchoverTo(appid2);
        String token2 = wxMaService.getAccessToken();
    }
}
```

### 2. 异常处理

```java
@Service
public class SafeMiniappService {

    @Autowired
    private WxMaService wxMaService;

    /**
     * 带重试的API调用
     */
    public <T> T executeWithRetry(String appid, Supplier<T> supplier) {
        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                wxMaService.switchoverTo(appid);
                return supplier.get();
            } catch (Exception e) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    log.error("执行失败，已重试{}次: appid={}", maxRetries, appid, e);
                    throw new RuntimeException("小程序API调用失败", e);
                }
                log.warn("执行失败，准备重试第{}次", retryCount);
                try {
                    Thread.sleep(1000 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        throw new RuntimeException("执行失败");
    }
}
```

### 3. 场景值解析

```java
@Service
public class SceneService {

    /**
     * 解析小程序码scene参数
     * scene格式：u=123&p=456
     */
    public Map<String, String> parseScene(String scene) {
        Map<String, String> params = new HashMap<>();
        if (StringUtils.isBlank(scene)) {
            return params;
        }

        // 解码scene参数
        String decodedScene = URLDecoder.decode(scene, StandardCharsets.UTF_8);

        // 解析参数
        String[] pairs = decodedScene.split("&");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=");
            if (keyValue.length == 2) {
                params.put(keyValue[0], keyValue[1]);
            }
        }

        return params;
    }
}
```

## 常见问题

### Q1: 如何处理多个小程序切换？

使用 `wxMaService.switchoverTo(appid)` 方法在调用具体API前切换到对应的小程序实例：

```java
wxMaService.switchoverTo("appid1");
String result1 = wxMaService.getAccessToken();

wxMaService.switchoverTo("appid2");
String result2 = wxMaService.getAccessToken();
```

### Q2: 配置不生效怎么办？

检查以下几点：
1. 确认平台类型为 `DictPlatformType.MP_WEIXIN.getValue()`
2. 确认AppId、Secret等信息正确
3. 检查应用启动日志，确认配置初始化成功
4. 使用 `validateConfig()` 方法验证配置有效性

### Q3: 小程序码生成失败？

**排查步骤：**

1. 检查appid是否正确配置
2. 检查scene长度是否超过32字符
3. 检查page路径是否存在
4. 查看错误日志中的具体错误信息

### Q4: 订阅消息发送失败？

**常见原因：**

1. **43101**：用户拒绝接受消息，需引导用户重新授权
2. **47003**：模板参数不准确，检查字段名和数据格式
3. **41030**：page路径不正确，检查页面路径

### Q5: 线程安全问题？

`WxMaService` 的 `switchoverTo` 方法在多线程环境下可能存在并发问题。建议：

1. 在每次API调用前都执行 `switchoverTo`
2. 对于高并发场景，考虑使用ThreadLocal包装
3. 或者为每个小程序创建独立的服务实例

## 注意事项

1. **并发安全**：多线程环境下使用 `switchoverTo` 时注意线程安全
2. **配置管理**：动态添加配置后建议进行验证测试
3. **异常处理**：微信API调用可能出现各种异常，需要适当的重试和降级机制
4. **日志监控**：建议添加详细的日志记录，便于问题排查
5. **资源管理**：注意及时清理不再使用的配置，避免资源浪费
6. **场景值限制**：不限次数小程序码的scene参数最多32字符
7. **页面路径**：确保小程序码指向的页面路径在小程序中存在
