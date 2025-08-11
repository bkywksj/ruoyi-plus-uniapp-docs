# 日志管理 (log)

## 概述

日志管理模块是系统的核心功能模块之一，基于Spring AOP（面向切面编程）实现，提供操作日志记录和登录日志记录功能。通过注解驱动的方式，自动记录用户操作行为，便于系统审计、问题排查和安全监控。

## 模块结构

```
ruoyi-common-log/
├── src/main/java/plus/ruoyi/common/log/
│   ├── annotation/           # 注解定义
│   │   └── Log.java         # 操作日志注解
│   ├── aspect/              # 切面实现
│   │   └── LogAspect.java   # 日志切面处理器
│   ├── event/               # 事件定义
│   │   ├── LoginLogEvent.java    # 登录日志事件
│   │   └── OperLogEvent.java     # 操作日志事件
│   └── publisher/           # 事件发布器
│       └── LoginLogPublisher.java # 登录日志发布器
└── src/main/resources/META-INF/spring/
    └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 核心功能

### 1. 操作日志记录

自动记录用户的操作行为，包括：

- 请求参数和响应结果
- 操作耗时统计
- 异常信息记录
- 用户身份信息
- 请求来源IP和URL

### 2. 登录日志记录

记录用户登录、登出等认证相关操作：

- 登录成功/失败记录
- 设备类型识别
- 多租户支持
- 异常情况记录

## 核心注解

### @Log 操作日志注解

用于标记需要记录操作日志的方法。

#### 注解属性

| 属性名                  | 类型           | 默认值     | 说明                 |
|----------------------|--------------|---------|--------------------|
| `title`              | String       | `""`    | 操作模块名称，用于标识操作的业务模块 |
| `operType`           | DictOperType | `OTHER` | 操作类型，如增删改查等        |
| `isSaveRequestData`  | boolean      | `true`  | 是否保存请求参数           |
| `isSaveResponseData` | boolean      | `true`  | 是否保存响应结果           |
| `excludeParamNames`  | String[]     | `{}`    | 排除记录的参数名称数组        |

#### 使用示例

```java

@RestController
@RequestMapping("/system/user")
public class UserController {

    /**
     * 基础用法
     */
    @Log(title = "用户管理", operType = DictOperType.INSERT)
    @PostMapping("/add")
    public R<Void> addUser(@RequestBody User user) {
        return userService.insertUser(user);
    }

    /**
     * 排除敏感参数
     */
    @Log(title = "用户管理",
            operType = DictOperType.UPDATE,
            excludeParamNames = {"password", "oldPassword"})
    @PutMapping("/updatePassword")
    public R<Void> updatePassword(@RequestBody UpdatePasswordDto dto) {
        return userService.updatePassword(dto);
    }

    /**
     * 不记录响应数据
     */
    @Log(title = "用户管理",
            operType = DictOperType.EXPORT,
            isSaveResponseData = false)
    @PostMapping("/export")
    public void exportUsers(HttpServletResponse response) {
        userService.exportUsers(response);
    }
}
```

## 事件模型

### OperLogEvent 操作日志事件

记录用户操作的详细信息：

```java

@Data
public class OperLogEvent implements Serializable {
    private Long operId;           // 日志主键
    private String tenantId;       // 租户ID
    private String title;          // 操作模块
    private String operType;       // 操作类型
    private String method;         // 请求方法
    private String requestMethod;  // 请求方式(GET/POST等)
    private String operatorType;   // 操作用户类别
    private String operName;       // 操作人员
    private String deptName;       // 部门名称
    private String operUrl;        // 请求URL
    private String operIp;         // 操作IP
    private String operParam;      // 请求参数
    private String jsonResult;     // 返回参数
    private String status;         // 操作状态
    private String errorMsg;       // 错误消息
    private Date operTime;         // 操作时间
    private Long costTime;         // 消耗时间(毫秒)
}
```

### LoginLogEvent 登录日志事件

记录用户登录相关信息：

```java

@Data
public class LoginLogEvent implements Serializable {
    private String tenantId;       // 租户ID
    private String deviceType;     // 设备类型
    private Long userId;           // 用户ID
    private String userName;       // 用户账号
    private String status;         // 登录状态
    private String message;        // 提示消息
    private HttpServletRequest request; // 请求对象
    private Object[] args;         // 其他参数
}
```

## 登录日志发布器

### LoginLogPublisher 使用方式

```java

@Service
public class AuthService {

    @Autowired
    private LoginLogPublisher loginLogPublisher;

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
}
```

### 重载方法说明

| 方法签名                                                                       | 适用场景   | 说明                 |
|----------------------------------------------------------------------------|--------|--------------------|
| `publishLoginLog(userName, status, message, tenantId, userId, deviceType)` | 完整参数场景 | 适用于需要指定设备类型的场景     |
| `publishLoginLog(userName, status, message, tenantId, userId)`             | 默认PC设备 | 简化调用，默认PC设备类型      |
| `publishLoginLog(userName, status, message, tenantId)`                     | 最简场景   | 用户ID为null的场景，如注册失败 |

## 配置说明

### 自动配置

模块通过Spring Boot自动配置机制加载，配置文件位于：

```
META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

内容：

```
plus.ruoyi.common.log.aspect.LogAspect
plus.ruoyi.common.log.publisher.LoginLogPublisher
```

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

## 特性说明

### 1. 敏感信息过滤

系统自动过滤以下敏感字段：

- `password` - 密码
- `oldPassword` - 旧密码
- `newPassword` - 新密码
- `confirmPassword` - 确认密码

### 2. 对象类型过滤

自动过滤以下类型的对象，避免序列化问题：

- `MultipartFile` - 文件上传对象
- `HttpServletRequest` - 请求对象
- `HttpServletResponse` - 响应对象
- `BindingResult` - 验证结果对象

### 3. 参数长度限制

为防止日志过大，系统对各字段进行长度限制：

- `operUrl` - 最大255字符
- `operParam` - 最大65535字符
- `jsonResult` - 最大65535字符
- `errorMsg` - 最大65535字符

### 4. 性能优化

- 使用`ThreadLocal`存储计时器，避免线程安全问题
- 异步事件发布，不阻塞业务流程
- 异常捕获机制，确保日志记录失败不影响业务

## 扩展说明

### 操作类型说明

系统内置的`DictOperType`枚举定义了以下操作类型：

```java

@Getter
@AllArgsConstructor
public enum DictOperType {
    INSERT("1", "新增"),        // 新增操作
    UPDATE("2", "修改"),        // 修改操作  
    DELETE("3", "删除"),        // 删除操作
    GRANT("4", "授权"),         // 授权操作
    EXPORT("5", "导出"),        // 导出操作
    IMPORT("6", "导入"),        // 导入操作
    FORCE("7", "强退"),         // 强制退出
    GENCODE("8", "生成代码"),    // 代码生成
    CLEAN("9", "清空数据"),      // 清空数据
    OTHER("99", "其他");        // 其他操作

    // 字典类型常量
    public static final String DICT_TYPE = "sys_oper_type";

    // 工具方法
    public static DictOperType getByValue(String value) { ...}

    public static DictOperType getByLabel(String label) { ...}
}
```

#### 操作类型使用示例

```java
// 用户管理相关
@Log(title = "用户管理", operType = DictOperType.INSERT)
@Log(title = "用户管理", operType = DictOperType.UPDATE)
@Log(title = "用户管理", operType = DictOperType.DELETE)

// 权限管理相关  
@Log(title = "角色管理", operType = DictOperType.GRANT)

// 数据操作相关
@Log(title = "用户数据", operType = DictOperType.EXPORT)
@Log(title = "用户数据", operType = DictOperType.IMPORT)

// 系统管理相关
@Log(title = "在线用户", operType = DictOperType.FORCE)
@Log(title = "代码生成", operType = DictOperType.GENCODE)
@Log(title = "系统数据", operType = DictOperType.CLEAN)
```

### 事件监听器

可以创建事件监听器来处理日志事件：

```java

@Component
public class LogEventListener {

    @EventListener
    @Async
    public void handleOperLogEvent(OperLogEvent event) {
        // 保存到数据库
        operLogService.save(event);
    }

    @EventListener
    @Async
    public void handleLoginLogEvent(LoginLogEvent event) {
        // 保存到数据库
        loginLogService.save(event);
    }
}
```

## 最佳实践

### 1. 注解使用建议

- **标题命名**：使用清晰的模块名称，如"用户管理"、"角色管理"
- **操作类型**：选择合适的操作类型，便于后续统计分析
- **敏感参数**：主动排除密码等敏感参数
- **大数据量**：对于导出等大数据量操作，考虑不保存响应数据

### 2. 性能考虑

- 合理使用`isSaveRequestData`和`isSaveResponseData`
- 对于频繁调用的接口，考虑是否需要记录日志
- 大对象参数建议排除，避免日志表过大

### 3. 安全建议

- 确保敏感信息不被记录
- 定期清理历史日志数据
- 控制日志访问权限

## 常见问题

### Q1: 日志没有记录怎么办？

检查以下几点：

1. 确认方法上有`@Log`注解
2. 确认Spring AOP配置正确
3. 检查事件监听器是否正常工作
4. 查看应用日志是否有异常信息

### Q2: 如何避免记录敏感信息？

使用`excludeParamNames`属性排除敏感字段：

```java
@Log(title = "用户管理",
        excludeParamNames = {"password", "token", "secretKey"})
```

### Q3: 大文件上传时日志过大？

文件上传对象会被自动过滤，不会记录到日志中。如果仍有问题，可以设置`isSaveRequestData = false`。

### Q4: 如何自定义日志存储？

实现事件监听器来处理日志事件：

```java

@EventListener
public void handleOperLogEvent(OperLogEvent event) {
    // 自定义存储逻辑
}
```

## 总结

日志管理模块提供了完整的操作审计功能，通过注解驱动的方式大大简化了日志记录的复杂度。合理使用该模块可以帮助系统实现：

- **操作审计**：完整记录用户操作行为
- **安全监控**：及时发现异常操作
- **问题排查**：通过日志快速定位问题
- **合规要求**：满足审计和合规要求

在实际使用中，建议根据业务需求合理配置日志记录策略，平衡功能完整性和系统性能。
