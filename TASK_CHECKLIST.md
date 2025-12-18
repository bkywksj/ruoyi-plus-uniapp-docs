# RuoYi-Plus-UniApp 文档任务清单

> **生成时间**: 2025-12-18
> **完成标准**: ≥500 行为已完成
> **严格按照 config.ts 侧边栏顺序整理**

---

## 目录

- [后端文档 (backend)](#后端文档-backend)
- [前端文档 (frontend)](#前端文档-frontend)
- [移动端文档 (mobile)](#移动端文档-mobile)
- [最佳实践文档 (practices)](#最佳实践文档-practices)
- [根目录文档](#根目录文档)

---

## 后端文档 (backend)

### 1. 🚀 快速开始

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 项目简介 | `docs/backend/index.md` | 319 | ⚠️ 待完善 |
| 2 | 快速启动 | `docs/backend/getting-started.md` | 200 | ⚠️ 待完善 |
| 3 | 项目结构 | `docs/backend/project-structure.md` | 522 | ✅ 已完成 |
| 4 | 配置文件 | `docs/backend/configuration.md` | 332 | ⚠️ 待完善 |

**目录说明**: 帮助开发者快速上手 RuoYi-Plus 后端框架。

### 2. 主应用 (ruoyi-admin)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 模块解析 | `docs/backend/ruoyi-admin/module-resolution.md` | 245 | ⚠️ 待完善 |

**目录说明**: ruoyi-admin 是后端应用的启动入口模块。

### 3. 公共模块 (ruoyi-common)

#### 3.1 依赖版本管理 (bom)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 依赖版本管理 (bom) | `docs/backend/common/bom.md` | 186 | ⚠️ 待完善 |

#### 3.2 核心模块 (core)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 模块概览 | `docs/backend/common/core.md` | 429 | ⚠️ 待完善 |
| 2 | 配置管理 | `docs/backend/common/core/config.md` | 625 | ✅ 已完成 |
| 3 | 数据模型与DTO | `docs/backend/common/core/domain.md` | 977 | ✅ 已完成 |
| 4 | 工具类库 | `docs/backend/common/core/utils.md` | 883 | ✅ 已完成 |
| 5 | 异常处理 | `docs/backend/common/core/exception.md` | 610 | ✅ 已完成 |
| 6 | 参数校验 | `docs/backend/common/core/validation.md` | 1,312 | ✅ 已完成 |
| 7 | 字典枚举 | `docs/backend/common/core/enums.md` | 773 | ✅ 已完成 |
| 8 | 通用服务接口 | `docs/backend/common/core/service.md` | 637 | ✅ 已完成 |

#### 3.3 文档生成 (doc)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 文档生成 (doc) | `docs/backend/common/doc.md` | 411 | ⚠️ 待完善 |

#### 3.4 数据加密 (encrypt)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 概览与快速入门 | `docs/backend/common/encrypt.md` | 185 | ⚠️ 待完善 |
| 2 | 数据库字段加密 | `docs/backend/common/encrypt/database-encryption.md` | 386 | ⚠️ 待完善 |
| 3 | API接口加密 | `docs/backend/common/encrypt/api-encryption.md` | 338 | ⚠️ 待完善 |

#### 3.5 Excel处理 (excel)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Excel处理 (excel) | `docs/backend/common/excel.md` | 563 | ✅ 已完成 |

#### 3.6 幂等处理 (idempotent)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 幂等处理 (idempotent) | `docs/backend/common/idempotent.md` | 263 | ⚠️ 待完善 |

#### 3.7 任务调度 (job)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 任务调度 (job) | `docs/backend/common/job.md` | 461 | ⚠️ 待完善 |

#### 3.8 JSON处理 (json)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | JSON处理 (json) | `docs/backend/common/json.md` | 353 | ⚠️ 待完善 |

#### 3.9 日志管理 (log)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 日志管理 (log) | `docs/backend/common/log.md` | 422 | ⚠️ 待完善 |

#### 3.10 HTTP客户端 (http)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | HTTP客户端 (http) | `docs/backend/common/http.md` | 2,091 | ✅ 已完成 |

#### 3.11 LangChain4j AI集成 (langchain4j) ⭐

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 模块概览 | `docs/backend/common/langchain4j.md` | 556 | ✅ 已完成 |
| 2 | 快速开始 | `docs/backend/common/langchain4j/quick-start.md` | 946 | ✅ 已完成 |
| 3 | 模型工厂 | `docs/backend/common/langchain4j/model-factory.md` | 274 | ⚠️ 待完善 |
| 4 | 聊天服务 | `docs/backend/common/langchain4j/chat-service.md` | 430 | ⚠️ 待完善 |
| 5 | RAG检索增强 | `docs/backend/common/langchain4j/rag.md` | 462 | ⚠️ 待完善 |
| 6 | 向量存储 | `docs/backend/common/langchain4j/vector-store.md` | 503 | ✅ 已完成 |
| 7 | WebSocket流式对话 | `docs/backend/common/langchain4j/websocket.md` | 686 | ✅ 已完成 |

#### 3.12 邮件服务 (mail)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 邮件服务 (mail) | `docs/backend/common/mail.md` | 618 | ✅ 已完成 |

#### 3.13 媒体处理 (media)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 媒体处理 (media) | `docs/backend/common/media.md` | 2,879 | ✅ 已完成 |

#### 3.14 小程序集成 (miniapp)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 小程序集成 (miniapp) | `docs/backend/common/miniapp.md` | 464 | ⚠️ 待完善 |

#### 3.15 公众号集成 (mp)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 公众号集成 (mp) | `docs/backend/common/mp.md` | 388 | ⚠️ 待完善 |

#### 3.16 MyBatisPlus增强 (mybatis)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | MyBatisPlus增强 (mybatis) | `docs/backend/common/mybatis.md` | 469 | ⚠️ 待完善 |

#### 3.17 OSS存储 (oss)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | OSS存储 (oss) | `docs/backend/common/oss.md` | 532 | ✅ 已完成 |

#### 3.18 支付集成 (pay)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 支付集成 (pay) | `docs/backend/common/pay.md` | 632 | ✅ 已完成 |

#### 3.19 OpenAPI文档 (openapi)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | OpenAPI文档 (openapi) | `docs/backend/common/openapi.md` | 2,465 | ✅ 已完成 |

#### 3.20 限流组件 (ratelimiter)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 限流组件 (ratelimiter) | `docs/backend/common/ratelimiter.md` | 502 | ✅ 已完成 |

#### 3.21 Redis缓存 (redis)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Redis缓存 (redis) | `docs/backend/common/redis.md` | 872 | ✅ 已完成 |

#### 3.22 RocketMQ消息队列 (rocketmq) ⭐

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 快速开始 | `docs/backend/common/rocketmq/quick-start.md` | 541 | ✅ 已完成 |
| 2 | 消息生产 | `docs/backend/common/rocketmq/producer.md` | 570 | ✅ 已完成 |
| 3 | 消息消费 | `docs/backend/common/rocketmq/consumer.md` | 663 | ✅ 已完成 |

#### 3.23 权限认证 (satoken)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 权限认证 (satoken) | `docs/backend/common/satoken.md` | 649 | ✅ 已完成 |

#### 3.24 安全防护 (security)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 安全防护 (security) | `docs/backend/common/security.md` | 339 | ⚠️ 待完善 |

#### 3.25 脱敏处理 (sensitive)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 脱敏处理 (sensitive) | `docs/backend/common/sensitive.md` | 638 | ✅ 已完成 |

#### 3.26 序列化映射 (serialmap)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 序列化映射 (serialmap) | `docs/backend/common/serialmap.md` | 1,188 | ✅ 已完成 |

#### 3.27 短信服务 (sms)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 短信服务 (sms) | `docs/backend/common/sms.md` | 347 | ⚠️ 待完善 |

#### 3.28 社交登录 (social)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 社交登录 (social) | `docs/backend/common/social.md` | 487 | ⚠️ 待完善 |

#### 3.29 SSE推送 (sse)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | SSE推送 (sse) | `docs/backend/common/sse.md` | 383 | ⚠️ 待完善 |

#### 3.30 多租户 (tenant)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 多租户 (tenant) | `docs/backend/common/tenant.md` | 506 | ✅ 已完成 |

#### 3.31 测试支持 (test)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 快速开始 | `docs/backend/common/test/quick-start.md` | 506 | ✅ 已完成 |
| 2 | 测试基础类 | `docs/backend/common/test/base-classes.md` | 727 | ✅ 已完成 |
| 3 | 测试数据工厂 | `docs/backend/common/test/test-data-factory.md` | 589 | ✅ 已完成 |

#### 3.32 Web组件 (web)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Web组件 (web) | `docs/backend/common/web.md` | 293 | ⚠️ 待完善 |

#### 3.33 通讯 (websocket)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 通讯 (websocket) | `docs/backend/common/websocket.md` | 799 | ✅ 已完成 |

### 4. 业务模块 (ruoyi-modules)

#### 4.1 系统模块 (system)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 模块概览 | `docs/backend/modules/system.md` | 1,330 | ✅ 已完成 |
| 2 | 认证授权 (auth) | `docs/backend/modules/system/auth.md` | 1,080 | ✅ 已完成 |
| 3 | 系统配置 (config) | `docs/backend/modules/system/config.md` | 856 | ✅ 已完成 |
| 4 | 核心功能 (core) | `docs/backend/modules/system/core.md` | 466 | ⚠️ 待完善 |
| 5 | 字典管理 (dict) | `docs/backend/modules/system/dict.md` | 366 | ⚠️ 待完善 |
| 6 | 系统监控 (monitor) | `docs/backend/modules/system/monitor.md` | 343 | ⚠️ 待完善 |
| 7 | OSS存储 (oss) | `docs/backend/modules/system/oss.md` | 963 | ✅ 已完成 |
| 8 | 多租户 (tenant) | `docs/backend/modules/system/tenant.md` | 245 | ⚠️ 待完善 |

#### 4.2 代码生成器 (Generator)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 模块概览 | `docs/backend/modules/generator.md` | 204 | ⚠️ 待完善 |
| 2 | 快速开始 | `docs/backend/modules/generator/quick-start.md` | 1,524 | ✅ 已完成 |
| 3 | 表导入与配置 | `docs/backend/modules/generator/table-management.md` | 411 | ⚠️ 待完善 |
| 4 | 字段配置详解 | `docs/backend/modules/generator/column-config.md` | 817 | ✅ 已完成 |
| 5 | 模板类型详解 | `docs/backend/modules/generator/template-types.md` | 725 | ✅ 已完成 |

#### 4.3 业务模块 (business)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 模块概览 | `docs/backend/modules/business.md` | 1,322 | ✅ 已完成 |
| 2 | 基础服务 (base) | `docs/backend/modules/business/base.md` | 1,322 | ✅ 已完成 |
| 3 | 商城模块 (mall) | `docs/backend/modules/business/mall.md` | 734 | ✅ 已完成 |
| 4 | 任务调度 (job) | `docs/backend/modules/business/job.md` | 806 | ✅ 已完成 |

### 5. 扩展模块 (ruoyi-extend)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 监控管理 (monitor-admin) | `docs/backend/extend/monitor-admin.md` | 218 | ⚠️ 待完善 |
| 2 | 任务服务 (snailjob-server) | `docs/backend/extend/snailjob-server.md` | 167 | ⚠️ 待完善 |

**目录说明**: 扩展模块包含 Spring Boot Admin 监控和 SnailJob 任务调度服务。

### 后端文档统计

| 分类 | 总数 | 已完成(≥500行) | 待完善(<500行) | 完成率 |
|------|------|----------------|----------------|--------|
| 快速开始 | 4 | 1 | 3 | 25% |
| 主应用 | 1 | 0 | 1 | 0% |
| 公共模块 | 43 | 28 | 15 | 65.1% |
| 业务模块 | 17 | 12 | 5 | 70.6% |
| 扩展模块 | 2 | 0 | 2 | 0% |
| **总计** | **67** | **41** | **26** | **61.2%** |

---

## 前端文档 (frontend)

### 1. 🚀 快速开始

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 项目简介 | `docs/frontend/index.md` | 98 | ⚠️ 待完善 |
| 2 | 快速启动 | `docs/frontend/getting-started.md` | 128 | ⚠️ 待完善 |
| 3 | 项目结构 | `docs/frontend/project-structure.md` | 193 | ⚠️ 待完善 |
| 4 | 配置文件 | `docs/frontend/configuration.md` | 380 | ⚠️ 待完善 |

**目录说明**: 帮助开发者快速上手前端项目。

### 2. 🏗️ 项目架构

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 技术栈介绍 | `docs/frontend/architecture/tech-stack.md` | 212 | ⚠️ 待完善 |
| 2 | 模块化设计 | `docs/frontend/architecture/modular-design.md` | 329 | ⚠️ 待完善 |
| 3 | TypeScript配置 | `docs/frontend/architecture/typescript-config.md` | 543 | ✅ 已完成 |
| 4 | 类型系统 | `docs/frontend/architecture/type-system.md` | 590 | ✅ 已完成 |
| 5 | Vite构建配置 | `docs/frontend/architecture/vite-config.md` | 615 | ✅ 已完成 |

**目录说明**: 前端项目架构设计。

### 3. 🛣️ 路由系统 (router)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 路由总览 | `docs/frontend/router/overview.md` | 1,061 | ✅ 已完成 |
| 2 | 路由配置与守卫 | `docs/frontend/router/config-guards.md` | 298 | ⚠️ 待完善 |
| 3 | 权限与动态路由 | `docs/frontend/router/permission-dynamic.md` | 459 | ⚠️ 待完善 |

**目录说明**: Vue Router 路由系统配置。

### 4. 📦 状态管理 (stores)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 状态管理概览 | `docs/frontend/stores/overview.md` | 2,048 | ✅ 已完成 |
| 2 | 用户状态 (user) | `docs/frontend/stores/user-store.md` | 2,160 | ✅ 已完成 |
| 3 | 权限状态 (permission) | `docs/frontend/stores/permission-store.md` | 1,939 | ✅ 已完成 |
| 4 | 字典状态 (dict) | `docs/frontend/stores/dict-store.md` | 2,179 | ✅ 已完成 |
| 5 | 通知状态 (notice) | `docs/frontend/stores/notice-store.md` | 283 | ⚠️ 待完善 |

**目录说明**: Pinia 状态管理系统。

### 5. 🎨 布局系统 (Layout)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 布局概述 | `docs/frontend/layout/layout-overview.md` | 215 | ⚠️ 待完善 |
| 2 | 主布局(Layout) | `docs/frontend/layout/main-layout.md` | 334 | ⚠️ 待完善 |
| 3 | 侧边栏(SideBar) | `docs/frontend/layout/sidebar.md` | 483 | ⚠️ 待完善 |
| 4 | 顶部导航(NavBar) | `docs/frontend/layout/navbar.md` | 486 | ⚠️ 待完善 |
| 5 | 标签视图(TagsView) | `docs/frontend/layout/tags-view.md` | 431 | ⚠️ 待完善 |
| 6 | 主内容区(AppMain) | `docs/frontend/layout/app-main.md` | 439 | ⚠️ 待完善 |
| 7 | 设置面板(Settings) | `docs/frontend/layout/settings.md` | 493 | ⚠️ 待完善 |
| 8 | 前台布局 (HomeLayout) | `docs/frontend/layout/home-layout.md` | 385 | ⚠️ 待完善 |

**目录说明**: 管理后台布局系统。

### 6. 🧩 组件系统 (Components)

#### 6.1 组件概览

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 组件概览 | `docs/frontend/components/overview.md` | 269 | ⚠️ 待完善 |

#### 6.2 基础组件

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 图标系统 | `docs/frontend/components/basic/icon-system.md` | 611 | ✅ 已完成 |
| 2 | Icon 图标 | `docs/frontend/components/basic/icon.md` | 351 | ⚠️ 待完善 |
| 3 | DictTag 字典标签 | `docs/frontend/components/basic/dict-tag.md` | 384 | ⚠️ 待完善 |

#### 6.3 表单组件

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 表单组件概览 | `docs/frontend/components/form/overview.md` | 361 | ⚠️ 待完善 |
| 2 | AForm 表单容器 | `docs/frontend/components/form/form.md` | 634 | ✅ 已完成 |
| 3 | AFormCascader 级联选择 | `docs/frontend/components/form/cascader.md` | 754 | ✅ 已完成 |
| 4 | AFormCheckbox 复选框 | `docs/frontend/components/form/checkbox.md` | 954 | ✅ 已完成 |
| 5 | AFormDate 日期选择 | `docs/frontend/components/form/date.md` | 1,096 | ✅ 已完成 |
| 6 | AFormEditor 富文本编辑 | `docs/frontend/components/form/editor.md` | 1,113 | ✅ 已完成 |
| 7 | AFormFileUpload 文件上传 | `docs/frontend/components/form/file-upload.md` | 1,033 | ✅ 已完成 |
| 8 | AFormImgUpload 图片上传 | `docs/frontend/components/form/img-upload.md` | 248 | ⚠️ 待完善 |
| 9 | AFormInput 输入框 | `docs/frontend/components/form/input.md` | 592 | ✅ 已完成 |
| 10 | AFormRadio 单选框 | `docs/frontend/components/form/radio.md` | 757 | ✅ 已完成 |
| 11 | AFormSelect 选择器 | `docs/frontend/components/form/select.md` | 733 | ✅ 已完成 |
| 12 | AFormSwitch 开关 | `docs/frontend/components/form/switch.md` | 936 | ✅ 已完成 |
| 13 | AFormTreeSelect 树选择 | `docs/frontend/components/form/tree-select.md` | 1,028 | ✅ 已完成 |
| 14 | IconSelect 图标选择器 | `docs/frontend/components/form/icon-select.md` | 231 | ⚠️ 待完善 |

#### 6.4 数据展示

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | ADataCard 数据卡片 | `docs/frontend/components/display/data-card.md` | 183 | ⚠️ 待完善 |
| 2 | ADetailDialog 详情对话框 | `docs/frontend/components/display/detail-dialog.md` | 482 | ⚠️ 待完善 |
| 3 | TableToolbar 表格工具栏 | `docs/frontend/components/display/table-toolbar.md` | 238 | ⚠️ 待完善 |
| 4 | Pagination 分页 | `docs/frontend/components/display/pagination.md` | 324 | ⚠️ 待完善 |

#### 6.5 反馈组件

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | ASearchForm 搜索表单 | `docs/frontend/components/feedback/search-form.md` | 397 | ⚠️ 待完善 |
| 2 | ASelectionTags 选择标签 | `docs/frontend/components/feedback/selection-tags.md` | 374 | ⚠️ 待完善 |

#### 6.6 业务组件

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 业务组件概览 | `docs/frontend/components/business/overview.md` | 165 | ⚠️ 待完善 |
| 2 | AOssMediaManager 媒体库 | `docs/frontend/components/business/oss-media-manager.md` | 254 | ⚠️ 待完善 |
| 3 | ARecharge 充值组件 | `docs/frontend/components/business/recharge.md` | 317 | ⚠️ 待完善 |
| 4 | AImportExcel Excel导入 | `docs/frontend/components/business/import-excel.md` | 268 | ⚠️ 待完善 |
| 5 | UserSelect 用户选择 | `docs/frontend/components/business/user-select.md` | 324 | ⚠️ 待完善 |

#### 6.7 布局组件

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | APageBackground 页面背景 | `docs/frontend/components/layout/page-background.md` | 167 | ⚠️ 待完善 |
| 2 | IFrameContainer iframe容器 | `docs/frontend/components/layout/i-frame-container.md` | 193 | ⚠️ 待完善 |

**目录说明**: 前端组件库。

### 7. 🎣 组合式函数 (composables)

#### 7.1 概览

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 组合式函数概览 | `docs/frontend/composables/overview.md` | 2,031 | ✅ 已完成 |

#### 7.2 核心组合函数

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | useAuth 认证管理 | `docs/frontend/composables/use-auth.md` | 378 | ⚠️ 待完善 |
| 2 | useDict 字典管理 | `docs/frontend/composables/use-dict.md` | 449 | ⚠️ 待完善 |
| 3 | useHttp 请求管理 | `docs/frontend/composables/use-http.md` | 421 | ⚠️ 待完善 |
| 4 | useToken 令牌管理 | `docs/frontend/composables/use-token.md` | 292 | ⚠️ 待完善 |
| 5 | useI18n 国际化 | `docs/frontend/composables/use-i18n.md` | 304 | ⚠️ 待完善 |

#### 7.3 界面组合函数

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | useLayout 布局管理 | `docs/frontend/composables/use-layout.md` | 507 | ✅ 已完成 |
| 2 | useAnimation 动画效果 | `docs/frontend/composables/use-animation.md` | 302 | ⚠️ 待完善 |
| 3 | useDialog 对话框 | `docs/frontend/composables/use-dialog.md` | 439 | ⚠️ 待完善 |
| 4 | useTheme 主题管理 | `docs/frontend/composables/use-theme.md` | 324 | ⚠️ 待完善 |
| 5 | useResponsiveSpan 响应式 | `docs/frontend/composables/use-responsive-span.md` | 381 | ⚠️ 待完善 |
| 6 | useTableHeight 表格高度 | `docs/frontend/composables/use-table-height.md` | 308 | ⚠️ 待完善 |

#### 7.4 业务组合函数

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | useSelection 选择管理 | `docs/frontend/composables/use-selection.md` | 353 | ⚠️ 待完善 |
| 2 | useDownload 下载管理 | `docs/frontend/composables/use-download.md` | 375 | ⚠️ 待完善 |
| 3 | usePrint 打印功能 | `docs/frontend/composables/use-print.md` | 754 | ✅ 已完成 |
| 4 | useSSE 服务端事件 | `docs/frontend/composables/use-sse.md` | 307 | ⚠️ 待完善 |
| 5 | useWS WebSocket通信 | `docs/frontend/composables/use-websocket.md` | 821 | ✅ 已完成 |

**目录说明**: Vue 3 组合式函数集合。

### 8. 🛠️ 工具库 (utils)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 工具函数概览 | `docs/frontend/utils/utils-overview.md` | 402 | ⚠️ 待完善 |
| 2 | 字符串工具 | `docs/frontend/utils/string.md` | 1,280 | ✅ 已完成 |
| 3 | 对象工具 | `docs/frontend/utils/object.md` | 560 | ✅ 已完成 |
| 4 | 日期工具 | `docs/frontend/utils/date.md` | 568 | ✅ 已完成 |
| 5 | 格式化工具 | `docs/frontend/utils/format.md` | 773 | ✅ 已完成 |
| 6 | 函数工具 | `docs/frontend/utils/function.md` | 820 | ✅ 已完成 |
| 7 | 验证器 | `docs/frontend/utils/validators.md` | 1,483 | ✅ 已完成 |
| 8 | 布尔值工具 | `docs/frontend/utils/boolean.md` | 925 | ✅ 已完成 |
| 9 | 加密工具 | `docs/frontend/utils/crypto.md` | 562 | ✅ 已完成 |
| 10 | RSA加密 | `docs/frontend/utils/rsa.md` | 517 | ✅ 已完成 |
| 11 | 缓存工具 | `docs/frontend/utils/cache.md` | 975 | ✅ 已完成 |
| 12 | DOM类操作 | `docs/frontend/utils/class.md` | 613 | ✅ 已完成 |
| 13 | 滚动工具 | `docs/frontend/utils/scroll.md` | 775 | ✅ 已完成 |
| 14 | 树形工具 | `docs/frontend/utils/tree.md` | 761 | ✅ 已完成 |
| 15 | 模态框工具 | `docs/frontend/utils/modal.md` | 973 | ✅ 已完成 |
| 16 | 标签页工具 | `docs/frontend/utils/tab.md` | 867 | ✅ 已完成 |
| 17 | To工具类 | `docs/frontend/utils/to.md` | 687 | ✅ 已完成 |

**目录说明**: 前端工具函数库。

### 9. 📋 指令系统 (directives)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 权限指令 | `docs/frontend/directives/permission.md` | 404 | ⚠️ 待完善 |

**目录说明**: Vue 自定义指令系统。

### 10. 🎨 样式系统 (styles)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 样式架构 | `docs/frontend/styles/style-architecture.md` | 2,532 | ✅ 已完成 |
| 2 | UnoCSS配置 | `docs/frontend/styles/unocss-config.md` | 1,661 | ✅ 已完成 |
| 3 | 工具类使用 | `docs/frontend/styles/utility-classes.md` | 1,726 | ✅ 已完成 |
| 4 | 全局样式 | `docs/frontend/styles/global-styles.md` | 1,701 | ✅ 已完成 |
| 5 | 主题系统 | `docs/frontend/styles/theme-system.md` | 1,459 | ✅ 已完成 |
| 6 | 组件样式 | `docs/frontend/styles/component-styles.md` | 1,093 | ✅ 已完成 |
| 7 | 动画系统 | `docs/frontend/styles/animations.md` | 1,398 | ✅ 已完成 |
| 8 | 响应式设计 | `docs/frontend/styles/responsive.md` | 1,705 | ✅ 已完成 |
| 9 | 最佳实践 | `docs/frontend/styles/best-practices.md` | 1,891 | ✅ 已完成 |

**目录说明**: CSS 样式系统。

### 11. 🎭 图标系统 (icons)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 图标系统概述 | `docs/frontend/icons/overview.md` | 256 | ⚠️ 待完善 |
| 2 | Iconify配置 | `docs/frontend/icons/iconify-config.md` | 339 | ⚠️ 待完善 |
| 3 | Iconfont配置 | `docs/frontend/icons/iconfont-config.md` | 404 | ⚠️ 待完善 |
| 4 | 图标类型生成 | `docs/frontend/icons/type-generation.md` | 477 | ⚠️ 待完善 |
| 5 | 图标组件使用 | `docs/frontend/icons/component-usage.md` | 516 | ✅ 已完成 |
| 6 | 图标预设管理 | `docs/frontend/icons/preset-management.md` | 468 | ⚠️ 待完善 |
| 7 | 图标最佳实践 | `docs/frontend/icons/best-practices.md` | 442 | ⚠️ 待完善 |

**目录说明**: 图标系统配置。

### 12. 📝 类型定义 (types)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 类型系统概览 | `docs/frontend/types/overview.md` | 1,293 | ✅ 已完成 |
| 2 | API类型 | `docs/frontend/types/api-types.md` | 1,108 | ✅ 已完成 |
| 3 | 全局类型 | `docs/frontend/types/global-types.md` | 1,186 | ✅ 已完成 |
| 4 | 组件类型 | `docs/frontend/types/component-types.md` | 2,222 | ✅ 已完成 |
| 5 | 路由类型 | `docs/frontend/types/router-types.md` | 1,465 | ✅ 已完成 |
| 6 | 状态类型 | `docs/frontend/types/store-types.md` | 1,738 | ✅ 已完成 |
| 7 | 工具类型 | `docs/frontend/types/utility-types.md` | 1,303 | ✅ 已完成 |
| 8 | 枚举类型 | `docs/frontend/types/enums.md` | 991 | ✅ 已完成 |
| 9 | 类型扩展 | `docs/frontend/types/type-extensions.md` | 1,415 | ✅ 已完成 |

**目录说明**: TypeScript 类型定义系统。

### 13. ⚙️ 开发工具 (dev)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Prettier配置 | `docs/frontend/dev/prettier-config.md` | 581 | ✅ 已完成 |
| 2 | 调试技巧 | `docs/frontend/dev/debugging.md` | 600 | ✅ 已完成 |
| 3 | 性能分析 | `docs/frontend/dev/performance.md` | 710 | ✅ 已完成 |
| 4 | 单元测试 | `docs/frontend/dev/testing.md` | 734 | ✅ 已完成 |
| 5 | 开发最佳实践 | `docs/frontend/dev/best-practices.md` | 733 | ✅ 已完成 |

**目录说明**: 开发工具和调试技巧。

### 14. 🖼️ 低代码工具 (tools)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 页面设计器 | `docs/frontend/tools/page-designer.md` | 312 | ⚠️ 待完善 |

**目录说明**: 低代码页面设计器。

### 15. 🌍 国际化 (locales)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 国际化配置 | `docs/frontend/i18n/i18n-config.md` | 1,412 | ✅ 已完成 |
| 2 | 语言包管理 | `docs/frontend/i18n/language-packs.md` | 404 | ⚠️ 待完善 |
| 3 | 组件国际化 | `docs/frontend/i18n/component-i18n.md` | 447 | ⚠️ 待完善 |
| 4 | 国际化最佳实践 | `docs/frontend/i18n/i18n-practices.md` | 594 | ✅ 已完成 |

**目录说明**: 国际化配置系统。

### 前端文档统计

| 分类 | 总数 | 已完成(≥500行) | 待完善(<500行) | 完成率 |
|------|------|----------------|----------------|--------|
| 快速开始 | 4 | 0 | 4 | 0% |
| 项目架构 | 5 | 3 | 2 | 60% |
| 路由系统 | 3 | 1 | 2 | 33.3% |
| 状态管理 | 5 | 4 | 1 | 80% |
| 布局系统 | 8 | 0 | 8 | 0% |
| 组件系统 | 30 | 13 | 17 | 43.3% |
| 组合式函数 | 17 | 4 | 13 | 23.5% |
| 工具库 | 17 | 16 | 1 | 94.1% |
| 指令系统 | 1 | 0 | 1 | 0% |
| 样式系统 | 9 | 9 | 0 | 100% |
| 图标系统 | 7 | 1 | 6 | 14.3% |
| 类型定义 | 9 | 9 | 0 | 100% |
| 开发工具 | 5 | 5 | 0 | 100% |
| 低代码工具 | 1 | 0 | 1 | 0% |
| 国际化 | 4 | 2 | 2 | 50% |
| **总计** | **125** | **67** | **58** | **53.6%** |

---

## 移动端文档 (mobile)

### 1. 🚀 快速开始

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 项目简介 | `docs/mobile/index.md` | 132 | ⚠️ 待完善 |
| 2 | 快速启动 | `docs/mobile/getting-started.md` | 957 | ✅ 已完成 |
| 3 | 项目结构 | `docs/mobile/project-structure.md` | 1,127 | ✅ 已完成 |
| 4 | 配置文件 | `docs/mobile/configuration.md` | 657 | ✅ 已完成 |
| 5 | 开发规范 | `docs/mobile/dev-standards.md` | 2,301 | ✅ 已完成 |

**目录说明**: 帮助开发者快速上手移动端项目。

### 2. 🏗️ UniApp基础

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | UniApp概览 | `docs/mobile/uniapp/overview.md` | 876 | ✅ 已完成 |
| 2 | 项目配置 (manifest.json) | `docs/mobile/uniapp/manifest-config.md` | 2,263 | ✅ 已完成 |
| 3 | 页面配置 (pages.json) | `docs/mobile/uniapp/pages-config.md` | 523 | ✅ 已完成 |
| 4 | 应用配置 (uni.scss) | `docs/mobile/uniapp/app-config.md` | 446 | ⚠️ 待完善 |
| 5 | 生命周期 | `docs/mobile/uniapp/lifecycle.md` | 929 | ✅ 已完成 |
| 6 | 路由导航 | `docs/mobile/uniapp/navigation.md` | 797 | ✅ 已完成 |
| 7 | 条件编译 | `docs/mobile/uniapp/conditional.md` | 702 | ✅ 已完成 |
| 8 | HBuilderX使用 | `docs/mobile/uniapp/hbuilderx.md` | 511 | ✅ 已完成 |

**目录说明**: UniApp 框架基础知识。

### 3. 🧩 WD UI 组件库 (98组件)

#### 3.0 组件库入口

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 组件库概览 | `docs/mobile/wd/overview.md` | 736 | ✅ 已完成 |
| 2 | 主题定制 | `docs/mobile/styles/theme.md` | 1,307 | ✅ 已完成 |
| 3 | 快速开始 | `docs/mobile/wd/getting-started.md` | 571 | ✅ 已完成 |

#### 3.1 基础组件 (6个)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Button 按钮 | `docs/mobile/wd/basic/button.md` | 1,172 | ✅ 已完成 |
| 2 | Icon 图标 | `docs/mobile/wd/basic/icon.md` | 1,538 | ✅ 已完成 |
| 3 | Text 文本 | `docs/mobile/wd/basic/text.md` | 1,295 | ✅ 已完成 |
| 4 | Transition 动画 | `docs/mobile/wd/basic/transition.md` | 1,429 | ✅ 已完成 |
| 5 | Resize 监听元素尺寸 | `docs/mobile/wd/basic/resize.md` | 1,499 | ✅ 已完成 |
| 6 | ConfigProvider 配置 | `docs/mobile/wd/basic/config-provider.md` | 1,752 | ✅ 已完成 |

#### 3.2 布局组件 (5个)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Row-Col 行列布局 | `docs/mobile/wd/layout/row-col.md` | 1,519 | ✅ 已完成 |
| 2 | Grid 宫格 | `docs/mobile/wd/layout/grid.md` | 2,070 | ✅ 已完成 |
| 3 | Gap 间隙槽 | `docs/mobile/wd/layout/gap.md` | 1,204 | ✅ 已完成 |
| 4 | Divider 分割线 | `docs/mobile/wd/layout/divider.md` | 1,222 | ✅ 已完成 |
| 5 | Sticky 吸顶布局 | `docs/mobile/wd/layout/sticky.md` | 1,380 | ✅ 已完成 |

#### 3.3 导航组件 (10个)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Navbar 导航栏 | `docs/mobile/wd/navigation/navbar.md` | 1,251 | ✅ 已完成 |
| 2 | Tabbar 标签栏 | `docs/mobile/wd/navigation/tabbar.md` | 2,002 | ✅ 已完成 |
| 3 | Tabs 标签页 | `docs/mobile/wd/navigation/tabs.md` | 2,107 | ✅ 已完成 |
| 4 | Segmented 分段器 | `docs/mobile/wd/navigation/segmented.md` | 1,586 | ✅ 已完成 |
| 5 | Sidebar 侧边栏 | `docs/mobile/wd/navigation/sidebar.md` | 1,727 | ✅ 已完成 |
| 6 | IndexBar 索引栏 | `docs/mobile/wd/navigation/index-bar.md` | 1,206 | ✅ 已完成 |
| 7 | Pagination 分页 | `docs/mobile/wd/navigation/pagination.md` | 1,535 | ✅ 已完成 |
| 8 | Paging 分页加载 | `docs/mobile/wd/navigation/paging.md` | 1,844 | ✅ 已完成 |
| 9 | Backtop 回到顶部 | `docs/mobile/wd/navigation/backtop.md` | 1,206 | ✅ 已完成 |
| 10 | Fab 悬浮按钮 | `docs/mobile/wd/navigation/fab.md` | 429 | ⚠️ 待完善 |

#### 3.4 表单组件 (24个)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Input 输入框 | `docs/mobile/wd/form/input.md` | 1,505 | ✅ 已完成 |
| 2 | Textarea 文本域 | `docs/mobile/wd/form/textarea.md` | 1,426 | ✅ 已完成 |
| 3 | InputNumber 计数器 | `docs/mobile/wd/form/input-number.md` | 1,657 | ✅ 已完成 |
| 4 | PasswordInput 密码 | `docs/mobile/wd/form/password-input.md` | 1,466 | ✅ 已完成 |
| 5 | Search 搜索 | `docs/mobile/wd/form/search.md` | 1,462 | ✅ 已完成 |
| 6 | Checkbox 复选框 | `docs/mobile/wd/form/checkbox.md` | 1,405 | ✅ 已完成 |
| 7 | Radio 单选框 | `docs/mobile/wd/form/radio.md` | 1,282 | ✅ 已完成 |
| 8 | Switch 开关 | `docs/mobile/wd/form/switch.md` | 1,042 | ✅ 已完成 |
| 9 | Rate 评分 | `docs/mobile/wd/form/rate.md` | 1,269 | ✅ 已完成 |
| 10 | Slider 滑块 | `docs/mobile/wd/form/slider.md` | 1,519 | ✅ 已完成 |
| 11 | Picker 选择器 | `docs/mobile/wd/form/picker.md` | 1,609 | ✅ 已完成 |
| 12 | PickerView 选择器视图 | `docs/mobile/wd/form/picker-view.md` | 404 | ⚠️ 待完善 |
| 13 | ColPicker 多列选择器 | `docs/mobile/wd/form/col-picker.md` | 1,669 | ✅ 已完成 |
| 14 | SelectPicker 单复选 | `docs/mobile/wd/form/select-picker.md` | 2,237 | ✅ 已完成 |
| 15 | DatetimePicker 时间 | `docs/mobile/wd/form/datetime-picker.md` | 1,947 | ✅ 已完成 |
| 16 | DatetimePickerView | `docs/mobile/wd/form/datetime-picker-view.md` | 454 | ⚠️ 待完善 |
| 17 | Calendar 日历 | `docs/mobile/wd/form/calendar.md` | 1,794 | ✅ 已完成 |
| 18 | CalendarView 日历板 | `docs/mobile/wd/form/calendar-view.md` | 632 | ✅ 已完成 |
| 19 | Upload 上传 | `docs/mobile/wd/form/upload.md` | 1,819 | ✅ 已完成 |
| 20 | Form 表单 | `docs/mobile/wd/form/form.md` | 1,560 | ✅ 已完成 |
| 21 | Signature 签名 | `docs/mobile/wd/form/signature.md` | 367 | ⚠️ 待完善 |
| 22 | Recorder 录音 | `docs/mobile/wd/form/voice-recorder.md` | 353 | ⚠️ 待完善 |
| 23 | Keyboard 虚拟键盘 | `docs/mobile/wd/form/keyboard.md` | 397 | ⚠️ 待完善 |
| 24 | NumberKeyboard 数字键盘 | `docs/mobile/wd/form/number-keyboard.md` | 434 | ⚠️ 待完善 |

#### 3.5 展示组件 (14个)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Cell 单元格 | `docs/mobile/wd/display/cell.md` | 997 | ✅ 已完成 |
| 2 | Badge 徽标 | `docs/mobile/wd/display/badge.md` | 1,699 | ✅ 已完成 |
| 3 | Tag 标签 | `docs/mobile/wd/display/tag.md` | 1,360 | ✅ 已完成 |
| 4 | Card 卡片 | `docs/mobile/wd/display/card.md` | 1,207 | ✅ 已完成 |
| 5 | Collapse 折叠面板 | `docs/mobile/wd/display/collapse.md` | 1,219 | ✅ 已完成 |
| 6 | Steps 步骤条 | `docs/mobile/wd/display/steps.md` | 1,094 | ✅ 已完成 |
| 7 | Table 表格 | `docs/mobile/wd/display/table.md` | 807 | ✅ 已完成 |
| 8 | Img 图片 | `docs/mobile/wd/display/img.md` | 1,303 | ✅ 已完成 |
| 9 | ImgCropper 图片裁剪 | `docs/mobile/wd/display/img-cropper.md` | 961 | ✅ 已完成 |
| 10 | Swiper 轮播图 | `docs/mobile/wd/display/swiper.md` | 1,938 | ✅ 已完成 |
| 11 | Skeleton 骨架屏 | `docs/mobile/wd/display/skeleton.md` | 2,209 | ✅ 已完成 |
| 12 | Curtain 幕帘 | `docs/mobile/wd/display/curtain.md` | 1,939 | ✅ 已完成 |
| 13 | Watermark 水印 | `docs/mobile/wd/display/watermark.md` | 769 | ✅ 已完成 |
| 14 | Progress 进度条 | `docs/mobile/wd/display/progress.md` | 1,286 | ✅ 已完成 |

#### 3.6 反馈组件 (19个)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | ActionSheet 上拉菜单 | `docs/mobile/wd/feedback/action-sheet.md` | 1,682 | ✅ 已完成 |
| 2 | Popup 弹出层 | `docs/mobile/wd/feedback/popup.md` | 1,492 | ✅ 已完成 |
| 3 | Overlay 遮罩层 | `docs/mobile/wd/feedback/overlay.md` | 1,159 | ✅ 已完成 |
| 4 | MessageBox 弹框 | `docs/mobile/wd/feedback/message-box.md` | 1,249 | ✅ 已完成 |
| 5 | Toast 轻提示 | `docs/mobile/wd/feedback/toast.md` | 1,518 | ✅ 已完成 |
| 6 | Notify 消息通知 | `docs/mobile/wd/feedback/notify.md` | 1,047 | ✅ 已完成 |
| 7 | Loading 加载指示器 | `docs/mobile/wd/feedback/loading.md` | 1,616 | ✅ 已完成 |
| 8 | Circle 环形进度条 | `docs/mobile/wd/feedback/circle.md` | 370 | ⚠️ 待完善 |
| 9 | Loadmore 加载更多 | `docs/mobile/wd/feedback/loadmore.md` | 321 | ⚠️ 待完善 |
| 10 | StatusTip 缺省提示 | `docs/mobile/wd/feedback/status-tip.md` | 277 | ⚠️ 待完善 |
| 11 | Tooltip 文字提示 | `docs/mobile/wd/feedback/tooltip.md` | 332 | ⚠️ 待完善 |
| 12 | Popover 气泡 | `docs/mobile/wd/feedback/popover.md` | 436 | ⚠️ 待完善 |
| 13 | DropMenu 下拉菜单 | `docs/mobile/wd/feedback/drop-menu.md` | 519 | ✅ 已完成 |
| 14 | FloatingPanel 浮动面板 | `docs/mobile/wd/feedback/floating-panel.md` | 325 | ⚠️ 待完善 |
| 15 | SwipeAction 滑动操作 | `docs/mobile/wd/feedback/swipe-action.md` | 909 | ✅ 已完成 |
| 16 | SortButton 排序按钮 | `docs/mobile/wd/feedback/sort-button.md` | 366 | ⚠️ 待完善 |
| 17 | NoticeBar 通知栏 | `docs/mobile/wd/feedback/notice-bar.md` | 1,544 | ✅ 已完成 |
| 18 | CountDown 倒计时 | `docs/mobile/wd/feedback/count-down.md` | 320 | ⚠️ 待完善 |
| 19 | CountTo 数字滚动 | `docs/mobile/wd/feedback/count-to.md` | 330 | ⚠️ 待完善 |

**目录说明**: WD UI 组件库基于 Wot Design Uni。

### 4. 🎣 组合式函数 (composables)

#### 4.1 概览

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 组合式函数概览 | `docs/mobile/composables/overview.md` | 492 | ⚠️ 待完善 |

#### 4.2 核心组合函数

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | useAuth 认证管理 | `docs/mobile/composables/use-auth.md` | 2,856 | ✅ 已完成 |
| 2 | useDict 字典管理 | `docs/mobile/composables/use-dict.md` | 1,823 | ✅ 已完成 |
| 3 | useHttp 请求管理 | `docs/mobile/composables/use-http.md` | 2,243 | ✅ 已完成 |
| 4 | useToken 令牌管理 | `docs/mobile/composables/use-token.md` | 1,421 | ✅ 已完成 |
| 5 | useAppInit 应用初始化 | `docs/mobile/composables/use-app-init.md` | 408 | ⚠️ 待完善 |

#### 4.3 业务组合函数

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | usePayment 支付处理 | `docs/mobile/composables/use-payment.md` | 2,814 | ✅ 已完成 |
| 2 | useShare 分享功能 | `docs/mobile/composables/use-share.md` | 417 | ⚠️ 待完善 |
| 3 | useScroll 滚动处理 | `docs/mobile/composables/use-scroll.md` | 1,248 | ✅ 已完成 |
| 4 | useEventBus 事件总线 | `docs/mobile/composables/use-event-bus.md` | 415 | ⚠️ 待完善 |
| 5 | useWebSocket 实时通信 | `docs/mobile/composables/use-websocket.md` | 3,002 | ✅ 已完成 |

#### 4.4 界面组合函数

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | useTheme 主题管理 | `docs/mobile/composables/use-theme.md` | 1,837 | ✅ 已完成 |
| 2 | useI18n 国际化 | `docs/mobile/composables/use-i18n.md` | 411 | ⚠️ 待完善 |

#### 4.5 自定义Hook

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 自定义Hook开发 | `docs/mobile/composables/custom-hooks.md` | 3,363 | ✅ 已完成 |

**目录说明**: 移动端组合式函数集合。

### 5. 🛠️ 工具库 (utils)

#### 5.1 概览

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 工具函数概览 | `docs/mobile/utils/overview.md` | 2,578 | ✅ 已完成 |

#### 5.2 基础工具

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | string 字符串工具 | `docs/mobile/utils/string.md` | 557 | ✅ 已完成 |
| 2 | boolean 布尔值工具 | `docs/mobile/utils/boolean.md` | 433 | ⚠️ 待完善 |
| 3 | function 函数工具 | `docs/mobile/utils/function.md` | 611 | ✅ 已完成 |
| 4 | date 日期工具 | `docs/mobile/utils/date.md` | 2,075 | ✅ 已完成 |
| 5 | validators 验证工具 | `docs/mobile/utils/validators.md` | 574 | ✅ 已完成 |

#### 5.3 业务工具

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | cache 缓存工具 | `docs/mobile/utils/cache.md` | 569 | ✅ 已完成 |
| 2 | route 路由工具 | `docs/mobile/utils/route.md` | 501 | ✅ 已完成 |
| 3 | platform 平台工具 | `docs/mobile/utils/platform.md` | 556 | ✅ 已完成 |
| 4 | tenant 租户工具 | `docs/mobile/utils/tenant.md` | 555 | ✅ 已完成 |

#### 5.4 安全工具

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | crypto 加密工具 | `docs/mobile/utils/crypto.md` | 1,805 | ✅ 已完成 |
| 2 | rsa RSA加密 | `docs/mobile/utils/rsa.md` | 484 | ⚠️ 待完善 |

#### 5.5 辅助工具

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | to 异步处理 | `docs/mobile/utils/to.md` | 637 | ✅ 已完成 |

**目录说明**: 移动端工具函数库。

### 6. 📄 页面开发 (pages)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 页面概述 | `docs/mobile/pages/index.md` | 1,504 | ✅ 已完成 |
| 2 | 登录页面 | `docs/mobile/pages/login.md` | 2,802 | ✅ 已完成 |
| 3 | 分包页面管理 | `docs/mobile/pages/subpackages.md` | 628 | ✅ 已完成 |

**目录说明**: 页面开发指南。

### 7. 🎨 布局系统 (layouts)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 布局概述 | `docs/mobile/layouts/overview.md` | 1,853 | ✅ 已完成 |
| 2 | 默认布局 (default) | `docs/mobile/layouts/default.md` | 1,806 | ✅ 已完成 |
| 3 | 导航栏配置 | `docs/mobile/layouts/navbar.md` | 1,617 | ✅ 已完成 |
| 4 | 标签栏配置 | `docs/mobile/layouts/tabbar.md` | 1,212 | ✅ 已完成 |
| 5 | 胶囊组件 | `docs/mobile/layouts/capsule.md` | 1,337 | ✅ 已完成 |

**目录说明**: 移动端布局系统。

### 8. 🎨 样式系统 (styles)

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 样式概览 | `docs/mobile/styles/overview.md` | 1,527 | ✅ 已完成 |
| 2 | 样式架构设计 | `docs/mobile/styles/architecture.md` | 539 | ✅ 已完成 |
| 3 | UnoCSS配置 | `docs/mobile/styles/unocss.md` | 1,182 | ✅ 已完成 |
| 4 | 全局样式 (uni.scss) | `docs/mobile/styles/global.md` | 1,183 | ✅ 已完成 |
| 5 | rpx单位使用 | `docs/mobile/styles/rpx-units.md` | 514 | ✅ 已完成 |
| 6 | 主题定制 | `docs/mobile/styles/theme.md` | 1,307 | ✅ 已完成 |
| 7 | 响应式设计 | `docs/mobile/styles/responsive.md` | 1,571 | ✅ 已完成 |
| 8 | 组件样式 | `docs/mobile/styles/components.md` | 1,645 | ✅ 已完成 |
| 9 | 样式最佳实践 | `docs/mobile/styles/best-practices.md` | 1,863 | ✅ 已完成 |

**目录说明**: 移动端样式系统。

### 9. 📦 组件开发

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 自定义组件开发 | `docs/mobile/components/custom-development.md` | 879 | ✅ 已完成 |
| 2 | 组件封装规范 | `docs/mobile/components/encapsulation-standards.md` | 623 | ✅ 已完成 |
| 3 | 组件通信模式 | `docs/mobile/components/communication-patterns.md` | 885 | ✅ 已完成 |
| 4 | 组件生命周期 | `docs/mobile/components/lifecycle.md` | 955 | ✅ 已完成 |
| 5 | 组件测试 | `docs/mobile/components/testing.md` | 901 | ✅ 已完成 |

**目录说明**: 自定义组件开发指南。

### 10. 📱 平台适配

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 平台差异说明 | `docs/mobile/platform/differences.md` | 994 | ✅ 已完成 |
| 2 | H5端适配 | `docs/mobile/platform/h5.md` | 1,011 | ✅ 已完成 |
| 3 | 微信小程序适配 | `docs/mobile/platform/wechat.md` | 1,054 | ✅ 已完成 |
| 4 | 支付宝小程序适配 | `docs/mobile/platform/alipay.md` | 1,201 | ✅ 已完成 |

**目录说明**: 多端平台适配指南。

### 11. ⚡ 性能优化

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 性能优化概览 | `docs/mobile/performance/overview.md` | 994 | ✅ 已完成 |
| 2 | 启动性能优化 | `docs/mobile/performance/startup.md` | 1,691 | ✅ 已完成 |
| 3 | 渲染性能优化 | `docs/mobile/performance/rendering.md` | 2,188 | ✅ 已完成 |
| 4 | 包体积优化 | `docs/mobile/performance/bundle-size.md` | 868 | ✅ 已完成 |
| 5 | 图片优化 | `docs/mobile/performance/image.md` | 1,953 | ✅ 已完成 |
| 6 | 分包加载优化 | `docs/mobile/performance/subpackage.md` | 1,203 | ✅ 已完成 |

**目录说明**: 移动端性能优化指南。

### 12. 📦 打包发布

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 打包配置概览 | `docs/mobile/build/overview.md` | 1,304 | ✅ 已完成 |
| 2 | 环境配置 | `docs/mobile/build/environment.md` | 815 | ✅ 已完成 |
| 3 | H5打包发布 | `docs/mobile/build/h5-deploy.md` | 1,101 | ✅ 已完成 |
| 4 | 微信小程序发布 | `docs/mobile/build/wechat-deploy.md` | 3,315 | ✅ 已完成 |

**目录说明**: 移动端打包发布指南。

### 移动端文档统计

| 分类 | 总数 | 已完成(≥500行) | 待完善(<500行) | 完成率 |
|------|------|----------------|----------------|--------|
| 快速开始 | 5 | 4 | 1 | 80% |
| UniApp基础 | 8 | 7 | 1 | 87.5% |
| WD UI 组件库 | 81 | 62 | 19 | 76.5% |
| 组合式函数 | 14 | 9 | 5 | 64.3% |
| 工具库 | 13 | 11 | 2 | 84.6% |
| 页面开发 | 3 | 3 | 0 | 100% |
| 布局系统 | 5 | 5 | 0 | 100% |
| 样式系统 | 9 | 9 | 0 | 100% |
| 组件开发 | 5 | 5 | 0 | 100% |
| 平台适配 | 4 | 4 | 0 | 100% |
| 性能优化 | 6 | 6 | 0 | 100% |
| 打包发布 | 4 | 4 | 0 | 100% |
| **总计** | **157** | **129** | **28** | **82.2%** |

---

## 最佳实践文档 (practices)

### 1. 🛠️ 工程化

#### 1.1 Claude Code

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Skills 技能系统 ⭐ | `docs/practices/engineering/claude-code-skills.md` | 321 | ⚠️ 待完善 |
| 2 | Commands 自定义命令 | `docs/practices/engineering/claude-code-commands.md` | 428 | ⚠️ 待完善 |
| 3 | Hooks 钩子机制 | `docs/practices/engineering/claude-code-hooks.md` | 556 | ✅ 已完成 |
| 4 | MCP 服务器配置 | `docs/practices/engineering/claude-code-mcp.md` | 636 | ✅ 已完成 |
| 5 | Sub-Agents 子代理 | `docs/practices/engineering/claude-code-agents.md` | 672 | ✅ 已完成 |

#### 1.2 代码生成器

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 代码生成器使用 | `docs/practices/engineering/code-generator.md` | 1,054 | ✅ 已完成 |

**目录说明**: AI 辅助开发工具配置和代码生成器使用指南。

### 2. 📋 开发规范

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 开发规范概览 | `docs/practices/standards/overview.md` | - | ❌ 待创建 |
| 2 | 代码规范 ✅ | `docs/practices/standards/coding.md` | 804 | ✅ 已完成 |
| 3 | API设计规范 ✅ | `docs/practices/standards/api-design.md` | 654 | ✅ 已完成 |
| 4 | 命名规范 | `docs/practices/standards/naming.md` | 1,405 | ✅ 已完成 |
| 5 | 注释规范 | `docs/practices/standards/comment.md` | 2,396 | ✅ 已完成 |
| 6 | Git使用规范 | `docs/practices/standards/git.md` | 3,036 | ✅ 已完成 |
| 7 | 数据库规范 | `docs/practices/standards/database.md` | 1,141 | ✅ 已完成 |
| 8 | 前端开发规范 | `docs/practices/standards/frontend.md` | 1,351 | ✅ 已完成 |
| 9 | 移动端开发规范 | `docs/practices/standards/mobile.md` | - | ❌ 待创建 |

**目录说明**: 开发规范标准。

### 3. 🏗️ 架构设计

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 系统架构设计 | `docs/practices/architecture/system.md` | 1,919 | ✅ 已完成 |
| 2 | 数据库设计 | `docs/practices/architecture/database.md` | 2,457 | ✅ 已完成 |
| 3 | 缓存策略 | `docs/practices/architecture/cache.md` | 2,403 | ✅ 已完成 |
| 4 | 分布式设计 | `docs/practices/architecture/distributed.md` | 2,635 | ✅ 已完成 |
| 5 | 多租户架构 | `docs/practices/architecture/multi-tenant.md` | 1,884 | ✅ 已完成 |

**目录说明**: 系统架构设计指南。

### 4. 💻 后端开发

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 后端开发概览 | `docs/practices/backend/overview.md` | - | ❌ 待创建 |
| 2 | Service层最佳实践 | `docs/practices/backend/service-layer.md` | 677 | ✅ 已完成 |
| 3 | Controller层最佳实践 | `docs/practices/backend/controller-layer.md` | 1,276 | ✅ 已完成 |
| 4 | DAO层设计模式 | `docs/practices/backend/dao-layer.md` | - | ❌ 待创建 |
| 5 | 数据访问层优化 | `docs/practices/backend/data-access.md` | 1,382 | ✅ 已完成 |
| 6 | 事务管理策略 | `docs/practices/backend/transaction.md` | 1,352 | ✅ 已完成 |
| 7 | 异常处理机制 | `docs/practices/backend/exception-handling.md` | 1,692 | ✅ 已完成 |
| 8 | 数据校验最佳实践 | `docs/practices/backend/validation.md` | 1,496 | ✅ 已完成 |
| 9 | 日志规范 | `docs/practices/backend/logging.md` | - | ❌ 待创建 |
| 10 | API版本管理 | `docs/practices/backend/api-versioning.md` | - | ❌ 待创建 |

**目录说明**: 后端开发最佳实践。

### 5. 🔧 功能开发

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 权限控制实现 | `docs/practices/features/permission-control.md` | 1,083 | ✅ 已完成 |
| 2 | 数据权限设计 | `docs/practices/features/data-permission.md` | 1,174 | ✅ 已完成 |
| 3 | 定时任务开发 | `docs/practices/features/scheduled-jobs.md` | 1,190 | ✅ 已完成 |
| 4 | 消息推送实现 | `docs/practices/features/message-push.md` | 1,619 | ✅ 已完成 |
| 5 | 文件处理方案 | `docs/practices/features/file-processing.md` | 2,065 | ✅ 已完成 |
| 6 | Excel操作优化 | `docs/practices/features/excel-operations.md` | 1,656 | ✅ 已完成 |
| 7 | 第三方集成策略 | `docs/practices/features/third-party-integration.md` | 1,896 | ✅ 已完成 |
| 8 | 国际化实现方案 | `docs/practices/features/i18n.md` | 1,741 | ✅ 已完成 |

**目录说明**: 功能开发指南。

### 6. 🔒 安全指南

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 安全总览 | `docs/practices/security/overview.md` | 306 | ⚠️ 待完善 |
| 2 | 认证与授权 | `docs/practices/security/auth.md` | 521 | ✅ 已完成 |
| 3 | 数据安全 | `docs/practices/security/data.md` | 450 | ⚠️ 待完善 |
| 4 | API安全 | `docs/practices/security/api.md` | 475 | ⚠️ 待完善 |
| 5 | 客户端安全 | `docs/practices/security/client.md` | 620 | ✅ 已完成 |
| 6 | 安全审计 | `docs/practices/security/audit.md` | 456 | ⚠️ 待完善 |

**目录说明**: 安全开发指南。

### 7. 🚀 部署运维

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | Docker部署指南 | `docs/practices/devops/docker-deploy.md` | 560 | ✅ 已完成 |

**目录说明**: 部署运维指南。

### 最佳实践文档统计

| 分类 | 总数 | 已完成(≥500行) | 待完善(<500行) | 待创建 | 完成率 |
|------|------|----------------|----------------|--------|--------|
| 工程化 | 6 | 4 | 2 | 0 | 66.7% |
| 开发规范 | 9 | 7 | 0 | 2 | 77.8% |
| 架构设计 | 5 | 5 | 0 | 0 | 100% |
| 后端开发 | 10 | 6 | 0 | 4 | 60% |
| 功能开发 | 8 | 8 | 0 | 0 | 100% |
| 安全指南 | 6 | 2 | 4 | 0 | 33.3% |
| 部署运维 | 1 | 1 | 0 | 0 | 100% |
| **总计** | **45** | **33** | **6** | **6** | **73.3%** |

---

## 根目录文档

| 序号 | 文档名称 | 文件路径 | 行数 | 状态 |
|------|----------|----------|------|------|
| 1 | 首页 | `docs/index.md` | 255 | ⚠️ 待完善 |
| 2 | 更新日志 | `docs/changelog.md` | 903 | ✅ 已完成 |
| 3 | 演示 | `docs/demo.md` | 136 | ⚠️ 待完善 |
| 4 | 视频 | `docs/video.md` | 40 | ⚠️ 待完善 |

---

## 整体统计汇总

| 模块 | config.ts文档数 | 已完成(≥500行) | 待完善(<500行) | 待创建 | 完成率 |
|------|-----------------|----------------|----------------|--------|--------|
| 后端文档 | 67 | 41 | 26 | 0 | 61.2% |
| 前端文档 | 125 | 67 | 58 | 0 | 53.6% |
| 移动端文档 | 157 | 129 | 28 | 0 | 82.2% |
| 最佳实践 | 45 | 33 | 6 | 6 | 73.3% |
| 根目录 | 4 | 1 | 3 | 0 | 25% |
| **总计** | **398** | **271** | **121** | **6** | **68.1%** |

---

## 待创建文档清单

以下文档在 config.ts 中已配置，但实际文件不存在：

| 序号 | 文档名称 | 文件路径 |
|------|----------|----------|
| 1 | 开发规范概览 | `docs/practices/standards/overview.md` |
| 2 | 移动端开发规范 | `docs/practices/standards/mobile.md` |
| 3 | 后端开发概览 | `docs/practices/backend/overview.md` |
| 4 | DAO层设计模式 | `docs/practices/backend/dao-layer.md` |
| 5 | 日志规范 | `docs/practices/backend/logging.md` |
| 6 | API版本管理 | `docs/practices/backend/api-versioning.md` |

---

## 优先级任务

### 🔴 高优先级 (待创建)

1. `docs/practices/standards/overview.md` - 开发规范概览
2. `docs/practices/standards/mobile.md` - 移动端开发规范
3. `docs/practices/backend/overview.md` - 后端开发概览
4. `docs/practices/backend/dao-layer.md` - DAO层设计模式
5. `docs/practices/backend/logging.md` - 日志规范
6. `docs/practices/backend/api-versioning.md` - API版本管理

### 🟡 中优先级 (待完善 <500行)

**前端文档** (58个待完善)
- 快速开始: 全部4个
- 布局系统: 全部8个
- 组件系统: 17个组件
- 组合式函数: 13个

**移动端文档** (28个待完善)
- WD UI 组件: 19个反馈/表单组件
- 组合式函数: 5个

**后端文档** (26个待完善)
- 公共模块相关

### 🟢 低优先级

- 根目录文档完善
- 安全指南完善

---

**最后更新**: 2025-12-18
