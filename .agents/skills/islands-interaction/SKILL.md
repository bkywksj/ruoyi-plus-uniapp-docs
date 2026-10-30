---
name: islands-interaction
description: React island 交互：何时需要 island、client:* 指令选择、props 序列化、服务端算好数据再传、URL 状态同步与水合不一致、nanostores 共享状态。触发词：交互、React组件、island、client:load、client:visible、筛选、状态、水合、hydration、nanostores、useState、URL同步
---

# Island 交互（next-ai-astro）

## 何时使用

- 页面上需要搜索、筛选、排序、切换、表单校验、弹层等有状态的交互
- 写 / 改 React 组件（`src/components/islands/`）
- 水合报错、首屏闪一下、控制台 hydration mismatch
- 筛选状态要同步到 URL（可分享链接）
- 两个交互区块之间要共享状态
- JS 体积太大，想减少水合

## 概述

Astro 页面默认输出纯 HTML。只有加了 `client:*` 指令的框架组件才会把 JS 发到浏览器并「水合」成可交互组件，
这些组件就是 island。本框架的立场：**先用 `.astro` 静态组件写，确认有状态再做 island，且范围越小越好。**

构建产物实测（本框架示例站）：React 运行时相关的 `client.*.js` 只在含 island 的页面（`/works/`）加载，首页、详情页、
分类页、文章页都不加载 React。新增 island 时要保持这个特性。

---

## 本框架现状

| 文件 | 说明 |
|------|------|
| `src/components/islands/WorksExplorer.tsx` | 唯一的 island：搜索 + 分类 + 标签 + 排序 + 加载更多，状态同步到 URL |
| `src/components/works/WorkCard.tsx` | **两用组件**：在 `.astro` 里不加指令 = 纯静态 HTML；在 island 里渲染 = 跟随状态重绘 |
| `src/pages/works/index.astro` | 服务端取数、算好卡片数据后 `<WorksExplorer client:load works={cards} categories={...} />` |
| `src/components/layout/ThemeToggle.astro` | 主题切换：用普通 `<script>`，**没有**做成 island |
| `astro.config.ts` | `integrations: [react()]`；React 19 + `@astrojs/react` 7（JSX 由 Oxc 编译） |

---

## 标准做法

### 1. 先判断要不要 island

| 需求 | 做法 | 是否 island |
|------|------|------------|
| 展示数据（列表、卡片、详情） | `.astro` 组件，或 React 组件**不加** `client:*` | 否 |
| 折叠 / 展开、移动端菜单 | `<details>` / `<summary>`（首页 FAQ 就是这样做的）；页头手机菜单是 `<details>` + 一小段 `<script>`（点外部 / Esc / 点链接自动关闭） | 否 |
| 单个按钮切换 class、复制到剪贴板 | `.astro` 里的 `<script>`（打包、去重、每页执行一次） | 否 |
| 几个互斥面板切换（选项卡、价格「按月 / 按年 / 永久」、截图切换） | 单选框 + CSS `:has()`，见下方 1b | 否 |
| 搜索 + 多条件筛选 + 排序（状态互相影响） | React island | 是 |
| 表单实时校验、多步表单 | React island | 是 |
| 多个区块共享同一份客户端状态 | 多个 island + nanostores | 是 |

判断口诀：**状态只影响一个元素 → `<script>`；多个状态互相联动并驱动一片 DOM 重绘 → island。**

### 1b. 互斥切换：单选框 + `:has()`，零 JS

选项卡、计费周期这类「同一时刻只显示一组」的切换，不需要 island，也不需要 `<script>`：
用一组同名单选框记住选中项，父容器用 `:has()` 按选中项隐藏其余面板。所有面板的内容都在 HTML 里，爬虫照样读得到。

```astro
---
const periods = [
  { id: 'yearly', label: '按年' },
  { id: 'monthly', label: '按月' },
];
---
<div class="plans-root">
  <fieldset class="inline-flex gap-1 rounded-full border border-line p-1">
    <legend class="sr-only">付费方式</legend>
    {periods.map((p, i) => (
      <label class="period-opt cursor-pointer rounded-full px-4 py-1.5 text-sm text-muted">
        <input type="radio" name="period" id={`p-${p.id}`} value={p.id} checked={i === 0} class="sr-only" />
        {p.label}
      </label>
    ))}
  </fieldset>
  <p data-p="yearly">¥999 / 年</p>
  <p data-p="monthly">¥99 / 月</p>
</div>

<style>
  .period-opt:has(input:checked) { color: var(--canvas); background: var(--brand); }
  /* 输入框是 sr-only，键盘焦点要画在 label 上，否则 Tab 过去看不见 */
  .period-opt:has(input:focus-visible) { outline: 2px solid var(--brand); outline-offset: 2px; }
  .plans-root:has(#p-yearly:checked) [data-p]:not([data-p='yearly']),
  .plans-root:has(#p-monthly:checked) [data-p]:not([data-p='monthly']) { display: none; }
</style>
```

- 用 `sr-only` 而不是 `display:none` 藏单选框：后者会让单选框离开 Tab 顺序，键盘用户切不了；sr-only 保留方向键切换
- 外面包 `<fieldset>` + `<legend>`，读屏才知道这组按钮是干什么的
- 每个选项的隐藏规则要写一行（`:has(#p-xxx:checked)`），选项是数据驱动的就在 frontmatter 里拼好 `<style set:html>`，或者选项固定时手写
- 局限：刷新会回到默认项、不能分享「选中了按年」的链接。需要写进 URL 或跨区块共享时才升级成 island（见第 4 节）
- aibid-docs 实战：价格页计费周期、首页功能截图选项卡都是这样做的，整站没有 island

### 2. client 指令怎么选

| 指令 | 何时加载（官方） | 本框架用法 |
|------|----------------|-----------|
| `client:load` | 页面加载时立即 | 首屏就要能用的核心交互（列表筛选） |
| `client:idle` | 页面加载完成且 `requestIdleCallback` 触发后 | 首屏可见但不急的（评论区、分享按钮组） |
| `client:visible` | 滚动到可见区域时 | 页面下方的交互区块（相关推荐切换、图表） |
| `client:media="(max-width: 640px)"` | 媒体查询匹配时 | 只在某个尺寸下需要的交互 |
| `client:only="react"` | 跳过服务端渲染，只在客户端渲染 | 🔴 **慎用**：服务端不输出 HTML，爬虫看不到内容；只用于依赖 `window` 且无 SEO 价值的组件 |

除 `client:only` 外，其余指令都会**先在服务端渲染成 HTML** 再水合——这就是 `/works/` 列表对爬虫可见的原因。

### 3. props 必须可序列化，服务端算好再传

官方说明 island 的 props 支持：普通对象、number、string、Array、Map、Set、RegExp、Date、BigInt、URL、
`Uint8Array` / `Uint16Array` / `Uint32Array`、Infinity（其他 TypedArray 如 `Float32Array` 不在列）；
**函数不能传**（无法在客户端执行）。

本框架约定更严格：**只传纯 JSON 数据，且是「卡片需要的最小字段」**。
- 集合条目（`CollectionEntry`）不要整体传：字段多、含内部结构、体积大。
- 需要构建期能力的（封面优化 `getImage()`、分类名查表、日期格式化）**在页面 frontmatter 里算好**，island 只负责展示和交互。

```astro
---
// src/pages/works/index.astro（节选）
const [works, categories] = await Promise.all([getWorks(), getCategories()]);
const cards = await toCardList(works, categories); // 封面已优化、日期已格式化、分类名已解析
---
<WorksExplorer client:load works={cards} categories={categoryOptions} />
```

props 体积会以 JSON 形式内联进 HTML。数据上千条时，传给 island 的字段要精简（去掉长简介），或改为分页页（见 `astro-routing`）。

### 4. URL 状态同步 + 避免 hydration mismatch

`WorksExplorer` 的模式（新 island 需要「可分享的筛选状态」时照抄）：

```tsx
const [query, setQuery] = useState('');     // ① 初始值 = 服务端渲染用的默认值
const [ready, setReady] = useState(false);

useEffect(() => {                             // ② 水合后再读 URL
  const params = new URLSearchParams(window.location.search);
  setQuery(params.get('q') ?? '');
  setReady(true);
}, []);

useEffect(() => {                             // ③ 读完 URL 之后才回写
  if (!ready) return;
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  const search = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
}, [ready, query]);
```

为什么这样写：
- **①** 服务端没有 `window`，也拿不到查询参数（静态站构建时 URL 没有 `?q=`）。如果初始 state 直接读 URL，
  客户端首次渲染结果和服务端 HTML 不一致 → hydration mismatch。
- **②** 在 `useEffect` 里读 URL，保证首次渲染与服务端一致，之后再切换到 URL 状态。
- **③** 没有 `ready` 门闩时，第一次回写会用默认状态把分享链接里的参数抹掉。
- 用 `replaceState` 不用 `pushState`：筛选不产生历史记录，返回键回到上一页而不是上一个筛选条件。

其他会导致 mismatch 的写法（都放进 `useEffect`）：`Date.now()` / `new Date()` 直接渲染、`Math.random()`、
`localStorage`、`window.innerWidth`、`navigator.language`。

**水合前的输入不能丢**：`client:load` 之前服务端 HTML 里的输入框已经能打字，JS 加载慢时用户可能先输入了几个字。
`WorksExplorer` 在水合后的首次初始化里保留这段已输入的文字（以组件源码为准），不会被默认的空字符串覆盖。
新 island 有输入框时照这个模式做，并在 `e2e-test` 里验证：页面加载过程中快速输入，水合完成后文字仍在、筛选结果对得上。

**URL 同步与访问统计**：`replaceState` 会被统计脚本当成「路由变化」。Umami 默认劫持 `history.pushState` / `replaceState`，
URL 一变就记一次页面浏览（umami 源码 `src/tracker/index.ts` 的 `handlePush`）。框架已在 `Analytics.astro` 给 Umami 加
`data-exclude-search="true"`：只改查询参数（`?q=&c=&tag=`）时 URL 视为未变，不会每敲一个字记一次 PV，也不会把 `?q=` 搜索词原文发给统计端。
新 island 如果把状态写进**路径**（而不是查询参数），这层保护就不起作用，先看 `analytics` 技能再决定。

### 5. island 内的样式与无障碍

- 样式用同一套 Tailwind 语义令牌（`bg-elevated`、`text-muted`、`border-line`、`text-brand-ink`），不写内联颜色。
- 图标用 `lucide-react`（`.astro` 里用 `@lucide/astro`），装饰性图标加 `aria-hidden="true"`。
- 切换类按钮用 `aria-pressed`；结果数量区域加 `aria-live="polite"`；输入框有可见或 `sr-only` 的 label。
- 空状态必须有（「没有找到匹配的作品」+ 清除筛选按钮），见 `WorksExplorer`。

---

## 扩展做法

### 多个 island 共享状态（nanostores）

Astro 官方推荐用 nanostores 在 island 之间共享状态（https://docs.astro.build/en/recipes/sharing-state-islands/ ）。
**本框架默认未安装**，确有需要时再装：

```bash
pnpm add nanostores @nanostores/react
```

```ts
// src/lib/stores/favorites.ts
// 收藏列表：多个 island 共享（列表卡片的收藏按钮 + 页头的收藏计数）
import { atom } from 'nanostores';

export const $favorites = atom<string[]>([]);

export function toggleFavorite(id: string) {
  const current = $favorites.get();
  $favorites.set(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
}
```

```tsx
import { useStore } from '@nanostores/react';
import { $favorites, toggleFavorite } from '@/lib/stores/favorites';

export default function FavoriteCount() {
  const favorites = useStore($favorites);
  return <span>{favorites.length}</span>;
}
```

- 只有**两个及以上 island** 要共享时才引入；单个 island 内部用 `useState` 即可。
- 需要持久化（刷新不丢）时，在 island 的 `useEffect` 里读写 `localStorage`，不要在 store 模块顶层直接读（服务端渲染时没有 `localStorage`）。

### 与跨文档视图过渡共存

本框架默认用 CSS 跨文档过渡（每次导航都是完整页面加载），island 每页重新水合，没有额外生命周期问题。
若改用 `<ClientRouter />`，需要处理脚本重跑与 `transition:persist`，见 `motion-transitions`。

### 减小 JS 体积

- 能用 `client:visible` / `client:idle` 就不用 `client:load`。
- island 里不要 import 大库（日期库、lodash 全量），用 `src/lib` 里的小函数。
- 构建后看 `dist/_astro/*.js` 体积；某个 island 的 chunk 明显变大时用 `performance-doctor` 排查。

---

## 检查清单

- [ ] 确认过「为什么不能用 `.astro` + `<script>`」
- [ ] 指令选择合理，没有无必要的 `client:load`；没有用 `client:only` 渲染 SEO 内容
- [ ] props 只含可序列化的最小字段，构建期计算在页面 frontmatter 完成
- [ ] 读取 `window` / URL / `localStorage` 的逻辑都在 `useEffect` 里
- [ ] URL 同步有 `ready` 门闩，用 `replaceState`；状态只写查询参数（统计侧已排除 search）
- [ ] 有输入框的 island：水合前已输入的文字不会被清空
- [ ] 有空状态、有 `aria-*`、键盘可操作
- [ ] 构建后只有含 island 的页面加载 React chunk
- [ ] UI 变化走了 `e2e-test` 截图闭环

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 控制台 hydration mismatch | 初始 state 读了 URL / 时间 / 随机数 | 默认值渲染，`useEffect` 里再更新 |
| 分享的筛选链接打开后参数被清空 | URL 回写没等初始化完成 | 加 `ready` 门闩 |
| 组件在页面上是静态的，点不动 | 忘了加 `client:*` | 加指令；或确认它本就该是静态的 |
| 爬虫抓到的列表是空的 | 用了 `client:only` | 改 `client:load` / `client:visible`（会服务端渲染） |
| 报「函数不能作为 props」 | 给 island 传了回调 | 回调逻辑移进 island 内部 |
| 每个页面都加载了 React | 布局组件里放了带 `client:*` 的组件 | island 只放在需要的页面 |
| 在 island 里调 `getImage` 报错 | Astro 6 起 `getImage()` 客户端调用会抛错 | 页面里调好，把结果当 props 传入 |
| island 里的 Tailwind 类不生效 | 类名是字符串拼接的动态值，扫描不到 | 写完整类名（如 `'bg-ink text-canvas'`），不要拼 `bg-${x}` |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `ui-components` | 静态组件与布局；本技能只管有状态的部分 |
| `site-search` | 检索算法与索引方案；本技能管搜索框这个 island 本身 |
| `motion-transitions` | 页面切换与动效；`ClientRouter` 下的脚本生命周期 |
| `performance-doctor` | JS 体积、INP 等指标诊断 |
| `e2e-test` | island 行为的浏览器验收 |
| `analytics` | URL 状态变化与页面浏览统计的关系 |

## 参考

- 框架组件与 client 指令：https://docs.astro.build/en/guides/framework-components/
- 指令参考：https://docs.astro.build/en/reference/directives-reference/
- island 间共享状态：https://docs.astro.build/en/recipes/sharing-state-islands/
- React 集成（v7 用 Oxc 替代 Babel）：https://docs.astro.build/en/guides/integrations-guide/react/
