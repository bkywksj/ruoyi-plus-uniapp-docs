# 配置管理

## 概述

配置管理模块负责系统的核心配置，包括应用属性配置、线程池配置、异步任务配置、校验器配置等。该模块采用 Spring Boot 的自动配置机制，为系统提供开箱即用的基础配置。

## 模块结构

```text
config/
├── AsyncConfig.java              # 异步任务配置
├── SpringFeaturesConfig.java     # Spring全局特性配置
├── ThreadPoolConfig.java         # 线程池配置
├── ValidatorConfig.java          # 校验器配置
├── properties/                   # 配置属性类
│   ├── AppProperties.java        # 应用属性配置
│   └── ThreadPoolProperties.java # 线程池属性配置
├── validation/                   # 校验相关配置
│   └── I18nMessageInterceptor.java # 国际化消息拦截器
└── factory/                      # 工厂类
    └── YmlPropertySourceFactory.java # YAML配置源工厂
```

## 应用属性配置

### AppProperties

应用级别的基础属性配置，定义了系统的核心参数。

```java
@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    /**
     * 应用id
     */
    private String id;
    
    /**
     * 应用名称/标题
     */
    private String title;
    
    /**
     * 应用版本
     */
    private String version;
    
    /**
     * 应用版权年份
     */
    private String copyrightYear;
    
    /**
     * 应用本地文件上传路径
     */
    private String uploadPath;
    
    /**
     * 应用基础路径(供支付等模块构建回调地址使用)
     */
    private String baseApi;
}
```

#### 配置示例

```yaml
app:
  id: ryplus_uni
  title: ryplus-uni后台管理
  version: ${revision}
  copyright-year: 2025
  upload-path: /ruoyi/server/uploadPath
  base-api: https://ruoyi.plus
```

#### 使用方式

```java
@Component
public class AppService {
    
    @Autowired
    private AppProperties appProperties;
    
    public void buildCallbackUrl(String path) {
        String url = appProperties.getBaseApi() + path;
        // 构建回调地址逻辑
    }
}
```

## 线程池配置

### ThreadPoolConfig

提供系统通用的线程池配置，支持传统线程和虚拟线程自动切换。

#### 核心特性

- **自动模式切换**: 根据 JVM 支持情况自动选择虚拟线程或传统线程
- **优雅关闭**: 应用停止时安全关闭线程池
- **异常处理**: 统一的任务执行异常处理
- **动态配置**: 支持通过配置文件调整线程池参数

#### 配置类

```java
@Slf4j
@AutoConfiguration
@EnableConfigurationProperties(ThreadPoolProperties.class)
public class ThreadPoolConfig {
    
    /**
     * 核心线程数 = CPU 核心数 + 1
     */
    private final int core = Runtime.getRuntime().availableProcessors() + 1;
    
    /**
     * 普通任务线程池
     */
    @Bean(name = "threadPoolTaskExecutor")
    @ConditionalOnProperty(prefix = "thread-pool", name = "enabled", havingValue = "true")
    public ThreadPoolTaskExecutor threadPoolTaskExecutor(ThreadPoolProperties properties) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(core);
        executor.setMaxPoolSize(core * 2);
        executor.setQueueCapacity(properties.getQueueCapacity());
        executor.setKeepAliveSeconds(properties.getKeepAliveSeconds());
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return executor;
    }
    
    /**
     * 定时任务线程池
     */
    @Bean(name = "scheduledExecutorService")
    protected ScheduledExecutorService scheduledExecutorService() {
        // 根据系统支持情况选择虚拟线程或传统线程
        BasicThreadFactory.Builder builder = new BasicThreadFactory.Builder().daemon(true);
        
        if (SpringUtils.isVirtual()) {
            // 使用虚拟线程
            builder.namingPattern("virtual-schedule-pool-%d")
                   .wrappedFactory(new VirtualThreadTaskExecutor().getVirtualThreadFactory());
        } else {
            // 使用传统线程
            builder.namingPattern("schedule-pool-%d");
        }
        
        return new ScheduledThreadPoolExecutor(core, builder.build(), 
                                             new ThreadPoolExecutor.CallerRunsPolicy()) {
            @Override
            protected void afterExecute(Runnable r, Throwable t) {
                super.afterExecute(r, t);
                ThreadUtils.logException(r, t);
            }
        };
    }
}
```

#### 配置属性

```java
@Data
@ConfigurationProperties(prefix = "thread-pool")
public class ThreadPoolProperties {
    
    /**
     * 是否开启线程池
     */
    private boolean enabled;
    
    /**
     * 队列最大长度
     */
    private int queueCapacity;
    
    /**
     * 线程池维护线程所允许的空闲时间(秒)
     */
    private int keepAliveSeconds;
}
```

#### 配置示例

```yaml
thread-pool:
  enabled: true
  queue-capacity: 1000
  keep-alive-seconds: 300
```

#### 使用方式

```java
@Service
public class TaskService {
    
    @Autowired
    @Qualifier("threadPoolTaskExecutor")
    private ThreadPoolTaskExecutor taskExecutor;
    
    public void executeAsyncTask() {
        taskExecutor.execute(() -> {
            // 异步任务逻辑
            System.out.println("执行异步任务");
        });
    }
}
```

## 异步配置

### AsyncConfig

配置 Spring 的异步执行机制，支持虚拟线程和传统线程池的自动切换。

```java
@AutoConfiguration
public class AsyncConfig implements AsyncConfigurer {
    
    /**
     * 自定义 @Async 注解的线程执行器
     */
    @Override
    public Executor getAsyncExecutor() {
        // 检查是否支持虚拟线程
        if (SpringUtils.isVirtual()) {
            return new VirtualThreadTaskExecutor("async-");
        }
        return SpringUtils.getBean("scheduledExecutorService");
    }
    
    /**
     * 异步执行异常处理器
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, objects) -> {
            throwable.printStackTrace();
            
            StringBuilder sb = new StringBuilder();
            sb.append("异步任务异常 - ").append(throwable.getMessage())
              .append(", 方法名称 - ").append(method.getName());
            
            if (ArrayUtil.isNotEmpty(objects)) {
                sb.append(", 方法参数 - ").append(Arrays.toString(objects));
            }
            
            throw ServiceException.of(sb.toString());
        };
    }
}
```

#### 使用方式

```java
@Service
public class EmailService {
    
    @Async
    public void sendEmailAsync(String to, String subject, String content) {
        // 异步发送邮件
        try {
            Thread.sleep(2000); // 模拟邮件发送
            log.info("邮件发送成功: {}", to);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServiceException("邮件发送被中断");
        }
    }
}
```

## 校验器配置

### ValidatorConfig

自定义 Bean Validation 配置，集成国际化消息拦截器。

```java
@AutoConfiguration(before = ValidationAutoConfiguration.class)
public class ValidatorConfig {
    
    /**
     * 配置校验框架
     */
    @Bean
    public Validator validator(MessageSource messageSource) {
        try (LocalValidatorFactoryBean factoryBean = new LocalValidatorFactoryBean()) {
            // 设置自定义的国际化消息拦截器
            factoryBean.setMessageInterpolator(new I18nMessageInterceptor(messageSource));
            
            // 设置使用 HibernateValidator 校验器
            factoryBean.setProviderClass(HibernateValidator.class);
            
            // 配置快速失败模式
            Properties properties = new Properties();
            properties.setProperty("hibernate.validator.fail_fast", "true");
            factoryBean.setValidationProperties(properties);
            
            factoryBean.afterPropertiesSet();
            return factoryBean.getValidator();
        }
    }
}
```

### 国际化消息拦截器

```java
@Component
public class I18nMessageInterceptor implements MessageInterpolator {
    
    private final MessageSource messageSource;
    private final MessageInterpolator defaultInterpolator;
    
    public I18nMessageInterceptor(MessageSource messageSource) {
        this.messageSource = messageSource;
        this.defaultInterpolator = new ResourceBundleMessageInterpolator();
    }
    
    @Override
    public String interpolate(String messageTemplate, Context context, Locale locale) {
        if (StringUtils.isBlank(messageTemplate)) {
            return messageTemplate;
        }
        
        String trimmedTemplate = messageTemplate.trim();
        
        // 判断是否为简化的国际化键格式
        if (RegexValidator.isValidI18nKey(trimmedTemplate)) {
            try {
                // 获取国际化消息
                String i18nMessage = messageSource.getMessage(trimmedTemplate, null, locale);
                // 交给默认插值器处理约束属性
                return defaultInterpolator.interpolate(i18nMessage, context, locale);
            } catch (Exception e) {
                return trimmedTemplate;
            }
        }
        
        // 其他情况委托给默认插值器
        return defaultInterpolator.interpolate(messageTemplate, context, locale);
    }
}
```

#### 使用示例

```java
public class UserBo {
    // 直接使用国际化键，无需花括号
    @NotBlank(message = "user.username.required")
    private String username;
    
    @Email(message = "user.email.format.invalid")
    private String email;
}
```

## Spring 全局特性配置

### SpringFeaturesConfig

启用 Spring 的全局特性，如 AOP 和异步处理。

```java
@AutoConfiguration
@EnableAspectJAutoProxy  // 启用 AOP
@EnableAsync(proxyTargetClass = true)  // 启用异步处理
public class SpringFeaturesConfig {
    // 此类仅用于配置注解，无需添加方法
}
```

功能说明：
- **@EnableAspectJAutoProxy**: 启用基于注解的 AOP 支持
- **@EnableAsync**: 启用异步方法执行支持，使用 CGLIB 代理

## YAML 配置源工厂

### YmlPropertySourceFactory

支持 Spring 加载 YAML 格式的配置文件。

```java
public class YmlPropertySourceFactory extends DefaultPropertySourceFactory {
    
    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource resource) 
            throws IOException {
        String sourceName = resource.getResource().getFilename();
        
        // 判断是否为 YAML 格式文件
        if (StringUtils.isNotBlank(sourceName) && 
            StringUtils.endsWithAny(sourceName, ".yml", ".yaml")) {
            
            YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
            factory.setResources(resource.getResource());
            factory.afterPropertiesSet();
            
            return new PropertiesPropertySource(sourceName, factory.getObject());
        }
        
        return super.createPropertySource(name, resource);
    }
}
```

#### 使用方式

```java
@Component
@PropertySource(value = "classpath:custom-config.yml", 
                factory = YmlPropertySourceFactory.class)
public class CustomConfig {
    // 配置类实现
}
```

## 自动配置

系统通过 `spring.factories` 文件实现自动配置：

```properties
# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
plus.ruoyi.common.core.config.properties.AppProperties
plus.ruoyi.common.core.config.AsyncConfig
plus.ruoyi.common.core.config.SpringFeaturesConfig
plus.ruoyi.common.core.config.ThreadPoolConfig
plus.ruoyi.common.core.config.ValidatorConfig
plus.ruoyi.common.core.utils.SpringUtils
```

## 配置最佳实践

### 1. 环境配置分离

```yaml
# application.yml (通用配置)
app:
  title: ryplus-uni后台管理
  copyright-year: 2025

thread-pool:
  enabled: true

---
# application-dev.yml (开发环境)
app:
  upload-path: D:/ruoyi/uploads
  base-api: http://localhost:5500

thread-pool:
  queue-capacity: 100
  keep-alive-seconds: 60

---
# application-prod.yml (生产环境)  
app:
  upload-path: /opt/ruoyi/uploads
  base-api: https://api.ruoyi.com

thread-pool:
  queue-capacity: 1000
  keep-alive-seconds: 300
```

### 2. 配置属性校验

```java
@Data
@ConfigurationProperties(prefix = "app")
@Validated
public class AppProperties {
    
    @NotBlank(message = "应用ID不能为空")
    private String id;
    
    @NotBlank(message = "应用标题不能为空")
    private String title;
    
    @Pattern(regexp = "\\d+\\.\\d+\\.\\d+", message = "版本号格式不正确")
    private String version;
    
    @Min(value = 1990, message = "版权年份不能小于1990")
    @Max(value = 2030, message = "版权年份不能大于2030")
    private Integer copyrightYear;
}
```

### 3. 条件化配置

```java
@Configuration
public class ConditionalConfig {
    
    @Bean
    @ConditionalOnProperty(name = "app.cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
    
    @Bean
    @ConditionalOnMissingBean(RedisTemplate.class)
    public RedisTemplate<String, Object> redisTemplate() {
        // Redis配置
        return new RedisTemplate<>();
    }
}
```

### 4. 配置加密

```yaml
# 敏感配置加密
spring:
  datasource:
    password: ENC(encrypted_password)
    
app:
  secret-key: ENC(encrypted_secret)
```

### 5. 配置监控

```java
@Component
@ConfigurationPropertiesBinding
public class ConfigurationChangeListener {
    
    @EventListener
    public void handleConfigChange(EnvironmentChangeEvent event) {
        log.info("配置发生变化: {}", event.getKeys());
        // 处理配置变更逻辑
    }
}
```

## 注意事项

### 1. 线程池配置

- **核心线程数**: 建议设置为 CPU核心数 + 1
- **最大线程数**: 通常设置为核心线程数的 2 倍
- **队列容量**: 根据业务负载调整，避免 OOM
- **拒绝策略**: 生产环境建议使用 CallerRunsPolicy

### 2. 虚拟线程使用

- **JDK版本**: 需要 JDK 17 或更高版本 (JDK 21 支持更完善，推荐使用)
- **适用场景**: IO 密集型任务，不适合 CPU 密集型
- **注意事项**: 避免使用 ThreadLocal，可能影响性能

### 3. 异步配置

- **异常处理**: 必须配置异常处理器，避免异常丢失
- **线程池**: 避免使用默认线程池，自定义线程池配置
- **事务处理**: 异步方法中事务会失效，需要特殊处理

### 4. 配置安全

- **敏感信息**: 使用配置加密，不要明文存储密码
- **权限控制**: 限制配置文件的访问权限
- **环境隔离**: 不同环境使用不同的配置文件

### 5. 性能优化

- **懒加载**: 使用 @Lazy 注解延迟初始化
- **条件注解**: 使用 @ConditionalOn* 避免不必要的 Bean 创建
- **配置缓存**: 避免重复读取配置文件

## 扩展配置

### 自定义配置属性

```java
@Data
@Component
@ConfigurationProperties(prefix = "custom")
public class CustomProperties {
    
    private Redis redis = new Redis();
    private Security security = new Security();
    
    @Data
    public static class Redis {
        private String host = "localhost";
        private int port = 6379;
        private String password;
        private int database = 0;
    }
    
    @Data  
    public static class Security {
        private boolean enabled = true;
        private String[] excludePaths = {};
    }
}
```

### 自定义自动配置

```java
@AutoConfiguration
@ConditionalOnClass(CustomService.class)
@EnableConfigurationProperties(CustomProperties.class)
public class CustomAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public CustomService customService(CustomProperties properties) {
        return new CustomService(properties);
    }
}
```

通过合理的配置管理，可以确保系统的灵活性、可维护性和性能优化。配置模块作为系统的基础设施，需要重点关注其稳定性和扩展性。

## 配置文件加载顺序

### Spring Boot 配置优先级

Spring Boot 按照以下优先级加载配置（从高到低）：

```text
1. 命令行参数 (--server.port=8080)
2. Java 系统属性 (System.getProperties())
3. 操作系统环境变量
4. jar 包外部的 application-{profile}.yml
5. jar 包内部的 application-{profile}.yml
6. jar 包外部的 application.yml
7. jar 包内部的 application.yml
8. @PropertySource 注解加载的配置
9. 默认属性 (SpringApplication.setDefaultProperties)
```

### 配置文件位置优先级

```text
1. file:./config/          # 项目根目录下的 config 文件夹
2. file:./config/*/        # 项目根目录下 config 的子文件夹
3. file:./                 # 项目根目录
4. classpath:/config/      # 类路径下的 config 文件夹
5. classpath:/             # 类路径根目录
```

### 多配置文件加载示例

```java
/**
 * 配置文件加载顺序演示
 */
@Configuration
public class ConfigLoadingDemo {

    @Value("${app.name:默认应用名}")
    private String appName;

    @PostConstruct
    public void showConfigSources() {
        // 获取环境对象
        ConfigurableEnvironment env = (ConfigurableEnvironment)
                SpringUtils.getBean(Environment.class);

        // 打印所有配置源
        MutablePropertySources sources = env.getPropertySources();
        sources.forEach(source -> {
            log.info("配置源: {} - {}", source.getName(), source.getClass().getSimpleName());
        });
    }
}
```

## 配置中心集成

### Nacos 配置中心

```java
/**
 * Nacos 配置中心集成
 */
@Configuration
@EnableNacosConfig(globalProperties = @NacosProperties(serverAddr = "${nacos.server-addr}"))
public class NacosConfigConfiguration {

    /**
     * 监听配置变更
     */
    @NacosConfigListener(dataId = "app-config.yaml", groupId = "DEFAULT_GROUP")
    public void onConfigChange(String newConfig) {
        log.info("Nacos 配置变更: {}", newConfig);
        // 刷新本地配置缓存
        refreshLocalConfig(newConfig);
    }

    /**
     * 手动获取 Nacos 配置
     */
    @Autowired
    private ConfigService configService;

    public String getRemoteConfig(String dataId, String group) {
        try {
            return configService.getConfig(dataId, group, 5000);
        } catch (NacosException e) {
            log.error("获取 Nacos 配置失败: dataId={}, group={}", dataId, group, e);
            throw ServiceException.of("配置获取失败");
        }
    }
}
```

### Nacos 配置示例

```yaml
# bootstrap.yml
spring:
  application:
    name: ruoyi-system
  cloud:
    nacos:
      config:
        server-addr: ${NACOS_SERVER:127.0.0.1:8848}
        namespace: ${NACOS_NAMESPACE:dev}
        group: DEFAULT_GROUP
        file-extension: yaml
        shared-configs:
          - data-id: common-config.yaml
            group: SHARED_GROUP
            refresh: true
        extension-configs:
          - data-id: redis-config.yaml
            group: EXTENSION_GROUP
            refresh: true
```

### Apollo 配置中心

```java
/**
 * Apollo 配置中心集成
 */
@Configuration
@EnableApolloConfig
public class ApolloConfigConfiguration {

    @ApolloConfig
    private Config config;

    @ApolloConfigChangeListener
    public void onChange(ConfigChangeEvent changeEvent) {
        changeEvent.changedKeys().forEach(key -> {
            ConfigChange change = changeEvent.getChange(key);
            log.info("Apollo 配置变更: key={}, oldValue={}, newValue={}, changeType={}",
                    change.getPropertyName(),
                    change.getOldValue(),
                    change.getNewValue(),
                    change.getChangeType());
        });
    }

    /**
     * 获取配置值
     */
    public String getProperty(String key, String defaultValue) {
        return config.getProperty(key, defaultValue);
    }

    /**
     * 获取整数配置
     */
    public int getIntProperty(String key, int defaultValue) {
        return config.getIntProperty(key, defaultValue);
    }
}
```

## 动态配置刷新

### RefreshScope 实现

```java
/**
 * 支持动态刷新的配置类
 */
@Component
@RefreshScope
@ConfigurationProperties(prefix = "dynamic")
@Data
public class DynamicConfig {

    /**
     * 功能开关
     */
    private boolean featureEnabled;

    /**
     * 限流阈值
     */
    private int rateLimitThreshold;

    /**
     * 超时时间（毫秒）
     */
    private long timeoutMs;

    /**
     * 白名单列表
     */
    private List<String> whitelist = new ArrayList<>();
}

/**
 * 配置刷新事件监听
 */
@Component
@Slf4j
public class ConfigRefreshListener {

    @Autowired
    private DynamicConfig dynamicConfig;

    @EventListener(RefreshScopeRefreshedEvent.class)
    public void onRefresh(RefreshScopeRefreshedEvent event) {
        log.info("配置已刷新，当前值: featureEnabled={}, rateLimitThreshold={}",
                dynamicConfig.isFeatureEnabled(),
                dynamicConfig.getRateLimitThreshold());
    }
}
```

### 手动刷新配置

```java
/**
 * 配置刷新服务
 */
@Service
@Slf4j
public class ConfigRefreshService {

    @Autowired
    private RefreshScope refreshScope;

    @Autowired
    private ContextRefresher contextRefresher;

    /**
     * 刷新指定 Bean 的配置
     */
    public void refreshBean(String beanName) {
        refreshScope.refresh(beanName);
        log.info("Bean 配置已刷新: {}", beanName);
    }

    /**
     * 刷新所有 RefreshScope Bean
     */
    public void refreshAll() {
        refreshScope.refreshAll();
        log.info("所有 RefreshScope Bean 配置已刷新");
    }

    /**
     * 刷新环境配置
     */
    public Set<String> refreshEnvironment() {
        Set<String> changedKeys = contextRefresher.refresh();
        log.info("环境配置已刷新，变更的键: {}", changedKeys);
        return changedKeys;
    }
}

/**
 * 配置刷新 REST 接口
 */
@RestController
@RequestMapping("/config")
public class ConfigRefreshController {

    @Autowired
    private ConfigRefreshService refreshService;

    @PostMapping("/refresh")
    @SaCheckRole("admin")
    public R<Set<String>> refresh() {
        Set<String> changedKeys = refreshService.refreshEnvironment();
        return R.ok(changedKeys);
    }

    @PostMapping("/refresh/{beanName}")
    @SaCheckRole("admin")
    public R<Void> refreshBean(@PathVariable String beanName) {
        refreshService.refreshBean(beanName);
        return R.ok();
    }
}
```

## 配置监控与审计

### 配置变更审计

```java
/**
 * 配置变更审计服务
 */
@Service
@Slf4j
public class ConfigAuditService {

    @Autowired
    private ConfigAuditLogMapper auditLogMapper;

    /**
     * 记录配置变更
     */
    public void recordChange(String key, String oldValue, String newValue,
            String operator, String source) {
        ConfigAuditLog log = new ConfigAuditLog();
        log.setConfigKey(key);
        log.setOldValue(maskSensitive(oldValue));
        log.setNewValue(maskSensitive(newValue));
        log.setOperator(operator);
        log.setSource(source);
        log.setChangeTime(LocalDateTime.now());
        log.setClientIp(ServletUtils.getClientIP());

        auditLogMapper.insert(log);
    }

    /**
     * 脱敏处理
     */
    private String maskSensitive(String value) {
        if (value == null) {
            return null;
        }
        // 对密码、密钥等敏感配置进行脱敏
        if (value.length() > 4) {
            return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
        }
        return "****";
    }

    /**
     * 查询配置变更历史
     */
    public List<ConfigAuditLog> getChangeHistory(String configKey, int limit) {
        return auditLogMapper.selectByKey(configKey, limit);
    }
}

/**
 * 配置审计日志实体
 */
@Data
@TableName("sys_config_audit_log")
public class ConfigAuditLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 配置键 */
    private String configKey;

    /** 旧值 */
    private String oldValue;

    /** 新值 */
    private String newValue;

    /** 操作人 */
    private String operator;

    /** 来源（手动/自动同步/配置中心） */
    private String source;

    /** 变更时间 */
    private LocalDateTime changeTime;

    /** 客户端IP */
    private String clientIp;
}
```

### 配置健康检查

```java
/**
 * 配置健康指示器
 */
@Component
public class ConfigHealthIndicator implements HealthIndicator {

    @Autowired
    private AppProperties appProperties;

    @Autowired(required = false)
    private ConfigService nacosConfigService;

    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();

        // 检查必要配置
        if (StringUtils.isBlank(appProperties.getId())) {
            return builder.down()
                    .withDetail("error", "应用ID未配置")
                    .build();
        }

        // 检查配置中心连接
        if (nacosConfigService != null) {
            try {
                String status = nacosConfigService.getServerStatus();
                if (!"UP".equals(status)) {
                    return builder.down()
                            .withDetail("error", "Nacos 配置中心不可用")
                            .withDetail("status", status)
                            .build();
                }
            } catch (Exception e) {
                return builder.down()
                        .withDetail("error", "Nacos 连接失败: " + e.getMessage())
                        .build();
            }
        }

        return builder.up()
                .withDetail("appId", appProperties.getId())
                .withDetail("version", appProperties.getVersion())
                .build();
    }
}
```

### 配置指标收集

```java
/**
 * 配置指标收集器
 */
@Component
@Slf4j
public class ConfigMetricsCollector {

    private final MeterRegistry meterRegistry;

    // 配置刷新计数器
    private final Counter refreshCounter;

    // 配置变更计数器
    private final Counter changeCounter;

    // 配置加载耗时
    private final Timer loadTimer;

    public ConfigMetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        this.refreshCounter = Counter.builder("config.refresh.count")
                .description("配置刷新次数")
                .register(meterRegistry);

        this.changeCounter = Counter.builder("config.change.count")
                .description("配置变更次数")
                .register(meterRegistry);

        this.loadTimer = Timer.builder("config.load.time")
                .description("配置加载耗时")
                .register(meterRegistry);
    }

    /**
     * 记录配置刷新
     */
    public void recordRefresh() {
        refreshCounter.increment();
    }

    /**
     * 记录配置变更
     */
    public void recordChange(String key) {
        changeCounter.increment();
        Counter.builder("config.change.key")
                .tag("key", key)
                .register(meterRegistry)
                .increment();
    }

    /**
     * 记录配置加载耗时
     */
    public <T> T recordLoad(Supplier<T> loader) {
        return loadTimer.record(loader);
    }
}
```

## 配置属性绑定高级用法

### 嵌套属性绑定

```java
/**
 * 复杂嵌套配置属性
 */
@Data
@ConfigurationProperties(prefix = "system")
public class SystemProperties {

    /** 基础配置 */
    private Basic basic = new Basic();

    /** 缓存配置 */
    private Cache cache = new Cache();

    /** 安全配置 */
    private Security security = new Security();

    /** 集群配置 */
    private Map<String, ClusterNode> clusters = new HashMap<>();

    @Data
    public static class Basic {
        private String name;
        private String description;
        private String timezone = "Asia/Shanghai";
        private Locale locale = Locale.SIMPLIFIED_CHINESE;
    }

    @Data
    public static class Cache {
        private boolean enabled = true;
        private Duration ttl = Duration.ofMinutes(30);
        private int maxSize = 1000;
        private CacheType type = CacheType.REDIS;

        public enum CacheType {
            LOCAL, REDIS, CAFFEINE
        }
    }

    @Data
    public static class Security {
        private boolean enabled = true;
        private String[] allowedOrigins = {"*"};
        private Duration tokenTtl = Duration.ofHours(2);
        private List<String> excludePaths = new ArrayList<>();
    }

    @Data
    public static class ClusterNode {
        private String host;
        private int port;
        private int weight = 1;
        private boolean master = false;
    }
}
```

### YAML 配置示例

```yaml
system:
  basic:
    name: RuoYi-Plus
    description: 企业级后台管理系统
    timezone: Asia/Shanghai
    locale: zh_CN

  cache:
    enabled: true
    ttl: 30m
    max-size: 1000
    type: redis

  security:
    enabled: true
    allowed-origins:
      - https://ruoyi.plus
      - https://admin.ruoyi.plus
    token-ttl: 2h
    exclude-paths:
      - /api/public/**
      - /health/**

  clusters:
    node1:
      host: 192.168.1.10
      port: 8080
      weight: 2
      master: true
    node2:
      host: 192.168.1.11
      port: 8080
      weight: 1
      master: false
```

### 构造器绑定

```java
/**
 * 使用构造器绑定的不可变配置
 */
@ConfigurationProperties(prefix = "immutable")
public class ImmutableProperties {

    private final String apiKey;
    private final String secretKey;
    private final Duration timeout;
    private final List<String> endpoints;

    @ConstructorBinding
    public ImmutableProperties(
            String apiKey,
            String secretKey,
            @DefaultValue("30s") Duration timeout,
            @DefaultValue("") List<String> endpoints) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.timeout = timeout;
        this.endpoints = endpoints;
    }

    // 只有 getter，没有 setter
    public String getApiKey() {
        return apiKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public Duration getTimeout() {
        return timeout;
    }

    public List<String> getEndpoints() {
        return Collections.unmodifiableList(endpoints);
    }
}
```

### 配置属性转换器

```java
/**
 * 自定义配置转换器
 */
@Component
@ConfigurationPropertiesBinding
public class StringToPatternConverter implements Converter<String, Pattern> {

    @Override
    public Pattern convert(String source) {
        if (StringUtils.isBlank(source)) {
            return null;
        }
        return Pattern.compile(source);
    }
}

/**
 * Duration 转换器（支持中文）
 */
@Component
@ConfigurationPropertiesBinding
public class ChineseDurationConverter implements Converter<String, Duration> {

    private static final Map<String, Function<Long, Duration>> UNITS = Map.of(
            "秒", Duration::ofSeconds,
            "分", Duration::ofMinutes,
            "分钟", Duration::ofMinutes,
            "时", Duration::ofHours,
            "小时", Duration::ofHours,
            "天", Duration::ofDays,
            "日", Duration::ofDays
    );

    @Override
    public Duration convert(String source) {
        if (StringUtils.isBlank(source)) {
            return null;
        }

        // 尝试标准格式
        try {
            return Duration.parse(source);
        } catch (Exception ignored) {
        }

        // 尝试中文格式
        for (Map.Entry<String, Function<Long, Duration>> entry : UNITS.entrySet()) {
            if (source.endsWith(entry.getKey())) {
                String numberPart = source.substring(0, source.length() - entry.getKey().length());
                long value = Long.parseLong(numberPart.trim());
                return entry.getValue().apply(value);
            }
        }

        throw new IllegalArgumentException("无法解析时间配置: " + source);
    }
}
```

## 多环境配置策略

### Profile 配置

```java
/**
 * 环境感知配置
 */
@Configuration
public class EnvironmentAwareConfig {

    @Autowired
    private Environment environment;

    /**
     * 判断当前环境
     */
    public boolean isProduction() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }

    public boolean isDevelopment() {
        return Arrays.asList(environment.getActiveProfiles()).contains("dev");
    }

    /**
     * 开发环境专用 Bean
     */
    @Bean
    @Profile("dev")
    public DataSourceInitializer devDataSourceInitializer(DataSource dataSource) {
        DataSourceInitializer initializer = new DataSourceInitializer();
        initializer.setDataSource(dataSource);
        initializer.setDatabasePopulator(new ResourceDatabasePopulator(
                new ClassPathResource("sql/dev-data.sql")));
        return initializer;
    }

    /**
     * 生产环境专用配置
     */
    @Bean
    @Profile("prod")
    public MeterRegistryCustomizer<MeterRegistry> productionMetrics() {
        return registry -> registry.config()
                .commonTags("env", "production")
                .commonTags("region", "cn-east");
    }
}
```

### 配置继承与覆盖

```yaml
# application.yml - 基础配置
spring:
  profiles:
    group:
      dev: dev,dev-db,dev-cache
      prod: prod,prod-db,prod-cache
      test: test,test-db

logging:
  level:
    root: INFO

---
# application-dev.yml
spring:
  config:
    activate:
      on-profile: dev

logging:
  level:
    root: DEBUG
    com.ruoyi: DEBUG

app:
  debug-mode: true

---
# application-prod.yml
spring:
  config:
    activate:
      on-profile: prod

logging:
  level:
    root: WARN
    com.ruoyi: INFO

app:
  debug-mode: false
```

### 配置分组管理

```java
/**
 * 配置分组服务
 */
@Service
public class ConfigGroupService {

    @Autowired
    private Environment environment;

    /**
     * 获取分组配置
     */
    public Map<String, String> getGroupConfig(String group) {
        Map<String, String> configs = new HashMap<>();

        // 从环境中获取指定前缀的所有配置
        if (environment instanceof ConfigurableEnvironment configEnv) {
            MutablePropertySources sources = configEnv.getPropertySources();

            String prefix = group + ".";
            sources.forEach(source -> {
                if (source instanceof EnumerablePropertySource<?> enumerable) {
                    for (String key : enumerable.getPropertyNames()) {
                        if (key.startsWith(prefix)) {
                            Object value = source.getProperty(key);
                            if (value != null) {
                                configs.putIfAbsent(key, value.toString());
                            }
                        }
                    }
                }
            });
        }

        return configs;
    }

    /**
     * 导出配置
     */
    public String exportConfig(String format) {
        Map<String, Object> allConfigs = new LinkedHashMap<>();

        if (environment instanceof ConfigurableEnvironment configEnv) {
            MutablePropertySources sources = configEnv.getPropertySources();
            sources.forEach(source -> {
                if (source instanceof EnumerablePropertySource<?> enumerable) {
                    for (String key : enumerable.getPropertyNames()) {
                        if (!key.startsWith("java.") && !key.startsWith("sun.")) {
                            Object value = source.getProperty(key);
                            allConfigs.putIfAbsent(key, value);
                        }
                    }
                }
            });
        }

        if ("yaml".equals(format)) {
            return new Yaml().dump(allConfigs);
        }
        return JsonUtils.toJsonString(allConfigs);
    }
}
```

## 配置加密与安全

### Jasypt 配置加密

```java
/**
 * Jasypt 加密配置
 */
@Configuration
public class JasyptConfig {

    /**
     * 配置加密器
     */
    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();

        // 从环境变量获取加密密码
        config.setPassword(System.getenv("JASYPT_ENCRYPTOR_PASSWORD"));
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");

        encryptor.setConfig(config);
        return encryptor;
    }
}
```

### 加密配置示例

```yaml
spring:
  datasource:
    # ENC() 包裹的值会自动解密
    password: ENC(AAAAILxGlT9h3Jw7k8yqWz...)

app:
  secret-key: ENC(AAAAIKz9PLmN7hU4k2xQwz...)
```

### 配置加密工具

```java
/**
 * 配置加密工具类
 */
@Component
public class ConfigEncryptUtils {

    @Autowired
    @Qualifier("jasyptStringEncryptor")
    private StringEncryptor encryptor;

    /**
     * 加密配置值
     */
    public String encrypt(String plainText) {
        return encryptor.encrypt(plainText);
    }

    /**
     * 解密配置值
     */
    public String decrypt(String encryptedText) {
        return encryptor.decrypt(encryptedText);
    }

    /**
     * 批量加密
     */
    public Map<String, String> encryptAll(Map<String, String> configs) {
        Map<String, String> encrypted = new HashMap<>();
        configs.forEach((key, value) -> {
            encrypted.put(key, "ENC(" + encrypt(value) + ")");
        });
        return encrypted;
    }
}

/**
 * 加密管理接口
 */
@RestController
@RequestMapping("/admin/config")
@SaCheckRole("admin")
public class ConfigEncryptController {

    @Autowired
    private ConfigEncryptUtils encryptUtils;

    @PostMapping("/encrypt")
    public R<String> encrypt(@RequestParam String value) {
        String encrypted = encryptUtils.encrypt(value);
        return R.ok("ENC(" + encrypted + ")");
    }

    @PostMapping("/decrypt")
    public R<String> decrypt(@RequestParam String value) {
        // 移除 ENC() 包装
        String encryptedValue = value.replace("ENC(", "").replace(")", "");
        String decrypted = encryptUtils.decrypt(encryptedValue);
        return R.ok(decrypted);
    }
}
```

## 配置热更新

### 基于事件的配置更新

```java
/**
 * 配置更新事件
 */
public class ConfigUpdateEvent extends ApplicationEvent {

    private final String key;
    private final String oldValue;
    private final String newValue;

    public ConfigUpdateEvent(Object source, String key, String oldValue, String newValue) {
        super(source);
        this.key = key;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    // Getters...
}

/**
 * 配置更新发布器
 */
@Component
public class ConfigUpdatePublisher {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public void publishUpdate(String key, String oldValue, String newValue) {
        ConfigUpdateEvent event = new ConfigUpdateEvent(this, key, oldValue, newValue);
        eventPublisher.publishEvent(event);
    }
}

/**
 * 配置更新监听器
 */
@Component
@Slf4j
public class ConfigUpdateListener {

    @Autowired
    private ConfigAuditService auditService;

    @EventListener
    public void onConfigUpdate(ConfigUpdateEvent event) {
        log.info("配置更新: key={}, oldValue={}, newValue={}",
                event.getKey(), event.getOldValue(), event.getNewValue());

        // 记录审计日志
        auditService.recordChange(
                event.getKey(),
                event.getOldValue(),
                event.getNewValue(),
                LoginHelper.getUsername(),
                "HOT_UPDATE"
        );
    }

    @EventListener
    @Async
    public void onConfigUpdateAsync(ConfigUpdateEvent event) {
        // 异步处理配置变更后的操作
        if (event.getKey().startsWith("cache.")) {
            // 刷新缓存配置
            refreshCacheConfig(event);
        }
    }

    private void refreshCacheConfig(ConfigUpdateEvent event) {
        // 实现缓存配置刷新逻辑
    }
}
```

### 配置版本管理

```java
/**
 * 配置版本服务
 */
@Service
@Slf4j
public class ConfigVersionService {

    @Autowired
    private ConfigVersionMapper versionMapper;

    /**
     * 保存配置版本
     */
    public void saveVersion(String configKey, String configValue, String comment) {
        ConfigVersion version = new ConfigVersion();
        version.setConfigKey(configKey);
        version.setConfigValue(configValue);
        version.setVersion(generateVersion());
        version.setComment(comment);
        version.setCreatedBy(LoginHelper.getUsername());
        version.setCreatedTime(LocalDateTime.now());

        versionMapper.insert(version);
    }

    /**
     * 生成版本号
     */
    private String generateVersion() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    /**
     * 回滚到指定版本
     */
    public void rollback(String configKey, String version) {
        ConfigVersion targetVersion = versionMapper.selectByKeyAndVersion(configKey, version);
        if (targetVersion == null) {
            throw ServiceException.of("版本不存在: " + version);
        }

        // 获取当前值
        String currentValue = getCurrentValue(configKey);

        // 更新为目标版本的值
        updateConfig(configKey, targetVersion.getConfigValue());

        // 保存回滚记录
        saveVersion(configKey, targetVersion.getConfigValue(),
                "回滚到版本 " + version + "，原值: " + currentValue);
    }

    /**
     * 获取版本历史
     */
    public List<ConfigVersion> getVersionHistory(String configKey, int limit) {
        return versionMapper.selectHistoryByKey(configKey, limit);
    }

    /**
     * 比较两个版本
     */
    public ConfigDiff compareVersions(String configKey, String version1, String version2) {
        ConfigVersion v1 = versionMapper.selectByKeyAndVersion(configKey, version1);
        ConfigVersion v2 = versionMapper.selectByKeyAndVersion(configKey, version2);

        ConfigDiff diff = new ConfigDiff();
        diff.setConfigKey(configKey);
        diff.setVersion1(version1);
        diff.setVersion2(version2);
        diff.setValue1(v1 != null ? v1.getConfigValue() : null);
        diff.setValue2(v2 != null ? v2.getConfigValue() : null);

        return diff;
    }
}
```

## 注意事项补充

### 8. 配置加载性能

- **延迟加载**: 非必要配置使用 `@Lazy` 延迟初始化
- **批量加载**: 避免逐个获取配置，使用配置属性类批量绑定
- **缓存配置**: 频繁访问的配置使用本地缓存
- **异步加载**: 大量配置可以异步加载，不阻塞启动

```java
// ❌ 不推荐：逐个获取配置
@Value("${app.name}")
private String appName;
@Value("${app.version}")
private String appVersion;
// ... 更多配置

// ✅ 推荐：使用配置属性类
@Autowired
private AppProperties appProperties;
```

### 9. 配置命名规范

- **统一前缀**: 模块配置使用统一前缀，如 `app.`, `system.`
- **层次结构**: 使用点号分隔表示层次，如 `cache.redis.host`
- **驼峰转换**: YAML 中使用 `kebab-case`，Java 中使用 `camelCase`
- **避免缩写**: 配置键使用完整单词，便于理解

```yaml
# ✅ 推荐命名
cache:
  redis:
    host: localhost
    port: 6379
    connection-timeout: 3000ms

# ❌ 不推荐命名
c:
  r:
    h: localhost
    p: 6379
    ct: 3000
```

### 10. 配置文档化

- **添加注释**: 在 YAML 配置中添加注释说明
- **生成文档**: 使用 spring-configuration-metadata 生成配置提示
- **维护变更**: 重要配置变更记录在变更日志中

```java
/**
 * 生成配置元数据
 * 在 pom.xml 中添加依赖：
 * spring-boot-configuration-processor
 */
@Data
@ConfigurationProperties(prefix = "app.feature")
public class FeatureProperties {

    /**
     * 是否启用新功能
     * @since 1.0.0
     */
    private boolean newFeatureEnabled = false;

    /**
     * 功能超时时间
     * 默认 30 秒
     */
    private Duration timeout = Duration.ofSeconds(30);
}
```
