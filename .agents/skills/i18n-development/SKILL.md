---
name: i18n-development
description: 多语言站点：Astro i18n 路由配置与默认值、页面与内容的语言组织、界面文案字典、语言切换、hreflang 与 canonical、多语言 sitemap 与 llms.txt。触发词：国际化、多语言、i18n、英文版、语言切换、hreflang、多语言路由、双语、locale、currentLocale、getRelativeLocaleUrl、多语言SEO
---

# 国际化开发

## 何时使用

- 站点要加英文版 / 多语言版本
- 配置 i18n 路由、语言前缀、默认语言
- 语言切换器、按语言生成链接
- hreflang、多语言 SEO、多语言 sitemap
- 界面文案（按钮、导航、提示语）的翻译组织

## 先判断：真的需要 i18n 吗

| 情况 | 建议 |
|------|------|
| 只是个别页面有英文 | 不上 i18n 路由，单独写 `/en/about/` 这类页面即可 |
| 整站要有完整的第二语言版本，且会持续维护 | 上 i18n（本技能） |
| 想靠机器翻译批量生成英文页 | 不建议：未经审校的译文质量差，还会以重复/低质内容影响收录 |

多语言意味着**每一条内容都要维护两份**。立项前和用户确认翻译由谁负责、谁审校。

## 框架现状（单语言）

| 位置 | 现状 | 多语言时要改 |
|------|------|------------|
| `src/site.config.ts` | `locale: 'zh-CN'`，站名/描述/导航都是中文 | 按语言拆出文案 |
| `src/layouts/BaseLayout.astro` | `<html lang={site.locale}>` | 改为按页面语言输出 |
| `src/components/seo/SEOHead.astro` | `og:locale` 取 `site.locale`；无 hreflang | 加 `locale` 与 `alternates` 参数 |
| `src/lib/format.ts` | `formatDate` 固定 `zh-CN` 格式 | 按语言格式化 |
| `astro.config.ts` | 无 `i18n` 配置；sitemap 无 i18n 选项 | 加两处配置 |
| `src/pages/llms.txt.ts` | 只有一份 | 默认语言一份，其他语言可加 `/en/llms.txt` |

`BaseLayout`、`SEOHead`、`format.ts` 属于框架核心：在框架仓库里正常提交；在孵化项目里单独一个提交、scope 写 `framework`
（如 `feat(framework): 支持多语言`，见 CLAUDE.md「框架核心 vs 业务代码」）。无论哪种，都要保持单语言站点行为不变（新参数带默认值）。

---

## 1. 路由配置

```ts
// astro.config.ts
export default defineConfig({
  i18n: {
    locales: ['zh-cn', 'en'],
    defaultLocale: 'zh-cn',
    routing: {
      prefixDefaultLocale: false, // 中文在 /，英文在 /en/ —— 已有中文 URL 不变，不丢收录
    },
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: {
        defaultLocale: 'zh-cn',
        locales: { 'zh-cn': 'zh-CN', en: 'en-US' }, // 值是 hreflang 用的语言代码
      },
    }),
  ],
});
```

### v6 起的默认值变化（别照旧教程写）

| 配置 | 现在的行为 |
|------|-----------|
| `routing.redirectToDefaultLocale` | **默认 `false`**，且只在 `prefixDefaultLocale: true` 时有效 |
| `routing.prefixDefaultLocale` | 默认 `false`（默认语言不带前缀） |
| `locales` 写成 `{ path, codes }` 对象 | 官方指南「Custom locale paths」下的 Limitations 写着需要 `output: 'server'`、不能有预渲染页；本框架只用字符串形式 |

> 存疑说明：上面那段 Limitations 还提到 `X-Forwarded-Host` 请求头，内容更像是 `domains` 一节的限制被排在了这里（2026-09 核对 withastro/docs 源文件）。
> 本框架按官方原文保守处理——静态站不用对象形式；真需要 `/french/` 这类自定义前缀时，先实测构建再决定。

> 旧教程里「开了 i18n 访问 `/` 自动跳到 `/zh-cn/`」的行为，现在需要同时设置 `prefixDefaultLocale: true` 与 `redirectToDefaultLocale: true`。
> 本框架推荐默认语言不带前缀，不需要这组跳转。写配置前用 context7 查 `/withastro/docs` 的 internationalization 指南核对当前版本。

### URL 结构

```
/                     中文首页（默认语言，无前缀）
/works/               中文作品列表
/works/<id>/          中文作品详情
/en/                  英文首页
/en/works/            英文作品列表
/en/works/<id>/       英文作品详情
```

## 2. 页面组织

默认语言页面保持在 `src/pages/` 原位；英文页放 `src/pages/en/`，**两边都只做薄壳**，渲染逻辑放共享组件：

```
src/
├── i18n/
│   ├── ui.ts                 # 界面文案字典 + t()
│   └── utils.ts              # localePath() 等
├── components/pages/
│   └── HomePage.astro        # 首页真正的内容，接收 locale
├── pages/
│   ├── index.astro           # <HomePage locale="zh-cn" />
│   └── en/
│       └── index.astro       # <HomePage locale="en" />
```

```astro
---
// src/pages/en/index.astro：英文首页薄壳
import HomePage from '@/components/pages/HomePage.astro';
---
<HomePage locale="en" />
```

动态路由（详情页）两边各有一个 `[id].astro`，`getStaticPaths` 只返回**有该语言内容**的条目，不要为没翻译的内容生成空壳页。

## 3. 界面文案字典

```ts
// src/i18n/ui.ts：界面文案（导航、按钮、提示语）；内容本身不放这里，放内容集合
export const locales = ['zh-cn', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-cn';

export const ui = {
  'zh-cn': {
    'nav.home': '首页',
    'nav.works': '作品',
    'works.search': '搜索标题、标签、分类…',
    'works.empty': '没有找到匹配的作品',
  },
  en: {
    'nav.home': 'Home',
    'nav.works': 'Works',
    'works.search': 'Search titles, tags, categories…',
    'works.empty': 'No matching works found',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof ui)['zh-cn'];

/** 取文案：缺译时回退默认语言，并在开发期暴露出来 */
export function t(locale: Locale, key: UiKey): string {
  const value = (ui[locale] as Record<string, string>)[key];
  if (value === undefined && import.meta.env.DEV) console.warn(`[i18n] 缺少 ${locale} 文案：${key}`);
  return value ?? ui[defaultLocale][key];
}
```

- 用 `satisfies` 让「英文字典少了一个 key」在 `astro check` 阶段就暴露（给 `en` 也标注完整键类型即可强制对齐）
- React island 不能直接读 Astro 上下文：在 `.astro` 里把需要的文案算好，作为 props 传进去（如 `labels={{ search: t(locale, 'works.search') }}`）

## 4. 生成链接（注意结尾斜杠）

```ts
// src/i18n/utils.ts
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from './ui';

/**
 * 按语言生成站内路径，并保证带结尾斜杠（本框架 trailingSlash: 'always'）。
 * 不同配置下 getRelativeLocaleUrl 的结尾斜杠行为不一定一致，这里统一兜底，避免 canonical 与链接不一致。
 */
export function localePath(locale: Locale, path = ''): string {
  const url = getRelativeLocaleUrl(locale, path.replace(/^\//, ''));
  return url.endsWith('/') || /\.[a-z0-9]+$/i.test(url) ? url : `${url}/`;
}
```

- 当前页语言：`Astro.currentLocale`（静态页按 URL 推断）
- `workPath()` / `categoryPath()` 这类路径函数加可选 `locale` 参数，内部调 `localePath`
- 写完跑 `pnpm build && pnpm check:seo`：check-seo 会逐页核对 canonical 与文件路径一致，斜杠不对会直接报错

## 5. 内容的多语言

| 内容类型 | 推荐组织 | 查询 |
|---------|---------|------|
| Markdown 文章 | **中文留在原位** `src/content/posts/*.md`（id 与 URL 都不变）；英文放 `src/content/posts/en/*.md` | 在 `src/lib/posts.ts` 里按 id 前缀区分：英文 = `id.startsWith('en/')`，中文 = 其余 |
| JSON 数据（作品） | 同一条目加 `title_en` / `summary_en` 等字段，或分两个文件 | schema 里把译文字段设为 optional，缺译的条目不生成英文页 |
| 分类 | `categories.json` 每条加 `name_en`、`description_en` | 同上 |

🔴 为什么中文不挪进 `posts/zh-cn/`：glob 的 id 由文件路径生成，挪进去后 id 变成 `zh-cn/intro`，现有 `/posts/intro/` 全部变成
`/posts/zh-cn/intro/`，已收录的地址全部 404——违反本技能「已有中文 URL 不变」的前提。

配套改动：

- `getPosts()` 加 `locale` 参数且**默认只返回中文**（排除 `en/` 开头的条目）。首页、`/posts/`、`/posts/[...id]`、`llms.txt` 都调 `getPosts()`，
  不加过滤英文文章会混进中文列表、中文详情路由和中文 llms.txt。
- 英文详情页 `src/pages/en/posts/[...id].astro` 调 `getPosts('en')`，`params.id` 用**去掉 `en/` 前缀**的 id，URL 为 `/en/posts/intro/`；
  `postPath(id, locale)` 同样按语言拼前缀，别让 URL 出现两段语言目录（`/en/posts/en/intro/`）。
- 配对规则：去掉 `en/` 前缀后 id 相同即为同一篇（`posts/intro.md` ↔ `posts/en/intro.md`），语言切换器和 hreflang 靠它配对。
- 中文文章的子目录不要叫 `en/`；想彻底隔离也可以拆成两个集合（`posts` / `postsEn`），代价是查询封装多一套。

## 6. SEO：hreflang 与 canonical

每个有多语言版本的页面，`<head>` 里要有**完整、双向**的 alternate 集合（包括指向自己）：

```html
<link rel="canonical" href="https://example.com/en/works/a/" />
<link rel="alternate" hreflang="zh-CN" href="https://example.com/works/a/" />
<link rel="alternate" hreflang="en-US" href="https://example.com/en/works/a/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/works/a/" />
```

规则：
- **canonical 永远指向本语言页面自己**，不要把英文页 canonical 指向中文页（那等于告诉搜索引擎「英文页是重复内容」）
- hreflang 必须双向：中文页列出英文页，英文页也要列出中文页
- 只列真实存在的译文页；没翻译的页面不出现在 alternate 里
- `x-default` 指向默认语言页

实现方式：给 `SEOHead` 加可选参数 `alternates?: { hreflang: string; path: string }[]`，由页面传入；`<html lang>` 与 `og:locale` 改为读页面语言（`BaseLayout` 透传 `locale`，默认 `site.locale`）。
sitemap 配了 `i18n` 选项后会自动输出 `xhtml:link` 备用链接，与页面内 hreflang 相互印证。

### llms.txt

默认语言保留 `/llms.txt`；英文站可再加 `src/pages/en/llms.txt.ts` 生成 `/en/llms.txt`，内容只列英文页面。

## 7. 语言切换器

```astro
---
import { localePath } from '@/i18n/utils';
// 页面把自己的「语言 → 路径」映射传进来；没有译文的语言不出现在切换器里
interface Props {
  current: string;
  versions: { locale: 'zh-cn' | 'en'; label: string; path: string }[];
}
const { current, versions } = Astro.props;
---
<nav aria-label="切换语言">
  {versions.map((v) => (
    <a href={localePath(v.locale, v.path)} hreflang={v.locale} lang={v.locale}
       aria-current={v.locale === current ? 'true' : undefined}>{v.label}</a>
  ))}
</nav>
```

- 切换后停留在**同一内容的另一语言版本**，没有译文时退回该语言首页
- 不要根据浏览器语言自动跳转（静态站做不到可靠判断，还会让爬虫只看到一种语言）

## 8. 翻译流程

1. 中文定稿后再翻译，避免反复同步
2. 翻译可走 AI 工作站的翻译项目（ai-translator，经 ai-workstation MCP），**必须附术语表**（产品名、功能名固定译法）
3. 人工审校后再提交；未审校的译文不上线
4. 日期、数字按语言格式化：`Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', { timeZone: 'Asia/Shanghai' })`

## 检查清单

- [ ] `astro.config.ts` 的 `i18n` 与 sitemap `i18n` 两处配置一致
- [ ] 默认语言无前缀，已有中文 URL 未变化（中文文章没有挪目录；构建前后对比 `dist/posts/` 目录名）
- [ ] `getPosts()` 默认只返回中文，英文文章没有出现在中文列表 / 首页 / `/llms.txt`
- [ ] 所有站内链接经 `localePath()` 生成且带结尾斜杠
- [ ] 每页 `<html lang>`、`og:locale` 与页面语言一致
- [ ] canonical 自指，hreflang 双向完整、只列真实存在的译文
- [ ] 界面文案无硬编码中文残留在英文页（`grep -rn "[一-龥]" dist/en --include=*.html` 抽查）
- [ ] `pnpm build && pnpm check:seo` 全绿

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `astro-routing` | 路由与 `getStaticPaths` 的通用写法 |
| `content-collections` | 多语言字段 / 目录的 schema 设计 |
| `seo-meta` | SEOHead 的整体规范；本技能只补 hreflang 相关部分 |
| `geo-optimization` | 多语言站的 llms.txt 与 AI 爬虫策略 |
