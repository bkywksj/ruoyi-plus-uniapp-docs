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
