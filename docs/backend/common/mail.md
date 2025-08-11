# 邮件模块

## 概述

邮件模块是基于 Hutool 的邮件工具构建的 Spring Boot 自动配置模块，提供简单易用的邮件发送功能。支持文本邮件、HTML邮件、带附件邮件以及内嵌图片邮件的发送。

## 核心特性

- 🚀 **开箱即用**：Spring Boot 自动配置，无需复杂设置
- 📧 **多种格式**：支持纯文本、HTML、带附件邮件
- 🖼️ **内嵌图片**：支持HTML邮件中的内嵌图片
- 👥 **批量发送**：支持多收件人、抄送、密送
- 🔒 **安全连接**：支持SSL/TLS和STARTTLS安全连接
- ⚙️ **灵活配置**：支持超时设置和多种SMTP服务器

## 快速开始

### 1. 添加依赖

确保项目中已包含邮件模块依赖。

### 2. 配置文件

在 `application.yml` 中添加邮件配置：

```yaml
################## 邮件服务配置 ##################
--- # mail 邮件发送
mail:
   # 是否启用邮件服务
   enabled: true                    # 生产环境设为 true，开发环境可设为 false
   # SMTP服务器地址
   host: smtp.163.com              # 163邮箱SMTP服务器
   # SMTP服务器端口
   port: 465                       # SSL端口
   # 是否需要用户名密码验证
   auth: true                      # 开启认证
   # 发送方，遵循RFC-822标准
   from: xxx@163.com               # 发件人邮箱地址
   # 用户名（注意：如果使用foxmail邮箱，此处user为qq号）
   user: xxx@163.com               # 邮箱用户名
   # 密码（注意，某些邮箱需要为SMTP服务单独设置密码，详情查看相关帮助）
   pass: xxxxxxxxxx               # 邮箱授权码（不是登录密码）
   # 使用 STARTTLS安全连接，STARTTLS是对纯文本通信协议的扩展
   starttlsEnable: true           # 启用STARTTLS
   # 使用SSL安全连接
   sslEnable: true                # 启用SSL
   # SMTP超时时长，单位毫秒，缺省值不超时
   timeout: 0                     # 0表示不设置超时
   # Socket连接超时值，单位毫秒，缺省值不超时
   connectionTimeout: 0           # 0表示不设置连接超时
```

### 3. 发送邮件

```java
import plus.ruoyi.common.mail.utils.MailUtils;

// 发送简单文本邮件
MailUtils.sendText("recipient@example.com", "测试邮件", "这是一封测试邮件");

// 发送HTML邮件
MailUtils.sendHtml("recipient@example.com", "HTML邮件", "<h1>这是HTML邮件</h1>");
```

## 配置详解

### 配置属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mail.enabled` | Boolean | false | 是否启用邮件功能 |
| `mail.host` | String | - | SMTP服务器域名 |
| `mail.port` | Integer | - | SMTP服务端口 |
| `mail.auth` | Boolean | true | 是否需要用户名密码验证 |
| `mail.user` | String | - | 用户名（foxmail邮箱填写QQ号） |
| `mail.pass` | String | - | 密码或授权码（不是登录密码） |
| `mail.from` | String | - | 发件人地址，遵循RFC-822标准 |
| `mail.starttlsEnable` | Boolean | false | 是否启用STARTTLS安全连接 |
| `mail.sslEnable` | Boolean | false | 是否启用SSL安全连接 |
| `mail.timeout` | Long | 0 | SMTP超时时长（毫秒），0表示不超时 |
| `mail.connectionTimeout` | Long | 0 | 连接超时时长（毫秒），0表示不超时 |

### 常见邮箱服务器配置

#### QQ邮箱

```yaml
################## 邮件服务配置 ##################
--- # mail 邮件发送
mail:
  enabled: true
  host: smtp.qq.com
  port: 587                       # 使用STARTTLS端口
  from: your-email@qq.com
  user: your-email@qq.com
  pass: your-auth-code            # QQ邮箱授权码
  auth: true
  starttlsEnable: true
  sslEnable: false               # STARTTLS方式不启用SSL
  timeout: 0
  connectionTimeout: 0
```

::: tip QQ邮箱授权码获取
1. 登录QQ邮箱
2. 进入 设置 → 账户
3. 开启SMTP服务
4. 获取授权码（16位字符）
   :::

#### 163邮箱

```yaml
################## 邮件服务配置 ##################
--- # mail 邮件发送
mail:
  enabled: true
  host: smtp.163.com
  port: 465                       # 使用SSL端口
  from: your-email@163.com
  user: your-email@163.com
  pass: your-auth-code            # 163邮箱授权码
  auth: true
  starttlsEnable: true
  sslEnable: true                 # 启用SSL
  timeout: 0                      # 不设置超时
  connectionTimeout: 0
```

::: tip 163邮箱授权码获取
1. 登录163邮箱
2. 进入 设置 → POP3/SMTP/IMAP
3. 开启SMTP服务
4. 获取授权码（不是登录密码）
   :::

#### Gmail

```yaml
################## 邮件服务配置 ##################
--- # mail 邮件发送
mail:
  enabled: true
  host: smtp.gmail.com
  port: 587
  from: your-email@gmail.com
  user: your-email@gmail.com
  pass: your-app-password        # Gmail应用专用密码
  auth: true
  starttlsEnable: true
  sslEnable: false
  timeout: 0
  connectionTimeout: 0
```

::: tip Gmail应用密码获取
1. 开启两步验证
2. 进入 Google账户 → 安全性 → 应用专用密码
3. 生成应用专用密码（16位字符）
   :::

## API 使用指南

### 基础邮件发送

#### 发送文本邮件

```java
// 发送给单个收件人
String messageId = MailUtils.sendText("user@example.com", "邮件标题", "邮件内容");

// 发送给多个收件人（逗号或分号分隔）
MailUtils.sendText("user1@example.com,user2@example.com", "邮件标题", "邮件内容");

// 发送给收件人列表
List<String> recipients = Arrays.asList("user1@example.com", "user2@example.com");
MailUtils.sendText(recipients, "邮件标题", "邮件内容");
```

#### 发送HTML邮件

```java
String htmlContent = """
    <html>
    <body>
        <h1>欢迎使用邮件服务</h1>
        <p>这是一封<strong>HTML格式</strong>的邮件</p>
        <a href="https://example.com">访问我们的网站</a>
    </body>
    </html>
    """;

MailUtils.sendHtml("user@example.com", "HTML邮件", htmlContent);
```

### 带附件邮件

```java
import java.io.File;

File attachment1 = new File("/path/to/document.pdf");
File attachment2 = new File("/path/to/image.jpg");

// 发送带附件的文本邮件
MailUtils.sendText("user@example.com", "带附件邮件", "请查看附件", attachment1, attachment2);

// 发送带附件的HTML邮件
MailUtils.sendHtml("user@example.com", "带附件HTML邮件", htmlContent, attachment1, attachment2);
```

### 抄送和密送

```java
// 使用字符串形式（逗号或分号分隔）
MailUtils.send(
    "to@example.com",           // 收件人
    "cc@example.com",           // 抄送
    "bcc@example.com",          // 密送
    "邮件标题", 
    "邮件内容", 
    true                        // 是否HTML格式
);

// 使用集合形式
List<String> tos = Arrays.asList("to1@example.com", "to2@example.com");
List<String> ccs = Arrays.asList("cc1@example.com", "cc2@example.com");
List<String> bccs = Arrays.asList("bcc1@example.com", "bcc2@example.com");

MailUtils.send(tos, ccs, bccs, "邮件标题", "邮件内容", true);
```

### 内嵌图片邮件

```java
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

// 准备图片映射
Map<String, InputStream> imageMap = new HashMap<>();
imageMap.put("logo", new FileInputStream("/path/to/logo.png"));
imageMap.put("banner", new FileInputStream("/path/to/banner.jpg"));

// HTML内容中引用图片
String htmlContent = """
    <html>
    <body>
        <img src="cid:logo" alt="Logo" />
        <h1>欢迎使用我们的服务</h1>
        <img src="cid:banner" alt="Banner" />
        <p>这是包含内嵌图片的邮件</p>
    </body>
    </html>
    """;

MailUtils.sendHtml("user@example.com", "内嵌图片邮件", htmlContent, imageMap);
```

### 自定义邮件账户

```java
import cn.hutool.extra.mail.MailAccount;

// 临时更改发送账户信息
MailAccount customAccount = MailUtils.getMailAccount("custom@example.com", "custom@example.com", "custom-password");
MailUtils.send(customAccount, "recipient@example.com", "使用自定义账户", "邮件内容", false);

// 完全自定义邮件账户
MailAccount mailAccount = new MailAccount();
mailAccount.setHost("smtp.custom.com");
mailAccount.setPort(587);
mailAccount.setFrom("sender@custom.com");
mailAccount.setUser("sender@custom.com");
mailAccount.setPass("password");
mailAccount.setAuth(true);
mailAccount.setStarttlsEnable(true);

MailUtils.send(mailAccount, "recipient@example.com", "完全自定义账户", "邮件内容", false);
```

## 高级用法

### 邮件模板

建议结合模板引擎使用：

```java
// 使用Thymeleaf模板（示例）
@Service
public class EmailService {
    
    @Autowired
    private TemplateEngine templateEngine;
    
    public void sendWelcomeEmail(String to, String username) {
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("loginUrl", "https://example.com/login");
        
        String htmlContent = templateEngine.process("email/welcome", context);
        
        MailUtils.sendHtml(to, "欢迎注册", htmlContent);
    }
}
```

### 异步发送

```java
@Service
public class AsyncEmailService {
    
    @Async("emailTaskExecutor")
    public CompletableFuture<String> sendEmailAsync(String to, String subject, String content) {
        try {
            String messageId = MailUtils.sendHtml(to, subject, content);
            return CompletableFuture.completedFuture(messageId);
        } catch (Exception e) {
            CompletableFuture<String> future = new CompletableFuture<>();
            future.completeExceptionally(e);
            return future;
        }
    }
}
```

### 批量发送优化

```java
@Service
public class BulkEmailService {
    
    public void sendBulkEmails(List<String> recipients, String subject, String content) {
        // 分批发送，避免一次发送过多邮件
        int batchSize = 50;
        for (int i = 0; i < recipients.size(); i += batchSize) {
            int end = Math.min(i + batchSize, recipients.size());
            List<String> batch = recipients.subList(i, end);
            
            try {
                MailUtils.sendHtml(batch, subject, content);
                // 批次间添加延迟，避免触发邮件服务器限制
                Thread.sleep(1000);
            } catch (Exception e) {
                log.error("批量发送邮件失败，批次: {}-{}", i, end, e);
            }
        }
    }
}
```

## 错误处理

### 常见异常处理

```java
public class EmailService {
    
    public boolean sendEmailSafely(String to, String subject, String content) {
        try {
            MailUtils.sendHtml(to, subject, content);
            return true;
        } catch (cn.hutool.extra.mail.MailException e) {
            log.error("邮件发送失败: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("发送邮件时发生未知错误", e);
            return false;
        }
    }
}
```

### 重试机制

```java
@Component
public class EmailRetryService {
    
    @Retryable(value = {MailException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public String sendWithRetry(String to, String subject, String content) {
        return MailUtils.sendHtml(to, subject, content);
    }
    
    @Recover
    public String recover(MailException ex, String to, String subject, String content) {
        log.error("邮件发送重试失败，收件人: {}, 标题: {}", to, subject, ex);
        return null;
    }
}
```

## 性能优化

### 连接池配置

```yaml
mail:
  enabled: true
  # ... 其他配置
  timeout: 30000              # 适当设置超时时间
  connectionTimeout: 10000    # 连接超时
```

### 异步配置

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean("emailTaskExecutor")
    public TaskExecutor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Email-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

## 安全建议

1. **使用授权码**：不要使用邮箱登录密码，使用专用的授权码或应用密码
2. **配置加密**：敏感的邮箱密码建议使用配置加密
3. **限制发送频率**：避免触发邮件服务商的反垃圾机制
4. **验证收件人**：发送前验证邮箱地址格式的合法性

```java
public class EmailValidator {
    
    private static final String EMAIL_REGEX = 
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);
    
    public static boolean isValid(String email) {
        return EMAIL_PATTERN.matcher(email).matches();
    }
}
```

## 开发环境配置

### 配置说明

开发环境中通常将 `enabled: false` 来禁用邮件发送，避免开发过程中误发邮件。以下是开发环境的推荐配置：

```yaml
################## 邮件服务配置 ##################
--- # mail 邮件发送
mail:
  # 开发环境建议设置为 false，避免误发邮件
  enabled: false
  # 以下配置在开发环境中可以使用测试邮箱
  host: smtp.163.com
  port: 465
  auth: true
  from: test@163.com
  user: test@163.com
  pass: test-auth-code
  starttlsEnable: true
  sslEnable: true
  timeout: 0
  connectionTimeout: 0
```

### 环境切换策略

#### 方案一：配置文件分离

**application-dev.yml** （开发环境）
```yaml
mail:
  enabled: false  # 开发环境禁用
```

**application-prod.yml** （生产环境）
```yaml
mail:
  enabled: true   # 生产环境启用
  host: smtp.163.com
  port: 465
  # ... 其他配置
```

#### 方案二：环境变量

```yaml
mail:
  enabled: ${MAIL_ENABLED:false}        # 默认禁用
  host: ${MAIL_HOST:smtp.163.com}
  port: ${MAIL_PORT:465}
  user: ${MAIL_USER:}
  pass: ${MAIL_PASS:}
  from: ${MAIL_FROM:}
```

#### 方案三：配置加密

使用 Jasypt 对敏感信息加密：

```yaml
mail:
  enabled: true
  host: smtp.163.com
  port: 465
  user: ENC(encrypted_username)
  pass: ENC(encrypted_password)
  from: ENC(encrypted_email)
```

### 开发调试技巧

#### 1. 邮件发送测试

在开发环境中可以创建测试方法：

```java
@SpringBootTest
class MailUtilsTest {
    
    @Test
    @Disabled("开发环境测试，需手动启用")
    void testSendMail() {
        // 临时启用邮件服务进行测试
        String result = MailUtils.sendText(
            "developer@example.com", 
            "开发环境测试邮件", 
            "这是一封测试邮件，请忽略"
        );
        
        assertNotNull(result);
        System.out.println("邮件发送成功，MessageId: " + result);
    }
}
```

#### 2. 邮件内容预览

开发环境中可以将邮件内容输出到控制台：

```java
@Service
public class DevEmailService {
    
    @Value("${mail.enabled:false}")
    private boolean mailEnabled;
    
    public void sendEmail(String to, String subject, String content) {
        if (mailEnabled) {
            MailUtils.sendHtml(to, subject, content);
        } else {
            // 开发环境下输出邮件内容到控制台
            System.out.println("=== 邮件预览 ===");
            System.out.println("收件人: " + to);
            System.out.println("标题: " + subject);
            System.out.println("内容: " + content);
            System.out.println("===============");
        }
    }
}
```

#### 3. 使用邮件捕获工具

推荐使用 MailHog 或 MailCatcher 等工具在开发环境中捕获邮件：

```yaml
# 使用 MailHog 的配置
mail:
  enabled: true
  host: localhost
  port: 1025              # MailHog SMTP端口
  auth: false
  from: dev@localhost
  sslEnable: false
  starttlsEnable: false
```

### 常见问题

1. **邮件发送失败**
   - 检查SMTP服务器配置是否正确
   - 确认用户名和密码/授权码是否正确
   - 检查网络连接和防火墙设置

2. **SSL/TLS连接问题**
   - 确认端口和加密设置匹配
   - 检查Java版本是否支持所需的SSL/TLS版本

3. **附件过大**
   - 检查邮件服务商的附件大小限制
   - 考虑使用云存储链接替代大附件

### 日志配置

```yaml
logging:
  level:
    cn.hutool.extra.mail: DEBUG
    plus.ruoyi.common.mail: DEBUG
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础文本和HTML邮件发送
- 支持附件和内嵌图片
- 支持多收件人、抄送、密送
- Spring Boot自动配置支持
