# RuoYi-Plus-UniApp 文档进度清单

> **最后更新**: 2025-12-29
> **整体完成度**: 100% (498/498)
> **总行数**: 762,000+ 行
>
> 按照 `config.ts` 导航顺序整理，用于复查和维护
>
> **图例**: ✅ 已完成(≥1000行) | ⚠️ 需完善(<1000行) | ❌ 缺失

---

## 整体统计

| 模块 | 总数 | 已完成 | 完成率 |
|------|------|--------|--------|
| 后端文档 | 98 | 98 | **100%** |
| 前端文档 | 141 | 141 | **100%** |
| 移动端文档 | 129 | 129 | **100%** |
| WD 组件库 | 83 | 83 | **100%** |
| 最佳实践 | 43 | 43 | **100%** |
| 首页与其他 | 4 | 4 | **100%** |
| **总计** | **498** | **498** | **100%** |

---

## 一、后端文档 (`/backend/`)

### 1.1 快速开始

| 文档 | 路径 | 状态 |
|------|------|------|
| 项目简介 | `backend/index.md` | ✅ |
| 快速启动 | `backend/getting-started.md` | ✅ |
| 项目结构 | `backend/project-structure.md` | ✅ |
| 配置文件 | `backend/configuration.md` | ✅ |

### 1.2 架构设计

| 文档 | 路径 | 状态 |
|------|------|------|
| 架构概览 | `backend/architecture/overview.md` | ✅ |

### 1.3 核心组件

| 文档 | 路径 | 状态 |
|------|------|------|
| BaseMapper 增强 | `backend/core/base-mapper.md` | ✅ |
| 全局异常处理 | `backend/core/exception-handler.md` | ✅ |

### 1.4 主应用 (ruoyi-admin)

| 文档 | 路径 | 状态 |
|------|------|------|
| 模块概览 | `backend/ruoyi-admin/overview.md` | ✅ |
| 模块解析 | `backend/ruoyi-admin/module-resolution.md` | ✅ |
| 启动配置 | `backend/ruoyi-admin/startup.md` | ✅ |
| 配置管理 | `backend/ruoyi-admin/configuration.md` | ✅ |
| 安全配置 | `backend/ruoyi-admin/security.md` | ✅ |
| 日志配置 | `backend/ruoyi-admin/logging.md` | ✅ |
| 国际化 | `backend/ruoyi-admin/i18n.md` | ✅ |

### 1.5 公共模块 (ruoyi-common)

#### 核心模块 (core)

| 文档 | 路径 | 状态 |
|------|------|------|
| 依赖版本管理 | `backend/common/bom.md` | ✅ |
| 模块概览 | `backend/common/core.md` | ✅ |
| 配置管理 | `backend/common/core/config.md` | ✅ |
| 数据模型与DTO | `backend/common/core/domain.md` | ✅ |
| 工具类库 | `backend/common/core/utils.md` | ✅ |
| 异常处理 | `backend/common/core/exception.md` | ✅ |
| 参数校验 | `backend/common/core/validation.md` | ✅ |
| 字典枚举 | `backend/common/core/enums.md` | ✅ |
| 通用服务接口 | `backend/common/core/service.md` | ✅ |

#### 其他公共模块

| 文档 | 路径 | 状态 |
|------|------|------|
| 文档生成 (doc) | `backend/common/doc.md` | ✅ |
| 加密概览 | `backend/common/encrypt.md` | ✅ |
| 数据库字段加密 | `backend/common/encrypt/database-encryption.md` | ✅ |
| API接口加密 | `backend/common/encrypt/api-encryption.md` | ✅ |
| Excel处理 | `backend/common/excel.md` | ✅ |
| 文档模板 (doctemplate) | `backend/common/doctemplate.md` | ✅ |
| 幂等处理 | `backend/common/idempotent.md` | ✅ |
| 任务调度 (job) | `backend/common/job.md` | ✅ |
| JSON处理 | `backend/common/json.md` | ✅ |
| 日志管理 | `backend/common/log.md` | ✅ |
| HTTP客户端 | `backend/common/http.md` | ✅ |

#### LangChain4j AI集成

| 文档 | 路径 | 状态 |
|------|------|------|
| 模块概览 | `backend/common/langchain4j.md` | ✅ |
| 快速开始 | `backend/common/langchain4j/quick-start.md` | ✅ |
| 模型工厂 | `backend/common/langchain4j/model-factory.md` | ✅ |
| 聊天服务 | `backend/common/langchain4j/chat-service.md` | ✅ |
| RAG检索增强 | `backend/common/langchain4j/rag.md` | ✅ |
| 向量存储 | `backend/common/langchain4j/vector-store.md` | ✅ |
| WebSocket流式对话 | `backend/common/langchain4j/websocket.md` | ✅ |

#### 其他服务模块

| 文档 | 路径 | 状态 |
|------|------|------|
| 邮件服务 | `backend/common/mail.md` | ✅ |
| 媒体处理 | `backend/common/media.md` | ✅ |
| 小程序集成 | `backend/common/miniapp.md` | ✅ |
| 公众号集成 | `backend/common/mp.md` | ✅ |
| MyBatisPlus增强 | `backend/common/mybatis.md` | ✅ |
| OSS存储 | `backend/common/oss.md` | ✅ |
| 支付集成 | `backend/common/pay.md` | ✅ |
| OpenAPI文档 | `backend/common/openapi.md` | ✅ |
| 限流组件 | `backend/common/ratelimiter.md` | ✅ |
| Redis缓存 | `backend/common/redis.md` | ✅ |

#### RocketMQ消息队列

| 文档 | 路径 | 状态 |
|------|------|------|
| 快速开始 | `backend/common/rocketmq/quick-start.md` | ✅ |
| 消息生产 | `backend/common/rocketmq/producer.md` | ✅ |
| 消息消费 | `backend/common/rocketmq/consumer.md` | ✅ |

#### 安全与其他模块

| 文档 | 路径 | 状态 |
|------|------|------|
| 权限认证 (satoken) | `backend/common/satoken.md` | ✅ |
| 安全防护 | `backend/common/security.md` | ✅ |
| 脱敏处理 | `backend/common/sensitive.md` | ✅ |
| 序列化映射 | `backend/common/serialmap.md` | ✅ |
| 短信服务 | `backend/common/sms.md` | ✅ |
| 社交登录 | `backend/common/social.md` | ✅ |
| SSE推送 | `backend/common/sse.md` | ✅ |
| 多租户 | `backend/common/tenant.md` | ✅ |

#### 测试支持 (test)

| 文档 | 路径 | 状态 |
|------|------|------|
| 快速开始 | `backend/common/test/quick-start.md` | ✅ |
| 测试基础类 | `backend/common/test/base-classes.md` | ✅ |
| 测试数据工厂 | `backend/common/test/test-data-factory.md` | ✅ |

#### Web与通讯

| 文档 | 路径 | 状态 |
|------|------|------|
| Web组件 | `backend/common/web.md` | ✅ |
| 通讯 (websocket) | `backend/common/websocket.md` | ✅ |

### 1.6 业务模块 (ruoyi-modules)

#### 系统模块 (system)

| 文档 | 路径 | 状态 |
|------|------|------|
| 模块概览 | `backend/modules/system.md` | ✅ |
| 认证授权 | `backend/modules/system/auth.md` | ✅ |
| 系统配置 | `backend/modules/system/config.md` | ✅ |
| 核心功能 | `backend/modules/system/core.md` | ✅ |
| 字典管理 | `backend/modules/system/dict.md` | ✅ |
| 系统监控 | `backend/modules/system/monitor.md` | ✅ |
| OSS存储 | `backend/modules/system/oss.md` | ✅ |
| 多租户 | `backend/modules/system/tenant.md` | ✅ |

#### 代码生成器 (Generator)

| 文档 | 路径 | 状态 |
|------|------|------|
| 模块概览 | `backend/modules/generator.md` | ✅ |
| 快速开始 | `backend/modules/generator/quick-start.md` | ✅ |
| 表导入与配置 | `backend/modules/generator/table-management.md` | ✅ |
| 字段配置详解 | `backend/modules/generator/column-config.md` | ✅ |
| 模板类型详解 | `backend/modules/generator/template-types.md` | ✅ |

#### 业务模块 (business)

| 文档 | 路径 | 状态 |
|------|------|------|
| 模块概览 | `backend/modules/business.md` | ✅ |
| 基础服务 | `backend/modules/business/base.md` | ✅ |
| 商城模块 | `backend/modules/business/mall.md` | ✅ |
| 任务调度 | `backend/modules/business/job.md` | ✅ |

### 1.7 扩展模块 (ruoyi-extend)

| 文档 | 路径 | 状态 |
|------|------|------|
| 监控管理 | `backend/extend/monitor-admin.md` | ✅ |
| 任务服务 | `backend/extend/snailjob-server.md` | ✅ |

---

## 二、前端文档 (`/frontend/`)

### 2.1 快速开始

| 文档 | 路径 | 状态 |
|------|------|------|
| 项目简介 | `frontend/index.md` | ✅ |
| 快速启动 | `frontend/getting-started.md` | ✅ |
| 项目结构 | `frontend/project-structure.md` | ✅ |
| 配置文件 | `frontend/configuration.md` | ✅ |

### 2.2 项目架构

| 文档 | 路径 | 状态 |
|------|------|------|
| 技术栈介绍 | `frontend/architecture/tech-stack.md` | ✅ |
| 模块化设计 | `frontend/architecture/modular-design.md` | ✅ |
| TypeScript配置 | `frontend/architecture/typescript-config.md` | ✅ |
| 类型系统 | `frontend/architecture/type-system.md` | ✅ |
| Vite构建配置 | `frontend/architecture/vite-config.md` | ✅ |

### 2.3 路由系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 路由总览 | `frontend/router/overview.md` | ✅ |
| 路由配置与守卫 | `frontend/router/config-guards.md` | ✅ |
| 权限与动态路由 | `frontend/router/permission-dynamic.md` | ✅ |

### 2.4 状态管理

| 文档 | 路径 | 状态 |
|------|------|------|
| 状态管理概览 | `frontend/stores/overview.md` | ✅ |
| 用户状态 | `frontend/stores/user-store.md` | ✅ |
| 权限状态 | `frontend/stores/permission-store.md` | ✅ |
| 字典状态 | `frontend/stores/dict-store.md` | ✅ |
| 通知状态 | `frontend/stores/notice-store.md` | ✅ |

### 2.5 布局系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 布局概述 | `frontend/layout/layout-overview.md` | ✅ |
| 主布局 | `frontend/layout/main-layout.md` | ✅ |
| 侧边栏 | `frontend/layout/sidebar.md` | ✅ |
| 顶部导航 | `frontend/layout/navbar.md` | ✅ |
| 标签视图 | `frontend/layout/tags-view.md` | ✅ |
| 主内容区 | `frontend/layout/app-main.md` | ✅ |
| 设置面板 | `frontend/layout/settings.md` | ✅ |
| 前台布局 | `frontend/layout/home-layout.md` | ✅ |

### 2.6 组件系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 组件概览 | `frontend/components/overview.md` | ✅ |
| 图标系统 | `frontend/components/basic/icon-system.md` | ✅ |
| Icon 图标 | `frontend/components/basic/icon.md` | ✅ |
| DictTag 字典标签 | `frontend/components/basic/dict-tag.md` | ✅ |
| 表单组件概览 | `frontend/components/form/overview.md` | ✅ |
| AForm 表单容器 | `frontend/components/form/form.md` | ✅ |
| AFormCascader 级联选择 | `frontend/components/form/cascader.md` | ✅ |
| AFormCheckbox 复选框 | `frontend/components/form/checkbox.md` | ✅ |
| AFormDate 日期选择 | `frontend/components/form/date.md` | ✅ |
| AFormEditor 富文本编辑 | `frontend/components/form/editor.md` | ✅ |
| AFormFileUpload 文件上传 | `frontend/components/form/file-upload.md` | ✅ |
| AFormImgUpload 图片上传 | `frontend/components/form/img-upload.md` | ✅ |
| AFormInput 输入框 | `frontend/components/form/input.md` | ✅ |
| AFormRadio 单选框 | `frontend/components/form/radio.md` | ✅ |
| AFormSelect 选择器 | `frontend/components/form/select.md` | ✅ |
| AFormSwitch 开关 | `frontend/components/form/switch.md` | ✅ |
| AFormTreeSelect 树选择 | `frontend/components/form/tree-select.md` | ✅ |
| IconSelect 图标选择器 | `frontend/components/form/icon-select.md` | ✅ |
| ADataCard 数据卡片 | `frontend/components/display/data-card.md` | ✅ |
| ADetailDialog 详情对话框 | `frontend/components/display/detail-dialog.md` | ✅ |
| TableToolbar 表格工具栏 | `frontend/components/display/table-toolbar.md` | ✅ |
| Pagination 分页 | `frontend/components/display/pagination.md` | ✅ |
| ASearchForm 搜索表单 | `frontend/components/feedback/search-form.md` | ✅ |
| ASelectionTags 选择标签 | `frontend/components/feedback/selection-tags.md` | ✅ |
| 业务组件概览 | `frontend/components/business/overview.md` | ✅ |
| AOssMediaManager 媒体库 | `frontend/components/business/oss-media-manager.md` | ✅ |
| ARecharge 充值组件 | `frontend/components/business/recharge.md` | ✅ |
| AImportExcel Excel导入 | `frontend/components/business/import-excel.md` | ✅ |
| UserSelect 用户选择 | `frontend/components/business/user-select.md` | ✅ |
| AGeometricBackground 几何装饰背景 | `frontend/components/layout/page-background.md` | ✅ |
| IFrameContainer iframe容器 | `frontend/components/layout/i-frame-container.md` | ✅ |

### 2.7 组合式函数

| 文档 | 路径 | 状态 |
|------|------|------|
| 组合式函数概览 | `frontend/composables/overview.md` | ✅ |
| useAuth 认证管理 | `frontend/composables/use-auth.md` | ✅ |
| useDict 字典管理 | `frontend/composables/use-dict.md` | ✅ |
| useHttp 请求管理 | `frontend/composables/use-http.md` | ✅ |
| useToken 令牌管理 | `frontend/composables/use-token.md` | ✅ |
| useI18n 国际化 | `frontend/composables/use-i18n.md` | ✅ |
| useLayout 布局管理 | `frontend/composables/use-layout.md` | ✅ |
| useAnimation 动画效果 | `frontend/composables/use-animation.md` | ✅ |
| useDialog 对话框 | `frontend/composables/use-dialog.md` | ✅ |
| useTheme 主题管理 | `frontend/composables/use-theme.md` | ✅ |
| useResponsiveSpan 响应式 | `frontend/composables/use-responsive-span.md` | ✅ |
| useTableHeight 表格高度 | `frontend/composables/use-table-height.md` | ✅ |
| useSelection 选择管理 | `frontend/composables/use-selection.md` | ✅ |
| useDownload 下载管理 | `frontend/composables/use-download.md` | ✅ |
| usePrint 打印功能 | `frontend/composables/use-print.md` | ✅ |
| useSSE 服务端事件 | `frontend/composables/use-sse.md` | ✅ |
| useWS WebSocket通信 | `frontend/composables/use-websocket.md` | ✅ |

### 2.8 工具库

| 文档 | 路径 | 状态 |
|------|------|------|
| 工具函数概览 | `frontend/utils/utils-overview.md` | ✅ |
| 字符串工具 | `frontend/utils/string.md` | ✅ |
| 对象工具 | `frontend/utils/object.md` | ✅ |
| 日期工具 | `frontend/utils/date.md` | ✅ |
| 格式化工具 | `frontend/utils/format.md` | ✅ |
| 函数工具 | `frontend/utils/function.md` | ✅ |
| 验证器 | `frontend/utils/validators.md` | ✅ |
| 布尔值工具 | `frontend/utils/boolean.md` | ✅ |
| 加密工具 | `frontend/utils/crypto.md` | ✅ |
| RSA加密 | `frontend/utils/rsa.md` | ✅ |
| 缓存工具 | `frontend/utils/cache.md` | ✅ |
| DOM类操作 | `frontend/utils/class.md` | ✅ |
| 滚动工具 | `frontend/utils/scroll.md` | ✅ |
| 树形工具 | `frontend/utils/tree.md` | ✅ |
| 模态框工具 | `frontend/utils/modal.md` | ✅ |
| 标签页工具 | `frontend/utils/tab.md` | ✅ |
| To工具类 | `frontend/utils/to.md` | ✅ |

### 2.9 指令系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 权限指令 | `frontend/directives/permission.md` | ✅ |

### 2.10 样式系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 样式架构 | `frontend/styles/style-architecture.md` | ✅ |
| UnoCSS配置 | `frontend/styles/unocss-config.md` | ✅ |
| 工具类使用 | `frontend/styles/utility-classes.md` | ✅ |
| 全局样式 | `frontend/styles/global-styles.md` | ✅ |
| 主题系统 | `frontend/styles/theme-system.md` | ✅ |
| 组件样式 | `frontend/styles/component-styles.md` | ✅ |
| 动画系统 | `frontend/styles/animations.md` | ✅ |
| 响应式设计 | `frontend/styles/responsive.md` | ✅ |
| 最佳实践 | `frontend/styles/best-practices.md` | ✅ |

### 2.11 图标系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 图标系统概述 | `frontend/icons/overview.md` | ✅ |
| Iconify配置 | `frontend/icons/iconify-config.md` | ✅ |
| Iconfont配置 | `frontend/icons/iconfont-config.md` | ✅ |
| 图标类型生成 | `frontend/icons/type-generation.md` | ✅ |
| 图标组件使用 | `frontend/icons/component-usage.md` | ✅ |
| 图标预设管理 | `frontend/icons/preset-management.md` | ✅ |
| 图标最佳实践 | `frontend/icons/best-practices.md` | ✅ |

### 2.12 类型定义

| 文档 | 路径 | 状态 |
|------|------|------|
| 类型系统概览 | `frontend/types/overview.md` | ✅ |
| API类型 | `frontend/types/api-types.md` | ✅ |
| 全局类型 | `frontend/types/global-types.md` | ✅ |
| 组件类型 | `frontend/types/component-types.md` | ✅ |
| 路由类型 | `frontend/types/router-types.md` | ✅ |
| 状态类型 | `frontend/types/store-types.md` | ✅ |
| 工具类型 | `frontend/types/utility-types.md` | ✅ |
| 枚举类型 | `frontend/types/enums.md` | ✅ |
| 类型扩展 | `frontend/types/type-extensions.md` | ✅ |

### 2.13 开发工具

| 文档 | 路径 | 状态 |
|------|------|------|
| Prettier配置 | `frontend/dev/prettier-config.md` | ✅ |
| 调试技巧 | `frontend/dev/debugging.md` | ✅ |
| 性能分析 | `frontend/dev/performance.md` | ✅ |
| 单元测试 | `frontend/dev/testing.md` | ✅ |
| 开发最佳实践 | `frontend/dev/best-practices.md` | ✅ |
| 自定义组件开发 | `frontend/dev/custom-component.md` | ✅ |

### 2.14 低代码工具

| 文档 | 路径 | 状态 |
|------|------|------|
| 页面设计器 | `frontend/tools/page-designer.md` | ✅ |

### 2.15 国际化

| 文档 | 路径 | 状态 |
|------|------|------|
| 国际化配置 | `frontend/i18n/i18n-config.md` | ✅ |
| 语言包管理 | `frontend/i18n/language-packs.md` | ✅ |
| 组件国际化 | `frontend/i18n/component-i18n.md` | ✅ |
| 国际化最佳实践 | `frontend/i18n/i18n-practices.md` | ✅ |

---

## 三、移动端文档 (`/mobile/`)

### 3.1 快速开始

| 文档 | 路径 | 状态 |
|------|------|------|
| 项目简介 | `mobile/index.md` | ✅ |
| 快速启动 | `mobile/getting-started.md` | ✅ |
| 项目结构 | `mobile/project-structure.md` | ✅ |
| 配置文件 | `mobile/configuration.md` | ✅ |
| 开发规范 | `mobile/dev-standards.md` | ✅ |

### 3.2 UniApp基础

| 文档 | 路径 | 状态 |
|------|------|------|
| UniApp概览 | `mobile/uniapp/overview.md` | ✅ |
| 项目配置 (manifest.json) | `mobile/uniapp/manifest-config.md` | ✅ |
| 页面配置 (pages.json) | `mobile/uniapp/pages-config.md` | ✅ |
| 应用配置 (uni.scss) | `mobile/uniapp/app-config.md` | ✅ |
| 生命周期 | `mobile/uniapp/lifecycle.md` | ✅ |
| 路由导航 | `mobile/uniapp/navigation.md` | ✅ |
| 条件编译 | `mobile/uniapp/conditional.md` | ✅ |
| HBuilderX使用 | `mobile/uniapp/hbuilderx.md` | ✅ |

### 3.3 WD UI 组件库

#### 组件库概览

| 文档 | 路径 | 状态 |
|------|------|------|
| 组件库概览 | `mobile/wd/overview.md` | ✅ |
| 主题定制 | `mobile/styles/theme.md` | ✅ |
| 快速开始 | `mobile/wd/getting-started.md` | ✅ |

#### 基础组件 (6个)

| 文档 | 路径 | 状态 |
|------|------|------|
| Button 按钮 | `mobile/wd/basic/button.md` | ✅ |
| Icon 图标 | `mobile/wd/basic/icon.md` | ✅ |
| Text 文本 | `mobile/wd/basic/text.md` | ✅ |
| Transition 动画 | `mobile/wd/basic/transition.md` | ✅ |
| Resize 监听元素尺寸 | `mobile/wd/basic/resize.md` | ✅ |
| ConfigProvider 配置 | `mobile/wd/basic/config-provider.md` | ✅ |

#### 布局组件 (5个)

| 文档 | 路径 | 状态 |
|------|------|------|
| Row-Col 行列布局 | `mobile/wd/layout/row-col.md` | ✅ |
| Grid 宫格 | `mobile/wd/layout/grid.md` | ✅ |
| Gap 间隙槽 | `mobile/wd/layout/gap.md` | ✅ |
| Divider 分割线 | `mobile/wd/layout/divider.md` | ✅ |
| Sticky 吸顶布局 | `mobile/wd/layout/sticky.md` | ✅ |

#### 导航组件 (10个)

| 文档 | 路径 | 状态 |
|------|------|------|
| Navbar 导航栏 | `mobile/wd/navigation/navbar.md` | ✅ |
| Tabbar 标签栏 | `mobile/wd/navigation/tabbar.md` | ✅ |
| Tabs 标签页 | `mobile/wd/navigation/tabs.md` | ✅ |
| Segmented 分段器 | `mobile/wd/navigation/segmented.md` | ✅ |
| Sidebar 侧边栏 | `mobile/wd/navigation/sidebar.md` | ✅ |
| IndexBar 索引栏 | `mobile/wd/navigation/index-bar.md` | ✅ |
| Pagination 分页 | `mobile/wd/navigation/pagination.md` | ✅ |
| Paging 分页加载 | `mobile/wd/navigation/paging.md` | ✅ |
| Backtop 回到顶部 | `mobile/wd/navigation/backtop.md` | ✅ |
| Fab 悬浮按钮 | `mobile/wd/navigation/fab.md` | ✅ |

#### 表单组件 (24个)

| 文档 | 路径 | 状态 |
|------|------|------|
| Input 输入框 | `mobile/wd/form/input.md` | ✅ |
| Textarea 文本域 | `mobile/wd/form/textarea.md` | ✅ |
| InputNumber 计数器 | `mobile/wd/form/input-number.md` | ✅ |
| PasswordInput 密码 | `mobile/wd/form/password-input.md` | ✅ |
| Search 搜索 | `mobile/wd/form/search.md` | ✅ |
| Checkbox 复选框 | `mobile/wd/form/checkbox.md` | ✅ |
| CheckboxGroup 复选框组 | `mobile/wd/form/checkbox-group.md` | ✅ |
| Radio 单选框 | `mobile/wd/form/radio.md` | ✅ |
| RadioGroup 单选框组 | `mobile/wd/form/radio-group.md` | ✅ |
| Switch 开关 | `mobile/wd/form/switch.md` | ✅ |
| Rate 评分 | `mobile/wd/form/rate.md` | ✅ |
| Slider 滑块 | `mobile/wd/form/slider.md` | ✅ |
| Picker 选择器 | `mobile/wd/form/picker.md` | ✅ |
| PickerView 选择器视图 | `mobile/wd/form/picker-view.md` | ✅ |
| ColPicker 多列选择器 | `mobile/wd/form/col-picker.md` | ✅ |
| SelectPicker 单复选 | `mobile/wd/form/select-picker.md` | ✅ |
| DatetimePicker 时间 | `mobile/wd/form/datetime-picker.md` | ✅ |
| DatetimePickerView | `mobile/wd/form/datetime-picker-view.md` | ✅ |
| Calendar 日历 | `mobile/wd/form/calendar.md` | ✅ |
| CalendarView 日历板 | `mobile/wd/form/calendar-view.md` | ✅ |
| Upload 上传 | `mobile/wd/form/upload.md` | ✅ |
| Form 表单 | `mobile/wd/form/form.md` | ✅ |
| FormItem 表单项 | `mobile/wd/form/form-item.md` | ✅ |
| Signature 签名 | `mobile/wd/form/signature.md` | ✅ |
| Recorder 录音 | `mobile/wd/form/voice-recorder.md` | ✅ |
| Keyboard 虚拟键盘 | `mobile/wd/form/keyboard.md` | ✅ |
| NumberKeyboard 数字键盘 | `mobile/wd/form/number-keyboard.md` | ✅ |

#### 展示组件 (14个)

| 文档 | 路径 | 状态 |
|------|------|------|
| Cell 单元格 | `mobile/wd/display/cell.md` | ✅ |
| Badge 徽标 | `mobile/wd/display/badge.md` | ✅ |
| Tag 标签 | `mobile/wd/display/tag.md` | ✅ |
| Card 卡片 | `mobile/wd/display/card.md` | ✅ |
| Collapse 折叠面板 | `mobile/wd/display/collapse.md` | ✅ |
| Steps 步骤条 | `mobile/wd/display/steps.md` | ✅ |
| Table 表格 | `mobile/wd/display/table.md` | ✅ |
| Img 图片 | `mobile/wd/display/img.md` | ✅ |
| ImgCropper 图片裁剪 | `mobile/wd/display/img-cropper.md` | ✅ |
| Swiper 轮播图 | `mobile/wd/display/swiper.md` | ✅ |
| Skeleton 骨架屏 | `mobile/wd/display/skeleton.md` | ✅ |
| Curtain 幕帘 | `mobile/wd/display/curtain.md` | ✅ |
| Watermark 水印 | `mobile/wd/display/watermark.md` | ✅ |
| Progress 进度条 | `mobile/wd/display/progress.md` | ✅ |

#### 反馈组件 (19个)

| 文档 | 路径 | 状态 |
|------|------|------|
| ActionSheet 上拉菜单 | `mobile/wd/feedback/action-sheet.md` | ✅ |
| Popup 弹出层 | `mobile/wd/feedback/popup.md` | ✅ |
| Overlay 遮罩层 | `mobile/wd/feedback/overlay.md` | ✅ |
| MessageBox 弹框 | `mobile/wd/feedback/message-box.md` | ✅ |
| Toast 轻提示 | `mobile/wd/feedback/toast.md` | ✅ |
| Notify 消息通知 | `mobile/wd/feedback/notify.md` | ✅ |
| Loading 加载指示器 | `mobile/wd/feedback/loading.md` | ✅ |
| Circle 环形进度条 | `mobile/wd/feedback/circle.md` | ✅ |
| Loadmore 加载更多 | `mobile/wd/feedback/loadmore.md` | ✅ |
| StatusTip 缺省提示 | `mobile/wd/feedback/status-tip.md` | ✅ |
| Tooltip 文字提示 | `mobile/wd/feedback/tooltip.md` | ✅ |
| Popover 气泡 | `mobile/wd/feedback/popover.md` | ✅ |
| DropMenu 下拉菜单 | `mobile/wd/feedback/drop-menu.md` | ✅ |
| FloatingPanel 浮动面板 | `mobile/wd/feedback/floating-panel.md` | ✅ |
| SwipeAction 滑动操作 | `mobile/wd/feedback/swipe-action.md` | ✅ |
| SortButton 排序按钮 | `mobile/wd/feedback/sort-button.md` | ✅ |
| NoticeBar 通知栏 | `mobile/wd/feedback/notice-bar.md` | ✅ |
| CountDown 倒计时 | `mobile/wd/feedback/count-down.md` | ✅ |
| CountTo 数字滚动 | `mobile/wd/feedback/count-to.md` | ✅ |

### 3.4 组合式函数

| 文档 | 路径 | 状态 |
|------|------|------|
| 组合式函数概览 | `mobile/composables/overview.md` | ✅ |
| useAuth 认证管理 | `mobile/composables/use-auth.md` | ✅ |
| useDict 字典管理 | `mobile/composables/use-dict.md` | ✅ |
| useHttp 请求管理 | `mobile/composables/use-http.md` | ✅ |
| useToken 令牌管理 | `mobile/composables/use-token.md` | ✅ |
| useAppInit 应用初始化 | `mobile/composables/use-app-init.md` | ✅ |
| usePayment 支付处理 | `mobile/composables/use-payment.md` | ✅ |
| useShare 分享功能 | `mobile/composables/use-share.md` | ✅ |
| useScroll 滚动处理 | `mobile/composables/use-scroll.md` | ✅ |
| useEventBus 事件总线 | `mobile/composables/use-event-bus.md` | ✅ |
| useWebSocket 实时通信 | `mobile/composables/use-websocket.md` | ✅ |
| useTheme 主题管理 | `mobile/composables/use-theme.md` | ✅ |
| useI18n 国际化 | `mobile/composables/use-i18n.md` | ✅ |
| 自定义Hook开发 | `mobile/composables/custom-hooks.md` | ✅ |

### 3.5 工具库

| 文档 | 路径 | 状态 |
|------|------|------|
| 工具函数概览 | `mobile/utils/overview.md` | ✅ |
| string 字符串工具 | `mobile/utils/string.md` | ✅ |
| boolean 布尔值工具 | `mobile/utils/boolean.md` | ✅ |
| function 函数工具 | `mobile/utils/function.md` | ✅ |
| date 日期工具 | `mobile/utils/date.md` | ✅ |
| validators 验证工具 | `mobile/utils/validators.md` | ✅ |
| cache 缓存工具 | `mobile/utils/cache.md` | ✅ |
| route 路由工具 | `mobile/utils/route.md` | ✅ |
| platform 平台工具 | `mobile/utils/platform.md` | ✅ |
| tenant 租户工具 | `mobile/utils/tenant.md` | ✅ |
| crypto 加密工具 | `mobile/utils/crypto.md` | ✅ |
| rsa RSA加密 | `mobile/utils/rsa.md` | ✅ |
| to 异步处理 | `mobile/utils/to.md` | ✅ |
| logger 日志系统 | `mobile/utils/logger.md` | ✅ |

### 3.6 状态管理

| 文档 | 路径 | 状态 |
|------|------|------|
| 状态管理概览 | `mobile/stores/overview.md` | ✅ |
| 用户状态 | `mobile/stores/user.md` | ✅ |
| 字典状态 | `mobile/stores/dict.md` | ✅ |
| 标签栏状态 | `mobile/stores/tabbar.md` | ✅ |
| 功能开关 | `mobile/stores/feature.md` | ✅ |

### 3.7 页面开发

| 文档 | 路径 | 状态 |
|------|------|------|
| 页面概述 | `mobile/pages/index.md` | ✅ |
| 登录页面 | `mobile/pages/login.md` | ✅ |
| 分包页面管理 | `mobile/pages/subpackages.md` | ✅ |

### 3.8 布局系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 布局概述 | `mobile/layouts/overview.md` | ✅ |
| 默认布局 | `mobile/layouts/default.md` | ✅ |
| 导航栏配置 | `mobile/layouts/navbar.md` | ✅ |
| 标签栏配置 | `mobile/layouts/tabbar.md` | ✅ |
| 胶囊组件 | `mobile/layouts/capsule.md` | ✅ |

### 3.9 样式系统

| 文档 | 路径 | 状态 |
|------|------|------|
| 样式概览 | `mobile/styles/overview.md` | ✅ |
| 样式架构设计 | `mobile/styles/architecture.md` | ✅ |
| UnoCSS配置 | `mobile/styles/unocss.md` | ✅ |
| 全局样式 | `mobile/styles/global.md` | ✅ |
| rpx单位使用 | `mobile/styles/rpx-units.md` | ✅ |
| 主题定制 | `mobile/styles/theme.md` | ✅ |
| 响应式设计 | `mobile/styles/responsive.md` | ✅ |
| 组件样式 | `mobile/styles/components.md` | ✅ |
| 样式最佳实践 | `mobile/styles/best-practices.md` | ✅ |

### 3.10 组件开发

| 文档 | 路径 | 状态 |
|------|------|------|
| 自定义组件开发 | `mobile/components/custom-development.md` | ✅ |
| 组件封装规范 | `mobile/components/encapsulation-standards.md` | ✅ |
| 组件通信模式 | `mobile/components/communication-patterns.md` | ✅ |
| 组件生命周期 | `mobile/components/lifecycle.md` | ✅ |
| 组件测试 | `mobile/components/testing.md` | ✅ |

### 3.11 平台适配

| 文档 | 路径 | 状态 |
|------|------|------|
| 平台差异说明 | `mobile/platform/differences.md` | ✅ |
| H5端适配 | `mobile/platform/h5.md` | ✅ |
| 微信小程序适配 | `mobile/platform/wechat.md` | ✅ |
| 支付宝小程序适配 | `mobile/platform/alipay.md` | ✅ |

### 3.12 性能优化

| 文档 | 路径 | 状态 |
|------|------|------|
| 性能优化概览 | `mobile/performance/overview.md` | ✅ |
| 启动性能优化 | `mobile/performance/startup.md` | ✅ |
| 渲染性能优化 | `mobile/performance/rendering.md` | ✅ |
| 包体积优化 | `mobile/performance/bundle-size.md` | ✅ |
| 图片优化 | `mobile/performance/image.md` | ✅ |
| 分包加载优化 | `mobile/performance/subpackage.md` | ✅ |

### 3.13 打包发布

| 文档 | 路径 | 状态 |
|------|------|------|
| 打包配置概览 | `mobile/build/overview.md` | ✅ |
| 环境配置 | `mobile/build/environment.md` | ✅ |
| H5打包发布 | `mobile/build/h5-deploy.md` | ✅ |
| 微信小程序发布 | `mobile/build/wechat-deploy.md` | ✅ |

### 3.14 原生插件

| 文档 | 路径 | 状态 |
|------|------|------|
| 插件概览 | `mobile/plugins/overview.md` | ✅ |
| 支付插件 | `mobile/plugins/payment.md` | ✅ |
| 分享插件 | `mobile/plugins/share.md` | ✅ |
| 推送通知 | `mobile/plugins/push.md` | ✅ |
| 相机插件 | `mobile/plugins/camera.md` | ✅ |
| 地图插件 | `mobile/plugins/map.md` | ✅ |
| 权限管理 | `mobile/plugins/permission.md` | ✅ |
| 网络请求 | `mobile/plugins/request.md` | ✅ |
| 数据统计 | `mobile/plugins/analytics.md` | ✅ |
| 自定义开发 | `mobile/plugins/custom-dev.md` | ✅ |

### 3.15 Vite 插件

| 文档 | 路径 | 状态 |
|------|------|------|
| 插件概览 | `mobile/vite-plugins/overview.md` | ✅ |
| UnoCSS 样式 | `mobile/vite-plugins/style/unocss.md` | ✅ |
| 自动导入 | `mobile/vite-plugins/auto/auto-import.md` | ✅ |
| 组件注册 | `mobile/vite-plugins/auto/components.md` | ✅ |
| 包体积优化 | `mobile/vite-plugins/auto/bundle-optimizer.md` | ✅ |
| uni-app 主插件 | `mobile/vite-plugins/uni/vite-plugin-uni.md` | ✅ |
| 页面路由 | `mobile/vite-plugins/uni/uni-pages.md` | ✅ |
| 布局系统 | `mobile/vite-plugins/uni/uni-layouts.md` | ✅ |
| 组件注册 | `mobile/vite-plugins/uni/uni-components.md` | ✅ |
| 配置生成 | `mobile/vite-plugins/uni/uni-manifest.md` | ✅ |
| 平台适配 | `mobile/vite-plugins/uni/uni-platform.md` | ✅ |
| 静态资源类型 | `mobile/vite-plugins/custom/static-assets-types.md` | ✅ |
| 原生资源复制 | `mobile/vite-plugins/custom/copy-native-res.md` | ✅ |
| OpenAPI 生成 | `mobile/vite-plugins/custom/openapi.md` | ✅ |
| 开发热重载 | `mobile/vite-plugins/dev/vite-restart.md` | ✅ |

---

## 四、最佳实践 (`/practices/`)

### 4.1 工程化

| 文档 | 路径 | 状态 |
|------|------|------|
| Skills 技能系统 | `practices/engineering/claude-code-skills.md` | ✅ |
| Commands 自定义命令 | `practices/engineering/claude-code-commands.md` | ✅ |
| Hooks 钩子机制 | `practices/engineering/claude-code-hooks.md` | ✅ |
| MCP 服务器配置 | `practices/engineering/claude-code-mcp.md` | ✅ |
| Sub-Agents 子代理 | `practices/engineering/claude-code-agents.md` | ✅ |
| 代码生成器使用 | `practices/engineering/code-generator.md` | ✅ |

### 4.2 开发规范

| 文档 | 路径 | 状态 |
|------|------|------|
| 开发规范概览 | `practices/standards/overview.md` | ✅ |
| 代码规范 | `practices/standards/coding.md` | ✅ |
| API设计规范 | `practices/standards/api-design.md` | ✅ |
| 命名规范 | `practices/standards/naming.md` | ✅ |
| 注释规范 | `practices/standards/comment.md` | ✅ |
| Git使用规范 | `practices/standards/git.md` | ✅ |
| 数据库规范 | `practices/standards/database.md` | ✅ |
| 前端开发规范 | `practices/standards/frontend.md` | ✅ |
| 移动端开发规范 | `practices/standards/mobile.md` | ✅ |

### 4.3 架构设计

| 文档 | 路径 | 状态 |
|------|------|------|
| 系统架构设计 | `practices/architecture/system.md` | ✅ |
| 数据库设计 | `practices/architecture/database.md` | ✅ |
| 缓存策略 | `practices/architecture/cache.md` | ✅ |
| 分布式设计 | `practices/architecture/distributed.md` | ✅ |
| 多租户架构 | `practices/architecture/multi-tenant.md` | ✅ |

### 4.4 后端开发

| 文档 | 路径 | 状态 |
|------|------|------|
| 后端开发概览 | `practices/backend/overview.md` | ✅ |
| Service层最佳实践 | `practices/backend/service-layer.md` | ✅ |
| Controller层最佳实践 | `practices/backend/controller-layer.md` | ✅ |
| DAO层设计模式 | `practices/backend/dao-layer.md` | ✅ |
| 数据访问层优化 | `practices/backend/data-access.md` | ✅ |
| 事务管理策略 | `practices/backend/transaction.md` | ✅ |
| 异常处理机制 | `practices/backend/exception-handling.md` | ✅ |
| 数据校验最佳实践 | `practices/backend/validation.md` | ✅ |

### 4.5 功能开发

| 文档 | 路径 | 状态 |
|------|------|------|
| 权限控制实现 | `practices/features/permission-control.md` | ✅ |
| 数据权限设计 | `practices/features/data-permission.md` | ✅ |
| 定时任务开发 | `practices/features/scheduled-jobs.md` | ✅ |
| 消息推送实现 | `practices/features/message-push.md` | ✅ |
| 文件处理方案 | `practices/features/file-processing.md` | ✅ |
| Excel操作优化 | `practices/features/excel-operations.md` | ✅ |
| 第三方集成策略 | `practices/features/third-party-integration.md` | ✅ |
| 国际化实现方案 | `practices/features/i18n.md` | ✅ |

### 4.6 安全指南

| 文档 | 路径 | 状态 |
|------|------|------|
| 安全总览 | `practices/security/overview.md` | ✅ |
| 认证与授权 | `practices/security/auth.md` | ✅ |
| 数据安全 | `practices/security/data.md` | ✅ |
| API安全 | `practices/security/api.md` | ✅ |
| 客户端安全 | `practices/security/client.md` | ✅ |
| 安全审计 | `practices/security/audit.md` | ✅ |

### 4.7 部署运维

| 文档 | 路径 | 状态 |
|------|------|------|
| Docker部署指南 | `practices/devops/docker-deploy.md` | ✅ |

---

## 五、首页与其他

| 文档 | 路径 | 状态 |
|------|------|------|
| 文档首页 | `index.md` | ✅ |
| 更新日志 | `changelog.md` | ✅ |
| 演示示例 | `demo.md` | ✅ |
| 视频教程 | `video.md` | ✅ |

---

## 复查指南

### 使用方法

复查时按照上述清单逐一检查，确保:
- 文档内容与源码实现一致
- 代码示例可以正常运行
- API 文档完整准确
- 没有过时信息

### 复查优先级

1. 🔴 核心组件文档 - WD UI 组件库
2. 🟡 业务模块文档 - 后端/前端业务相关
3. 🟢 工具类文档 - Utils/Composables

---

## 更新日志

| 日期 | 里程碑 |
|------|--------|
| 2025-12-29 | 📊 全面更新进度清单，实际统计 497 篇文档 |
| 2025-12-29 | 🎉 项目 100% 完成，精简合并进度文件 |
| 2025-12-29 | 移动端文档 100% 完成 (logger.md) |
| 2025-12-18 | 初始创建文档清单 |

---

> **注**: 按 `config.ts` 导航顺序整理，用于复查和维护
