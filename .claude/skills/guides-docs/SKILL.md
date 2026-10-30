---
name: guides-docs
description: 使用指南模块：guides 集合（MDX）、三栏布局、多层侧栏、上下篇、手机实时预览、文档组件、Pagefind 站内搜索。触发词：使用指南、文档站、教程、帮助中心、guides、MDX、侧栏目录、多层侧栏、本页内容、上一篇下一篇、手机预览、步骤条、提示框、站内搜索、Ctrl K
---

# 使用指南模块（guides-docs）

## 何时使用

- 产品官网要带一套「使用指南 / 帮助中心」，或整站就是文档站
- 写一篇新指南、调整分组和顺序、在正文里用分步 / 提示框 / 截图标注
- 想要 VitePress 默认主题那套能力（侧栏、本页目录、上下篇、全文搜索），又要站点其余页面保持自由版式
- 不要这个模块：`node .claude/skills/module-strip/scripts/module-strip.mjs guides --preview`（见 module-strip 技能）

## 概述

| 能力 | 落点 |
|------|------|
| 内容 | `src/content/guides/*.mdx`（glob loader，id = 文件路径去扩展名，可带子目录） |
| schema | `src/content.config.ts` 的 `guides` |
| 分组 | `src/lib/guide-sections.ts` 的 `GUIDE_SECTIONS`（顺序即显示顺序） |
| 查询 / 排序 / 上下篇 | `src/lib/guides.ts`：`getGuides` / `sortGuides` / `groupBySection` / `prevNext` / `guidePath` |
| 首页 | `src/pages/guide/index.astro`：大搜索框 + 按分组的卡片 |
| 详情 | `src/pages/guide/[...id].astro` → `src/layouts/GuideLayout.astro` 三栏 |
| 文档组件 | `src/components/docs/`（注入给 MDX，写指南时不用 import） |
| 搜索 | `SearchDialog`（页头里放一次）+ `SearchButton`；Pagefind 索引在 `pnpm build` 末尾生成 |
| 结构化数据 | 详情页 BreadcrumbList + Article；frontmatter 有 `faq` 时追加 FAQPage |
| llms.txt | 「使用指南」段自动列出全部篇目 |

## frontmatter

```yaml
---
title: 快速开始                 # 必填
description: 一两句话说清这篇能帮读者做成什么   # 必填：meta description + 首页卡片摘要，每篇不同
section: 入门                   # 必填：只能取 GUIDE_SECTIONS 里的值
order: 1                        # 必填：组内顺序，越小越前
duration: 约 10 分钟            # 可选：显示在开头信息卡与首页卡片
version: 1.2.0                  # 可选：说明对应的最低产品版本（三段数字）
prepare: 一个 API Key           # 可选：需要提前准备的东西
updated: 2026-10-30             # 必填：页尾「最后更新」与 Article.dateModified
lead: false                     # 可选（默认 true）：false 时 H1 下不渲染 description 导语——描述取自正文首段时用，免得重复
faq:                            # 可选：页尾可展开问答 + FAQPage 结构化数据
  - q: 问题
    a: 纯文本答案（只写页面上真会显示的内容）
preview: /pages/grid            # 可选：右侧显示手机实时预览（站内路径拼到 site.mobilePreview.origin，或完整 https 地址），有它时不显示「本页内容」
draft: false                    # 可选：true 时不出页面、不进侧栏
---
```

## 排序规则

1. 先按分组在 `GUIDE_SECTIONS` 里的位置，再按 `order`，`order` 相同按 id —— 每次构建顺序稳定
2. 侧栏、指南首页、上一篇 / 下一篇、llms.txt 都用 `getGuides()` 的结果，**页面里不各自排序**
3. 上一篇 / 下一篇**跨分组连续**：读完「入门」最后一篇，「下一篇」是「进阶」第一篇
4. 加分组：先改 `guide-sections.ts`（schema 枚举与侧栏顺序都从这里取），再写篇目；改分组名要同步改已有篇目的 `section`，否则构建报错。
   单测的分组名取自 `GUIDE_SECTIONS`，改分组不用动测试
5. 地址：`guidePath(id)` 经 `pagePath()` 生成，跟随 `site.urlFormat`（directory → `/guide/x/`，file → `/guide/x.html`），页面里不手拼
6. 多个网址前缀（迁移旧站常见，如 `/guide/x.html` + `/features/x.html`）：篇目放同名子目录（id 即 `guide/x`），
   路由改 `src/pages/[group]/[...slug].astro`、`guidePath` 改成 `pagePath('/' + id)`；实战见 vitepress-migration 技能

## 文档组件（MDX 里直接用）

| 组件 | 写法 | 说明 |
|------|------|------|
| `Steps` | `<Steps>` 空一行 + 若干 `## 小标题` + 空一行 `</Steps>` | 每个二级标题就是一步，编号由 CSS 计数器画，零 JS；标题自动进「本页内容」。🔴 标签与内容之间不空行，里面的 Markdown 不会被解析 |
| `Callout` | `<Callout type="tip\|warning\|danger" title="可选">…</Callout>` | 三种语气对应 brand / accent / danger 令牌 |
| `Kbd` | `<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>` | 键盘按键 |
| `MenuPath` | `<MenuPath to="设置 > 账号 > 安全" />` | 菜单路径胶囊，文字与产品界面逐字一致 |
| `Btn` | `<Btn primary>保存</Btn>` | 正文里提到的界面按钮 |
| `Screenshot` | `import shot from '@/assets/guides/x.png';` 然后 `<Screenshot src={shot} alt="…" marks={[[左, 上, 宽, 高]]} />` | 多尺寸 webp + 点击放大（GuideLayout 里的 Lightbox）；`marks` 是占整图的**百分比**，按顺序编号 1 2 3。坐标越界（多半是把像素当百分比）直接让构建失败 |
| `Result` | `<Result>做完应该看到什么</Result>` | 「完成后」对照框 |

新增组件：放 `src/components/docs/`，在 `src/pages/guide/[...id].astro` 的 `components={{ … }}` 里注册；颜色只用语义令牌（design-system 技能）。

## 站内搜索

- 索引范围：**只索引带 `data-pagefind-body` 的区域**，即指南正文（GuideLayout 的 `<article>`）。
  🔴 站内只要有一个页面出现 `data-pagefind-body`，没标的页面就都不进索引 —— 本框架的策略就是「搜索 = 搜指南」，
  文章 / 作品页不进索引。要把文章也纳入，在 `posts/[...id].astro` 的正文容器上同样加 `data-pagefind-body`
- 不进结果的部分（开头信息卡等）标 `data-pagefind-ignore`；分组名用 `data-pagefind-meta="section"` 带进结果
- 索引在 `pnpm build` / `build:fast` 末尾由 `pagefind --site dist` 生成，托管平台照常跑 `pnpm build` 即可（原因见 site-search 技能）；
  `pnpm check:seo` 会拦「用了搜索却没索引」
- `SearchDialog` 的脚本必须是 `is:inline`（构建后才有的 `/pagefind/pagefind.js` 只能运行时 `import()`，经 Vite 打包会被套上预加载包装而报错），每页只放一个（在页头里）
- 开发模式没有索引，弹窗会提示先 `pnpm build && pnpm preview`

## 多层侧栏（src/data/guide-sidebar.json）

默认是空数组：侧栏按 `section` 一层分组（上面的排序规则）。旧站侧栏有「分组 → 子分组 → 页面」多层时写这个文件，**写了就完全按它排**：

```json
[
  { "text": "快速开始", "items": [{ "id": "quick-start" }, { "id": "install", "text": "安装（自定义标题）" }] },
  {
    "text": "组件库",
    "collapsed": true,
    "items": [{ "text": "表单组件", "collapsed": true, "items": [{ "id": "form/input" }] }]
  },
  { "text": "GitHub", "href": "https://github.com/x", "external": true }
]
```

- `id` = 指南 id（省略 `text` 时用该篇 title）；`href` 放非指南链接；层数不限
- `collapsed`：不写 = 固定展开（顶层画成小标题）；`false` = 可折叠默认展开；`true` = 默认收起。**当前篇所在的分组总会展开**
- 上一篇 / 下一篇按侧栏顺序跨分组连续；**不在侧栏里的篇目没有上下篇**（与 VitePress 一致）；指南首页按侧栏顶层分组
- 写了不存在（或 draft）的 id 直接构建失败
- 渲染是通用组件 `SidebarTree.astro` + `lib/sidebar.ts`（按已解析的网址工作），别的集合（如迁移来的文档集合）也能直接用

## 手机实时预览（preview）

组件文档右侧放 H5 演示：frontmatter 写 `preview`，宽屏右栏换成 `PhonePreview`（iframe + 新窗口 + 收起，零 JS），窄屏不显示。
`site.mobilePreview.origin` 填预览站地址（留空 = 预览本站页面），`qr` 填二维码静态图（留空不显示「扫码预览」）。示例见 `mobile-preview.mdx`。

## 迁移来的 VitePress 写法

`site.markdownCompat: 'vitepress'` 时 `.md` 正文里的 `::: tip`、`<Ok/>`、`<Icon icon>`、`.md` 链接、VitePress 锚点规则在构建期还原，
`site.codeLineNumbers: true` 显示代码行号。细节与大站迁移路线见 vitepress-migration 技能。

## 验证

```bash
pnpm verify                    # build（含索引）+ check:seo + test（tests/unit/guides.test.ts 守排序与上下篇）
E2E_PORT=4339 pnpm test:e2e    # tests/e2e/guides.spec.ts：侧栏高亮、步骤数、上下篇跳转、本页内容、Ctrl K 搜索
```

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 构建告警 `MODULE_LEVEL_DIRECTIVE … use astro:head-inject` | Astro 为每篇 MDX 生成的内容代理模块自带这条指令，打包器提示语义可能丢失 | `astro.config.ts` 的 `onwarn` 已按「代码 + 这条指令」精确放过，别整类关掉 |
| `<Steps>` 里的标题没编号 | 标签和内容之间没空行，MDX 把整段当成 JSX 文本 | 开闭标签各自独占一行，前后空一行 |
| 线上搜索提示索引未生成 | `build` 里没有 `pagefind --site dist` | 见 site-search 技能接入步骤 1 |
| 改了 remark / rehype 插件，页面没变、测试照样全绿 | 内容层按正文缓存渲染结果，插件变了不会重新渲染 | 先 `pnpm cache:clear` 再构建；反证插件时尤其要清，否则改坏了也是绿的（试点实录） |
| 窄屏 e2e 找不到当前篇高亮 | 侧栏渲染两份（宽屏左栏 + 窄屏 details），`.first()` 拿到的是隐藏那份 | 按视口取对应容器里的那份 |
