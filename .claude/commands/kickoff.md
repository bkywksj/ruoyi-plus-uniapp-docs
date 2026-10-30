---
description: 从一句话想法到自主循环开发：联网调研出需求 → 工作站出原型 → 孵化新项目 → 起飞
argument-hint: <一句话站点想法>
---

# /kickoff - 从一句话想法到自主循环开发（next-ai-astro 前门编排器）

在框架模板里一句话起一个新内容站：**联网调研出需求 → 工作站出原型 → 孵化新项目 → 起飞自主循环**。
每个产出都有人工门，你点头才往下——**前段你把关「做什么」「长什么样」，后段交给 `/dev-loop` 自主做「怎么做」**。

> **关键节奏**：前两段**只产文档和原型、绝不碰代码**；改站点名 / 域名 / 品牌色 / 导航这些，**等到阶段三 `project-init` 孵化时才做**（它们都集中在新项目的 `src/site.config.ts`）。
> 框架仓库本身保持干净：需求文档与原型在框架里**只落盘、不提交**，由 `project-init` 带进新项目。

## 用法

```
/kickoff <一句话站点想法>
```

例：`/kickoff 做一个 B 站视频归类站：按系列和标签整理我的全部投稿，带搜索筛选`

## 总原则

- **前 2 段交互、有人工门**，AI 不闷头冲；最后才进自主循环。
- **全程复用现成件**：调研走 `brainstorm`、原型走【AI 工作站 ai-ui-studio】、孵化走 `project-init`、循环走 `/dev-loop`、内容类型走 `/collection`、原型转码走 `html-to-code`。
- **反捏造**：调研结论标来源；播放量、用户数、案例、价格等事实一律来自用户原话或可核实来源，不确定标「待确认」。

---

## 第零步　判断所在仓库（决定产出落点与是否孵化）

```bash
ls .framework-sync.json 2>/dev/null; grep -m1 '"name"' package.json
```

| 结果 | 所在仓库 | 本命令怎么走 |
|------|---------|-------------|
| 无 `.framework-sync.json`，package.json name 为 `next-ai-astro` | **框架模板** | 阶段一 → 二 → 三（孵化）→ 四；产出只落盘不提交 |
| 有 `.framework-sync.json` | **已孵化的项目** | 阶段一 → 二 → **跳过阶段三** → 阶段四；产出直接属于本项目，过人工门②后提交 `docs(tasks): 需求文档与原型` |
| 都不满足 | 未登记来源的项目 | 同「已孵化的项目」，并提示可用 `framework-sync` 技能的「首次配置」补 `.framework-sync.json` |

---

## 阶段一　需求孵化（联网 + 头脑风暴）→ 🚦人工门①

1. **联网调研**：用 `WebSearch` 查同类站点的栏目结构、内容组织方式、常见交互（筛选 / 搜索 / 系列页）、SEO 做法；数据来自外部平台时，一并确认**接口是否可得、是否要凭据、有无限流 / 防盗链 / 风控**（这决定数据源可行性）。必要时调【工作站】`/research`（ai-workstation MCP → ai-research-studio）。
2. **头脑风暴**（激活 `brainstorm`）：把想法扩成结构化需求，至少覆盖——
   - **定位**：站点是什么、给谁看，写成一句「X 是 Y」的定义句（它会成为首页 tagline 和 GEO 的主定义）
   - **信息架构**：栏目与 URL（首页 / 列表 / 详情 / 分类 / 文章 / 关于…），哪些页要被收录
   - **内容类型**：每类内容对应一个集合（字段、数量级、更新频率）；能复用示例 `works` 的直接复用
   - **数据源**：手写 JSON / Markdown / 外部接口同步（`scripts/sync/sources/`）；接口的凭据、频率、失败策略
   - **SEO / GEO 目标**：核心关键词、需要的结构化数据类型（VideoObject / Product / Article…）、llms.txt 重点
   - **设计方向**：品牌色、风格参考、是否需要深色模式与动效
   - **范围与边界**：里程碑 M1（MVP）→ M2 → M3，每个里程碑列出包含的 REQ，明确「不做什么」
3. **产出需求**：写到 `docs/需求文档.md`（套 `.claude/templates/需求文档模板.md`，每条需求一个全局唯一 `REQ-00x`，任务台账会用 `需求: REQ-00x` 引用它）。
   - 想用命令生成：调 **`/init-docs --req-only <描述>`**——只生成需求文档，不建项目状态 / 待办、不提交。
   - 🔴 在框架模板里**不要**调不带 `--req-only` 的 `/init-docs`：它会建全三份文档并提交，框架仓库被污染，`project-init` 也只带走需求文档和原型。
   - **不碰任何代码。**
4. 🚦**人工门①**：把「调研要点（带来源）+ 完善建议 + 需求摘要」给用户，**停下等确认 / 修改**。通过才进阶段二。

## 阶段二　原型生成（必须走工作站）→ 🚦人工门②

1. 按确认的需求，**调【AI 工作站】生成原型**：
   - `ai-workstation` MCP → `route(query=按需求做 <站点> 的页面原型：首页 / 列表 / 详情 / …)` → `get_skill(ai-ui-studio, <命中的技能>)` → 按技能执行
   - 产出到 `docs/prototypes/<页面>/*.html`，要求：
     - 带「组件映射表」注释：原型区块 → 本框架组件（`Container` / `Section` / `Button` / `Badge` / `WorkCard` / island）
     - 颜色用语义命名，能映射到本框架令牌（`canvas` / `surface` / `ink` / `muted` / `line` / `brand`），品牌色写明色值
     - 需求要求深色模式 / 移动端时，原型同时给出对应视图
   - 🔴 **禁止模型自己手搓 HTML 充当原型**：一律走工作站 ai-ui-studio（保证可被 `html-to-code` 转码，并作为 `/dev-loop` 截图闭环的比对目标）。
   - 工作站 MCP 不可用（`route` 调不通 / 报错）→ **停下告知用户**，不要降级成手写原型。
2. 用智码浏览器打开原型截图给用户看（本地文件用 `file:///` 地址，也可直接传本地绝对路径）：
   ```
   mcp__aicoder__browser_open(url="file:///E:/<项目路径>/docs/prototypes/<页面>/index.html", device="desktop")   # 返回 label
   mcp__aicoder__browser_screenshot(label=<上一步的 label>, full_page=true)
   ```
3. 🚦**人工门②**：**停下等确认 / 修改**。**仍不碰代码。** 通过才进下一阶段。
   - 已孵化的项目：此时提交需求文档与原型——逐个 `git add docs/需求文档.md docs/prototypes/<页面>/…`，`git commit -m "docs(tasks): 需求文档与原型"`（编排模式要求真相源已提交）。

## 阶段三　创建新项目（= `project-init` 孵化，这一步才改站点标识；已孵化的项目跳过）

- **激活 `project-init` 技能**，按它的交互流程走，**不在本命令里重复它的逻辑**。它会：
  - **询问新项目写到哪个目录**（如 `E:\my\<项目名>`），以及站点名、生产域名、品牌色、作者信息
  - 复制框架到新目录 → 改 `src/site.config.ts` → 写 `.claude/PROJECT.md` → 按需裁剪示例（`module-strip`）→ 写 `.framework-sync.json`
  - 把 `docs/需求文档.md` + `docs/prototypes/` 带入新项目
  - 本地 `git init` 并首次提交；🔴 建远程仓库与推送走 Sigil（只建私有仓，推送前一句话告知用户）

## 阶段四　起飞（交给 `/dev-loop` / `/dev-orchestrate`）

- 由 `project-init` 收尾时输出起飞指令（已孵化的项目由本命令直接给出），**二选一**：
  - **在【智码 AICoder】里且台账较大**（推荐）→ `/dev-orchestrate`：本会话当总控，每条任务派新鲜子会话跑 `/dev-loop T<编号>`，另开 Codex 子会话异构验收。
  - **其他环境 / 台账很小** → `/loop /dev-loop`：单会话自主循环。
- 两种方式的每一轮作业相同：第 0 轮按需求 + 原型用 `writing-plans` 拆 `docs/tasks/active/` 任务台账（任务编号全局唯一 `T<数字>`，格式见 `CLAUDE.md`「协作约定」）；之后每轮一个最小单元——新内容类型走 `/collection`、页面走 `/dev` 流程、原型转码走 `html-to-code`、数据源走 `data-sync`——过验证门（`pnpm build` + `pnpm check:seo` + `pnpm test`，UI 任务加截图闭环）、勾台账、规范 commit，里程碑调 `/update-status`，直到做完。
- 🔴 前三段**不走编排**：它们每段都有人工门，要你亲自点头；交给多会话自动跑反而绕过了把关。

---

## 约束

- 本命令可以用 ai-workstation MCP（工作站源码仓库里才禁用它，这里不是）。
- **每个人工门必须真的停下等用户**；前两段绝不碰代码和 `src/site.config.ts`。
- 框架模板里：需求文档与原型只落盘不提交。已孵化的项目：过人工门②后按上文提交。
- 产出 UTF-8 无 BOM；不按名杀进程；本地提交不推远端（除非用户明确要求）；仓库一律私有。

## 与相邻能力的边界

| 能力 | 角色 |
|------|------|
| **/kickoff**（本命令） | 前门编排：调研 → 需求门 → 原型门 → 孵化 → 起飞 |
| `brainstorm` 技能 | 阶段一的结构化需求展开 |
| `/init-docs --req-only` | 阶段一只生成需求文档（不提交） |
| 工作站 ai-ui-studio（MCP）/ `html-to-code` | 原型生成 / 原型转 `.astro` 组件 |
| `project-init` 技能 | 孵化引擎：问目录 → 复制框架 → 改 `site.config.ts` → 本地 git |
| `/collection` / `/dev` | 起飞后按台账新增内容类型 / 页面 |
| `/dev-loop` | 起飞后的自主循环（一轮一最小提交） |
| `/dev-orchestrate` | 智码内的起飞方式：总控派子会话逐条跑 `/dev-loop T<编号>` + 异构验收 |
