---
name: astro-routing
description: Astro 7 文件路由：页面、getStaticPaths 动态路由、paginate 分页、txt/xml 生成型端点、重定向与 404，本框架为纯静态 + trailingSlash always。触发词：路由、页面、动态路由、getStaticPaths、分页、paginate、重定向、trailingSlash、404、端点、生成txt或xml、URL结构
---

# Astro 路由（next-ai-astro）

## 何时使用

- 新增页面 / 栏目，确定 URL 放在哪
- 需要按集合数据批量生成详情页、分类页、标签页
- 列表太长需要分页（/works/page/2/ 这类）
- 需要生成 txt / xml / json 等非 HTML 文件（robots、llms.txt、feed）
- 改了 URL 结构，需要把旧地址重定向到新地址
- 页面 404、路由冲突、参数取不到

## 概述

Astro 是**文件即路由**：`src/pages/` 下每个 `.astro` / `.md` / `.ts` 文件对应一个 URL。
本框架是纯静态站（`output: 'static'`），所以**所有路由都在构建期展开**：动态路由必须用 `getStaticPaths()`
把全部参数列出来，构建后变成 `dist/` 里的一个个 `index.html`。

> 🔴 写路由相关 API 前，先对照 CLAUDE.md「Astro 7 版本红线」；拿不准查 context7 `/withastro/docs`。

---

## 本框架现状

### 路由清单

| 文件 | URL | 类型 | 说明 |
|------|-----|------|------|
| `src/pages/index.astro` | `/` | 静态 | 首页 |
| `src/pages/works/index.astro` | `/works/` | 静态 + island | 列表，筛选交给 `WorksExplorer` |
| `src/pages/works/[id].astro` | `/works/<id>/` | 动态 | 每条作品一页 |
| `src/pages/works/category/[id].astro` | `/works/category/<id>/` | 动态 | 每个分类一页 |
| `src/pages/posts/index.astro` | `/posts/` | 静态 | 文章列表 |
| `src/pages/posts/[...id].astro` | `/posts/<id>/` | 动态（rest） | id 可能含子目录，所以用 `[...id]` |
| `src/pages/about.astro` | `/about/` | 静态 | |
| `src/pages/404.astro` | `/404.html` | 静态 | 带 `noindex` |
| `src/pages/robots.txt.ts` | `/robots.txt` | 端点 | 动态生成，Sitemap 地址跟随 `site.url` |
| `src/pages/llms.txt.ts` | `/llms.txt` | 端点 | 由集合数据生成 |
| （`@astrojs/sitemap`） | `/sitemap-index.xml` | 集成生成 | 过滤掉 404 |

### 全局约束（`astro.config.ts`）

```ts
export default defineConfig({
  site: site.url,          // 来自 src/site.config.ts，canonical / sitemap 都基于它
  trailingSlash: 'always', // 🔴 所有页面 URL 带结尾斜杠
  compressHTML: true,
  // ...
});
```

- `trailingSlash: 'always'`：`/works/a/` 合法；`/works/a` 在 dev 下不匹配路由，只显示一张提醒你配置了 `always` 的警告页
  （官方 configuration reference）。线上预渲染页的斜杠由托管方处理（本框架 nginx `try_files $uri $uri/` 会 301 补斜杠）。**站内链接一律带结尾斜杠**。
- 带扩展名的端点（`/robots.txt`、`/llms.txt`）**不带**结尾斜杠（Astro 6 起带扩展名的端点不能有结尾斜杠）。
- 链接统一用 `src/lib/works.ts` 的 `workPath()` / `categoryPath()` 生成，不手拼字符串。

---

## 标准做法

### 1. 新增一个静态页面

```astro
---
// 联系我们页
import BaseLayout from '@/layouts/BaseLayout.astro';
import Container from '@/components/ui/Container.astro';
import Breadcrumbs from '@/components/ui/Breadcrumbs.astro';
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo';

const title = '联系我们';
const description = '通过邮件或社交平台联系站点作者，说明合作、投稿与勘误的处理方式。';
const crumbs: Crumb[] = [
  { name: '首页', path: '/' },
  { name: title, path: '/contact/' },
];
---

<BaseLayout title={title} description={description} jsonLd={[breadcrumbJsonLd(crumbs)]}>
  <Container size="narrow" class="py-10 sm:py-14">
    <Breadcrumbs crumbs={crumbs} />
    <h1 class="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
  </Container>
</BaseLayout>
```

放在 `src/pages/contact.astro` → URL `/contact/`。然后在 `src/site.config.ts` 的 `nav` 里加入口（如需要）。

### 2. 动态路由：按集合生成详情页

框架标准写法（参考 `src/pages/works/[id].astro`）：

```astro
---
import type { GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getWorks } from '@/lib/works';

export const getStaticPaths = (async () => {
  const works = await getWorks();
  // params 的值只能是字符串（URL 编码后进路径）；props 把整条数据直接带给页面，省一次查询
  return works.map((work) => ({ params: { id: work.id }, props: { work } }));
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { work } = Astro.props as Props;
---
```

要点：
- 用 `satisfies GetStaticPaths` + `InferGetStaticPropsType` 拿到 props 类型，不要 `any`。
- **params 只能是字符串**（官方：`params are encoded into the URL, so only strings are supported`）。数字 id 要 `String(id)`。
- `getStaticPaths` 里**不要用 `Astro` 对象**（Astro 6 起已弃用），需要站点地址用 `import.meta.env.SITE`。
- id 会直接进 URL：集合 schema 已用正则限制为 `[A-Za-z0-9_-]`，新集合照做（见 `content-collections`）。

### 3. `[id]` 还是 `[...id]`

| 写法 | 匹配 | 适用 |
|------|------|------|
| `[id].astro` | 单段：`/works/a/` | JSON 集合、id 不含斜杠 |
| `[...id].astro` | 多段：`/posts/2026/a/`，也能匹配空 | glob 集合（Markdown 放子目录时 id 带 `/`） |

`posts` 用 `[...id]` 就是因为 `src/content/posts/2026/xxx.md` 的 id 是 `2026/xxx`。

### 4. 分页（paginate）

列表数据量大、又想让每一页都能被收录时，用 `paginate()` 生成真实分页 URL（和 island 的「加载更多」互补：island 管交互，分页页管收录）。

```astro
---
// src/pages/works/page/[...page].astro → /works/page/ 、/works/page/2/ ……
import type { GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCategories, getWorks, toCardList } from '@/lib/works';

export const getStaticPaths = (async ({ paginate }) => {
  const works = await getWorks();
  return paginate(works, { pageSize: 24 });
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { page } = Astro.props as Props;
const cards = await toCardList(page.data, await getCategories());
---
<!-- page.currentPage / page.lastPage / page.url.prev / page.url.next / page.url.first / page.url.last -->
```

`page` 属性（官方 routing reference）：`data`、`start`、`end`、`size`、`total`、`currentPage`（从 1 开始）、`lastPage`、
`url.current` / `url.prev` / `url.next` / `url.first` / `url.last`。

`[page]` vs `[...page]`（官方原话）：`/posts/[page].astro` 生成 `/posts/1`、`/posts/2`…；
`/posts/[...page].astro` 生成 `/posts`、`/posts/2`…（第一页落在根路径）。**本框架用 `[...page]`**：第 1 页就是栏目根地址，
不会另外多出一个 `/1/` 页面；分类内分页时第 1 页正好沿用分类落地页的原 URL，已有收录不受影响。

分类内分页：`paginate()` 支持 `params`，对每个分类各跑一次。

🔴 文件要放在 `src/pages/works/category/[id]/[...page].astro`，它的第 1 页就是 `/works/category/<id>/`，
与现有的 `src/pages/works/category/[id].astro` **是同一个 URL**。所以要**用它替换**旧文件（删掉 `category/[id].astro`，
把其中的面包屑、导语、JSON-LD 搬进新文件），不要两个并存，否则两条路由争同一个地址。

```ts
// src/pages/works/category/[id]/[...page].astro（替换 category/[id].astro）
export const getStaticPaths = (async ({ paginate }) => {
  const [works, categories] = await Promise.all([getWorks(), getCategories()]);
  return categories.flatMap((category) =>
    paginate(
      works.filter((work) => work.data.category.id === category.id),
      { params: { id: category.id }, props: { category }, pageSize: 24 },
    ),
  );
}) satisfies GetStaticPaths;
```

🔴 **分页 URL 与 trailingSlash**：构建后打开 `dist/` 里分页页的 HTML，确认 `page.url.next` 等链接带结尾斜杠；
不带时用 paginate 的 `format` 选项（v7.1.0+）统一补齐，或在模板里手动补。`pnpm check:seo` 会校验每页 canonical
与文件路径一致，分页页也在校验范围内。

分页页的 SEO：
- title / description 带页码（`全部作品 · 第 2 页`），否则 `check:seo` 会报标题、描述重复。
- 每页 canonical 指向**自己**（`SEOHead` 默认如此），不要全部指向第一页。

### 5. 生成型端点（txt / xml / json）

参考 `src/pages/robots.txt.ts`、`src/pages/llms.txt.ts`：文件名 = 输出文件名 + `.ts`，导出 `GET`。

```ts
// src/pages/feed.json.ts → /feed.json
import type { APIRoute } from 'astro';
import { absoluteUrl } from '@/lib/seo';
import { getWorks, workPath } from '@/lib/works';

export const GET: APIRoute = async () => {
  const works = await getWorks();
  const body = works.slice(0, 50).map((work) => ({
    id: work.id,
    title: work.data.title,
    url: absoluteUrl(workPath(work.id)),
  }));
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
```

- 静态模式下端点在构建期执行一次，**只取响应 body 写成文件**（官方 endpoints 指南：「use the contents of the body to generate the file」）；
  `headers` / `status` 只在 dev server 和按需渲染（SSR）里生效。
- 所以线上的 Content-Type 与编码**由部署侧决定**：本框架 nginx 在 server 级写了 `charset utf-8;`，`.txt` 按 mime.types
  映射为 `text/plain` 并带上 `charset=utf-8`。端点里写 `Content-Type: …; charset=utf-8` 只影响 dev 预览，保留无害，但别指望它管线上。
  新增非 txt / json / xml 的扩展名时，到 `deploy/nginx/default.conf` 核对类型与编码（见 `deployment-guide`）。
- 端点里的常量（如 AI 爬虫名单）放 `src/lib/`，不要从页面文件导出。
- 动态端点（`[id].json.ts`）同样需要 `getStaticPaths`。

### 6. 404

`src/pages/404.astro` 构建为 `dist/404.html`，nginx 的 `error_page 404 /404.html` 指向它。
404 页必须 `noindex`（框架已传），并给出回首页 / 回列表的出口。

---

## 扩展做法

### 重定向（改 URL 结构后）

Astro 配置写法（官方 configuration reference）：

```ts
// astro.config.ts
export default defineConfig({
  redirects: {
    '/old-page/': '/new-page/',
    '/blog/[...slug]': '/posts/[...slug]', // 动态路由：新旧两边参数必须一致
  },
});
```

🔴 **本框架是无适配器的纯静态站**：官方说明此时 `redirects` 只会生成带 `<meta http-equiv="refresh">` 的 HTML，
**不支持状态码**。对 SEO 来说需要真 301，所以**正式做法是在 nginx 里写**：

```nginx
# deploy/nginx/default.conf 的 server 块内
location = /old-page/ { return 301 /new-page/; }
location ~ ^/blog/(.*)$ { return 301 /posts/$1; }
```

`redirects` 配置只在「临时、不在乎状态码」时用。`deploy/` 属于框架核心：在框架仓库里正常提交；在孵化出的项目里单独一个提交、
scope 写 `framework`（如 `fix(framework): nginx 增加旧地址 301`），见 CLAUDE.md「框架核心 vs 业务代码」。

### 路由优先级（冲突排查）

同一个 URL 被多个文件匹配时：静态路由 > 带参数的动态路由 > rest 参数路由。
例：`src/pages/works/category/[id].astro` 与 `src/pages/works/[id].astro` 不冲突（段数不同）；
但若新增 `src/pages/works/[...slug].astro`，会与前两者竞争，避免这种写法。

### 需要服务端渲染的单个路由

本框架默认全站预渲染。确有需要（如表单提交）时，先走 `tech-decision`：
需要安装适配器、把 `output` 或单页 `export const prerender = false` 配合使用，还会改变部署方式（不再是纯 nginx 静态托管）。
**不要为了一个小功能把整站改成 SSR**，优先考虑第三方表单服务或独立小服务。

---

## 检查清单

- [ ] 新页面走 `BaseLayout`，传了**唯一**的 title / description
- [ ] 站内链接都带结尾斜杠，且用路径函数生成（`workPath` / `categoryPath` / 新增的同类函数）
- [ ] 动态路由用 `satisfies GetStaticPaths`，params 全是字符串
- [ ] id 类参数有 schema 正则约束，不会出现空格、中文、斜杠（`[...x]` 除外）
- [ ] 分页页标题、描述带页码；canonical 指向自己
- [ ] 新端点的扩展名在 nginx 侧有正确的类型与编码（端点里的 headers 只在 dev 生效）
- [ ] 需要 301 的重定向写在 nginx，不只写 `redirects`
- [ ] 新页面需要进导航的，已改 `site.config.ts` 的 `nav`
- [ ] `pnpm build && pnpm check:seo` 全绿

---

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| dev 下访问 `/works/a` 出现 trailingSlash 警告页 | `trailingSlash: 'always'` | 链接改为 `/works/a/` |
| `getStaticPaths` 报 params 类型错 | 传了数字 | `String(id)` |
| `/posts/2026/xxx/` 404 | 用了 `[id]`，而 glob 集合 id 带斜杠 | 改 `[...id]` |
| 分页第一页是 `/works/page/1/`，栏目根 `/works/page/` 404 | 用了 `[page]`（它只生成 `/1`、`/2`…） | 改 `[...page]`，第 1 页落在根路径 |
| 分类分页后构建日志提示路由冲突 / 分类页内容不对 | `category/[id]/[...page].astro` 与旧的 `category/[id].astro` 并存，第 1 页地址相同 | 删掉旧文件，由分页文件接管 |
| `check:seo` 报「标题重复」 | 分页页、分类页标题没带区分信息 | 标题加页码 / 分类名 / 数量 |
| 改了 URL 后旧链接全 404 | 没做重定向 | nginx `return 301` |
| `robots.txt` 访问变成 `/robots.txt/` | 手动给端点链接加了斜杠 | 带扩展名的端点不加斜杠 |
| 用 `src/fetch.ts` 放工具函数后路由异常 | Astro 7 把它保留给高级路由 | 换文件名 |
| 构建报 `Astro.glob is not a function` | Astro 6 起已移除 | `import.meta.glob(..., { eager: true })`，或改用内容集合 |

---

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `content-collections` | 数据怎么定义与查询；本技能管数据怎么变成 URL |
| `seo-meta` | 每个路由的 title / description / JSON-LD 怎么写 |
| `architecture-design` | 栏目与 URL 层级怎么规划（先规划再落路由） |
| `islands-interaction` | 列表页的前端筛选；分页页负责可收录的静态分页 |
| `deployment-guide` | nginx 侧的 301、404、缓存配置 |

## 参考

- 路由指南：https://docs.astro.build/en/guides/routing/
- 路由参考（paginate / page 属性 / params 规则）：https://docs.astro.build/en/reference/routing-reference/
- 配置参考（redirects、trailingSlash）：https://docs.astro.build/en/reference/configuration-reference/#redirects
- 端点指南（静态模式只取 body 生成文件）：https://docs.astro.build/en/guides/endpoints/
- Astro 6 升级指南（端点斜杠、getStaticPaths 变化）：https://docs.astro.build/en/guides/upgrade-to/v6/
