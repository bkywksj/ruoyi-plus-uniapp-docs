# 公众号集成 (mp)

## 模块介绍

`ruoyi-common-mp` 是基于 [WxJava](https://github.com/Wechat-Group/WxJava) 开发的微信公众号集成模块，提供了微信公众号的基础配置管理、缓存优化和自动初始化功能。

## 主要特性

- ✅ **多公众号支持**: 支持同时管理多个微信公众号
- ✅ **Redis缓存**: 集成Redis实现access_token等信息的缓存
- ✅ **本地缓存**: 基于Caffeine实现二级缓存，提升性能
- ✅ **自动配置**: Spring Boot自动配置，开箱即用
- ✅ **动态管理**: 支持运行时动态添加/移除公众号配置

## 依赖说明

```xml
<dependencies>
    <!-- 核心模块 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>
    
    <!-- redis模块 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>
    
    <!-- 微信公众号SDK -->
    <dependency>
        <groupId>com.github.binarywang</groupId>
        <artifactId>weixin-java-mp</artifactId>
    </dependency>
</dependencies>
```

## 核心组件

### 1. PlusWxRedisOps

自定义Redis操作实现类，提供二级缓存功能：

```java
public class PlusWxRedisOps extends BaseWxRedisOps {
    // Caffeine本地缓存配置
    private static final Cache<String, Object> CAFFEINE = Caffeine.newBuilder()
        .expireAfterWrite(5, TimeUnit.SECONDS)    // 写入后5秒过期
        .initialCapacity(100)                     // 初始容量
        .maximumSize(1000)                       // 最大容量
        .build();
}
```

**缓存策略**：
- 一级缓存：Caffeine (本地缓存，5秒过期)
- 二级缓存：Redis (分布式缓存)

### 2. WxMpServiceConfiguration

Spring Boot自动配置类：

```java
@RequiredArgsConstructor
@AutoConfiguration
public class WxMpServiceConfiguration {
    
    @Bean
    public WxMpService wxMpService() {
        WxMpService wxMpService = new WxMpServiceImpl();
        wxMpService.setMaxRetryTimes(3);  // 设置重试次数
        return wxMpService;
    }
    
    @Bean
    public WxRedisOps wxRedisOps() {
        return new PlusWxRedisOps();
    }
}
```

### 3. WxMpApplicationRunner

应用启动时自动初始化公众号配置：

```java
@Slf4j
@RequiredArgsConstructor
public class WxMpApplicationRunner implements ApplicationRunner {
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        init(); // 启动时自动初始化
    }
}
```

## 使用指南

### 1. 模块引入

在需要使用公众号功能的模块中引入依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mp</artifactId>
</dependency>
```

### 2. 数据库配置

确保平台配置表中有微信公众号的相关配置：

```sql
-- 平台配置表示例
INSERT INTO platform_config (
    name, type, appid, secret, token, aeskey, status
) VALUES (
    '测试公众号', 'MP_OFFICIAL_ACCOUNT', 'wx1234567890', 'your_secret', 'your_token', 'your_aes_key', 1
);
```

### 3. 基本使用

#### 注入服务

```java
@RestController
@RequiredArgsConstructor
public class WxMpController {
    
    private final WxMpService wxMpService;
    
    // 使用示例
}
```

#### 发送模板消息

```java
@PostMapping("/sendTemplate")
public R<Void> sendTemplateMessage(@RequestBody TemplateMessageRequest request) {
    try {
        // 切换到指定公众号
        wxMpService.switchoverTo(request.getAppId());
        
        // 构建模板消息
        WxMpTemplateMessage templateMessage = WxMpTemplateMessage.builder()
            .toUser(request.getOpenId())
            .templateId(request.getTemplateId())
            .data(request.getData())
            .build();
            
        // 发送模板消息
        String msgId = wxMpService.getTemplateMsgService().sendTemplateMsg(templateMessage);
        
        return R.ok("发送成功，消息ID: " + msgId);
    } catch (WxErrorException e) {
        log.error("发送模板消息失败", e);
        return R.fail("发送失败: " + e.getError().getErrorMsg());
    }
}
```

#### 获取用户信息

```java
@GetMapping("/userInfo/{openId}")
public R<WxMpUser> getUserInfo(@PathVariable String openId, @RequestParam String appId) {
    try {
        wxMpService.switchoverTo(appId);
        WxMpUser user = wxMpService.getUserService().userInfo(openId);
        return R.ok(user);
    } catch (WxErrorException e) {
        log.error("获取用户信息失败", e);
        return R.fail("获取失败: " + e.getError().getErrorMsg());
    }
}
```

#### 创建菜单

```java
@PostMapping("/createMenu")
public R<Void> createMenu(@RequestParam String appId, @RequestBody WxMpMenu menu) {
    try {
        wxMpService.switchoverTo(appId);
        wxMpService.getMenuService().menuCreate(menu);
        return R.ok("菜单创建成功");
    } catch (WxErrorException e) {
        log.error("创建菜单失败", e);
        return R.fail("创建失败: " + e.getError().getErrorMsg());
    }
}
```

### 4. 动态配置管理

#### 添加新公众号配置

```java
@Autowired
private WxMpApplicationRunner wxMpApplicationRunner;

// 添加新配置
public void addWxMpConfig(PlatformDTO platform) {
    wxMpApplicationRunner.addConfig(platform);
}
```

#### 移除公众号配置

```java
// 移除配置
public void removeWxMpConfig(String appId) {
    wxMpApplicationRunner.removeConfig(appId);
}
```

## 消息处理

### 1. 消息处理器示例

```java
@Component
public class WxMpMessageHandler {
    
    /**
     * 处理文本消息
     */
    public WxMpXmlOutMessage handleTextMessage(WxMpXmlMessage inMessage) {
        return WxMpXmlOutMessage.TEXT()
            .content("收到文本消息：" + inMessage.getContent())
            .fromUser(inMessage.getToUser())
            .toUser(inMessage.getFromUser())
            .build();
    }
    
    /**
     * 处理关注事件
     */
    public WxMpXmlOutMessage handleSubscribeEvent(WxMpXmlMessage inMessage) {
        return WxMpXmlOutMessage.TEXT()
            .content("欢迎关注！")
            .fromUser(inMessage.getToUser())
            .toUser(inMessage.getFromUser())
            .build();
    }
}
```

### 2. 消息路由配置

```java
@Configuration
public class WxMpMessageRouterConfig {
    
    @Bean
    public WxMpMessageRouter wxMpMessageRouter(
        WxMpService wxMpService, 
        WxMpMessageHandler messageHandler
    ) {
        WxMpMessageRouter router = new WxMpMessageRouter(wxMpService);
        
        // 文本消息路由
        router.rule()
            .async(false)
            .msgType(XmlMsgType.TEXT)
            .handler(messageHandler::handleTextMessage)
            .end();
            
        // 关注事件路由
        router.rule()
            .async(false)
            .msgType(XmlMsgType.EVENT)
            .event(EventType.SUBSCRIBE)
            .handler(messageHandler::handleSubscribeEvent)
            .end();
            
        return router;
    }
}
```

## 配置参数

### 缓存配置

可以通过修改 `PlusWxRedisOps` 来调整缓存策略：

```java
private static final Cache<String, Object> CAFFEINE = Caffeine.newBuilder()
    .expireAfterWrite(5, TimeUnit.SECONDS)    // 过期时间
    .initialCapacity(100)                     // 初始容量
    .maximumSize(1000)                       // 最大容量
    .recordStats()                           // 开启统计
    .build();
```

### 重试配置

调整WxMpService的重试次数：

```java
@Bean
public WxMpService wxMpService() {
    WxMpService wxMpService = new WxMpServiceImpl();
    wxMpService.setMaxRetryTimes(3);  // 设置重试次数
    wxMpService.setRetrySleepMillis(1000); // 重试间隔
    return wxMpService;
}
```

## 常见问题

### Q1: 如何处理多公众号切换？

```java
// 在使用API前切换到对应的公众号
wxMpService.switchoverTo(appId);
```

### Q2: access_token缓存机制？

系统采用两级缓存：
1. Caffeine本地缓存（5秒）
2. Redis分布式缓存（按微信官方时间）

### Q3: 如何自定义消息处理逻辑？

实现对应的Handler接口并注册到消息路由器中：

```java
public class CustomMessageHandler implements WxMpMessageHandler {
    @Override
    public WxMpXmlOutMessage handle(WxMpXmlMessage inMessage, Map<String, Object> context,
                                  WxMpService wxMpService, WxSessionManager sessionManager) {
        // 自定义处理逻辑
        return null;
    }
}
```

### Q4: 如何监控公众号API调用？

可以通过拦截器监控API调用：

```java
@Bean
public WxMpService wxMpService() {
    WxMpService service = new WxMpServiceImpl();
    service.setHttpProxyHost("your-proxy-host");
    service.setHttpProxyPort(8080);
    return service;
}
```

## 注意事项

1. **线程安全**: WxMpService是线程安全的，可以在多线程环境下使用
2. **配置切换**: 使用多公众号时，记得调用`switchoverTo(appId)`切换配置
3. **异常处理**: 所有微信API调用都应该进行适当的异常处理
4. **缓存预热**: 系统启动时会自动加载所有配置的公众号
5. **日志监控**: 建议监控微信API的调用频率，避免超过限制

## 扩展开发

### 自定义缓存实现

```java
@Component
public class CustomWxRedisOps extends BaseWxRedisOps {
    // 自定义实现
}
```

### 自定义配置加载

```java
@Component
public class CustomWxMpApplicationRunner extends WxMpApplicationRunner {
    // 自定义配置加载逻辑
}
```

通过以上配置和使用方法，您可以快速集成微信公众号功能到您的应用中。
