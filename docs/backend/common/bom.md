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
| Java | 21 | JDK版本要求 |
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

## BOM 优势总结

| 优势 | 说明 |
|------|------|
| **版本统一** | 一处定义，全局生效，避免版本不一致 |
| **维护简单** | 升级只需修改 revision 属性 |
| **冲突减少** | 统一管理传递依赖版本 |
| **按需引入** | 模块化设计，用什么引什么 |
| **扩展灵活** | 新功能可独立成模块 |
| **CI/CD友好** | flatten 插件支持动态版本 |
