# 源码目录 → 文档目录映射规则

## 映射表

### 后端模块 (backend)

| 源码路径模式 | 文档目录 | 说明 |
|-------------|---------|------|
| `ruoyi-admin/**` | `src/content/docs/backend/ruoyi-admin/` | 后端启动入口、配置 |
| `ruoyi-common/ruoyi-common-core/**` | `src/content/docs/backend/core/` | 核心工具类 |
| `ruoyi-common/ruoyi-common-doc/**` | `src/content/docs/backend/core/` | 接口文档配置 |
| `ruoyi-common/ruoyi-common-encrypt/**` | `src/content/docs/backend/core/` | 数据加密 |
| `ruoyi-common/ruoyi-common-excel/**` | `src/content/docs/backend/core/` | Excel处理 |
| `ruoyi-common/ruoyi-common-http/**` | `src/content/docs/backend/core/` | HTTP客户端 |
| `ruoyi-common/ruoyi-common-idempotent/**` | `src/content/docs/backend/core/` | 幂等性 |
| `ruoyi-common/ruoyi-common-job/**` | `src/content/docs/backend/core/` | 定时任务 |
| `ruoyi-common/ruoyi-common-json/**` | `src/content/docs/backend/core/` | JSON序列化 |
| `ruoyi-common/ruoyi-common-langchain4j/**` | `src/content/docs/backend/core/` | AI大模型 |
| `ruoyi-common/ruoyi-common-log/**` | `src/content/docs/backend/core/` | 日志处理 |
| `ruoyi-common/ruoyi-common-mail/**` | `src/content/docs/backend/core/` | 邮件发送 |
| `ruoyi-common/ruoyi-common-media/**` | `src/content/docs/backend/core/` | 媒体处理 |
| `ruoyi-common/ruoyi-common-miniapp/**` | `src/content/docs/backend/core/` | 微信小程序 |
| `ruoyi-common/ruoyi-common-mp/**` | `src/content/docs/backend/core/` | 微信公众号 |
| `ruoyi-common/ruoyi-common-mybatis/**` | `src/content/docs/backend/core/` | MyBatis-Plus |
| `ruoyi-common/ruoyi-common-oss/**` | `src/content/docs/backend/core/` | 对象存储 |
| `ruoyi-common/ruoyi-common-pay/**` | `src/content/docs/backend/core/` | 支付模块 |
| `ruoyi-common/ruoyi-common-ratelimiter/**` | `src/content/docs/backend/core/` | 限流 |
| `ruoyi-common/ruoyi-common-redis/**` | `src/content/docs/backend/core/` | Redis缓存 |
| `ruoyi-common/ruoyi-common-rocketmq/**` | `src/content/docs/backend/core/` | 消息队列 |
| `ruoyi-common/ruoyi-common-satoken/**` | `src/content/docs/backend/core/` | 认证配置 |
| `ruoyi-common/ruoyi-common-security/**` | `src/content/docs/backend/core/` | 安全模块 |
| `ruoyi-common/ruoyi-common-sensitive/**` | `src/content/docs/backend/core/` | 数据脱敏 |
| `ruoyi-common/ruoyi-common-sms/**` | `src/content/docs/backend/core/` | 短信模块 |
| `ruoyi-common/ruoyi-common-social/**` | `src/content/docs/backend/core/` | 社交登录 |
| `ruoyi-common/ruoyi-common-sse/**` | `src/content/docs/backend/core/` | SSE推送 |
| `ruoyi-common/ruoyi-common-tenant/**` | `src/content/docs/backend/core/` | 多租户 |
| `ruoyi-common/ruoyi-common-web/**` | `src/content/docs/backend/core/` | Web配置 |
| `ruoyi-common/ruoyi-common-websocket/**` | `src/content/docs/backend/core/` | WebSocket |
| `ruoyi-modules/ruoyi-system/**` | `src/content/docs/backend/modules/` | 系统管理 |
| `ruoyi-modules/ruoyi-generator/**` | `src/content/docs/backend/modules/` | 代码生成 |
| `ruoyi-modules/ruoyi-workflow/**` | `src/content/docs/backend/modules/` | 工作流 |
| `ruoyi-modules/ruoyi-business/**` | `src/content/docs/backend/modules/` | 业务扩展 |
| `ruoyi-modules/ruoyi-mall/**` | `src/content/docs/backend/modules/` | 商城模块 |
| `ruoyi-extend/ruoyi-monitor-admin/**` | `src/content/docs/backend/extend/` | 监控管理 |
| `ruoyi-extend/ruoyi-snailjob-server/**` | `src/content/docs/backend/extend/` | 任务调度 |
| `pom.xml` | `src/content/docs/backend/getting-started.md`、`backend/project-structure.md` | Maven依赖版本变更 |
| `*/pom.xml` | 对应模块文档 | 子模块依赖变更 |

### 前端模块 (frontend)

| 源码路径模式 | 文档目录 | 说明 |
|-------------|---------|------|
| `plus-ui/src/components/**` | `src/content/docs/frontend/components/` | 前端组件 |
| `plus-ui/src/views/**` | `src/content/docs/frontend/` | 页面视图 |
| `plus-ui/src/router/**` | `src/content/docs/frontend/` | 路由配置 |
| `plus-ui/src/stores/**` | `src/content/docs/frontend/` | 状态管理 |
| `plus-ui/src/utils/**` | `src/content/docs/frontend/utils/` | 工具函数 |
| `plus-ui/src/composables/**` | `src/content/docs/frontend/` | 组合式函数 |
| `plus-ui/src/styles/**` | `src/content/docs/frontend/styles/` | 样式主题 |
| `plus-ui/src/layouts/**` | `src/content/docs/frontend/` | 布局组件 |
| `plus-ui/src/api/**` | `src/content/docs/frontend/` | API接口层 |
| `plus-ui/src/plugins/**` | `src/content/docs/frontend/` | 插件配置 |
| `plus-ui/package.json` | `src/content/docs/frontend/getting-started.md`、`frontend/project-structure.md` | 前端依赖变更 |
| `plus-ui/vite.config.*` | `src/content/docs/frontend/configuration.md` | 构建配置 |

### 移动端模块 (mobile)

| 源码路径模式 | 文档目录 | 说明 |
|-------------|---------|------|
| `plus-uniapp/src/pages/**` | `src/content/docs/mobile/uniapp/` | UniApp页面 |
| `plus-uniapp/src/composables/**` | `src/content/docs/mobile/uniapp/` | 组合式函数 |
| `plus-uniapp/src/stores/**` | `src/content/docs/mobile/uniapp/` | 状态管理 |
| `plus-uniapp/src/utils/**` | `src/content/docs/mobile/uniapp/` | 工具函数 |
| `plus-uniapp/src/api/**` | `src/content/docs/mobile/uniapp/` | API接口层 |
| `plus-uniapp/src/wd/**` | `src/content/docs/mobile/wd/` | WD UI组件库 |
| `plus-uniapp/pages.json` | `src/content/docs/mobile/uniapp/` | 页面路由配置 |
| `plus-uniapp/manifest.json` | `src/content/docs/mobile/uniapp/` | 应用配置 |
| `plus-uniapp/package.json` | `src/content/docs/mobile/uniapp/` | 移动端依赖变更 |
| `plus-app/src/**` | `src/content/docs/mobile/` | App应用端 |
| `plus-app/package.json` | `src/content/docs/mobile/` | App依赖变更 |

## 忽略规则

以下变更不触发文档更新：

| 文件模式 | 说明 |
|---------|------|
| `*.test.*` / `*.spec.*` | 测试文件 |
| `*.md` | 文档文件（源码项目内的） |
| `.github/**` | CI/CD配置 |
| `.claude/**` | Claude配置 |
| `.vscode/**` / `.idea/**` | IDE配置 |
| `*.lock` / `*-lock.*` | 锁文件 |
| `.gitignore` / `.editorconfig` | 项目配置文件 |
| `script/**` | 脚本文件 |
| `docker/**` / `Dockerfile` | Docker配置 |
| `*.sql` | SQL脚本（除非是结构性变更） |

## 重大更新判断规则

满足以下任一条件视为重大更新：

1. **新增模块**：`ruoyi-common/` 或 `ruoyi-modules/` 下新增子目录
2. **大版本升级**：根 `pom.xml` 或根 `package.json` 中核心依赖的主版本或次版本变更
3. **新增核心功能**：提交消息为 `feat` 类型且变更文件数 ≥ 10
4. **架构变更**：涉及多个模块的重构（`refactor` 类型且跨 3 个以上顶级目录）
5. **Breaking Change**：提交消息包含 `BREAKING CHANGE` 或 `!:` 标记
