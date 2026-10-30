---
name: tech-decision
description: 内容站技术选型：渲染模式、框架、island、搜索、托管、CMS、评论、统计、图片与新依赖评估，给决策树和框架默认值。触发词：技术选型、方案对比、选哪个库、要不要上SSR、Astro还是Next、搜索方案选型、部署平台选型、CMS选型、引入依赖、哪个好
---

# 技术决策指南

## 何时使用

- 选择用什么技术 / 库 / 服务
- 对比两个具体方案（A 还是 B）
- 要不要上 SSR、要不要换框架
- 搜索、评论、统计、CMS、部署平台选型
- 引入新依赖前的兼容性评估

其他常见说法：选型、用什么、对比、优缺点、评论系统、统计工具。

## 本项目技术栈（精确版本）

| 类别 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 运行时 | Node.js | ≥ 22.12.0 | Astro 7 最低要求 |
| 包管理 | pnpm | 10.17.1 | `packageManager` 字段锁定 |
| 框架 | Astro | 7.3.5 | 纯静态输出（`output: 'static'`），Vite 8 |
| island | @astrojs/react + React | 7.0.0 / 19.3.0 | 只在需要状态的区块水合 |
| 样式 | Tailwind CSS（@tailwindcss/vite） | 4.3.3 | 语义令牌在 `src/styles/global.css` |
| 校验 | Zod（Astro 内置 `astro/zod`） | 4 | 集合 schema |
| 图片 | sharp | 0.35.4 | 构建期转码，`astro:assets` 使用 |
| 图标 | @lucide/astro / lucide-react | 1.48.0 | `.astro` 与 island 各用一个 |
| sitemap | @astrojs/sitemap | 3.7.4 | 生成 `sitemap-index.xml` |
| 类型检查 | @astrojs/check + TypeScript | 0.9.10 / 6.0.3 | 🔴 TypeScript 受 `@astrojs/check` 的 peer 范围约束，不能随意升大版本 |
| 单元测试 | Vitest | 5.0.2 | `tests/unit/` |
| E2E | Playwright | 1.63.0 | `tests/e2e/`，可选 |
| 部署 | Docker（node:22-alpine 构建 + nginx:1.27-alpine 托管） | — | `Dockerfile`、`deploy/nginx/` |

> 版本以 `package.json` 与 `pnpm-lock.yaml` 为准；升级大版本先查官方升级指南（context7 `/withastro/docs`），并走一次 `pnpm verify`。

### 框架已提供的能力（选型前先确认是否已经有了）

| 能力 | 实现 | 位置 |
|------|------|------|
| 前端检索 | 多词子串匹配 + 字段加权，零依赖 | `src/lib/search.ts` |
| 外部数据同步 | 运行器 + 上下文（超时重试、缓存、失败保留旧数据） | `scripts/sync/` |
| SEO / GEO | SEOHead、JSON-LD 工具、robots、llms.txt、sitemap、构建后校验 | `src/components/seo/`、`src/lib/seo.ts`、`scripts/check-seo.mjs` |
| 统计 | none / Umami / 百度统计三选一 | `src/site.config.ts` 的 `analytics` |
| 深色模式 | 首屏前同步脚本 + 令牌 | `ThemeScript.astro`、`global.css` |
| 页面过渡 | CSS 跨文档视图过渡 | `global.css` |

---

## 技术选型决策树

### 场景 1：渲染模式 —— 纯静态、按需渲染还是混合？

```
这个页面的内容在构建时能确定吗？
├── 能（绝大多数内容站页面）→ 静态预渲染 ✅ 框架默认
│
├── 只有一小块是实时的（播放量、库存、在线状态）
│   ├── 能接受「截至构建时刻」→ 静态 + 定时重建
│   └── 必须实时 → 静态页 + island 在浏览器里请求公开接口
│
└── 整页依赖请求（登录后才能看、按用户个性化、表单提交处理）
    └── 按需渲染：装 adapter（如 @astrojs/node），只给这些路由设 `export const prerender = false`
        其余页面仍然静态
```

**本框架默认**：纯静态。
**理由**：无运行时服务器 → 部署就是一个 nginx；没有服务端攻击面；CDN 可以整站缓存；构建产物可直接回滚。
**切换代价**：引入 adapter 后需要常驻 Node 进程、监控与资源预算，部署方式从「静态托管」变成「应用托管」。先确认是不是只有一两个接口需要服务端，那种情况更适合单独起一个小服务。

### 场景 2：框架 —— Astro、Next.js 还是 VitePress？

| 维度 | Astro | Next.js | VitePress |
|------|-------|---------|-----------|
| 默认客户端 JS | 0（只有 island） | 全页 React 运行时 | Vue 运行时 + 路由 |
| 最适合 | 内容站、目录站、品牌站、营销页 | 应用型站点：登录、仪表盘、大量交互 | 文档站：侧栏 + 正文 + 目录 |
| 交互能力 | island 局部 | 全局 | 有限（自定义主题） |
| 数据层 | 内容集合（类型安全） | 自行组织 | Markdown 文件 |
| 部署 | 纯静态最简单 | 需要 Node 或平台支持 | 纯静态 |

```
站点主体是什么？
├── 一篇篇文档，需要侧边栏导航 → VitePress
├── 列表 + 详情 + 分类的内容展示，交互只在局部 → Astro ✅
└── 登录后的应用、复杂状态、实时协作 → Next.js
```

**本框架定位**：Astro 这一格。同一个产品线里，文档站用 VitePress、应用型官网用 Next.js 都是合理组合，不要为了「统一技术栈」把内容站做成 Next.js。

### 场景 3：island 框架 —— React、Preact、Vue 还是原生脚本？

```
这个交互需要多少状态？
├── 几乎没有（开关、折叠、复制按钮、主题切换）
│   └── 原生 <script>（Astro 会打包去重）或 HTML 原生元素（<details>、<dialog>） ✅
│
├── 有状态（筛选、搜索、表单校验、轮播）
│   ├── 默认 → React ✅ 框架已集成
│   ├── 对体积极度敏感、组件简单 → Preact（需单独集成，与 React 并存时用 include 区分文件）
│   └── 团队只熟 Vue → Vue（需单独集成）
│
└── 多个 island 之间要共享状态
    └── nanostores（跨框架、极小）
```

**本框架默认**：React。
**理由**：shadcn/ui、motion 等生态现成；同产品线的 Next.js 站点可以复用组件；React 运行时只在有 island 的页面加载（示例站里只有 `/works/`；首页、详情页、分类页不加载框架运行时，只有主题切换这类几行原生脚本）。
**不建议**：同一个项目混用多个 island 框架——每多一个框架就多一份运行时与构建配置。

### 场景 4：站内搜索

```
要搜什么、有多少？
├── 条目元数据（标题 / 摘要 / 标签 / 分类），几千条以内
│   └── src/lib/search.ts 子串匹配 ✅ 框架默认
│       中文天然准确（不依赖分词），零依赖，即时响应
│
├── 文章全文，或条目超过几千条
│   └── Pagefind：构建后从 dist/ 的 HTML 生成静态索引，浏览器按需加载分片
│       需要多一个构建步骤；中文检索效果上线前要实测
│
└── 需要拼写纠错、同义词、搜索统计、跨站搜索
    └── 托管搜索服务（Algolia）或自托管（Meilisearch）
        评估：成本、国内访问速度、数据是否允许出境
```

🔴 **不要**直接把按空格分词的前端搜索库（MiniSearch、Fuse 默认配置）用于中文：整句中文会被当成一个词，搜「静态站」反而搜不到。

### 场景 5：托管与部署平台

```
访客主要在哪？
├── 国内
│   ├── 已有国内服务器 → Docker + nginx 自托管（经 Reeve 部署）✅ 框架默认
│   │   需要：ICP 备案（国内服务器 / 国内 CDN 对外提供网站服务的前提）
│   └── 纯静态也可：对象存储静态托管 + 国内 CDN（同样需要备案）
│
├── 海外 / 全球
│   └── Cloudflare Pages / Netlify / Vercel（免运维、自带 CDN）
│       国内访问速度与稳定性不保证
│
└── 两者都有
    └── 国内自托管为主站 + 海外平台镜像；canonical 指向主站
```

**本框架默认**：多阶段 Dockerfile + nginx，经 Reeve `deploy_run` 部署。
**理由**：与现有服务器运维体系一致；配置（安全头、缓存、跳转）全在仓库里可审查；一条命令回滚到旧镜像。

### 场景 6：要不要上 Headless CMS？

```
谁在更新内容？
├── 开发者自己，或内容来自外部平台同步 → Git 里的 JSON / Markdown ✅ 框架默认
│
├── 有不会用 Git 的编辑，但人数少、流程简单
│   └── 基于 Git 的 CMS（Decap CMS、TinaCMS）：编辑在网页后台写，结果仍提交到仓库
│       站点仍是纯静态，内容有完整版本历史
│
└── 多编辑、审核流程、定时发布、权限管理
    └── API 型 CMS（Payload、Strapi、Directus）：
        默认仍走 scripts/sync：写一个数据源把 CMS 内容拉成 JSON / Markdown 落盘再构建
        代价：多一个要运维的服务和数据库；内容更新需要触发「同步 + 重建」（webhook）
```

**判断原则**：CMS 解决的是「谁来编辑」的问题，不是技术问题。没有非技术编辑时不引入。

**取数方式的统一口径**（与 `architecture-design`「各层规则」一致）：外部数据默认经 `scripts/sync` 落盘——失败保留上一版、数据变化在 git diff 里可审查、构建不依赖外部接口在线。
Astro 内容集合的**自定义 loader 构建期直取**只作为例外：内容量大到落盘不现实、或 CMS 官方只提供 loader 时才考虑；
选用前在 `docs/decisions/` 写决策记录，并保证接口失败时**构建直接失败**（不能产出空列表页上线）。

### 场景 7：评论系统

```
真的需要评论吗？（先问目的：收集反馈？社区讨论？）
├── 只是想收反馈 → 联系方式 / 表单服务 / 引导到原平台评论区（最轻）
│
└── 需要站内评论
    ├── 访客多为开发者、能登录 GitHub → Giscus（基于 GitHub Discussions，免运维）
    │   注意：国内访问 GitHub 不稳定
    └── 面向国内普通访客 → 自托管评论服务（Waline、Twikoo、Artalk 等）
        注意：需要运维与内容审核（评论内容的合规责任在站点方）
```

**本框架默认**：不带评论。评论以 island 形式接入，`client:visible` 懒加载，不影响首屏。

### 场景 8：访问统计

| 方案 | Cookie | 部署 | 适合 |
|------|--------|------|------|
| Umami | 不使用 | 自托管 | 默认推荐：数据在自己手里；不写 Cookie，通常不需要 Cookie 同意横幅（隐私政策里仍要说明统计，是否合规以目标地区法规为准） |
| 百度统计 | 使用 | SaaS | 需要百度搜索来源数据时 |
| Google Analytics 4 | 使用 | SaaS | 面向海外、需要与 Google 广告体系打通时；欧盟访客需同意管理 |
| Cloudflare Web Analytics | 不使用 | SaaS | 已托管在 Cloudflare 时顺手开启 |

**本框架支持**：`site.config.ts` 的 `analytics.provider` 切换 `none` / `umami` / `baidu`，只在生产构建输出脚本。其他方案按 `analytics` 技能接入。

### 场景 9：图片托管

```
图片从哪来、有多少？
├── 来自外部平台（视频封面、头像）→ 构建期下载转存 ✅ 框架默认
│   域名加入 site.imageDomains；顺带绕开防盗链、统一转 WebP
│
├── 自己的素材，数量不多 → 放 src/assets/（走 astro:assets 优化）或 public/
│
└── 大量大图、频繁更新（相册、作品集原图）
    └── 对象存储 + CDN（按需裁剪参数由 CDN 提供），站内只存地址
        构建期不再下载，避免构建时间与仓库体积失控
```

### 场景 10：UI 组件库

```
├── 静态展示组件 → 框架自带 .astro 组件（Container / Section / Button / Badge / Breadcrumbs）✅
├── island 里需要复杂组件（下拉、对话框、日期选择）
│   └── shadcn/ui（复制源码进项目，配合 Tailwind v4 与语义令牌改色）
└── 🔴 不引入整套 UI 框架（Ant Design、Element 等）：体积大、风格与令牌体系冲突
```

---

## 技术优先级指南

### 优先级 1：框架已有能力（覆盖大多数场景）

内容集合 + 静态页面 + `src/lib/search.ts` + `scripts/sync/` + SEOHead + 原生脚本 / React island。

### 优先级 2：官方集成（特定需求）

`@astrojs/mdx`（文章里要嵌组件）、`@astrojs/rss`（订阅源）、`@astrojs/markdown-remark`（需要 remark / rehype 插件）、Astro i18n 路由（多语言）、adapter（少数按需渲染路由）。

### 优先级 3：第三方库 / 服务（专用需求）

Pagefind、评论服务、Headless CMS、托管搜索。引入前必须过下方「评估检查清单」。

---

## 常见选型对比

### 1. 构建期取数 vs 浏览器取数

| 维度 | 构建期（`scripts/sync` 落盘；自定义 loader 为例外，见场景 6） | 浏览器（island 里 fetch） |
|------|------------------------------|---------------------|
| 收录 | 内容在 HTML 里，爬虫可见 | 爬虫大多不执行 JS，看不到 |
| 速度 | 零请求 | 首屏后才出现 |
| 实时性 | 截至构建时刻 | 实时 |
| 稳定性 | 接口挂了保留上一版 | 接口挂了访客看到错误 |
| 选择 | 默认 | 只用于必须实时、且不需要被收录的数字 |

### 2. 页面过渡：CSS 跨文档过渡 vs ClientRouter

| 维度 | CSS `@view-transition`（框架默认） | `<ClientRouter />` |
|------|--------------------------------|-------------------|
| JS | 零 | 需要客户端路由脚本 |
| 行为 | 浏览器正常跳转，支持的浏览器自动过渡 | 拦截导航，SPA 式切换 |
| 副作用 | 无 | 页面脚本要改用 `astro:page-load` 等生命周期事件；island 状态保留需额外处理 |
| 选择 | 默认 | 需要跨页面保留播放器 / 状态时才考虑 |

### 3. 数据文件格式

| 格式 | loader | 适合 |
|------|--------|------|
| JSON 数组（单文件） | `file()` | 同步生成的条目、分类、FAQ |
| Markdown（一文件一条） | `glob()` | 长文、需要正文排版的内容 |
| YAML | `file()` | 手工维护的小型配置型数据 |

---

## 决策记录模板

重要选型保存到 `docs/decisions/{YYYYMMDD}-{主题}.md`（或写进当前任务卡的「技术调研」区）：

```markdown
# 决策：{标题}

## 背景
{为什么要做这个选择，约束是什么}

## 决策内容
{选了什么}

## 考虑的方案
| 方案 | 优点 | 缺点 |
|------|------|------|
| A | | |
| B | | |

## 决策理由
1. {理由}

## 后果
- 正面：{}
- 负面 / 需要承担的成本：{}
- 什么情况下应重新评估：{}

## 日期
{date '+%Y-%m-%d'}
```

---

## 引入新依赖的流程

```bash
# 1. 查版本与 peer 依赖（是否兼容 Astro 7 / React 19 / Vite 8 / TypeScript 6）
npm view <包名> version
npm view <包名> peerDependencies

# 2. 查官方文档的当前用法（context7），Astro 集成优先用官方 @astrojs/*

# 3. 安装
pnpm add <包名>            # 运行时依赖
pnpm add -D <包名>         # 开发依赖

# 4. 需要安装脚本的包（原生二进制等），加入 package.json 的 pnpm.onlyBuiltDependencies 后重新 pnpm install

# 5. 验证
pnpm verify
```

提交：`chore(deps): 引入 <包名> 用于 <用途>`；若改变了开发约定（新的组件写法、新的目录），同步更新 CLAUDE.md 与相关技能。

---

## 评估检查清单

### 选型前必查

- [ ] 框架是否已经提供了这个能力（见「框架已提供的能力」）
- [ ] 能否在构建期完成，而不是加到浏览器里
- [ ] 新增多少客户端 JS？只在需要的页面加载吗？
- [ ] 与 Astro 7 / Vite 8 / React 19 / TypeScript 6 是否兼容（peerDependencies）
- [ ] 国内访问是否可用（CDN、第三方脚本、接口）
- [ ] 是否引入需要运维的服务、数据库或常驻进程
- [ ] 数据是否出境、是否涉及个人信息与 Cookie
- [ ] 维护状态：最近更新时间、issue 响应情况
- [ ] 退出成本：以后要换掉它，需要改多少地方

### 本项目优先原则

1. **构建期 > 运行期**
2. **零 JS > 原生脚本 > island**
3. **框架已有 > 官方集成 > 第三方**
4. **自托管可控 > SaaS 便利**（国内访客为主时尤其如此）
5. **少依赖 > 多依赖**：每个依赖都是未来的升级成本

---

## 快速决策参考

| 问题 | 推荐 | 原因 |
|------|------|------|
| 要不要上 SSR？ | 默认不上；个别路由按需渲染 | 纯静态部署与运维成本最低 |
| Astro 还是 Next？ | 内容站 Astro，应用型 Next | 默认 JS 体积与数据层差异 |
| 交互用什么写？ | 简单用原生脚本，有状态用 React island | 框架已集成 React |
| 搜索用什么？ | 元数据用 `src/lib/search.ts`，全文用 Pagefind | 中文子串匹配零依赖 |
| 部署到哪？ | 国内服务器 Docker + nginx（经 Reeve） | 与现有运维一致，可审查可回滚 |
| 要不要 CMS？ | 没有非技术编辑就不要 | CMS 解决的是编辑协作问题 |
| 评论用什么？ | 先确认必要性；国内访客选自托管服务 | 合规与可访问性 |
| 统计用什么？ | Umami | 无 Cookie、数据自有 |
| 图片放哪？ | 外部封面构建期转存；大量原图用对象存储 + CDN | 防盗链与构建时间 |
| 组件库？ | 框架组件 + island 内按需 shadcn/ui | 与令牌体系一致 |

---

## 🔗 关联技能边界

| 场景 | 应使用技能 |
|------|-----------|
| 还没有方向，需要发散 | `brainstorm` |
| 方向已定，要设计栏目 / URL / 集合结构 | `architecture-design` |
| 选定后落地部署 | `deployment-guide` |
| 选定后落地搜索 / 统计 / 图片 | `site-search` / `analytics` / `image-optimization` |
| 选型结论要拆成执行计划 | `writing-plans` |
