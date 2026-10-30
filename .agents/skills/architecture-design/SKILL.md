---
name: architecture-design
description: 内容站架构设计：信息架构与 URL 层级、集合→lib→页面→island 分层、新集合/字段/分类取舍、何时用 island、框架核心边界与重构策略。触发词：架构、目录划分、分层、重构、信息架构、栏目结构、URL结构、页面层级、模块划分、代码组织
---

# 架构设计（architecture-design）

## 何时使用

- 新站点规划栏目与 URL 结构
- 决定某类内容是新集合、新字段还是新分类
- 页面越写越大，需要拆组件 / 抽查询
- 判断某个交互该不该做成 island
- 页面层级、面包屑、分类页与标签页如何设计
- 重构目录或分层

其他常见说法：架构设计。
具体方案对比（Pagefind vs 前端检索、Cloudflare vs 自建）用 `tech-decision`；落地某个集合用 `content-collections`。

## 本框架技术栈

| 层 | 技术 | 版本（package.json） | 角色 |
|----|------|---------------------|------|
| 框架 | Astro | ^7.3.5 | 静态生成、文件路由、内容集合、图片优化 |
| 样式 | Tailwind CSS（`@tailwindcss/vite`） | ^4.3.3 | 工具类 + 设计令牌（`@theme inline`） |
| 交互 | React + `@astrojs/react` | ^19.3.0 / ^7.0.0 | 只用于 island |
| 图标 | `@lucide/astro` / `lucide-react` | ^1.48.0 | 静态 / island 各用一套 |
| 站点地图 | `@astrojs/sitemap` | ^3.7.4 | 构建时生成 |
| 图片 | sharp（astro:assets） | ^0.35.4 | 构建期裁切转 WebP |
| 测试 | Vitest / Playwright | ^5.0.2 / ^1.63.0 | 单测 / E2E |
| 运行时 | Node ≥ 22.12，pnpm 10 | — | 构建环境 |
| 托管 | nginx 静态容器 | 1.27-alpine | `Dockerfile` 多阶段 |

---

## 分层架构

```
┌───────────────────────────────────────────────────────────┐
│ 数据层   外部接口 ──(scripts/sync/sources)──▶ src/data/*.json │
│          手写内容 ─────────────────────────▶ src/content/**  │
├───────────────────────────────────────────────────────────┤
│ 模型层   src/content.config.ts（集合 + Zod schema，构建时校验）│
├───────────────────────────────────────────────────────────┤
│ 查询层   src/lib/<集合>.ts（排序、关联、派生数据、图片解析）    │
├───────────────────────────────────────────────────────────┤
│ 展示层   src/pages/**（路由）+ src/components/**（.astro 静态） │
├───────────────────────────────────────────────────────────┤
│ 交互层   src/components/islands/*.tsx（client:* 水合，最小化） │
├───────────────────────────────────────────────────────────┤
│ 生成层   robots.txt.ts / llms.txt.ts / sitemap（从同一数据源） │
├───────────────────────────────────────────────────────────┤
│ 校验层   astro check → astro build → check-seo → vitest        │
└───────────────────────────────────────────────────────────┘
```

**依赖方向只能向下**：页面调 `lib`，`lib` 调 `astro:content`；island 只吃 props，不反向调用集合；
生成型端点与页面共用同一套 `lib` 函数，保证 llms.txt、sitemap、页面三者看到的数据完全一致。

### 各层规则

| 层 | 必须 | 禁止 |
|----|------|------|
| 数据层 | 同步经 `scripts/sync/run.mjs`（失败保留旧数据、id 唯一、原子写） | 构建时现场请求外部接口（唯一例外：经 `tech-decision` 评估并写了决策记录的 CMS 自定义 loader，且接口失败时构建必须失败）；把凭据写进数据文件 |
| 模型层 | 每个集合有 schema；进 URL 的 id 用正则约束 | 用 `z.any()` 糊弄；schema 与数据长期不一致 |
| 查询层 | 排序、筛选、关联、派生展示数据都在这里 | 页面里散落 `getCollection` + 各自排序 |
| 展示层 | 页面经 `BaseLayout`；布局用 `Container` / `Section` | 页面里写 `<html>`、硬编码域名 / 颜色 |
| 交互层 | 只接收可序列化 props；按可见性选 `client:*` | island 里 `fetch` 构建期就能拿到的数据；整页 island |
| 生成层 | 从集合生成，内容随数据变化 | 在 `public/` 放手写的 llms.txt / robots.txt |

---

## 信息架构（IA）设计

### 页面类型与可收录性

| 页面类型 | URL 形态 | 进 sitemap | 说明 |
|---------|---------|-----------|------|
| 首页 | `/` | ✅ | 定义句 + 入口，不堆全部内容 |
| 列表页 | `/works/` | ✅ | 首屏由 island SSR 输出；完整收录靠下面三类页 |
| 详情页 | `/works/<id>/` | ✅ | SEO / GEO 主力，每条内容一个 URL |
| 分类落地页 | `/works/category/<id>/` | ✅ | 静态列出分类全部条目，承接长尾词 |
| 筛选视图 | `/works/?c=x&tag=y` | ❌ | 查询参数视图，canonical 仍指向 `/works/`（SEOHead 只取 pathname） |
| 文章 | `/posts/<id>/` | ✅ | 长文，GEO 引用主要来源 |
| 生成型端点 | `/robots.txt` `/llms.txt` | — | 端点带扩展名，不加结尾斜杠 |

### URL 设计规则

1. **层级 ≤ 3 段**：`/栏目/子类/条目/`，更深的层级改用面包屑表达
2. **全部带结尾斜杠**（`trailingSlash: 'always'`），站内链接用 `workPath()` / `categoryPath()` 生成
3. **URL 用稳定 id**：外部数据用平台 id（如视频 BV 号），不要用会变的标题；只允许 `[A-Za-z0-9_-]`
4. **栏目改名不改 URL**：`nav.label` 可随意改，路由目录一旦上线就不动（改了要做 301，见 `astro-routing`）
5. **分类有页，标签默认没有**：标签只做筛选参数；某个标签条目足够多、且能写出有信息量的导语时，再升级成落地页（避免大量薄内容页）

### 栏目规划模板

```
站点：<站名>
一级栏目（= nav）：首页 / <主体内容> / 文章 / 关于
主体内容：
  - 列表：/<栏目>/                 island：搜索 + 分类 + 标签 + 排序
  - 详情：/<栏目>/<id>/            JSON-LD：BreadcrumbList + <对应 schema.org 类型>
  - 分类：/<栏目>/category/<id>/   JSON-LD：BreadcrumbList + CollectionPage
文章：/posts/、/posts/<id>/        JSON-LD：Article
站点级：/robots.txt、/llms.txt、/sitemap-index.xml
```

**示例：视频归类站**（结构示意，数据以真实数据源为准）

| 需求 | 映射 |
|------|------|
| 视频本身 | 集合 `works`（或复制一份改名为 `videos`），id = BV 号，`metrics` 放时长 / 播放 |
| 平台上的「合集」 | 集合 `categories`，每个合集一个落地页 |
| 视频标签 | `tags` 字段，只做筛选 |
| 学习路线（有顺序的合集） | 分类自带的 `order` 只管**分类之间**的先后，表达不了集数。要「上一集 / 下一集」有两种做法：作品上加集数字段（如 `episode: z.number()`，查询层按分类 + 集数排序）；或新建 `series` 集合，用 `z.array(reference('works'))` 的数组顺序当集数（见 `writing-plans` 示例 1） |
| 数据来源 | `scripts/sync/sources/bilibili.mjs`（见 `data-sync`） |

---

## 决策：新集合 / 新字段 / 新分类

| 情况 | 选择 | 例子 |
|------|------|------|
| 内容有**自己的一组字段**和**独立 URL** | 新集合（走 `/collection`） | 在作品之外再加「工具推荐」 |
| 现有内容多一个属性 | 新字段（改 schema + 数据映射） | 作品加「难度」 |
| 现有内容多一种归类方式 | 新分类（改 `categories.json`） | 加「实战案例」分类 |
| 多种归类维度并存 | 一个维度用分类（有落地页），其余用标签 / 字段筛选 | 合集 = 分类，技术栈 = 标签 |
| 只是展示文案 | 不进集合，写在页面或 `site.config.ts` | 首页 slogan |

新增集合前先问：它需要详情页吗？需要被 AI 引用吗？不需要的话，一个 JSON 数据文件 + 直接 import 就够了（如 `faq.json`）。

---

## 决策：要不要 island

| 交互 | 方案 | 理由 |
|------|------|------|
| 链接跳转、折叠、下拉菜单 | 纯 HTML（`<a>` / `<details>`） | 零 JS |
| 主题切换、复制按钮这类单点小交互 | `.astro` 组件里的 `<script>` | 打包去重，每页只执行一次 |
| 搜索 + 筛选 + 排序等多状态联动 | React island | 状态多、需要重绘列表 |
| 首屏可见的 island | `client:load` | 用户马上会用 |
| 首屏下方的 island（评论区、图表） | `client:visible` | 滚到才加载 |
| 首屏可见但不急着交互的 island（推荐位、次要控件） | `client:idle` | 空闲时加载 |
| 需要读 `window` 且不需要 SEO 的 | `client:only="react"` | 跳过 SSR |

原则：**React 运行时只在挂了 island 的页面加载**（本框架里只有 `/works/`）。新 island 先问「不用 React 能不能做」。
详细写法见 `islands-interaction`。

---

## 决策：要不要服务端能力

本框架是 `output: 'static'`。出现下列需求时，先走 `tech-decision` 评估，不要直接改输出模式：

| 需求 | 优先方案 |
|------|---------|
| 数据要更新 | 定时 `pnpm sync` + 重新构建部署（静态站的正常形态） |
| 表单提交 | 第三方表单服务或独立的小后端接口 |
| 评论 | 第三方评论 island（`client:visible`） |
| 登录、个性化 | 超出内容站范畴，评估是否该用 next-ai-forge 一类全栈框架 |

---

## 组件放置规则

| 目录 | 放什么 | 例子 |
|------|-------|------|
| `components/ui/` | 与业务无关的通用组件 | Container、Button |
| `components/layout/` | 全站骨架部件 | SiteHeader |
| `components/seo/` | SEO 输出 | SEOHead |
| `components/<业务>/` | 某业务专用、静态渲染的组件 | `works/WorkCard.tsx` |
| `components/islands/` | **只放需要水合的组件** | `WorksExplorer.tsx` |

同一个组件既要静态渲染又要在 island 里复用 → 写成 `.tsx` 放业务目录，只吃算好的数据（参考 `WorkCard.tsx`）。

---

## 框架核心 vs 业务代码

`.claude/framework-config.json` 列出框架核心文件（SEO 组件、布局、令牌、校验脚本、同步运行器等）。规则按所在仓库区分（与 CLAUDE.md 一致）：

| 所在仓库 | 判定 | 规则 |
|---------|------|------|
| 框架仓库本身 | 没有 `.framework-sync.json`，且 `package.json` 的 name 为 `next-ai-astro` | 核心文件就是开发对象，正常 `feat/fix(scope)` 提交；改动会进入之后所有孵化的项目，必须保持示例站可运行、`pnpm verify` 全绿 |
| 孵化出的项目 | 有 `.framework-sync.json` | 新增业务页面 / 组件 / 集合 / 数据源自由；确需改核心文件（含**追加**一个导出、改一行）→ 单独一个提交，scope 固定写 `framework`（如 `feat(framework): seo.ts 新增 eventJsonLd`），记进 `.claude/PROJECT.md`「与框架的差异」，考虑是否回馈框架仓库；该提交不计业务进度 |

能不改核心就不改：新的结构化数据构造函数、查询函数放 `src/lib/<业务>.ts` 也完全可行。

---

## 重构策略

| 症状 | 重构方向 |
|------|---------|
| 页面 frontmatter 超过 ~60 行查询与计算 | 抽到 `src/lib/<集合>.ts` |
| 多个页面复制同一段 JSX | 抽组件到 `components/<业务>/` |
| island props 越来越大（整条数据都传） | 服务端先裁剪成卡片数据（参考 `toCardData`） |
| 多处各写排序 / 过滤 | 收敛到查询层一个函数 |
| 颜色、间距在各处硬编码 | 收敛到令牌（`design-system`） |

重构步骤：先跑 `pnpm verify` 记录基线 → 小步改 → 每步 `pnpm build` → 最后 `pnpm verify` 全绿再提交（`refactor(scope): …`，不计入业务进度；重构顺带修了 bug 就把修复单独提交为 `fix(scope)`）。

---

## 架构设计文档模板

写到 `docs/架构设计.md`（或需求文档的「技术方案」一节）：

```markdown
## 1. 目标与约束
## 2. 信息架构（栏目、URL 表、页面类型、可收录性）
## 3. 数据模型（集合、字段、id 规则、数据来源与同步频率）
## 4. 页面清单（每页：URL / 数据 / island / JSON-LD 类型）
## 5. 交互（哪些 island、client 指令、状态是否进 URL）
## 6. SEO / GEO（title 模板、描述策略、结构化数据、llms.txt 覆盖范围）
## 7. 部署（托管方式、域名、构建触发方式）
## 8. 风险与待确认
```

## 架构检查清单

- [ ] 每类主体内容都有详情页 URL，且 id 稳定
- [ ] 分类有落地页并写了定义句导语；标签没有生成薄内容页
- [ ] 查询集中在 `src/lib/`，页面没有各自排序
- [ ] island 只出现在确有状态的区域，指令按可见性选择
- [ ] llms.txt / sitemap / 页面共用同一套查询函数
- [ ] 数据更新路径明确（手工 / `pnpm sync` / 定时任务）
- [ ] 孵化项目里没有改动框架核心文件，或已单独提交（scope `framework`）并记进 PROJECT.md

## 与相邻技能的边界

| 需求 | 技能 |
|------|------|
| 具体技术方案对比 | `tech-decision` |
| 路由、动态页、分页、重定向 | `astro-routing` |
| 集合与 schema | `content-collections` |
| island 写法 | `islands-interaction` |
| 文件在哪 | `project-navigator` |
