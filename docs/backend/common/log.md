# 日志管理模块

## 模块概述

`ruoyi-common-log` 是系统的核心日志管理模块，基于 Spring AOP（面向切面编程）实现，提供操作日志记录和登录日志记录功能。通过注解驱动的方式，自动记录用户操作行为，便于系统审计、问题排查和安全监控。

**核心特性：**

- **AOP 切面拦截** - 通过 `@Around` 环绕通知自动拦截带有 `@Log` 注解的方法
- **敏感信息过滤** - 自动过滤密码等敏感字段，保障数据安全
- **异步事件发布** - 通过 Spring 事件机制异步记录日志，不影响业务性能
- **多租户支持** - 完整支持多租户场景下的日志隔离
- **精确计时** - 使用 `StopWatch` 精确记录方法执行耗时
- **OpenAPI 用户支持** - 区分普通用户和 OpenAPI 接口调用

## 模块架构

```
ruoyi-common-log
├── annotation/
│   └── Log.java                    # 操作日志注解
├── aspect/
│   └── LogAspect.java              # 日志切面处理器
├── config/
│   └── LogAutoConfiguration.java   # 自动配置类
├── event/
│   ├── LoginLogEvent.java          # 登录日志事件
│   └── OperLogEvent.java           # 操作日志事件
└── publisher/
    └── LoginLogPublisher.java      # 登录日志发布器
```

### 架构设计图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              日志管理模块架构                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         应用层 (Application)                         │   │
│  │                                                                      │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │                    Controller 控制器                         │   │   │
│  │   │                                                              │   │   │
│  │   │  @Log(title = "用户管理", operType = DictOperType.INSERT)    │   │   │
│  │   │  @PostMapping("/add")                                        │   │   │
│  │   │  public R<Void> addUser(@RequestBody User user) { ... }      │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                               │                                      │   │
│  └───────────────────────────────┼──────────────────────────────────────┘   │
│                                  │ @Log 注解触发                            │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        切面层 (Aspect Layer)                         │   │
│  │                                                                      │   │
│  │   ┌────────────────────────────────────────────────────────────┐   │   │
│  │   │                      LogAspect 切面                         │   │   │
│  │   │                                                             │   │   │
│  │   │  @Around("@annotation(controllerLog)")                      │   │   │
│  │   │  ┌─────────────────────────────────────────────────────┐   │   │   │
│  │   │  │  1. 启动 StopWatch 计时器                            │   │   │   │
│  │   │  │  2. 执行目标方法 joinPoint.proceed()                 │   │   │   │
│  │   │  │  3. 捕获异常（如有）                                 │   │   │   │
│  │   │  │  4. 停止计时，记录耗时                               │   │   │   │
│  │   │  │  5. 组装 OperLogEvent 日志事件                       │   │   │   │
│  │   │  │  6. 发布事件到 Spring ApplicationContext             │   │   │   │
│  │   │  └─────────────────────────────────────────────────────┘   │   │   │
│  │   └────────────────────────────────────────────────────────────┘   │   │
│  │                               │                                     │   │
│  │   ┌────────────────────────────────────────────────────────────┐   │   │
│  │   │                  LoginLogPublisher 发布器                   │   │   │
│  │   │                                                             │   │   │
│  │   │  publishLoginLog(userName, status, message, tenantId...)    │   │   │
│  │   │  → 创建 LoginLogEvent 并发布到 Spring ApplicationContext    │   │   │
│  │   └────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
│                                  │ Spring Event                             │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        事件层 (Event Layer)                          │   │
│  │                                                                      │   │
│  │   ┌─────────────────────┐    ┌─────────────────────┐               │   │
│  │   │    OperLogEvent     │    │   LoginLogEvent     │               │   │
│  │   │                     │    │                     │               │   │
│  │   │  • operId          │    │  • tenantId        │               │   │
│  │   │  • tenantId        │    │  • deviceType      │               │   │
│  │   │  • title           │    │  • userId          │               │   │
│  │   │  • operType        │    │  • userName        │               │   │
│  │   │  • operName        │    │  • status          │               │   │
│  │   │  • operParam       │    │  • message         │               │   │
│  │   │  • jsonResult      │    │  • request         │               │   │
│  │   │  • costTime        │    │                     │               │   │
│  │   └─────────────────────┘    └─────────────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
│                                  │ @EventListener                           │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       监听层 (Listener Layer)                        │   │
│  │                                                                      │   │
│  │   ┌────────────────────────────────────────────────────────────┐   │   │
│  │   │                    业务模块事件监听器                        │   │   │
│  │   │                                                             │   │   │
│  │   │  @EventListener                                             │   │   │
│  │   │  @Async                                                     │   │   │
│  │   │  public void handleOperLogEvent(OperLogEvent event) {       │   │   │
│  │   │      // 保存到数据库                                         │   │   │
│  │   │      operLogService.save(event);                            │   │   │
│  │   │  }                                                          │   │   │
│  │   └────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 自动配置机制

### LogAutoConfiguration 自动配置类

`LogAutoConfiguration` 负责注册日志模块的核心组件：

```java
@AutoConfiguration
public class LogAutoConfiguration {

    /**
     * 注册操作日志切面
     * 通过 AOP 拦截标注了 @Log 注解的方法，自动记录操作日志
     */
    @Bean
    public LogAspect logAspect() {
        return new LogAspect();
    }

    /**
     * 注册登录日志发布器
     * 提供统一的登录日志事件发布接口
     */
    @Bean
    public LoginLogPublisher loginLogPublisher() {
        return new LoginLogPublisher();
    }
}
```

**配置特性：**

| 特性 | 说明 |
|------|------|
| 自动装配 | 使用 `@AutoConfiguration` 实现 Spring Boot 3 自动装配 |
| 无条件加载 | 不需要额外配置即可启用 |
| 两个核心 Bean | LogAspect（操作日志）和 LoginLogPublisher（登录日志） |

### 依赖模块

```xml
<dependencies>
    <!-- 认证模块 - 提供用户身份识别 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-satoken</artifactId>
    </dependency>

    <!-- JSON模块 - 提供日志序列化支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-json</artifactId>
    </dependency>
</dependencies>
```

## @Log 注解详解

### 注解定义

```java
@Target({ElementType.PARAMETER, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {

    /**
     * 模块名称
     * 用于标识操作的业务模块，如"用户管理"、"角色管理"
     */
    String title() default "";

    /**
     * 操作类型
     * 定义操作的类型，如新增、修改、删除、查询等
     */
    DictOperType operType() default DictOperType.OTHER;

    /**
     * 是否保存请求参数
     * 设置为 false 可避免记录大量数据
     */
    boolean isSaveRequestData() default true;

    /**
     * 是否保存响应结果
     * 对于导出等大数据量操作，建议设置为 false
     */
    boolean isSaveResponseData() default true;

    /**
     * 排除指定的请求参数
     * 用于排除敏感字段或不需要记录的参数
     */
    String[] excludeParamNames() default {};
}
```

### 注解属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `String` | `""` | 操作模块名称，用于标识业务模块 |
| `operType` | `DictOperType` | `OTHER` | 操作类型枚举 |
| `isSaveRequestData` | `boolean` | `true` | 是否保存请求参数 |
| `isSaveResponseData` | `boolean` | `true` | 是否保存响应结果 |
| `excludeParamNames` | `String[]` | `{}` | 需要排除的参数名称数组 |

### 操作类型枚举

```java
@Getter
@AllArgsConstructor
public enum DictOperType {

    INSERT("1", "新增"),        // 新增数据
    UPDATE("2", "修改"),        // 修改数据
    DELETE("3", "删除"),        // 删除数据
    GRANT("4", "授权"),         // 权限授权
    EXPORT("5", "导出"),        // 数据导出
    IMPORT("6", "导入"),        // 数据导入
    FORCE("7", "强退"),         // 强制退出
    GENCODE("8", "生成代码"),    // 代码生成
    CLEAN("9", "清空数据"),      // 清空数据
    OTHER("99", "其他");        // 其他操作

    private final String value;
    private final String label;

    // 字典类型常量
    public static final String DICT_TYPE = "sys_oper_type";
}
```

### 使用示例

#### 基础用法

```java
@RestController
@RequestMapping("/system/user")
public class UserController {

    /**
     * 新增用户
     */
    @Log(title = "用户管理", operType = DictOperType.INSERT)
    @PostMapping("/add")
    public R<Void> add(@RequestBody UserBo bo) {
        return userService.insertUser(bo);
    }

    /**
     * 修改用户
     */
    @Log(title = "用户管理", operType = DictOperType.UPDATE)
    @PutMapping("/edit")
    public R<Void> edit(@RequestBody UserBo bo) {
        return userService.updateUser(bo);
    }

    /**
     * 删除用户
     */
    @Log(title = "用户管理", operType = DictOperType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        return userService.deleteUserByIds(userIds);
    }
}
```

#### 排除敏感参数

```java
@Log(
    title = "用户管理",
    operType = DictOperType.UPDATE,
    excludeParamNames = {"password", "oldPassword", "newPassword"}
)
@PutMapping("/updatePassword")
public R<Void> updatePassword(@RequestBody UpdatePasswordBo bo) {
    return userService.updatePassword(bo);
}
```

#### 不记录响应数据

```java
@Log(
    title = "用户管理",
    operType = DictOperType.EXPORT,
    isSaveResponseData = false  // 导出操作不记录响应数据
)
@PostMapping("/export")
public void export(HttpServletResponse response, UserQuery query) {
    userService.exportUsers(response, query);
}
```

#### 不记录请求参数

```java
@Log(
    title = "文件上传",
    operType = DictOperType.OTHER,
    isSaveRequestData = false  // 文件上传不记录请求参数
)
@PostMapping("/upload")
public R<SysOss> upload(@RequestParam("file") MultipartFile file) {
    return ossService.upload(file);
}
```

## LogAspect 切面处理器

### 核心处理流程

`LogAspect` 是日志模块的核心组件，通过 AOP 环绕通知拦截带有 `@Log` 注解的方法：

```java
@Slf4j
@Aspect
public class LogAspect {

    /**
     * 排除敏感属性字段
     * 这些字段在日志记录时会被自动过滤
     */
    public static final String[] EXCLUDE_PROPERTIES = {
        "password", "oldPassword", "newPassword", "confirmPassword"
    };

    /**
     * 环绕通知：拦截带有 @Log 注解的方法
     */
    @Around("@annotation(controllerLog)")
    public Object doAround(ProceedingJoinPoint joinPoint, Log controllerLog) throws Throwable {
        // 1. 启动计时器
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        Object result = null;
        Exception exception = null;

        try {
            // 2. 执行目标方法
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            // 3. 捕获异常
            exception = e;
            throw e;  // 重新抛出，不影响业务流程
        } finally {
            // 4. 停止计时
            stopWatch.stop();
            long costTime = stopWatch.getDuration().toMillis();

            // 5. 记录操作日志
            handleLog(joinPoint, controllerLog, exception, result, costTime);
        }
    }
}
```

### 日志信息收集

切面会收集以下信息：

```java
protected void handleLog(final ProceedingJoinPoint joinPoint, Log controllerLog,
                         final Exception e, Object jsonResult, long costTime) {
    try {
        OperLogEvent operLog = new OperLogEvent();

        // 设置默认成功状态
        operLog.setStatus(DictOperResult.SUCCESS.getValue());

        // 获取客户端 IP
        String ip = ServletUtils.getClientIP();
        operLog.setOperIp(ip);

        // 获取请求 URI（最大 255 字符）
        operLog.setOperUrl(StringUtils.substring(
            ServletUtils.getRequest().getRequestURI(), 0, 255
        ));

        // 获取当前登录用户信息
        try {
            LoginUser loginUser = LoginHelper.getLoginUser();
            if (ObjectUtil.isNotNull(loginUser)) {
                operLog.setTenantId(loginUser.getTenantId());
                operLog.setDeptName(loginUser.getDeptName());

                // 区分 OpenAPI 用户和普通用户
                UserType openapiUser = UserType.OPENAPI_USER;
                if (openapiUser.getUserType().equals(loginUser.getUserType())) {
                    operLog.setOperName(openapiUser.getDeviceType() + ":" + loginUser.getUserName());
                    operLog.setOperatorType(openapiUser.getUserType());
                } else {
                    operLog.setOperName(loginUser.getUserName());
                    operLog.setOperatorType(loginUser.getUserType());
                }
            } else {
                operLog.setOperName("匿名用户");
                operLog.setOperatorType("anonymous");
            }
        } catch (Exception ex) {
            operLog.setOperName("匿名用户");
            operLog.setOperatorType("anonymous");
        }

        // 设置异常信息
        if (e != null) {
            operLog.setStatus(DictOperResult.FAIL.getValue());
            operLog.setErrorMsg(StringUtils.substring(e.getMessage(), 0, 65535));
        }

        // 设置方法签名
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();
        operLog.setMethod(className + "." + methodName + "()");

        // 设置请求方式
        operLog.setRequestMethod(ServletUtils.getRequest().getMethod());

        // 处理注解配置的参数
        getControllerMethodDescription(joinPoint, controllerLog, operLog, jsonResult);

        // 设置耗时
        operLog.setCostTime(costTime);

        // 发布事件
        SpringUtils.context().publishEvent(operLog);

    } catch (Exception exp) {
        log.error("日志记录异常:{}", exp.getMessage(), exp);
    }
}
```

### 敏感信息过滤

系统自动过滤以下敏感字段：

| 字段名 | 说明 |
|--------|------|
| `password` | 密码 |
| `oldPassword` | 旧密码 |
| `newPassword` | 新密码 |
| `confirmPassword` | 确认密码 |

### 对象类型过滤

自动过滤以下类型的对象，避免序列化问题：

```java
public boolean isFilterObject(final Object o) {
    Class<?> clazz = o.getClass();

    // 判断是否为数组类型
    if (clazz.isArray()) {
        return MultipartFile.class.isAssignableFrom(clazz.getComponentType());
    }
    // 判断是否为 Collection 类型
    else if (Collection.class.isAssignableFrom(clazz)) {
        Collection collection = (Collection) o;
        for (Object value : collection) {
            return value instanceof MultipartFile;
        }
    }
    // 判断是否为 Map 类型
    else if (Map.class.isAssignableFrom(clazz)) {
        Map map = (Map) o;
        for (Object value : map.values()) {
            return value instanceof MultipartFile;
        }
    }

    // 判断是否为需要过滤的特定类型
    return o instanceof MultipartFile
        || o instanceof HttpServletRequest
        || o instanceof HttpServletResponse
        || o instanceof BindingResult;
}
```

**过滤的对象类型：**

| 类型 | 说明 |
|------|------|
| `MultipartFile` | 文件上传对象（内容过大） |
| `HttpServletRequest` | 请求对象（包含大量无用信息） |
| `HttpServletResponse` | 响应对象（包含大量无用信息） |
| `BindingResult` | 参数绑定结果对象（Spring 内部使用） |

### 字段长度限制

为防止日志数据过大，系统对各字段进行长度限制：

| 字段 | 最大长度 | 说明 |
|------|----------|------|
| `operUrl` | 255 字符 | 请求 URL |
| `operParam` | 65535 字符 | 请求参数 |
| `jsonResult` | 65535 字符 | 响应结果 |
| `errorMsg` | 65535 字符 | 错误消息 |

## 事件模型

### OperLogEvent 操作日志事件

记录用户操作的详细信息：

```java
@Data
public class OperLogEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 日志主键 */
    private Long operId;

    /** 租户ID */
    private String tenantId;

    /** 操作模块 */
    private String title;

    /** 操作类型 */
    private String operType;

    /** 请求方法（类名.方法名） */
    private String method;

    /** 请求方式（GET/POST/PUT/DELETE） */
    private String requestMethod;

    /** 操作用户类别 */
    private String operatorType;

    /** 操作人员 */
    private String operName;

    /** 部门名称 */
    private String deptName;

    /** 请求 URL */
    private String operUrl;

    /** 操作 IP */
    private String operIp;

    /** 操作地点 */
    private String operLocation;

    /** 请求参数 */
    private String operParam;

    /** 返回参数 */
    private String jsonResult;

    /** 操作状态（0成功 1失败） */
    private String status;

    /** 错误消息 */
    private String errorMsg;

    /** 操作时间 */
    private Date operTime;

    /** 消耗时间（毫秒） */
    private Long costTime;
}
```

### LoginLogEvent 登录日志事件

记录用户登录相关信息：

```java
@Data
public class LoginLogEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 租户ID */
    private String tenantId;

    /** 设备类型 */
    private String deviceType;

    /** 用户ID */
    private Long userId;

    /** 用户账号 */
    private String userName;

    /** 登录状态 */
    private String status;

    /** 提示消息 */
    private String message;

    /** 请求对象 */
    private HttpServletRequest request;

    /** 其他参数 */
    private Object[] args;
}
```

## 登录日志发布器

### LoginLogPublisher 使用方式

`LoginLogPublisher` 提供了三个重载方法，适用于不同场景：

```java
public class LoginLogPublisher {

    /**
     * 完整参数版本 - 适用于需要指定设备类型的场景
     */
    public void publishLoginLog(String userName, String status, String message,
                                String tenantId, Long userId, String deviceType) {
        LoginLogEvent event = new LoginLogEvent();
        event.setUserName(userName);
        event.setStatus(status);
        event.setMessage(message);
        event.setTenantId(tenantId);
        event.setUserId(userId);
        event.setDeviceType(deviceType);
        event.setRequest(ServletUtils.getRequest());

        SpringUtils.context().publishEvent(event);
    }

    /**
     * 默认设备类型版本 - 简化调用
     */
    public void publishLoginLog(String userName, String status, String message,
                                String tenantId, Long userId) {
        publishLoginLog(userName, status, message, tenantId, userId,
            UserType.APP_USER.getDeviceType());
    }

    /**
     * 最简版本 - 用户ID为null的场景
     */
    public void publishLoginLog(String userName, String status, String message,
                                String tenantId) {
        publishLoginLog(userName, status, message, tenantId, null);
    }
}
```

### 方法选择指南

| 方法签名 | 适用场景 | 说明 |
|----------|----------|------|
| `publishLoginLog(6参数)` | 完整参数场景 | 需要指定设备类型时使用 |
| `publishLoginLog(5参数)` | 默认设备场景 | 使用 APP_USER 设备类型 |
| `publishLoginLog(4参数)` | 最简场景 | 用户ID为null，如注册失败 |

### 登录日志使用示例

```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final LoginLogPublisher loginLogPublisher;

    /**
     * 用户登录
     */
    public R<LoginVo> login(LoginDto loginDto) {
        try {
            // 执行登录逻辑
            LoginUser loginUser = performLogin(loginDto);

            // 发布登录成功日志
            loginLogPublisher.publishLoginLog(
                loginDto.getUsername(),
                DictOperResult.SUCCESS.getValue(),
                "登录成功",
                loginUser.getTenantId(),
                loginUser.getUserId(),
                UserType.PC_USER.getDeviceType()
            );

            return R.ok(buildLoginVo(loginUser));

        } catch (Exception e) {
            // 发布登录失败日志
            loginLogPublisher.publishLoginLog(
                loginDto.getUsername(),
                DictOperResult.FAIL.getValue(),
                "登录失败：" + e.getMessage(),
                getTenantId()
            );

            throw e;
        }
    }

    /**
     * 用户登出
     */
    public R<Void> logout() {
        LoginUser loginUser = LoginHelper.getLoginUser();

        // 发布登出日志
        loginLogPublisher.publishLoginLog(
            loginUser.getUserName(),
            DictOperResult.SUCCESS.getValue(),
            "退出成功",
            loginUser.getTenantId(),
            loginUser.getUserId()
        );

        // 执行登出逻辑
        StpUtil.logout();
        return R.ok();
    }
}
```

## 事件监听器实现

### 操作日志监听器

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class OperLogEventListener {

    private final ISysOperLogService operLogService;

    /**
     * 异步处理操作日志事件
     */
    @Async
    @EventListener
    public void handleOperLogEvent(OperLogEvent event) {
        try {
            // 转换为数据库实体
            SysOperLog operLog = new SysOperLog();
            BeanUtils.copyProperties(event, operLog);

            // 设置操作时间
            operLog.setOperTime(new Date());

            // 解析操作地点（根据IP获取地理位置）
            operLog.setOperLocation(AddressUtils.getRealAddressByIP(event.getOperIp()));

            // 保存到数据库
            operLogService.save(operLog);

            log.debug("操作日志保存成功: {}", event.getTitle());
        } catch (Exception e) {
            log.error("操作日志保存失败: {}", e.getMessage(), e);
        }
    }
}
```

### 登录日志监听器

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class LoginLogEventListener {

    private final ISysLoginInfoService loginInfoService;

    /**
     * 异步处理登录日志事件
     */
    @Async
    @EventListener
    public void handleLoginLogEvent(LoginLogEvent event) {
        try {
            SysLoginInfo loginInfo = new SysLoginInfo();

            // 设置基本信息
            loginInfo.setUserName(event.getUserName());
            loginInfo.setTenantId(event.getTenantId());
            loginInfo.setStatus(event.getStatus());
            loginInfo.setMsg(event.getMessage());
            loginInfo.setDeviceType(event.getDeviceType());

            // 从 Request 中获取更多信息
            HttpServletRequest request = event.getRequest();
            if (request != null) {
                // 获取客户端IP
                String ip = ServletUtils.getClientIP(request);
                loginInfo.setIpaddr(ip);

                // 解析地理位置
                loginInfo.setLoginLocation(AddressUtils.getRealAddressByIP(ip));

                // 获取浏览器信息
                UserAgent userAgent = UserAgentUtil.parse(request.getHeader("User-Agent"));
                loginInfo.setBrowser(userAgent.getBrowser().getName());
                loginInfo.setOs(userAgent.getOs().getName());
            }

            // 设置登录时间
            loginInfo.setLoginTime(new Date());

            // 保存到数据库
            loginInfoService.save(loginInfo);

            log.debug("登录日志保存成功: {}", event.getUserName());
        } catch (Exception e) {
            log.error("登录日志保存失败: {}", e.getMessage(), e);
        }
    }
}
```

## 高级配置

### 自定义敏感字段过滤

如果默认的敏感字段不满足需求，可以通过 `excludeParamNames` 添加自定义过滤：

```java
@Log(
    title = "支付管理",
    operType = DictOperType.INSERT,
    excludeParamNames = {
        "cardNumber",      // 银行卡号
        "cvv",             // CVV码
        "idCard",          // 身份证号
        "phoneNumber"      // 手机号
    }
)
@PostMapping("/pay")
public R<Void> pay(@RequestBody PaymentBo bo) {
    return paymentService.pay(bo);
}
```

### 批量操作日志记录

对于批量操作，建议只记录操作概要：

```java
@Log(
    title = "用户管理",
    operType = DictOperType.DELETE,
    isSaveRequestData = true,
    isSaveResponseData = false
)
@DeleteMapping("/batch")
public R<Void> batchDelete(@RequestBody List<Long> ids) {
    // 日志会记录删除的ID列表，但不记录响应结果
    return userService.deleteByIds(ids);
}
```

### 异步日志配置

确保 Spring 异步功能已启用：

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("logExecutor")
    public Executor logExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("log-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

// 使用自定义线程池
@Async("logExecutor")
@EventListener
public void handleOperLogEvent(OperLogEvent event) {
    // 处理日志
}
```

## 最佳实践

### 1. 注解使用规范

```java
// ✅ 推荐：清晰的模块名称和操作类型
@Log(title = "用户管理", operType = DictOperType.INSERT)

// ❌ 不推荐：模糊的描述
@Log(title = "操作", operType = DictOperType.OTHER)
```

### 2. 敏感参数处理

```java
// ✅ 推荐：主动排除敏感参数
@Log(
    title = "用户管理",
    operType = DictOperType.UPDATE,
    excludeParamNames = {"password", "secretKey"}
)

// ❌ 不推荐：依赖默认过滤，可能遗漏敏感字段
@Log(title = "用户管理", operType = DictOperType.UPDATE)
```

### 3. 大数据量操作

```java
// ✅ 推荐：导出操作不保存响应数据
@Log(
    title = "用户导出",
    operType = DictOperType.EXPORT,
    isSaveResponseData = false
)

// ✅ 推荐：文件上传不保存请求数据
@Log(
    title = "文件上传",
    operType = DictOperType.OTHER,
    isSaveRequestData = false
)
```

### 4. 性能考虑

- 合理使用 `isSaveRequestData` 和 `isSaveResponseData`
- 对于频繁调用的接口，考虑是否需要记录日志
- 大对象参数建议排除，避免日志表过大
- 使用异步处理，避免阻塞业务线程

### 5. 安全建议

- 确保敏感信息不被记录
- 定期清理历史日志数据
- 控制日志访问权限
- 对敏感操作增加告警机制

## 常见问题

### 1. 日志没有记录

**问题原因：**

- 方法上缺少 `@Log` 注解
- AOP 代理未生效（如内部方法调用）
- 事件监听器未正确配置

**解决方案：**

```java
// 确保方法上有 @Log 注解
@Log(title = "用户管理", operType = DictOperType.INSERT)
@PostMapping("/add")
public R<Void> add(@RequestBody UserBo bo) {
    return userService.insertUser(bo);
}

// 避免内部方法调用（AOP 代理不生效）
// ❌ 错误示例
public void method1() {
    method2();  // 内部调用，AOP 不生效
}

@Log(title = "操作")
public void method2() {
    // ...
}
```

### 2. 敏感信息被记录

**问题原因：**

- 未使用 `excludeParamNames` 排除敏感字段
- 敏感字段名称不在默认过滤列表中

**解决方案：**

```java
@Log(
    title = "用户管理",
    excludeParamNames = {"password", "token", "secretKey", "idCard"}
)
```

### 3. 日志数据过大

**问题原因：**

- 记录了大对象的请求参数
- 记录了大量数据的响应结果

**解决方案：**

```java
// 对于大数据量操作，关闭参数记录
@Log(
    title = "数据导出",
    operType = DictOperType.EXPORT,
    isSaveRequestData = false,
    isSaveResponseData = false
)
```

### 4. 匿名用户日志

**问题原因：**

- 接口未进行认证
- 获取用户信息时发生异常

**说明：**

这是正常行为，对于未登录用户，系统会标记为"匿名用户"：

```java
operLog.setOperName("匿名用户");
operLog.setOperatorType("anonymous");
```

### 5. 日志事件丢失

**问题原因：**

- 事件监听器未注册
- 异步处理时线程池已满

**解决方案：**

```java
// 确保监听器已注册
@Component
public class OperLogEventListener {

    @Async
    @EventListener
    public void handleOperLogEvent(OperLogEvent event) {
        // 处理日志
    }
}

// 配置合适的线程池
@Bean
public Executor asyncExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setQueueCapacity(1000);  // 增加队列容量
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    return executor;
}
```

## 总结

日志管理模块提供了完整的操作审计功能，通过注解驱动的方式大大简化了日志记录的复杂度：

**技术优势：**

- **AOP 切面** - 无侵入式日志记录，业务代码零改动
- **异步处理** - 事件驱动，不影响业务性能
- **敏感过滤** - 自动过滤敏感信息，保障数据安全
- **灵活配置** - 支持自定义排除字段和记录策略

**业务价值：**

- **操作审计** - 完整记录用户操作行为
- **安全监控** - 及时发现异常操作
- **问题排查** - 通过日志快速定位问题
- **合规要求** - 满足审计和合规要求

合理使用该模块可以帮助系统实现完整的操作审计和安全监控能力。
