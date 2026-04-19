# 启动与部署

## 主启动类

### RuoyiPlus.java

`RuoyiPlus` 是应用程序的主入口类，负责初始化 Spring Boot 应用上下文并启动服务。

```java
@SpringBootApplication
public class RuoyiPlus {

    public static void main(String[] args) {
        // 创建Spring应用实例
        SpringApplication application = new SpringApplication(RuoyiPlus.class);

        // 配置启动性能监控（缓冲区大小2048）
        application.setApplicationStartup(new BufferingApplicationStartup(2048));

        // 启动应用
        application.run(args);

        // 等待组件就绪后输出启动信息
        ThreadUtil.sleep(1000);
        System.out.println(StringUtils.format(
            "\n(✨◠‿◠)ﾉ♪♫ {} 启动成功！环境: {} 地址: http://127.0.0.1:{}{}\n",
            SpringUtils.getApplicationName(),
            Arrays.toString(SpringUtils.getActiveProfiles()),
            SpringUtils.getProperty("server.port"),
            SpringUtils.getProperty("server.servlet.context-path")));
    }
}
```

### 启动流程解析

1. **创建应用实例** - 基于 `RuoyiPlus.class` 创建 SpringApplication
2. **配置性能监控** - 设置 `BufferingApplicationStartup`，缓冲区大小为2048，用于收集启动性能指标
3. **初始化上下文** - 执行 `application.run()`，完成所有 Bean 的创建、自动配置和依赖注入
4. **等待就绪** - 等待1秒确保所有组件完全就绪
5. **输出启动信息** - 打印应用名称、激活环境、服务地址等信息

### BufferingApplicationStartup

`BufferingApplicationStartup` 是 Spring Boot 提供的启动性能监控工具：

- **作用**：收集应用启动过程中的性能指标
- **缓冲区大小**：2048 表示最多记录2048个启动步骤
- **查看指标**：通过 Actuator 端点 `/actuator/startup` 查看详细启动耗时

## Servlet初始化器

### RuoyiPlusServletInitializer.java

用于支持传统 WAR 包部署到外部 Servlet 容器（如 Tomcat、Jetty）。

```java
public class RuoyiPlusServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(RuoyiPlus.class);
    }
}
```

**工作原理：**

- 继承 `SpringBootServletInitializer` 使应用支持 WAR 包部署
- 重写 `configure` 方法指定主启动类
- 当应用部署到外部 Servlet 容器时，容器会调用此类而非 `main` 方法

## 启动参数配置

### 基本启动参数

```bash
# 指定端口
java -jar ruoyi-admin.jar --server.port=8080

# 指定环境
java -jar ruoyi-admin.jar --spring.profiles.active=prod

# 指定配置文件位置
java -jar ruoyi-admin.jar --spring.config.location=/opt/config/

# 组合使用
java -jar ruoyi-admin.jar \
  --spring.profiles.active=prod \
  --server.port=8080 \
  --spring.config.location=/opt/config/
```

### JVM参数建议

#### 开发环境

```bash
java -Xms512m -Xmx1024m \
     -XX:+UseG1GC \
     -jar ruoyi-admin.jar
```

#### 生产环境（JDK 17）

```bash
java -Xms2g -Xmx4g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/ruoyi/heapdump.hprof \
     -jar ruoyi-admin.jar --spring.profiles.active=prod
```

#### 生产环境（JDK 21 虚拟线程）

```bash
java -Xms2g -Xmx4g \
     -XX:+UseZGC \
     -XX:+ZGenerational \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/ruoyi/heapdump.hprof \
     -jar ruoyi-admin.jar --spring.profiles.active=prod
```

### JVM参数说明

| 参数 | 说明 |
|------|------|
| -Xms | 初始堆内存大小 |
| -Xmx | 最大堆内存大小 |
| -XX:+UseG1GC | 使用G1垃圾收集器（JDK17推荐） |
| -XX:+UseZGC | 使用ZGC垃圾收集器（JDK21推荐，低延迟） |
| -XX:MaxGCPauseMillis | 最大GC停顿时间目标 |
| -XX:+HeapDumpOnOutOfMemoryError | OOM时自动导出堆转储 |
| -XX:HeapDumpPath | 堆转储文件保存路径 |

## JAR包部署

### 构建JAR包

```bash
# 开发环境构建
mvn clean package -DskipTests

# 生产环境构建
mvn clean package -Pprod -DskipTests
```

构建完成后，JAR包位于 `ruoyi-admin/target/ryplus_uni_workflow.jar`

### 直接启动

```bash
# 前台启动
java -jar ryplus_uni_workflow.jar

# 后台启动（Linux）
nohup java -jar ryplus_uni_workflow.jar > /dev/null 2>&1 &

# 后台启动（指定日志文件）
nohup java -jar ryplus_uni_workflow.jar > app.log 2>&1 &
```

### Systemd服务（推荐）

创建服务文件 `/etc/systemd/system/ruoyi.service`：

```ini
[Unit]
Description=RuoYi-Plus Application
After=network.target mysql.service redis.service

[Service]
Type=simple
User=ruoyi
Group=ruoyi
WorkingDirectory=/opt/ruoyi
ExecStart=/usr/bin/java -Xms2g -Xmx4g -jar /opt/ruoyi/ryplus_uni_workflow.jar --spring.profiles.active=prod
ExecStop=/bin/kill -SIGTERM $MAINPID
Restart=on-failure
RestartSec=10

# 环境变量
Environment="DB_HOST=127.0.0.1"
Environment="DB_PASSWORD=your_password"
Environment="REDIS_HOST=127.0.0.1"
Environment="REDIS_PASSWORD=your_redis_password"

[Install]
WantedBy=multi-user.target
```

服务管理命令：

```bash
# 重新加载配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start ruoyi

# 停止服务
sudo systemctl stop ruoyi

# 重启服务
sudo systemctl restart ruoyi

# 查看状态
sudo systemctl status ruoyi

# 开机自启
sudo systemctl enable ruoyi
```

## WAR包部署

### 修改打包方式

在 `pom.xml` 中修改打包方式：

```xml
<packaging>war</packaging>
```

### 排除内嵌容器

添加 Tomcat 排除依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-undertow</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>
```

### 构建WAR包

```bash
mvn clean package -Pprod -DskipTests
```

### 部署到Tomcat

1. 将 `ryplus_uni_workflow.war` 复制到 `$TOMCAT_HOME/webapps/`
2. 启动 Tomcat
3. 访问 `http://localhost:8080/ryplus_uni_workflow`

## Docker部署

### Dockerfile

```dockerfile
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="ruoyi"

WORKDIR /app

# 设置时区
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

# 复制JAR包
COPY target/ryplus_uni_workflow.jar app.jar

# 创建上传目录
RUN mkdir -p /ruoyi/server/upload

# 暴露端口
EXPOSE 5503

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget -q --spider http://localhost:5503/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["java", \
    "-Xms1g", "-Xmx2g", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
```

### 构建镜像

```bash
# 先构建JAR包
mvn clean package -Pprod -DskipTests

# 构建Docker镜像
docker build -t ruoyi-plus:latest .
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  ruoyi-app:
    image: ruoyi-plus:latest
    container_name: ruoyi-app
    ports:
      - "5503:5503"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=ryplus_uni_workflow
      - DB_USERNAME=root
      - DB_PASSWORD=root123456
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=redis123456
    volumes:
      - ./upload:/ruoyi/server/upload
      - ./logs:/app/logs
    depends_on:
      - mysql
      - redis
    networks:
      - ruoyi-net
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: ruoyi-mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root123456
      - MYSQL_DATABASE=ryplus_uni_workflow
    volumes:
      - mysql-data:/var/lib/mysql
      - ./sql:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    networks:
      - ruoyi-net
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: ruoyi-redis
    command: redis-server --requirepass redis123456
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - ruoyi-net
    restart: unless-stopped

volumes:
  mysql-data:
  redis-data:

networks:
  ruoyi-net:
    driver: bridge
```

### Docker Compose 命令

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f ruoyi-app

# 停止所有服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

## 环境变量清单

### 应用基础配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| SERVER_PORT | 服务端口 | 5503 | 否 |
| APP_LICENSE | 授权码 | - | 是 |
| APP_OFFLINE_LICENSE | 离线授权码 | - | 否 |
| APP_UPLOAD_PATH | 文件上传路径 | D:\download\ruoyi\uploadPath | 否 |
| APP_BASE_API | 应用基础URL | http://127.0.0.1:5503 | 否 |
| LOG_LEVEL | 日志级别 | info | 否 |

### 数据库配置

| 变量名 | 说明 | 默认值 | 必填(生产) |
|--------|------|--------|-----------|
| DB_HOST | 数据库主机 | 127.0.0.1 | ✅ |
| DB_PORT | 数据库端口 | 3306 | 否 |
| DB_NAME | 数据库名 | ryplus_uni_workflow | ✅ |
| DB_USERNAME | 数据库用户名 | root | ✅ |
| DB_PASSWORD | 数据库密码 | root | ✅ |
| DB_MAX_POOL_SIZE | 最大连接数 | 20(dev)/50(prod) | 否 |
| DB_MIN_IDLE | 最小空闲连接 | 10(dev)/20(prod) | 否 |

### 从库配置（可选）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_SLAVE_HOST | 从库主机 | 同主库 |
| DB_SLAVE_PORT | 从库端口 | 3306 |
| DB_SLAVE_NAME | 从库数据库名 | 同主库 |
| DB_SLAVE_USERNAME | 从库用户名 | 同主库 |
| DB_SLAVE_PASSWORD | 从库密码 | 同主库 |

### Redis配置

| 变量名 | 说明 | 默认值 | 必填(生产) |
|--------|------|--------|-----------|
| REDIS_HOST | Redis主机 | 127.0.0.1 | ✅ |
| REDIS_PORT | Redis端口 | 6379 | 否 |
| REDIS_DATABASE | Redis数据库索引 | 0 | 否 |
| REDIS_PASSWORD | Redis密码 | - | ✅ |
| REDIS_SSL_ENABLED | 是否启用SSL | false | 否 |

### 安全配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| JWT_SECRET_KEY | JWT签名密钥 | uDkkASPQVN5iR4eN |
| API_ENCRYPT_ENABLED | API加密开关 | true |
| API_RESPONSE_PUBLIC_KEY | API响应加密公钥 | - |
| API_REQUEST_PRIVATE_KEY | API请求解密私钥 | - |
| ENCRYPT_PASSWORD | 数据加密密钥（AES/SM4） | - |
| ENCRYPT_PUBLIC_KEY | 数据加密公钥（SM2/RSA） | - |
| ENCRYPT_PRIVATE_KEY | 数据加密私钥（SM2/RSA） | - |

### 监控配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| MONITOR_ENABLED | 监控客户端开关 | false(dev)/true(prod) |
| MONITOR_URL | 监控中心地址 | http://127.0.0.1:9090/admin |
| MONITOR_USERNAME | 监控中心用户名 | ruoyi |
| MONITOR_PASSWORD | 监控中心密码 | 123456 |

### 定时任务配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| SNAIL_JOB_ENABLED | 定时任务开关 | false(dev)/true(prod) |
| SNAIL_JOB_SERVER_HOST | 调度中心主机（⚠️ 必须带 SERVER 前缀，避免 Relaxed Binding 覆盖客户端 `snail-job.host`） | 127.0.0.1 |
| SNAIL_JOB_SERVER_PORT | 调度中心端口（同理，避免覆盖客户端 `snail-job.port`） | 17888 |
| SNAIL_JOB_TOKEN | 接入令牌 | - |

### 消息队列配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| ROCKETMQ_ENABLED | RocketMQ开关 | false |
| ROCKETMQ_NAME_SERVER | NameServer地址 | 127.0.0.1:9876 |
| MQTT_ENABLED | MQTT开关 | false |
| MQTT_IP | MQTT Broker地址 | - |
| MQTT_PORT | MQTT端口 | 1883 |

### 第三方服务配置

| 变量名 | 说明 |
|--------|------|
| MAIL_ENABLED | 邮件服务开关 |
| MAIL_HOST | SMTP服务器地址 |
| MAIL_USERNAME | 邮箱账号 |
| MAIL_PASSWORD | 邮箱密码/授权码 |
| SMS_ALI_ACCESS_KEY | 阿里云短信AccessKey |
| SMS_ALI_ACCESS_SECRET | 阿里云短信AccessSecret |
| WECHAT_MP_CLIENT_ID | 微信公众号AppID |
| WECHAT_MP_CLIENT_SECRET | 微信公众号AppSecret |

### API文档配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| SPRINGDOC_ENABLED | API文档开关 | true |

### 开放平台配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| OPEN_API_ENABLED | 开放平台开关 | false |
| OPEN_API_SECRET_KEY | AppSecret加密密钥 | - |
| OPEN_API_ACCESS_MODE | 访问控制模式 | all |
| OPEN_API_ALLOWED_ROLES | 允许访问的角色 | admin,pc_user |

## 启动检查清单

### 启动前检查

- [ ] MySQL 服务已启动且可连接
- [ ] Redis 服务已启动且可连接
- [ ] 数据库已初始化（执行 SQL 脚本）
- [ ] 授权码已配置（APP_LICENSE）
- [ ] 敏感配置已通过环境变量注入

### 启动后验证

- [ ] 应用日志无报错
- [ ] 访问 `http://localhost:5503` 有响应
- [ ] 访问 `http://localhost:5503/actuator/health` 返回 UP
- [ ] API文档可访问 `http://localhost:5503/doc.html`

### 常见启动问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 端口被占用 | 5503端口已被使用 | 修改 SERVER_PORT 或关闭占用进程 |
| 数据库连接失败 | 配置错误或服务未启动 | 检查 DB_* 环境变量配置 |
| Redis连接失败 | 配置错误或服务未启动 | 检查 REDIS_* 环境变量配置 |
| 授权码无效 | 未配置或已过期 | 前往 license.ruoyi.plus 生成新授权码 |
| 内存不足 | JVM堆内存设置过小 | 增大 -Xms 和 -Xmx 参数 |
