# CLAUDE.md - next-ai-astro 项目

## 语言设置
**必须使用中文**与用户对话。

## 项目定位

**next-ai-astro** 是 AI 驱动的 Astro 内容站框架：作品目录、分类导航、文章、产品展示、个人品牌站这类「内容为主、交互为辅」的站点。
三个默认立场：**默认零 JS**（只有真正需要状态的区域才做 island）、**SEO/GEO 优先**（每页字段由框架统一输出并在构建后校验）、**数据驱动**（内容集合是单一数据源）。

框架本身是一个可直接运行的示例站；新项目用 `/kickoff` 或 `project-init` 从这里孵化出去。

---

## 🔴 文件编码与注释规范（必须遵守）

- **所有源码与配置文件统一 UTF-8（无 BOM）**，含 `.astro` `.ts` `.tsx` `.mjs` `.cjs` `.json` `.css` `.md`；禁止 BOM / GBK / ANSI 混用
- 中文注释、日志、文档必须可读，不允许乱码；批量改文件后抽查文件头字节，确认没有 `EF BB BF`
- **文件首行注释**：`.ts` / `.tsx` / `.mjs` 第一行 `// 中文描述`；`.astro` 在 frontmatter 第一行写 `// 中文描述`（纯展示小组件可省）
- 保留已有业务注释；新增代码写清「为什么这样做」，不写空泛注释；导出函数注释含用途 / 参数 / 返回 / 边界
- 🔴 注释里不写提交溯源（「来自 commit xxx」「同步上游 xxx」），出处归 commit message 管
- 功能改动与注释改动分开提交，便于回溯

---

## 术语约定

| 术语 | 含义 | 对应位置 |
|------|------|---------|
| **内容集合** | Astro Content Collections，站点的「数据库表」 | `src/content.config.ts` |
| **作品 / 条目** | 列表 + 详情 + 分类形态的主体内容（视频、项目、产品…） | 集合 `works`，数据 `src/data/works.json` |
| **分类** | 手工维护的分类体系，每个分类有独立落地页 | 集合 `categories`，`/works/category/<id>/` |
| **文章** | Markdown 长文，GEO 的主要承载体 | 集合 `posts`，`src/content/posts/*.md` |
| **指南** | 使用指南 / 帮助中心：MDX 正文 + 三栏布局 + 站内搜索，分组顺序固定（guides-docs 技能） | 集合 `guides`，`src/content/guides/*.mdx`，分组 `src/lib/guide-sections.ts` |
| **island** | 需要在浏览器里运行的 React 组件，用 `client:*` 指令水合 | `src/components/islands/` |
| **数据源** | 构建前从外部接口拉数据写入集合 JSON 的模块 | `scripts/sync/sources/*.mjs` |
| **站点配置** | 站名、域名、品牌色、导航等全站唯一真相源 | `src/site.config.ts` |
| **真相源** | 每轮开发必读的文档：需求 / 原型 / 任务台账 | `docs/需求文档.md`、`docs/prototypes/`、`docs/tasks/active/` |
| **验证门** | 提交前必须全绿的检查 | `pnpm build` + `pnpm check:seo` + `pnpm test` |

## MCP 工具触发

| 触发词 | 工具 | 用途 |
|-------|------|------|
| 最佳实践、官方文档、标准写法、Astro API | `context7` | 🔴 **用到框架里还没出现过的 Astro API（新的 loader / 指令 / 配置项 / 虚拟模块导出）前先查** `/withastro/docs`；照抄仓库里已有写法、纯 HTML、Zod 基本类型不必查 |
| 截图、看页面、界面验收、打开页面 | `aicoder` 内置浏览器 | `browser_open` → `browser_screenshot`，UI 截图闭环用它；原型等本地文件可直接传 `file:///E:/...` 或本地绝对路径 |
| 用工作站、原型、UI 设计、SEO 审计、关键词 | `ai-workstation` | route → get_skill → 执行（原型走 ai-ui-studio，审计走 ai-seo-studio） |
| 推送、建仓、远程 Git | `sigil` | 凭据不落地；**不跑本地 `git push`** |
| 部署、服务器、上线 | `reeve` | 受控部署，先只读探测再动手 |

### 端口约定

| 用途 | 端口 | 命令 |
|------|------|------|
| 开发服务器 | 4321（Astro 默认，被占用时自动顺延） | `pnpm dev` → `http://localhost:4321/` |
| 预览构建产物 / E2E | 4329（`E2E_PORT` 可覆盖） | `pnpm preview --port 4329` → `http://localhost:4329/`；派生站都用 4329，撞端口时 e2e 前置校验会直接报出来 |

> 🔴 地址一律写 `localhost`，不写 `127.0.0.1`：本机 `localhost` 解析到 IPv6 `::1`，Astro 默认只监听它，访问 127.0.0.1 会被拒绝连接。
> 使用浏览器工具前如果不确定端口，先看 dev server 的启动输出，不要猜。
> 起 dev server 前先看端口上是否已有本会话起过的服务（`netstat -ano | findstr :4321`），有就复用，不要每轮新起一个。

### 时区约定

**所有日期时间使用东八区（UTC+8）**。系统时区即东八区，直接用裸 `date`：

```bash
date '+%Y-%m-%dT%H:%M:%S%:z'   # 结构化数据(JSON) → 2026-09-25T23:10:00+08:00
date '+%Y-%m-%d %H:%M'         # 可读时间(文档/任务卡)
```

🔴 禁止 `TZ=Asia/Shanghai date`（Git Bash 无 zoneinfo，退化成 UTC）、禁止硬编码 `+08:00`、禁止 `date -u -d '+8 hours'`。
页面里展示日期统一用 `src/lib/format.ts` 的 `formatDate()`（已固定 `Asia/Shanghai`）。

---

## 🔴 Astro 7 版本红线（AI 最容易写错的地方）

本框架基于 **Astro 7 + Vite 8 + Zod 4 + Tailwind v4 + React 19**。训练数据大多是 Astro 4/5 时代的写法，以下全部**已失效**：

| 旧写法（禁止） | 当前写法 |
|---------------|---------|
| `src/content/config.ts` | `src/content.config.ts` |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` |
| `type: 'content'` / `type: 'data'` | `loader: glob({...})` / `loader: file('...')`（`astro/loaders`） |
| `z.string().email()` / `.url()`（Zod 3） | `z.email()` / `z.url({ protocol: /^https?$/ })`（Zod 4 顶层函数；🔴 裸 `z.url()` 放行 `javascript:`） |
| `entry.slug` | `entry.id` |
| `entry.render()` | `render(entry)`（从 `astro:content` 导入） |
| `getEntryBySlug()` / `getDataEntryById()` | `getEntry()` |
| `Astro.glob()` | `import.meta.glob(..., { eager: true })` |
| `<ViewTransitions />` | `<ClientRouter />`（本框架默认用 CSS 跨文档过渡，见 `motion-transitions`） |
| `getStaticPaths` 里用 `Astro` 对象 / 返回数字 params | 用 `import.meta.env.SITE`；params 一律字符串 |
| `experimental.fonts` / `experimental.csp` | 已转正：fonts 配置、`security.csp` |
| 在 island / 客户端调 `getImage()` | 只能在服务端调，结果当 props 传给 island |
| `@astrojs/react` 的 `babel` 选项 | 已移除（v7 改用 Oxc） |

另外四条 Astro 7 行为变化：
- **Rust 编译器严格校验 HTML**：未闭合标签直接报错，非法嵌套不再自动修正
- **Markdown 默认走 Sätteri 管线**：要用 remark/rehype 插件需装 `@astrojs/markdown-remark`，并按 v7 升级指南把 markdown 处理器配置回 unified
- **`src/fetch.ts` 是保留文件名**（高级路由），不要用这个名字放业务代码
- 本框架已显式设置 `compressHTML: true`：Astro 7 默认的 `'jsx'` 模式会删掉行内元素间空格，中英混排会粘词

> 不确定时先查 `context7`（`/withastro/docs`），别凭记忆写。

---

## 🔴 Skills 强制评估（必须遵守）

> **每次用户提问时，UserPromptSubmit Hook 会注入技能评估提示（以 `## 强制技能激活流程` 开头）。必须严格遵循！**

**流程**：
1. **评估**：根据注入的技能列表，列出匹配的技能及理由（无匹配则写"无匹配技能"）
2. **激活**：对每个匹配的技能调用 `Skill(技能名)`
3. **实现**：激活完成后开始实现

**Skills 位置**：`.claude/skills/[skill-name]/SKILL.md`（共 42 个专业技能）

---

## 🔴 经验沉淀目录加载（会话开始时）

**会话开始（首次响应用户）前**，若 `.claude/docs/experience/` 存在内容，必须执行：

> SessionStart hook（`.claude/hooks/session-start.cjs`）会在启动、`/clear`、压缩后自动注入 `.claude/PROJECT.md` 与最近一份经验摘要。
> 上下文里**已经有**「最近一次经验沉淀摘要」段时不必再手动读取；没有（hook 被禁用、注入只给了出处、或用的是其他客户端）时按下面执行。
> 注入段末尾出现「…（已截断，完整内容见 <文件>）」时，开工前读一遍该文件的完整内容（注入上限约 9,500 字符，长 PROJECT.md 的后半段会被截掉）。

```bash
ls -t .claude/docs/experience/*/*-exp-summary.md 2>/dev/null | head -1
```

若有输出 → 读取这一份最近的摘要文件，作为本次会话的经验上下文（已沉淀的禁令、踩过的坑、待观察事项）。读完即可，不必复述给用户。

**例外**：用户首条消息是简单问候或与本项目无关的纯通用问题，可跳过。

---

## 🔴 多会话并发自动避让协议（L1/L2/L3 三层触发）

> 用户可能同时开多个 AI 会话。本会话必须**自动感知并避让**其他会话的工作，**默认静默执行，不打扰用户**。
> 设计原则：宁可绕路，绝不覆盖；宁可静默放弃，绝不擅自 stash / reset / checkout。

### L1 — 启动时探测（首次响应前，仅执行一次）

```bash
git status -s
git branch --show-current
```

- 把「未提交文件清单」和「当前分支」记入会话上下文，整个会话复用，不向用户复述
- 清单非空且与本次任务无关 → 视为「他者占用区」，**不修改、不 stash、不 checkout、不 reset** 这些文件
- 清单非空且与本次任务相关（用户接续之前的工作）→ 当作己方未完成工作正常处理
- **编排子会话例外**：首条输入带 `[ORCH:<总控会话id>]` 标记（由 `/dev-orchestrate` 派出）→ 与本任务相关的未提交改动视为同一编排的上游产出

### L2 — 修改文件前（单文件粒度）

修改任意已存在文件**之前**，执行 `git log -1 --format="%ar|%s" <file>`：

| 条件 | 处置 |
|------|------|
| 距今 ≥ 15 分钟 | 自由修改 |
| 距今 < 15 分钟 + 文件**不在** L1 未提交清单 | 自由修改（已提交的近期改动不冲突） |
| 距今 < 15 分钟 + 文件**在** L1 未提交清单 + 可绕开 | **静默换路径绕开**，不告知用户 |
| 距今 < 15 分钟 + 文件**在** L1 未提交清单 + 必须改同文件 | **唯一允许打扰用户一次**：「`<file>` 15min 内有未提交改动，疑似其他会话占用，是否继续？」 |

### L3 — 提交前（强校验，必做）

- `git diff --cached --name-only` 对照本会话改过的文件清单；越界文件静默 `git restore --staged <file>`
- 逐个 `git add <具体文件>`，**禁止** `git add -A` / `git add .`

### 跨会话操作禁令

| 禁令 | 原因 |
|------|------|
| `git stash` / `git reset --hard` / `git checkout <file>` / `git clean -fd` | 会丢其他会话的未提交改动 |
| `git checkout <branch>`（切分支） | 除非用户明确指示 |
| `git add -A` / `git add .` | 可能误提交他者文件 |
| 按名字杀进程 / kill 不属于本会话启动的端口 | 他者 dev server 可能在用；停自己的服务用 `npx kill-port <端口>` |
| 删除 `docs/tasks/active/` 下非本会话任务文档 | 同上 |

---

## ⚠️ 页面开发强制要求（最高优先级）

**开发前必须：先读参考代码 → 了解现有组件与工具函数 → 按相同风格编写**

### 参考代码位置

> 🔴 孵化项目：`.claude/PROJECT.md` 有「参考代码位置（覆盖 CLAUDE.md）」表时**以那张表为准**——裁剪或改造模块后，下表部分路径已不存在（`pnpm check:skills` 会点名是哪个模块的）。

| 开发类型 | 参考文件 |
|---------|---------|
| **列表页 + 交互筛选** | `src/pages/works/index.astro` + `src/components/islands/WorksExplorer.tsx` |
| **详情页（动态路由）** | `src/pages/works/[id].astro` |
| **分类落地页（纯静态）** | `src/pages/works/category/[id].astro` |
| **Markdown 文章** | `src/pages/posts/[...id].astro` |
| **文档页（MDX + 三栏 + 搜索）** | `src/pages/guide/[...id].astro` + `src/layouts/GuideLayout.astro` + `src/components/docs/` |
| **首页区块组合** | `src/pages/index.astro` |
| **卡片（静态/island 两用）** | `src/components/works/WorkCard.tsx` |
| **集合查询封装** | `src/lib/works.ts`、`src/lib/posts.ts`、`src/lib/guides.ts` |
| **SEO / 结构化数据** | `src/components/seo/SEOHead.astro` + `src/lib/seo.ts` |
| **数据同步源** | `scripts/sync/sources/example.mjs` |
| **生成型端点** | `src/pages/llms.txt.ts`、`src/pages/robots.txt.ts` |

### 强制使用框架封装

| 场景 | 必须用 | 禁止 |
|------|-------|------|
| 页面骨架 | `BaseLayout`（传 title / description / jsonLd） | 页面里自己写 `<html>` `<head>` |
| 页面宽度与留白 | `Container`（`size="narrow"` 用于正文） | 各页自写 `max-w-* mx-auto px-*` |
| 区块标题 | `Section` | 各页自写 h2 + 间距 |
| 按钮 | `Button`（primary / secondary / ghost） | 裸 `<a class="bg-brand ...">` |
| 标签 | `Badge` | 自写 pill 样式 |
| 面包屑 | `Breadcrumbs` + `breadcrumbJsonLd(crumbs)`（同一个数组） | 两处各写一份 |
| 图标 | `.astro` 用 `@lucide/astro`，island 用 `lucide-react` | 复制粘贴 SVG、装其他图标库 |
| 集合查询 | `src/lib/<集合>.ts` 里的封装函数 | 页面里直接 `getCollection` 再各自排序 |
| 日期 / 数字展示 | `src/lib/format.ts` | `toLocaleString()` 等各写各的 |
| 远程图片 | `resolveCover()` / `getImage()`（服务端） | 直接把外链塞进 `<img>` |

---

## 核心架构（必须牢记）

| 项目 | 规范 |
|------|------|
| **输出模式** | `output: 'static'`，纯静态站；需要服务端能力时先走 `tech-decision` |
| **URL** | `trailingSlash: 'always'`，站内链接一律带结尾斜杠（`/works/`、`/works/a/`） |
| **数据** | 内容集合是唯一数据源；页面只调 `src/lib/*.ts` 的查询封装 |
| **站点级常量** | 只在 `src/site.config.ts`：域名、站名、品牌色、导航、图片白名单、统计 |
| **样式** | Tailwind v4 + 语义令牌（`bg-canvas` `text-ink` `text-muted` `border-line` `bg-brand` `text-brand-ink`），令牌定义在 `src/styles/global.css` |
| **交互** | 默认 `.astro` 静态组件；需要状态才做 island，且优先 `client:visible` / `client:idle` |
| **SEO** | 所有页面经 `BaseLayout` → `SEOHead`，每页 title / description 必须不同 |
| **构建后校验** | `pnpm check:seo` 扫描 `dist/` 抓静默错误，不过不许提交 |

### 目录结构

```
src/
├── site.config.ts          # 站点唯一配置（孵化时只改这里）
├── content.config.ts       # 内容集合定义（= 数据库表）
├── data/                   # 集合的 JSON 数据（works / categories / faq）
├── content/posts/          # Markdown 文章
├── layouts/BaseLayout.astro
├── components/
│   ├── seo/                # SEOHead（框架核心）
│   ├── layout/             # 页头 / 页脚 / 主题 / 统计（框架核心）
│   ├── ui/                 # Container / Section / Button / Badge / Breadcrumbs
│   ├── works/              # 业务组件（按业务分目录）
│   └── islands/            # React island（只放需要水合的组件）
├── lib/                    # 纯函数与集合查询（seo / search / format / images / works / posts）
├── pages/                  # 文件即路由；*.txt.ts 是生成型端点
└── styles/global.css       # Tailwind 入口 + 设计令牌
scripts/
├── sync/                   # 数据同步：run.mjs 运行器 + context.mjs + sources/
└── check-seo.mjs           # 构建后 SEO/GEO 校验
docs/                       # 需求文档 / 原型 / 任务台账（真相源）
deploy/nginx/               # 容器内 nginx 配置
```

### 框架核心 vs 业务代码

`.claude/framework-config.json` 列出了**框架核心文件**（SEO 组件、布局、令牌、校验脚本、同步运行器等）。规则按所在仓库区分：

| 所在仓库 | 判定 | 改框架核心文件时 |
|---------|------|-----------------|
| **框架仓库本身** | `package.json` 的 name 为 `next-ai-astro` 且没有 `.framework-sync.json` | 这就是框架演进，正常开发、正常 `feat/fix(scope)` 提交 |
| **孵化出的项目** | 有 `.framework-sync.json` | 尽量不改。确需改（含在核心文件里**追加**导出、改一行）→ 单独一个提交，scope 固定写 `framework`（如 `feat(framework): seo.ts 新增 eventJsonLd`），方便 `/framework-sync` 识别、也便于反馈回框架；该提交不计入业务进度 |

新建文件（在 `src/components/<业务>/`、`src/lib/<业务>.ts` 等处）不算改核心，按业务提交。

### 项目专属规则

孵化出的项目由 `project-init` 生成 `.claude/PROJECT.md`（本项目的专属禁令、与框架的差异）。**若该文件存在，会话开始时与经验摘要一并读取**，其优先级高于本文件的通用规则。

---

## 绝对禁止的写法

| 项目 | 错误做法 | 正确做法 |
|------|---------|---------|
| **canonical** | 写死成 `site.url`（全站指向首页） | 交给 `SEOHead`，它用当前页路径生成 |
| **description** | 多页共用同一条 | 每页单独写，列表/分类页带上数量或分类名 |
| **og:url / canonical** | 页面里再手写一份 | 只由 `SEOHead` 输出，恰好各 1 个 |
| **JSON-LD** | `set:html={JSON.stringify(x)}` | `serializeJsonLd(x)`（转义 `<`） |
| **FAQ 结构化数据** | 标注页面上不可见的问答 | 只标注页面真实展示的问答 |
| **站内链接** | `/works/a`（缺结尾斜杠） | `/works/a/`，用 `workPath()` 等函数生成 |
| **颜色** | `text-gray-500`、`#ff5d2e` 硬编码 | 语义令牌 `text-muted`、`text-brand-ink` |
| **品牌色做文字** | `text-brand`（白底对比度约 3:1） | `text-brand-ink`；主按钮用 `bg-brand-strong` |
| **整页 island** | 把整页写成一个 React 组件 | 页面用 `.astro`，只把有状态的区块做成 island |
| **island 里取数** | 在 React 组件里 `fetch` 构建期就能拿到的数据 | 服务端取好，当 props 传入 |
| **中文检索** | 按空格分词的搜索库直接用于中文 | `src/lib/search.ts` 子串匹配，或 Pagefind |
| **数据同步** | 接口失败时写入空数组 | 走 `scripts/sync/run.mjs`（失败保留上一版） |
| **远程图片** | 外链直接进 `<img>`（防盗链 / 不可控） | 域名加进 `site.imageDomains`，构建期转存 |
| **图片** | 缺 `alt` 或缺 `width`/`height` | 装饰图 `alt=""`，内容图写描述；宽高必填 |
| **标题排版** | 中文标题用 `text-balance`（会拆词） | `text-pretty` |
| **字体** | 引入中文 webfont | 系统字体栈（`--font-sans`） |
| **ID 进 URL** | id 含空格、中文、斜杠 | 只用 `[A-Za-z0-9_-]`（schema 已校验） |
| **捏造内容** | 编造播放量、案例、客户、数字 | 数据来自真实数据源；不确定标「待确认」 |

### ⚠️ Bash/Shell 禁止项（最常犯错误！）

```bash
# ❌ > nul（Windows 会创建名为 nul 的文件）      ✅ > /dev/null 2>&1
# ❌ TZ=Asia/Shanghai date / 硬编码 +08:00       ✅ 裸 date '+%Y-%m-%dT%H:%M:%S%:z'
# ❌ python - <<'PY' / node -e "多行" / cat > x.mjs <<'JS'（内联长脚本）
# ✅ Write 工具落成真文件（scratchpad 或 logs/）再执行
# ❌ 拿 /tmp 当中转目录（Git Bash 与原生程序理解的不是同一处）
# ✅ scratchpad 绝对路径 / 项目内 logs/ / $TEMP
# ❌ grep -r 不限定目录（扫进 node_modules / dist 满屏乱码 + 超时）
# ✅ grep -rn "xxx" src --include=*.astro
```

```powershell
# ❌ PowerShell 里给 pnpm / node / npx 加 2>&1（stderr 被逐行包成 NativeCommandError）
# ✅ 不加，工具本身已捕获 stderr；要合并流用 cmd /c "... 2>&1"
```

> 以上全部由 `.claude/hooks/pre-tool-use.cjs` 兜底：`> nul`、内联长脚本、`/tmp`、`TZ=Asia/Shanghai date` 直接拦截；PowerShell 的 `2>&1` 自动摘掉。
> 同一个 hook 还拦截：指向 https / ssh 远程的 `git push/fetch/pull/clone/ls-remote` 与 `git credential fill`（远程操作只走 Sigil；remote 是本机目录时放行，如孵化项目的 upstream 指向框架目录）、`git add -A` / `git add .`、`git stash`、`git reset --hard`、`git clean -f`、按名字杀 node / pwsh / powershell 进程。

---

## 验证门（提交前必须全绿）

| 检查 | 命令 | 抓什么 |
|------|------|-------|
| 类型 + 构建 | `pnpm build`（= `astro check && astro build`） | 类型错误、集合 schema 不符、HTML 不合法 |
| SEO / GEO | `pnpm check:seo` | canonical / og:url / 描述重复 / JSON-LD / alt / robots / llms.txt |
| 单元测试 | `pnpm test` | `src/lib` 纯函数回归 |
| UI 任务额外 | 截图闭环（见 `e2e-test` 技能） | 与原型逐条比对 7 项 |

一键：`pnpm verify`（build + check:seo + test）。改了技能 / 命令 / hooks 再加 `pnpm agents:sync && pnpm check:skills`。

---

## 🔴 协作约定（任务台账 / 提交 / 进度口径）

所有命令、技能、子代理统一按下表执行，冲突时以这里为准。

### 任务台账（`docs/tasks/active/*.md`）

- 任务编号**全局唯一**：`T1`、`T2`…跨文件递增（新建台账时先扫已有最大编号），编号写在任务行里：`- [ ] T12 分类落地页支持分页`
- **只有「## 🎯 实现步骤」区块里以 `- [ ] T<数字>` 开头的行才是任务**；其他区块（待决策事项、验收清单等）的复选框不参与「选下一个任务」「全部完成」的判断与进度统计
- 每条任务下方用缩进列表写字段：`需求: REQ-003`（关联需求编号，完成时据此回写需求状态）、`读写: 写入|只读`、`里程碑: M1`（可选）、`文件:`、`验证:`、`提交: feat(works): …`（只读任务写 `提交: 无`）
- 单步参数（`/dev-loop T12`、编排派单）一律用 `T<编号>`

### 提交与进度口径

| 类型 | 用途 | 计入业务进度 |
|------|------|:-----------:|
| `feat(scope)` / `fix(scope)` | 功能与修复 | ✅（scope 为 `framework` / `strip` / `data` / `deps` 时除外） |
| `refactor` `perf` `style` `test` `docs` `chore` `ci` `build` | 其余一切 | ❌ |

- 数据同步产生的数据变更提交 `chore(data): …`；裁剪模块提交 `refactor(strip): …`；任务台账、三文档更新提交 `docs(tasks): …`
- `/progress`、`/update-status`、`/next` 统计进度时只数上表打 ✅ 的提交

### 阻塞记录（`docs/BLOCKERS.md`）

格式：`- [ ] [可逆|需决策] YYYY-MM-DD T12 内容 → 采用的默认做法 / 需要谁决定什么`，处理完勾成 `[x]`。
- 可逆的：按合理默认继续做，记一行，不空等
- 需决策的（不可逆 / 合规 / 缺凭据 / 架构级）：单会话停下问人；**编排子会话**写一行后结束本轮，收尾行报 `ORCH-RESULT status=blocked`

### 编排完成判据（`/dev-orchestrate`）

某任务算完成 = 台账里该条已 `[x]`，并且：写入类任务在基线之后有新提交（类型按上表）；只读任务则要求收尾行 `ORCH-RESULT status=done` 且任务标注 `读写: 只读`。

---

## 并行开发：worktree

预计 30 分钟以上同时改**不同模块**时，用 `claude --worktree <名字>` 让每个会话在独立目录和分支上工作（3~5 个并行为宜）。
注意 worktree 隔离不了端口：每个 worktree 的 dev server 用不同端口（`pnpm dev --port 4331`…）；`.astro/` 内容缓存按目录隔离，不会互相污染。
同一目录里**不要并行跑两个 `astro build` / `astro sync`**（会搅乱内容缓存，动态路由页面整批丢失）。

---

## 快速命令

| 命令 | 用途 |
|------|------|
| `/kickoff` | 一句话想法 → 调研需求 → 工作站出原型 → 孵化新项目 → 起飞自主循环 |
| `/dev` | 开发一个新页面 / 功能（读参考 → 方案 → 实现 → 验证门） |
| `/collection` | 新增一种内容类型：schema + 数据 + 同步源 + 列表 / 详情 / 分类页 |
| `/dev-loop` | 自主循环的一轮标准作业（配合 `/loop /dev-loop`） |
| `/dev-orchestrate` | 智码里的多会话编排版自主开发 |
| `/loop-gen` | 按当次意图现生成一条 `/loop` 提示词 |
| `/check` | 框架规范检查 |
| `/seo-check` | 上线前 SEO / GEO 验收（本地校验 + 工作站审计） |
| `/sync-data` | 运行数据同步并核对变化 |
| `/deploy` | 构建镜像并部署（经 Reeve） |
| `/init-docs` | 初始化需求 / 状态 / 待办文档 |
| `/progress` `/update-status` `/next` `/add-todo` | 进度查看、三文档汇总、下一步建议、快速记待办 |
| `/start` | 新会话快速了解项目现状 |
| `/exp` | 经验沉淀 |
| `/framework-sync` `/sync-delivery` `/strip-modules` | 框架同步、交付副本、裁剪示例 |

---

## 🔴 开发前检查清单

- [ ] **已读参考代码**：对照上方「参考代码位置」找到同类页面
- [ ] **已查 Astro 7 写法**：涉及集合 / 路由 / 图片 / 过渡的 API 已对照「版本红线」或 context7
- [ ] **已确认数据来源**：内容来自集合；新数据先改 `content.config.ts` 再写页面
- [ ] **已确认是否需要 island**：没有状态就用 `.astro`
- [ ] **SEO 字段已规划**：title / description 每页不同；需要的 JSON-LD 已想好
- [ ] **不违反禁止项**：对照「绝对禁止的写法」
- [ ] **验证门可跑**：`pnpm verify` 全绿再提交；commit 按「协作约定」的类型与 scope
