# 容器化最佳实践

## 概述

容器化技术是现代云原生应用的基础,通过容器化可以实现应用的标准化打包、快速部署、弹性伸缩和跨平台运行。RuoYi-Plus-UniApp 项目提供了完整的容器化解决方案,涵盖 Dockerfile 编写、Docker Compose 编排、Kubernetes 部署和生产级优化等各个方面。本文档详细介绍容器化的架构设计、最佳实践和运维管理。

**核心价值:**

- **环境一致性** - 容器封装了应用及其依赖,确保开发、测试、生产环境完全一致
- **快速交付** - 容器秒级启动,支持快速迭代和持续部署
- **资源隔离** - 通过 Namespace 和 Cgroups 实现进程、网络、存储的隔离
- **弹性伸缩** - 根据负载动态调整容器实例数量,提高资源利用率
- **微服务支持** - 每个服务独立容器化,降低服务间耦合度
- **版本管理** - 镜像版本化存储,支持快速回滚和灰度发布

**技术栈版本:**

| 技术 | 版本 | 说明 |
|------|------|------|
| Docker Engine | 24.0+ | 容器运行时 |
| Docker Compose | 2.20+ | 单机容器编排 |
| Kubernetes | 1.28+ | 容器集群编排(可选) |
| JDK | Liberica 21.0.8-cds | BellSoft 官方镜像 |
| MySQL | 8.0.42 | 关系型数据库 |
| Redis | 7.2.8 | 缓存服务 |
| RocketMQ | 5.3.2 | 消息队列 |
| Nginx | 1.23.4 | 反向代理 |
| MinIO | 2025-04-22 | 对象存储 |

---

## 容器化架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          容器化部署架构 (生产环境)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        Nginx 容器 (80/443)                          │   │
│   │         反向代理 + SSL终结 + 负载均衡 + 静态资源服务                  │   │
│   └───────────────────────────┬─────────────────────────────────────────┘   │
│                               │                                             │
│              ┌────────────────┼────────────────┐                            │
│              │                │                │                            │
│              ▼                ▼                ▼                            │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│   │  应用容器1 (5500)│ │  应用容器2 (5501)│ │ 监控容器 (9090)  │            │
│   │ Java 17+ + ZGC   │ │ Java 17+ + ZGC   │ │  Spring Boot     │            │
│   │ Virtual Threads │ │ Virtual Threads │ │     Admin        │            │
│   └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘            │
│            │                    │                    │                      │
│            └────────────────────┴────────────────────┴──────────┐           │
│                                                                 │           │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┴────┐       │
│   │ MySQL 容器       │ │ Redis 容器       │ │ SnailJob 容器         │       │
│   │  (3306)         │ │  (6379)         │ │ (8800 + 17888)       │       │
│   │ 数据持久化       │ │ RDB + AOF       │ │ 定时任务调度          │       │
│   └──────────────────┘ └──────────────────┘ └───────────────────────┘       │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │               RocketMQ 集群 (消息队列 - 可选)                        │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐   │  │
│   │  │ NameServer  │  │ Broker      │  │ Broker      │  │Dashboard │   │  │
│   │  │   (9876)    │  │Master(10911)│  │Slave(10921) │  │  (8088)  │   │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌──────────────────┐                                                      │
│   │ MinIO 容器       │                                                      │
│   │ (9000/9001)     │                                                      │
│   │ 对象存储 S3 API  │                                                      │
│   └──────────────────┘                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

卷映射策略:
  - /docker/* → 基础服务数据目录 (MySQL, Redis, Nginx, MinIO)
  - /home/ubuntu/apps/* → 应用服务数据目录 (logs, upload, temp)
  - 共享卷: upload (多实例共享上传文件)
  - 独立卷: logs, temp (每个实例独立)
```

### 服务依赖关系

```yaml
依赖层级:
  1. 基础服务层 (无依赖):
     - MySQL
     - Redis
     - MinIO
     - RocketMQ NameServer

  2. 消息队列层 (依赖 NameServer):
     - RocketMQ Broker Master
     - RocketMQ Broker Slave
     - RocketMQ Dashboard

  3. 应用服务层 (依赖基础服务):
     - 主应用实例1 (依赖 MySQL + Redis)
     - 主应用实例2 (依赖 MySQL + Redis)
     - 监控中心 (可独立)
     - SnailJob 调度 (依赖 MySQL)

  4. 接入层 (依赖应用服务):
     - Nginx (反向代理应用服务)
```

### 网络模式选择

项目默认使用 `host` 网络模式,但也支持 `bridge` 模式:

**Host 网络模式** (当前使用):

```yaml
network_mode: "host"
```

**优势:**
- 网络性能最佳,无 NAT 转换开销
- 容器直接使用宿主机网络栈
- 简化服务发现,直接使用 `127.0.0.1` 通信
- 避免端口映射配置复杂性

**劣势:**
- 端口冲突需手动管理
- 多实例必须使用不同端口
- 安全隔离性较弱

**Bridge 网络模式** (推荐生产环境):

```yaml
networks:
  ryplus-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  mysql:
    networks:
      ryplus-network:
        ipv4_address: 172.20.0.10
```

**优势:**
- 网络隔离性强
- 支持自定义网段
- 容器间通过服务名通信
- 支持多个隔离网络

**劣势:**
- 需要配置端口映射
- 网络性能略低于 host 模式

---

## Dockerfile 最佳实践

### 主应用 Dockerfile

项目主应用使用 BellSoft Liberica JDK,这是 Spring 官方推荐的 JDK 发行版:

```dockerfile
# 贝尔实验室 Spring 官方推荐镜像 JDK下载地址 https://bell-sw.com/pages/downloads/
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds

LABEL maintainer="抓蛙师"

# 创建目录结构
RUN mkdir -p /ruoyi/server/logs \
    /ruoyi/server/upload \
    /ruoyi/server/temp

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
# 调试端口(仅在需要时使用)
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

**关键设计点:**

| 配置项 | 说明 | 最佳实践 |
|--------|------|----------|
| 基础镜像 | `bellsoft/liberica-openjdk-rocky:21.0.8-cds` | Rocky Linux 稳定性好, CDS 加速启动 |
| 工作目录 | `/ruoyi/server` | 统一路径,便于维护 |
| 环境变量 | 所有配置项外部化 | 支持不同环境灵活配置 |
| 端口暴露 | EXPOSE 声明使用的端口 | 文档化端口用途 |
| JVM 参数 | `-XX:+UseZGC` | Java 17+ 推荐 (JDK 21 更佳) ZGC 低延迟 |
| 堆转储 | `-XX:+HeapDumpOnOutOfMemoryError` | OOM 时自动生成分析文件 |
| Shell 形式 | `sh -c` 执行命令 | 支持环境变量替换和信号传递 |

### 监控服务 Dockerfile

```dockerfile
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds

LABEL maintainer="抓蛙师"

# 创建目录
RUN mkdir -p /ruoyi/monitor/logs

WORKDIR /ruoyi/monitor

# 环境变量
ENV SERVER_PORT=9090 \
    LANG=C.UTF-8 \
    JAVA_OPTS="-Xms256m -Xmx512m" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

EXPOSE ${SERVER_PORT}

COPY ./target/ryplus_monitor_admin.jar /ruoyi/monitor/app.jar

ENTRYPOINT ["sh", "-c", "exec java \
    -Dserver.port=${SERVER_PORT} \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} \
    -Duser.timezone=${TZ} \
    ${JAVA_OPTS} \
    -jar /ruoyi/monitor/app.jar"]
```

**内存优化:** 监控服务相对轻量,只需 256m-512m 堆内存。

### SnailJob 调度服务 Dockerfile

```dockerfile
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds

LABEL maintainer="抓蛙师"

RUN mkdir -p /ruoyi/snailjob/logs

WORKDIR /ruoyi/snailjob

ENV SERVER_PORT=8800 \
    SNAILJOB_SERVER_PORT=17888 \
    LANG=C.UTF-8 \
    JAVA_OPTS="-Xms512m -Xmx1024m" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

EXPOSE ${SERVER_PORT}
EXPOSE ${SNAILJOB_SERVER_PORT}

COPY ./target/ryplus_snailjob_server.jar /ruoyi/snailjob/app.jar

ENTRYPOINT ["sh", "-c", "exec java \
    -Dserver.port=${SERVER_PORT} \
    -Dsnailjob.server.port=${SNAILJOB_SERVER_PORT} \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} \
    -Duser.timezone=${TZ} \
    ${JAVA_OPTS} \
    -jar /ruoyi/snailjob/app.jar"]
```

**双端口设计:**
- `8800`: Web 管理界面端口
- `17888`: RPC 通信端口 (与客户端通信)

### Dockerfile 优化技巧

#### 1. 多阶段构建

**优势:** 分离构建环境和运行环境,减小镜像大小

```dockerfile
# ========== 构建阶段 ==========
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# 复制 pom.xml 并下载依赖 (利用 Docker 缓存)
COPY pom.xml .
RUN mvn dependency:go-offline

# 复制源码并构建
COPY src ./src
RUN mvn clean package -DskipTests

# ========== 运行阶段 ==========
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds

WORKDIR /ruoyi/server

# 从构建阶段复制构建产物
COPY --from=builder /build/target/*.jar app.jar

# ... 其他配置
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**镜像大小对比:**
- 单阶段构建: ~800MB (包含 Maven、源码)
- 多阶段构建: ~400MB (仅运行时)

#### 2. .dockerignore 文件

创建 `.dockerignore` 文件排除不必要的文件:

```text
# Maven 构建产物
target/
!target/*.jar

# 文档和说明
*.md
README*
LICENSE

# 版本控制
.git/
.gitignore

# IDE 配置
.idea/
.vscode/
*.iml

# 日志文件
logs/
*.log

# 临时文件
temp/
*.tmp
```

**效果:** 减少构建上下文大小,加快镜像构建速度。

#### 3. 层缓存优化

**原则:** 频繁变化的层放在后面,不变的层放在前面

```dockerfile
# ❌ 不推荐 - 每次代码变化都要重新安装依赖
COPY . /app
WORKDIR /app
RUN mvn clean package

# ✅ 推荐 - 依赖不变时可复用缓存
COPY pom.xml /app/
WORKDIR /app
RUN mvn dependency:go-offline
COPY src /app/src
RUN mvn package
```

#### 4. 使用非 root 用户

**安全最佳实践:** 容器内使用非特权用户运行应用

```dockerfile
# 创建专用用户
RUN groupadd -r ruoyi && useradd -r -g ruoyi ruoyi

# 设置目录权限
RUN chown -R ruoyi:ruoyi /ruoyi/server

# 切换到非 root 用户
USER ruoyi

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 5. 健康检查配置

在 Dockerfile 中添加健康检查:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
    CMD curl -f http://localhost:${SERVER_PORT}/actuator/health || exit 1
```

**参数说明:**
- `--interval`: 检查间隔 (30秒)
- `--timeout`: 超时时间 (10秒)
- `--retries`: 重试次数 (3次)
- `--start-period`: 启动等待时间 (60秒)

---

## Docker Compose 编排

### 完整编排配置

项目提供了生产级别的完整编排配置,包含所有服务:

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
    restart: always

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
    restart: always

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
    restart: always

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
    restart: always

  # ==================== 主应用服务(实例1)====================
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

  # ==================== 主应用服务(实例2 - 负载均衡)====================
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
      - /home/ubuntu/apps/ryplus_uni_workflow/upload/:/ruoyi/server/upload/  # 共享上传目录
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

### 环境变量配置策略

**分类管理:** 将环境变量按功能分类

#### 基础配置

```yaml
environment:
  # 时区配置
  TZ: Asia/Shanghai

  # 端口配置
  SERVER_PORT: 5500
  SNAIL_PORT: 25500
  DEBUG_PORT: 5005

  # 运行环境
  SPRING_PROFILES_ACTIVE: prod
  LOG_LEVEL: info
```

#### 数据库配置

```yaml
environment:
  # 主数据源
  DB_HOST: 127.0.0.1
  DB_PORT: 3306
  DB_NAME: ryplus_uni_workflow
  DB_USERNAME: ryplus_uni_workflow
  DB_PASSWORD: ${DB_PASSWORD:-your-password}  # 支持默认值

  # 从数据源(读写分离)
  DB_SLAVE_HOST: 127.0.0.1
  DB_SLAVE_PORT: 3306
  DB_SLAVE_NAME: ryplus_uni_workflow
  DB_SLAVE_USERNAME: ryplus_uni_workflow_slave
  DB_SLAVE_PASSWORD: ${DB_SLAVE_PASSWORD:-your-password}

  # 连接池配置
  DB_MAX_POOL_SIZE: 50
  DB_MIN_IDLE: 20

  # P6Spy SQL监控(开发调试)
  P6SPY_ENABLED: false
```

#### Redis 配置

```yaml
environment:
  REDIS_HOST: 127.0.0.1
  REDIS_PORT: 6379
  REDIS_DATABASE: 0
  REDIS_PASSWORD: ""
  REDIS_SSL_ENABLED: false

  # Redisson 连接池
  REDISSON_THREADS: 16
  REDISSON_NETTY_THREADS: 32
  REDISSON_MIN_IDLE: 32
  REDISSON_POOL_SIZE: 64
```

#### 安全配置

```yaml
environment:
  # JWT 密钥
  JWT_SECRET_KEY: ${JWT_SECRET:-uDkkASPQVN5iR4eN}

  # API 加密
  API_ENCRYPT_ENABLED: true
  API_RESPONSE_PUBLIC_KEY: ${API_PUBLIC_KEY}
  API_REQUEST_PRIVATE_KEY: ${API_PRIVATE_KEY}

  # 字段加密
  ENCRYPT_PASSWORD: ${ENCRYPT_PASSWORD}
  ENCRYPT_PUBLIC_KEY: ${ENCRYPT_PUBLIC_KEY}
  ENCRYPT_PRIVATE_KEY: ${ENCRYPT_PRIVATE_KEY}
```

#### 第三方服务配置

```yaml
environment:
  # 定时任务
  SNAIL_JOB_ENABLED: true
  SNAIL_JOB_HOST: 127.0.0.1
  SNAIL_JOB_PORT: 17888
  SNAIL_JOB_TOKEN: ${SNAIL_JOB_TOKEN}

  # 监控中心
  MONITOR_ENABLED: true
  MONITOR_URL: http://127.0.0.1:9090/admin
  MONITOR_USERNAME: ruoyi
  MONITOR_PASSWORD: ${MONITOR_PASSWORD:-123456}

  # 消息队列 RocketMQ
  ROCKETMQ_NAME_SERVER: 127.0.0.1:9876
  ROCKETMQ_CLUSTER_NAME: RuoYiCluster
  ROCKETMQ_BROKER_ADDR: 127.0.0.1:10911

  # 高德地图 API
  GAODE_MAP_API_KEY: ${GAODE_API_KEY}
  GAODE_MAP_TIMEOUT: 5000
  GAODE_MAP_ENABLED: true
```

### 使用 .env 文件管理敏感信息

**创建 .env 文件:**

```bash
# .env - 环境变量配置文件
# 注意: 此文件包含敏感信息,不要提交到版本控制

# 数据库密码
DB_PASSWORD=your-secure-password
DB_SLAVE_PASSWORD=your-secure-password

# JWT 密钥 (16位随机字符串)
JWT_SECRET=your-16-char-key

# API 加密密钥
API_PUBLIC_KEY=your-rsa-public-key
API_PRIVATE_KEY=your-rsa-private-key

# 监控中心密码
MONITOR_PASSWORD=your-monitor-password

# SnailJob Token
SNAIL_JOB_TOKEN=your-snailjob-token

# 高德地图 API Key
GAODE_API_KEY=your-gaode-api-key
```

**在 Compose 文件中引用:**

```yaml
services:
  ryplus_uni_workflow:
    environment:
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET_KEY: ${JWT_SECRET}
    env_file:
      - .env  # 或者直接加载整个文件
```

**在 .gitignore 中排除:**

```text
# .gitignore
.env
.env.local
.env.*.local
```

### 卷映射最佳实践

#### 数据持久化

```yaml
volumes:
  # MySQL 数据持久化
  mysql:
    volumes:
      - /docker/mysql/data/:/var/lib/mysql/
      - /docker/mysql/conf/:/etc/mysql/conf.d/

  # Redis 数据持久化
  redis:
    volumes:
      - /docker/redis/data/:/redis/data/
      - /docker/redis/conf:/redis/config

  # MinIO 对象存储
  minio:
    volumes:
      - /docker/minio/data:/data
      - /docker/minio/config:/root/.minio/

  # RocketMQ 数据持久化
  rocketmq-broker:
    volumes:
      - /docker/rocketmq/broker/logs:/home/rocketmq/logs
      - /docker/rocketmq/broker/store:/home/rocketmq/store
```

#### 应用数据映射

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

#### 配置文件映射

```yaml
volumes:
  # Nginx 配置
  - /docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf:ro  # 只读
  - /docker/nginx/cert:/etc/nginx/cert:ro

  # Redis 配置
  - /docker/redis/conf/redis.conf:/redis/config/redis.conf:ro
```

### 服务依赖管理

使用 `depends_on` 定义服务启动顺序:

```yaml
services:
  mysql:
    # 基础服务,无依赖

  ryplus_uni_workflow:
    depends_on:
      - mysql
      - redis
    # 等待 MySQL 和 Redis 启动后再启动

  monitor:
    depends_on:
      - ryplus_uni_workflow
    # 监控中心依赖主应用
```

**注意:** `depends_on` 只保证启动顺序,不保证服务就绪。生产环境建议使用健康检查:

```yaml
services:
  mysql:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  ryplus_uni_workflow:
    depends_on:
      mysql:
        condition: service_healthy  # 等待 MySQL 健康检查通过
```

---

## RocketMQ 集群编排

### RocketMQ 架构

```yaml
services:
  # ==================== NameServer ====================
  rocketmq-nameserver:
    image: apache/rocketmq:5.3.2
    container_name: rocketmq-nameserver
    ports:
      - "9876:9876"
    environment:
      JAVA_OPT_EXT: "-Xms512m -Xmx512m -Xmn256m"
    volumes:
      - /docker/rocketmq/nameserver/logs:/home/rocketmq/logs
    command: sh mqnamesrv
    network_mode: "host"
    restart: always

  # ==================== Broker Master ====================
  rocketmq-broker-master:
    image: apache/rocketmq:5.3.2
    container_name: rocketmq-broker-master
    ports:
      - "10911:10911"
      - "10912:10912"
    environment:
      JAVA_OPT_EXT: "-Xms1g -Xmx1g -Xmn512m"
      NAMESRV_ADDR: "127.0.0.1:9876"
    volumes:
      - /docker/rocketmq/broker/logs:/home/rocketmq/logs
      - /docker/rocketmq/broker/store:/home/rocketmq/store
      - /docker/rocketmq/conf/broker-a.conf:/home/rocketmq/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/conf/broker.conf
    depends_on:
      - rocketmq-nameserver
    network_mode: "host"
    restart: always

  # ==================== Broker Slave (主从复制) ====================
  rocketmq-broker-slave:
    image: apache/rocketmq:5.3.2
    container_name: rocketmq-broker-slave
    ports:
      - "10921:10921"
      - "10922:10922"
    environment:
      JAVA_OPT_EXT: "-Xms1g -Xmx1g -Xmn512m"
      NAMESRV_ADDR: "127.0.0.1:9876"
    volumes:
      - /docker/rocketmq/broker-slave/logs:/home/rocketmq/logs
      - /docker/rocketmq/broker-slave/store:/home/rocketmq/store
      - /docker/rocketmq/conf/broker-a-s.conf:/home/rocketmq/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/conf/broker.conf
    depends_on:
      - rocketmq-nameserver
      - rocketmq-broker-master
    network_mode: "host"
    restart: always

  # ==================== Dashboard (可视化管理) ====================
  rocketmq-dashboard:
    image: apacherocketmq/rocketmq-dashboard:latest
    container_name: rocketmq-dashboard
    ports:
      - "8088:8080"
    environment:
      JAVA_OPTS: "-Xms256m -Xmx512m -Drocketmq.namesrv.addr=127.0.0.1:9876"
    depends_on:
      - rocketmq-nameserver
    network_mode: "host"
    restart: always
```

### Broker 配置文件

**Master 配置** (`broker-a.conf`):

```properties
# 集群名称
brokerClusterName=RuoYiCluster

# Broker 名称
brokerName=broker-a

# Broker ID (0=Master, >0=Slave)
brokerId=0

# Broker 角色
brokerRole=ASYNC_MASTER

# 刷盘策略 (ASYNC_FLUSH=异步, SYNC_FLUSH=同步)
flushDiskType=ASYNC_FLUSH

# NameServer 地址
namesrvAddr=127.0.0.1:9876

# 监听端口
listenPort=10911

# HA 监听端口
haListenPort=10912

# Broker IP
brokerIP1=127.0.0.1

# 存储路径
storePathRootDir=/home/rocketmq/store
storePathCommitLog=/home/rocketmq/store/commitlog
storePathConsumeQueue=/home/rocketmq/store/consumequeue
storePathIndex=/home/rocketmq/store/index

# 删除文件时间点 (凌晨4点)
deleteWhen=04

# 文件保留时间 (小时)
fileReservedTime=48

# 自动创建 Topic
autoCreateTopicEnable=true

# 自动创建订阅组
autoCreateSubscriptionGroup=true

# 线程池配置
sendMessageThreadPoolNums=4
pullMessageThreadPoolNums=20
```

**Slave 配置** (`broker-a-s.conf`):

```properties
brokerClusterName=RuoYiCluster
brokerName=broker-a
brokerId=1  # Slave ID
brokerRole=SLAVE
flushDiskType=ASYNC_FLUSH

namesrvAddr=127.0.0.1:9876
listenPort=10921
haListenPort=10922
brokerIP1=127.0.0.1

# 同步复制延迟阈值(毫秒)
haSendHeartbeatInterval=5000
haTransferBatchSize=32768

# 其他配置与 Master 相同
```

### 环境变量配置 (.env)

```bash
# RocketMQ 版本
ROCKETMQ_VERSION=5.3.2

# NameServer JVM 参数
NAMESERVER_JAVA_OPT=-Xms512m -Xmx512m -Xmn256m

# Broker JVM 参数
BROKER_JAVA_OPT=-Xms1g -Xmx1g -Xmn512m

# Broker IP (多网卡时指定)
BROKER_IP=127.0.0.1

# NameServer 地址
NAMESRV_ADDR=127.0.0.1:9876
```

**环境差异化配置:**

```bash
# 开发环境
NAMESERVER_JAVA_OPT=-Xms512m -Xmx512m -Xmn256m
BROKER_JAVA_OPT=-Xms512m -Xmx512m -Xmn256m

# 测试环境
NAMESERVER_JAVA_OPT=-Xms512m -Xmx512m -Xmn256m
BROKER_JAVA_OPT=-Xms1g -Xmx1g -Xmn512m

# 生产环境
NAMESERVER_JAVA_OPT=-Xms1g -Xmx1g -Xmn512m
BROKER_JAVA_OPT=-Xms2g -Xmx2g -Xmn1g
```

---

## Nginx 反向代理配置

### 负载均衡配置

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # 安全配置
    client_max_body_size 100m;
    gzip_static on;
    server_tokens off;  # 隐藏 Nginx 版本号

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # ==================== 上游服务器定义 ====================

    # 主应用负载均衡
    upstream ryplus_server {
        # IP 哈希,同一客户端请求同一后端
        ip_hash;
        server 127.0.0.1:5500 weight=10 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5501 weight=10 max_fails=3 fail_timeout=30s;
    }

    # 监控中心
    upstream monitor {
        server 127.0.0.1:9090;
    }

    # SnailJob 调度中心
    upstream snailjob {
        server 127.0.0.1:8800;
    }

    server {
        listen       80;
        server_name  localhost;

        # 访问日志
        access_log  /var/log/nginx/access.log  main;

        # ==================== 前端静态资源 ====================
        location / {
            root   /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;

            # 缓存配置
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 30d;
                add_header Cache-Control "public, immutable";
            }
        }

        # ==================== 后端 API 代理 ====================
        location /ryplus_uni_workflow/ {
            proxy_pass http://ryplus_server/;

            # 请求头传递
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header REMOTE-HOST $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # SSE/WebSocket 支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # 超时配置
            proxy_connect_timeout 30s;
            proxy_send_timeout 600s;
            proxy_read_timeout 600s;

            # 禁用缓冲 (SSE 需要)
            proxy_buffering off;
            proxy_cache off;
        }

        # ==================== 监控中心代理 ====================
        location /admin/ {
            proxy_pass http://monitor/admin/;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # ==================== SnailJob 调度中心代理 ====================
        location /snail-job/ {
            proxy_pass http://snailjob/snail-job/;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # ==================== 安全限制 ====================

        # 禁止外网访问 Actuator 端点
        location ~ ^/actuator {
            return 403;
        }

        # 错误页面
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

    # ==================== HTTPS 配置 (生产环境) ====================
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL 证书
        ssl_certificate /etc/nginx/cert/your-domain.pem;
        ssl_certificate_key /etc/nginx/cert/your-domain.key;

        # SSL 协议
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # SSL 会话缓存
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # HSTS (强制 HTTPS)
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 其他配置与 HTTP 相同
        location / {
            root   /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        location /ryplus_uni_workflow/ {
            proxy_pass http://ryplus_server/;
            # ... 代理配置
        }
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

### 负载均衡策略

| 策略 | 配置 | 说明 | 适用场景 |
|------|------|------|----------|
| 轮询 | 默认 | 依次分配请求 | 无状态服务 |
| IP 哈希 | `ip_hash;` | 同一 IP 访问同一后端 | 需要会话保持 |
| 最少连接 | `least_conn;` | 分配到连接数最少的服务器 | 请求处理时间差异大 |
| 权重 | `weight=10` | 按权重比例分配 | 服务器性能不均 |

### 健康检查配置

Nginx 原生支持被动健康检查:

```nginx
upstream ryplus_server {
    server 127.0.0.1:5500 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:5501 max_fails=3 fail_timeout=30s;
}
```

**参数说明:**
- `max_fails=3`: 最大失败次数,超过则标记为不可用
- `fail_timeout=30s`: 标记不可用后,30秒后重新尝试

**主动健康检查** (需要 Nginx Plus 或第三方模块):

```nginx
upstream ryplus_server {
    zone ryplus 64k;
    server 127.0.0.1:5500;
    server 127.0.0.1:5501;

    # 主动健康检查
    check interval=3000 rise=2 fall=3 timeout=2000 type=http;
    check_http_send "GET /actuator/health HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
}
```

---

## 多数据库支持

项目支持多种数据库,可通过 Compose 快速部署:

### Oracle 12c

```yaml
services:
  oracle:
    image: wnameless/oracle-xe-11g-r2
    container_name: oracle
    ports:
      - "1521:1521"
      - "18080:8080"
    environment:
      ORACLE_ALLOW_REMOTE: "true"
    volumes:
      - /docker/oracle/data:/u01/app/oracle
    network_mode: "host"
    restart: always
```

**连接信息:**
- Host: localhost
- Port: 1521
- SID: xe
- Username: system
- Password: oracle
- Web 管理: http://localhost:18080/apex

### SQL Server 2017

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2017-latest
    container_name: sqlserver
    ports:
      - "1433:1433"
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "YourStrong!Passw0rd"
      MSSQL_PID: "Express"
    volumes:
      - /docker/sqlserver/data:/var/opt/mssql
    network_mode: "host"
    restart: always
```

**连接信息:**
- Host: localhost
- Port: 1433
- Username: sa
- Password: YourStrong!Passw0rd

### PostgreSQL 14

```yaml
services:
  postgres:
    image: postgres:14.2
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ryplus_uni_workflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      TZ: Asia/Shanghai
    volumes:
      - /docker/postgres/data:/var/lib/postgresql/data
    network_mode: "host"
    restart: always
```

**连接信息:**
- Host: localhost
- Port: 5432
- Database: ryplus_uni_workflow
- Username: postgres
- Password: postgres123

### PostgreSQL 13 (多版本并存)

```yaml
services:
  postgres13:
    image: postgres:13.6
    container_name: postgres13
    ports:
      - "5433:5432"  # 注意端口不同
    environment:
      POSTGRES_DB: ryplus_uni_workflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      TZ: Asia/Shanghai
    volumes:
      - /docker/postgres13/data:/var/lib/postgresql/data
    network_mode: "host"
    restart: always
```

**多版本策略:** 不同版本使用不同端口和数据目录,避免冲突。

---

## 容器化运维

### 服务管理命令

```bash
# ==================== 启动服务 ====================
# 启动所有服务
docker-compose -f Complete-compose.yml up -d

# 启动指定服务
docker-compose -f Complete-compose.yml up -d ryplus_uni_workflow

# 前台启动(查看日志)
docker-compose -f Complete-compose.yml up

# ==================== 停止服务 ====================
# 停止所有服务
docker-compose -f Complete-compose.yml down

# 停止指定服务
docker-compose -f Complete-compose.yml stop ryplus_uni_workflow

# 停止并删除卷(危险操作)
docker-compose -f Complete-compose.yml down -v

# ==================== 重启服务 ====================
# 重启所有服务
docker-compose -f Complete-compose.yml restart

# 重启指定服务
docker-compose -f Complete-compose.yml restart ryplus_uni_workflow

# ==================== 查看状态 ====================
# 查看服务状态
docker-compose -f Complete-compose.yml ps

# 查看服务日志
docker-compose -f Complete-compose.yml logs

# 实时查看日志
docker-compose -f Complete-compose.yml logs -f

# 查看指定服务日志
docker-compose -f Complete-compose.yml logs -f ryplus_uni_workflow

# 查看最近100行日志
docker-compose -f Complete-compose.yml logs --tail 100 ryplus_uni_workflow

# ==================== 更新服务 ====================
# 拉取最新镜像
docker-compose -f Complete-compose.yml pull

# 更新并重启
docker-compose -f Complete-compose.yml up -d

# 重新构建并启动
docker-compose -f Complete-compose.yml up -d --build
```

### 容器管理命令

```bash
# ==================== 查看容器 ====================
# 查看运行中的容器
docker ps

# 查看所有容器(包括停止的)
docker ps -a

# 查看容器详细信息
docker inspect ryplus_uni_workflow

# 查看容器资源使用
docker stats

# 查看特定容器资源使用
docker stats ryplus_uni_workflow

# ==================== 进入容器 ====================
# 进入容器 bash
docker exec -it ryplus_uni_workflow /bin/bash

# 执行单条命令
docker exec ryplus_uni_workflow ls -la /ruoyi/server

# 查看容器进程
docker top ryplus_uni_workflow

# ==================== 容器日志 ====================
# 查看容器日志
docker logs ryplus_uni_workflow

# 实时查看日志
docker logs -f ryplus_uni_workflow

# 查看最近100行
docker logs --tail 100 ryplus_uni_workflow

# 查看带时间戳的日志
docker logs -t ryplus_uni_workflow

# ==================== 容器操作 ====================
# 启动容器
docker start ryplus_uni_workflow

# 停止容器
docker stop ryplus_uni_workflow

# 重启容器
docker restart ryplus_uni_workflow

# 删除容器
docker rm ryplus_uni_workflow

# 强制删除运行中的容器
docker rm -f ryplus_uni_workflow
```

### 镜像管理命令

```bash
# ==================== 查看镜像 ====================
# 查看所有镜像
docker images

# 查看特定镜像
docker images | grep ryplus

# 查看镜像详细信息
docker inspect ryplus_uni_workflow:5.4.1

# 查看镜像历史
docker history ryplus_uni_workflow:5.4.1

# ==================== 构建镜像 ====================
# 构建镜像
docker build -t ryplus_uni_workflow:5.4.1 .

# 指定 Dockerfile 构建
docker build -f Dockerfile.prod -t ryplus_uni_workflow:5.4.1 .

# 不使用缓存构建
docker build --no-cache -t ryplus_uni_workflow:5.4.1 .

# ==================== 管理镜像 ====================
# 给镜像打标签
docker tag ryplus_uni_workflow:5.4.1 ryplus_uni_workflow:latest

# 删除镜像
docker rmi ryplus_uni_workflow:5.4.1

# 强制删除镜像
docker rmi -f ryplus_uni_workflow:5.4.1

# 清理未使用的镜像
docker image prune

# 清理所有未使用的镜像
docker image prune -a

# ==================== 导出/导入镜像 ====================
# 导出镜像
docker save -o ryplus_uni_workflow.tar ryplus_uni_workflow:5.4.1

# 导入镜像
docker load -i ryplus_uni_workflow.tar

# 导出容器为镜像
docker export ryplus_uni_workflow > ryplus_uni_workflow.tar

# 导入容器
docker import ryplus_uni_workflow.tar ryplus_uni_workflow:5.4.1
```

### 网络管理命令

```bash
# ==================== 查看网络 ====================
# 查看所有网络
docker network ls

# 查看网络详情
docker network inspect bridge

# ==================== 创建网络 ====================
# 创建 bridge 网络
docker network create --driver bridge ryplus-network

# 创建自定义子网的网络
docker network create \
  --driver bridge \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  ryplus-network

# ==================== 管理网络 ====================
# 连接容器到网络
docker network connect ryplus-network ryplus_uni_workflow

# 断开容器网络连接
docker network disconnect ryplus-network ryplus_uni_workflow

# 删除网络
docker network rm ryplus-network

# 清理未使用的网络
docker network prune
```

### 卷管理命令

```bash
# ==================== 查看卷 ====================
# 查看所有卷
docker volume ls

# 查看卷详情
docker volume inspect mysql_data

# ==================== 创建卷 ====================
# 创建命名卷
docker volume create mysql_data

# ==================== 管理卷 ====================
# 删除卷
docker volume rm mysql_data

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源(镜像、容器、卷、网络)
docker system prune -a --volumes
```

### 健康检查命令

```bash
# ==================== 服务健康检查 ====================
# 检查服务端口
netstat -tlnp | grep -E "5500|5501|9090|8800"

# 检查主应用健康状态
curl http://localhost:5500/actuator/health

# 检查主应用2健康状态
curl http://localhost:5501/actuator/health

# 检查监控中心
curl http://localhost:9090/admin/actuator/health

# ==================== MySQL 健康检查 ====================
# 检查 MySQL 连接
docker exec mysql mysql -uroot -p'mysql123456' -e "SELECT 1"

# 检查数据库列表
docker exec mysql mysql -uroot -p'mysql123456' -e "SHOW DATABASES"

# 检查数据库大小
docker exec mysql mysql -uroot -p'mysql123456' -e "
  SELECT table_schema AS 'Database',
         ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
  FROM information_schema.tables
  GROUP BY table_schema
"

# ==================== Redis 健康检查 ====================
# 检查 Redis 连接
docker exec redis redis-cli -a ruoyi123 PING

# 检查 Redis 信息
docker exec redis redis-cli -a ruoyi123 INFO

# 检查 Redis 内存使用
docker exec redis redis-cli -a ruoyi123 INFO memory

# 检查 Redis 键数量
docker exec redis redis-cli -a ruoyi123 DBSIZE

# ==================== MinIO 健康检查 ====================
# 检查 MinIO 存活
curl http://localhost:9000/minio/health/live

# 检查 MinIO 就绪
curl http://localhost:9000/minio/health/ready

# ==================== RocketMQ 健康检查 ====================
# 检查 NameServer
docker exec rocketmq-nameserver sh mqadmin clusterList -n 127.0.0.1:9876

# 检查 Broker 状态
docker exec rocketmq-broker-master sh mqadmin brokerStatus -n 127.0.0.1:9876 -b 127.0.0.1:10911
```

### 数据备份与恢复

#### MySQL 备份

```bash
# ==================== 全量备份 ====================
# 备份所有数据库
docker exec mysql mysqldump -uroot -p'mysql123456' --all-databases > backup_all_$(date +%Y%m%d).sql

# 备份指定数据库
docker exec mysql mysqldump -uroot -p'mysql123456' ryplus_uni_workflow > backup_ryplus_$(date +%Y%m%d).sql

# 备份指定表
docker exec mysql mysqldump -uroot -p'mysql123456' ryplus_uni_workflow sys_user > backup_user_$(date +%Y%m%d).sql

# ==================== 增量备份(使用binlog)====================
# 开启 binlog(在 my.cnf 中配置)
# server-id=1
# log-bin=mysql-bin
# binlog_format=ROW

# 查看 binlog 列表
docker exec mysql mysql -uroot -p'mysql123456' -e "SHOW BINARY LOGS"

# 导出 binlog
docker exec mysql mysqlbinlog /var/lib/mysql/mysql-bin.000001 > binlog_$(date +%Y%m%d).sql

# ==================== 恢复数据 ====================
# 恢复数据库
docker exec -i mysql mysql -uroot -p'mysql123456' ryplus_uni_workflow < backup_ryplus_20250101.sql

# 恢复指定表
docker exec -i mysql mysql -uroot -p'mysql123456' ryplus_uni_workflow < backup_user_20250101.sql

# ==================== 定时备份脚本 ====================
# backup-mysql.sh
#!/bin/bash
BACKUP_DIR=/backup/mysql
DATE=$(date +%Y%m%d_%H%M%S)
docker exec mysql mysqldump -uroot -p'mysql123456' ryplus_uni_workflow | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# 添加到 crontab
# 0 2 * * * /path/to/backup-mysql.sh
```

#### Redis 备份

```bash
# ==================== RDB 备份 ====================
# 触发 RDB 快照
docker exec redis redis-cli -a ruoyi123 BGSAVE

# 复制 RDB 文件
cp /docker/redis/data/dump.rdb /backup/redis/dump_$(date +%Y%m%d).rdb

# ==================== AOF 备份 ====================
# 触发 AOF 重写
docker exec redis redis-cli -a ruoyi123 BGREWRITEAOF

# 复制 AOF 文件
cp /docker/redis/data/appendonly.aof /backup/redis/appendonly_$(date +%Y%m%d).aof

# ==================== 恢复数据 ====================
# 停止 Redis
docker stop redis

# 恢复 RDB 文件
cp /backup/redis/dump_20250101.rdb /docker/redis/data/dump.rdb

# 恢复 AOF 文件
cp /backup/redis/appendonly_20250101.aof /docker/redis/data/appendonly.aof

# 启动 Redis
docker start redis

# ==================== 定时备份脚本 ====================
# backup-redis.sh
#!/bin/bash
BACKUP_DIR=/backup/redis
DATE=$(date +%Y%m%d_%H%M%S)

docker exec redis redis-cli -a ruoyi123 BGSAVE
sleep 5
cp /docker/redis/data/dump.rdb $BACKUP_DIR/dump_$DATE.rdb

# 保留最近7天
find $BACKUP_DIR -name "dump_*.rdb" -mtime +7 -delete
```

#### MinIO 备份

```bash
# ==================== 数据备份 ====================
# 备份 MinIO 数据目录
tar -czvf /backup/minio/minio_data_$(date +%Y%m%d).tar.gz /docker/minio/data

# 使用 mc 客户端备份
# 安装 mc 客户端
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
mv mc /usr/local/bin/

# 配置别名
mc alias set local http://127.0.0.1:9000 ruoyi ruoyi123

# 镜像备份到本地
mc mirror local/bucket-name /backup/minio/bucket-name_$(date +%Y%m%d)

# 镜像备份到另一个 MinIO
mc mirror local/bucket-name remote/bucket-name

# ==================== 恢复数据 ====================
# 恢复数据目录
tar -xzvf /backup/minio/minio_data_20250101.tar.gz -C /

# 使用 mc 恢复
mc mirror /backup/minio/bucket-name_20250101 local/bucket-name
```

#### RocketMQ 备份

```bash
# ==================== 元数据备份 ====================
# 备份 Topic 配置
docker exec rocketmq-nameserver sh mqadmin topicList -n 127.0.0.1:9876 > /backup/rocketmq/topics_$(date +%Y%m%d).txt

# 备份消费组
docker exec rocketmq-nameserver sh mqadmin consumerProgress -n 127.0.0.1:9876 > /backup/rocketmq/consumers_$(date +%Y%m%d).txt

# ==================== 数据备份 ====================
# 备份存储目录
tar -czvf /backup/rocketmq/rocketmq_store_$(date +%Y%m%d).tar.gz /docker/rocketmq/broker/store

# ==================== 恢复数据 ====================
# 停止 Broker
docker stop rocketmq-broker-master

# 恢复存储目录
tar -xzvf /backup/rocketmq/rocketmq_store_20250101.tar.gz -C /

# 启动 Broker
docker start rocketmq-broker-master
```

---

## 性能优化

### JVM 参数优化

#### 堆内存配置

```yaml
environment:
  JAVA_OPTS: >-
    -Xms2g
    -Xmx2g
    -XX:MetaspaceSize=256m
    -XX:MaxMetaspaceSize=512m
    -XX:MaxDirectMemorySize=512m
```

**最佳实践:**
- `-Xms` 和 `-Xmx` 设置相同值,避免动态扩容
- 堆大小设置为物理内存的 50-70%
- 预留内存给操作系统和直接内存

#### 垃圾回收器选择

**ZGC (推荐 - Java 21):**

```yaml
JAVA_OPTS: >-
  -Xms4g
  -Xmx4g
  -XX:+UseZGC
  -XX:+ZGenerational
  -XX:MaxGCPauseMillis=50
  -XX:ConcGCThreads=4
  -XX:ParallelGCThreads=8
```

**G1 GC (Java 11+):**

```yaml
JAVA_OPTS: >-
  -Xms4g
  -Xmx4g
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=200
  -XX:G1HeapRegionSize=16m
  -XX:InitiatingHeapOccupancyPercent=45
```

**ParallelGC (吞吐量优先):**

```yaml
JAVA_OPTS: >-
  -Xms4g
  -Xmx4g
  -XX:+UseParallelGC
  -XX:ParallelGCThreads=8
  -XX:MaxGCPauseMillis=100
```

#### JVM 诊断参数

```yaml
JAVA_OPTS: >-
  -XX:+HeapDumpOnOutOfMemoryError
  -XX:HeapDumpPath=/ruoyi/server/logs/
  -XX:+PrintGCDetails
  -XX:+PrintGCDateStamps
  -Xloggc:/ruoyi/server/logs/gc.log
  -XX:+UseGCLogFileRotation
  -XX:NumberOfGCLogFiles=5
  -XX:GCLogFileSize=20M
  -Djava.security.egd=file:/dev/./urandom
```

**参数说明:**

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `-Xms` | 初始堆大小 | 与 -Xmx 相同 |
| `-Xmx` | 最大堆大小 | 物理内存 50-70% |
| `-XX:MetaspaceSize` | 元空间初始大小 | 256m |
| `-XX:MaxMetaspaceSize` | 元空间最大大小 | 512m |
| `-XX:MaxDirectMemorySize` | 直接内存大小 | 512m |
| `-XX:+UseZGC` | 使用 ZGC | Java 17+ 推荐 (JDK 21 更佳) |
| `-XX:MaxGCPauseMillis` | 最大 GC 暂停时间 | 50-200ms |
| `-XX:+HeapDumpOnOutOfMemoryError` | OOM 时生成堆转储 | 必须开启 |

### 容器资源限制

#### CPU 限制

```yaml
services:
  ryplus_uni_workflow:
    cpus: "2.0"  # 限制使用 2 个 CPU
    cpu_shares: 1024  # CPU 权重
```

**或使用 deploy 语法 (Swarm/Kubernetes):**

```yaml
services:
  ryplus_uni_workflow:
    deploy:
      resources:
        limits:
          cpus: '2.0'
        reservations:
          cpus: '1.0'
```

#### 内存限制

```yaml
services:
  ryplus_uni_workflow:
    mem_limit: 4g  # 最大内存 4GB
    memswap_limit: 4g  # 禁用 swap
    mem_reservation: 2g  # 预留内存
```

**或使用 deploy 语法:**

```yaml
services:
  ryplus_uni_workflow:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

**注意:** 容器内存限制必须大于 JVM 堆内存 + 元空间 + 直接内存 + 操作系统开销。

**推荐配置:**
- 容器内存: 4GB
- JVM 堆内存: 2GB (`-Xms2g -Xmx2g`)
- 元空间: 512MB
- 直接内存: 512MB
- 剩余: ~1GB (操作系统、线程栈等)

### 连接池优化

#### HikariCP 数据库连接池

```yaml
environment:
  DB_MAX_POOL_SIZE: 100  # 最大连接数
  DB_MIN_IDLE: 20        # 最小空闲连接
  DB_CONNECTION_TIMEOUT: 30000  # 连接超时 (毫秒)
  DB_IDLE_TIMEOUT: 600000       # 空闲超时 (10分钟)
  DB_MAX_LIFETIME: 1800000      # 连接最大生命周期 (30分钟)
```

**计算公式:**
```
connections = ((core_count * 2) + effective_spindle_count)

# 示例: 4核CPU, 1个数据库服务器
connections = (4 * 2) + 1 = 9 ~ 10
```

**生产环境推荐:**
- 单实例: 50-100 连接
- 多实例: 根据实例数量调整,总连接数不超过数据库最大连接数

#### Redisson Redis 连接池

```yaml
environment:
  REDISSON_THREADS: 16              # IO 线程数
  REDISSON_NETTY_THREADS: 32        # Netty 线程数
  REDISSON_MIN_IDLE: 32             # 最小空闲连接
  REDISSON_POOL_SIZE: 64            # 连接池大小
  REDISSON_IDLE_TIMEOUT: 10000      # 空闲超时
  REDISSON_CONNECT_TIMEOUT: 10000   # 连接超时
  REDISSON_TIMEOUT: 3000            # 响应超时
```

**推荐配置:**
- 小规模: threads=16, poolSize=64
- 中规模: threads=32, poolSize=128
- 大规模: threads=64, poolSize=256

### Undertow Web 容器优化

```yaml
environment:
  # Undertow 线程池配置
  UNDERTOW_IO_THREADS: 8      # IO 线程 (通常为 CPU 核心数)
  UNDERTOW_WORKER_THREADS: 256  # Worker 线程 (IO 密集型可增加)

  # 缓冲区配置
  UNDERTOW_BUFFER_SIZE: 512    # 缓冲区大小 (字节)
  UNDERTOW_DIRECT_BUFFERS: true  # 使用直接内存

  # HTTP 配置
  UNDERTOW_MAX_HTTP_POST_SIZE: -1  # 最大请求体大小 (-1 不限制)
```

**线程数计算:**
- IO 线程: CPU 核心数 (1-2倍)
- Worker 线程: 根据业务类型
  - CPU 密集型: 核心数 * 1.5
  - IO 密集型: 核心数 * 2 ~ 4

---

## 安全最佳实践

### 1. 使用非 root 用户

```dockerfile
# 创建专用用户
RUN groupadd -r ruoyi && useradd -r -g ruoyi ruoyi

# 设置目录权限
RUN chown -R ruoyi:ruoyi /ruoyi/server

# 切换用户
USER ruoyi
```

### 2. 最小化镜像

- 使用精简基础镜像 (`alpine`, `distroless`)
- 多阶段构建分离编译和运行环境
- 删除不必要的文件和依赖

### 3. 扫描镜像漏洞

```bash
# 使用 Trivy 扫描镜像
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ryplus_uni_workflow:5.4.1

# 使用 Clair 扫描
clair-scanner --ip $(hostname -I | awk '{print $1}') ryplus_uni_workflow:5.4.1
```

### 4. 限制容器能力

```yaml
services:
  ryplus_uni_workflow:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # 仅添加必要的能力
    read_only: true  # 只读根文件系统
    tmpfs:
      - /tmp
      - /ruoyi/server/temp
```

### 5. 网络隔离

```yaml
services:
  ryplus_uni_workflow:
    networks:
      - frontend  # 仅加入必要的网络

networks:
  frontend:
    driver: bridge
    internal: true  # 内部网络,不连接外网
```

### 6. 敏感信息管理

**使用 Docker Secrets (Swarm):**

```yaml
services:
  ryplus_uni_workflow:
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

**使用环境变量文件:**

```yaml
services:
  ryplus_uni_workflow:
    env_file:
      - .env.local  # 不提交到版本控制
```

### 7. 日志安全

```yaml
services:
  ryplus_uni_workflow:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=ryplus"
```

### 8. 更新策略

```bash
# 定期更新基础镜像
docker pull bellsoft/liberica-openjdk-rocky:21.0.8-cds

# 重新构建镜像
docker build -t ryplus_uni_workflow:5.4.2 .

# 扫描新镜像
trivy image ryplus_uni_workflow:5.4.2

# 更新部署
docker-compose up -d
```

---

## 故障排查

### 1. 容器启动失败

**问题现象:** 容器反复重启,状态为 `Restarting`

**排查步骤:**

```bash
# 1. 查看容器日志
docker logs ryplus_uni_workflow

# 2. 查看最近50行日志
docker logs --tail 50 ryplus_uni_workflow

# 3. 查看容器状态
docker inspect ryplus_uni_workflow | grep -A 10 State

# 4. 查看退出码
docker inspect ryplus_uni_workflow | grep ExitCode
```

**常见原因:**

| 退出码 | 原因 | 解决方案 |
|--------|------|----------|
| 1 | 应用启动异常 | 检查配置文件、环境变量 |
| 137 | 内存不足被 OOM Killer 杀死 | 增加内存限制或优化 JVM 参数 |
| 139 | 段错误 (Segmentation Fault) | 检查 JVM 参数、依赖库版本 |
| 143 | 被 SIGTERM 信号终止 | 正常终止,检查停止原因 |

### 2. 数据库连接失败

**问题现象:** 日志报 `Cannot acquire connection from pool`

**排查步骤:**

```bash
# 1. 检查 MySQL 服务
docker ps | grep mysql

# 2. 测试 MySQL 连接
docker exec mysql mysql -uroot -p'mysql123456' -e "SELECT 1"

# 3. 检查网络连接
docker exec ryplus_uni_workflow ping -c 3 127.0.0.1

# 4. 检查端口监听
netstat -tlnp | grep 3306
```

**解决方案:**

```yaml
# 增加连接池大小
environment:
  DB_MAX_POOL_SIZE: 100
  DB_MIN_IDLE: 30
  DB_CONNECTION_TIMEOUT: 60000

# 检查数据库最大连接数
docker exec mysql mysql -uroot -p'mysql123456' -e "SHOW VARIABLES LIKE 'max_connections'"

# 增加数据库最大连接数 (修改 my.cnf)
max_connections=500
```

### 3. Redis 连接超时

**问题现象:** 日志报 `Unable to connect to Redis` 或 `RedisCommandTimeoutException`

**排查步骤:**

```bash
# 1. 检查 Redis 服务
docker exec redis redis-cli -a ruoyi123 PING

# 2. 检查 Redis 慢查询
docker exec redis redis-cli -a ruoyi123 SLOWLOG GET 10

# 3. 检查 Redis 连接数
docker exec redis redis-cli -a ruoyi123 CLIENT LIST

# 4. 检查 Redis 内存使用
docker exec redis redis-cli -a ruoyi123 INFO memory
```

**解决方案:**

```yaml
# 调整超时时间
environment:
  REDISSON_TIMEOUT: 10000  # 增加到 10 秒
  REDISSON_CONNECT_TIMEOUT: 10000

# 检查 Redis 密码配置
environment:
  REDIS_PASSWORD: ruoyi123  # 必须与 redis.conf 一致
```

### 4. 容器内存不足

**问题现象:** 容器被 OOM Killer 杀死,退出码 137

**排查步骤:**

```bash
# 1. 查看容器资源使用
docker stats ryplus_uni_workflow

# 2. 查看系统内存
free -h

# 3. 查看 OOM Killer 日志
dmesg | grep -i "killed process"

# 4. 分析 JVM 堆转储
ls -lh /home/ubuntu/apps/ryplus_uni_workflow/logs/*.hprof
```

**解决方案:**

```yaml
# 增加容器内存限制
services:
  ryplus_uni_workflow:
    mem_limit: 8g  # 从 4g 增加到 8g

# 或优化 JVM 参数
environment:
  JAVA_OPTS: "-Xms2g -Xmx2g"  # 降低堆内存
```

### 5. Nginx 502 Bad Gateway

**问题现象:** 访问返回 502 错误

**排查步骤:**

```bash
# 1. 检查后端服务是否启动
curl http://127.0.0.1:5500/actuator/health

# 2. 检查 Nginx 配置
nginx -t

# 3. 查看 Nginx 错误日志
tail -f /docker/nginx/log/error.log

# 4. 检查端口监听
netstat -tlnp | grep -E "5500|5501"
```

**解决方案:**

```bash
# 重启后端服务
docker restart ryplus_uni_workflow

# 重新加载 Nginx 配置
docker exec nginx-web nginx -s reload

# 检查 upstream 配置
grep -A 5 "upstream ryplus_server" /docker/nginx/conf/nginx.conf
```

### 6. 磁盘空间不足

**问题现象:** 容器无法启动,日志报 `no space left on device`

**排查步骤:**

```bash
# 1. 查看磁盘使用
df -h

# 2. 查看 Docker 磁盘使用
docker system df

# 3. 查看大文件
du -sh /docker/* | sort -hr | head -10
du -sh /home/ubuntu/apps/*/logs/* | sort -hr | head -10
```

**清理方案:**

```bash
# 清理未使用的容器
docker container prune

# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源
docker system prune -a --volumes

# 清理日志文件
find /home/ubuntu/apps/*/logs -name "*.log" -mtime +7 -delete
find /docker/*/log -name "*.log" -mtime +7 -delete

# 清理 Docker 日志
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### 7. 端口冲突

**问题现象:** 容器启动失败,日志报 `address already in use`

**排查步骤:**

```bash
# 查看端口占用
netstat -tlnp | grep 5500
lsof -i:5500

# 查找占用端口的进程
ps aux | grep <PID>
```

**解决方案:**

```bash
# 停止占用端口的服务
kill <PID>

# 或修改服务端口
environment:
  SERVER_PORT: 5502  # 使用不同端口
```

---

## 监控与日志

### 容器监控

#### cAdvisor (Google)

```yaml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    privileged: true
    restart: always
```

访问: `http://localhost:8080`

#### Prometheus + Grafana

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9091:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: always

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus
    restart: always

volumes:
  prometheus_data:
  grafana_data:
```

**Prometheus 配置** (`prometheus.yml`):

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['127.0.0.1:5500', '127.0.0.1:5501']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['127.0.0.1:8080']
```

### 日志收集

#### ELK Stack (Elasticsearch + Logstash + Kibana)

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    restart: always

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logstash
    ports:
      - "5044:5044"
      - "9600:9600"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
    restart: always

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    restart: always

volumes:
  es_data:
```

**Logstash 配置** (`logstash.conf`):

```ruby
input {
  file {
    path => "/logs/*/info.log"
    type => "info"
    codec => multiline {
      pattern => "^\d{4}-\d{2}-\d{2}"
      negate => true
      what => "previous"
    }
  }
  file {
    path => "/logs/*/error.log"
    type => "error"
    codec => multiline {
      pattern => "^\d{4}-\d{2}-\d{2}"
      negate => true
      what => "previous"
    }
  }
}

filter {
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{DATA:thread} %{JAVACLASS:class} - %{GREEDYDATA:msg}"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "ryplus-%{+YYYY.MM.dd}"
  }
}
```

---

## 总结

容器化技术为 RuoYi-Plus-UniApp 项目提供了标准化、可重复、易扩展的部署方案。通过本文档介绍的最佳实践:

**1. 架构设计**
- 清晰的服务分层和依赖关系
- 合理的网络模式选择 (host vs bridge)
- 完善的数据持久化策略

**2. Dockerfile 编写**
- 使用官方推荐的 Liberica JDK 镜像
- 环境变量外部化,支持灵活配置
- JVM 参数优化 (ZGC, 堆转储)
- 多阶段构建减小镜像大小

**3. Docker Compose 编排**
- 完整的服务编排配置 (MySQL, Redis, RocketMQ, MinIO 等)
- 环境变量分类管理 (数据库、Redis、安全、第三方服务)
- 卷映射最佳实践 (数据持久化、配置映射)
- 服务依赖和健康检查

**4. 性能优化**
- JVM 参数调优 (堆内存、GC 选择、诊断参数)
- 容器资源限制 (CPU、内存)
- 连接池优化 (HikariCP, Redisson, Undertow)

**5. 安全加固**
- 使用非 root 用户
- 最小化镜像和漏洞扫描
- 限制容器能力和网络隔离
- 敏感信息管理 (Secrets, .env 文件)

**6. 运维管理**
- 完善的服务管理命令 (启动、停止、重启、日志)
- 数据备份与恢复 (MySQL, Redis, MinIO, RocketMQ)
- 故障排查流程 (启动失败、连接问题、OOM、502 等)
- 监控与日志收集 (cAdvisor, Prometheus, ELK)

**生产环境部署建议:**
1. 修改所有默认密码 (MySQL, Redis, MinIO, 监控中心)
2. 配置 HTTPS (Nginx SSL 证书)
3. 启用健康检查和自动重启
4. 配置资源限制防止资源耗尽
5. 建立完善的监控告警体系
6. 定期备份数据和验证恢复流程
7. 使用 CI/CD 自动化部署流程
8. 定期更新镜像和扫描漏洞

通过遵循这些最佳实践,可以构建一个高可用、高性能、易维护的容器化生产环境。
