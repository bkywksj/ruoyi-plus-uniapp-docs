# Docker 部署指南

## 概述

本指南介绍如何使用 Docker 容器化部署 RuoYi-Plus-UniApp 项目。推荐使用 **1Panel** 面板进行可视化部署,大幅降低部署难度。

**视频教程:**

> 📺 **推荐观看**: [1Panel 部署 RuoYi-Plus-UniApp 完整教程](https://www.bilibili.com/video/BV1Sz421d7nc/)
>
> 视频详细演示了从安装 1Panel 到完成项目部署的全过程,强烈建议配合本文档一起学习。

**部署方式对比:**

| 方式 | 难度 | 适合人群 | 特点 |
|------|------|----------|------|
| **1Panel 可视化部署** | ⭐ 简单 | 所有开发者 | 图形界面,一键安装,推荐 |
| Docker Compose 命令行 | ⭐⭐⭐ 中等 | 有 Linux 经验 | 灵活配置,适合定制 |

---

## 1Panel 可视化部署(推荐)

### 什么是 1Panel

1Panel 是新一代 Linux 服务器运维管理面板,提供:

- **应用商店** - 一键安装 MySQL、Redis、Nginx 等常用服务
- **容器管理** - 可视化管理 Docker 容器和镜像
- **文件管理** - 在线编辑配置文件
- **终端访问** - 网页版 SSH 终端
- **备份还原** - 自动备份数据库和应用

### 第一步:安装 1Panel

**在线安装(推荐):**

```bash
# 一键安装脚本
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```

**安装完成后:**

- 访问面板: `http://服务器IP:1panel端口`
- 使用安装时设置的账号密码登录

### 第二步:安装基础服务

在 1Panel 的**应用商店**中,依次安装以下服务:

| 服务 | 版本 | 说明 |
|------|------|------|
| MySQL | 5.7+ | 数据库,创建 `ryplus_uni_workflow` 数据库 |
| Redis | 7.0+ | 缓存服务 |
| Nginx | 最新 | Web 服务器和反向代理 |
| MinIO | 最新 | 对象存储(可选,用于文件上传) |

**安装步骤:**

1. 进入 **应用商店** → 搜索服务名
2. 点击 **安装** → 配置端口和密码
3. 等待安装完成

### 第三步:导入数据库

1. 在 1Panel 中进入 **数据库** → **MySQL**
2. 创建数据库: `ryplus_uni_workflow`,字符集选择 `utf8mb4`
3. 点击 **导入** → 上传项目 `script/sql` 目录下的 SQL 文件
4. 按顺序执行 SQL 脚本

### 第四步:部署应用

**方式一:使用 Docker Compose(推荐)**

1. 在 1Panel 中进入 **容器** → **编排**
2. 点击 **创建编排**
3. 粘贴以下配置:

```yaml
services:
  ryplus_workflow:
    image: ryplus_uni_workflow:latest
    container_name: ryplus_workflow
    environment:
      TZ: Asia/Shanghai
      SERVER_PORT: 5500
      SPRING_PROFILES_ACTIVE: prod
      # 数据库配置(修改为实际值)
      DB_HOST: 127.0.0.1
      DB_PORT: 3306
      DB_NAME: ryplus_uni_workflow
      DB_USERNAME: root
      DB_PASSWORD: your-password
      # Redis配置
      REDIS_HOST: 127.0.0.1
      REDIS_PORT: 6379
      REDIS_PASSWORD: your-redis-password
    volumes:
      - /opt/ryplus/logs:/ruoyi/server/logs
      - /opt/ryplus/upload:/ruoyi/server/upload
    network_mode: host
    restart: always
```

4. 点击 **部署** 启动服务

**方式二:使用镜像部署**

1. 在 1Panel 中进入 **容器** → **镜像**
2. 点击 **拉取镜像** 或 **导入镜像**
3. 进入 **容器** → **创建容器**
4. 配置环境变量和端口映射

### 第五步:配置 Nginx 反向代理

1. 在 1Panel 中进入 **网站** → **创建网站**
2. 选择 **反向代理**
3. 配置代理地址: `http://127.0.0.1:5500`
4. 配置域名和 SSL 证书(可选)

**Nginx 核心配置:**

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5500/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # WebSocket/SSE 支持
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_buffering off;
}
```

### 第六步:验证部署

1. 访问后端接口: `http://服务器IP:5500/actuator/health`
2. 访问前端页面: `http://服务器IP`
3. 检查日志: 在 1Panel **容器** 中查看容器日志

---

## 命令行部署(进阶)

如果您熟悉 Linux 命令行,也可以使用传统方式部署。

### 环境准备

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 创建目录
mkdir -p /opt/ryplus/{logs,upload,temp}
mkdir -p /opt/docker/{mysql/data,redis/data,nginx/conf}
```

### 构建镜像

```bash
# 进入项目目录
cd ruoyi-plus-uniapp-workflow

# Maven 打包
mvn clean package -DskipTests

# 构建镜像
cd ruoyi-admin
docker build -t ryplus_uni_workflow:latest .
```

### 启动服务

```bash
# 进入编排目录
cd script/docker/compose

# 启动所有服务
docker-compose -f Complete-compose.yml up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f ryplus_uni_workflow
```

### 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart ryplus_uni_workflow

# 查看日志
docker logs -f ryplus_uni_workflow

# 进入容器
docker exec -it ryplus_uni_workflow /bin/bash
```

---

## Dockerfile 镜像构建

应用镜像通过 Dockerfile 构建，支持 IDEA 集成开发和远程调试。

### Dockerfile 结构解析

```dockerfile
# 基础镜像：Liberica JDK 17 (带 CDS 支持)
FROM bellsoft/liberica-openjdk-rocky:17-cds
LABEL maintainer="抓蛙师"

# 创建应用目录结构
RUN mkdir -p /ruoyi/server/logs \
             /ruoyi/server/upload \
             /ruoyi/server/temp

WORKDIR /ruoyi/server

# 环境变量配置
ENV SERVER_PORT=8080 \
    SNAIL_PORT=28080 \
    DEBUG_PORT=5005 \
    DEBUG_ARGS="" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

# 暴露端口
EXPOSE ${SERVER_PORT} ${SNAIL_PORT} ${DEBUG_PORT}

# 复制构建产物
COPY ./target/ryplus_uni_workflow.jar /ruoyi/server/app.jar

# 启动命令
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
| 基础镜像 | `bellsoft/liberica-openjdk-rocky:21.0.8-cds`，支持 CDS 加速启动 |
| 工作目录 | `/ruoyi/server`，应用运行根目录 |
| 日志目录 | `/ruoyi/server/logs`，存放应用日志和堆转储文件 |
| 上传目录 | `/ruoyi/server/upload`，文件上传存储 |
| 临时目录 | `/ruoyi/server/temp`，临时文件存储 |
| GC 算法 | ZGC，低延迟垃圾回收器，适合大内存应用 |

### Maven 构建流程

**第一步：本地构建 JAR 包**

```bash
# 进入项目根目录
cd ruoyi-plus-uniapp-workflow

# 清理并打包（跳过测试）
mvn clean package -DskipTests

# 构建完成后，JAR 包位于
# ruoyi-admin/target/ryplus_uni_workflow.jar
```

**第二步：构建 Docker 镜像**

```bash
# 进入 ruoyi-admin 模块目录
cd ruoyi-admin

# 构建镜像（使用版本号标签）
docker build -t ryplus_uni_workflow:5.4.1 .

# 或构建为 latest 标签
docker build -t ryplus_uni_workflow:latest .

# 查看构建的镜像
docker images | grep ryplus_uni_workflow
```

**第三步：推送到镜像仓库（可选）**

```bash
# 标记镜像
docker tag ryplus_uni_workflow:5.4.1 your-registry/ryplus_uni_workflow:5.4.1

# 推送到私有仓库
docker push your-registry/ryplus_uni_workflow:5.4.1
```

### IDEA Docker 插件集成

IntelliJ IDEA 提供了强大的 Docker 集成能力，可以直接在 IDE 中构建和运行容器。

**配置步骤:**

1. **安装 Docker 插件**
   - 打开 `File` → `Settings` → `Plugins`
   - 搜索 `Docker` 并安装
   - 重启 IDEA

2. **连接 Docker 服务**
   - 打开 `File` → `Settings` → `Build, Execution, Deployment` → `Docker`
   - 点击 `+` 添加 Docker 连接
   - 本地 Docker：选择 `Docker for Windows/Mac`
   - 远程 Docker：选择 `TCP socket`，填入 `tcp://服务器IP:2375`

3. **配置 Dockerfile 运行**
   - 右键点击 `Dockerfile` 文件
   - 选择 `Run 'Dockerfile'`
   - 配置镜像名称和标签
   - 配置环境变量和端口映射

**IDEA 运行配置示例:**

```
Name: ryplus_uni_workflow Docker
Image tag: ryplus_uni_workflow:dev
Container name: ryplus_workflow_dev
Bind ports: 5500:8080, 5005:5005
Environment variables:
  - SPRING_PROFILES_ACTIVE=dev
  - DEBUG_ARGS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
Bind mounts:
  - /opt/ryplus/logs:/ruoyi/server/logs
```

### 远程调试配置

通过 IDEA 远程调试功能，可以直接调试运行在 Docker 容器中的应用。

**第一步：启用调试参数**

在 Docker Compose 配置中启用调试：

```yaml
services:
  ryplus_uni_workflow:
    environment:
      # 启用远程调试
      DEBUG_ARGS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
      DEBUG_PORT: 5005
```

**第二步：建立 SSH 隧道（推荐）**

为了安全起见，不建议直接暴露调试端口到公网，使用 SSH 隧道：

```bash
# 建立 SSH 隧道，将远程 5005 端口映射到本地
ssh -L 5005:127.0.0.1:5005 user@your-server-ip

# 后台运行隧道
ssh -fN -L 5005:127.0.0.1:5005 user@your-server-ip
```

**第三步：IDEA 远程调试配置**

1. 打开 `Run` → `Edit Configurations`
2. 点击左上角 `+` 号 → 选择 `Remote JVM Debug`
3. 填写配置：

| 配置项 | 值 |
|--------|-----|
| Name | ryplus_uni_workflow-远程调试 |
| Debugger mode | Attach to remote JVM |
| Host | localhost（使用SSH隧道）或 服务器IP |
| Port | 5005 |
| Command line arguments | `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005` |

4. 点击 `OK` 保存配置
5. 启动容器后，点击 Debug 按钮连接

**调试技巧:**

- 使用 `suspend=n` 参数，应用启动时不会等待调试器连接
- 使用 `suspend=y` 参数，应用会等待调试器连接后才启动（用于调试启动问题）
- 调试端口 5005 仅在开发/测试环境开放，生产环境应关闭

### 多阶段构建（可选）

对于需要在容器内编译的场景，可以使用多阶段构建：

```dockerfile
# 第一阶段：构建
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
COPY ruoyi-admin/pom.xml ruoyi-admin/
COPY ruoyi-common ruoyi-common/
COPY ruoyi-modules ruoyi-modules/
COPY ruoyi-extend ruoyi-extend/
RUN mvn dependency:go-offline
COPY . .
RUN mvn clean package -DskipTests -pl ruoyi-admin -am

# 第二阶段：运行
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds
WORKDIR /ruoyi/server
COPY --from=builder /build/ruoyi-admin/target/ryplus_uni_workflow.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**多阶段构建优势:**
- 构建环境和运行环境分离
- 最终镜像更小（不包含 Maven 和源码）
- CI/CD 流水线无需预装 Maven

---

## 部署架构

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (80/443)                   │
│              反向代理 + SSL + 负载均衡               │
└─────────────────────────┬───────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 应用实例 (5500) │ │ 监控中心 (9090) │ │ SnailJob (8800) │
└────────┬────────┘ └─────────────────┘ └─────────────────┘
         │
         ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  MySQL (3306)   │ │  Redis (6379)   │ │  MinIO (9000)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**端口说明:**

| 端口 | 服务 | 说明 |
|------|------|------|
| 80/443 | Nginx | 对外访问端口 |
| 5500 | 主应用 | 后端 API 服务 |
| 3306 | MySQL | 数据库(内部访问) |
| 6379 | Redis | 缓存(内部访问) |
| 9000/9001 | MinIO | 对象存储 |
| 9090 | 监控中心 | Spring Boot Admin |
| 8800 | SnailJob | 定时任务调度 |

---

## 环境变量配置

### 数据库配置

| 变量 | 说明 | 示例 |
|------|------|------|
| `DB_HOST` | 数据库地址 | `127.0.0.1` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_NAME` | 数据库名 | `ryplus_uni_workflow` |
| `DB_USERNAME` | 用户名 | `root` |
| `DB_PASSWORD` | 密码 | `your-password` |

### Redis 配置

| 变量 | 说明 | 示例 |
|------|------|------|
| `REDIS_HOST` | Redis 地址 | `127.0.0.1` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | 密码 | `your-password` |

### 应用配置

| 变量 | 说明 | 示例 |
|------|------|------|
| `SERVER_PORT` | 应用端口 | `5500` |
| `SPRING_PROFILES_ACTIVE` | 运行环境 | `prod` |
| `LOG_LEVEL` | 日志级别 | `info` |

---

## 生产环境检查清单

部署到生产环境前,请确认以下事项:

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ☐ 修改默认密码 | 必须 | MySQL、Redis、MinIO、监控中心 |
| ☐ 配置 HTTPS | 必须 | 使用 SSL 证书加密传输 |
| ☐ 关闭 API 文档 | 推荐 | 设置 `SPRINGDOC_ENABLED=false` |
| ☐ 配置防火墙 | 必须 | 只开放 80/443 端口 |
| ☐ 设置备份策略 | 必须 | 定期备份数据库和文件 |
| ☐ 配置监控告警 | 推荐 | 监控服务状态和资源使用 |

---

## 常见问题

### 容器无法启动

**排查步骤:**

```bash
# 查看容器日志
docker logs ryplus_uni_workflow

# 检查端口占用
netstat -tlnp | grep 5500

# 检查内存
free -h
```

**常见原因:**
- 数据库连接失败 → 检查 DB_HOST 和 DB_PASSWORD
- 端口被占用 → 更换端口或停止占用进程
- 内存不足 → 增加服务器内存或调整 JVM 参数

### 数据库连接失败

```bash
# 测试数据库连接
docker exec -it mysql mysql -uroot -p

# 检查数据库是否存在
SHOW DATABASES;
```

### Nginx 502 错误

```bash
# 检查后端服务
curl http://127.0.0.1:5500/actuator/health

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

---

## 更多资源

- 📺 **视频教程**: [1Panel 部署教程](https://www.bilibili.com/video/BV1Sz421d7nc/)
- 🔧 **1Panel 官网**: https://1panel.cn
- 📖 **Docker 官方文档**: https://docs.docker.com
