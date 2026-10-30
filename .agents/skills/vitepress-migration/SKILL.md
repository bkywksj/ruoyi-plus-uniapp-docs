---
name: vitepress-migration
description: 把 VitePress 文档站迁到本框架：盘点、保住旧网址（urlFormat 'file' 或跳转）、容器语法与侧栏转换、Vue 组件改写、本地搜索换 Pagefind、逐页验收。触发词：VitePress、迁移、迁站、vitepress 改 astro、文档站迁移、换框架、.vitepress、::: tip、cleanUrls
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

先确认值不值得迁（见文末「什么时候不迁」）。迁的话，**框架要先具备使用指南模块**（guides-docs 技能）。

> 实战参照：storyloom-docs（21 页 VitePress 站）2026-10-30 试点迁移，项目 `E:/my/桌面软件tauri/storyloom-docs`（试点验收后已合并进原 VitePress 仓库并上线），
> 台账 `docs/tasks/active/迁移-vitepress.md`，转换脚本 `scripts/migrate/vitepress-to-mdx.mjs`、验收脚本 `scripts/migrate/check-old-urls.mjs` 可照抄改。
> 下文「实测」都出自这次。

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
| B. 换成目录网址 | 每个旧网址一条跳转：`redirects: { '/guide/install.html': '/guide/install/' }` | 新站，或旧站几乎没流量 |

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
  框架自动生成的只有页面索引。把事实段落挪进 `src/data/llms-facts.md`，`llms.txt.ts` 里 `import facts from '@/data/llms-facts.md?raw'` 拼在前面，
  页面索引照旧自动生成；`public/llms.txt` 删掉（否则盖掉生成结果）
- **robots**：对比旧站逐个放行的爬虫与框架 `src/data/ai-crawlers.json`，缺的补进名单（框架已含国内主要搜索引擎）
- **构建期数据**：旧站 config 里 `fetch` 的数据（如版本快照）改成 `scripts/sync` 数据源；只有版本号没有下载地址的清单，
  按发版命名规则拼地址并逐个 HEAD 确认存在（data-sync 技能「软件版本数据」）；过滤词表（不公开的合作方名）一并迁进数据源
- **IndexNow**：旧站有推送脚本的照搬，只改「源文件 → 网址」映射（集合子目录 / `src/pages`），映射写单测

## 第 5 步：首页与营销页

VitePress 的 `layout: home`（hero + features 卡片）不逐字搬，按本框架的设计令牌与组件重做，文案沿用旧站，不新增营销数字。
这一步是迁移的主要收益（版式自由、零 JS），也最费时，单独提交。页头用 `site.logo`（标志图）、`NavItem.match`（一组页面共用一个导航项）、
导航 6 项以上设 `site.navBreakpoint: 'lg'`。

## 第 6 步：验收

```bash
pnpm verify                                                     # build + check:seo + test 全绿
node scripts/migrate/check-old-urls.mjs docs/migrate/old-urls.txt  # 旧网址逐条 / 站内锚点 / 语法残留
E2E_PORT=4339 pnpm test:e2e                                     # 4329 常被别的派生站占着
```

验收脚本（从实战项目抄）做三件事：旧网址逐条在 `dist/` 里找到对应文件；站内 `href="/x.html#id"` 逐个核对目标页真有 `id`；
渲染结果里没有字面的 `:::`、`[!NOTE]`、`&lt;Icon`。退出码非 0 就是有东西丢了。

- 旧网址清单 100% 命中，站内锚点 100% 命中，语法残留 0
- e2e 至少覆盖：一篇文档的侧栏与上下篇、提示框与组件已渲染、FAQPage 条数 = 页面问题数、下载链接、站内搜索
- 内置浏览器抽查：首页、一篇文档、下载页、FAQ，桌面 + 手机两个视口，深浅两种主题
- 上线后：站长平台验证仍有效；`/sitemap.xml`、`/pagefind/pagefind-entry.json`、og 图都返回 200；一两周内看收录数有没有掉

## 什么时候不迁

| 情况 | 原因 |
|---|---|
| 纯文档、多人协作写 markdown | VitePress 维护门槛更低，迁过去收益小 |
| 大量 Vue 交互示例（组件库文档） | 每个示例都要改写或包成 Vue island，成本高 |
| 流量很小、很少更新 | 迁了也看不出差别 |

## 常见坑

| 现象 | 原因 | 处理 |
|---|---|---|
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

## 相关技能

| 技能 | 关系 |
|---|---|
| `project-init` | 孵化（裁剪要在改导航之前做） |
| `guides-docs` | 文档集合、分组、布局、`lead` 字段 |
| `site-search` | Pagefind 接入 |
| `seo-meta` / `geo-optimization` | `urlFormat` / `pagePath`、FAQPage、分享图 |
| `data-sync` | 版本清单同步、HEAD 确认安装包 |
| `astro-routing` | `[group]/[...slug]` 多前缀路由、`redirects` |
| `deployment-guide` | 真 301 跳转规则、托管平台构建命令 |
| `islands-interaction` | code-group / 截图切换用单选 + `:has()` |
| `image-optimization` | 图片搬进 `src/assets/` |
