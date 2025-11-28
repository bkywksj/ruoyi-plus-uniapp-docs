# CI/CD 持续集成与部署

## 概述

持续集成(Continuous Integration, CI)和持续部署(Continuous Deployment, CD)是现代软件工程的核心实践,通过自动化构建、测试和部署流程,显著提升开发效率和软件质量。RuoYi-Plus-UniApp 项目采用 Maven + Docker + Docker Compose 的技术栈,实现了完整的 CI/CD 工作流。

**核心价值:**

- **自动化构建** - Maven 多模块项目一键打包,减少人工干预
- **标准化部署** - Docker 容器化确保环境一致性,避免"在我机器上能跑"问题
- **快速交付** - 从代码提交到生产部署全流程自动化,缩短发布周期
- **版本管理** - 镜像版本化管理,支持快速回滚和灰度发布
- **环境隔离** - 容器化部署实现开发、测试、生产环境隔离

**技术架构:**

```
┌─────────────────────────────────────────────────────────────────┐
│                       CI/CD 工作流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [代码提交]                                                      │
│      │                                                          │
│      ↓                                                          │
│  ┌──────────────────────────────────────────┐                  │
│  │   版本控制 (Git/GitLab/GitHub)           │                  │
│  │   - 分支管理: master/develop/feature     │                  │
│  │   - 代码审查: Pull Request/Merge Request │                  │
│  │   - 变更追踪: Commit History             │                  │
│  └──────────────────────────────────────────┘                  │
│      │                                                          │
│      ↓                                                          │
│  ┌──────────────────────────────────────────┐                  │
│  │   持续集成 (CI Pipeline)                  │                  │
│  │   ├─ 代码检出: Git Clone                  │                  │
│  │   ├─ 依赖安装: Maven/pnpm Install         │                  │
│  │   ├─ 代码编译: Maven Compile              │                  │
│  │   ├─ 单元测试: JUnit/Vitest               │                  │
│  │   ├─ 代码质量: SonarQube (可选)           │                  │
│  │   └─ 构建产物: JAR/Docker Image           │                  │
│  └──────────────────────────────────────────┘                  │
│      │                                                          │
│      ↓                                                          │
│  ┌──────────────────────────────────────────┐                  │
│  │   制品管理 (Artifact Repository)          │                  │
│  │   - Docker Registry: Harbor/Docker Hub   │                  │
│  │   - Maven仓库: Nexus/Artifactory         │                  │
│  │   - 版本标签: v5.5.0 / latest            │                  │
│  └──────────────────────────────────────────┘                  │
│      │                                                          │
│      ↓                                                          │
│  ┌──────────────────────────────────────────┐                  │
│  │   持续部署 (CD Pipeline)                  │                  │
│  │   ├─ 环境准备: Docker/K8s                 │                  │
│  │   ├─ 镜像拉取: docker pull                │                  │
│  │   ├─ 容器编排: docker-compose up          │                  │
│  │   ├─ 健康检查: Health Check               │                  │
│  │   └─ 流量切换: Blue-Green/Canary          │                  │
│  └──────────────────────────────────────────┘                  │
│      │                                                          │
│      ↓                                                          │
│  ┌──────────────────────────────────────────┐                  │
│  │   运维监控 (DevOps)                       │                  │
│  │   - 应用监控: Spring Boot Admin           │                  │
│  │   - 日志采集: ELK Stack                   │                  │
│  │   - 告警通知: 钉钉/企业微信               │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Maven 构建体系

### 项目结构

RuoYi-Plus-UniApp 采用 Maven 多模块项目结构,支持模块化开发和独立构建:

```
ruoyi-plus-uniapp-workflow/
├── pom.xml                          # 父POM,统一依赖管理
├── ruoyi-admin/                     # 后端主模块(打包入口)
│   ├── pom.xml
│   ├── Dockerfile                   # 容器化配置
│   └── target/
│       └── ryplus_uni_workflow.jar  # 最终产物
├── ruoyi-common/                    # 通用模块(31个子模块)
│   ├── ruoyi-common-core/
│   ├── ruoyi-common-redis/
│   ├── ruoyi-common-mybatis/
│   └── ...
├── ruoyi-modules/                   # 业务模块(5个子模块)
│   ├── ruoyi-system/
│   ├── ruoyi-generator/
│   ├── ruoyi-workflow/
│   ├── ruoyi-business/
│   └── ruoyi-mall/
├── ruoyi-extend/                    # 扩展模块(2个子模块)
│   ├── ruoyi-monitor-admin/
│   └── ruoyi-snailjob-server/
└── script/                          # 脚本和配置
    ├── bin/                         # 部署脚本
    ├── docker/                      # Docker配置
    └── sql/                         # 数据库脚本
```

### 父POM配置

父POM定义了项目的版本号、依赖版本和构建插件:

```xml
<!-- pom.xml -->
<project>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-plus-uniapp</artifactId>
    <version>${revision}</version>
    <packaging>pom</packaging>

    <properties>
        <!-- 项目版本号 -->
        <revision>5.5.0</revision>

        <!-- 核心框架版本 -->
        <spring-boot.version>3.5.6</spring-boot.version>
        <java.version>21</java.version>
        <mybatis-plus.version>3.5.14</mybatis-plus.version>
        <satoken.version>1.44.0</satoken.version>
        <redisson.version>3.51.0</redisson.version>

        <!-- 打包默认跳过测试 -->
        <skipTests>true</skipTests>
    </properties>

    <!-- 多环境配置 -->
    <profiles>
        <profile>
            <id>dev</id>
            <properties>
                <profiles.active>dev</profiles.active>
            </properties>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
        </profile>
        <profile>
            <id>prod</id>
            <properties>
                <profiles.active>prod</profiles.active>
            </properties>
        </profile>
    </profiles>

    <!-- 子模块 -->
    <modules>
        <module>ruoyi-admin</module>
        <module>ruoyi-common</module>
        <module>ruoyi-extend</module>
        <module>ruoyi-modules</module>
    </modules>
</project>
```

**配置说明:**

| 配置项 | 说明 | 值 |
|--------|------|-----|
| `revision` | 项目版本号,统一管理 | 5.5.0 |
| `spring-boot.version` | Spring Boot版本 | 3.5.6 |
| `java.version` | JDK版本要求 | 21 |
| `profiles.active` | 激活的环境配置 | dev/prod |
| `skipTests` | 打包时跳过测试 | true |

### 构建插件配置

Maven构建插件定义了编译、测试、打包的行为:

```xml
<build>
    <plugins>
        <!-- 编译插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.14.0</version>
            <configuration>
                <source>${java.version}</source>
                <target>${java.version}</target>
                <encoding>UTF-8</encoding>

                <!-- 注解处理器配置 -->
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                        <version>1.18.40</version>
                    </path>
                    <path>
                        <groupId>io.github.linpeilie</groupId>
                        <artifactId>mapstruct-plus-processor</artifactId>
                        <version>1.5.0</version>
                    </path>
                    <path>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-configuration-processor</artifactId>
                        <version>${spring-boot.version}</version>
                    </path>
                </annotationProcessorPaths>

                <!-- 保留方法参数名 -->
                <compilerArgs>
                    <arg>-parameters</arg>
                </compilerArgs>
            </configuration>
        </plugin>

        <!-- 单元测试插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.5.3</version>
            <configuration>
                <argLine>-Dfile.encoding=UTF-8 -XX:+EnableDynamicAgentLoading</argLine>
                <!-- 执行@Tag注解标注的指定环境的测试方法 -->
                <groups>${profiles.active}</groups>
                <!-- 排除标签 -->
                <excludedGroups>exclude</excludedGroups>
            </configuration>
        </plugin>

        <!-- 统一版本号管理 -->
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>flatten-maven-plugin</artifactId>
            <version>1.3.0</version>
            <configuration>
                <updatePomFile>true</updatePomFile>
                <flattenMode>resolveCiFriendliesOnly</flattenMode>
            </configuration>
            <executions>
                <execution>
                    <id>flatten</id>
                    <phase>process-resources</phase>
                    <goals>
                        <goal>flatten</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

**插件功能说明:**

| 插件 | 功能 | 关键配置 |
|------|------|----------|
| `maven-compiler-plugin` | Java源码编译 | JDK 21、注解处理器、参数保留 |
| `maven-surefire-plugin` | 单元测试执行 | UTF-8编码、环境标签过滤 |
| `flatten-maven-plugin` | 版本号扁平化 | 支持 `${revision}` 变量 |

### 后端构建流程

#### 本地构建

```bash
# 1. 清理并编译
mvn clean compile

# 2. 打包(跳过测试)
mvn clean package -DskipTests

# 3. 打包生产环境
mvn clean package -Pprod -DskipTests

# 4. 安装到本地仓库
mvn clean install -DskipTests

# 5. 仅编译指定模块
cd ruoyi-admin
mvn clean package -DskipTests
```

**构建产物:**

```
ruoyi-admin/target/
├── ryplus_uni_workflow.jar              # 可执行JAR包
├── ryplus_uni_workflow.jar.original     # 原始JAR(不含依赖)
├── classes/                             # 编译后的class文件
└── maven-archiver/
    └── pom.properties                   # 构建元数据
```

#### CI环境构建

```yaml
# GitLab CI配置示例 (.gitlab-ci.yml)
stages:
  - build
  - test
  - package
  - deploy

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
  JAVA_VERSION: "21"

# 构建阶段
build:backend:
  stage: build
  image: bellsoft/liberica-openjdk-rocky:21
  cache:
    paths:
      - .m2/repository/
  script:
    - mvn clean compile -DskipTests
  artifacts:
    paths:
      - ruoyi-admin/target/
    expire_in: 1 hour

# 测试阶段
test:backend:
  stage: test
  image: bellsoft/liberica-openjdk-rocky:21
  cache:
    paths:
      - .m2/repository/
  script:
    - mvn test -Pdev
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    reports:
      junit: ruoyi-admin/target/surefire-reports/TEST-*.xml

# 打包阶段
package:backend:
  stage: package
  image: bellsoft/liberica-openjdk-rocky:21
  cache:
    paths:
      - .m2/repository/
  script:
    - mvn clean package -Pprod -DskipTests
  artifacts:
    paths:
      - ruoyi-admin/target/ryplus_uni_workflow.jar
    expire_in: 7 days
  only:
    - master
    - develop
```

### 前端构建流程

前端使用 Vite + pnpm 进行构建:

```json
// package.json
{
  "name": "ryplus_uni_workflow",
  "version": "5.5.0",
  "scripts": {
    "dev": "vite serve --mode development",
    "build:prod": "vite build --mode production",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint:eslint": "eslint --max-warnings=0 --timeout=60000",
    "lint:eslint:fix": "eslint --fix --timeout=60000"
  },
  "engines": {
    "node": ">=18.18.0",
    "npm": ">=8.9.0",
    "pnpm": ">=7.30"
  }
}
```

**构建命令:**

```bash
# 1. 安装依赖
cd plus-ui
pnpm install

# 2. 开发模式(热重载)
pnpm dev

# 3. 构建生产环境
pnpm build:prod

# 4. 预览构建结果
pnpm preview
```

**构建产物:**

```
plus-ui/dist/
├── assets/
│   ├── index-[hash].js        # 主JS包
│   ├── vendor-[hash].js       # 第三方库
│   └── index-[hash].css       # 样式文件
├── index.html                 # 入口HTML
└── favicon.ico
```

**CI环境构建:**

```yaml
# 前端构建任务 (.gitlab-ci.yml)
build:frontend:
  stage: build
  image: node:20-alpine
  cache:
    paths:
      - plus-ui/node_modules/
      - plus-ui/.pnpm-store/
  before_script:
    - corepack enable
    - corepack prepare pnpm@latest --activate
  script:
    - cd plus-ui
    - pnpm install --frozen-lockfile
    - pnpm build:prod
  artifacts:
    paths:
      - plus-ui/dist/
    expire_in: 7 days
  only:
    - master
    - develop
```

---

## Docker 容器化

### Dockerfile 配置

后端应用使用 Liberica JDK 21 作为基础镜像:

```dockerfile
# ruoyi-admin/Dockerfile
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

**Dockerfile 特性解析:**

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| `FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds` | 基础镜像 | Liberica JDK 21 + CDS加速 |
| `WORKDIR /ruoyi/server` | 工作目录 | 统一应用路径 |
| `SERVER_PORT` | 应用端口 | 8080(默认)，可通过环境变量覆盖 |
| `SNAIL_PORT` | SnailJob端口 | 28080，定时任务通信 |
| `SPRING_PROFILES_ACTIVE` | Spring环境 | prod/dev |
| `-XX:+UseZGC` | 垃圾回收器 | ZGC低延迟GC |
| `-XX:+HeapDumpOnOutOfMemoryError` | OOM转储 | 自动生成heap dump |

### 构建Docker镜像

```bash
# 1. 先打包JAR
mvn clean package -Pprod -DskipTests

# 2. 构建Docker镜像
cd ruoyi-admin
docker build -t ryplus_uni_workflow:5.5.0 .

# 3. 查看镜像
docker images | grep ryplus_uni_workflow

# 4. 运行容器测试
docker run -d \
  --name ryplus_test \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  ryplus_uni_workflow:5.5.0

# 5. 查看日志
docker logs -f ryplus_test

# 6. 停止并删除
docker stop ryplus_test
docker rm ryplus_test
```

### 多阶段构建(优化版)

减小镜像体积,实现构建和运行分离:

```dockerfile
# Dockerfile-multistage
# 第一阶段: 构建
FROM bellsoft/liberica-openjdk-rocky:21 AS builder

WORKDIR /build

# 复制Maven配置和源码
COPY pom.xml .
COPY ruoyi-admin ruoyi-admin
COPY ruoyi-common ruoyi-common
COPY ruoyi-modules ruoyi-modules
COPY ruoyi-extend ruoyi-extend

# 下载依赖并构建
RUN ./mvnw clean package -Pprod -DskipTests

# 第二阶段: 运行
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds

LABEL maintainer="抓蛙师"

WORKDIR /ruoyi/server

# 仅复制JAR包
COPY --from=builder /build/ruoyi-admin/target/ryplus_uni_workflow.jar /ruoyi/server/app.jar

# 环境变量和启动命令(同上)
ENV SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

EXPOSE ${SERVER_PORT}

ENTRYPOINT ["java", "-jar", "/ruoyi/server/app.jar"]
```

**多阶段构建优势:**

- **镜像体积减小** - 最终镜像不包含Maven、源码等构建工具
- **安全性提升** - 运行镜像不包含敏感源码
- **构建缓存优化** - Maven依赖层可复用

---

## Docker Compose 编排

### 应用编排配置

使用Docker Compose管理应用及其依赖服务:

```yaml
# script/docker/compose/RuoyiPlus-compose.yml
services:
  ryplus_uni_workflow:
    image: ryplus_uni_workflow:5.5.0
    container_name: ryplus_uni_workflow

    # 资源限制(可选)
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

    environment:
      # ==================== 基础配置 ====================
      TZ: Asia/Shanghai
      SERVER_PORT: 5500
      SNAIL_PORT: 25500
      SPRING_PROFILES_ACTIVE: prod
      LOG_LEVEL: info

      # ==================== 数据库配置 ====================
      DB_HOST: 127.0.0.1
      DB_PORT: 3306
      DB_NAME: ryplus_uni_workflow
      DB_USERNAME: ryplus_uni_workflow
      DB_PASSWORD: your-database-password
      DB_MAX_POOL_SIZE: 50
      DB_MIN_IDLE: 20

      # ==================== Redis配置 ====================
      REDIS_HOST: 127.0.0.1
      REDIS_PORT: 6379
      REDIS_DATABASE: 0
      REDIS_PASSWORD: "your-redis-password"
      REDIS_SSL_ENABLED: false

      # Redisson连接池
      REDISSON_THREADS: 16
      REDISSON_NETTY_THREADS: 32
      REDISSON_MIN_IDLE: 32
      REDISSON_POOL_SIZE: 64

      # ==================== 安全配置 ====================
      JWT_SECRET_KEY: uDkkASPQVN5iR4eN
      API_ENCRYPT_ENABLED: true
      API_RESPONSE_PUBLIC_KEY: MFwwDQYJ...
      API_REQUEST_PRIVATE_KEY: MIIBOgIB...

      # ==================== 监控配置 ====================
      MONITOR_ENABLED: true
      MONITOR_URL: http://127.0.0.1:9090/admin
      MONITOR_USERNAME: ruoyi
      MONITOR_PASSWORD: 123456

      # ==================== 定时任务配置 ====================
      SNAIL_JOB_ENABLED: true
      SNAIL_JOB_HOST: 127.0.0.1
      SNAIL_JOB_PORT: 17888
      SNAIL_JOB_TOKEN: SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT

      # ==================== 第三方服务配置 ====================
      GAODE_MAP_API_KEY: your-gaode-api-key
      MAIL_ENABLED: false
      ROCKETMQ_ENABLED: false

    volumes:
      # 日志文件映射
      - /home/ubuntu/apps/ryplus_uni_workflow/logs/:/ruoyi/server/logs/
      # 文件上传目录映射
      - /home/ubuntu/apps/ryplus_uni_workflow/upload/:/ruoyi/server/upload/
      # 临时文件目录映射
      - /home/ubuntu/apps/ryplus_uni_workflow/temp/:/ruoyi/server/temp/
      # 微信支付证书目录映射
      - /home/ubuntu/apps/wxpay/:/ruoyi/server/wxpay/

    # 特权模式 - 允许容器访问宿主机设备
    privileged: true

    # 网络模式 - 使用宿主机网络
    network_mode: "host"

    # 重启策略 - 容器异常退出时自动重启
    restart: always
```

**配置分类说明:**

| 配置类别 | 说明 | 关键参数 |
|---------|------|----------|
| 基础运行环境 | JVM、时区、端口 | `SPRING_PROFILES_ACTIVE`、`SERVER_PORT` |
| 数据库配置 | MySQL主从库、连接池 | `DB_HOST`、`DB_MAX_POOL_SIZE` |
| Redis配置 | 缓存服务器、Redisson池 | `REDIS_HOST`、`REDISSON_POOL_SIZE` |
| 安全配置 | JWT、API加密、文档开关 | `JWT_SECRET_KEY`、`API_ENCRYPT_ENABLED` |
| 监控配置 | Spring Boot Admin | `MONITOR_ENABLED`、`MONITOR_URL` |
| 定时任务 | SnailJob客户端 | `SNAIL_JOB_ENABLED`、`SNAIL_JOB_HOST` |
| 第三方服务 | 地图、邮件、短信、MQ | `GAODE_MAP_API_KEY`、`MAIL_ENABLED` |

### 完整部署栈

包含数据库、Redis、Nginx的完整部署栈:

```yaml
# script/docker/compose/Complete-compose.yml
version: '3.8'

services:
  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: ryplus_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: ryplus_uni_workflow
      MYSQL_USER: ryplus_uni_workflow
      MYSQL_PASSWORD: your-database-password
      TZ: Asia/Shanghai
    volumes:
      - mysql_data:/var/lib/mysql
      - ./script/sql:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --default-time-zone=+08:00
    restart: always

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: ryplus_redis
    command: redis-server --requirepass your-redis-password
    environment:
      TZ: Asia/Shanghai
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: always

  # RuoYi-Plus应用
  app:
    image: ryplus_uni_workflow:5.5.0
    container_name: ryplus_uni_workflow
    depends_on:
      - mysql
      - redis
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      REDIS_HOST: redis
      REDIS_PORT: 6379
      # 其他配置...
    volumes:
      - app_logs:/ruoyi/server/logs
      - app_upload:/ruoyi/server/upload
    ports:
      - "8080:8080"
    restart: always

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: ryplus_nginx
    depends_on:
      - app
    volumes:
      - ./script/docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./plus-ui/dist:/usr/share/nginx/html:ro
    ports:
      - "80:80"
      - "443:443"
    restart: always

volumes:
  mysql_data:
  redis_data:
  app_logs:
  app_upload:
```

### 启动和管理命令

```bash
# 1. 启动所有服务
docker-compose -f Complete-compose.yml up -d

# 2. 查看运行状态
docker-compose -f Complete-compose.yml ps

# 3. 查看日志
docker-compose -f Complete-compose.yml logs -f app

# 4. 停止所有服务
docker-compose -f Complete-compose.yml stop

# 5. 重启特定服务
docker-compose -f Complete-compose.yml restart app

# 6. 停止并删除容器
docker-compose -f Complete-compose.yml down

# 7. 停止并删除容器和卷
docker-compose -f Complete-compose.yml down -v

# 8. 扩展服务实例(负载均衡)
docker-compose -f Complete-compose.yml up -d --scale app=3

# 9. 更新服务镜像
docker-compose -f Complete-compose.yml pull
docker-compose -f Complete-compose.yml up -d

# 10. 查看资源使用情况
docker-compose -f Complete-compose.yml top
```

---

## 部署脚本

### Linux部署脚本

项目提供了Shell脚本简化部署操作:

```bash
#!/bin/sh
# script/bin/ry.sh
# 使用: ./ry.sh start|stop|restart|status

AppName=ryplus_uni_workflow.jar

# JVM参数
JVM_OPTS="-Dname=$AppName \
  -Duser.timezone=Asia/Shanghai \
  -Xms512m -Xmx1024m \
  -XX:MetaspaceSize=128m \
  -XX:MaxMetaspaceSize=512m \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:+UseZGC"

APP_HOME=`pwd`
LOG_PATH=$APP_HOME/logs/$AppName.log

function start()
{
    PID=`ps -ef |grep java|grep $AppName|grep -v grep|awk '{print $2}'`

    if [ x"$PID" != x"" ]; then
        echo "$AppName is running..."
    else
        nohup java $JVM_OPTS -jar $AppName > /dev/null 2>&1 &
        echo "Start $AppName success..."
    fi
}

function stop()
{
    echo "Stop $AppName"

    PID=""
    query(){
        PID=`ps -ef |grep java|grep $AppName|grep -v grep|awk '{print $2}'`
    }

    query
    if [ x"$PID" != x"" ]; then
        kill -TERM $PID
        echo "$AppName (pid:$PID) exiting..."
        while [ x"$PID" != x"" ]
        do
            sleep 1
            query
        done
        echo "$AppName exited."
    else
        echo "$AppName already stopped."
    fi
}

function restart()
{
    stop
    sleep 2
    start
}

function status()
{
    PID=`ps -ef |grep java|grep $AppName|grep -v grep|wc -l`
    if [ $PID != 0 ];then
        echo "$AppName is running..."
    else
        echo "$AppName is not running..."
    fi
}

case $1 in
    start)
    start;;
    stop)
    stop;;
    restart)
    restart;;
    status)
    status;;
    *)
    echo "Usage: $0 {start|stop|restart|status}"
esac
```

**脚本功能:**

| 命令 | 功能 | 说明 |
|------|------|------|
| `./ry.sh start` | 启动应用 | 检查是否已运行,nohup后台启动 |
| `./ry.sh stop` | 停止应用 | 优雅关闭(TERM信号),等待退出 |
| `./ry.sh restart` | 重启应用 | 先停止后启动,间隔2秒 |
| `./ry.sh status` | 查看状态 | 检查进程是否存在 |

**JVM参数说明:**

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `-Xms512m` | 初始堆大小 | 512m-1g |
| `-Xmx1024m` | 最大堆大小 | 1g-4g |
| `-XX:MetaspaceSize` | 元空间初始大小 | 128m |
| `-XX:MaxMetaspaceSize` | 元空间最大大小 | 512m |
| `-XX:+HeapDumpOnOutOfMemoryError` | OOM时dump内存 | 必须开启 |
| `-XX:+UseZGC` | 使用ZGC垃圾回收器 | 低延迟场景 |

### Windows部署脚本

```bat
@echo off
rem script/bin/ry.bat
rem 使用: ry.bat start|stop|status

set AppName=ryplus_uni_workflow.jar

set JVM_OPTS=-Dname=%AppName% -Duser.timezone=Asia/Shanghai -Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseZGC

if "%1" == "" goto usage
if "%1" == "start" goto start
if "%1" == "stop" goto stop
if "%1" == "status" goto status

:usage
echo Usage: ry.bat {start^|stop^|status}
goto end

:start
echo Starting %AppName%...
start /b javaw %JVM_OPTS% -jar %AppName%
echo Started %AppName%
goto end

:stop
echo Stopping %AppName%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    taskkill /F /PID %%a
)
echo Stopped %AppName%
goto end

:status
netstat -ano | findstr :8080
if %errorlevel% == 0 (
    echo %AppName% is running
) else (
    echo %AppName% is not running
)
goto end

:end
```

---

## CI/CD 流水线

### GitLab CI完整配置

```yaml
# .gitlab-ci.yml
image: docker:latest

services:
  - docker:dind

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ""
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
  DOCKER_REGISTRY: "harbor.example.com"
  IMAGE_NAME: "ryplus_uni_workflow"
  IMAGE_TAG: "${CI_COMMIT_REF_SLUG}-${CI_COMMIT_SHORT_SHA}"

stages:
  - build
  - test
  - package
  - deploy
  - rollback

# 后端构建
build:backend:
  stage: build
  image: bellsoft/liberica-openjdk-rocky:21
  cache:
    key: maven-cache
    paths:
      - .m2/repository/
  script:
    - echo "Building backend..."
    - mvn clean compile -DskipTests
  artifacts:
    paths:
      - ruoyi-admin/target/classes/
    expire_in: 1 hour
  tags:
    - docker

# 前端构建
build:frontend:
  stage: build
  image: node:20-alpine
  cache:
    key: pnpm-cache
    paths:
      - plus-ui/node_modules/
      - plus-ui/.pnpm-store/
  before_script:
    - corepack enable
    - corepack prepare pnpm@latest --activate
  script:
    - echo "Building frontend..."
    - cd plus-ui
    - pnpm install --frozen-lockfile
    - pnpm build:prod
  artifacts:
    paths:
      - plus-ui/dist/
    expire_in: 1 day
  tags:
    - docker

# 单元测试
test:unit:
  stage: test
  image: bellsoft/liberica-openjdk-rocky:21
  cache:
    key: maven-cache
    paths:
      - .m2/repository/
  script:
    - echo "Running unit tests..."
    - mvn test -Pprod
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    when: always
    reports:
      junit:
        - ruoyi-admin/target/surefire-reports/TEST-*.xml
  tags:
    - docker

# 代码质量检查
sonarqube:
  stage: test
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_HOST_URL: "http://sonarqube.example.com"
    SONAR_TOKEN: "${SONAR_TOKEN}"
  script:
    - sonar-scanner
      -Dsonar.projectKey=ryplus_uni_workflow
      -Dsonar.sources=.
      -Dsonar.host.url=${SONAR_HOST_URL}
      -Dsonar.login=${SONAR_TOKEN}
  allow_failure: true
  only:
    - develop
    - master
  tags:
    - docker

# 打包Docker镜像
package:docker:
  stage: package
  script:
    - echo "Packaging Docker image..."
    # 构建后端JAR
    - docker run --rm -v $PWD:/workspace -w /workspace bellsoft/liberica-openjdk-rocky:21 mvn clean package -Pprod -DskipTests
    # 构建Docker镜像
    - cd ruoyi-admin
    - docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
    - docker tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
    # 登录镜像仓库
    - echo ${HARBOR_PASSWORD} | docker login ${DOCKER_REGISTRY} -u ${HARBOR_USERNAME} --password-stdin
    # 推送镜像
    - docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    - docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
  only:
    - master
    - develop
  tags:
    - docker

# 部署到测试环境
deploy:test:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan ${TEST_SERVER_IP} >> ~/.ssh/known_hosts
  script:
    - echo "Deploying to test environment..."
    - ssh ${TEST_SERVER_USER}@${TEST_SERVER_IP} "
        cd /opt/ryplus_uni_workflow &&
        docker-compose pull &&
        docker-compose up -d --force-recreate &&
        docker-compose logs -f --tail=100
      "
  environment:
    name: test
    url: http://test.example.com
  only:
    - develop
  tags:
    - deploy

# 部署到生产环境
deploy:prod:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan ${PROD_SERVER_IP} >> ~/.ssh/known_hosts
  script:
    - echo "Deploying to production environment..."
    - ssh ${PROD_SERVER_USER}@${PROD_SERVER_IP} "
        cd /opt/ryplus_uni_workflow &&
        docker-compose pull &&
        docker-compose up -d --force-recreate --no-deps app &&
        sleep 10 &&
        docker-compose exec -T app curl -f http://localhost:8080/actuator/health || exit 1
      "
  environment:
    name: production
    url: https://ruoyi.plus
  when: manual
  only:
    - master
  tags:
    - deploy

# 回滚
rollback:
  stage: rollback
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan ${PROD_SERVER_IP} >> ~/.ssh/known_hosts
  script:
    - echo "Rolling back to previous version..."
    - ssh ${PROD_SERVER_USER}@${PROD_SERVER_IP} "
        cd /opt/ryplus_uni_workflow &&
        docker-compose stop app &&
        docker tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest ${DOCKER_REGISTRY}/${IMAGE_NAME}:rollback-$(date +%Y%m%d-%H%M%S) &&
        docker-compose up -d app
      "
  when: manual
  environment:
    name: production
  only:
    - master
  tags:
    - deploy
```

**流水线阶段说明:**

| 阶段 | 任务 | 触发条件 |
|------|------|----------|
| `build` | 编译后端和前端代码 | 所有分支 |
| `test` | 执行单元测试、代码扫描 | 所有分支 |
| `package` | 打包Docker镜像并推送 | master/develop分支 |
| `deploy:test` | 部署到测试环境 | develop分支自动 |
| `deploy:prod` | 部署到生产环境 | master分支手动 |
| `rollback` | 回滚到上一版本 | master分支手动 |

### GitHub Actions配置

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master, develop ]

env:
  JAVA_VERSION: '21'
  NODE_VERSION: '20'
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'liberica'
          cache: maven

      - name: Build with Maven
        run: mvn clean package -Pprod -DskipTests

      - name: Upload JAR artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-jar
          path: ruoyi-admin/target/ryplus_uni_workflow.jar
          retention-days: 7

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Install dependencies
        run: |
          cd plus-ui
          pnpm install --frozen-lockfile

      - name: Build
        run: |
          cd plus-ui
          pnpm build:prod

      - name: Upload dist artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-dist
          path: plus-ui/dist
          retention-days: 7

  test:
    runs-on: ubuntu-latest
    needs: build-backend
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'liberica'
          cache: maven

      - name: Run tests
        run: mvn test -Pprod

      - name: Publish test results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: JUnit Tests
          path: 'ruoyi-admin/target/surefire-reports/TEST-*.xml'
          reporter: java-junit

  docker:
    runs-on: ubuntu-latest
    needs: [build-backend, test]
    if: github.event_name == 'push' && (github.ref == 'refs/heads/master' || github.ref == 'refs/heads/develop')
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download JAR artifact
        uses: actions/download-artifact@v4
        with:
          name: app-jar
          path: ruoyi-admin/target/

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: ./ruoyi-admin
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-test:
    runs-on: ubuntu-latest
    needs: docker
    if: github.ref == 'refs/heads/develop'
    environment:
      name: test
      url: http://test.example.com
    steps:
      - name: Deploy to test server
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.TEST_SERVER_HOST }}
          username: ${{ secrets.TEST_SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/ryplus_uni_workflow
            docker-compose pull
            docker-compose up -d --force-recreate
            docker-compose logs -f --tail=100

  deploy-prod:
    runs-on: ubuntu-latest
    needs: docker
    if: github.ref == 'refs/heads/master'
    environment:
      name: production
      url: https://ruoyi.plus
    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.PROD_SERVER_HOST }}
          username: ${{ secrets.PROD_SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/ryplus_uni_workflow
            docker-compose pull
            docker-compose up -d --force-recreate --no-deps app
            sleep 10
            docker-compose exec -T app curl -f http://localhost:8080/actuator/health
```

---

## 部署环境管理

### 环境配置隔离

不同环境使用不同的配置文件和环境变量:

```
ruoyi-admin/src/main/resources/
├── application.yml                # 主配置
├── application-dev.yml            # 开发环境
├── application-test.yml           # 测试环境
└── application-prod.yml           # 生产环境
```

**激活指定环境:**

```yaml
# application.yml
spring:
  profiles:
    active: @profiles.active@  # 从Maven变量读取
```

```bash
# 启动时指定环境
java -jar app.jar --spring.profiles.active=prod

# 或使用环境变量
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar
```

### 敏感配置管理

**方式1: 环境变量**

```bash
# .env 文件 (不提交到Git)
DB_PASSWORD=your-database-password
REDIS_PASSWORD=your-redis-password
JWT_SECRET_KEY=your-jwt-secret
```

```yaml
# application-prod.yml
spring:
  datasource:
    password: ${DB_PASSWORD}

redis:
  password: ${REDIS_PASSWORD}
```

**方式2: Spring Cloud Config**

```yaml
# bootstrap.yml
spring:
  cloud:
    config:
      uri: http://config-server:8888
      profile: prod
      label: master
```

**方式3: Kubernetes ConfigMap/Secret**

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  application-prod.yml: |
    server:
      port: 8080

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  db-password: eW91ci1wYXNzd29yZA==  # base64编码
```

---

## 监控与日志

### 应用健康检查

```yaml
# application-prod.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
  health:
    livenessState:
      enabled: true
    readinessState:
      enabled: true
```

**健康检查端点:**

```bash
# Liveness探针 - 应用是否存活
curl http://localhost:8080/actuator/health/liveness

# Readiness探针 - 应用是否就绪
curl http://localhost:8080/actuator/health/readiness

# 完整健康状态
curl http://localhost:8080/actuator/health
```

**Docker健康检查:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

### Spring Boot Admin监控

```yaml
# application-prod.yml
spring:
  boot:
    admin:
      client:
        url: http://localhost:9090/admin
        username: ruoyi
        password: 123456
        instance:
          service-url: http://localhost:8080
```

**访问监控面板:** `http://localhost:9090`

### 日志采集

**方式1: 文件日志 + ELK**

```yaml
# logback-spring.xml
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_PATH}/app.log</file>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <customFields>{"app":"ryplus_uni_workflow","env":"prod"}</customFields>
    </encoder>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${LOG_PATH}/app-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
        <maxHistory>30</maxHistory>
    </rollingPolicy>
</appender>
```

**Filebeat采集配置:**

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /ruoyi/server/logs/*.log
    fields:
      app: ryplus_uni_workflow
      env: prod

output.logstash:
  hosts: ["logstash:5044"]
```

**方式2: Docker日志驱动**

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"
        labels: "app,env"
```

---

## 最佳实践

### 1. 版本管理策略

```bash
# 语义化版本: MAJOR.MINOR.PATCH
# 5.5.0 → 主版本.次版本.修订版本

# 镜像标签策略
docker tag app:5.5.0 app:5.5
docker tag app:5.5.0 app:5
docker tag app:5.5.0 app:latest

# Git分支策略
master         # 生产环境,仅接受合并
develop        # 开发主分支
feature/xxx    # 功能分支
hotfix/xxx     # 紧急修复分支
release/5.5.0  # 发布分支
```

### 2. 构建优化

```bash
# Maven构建优化
mvn clean package -T 4C -DskipTests  # 多线程构建
mvn clean package -pl ruoyi-admin -am  # 只构建指定模块及依赖

# Docker构建优化
# 使用.dockerignore排除不需要的文件
echo "target/" >> .dockerignore
echo "node_modules/" >> .dockerignore
echo ".git/" >> .dockerignore

# 利用构建缓存
docker build --cache-from ryplus_uni_workflow:latest -t ryplus_uni_workflow:5.5.0 .
```

### 3. 资源限制

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

**JVM内存配置建议:**

| 容器内存 | -Xms | -Xmx | MetaspaceSize |
|---------|------|------|---------------|
| 1G | 512m | 768m | 256m |
| 2G | 1024m | 1536m | 512m |
| 4G | 2048m | 3072m | 1024m |
| 8G | 4096m | 6144m | 2048m |

### 4. 零停机部署

**方式1: 滚动更新**

```bash
# 使用docker-compose滚动更新
docker-compose up -d --no-deps --scale app=2 app
sleep 30  # 等待新容器就绪
docker-compose up -d --no-deps --scale app=1 app
```

**方式2: 蓝绿部署**

```bash
# 启动绿色环境
docker-compose -f docker-compose-green.yml up -d

# 健康检查
curl -f http://green.example.com/actuator/health

# 切换流量(修改Nginx配置)
nginx -s reload

# 停止蓝色环境
docker-compose -f docker-compose-blue.yml down
```

**方式3: 金丝雀发布**

```bash
# 部署10%流量到新版本
docker-compose up -d --scale app-v1=9 --scale app-v2=1

# 观察监控指标
# 逐步增加流量
docker-compose up -d --scale app-v1=5 --scale app-v2=5

# 最终全量
docker-compose up -d --scale app-v1=0 --scale app-v2=10
```

### 5. 备份与恢复

```bash
# 数据库备份
docker exec ryplus_mysql mysqldump -u root -p ryplus_uni_workflow > backup-$(date +%Y%m%d).sql

# 数据卷备份
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_data-$(date +%Y%m%d).tar.gz -C /data .

# 恢复数据库
docker exec -i ryplus_mysql mysql -u root -p ryplus_uni_workflow < backup-20250125.sql

# 恢复数据卷
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_data-20250125.tar.gz -C /data
```

### 6. 安全加固

```yaml
# docker-compose.yml 安全配置
services:
  app:
    # 使用非root用户运行
    user: "1000:1000"

    # 只读根文件系统
    read_only: true

    # 临时目录
    tmpfs:
      - /tmp
      - /ruoyi/server/temp

    # 限制能力
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

    # 安全选项
    security_opt:
      - no-new-privileges:true
```

**镜像扫描:**

```bash
# Trivy扫描
trivy image ryplus_uni_workflow:5.5.0

# Docker Scout
docker scout cves ryplus_uni_workflow:5.5.0
```

### 7. 性能监控

**JVM监控:**

```bash
# JVM参数添加JMX
-Dcom.sun.management.jmxremote \
-Dcom.sun.management.jmxremote.port=9999 \
-Dcom.sun.management.jmxremote.authenticate=false \
-Dcom.sun.management.jmxremote.ssl=false

# 使用VisualVM连接
jvisualvm --openjmx localhost:9999
```

**Prometheus监控:**

```yaml
# application-prod.yml
management:
  metrics:
    export:
      prometheus:
        enabled: true
  endpoints:
    web:
      exposure:
        include: prometheus,health,info
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ryplus_uni_workflow'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

---

## 故障排查

### 1. 构建失败

**问题:** Maven构建失败,依赖下载超时

**解决方案:**

```xml
<!-- settings.xml - 配置镜像源 -->
<mirrors>
    <mirror>
        <id>huawei</id>
        <mirrorOf>*</mirrorOf>
        <url>https://mirrors.huaweicloud.com/repository/maven/</url>
    </mirror>
</mirrors>
```

**问题:** Node.js构建失败,内存不足

**解决方案:**

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build:prod
```

### 2. 容器启动失败

**问题:** 容器启动后立即退出

**排查步骤:**

```bash
# 查看容器日志
docker logs ryplus_uni_workflow

# 查看容器退出代码
docker inspect ryplus_uni_workflow | grep ExitCode

# 进入容器调试
docker run -it --rm ryplus_uni_workflow:5.5.0 sh

# 查看环境变量
docker exec ryplus_uni_workflow env
```

**常见原因:**

| 退出代码 | 原因 | 解决方案 |
|---------|------|----------|
| 0 | 正常退出 | 检查启动命令是否保持前台运行 |
| 1 | 应用错误 | 查看应用日志,检查配置 |
| 137 | 内存溢出(OOM Killed) | 增加内存限制,优化JVM参数 |
| 139 | 段错误 | 检查JVM版本兼容性 |

### 3. 数据库连接失败

**问题:** 应用启动报数据库连接失败

**排查步骤:**

```bash
# 检查数据库容器是否运行
docker ps | grep mysql

# 测试数据库连接
docker exec -it ryplus_mysql mysql -u root -p

# 检查网络连通性
docker exec ryplus_uni_workflow ping mysql

# 查看数据库连接配置
docker exec ryplus_uni_workflow env | grep DB_
```

**解决方案:**

```yaml
# docker-compose.yml - 添加depends_on和健康检查
services:
  mysql:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      mysql:
        condition: service_healthy
```

### 4. 部署后服务不可用

**问题:** 部署成功但503错误

**排查步骤:**

```bash
# 检查容器健康状态
docker ps
docker-compose ps

# 检查应用健康检查
curl http://localhost:8080/actuator/health

# 检查日志
docker-compose logs -f app

# 检查端口占用
netstat -tlnp | grep 8080
```

### 5. 镜像推送失败

**问题:** docker push 超时或认证失败

**解决方案:**

```bash
# 重新登录镜像仓库
docker logout harbor.example.com
docker login harbor.example.com -u username

# 配置镜像加速
# /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}

# 重启Docker
systemctl restart docker
```

---

## 总结

CI/CD是现代软件工程的基石,通过本文档介绍的实践:

1. **Maven多模块构建** - 统一依赖管理,支持模块化开发
2. **Docker容器化** - 环境一致性,简化部署流程
3. **Docker Compose编排** - 一键启动完整应用栈
4. **自动化流水线** - 代码提交到生产部署全自动化
5. **多环境管理** - 开发、测试、生产环境隔离
6. **监控与日志** - 实时监控应用健康状态
7. **安全加固** - 镜像扫描、权限限制、敏感配置管理

建议在实际项目中:
- 建立统一的CI/CD规范文档
- 配置自动化测试覆盖率要求
- 实施代码质量门禁(SonarQube)
- 定期进行镜像安全扫描
- 制定应急预案和回滚流程
- 持续优化构建和部署性能
