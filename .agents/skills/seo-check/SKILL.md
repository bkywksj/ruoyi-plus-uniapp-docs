---
name: seo-check
description: |
  /seo-check - 上线前 SEO / GEO 验收：本地构建 + check:seo 逐页校验，再按需调工作站 ai-seo-studio 深度审计，输出问题清单与修复建议

  参数：[--local 只做本地部分] [线上地址]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /seo-check，或描述同类意图时，按本文流程执行。）

  触发词：/seo-check、seo-check
---

# /seo-check - 上线前 SEO / GEO 验收

内容站的 SEO 错误几乎都是**静默失败**：构建成功、页面能打开、字段也写了，但值是错的（canonical 全指首页、全站共用一条描述、og:url 两个、robots 把本想放行的 AI 搜索爬虫挡在外面）。
本命令分三层把它们找出来：**脚本逐页校验 → 人工清单核对 → 工作站深度审计**。

## 用法

| 用法 | 做什么 |
|------|-------|
| `/seo-check` | 三层全做（第三层会调用 ai-workstation，消耗工作站额度） |
| `/seo-check --local` | 只做第一、二层，不调工作站（`/dev-loop` 收尾时用这个） |
| `/seo-check https://<域名>` | 站点已上线：第三层对线上地址审计，并核对线上 robots / sitemap / llms.txt |

激活技能：`seo-meta`、`geo-optimization`；涉及性能时加 `performance-doctor`。

---

## 第一层：构建 + 脚本校验（必做）

```bash
pnpm build        # 含 astro check
pnpm check:seo    # 扫描 dist/，任一 error 退出码为 1
```

`scripts/check-seo.mjs` 覆盖的项（**这些不用再人工查**）：

| 类别 | 校验内容 |
|------|---------|
| 每页 | `<html lang>`、`<title>` 非空（超 60 字给警告）、meta description 恰好 1 个且非空（少于 20 字给警告） |
| 收录页（非 noindex） | canonical 恰好 1 个且等于本页绝对地址、og:url 恰好 1 个且等于 canonical、og:title / og:description / og:image 齐全且 og:image 为绝对地址、`<h1>` 恰好 1 个 |
| 图片（收录页） | 每张 `<img>` 有 `alt` 属性；缺 `width` / `height` 给警告（CLS） |
| 结构化数据（收录页） | 每段 JSON-LD 可解析且有 `@context` / `@type` |
| 全站 | 标题、描述不得跨页重复 |
| 站内链接（含 404 等 noindex 页） | **站内死链**：链到的页面在 `dist/` 里不存在（常见于 `getStaticPaths` 拿到空数据）；**缺结尾斜杠**：`/works/a` 这类不带斜杠又不是文件的链接（`trailingSlash: always`） |
| 站点文件 | `robots.txt` 有绝对地址 Sitemap 行；`src/data/ai-crawlers.json` 名单里的每个爬虫都有显式分组，且 `Allow: /` / `Disallow: /` 与名单的 `allow` 字段一致（名单按 `purpose` 区分搜索 / 用户触发 / 训练类，策略只改这份 JSON）；`User-agent: *` 整站 Disallow 给警告；`sitemap-index.xml` 存在；`llms.txt` 存在且以「# 站点名」开头 |

- 有 ❌ 错误 → 逐条修复后重跑，**第一层不绿不往下走**
- ⚠️「site.url 仍是占位域名」→ 上线前必须改 `src/site.config.ts` 的 `url`

---

## 第二层：人工清单（脚本管不到的判断题）

逐项核对，结果写进报告：

### 2.1 站点配置
- [ ] `src/site.config.ts` 的 `url` 是真实生产域名（不带结尾斜杠），`name` / `description` / `tagline` 已换成本站内容
- [ ] `tagline` 是一句「X 是 Y」的定义句（首页 H1 下方 + llms.txt 引言都用它）
- [ ] `public/og-default.png` 已换成本站分享图（1200×630）；`public/favicon.svg` 已换
- [ ] 国内服务器：`icp` 已填备案号

### 2.2 内容质量（抽查首页、一个列表页、一个分类页、三个详情页、一篇文章）
- [ ] 标题含核心关键词，读起来像人写的，不是关键词堆砌
- [ ] description 70~160 字，写明「这页是什么 + 有什么」，列表 / 分类页带数量或分类名
- [ ] 详情页首段就是结论（定义句），每段只讲一件事；能用表格 / 列表的地方没写成长段落
- [ ] 分类的 `description`（分类落地页导语）是完整的定义句，不是「这里是 xx 分类」
- [ ] 标题层级连续：页面唯一 `h1`，区块 `h2`，卡片 `h3`（分类页卡片为 `h2`）

### 2.3 结构化数据选型
- [ ] 首页：`WebSite`（+ `FAQPage`，且问答在页面上可见）
- [ ] 列表 / 分类页：`BreadcrumbList` + `CollectionPage`
- [ ] 详情页：`BreadcrumbList` + 与内容语义匹配的类型（视频 `VideoObject`、软件 `SoftwareApplication`、商品 `Product`、通用 `CreativeWork`）；必填字段按 schema.org / Google 文档补齐
- [ ] 文章：`Article`（含 `datePublished` / `dateModified`）
- [ ] 抽 2-3 个页面，把 `dist/` 里的 JSON-LD 贴到 Google Rich Results Test / Schema Markup Validator 人工验证（给用户链接，由用户操作）

### 2.4 爬虫可见性
- [ ] 关键内容在**无 JS 时**就在 HTML 里：`grep -q "<关键文案>" dist/<页面>/index.html && echo 在HTML里`（HTML 已压缩成一行，只看有没有，不数行数）
- [ ] island 没有用 `client:only`（那会让服务端不输出内容）
- [ ] 列表页首屏在 HTML 里；分页 / 「加载更多」之外的条目由详情页 + 分类页 + sitemap 保证收录
- [ ] `grep -o "<loc>" dist/sitemap-*.xml | wc -l` 与预期页面数一致（sitemap 是单行文件，不能用 `grep -c`，那只会得到 1）；404 页不在 sitemap 里

### 2.5 GEO
- [ ] `dist/llms.txt` 内容准确：分类、主要条目、文章都在，链接可访问，没有示例残留
- [ ] 新增的集合已纳入 `src/pages/llms.txt.ts`（不在就是漏了）
- [ ] AI 爬虫策略符合需求：`src/data/ai-crawlers.json` 每项 `{ name, purpose: search|user|training, allow }`，`robots.txt` 按 `allow` 输出 `Allow: /` / `Disallow: /`；搜索类（search）与用户触发类（user）通常放行，训练类（training）按需求文档「AI 爬虫策略」决定。策略只改这份 JSON，不手改 robots
- [ ] 页面里的数据写明出处；没有无法核实的数字

### 2.6 性能速查（深入交给 `performance-doctor`）
- [ ] `ls -la dist/_astro/*.js`：React 运行时只在有 island 的页面加载；首页不应有 island 就不该有大 JS
- [ ] 首屏图片（LCP 候选）`loading="eager"` + `fetchpriority="high"`，其余懒加载
- [ ] 远程封面已走构建期优化（域名在 `site.imageDomains`，输出为 `/_astro/*.webp`）

---

## 第三层：工作站深度审计（按需，`--local` 跳过）

调用【AI 工作站】的 ai-seo-studio（每次 `route` / `get_skill` 都消耗额度，命中后再取详情，不做探索性空调）：

1. `route(query="审计 <站点名> 的 SEO 与 GEO：静态站 Astro，检查爬虫可见性、SSG 元信息、结构化数据、llms.txt")`
2. 按命中结果 `get_skill(ai-seo-studio, <技能>)`，常用：

| 工作站技能 | 用途 |
|-----------|------|
| `crawler-visibility` | 先判型：爬虫实际看到的内容与用户看到的是否一致 |
| `ssg-seo` | 静态站元信息的静默失败模式（canonical / description / og:url） |
| `structured-data` | 结构化数据类型选择与必填字段 |
| `geo-optimization` / `llms-txt` | AI 搜索引用优化、llms.txt 内容 |
| `sitemap-robots` | sitemap 与 robots 策略 |
| `meta-generator` | 批量改写标题 / 描述 |
| `webmaster-verify` / `indexnow-push` / `baidu-webmaster` | 上线后的站长平台接入与主动推送 |

3. 按技能文档对 `dist/`（或线上地址）执行审计；工作站给出的修改建议**落回本项目时仍须遵守本框架规范**（`SEOHead` / `src/lib/seo.ts` 属框架核心：孵化项目里改它们要单独提交、scope 写 `framework`，框架仓库本身正常提交）。
4. 工作站 MCP 不可用 → 在报告里注明「第三层未执行」，不影响第一、二层结论。

---

## 输出报告

```markdown
# SEO / GEO 验收报告

**时间**：{YYYY-MM-DD HH:MM}　**范围**：{本地 dist / 线上地址}

## 结论
{✅ 可以上线 / ❌ 需修复 X 项后再上线}

## 第一层：check:seo
- 页面数：N；错误：X；警告：Y（逐条列出未消除的警告及原因）

## 第二层：人工清单
| 项 | 结果 | 说明 |
|----|------|------|
| site.url 为真实域名 | ✅ / ❌ | |
| … | | |

## 第三层：工作站审计
{执行了哪些技能、发现的问题；未执行则写原因}

## 问题清单
| 级别 | 问题 | 位置 | 修复建议 |
|------|------|------|---------|
| 🔴 | … | 文件:行 / URL | … |
| 🟡 | … | | |

## 上线后待办
- [ ] Bing 站长工具提交 sitemap
- [ ] 需要出现在 ChatGPT 搜索时，确认 `OAI-SearchBot` 在 `src/data/ai-crawlers.json` 里是放行的（是否出现在 ChatGPT 搜索由 OAI-SearchBot 决定，见 OpenAI 官方爬虫文档）
- [ ] 百度搜索资源平台提交 sitemap（国内站点）
- [ ] 需要时接入 IndexNow 主动推送
- [ ] 一段时间后复查收录与 AI 引用情况
```

- 🔴 问题修复后提交 `fix(seo): …`；只改文案的提交也用 `fix(seo)`，这样进度统计能看到（改的是框架核心文件时按上文单独提交、scope 写 `framework`）
- 不替用户去站长平台操作（需要用户账号），只给步骤

## 与其他命令的关系

| 命令 | 关系 |
|------|------|
| `pnpm check:seo` | 本命令第一层的脚本；日常验证门里每轮都跑 |
| `/check` | 源码规范检查；/seo-check 是构建产物 + 站点层面的验收 |
| `/deploy` | 部署前应先通过 /seo-check（至少 `--local`） |
| `/dev-loop` `/dev-orchestrate` | 循环收尾时跑 `/seo-check --local` |
