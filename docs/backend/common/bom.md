# ruoyi-common-bom 依赖版本管理模块

## 模块概述

`ruoyi-common-bom` 是 RuoYi-Plus 框架的统一依赖版本管理模块，采用 Maven BOM (Bill of Materials) 模式实现依赖版本的集中管理。该模块定义了框架所有通用模块的版本信息，确保整个项目的依赖版本一致性，避免版本冲突问题。

**核心特性:**

- **统一版本管理** - 通过单一的 `revision` 属性管理所有模块版本
- **依赖传递控制** - 使用 `<dependencyManagement>` 控制传递依赖版本
- **模块化设计** - 支持按需引入，每个模块职责单一
- **版本继承机制** - 子模块无需显式指定版本号
- **CI/CD友好** - 使用 flatten-maven-plugin 实现版本号的动态替换

**模块信息:**

| 属性 | 值 |
|------|-----|
| GroupId | `plus.ruoyi` |
| ArtifactId | `ruoyi-common-bom` |
| 当前版本 | `5.5.0` |
| 打包方式 | `pom` |
| 管理模块数 | 37个 |

## BOM 概念与原理

### 什么是 BOM

BOM (Bill of Materials) 是 Maven 提供的一种依赖管理机制，允许在一个 POM 文件中集中定义一组相关依赖的版本信息。当其他项目导入这个 BOM 后，就可以在声明依赖时省略版本号，由 BOM 统一提供。

```xml
<!-- BOM 的核心结构 -->
<project>
    <packaging>pom</packaging>

    <properties>
        <revision>5.5.0</revision>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>plus.ruoyi</groupId>
                <artifactId>ruoyi-common-core</artifactId>
                <version>${revision}</version>
            </dependency>
            <!-- 更多依赖定义... -->
        </dependencies>
    </dependencyManagement>
</project>
```

### BOM 工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│                      ruoyi-common-bom                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  <dependencyManagement>                                  │   │
│  │    - ruoyi-common-core: ${revision}                      │   │
│  │    - ruoyi-common-web: ${revision}                       │   │
│  │    - ruoyi-common-redis: ${revision}                     │   │
│  │    - ... (37个模块)                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ import (scope=import, type=pom)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        根 pom.xml                                │
│  <dependencyManagement>                                          │
│    <dependencies>                                                │
│      <dependency>                                                │
│        <groupId>plus.ruoyi</groupId>                            │
│        <artifactId>ruoyi-common-bom</artifactId>                │
│        <version>${revision}</version>                           │
│        <type>pom</type>                                         │
│        <scope>import</scope>                                    │
│      </dependency>                                               │
│    </dependencies>                                               │
│  </dependencyManagement>                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 继承版本信息
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    业务模块 pom.xml                              │
│  <dependencies>                                                  │
│    <dependency>                                                  │
│      <groupId>plus.ruoyi</groupId>                              │
│      <artifactId>ruoyi-common-core</artifactId>                 │
│      <!-- 无需指定版本，由 BOM 提供 -->                           │
│    </dependency>                                                 │
│  </dependencies>                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 版本占位符机制

项目采用 `${revision}` 占位符统一管理版本号，配合 `flatten-maven-plugin` 插件在构建时将占位符替换为实际版本号。

```xml
<!-- 根 pom.xml 中的版本定义 -->
<properties>
    <revision>5.5.0</revision>
</properties>

<!-- flatten-maven-plugin 配置 -->
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
        <execution>
            <id>flatten.clean</id>
            <phase>clean</phase>
            <goals>
                <goal>clean</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**工作流程:**

1. 开发时使用 `${revision}` 占位符
2. 构建时 flatten 插件将占位符替换为实际版本
3. 生成的 jar 包中 pom.xml 包含真实版本号
4. 发布到仓库时版本信息完整

## 管理模块清单

### 核心基础模块 (5个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| 核心模块 | `ruoyi-common-core` | 基础工具类、通用功能、系统核心依赖 |
| 安全模块 | `ruoyi-common-security` | 应用安全防护功能、加密验证工具 |
| Web服务模块 | `ruoyi-common-web` | Web应用基础配置、MVC支持 |
| 日志记录模块 | `ruoyi-common-log` | 统一日志处理、日志切面、操作记录 |
| 多媒体处理模块 | `ruoyi-common-media` | 图片处理、海报生成、GIF动图 |

### 数据处理模块 (8个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| 数据库服务模块 | `ruoyi-common-mybatis` | MyBatis-Plus增强、数据库交互 |
| 缓存服务模块 | `ruoyi-common-redis` | Redis缓存集成、Redisson工具 |
| 序列化模块 | `ruoyi-common-json` | JSON序列化配置、Jackson增强 |
| 数据加解密模块 | `ruoyi-common-encrypt` | 敏感数据加密存储、字段加密 |
| Excel处理模块 | `ruoyi-common-excel` | FastExcel导入导出功能 |
| 脱敏模块 | `ruoyi-common-sensitive` | 数据脱敏、隐私保护 |
| OSS模块 | `ruoyi-common-oss` | 对象存储服务(AWS S3兼容) |
| 翻译映射模块 | `ruoyi-common-serialmap` | 数据翻译、字典映射 |

### 安全认证模块 (3个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| SaToken模块 | `ruoyi-common-satoken` | 权限认证框架、统一认证管理 |
| 租户模块 | `ruoyi-common-tenant` | 多租户支持、数据隔离 |
| 社交登录模块 | `ruoyi-common-social` | 第三方账号集成、OAuth登录 |

### 通信消息模块 (7个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| 邮件服务模块 | `ruoyi-common-mail` | 邮件发送、模板邮件支持 |
| 短信模块 | `ruoyi-common-sms` | SMS4J短信发送、验证码服务 |
| WebSocket模块 | `ruoyi-common-websocket` | 实时双向通信支持 |
| SSE模块 | `ruoyi-common-sse` | 服务器发送事件支持 |
| 统一消息推送模块 | `ruoyi-common-message` | 消息路由、降级、批量发送 |
| HTTP客户端模块 | `ruoyi-common-http` | Forest网络请求客户端 |
| MQTT模块 | `ruoyi-common-mqtt` | Mica-MQTT物联网通信 |

### API接口模块 (2个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| 接口文档模块 | `ruoyi-common-doc` | SpringDoc API文档生成 |
| OpenAPI模块 | `ruoyi-common-openapi` | OpenAPI规范支持 |

### 系统功能模块 (4个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| 调度模块 | `ruoyi-common-job` | SnailJob定时任务调度 |
| 幂等模块 | `ruoyi-common-idempotent` | 防止重复提交与操作 |
| 限流模块 | `ruoyi-common-ratelimiter` | 接口限流与流量控制 |
| 消息队列模块 | `ruoyi-common-rocketmq` | RocketMQ分布式消息 |

### 业务扩展模块 (3个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| 微信小程序模块 | `ruoyi-common-miniapp` | 微信小程序开发支持 |
| 微信公众号模块 | `ruoyi-common-mp` | 微信公众号开发支持 |
| AI大模型模块 | `ruoyi-common-langchain4j` | LangChain4j AI集成 |

### 支付模块组 (6个)

| 模块名称 | ArtifactId | 功能说明 |
|----------|------------|----------|
| 支付聚合模块 | `ruoyi-common-pay` | 支付功能聚合入口 |
| 支付核心模块 | `ruoyi-common-pay-core` | 支付抽象与核心接口 |
| 微信支付模块 | `ruoyi-common-pay-wechat` | 微信支付实现 |
| 支付宝支付模块 | `ruoyi-common-pay-alipay` | 支付宝支付实现 |
| 余额支付模块 | `ruoyi-common-pay-balance` | 账户余额支付 |
| 银联支付模块 | `ruoyi-common-pay-unionpay` | 银联支付实现 |

### 测试支持模块 (1个)

| 模块名称 | ArtifactId | 功能说明 | Scope |
|----------|------------|----------|-------|
| 测试模块 | `ruoyi-common-test` | 测试工具与配置 | test |

## 第三方依赖版本

根 `pom.xml` 统一管理了所有第三方依赖的版本信息:

### 核心框架版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| Java | 17 | JDK版本要求 |
| Spring Boot | 3.5.8 | 核心框架版本 |
| MyBatis | 3.5.16 | 持久层框架 |
| MyBatis-Plus | 3.5.14 | MyBatis增强 |

### 数据处理组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| Redisson | 3.52.0 | Redis客户端 |
| Dynamic-DS | 4.3.1 | 多数据源 |
| FastExcel | 1.3.0 | Excel处理 |
| P6Spy | 3.9.1 | SQL分析 |

### 安全认证组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| Sa-Token | 1.44.0 | 权限认证 |
| JustAuth | 1.16.7 | 社交登录 |
| BouncyCastle | 1.80 | 加密库 |

### 工具库版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| Hutool | 5.8.40 | 工具集合 |
| Lombok | 1.18.40 | 代码简化 |
| MapStruct-Plus | 1.5.0 | 对象映射 |
| Guava | 33.4.8-jre | Google工具库 |

### 任务调度组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| SnailJob | 1.8.0 | 分布式任务调度 |
| Lock4j | 2.2.7 | 分布式锁 |

### 消息通信组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| RocketMQ | 5.3.1 | 消息队列 |
| RocketMQ-Spring | 2.3.3 | Spring集成 |
| Mica-MQTT | 2.5.7 | MQTT通信 |
| SMS4J | 3.3.5 | 短信服务 |

### 微信生态组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| WxJava | 4.7.6.B | 微信开发套件 |
| Alipay-SDK | 4.38.61.ALL | 支付宝SDK |

### 文档与监控组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| SpringDoc | 2.8.14 | API文档 |
| Spring Boot Admin | 3.5.5 | 监控管理 |

### AI与网络组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| LangChain4j | 0.35.0 | AI大模型集成 |
| Forest | 1.7.1 | HTTP客户端 |
| AWS SDK | 2.28.22 | S3存储 |

### 其他组件版本

| 依赖 | 版本 | 说明 |
|------|------|------|
| Warm-Flow | 1.8.3 | 工作流引擎 |
| IP2Region | 2.7.0 | IP地址定位 |
| Velocity | 2.3 | 模板引擎 |
| AnyLine | 8.7.2-20250603 | 动态ORM |

## 使用指南

### 引入 BOM

在项目的根 `pom.xml` 中引入 BOM:

```xml
<dependencyManagement>
    <dependencies>
        <!-- 引入 Spring Boot BOM -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- 引入 Hutool BOM -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-bom</artifactId>
            <version>${hutool.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- 引入 RuoYi Common BOM -->
        <dependency>
            <groupId>plus.ruoyi</groupId>
            <artifactId>ruoyi-common-bom</artifactId>
            <version>${revision}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 使用模块依赖

引入 BOM 后，在子模块中使用依赖时无需指定版本:

```xml
<dependencies>
    <!-- 核心模块 - 无需指定版本 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <!-- Web模块 - 无需指定版本 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-web</artifactId>
    </dependency>

    <!-- Redis模块 - 无需指定版本 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>
</dependencies>
```

### 覆盖版本号

如果需要使用特定版本，可以在依赖中显式指定:

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
    <!-- 显式指定版本将覆盖 BOM 中的版本 -->
    <version>5.4.0</version>
</dependency>
```

### 模块选择策略

根据项目需求选择合适的模块组合:

**最小化配置 (Web应用):**

```xml
<dependencies>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-web</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-log</artifactId>
    </dependency>
</dependencies>
```

**标准配置 (管理系统):**

```xml
<dependencies>
    <!-- 核心基础 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-web</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-security</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-log</artifactId>
    </dependency>

    <!-- 数据处理 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-mybatis</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- 认证授权 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-satoken</artifactId>
    </dependency>
</dependencies>
```

**完整配置 (企业级应用):**

```xml
<dependencies>
    <!-- 核心基础层 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-web</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-security</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-log</artifactId>
    </dependency>

    <!-- 数据处理层 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-mybatis</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-excel</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-oss</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-encrypt</artifactId>
    </dependency>

    <!-- 认证授权层 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-satoken</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-tenant</artifactId>
    </dependency>

    <!-- 通信消息层 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-sms</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-websocket</artifactId>
    </dependency>

    <!-- 系统功能层 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-job</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-idempotent</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-ratelimiter</artifactId>
    </dependency>
</dependencies>
```

## 模块依赖关系

### 层次架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           业务扩展层 (Business Extensions)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  miniapp    │ │     mp      │ │ langchain4j │ │    pay (聚合模块)        ││
│  │  小程序      │ │   公众号     │ │   AI大模型   │ │ core/wechat/alipay/...  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          系统功能层 (System Features)                        │
│  ┌───────────┐ ┌───────────┐ ┌─────────────┐ ┌───────────┐ ┌─────────────┐ │
│  │    job    │ │ idempotent│ │ ratelimiter │ │ rocketmq  │ │    mqtt     │ │
│  │  定时任务  │ │   幂等     │ │    限流     │ │  消息队列  │ │  物联网通信  │ │
│  └───────────┘ └───────────┘ └─────────────┘ └───────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         通信消息层 (Communication)                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐ │
│  │   mail    │ │    sms    │ │ websocket │ │    sse    │ │   message    │ │
│  │   邮件    │ │   短信     │ │   长连接   │ │  服务推送  │ │  统一消息推送  │ │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                          http (Forest网络客户端)                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        认证授权层 (Authentication)                           │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│  │       satoken       │ │       tenant        │ │       social        │   │
│  │     权限认证框架      │ │      多租户支持      │ │      社交登录        │   │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         数据处理层 (Data Processing)                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │  mybatis  │ │   redis   │ │   json    │ │  encrypt  │ │   excel   │     │
│  │  数据库   │ │   缓存    │ │  序列化   │ │   加密    │ │  表格处理  │     │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
│  ┌───────────┐ ┌───────────┐ ┌───────────────────────────────────────┐     │
│  │ sensitive │ │    oss    │ │              serialmap               │     │
│  │   脱敏    │ │  对象存储  │ │              数据翻译                 │     │
│  └───────────┘ └───────────┘ └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          核心基础层 (Core Foundation)                        │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │       core        │ │     security      │ │       web         │         │
│  │    核心工具类      │ │     安全防护       │ │    Web基础配置     │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │        log        │ │       media       │ │    doc/openapi    │         │
│  │      日志处理      │ │     多媒体处理     │ │      API文档       │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ruoyi-common-bom (版本管理)                            │
│                    统一定义所有模块版本，确保依赖一致性                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 核心依赖链

```
ruoyi-common-core (基础)
    │
    ├── ruoyi-common-web (依赖 core)
    │       │
    │       ├── ruoyi-common-security (依赖 web)
    │       └── ruoyi-common-log (依赖 web)
    │
    ├── ruoyi-common-mybatis (依赖 core)
    │       │
    │       └── ruoyi-common-tenant (依赖 mybatis)
    │
    ├── ruoyi-common-redis (依赖 core)
    │       │
    │       ├── ruoyi-common-satoken (依赖 redis)
    │       ├── ruoyi-common-idempotent (依赖 redis)
    │       └── ruoyi-common-ratelimiter (依赖 redis)
    │
    └── ruoyi-common-json (依赖 core)
```

## 最佳实践

### 1. 版本升级策略

```xml
<!-- 升级步骤 -->
<!-- 1. 修改根 pom.xml 中的 revision 属性 -->
<properties>
    <revision>5.6.0</revision>  <!-- 从 5.5.0 升级到 5.6.0 -->
</properties>

<!-- 2. 执行 Maven 更新 -->
<!-- mvn clean install -DskipTests -->

<!-- 3. 检查依赖冲突 -->
<!-- mvn dependency:tree -->
```

### 2. 排除传递依赖

当需要排除某个模块的传递依赖时:

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-redis</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.redisson</groupId>
            <artifactId>redisson-spring-boot-starter</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 3. 依赖范围控制

```xml
<!-- 测试依赖 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- 可选依赖 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-langchain4j</artifactId>
    <optional>true</optional>
</dependency>
```

### 4. 模块化拆分

对于大型项目，建议将依赖按功能拆分到不同的子模块:

```
my-project/
├── my-project-core/          # 核心依赖: core, web, log
├── my-project-data/          # 数据依赖: mybatis, redis, excel
├── my-project-auth/          # 认证依赖: satoken, tenant
├── my-project-message/       # 消息依赖: sms, websocket, mail
└── my-project-admin/         # 管理端: 聚合所有依赖
```

## 常见问题

### 1. 版本冲突问题

**问题描述:** 依赖版本冲突导致类找不到或方法不存在

**解决方案:**

```bash
# 查看依赖树
mvn dependency:tree

# 分析冲突
mvn dependency:analyze

# 强制使用指定版本
```

```xml
<dependencyManagement>
    <dependencies>
        <!-- 强制指定版本 -->
        <dependency>
            <groupId>conflict.group</groupId>
            <artifactId>conflict-artifact</artifactId>
            <version>correct.version</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2. BOM导入顺序问题

**问题描述:** 多个 BOM 之间版本覆盖

**解决方案:** BOM 导入顺序决定优先级，后导入的会覆盖先导入的

```xml
<dependencyManagement>
    <dependencies>
        <!-- 1. Spring Boot BOM (最先导入) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- 2. Hutool BOM -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-bom</artifactId>
            <version>${hutool.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- 3. RuoYi BOM (最后导入，优先级最高) -->
        <dependency>
            <groupId>plus.ruoyi</groupId>
            <artifactId>ruoyi-common-bom</artifactId>
            <version>${revision}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 3. flatten插件问题

**问题描述:** 构建后 pom 中版本号仍为 `${revision}`

**解决方案:** 确保 flatten 插件配置正确

```xml
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
```

### 4. 模块找不到问题

**问题描述:** 引入模块时提示找不到依赖

**解决方案:**

1. 确认模块已安装到本地仓库
2. 检查 artifactId 拼写是否正确
3. 确认 BOM 版本与模块版本一致

```bash
# 安装所有模块到本地仓库
mvn clean install -DskipTests

# 检查本地仓库
ls ~/.m2/repository/plus/ruoyi/
```

### 5. 循环依赖问题

**问题描述:** 模块之间存在循环依赖

**解决方案:**

1. 重新审视模块职责划分
2. 将公共部分提取到 core 模块
3. 使用接口解耦

```
# 错误的依赖关系
module-a → module-b → module-a (循环)

# 正确的依赖关系
module-a → module-core
module-b → module-core
```

## 版本兼容性矩阵

### JDK 与 Spring Boot 兼容性

| RuoYi-Plus 版本 | JDK 版本 | Spring Boot 版本 | 说明 |
|-----------------|----------|------------------|------|
| 5.5.x | 17+ | 3.5.x | 当前稳定版本 |
| 5.4.x | 17+ | 3.4.x | 长期支持版本 |
| 5.3.x | 17+ | 3.3.x | 维护版本 |
| 5.2.x | 17+ | 3.2.x | 停止维护 |

### 核心依赖兼容性

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        版本兼容性矩阵                                       │
├────────────────────────────────────────────────────────────────────────────┤
│  ruoyi-common-bom 5.5.0                                                    │
│  │                                                                         │
│  ├── Spring Boot 3.5.8                                                     │
│  │   ├── Spring Framework 6.2.x                                           │
│  │   ├── Jakarta EE 10                                                     │
│  │   └── Tomcat/Undertow 嵌入式服务器                                       │
│  │                                                                         │
│  ├── MyBatis-Plus 3.5.14                                                   │
│  │   ├── MyBatis 3.5.16                                                    │
│  │   └── 支持 MySQL 8.x / PostgreSQL 15+ / Oracle 19+                      │
│  │                                                                         │
│  ├── Sa-Token 1.44.0                                                       │
│  │   └── 兼容 Redis 6.x+ / 7.x                                             │
│  │                                                                         │
│  ├── Redisson 3.52.0                                                       │
│  │   └── 兼容 Redis 6.2+ / 7.x                                             │
│  │                                                                         │
│  └── Hutool 5.8.40                                                         │
│      └── 工具类全兼容                                                       │
└────────────────────────────────────────────────────────────────────────────┘
```

### 数据库兼容性

| 数据库 | 最低版本 | 推荐版本 | 备注 |
|--------|----------|----------|------|
| MySQL | 5.7 | 8.0+ | 推荐使用 InnoDB 引擎 |
| PostgreSQL | 14 | 16+ | 完整支持 |
| Oracle | 19c | 21c+ | 需要 JDBC 驱动 |
| SQL Server | 2019 | 2022 | 需要额外配置 |
| 达梦 DM | 8 | 8.3+ | 国产数据库支持 |

### Redis 兼容性

| Redis 版本 | 支持状态 | Redisson 功能 |
|------------|----------|---------------|
| 7.2+ | 完整支持 | 所有功能 |
| 7.0 | 完整支持 | 所有功能 |
| 6.2 | 完整支持 | 所有功能 |
| 6.0 | 基本支持 | 部分高级功能不可用 |
| 5.x | 不支持 | 版本过低 |

## 扩展开发指南

### 创建自定义模块

当需要扩展框架功能时，可以创建自定义模块并集成到 BOM 中。

**步骤 1: 创建模块 POM**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common</artifactId>
        <version>${revision}</version>
    </parent>

    <artifactId>ruoyi-common-custom</artifactId>
    <description>自定义扩展模块</description>

    <dependencies>
        <!-- 依赖核心模块 -->
        <dependency>
            <groupId>plus.ruoyi</groupId>
            <artifactId>ruoyi-common-core</artifactId>
        </dependency>

        <!-- 其他依赖 -->
    </dependencies>
</project>
```

**步骤 2: 添加到 BOM**

```xml
<!-- ruoyi-common-bom/pom.xml -->
<dependencyManagement>
    <dependencies>
        <!-- 现有模块... -->

        <!-- 新增自定义模块 -->
        <dependency>
            <groupId>plus.ruoyi</groupId>
            <artifactId>ruoyi-common-custom</artifactId>
            <version>${revision}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

**步骤 3: 配置自动装配**

```java
// CustomAutoConfiguration.java
@AutoConfiguration
@ConditionalOnProperty(name = "ruoyi.custom.enabled", havingValue = "true", matchIfMissing = true)
public class CustomAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public CustomService customService() {
        return new CustomServiceImpl();
    }
}
```

```
// META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
plus.ruoyi.common.custom.config.CustomAutoConfiguration
```

### 模块命名规范

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 功能模块 | `ruoyi-common-{功能}` | `ruoyi-common-websocket` |
| 子模块 | `ruoyi-common-{父模块}-{子功能}` | `ruoyi-common-pay-wechat` |
| 业务模块 | `ruoyi-{业务领域}` | `ruoyi-system` |
| 扩展模块 | `ruoyi-extend-{扩展名}` | `ruoyi-extend-monitor` |

### 模块设计原则

```java
/**
 * 模块设计原则示例
 */
// 1. 单一职责原则
// 每个模块只负责一个功能领域
@AutoConfiguration
public class SmsAutoConfiguration {
    // 只处理短信相关功能
}

// 2. 依赖倒置原则
// 高层模块不依赖低层模块，都依赖抽象
public interface MessageSender {
    void send(Message message);
}

@Component
public class SmsSender implements MessageSender {
    @Override
    public void send(Message message) {
        // 短信发送实现
    }
}

// 3. 开闭原则
// 对扩展开放，对修改关闭
@Bean
@ConditionalOnMissingBean
public MessageSender messageSender() {
    return new DefaultMessageSender();
}

// 用户可以提供自定义实现覆盖默认行为
@Bean
public MessageSender customMessageSender() {
    return new CustomMessageSender();
}
```

## 依赖优化策略

### 1. 瘦身策略

减少不必要的依赖可以加快构建速度和减小包体积。

```xml
<!-- 排除不需要的传递依赖 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
    <exclusions>
        <!-- 如果不使用 Excel 功能 -->
        <exclusion>
            <groupId>cn.idev.excel</groupId>
            <artifactId>fastexcel</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 2. 可选依赖管理

```xml
<!-- 将非核心依赖设置为可选 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-langchain4j</artifactId>
    <optional>true</optional>  <!-- AI 功能可选 -->
</dependency>

<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mqtt</artifactId>
    <optional>true</optional>  <!-- IoT 功能可选 -->
</dependency>
```

### 3. 依赖分析工具

```bash
# 分析依赖树
mvn dependency:tree

# 分析未使用的依赖
mvn dependency:analyze

# 生成依赖报告
mvn project-info-reports:dependencies

# 检查依赖更新
mvn versions:display-dependency-updates
```

### 4. 依赖冲突解决

```xml
<!-- 使用 dependencyManagement 强制指定版本 -->
<dependencyManagement>
    <dependencies>
        <!-- 解决 Jackson 版本冲突 -->
        <dependency>
            <groupId>com.fasterxml.jackson</groupId>
            <artifactId>jackson-bom</artifactId>
            <version>2.18.2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

```bash
# 查看特定依赖的来源
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind
```

## 安全更新策略

### 1. 依赖漏洞扫描

```xml
<!-- 集成 OWASP Dependency-Check -->
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>10.0.4</version>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <!-- 配置 NVD API Key 以加速检查 -->
        <nvdApiKey>${NVD_API_KEY}</nvdApiKey>
        <!-- 失败阈值 -->
        <failBuildOnCVSS>7</failBuildOnCVSS>
    </configuration>
</plugin>
```

```bash
# 执行漏洞扫描
mvn dependency-check:check

# 生成报告
mvn dependency-check:aggregate
```

### 2. 版本更新检查

```bash
# 检查所有依赖更新
mvn versions:display-dependency-updates

# 检查插件更新
mvn versions:display-plugin-updates

# 自动更新到最新补丁版本
mvn versions:use-latest-versions -DallowMajorUpdates=false -DallowMinorUpdates=false
```

### 3. 安全版本策略

| 更新类型 | 策略 | 自动化级别 |
|----------|------|------------|
| 补丁版本 (x.x.X) | 立即更新 | 可自动化 |
| 次版本 (x.X.x) | 评估后更新 | 需人工确认 |
| 主版本 (X.x.x) | 充分测试后更新 | 需完整测试 |
| 安全补丁 | 紧急更新 | 优先处理 |

### 4. 依赖锁定

```xml
<!-- 使用 versions-maven-plugin 锁定版本 -->
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>versions-maven-plugin</artifactId>
    <version>2.18.0</version>
    <configuration>
        <rulesUri>file:///${project.basedir}/version-rules.xml</rulesUri>
    </configuration>
</plugin>
```

```xml
<!-- version-rules.xml -->
<ruleset>
    <rules>
        <!-- 不允许使用 SNAPSHOT 版本 -->
        <rule groupId="*" artifactId="*">
            <ignoreVersions>
                <ignoreVersion type="regex">.*-SNAPSHOT</ignoreVersion>
            </ignoreVersions>
        </rule>
        <!-- 特定库的版本限制 -->
        <rule groupId="org.apache.logging.log4j" artifactId="*">
            <ignoreVersions>
                <ignoreVersion type="regex">2\.[0-9]\..*</ignoreVersion>
                <ignoreVersion type="regex">2\.1[0-6]\..*</ignoreVersion>
            </ignoreVersions>
        </rule>
    </rules>
</ruleset>
```

## CI/CD 集成

### 1. 构建配置

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven

    - name: Build with Maven
      run: mvn clean install -DskipTests -Drevision=${{ github.run_number }}

    - name: Run Tests
      run: mvn test

    - name: Dependency Check
      run: mvn dependency-check:check
```

### 2. 版本发布流程

```bash
# 1. 更新版本号
mvn versions:set -DnewVersion=5.6.0

# 2. 构建并验证
mvn clean install -DskipTests

# 3. 运行测试
mvn test

# 4. 部署到仓库
mvn deploy -DskipTests

# 5. 打标签
git tag v5.6.0
git push origin v5.6.0
```

### 3. 多环境配置

```xml
<!-- 不同环境的 profile -->
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <revision>5.5.0-SNAPSHOT</revision>
        </properties>
    </profile>

    <profile>
        <id>release</id>
        <properties>
            <revision>5.5.0</revision>
        </properties>
    </profile>

    <profile>
        <id>prod</id>
        <properties>
            <revision>5.5.0.RELEASE</revision>
        </properties>
    </profile>
</profiles>
```

```bash
# 使用指定 profile 构建
mvn clean install -Prelease
```

## 总结

### BOM 优势

| 优势 | 说明 |
|------|------|
| **版本统一** | 一处定义，全局生效，避免版本不一致 |
| **维护简单** | 升级只需修改 revision 属性 |
| **冲突减少** | 统一管理传递依赖版本 |
| **按需引入** | 模块化设计，用什么引什么 |
| **扩展灵活** | 新功能可独立成模块 |
| **CI/CD友好** | flatten 插件支持动态版本 |
| **安全可控** | 统一管理依赖版本，便于安全更新 |
| **兼容性保障** | 版本兼容性矩阵确保组件协同工作 |

### 核心要点

1. **统一入口**: `ruoyi-common-bom` 是所有模块版本的统一管理入口
2. **版本占位符**: 使用 `${revision}` 实现版本的集中管理
3. **flatten 插件**: 确保发布的 jar 包包含真实版本号
4. **模块化设计**: 35 个模块按功能分类，按需引入
5. **层次架构**: 从核心基础层到业务扩展层的清晰分层
6. **兼容性保障**: 完整的版本兼容性矩阵
7. **安全更新**: 集成漏洞扫描和版本更新策略

## 测试策略

### 1. 模块集成测试

验证 BOM 管理的模块能够正确集成:

```java
/**
 * BOM 模块集成测试
 */
@SpringBootTest
@ActiveProfiles("test")
class BomIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void contextLoads() {
        // 验证 Spring 上下文正常加载
        assertThat(applicationContext).isNotNull();
    }

    @Test
    void verifyCoreBeans() {
        // 验证核心模块 Bean 正确注入
        assertThat(applicationContext.containsBean("redisTemplate")).isTrue();
        assertThat(applicationContext.containsBean("sqlSessionFactory")).isTrue();
    }

    @Test
    void verifySaTokenConfiguration() {
        // 验证 Sa-Token 配置正确加载
        SaTokenConfig config = applicationContext.getBean(SaTokenConfig.class);
        assertThat(config).isNotNull();
        assertThat(config.getTokenName()).isNotEmpty();
    }
}
```

### 2. 版本一致性测试

确保所有模块使用相同版本:

```java
/**
 * 版本一致性测试
 */
@Test
void verifyVersionConsistency() throws Exception {
    String expectedVersion = "5.5.0";

    // 检查 ruoyi-common-core 版本
    Class<?> coreClass = Class.forName("plus.ruoyi.common.core.utils.StringUtils");
    Package corePackage = coreClass.getPackage();
    assertThat(corePackage.getImplementationVersion())
        .isEqualTo(expectedVersion);

    // 检查 ruoyi-common-redis 版本
    Class<?> redisClass = Class.forName("plus.ruoyi.common.redis.utils.RedisUtils");
    Package redisPackage = redisClass.getPackage();
    assertThat(redisPackage.getImplementationVersion())
        .isEqualTo(expectedVersion);
}
```

### 3. 依赖冲突检测测试

```java
/**
 * 依赖冲突检测
 */
@Test
void verifyNoDuplicateClasses() {
    // 检查是否存在重复的类定义
    ClassLoader classLoader = getClass().getClassLoader();

    try {
        // 尝试加载可能冲突的类
        Class<?> jacksonClass = classLoader.loadClass(
            "com.fasterxml.jackson.databind.ObjectMapper"
        );
        assertThat(jacksonClass).isNotNull();

        // 验证只有一个版本被加载
        URL location = jacksonClass.getProtectionDomain()
            .getCodeSource().getLocation();
        assertThat(location.toString()).contains("jackson-databind");
    } catch (ClassNotFoundException e) {
        fail("Required class not found: " + e.getMessage());
    }
}
```

### 4. 自动配置验证测试

```java
/**
 * 自动配置验证测试
 */
@SpringBootTest
class AutoConfigurationTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void verifyRedisAutoConfiguration() {
        // 验证 Redis 自动配置生效
        assertThat(context.containsBean("redissonClient")).isTrue();
        assertThat(context.containsBean("redisUtils")).isTrue();
    }

    @Test
    void verifyMybatisPlusAutoConfiguration() {
        // 验证 MyBatis-Plus 自动配置生效
        assertThat(context.containsBean("mybatisPlusInterceptor")).isTrue();
        assertThat(context.containsBean("sqlSessionFactory")).isTrue();
    }

    @Test
    void verifySaTokenAutoConfiguration() {
        // 验证 Sa-Token 自动配置生效
        assertThat(context.containsBean("stpLogic")).isTrue();
        assertThat(context.containsBean("saTokenDao")).isTrue();
    }

    @Test
    void verifyExcelAutoConfiguration() {
        // 验证 Excel 自动配置生效
        assertThat(context.containsBean("excelHelper")).isTrue();
    }
}
```

## 构建性能优化

### 1. 增量构建配置

```xml
<!-- 增量构建优化配置 -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>${maven-compiler-plugin.version}</version>
    <configuration>
        <source>${java.version}</source>
        <target>${java.version}</target>
        <encoding>${project.build.sourceEncoding}</encoding>
        <!-- 启用增量编译 -->
        <useIncrementalCompilation>true</useIncrementalCompilation>
        <!-- 显示编译警告 -->
        <showWarnings>true</showWarnings>
        <!-- 编译器参数 -->
        <compilerArgs>
            <arg>-parameters</arg>
        </compilerArgs>
    </configuration>
</plugin>
```

### 2. 并行构建配置

```bash
# 启用并行构建 (使用 CPU 核心数)
mvn clean install -T 1C

# 指定并行线程数
mvn clean install -T 4

# 跳过测试并并行构建
mvn clean install -T 1C -DskipTests
```

### 3. 依赖缓存优化

```xml
<!-- 配置本地仓库镜像加速 -->
<settings>
    <mirrors>
        <mirror>
            <id>aliyunmaven</id>
            <mirrorOf>*</mirrorOf>
            <name>阿里云公共仓库</name>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>
</settings>
```

### 4. 离线构建模式

```bash
# 首次下载所有依赖
mvn dependency:go-offline

# 后续使用离线模式构建
mvn clean install -o
```

### 5. 构建缓存配置

```xml
<!-- Maven 构建缓存扩展 -->
<extensions>
    <extension>
        <groupId>org.apache.maven.extensions</groupId>
        <artifactId>maven-build-cache-extension</artifactId>
        <version>1.2.0</version>
    </extension>
</extensions>
```

## 多项目企业级配置

### 1. 父子项目结构

```
enterprise-platform/
├── pom.xml                      # 企业级父 POM
├── common-dependencies/         # 自定义依赖 BOM
│   └── pom.xml
├── platform-core/               # 核心平台模块
│   └── pom.xml
├── platform-auth/               # 认证模块
│   └── pom.xml
├── platform-gateway/            # 网关模块
│   └── pom.xml
├── business-service-a/          # 业务服务 A
│   └── pom.xml
└── business-service-b/          # 业务服务 B
    └── pom.xml
```

### 2. 企业级父 POM 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.enterprise</groupId>
    <artifactId>enterprise-platform</artifactId>
    <version>${revision}</version>
    <packaging>pom</packaging>

    <properties>
        <revision>1.0.0</revision>
        <ruoyi.version>5.5.0</ruoyi.version>
        <spring-boot.version>3.5.8</spring-boot.version>
        <java.version>21</java.version>
    </properties>

    <modules>
        <module>common-dependencies</module>
        <module>platform-core</module>
        <module>platform-auth</module>
        <module>platform-gateway</module>
        <module>business-service-a</module>
        <module>business-service-b</module>
    </modules>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot BOM -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- RuoYi Common BOM -->
            <dependency>
                <groupId>plus.ruoyi</groupId>
                <artifactId>ruoyi-common-bom</artifactId>
                <version>${ruoyi.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- 企业自定义 BOM -->
            <dependency>
                <groupId>com.enterprise</groupId>
                <artifactId>common-dependencies</artifactId>
                <version>${revision}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

### 3. 自定义依赖 BOM

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.enterprise</groupId>
        <artifactId>enterprise-platform</artifactId>
        <version>${revision}</version>
    </parent>

    <artifactId>common-dependencies</artifactId>
    <packaging>pom</packaging>

    <properties>
        <!-- 企业自定义依赖版本 -->
        <enterprise-sdk.version>2.0.0</enterprise-sdk.version>
        <custom-utils.version>1.5.0</custom-utils.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- 企业内部 SDK -->
            <dependency>
                <groupId>com.enterprise</groupId>
                <artifactId>enterprise-sdk</artifactId>
                <version>${enterprise-sdk.version}</version>
            </dependency>

            <!-- 自定义工具库 -->
            <dependency>
                <groupId>com.enterprise</groupId>
                <artifactId>custom-utils</artifactId>
                <version>${custom-utils.version}</version>
            </dependency>

            <!-- 覆盖 RuoYi BOM 中的某些版本 -->
            <dependency>
                <groupId>cn.hutool</groupId>
                <artifactId>hutool-bom</artifactId>
                <version>5.8.41</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

## 版本迁移指南

### 从 5.4.x 迁移到 5.5.x

**主要变更:**

1. **Spring Boot 版本升级**: 3.4.x → 3.5.x
2. **JDK 最低版本**: 保持 JDK 17
3. **新增模块**: `ruoyi-common-mqtt`、`ruoyi-common-message`
4. **依赖版本更新**: Redisson 3.51.0 → 3.52.0

**迁移步骤:**

```bash
# 1. 更新版本号
# 修改根 pom.xml 中的 revision 属性
<revision>5.5.0</revision>

# 2. 清理旧构建产物
mvn clean

# 3. 更新依赖
mvn dependency:resolve

# 4. 检查依赖冲突
mvn dependency:tree

# 5. 运行测试验证
mvn test
```

**配置变更:**

```yaml
# application.yml 变更示例

# 旧配置 (5.4.x)
spring:
  data:
    redis:
      timeout: 10s

# 新配置 (5.5.x) - 保持不变，但需注意 Redisson 配置
spring:
  data:
    redis:
      timeout: 10s

# Redisson 新增配置项
redisson:
  threads: 16
  nettyThreads: 32
```

### 从 5.3.x 迁移到 5.4.x

**主要变更:**

1. **Spring Boot 版本升级**: 3.3.x → 3.4.x
2. **Virtual Threads 支持**: 新增虚拟线程配置(JDK 17+)

**JDK 17 迁移注意事项:**

```java
// 利用 JDK 17 新特性

// 1. 虚拟线程配置
@Configuration
public class VirtualThreadConfig {

    @Bean
    public TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadExecutorCustomizer() {
        return protocolHandler -> {
            protocolHandler.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        };
    }
}

// 2. Record 模式匹配
public String formatUser(Object obj) {
    return switch (obj) {
        case User(String name, int age) -> "User: " + name + ", Age: " + age;
        case Admin(String name, String role) -> "Admin: " + name + ", Role: " + role;
        default -> "Unknown";
    };
}

// 3. 字符串模板 (预览特性)
// 需要添加编译参数: --enable-preview
String greeting = STR."Hello, \{user.getName()}!";
```

## 模块自动配置机制

### 1. 自动配置原理

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Spring Boot Auto-Configuration                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. 扫描 META-INF/spring/org.springframework.boot.autoconfigure.*      │
│                              │                                          │
│                              ▼                                          │
│  2. 加载 AutoConfiguration 类列表                                        │
│                              │                                          │
│                              ▼                                          │
│  3. 评估 @Conditional 条件                                               │
│     ├── @ConditionalOnClass        (类存在时)                           │
│     ├── @ConditionalOnMissingBean  (Bean 不存在时)                       │
│     ├── @ConditionalOnProperty     (配置属性匹配时)                      │
│     └── @ConditionalOnWebApplication (Web 应用时)                        │
│                              │                                          │
│                              ▼                                          │
│  4. 注册符合条件的 Bean                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. 模块自动配置示例

```java
/**
 * Redis 模块自动配置
 */
@AutoConfiguration
@ConditionalOnClass(RedissonClient.class)
@EnableConfigurationProperties(RedissonProperties.class)
public class RedissonAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public RedissonClient redissonClient(RedissonProperties properties) {
        Config config = new Config();
        // 配置 Redisson...
        return Redisson.create(config);
    }

    @Bean
    @ConditionalOnMissingBean
    public RedisUtils redisUtils(RedissonClient redissonClient) {
        return new RedisUtils(redissonClient);
    }
}
```

### 3. 条件化配置

```java
/**
 * 按环境配置不同实现
 */
@Configuration
public class EnvironmentConfig {

    @Bean
    @Profile("dev")
    @ConditionalOnMissingBean
    public CacheManager devCacheManager() {
        // 开发环境使用简单缓存
        return new ConcurrentMapCacheManager();
    }

    @Bean
    @Profile("prod")
    @ConditionalOnMissingBean
    public CacheManager prodCacheManager(RedissonClient redissonClient) {
        // 生产环境使用 Redis 缓存
        return new RedissonSpringCacheManager(redissonClient);
    }
}
```

## 注意事项

### 1. 版本一致性

确保所有模块使用相同的 `revision` 版本，避免版本不一致导致的兼容性问题:

```xml
<!-- 错误示例: 混用不同版本 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
    <version>5.5.0</version>  <!-- 硬编码版本 -->
</dependency>
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-redis</artifactId>
    <version>5.4.0</version>  <!-- 不同版本 -->
</dependency>

<!-- 正确示例: 使用 BOM 统一管理 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
    <!-- 版本由 BOM 提供 -->
</dependency>
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-redis</artifactId>
    <!-- 版本由 BOM 提供 -->
</dependency>
```

### 2. BOM 导入顺序

BOM 的导入顺序决定版本优先级，后导入的会覆盖先导入的:

```xml
<dependencyManagement>
    <dependencies>
        <!-- 1. Spring Boot BOM (基础) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- 2. 第三方 BOM -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-bom</artifactId>
            <version>${hutool.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- 3. RuoYi BOM (优先级最高) -->
        <dependency>
            <groupId>plus.ruoyi</groupId>
            <artifactId>ruoyi-common-bom</artifactId>
            <version>${revision}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 3. 模块依赖传递

理解模块间的依赖传递关系，避免重复引入:

```xml
<!-- ruoyi-common-web 已包含 ruoyi-common-core -->
<!-- 无需重复引入 -->
<dependencies>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-web</artifactId>
        <!-- 自动包含 core 模块 -->
    </dependency>

    <!-- 不需要再引入 core -->
    <!-- <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency> -->
</dependencies>
```

### 4. 可选依赖处理

对于可选依赖，需要在使用时显式引入:

```xml
<!-- ruoyi-common-langchain4j 是可选模块 -->
<!-- 只有需要 AI 功能时才引入 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-langchain4j</artifactId>
</dependency>

<!-- 同样，支付模块也是可选的 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-pay-wechat</artifactId>
</dependency>
```

### 5. 测试依赖范围

测试模块有特殊的 scope 设置:

```xml
<!-- 测试依赖只在测试阶段可用 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-test</artifactId>
    <scope>test</scope>  <!-- 仅测试范围 -->
</dependency>
```

### 6. 构建环境要求

确保构建环境满足最低要求:

| 组件 | 最低版本 | 推荐版本 |
|------|----------|----------|
| JDK | 17 | 17.0.10+ |
| Maven | 3.9.0 | 3.9.9+ |
| Git | 2.30 | 2.45+ |
| IDE | IntelliJ 2024.1 | 2024.3+ |

### 7. 内存配置建议

大型项目构建时的 JVM 内存配置:

```bash
# .mvn/jvm.config
-Xms512m
-Xmx2g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# 或设置环境变量
export MAVEN_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC"
```

### 8. 私服部署注意

部署到企业私服时的配置:

```xml
<!-- distributionManagement 配置 -->
<distributionManagement>
    <repository>
        <id>releases</id>
        <url>http://nexus.example.com/repository/maven-releases/</url>
    </repository>
    <snapshotRepository>
        <id>snapshots</id>
        <url>http://nexus.example.com/repository/maven-snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

```bash
# 部署命令
mvn deploy -DskipTests -Drevision=5.5.0
```
