# ruoyi-common-bom 依赖管理模块

## 1. 模块概述

ruoyi-common-bom 是common通用模块的统一依赖管理模块，负责定义和管理所有common子模块的版本信息。通过 bom
模式实现了依赖版本的统一管理，避免了版本冲突，简化了项目维护。

- **GroupId**: `plus.ruoyi`
- **ArtifactId**: `ruoyi-common-bom`
- **当前版本**: `5.4.0`
- **打包方式**: `pom`

## 2. BOM 架构设计

### 2.1 版本管理策略

```xml

<properties>
    <revision>5.4.0</revision>
</properties>
```

- 采用统一版本号管理
- 所有模块使用 `${revision}` 占位符
- 便于版本升级和发布管理

### 2.2 依赖管理范围

通过 父pom文件（根目录pom文件）`<dependencyManagement>` 统一管理 30+ 个功能模块的版本，确保整个项目的依赖一致性。

## 3. 功能模块分类

### 3.1 核心基础模块 (Core Foundation)

| 模块名称        | ArtifactId              | 功能说明               |
|-------------|-------------------------|--------------------|
| **核心模块**    | `ruoyi-common-core`     | 基础工具类与通用功能，系统核心依赖  |
| **安全模块**    | `ruoyi-common-security` | 应用安全防护功能，包含加密、验证等  |
| **Web服务模块** | `ruoyi-common-web`      | Web应用基础功能支持，MVC配置等 |
| **日志记录模块**  | `ruoyi-common-log`      | 统一日志处理功能，日志切面和存储   |

**特点**: 这些是系统的基础设施模块，几乎所有其他模块都会依赖它们。

### 3.2 数据处理模块 (Data Processing)

| 模块名称          | ArtifactId               | 功能说明            |
|---------------|--------------------------|-----------------|
| **数据库服务模块**   | `ruoyi-common-mybatis`   | MyBatis增强与数据库交互 |
| **缓存服务模块**    | `ruoyi-common-redis`     | Redis缓存集成与工具    |
| **序列化模块**     | `ruoyi-common-json`      | JSON序列化与反序列化工具  |
| **数据库加解密模块**  | `ruoyi-common-encrypt`   | 敏感数据加密存储        |
| **Excel处理模块** | `ruoyi-common-excel`     | Excel导入导出功能     |
| **脱敏模块**      | `ruoyi-common-sensitive` | 数据脱敏与隐私保护       |
| **OSS模块**     | `ruoyi-common-oss`       | 对象存储服务集成        |
| **翻译模块**      | `ruoyi-common-serialmap` | 多语言支持与国际化       |

**特点**: 专注于数据的存储、处理、转换和安全保护。

### 3.3 安全与认证模块 (Security & Authentication)

| 模块名称          | ArtifactId             | 功能说明            |
|---------------|------------------------|-----------------|
| **SaToken模块** | `ruoyi-common-satoken` | 权限认证框架，统一认证管理   |
| **租户模块**      | `ruoyi-common-tenant`  | 多租户支持，数据隔离      |
| **社交登录模块**    | `ruoyi-common-social`  | 第三方账号集成，OAuth登录 |

**特点**: 提供完整的身份认证和授权解决方案。

### 3.4 通信与消息模块 (Communication & Messaging)

| 模块名称            | ArtifactId               | 功能说明          |
|-----------------|--------------------------|---------------|
| **邮件服务模块**      | `ruoyi-common-mail`      | 邮件发送集成，支持模板邮件 |
| **短信模块**        | `ruoyi-common-sms`       | 短信发送集成，验证码服务  |
| **WebSocket模块** | `ruoyi-common-websocket` | 实时双向通信支持      |
| **SSE模块**       | `ruoyi-common-sse`       | 服务器发送事件支持     |

**特点**: 覆盖了现代应用的各种通信需求。

### 3.5 API与接口模块 (API & Documentation)

| 模块名称       | ArtifactId         | 功能说明                         |
|------------|--------------------|------------------------------|
| **接口文档模块** | `ruoyi-common-doc` | API文档生成与测试，集成Swagger/OpenAPI |

**特点**: 提供API文档自动生成和在线测试能力。

### 3.6 系统功能模块 (System Features)

| 模块名称     | ArtifactId                 | 功能说明      |
|----------|----------------------------|-----------|
| **调度模块** | `ruoyi-common-job`         | 定时任务与作业调度 |
| **幂等模块** | `ruoyi-common-idempotent`  | 防止重复提交与操作 |
| **限流模块** | `ruoyi-common-ratelimiter` | 接口限流与流量控制 |

**特点**: 提供系统级的高级功能支持。

### 3.7 业务扩展模块 (Business Extensions)

| 模块名称        | ArtifactId             | 功能说明      |
|-------------|------------------------|-----------|
| **微信小程序模块** | `ruoyi-common-miniapp` | 微信小程序开发支持 |
| **微信公众号模块** | `ruoyi-common-mp`      | 微信公众号开发支持 |
| **支付模块**    | `ruoyi-common-pay`     | 支付功能集成    |

**特点**: 面向具体业务场景的功能模块。

## 4. BOM 使用优势

### 4.1 版本统一管理

- ✅ **一处修改，全局生效**: 只需修改 `revision` 属性即可升级所有模块
- ✅ **避免版本冲突**: 确保所有模块使用相同版本，减少兼容性问题
- ✅ **简化维护**: 集中管理依赖版本，降低维护成本

### 4.2 依赖管理简化

```xml
<!-- 在子项目中，只需引用 artifactId，无需指定版本 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
    <!-- 版本由 BOM 统一管理，无需指定 -->
</dependency>
```

### 4.3 模块化架构

- ✅ **高内聚低耦合**: 每个模块职责单一，功能清晰
- ✅ **按需引入**: 项目可根据需要选择性引入模块
- ✅ **扩展灵活**: 新功能可独立成模块，不影响现有架构

## 5. 模块依赖关系

```
ruoyi-common-bom (根依赖管理)
├── 核心基础层
│   ├── ruoyi-common-core (基础工具)
│   ├── ruoyi-common-security (安全防护)
│   ├── ruoyi-common-web (Web支持)
│   └── ruoyi-common-log (日志处理)
├── 数据处理层
│   ├── ruoyi-common-mybatis (数据库)
│   ├── ruoyi-common-redis (缓存)
│   ├── ruoyi-common-json (序列化)
│   └── ... (其他数据处理模块)
├── 认证授权层
│   ├── ruoyi-common-satoken (认证)
│   ├── ruoyi-common-tenant (多租户)
│   └── ruoyi-common-social (社交登录)
├── 通信消息层
│   ├── ruoyi-common-websocket (实时通信)
│   ├── ruoyi-common-sse (服务推送)
│   └── ... (其他通信模块)
└── 业务扩展层
    ├── ruoyi-common-miniapp (小程序)
    ├── ruoyi-common-pay (支付)
    └── ... (其他业务模块)
```

## 6. 最佳实践建议

### 6.1 使用 BOM 的项目配置

```xml
<!-- 在父 POM 中引入 BOM -->
<dependencyManagement>
    <dependencies>
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

### 6.2 模块选择策略

- **必选模块**: `core`, `security`, `web`, `log`
- **数据相关**: 根据存储需求选择 `mybatis`, `redis`, `json` 等
- **认证授权**: 根据安全需求选择 `satoken`, `tenant` 等
- **业务功能**: 根据具体业务场景按需选择
