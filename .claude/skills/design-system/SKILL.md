---
name: design-system
description: 设计令牌与视觉规范：global.css 语义令牌、品牌色注入、深色模式防闪烁、对比度、字体策略，以及把「好看」翻译成约束与去 AI 味清单。触发词：设计系统、配色、主题、深色模式、暗色、品牌色、设计令牌、字体、间距、好看、高级感、去AI味、视觉风格
---

# 设计系统（next-ai-astro）

## 何时使用

- 定站点视觉风格、换品牌色、调配色
- 加深色模式 / 深色模式下某处看不清
- 觉得页面「不好看」「AI 味重」「不够高级」
- 新增颜色、阴影、圆角、字号等视觉值
- 用户给了参考站，要借鉴风格
- 文字对比度不够、无障碍检查（WCAG）不过

## 概述

本框架的视觉规则只有一个入口：**`src/styles/global.css` 定义令牌，`src/site.config.ts` 定义品牌色**。
组件里只写语义类（`bg-canvas`、`text-muted`、`text-brand-ink`），不写原始色值和 `gray-500` 这类 Tailwind 默认色。
这样换品牌色、切深色模式、整体调性时只改两处。

---

## 本框架现状

### 令牌一览（`src/styles/global.css`）

| 令牌 | 浅色 | 深色 | 用途 | Tailwind 类 |
|------|------|------|------|-------------|
| `--canvas` | `#ffffff` | `#0b0b0d` | 页面底色 | `bg-canvas` `text-canvas` |
| `--surface` | `#f6f6f7` | `#141417` | 区块底色（交替分区、输入框底、图片占位） | `bg-surface` |
| `--elevated` | `#ffffff` | `#1b1b1f` | 浮起层（卡片、下拉、弹层） | `bg-elevated` |
| `--ink` | `#111114` | `#f2f2f4` | 主文字 | `text-ink` |
| `--muted` | `#5d5e66` | `#a3a3ad` | 次要文字 | `text-muted` |
| `--line` | `#e6e6ea` | `#27272d` | 分割线、描边 | `border-line` `divide-line` |
| `--brand` | 来自 `site.brandColor` | 同左 | 装饰性色块 | `bg-brand` |
| `--color-brand-soft` | brand 12% 透明 | 同左 | 浅色强调底 | `bg-brand-soft` |
| `--color-brand-strong` | brand 混 22% 黑 | 同左 | **主按钮底色**（白字） | `bg-brand-strong` |
| `--brand-ink` | brand 混 22% 黑 | brand 原色 | **品牌色文字**（链接、强调） | `text-brand-ink` |

其他 `@theme` 令牌：`--font-sans`（系统中文字体栈）、`--font-mono`、`--radius-card: 1rem`、
`--shadow-card` / `--shadow-card-hover`、`--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1)`。

Tailwind v4 会按命名空间把 `@theme` 变量自动生成工具类（`--radius-*` → `rounded-*`、`--shadow-*` → `shadow-*`、`--ease-*` → `ease-*`，
见 Tailwind「Theme variables」文档），所以下面两种写法等价，新代码优先用短的：

| 令牌 | 短写法（自动生成） | 现有代码里的任意值写法 |
|------|------------------|---------------------|
| `--radius-card` | `rounded-card` | `rounded-[var(--radius-card)]` |
| `--shadow-card` / `--shadow-card-hover` | `shadow-card` / `hover:shadow-card-hover` | `shadow-[var(--shadow-card)]` |
| `--ease-out-soft` | `ease-out-soft` | `ease-[var(--ease-out-soft)]` |

现有组件里的长写法不必为此批量改；同一个文件内保持一种写法即可。

### 品牌色注入机制

```astro
<!-- src/layouts/BaseLayout.astro -->
<html lang={site.locale} style={`--brand: ${site.brandColor}`}>
```

```css
/* src/styles/global.css：inline 让生成的工具类直接引用 var()，品牌色和深色切换实时生效 */
@theme inline {
  --color-brand: var(--brand);
  --color-brand-strong: color-mix(in oklab, var(--brand) 78%, black);
  --color-brand-ink: var(--brand-ink);
  /* ... */
}
```

`global.css` 里 `:root { --brand: #ff5d2e }` 只是兜底；**真实值只改 `site.config.ts` 的 `brandColor`**，
不要在 CSS 里再写一份。

### 深色模式

- `@custom-variant dark (&:where(.dark, .dark *));`：暗色由 `<html class="dark">` 控制，而不是只跟随系统。
- `ThemeScript.astro`：`<head>` 里的 `is:inline` 同步脚本，首屏绘制前按「localStorage.theme > 系统偏好」设置 class，
  避免先白后黑的闪烁。**不能改成打包脚本**（打包脚本在 DOM 解析后才执行，必然闪烁）。
- `ThemeToggle.astro`：切换 + 写 localStorage，`aria-pressed` 同步状态。
- 语义令牌在 `.dark` 下整体换值，组件一般**不需要**写 `dark:` 变体；只有图标切换这类「换元素」才用 `dark:hidden` / `dark:block`。

---

## 标准做法

### 1. 颜色使用规则

| 场景 | 用 | 不用 |
|------|-----|------|
| 正文 / 标题 | `text-ink` | `text-black`、`text-gray-900` |
| 辅助信息（日期、计数、说明） | `text-muted` | `text-gray-500`、`opacity-60` 做正文 |
| 链接、分类名、强调词 | `text-brand-ink` | `text-brand`（白底对比度不足） |
| 主按钮 | `Button` 组件 primary（`bg-brand-strong text-white`） | `bg-brand text-white` |
| 装饰（圆点、光斑、选中底） | `bg-brand` / `bg-brand/15` / `bg-brand-soft` | —— |
| 分割线 / 描边 | `border-line` | `border-gray-200` |
| 卡片 | `bg-elevated border border-line` + `shadow-[var(--shadow-card)]` | 大面积投影、玻璃拟态 |

### 2. 对比度：为什么有 brand-ink / brand-strong

WCAG 2.x AA 要求正文对比度 ≥ 4.5:1（大字号 ≥ 3:1）。默认品牌色 `#FF5D2E` 在白底上对比度约 3:1，
**做小字号文字或白字按钮底色都不达标**。所以：
- `--brand-ink`：浅色主题下把品牌色混入 22% 黑色（oklab 空间），做文字用；深色主题下原色在深底上已足够亮，直接用原色。
- `--color-brand-strong`：同样加深，做白字按钮底色，两种主题下都用它。

换品牌色后必须重新核对对比度（浏览器 DevTools 的对比度检查，或 WebAIM Contrast Checker），
亮黄、浅绿这类高明度品牌色可能需要把混黑比例调大——只改 `global.css` 里这两个 `color-mix` 的百分比。

> 对比度数值以工具实测为准；本节「约 3:1」是按 WCAG 相对亮度公式估算的，换色后不要沿用。

### 3. 字体策略

- **中文不引入 webfont**：中文字体文件体积大，对首屏速度伤害远大于收益。`--font-sans` 用系统字体栈
  （PingFang SC / Microsoft YaHei / Noto Sans CJK SC …）。
- 需要品牌英文字体（标题、Logo 字）时，用 Astro 已转正的 Fonts API，只加载需要的字重：

```ts
// astro.config.ts
import { defineConfig, fontProviders } from 'astro/config';
export default defineConfig({
  fonts: [
    { name: 'Inter', cssVariable: '--font-display', provider: fontProviders.google(), weights: [600, 700] },
  ],
});
```

```astro
---
import { Font } from 'astro:assets';
---
<Font cssVariable="--font-display" />   <!-- 放在 BaseLayout 的 <head> -->
```

  Fonts API 会在**构建期**下载字体并由本站自己提供（官方 fonts 指南：「downloading and caching fonts so they're served from your site」），
  访客浏览器不会去请求 Google。所以「国内网络不稳定」影响的是**构建机**：构建机访问不到 Google Fonts 时，改用
  `fontProviders.local()` 并把字体文件放进仓库（`options.variants[].src` 指向 `./src/assets/fonts/*.woff2`）。
- 字号：正文 ≥ 16px（中文 14px 正文是 AI 俗套之一）；文章正文用 `.prose-content`（17px，`leading-8` 即行高 32px，约 1.9 倍）。
- 中文标题用 `text-pretty`，**不用 `text-balance`**（会把「十分钟」拆到两行）。

### 4. 留白、圆角、层级

- 页面水平留白与最大宽度**只在 `Container`** 定义（`max-w-6xl` 列表 / `max-w-3xl` 正文）。
- 分区上下间距只在 `Section` 定义（`py-12 sm:py-16`）。
- 圆角分档：小元素（标签、输入框）`rounded-md` ~ `rounded-xl`；卡片 `--radius-card`（16px）；
  不要一个值通吃所有尺度。
- 层级靠**字号跳级 + 字重 + 留白**建立，不靠加颜色：首页 H1 `text-4xl sm:text-5xl font-semibold`，区块标题 `text-2xl sm:text-3xl`，
  卡片标题 `text-base font-semibold`。（🔴 别写成 `text-4xl/5xl`：Tailwind 里斜杠后面是行高修饰，不是断点。）
- 交替分区用 `bg-surface` 区分（首页「按分类浏览」「常见问题」），不用渐变背景。

### 5. 把「好看」翻译成约束（动手前做）

形容词不带约束，AI 只会拿默认套路填。先把用户的形容词翻译成可验证的约束，写进需求或任务卡：

| 用户说 | 翻译成 |
|-------|-------|
| 高级感 / 有质感 | 单一品牌色做点缀，其余中性色；留白加大（Section 间距上调一档）；正文层禁 `backdrop-blur`；阴影只用令牌 |
| 简洁大气 | 主体左对齐（仅 Hero 标题可居中）；每屏只讲一件事；卡片按信息权重分大小，不做等宽平铺 |
| 科技感 | 深色为默认主题；1px 发丝线分隔；不加霓虹光晕、不加网格背景 |
| 年轻活泼 | 品牌色饱和度略提高；圆角上调一档；强调靠字号跳级，不加多种颜色 |
| 像 XX 网站 | 先做 Keep / Change / Do Not Copy 三分：借留白节奏、信息密度、层级手法；换布局、文案、色值；不抄 logo、专有组件、品牌色具体值 |

每条视觉决策标明来源：`用户原话` / `参考证据` / `推断`（推断必须写出来，禁止「业界通常这样」）。

---

## 去 AI 味清单（产出后自检）

改编自工作站 `ai-ui-studio/anti-cliche-frontend`（完整 30 条与自检流程见该技能），这里列内容站最常命中的：

| # | 俗套 | 本框架的替代 |
|---|------|-------------|
| 1 | 紫粉蓝渐变背景、渐变文字、渐变按钮 | 纯色 `bg-canvas` / `bg-surface`；标题强调用实色品牌色。🔴 用户 2026-11-02 明确「渐变太 AI 味」：知识库站改版时文字渐变、光晕、渐变按钮全部去掉，docs 模块默认实色 |
| 2 | Tailwind 默认蓝做主色 | 项目专属 `brandColor` |
| 3 | 纯黑 `#000` 文字 | `--ink: #111114`（off-black） |
| 4 | 所有元素居中 | 主体左对齐，仅 Hero 可居中 |
| 5 | 三张等宽卡片平铺讲卖点 | 按内容选布局；卖点用列表或表格也可以 |
| 6 | emoji 当图标（🚀⚡✨） | lucide 线性图标，装饰性加 `aria-hidden` |
| 7 | 全站玻璃拟态 | `backdrop-blur` 只用在吸顶页头 |
| 8 | 万物 fade-up 入场动画 | 默认无入场动画；动效规范见 `motion-transitions` |
| 9 | hover 放大 1.05 | 卡片只做 `-translate-y-0.5` + 阴影加深；封面图内部 1.03 |
| 10 | 编造数据：「10,000+ 用户」「98% 满意度」 | 只展示集合真实计数（首页统计就是 `works.length`）；没有数据就不放 |
| 11 | 假客户 logo 墙、假评价 | 不放；有真实授权后再加 |
| 12 | 中文正文 14px | 正文 ≥ 16px |
| 13 | 大段文字配 unDraw 式假插画 | 真实截图 / 真实封面，或纯排版 |

自检方式：截图后逐条对照，命中 ≥ 4 条就回到「翻译约束」重做，而不是逐条打补丁。

---

## 文档页版式（docs 模块，五站统一）

面包屑放正文标题上方随正文滚动；侧栏与目录吸顶位置 = 起始位置（滚动时一动不动）、`overscroll-contain`、细滚动条悬停才显示。
数值与反证测试见 docs-site 技能「文档页版式」。品牌配色、首屏底、要不要渐变在各站 `src/styles/brand.css`，不改模块样式。

## 扩展做法

### 新增令牌

1. 在 `:root` 和 `.dark` **成对**定义变量（只定义一边，深色模式必出问题）。
2. 在 `@theme inline` 里映射成 `--color-xxx`，生成工具类。
3. 在本技能的令牌表里补一行，写明用途。

### 改成「默认深色」

`ThemeScript.astro` 的判断改为：无 localStorage 时默认 `dark = true`；`BaseLayout` 的 `theme-color` 同步调整。
这是全站行为变化，且 `ThemeScript.astro`、`BaseLayout.astro` 属于框架核心：在框架仓库里正常提交；在孵化项目里单独一个提交、
scope 写 `framework`（见 CLAUDE.md「框架核心 vs 业务代码」）。

### 品牌色从 Logo 取

用工作站的配色能力（ai-color-studio）从 Logo 提取主色与对比度方案，再把结果填进 `site.config.ts`；
不要凭感觉挑色值。

---

## 检查清单

- [ ] 组件里没有原始色值、没有 `gray-*` / `blue-*` 等默认色
- [ ] 品牌色只在 `site.config.ts` 出现一次
- [ ] 文字用 `text-brand-ink`，主按钮用 `bg-brand-strong`
- [ ] 新令牌在 `:root` 与 `.dark` 成对定义
- [ ] 深色模式截图检查过（切换后刷新页面也要检查一次）
- [ ] 换色后用工具实测对比度 ≥ 4.5:1
- [ ] 没有引入中文 webfont
- [ ] 去 AI 味清单命中 < 4 条

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 刷新时先白后黑闪一下 | 主题判断放进了打包脚本 / island | 保持 `ThemeScript` 的 `is:inline` 同步执行 |
| 深色模式下某块是白底 | 用了 `bg-white` 或只在 `:root` 定义了新变量 | 改语义令牌；`.dark` 补定义 |
| 改了 `global.css` 的 `--brand` 没生效 | 真实值来自 `<html style>` 注入，优先级更高 | 改 `site.config.ts` |
| `bg-brand/40` 不生效 | 类名是拼接出来的，Tailwind 扫描不到 | 写完整类名 |
| 品牌色链接看不清 | 用了 `text-brand` | `text-brand-ink` |
| 标题断行奇怪 | `text-balance` 对中文拆词 | `text-pretty` |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `ui-components` | 用令牌搭组件（Container / Section / Button / Badge） |
| `motion-transitions` | 动效时长、曲线、页面过渡 |
| `icon-management` | 图标库与 favicon |
| `html-to-code` | 原型里的色值 / 间距映射到本令牌体系 |
| 工作站 `ai-ui-studio` | 出原型、完整 30 条俗套清单与自检流程（MCP 调用） |

## 参考

- Tailwind CSS v4 主题变量（`@theme` / `@theme inline`）：https://tailwindcss.com/docs/theme
- Tailwind CSS v4 深色模式（`@custom-variant`）：https://tailwindcss.com/docs/dark-mode
- Astro Fonts：https://docs.astro.build/en/guides/fonts/
- WCAG 2.2 对比度（1.4.3）：https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- 工作站反俗套清单：`E:\my\AI工作站\projects\ai-ui-studio\.claude\skills\anti-cliche-frontend\SKILL.md`
