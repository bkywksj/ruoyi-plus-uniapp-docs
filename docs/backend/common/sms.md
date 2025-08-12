# 短信服务 (sms) 

## 概述

短信模块是基于若依框架开发的通用短信服务模块，提供短信发送与验证码功能。该模块集成了SMS4J框架，支持多平台短信服务商，并提供统一的API接口和缓存管理。

## 核心特性

- 🚀 **多平台支持**: 基于SMS4J框架，支持多个主流短信服务商
- 📦 **统一接口**: 提供标准化的短信发送API
- 🔐 **验证码管理**: 内置验证码生成、存储和校验功能
- 💾 **缓存支持**: 集成Redis缓存，支持短信重试和拦截机制
- 🛡️ **异常处理**: 全局异常捕获和友好错误提示
- ⚡ **自动配置**: Spring Boot自动配置，开箱即用

## 模块结构

```text
ruoyi-common-sms/
├── pom.xml                                    # Maven配置文件
├── src/main/java/plus/ruoyi/common/sms/
│   ├── config/
│   │   └── SmsAutoConfiguration.java          # 自动配置类
│   ├── core/
│   │   └── dao/
│   │       └── PlusSmsDao.java               # 短信缓存DAO实现
│   └── handler/
│       └── SmsExceptionHandler.java          # 全局异常处理器
└── src/main/resources/META-INF/
    └── spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 依赖关系

### Maven依赖

```xml
<dependencies>
    <!-- 内部模块依赖 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- 短信服务依赖 -->
    <dependency>
        <groupId>org.dromara.sms4j</groupId>
        <artifactId>sms4j-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

### 模块依赖关系

- **ruoyi-common-redis**: 提供Redis缓存支持，用于验证码存储与校验
- **sms4j-spring-boot-starter**: SMS4J框架，提供多平台短信发送支持

## 核心组件

### 1. 自动配置类 (SmsAutoConfiguration)

负责模块的自动装配和Bean注册：

```java
@AutoConfiguration(after = {RedisAutoConfiguration.class})
public class SmsAutoConfiguration {
    
    @Primary
    @Bean
    public SmsDao smsDao() {
        return new PlusSmsDao();
    }

    @Bean
    public SmsExceptionHandler smsExceptionHandler() {
        return new SmsExceptionHandler();
    }
}
```

**特性说明:**
- 在Redis配置完成后执行，确保Redis可用
- 注册自定义的SmsDao实现，替换默认实现
- 自动注册全局异常处理器

### 2. 短信缓存DAO (PlusSmsDao)

实现SMS4J的SmsDao接口，提供统一的缓存管理：

```java
public class PlusSmsDao implements SmsDao {
    
    // 存储键值对，指定过期时间
    public void set(String key, Object value, long cacheTime);
    
    // 存储键值对，永久缓存
    public void set(String key, Object value);
    
    // 根据键获取缓存值
    public Object get(String key);
    
    // 删除指定键的缓存
    public Object remove(String key);
    
    // 清空所有短信相关缓存
    public void clean();
}
```

**功能特性:**
- 使用框架统一的RedisUtils工具类
- 所有缓存键自动添加全局前缀 `GlobalConstants.GLOBAL_REDIS_KEY`
- 支持带过期时间的缓存存储
- 提供批量清理功能

### 3. 全局异常处理器 (SmsExceptionHandler)

统一处理短信相关异常：

```java
@RestControllerAdvice
public class SmsExceptionHandler {
    
    @ExceptionHandler(SmsBlendException.class)
    public R<Void> handleSmsBlendException(SmsBlendException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.error("请求地址'{}',发生短信发送异常.", requestUri, e);
        return R.fail(HttpStatus.HTTP_INTERNAL_ERROR, "短信发送失败，请稍后再试...");
    }
}
```

**处理机制:**
- 全局捕获`SmsBlendException`异常
- 记录详细错误日志，包含请求URI
- 返回用户友好的错误提示
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

在`application.yml`中配置SMS4J相关参数：

```yaml
sms:
  # 短信服务商配置
  alibaba:
    access-key-id: your-access-key
    access-key-secret: your-access-secret
    signature: your-signature
    template-id: SMS_123456789
  
  # 缓存配置
  cache:
    # 验证码有效期（秒）
    code-expire: 300
    # 短信发送间隔（秒）  
    send-interval: 60
```

### 3. 业务层使用

```java
@Service
public class SmsService {
    
    @Autowired
    private SmsBlend smsBlend;
    
    /**
     * 发送验证码短信
     */
    public void sendVerifyCode(String phone) {
        String code = RandomUtil.randomNumbers(6);
        
        // 构建短信消息
        SmsMessage message = SmsMessage.builder()
            .phoneNumber(phone)
            .message("您的验证码是：" + code + "，有效期5分钟。")
            .build();
            
        // 发送短信
        smsBlend.sendMessage(message);
        
        // 缓存验证码
        RedisUtils.setCacheObject("verify_code:" + phone, code, Duration.ofMinutes(5));
    }
    
    /**
     * 校验验证码
     */
    public boolean verifyCode(String phone, String code) {
        String cachedCode = RedisUtils.getCacheObject("verify_code:" + phone);
        return Objects.equals(code, cachedCode);
    }
}
```

## 配置说明

### Redis缓存配置

短信模块依赖Redis进行缓存管理，需确保以下配置：

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: your-password
      database: 0
      timeout: 10s
      lettuce:
        pool:
          max-active: 200
          max-idle: 20
          min-idle: 5
```

### 全局常量配置

缓存键前缀通过`GlobalConstants.GLOBAL_REDIS_KEY`统一管理：

```java
public class GlobalConstants {
    /**
     * 全局Redis键前缀
     */
    public static final String GLOBAL_REDIS_KEY = "global:";
}
```

## 扩展开发

### 1. 自定义短信模板

```java
@Component
public class CustomSmsTemplate {
    
    /**
     * 验证码模板
     */
    public String buildVerifyCodeMessage(String code) {
        return String.format("【若依框架】您的验证码是：%s，有效期5分钟，请勿泄露。", code);
    }
    
    /**
     * 通知模板
     */
    public String buildNotificationMessage(String content) {
        return String.format("【若依框架】%s", content);
    }
}
```

### 2. 扩展异常处理

```java
@RestControllerAdvice
public class CustomSmsExceptionHandler extends SmsExceptionHandler {
    
    @ExceptionHandler(CustomSmsException.class)
    public R<Void> handleCustomSmsException(CustomSmsException e, HttpServletRequest request) {
        // 自定义异常处理逻辑
        return R.fail("自定义短信异常处理");
    }
}
```

### 3. 自定义缓存策略

```java
@Component
public class CustomSmsDao extends PlusSmsDao {
    
    @Override
    public void set(String key, Object value, long cacheTime) {
        // 自定义缓存逻辑
        super.set(key, value, cacheTime);
        // 额外处理...
    }
}
```

## 最佳实践

### 1. 验证码安全

- 设置合理的验证码有效期（建议5-10分钟）
- 限制同一手机号的发送频率（建议60秒间隔）
- 验证码使用后立即清除缓存
- 记录发送日志，便于问题排查

### 2. 异常处理

- 对用户隐藏具体的技术错误信息
- 记录详细的错误日志供开发者排查
- 提供重试机制和降级方案
- 监控短信发送成功率和失败原因

### 3. 性能优化

- 使用Redis缓存减少重复验证
- 异步发送短信，避免阻塞主流程
- 合理设置连接池参数
- 定期清理过期的缓存数据

## 常见问题

### Q1: 短信发送失败怎么办？

**A1:** 检查以下几点：
- 短信服务商配置是否正确
- 账户余额是否充足
- 手机号格式是否正确
- 短信模板是否已审核通过

### Q2: 验证码收不到？

**A2:** 可能的原因：
- 手机号被运营商拦截
- 短信服务商网络延迟
- 验证码已过期被清理
- 发送频率过高被限制

### Q3: Redis连接异常？

**A3:** 检查Redis配置：
- Redis服务是否正常运行
- 连接参数是否正确
- 网络是否通畅
- 认证密码是否正确
