# Web组件 (web)

## 概述

Web模块（`ruoyi-common-web`）是系统的 Web 应用基础模块，提供 Web 应用的核心功能和 MVC 支持。该模块采用高性能的 Undertow 服务器替代传统 Tomcat，集成了 XSS 防护、验证码生成、国际化支持、全局异常处理、性能监控等企业级功能，是构建安全、高效 Web 应用的基础设施。

## 核心特性

- **高性能容器**：使用 Undertow 替代 Tomcat，支持虚拟线程
- **XSS 防护**：自动过滤 HTML 标签，防止脚本注入攻击
- **验证码生成**：支持多种验证码类型（线段、圆圈、扭曲）
- **国际化支持**：基于请求头的语言环境自动解析
- **全局异常处理**：统一异常响应，避免敏感信息泄露
- **性能监控**：自动记录请求耗时和参数信息
- **安全防护**：禁用不安全的 HTTP 方法

## 模块架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         客户端请求                                    │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Undertow 容器层                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  DisallowedMethodsHandler - 禁用危险 HTTP 方法               │  │
│  │  (CONNECT/TRACE/TRACK)                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  VirtualThreadTaskExecutor - 虚拟线程池 (JDK 21+)            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        过滤器层 Filter                               │
│  ┌────────────────┐  ┌────────────────┐                            │
│  │ RepeatableFilter│  │   XssFilter    │                            │
│  │ 可重复读取请求体│  │  XSS 攻击防护  │                            │
│  └────────────────┘  └────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       拦截器层 Interceptor                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           PlusWebInvokeTimeInterceptor                        │  │
│  │           请求耗时统计 + 参数日志记录                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      控制器层 Controller                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    业务 Controller                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    异常处理层 Exception Handler                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                GlobalExceptionHandler                         │  │
│  │  统一异常处理：业务异常 / 参数验证 / JSON解析 / 系统异常       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 类型 | 说明 |
|------|------|------|
| `UndertowConfiguration` | 配置类 | Undertow 服务器自定义配置 |
| `FilterConfiguration` | 配置类 | 过滤器注册与配置 |
| `CaptchaConfiguration` | 配置类 | 验证码生成器配置 |
| `I18nConfiguration` | 配置类 | 国际化语言环境配置 |
| `ResourcesConfiguration` | 配置类 | 静态资源与跨域配置 |
| `XssFilter` | 过滤器 | XSS 攻击防护过滤器 |
| `RepeatableFilter` | 过滤器 | 请求体可重复读取过滤器 |
| `GlobalExceptionHandler` | 异常处理 | 全局统一异常处理器 |
| `PlusWebInvokeTimeInterceptor` | 拦截器 | 请求耗时监控拦截器 |

## 模块依赖

### 内部模块

```xml
<!-- JSON模块 - 提供数据序列化支持 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-json</artifactId>
</dependency>

<!-- Redis模块 - 提供缓存与会话支持 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-redis</artifactId>
</dependency>
```

### 外部依赖

```xml
<!-- Spring Boot Web - 提供Web应用基础支持 (排除Tomcat) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <artifactId>spring-boot-starter-tomcat</artifactId>
            <groupId>org.springframework.boot</groupId>
        </exclusion>
    </exclusions>
</dependency>

<!-- Undertow容器 - 高性能Web服务器 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>

<!-- Spring Boot Actuator - 应用监控与管理 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- HuTool验证码 - 图形验证码生成 -->
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-captcha</artifactId>
</dependency>

<!-- HuTool加密工具 - 加密解密功能 -->
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-crypto</artifactId>
</dependency>
```

## 核心功能详解

### 1. Undertow 服务器配置

#### 配置内容

| 配置项 | 说明 |
|--------|------|
| WebSocket 缓冲区池 | 配置 WebSocket 使用的 `DefaultByteBufferPool` |
| 虚拟线程池 | 在 JDK 21+ 环境自动启用虚拟线程执行器 |
| HTTP 方法限制 | 禁用 CONNECT、TRACE、TRACK 不安全方法 |

#### 源码实现

```java
@Configuration
public class UndertowConfiguration implements WebServerFactoryCustomizer<UndertowServletWebServerFactory> {

    @Override
    public void customize(UndertowServletWebServerFactory factory) {
        factory.addDeploymentInfoCustomizers(deploymentInfo -> {
            // 1. 配置 WebSocket 缓冲区池
            WebSocketDeploymentInfo webSocketDeploymentInfo = new WebSocketDeploymentInfo();
            webSocketDeploymentInfo.setBuffers(new DefaultByteBufferPool(true, 1024));
            deploymentInfo.addServletContextAttribute(
                WebSocketDeploymentInfo.ATTRIBUTE_NAME, webSocketDeploymentInfo);

            // 2. 虚拟线程支持
            if (SpringUtils.isVirtual()) {
                VirtualThreadTaskExecutor executor = new VirtualThreadTaskExecutor("undertow-");
                deploymentInfo.setExecutor(executor);
                deploymentInfo.setAsyncExecutor(executor);
            }

            // 3. 禁用不安全的 HTTP 方法
            deploymentInfo.addInitialHandlerChainWrapper(handler -> {
                HttpString[] disallowedHttpMethods = {
                    HttpString.tryFromString("CONNECT"),
                    HttpString.tryFromString("TRACE"),
                    HttpString.tryFromString("TRACK")
                };
                return new DisallowedMethodsHandler(handler, disallowedHttpMethods);
            });
        });
    }
}
```

#### 虚拟线程优势

| 特性 | 传统线程池 | 虚拟线程 |
|------|-----------|----------|
| 创建成本 | 高（约 1MB 栈空间） | 低（约 1KB） |
| 并发数量 | 受限（通常数百） | 无限制（可达百万） |
| 阻塞影响 | 占用平台线程 | 自动挂起/恢复 |
| 适用场景 | CPU 密集型 | IO 密集型 |

### 2. XSS 防护机制

#### XSS 过滤配置

```yaml
# application.yml
xss:
  enabled: true
  exclude-urls:
    - /system/notice/*
    - /system/config/*
```

#### 配置属性类

```java
@Data
@ConfigurationProperties(prefix = "xss")
public class XssProperties {
    /** XSS过滤开关 */
    private Boolean enabled;

    /** XSS过滤排除路径列表 */
    private List<String> excludeUrls = new ArrayList<>();
}
```

#### 过滤器工作流程

```
请求进入
    ↓
┌────────────────────────┐
│ 检查 HTTP 方法          │
│ GET/DELETE → 跳过过滤  │
└────────────────────────┘
    ↓ POST/PUT/PATCH
┌────────────────────────┐
│ 检查排除路径            │
│ 匹配 excludeUrls → 跳过│
└────────────────────────┘
    ↓ 需要过滤
┌────────────────────────┐
│ XssHttpServletRequest  │
│ Wrapper 包装请求       │
└────────────────────────┘
    ↓
┌────────────────────────┐
│ 清理 HTML 标签         │
│ HtmlUtil.cleanHtmlTag  │
└────────────────────────┘
    ↓
    继续请求处理
```

#### XSS 请求包装器

```java
public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        if (value == null) {
            return null;
        }
        // 清理 HTML 标签并去除前后空格
        return HtmlUtil.cleanHtmlTag(value).trim();
    }

    @Override
    public Map<String, String[]> getParameterMap() {
        Map<String, String[]> valueMap = super.getParameterMap();
        // 对每个参数值进行 XSS 过滤
        // ...
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        // 对 JSON 请求体进行 XSS 过滤
        if (!isJsonRequest()) {
            return super.getInputStream();
        }

        String json = IoUtil.readUtf8(super.getInputStream());
        json = HtmlUtil.cleanHtmlTag(json).trim();
        // 返回清理后的输入流
        // ...
    }
}
```

### 3. 全局异常处理

#### 支持的异常类型

| 异常类别 | 异常类型 | 说明 |
|----------|----------|------|
| HTTP 异常 | `HttpRequestMethodNotSupportedException` | 不支持的 HTTP 方法 |
| HTTP 异常 | `NoHandlerFoundException` | 404 找不到处理器 |
| HTTP 异常 | `NoResourceFoundException` | 静态资源不存在 |
| 业务异常 | `ServiceException` | 业务逻辑异常 |
| 业务异常 | `BaseException` | 基础业务异常 |
| 业务异常 | `SseException` | SSE 认证失败异常 |
| 参数异常 | `BindException` | 数据绑定异常 |
| 参数异常 | `ConstraintViolationException` | 约束违反异常 |
| 参数异常 | `MethodArgumentNotValidException` | 方法参数验证异常 |
| 参数异常 | `MethodArgumentTypeMismatchException` | 参数类型不匹配 |
| JSON 异常 | `JsonParseException` | JSON 解析异常 |
| JSON 异常 | `HttpMessageNotReadableException` | HTTP 消息读取异常 |
| 系统异常 | `IOException` | IO 异常（SSE 连接中断） |
| 系统异常 | `RuntimeException` | 运行时异常 |
| 系统异常 | `Exception` | 兜底异常处理器 |

#### 友好错误提示

系统会将 Java 类型转换为友好的中文描述：

```java
private String convertJavaTypeToFriendly(String javaType) {
    return switch (javaType) {
        case "Integer", "int" -> "整数";
        case "Long", "long" -> "长整数";
        case "Double", "double", "Float", "float" -> "数字";
        case "Boolean", "boolean" -> "布尔值(true/false)";
        case "String" -> "文本";
        case "Date", "LocalDate" -> "日期";
        case "LocalDateTime" -> "日期时间";
        case "BigDecimal" -> "精确数字";
        default -> javaType;
    };
}
```

**错误示例**：

```
// 参数类型不匹配
原始: Cannot deserialize value of type `java.lang.Integer` from String "abc"
友好: 参数[age]格式错误，应为整数类型，实际输入：abc

// 枚举值错误
原始: not one of the values accepted for Enum class: [ENABLE, DISABLE]
友好: 枚举值不正确，允许的值：[ENABLE, DISABLE]
```

### 4. 性能监控拦截器

#### 功能特性

- **请求耗时统计**：使用 `StopWatch` 精确计时
- **参数日志记录**：支持 JSON 和表单参数
- **请求 ID 追踪**：集成 `RequestIdUtils` 实现链路追踪
- **线程安全**：使用 `ThreadLocal` 存储计时器
- **内存安全**：请求完成后自动清理 `ThreadLocal`

#### 日志格式

```
[PLUS]开始请求 => URL[POST /api/user/create],参数类型[json],参数:[{"name":"张三","age":25}]
[PLUS]结束请求 => URL[POST /api/user/create],耗时:[156]毫秒

[PLUS]开始请求 => URL[GET /api/user/list],参数类型[param],参数:[{"page":"1","size":"10"}]
[PLUS]结束请求 => URL[GET /api/user/list],耗时:[89]毫秒

[PLUS]开始请求 => URL[GET /api/user/info],无参数
[PLUS]结束请求 => URL[GET /api/user/info],耗时:[23]毫秒
```

#### 源码实现

```java
@Slf4j
public class PlusWebInvokeTimeInterceptor implements HandlerInterceptor {

    private final static ThreadLocal<StopWatch> KEY_CACHE = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        // 设置请求 ID
        String requestId = request.getHeader(RequestIdUtils.REQUEST_ID_HEADER);
        RequestIdUtils.setRequestId(requestId);

        // 记录请求参数
        String url = request.getMethod() + " " + request.getRequestURI();
        if (isJsonRequest(request)) {
            // JSON 参数
            log.info("[PLUS]开始请求 => URL[{}],参数类型[json],参数:[{}]", url, jsonParam);
        } else {
            // 表单参数
            log.info("[PLUS]开始请求 => URL[{}],参数类型[param],参数:[{}]", url, parameters);
        }

        // 启动计时器
        StopWatch stopWatch = new StopWatch();
        KEY_CACHE.set(stopWatch);
        stopWatch.start();

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) throws Exception {
        StopWatch stopWatch = KEY_CACHE.get();
        if (stopWatch != null) {
            stopWatch.stop();
            log.info("[PLUS]结束请求 => URL[{}],耗时:[{}]毫秒",
                request.getMethod() + " " + request.getRequestURI(),
                stopWatch.getDuration().toMillis());
            KEY_CACHE.remove();  // 防止内存泄漏
        }
        RequestIdUtils.clearRequestId();
    }
}
```

### 5. 验证码生成

#### 支持的验证码类型

| 类别 | 枚举值 | 说明 | 特点 |
|------|--------|------|------|
| 线段干扰 | `LINE` | `LineCaptcha` | 带有线段干扰线 |
| 圆圈干扰 | `CIRCLE` | `CircleCaptcha` | 带有圆圈干扰线 |
| 扭曲干扰 | `SHEAR` | `ShearCaptcha` | 扭曲效果，识别难度高 |

| 类型 | 枚举值 | 说明 | 示例 |
|------|--------|------|------|
| 数学运算 | `MATH` | 加减乘运算 | `12 + 34 = ?` |
| 随机字符 | `CHAR` | 字母数字组合 | `ABC123` |

#### 验证码配置参数

```java
// 验证码图片尺寸
private static final int WIDTH = 160;
private static final int HEIGHT = 60;

// 样式配置
private static final Color BACKGROUND = Color.WHITE;
private static final Font FONT = new Font("Arial", Font.BOLD, 48);
```

#### 数学运算验证码生成器

```java
public class UnsignedMathGenerator implements CodeGenerator {

    // 运算符：加、减、乘
    private static final String OPERATORS = "+-*";

    @Override
    public String generate() {
        int a = random.nextInt(100);
        int b = random.nextInt(100);
        char op = OPERATORS.charAt(random.nextInt(3));

        // 确保减法结果非负
        if (op == '-' && a < b) {
            int temp = a; a = b; b = temp;
        }

        return String.format("%2d %c %2d = ", a, op, b);
    }
}
```

#### 使用示例

```java
@RestController
@RequestMapping("/captcha")
public class CaptchaController {

    @Autowired
    @Lazy
    private CircleCaptcha circleCaptcha;

    @GetMapping("/image")
    public void getImage(HttpServletResponse response) throws IOException {
        circleCaptcha.createCode();
        String code = circleCaptcha.getCode();
        // 存储验证码到 Redis
        redisCache.setCacheObject("captcha:" + uuid, code, 5, TimeUnit.MINUTES);
        // 返回图片
        circleCaptcha.write(response.getOutputStream());
    }
}
```

### 6. 国际化配置

#### 语言环境解析

系统通过 HTTP 请求头的 `Content-Language` 字段解析语言环境：

```java
public class I18nLocaleResolver implements LocaleResolver {

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        String language = request.getHeader("content-language");
        Locale locale = Locale.getDefault();

        if (StringUtils.isNotEmpty(language)) {
            // 解析语言标识 (如: zh_CN, en_US)
            String[] split = language.split("_");
            if (split.length >= 2) {
                locale = new Locale(split[0], split[1]);
            }
        }

        return locale;
    }
}
```

#### 使用示例

```http
GET /api/user HTTP/1.1
Content-Language: zh_CN
```

```http
GET /api/user HTTP/1.1
Content-Language: en_US
```

### 7. 跨域配置

#### 跨域参数

```java
CorsConfiguration config = new CorsConfiguration();
config.setAllowCredentials(true);           // 允许携带凭证
config.addAllowedOriginPattern("*");        // 允许所有源
config.addAllowedHeader("*");               // 允许所有请求头
config.addAllowedMethod("*");               // 允许所有HTTP方法
config.setMaxAge(1800L);                    // 预检请求缓存30分钟
```

## 配置说明

### 完整配置示例

```yaml
# application.yml

# XSS 防护配置
xss:
  enabled: true
  exclude-urls:
    - /system/notice/*
    - /system/config/*
    - /api/webhook/*

# 文件上传路径
app:
  upload-path: /opt/uploads

# Undertow 服务器配置
server:
  port: 8080
  undertow:
    # IO 线程数，默认为 CPU 核心数
    io-threads: 16
    # Worker 线程数
    worker-threads: 256
    # 每次分配的缓冲区大小
    buffer-size: 1024
    # 是否使用直接内存
    direct-buffers: true

# 虚拟线程配置 (JDK 21+)
spring:
  threads:
    virtual:
      enabled: true

# 日志配置
logging:
  level:
    plus.ruoyi.common.web: DEBUG
```

### 自动配置

模块通过 Spring Boot 自动配置机制装载，配置文件位于：

```
META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

**自动配置类列表**：

```
plus.ruoyi.common.web.config.CaptchaConfiguration
plus.ruoyi.common.web.config.FilterConfiguration
plus.ruoyi.common.web.config.I18nConfiguration
plus.ruoyi.common.web.config.ResourcesConfiguration
plus.ruoyi.common.web.config.UndertowConfiguration
plus.ruoyi.common.web.config.WebAutoConfiguration
```

## 最佳实践

### 1. XSS 防护最佳实践

```java
// ✅ 推荐：默认启用 XSS 过滤
xss:
  enabled: true

// ✅ 推荐：只对富文本接口排除
xss:
  exclude-urls:
    - /system/notice/*  // 通知公告可能包含 HTML

// ❌ 避免：过度排除
xss:
  exclude-urls:
    - /*  // 这样等于禁用了 XSS 防护
```

### 2. 异常处理最佳实践

```java
@RestController
public class UserController {

    @PostMapping("/user")
    public R<UserVO> createUser(@RequestBody @Validated UserCreateReq req) {
        // ✅ 推荐：使用 ServiceException 抛出业务异常
        if (userService.existsByUsername(req.getUsername())) {
            throw ServiceException.of("用户名已存在");
        }

        // ✅ 推荐：使用 R.fail 返回业务失败
        if (!validateEmail(req.getEmail())) {
            return R.fail("邮箱格式不正确");
        }

        UserVO user = userService.create(req);
        return R.ok(user);
    }
}
```

### 3. 验证码使用最佳实践

```java
@RestController
public class AuthController {

    @Autowired
    @Lazy  // ✅ 推荐：使用懒加载避免启动时创建
    private ShearCaptcha shearCaptcha;

    @GetMapping("/captcha")
    public R<CaptchaVO> getCaptcha() {
        // 生成验证码
        shearCaptcha.createCode();
        String code = shearCaptcha.getCode();
        String uuid = IdUtil.fastSimpleUUID();

        // ✅ 推荐：存储到 Redis，设置过期时间
        RedisUtils.setCacheObject("captcha:" + uuid, code, 5, TimeUnit.MINUTES);

        // 返回 Base64 图片
        String base64 = shearCaptcha.getImageBase64();
        return R.ok(new CaptchaVO(uuid, base64));
    }

    @PostMapping("/login")
    public R<TokenVO> login(@RequestBody LoginReq req) {
        // ✅ 推荐：验证后立即删除
        String cacheCode = RedisUtils.getCacheObject("captcha:" + req.getUuid());
        RedisUtils.deleteObject("captcha:" + req.getUuid());

        if (!req.getCode().equalsIgnoreCase(cacheCode)) {
            return R.fail("验证码错误");
        }
        // 继续登录逻辑...
    }
}
```

### 4. 性能监控使用场景

```yaml
# 开发环境：启用详细日志
logging:
  level:
    plus.ruoyi.common.web.interceptor: DEBUG

# 生产环境：只记录慢请求
logging:
  level:
    plus.ruoyi.common.web.interceptor: INFO
```

## 常见问题

### Q1: 如何禁用 XSS 过滤？

```yaml
xss:
  enabled: false
```

或者针对特定 URL 排除：

```yaml
xss:
  enabled: true
  exclude-urls:
    - /api/webhook/*
    - /api/callback/*
```

### Q2: 为什么选择 Undertow 而不是 Tomcat？

| 特性 | Undertow | Tomcat |
|------|----------|--------|
| 内存占用 | 更低 | 较高 |
| 启动速度 | 更快 | 较慢 |
| 并发性能 | 更高 | 一般 |
| 虚拟线程 | 原生支持 | 需要配置 |
| WebSocket | 内置支持 | 需要额外依赖 |

### Q3: 如何自定义异常处理？

```java
@RestControllerAdvice
@Order(0)  // 优先级高于 GlobalExceptionHandler
public class CustomExceptionHandler {

    @ExceptionHandler(CustomBusinessException.class)
    public R<Void> handleCustomException(CustomBusinessException e) {
        log.error("自定义业务异常: {}", e.getMessage());
        return R.fail(e.getCode(), e.getMessage());
    }
}
```

### Q4: 虚拟线程何时启用？

**启用条件**：

1. JDK 21 或更高版本
2. 配置 `spring.threads.virtual.enabled=true`
3. `SpringUtils.isVirtual()` 返回 `true`

**检查方式**：

```java
@GetMapping("/info")
public R<Map<String, Object>> getInfo() {
    Map<String, Object> info = new HashMap<>();
    info.put("virtualThreadEnabled", SpringUtils.isVirtual());
    info.put("javaVersion", System.getProperty("java.version"));
    return R.ok(info);
}
```

### Q5: 请求体为什么不能重复读取？

HTTP 请求体是一个流，默认只能读取一次。`RepeatableFilter` 通过 `RepeatedlyRequestWrapper` 缓存请求体内容，允许多次读取：

```java
public class RepeatedlyRequestWrapper extends HttpServletRequestWrapper {

    private final byte[] body;

    public RepeatedlyRequestWrapper(HttpServletRequest request) throws IOException {
        super(request);
        // 缓存请求体
        this.body = IoUtil.readBytes(request.getInputStream());
    }

    @Override
    public ServletInputStream getInputStream() {
        // 每次返回新的输入流
        return new ByteArrayInputStream(body);
    }
}
```

### Q6: 如何处理 SSE 连接中断？

SSE（Server-Sent Events）连接中断是正常现象（用户关闭浏览器等），系统会自动忽略：

```java
@ExceptionHandler(IOException.class)
public void handleRuntimeException(IOException e, HttpServletRequest request) {
    String requestUri = request.getRequestURI();
    if (requestUri.contains("sse")) {
        // SSE 连接中断，正常现象，直接忽略
        return;
    }
    log.error("请求地址'{}',连接中断", requestUri, e);
}
```

## 扩展指南

### 自定义验证码生成器

```java
@Component
public class SliderCaptchaGenerator implements CodeGenerator {

    @Override
    public String generate() {
        // 生成滑块验证码坐标
        int x = RandomUtil.randomInt(50, 200);
        return String.valueOf(x);
    }

    @Override
    public boolean verify(String code, String userInput) {
        int expected = Integer.parseInt(code);
        int actual = Integer.parseInt(userInput);
        // 允许 5 像素误差
        return Math.abs(expected - actual) <= 5;
    }
}
```

### 自定义拦截器

```java
@Component
public class ApiKeyInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        String apiKey = request.getHeader("X-API-Key");
        if (!isValidApiKey(apiKey)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
        return true;
    }
}

// 注册拦截器
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private ApiKeyInterceptor apiKeyInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiKeyInterceptor)
            .addPathPatterns("/api/v2/**")
            .excludePathPatterns("/api/v2/public/**");
    }
}
```

### 自定义过滤器

```java
@Component
@WebFilter(urlPatterns = "/*")
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // 记录请求信息
        log.info("Request: {} {}", httpRequest.getMethod(), httpRequest.getRequestURI());

        chain.doFilter(request, response);
    }
}
```

## 性能优化

### Undertow 参数调优

根据服务器配置和业务场景，合理配置 Undertow 参数：

```yaml
server:
  undertow:
    # IO线程数 - 处理网络读写
    # 建议：CPU核心数（IO密集型可适当增加）
    io-threads: 8

    # Worker线程数 - 处理业务逻辑
    # 建议：IO线程数 * 8（阻塞操作多时可增加）
    worker-threads: 64

    # 每个缓冲区大小（字节）
    # 建议：16KB 适合大多数场景
    buffer-size: 16384

    # 是否使用直接内存
    # 建议：true（减少GC压力）
    direct-buffers: true

    # 是否开启访问日志
    accesslog:
      enabled: true
      dir: ./logs
      pattern: '%t %a "%r" %s (%D ms)'
```

**线程数配置建议：**

| 场景 | IO线程 | Worker线程 | 说明 |
|------|--------|------------|------|
| 低并发 | 2-4 | 16-32 | 小型应用 |
| 中等并发 | 4-8 | 64-128 | 一般业务系统 |
| 高并发 | 8-16 | 128-256 | 高流量场景 |
| IO密集型 | 核心数×2 | 核心数×16 | 大量外部调用 |

### 连接池配置

```yaml
server:
  undertow:
    # 最大HTTP连接数
    max-http-post-size: 10MB

    # HTTP/2 设置
    options:
      server:
        # 启用HTTP/2
        ENABLE_HTTP2: true
        # 最大并发流
        MAX_CONCURRENT_STREAMS_PER_CONNECTION: 100
```

### 虚拟线程最佳实践

在 JDK 21+ 环境下使用虚拟线程：

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

**虚拟线程适用场景：**

```java
// ✅ 适合：IO密集型操作
@GetMapping("/user/{id}")
public R<UserVO> getUser(@PathVariable Long id) {
    // 数据库查询 - 阻塞操作
    User user = userMapper.selectById(id);
    // 远程调用 - 阻塞操作
    UserDetail detail = remoteService.getDetail(id);
    return R.ok(convert(user, detail));
}

// ⚠️ 不适合：CPU密集型操作
@GetMapping("/report")
public R<ReportVO> generateReport() {
    // 大量计算操作仍然使用平台线程池
    return R.ok(reportService.generate());
}
```

### 静态资源优化

```yaml
spring:
  web:
    resources:
      # 静态资源缓存时间
      cache:
        period: 86400  # 1天
        cachecontrol:
          max-age: 86400
          cache-public: true
      # 资源链优化
      chain:
        strategy:
          content:
            enabled: true
            paths: /**
```

## 监控与诊断

### Actuator 端点

系统集成 Spring Boot Actuator 提供运行时监控：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env,loggers
  endpoint:
    health:
      show-details: when-authorized
```

**常用监控端点：**

| 端点 | URL | 说明 |
|------|-----|------|
| 健康检查 | `/actuator/health` | 应用健康状态 |
| 应用信息 | `/actuator/info` | 应用基本信息 |
| 指标数据 | `/actuator/metrics` | 性能指标 |
| 日志配置 | `/actuator/loggers` | 动态调整日志级别 |
| 环境变量 | `/actuator/env` | 环境配置信息 |

### 请求追踪

通过 RequestId 实现全链路追踪：

```java
// 在请求头中传递
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000

// 日志中自动包含
2025-01-01 12:00:00 [550e8400] INFO  - 处理用户请求...
```

**日志配置：**

```xml
<pattern>%d{yyyy-MM-dd HH:mm:ss} [%X{requestId}] %-5level %logger{36} - %msg%n</pattern>
```

### 慢请求监控

通过拦截器记录慢请求：

```java
@Slf4j
@Component
public class SlowRequestInterceptor implements HandlerInterceptor {

    private static final long SLOW_THRESHOLD = 1000L; // 1秒
    private final ThreadLocal<Long> startTime = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        startTime.set(System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler, Exception ex) {
        long duration = System.currentTimeMillis() - startTime.get();
        if (duration > SLOW_THRESHOLD) {
            log.warn("慢请求: {} {} 耗时 {}ms",
                request.getMethod(),
                request.getRequestURI(),
                duration);
        }
        startTime.remove();
    }
}
```

### 内存诊断

```java
@RestController
@RequestMapping("/actuator")
public class DiagnosticController {

    @GetMapping("/memory")
    public R<Map<String, Object>> memoryInfo() {
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> info = new HashMap<>();
        info.put("maxMemory", runtime.maxMemory() / 1024 / 1024 + "MB");
        info.put("totalMemory", runtime.totalMemory() / 1024 / 1024 + "MB");
        info.put("freeMemory", runtime.freeMemory() / 1024 / 1024 + "MB");
        info.put("usedMemory", (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024 + "MB");
        return R.ok(info);
    }

    @GetMapping("/threads")
    public R<Map<String, Object>> threadInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("activeCount", Thread.activeCount());
        info.put("virtualThreadEnabled", SpringUtils.isVirtual());
        return R.ok(info);
    }
}
```

## 安全建议

1. **始终启用 XSS 过滤**：除非有特殊需求，否则保持 XSS 过滤开启
2. **合理配置排除路径**：只对确实需要接收 HTML 的接口排除
3. **使用 HTTPS**：生产环境务必使用 HTTPS
4. **限制跨域来源**：生产环境不要使用 `*` 通配符
5. **验证码有效期**：设置合理的过期时间（建议 5 分钟内）
6. **验证后即删**：验证码验证成功后立即删除，防止重复使用
7. **监控端点保护**：Actuator 端点需要身份认证
8. **请求大小限制**：限制文件上传大小，防止资源耗尽攻击
9. **请求频率限制**：配合限流模块防止暴力攻击
10. **敏感信息过滤**：日志中不记录密码、Token 等敏感信息
