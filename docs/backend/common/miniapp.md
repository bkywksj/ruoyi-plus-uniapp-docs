# 小程序集成 (miniapp)

## 简介

`ruoyi-common-miniapp` 是基于若依框架的微信小程序服务模块，提供了微信小程序的配置管理、消息处理、API调用等核心功能。该模块基于 `weixin-java-miniapp` 开发，支持多小程序实例配置和动态配置管理。

## 核心特性

- **多小程序支持**：支持同时管理多个微信小程序
- **动态配置管理**：支持运行时动态添加和移除小程序配置
- **消息路由处理**：内置消息路由器，支持不同类型消息的处理
- **自动配置初始化**：应用启动时自动加载小程序配置
- **完整API支持**：支持微信小程序所有官方API

## 模块结构

```
ruoyi-common-miniapp/
├── src/main/java/plus/ruoyi/common/miniapp/
│   ├── config/
│   │   └── WxMaServiceConfiguration.java    # 小程序服务配置类
│   └── runner/
│       └── WxMaApplicationRunner.java       # 启动初始化类
└── src/main/resources/META-INF/spring/
    └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 依赖配置

### Maven 依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-miniapp</artifactId>
</dependency>
```

### 核心依赖

- `ruoyi-common-core`：若依核心模块
- `weixin-java-miniapp`：微信小程序Java SDK

## 快速开始

### 1. 添加模块依赖

在需要使用小程序功能的模块中添加依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-miniapp</artifactId>
</dependency>
```

### 2. 配置小程序信息

在平台管理中添加微信小程序配置：

```java
// 平台配置示例
PlatformDTO platform = new PlatformDTO();
platform.setType(DictPlatformType.MP_WEIXIN.getValue());
platform.setAppid("your-appid");
platform.setSecret("your-secret");
platform.setToken("your-token");
platform.setAeskey("your-aeskey");
platform.setName("小程序名称");
```

### 3. 使用服务

```java
@Autowired
private WxMaService wxMaService;

// 切换到指定小程序
wxMaService.switchoverTo("your-appid");

// 获取用户信息
WxMaUserInfo userInfo = wxMaService.getUserService().getUserInfo(sessionKey, encryptedData, ivStr);
```

## 核心组件详解

### WxMaServiceConfiguration

微信小程序服务的核心配置类，负责：

- **WxMaService Bean注册**：创建微信小程序服务实例
- **消息路由配置**：配置不同类型消息的处理器
- **重试机制设置**：配置API调用的重试次数

#### 关键特性

```java
@Bean
public WxMaService wxMaService() {
    WxMaService wxMaService = new WxMaServiceImpl();
    wxMaService.setMaxRetryTimes(3);  // 设置重试次数
    return wxMaService;
}
```

#### 内置消息处理器

| 处理器 | 触发条件 | 功能描述 |
|--------|----------|----------|
| `logHandler` | 所有消息 | 记录消息日志并回复确认信息 |
| `subscribeMsgHandler` | 内容为"订阅消息" | 发送订阅消息 |
| `textHandler` | 内容为"文本" | 处理文本消息 |
| `picHandler` | 内容为"图片" | 处理图片消息 |
| `qrcodeHandler` | 内容为"二维码" | 生成并发送二维码 |

### WxMaApplicationRunner

应用启动时的初始化类，实现了 `ApplicationRunner` 接口：

#### 主要功能

- **自动初始化**：应用启动后自动加载小程序配置
- **多配置管理**：支持同时管理多个小程序实例
- **动态配置**：提供运行时配置管理方法

#### 核心方法

```java
// 初始化所有小程序配置
public void init()

// 添加单个小程序配置
public void addConfig(PlatformDTO platform)

// 移除小程序配置
public void removeConfig(String appid)
```

## API 使用示例

### 用户信息解密

```java
@Service
public class MiniappUserService {
    
    @Autowired
    private WxMaService wxMaService;
    
    public WxMaUserInfo getUserInfo(String appid, String sessionKey, 
                                   String encryptedData, String ivStr) {
        try {
            // 切换到指定小程序
            wxMaService.switchoverTo(appid);
            
            // 解密用户信息
            return wxMaService.getUserService()
                .getUserInfo(sessionKey, encryptedData, ivStr);
                
        } catch (WxErrorException e) {
            log.error("获取用户信息失败", e);
            throw new RuntimeException("获取用户信息失败");
        }
    }
}
```

### 发送订阅消息

```java
public void sendSubscribeMessage(String appid, String toUser, String templateId) {
    try {
        wxMaService.switchoverTo(appid);
        
        WxMaSubscribeMessage message = WxMaSubscribeMessage.builder()
            .templateId(templateId)
            .toUser(toUser)
            .data(Arrays.asList(
                new WxMaSubscribeMessage.MsgData("thing1", "订阅内容"),
                new WxMaSubscribeMessage.MsgData("time2", "2024-01-01 12:00:00")
            ))
            .build();
            
        wxMaService.getMsgService().sendSubscribeMsg(message);
        
    } catch (WxErrorException e) {
        log.error("发送订阅消息失败", e);
    }
}
```

### 生成小程序码

```java
public byte[] generateQrcode(String appid, String scene, String page) {
    try {
        wxMaService.switchoverTo(appid);
        
        return wxMaService.getQrcodeService()
            .createWxaCodeUnlimitBytes(scene, page, 430, true, null, false);
            
    } catch (WxErrorException e) {
        log.error("生成小程序码失败", e);
        throw new RuntimeException("生成小程序码失败");
    }
}
```

## 配置管理

### 动态添加配置

```java
@Service
public class MiniappConfigService {
    
    @Autowired
    private WxMaApplicationRunner wxMaApplicationRunner;
    
    public void addMiniappConfig(PlatformDTO platform) {
        // 验证配置
        if (StringUtils.isBlank(platform.getAppid()) || 
            StringUtils.isBlank(platform.getSecret())) {
            throw new IllegalArgumentException("AppId和Secret不能为空");
        }
        
        // 添加配置
        wxMaApplicationRunner.addConfig(platform);
        
        log.info("成功添加小程序配置: {}", platform.getName());
    }
    
    public void removeMiniappConfig(String appid) {
        wxMaApplicationRunner.removeConfig(appid);
        log.info("成功移除小程序配置: {}", appid);
    }
}
```

### 配置验证

```java
public boolean validateConfig(String appid) {
    try {
        wxMaService.switchoverTo(appid);
        
        // 调用获取访问令牌接口验证配置
        String accessToken = wxMaService.getAccessToken();
        
        return StringUtils.isNotBlank(accessToken);
        
    } catch (Exception e) {
        log.error("配置验证失败: appid={}", appid, e);
        return false;
    }
}
```

## 消息处理扩展

### 自定义消息处理器

```java
@Component
public class CustomMessageHandler {
    
    // 自定义文本消息处理器
    public WxMaMessageHandler customTextHandler = (wxMessage, context, service, sessionManager) -> {
        String content = wxMessage.getContent();
        String fromUser = wxMessage.getFromUser();
        
        // 自定义处理逻辑
        String replyContent = processTextMessage(content);
        
        // 发送回复
        try {
            service.getMsgService().sendKefuMsg(
                WxMaKefuMessage.newTextBuilder()
                    .content(replyContent)
                    .toUser(fromUser)
                    .build()
            );
        } catch (WxErrorException e) {
            log.error("发送客服消息失败", e);
        }
        
        return null;
    };
    
    private String processTextMessage(String content) {
        // 实现自定义文本处理逻辑
        return "您发送的消息是：" + content;
    }
}
```

### 消息路由配置扩展

```java
@Configuration
public class CustomMessageRouterConfig {
    
    @Autowired
    private CustomMessageHandler customMessageHandler;
    
    @Bean
    @Primary
    public WxMaMessageRouter customWxMaMessageRouter(WxMaService wxMaService) {
        final WxMaMessageRouter router = new WxMaMessageRouter(wxMaService);
        
        router
            // 原有规则...
            .rule().async(false).content("自定义").handler(customMessageHandler.customTextHandler).end()
            // 可以继续添加更多规则
            .rule().async(false).msgType(WxConsts.XmlMsgType.IMAGE).handler(imageHandler).end();
            
        return router;
    }
}
```

## 最佳实践

### 1. 错误处理

```java
public class MiniappServiceImpl {
    
    public <T> T executeWithRetry(String appid, Supplier<T> supplier) {
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                wxMaService.switchoverTo(appid);
                return supplier.get();
                
            } catch (WxErrorException e) {
                retryCount++;
                
                if (retryCount >= maxRetries) {
                    log.error("执行失败，已重试{}次: appid={}", maxRetries, appid, e);
                    throw new RuntimeException("小程序API调用失败", e);
                }
                
                log.warn("执行失败，准备重试第{}次: appid={}", retryCount, appid, e);
                
                try {
                    Thread.sleep(1000 * retryCount); // 递增延迟
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

### 2. 配置缓存

```java
@Component
public class MiniappConfigCache {
    
    private final Map<String, PlatformDTO> configCache = new ConcurrentHashMap<>();
    
    public void cacheConfig(PlatformDTO platform) {
        configCache.put(platform.getAppid(), platform);
    }
    
    public PlatformDTO getConfig(String appid) {
        return configCache.get(appid);
    }
    
    public void removeConfig(String appid) {
        configCache.remove(appid);
    }
    
    public boolean hasConfig(String appid) {
        return configCache.containsKey(appid);
    }
}
```

### 3. 日志记录

```java
@Aspect
@Component
public class MiniappLogAspect {
    
    @Around("execution(* plus.ruoyi.common.miniapp..*(..))")
    public Object logMiniappOperation(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        log.info("开始执行小程序操作: method={}, args={}", methodName, args);
        
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            
            log.info("小程序操作执行成功: method={}, duration={}ms", 
                methodName, endTime - startTime);
            
            return result;
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            
            log.error("小程序操作执行失败: method={}, duration={}ms", 
                methodName, endTime - startTime, e);
            
            throw e;
        }
    }
}
```

## 常见问题

### Q: 如何处理多个小程序切换？

A: 使用 `wxMaService.switchoverTo(appid)` 方法在调用具体API前切换到对应的小程序实例。

```java
// 正确的做法
wxMaService.switchoverTo("appid1");
String result1 = wxMaService.getAccessToken();

wxMaService.switchoverTo("appid2");  
String result2 = wxMaService.getAccessToken();
```

### Q: 配置不生效怎么办？

A: 检查以下几点：
1. 确认平台类型为 `DictPlatformType.MP_WEIXIN.getValue()`
2. 确认AppId、Secret等信息正确
3. 检查应用启动日志，确认配置初始化成功
4. 使用 `validateConfig()` 方法验证配置有效性

### Q: 消息处理器不响应？

A: 检查消息路由配置：
1. 确认消息类型和内容匹配规则
2. 检查处理器是否正确注册
3. 查看是否有异常日志
4. 确认小程序端推送配置正确

## 注意事项

1. **并发安全**：多线程环境下使用 `switchoverTo` 时注意线程安全
2. **配置管理**：动态添加配置后建议进行验证测试
3. **异常处理**：微信API调用可能出现各种异常，需要适当的重试和降级机制
4. **日志监控**：建议添加详细的日志记录，便于问题排查
5. **资源管理**：注意及时清理不再使用的配置，避免资源浪费

通过本模块，您可以轻松地在若依框架中集成微信小程序功能，实现完整的小程序后端服务支持。
