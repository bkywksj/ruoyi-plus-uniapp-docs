---
name: code-patterns
description: 编码规范与禁令速查：Astro 7 写法、SEO/数据禁令、语义令牌、命名、首行注释、导入顺序、提交类型与进度口径，写前查、写完自检。触发词：规范、禁止、命名、写法、代码风格、首行注释、提交规范、Git提交、导入顺序、不允许
---

# 代码规范速查（code-patterns）

## 何时使用

- 查看项目禁止事项
- 命名规范、文件命名、函数命名速查
- 首行注释、导入顺序、注释写法
- Git 提交信息怎么写、哪些提交计入进度
- 代码风格检查、自检

其他常见说法：不能用、写法对不对。
组件具体用法看 `ui-components`；集合 schema 看 `content-collections`；Astro 7 API 差异以 CLAUDE.md「版本红线」为准。

## 🚫 禁令速查表

### Astro 7 写法（训练数据里的旧写法已失效）

| 禁止 | 正确 |
|------|------|
| `src/content/config.ts` | `src/content.config.ts` |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` |
| `z.string().url()` / `z.string().email()` | `z.url({ protocol: /^https?$/ })` / `z.email()`（Zod 4 顶层函数）。🔴 不要写裸 `z.url()`：它放行 `javascript:` / `data:`，字段一进 `<a href>` 就是存储型 XSS（`tests/unit/works-schema.test.ts` 有真实 schema 的回归用例，`content-schema.test.ts` 有裸 `z.url()` 的对照） |
| 集合写 `type: 'content'` | `loader: glob({ pattern, base })` / `loader: file(path)` |
| `entry.slug` / `entry.render()` | `entry.id` / `render(entry)` |
| `Astro.glob()` | `import.meta.glob(..., { eager: true })` |
| `<ViewTransitions />` | `<ClientRouter />`（本框架默认不用，走 CSS 跨文档过渡） |
| 客户端 / island 里调 `getImage()` | 服务端算好当 props 传 |
| 未闭合标签、非法嵌套 HTML | Astro 7 Rust 编译器直接报错，写规范 HTML |
| 业务文件命名 `src/fetch.ts` | 保留文件名，换名字 |

### SEO / 数据

| 禁止 | 正确 |
|------|------|
| canonical / og:url 写死或页面里再写一份 | 只由 `SEOHead` 输出 |
| 多页共用 description | 每页单独写，列表页带数量 / 分类名 |
| `set:html={JSON.stringify(x)}` 输出 JSON-LD | `serializeJsonLd(x)` 或经 `BaseLayout` 的 `jsonLd` |
| 站内链接缺结尾斜杠 `/works/a` | `/works/a/`，用 `workPath()` / `categoryPath()` |
| 页面里 `getCollection` 后各自排序 | 调 `src/lib/<集合>.ts` |
| 接口失败写入空数组 | 走 `scripts/sync/run.mjs` |
| 编造播放量、案例、数字 | 只用真实数据；不确定标「待确认」 |

### 样式 / 组件

| 禁止 | 正确 |
|------|------|
| `text-gray-500`、`bg-white`、`#ff5d2e` | `text-muted`、`bg-canvas` / `bg-elevated`、`bg-brand` |
| `text-brand` 做正文链接 | `text-brand-ink` |
| 主按钮 `bg-brand text-white` | `<Button>`（内部是 `bg-brand-strong`） |
| 页面自写 `max-w-6xl mx-auto px-4` | `<Container>` |
| 中文标题 `text-balance` | `text-pretty` |
| 引入中文 webfont | 系统字体栈 `font-sans` |
| 整页做成 React 组件 | `.astro` 页面 + 局部 island |
| 复制粘贴 SVG 图标 / 装其他图标库 | `@lucide/astro`（静态）/ `lucide-react`（island） |
| `<img>` 缺 `alt` / `width` / `height` | 三者必填；装饰图 `alt=""` |
| 一页里多张图 `fetchpriority="high"` | 每页只给最重要的一张（`WorkCard` 的 `priority`）；首屏其余几张只用 `eager` 取消懒加载 |

### Shell（hook 兜底，但别依赖 hook）

`> nul`、`TZ=Asia/Shanghai date`、内联长脚本 heredoc、`/tmp/` 中转、PowerShell 里给 `pnpm/node` 加 `2>&1`、
不限定目录的 `grep -r`、`git add -A` / `git add .`、`git stash`、`git reset --hard`、`git clean -f`、
本地 `git push/fetch/pull/clone/ls-remote`（远程操作走 Sigil）、`git credential fill`、按名字杀 node / pwsh 进程。
正确写法见 `CLAUDE.md`「Bash/Shell 禁止项」。地址一律写 `localhost`（不写 `127.0.0.1`，本机 localhost 解析到 IPv6）。

---

## 📝 命名规范

### 文件

| 类型 | 规则 | 例子 |
|------|------|------|
| Astro 组件 | PascalCase `.astro` | `SiteHeader.astro`、`Breadcrumbs.astro` |
| React 组件 / island | PascalCase `.tsx` | `WorkCard.tsx`、`WorksExplorer.tsx` |
| 页面 | kebab-case；动态段 `[id]`、剩余段 `[...id]` | `about.astro`、`works/[id].astro`、`posts/[...id].astro` |
| 生成型端点 | `<输出文件名>.ts` | `robots.txt.ts`、`llms.txt.ts` |
| 工具 / 查询 | camelCase 或单词 `.ts`，按集合命名 | `lib/works.ts`、`lib/seo.ts` |
| 数据文件 | 复数小写 `.json` | `data/works.json`、`data/categories.json` |
| 文章 | kebab-case `.md`（文件名即 URL 段） | `seo-geo-checklist.md` |
| 同步源 | 数据源名 `.mjs`；`_` 开头的文件被运行器忽略 | `sources/bilibili.mjs` |
| 脚本 | kebab-case `.mjs` | `check-seo.mjs` |

### 代码

| 类型 | 规则 | 例子 |
|------|------|------|
| 集合名 | 复数小写 | `works`、`categories`、`posts` |
| 取集合 | `getXxx` | `getWorks()`、`getCategories()` |
| 生成路径 | `xxxPath(id)`，返回带结尾斜杠的站内路径 | `workPath()`、`categoryPath()` |
| 结构化数据 | `xxxJsonLd()` | `breadcrumbJsonLd()`、`faqJsonLd()` |
| 数据转换 | `toXxx` | `toCardData()`、`toCardList()` |
| 格式化 | `formatXxx` | `formatDate()`、`formatCount()` |
| 传给组件的序列化数据类型 | `XxxData` | `WorkCardData` |
| Props 接口 | `Props`（.astro）/ `XxxProps`（.tsx） | `interface WorkCardProps` |
| 常量 | UPPER_SNAKE | `AI_CRAWLERS`、`MAX_WORKS` |
| 自定义 CSS 类 | kebab-case，语义化 | `prose-content`、`vt-card`、`vt-cover` |
| 集合 id | `[A-Za-z0-9_-]`（进 URL，schema 已校验） | `sample-01`、`BV1Demo0Test` |

---

## 首行注释

| 文件 | 写法 |
|------|------|
| `.ts` `.tsx` `.mjs` `.cjs` | 第一行 `// 中文描述` |
| `.astro` | frontmatter 第一行 `// 中文描述`（纯展示小组件可省） |
| `.css` | 顶部 `/* 中文描述 */` |

```astro
---
// 分类落地页：每个分类一个可收录 URL，完整列出该分类全部作品（纯静态、零 JS）
import BaseLayout from '@/layouts/BaseLayout.astro';
---
```

首行注释写「这是什么 + 关键取舍」，不是复述文件名。

### 注释写「为什么」

```ts
// ✅ 说明原因
// Astro 7 默认 'jsx' 会删掉行内元素之间的空格（中英混排时英文单词会粘在一起），显式恢复 HTML 感知压缩
compressHTML: true,

// ❌ 复述代码
// 设置 compressHTML 为 true
compressHTML: true,
```

导出函数用 JSDoc 写：用途、参数、返回、边界（参考 `src/lib/images.ts` 的 `resolveCover`）。
🔴 注释里不写提交溯源（「来自 commit xxx」）。

---

## 导入顺序

按组排列，组间不空行也可以，但组的先后固定：

```ts
// 1. Astro 类型与虚拟模块（页面里只用 render 这类渲染 API；getCollection 只出现在 src/lib/<集合>.ts）
import type { GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { render } from 'astro:content';
// 2. 第三方包
import { ArrowRight } from '@lucide/astro';
// 3. 布局 → 组件
import BaseLayout from '@/layouts/BaseLayout.astro';
import Container from '@/components/ui/Container.astro';
import { WorkCard } from '@/components/works/WorkCard';
// 4. lib 与站点配置
import { absoluteUrl, breadcrumbJsonLd, type Crumb } from '@/lib/seo';
import { site } from '@/site.config';
// 5. 数据文件
import faq from '@/data/faq.json';
```

- 一律用 `@/` 别名，不写 `../../`
- 仅类型的导入用 `import type` 或行内 `type` 修饰

---

## 组件写法约定

### `.astro`

```astro
---
// 组件说明
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
  size?: 'narrow' | 'default';
}

// class 透传：解构成 className，再用 class:list 合并
const { size = 'default', class: className, ...rest } = Astro.props;
---

<div class:list={['mx-auto w-full', size === 'narrow' ? 'max-w-3xl' : 'max-w-6xl', className]} {...rest}>
  <slot />
</div>
```

- frontmatter 顺序：导入 → `Props` → 解构 props → 取数 → 派生值
- 条件类名用 `class:list`，不拼字符串
- 动态路由用 `getStaticPaths = (async () => {...}) satisfies GetStaticPaths` + `InferGetStaticPropsType`

### `.tsx`

- 函数组件；island 用 `export default`，两用组件同时命名导出 + 默认导出（参考 `WorkCard.tsx`）
- 挂了 `client:*` 的组件，props 必须能被 Astro 序列化：普通对象、数组、字符串、数字、`Date`、`Map`、`Set`、`URL` 等都支持，**函数不支持**（行为写在组件内部）
- 框架约定：日期、数字在服务端用 `src/lib/format.ts` 格式化成字符串再传（参考 `WorkCardData.date`），避免服务端与浏览器时区不同导致水合不一致；只传渲染需要的字段，不整条传集合 entry
- 不在组件里取数；需要的数据由页面在服务端准备好

### TypeScript

- `strict` 模式（`astro/tsconfigs/strict`），不写 `any`；外部数据先 `unknown` 再收窄
- 集合条目类型用 `CollectionEntry<'works'>`，不要手写一份
- 日期在集合里是 `Date`（`z.coerce.date()`），展示时再 `formatDate()`

---

## ✅ 避免过度工程

| 别做 | 理由 |
|------|------|
| 为一个页面建通用「页面生成器」 | 文件路由本身就是生成器 |
| 给几百条数据上搜索服务 | `src/lib/search.ts` 足够（见 `site-search`） |
| 引入状态管理库只为一个 island | `useState` 足够；跨 island 才考虑 nanostores |
| 抽象只用一次的组件 | 第二次复用时再抽 |
| 为「以后可能」加配置项 | 需要时再加进 `site.config.ts` |

---

## 📦 Git 提交规范

格式：`<type>(<scope>): <中文一句话>`，正文可选列要点。

口径与 CLAUDE.md「🔴 协作约定」一致：

| type | 用途 | 计入业务进度 |
|------|------|:-----------:|
| `feat(scope)` | 新功能、新页面、新集合 | ✅（scope 为 `framework` / `strip` / `data` / `deps` 时除外） |
| `fix(scope)` | 修 bug | ✅（同上） |
| `refactor` / `perf` | 重构 / 性能优化 | ❌ |
| `style` / `test` / `docs` / `chore` / `ci` / `build` | 格式、测试、文档、杂项、CI、构建 | ❌ |

固定 scope 的几类提交：

| 场景 | 写法 |
|------|------|
| 孵化项目里改框架核心文件（含追加导出） | 单独一个提交：`feat(framework): …` / `fix(framework): …` |
| 数据同步产生的数据变更 | `chore(data): …` |
| 裁剪模块 | `refactor(strip): …` |
| 依赖变更 | `chore(deps): …` |
| 任务台账、三文档更新 | `docs(tasks): …` |

其余 scope 用业务或模块名：`works`、`posts`、`seo`、`sync`、`ui`、`deploy`、`base`。在**框架仓库本身**改核心文件就是框架演进，按模块名正常写 `feat/fix(scope)`。

```
feat(works): 作品详情页增加上一集 / 下一集导航

- lib/works.ts 新增 adjacentWorks()
- 详情页底部渲染前后两条，按作品的 episode 字段排序
```

规则：
- 一个任务一个提交，message 用台账里该任务的 `提交:` 字段；`/progress`、`/update-status`、`/next` 只数上表打 ✅ 的提交，交付功能写成 refactor / chore 会漏统计
- 逐个 `git add <具体文件>`，禁止 `git add -A` / `git add .`
- 提交前 `pnpm verify` 全绿
- 功能改动与注释 / 格式改动分开提交
- 推送只走 Sigil（见 `git-workflow`）

## 自检清单

- [ ] 没有使用「Astro 7 写法」表里的旧写法
- [ ] 颜色全部是语义令牌；链接用 `text-brand-ink`
- [ ] 新文件有首行注释；新导出函数有 JSDoc
- [ ] 导入用 `@/` 别名且按组排列
- [ ] 页面经 `BaseLayout`，title / description 与其他页不重复
- [ ] 图片有 alt / width / height
- [ ] commit message 符合 `type(scope): …`

## 相关技能

`ui-components`（组件）、`content-collections`（集合）、`astro-routing`（路由）、`seo-meta`（SEO 字段）、`git-workflow`（提交与推送）
