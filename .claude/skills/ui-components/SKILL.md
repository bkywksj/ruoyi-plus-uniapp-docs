---
name: ui-components
description: 现有组件与页面搭建：BaseLayout、Container、Section、Button、Badge、Breadcrumbs、WorkCard 的 props，语义令牌速用、响应式栅格、静态与 island 两用卡片。触发词：组件、按钮、卡片、布局、样式、Tailwind、响应式、移动端适配、断点、Container、Section、Badge
---

# 组件与页面搭建（ui-components）

## 何时使用

- 开发或修改页面、区块、卡片、列表
- 不确定该用哪个现有组件、props 怎么传（Button / Breadcrumbs / WorkCard…）
- 响应式 / 移动端适配、断点、栅格
- 新建一种卡片或列表项，想同时用于静态区块和 island
- Tailwind 类名怎么写才符合令牌约定、标准页面骨架怎么搭

## 🔴 强制规则

1. **先用现有组件**：页面骨架 `BaseLayout`、宽度 `Container`、区块 `Section`、按钮 `Button`、标签 `Badge`、面包屑 `Breadcrumbs`
2. **只用语义令牌**：`bg-canvas` `bg-surface` `bg-elevated` `text-ink` `text-muted` `border-line` `bg-brand` `bg-brand-soft` `bg-brand-strong` `text-brand-ink`
3. **静态优先**：组件默认写 `.astro`；需要同时在 island 里用的写 `.tsx`（只吃算好的数据）
4. **移动优先**：先写手机样式，再用 `sm:` `md:` `lg:` 往上加

---

## 组件总览

### `BaseLayout`（`src/layouts/BaseLayout.astro`）

所有页面的唯一骨架：`<html lang>`、品牌色注入、主题脚本、SEO 头、统计、页头页脚、「跳到正文」链接。

| prop | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 页面标题，不含站名（自动拼 ` \| 站名`）；首页不传 |
| `description` | `string` | 每页必须不同，建议 70~160 字 |
| `image` | `string` | 分享图，站内路径或绝对地址；默认 `site.ogImage` |
| `type` | `'website' \| 'article'` | 详情 / 文章页用 `article` |
| `noindex` | `boolean` | 不希望收录的页面 |
| `jsonLd` | `JsonLd[]` | 结构化数据数组 |
| `publishedTime` / `modifiedTime` | `Date` | 文章时间 |

具名插槽 `head`：往 `<head>` 追加内容（如预加载）。

```astro
<BaseLayout title={title} description={description} jsonLd={[breadcrumbJsonLd(crumbs)]}>
  ...
</BaseLayout>
```

### `Container`（`ui/Container.astro`）

全站唯一的水平留白与最大宽度来源。

| prop | 取值 | 效果 |
|------|------|------|
| `size` | `'default'`（默认） | `max-w-6xl` —— 列表、首页 |
| | `'narrow'` | `max-w-3xl` —— 文章、关于等阅读页 |
| `class` | string | 追加类名（常用来加上下内边距 `py-10 sm:py-14`） |

内边距固定 `px-4 sm:px-6 lg:px-8`，**页面里不要再写水平 padding**。其余 `div` 属性透传。

### `Section`（`ui/Section.astro`）

页面分区：统一的标题层级（h2）与上下间距（`py-12 sm:py-16`），内部自带 `Container`。

| prop | 说明 |
|------|------|
| `title`（必填） | h2 文本 |
| `description` | 标题下的说明 |
| `eyebrow` | 标题上方的小号引导词（`text-brand-ink`） |
| `id` | 区块锚点；同时生成 `<id>-title` 供 `aria-labelledby` |
| `class` | 追加类名，交替底色用 `class="bg-surface"` |

插槽：默认插槽放内容；`slot="action"` 放右上角「查看全部」一类链接。

```astro
<Section id="featured" eyebrow="从这里开始" title="精选作品" description="第一次来，建议先看这几条。">
  <a slot="action" href="/works/" class="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
    查看全部 <ArrowRight class="size-4" aria-hidden="true" />
  </a>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">...</div>
</Section>
```

### `Button`（`ui/Button.astro`）

| prop | 取值 | 说明 |
|------|------|------|
| `href` | string | 有则渲染 `<a>`，否则 `<button>` |
| `variant` | `primary`（默认）/ `secondary` / `ghost` | primary 用 `bg-brand-strong` + 白字（两种主题下对比度 ≥ 4.5:1） |
| `size` | `md`（默认，h-10）/ `lg`（h-12） | |
| `type` | `button` / `submit` | 仅 `<button>` |
| `class` | string | 追加类名 |

其余属性（`target`、`rel`、`aria-*`、`disabled`、`data-*`…）**透传给实际渲染的元素**：有 `href` 时落到 `<a>`，否则落到 `<button>`
（`Button.astro` 两个分支都展开了 `...rest`）。所以纯图标按钮直接 `<Button aria-label="…">` 即可；`target` / `rel` 只对 `<a>` 形态有意义。

```astro
<Button href={work.data.url} size="lg" target="_blank" rel="noopener">
  查看原作品 <ArrowUpRight class="size-4" aria-hidden="true" />
</Button>
<Button href="/posts/" size="lg" variant="secondary">阅读文章</Button>
```

### `Badge`（`ui/Badge.astro`）

| prop | 取值 |
|------|------|
| `tone` | `neutral`（默认，`bg-surface text-muted`）/ `brand`（`bg-brand-soft text-brand-ink`） |
| `href` | 有则渲染链接（分类、标签跳转） |
| `class` | 追加类名 |

### `Breadcrumbs`（`ui/Breadcrumbs.astro`）

prop `crumbs: Crumb[]`（`{ name, path }`，来自 `@/lib/seo`）。最后一项渲染为 `aria-current="page"` 文本。
🔴 同一个 `crumbs` 数组必须同时传给 `breadcrumbJsonLd()`，可见面包屑与结构化数据保持一致。

### `WorkCard`（`works/WorkCard.tsx`）

| prop | 说明 |
|------|------|
| `work` | `WorkCardData`（由 `toCardData` / `toCardList` 在服务端生成） |
| `eager` | `true` → `loading="eager"`（不懒加载）。**列表 / 分类页前 3 张**设 `true`（桌面端第一行） |
| `priority` | `true` → `fetchPriority="high"`。**整页只给 1 张**：LCP 候选（首页精选第一张、列表 / 分类页第 1 张） |
| `headingLevel` | `'h3'`（默认）/ `'h2'`（卡片是页面的一级内容时，如分类页） |

两者分开的原因：多张图同时 `fetchpriority="high"` 等于没有优先级，还会和 LCP 图抢带宽；「不懒加载」可以给一整行，「高优先级」只给一张。
写法示例：`<WorkCard work={work} eager={index < 3} priority={index === 0} />`。

`WorkCardData` 字段：`id` `title` `summary` `href` `categoryId` `categoryName` `tags` `date` `dateISO` `timestamp`
`cover`（`{ src, srcSet?, width, height }`）`duration?` `views?` `popularity`。

另导出 `coverTransitionName(id)`：详情页封面用它设置 `view-transition-name`，与卡片形成形变过渡。

### 布局部件（`components/layout/`）

| 组件 | 说明 |
|------|------|
| `SiteHeader` | 吸顶毛玻璃页头；导航来自 `site.nav`；`md` 以下用 `<details>` 菜单，外加一小段 `<script>`：点菜单外部 / 按 Esc / 点链接后自动收起（不是 island） |
| `SiteFooter` | 站点简介、导航、社交、备案号（`site.icp` 为空不显示） |
| `ThemeToggle` | 暗色切换按钮（`.astro` 内 `<script>`） |
| `ThemeScript` / `Analytics` | 由 BaseLayout 引入，页面不直接用 |

---

## 「静态 + island」两用组件写法

卡片这类组件既出现在首页静态区块，又出现在筛选列表 island 里。做法（照 `WorkCard.tsx`）：

```
lib/<集合>.ts        toXxxCardData(entry)   ← 服务端：格式化日期、解析图片、裁剪字段
        │
        ▼ XxxCardData（只含字符串 / 数字 / 数组 / 普通对象）
components/<业务>/XxxCard.tsx   ← 纯展示，不取数、不调 getImage
        │
        ├─ .astro 页面直接 <XxxCard data={...} />          → 静态 HTML，零 JS
        └─ islands/XxxExplorer.tsx 内部渲染 <XxxCard />      → 随筛选重绘
```

要点：
- `.tsx` 里用 `className`，图标用 `lucide-react`
- 在 `.astro` 中使用时**不加** `client:*`，它就只是服务端渲染的 HTML
- 数据类型命名 `XxxCardData`，放在组件文件里导出，`lib` 反向引用类型即可

### 整卡可点

```tsx
<article className="group relative ... has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand">
  ...
  <h3><a href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-hidden">{title}</a></h3>
</article>
```

链接的 `::after` 铺满卡片：读屏只读到一个链接（标题），比给整个 `<article>` 套 `<a>` 更规范；键盘聚焦时卡片出现品牌色描边。
链接自身用 `outline-hidden` 而不是 `outline-none`：Tailwind v4 的 `outline-none` 是真正的 `outline-style: none`，
`outline-hidden` 才是「平时透明、Windows 强制色模式下仍可见」的旧行为（Tailwind v4 升级指南）。

---

## 设计令牌速用

| 用途 | 类名 |
|------|------|
| 页面底色 / 交替区块底色 / 卡片底色 | `bg-canvas` / `bg-surface` / `bg-elevated` |
| 正文 / 次要文字 | `text-ink` / `text-muted` |
| 边框、分割线 | `border-line`、`divide-line` |
| 链接、强调文字 | `text-brand-ink` |
| 装饰色块、圆点 | `bg-brand`、`bg-brand/15`、`bg-brand-soft` |
| 选中态胶囊 | `bg-ink text-canvas`（反色） |
| 卡片圆角 / 阴影 | `rounded-[var(--radius-card)]`、`shadow-[var(--shadow-card)]`、`hover:shadow-[var(--shadow-card-hover)]` |
| 缓动 | `ease-[var(--ease-out-soft)]` |

暗色模式自动生效（令牌在 `.dark` 下换值），**一般不需要写 `dark:` 变体**；只有图标切换这类显隐才用 `dark:hidden` / `dark:block`。
令牌定义与扩展见 `design-system`。

---

## 响应式

Tailwind v4 默认断点：`sm` 640px、`md` 768px、`lg` 1024px、`xl` 1280px、`2xl` 1536px。

### 常用栅格

| 场景 | 类名 |
|------|------|
| 卡片列表（首页区块、相关推荐） | `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3` |
| 卡片列表（列表页、分类页，更宽的容器） | `grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3` |
| 分类入口 | `grid grid-cols-1 gap-4 md:grid-cols-3` |
| 详情页左图右文 | `grid gap-10 lg:grid-cols-12` + `lg:col-span-7` / `lg:col-span-5` |
| 移动端横滑的胶囊组 | `-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0`，并隐藏横向滚动条（写法以 `WorksExplorer.tsx` 分类条为准，别另起一套） |

### 字号层级（已在现有页面中使用，新页面沿用）

| 位置 | 类名 |
|------|------|
| 首页 H1 | `text-4xl leading-tight font-semibold tracking-tight text-pretty sm:text-5xl` |
| 列表 / 分类页 H1 | `text-3xl font-semibold tracking-tight sm:text-4xl` |
| 详情页 H1 | `text-2xl leading-snug font-semibold tracking-tight text-pretty sm:text-3xl` |
| 区块 H2（Section） | `text-2xl font-semibold tracking-tight sm:text-3xl` |
| 导语 | `leading-7 text-muted`（首页 Hero 用 `text-lg leading-8`） |
| 元信息 | `text-xs text-muted` / `text-sm text-muted` |

🔴 中文标题用 `text-pretty`，不用 `text-balance`（会把「十分钟」拆成「十分 / 钟」）。

### 移动端要点

- 触控目标至少 40px 高（按钮 `h-10` 起，输入框 `h-11`）——这是本框架自定的约定，高于 WCAG 2.2 的最低要求
  （2.5.8 Target Size (Minimum) 为 24×24 CSS px；2.5.5 AAA 级为 44×44），不要把 40 说成标准值
- 横向内容用横滑而不是换行挤压
- 页头导航 `md` 以下收进 `<details>` 菜单
- 验收时手机视口与桌面视口都要截图（见 `e2e-test`）

---

## 标准页面骨架

### 列表页

```astro
---
// <栏目>列表页
import BaseLayout from '@/layouts/BaseLayout.astro';
import Container from '@/components/ui/Container.astro';
import Breadcrumbs from '@/components/ui/Breadcrumbs.astro';
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo';

const crumbs: Crumb[] = [{ name: '首页', path: '/' }, { name: title, path: '/xxx/' }];
---

<BaseLayout title={title} description={description} jsonLd={[breadcrumbJsonLd(crumbs)]}>
  <Container class="py-10 sm:py-14">
    <Breadcrumbs crumbs={crumbs} />
    <header class="mt-6 mb-10 max-w-2xl space-y-3">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p class="leading-7 text-muted">{description}</p>
    </header>
    <!-- 静态网格，或 <XxxExplorer client:load ... /> -->
  </Container>
</BaseLayout>
```

### 阅读页（文章、关于）

`<Container size="narrow" class="py-10 sm:py-14">` + 正文包在 `<div class="prose-content">`（样式在 `global.css` 的 `@layer components`）。

### 空状态

两种情况分开处理：

- **页面主体就是这份列表**（分类页、列表页）→ 显示空状态，告诉用户「这里还没有内容」：

```astro
<p class="rounded-[var(--radius-card)] border border-dashed border-line px-6 py-16 text-center text-muted">
  这个分类下还没有作品。
</p>
```

- **首页等聚合页上的一个区块**（精选作品、按分类浏览、最新文章）→ 数据为空时**整块不渲染**，不要留一个只有标题的空 Section：

```astro
{latestPosts.length > 0 && (
  <Section id="posts" title="最新文章">…</Section>
)}
```

---

## 图标

| 场景 | 用法 |
|------|------|
| `.astro` | `import { ArrowRight } from '@lucide/astro';` → `<ArrowRight class="size-4" aria-hidden="true" />` |
| `.tsx` | `import { Search } from 'lucide-react';` → `<Search aria-hidden="true" className="size-4" />` |

装饰性图标一律 `aria-hidden="true"`；只有图标没有文字的按钮必须有 `aria-label`。更多见 `icon-management`。

## 可访问性要点

| 要点 | 现有写法 |
|------|---------|
| 当前页导航 | `aria-current="page"` |
| 导航区域 | `<nav aria-label="主导航">` 等，每个 nav 名称不同 |
| 切换型按钮 | `aria-pressed`（筛选胶囊、主题切换） |
| 动态结果数 | `aria-live="polite"` |
| 区块标题关联 | `Section` 的 `aria-labelledby` |
| 跳到正文 | BaseLayout 自带 `sr-only focus:not-sr-only` 链接 |

## 常见错误

| 错误 | 正确 |
|------|------|
| 页面里自写 `max-w-6xl mx-auto px-4` | `<Container>` |
| `<a class="bg-brand text-white ...">` 做按钮 | `<Button>` |
| 卡片样式在首页和列表页各写一份 | 共用一个 `.tsx` 卡片组件 |
| `.astro` 里用 `className` / `.tsx` 里用 `class` | `.astro` 用 `class`，`.tsx` 用 `className` |
| 用 `dark:bg-gray-900` 适配暗色 | 语义令牌自动适配 |
| 首屏卡片全部 `loading="lazy"`，或前几张都 `fetchpriority="high"` | 列表前 3 张 `eager`，只有第 1 张 `priority`（改善 LCP） |

## 检查清单

- [ ] 页面经 `BaseLayout`，宽度用 `Container`，区块用 `Section`
- [ ] 没有原始色类名和 hex 颜色
- [ ] 卡片类组件静态与 island 共用一份
- [ ] 手机视口下没有横向溢出、触控目标够大
- [ ] 图标装饰性的加了 `aria-hidden`
- [ ] 卡片列表：前 3 张 `eager`，全页只有 1 张 `priority`
- [ ] 区块数据为空（无作品 / 无分类 / 无文章）时整块隐藏，不留空标题（首页即如此）

## 相关技能

`design-system`（令牌与视觉）、`islands-interaction`（island）、`image-optimization`（封面）、`html-to-code`（原型转组件）
