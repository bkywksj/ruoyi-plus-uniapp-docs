# 安全防护 (security)

## 模块概述

`ruoyi-common-security` 是RuoYi-Plus-Uniapp框架的核心安全模块，提供应用安全防护与权限管理功能。该模块基于Sa-Token框架实现，具有高度的灵活性和可配置性，是保护后端API资源安全的第一道防线。

### 主要功能

- **动态URL路径收集**：自动扫描所有Controller映射路径，无需硬编码
- **灵活的权限控制**：支持白名单机制和路径排除规则
- **登录验证拦截**：全局Token验证，保护敏感资源
- **监控端点保护**：为Actuator提供HTTP Basic认证
- **SSE服务支持**：特殊处理Server-Sent Events路径，避免认证冲突
- **路径变量标准化**：自动将`{id}`等路径变量转换为通配符匹配

### 模块定位

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP请求入口                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ruoyi-common-security                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │ AllUrlHandler │  │SecurityConfig │  │ SaServletFilter  │   │
│  │  URL路径收集   │  │ 登录验证拦截  │  │ Actuator保护     │   │
│  └───────────────┘  └───────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ruoyi-common-satoken                         │
│              Sa-Token核心认证、会话管理、权限验证                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      业务Controller                             │
└─────────────────────────────────────────────────────────────────┘
```

## 模块依赖

### Maven依赖配置

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-security</artifactId>
</dependency>
```

### 传递依赖

```xml
<!-- 安全模块的唯一依赖 -->
<dependencies>
    <!-- Sa-Token认证模块 - 提供用户认证与权限管理 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-satoken</artifactId>
    </dependency>
</dependencies>
```

### 依赖关系图

```
ruoyi-common-security
    └── ruoyi-common-satoken
            ├── sa-token-spring-boot3-starter (Sa-Token核心)
            ├── sa-token-jwt (JWT支持)
            └── ruoyi-common-redis (会话存储)
```

## 核心架构

### 整体架构设计

```
┌──────────────────────────────────────────────────────────────────────┐
│                          安全模块架构                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                   SecurityAutoConfiguration                │    │
│   │                      (自动配置入口)                         │    │
│   │  ┌─────────────────┐  ┌─────────────────────────────────┐  │    │
│   │  │ Bean注册        │  │ WebMvcConfigurer实现            │  │    │
│   │  │ - AllUrlHandler │  │ - addInterceptors()            │  │    │
│   │  │ - SaServletFilter│  │ - 登录验证拦截器注册            │  │    │
│   │  └─────────────────┘  └─────────────────────────────────┘  │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                      AllUrlHandler                         │    │
│   │                    (URL路径收集器)                          │    │
│   │  ┌─────────────────┐  ┌─────────────────────────────────┐  │    │
│   │  │ InitializingBean│  │ 路径处理逻辑                     │  │    │
│   │  │ - 容器初始化回调 │  │ - 扫描RequestMapping           │  │    │
│   │  │ - 自动触发收集  │  │ - 路径变量替换为通配符           │  │    │
│   │  └─────────────────┘  └─────────────────────────────────┘  │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                    SecurityProperties                      │    │
│   │                      (配置属性类)                           │    │
│   │  ┌─────────────────────────────────────────────────────┐   │    │
│   │  │ security.excludes: 排除路径列表（白名单）            │   │    │
│   │  └─────────────────────────────────────────────────────┘   │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 请求处理流程

```mermaid
graph TD
    A[HTTP请求] --> B{路径是否在excludes白名单?}
    B -->|是| C[直接放行]
    B -->|否| D{是否为SSE路径?}
    D -->|是| C
    D -->|否| E{是否为Actuator路径?}
    E -->|是| F[HTTP Basic认证]
    E -->|否| G[Sa-Token登录验证]
    F --> H{Basic认证通过?}
    H -->|是| I[继续处理请求]
    H -->|否| J[返回401未授权]
    G --> K{Token验证通过?}
    K -->|是| I
    K -->|否| J
    C --> I
    I --> L[到达Controller]
```

## 核心组件

### 1. AllUrlHandler - URL路径收集器

#### 功能描述

`AllUrlHandler` 负责自动收集Spring MVC中所有Controller的URL映射路径，为安全拦截器提供完整的路径信息。这是一个关键组件，它实现了`InitializingBean`接口，在Spring容器初始化完成后自动执行URL收集工作。

#### 源码实现

```java
@Data
public class AllUrlHandler implements InitializingBean {

    /**
     * 路径变量占位符匹配模式
     * 用于匹配Spring MVC路径中的变量占位符，如：{id}、{userId}、{name}等
     */
    private static final Pattern PATTERN = Pattern.compile("\\{(.*?)\\}");

    /**
     * 存储所有收集到的URL路径
     */
    private List<String> urls = new ArrayList<>();

    /**
     * Spring容器初始化完成后的回调方法
     */
    @Override
    public void afterPropertiesSet() {
        // 使用Set确保URL路径的唯一性
        Set<String> urlSet = new HashSet<>();

        // 获取Spring MVC的请求映射处理器
        RequestMappingHandlerMapping mapping = SpringUtils.getBean(
            "requestMappingHandlerMapping",
            RequestMappingHandlerMapping.class
        );

        // 获取所有的请求映射信息和对应的处理方法
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = mapping.getHandlerMethods();

        // 遍历所有请求映射信息
        handlerMethods.keySet().forEach(requestMappingInfo -> {
            Objects.requireNonNull(requestMappingInfo.getPathPatternsCondition().getPatterns())
                .forEach(pathPattern -> {
                    // 获取路径字符串
                    String urlPattern = pathPattern.getPatternString();
                    // 将路径变量占位符替换为通配符*
                    String processedUrl = ReUtil.replaceAll(urlPattern, PATTERN, "*");
                    urlSet.add(processedUrl);
                });
        });

        // 将去重后的URL路径添加到结果列表中
        urls.addAll(urlSet);
    }
}
```

#### 工作原理

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 获取RequestMappingHandlerMapping | 从Spring容器获取请求映射处理器 |
| 2 | 遍历HandlerMethods | 获取所有Controller方法的映射信息 |
| 3 | 提取PathPattern | 从RequestMappingInfo中获取路径模式 |
| 4 | 正则替换 | 使用`\{(.*?)\}`匹配路径变量 |
| 5 | 通配符转换 | 将`{id}`等变量替换为`*` |
| 6 | 去重存储 | 使用Set确保路径唯一性 |

#### 路径转换示例

| 原始路径 | 处理后路径 | 说明 |
|---------|-----------|------|
| `/api/user/{id}` | `/api/user/*` | 单个路径变量 |
| `/system/role/{roleId}/users` | `/system/role/*/users` | 中间路径变量 |
| `/order/{orderId}/items/{itemId}` | `/order/*/items/*` | 多个路径变量 |
| `/api/dept/list` | `/api/dept/list` | 无路径变量，保持不变 |

#### 正则表达式说明

```java
private static final Pattern PATTERN = Pattern.compile("\\{(.*?)\\}");
```

- `\\{` - 匹配左花括号`{`
- `(.*?)` - 非贪婪模式捕获任意字符
- `\\}` - 匹配右花括号`}`
- 整体匹配Spring MVC路径变量如`{id}`、`{userId}`等

#### 应用场景

1. **安全拦截器路径匹配**：提供完整的URL列表供登录验证使用
2. **动态权限控制**：运行时获取所有API路径
3. **避免硬编码**：自动发现所有Controller路径
4. **白名单配合**：与excludes配置协同实现灵活访问控制

### 2. SecurityAutoConfiguration - 安全自动配置

#### 功能描述

`SecurityAutoConfiguration` 是整个安全模块的核心配置类，实现了`WebMvcConfigurer`接口，负责：

1. 注册AllUrlHandler Bean
2. 配置Sa-Token登录验证拦截器
3. 配置Actuator端点的HTTP Basic认证

#### 源码实现

```java
@Slf4j
@AutoConfiguration
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityAutoConfiguration implements WebMvcConfigurer {

    private final SecurityProperties securityProperties;

    /**
     * SSE（Server-Sent Events）服务路径
     */
    @Value("${sse.path}")
    private String ssePath;

    public SecurityAutoConfiguration(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    /**
     * 注册URL路径收集器
     */
    @Bean
    public AllUrlHandler allUrlHandler() {
        return new AllUrlHandler();
    }

    /**
     * 注册Sa-Token登录验证拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handler -> {
                AllUrlHandler allUrlHandler = SpringUtils.getBean(AllUrlHandler.class);

                SaRouter
                    .match(allUrlHandler.getUrls())    // 匹配所有需要验证的路径
                    .check(StpUtil::checkLogin);       // 执行登录检查
            }))
            .addPathPatterns("/**")                    // 拦截所有路径
            .excludePathPatterns(securityProperties.getExcludes())  // 排除白名单
            .excludePathPatterns(ssePath);             // 排除SSE路径
    }

    /**
     * 配置Actuator监控端点的HTTP Basic认证
     */
    @Bean
    public SaServletFilter getSaServletFilter() {
        String username = SpringUtils.getProperty("spring.boot.admin.client.username");
        String password = SpringUtils.getProperty("spring.boot.admin.client.password");

        return new SaServletFilter()
            .addInclude("/actuator", "/actuator/**")
            .setAuth(obj -> {
                SaHttpBasicUtil.check(username + ":" + password);
            })
            .setError(e -> {
                HttpServletResponse response = ServletUtils.getResponse();
                response.setContentType(SaTokenConsts.CONTENT_TYPE_APPLICATION_JSON);
                return SaResult.error(e.getMessage()).setCode(HttpStatus.UNAUTHORIZED);
            });
    }
}
```

#### 拦截器配置详解

##### 登录验证拦截器

```java
registry.addInterceptor(new SaInterceptor(handler -> {
    AllUrlHandler allUrlHandler = SpringUtils.getBean(AllUrlHandler.class);

    SaRouter
        .match(allUrlHandler.getUrls())    // 动态获取需要验证的URL
        .check(StpUtil::checkLogin);       // 调用Sa-Token登录检查
}))
.addPathPatterns("/**")                    // 拦截所有请求
.excludePathPatterns(securityProperties.getExcludes())  // 排除白名单路径
.excludePathPatterns(ssePath);             // 排除SSE路径
```

**执行流程**：

1. 拦截所有`/**`路径的请求
2. 排除`security.excludes`配置的白名单路径
3. 排除`sse.path`配置的SSE服务路径
4. 对剩余路径通过`SaRouter.match()`匹配AllUrlHandler收集的URL
5. 匹配成功则调用`StpUtil::checkLogin`验证登录状态

##### Actuator保护过滤器

```java
return new SaServletFilter()
    .addInclude("/actuator", "/actuator/**")   // 只拦截Actuator路径
    .setAuth(obj -> {
        SaHttpBasicUtil.check(username + ":" + password);  // HTTP Basic认证
    })
    .setError(e -> {
        return SaResult.error(e.getMessage()).setCode(HttpStatus.UNAUTHORIZED);
    });
```

**保护机制**：

1. 仅对`/actuator`及其子路径生效
2. 使用HTTP Basic认证方式
3. 账号密码从`spring.boot.admin.client`配置获取
4. 认证失败返回401状态码和JSON错误信息

### 3. SecurityProperties - 配置属性

#### 源码实现

```java
@Data
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {

    /**
     * 安全认证排除路径
     *
     * 支持Ant风格的路径匹配：
     * - ? 匹配一个字符
     * - * 匹配零个或多个字符
     * - ** 匹配零个或多个目录
     */
    private String[] excludes;
}
```

#### 配置格式

```yaml
# 安全配置
security:
  # 认证排除路径（白名单）
  excludes:
    # 静态资源
    - /resources/**
    - /*.html
    - /**/*.html
    - /**/*.css
    - /**/*.js
    - /favicon.ico
    # 错误页面
    - /error
    # API文档
    - /*/api-docs
    - /*/api-docs/**
```

#### 路径匹配规则

| 模式 | 说明 | 示例 |
|------|------|------|
| `?` | 匹配单个字符 | `/user?` 匹配 `/users`、`/usera` |
| `*` | 匹配零个或多个字符（不含路径分隔符） | `/api/*` 匹配 `/api/user`、`/api/role` |
| `**` | 匹配零个或多个目录 | `/api/**` 匹配 `/api/user/list`、`/api/a/b/c` |

#### 常见排除路径分类

| 分类 | 路径示例 | 说明 |
|------|---------|------|
| 静态资源 | `/resources/**`、`/**/*.css`、`/**/*.js` | 前端静态文件 |
| 页面文件 | `/*.html`、`/**/*.html` | HTML页面 |
| 网站图标 | `/favicon.ico` | 浏览器图标 |
| 错误页面 | `/error` | Spring Boot错误处理 |
| API文档 | `/*/api-docs`、`/*/api-docs/**` | OpenAPI文档 |
| 公开接口 | `/api/public/**`、`/login`、`/register` | 无需认证的业务接口 |

## 自动配置

### Spring Boot自动装配

模块通过Spring Boot 3.x的自动配置机制加载：

```
# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
plus.ruoyi.common.security.config.SecurityAutoConfiguration
```

### 自动配置条件

```java
@AutoConfiguration
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityAutoConfiguration implements WebMvcConfigurer {
    // 无条件自动配置
    // 只要引入依赖即生效
}
```

### Bean注册顺序

```
1. SecurityProperties (配置属性绑定)
       ↓
2. AllUrlHandler (URL路径收集，依赖Spring容器初始化完成)
       ↓
3. SaInterceptor (登录验证拦截器)
       ↓
4. SaServletFilter (Actuator保护过滤器)
```

## 配置示例

### 完整配置示例

```yaml
################## 安全配置 ##################
security:
  # 认证排除路径（白名单）
  excludes:
    # 静态资源路径
    - /resources/**
    - /*.html
    - /**/*.html
    - /**/*.css
    - /**/*.js
    - /favicon.ico
    # 错误页面
    - /error
    # API文档
    - /*/api-docs
    - /*/api-docs/**

################## SSE服务配置 ##################
sse:
  # SSE服务路径（会被安全拦截器排除）
  path: /sse/**

################## Spring Boot Admin配置 ##################
spring:
  boot:
    admin:
      client:
        # Actuator监控认证用户名
        username: admin
        # Actuator监控认证密码
        password: admin123
```

### 开发环境配置

```yaml
# application-dev.yml
security:
  excludes:
    # 开发环境可以放开更多路径
    - /resources/**
    - /**/*.html
    - /**/*.css
    - /**/*.js
    - /favicon.ico
    - /error
    - /*/api-docs
    - /*/api-docs/**
    # 开发环境放开Swagger UI
    - /swagger-ui/**
    - /swagger-resources/**
    # 开发环境放开测试接口
    - /test/**
```

### 生产环境配置

```yaml
# application-prod.yml
security:
  excludes:
    # 生产环境最小化白名单
    - /resources/**
    - /favicon.ico
    - /error
    # 仅保留必要的公开接口
    - /api/public/**
```

## 使用指南

### 1. 添加模块依赖

在需要安全功能的模块中添加依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-security</artifactId>
</dependency>
```

### 2. 配置排除路径

根据业务需求配置白名单路径：

```yaml
security:
  excludes:
    # 登录注册相关
    - /login
    - /register
    - /captcha
    # 公开API
    - /api/public/**
    # 静态资源
    - /resources/**
```

### 3. 配置SSE路径

如果使用SSE服务，需要配置排除路径：

```yaml
sse:
  path: /sse/**
```

### 4. 配置Actuator认证

配置监控端点的认证信息：

```yaml
spring:
  boot:
    admin:
      client:
        username: ${ADMIN_USERNAME:admin}
        password: ${ADMIN_PASSWORD:admin123}
```

### 5. 自定义认证逻辑

如需扩展认证逻辑，可以创建自定义配置类：

```java
@Configuration
public class CustomSecurityConfig implements WebMvcConfigurer {

    @Autowired
    private SecurityProperties securityProperties;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handler -> {
            AllUrlHandler allUrlHandler = SpringUtils.getBean(AllUrlHandler.class);

            SaRouter
                .match(allUrlHandler.getUrls())
                .check(() -> {
                    // 自定义验证逻辑
                    if (!StpUtil.isLogin()) {
                        throw new NotLoginException("用户未登录", StpUtil.TYPE, "-1");
                    }

                    // 检查用户状态
                    LoginUser loginUser = LoginHelper.getLoginUser();
                    if (loginUser.getStatus() != 0) {
                        throw new ServiceException("账号已被禁用");
                    }

                    // 检查IP白名单
                    String clientIp = ServletUtils.getClientIP();
                    if (!isIpAllowed(clientIp)) {
                        throw new ServiceException("IP地址不在白名单中");
                    }
                });
        }))
        .addPathPatterns("/**")
        .excludePathPatterns(securityProperties.getExcludes());
    }

    private boolean isIpAllowed(String ip) {
        // 实现IP白名单检查逻辑
        return true;
    }
}
```

### 6. 添加自定义过滤器

```java
@Configuration
public class CustomFilterConfig {

    @Bean
    public FilterRegistrationBean<CustomSecurityFilter> customSecurityFilter() {
        FilterRegistrationBean<CustomSecurityFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CustomSecurityFilter());
        registration.addUrlPatterns("/api/sensitive/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
```

## 工作流程

### 请求处理流程

```mermaid
graph TD
    A[HTTP请求] --> B{路径是否在排除列表?}
    B -->|是| C[直接放行]
    B -->|否| D{路径是否需要验证?}
    D -->|是| E[执行Token验证]
    D -->|否| C
    E --> F{验证是否通过?}
    F -->|是| G[继续处理请求]
    F -->|否| H[返回401未授权]
    C --> G
    G --> I[到达Controller]
```

### 初始化流程

```mermaid
graph TD
    A[Spring容器启动] --> B[SecurityAutoConfiguration加载]
    B --> C[SecurityProperties配置绑定]
    C --> D[AllUrlHandler Bean注册]
    D --> E[Spring MVC初始化完成]
    E --> F[AllUrlHandler.afterPropertiesSet]
    F --> G[扫描所有RequestMapping]
    G --> H[提取URL路径模式]
    H --> I[标准化路径变量]
    I --> J[去重并存储URL列表]
    J --> K[WebMvcConfigurer.addInterceptors]
    K --> L[注册Sa-Token拦截器]
    L --> M[注册SaServletFilter]
    M --> N[安全模块就绪]
```

### Token验证流程

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Filter as SaInterceptor
    participant SaToken as StpUtil
    participant Redis as Redis
    participant Controller as Controller

    Client->>Filter: HTTP请求 + Token
    Filter->>Filter: 检查路径是否在白名单
    alt 在白名单
        Filter->>Controller: 直接放行
    else 不在白名单
        Filter->>SaToken: checkLogin()
        SaToken->>Redis: 查询Token会话
        alt Token有效
            Redis-->>SaToken: 返回用户信息
            SaToken-->>Filter: 验证通过
            Filter->>Controller: 继续处理
        else Token无效
            Redis-->>SaToken: 无会话信息
            SaToken-->>Filter: 抛出NotLoginException
            Filter-->>Client: 401 未授权
        end
    end
```

## 最佳实践

### 1. 路径配置建议

**精确匹配优先**

```yaml
# ✅ 推荐：精确匹配
security:
  excludes:
    - /login
    - /register
    - /captcha

# ❌ 避免：过于宽泛
security:
  excludes:
    - /**  # 这会放开所有路径！
```

**最小权限原则**

```yaml
# ✅ 推荐：仅放开必要路径
security:
  excludes:
    - /api/public/goods/list
    - /api/public/goods/detail

# ❌ 避免：放开整个模块
security:
  excludes:
    - /api/public/**  # 可能包含敏感接口
```

**分类管理**

```yaml
security:
  excludes:
    # === 静态资源 ===
    - /resources/**
    - /**/*.css
    - /**/*.js

    # === 页面文件 ===
    - /*.html
    - /**/*.html

    # === 系统端点 ===
    - /favicon.ico
    - /error

    # === API文档 ===
    - /*/api-docs
    - /*/api-docs/**

    # === 公开业务接口 ===
    - /login
    - /register
```

### 2. 性能优化

**URL收集优化**

AllUrlHandler在Spring容器初始化时一次性收集所有URL，避免运行时反复扫描：

```java
@Override
public void afterPropertiesSet() {
    Set<String> urlSet = new HashSet<>();  // 使用Set去重
    // ... 收集逻辑
    urls.addAll(urlSet);  // 一次性添加
}
```

**高效匹配**

```java
// Sa-Token使用高效的路径匹配算法
SaRouter.match(allUrlHandler.getUrls())  // O(n)复杂度
```

**合理配置白名单**

```yaml
# 将高频访问的静态资源放在白名单前面
security:
  excludes:
    - /**/*.js      # 高频访问
    - /**/*.css     # 高频访问
    - /**/*.html    # 中频访问
    - /api/public/* # 低频访问
```

### 3. 安全考虑

**白名单审查**

```java
@Scheduled(cron = "0 0 0 * * ?")  // 每天检查
public void auditExcludePaths() {
    String[] excludes = securityProperties.getExcludes();
    for (String path : excludes) {
        if (path.contains("**") && !path.startsWith("/resources")) {
            log.warn("发现宽泛的排除路径: {}", path);
        }
    }
}
```

**监控端点保护**

```yaml
# 使用强密码
spring:
  boot:
    admin:
      client:
        username: ${ADMIN_USER}
        password: ${ADMIN_PASS}  # 从环境变量读取
```

**日志记录**

```java
@Component
public class SecurityAuditLogger implements SaTokenListener {

    @Override
    public void doLogin(String loginType, Object loginId, String tokenValue, SaLoginModel loginModel) {
        log.info("用户登录: loginId={}, ip={}", loginId, ServletUtils.getClientIP());
    }

    @Override
    public void doLogout(String loginType, Object loginId, String tokenValue) {
        log.info("用户登出: loginId={}", loginId);
    }

    @Override
    public void doKickout(String loginType, Object loginId, String tokenValue) {
        log.warn("用户被踢下线: loginId={}", loginId);
    }
}
```

### 4. 环境差异化配置

```yaml
# application.yml - 基础配置
security:
  excludes:
    - /resources/**
    - /favicon.ico
    - /error

---
# application-dev.yml - 开发环境
security:
  excludes:
    - /swagger-ui/**
    - /test/**

---
# application-prod.yml - 生产环境
security:
  excludes:
    # 生产环境不放开Swagger
```

## 故障排查

### 常见问题

#### 1. 路径无法访问（401错误）

**问题现象**：
```
HTTP/1.1 401 Unauthorized
{"code": 401, "msg": "未能读取到有效Token"}
```

**问题原因**：
- 路径未在排除列表中
- Token未传递或已过期
- Token格式错误

**解决方案**：

```yaml
# 1. 检查配置是否正确
security:
  excludes:
    - /your/path/**  # 确保路径正确

# 2. 检查请求头
# Authorization: Bearer <token>

# 3. 检查Token是否过期
sa-token:
  token-timeout: 86400  # 适当延长过期时间
```

#### 2. AllUrlHandler收集不到路径

**问题现象**：
```java
log.info("收集到的URL: {}", allUrlHandler.getUrls());  // 输出为空
```

**问题原因**：
- Controller未被Spring扫描到
- RequestMapping注解配置错误
- 组件扫描路径未包含Controller

**解决方案**：

```java
// 1. 检查Controller注解
@RestController  // 必须有此注解
@RequestMapping("/api/user")  // 必须有此注解
public class UserController { }

// 2. 检查组件扫描
@SpringBootApplication(scanBasePackages = "plus.ruoyi")
public class Application { }

// 3. 调试查看收集结果
@Component
public class UrlDebugger {
    @Autowired
    private AllUrlHandler allUrlHandler;

    @PostConstruct
    public void debug() {
        log.info("收集到的URL路径: {}", allUrlHandler.getUrls());
    }
}
```

#### 3. Actuator认证失败

**问题现象**：
```
HTTP/1.1 401 Unauthorized
访问 /actuator/health 需要认证
```

**问题原因**：
- HTTP Basic认证信息错误
- 配置的用户名密码与请求不匹配
- 请求头格式错误

**解决方案**：

```yaml
# 1. 确认配置正确
spring:
  boot:
    admin:
      client:
        username: admin
        password: admin123

# 2. 正确的请求方式
# curl -u admin:admin123 http://localhost:8080/actuator/health

# 3. 或使用Authorization头
# Authorization: Basic YWRtaW46YWRtaW4xMjM=  (base64编码)
```

#### 4. SSE路径被拦截

**问题现象**：
```
SSE连接被401拒绝
```

**问题原因**：
- sse.path配置错误
- SSE路径未被正确排除

**解决方案**：

```yaml
# 确保SSE路径配置正确
sse:
  path: /sse/**  # 必须与实际SSE服务路径一致
```

### 调试方法

#### 启用调试日志

```yaml
logging:
  level:
    # 安全模块日志
    plus.ruoyi.common.security: DEBUG
    # Sa-Token日志
    cn.dev33.satoken: DEBUG
    # Spring MVC日志
    org.springframework.web.servlet: DEBUG
```

#### 查看收集的URL

```java
@RestController
@RequestMapping("/debug")
public class DebugController {

    @Autowired
    private AllUrlHandler allUrlHandler;

    @GetMapping("/urls")
    public List<String> getUrls() {
        return allUrlHandler.getUrls();
    }
}
```

#### 查看当前登录状态

```java
@GetMapping("/login-status")
public Map<String, Object> getLoginStatus() {
    Map<String, Object> result = new HashMap<>();
    result.put("isLogin", StpUtil.isLogin());
    if (StpUtil.isLogin()) {
        result.put("loginId", StpUtil.getLoginId());
        result.put("tokenValue", StpUtil.getTokenValue());
        result.put("tokenTimeout", StpUtil.getTokenTimeout());
    }
    return result;
}
```

#### 测试路径匹配

```java
@GetMapping("/test-match")
public boolean testMatch(@RequestParam String path) {
    AllUrlHandler handler = SpringUtils.getBean(AllUrlHandler.class);
    return handler.getUrls().stream()
        .anyMatch(url -> SaFoxUtil.isMatchPath(url, path));
}
```

## 扩展功能

### 1. 自定义URL收集器

```java
@Component
public class CustomUrlHandler extends AllUrlHandler {

    @Override
    public void afterPropertiesSet() {
        super.afterPropertiesSet();

        // 添加自定义URL
        getUrls().add("/custom/api/*");

        // 过滤掉某些URL
        getUrls().removeIf(url -> url.startsWith("/internal"));
    }
}
```

### 2. 动态白名单

```java
@Component
public class DynamicSecurityConfig {

    @Autowired
    private StringRedisTemplate redisTemplate;

    public boolean isDynamicExcluded(String path) {
        // 从Redis获取动态白名单
        Set<String> dynamicExcludes = redisTemplate.opsForSet()
            .members("security:dynamic:excludes");

        return dynamicExcludes != null && dynamicExcludes.stream()
            .anyMatch(pattern -> SaFoxUtil.isMatchPath(pattern, path));
    }
}
```

### 3. 接口级别权限控制

```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @SaCheckPermission("admin:user:list")  // 需要特定权限
    @GetMapping("/users")
    public List<User> listUsers() {
        return userService.list();
    }

    @SaCheckRole("admin")  // 需要admin角色
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.removeById(id);
    }
}
```

### 4. IP黑名单

```java
@Component
public class IpBlacklistInterceptor implements HandlerInterceptor {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String clientIp = ServletUtils.getClientIP(request);

        Boolean isBlocked = redisTemplate.opsForSet()
            .isMember("security:ip:blacklist", clientIp);

        if (Boolean.TRUE.equals(isBlocked)) {
            response.setStatus(HttpStatus.FORBIDDEN);
            return false;
        }

        return true;
    }
}
```

## 与其他模块集成

### 与satoken模块集成

安全模块依赖satoken模块实现核心认证功能：

```java
// 使用Sa-Token的登录检查
StpUtil.checkLogin();

// 使用Sa-Token的权限检查
StpUtil.checkPermission("user:add");

// 使用Sa-Token的角色检查
StpUtil.checkRole("admin");
```

### 与web模块集成

安全模块与web模块配合处理异常：

```java
// GlobalExceptionHandler会捕获NotLoginException
@ExceptionHandler(NotLoginException.class)
public R<Void> handleNotLoginException(NotLoginException e) {
    return R.fail(HttpStatus.UNAUTHORIZED, "认证失败，请重新登录");
}
```

### 与log模块集成

安全事件可以记录到操作日志：

```java
@Log(title = "登录日志", businessType = BusinessType.LOGIN)
public void login(String username, String password) {
    // 登录逻辑
}
```
