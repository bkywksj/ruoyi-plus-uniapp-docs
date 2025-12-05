# Web组件 (web) 

## 概述

Web模块（`ruoyi-common-web`）是系统的Web应用基础模块，提供Web应用的核心功能和MVC支持，包括验证码生成、过滤器配置、国际化支持、异常处理、拦截器等功能。

## 模块依赖

### 内部模块
- `ruoyi-common-json` - 提供数据序列化支持
- `ruoyi-common-redis` - 提供缓存与会话支持

### 外部依赖
- **Spring Boot Web** - Web应用基础支持（排除Tomcat）
- **Undertow** - 高性能Web服务器
- **Spring Boot Actuator** - 应用监控与管理
- **HuTool验证码** - 图形验证码生成
- **HuTool加密工具** - 加密解密功能

## 核心功能

### 1. 验证码配置 (CaptchaConfig)

提供多种类型的验证码生成器配置：

#### 支持的验证码类型
- **圆圈干扰验证码** (`CircleCaptcha`) - 带有圆圈干扰线
- **线段干扰验证码** (`LineCaptcha`) - 带有线段干扰线
- **扭曲干扰验证码** (`ShearCaptcha`) - 扭曲效果，增加识别难度

#### 统一配置参数
```java
// 验证码图片尺寸
private static final int WIDTH = 160;
private static final int HEIGHT = 60;

// 样式配置
private static final Color BACKGROUND = Color.WHITE;
private static final Font FONT = new Font("Arial", Font.BOLD, 48);
```

#### 验证码枚举定义

**验证码类别** (`CaptchaCategory`)
- `LINE` - 线段干扰验证码
- `CIRCLE` - 圆圈干扰验证码
- `SHEAR` - 扭曲干扰验证码

**验证码类型** (`CaptchaType`)
- `MATH` - 数学运算验证码 (如: 3+2=?)
- `CHAR` - 随机字符验证码 (如: ABC123)

### 2. 过滤器配置 (FilterConfig)

#### XSS过滤器
- **启用条件**: `xss.enabled=true`
- **功能**: 防范XSS攻击，过滤恶意脚本
- **执行优先级**: 最高优先级+1
- **URL映射**: `/*`

#### 可重复读取请求体过滤器
- **功能**: 允许多次读取HTTP请求体内容
- **应用场景**: 解决流只能读取一次的问题
- **执行优先级**: 最低优先级
- **URL映射**: `/*`

### 3. 国际化配置 (I18nConfig)

#### 语言环境解析器 (`I18nLocaleResolver`)
- **解析来源**: HTTP请求头的`content-language`字段
- **支持格式**: 语言_国家 (如: zh_CN, en_US)
- **默认行为**: 格式错误时返回系统默认语言环境
- **执行时机**: 在WebMvcAutoConfiguration之前

### 4. Web通用配置 (ResourcesConfig)

#### 功能特性
- **拦截器管理**: 注册全局访问性能监控拦截器
- **静态资源处理**: 配置文件上传路径访问 (`/resources/**`)
- **跨域支持**: 允许所有来源的跨域请求
- **全局异常处理**: 统一异常处理机制

#### 跨域配置详情
```java
// 跨域配置参数
config.setAllowCredentials(true);           // 允许携带凭证
config.addAllowedOriginPattern("*");        // 允许所有源
config.addAllowedHeader("*");               // 允许所有请求头
config.addAllowedMethod("*");               // 允许所有HTTP方法
config.setMaxAge(1800L);                    // 缓存时间30分钟
```

### 5. Undertow服务器配置 (UndertowConfig)

#### 主要配置
- **WebSocket支持**: 配置WebSocket缓冲区池
- **虚拟线程支持**: 启用虚拟线程时使用虚拟线程池
- **安全防护**: 禁用不安全的HTTP方法 (CONNECT, TRACE, TRACK)

#### 虚拟线程配置
```java
// 虚拟线程配置
VirtualThreadTaskExecutor executor = new VirtualThreadTaskExecutor("undertow-");
deploymentInfo.setExecutor(executor);
deploymentInfo.setAsyncExecutor(executor);
```

### 6. 过滤器实现

#### XSS过滤器 (`XssFilter`)
- **过滤范围**: 排除GET和DELETE请求
- **排除配置**: 支持配置不需要过滤的URL列表
- **处理方式**: 使用`XssHttpServletRequestWrapper`包装请求

#### XSS请求包装器 (`XssHttpServletRequestWrapper`)
- **参数过滤**: 清理请求参数中的HTML标签
- **JSON过滤**: 对JSON请求体进行XSS过滤
- **方法支持**: `getParameter()`, `getParameterMap()`, `getParameterValues()`

#### 可重复读取包装器 (`RepeatedlyRequestWrapper`)
- **适用类型**: Content-Type为`application/json`的请求
- **实现原理**: 缓存请求体内容，允许多次读取
- **字符编码**: 统一设置为UTF-8

### 7. 全局异常处理 (GlobalExceptionHandler)

#### 支持的异常类型

**HTTP相关异常**
- `HttpRequestMethodNotSupportedException` - 不支持的HTTP方法
- `NoHandlerFoundException` - 404异常
- `MissingPathVariableException` - 路径变量缺失

**业务异常**
- `ServiceException` - 业务逻辑异常
- `SseException` - SSE认证失败异常
- `BaseException` - 基础业务异常

**参数验证异常**
- `BindException` - 数据绑定异常
- `ConstraintViolationException` - 约束违反异常
- `MethodArgumentNotValidException` - 方法参数验证异常
- `MethodArgumentTypeMismatchException` - 参数类型不匹配

**JSON处理异常**
- `JsonParseException` - JSON解析异常
- `HttpMessageNotReadableException` - HTTP消息读取异常

**系统异常**
- `ServletException` - Servlet异常
- `IOException` - IO异常（特别处理SSE连接中断）
- `RuntimeException` - 运行时异常
- `Exception` - 兜底异常处理器

### 8. 性能监控拦截器 (PlusWebInvokeTimeInterceptor)

#### 功能特性
- **请求耗时统计**: 记录每个请求的执行时间
- **参数日志**: 记录请求参数（支持JSON和表单参数）
- **线程安全**: 使用ThreadLocal存储计时器
- **内存安全**: 请求完成后自动清理ThreadLocal

#### 日志格式
```
[PLUS]开始请求 => URL[GET /api/user],参数类型[json],参数:[{"id":1}]
[PLUS]结束请求 => URL[GET /api/user],耗时:[120]毫秒
```

### 9. 数学运算验证码生成器 (UnsignedMathGenerator)

#### 功能特性
- **运算类型**: 支持加、减、乘运算 (`+-*`)
- **数字范围**: 可配置参与计算的数字位数（默认2位）
- **结果保证**: 确保运算结果为非负数
- **格式整齐**: 右对齐填充空格保持格式

#### 生成示例
```
12 + 34 =  (用户需输入: 46)
25 * 3  =  (用户需输入: 75)
```

## 自动配置

模块通过Spring Boot的自动配置机制自动装载，配置文件位于：
`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`

```
plus.ruoyi.common.web.config.CaptchaConfig
plus.ruoyi.common.web.config.FilterConfig
plus.ruoyi.common.web.config.I18nConfig
plus.ruoyi.common.web.config.ResourcesConfig
plus.ruoyi.common.web.config.UndertowConfig
```

## 使用指南

### 1. 启用XSS防护
```yaml
xss:
  enabled: true
  exclude-urls:
    - /system/notice/*
```

### 2. 配置文件上传路径
```yaml
app:
  upload-path: /opt/uploads
```

### 3. 国际化使用
```http
GET /api/user
Content-Language: zh_CN
```

### 4. 验证码集成
```java
@Autowired
private CircleCaptcha circleCaptcha;

// 生成验证码
circleCaptcha.createCode();
String code = circleCaptcha.getCode();
```

## 安全特性

1. **XSS防护**: 自动过滤HTML标签，防止脚本注入
2. **HTTP方法限制**: 禁用不安全的HTTP方法
3. **跨域配置**: 支持可控的跨域访问
4. **验证码保护**: 多种验证码类型防止机器攻击
5. **异常信息安全**: 统一异常处理，避免敏感信息泄露

## 性能优化

1. **Undertow容器**: 使用高性能的Undertow替代Tomcat
2. **虚拟线程支持**: 在支持虚拟线程的环境下自动启用
3. **请求体缓存**: 合理缓存请求体，避免重复读取
4. **懒加载**: 验证码生成器使用`@Lazy`注解延迟初始化

## 监控与日志

1. **请求耗时统计**: 自动记录所有请求的执行时间
2. **参数日志**: 详细记录请求参数便于调试
3. **异常日志**: 完整的异常信息记录
4. **Actuator集成**: 支持Spring Boot Actuator监控

## 扩展指南

### 自定义验证码生成器
```java
@Component
public class CustomCaptchaGenerator implements CodeGenerator {
    @Override
    public String generate() {
        // 自定义验证码生成逻辑
        return "custom";
    }
    
    @Override
    public boolean verify(String code, String userInputCode) {
        // 自定义验证逻辑
        return code.equals(userInputCode);
    }
}
```

### 自定义异常处理
```java
@ExceptionHandler(CustomException.class)
public R<Void> handleCustomException(CustomException e) {
    log.error("自定义异常: {}", e.getMessage());
    return R.fail(e.getMessage());
}
```

### 自定义拦截器
```java
@Component
public class CustomInterceptor implements HandlerInterceptor {
    // 实现自定义拦截逻辑
}
```

## 注意事项

1. **XSS过滤器**: 仅对POST、PUT、PATCH等修改请求生效
2. **验证码**: 所有验证码实例都是懒加载，首次使用时才创建
3. **SSE连接**: IO异常处理中特别处理了SSE连接中断情况
4. **虚拟线程**: 需要JDK 17+且开启虚拟线程特性 (JDK 21+ 支持更完善)
5. **内存管理**: 拦截器使用ThreadLocal，注意及时清理避免内存泄漏
