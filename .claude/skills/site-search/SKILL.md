---
name: site-search
description: 站内搜索：内置 src/lib/search.ts 多词子串匹配（中文友好、零依赖）的用法与扩展，以及何时换 Pagefind 构建期全文索引。触发词：搜索、站内搜索、Pagefind、检索、全文搜索、搜索框、中文搜索、全站搜索、搜不到、相关度、MiniSearch、Fuse
---

# 站内搜索（next-ai-astro）

## 何时使用

- 列表页要加搜索框 / 调整搜索排序
- 搜不到中文、搜索结果顺序不合理
- 想做全站搜索（跨作品、文章全文）
- 数据量变大，前端搜索变慢或页面体积过大
- 有人提议引入 MiniSearch / Fuse 这类分词库

## 概述

内容站的搜索分两种量级：
- **条目级检索**（几百到几千条，搜标题 / 标签 / 分类 / 摘要）→ 框架内置 `src/lib/search.ts`，在 island 里实时过滤。
- **全文检索**（文章正文、数据上万）→ 构建期生成索引的 Pagefind，按需加载分片索引。

---

## 本框架现状

### `src/lib/search.ts`

| 函数 | 作用 |
|------|------|
| `normalize(text)` | `NFKC` 规范化（全角转半角）+ 小写 + 压缩空白 |
| `parseQuery(query)` | 按空白拆词，空查询返回 `[]`（= 不过滤） |
| `scoreItem(item, terms)` | 每个词都必须命中（AND）；标题开头命中 12 分、标题包含 8、标签 5、分类 4、摘要 2；任一词不命中返回 0 |
| `searchItems(items, query)` | 过滤 + 按分数降序，同分保持原顺序（稳定排序） |

在 `WorksExplorer` 里的使用顺序：**先按分类 / 标签过滤 → 按用户选的排序排 → 有搜索词时再按相关度重排**。

单测：`tests/unit/search.test.ts`（中文子串命中、AND 语义、标题优先、空查询保持顺序）。

### 为什么不用 MiniSearch / Fuse.js

这类库默认按空格等分隔符分词，**中文句子没有空格，整句会变成一个 token**：搜「静态站」时，
标题「静态站也能做好搜索」被当作一个整体 token，前缀 / 模糊匹配都不一定命中。
子串匹配对中文天然准确；几千条数据量级下线性扫描也足够快，且零依赖、行为完全可预测。

---

## 标准做法

### 1. 给新集合加搜索

1. 页面 frontmatter 里把条目转成**精简**的卡片数据（只带要展示和要检索的字段）。
2. island 里调 `searchItems(items, query)`；条目需要有 `title`，可选 `summary` / `tags` / `category`。
3. 其他字段要参与检索时，映射到这四个字段之一（例如把 UP 主名拼进 `summary`），**不要随手改 `scoreItem` 的权重**
   （`src/lib/search.ts` 是框架核心）；确需新权重时补单测，在孵化项目里单独一个提交、scope 写 `framework`。

```tsx
const results = useMemo(
  () => searchItems(items.map((item) => ({ ...item, category: item.categoryName })), query),
  [items, query],
);
```

### 2. 搜索框交互规范

- `type="search"`，有 `label`（可 `sr-only`），placeholder 写明可搜什么：「搜索标题、标签、分类…」。
- 输入即过滤，不需要「搜索」按钮；搜索词同步到 URL `?q=`（见 `islands-interaction` 的 URL 同步模式）。
- 水合前用户已在输入框里打的字要保留（`WorksExplorer` 已处理，新搜索框照做）。
- `?q=` 是用户输入原文：统计侧靠 Umami 的 `data-exclude-search="true"` 不上报查询参数（见 `analytics`），不要再把搜索词写进自定义事件。
- 结果数量区域 `aria-live="polite"`；无结果时给出清除筛选的出口。
- 搜索结果页（`?q=` 的 URL）不需要单独被收录；列表页本身的 canonical 不带查询参数（`SEOHead` 用 `Astro.url.pathname`，天然不带）。

### 3. 性能边界

前端搜索要把数据作为 props 内联进页面 HTML：
- 数据 ≤ 约一两千条、每条只带短字段时没问题；
- 如果 `/works/` 页面 HTML 体积明显变大（构建后看 `dist/works/index.html` 大小），先精简传入字段（去掉长简介），
  再考虑 Pagefind。

> 这里不给具体阈值数字：以构建后的实际 HTML 体积和真机输入响应为准（`performance-doctor` 可测 INP）。

---

## 扩展做法：Pagefind 全文检索

### 什么时候换

| 需求 | 方案 |
|------|------|
| 只搜作品标题 / 标签 / 分类 | 保持 `search.ts` |
| 要搜文章正文、跨内容类型的全站搜索 | Pagefind |
| 数据量大到内联进页面已明显拖慢加载 | Pagefind |

### Pagefind 的工作方式（官方文档）

- 构建完成后对**输出目录**建索引：`npx -y pagefind --site <输出目录>`，本框架输出目录是 `dist`。
- 索引写到输出目录下的 `pagefind/`，搜索时浏览器按需加载索引分片。
- 语言识别依赖 `<html lang>`（本框架由 `site.locale` 输出 `zh-CN`）。
- **中文支持**：官方多语言文档说明，对不以空格分词的语言支持分词（「support segmentation for words not separated by whitespace」），
  例如 `每個月都` 会被索引为 `每個`、`月`、`都`；该能力在 Pagefind 的 extended 版本中提供，`npx pagefind` 默认即 extended。

### 接入步骤

1. 把 `pagefind` 装成 devDependency（`pnpm add -D pagefind`，锁版本，别用 `npx -y` 现拉），**索引直接并进 `build`**（`package.json`）：

   ```json
   "build": "astro check && astro build && pagefind --site dist",
   "build:fast": "astro build && pagefind --site dist"
   ```

   🔴 **不要另起一个 `build:search` 只在它里面建索引。** 托管平台（EdgeOne / Cloudflare Pages / Vercel 等，见 deployment-guide）
   默认只跑 `pnpm build`，索引永远不会生成：线上 `/pagefind/` 全部 404，搜索弹窗一直提示「索引未生成」，
   而本地因为手动跑过 `build:search` 一切正常 —— aibid-docs 上线后才发现（2026-10-30 实录）。
   想保留旧命令名就让它当别名：`"build:search": "pnpm build"`。

   Dockerfile 跑的是 `pnpm build:fast`（不含 `astro check`，类型检查留在提交前的验证门），上面已把索引并进 `build:fast`，镜像不用另改。
   `package.json` 属于项目配置、`Dockerfile` 属于框架核心：在孵化项目里改 `Dockerfile` 要单独一个提交、scope 写 `framework`。

2. 标注要索引的区域（官方 indexing 文档）：
   - 正文容器加 `data-pagefind-body`。🔴 **一旦站内任何页面出现 `data-pagefind-body`，没有这个属性的页面都不会被索引**，
     所以要么全站主要页面都加，要么都不加。
   - 页头、页脚、相关推荐等加 `data-pagefind-ignore`（`data-pagefind-ignore="all"` 表示完全排除）。
   - 需要在结果里显示的元数据用 `data-pagefind-meta`。
   建议做法：在 `works/[id].astro` 与 `posts/[...id].astro` 的主内容 `<article>` 上加 `data-pagefind-body`。

3. 放搜索 UI：Pagefind 构建时会生成组件 UI 资源，官方示例（当前版本）：

   ```html
   <link href="/pagefind/pagefind-component-ui.css" rel="stylesheet" />
   <script src="/pagefind/pagefind-component-ui.js" type="module"></script>

   <pagefind-modal-trigger></pagefind-modal-trigger>
   <pagefind-modal></pagefind-modal>
   ```

   这些资源只有构建 + 索引之后才存在，`pnpm dev` 下看不到效果，要 `pnpm build && pnpm preview` 验证。
   UI 的样式需要用 CSS 变量覆盖成本站令牌（`--canvas` / `--ink` / `--brand` 等），以官方 UI 文档为准。

4. 验证：`pnpm preview` 打开页面搜中文词、搜文章正文里的句子；检查 `dist/pagefind/` 存在。
   `pnpm check:seo` 会兜底：页面引用了 `/pagefind/` 而 `dist/pagefind/pagefind-entry.json` 不存在就报错。
   上线后再匿名请求一次 `<域名>/pagefind/pagefind-entry.json`，200 才算线上真有索引。

### 注意

- Pagefind 的 UI 组件与资源路径随版本变化，接入时以 https://pagefind.app/docs/ 当前版本为准，不要照抄旧教程里的 `PagefindUI` 写法。
- `pagefind/` 目录是构建产物，不入库（`dist/` 已在 `.gitignore`）。
- 两套搜索可以并存：列表页筛选继续用 `search.ts`，全站搜索入口用 Pagefind。

---

## 检查清单

- [ ] 条目级检索用 `searchItems`，没有引入按空格分词的搜索库处理中文
- [ ] 传给 island 的数据只含必要字段
- [ ] 搜索框有 label、placeholder、`aria-live` 结果数、空状态
- [ ] 搜索词同步 URL，canonical 不带查询参数
- [ ] 改动 `search.ts` 时补了单测
- [ ] 用 Pagefind 时：构建脚本与 Dockerfile（`build:fast` 之后）都加了索引步骤；`data-pagefind-body` 全站一致

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 中文搜不到 | 用了按空格分词的库 | `search.ts` 子串匹配，或 Pagefind |
| 全角字母搜不到 | 没做 NFKC 规范化 | 用 `normalize()` |
| 搜索后排序乱了 | 相关度排序覆盖了用户选择的排序 | 框架设计如此：有搜索词按相关度，无搜索词按用户排序 |
| Pagefind 搜不到某类页面 | 其他页面有 `data-pagefind-body`，这类页面没有 | 补属性或全站去掉 |
| 线上没有搜索结果 | Docker 构建没跑 pagefind | 构建命令改为带索引的版本 |
| dev 下搜索框报 404 | Pagefind 资源构建后才生成 | 用 build + preview 验证 |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `islands-interaction` | 搜索框 island 的状态、URL 同步、水合 |
| `test-development` | `search.ts` 的单元测试 |
| `performance-doctor` | 数据量增大后的体积与 INP |
| `deployment-guide` | 构建流程里加入索引步骤 |

## 参考

- Pagefind 入门：https://pagefind.app/docs/
- Pagefind 索引属性（data-pagefind-body / ignore / meta）：https://pagefind.app/docs/indexing/
- Pagefind 多语言与中文分词：https://pagefind.app/docs/multilingual/
