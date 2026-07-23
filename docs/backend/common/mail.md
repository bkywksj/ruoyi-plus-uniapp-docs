# 邮件模块

## 概述

邮件模块是基于 Hutool 的邮件工具构建的 Spring Boot 自动配置模块，提供简单易用的邮件发送功能。支持文本邮件、HTML邮件、带附件邮件以及内嵌图片邮件的发送。

## 核心特性

- <Icon icon="lucide:rocket" /> **开箱即用**：Spring Boot 自动配置，无需复杂设置
- <Icon icon="lucide:mail" /> **多种格式**：支持纯文本、HTML、带附件邮件
- <Icon icon="lucide:image" /> **内嵌图片**：支持HTML邮件中的内嵌图片
- <Icon icon="lucide:users" /> **批量发送**：支持多收件人、抄送、密送
- <Icon icon="lucide:lock" /> **安全连接**：支持SSL/TLS和STARTTLS安全连接
- <Icon icon="lucide:settings" /> **灵活配置**：支持超时设置和多种SMTP服务器

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

## 邮件模板系统

### Thymeleaf 模板集成

使用 Thymeleaf 模板引擎创建专业的邮件模板。

```java
/**
 * 邮件模板服务
 */
@Service
@Slf4j
public class MailTemplateService {

    @Autowired
    private TemplateEngine templateEngine;

    /**
     * 发送模板邮件
     */
    public String sendTemplateEmail(String to, String templateName,
            Map<String, Object> variables) {
        try {
            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = templateEngine.process(templateName, context);

            return MailUtils.sendHtml(to, getSubjectFromTemplate(templateName), htmlContent);
        } catch (Exception e) {
            log.error("发送模板邮件失败: to={}, template={}", to, templateName, e);
            throw new ServiceException("邮件发送失败");
        }
    }

    /**
     * 发送欢迎邮件
     */
    public void sendWelcomeEmail(String to, String username) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("username", username);
        variables.put("loginUrl", "https://example.com/login");
        variables.put("year", Year.now().getValue());

        sendTemplateEmail(to, "email/welcome", variables);
    }

    /**
     * 发送密码重置邮件
     */
    public void sendPasswordResetEmail(String to, String resetToken, int expireMinutes) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("resetUrl", "https://example.com/reset?token=" + resetToken);
        variables.put("expireMinutes", expireMinutes);
        variables.put("year", Year.now().getValue());

        sendTemplateEmail(to, "email/password-reset", variables);
    }

    /**
     * 发送验证码邮件
     */
    public void sendVerificationCodeEmail(String to, String code, int expireMinutes) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("code", code);
        variables.put("expireMinutes", expireMinutes);

        sendTemplateEmail(to, "email/verification-code", variables);
    }

    /**
     * 发送订单确认邮件
     */
    public void sendOrderConfirmEmail(String to, OrderVo order) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("order", order);
        variables.put("items", order.getItems());
        variables.put("totalAmount", order.getTotalAmount());

        sendTemplateEmail(to, "email/order-confirm", variables);
    }
}
```

### 邮件模板示例

**欢迎邮件模板** (`resources/templates/email/welcome.html`):

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>欢迎加入</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1890ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #1890ff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>欢迎加入我们</h1>
        </div>
        <div class="content">
            <p>亲爱的 <span th:text="${username}">用户</span>，</p>
            <p>感谢您注册我们的平台！您的账号已成功创建。</p>
            <p>点击下方按钮开始使用：</p>
            <p style="text-align: center;">
                <a th:href="${loginUrl}" class="button">立即登录</a>
            </p>
            <p>如果您有任何问题，请随时联系我们的客服团队。</p>
        </div>
        <div class="footer">
            <p>© <span th:text="${year}">2024</span> 公司名称. 保留所有权利.</p>
            <p>如果这不是您的操作，请忽略此邮件。</p>
        </div>
    </div>
</body>
</html>
```

**验证码邮件模板** (`resources/templates/email/verification-code.html`):

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>验证码</title>
    <style>
        .code-box {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #1890ff;
            letter-spacing: 8px;
        }
        .expire-tip { color: #ff4d4f; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <p>您好，</p>
        <p>您正在进行账户验证操作，验证码如下：</p>
        <div class="code-box">
            <span class="code" th:text="${code}">123456</span>
        </div>
        <p class="expire-tip">
            验证码将在 <span th:text="${expireMinutes}">5</span> 分钟后失效，请尽快使用。
        </p>
        <p>如果这不是您的操作，请忽略此邮件，您的账户是安全的。</p>
    </div>
</body>
</html>
```

### FreeMarker 模板支持

```java
/**
 * FreeMarker 邮件模板服务
 */
@Service
public class FreeMarkerMailService {

    @Autowired
    private Configuration freemarkerConfig;

    public String processTemplate(String templateName, Map<String, Object> model) {
        try {
            Template template = freemarkerConfig.getTemplate(templateName + ".ftl");
            StringWriter writer = new StringWriter();
            template.process(model, writer);
            return writer.toString();
        } catch (Exception e) {
            throw new RuntimeException("处理邮件模板失败: " + templateName, e);
        }
    }

    public void sendTemplateEmail(String to, String subject,
            String templateName, Map<String, Object> model) {
        String content = processTemplate(templateName, model);
        MailUtils.sendHtml(to, subject, content);
    }
}
```

## 邮件队列

### 消息队列集成

使用消息队列实现邮件异步发送，提高系统响应性能。

```java
/**
 * 邮件消息定义
 */
@Data
public class MailMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 消息ID */
    private String messageId;

    /** 收件人列表 */
    private List<String> to;

    /** 抄送列表 */
    private List<String> cc;

    /** 密送列表 */
    private List<String> bcc;

    /** 邮件主题 */
    private String subject;

    /** 邮件内容 */
    private String content;

    /** 是否HTML格式 */
    private boolean html;

    /** 附件路径列表 */
    private List<String> attachments;

    /** 模板名称 */
    private String templateName;

    /** 模板变量 */
    private Map<String, Object> templateVariables;

    /** 优先级（1-高，2-中，3-低） */
    private Integer priority;

    /** 计划发送时间 */
    private Date scheduledTime;

    /** 创建时间 */
    private Date createTime;

    /** 租户ID */
    private String tenantId;

    public MailMessage() {
        this.messageId = IdUtils.fastUUID();
        this.createTime = new Date();
        this.priority = 2;
        this.html = true;
    }
}

/**
 * 邮件消息生产者
 */
@Component
@Slf4j
public class MailMessageProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    private static final String MAIL_TOPIC = "mail-send-topic";

    /**
     * 发送即时邮件
     */
    public void send(MailMessage message) {
        rocketMQTemplate.asyncSend(MAIL_TOPIC, message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                log.info("邮件消息发送成功: messageId={}, msgId={}",
                    message.getMessageId(), sendResult.getMsgId());
            }

            @Override
            public void onException(Throwable e) {
                log.error("邮件消息发送失败: messageId={}", message.getMessageId(), e);
            }
        });
    }

    /**
     * 发送延迟邮件
     */
    public void sendDelayed(MailMessage message, int delayLevel) {
        Message<MailMessage> msg = MessageBuilder.withPayload(message).build();
        rocketMQTemplate.syncSend(MAIL_TOPIC, msg, 3000, delayLevel);
    }

    /**
     * 发送定时邮件
     */
    public void sendScheduled(MailMessage message) {
        if (message.getScheduledTime() == null) {
            send(message);
            return;
        }

        long delay = message.getScheduledTime().getTime() - System.currentTimeMillis();
        if (delay <= 0) {
            send(message);
            return;
        }

        int delayLevel = calculateDelayLevel(delay);
        sendDelayed(message, delayLevel);
    }

    private int calculateDelayLevel(long delayMs) {
        long delaySeconds = delayMs / 1000;
        if (delaySeconds <= 60) return 5;       // 1分钟
        if (delaySeconds <= 300) return 9;      // 5分钟
        if (delaySeconds <= 600) return 14;     // 10分钟
        if (delaySeconds <= 1800) return 16;    // 30分钟
        return 17;                              // 1小时
    }
}

/**
 * 邮件消息消费者
 */
@Component
@Slf4j
@RocketMQMessageListener(
    topic = "mail-send-topic",
    consumerGroup = "mail-consumer-group",
    consumeThreadMax = 20
)
public class MailMessageConsumer implements RocketMQListener<MailMessage> {

    @Autowired
    private MailTemplateService templateService;

    @Autowired
    private MailSendRecordService recordService;

    @Override
    public void onMessage(MailMessage message) {
        String messageId = message.getMessageId();
        log.info("开始处理邮件消息: messageId={}", messageId);

        long startTime = System.currentTimeMillis();
        boolean success = false;
        String errorMsg = null;

        try {
            // 处理模板
            String content = message.getContent();
            if (StringUtils.isNotBlank(message.getTemplateName())) {
                content = templateService.processTemplate(
                    message.getTemplateName(),
                    message.getTemplateVariables()
                );
            }

            // 发送邮件
            if (message.isHtml()) {
                MailUtils.sendHtml(message.getTo(), message.getSubject(), content);
            } else {
                MailUtils.sendText(message.getTo(), message.getSubject(), content);
            }

            success = true;
            log.info("邮件发送成功: messageId={}, to={}", messageId, message.getTo());

        } catch (Exception e) {
            errorMsg = e.getMessage();
            log.error("邮件发送失败: messageId={}", messageId, e);
            throw new RuntimeException(e);  // 触发重试
        } finally {
            // 记录发送结果
            long costTime = System.currentTimeMillis() - startTime;
            recordService.saveRecord(message, success, errorMsg, costTime);
        }
    }
}
```

### Redis 队列方案

```java
/**
 * 基于 Redis 的邮件队列服务
 */
@Service
@Slf4j
public class RedisMailQueueService {

    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private MailSenderService mailSenderService;

    private static final String MAIL_QUEUE_KEY = "mail:queue";
    private static final String MAIL_DELAY_QUEUE_KEY = "mail:delay:queue";

    /**
     * 添加邮件到队列
     */
    public void enqueue(MailMessage message) {
        RQueue<MailMessage> queue = redissonClient.getQueue(MAIL_QUEUE_KEY);
        queue.add(message);
        log.info("邮件入队: messageId={}", message.getMessageId());
    }

    /**
     * 添加延迟邮件到队列
     */
    public void enqueueDelayed(MailMessage message, long delayMs) {
        RDelayedQueue<MailMessage> delayedQueue = redissonClient.getDelayedQueue(
            redissonClient.getQueue(MAIL_QUEUE_KEY)
        );
        delayedQueue.offer(message, delayMs, TimeUnit.MILLISECONDS);
        log.info("延迟邮件入队: messageId={}, delay={}ms", message.getMessageId(), delayMs);
    }

    /**
     * 消费邮件队列（定时任务调用）
     */
    @Scheduled(fixedDelay = 1000)
    public void processQueue() {
        RQueue<MailMessage> queue = redissonClient.getQueue(MAIL_QUEUE_KEY);

        MailMessage message;
        while ((message = queue.poll()) != null) {
            try {
                mailSenderService.send(message);
            } catch (Exception e) {
                log.error("处理邮件失败: messageId={}", message.getMessageId(), e);
                // 重新入队等待重试
                handleFailedMessage(message);
            }
        }
    }

    /**
     * 处理失败消息
     */
    private void handleFailedMessage(MailMessage message) {
        int retryCount = message.getRetryCount() + 1;
        if (retryCount <= 3) {
            message.setRetryCount(retryCount);
            // 延迟重试（指数退避）
            long delay = (long) Math.pow(2, retryCount) * 60 * 1000;
            enqueueDelayed(message, delay);
        } else {
            log.error("邮件发送失败次数超过限制: messageId={}", message.getMessageId());
            // 保存到失败队列
            saveToFailedQueue(message);
        }
    }
}
```

## 邮件发送记录

### 发送记录服务

```java
/**
 * 邮件发送记录实体
 */
@Data
@TableName("sys_mail_record")
public class MailSendRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 消息ID */
    private String messageId;

    /** 租户ID */
    private String tenantId;

    /** 收件人 */
    private String recipients;

    /** 抄送 */
    private String cc;

    /** 密送 */
    private String bcc;

    /** 主题 */
    private String subject;

    /** 内容摘要 */
    private String contentSummary;

    /** 发送状态（0-待发送，1-发送中，2-成功，3-失败） */
    private Integer status;

    /** 错误信息 */
    private String errorMsg;

    /** 重试次数 */
    private Integer retryCount;

    /** 发送耗时（毫秒） */
    private Long costTime;

    /** 创建时间 */
    private Date createTime;

    /** 发送时间 */
    private Date sendTime;

    /** 创建人 */
    private String createBy;
}

/**
 * 邮件发送记录服务
 */
@Service
@Slf4j
public class MailSendRecordService {

    @Autowired
    private MailSendRecordMapper recordMapper;

    /**
     * 保存发送记录
     */
    public void saveRecord(MailMessage message, boolean success,
            String errorMsg, long costTime) {
        MailSendRecord record = new MailSendRecord();
        record.setMessageId(message.getMessageId());
        record.setTenantId(message.getTenantId());
        record.setRecipients(String.join(",", message.getTo()));
        record.setCc(CollUtil.isEmpty(message.getCc()) ? null :
            String.join(",", message.getCc()));
        record.setBcc(CollUtil.isEmpty(message.getBcc()) ? null :
            String.join(",", message.getBcc()));
        record.setSubject(message.getSubject());
        record.setContentSummary(truncateContent(message.getContent(), 500));
        record.setStatus(success ? 2 : 3);
        record.setErrorMsg(errorMsg);
        record.setRetryCount(0);
        record.setCostTime(costTime);
        record.setCreateTime(message.getCreateTime());
        record.setSendTime(new Date());
        record.setCreateBy(SecurityUtils.getUsername());

        recordMapper.insert(record);
    }

    /**
     * 分页查询发送记录
     */
    public TableDataInfo<MailSendRecordVo> queryPageList(MailRecordQuery query) {
        Page<MailSendRecord> page = new Page<>(query.getPageNum(), query.getPageSize());

        LambdaQueryWrapper<MailSendRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.isNotBlank(query.getRecipients()),
            MailSendRecord::getRecipients, query.getRecipients());
        wrapper.like(StringUtils.isNotBlank(query.getSubject()),
            MailSendRecord::getSubject, query.getSubject());
        wrapper.eq(query.getStatus() != null, MailSendRecord::getStatus, query.getStatus());
        wrapper.between(query.getStartTime() != null && query.getEndTime() != null,
            MailSendRecord::getSendTime, query.getStartTime(), query.getEndTime());
        wrapper.orderByDesc(MailSendRecord::getCreateTime);

        Page<MailSendRecord> result = recordMapper.selectPage(page, wrapper);

        return TableDataInfo.build(BeanUtil.copyToList(result.getRecords(),
            MailSendRecordVo.class), result.getTotal());
    }

    /**
     * 获取发送统计
     */
    public MailStatistics getStatistics(Date startDate, Date endDate) {
        MailStatistics statistics = new MailStatistics();

        // 总发送数
        statistics.setTotalCount(recordMapper.selectCount(new LambdaQueryWrapper<MailSendRecord>()
            .between(MailSendRecord::getSendTime, startDate, endDate)));

        // 成功数
        statistics.setSuccessCount(recordMapper.selectCount(new LambdaQueryWrapper<MailSendRecord>()
            .eq(MailSendRecord::getStatus, 2)
            .between(MailSendRecord::getSendTime, startDate, endDate)));

        // 失败数
        statistics.setFailCount(recordMapper.selectCount(new LambdaQueryWrapper<MailSendRecord>()
            .eq(MailSendRecord::getStatus, 3)
            .between(MailSendRecord::getSendTime, startDate, endDate)));

        // 平均耗时
        statistics.setAvgCostTime(recordMapper.selectAvgCostTime(startDate, endDate));

        return statistics;
    }

    /**
     * 重发失败邮件
     */
    public void resend(Long recordId) {
        MailSendRecord record = recordMapper.selectById(recordId);
        if (record == null) {
            throw new ServiceException("记录不存在");
        }

        if (record.getStatus() != 3) {
            throw new ServiceException("只能重发失败的邮件");
        }

        // 构建邮件消息
        MailMessage message = new MailMessage();
        message.setTo(Arrays.asList(record.getRecipients().split(",")));
        message.setSubject(record.getSubject());
        // ... 从原始记录重建消息

        // 发送邮件
        mailMessageProducer.send(message);

        // 更新状态为待发送
        record.setStatus(1);
        record.setRetryCount(record.getRetryCount() + 1);
        recordMapper.updateById(record);
    }

    private String truncateContent(String content, int maxLength) {
        if (StringUtils.isBlank(content)) {
            return content;
        }
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}
```

### 记录查询接口

```java
/**
 * 邮件记录控制器
 */
@RestController
@RequestMapping("/mail/record")
@RequiredArgsConstructor
public class MailRecordController {

    private final MailSendRecordService recordService;

    /**
     * 分页查询邮件记录
     */
    @GetMapping("/list")
    @SaCheckPermission("mail:record:list")
    public TableDataInfo<MailSendRecordVo> list(MailRecordQuery query) {
        return recordService.queryPageList(query);
    }

    /**
     * 获取邮件详情
     */
    @GetMapping("/{id}")
    @SaCheckPermission("mail:record:query")
    public R<MailSendRecordVo> getInfo(@PathVariable Long id) {
        return R.ok(recordService.getRecordDetail(id));
    }

    /**
     * 重发邮件
     */
    @PostMapping("/resend/{id}")
    @SaCheckPermission("mail:record:resend")
    public R<Void> resend(@PathVariable Long id) {
        recordService.resend(id);
        return R.ok();
    }

    /**
     * 获取发送统计
     */
    @GetMapping("/statistics")
    @SaCheckPermission("mail:record:query")
    public R<MailStatistics> getStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return R.ok(recordService.getStatistics(startDate, endDate));
    }

    /**
     * 导出邮件记录
     */
    @PostMapping("/export")
    @SaCheckPermission("mail:record:export")
    public void export(MailRecordQuery query, HttpServletResponse response) {
        List<MailSendRecordVo> list = recordService.queryList(query);
        ExcelUtil.exportExcel(list, "邮件发送记录", MailSendRecordVo.class, response);
    }
}
```

## 多租户支持

### 租户邮件配置

```java
/**
 * 租户邮件配置实体
 */
@Data
@TableName("sys_tenant_mail_config")
public class TenantMailConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 租户ID */
    private String tenantId;

    /** SMTP服务器 */
    private String host;

    /** 端口 */
    private Integer port;

    /** 发件人地址 */
    private String fromAddress;

    /** 发件人名称 */
    private String fromName;

    /** 用户名 */
    private String username;

    /** 密码（加密存储） */
    private String password;

    /** 是否启用SSL */
    private Boolean sslEnabled;

    /** 是否启用STARTTLS */
    private Boolean starttlsEnabled;

    /** 连接超时（毫秒） */
    private Long connectionTimeout;

    /** 读取超时（毫秒） */
    private Long timeout;

    /** 每日发送限制 */
    private Integer dailyLimit;

    /** 是否启用 */
    private Boolean enabled;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}

/**
 * 多租户邮件服务
 */
@Service
@Slf4j
public class TenantMailService {

    @Autowired
    private TenantMailConfigMapper configMapper;

    @Autowired
    private StringEncryptor stringEncryptor;

    private final Cache<String, MailAccount> accountCache = Caffeine.newBuilder()
        .expireAfterWrite(Duration.ofMinutes(30))
        .maximumSize(100)
        .build();

    /**
     * 获取租户邮件账户
     */
    public MailAccount getTenantMailAccount(String tenantId) {
        return accountCache.get(tenantId, key -> {
            TenantMailConfig config = configMapper.selectOne(
                new LambdaQueryWrapper<TenantMailConfig>()
                    .eq(TenantMailConfig::getTenantId, tenantId)
                    .eq(TenantMailConfig::getEnabled, true)
            );

            if (config == null) {
                log.warn("租户邮件配置不存在: tenantId={}", tenantId);
                return null;
            }

            return buildMailAccount(config);
        });
    }

    /**
     * 构建邮件账户
     */
    private MailAccount buildMailAccount(TenantMailConfig config) {
        MailAccount account = new MailAccount();
        account.setHost(config.getHost());
        account.setPort(config.getPort());
        account.setFrom(config.getFromName() + " <" + config.getFromAddress() + ">");
        account.setUser(config.getUsername());
        account.setPass(stringEncryptor.decrypt(config.getPassword()));
        account.setAuth(true);
        account.setSslEnable(config.getSslEnabled());
        account.setStarttlsEnable(config.getStarttlsEnabled());

        if (config.getConnectionTimeout() != null && config.getConnectionTimeout() > 0) {
            account.setConnectionTimeout(config.getConnectionTimeout());
        }
        if (config.getTimeout() != null && config.getTimeout() > 0) {
            account.setTimeout(config.getTimeout());
        }

        return account;
    }

    /**
     * 发送租户邮件
     */
    public String sendTenantMail(String tenantId, String to, String subject,
            String content, boolean isHtml) {
        MailAccount account = getTenantMailAccount(tenantId);
        if (account == null) {
            throw new ServiceException("租户邮件服务未配置");
        }

        // 检查发送限制
        checkDailyLimit(tenantId);

        return cn.hutool.extra.mail.MailUtil.send(account,
            Collections.singletonList(to), null, null, subject, content, isHtml);
    }

    /**
     * 检查每日发送限制
     */
    private void checkDailyLimit(String tenantId) {
        TenantMailConfig config = configMapper.selectOne(
            new LambdaQueryWrapper<TenantMailConfig>()
                .eq(TenantMailConfig::getTenantId, tenantId)
        );

        if (config.getDailyLimit() == null || config.getDailyLimit() <= 0) {
            return;
        }

        // 查询今日发送数量
        long todaySent = recordMapper.countTodaySent(tenantId);
        if (todaySent >= config.getDailyLimit()) {
            throw new ServiceException("已达到每日发送限制: " + config.getDailyLimit());
        }
    }

    /**
     * 刷新租户配置缓存
     */
    public void refreshCache(String tenantId) {
        accountCache.invalidate(tenantId);
        log.info("刷新租户邮件配置缓存: tenantId={}", tenantId);
    }

    /**
     * 刷新所有缓存
     */
    public void refreshAllCache() {
        accountCache.invalidateAll();
        log.info("刷新所有租户邮件配置缓存");
    }
}
```

### 租户配置管理接口

```java
/**
 * 租户邮件配置控制器
 */
@RestController
@RequestMapping("/tenant/mail/config")
@RequiredArgsConstructor
public class TenantMailConfigController {

    private final TenantMailConfigService configService;

    /**
     * 获取当前租户配置
     */
    @GetMapping
    @SaCheckPermission("tenant:mail:query")
    public R<TenantMailConfigVo> getConfig() {
        String tenantId = TenantHelper.getTenantId();
        return R.ok(configService.getConfig(tenantId));
    }

    /**
     * 保存配置
     */
    @PostMapping
    @SaCheckPermission("tenant:mail:edit")
    public R<Void> saveConfig(@Validated @RequestBody TenantMailConfigBo bo) {
        String tenantId = TenantHelper.getTenantId();
        configService.saveConfig(tenantId, bo);
        return R.ok();
    }

    /**
     * 测试邮件连接
     */
    @PostMapping("/test")
    @SaCheckPermission("tenant:mail:edit")
    public R<Void> testConnection(@RequestBody TenantMailConfigBo bo) {
        configService.testConnection(bo);
        return R.ok();
    }

    /**
     * 发送测试邮件
     */
    @PostMapping("/sendTest")
    @SaCheckPermission("tenant:mail:edit")
    public R<Void> sendTestMail(@RequestParam String to) {
        String tenantId = TenantHelper.getTenantId();
        configService.sendTestMail(tenantId, to);
        return R.ok();
    }
}
```

## 邮件服务健康检查

### 健康检查服务

```java
/**
 * 邮件服务健康检查
 */
@Component
@Slf4j
public class MailHealthIndicator implements HealthIndicator {

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${mail.host:}")
    private String mailHost;

    @Value("${mail.port:0}")
    private int mailPort;

    @Override
    public Health health() {
        if (!mailEnabled) {
            return Health.up()
                .withDetail("status", "disabled")
                .withDetail("message", "邮件服务未启用")
                .build();
        }

        try {
            // 测试SMTP连接
            boolean connected = testSmtpConnection();

            if (connected) {
                return Health.up()
                    .withDetail("host", mailHost)
                    .withDetail("port", mailPort)
                    .withDetail("status", "connected")
                    .build();
            } else {
                return Health.down()
                    .withDetail("host", mailHost)
                    .withDetail("port", mailPort)
                    .withDetail("status", "connection_failed")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("host", mailHost)
                .withDetail("port", mailPort)
                .withDetail("error", e.getMessage())
                .build();
        }
    }

    /**
     * 测试SMTP连接
     */
    private boolean testSmtpConnection() {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(mailHost, mailPort), 5000);
            return true;
        } catch (IOException e) {
            log.warn("SMTP连接测试失败: host={}, port={}", mailHost, mailPort, e);
            return false;
        }
    }
}

/**
 * 邮件连接测试服务
 */
@Service
@Slf4j
public class MailConnectionTestService {

    /**
     * 测试邮件服务器连接
     */
    public ConnectionTestResult testConnection(MailAccount account) {
        ConnectionTestResult result = new ConnectionTestResult();
        result.setStartTime(new Date());

        try {
            // 1. 测试TCP连接
            testTcpConnection(account.getHost(), account.getPort(), result);

            // 2. 测试SMTP认证
            testSmtpAuth(account, result);

            result.setSuccess(true);
            result.setMessage("连接测试成功");

        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("连接测试失败: " + e.getMessage());
            log.error("邮件连接测试失败", e);
        }

        result.setEndTime(new Date());
        result.setCostTime(result.getEndTime().getTime() - result.getStartTime().getTime());

        return result;
    }

    private void testTcpConnection(String host, int port, ConnectionTestResult result) {
        long start = System.currentTimeMillis();

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 10000);
            result.setTcpConnected(true);
            result.setTcpConnectTime(System.currentTimeMillis() - start);
        } catch (IOException e) {
            result.setTcpConnected(false);
            result.setTcpError(e.getMessage());
            throw new RuntimeException("TCP连接失败: " + e.getMessage());
        }
    }

    private void testSmtpAuth(MailAccount account, ConnectionTestResult result) {
        long start = System.currentTimeMillis();

        try {
            // 使用 Hutool 进行简单的发件人验证
            Session session = cn.hutool.extra.mail.MailUtil.getSession(account, false);
            Transport transport = session.getTransport("smtp");
            transport.connect(account.getHost(), account.getPort(),
                account.getUser(), account.getPass());
            transport.close();

            result.setAuthSuccess(true);
            result.setAuthTime(System.currentTimeMillis() - start);

        } catch (Exception e) {
            result.setAuthSuccess(false);
            result.setAuthError(e.getMessage());
            throw new RuntimeException("SMTP认证失败: " + e.getMessage());
        }
    }
}

/**
 * 连接测试结果
 */
@Data
public class ConnectionTestResult {
    private boolean success;
    private String message;
    private Date startTime;
    private Date endTime;
    private long costTime;
    private boolean tcpConnected;
    private long tcpConnectTime;
    private String tcpError;
    private boolean authSuccess;
    private long authTime;
    private String authError;
}
```

## 国际化支持

### 多语言邮件服务

```java
/**
 * 国际化邮件服务
 */
@Service
@Slf4j
public class I18nMailService {

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private MailTemplateService templateService;

    /**
     * 发送国际化邮件
     */
    public void sendI18nMail(String to, String templateKey,
            Map<String, Object> variables, Locale locale) {
        // 获取国际化主题
        String subject = messageSource.getMessage(
            "mail." + templateKey + ".subject", null, locale);

        // 添加国际化变量
        variables.put("locale", locale.getLanguage());
        variables.put("greeting", getGreeting(locale));

        // 使用对应语言的模板
        String templateName = "email/" + templateKey + "_" + locale.getLanguage();

        try {
            templateService.sendTemplateEmail(to, templateName, variables);
        } catch (Exception e) {
            // 如果找不到语言特定模板，使用默认模板
            log.warn("未找到语言特定模板: {}, 使用默认模板", templateName);
            templateService.sendTemplateEmail(to, "email/" + templateKey, variables);
        }
    }

    /**
     * 获取问候语
     */
    private String getGreeting(Locale locale) {
        int hour = LocalTime.now().getHour();
        String greetingKey;

        if (hour < 12) {
            greetingKey = "mail.greeting.morning";
        } else if (hour < 18) {
            greetingKey = "mail.greeting.afternoon";
        } else {
            greetingKey = "mail.greeting.evening";
        }

        return messageSource.getMessage(greetingKey, null, locale);
    }

    /**
     * 发送多语言欢迎邮件
     */
    public void sendWelcomeEmail(String to, String username, Locale locale) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("username", username);
        variables.put("loginUrl", "https://example.com/login");

        sendI18nMail(to, "welcome", variables, locale);
    }
}
```

### 国际化资源配置

```properties
# messages_zh_CN.properties
mail.welcome.subject=欢迎加入我们
mail.password-reset.subject=密码重置
mail.verification.subject=验证码
mail.greeting.morning=早上好
mail.greeting.afternoon=下午好
mail.greeting.evening=晚上好

# messages_en_US.properties
mail.welcome.subject=Welcome to Join Us
mail.password-reset.subject=Password Reset
mail.verification.subject=Verification Code
mail.greeting.morning=Good Morning
mail.greeting.afternoon=Good Afternoon
mail.greeting.evening=Good Evening
```

## 附件处理

### 大附件处理

```java
/**
 * 附件处理服务
 */
@Service
@Slf4j
public class MailAttachmentService {

    @Autowired
    private OssService ossService;

    /** 直接附件最大大小（10MB） */
    private static final long MAX_DIRECT_ATTACHMENT_SIZE = 10 * 1024 * 1024;

    /** 单封邮件附件总大小限制（25MB） */
    private static final long MAX_TOTAL_ATTACHMENT_SIZE = 25 * 1024 * 1024;

    /**
     * 处理附件，大文件转为下载链接
     */
    public AttachmentResult processAttachments(List<File> files) {
        AttachmentResult result = new AttachmentResult();
        result.setDirectAttachments(new ArrayList<>());
        result.setDownloadLinks(new ArrayList<>());

        long totalSize = 0;

        for (File file : files) {
            long fileSize = file.length();
            totalSize += fileSize;

            if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
                // 超过总大小限制，转为下载链接
                String downloadUrl = uploadToOss(file);
                result.getDownloadLinks().add(new AttachmentLink(
                    file.getName(), fileSize, downloadUrl
                ));
            } else if (fileSize > MAX_DIRECT_ATTACHMENT_SIZE) {
                // 单文件过大，转为下载链接
                String downloadUrl = uploadToOss(file);
                result.getDownloadLinks().add(new AttachmentLink(
                    file.getName(), fileSize, downloadUrl
                ));
                totalSize -= fileSize;  // 不计入直接附件大小
            } else {
                // 直接作为附件
                result.getDirectAttachments().add(file);
            }
        }

        return result;
    }

    /**
     * 上传文件到OSS并返回下载链接
     */
    private String uploadToOss(File file) {
        try {
            // 上传文件
            String objectName = "mail-attachments/" + IdUtils.fastUUID() + "/" + file.getName();
            ossService.upload(file, objectName);

            // 生成临时下载链接（7天有效）
            return ossService.getPresignedUrl(objectName, Duration.ofDays(7));
        } catch (Exception e) {
            log.error("上传附件到OSS失败: {}", file.getName(), e);
            throw new ServiceException("附件处理失败");
        }
    }

    /**
     * 构建包含下载链接的邮件内容
     */
    public String buildContentWithLinks(String content, List<AttachmentLink> links) {
        if (CollUtil.isEmpty(links)) {
            return content;
        }

        StringBuilder sb = new StringBuilder(content);
        sb.append("<br/><br/>");
        sb.append("<div style=\"background:#f5f5f5;padding:15px;border-radius:4px;\">");
        sb.append("<p><strong>附件下载：</strong></p>");
        sb.append("<ul>");

        for (AttachmentLink link : links) {
            sb.append("<li>");
            sb.append("<a href=\"").append(link.getUrl()).append("\">");
            sb.append(link.getFileName());
            sb.append("</a>");
            sb.append(" (").append(formatFileSize(link.getFileSize())).append(")");
            sb.append(" - 链接7天内有效");
            sb.append("</li>");
        }

        sb.append("</ul>");
        sb.append("</div>");

        return sb.toString();
    }

    private String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.1f KB", size / 1024.0);
        } else {
            return String.format("%.1f MB", size / (1024.0 * 1024));
        }
    }
}

@Data
@AllArgsConstructor
public class AttachmentLink {
    private String fileName;
    private long fileSize;
    private String url;
}

@Data
public class AttachmentResult {
    private List<File> directAttachments;
    private List<AttachmentLink> downloadLinks;
}
```

## 监控与告警

### 邮件发送监控

```java
/**
 * 邮件监控服务
 */
@Component
@Slf4j
public class MailMonitorService {

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private NotificationService notificationService;

    // 发送计数器
    private final Counter sendCounter;
    private final Counter successCounter;
    private final Counter failCounter;

    // 发送耗时
    private final Timer sendTimer;

    // 失败率告警阈值
    private static final double FAIL_RATE_THRESHOLD = 0.1;

    public MailMonitorService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        this.sendCounter = Counter.builder("mail.send.total")
            .description("邮件发送总数")
            .register(meterRegistry);

        this.successCounter = Counter.builder("mail.send.success")
            .description("邮件发送成功数")
            .register(meterRegistry);

        this.failCounter = Counter.builder("mail.send.fail")
            .description("邮件发送失败数")
            .register(meterRegistry);

        this.sendTimer = Timer.builder("mail.send.duration")
            .description("邮件发送耗时")
            .register(meterRegistry);
    }

    /**
     * 记录发送请求
     */
    public void recordSendRequest() {
        sendCounter.increment();
    }

    /**
     * 记录发送结果
     */
    public void recordSendResult(boolean success, long costTime) {
        if (success) {
            successCounter.increment();
        } else {
            failCounter.increment();
        }

        sendTimer.record(costTime, TimeUnit.MILLISECONDS);
    }

    /**
     * 定时检查失败率
     */
    @Scheduled(fixedRate = 300000)  // 每5分钟
    public void checkFailRate() {
        double total = sendCounter.count();
        double fail = failCounter.count();

        if (total > 100) {
            double failRate = fail / total;

            if (failRate > FAIL_RATE_THRESHOLD) {
                sendAlert("邮件发送失败率告警",
                    String.format("当前邮件发送失败率 %.2f%% 超过阈值 %.2f%%",
                        failRate * 100, FAIL_RATE_THRESHOLD * 100));
            }
        }
    }

    /**
     * 发送告警
     */
    private void sendAlert(String title, String content) {
        log.warn("邮件告警: {} - {}", title, content);
        notificationService.sendDingTalkAlert(title, content);
    }
}
```

### 发送统计报表

```java
/**
 * 邮件统计服务
 */
@Service
public class MailStatisticsService {

    @Autowired
    private MailSendRecordMapper recordMapper;

    /**
     * 获取每日统计
     */
    public List<DailyStatistics> getDailyStatistics(Date startDate, Date endDate) {
        return recordMapper.selectDailyStatistics(startDate, endDate);
    }

    /**
     * 获取按类型统计
     */
    public Map<String, Long> getStatisticsByType(Date startDate, Date endDate) {
        return recordMapper.selectStatisticsByType(startDate, endDate);
    }

    /**
     * 生成月度报表
     */
    public MonthlyReport generateMonthlyReport(int year, int month) {
        MonthlyReport report = new MonthlyReport();
        report.setYear(year);
        report.setMonth(month);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        Date start = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date end = Date.from(endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());

        // 总发送数
        report.setTotalCount(recordMapper.countByDateRange(start, end));

        // 成功数
        report.setSuccessCount(recordMapper.countByStatusAndDateRange(2, start, end));

        // 失败数
        report.setFailCount(recordMapper.countByStatusAndDateRange(3, start, end));

        // 成功率
        if (report.getTotalCount() > 0) {
            report.setSuccessRate((double) report.getSuccessCount() / report.getTotalCount());
        }

        // 每日统计
        report.setDailyStatistics(getDailyStatistics(start, end));

        return report;
    }
}
```

## 注意事项

### 1. 授权码使用

```java
// ✅ 正确：使用邮箱授权码
mail:
  pass: abcdefghijklmnop  # 16位授权码

// ❌ 错误：使用登录密码
mail:
  pass: myLoginPassword123  # 登录密码通常无法用于SMTP
```

### 2. 发件人格式

```java
// ✅ 正确：RFC-822 标准格式
mail:
  from: "系统通知 <noreply@example.com>"  # 带名称
  # 或
  from: noreply@example.com               # 仅地址

// ❌ 错误：格式不规范
mail:
  from: <noreply@example.com>  # 缺少名称时不需要尖括号
```

### 3. SSL/TLS 配置

```java
// ✅ 正确：SSL 模式（端口465）
mail:
  port: 465
  sslEnable: true
  starttlsEnable: false

// ✅ 正确：STARTTLS 模式（端口587）
mail:
  port: 587
  sslEnable: false
  starttlsEnable: true

// ❌ 错误：端口和加密方式不匹配
mail:
  port: 465
  sslEnable: false  # 465端口通常需要SSL
```

### 4. 批量发送限制

```java
// ✅ 正确：分批发送，添加延迟
public void sendBulkEmails(List<String> recipients, String subject, String content) {
    int batchSize = 50;  // 每批50封

    for (int i = 0; i < recipients.size(); i += batchSize) {
        List<String> batch = recipients.subList(i, Math.min(i + batchSize, recipients.size()));
        MailUtils.sendHtml(batch, subject, content);

        // 批次间延迟
        Thread.sleep(1000);
    }
}

// ❌ 错误：一次发送大量邮件
public void sendBulkEmails(List<String> recipients, String subject, String content) {
    // 可能触发服务商限制
    MailUtils.sendHtml(recipients, subject, content);
}
```

### 5. 邮件内容安全

```java
// ✅ 正确：对用户输入进行转义
public String buildSafeHtmlContent(String userInput) {
    String safeContent = HtmlUtil.escape(userInput);
    return "<p>" + safeContent + "</p>";
}

// ❌ 错误：直接使用用户输入
public String buildHtmlContent(String userInput) {
    // 可能导致XSS攻击
    return "<p>" + userInput + "</p>";
}
```

### 6. 附件大小限制

```java
// ✅ 正确：检查附件大小
public void sendWithAttachment(String to, String subject, File attachment) {
    // 检查单文件大小（通常限制10-25MB）
    if (attachment.length() > 25 * 1024 * 1024) {
        throw new ServiceException("附件大小超过限制");
    }

    MailUtils.sendHtml(to, subject, content, attachment);
}

// ❌ 错误：不检查附件大小
public void sendWithAttachment(String to, String subject, File attachment) {
    // 可能因附件过大导致发送失败
    MailUtils.sendHtml(to, subject, content, attachment);
}
```

### 7. 收件人验证

```java
// ✅ 正确：验证邮箱格式
public void sendEmail(String to, String subject, String content) {
    if (!isValidEmail(to)) {
        throw new ServiceException("无效的邮箱地址");
    }

    MailUtils.sendHtml(to, subject, content);
}

private boolean isValidEmail(String email) {
    return email != null &&
           email.matches("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
}

// ❌ 错误：不验证直接发送
public void sendEmail(String to, String subject, String content) {
    // 可能发送到无效地址
    MailUtils.sendHtml(to, subject, content);
}
```

### 8. 异步发送处理

```java
// ✅ 正确：异步发送并处理异常
@Async("mailExecutor")
public CompletableFuture<String> sendEmailAsync(String to, String subject, String content) {
    try {
        String messageId = MailUtils.sendHtml(to, subject, content);
        log.info("邮件发送成功: to={}, messageId={}", to, messageId);
        return CompletableFuture.completedFuture(messageId);
    } catch (Exception e) {
        log.error("邮件发送失败: to={}", to, e);
        // 记录失败，可以后续重试
        recordFailedEmail(to, subject, content, e);
        return CompletableFuture.failedFuture(e);
    }
}

// ❌ 错误：异步发送不处理异常
@Async
public void sendEmailAsync(String to, String subject, String content) {
    // 异常被吞没，难以追踪问题
    MailUtils.sendHtml(to, subject, content);
}
```

### 9. 敏感信息保护

```java
// ✅ 正确：配置加密
mail:
  pass: ENC(encrypted_auth_code)  # 使用Jasypt加密

// ✅ 正确：使用环境变量
mail:
  pass: ${MAIL_AUTH_CODE}  # 从环境变量读取

// ❌ 错误：明文存储
mail:
  pass: myAuthCode123456  # 授权码明文存储在配置文件中
```

### 10. 日志脱敏

```java
// ✅ 正确：日志中脱敏敏感信息
public void logMailSend(String to, String subject) {
    String maskedTo = maskEmail(to);  // user@example.com -> u***@example.com
    log.info("发送邮件: to={}, subject={}", maskedTo, subject);
}

private String maskEmail(String email) {
    int atIndex = email.indexOf('@');
    if (atIndex > 1) {
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
    return "***";
}

// ❌ 错误：记录完整邮箱地址
public void logMailSend(String to, String subject) {
    log.info("发送邮件: to={}, subject={}", to, subject);  // 泄露用户邮箱
}
```

## MailUtils API 完整参考

### 核心类概览

`MailUtils` 是邮件模块的核心工具类，继承自 Hutool 的邮件工具，提供了丰富的静态方法用于邮件发送。

```java
/**
 * 邮件工具类
 *
 * 特性：
 * 1. 基于 Hutool 的 JakartaMail 实现
 * 2. 自动从 Spring 容器获取 MailAccount 配置
 * 3. 支持多种发送方式：文本、HTML、附件、内嵌图片
 * 4. 支持多收件人、抄送、密送
 * 5. 支持自定义邮件账户
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class MailUtils {
    // 从 Spring 容器获取邮件账户配置
    private static final MailAccount ACCOUNT = SpringUtils.getBean(MailAccount.class);
}
```

### 获取邮件账户

```java
/**
 * 获取默认邮件账户
 * 从 Spring 容器获取配置好的 MailAccount 实例
 */
public static MailAccount getMailAccount();

/**
 * 获取自定义邮件账户
 * 基于默认账户，覆盖指定的发件人信息
 *
 * @param from 发件人地址（为空时使用默认值）
 * @param user 用户名（为空时使用默认值）
 * @param pass 密码/授权码（为空时使用默认值）
 */
public static MailAccount getMailAccount(String from, String user, String pass);
```

**使用示例：**

```java
// 获取默认账户
MailAccount account = MailUtils.getMailAccount();
log.info("默认发件人: {}", account.getFrom());

// 临时切换发件人
MailAccount customAccount = MailUtils.getMailAccount(
    "另一个邮箱 <other@example.com>",
    "other@example.com",
    "other-auth-code"
);
```

### 发送文本邮件

```java
/**
 * 发送文本邮件（单个或多个收件人）
 * 多个收件人使用逗号","或分号";"分隔
 *
 * @param to      收件人
 * @param subject 邮件标题
 * @param content 邮件内容（纯文本）
 * @param files   附件列表（可选）
 * @return message-id
 */
public static String sendText(String to, String subject, String content, File... files);

/**
 * 发送文本邮件给多人
 *
 * @param tos     收件人列表
 * @param subject 邮件标题
 * @param content 邮件内容
 * @param files   附件列表
 * @return message-id
 */
public static String sendText(Collection<String> tos, String subject, String content, File... files);
```

**使用示例：**

```java
// 发送给单个收件人
String messageId = MailUtils.sendText(
    "user@example.com",
    "测试邮件",
    "这是一封测试邮件"
);

// 发送给多个收件人（逗号分隔）
MailUtils.sendText(
    "user1@example.com,user2@example.com",
    "通知",
    "重要通知内容"
);

// 发送给多个收件人（列表方式）
List<String> recipients = Arrays.asList(
    "user1@example.com",
    "user2@example.com"
);
MailUtils.sendText(recipients, "群发通知", "这是群发的通知");

// 带附件的文本邮件
File report = new File("/path/to/report.pdf");
MailUtils.sendText(
    "manager@example.com",
    "月度报告",
    "请查看附件中的月度报告",
    report
);
```

### 发送HTML邮件

```java
/**
 * 发送HTML邮件（单个或多个收件人）
 *
 * @param to      收件人
 * @param subject 邮件标题
 * @param content HTML格式内容
 * @param files   附件列表
 * @return message-id
 */
public static String sendHtml(String to, String subject, String content, File... files);

/**
 * 发送HTML邮件给多人
 */
public static String sendHtml(Collection<String> tos, String subject, String content, File... files);

/**
 * 发送带内嵌图片的HTML邮件
 *
 * @param to       收件人
 * @param subject  邮件标题
 * @param content  HTML内容（使用cid:引用图片）
 * @param imageMap 图片映射（key为占位符，value为图片流）
 * @param files    附件列表
 * @return message-id
 */
public static String sendHtml(String to, String subject, String content,
        Map<String, InputStream> imageMap, File... files);
```

**使用示例：**

```java
// 简单HTML邮件
String html = """
    <html>
    <body>
        <h1 style="color: #1890ff;">欢迎注册</h1>
        <p>感谢您注册我们的服务！</p>
        <a href="https://example.com" style="
            display: inline-block;
            padding: 10px 20px;
            background: #1890ff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        ">立即登录</a>
    </body>
    </html>
    """;

MailUtils.sendHtml("user@example.com", "欢迎注册", html);

// 带内嵌图片的HTML邮件
Map<String, InputStream> images = new HashMap<>();
images.put("logo", new FileInputStream("/path/to/logo.png"));
images.put("banner", new FileInputStream("/path/to/banner.jpg"));

String htmlWithImages = """
    <html>
    <body>
        <img src="cid:logo" alt="Logo" style="width: 100px;" />
        <h1>新品上市</h1>
        <img src="cid:banner" alt="Banner" style="width: 100%;" />
        <p>点击查看更多...</p>
    </body>
    </html>
    """;

MailUtils.sendHtml("customer@example.com", "新品推荐", htmlWithImages, images);
```

### 发送抄送/密送邮件

```java
/**
 * 发送带抄送和密送的邮件
 *
 * @param to      收件人（多个用逗号或分号分隔）
 * @param cc      抄送人（多个用逗号或分号分隔）
 * @param bcc     密送人（多个用逗号或分号分隔）
 * @param subject 标题
 * @param content 内容
 * @param isHtml  是否HTML格式
 * @param files   附件
 * @return message-id
 */
public static String send(String to, String cc, String bcc, String subject,
        String content, boolean isHtml, File... files);

/**
 * 发送带抄送和密送的邮件（列表方式）
 */
public static String send(Collection<String> tos, Collection<String> ccs,
        Collection<String> bccs, String subject, String content,
        boolean isHtml, File... files);
```

**使用示例：**

```java
// 使用字符串形式
MailUtils.send(
    "primary@example.com",           // 主收件人
    "cc1@example.com,cc2@example.com", // 抄送
    "bcc@example.com",               // 密送
    "项目进度报告",
    "<h1>本周进度</h1><p>项目进展顺利...</p>",
    true  // HTML格式
);

// 使用列表形式
List<String> tos = Arrays.asList("manager@example.com");
List<String> ccs = Arrays.asList("team1@example.com", "team2@example.com");
List<String> bccs = Arrays.asList("archive@example.com");

MailUtils.send(tos, ccs, bccs, "会议纪要", meetingContent, true);
```

### 使用自定义邮件账户

```java
/**
 * 使用自定义账户发送邮件
 *
 * @param mailAccount 自定义邮件账户
 * @param to          收件人
 * @param subject     标题
 * @param content     内容
 * @param isHtml      是否HTML格式
 * @param files       附件
 * @return message-id
 */
public static String send(MailAccount mailAccount, String to, String subject,
        String content, boolean isHtml, File... files);

/**
 * 使用自定义账户发送邮件给多人（完整参数版本）
 */
public static String send(MailAccount mailAccount, Collection<String> tos,
        Collection<String> ccs, Collection<String> bccs, String subject,
        String content, Map<String, InputStream> imageMap,
        boolean isHtml, File... files);
```

**使用示例：**

```java
// 创建完全自定义的邮件账户
MailAccount customAccount = new MailAccount();
customAccount.setHost("smtp.custom.com");
customAccount.setPort(587);
customAccount.setFrom("系统通知 <notify@custom.com>");
customAccount.setUser("notify@custom.com");
customAccount.setPass("auth-code");
customAccount.setAuth(true);
customAccount.setStarttlsEnable(true);
customAccount.setSslEnable(false);

// 使用自定义账户发送
MailUtils.send(
    customAccount,
    "user@example.com",
    "来自自定义账户的邮件",
    "这是使用自定义账户发送的邮件",
    false
);

// 多租户场景：每个租户使用不同的邮件账户
public void sendTenantEmail(String tenantId, String to, String subject, String content) {
    MailAccount tenantAccount = getTenantMailAccount(tenantId);
    MailUtils.send(tenantAccount, to, subject, content, true);
}
```

### 获取邮件会话

```java
/**
 * 获取邮件客户端会话
 *
 * @param mailAccount 邮件账户配置
 * @param isSingleton 是否使用单例会话（全局共享）
 * @return Jakarta Mail Session
 */
public static Session getSession(MailAccount mailAccount, boolean isSingleton);
```

**使用示例：**

```java
// 获取单例会话（性能更好，适合高频发送）
Session sharedSession = MailUtils.getSession(MailUtils.getMailAccount(), true);

// 获取独立会话（隔离性更好，适合多账户场景）
Session isolatedSession = MailUtils.getSession(customAccount, false);

// 直接使用 Session 进行更底层的邮件操作
Transport transport = sharedSession.getTransport("smtp");
try {
    transport.connect();
    // ... 发送邮件
} finally {
    transport.close();
}
```

### 地址分割处理

MailUtils 内部支持多种收件人格式：

```java
// 支持逗号分隔
"user1@example.com,user2@example.com"

// 支持分号分隔
"user1@example.com;user2@example.com"

// 自动去除空格
"user1@example.com, user2@example.com"
"user1@example.com ; user2@example.com"

// 支持单个地址
"user@example.com"
```

## 自动配置原理

### MailAutoConfiguration 详解

邮件模块使用 Spring Boot 自动配置机制，在应用启动时自动创建 `MailAccount` Bean。

```java
/**
 * 邮件服务自动配置类
 *
 * 配置启用条件：mail.enabled=true
 */
@AutoConfiguration
@EnableConfigurationProperties(MailProperties.class)
public class MailAutoConfiguration {

    /**
     * 创建邮件账户 Bean
     *
     * 条件：配置 mail.enabled=true 时才创建
     */
    @Bean
    @ConditionalOnProperty(value = "mail.enabled", havingValue = "true")
    public MailAccount mailAccount(MailProperties mailProperties) {
        MailAccount account = new MailAccount();

        // 基础连接配置
        account.setHost(mailProperties.getHost());
        account.setPort(mailProperties.getPort());
        account.setAuth(mailProperties.getAuth());

        // 用户认证信息
        account.setFrom(mailProperties.getFrom());
        account.setUser(mailProperties.getUser());
        account.setPass(mailProperties.getPass());

        // SSL/TLS 安全配置
        account.setSocketFactoryPort(mailProperties.getPort());
        account.setStarttlsEnable(mailProperties.getStarttlsEnable());
        account.setSslEnable(mailProperties.getSslEnable());

        // 超时配置
        account.setTimeout(mailProperties.getTimeout());
        account.setConnectionTimeout(mailProperties.getConnectionTimeout());

        return account;
    }
}
```

### MailProperties 配置属性

```java
/**
 * 邮件配置属性类
 *
 * 配置前缀：mail
 */
@Data
@ConfigurationProperties(prefix = "mail")
public class MailProperties {

    /** 是否启用邮件服务 */
    private Boolean enabled;

    /** SMTP服务器域名 */
    private String host;

    /** SMTP服务端口 */
    private Integer port;

    /** 是否需要用户名密码验证 */
    private Boolean auth;

    /** 用户名 */
    private String user;

    /** 密码/授权码 */
    private String pass;

    /**
     * 发件人地址（RFC-822标准）
     *
     * 支持格式：
     * 1. user@xxx.xx
     * 2. 名称 <user@xxx.xx>
     */
    private String from;

    /** 是否启用STARTTLS */
    private Boolean starttlsEnable;

    /** 是否启用SSL */
    private Boolean sslEnable;

    /** SMTP超时时长（毫秒），0表示不超时 */
    private Long timeout;

    /** 连接超时时长（毫秒），0表示不超时 */
    private Long connectionTimeout;
}
```

### 配置加载流程

```text
1. 应用启动
    ↓
2. Spring Boot 扫描 @AutoConfiguration
    ↓
3. 加载 MailAutoConfiguration
    ↓
4. 绑定配置到 MailProperties
    ↓
5. 检查条件：mail.enabled=true?
    ├── 是 → 创建 MailAccount Bean
    └── 否 → 跳过配置
    ↓
6. MailUtils 通过 SpringUtils 获取 MailAccount
    ↓
7. 邮件服务就绪
```

## JakartaMail 集成

### 底层实现说明

邮件模块基于 Hutool 的 `JakartaMail` 实现，这是对 Jakarta Mail（原 JavaMail）的封装。

```java
/**
 * 内部发送方法实现
 */
private static String send(MailAccount mailAccount, boolean useGlobalSession,
        Collection<String> tos, Collection<String> ccs, Collection<String> bccs,
        String subject, String content, Map<String, InputStream> imageMap,
        boolean isHtml, File... files) {

    // 创建 JakartaMail 实例
    final JakartaMail mail = JakartaMail.create(mailAccount)
        .setUseGlobalSession(useGlobalSession);

    // 设置收件人
    mail.setTos(tos.toArray(new String[0]));

    // 设置抄送（可选）
    if (CollUtil.isNotEmpty(ccs)) {
        mail.setCcs(ccs.toArray(new String[0]));
    }

    // 设置密送（可选）
    if (CollUtil.isNotEmpty(bccs)) {
        mail.setBccs(bccs.toArray(new String[0]));
    }

    // 设置邮件内容
    mail.setTitle(subject);
    mail.setContent(content);
    mail.setHtml(isHtml);
    mail.setFiles(files);

    // 处理内嵌图片
    if (MapUtil.isNotEmpty(imageMap)) {
        for (Entry<String, InputStream> entry : imageMap.entrySet()) {
            mail.addImage(entry.getKey(), entry.getValue());
            IoUtil.close(entry.getValue());  // 关闭流
        }
    }

    // 发送并返回 message-id
    return mail.send();
}
```

### Session 管理策略

```java
/**
 * 会话管理
 *
 * 单例模式（useGlobalSession=true）：
 * - 全局共享一个 Session 实例
 * - 适合单账户高频发送场景
 * - 性能更好，减少重复创建开销
 *
 * 非单例模式（useGlobalSession=false）：
 * - 每次创建新的 Session 实例
 * - 适合多账户或需要隔离的场景
 * - 更安全，避免配置污染
 */
public static Session getSession(MailAccount mailAccount, boolean isSingleton) {
    Authenticator authenticator = null;
    if (mailAccount.isAuth()) {
        authenticator = new JakartaUserPassAuthenticator(
            mailAccount.getUser(),
            mailAccount.getPass()
        );
    }

    return isSingleton
        ? Session.getDefaultInstance(mailAccount.getSmtpProps(), authenticator)
        : Session.getInstance(mailAccount.getSmtpProps(), authenticator);
}
```

## 测试策略

### 单元测试

```java
/**
 * MailUtils 单元测试
 */
@SpringBootTest
class MailUtilsTest {

    @Test
    @DisplayName("测试获取邮件账户")
    void testGetMailAccount() {
        MailAccount account = MailUtils.getMailAccount();

        assertNotNull(account);
        assertNotNull(account.getHost());
        assertTrue(account.getPort() > 0);
    }

    @Test
    @DisplayName("测试地址分割")
    void testAddressSplit() {
        // 使用反射测试私有方法
        Method splitMethod = MailUtils.class.getDeclaredMethod(
            "splitAddress", String.class);
        splitMethod.setAccessible(true);

        // 测试逗号分隔
        List<String> result1 = (List<String>) splitMethod.invoke(null,
            "a@test.com,b@test.com");
        assertEquals(2, result1.size());

        // 测试分号分隔
        List<String> result2 = (List<String>) splitMethod.invoke(null,
            "a@test.com;b@test.com");
        assertEquals(2, result2.size());

        // 测试单个地址
        List<String> result3 = (List<String>) splitMethod.invoke(null,
            "single@test.com");
        assertEquals(1, result3.size());

        // 测试空值
        List<String> result4 = (List<String>) splitMethod.invoke(null, (String) null);
        assertNull(result4);
    }

    @Test
    @DisplayName("测试自定义账户")
    void testCustomAccount() {
        MailAccount account = MailUtils.getMailAccount(
            "custom@test.com",
            "custom@test.com",
            "custom-pass"
        );

        assertEquals("custom@test.com", account.getFrom());
        assertEquals("custom@test.com", account.getUser());
        assertEquals("custom-pass", account.getPass());
    }
}
```

### 集成测试

```java
/**
 * 邮件发送集成测试
 *
 * 注意：集成测试需要真实的邮件服务器配置
 */
@SpringBootTest
@TestPropertySource(properties = {
    "mail.enabled=true",
    "mail.host=smtp.test.com",
    "mail.port=587"
})
class MailIntegrationTest {

    @Value("${test.mail.recipient:}")
    private String testRecipient;

    @Test
    @DisplayName("发送文本邮件")
    @Disabled("需要真实邮件配置")
    void testSendTextMail() {
        Assumptions.assumeTrue(StringUtils.isNotBlank(testRecipient),
            "需要配置测试收件人");

        String messageId = MailUtils.sendText(
            testRecipient,
            "集成测试 - 文本邮件",
            "这是自动化测试发送的邮件，请忽略。\n测试时间: " + LocalDateTime.now()
        );

        assertNotNull(messageId);
        log.info("邮件发送成功，MessageId: {}", messageId);
    }

    @Test
    @DisplayName("发送HTML邮件")
    @Disabled("需要真实邮件配置")
    void testSendHtmlMail() {
        Assumptions.assumeTrue(StringUtils.isNotBlank(testRecipient));

        String html = """
            <div style="font-family: Arial; padding: 20px;">
                <h2 style="color: #1890ff;">集成测试</h2>
                <p>这是自动化测试发送的HTML邮件</p>
                <p>测试时间: %s</p>
            </div>
            """.formatted(LocalDateTime.now());

        String messageId = MailUtils.sendHtml(
            testRecipient,
            "集成测试 - HTML邮件",
            html
        );

        assertNotNull(messageId);
    }

    @Test
    @DisplayName("发送带附件邮件")
    @Disabled("需要真实邮件配置")
    void testSendMailWithAttachment() throws IOException {
        Assumptions.assumeTrue(StringUtils.isNotBlank(testRecipient));

        // 创建临时测试文件
        File tempFile = File.createTempFile("test-attachment", ".txt");
        Files.writeString(tempFile.toPath(), "这是测试附件内容");

        try {
            String messageId = MailUtils.sendText(
                testRecipient,
                "集成测试 - 带附件邮件",
                "请查看附件",
                tempFile
            );

            assertNotNull(messageId);
        } finally {
            tempFile.delete();
        }
    }
}
```

### Mock 测试

```java
/**
 * 使用 Mock 的邮件测试
 */
@ExtendWith(MockitoExtension.class)
class MailServiceMockTest {

    @Mock
    private MailAccount mockMailAccount;

    @InjectMocks
    private EmailService emailService;

    @Test
    @DisplayName("测试邮件服务 - 成功场景")
    void testSendEmailSuccess() {
        // 配置 Mock
        when(mockMailAccount.getHost()).thenReturn("smtp.test.com");
        when(mockMailAccount.getPort()).thenReturn(587);
        when(mockMailAccount.isAuth()).thenReturn(true);

        // 测试逻辑
        // ...
    }

    @Test
    @DisplayName("测试邮件服务 - 异常处理")
    void testSendEmailException() {
        // 模拟异常
        doThrow(new RuntimeException("连接失败"))
            .when(mockMailAccount).getSmtpProps();

        // 验证异常处理
        assertThrows(ServiceException.class, () -> {
            emailService.sendEmail("to@test.com", "测试", "内容");
        });
    }
}
```

### 使用 GreenMail 进行邮件测试

```java
/**
 * 使用 GreenMail 进行本地邮件测试
 *
 * 添加依赖：
 * <dependency>
 *     <groupId>com.icegreen</groupId>
 *     <artifactId>greenmail-junit5</artifactId>
 *     <version>2.0.0</version>
 *     <scope>test</scope>
 * </dependency>
 */
@ExtendWith(GreenMailExtension.class)
class GreenMailTest {

    @RegisterExtension
    static GreenMailExtension greenMail = new GreenMailExtension(
        ServerSetupTest.SMTP);

    @Test
    @DisplayName("使用 GreenMail 测试邮件发送")
    void testWithGreenMail() throws Exception {
        // 配置邮件账户指向 GreenMail
        MailAccount account = new MailAccount();
        account.setHost("localhost");
        account.setPort(greenMail.getSmtp().getPort());
        account.setFrom("sender@test.com");
        account.setAuth(false);

        // 发送测试邮件
        MailUtils.send(account, "recipient@test.com",
            "测试邮件", "测试内容", false);

        // 验证邮件
        MimeMessage[] messages = greenMail.getReceivedMessages();
        assertEquals(1, messages.length);
        assertEquals("测试邮件", messages[0].getSubject());
        assertTrue(GreenMailUtil.getBody(messages[0]).contains("测试内容"));
    }
}
```

## 故障排查指南

### 常见错误及解决方案

#### 1. 认证失败

**错误信息：**
```text
javax.mail.AuthenticationFailedException: 535 Authentication failed
```

**可能原因：**
- 密码错误（应使用授权码而非登录密码）
- 用户名格式不正确
- 邮箱未开启 SMTP 服务

**解决方案：**
```java
// 检查配置
@Test
void diagnoseAuthFailure() {
    MailAccount account = MailUtils.getMailAccount();

    log.info("Host: {}", account.getHost());
    log.info("Port: {}", account.getPort());
    log.info("User: {}", account.getUser());
    log.info("Pass length: {}",
        account.getPass() != null ? account.getPass().length() : 0);

    // 确保使用授权码
    // QQ邮箱：16位字符
    // 163邮箱：通常也是16位
    // Gmail：16位应用专用密码
}
```

#### 2. 连接超时

**错误信息：**
```text
java.net.SocketTimeoutException: connect timed out
```

**可能原因：**
- 网络问题
- 端口被防火墙阻止
- SMTP 服务器地址错误

**解决方案：**
```java
// 测试网络连接
public boolean testConnection(String host, int port) {
    try (Socket socket = new Socket()) {
        socket.connect(new InetSocketAddress(host, port), 5000);
        log.info("连接成功: {}:{}", host, port);
        return true;
    } catch (IOException e) {
        log.error("连接失败: {}:{} - {}", host, port, e.getMessage());
        return false;
    }
}

// 使用命令行测试
// Windows: telnet smtp.qq.com 587
// Linux: nc -zv smtp.qq.com 587
```

#### 3. SSL/TLS 握手失败

**错误信息：**
```text
javax.net.ssl.SSLHandshakeException: No appropriate protocol
```

**可能原因：**
- Java 版本与 TLS 版本不兼容
- SSL 配置与端口不匹配

**解决方案：**
```yaml
# 检查端口和SSL配置是否匹配
mail:
  port: 465        # SSL 端口
  sslEnable: true  # 必须启用 SSL

# 或者
mail:
  port: 587           # STARTTLS 端口
  starttlsEnable: true
  sslEnable: false
```

```java
// 如果是 Java 版本问题，可以尝试设置系统属性
System.setProperty("mail.smtp.ssl.protocols", "TLSv1.2");
System.setProperty("mail.smtp.ssl.ciphersuites",
    "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256");
```

#### 4. 发件人地址被拒绝

**错误信息：**
```text
553 Mail from must equal authorized user
```

**可能原因：**
- from 地址与认证用户不一致

**解决方案：**
```yaml
mail:
  from: sender@qq.com      # 必须与 user 一致
  user: sender@qq.com
```

#### 5. 收件人被拒绝

**错误信息：**
```text
550 Invalid User / Mailbox not found
```

**可能原因：**
- 收件人邮箱不存在
- 邮箱格式不正确

**解决方案：**
```java
// 发送前验证邮箱格式
public boolean isValidEmail(String email) {
    if (email == null || email.isBlank()) {
        return false;
    }

    String regex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*" +
                   "@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    return email.matches(regex);
}

// 批量发送时跳过无效地址
public void sendToValidRecipients(List<String> recipients,
        String subject, String content) {
    List<String> validEmails = recipients.stream()
        .filter(this::isValidEmail)
        .collect(Collectors.toList());

    if (validEmails.isEmpty()) {
        throw new ServiceException("没有有效的收件人");
    }

    MailUtils.sendHtml(validEmails, subject, content);
}
```

#### 6. 邮件被标记为垃圾邮件

**可能原因：**
- 发件人域名没有配置 SPF/DKIM
- 邮件内容触发垃圾邮件规则
- 发送频率过高

**解决方案：**
```java
// 1. 配置合适的发件人名称
mail:
  from: "系统通知 <noreply@yourdomain.com>"

// 2. 避免垃圾邮件特征
public String sanitizeContent(String content) {
    // 避免全大写
    // 避免过多链接
    // 避免敏感词汇
    // 确保有退订链接
    return content + "\n\n如不想接收此类邮件，请点击退订。";
}

// 3. 控制发送频率
@RateLimiter(key = "mail:send", count = 100, time = 3600)  // 每小时100封
public void sendEmail(String to, String subject, String content) {
    MailUtils.sendHtml(to, subject, content);
}
```

### 调试日志配置

```yaml
# 开启详细的邮件调试日志
logging:
  level:
    # Hutool 邮件日志
    cn.hutool.extra.mail: DEBUG

    # 邮件模块日志
    plus.ruoyi.common.mail: DEBUG

    # Jakarta Mail 详细日志
    jakarta.mail: DEBUG
    com.sun.mail: DEBUG

# 或者在代码中开启调试
mail.debug=true
```

```java
// 启用邮件调试模式
@Bean
public MailAccount mailAccount(MailProperties properties) {
    MailAccount account = new MailAccount();
    // ... 其他配置

    // 开启调试模式
    account.setDebug(true);

    return account;
}
```

### 性能诊断

```java
/**
 * 邮件发送性能诊断
 */
@Component
@Slf4j
public class MailDiagnostics {

    /**
     * 诊断邮件发送性能
     */
    public DiagnosticResult diagnose(String testRecipient) {
        DiagnosticResult result = new DiagnosticResult();

        // 1. 测试 TCP 连接
        result.setTcpConnectTime(measureTcpConnect());

        // 2. 测试 SMTP 握手
        result.setSmtpHandshakeTime(measureSmtpHandshake());

        // 3. 测试实际发送
        if (testRecipient != null) {
            result.setSendTime(measureSend(testRecipient));
        }

        return result;
    }

    private long measureTcpConnect() {
        MailAccount account = MailUtils.getMailAccount();
        long start = System.currentTimeMillis();

        try (Socket socket = new Socket()) {
            socket.connect(
                new InetSocketAddress(account.getHost(), account.getPort()),
                10000
            );
        } catch (IOException e) {
            log.error("TCP 连接失败", e);
            return -1;
        }

        return System.currentTimeMillis() - start;
    }

    private long measureSmtpHandshake() {
        long start = System.currentTimeMillis();

        try {
            Session session = MailUtils.getSession(
                MailUtils.getMailAccount(), false);
            Transport transport = session.getTransport("smtp");

            MailAccount account = MailUtils.getMailAccount();
            transport.connect(account.getHost(), account.getPort(),
                account.getUser(), account.getPass());
            transport.close();

        } catch (Exception e) {
            log.error("SMTP 握手失败", e);
            return -1;
        }

        return System.currentTimeMillis() - start;
    }

    private long measureSend(String recipient) {
        long start = System.currentTimeMillis();

        try {
            MailUtils.sendText(recipient, "性能测试",
                "这是性能测试邮件，请忽略。");
        } catch (Exception e) {
            log.error("发送失败", e);
            return -1;
        }

        return System.currentTimeMillis() - start;
    }
}

@Data
class DiagnosticResult {
    private long tcpConnectTime;
    private long smtpHandshakeTime;
    private long sendTime;

    public String getSummary() {
        return String.format(
            "TCP连接: %dms, SMTP握手: %dms, 发送: %dms",
            tcpConnectTime, smtpHandshakeTime, sendTime
        );
    }
}
```

### 常用诊断命令

```bash
# 测试 SMTP 连接（Windows）
Test-NetConnection -ComputerName smtp.qq.com -Port 587

# 测试 SMTP 连接（Linux/macOS）
nc -zv smtp.qq.com 587
telnet smtp.qq.com 587

# 使用 OpenSSL 测试 SSL 连接
openssl s_client -connect smtp.qq.com:465 -starttls smtp

# 查看 DNS 解析
nslookup smtp.qq.com

# 检查本地端口占用
netstat -an | grep 25
netstat -an | grep 587
netstat -an | grep 465
```
