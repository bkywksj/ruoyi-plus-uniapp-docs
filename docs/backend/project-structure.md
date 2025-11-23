# 项目结构

## 项目概览

RuoYi-Plus-UniApp 后端采用 Spring Boot 3.x + Java 21 构建,遵循模块化、分层架构设计原则。项目包含入口模块、通用模块、业务模块和扩展模块四大核心部分,共计 40+ 个子模块,提供完整的企业级应用开发基础设施。

**技术栈版本:**

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 21 | LTS 长期支持版本 |
| Spring Boot | 3.5.x | 核心框架 |
| MyBatis-Plus | 3.5.14 | ORM 框架 |
| Sa-Token | 1.44.0 | 认证授权框架 |
| Redisson | 3.51.0 | Redis 客户端 |
| Hutool | 5.8.40 | 工具类库 |
| Warm-Flow | 1.8.1 | 工作流引擎 |
| SnailJob | 1.8.0 | 分布式任务调度 |
| LangChain4j | 0.35.0 | AI 大模型集成 |
| WxJava | 4.7.6.B | 微信开发工具包 |

## 完整目录结构

```text
📁 ruoyi-plus-uniapp-workflow (项目根目录)
│
├── 📁 ruoyi-admin                      // 🚀 系统入口模块 - 打包部署的主模块
│   └── 📁 src/main
│       ├── 📁 java/plus/ruoyi
│       │   └── 📄 RuoYiApplication.java    // 启动类
│       └── 📁 resources
│           ├── 📄 application.yml          // 主配置文件
│           ├── 📄 application-dev.yml      // 开发环境配置
│           ├── 📄 application-prod.yml     // 生产环境配置
│           └── 📁 i18n                     // 国际化资源
│
├── 📁 ruoyi-common                      // 🔧 通用工具模块 (35个子模块)
│   │
│   ├── 📁 ruoyi-common-bom             // 依赖版本管理 (BOM)
│   │   └── 📄 pom.xml                      // 统一版本定义
│   │
│   ├── 📁 ruoyi-common-core            // 核心模块 ⭐
│   │   └── 📁 src/main/java/plus/ruoyi/common/core
│   │       ├── 📁 annotation               // 自定义注解
│   │       ├── 📁 config                   // 核心配置
│   │       ├── 📁 constant                 // 常量定义
│   │       ├── 📁 domain                   // 基础领域模型
│   │       │   ├── 📄 R.java               // 统一响应结果
│   │       │   ├── 📄 PageQuery.java       // 分页查询参数
│   │       │   └── 📄 BaseEntity.java      // 基础实体类
│   │       ├── 📁 enums                    // 枚举类
│   │       ├── 📁 exception               // 异常处理
│   │       │   ├── 📄 ServiceException.java    // 业务异常
│   │       │   └── 📄 GlobalExceptionHandler.java
│   │       ├── 📁 factory                  // 工厂类
│   │       ├── 📁 service                  // 核心服务
│   │       └── 📁 utils                    // 工具类
│   │           ├── 📄 StringUtils.java     // 字符串工具
│   │           ├── 📄 DateUtils.java       // 日期工具
│   │           ├── 📄 BeanCopyUtils.java   // Bean 拷贝
│   │           ├── 📄 ServletUtils.java    // Servlet 工具
│   │           └── 📄 SpringUtils.java     // Spring 工具
│   │
│   ├── 📁 ruoyi-common-doc             // 接口文档模块 (SpringDoc/Knife4j)
│   ├── 📁 ruoyi-common-encrypt         // 数据加密模块 (AES/RSA/SM4)
│   ├── 📁 ruoyi-common-excel           // Excel 处理模块 (FastExcel)
│   ├── 📁 ruoyi-common-http            // HTTP 客户端模块 (Forest)
│   ├── 📁 ruoyi-common-idempotent      // 幂等性处理模块
│   ├── 📁 ruoyi-common-job             // 定时任务模块 (SnailJob)
│   ├── 📁 ruoyi-common-json            // JSON 序列化模块 (Jackson)
│   ├── 📁 ruoyi-common-langchain4j     // AI 大模型模块 (LangChain4j) 🆕
│   ├── 📁 ruoyi-common-log             // 日志处理模块
│   ├── 📁 ruoyi-common-mail            // 邮件发送模块
│   ├── 📁 ruoyi-common-media           // 媒体文件处理模块 🆕
│   ├── 📁 ruoyi-common-miniapp         // 微信小程序模块 (WxJava)
│   ├── 📁 ruoyi-common-mp              // 微信公众号模块 (WxJava)
│   ├── 📁 ruoyi-common-mybatis         // MyBatis-Plus 配置模块
│   ├── 📁 ruoyi-common-openapi         // OpenAPI 接口规范模块 🆕
│   ├── 📁 ruoyi-common-oss             // 对象存储模块 (S3 兼容)
│   │   └── 📁 src/main/java/plus/ruoyi/common/oss
│   │       ├── 📁 client                   // OSS 客户端
│   │       │   ├── 📄 OssClient.java       // 统一客户端接口
│   │       │   └── 📄 OssFactory.java      // 客户端工厂
│   │       ├── 📁 strategy                 // 存储策略
│   │       │   ├── 📄 OssStrategy.java     // 策略接口
│   │       │   ├── 📄 S3OssStrategy.java   // S3 兼容策略
│   │       │   └── 📄 LocalOssStrategy.java // 本地存储策略
│   │       └── 📁 properties               // 配置属性
│   │
│   ├── 📁 ruoyi-common-pay             // 支付模块 (4个子模块) 💰
│   │   ├── 📁 ruoyi-common-pay-core        // 支付核心抽象
│   │   ├── 📁 ruoyi-common-pay-alipay      // 支付宝支付
│   │   ├── 📁 ruoyi-common-pay-wechat      // 微信支付
│   │   └── 📁 ruoyi-common-pay-balance     // 余额支付
│   │
│   ├── 📁 ruoyi-common-ratelimiter     // 限流模块 (Redisson)
│   ├── 📁 ruoyi-common-redis           // Redis 缓存模块 (Redisson)
│   │   └── 📁 src/main/java/plus/ruoyi/common/redis
│   │       ├── 📁 config                   // Redis 配置
│   │       ├── 📁 handler                  // 处理器
│   │       ├── 📁 manager                  // 缓存管理器
│   │       └── 📁 utils
│   │           ├── 📄 RedisUtils.java      // Redis 工具类
│   │           └── 📄 CacheUtils.java      // 缓存工具类
│   │
│   ├── 📁 ruoyi-common-rocketmq        // 消息队列模块 (RocketMQ) 🆕
│   ├── 📁 ruoyi-common-satoken         // Sa-Token 认证配置
│   ├── 📁 ruoyi-common-security        // 安全模块
│   ├── 📁 ruoyi-common-sensitive       // 数据脱敏模块
│   ├── 📁 ruoyi-common-serialMap       // 序列化映射模块
│   ├── 📁 ruoyi-common-sms             // 短信模块 (SMS4J)
│   ├── 📁 ruoyi-common-social          // 社交登录模块 (JustAuth)
│   ├── 📁 ruoyi-common-sse             // SSE 服务端推送模块
│   ├── 📁 ruoyi-common-tenant          // 多租户模块
│   ├── 📁 ruoyi-common-test            // 测试工具模块 🆕
│   ├── 📁 ruoyi-common-web             // Web 通用配置模块
│   └── 📁 ruoyi-common-websocket       // WebSocket 模块
│
├── 📁 ruoyi-modules                     // 📦 业务功能模块 (5个子模块)
│   │
│   ├── 📁 ruoyi-system                 // 系统管理模块 ⭐
│   │   └── 📁 src/main/java/plus/ruoyi/system
│   │       ├── 📁 auth                     // 认证授权
│   │       │   ├── 📁 controller           // 登录控制器
│   │       │   ├── 📁 domain               // 认证领域模型
│   │       │   │   ├── 📁 bo               // 业务对象
│   │       │   │   └── 📁 vo               // 视图对象
│   │       │   ├── 📁 listener             // 事件监听器
│   │       │   └── 📁 service              // 认证服务
│   │       │       └── 📁 impl
│   │       │
│   │       ├── 📁 config                   // 系统配置
│   │       │   ├── 📁 controller           // 配置管理控制器
│   │       │   ├── 📁 dao                  // 数据访问对象
│   │       │   ├── 📁 domain               // 配置领域模型
│   │       │   ├── 📁 mapper               // MyBatis 映射
│   │       │   └── 📁 service              // 配置服务
│   │       │
│   │       ├── 📁 core                     // 核心 RBAC 功能
│   │       │   ├── 📁 controller           // 用户/角色/菜单/部门控制器
│   │       │   ├── 📁 dao                  // 数据访问对象
│   │       │   ├── 📁 domain               // 核心领域模型
│   │       │   │   ├── 📁 bo               // SysUserBo, SysRoleBo 等
│   │       │   │   └── 📁 vo               // SysUserVo, SysRoleVo 等
│   │       │   ├── 📁 mapper               // 用户/角色/菜单 Mapper
│   │       │   └── 📁 service              // 核心业务服务
│   │       │
│   │       ├── 📁 dict                     // 数据字典
│   │       │   ├── 📁 controller           // 字典控制器
│   │       │   ├── 📁 domain               // 字典领域模型
│   │       │   ├── 📁 mapper               // 字典 Mapper
│   │       │   └── 📁 service              // 字典服务
│   │       │
│   │       ├── 📁 monitor                  // 系统监控
│   │       │   ├── 📁 controller           // 在线用户/服务监控
│   │       │   └── 📁 service              // 监控服务
│   │       │
│   │       ├── 📁 oss                      // 文件存储管理
│   │       │   ├── 📁 controller           // 文件上传/下载控制器
│   │       │   ├── 📁 domain               // OSS 领域模型
│   │       │   ├── 📁 mapper               // OSS Mapper
│   │       │   └── 📁 service              // OSS 业务服务
│   │       │
│   │       └── 📁 tenant                   // 多租户管理
│   │           ├── 📁 controller           // 租户管理控制器
│   │           ├── 📁 domain               // 租户领域模型
│   │           ├── 📁 mapper               // 租户 Mapper
│   │           └── 📁 service              // 租户服务
│   │
│   ├── 📁 ruoyi-business               // 业务扩展模块 ⭐
│   │   └── 📁 src/main/java/plus/ruoyi/business
│   │       ├── 📁 api                      // API 接口层
│   │       │   ├── 📁 app                  // APP 端 API
│   │       │   └── 📁 common               // 通用 API
│   │       │       └── 📁 vo               // 通用视图对象
│   │       │
│   │       ├── 📁 base                     // 基础业务
│   │       │   ├── 📁 authStrategy         // 认证策略 (小程序/公众号)
│   │       │   ├── 📁 controller           // 基础控制器
│   │       │   ├── 📁 dao                  // 数据访问
│   │       │   ├── 📁 domain               // 领域模型
│   │       │   │   ├── 📁 bo               // 业务对象
│   │       │   │   └── 📁 vo               // 视图对象
│   │       │   ├── 📁 mapper               // MyBatis 映射
│   │       │   └── 📁 service              // 业务服务
│   │       │
│   │       ├── 📁 common                   // 业务通用
│   │       │   ├── 📁 domain/vo            // 通用视图对象
│   │       │   └── 📁 service              // 通用服务
│   │       │
│   │       └── 📁 job                      // 定时任务
│   │           └── 📁 demo                 // 示例任务
│   │
│   ├── 📁 ruoyi-mall                   // 商城模块 🆕
│   │   └── 📁 src/main/java/plus/ruoyi/business
│   │       ├── 📁 api                      // 商城 API
│   │       └── 📁 mall                     // 商城领域
│   │           ├── 📁 controller           // 商城控制器
│   │           ├── 📁 dao                  // 数据访问
│   │           ├── 📁 domain               // 商城领域模型
│   │           │   ├── 📁 bo               // 商品/订单 BO
│   │           │   ├── 📁 dto              // 数据传输对象
│   │           │   ├── 📁 groups           // 验证分组
│   │           │   └── 📁 vo               // 商品/订单 VO
│   │           ├── 📁 listener             // 商城事件监听
│   │           ├── 📁 mapper               // 商城 Mapper
│   │           └── 📁 service              // 商城服务
│   │
│   ├── 📁 ruoyi-workflow               // 工作流模块 🆕
│   │   └── 📁 src/main/java/plus/ruoyi/workflow
│   │       ├── 📁 common                   // 工作流通用
│   │       │   ├── 📁 constant             // 常量定义
│   │       │   └── 📁 enums                // 枚举类
│   │       ├── 📁 config                   // 工作流配置
│   │       ├── 📁 controller               // 流程控制器
│   │       ├── 📁 domain                   // 流程领域模型
│   │       │   ├── 📁 bo                   // 流程 BO
│   │       │   └── 📁 vo                   // 流程 VO
│   │       ├── 📁 handler                  // 流程处理器
│   │       ├── 📁 listener                 // 流程监听器
│   │       ├── 📁 mapper                   // 流程 Mapper
│   │       └── 📁 service                  // 流程服务
│   │
│   └── 📁 ruoyi-generator              // 代码生成模块
│       └── 📁 src/main/java/plus/ruoyi/generator
│           ├── 📁 controller               // 生成控制器
│           ├── 📁 domain                   // 生成配置模型
│           ├── 📁 mapper                   // 元数据 Mapper
│           ├── 📁 service                  // 生成服务
│           └── 📁 utils                    // 生成工具
│
├── 📁 ruoyi-extend                      // 🔌 扩展增强模块 (2个子模块)
│   │
│   ├── 📁 ruoyi-monitor-admin          // Spring Boot Admin 监控
│   │   └── 📁 src/main/java/plus/ruoyi/monitor
│   │       ├── 📄 MonitorAdminApplication.java  // 监控服务启动类
│   │       └── 📁 config                   // 监控配置
│   │
│   └── 📁 ruoyi-snailjob-server        // SnailJob 任务调度中心
│       └── 📁 src/main/java/plus/ruoyi/job
│           ├── 📄 SnailJobServerApplication.java // 调度中心启动类
│           └── 📁 config                   // 调度配置
│
├── 📁 plus-ui                           // 🖥️ 管理端前端 (Vue 3 + Element Plus)
├── 📁 plus-app                          // 📱 APP 端 (UniApp + WD UI)
├── 📁 plus-uniapp                       // 📱 移动端 (UniApp)
├── 📁 plus-uniapp-demo                  // 📱 移动端示例项目
├── 📁 script                            // 📜 脚本文件
│   ├── 📁 sql                              // 数据库脚本
│   └── 📁 docker                           // Docker 配置
│
└── 📄 pom.xml                           // Maven 主配置文件
```

## 模块详解

### 🚀 入口模块 (ruoyi-admin)

系统启动入口,负责整合所有模块并提供统一的部署打包。

**核心功能:**
- 应用启动入口 (`RuoYiApplication.java`)
- 环境配置管理 (dev/test/prod)
- 国际化资源配置
- 日志配置

**配置文件说明:**

| 文件 | 说明 |
|------|------|
| `application.yml` | 主配置,引入其他配置 |
| `application-dev.yml` | 开发环境配置 |
| `application-prod.yml` | 生产环境配置 |

### 🔧 通用模块 (ruoyi-common)

提供系统基础设施和通用功能,共 35 个子模块。

#### 核心基础模块

| 模块 | 说明 | 主要功能 |
|------|------|----------|
| `ruoyi-common-bom` | 依赖版本管理 | 统一管理所有依赖版本 |
| `ruoyi-common-core` | 核心工具模块 | 基础实体、异常处理、工具类 |
| `ruoyi-common-web` | Web 通用配置 | 跨域、过滤器、拦截器 |
| `ruoyi-common-json` | JSON 序列化 | Jackson 配置、自定义序列化器 |

#### 数据存储模块

| 模块 | 说明 | 技术栈 |
|------|------|--------|
| `ruoyi-common-mybatis` | ORM 框架 | MyBatis-Plus 3.5.14 |
| `ruoyi-common-redis` | 缓存服务 | Redisson 3.51.0 |
| `ruoyi-common-oss` | 对象存储 | AWS S3 兼容协议 |

#### 安全认证模块

| 模块 | 说明 | 技术栈 |
|------|------|--------|
| `ruoyi-common-satoken` | 认证授权 | Sa-Token 1.44.0 |
| `ruoyi-common-security` | 安全防护 | 加密、防攻击 |
| `ruoyi-common-encrypt` | 数据加密 | AES/RSA/SM4 |
| `ruoyi-common-sensitive` | 数据脱敏 | 手机号、身份证等脱敏 |

#### 通讯集成模块

| 模块 | 说明 | 功能 |
|------|------|------|
| `ruoyi-common-websocket` | WebSocket | 实时双向通讯 |
| `ruoyi-common-sse` | SSE 推送 | 服务端事件推送 |
| `ruoyi-common-mail` | 邮件服务 | 邮件发送、模板 |
| `ruoyi-common-sms` | 短信服务 | SMS4J 多渠道短信 |
| `ruoyi-common-rocketmq` | 消息队列 | RocketMQ 集成 |

#### 微信生态模块

| 模块 | 说明 | 技术栈 |
|------|------|--------|
| `ruoyi-common-miniapp` | 微信小程序 | WxJava 4.7.6.B |
| `ruoyi-common-mp` | 微信公众号 | WxJava 4.7.6.B |

#### 支付模块 (ruoyi-common-pay)

支持多种支付渠道的统一支付抽象:

| 子模块 | 说明 |
|--------|------|
| `ruoyi-common-pay-core` | 支付核心抽象、统一接口 |
| `ruoyi-common-pay-alipay` | 支付宝支付实现 |
| `ruoyi-common-pay-wechat` | 微信支付实现 |
| `ruoyi-common-pay-balance` | 余额支付实现 |

#### 其他工具模块

| 模块 | 说明 |
|------|------|
| `ruoyi-common-excel` | Excel 导入导出 (FastExcel) |
| `ruoyi-common-doc` | 接口文档 (SpringDoc/Knife4j) |
| `ruoyi-common-http` | HTTP 客户端 (Forest) |
| `ruoyi-common-job` | 定时任务 (SnailJob) |
| `ruoyi-common-idempotent` | 幂等性控制 |
| `ruoyi-common-ratelimiter` | 接口限流 |
| `ruoyi-common-log` | 操作日志 |
| `ruoyi-common-social` | 社交登录 (JustAuth) |
| `ruoyi-common-tenant` | 多租户支持 |
| `ruoyi-common-langchain4j` | AI 大模型集成 |
| `ruoyi-common-media` | 媒体文件处理 |
| `ruoyi-common-openapi` | OpenAPI 规范 |
| `ruoyi-common-serialMap` | 序列化映射 |
| `ruoyi-common-test` | 测试工具 |

### 📦 业务模块 (ruoyi-modules)

包含 5 个业务子模块,实现具体业务功能。

#### ruoyi-system - 系统管理模块

核心 RBAC 权限管理系统:

| 子模块 | 功能 |
|--------|------|
| `auth` | 用户认证、登录、登出、Token 管理 |
| `core` | 用户、角色、菜单、部门、岗位管理 |
| `config` | 系统配置、通知公告 |
| `dict` | 数据字典管理 |
| `monitor` | 在线用户、服务监控 |
| `oss` | 文件上传、下载、管理 |
| `tenant` | 租户管理、数据隔离 |

#### ruoyi-business - 业务扩展模块

新业务逻辑的扩展模块:

| 子模块 | 功能 |
|--------|------|
| `api` | APP 端和通用 API 接口 |
| `base` | 基础业务服务、认证策略 |
| `common` | 业务通用组件 |
| `job` | 业务定时任务 |

#### ruoyi-mall - 商城模块 🆕

电商业务功能:

| 功能 | 说明 |
|------|------|
| 商品管理 | 商品 CRUD、分类、规格 |
| 订单管理 | 订单创建、支付、发货、退款 |
| 事件监听 | 订单状态变更、库存变动 |

#### ruoyi-workflow - 工作流模块 🆕

基于 Warm-Flow 的工作流引擎:

| 功能 | 说明 |
|------|------|
| 流程定义 | 可视化流程设计 |
| 流程实例 | 流程发起、审批、流转 |
| 任务管理 | 待办、已办、委托、转办 |
| 流程监控 | 流程追踪、统计分析 |

#### ruoyi-generator - 代码生成模块

可视化代码生成器:

| 功能 | 说明 |
|------|------|
| 表导入 | 从数据库导入表结构 |
| 字段配置 | 配置字段类型、校验规则 |
| 代码生成 | 生成 Controller/Service/Mapper/Vue |
| 预览下载 | 在线预览、打包下载 |

### 🔌 扩展模块 (ruoyi-extend)

独立部署的扩展服务:

| 模块 | 说明 | 端口 |
|------|------|------|
| `ruoyi-monitor-admin` | Spring Boot Admin 监控中心 | 9100 |
| `ruoyi-snailjob-server` | SnailJob 任务调度中心 | 8800 |

## 项目架构特点

### 🏗️ 模块化设计

```
┌─────────────────────────────────────────────────────────┐
│                    ruoyi-admin (入口层)                  │
├─────────────────────────────────────────────────────────┤
│                  ruoyi-modules (业务层)                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│   │  system  │ │ business │ │   mall   │ │ workflow │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│                  ruoyi-common (通用层)                   │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│   │  core  │ │ mybatis│ │ redis  │ │  oss   │ ...     │
│   └────────┘ └────────┘ └────────┘ └────────┘         │
└─────────────────────────────────────────────────────────┘
```

**设计原则:**
- **分层清晰**: admin(入口层) → modules(业务层) → common(通用层)
- **职责明确**: 每个模块都有明确的功能边界和职责划分
- **松耦合**: 模块间通过接口依赖,便于独立开发和维护
- **高内聚**: 相关功能集中在同一模块内

### 📁 领域驱动分层

每个业务模块采用标准分层结构:

```
📁 module
├── 📁 controller          // 控制层 - 接收请求、参数校验
├── 📁 service             // 服务层 - 业务逻辑
│   └── 📁 impl            // 服务实现
├── 📁 dao                 // 数据访问层 - 复杂查询封装
│   └── 📁 impl            // DAO 实现
├── 📁 mapper              // MyBatis 映射层
├── 📁 domain              // 领域模型
│   ├── 📁 bo              // Business Object - 业务对象
│   ├── 📁 vo              // View Object - 视图对象
│   └── 📁 dto             // Data Transfer Object - 传输对象
└── 📁 listener            // 事件监听器
```

### 🔄 依赖关系

```
ruoyi-admin
    ├── ruoyi-system
    ├── ruoyi-business
    ├── ruoyi-mall
    ├── ruoyi-workflow
    └── ruoyi-generator

ruoyi-system
    └── ruoyi-common-*

ruoyi-business
    ├── ruoyi-common-*
    └── ruoyi-system (部分)

ruoyi-mall
    ├── ruoyi-common-*
    ├── ruoyi-common-pay
    └── ruoyi-business

ruoyi-workflow
    └── ruoyi-common-*
```

## 快速定位指南

### 按功能定位

| 需求 | 定位模块 |
|------|----------|
| 用户登录/认证 | `ruoyi-system/auth` |
| 用户/角色/菜单管理 | `ruoyi-system/core` |
| 文件上传下载 | `ruoyi-system/oss` + `ruoyi-common-oss` |
| 数据字典 | `ruoyi-system/dict` |
| 多租户 | `ruoyi-system/tenant` + `ruoyi-common-tenant` |
| 定时任务 | `ruoyi-common-job` + `ruoyi-business/job` |
| 支付功能 | `ruoyi-common-pay-*` |
| 工作流 | `ruoyi-workflow` |
| 商城业务 | `ruoyi-mall` |
| 代码生成 | `ruoyi-generator` |

### 按技术定位

| 技术需求 | 定位模块 |
|----------|----------|
| 缓存操作 | `ruoyi-common-redis` |
| 数据库操作 | `ruoyi-common-mybatis` |
| 接口文档 | `ruoyi-common-doc` |
| 数据加密 | `ruoyi-common-encrypt` |
| 消息推送 | `ruoyi-common-sse` / `ruoyi-common-websocket` |
| 短信发送 | `ruoyi-common-sms` |
| 邮件发送 | `ruoyi-common-mail` |
| 微信集成 | `ruoyi-common-miniapp` / `ruoyi-common-mp` |
| AI 集成 | `ruoyi-common-langchain4j` |
