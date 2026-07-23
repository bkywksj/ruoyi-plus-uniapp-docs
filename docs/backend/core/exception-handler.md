# ExceptionHandler 异常处理

RuoYi-Plus 提供的全局异常处理机制，统一处理应用中的各种异常情况。

## 异常体系

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

## 全局异常处理器

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

## 异常使用

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

## 异常监控

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

## 异常国际化

### 异常消息国际化配置

```java
/**
 * 异常消息国际化服务
 */
@Service
@RequiredArgsConstructor
public class ExceptionMessageService {

    private final MessageSource messageSource;

    /**
     * 获取国际化异常消息
     */
    public String getMessage(String code) {
        return getMessage(code, null);
    }

    /**
     * 获取带参数的国际化异常消息
     */
    public String getMessage(String code, Object[] args) {
        try {
            Locale locale = LocaleContextHolder.getLocale();
            return messageSource.getMessage(code, args, locale);
        } catch (NoSuchMessageException e) {
            return code;
        }
    }

    /**
     * 获取指定语言的异常消息
     */
    public String getMessage(String code, Object[] args, Locale locale) {
        try {
            return messageSource.getMessage(code, args, locale);
        } catch (NoSuchMessageException e) {
            return code;
        }
    }
}

/**
 * 国际化异常消息配置
 */
@Configuration
public class MessageSourceConfig {

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource =
            new ReloadableResourceBundleMessageSource();
        messageSource.setBasenames(
            "classpath:i18n/messages",
            "classpath:i18n/exceptions"
        );
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600);
        messageSource.setFallbackToSystemLocale(true);
        return messageSource;
    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
        resolver.setSupportedLocales(Arrays.asList(
            Locale.SIMPLIFIED_CHINESE,
            Locale.US,
            Locale.JAPAN
        ));
        return resolver;
    }
}
```

### 国际化消息文件

```properties
# exceptions_zh_CN.properties
error.user.not.found=用户不存在
error.user.disabled=用户账号已被禁用
error.user.password.error=密码错误，还有{0}次尝试机会
error.auth.failed=认证失败，请重新登录
error.permission.denied=您没有权限执行此操作
error.param.missing=参数{0}不能为空
error.param.invalid=参数{0}格式不正确
error.system.busy=系统繁忙，请稍后重试
error.rate.limit.exceeded=请求过于频繁，请{0}秒后重试

# exceptions_en_US.properties
error.user.not.found=User not found
error.user.disabled=User account has been disabled
error.user.password.error=Wrong password, {0} attempts remaining
error.auth.failed=Authentication failed, please login again
error.permission.denied=You do not have permission to perform this action
error.param.missing=Parameter {0} is required
error.param.invalid=Parameter {0} format is invalid
error.system.busy=System is busy, please try again later
error.rate.limit.exceeded=Too many requests, please retry in {0} seconds
```

### 支持国际化的异常类

```java
/**
 * 支持国际化的业务异常
 */
public class I18nServiceException extends ServiceException {

    private String messageKey;
    private Object[] args;

    public I18nServiceException(String messageKey) {
        super(messageKey);
        this.messageKey = messageKey;
    }

    public I18nServiceException(String messageKey, Object... args) {
        super(messageKey);
        this.messageKey = messageKey;
        this.args = args;
    }

    public I18nServiceException(String messageKey, Integer code) {
        super(messageKey, code);
        this.messageKey = messageKey;
    }

    public I18nServiceException(String messageKey, Integer code, Object... args) {
        super(messageKey, code);
        this.messageKey = messageKey;
        this.args = args;
    }

    public String getMessageKey() {
        return messageKey;
    }

    public Object[] getArgs() {
        return args;
    }
}

/**
 * 国际化异常处理器
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class I18nExceptionHandler {

    private final ExceptionMessageService messageService;

    @ExceptionHandler(I18nServiceException.class)
    public R<Void> handleI18nException(I18nServiceException e, HttpServletRequest request) {
        String message = messageService.getMessage(e.getMessageKey(), e.getArgs());
        Integer code = e.getCode() != null ? e.getCode() : HttpStatus.INTERNAL_SERVER_ERROR.value();

        log.error("请求地址'{}',发生业务异常: {}", request.getRequestURI(), message, e);
        return R.fail(code, message);
    }
}
```

## 异常链处理

### 异常链追踪

```java
/**
 * 异常链追踪工具
 */
public class ExceptionChainTracer {

    /**
     * 获取异常链中的根因异常
     */
    public static Throwable getRootCause(Throwable throwable) {
        Throwable cause = throwable.getCause();
        if (cause == null) {
            return throwable;
        }

        // 防止循环引用导致的死循环
        Set<Throwable> visited = new HashSet<>();
        while (cause != null && !visited.contains(cause)) {
            visited.add(cause);
            Throwable nextCause = cause.getCause();
            if (nextCause == null) {
                return cause;
            }
            cause = nextCause;
        }

        return throwable;
    }

    /**
     * 获取完整的异常链
     */
    public static List<Throwable> getExceptionChain(Throwable throwable) {
        List<Throwable> chain = new ArrayList<>();
        Set<Throwable> visited = new HashSet<>();

        Throwable current = throwable;
        while (current != null && !visited.contains(current)) {
            chain.add(current);
            visited.add(current);
            current = current.getCause();
        }

        return chain;
    }

    /**
     * 格式化异常链
     */
    public static String formatExceptionChain(Throwable throwable) {
        List<Throwable> chain = getExceptionChain(throwable);
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < chain.size(); i++) {
            Throwable t = chain.get(i);
            if (i > 0) {
                sb.append("\n  Caused by: ");
            }
            sb.append(t.getClass().getName())
              .append(": ")
              .append(t.getMessage());
        }

        return sb.toString();
    }

    /**
     * 检查异常链中是否包含指定类型的异常
     */
    public static <T extends Throwable> boolean containsException(
            Throwable throwable, Class<T> exceptionType) {
        return findException(throwable, exceptionType) != null;
    }

    /**
     * 在异常链中查找指定类型的异常
     */
    @SuppressWarnings("unchecked")
    public static <T extends Throwable> T findException(
            Throwable throwable, Class<T> exceptionType) {
        List<Throwable> chain = getExceptionChain(throwable);
        for (Throwable t : chain) {
            if (exceptionType.isInstance(t)) {
                return (T) t;
            }
        }
        return null;
    }
}

/**
 * 增强的异常处理器（支持异常链分析）
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class EnhancedExceptionHandler {

    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e, HttpServletRequest request) {
        String requestURI = request.getRequestURI();

        // 分析异常链
        Throwable rootCause = ExceptionChainTracer.getRootCause(e);
        String chainInfo = ExceptionChainTracer.formatExceptionChain(e);

        log.error("请求地址'{}',发生异常.\n异常链: {}", requestURI, chainInfo, e);

        // 根据根因异常类型返回不同的错误信息
        if (rootCause instanceof SQLException) {
            return R.fail("数据库操作异常");
        } else if (rootCause instanceof IOException) {
            return R.fail("IO操作异常");
        } else if (rootCause instanceof TimeoutException) {
            return R.fail("操作超时，请稍后重试");
        }

        return R.fail("系统异常，请联系管理员");
    }
}
```

### 异常包装与转换

```java
/**
 * 异常包装器
 */
public class ExceptionWrapper {

    /**
     * 包装为业务异常
     */
    public static ServiceException wrapAsServiceException(Throwable throwable) {
        if (throwable instanceof ServiceException) {
            return (ServiceException) throwable;
        }

        // 根据原始异常类型决定错误码和消息
        if (throwable instanceof IllegalArgumentException) {
            return new ServiceException("参数错误: " + throwable.getMessage(),
                ErrorCode.PARAM_ERROR);
        }

        if (throwable instanceof AccessDeniedException) {
            return new PermissionException("权限不足: " + throwable.getMessage(),
                ErrorCode.PERMISSION_DENIED);
        }

        if (throwable instanceof DataAccessException) {
            return new ServiceException("数据访问异常",
                ErrorCode.SYSTEM_ERROR);
        }

        return new ServiceException("系统异常: " + throwable.getMessage(),
            ErrorCode.SYSTEM_ERROR);
    }

    /**
     * 安全地执行操作，将异常转换为业务异常
     */
    public static <T> T executeWithWrapping(Supplier<T> supplier) {
        try {
            return supplier.get();
        } catch (Exception e) {
            throw wrapAsServiceException(e);
        }
    }

    /**
     * 安全地执行操作（无返回值）
     */
    public static void executeWithWrapping(Runnable action) {
        try {
            action.run();
        } catch (Exception e) {
            throw wrapAsServiceException(e);
        }
    }
}

/**
 * 异常转换器接口
 */
public interface ExceptionTransformer {

    /**
     * 是否支持该异常类型
     */
    boolean supports(Throwable throwable);

    /**
     * 转换异常
     */
    ServiceException transform(Throwable throwable);
}

/**
 * SQL异常转换器
 */
@Component
public class SqlExceptionTransformer implements ExceptionTransformer {

    @Override
    public boolean supports(Throwable throwable) {
        return throwable instanceof SQLException ||
               ExceptionChainTracer.containsException(throwable, SQLException.class);
    }

    @Override
    public ServiceException transform(Throwable throwable) {
        SQLException sqlException = ExceptionChainTracer.findException(
            throwable, SQLException.class);

        if (sqlException != null) {
            String sqlState = sqlException.getSQLState();
            int errorCode = sqlException.getErrorCode();

            // 根据SQL状态码返回友好消息
            if (sqlState != null && sqlState.startsWith("23")) {
                return new ServiceException("数据违反约束条件", ErrorCode.PARAM_ERROR);
            }
            if (errorCode == 1062) { // MySQL重复键错误
                return new ServiceException("数据已存在，请勿重复提交", ErrorCode.PARAM_ERROR);
            }
        }

        return new ServiceException("数据库操作异常", ErrorCode.SYSTEM_ERROR);
    }
}

/**
 * 异常转换器链
 */
@Component
@RequiredArgsConstructor
public class ExceptionTransformerChain {

    private final List<ExceptionTransformer> transformers;

    /**
     * 转换异常
     */
    public ServiceException transform(Throwable throwable) {
        for (ExceptionTransformer transformer : transformers) {
            if (transformer.supports(throwable)) {
                return transformer.transform(throwable);
            }
        }
        return ExceptionWrapper.wrapAsServiceException(throwable);
    }
}
```

## 异常分级处理

### 异常级别定义

```java
/**
 * 异常级别枚举
 */
public enum ExceptionLevel {

    /**
     * 严重：系统无法正常运行
     */
    CRITICAL(1, "严重"),

    /**
     * 错误：功能无法正常使用
     */
    ERROR(2, "错误"),

    /**
     * 警告：可能影响用户体验
     */
    WARNING(3, "警告"),

    /**
     * 信息：一般业务异常
     */
    INFO(4, "信息");

    private final int level;
    private final String description;

    ExceptionLevel(int level, String description) {
        this.level = level;
        this.description = description;
    }

    public int getLevel() {
        return level;
    }

    public String getDescription() {
        return description;
    }
}

/**
 * 可分级的异常接口
 */
public interface LeveledException {

    /**
     * 获取异常级别
     */
    ExceptionLevel getLevel();

    /**
     * 是否需要告警
     */
    default boolean needsAlert() {
        return getLevel().getLevel() <= ExceptionLevel.ERROR.getLevel();
    }

    /**
     * 是否需要记录到数据库
     */
    default boolean needsPersistence() {
        return getLevel().getLevel() <= ExceptionLevel.WARNING.getLevel();
    }
}

/**
 * 分级业务异常
 */
public class LeveledServiceException extends ServiceException implements LeveledException {

    private final ExceptionLevel level;

    public LeveledServiceException(String message, ExceptionLevel level) {
        super(message);
        this.level = level;
    }

    public LeveledServiceException(String message, Integer code, ExceptionLevel level) {
        super(message, code);
        this.level = level;
    }

    @Override
    public ExceptionLevel getLevel() {
        return level;
    }

    public static LeveledServiceException critical(String message) {
        return new LeveledServiceException(message, ExceptionLevel.CRITICAL);
    }

    public static LeveledServiceException error(String message) {
        return new LeveledServiceException(message, ExceptionLevel.ERROR);
    }

    public static LeveledServiceException warning(String message) {
        return new LeveledServiceException(message, ExceptionLevel.WARNING);
    }

    public static LeveledServiceException info(String message) {
        return new LeveledServiceException(message, ExceptionLevel.INFO);
    }
}
```

### 分级异常处理器

```java
/**
 * 分级异常处理器
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class LeveledExceptionHandler {

    private final ExceptionAlertService alertService;
    private final ExceptionPersistenceService persistenceService;
    private final MeterRegistry meterRegistry;

    @ExceptionHandler(LeveledServiceException.class)
    public R<Void> handleLeveledException(LeveledServiceException e, HttpServletRequest request) {
        ExceptionLevel level = e.getLevel();
        String requestUri = request.getRequestURI();

        // 根据级别记录不同级别的日志
        switch (level) {
            case CRITICAL:
                log.error("[CRITICAL] 请求'{}',发生严重异常: {}", requestUri, e.getMessage(), e);
                break;
            case ERROR:
                log.error("[ERROR] 请求'{}',发生错误: {}", requestUri, e.getMessage(), e);
                break;
            case WARNING:
                log.warn("[WARNING] 请求'{}',发生警告: {}", requestUri, e.getMessage());
                break;
            case INFO:
            default:
                log.info("[INFO] 请求'{}',发生业务异常: {}", requestUri, e.getMessage());
                break;
        }

        // 记录指标
        meterRegistry.counter("exception.count",
            "level", level.name(),
            "uri", requestUri
        ).increment();

        // 判断是否需要告警
        if (e.needsAlert()) {
            alertService.sendAlert(e, request);
        }

        // 判断是否需要持久化
        if (e.needsPersistence()) {
            persistenceService.save(e, request);
        }

        Integer code = e.getCode() != null ? e.getCode() : HttpStatus.INTERNAL_SERVER_ERROR.value();
        return R.fail(code, e.getMessage());
    }
}

/**
 * 异常持久化服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExceptionPersistenceService {

    private final ExceptionLogMapper exceptionLogMapper;

    /**
     * 保存异常记录
     */
    @Async
    public void save(LeveledServiceException e, HttpServletRequest request) {
        try {
            ExceptionLog logEntity = new ExceptionLog();
            logEntity.setLevel(e.getLevel().name());
            logEntity.setMessage(e.getMessage());
            logEntity.setCode(e.getCode());
            logEntity.setRequestUri(request.getRequestURI());
            logEntity.setRequestMethod(request.getMethod());
            logEntity.setStackTrace(ExceptionUtil.stacktraceToString(e));
            logEntity.setUserAgent(request.getHeader("User-Agent"));
            logEntity.setIpAddress(ServletUtils.getClientIP(request));
            logEntity.setUserId(SecurityUtils.getUserIdOrNull());
            logEntity.setCreateTime(LocalDateTime.now());

            exceptionLogMapper.insert(logEntity);
        } catch (Exception ex) {
            log.error("保存异常日志失败", ex);
        }
    }
}
```

## 限流异常处理

### 限流异常定义

```java
/**
 * 限流异常
 */
public class RateLimitException extends ServiceException {

    private String limitKey;
    private long waitTime;

    public RateLimitException(String message) {
        super(message, ErrorCode.RATE_LIMIT_EXCEEDED);
    }

    public RateLimitException(String message, String limitKey, long waitTime) {
        super(message, ErrorCode.RATE_LIMIT_EXCEEDED);
        this.limitKey = limitKey;
        this.waitTime = waitTime;
    }

    public String getLimitKey() {
        return limitKey;
    }

    public long getWaitTime() {
        return waitTime;
    }
}

/**
 * 限流异常处理器
 */
@RestControllerAdvice
@Slf4j
public class RateLimitExceptionHandler {

    @ExceptionHandler(RateLimitException.class)
    public R<Void> handleRateLimitException(RateLimitException e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String clientIp = ServletUtils.getClientIP(request);

        log.warn("请求被限流 - URI: {}, IP: {}, Key: {}, 等待时间: {}秒",
            requestUri, clientIp, e.getLimitKey(), e.getWaitTime());

        // 设置重试响应头
        HttpServletResponse response = ServletUtils.getResponse();
        response.setHeader("Retry-After", String.valueOf(e.getWaitTime()));
        response.setHeader("X-RateLimit-Limit-Key", e.getLimitKey());

        return R.fail(HttpStatus.TOO_MANY_REQUESTS.value(),
            String.format("请求过于频繁，请%d秒后重试", e.getWaitTime()));
    }
}
```

### 限流切面实现

```java
/**
 * 限流注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {

    /**
     * 限流key前缀
     */
    String key() default "";

    /**
     * 限流类型
     */
    LimitType limitType() default LimitType.DEFAULT;

    /**
     * 时间窗口（秒）
     */
    int time() default 60;

    /**
     * 最大请求次数
     */
    int count() default 100;

    /**
     * 提示消息
     */
    String message() default "请求过于频繁，请稍后再试";
}

/**
 * 限流类型
 */
public enum LimitType {
    DEFAULT,    // 默认（IP + 接口）
    IP,         // 按IP限流
    USER,       // 按用户限流
    INTERFACE   // 按接口限流
}

/**
 * 限流切面
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

    private final RedissonClient redissonClient;

    @Around("@annotation(rateLimit)")
    public Object around(ProceedingJoinPoint point, RateLimit rateLimit) throws Throwable {
        String limitKey = buildLimitKey(point, rateLimit);

        RRateLimiter rateLimiter = redissonClient.getRateLimiter(limitKey);

        // 初始化限流器
        rateLimiter.trySetRate(
            RateType.OVERALL,
            rateLimit.count(),
            rateLimit.time(),
            RateIntervalUnit.SECONDS
        );

        // 尝试获取令牌
        if (!rateLimiter.tryAcquire()) {
            long waitTime = rateLimiter.availablePermits() > 0 ? 0 :
                calculateWaitTime(rateLimiter, rateLimit);

            throw new RateLimitException(rateLimit.message(), limitKey, waitTime);
        }

        return point.proceed();
    }

    private String buildLimitKey(ProceedingJoinPoint point, RateLimit rateLimit) {
        StringBuilder key = new StringBuilder("rate_limit:");

        if (StringUtils.isNotBlank(rateLimit.key())) {
            key.append(rateLimit.key()).append(":");
        }

        MethodSignature signature = (MethodSignature) point.getSignature();
        String methodName = signature.getDeclaringTypeName() + "." + signature.getName();

        switch (rateLimit.limitType()) {
            case IP:
                key.append("ip:").append(ServletUtils.getClientIP());
                break;
            case USER:
                Long userId = SecurityUtils.getUserIdOrNull();
                key.append("user:").append(userId != null ? userId : "anonymous");
                break;
            case INTERFACE:
                key.append("interface:").append(methodName);
                break;
            case DEFAULT:
            default:
                key.append(ServletUtils.getClientIP())
                   .append(":")
                   .append(methodName);
        }

        return key.toString();
    }

    private long calculateWaitTime(RRateLimiter rateLimiter, RateLimit rateLimit) {
        // 简化计算，实际应根据令牌桶算法计算
        return rateLimit.time();
    }
}
```

## 分布式异常处理

### 远程调用异常

```java
/**
 * 远程服务异常
 */
public class RemoteServiceException extends ServiceException {

    private String serviceName;
    private String methodName;
    private int httpStatus;

    public RemoteServiceException(String serviceName, String methodName, String message) {
        super(message);
        this.serviceName = serviceName;
        this.methodName = methodName;
    }

    public RemoteServiceException(String serviceName, String methodName,
                                   String message, int httpStatus) {
        super(message);
        this.serviceName = serviceName;
        this.methodName = methodName;
        this.httpStatus = httpStatus;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getMethodName() {
        return methodName;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}

/**
 * 远程调用异常处理器
 */
@RestControllerAdvice
@Slf4j
public class RemoteExceptionHandler {

    @ExceptionHandler(RemoteServiceException.class)
    public R<Void> handleRemoteException(RemoteServiceException e, HttpServletRequest request) {
        log.error("远程服务调用失败 - Service: {}, Method: {}, Status: {}, Message: {}",
            e.getServiceName(), e.getMethodName(), e.getHttpStatus(), e.getMessage(), e);

        // 根据HTTP状态码返回不同的错误信息
        if (e.getHttpStatus() == 503) {
            return R.fail("服务暂不可用，请稍后重试");
        } else if (e.getHttpStatus() == 504) {
            return R.fail("服务响应超时，请稍后重试");
        }

        return R.fail("远程服务调用失败");
    }

    @ExceptionHandler(FeignException.class)
    public R<Void> handleFeignException(FeignException e, HttpServletRequest request) {
        log.error("Feign调用异常 - Status: {}, Message: {}",
            e.status(), e.getMessage(), e);

        if (e.status() == -1) {
            return R.fail("服务不可用，请检查网络连接");
        } else if (e.status() >= 500) {
            return R.fail("服务端异常，请稍后重试");
        } else if (e.status() >= 400) {
            return R.fail("请求参数错误");
        }

        return R.fail("服务调用失败");
    }
}
```

### 熔断降级异常

```java
/**
 * 熔断异常
 */
public class CircuitBreakerException extends ServiceException {

    private String circuitBreakerName;
    private CircuitBreakerState state;

    public CircuitBreakerException(String circuitBreakerName, CircuitBreakerState state) {
        super("服务熔断中，请稍后重试");
        this.circuitBreakerName = circuitBreakerName;
        this.state = state;
    }

    public String getCircuitBreakerName() {
        return circuitBreakerName;
    }

    public CircuitBreakerState getState() {
        return state;
    }
}

/**
 * 熔断状态
 */
public enum CircuitBreakerState {
    CLOSED,      // 关闭（正常）
    OPEN,        // 打开（熔断中）
    HALF_OPEN    // 半开（恢复中）
}

/**
 * 降级异常
 */
public class FallbackException extends ServiceException {

    private String fallbackMethod;
    private Throwable originalException;

    public FallbackException(String message, String fallbackMethod, Throwable originalException) {
        super(message);
        this.fallbackMethod = fallbackMethod;
        this.originalException = originalException;
    }

    public String getFallbackMethod() {
        return fallbackMethod;
    }

    public Throwable getOriginalException() {
        return originalException;
    }
}

/**
 * 熔断降级异常处理器
 */
@RestControllerAdvice
@Slf4j
public class CircuitBreakerExceptionHandler {

    @ExceptionHandler(CircuitBreakerException.class)
    public R<Void> handleCircuitBreakerException(CircuitBreakerException e) {
        log.warn("熔断器触发 - Name: {}, State: {}",
            e.getCircuitBreakerName(), e.getState());

        return R.fail(HttpStatus.SERVICE_UNAVAILABLE.value(),
            "服务暂时不可用，请稍后重试");
    }

    @ExceptionHandler(FallbackException.class)
    public R<Void> handleFallbackException(FallbackException e) {
        log.warn("服务降级 - Fallback: {}, Original: {}",
            e.getFallbackMethod(), e.getOriginalException().getMessage());

        return R.fail("服务降级中，部分功能暂不可用");
    }
}
```

### 分布式事务异常

```java
/**
 * 分布式事务异常
 */
public class DistributedTransactionException extends ServiceException {

    private String transactionId;
    private TransactionPhase phase;

    public DistributedTransactionException(String transactionId, TransactionPhase phase,
                                            String message) {
        super(message);
        this.transactionId = transactionId;
        this.phase = phase;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public TransactionPhase getPhase() {
        return phase;
    }
}

/**
 * 事务阶段
 */
public enum TransactionPhase {
    PREPARE,    // 准备阶段
    COMMIT,     // 提交阶段
    ROLLBACK    // 回滚阶段
}

/**
 * 分布式事务异常处理器
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class DistributedTransactionExceptionHandler {

    private final TransactionCompensationService compensationService;

    @ExceptionHandler(DistributedTransactionException.class)
    public R<Void> handleDistributedTransactionException(
            DistributedTransactionException e, HttpServletRequest request) {

        log.error("分布式事务异常 - TxId: {}, Phase: {}, Message: {}",
            e.getTransactionId(), e.getPhase(), e.getMessage(), e);

        // 触发事务补偿
        if (e.getPhase() == TransactionPhase.COMMIT) {
            compensationService.compensate(e.getTransactionId());
        }

        return R.fail("操作失败，请稍后重试");
    }
}
```

## 测试中的异常验证

### 单元测试异常验证

```java
/**
 * 异常测试示例
 */
@ExtendWith(MockitoExtension.class)
class ExceptionHandlingTest {

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    @DisplayName("用户不存在时应抛出UserException")
    void shouldThrowUserExceptionWhenUserNotFound() {
        // Given
        Long userId = 999L;
        when(userMapper.selectById(userId)).thenReturn(null);

        // When & Then
        UserException exception = assertThrows(UserException.class, () -> {
            userService.getUserById(userId);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getCode());
        assertEquals("用户不存在", exception.getMessage());
    }

    @Test
    @DisplayName("验证异常链包含预期的根因")
    void shouldContainExpectedRootCause() {
        // Given
        SQLException sqlException = new SQLException("Connection refused");
        DataAccessException dataException = new DataAccessException("DB Error", sqlException) {};

        // When
        Throwable rootCause = ExceptionChainTracer.getRootCause(dataException);

        // Then
        assertInstanceOf(SQLException.class, rootCause);
        assertEquals("Connection refused", rootCause.getMessage());
    }

    @Test
    @DisplayName("验证异常转换正确")
    void shouldTransformExceptionCorrectly() {
        // Given
        IllegalArgumentException original = new IllegalArgumentException("Invalid parameter");

        // When
        ServiceException transformed = ExceptionWrapper.wrapAsServiceException(original);

        // Then
        assertEquals(ErrorCode.PARAM_ERROR, transformed.getCode());
        assertTrue(transformed.getMessage().contains("参数错误"));
    }

    @Test
    @DisplayName("验证限流异常包含正确的等待时间")
    void shouldContainCorrectWaitTime() {
        // Given
        long waitTime = 30;
        RateLimitException exception = new RateLimitException(
            "请求过于频繁", "test_key", waitTime);

        // Then
        assertEquals("test_key", exception.getLimitKey());
        assertEquals(30, exception.getWaitTime());
    }
}
```

### 集成测试异常验证

```java
/**
 * 全局异常处理器集成测试
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class GlobalExceptionHandlerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("业务异常应返回正确的错误码和消息")
    void shouldReturnCorrectErrorForServiceException() throws Exception {
        mockMvc.perform(get("/api/user/999")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_FOUND))
            .andExpect(jsonPath("$.msg").value("用户不存在"));
    }

    @Test
    @DisplayName("参数验证失败应返回400错误")
    void shouldReturnBadRequestForValidationError() throws Exception {
        String invalidJson = "{\"userName\":\"\"}";

        mockMvc.perform(post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(ErrorCode.PARAM_ERROR));
    }

    @Test
    @DisplayName("权限不足应返回403错误")
    void shouldReturnForbiddenForPermissionDenied() throws Exception {
        mockMvc.perform(delete("/api/admin/user/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(ErrorCode.PERMISSION_DENIED));
    }

    @Test
    @DisplayName("限流时应返回429错误")
    void shouldReturnTooManyRequestsForRateLimit() throws Exception {
        // 模拟超过限流阈值的请求
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(get("/api/rate-limited")
                .contentType(MediaType.APPLICATION_JSON));
        }

        mockMvc.perform(get("/api/rate-limited")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(HttpStatus.TOO_MANY_REQUESTS.value()))
            .andExpect(header().exists("Retry-After"));
    }
}
```

## 注意事项

### 1. 异常处理最佳实践

- **明确异常类型**：使用具体的异常类型而非通用Exception
- **携带上下文**：异常消息应包含足够的上下文信息便于排查
- **避免吞噬异常**：捕获异常后要么处理要么重新抛出
- **异常日志**：不同级别的异常使用不同级别的日志记录

### 2. 性能考虑

- **避免频繁创建异常**：异常创建涉及堆栈信息收集，开销较大
- **缓存异常实例**：对于固定的业务异常可以预先创建并缓存
- **异步记录日志**：异常日志的持久化应异步执行，避免影响主流程

### 3. 安全考虑

- **不暴露敏感信息**：生产环境不要将堆栈信息返回给客户端
- **参数化消息**：使用参数化消息防止注入攻击
- **限制日志大小**：限制异常消息和堆栈的记录长度

### 4. 国际化考虑

- **统一消息管理**：所有异常消息通过MessageSource管理
- **参数化占位符**：使用{0}、{1}等占位符而非字符串拼接
- **默认语言**：始终提供默认语言的消息作为兜底

### 5. 监控告警

- **设置合理阈值**：根据业务量设置异常告警阈值
- **分级告警**：不同级别的异常采用不同的告警方式
- **避免告警疲劳**：聚合相似异常，避免重复告警

### 6. 分布式环境

- **链路追踪**：异常信息应包含TraceId便于分布式追踪
- **服务标识**：记录发生异常的服务名称和实例
- **超时设置**：合理设置远程调用超时，避免级联故障

ExceptionHandler 为 RuoYi-Plus 提供了完整的异常处理机制，通过统一的异常处理、详细的异常记录和实时的异常监控，确保系统的稳定性和可维护性。