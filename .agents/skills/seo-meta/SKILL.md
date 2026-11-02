---
name: seo-meta
description: 页面 SEO：SEOHead、seo.ts、check-seo 三件套，各类页面的 title、description、JSON-LD（含 VideoObject 前提）、sitemap 与静默失败清单。触发词：SEO、meta、title、description、canonical、og、Open Graph、结构化数据、JSON-LD、VideoObject、sitemap、收录、搜索排名
---

# 页面 SEO（next-ai-astro）

## 何时使用

- 新页面 / 新内容类型要配 title、description、结构化数据
- 搜索引擎收录少、搜索结果摘要不对、分享卡片（og / twitter card）不显示
- `check:seo` 报错
- 要加视频（VideoObject）、文章等特定类型的结构化数据
- 改域名后 canonical / sitemap 需要跟着变；页面要 noindex

## 概述

本框架的 SEO 字段**不由页面各自拼**，而是：页面传语义参数 → `BaseLayout` → `SEOHead` 统一输出 → 构建后 `check:seo` 逐页校验。
页面作者只需要回答三个问题：这一页叫什么（title）、讲什么（description）、是什么类型的东西（jsonLd）。

> GEO（让 AI 搜索引用）是 SEO 的延伸，robots / llms.txt / 定义句写法见 `geo-optimization`。

---

## 本框架现状：三件套

### 1. `SEOHead.astro`（经 `BaseLayout` 调用，全站唯一输出点）

props（`SEOProps`）：`title`、`description`、`image`、`type`（website / article）、`noindex`、`jsonLd[]`、`publishedTime`、`modifiedTime`。

输出：
- `<title>`：`buildTitle(title)` → `页面标题 | 站名`（首页只有站名）
- `meta description`：`truncate(description ?? site.description, 160)`（按字符截断，中文不乱码）
- `canonical`：`absoluteUrl(Astro.url.pathname)` —— **逐页**，基于 `site.url`，自动补结尾斜杠
- 网址形态 `site.urlFormat`：`directory`（`/a/`，默认）/ `file`（`/a.html`）/ `preserve`（叶子页 `/a.html`、目录首页 `/a/`，VitePress 迁移用）；站内链接一律 `pagePath()` 生成，sitemap、canonical 跟着变，`check:seo` 核对 sitemap 每条都是某页的 canonical
- `og:*` / `twitter:*`：标题、描述、`og:url` = canonical、`og:image` 绝对地址、`og:locale`（`zh_CN`）
- `robots noindex, follow`（传 `noindex` 时）
- 每个 JSON-LD 对象一个 `<script type="application/ld+json">`，内容经 `serializeJsonLd()`

### 2. `src/lib/seo.ts`

| 函数 | 作用 |
|------|------|
| `buildTitle` / `truncate` / `absoluteUrl` | 标题模板、按字符截断、绝对地址（补斜杠、带扩展名不补） |
| `serializeJsonLd` | JSON 序列化并把 `<` 转义为 `\u003c`（JSON 字符串里的 Unicode 转义，解析结果不变），防止数据里的 `</script>` 提前闭合标签 |
| `websiteJsonLd()` | WebSite（只挂首页） |
| `breadcrumbJsonLd(crumbs)` | BreadcrumbList（与可见面包屑用同一个 `crumbs` 数组） |
| `faqJsonLd(items)` | FAQPage（只标注页面上真实可见的问答） |
| `articleJsonLd({...})` | Article（文章详情） |
| `AI_CRAWLERS` | AI 爬虫名单与放行策略，数据来自 `src/data/ai-crawlers.json`（导出名与结构以 `seo.ts` 当前代码为准；策略见 `geo-optimization`） |

### 3. `scripts/check-seo.mjs`（`pnpm check:seo`，先 `pnpm build`）

所有页面都查：`<html lang>`、title 存在且 ≤ 60 字（超出警告）、description 恰好 1 个且非空；站内链接也会收集起来做死链 / 缺斜杠检查（含 404 页上的链接）。
非 `noindex` 页再查：canonical 恰好 1 个且等于「站点地址 + 文件路径」、og:url 恰好 1 个且等于 canonical、
og:title / og:description / og:image 存在且 og:image 为绝对地址、`<h1>` 恰好 1 个、每张图有 alt 属性（无宽高警告）、
JSON-LD 可解析且含 `@context` / `@type`；**跨页**检查标题与描述不重复；站点级检查 robots.txt（`ai-crawlers.json` 每一项都有与 `allow` 一致的显式分组）、
sitemap-index.xml、llms.txt。站点地址取自首页 canonical；是保留的示例域名（`example.com/.org/.net` 及子域、`.test` / `.example` / `.invalid`、localhost）时给出警告。
JSON-LD 支持单个对象、对象数组、`@graph` 三种形式，逐个节点检查。

VideoObject 有专项校验：必填 `name` / `thumbnailUrl`（绝对地址）/ `uploadDate`（ISO 8601）、`duration` 为 ISO 时长、播放量为非负整数，
并且页面里必须有 `src` 与 `embedUrl` 一致的 `<iframe>`（或与 `contentUrl` 一致的 `<video>`），facade 写法会被拦下。
🔴 其他类型的必填字段（Article 的 `headline`…）**不查**。新增或改动结构化数据类型后，抽 2~3 页把 `dist/` 里的 JSON-LD
贴进 Google Rich Results Test / Schema Markup Validator 人工核对。

### 各页面现状

| 页面 | title | description | JSON-LD |
|------|-------|-------------|---------|
| 首页 | 站名 | `site.description` | WebSite + FAQPage |
| `/works/` | 全部作品 | 带条数与分类名 | BreadcrumbList + CollectionPage |
| `/works/<id>/` | 作品标题 | `标题：摘要`（截断 160） | BreadcrumbList + CreativeWork（type=article，传封面做 og:image） |
| `/works/category/<id>/` | `分类名（N 条）` | 分类导语 | BreadcrumbList + CollectionPage（含 numberOfItems） |
| `/posts/` | 全部文章 | 带篇数 | BreadcrumbList |
| `/posts/<id>/` | 文章标题 | frontmatter description | BreadcrumbList + Article |
| `/about/` | 关于本站 | 固定句 | BreadcrumbList |
| 404 | 页面不存在 | 固定句 | 无（noindex） |

---

## 标准做法

### 1. title 与 description 写法

- **每页不同**：列表 / 分类 / 分页页要带区分信息（分类名、数量、页码），否则 `check:seo` 报重复。
- title：核心词在前，≤ 60 字；站名后缀由模板加，不要自己再写。
- 后缀默认是站名；**迁移旧站时用 `site.titleSuffix` 保住旧站已收录的完整后缀**（如「页名 | Knowledge Base — 本地优先的知识库桌面应用」），
  `site.homeTitle` 保住旧站首页那一整句；站名本身仍用于页头 / 页脚 / og:site_name。单测 `buildTitle` 三种配置都覆盖
- keywords：主流搜索引擎已忽略，新站不必写；迁移旧站时为了逐页比对一致可沿用：`site.keywords` 全站，页面 `keywords` 参数整条替换（docs 集合的 frontmatter `keywords`）
- description：70~160 字，写成完整句子，首句是「X 是 Y」的定义或概述；不要堆关键词，不要全站共用 `site.description`。
- 详情页 description 可由数据拼：`${title}：${summary}`，再 `truncate(…, 160)`。

### 2. 结构化数据选型

| 页面类型 | 推荐 `@type` | 说明 |
|---------|-------------|------|
| 首页 | `WebSite`（+ 有真实 FAQ 时 `FAQPage`） | `websiteJsonLd()` |
| 列表 / 分类 | `CollectionPage` + `BreadcrumbList` | 分类页加 `numberOfItems` |
| 通用作品详情 | `CreativeWork` + `BreadcrumbList` | 框架默认 |
| 视频详情（**本页嵌了可直接播放的播放器**） | `VideoObject` + `BreadcrumbList` | 见下方 §3：在 CreativeWork 基础上合并升级，不是另起一个替换 |
| 视频详情（只有封面 + 去原平台观看的外链） | `CreativeWork` + `BreadcrumbList` | 不能标 VideoObject（§3 前提不满足） |
| 文章 | `Article` + `BreadcrumbList` | `articleJsonLd()` |
| 关于 / 作者页 | `AboutPage` / `Person` | 只写能核实的信息 |

所有 JSON-LD 一律经 `BaseLayout` 的 `jsonLd` 传入，不要在页面里自己写 `<script type="application/ld+json">`。

### 3. VideoObject（视频类站点详情页）

🔴 **前提：只能用在「本页就能直接观看该视频」的页面**，也就是页面里嵌了播放器（`<iframe>` / `<video>`）。

- Google 原文：「VideoObject structured data must be added to a page where users can watch the video.」（video 结构化数据文档）
- 视频不能藏在其他元素后面，也**不能依赖用户点击、滑动等操作才加载**（Video SEO best practices）。所以「先显示封面、点击后才插入 iframe」的
  facade 写法不算可观看页，不能标 VideoObject。
- 框架现有详情页只有封面 + 「查看原作品」外链按钮，**不满足前提**，保持 `CreativeWork`。先按 `data-sync`「嵌入播放器」一节把播放器嵌进页面
  （安全要求见 `security-guard`），再升级为 VideoObject。
- `embedUrl` / `contentUrl` **至少一个必填**：Google 把两者列为推荐字段，但原文要求「contentUrl 拿不到时提供 embedUrl」；本框架据此收紧为必填，
  并且 `embedUrl` 必须就是本页 iframe 的 `src`。

字段（Google 视频结构化数据文档）：**必填** `name`、`thumbnailUrl`、`uploadDate`（ISO 8601，建议带时区）；
**推荐** `description`、`duration`（ISO 8601，如 `PT1M54S`）、`contentUrl`、`embedUrl`、`interactionStatistic`（WatchAction）等。

**合并而不是替换**：VideoObject 是 CreativeWork 的子类型。详情页已有的 CreativeWork 对象带着 `keywords` / `genre` / `author` / `sameAs` 等字段，
直接换成一个全新的 VideoObject 会把它们丢掉；做法是在原对象上把 `@type` 升级为 `VideoObject` 并补视频字段。
框架已内置这两个函数（`src/lib/seo.ts`，单测在 `tests/unit/seo.test.ts`），直接 import，孵化项目不用再改核心文件：

| 函数 | 作用 | 边界 |
|------|------|------|
| `isoDuration(totalSeconds)` | 秒 → ISO 8601 时长（`754` → `PT12M34S`） | 负数 / NaN / Infinity 返回 `undefined`（不输出 duration）；小数向下取整；`0` → `PT0S` |
| `videoJsonLd(base, input)` | 在 CreativeWork 上合并升级为 VideoObject，补 `thumbnailUrl`（转绝对地址）、`uploadDate`（带 Z 的 ISO）、`duration`、`embedUrl` / `contentUrl`、`interactionStatistic`（WatchAction） | `embedUrl` 与 `contentUrl` 都缺时**抛错**，让构建失败而不是输出违规标记；`views` 只接受非负整数，其余值不输出计数；不改动传入的 `base` |

`input` 字段：`thumbnail`（站内路径或绝对地址，`resolveCover` 的结果即可）、`uploadDate: Date`、`embedUrl`（与本页 iframe 的 `src` 完全相同）、
`contentUrl`（视频文件直链，有才填）、`durationSeconds`、`views`。

页面里用**同一个条件**同时控制播放器和结构化数据，两者不可能一个有一个没有：

```astro
---
// src/pages/works/[id].astro（节选）：embedUrl 的来源字段需先在 schema 里定义（见 content-collections），拼接与白名单见 data-sync / security-guard
const embedUrl = /* 由数据里的平台 id 按固定模板拼出的播放器地址，没有则 undefined */;
const workJsonLd = embedUrl
  ? videoJsonLd(creativeWorkJsonLd, {
      thumbnail: cover.src,
      uploadDate: work.data.date,
      embedUrl,
      durationSeconds: metrics.duration,
      views: metrics.views,
    })
  : creativeWorkJsonLd;
---
{embedUrl && <iframe src={embedUrl} title={`${work.data.title} 播放器`} loading="lazy" … />}
```

- `thumbnailUrl` 用构建期转存后的站内地址（`resolveCover` 结果）或原图绝对地址；Google 支持 BMP / GIF / JPEG / PNG / WebP / SVG / AVIF。
- `durationSeconds` / `views` 取 `works.metrics` 的保留键（`duration` 秒、`views` 次数，见 `content-collections` 3.1）。
  示例数据里的数字是演示用的，进了 `interactionStatistic` 就是对搜索引擎的声明，孵化后必须换成真实数据。
- 构建后 `pnpm check:seo` 会核对「标了 VideoObject 的页面确实有 src 与 embedUrl 一致的 iframe」以及必填字段，上面两处条件写岔了会在这里报出来。

### 4. FAQPage 的现状

- Google 自 2023-08 起只对知名的政府、健康类权威网站展示 FAQ 富结果；Google 的 FAQPage 文档现已加注弃用说明：
  **2026-05-07 起 Google 搜索不再展示 FAQ 富结果**，2026-06 起 Rich results test、Search Console 的相关报告与筛选也移除支持；
  文档同时说明 FAQ 结构化数据**可以保留**，只是不会在搜索里产生可见效果（Search Engine Journal 2026-05-10 的报道引用的也是这份文档）。
- 本框架保留首页 FAQPage：问答内容本身对读者与 AI 摘取有用（推断，理由见 `geo-optimization`），标记无害。
- 🔴 只标注页面上**真实可见**的问答，不要为了结构化数据编问答。首页用 `<details>` 折叠、点开即可见的问答按「用户在页面上能看到」处理（Google 未明文列出折叠组件，这是判断）。

### 5. sitemap

- `@astrojs/sitemap` 在构建时基于 `site` 生成 `sitemap-index.xml`（+ `sitemap-0.xml`），`filter` 排除 404。
- 页面存在即进 sitemap；不想被收录的页面既要 `noindex` 也要在 `sitemap({ filter })` 里排除。
- `BaseLayout` 已输出 `<link rel="sitemap" href="/sitemap-index.xml">`，robots.txt 里有绝对地址的 `Sitemap:` 行。
- docs 模块（docs-site 技能）在外面再包一层 `withDocsSitemap`：lastmod（frontmatter `lastUpdated` + `page-dates.json`，`strict` 时缺日期构建失败）
  与 priority / changefreq 分档（`docs.json` 的 `sitemap.rules`）。🔴 分档拿补过 `.html` 的最终地址去匹配；在 serialize 里抛错会被 @astrojs/sitemap 吞掉
  （只打 ERROR、构建成功、整份 sitemap 没生成），必须失败的检查放在加载配置时
- 迁移旧站的 `/sitemap.xml`（已提交站长平台）：docs 模块的 `sitemap.xml.ts` 输出指向 `sitemap-0.xml` 的索引

### 6. 换域名

只改 `src/site.config.ts` 的 `url`：canonical、og:url、sitemap、robots、llms.txt 全部跟着变。
改完 `pnpm build && pnpm check:seo`，确认没有「仍是占位域名」的警告。

---

## 静默失败清单（构建会成功，但 SEO 全错）

| # | 静默错误 | 后果 | 框架防线 |
|---|---------|------|---------|
| 1 | canonical 写死成站点根地址 | 所有页被视为首页的重复页 | `SEOHead` 逐页生成 + check:seo 比对文件路径 |
| 2 | og:url 输出两次（布局和页面各一个） | 分享平台取值不确定 | 只在 `SEOHead` 输出 + check:seo 计数 |
| 3 | 全站共用一条 description | 搜索结果所有页面一模一样 | check:seo 跨页查重 |
| 4 | 分页页 / 分类页标题相同 | 同上 | check:seo 跨页查重 |
| 5 | JSON-LD 里出现 `</script>` 或非法 JSON | 结构化数据整段失效，甚至 XSS | `serializeJsonLd` + check:seo 解析 |
| 6 | `noindex` 与 robots `Disallow` 同时用在同一页 | 爬虫被 Disallow 挡住，读不到 noindex，页面可能仍以无摘要形式出现 | 本框架 robots 不按页面 Disallow（只对 `ai-crawlers.json` 里 `allow: false` 的爬虫整站 Disallow），不想收录的页面只用 noindex |
| 7 | og:image 是相对路径 | 分享卡片无图 | `absoluteUrl` + check:seo |
| 8 | 站内链接缺结尾斜杠 | 同一内容两个 URL | 路径函数 + `trailingSlash: 'always'` + check:seo 站内链接检查 |
| 9 | 详情页没构建出来但列表页照样链过去（getStaticPaths 拿到空数据，如并行构建搅乱内容缓存） | 大量站内死链，构建本身不报错 | check:seo 站内死链检查 |
| 10 | 上线时 `site.url` 仍是占位域名 | canonical 全指向 example.com / videos.example.org 这类保留域名 | check:seo 警告（认 RFC 2606 保留域名，不只 example.com） |
| 11 | 一页多个 `<h1>` / 没有 `<h1>` | 主题不清 | check:seo 计数 |
| 12 | 页面没有播放器（或只有点击才加载的 facade）却标了 `VideoObject` | 违反 Google「VideoObject 必须放在用户能观看该视频的页面」，视频进不了索引；与「标注页面不可见内容」同类 | `videoJsonLd` 缺 `embedUrl` / `contentUrl` 直接抛错 + 播放器与 JSON-LD 用同一个条件渲染；check:seo 找不到 src 与 embedUrl 一致的 iframe / video 时报错 |
| 13 | 其他类型必填字段缺失（Article 无 `headline` 等；VideoObject 的必填字段 check:seo 已查） | 富结果资格丢失，构建与 check:seo 都不报 | Rich Results Test 人工抽查（见上文 check-seo 一节） |

---

## 默认分享图（og-default.png）

页面没传 `image` 时 og:image 用 `public/og-default.png`（1200×630）。它从 HTML 源文件渲染，不手画、不截真实页面：

| 文件 | 作用 |
|------|------|
| `design/og/og-default.html` | 源文件：站名 + 一句话 + 三个要点，孵化后改成本站文字与品牌色 |
| `scripts/render-og.mjs` | `pnpm og` → 用 e2e 那份 Playwright Chromium 截成 `public/og-default.png`；`--src` / `--out` 可换路径 |

- **画而不截图**：分享卡片常被缩到 300px 宽，真实页面截图里的导航和正文会糊成一片；字号以「缩到四分之一还能读」为准（标题 ≥ 56px）
- 改完源文件重跑 `pnpm og`，PNG 与源文件同一个提交
- 首次使用先 `pnpm exec playwright install chromium`；脚本固定 `channel: 'chromium'`（完整版，国内网络下 headless shell 常下载失败）
- 单页要专属分享图时给页面传 `image`，不用改这张默认图

## 检查清单

- [ ] 页面经 `BaseLayout`，传了唯一的 title / description
- [ ] 需要的 JSON-LD 通过 `jsonLd` 传入，面包屑数据与可见面包屑同源
- [ ] 详情页传了 `image`（og 图）与 `publishedTime`
- [ ] 只有一个 `<h1>`
- [ ] 不收录的页面：`noindex` + sitemap filter
- [ ] 新增 seo 工具函数有单测
- [ ] 标了 `VideoObject` 的页面确实嵌了可直接播放的播放器（不是 facade），`embedUrl` 与 iframe `src` 一致
- [ ] 新增 / 改动结构化数据类型后，已用 Rich Results Test 或 Schema Markup Validator 抽查必填字段
- [ ] `pnpm build && pnpm check:seo` 全绿（警告已逐条判断）
- [ ] 上线前 `site.url` 是真实域名；深度审计走 `/seo-check`（调用工作站 ai-seo-studio）

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| check:seo 报 canonical 与路径不一致 | 页面自己传了 canonical 或链接缺斜杠 | 删掉自定义，交给 `SEOHead` |
| 报「描述重复」 | 多页没传 description，兜底到 `site.description` | 每页写自己的描述 |
| 分享卡片标题带两遍站名 | title 里自己加了站名 | 只传页面标题 |
| 结构化数据测试工具报缺字段 | VideoObject 缺 thumbnailUrl / uploadDate | 补必填字段 |
| 构建报「videoJsonLd：embedUrl 与 contentUrl 至少一个」 | 页面没有播放器却调用了 `videoJsonLd` | 没播放器就保持 CreativeWork；有播放器就把 iframe 的 `src` 传进 `embedUrl` |
| JSON-LD 里出现 `PTNaNS` 或负数播放量 | 数据里的时长 / 播放量不是合法数字 | 用本节带校验的 `isoDuration` / `videoJsonLd`；并按 `content-collections` 3.1 收紧 metrics schema |
| sitemap 里有 404 页 | filter 没排除 | `sitemap({ filter })` |
| 搜索结果摘要是页脚文字 | description 为空，引擎自己抓了 | 写 description |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `geo-optimization` | robots AI 爬虫、llms.txt、定义句、FAQ 内容写法、Bing 站长 |
| `astro-routing` | URL 结构、分页页、重定向（301 保住权重） |
| `image-optimization` | og 图与缩略图的生成和转存 |
| `data-sync` / `security-guard` | 视频播放器怎么嵌（来源、白名单、sandbox），嵌好之后本技能才标 VideoObject |
| `content-collections` | `metrics.views` / `metrics.duration` 的键名与单位 |
| `analytics` | 收录后的流量观测 |
| 工作站 `ai-seo-studio` | 关键词研究、竞品、全站审计、站长平台提交（`/seo-check` 经 MCP 调用） |

## 参考

- Google 视频结构化数据（必填字段、「must be added to a page where users can watch the video」）：https://developers.google.com/search/docs/appearance/structured-data/video
- Google Video SEO best practices（watch page 定义、不能依赖用户操作才加载视频）：https://developers.google.com/search/docs/appearance/video
- Google FAQPage 文档（顶部弃用说明：2026-05-07 停止展示、2026-06 移除测试与报告、标记可保留）：https://developers.google.com/search/docs/appearance/structured-data/faqpage
- Google 2023-08 FAQ / HowTo 富结果调整：https://developers.google.com/search/blog/2023/08/howto-faq-changes
- Search Engine Journal 转述（2026-05-10）：https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- `@astrojs/sitemap`：https://docs.astro.build/en/guides/integrations-guide/sitemap/
