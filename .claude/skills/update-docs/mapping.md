# 源码目录 → 文档目录映射规则

## 映射表

### 后端模块 (backend)

| 源码路径模式 | 文档目录 | 说明 |
|-------------|---------|------|
| `ruoyi-admin/**` | `docs/backend/guide/` | 后端启动入口、配置 |
| `ruoyi-common/ruoyi-common-core/**` | `docs/backend/core/` | 核心工具类 |
| `ruoyi-common/ruoyi-common-doc/**` | `docs/backend/core/` | 接口文档配置 |
| `ruoyi-common/ruoyi-common-encrypt/**` | `docs/backend/core/` | 数据加密 |
| `ruoyi-common/ruoyi-common-excel/**` | `docs/backend/core/` | Excel处理 |
| `ruoyi-common/ruoyi-common-http/**` | `docs/backend/core/` | HTTP客户端 |
| `ruoyi-common/ruoyi-common-idempotent/**` | `docs/backend/core/` | 幂等性 |
| `ruoyi-common/ruoyi-common-job/**` | `docs/backend/core/` | 定时任务 |
| `ruoyi-common/ruoyi-common-json/**` | `docs/backend/core/` | JSON序列化 |
| `ruoyi-common/ruoyi-common-langchain4j/**` | `docs/backend/core/` | AI大模型 |
| `ruoyi-common/ruoyi-common-log/**` | `docs/backend/core/` | 日志处理 |
| `ruoyi-common/ruoyi-common-mail/**` | `docs/backend/core/` | 邮件发送 |
| `ruoyi-common/ruoyi-common-media/**` | `docs/backend/core/` | 媒体处理 |
| `ruoyi-common/ruoyi-common-miniapp/**` | `docs/backend/core/` | 微信小程序 |
| `ruoyi-common/ruoyi-common-mp/**` | `docs/backend/core/` | 微信公众号 |
| `ruoyi-common/ruoyi-common-mybatis/**` | `docs/backend/core/` | MyBatis-Plus |
| `ruoyi-common/ruoyi-common-oss/**` | `docs/backend/core/` | 对象存储 |
| `ruoyi-common/ruoyi-common-pay/**` | `docs/backend/core/` | 支付模块 |
| `ruoyi-common/ruoyi-common-ratelimiter/**` | `docs/backend/core/` | 限流 |
| `ruoyi-common/ruoyi-common-redis/**` | `docs/backend/core/` | Redis缓存 |
| `ruoyi-common/ruoyi-common-rocketmq/**` | `docs/backend/core/` | 消息队列 |
| `ruoyi-common/ruoyi-common-satoken/**` | `docs/backend/core/` | 认证配置 |
| `ruoyi-common/ruoyi-common-security/**` | `docs/backend/core/` | 安全模块 |
| `ruoyi-common/ruoyi-common-sensitive/**` | `docs/backend/core/` | 数据脱敏 |
| `ruoyi-common/ruoyi-common-sms/**` | `docs/backend/core/` | 短信模块 |
| `ruoyi-common/ruoyi-common-social/**` | `docs/backend/core/` | 社交登录 |
| `ruoyi-common/ruoyi-common-sse/**` | `docs/backend/core/` | SSE推送 |
| `ruoyi-common/ruoyi-common-tenant/**` | `docs/backend/core/` | 多租户 |
| `ruoyi-common/ruoyi-common-web/**` | `docs/backend/core/` | Web配置 |
| `ruoyi-common/ruoyi-common-websocket/**` | `docs/backend/core/` | WebSocket |
| `ruoyi-modules/ruoyi-system/**` | `docs/backend/modules/` | 系统管理 |
| `ruoyi-modules/ruoyi-generator/**` | `docs/backend/modules/` | 代码生成 |
| `ruoyi-modules/ruoyi-workflow/**` | `docs/backend/modules/` | 工作流 |
| `ruoyi-modules/ruoyi-business/**` | `docs/backend/modules/` | 业务扩展 |
| `ruoyi-modules/ruoyi-mall/**` | `docs/backend/modules/` | 商城模块 |
| `ruoyi-extend/ruoyi-monitor-admin/**` | `docs/backend/extend/` | 监控管理 |
| `ruoyi-extend/ruoyi-snailjob-server/**` | `docs/backend/extend/` | 任务调度 |
| `pom.xml` | `docs/backend/guide/` | Maven依赖版本变更 |
| `*/pom.xml` | 对应模块文档 | 子模块依赖变更 |

### 前端模块 (frontend)

| 源码路径模式 | 文档目录 | 说明 |
|-------------|---------|------|
| `plus-ui/src/components/**` | `docs/frontend/components/` | 前端组件 |
| `plus-ui/src/views/**` | `docs/frontend/` | 页面视图 |
| `plus-ui/src/router/**` | `docs/frontend/` | 路由配置 |
| `plus-ui/src/stores/**` | `docs/frontend/` | 状态管理 |
| `plus-ui/src/utils/**` | `docs/frontend/utils/` | 工具函数 |
| `plus-ui/src/composables/**` | `docs/frontend/` | 组合式函数 |
| `plus-ui/src/styles/**` | `docs/frontend/styles/` | 样式主题 |
| `plus-ui/src/layouts/**` | `docs/frontend/` | 布局组件 |
| `plus-ui/src/api/**` | `docs/frontend/` | API接口层 |
| `plus-ui/src/plugins/**` | `docs/frontend/` | 插件配置 |
| `plus-ui/package.json` | `docs/frontend/guide/` | 前端依赖变更 |
| `plus-ui/vite.config.*` | `docs/frontend/guide/` | 构建配置 |

### 移动端模块 (mobile)

| 源码路径模式 | 文档目录 | 说明 |
|-------------|---------|------|
| `plus-uniapp/src/pages/**` | `docs/mobile/uniapp/` | UniApp页面 |
| `plus-uniapp/src/composables/**` | `docs/mobile/uniapp/` | 组合式函数 |
| `plus-uniapp/src/stores/**` | `docs/mobile/uniapp/` | 状态管理 |
| `plus-uniapp/src/utils/**` | `docs/mobile/uniapp/` | 工具函数 |
| `plus-uniapp/src/api/**` | `docs/mobile/uniapp/` | API接口层 |
| `plus-uniapp/src/wd/**` | `docs/mobile/wd/` | WD UI组件库 |
| `plus-uniapp/pages.json` | `docs/mobile/uniapp/` | 页面路由配置 |
| `plus-uniapp/manifest.json` | `docs/mobile/uniapp/` | 应用配置 |
| `plus-uniapp/package.json` | `docs/mobile/uniapp/` | 移动端依赖变更 |
| `plus-app/src/**` | `docs/mobile/` | App应用端 |
| `plus-app/package.json` | `docs/mobile/` | App依赖变更 |

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
