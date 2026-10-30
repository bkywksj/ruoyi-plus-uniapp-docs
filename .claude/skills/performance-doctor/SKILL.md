---
name: performance-doctor
description: 性能诊断：先测量再优化，围绕 LCP/INP/CLS 查 island 体积与 client 指令、图片加载优先级、字体、缓存与预取，含 Lighthouse 跑法。触发词：性能、Lighthouse、Core Web Vitals、LCP、CLS、INP、加载慢、包体积、JS太大、首屏、卡顿、预取
---

# 性能诊断与优化

## 何时使用

- 页面加载慢、首屏出来慢、滚动或筛选卡顿
- Lighthouse / PageSpeed 分数低，Core Web Vitals 不达标
- 构建产物 JS 太大、想知道哪个页面加载了 React
- 选择 `client:load` / `client:idle` / `client:visible`
- 上线前做一次性能体检

其他常见说法：性能优化、PageSpeed、CWV、bundle、懒加载、prefetch、缓存。

## 这个框架的性能底子

先弄清框架默认已经做了什么，排查时才知道该怀疑哪里：

| 已有设计 | 位置 | 效果 |
|---------|------|------|
| 纯静态输出，默认零 JS | `astro.config.ts`（`output` 默认 static） | 没有 island 的页面不加载任何框架运行时 |
| 只有作品筛选区是 island | `src/components/islands/WorksExplorer.tsx`，`/works/` 页 `client:load` | React 运行时只在 `/works/` 加载 |
| 卡片组件静态 / island 两用 | `src/components/works/WorkCard.tsx` | 首页、分类页、详情页用它渲染时不产生 JS |
| 远程封面构建期转 WebP + srcset | `src/lib/images.ts` 的 `resolveCover()` | 图片自托管、按屏宽取合适尺寸 |
| 首屏几张图不懒加载，**每页只有一张** `fetchpriority="high"`，其余懒加载 | `WorkCard` 的两个独立开关：`eager`（`loading="eager"`）与 `priority`（`fetchpriority="high"`）。列表页、分类页前 3 张 `eager`、只有第 1 张 `priority`；详情页头图单独一张 high；首页精选区在 Hero 下方，两者都不设 | 改善 LCP，又不让多张图互抢带宽 |
| 所有图片声明 `width` / `height` | 卡片与详情页 | 避免 CLS；`pnpm check:seo` 会对缺宽高的图片给警告 |
| 系统字体栈，不加载中文 webfont | `src/styles/global.css` 的 `--font-sans` | 没有字体阻塞与字体切换抖动 |
| 页面切换用 CSS 跨文档视图过渡 | `global.css` 的 `@view-transition` | 过渡动画零 JS |
| 带 hash 的产物一年强缓存，HTML 协商缓存 | `deploy/nginx/default.conf` | 二次访问几乎只请求 HTML |

## 诊断流程（先测量，别凭感觉改）

```
1. 复现：在生产构建上测（pnpm build && pnpm preview），不要在 dev 模式下测性能
2. 测量：Lighthouse（实验室数据）+ 线上 PageSpeed / CrUX（真实用户数据，上线后才有）
3. 定位：看是哪一项指标差，按下方「指标 → 常见原因」表对号入座
4. 优化：一次只改一处，改完重新测，记录前后数值
5. 固化：把有效的做法写进组件/工具函数，或用 /exp 沉淀
```

> 🔴 dev 模式（`pnpm dev`）不压缩、不打包、按需编译，测出来的数字没有参考价值。

### 指标目标值

| 指标 | 含义 | 「良好」阈值（Google 定义） |
|------|------|--------------------------|
| **LCP** | 最大内容绘制：首屏最大元素出现的时间 | ≤ 2.5 s |
| **INP** | 交互到下一次绘制：点击/输入后多久有反馈 | ≤ 200 ms |
| **CLS** | 累计布局偏移：页面元素跳动的程度 | ≤ 0.1 |

## 测量方法

### Lighthouse（本地，实验室数据）

1. 构建：`pnpm build`（确认同一目录没有别的会话正在构建，并行构建会搅乱内容缓存）
2. 起预览服务：先 `netstat -ano | findstr :4329` 看是否已有本会话起过的；没有就优先用智码任务系统
   `mcp__aicoder__resolve_and_start_task(project_path=<项目根>, command="pnpm preview --port 4329", port_hint=4329)`，
   智码不可用时再 `run_in_background` 跑 `pnpm preview --port 4329`
3. 跑 Lighthouse（需要本机装有 Chrome；报告写到 `logs/`，已在 .gitignore）：

```bash
mkdir -p logs
npx lighthouse http://localhost:4329/ --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=./logs/lighthouse-home.html --chrome-flags="--headless=new"
npx lighthouse http://localhost:4329/works/ --preset=desktop --output=json --output-path=./logs/lighthouse-works.json --chrome-flags="--headless=new"
```

- 🔴 地址写 `localhost`，不写 `127.0.0.1`：本机 localhost 解析到 IPv6，预览服务只监听 `[::1]`
- 默认是移动端模拟（限速 CPU + 慢网络），`--preset=desktop` 测桌面；两个都要看
- 同一页多跑两三次取中位数，单次波动很大
- 测完只停自己起的服务：智码托管的在智码里停；自己起的用 `npx kill-port 4329`

### 构建产物体检（不需要浏览器）

```bash
# 1. 每个 JS 文件多大
ls -la dist/_astro/*.js

# 2. 哪些页面会加载 island（含 astro-island 的页面才会下载框架运行时）
grep -rl "astro-island" dist --include=*.html

# 3. 单个页面的 island 加载了哪些 JS：island 不是 <script src>，而是写在 astro-island 的属性里
grep -oE '(component|renderer)-url="[^"]*"' dist/works/index.html | sort -u

# 4. 单个页面的其余脚本：外链脚本 + 内联模块脚本（小脚本如 ThemeToggle 会被直接内联）
grep -oE '<script[^>]*src="[^"]*"' dist/works/index.html
grep -o '<script type="module">' dist/works/index.html | wc -l   # 产物 HTML 是一整行，用 -o 数次数
```

实测参考（示例站）：`/works/` 的 `renderer-url` 指向 `client.*.js`（React 运行时，约 213 KB 未压缩），`component-url` 指向 `WorksExplorer.*.js`；
这两个都**不会**出现在第 4 条 `<script src>` 的结果里——只看 `<script src>` 会误以为这页没有加载 React。

判断标准：**新增一个页面后，如果它出现在第 2 条的结果里，要能说出它为什么需要 island。**

### 线上真实数据

上线后用 PageSpeed Insights（`https://pagespeed.web.dev/`）输入正式网址，看「真实用户体验」部分（有足够访问量才有数据）；
与本地 Lighthouse 差距大时，以真实数据为准。

---

## 指标 → 常见原因 → 处理

### LCP 慢

| 原因 | 如何确认 | 处理 |
|------|---------|------|
| 首屏大图懒加载了 | Lighthouse「LCP 元素」是图片且带 `loading="lazy"` | 首屏可见的几张传 `eager`（`WorkCard` 的 `eager`；详情页封面已是 eager） |
| 首屏图没拿到高优先级 | 同上，无 `fetchpriority` | LCP 那一张传 `priority`（`WorkCard`）/ 写 `fetchpriority="high"`，**每页只给一张**：多张同时 high 等于没有优先级 |
| 图片原图太大 | Network 面板看图片字节数 | 外链封面把域名加进 `site.imageDomains`，走 `resolveCover()` 构建期裁切转 WebP |
| 首屏依赖 island 渲染 | 禁用 JS 后首屏是空的 | 首屏内容改为服务端渲染（island 的 SSR 输出应包含完整首屏） |
| 服务器慢 | TTFB > 800ms | 静态站通常不是这个原因；查 CDN / nginx 缓存头 |

### INP 差

| 原因 | 处理 |
|------|------|
| 筛选时一次重绘几百张卡片 | 保持 `WorksExplorer` 的分页加载（`pageSize` 默认 24），不要一次渲染全部 |
| 数据量上千，输入框每敲一个字都全量过滤 | 用 React 的 `useDeferredValue(query)` 让过滤延后于输入；或把检索换成 Pagefind（见 `site-search`） |
| island 太多、都在 `client:load` | 按下表降级指令 |
| 第三方脚本（统计、客服）抢主线程 | 统计走 `Analytics.astro`（只在生产输出、defer 加载）；其他第三方按需延迟加载 |

### CLS 高

| 原因 | 处理 |
|------|------|
| 图片没宽高 | 所有 `<img>` 写 `width` + `height`；容器用 `aspect-video` 这类比例类兜底 |
| island 水合后尺寸变化 | SSR 输出与水合后的结构保持一致；需要读 URL 参数的状态放在 `useEffect` 里（WorksExplorer 的做法） |
| 字体切换导致文字跳动 | 保持系统字体栈；确需品牌字体时用 Astro 的 fonts 配置（v6 起已转正）并只给标题用 |
| 暗色模式闪烁 | `ThemeScript.astro` 必须保持 `is:inline` 且在 `<head>` 里，不要改成打包脚本 |

---

## island 与 client 指令

React 19 的客户端运行时是站点里最大的一块 JS（示例站构建产物 `client.*.js` 实测 212,922 字节，约 213 KB 未压缩，只在含 island 的页面加载）。
所以核心原则是：**能不做 island 就不做；必须做时，让它越晚加载越好。**

| 指令 | 何时加载 | 用在 |
|------|---------|------|
| `client:load` | 页面加载后立即 | 首屏就要交互的区域（作品列表页的筛选器） |
| `client:idle` | 浏览器空闲时 | 首屏可见但不急着交互的组件 |
| `client:visible` | 滚动到可见时 | 页面下方的交互组件（评论区、图表） |
| `client:media="(max-width: 768px)"` | 媒体查询匹配时 | 只在某种屏宽需要交互的组件 |
| `client:only="react"` | 跳过服务端渲染 | 依赖浏览器 API 且不需要被收录的组件（慎用：爬虫看不到内容） |

判断顺序：

```
这个区域有「状态」吗？（输入、切换、筛选、计数）
  └ 没有 → .astro 静态组件（主题切换、移动端菜单这类小交互用 <script> / <details>，见 ThemeToggle、SiteHeader）
  └ 有 → 首屏就要能用吗？
          ├ 是 → client:load
          └ 否 → client:visible / client:idle
```

- 多个 island 共享状态时再考虑 nanostores（见 `islands-interaction`），不要为共享状态把整页包成一个 island
- 传给 island 的 props 会序列化进 HTML：只传渲染需要的字段（`WorkCardData` 就是裁剪后的结构），不要把整条集合 entry 传进去

## 图片

- 远程图：域名进 `site.imageDomains` → `resolveCover(src, 宽, 高)` 构建期生成 WebP 与 srcset（`widths` 为 0.625× / 1× / 1.5×）
- 本地图：放 `src/assets/` 用 `astro:assets` 的 `<Image>` / `getImage()`；`public/` 下的图**不会被优化**，只适合 favicon、og 图这类要固定地址的文件
- `sizes` 要和实际布局一致：卡片网格 `sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"`，改了网格列数要同步改
- 详见 `image-optimization` 技能

## 预取（按需开启）

静态站跳转本身很快；列表 → 详情这种高频路径可以加预取进一步缩短：

```ts
// astro.config.ts
export default defineConfig({
  prefetch: { defaultStrategy: 'hover' }, // 只对带 data-astro-prefetch 的链接生效
});
```

```astro
<a href={workPath(work.id)} data-astro-prefetch>…</a>          <!-- 悬停/聚焦时预取 -->
<a href="/works/" data-astro-prefetch="viewport">…</a>          <!-- 进入视口时预取 -->
```

- 🔴 取舍：开启 `prefetch` 后 Astro 会给**所有页面**注入一段预取脚本，页面不再是「零 JS」；只在列表 → 详情确实是高频路径时开
- 不要开 `prefetchAll`：几百张卡片的列表页会预取几百个页面
- 用户开了省流量模式或网络很慢时，Astro 会自动退化为 `tap` 策略（点击前才预取）

## 缓存与传输（部署侧）

`deploy/nginx/default.conf` 已配置的分级（上 CDN 时照这个分级设置，不要全站一刀切长缓存）：

| 资源 | nginx 里的缓存策略 | 原因 |
|------|-------------------|------|
| `/_astro/*`（文件名带 hash） | `public, max-age=31536000, immutable` | 内容变了文件名就变 |
| `/llms.txt` | `public, max-age=3600` | 给 AI 的摘要，变化不频繁 |
| 其余全部：`*.html`、`/`、`/robots.txt`、`sitemap-*.xml`、图片等 `public/` 文件 | `no-cache`（协商缓存） | 发版立即生效；robots 与 sitemap 改了要尽快被爬虫看到 |

压缩：gzip 已开（含 `text/xml`，sitemap 也会压缩）。改缓存头属于框架核心文件 `deploy/nginx/*.conf`，孵化项目里改要单独提交、scope 写 `framework`。

## 优化检查清单

- [ ] 在 `pnpm build && pnpm preview` 上测量，不在 dev 模式下测
- [ ] 每页最多一张 `fetchpriority="high"` 的图，且就是 LCP 元素：`grep -oi 'fetchpriority="high"' dist/<页面>/index.html | wc -l`（产物 HTML 被压成一行，要用 `-o` 数出现次数而不是 `-c` 数行；React 渲染的卡片输出 `fetchPriority`，所以加 `-i`）
- [ ] 所有 `<img>` 有 `width` / `height`（`pnpm check:seo` 无相关警告）
- [ ] `grep -rl "astro-island" dist` 列出的页面都说得出为什么需要 island
- [ ] 新 island 用了尽量晚的 `client:*` 指令，props 只含必要字段
- [ ] 没有引入中文 webfont、没有全站 `prefetchAll`；开了 `prefetch` 的话确认它值得那段全站脚本
- [ ] 优化前后的 Lighthouse 数值已记录（写进任务台账或 `/exp`）

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `image-optimization` | 图片的具体写法与格式选择 |
| `islands-interaction` | island 的状态管理与写法 |
| `site-search` | 数据量大时的检索方案（Pagefind） |
| `deployment-guide` | CDN、缓存头、压缩的部署侧配置 |
| `motion-transitions` | 动效本身；本技能只关心它有没有拖慢交互 |
