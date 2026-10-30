---
name: motion-transitions
description: 动效与页面过渡：默认零 JS 的 CSS 跨文档视图过渡与封面形变、何时改用 ClientRouter 及其生命周期、微动效规范、减少动态效果适配。触发词：动效、动画、过渡、View Transitions、ClientRouter、页面切换、hover效果、滚动动画、减少动态效果、形变、transition:persist、prefers-reduced-motion
---

# 动效与页面过渡（next-ai-astro）

## 何时使用

- 想让页面切换更顺滑、列表点进详情有「封面放大」效果
- 加 hover、展开、入场等微动效
- 页面切换后脚本失效、主题闪烁、island 状态丢失（用了 ClientRouter 之后）
- 动效太多太花、「AI 味」动画
- 无障碍：减少动态效果（prefers-reduced-motion）

## 概述

动效的目标是**解释变化**（从哪来、到哪去），不是装饰。本框架默认：
- 页面切换：CSS 跨文档视图过渡，**零 JS**；浏览器不支持时就是普通跳转（渐进增强）。
- 列表 → 详情：封面形变（卡片封面放大成详情页头图）。
- 微动效：只有卡片悬停、按钮按压、图标位移这几类。**位移 / 缩放类**时长 200~500ms，统一 `--ease-out-soft` 曲线；
  **颜色 / 按压反馈类**（`transition-colors`、按钮 `active:scale`）沿用 Tailwind 默认 150ms，短一点手感更跟手。
- 尊重 `prefers-reduced-motion`：用户开启「减少动态效果」时全部关闭。

---

## 本框架现状

`src/styles/global.css`：

```css
/* 跨文档视图过渡（零 JS） */
@view-transition {
  navigation: auto;
}

/* 列表卡片：只有悬停/聚焦（= 即将被点击）的那张拿到名字，详情页封面用同名完成形变 */
.vt-card:is(:hover, :focus-within) .vt-cover {
  view-transition-name: var(--vt-name);
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 220ms;
  animation-timing-function: var(--ease-out-soft);
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

配合的组件：
- `WorkCard.tsx`：`<article class="vt-card" style="--vt-name: cover-<id>">`，封面 `<img class="vt-cover">`；
  `coverTransitionName(id)` 把 id 里非法字符替换掉，保证是合法 CSS 标识符。
- `works/[id].astro`：详情页头图 `style="view-transition-name: cover-<id>"`（单个元素，始终命名）。
- 卡片 hover：`hover:-translate-y-0.5` + 阴影加深；封面 `group-hover:scale-[1.03]`，`duration-500`。

---

## 标准做法

### 1. 跨文档视图过渡的工作条件

MDN 对 `@view-transition { navigation: auto }` 的条件（全部满足才触发）：
- 前后两个页面**同源**，且中间没有跨源重定向；
- 导航类型是 `traverse`（前进后退）、`push` 或 `replace`；
- `push` / `replace` 必须由用户在页面内的操作触发（不是地址栏输入）。

浏览器兼容性以 MDN 兼容表为准（https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition ）；
**不支持的浏览器直接普通跳转，功能不受影响**，所以不需要写降级代码。

### 2. 为什么是「悬停才命名」

`view-transition-name` 在同一页面必须**唯一**（MDN）。列表页如果给每张卡片都固定命名：
- 名字都唯一时可行，但浏览器在导航时要为每个命名元素抓快照，几百张卡片会拖慢切换；
- 真正需要形变的只有「被点的那一张」。

所以卡片只通过 CSS 变量携带名字，`:hover` / `:focus-within` 时才生效——鼠标点击前一定在悬停，键盘操作时链接聚焦，
两种路径都能拿到名字。触屏点击时浏览器是否在导航快照前进入 `:hover`，各浏览器表现不一（未见规范保证）：
拿不到名字时只是退化为普通的根元素淡入淡出，不影响跳转。手机上的形变效果以真机实测为准。

新增「列表 → 详情」形变时照抄：

```tsx
// 列表项
<article className="vt-card ..." style={{ '--vt-name': coverTransitionName(item.id) } as CSSProperties}>
  <img className="vt-cover ..." />
</article>
```

```astro
<!-- 详情页 -->
<img style={`view-transition-name: ${coverTransitionName(item.id)}`} />
```

名字规则：`<类型>-<id>`（`cover-`、`avatar-`），id 只留 `[A-Za-z0-9_-]`。

### 3. 微动效规范

| 场景 | 做法 | 时长 / 曲线 |
|------|------|------------|
| 卡片悬停 | 上移 2px（`-translate-y-0.5`）+ 阴影 `--shadow-card-hover` | `duration-300` + `ease-[var(--ease-out-soft)]` |
| 封面图悬停 | 容器 `overflow-hidden`，图片 `scale-[1.03]` | `duration-500` |
| 按钮按压 | `active:scale-[0.98]` | Tailwind 默认 transition（150ms） |
| 箭头图标 | `group-hover:translate-x-0.5` | `transition-transform` |
| 折叠展开图标 | `group-open:rotate-45`（`<details>`） | `transition-transform` |
| 页面切换 | 根元素交叉淡入淡出 | 220ms |

原则：
- **曲线**：统一 `--ease-out-soft`（`cubic-bezier(0.22, 1, 0.36, 1)`），ease-out 系对时长不敏感，不容易显得迟钝。
- **只动 transform 和 opacity**：不要动 `width` / `height` / `top` / `margin`，会触发重排、导致卡顿与布局偏移。
- **按钮不放大**：hover 放大 1.05 是 AI 俗套之一；按钮 hover 用颜色 / 亮度变化。
- **不做持续动画**：漂浮、呼吸、闪烁都不要，除非是唯一焦点且有明确含义（如「直播中」指示点）。
- **不做「万物 fade-up」入场**：内容站的内容应该直接出现；滚动入场动画会推迟可读时间，也影响 LCP 观感。

### 4. prefers-reduced-motion

全局规则已经把动画与过渡压到 0.01ms（而不是 `none`，保留 `transitionend` 事件，避免依赖事件的脚本卡住）。
新增 `@keyframes` 动画无需单独处理；如果用 JS 驱动动画（如 `element.animate()`），先判断：

```ts
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) element.animate(/* ... */);
```

---

## 扩展做法：改用 `<ClientRouter />`

`ClientRouter`（来自 `astro:transitions`；旧名 `<ViewTransitions />` 在 Astro 6 已移除，见 v6 升级指南）把站点变成客户端路由：导航时不整页刷新，
而是抓取新页面并替换 DOM。它提供 `transition:name` / `transition:animate` / `transition:persist` 指令。

### 什么时候才值得换

| 需要 | 默认 CSS 方案 | ClientRouter |
|------|--------------|-------------|
| 页面淡入淡出、封面形变 | 能做 | 能做 |
| 跨页保留播放器 / island 状态（如全站音频播放条） | 做不到（每页重新加载） | `transition:persist` |
| 预取、导航时保留滚动位置等更细控制 | 浏览器默认行为 | 可控 |
| 零 JS | 是 | 否（需要加载路由脚本） |

**只有「跨页保留状态」这类硬需求才换**，单纯为了动效不换。

### 换了之后必须处理的问题

1. **脚本不会在每次导航后重新执行**：打包的 `<script>` 只在首次加载执行一次。需要每页执行的逻辑包进事件：

   ```js
   document.addEventListener('astro:page-load', () => {
     // 重新绑定按钮事件（如 ThemeToggle 的点击监听）
   });
   ```

   不经打包的内联脚本要每次重跑，加 `data-astro-rerun`：`<script is:inline data-astro-rerun>…</script>`。

2. **深色模式会闪**：新页面替换进来时 `<html class="dark">` 可能丢失。在 `astro:after-swap` 事件里按 localStorage 重新设置：

   ```js
   document.addEventListener('astro:after-swap', () => {
     const stored = localStorage.getItem('theme');
     const dark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
     document.documentElement.classList.toggle('dark', dark);
   });
   ```

3. **island 默认会重新挂载**：需要保留状态的 island 加 `transition:persist`：
   `<Player client:load transition:persist />`。

4. **生命周期事件用字符串名**：Astro 7 已移除 `TRANSITION_*` 常量与 `isTransitionBeforeSwapEvent()` 等内部辅助函数，
   直接监听 `'astro:before-preparation'`、`'astro:after-swap'`、`'astro:page-load'` 等事件名。

5. **统计脚本的页面浏览**：各工具行为不同，**先查再加代码**（见 `analytics`）：
   - Umami（框架推荐）默认劫持 `history.pushState` / `replaceState`，URL 变化会**自动**记一次页面浏览（umami 源码 `src/tracker/index.ts` 的 `handlePush`）。
     ClientRouter 导航改的是路径，照样会被记到——**不要**再在 `astro:page-load` 里手动 `umami.track()`，否则每次切页记两次。
   - 百度统计默认不识别客户端路由。二选一，**不要同时用**（官方说明同时用会发重复日志）：
     在百度统计后台「管理 > 单页应用设置」开启 SPA 统计；或在 `astro:page-load` 里
     `window._hmt?.push(['_trackPageview', location.pathname])` 手动上报（`pageURL` 必须是以 `/` 开头的相对路径），并跳过首次加载避免重复计数。

6. 换成 `ClientRouter` 后删除 `global.css` 里的 `@view-transition` 规则，避免两套机制叠加。

这是全站行为变化，会改 `BaseLayout` 与 `global.css`（框架核心）：在框架仓库里正常提交；在孵化项目里单独一个提交、scope 写 `framework`
（如 `feat(framework): 改用 ClientRouter`，见 CLAUDE.md「框架核心 vs 业务代码」），并跑完整 `e2e-test`。

---

## 检查清单

- [ ] 动效有明确目的（解释变化），不是装饰
- [ ] 只动 transform / opacity
- [ ] 时长 200~500ms，曲线用 `--ease-out-soft`
- [ ] 同一页面 `view-transition-name` 唯一；列表卡片用 `.vt-card` 悬停命名
- [ ] 开启「减少动态效果」后检查一遍（DevTools → Rendering → Emulate CSS prefers-reduced-motion）
- [ ] 没有持续动画、没有 hover 放大按钮、没有万物 fade-up
- [ ] 改用 ClientRouter 时已处理脚本重跑、主题闪烁、island 持久化、统计上报

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 形变不生效，只有淡入淡出 | 两页名字不一致，或列表页该卡片没拿到名字 | 核对 `coverTransitionName(id)` 两边一致；确认是点击卡片进入 |
| 控制台报重复的 view-transition-name | 同页多个元素同名 | 列表用悬停命名；详情页同名元素只能一个 |
| 用了 ClientRouter 后按钮点不动 | 脚本只在首次加载执行 | 包进 `astro:page-load` |
| 用了 ClientRouter 后切页闪白 | 主题 class 丢失 | `astro:after-swap` 里重设 |
| 滚动卡顿 | 动画属性触发重排（width / top） | 改 transform |
| `import { ViewTransitions }` 报错 | 旧组件名，Astro 6 已移除 | `import { ClientRouter } from 'astro:transitions'` |
| 改用 ClientRouter 后 Umami 的 PV 翻倍 | Umami 已自动跟踪路径变化，又在 `astro:page-load` 手动 `track()` | 删掉手动上报 |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `design-system` | 曲线、阴影等令牌定义；去 AI 味清单 |
| `islands-interaction` | island 状态与水合；`transition:persist` 的使用场景 |
| `performance-doctor` | 动画导致的 INP / CLS 问题 |
| `analytics` | ClientRouter 下的页面浏览上报 |

## 参考

- MDN `@view-transition`：https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition
- MDN `view-transition-name`：https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name
- Astro 视图过渡指南（ClientRouter、生命周期事件、transition:persist、data-astro-rerun）：https://docs.astro.build/en/guides/view-transitions/
- Astro 7 升级指南（移除 astro:transitions 内部常量）：https://docs.astro.build/en/guides/upgrade-to/v7/
- Astro 6 升级指南（移除 `<ViewTransitions />`）：https://docs.astro.build/en/guides/upgrade-to/v6/
- Umami tracker 源码（`handlePush` 自动跟踪 history 变化）：https://github.com/umami-software/umami/blob/master/src/tracker/index.ts
- 百度统计单页应用设置：https://tongji.baidu.com/web/help/article?id=324&type=0
