---
name: geo-optimization
description: GEO：让 AI 搜索与问答引擎抓得到、读得懂、愿意引用本站，覆盖 AI 爬虫名单与 robots 策略、llms.txt 生成、定义句与 FAQ 写法、站长平台提交。触发词：GEO、AI搜索、llms.txt、AI爬虫、robots、被AI引用、FAQ、AEO、LLMO、ChatGPT搜索、Perplexity、GPTBot
---

# GEO 优化（next-ai-astro）

## 何时使用

- 希望内容被 AI 搜索引用 / 出现在 AI 回答里（ChatGPT 搜索、Perplexity、Claude、Google AI）
- 写首页、详情页、文章的首段与结构（定义句、零点击摘要）
- 改 robots.txt（放行 / 屏蔽某个 AI 爬虫，如只想被检索、不想被训练）、改 llms.txt
- 新站上线后提交站长平台（Bing / Google / 百度 / IndexNow）
- AI 回答里对本站的描述不准确

## 概述

GEO 建立在 SEO 之上（`seo-meta` 先到位），额外解决三件事：
1. **能抓到**：AI 爬虫被 robots 明确放行，内容在 HTML 里（不依赖客户端 JS 渲染）。
2. **能读懂**：有站点摘要（llms.txt），页面首段是可直接摘取的定义句，结构清晰（短段落、列表、表格）。
3. **愿意引用**：内容可核实（有出处、有日期、无编造数字），实体信息一致（站名、作者、定位在各处写法相同）。

本框架已把 1 和 2 的机制做好，页面作者要做的主要是**按规范写内容**。

---

## 本框架现状

| 机制 | 位置 | 说明 |
|------|------|------|
| 服务端渲染全部内容 | Astro 静态输出 | 列表页的 island 也先服务端渲染；只有 `client:only` 会让内容对爬虫不可见（禁止用于内容） |
| robots.txt | `src/pages/robots.txt.ts` | `User-agent: *` 放行 + 名单里**每一项**输出显式分组（`allow: true` → `Allow: /`，`false` → `Disallow: /`）+ 绝对地址 Sitemap |
| AI 爬虫名单 | `src/data/ai-crawlers.json`（`seo.ts` 与 `check-seo.mjs` 读同一份） | 每项 `{ name, purpose, allow }`，`purpose` 取 `training` / `search` / `user`，完整清单见下方「爬虫名单」 |
| llms.txt | `src/pages/llms.txt.ts` | 由集合数据生成：站名 → 定位引用块 → 描述 → 分类 → 作品（最新 200 条）→ 文章 → `## Optional`（关于、站点地图）；链接行为 `- [标题](url): 说明` |
| 定义句 | `site.tagline` | 「next-ai-astro 是一个……」，用于首页 H1 下方与 llms.txt 引用块 |
| FAQ | `src/data/faq.json` → 首页可见问答 + FAQPage | |
| 校验 | `scripts/check-seo.mjs` | robots.txt 里名单**每一项**都有与 `allow` 一致的显式分组；只有 `User-agent: *` 组出现 `Disallow: /` 才告警（单个爬虫的 Disallow 是有意为之）；llms.txt 以 `# ` 开头 |
| nginx | `deploy/nginx/default.conf` | `location = /llms.txt` 用 `types { text/plain txt; }` + `charset utf-8;`：以 `text/plain; charset=utf-8` 返回，中文不会按 Latin-1 解析（见下文） |

---

## 标准做法

### 1. robots：每个爬虫一个显式分组，策略写在名单里

只写 `User-agent: *` / `Allow: /` 在规则上已允许所有爬虫，但本框架仍给名单里每个爬虫输出显式分组：
意图明确、便于审计（一眼能看出放行了谁、屏蔽了谁），也方便对单个爬虫调整策略。
增减爬虫、改放行策略只改 `src/data/ai-crawlers.json` 一处：robots.txt 生成与 `check-seo.mjs` 校验读的是同一份名单。

#### 爬虫名单（2026-09 按各家官方文档核对）

| name | purpose | 用途（官方说明） |
|------|---------|----------------|
| `GPTBot` | training | OpenAI 用于训练生成式基础模型；disallow 表示内容不应用于训练 |
| `OAI-SearchBot` | search | 决定网站能否出现在 **ChatGPT 搜索**结果里；屏蔽后不会出现在搜索答案中 |
| `ChatGPT-User` | user | 用户在 ChatGPT / GPT Actions 里触发的访问；官方原文「robots.txt rules may not apply」 |
| `ClaudeBot` | training | Anthropic 收集可能用于模型训练的网页内容 |
| `Claude-SearchBot` | search | Anthropic 为提升搜索结果质量建索引 |
| `Claude-User` | user | 用户向 Claude 提问时代为访问网页；Anthropic 文档把它与前两个一起列为可用 robots.txt 屏蔽 |
| `PerplexityBot` | search | 在 Perplexity 搜索结果里展示并链接网站；官方说明不用于训练基础模型 |
| `Perplexity-User` | user | 用户在 Perplexity 提问时代为访问；官方说明「generally ignores robots.txt rules」 |
| `Google-Extended` | training | 控制内容能否用于训练 Gemini 模型及 Gemini 的 grounding；**没有独立 UA**（只是 robots 里的控制标记），不影响 Google 搜索收录与排名 |
| `Applebot-Extended` | training | 控制内容能否用于训练 Apple 的基础模型；**本身不抓取网页**（抓取仍由 Applebot 完成） |
| `Bingbot` | search | 普通搜索引擎爬虫 |
| `Baiduspider` | search | 普通搜索引擎爬虫（国内搜索） |

框架默认全部 `allow: true`（以 JSON 实际值为准）。增加新爬虫前先查它的官方说明、确认 `purpose`，不要凭名字猜。

#### 只想被检索引用、不想被训练

把 `purpose: "training"` 的几项（`GPTBot`、`ClaudeBot`、`Google-Extended`、`Applebot-Extended`）改成 `allow: false`，
robots.txt 会为它们输出 `User-agent: X` / `Disallow: /`。

- 🔴 **不能靠「从名单里删掉」来屏蔽**：robots.txt 第一段是 `User-agent: *` / `Allow: /`，名单里没有的爬虫会落到通配组，照样被放行。
- search 类保持 `allow: true`，否则会从对应的 AI 搜索里消失（例如屏蔽 `OAI-SearchBot` 就不会出现在 ChatGPT 搜索里）。
- `Google-Extended` 设为 false 同时关掉 Gemini 的 grounding 使用；Google 文档写明它「does not impact a site's inclusion in Google Search nor is it used as a ranking signal」。
- user 类是用户实时触发的访问，官方已说明 robots.txt 可能不适用或通常被忽略；设成 false 也**不保证**挡得住，不要向站点所有者承诺效果。
- 这是对外的授权决定：改之前与站点所有者确认，commit message 里写清楚依据。

### 2. llms.txt：格式与生成规则

llmstxt.org 规定的顺序：
1. `# 站点名`（**唯一必需**的部分）
2. `> 一句话摘要`（引用块，包含关键信息）
3. 若干段普通 Markdown（不能用标题）
4. 若干 `## 分组`，每组是链接列表：`- [名称](URL): 说明`——链接后面是 **ASCII 冒号 `:`**（规范原文「optionally a `:` and notes」），
   不要写成中文全角「：」，否则按规范解析的工具取不到说明文字
5. 约定俗成的 `## Optional` 分组放「上下文不够时可以跳过」的次要链接

本框架的生成规则（`llms.txt.ts`）：
- 摘要用 `site.tagline`（定义句），正文段用 `site.description`。
- 链接一律绝对地址（`absoluteUrl`），说明取分类导语 / 作品摘要 / 文章描述。
- 条目太多时只列最新 `MAX_WORKS`（200）条并注明总数，完整列表交给 sitemap。
- **不手写静态 `public/llms.txt`**：会和实际内容脱节。
- 新增内容类型时在 `llms.txt.ts` 加一个 `## 分组`（`/collection` 命令的步骤之一）。
- 次要页面（关于、站点地图）已放在 `## Optional` 分组；新增的次要链接也放这里。
- 编码：`deploy/nginx/default.conf` 的 `location = /llms.txt` 用 `types { text/plain txt; }` + `charset utf-8;` 显式声明，
  线上以 `text/plain; charset=utf-8` 返回。不要改回 `default_type`——nginx 的 `default_type` 只在扩展名没有被
  `types`（mime.types）映射时才生效，`.txt` 早已映射为 `text/plain`（nginx 官方文档 `default_type` / `types`）。
  自己写 nginx 配置（方式 B）照抄这个 location 时，`charset utf-8;` 不能漏。

### 3. 页面写法（内容作者规范）

| 规则 | 做法 | 例 |
|------|------|-----|
| 首段定义句 | 第一句回答「这是什么」：`X 是 Y` | 「next-ai-astro 是一个 AI 驱动的 Astro 内容站框架……」 |
| 一段一事 | 段落短，一段只讲一个点 | 长段拆成列表 |
| 结构化表达 | 对比、参数、步骤用表格 / 有序列表 | 本技能各节就是示例 |
| 标题带结论 | `h2` 写结论而不是容器名 | 「三类最常见的静默错误」优于「问题分析」 |
| 数据带出处 | 数字写明来源与时间；没有来源的数字不写 | 「据 XX 2026-05 报道」 |
| 实体一致 | 站名、作者名、产品名全站同一写法 | 统一取 `site.name` / `site.author.name` |
| 日期可见 | 文章显示发布 / 更新日期（`<time datetime>`） | 文章页已实现 |
| 不写报幕句 | 删「下面我们来看看」「本文将介绍」 | 直接说事 |

分类导语（`categories.json` 的 `description`）与作品摘要同样按「定义句」写：它们同时出现在分类页 meta、分类页正文和 llms.txt 里。

### 4. FAQ

- 问题用用户真实会问的话；答案首句直接给结论，再补一两句依据。
- 只放**真实**问答，页面可见；FAQPage 标记在 Google 已不产生富结果（见 `seo-meta`），但问答本身仍是
  AI 容易直接摘取的内容形态（推断：问答对与「问题 → 答案」检索形式天然匹配），所以保留。
- 数据放 `src/data/faq.json`，不要写死在页面里。

### 5. 上线后：站长平台

| 平台 | 做什么 | 原因 |
|------|-------|------|
| Bing Webmaster Tools | 验证站点、提交 `sitemap-index.xml` | Bing 搜索本身的收录；Bingbot 按普通搜索引擎爬虫对待 |
| Google Search Console | 验证、提交 sitemap、看索引覆盖 | Google 搜索与 AI Overviews |
| 百度搜索资源平台 | 验证、提交 sitemap（中文站） | 国内搜索 |
| IndexNow | 内容更新后主动推送 URL | Bing 等支持 IndexNow 的引擎可更快发现变更；接入方式走工作站 ai-seo-studio 的 `indexnow-push` |

这些操作需要站点所有者的账号，属于对外操作：由用户在平台上完成，或经工作站技能指导完成，AI 不代为登录。

**ChatGPT 搜索**：能否出现在 ChatGPT 搜索结果里由 `OAI-SearchBot` 决定（OpenAI 官方爬虫文档：屏蔽它的网站不会出现在搜索答案里），
保持它在 robots 里 `allow: true` 即可；不要写「ChatGPT 联网检索走 Bing 索引」这类没有官方出处的说法。

---

## 与工作站 ai-seo-studio 的分工

本框架负责**站内机制与写法**（代码层面保证每次构建都正确）；深度的**诊断、调研、平台操作**走工作站（ai-workstation MCP：`route` → `get_skill`）：

| 需求 | 工作站技能（ai-seo-studio） |
|------|------------------------|
| 判断爬虫能否看到内容（JS 渲染风险） | `crawler-visibility` |
| 全站 GEO 诊断与改写建议 | `geo-optimization` |
| llms.txt 评审 | `llms-txt` |
| 零点击 / 摘要型内容写法 | `zero-click-content` |
| 站长平台验证、多引擎提交、IndexNow | `webmaster-verify` / `multi-search-engine` / `indexnow-push` / `baidu-webmaster` |
| 上线后验证 | `deploy-verify` |
| 关键词研究、竞品 | `keyword-research` / `competitor-seo` |

框架命令 `/seo-check` 会先跑本地 `pnpm check:seo`，再按需调用上面的工作站技能做审计。
（工作站技能名以 `route` 实际返回为准。）

---

## 检查清单

- [ ] 内容在服务端 HTML 里（没有用 `client:only` 渲染正文）
- [ ] `ai-crawlers.json` 每项的 `allow` 符合站点所有者意愿（training / search / user 三类已逐一确认），不想被训练是靠 `allow: false` 而不是删条目
- [ ] llms.txt 覆盖所有内容类型，链接为绝对地址、`- [标题](url): 说明` 用 ASCII 冒号，说明是定义句
- [ ] 首页、分类页、详情页、文章首段是定义句
- [ ] 数字都有出处，没有编造
- [ ] FAQ 真实、可见、数据在 `faq.json`
- [ ] 上线后已在 Bing / Google / 百度站长平台提交 sitemap（用户操作）
- [ ] `pnpm check:seo` 全绿

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| AI 回答说不出本站是做什么的 | 首段不是定义句 / tagline 空泛 | 重写 `site.tagline` 与各页首段 |
| llms.txt 里是旧内容 | 手写了 `public/llms.txt` 覆盖了端点 | 删静态文件，用 `llms.txt.ts` |
| llms.txt 中文乱码 | 服务器没声明 UTF-8 | 框架 nginx 的 server 级 `charset utf-8;` 已覆盖 `.txt`；换了托管平台要重新确认响应头 |
| 删掉 GPTBot 条目后它仍在抓 | 名单外的爬虫落到 `User-agent: *` 组，被 `Allow: /` 放行 | 保留条目并设 `allow: false` |
| ChatGPT-User / Perplexity-User 设了 false 仍有访问 | 用户触发类，官方说明 robots.txt 可能不适用 / 通常被忽略 | 属预期；需要强制拦截只能在服务器层按 UA 处理（先评估误伤） |
| 列表内容对爬虫不可见 | island 用了 `client:only` | 改 `client:load` 等会服务端渲染的指令 |
| AI 引用了错误数字 | 页面上有无出处的数字被当成事实 | 删除或补出处 |
| check:seo 报某爬虫缺显式分组 / 与 allow 不一致 | `robots.txt.ts` 被改成不读名单，或输出格式被改动 | robots 与校验都应只从 `src/data/ai-crawlers.json` 取名单与策略 |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `seo-meta` | title / description / canonical / JSON-LD / sitemap |
| `content-collections` | 定义句所在的数据字段（tagline、分类导语、摘要） |
| `astro-routing` | robots.txt / llms.txt 端点写法 |
| `deployment-guide` | nginx 对 txt 文件的编码与缓存 |

## 参考

- llms.txt 规范：https://llmstxt.org/
- OpenAI 爬虫（GPTBot / OAI-SearchBot / ChatGPT-User）：https://developers.openai.com/api/docs/bots
- Anthropic 爬虫（ClaudeBot / Claude-SearchBot / Claude-User）：https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity 爬虫（PerplexityBot / Perplexity-User）：https://docs.perplexity.ai/guides/bots
- Google-Extended：https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- Applebot / Applebot-Extended：https://support.apple.com/en-us/119829
- nginx `default_type` / `types`：https://nginx.org/en/docs/http/ngx_http_core_module.html#default_type
- Bing Webmaster Tools：https://www.bing.com/webmasters
- Google Search Console：https://search.google.com/search-console
- 百度搜索资源平台：https://ziyuan.baidu.com/
- IndexNow：https://www.indexnow.org/
- 工作站 SEO 技能目录：`E:\my\AI工作站\projects\ai-seo-studio\.claude\skills\`
