---
name: autonomous-dev
description: |
  自主连续开发方法论（Codex 版）。把一个项目按「每轮一个最小可提交单元」的方式推进到完成：
  每轮读真相源 → 选下一个未做项 → 做一个最小单元 → 过验证门 → 记录勾选 → 最小提交 → 报进度。
  适用于"按需求/台账建页面、还原原型、修一批 bug、补测试、重构、迁移、清理"等需要反复同构推进的任务。

  与 Claude Code 的关系：Claude Code 有内置 `/loop` 自动续期（`/loop /dev-loop`），Codex 没有——
  所以 Codex 端由你（或脚本 / cron）反复触发"继续下一轮"，方法论本身一致。

  触发场景：
  - 想让 Codex 把某个项目/某个意图"一轮轮推进到完成"
  - 还原原型图、修一批问题、补单测、重构模块等同构重复任务
  - 需要"每步可构建、可回退、可恢复"的稳健推进方式

  触发词：自主开发、连续开发、循环开发、一轮一提交、还原原型、批量修复、autonomous dev、continuous dev
---

# autonomous-dev — 自主连续开发方法论（Codex 版）

## 这是什么 / 怎么用

把开发拆成**一轮一个最小可提交单元**的同构循环，每轮稳定产出、可验证、可回退、可恢复。

- **Claude Code 用户**：直接用 `/loop /dev-loop`（自动续期）或 `/loop-gen <意图>`；在智码 AICoder 里可用 `/dev-orchestrate` 多会话编排。
- **Codex 用户（本技能面向你）**：没有自动续期，**每次触发执行一轮**，做完即停；由你或脚本再次触发"继续下一轮"。

## 每轮标准流程（核心）

1. **读真相源（每轮必读，不可凭记忆）**：`docs/需求文档.md` / 原型 `docs/prototypes/*` / 任务台账 `docs/tasks/active/*.md` / 项目规约 `AGENTS.md`（孵化项目有 `.claude/PROJECT.md` 时先读它，优先级最高）。
2. **选一项**：只看台账「## 🎯 实现步骤」区块里以 `- [ ] T<数字>` 开头的任务行（其他区块的复选框不算），取按编号第一个未勾、且 `依赖:` 都已完成的那条。没有台账（第 0 轮）就先按需求 + 原型拆出任务写进 `docs/tasks/active/`：编号全局唯一 `T<数字>`（接着已有最大编号），每条带 `需求: REQ-00x`、`读写: 写入|只读`、`里程碑:`（可选）、`文件:`、`验证:`、`提交:` 字段，提交 `docs(tasks): 拆分任务台账` 后结束本轮（Claude 端对应 `writing-plans` 技能）。格式以 `AGENTS.md`「协作约定」为准。
3. **只做这一个最小单元**，遵守 `AGENTS.md` 的 Astro 7 版本红线与框架封装约定，**严禁一轮多做**。只读任务（调研 / 审计）把结论写进任务卡，不改业务文件。
4. **验证门（必须全绿才提交）**：
   - `pnpm build`（含 `astro check` 类型检查）
   - `pnpm check:seo`（逐页 canonical / 描述 / JSON-LD / robots / llms.txt / 站内死链）
   - `pnpm test`（`src/lib` 单测）
   - 红了当场修绿。同一目录同一时间只跑一个构建。
5. **记录**：台账该项 `[ ]`→`[x]`，补一行「实际改了什么 / 坑」。
6. **两段 review 通过后，最小提交**：逐个 `git add` 本轮改动的具体文件（含台账；**禁止 `git add -A`**），按台账 `提交:` 字段写 message。只有 `feat(scope)` / `fix(scope)` 计入业务进度（scope 为 framework / strip / data / deps 除外）；只读任务或只改台账用 `docs(tasks): …`；孵化项目里改框架核心文件单独提交、scope 写 `framework`。
7. **报本轮**：做了啥 | 进度 X/总（只数 `T<数字>` 任务行）| 下一个。**然后停止本轮**（等待下次触发）。

## 两段 review（验证门绿后、提交前 · 必过）

- **第一段 · 功能正确性**：是否真正达成任务目标；空态、极端数据（0 条 / 超长标题 / 缺封面）、移动端、深色模式有无问题。
- **第二段 · 项目规约**：对照 `AGENTS.md`「绝对禁止的写法」「强制使用框架封装」逐条自审（语义令牌、结尾斜杠、SEO 只经 BaseLayout、island 最小化、UTF-8 无 BOM）。
- 🔴 任一段不过 → 返工，不提交。

## 原型保真截图闭环（涉及 UI 的任务必过）

- dev server：先 `netstat -ano | findstr :4321` 看有没有已起的服务，有就复用；没有才 `pnpm dev`（后台方式起，**不 kill 已有进程**，不要每轮新起）。地址一律写 `http://localhost:4321/`（本机 127.0.0.1 连不上）。
- 浏览器打开运行页截图 = 现状；打开对应原型（本地文件用 `file:///E:/<项目路径>/docs/prototypes/<页面>/index.html`）= 目标；桌面宽度与手机宽度（390px）各截一次，需求要求深色模式时再截深色。
- 逐条比对：布局分区 / 主辅状态色 / 间距留白 / 字号字重行高 / 组件类型 / 文案 / 交互态（hover、聚焦、空态、深色模式）。
- 有差异**只改视图层** → 重新截图确认消除；颜色 / 间距一律用设计令牌，禁止硬编码。

## 决策分流

记录格式：`docs/BLOCKERS.md` 追加 `- [ ] [可逆|需决策] YYYY-MM-DD T12 内容 → 采用的默认做法 / 需要谁决定什么`，处理完勾成 `[x]`。

- **可逆 / 低风险**（命名、文件位置、等价写法）→ 按合理默认继续，记一行 `[可逆]`，不空等。
- **不可逆 / 合规 / 架构级 / 缺外部凭据** → 记一行 `[需决策]` 后停下问用户（被编排派来当实现方时，写完这一行就结束本轮，收尾行报 `status=blocked`）。

## 卡点熔断 + 停止条件

- 连续 3 轮无实质进展，或同一项 2 轮验证门修不过 → 停止，报错误原文 + 判断 + 建议。
- 台账「实现步骤」里的 `T<数字>` 任务行全部 `[x]` + 验证门全绿 → 输出「完成」+ 自检，停止。

## 在【智码 AICoder】里（多会话编排）

- **被派来当验收方**（最常见）：任务书在 `.agent-pipeline/review-<编号>.task.md`，给出任务原文 + `git diff <基线>..HEAD`。**只读**审查（可跑 `pnpm build` 核实，不改文件、不提交），按上方「两段 review」逐条审，结论**写入** `.agent-pipeline/review-<编号>.result.md`：先列 `文件:行 — 问题 — 建议`（无问题写「无」），最后一行单独 `VERDICT: PASS` 或 `VERDICT: REJECT`。
- **被派来当实现方**：只做任务书指定的那一项（`T<编号>`），写入类任务必须规范提交；只读任务结论写进任务卡、只改台账时提交 `docs(tasks)`；遇到需决策的事按上文「决策分流」记一行后报 `blocked`。结尾输出一行 `ORCH-RESULT task=<编号> status=<done|failed|blocked> commit=<短sha或none> note=<一句话>`。需要 dev server 时用 `mcp__aicoder__resolve_and_start_task(project_path=<项目根>, command="pnpm dev")`。
- **你自己当总控**：`mcp__aicoder__start_agent_session(project_path=<项目根>, provider_id=…)` 派活（显式传 `provider_id`，实现方用 `claude-code`，因为本项目斜杠命令只在 Claude 侧齐全）→ `mcp__aicoder__watch_session(watch_session_ids=[…])` 登记等待（**`notify_session_id` 省略**，系统自动填成你自己；传错人会让编排静默卡死）→ 停下别轮询，被 `[AGENT-EVENT]` 唤醒后裁决并重新 watch。完成判据：台账该条 `[x]`，写入类任务在基线之后有新提交；只读任务要求 `status=done` 且标注 `读写: 只读`。

## 红线

- 不发明真相源里没有的功能；技术栈不换。
- 文件 UTF-8 无 BOM、中文注释可读。
- 不按名杀宿主进程（按端口 / PID 精准）；不 `git add -A`；不 `git reset --hard` / `clean`；本地提交不推远端（推送走 Sigil）；`.env` 不进 git。
