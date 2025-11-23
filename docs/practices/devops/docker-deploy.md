# Docker 部署最佳实践

## 概述

Docker 容器化部署是 RuoYi-Plus-UniApp 项目推荐的生产环境部署方式。通过容器化技术,可以实现应用的标准化打包、快速部署、弹性伸缩和资源隔离。本文档详细介绍从镜像构建到集群部署的完整流程。

**核心优势:**

- **环境一致性** - 开发、测试、生产环境完全一致,避免"在我机器上能运行"的问题
- **快速部署** - 容器秒级启动,支持快速扩缩容和灰度发布
- **资源隔离** - 容器级别的资源限制和隔离,提高系统稳定性
- **版本管理** - 镜像版本化管理,支持快速回滚
- **运维自动化** - 配合 Docker Compose 实现一键部署和编排

**技术栈版本:**

| 组件 | 版本 | 说明 |
|------|------|------|
| Docker Engine | 24.0+ | 容器运行时 |
| Docker Compose | 2.20+ | 容器编排工具 |
| JDK | Liberica 21.0.8 | BellSoft 官方推荐镜像 |
| MySQL | 8.0.42 | 关系型数据库 |
| Redis | 7.2.8 | 缓存服务 |
| Nginx | 1.23.4 | 反向代理和负载均衡 |
| MinIO | RELEASE.2025-04-22 | 对象存储服务 |

---

## 架构设计

### 部署架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              生产环境部署架构                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        Nginx (80/443)                               │   │
│   │                   反向代理 + SSL终结 + 负载均衡                       │   │
│   └───────────────────────────┬─────────────────────────────────────────┘   │
│                               │                                             │
│              ┌────────────────┼────────────────┐                            │
│              │                │                │                            │
│              ▼                ▼                ▼                            │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│   │ 应用实例1 (5500) │ │ 应用实例2 (5501) │ │  监控中心 (9090) │            │
│   │ ryplus_workflow  │ │ ryplus_workflow2 │ │     monitor      │            │
│   └────────┬─────────┘ └────────┬─────────┘ └──────────────────┘            │
│            │                    │                                           │
│            └────────────────────┴───────────────────┐                       │
│                                                     │                       │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────┴───────────┐            │
│   │  MySQL (3306)    │ │  Redis (6379)    │ │ SnailJob (8800)  │            │
│   │    主数据库       │ │    缓存服务       │ │   定时任务调度    │            │
│   └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                             │
│   ┌──────────────────┐                                                      │
│   │ MinIO (9000/9001)│                                                      │
│   │   对象存储服务    │                                                      │
│   └──────────────────┘                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 网络模式

项目默认使用 `host` 网络模式,容器直接使用宿主机网络栈:

**优势:**
- 网络性能最佳,无NAT转换开销
- 简化服务发现,直接使用 `127.0.0.1` 通信
- 避免端口映射配置复杂性

**注意事项:**
- 端口冲突需手动管理
- 多实例需使用不同端口
- 安全组/防火墙需放行对应端口

---

## 镜像构建

### 主应用 Dockerfile

项目使用 BellSoft Liberica JDK 官方镜像,这是 Spring 官方推荐的 JDK 发行版:

```dockerfile
# 贝尔实验室 Spring 官方推荐镜像 JDK下载地址 https://bell-sw.com/pages/downloads/
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds

LABEL maintainer="抓蛙师"

# 创建目录结构
RUN mkdir -p /ruoyi/server/logs \
    /ruoyi/server/upload \
    /ruoyi/server/temp \

WORKDIR /ruoyi/server

# 设置环境变量
ENV SERVER_PORT=8080 \
    SNAIL_PORT=28080 \
    DEBUG_PORT=5005 \
    DEBUG_ARGS="" \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    JAVA_OPTS="" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

# 暴露端口
EXPOSE ${SERVER_PORT}
# 暴露 snail job 客户端端口 用于定时任务调度中心通信
EXPOSE ${SNAIL_PORT}
# 调试端口（仅在需要时使用）
EXPOSE ${DEBUG_PORT}

# 复制应用jar包到工作目录
COPY ./target/ryplus_uni_workflow.jar /ruoyi/server/app.jar

# 使用 shell 形式的 ENTRYPOINT 以便环境变量替换
ENTRYPOINT ["sh", "-c", "cd /ruoyi/server && exec java \
    -Dserver.port=${SERVER_PORT} \
    -Dsnail-job.port=${SNAIL_PORT} \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} \
    -Duser.timezone=${TZ} \
    ${DEBUG_ARGS} \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/ruoyi/server/logs/ \
    -XX:+UseZGC \
    ${JAVA_OPTS} \
    -jar /ruoyi/server/app.jar"]
```

**关键配置说明:**

| 配置项 | 说明 |
|--------|------|
| `bellsoft/liberica-openjdk-rocky:21.0.8-cds` | 基于Rocky Linux的JDK21镜像,支持CDS加速启动 |
| `-XX:+UseZGC` | 使用ZGC垃圾回收器,低延迟高吞吐 |
| `-XX:+HeapDumpOnOutOfMemoryError` | OOM时自动生成堆转储文件 |
| `SNAIL_PORT` | SnailJob客户端通信端口 |
| `DEBUG_PORT` | 远程调试端口 |

### 构建镜像

```bash
# 1. 进入项目根目录
cd ruoyi-plus-uniapp-workflow

# 2. Maven打包
mvn clean package -DskipTests

# 3. 构建主应用镜像
cd ruoyi-admin
docker build -t ryplus_uni_workflow:5.4.1 .

# 4. 构建监控中心镜像
cd ../ruoyi-extend/ruoyi-monitor-admin
docker build -t monitor:5.4.1 .

# 5. 构建SnailJob调度服务镜像
cd ../ruoyi-snailjob-server
docker build -t snailjob:5.4.1 .

# 6. 查看构建的镜像
docker images | grep -E "ryplus|monitor|snailjob"
```

### 镜像优化技巧

**1. 多阶段构建(可选):**

```dockerfile
# 构建阶段
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds
WORKDIR /ruoyi/server
COPY --from=builder /build/target/*.jar app.jar
# ... 其他配置
```

**2. 镜像层优化:**

```dockerfile
# 合并 RUN 命令减少层数
RUN mkdir -p /ruoyi/server/logs \
    /ruoyi/server/upload \
    /ruoyi/server/temp \
    && chown -R 1000:1000 /ruoyi
```

**3. 使用 .dockerignore:**

```text
# .dockerignore
target/
!target/*.jar
*.md
.git/
.idea/
logs/
```

---

## Docker Compose 编排

### 完整部署配置

项目提供了生产级别的完整编排配置 `Complete-compose.yml`:

```yaml
services:
  # ==================== 数据库服务 ====================
  mysql:
    image: mysql:8.0.42
    container_name: mysql
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: mysql123456
      MYSQL_DATABASE: ryplus_uni_workflow
    ports:
      - "3306:3306"
    volumes:
      - /docker/mysql/data/:/var/lib/mysql/
      - /docker/mysql/conf/:/etc/mysql/conf.d/
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    privileged: true
    network_mode: "host"

  # ==================== Web服务器 ====================
  nginx-web:
    image: nginx:1.23.4
    container_name: nginx-web
    environment:
      TZ: Asia/Shanghai
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /docker/nginx/cert:/etc/nginx/cert
      - /docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf
      - /docker/nginx/html:/usr/share/nginx/html
      - /docker/nginx/log:/var/log/nginx
    privileged: true
    network_mode: "host"

  # ==================== 缓存服务 ====================
  redis:
    image: redis:7.2.8
    container_name: redis
    ports:
      - "6379:6379"
    environment:
      TZ: Asia/Shanghai
    volumes:
      - /docker/redis/conf:/redis/config:rw
      - /docker/redis/data/:/redis/data/:rw
    command: "redis-server /redis/config/redis.conf"
    privileged: true
    network_mode: "host"

  # ==================== 对象存储服务 ====================
  minio:
    image: minio/minio:RELEASE.2025-04-22T22-12-26Z
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      TZ: Asia/Shanghai
      MINIO_ROOT_USER: ruoyi
      MINIO_ROOT_PASSWORD: ruoyi123
      MINIO_COMPRESS: "off"
    volumes:
      - /docker/minio/data:/data
      - /docker/minio/config:/root/.minio/
    command: server --address ':9000' --console-address ':9001' /data
    privileged: true
    network_mode: "host"

  # ==================== 主应用服务（实例1）====================
  ryplus_uni_workflow:
    image: ryplus_uni_workflow:5.4.1
    container_name: ryplus_uni_workflow
    environment:
      # 基础配置
      TZ: Asia/Shanghai
      SERVER_PORT: 5500
      SNAIL_PORT: 25500
      SPRING_PROFILES_ACTIVE: prod
      LOG_LEVEL: info

      # 数据库配置
      DB_HOST: 127.0.0.1
      DB_PORT: 3306
      DB_NAME: ryplus_uni_workflow
      DB_USERNAME: ryplus_uni_workflow
      DB_PASSWORD: your-database-password
      DB_MAX_POOL_SIZE: 50
      DB_MIN_IDLE: 20

      # Redis配置
      REDIS_HOST: 127.0.0.1
      REDIS_PORT: 6379
      REDIS_DATABASE: 0
      REDIS_PASSWORD: ""

      # 安全配置
      JWT_SECRET_KEY: uDkkASPQVN5iR4eN
      API_ENCRYPT_ENABLED: true

      # 监控配置
      MONITOR_ENABLED: true
      MONITOR_URL: http://127.0.0.1:9090/admin
      MONITOR_USERNAME: ruoyi
      MONITOR_PASSWORD: 123456

      # 定时任务配置
      SNAIL_JOB_ENABLED: true
      SNAIL_JOB_HOST: 127.0.0.1
      SNAIL_JOB_PORT: 17888

    volumes:
      - /home/ubuntu/apps/ryplus_uni_workflow/logs/:/ruoyi/server/logs/
      - /home/ubuntu/apps/ryplus_uni_workflow/upload/:/ruoyi/server/upload/
      - /home/ubuntu/apps/ryplus_uni_workflow/temp/:/ruoyi/server/temp/
    privileged: true
    network_mode: "host"
    restart: always

  # ==================== 主应用服务（实例2 - 负载均衡）====================
  ryplus_uni_workflow2:
    image: ryplus_uni_workflow:5.4.1
    container_name: ryplus_uni_workflow2
    environment:
      TZ: Asia/Shanghai
      SERVER_PORT: 5501
      SNAIL_PORT: 25501
      # ... 其他配置与实例1相同
    volumes:
      - /home/ubuntu/apps/ryplus_uni_workflow2/logs/:/ruoyi/server/logs/
      - /home/ubuntu/apps/ryplus_uni_workflow/upload/:/ruoyi/server/upload/
    privileged: true
    network_mode: "host"
    restart: always

  # ==================== 监控中心服务 ====================
  monitor:
    image: monitor:5.4.1
    container_name: monitor
    environment:
      TZ: Asia/Shanghai
      SPRING_PROFILES_ACTIVE: prod
      SERVER_PORT: 9090
      MONITOR_USERNAME: ruoyi
      MONITOR_PASSWORD: 123456
      MONITOR_TITLE: Spring Boot Admin服务监控中心
    volumes:
      - /home/ubuntu/apps/monitor/logs/:/ruoyi/monitor/logs/
    privileged: true
    network_mode: "host"
    restart: always

  # ==================== 定时任务调度服务 ====================
  snailjob:
    image: snailjob:5.4.1
    container_name: snailjob
    environment:
      TZ: Asia/Shanghai
      SPRING_PROFILES_ACTIVE: prod
      SERVER_PORT: 8800
      SNAILJOB_SERVER_PORT: 17888
      SNAILJOB_DB_HOST: 127.0.0.1
      SNAILJOB_DB_PORT: 3306
      SNAILJOB_DB_NAME: ryplus_uni_workflow
      SNAILJOB_DB_USERNAME: ryplus_uni_workflow
      SNAILJOB_DB_PASSWORD: your-snailjob-db-password
    volumes:
      - /home/ubuntu/apps/snailjob/logs/:/ruoyi/snailjob/logs/
    privileged: true
    network_mode: "host"
    restart: always
```

### 环境变量配置详解

**数据库配置:**

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `DB_HOST` | 数据库主机 | `127.0.0.1` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_NAME` | 数据库名称 | `ryplus_uni_workflow` |
| `DB_USERNAME` | 数据库用户 | `ryplus_uni_workflow` |
| `DB_PASSWORD` | 数据库密码 | `your-password` |
| `DB_MAX_POOL_SIZE` | 最大连接数 | `50` |
| `DB_MIN_IDLE` | 最小空闲连接 | `20` |

**Redis配置:**

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `REDIS_HOST` | Redis主机 | `127.0.0.1` |
| `REDIS_PORT` | Redis端口 | `6379` |
| `REDIS_DATABASE` | 数据库索引 | `0` |
| `REDIS_PASSWORD` | 密码 | `ruoyi123` |
| `REDISSON_POOL_SIZE` | 连接池大小 | `64` |

**安全配置:**

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `JWT_SECRET_KEY` | JWT密钥 | `16位随机字符串` |
| `API_ENCRYPT_ENABLED` | API加密开关 | `true` |
| `API_RESPONSE_PUBLIC_KEY` | RSA公钥 | `Base64编码公钥` |
| `API_REQUEST_PRIVATE_KEY` | RSA私钥 | `Base64编码私钥` |

---

## Nginx 配置

### 反向代理与负载均衡

```nginx
# nginx.conf

worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # 上游服务器配置 - 负载均衡
    upstream ryplus_server {
        # IP哈希,同一客户端请求同一后端
        ip_hash;
        server 127.0.0.1:5500 weight=10;
        server 127.0.0.1:5501 weight=10;
    }

    server {
        listen       80;
        server_name  localhost;

        # 前端静态资源
        location / {
            root   /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;
        }

        # 后端API代理
        location /ryplus_uni_workflow/ {
            proxy_pass http://ryplus_server/;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header REMOTE-HOST $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # SSE/WebSocket支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # 超时配置
            proxy_connect_timeout 30s;
            proxy_send_timeout 600s;
            proxy_read_timeout 600s;

            # 禁用缓冲(SSE需要)
            proxy_buffering off;
            proxy_cache off;
        }

        # 监控中心代理
        location /admin/ {
            proxy_pass http://127.0.0.1:9090/admin/;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # SnailJob调度中心代理
        location /snail-job/ {
            proxy_pass http://127.0.0.1:8800/snail-job/;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # 禁止访问actuator端点
        location ~ ^/actuator {
            return 403;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

    # HTTPS配置(生产环境)
    # server {
    #     listen 443 ssl;
    #     server_name your-domain.com;
    #
    #     ssl_certificate /etc/nginx/cert/your-domain.pem;
    #     ssl_certificate_key /etc/nginx/cert/your-domain.key;
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #
    #     # ... 其他配置与HTTP相同
    # }
}
```

### 负载均衡策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| `ip_hash` | 同一IP访问同一后端 | 需要会话保持的场景 |
| `round_robin` | 轮询(默认) | 无状态服务 |
| `least_conn` | 最少连接 | 请求处理时间差异大 |
| `weight` | 权重 | 服务器性能不均 |

---

## 部署流程

### 1. 环境准备

```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 2. 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 3. 创建目录结构
mkdir -p /docker/{mysql/data,mysql/conf,redis/data,redis/conf,nginx/conf,nginx/html,nginx/log,nginx/cert,minio/data,minio/config}
mkdir -p /home/ubuntu/apps/{ryplus_uni_workflow,ryplus_uni_workflow2,monitor,snailjob}/{logs,upload,temp}

# 4. 设置目录权限
chown -R 1000:1000 /docker /home/ubuntu/apps
```

### 2. 配置文件准备

**Redis配置文件:**

```bash
# /docker/redis/conf/redis.conf
cat > /docker/redis/conf/redis.conf << 'EOF'
# 绑定地址
bind 0.0.0.0

# 密码设置
requirepass ruoyi123

# 持久化配置
appendonly yes
appendfsync everysec

# 快照配置
save 900 1
save 300 10
save 60 10000

# 数据目录
dir /redis/data

# 日志级别
loglevel notice

# 最大内存
maxmemory 2gb
maxmemory-policy allkeys-lru
EOF
```

**MySQL配置文件:**

```bash
# /docker/mysql/conf/my.cnf
cat > /docker/mysql/conf/my.cnf << 'EOF'
[mysqld]
# 字符集
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# 连接配置
max_connections=500
max_connect_errors=100

# 缓冲区
innodb_buffer_pool_size=1G
innodb_log_file_size=256M

# 查询缓存(MySQL 8已废弃)
# query_cache_type=0

# 慢查询日志
slow_query_log=1
slow_query_log_file=/var/lib/mysql/slow.log
long_query_time=2

# 时区
default-time-zone='+08:00'

[client]
default-character-set=utf8mb4
EOF
```

### 3. 一键部署

```bash
# 1. 进入编排目录
cd script/docker/compose

# 2. 启动所有服务
docker-compose -f Complete-compose.yml up -d

# 3. 查看服务状态
docker-compose -f Complete-compose.yml ps

# 4. 查看日志
docker-compose -f Complete-compose.yml logs -f

# 5. 查看特定服务日志
docker-compose -f Complete-compose.yml logs -f ryplus_uni_workflow
```

### 4. 服务管理

```bash
# 停止所有服务
docker-compose -f Complete-compose.yml down

# 重启特定服务
docker-compose -f Complete-compose.yml restart ryplus_uni_workflow

# 更新镜像并重启
docker-compose -f Complete-compose.yml pull
docker-compose -f Complete-compose.yml up -d

# 查看容器资源使用
docker stats

# 进入容器调试
docker exec -it ryplus_uni_workflow /bin/bash
```

---

## 数据持久化

### 卷映射策略

```yaml
volumes:
  # 日志目录 - 独立存储,便于日志收集
  - /home/ubuntu/apps/ryplus_uni_workflow/logs/:/ruoyi/server/logs/

  # 上传文件 - 多实例共享,支持集群
  - /home/ubuntu/apps/ryplus_uni_workflow/upload/:/ruoyi/server/upload/

  # 临时文件 - 独立存储,避免冲突
  - /home/ubuntu/apps/ryplus_uni_workflow/temp/:/ruoyi/server/temp/

  # 支付证书 - 多实例共享
  - /home/ubuntu/apps/wxpay/:/ruoyi/server/wxpay/
```

### 数据备份

```bash
# MySQL数据备份
docker exec mysql mysqldump -uroot -p'mysql123456' ryplus_uni_workflow > backup_$(date +%Y%m%d).sql

# Redis数据备份
docker exec redis redis-cli -a ruoyi123 BGSAVE
cp /docker/redis/data/dump.rdb /backup/redis_$(date +%Y%m%d).rdb

# MinIO数据备份
tar -czvf /backup/minio_$(date +%Y%m%d).tar.gz /docker/minio/data
```

---

## 远程调试

### 开启调试模式

**1. 修改环境变量:**

```yaml
environment:
  DEBUG_PORT: 5005
  DEBUG_ARGS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```

**2. 通过SSH隧道连接(推荐):**

```bash
# 本地执行,建立SSH隧道
ssh -L 5005:127.0.0.1:5005 user@your-server-ip

# 然后IDEA连接localhost:5005即可
```

**3. IDEA配置:**

```
Name: ryplus_uni_workflow-远程调试
Debugger mode: Attach to remote JVM
Host: localhost (使用SSH隧道)
Port: 5005
Command line arguments:
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
```

**注意:** 远程调试会阻塞其他请求,生产环境慎用。

---

## 健康检查

### Docker健康检查配置

```yaml
services:
  ryplus_uni_workflow:
    # ... 其他配置
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5500/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

### 手动健康检查

```bash
# 检查服务端口
netstat -tlnp | grep -E "5500|5501|9090|8800"

# 检查服务健康状态
curl http://localhost:5500/actuator/health

# 检查MySQL连接
docker exec mysql mysql -uroot -p'mysql123456' -e "SELECT 1"

# 检查Redis连接
docker exec redis redis-cli -a ruoyi123 PING
```

---

## 日志管理

### 日志目录结构

```
/home/ubuntu/apps/
├── ryplus_uni_workflow/
│   └── logs/
│       ├── info.log           # 信息日志
│       ├── error.log          # 错误日志
│       └── java_pid.hprof     # OOM堆转储
├── ryplus_uni_workflow2/
│   └── logs/
├── monitor/
│   └── logs/
└── snailjob/
    └── logs/
```

### 日志轮转配置

```bash
# /etc/logrotate.d/ryplus
cat > /etc/logrotate.d/ryplus << 'EOF'
/home/ubuntu/apps/*/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    dateext
    dateformat -%Y%m%d
}
EOF
```

### 实时日志查看

```bash
# 查看最新日志
tail -f /home/ubuntu/apps/ryplus_uni_workflow/logs/info.log

# 查看错误日志
tail -f /home/ubuntu/apps/ryplus_uni_workflow/logs/error.log

# 使用Docker查看
docker logs -f --tail 100 ryplus_uni_workflow
```

---

## 性能优化

### JVM参数优化

```yaml
environment:
  JAVA_OPTS: >-
    -Xms2g
    -Xmx2g
    -XX:+UseZGC
    -XX:+ZGenerational
    -XX:MaxGCPauseMillis=50
    -XX:+HeapDumpOnOutOfMemoryError
    -XX:HeapDumpPath=/ruoyi/server/logs/
    -Djava.security.egd=file:/dev/./urandom
```

**JVM参数说明:**

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `-Xms` | 初始堆大小 | 与-Xmx相同 |
| `-Xmx` | 最大堆大小 | 物理内存的50-70% |
| `-XX:+UseZGC` | 使用ZGC | JDK 21推荐 |
| `-XX:MaxGCPauseMillis` | 最大GC暂停时间 | 50-200ms |

### 连接池优化

```yaml
environment:
  # 数据库连接池
  DB_MAX_POOL_SIZE: 100
  DB_MIN_IDLE: 20

  # Redis连接池
  REDISSON_MIN_IDLE: 32
  REDISSON_POOL_SIZE: 64
  REDISSON_THREADS: 16
  REDISSON_NETTY_THREADS: 32
```

---

## 安全配置

### 生产环境安全检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 修改默认密码 | 必须 | MySQL、Redis、MinIO、监控中心 |
| 关闭API文档 | 必须 | `SPRINGDOC_ENABLED=false` |
| 启用API加密 | 推荐 | `API_ENCRYPT_ENABLED=true` |
| 配置HTTPS | 必须 | Nginx配置SSL证书 |
| 限制端口访问 | 必须 | 防火墙只放行80/443 |
| 禁用调试端口 | 必须 | 生产环境不配置DEBUG_ARGS |
| 日志脱敏 | 必须 | 敏感信息不记录日志 |

### 防火墙配置

```bash
# 只开放必要端口
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload

# 内部服务端口不对外开放
# 3306 (MySQL)
# 6379 (Redis)
# 9000/9001 (MinIO)
# 5500/5501 (应用)
# 9090 (监控)
# 8800/17888 (SnailJob)
```

---

## 常见问题

### 1. 容器启动失败

**问题现象:** 容器反复重启,状态为 Restarting

**排查步骤:**

```bash
# 查看容器日志
docker logs ryplus_uni_workflow

# 常见原因
# 1. 数据库连接失败 - 检查DB_HOST、DB_PASSWORD
# 2. 端口被占用 - netstat -tlnp | grep 5500
# 3. 内存不足 - free -h
# 4. 配置文件错误 - 检查YAML语法
```

### 2. 数据库连接池耗尽

**问题现象:** 日志报 "Cannot acquire connection from pool"

**解决方案:**

```yaml
environment:
  # 增加连接池大小
  DB_MAX_POOL_SIZE: 100
  DB_MIN_IDLE: 30

  # 检查连接泄漏
  P6SPY_ENABLED: true  # 临时开启,排查后关闭
```

### 3. Redis连接超时

**问题现象:** 日志报 "Unable to connect to Redis"

**解决方案:**

```bash
# 检查Redis服务
docker exec redis redis-cli -a ruoyi123 PING

# 检查密码配置
# compose文件中 REDIS_PASSWORD 要与 redis.conf 中 requirepass 一致
```

### 4. Nginx 502 Bad Gateway

**问题现象:** 访问返回 502 错误

**解决方案:**

```bash
# 检查后端服务是否启动
curl http://127.0.0.1:5500/actuator/health

# 检查Nginx配置
nginx -t

# 查看Nginx错误日志
tail -f /docker/nginx/log/error.log
```

### 5. MinIO上传失败

**问题现象:** 文件上传报 "Connection refused"

**解决方案:**

```bash
# 检查MinIO服务
curl http://127.0.0.1:9000/minio/health/live

# 检查存储桶权限
# 登录MinIO控制台 http://ip:9001
# 确保存储桶设置为公开访问
```

---

## 运维脚本

### 一键部署脚本

```bash
#!/bin/bash
# deploy.sh - 一键部署脚本

set -e

COMPOSE_FILE="Complete-compose.yml"
APP_VERSION="5.4.1"

echo "=== 开始部署 RuoYi-Plus-UniApp ==="

# 1. 检查Docker环境
if ! command -v docker &> /dev/null; then
    echo "Docker未安装,请先安装Docker"
    exit 1
fi

# 2. 拉取最新镜像
echo "拉取镜像..."
docker pull mysql:8.0.42
docker pull redis:7.2.8
docker pull nginx:1.23.4
docker pull minio/minio:RELEASE.2025-04-22T22-12-26Z

# 3. 停止旧服务
echo "停止旧服务..."
docker-compose -f $COMPOSE_FILE down || true

# 4. 启动新服务
echo "启动服务..."
docker-compose -f $COMPOSE_FILE up -d

# 5. 等待服务启动
echo "等待服务启动..."
sleep 30

# 6. 健康检查
echo "健康检查..."
if curl -s http://localhost:5500/actuator/health | grep -q "UP"; then
    echo "=== 部署成功 ==="
else
    echo "=== 部署可能失败,请检查日志 ==="
    docker-compose -f $COMPOSE_FILE logs --tail 50
fi
```

### 滚动更新脚本

```bash
#!/bin/bash
# rolling-update.sh - 滚动更新脚本

set -e

NEW_IMAGE=$1
if [ -z "$NEW_IMAGE" ]; then
    echo "用法: ./rolling-update.sh ryplus_uni_workflow:5.4.2"
    exit 1
fi

echo "=== 开始滚动更新 ==="

# 1. 更新实例2
echo "更新实例2..."
docker stop ryplus_uni_workflow2
docker rm ryplus_uni_workflow2
# 使用新镜像启动实例2
# docker-compose up -d ryplus_uni_workflow2

sleep 30

# 2. 健康检查实例2
if curl -s http://localhost:5501/actuator/health | grep -q "UP"; then
    echo "实例2更新成功"
else
    echo "实例2更新失败,回滚..."
    exit 1
fi

# 3. 更新实例1
echo "更新实例1..."
docker stop ryplus_uni_workflow
docker rm ryplus_uni_workflow
# docker-compose up -d ryplus_uni_workflow

sleep 30

# 4. 健康检查实例1
if curl -s http://localhost:5500/actuator/health | grep -q "UP"; then
    echo "=== 滚动更新完成 ==="
else
    echo "实例1更新失败"
    exit 1
fi
```

---

## 总结

Docker 容器化部署为 RuoYi-Plus-UniApp 项目提供了标准化、可重复的部署方案。通过本文档介绍的最佳实践:

1. **镜像构建** - 使用官方推荐的 Liberica JDK 镜像,优化启动性能
2. **编排部署** - Docker Compose 一键部署,支持多实例负载均衡
3. **配置管理** - 环境变量外部化,支持不同环境灵活配置
4. **数据持久化** - 完善的卷映射策略,保障数据安全
5. **运维管理** - 健康检查、日志管理、性能优化一应俱全

建议在实际部署中:
- 生产环境必须修改所有默认密码
- 配置 HTTPS 加密传输
- 启用监控和告警
- 定期备份数据
- 建立完善的运维流程
