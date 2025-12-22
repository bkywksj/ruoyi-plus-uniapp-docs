# 短信服务 (sms)

## 概述

短信模块是基于若依框架开发的通用短信服务模块，提供短信发送与验证码功能。该模块集成了SMS4J框架，支持多平台短信服务商，并提供统一的API接口和缓存管理。模块同时实现了统一消息接口 `MessageChannel`，可以与其他消息通道（WebSocket、SSE、小程序等）实现智能降级和广播推送。

## 核心特性

- **多平台支持**: 基于SMS4J框架，支持阿里云、腾讯云、华为云、网易云等主流短信服务商
- **统一接口**: 提供标准化的短信发送API，支持模板短信和普通短信
- **验证码管理**: 内置验证码生成、存储和校验功能
- **缓存支持**: 集成Redis缓存，支持短信重试和拦截机制
- **异常处理**: 全局异常捕获和友好错误提示
- **自动配置**: Spring Boot自动配置，开箱即用
- **消息通道集成**: 实现统一消息接口，支持与其他通道智能降级

## 模块结构

```text
ruoyi-common-sms/
├── pom.xml                                           # Maven配置文件
├── src/main/java/plus/ruoyi/common/sms/
│   ├── config/
│   │   └── SmsAutoConfiguration.java                 # 自动配置类
│   ├── core/
│   │   └── dao/
│   │       └── PlusSmsDao.java                      # 短信缓存DAO实现
│   ├── channel/
│   │   └── SmsMessageChannel.java                   # 统一消息通道实现
│   └── handler/
│       └── SmsExceptionHandler.java                 # 全局异常处理器
├── src/test/java/plus/ruoyi/common/sms/
│   └── handler/
│       └── SmsExceptionHandlerTest.java             # 异常处理器测试
└── src/main/resources/META-INF/
    └── spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 依赖关系

### Maven依赖

```xml
<dependencies>
    <!-- 内部模块依赖 -->
    <!-- Redis模块 - 提供验证码存储与校验 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- 短信服务依赖 -->
    <!-- SMS4J框架 - 提供多平台短信发送支持 -->
    <dependency>
        <groupId>org.dromara.sms4j</groupId>
        <artifactId>sms4j-spring-boot-starter</artifactId>
    </dependency>

    <!-- 测试依赖 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    ruoyi-common-sms                         │
├─────────────────────────────────────────────────────────────┤
│  SmsMessageChannel    PlusSmsDao    SmsExceptionHandler    │
│         │                │                  │               │
│         ▼                ▼                  ▼               │
│  ┌─────────────┐  ┌───────────┐     ┌──────────────┐       │
│  │MessageChannel│  │  SmsDao   │     │@ExceptionHandler│   │
│  │  (core)     │  │  (SMS4J)  │     │              │       │
│  └─────────────┘  └───────────┘     └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │      ruoyi-common-redis      │
          │       (RedisUtils)           │
          └──────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │    sms4j-spring-boot-starter │
          │   (阿里云/腾讯云/华为云...)   │
          └──────────────────────────────┘
```

## 核心组件

### 1. 自动配置类 (SmsAutoConfiguration)

负责模块的自动装配和Bean注册，在Redis配置完成后执行：

```java
@AutoConfiguration(after = {RedisAutoConfiguration.class})
public class SmsAutoConfiguration {

    /**
     * 配置短信数据访问对象
     * 替换SMS4J默认的DAO实现，使用框架统一的Redis工具
     */
    @Primary
    @Bean
    public SmsDao smsDao() {
        return new PlusSmsDao();
    }

    /**
     * 配置短信异常处理器
     * 全局捕获短信相关异常，统一返回格式
     */
    @Bean
    public SmsExceptionHandler smsExceptionHandler() {
        return new SmsExceptionHandler();
    }

    /**
     * 注册短信消息通道
     * 实现统一消息接口，支持通过 MessagePushService 发送短信
     */
    @Bean
    public SmsMessageChannel smsMessageChannel() {
        return new SmsMessageChannel();
    }
}
```

**配置特性:**

| 特性 | 说明 |
|------|------|
| 加载顺序 | 在 `RedisAutoConfiguration` 之后加载 |
| SmsDao | 使用 `@Primary` 覆盖默认实现 |
| 异常处理 | 自动注册全局异常处理器 |
| 消息通道 | 注册到Spring容器，供消息服务自动发现 |

### 2. 短信缓存DAO (PlusSmsDao)

实现SMS4J的SmsDao接口，使用框架统一的RedisUtils工具类：

```java
public class PlusSmsDao implements SmsDao {

    /**
     * 存储键值对，指定过期时间
     * @param key       缓存键
     * @param value     缓存值
     * @param cacheTime 缓存时间（单位：秒）
     */
    @Override
    public void set(String key, Object value, long cacheTime) {
        RedisUtils.setCacheObject(
            GlobalConstants.GLOBAL_REDIS_KEY + key,
            value,
            Duration.ofSeconds(cacheTime)
        );
    }

    /**
     * 存储键值对，永久缓存
     */
    @Override
    public void set(String key, Object value) {
        RedisUtils.setCacheObject(
            GlobalConstants.GLOBAL_REDIS_KEY + key,
            value,
            true  // 永久存储
        );
    }

    /**
     * 根据键获取缓存值
     */
    @Override
    public Object get(String key) {
        return RedisUtils.getCacheObject(GlobalConstants.GLOBAL_REDIS_KEY + key);
    }

    /**
     * 删除指定键的缓存
     */
    @Override
    public Object remove(String key) {
        return RedisUtils.deleteObject(GlobalConstants.GLOBAL_REDIS_KEY + key);
    }

    /**
     * 清空所有短信相关缓存
     * 删除所有以"sms:"开头的缓存键
     */
    @Override
    public void clean() {
        RedisUtils.deleteKeys(GlobalConstants.GLOBAL_REDIS_KEY + "sms:*");
    }
}
```

**缓存键前缀说明:**

所有缓存键自动添加全局前缀 `GlobalConstants.GLOBAL_REDIS_KEY`，默认值为 `global:`，最终缓存键格式为：

```
global:sms:xxx    # 短信相关缓存
global:captcha:xxx # 验证码缓存
```

### 3. 短信消息通道 (SmsMessageChannel)

实现统一消息接口 `MessageChannel`，与消息推送服务集成：

```java
@Slf4j
public class SmsMessageChannel implements MessageChannel {

    @Override
    public String getChannelType() {
        return "sms";
    }

    @Override
    public String getChannelName() {
        return "短信推送";
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

        // 获取手机号
        String phone = (String) context.getParams().get("phone");
        if (StringUtils.isBlank(phone)) {
            return MessageResult.fail(
                context.getMessageId(),
                getChannelType(),
                getUserId(context),
                "PARAM_ERROR",
                "缺少必填参数: params.phone"
            );
        }

        // 获取 SMS4J 实例，默认使用 "config1" 配置
        String configId = (String) context.getParams()
            .getOrDefault("configId", "config1");
        SmsBlend smsBlend = SmsFactory.getSmsBlend(configId);

        // 发送短信
        SmsResponse response;
        String templateId = (String) context.getParams().get("templateId");

        if (StringUtils.isNotBlank(templateId)) {
            // 发送模板短信 (推荐)
            response = smsBlend.sendMessage(phone, templateId);
        } else {
            // 发送普通短信
            if (StringUtils.isBlank(context.getContent())) {
                return MessageResult.fail(...);
            }
            response = smsBlend.sendMessage(phone, context.getContent());
        }

        // 判断发送结果
        if (response != null && response.isSuccess()) {
            MessageResult result = MessageResult.success(
                context.getMessageId(),
                getChannelType(),
                getUserId(context)
            );
            result.setCostTime(System.currentTimeMillis() - startTime);
            if (response.getData() != null) {
                result.setThirdPartyMsgId(response.getData().toString());
            }
            return result;
        } else {
            // 失败处理...
            return MessageResult.fail(...);
        }
    }

    @Override
    public boolean isEnabled() {
        return true;  // 短信通道始终启用
    }

    @Override
    public int getPriority() {
        return 3;  // 短信成本较高，优先级中等
    }

    @Override
    public boolean healthCheck() {
        try {
            SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
            return smsBlend != null;
        } catch (Exception e) {
            log.warn("短信通道健康检查失败", e);
            return false;
        }
    }

    @Override
    public boolean supportTenant(String tenantId) {
        return true;  // 支持所有租户
    }
}
```

**通道特性:**

| 属性 | 值 | 说明 |
|------|-----|------|
| channelType | `sms` | 通道类型标识 |
| channelName | `短信推送` | 通道显示名称 |
| priority | `3` | 优先级（数值越小优先级越高） |
| isEnabled | `true` | 默认启用 |

### 4. 全局异常处理器 (SmsExceptionHandler)

统一处理短信相关异常：

```java
@Slf4j
@RestControllerAdvice
public class SmsExceptionHandler {

    /**
     * 处理短信混合异常
     * 捕获SMS4J框架抛出的短信发送异常
     */
    @ExceptionHandler(SmsBlendException.class)
    public R<Void> handleSmsBlendException(
            SmsBlendException e,
            HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',发生短信发送异常.", requestUri, e);
        return R.fail(HttpStatus.HTTP_INTERNAL_ERROR,
            "短信发送失败，请稍后再试...");
    }
}
```

**异常处理特性:**

- 全局捕获 `SmsBlendException` 异常
- 记录详细错误日志，包含请求URI和完整堆栈
- 返回用户友好的错误提示，隐藏技术细节
- 使用统一的响应格式 `R<Void>`

## 使用指南

### 1. 模块引入

在需要使用短信功能的模块中添加依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-sms</artifactId>
</dependency>
```

### 2. 配置短信服务

在 `application.yml` 中配置SMS4J相关参数：

```yaml
# SMS4J 短信配置
sms:
  # 是否打印短信日志
  is-print: true
  # 全局配置
  restricted:
    # 每日发送限制（0为不限制）
    account-max: 0
    # 每分钟发送限制
    minute-max: 1
    # 是否开启短信限制
    enable: false
  # 短信服务商配置
  blends:
    # 配置名称 config1（默认配置）
    config1:
      # 短信服务商类型
      supplier: alibaba
      # 阿里云配置
      access-key-id: your-access-key-id
      access-key-secret: your-access-key-secret
      # 短信签名
      signature: 若依框架
      # 默认模板ID
      template-id: SMS_123456789
      # SDK应用ID（可选）
      sdk-app-id:
      # 区域（可选）
      region: cn-hangzhou

    # 备用配置（腾讯云）
    config2:
      supplier: tencent
      access-key-id: your-secret-id
      access-key-secret: your-secret-key
      signature: 若依框架
      template-id: 123456
      sdk-app-id: 1400000000
```

### 3. 发送验证码短信

实际业务使用示例（参考 `CaptchaController`）：

```java
@RestController
@RequestMapping("/auth")
public class CaptchaController {

    /**
     * 获取短信验证码
     * 限制每60秒只能发送1次
     */
    @RateLimiter(key = "#phone", time = 60, count = 1)
    @GetMapping("/smsCode")
    public R<Void> smsCode(@NotBlank String phone) {
        // 构建缓存键
        String key = GlobalConstants.CAPTCHA_CODE_KEY + phone;

        // 生成4位随机数字验证码
        String code = RandomUtil.randomNumbers(4);

        // 将验证码存入Redis，有效期2分钟
        RedisUtils.setCacheObject(key, code,
            Duration.ofMinutes(Constants.CAPTCHA_EXPIRATION));

        // 构建短信模板参数
        LinkedHashMap<String, String> map = new LinkedHashMap<>(1);
        map.put("code", code);

        // 获取短信发送服务实例
        SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");

        // 发送模板短信
        String templateId = "SMS_123456789";
        SmsResponse smsResponse = smsBlend.sendMessage(phone, templateId, map);

        // 检查短信发送结果
        if (!smsResponse.isSuccess()) {
            log.error("验证码短信发送异常 => {}", smsResponse);
            return R.fail(smsResponse.getData().toString());
        }

        return R.ok();
    }
}
```

### 4. 通过统一消息服务发送

使用 `MessagePushService` 发送短信（支持智能降级）：

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final MessagePushService messagePushService;

    /**
     * 发送验证码（短信优先，失败降级到邮件）
     */
    public void sendVerifyCode(Long userId, String phone, String code) {
        // 构建消息上下文
        MessageContext context = MessageContext.of(userId, "验证码：" + code)
            .setMessageType("verify_code")
            .setParams(Map.of(
                "phone", phone,
                "templateId", "SMS_123456789",
                "templateParams", Map.of("code", code)
            ));

        // 智能降级发送：短信失败自动切换邮件
        MessageResult result = messagePushService.sendWithFallback(
            List.of("sms", "email"),
            context
        );

        if (!result.isSuccess()) {
            log.error("验证码发送失败: {}", result.getErrorMessage());
        }
    }

    /**
     * 发送重要通知（广播到多个通道）
     */
    public void sendImportantNotice(List<Long> userIds, String content) {
        MessageContext context = MessageContext.ofUsers(userIds, content)
            .setMessageType("important")
            .setParams(Map.of("phone", "13800138000"));

        // 广播发送：同时推送短信、WebSocket、小程序
        List<MessageResult> results = messagePushService.broadcast(
            List.of("sms", "websocket", "miniapp"),
            context
        );

        long successCount = results.stream()
            .filter(MessageResult::isSuccess)
            .count();
        log.info("重要通知发送完成，成功: {}, 失败: {}",
            successCount, results.size() - successCount);
    }
}
```

### 5. 校验验证码

```java
@Service
public class AuthService {

    /**
     * 校验短信验证码
     */
    public boolean verifySmsCode(String phone, String inputCode) {
        String key = GlobalConstants.CAPTCHA_CODE_KEY + phone;
        String cachedCode = RedisUtils.getCacheObject(key);

        if (StringUtils.isBlank(cachedCode)) {
            throw ServiceException.of("验证码已过期");
        }

        if (!cachedCode.equals(inputCode)) {
            throw ServiceException.of("验证码错误");
        }

        // 验证成功后删除缓存
        RedisUtils.deleteObject(key);
        return true;
    }
}
```

## SMS4J 支持的服务商

SMS4J框架支持以下主流短信服务商：

| 服务商 | supplier值 | 说明 |
|--------|-----------|------|
| 阿里云 | `alibaba` | 阿里云短信服务 |
| 腾讯云 | `tencent` | 腾讯云短信服务 |
| 华为云 | `huawei` | 华为云短信服务 |
| 网易云 | `netease` | 网易云信短信 |
| 云片 | `yunpian` | 云片短信 |
| 合一 | `unisms` | 合一短信 |
| 京东云 | `jdcloud` | 京东云短信 |
| 容联云 | `cloopen` | 容联云通讯 |
| 亿美软通 | `emay` | 亿美软通 |

### 阿里云配置示例

```yaml
sms:
  blends:
    config1:
      supplier: alibaba
      access-key-id: LTAI5tXXXXXXXXXXXXXX
      access-key-secret: XXXXXXXXXXXXXXXXXXXXXXX
      signature: 若依框架
      template-id: SMS_123456789
      region: cn-hangzhou
```

### 腾讯云配置示例

```yaml
sms:
  blends:
    config1:
      supplier: tencent
      access-key-id: AKIDxxxxxxxxxxxxxxxxxxxxx
      access-key-secret: xxxxxxxxxxxxxxxxxxxxxxxx
      signature: 若依框架
      template-id: 123456
      sdk-app-id: 1400000000
```

## 消息通道集成

### 消息上下文参数

通过 `SmsMessageChannel` 发送短信时，`MessageContext.params` 支持以下参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | String | 是 | 接收手机号 |
| `templateId` | String | 否 | 短信模板ID |
| `templateParams` | Map | 否 | 模板变量 |
| `configId` | String | 否 | SMS4J配置名，默认 `config1` |

### 使用示例

```java
// 方式1: 发送纯文本短信
MessageContext context = MessageContext.of(userId, "您的验证码是123456")
    .setParams(Map.of("phone", "13800138000"));

// 方式2: 发送模板短信（推荐）
MessageContext context = MessageContext.ofParams(userId, Map.of(
    "phone", "13800138000",
    "templateId", "SMS_123456",
    "templateParams", Map.of("code", "123456")
));

// 通过消息服务发送
MessageResult result = messagePushService.send("sms", context);
```

### 智能降级策略

根据消息类型自动选择通道策略：

| 消息类型 | 通道优先级 | 说明 |
|---------|-----------|------|
| `verify_code` | sms → email | 验证码优先短信 |
| `order` | websocket → miniapp → mp | 订单通知优先实时推送 |
| `promotion` | miniapp → mp → sms | 营销消息优先小程序 |
| `important` | sms → websocket → miniapp → mp | 重要通知全部尝试 |

## 最佳实践

### 1. 验证码安全

```java
@Service
public class SecureSmsService {

    // 验证码有效期（分钟）
    private static final int CODE_EXPIRE_MINUTES = 5;

    // 发送间隔（秒）
    private static final int SEND_INTERVAL_SECONDS = 60;

    /**
     * 安全发送验证码
     */
    public void sendVerifyCodeSecurely(String phone) {
        // 1. 检查发送频率
        String intervalKey = "sms:interval:" + phone;
        if (RedisUtils.hasKey(intervalKey)) {
            throw ServiceException.of("请稍后再试");
        }

        // 2. 检查每日发送次数
        String countKey = "sms:count:" + phone;
        Integer count = RedisUtils.getCacheObject(countKey);
        if (count != null && count >= 10) {
            throw ServiceException.of("今日发送次数已达上限");
        }

        // 3. 生成验证码
        String code = RandomUtil.randomNumbers(6);

        // 4. 发送短信
        SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
        LinkedHashMap<String, String> params = new LinkedHashMap<>();
        params.put("code", code);
        SmsResponse response = smsBlend.sendMessage(phone, "SMS_123456", params);

        if (!response.isSuccess()) {
            throw ServiceException.of("短信发送失败");
        }

        // 5. 缓存验证码
        String codeKey = GlobalConstants.CAPTCHA_CODE_KEY + phone;
        RedisUtils.setCacheObject(codeKey, code,
            Duration.ofMinutes(CODE_EXPIRE_MINUTES));

        // 6. 设置发送间隔
        RedisUtils.setCacheObject(intervalKey, 1,
            Duration.ofSeconds(SEND_INTERVAL_SECONDS));

        // 7. 增加发送计数
        RedisUtils.setCacheObject(countKey, (count == null ? 0 : count) + 1,
            Duration.ofDays(1));
    }
}
```

### 2. 异步发送短信

```java
@Service
@RequiredArgsConstructor
public class AsyncSmsService {

    private final ThreadPoolTaskExecutor taskExecutor;

    /**
     * 异步发送短信，避免阻塞主流程
     */
    @Async
    public CompletableFuture<Boolean> sendAsync(String phone, String content) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
                SmsResponse response = smsBlend.sendMessage(phone, content);
                return response.isSuccess();
            } catch (Exception e) {
                log.error("异步短信发送失败: phone={}", phone, e);
                return false;
            }
        }, taskExecutor);
    }
}
```

### 3. 多配置切换

```java
@Service
public class MultiConfigSmsService {

    /**
     * 根据业务场景选择不同配置
     */
    public void sendByScene(String phone, String content, String scene) {
        String configId = switch (scene) {
            case "marketing" -> "config2";  // 营销短信使用备用通道
            case "verify" -> "config1";     // 验证码使用主通道
            case "notice" -> "config3";     // 通知短信使用第三通道
            default -> "config1";
        };

        SmsBlend smsBlend = SmsFactory.getSmsBlend(configId);
        SmsResponse response = smsBlend.sendMessage(phone, content);

        if (!response.isSuccess()) {
            // 主通道失败，尝试备用通道
            log.warn("{}通道发送失败，尝试备用通道", configId);
            smsBlend = SmsFactory.getSmsBlend("backup");
            smsBlend.sendMessage(phone, content);
        }
    }
}
```

### 4. 批量发送优化

```java
@Service
public class BatchSmsService {

    /**
     * 批量发送短信（支持并发控制）
     */
    public Map<String, Boolean> sendBatch(
            List<String> phones,
            String templateId,
            Map<String, String> params) {

        Map<String, Boolean> results = new ConcurrentHashMap<>();
        SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");

        // 使用并行流发送，控制并发数
        phones.parallelStream()
            .forEach(phone -> {
                try {
                    SmsResponse response = smsBlend.sendMessage(
                        phone, templateId, new LinkedHashMap<>(params));
                    results.put(phone, response.isSuccess());
                } catch (Exception e) {
                    log.error("发送失败: phone={}", phone, e);
                    results.put(phone, false);
                }
            });

        return results;
    }
}
```

## 常见问题

### Q1: 短信发送失败，提示"签名不存在"？

**原因:**
- 短信签名未在服务商控制台申请
- 签名与配置不匹配
- 签名审核未通过

**解决方案:**
1. 登录短信服务商控制台，检查签名状态
2. 确保配置文件中的 `signature` 与已审核通过的签名一致
3. 等待签名审核通过后再发送

### Q2: 验证码收不到？

**可能原因:**
- 手机号被运营商拦截（营销短信拦截）
- 短信服务商网络延迟
- 验证码已过期被清理
- 发送频率过高被限制

**解决方案:**
```java
// 检查缓存中是否存在验证码
String key = GlobalConstants.CAPTCHA_CODE_KEY + phone;
String code = RedisUtils.getCacheObject(key);
if (code == null) {
    log.warn("验证码不存在或已过期: phone={}", phone);
}

// 检查发送记录
SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
// SMS4J 会自动记录发送日志
```

### Q3: 如何切换不同的短信服务商？

**解决方案:**
```yaml
# 方式1: 修改配置文件
sms:
  blends:
    config1:
      supplier: tencent  # 改为腾讯云
      # ... 其他配置

# 方式2: 多配置动态切换
sms:
  blends:
    alibaba:
      supplier: alibaba
      # ...
    tencent:
      supplier: tencent
      # ...
```

```java
// 代码中动态选择
String configId = needHighReliability ? "tencent" : "alibaba";
SmsBlend smsBlend = SmsFactory.getSmsBlend(configId);
```

### Q4: 如何处理短信发送超时？

**解决方案:**
```java
@Service
public class TimeoutSmsService {

    public void sendWithTimeout(String phone, String content) {
        CompletableFuture<SmsResponse> future = CompletableFuture
            .supplyAsync(() -> {
                SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
                return smsBlend.sendMessage(phone, content);
            });

        try {
            // 设置5秒超时
            SmsResponse response = future.get(5, TimeUnit.SECONDS);
            if (!response.isSuccess()) {
                log.error("短信发送失败: {}", response);
            }
        } catch (TimeoutException e) {
            log.error("短信发送超时: phone={}", phone);
            future.cancel(true);
            throw ServiceException.of("短信发送超时，请稍后重试");
        } catch (Exception e) {
            log.error("短信发送异常", e);
            throw ServiceException.of("短信发送失败");
        }
    }
}
```

### Q5: Redis连接异常导致短信发送失败？

**解决方案:**
```java
@Service
public class FallbackSmsService {

    public void sendWithFallback(String phone, String code) {
        try {
            // 尝试使用Redis缓存验证码
            String key = GlobalConstants.CAPTCHA_CODE_KEY + phone;
            RedisUtils.setCacheObject(key, code, Duration.ofMinutes(5));
        } catch (Exception e) {
            log.warn("Redis缓存失败，使用本地缓存", e);
            // 降级到本地缓存
            LocalCache.put(phone, code, 5, TimeUnit.MINUTES);
        }

        // 发送短信
        SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
        smsBlend.sendMessage(phone, code);
    }
}
```

## 监控与日志

### 开启详细日志

```yaml
sms:
  # 是否打印短信日志
  is-print: true

logging:
  level:
    org.dromara.sms4j: DEBUG
    plus.ruoyi.common.sms: DEBUG
```

### 监控指标

建议监控以下指标：

- **发送成功率**: 成功发送数 / 总发送数
- **平均响应时间**: 短信API调用耗时
- **失败原因分布**: 按错误码分类统计
- **每日发送量**: 按服务商、模板分类统计

```java
@Aspect
@Component
public class SmsMonitorAspect {

    private final MeterRegistry meterRegistry;

    @Around("execution(* org.dromara.sms4j.api.SmsBlend.sendMessage(..))")
    public Object monitorSms(ProceedingJoinPoint pjp) throws Throwable {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            Object result = pjp.proceed();
            SmsResponse response = (SmsResponse) result;

            // 记录成功/失败计数
            meterRegistry.counter("sms.send",
                "result", response.isSuccess() ? "success" : "fail",
                "configId", response.getConfigId()
            ).increment();

            return result;
        } finally {
            // 记录耗时
            sample.stop(meterRegistry.timer("sms.send.duration"));
        }
    }
}
```

## 注意事项

### 1. 短信内容规范

- **签名要求**: 短信签名必须在服务商控制台申请并通过审核
- **模板审核**: 短信模板需要提前申请，变量使用 `${code}` 格式
- **内容限制**: 避免敏感词汇，营销类短信需要添加退订方式
- **字数限制**: 单条短信一般限制 70 个字符（含签名）

### 2. 发送频率控制

| 限制类型 | 建议值 | 说明 |
|---------|--------|------|
| 同一号码间隔 | 60秒 | 防止恶意刷短信 |
| 每日发送上限 | 10条/号码 | 控制成本和防骚扰 |
| 每分钟发送量 | 100条 | 服务商 API 限制 |
| IP 发送限制 | 1000条/小时 | 防止接口被滥用 |

### 3. 安全建议

```java
// ✅ 推荐：使用模板短信，避免注入攻击
smsBlend.sendMessage(phone, templateId, Map.of("code", code));

// ❌ 避免：直接拼接用户输入到短信内容
String content = "您的验证码是：" + userInput;  // 有安全风险
smsBlend.sendMessage(phone, content);
```

### 4. 成本优化

- **合并发送**: 相同内容批量发送时使用批量接口
- **通道选择**: 验证码使用低价通道，营销使用高到达率通道
- **失败重试**: 设置合理的重试次数（建议 2-3 次）
- **缓存策略**: 验证码缓存时间不宜过长（建议 5 分钟）

## 完整配置参考

### 开发环境配置 (application-dev.yml)

```yaml
sms:
  # 配置源类型用于标定配置来源(interface,yaml)
  config-type: yaml
  # 用于标定yml中的配置是否开启短信拦截，接口配置不受此限制
  restricted: true
  # 短信拦截限制单手机号每分钟最大发送，只对开启了拦截的配置有效
  minute-max: 1
  # 短信拦截限制单手机号每日最大发送量，只对开启了拦截的配置有效
  account-max: 30
  # 以下配置来自于 org.dromara.sms4j.provider.config.BaseConfig类中
  blends:
    # 唯一ID 用于发送短信寻找具体配置 随便定义别用中文即可
    # 可以同时存在两个相同厂商 例如: ali1 ali2 两个不同的阿里短信账号 也可用于区分租户
    config1:
      # 框架定义的厂商名称标识，标定此配置是哪个厂商
      supplier: alibaba
      # 有些称为accessKey有些称之为apiKey，也有称为sdkKey或者appId
      access-key-id: ${SMS_ALI_ACCESS_KEY:您的accessKey}
      # 称为accessSecret有些称之为apiSecret
      access-key-secret: ${SMS_ALI_ACCESS_SECRET:您的accessKeySecret}
      signature: ${SMS_ALI_SIGNATURE:您的短信签名}
      sdk-app-id: ${SMS_ALI_SDK_APP_ID:您的sdkAppId}
    config2:
      # 厂商标识，标定此配置是哪个厂商
      supplier: tencent
      access-key-id: ${SMS_TENCENT_ACCESS_KEY:您的accessKey}
      access-key-secret: ${SMS_TENCENT_ACCESS_SECRET:您的accessKeySecret}
      signature: ${SMS_TENCENT_SIGNATURE:您的短信签名}
      sdk-app-id: ${SMS_TENCENT_SDK_APP_ID:您的sdkAppId}
```

### 生产环境配置 (application-prod.yml)

```yaml
sms:
  # 配置源类型用于标定配置来源(interface,yaml)
  config-type: yaml
  # 用于标定yml中的配置是否开启短信拦截，接口配置不受此限制
  restricted: true
  # 生产环境短信发送频率限制
  minute-max: ${SMS_MINUTE_MAX:1}
  # 生产环境单用户每日短信限额
  account-max: ${SMS_ACCOUNT_MAX:30}
  # 以下配置来自于 org.dromara.sms4j.provider.config.BaseConfig类中
  blends:
    # 阿里云短信配置 - 所有敏感信息通过环境变量提供
    config1:
      supplier: alibaba
      access-key-id: ${SMS_ALI_ACCESS_KEY}
      access-key-secret: ${SMS_ALI_ACCESS_SECRET}
      signature: ${SMS_ALI_SIGNATURE}
      sdk-app-id: ${SMS_ALI_SDK_APP_ID}
    # 腾讯云短信配置 - 所有敏感信息通过环境变量提供
    config2:
      supplier: tencent
      access-key-id: ${SMS_TENCENT_ACCESS_KEY}
      access-key-secret: ${SMS_TENCENT_ACCESS_SECRET}
      signature: ${SMS_TENCENT_SIGNATURE}
      sdk-app-id: ${SMS_TENCENT_SDK_APP_ID}
```

### 环境变量配置表

| 环境变量 | 说明 | 示例值 |
|---------|------|--------|
| `SMS_ALI_ACCESS_KEY` | 阿里云 AccessKey ID | `LTAI5tXXXXXXXXXX` |
| `SMS_ALI_ACCESS_SECRET` | 阿里云 AccessKey Secret | `XXXXXXXXXXXXXX` |
| `SMS_ALI_SIGNATURE` | 阿里云短信签名 | `若依框架` |
| `SMS_ALI_SDK_APP_ID` | 阿里云 SDK AppId（可选） | - |
| `SMS_TENCENT_ACCESS_KEY` | 腾讯云 SecretId | `AKIDxxxxxx` |
| `SMS_TENCENT_ACCESS_SECRET` | 腾讯云 SecretKey | `xxxxxxxx` |
| `SMS_TENCENT_SIGNATURE` | 腾讯云短信签名 | `若依框架` |
| `SMS_TENCENT_SDK_APP_ID` | 腾讯云 SDK AppId | `1400000000` |
| `SMS_MINUTE_MAX` | 每分钟发送限制 | `1` |
| `SMS_ACCOUNT_MAX` | 每日发送限额 | `30` |

## SMS4J 配置参数详解

### 全局配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config-type` | String | `yaml` | 配置源类型：`yaml`(配置文件) 或 `interface`(数据库) |
| `restricted` | boolean | `false` | 是否开启短信发送拦截 |
| `minute-max` | int | `0` | 每分钟最大发送数（0表示不限制） |
| `account-max` | int | `0` | 每日最大发送数（0表示不限制） |
| `is-print` | boolean | `false` | 是否打印短信发送日志 |
| `core-pool-size` | int | `10` | 异步发送线程池核心线程数 |
| `max-pool-size` | int | `30` | 异步发送线程池最大线程数 |
| `queue-capacity` | int | `50` | 异步发送队列容量 |

### 服务商配置参数 (blends.xxx)

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `supplier` | String | 是 | 服务商标识（详见支持的服务商列表） |
| `access-key-id` | String | 是 | 访问密钥ID |
| `access-key-secret` | String | 是 | 访问密钥 |
| `signature` | String | 是 | 短信签名（需要在服务商控制台申请） |
| `template-id` | String | 否 | 默认模板ID |
| `sdk-app-id` | String | 部分 | SDK应用ID（腾讯云必填） |
| `region` | String | 否 | 区域（阿里云默认 `cn-hangzhou`） |
| `retry-count` | int | 否 | 失败重试次数，默认 `0` |
| `retry-interval` | long | 否 | 重试间隔（毫秒），默认 `1000` |

## 更多服务商配置

### 华为云短信

```yaml
sms:
  blends:
    huawei:
      supplier: huawei
      # 华为云APP接入地址
      access-key-id: ${HUAWEI_APP_KEY}
      access-key-secret: ${HUAWEI_APP_SECRET}
      # 短信签名通道号
      signature: ${HUAWEI_SIGNATURE}
      # 国内短信发送地址
      sdk-app-id: ${HUAWEI_SENDER}
      # 可选：状态报告回调地址
      # callback-url: https://your-domain.com/sms/callback
```

### 网易云信

```yaml
sms:
  blends:
    netease:
      supplier: netease
      access-key-id: ${NETEASE_APP_KEY}
      access-key-secret: ${NETEASE_APP_SECRET}
      # 网易云信需要设置模板ID
      template-id: ${NETEASE_TEMPLATE_ID}
```

### 云片短信

```yaml
sms:
  blends:
    yunpian:
      supplier: yunpian
      # 云片API Key
      access-key-id: ${YUNPIAN_API_KEY}
      # 云片不需要签名，签名在模板中
      signature: ""
```

### 合一短信 (UniSMS)

```yaml
sms:
  blends:
    unisms:
      supplier: unisms
      access-key-id: ${UNISMS_ACCESS_KEY}
      access-key-secret: ${UNISMS_ACCESS_SECRET}
      signature: ${UNISMS_SIGNATURE}
```

### 容联云通讯

```yaml
sms:
  blends:
    cloopen:
      supplier: cloopen
      # 账户SID
      access-key-id: ${CLOOPEN_ACCOUNT_SID}
      # Auth Token
      access-key-secret: ${CLOOPEN_AUTH_TOKEN}
      # 应用ID
      sdk-app-id: ${CLOOPEN_APP_ID}
```

### 京东云短信

```yaml
sms:
  blends:
    jdcloud:
      supplier: jdcloud
      access-key-id: ${JD_ACCESS_KEY}
      access-key-secret: ${JD_SECRET_KEY}
      signature: ${JD_SIGNATURE}
      # 地域
      region: cn-north-1
```

## 验证码短信完整流程

### 发送验证码 API 实现

验证码发送接口完整实现（来自 `CaptchaController`）：

```java
/**
 * 获取短信验证码
 * 生成随机验证码并发送到指定手机号，限制每60秒只能发送1次
 *
 * @param phone 用户手机号
 * @return 发送结果
 */
@RateLimiter(key = "#phone", time = 60, count = 1)
@GetMapping("/smsCode")
public R<Void> smsCode(@NotBlank(message = I18nKeys.User.PHONE_REQUIRED) String phone) {
    // 构建缓存键，用于存储验证码
    String key = GlobalConstants.CAPTCHA_CODE_KEY + phone;
    // 生成4位随机数字验证码
    String code = RandomUtil.randomNumbers(4);
    // 将验证码存入Redis，有效期为配置的过期时间（默认为2分钟）
    RedisUtils.setCacheObject(key, code, Duration.ofMinutes(Constants.CAPTCHA_EXPIRATION));

    // 验证码模板ID，实际项目中应从配置或数据库中获取
    String templateId = "";
    // 构建短信模板参数，将验证码放入map中
    LinkedHashMap<String, String> map = new LinkedHashMap<>(1);
    map.put("code", code);

    // 获取短信发送服务实例
    SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
    // 发送短信
    SmsResponse smsResponse = smsBlend.sendMessage(phone, templateId, map);

    // 检查短信发送结果
    if (!smsResponse.isSuccess()) {
        // 发送失败时记录日志
        log.error("验证码短信发送异常 => {}", smsResponse);
        // 返回发送失败信息
        return R.fail(smsResponse.getData().toString());
    }

    // 发送成功返回
    return R.ok();
}
```

**实现要点:**

1. **限流控制**: 使用 `@RateLimiter` 注解限制每个手机号每 60 秒只能发送 1 次
2. **验证码生成**: 使用 Hutool 的 `RandomUtil.randomNumbers(4)` 生成 4 位数字验证码
3. **缓存存储**: 验证码存入 Redis，有效期 2 分钟（`Constants.CAPTCHA_EXPIRATION`）
4. **模板参数**: 使用 `LinkedHashMap` 保持参数顺序
5. **错误处理**: 发送失败时记录日志并返回错误信息

### 验证码校验流程

```java
@Service
@RequiredArgsConstructor
public class SmsLoginService {

    /**
     * 短信验证码登录
     */
    public LoginUser smsLogin(String phone, String code) {
        // 1. 校验验证码
        String cacheKey = GlobalConstants.CAPTCHA_CODE_KEY + phone;
        String cachedCode = RedisUtils.getCacheObject(cacheKey);

        if (StringUtils.isBlank(cachedCode)) {
            throw ServiceException.of("验证码已过期，请重新获取");
        }

        if (!cachedCode.equals(code)) {
            // 验证失败，记录错误次数
            recordFailCount(phone);
            throw ServiceException.of("验证码错误");
        }

        // 2. 验证成功，删除验证码
        RedisUtils.deleteObject(cacheKey);

        // 3. 查询用户信息
        SysUser user = userService.selectUserByPhone(phone);
        if (user == null) {
            // 用户不存在，可以选择自动注册或提示错误
            throw ServiceException.of("该手机号未注册");
        }

        // 4. 构建登录用户信息
        return buildLoginUser(user);
    }

    /**
     * 记录验证码错误次数，防止暴力破解
     */
    private void recordFailCount(String phone) {
        String failKey = "sms:fail:" + phone;
        Integer failCount = RedisUtils.getCacheObject(failKey);
        failCount = (failCount == null) ? 1 : failCount + 1;

        // 超过5次锁定30分钟
        if (failCount >= 5) {
            RedisUtils.setCacheObject(failKey, failCount, Duration.ofMinutes(30));
            throw ServiceException.of("验证码错误次数过多，请30分钟后再试");
        }

        RedisUtils.setCacheObject(failKey, failCount, Duration.ofMinutes(5));
    }
}
```

## 订单通知短信实战

### 订单状态变更通知

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderNotifyService {

    private final MessagePushService messagePushService;

    /**
     * 订单支付成功通知
     */
    public void notifyPaySuccess(Order order) {
        // 构建模板参数
        Map<String, String> params = new LinkedHashMap<>();
        params.put("orderNo", order.getOrderNo());
        params.put("amount", order.getAmount().toString());
        params.put("time", DateUtil.format(order.getPayTime(), "MM-dd HH:mm"));

        // 发送短信
        sendOrderSms(order.getUserPhone(), "SMS_PAY_SUCCESS", params);

        // 同时推送 WebSocket（如果用户在线）
        pushOrderMessage(order.getUserId(), "订单支付成功", buildPaySuccessContent(order));
    }

    /**
     * 订单发货通知
     */
    public void notifyShipped(Order order, String expressNo) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("orderNo", order.getOrderNo());
        params.put("expressNo", expressNo);
        params.put("expressName", order.getExpressName());

        sendOrderSms(order.getUserPhone(), "SMS_ORDER_SHIPPED", params);
    }

    /**
     * 订单即将超时提醒
     */
    public void notifyPaymentTimeout(Order order, int remainMinutes) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("orderNo", order.getOrderNo());
        params.put("minutes", String.valueOf(remainMinutes));
        params.put("amount", order.getAmount().toString());

        sendOrderSms(order.getUserPhone(), "SMS_PAY_TIMEOUT_REMIND", params);
    }

    /**
     * 发送订单相关短信
     */
    private void sendOrderSms(String phone, String templateId, Map<String, String> params) {
        try {
            SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
            SmsResponse response = smsBlend.sendMessage(phone, templateId, new LinkedHashMap<>(params));

            if (!response.isSuccess()) {
                log.error("订单短信发送失败: phone={}, template={}, error={}",
                    phone, templateId, response.getData());
                // 发送失败不抛异常，避免影响业务流程
            } else {
                log.info("订单短信发送成功: phone={}, template={}", phone, templateId);
            }
        } catch (Exception e) {
            log.error("订单短信发送异常: phone={}", phone, e);
        }
    }

    /**
     * 通过统一消息服务推送（支持智能降级）
     */
    private void pushOrderMessage(Long userId, String title, String content) {
        MessageContext context = MessageContext.of(userId, content)
            .setTitle(title)
            .setMessageType("order_notify");

        // 先尝试 WebSocket，失败则降级到短信
        messagePushService.sendWithFallback(
            List.of("websocket", "sms"),
            context
        );
    }
}
```

### 阿里云短信模板示例

```text
模板ID: SMS_PAY_SUCCESS
模板内容: 您的订单${orderNo}已支付成功，金额${amount}元，支付时间${time}。

模板ID: SMS_ORDER_SHIPPED
模板内容: 您的订单${orderNo}已发货，${expressName}快递单号：${expressNo}，请注意查收。

模板ID: SMS_PAY_TIMEOUT_REMIND
模板内容: 您的订单${orderNo}（金额${amount}元）将在${minutes}分钟后关闭，请尽快完成支付。
```

## 营销短信发送

### 营销短信服务

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class MarketingSmsService {

    /**
     * 发送营销短信（需要用户授权）
     */
    @Async
    public void sendMarketingSms(List<String> phones, String templateId, Map<String, String> params) {
        // 营销短信使用备用通道，避免影响验证码通道
        SmsBlend smsBlend = SmsFactory.getSmsBlend("marketing");

        // 统计发送结果
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        // 控制发送速率，每秒最多发送10条
        RateLimiter rateLimiter = RateLimiter.create(10);

        for (String phone : phones) {
            // 等待令牌
            rateLimiter.acquire();

            try {
                // 检查用户是否退订
                if (isUnsubscribed(phone)) {
                    log.debug("用户已退订营销短信: {}", phone);
                    continue;
                }

                SmsResponse response = smsBlend.sendMessage(phone, templateId, new LinkedHashMap<>(params));

                if (response.isSuccess()) {
                    successCount.incrementAndGet();
                } else {
                    failCount.incrementAndGet();
                    log.warn("营销短信发送失败: phone={}, error={}", phone, response.getData());
                }
            } catch (Exception e) {
                failCount.incrementAndGet();
                log.error("营销短信发送异常: phone={}", phone, e);
            }
        }

        log.info("营销短信发送完成: 成功={}, 失败={}, 总数={}",
            successCount.get(), failCount.get(), phones.size());
    }

    /**
     * 检查用户是否退订
     */
    private boolean isUnsubscribed(String phone) {
        String key = "sms:unsubscribe:" + phone;
        return RedisUtils.hasKey(key);
    }

    /**
     * 用户退订营销短信
     */
    public void unsubscribe(String phone) {
        String key = "sms:unsubscribe:" + phone;
        RedisUtils.setCacheObject(key, 1, true); // 永久存储
        log.info("用户退订营销短信: {}", phone);
    }

    /**
     * 用户重新订阅
     */
    public void resubscribe(String phone) {
        String key = "sms:unsubscribe:" + phone;
        RedisUtils.deleteObject(key);
        log.info("用户重新订阅营销短信: {}", phone);
    }
}
```

### 营销短信配置

```yaml
sms:
  blends:
    # 营销短信专用通道（与验证码通道分离）
    marketing:
      supplier: alibaba
      access-key-id: ${SMS_MARKETING_ACCESS_KEY}
      access-key-secret: ${SMS_MARKETING_ACCESS_SECRET}
      signature: ${SMS_MARKETING_SIGNATURE}
      # 营销短信模板需要包含退订方式
      # 模板示例：【若依商城】${content}，回复TD退订。
```

## 多租户短信配置

### 租户级别短信配置

```java
@Service
@RequiredArgsConstructor
public class TenantSmsService {

    /**
     * 根据租户获取短信配置
     */
    public SmsBlend getSmsBlend(String tenantId) {
        // 优先使用租户专属配置
        String configId = "tenant_" + tenantId;
        try {
            return SmsFactory.getSmsBlend(configId);
        } catch (Exception e) {
            // 租户无专属配置，使用默认配置
            return SmsFactory.getSmsBlend("config1");
        }
    }

    /**
     * 发送短信（自动选择租户配置）
     */
    public void sendSms(String phone, String templateId, Map<String, String> params) {
        String tenantId = TenantHelper.getTenantId();
        SmsBlend smsBlend = getSmsBlend(tenantId);

        SmsResponse response = smsBlend.sendMessage(phone, templateId, new LinkedHashMap<>(params));

        if (!response.isSuccess()) {
            throw ServiceException.of("短信发送失败: " + response.getData());
        }
    }
}
```

### 租户短信配置示例

```yaml
sms:
  blends:
    # 默认配置
    config1:
      supplier: alibaba
      access-key-id: ${SMS_DEFAULT_ACCESS_KEY}
      access-key-secret: ${SMS_DEFAULT_ACCESS_SECRET}
      signature: 若依平台

    # 租户A专属配置
    tenant_100001:
      supplier: tencent
      access-key-id: ${SMS_TENANT_A_ACCESS_KEY}
      access-key-secret: ${SMS_TENANT_A_ACCESS_SECRET}
      signature: 租户A商城
      sdk-app-id: ${SMS_TENANT_A_SDK_APP_ID}

    # 租户B专属配置
    tenant_100002:
      supplier: alibaba
      access-key-id: ${SMS_TENANT_B_ACCESS_KEY}
      access-key-secret: ${SMS_TENANT_B_ACCESS_SECRET}
      signature: 租户B平台
```

## 国际短信支持

### 国际短信发送

```java
@Service
public class InternationalSmsService {

    /**
     * 发送国际短信
     *
     * @param countryCode 国家代码（如：+86, +1, +44）
     * @param phone 手机号（不含国家代码）
     * @param content 短信内容
     */
    public void sendInternationalSms(String countryCode, String phone, String content) {
        // 完整手机号（带国家代码）
        String fullPhone = countryCode + phone;

        // 根据国家代码选择合适的通道
        String configId = getConfigByCountry(countryCode);
        SmsBlend smsBlend = SmsFactory.getSmsBlend(configId);

        SmsResponse response = smsBlend.sendMessage(fullPhone, content);

        if (!response.isSuccess()) {
            throw ServiceException.of("国际短信发送失败: " + response.getData());
        }
    }

    /**
     * 根据国家代码选择短信通道
     */
    private String getConfigByCountry(String countryCode) {
        return switch (countryCode) {
            case "+86" -> "china";      // 中国大陆
            case "+852", "+853", "+886" -> "hmt";  // 港澳台
            case "+1" -> "america";     // 美国/加拿大
            case "+44" -> "europe";     // 英国
            default -> "international"; // 其他国家使用国际通道
        };
    }
}
```

### 国际短信配置

```yaml
sms:
  blends:
    # 中国大陆短信
    china:
      supplier: alibaba
      access-key-id: ${SMS_CHINA_ACCESS_KEY}
      access-key-secret: ${SMS_CHINA_ACCESS_SECRET}
      signature: 若依框架

    # 港澳台短信
    hmt:
      supplier: alibaba
      access-key-id: ${SMS_HMT_ACCESS_KEY}
      access-key-secret: ${SMS_HMT_ACCESS_SECRET}
      signature: RuoYi
      region: cn-hongkong

    # 国际短信通道
    international:
      supplier: twilio
      access-key-id: ${TWILIO_ACCOUNT_SID}
      access-key-secret: ${TWILIO_AUTH_TOKEN}
      # Twilio 发送号码
      sdk-app-id: ${TWILIO_FROM_NUMBER}
```

## 短信发送日志

### 短信日志记录

```java
@Aspect
@Component
@Slf4j
public class SmsLogAspect {

    @Autowired
    private SmsLogRepository smsLogRepository;

    @Around("execution(* org.dromara.sms4j.api.SmsBlend.sendMessage(..))")
    public Object logSmsSend(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object[] args = pjp.getArgs();
        String phone = (String) args[0];

        SmsLog smsLog = new SmsLog();
        smsLog.setPhone(desensitizePhone(phone));
        smsLog.setSendTime(LocalDateTime.now());
        smsLog.setTenantId(TenantHelper.getTenantId());

        try {
            Object result = pjp.proceed();
            SmsResponse response = (SmsResponse) result;

            smsLog.setSuccess(response.isSuccess());
            smsLog.setConfigId(response.getConfigId());
            smsLog.setResponse(response.getData() != null ? response.getData().toString() : null);
            smsLog.setCostTime(System.currentTimeMillis() - startTime);

            return result;
        } catch (Exception e) {
            smsLog.setSuccess(false);
            smsLog.setErrorMsg(e.getMessage());
            throw e;
        } finally {
            // 异步保存日志
            saveLogAsync(smsLog);
        }
    }

    /**
     * 手机号脱敏（保留前3后4）
     */
    private String desensitizePhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    @Async
    void saveLogAsync(SmsLog smsLog) {
        try {
            smsLogRepository.save(smsLog);
        } catch (Exception e) {
            log.error("保存短信日志失败", e);
        }
    }
}
```

### 短信日志实体

```java
@Data
@TableName("sys_sms_log")
public class SmsLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 手机号（脱敏后） */
    private String phone;

    /** 短信配置ID */
    private String configId;

    /** 是否发送成功 */
    private Boolean success;

    /** 响应内容 */
    private String response;

    /** 错误信息 */
    private String errorMsg;

    /** 耗时（毫秒） */
    private Long costTime;

    /** 发送时间 */
    private LocalDateTime sendTime;

    /** 租户ID */
    private String tenantId;
}
```

## 高可用配置

### 多通道故障转移

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class HighAvailabilitySmsService {

    private static final List<String> SMS_CHANNELS = List.of("alibaba", "tencent", "huawei");

    /**
     * 高可用短信发送（自动故障转移）
     */
    public void sendWithFailover(String phone, String templateId, Map<String, String> params) {
        Exception lastException = null;

        for (String channel : SMS_CHANNELS) {
            try {
                // 检查通道健康状态
                if (!isChannelHealthy(channel)) {
                    log.warn("短信通道 {} 不健康，跳过", channel);
                    continue;
                }

                SmsBlend smsBlend = SmsFactory.getSmsBlend(channel);
                SmsResponse response = smsBlend.sendMessage(phone, templateId, new LinkedHashMap<>(params));

                if (response.isSuccess()) {
                    log.info("短信发送成功: channel={}, phone={}", channel, phone);
                    return;
                } else {
                    log.warn("短信通道 {} 发送失败: {}", channel, response.getData());
                    markChannelUnhealthy(channel);
                }
            } catch (Exception e) {
                log.error("短信通道 {} 异常", channel, e);
                lastException = e;
                markChannelUnhealthy(channel);
            }
        }

        // 所有通道都失败
        throw new ServiceException("短信发送失败，所有通道不可用", lastException);
    }

    /**
     * 检查通道健康状态
     */
    private boolean isChannelHealthy(String channel) {
        String key = "sms:unhealthy:" + channel;
        return !RedisUtils.hasKey(key);
    }

    /**
     * 标记通道不健康（熔断5分钟）
     */
    private void markChannelUnhealthy(String channel) {
        String key = "sms:unhealthy:" + channel;
        RedisUtils.setCacheObject(key, 1, Duration.ofMinutes(5));
    }
}
```

### 短信发送监控告警

```java
@Component
@Slf4j
public class SmsMonitor {

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private AlertService alertService;

    /**
     * 记录短信发送指标
     */
    public void recordSmsMetrics(String channel, boolean success, long costTime) {
        // 发送计数
        meterRegistry.counter("sms.send.total",
            "channel", channel,
            "result", success ? "success" : "fail"
        ).increment();

        // 发送耗时
        meterRegistry.timer("sms.send.duration", "channel", channel)
            .record(costTime, TimeUnit.MILLISECONDS);

        // 失败率告警
        checkFailureRate(channel);
    }

    /**
     * 检查失败率，超过阈值告警
     */
    private void checkFailureRate(String channel) {
        String successKey = "sms:metrics:" + channel + ":success";
        String failKey = "sms:metrics:" + channel + ":fail";

        Long successCount = RedisUtils.getCacheObject(successKey);
        Long failCount = RedisUtils.getCacheObject(failKey);

        if (successCount == null) successCount = 0L;
        if (failCount == null) failCount = 0L;

        long total = successCount + failCount;
        if (total >= 100) {
            double failRate = (double) failCount / total;
            if (failRate > 0.1) { // 失败率超过10%
                alertService.sendAlert(
                    "短信通道告警",
                    String.format("短信通道 %s 失败率过高: %.2f%%", channel, failRate * 100)
                );
            }
        }
    }
}
```

## 短信模板管理

### 数据库存储短信模板

```java
@Data
@TableName("sys_sms_template")
public class SmsTemplate {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 模板编码（业务标识） */
    private String code;

    /** 模板名称 */
    private String name;

    /** 服务商模板ID */
    private String templateId;

    /** 短信服务商 */
    private String supplier;

    /** 配置ID */
    private String configId;

    /** 模板内容（预览用） */
    private String content;

    /** 模板变量（JSON格式） */
    private String variables;

    /** 状态（0正常 1停用） */
    private Integer status;

    /** 租户ID */
    private String tenantId;
}
```

### 模板服务

```java
@Service
@RequiredArgsConstructor
public class SmsTemplateService {

    private final SmsTemplateMapper templateMapper;

    // 本地缓存，避免频繁查库
    private final Cache<String, SmsTemplate> templateCache = Caffeine.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .build();

    /**
     * 根据业务编码发送短信
     */
    public void sendByCode(String code, String phone, Map<String, String> params) {
        SmsTemplate template = getTemplateByCode(code);

        if (template == null) {
            throw ServiceException.of("短信模板不存在: " + code);
        }

        if (template.getStatus() == 1) {
            throw ServiceException.of("短信模板已停用: " + code);
        }

        SmsBlend smsBlend = SmsFactory.getSmsBlend(template.getConfigId());
        SmsResponse response = smsBlend.sendMessage(phone, template.getTemplateId(), new LinkedHashMap<>(params));

        if (!response.isSuccess()) {
            throw ServiceException.of("短信发送失败: " + response.getData());
        }
    }

    /**
     * 获取模板（带缓存）
     */
    private SmsTemplate getTemplateByCode(String code) {
        String tenantId = TenantHelper.getTenantId();
        String cacheKey = tenantId + ":" + code;

        return templateCache.get(cacheKey, key -> {
            return templateMapper.selectByCode(code, tenantId);
        });
    }

    /**
     * 刷新模板缓存
     */
    public void refreshCache(String code) {
        String tenantId = TenantHelper.getTenantId();
        String cacheKey = tenantId + ":" + code;
        templateCache.invalidate(cacheKey);
    }
}
```

### 使用示例

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final SmsTemplateService smsTemplateService;

    /**
     * 发送注册验证码
     */
    public void sendRegisterCode(String phone, String code) {
        smsTemplateService.sendByCode("REGISTER_CODE", phone, Map.of("code", code));
    }

    /**
     * 发送密码重置验证码
     */
    public void sendResetPasswordCode(String phone, String code) {
        smsTemplateService.sendByCode("RESET_PASSWORD_CODE", phone, Map.of("code", code));
    }

    /**
     * 发送登录通知
     */
    public void sendLoginNotify(String phone, String ip, String location) {
        smsTemplateService.sendByCode("LOGIN_NOTIFY", phone, Map.of(
            "time", DateUtil.now(),
            "ip", ip,
            "location", location
        ));
    }
}
