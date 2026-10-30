# AI 使用指南（一页纸）

next-ai-astro 自带一套 AI 开发体系：**20 个斜杠命令 + 40 个技能 + 2 个子代理 + 3 份文档模板 + hooks**，Claude Code 与 Codex 双端可用。
这页只讲「怎么用」；规则细节以根目录 `CLAUDE.md`（Claude Code）/ `AGENTS.md`（Codex）为准。

---

## 一、怎么开始

| 你现在的情况 | 输入 |
|------------|------|
| 只有一个想法，要从零做一个新站 | 在**框架目录**里：`/kickoff 做一个 B 站视频归类站，按合集和标签整理我的全部投稿` |
| 已经有一个孵化出来的项目，想知道现状 | 在**项目目录**里：`/start` |
| 不知道下一步做什么 | `/next` |

`/kickoff` 的完整链路：联网调研出需求（🚦你确认）→ AI 工作站出原型（🚦你确认）→ 问你写到哪个目录并孵化新项目 → 自主循环开发 → `/seo-check` → `/deploy`。详见 `.claude/docs/新项目开发流程.md`。

---

## 二、20 个命令

| 命令 | 一句话用途 | 典型用法 |
|------|-----------|---------|
| `/kickoff` | 一句话想法 → 需求 → 原型 → 孵化 → 起飞 | `/kickoff 做一个个人作品集站` |
| `/start` | 新会话快速了解项目现状（框架 / 孵化项目自动识别） | `/start` |
| `/init-docs` | 初始化需求 / 项目状态 / 待办三文档；`--req-only` 只出需求文档 | `/init-docs 做一个产品展示站` |
| `/dev` | 开发一个页面或功能（读参考 → 方案确认一次 → 实现 → 验证门 → 提交） | `/dev 作品详情页加上一篇 / 下一篇导航` |
| `/collection` | 新增一种内容类型：schema → 数据 → 同步源 → 列表 / 详情 / 分类页 | `/collection videos 视频` |
| `/dev-loop` | 自主循环的一轮：按台账做一个最小可提交任务 | `/loop /dev-loop`、单步 `/dev-loop T12` |
| `/dev-orchestrate` | 智码里的多会话编排：总控派实现子会话 + 异构验收 | `/dev-orchestrate`、`/dev-orchestrate M2` |
| `/loop-gen` | 按当次意图现生成一条 `/loop` 提示词（还原原型、清警告、补测试…） | `/loop-gen 把 check:seo 的警告一条条清干净` |
| `/check` | 源码规范检查（22 项 grep 核对） | `/check`、`/check src/pages/videos`、`/check --staged` |
| `/seo-check` | 上线前 SEO / GEO 验收：脚本校验 + 人工清单 + 工作站审计 | `/seo-check --local`、`/seo-check https://域名` |
| `/sync-data` | 运行数据同步：先 dry-run 核对，再写入、核对 diff 与构建 | `/sync-data`、`/sync-data videos` |
| `/deploy` | 部署向导：本地镜像验证 → Reeve 探测 → 部署目标 → dry-run → 确认 → 部署 | `/deploy <服务器别名>` |
| `/progress` | 全面的只读进度报告 | `/progress` |
| `/update-status` | 把台账 + git 汇总进三文档（按 `需求:` 回写需求状态） | `/update-status` |
| `/next` | 推荐一个最优下一步 + 备选方向（只读） | `/next` |
| `/add-todo` | 快速记一条待办 | `/add-todo 首页加热门视频区块，优先级高` |
| `/exp` | 把会话与近期提交里的踩坑、纠正沉淀下来 | `/exp`、`/exp review` |
| `/framework-sync` | 把框架仓库的更新选择性合并到孵化项目 | `/framework-sync --status` |
| `/sync-delivery` | 生成给客户的交付副本（去掉 git 历史、AI 体系、内部文档） | `/sync-delivery --first-time` |
| `/strip-modules` | 裁剪不需要的示例模块（works / posts / faq / examples） | `/strip-modules posts faq --preview` |

另有两个子代理：`code-reviewer`（只读审查，可在两段 review 的第一段调用）、`project-manager`（维护三文档）。

---

## 三、40 个技能（按分组）

技能不用记名字：每次提问时 hook 会把技能清单注入给 AI，AI 按关键词自己评估、激活。下面只帮你知道「有什么」。

**流程与规划（8）**
- `brainstorm`：还不知道怎么做时发散方案（栏目、页面、数据来源、要不要交互）
- `tech-decision`：技术选型对比（渲染模式、搜索、托管、CMS、统计…）
- `writing-plans`：把需求拆成带 `T<编号>` 的细颗粒任务台账
- `task-tracker`：跨会话任务跟踪（台账容器格式）
- `project-init`：基于框架孵化新项目
- `project-navigator`：文件在哪、改一件事要动哪些地方
- `architecture-design`：信息架构、URL 层级、代码分层
- `code-patterns`：编码规范与禁令速查

**Astro 开发（12）**
- `astro-routing`：页面、动态路由、分页、生成型端点、重定向与 404
- `content-collections`：内容集合、Zod 4 schema、查询封装、新增内容类型
- `data-sync`：从外部接口拉数据写成集合 JSON（重试、缓存、防风控）
- `islands-interaction`：什么时候真的需要 island、`client:*` 怎么选
- `ui-components`：BaseLayout / Container / Section / Button / Badge / WorkCard 等组件用法
- `design-system`：设计令牌、配色、深色模式
- `motion-transitions`：零 JS 的跨文档视图过渡与动效
- `image-optimization`：`astro:assets`、`resolveCover()`、远程图片与 og 图
- `site-search`：站内搜索（内置子串匹配 / Pagefind）
- `icon-management`：lucide 图标（`.astro` 与 island 两套同源）
- `i18n-development`：多语言站点
- `html-to-code`：把工作站原型转成符合规范的 `.astro` 页面与组件

**SEO / GEO / 统计（3）**
- `seo-meta`：SEOHead、`src/lib/seo.ts`、`check-seo` 三件套
- `geo-optimization`：让 AI 搜索抓到并引用本站（llms.txt、AI 爬虫、FAQ）
- `analytics`：访问统计（Umami / 百度统计），只在生产构建注入

**质量（5）**
- `bug-detective`：构建失败、显示异常、水合失败、数据同步失败等排查
- `test-development`：Vitest 单测（`src/lib` 纯函数）
- `e2e-test`：智码浏览器截图验收 + Playwright 冒烟
- `performance-doctor`：Core Web Vitals 诊断与优化
- `security-guard`：安全响应头、CSP、外链安全

**环境与发布（7）**
- `dev-startup`：本地环境与启动（Node ≥ 22.12、pnpm 10）
- `env-config`：`site.config.ts` / `.env` / `astro.config.ts` 的分工
- `deployment-guide`：部署模型（Reeve 部署目标、Docker / 只传 dist / 托管平台）、HTTPS、回滚
- `git-workflow`：提交规范、远程操作走 Sigil
- `framework-sync`：框架更新合并到孵化项目
- `delivery-sync`：交付副本脚本
- `module-strip`：示例模块裁剪脚本与预设

**经验与协作（5）**
- `exp-sediment`：经验沉淀方法（`/exp` 的执行指南）
- `add-skill`：新增 / 修改技能的流程
- `collaborating-with-codex` / `collaborating-with-gemini` / `collaborating-with-antigravity`：**只有你点名**对应 CLI 时才委托给它

---

## 四、自主循环：两种起飞方式

| 方式 | 适合 | 怎么起 |
|------|------|-------|
| `/loop /dev-loop` | 任何环境；台账较小（< 5 条）或以样式微调为主 | 在项目目录新开会话输入 `/loop /dev-loop`；只做某个里程碑：`/loop /dev-loop M2` |
| `/dev-orchestrate` | 在【智码 AICoder】里，台账 ≥ 5 条或含 UI 还原 / 数据源对接 | 在智码里输入 `/dev-orchestrate`，本会话当总控，每条任务派新鲜子会话，另开 Codex 会话验收 |

两种方式每一轮做的事相同：
1. 没有台账时，第 0 轮按需求 + 原型拆出 `docs/tasks/active/` 台账（`- [ ] T12 标题`，编号全局唯一）
2. 每轮只做一个 `T` 任务 → 验证门（`pnpm build` + `pnpm check:seo` + `pnpm test`，UI 任务加截图比对原型）→ 两段 review → 规范提交
3. 可逆的小决定记进 `docs/BLOCKERS.md` 继续做；需要你拍板的事记 `[需决策]` 后停下问你
4. 里程碑时 `/update-status` 汇总三文档；全部 `[x]` 后自动停

Codex 没有 `/loop` 自动续期：用 `autonomous-dev` 技能，每次触发做一轮。

---

## 五、常见问题

**自主循环总弹权限确认，跑不起来？**
Claude Code 默认每条命令都要你点确认。两种办法：
- 用项目根的 `cc.bat` 启动 Claude Code（`cx.bat` 对应 Codex），它以跳过权限确认的方式启动——只在你信任当前任务时用；项目禁令由 `CLAUDE.md` 与 hooks 继续兜底
- 或者在 `.claude/settings.json` 的 `permissions` 放行清单里加上常用的本地命令（pnpm、只读 git 等），保留其余命令的确认

**在 Codex 里怎么用？**
Codex 读 `AGENTS.md`，技能在 `.agents/skills/`（由 `pnpm agents:sync` 从 `.claude/` 生成，不要手改）。Claude Code 的斜杠命令在 Codex 里是「命令型技能」：输入 `/命令名` 即可；`/framework-sync` 因与同名技能冲突，镜像名是 `cmd-framework-sync`。自主开发用 `autonomous-dev` 技能。

**hook 是什么？会不会拦我？**
hook 是 Claude Code / Codex 在特定时机自动运行的脚本，不需要你操作：
- 提问时（UserPromptSubmit）：注入技能清单，让 AI 先评估该用哪些技能；斜杠命令、恢复会话、智码唤醒事件不注入
- 执行命令前（PreToolUse）：拦截已知会出事的写法，拦截范围见 `CLAUDE.md`「Bash/Shell 禁止项」
- 回答结束时（Stop）：清理 Windows 下误建的 `nul` 文件
- Codex 会话启动时（SessionStart）：自动加载最近一份经验摘要

**进度为什么没涨？**
进度只数 `feat(scope)` / `fix(scope)` 提交（scope 为 framework / strip / data / deps 除外），台账只数「实现步骤」里的 `T<编号>` 任务行。提交类型写错（比如功能写成 `refactor`）就统计不到。完整口径见 `CLAUDE.md`「🔴 协作约定」。

**浏览器打不开本地页面？**
地址一律写 `localhost`（`http://localhost:4321/` 开发、`http://localhost:4329/` 预览），本机 127.0.0.1 连不上。原型等本地文件用 `file:///E:/...` 打开。

**框架目录和孵化出的项目有什么区别？**
框架目录（`package.json` name 为 `next-ai-astro`、没有 `.framework-sync.json`）是只读模板，保留全部示例，用来孵化新项目和演进框架本身。孵化出的项目有 `.framework-sync.json` 和 `.claude/PROJECT.md`，业务开发在这里做；尽量不改框架核心文件，确需改就单独提交、scope 写 `framework`。
