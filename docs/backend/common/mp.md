# 公众号集成 (mp)

## 模块介绍

`ruoyi-common-mp` 是基于 [WxJava](https://github.com/Wechat-Group/WxJava) (weixin-java-mp 4.7.6.B) 开发的微信公众号集成模块，提供了完整的微信公众号开发能力，包括多公众号管理、模板消息推送、JS-SDK签名、缓存优化等功能。

### 核心特性

- **多公众号支持**: 支持同时管理多个微信公众号，运行时动态切换
- **统一消息通道**: 实现 `MessageChannel` 接口，支持通过统一消息服务发送模板消息
- **二级缓存架构**: Caffeine 本地缓存 + Redis 分布式缓存，优化 access_token 访问性能
- **自动配置初始化**: 应用启动时自动从数据库加载公众号配置
- **模板消息工具**: 丰富的模板消息发送API，支持自定义颜色、批量发送、跳转小程序
- **JS-SDK支持**: 提供签名生成工具，支持前端调用微信分享、扫一扫等接口
- **分布式锁**: 基于 Redisson 实现的分布式锁，确保集群环境下 access_token 刷新安全

### 模块架构

```
ruoyi-common-mp
├── config/                          # 配置层
│   ├── MpAutoConfiguration.java     # Spring Boot 自动配置
│   └── PlusWxRedisOps.java          # 二级缓存实现
├── initializer/                     # 初始化层
│   └── MpConfigInitializer.java     # 配置初始化器
├── channel/                         # 消息通道层
│   └── MpMessageChannel.java        # 统一消息通道实现
├── utils/                           # 工具层
│   ├── WxMpTemplateUtils.java       # 模板消息工具类
│   └── WxMpJsApiUtils.java          # JS-SDK 工具类
└── domain/                          # 实体层
    └── JsApiSignature.java          # JS-SDK 签名实体
```

### 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| WxJava (weixin-java-mp) | 4.7.6.B | 微信公众号SDK |
| Caffeine | 3.x | 本地缓存 |
| Redisson | 3.52.0 | 分布式锁和缓存 |
| Spring Boot | 3.5.12 | 自动配置支持 |

## 依赖说明

```xml
<dependencies>
    <!-- 核心模块 - 提供基础工具类和服务接口 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <!-- Redis模块 - 提供缓存和分布式锁支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- 微信公众号SDK - WxJava核心库 -->
    <dependency>
        <groupId>com.github.binarywang</groupId>
        <artifactId>weixin-java-mp</artifactId>
    </dependency>
</dependencies>
```

## 自动配置机制

### 配置开关

模块通过 `module.mp-enabled` 配置项控制是否启用：

```yaml
# application.yml
module:
  # 微信公众号模块开关（默认开启）
  mp-enabled: true
```

### 自动装配组件

`MpAutoConfiguration` 在模块启用时自动注册以下组件：

```java
@Slf4j
@AutoConfiguration
@ConditionalOnProperty(prefix = "module", name = "mp-enabled", havingValue = "true", matchIfMissing = true)
public class MpAutoConfiguration {

    /**
     * 注册微信公众号核心服务
     * 设置最大重试次数为3次，提高接口调用容错性
     */
    @Bean
    public WxMpService wxMpService() {
        WxMpServiceImpl wxMpService = new WxMpServiceImpl();
        wxMpService.setMaxRetryTimes(3);
        return wxMpService;
    }

    /**
     * 注册二级缓存实现
     * Caffeine(5秒) + Redis(微信官方时间)
     */
    @Bean
    public WxRedisOps wxRedisOps() {
        return new PlusWxRedisOps();
    }

    /**
     * 注册配置初始化器
     * 应用启动时自动从数据库加载公众号配置
     */
    @Bean
    public MpConfigInitializer mpConfigInitializer(PlatformService platformService,
                                                    WxMpService wxMpService,
                                                    WxRedisOps wxRedisOps) {
        return new MpConfigInitializer(platformService, wxMpService, wxRedisOps);
    }

    /**
     * 注册统一消息通道
     * 支持通过 MessagePushService 发送公众号模板消息
     */
    @Bean
    public MpMessageChannel mpMessageChannel() {
        return new MpMessageChannel();
    }
}
```

### 装配流程

```
应用启动
    ↓
加载 MpAutoConfiguration
    ↓
检查 module.mp-enabled 配置
    ↓
注册 Bean: WxMpService、WxRedisOps、MpConfigInitializer、MpMessageChannel
    ↓
MpConfigInitializer.run() 执行
    ↓
从数据库加载 MP_OFFICIAL_ACCOUNT 类型的平台配置
    ↓
构建 WxMpRedisConfigImpl 并注册到 WxMpService
    ↓
初始化完成，可以使用公众号API
```

## 核心组件详解

### 1. 二级缓存实现 (PlusWxRedisOps)

`PlusWxRedisOps` 继承 `BaseWxRedisOps`，实现了 Caffeine + Redis 的二级缓存架构：

```java
public class PlusWxRedisOps extends BaseWxRedisOps {

    /**
     * Caffeine 本地缓存配置
     * - expireAfterWrite: 写入后5秒过期（热点数据短时间缓存）
     * - initialCapacity: 初始容量100
     * - maximumSize: 最大容量1000
     */
    private static final Cache<String, Object> CAFFEINE = Caffeine.newBuilder()
        .expireAfterWrite(5, TimeUnit.SECONDS)
        .initialCapacity(100)
        .maximumSize(1000)
        .build();

    /**
     * 获取缓存值
     * 优先从 Caffeine 获取，miss 时从 Redis 加载并填充 Caffeine
     */
    @Override
    public String getValue(String key) {
        Object o = CAFFEINE.get(key, k -> RedisUtils.getCacheObject(key));
        return (String) o;
    }

    /**
     * 设置缓存值
     * 同时写入 Redis 和 Caffeine
     */
    @Override
    public void setValue(String key, String value, int expire, TimeUnit timeUnit) {
        RedisUtils.setCacheObject(key, value, Duration.ofMillis(timeUnit.toMillis(expire)));
        CAFFEINE.put(key, value);
    }

    /**
     * 获取过期时间（秒）
     */
    @Override
    public Long getExpire(String key) {
        long timeout = RedisUtils.getTimeToLive(key);
        return timeout < 0 ? timeout : timeout / 1000;
    }

    /**
     * 设置过期时间
     */
    @Override
    public void expire(String key, int expire, TimeUnit timeUnit) {
        RedisUtils.expire(key, Duration.ofMillis(timeUnit.toMillis(expire)));
    }

    /**
     * 获取分布式锁
     * 用于 access_token 刷新时的并发控制
     */
    @Override
    public Lock getLock(String key) {
        return RedisUtils.getLock(key);
    }
}
```

#### 缓存策略说明

| 缓存层 | 技术 | 过期时间 | 用途 |
|--------|------|----------|------|
| 一级缓存 | Caffeine | 5秒 | 减少 Redis 网络请求，提升热点数据访问性能 |
| 二级缓存 | Redis | 按微信官方时间 | 分布式缓存，多实例共享 access_token |

#### 缓存的键

| 缓存键 | 说明 | 过期时间 |
|--------|------|----------|
| `wx:mp:{appid}:access_token` | 公众号 access_token | 7200秒（2小时） |
| `wx:mp:{appid}:jsapi_ticket` | JS-SDK 票据 | 7200秒（2小时） |
| `wx:mp:{appid}:card_api_ticket` | 卡券 API 票据 | 7200秒（2小时） |

### 2. 配置初始化器 (MpConfigInitializer)

`MpConfigInitializer` 实现 `ApplicationRunner` 接口，在应用启动时自动加载公众号配置：

```java
@Slf4j
public class MpConfigInitializer implements ApplicationRunner {

    private final PlatformService platformService;
    private final WxMpService wxMpService;
    private final WxRedisOps wxRedisOps;

    /**
     * 应用启动后初始化公众号配置
     */
    @Override
    public void run(ApplicationArguments args) {
        init();
    }

    /**
     * 初始化微信公众号配置
     * 从数据库加载所有 MP_OFFICIAL_ACCOUNT 类型的平台配置
     */
    public void init() {
        List<PlatformDTO> platformDTOList = platformService.listPlatformsByType(
            DictPlatformType.MP_OFFICIAL_ACCOUNT.getValue(), null);

        if (CollUtil.isEmpty(platformDTOList)) {
            log.info("未找到微信公众号配置，跳过初始化");
            return;
        }

        for (PlatformDTO platformDTO : platformDTOList) {
            String appid = platformDTO.getAppid();
            WxMpDefaultConfigImpl config = buildWxMpConfigImpl(platformDTO);
            wxMpService.addConfigStorage(appid, config);
        }

        log.info("初始化微信公众号配置成功: {}",
            StreamUtils.join(platformDTOList,
                p -> StringUtils.format("{}({})", p.getName(), p.getAppid()), ", "));
    }

    /**
     * 动态添加单个公众号配置
     */
    public void addConfig(PlatformDTO platform) {
        if (platform == null || StringUtils.isBlank(platform.getAppid())) {
            log.warn("平台配置为空或appid为空，跳过添加");
            return;
        }

        if (!DictPlatformType.MP_OFFICIAL_ACCOUNT.getValue().equals(platform.getType())) {
            log.debug("平台类型[{}]不是微信公众号，跳过添加", platform.getType());
            return;
        }

        try {
            WxMpDefaultConfigImpl config = buildWxMpConfigImpl(platform);
            wxMpService.addConfigStorage(platform.getAppid(), config);
            log.info("成功添加微信公众号配置: appid={}, name={}",
                platform.getAppid(), platform.getName());
        } catch (Exception e) {
            log.error("添加微信公众号配置失败: appid={}, name={}",
                platform.getAppid(), platform.getName(), e);
        }
    }

    /**
     * 动态移除单个公众号配置
     */
    public void removeConfig(String appid) {
        if (StringUtils.isBlank(appid)) {
            return;
        }
        try {
            wxMpService.removeConfigStorage(appid);
            log.info("成功移除微信公众号配置: appid={}", appid);
        } catch (Exception e) {
            log.debug("移除微信公众号配置失败或配置不存在: appid={}", appid);
        }
    }

    /**
     * 构建微信公众号配置对象
     * 使用 Redis 缓存配置，支持多实例共享
     */
    private WxMpDefaultConfigImpl buildWxMpConfigImpl(PlatformDTO platformDTO) {
        WxMpRedisConfigImpl wxMpRedisConfig = new WxMpRedisConfigImpl(wxRedisOps, "wx:mp");
        wxMpRedisConfig.setAppId(platformDTO.getAppid());
        wxMpRedisConfig.setSecret(platformDTO.getSecret());
        wxMpRedisConfig.setToken(platformDTO.getToken());
        wxMpRedisConfig.setAesKey(platformDTO.getAeskey());
        return wxMpRedisConfig;
    }
}
```

#### 数据库配置结构

平台配置存储在 `platform_config` 表中：

```sql
-- 平台配置表结构
CREATE TABLE platform_config (
    id          BIGINT PRIMARY KEY,
    name        VARCHAR(100) COMMENT '平台名称',
    type        VARCHAR(50) COMMENT '平台类型(MP_OFFICIAL_ACCOUNT)',
    appid       VARCHAR(100) COMMENT '应用ID',
    secret      VARCHAR(200) COMMENT '应用密钥',
    token       VARCHAR(200) COMMENT '消息校验Token',
    aeskey      VARCHAR(200) COMMENT '消息加解密密钥',
    status      TINYINT COMMENT '状态(1启用 0禁用)',
    tenant_id   BIGINT COMMENT '租户ID',
    create_time DATETIME,
    update_time DATETIME
);

-- 示例数据
INSERT INTO platform_config (name, type, appid, secret, token, aeskey, status, tenant_id)
VALUES ('官方公众号', 'MP_OFFICIAL_ACCOUNT', 'wx1234567890abcdef',
        'your_app_secret', 'your_token', 'your_aes_key', 1, 1);
```

### 3. 统一消息通道 (MpMessageChannel)

`MpMessageChannel` 实现 `MessageChannel` 接口，支持通过统一消息服务发送公众号模板消息：

```java
@Slf4j
public class MpMessageChannel implements MessageChannel {

    @Override
    public String getChannelType() {
        return "mp";
    }

    @Override
    public String getChannelName() {
        return "微信公众号模板消息";
    }

    @Override
    public int getPriority() {
        // 公众号模板消息优先级中等，官方通道
        return 5;
    }

    @Override
    public boolean isEnabled() {
        // 公众号通道始终启用
        return true;
    }

    @Override
    public MessageResult send(MessageContext context) {
        long startTime = System.currentTimeMillis();

        // 参数校验
        if (context == null || context.getParams() == null) {
            return MessageResult.fail(
                context != null ? context.getMessageId() : null,
                getChannelType(),
                null,
                "PARAM_ERROR",
                "消息上下文或扩展参数不能为空"
            );
        }

        Map<String, Object> params = context.getParams();

        // 必填参数
        String appid = (String) params.get("appid");
        String openid = (String) params.get("openid");
        String templateId = (String) params.get("templateId");
        Map<String, String> data = (Map<String, String>) params.get("data");

        // 参数校验...

        // 可选参数
        String url = (String) params.get("url");
        String miniAppid = (String) params.get("miniAppid");
        String miniPath = (String) params.get("miniPath");

        // 发送消息
        String msgId;
        if (StringUtils.isNotBlank(miniAppid) && StringUtils.isNotBlank(miniPath)) {
            msgId = WxMpTemplateUtils.sendToMiniProgram(appid, openid, templateId, data, miniAppid, miniPath);
        } else {
            msgId = WxMpTemplateUtils.send(appid, openid, templateId, data, url);
        }

        if (StringUtils.isNotBlank(msgId)) {
            MessageResult result = MessageResult.success(
                context.getMessageId(),
                getChannelType(),
                context.getUserIds() != null && !context.getUserIds().isEmpty()
                    ? context.getUserIds().get(0) : null
            );
            result.setCostTime(System.currentTimeMillis() - startTime);
            result.setThirdPartyMsgId(msgId);
            return result;
        } else {
            return MessageResult.fail(
                context.getMessageId(),
                getChannelType(),
                context.getUserIds() != null && !context.getUserIds().isEmpty()
                    ? context.getUserIds().get(0) : null,
                "SEND_FAIL",
                "公众号模板消息发送失败"
            );
        }
    }

    @Override
    public boolean healthCheck() {
        try {
            return SpringUtils.getBean(WxMpService.class) != null;
        } catch (Exception e) {
            log.warn("公众号通道健康检查失败: WxMpService 未找到", e);
            return false;
        }
    }

    @Override
    public boolean supportTenant(String tenantId) {
        return true;
    }
}
```

#### 消息通道参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appid | String | 是 | 公众号 AppID |
| openid | String | 是 | 用户 OpenID |
| templateId | String | 是 | 模板消息 ID |
| data | `Map<String, String>` | 是 | 模板数据 |
| url | String | 否 | 跳转 H5 链接 |
| miniAppid | String | 否 | 跳转小程序 AppID |
| miniPath | String | 否 | 跳转小程序页面路径 |

#### 使用示例

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final MessagePushService messagePushService;

    /**
     * 发送订单发货通知
     */
    public void sendOrderShippedNotification(String userId, String openid, OrderDTO order) {
        MessageContext context = MessageContext.ofParams(Long.parseLong(userId), Map.of(
            "appid", "wx1234567890abcdef",
            "openid", openid,
            "templateId", "tpl_order_shipped",
            "data", Map.of(
                "first", "您的订单已发货",
                "keyword1", order.getOrderNo(),
                "keyword2", order.getLogisticsCompany(),
                "keyword3", order.getLogisticsNo(),
                "remark", "点击查看物流详情"
            ),
            "url", "https://example.com/order/" + order.getId()
        ));

        // 通过统一消息服务发送
        messagePushService.push(context, "mp");
    }

    /**
     * 发送订单完成通知（跳转小程序）
     */
    public void sendOrderCompletedNotification(String userId, String openid, OrderDTO order) {
        MessageContext context = MessageContext.ofParams(Long.parseLong(userId), Map.of(
            "appid", "wx1234567890abcdef",
            "openid", openid,
            "templateId", "tpl_order_completed",
            "data", Map.of(
                "first", "您的订单已完成",
                "keyword1", order.getOrderNo(),
                "keyword2", order.getPayAmount().toString(),
                "remark", "感谢您的购买，欢迎再次光临"
            ),
            "miniAppid", "wx0987654321fedcba",
            "miniPath", "pages/order/detail?id=" + order.getId()
        ));

        messagePushService.push(context, "mp");
    }
}
```

### 4. 模板消息工具类 (WxMpTemplateUtils)

`WxMpTemplateUtils` 提供丰富的模板消息发送方法：

```java
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class WxMpTemplateUtils {

    /**
     * 默认字体颜色（深蓝色）
     */
    private static final String DEFAULT_COLOR = "#173177";

    // ==================== 基础发送方法 ====================

    /**
     * 发送模板消息（基础版）
     */
    public static String send(String appid, String openid, String templateId,
                              Map<String, String> data) {
        return send(appid, openid, templateId, data, null);
    }

    /**
     * 发送模板消息（带跳转链接）
     */
    public static String send(String appid, String openid, String templateId,
                              Map<String, String> data, String url) {
        List<WxMpTemplateData> templateDataList = new ArrayList<>();
        data.forEach((key, value) ->
            templateDataList.add(new WxMpTemplateData(key, value, DEFAULT_COLOR))
        );
        return sendInternal(appid, openid, templateId, templateDataList, url, null, null);
    }

    // ==================== 小程序跳转 ====================

    /**
     * 发送模板消息（跳转小程序）
     */
    public static String sendToMiniProgram(String appid, String openid, String templateId,
                                           Map<String, String> data,
                                           String miniProgramAppid, String miniProgramPath) {
        List<WxMpTemplateData> templateDataList = new ArrayList<>();
        data.forEach((key, value) ->
            templateDataList.add(new WxMpTemplateData(key, value, DEFAULT_COLOR))
        );
        return sendInternal(appid, openid, templateId, templateDataList, null,
                           miniProgramAppid, miniProgramPath);
    }

    // ==================== 自定义颜色 ====================

    /**
     * 发送模板消息（统一自定义颜色）
     */
    public static String sendWithCustomColor(String appid, String openid, String templateId,
                                             Map<String, String> data, String url, String color) {
        String finalColor = StringUtils.isNotBlank(color) ? color : DEFAULT_COLOR;
        List<WxMpTemplateData> templateDataList = new ArrayList<>();
        data.forEach((key, value) ->
            templateDataList.add(new WxMpTemplateData(key, value, finalColor))
        );
        return sendInternal(appid, openid, templateId, templateDataList, url, null, null);
    }

    /**
     * 发送模板消息（每个字段单独设置颜色）
     */
    public static String sendWithColor(String appid, String openid, String templateId,
                                       Map<String, TemplateData> data, String url) {
        List<WxMpTemplateData> templateDataList = new ArrayList<>();
        data.forEach((key, templateData) ->
            templateDataList.add(new WxMpTemplateData(
                key,
                templateData.getValue(),
                StringUtils.isNotBlank(templateData.getColor()) ? templateData.getColor() : DEFAULT_COLOR
            ))
        );
        return sendInternal(appid, openid, templateId, templateDataList, url, null, null);
    }

    // ==================== 批量发送 ====================

    /**
     * 批量发送模板消息
     */
    public static int batchSend(String appid, List<String> openids, String templateId,
                                Map<String, String> data, String url) {
        if (openids == null || openids.isEmpty()) {
            log.warn("批量发送模板消息 - openid列表为空");
            return 0;
        }

        int successCount = 0;
        for (String openid : openids) {
            try {
                String msgId = send(appid, openid, templateId, data, url);
                if (StringUtils.isNotBlank(msgId)) {
                    successCount++;
                }
            } catch (Exception e) {
                log.error("批量发送模板消息失败 - openid:{}", openid, e);
            }
        }

        log.info("批量发送模板消息完成 - 总数:{}, 成功:{}, 失败:{}",
            openids.size(), successCount, openids.size() - successCount);

        return successCount;
    }

    // ==================== 内部发送方法 ====================

    private static String sendInternal(String appid, String openid, String templateId,
                                       List<WxMpTemplateData> templateDataList,
                                       String url, String miniAppid, String miniPath) {
        // 参数校验
        if (StringUtils.isBlank(appid)) {
            throw ServiceException.of("公众号appid不能为空");
        }
        if (StringUtils.isBlank(openid)) {
            throw ServiceException.of("用户openid不能为空");
        }
        if (StringUtils.isBlank(templateId)) {
            throw ServiceException.of("模板ID不能为空");
        }
        if (templateDataList == null || templateDataList.isEmpty()) {
            throw ServiceException.of("模板数据不能为空");
        }

        try {
            WxMpService wxMpService = SpringUtils.getBean(WxMpService.class);
            // 切换到指定的公众号配置
            wxMpService.switchover(appid);

            // 构建模板消息
            WxMpTemplateMessage templateMessage = WxMpTemplateMessage.builder()
                .toUser(openid)
                .templateId(templateId)
                .data(templateDataList)
                .build();

            // 设置跳转链接
            if (StringUtils.isNotBlank(url)) {
                templateMessage.setUrl(url);
            }

            // 设置跳转小程序
            if (StringUtils.isNotBlank(miniAppid) && StringUtils.isNotBlank(miniPath)) {
                WxMpTemplateMessage.MiniProgram miniProgram = new WxMpTemplateMessage.MiniProgram();
                miniProgram.setAppid(miniAppid);
                miniProgram.setPagePath(miniPath);
                templateMessage.setMiniProgram(miniProgram);
            }

            // 发送模板消息
            String msgId = wxMpService.getTemplateMsgService().sendTemplateMsg(templateMessage);
            log.info("模板消息发送成功 - openid:{}, templateId:{}, msgId:{}",
                openid, templateId, msgId);
            return msgId;

        } catch (WxErrorException e) {
            log.error("发送模板消息失败 - appid:{}, openid:{}, templateId:{}, errCode:{}, errMsg:{}",
                appid, openid, templateId, e.getError().getErrorCode(), e.getError().getErrorMsg(), e);
            return null;
        } catch (Exception e) {
            log.error("发送模板消息异常 - appid:{}, openid:{}, templateId:{}",
                appid, openid, templateId, e);
            return null;
        }
    }

    /**
     * 模板数据（包含值和颜色）
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TemplateData {
        private String value;
        private String color;

        public TemplateData(String value) {
            this.value = value;
            this.color = DEFAULT_COLOR;
        }
    }
}
```

#### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `send(appid, openid, templateId, data)` | 发送模板消息（基础版） | msgId |
| `send(appid, openid, templateId, data, url)` | 发送模板消息（带H5跳转） | msgId |
| `sendToMiniProgram(...)` | 发送模板消息（跳转小程序） | msgId |
| `sendWithCustomColor(...)` | 发送模板消息（统一自定义颜色） | msgId |
| `sendWithColor(...)` | 发送模板消息（每字段独立颜色） | msgId |
| `batchSend(...)` | 批量发送模板消息 | 成功数量 |

### 5. JS-SDK 工具类 (WxMpJsApiUtils)

`WxMpJsApiUtils` 提供微信 JS-SDK 签名生成功能：

```java
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class WxMpJsApiUtils {

    /**
     * 创建JS-SDK签名配置
     *
     * @param appid 公众号appid
     * @param url   当前网页的URL（不包含#及其后面部分）
     * @return JS-SDK签名配置
     */
    public static JsApiSignature createJsApiSignature(String appid, String url) {
        // 参数校验
        if (StringUtils.isBlank(appid)) {
            throw ServiceException.of("公众号appid不能为空");
        }
        if (StringUtils.isBlank(url)) {
            throw ServiceException.of("URL不能为空");
        }

        // 移除URL中的#及其后面部分（微信要求）
        String finalUrl = url;
        int hashIndex = url.indexOf('#');
        if (hashIndex > 0) {
            finalUrl = url.substring(0, hashIndex);
        }

        try {
            WxMpService wxMpService = SpringUtils.getBean(WxMpService.class);
            wxMpService.switchover(appid);

            // 创建签名（WxJava自动处理 jsapi_ticket 缓存）
            WxJsapiSignature wxSignature = wxMpService.createJsapiSignature(finalUrl);

            // 转换为自定义VO
            JsApiSignature signature = new JsApiSignature(
                appid,
                wxSignature.getTimestamp(),
                wxSignature.getNonceStr(),
                wxSignature.getSignature(),
                finalUrl
            );

            log.info("JS-SDK签名生成成功 - appid:{}, url:{}", appid, finalUrl);
            return signature;

        } catch (WxErrorException e) {
            log.error("生成JS-SDK签名失败 - appid:{}, url:{}, errCode:{}, errMsg:{}",
                appid, finalUrl, e.getError().getErrorCode(), e.getError().getErrorMsg(), e);
            throw ServiceException.of("生成JS-SDK签名失败: " + e.getError().getErrorMsg());
        }
    }

    /**
     * 创建JS-SDK签名配置（使用默认公众号）
     */
    public static JsApiSignature createJsApiSignature(String url) {
        try {
            WxMpService wxMpService = SpringUtils.getBean(WxMpService.class);
            String appid = wxMpService.getWxMpConfigStorage().getAppId();
            return createJsApiSignature(appid, url);
        } catch (Exception e) {
            log.error("获取默认公众号配置失败", e);
            throw ServiceException.of("获取默认公众号配置失败");
        }
    }
}
```

#### JS-SDK 签名实体

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JsApiSignature implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 公众号appId */
    private String appId;

    /** 时间戳（秒） */
    private Long timestamp;

    /** 随机字符串 */
    private String nonceStr;

    /** 签名 */
    private String signature;

    /** 当前网页的URL（用于调试） */
    private String url;
}
```

## 使用指南

### 1. 模块引入

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mp</artifactId>
</dependency>
```

### 2. 配置数据库

```sql
-- 添加微信公众号平台配置
INSERT INTO platform_config (name, type, appid, secret, token, aeskey, status, tenant_id)
VALUES
    ('主公众号', 'MP_OFFICIAL_ACCOUNT', 'wx1234567890', 'secret1', 'token1', 'aeskey1', 1, 1),
    ('服务号', 'MP_OFFICIAL_ACCOUNT', 'wxabcdefghij', 'secret2', 'token2', 'aeskey2', 1, 1);
```

### 3. 基本使用

#### 注入服务

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mp")
public class WxMpController {

    private final WxMpService wxMpService;
    private final MpConfigInitializer mpConfigInitializer;
}
```

#### 发送模板消息

```java
/**
 * 发送模板消息
 */
@PostMapping("/template/send")
public R<String> sendTemplateMessage(@RequestBody TemplateMessageRequest request) {
    Map<String, String> data = new HashMap<>();
    data.put("first", request.getFirst());
    data.put("keyword1", request.getKeyword1());
    data.put("keyword2", request.getKeyword2());
    data.put("remark", request.getRemark());

    String msgId = WxMpTemplateUtils.send(
        request.getAppid(),
        request.getOpenid(),
        request.getTemplateId(),
        data,
        request.getUrl()
    );

    if (StringUtils.isNotBlank(msgId)) {
        return R.ok(msgId, "发送成功");
    } else {
        return R.fail("发送失败");
    }
}
```

#### 批量发送通知

```java
/**
 * 批量发送活动通知
 */
@PostMapping("/template/batch")
public R<Integer> batchSendNotification(@RequestBody BatchNotifyRequest request) {
    Map<String, String> data = Map.of(
        "first", "您有一条新的活动通知",
        "keyword1", request.getActivityName(),
        "keyword2", request.getActivityTime(),
        "remark", "点击查看详情"
    );

    int successCount = WxMpTemplateUtils.batchSend(
        request.getAppid(),
        request.getOpenids(),
        request.getTemplateId(),
        data,
        request.getUrl()
    );

    return R.ok(successCount, "批量发送完成");
}
```

#### 获取 JS-SDK 签名

```java
/**
 * 获取JS-SDK签名配置
 */
@GetMapping("/jssdk/signature")
public R<JsApiSignature> getJsApiSignature(
        @RequestParam String appid,
        @RequestParam String url) {
    JsApiSignature signature = WxMpJsApiUtils.createJsApiSignature(appid, url);
    return R.ok(signature);
}
```

#### 动态管理公众号配置

```java
/**
 * 添加新公众号配置
 */
@PostMapping("/config/add")
public R<Void> addConfig(@RequestBody PlatformDTO platform) {
    mpConfigInitializer.addConfig(platform);
    return R.ok("配置添加成功");
}

/**
 * 移除公众号配置
 */
@DeleteMapping("/config/{appid}")
public R<Void> removeConfig(@PathVariable String appid) {
    mpConfigInitializer.removeConfig(appid);
    return R.ok("配置移除成功");
}
```

### 4. 消息处理

#### 消息接收Controller

```java
@RestController
@RequestMapping("/api/mp/portal")
@RequiredArgsConstructor
public class WxMpPortalController {

    private final WxMpService wxMpService;
    private final WxMpMessageRouter messageRouter;

    /**
     * 验证消息来源
     */
    @GetMapping("/{appid}")
    public String authGet(
            @PathVariable String appid,
            @RequestParam String signature,
            @RequestParam String timestamp,
            @RequestParam String nonce,
            @RequestParam String echostr) {

        if (!wxMpService.switchover(appid)) {
            throw ServiceException.of("未找到对应appid的配置");
        }

        if (wxMpService.checkSignature(timestamp, nonce, signature)) {
            return echostr;
        }

        return "非法请求";
    }

    /**
     * 处理消息
     */
    @PostMapping("/{appid}")
    public String handleMessage(
            @PathVariable String appid,
            @RequestBody String requestBody,
            @RequestParam String signature,
            @RequestParam String timestamp,
            @RequestParam String nonce,
            @RequestParam(required = false) String msgSignature,
            @RequestParam String openid,
            @RequestParam(required = false) String encryptType) {

        if (!wxMpService.switchover(appid)) {
            throw ServiceException.of("未找到对应appid的配置");
        }

        if (!wxMpService.checkSignature(timestamp, nonce, signature)) {
            throw ServiceException.of("非法请求，可能属于伪造的请求");
        }

        String out = null;
        if ("aes".equalsIgnoreCase(encryptType)) {
            // 加密消息
            WxMpXmlMessage inMessage = WxMpXmlMessage.fromEncryptedXml(
                requestBody, wxMpService.getWxMpConfigStorage(), timestamp, nonce, msgSignature);
            WxMpXmlOutMessage outMessage = messageRouter.route(inMessage);
            if (outMessage != null) {
                out = outMessage.toEncryptedXml(wxMpService.getWxMpConfigStorage());
            }
        } else {
            // 明文消息
            WxMpXmlMessage inMessage = WxMpXmlMessage.fromXml(requestBody);
            WxMpXmlOutMessage outMessage = messageRouter.route(inMessage);
            if (outMessage != null) {
                out = outMessage.toXml();
            }
        }

        return out;
    }
}
```

#### 消息路由配置

```java
@Configuration
@RequiredArgsConstructor
public class WxMpMessageRouterConfig {

    private final WxMpService wxMpService;
    private final TextMessageHandler textMessageHandler;
    private final SubscribeHandler subscribeHandler;
    private final UnsubscribeHandler unsubscribeHandler;
    private final MenuClickHandler menuClickHandler;

    @Bean
    public WxMpMessageRouter wxMpMessageRouter() {
        WxMpMessageRouter router = new WxMpMessageRouter(wxMpService);

        // 关注事件
        router.rule()
            .async(false)
            .msgType(WxConsts.XmlMsgType.EVENT)
            .event(WxConsts.EventType.SUBSCRIBE)
            .handler(subscribeHandler)
            .end();

        // 取消关注事件
        router.rule()
            .async(false)
            .msgType(WxConsts.XmlMsgType.EVENT)
            .event(WxConsts.EventType.UNSUBSCRIBE)
            .handler(unsubscribeHandler)
            .end();

        // 菜单点击事件
        router.rule()
            .async(false)
            .msgType(WxConsts.XmlMsgType.EVENT)
            .event(WxConsts.EventType.CLICK)
            .handler(menuClickHandler)
            .end();

        // 文本消息
        router.rule()
            .async(false)
            .msgType(WxConsts.XmlMsgType.TEXT)
            .handler(textMessageHandler)
            .end();

        return router;
    }
}
```

#### 消息处理器示例

```java
@Component
@Slf4j
public class TextMessageHandler implements WxMpMessageHandler {

    @Override
    public WxMpXmlOutMessage handle(WxMpXmlMessage wxMessage,
                                    Map<String, Object> context,
                                    WxMpService wxMpService,
                                    WxSessionManager sessionManager) {

        String content = wxMessage.getContent();
        log.info("收到文本消息: openid={}, content={}", wxMessage.getFromUser(), content);

        // 关键词回复
        String replyContent;
        if (content.contains("帮助")) {
            replyContent = "您好，有什么可以帮您的？";
        } else if (content.contains("客服")) {
            replyContent = "客服电话：400-123-4567";
        } else {
            replyContent = "您好，我已收到您的消息。";
        }

        return WxMpXmlOutMessage.TEXT()
            .content(replyContent)
            .fromUser(wxMessage.getToUser())
            .toUser(wxMessage.getFromUser())
            .build();
    }
}

@Component
@Slf4j
public class SubscribeHandler implements WxMpMessageHandler {

    @Override
    public WxMpXmlOutMessage handle(WxMpXmlMessage wxMessage,
                                    Map<String, Object> context,
                                    WxMpService wxMpService,
                                    WxSessionManager sessionManager) {

        log.info("用户关注: openid={}", wxMessage.getFromUser());

        // 欢迎语
        return WxMpXmlOutMessage.TEXT()
            .content("欢迎关注！回复"帮助"查看更多功能。")
            .fromUser(wxMessage.getToUser())
            .toUser(wxMessage.getFromUser())
            .build();
    }
}
```

### 5. 前端 JS-SDK 集成

#### 获取签名配置

```typescript
// api/mp.ts
import request from '@/utils/request'

interface JsApiSignature {
  appId: string
  timestamp: number
  nonceStr: string
  signature: string
  url: string
}

/**
 * 获取JS-SDK签名配置
 */
export function getJsApiSignature(appid: string, url: string): Promise<JsApiSignature> {
  return request.get('/api/mp/jssdk/signature', {
    params: { appid, url }
  })
}
```

#### 初始化 wx.config

```typescript
// utils/wxJssdk.ts
import wx from 'weixin-js-sdk'
import { getJsApiSignature } from '@/api/mp'

interface WxConfigOptions {
  appid: string
  jsApiList: string[]
  debug?: boolean
}

/**
 * 初始化微信JS-SDK
 */
export async function initWxConfig(options: WxConfigOptions): Promise<void> {
  const { appid, jsApiList, debug = false } = options

  // 获取当前页面URL（去除hash部分）
  const url = window.location.href.split('#')[0]

  try {
    // 获取签名配置
    const signature = await getJsApiSignature(appid, url)

    // 配置wx.config
    wx.config({
      debug,
      appId: signature.appId,
      timestamp: signature.timestamp,
      nonceStr: signature.nonceStr,
      signature: signature.signature,
      jsApiList
    })

    // 等待ready
    await new Promise<void>((resolve, reject) => {
      wx.ready(() => {
        console.log('微信JS-SDK配置成功')
        resolve()
      })
      wx.error((res: any) => {
        console.error('微信JS-SDK配置失败:', res)
        reject(new Error(res.errMsg))
      })
    })
  } catch (error) {
    console.error('初始化微信JS-SDK失败:', error)
    throw error
  }
}
```

#### 分享功能实现

```typescript
// composables/useWxShare.ts
import wx from 'weixin-js-sdk'
import { initWxConfig } from '@/utils/wxJssdk'

interface ShareData {
  title: string
  desc: string
  link: string
  imgUrl: string
}

export function useWxShare() {
  const appid = import.meta.env.VITE_WX_APPID

  /**
   * 配置微信分享
   */
  async function setupShare(shareData: ShareData) {
    try {
      // 初始化JS-SDK
      await initWxConfig({
        appid,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData'
        ]
      })

      // 配置分享到好友
      wx.updateAppMessageShareData({
        title: shareData.title,
        desc: shareData.desc,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        success: () => {
          console.log('分享到好友配置成功')
        }
      })

      // 配置分享到朋友圈
      wx.updateTimelineShareData({
        title: shareData.title,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        success: () => {
          console.log('分享到朋友圈配置成功')
        }
      })
    } catch (error) {
      console.error('配置微信分享失败:', error)
    }
  }

  return { setupShare }
}
```

#### 扫一扫功能

```typescript
// composables/useWxScan.ts
import wx from 'weixin-js-sdk'
import { initWxConfig } from '@/utils/wxJssdk'

export function useWxScan() {
  const appid = import.meta.env.VITE_WX_APPID

  /**
   * 调用微信扫一扫
   */
  async function scanQRCode(): Promise<string> {
    // 初始化JS-SDK
    await initWxConfig({
      appid,
      jsApiList: ['scanQRCode']
    })

    return new Promise((resolve, reject) => {
      wx.scanQRCode({
        needResult: 1, // 1 返回扫描结果，0 微信处理
        scanType: ['qrCode', 'barCode'],
        success: (res: any) => {
          resolve(res.resultStr)
        },
        fail: (err: any) => {
          reject(new Error(err.errMsg))
        }
      })
    })
  }

  return { scanQRCode }
}
```

## 多公众号管理

### 配置切换

```java
@Service
@RequiredArgsConstructor
public class WxMpMultiAccountService {

    private final WxMpService wxMpService;

    /**
     * 切换到指定公众号
     */
    public void switchTo(String appid) {
        if (!wxMpService.switchover(appid)) {
            throw ServiceException.of("未找到appid为[" + appid + "]的公众号配置");
        }
    }

    /**
     * 获取用户信息
     */
    public WxMpUser getUserInfo(String appid, String openid) throws WxErrorException {
        switchTo(appid);
        return wxMpService.getUserService().userInfo(openid);
    }

    /**
     * 创建菜单
     */
    public void createMenu(String appid, WxMpMenu menu) throws WxErrorException {
        switchTo(appid);
        wxMpService.getMenuService().menuCreate(menu);
    }

    /**
     * 获取所有已配置的公众号
     */
    public Set<String> getConfiguredAppIds() {
        return wxMpService.getAllConfigStorages().keySet();
    }
}
```

### 租户隔离

```java
@Service
@RequiredArgsConstructor
public class TenantWxMpService {

    private final PlatformService platformService;
    private final WxMpService wxMpService;

    /**
     * 获取当前租户的公众号配置
     */
    public List<PlatformDTO> getCurrentTenantMpConfigs() {
        Long tenantId = TenantHelper.getTenantId();
        return platformService.listPlatformsByType(
            DictPlatformType.MP_OFFICIAL_ACCOUNT.getValue(),
            tenantId
        );
    }

    /**
     * 发送模板消息（自动选择当前租户的公众号）
     */
    public String sendTemplateMessage(String openid, String templateId,
                                      Map<String, String> data) {
        List<PlatformDTO> configs = getCurrentTenantMpConfigs();
        if (configs.isEmpty()) {
            throw ServiceException.of("当前租户未配置微信公众号");
        }

        // 使用第一个配置（或根据业务逻辑选择）
        String appid = configs.get(0).getAppid();
        return WxMpTemplateUtils.send(appid, openid, templateId, data);
    }
}
```

## 常见问题

### Q1: 如何处理 access_token 过期？

**问题原因:**
- access_token 有效期为 2 小时
- 多实例部署时可能存在刷新竞争

**解决方案:**
系统已通过二级缓存和分布式锁自动处理：
- Caffeine 本地缓存减少 Redis 访问
- Redis 分布式缓存确保多实例共享
- Redisson 分布式锁防止并发刷新

```java
// PlusWxRedisOps 中的分布式锁实现
@Override
public Lock getLock(String key) {
    return RedisUtils.getLock(key);
}
```

### Q2: 模板消息发送失败常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 40001 | access_token 无效或过期 | 检查 appid 和 secret 配置 |
| 43004 | 用户拒收消息 | 用户在24小时内未与公众号交互 |
| 47003 | 模板参数不准确 | 检查 templateId 和 data 字段 |
| 41028 | form_id 已使用或过期 | 确保 form_id 有效 |

### Q3: JS-SDK 签名验证失败

**问题原因:**
- URL 参数错误（包含 # 后的内容）
- 域名未在公众号后台配置
- jsapi_ticket 获取失败

**解决方案:**

```typescript
// 1. 确保URL不包含hash部分
const url = window.location.href.split('#')[0]

// 2. 在公众号后台配置JS安全域名

// 3. 检查后端日志确认签名生成是否成功
```

### Q4: 多公众号切换时报错

**问题原因:**
- 公众号配置未初始化
- appid 拼写错误
- 数据库中状态为禁用

**解决方案:**

```java
// 检查配置是否存在
Set<String> configuredAppIds = wxMpService.getAllConfigStorages().keySet();
if (!configuredAppIds.contains(appid)) {
    log.error("未找到appid配置: {}, 已配置的appid: {}", appid, configuredAppIds);
    throw ServiceException.of("公众号配置不存在");
}
```

### Q5: 如何监控模板消息发送情况？

**解决方案:**
使用消息发送回调记录结果：

```java
@Service
@Slf4j
public class TemplateMessageMonitor {

    /**
     * 发送并记录结果
     */
    public void sendAndRecord(String appid, String openid, String templateId,
                              Map<String, String> data) {
        long startTime = System.currentTimeMillis();
        String msgId = WxMpTemplateUtils.send(appid, openid, templateId, data);
        long costTime = System.currentTimeMillis() - startTime;

        // 记录到日志或数据库
        if (StringUtils.isNotBlank(msgId)) {
            log.info("[模板消息成功] appid={}, openid={}, templateId={}, msgId={}, costTime={}ms",
                appid, openid, templateId, msgId, costTime);
        } else {
            log.error("[模板消息失败] appid={}, openid={}, templateId={}, costTime={}ms",
                appid, openid, templateId, costTime);
        }
    }
}
```

## 最佳实践

### 1. 模板消息发送策略

```java
@Service
@Slf4j
public class SmartTemplateService {

    private final WxMpService wxMpService;

    /**
     * 智能发送模板消息
     * - 自动重试失败的消息
     * - 记录发送结果
     */
    public boolean smartSend(String appid, String openid, String templateId,
                             Map<String, String> data, String url) {
        int maxRetry = 3;
        int retryCount = 0;

        while (retryCount < maxRetry) {
            try {
                String msgId = WxMpTemplateUtils.send(appid, openid, templateId, data, url);
                if (StringUtils.isNotBlank(msgId)) {
                    return true;
                }
                retryCount++;
                Thread.sleep(1000 * retryCount); // 递增延迟
            } catch (Exception e) {
                log.error("模板消息发送异常，重试次数: {}", retryCount, e);
                retryCount++;
            }
        }

        log.error("模板消息发送失败，已达到最大重试次数: appid={}, openid={}", appid, openid);
        return false;
    }
}
```

### 2. 批量发送优化

```java
@Service
@Slf4j
public class BatchTemplateService {

    private static final int BATCH_SIZE = 100;
    private static final int THREAD_POOL_SIZE = 10;

    private final ExecutorService executor = Executors.newFixedThreadPool(THREAD_POOL_SIZE);

    /**
     * 异步批量发送模板消息
     */
    public CompletableFuture<Integer> asyncBatchSend(String appid, List<String> openids,
                                                      String templateId, Map<String, String> data) {
        return CompletableFuture.supplyAsync(() -> {
            AtomicInteger successCount = new AtomicInteger(0);

            // 分批处理
            Lists.partition(openids, BATCH_SIZE).forEach(batch -> {
                int count = WxMpTemplateUtils.batchSend(appid, batch, templateId, data);
                successCount.addAndGet(count);

                // 每批次间隔100ms，避免触发限流
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });

            return successCount.get();
        }, executor);
    }
}
```

### 3. 用户OpenID管理

```java
@Service
@RequiredArgsConstructor
public class WxUserService {

    private final WxMpService wxMpService;
    private final UserMpBindMapper userMpBindMapper;

    /**
     * 绑定用户OpenID
     */
    @Transactional
    public void bindOpenId(Long userId, String appid, String openid) {
        // 检查是否已绑定
        UserMpBind existing = userMpBindMapper.selectOne(
            new LambdaQueryWrapper<UserMpBind>()
                .eq(UserMpBind::getUserId, userId)
                .eq(UserMpBind::getAppid, appid)
        );

        if (existing != null) {
            // 更新
            existing.setOpenid(openid);
            existing.setUpdateTime(LocalDateTime.now());
            userMpBindMapper.updateById(existing);
        } else {
            // 新增
            UserMpBind bind = new UserMpBind();
            bind.setUserId(userId);
            bind.setAppid(appid);
            bind.setOpenid(openid);
            bind.setCreateTime(LocalDateTime.now());
            userMpBindMapper.insert(bind);
        }
    }

    /**
     * 获取用户OpenID
     */
    public String getOpenId(Long userId, String appid) {
        UserMpBind bind = userMpBindMapper.selectOne(
            new LambdaQueryWrapper<UserMpBind>()
                .eq(UserMpBind::getUserId, userId)
                .eq(UserMpBind::getAppid, appid)
        );
        return bind != null ? bind.getOpenid() : null;
    }
}
```

### 4. 安全配置

```yaml
# application-security.yml
wx:
  mp:
    # 消息加解密方式：raw(明文), aes(加密)
    encrypt-mode: aes
    # IP白名单校验
    ip-whitelist:
      - 140.207.54.0/24  # 微信服务器IP段
      - 101.226.62.0/24
```

```java
@Component
public class WxIpWhitelistFilter extends OncePerRequestFilter {

    @Value("${wx.mp.ip-whitelist:}")
    private List<String> ipWhitelist;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestUri = request.getRequestURI();

        // 只过滤微信回调接口
        if (requestUri.startsWith("/api/mp/portal")) {
            String clientIp = getClientIp(request);

            if (!isIpAllowed(clientIp)) {
                log.warn("微信回调IP不在白名单: {}", clientIp);
                response.setStatus(HttpStatus.FORBIDDEN.value());
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isIpAllowed(String ip) {
        // IP白名单校验逻辑
        return ipWhitelist.isEmpty() || ipWhitelist.stream()
            .anyMatch(cidr -> IpUtils.isInRange(ip, cidr));
    }
}
```

## 注意事项

1. **线程安全**: `WxMpService` 是线程安全的，可以在多线程环境下使用
2. **配置切换**: 使用多公众号时，记得调用 `switchover(appid)` 切换配置
3. **异常处理**: 所有微信API调用都应该进行适当的异常处理
4. **缓存预热**: 系统启动时会自动加载所有配置的公众号
5. **日志监控**: 建议监控微信API的调用频率，避免超过限制
6. **安全配置**: 生产环境建议开启消息加密和IP白名单
7. **模板审核**: 新模板需要在微信公众平台提交审核后才能使用
8. **用户授权**: 确保用户已关注公众号才能发送模板消息
