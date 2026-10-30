---
name: writing-plans
description: 把已定方案拆成 /dev-loop 可直接执行的 T 编号任务台账（需求、读写、文件、验证、提交），落 docs/tasks/active/。触发词：写计划、制定计划、实施计划、拆解任务、任务拆解、把方案落地、详细步骤、可执行计划、开发计划、计划文档
---

# 计划层（writing-plans）指南

## 何时使用

- 头脑风暴 / 需求已定，要拆成可执行的实施计划
- `/add-todo` 的一句话待办太粗，需要细到「文件 + 命令 + 验收」
- 复杂功能开发前，先出一份可被 `/dev-loop` 自主执行的任务台账
- 把 `docs/需求文档.md` / `docs/brainstorm-*.md` 落成 `docs/tasks/active/` 任务卡
- `/dev-loop` 第 0 轮：有需求无台账时自举拆计划

其他常见说法：计划层、writing-plans、实施方案。

## 概述

本技能是框架开发链路上的「计划层」，补齐 `brainstorm`（产出方案）与 `dev-loop`（执行）之间的一环。

```
brainstorm(方案)  →  【writing-plans(计划)】  →  dev-loop(执行)  →  update-status(聚合)
```

它把「方案级文档」翻译成**可被人或 `/dev-loop` 直接执行的细颗粒计划**：每条任务有全局唯一编号 `T<数字>`、精确文件路径、验证命令、规范提交信息。**产物落 `docs/tasks/active/*.md`**（复用 task-tracker 台账），`/update-status`、`/progress`、`/next` 与 `/dev-orchestrate` 都按同一格式读取。

> **颗粒度反比于框架已有能力**：能套用现成命令与页面模式的任务只写编排步骤；框架不提供的才写代码骨架。不给每个任务都写满完整代码——那会与 `/collection`、`/dev` 重复，还容易写出违反框架约束的代码。

---

## 何时用 / 何时不用

| 场景 | 用本技能? | 改用 |
|------|:---:|------|
| 方案已定，要拆成可执行计划 | ✅ | - |
| 多页面 / 多集合 / 含数据同步的功能开发前 | ✅ | - |
| 还在发散、不知道怎么做 | ❌ | `brainstorm` |
| 单条小事 / Bug 修复 / 小改动 | ❌ | `/add-todo` |
| 计划已就位，要开始执行 | ❌ | `/dev-loop` 或 `/dev` |
| 只是要个任务台账容器 / 格式 | ❌（本技能负责"内容"） | `task-tracker` |

---

## 核心原则：颗粒度 = 反比于「框架已有能力」

| 两端 | 毛病 |
|------|------|
| add-todo（太粗） | 只有一句话「做什么」，执行时还要现想文件 / 命令 / 验收 |
| 全量写完整代码（太细） | 与命令和页面模式重复，易写出违反 Astro 7 写法或框架封装的代码 |

**甜点 = 有命令、有参考页面的只编排；框架不提供的才写代码骨架。**

### 颗粒度判定表

| 任务类型 | 框架已有能力 | 颗粒度 | 计划写什么（≠重写代码） |
|---------|:---:|:---:|---|
| 新增内容类型（schema + 查询 + 列表 / 详情 / 分类页） | ✅ `/collection` | 粗·编排 | 字段清单（名称 / 类型 / 是否必填 / 进不进 URL）→ 调 `/collection` → 校验产物 |
| 套用现有模式的新页面（标签页、归档页、专题页） | ✅ 参考页面 + `/dev` | 粗·编排 | 参考哪个页面、URL、数据来源、SEO 字段 → 调 `/dev` |
| 外部数据同步源 | 半自动（运行器现成） | 细·骨架 | 接口地址与鉴权、分页方式、字段映射表、防风控措施、失败表现 |
| React island 交互区块 | ❌ | 细·骨架 | props 契约（服务端传什么）、状态、URL 同步、水合指令、空态 |
| 定制 UI（首页新区块、落地页，非标准模式） | ❌ | 细·转码 | 引用 `docs/prototypes/*.html` → `html-to-code` + 组件映射 + 截图门 |
| SEO / GEO 字段 | 半自动（SEOHead 现成） | 中 | 每类页面的 title / description 规则、JSON-LD 类型与字段、llms.txt 是否纳入 |
| 站点配置（导航、品牌色、图片域名、统计） | ✅ `site.config.ts` | 中 | 改哪个字段、改成什么 |
| 设计令牌 / 主题调整 | 半自动 | 中 | 改哪个令牌、两种主题下的值、对比度核验 |
| 部署 | ✅ `/deploy` | 粗·编排 | 目标服务器别名、域名、是否需要 HTTPS / 备案信息 |

---

## 输入与输出

### 输入（每次必读，不可凭记忆）
1. `docs/需求文档.md` —— 需求（只读），记下每条 `REQ-00x` 编号，任务要关联它
2. `docs/brainstorm-*.md`、`docs/decisions/*.md` —— 已确定的方案与选型（若有）
3. `docs/prototypes/` —— 原型（若有）
4. `CLAUDE.md`（尤其「协作约定」）+ `.claude/PROJECT.md`（孵化项目才有，优先级更高）+ `.claude/framework-config.json`（框架核心 vs 业务代码边界）
5. 参考代码：见 CLAUDE.md「参考代码位置」

### 输出
- 写入 `docs/tasks/active/task-{YYYYMMDD-HHMMSS}-{业务简称}.md`（时间用裸 `date +%Y%m%d-%H%M%S`）
- **复用 task-tracker 模板**（需求 / 方案 / 实现步骤 / 关键决策 / 当前进度 / 变更记录）
- 任务一律写在「## 🎯 实现步骤」区块，`/dev-loop` 逐条消费、回写 `[x]`
- 写完提交：`git add <台账文件>` → `git commit -m "docs(tasks): 拆分任务台账（T12-T20）"`

> 不另起 `docs/plans/` 目录——落 `docs/tasks/active/` 才能被 `/update-status` 等命令读到。

### 🔴 任务编号：全局唯一 `T<数字>`

编号跨台账文件递增（含已归档的），新建台账前先找已有最大编号：

```bash
grep -rhoE "^- \[[ x]\] T[0-9]+" docs/tasks 2>/dev/null | grep -oE "[0-9]+$" | sort -n | tail -1
# 无输出 = 还没有任务，从 T1 开始；输出 11 = 从 T12 开始
```

- 编号写在任务行里：`- [ ] T12 分类落地页支持分页`；单步执行、编排派单、`依赖:` 字段都用这个编号
- 编号一经发出不复用、不重排；拆出的新任务接着最大编号往后排
- 🔴 **只有「## 🎯 实现步骤」区块里以 `- [ ] T<数字>` 开头的行才是任务**。待决策事项、验收清单写在其他区块；任务内部的小步骤用普通列表，不要写成 `- [ ]`

---

## 计划头部模板（契约头）

每份计划的「需求描述」下方必须有：

```markdown
## 计划契约头
- **目标**：{一句话}
- **关联需求**：REQ-003、REQ-004
- **结构**：{2-3 句：涉及哪些集合、哪些页面、URL 形态}
- **数据来源**：{手工 / scripts/sync/sources/<name>.mjs / Markdown}
- **交互**：{无 / 哪个区块做 island、用哪个 client:* 指令}
- **SEO**：{新增页面的 title / description 规则、JSON-LD 类型}
- **文件清单表**：

| 文件 | 操作 | 负责什么 |
|------|------|---------|
| `src/content.config.ts` | 修改 | 新增 series 集合 |
| `src/lib/series.ts` | 新增 | 集合查询封装 |
| `src/pages/series/[id].astro` | 新增 | 合集详情页 |
| ... | | |
```

---

## 任务条目标准结构（无论粗细都必带）

```markdown
## 🎯 实现步骤

- [ ] T12 {任务标题}
  - 需求: REQ-003
  - 读写: 写入
  - 里程碑: M1
  - 类型: 编排 / 骨架 / UI转码 / 配置
  - 文件: {精确路径}
  - 框架约束: {该任务相关的规约提醒}
  - 步骤: {2-5 分钟一步的小步骤，用普通列表或编号}
  - 验证: {pnpm verify / pnpm sync <名> --dry-run / 截图对照原型}
  - 提交: feat(scope): …
  - 依赖: T11
```

| 字段 | 必填 | 说明 |
|------|:---:|------|
| `需求:` | ✅ | 关联的 `REQ-00x`；纯技术任务写 `无`。完成时 `/update-status` 据此回写需求状态 |
| `读写:` | ✅ | `写入` 或 `只读`（只读 = 调研、审计、出方案，不改仓库文件）。只有只读任务允许并行派发 |
| `里程碑:` | 可选 | `M1`、`M2`…，`/loop /dev-loop M2` 按它圈范围 |
| `文件:` | ✅ | 精确路径；只读任务写 `无` |
| `验证:` | ✅ | 见下方「验证门」 |
| `提交:` | ✅ | 按下方「提交口径」；只读任务写 `无`（只改任务卡时由执行方提交 `docs(tasks): …`） |
| `依赖:` | 可选 | 前置任务编号；执行方只选依赖都已 `[x]` 的任务 |
| `类型:` `框架约束:` `步骤:` | 建议 | 细颗粒计划的主体，给零上下文的执行方看 |

🔴 **每条任务必须「零上下文可独立派发」**：`/dev-orchestrate` 会把单条任务派给一个全新子会话，它看不到前面任务的对话，只看得到台账这一条 + 仓库现状。所以：
- 文件、约束、验证命令写全，不写「同上」「沿用前一步的做法」；要承接前序产出，就写明具体文件路径或导出名。
- 「读写」字段决定能否并行派发：**写入任务一律串行**（共用一个 git 仓库和构建产物），只有「只读」任务允许并行。

### 提交口径（与 CLAUDE.md「协作约定」一致）

| 任务 | `提交:` 写法 | 计入业务进度 |
|------|-------------|:-----------:|
| 功能 / 修复 | `feat(<业务>): …` / `fix(<业务>): …` | ✅ |
| 孵化项目里改框架核心文件（含追加导出） | 单独一条任务，`feat(framework): …` / `fix(framework): …` | ❌ |
| 数据同步产生的数据变更 | `chore(data): …` | ❌ |
| 裁剪模块 | `refactor(strip): …` | ❌ |
| 依赖变更 | `chore(deps): …` | ❌ |
| 重构 / 性能 / 测试 / 文档 | `refactor` / `perf` / `test` / `docs(…)` | ❌ |
| 只读任务 | `无` | ❌ |

进度只数 scope 不是 `framework` / `strip` / `data` / `deps` 的 `feat` / `fix`。所以**交付功能的任务一定用 feat / fix**，别写成 refactor，否则进度统计看不到。

### 遇到需要决策的事

计划阶段拿不准、又不能替用户拍板的（不可逆、合规、缺凭据、架构级）：写进任务卡「当前进度 → 待决策事项」，同时在 `docs/BLOCKERS.md` 追加一行：

```markdown
- [ ] [需决策] 2026-09-26 T14 数据源需要 B 站登录 Cookie 才能拿到合集列表 → 需要用户决定是否提供凭据
- [ ] [可逆] 2026-09-26 T15 标签页暂不做分页 → 默认一页展示全部，条目超 200 再拆
```

---

## 🔴 框架约束注入清单（计划层的命门）

计划里每段代码与编排都必须遵守，脱离这些约束生成的代码会违规或直接构建失败。

### Astro 7 写法（详见 CLAUDE.md「版本红线」）
- 集合定义在 `src/content.config.ts`；`z` 从 `astro/zod` 导入；loader 用 `glob()` / `file()`（`astro/loaders`）
- Zod 4：`z.email()` 是顶层函数；🔴 会进 `href` / `src` 的 URL 字段一律 `z.url({ protocol: /^https?$/ })`——裸 `z.url()` 会放行 `javascript:`，就是存储型 XSS；`z.record()` 必须两个参数
- 条目标识用 `entry.id`（没有 `slug`）；渲染用 `render(entry)`
- 动态路由 `getStaticPaths` 返回的 `params` 一律字符串
- `getImage()` 只在服务端调用，结果当 props 传给 island
- HTML 标签必须闭合（Rust 编译器严格校验）
- 不用 `src/fetch.ts` 这个文件名

### 页面与组件
- 页面骨架一律 `BaseLayout`（传 title / description / jsonLd），宽度用 `Container`，区块用 `Section`
- 按钮 `Button`、标签 `Badge`、面包屑 `Breadcrumbs` + `breadcrumbJsonLd(crumbs)`（同一个数组）
- 集合查询写在 `src/lib/<集合>.ts`，页面只调封装函数
- 日期 / 数字用 `src/lib/format.ts`
- 站内链接带结尾斜杠，用 `workPath()` 这类函数生成
- 卡片封面：首屏可见的几张传 `eager`，整页最重要的**一张**传 `priority`（`fetchpriority=high` 每页只给一张）

### 样式与交互
- 只用语义令牌：`bg-canvas` `bg-surface` `text-ink` `text-muted` `border-line` `bg-brand` `text-brand-ink` `bg-brand-strong`
- 链接 / 强调文字用 `text-brand-ink`，主按钮用 `bg-brand-strong`（不用 `text-brand` 做文字）
- 默认 `.astro` 静态组件；需要状态才做 island，放 `src/components/islands/`
- 中文标题用 `text-pretty`，不用 `text-balance`

### SEO / 数据
- 每页 title / description 必须不同；canonical、og:url 只由 `SEOHead` 输出
- JSON-LD 经 `serializeJsonLd()`；FAQ 结构化数据只标注页面可见的问答
- 外部数据走 `scripts/sync/`（失败保留旧数据）；远程图片域名加入 `site.imageDomains`
- 不捏造数据：播放量、案例、数字来自真实数据源，不确定标「待确认」

### 框架核心文件
- 判定所在仓库：有 `.framework-sync.json` = 孵化项目；否则 `package.json` 的 name 为 `next-ai-astro` = 框架仓库
- **框架仓库本身**：核心文件就是开发对象，正常写任务、正常 `feat/fix(scope)`
- **孵化项目**：新文件落业务位置（`src/pages/`、`src/components/<业务>/`、`src/components/islands/`、`src/lib/<业务>.ts`、`src/data/`、`src/content/`、`scripts/sync/sources/`）；确需改 `.claude/framework-config.json` 列出的核心文件（哪怕只是追加一个导出）→ **拆成单独一条任务**，`提交: feat(framework): …`
- 改动项目专属规则或与框架的差异时，同步 `.claude/PROJECT.md`

### 通用
- UTF-8 无 BOM；东八区时间；文件首行中文注释
- 逐个 `git add <具体文件>`，禁止 `git add -A` / `git add .`

---

## UI 任务的原型处理

`writing-plans` **不产 HTML、不手搓原型**。

- 原型**已存在**（brainstorm / kickoff 经工作站 ui-studio 产出 `docs/prototypes/*.html`）→ 计划步骤 = `用 html-to-code 把 docs/prototypes/X.html 转成 .astro 页面 / 组件 + 截图对照原型`。
- 原型**不存在** → 计划**回标一步**「先走 brainstorm / 工作站 ui-studio 出原型」，不让 writing-plans 或 dev-loop 现编 HTML。

---

## 验证门（复用 dev-loop，不自定义）

| 检查 | 命令 |
|------|------|
| 类型 + 构建 | `pnpm build`（= `astro check && astro build`） |
| SEO / GEO | `pnpm check:seo`（需先 build） |
| 单元测试 | `pnpm test`（改了 `src/lib/` 必须补测试） |
| 一键 | `pnpm verify` |
| 数据同步源 | `pnpm sync <name> --dry-run`（不写文件，只看条数与差异） |
| UI 任务额外 | 截图闭环（复用 `e2e-test`）：运行页 vs 原型逐条比对 7 项 |

---

## 实战示例

### 示例 1：新增内容类型（粗·编排，不写代码）

> 需求 REQ-003：新增「视频合集」（series），每个合集有标题、简介、封面、有序的作品列表。

```markdown
- [ ] T12 新增 series 集合与页面
  - 需求: REQ-003
  - 读写: 写入
  - 里程碑: M1
  - 类型: 编排
  - 文件: `src/content.config.ts`、`src/data/series.json`、`src/lib/series.ts`、`src/pages/series/index.astro`、`src/pages/series/[id].astro`、`src/pages/llms.txt.ts`
  - 框架约束: z 从 astro/zod；file() loader；id 只用 [a-z0-9-]；作品用 z.array(reference('works')) 有序引用；页面经 BaseLayout；llms.txt 追加合集分区
  - 步骤:
    1. 字段清单：id(string, 进 URL) / title / description(定义句) / cover / works(reference('works') 数组，顺序即集数) / order(number，合集之间的排序)
    2. 调 `/collection series` 按字段清单生成
    3. 核对：合集详情页按 works 数组顺序展示，显示「第 N / 总数 集」
  - 验证: `pnpm verify`
  - 提交: feat(series): 新增视频合集集合与页面
  - 依赖: 无
```

### 示例 2：外部数据同步源（细·骨架）

> 需求 REQ-005：从外部平台同步作品列表到 `src/data/works.json`。
> （外层用 `~~~` 围栏，因为任务里嵌了一段 ` ```js ` 骨架；写进台账时照原样保留内层代码块即可。）

~~~markdown
- [ ] T13 新增作品数据同步源
  - 需求: REQ-005
  - 读写: 写入
  - 里程碑: M1
  - 类型: 骨架
  - 文件: `scripts/sync/sources/platform.mjs`、`.env.example`（只加变量名）、`src/data/categories.json`（如需「待归类」分类）
  - 框架约束: 默认导出 { name, output, enabled, fetch(ctx) }；网络请求一律 ctx.fetchJson（自带超时重试）；返回数组每条必须有唯一 id；字段映射到 works schema；密钥只从 ctx.env() 读；业务状态码必须检查
  - 步骤（骨架）:
    ```js
    export default {
      name: 'platform',
      output: 'src/data/works.json',
      enabled: true,
      async fetch(ctx) {
        const uid = ctx.env('SYNC_PLATFORM_UID');
        const items = [];
        for (let page = 1; page <= 200; page += 1) {           // 硬上限：接口异常时也不会无限翻页
          const res = await ctx.fetchJson(`https://api.example.com/list?uid=${uid}&page=${page}`);
          if (res.code !== 0) throw new Error(`接口返回 code=${res.code}：${res.message ?? ''}`);
          const list = res.data?.list ?? [];
          items.push(...list);
          const total = res.data?.total;
          if (list.length === 0 || (typeof total === 'number' && items.length >= total)) break;
          await ctx.sleep(800); // 翻页间隔，降低风控概率
        }
        return items.map((item) => ({ id: item.bvid, title: item.title /* …按字段映射表 */ }));
      },
    };
    ```
    - 字段映射表：接口字段 → works 字段（写全，含缺失时的兜底值）
    - 分类映射：接口里的合集 / 标签 → categories 的 id（写全映射规则）。未映射的归到一个兜底分类，**该分类必须先在 `src/data/categories.json` 里存在**（如 `{ "id": "uncategorized", "name": "待归类", … }`），否则 `reference('categories')` 找不到目标，构建直接失败；运行时在日志里列出落进兜底分类的条目
  - 验证: `pnpm sync platform --dry-run` 条数与平台一致；再 `pnpm sync platform` + `pnpm verify`
  - 提交: feat(sync): 新增作品数据同步源（之后单纯刷新数据的提交用 chore(data): …）
  - 依赖: 无
~~~

### 示例 3：定制 UI 区块（细·转码，引用原型）

> 需求 REQ-007：首页新增「学习路径」区块（非标准模式，需视觉还原）。

```markdown
- [ ] T14 首页学习路径区块
  - 需求: REQ-007
  - 读写: 写入
  - 里程碑: M2
  - 类型: UI转码
  - 文件: `src/components/home/LearningPath.astro`、`src/pages/index.astro`
  - 框架约束: 前置原型 `docs/prototypes/home/learning-path.html`（缺失 → 先走工作站 ui-studio 补，本任务挂起）；用 Section 包裹；只用语义令牌；无状态 → 纯 .astro，不做 island；数据来自 series 集合（src/lib/series.ts 的封装函数）
  - 步骤:
    1. html-to-code 转原型 → 拆成 LearningPath.astro
    2. 在 index.astro 的精选作品之后插入
    3. 深色模式核对
  - 验证: `pnpm verify`；截图对照原型（e2e-test，桌面 + 手机两个视口）
  - 提交: feat(home): 首页新增学习路径区块
  - 依赖: T12
```

### 示例 4：只读调研任务

```markdown
- [ ] T15 核对平台接口的分页与风控行为
  - 需求: REQ-005
  - 读写: 只读
  - 类型: 配置
  - 文件: 无（结论写入本任务卡「技术调研」区）
  - 步骤: 查接口文档 / 实测 1 页请求 → 记录分页参数、单页上限、是否需要签名、限流表现
  - 验证: 调研结论含请求示例与返回样例（脱敏）
  - 提交: 无
  - 依赖: 无
```

---

## 与体系衔接 / 关联技能边界

| 关系对象 | 边界 |
|---------|------|
| `brainstorm` | 上游：产「方案」；本技能读 `docs/brainstorm-*.md` 拆「计划」 |
| `task-tracker` | 容器：本技能复用其模板与落点；task-tracker = 台账格式与日常维护，writing-plans = 细颗粒计划生产者 |
| `/dev-loop` | 下游：按编号顺序选第一个依赖已满足的未勾任务执行，回写 `[x]` |
| `/dev-orchestrate` | 下游（智码内）：总控把每条任务派给新鲜子会话跑 `/dev-loop T<编号>`，另开会话异构验收 |
| `/update-status` `/progress` `/next` | 读同一格式的台账：只数「实现步骤」区块的 `T<数字>` 行 |
| `/collection`、`/dev` | 内容类型与标准页面**编排调用命令**，本技能不重造 |
| `/add-todo` | add-todo = 单条快速待办；writing-plans = 成体系计划，并存不冲突 |
| `html-to-code` | UI 任务引用，本技能不产 HTML |

**链路**：`brainstorm` 定方案 → `writing-plans` 拆计划入 `docs/tasks/active/` → `/loop /dev-loop` 执行（在智码 AICoder 里且台账较大时改用 `/dev-orchestrate`）→ 里程碑 `/update-status` 聚合。

---

## 常见错误与最佳实践

### ❌ 错误 1：给能编排的任务写完整代码
把新集合的 schema、查询、三个页面全写进计划 → 与 `/collection` 重复，且容易混入过时写法。
✅ **正确**：只写字段清单 + 「调 `/collection` → 核对产物」。

### ❌ 错误 2：不注入框架约束
计划里出现 `src/content/config.ts`、`entry.slug`、裸 `z.url()`、`text-gray-500`、页面里直接 `getCollection` → 执行出来全是违规代码。
✅ **正确**：每个任务带「框架约束」字段，照「约束注入清单」。

### ❌ 错误 3：自己产 HTML 充原型
在计划里手搓 HTML 或让 dev-loop 现编页面。
✅ **正确**：引用 `docs/prototypes/*.html`（工作站产）走 html-to-code；缺则回标补原型。

### ❌ 错误 4：计划落错目录 / 格式不对
写到 `docs/plans/`，或任务行不带 `T<数字>`、写在「实现步骤」以外的区块 → 执行方与统计命令都认不出来。
✅ **正确**：一律落 `docs/tasks/active/*.md` 的「## 🎯 实现步骤」区块，`- [ ] T<数字> 标题` 开头。

### ❌ 错误 5：验证门缺 SEO 校验
只写 `pnpm build` → canonical、描述重复这类静默错误漏网。
✅ **正确**：新增 / 修改页面的任务，验证一律写 `pnpm verify`（含 `check:seo`）。

### ❌ 错误 6：数据同步任务没写失败表现
只写「拉接口」，没写接口失败、限流、字段缺失时怎么办 → 上线后某天构建出空列表或直接失败。
✅ **正确**：骨架里写明业务状态码检查、分页终止条件（含翻页硬上限）、翻页间隔、字段缺失的兜底值，并用 `--dry-run` 先验证。

### ❌ 错误 7：交付功能的任务写成 refactor / chore
进度只数 `feat` / `fix`（scope 为 framework / strip / data / deps 除外）→ 写成 refactor 的功能在 `/progress` 里看不见。
✅ **正确**：按上方「提交口径」表写 `提交:` 字段。

---

## 双系统同步

本技能为 Skill，改动后按 `add-skill` 规范同步 Codex 镜像：`pnpm agents:sync` + `pnpm check:skills`。
