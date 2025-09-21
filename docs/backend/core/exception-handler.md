# ExceptionHandler 异常处理

RuoYi-Plus 提供的全局异常处理机制，统一处理应用中的各种异常情况。

## 📋 异常体系

### 异常类型

```java
// 基础业务异常
public class ServiceException extends RuntimeException {

    private Integer code;
    private String message;
    private String detailMessage;

    public ServiceException() {}

    public ServiceException(String message) {
        this.message = message;
    }

    public ServiceException(String message, Integer code) {
        this.message = message;
        this.code = code;
    }

    public ServiceException(String message, Throwable cause) {
        super(message, cause);
        this.message = message;
    }

    // getter/setter...
}

// 用户异常
public class UserException extends ServiceException {

    public UserException(String message) {
        super(message);
    }

    public UserException(String message, Integer code) {
        super(message, code);
    }
}

// 认证异常
public class AuthException extends ServiceException {

    public AuthException(String message) {
        super(message);
    }

    public AuthException(String message, Integer code) {
        super(message, code);
    }
}

// 权限异常
public class PermissionException extends ServiceException {

    public PermissionException(String message) {
        super(message);
    }

    public PermissionException(String message, Integer code) {
        super(message, code);
    }
}
```

### 异常码定义

```java
// 异常码常量
public interface ErrorCode {

    // 系统异常 (1000-1999)
    int SYSTEM_ERROR = 1000;
    int SYSTEM_BUSY = 1001;
    int SYSTEM_TIMEOUT = 1002;

    // 参数异常 (2000-2999)
    int PARAM_ERROR = 2000;
    int PARAM_MISSING = 2001;
    int PARAM_INVALID = 2002;

    // 认证异常 (3000-3999)
    int AUTH_FAILED = 3000;
    int TOKEN_INVALID = 3001;
    int TOKEN_EXPIRED = 3002;

    // 权限异常 (4000-4999)
    int PERMISSION_DENIED = 4000;
    int ACCESS_FORBIDDEN = 4001;

    // 业务异常 (5000-9999)
    int USER_NOT_FOUND = 5000;
    int USER_EXISTS = 5001;
    int PASSWORD_ERROR = 5002;
    int ACCOUNT_DISABLED = 5003;
}

// 异常信息枚举
public enum ErrorCodeEnum {

    SUCCESS(200, "操作成功"),
    SYSTEM_ERROR(ErrorCode.SYSTEM_ERROR, "系统异常"),
    PARAM_ERROR(ErrorCode.PARAM_ERROR, "参数错误"),
    AUTH_FAILED(ErrorCode.AUTH_FAILED, "认证失败"),
    PERMISSION_DENIED(ErrorCode.PERMISSION_DENIED, "权限不足"),
    USER_NOT_FOUND(ErrorCode.USER_NOT_FOUND, "用户不存在");

    private final Integer code;
    private final String message;

    ErrorCodeEnum(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    // getter...
}
```

## 🎯 全局异常处理器

### 核心处理器

```java
/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e, HttpServletRequest request) {
        Integer code = e.getCode();
        if (ObjectUtil.isNull(code)) {
            code = HttpStatus.INTERNAL_SERVER_ERROR.value();
        }

        log.error("请求地址'{}',发生业务异常.", request.getRequestURI(), e);
        return R.fail(code, e.getMessage());
    }

    /**
     * 参数验证异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidException(MethodArgumentNotValidException e) {
        log.error("参数验证异常", e);
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return R.fail(ErrorCode.PARAM_ERROR, message);
    }

    /**
     * 参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    public R<Void> handleBindException(BindException e) {
        log.error("参数绑定异常", e);
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return R.fail(ErrorCode.PARAM_ERROR, message);
    }

    /**
     * 参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public R<Void> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        log.error("参数类型不匹配异常", e);
        String message = "参数类型不匹配: " + e.getName();
        return R.fail(ErrorCode.PARAM_ERROR, message);
    }

    /**
     * 请求方式不支持
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<Void> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException e,
                                                        HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        log.error("请求地址'{}',不支持'{}'请求", requestURI, e.getMethod());
        return R.fail(HttpStatus.METHOD_NOT_ALLOWED.value(), e.getMessage());
    }

    /**
     * 权限异常
     */
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e, HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        log.error("请求地址'{}',权限校验失败'{}'", requestURI, e.getMessage());
        return R.fail(ErrorCode.PERMISSION_DENIED, "没有访问权限，请联系管理员授权");
    }

    /**
     * 认证异常
     */
    @ExceptionHandler(NotLoginException.class)
    public R<Void> handleNotLoginException(NotLoginException e, HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        log.error("请求地址'{}',认证失败'{}',无法访问系统资源", requestURI, e.getMessage());
        return R.fail(ErrorCode.AUTH_FAILED, "认证失败，无法访问系统资源");
    }

    /**
     * 数据库异常
     */
    @ExceptionHandler(SQLException.class)
    public R<Void> handleSQLException(SQLException e, HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        log.error("请求地址'{}',发生数据库异常.", requestURI, e);
        return R.fail("数据库操作异常，请联系管理员");
    }

    /**
     * 空指针异常
     */
    @ExceptionHandler(NullPointerException.class)
    public R<Void> handleNullPointerException(NullPointerException e, HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        log.error("请求地址'{}',发生空指针异常.", requestURI, e);
        return R.fail("空指针异常");
    }

    /**
     * 系统异常
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e, HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        log.error("请求地址'{}',发生系统异常.", requestURI, e);
        return R.fail("系统异常，请联系管理员");
    }

    /**
     * 自定义验证异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public R<Void> constraintViolationException(ConstraintViolationException e) {
        log.error("参数验证异常", e);
        String message = e.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining(", "));
        return R.fail(ErrorCode.PARAM_ERROR, message);
    }

    /**
     * 演示模式异常
     */
    @ExceptionHandler(DemoModeException.class)
    public R<Void> handleDemoModeException(DemoModeException e) {
        return R.fail("演示模式，不允许操作");
    }
}
```

### 异步异常处理

```java
/**
 * 异步异常处理器
 */
@Component
@Slf4j
public class AsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

    @Override
    public void handleUncaughtException(Throwable throwable, Method method, Object... objects) {
        log.error("异步任务执行异常 - Method: {}, Exception: {}",
            method.getName(), throwable.getMessage(), throwable);

        // 记录异常信息到数据库
        recordAsyncException(method, throwable, objects);

        // 发送异常通知
        notifyException(method, throwable);
    }

    private void recordAsyncException(Method method, Throwable throwable, Object... params) {
        try {
            AsyncExceptionLog log = new AsyncExceptionLog();
            log.setMethodName(method.getName());
            log.setClassName(method.getDeclaringClass().getName());
            log.setExceptionMessage(throwable.getMessage());
            log.setExceptionType(throwable.getClass().getName());
            log.setParameters(JSON.toJSONString(params));
            log.setStackTrace(ExceptionUtil.stacktraceToString(throwable));
            log.setCreateTime(new Date());

            // 保存到数据库
            SpringUtils.getBean(IAsyncExceptionLogService.class).save(log);
        } catch (Exception e) {
            log.error("记录异步异常失败", e);
        }
    }

    private void notifyException(Method method, Throwable throwable) {
        // 发送邮件通知
        // 发送短信通知
        // 推送到监控系统
    }
}

/**
 * 异步配置
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new AsyncExceptionHandler();
    }
}
```

## 🔧 异常使用

### 业务层异常

```java
@Service
public class UserServiceImpl implements IUserService {

    /**
     * 新增用户
     */
    public Long insertUser(UserBo bo) {
        SysUser user = BeanUtil.toBean(bo, SysUser.class);

        // 验证用户名唯一性
        if (!checkUserNameUnique(user)) {
            throw new ServiceException("用户名已存在");
        }

        // 验证邮箱唯一性
        if (StringUtils.isNotEmpty(user.getEmail()) && !checkEmailUnique(user)) {
            throw new ServiceException("邮箱地址已存在");
        }

        // 验证手机号唯一性
        if (StringUtils.isNotEmpty(user.getPhonenumber()) && !checkPhoneUnique(user)) {
            throw new ServiceException("手机号码已存在");
        }

        try {
            return baseMapper.insertUser(user);
        } catch (Exception e) {
            log.error("新增用户失败", e);
            throw new ServiceException("新增用户失败", e);
        }
    }

    /**
     * 修改用户
     */
    public Boolean updateUser(UserBo bo) {
        SysUser user = BeanUtil.toBean(bo, SysUser.class);

        // 验证用户是否存在
        SysUser existUser = baseMapper.selectById(user.getUserId());
        if (ObjectUtil.isNull(existUser)) {
            throw new UserException("用户不存在", ErrorCode.USER_NOT_FOUND);
        }

        // 验证用户状态
        if (!"0".equals(existUser.getStatus())) {
            throw new UserException("账户已被禁用", ErrorCode.ACCOUNT_DISABLED);
        }

        // 系统管理员不能被修改
        if (existUser.isAdmin()) {
            throw new PermissionException("不允许修改系统管理员", ErrorCode.PERMISSION_DENIED);
        }

        return baseMapper.updateById(user) > 0;
    }

    /**
     * 删除用户
     */
    public Boolean deleteUser(Long userId) {
        // 验证用户是否存在
        SysUser user = baseMapper.selectById(userId);
        if (ObjectUtil.isNull(user)) {
            throw new UserException("用户不存在", ErrorCode.USER_NOT_FOUND);
        }

        // 系统管理员不能被删除
        if (user.isAdmin()) {
            throw new PermissionException("不允许删除系统管理员", ErrorCode.PERMISSION_DENIED);
        }

        // 检查用户是否有关联数据
        if (hasRelatedData(userId)) {
            throw new ServiceException("用户存在关联数据，不能删除");
        }

        return baseMapper.deleteById(userId) > 0;
    }

    /**
     * 重置密码
     */
    public Boolean resetPassword(String userName, String password) {
        SysUser user = baseMapper.selectUserByUserName(userName);
        if (ObjectUtil.isNull(user)) {
            throw new UserException("用户不存在", ErrorCode.USER_NOT_FOUND);
        }

        if (!"0".equals(user.getStatus())) {
            throw new UserException("账户已被禁用，无法重置密码", ErrorCode.ACCOUNT_DISABLED);
        }

        // 验证密码复杂度
        if (!PasswordUtils.isValidPassword(password)) {
            throw new ServiceException("密码不符合复杂度要求");
        }

        user.setPassword(SecurityUtils.encryptPassword(password));
        user.setUpdateTime(new Date());

        return baseMapper.updateById(user) > 0;
    }

    private boolean hasRelatedData(Long userId) {
        // 检查是否有关联的数据
        return false;
    }
}
```

### Controller层异常

```java
@RestController
@RequestMapping("/system/user")
@Validated
public class SysUserController extends BaseController {

    @Resource
    private IUserService userService;

    /**
     * 获取用户详细信息
     */
    @SaCheckPermission("system:user:query")
    @GetMapping("/{userId}")
    public R<UserVo> getInfo(@PathVariable("userId") @NotNull(message = "用户ID不能为空") Long userId) {
        try {
            UserVo user = userService.selectUserById(userId);
            return R.ok(user);
        } catch (UserException e) {
            return R.fail(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("获取用户信息失败", e);
            return R.fail("获取用户信息失败");
        }
    }

    /**
     * 新增用户
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", operType = DictOperType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody UserBo user) {
        if (!userService.checkUserNameUnique(user)) {
            return R.fail("新增用户'" + user.getUserName() + "'失败，登录账号已存在");
        }
        if (StringUtils.isNotEmpty(user.getPhonenumber()) && !userService.checkPhoneUnique(user)) {
            return R.fail("新增用户'" + user.getUserName() + "'失败，手机号码已存在");
        }
        if (StringUtils.isNotEmpty(user.getEmail()) && !userService.checkEmailUnique(user)) {
            return R.fail("新增用户'" + user.getUserName() + "'失败，邮箱账号已存在");
        }

        user.setCreateBy(getUsername());
        user.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
        return toAjax(userService.insertUser(user));
    }

    /**
     * 批量删除用户
     */
    @SaCheckPermission("system:user:remove")
    @Log(title = "用户管理", operType = DictOperType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        if (ArrayUtil.contains(userIds, getUserId())) {
            return R.fail("当前用户不能删除");
        }
        return toAjax(userService.deleteUserByIds(userIds));
    }
}
```

## 🚨 异常监控

### 异常统计

```java
/**
 * 异常统计服务
 */
@Service
@Slf4j
public class ExceptionStatisticsService {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    private static final String EXCEPTION_COUNT_KEY = "exception:count:";
    private static final String EXCEPTION_DETAIL_KEY = "exception:detail:";

    /**
     * 记录异常
     */
    public void recordException(String requestUri, Exception exception) {
        String today = DateUtil.today();
        String exceptionType = exception.getClass().getSimpleName();

        // 统计今日异常总数
        String totalKey = EXCEPTION_COUNT_KEY + "total:" + today;
        redisTemplate.opsForValue().increment(totalKey);
        redisTemplate.expire(totalKey, Duration.ofDays(7));

        // 统计今日各类型异常数量
        String typeKey = EXCEPTION_COUNT_KEY + "type:" + exceptionType + ":" + today;
        redisTemplate.opsForValue().increment(typeKey);
        redisTemplate.expire(typeKey, Duration.ofDays(7));

        // 统计今日各接口异常数量
        String uriKey = EXCEPTION_COUNT_KEY + "uri:" + requestUri + ":" + today;
        redisTemplate.opsForValue().increment(uriKey);
        redisTemplate.expire(uriKey, Duration.ofDays(7));

        // 记录异常详情
        recordExceptionDetail(requestUri, exception);
    }

    private void recordExceptionDetail(String requestUri, Exception exception) {
        try {
            ExceptionDetail detail = new ExceptionDetail();
            detail.setRequestUri(requestUri);
            detail.setExceptionType(exception.getClass().getName());
            detail.setExceptionMessage(exception.getMessage());
            detail.setStackTrace(ExceptionUtil.stacktraceToString(exception));
            detail.setOccurTime(new Date());

            String detailKey = EXCEPTION_DETAIL_KEY + System.currentTimeMillis();
            redisTemplate.opsForValue().set(detailKey, detail, Duration.ofDays(1));
        } catch (Exception e) {
            log.error("记录异常详情失败", e);
        }
    }

    /**
     * 获取异常统计
     */
    public ExceptionStatistics getStatistics(String date) {
        ExceptionStatistics statistics = new ExceptionStatistics();

        // 获取总异常数
        String totalKey = EXCEPTION_COUNT_KEY + "total:" + date;
        Object totalCount = redisTemplate.opsForValue().get(totalKey);
        statistics.setTotalCount(totalCount != null ? (Integer) totalCount : 0);

        // 获取各类型异常统计
        Set<String> typeKeys = redisTemplate.keys(EXCEPTION_COUNT_KEY + "type:*:" + date);
        Map<String, Integer> typeStatistics = new HashMap<>();
        if (CollUtil.isNotEmpty(typeKeys)) {
            for (String key : typeKeys) {
                String type = key.split(":")[2];
                Object count = redisTemplate.opsForValue().get(key);
                typeStatistics.put(type, count != null ? (Integer) count : 0);
            }
        }
        statistics.setTypeStatistics(typeStatistics);

        return statistics;
    }
}

/**
 * 异常详情
 */
@Data
public class ExceptionDetail {
    private String requestUri;
    private String exceptionType;
    private String exceptionMessage;
    private String stackTrace;
    private Date occurTime;
}

/**
 * 异常统计
 */
@Data
public class ExceptionStatistics {
    private Integer totalCount;
    private Map<String, Integer> typeStatistics;
    private Map<String, Integer> uriStatistics;
}
```

### 异常告警

```java
/**
 * 异常告警服务
 */
@Service
@Slf4j
public class ExceptionAlertService {

    @Resource
    private IMailService mailService;

    @Resource
    private ISmsService smsService;

    @Value("${alert.exception.threshold:10}")
    private Integer exceptionThreshold;

    @Value("${alert.exception.email}")
    private String alertEmail;

    @Value("${alert.exception.phone}")
    private String alertPhone;

    /**
     * 检查是否需要告警
     */
    @Scheduled(fixedRate = 300000) // 每5分钟检查一次
    public void checkExceptionAlert() {
        String today = DateUtil.today();
        String currentHour = DateUtil.format(new Date(), "yyyy-MM-dd:HH");

        // 检查最近一小时的异常数量
        String hourKey = EXCEPTION_COUNT_KEY + "hour:" + currentHour;
        Object hourCount = redisTemplate.opsForValue().get(hourKey);
        Integer count = hourCount != null ? (Integer) hourCount : 0;

        if (count >= exceptionThreshold) {
            sendAlert(count, currentHour);
        }
    }

    private void sendAlert(Integer count, String timeRange) {
        String subject = "系统异常告警";
        String content = String.format("时间范围: %s\n异常数量: %d\n已超过告警阈值: %d",
            timeRange, count, exceptionThreshold);

        // 发送邮件告警
        if (StringUtils.isNotBlank(alertEmail)) {
            try {
                mailService.sendSimpleMail(alertEmail, subject, content);
            } catch (Exception e) {
                log.error("发送异常告警邮件失败", e);
            }
        }

        // 发送短信告警
        if (StringUtils.isNotBlank(alertPhone)) {
            try {
                smsService.sendAlert(alertPhone, content);
            } catch (Exception e) {
                log.error("发送异常告警短信失败", e);
            }
        }
    }
}
```

ExceptionHandler 为 RuoYi-Plus 提供了完整的异常处理机制，通过统一的异常处理、详细的异常记录和实时的异常监控，确保系统的稳定性和可维护性。