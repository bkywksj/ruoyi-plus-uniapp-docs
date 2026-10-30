---
name: content-collections
description: Astro 7 内容集合（站点数据库表）：file/glob loader、Zod 4 schema、reference 关联、render、查询封装与新增内容类型。触发词：内容集合、content.config、schema、zod、字段、getCollection、getEntry、reference、新增内容类型、Markdown文章、frontmatter、metrics
---

# 内容集合（next-ai-astro）

## 何时使用

- 新增一种内容（视频、项目、产品、案例、作者……），与 `/collection` 命令配合
- 给现有内容加字段 / 改字段类型 / 加校验（含 `works.metrics` 的键名与单位）
- 写 Markdown 文章、定义 frontmatter
- 两类内容之间要建立关联（作品 → 分类、文章 → 作者）
- getCollection / getEntry / render 用法不确定
- 构建报 schema 校验失败

## 概述

内容集合是本框架的**唯一数据源**：页面、端点（llms.txt）、sitemap、搜索索引看到的数据都来自集合。
集合定义在 `src/content.config.ts`，数据文件在 `src/data/`（JSON）与 `src/content/`（Markdown）。
**页面不直接 `getCollection`**，而是调 `src/lib/<集合>.ts` 里的查询封装，保证各处排序和字段一致。

> 🔴 Astro 6 起旧版内容集合 API 已**完全移除**，训练数据里的写法大多失效，见文末「禁止写法对照」。
> 拿不准查 context7 `/withastro/docs`。

---

## 本框架现状

`src/content.config.ts` 定义了三个集合：

| 集合 | loader | 数据位置 | 维护方式 | 对应页面 |
|------|--------|---------|---------|---------|
| `categories` | `file('src/data/categories.json')` | JSON 数组 | 手工 | `/works/category/<id>/` |
| `works` | `file('src/data/works.json')` | JSON 数组 | `scripts/sync` 生成或手工 | `/works/`、`/works/<id>/` |
| `posts` | `glob({ pattern: '**/*.md', base: './src/content/posts' })` | Markdown | 手写 | `/posts/`、`/posts/<id>/` |

关键设计：
- `works.category` 是 `reference('categories')`：写在 JSON 里是分类 id 字符串，读出来是 `{ collection, id }`。
- id 字段带正则校验（会进 URL）：分类 `^[a-z0-9-]+$`，作品 `^[A-Za-z0-9_-]+$`。
- `works.metrics` 的 `views`（次数）与 `duration`（秒）是框架代码读取的保留键，见下文 3.1。
- 查询封装在 `src/lib/works.ts`：`getWorks()`（按日期倒序）、`getCategories()`（按 order）、`relatedWorks()`、
  `countByCategory()`、`toCardData()`（服务端解析封面后转成卡片数据）。

---

## 标准做法

### 1. 定义集合（Astro 7 写法）

```ts
// src/content.config.ts
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const authors = defineCollection({
  loader: file('src/data/authors.json'),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    homepage: z.url({ protocol: /^https?$/ }).optional(), // Zod 4 顶层函数；会进 <a href> 的链接必须限定协议
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: reference('authors'),           // 单个关联
    related: z.array(reference('posts')).default([]), // 多个关联
    draft: z.boolean().default(false),
  }),
});

export const collections = { authors, posts };
```

三个导入来源不能混：
- `defineCollection` / `reference` / `getCollection` / `getEntry` / `render` ← `astro:content`
- `glob` / `file` ← `astro/loaders`
- `z` ← `astro/zod`

### 2. loader 怎么选

| loader | 数据形态 | id 来源 | 适合 |
|--------|---------|--------|------|
| `file('x.json')` | 一个文件里的数组（每项必须有 `id`）或对象 | 数组项的 `id` 字段 | 同步脚本生成的数据、分类、FAQ 类小表 |
| `glob({ pattern, base })` | 一个目录下多个文件 | 由文件相对路径（去扩展名）生成的 **URL 友好 slug**（`2026/Hello World.md` → `2026/hello-world`） | Markdown 文章、每条一个 JSON 的数据 |

- `file()` 的 JSON 是数组时，**每项必须有唯一 `id`**，否则构建报错。
- `glob()` 的 id 会被规范化（转小写、空格变连字符等）；frontmatter 里写 `slug: xxx` 可覆盖单条 id，也可给 `glob()` 传
  `generateId` 自定义规则（官方 content-collections 指南「Defining custom IDs」）。**文件名别用中文 / 空格**，否则 URL 不可控。
- `glob()` 的 id 可能带 `/`，对应路由要用 `[...id].astro`（见 `astro-routing`）。

### 3. Zod 4 常用写法

| 需求 | 写法 |
|------|------|
| 日期（JSON 里是字符串） | `z.coerce.date()` |
| URL / 邮箱 | `z.url({ protocol: /^https?$/ })` / `z.email()`（Zod 4 顶层函数，不要 `z.string().url()`；🔴 裸 `z.url()` 放行 `javascript:`，会进 href 的字段必须限定协议） |
| 可选 + 默认值 | `z.array(z.string()).default([])`；`.default()` 的值必须符合输出类型 |
| 枚举 | `z.enum(['video', 'article'])` |
| 键值对 | `z.record(z.string(), z.number())`（Zod 4 要求两个参数） |
| 进 URL 的 id | `z.string().regex(/^[A-Za-z0-9_-]+$/, '说明为什么')` |
| 数字范围 | `z.number().int().nonnegative()` |

校验失败信息写中文说明（regex 第二个参数），构建报错时一眼看懂。

### 3.1 `works.metrics` 的保留键与单位

`metrics` 目前是 `z.record(z.string(), z.number())`，键名自定；但下面两个键**已被框架代码读取**
（`src/lib/works.ts` 的 `toCardData()`、`src/pages/works/[id].astro`），语义与单位固定：

| 键 | 含义 | 单位 / 类型 | 被谁使用 |
|----|------|------------|---------|
| `views` | 平台公开的播放 / 浏览次数（B 站 `play`、文章阅读数等） | 非负整数 | 卡片「N 次浏览」、详情页「浏览」、`popular` 排序；结构化数据的 `interactionStatistic`（见 `seo-meta`） |
| `duration` | 时长 | **秒**，非负整数（平台给 `MM:SS` 时换算） | 卡片时长角标、详情页「时长」；`VideoObject.duration`（换算成 ISO 8601） |

- 其他键（`comments`、`likes`…）可以自由加，但页面不会自动展示，要用就在 lib 与页面里显式读。
- 详情页把 `views` 标成「浏览」；视频站想显示「播放」，改页面文案即可，不要换键名。
- 🔴 只放平台真实返回的数字。框架示例 `works.json` 里的数字是演示用的，孵化后必须替换——它们一旦进了 `interactionStatistic`，就是对搜索引擎的声明。
- 想让保留键在构建期就被校验（推荐），把 schema 收紧为「保留键有类型 + 其余键仍只能是数字」：

```ts
metrics: z
  .object({
    views: z.number().int().nonnegative().optional(),    // 播放 / 浏览次数
    duration: z.number().int().nonnegative().optional(), // 秒
  })
  .catchall(z.number())
  .optional(),
```

  改完跑 `pnpm astro sync`；数据源映射出小数或负数时构建会直接报出来，而不是在页面上显示成「-1 次浏览」。

### 4. 查询：一律走 lib 封装

```ts
// src/lib/authors.ts
// authors 集合的查询封装：页面只调这里
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Author = CollectionEntry<'authors'>;

export async function getAuthors(): Promise<Author[]> {
  const authors = await getCollection('authors');
  return authors.sort((a, b) => a.data.name.localeCompare(b.data.name, 'zh-CN'));
}

export function authorPath(id: string): string {
  return `/authors/${id}/`;
}
```

- `getCollection(name, filter)`：第二个参数过滤，如 `({ data }) => !data.draft`。
- **排序写在封装里**，页面、端点、llms.txt 都调同一个函数 → 顺序永远一致。
- 路径函数和集合放在一起（`workPath` / `categoryPath` 模式）。

### 5. 解析关联

```astro
---
import { getEntry, getEntries } from 'astro:content';
const author = await getEntry(post.data.author);        // { collection, id } → 完整条目
const related = await getEntries(post.data.related);    // 数组
---
```

批量场景（列表页每条都要分类名）不要逐条 `getEntry`，而是**一次取全量再查表**：
`src/lib/works.ts` 的 `toCardData(work, categories)` 就是这样做的。

### 6. 渲染 Markdown

```astro
---
import { render } from 'astro:content';
const { Content, headings } = await render(post); // headings 可做目录
---
<div class="prose-content"><Content /></div>
```

- `render(entry)` 函数，不是 `entry.render()`。
- `headings` 是 `{ depth, slug, text }[]`，做文章目录用。
- Astro 7 默认 Markdown 管线是 **Sätteri**；要用 remark / rehype 插件，要么把插件移植到 Sätteri，要么重新安装
  `@astrojs/markdown-remark` **并在配置里把 processor 设为 `unified()`**（只装包不改配置不会生效；见 Astro 7 升级指南「Markdown Processor」）。
  配置项的确切写法以 context7 `/withastro/docs` 当前版本为准。

### 7. 改 schema 后

```bash
pnpm astro sync     # 重新生成 .astro/ 下的类型
pnpm build          # astro check 会按新类型检查所有页面
```

dev server 运行中改 schema 时，重启 dev server 才能拿到新类型。

---

## 新增一种内容类型（完整步骤，/collection 命令按此执行）

以「视频」为例，目标：`/videos/`、`/videos/<id>/`、按系列的落地页。

1. **定 schema**（`src/content.config.ts`）：先想清楚哪些字段进 URL（id）、哪些要筛选（分类 / 标签）、
   哪些进 SEO（标题、摘要、封面、日期），再写 Zod。关联用 `reference()`。
2. **放数据**：
   - 外部来源 → 先写数据源 `scripts/sync/sources/<name>.mjs`（见 `data-sync`），`pnpm sync <name> --dry-run` 看映射结果，再正式写入。
   - 手工维护 → 在 `src/data/<name>.json` 写 2~3 条真实样例，不写假数据。
3. **写查询封装** `src/lib/<name>.ts`：列表排序、路径函数、卡片数据转换（封面走 `resolveCover`）。
4. **写页面**（见 `astro-routing`）：列表页 / 详情页 / 分类落地页，全部经 `BaseLayout`，结构化数据按 `seo-meta` 选型。
5. **接入站点级产物**：
   - `src/pages/llms.txt.ts` 增加该集合的段落
   - `site.config.ts` 的 `nav` 加入口
   - 首页需要露出的话加一个 `Section`
6. **验证门**：`pnpm build && pnpm check:seo && pnpm test`；列表页有 island 的，走 `e2e-test` 截图验收。

---

## 扩展做法

### 数据文件的 JSON Schema 提示

Astro 会在 `.astro/collections/<name>.schema.json` 生成 JSON Schema，可用于编辑器补全与校验：

- **「一个文件一条数据」的 `glob()` 集合**（如 `src/data/authors/armand.json`）：在文件里写 `$schema`，值是从数据文件到 schema 的相对路径：

  ```json
  { "$schema": "../../../.astro/collections/authors.schema.json", "name": "Armand" }
  ```

- **`file()` 数组集合**（本框架的 `works.json`、`categories.json`）：根是数组，放不了 `$schema` 字段。改用 VS Code 的
  `json.schemas` 设置按路径关联（官方指南「Use a schema for a group of JSON files in VS Code」），关联后是否对数组逐项校验以编辑器实际表现为准。

### 远程数据直接作为 loader

loader 可以是返回数组的异步函数，但**本框架不这样做**：构建期直连外部接口会让构建依赖网络与对方可用性，
接口一挂站点就构建失败或变空。外部数据统一先经 `scripts/sync` 落成 JSON 并提交，构建只读本地文件。

### 草稿

posts 已有 `draft` 字段：所有查询都要带 `({ data }) => !data.draft` 过滤（列表、详情 getStaticPaths、llms.txt、首页）。
新集合如需草稿机制，同样在封装函数里统一过滤，不要让页面各自处理。

---

## 检查清单

- [ ] 导入来源正确：`astro:content` / `astro/loaders` / `astro/zod`
- [ ] 进 URL 的 id 有正则约束
- [ ] 日期用 `z.coerce.date()`，URL 用 `z.url({ protocol: /^https?$/ })`（裸 `z.url()` 放行 `javascript:`）
- [ ] 查询封装在 `src/lib/<集合>.ts`，页面不直接 `getCollection` + 排序
- [ ] 关联用 `reference()`，批量解析用「全量查表」而不是逐条 `getEntry`
- [ ] 改完 schema 跑了 `pnpm astro sync`
- [ ] 新集合已接入 llms.txt、导航、sitemap（页面存在即自动进 sitemap）
- [ ] 示例 / 真实数据没有编造的数字；`metrics.views` 是整数次数、`metrics.duration` 是秒

---

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| `z is not exported from astro:content` | 旧写法 | `import { z } from 'astro/zod'` |
| `entry.slug is undefined` | Astro 6 已移除 `slug` 属性 | `entry.id` |
| `entry.render is not a function` | 旧 API | `const { Content } = await render(entry)` |
| `getEntryBySlug is not a function` | Astro 6 已移除 | `getEntry(collection, id)` |
| 构建报 `src/content/config.ts` 相关错误 | 旧位置 | 配置文件是 `src/content.config.ts` |
| `z.string().url()` 类型警告 / 报错 | Zod 4 写法变化 | `z.url({ protocol: /^https?$/ })` |
| `z.record(z.number())` 报错 | Zod 4 需要键类型 | `z.record(z.string(), z.number())` |
| JSON 集合报缺少 id | `file()` 数组项必须有 `id` | 数据源映射时补 `id` |
| 页面拿到的 `category` 是对象不是字符串 | `reference()` 读出来是 `{ collection, id }` | 用 `.id` 或 `getEntry()` |
| 新增字段后页面类型没更新 | 没 sync | `pnpm astro sync` / 重启 dev |
| 草稿文章出现在 llms.txt | 某处查询漏了 draft 过滤 | 过滤写进封装函数 |

### 禁止写法对照（Astro 4/5 → 7）

| 禁止 | 正确 |
|------|------|
| `src/content/config.ts` | `src/content.config.ts` |
| `type: 'content'` / `type: 'data'` | `loader: glob(...)` / `loader: file(...)` |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` |
| `entry.slug` / `entry.render()` | `entry.id` / `render(entry)` |
| `getEntryBySlug()` / `getDataEntryById()` | `getEntry()` |
| `Astro.glob('../content/*.md')` | 内容集合，或 `import.meta.glob(..., { eager: true })` |

---

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `data-sync` | 外部数据怎么拉取、映射、安全落盘到 `src/data/*.json` |
| `astro-routing` | 集合数据怎么变成 URL（getStaticPaths / 分页） |
| `seo-meta` | 集合字段怎么进 title / description / JSON-LD |
| `site-search` | 集合数据怎么进前端检索 |
| `image-optimization` | 集合里的封面字段怎么在构建期优化 |

## 参考

- 内容集合指南：https://docs.astro.build/en/guides/content-collections/
- `astro:content` API 参考：https://docs.astro.build/en/reference/modules/astro-content/
- Astro 6 升级指南（旧 API 移除、Zod 4）：https://docs.astro.build/en/guides/upgrade-to/v6/
- Astro 7 升级指南（Sätteri Markdown 管线）：https://docs.astro.build/en/guides/upgrade-to/v7/
