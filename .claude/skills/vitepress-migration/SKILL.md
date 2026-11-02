---
name: vitepress-migration
description: VitePress 文档站迁到本框架：保住旧网址、小站转 MDX / 大站 .md 进 docs 模块、convert → 逐页比对、切换上线。触发词：VitePress、迁移、迁站、文档站迁移、.vitepress、::: tip、cleanUrls、逐页比对、compare-baseline、known-diffs、切换上线
---

# VitePress → Astro 迁移（next-ai-astro）

## 何时使用

- 把一个 VitePress 文档 / 官网迁到本框架（孵化新项目后搬内容）
- 评估某个 VitePress 站值不值得迁、要迁多久
- 迁完之后验收：旧链接、搜索收录、搜索功能有没有掉

## 概述

迁移的风险不在「页面能不能做出来」，而在**悄悄丢东西**：旧网址 404 掉搜索收录、站点验证文件没带走、
`::: tip` 被原样渲染成文字、Vue 组件在 Astro 里静默不显示、手写的 llms.txt 被删、本地搜索没了。
本技能按「盘点 → 定网址 → 搬内容 → 补能力 → 首页 → 验收」走，每一步都有能在构建产物里查出来的验收点。

先确认值不值得迁（见文末「什么时候不迁」）。迁的话先选路线（第 3 步）：**小站转 MDX 进使用指南模块**（guides-docs 技能），
**大站正文保持 .md 进 docs 模块**（docs-site 技能，迁移脚本 `scripts/migrate/` 随模块提供）。

> 实战参照：
> - 小站 MDX 路线：storyloom-docs（21 页）2026-10-30 试点，项目 `E:/my/桌面软件tauri/storyloom-docs`
> - 大站 .md 路线（docs 模块就是从这几次里收出来的）：ruoyi.plus（511 页，2026-10-30 起，preserve 网址、每栏目一棵侧栏）→
>   officia-docs → knowledge-base-docs（23 页，2026-11-03 上线）/ tauri-docs。各站的 `docs/tasks/active/迁移-*.md` 台账记了每一步与踩的坑
> 下文「实测」出自这几次。

## 第 1 步：盘点（只读，产出一张清单）

在旧站根目录跑，结果写进新项目的任务台账：

```bash
# 页面数、配置位置、主题定制
find docs -name '*.md' -not -path '*/node_modules/*' | wc -l
ls docs/.vitepress/ docs/.vitepress/theme/ 2>/dev/null
# Markdown 扩展语法用量：决定第 3 步要写哪些组件。🔴 只扫 docs/，别扫仓库根——
# node_modules 里依赖的 README 也有 ::: tip / [!NOTE]，实测把计数虚报了一倍多
grep -rhoE '^::: ?[a-z-]+|\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]|<!--@include|\[\[toc\]\]|^```[a-z]+\{[0-9,-]+\}|^layout: [a-z]+|\{\{[^}]*\}\}' \
  --include=*.md docs | sort | uniq -c | sort -rn
# 在 Markdown 里直接用的 Vue 组件（连同 props 一起看形态；代码块里的类型名要人工排除）
grep -rhoE '<[A-Z][A-Za-z]+[^>]*/?>' --include=*.md docs | sort | uniq -c | sort -rn
# MDX 会报错的写法：空元素、HTML 注释、正文里的花括号
grep -rnoE '<(br|hr|img|input)\b[^>]*>|<!--|\{|\}' --include=*.md docs | head
# 站内链接与锚点形态
grep -rhoE '\]\(/[^)]*\)' --include=*.md docs | sort | uniq -c | sort -rn | head -40
# 旧网址清单：线上 sitemap 全部 <loc>，第 6 步逐条验收
curl -s https://<旧域名>/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' > old-urls.txt
```

清单至少包含：

| 项 | 看哪里 | 为什么 |
|---|---|---|
| 网址形态 | `config.*` 里有没有 `cleanUrls: true`、`base`、`rewrites` | 决定第 2 步怎么保网址 |
| canonical / sitemap 写法 | `transformPageData` / `transformHead` / `sitemap` | 旧站被收录的就是这套网址 |
| 站点地图地址 | 一般是 `/sitemap.xml`（框架是 `/sitemap-index.xml`） | 站长平台登记的是旧地址，新站要保留（第 4 步） |
| 逐页描述来源 | frontmatter `description`，或 config 里的首段提取函数 | 迁移时复用同一套，meta description 不变 |
| 侧栏与导航 | `themeConfig.sidebar` / `nav` | 换成指南集合的分组与排序；**几个网址前缀**（如 `/guide/` + `/features/`） |
| 扩展语法 | 上面 grep 的计数 | 每种都要有对应组件或转换 |
| 自定义 Vue 组件 | `.vitepress/theme/components/`、`enhanceApp` 里注册的全局组件 | 改写成 `.astro` 组件（第 3 步） |
| 构建期数据 | config 里的 `fetch`（如版本快照）、过滤词表（如不公开的渠道名） | 改成 `scripts/sync` 数据源，过滤规则一并带走 |
| `public/` 下的文件 | 站长验证（`google*.html`、`BingSiteAuth.xml`）、IndexNow 密钥 `<key>.txt`、`robots.txt`、**手写的 `llms.txt`**、图标 | 验证文件漏了掉验证；llms.txt 往往是人工整理的事实，不能删（第 4 步） |
| 分享图 | head 里的 `og:image` 地址，**`curl -I` 一下是不是 200** | 实测旧站 `/og-image.png` 线上 404 很久没人发现 |
| 结构化数据 | head 里的 JSON-LD（SoftwareApplication / FAQPage / Organization…） | 首页与 FAQ 页按框架方式重出（第 4 步） |
| 首页 | `layout: home` 的 `hero` / `features` | 首页重做，不逐字搬 |

## 第 2 步：先定网址（迁移里唯一不可逆的决定）

VitePress 默认**不开** `cleanUrls`，产物是 `guide/install.html`，canonical、sitemap、外链、搜索收录全是 `.html` 结尾。
本框架默认是目录形式 `/guide/install/`。二选一：

| 方案 | 做法 | 适用 |
|---|---|---|
| **A. 保留旧网址（推荐）** | `site.config.ts`：`urlFormat: 'file'`。astro.config 的 `build.format` / `trailingSlash`、`pagePath()`、canonical、sitemap 全跟着变 | 旧站已有收录与外链；不用写任何跳转 |
| **A′. 保留旧网址 + 目录首页** | `urlFormat: 'preserve'`：叶子页 `/a/b.html`、目录首页 `/backend/`（产物 `backend/index.html`），与 VitePress 产物一模一样 | 旧站有 `backend/index.md` 这类目录首页（sitemap 里有以 `/` 结尾的地址）时**必须**用它：`file` 会把它折成 `/backend.html`，旧址 404 |
| B. 换成目录网址 | 每个旧网址一条跳转：`redirects: { '/guide/install.html': '/guide/install/' }` | 新站，或旧站几乎没流量 |

- preserve：`pagePath('/backend/')` 或 `pagePath('/backend/index')` 是目录首页，其余补 `.html`；sitemap 按产物里有没有 `<路径>/index.html` 判断目录首页
- 方案 A：**站内链接一律用 `pagePath('/guide/install')` 生成**，不手写 `.html` 或结尾斜杠；MDX 正文里的链接直接写 `.html`
- 方案 A 已由框架处理、不用再管的两件事（试点时实测踩到后修进了框架）：首页 canonical 不会变成 `/index.html`（`canonicalPath`），
  sitemap 会带 `.html`（astro.config 的 serialize）；`check:seo` 也会核对 sitemap 每条都是某页的 canonical
- 🔴 方案 A 的限制：**works / posts 模块的链接还写死目录形态**，file 形态下只有指南模块与用 `pagePath()` 的页面可用。
  VitePress 迁来的站一般用不上这两个模块，孵化时裁掉；确实要用就先把它们的链接改成 `pagePath()`
- 🔴 方案 B：静态构建里 Astro 的 `redirects` 生成的是 meta refresh 跳转页，**不是** HTTP 301（Astro 官方文档：无适配器的静态站不支持状态码）。
  要真 301，在托管平台或 nginx 配跳转规则（deployment-guide 技能），`redirects` 只当兜底
- 旧站开了 `cleanUrls: true` 的，旧网址本来就是 `/guide/install`：保持 `directory` 并把 `trailingSlash` 设成 `'never'` 即可对上
- 旧站有**多个文档前缀**（`/guide/x.html` + `/features/x.html`）：指南集合按同名子目录存放（id 即 `guide/x`、`features/x`），
  路由改成 `src/pages/[group]/[...slug].astro`、`guidePath(id)` 改成 `pagePath('/' + id)`，分组 `GUIDE_SECTIONS` 照旧站侧栏

## 第 3 步：搬内容

### 先选路线：小站转 MDX，大站正文保持 .md

| 路线 | 做法 | 适用 |
|---|---|---|
| **转 MDX**（下面的转换表） | 每页改成 `.mdx`，容器换组件、标签自闭合、注释改写 | 几十页以内、正文里花括号 / 尖括号少（storyloom-docs 21 页） |
| **保持 .md + 兼容模式** | `site.markdownCompat: 'vitepress'`：正文一个字不改，构建期由 `src/lib/markdown/vp-compat.mjs` 还原 `::: ` 容器、`<Ok/>` 等状态标记（映射在 `src/data/vp-marks.json`）、`<Icon icon>`（离线图标 `src/data/vp-icons.json`，缺图标构建失败）、`.md` 链接、VitePress 锚点规则；`site.codeLineNumbers` 对应旧站 `markdown.lineNumbers` | 上百页、正文里大量 `List<String>`、`{ }`、`{{ }}`（ruoyi-plus-uniapp 511 页：MDX 会成片报错） |

保持 .md 路线 = docs 模块（docs-site 技能讲版式与配置）。迁移脚本链，按顺序用：

| 步 | 脚本 | 做什么 |
|---|---|---|
| 0 | 先配 `site.config.ts`（`url`、`urlFormat`、**`titleSuffix`**）与 `src/data/docs.json` 的 `sections` | 下面的脚本都读它们；🔴 后缀没配就跑转换，整条 `<title>` 会被当成页名写进 frontmatter（知识库实录：脚本里写死的还是 officia 的后缀） |
| 1 | 旧站 `vitepress build` → `.migrate/baseline-dist`；`manifest.mjs .migrate/baseline-dist .migrate/baseline-manifest.json` | 旧站基线：逐页正文、代码块、标题、锚点、图片、链接、表格、meta（`.migrate/` 不入库） |
| 2 | `convert.mjs <旧站 docs 目录> .migrate/baseline-manifest.json` | 正文一个字不改；frontmatter 的 title / description 取旧站渲染结果、lastUpdated 取旧仓库最后提交日、head 里的 keywords 提出来；`::: 容器` 与 `::: code-group` 预转换 |
| 3 | `extract-sidebar.mjs .migrate/baseline-dist` | 从旧站产物读出侧栏层级、默认折叠、顺序 → `sidebar.json`（旧站整站一棵时手工合成 `{ "docs": [...] }`） |
| 4 | `add-lastupdated.mjs <旧仓库>` | 旧站目录不在 git 里、convert 没写上日期时补 |
| 5 | `pnpm build` → `manifest.mjs dist .migrate/new-manifest.json` → `compare-baseline.mjs` → `compare-site.mjs` | 逐页比对 + 全站比对（第 6 步） |

转换后的手改（标题重名加区分名、有意修订的页）登记在 `title-qualifiers.json` / `scripts/migrate/known-diffs.json`，比对时按登记放行。
🔴 **重跑 convert 会覆盖手改**：在台账里列清每次重跑后要补的东西（知识库：download.md 删正文 h1、赞赏码 `<img>` 补宽高、重套内容修正提交）。

其余要点（试点实录）：
- 兼容模式换成 unified 管线（Astro 7 默认的 Sätteri 不跑 remark 插件）；两种模式都关了智能标点，否则正文 `'none'` 被改成弯引号
- 构建时打印的 `[vp-compat] 正文里有未处理的组件 <X>` 要逐个过：要么在 `vp-marks.json` 加映射，要么该页走 MDX / 重做
- 🔴 **改了插件先 `pnpm cache:clear` 再构建**：内容层按正文缓存渲染结果，插件改了不会重新渲染，逐页比对与测试会假绿（试点反证时实测：摘掉插件仍全绿）
- 旧站 Vue 会把正文里的 `{{ x }}` 当插值吞掉，新站按源文件原样显示——逐页比对里这类差异登记为「旧站问题，接受」
- 右侧 H5 演示（PreviewFrame 一类组件）→ 指南 frontmatter `preview` + `site.mobilePreview`（guides-docs 技能）；多层侧栏 → `src/data/guide-sidebar.json`

### 转 MDX 路线的转换表

写成一次性转换脚本（项目的 `scripts/migrate/`，可重跑——旧站切换前又改了内容时再跑一遍），按下表逐条转换，
**转换后再 grep 一遍第 1 步的模式，并用第 6 步的验收脚本查渲染结果，计数应为 0**。

| VitePress | 本框架 | 说明 |
|---|---|---|
| `docs/guide/*.md` | 指南集合（`src/content/guides/<前缀>/*.mdx`） | 文件名即网址段，保持不变（第 2 步依赖它） |
| `why.md` 这类不进侧栏的独立页 | `src/pages/why.mdx`，frontmatter `layout:` 指向一个独立页布局 | 🔴 MDX 页面不经路由的 `components` 注入，正文用到的组件要在文件里 `import` |
| `themeConfig.sidebar` 分组 / 顺序 | frontmatter `section` / `order` | 分组名改 `src/lib/guide-sections.ts` |
| `# 标题` | frontmatter `title`，正文删掉一级标题 | 布局渲染 H1，留着会出现两个 h1（`check:seo` 报错） |
| `description` / 首段 | frontmatter `description`；没写的**调旧站同一个提取函数**生成 | 描述取自首段时加 `lead: false`，否则布局的导语与正文首段重复 |
| 最后更新时间 | frontmatter `updated` = 旧仓库该文件最后提交日（`git log -1 --format=%cs -- <文件>`） | 与旧站「最后更新」同源 |
| `::: tip` / `info` / `warning` / `danger` | `<Callout type=…>` | `::: tip 自定义标题` 的标题传 `title`；info 归 tip |
| `::: details 标题` | `<details><summary>标题</summary>…</details>` | 原生元素，零 JS |
| `> [!NOTE]` 等 GitHub 提示 | 同上换 `<Callout>` | 不换会渲染成普通引用块 |
| `::: code-group` | 拆成多个代码块，或单选 + `:has()` 选项卡（islands-interaction 1b） | |
| ` ```js{4} ` 行高亮 | 去掉 `{4}`，或接 Shiki transformer | 不处理时 `{4}` 会进语言名，代码块失去高亮 |
| `[[toc]]` | 删掉 | 布局自带「本页内容」 |
| `<!--@include: ./x.md-->` | MDX 里 `import X from './x.md'` 再 `<X />` | |
| `<!-- 注释 -->` | `{/* 注释 */}` | MDX 不认 HTML 注释 |
| `<br>` `<hr>` `<img …>` | 自闭合 `<br />` | 🔴 MDX 是 JSX，不闭合直接构建失败：`Expected a closing tag for <br>` |
| `{{ $frontmatter.xxx }}` / Vue 插值 | 删掉或改 MDX 表达式 | 原样留着会显示成文字，`{` 还会让 MDX 报错 |
| 站内链接 `/guide/x`、`./x.md` | 方案 A 补 `.html`：`/guide/x.html` | |
| 锚点 `#_4-素材库` | `#4-素材库` | 🔴 VitePress 给**数字开头的标题** slug 加下划线，Astro（github-slugger）不加，链接静默跳不到 |
| Markdown 里的 Vue 组件 | 同名 `.astro` 组件，**props 保持不变** | 正文一个字不用改；图标类组件见下 |
| `/screenshots/x.webp` 等 public 图片 | 挪到 `src/assets/`，正文改相对路径 | MDX 对相对路径图片自动走 astro:assets：转 webp、带宽高，消掉 `check:seo` 的 CLS 告警 |
| `public/*` 其余 | 原样拷到 `public/` | 验证文件、IndexNow 密钥一个不能少 |

图标组件（如旧站的 `<Icon icon="lucide:check" />`）：写一个同 props 的 `.astro`，内部用 `@lucide/astro` 的映射表。
旧站常用老版本 lucide，**新版改过名的要在映射表里对上**（实测 `building-2` → `Building`）；
表里没有的名字直接 `throw` 让构建失败——VitePress 版组件通常静默画个占位符，线上出错也看不出来。

## 第 4 步：补能力

- **搜索**：VitePress 本地搜索 → Pagefind，按 site-search 技能接入；🔴 索引必须在 `pnpm build` 里生成
- **SEO**：canonical / og / JSON-LD 由框架统一输出，旧站 `transformPageData` 里手写的 canonical / og 逻辑**不要搬**。
  站点级 JSON-LD（SoftwareApplication 等）放首页；keywords meta 不迁（主流搜索引擎已忽略）
- **FAQPage**：旧站常在配置里另手写一份问答，措辞与页面对不上（标注不可见内容属违规）。
  改成**从页面源文件抽「### 问题」+ 答案**生成，结构化数据与页面永远同源（实测：手写 8 条 → 页面实有 19 条）
- **分享图**：旧站 og 图 404 的，用 `pnpm og` 从 `design/og/og-default.html` 渲染；`check:seo` 会核对指向本站的 og:image 文件真的存在
- **站点地图旧地址**：旧站是 `/sitemap.xml` 且已提交站长平台的，加一个同址端点（`src/pages/sitemap.xml.ts`）输出指向 `sitemap-0.xml` 的索引，
  否则平台把整份站点地图判为失效
- **llms.txt**：🔴 **不要直接删旧站手写的 `public/llms.txt`**——它通常是人工整理的产品事实（定义、能力、数据安全、授权、出品方），
  自动生成的只有页面索引。把事实段落挪进 `src/data/llms-facts.md`：
  docs 模块用 `pnpm llms`（`scripts/build-llms.mjs`，事实 + 侧栏页面索引，生成 `public/llms.txt`，并删掉框架的 `src/pages/llms.txt.ts` 端点——两者二选一）；
  guides 路线在 `llms.txt.ts` 里 `import facts from '@/data/llms-facts.md?raw'` 拼在前面。迁移时核对一遍事实是否还对（知识库：Linux 早已支持、AI 问答其实是关键词检索）
- **robots**：对比旧站逐个放行的爬虫与框架 `src/data/ai-crawlers.json`，缺的补进名单（框架已含国内主要搜索引擎）
- **构建期数据**：旧站 config 里 `fetch` 的数据（如版本快照）改成 `scripts/sync` 数据源；只有版本号没有下载地址的清单，
  按发版命名规则拼地址并逐个 HEAD 确认存在（data-sync 技能「软件版本数据」）；过滤词表（不公开的合作方名）一并迁进数据源
- **IndexNow**：docs 模块自带 `pnpm indexnow`：密钥沿用旧站的（`public/<key>.txt` 原样拷来，写进 `docs.json` 的 `indexnow.key`），域名读 `site.config.ts`。
  🔴 别从兄弟站复制脚本后只改一半——知识库就带着 ruoyi.plus 的域名与密钥上了线

## 第 5 步：首页与营销页

VitePress 的 `layout: home`（hero + features 卡片）不逐字搬，按本框架的设计令牌与组件重做，文案沿用旧站，不新增营销数字。
这一步是迁移的主要收益（版式自由、零 JS），也最费时，单独提交。页头用 `site.logo`（标志图）、`NavItem.match`（一组页面共用一个导航项）、
导航 6 项以上设 `site.navBreakpoint: 'lg'`。

## 第 6 步：验收

docs 模块（.md 路线）：

```bash
pnpm verify                                                             # build + check:seo + test 全绿
pnpm check:anchors                                                      # 正文里的站内 #锚点 在目标页都有
node scripts/migrate/manifest.mjs dist .migrate/new-manifest.json
node scripts/migrate/compare-baseline.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json          # 逐页：正文句子、代码块逐字、标题、锚点、图片、链接、表格行、title / description / canonical、JSON-LD
node scripts/migrate/compare-site.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json .migrate/baseline-dist dist   # 全站：旧 sitemap 每条在新站都有、public 文件一个不少
pnpm llms --check
E2E_PORT=4339 pnpm test:e2e                                             # 4329 常被别的派生站占着
```

- 比对的正文取 `[data-pagefind-body]`（新站）/ `.vp-doc`（旧站）；独立页（下载页）把 pagefind-body 挂在整页内容上，否则那一页比不到正文
- 站内无扩展名链接（组件里手写的 `/features/mobile`）比对前补 `.html`、相对链接按所在页解析——旧站 cleanUrls 关着，它们就是同一页
- 不通过的页逐条看：确属有意改动的登记 `known-diffs.json`（`edited` 写清 reason），其余是丢东西，修
- 360 / 390 / 768 / 1280 四种宽度扫一遍横向溢出（长串不断行撑出引用块、表格）

MDX 路线：`node scripts/migrate/check-old-urls.mjs docs/migrate/old-urls.txt`（storyloom 试点的验收脚本，旧网址逐条 / 站内锚点 / 语法残留），其余同上。

- 旧网址清单 100% 命中，站内锚点 100% 命中，语法残留 0
- e2e 至少覆盖：一篇文档的侧栏与上下篇、提示框与组件已渲染、FAQPage 条数 = 页面问题数、下载链接、站内搜索
- 内置浏览器抽查：首页、一篇文档、下载页、FAQ，桌面 + 手机两个视口，深浅两种主题
- 上线后：站长平台验证仍有效；`/sitemap.xml`、`/pagefind/pagefind-entry.json`、og 图都返回 200；一两周内看收录数有没有掉

## 第 7 步：切换上线（新仓库接替旧仓库）

新站在单独目录（`<站名>-astro`）里做完、验收全绿后，问用户确认再切：

1. **接入旧仓库提交历史**：新站里 `git remote add old <旧站目录>`、取回旧站分支后
   `git merge -s ours --allow-unrelated-histories old/master -m "chore: 接入 VitePress 旧站提交历史，内容以新站为准"`。
   推到原远程是快进（旧站最后一个提交是新提交的祖先），不用强推，旧站历史 `git log` 里都在
2. **换目录**：旧目录改名为 `<站名>.vitepress-bak-<日期>`（只读参考），新目录改名接替原名；补回原来的远程（gitee / github）
3. 🔴 **目录改名后重装依赖**：pnpm 的链接指向旧路径，构建报找不到包 → `CI=true pnpm install --frozen-lockfile`
4. **托管平台**：EdgeOne Pages 的构建预设从 VitePress 改成 Astro（用户在后台改），输出目录 `dist`；页面多的站（500 页级）云端构建会被杀，改本机构建上传（deployment-guide）
5. **推送**（Sigil）后核对：`curl -sI` 看 last-modified 在推送之后；旧站全部网址 + 新 sitemap 逐条请求，非 200 应为 0；站长验证文件、
   `/sitemap.xml`、`/llms.txt`、发版触发文件（如有）都是 200
6. **IndexNow 全量推一次**（`pnpm indexnow --all`，先 `--dry`）
7. **外部依赖**：别的仓库读写本站文件的（如应用发版技能改 `docs/public/.last-release.json` 触发重建），路径变了要去那边同步改
8. **残留扫描**：骨架从兄弟站来的，`node scripts/check-residue.mjs <来源站目录>` 应只剩有意保留的（产品矩阵里列着兄弟站名）

## 什么时候不迁

| 情况 | 原因 |
|---|---|
| 纯文档、多人协作写 markdown | VitePress 维护门槛更低，迁过去收益小 |
| 大量 Vue 交互示例（组件库文档） | 每个示例都要改写或包成 Vue island，成本高 |
| 流量很小、很少更新 | 迁了也看不出差别 |

## 常见坑

| 现象 | 原因 | 处理 |
|---|---|---|
| 改了兼容插件，页面没变、测试全绿 | 内容层缓存了渲染结果 | `pnpm cache:clear` 后重建 |
| 页面里出现字面的 `::: tip` | 容器语法没转换 | 第 3 步转换表 + 验收脚本残留计数 |
| `Expected a closing tag for <br>` | MDX 要求空元素自闭合 | 转换脚本统一 `<br />` |
| 组件位置空白、没有报错 | 纯 `.md` 里写了组件标签 | 文件改 `.mdx` 并 import（独立页）或在路由 `components` 注入（集合） |
| 点链接没跳到小节 | VitePress 数字开头标题的锚点带 `_` 前缀 | 转换时去掉；验收脚本核对锚点 |
| 首页 canonical 是 `/index.html`、sitemap 地址不带 `.html` | file 形态下 Astro 的默认行为 | 框架已修（`canonicalPath` / sitemap serialize），别手改回 |
| 上线后收录掉了一大片 | 网址形态变了且没跳转 | 第 2 步方案 A，或补全跳转 |
| 线上搜索提示索引未生成 | Pagefind 索引不在 `pnpm build` 里 | site-search 技能接入步骤 1 |
| 站长平台验证失效 / 站点地图失效 | `public/` 验证文件没拷 / `/sitemap.xml` 没保留 | 第 1 步清单逐项打勾，第 4 步加同址端点 |
| `check:seo` 把 `google<id>.html` 报成缺 canonical | 旧版框架把验证文件当页面 | 框架已修（只校验含 `<html>` 的文件），同步框架即可 |
| llms.txt 只剩页面列表 | 删了旧站手写的 llms.txt | 事实段落迁 `src/data/llms-facts.md` 拼进生成器 |
| 指南单测编译不过 | 旧版框架单测写死示例分组名 | 框架已改为取 `GUIDE_SECTIONS`，同步框架即可 |
| 代码块没有高亮 | ` ```js{4} ` 的 `{4}` 被当成语言名 | 去掉或接 Shiki transformer |
| frontmatter 的 title 是整条「页名 \| 站名 — 定位」 | 转换时 `site.titleSuffix` 没配好（或脚本里写死了别的站的后缀） | 先配后缀再跑 convert |
| 逐页比对说某页正文全丢 | 独立页没挂 `data-pagefind-body`，manifest 退到了别的容器 | 把 pagefind-body 挂在整页内容上 |
| 比对说链接丢了，实际一样 | 新旧写法不同（`/x` vs `/x.html`、相对 vs 绝对、编码） | compare-baseline 已归一；仍报的逐条核对 |
| 下载 / 移动端说明、AAB 链接迁丢了 | 旧站 Vue 组件在运行时渲染、正文里只有一个标签 | 盘点时把组件渲染出的内容列进清单，新页面逐项对上 |
| 框架同步后逐页比对一片不通过（链接 / 正文对不上） | 新版 `manifest.mjs` 的抽取规则变了，旧站基线清单还是老规则生成的 | 用新脚本对 `.migrate/baseline-dist` 重新生成基线清单再比：两边必须同一套规则 |
| 改名后 `pnpm build` 找不到包 | 目录改名，pnpm 链接还指着旧路径 | `CI=true pnpm install --frozen-lockfile` |
| 上线后 IndexNow 推了别的站的域名 | 脚本从兄弟站复制、写死了域名与密钥 | 用 docs 模块的 indexnow（读配置），孵化后跑 check-residue |

## 相关技能

| 技能 | 关系 |
|---|---|
| `project-init` | 孵化（裁剪要在改导航之前做） |
| `docs-site` | 大站 .md 路线：docs 模块的版式、docs.json、上线与 IndexNow |
| `guides-docs` | 小站 MDX 路线：文档集合、分组、布局、`lead` 字段 |
| `site-search` | Pagefind 接入 |
| `seo-meta` / `geo-optimization` | `urlFormat` / `pagePath`、FAQPage、分享图 |
| `data-sync` | 版本清单同步、HEAD 确认安装包 |
| `astro-routing` | `[group]/[...slug]` 多前缀路由、`redirects` |
| `deployment-guide` | 真 301 跳转规则、托管平台构建命令 |
| `islands-interaction` | code-group / 截图切换用单选 + `:has()` |
| `image-optimization` | 图片搬进 `src/assets/` |
