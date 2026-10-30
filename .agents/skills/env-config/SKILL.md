---
name: env-config
description: 配置分工与环境变量：site.config.ts 放公开站点常量、.env 放凭据、astro.config.ts 管构建；PUBLIC_ 前缀、astro:env、配置文件读不到 .env、多环境与预发布。触发词：环境变量、.env、import.meta.env、PUBLIC_、多环境、site.config、域名配置、站点配置、astro:env、staging、预发布
---

# 配置与环境变量（env-config）

## 何时使用

- 改站名、域名、品牌色、导航、统计、备案号、远程图片域名
- 新增外部接口凭据（数据同步用的 UID、token）
- 页面或 island 里读不到环境变量
- 需要预发布（staging）环境、按环境切换配置
- 不确定某个值该放 `site.config.ts` 还是 `.env`

## 概述：三处配置各管一件事

| 文件 | 放什么 | 入库 | 谁读 |
|------|-------|------|------|
| `src/site.config.ts` | **公开的站点常量**：站名、域名、定位句、品牌色、导航、社交、备案号、统计 id、远程图片域名 | ✅ | 页面、组件、`lib`、`astro.config.ts` |
| `.env` | **凭据与本机值**：数据同步用的 token、UID 等 | ❌（`.gitignore` 已忽略 `.env` 与 `.env.*`） | `scripts/sync/context.mjs`、构建期服务端代码 |
| `.env.example` | `.env` 的模板：只有变量名和说明 | ✅ | 人 |
| `astro.config.ts` | 构建行为：`site`、`trailingSlash`、`compressHTML`、集成、`image.domains` | ✅ | Astro |

判断口诀：**会出现在网页源码里的 → `site.config.ts`；泄露了会出事的 → `.env`；改变构建方式的 → `astro.config.ts`。**

---

## `site.config.ts` 字段说明

| 字段 | 影响范围 | 注意 |
|------|---------|------|
| `name` / `shortName` | `<title>` 后缀、og:site_name、页头、页脚、llms.txt 标题 | |
| `tagline` | 首页 H1 下方、llms.txt 引用块 | 写成「X 是 Y」定义句 |
| `description` | 默认 meta description、页脚简介、llms.txt | 70~160 字 |
| `url` | canonical、og:url、sitemap、robots 的 Sitemap 行、llms.txt 全部链接、`astro.config.ts` 的 `site` | 🔴 不带结尾斜杠；上线前必须改掉 `example.com`（`pnpm check:seo` 会警告） |
| `locale` | `<html lang>`、og:locale | |
| `brandColor` | 注入 `<html style="--brand:...">`，派生 `brand-strong` / `brand-ink` | 只写 hex |
| `author` | JSON-LD 的 author / publisher、页脚版权 | |
| `ogImage` | 默认分享图（`public/` 下路径） | 1200×630 |
| `imageDomains` | `astro.config.ts` 的 `image.domains`、`isOptimizableRemote()` | 只写主机名，精确匹配，子域名要逐个列 |
| `analytics` | `Analytics.astro`：`provider` none / umami / baidu，`id`，`src`（umami 脚本地址） | 只在生产构建输出 |
| `nav` | 页头、页脚导航 | `href` 带结尾斜杠 |
| `social` | 页脚、关于页 | |
| `icp` | 页脚备案号 | 空则不显示 |

改完跑 `pnpm build && pnpm check:seo`：canonical、robots、llms.txt 会自动跟随新值。

---

## 环境变量

### 在 Astro 代码里读

Astro 基于 Vite：`import.meta.env.XXX` 在**构建时被静态替换**。

| 变量 | 服务端（frontmatter、端点、lib） | 客户端（island、`<script>`） |
|------|------------------|---------------|
| `SECRET_TOKEN` | ✅ | ❌ 读不到（`undefined`） |
| `PUBLIC_XXX` | ✅ | ✅ 会被打进浏览器 bundle |

- 🔴 `PUBLIC_` 前缀的值**任何人都能在网页源码里看到**，不能放 token
- 本框架是静态输出，服务端代码只在构建时运行；凭据只在构建机上用，不会进产物——前提是没有在客户端代码里引用
- 改了 `.env` 需要重启 `pnpm dev`

### 类型安全：`astro:env`（页面确实需要环境变量时）

```ts
// astro.config.ts
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  env: {
    schema: {
      PUBLIC_UMAMI_WEBSITE_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      CONTENT_API_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
```

```astro
---
import { PUBLIC_UMAMI_WEBSITE_ID } from 'astro:env/client';
import { CONTENT_API_TOKEN } from 'astro:env/server';
---
```

好处：缺失 / 类型不对时构建直接报错，secret 变量不会被打进客户端 bundle。
内容站多数情况用不到——数据在 `pnpm sync` 阶段就拉好了，页面只读集合。

### 🔴 配置文件里读不到 `.env`

`.env` **不会**被加载进 `astro.config.ts`（以及它 import 的 `src/site.config.ts` 顶层求值时）。需要在配置里用环境变量：

```ts
// astro.config.ts
import { loadEnv } from 'vite';

const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
```

- 第三个参数传 `''` 才会读出不带 `VITE_` 前缀的变量
- 第一个参数是 mode 名，决定读哪一份 `.env.<mode>`。Astro 配置是静态对象，拿不到命令行 `--mode` 的值（不像 Vite 的 `defineConfig(({ mode }) => …)`），
  所以要读 `.env.staging` 就得把 mode 名显式交给它，例如 CI 里多设一个系统变量 `SITE_ENV=staging`，配置里写 `loadEnv(process.env.SITE_ENV ?? 'production', process.cwd(), '')`

更简单的做法是直接读系统环境变量 `process.env.SITE_URL`（CI / Docker 构建时注入），不依赖任何 `.env` 文件。

---

## 数据同步脚本的环境变量

`scripts/sync/context.mjs` 启动时自己解析 `.env`（不引依赖），**系统环境变量优先于 `.env`**。数据源里这样取：

```js
// scripts/sync/sources/bilibili.mjs
async fetch(ctx) {
  const uid = ctx.env('SYNC_BILIBILI_UID');          // 必填：缺失时抛出「缺少环境变量 SYNC_BILIBILI_UID（写进 .env，参考 .env.example）」
  const pageSize = ctx.env('SYNC_PAGE_SIZE', '30');  // 第二个参数是默认值；但 .env 里写了 `SYNC_PAGE_SIZE=`（空值）时不会用默认值，而是抛错
  const token = process.env.SYNC_GITHUB_TOKEN;       // 可选变量直接读 process.env，自己处理 undefined
  ...
}
```

新增变量的固定三步：
1. `.env.example` 加一行变量名 + 中文说明（不写真实值）
2. 本机 `.env` 写真实值
3. 数据源里 `ctx.env('NAME')` 读取

命名约定：数据同步用 `SYNC_<来源>_<含义>`；要暴露给浏览器的才加 `PUBLIC_`。

---

## 多环境

### Vite 的 mode 与 env 文件

| 文件 | 何时加载 |
|------|---------|
| `.env` | 所有模式 |
| `.env.local` | 所有模式，本机覆盖 |
| `.env.<mode>` | `astro build --mode <mode>` |
| `.env.<mode>.local` | 同上，本机覆盖 |

`astro dev` 默认 mode 是 `development`，`astro build` 默认是 `production`。这些文件都已被 `.gitignore` 忽略（`.env.example` 除外）。

- 这张表说的是页面 / 端点代码里 `import.meta.env` 能读到什么；`astro.config.ts` 与它 import 的 `site.config.ts` 一份都读不到（见上一节）
- `scripts/sync/context.mjs` 只读项目根的 `.env`，不认 `.env.local` / `.env.<mode>`；数据同步需要分环境时用系统环境变量覆盖

### 预发布环境（staging）怎么处理 SEO

| 做法 | 说明 |
|------|------|
| ✅ `site.url` 始终写**生产域名** | 预发布站的 canonical 仍指向生产，不会和生产争收录 |
| ✅ 预发布站在反向代理加 `X-Robots-Tag: noindex` 或访问口令 | 防止预发布内容被收录 |
| ❌ 为预发布改 `site.url` 再忘了改回来 | 生产站 canonical 全指向预发布域名，属于静默事故 |

确实需要按环境切换域名时，用 `SITE_URL` 系统环境变量在 `astro.config.ts` 里覆盖（`process.env.SITE_URL`，或按上文把 mode 名显式交给 `loadEnv`），并在 CI 中显式传入，不要手改文件。

---

## 正确做法

- 站点公开信息集中在 `site.config.ts`，页面里不写死域名、站名、颜色
- 凭据只进 `.env`，`.env.example` 只有变量名
- 客户端需要的值才用 `PUBLIC_` 前缀，并确认它本来就是公开的（如统计 id）
- 统计 id 这类公开值直接写进 `site.config.ts` 的 `analytics` 最简单

## 常见错误

| 错误 | 后果 | 正确 |
|------|------|------|
| island 里读 `import.meta.env.API_TOKEN` | `undefined` | 服务端取数后当 props 传；或确认可公开再加 `PUBLIC_` |
| token 加了 `PUBLIC_` 前缀 | 凭据出现在网页源码 | 去掉前缀，只在构建期 / 同步脚本里用 |
| 在 `site.config.ts` 里用 `import.meta.env` | 被 `astro.config.ts` 引用时读不到 `.env` | 用 `loadEnv` 或系统环境变量 |
| `site.url` 带结尾斜杠 | 拼出 `//` 的 URL | 不带斜杠 |
| `imageDomains` 写 `https://i0.hdslb.com` | 匹配不上，图片不被优化 | 只写 `i0.hdslb.com` |
| 把 `.env` 提交进仓库 | 凭据泄露 | `.gitignore` 已忽略；已误提交要立刻作废该凭据 |
| Docker 构建时依赖 `.env` | `.dockerignore` 排除了 `.env`，构建拿不到 | 同步在镜像外完成并提交数据；构建期变量用 `--build-arg` / CI 注入 |

## 常用排查

```bash
grep -n "url:\|brandColor\|imageDomains" src/site.config.ts     # 当前站点关键配置
grep -n "^[A-Z_]*=" .env.example                                # 模板里有哪些变量
grep -rn "import.meta.env" src --include=*.astro --include=*.ts --include=*.tsx   # 谁在读环境变量
```

## 关联技能

| 需求 | 技能 |
|------|------|
| 首次搭环境、端口 | `dev-startup` |
| 数据同步源怎么写 | `data-sync` |
| 统计接入细节 | `analytics` |
| 部署时的环境注入 | `deployment-guide` |
| 孵化新项目时填写站点信息 | `project-init` |
