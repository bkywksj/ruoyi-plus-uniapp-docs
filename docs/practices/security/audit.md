# 安全审计与日志

## 概述

本文档定义了 RuoYi-Plus 系统的安全审计与日志策略，包括操作日志、登录日志、敏感数据过滤和日志存储机制。

**技术栈：**

| 组件 | 说明 |
|-----|------|
| Spring AOP | 切面日志记录 |
| Spring Event | 异步事件发布 |
| MyBatis-Plus | 日志持久化 |
| Sa-Token | 用户身份获取 |

---

## 操作日志

### 1. @Log 注解

通过 `@Log` 注解标记需要记录日志的接口：

```java
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@PostMapping
public R<Void> add(@RequestBody SysUserBo user) {
    return toAjax(userService.insertUser(user));
}
```

**注解属性：**

| 属性 | 类型 | 说明 |
|-----|------|------|
| title | String | 模块标题 |
| businessType | BusinessType | 操作类型 |
| operatorType | OperatorType | 操作人类别 |
| isSaveRequestData | boolean | 是否保存请求参数 |
| isSaveResponseData | boolean | 是否保存响应数据 |
| excludeParamNames | String[] | 排除的参数名 |

### 2. 业务类型枚举

```java
public enum BusinessType {
    OTHER,      // 其他
    INSERT,     // 新增
    UPDATE,     // 修改
    DELETE,     // 删除
    GRANT,      // 授权
    EXPORT,     // 导出
    IMPORT,     // 导入
    FORCE,      // 强退
    CLEAN       // 清空
}
```

### 3. 切面实现

`LogAspect` 通过 AOP 拦截带有 `@Log` 注解的方法：

```java
@Aspect
@Component
public class LogAspect {

    // 敏感字段过滤列表
    public static final String[] EXCLUDE_PROPERTIES = {
        "password", "oldPassword", "newPassword", "confirmPassword"
    };

    @AfterReturning(pointcut = "@annotation(controllerLog)", returning = "result")
    public void doAfterReturning(JoinPoint joinPoint, Log controllerLog, Object result) {
        handleLog(joinPoint, controllerLog, null, result);
    }

    @AfterThrowing(pointcut = "@annotation(controllerLog)", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, Log controllerLog, Exception e) {
        handleLog(joinPoint, controllerLog, e, null);
    }
}
```

### 4. 日志实体

```java
public class SysOperLog {
    private Long operId;           // 日志ID
    private String tenantId;       // 租户ID
    private String title;          // 模块标题
    private String businessType;   // 业务类型
    private String method;         // 方法名称
    private String requestMethod;  // 请求方式
    private String operatorType;   // 操作类别
    private String operName;       // 操作人员
    private String deptName;       // 部门名称
    private String operUrl;        // 请求URL
    private String operIp;         // 主机地址
    private String operParam;      // 请求参数
    private String jsonResult;     // 返回参数
    private String status;         // 操作状态
    private String errorMsg;       // 错误消息
    private Date operTime;         // 操作时间
    private Long costTime;         // 消耗时间(ms)
}
```

---

## 登录日志

### 1. 登录日志记录

登录相关操作通过 `LoginLogPublisher` 发布事件：

```java
@Component
public class LoginLogPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public void publishLoginLog(String userName, String status,
                               String message, String tenantId,
                               Long userId, String deviceType) {
        LoginLogEvent event = new LoginLogEvent();
        event.setUserName(userName);
        event.setStatus(status);
        event.setMessage(message);
        event.setTenantId(tenantId);
        event.setUserId(userId);
        event.setDeviceType(deviceType);

        // 异步发布事件
        eventPublisher.publishEvent(event);
    }
}
```

### 2. 登录日志实体

```java
public class SysLoginLog {
    private Long infoId;          // 日志ID
    private String tenantId;      // 租户ID
    private Long userId;          // 用户ID
    private String userName;      // 用户账号
    private String status;        // 登录状态
    private String ipaddr;        // 登录IP
    private String loginLocation; // 登录地点
    private String browser;       // 浏览器类型
    private String os;            // 操作系统
    private String deviceType;    // 设备类型
    private String msg;           // 提示消息
    private Date loginTime;       // 登录时间
}
```

### 3. 登录状态记录

```java
// 登录成功
loginLogPublisher.publishLoginLog(userName, DictOperResult.SUCCESS.getValue(),
    MessageUtils.message(I18nKeys.User.LOGIN_SUCCESS), tenantId, userId, deviceType);

// 登录失败
loginLogPublisher.publishLoginLog(userName, DictOperResult.FAIL.getValue(),
    MessageUtils.message(authType.getRetryLimitCount(), errorNumber),
    tenantId, userId, deviceType);

// 退出登录
loginLogPublisher.publishLoginLog(loginUser.getUserName(), DictOperResult.SUCCESS.getValue(),
    MessageUtils.message(I18nKeys.User.LOGOUT_SUCCESS), tenantId, userId, deviceType);
```

---

## 敏感字段过滤

### 1. 请求参数过滤

```java
// LogAspect 中的敏感字段列表
public static final String[] EXCLUDE_PROPERTIES = {
    "password",
    "oldPassword",
    "newPassword",
    "confirmPassword"
};
```

### 2. 参数脱敏处理

```java
private String argsArrayToString(Object[] paramsArray, String[] excludeNames) {
    StringBuilder params = new StringBuilder();
    if (paramsArray != null) {
        for (Object o : paramsArray) {
            if (ObjectUtil.isNotNull(o) && !isFilterObject(o)) {
                try {
                    // 过滤敏感字段
                    String jsonObj = JsonUtils.toJsonString(o, excludeNames);
                    params.append(jsonObj).append(" ");
                } catch (Exception e) {
                    // 忽略序列化异常
                }
            }
        }
    }
    return params.toString().trim();
}
```

### 3. 响应数据脱敏

```java
// 控制响应数据保存
@Log(title = "用户管理", businessType = BusinessType.INSERT,
     isSaveResponseData = false)  // 不保存响应数据
public R<Void> add(@RequestBody SysUserBo user) {
    // ...
}
```

---

## 异步事件机制

### 1. 事件定义

```java
// 操作日志事件
public class OperLogEvent {
    private SysOperLog operLog;
}

// 登录日志事件
public class LoginLogEvent {
    private String tenantId;
    private Long userId;
    private String userName;
    private String status;
    private String message;
    private String deviceType;
}
```

### 2. 事件监听

```java
@Component
@RequiredArgsConstructor
public class OperLogEventListener {

    private final ISysOperLogService operLogService;

    @Async
    @EventListener
    public void handleOperLogEvent(OperLogEvent event) {
        operLogService.insertOperlog(event.getOperLog());
    }
}

@Component
@RequiredArgsConstructor
public class LoginLogEventListener {

    private final ISysLoginLogService loginLogService;

    @Async
    @EventListener
    public void handleLoginLogEvent(LoginLogEvent event) {
        SysLoginLog loginLog = buildLoginLog(event);
        loginLogService.insertLoginLog(loginLog);
    }
}
```

### 3. 异步配置

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-log-");
        executor.initialize();
        return executor;
    }
}
```

---

## 日志存储

### 1. 数据库表结构

```sql
-- 操作日志表
CREATE TABLE sys_oper_log (
    oper_id       BIGINT(20)    NOT NULL COMMENT '日志ID',
    tenant_id     VARCHAR(20)   DEFAULT '000000' COMMENT '租户ID',
    title         VARCHAR(50)   DEFAULT '' COMMENT '模块标题',
    business_type CHAR(3)       DEFAULT '' COMMENT '业务类型',
    method        VARCHAR(200)  DEFAULT '' COMMENT '方法名称',
    request_method VARCHAR(10)  DEFAULT '' COMMENT '请求方式',
    oper_name     VARCHAR(50)   DEFAULT '' COMMENT '操作人员',
    dept_name     VARCHAR(50)   DEFAULT '' COMMENT '部门名称',
    oper_url      VARCHAR(255)  DEFAULT '' COMMENT '请求URL',
    oper_ip       VARCHAR(128)  DEFAULT '' COMMENT '主机地址',
    oper_param    TEXT          COMMENT '请求参数',
    json_result   TEXT          COMMENT '返回参数',
    status        CHAR(1)       DEFAULT '1' COMMENT '操作状态',
    error_msg     TEXT          COMMENT '错误消息',
    oper_time     DATETIME      COMMENT '操作时间',
    cost_time     BIGINT(20)    DEFAULT 0 COMMENT '消耗时间',
    PRIMARY KEY (oper_id),
    KEY idx_oper_time (oper_time)
) COMMENT='操作日志表';

-- 登录日志表
CREATE TABLE sys_login_log (
    info_id        BIGINT(20)   NOT NULL COMMENT '日志ID',
    tenant_id      VARCHAR(20)  DEFAULT '000000' COMMENT '租户ID',
    user_id        BIGINT(20)   DEFAULT NULL COMMENT '用户ID',
    user_name      VARCHAR(50)  DEFAULT '' COMMENT '用户账号',
    ipaddr         VARCHAR(128) DEFAULT '' COMMENT '登录IP',
    login_location VARCHAR(255) DEFAULT '' COMMENT '登录地点',
    browser        VARCHAR(50)  DEFAULT '' COMMENT '浏览器',
    os             VARCHAR(50)  DEFAULT '' COMMENT '操作系统',
    device_type    VARCHAR(50)  DEFAULT '' COMMENT '设备类型',
    status         CHAR(1)      DEFAULT '1' COMMENT '登录状态',
    msg            VARCHAR(255) DEFAULT '' COMMENT '提示消息',
    login_time     DATETIME     COMMENT '登录时间',
    PRIMARY KEY (info_id),
    KEY idx_login_time (login_time)
) COMMENT='登录日志表';
```

### 2. 索引设计

```sql
-- 操作日志索引
CREATE INDEX idx_tenant_id ON sys_oper_log(tenant_id);
CREATE INDEX idx_oper_time ON sys_oper_log(oper_time);
CREATE INDEX idx_business_type ON sys_oper_log(business_type);
CREATE INDEX idx_status ON sys_oper_log(status);

-- 登录日志索引
CREATE INDEX idx_tenant_id ON sys_login_log(tenant_id);
CREATE INDEX idx_user_id ON sys_login_log(user_id);
CREATE INDEX idx_login_time ON sys_login_log(login_time);
```

---

## 配置参考

### 1. 日志保留策略

```yaml
# 日志清理配置
system:
  log:
    # 操作日志保留天数
    oper-log-retention-days: 90
    # 登录日志保留天数
    login-log-retention-days: 180
```

### 2. 定时清理任务

```java
@Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
public void cleanExpiredLogs() {
    // 清理过期操作日志
    operLogService.cleanOperLog(operLogRetentionDays);
    // 清理过期登录日志
    loginLogService.cleanLoginLog(loginLogRetentionDays);
}
```

---

## 安全检查清单

### 日志记录 ✅

- [ ] 所有增删改操作添加 @Log 注解
- [ ] 登录/登出操作记录日志
- [ ] 敏感操作(授权/导出)记录日志
- [ ] 异常操作记录错误信息

### 敏感数据 ✅

- [ ] 密码字段已过滤
- [ ] 敏感参数不记录
- [ ] 响应数据按需保存
- [ ] 日志不包含Token

### 存储安全 ✅

- [ ] 日志表有访问权限控制
- [ ] 定期清理过期日志
- [ ] 重要日志定期备份
- [ ] 日志表有租户隔离

---

## 常见问题

### 1. 日志记录不完整？

**解决方案：**
- 检查 @Log 注解是否正确配置
- 确认 `isSaveRequestData` 和 `isSaveResponseData` 设置
- 检查异步线程池是否正常运行

### 2. 日志表数据量过大？

**解决方案：**
- 配置定时清理任务
- 考虑日志分表或归档
- 大文本字段按需存储

### 3. 敏感信息泄露？

**解决方案：**
```java
// 添加到 EXCLUDE_PROPERTIES
public static final String[] EXCLUDE_PROPERTIES = {
    "password", "oldPassword", "newPassword",
    "confirmPassword", "token", "secret"
};
```

---

## 总结

安全审计日志的核心要点：

1. **操作追溯** - @Log 注解 + AOP 自动记录
2. **登录监控** - 事件发布 + 异步处理
3. **敏感过滤** - 密码等敏感字段自动排除
4. **异步解耦** - Spring Event 异步写入
5. **多租户隔离** - 日志按租户ID隔离

通过完善的审计日志体系，可实现操作可追溯、问题可定位、安全可监控。
