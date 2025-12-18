# RuoYi-Plus-UniApp 文档任务清单

> 按照 `config.ts` 导航顺序从上到下整理
>
> **最后更新**: 2025-12-18
>
> **图例**: ✅ 已完成(≥500行) | ⚠️ 需完善(<500行) | ❌ 缺失 | 🆕 新增需求

---

## 一、后端文档 (`/backend/`)

### 1.1 快速开始

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 项目简介 | `backend/index.md` | ⚠️ | 178 |
| 快速启动 | `backend/getting-started.md` | ⚠️ | 311 |
| 项目结构 | `backend/project-structure.md` | ✅ | 522 |
| 配置文件 | `backend/configuration.md` | ⚠️ | 236 |

### 1.2 主应用 (ruoyi-admin)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 模块解析 | `backend/ruoyi-admin/module-resolution.md` | ⚠️ | 246 |

### 1.3 公共模块 (ruoyi-common)

#### 1.3.1 依赖版本管理 (bom)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 依赖版本管理 | `backend/common/bom.md` | ⚠️ | 252 |

#### 1.3.2 核心模块 (core)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 模块概览 | `backend/common/core.md` | ⚠️ | 429 |
| 配置管理 | `backend/common/core/config.md` | ✅ | 625 |
| 数据模型与DTO | `backend/common/core/domain.md` | ✅ | 977 |
| 工具类库 | `backend/common/core/utils.md` | ✅ | 883 |
| 异常处理 | `backend/common/core/exception.md` | ✅ | 610 |
| 参数校验 | `backend/common/core/validation.md` | ✅ | 1312 |
| 字典枚举 | `backend/common/core/enums.md` | ✅ | 773 |
| 通用服务接口 | `backend/common/core/service.md` | ✅ | 637 |

#### 1.3.3 其他公共模块

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 文档生成 (doc) | `backend/common/doc.md` | ⚠️ | 411 |
| 加密概览 | `backend/common/encrypt.md` | ⚠️ | 326 |
| 数据库字段加密 | `backend/common/encrypt/database-encryption.md` | ⚠️ | 386 |
| API接口加密 | `backend/common/encrypt/api-encryption.md` | ⚠️ | 318 |
| Excel处理 | `backend/common/excel.md` | ✅ | 563 |
| 幂等处理 | `backend/common/idempotent.md` | ⚠️ | 286 |
| 任务调度 (job) | `backend/common/job.md` | ⚠️ | 461 |
| JSON处理 | `backend/common/json.md` | ⚠️ | 353 |
| 日志管理 | `backend/common/log.md` | ⚠️ | 422 |
| HTTP客户端 | `backend/common/http.md` | ✅ | 2091 |

#### 1.3.4 LangChain4j AI集成

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 模块概览 | `backend/common/langchain4j.md` | ✅ | 556 |
| 快速开始 | `backend/common/langchain4j/quick-start.md` | ✅ | 946 |
| 模型工厂 | `backend/common/langchain4j/model-factory.md` | ⚠️ | 327 |
| 聊天服务 | `backend/common/langchain4j/chat-service.md` | ⚠️ | 430 |
| RAG检索增强 | `backend/common/langchain4j/rag.md` | ⚠️ | 462 |
| 向量存储 | `backend/common/langchain4j/vector-store.md` | ✅ | 503 |
| WebSocket流式对话 | `backend/common/langchain4j/websocket.md` | ✅ | 686 |

#### 1.3.5 其他服务模块

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 邮件服务 | `backend/common/mail.md` | ✅ | 618 |
| 媒体处理 | `backend/common/media.md` | ✅ | 1488 |
| 小程序集成 | `backend/common/miniapp.md` | ⚠️ | 464 |
| 公众号集成 | `backend/common/mp.md` | ⚠️ | 388 |
| MyBatisPlus增强 | `backend/common/mybatis.md` | ⚠️ | 469 |
| OSS存储 | `backend/common/oss.md` | ✅ | 532 |
| 支付集成 | `backend/common/pay.md` | ✅ | 632 |
| OpenAPI文档 | `backend/common/openapi.md` | ✅ | 2465 |
| 限流组件 | `backend/common/ratelimiter.md` | ✅ | 502 |
| Redis缓存 | `backend/common/redis.md` | ✅ | 872 |

#### 1.3.6 RocketMQ消息队列

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 快速开始 | `backend/common/rocketmq/quick-start.md` | ✅ | 541 |
| 消息生产 | `backend/common/rocketmq/producer.md` | ✅ | 570 |
| 消息消费 | `backend/common/rocketmq/consumer.md` | ✅ | 663 |

#### 1.3.7 安全与其他模块

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 权限认证 (satoken) | `backend/common/satoken.md` | ✅ | 649 |
| 安全防护 | `backend/common/security.md` | ⚠️ | 293 |
| 脱敏处理 | `backend/common/sensitive.md` | ✅ | 638 |
| 序列化映射 | `backend/common/serialmap.md` | ✅ | 1188 |
| 短信服务 | `backend/common/sms.md` | ⚠️ | 347 |
| 社交登录 | `backend/common/social.md` | ⚠️ | 487 |
| SSE推送 | `backend/common/sse.md` | ⚠️ | 383 |
| 多租户 | `backend/common/tenant.md` | ✅ | 506 |

#### 1.3.8 测试支持 (test)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 快速开始 | `backend/common/test/quick-start.md` | ✅ | 506 |
| 测试基础类 | `backend/common/test/base-classes.md` | ✅ | 727 |
| 测试数据工厂 | `backend/common/test/test-data-factory.md` | ✅ | 589 |

#### 1.3.9 Web与通讯

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Web组件 | `backend/common/web.md` | ⚠️ | 292 |
| 通讯 (websocket) | `backend/common/websocket.md` | ✅ | 799 |

### 1.4 业务模块 (ruoyi-modules)

#### 1.4.1 系统模块 (system)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 模块概览 | `backend/modules/system.md` | ✅ | 1330 |
| 认证授权 | `backend/modules/system/auth.md` | ✅ | 1080 |
| 系统配置 | `backend/modules/system/config.md` | ✅ | 856 |
| 核心功能 | `backend/modules/system/core.md` | ⚠️ | 466 |
| 字典管理 | `backend/modules/system/dict.md` | ⚠️ | 366 |
| 系统监控 | `backend/modules/system/monitor.md` | ⚠️ | 343 |
| OSS存储 | `backend/modules/system/oss.md` | ✅ | 963 |
| 多租户 | `backend/modules/system/tenant.md` | ⚠️ | 330 |

#### 1.4.2 代码生成器 (Generator)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 模块概览 | `backend/modules/generator.md` | ⚠️ | 253 |
| 快速开始 | `backend/modules/generator/quick-start.md` | ✅ | 1524 |
| 表导入与配置 | `backend/modules/generator/table-management.md` | ⚠️ | 411 |
| 字段配置详解 | `backend/modules/generator/column-config.md` | ✅ | 817 |
| 模板类型详解 | `backend/modules/generator/template-types.md` | ✅ | 725 |

#### 1.4.3 业务模块 (business)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 模块概览 | `backend/modules/business.md` | ✅ | 1322 |
| 基础服务 | `backend/modules/business/base.md` | ✅ | 1322 |
| 商城模块 | `backend/modules/business/mall.md` | ✅ | 734 |
| 任务调度 | `backend/modules/business/job.md` | ✅ | 806 |

### 1.5 扩展模块 (ruoyi-extend)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 监控管理 | `backend/extend/monitor-admin.md` | ⚠️ | 323 |
| 任务服务 | `backend/extend/snailjob-server.md` | ⚠️ | 314 |

---

## 二、前端文档 (`/frontend/`)

### 2.1 快速开始

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 项目简介 | `frontend/index.md` | ⚠️ | 229 |
| 快速启动 | `frontend/getting-started.md` | ⚠️ | 308 |
| 项目结构 | `frontend/project-structure.md` | ⚠️ | 310 |
| 配置文件 | `frontend/configuration.md` | ⚠️ | 380 |

### 2.2 项目架构

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 技术栈介绍 | `frontend/architecture/tech-stack.md` | ⚠️ | 327 |
| 模块化设计 | `frontend/architecture/modular-design.md` | ⚠️ | 330 |
| TypeScript配置 | `frontend/architecture/typescript-config.md` | ✅ | 543 |
| 类型系统 | `frontend/architecture/type-system.md` | ✅ | 590 |
| Vite构建配置 | `frontend/architecture/vite-config.md` | ✅ | 615 |

### 2.3 路由系统

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 路由总览 | `frontend/router/overview.md` | ✅ | 1061 |
| 路由配置与守卫 | `frontend/router/config-guards.md` | ⚠️ | 279 |
| 权限与动态路由 | `frontend/router/permission-dynamic.md` | ⚠️ | 459 |

### 2.4 状态管理

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 状态管理概览 | `frontend/stores/overview.md` | ✅ | 2048 |
| 用户状态 | `frontend/stores/user-store.md` | ✅ | 2160 |
| 权限状态 | `frontend/stores/permission-store.md` | ✅ | 1939 |
| 字典状态 | `frontend/stores/dict-store.md` | ✅ | 2179 |
| 通知状态 | `frontend/stores/notice-store.md` | ⚠️ | 265 |

### 2.5 布局系统

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 布局概述 | `frontend/layout/layout-overview.md` | ⚠️ | 329 |
| 主布局 | `frontend/layout/main-layout.md` | ⚠️ | 313 |
| 侧边栏 | `frontend/layout/sidebar.md` | ⚠️ | 483 |
| 顶部导航 | `frontend/layout/navbar.md` | ⚠️ | 486 |
| 标签视图 | `frontend/layout/tags-view.md` | ⚠️ | 431 |
| 主内容区 | `frontend/layout/app-main.md` | ⚠️ | 439 |
| 设置面板 | `frontend/layout/settings.md` | ⚠️ | 493 |
| 前台布局 | `frontend/layout/home-layout.md` | ⚠️ | 385 |

### 2.6 组件系统

#### 2.6.1 组件概览

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 组件概览 | `frontend/components/overview.md` | ⚠️ | 308 |

#### 2.6.2 基础组件

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 图标系统 | `frontend/components/basic/icon-system.md` | ✅ | 2401 |
| Icon 图标 | `frontend/components/basic/icon.md` | ✅ | 1101 |
| DictTag 字典标签 | `frontend/components/basic/dict-tag.md` | ✅ | 748 |

#### 2.6.3 表单组件

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 表单组件概览 | `frontend/components/form/overview.md` | ✅ | 2145 |
| AForm 表单容器 | `frontend/components/form/form.md` | ✅ | 634 |
| AFormCascader 级联选择 | `frontend/components/form/cascader.md` | ✅ | 754 |
| AFormCheckbox 复选框 | `frontend/components/form/checkbox.md` | ✅ | 954 |
| AFormDate 日期选择 | `frontend/components/form/date.md` | ✅ | 1096 |
| AFormEditor 富文本编辑 | `frontend/components/form/editor.md` | ✅ | 1113 |
| AFormFileUpload 文件上传 | `frontend/components/form/file-upload.md` | ✅ | 1033 |
| AFormImgUpload 图片上传 | `frontend/components/form/img-upload.md` | ⚠️ | 264 |
| AFormInput 输入框 | `frontend/components/form/input.md` | ✅ | 592 |
| AFormRadio 单选框 | `frontend/components/form/radio.md` | ✅ | 757 |
| AFormSelect 选择器 | `frontend/components/form/select.md` | ✅ | 733 |
| AFormSwitch 开关 | `frontend/components/form/switch.md` | ✅ | 936 |
| AFormTreeSelect 树选择 | `frontend/components/form/tree-select.md` | ✅ | 1028 |
| IconSelect 图标选择器 | `frontend/components/form/icon-select.md` | ⚠️ | 284 |

#### 2.6.4 数据展示组件

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| ADataCard 数据卡片 | `frontend/components/display/data-card.md` | ⚠️ | 262 |
| ADetailDialog 详情对话框 | `frontend/components/display/detail-dialog.md` | ⚠️ | 482 |
| TableToolbar 表格工具栏 | `frontend/components/display/table-toolbar.md` | ✅ | 1340 |
| Pagination 分页 | `frontend/components/display/pagination.md` | ✅ | 692 |

#### 2.6.5 反馈组件

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| ASearchForm 搜索表单 | `frontend/components/feedback/search-form.md` | ✅ | 1508 |
| ASelectionTags 选择标签 | `frontend/components/feedback/selection-tags.md` | ✅ | 1235 |

#### 2.6.6 业务组件

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 业务组件概览 | `frontend/components/business/overview.md` | ✅ | 2103 |
| AOssMediaManager 媒体库 | `frontend/components/business/oss-media-manager.md` | ✅ | 2315 |
| ARecharge 充值组件 | `frontend/components/business/recharge.md` | ⚠️ | 279 |
| AImportExcel Excel导入 | `frontend/components/business/import-excel.md` | ⚠️ | 289 |
| UserSelect 用户选择 | `frontend/components/business/user-select.md` | ⚠️ | 283 |

#### 2.6.7 布局组件

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| AGeometricBackground 几何装饰背景 | `frontend/components/layout/page-background.md` | ⚠️ | 195 |
| IFrameContainer iframe容器 | `frontend/components/layout/i-frame-container.md` | ⚠️ | 272 |

### 2.7 组合式函数

#### 2.7.1 组合式函数概览

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 组合式函数概览 | `frontend/composables/overview.md` | ✅ | 2031 |

#### 2.7.2 核心组合函数

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| useAuth 认证管理 | `frontend/composables/use-auth.md` | ⚠️ | 378 |
| useDict 字典管理 | `frontend/composables/use-dict.md` | ⚠️ | 449 |
| useHttp 请求管理 | `frontend/composables/use-http.md` | ⚠️ | 421 |
| useToken 令牌管理 | `frontend/composables/use-token.md` | ⚠️ | 272 |
| useI18n 国际化 | `frontend/composables/use-i18n.md` | ⚠️ | 270 |

#### 2.7.3 界面组合函数

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| useLayout 布局管理 | `frontend/composables/use-layout.md` | ✅ | 507 |
| useAnimation 动画效果 | `frontend/composables/use-animation.md` | ⚠️ | 273 |
| useDialog 对话框 | `frontend/composables/use-dialog.md` | ⚠️ | 439 |
| useTheme 主题管理 | `frontend/composables/use-theme.md` | ⚠️ | 284 |
| useResponsiveSpan 响应式 | `frontend/composables/use-responsive-span.md` | ⚠️ | 381 |
| useTableHeight 表格高度 | `frontend/composables/use-table-height.md` | ⚠️ | 270 |

#### 2.7.4 业务组合函数

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| useSelection 选择管理 | `frontend/composables/use-selection.md` | ⚠️ | 353 |
| useDownload 下载管理 | `frontend/composables/use-download.md` | ⚠️ | 375 |
| usePrint 打印功能 | `frontend/composables/use-print.md` | ✅ | 754 |
| useSSE 服务端事件 | `frontend/composables/use-sse.md` | ⚠️ | 268 |
| useWS WebSocket通信 | `frontend/composables/use-websocket.md` | ✅ | 821 |

### 2.8 工具库

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 工具函数概览 | `frontend/utils/utils-overview.md` | ⚠️ | 402 |
| 字符串工具 | `frontend/utils/string.md` | ✅ | 1280 |
| 对象工具 | `frontend/utils/object.md` | ✅ | 560 |
| 日期工具 | `frontend/utils/date.md` | ✅ | 568 |
| 格式化工具 | `frontend/utils/format.md` | ✅ | 773 |
| 函数工具 | `frontend/utils/function.md` | ✅ | 820 |
| 验证器 | `frontend/utils/validators.md` | ✅ | 1483 |
| 布尔值工具 | `frontend/utils/boolean.md` | ✅ | 925 |
| 加密工具 | `frontend/utils/crypto.md` | ✅ | 562 |
| RSA加密 | `frontend/utils/rsa.md` | ✅ | 517 |
| 缓存工具 | `frontend/utils/cache.md` | ✅ | 975 |
| DOM类操作 | `frontend/utils/class.md` | ✅ | 613 |
| 滚动工具 | `frontend/utils/scroll.md` | ✅ | 775 |
| 树形工具 | `frontend/utils/tree.md` | ✅ | 761 |
| 模态框工具 | `frontend/utils/modal.md` | ✅ | 973 |
| 标签页工具 | `frontend/utils/tab.md` | ✅ | 867 |
| To工具类 | `frontend/utils/to.md` | ✅ | 687 |

### 2.9 指令系统

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 权限指令 | `frontend/directives/permission.md` | ⚠️ | 404 |

### 2.10 样式系统

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 样式架构 | `frontend/styles/style-architecture.md` | ✅ | 1334 |
| UnoCSS配置 | `frontend/styles/unocss-config.md` | ✅ | 1661 |
| 工具类使用 | `frontend/styles/utility-classes.md` | ✅ | 1726 |
| 全局样式 | `frontend/styles/global-styles.md` | ✅ | 1701 |
| 主题系统 | `frontend/styles/theme-system.md` | ✅ | 1459 |
| 组件样式 | `frontend/styles/component-styles.md` | ✅ | 1093 |
| 动画系统 | `frontend/styles/animations.md` | ✅ | 1398 |
| 响应式设计 | `frontend/styles/responsive.md` | ✅ | 1705 |
| 最佳实践 | `frontend/styles/best-practices.md` | ✅ | 1891 |

### 2.11 图标系统

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 图标系统概述 | `frontend/icons/overview.md` | ⚠️ | 339 |
| Iconify配置 | `frontend/icons/iconify-config.md` | ⚠️ | 319 |
| Iconfont配置 | `frontend/icons/iconfont-config.md` | ⚠️ | 404 |
| 图标类型生成 | `frontend/icons/type-generation.md` | ⚠️ | 477 |
| 图标组件使用 | `frontend/icons/component-usage.md` | ✅ | 516 |
| 图标预设管理 | `frontend/icons/preset-management.md` | ⚠️ | 468 |
| 图标最佳实践 | `frontend/icons/best-practices.md` | ⚠️ | 442 |

### 2.12 类型定义

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 类型系统概览 | `frontend/types/overview.md` | ✅ | 1293 |
| API类型 | `frontend/types/api-types.md` | ✅ | 1108 |
| 全局类型 | `frontend/types/global-types.md` | ✅ | 1186 |
| 组件类型 | `frontend/types/component-types.md` | ✅ | 2222 |
| 路由类型 | `frontend/types/router-types.md` | ✅ | 1465 |
| 状态类型 | `frontend/types/store-types.md` | ✅ | 1738 |
| 工具类型 | `frontend/types/utility-types.md` | ✅ | 1303 |
| 枚举类型 | `frontend/types/enums.md` | ✅ | 991 |
| 类型扩展 | `frontend/types/type-extensions.md` | ✅ | 1415 |

### 2.13 开发工具

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Prettier配置 | `frontend/dev/prettier-config.md` | ✅ | 581 |
| 调试技巧 | `frontend/dev/debugging.md` | ✅ | 600 |
| 性能分析 | `frontend/dev/performance.md` | ✅ | 710 |
| 单元测试 | `frontend/dev/testing.md` | ✅ | 734 |
| 开发最佳实践 | `frontend/dev/best-practices.md` | ✅ | 733 |
| 自定义组件开发 | `frontend/dev/custom-component.md` | ✅ | 1359 |

### 2.14 低代码工具

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 页面设计器 | `frontend/tools/page-designer.md` | ⚠️ | 257 |

### 2.15 国际化

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 国际化配置 | `frontend/i18n/i18n-config.md` | ✅ | 1412 |
| 语言包管理 | `frontend/i18n/language-packs.md` | ⚠️ | 404 |
| 组件国际化 | `frontend/i18n/component-i18n.md` | ⚠️ | 447 |
| 国际化最佳实践 | `frontend/i18n/i18n-practices.md` | ✅ | 594 |

---

## 三、移动端文档 (`/mobile/`)

### 3.1 快速开始

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 项目简介 | `mobile/index.md` | ⚠️ | 218 |
| 快速启动 | `mobile/getting-started.md` | ✅ | 957 |
| 项目结构 | `mobile/project-structure.md` | ✅ | 1127 |
| 配置文件 | `mobile/configuration.md` | ✅ | 657 |
| 开发规范 | `mobile/dev-standards.md` | ✅ | 2301 |

### 3.2 UniApp基础

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| UniApp概览 | `mobile/uniapp/overview.md` | ✅ | 876 |
| 项目配置 (manifest.json) | `mobile/uniapp/manifest-config.md` | ✅ | 2263 |
| 页面配置 (pages.json) | `mobile/uniapp/pages-config.md` | ✅ | 523 |
| 应用配置 (uni.scss) | `mobile/uniapp/app-config.md` | ⚠️ | 446 |
| 生命周期 | `mobile/uniapp/lifecycle.md` | ✅ | 929 |
| 路由导航 | `mobile/uniapp/navigation.md` | ✅ | 797 |
| 条件编译 | `mobile/uniapp/conditional.md` | ✅ | 702 |
| HBuilderX使用 | `mobile/uniapp/hbuilderx.md` | ✅ | 511 |

### 3.3 WD UI 组件库

#### 3.3.1 组件库概览

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 组件库概览 | `mobile/wd/overview.md` | ✅ | 736 |
| 主题定制 | `mobile/styles/theme.md` | ✅ | 1307 |
| 快速开始 | `mobile/wd/getting-started.md` | ✅ | 571 |

#### 3.3.2 基础组件 (6个)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Button 按钮 | `mobile/wd/basic/button.md` | ✅ | 1172 |
| Icon 图标 | `mobile/wd/basic/icon.md` | ✅ | 1538 |
| Text 文本 | `mobile/wd/basic/text.md` | ✅ | 1295 |
| Transition 动画 | `mobile/wd/basic/transition.md` | ✅ | 1429 |
| Resize 监听元素尺寸 | `mobile/wd/basic/resize.md` | ✅ | 1499 |
| ConfigProvider 配置 | `mobile/wd/basic/config-provider.md` | ✅ | 1752 |

#### 3.3.3 布局组件 (5个)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Row-Col 行列布局 | `mobile/wd/layout/row-col.md` | ✅ | 1519 |
| Grid 宫格 | `mobile/wd/layout/grid.md` | ✅ | 2070 |
| Gap 间隙槽 | `mobile/wd/layout/gap.md` | ✅ | 1204 |
| Divider 分割线 | `mobile/wd/layout/divider.md` | ✅ | 1222 |
| Sticky 吸顶布局 | `mobile/wd/layout/sticky.md` | ✅ | 1380 |

#### 3.3.4 导航组件 (10个)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Navbar 导航栏 | `mobile/wd/navigation/navbar.md` | ✅ | 1251 |
| Tabbar 标签栏 | `mobile/wd/navigation/tabbar.md` | ✅ | 2002 |
| Tabs 标签页 | `mobile/wd/navigation/tabs.md` | ✅ | 2107 |
| Segmented 分段器 | `mobile/wd/navigation/segmented.md` | ✅ | 1586 |
| Sidebar 侧边栏 | `mobile/wd/navigation/sidebar.md` | ✅ | 1727 |
| IndexBar 索引栏 | `mobile/wd/navigation/index-bar.md` | ✅ | 1206 |
| Pagination 分页 | `mobile/wd/navigation/pagination.md` | ✅ | 1535 |
| Paging 分页加载 | `mobile/wd/navigation/paging.md` | ✅ | 1844 |
| Backtop 回到顶部 | `mobile/wd/navigation/backtop.md` | ✅ | 1206 |
| Fab 悬浮按钮 | `mobile/wd/navigation/fab.md` | ⚠️ | 429 |

#### 3.3.5 表单组件 (24个)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Input 输入框 | `mobile/wd/form/input.md` | ✅ | 1505 |
| Textarea 文本域 | `mobile/wd/form/textarea.md` | ✅ | 1426 |
| InputNumber 计数器 | `mobile/wd/form/input-number.md` | ✅ | 1657 |
| PasswordInput 密码 | `mobile/wd/form/password-input.md` | ✅ | 1466 |
| Search 搜索 | `mobile/wd/form/search.md` | ✅ | 1462 |
| Checkbox 复选框 | `mobile/wd/form/checkbox.md` | ✅ | 1405 |
| Radio 单选框 | `mobile/wd/form/radio.md` | ✅ | 1282 |
| Switch 开关 | `mobile/wd/form/switch.md` | ✅ | 1042 |
| Rate 评分 | `mobile/wd/form/rate.md` | ✅ | 1269 |
| Slider 滑块 | `mobile/wd/form/slider.md` | ✅ | 1519 |
| Picker 选择器 | `mobile/wd/form/picker.md` | ✅ | 1609 |
| PickerView 选择器视图 | `mobile/wd/form/picker-view.md` | ⚠️ | 404 |
| ColPicker 多列选择器 | `mobile/wd/form/col-picker.md` | ✅ | 1669 |
| SelectPicker 单复选 | `mobile/wd/form/select-picker.md` | ✅ | 2237 |
| DatetimePicker 时间 | `mobile/wd/form/datetime-picker.md` | ✅ | 1947 |
| DatetimePickerView | `mobile/wd/form/datetime-picker-view.md` | ⚠️ | 454 |
| Calendar 日历 | `mobile/wd/form/calendar.md` | ✅ | 1794 |
| CalendarView 日历板 | `mobile/wd/form/calendar-view.md` | ✅ | 632 |
| Upload 上传 | `mobile/wd/form/upload.md` | ✅ | 1819 |
| Form 表单 | `mobile/wd/form/form.md` | ✅ | 1560 |
| Signature 签名 | `mobile/wd/form/signature.md` | ⚠️ | 367 |
| Recorder 录音 | `mobile/wd/form/voice-recorder.md` | ⚠️ | 353 |
| Keyboard 虚拟键盘 | `mobile/wd/form/keyboard.md` | ⚠️ | 397 |
| NumberKeyboard 数字键盘 | `mobile/wd/form/number-keyboard.md` | ⚠️ | 434 |

#### 3.3.6 展示组件 (14个)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Cell 单元格 | `mobile/wd/display/cell.md` | ✅ | 997 |
| Badge 徽标 | `mobile/wd/display/badge.md` | ✅ | 1699 |
| Tag 标签 | `mobile/wd/display/tag.md` | ✅ | 1360 |
| Card 卡片 | `mobile/wd/display/card.md` | ✅ | 1207 |
| Collapse 折叠面板 | `mobile/wd/display/collapse.md` | ✅ | 1219 |
| Steps 步骤条 | `mobile/wd/display/steps.md` | ✅ | 1094 |
| Table 表格 | `mobile/wd/display/table.md` | ✅ | 807 |
| Img 图片 | `mobile/wd/display/img.md` | ✅ | 1303 |
| ImgCropper 图片裁剪 | `mobile/wd/display/img-cropper.md` | ✅ | 961 |
| Swiper 轮播图 | `mobile/wd/display/swiper.md` | ✅ | 1938 |
| Skeleton 骨架屏 | `mobile/wd/display/skeleton.md` | ✅ | 2209 |
| Curtain 幕帘 | `mobile/wd/display/curtain.md` | ✅ | 1939 |
| Watermark 水印 | `mobile/wd/display/watermark.md` | ✅ | 769 |
| Progress 进度条 | `mobile/wd/display/progress.md` | ✅ | 1286 |

#### 3.3.7 反馈组件 (19个)

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| ActionSheet 上拉菜单 | `mobile/wd/feedback/action-sheet.md` | ✅ | 1682 |
| Popup 弹出层 | `mobile/wd/feedback/popup.md` | ✅ | 1492 |
| Overlay 遮罩层 | `mobile/wd/feedback/overlay.md` | ✅ | 1159 |
| MessageBox 弹框 | `mobile/wd/feedback/message-box.md` | ✅ | 1249 |
| Toast 轻提示 | `mobile/wd/feedback/toast.md` | ✅ | 1518 |
| Notify 消息通知 | `mobile/wd/feedback/notify.md` | ✅ | 1047 |
| Loading 加载指示器 | `mobile/wd/feedback/loading.md` | ✅ | 1616 |
| Circle 环形进度条 | `mobile/wd/feedback/circle.md` | ⚠️ | 370 |
| Loadmore 加载更多 | `mobile/wd/feedback/loadmore.md` | ⚠️ | 318 |
| StatusTip 缺省提示 | `mobile/wd/feedback/status-tip.md` | ⚠️ | 310 |
| Tooltip 文字提示 | `mobile/wd/feedback/tooltip.md` | ⚠️ | 319 |
| Popover 气泡 | `mobile/wd/feedback/popover.md` | ⚠️ | 436 |
| DropMenu 下拉菜单 | `mobile/wd/feedback/drop-menu.md` | ✅ | 519 |
| FloatingPanel 浮动面板 | `mobile/wd/feedback/floating-panel.md` | ⚠️ | 315 |
| SwipeAction 滑动操作 | `mobile/wd/feedback/swipe-action.md` | ✅ | 909 |
| SortButton 排序按钮 | `mobile/wd/feedback/sort-button.md` | ⚠️ | 366 |
| NoticeBar 通知栏 | `mobile/wd/feedback/notice-bar.md` | ✅ | 1544 |
| CountDown 倒计时 | `mobile/wd/feedback/count-down.md` | ⚠️ | 329 |
| CountTo 数字滚动 | `mobile/wd/feedback/count-to.md` | ⚠️ | 317 |

### 3.4 组合式函数

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 组合式函数概览 | `mobile/composables/overview.md` | ⚠️ | 492 |
| useAuth 认证管理 | `mobile/composables/use-auth.md` | ✅ | 1213 |
| useDict 字典管理 | `mobile/composables/use-dict.md` | ✅ | 1823 |
| useHttp 请求管理 | `mobile/composables/use-http.md` | ✅ | 2243 |
| useToken 令牌管理 | `mobile/composables/use-token.md` | ✅ | 1421 |
| useAppInit 应用初始化 | `mobile/composables/use-app-init.md` | ⚠️ | 408 |
| usePayment 支付处理 | `mobile/composables/use-payment.md` | ✅ | 1362 |
| useShare 分享功能 | `mobile/composables/use-share.md` | ⚠️ | 417 |
| useScroll 滚动处理 | `mobile/composables/use-scroll.md` | ✅ | 1248 |
| useEventBus 事件总线 | `mobile/composables/use-event-bus.md` | ⚠️ | 415 |
| useWebSocket 实时通信 | `mobile/composables/use-websocket.md` | ✅ | 675 |
| useTheme 主题管理 | `mobile/composables/use-theme.md` | ✅ | 1837 |
| useI18n 国际化 | `mobile/composables/use-i18n.md` | ⚠️ | 411 |
| 自定义Hook开发 | `mobile/composables/custom-hooks.md` | ✅ | 909 |

### 3.5 工具库

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 工具函数概览 | `mobile/utils/overview.md` | ✅ | 811 |
| string 字符串工具 | `mobile/utils/string.md` | ✅ | 557 |
| boolean 布尔值工具 | `mobile/utils/boolean.md` | ⚠️ | 433 |
| function 函数工具 | `mobile/utils/function.md` | ✅ | 611 |
| date 日期工具 | `mobile/utils/date.md` | ✅ | 2075 |
| validators 验证工具 | `mobile/utils/validators.md` | ✅ | 574 |
| cache 缓存工具 | `mobile/utils/cache.md` | ✅ | 569 |
| route 路由工具 | `mobile/utils/route.md` | ✅ | 501 |
| platform 平台工具 | `mobile/utils/platform.md` | ✅ | 556 |
| tenant 租户工具 | `mobile/utils/tenant.md` | ✅ | 555 |
| crypto 加密工具 | `mobile/utils/crypto.md` | ✅ | 1805 |
| rsa RSA加密 | `mobile/utils/rsa.md` | ⚠️ | 484 |
| to 异步处理 | `mobile/utils/to.md` | ✅ | 637 |

### 3.6 页面开发

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 页面概述 | `mobile/pages/index.md` | ✅ | 1504 |
| 登录页面 | `mobile/pages/login.md` | ✅ | 1415 |
| 分包页面管理 | `mobile/pages/subpackages.md` | ✅ | 628 |

### 3.7 布局系统

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 布局概述 | `mobile/layouts/overview.md` | ✅ | 1853 |
| 默认布局 | `mobile/layouts/default.md` | ✅ | 1806 |
| 导航栏配置 | `mobile/layouts/navbar.md` | ✅ | 1617 |
| 标签栏配置 | `mobile/layouts/tabbar.md` | ✅ | 1212 |
| 胶囊组件 | `mobile/layouts/capsule.md` | ✅ | 1337 |

### 3.8 样式系统

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 样式概览 | `mobile/styles/overview.md` | ✅ | 1527 |
| 样式架构设计 | `mobile/styles/architecture.md` | ✅ | 539 |
| UnoCSS配置 | `mobile/styles/unocss.md` | ✅ | 1182 |
| 全局样式 | `mobile/styles/global.md` | ✅ | 1183 |
| rpx单位使用 | `mobile/styles/rpx-units.md` | ✅ | 514 |
| 主题定制 | `mobile/styles/theme.md` | ✅ | 1307 |
| 响应式设计 | `mobile/styles/responsive.md` | ✅ | 1571 |
| 组件样式 | `mobile/styles/components.md` | ✅ | 1645 |
| 样式最佳实践 | `mobile/styles/best-practices.md` | ✅ | 1863 |

### 3.9 组件开发

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 自定义组件开发 | `mobile/components/custom-development.md` | ✅ | 879 |
| 组件封装规范 | `mobile/components/encapsulation-standards.md` | ✅ | 623 |
| 组件通信模式 | `mobile/components/communication-patterns.md` | ✅ | 885 |
| 组件生命周期 | `mobile/components/lifecycle.md` | ✅ | 955 |
| 组件测试 | `mobile/components/testing.md` | ✅ | 901 |

### 3.10 平台适配

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 平台差异说明 | `mobile/platform/differences.md` | ✅ | 994 |
| H5端适配 | `mobile/platform/h5.md` | ✅ | 1011 |
| 微信小程序适配 | `mobile/platform/wechat.md` | ✅ | 1054 |
| 支付宝小程序适配 | `mobile/platform/alipay.md` | ✅ | 1201 |

### 3.11 性能优化

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 性能优化概览 | `mobile/performance/overview.md` | ✅ | 994 |
| 启动性能优化 | `mobile/performance/startup.md` | ✅ | 1691 |
| 渲染性能优化 | `mobile/performance/rendering.md` | ✅ | 2188 |
| 包体积优化 | `mobile/performance/bundle-size.md` | ✅ | 868 |
| 图片优化 | `mobile/performance/image.md` | ✅ | 1953 |
| 分包加载优化 | `mobile/performance/subpackage.md` | ✅ | 1203 |

### 3.12 打包发布

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 打包配置概览 | `mobile/build/overview.md` | ✅ | 1304 |
| 环境配置 | `mobile/build/environment.md` | ✅ | 815 |
| H5打包发布 | `mobile/build/h5-deploy.md` | ✅ | 1101 |
| 微信小程序发布 | `mobile/build/wechat-deploy.md` | ✅ | 1225 |

---

## 四、最佳实践 (`/practices/`)

### 4.1 工程化

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Skills 技能系统 | `practices/engineering/claude-code-skills.md` | ⚠️ | 334 |
| Commands 自定义命令 | `practices/engineering/claude-code-commands.md` | ⚠️ | 428 |
| Hooks 钩子机制 | `practices/engineering/claude-code-hooks.md` | ✅ | 556 |
| MCP 服务器配置 | `practices/engineering/claude-code-mcp.md` | ✅ | 636 |
| Sub-Agents 子代理 | `practices/engineering/claude-code-agents.md` | ✅ | 672 |
| 代码生成器使用 | `practices/engineering/code-generator.md` | ✅ | 1054 |

### 4.2 开发规范

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 开发规范概览 | `practices/standards/overview.md` | ⚠️ | 420 |
| 代码规范 | `practices/standards/coding.md` | ✅ | 804 |
| API设计规范 | `practices/standards/api-design.md` | ✅ | 654 |
| 命名规范 | `practices/standards/naming.md` | ✅ | 1405 |
| 注释规范 | `practices/standards/comment.md` | ✅ | 2396 |
| Git使用规范 | `practices/standards/git.md` | ✅ | 849 |
| 数据库规范 | `practices/standards/database.md` | ✅ | 1141 |
| 前端开发规范 | `practices/standards/frontend.md` | ✅ | 1351 |
| 移动端开发规范 | `practices/standards/mobile.md` | ⚠️ | 310 |

### 4.3 架构设计

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 系统架构设计 | `practices/architecture/system.md` | ✅ | 1919 |
| 数据库设计 | `practices/architecture/database.md` | ✅ | 2457 |
| 缓存策略 | `practices/architecture/cache.md` | ✅ | 2403 |
| 分布式设计 | `practices/architecture/distributed.md` | ✅ | 2635 |
| 多租户架构 | `practices/architecture/multi-tenant.md` | ✅ | 1884 |

### 4.4 后端开发

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 后端开发概览 | `practices/backend/overview.md` | ✅ | 520 |
| Service层最佳实践 | `practices/backend/service-layer.md` | ✅ | 677 |
| Controller层最佳实践 | `practices/backend/controller-layer.md` | ✅ | 1276 |
| DAO层设计模式 | `practices/backend/dao-layer.md` | ✅ | 605 |
| 数据访问层优化 | `practices/backend/data-access.md` | ✅ | 1382 |
| 事务管理策略 | `practices/backend/transaction.md` | ✅ | 1352 |
| 异常处理机制 | `practices/backend/exception-handling.md` | ✅ | 1692 |
| 数据校验最佳实践 | `practices/backend/validation.md` | ✅ | 1496 |

### 4.5 功能开发

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 权限控制实现 | `practices/features/permission-control.md` | ✅ | 1083 |
| 数据权限设计 | `practices/features/data-permission.md` | ✅ | 1174 |
| 定时任务开发 | `practices/features/scheduled-jobs.md` | ✅ | 1190 |
| 消息推送实现 | `practices/features/message-push.md` | ✅ | 1619 |
| 文件处理方案 | `practices/features/file-processing.md` | ✅ | 2065 |
| Excel操作优化 | `practices/features/excel-operations.md` | ✅ | 1656 |
| 第三方集成策略 | `practices/features/third-party-integration.md` | ✅ | 1896 |
| 国际化实现方案 | `practices/features/i18n.md` | ✅ | 1741 |

### 4.6 安全指南

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| 安全总览 | `practices/security/overview.md` | ⚠️ | 313 |
| 认证与授权 | `practices/security/auth.md` | ✅ | 521 |
| 数据安全 | `practices/security/data.md` | ⚠️ | 450 |
| API安全 | `practices/security/api.md` | ⚠️ | 475 |
| 客户端安全 | `practices/security/client.md` | ✅ | 620 |
| 安全审计 | `practices/security/audit.md` | ⚠️ | 456 |

### 4.7 部署运维

| 文档 | 路径 | 状态 | 行数 |
|------|------|------|------|
| Docker部署指南 | `practices/devops/docker-deploy.md` | ✅ | 560 |

---

## 五、统计汇总

### 5.1 完成度统计

| 模块 | 总文档数 | 已完成(≥500行) | 需完善(<500行) | 缺失 | 完成率 |
|------|---------|---------------|---------------|------|--------|
| 后端文档 | 61 | 38 | 23 | 0 | 62.3% |
| 前端文档 | 93 | 60 | 33 | 0 | 64.5% |
| 移动端文档 | 107 | 91 | 16 | 0 | 85.0% |
| 最佳实践 | 33 | 28 | 5 | 0 | 84.8% |
| **总计** | **294** | **217** | **77** | **0** | **73.8%** |

### 5.2 缺失文档清单

✅ 所有文档均已创建，无缺失文档。

### 5.3 优先级任务

#### 🟡 中优先级 (需完善文档 - 行数不足500)

**后端文档:**
- [ ] `backend/index.md` (178行)
- [ ] `backend/getting-started.md` (311行)
- [ ] `backend/configuration.md` (236行)
- [ ] `backend/ruoyi-admin/module-resolution.md` (246行)
- [ ] `backend/common/bom.md` (252行)
- [ ] `backend/common/core.md` (429行)

**前端文档:**
- [ ] `frontend/index.md` (229行)
- [ ] `frontend/getting-started.md` (308行)
- [ ] `frontend/components/overview.md` (308行)
- [ ] `frontend/composables/use-auth.md` (378行)
- [ ] `frontend/icons/overview.md` (339行)

**移动端文档:**
- [ ] `mobile/index.md` (218行)
- [ ] `mobile/wd/navigation/fab.md` (429行)
- [ ] `mobile/wd/form/picker-view.md` (404行)
- [ ] `mobile/wd/feedback/circle.md` (370行)

**最佳实践:**
- [ ] `practices/standards/overview.md` (420行)
- [ ] `practices/standards/mobile.md` (310行)
- [ ] `practices/security/overview.md` (313行)

---

## 六、更新日志

| 日期 | 更新内容 |
|------|---------|
| 2025-12-18 | 创建practices/standards/overview.md(420行)、practices/backend/overview.md(520行)、practices/backend/dao-layer.md(605行)；移除logging和api-versioning导航项 |
| 2025-12-18 | 初始创建文档任务清单,按config.ts导航顺序整理 |

---

> **注**: 本清单根据 `config.ts` 导航配置自动生成,行数统计基于实际文件内容。
