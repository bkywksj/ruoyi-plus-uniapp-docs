# Claude Code 深度集成文档

## 介绍
Claude Code 在 ruoyi-plus-uniapp 中不是单点工具，而是一套贯穿开发、文档与协作的工程化体系。它通过 `CLAUDE.md` 与 `AGENTS.md` 双配置沉淀语言规范、架构约束与技能激活流程，并结合 `.claude/skills`、`.claude/commands`、`.claude/hooks` 形成可执行的工作流。开发者给出目标后，Claude Code 先做技能评估，再按命令流程执行扫描、设计、生成和同步，确保产出严格贴合 `plus.ruoyi` 架构与四层分层设计。本文档基于 workflow 项目真实文件整理，系统化说明技能体系、命令体系、钩子机制与实战方法，帮助团队在复杂业务下保持一致性与可追溯性。

## 写作进度跟踪
- [x] 介绍内容已完成，覆盖双配置与三大机制的整体定位
- [x] 核心特性已完成，包含技能规模、命令入口与钩子机制
- [x] 上下文工程已完成，说明 `CLAUDE.md` 与 `AGENTS.md` 协同方式
- [x] 技能系统已完成，包含 54 个技能的场景与示例
- [x] 命令系统已完成，按 13 个使用入口拆解
- [x] 钩子系统已完成，覆盖三类 JS 钩子的触发与输出
- [x] 最佳实践已完成，强调规范优先与流程闭环
- [x] 实战案例已完成，覆盖新功能、文档同步、工作流同步
- [x] 行数目标已完成，全文行数不少于 1000 行
- [x] 续写提示已保留，如需扩展可追加更多技能场景或案例

## 核心特性
- 技能体系：`.claude/skills` 目录现有 54 个技能目录，覆盖架构、后端、前端、移动端、APP原生、AI、协作、工程规范、部署运维、中间件集成与物联网
- 命令体系：`.claude/commands` 提供 13 个命令文件，`/init-docs` 内含两种模式，合计 14 个使用入口（不含 local 相关的上游同步命令，这些命令仅在源码项目中使用）
- 钩子体系：`.claude/hooks` 提供 3 个 JavaScript 钩子，分别负责技能强制评估、工具安全拦截与结束收尾
- 配置入口：`.claude/settings.json` 统一绑定 `UserPromptSubmit`、`PreToolUse`（5s超时）、`Stop`（10s超时）三类触发点
- 规则底座：`CLAUDE.md` 与 `AGENTS.md` 约束语言、架构、流程、命令与文档生成边界

## 上下文工程
### `CLAUDE.md` 的职责
- 统一中文输出要求，确保所有响应、解释与技术讨论为中文
- 约定术语映射：前端为 `plus-ui`，移动端为 `plus-uniapp`，后端为 `ruoyi-modules`
- 声明 MCP 工具触发条件，包含 `sequential-thinking`、`context7`、`chrome-devtools`
- 强调四层架构规范与核心约束：`plus.ruoyi` 包名、Service 不继承基类、DAO 构建查询
- 固化页面开发前的阅读要求，强调参考模块与封装组件使用方式

### `AGENTS.md` 的职责
- 再次强调本项目不是 ruoyi-vue-plus，禁止引用其架构和包名风格
- 给出强制技能评估流程说明，要求评估、逐个激活、再实现
- 规定文档生成边界，文档必须输出到 `docs/` 目录
- 给出标准代码模板示例，明确 Entity、BO、VO、Controller、DAO 的正确写法
- 列出快捷命令入口与参考代码路径，便于快速进入正确流程

### 双配置协同流程
- `CLAUDE.md` 作为每次对话的底座规则，保证一致的语言与架构语义
- `AGENTS.md` 补充项目禁令、模板与流程，覆盖更细的工程约束
- `skill-forced-eval.js` 在用户输入时注入技能评估流程，强制激活匹配技能
- 动态技能与命令只在需要时加载，减少上下文噪音并保持执行稳定

### MCP 工具触发规则
- `sequential-thinking`：用于复杂问题拆解、多步推理与深度分析
- `context7`：用于获取框架最佳实践和官方规范，但 WD UI 仍以项目源码为准
- `chrome-devtools`：用于浏览器调试、截图与元素检查

### 关键禁令与一致性约束
- 包名必须是 `plus.ruoyi`，禁止使用 `com.ruoyi`
- Service 实现类不继承任何基类，DAO 层必须存在并实现 `buildQueryWrapper()`
- Entity 继承 `TenantEntity`，对象转换统一使用 `MapstructUtils`
- 前端使用 AForm、AModal 等封装组件，移动端使用 WD UI `wd-*` 组件
- API 路径必须包含实体名，例如 `pageAds` 而不是 `page`

## 技能系统
### 技能加载与目录规范
- 每个技能位于 `.claude/skills/{skill-name}/SKILL.md`
- 技能文件包含 YAML 头部，记录 `name`、`description`、触发场景与触发词
- 强制技能评估流程由钩子注入，未匹配技能时需明确说明

### 分类总览（54 个技能）
- 业务与架构：crud-development、api-development、architecture-design、workflow-engine
- 后端能力：backend-annotations、data-permission、error-handler、security-guard、multi-tenant、json-serialization、test-development、log-audit
- 前端与移动：ui-pc、ui-mobile、ui-design-mobile、store-pc、store-mobile、uniapp-platform、i18n-development
- APP原生：app-adapter
- 中间件与集成：redis-cache、scheduled-jobs、realtime-communication、notification-system、message-queue、iot-mqtt、third-party-api、social-login
- 工程与质量：code-patterns、git-workflow、project-navigator、utils-toolkit、performance-doctor、icon-management
- 部署运维：deployment-guide、env-config
- AI 与协作：ai-langchain4j、collaborating-with-codex、collaborating-with-gemini、task-tracker
- 业务集成：payment-integration、wechat-integration、file-oss-management、media-processing
- 诊断与规划：bug-detective、brainstorm、tech-decision、html-to-code
- 迁移与扩展：project-init、project-migration、framework-sync、add-skill、exp-sediment

### ai-langchain4j

定位
- 当需要集成 AI 大模型、智能对话功能时自动使用此 Skill。支持 DeepSeek、通义千问、OpenAI、Claude、Ollama。

触发场景
- AI 对话功能开发
- 流式响应处理
- 多轮对话管理
- 知识库 RAG 集成
- 函数调用实现

触发词
- `AI`
- `大模型`
- `ChatGPT`
- `DeepSeek`
- `通义千问`
- `Claude`
- `流式`
- `对话`
- `RAG`
- `知识库`
- `Embedding`
- `langchain4j`

示例
- 用户: 需要AI 对话功能开发
- 用户: 需要流式响应处理

### api-development

定位
- API 接口设计规范、RESTful 设计、前后端对接约定。（与 crud-development 区别：本 Skill 专注于"接口设计规范"，crud-development 用于"完整业务模块开发"）

触发场景
- 设计新的 API 接口路径
- 定义 RESTful 规范
- 前后端接口对接约定
- 接口命名规范
- `R<T> 响应格式设计`

触发词
- `API设计`
- `接口规范`
- `RESTful`
- `URL设计`
- `接口路径`
- `请求响应`
- `R<T>`
- `统一响应`
- `接口命名`
- `端点设计`

注意事项
- 注意：如果是开发完整的 CRUD 业务模块（Entity/Service/DAO/Controller），请使用 crud-development。

示例
- 用户: 需要设计新的 API 接口路径
- 用户: 需要定义 RESTful 规范

### architecture-design

定位
- 系统架构设计、模块划分、代码重构、技术栈选型。包含本项目四层架构、领域划分、依赖管理、技术栈优先级。

触发场景
- 系统架构设计
- 新模块划分规划
- 代码重构策略
- 依赖关系梳理
- 四层架构（Controller/Service/DAO/Mapper）设计
- 领域边界划分
- 技术栈选型咨询

触发词
- `架构设计`
- `模块划分`
- `四层架构`
- `领域划分`
- `重构`
- `解耦`
- `依赖管理`
- `分层设计`
- `系统设计`
- `代码组织`
- `技术栈`
- `技术选型`

注意事项
- 注意：如果是具体技术方案对比（如Redis vs本地缓存），请使用 tech-decision。如果是开发具体 CRUD 模块，请使用 crud-development。

示例
- 用户: 需要系统架构设计
- 用户: 需要新模块划分规划

### backend-annotations

定位
- 当需要使用后端高级注解时自动使用此 Skill。包含 SerialMap、RateLimiter、RepeatSubmit、Sensitive、DataPermission 等注解。

触发场景
- 数据序列化映射（ID转名称、字典转标签）
- 接口限流配置
- 防重复提交
- 敏感数据脱敏
- 数据权限控制

触发词
- `SerialMap`
- `限流`
- `RateLimiter`
- `防重复`
- `RepeatSubmit`
- `脱敏`
- `Sensitive`
- `数据权限`
- `DataPermission`
- `ID转名称`
- `字典转换`
- `OSS转URL`

示例
- 用户: 需要数据序列化映射（ID转名称、字典转标签）
- 用户: 需要接口限流配置

### brainstorm

定位
- 当需要探索方案、头脑风暴、创意思维时自动使用此 Skill。

触发场景
- 不知道怎么设计
- 需要多种方案
- 创意探索
- 架构讨论
- 功能规划
- 业务扩展

触发词
- `头脑风暴`
- `方案`
- `怎么设计`
- `有什么办法`
- `创意`
- `讨论`
- `探索`
- `想法`
- `建议`
- `怎么做`
- `如何实现`
- `有哪些方式`
- `能不能做`
- `可以实现吗`
- `业界怎么做`(联网借鉴法)
- `看看竞品`(联网借鉴法)
- `参考官方文档`(联网借鉴法)

发散方法(5 种)
- **类比法** - 已有同类场景怎么做的?
- **反向法** - 反过来想会怎样?
- **约束法** - 有什么硬性约束?
- **跨界法** - 其他领域/系统怎么做的?(在项目内 35 个 common 模块中借鉴)
- **联网借鉴法**(按需触发) - 涉及新技术/新版本、用户明确说"业界怎么做"或"看看竞品"、项目模块覆盖不到时,通过 context7 MCP / WebSearch / chrome-devtools MCP 查最新最佳实践

示例
- 用户: 需要不知道怎么设计
- 用户: 需要需要多种方案

### bug-detective

定位
- 排查已发生的问题、定位 Bug 原因。（与 error-handler 区别：本 Skill 用于"排查问题"，error-handler 用于"设计异常处理机制"）

触发场景
- 代码运行报错，需要定位原因
- 功能不正常，需要排查
- 接口返回错误，需要分析
- 日志分析、调试代码
- "为什么不工作"、"怎么不生效"

触发词
- `Bug`
- `报错`
- `不工作`
- `调试`
- `排查`
- `为什么`
- `出问题`
- `失败`
- `不生效`
- `无效`
- `找不到原因`
- `定位问题`

注意事项
- 注意：如果是要设计异常处理机制（try-catch、全局异常、错误码），请使用 error-handler。

示例
- 用户: 需要代码运行报错，需要定位原因
- 用户: 需要功能不正常，需要排查

### code-patterns

定位
- 全栈代码禁令和通用编码规范速查（后端 + 前端 + 移动端）。

触发场景
- 查看项目禁止事项（后端/前端/移动端）
- 命名规范速查
- Git 提交规范
- 避免过度工程
- 代码风格检查

触发词
- `规范`
- `禁止`
- `命名`
- `Git提交`
- `代码风格`
- `前端规范`
- `移动端规范`
- `不能用`
- `不允许`

注意事项
- 注意：具体的 UI 组件用法请激活 ui-pc 或 ui-mobile，Store 规范请激活 store-pc 或 store-mobile，CRUD 规范请激活 crud-development。

示例
- 用户: 需要查看项目禁止事项（后端/前端/移动端）
- 用户: 需要命名规范速查

### collaborating-with-codex

定位
- 与 OpenAI Codex CLI 协同开发。将编码任务委托给 Codex 进行原型开发、调试分析和代码审查。

触发场景
- 需要算法实现或复杂逻辑分析
- 需要代码审查和 Bug 分析
- 需要生成 Unified Diff 补丁
- 用户明确要求使用 Codex 协作
- 复杂后端逻辑的原型设计

触发词
- `Codex`
- `协作`
- `多模型`
- `原型`
- `Diff`
- `算法分析`
- `代码审查`
- `codex协同`

注意事项
- 前置要求：

示例
- 用户: 需要需要算法实现或复杂逻辑分析
- 用户: 需要需要代码审查和 Bug 分析

### collaborating-with-gemini

定位
- 与 Google Gemini CLI 协同开发。将编码任务委托给 Gemini 进行前端原型、UI设计和代码审查。

触发场景
- 需要前端/UI/样式原型设计
- 需要 CSS/React/Vue 组件设计
- 需要代码审查和 Bug 分析
- 用户明确要求使用 Gemini 协作
- 复杂前端逻辑的原型设计

触发词
- `Gemini`
- `协作`
- `多模型`
- `前端原型`
- `UI设计`
- `CSS`
- `样式`
- `gemini协同`

注意事项
- 前置要求：
- 注意：Gemini 对后端逻辑理解有缺陷，后端任务优先使用 Codex。

示例
- 用户: 需要需要前端/UI/样式原型设计
- 用户: 需要需要 CSS/React/Vue 组件设计

### crud-development

定位
- 开发 CRUD 功能、创建业务模块。包含完整全栈规范：后端四层架构 + 前端 API/Types。

触发场景
- 创建新的业务模块（如"用户反馈"、"优惠券"）
- 编写后端代码：Entity、BO、VO、Service、DAO、Controller、Mapper
- 编写前端 API 和 TypeScript 类型定义
- 任何涉及"增删改查"的全栈开发

触发词
- `CRUD`
- `增删改查`
- `新建模块`
- `Entity`
- `Service`
- `DAO`
- `Controller`
- `BO`
- `VO`
- `Mapper`
- `业务模块`
- `后端代码`
- `Java代码`
- `xxxApi.ts`
- `xxxTypes.ts`

注意事项
- 核心警告：本项目不是 ruoyi-vue-plus！
- 注意：如果只是写前端页面 UI，请使用 ui-pc 或 ui-mobile。

示例
- 用户: 需要创建新的业务模块（如"用户反馈"、"优惠券"）
- 用户: 需要编写后端代码：Entity、BO、VO、Service、DAO、Controller、Mapper

### data-permission

定位
- 数据权限开发指南。实现行级数据隔离，支持部门权限、本人权限、自定义权限等 6 种权限类型。

触发场景
- 为业务模块添加数据权限过滤
- 配置部门级数据隔离
- 扩展自定义数据权限类型
- 临时忽略数据权限查询全量数据
- 排查数据权限不生效问题

触发词
- `数据权限`
- `@DataPermission`
- `DataScope`
- `行级权限`
- `数据隔离`
- `部门权限`
- `本人权限`
- `自定义权限`
- `权限过滤`
- `数据过滤`
- `按部门过滤`
- `按创建人过滤`

注意事项
- 注意：如果是认证授权（登录、Token、Sa-Token）或菜单/按钮权限，请使用 security-guard。

示例
- 用户: 需要为业务模块添加数据权限过滤
- 用户: 需要配置部门级数据隔离

### database-ops

定位
- 当需要进行数据库相关操作时自动使用此 Skill：连接数据库、设计表结构、执行 SQL、管理字典、优化查询。

触发场景
- 连接数据库、查看表结构
- 设计新表、修改表结构
- 编写 SQL 查询、执行 DDL/DML
- 创建/管理字典数据
- SQL 性能优化、索引设计
- 查询最大 ID、查询菜单

触发词
- `数据库`
- `MySQL`
- `SQL`
- `表`
- `字段`
- `索引`
- `字典`
- `连接`
- `查询`
- `DDL`
- `建表`
- `SHOW`
- `DESC`
- `INSERT`
- `SELECT`
- `dict`
- `Oracle`
- `PostgreSQL`
- `SQL`
- `Server`

示例
- 用户: 需要连接数据库、查看表结构
- 用户: 需要设计新表、修改表结构

### error-handler

定位
- 设计异常处理机制、错误码、日志规范。（与 bug-detective 区别：本 Skill 用于"设计处理机制"，bug-detective 用于"排查已发生的问题"）

触发场景
- 设计 try-catch 异常处理
- 定义错误码体系
- 配置日志记录规范
- 设计全局异常处理器
- ServiceException 使用方法
- 错误提示文案优化

触发词
- `异常处理`
- `ServiceException`
- `try-catch`
- `全局异常`
- `错误码`
- `日志规范`
- `log.info`
- `@Slf4j`
- `错误提示设计`

注意事项
- 注意：如果是排查已发生的 Bug（代码报错、功能异常），请使用 bug-detective。

示例
- 用户: 需要设计 try-catch 异常处理
- 用户: 需要定义错误码体系

### file-oss-management

定位
- 当需要进行文件上传、下载、存储管理时自动使用此 Skill。支持本地存储、阿里云OSS、腾讯云COS、七牛云、MinIO等。

触发场景
- 文件上传下载
- 云存储配置
- 预签名URL生成
- 文件元数据管理
- 图片处理

触发词
- `文件上传`
- `OSS`
- `云存储`
- `MinIO`
- `阿里云`
- `腾讯云`
- `七牛`
- `图片上传`
- `文件下载`
- `预签名`
- `presigned`

示例
- 用户: 需要文件上传下载
- 用户: 需要云存储配置

### git-workflow

定位
- 当需要进行 Git 版本控制操作时自动使用此 Skill。

触发场景
- 提交代码
- 创建/合并分支
- 查看提交历史
- 解决冲突
- 回滚代码

触发词
- `git`
- `提交`
- `commit`
- `分支`
- `合并`
- `push`
- `pull`
- `冲突`
- `回滚`
- `版本`
- `历史`

示例
- 用户: 需要提交代码
- 用户: 需要创建/合并分支

### media-processing

定位
- 当需要处理图片、生成二维码、制作海报、导入导出Excel时自动使用此 Skill。

触发场景
- 图片处理（缩放、水印、滤镜）
- 二维码生成
- GIF 动画制作
- 海报生成
- Excel 导入导出
- 文件类型判断

触发词
- `图片`
- `缩放`
- `水印`
- `二维码`
- `QrCode`
- `GIF`
- `海报`
- `Excel`
- `导入`
- `导出`
- `ImageBuilder`
- `ExcelUtil`

示例
- 用户: 需要图片处理（缩放、水印、滤镜）
- 用户: 需要二维码生成

### payment-integration

定位
- 当需要集成支付功能时自动使用此 Skill。包含微信支付、支付宝、银联、余额支付的完整对接流程。

触发场景
- 对接支付渠道
- 发起支付请求
- 处理支付回调
- 退款操作
- 查询支付状态

触发词
- `支付`
- `付款`
- `微信支付`
- `支付宝`
- `银联`
- `余额支付`
- `退款`
- `回调`
- `notify`
- `PayService`
- `支付配置`

示例
- 用户: 需要对接支付渠道
- 用户: 需要发起支付请求

### performance-doctor

定位
- 性能问题诊断与优化。包含 SQL 优化、缓存策略、前端渲染优化、内存泄漏排查。

触发场景
- 页面/接口响应慢
- SQL 慢查询优化
- 缓存策略设计
- 分页查询优化
- N+1 查询问题
- 内存泄漏排查
- 前端渲染卡顿

触发词
- `性能优化`
- `慢查询`
- `SQL优化`
- `索引优化`
- `缓存`
- `Redis缓存`
- `N+1`
- `分页优化`
- `EXPLAIN`
- `内存泄漏`
- `卡顿`
- `加载慢`
- `响应慢`
- `渲染优化`

注意事项
- 注意：如果是排查功能性 Bug（代码报错、逻辑错误），请使用 bug-detective。

示例
- 用户: 需要页面/接口响应慢
- 用户: 需要SQL 慢查询优化

### project-navigator

定位
- 当需要了解项目结构、查找文件、定位代码时自动使用此 Skill。提供项目结构导航和资源索引。

触发场景
- 不知道文件在哪里
- 想了解项目结构
- 查找某个功能的代码位置
- 了解模块职责
- 查看已有的工具类、组件、API、Store
- 寻找参考代码

触发词
- `项目结构`
- `文件在哪`
- `目录`
- `模块`
- `代码位置`
- `找`
- `定位`
- `结构`
- `在哪里`
- `哪个文件`
- `参考`
- `已有`

示例
- 用户: 需要不知道文件在哪里
- 用户: 需要想了解项目结构

### security-guard

定位
- 安全开发规范。包含 Sa-Token 认证授权、数据脱敏、数据加密、接口安全、漏洞防护。

触发场景
- Sa-Token 权限控制配置
- 登录认证、Token 管理
- 数据脱敏处理（@Sensitive）
- 数据加密处理（@EncryptField、@ApiEncrypt）
- 接口限流（@RateLimiter）
- 防重复提交（@RepeatSubmit）
- XSS/SQL注入防护
- 前端权限指令（v-permi、v-role）

触发词
- `安全`
- `Sa-Token`
- `@SaCheckPermission`
- `@SaCheckLogin`
- `@SaCheckRole`
- `登录认证`
- `Token`
- `数据脱敏`
- `@Sensitive`
- `加密解密`
- `@EncryptField`
- `@ApiEncrypt`
- `限流`
- `@RateLimiter`
- `防重复`
- `@RepeatSubmit`
- `XSS`
- `SQL注入`
- `CSRF`
- `漏洞防护`
- `敏感数据`
- `LoginHelper`
- `v-permi`
- `v-role`
- `useAuth`

注意事项
- 注意：

示例
- 用户: 需要Sa-Token 权限控制配置
- 用户: 需要登录认证、Token 管理

### store-mobile

定位
- 移动端（plus-uniapp）状态管理与 Composables 完整指南。

触发场景
- 在移动端创建/使用 Store（Pinia）
- 使用 Composables（useAuth、useDict、usePayment、useHttp 等）
- 跨页面数据共享（移动端）
- 持久化存储（uni.storage）
- HTTP 请求与链式调用
- 认证与权限检查
- 滚动管理与返回顶部

触发词
- `移动端Store`
- `useAuth`
- `useDict`
- `usePayment`
- `useDictStore`
- `移动端状态管理`
- `Composable`
- `useHttp`
- `http请求`
- `链式调用`
- `useScroll`
- `滚动管理`
- `useAppInit`
- `应用初始化`
- `cache`
- `缓存`
- `持久化`
- `useToken`

注意事项
- 适用目录：plus-uniapp/**

示例
- 用户: 需要在移动端创建/使用 Store（Pinia）
- 用户: 需要使用 Composables（useAuth、useDict、usePayment、useHttp 等）

### store-pc

定位
- PC 端（plus-ui）状态管理与 Composables 指南。包含 Pinia Store、Composables 组合式函数的创建和使用规范。

触发场景
- 在 PC 后台创建/使用 Store
- Pinia 状态管理
- 跨组件数据共享（PC端）
- 持久化存储（localCache/sessionCache）
- HTTP 请求链式调用
- 权限判断
- 字典数据加载

触发词
- `PC`
- `Store`
- `Pinia`
- `defineStore`
- `useUserStore`
- `useDictStore`
- `PC状态管理`
- `useHttp`
- `http`
- `链式调用`
- `useAuth`
- `useToken`
- `useDict`
- `useTableHeight`
- `localCache`
- `sessionCache`
- `缓存`
- `持久化`

注意事项
- 适用目录：plus-ui/**

示例
- 用户: 需要在 PC 后台创建/使用 Store
- 用户: 需要Pinia 状态管理

### task-tracker

定位
- 开发任务进度跟踪系统。当用户需要记录复杂开发任务的需求、步骤、进度时自动使用此 Skill。

触发场景
- 多步骤功能开发（需要跨会话）
- 复杂需求的步骤分解与跟踪
- 任务进度记录与更新
- 中断后的任务恢复
- 历史任务查询与归档

触发词
- `创建任务`
- `跟踪任务`
- `记录进度`
- `任务跟踪`
- `继续任务`
- `恢复任务`
- `查看任务`
- `归档任务`
- `任务列表`

示例
- 用户: 需要多步骤功能开发（需要跨会话）
- 用户: 需要复杂需求的步骤分解与跟踪

### tech-decision

定位
- 当需要进行技术选型、对比方案时自动使用此 Skill。

触发场景
- 选择用什么技术/库
- 对比不同方案
- 技术决策
- 评估优缺点
- 选择 ruoyi-common 模块

触发词
- `选型`
- `用什么`
- `对比`
- `哪个好`
- `优缺点`
- `选择`
- `技术方案`
- `库`
- `框架`
- `工具`
- `模块`

示例
- 用户: 需要选择用什么技术/库
- 用户: 需要对比不同方案

### ui-design-mobile

定位
- 移动端页面设计指南，追求「简洁、大气、专业」的视觉体验。

触发场景
- 设计移动端页面布局
- 页面看起来不够简洁/大气/专业
- 不知道用什么组件布局
- 页面信息太多太乱
- 想让页面更有质感

触发词
- `页面设计`
- `布局`
- `怎么排版`
- `放在哪里`
- `看起来乱`
- `不够简洁`
- `不够大气`
- `太拥挤`
- `留白`
- `间距`
- `颜色搭配`
- `视觉设计`
- `UI设计`
- `界面设计`

注意事项
- 适用目录：plus-uniapp/**
- 注意：本 Skill 专注于「设计思维」，具体组件用法请激活 ui-mobile。

示例
- 用户: 需要设计移动端页面布局
- 用户: 需要页面看起来不够简洁/大气/专业

### ui-mobile

定位
- 移动端（plus-uniapp）组件库完整指南。包含 99+ WD UI 组件、14 个 Composables、4 个 Store 模块、多平台适配。

触发场景
- 开发移动端页面（小程序、H5、APP）
- 使用 WD UI 组件（wd-*）
- 移动端列表、表单、弹窗、分页
- useToast、useMessage、usePayment 等
- 平台条件编译（#ifdef）

触发词
- `wd-`
- `WD`
- `UI`
- `移动端组件`
- `小程序组件`
- `wd-button`
- `wd-cell`
- `wd-form`
- `wd-popup`
- `wd-paging`
- `useToast`
- `useMessage`
- `usePayment`
- `plus-uniapp`

注意事项
- 适用目录：plus-uniapp/**

示例
- 用户: 需要开发移动端页面（小程序、H5、APP）
- 用户: 需要使用 WD UI 组件（wd-*）

### ui-pc

定位
- 前端（plus-ui）组件库完整指南。包含 71 个自定义组件、17 个 Composables、18 个工具模块。

触发场景
- 开发前端后台管理页面
- 使用 AForm*、AModal、ADetail、ACard*、AChart*、AAi* 等组件
- 使用 Element Plus 组件
- 表格、表单、弹窗、图表、卡片等前端 UI
- 使用 Composables（useDict、useTableHeight 等）
- 使用 Utils（format、crypto 等）

触发词
- `el-`
- `AForm`
- `AModal`
- `ADetail`
- `ASearchForm`
- `ACard`
- `AChart`
- `AAi`
- `TableToolbar`
- `Pagination`
- `DictTag`
- `前端组件`
- `后台页面`
- `管理端`
- `useDict`
- `useTableHeight`
- `useI18n`
- `国际化`
- `i18n`
- `t()`

注意事项
- 适用目录：plus-ui/**

示例
- 用户: 需要开发前端后台管理页面
- 用户: 需要使用 AForm*、AModal、ADetail、ACard*、AChart*、AAi* 等组件

### uniapp-platform

定位
- 当需要进行多端开发、条件编译、平台适配时自动使用此 Skill。涵盖小程序、H5、APP 的差异化开发。

触发场景
- 条件编译使用
- 平台特性判断
- 跨平台代码适配
- 原生能力调用

触发词
- `条件编译`
- `ifdef`
- `平台判断`
- `isMpWeixin`
- `isH5`
- `isApp`
- `跨平台`
- `小程序`
- `公众号H5`
- `原生能力`
- `多端`

示例
- 用户: 需要条件编译使用
- 用户: 需要平台特性判断

### utils-toolkit

定位
- 工具类智能匹配助手 - 根据上下文自动提供后端/前端/移动端对应的工具类和最佳实践。

触发场景
- 以技能描述中声明的场景为准

触发词
- `工具类`
- `日期`
- `时间`
- `字符串`
- `集合`
- `数组`
- `转换`
- `校验`
- `加密`
- `格式化`
- `处理`
- `工具`
- `utils`
- `Hutool`
- `dayjs`
- `lodash`
- `树结构`
- `tree`
- `权限`
- `下载`
- `打印`
- `弹窗`
- `消息`
- `toast`
- `modal`
- `websocket`
- `sse`
- `composable`
- `hook`

示例
- 用户: 工具类相关需求怎么落地
- 用户: 日期相关需求怎么落地

### wechat-integration

定位
- 当需要对接微信生态功能时自动使用此 Skill。包含小程序登录、公众号分享、消息订阅、手机号验证等。

触发场景
- 微信小程序登录
- 微信公众号H5分享
- 订阅消息推送
- 获取微信手机号
- 微信JS-SDK配置

触发词
- `微信`
- `小程序`
- `公众号`
- `分享`
- `订阅消息`
- `openid`
- `手机号授权`
- `wx.login`
- `JSSDK`
- `微信登录`

示例
- 用户: 需要微信小程序登录
- 用户: 需要微信公众号H5分享

### workflow-engine

定位
- 工作流引擎开发、流程管理、任务办理。基于 WarmFlow 实现审批流、业务流程集成。

触发场景
- 启动工作流程（发起审批、提交申请）
- 办理任务（审批通过、驳回、转办、委派）
- 流程定义管理（设计流程、配置节点）
- 业务模块集成工作流（订单审批、请假申请）
- 监听工作流事件（流程状态变更通知）
- 配置办理人（用户、角色、部门、岗位、SpEL表达式）

触发词
- `工作流`
- `流程`
- `审批`
- `WarmFlow`
- `FlowEngine`
- `任务`
- `办理`
- `驳回`
- `转办`
- `委派`
- `加签`
- `减签`
- `抄送`
- `流程实例`
- `流程定义`
- `办理人`
- `GlobalListener`
- `ProcessEvent`

示例
- 用户: 需要启动工作流程（发起审批、提交申请）
- 用户: 需要办理任务（审批通过、驳回、转办、委派）

### app-adapter

定位
- plus-app（原生APP项目）开发适配指南。提供 plus-app 与 plus-uniapp 开发页面、组件、API 时的差异说明，以及原生插件支持。

触发场景
- 用户明确提到 plus-app 或 APP 端开发
- 需要使用原生插件（nativeplugins）
- 需要 HBuilderX 打包或真机调试
- 需要鸿蒙 APP 适配
- 需要 APP 专属配置（地图、客服、分享域名）

触发词
- `plus-app`
- `APP端`
- `原生APP`
- `原生插件`
- `HBuilderX`
- `鸿蒙APP`
- `harmony`
- `nativeplugins`
- `APP打包`
- `真机调试`
- `APP专属`
- `APP配置`

示例
- 用户: plus-app 和 plus-uniapp 有什么区别
- 用户: APP 端怎么使用原生插件

### icon-management

定位
- 选择菜单图标、管理项目图标库、添加或替换图标时使用。处理 PC 端和移动端两套独立的图标体系。

触发场景
- 创建新菜单需要选择合适的图标
- 向项目图标库添加新图标
- 替换现有图标
- 查看可用图标列表
- 了解 PC 端和移动端图标体系

触发词
- `图标`
- `icon`
- `菜单图标`
- `换图标`
- `加图标`
- `图标管理`
- `IconSelect`
- `wd-icon`
- `iconfont`
- `图标选择`

示例
- 用户: 新菜单用什么图标合适
- 用户: 怎么给项目添加新图标

### project-migration

定位
- 将其他项目迁移/重构为 ruoyi-plus-uniapp 架构。提供完整的迁移方法论、分步流程、差异映射规则和跨会话协调机制。

触发场景
- 将其他 Java 项目迁移到本项目架构
- 从 RuoYi/RuoYi-Vue-Plus/SpringBlade 等框架重构代码
- 继续之前中断的迁移任务
- 扫描和分析源项目的模块、表、API、页面
- 生成迁移蓝图和映射文档
- 对比架构差异

触发词
- `迁移项目`
- `项目迁移`
- `重构项目`
- `代码迁移`
- `继续迁移`
- `迁移进度`
- `迁移蓝图`
- `架构迁移`
- `框架迁移`
- `项目重构`
- `导入项目`
- `搬迁代码`
- `从xxx迁移`

示例
- 用户: 怎么把 SpringBlade 项目迁移过来
- 用户: 继续上次的迁移任务

### add-skill

定位
- 向框架添加新技能、修改现有技能、编写技能文档。将实现步骤转化为可复用的技能。

触发场景
- 为新模块添加技能
- 为新功能编写技能文档
- 扩展框架的技能系统
- 将实现步骤转化为可复用的技能
- 修改现有技能内容并同步到两套系统
- 重命名或删除现有技能

触发词
- `添加技能`
- `创建技能`
- `新技能`
- `技能开发`
- `写技能`
- `技能文档`
- `skill创建`
- `修改技能`
- `更新技能`
- `同步技能`
- `技能同步`

示例
- 用户: 给这个新模块添加一个技能
- 用户: 帮我修改 crud-development 技能的内容

### i18n-development

定位
- 国际化开发技能，涵盖后端 MessageSource、PC 端 Vue i18n、移动端 useI18n 完整实现。

触发场景
- 后端国际化配置（MessageSource、property files）
- PC 端多语言切换（Vue i18n）
- 移动端国际化（UniApp i18n）
- 动态语言切换
- 语言包管理

触发词
- `国际化`
- `多语言`
- `i18n`
- `翻译`
- `t()`
- `语言切换`
- `MessageUtils`
- `content-language`
- `LanguageCode`
- `useI18n`
- `messages.properties`
- `locale`
- `$t`
- `zh_CN`
- `en_US`

示例
- 用户: 怎么给后端接口加国际化
- 用户: 移动端怎么切换语言

### scheduled-jobs

定位
- 定时任务开发指南。涵盖 Redisson 延迟队列、@Scheduled、SnailJob 三种方案，支持分布式任务调度、失败重试、工作流编排。

触发场景
- 订单自动取消、支付回调重试等事件驱动场景（Redisson 延迟队列）
- 每日数据汇总、定期清理等周期性任务（@Scheduled）
- 分布式复杂业务、失败重试、可视化管理（SnailJob）
- 任务分片、MapReduce 分布式计算

触发词
- `定时任务`
- `SnailJob`
- `延迟队列`
- `@Scheduled`
- `任务调度`
- `重试机制`
- `工作流编排`
- `@JobExecutor`
- `Redisson`
- `分布式任务`

示例
- 用户: 订单超时自动取消怎么实现
- 用户: 怎么配置分布式定时任务

### json-serialization

定位
- 当需要处理 JSON 序列化、反序列化、数据类型转换、日期处理、大数字精度保护时自动使用此 Skill。

触发场景
- JSON 序列化/反序列化操作
- 大数字精度问题（Long/BigInteger/BigDecimal）
- 日期时间格式化与转换
- 复杂泛型类型转换
- JSON 格式验证

触发词
- `JSON`
- `序列化`
- `反序列化`
- `JsonUtils`
- `日期格式`
- `精度`
- `BigDecimal`
- `Long`
- `类型转换`
- `JSON验证`

示例
- 用户: Long 类型前端精度丢失怎么办
- 用户: 日期格式怎么统一

### redis-cache

定位
- 当需要使用 Redis 缓存、分布式锁、限流等功能时自动使用此 Skill。包含 RedisUtils/CacheUtils 工具类、缓存注解使用规范、分布式锁实现、缓存 key 命名规范等。

触发场景
- 使用 Redis 缓存数据
- 配置 Spring Cache 缓存注解
- 实现分布式锁
- 实现接口限流
- Redis 发布订阅
- 缓存穿透/雪崩/击穿问题

触发词
- `Redis`
- `缓存`
- `Cache`
- `@Cacheable`
- `@CacheEvict`
- `@CachePut`
- `RedisUtils`
- `CacheUtils`
- `分布式锁`
- `RLock`
- `限流`
- `RateLimiter`
- `发布订阅`
- `缓存穿透`
- `缓存雪崩`
- `缓存击穿`

注意事项
- @Cacheable 返回值不能使用不可变集合（List.of()、Set.of()、Map.of()）
- 分布式锁必须在 finally 中释放
- keys() 和 deleteKeys() 会忽略租户隔离

示例
- 用户: 怎么给接口加缓存
- 用户: 分布式锁怎么实现

### multi-tenant

定位
- 当需要进行多租户开发、租户数据隔离、租户管理时自动使用此 Skill。

触发场景
- 新建业务表需要支持多租户隔离
- 需要临时忽略租户过滤查询全量数据
- 需要动态切换到其他租户执行操作
- 配置租户排除表
- 排查租户数据隔离不生效的问题

触发词
- `多租户`
- `租户隔离`
- `tenant_id`
- `TenantEntity`
- `租户切换`
- `TenantHelper`
- `动态租户`
- `排除表`
- `DEFAULT_TENANT_ID`

示例
- 用户: 怎么让某些表不走租户隔离
- 用户: 怎么临时查全部租户的数据

### test-development

定位
- 测试开发技能，编写单元测试、集成测试、Controller 测试。包含 JUnit5、Mockito、AssertJ 完整规范。

触发场景
- 编写单元测试（工具类、Service、Controller、DAO）
- 创建测试数据
- Mock 外部依赖
- 集成测试（Spring 容器、数据库）
- 参数化测试
- 测试覆盖率提升

触发词
- `测试`
- `单元测试`
- `@Test`
- `JUnit5`
- `Mockito`
- `Mock`
- `断言`
- `测试用例`
- `测试覆盖率`
- `@SpringBootTest`
- `AssertJ`
- `@ParameterizedTest`

注意事项
- 本项目使用 ruoyi-common-test 模块提供统一测试基类。

示例
- 用户: 帮这个 Service 写单元测试
- 用户: Controller 怎么写集成测试

### realtime-communication

定位
- 当需要实现实时通信功能时自动使用此 Skill。包含 WebSocket 双向通信和 SSE 服务端推送的完整开发指南。

触发场景
- 需要实现 WebSocket 实时双向通信（聊天、在线状态）
- 需要实现 SSE 服务端推送（AI 流式响应、通知推送）
- 需要选择 WebSocket 还是 SSE 方案
- 需要向指定用户或全局推送消息
- 需要在集群环境下分发实时消息

触发词
- `WebSocket`
- `SSE`
- `实时推送`
- `在线聊天`
- `消息推送`
- `双向通信`
- `服务端推送`
- `流式响应`
- `EventSource`
- `心跳`
- `在线状态`
- `WebSocketUtils`
- `SseMessageUtils`
- `publishMessage`
- `useWS`
- `useSSE`
- `useWebSocket`

示例
- 用户: 怎么实现 WebSocket 消息推送
- 用户: AI 流式响应用 SSE 怎么做

### notification-system

定位
- 当需要发送通知消息、短信验证码、邮件通知、统一消息推送时自动使用此 Skill。

触发场景
- 需要发送短信（验证码、通知、营销）
- 需要发送邮件（验证码、通知、HTML 邮件）
- 需要使用统一消息推送服务（多通道路由、降级、广播）
- 需要为业务模块集成消息推送能力
- 需要配置短信/邮件服务

触发词
- `短信`
- `SMS`
- `邮件`
- `Mail`
- `Email`
- `消息推送`
- `MessagePushService`
- `MessageChannel`
- `通知`
- `验证码`
- `SmsFactory`
- `MailUtils`
- `sendText`
- `sendHtml`
- `统一消息`
- `消息路由`
- `多通道`

示例
- 用户: 怎么发送短信验证码
- 用户: 怎么给用户发邮件通知

### message-queue

定位
- 当需要使用 RocketMQ 消息队列进行异步通信、系统解耦、削峰填谷时自动使用此 Skill。

触发场景
- 需要发送异步消息（同步/异步/单向/延迟/事务消息）
- 需要实现消息消费者监听处理
- 需要管理 Topic（创建/删除/查询/验证路由）
- 需要延迟消息实现定时业务（订单超时取消等）
- 需要事务消息保证分布式数据一致性

触发词
- `RocketMQ`
- `消息队列`
- `MQ`
- `异步消息`
- `延迟消息`
- `事务消息`
- `RMSendUtil`
- `RMTopicUtil`
- `DelayLevel`
- `Topic`
- `消费者`
- `生产者`
- `削峰填谷`
- `系统解耦`
- `sendAsync`
- `sendDelay`
- `sendTransaction`
- `RocketMQMessageListener`

示例
- 用户: 怎么发送异步消息
- 用户: 订单超时取消用延迟消息怎么做

### social-login

定位
- 当需要实现第三方社交登录、OAuth2 认证、账号绑定/解绑时自动使用此 Skill。

触发场景
- 需要接入第三方社交登录（微信/QQ/GitHub/Gitee/钉钉等）
- 需要实现 OAuth2 授权流程（获取授权 URL、回调处理、令牌交换）
- 需要管理社交账号绑定与解绑
- 需要处理企业级 SSO 集成（MaxKey/TopIAM/企业微信）

触发词
- `社交登录`
- `第三方登录`
- `OAuth2`
- `微信登录`
- `QQ登录`
- `GitHub登录`
- `Gitee登录`
- `钉钉登录`
- `企业微信`
- `SSO`
- `单点登录`
- `JustAuth`
- `SocialUtils`
- `socialBind`
- `socialUnbind`
- `授权回调`
- `AuthRequest`
- `socialCallback`
- `MaxKey`
- `TopIAM`
- `账号绑定`

示例
- 用户: 怎么接入微信扫码登录
- 用户: 第三方登录账号怎么绑定

### third-party-api

定位
- 当需要集成第三方外部 API 服务、使用 Forest 声明式 HTTP 客户端、调用高德地图或火山引擎 TTS 时自动使用此 Skill。

触发场景
- 需要调用高德地图 API（IP 定位、地理编码、天气查询、距离计算）
- 需要调用火山引擎 TTS 语音合成服务
- 需要使用 Forest 框架定义新的第三方 API 客户端
- 需要为第三方 API 配置拦截器、认证、超时
- 需要扩展新的第三方服务集成

触发词
- `高德地图`
- `火山引擎`
- `TTS`
- `语音合成`
- `地理编码`
- `逆地理编码`
- `IP定位`
- `天气查询`
- `距离计算`
- `第三方API`
- `HTTP客户端`
- `Forest`
- `GaodeMapClient`
- `VolcengineTtsClient`
- `声明式HTTP`
- `ForestInterceptor`
- `外部服务集成`

示例
- 用户: 怎么调用高德地图 IP 定位
- 用户: 怎么用 Forest 对接新的第三方 API

### iot-mqtt

定位
- 当需要使用 MQTT 协议进行物联网设备通信、消息发布订阅、设备状态管理时自动使用此 Skill。

触发场景
- 需要与 IoT 设备进行 MQTT 消息通信（发布/订阅）
- 需要配置 MQTT 客户端连接（Broker、认证、SSL）
- 需要实现设备数据采集和指令下发
- 需要处理设备上下线状态监控
- 需要在集群环境下部署 MQTT 客户端（共享订阅）

触发词
- `MQTT`
- `物联网`
- `IoT`
- `设备通信`
- `设备消息`
- `mica-mqtt`
- `MqttClientTemplate`
- `publish`
- `subscribe`
- `QoS`
- `Topic`
- `EMQX`
- `Mosquitto`
- `共享订阅`
- `设备上线`
- `设备离线`
- `遗嘱消息`
- `保留消息`
- `传感器数据`

示例
- 用户: 怎么接收 IoT 设备的 MQTT 消息
- 用户: 设备上下线状态怎么监控

### deployment-guide

定位
- 当需要部署项目到生产环境、构建前端/移动端发布包、管理安全密钥、配置 Docker 容器编排时自动使用此 Skill。覆盖 JAR 部署、Docker Compose、Nginx、1Panel、一键自动化部署脚本。

触发场景
- 将后端 JAR 或 Docker 镜像部署到生产服务器
- 构建 PC 管理端、H5、小程序、APP 发布包
- 轮换生产环境 JWT / RSA / AES 密钥
- 生成 Docker Compose 本地配置
- 配置 Nginx 反向代理和负载均衡

触发词
- `部署`
- `上线`
- `发布`
- `生产环境`
- `Docker`
- `Compose`
- `构建`
- `build`
- `打包`
- `JAR`
- `密钥`
- `Nginx`
- `1Panel`
- `一键部署`
- `deploy.py`

示例
- 用户: 项目第一次上线要做哪些密钥替换
- 用户: 怎么用一键部署脚本构建 Docker 镜像

### env-config

定位
- 当需要配置多环境（开发/测试/生产）、修改 `application-*.yml` 或 `.env.*` 文件、切换后端 profile、设置前端/移动端环境变量时自动使用此 Skill。

触发场景
- 配置后端 Spring Boot 多 profile
- 修改前端 `.env.development` / `.env.production`
- 修改移动端（plus-uniapp / plus-app）`.env`
- 切换开发/生产环境的 API 地址、端口、密钥
- 处理 `${ENV_VAR:default}` 占位符

触发词
- `环境配置`
- `profile`
- `application.yml`
- `application-dev.yml`
- `application-prod.yml`
- `.env`
- `.env.development`
- `.env.production`
- `VITE_APP_`
- `多环境`
- `环境变量`
- `SPRING_PROFILES_ACTIVE`

示例
- 用户: 前端生产环境的接口地址在哪里配
- 用户: 后端怎么切换到 prod profile

### log-audit

定位
- 当需要为业务接口添加操作日志、配置审计追踪、排查日志内容时自动使用此 Skill。涵盖 `@Log` 注解、操作类型、登录日志、敏感参数脱敏。

触发场景
- 为 Controller 接口添加 `@Log` 注解
- 配置 `@Log` 的操作类型（`DictOperType`）
- 排除敏感参数（密码、Token）不写入日志
- 查询或导出 `sys_oper_log` 操作日志表
- 配置登录日志（`sys_logininfor`）

触发词
- `操作日志`
- `登录日志`
- `审计`
- `@Log`
- `sys_oper_log`
- `sys_logininfor`
- `DictOperType`
- `LogAspect`
- `excludeParamNames`
- `日志脱敏`

示例
- 用户: 某个接口需要记录操作日志并排除密码字段
- 用户: 登录日志表里怎么记录失败原因

### html-to-code

定位
- 当需要将 HTML/Tailwind 设计稿（UI 原型）转换为符合框架规范的前端或移动端代码时自动使用此 Skill。支持整页转换和单组件/区块转换。

触发场景
- 将 MCP 生成的 HTML 设计稿转换为 plus-ui 前端页面
- 将 HTML 原型转换为 plus-uniapp / plus-app 移动端页面
- 将 HTML 某个区块单独转换为框架组件
- 将 Tailwind CSS 设计稿适配为项目 UnoCSS 风格

触发词
- `HTML转代码`
- `设计稿转换`
- `原型转代码`
- `HTML转前端`
- `HTML转移动端`
- `HTML转Vue`
- `区块转换`
- `组件转换`

示例
- 用户: 把这个 HTML 页面转成 plus-ui 的 Vue 页面
- 用户: 设计稿的顶部区块能不能直接转成组件

### exp-sediment

定位
- 当需要沉淀本次会话或最近提交中产生的经验、将隐性知识转化为可复用资产（Skills、CLAUDE.md、Memory、`.claude/docs/experience/`）时自动使用此 Skill。对应 `/exp` 命令的详细执行指南。同时支持反向触发——查询历史踩坑记录避免重蹈覆辙。

触发场景(产出经验 - 写入)
- 用户说"沉淀经验 / 总结本次会话 / 把这个记下来"
- 用户说"这个以后还会遇到 / 避免下次再踩坑"
- 从 git log 中抽取可复用模式
- 识别现有技能的漏洞并补强
- 审计经验资产健康度（过时/冗余/孤岛）

触发场景(消费经验 - 读取)
- 用户说"以前怎么处理 / 之前的方案 / 之前踩过 / 上次怎么解决"
- 用户问"有没有遇到过类似问题 / 历史经验里有吗"
- 用户说"查一下记录 / 查笔记 / 查沉淀"
- 解决问题前希望先看历史踩坑记录避免重蹈覆辙

读取深度策略(三档)
- **轻量** - 每次新会话开始,自动读取最近 1 条 `*-exp-summary.md`(由根 `CLAUDE.md` 约定加载)
- **按主题** - 设计/排查时遇到"似曾相识"信号,模型主动按关键词 grep 命中具体文档
- **全量** - 仅 `/exp`、`/exp review`、`/start`、`framework-sync` 前、跨子项目反哺整合等场景允许扫描整个 `.claude/docs/experience/` 目录

触发词
- `沉淀经验`
- `经验沉淀`
- `总结会话`
- `记下来`
- `记录经验`
- `/exp`
- `exp review`
- `反哺框架`
- `经验审计`
- `技能漏洞`
- `避免再踩坑`
- `以前怎么处理`
- `之前的方案`
- `之前踩过`
- `历史经验`
- `查记录`
- `查笔记`
- `查沉淀`
- `有没有遇到过`
- `上次怎么解决`
- `类似问题`

示例
- 用户: 今天踩的坑能不能沉淀成技能
- 用户: /exp 复盘最近一周的提交
- 用户: 这个 OOM 问题之前踩过吗,有什么经验

### project-init

定位
- 当用户需要基于本框架创建新项目、初始化新项目时自动使用此 Skill。提供交互式项目初始化流程：模板更新检测、分支选择、移动端选择、标识符替换、目录复制、Git 仓库创建、数据库初始化、启动引导。

触发场景
- 用户说"我要开发一个新项目"或"创建一个新项目"
- 基于 ruoyi-plus-uniapp 框架初始化新的业务系统
- 修改项目唯一标识符和端口配置
- 为新项目创建 Git 仓库并推送代码
- 初始化新项目的数据库

触发词
- `新项目`
- `创建项目`
- `初始化项目`
- `开新项目`
- `项目初始化`
- `new project`
- `init project`
- `新建项目`
- `独立部署`

示例
- 用户: 我要基于框架新建一个叫 plus-shop 的项目
- 用户: 怎么把端口和标识符一起替换

### framework-sync

定位
- 当需要从框架原仓库（ruoyi-plus-uniapp）同步更新到基于框架创建的子项目时自动使用此 Skill。支持多分支（master/single/workflow）、逐提交分析、选择性合并、标识符自动替换。

触发场景
- 从 ruoyi-plus-uniapp 框架同步最新代码到子项目
- 查看框架有哪些新提交可以合并
- 配置 upstream remote 用于后续同步
- 查看或更新框架同步历史记录

触发词
- `框架同步`
- `upstream`
- `同步框架`
- `framework-sync`
- `拉取更新`
- `合并上游`
- `同步上游`
- `框架更新`
- `upstream sync`
- `同步原仓库`

示例
- 用户: 上游框架又更新了，怎么把新功能合到子项目
- 用户: 只想合并框架里新增的 workflow 改动

### 技能触发词索引
以下索引用于快速定位触发词，便于在大规模任务中快速匹配技能。

#### ai-langchain4j
- `AI`
- `大模型`
- `ChatGPT`
- `DeepSeek`
- `通义千问`
- `Claude`
- `流式`
- `对话`
- `RAG`
- `知识库`
- `Embedding`
- `langchain4j`

#### add-skill
- `添加技能`
- `创建技能`
- `新技能`
- `技能开发`
- `写技能`
- `技能文档`
- `skill创建`
- `修改技能`
- `更新技能`
- `同步技能`
- `技能同步`

#### api-development
- `API设计`
- `接口规范`
- `RESTful`
- `URL设计`
- `接口路径`
- `请求响应`
- `R<T>`
- `统一响应`
- `接口命名`
- `端点设计`

#### app-adapter
- `plus-app`
- `APP端`
- `原生APP`
- `原生插件`
- `HBuilderX`
- `鸿蒙APP`
- `harmony`
- `nativeplugins`
- `APP打包`
- `真机调试`
- `APP专属`
- `APP配置`

#### architecture-design
- `架构设计`
- `模块划分`
- `四层架构`
- `领域划分`
- `重构`
- `解耦`
- `依赖管理`
- `分层设计`
- `系统设计`
- `代码组织`
- `技术栈`
- `技术选型`

#### backend-annotations
- `SerialMap`
- `限流`
- `RateLimiter`
- `防重复`
- `RepeatSubmit`
- `脱敏`
- `Sensitive`
- `数据权限`
- `DataPermission`
- `ID转名称`
- `字典转换`
- `OSS转URL`

#### brainstorm
- `头脑风暴`
- `方案`
- `怎么设计`
- `有什么办法`
- `创意`
- `讨论`
- `探索`
- `想法`
- `建议`
- `怎么做`
- `如何实现`
- `有哪些方式`
- `能不能做`
- `可以实现吗`

#### bug-detective
- `Bug`
- `报错`
- `不工作`
- `调试`
- `排查`
- `为什么`
- `出问题`
- `失败`
- `不生效`
- `无效`
- `找不到原因`
- `定位问题`

#### code-patterns
- `规范`
- `禁止`
- `命名`
- `Git提交`
- `代码风格`
- `前端规范`
- `移动端规范`
- `不能用`
- `不允许`

#### collaborating-with-codex
- `Codex`
- `协作`
- `多模型`
- `原型`
- `Diff`
- `算法分析`
- `代码审查`
- `codex协同`

#### collaborating-with-gemini
- `Gemini`
- `协作`
- `多模型`
- `前端原型`
- `UI设计`
- `CSS`
- `样式`
- `gemini协同`

#### crud-development
- `CRUD`
- `增删改查`
- `新建模块`
- `Entity`
- `Service`
- `DAO`
- `Controller`
- `BO`
- `VO`
- `Mapper`
- `业务模块`
- `后端代码`
- `Java代码`
- `xxxApi.ts`
- `xxxTypes.ts`

#### data-permission
- `数据权限`
- `@DataPermission`
- `DataScope`
- `行级权限`
- `数据隔离`
- `部门权限`
- `本人权限`
- `自定义权限`
- `权限过滤`
- `数据过滤`
- `按部门过滤`
- `按创建人过滤`

#### database-ops
- `数据库`
- `MySQL`
- `SQL`
- `表`
- `字段`
- `索引`
- `字典`
- `连接`
- `查询`
- `DDL`
- `建表`
- `SHOW`
- `DESC`
- `INSERT`
- `SELECT`
- `dict`
- `Oracle`
- `PostgreSQL`
- `SQL`
- `Server`

#### error-handler
- `异常处理`
- `ServiceException`
- `try-catch`
- `全局异常`
- `错误码`
- `日志规范`
- `log.info`
- `@Slf4j`
- `错误提示设计`

#### file-oss-management
- `文件上传`
- `OSS`
- `云存储`
- `MinIO`
- `阿里云`
- `腾讯云`
- `七牛`
- `图片上传`
- `文件下载`
- `预签名`
- `presigned`

#### git-workflow
- `git`
- `提交`
- `commit`
- `分支`
- `合并`
- `push`
- `pull`
- `冲突`
- `回滚`
- `版本`
- `历史`

#### icon-management
- `图标`
- `icon`
- `菜单图标`
- `换图标`
- `加图标`
- `图标管理`
- `IconSelect`
- `wd-icon`
- `iconfont`
- `图标选择`

#### media-processing
- `图片`
- `缩放`
- `水印`
- `二维码`
- `QrCode`
- `GIF`
- `海报`
- `Excel`
- `导入`
- `导出`
- `ImageBuilder`
- `ExcelUtil`

#### payment-integration
- `支付`
- `付款`
- `微信支付`
- `支付宝`
- `银联`
- `余额支付`
- `退款`
- `回调`
- `notify`
- `PayService`
- `支付配置`

#### performance-doctor
- `性能优化`
- `慢查询`
- `SQL优化`
- `索引优化`
- `缓存`
- `Redis缓存`
- `N+1`
- `分页优化`
- `EXPLAIN`
- `内存泄漏`
- `卡顿`
- `加载慢`
- `响应慢`
- `渲染优化`

#### project-migration
- `迁移项目`
- `项目迁移`
- `重构项目`
- `代码迁移`
- `继续迁移`
- `迁移进度`
- `迁移蓝图`
- `架构迁移`
- `框架迁移`
- `项目重构`
- `导入项目`
- `搬迁代码`
- `从xxx迁移`

#### project-navigator
- `项目结构`
- `文件在哪`
- `目录`
- `模块`
- `代码位置`
- `找`
- `定位`
- `结构`
- `在哪里`
- `哪个文件`
- `参考`
- `已有`

#### security-guard
- `安全`
- `Sa-Token`
- `@SaCheckPermission`
- `@SaCheckLogin`
- `@SaCheckRole`
- `登录认证`
- `Token`
- `数据脱敏`
- `@Sensitive`
- `加密解密`
- `@EncryptField`
- `@ApiEncrypt`
- `限流`
- `@RateLimiter`
- `防重复`
- `@RepeatSubmit`
- `XSS`
- `SQL注入`
- `CSRF`
- `漏洞防护`
- `敏感数据`
- `LoginHelper`
- `v-permi`
- `v-role`
- `useAuth`

#### store-mobile
- `移动端Store`
- `useAuth`
- `useDict`
- `usePayment`
- `useDictStore`
- `移动端状态管理`
- `Composable`
- `useHttp`
- `http请求`
- `链式调用`
- `useScroll`
- `滚动管理`
- `useAppInit`
- `应用初始化`
- `cache`
- `缓存`
- `持久化`
- `useToken`

#### store-pc
- `PC`
- `Store`
- `Pinia`
- `defineStore`
- `useUserStore`
- `useDictStore`
- `PC状态管理`
- `useHttp`
- `http`
- `链式调用`
- `useAuth`
- `useToken`
- `useDict`
- `useTableHeight`
- `localCache`
- `sessionCache`
- `缓存`
- `持久化`

#### task-tracker
- `创建任务`
- `跟踪任务`
- `记录进度`
- `任务跟踪`
- `继续任务`
- `恢复任务`
- `查看任务`
- `归档任务`
- `任务列表`

#### tech-decision
- `选型`
- `用什么`
- `对比`
- `哪个好`
- `优缺点`
- `选择`
- `技术方案`
- `库`
- `框架`
- `工具`
- `模块`

#### ui-design-mobile
- `页面设计`
- `布局`
- `怎么排版`
- `放在哪里`
- `看起来乱`
- `不够简洁`
- `不够大气`
- `太拥挤`
- `留白`
- `间距`
- `颜色搭配`
- `视觉设计`
- `UI设计`
- `界面设计`

#### ui-mobile
- `wd-`
- `WD`
- `UI`
- `移动端组件`
- `小程序组件`
- `wd-button`
- `wd-cell`
- `wd-form`
- `wd-popup`
- `wd-paging`
- `useToast`
- `useMessage`
- `usePayment`
- `plus-uniapp`

#### ui-pc
- `el-`
- `AForm`
- `AModal`
- `ADetail`
- `ASearchForm`
- `ACard`
- `AChart`
- `AAi`
- `TableToolbar`
- `Pagination`
- `DictTag`
- `前端组件`
- `后台页面`
- `管理端`
- `useDict`
- `useTableHeight`
- `useI18n`
- `国际化`
- `i18n`
- `t()`

#### uniapp-platform
- `条件编译`
- `ifdef`
- `平台判断`
- `isMpWeixin`
- `isH5`
- `isApp`
- `跨平台`
- `小程序`
- `公众号H5`
- `原生能力`
- `多端`

#### utils-toolkit
- `工具类`
- `日期`
- `时间`
- `字符串`
- `集合`
- `数组`
- `转换`
- `校验`
- `加密`
- `格式化`
- `处理`
- `工具`
- `utils`
- `Hutool`
- `dayjs`
- `lodash`
- `树结构`
- `tree`
- `权限`
- `下载`
- `打印`
- `弹窗`
- `消息`
- `toast`
- `modal`
- `websocket`
- `sse`
- `composable`
- `hook`

#### wechat-integration
- `微信`
- `小程序`
- `公众号`
- `分享`
- `订阅消息`
- `openid`
- `手机号授权`
- `wx.login`
- `JSSDK`
- `微信登录`

#### workflow-engine
- `工作流`
- `流程`
- `审批`
- `WarmFlow`
- `FlowEngine`
- `任务`
- `办理`
- `驳回`
- `转办`
- `委派`
- `加签`
- `减签`
- `抄送`
- `流程实例`
- `流程定义`
- `办理人`
- `GlobalListener`
- `ProcessEvent`

#### i18n-development
- `国际化`
- `多语言`
- `i18n`
- `翻译`
- `t()`
- `语言切换`
- `MessageUtils`
- `content-language`
- `LanguageCode`
- `useI18n`
- `messages.properties`
- `locale`
- `$t`
- `zh_CN`
- `en_US`

#### scheduled-jobs
- `定时任务`
- `SnailJob`
- `延迟队列`
- `@Scheduled`
- `任务调度`
- `重试机制`
- `工作流编排`
- `@JobExecutor`
- `Redisson`
- `分布式任务`

#### json-serialization
- `JSON`
- `序列化`
- `反序列化`
- `JsonUtils`
- `日期格式`
- `精度`
- `BigDecimal`
- `Long`
- `类型转换`
- `JSON验证`

#### redis-cache
- `Redis`
- `缓存`
- `Cache`
- `@Cacheable`
- `@CacheEvict`
- `@CachePut`
- `RedisUtils`
- `CacheUtils`
- `分布式锁`
- `RLock`
- `限流`
- `RateLimiter`
- `发布订阅`
- `缓存穿透`
- `缓存雪崩`
- `缓存击穿`

#### multi-tenant
- `多租户`
- `租户隔离`
- `tenant_id`
- `TenantEntity`
- `租户切换`
- `TenantHelper`
- `动态租户`
- `排除表`
- `DEFAULT_TENANT_ID`

#### test-development
- `测试`
- `单元测试`
- `@Test`
- `JUnit5`
- `Mockito`
- `Mock`
- `断言`
- `测试用例`
- `测试覆盖率`
- `@SpringBootTest`
- `AssertJ`
- `@ParameterizedTest`

#### realtime-communication
- `WebSocket`
- `SSE`
- `实时推送`
- `在线聊天`
- `消息推送`
- `双向通信`
- `服务端推送`
- `流式响应`
- `EventSource`
- `心跳`
- `在线状态`
- `WebSocketUtils`
- `SseMessageUtils`
- `publishMessage`
- `useWS`
- `useSSE`
- `useWebSocket`

#### notification-system
- `短信`
- `SMS`
- `邮件`
- `Mail`
- `Email`
- `消息推送`
- `MessagePushService`
- `MessageChannel`
- `通知`
- `验证码`
- `SmsFactory`
- `MailUtils`
- `sendText`
- `sendHtml`
- `统一消息`
- `消息路由`
- `多通道`

#### message-queue
- `RocketMQ`
- `消息队列`
- `MQ`
- `异步消息`
- `延迟消息`
- `事务消息`
- `RMSendUtil`
- `RMTopicUtil`
- `DelayLevel`
- `Topic`
- `消费者`
- `生产者`
- `削峰填谷`
- `系统解耦`
- `sendAsync`
- `sendDelay`
- `sendTransaction`
- `RocketMQMessageListener`

#### social-login
- `社交登录`
- `第三方登录`
- `OAuth2`
- `微信登录`
- `QQ登录`
- `GitHub登录`
- `Gitee登录`
- `钉钉登录`
- `企业微信`
- `SSO`
- `单点登录`
- `JustAuth`
- `SocialUtils`
- `socialBind`
- `socialUnbind`
- `授权回调`
- `AuthRequest`
- `socialCallback`
- `MaxKey`
- `TopIAM`
- `账号绑定`

#### third-party-api
- `高德地图`
- `火山引擎`
- `TTS`
- `语音合成`
- `地理编码`
- `逆地理编码`
- `IP定位`
- `天气查询`
- `距离计算`
- `第三方API`
- `HTTP客户端`
- `Forest`
- `GaodeMapClient`
- `VolcengineTtsClient`
- `声明式HTTP`
- `ForestInterceptor`
- `外部服务集成`

#### iot-mqtt
- `MQTT`
- `物联网`
- `IoT`
- `设备通信`
- `设备消息`
- `mica-mqtt`
- `MqttClientTemplate`
- `publish`
- `subscribe`
- `QoS`
- `Topic`
- `EMQX`
- `Mosquitto`
- `共享订阅`
- `设备上线`
- `设备离线`
- `遗嘱消息`
- `保留消息`
- `传感器数据`

### 技能触发场景索引
以下索引用于快速浏览技能场景，帮助在任务拆解时做初步匹配。

#### ai-langchain4j
- AI 对话功能开发
- 流式响应处理
- 多轮对话管理
- 知识库 RAG 集成
- 函数调用实现

#### add-skill
- 为新模块添加技能
- 为新功能编写技能文档
- 扩展框架的技能系统
- 将实现步骤转化为可复用的技能
- 修改现有技能内容并同步到两套系统

#### api-development
- 设计新的 API 接口路径
- 定义 RESTful 规范
- 前后端接口对接约定
- 接口命名规范
- `R<T> 响应格式设计`

#### app-adapter
- 用户明确提到 plus-app 或 APP 端开发
- 需要使用原生插件（nativeplugins）
- 需要 HBuilderX 打包或真机调试
- 需要鸿蒙 APP 适配
- 需要 APP 专属配置（地图、客服、分享域名）

#### architecture-design
- 系统架构设计
- 新模块划分规划
- 代码重构策略
- 依赖关系梳理
- 四层架构（Controller/Service/DAO/Mapper）设计
- 领域边界划分
- 技术栈选型咨询

#### backend-annotations
- 数据序列化映射（ID转名称、字典转标签）
- 接口限流配置
- 防重复提交
- 敏感数据脱敏
- 数据权限控制

#### banana-image
- 场景以技能描述为准

#### brainstorm
- 不知道怎么设计
- 需要多种方案
- 创意探索
- 架构讨论
- 功能规划
- 业务扩展

#### bug-detective
- 代码运行报错，需要定位原因
- 功能不正常，需要排查
- 接口返回错误，需要分析
- 日志分析、调试代码
- "为什么不工作"、"怎么不生效"

#### code-patterns
- 查看项目禁止事项（后端/前端/移动端）
- 命名规范速查
- Git 提交规范
- 避免过度工程
- 代码风格检查

#### collaborating-with-codex
- 需要算法实现或复杂逻辑分析
- 需要代码审查和 Bug 分析
- 需要生成 Unified Diff 补丁
- 用户明确要求使用 Codex 协作
- 复杂后端逻辑的原型设计

#### collaborating-with-gemini
- 需要前端/UI/样式原型设计
- 需要 CSS/React/Vue 组件设计
- 需要代码审查和 Bug 分析
- 用户明确要求使用 Gemini 协作
- 复杂前端逻辑的原型设计

#### crud-development
- 创建新的业务模块（如"用户反馈"、"优惠券"）
- 编写后端代码：Entity、BO、VO、Service、DAO、Controller、Mapper
- 编写前端 API 和 TypeScript 类型定义
- 任何涉及"增删改查"的全栈开发

#### data-permission
- 为业务模块添加数据权限过滤
- 配置部门级数据隔离
- 扩展自定义数据权限类型
- 临时忽略数据权限查询全量数据
- 排查数据权限不生效问题

#### database-ops
- 连接数据库、查看表结构
- 设计新表、修改表结构
- 编写 SQL 查询、执行 DDL/DML
- 创建/管理字典数据
- SQL 性能优化、索引设计
- 查询最大 ID、查询菜单

#### error-handler
- 设计 try-catch 异常处理
- 定义错误码体系
- 配置日志记录规范
- 设计全局异常处理器
- ServiceException 使用方法
- 错误提示文案优化

#### file-oss-management
- 文件上传下载
- 云存储配置
- 预签名URL生成
- 文件元数据管理
- 图片处理

#### git-workflow
- 提交代码
- 创建/合并分支
- 查看提交历史
- 解决冲突
- 回滚代码

#### icon-management
- 创建新菜单需要选择合适的图标
- 向项目图标库添加新图标
- 替换现有图标
- 查看可用图标列表
- 了解 PC 端和移动端图标体系

#### media-processing
- 图片处理（缩放、水印、滤镜）
- 二维码生成
- GIF 动画制作
- 海报生成
- Excel 导入导出
- 文件类型判断

#### payment-integration
- 对接支付渠道
- 发起支付请求
- 处理支付回调
- 退款操作
- 查询支付状态

#### performance-doctor
- 页面/接口响应慢
- SQL 慢查询优化
- 缓存策略设计
- 分页查询优化
- N+1 查询问题
- 内存泄漏排查
- 前端渲染卡顿

#### project-migration
- 将其他 Java 项目迁移到本项目架构
- 从 RuoYi/RuoYi-Vue-Plus/SpringBlade 等框架重构代码
- 继续之前中断的迁移任务
- 扫描和分析源项目的模块、表、API、页面
- 生成迁移蓝图和映射文档
- 对比架构差异

#### project-navigator
- 不知道文件在哪里
- 想了解项目结构
- 查找某个功能的代码位置
- 了解模块职责
- 查看已有的工具类、组件、API、Store
- 寻找参考代码

#### security-guard
- Sa-Token 权限控制配置
- 登录认证、Token 管理
- 数据脱敏处理（@Sensitive）
- 数据加密处理（@EncryptField、@ApiEncrypt）
- 接口限流（@RateLimiter）
- 防重复提交（@RepeatSubmit）
- XSS/SQL注入防护
- 前端权限指令（v-permi、v-role）

#### store-mobile
- 在移动端创建/使用 Store（Pinia）
- 使用 Composables（useAuth、useDict、usePayment、useHttp 等）
- 跨页面数据共享（移动端）
- 持久化存储（uni.storage）
- HTTP 请求与链式调用
- 认证与权限检查
- 滚动管理与返回顶部

#### store-pc
- 在 PC 后台创建/使用 Store
- Pinia 状态管理
- 跨组件数据共享（PC端）
- 持久化存储（localCache/sessionCache）
- HTTP 请求链式调用
- 权限判断
- 字典数据加载

#### task-tracker
- 多步骤功能开发（需要跨会话）
- 复杂需求的步骤分解与跟踪
- 任务进度记录与更新
- 中断后的任务恢复
- 历史任务查询与归档

#### tech-decision
- 选择用什么技术/库
- 对比不同方案
- 技术决策
- 评估优缺点
- 选择 ruoyi-common 模块

#### ui-design-mobile
- 设计移动端页面布局
- 页面看起来不够简洁/大气/专业
- 不知道用什么组件布局
- 页面信息太多太乱
- 想让页面更有质感

#### ui-mobile
- 开发移动端页面（小程序、H5、APP）
- 使用 WD UI 组件（wd-*）
- 移动端列表、表单、弹窗、分页
- useToast、useMessage、usePayment 等
- 平台条件编译（#ifdef）

#### ui-pc
- 开发前端后台管理页面
- 使用 AForm*、AModal、ADetail、ACard*、AChart*、AAi* 等组件
- 使用 Element Plus 组件
- 表格、表单、弹窗、图表、卡片等前端 UI
- 使用 Composables（useDict、useTableHeight 等）
- 使用 Utils（format、crypto 等）

#### uniapp-platform
- 条件编译使用
- 平台特性判断
- 跨平台代码适配
- 原生能力调用

#### utils-toolkit
- 场景以技能描述为准

#### wechat-integration
- 微信小程序登录
- 微信公众号H5分享
- 订阅消息推送
- 获取微信手机号
- 微信JS-SDK配置

#### workflow-engine
- 启动工作流程（发起审批、提交申请）
- 办理任务（审批通过、驳回、转办、委派）
- 流程定义管理（设计流程、配置节点）
- 业务模块集成工作流（订单审批、请假申请）
- 监听工作流事件（流程状态变更通知）
- 配置办理人（用户、角色、部门、岗位、SpEL表达式）

#### i18n-development
- 后端国际化配置（MessageSource、property files）
- PC 端多语言切换（Vue i18n）
- 移动端国际化（UniApp i18n）
- 动态语言切换
- 语言包管理

#### scheduled-jobs
- 订单自动取消、支付回调重试等事件驱动场景（Redisson 延迟队列）
- 每日数据汇总、定期清理等周期性任务（@Scheduled）
- 分布式复杂业务、失败重试、可视化管理（SnailJob）
- 任务分片、MapReduce 分布式计算

#### json-serialization
- JSON 序列化/反序列化操作
- 大数字精度问题（Long/BigInteger/BigDecimal）
- 日期时间格式化与转换
- 复杂泛型类型转换
- JSON 格式验证

#### redis-cache
- 使用 Redis 缓存数据
- 配置 Spring Cache 缓存注解
- 实现分布式锁
- 实现接口限流
- Redis 发布订阅
- 缓存穿透/雪崩/击穿问题

#### multi-tenant
- 新建业务表需要支持多租户隔离
- 需要临时忽略租户过滤查询全量数据
- 需要动态切换到其他租户执行操作
- 配置租户排除表
- 排查租户数据隔离不生效的问题

#### test-development
- 编写单元测试（工具类、Service、Controller、DAO）
- 创建测试数据
- Mock 外部依赖
- 集成测试（Spring 容器、数据库）
- 参数化测试
- 测试覆盖率提升

#### realtime-communication
- 需要实现 WebSocket 实时双向通信（聊天、在线状态）
- 需要实现 SSE 服务端推送（AI 流式响应、通知推送）
- 需要选择 WebSocket 还是 SSE 方案
- 需要向指定用户或全局推送消息
- 需要在集群环境下分发实时消息

#### notification-system
- 需要发送短信（验证码、通知、营销）
- 需要发送邮件（验证码、通知、HTML 邮件）
- 需要使用统一消息推送服务（多通道路由、降级、广播）
- 需要为业务模块集成消息推送能力
- 需要配置短信/邮件服务

#### message-queue
- 需要发送异步消息（同步/异步/单向/延迟/事务消息）
- 需要实现消息消费者监听处理
- 需要管理 Topic（创建/删除/查询/验证路由）
- 需要延迟消息实现定时业务（订单超时取消等）
- 需要事务消息保证分布式数据一致性

#### social-login
- 需要接入第三方社交登录（微信/QQ/GitHub/Gitee/钉钉等）
- 需要实现 OAuth2 授权流程（获取授权 URL、回调处理、令牌交换）
- 需要管理社交账号绑定与解绑
- 需要处理企业级 SSO 集成（MaxKey/TopIAM/企业微信）

#### third-party-api
- 需要调用高德地图 API（IP 定位、地理编码、天气查询、距离计算）
- 需要调用火山引擎 TTS 语音合成服务
- 需要使用 Forest 框架定义新的第三方 API 客户端
- 需要为第三方 API 配置拦截器、认证、超时
- 需要扩展新的第三方服务集成

#### iot-mqtt
- 需要与 IoT 设备进行 MQTT 消息通信（发布/订阅）
- 需要配置 MQTT 客户端连接（Broker、认证、SSL）
- 需要实现设备数据采集和指令下发
- 需要处理设备上下线状态监控
- 需要在集群环境下部署 MQTT 客户端（共享订阅）

## 命令系统
### 命令入口总览
命令文件位于 `.claude/commands/`，当前共 13 个命令文件（不含 local 相关的上游同步命令）。以下按 14 个使用入口展开。

| 使用入口 | 定位 | 关键输入 | 主要输出 |
| --- | --- | --- | --- |
| `/start` | 快速了解项目状态 | 无 | 项目概况与下一步建议 |
| `/dev` | 新功能开发全流程 | 功能名称、模块 | 代码生成配置与执行计划 |
| `/crud` | 基于已有表快速 CRUD | 表名、模板类型 | 标准 CRUD 代码与菜单 SQL |
| `/check` | 全栈规范检查 | 全量或指定范围 | 规范检查报告与修复建议 |
| `/init-docs` 空白模板 | 新项目文档初始化 | 项目名称、简述 | 空白模板文档 |
| `/init-docs` 扫描模式 | 现有项目文档初始化 | 模式选择 | 扫描生成的现状报告 |
| `/progress` | 项目进度梳理 | 无 | 进度报告与待办建议 |
| `/next` | 下一步建议 | 无 | 分级开发建议清单 |
| `/add-todo` | 快速添加待办 | 任务描述 | 待办清单与状态联动 |
| `/update-status` | 增量更新状态 | 无 | 三文档联动更新报告 |
| `/sync` | 文档全量同步 | 无 | 三文档一致性同步 |
| `/deploy` | 一键自动化部署 | 部署目标（服务器/Docker） | 构建与部署执行报告 |
| `/framework-sync` | 框架同步 | 目标分支 / 提交范围 | 从 ruoyi-plus-uniapp 框架原仓库合并更新到子项目 |
| `/exp` | 经验沉淀 | 会话上下文或提交范围 | 抽取可复用模式到 Skills / Memory / docs |

> **说明**：源码项目中还包含 `/sync-local`、`/sync-wot-local`、`/sync-unibest-local` 等上游同步命令，这些命令仅在源码开发项目中使用，不属于本文档项目的范畴，因此不在此处列出。

### /start
定位
- 新窗口快速了解项目，区分框架模块与业务模块
输入
- 无显式参数，自动读取 `.claude/framework-config.json` 与最近提交
流程
- 扫描 `ruoyi-modules/ruoyi-*`，排除框架模块 `ruoyi-system` 与 `ruoyi-generator`
- 判断项目阶段：全新项目或开发中项目
- 检查 `docs/` 文档是否存在，必要时建议 `/init-docs`
输出
- 简洁项目报告，提供 `/dev`、`/crud`、`/progress` 等入口

### /dev
定位
- 新功能开发的全流程助手，自动生成代码生成器配置
输入
- 功能名称与所属模块（base、mall、iot、crm、marketing 或自定义）
流程
- 检查功能是否已存在，扫描后端、前端与数据库表
- 读取 `ruoyi-admin/src/main/resources/application-dev.yml` 获取数据库配置
- 依据字段后缀规则设计表结构并生成配置方案
- 一次确认后执行建表、菜单、字典与代码生成配置
- 若创建新字典，自动同步前端 `DictTypes` 枚举
输出
- 完整方案与执行结果，包含菜单、字典、表结构与生成入口

### /crud
定位
- 基于已存在的数据库表快速生成标准 CRUD
输入
- 表名、模板类型（`crud`、`tree`、`sub`）
流程
- 自动读取数据库配置并解析表结构
- 根据表结构提取功能名称与接口路径
- 树表与主子表模板支持自动检测与确认
输出
- 生成 CRUD 代码、菜单 SQL 与示例接口清单

### /check
定位
- 全栈规范检查，支持全量、模块与文件级检查
输入
- `/check`、`/check mall`、`/check XxxServiceImpl.java`
流程
- 后端检查包名、Service 继承、DAO 层、API 路径与对象转换
- 前端检查 API 目录结构、组件封装、导入规范与样式策略
- 移动端检查 WD UI 导入、字典使用与单位规范
输出
- 规范检查报告与修复建议清单

### /init-docs（空白模板模式）
定位
- 面向新项目的空白文档初始化
输入
- 项目名称与简述
流程
- 基于 `.claude/templates` 创建 `docs/项目状态.md`、`docs/需求文档.md`、`docs/待办清单.md`
输出
- 空白模板文档，便于后续手工完善

### /init-docs（扫描现有代码模式）
定位
- 面向已有项目的进度梳理与文档初始化
输入
- 模式选择为扫描现有代码
流程
- 扫描业务 Maven 模块与前端、移动端业务页面
- 排除系统模块与工具目录，仅统计业务域
- 生成现状报告并写入三类管理文档
输出
- 项目进度、需求与待办的初始状态文档

### /progress
定位
- 生成项目实现进度报告
输入
- 无显式参数
流程
- 按 Maven 模块统计后端完整度
- 统计前端页面与移动端页面完成情况
输出
- 包含模块、页面、待办与建议的进度报告

### /next
定位
- 提供下一步建议与任务优先级
输入
- 无显式参数
流程
- 扫描最近 Git 提交与 TODO/FIXME 标记
- 结合项目阶段输出高、中、低优先级建议
输出
- 下一步行动清单与待确认问题

### /add-todo
定位
- 快速添加待办任务并同步项目状态
输入
- 任务描述，支持优先级、预计时间与模块信息
流程
- 自动创建 `docs/待办清单.md`（如缺失）
- 解析任务并写入对应优先级区域
- 若存在 `docs/项目状态.md` 则联动更新待办区域
输出
- 待办新增确认与统计信息

### /update-status
定位
- 增量更新项目管理文档
输入
- 无显式参数
流程
- 检测并创建缺失的三类文档
- 扫描业务模块、Git 提交与 TODO 标记
- 更新 `项目状态`、`待办清单`、`需求文档` 三文档
输出
- 更新报告，包含新增完成与新增待办

### /sync
定位
- 文档全量同步，保证三类文档一致性
输入
- 无显式参数
流程
- 扫描业务模块与 Git 提交作为唯一事实来源
- 同步已完成、进行中与待办任务，并检测冲突
输出
- 同步报告与冲突提示

### /deploy
定位
- 一键自动化部署，将项目发布到生产服务器或 Docker 环境
输入
- 部署目标（JAR / Docker）与可选的密钥轮换参数
流程
- 检查构建产物（后端 `jar`、前端 `dist`、移动端 `unpackage`）是否就绪
- 调用 `deploy.py` 或 Docker Compose 执行构建、上传与重启
- 对生产环境密钥（JWT/RSA/AES）进行校验与提示
输出
- 构建与部署执行报告，包含版本号、耗时与回滚方式

### /framework-sync
定位
- 将 ruoyi-plus-uniapp 框架原仓库的更新同步到基于模板创建的子项目
输入
- 目标分支（master / single / workflow）与可选的提交范围
流程
- 读取 `.claude/framework-config.json` 中的 upstream 配置
- 逐提交列出框架最新改动，标注标识符替换项
- 按选择性策略合并到当前子项目，保留子项目定制
输出
- 同步清单、冲突提示与标识符替换报告

### /exp
定位
- 会话末尾的经验沉淀入口，把隐性知识转化为可复用资产；也可通过 `/exp review` 子命令做季度审计
输入
- 无显式参数，可附带提交范围；`/exp review` 触发跨季度审计
流程
- 首次运行自动初始化 `.claude/docs/experience/YYYY-MM/` 与 `review-reports/` 目录(子项目模式额外创建 `feedback-to-framework.md` 与 `.claude/PROJECT.md`)
- 通过 `.framework-sync.json` 检测当前是 framework 还是 subproject 模式，写入 `.claude/exp.config.json`
- 读取最近 1-3 条 `*-exp-summary.md` 做去重，避免重复识别相同候选
- 扫描最近会话消息与 `git log`，抽取可复用模式
- 识别现有技能的漏洞并生成补强建议
- 评估经验资产健康度（过时 / 冗余 / 孤岛 / 腐化）
输出
- 沉淀建议清单，指引更新 Skills / Memory / CLAUDE.md
- 摘要写入 `.claude/docs/experience/YYYY-MM/YYYY-MM-DD-exp-summary.md`(每次必写)
- 子项目模式下通用经验追加到 `.claude/docs/experience/feedback-to-framework.md` 等待反哺
- 连续 2 次跳过的候选自动追加到 `.claude/exp.ignore` 永久跳过列表

## 钩子系统
### 钩子注册方式
- 钩子在 `.claude/settings.json` 中注册
- `UserPromptSubmit` 触发技能评估流程
- `PreToolUse` 仅匹配 `Bash` 与 `Write` 工具
- `Stop` 在 Claude 输出结束时执行收尾逻辑

### UserPromptSubmit - `skill-forced-eval.js`
机制
- 从 stdin 读取用户输入，识别恢复会话并跳过评估
- 对以 `/` 开头的命令输入跳过评估，避免干扰命令执行
- 注入强制技能评估指令，要求逐个调用 Skill 工具
要点
- 明确列出可用技能清单，包含 task-tracker 与 workflow-engine
- 规定评估、激活、实现三步流程，禁止并行调用
输出
- 通过 stdout 输出强制评估文本，进入下一步执行

### PreToolUse - `pre-tool-use.js`
机制
- 对 `Bash` 命令进行危险模式识别并阻止
- 拦截 `> nul` 等错误重定向，避免 Windows 生成 `nul` 文件
- 对 `Write` 写入敏感文件时给出提醒
要点
- 阻止 `rm -rf /`、`drop database`、`git push --force` 等高风险命令
- 对 `npm publish`、`docker system prune` 等敏感操作给出警告
- 命令阻止使用 `decision: block` 与 `reason` 输出说明

### Stop - `stop.js`
机制
- 汇总 `git diff`、已暂存与未跟踪文件，生成变更提示
- 递归清理误创建的 `nul` 文件（限制深度并排除 `node_modules`）
- 根据系统播放 `.claude/audio/completed.wav` 完成提示音
要点
- macOS 使用 `afplay`，Windows 使用 PowerShell 播放，Linux 使用 `aplay` 或 `paplay`
- 变更统计以 `systemMessage` 输出，便于后续动作

## 最佳实践
- 先用 `/start` 识别项目阶段，再决定 `/dev` 或 `/crud`
- 新功能开发优先使用 `/dev`，避免遗漏菜单、字典与生成配置
- 已有表且仅需标准 CRUD 时使用 `/crud` 提升速度
- 每次开发前阅读现有模块代码，避免风格偏移
- 严格遵守 `plus.ruoyi` 包名与四层架构约束
- Service 实现类不继承基类，DAO 必须包含 `buildQueryWrapper()`
- 对象转换统一使用 `MapstructUtils`，避免 `BeanUtil`
- 前端页面必须使用 AForm、AModal 等封装组件
- 移动端必须使用 WD UI 组件与 `@/wd` 的 Composables
- API 路径与方法名需包含实体名，确保全局唯一
- 每次提交前运行 `/check`，提前暴露规范问题
- 使用 `/add-todo` 记录任务，避免临时口头约定
- 频繁更新时使用 `/update-status`，阶段性整理用 `/sync`
- 技能评估必须完整执行，严禁跳过 Skill 激活步骤
- 遇到性能与 Bug 问题时分别使用 performance-doctor 与 bug-detective
- 任务复杂且需跨会话时使用 task-tracker 记录上下文

## 实战案例
### 案例一：商城优惠券管理新功能
场景
- 需要新增业务模块，包含菜单、字典与完整 CRUD
使用命令
- `/start` 获取项目状态
- `/dev` 进入新功能开发流程
触发技能
- crud-development、database-ops、api-development
关键步骤
1. 输入功能名与模块 `mall`，自动推断表前缀与包名
2. 检查数据库是否已有表，避免重复开发
3. 生成表结构、菜单与字典配置并一次确认
4. 执行配置 SQL 并提示前端字典同步
示例对话
```
用户: /dev
用户: 功能名称 优惠券管理，模块 mall
Claude: 输出配置方案与建表 SQL，确认后自动生成配置
```
产出
- 新增菜单、字典与生成配置，前端 API 与类型定义同步

### 案例二：已有表快速生成标准 CRUD
场景
- 数据库已有 `b_feedback` 表，需要快速生成 CRUD
使用命令
- `/crud`
触发技能
- crud-development、database-ops
关键步骤
1. 输入表名并读取 `application-dev.yml` 获取连接配置
2. 自动解析表结构并确认模板类型
3. 输出 CRUD 代码生成结果与接口清单
示例对话
```
用户: /crud
用户: 表名 b_feedback，模板 crud
Claude: 输出表结构分析与生成结果
```
产出
- 标准 CRUD 后端与前端代码、菜单 SQL 与接口路径

### 案例三：文档初始化与持续同步
场景
- 项目已有代码但缺少管理文档，需要统一状态
使用命令
- `/init-docs` 扫描模式
- `/add-todo` 添加待办
- `/update-status` 增量更新
- `/sync` 全量同步
触发技能
- task-tracker、project-navigator、code-patterns
关键步骤
1. 扫描业务模块与页面生成初始文档
2. 添加待办任务并同步到项目状态
3. 日常使用 `/update-status` 保持三文档联动
4. 阶段性使用 `/sync` 做一致性核对
示例对话
```
用户: /init-docs
用户: 选择扫描现有代码模式
Claude: 输出项目状态、需求与待办文档
```
产出
- `docs/项目状态.md`、`docs/需求文档.md`、`docs/待办清单.md`


