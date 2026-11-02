# AGENTS.md - next-ai-astro 项目开发规范

> 本文件须控制在 30 KB 以内：Codex 默认只注入项目 AGENTS.md 的前 32 KiB，超出部分静默截断。
> 代码模板、细分规范放进对应技能（`.agents/skills/`），这里只留规则与索引。
> 本文件与 `CLAUDE.md` 规则一致；技能索引表由 `pnpm agents:sync` 生成。

## 对话语言
在此代码库中工作时必须使用简体中文与用户对话。

## 项目定位

**next-ai-astro** 是 AI 驱动的 Astro 内容站框架（作品目录、分类导航、文章、产品展示、个人品牌站）。
三个立场：**默认零 JS**（只有需要状态的区域才做 island）、**SEO/GEO 优先**（每页字段统一输出并在构建后校验）、**数据驱动**（内容集合是唯一数据源）。

## 🔴 文件编码与注释

- 所有源码与配置 UTF-8（无 BOM）；中文不许乱码；批量改文件后抽查文件头无 `EF BB BF`
- PowerShell 读中文文件用 `Get-Content -Encoding UTF8`，先设 `[Console]::OutputEncoding = [Text.Encoding]::UTF8`
- `.ts` / `.tsx` / `.mjs` 首行 `// 中文描述`；`.astro` frontmatter 首行 `// 中文描述`
- 注释写「为什么」，不写提交溯源；功能与注释改动分开提交

## 术语

| 术语 | 含义 | 位置 |
|------|------|------|
| 内容集合 | 站点的「数据库表」 | `src/content.config.ts` |
| 作品 / 分类 / 文章 | 三种示例内容类型 | `src/data/works.json`、`src/data/categories.json`、`src/content/posts/` |
| island | 需要水合的 React 组件 | `src/components/islands/` |
| 数据源 | 构建前拉外部接口写 JSON | `scripts/sync/sources/*.mjs` |
| 站点配置 | 域名 / 站名 / 品牌色 / 导航的唯一真相源 | `src/site.config.ts` |
| 真相源 | 需求 / 原型 / 任务台账 | `docs/需求文档.md`、`docs/prototypes/`、`docs/tasks/active/` |

## MCP 工具

| 触发 | 工具 | 用途 |
|------|------|------|
| Astro API、官方写法 | `context7` | 写 Astro API 前先查 `/withastro/docs` |
| 截图、界面验收 | `aicoder` 内置浏览器 | UI 截图闭环 |
| 原型、SEO 审计 | `ai-workstation` | route → get_skill → 执行 |
| 推送、建仓 | `sigil` | 不跑本地 `git push` / `fetch` / `pull` |
| 部署 | `reeve` | 先只读探测，dry-run 后经用户确认再部署 |

端口：dev `http://localhost:4321/`、preview / E2E `http://localhost:4329/`（一律写 localhost，本机 127.0.0.1 连不上）。时区：东八区，裸 `date '+%Y-%m-%dT%H:%M:%S%:z'`，禁止 `TZ=Asia/Shanghai date` 与硬编码 `+08:00`。

## 🔴 Astro 7 版本红线

基于 **Astro 7 + Vite 8 + Zod 4 + Tailwind v4 + React 19**。以下旧写法全部失效：

| 旧写法（禁止） | 当前写法 |
|---------------|---------|
| `src/content/config.ts` | `src/content.config.ts` |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` |
| `type: 'content'` / `'data'` | `loader: glob()` / `file()`（`astro/loaders`） |
| `z.string().email()` / `.url()` | `z.email()` / `z.url({ protocol: /^https?$/ })`（裸 `z.url()` 放行 `javascript:`） |
| `entry.slug` / `entry.render()` | `entry.id` / `render(entry)` |
| `getEntryBySlug()` | `getEntry()` |
| `Astro.glob()` | `import.meta.glob(..., { eager: true })` |
| `<ViewTransitions />` | `<ClientRouter />`（本框架默认 CSS 跨文档过渡） |
| island 里调 `getImage()` | 只能服务端调，结果当 props 传入 |

另：Rust 编译器对未闭合标签直接报错；Markdown 默认 Sätteri 管线（remark/rehype 插件需 `@astrojs/markdown-remark` 并把处理器配置回 unified）；`src/fetch.ts` 是保留文件名；本框架已设 `compressHTML: true`。

## 🔴 技能系统（最高优先级）

技能在 `.agents/skills/<name>/SKILL.md`（由 `pnpm agents:sync` 从 `.claude/` 生成，**不要手改 `.agents/`**）。
Claude Code 的斜杠命令在这里是「命令型技能」：用户输入 `/命令名` 时读对应 SKILL.md 执行。
Codex 没有 `/loop` 自动续期：自主连续开发用 `autonomous-dev` 技能，每次触发做一轮。

**流程**：评估匹配的技能 → 用 Read 读完所有匹配技能的 SKILL.md → 再执行任何命令或修改。

<!-- skills:start -->
<!-- 由 pnpm agents:sync 生成，勿手改 -->
| 技能 | 触发条件 |
|------|---------|
| `brainstorm` | 头脑风暴/方案设计/创意/怎么做/有什么办法/页面该怎么设计/网站该有哪些栏目/如何实现/探索 |
| `tech-decision` | 技术选型/方案对比/选哪个库/要不要上SSR/Astro还是Next/搜索方案选型/部署平台选型/CMS选型/引入依赖/哪个好 |
| `writing-plans` | 写计划/制定计划/实施计划/拆解任务/任务拆解/把方案落地/详细步骤/可执行计划/开发计划/计划文档 |
| `task-tracker` | 任务跟踪/创建任务/记录进度/继续任务/恢复上下文/多步骤开发/进度管理/任务归档/记录问题/查看任务 |
| `project-init` | 新项目/创建项目/初始化项目/开新项目/孵化/基于框架创建/new project/新建站点/新建项目 |
| `vitepress-migration` | VitePress/迁移/迁站/文档站迁移/.vitepress/::: tip/cleanUrls/逐页比对/compare-baseline/known-diffs/切换上线 |
| `project-navigator` | 项目结构/文件在哪/定位/目录说明/这个功能在哪/找文件/参考代码/已有组件/代码位置/哪个文件 |
| `architecture-design` | 架构/目录划分/分层/重构/信息架构/栏目结构/URL结构/页面层级/模块划分/代码组织 |
| `code-patterns` | 规范/禁止/命名/写法/代码风格/首行注释/提交规范/Git提交/导入顺序/不允许 |
| `astro-routing` | 路由/页面/动态路由/getStaticPaths/分页/paginate/重定向/trailingSlash/404/端点/生成txt或xml/URL结构 |
| `content-collections` | 内容集合/content.config/schema/zod/字段/getCollection/getEntry/reference/新增内容类型/Markdown文章/frontmatter/metrics |
| `guides-docs` | 使用指南/文档站/教程/帮助中心/guides/MDX/侧栏目录/多层侧栏/本页内容/上一篇下一篇/手机预览/步骤条/提示框/站内搜索/Ctrl K |
| `docs-site` | docs 模块/文档站骨架/DocsLayout/docs.json/面包屑/侧栏吸顶/brand.css/站点地图分档/IndexNow/llms.txt/营销页/文档站上线 |
| `data-sync` | 数据同步/下载页/版本数据/安装包/更新日志/versions.json/拉取接口/抓数据/外部API/B站/bilibili/GitHub API/RSS/定时更新数据/scripts/sync/数据源/防风控 |
| `islands-interaction` | 交互/React组件/island/client:load/client:visible/筛选/状态/水合/hydration/nanostores/useState/URL同步 |
| `ui-components` | 组件/按钮/卡片/布局/样式/Tailwind/响应式/移动端适配/断点/Container/Section/Badge |
| `design-system` | 设计系统/配色/主题/深色模式/暗色/品牌色/设计令牌/字体/间距/好看/高级感/去AI味/视觉风格 |
| `motion-transitions` | 动效/动画/过渡/View Transitions/ClientRouter/页面切换/hover效果/滚动动画/减少动态效果/形变/transition:persist/prefers-reduced-motion |
| `image-optimization` | 图片/封面/astro:assets/getImage/Image组件/WebP/AVIF/远程图片/防盗链/懒加载/og图/分享图 |
| `site-search` | 搜索/站内搜索/Pagefind/检索/全文搜索/搜索框/中文搜索/全站搜索/搜不到/相关度/MiniSearch/Fuse |
| `icon-management` | 图标/icon/lucide/SVG图标/favicon/网站图标/品牌图标/GitHub图标/B站图标/加图标/换图标 |
| `i18n-development` | 国际化/多语言/i18n/英文版/语言切换/hreflang/多语言路由/双语/locale/currentLocale/getRelativeLocaleUrl/多语言SEO |
| `html-to-code` | HTML转代码/原型转代码/设计稿转页面/HTML转Astro/原型还原/Tailwind原型转组件/区块转换/组件转换/html-to-code |
| `seo-meta` | SEO/meta/title/description/canonical/og/Open Graph/结构化数据/JSON-LD/VideoObject/sitemap/收录/搜索排名 |
| `geo-optimization` | GEO/AI搜索/llms.txt/AI爬虫/robots/被AI引用/FAQ/AEO/LLMO/ChatGPT搜索/Perplexity/GPTBot |
| `analytics` | 统计/访问量/Umami/百度统计/GA/Google Analytics/埋点/PV/UV/事件追踪/隐私/cookie |
| `bug-detective` | Bug/报错/异常/不工作/白屏/构建失败/样式不生效/水合失败/页面空白/404了/排查/定位问题 |
| `test-development` | 单元测试/Vitest/测试用例/写测试/断言/覆盖率/参数化测试/Container API/测试失败 |
| `e2e-test` | E2E/端到端测试/浏览器测试/截图验收/回归测试/冒烟测试/UI测试/跑一遍/测一遍/Playwright/aicoder浏览器 |
| `performance-doctor` | 性能/Lighthouse/Core Web Vitals/LCP/CLS/INP/加载慢/包体积/JS太大/首屏/卡顿/预取 |
| `security-guard` | 安全/CSP/安全头/XSS/HSTS/依赖漏洞/pnpm audit/外链安全/rel=noopener/iframe/密钥泄漏 |
| `dev-startup` | 本地启动/首次启动/跑起来/装环境/装依赖/pnpm install/Node版本/端口占用/启动失败/pnpm dev |
| `env-config` | 环境变量/.env/import.meta.env/PUBLIC_/多环境/site.config/域名配置/站点配置/astro:env/staging/预发布 |
| `deployment-guide` | 部署/上线/发布/Docker/nginx/CDN/Cloudflare Pages/Reeve/域名/HTTPS/备案/静态托管 |
| `git-workflow` | Git/提交/commit/分支/合并/推送/push/建仓/Sigil/冲突/回滚/提交规范 |
| `framework-sync` | 框架同步/upstream/同步框架/拉取框架更新/合并上游/同步上游/.framework-sync.json/框架升级 |
| `delivery-sync` | 交付/交付物/交付副本/客户版本/对外版本/剥离技能/移除技能体系/deliver/干净副本/同步交付 |
| `module-strip` | 裁剪/模块裁剪/删除示例/去掉示例页/清空示例/精简框架/strip/不要文章模块/不要作品模块 |
| `exp-sediment` | 沉淀经验/经验沉淀/总结会话/记下来/记录经验/新增禁令/避免再踩坑/以前怎么处理/之前踩过/有没有遇到过//exp |
| `add-skill` | 添加技能/创建技能/新技能/技能开发/写技能/技能文档/修改技能/更新技能/删除技能/重命名技能/同步技能 |
| `collaborating-with-codex` | 仅当用户点名"Codex"时（未点名的代码审查、多模型不算）—— Codex/codex协同/委托给Codex/codex review/codex rescue/codex-plugin-cc/review-gate/codex_bridge |
| `collaborating-with-gemini` | 仅当用户点名"Gemini"时（未点名的 UI 设计、前端原型不算）—— Gemini/gemini协同/委托给Gemini/gemini CLI/gemini_bridge |
| `collaborating-with-antigravity` | 仅当用户点名"Antigravity / 反重力 / agy"时（未点名的多模型、交叉验证不算）—— Antigravity/反重力/agy/agy协同/委托给Antigravity/agy CLI |
| `doc-writer` | 写文档/新建文档/添加文档/写一篇文档 |
| `component-doc` | 写组件文档/WD组件/组件文档/wd 文档 |
| `doc-review` | 审查文档/检查文档质量/文档review/文档审查 |
| `doc-search` | 哪些文档提到/查找文档/文档里搜/引用分析 |
| `doc-stats` | 文档统计/覆盖率/文档状态/文档健康 |
| `update-docs` | 更新文档/同步文档/文档是否需要更新/源码更新了 |
| `changelog-gen` | 生成更新日志/changelog/版本记录/更新记录 |
| `version-migrate` | 版本升级/升级指南/版本变更/框架升级文档 |
| `sidebar-manager` | 更新侧边栏/添加到侧栏/添加到导航/调整菜单/侧边栏/侧栏/孤立页 |
| `link-checker` | 检查链接/死链/链接检查/锚点失效/broken link |
| `preview-server` | 预览/启动预览/本地预览/看一下页面/截图页面/dev server/preview |
| `sync-products` | 同步产品/添加产品/更新产品/产品引流/sync products |
| `edgeone-deploy` | 开始部署/部署文档站/发布文档站/上线文档站/EdgeOne |
| `autonomous-dev` | 自主开发/连续开发/一轮一提交（Codex 版自主循环方法论） |

**命令型技能**（Claude Code 斜杠命令的 Codex 版，用户输入 `/命令名` 时读对应 SKILL.md）：

| 命令 | 用途 |
|------|------|
| `/add-todo` | 快速添加待办事项到 docs/待办清单.md（缺失时按模板创建），并联动项目状态 |
| `/check-links` | 全站死链与失效锚点检查（构建后跑 check:seo 与 check-anchors），可加 --fix 修复 |
| `/check` | 框架规范检查：对照 CLAUDE.md「绝对禁止的写法」「强制使用框架封装」「Astro 7 版本红线」逐项 grep 核对 |
| `/collection` | 新增一种内容类型端到端：schema → 数据 → 同步源 → 查询封装 → 列表 / 详情 / 分类页 → llms.txt 与导航 → 验证门 |
| `/deploy` | 部署向导：上线前检查 → 本地镜像验证 → Reeve 只读探测 → 配部署目标 → dry-run → 用户确认 → deploy_run → 线上核对 |
| `/dev-loop` | 自主循环的一轮标准作业（配合 /loop /dev-loop）：按台账做一个最小可提交单元，编排既有命令与技能 |
| `/dev-orchestrate` | 智码多会话编排版自主开发：本会话当总控，按批派子会话跑 /dev-loop（一批几条相邻任务），按验收方式另开异构验收 |
| `/dev` | 开发一个页面或功能：读参考代码 → 列文件清单与方案（唯一一次确认）→ 实现 → 验证门 → 规范提交 |
| `/exp` | 经验沉淀：把会话与最近提交里的踩坑、纠正、重复模式沉淀到技能 / CLAUDE.md / 经验文档，并写本次摘要 |
| `/framework-sync` | 把 next-ai-astro 框架仓库的更新选择性同步到当前孵化项目：逐提交分类分析，用户确认后合并 |
| `/init-docs` | 初始化项目文档（需求 / 项目状态 / 待办 + 台账目录）：空白模板 / 扫描代码 / 基于描述，另有只出需求的 --req-only |
| `/kickoff` | 从一句话想法到自主循环开发：联网调研出需求 → 工作站出原型 → 孵化新项目 → 起飞 |
| `/loop-gen` | 按你的当次意图，现生成一条填好真相源 / 每轮动作 / 验证门 / 停止条件的 /loop 提示词 |
| `/next` | 综合 git、任务台账、待办、需求与代码待办，推荐一个最优下一步和备选方向（只读） |
| `/progress` | 项目进度报告：综合 git、任务台账、待办、需求、页面与内容规模、站点健康，输出结构化的只读快照 |
| `/review` | 审查文档质量：对照源码查准确性、规范性、完整性 |
| `/seo-check` | 上线前 SEO / GEO 验收：本地构建 + check:seo 逐页校验，再按需调工作站 ai-seo-studio 深度审计，输出问题清单与修复建议 |
| `/sidebar` | 管理侧栏 src/data/sidebar.json：添加 / 移除 / 重排条目，或检查侧栏与文件是否一致 |
| `/start` | 新会话快速了解项目：识别是框架仓库还是孵化出的子项目，给出现状概览与对应的工作流入口 |
| `/stats` | 文档覆盖率统计与健康报告（页数、行数、过短页、孤立页、过期页） |
| `/strip-modules` | 裁剪不需要的示例模块（作品目录 / 文章 / FAQ / 示例数据），作用于当前项目或交付目录，裁剪后验证 |
| `/sync-data` | 运行数据同步：先 dry-run 核对条目数，再写入并检查 git diff 与构建，异常时不提交 |
| `/sync-delivery` | 把当前项目镜像到同级「交付目录」：去掉 git 历史、AI 技能体系与内部协作文档，生成可交给客户的版本 |
| `/update-status` | 从任务台账 + git 提交 + 代码扫描汇总，联动更新项目状态 / 待办清单 / 需求文档三文档（缺失时按模板创建） |
| `/wd` | 写 WD UI 移动端组件文档（读组件源码，按组件模板生成） |
| `/write` | 按项目规范新写一篇文档（含 frontmatter、挂侧栏、验证） |
<!-- skills:end -->

## 🔴 多会话并发避让（L1/L2/L3）

- **L1 启动时**：`git status -s` + `git branch --show-current`，与本任务无关的未提交文件视为他者占用区，不改、不 stash、不 checkout、不 reset
- **L2 改文件前**：`git log -1 --format="%ar|%s" <file>`；15 分钟内有改动且在未提交清单里 → 能绕开就静默绕开，必须改才问用户一次
- **L3 提交前**：`git diff --cached --name-only` 对照本会话改动；逐个 `git add <文件>`，禁止 `git add -A` / `git add .`
- 禁令：`git stash` / `reset --hard` / `checkout <file>` / `clean -fd` / 切分支 / 按名字杀进程 / 删非本会话的任务文档

## ⚠️ 页面开发强制要求

**先读参考代码 → 了解现有组件与工具函数 → 按相同风格编写。**

> 孵化项目：`.claude/PROJECT.md` 有「参考代码位置（覆盖 CLAUDE.md）」表时以那张表为准（裁剪 / 改造模块后下表部分路径已不存在）。

| 开发类型 | 参考文件 |
|---------|---------|
| 列表页 + 交互筛选 | `src/pages/works/index.astro` + `src/components/islands/WorksExplorer.tsx` |
| 详情页 | `src/pages/works/[id].astro` |
| 分类落地页 | `src/pages/works/category/[id].astro` |
| Markdown 文章 | `src/pages/posts/[...id].astro` |
| 卡片（静态 / island 两用） | `src/components/works/WorkCard.tsx` |
| 集合查询封装 | `src/lib/works.ts`、`src/lib/posts.ts` |
| SEO | `src/components/seo/SEOHead.astro` + `src/lib/seo.ts` |
| 数据源 | `scripts/sync/sources/example.mjs` |

必须用：`BaseLayout`（页面骨架）、`Container`（宽度留白）、`Section`（区块标题）、`Button`、`Badge`、`Breadcrumbs` + `breadcrumbJsonLd`（同一数组）、`@lucide/astro` / `lucide-react`、`src/lib/<集合>.ts` 查询封装、`src/lib/format.ts`、`resolveCover()`。

## 核心架构

- `output: 'static'`；`trailingSlash: 'always'`（站内链接一律带结尾斜杠）
- 页面只调 `src/lib/*.ts`；站点级常量只在 `src/site.config.ts`
- 样式用语义令牌：`bg-canvas` `bg-surface` `bg-elevated` `text-ink` `text-muted` `border-line` `bg-brand` `bg-brand-soft` `bg-brand-strong` `text-brand-ink`
- 交互默认 `.astro`；需要状态才做 island，优先 `client:visible` / `client:idle`
- 所有页面经 `BaseLayout` → `SEOHead`；每页 title / description 不同
- 框架核心文件见 `.claude/framework-config.json`：在框架仓库本身（无 `.framework-sync.json`）里正常开发；在孵化项目里尽量不改，确需改（含追加导出）单独提交、scope 写 `framework`，不计业务进度

## 🚫 绝对禁止

| 错误做法 | 正确做法 |
|---------|---------|
| canonical 写死 `site.url` / 页面里再写 og:url | 只由 `SEOHead` 按当前路径输出 |
| 多页共用 description | 每页单独写 |
| `set:html={JSON.stringify(x)}` 输出 JSON-LD | `serializeJsonLd(x)` |
| 标注页面不可见的 FAQ | 只标注可见问答 |
| 站内链接缺结尾斜杠 | 用 `workPath()` 等生成 |
| `text-gray-500` / 硬编码色值 | 语义令牌 |
| `text-brand` 做文字 | `text-brand-ink`；主按钮 `bg-brand-strong` |
| 整页写成 island / island 里取构建期数据 | 页面 `.astro`，数据服务端取好当 props |
| 空格分词的搜索库直接搜中文 | `src/lib/search.ts` 或 Pagefind |
| 同步失败写空数组 | 走 `scripts/sync/run.mjs` |
| 外链图片直接进 `<img>` | 域名加 `site.imageDomains`，构建期转存 |
| 图片缺 alt 或宽高 | 装饰图 `alt=""`；宽高必填 |
| 中文标题 `text-balance` | `text-pretty` |
| 引入中文 webfont | 系统字体栈 |
| 编造数据、案例、数字 | 真实数据源；不确定标「待确认」 |

### Shell 禁止项

- `> nul`（Windows 会生成 nul 文件）→ `> /dev/null 2>&1`
- 内联长脚本（`python - <<'PY'`、`node -e "多行"`）→ 写成文件再执行
- `/tmp` 当中转目录 → scratchpad 绝对路径 / 项目内 `logs/`
- `grep -r` 不限定目录 → 限定到 `src` 并加 `--include`
- PowerShell 给 `pnpm` / `node` 加 `2>&1` → 不加

## 验证门（提交前必须全绿）

`pnpm build`（含 astro check）+ `pnpm check:seo` + `pnpm test`，一键 `pnpm verify`；UI 任务再加截图闭环（桌面 + 390px 手机宽度，与原型逐条比对）。
提交与进度口径：只有 `feat(scope)` / `fix(scope)` 计入业务进度（scope 为 framework / strip / data / deps 除外）；数据变更 `chore(data)`、裁剪 `refactor(strip)`、台账与三文档 `docs(tasks)`。

## 协作约定（与 CLAUDE.md 同名章节一致）

- 任务台账：编号全局唯一 `T<数字>`，任务行 `- [ ] T12 标题`；只有「## 🎯 实现步骤」区块里的 `- [ ] T<数字>` 行算任务；字段 `需求: REQ-00x`、`读写: 写入/只读`、`里程碑:`、`文件:`、`验证:`、`提交:`（只读任务写 `无`）
- 阻塞记录 `docs/BLOCKERS.md`：`- [ ] [可逆/需决策] 日期 T12 内容 → 默认做法 / 待谁决定`；编排子会话遇「需决策」写一行后收尾报 `ORCH-RESULT status=blocked`
- 编排完成判据：台账该条 `[x]` 且写入类任务有新提交；只读任务要求 `ORCH-RESULT status=done` 并标注 `读写: 只读`
- 孵化项目有 `.claude/PROJECT.md` 时，会话开始先读它（项目专属禁令，优先级高于本文件）
- 同一目录不要并行跑两个 `astro build` / `astro sync`；并行开发用 worktree，dev server 错开端口

## 项目结构速查

```
src/site.config.ts · src/content.config.ts · src/data/ · src/content/posts/
src/layouts/BaseLayout.astro · src/components/{seo,layout,ui,works,islands}/
src/lib/{seo,search,format,images,works,posts}.ts · src/pages/ · src/styles/global.css
scripts/sync/{run,context}.mjs + sources/ · scripts/check-seo.mjs
docs/{需求文档.md,prototypes/,tasks/active/} · deploy/nginx/ · Dockerfile
```
