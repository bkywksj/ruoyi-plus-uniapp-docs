---
name: html-to-code
description: 把 ai-ui-studio 产出的 HTML 原型转成符合本框架规范的 .astro 页面与组件：外壳交给 BaseLayout、颜色换令牌、假数据换集合数据，再截图闭环验收。触发词：HTML转代码、原型转代码、设计稿转页面、HTML转Astro、原型还原、Tailwind原型转组件、区块转换、组件转换、html-to-code
---

# 原型转框架代码（html-to-code）

## 何时使用

- `docs/prototypes/` 下有原型，要还原成真实页面
- 把原型里的某个区块 / 卡片单独转成组件
- `/dev-loop` 中遇到「原型转页面」类型的任务
- 原型是 Tailwind v3 CDN 写的，需要适配 Tailwind v4 + 本框架令牌

## 概述

原型来源：`/kickoff` 阶段二经 AI 工作站 ai-ui-studio 生成，放在 `docs/prototypes/<业务>/*.html`。
典型特征：单文件 HTML、Tailwind（CDN）、Lucide 图标、写死的示例文案与数字、占位图；有时附带 `design-system.json` 与 `component-mapping.md`。

🔴 **原型是「长什么样」的依据，不是代码来源**。结构和视觉照原型，代码按框架规范重写：外壳不要、颜色不照抄、数据不照抄、脚本不照抄。

```
步骤 1：读原型 → 识别页面类型、区块、交互、设计特征
步骤 2：元素映射 → 外壳 / 布局 / 组件 / 图标 / 颜色 / 数据 / 交互
步骤 3：生成代码 → 页面 .astro + 业务组件 + （必要时）island + lib 查询
步骤 4：规范检查 → 清单逐项过
步骤 5：截图闭环 → 运行页 vs 原型，7 项逐条比对，不达标返工
```

---

## 步骤 1：读原型

```bash
ls docs/prototypes/ docs/prototypes/*/
```

同目录有 `design-system.json` / `component-mapping.md` 时一并读：前者给出主色、圆角、间距意图，后者是工作站建议的组件对应关系（以本技能的映射表为准，冲突时按本框架组件）。

### 1.1 页面类型 → 框架参考页

| 原型特征 | 页面类型 | 参考代码 |
|---------|---------|---------|
| 大标题 + 按钮 + 若干内容区块 | 首页 | `src/pages/index.astro` |
| 搜索框 / 筛选胶囊 + 卡片网格 | 列表页 | `src/pages/works/index.astro` + `islands/WorksExplorer.tsx` |
| 大图 + 标题 + 元信息 + 按钮 + 相关推荐 | 详情页 | `src/pages/works/[id].astro` |
| 分类标题 + 导语 + 全部卡片 | 分类落地页 | `src/pages/works/category/[id].astro` |
| 窄栏长文 | 文章页 | `src/pages/posts/[...id].astro` |

### 1.2 识别 Tailwind 版本

| 原型里的脚本 | 版本 | 影响 |
|-------------|------|------|
| `cdn.tailwindcss.com` | v3 | 部分类名在 v4 改名，见步骤 2.6 |
| `@tailwindcss/browser@4` | v4 | 类名基本可直接用 |
| 内联 `tailwind.config = {...}` | 自定义主题 | 🔴 不复制，颜色意图映射到令牌 |

### 1.3 列出区块清单

逐个区块写成一张表再动手（这张表也是步骤 5 的比对依据）：

```
| # | 区块 | 原型里的样子 | 目标实现 | 数据来源 | 是否交互 |
| 1 | 页头 | logo + 4 个导航 + 主题按钮 | BaseLayout 自带 SiteHeader | site.nav | 否 |
| 2 | Hero | H1 + 定义句 + 2 按钮 | 首页 section + Button | site.tagline | 否 |
| 3 | 视频网格 | 3 列卡片，时长角标 | WorkCard 网格 | lib/works.ts | 否 |
| 4 | 筛选条 | 搜索 + 分类胶囊 + 排序 | WorksExplorer island | toCardList | 是 |
```

---

## 步骤 2：元素映射

### 2.1 外壳：全部删掉

| 原型里的 | 处理 |
|---------|------|
| `<head>`、CDN `<script>`、Google Fonts `<link>` | 删；BaseLayout 负责 head，字体用系统栈 |
| 页头 / 页脚 | 删；`BaseLayout` 自带 `SiteHeader` / `SiteFooter`，导航改 `site.nav` |
| `lucide.createIcons()` 等初始化脚本 | 删 |
| 手机模拟外框（`width=375`、状态栏、home indicator） | 删，只保留内容区 |

原型页头 / 页脚和框架的差异较大（例如多了搜索入口）→ 属于修改框架核心组件，先和用户确认：在框架仓库里正常提交；
在孵化项目里单独一个提交、scope 写 `framework`（如 `feat(framework): 页头加搜索入口`，见 CLAUDE.md「框架核心 vs 业务代码」）。

### 2.2 布局

| 原型写法 | 框架写法 |
|---------|---------|
| `max-w-7xl/6xl/5xl mx-auto px-*` | `<Container>` |
| `max-w-3xl/prose mx-auto` 的阅读区 | `<Container size="narrow">` + `prose-content` |
| `<section>` + h2 + 副标题 + 「查看全部」 | `<Section title description eyebrow>` + `slot="action"` |
| 交替底色的区块 `bg-gray-50` | `<Section class="bg-surface">` |
| 面包屑 | `<Breadcrumbs crumbs={crumbs}>` + `breadcrumbJsonLd(crumbs)` |

### 2.3 组件

| 原型元素 | 框架组件 |
|---------|---------|
| 实心品牌色按钮 | `<Button>`（primary） |
| 描边按钮 | `<Button variant="secondary">` |
| 文字按钮 | `<Button variant="ghost">` |
| 分类标签（彩色） | `<Badge tone="brand">` |
| 普通标签 `#xxx` | `<Badge>` |
| 内容卡片（封面 + 标题 + 元信息） | `WorkCard`；字段差异大时新建 `components/<业务>/XxxCard.tsx`（照两用组件写法，见 `ui-components`） |
| FAQ / 折叠面板 | `<details>` + `<summary>`（参考首页 FAQ 区块） |
| 移动端菜单 | 已由 SiteHeader 的 `<details>` 实现 |
| 横向轮播 | CSS 横滑：`flex overflow-x-auto snap-x snap-mandatory` + 子项 `snap-start`，零 JS |
| Tab 切换不同内容 | 优先拆成不同 URL（利于 SEO）；纯视觉切换才做 island |
| 弹窗 | 尽量改成独立页面；必须弹窗时用原生 `<dialog>` + 小段 `<script>` |
| 搜索 + 筛选 + 排序 | island（复用 / 仿照 `WorksExplorer.tsx`） |

### 2.4 图标

| 原型 | `.astro` | `.tsx`（island） |
|------|---------|-----------------|
| `<i data-lucide="arrow-right" class="w-4 h-4">` | `import { ArrowRight } from '@lucide/astro'` → `<ArrowRight class="size-4" aria-hidden="true" />` | `import { ArrowRight } from 'lucide-react'` → `<ArrowRight className="size-4" aria-hidden="true" />` |

命名规则：kebab-case → PascalCase（`chevron-right` → `ChevronRight`、`play-circle` → `CirclePlay` 这类改过名的以包里实际导出为准）。
品牌图标（GitHub、B 站等）新版 Lucide 已不提供 → 见 `icon-management`（内联 SVG）。

### 2.5 颜色 → 语义令牌

| 原型颜色用途 | 令牌 |
|------------|------|
| 页面白底 `bg-white` | `bg-canvas` |
| 浅灰区块底 `bg-gray-50/100` | `bg-surface` |
| 卡片白底 | `bg-elevated` |
| 主文字 `text-gray-900/800` | `text-ink` |
| 次要文字 `text-gray-500/600` | `text-muted` |
| 边框 `border-gray-100/200` | `border-line` |
| 品牌色做底（装饰色块、圆点） | `bg-brand`、`bg-brand/15` |
| 品牌色浅底（选中标签） | `bg-brand-soft` |
| 品牌色按钮底 | `<Button>`（内部 `bg-brand-strong`） |
| 品牌色文字 / 链接 | `text-brand-ink` |
| 选中态深色胶囊 `bg-gray-900 text-white` | `bg-ink text-canvas` |
| 视频时长角标 `bg-black/70 text-white` | 保留（叠在图片上，与主题无关） |

- 原型主色和 `site.brandColor` 不同 → 以 `site.config.ts` 为准；要换品牌色改配置，不在页面里写 hex
- 装饰性渐变可保留，但颜色改用令牌：`from-brand/20 to-transparent`
- 用了令牌后不需要再写 `dark:` 变体，暗色自动适配

### 2.6 Tailwind v3 → v4 类名

| v3（原型） | v4（本框架） |
|-----------|-------------|
| `shadow-sm` / `shadow` | `shadow-xs` / `shadow-sm`（卡片优先用 `shadow-[var(--shadow-card)]`） |
| `rounded-sm` / `rounded` | `rounded-xs` / `rounded-sm`（卡片用 `rounded-[var(--radius-card)]`） |
| `ring`（3px） | `ring-3` |
| `outline-none` | `outline-hidden`（保留强制色模式下的可见性） |
| `bg-gradient-to-r` | `bg-linear-to-r`（v4 的新名字；旧名目前仍可用，新代码统一写新名） |
| `bg-opacity-50` / `text-opacity-*` | `bg-black/50`（透明度修饰符） |
| `flex-shrink-0` / `flex-grow` | `shrink-0` / `grow` |
| `w-4 h-4` | 可写成 `size-4` |

### 2.7 数据：假数据一律替换

| 原型里的 | 替换为 |
|---------|-------|
| 写死的卡片文案、日期、播放量 | 集合数据（`getWorks()` → `toCardList()`） |
| 占位图（unsplash / picsum / placeholder） | 数据里的封面（`resolveCover()`） |
| 「共 128 个视频」这类统计 | 集合计数，不写死 |
| 站名、slogan | `site.name`、`site.tagline` |

🔴 **反捏造**：原型里的数字、客户名、评价都是示意。数据源里没有的，不要为了「还原原型」写死在页面上；缺数据就留空态或标「待确认」问用户。

---

## 步骤 3：生成代码

1. **页面**放 `src/pages/`，经 `BaseLayout`，传入每页不同的 `title` / `description`，需要的 `jsonLd`
2. **取数**只调 `src/lib/<集合>.ts`；缺查询函数就在 lib 里补，不在页面里写 `getCollection` + 排序
3. **区块组件**放 `src/components/<业务>/`，默认 `.astro`；要在 island 里复用的写 `.tsx`
4. **island** 放 `src/components/islands/`，只做有状态的区域，props 由服务端算好（见 `islands-interaction`）
5. **首行注释**写清这个页面 / 组件对应原型的哪一页、哪一块

转换示例（原型片段 → 框架代码）：

```html
<!-- 原型 -->
<section class="py-16 bg-gray-50">
  <div class="max-w-6xl mx-auto px-6">
    <p class="text-sm text-orange-500">从这里开始</p>
    <h2 class="text-3xl font-bold text-gray-900">精选视频</h2>
    <a href="#" class="text-orange-500">查看全部 <i data-lucide="arrow-right"></i></a>
    <div class="grid grid-cols-3 gap-6"> <!-- 3 张写死的卡片 --> </div>
  </div>
</section>
```

```astro
<Section id="featured" eyebrow="从这里开始" title="精选视频" class="bg-surface">
  <a slot="action" href="/works/" class="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
    查看全部 <ArrowRight class="size-4" aria-hidden="true" />
  </a>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {featured.map((work, index) => <WorkCard work={work} eager={index < 3} priority={index === 0} />)}
  </div>
</Section>
```

变化点：外层容器 → `Section`；橙色 → `text-brand-ink`；Lucide `<i>` → 组件；写死卡片 → 集合数据；
原型的固定 3 列 → 移动优先的响应式栅格；`font-bold` 按框架字重层级用 `font-semibold`（Section 已内置）。

---

## 步骤 4：规范检查清单

- [ ] 没有残留：CDN 脚本、`tailwind.config`、Google Fonts、`data-lucide`、`lucide.createIcons()`、手机外框
- [ ] 页面经 `BaseLayout`，title / description 与其他页不重复
- [ ] 宽度用 `Container`，区块用 `Section`，按钮用 `Button`
- [ ] 没有原始色（`gray-*` `orange-*` hex），全部语义令牌
- [ ] v3 类名已按 2.6 改写
- [ ] 数据来自集合；没有写死的数字、占位图
- [ ] 只有有状态的区域是 island，且 `client:*` 指令合理
- [ ] 图片有 alt / width / height；卡片网格前 3 张 `eager`、只有第 1 张 `priority`；装饰图标 `aria-hidden`
- [ ] 原型里的区块在数据为空时整块隐藏（首页区块）或显示空状态（列表主体），不留空标题
- [ ] 新文件有首行注释
- [ ] `pnpm verify` 全绿

---

## 步骤 5：截图闭环（UI 任务必过）

1. 起开发服务：先看端口上是否已有本会话起过的服务（`netstat -ano | findstr :4321`），有就复用；没有再用 `mcp__aicoder__resolve_and_start_task`
   或 `pnpm dev`（`run_in_background`），看输出确认端口（默认 4321，被占顺延）
2. `mcp__aicoder__browser_open(url="http://localhost:<端口>/<路径>/", device="desktop")` → 拿返回的 `label` →
   `browser_screenshot(label, full_page=true)` 截「现状」。🔴 地址写 `localhost`，不写 `127.0.0.1`（本机 localhost 解析到 IPv6，Astro 默认只监听它）
3. 原型用 `browser_open` 打开本地文件截「目标」：推荐 `file:///E:/proj/docs/prototypes/home/index.html` 形式（也支持直接传本地绝对路径）
4. 逐条比对 7 项：

| # | 比对项 | 看什么 |
|---|-------|-------|
| 1 | 布局分区 | 区块顺序、栅格列数、左右分栏比例 |
| 2 | 主 / 辅 / 状态色 | 品牌色出现的位置、选中态、hover 态（颜色值以令牌为准，位置以原型为准） |
| 3 | 间距留白 | 区块上下间距、卡片间距、内边距 |
| 4 | 字号 / 字重 / 行高 | 标题层级、正文、元信息 |
| 5 | 组件类型 | 按钮 / 标签 / 卡片 / 输入框用对了框架组件 |
| 6 | 文案 | 栏目名、按钮文案、空态文案（数据类文案以真实数据为准） |
| 7 | 交互态 | hover、聚焦、选中、展开、空态、加载更多 |

5. 手机视口再截一次：`browser_set_device(label, device="mobile")` → 截图比对（原型没有手机稿时，至少确认无横向溢出、导航可用）
6. 有差异只改视图层 → 重新截图确认；关键差异没消除不算完成

浏览器工具调用失败时：本会话不反复重试，改为「对照原型源码 + 用户提供的截图」核对，仍逐条过 7 项。详细工具用法见 `e2e-test`。

---

## 常见错误

| 错误 | 正确 |
|------|------|
| 把原型整页粘进 `.astro` 再小修 | 按区块清单重写，外壳交给 BaseLayout |
| 保留 `bg-orange-500` 这类原型颜色 | 语义令牌 |
| 为了像原型把示例数字写死 | 数据来自集合，缺就空态 |
| 原型里每个交互都做成 React | 能用 `<details>` / CSS / 小段 script 的不用 island |
| 原型固定宽度（`w-[1200px]`） | 响应式栅格 + `Container` |
| 只截桌面图就交差 | 桌面 + 手机都要看 |

## 与其他技能联动

| 环节 | 技能 |
|------|------|
| 原型从哪来 | `/kickoff` 阶段二（AI 工作站 ai-ui-studio） |
| 组件 props | `ui-components` |
| 令牌与视觉调整 | `design-system` |
| island | `islands-interaction` |
| 截图验收工具 | `e2e-test` |
| 图标缺失 | `icon-management` |
