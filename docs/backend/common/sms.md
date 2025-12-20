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
