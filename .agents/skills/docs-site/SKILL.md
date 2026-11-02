---
name: docs-site
description: docs 模块（迁移型文档站骨架）：.md 原样迁入、DocsLayout 三栏、营销页、docs.json 配置、brand.css、站点地图分档、llms.txt、上线与 IndexNow。触发词：docs 模块、文档站骨架、DocsLayout、docs.json、面包屑、侧栏吸顶、brand.css、站点地图分档、IndexNow、llms.txt、营销页、文档站上线
---

# docs 模块（迁移型文档站骨架）

## 何时使用

- 大型文档站（几十到几百篇）或从 VitePress 迁来的站：正文保持 `.md`，一个字不改
- 改文档页版式（三栏、面包屑、侧栏、目录、上下篇、最后更新）、营销页版式
- 配栏目、侧栏、结构化数据、站点地图分档、llms.txt、IndexNow
- 换品牌配色、首屏底、决定要不要渐变
- 文档站上线、通知搜索引擎

与 guides 模块（guides-docs 技能）的分工：

| | guides | docs |
|---|---|---|
| 正文 | MDX，可嵌 Steps / Callout 等文档组件 | Markdown，旧站原样迁入（VitePress 写法由 `markdownCompat: 'vitepress'` 还原） |
| 规模 | 十几篇的帮助中心 | 几十到几百篇；ruoyi.plus 511 页 |
| 网址 | `/guide/x/` | 页面 id 即路径，按 `site.urlFormat`（迁移旧站用 `file` / `preserve`） |
| 侧栏 | 分组 + `guide-sidebar.json` | `src/data/sidebar.json`：全站一棵或每栏目一棵 |
| 共用 | 侧栏树 `SidebarTree` + `lib/sidebar.ts`、站内搜索（module-strip 的共享部分「文档基础设施」，两个模块都裁掉才删） | ← |

在用的站：ruoyi.plus（511 页、每栏目一棵、preserve）、officia / 知识库 / tauri-docs（全站一棵、file）。
四站的模块文件逐字节相同，站点差异全在下面「项目配置」那几份里。

## 文件分工

| 类 | 文件 | 框架同步时 |
|---|---|---|
| 模块（各站逐字节相同） | `DocsLayout` / `LandingLayout`、`[...slug].astro`、`sitemap.xml.ts`、`components/docs/` 的 ContactDialog / DocsPhonePreview / DocsToc / ImageViewer、`lib/docs.ts` / `docs-config.ts` / `docs-schema.ts` / `docs-sitemap.ts` / `lastmod.ts` / `sitemap-rank.ts` / `preview.mjs`、`lib/markdown/` 的 docs-layout / docs-plugins / img-size / vue-components、`styles/docs-theme.css` / `docs-content.css` / `landing.css`、`scripts/` 的 build-llms / indexnow / check-anchors / build-icons / `lib/site-meta.mjs` / `migrate/*` | 直接合并（清单在 `.claude/framework-config.json` 的 `docsModule`） |
| 项目配置（各站自己的） | `src/data/docs.json`、`sidebar.json`、`landing.json`、`outdated.json`、`page-dates.json`、`title-qualifiers.json`、`llms-facts.md`、`llms-tail.md`、`src/lib/site-jsonld.ts`、`src/styles/brand.css`、`scripts/migrate/known-diffs.json` | 不覆盖 |
| 项目页面 | 首页 `index.astro`、`404.astro`、下载页 / 功能栏目页等独立页、`SectionHero.astro`（栏目首页大图）、`preview.astro`（手机外框预览页） | 不覆盖 |

🔴 **改模块文件 = 改框架**：在派生站里发现模块的 bug，修在框架里再同步下去；派生站里就地改了的，单独一个 `fix(framework)` 提交并回流框架。
不然下次同步又是四站各一份（这正是收进框架之前的状态：改一次文档页版式要手改五遍）。

## docs.json

字段说明在 `src/lib/docs-config.ts`。用 JSON 不用 TS：`scripts/` 下的 Node 脚本也要读它。

| 字段 | 作用 | 例 |
|---|---|---|
| `sections` | 栏目（页面 id 第一段）：`label` 面包屑 / 404 用；`home` 栏目名点过去的地方（文档 id = 那一篇；`/features` = 独立栏目页；省略 = `x/index`） | 知识库 `guide` → `guide/getting-started`、`features` → `/features` |
| `standalonePages` | 由独立 `.astro` 页渲染的文档 id（正文仍在集合里，页面 `getEntry` 嵌进去），统一路由跳过 | 知识库 `download` |
| `lastUpdated` | `required` 每篇必填、页底显示 / `optional` / `off`（ruoyi.plus） | |
| `sitemapLastmod` | `strict` 缺一个日期构建失败（独立页登记 `page-dates.json`）/ `known` / `off` | |
| `article` | 每页 TechArticle 的 `about` / `author` / `publisher` / `proficiencyLevel`（照旧站 transformPageData） | |
| `editUrl` | 「在 GitHub 上编辑此页面」模板，`{id}` 换页面 id；空 = 不显示 | ruoyi.plus |
| `faqPage` | 这一页加 FAQPage（问答在 `site-jsonld.ts` 的 `faqJsonLd`，必须与页面可见内容一致） | 知识库 `faq` |
| `sectionHero` | 栏目首页正文上方加大图（项目提供 `components/docs/SectionHero.astro`） | ruoyi.plus |
| `previewHosts` | H5 演示站域名：正文链接改指本站手机外框预览页 | ruoyi.plus `uni.ruoyi.plus` |
| `sitemap` | 分档规则：按顺序、第一条命中；`paths` 整条相等、`prefixes` 前缀；`fallback` 兜底 | 照旧站 `.vitepress/seo/sitemap.mjs` |
| `indexnow` | `key`（对应 `public/<key>.txt`）、`alwaysPush`（每次都推的路径） | |
| `llms` | `extraPages`（侧栏外的页 / 纯文字行）、`extraHeading`（空字符串 = 不出小标题）、`sectionTitles`（每栏目一棵时各节标题）、`groups`（`top` 子分组并进顶层分组 / `nested` 子分组各成一节） | tauri-docs `top`、ruoyi.plus `nested` |

## 文档页版式（五站统一方案，2026-11-02 定）

| 规则 | 写法 | 为什么 |
|---|---|---|
| 面包屑在正文标题上方一行小字，「栏目 › 分组 › 当前页」 | DocsLayout 里 `nav[aria-label="所在位置"]` | 原来页头下方整条横带，一滚动就被卷走，还把侧栏往下推 |
| 分组名与栏目名相同时不重复 | 「入门 › 快速开始」而不是「入门 › 入门 › 快速开始」 | |
| 侧栏与右侧目录：**吸顶位置 = 起始位置** | `sticky top-[calc(4rem+1px+2.5rem)]`（页头 4rem + 底线 1px + 内容区上内边距 2.5rem） | 起始比吸顶低时，一滚动侧栏先跟着上移一段才停 |
| 侧栏里滚到底不带整页 | `overscroll-contain` | aibid 文档站上实测：右侧滚动连累左侧 |
| 细滚动条，平时透明、悬停才显示 | `docs-content.css` 的 `.ry-sidebar` | Windows 默认粗滚动条在侧栏与正文之间像多了一根灰线 |
| 窄屏侧栏收进「本栏目菜单」 | `<details>` | |

🔴 改了这几项的数值（页头高度、内容区内边距），三处 `calc` 一起改，并跑 `tests/e2e/docs.spec.ts` 的「滚动时侧栏不跟着动」——
它做过反证：改回 `top-20` 读数出现两种、测试变红。

## 品牌与视觉（brand.css）

`docs-theme.css` 只放结构与中性默认值；每个站在 `src/styles/brand.css`（布局最后引入）覆盖：

```css
:root:not(.dark) { --canvas: #f8f7fb; --surface: #f1eff5; --ink: #120f1f; --muted: #5e5a6e; --line: rgb(18 15 31 / 0.08); --brand-ink: #6e31b6; }
:root { --ry-cyan: #0d9e96; --ry-code-bg: #14111f; --ry-aurora-bg: #f3f0fa; --shadow-tint: 18 15 31; }
```

- 品牌色本身在 `site.brandColor`（注入 `--brand`）；中性色带一点主色色相，整页色温统一（工作站 `brand_palette.js` 输出）
- 🔴 **框架默认不用渐变**（用户 2026-11-02：「渐变太 AI 味」——渐变字、光晕、渐变按钮）。要渐变的站（officia / tauri-docs / ruoyi.plus 现状）
  在 brand.css 里给对应选择器加回（`.ry-grad-text`、`.ry-aurora`、`.lp-hero::after`、`.ry-btn-primary` / `.btn-brand`、`.ry-fab`……），不改模块样式
- 类名前缀 `ry-` 是骨架从 ruoyi.plus 改版站来时留下的，各站页面都在用，不改名
- 🔴 **模块样式在 CSS 层里，brand.css 与页面样式不进层**：`vp-compat.css`、`docs-theme` / `docs-content` / `landing.css` 同在 `docs` 层（层顺序 `theme, base, components, utilities, docs`）。
  不进层的样式永远压过层里的，不看加载顺序——拆包后 brand.css 进了公共样式文件、先加载，营销页样式进页面文件、后加载，不分层时品牌覆盖被盖掉（officia 同步时产品矩阵页首屏光晕全没了，实测）。
  vp-compat 与模块样式必须**同一层**：分两层时模块那层整体压过 vp-compat，原来靠选择器优先级决出的胜负会翻（ruoyi.plus 代码行号颜色变了，实测）。
  副作用要知道：brand.css 里的规则会压过模块里**任何**同属性规则、不看优先级——如 `.ry-aurora { border-bottom: 0 }` 会连同时带 `ry-card` 的元素的底边框一起去掉，这种组合要在 brand.css 里单独写回来。
  brand.css 里照常写选择器即可，不用 `!important`；**别把 brand.css 包进任何层**
- 品牌色太浅、白字对比不够时，在 brand.css 覆盖 `.btn-brand` / `.ry-btn-primary`；小字用 `--brand-ink`（白底 ≥ 4.5:1）
- 代码窗两种主题下都是深色（`--ry-code-bg` + shiki 的 `--shiki-dark`）；`site.codeLineNumbers: false` 时左边留 18px（行号关着时贴边是知识库的旧 bug）

页头页脚是框架核心（`SiteHeader` / `SiteFooter`）：文档站设 `site.frameWidth: 'wide'`（90rem，与三栏版心对齐）、`navBreakpoint: 'lg'`（1280 才横排）、
`headerCta`（主按钮）、`footerGroups` / `footerNote` / `copyrightName` / `contact`（`contact.label` = 抽屉里联系按钮的字，卖授权的站写「咨询购买」）。

## 营销页（LandingLayout）

`src/data/landing.json` 登记的文档换 LandingLayout：正文仍是 `.md`，`docs-layout.mjs` 的 `rehypeLanding` 把开头 h1 + 导语包成首屏、
按 h2 / h3 分组，`landing.css` 排版。首屏装饰（标签行、产品图标带）写在 landing.json 的 `kicker` / `extra`，标 `data-migrate-ignore`（比对不看）。
营销页里的旧站 Vue 组件（AProductCard / APricingCard / ImagePreview / DownloadSection）由 `vue-components.mjs` 转静态 HTML。

## 最后更新、站点地图、llms.txt

- **最后更新**：frontmatter `lastUpdated: 2026-11-02`（固定这个写法：`lib/lastmod.ts` 直接读这一行给 sitemap 用）。
  🔴 改了读者看得到的内容就改它，只改排版不算；不从 git 取（迁移换了路径，git 里每页都是迁移那天新加的）。
  独立页面（`src/pages/*.astro`）的日期登记在 `src/data/page-dates.json`
- **站点地图**：`withDocsSitemap` 包在框架配置外：过期页（`outdated.json`）与预览页不进；补 lastmod 与分档。
  🔴 分档必须拿补过 `.html` 的最终地址去匹配（旧站就栽在「地址形态和规则不一致，全落兜底档」上）；
  strict 的缺日期检查在加载配置时做——`@astrojs/sitemap` 会吞掉 serialize 里抛的错，只打一行 ERROR、构建照样成功、整份 sitemap 没生成
- **旧站点地图地址** `/sitemap.xml`：`sitemap.xml.ts` 输出指向 `sitemap-0.xml` 的索引，站长平台登记的旧地址继续有效
- **llms.txt**：`pnpm llms` 由 `llms-facts.md`（人工核对过的产品事实）+ 侧栏页面索引 + `extraPages` + `llms-tail.md` 拼成；
  `pnpm llms --check` 校验仓库里那份是最新。🔴 与框架的 `src/pages/llms.txt.ts` 端点二选一（都出 `/llms.txt`），脚本发现端点在会拒绝运行

## 上线（推送即构建 / 本机构建上传）

| 方式 | 站点 | 做法 |
|---|---|---|
| 推送即构建 | 知识库、officia、tauri-docs、aibid-docs | EdgeOne Pages 连 Git，推到主分支约 1.5–2 分钟生效；构建预设要是 Astro（从 VitePress 切过来时用户在 EdgeOne 后台改） |
| 本机构建上传 | ruoyi.plus | 云端构建机 4 核 6 GB，500 页构建被杀（exit 137，三次实测）→ `pnpm verify` 后 `pnpm run deploy`（不是 `pnpm deploy`：那是 pnpm 内置命令） |

上线后核对：

```bash
curl -sI https://<域名>/ | grep -i last-modified     # 时间在推送之后 = 已是新构建
# 改动面大（侧栏、网址、插件）时：旧站清单 + sitemap 全部网址逐条请求，非 200 应为 0
pnpm indexnow --dry --since <上次上线的提交>          # 先看要推哪些
pnpm indexnow --since <上次上线的提交>                # 推送这次上线包含的全部提交里变更的文档
```

- `<上次上线的提交>` 取 Sigil `git_push` 返回的 summary 左边那个（`4637ce6..65be2de` 取 `4637ce6`）
- 🔴 不带参数的 `pnpm indexnow` 只看最近一次提交：一次上线常有多个提交，最后一个只改样式时推 0 条
- 脚本推送前检查 `public/<key>.txt` 在不在、内容是不是密钥本身（对不上会被拒收）；域名读 `site.config.ts`，不在脚本里写死

## 外部依赖本站的文件

别的仓库会读 / 写文档站里的文件，挪路径前先查。写进各站 `.claude/PROJECT.md` 的「外部依赖」一节。

| 文件 | 谁在用 |
|---|---|
| `public/.last-release.json`、`.last-release-mobile.json` | knowledge_base 应用的发版技能改它们来触发文档站重建（VitePress 时代在 `docs/public/`，2026-11-03 迁 Astro 后挪了，发版技能同步改过） |
| `src/data/releases.json` 等同步数据 | 构建前 `scripts/sync` 从 R2 拉（data-sync 技能） |

## 常见坑

| 现象 | 原因 | 处理 |
|---|---|---|
| 孵化 / 复制骨架后 IndexNow 推的是别的站 | 脚本里写死的域名与密钥被原样带来（知识库实录） | 模块已改为读配置；孵化后跑 `node scripts/check-residue.mjs <来源站>` |
| 构建报 `ENOENT …dist/.prerender/data/docs.json` | 被组件引用的 `.mjs` 用 `import.meta.url` 找数据文件，打包后指向 dist | 按 `process.cwd()` 读（`preview.mjs` 的写法） |
| `astro.config` 引用的模块里 `@/` 别名解析失败 | 配置加载阶段不一定认 tsconfig 别名 | 配置链上的模块（docs-sitemap / sitemap-rank / docs-config）用相对路径导入 |
| 文档页代码块是浅色、深色模式不变 | 没出 `--shiki-dark`（shikiConfig 单主题） | 框架 astro.config 已出双主题，别改回单主题 |
| 下载页两个 h1 | 独立页自己有 h1，又把正文（带 `# 标题`）嵌进来 | 删正文里的 h1 |
| `getStaticPaths` 里引用不到常量 | 它在独立作用域执行 | 只用 import 进来的值（`docsConfig.standalonePages`） |
| 页面上「最后更新」与 sitemap 日期不一致 | 改了内容没改 `lastUpdated` | 改内容同时改日期；独立页改 `page-dates.json` |
| 侧栏滚动时先跟着动一段 | 吸顶位置与起始位置不等 | 见「文档页版式」 |

## 相关技能

| 技能 | 关系 |
|---|---|
| `vitepress-migration` | 从 VitePress 迁过来的完整流程（盘点、定网址、转换、逐页比对、切换上线） |
| `guides-docs` | 小型帮助中心（MDX）；共用侧栏树与搜索 |
| `module-strip` | 不要 docs 模块时 `module-strip docs`；共享部分两个模块都裁才删 |
| `project-init` | 从兄弟站孵化时的必改清单与残留扫描 |
| `seo-meta` | 标题后缀、keywords、TechArticle、站点地图 |
| `deployment-guide` | EdgeOne 两种上线方式 |
| `data-sync` | 下载页的版本数据（构建期从 R2 拉） |
| `framework-sync` | 模块文件按核心对待，项目配置不覆盖 |
