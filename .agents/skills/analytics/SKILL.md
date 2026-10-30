---
name: analytics
description: 访问统计：site.config 的 analytics 配置（none、umami、baidu）、仅生产构建注入、自定义事件、查询参数与客户端路由下的 PV、隐私合规。触发词：统计、访问量、Umami、百度统计、GA、Google Analytics、埋点、PV、UV、事件追踪、隐私、cookie
---

# 访问统计（next-ai-astro）

## 何时使用

- 要看访问量、来源、热门页面
- 统计按钮点击、外链跳转（如「去 B 站观看」点击次数）
- 接入 / 更换统计工具（Umami / 百度统计 / GA）
- 本地开发时统计数据被污染、PV 异常偏高（筛选、搜索改 URL 被记成浏览）
- 隐私政策、cookie 提示、个人信息保护法相关的问题

## 概述

统计只回答「内容有没有被看、从哪来、哪些入口有效」。本框架的立场：
- **默认不开**（`provider: 'none'`），站点所有者决定后再开。
- **优先无 cookie 的工具（Umami）**：不涉及 cookie 横幅，采集面最小，脚本轻。
- **只在生产构建注入**：本地 `pnpm dev` 永远不上报。
- 统计脚本不能影响首屏：`defer` 加载，不阻塞渲染。

---

## 本框架现状

### 配置（`src/site.config.ts`）

```ts
analytics: {
  provider: 'none' as AnalyticsProvider, // 'none' | 'umami' | 'baidu'
  /** umami: website-id；baidu: hm.js 后面那串 id */
  id: '',
  /** umami 自托管脚本地址，provider=umami 时必填 */
  src: '',
},
```

站点级配置写在 `site.config.ts`，不走环境变量（该文件被 `astro.config.ts` 引用，配置文件执行环境读不到 `.env`，见 `env-config`）。

### 注入（`src/components/layout/Analytics.astro`，由 `BaseLayout` 的 `<head>` 引入）

```astro
const { provider, id, src } = site.analytics;
const enabled = import.meta.env.PROD && provider !== 'none' && id !== '';
---
{enabled && provider === 'umami' && src && (
  <script is:inline defer src={src} data-website-id={id} data-exclude-search="true"></script>
)}
{enabled && provider === 'baidu' && <script is:inline set:html={baiduSnippet} />}
```

（写法细节以 `Analytics.astro` 源码为准。）

- `import.meta.env.PROD`：只有 `astro build` 的产物包含统计脚本；`pnpm dev` 不包含。
- `is:inline`：第三方脚本原样输出，不经 Astro 打包。
- `pnpm preview` 预览的是生产产物，**会上报**；本地预览时临时把 provider 改回 `none` 或在统计后台过滤 localhost。

### 🔴 为什么 Umami 必须带 `data-exclude-search="true"`

Umami 默认会劫持 `history.pushState` / `replaceState`：URL 一变就记一次页面浏览（umami 源码 `src/tracker/index.ts` 的 `handlePush`，
官方 tracker-configuration 文档称之为默认开启的「path change detection」）。而 `WorksExplorer` 每改一次筛选、每敲一个字都会
`replaceState` 更新 `?q=&c=&tag=&sort=`。不排除查询参数时会出两个问题：

1. **PV 虚高**：在搜索框输入「静态站」会被记成好几次页面浏览。
2. **搜索词外泄**：`?q=静态站` 作为页面 URL 原文发到统计端，违反下文「不上报用户输入原文」的规定。

`data-exclude-search="true"`（Umami v2.11.0 起支持）让 Umami 采集 URL 时去掉查询参数：同一路径只改 `?…` 视为 URL 未变，
`handlePush` 不会再上报，`?q=` 也不会发出去。代价是 Umami 报表里看不到带参数的 URL（分享链接的筛选条件不计入统计）——内容站可以接受。

- 新 island 要把状态写进**路径**（如 `/works/tag/xxx/`）时，这层保护不起作用，先想清楚是否真要这样做。
- 百度统计默认不跟踪 `replaceState`；如果在后台开启了「单页应用设置」，要实测筛选是否会被记成页面浏览再决定（见下文第 5 节）。

---

## 标准做法

### 1. 选工具

| 工具 | cookie | 部署 | 适合 |
|------|--------|------|------|
| **Umami**（推荐） | 官方 FAQ：「Umami does not use any cookies in the tracking code」，因此不需要 cookie 提示；不收集可识别个人的信息 | 自托管（可经 Reeve 部署到自己的服务器）或官方云 | 个人站、作品站、产品站 |
| 百度统计 | 使用 cookie（以百度统计官方隐私说明为准） | SaaS | 主要受众在国内、需要百度搜索词数据 |
| 不开 | — | — | 不需要数据时 |

GA4 等需要 cookie 同意横幅的工具本框架不内置：需要时先走 `tech-decision`，评估受众地区的同意管理要求。

### 2. 开启 Umami

1. 部署 Umami（自托管经 Reeve；或使用官方云），创建网站，拿到 website id 与脚本地址。
2. 改 `site.config.ts`：

   ```ts
   analytics: { provider: 'umami', id: '<website-id>', src: 'https://<你的统计域名>/script.js' },
   ```

3. `pnpm build`，在 `dist/index.html` 里确认有 `data-website-id` 且带 `data-exclude-search="true"` 的脚本；`pnpm dev` 页面里没有。
4. 如果启用了 CSP（见 `security-guard`），把统计域名加进 `script-src` 与 `connect-src`。

### 3. 自定义事件

**Umami**（官方 track-events 文档）：

```astro
<!-- 声明式：点击即上报事件，data-umami-event-* 作为事件属性（都按字符串保存） -->
<a
  href={work.data.url}
  target="_blank"
  rel="noopener"
  data-umami-event="outbound-original"
  data-umami-event-id={work.id}
>
  查看原作品
</a>
```

```ts
// 在 island 或 <script> 里：umami 可能未加载（dev、被拦截），调用前判断
window.umami?.track('search', { query_length: query.length });
```

- 事件名 ≤ 50 字符（官方限制）；没有事件名不能单独发送事件数据。
- 数字、布尔值要作为数值上报时用 JS 的 `umami.track(name, data)`，data 属性只能是字符串。
- TypeScript 下给 `window.umami` 声明可选类型（`src/env.d.ts`），不要到处 `as any`。

**百度统计**（官方「事件跟踪」说明）：

```ts
window._hmt?.push(['_trackEvent', '外链', '点击', work.id]);
// 参数：category（必填）、action（必填）、opt_label（可选）、opt_value（可选，数值）
```

事件命名约定（两种工具通用）：`对象-动作` 小写短横线，如 `outbound-original`、`search`、`filter-category`；
**不要把用户输入原文**（搜索词全文、邮箱）作为事件属性上报，只报长度、类别等不可识别的信息。

### 4. 值得埋的事件（内容站）

| 事件 | 回答的问题 |
|------|-----------|
| 详情页主 CTA 点击（去原平台观看 / 下载） | 站点给原平台导流的效果 |
| 列表筛选使用（分类 / 标签 / 搜索） | 分类体系是否好用、用户找什么 |
| 搜索无结果 | 缺什么内容（只报「无结果」这一事实，不报搜索词原文） |
| 深色模式切换 | 是否值得默认深色 |

埋点不求多：每个事件都要对应一个会据此做的决定。

### 5. 用了 ClientRouter 时

默认方案（CSS 跨文档过渡）下每次导航都是完整页面加载，统计脚本自动记录页面浏览。
若改用 `<ClientRouter />`，页面切换不再整页加载，按工具分别处理：

| 工具 | 客户端路由下的行为 | 要做什么 |
|------|------------------|---------|
| Umami | ClientRouter 用 History API 切换路径，Umami 的 `handlePush` 会**自动**记一次页面浏览（`data-exclude-search` 只去掉查询参数，路径变化照常记） | **什么都不用加**。🔴 不要再在 `astro:page-load` 里手动 `umami.track()`，否则每次切页记两次 |
| 百度统计 | 默认不识别客户端路由 | 二选一，**不要同时用**（官方说明同时用会发重复日志）：后台「管理 > 单页应用设置」开启 SPA 统计；或在 `astro:page-load` 里 `window._hmt?.push(['_trackPageview', location.pathname])`（`pageURL` 必须是 `/` 开头的相对路径），并跳过首次加载 |

改完用浏览器 Network 面板点几次站内链接，确认每次切页正好一条页面浏览请求。详见 `motion-transitions`。

---

## 隐私与合规

- 《个人信息保护法》要求处理个人信息前向个人告知处理目的、方式、种类等事项（以法律原文与专业意见为准）。
  使用统计工具时，在「关于」或独立隐私政策页写明：使用了什么统计工具、收集哪些信息、用途、是否涉及第三方。
- Umami 官方说明不收集可识别个人的信息且不使用 cookie，合规负担最小；百度统计等使用 cookie 的工具，告知义务更重。
- 本框架**不内置 cookie 同意横幅**：默认工具不需要。改用需要同意的工具时，同意之前不得加载统计脚本。
- 不在事件里上报可识别个人的信息（邮箱、手机号、账号、搜索词原文）。

> 本节是工程实践提示，不构成法律意见；面向欧盟等地区的受众时，同意管理要求不同，需单独评估。

---

## 检查清单

- [ ] 站点所有者确认要开统计、选定工具
- [ ] `site.config.ts` 的 provider / id / src 已填，`pnpm build` 产物有脚本、`pnpm dev` 没有
- [ ] Umami 脚本带 `data-exclude-search="true"`；在 `/works/` 搜索框连续输入，Network 面板里没有多出页面浏览请求、请求里没有 `?q=`
- [ ] 事件名 ≤ 50 字符，命名统一；没有上报可识别个人的信息
- [ ] 调用 `umami` / `_hmt` 前做了存在性判断
- [ ] 开了 CSP 的站点已放行统计域名
- [ ] 隐私说明已写在关于页或隐私政策页
- [ ] 用了 ClientRouter 的站点：Umami 没有手动补报；百度统计二选一（后台 SPA 设置或手动 `_trackPageview`），每次切页正好一条

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 统计里全是 localhost 访问 | 在 `pnpm preview` 下测试 | 预览时临时关统计，或后台过滤主机名 |
| 线上没有数据 | id 为空（`enabled` 条件不满足）/ Umami 没填 `src` | 检查三项配置 |
| 事件报错 `umami is not defined` | 脚本未加载（被拦截 / dev） | `window.umami?.track()` |
| 数值属性在报表里是字符串 | 用 data 属性上报了数字 | 改用 `umami.track(name, data)` |
| 开了 CSP 后统计失效 | 统计域名没放行 | 加入 `script-src` / `connect-src` |
| `/works/` 的 PV 远高于其他页、报表里出现 `?q=…` | Umami 脚本缺 `data-exclude-search="true"`，筛选的 `replaceState` 被记成页面浏览 | 补上该属性 |
| 改用 ClientRouter 后 PV 翻倍 | Umami 已自动跟踪路径变化，又在 `astro:page-load` 手动 `track()` | 删掉手动上报 |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `env-config` | 为什么站点级配置不走 `.env` |
| `security-guard` | CSP 放行第三方脚本 |
| `motion-transitions` | ClientRouter 下的页面浏览 |
| `islands-interaction` / `site-search` | 筛选、搜索写 URL 查询参数（统计侧靠 `data-exclude-search` 排除） |
| `deployment-guide` | 自托管 Umami 的部署（经 Reeve） |
| `seo-meta` / `geo-optimization` | 收录与引用；统计只负责观测结果 |

## 参考

- Umami 自定义事件：https://docs.umami.is/docs/track-events
- Umami tracker 函数：https://docs.umami.is/docs/tracker-functions
- Umami tracker 配置（`data-exclude-search`、`data-auto-track`）：https://docs.umami.is/docs/tracker-configuration
- Umami tracker 源码（`handlePush` 劫持 pushState / replaceState）：https://github.com/umami-software/umami/blob/master/src/tracker/index.ts
- Umami FAQ（cookie 与 GDPR）：https://docs.umami.is/docs/faq
- 百度统计事件跟踪：https://tongji.baidu.com/holmes/Analytics/%E6%8A%80%E6%9C%AF%E6%8E%A5%E5%85%A5%E6%8C%87%E5%8D%97/JS%20API/JS%20API%E9%83%A8%E7%BD%B2%E8%AF%B4%E6%98%8E/%E4%BA%8B%E4%BB%B6%E8%B7%9F%E8%B8%AA
- 百度统计 PV 跟踪（`_trackPageview`）：https://tongji.baidu.com/holmes/Analytics/%E6%8A%80%E6%9C%AF%E6%8E%A5%E5%85%A5%E6%8C%87%E5%8D%97/JS%20API/JS%20API%E9%83%A8%E7%BD%B2%E8%AF%B4%E6%98%8E/PV%E8%B7%9F%E8%B8%AA
- 百度统计单页应用设置：https://tongji.baidu.com/web/help/article?id=324&type=0
