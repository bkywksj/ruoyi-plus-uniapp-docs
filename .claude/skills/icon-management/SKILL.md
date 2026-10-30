---
name: icon-management
description: 图标管理：.astro 用 @lucide/astro、island 用 lucide-react，尺寸颜色约定、无障碍写法、品牌图标内联 SVG、favicon 与主题色。触发词：图标、icon、lucide、SVG图标、favicon、网站图标、品牌图标、GitHub图标、B站图标、加图标、换图标
---

# 图标管理

## 何时使用

- 页面或组件需要加图标、换图标
- 找不到某个图标（尤其 GitHub、B 站、微信等品牌图标）
- 纯图标按钮的无障碍处理
- 更换网站 favicon、主题色
- 图标大小、颜色、描边粗细不统一

## 两套包，同一套图标

| 使用场景 | 包 | 导入写法 |
|---------|----|---------|
| `.astro` 组件 / 页面（静态、零 JS） | `@lucide/astro` | `import { ArrowRight } from '@lucide/astro';` |
| React island（`src/components/islands/`） | `lucide-react` | `import { Search, X } from 'lucide-react';` |

两个包来自同一个 Lucide 图标集（本框架安装的版本约 1800+ 个图标），**图标名一致**，在 .astro 和 island 之间搬代码不用换名字。

🔴 禁止：
- 在 `.astro` 里用 `lucide-react`：不加 `client:*` 时它只是被 React 渲染器在服务端渲染成静态 SVG，不会变成 island，
  但每个图标都要多走一遍 React 服务端渲染，两套写法混在同一类文件里也不利于统一（`class` / `className`、属性名不同）
- 另装第二套图标库（iconify、heroicons、font-awesome…）——风格混用是「AI 味」的主要来源之一
- 从网上复制粘贴 SVG 充当普通图标（品牌图标除外，见下文）

## 框架里的现有用法（参考）

| 文件 | 图标 | 写法要点 |
|------|------|---------|
| `src/components/layout/ThemeToggle.astro` | `Sun` / `Moon` | 按钮上 `aria-label`，图标 `aria-hidden`；用 `dark:hidden` / `dark:block` 切换 |
| `src/components/layout/SiteHeader.astro` | `Menu` | `<summary aria-label="打开菜单">` 包图标 |
| `src/components/ui/Breadcrumbs.astro` | `ChevronRight` | 装饰性分隔符，`opacity-60` |
| `src/pages/index.astro` | `ArrowRight` | 跟在文字后面，`group-hover:translate-x-0.5` 做微动效 |
| `src/pages/works/[id].astro` | `ArrowUpRight` | 外链按钮，提示「会离开本站」 |
| `src/components/islands/WorksExplorer.tsx` | `Search` / `X` | island 内用 `lucide-react`，`className` 而不是 `class` |

## 标准写法

### .astro

```astro
---
import { ArrowUpRight } from '@lucide/astro';
---
<a href={url} target="_blank" rel="noopener">
  查看原作品 <ArrowUpRight class="size-4" aria-hidden="true" />
</a>
```

### React island

```tsx
import { Search } from 'lucide-react';

<Search aria-hidden="true" className="size-4 text-muted" />
```

### 尺寸与颜色约定

| 场景 | 尺寸类 | 说明 |
|------|--------|------|
| 跟随正文 / 按钮文字 | `size-4`（16px） | 与 `text-sm` / `text-base` 搭配 |
| 页头工具按钮 | `size-[18px]` 或 `size-5` | 按钮本身 `size-10`，保证触控区域足够 |
| 小号分隔、角标 | `size-3.5` | 面包屑箭头、清除按钮 |
| 空状态插画位 | `size-8` ~ `size-10` | 配 `text-muted` |

- 颜色默认 `currentColor`，**跟随文字色**：想让图标变色就改父元素或图标上的 `text-*` 语义色（`text-muted`、`text-brand-ink`），不要写死十六进制
- 描边保持默认 2；同一页面里不要混用不同 `stroke-width`
- 用 Tailwind 的 `size-*` 类控制大小，而不是 `size={16}` 属性——前者能响应断点、与文字尺寸体系一致

## 无障碍

Lucide 的规则：**没有传任何 `aria-*` / `role` / `title` 时会自动加 `aria-hidden="true"`**。框架代码仍显式写 `aria-hidden="true"`，读代码时一眼可知是装饰图标。

| 场景 | 写法 |
|------|------|
| 图标 + 文字 | 图标 `aria-hidden="true"`，文字负责语义 |
| 纯图标按钮 | **按钮**上写 `aria-label="切换深色模式"`（可加同文案 `title` 作悬停提示），图标 `aria-hidden` |
| 图标本身承载信息（如状态） | 图标旁加 `<span class="sr-only">已完成</span>`，而不是给 svg 加 aria-label |

纯图标按钮的点击区域至少 40×40（`size-10`），移动端手指才点得准。这是本框架自定的约定：WCAG 2.2 的 2.5.8（AA）最低要求 24×24 CSS px，
2.5.5（AAA）为 44×44；引用时别把 40 说成标准值。

## 品牌图标：Lucide 没有，内联 SVG

Lucide 已移除全部品牌 / Logo 类图标（GitHub、X、YouTube、B 站、微信等都不在包里，import 会直接报错）。需要时：

1. 从品牌方官方资源或 Simple Icons（`https://simpleicons.org`，CC0）取**单色** SVG path
2. 放进 `src/components/icons/<Brand>.astro`，统一接口：

```astro
---
// GitHub 品牌图标（Lucide 不提供品牌图标，按品牌方单色 path 内联）
interface Props {
  class?: string;
  title?: string;
}
const { class: className, title } = Astro.props;
---
<svg
  viewBox="0 0 24 24"
  fill="currentColor"
  class={className}
  aria-hidden={title ? undefined : 'true'}
  role={title ? 'img' : undefined}
>
  {title && <title>{title}</title>}
  <path d="…从 Simple Icons 复制的 path…" />
</svg>
```

- `fill="currentColor"`：跟随文字色，深色模式自动适配
- 尺寸同样用 `class="size-4"`
- 品牌色只在「品牌墙」一类场景使用；页脚社交链接保持 `text-muted`，与站点整体配色统一
- 遵守品牌方的标识使用规范，不要改形状、不要加描边

## favicon 与主题色

| 文件 | 用途 | 要求 |
|------|------|------|
| `public/favicon.svg` | 浏览器标签页图标（`BaseLayout` 里 `<link rel="icon" type="image/svg+xml">`） | 正方形 viewBox，简单图形；小尺寸下仍可辨认 |
| `public/og-default.png` | 默认分享图（`site.ogImage`） | 1200×630，见 `image-optimization` |
| `<meta name="theme-color">` | 移动端浏览器地址栏颜色 | `BaseLayout` 已按亮/暗色分别输出 `#ffffff` / `#0b0b0d` |

框架自带的 favicon 与分享图是 next-ai-astro 品牌，**孵化新项目后必须替换**。

要兼容只认 PNG / ICO 的场景（部分国内浏览器、收藏夹）时补一份：

```bash
# 用已安装的 sharp 从 SVG 生成 PNG（sharp 是框架依赖，无需另装）
node scripts/xxx.mjs   # 脚本里：await sharp('public/favicon.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png')
```

并在 `BaseLayout.astro` 的 `<head>` 追加 `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`（BaseLayout 属于框架核心：在框架仓库里正常提交；在孵化项目里单独一个提交、scope 写 `framework`）。
Logo 本身的设计走 AI 工作站的 Logo 设计（ai-logo-studio），本技能只负责接入。

## 检查清单

- [ ] `.astro` 用 `@lucide/astro`，island 用 `lucide-react`，没有第三套图标库
- [ ] 尺寸用 `size-*` 类，颜色跟随 `currentColor` / 语义色
- [ ] 纯图标按钮的 `aria-label` 写在按钮上，图标 `aria-hidden`
- [ ] 品牌图标是单色内联 SVG，放在 `src/components/icons/`
- [ ] 孵化后的项目已替换 `favicon.svg` 与 `og-default.png`

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `ui-components` | 按钮、卡片等组件整体怎么写；图标只是其中一部分 |
| `design-system` | 图标风格要与整体视觉统一（线性、圆角、描边） |
| `image-optimization` | og 分享图、封面等位图的处理 |
