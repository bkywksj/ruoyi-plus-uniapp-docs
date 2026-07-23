# 高级配置

本章将介绍代码生成器的高级配置功能，包括自定义模板、扩展配置、性能优化、多数据源配置以及与CI/CD的集成等内容。

## 自定义模板配置

### 模板引擎架构

代码生成器基于Apache Velocity模板引擎，支持完全自定义的代码模板。

#### 模板目录结构
```text
src/main/resources/vm/
├── java/                    # Java后端模板
│   ├── controller.java.vm   # 控制器模板
│   ├── service.java.vm      # 服务接口模板
│   ├── serviceImpl.java.vm  # 服务实现模板
│   ├── mapper.java.vm       # Mapper接口模板
│   ├── domain.java.vm       # 实体类模板
│   ├── bo.java.vm          # 业务对象模板
│   └── vo.java.vm          # 视图对象模板
├── vue/                     # 前端Vue模板
│   ├── index.vue.vm        # 标准页面模板
│   ├── index-tree.vue.vm   # 树形页面模板
│   └── child.vue.vm        # 子表组件模板
├── ts/                      # TypeScript模板
│   ├── api.ts.vm           # API接口模板
│   └── types.ts.vm         # 类型定义模板
├── xml/                     # MyBatis XML模板
│   └── mapper.xml.vm       # Mapper XML模板
└── sql/                     # SQL脚本模板
    ├── sql.vm              # MySQL脚本
    ├── oracle/sql.vm       # Oracle脚本
    ├── postgres/sql.vm     # PostgreSQL脚本
    └── sqlserver/sql.vm    # SQL Server脚本
```

### 创建自定义模板

#### 1. 模板语法基础

```text
## 这是注释
## 变量引用
${packageName}
${className}
${tableName}

## 条件判断
#if($column.required)
    @NotNull(message = "${column.columnComment}不能为空")
#end

## 循环遍历
#foreach($column in $columns)
    private ${column.javaType} ${column.javaField};
#end

## 包含其他模板
#parse("vm/common/header.vm")

## 方法调用
$!{StringUtils.capitalize($column.javaField)}
```

#### 2. 可用的模板变量

```text
## 表基本信息
${tableName}          ## 数据库表名
${tableComment}       ## 表注释
${className}          ## Java类名（首字母大写）
${classname}          ## Java类名（首字母小写）
${BusinessName}       ## 业务名（首字母大写）
${businessName}       ## 业务名（首字母小写）

## 包和路径信息
${packageName}        ## 包名
${moduleName}         ## 模块名
${frontendPath}       ## 前端路径
${componentPath}      ## 组件路径

## 功能信息
${functionName}       ## 功能名称
${author}            ## 作者
${datetime}          ## 生成时间

## 表结构信息
${pkColumn}          ## 主键列信息
${columns}           ## 所有列信息
${importList}        ## 需要导入的包列表

## 权限信息
${permissionPrefix}  ## 权限前缀

## 字典信息
${dicts}            ## 字典类型列表

## 树形结构（tree模板）
${treeCode}         ## 树编码字段
${treeParentCode}   ## 树父编码字段
${treeName}         ## 树名称字段

## 主子表（sub模板）
${subTable}         ## 子表信息
${subTableName}     ## 子表名
${subTableFkName}   ## 子表外键名
```

#### 3. 自定义模板示例（四层架构）

框架生成的代码遵循 Controller-Service-DAO-Mapper 四层架构：**查询条件在 DAO 层的 `buildQueryWrapper` 中构建**，Service 层不继承任何基类、只注入 DAO 处理业务。自定义模板时应遵循同样的分层。

自定义 DAOImpl 模板（查询条件构建）：

```java
package ${packageName}.dao.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import plus.ruoyi.common.mybatis.core.dao.impl.BaseDaoImpl;
import plus.ruoyi.common.mybatis.core.query.PlusLambdaQuery;
import ${packageName}.domain.entity.${ClassName};
import ${packageName}.domain.bo.${ClassName}Bo;
import ${packageName}.mapper.${ClassName}Mapper;
import ${packageName}.dao.I${ClassName}Dao;

import java.util.Map;

/**
 * ${functionName} DAO 实现（仅继承 BaseDaoImpl，专注数据访问与查询构建）
 *
 * @author ${author}
 * @date ${datetime}
 */
@Slf4j
@Repository
public class ${ClassName}DaoImpl extends BaseDaoImpl<${ClassName}Mapper, ${ClassName}> implements I${ClassName}Dao {

    /**
     * 构建查询条件（统一在 DAO 层，自动处理 null 判断）
     */
    @Override
    public PlusLambdaQuery<${ClassName}> buildQueryWrapper(${ClassName}Bo bo) {
        Map<String, Object> params = bo.getParams();
        PlusLambdaQuery<${ClassName}> lqw = PlusLambdaQuery.of();
#foreach($column in $columns)
#if($column.query)
#if($column.queryType == "EQ")
        lqw.eq(bo.get${column.capJavaField}() != null, ${ClassName}::get${column.capJavaField}, bo.get${column.capJavaField}());
#elseif($column.queryType == "LIKE")
        lqw.like(bo.get${column.capJavaField}() != null, ${ClassName}::get${column.capJavaField}, bo.get${column.capJavaField}());
#elseif($column.queryType == "BETWEEN")
        lqw.between(params.get("begin${column.capJavaField}") != null,
            ${ClassName}::get${column.capJavaField},
            params.get("begin${column.capJavaField}"),
            params.get("end${column.capJavaField}"));
#end
#end
#end
        return lqw;
    }
}
```

自定义 ServiceImpl 模板（业务处理，注入 DAO，不继承基类）：

```java
@Service
@RequiredArgsConstructor
public class ${ClassName}ServiceImpl implements I${ClassName}Service {

    private final I${ClassName}Dao ${classname}Dao;

    /**
     * 新增：可在此加入自定义业务校验
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ${pkColumn.javaType} add(${ClassName}Bo bo) {
        validateBusinessRules(bo);
        ${ClassName} entity = MapstructUtils.convert(bo, ${ClassName}.class);
        ${classname}Dao.insert(entity);
        return entity.get${pkColumn.capJavaField}();
    }

    /** 业务规则校验 */
    private void validateBusinessRules(${ClassName}Bo bo) {
        // TODO: 实现具体的业务校验逻辑
    }
}
```

### Docker集成

```dockerfile
# Dockerfile.generator
FROM openjdk:17-jre-slim

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制应用程序
COPY target/ruoyi-generator.jar app.jar
COPY templates/ templates/

# 环境变量
ENV JAVA_OPTS="-Xms512m -Xmx1024m"
ENV SPRING_PROFILES_ACTIVE=docker

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```text

```yaml
# docker-compose.yml
version: '3.8'

services:
  ruoyi-generator:
    build:
      context: .
      dockerfile: Dockerfile.generator
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/ruoyi
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=password
    depends_on:
      - mysql
      - redis
    volumes:
      - ./generated-code:/app/generated-code
      - ./custom-templates:/app/custom-templates
    networks:
      - generator-network

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=ruoyi
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - generator-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - generator-network

volumes:
  mysql_data:

networks:
  generator-network:
    driver: bridge
```text

## 安全配置

### 权限控制配置

```java
/**
 * 代码生成器安全配置
 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class GeneratorSecurityConfig {
    
    /**
     * 代码生成权限验证器
     */
    @Bean
    public CodeGenerationPermissionEvaluator permissionEvaluator() {
        return new CodeGenerationPermissionEvaluator();
    }
    
    /**
     * 安全拦截器
     */
    @Bean
    public CodeGenerationSecurityInterceptor securityInterceptor() {
        return new CodeGenerationSecurityInterceptor();
    }
}

/**
 * 权限验证器
 */
public class CodeGenerationPermissionEvaluator {
    
    /**
     * 验证用户是否有权限操作指定表
     */
    public boolean hasTablePermission(String userId, String dataSource, String tableName) {
        // 检查用户是否有访问指定数据源的权限
        if (!hasDataSourcePermission(userId, dataSource)) {
            return false;
        }
        
        // 检查表级别权限
        return hasSpecificTablePermission(userId, tableName);
    }
    
    /**
     * 验证代码生成权限
     */
    public boolean hasGeneratePermission(String userId, GenTable genTable) {
        // 检查基础权限
        if (!hasTablePermission(userId, genTable.getDataName(), genTable.getTableName())) {
            return false;
        }
        
        // 检查敏感表保护
        if (isSensitiveTable(genTable.getTableName())) {
            return hasAdminPermission(userId);
        }
        
        return true;
    }
    
    private boolean isSensitiveTable(String tableName) {
        List<String> sensitiveTables = Arrays.asList(
            "sys_user", "sys_role", "sys_permission", 
            "sys_config", "financial_", "salary_"
        );
        
        return sensitiveTables.stream()
            .anyMatch(pattern -> tableName.toLowerCase().startsWith(pattern.toLowerCase()));
    }
}
```text

### 代码生成审计

```java
/**
 * 代码生成审计服务
 */
@Service
public class CodeGenerationAuditService {
    
    /**
     * 记录代码生成操作
     */
    @EventListener
    public void handleCodeGenerationEvent(CodeGenerationEvent event) {
        GenerationAuditLog log = new GenerationAuditLog();
        log.setUserId(event.getUserId());
        log.setUserName(event.getUserName());
        log.setTableName(event.getTableName());
        log.setDataSource(event.getDataSource());
        log.setOperationType(event.getOperationType());
        log.setGenerationConfig(JsonUtils.toJsonString(event.getConfig()));
        log.setGeneratedFiles(event.getGeneratedFiles());
        log.setCreateTime(new Date());
        log.setStatus(event.isSuccess() ? "SUCCESS" : "FAILED");
        log.setErrorMessage(event.getErrorMessage());
        
        // 保存审计日志
        saveAuditLog(log);
        
        // 发送通知（如果配置了）
        if (shouldSendNotification(event)) {
            sendNotification(log);
        }
    }
    
    /**
     * 查询审计日志
     */
    public PageResult<GenerationAuditLog> queryAuditLogs(AuditLogQuery query) {
        return auditLogMapper.selectPage(query);
    }
    
    /**
     * 导出审计报告
     */
    public byte[] exportAuditReport(Date startDate, Date endDate) {
        List<GenerationAuditLog> logs = auditLogMapper.selectByDateRange(startDate, endDate);
        return generateAuditReport(logs);
    }
}
```text

### 敏感信息保护

```java
/**
 * 敏感信息保护配置
 */
@Configuration
public class SensitiveDataProtectionConfig {
    
    /**
     * 敏感字段处理器
     */
    @Bean
    public SensitiveFieldProcessor sensitiveFieldProcessor() {
        return new SensitiveFieldProcessor();
    }
}

/**
 * 敏感字段处理器
 */
public class SensitiveFieldProcessor {
    
    private final List<String> sensitiveFields = Arrays.asList(
        "password", "pwd", "secret", "token", 
        "phone", "mobile", "email", "identity_card",
        "bank_account", "credit_card", "salary"
    );
    
    /**
     * 处理敏感字段
     */
    public void processSensitiveFields(GenTable genTable) {
        genTable.getColumns().forEach(column -> {
            if (isSensitiveField(column)) {
                // 标记为敏感字段
                column.setSensitive(true);
                
                // 设置特殊处理规则
                if (isPasswordField(column)) {
                    column.setHtmlType("password");
                    column.setIsQuery("0"); // 密码字段不参与查询
                }
                
                // 在生成的代码中添加脱敏处理
                addDesensitizationAnnotation(column);
            }
        });
    }
    
    private boolean isSensitiveField(GenTableColumn column) {
        String fieldName = column.getColumnName().toLowerCase();
        String comment = column.getColumnComment().toLowerCase();
        
        return sensitiveFields.stream().anyMatch(sensitive -> 
            fieldName.contains(sensitive) || comment.contains(getChineseMapping(sensitive))
        );
    }
    
    private void addDesensitizationAnnotation(GenTableColumn column) {
        // 在生成代码时添加脱敏注解
        String fieldName = column.getColumnName().toLowerCase();
        
        if (fieldName.contains("phone") || fieldName.contains("mobile")) {
            column.setDesensitizeType("MOBILE_PHONE");
        } else if (fieldName.contains("email")) {
            column.setDesensitizeType("EMAIL");
        } else if (fieldName.contains("identity_card")) {
            column.setDesensitizeType("ID_CARD");
        } else {
            column.setDesensitizeType("DEFAULT");
        }
    }
}
```text

## 监控和运维配置

### 性能监控

```java
/**
 * 代码生成性能监控配置
 */
@Configuration
public class GeneratorMonitoringConfig {
    
    /**
     * 性能监控切面
     */
    @Bean
    public GeneratorPerformanceAspect generatorPerformanceAspect() {
        return new GeneratorPerformanceAspect();
    }
    
    /**
     * 自定义指标注册
     */
    @Bean
    public MeterRegistry generatorMeterRegistry() {
        return new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
    }
}

/**
 * 性能监控切面
 */
@Aspect
@Component
public class GeneratorPerformanceAspect {
    
    private final Counter generationCounter;
    private final Timer generationTimer;
    private final Gauge activeGenerations;
    
    public GeneratorPerformanceAspect(MeterRegistry meterRegistry) {
        this.generationCounter = Counter.builder("generator.code.generation.total")
            .description("Total number of code generations")
            .register(meterRegistry);
            
        this.generationTimer = Timer.builder("generator.code.generation.duration")
            .description("Code generation duration")
            .register(meterRegistry);
            
        this.activeGenerations = Gauge.builder("generator.code.generation.active")
            .description("Active code generations")
            .register(meterRegistry, this, GeneratorPerformanceAspect::getActiveGenerations);
    }
    
    @Around("@annotation(GeneratorMonitored)")
    public Object monitorPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        Timer.Sample sample = Timer.start();
        
        try {
            Object result = joinPoint.proceed();
            generationCounter.increment("status", "success");
            return result;
        } catch (Exception e) {
            generationCounter.increment("status", "failure");
            throw e;
        } finally {
            sample.stop(generationTimer);
        }
    }
    
    private double getActiveGenerations() {
        // 返回当前活跃的代码生成任务数
        return ThreadPoolTaskExecutor.getActiveCount();
    }
}
```text

### 健康检查配置

```java
/**
 * 代码生成器健康检查
 */
@Component
public class GeneratorHealthIndicator implements HealthIndicator {
    
    private final GenTableService genTableService;
    private final DataSourceManagerService dataSourceManagerService;
    
    @Override
    public Health health() {
        Health.Builder builder = Health.up();
        
        try {
            // 检查数据库连接
            checkDatabaseConnection(builder);
            
            // 检查模板可用性
            checkTemplateAvailability(builder);
            
            // 检查缓存状态
            checkCacheStatus(builder);
            
            // 检查磁盘空间
            checkDiskSpace(builder);
            
        } catch (Exception e) {
            return Health.down()
                .withException(e)
                .build();
        }
        
        return builder.build();
    }
    
    private void checkDatabaseConnection(Health.Builder builder) {
        List<String> dataSourceNames = dataSourceManagerService.getAllDataSourceNames();
        Map<String, String> dbStatus = new HashMap<>();
        
        for (String name : dataSourceNames) {
            try {
                boolean connected = dataSourceManagerService.testConnection(name);
                dbStatus.put(name, connected ? "UP" : "DOWN");
            } catch (Exception e) {
                dbStatus.put(name, "ERROR: " + e.getMessage());
            }
        }
        
        builder.withDetail("databases", dbStatus);
    }
    
    private void checkTemplateAvailability(Health.Builder builder) {
        Map<String, Boolean> templateStatus = new HashMap<>();
        
        List<String> requiredTemplates = Arrays.asList(
            "vm/java/controller.java.vm",
            "vm/java/service.java.vm",
            "vm/vue/index.vue.vm"
        );
        
        for (String template : requiredTemplates) {
            try {
                boolean exists = templateExists(template);
                templateStatus.put(template, exists);
            } catch (Exception e) {
                templateStatus.put(template, false);
            }
        }
        
        builder.withDetail("templates", templateStatus);
    }
    
    private void checkCacheStatus(Health.Builder builder) {
        try {
            // 检查Redis连接
            RedisTemplate<String, Object> redisTemplate = SpringUtils.getBean(RedisTemplate.class);
            String pong = redisTemplate.getConnectionFactory().getConnection().ping();
            builder.withDetail("cache", "UP - " + pong);
        } catch (Exception e) {
            builder.withDetail("cache", "DOWN - " + e.getMessage());
        }
    }
    
    private void checkDiskSpace(Health.Builder builder) {
        File tempDir = new File(System.getProperty("java.io.tmpdir"));
        long freeSpace = tempDir.getFreeSpace();
        long totalSpace = tempDir.getTotalSpace();
        double usagePercentage = (double) (totalSpace - freeSpace) / totalSpace * 100;
        
        builder.withDetail("diskSpace", Map.of(
            "total", FileUtils.byteCountToDisplaySize(totalSpace),
            "free", FileUtils.byteCountToDisplaySize(freeSpace),
            "usage", String.format("%.2f%%", usagePercentage)
        ));
        
        if (usagePercentage > 90) {
            builder.down().withDetail("diskSpaceWarning", "Disk usage is above 90%");
        }
    }
}
```text

### 日志配置

```yaml
# logback-spring.xml
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    
    <!-- 代码生成器专用日志配置 -->
    <appender name="GENERATOR" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/generator.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/generator.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level [%logger{36}] - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 审计日志 -->
    <appender name="AUDIT" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/generator-audit.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/generator-audit.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>365</maxHistory>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
            <providers>
                <timestamp/>
                <logLevel/>
                <loggerName/>
                <message/>
                <mdc/>
                <arguments/>
            </providers>
        </encoder>
    </appender>
    
    <!-- 性能日志 -->
    <appender name="PERFORMANCE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/generator-performance.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/generator-performance.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 日志记录器配置 -->
    <logger name="plus.ruoyi.generator" level="INFO" additivity="false">
        <appender-ref ref="GENERATOR"/>
        <appender-ref ref="CONSOLE"/>
    </logger>
    
    <logger name="plus.ruoyi.generator.audit" level="INFO" additivity="false">
        <appender-ref ref="AUDIT"/>
    </logger>
    
    <logger name="plus.ruoyi.generator.performance" level="INFO" additivity="false">
        <appender-ref ref="PERFORMANCE"/>
    </logger>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```text

## 配置最佳实践

### 环境隔离配置

```yaml
# application-dev.yml (开发环境)
spring:
  datasource:
    dynamic:
      datasource:
        master:
          url: jdbc:mysql://dev-mysql:3306/ruoyi_dev
          username: dev_user
          password: dev_password

generator:
  config:
    author: "Dev Team"
    outputPath: "/tmp/generated-code"
    enableCache: false
    enableAudit: false
  security:
    enablePermissionCheck: false
    sensitiveDataProtection: false

---
# application-test.yml (测试环境)  
spring:
  datasource:
    dynamic:
      datasource:
        master:
          url: jdbc:mysql://test-mysql:3306/ruoyi_test
          username: test_user
          password: test_password

generator:
  config:
    author: "Test Team"
    outputPath: "/app/generated-code"
    enableCache: true
    enableAudit: true
  security:
    enablePermissionCheck: true
    sensitiveDataProtection: true

---
# application-prod.yml (生产环境)
spring:
  datasource:
    dynamic:
      datasource:
        master:
          url: jdbc:mysql://prod-mysql:3306/ruoyi_prod
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}

generator:
  config:
    author: "Production Team" 
    outputPath: "/data/generated-code"
    enableCache: true
    enableAudit: true
    auditRetentionDays: 365
  security:
    enablePermissionCheck: true
    sensitiveDataProtection: true
    requireApproval: true
  performance:
    maxConcurrentGenerations: 5
    timeoutSeconds: 300
```text

### 配置验证

```java
/**
 * 配置验证器
 */
@Component
@ConfigurationProperties(prefix = "generator")
@Validated
public class GeneratorProperties {
    
    @Valid
    private ConfigProperties config = new ConfigProperties();
    
    @Valid 
    private SecurityProperties security = new SecurityProperties();
    
    @Valid
    private PerformanceProperties performance = new PerformanceProperties();
    
    @Data
    @Validated
    public static class ConfigProperties {
        
        @NotBlank(message = "作者信息不能为空")
        private String author;
        
        @NotBlank(message = "输出路径不能为空")
        private String outputPath;
        
        private boolean enableCache = true;
        private boolean enableAudit = true;
        
        @Min(value = 1, message = "审计日志保留天数不能小于1")
        @Max(value = 3650, message = "审计日志保留天数不能大于3650")
        private int auditRetentionDays = 90;
    }
    
    @Data
    @Validated
    public static class SecurityProperties {
        private boolean enablePermissionCheck = true;
        private boolean sensitiveDataProtection = true;
        private boolean requireApproval = false;
        
        @Size(min = 1, message = "至少需要配置一个管理员")
        private List<String> administrators = new ArrayList<>();
    }
    
    @Data
    @Validated
    public static class PerformanceProperties {
        
        @Min(value = 1, message = "最大并发生成数不能小于1")
        @Max(value = 50, message = "最大并发生成数不能大于50")
        private int maxConcurrentGenerations = 10;
        
        @Min(value = 30, message = "超时时间不能小于30秒")
        @Max(value = 3600, message = "超时时间不能大于1小时")
        private int timeoutSeconds = 300;
        
        @Min(value = 100, message = "缓存大小不能小于100")
        private int cacheSize = 1000;
    }
    
    /**
     * 配置后置处理
     */
    @PostConstruct
    public void validateConfiguration() {
        // 验证输出路径是否可写
        File outputDir = new File(config.getOutputPath());
        if (!outputDir.exists() && !outputDir.mkdirs()) {
            throw new IllegalStateException("无法创建输出目录: " + config.getOutputPath());
        }
        
        if (!outputDir.canWrite()) {
            throw new IllegalStateException("输出目录不可写: " + config.getOutputPath());
        }
        
        // 验证管理员配置
        if (security.isRequireApproval() && security.getAdministrators().isEmpty()) {
            throw new IllegalStateException("启用审批模式时必须配置管理员");
        }
    }
}
```text

### 配置热更新

```java
/**
 * 配置热更新支持
 */
@Component
public class GeneratorConfigurationRefresher {
    
    private final GeneratorProperties properties;
    private final ApplicationEventPublisher eventPublisher;
    
    /**
     * 监听配置变更事件
     */
    @EventListener
    public void handleConfigurationRefresh(RefreshScopeRefreshedEvent event) {
        log.info("检测到配置刷新事件，重新加载代码生成器配置");
        
        // 清除缓存
        clearCaches();
        
        // 重新验证配置
        validateConfiguration();
        
        // 发布配置更新事件
        eventPublisher.publishEvent(new GeneratorConfigurationUpdatedEvent(properties));
    }
    
    /**
     * 手动刷新配置
     */
    public void refreshConfiguration() {
        RefreshScope refreshScope = SpringUtils.getBean(RefreshScope.class);
        refreshScope.refreshAll();
    }
    
    private void clearCaches() {
        CacheManager cacheManager = SpringUtils.getBean("generatorCacheManager", CacheManager.class);
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        });
    }
}
```text

## 故障排除

### 常见问题诊断

```java
/**
 * 代码生成器诊断工具
 */
@RestController
@RequestMapping("/tool/gen/diagnostic")
public class GeneratorDiagnosticController {
    
    /**
     * 系统诊断
     */
    @GetMapping("/system")
    public R<Map<String, Object>> systemDiagnostic() {
        Map<String, Object> diagnostic = new HashMap<>();
        
        // JVM信息
        diagnostic.put("jvm", getJvmInfo());
        
        // 数据源状态
        diagnostic.put("datasources", getDatasourceStatus());
        
        // 模板状态
        diagnostic.put("templates", getTemplateStatus());
        
        // 缓存状态
        diagnostic.put("cache", getCacheStatus());
        
        // 磁盘空间
        diagnostic.put("disk", getDiskSpaceInfo());
        
        return R.ok(diagnostic);
    }
    
    /**
     * 连接测试
     */
    @PostMapping("/connection/test")
    public R<String> testConnection(@RequestBody DataSourceConfig config) {
        try {
            boolean connected = testDatabaseConnection(config);
            return connected ? R.ok("连接成功") : R.fail("连接失败");
        } catch (Exception e) {
            return R.fail("连接异常: " + e.getMessage());
        }
    }
    
    /**
     * 模板验证
     */
    @PostMapping("/template/validate")
    public R<Map<String, Object>> validateTemplate(@RequestParam String templatePath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 检查模板文件是否存在
            boolean exists = templateExists(templatePath);
            result.put("exists", exists);
            
            if (exists) {
                // 语法验证
                boolean syntaxValid = validateTemplateSyntax(templatePath);
                result.put("syntaxValid", syntaxValid);
                
                // 获取模板变量
                List<String> variables = extractTemplateVariables(templatePath);
                result.put("variables", variables);
            }
            
            return R.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return R.fail(result);
        }
    }
    
    /**
     * 性能报告
     */
    @GetMapping("/performance")
    public R<Map<String, Object>> getPerformanceReport() {
        Map<String, Object> report = new HashMap<>();
        
        // 生成统计
        report.put("generationStats", getGenerationStatistics());
        
        // 缓存统计
        report.put("cacheStats", getCacheStatistics());
        
        // 线程池状态
        report.put("threadPool", getThreadPoolStatus());
        
        // 内存使用
        report.put("memory", getMemoryUsage());
        
        return R.ok(report);
    }
}
```text

### 问题解决指南

| 问题类型 | 症状 | 可能原因 | 解决方案 |
|----------|------|----------|----------|
| 连接失败 | 无法获取数据库元数据 | 数据库配置错误、网络问题 | 检查数据源配置、测试网络连接 |
| 模板错误 | 代码生成失败，模板异常 | 模板语法错误、变量未定义 | 验证模板语法、检查变量引用 |
| 内存不足 | OutOfMemoryError | 大量数据同时处理 | 增加堆内存、优化查询逻辑 |
| 生成超时 | 代码生成长时间无响应 | 数据量过大、SQL执行慢 | 增加超时配置、优化数据库查询 |
| 权限拒绝 | 无法访问指定表 | 用户权限不足 | 检查用户权限配置 |
| 缓存异常 | Redis连接失败 | Redis服务不可用 | 检查Redis连接配置 |

通过本章介绍的高级配置功能，你可以根据项目需求对代码生成器进行深度定制，提升生成效率，确保代码质量，并满足企业级应用的安全和运维要求。
```

### 模板配置管理

#### 1. 模板配置文件

```yaml
# application-generator.yml
generator:
  template:
    # 模板根目录
    baseDir: "vm"
    # 自定义模板目录
    customDir: "custom-vm" 
    # 模板缓存配置
    cache:
      enabled: true
      size: 100
      ttl: 3600
  # 代码生成配置
  code:
    # 默认作者
    defaultAuthor: "Code Generator"
    # 版权信息
    copyright: "Copyright (c) 2024"
    # 代码格式化
    format:
      enabled: true
      indent: 4
```

#### 2. 模板加载器配置

```java
@Configuration
public class TemplateConfig {
    
    /**
     * 自定义模板加载器
     */
    @Bean
    public VelocityEngine velocityEngine() {
        Properties props = new Properties();
        // 设置模板路径
        props.setProperty("resource.loader.file.class", 
            "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
        // 设置编码
        props.setProperty(Velocity.INPUT_ENCODING, "UTF-8");
        props.setProperty(Velocity.OUTPUT_ENCODING, "UTF-8");
        // 设置缓存
        props.setProperty("resource.loader.file.cache", "true");
        props.setProperty("resource.loader.file.modification_check_interval", "3600");
        
        VelocityEngine engine = new VelocityEngine(props);
        engine.init();
        return engine;
    }
    
    /**
     * 自定义模板工具
     */
    @Bean
    public Map<String, Object> templateTools() {
        Map<String, Object> tools = new HashMap<>();
        tools.put("StringUtils", StringUtils.class);
        tools.put("DateUtils", DateUtils.class);
        tools.put("NumberUtils", NumberUtils.class);
        return tools;
    }
}
```

## 字段类型扩展

### 自定义字段类型处理器

```java
/**
 * 自定义字段类型处理器
 */
@Component
public class CustomFieldTypeHandler implements FieldTypeHandler {
    
    @Override
    public boolean supports(String dbType) {
        return Arrays.asList("json", "jsonb", "geometry").contains(dbType.toLowerCase());
    }
    
    @Override
    public FieldTypeInfo handle(GenTableColumn column) {
        String dbType = column.getColumnType().toLowerCase();
        FieldTypeInfo typeInfo = new FieldTypeInfo();
        
        switch (dbType) {
            case "json":
            case "jsonb":
                typeInfo.setJavaType("String");
                typeInfo.setHtmlType("textarea");
                typeInfo.setImports(Arrays.asList("com.fasterxml.jackson.annotation.JsonRawValue"));
                break;
            case "geometry":
                typeInfo.setJavaType("String");
                typeInfo.setHtmlType("input");
                break;
        }
        
        return typeInfo;
    }
}
```

### 自定义HTML控件类型

```java
/**
 * 扩展HTML控件类型
 */
public class ExtendedHtmlTypes {
    
    public static final String HTML_COLOR_PICKER = "colorPicker";
    public static final String HTML_SLIDER = "slider";
    public static final String HTML_RATE = "rate";
    public static final String HTML_SWITCH = "switch";
    
    /**
     * 根据字段特征推断HTML类型
     */
    public static String inferHtmlType(GenTableColumn column) {
        String columnName = column.getColumnName().toLowerCase();
        String comment = column.getColumnComment().toLowerCase();
        
        // 颜色字段
        if (columnName.contains("color") || comment.contains("颜色")) {
            return HTML_COLOR_PICKER;
        }
        
        // 评分字段  
        if (columnName.contains("rate") || columnName.contains("score") || 
            comment.contains("评分") || comment.contains("得分")) {
            return HTML_RATE;
        }
        
        // 开关字段
        if (columnName.startsWith("is_") || comment.contains("是否")) {
            return HTML_SWITCH;
        }
        
        return GenConstants.HTML_INPUT;
    }
}
```

## 数据源高级配置

### 多数据源配置

```yaml
spring:
  datasource:
    dynamic:
      # 主数据源
      primary: master
      # 严格模式
      strict: false
      datasource:
        # 主库
        master:
          url: jdbc:mysql://localhost:3306/ruoyi_main
          username: root
          password: password
          driver-class-name: com.mysql.cj.jdbc.Driver
        # 业务库1
        business1:
          url: jdbc:mysql://localhost:3306/business1
          username: root
          password: password
          driver-class-name: com.mysql.cj.jdbc.Driver
        # 业务库2
        business2:
          url: jdbc:postgresql://localhost:5432/business2
          username: postgres
          password: password
          driver-class-name: org.postgresql.Driver
        # Oracle库
        oracle:
          url: jdbc:oracle:thin:@localhost:1521:XE
          username: system
          password: oracle
          driver-class-name: oracle.jdbc.driver.OracleDriver
```

### 数据源动态管理

```java
/**
 * 数据源动态管理服务
 */
@Service
public class DataSourceManagerService {
    
    private final DynamicRoutingDataSource dynamicDataSource;
    
    /**
     * 添加数据源
     */
    public void addDataSource(String name, DataSourceProperty property) {
        DataSource dataSource = createDataSource(property);
        dynamicDataSource.addDataSource(name, dataSource);
    }
    
    /**
     * 移除数据源
     */
    public void removeDataSource(String name) {
        dynamicDataSource.removeDataSource(name);
    }
    
    /**
     * 测试数据源连接
     */
    public boolean testConnection(String dataSourceName) {
        try {
            DataSource dataSource = dynamicDataSource.getDataSource(dataSourceName);
            try (Connection connection = dataSource.getConnection()) {
                return connection.isValid(5000);
            }
        } catch (Exception e) {
            log.error("测试数据源连接失败: {}", dataSourceName, e);
            return false;
        }
    }
    
    /**
     * 获取数据源元数据
     */
    @DS("#dataSourceName")
    public DatabaseMetaData getDatabaseMetadata(String dataSourceName) throws SQLException {
        return DataSourceUtils.getConnection(
            dynamicDataSource.getDataSource(dataSourceName)
        ).getMetaData();
    }
}
```

### 数据库兼容性处理

```java
/**
 * 数据库兼容性处理器
 */
@Component
public class DatabaseCompatibilityHandler {
    
    /**
     * 获取数据库特定的SQL方言
     */
    public String getDialect(String dataSourceName) {
        try {
            DatabaseMetaData metaData = getDatabaseMetadata(dataSourceName);
            String productName = metaData.getDatabaseProductName().toLowerCase();
            
            if (productName.contains("mysql")) {
                return "mysql";
            } else if (productName.contains("postgresql")) {
                return "postgresql";
            } else if (productName.contains("oracle")) {
                return "oracle";
            } else if (productName.contains("sql server")) {
                return "sqlserver";
            }
            
            return "mysql"; // 默认
        } catch (SQLException e) {
            log.warn("无法获取数据库类型，使用默认MySQL方言", e);
            return "mysql";
        }
    }
    
    /**
     * 处理数据库特定的字段类型
     */
    public String mapColumnType(String originalType, String dialect) {
        Map<String, String> typeMapping = getTypeMapping(dialect);
        return typeMapping.getOrDefault(originalType.toLowerCase(), originalType);
    }
    
    private Map<String, String> getTypeMapping(String dialect) {
        switch (dialect) {
            case "postgresql":
                return Map.of(
                    "int8", "bigint",
                    "int4", "int",
                    "int2", "smallint",
                    "text", "longtext",
                    "timestamptz", "datetime"
                );
            case "oracle":
                return Map.of(
                    "number", "decimal",
                    "varchar2", "varchar",
                    "nvarchar2", "nvarchar",
                    "clob", "longtext"
                );
            case "sqlserver":
                return Map.of(
                    "ntext", "longtext",
                    "image", "longblob",
                    "datetime2", "datetime"
                );
            default:
                return Collections.emptyMap();
        }
    }
}
```

## 代码生成扩展

### 自定义代码生成器

```java
/**
 * 自定义代码生成器
 */
@Component
public class CustomCodeGenerator implements CodeGenerator {
    
    private final VelocityEngine velocityEngine;
    private final List<CodeGeneratorPlugin> plugins;
    
    @Override
    public Map<String, String> generate(GenTable genTable) {
        Map<String, String> codeMap = new HashMap<>();
        
        // 前置插件处理
        plugins.forEach(plugin -> plugin.beforeGenerate(genTable));
        
        try {
            // 准备模板上下文
            VelocityContext context = prepareContext(genTable);
            
            // 生成各类代码
            codeMap.putAll(generateBackendCode(genTable, context));
            codeMap.putAll(generateFrontendCode(genTable, context));
            codeMap.putAll(generateSqlScript(genTable, context));
            
            // 后置插件处理
            plugins.forEach(plugin -> plugin.afterGenerate(genTable, codeMap));
            
        } catch (Exception e) {
            throw new ServiceException("代码生成失败", e);
        }
        
        return codeMap;
    }
    
    /**
     * 生成后端代码
     */
    private Map<String, String> generateBackendCode(GenTable genTable, VelocityContext context) {
        Map<String, String> codeMap = new HashMap<>();
        
        List<String> templates = Arrays.asList(
            "vm/java/domain.java.vm",
            "vm/java/bo.java.vm", 
            "vm/java/vo.java.vm",
            "vm/java/mapper.java.vm",
            "vm/java/service.java.vm",
            "vm/java/serviceImpl.java.vm",
            "vm/java/controller.java.vm"
        );
        
        templates.forEach(template -> {
            String code = renderTemplate(template, context);
            codeMap.put(template, code);
        });
        
        return codeMap;
    }
    
    /**
     * 渲染模板
     */
    private String renderTemplate(String templatePath, VelocityContext context) {
        try (StringWriter writer = new StringWriter()) {
            Template template = velocityEngine.getTemplate(templatePath);
            template.merge(context, writer);
            return writer.toString();
        } catch (Exception e) {
            throw new ServiceException("模板渲染失败: " + templatePath, e);
        }
    }
}
```

### 代码生成插件系统

```java
/**
 * 代码生成插件接口
 */
public interface CodeGeneratorPlugin {
    
    /**
     * 插件名称
     */
    String getName();
    
    /**
     * 插件优先级
     */
    default int getOrder() {
        return 0;
    }
    
    /**
     * 生成前处理
     */
    void beforeGenerate(GenTable genTable);
    
    /**
     * 生成后处理
     */
    void afterGenerate(GenTable genTable, Map<String, String> codeMap);
}

/**
 * 代码格式化插件
 */
@Component
public class CodeFormatterPlugin implements CodeGeneratorPlugin {
    
    @Override
    public String getName() {
        return "CodeFormatter";
    }
    
    @Override
    public void afterGenerate(GenTable genTable, Map<String, String> codeMap) {
        codeMap.replaceAll((path, code) -> {
            if (path.endsWith(".java.vm")) {
                return formatJavaCode(code);
            } else if (path.endsWith(".vue.vm")) {
                return formatVueCode(code);
            }
            return code;
        });
    }
    
    private String formatJavaCode(String code) {
        // 使用 google-java-format 或其他格式化工具
        return code;
    }
    
    private String formatVueCode(String code) {
        // 使用 prettier 或其他格式化工具
        return code;
    }
}

/**
 * 版权信息插件
 */
@Component
public class CopyrightPlugin implements CodeGeneratorPlugin {
    
    @Override
    public String getName() {
        return "Copyright";
    }
    
    @Override
    public void afterGenerate(GenTable genTable, Map<String, String> codeMap) {
        String copyright = getCopyrightHeader();
        
        codeMap.replaceAll((path, code) -> {
            if (needsCopyright(path)) {
                return copyright + "\n" + code;
            }
            return code;
        });
    }
    
    private String getCopyrightHeader() {
        return "/*\n" +
               " * Copyright (c) " + Year.now().getValue() + " Your Company\n" +
               " * All rights reserved.\n" +
               " */";
    }
    
    private boolean needsCopyright(String path) {
        return path.endsWith(".java.vm") || path.endsWith(".ts.vm");
    }
}
```

## 性能优化配置

### 缓存配置

```java
/**
 * 代码生成缓存配置
 */
@Configuration
@EnableCaching
public class GeneratorCacheConfig {
    
    @Bean("generatorCacheManager")
    public CacheManager generatorCacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager.builder(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration(Duration.ofHours(1)));
        
        // 不同类型数据的缓存配置
        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
        configs.put("tableMetadata", cacheConfiguration(Duration.ofMinutes(30)));
        configs.put("columnMetadata", cacheConfiguration(Duration.ofMinutes(30)));
        configs.put("templates", cacheConfiguration(Duration.ofHours(2)));
        
        return builder.withInitialCacheConfigurations(configs).build();
    }
    
    private RedisCacheConfiguration cacheConfiguration(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(ttl)
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}

/**
 * 缓存服务
 */
@Service
public class GeneratorCacheService {
    
    /**
     * 缓存表元数据
     */
    @Cacheable(value = "tableMetadata", key = "#dataSource + ':' + #tableName")
    public TableMetadata getTableMetadata(String dataSource, String tableName) {
        return loadTableMetadata(dataSource, tableName);
    }
    
    /**
     * 缓存模板内容
     */
    @Cacheable(value = "templates", key = "#templatePath")
    public String getTemplate(String templatePath) {
        return loadTemplate(templatePath);
    }
    
    /**
     * 清除缓存
     */
    @CacheEvict(value = {"tableMetadata", "columnMetadata", "templates"}, allEntries = true)
    public void clearCache() {
        log.info("清除代码生成器缓存");
    }
}
```

### 异步生成配置

```java
/**
 * 异步任务配置
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean("generatorTaskExecutor")
    public TaskExecutor generatorTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("generator-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

/**
 * 异步代码生成服务
 */
@Service
public class AsyncCodeGeneratorService {
    
    /**
     * 异步生成代码
     */
    @Async("generatorTaskExecutor")
    public CompletableFuture<String> generateCodeAsync(Long tableId) {
        log.info("开始异步生成代码: tableId={}", tableId);
        
        try {
            // 生成代码逻辑
            String result = doGenerateCode(tableId);
            
            log.info("异步代码生成完成: tableId={}", tableId);
            return CompletableFuture.completedFuture(result);
            
        } catch (Exception e) {
            log.error("异步代码生成失败: tableId={}", tableId, e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * 批量异步生成
     */
    @Async("generatorTaskExecutor")
    public CompletableFuture<Map<Long, String>> batchGenerateAsync(List<Long> tableIds) {
        Map<Long, String> results = new ConcurrentHashMap<>();
        
        List<CompletableFuture<Void>> futures = tableIds.stream()
            .map(tableId -> generateCodeAsync(tableId)
                .thenAccept(result -> results.put(tableId, result)))
            .collect(Collectors.toList());
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> results);
    }
}
```

## CI/CD 集成

### Maven插件集成

```xml
<!-- pom.xml -->
<plugin>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-generator-maven-plugin</artifactId>
    <version>1.0.0</version>
    <configuration>
        <!-- 数据源配置 -->
        <dataSource>
            <url>jdbc:mysql://localhost:3306/ruoyi</url>
            <username>root</username>
            <password>password</password>
            <driver>com.mysql.cj.jdbc.Driver</driver>
        </dataSource>
        <!-- 生成配置 -->
        <generator>
            <author>Generator Plugin</author>
            <packageName>plus.ruoyi.business</packageName>
            <outputDir>${project.basedir}/src/main/java</outputDir>
            <tables>
                <table>
                    <name>sys_user</name>
                    <template>crud</template>
                </table>
            </tables>
        </generator>
    </configuration>
    <executions>
        <execution>
            <phase>generate-sources</phase>
            <goals>
                <goal>generate</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### Gradle插件集成

```text
// build.gradle
plugins {
    id 'plus.ruoyi.generator' version '1.0.0'
}

generator {
    dataSource {
        url = 'jdbc:mysql://localhost:3306/ruoyi'
        username = 'root'
        password = 'password'
        driver = 'com.mysql.cj.jdbc.Driver'
    }
    
    config {
        author = 'Generator Plugin'
        packageName = 'plus.ruoyi.business'
        outputDir = file('src/main/java')
    }
    
    tables {
        table {
            name = 'sys_user'
            template = 'crud'
        }
    }
}

// 在构建时自动生成代码
compileJava.dependsOn generateCode
```

### Jenkins集成

```groovy
pipeline {
    agent any
    
    environment {
        DB_URL = credentials('database-url')
        DB_USER = credentials('database-user')
        DB_PASS = credentials('database-password')
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/project.git'
            }
        }
        
        stage('Generate Code') {
            steps {
                script {
                    // 调用代码生成API
                    def response = httpRequest(
                        httpMode: 'POST',
                        url: "${GENERATOR_API_URL}/tool/gen/generateCodesBatch",
                        contentType: 'APPLICATION_JSON',
                        requestBody: '''
                        {
                            "tableIds": ["1", "2", "3"],
                            "outputPath": "./generated-code"
                        }
                        '''
                    )
                    
                    if (response.status != 200) {
                        error("代码生成失败: ${response.content}")
                    }
                }
            }
        }
        
        stage('Code Quality Check') {
            steps {
                // 对生成的代码进行质量检查
                sh 'mvn sonar:sonar -Dsonar.projectKey=generated-code'
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'mvn deploy'
            }
        }
    }
    
    post {
        always {
            // 清理生成的临时文件
            cleanWs()
        }
        success {
            // 发送成功通知
            emailext(
                subject: "代码生成和构建成功 - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "代码生成和构建已成功完成。",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            // 发送失败通知
            emailext(
                subject: "代码生成或构建失败 - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "代码生成或构建过程中出现错误，请检查日志。",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
