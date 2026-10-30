---
description: 新增一种内容类型端到端：schema → 数据 → 同步源 → 查询封装 → 列表 / 详情 / 分类页 → llms.txt 与导航 → 验证门
argument-hint: <内容类型，如「videos 视频」>
---

# /collection - 新增一种内容类型

内容站的「CRUD」：一种内容类型 = 一个内容集合 + 一套页面。本命令把它从 schema 一路做到可收录的页面，相当于后台框架里「代码生成一个业务模块」在内容站里的对应物。

> 只加一个页面或给已有集合加字段 → 用 `/dev`。

## 核心原则

- **先想能不能复用 `works`**：示例集合 `works` 本身就是通用的「作品目录」（标题 / 摘要 / 分类 / 标签 / 日期 / 封面 / 原始链接 / 数值指标）。新项目的主内容和它同形（视频、项目、产品、案例…）时，**优先改造 `works`**（改名 / 加字段），比并列一个新集合更省，也少一套要维护的页面。
- **数据先行**：schema → 数据 → 查询封装 → 页面，顺序不能反；页面只调 `src/lib/<集合>.ts`，不直接 `getCollection`。
- **只确认一次**：第三步方案确认后全自动做到提交。
- **反捏造**：没有真实数据时，示例条目必须在 `summary` 里写明「示例数据」，不编造播放量、价格、客户名。

---

## 第一步：收集信息

| 信息 | 示例 | 说明 |
|------|------|------|
| 集合名 | `videos` | 英文小写复数，进 URL 与代码 |
| 中文名 | 视频 | 用于标题、面包屑、导航 |
| 字段 | 标题、简介、封面、时长、播放量、发布时间、BV 号、系列 | 标出必填 / 可选、类型 |
| 数据来源 | A 手写 JSON / B Markdown / C 外部接口同步 | 决定 loader 与是否写同步源 |
| 分类 | 复用 `categories` / 独立分类集合 / 不分类 | 分类会生成独立落地页 |
| URL | `/videos/`、`/videos/<id>/`、`/videos/category/<id>/` | 一律带结尾斜杠 |
| 列表交互 | 搜索 / 分类 / 标签 / 排序 | 需要 → 列表页做 island |
| 结构化数据 | VideoObject / Product / SoftwareApplication / CreativeWork / Article | 按内容语义选 |
| 卡片展示 | 封面 + 时长角标 + 标题 + 日期 + 播放量 | 决定能否直接复用 `WorkCard` |

缺关键信息只问 1-2 个；其余按上表给默认值写进方案。

---

## 第二步：查重与复用判断

```bash
# 已有哪些集合
Grep pattern: "defineCollection" path: src/content.config.ts output_mode: content
# 是否已有同名目录 / 页面
ls src/pages/ src/components/ src/lib/
```

| 情况 | 处理 |
|------|------|
| 已有同名集合 | 停下，改为「给已有集合加字段」→ `/dev` |
| 与 `works` 同形且项目不再需要示例 `works` | 方案 A：改造 `works`（推荐） |
| 与 `works` 并存（两类内容都要） | 方案 B：新建集合 + 新页面 |

---

## 第三步：方案确认（唯一一次确认）⭐

```markdown
## 📋 内容类型方案：{中文名}（{集合名}）

### 方案：{A 改造 works / B 新建集合}

### Schema 草案（src/content.config.ts）
| 字段 | 类型（Zod 4） | 必填 | 说明 |
|------|--------------|------|------|
| id | z.string().regex(/^[A-Za-z0-9_-]+$/) | ✅ | 进 URL |
| title | z.string() | ✅ | |
| cover | z.string() | ✅ | 外链域名需加入 site.imageDomains |
| url | z.url({ protocol: /^https?$/ }).optional() | | 原始地址 |
| category | reference('categories') | ✅ | |
| metrics | z.record(z.string(), z.number()).optional() | | 播放量 / 时长（秒） |

### 数据来源
{A 手写 src/data/{集合名}.json / B src/content/{集合名}/*.md / C scripts/sync/sources/{名}.mjs → src/data/{集合名}.json}

### 文件清单
| 操作 | 文件 | 框架核心？ |
|------|------|-----------|
| 修改 | src/content.config.ts | 否（项目配置） |
| 新增 | src/data/{集合名}.json | 否 |
| 新增 | scripts/sync/sources/{名}.mjs | 否（C 才有） |
| 新增 | src/lib/{集合名}.ts | 否 |
| 新增 | src/pages/{集合名}/index.astro、[id].astro、category/[id].astro | 否 |
| 修改 | src/site.config.ts（nav / imageDomains） | 否（项目配置） |
| 修改 | src/pages/llms.txt.ts（追加分区） | 否（项目配置，随集合演进） |

### SEO
- 列表页 / 分类页 / 详情页的 title 与 description 规则（保证每页不同）
- JSON-LD：BreadcrumbList + {类型}

确认后我将全自动执行到提交。
```

---

## 第四步：自动实现（按顺序）

激活 `content-collections`（schema 写法）；数据源是 C 时同时激活 `data-sync`；有 island 时激活 `islands-interaction`。

### 4.1 Schema

在 `src/content.config.ts` 追加集合（Astro 7 写法，参照已有的 `works`）：

```ts
const videos = defineCollection({
  loader: file('src/data/videos.json'),        // Markdown 用 glob({ pattern: '**/*.md', base: './src/content/videos' })
  schema: z.object({
    id: z.string().regex(/^[A-Za-z0-9_-]+$/, 'id 会进 URL，只能用字母、数字、下划线、连字符'),
    title: z.string(),
    // …其余字段；z 从 'astro/zod' 导入，Zod 4 写法（z.url({ protocol: /^https?$/ }) / z.email()；裸 z.url() 放行 javascript:）
    category: reference('categories'),
  }),
});
export const collections = { categories, works, posts, videos };
```

改完执行 `pnpm astro sync` 刷新类型。

### 4.2 数据

- **A / C**：`src/data/<集合名>.json`，数组，每条必须有唯一 `id`
- **B**：`src/content/<集合名>/*.md`，frontmatter 对应 schema；文件路径即 id
- **C**：以 `scripts/sync/sources/example.mjs` 为模板新建数据源：

```js
// <集合名> 数据源：从 <平台> 同步到 src/data/<集合名>.json
export default {
  name: '<名>',
  output: 'src/data/<集合名>.json',
  enabled: true,
  async fetch(ctx) {
    const data = await ctx.fetchJson('<接口地址>', { headers: { /* 凭据用 ctx.env('XXX') 读取 */ } });
    return data.list.map((item) => ({ id: String(item.id), title: item.title /* …字段映射到 schema */ }));
  },
};
```

  先 `pnpm sync <名> --dry-run` 看条目数，再 `pnpm sync <名>` 真正写入；凭据变量补进 `.env.example`（只写变量名）。

### 4.3 查询封装 `src/lib/<集合名>.ts`

照 `src/lib/works.ts` 写：`get<集合>()`（带排序）、路径函数 `<单数>Path(id)` / 分类路径、`related…()`、`countByCategory()`、`toCardData()`（服务端调 `resolveCover()` 解析封面）。页面只调这里。

### 4.4 卡片

- 字段与 `WorkCardData` 同形 → 直接复用 `src/components/works/WorkCard.tsx`
- 否则新建 `src/components/<集合名>/<Name>Card.tsx`，照 `WorkCard` 写：只吃服务端算好的数据，静态与 island 两用，保留 `.vt-card` / `.vt-cover` 以支持封面过渡

### 4.5 页面

| 页面 | 参考 | 要点 |
|------|------|------|
| `src/pages/<集合名>/index.astro` | `src/pages/works/index.astro` | 需要筛选 → island（照 `WorksExplorer.tsx`）；description 带条目数与分类名 |
| `src/pages/<集合名>/[id].astro` | `src/pages/works/[id].astro` | `getStaticPaths` + `satisfies GetStaticPaths`；面包屑 + 对应 JSON-LD；封面 `view-transition-name` 与卡片一致 |
| `src/pages/<集合名>/category/[id].astro` | `src/pages/works/category/[id].astro` | 纯静态列全部条目；导语用分类的定义句 |

需要 `src/lib/seo.ts` 里还没有的 JSON-LD 构造函数（如 `videoJsonLd`）时：`seo.ts` 是框架核心。框架仓库本身直接加；孵化项目里优先写在 `src/lib/<集合名>.ts`，确需加进 `seo.ts` 就单独一个提交、scope 写 `framework`（如 `feat(framework): seo.ts 新增 eventJsonLd`）。

### 4.6 接入

- `src/site.config.ts`：`nav` 加入口；封面是外链时把域名加进 `imageDomains`
- `src/pages/llms.txt.ts`：追加该集合分区（项目配置文件，见 `.claude/framework-config.json` 的 projectConfig）
- 首页需要露出时，在 `src/pages/index.astro` 加 `Section` 区块
- sitemap 自动包含新页面，无需改动

---

## 第五步：验证门

```bash
pnpm build        # schema 不符、路由冲突、HTML 不合法都会在这里报
pnpm check:seo    # 新页面的 canonical / 描述去重 / JSON-LD / alt
pnpm test         # 新 lib 函数补单测
```

UI 部分过截图闭环（先查端口复用已有 dev server，没有再 `pnpm dev` → `http://localhost:4321/` → 智码浏览器桌面 / 移动 / 深色各截一次，有原型时用 `file:///` 地址打开逐条比对 7 项，做法同 `/dev` 第六步）。

---

## 第六步：分步提交

逐个 `git add` 具体文件，按逻辑拆成几个规范提交：

```
feat(<集合名>): 新增内容集合与数据
feat(<集合名>): 数据同步源                  # 仅 C
feat(<集合名>): 列表 / 详情 / 分类页
feat(geo): llms.txt 纳入 <集合名>
feat(framework): seo.ts 新增 <类型>JsonLd   # 仅孵化项目确需改框架核心时，单独提交，不计进度
```

- 首次建集合时的数据属于功能的一部分，跟 `feat` 走；之后数据源定期同步产生的变更用 `/sync-data`，提交 `chore(data): …`（不计进度）
- 由台账任务驱动时，勾选后的台账文件随最后一个 `feat` 提交一起 `git add`；口径见 `CLAUDE.md`「提交与进度口径」

## 第七步：完成报告

```markdown
## ✅ 内容类型「{中文名}」完成

- 集合：{集合名}（{N} 条，来源：{A/B/C}）
- 页面：/{集合名}/、/{集合名}/<id>/ × {N}、/{集合名}/category/<id>/ × {M}
- 验证：build ✅ / check:seo ✅ / test ✅ / 截图 ✅
- 提交：{hash 列表}

下一步：{数据源定期更新 → /sync-data；上线前 → /seo-check}
```

## 与其他命令的关系

| 命令 | 关系 |
|------|------|
| `/dev` | 单个页面 / 给已有集合加字段 |
| `/sync-data` | 数据源写好后的日常同步 |
| `/strip-modules` | 改造 `works` 时先裁掉不需要的示例 |
| `/dev-loop` | 循环里遇到「新内容类型」任务时按本命令执行（跳过第三步确认） |
