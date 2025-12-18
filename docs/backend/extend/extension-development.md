# 扩展开发指南

## 介绍

RuoYi-Plus-UniApp 扩展模块(`ruoyi-extend`)提供系统核心功能之外的独立服务组件，支持按需部署。

**核心特性:**

- **独立部署** - 扩展模块可作为独立 Spring Boot 应用运行
- **模块化设计** - 每个扩展模块都是独立的 Maven 子模块
- **企业级功能** - 集成 Spring Boot Admin、SnailJob 等开源组件

## 扩展模块概览

| 模块名称 | Artifact ID | 端口 | 功能描述 |
|---------|-------------|------|---------|
| 应用监控服务 | `ruoyi-monitor-admin` | 9090 | 基于 Spring Boot Admin 的应用监控中心 |
| 任务调度服务 | `ruoyi-snailjob-server` | 8800 | 基于 SnailJob 的分布式任务调度中心 |

### 目录结构

```
ruoyi-extend/
├── pom.xml
├── ruoyi-monitor-admin/        # 应用监控服务
│   ├── pom.xml
│   └── src/main/
│       ├── java/plus/ruoyi/monitor/admin/
│       │   ├── MonitorAdmin.java
│       │   └── config/SecurityConfig.java
│       └── resources/application.yml
└── ruoyi-snailjob-server/      # 任务调度服务
    ├── pom.xml
    └── src/main/
        ├── java/plus/ruoyi/snailjob/SnailJobServer.java
        └── resources/application.yml
```

## Monitor Admin 应用监控

### 核心功能

**监控能力:**
- 应用健康状态实时监控
- JVM 内存、线程、GC 监控
- HTTP 请求追踪和统计
- 日志实时查看和下载

**告警通知:**
- 邮件通知(服务上线/下线)
- 钉钉 Webhook 通知

### Maven 依赖

```xml
<dependencies>
    <dependency>
        <groupId>de.codecentric</groupId>
        <artifactId>spring-boot-admin-starter-server</artifactId>
    </dependency>
    <dependency>
        <groupId>de.codecentric</groupId>
        <artifactId>spring-boot-admin-starter-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
</dependencies>
```

### 启动类

```java
@EnableAdminServer
@SpringBootApplication
public class MonitorAdmin {
    public static void main(String[] args) {
        SpringApplication.run(MonitorAdmin.class, args);
    }
}
```

### 核心配置

```yaml
server:
  port: ${SERVER_PORT:9090}

spring:
  application:
    name: Spring Boot Admin
  security:
    user:
      name: ${MONITOR_USERNAME:ruoyi}
      password: ${MONITOR_PASSWORD:123456}
  boot:
    admin:
      ui:
        title: ${MONITOR_TITLE:Spring Boot Admin服务监控中心}
      context-path: /admin

management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: ALWAYS
```

### 告警通知配置

**邮件通知:**

```yaml
notify:
  mail:
    enabled: ${NOTIFY_MAIL_ENABLED:false}
    to: ${NOTIFY_MAIL_TO:admin@example.com}
    subject: ${NOTIFY_MAIL_SUBJECT:admin监控通知}
```

**钉钉 Webhook:**

```yaml
notify:
  web-hook:
    enabled: ${NOTIFY_WEBHOOK_ENABLED:false}
    type: 1
    secret: ${DINGTALK_SECRET:}
    url: ${DINGTALK_WEBHOOK_URL:}
```

## SnailJob 任务调度

### 核心功能

**任务调度:**
- 定时任务调度(Cron 表达式)
- 延时任务调度
- 任务分片执行

**重试机制:**
- 失败自动重试
- 重试策略配置
- 死信队列支持

### Maven 依赖

```xml
<dependencies>
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-server-starter</artifactId>
        <version>${snailjob.version}</version>
    </dependency>
    <dependency>
        <groupId>de.codecentric</groupId>
        <artifactId>spring-boot-admin-starter-client</artifactId>
    </dependency>
</dependencies>
```

### 启动类

```java
@SpringBootApplication
public class SnailJobServer {
    public static void main(String[] args) {
        SpringApplication.run(
            com.aizuda.snailjob.server.SnailJobServerApplication.class, args);
    }
}
```

### 核心配置

```yaml
server:
  port: ${SERVER_PORT:8800}
  servlet:
    context-path: /snail-job

spring:
  application:
    name: ruoyi-snailjob-server
  web:
    resources:
      static-locations: classpath:admin/

mybatis-plus:
  global-config:
    db-config:
      logic-delete-value: 1
      logic-not-delete-value: 0

management:
  endpoints:
    web:
      exposure:
        include: '*'
```

## 开发新扩展模块

### 1. 添加 Maven 模块

在 `ruoyi-extend/pom.xml` 中:

```xml
<modules>
    <module>ruoyi-monitor-admin</module>
    <module>ruoyi-snailjob-server</module>
    <module>ruoyi-your-extension</module>
</modules>
```

### 2. POM 配置

```xml
<project>
    <parent>
        <artifactId>ruoyi-extend</artifactId>
        <groupId>plus.ruoyi</groupId>
        <version>${revision}</version>
    </parent>
    <artifactId>ruoyi-your-extension</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>de.codecentric</groupId>
            <artifactId>spring-boot-admin-starter-client</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 3. 启动类

```java
@SpringBootApplication
public class YourExtensionApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourExtensionApplication.class, args);
    }
}
```

### 4. 配置文件

```yaml
server:
  port: ${SERVER_PORT:8080}

spring:
  application:
    name: ruoyi-your-extension

management:
  endpoints:
    web:
      exposure:
        include: '*'

# 注册到 Monitor Admin
spring.boot.admin.client:
  enabled: true
  url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
  username: ${MONITOR_USERNAME:ruoyi}
  password: ${MONITOR_PASSWORD:123456}
```

## 部署指南

### 本地开发

```bash
# 编译打包
mvn clean package -DskipTests

# 启动 Monitor Admin
java -jar ruoyi-monitor-admin.jar
# 访问: http://localhost:9090/admin

# 启动 SnailJob Server
java -jar ruoyi-snailjob-server.jar
# 访问: http://localhost:8800/snail-job
```

### Docker 部署

**Monitor Admin Dockerfile:**

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY ruoyi-monitor-admin.jar app.jar
EXPOSE 9090
ENV SERVER_PORT=9090
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  monitor-admin:
    image: ruoyi/monitor-admin:latest
    ports:
      - "9090:9090"
    environment:
      - MONITOR_USERNAME=admin
      - MONITOR_PASSWORD=admin123
    restart: unless-stopped

  snailjob-server:
    image: ruoyi/snailjob-server:latest
    ports:
      - "8800:8800"
    environment:
      - MONITOR_URL=http://monitor-admin:9090/admin
    depends_on:
      - monitor-admin
```

### Systemd 服务

```ini
# /etc/systemd/system/monitor-admin.service
[Unit]
Description=Monitor Admin Service
After=network.target

[Service]
Type=simple
User=ruoyi
ExecStart=/usr/bin/java -Xms512m -Xmx1024m -jar /opt/ruoyi/monitor-admin/ruoyi-monitor-admin.jar
Environment="SERVER_PORT=9090"
Environment="MONITOR_USERNAME=admin"
Environment="MONITOR_PASSWORD=your_password"
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

服务管理:

```bash
sudo systemctl daemon-reload
sudo systemctl start monitor-admin
sudo systemctl enable monitor-admin
sudo systemctl status monitor-admin
```

### Nginx 反向代理

```nginx
server {
    listen 443 ssl http2;
    server_name monitor.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /admin {
        proxy_pass http://localhost:9090/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 环境变量参考

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SERVER_PORT` | 服务端口 | 9090/8800 |
| `MONITOR_USERNAME` | 监控中心用户名 | ruoyi |
| `MONITOR_PASSWORD` | 监控中心密码 | 123456 |
| `MONITOR_URL` | 监控中心地址 | http://127.0.0.1:9090/admin |
| `NOTIFY_MAIL_ENABLED` | 启用邮件通知 | false |
| `NOTIFY_WEBHOOK_ENABLED` | 启用 Webhook 通知 | false |
| `LOG_LEVEL` | 日志级别 | info |

## 最佳实践

### 1. 安全加固

```bash
# 修改默认密码
export MONITOR_USERNAME=your_username
export MONITOR_PASSWORD=your_secure_password
```

### 2. JVM 调优

```bash
java -Xms512m -Xmx1024m \
     -XX:+UseG1GC \
     -XX:+HeapDumpOnOutOfMemoryError \
     -jar ruoyi-monitor-admin.jar
```

### 3. 日志管理

```yaml
logging:
  level:
    org.springframework.boot.admin: warn
    com.aizuda.snailjob: info
```

## 常见问题

### 1. Monitor Admin 无法访问

**检查项:**
- 服务是否正常启动
- 端口是否被占用
- 防火墙是否开放端口

```bash
netstat -tlnp | grep 9090
sudo firewall-cmd --add-port=9090/tcp --permanent
```

### 2. 应用注册失败

**检查配置:**

```yaml
spring.boot.admin.client:
  url: http://localhost:9090/admin  # 确保地址正确
  username: ruoyi  # 与服务端一致
  password: 123456  # 与服务端一致

management:
  endpoints:
    web:
      exposure:
        include: '*'  # 暴露端点
```

### 3. 邮件通知失败

**常见邮箱配置:**

```yaml
spring:
  mail:
    host: smtp.qq.com
    port: 587
    username: your-email@qq.com
    password: your-auth-code  # 授权码
```

### 4. 端口冲突

```bash
# 查找占用进程
lsof -i:9090
kill -9 <PID>

# 或修改端口
java -jar app.jar --server.port=9091
```

### 5. 内存溢出

```bash
java -Xms1024m -Xmx2048m \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=./logs/heapdump.hprof \
     -jar ruoyi-snailjob-server.jar
```

## 总结

扩展模块核心要点:

1. **Monitor Admin** - 端口 9090，Spring Boot Admin 监控中心
2. **SnailJob Server** - 端口 8800，分布式任务调度中心
3. **独立部署** - 每个模块可独立打包运行
4. **监控集成** - 通过 Admin Client 注册到监控中心
5. **环境变量** - 支持通过环境变量覆盖配置
