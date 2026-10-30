---
name: project-navigator
description: 项目结构导航：先判断框架仓库还是孵化项目，再索引页面、组件、lib 函数、数据与配置，速查「改一件事要动哪些文件」。触发词：项目结构、文件在哪、定位、目录说明、这个功能在哪、找文件、参考代码、已有组件、代码位置、哪个文件
---

# 项目导航（project-navigator）

## 何时使用

- 不知道文件在哪里、某个功能的代码在哪
- 想了解项目目录结构与每个目录的职责
- 开发前找参考代码、找已有的组件与工具函数
- 判断当前目录是框架模板还是孵化出来的项目
- 想知道「改 X 需要动哪几个文件」

其他常见说法：目录、在哪里、已有组件。

## 第一步：判断当前在哪个仓库（必须先做）

```bash
ls .framework-sync.json .claude/PROJECT.md 2>/dev/null; grep -m1 '"name"' package.json; ls astro.config.* src/site.config.ts 2>/dev/null; git log --oneline -1
```

按顺序判定：

| 特征 | 身份 | 含义 |
|------|------|------|
| 有 `.framework-sync.json` | **孵化出来的项目** | 业务在这里开发；框架核心文件尽量不改，确需改就单独提交、scope 写 `framework`（见 CLAUDE.md「框架核心 vs 业务代码」） |
| 没有 `.framework-sync.json`，且 `package.json` 的 name 为 `next-ai-astro` | **框架仓库本身** | 核心文件就是开发对象，正常开发；示例数据是演示用的，改动会影响所有之后孵化的项目 |
| 有 `.claude/PROJECT.md` | 项目事实与专属禁令 | 开发前先读，优先级高于 CLAUDE.md |
| 以上都不是（没有 `astro.config.*` / `src/site.config.ts`） | **不是本框架体系的项目** | 🔴 不要套用本技能下面的路径；改用 Glob / Grep 现场探索，或问用户项目在哪 |

> 用户问的是**别的项目**（不是当前工作目录）时，同样不要拿本技能的路径去猜——先确认那个项目的根目录，再按上表判定。
> 孵化项目可能用 `module-strip` 裁掉了部分模块（`.framework-sync.json` 的 `strippedModules`），下面索引里的文件**以实际存在为准**，找不到先 `ls` 核对，别凭索引断言。

---

## 目录总览

```
.
├── astro.config.ts          # 构建行为：site、trailingSlash、compressHTML、集成、图片域名
├── package.json             # 脚本见下方「可用脚本」
├── tsconfig.json            # 路径别名 @/* → src/*
├── vitest.config.ts         # 单测（复用 Astro 的 Vite 配置）
├── playwright.config.ts     # E2E（desktop + mobile 两个 project，预览端口 4329，channel: chromium）
├── Dockerfile / docker-compose.yml / deploy/nginx/   # 部署（compose 的 image / container_name = 项目标识）
├── cc.bat / cx.bat          # 在本项目里免确认启动 Claude Code / Codex（自主循环用；hook 仍然生效）
├── .framework-sync.json     # 仅孵化项目有：孵化来源与同步记录
├── src/
│   ├── site.config.ts       # ★ 站点唯一配置
│   ├── content.config.ts    # ★ 内容集合（= 数据库表）
│   ├── data/                # 集合 JSON 数据 + faq.json + ai-crawlers.json
│   ├── content/posts/       # Markdown 文章
│   ├── layouts/             # BaseLayout（全站唯一 HTML 骨架）
│   ├── components/          # seo / layout / ui / works / islands
│   ├── lib/                 # 纯函数与集合查询
│   ├── pages/               # 文件即路由
│   └── styles/global.css    # Tailwind 入口 + 设计令牌
├── public/                  # 原样复制的静态资源（favicon、og 图、示例封面）
├── scripts/
│   ├── check-seo.mjs        # 构建后 SEO/GEO 校验
│   ├── sync/                # 数据同步：run.mjs + context.mjs + sources/*.mjs
│   ├── validate-skills.mjs  # 技能体系一致性校验（pnpm check:skills）
│   └── sync-agents-skills.mjs  # 生成 Codex 技能镜像（pnpm agents:sync）
├── tests/unit/ tests/e2e/   # Vitest / Playwright
├── docs/                    # 真相源：需求文档、原型、任务台账、测试计划与报告、BLOCKERS
└── .claude/ .codex/ .agents/ # AI 技能体系（技能、命令、hook；孵化项目另有 PROJECT.md）
```

### 可用脚本（`package.json`）

| 脚本 | 作用 |
|------|------|
| `pnpm dev` | 开发服务器，`http://localhost:4321/` |
| `pnpm build` / `pnpm build:fast` | `astro check && astro build` / 只构建不做类型检查 |
| `pnpm preview --port 4329` | 预览构建产物，`http://localhost:4329/` |
| `pnpm check` | 只跑 `astro check` |
| `pnpm verify` | build + check:seo + test（提交前验证门） |
| `pnpm check:seo` | 扫描 `dist/` 的 SEO/GEO 字段 |
| `pnpm sync [源名] [--dry-run]` | 数据同步 |
| `pnpm test` / `pnpm test:e2e` | Vitest / Playwright |
| `pnpm agents:sync` / `pnpm check:skills` | 技能镜像同步 / 技能体系校验 |
| `pnpm format` | Prettier |

脚本以实际 `package.json` 为准，快速列出：`node -e "console.log(Object.keys(require('./package.json').scripts).join('\n'))"`

---

## 资源索引

### 页面（`src/pages/`）

| URL | 文件 | 说明 |
|-----|------|------|
| `/` | `index.astro` | Hero + 精选 + 分类入口 + 最新文章 + FAQ（数据为空的区块不渲染） |
| `/works/` | `works/index.astro` | 列表页，挂 `WorksExplorer` island（`client:load`） |
| `/works/<id>/` | `works/[id].astro` | 作品详情，`getStaticPaths` 按集合生成 |
| `/works/category/<id>/` | `works/category/[id].astro` | 分类落地页，纯静态 |
| `/posts/` | `posts/index.astro` | 文章列表 |
| `/posts/<id>/` | `posts/[...id].astro` | 文章详情（`[...id]` 支持子目录） |
| `/about/` | `about.astro` | 关于 |
| `/404.html` | `404.astro` | noindex |
| `/robots.txt` | `robots.txt.ts` | 生成型端点：先 `User-agent: *`，再按 `src/data/ai-crawlers.json` 逐个输出 Allow / Disallow |
| `/llms.txt` | `llms.txt.ts` | 生成型端点，从集合生成 |
| `/sitemap-index.xml` | `@astrojs/sitemap` 自动生成 | 在 `astro.config.ts` 配置过滤 |

### 组件（`src/components/`）

| 目录 | 组件 | 用途 |
|------|------|------|
| `seo/` | `SEOHead.astro`（导出类型 `SEOProps`） | title / description / canonical / OG / Twitter / JSON-LD（经 BaseLayout 调用） |
| `layout/` | `SiteHeader` `SiteFooter` `ThemeScript` `ThemeToggle` `Analytics` | 页头页脚、暗色模式、统计 |
| `ui/` | `Container` `Section` `Button` `Badge` `Breadcrumbs` | 通用 UI，详见 `ui-components` 技能 |
| `works/` | `WorkCard.tsx`：导出 `WorkCard`（props `work` / `eager` / `priority` / `headingLevel`）、`coverTransitionName()`、类型 `WorkCardData` | 作品卡片（静态渲染与 island 两用）；`eager` = 不懒加载，`priority` = `fetchpriority=high`，每页只给一张 |
| `islands/` | `WorksExplorer.tsx` | 搜索 / 分类 / 标签 / 排序 / 加载更多，状态同步到 URL |

### 工具函数（`src/lib/`）

| 文件 | 导出 | 用途 |
|------|------|------|
| `seo.ts` | `buildTitle` `absoluteUrl` `truncate` `serializeJsonLd` `AI_CRAWLERS` `websiteJsonLd` `breadcrumbJsonLd` `faqJsonLd` `articleJsonLd`，类型 `JsonLd` `Crumb` `FaqItem` `CrawlerRule` `CrawlerPurpose` | SEO 纯函数（框架核心） |
| `works.ts` | `getWorks` `getCategories` `workPath` `categoryPath` `relatedWorks` `countByCategory` `toCardData` `toCardList`，类型 `Work` `Category` | works / categories 集合查询封装 |
| `posts.ts` | `getPosts`（排除草稿、按日期倒序） `postPath`，类型 `Post` | posts 集合查询封装 |
| `images.ts` | `resolveCover(src, width=640, height=360)` `isOptimizableRemote`，类型 `ResolvedImage` | 封面解析（服务端 `getImage`，框架核心） |
| `format.ts` | `formatDate` `isoDate` `formatCount` `formatDuration` | 东八区日期、万/亿、时长（框架核心） |
| `search.ts` | `normalize` `parseQuery` `scoreItem` `searchItems` | 中文友好的子串检索（框架核心） |

### 数据（`src/data/` 与 `src/content/`）

| 文件 | 集合 | 维护方式 |
|------|------|---------|
| `data/categories.json` | `categories` | 手工 |
| `data/works.json` | `works` | 手工或 `pnpm sync` 生成 |
| `data/faq.json` | 非集合，首页直接 import | 手工 |
| `data/ai-crawlers.json` | 非集合，robots 与 check-seo 共用 | 手工；每项 `{ name, purpose: search\|user\|training, allow }`（框架核心） |
| `content/posts/*.md` | `posts` | 手写 Markdown |

### 配置文件

| 想改什么 | 文件 |
|---------|------|
| 站名、域名、品牌色、导航、统计、备案号、远程图片域名 | `src/site.config.ts` |
| 集合字段、校验规则 | `src/content.config.ts` |
| 构建行为、集成、trailingSlash、CSP | `astro.config.ts` |
| 设计令牌（颜色、圆角、阴影、字体） | `src/styles/global.css` |
| 外部接口凭据 | `.env`（模板 `.env.example`） |
| 容器里的缓存与安全头 | `deploy/nginx/default.conf`、`deploy/nginx/security-headers.conf` |
| 镜像名、容器名、宿主端口 | `docker-compose.yml` |
| 项目专属禁令、与框架的差异（孵化项目） | `.claude/PROJECT.md` |

---

## 「改一件事要动哪些文件」速查

标 🧱 的是框架核心文件（`.claude/framework-config.json`）：在框架仓库里正常改；在孵化项目里改要单独提交、scope 写 `framework`。

| 需求 | 要动的文件 |
|------|-----------|
| 改站名 / 域名 / 主色 | 只改 `src/site.config.ts` |
| 作品加一个字段 | `content.config.ts`（schema）→ `data/works.json` / 同步源映射 → `components/works/WorkCard.tsx` 的 `WorkCardData` 类型 → `lib/works.ts` 的 `toCardData()` → 用到的页面 |
| 新增一种内容类型 | 用 `/collection` 命令（schema + 数据 + 查询封装 + 列表 / 详情 / 分类页 + llms.txt） |
| 接入外部数据源 | `scripts/sync/sources/<name>.mjs`（参照 `example.mjs`）+ `.env.example` 加变量 |
| 导航加栏目 | `site.config.ts` 的 `nav` + 新建对应页面 |
| 改卡片样式 | `components/works/WorkCard.tsx`（静态与列表两处同时生效） |
| 改筛选交互 | `components/islands/WorksExplorer.tsx` |
| 首页加区块 | `pages/index.astro`，用 `Section` 包裹 |
| 加结构化数据类型 | 🧱 `lib/seo.ts` 新增构造函数（孵化项目里也可放 `lib/<业务>.ts` 避免改核心）→ 页面通过 `jsonLd` 传给 `BaseLayout` |
| 增删 AI 爬虫 / 改允许策略（如拒绝训练类爬虫） | 🧱 `src/data/ai-crawlers.json`（robots 生成与 check-seo 校验共用；拒绝某个爬虫要写 `allow: false`，只从名单删掉等于继续放行） |
| 改缓存 / 安全头 | 🧱 `deploy/nginx/*.conf` |
| 开启 CSP | `astro.config.ts` 的 `security.csp`（见 `security-guard`） |

---

## 快速查找命令

🔴 永远限定目录 + 文件类型，不要让 `grep -r` 扫进 `node_modules/` 或 `dist/`：

```bash
grep -rn "resolveCover" src --include=*.astro --include=*.ts --include=*.tsx   # 谁在用某个函数
grep -rln "client:" src/pages                                              # 哪些页面挂了 island
grep -rn "getCollection(" src --include=*.astro --include=*.ts             # 集合查询点（应集中在 lib/）
ls src/components/*/                                                       # 组件清单
node -e "console.log(Object.keys(require('./package.json').scripts).join('\n'))"   # 可用脚本
```

也可以用 Glob / Grep 工具，同样限定到 `src/`、`scripts/`、`tests/`。

## 本项目文档位置

| 文档 | 路径 |
|------|------|
| 需求文档（只读输入） | `docs/需求文档.md` |
| 原型 | `docs/prototypes/<业务>/*.html` |
| 头脑风暴 / 选型记录 | `docs/brainstorm-*.md`、`docs/decisions/*.md` |
| 任务台账 | `docs/tasks/active/*.md`（任务行 `- [ ] T12 标题`，只认「实现步骤」区块） |
| 阻塞与待决策 | `docs/BLOCKERS.md` |
| 测试计划与报告 | `docs/tests/plans/`、`docs/tests/reports/` |
| 经验沉淀 | `.claude/docs/experience/` |
| 框架核心文件清单 | `.claude/framework-config.json` |
| 项目专属规则（孵化项目） | `.claude/PROJECT.md` |

## 检查清单

- [ ] 已判断当前是框架仓库、孵化项目，还是别的项目
- [ ] 找到了同类页面作为参考代码
- [ ] 确认要复用的组件 / 函数确实存在（孵化项目可能裁剪过），没有重复造
- [ ] 要改的文件是否是框架核心；孵化项目里改核心 → 单独提交、scope 写 `framework`

## 与相邻技能的边界

| 需求 | 技能 |
|------|------|
| 规划栏目、URL、分层 | `architecture-design` |
| 组件 props 与样式细节 | `ui-components` |
| 集合与 schema | `content-collections` |
| 路由与动态页 | `astro-routing` |
