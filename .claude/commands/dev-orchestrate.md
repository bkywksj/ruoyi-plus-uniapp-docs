---
description: 智码多会话编排版自主开发：本会话当总控，按批派子会话跑 /dev-loop（一批几条相邻任务），按验收方式另开异构验收
argument-hint: "[范围：M<n> 里程碑 | 关键词] [--review=risk|each|final|none]"
---

# /dev-orchestrate - 智码协同编排版自主开发（总控调度 · 实现 / 验收异构 · 按批复用 /dev-loop）

在【智码 AICoder】里跑长任务时，用它替代 `/loop /dev-loop`：**本会话只当「总控」**（调度 + 裁决 + 记账），
每**一批**相邻任务派一个**新鲜的实现子会话**跑 `/dev-loop T<起>-T<止>`（见第 1 步「组批」），再按「验收方式」另开**异构验收子会话**（默认 Codex）独立审提交（默认只逐条审高风险任务，其余合并审）。
子会话跑完由智码自动唤醒总控，**零轮询**；子会话撞额度由智码自动换档案续跑。

🔴 **本命令只是调度器，不重造 dev-loop**：一轮怎么做（判断类型 → 复用 `/collection` / `/dev` / `html-to-code` / `data-sync` → 验证门 → `/check` → 勾台账 → 规范提交）全部照 `/dev-loop`，这里只管「谁来做、谁来审、审不过怎么办」。
台账格式、完成判据、阻塞记录以 `CLAUDE.md`「🔴 协作约定」为准。

## 用法

- `/dev-orchestrate` —— 按台账顺序全量推进，直到全部任务 `[x]`
- `/dev-orchestrate M2` / `/dev-orchestrate videos` —— 只推进匹配该里程碑 / 关键词的未勾任务（范围规则同 `/dev-loop`）
- `/dev-orchestrate M2 --review=each` —— 指定验收方式：`risk` 按风险分级（默认）/ `each` 逐条 / `final` 只在最后验收一次 / `none` 不派验收，见下方「验收方式」

## 选型：什么时候用它，什么时候用 `/loop /dev-loop`

| 情况 | 选 |
|------|----|
| 在智码里 + 台账 ≥ 5 条，或含 UI 还原 / 数据源对接 | ✅ `/dev-orchestrate`（上下文不膨胀、异构验收、额度自动轮换） |
| 台账很小（< 5 条）/ 基本是样式微调 | `/loop /dev-loop`（省 token：每个子会话都要重载 CLAUDE.md + 技能表） |
| 只是一个小功能（预计 30 分钟以内、5 个文件以内），没有台账 | 直接 `/dev`，不走编排也不走 loop（编排光出方案、建状态文件、冷启动子会话就要十几分钟） |
| 不在智码里（纯终端 / IDE 插件 / 云端） | 只能 `/loop /dev-loop` |

## 前置检测（任一不满足 → 不进编排，提示改用 `/loop /dev-loop`）

1. **在智码里**：`echo $AICODER_SESSION_ID` 非空（聊天模式会剥掉该变量，此时以第 2 条为准）。
2. **编排工具可用**：能调 `mcp__aicoder__get_session_status`，返回里 `isYou=true` 那条就是总控自己 → 记下 `yourSessionId`（写进 state.json 用；派活返回 `watching=false` 时补调 `watch_session` 要传它）。
3. **台账**：`docs/tasks/active/*.md` 的「## 🎯 实现步骤」区块里有未勾的 `- [ ] T<数字>` 任务行，且**台账文件已提交**（未提交的台账，实现方会当作他者文件不带进提交，勾选只留在工作区）。
   - 有需求（`docs/需求文档.md`）但无台账 → 第一个派的活就是 `/dev-loop`（不带编号 = 第 0 轮自举，按 `writing-plans` 拆台账并提交 `docs(tasks)`），跑完再进正式循环。
   - 需求、台账都没有 → 停下提示：「先走 `/kickoff` 或准备好需求 + 任务清单」。
4. **工作区**：`git status -s` 记下已有未提交文件 = 他者占用区（L1 协议），任务书里原样告知子会话「别碰这些」。
5. **总控保活**：提醒用户——若智码开了会话自动清理，请把本会话锁定 / 置顶，否则子会话跑完的唤醒无处投递。
6. **`.agent-pipeline/` 不入库**：框架 `.gitignore` 已忽略它；孵化项目若删掉了这一行，提醒用户补回（总控不改 `.gitignore`，那是项目配置）。

## 三个角色

| 角色 | 谁 | 做什么 | 不做什么 |
|------|----|--------|---------|
| **总控** | 本会话 | 选任务、派活、读结论、裁决、维护 `.agent-pipeline/state.json` | 不写业务代码、不跑 `pnpm build` / 测试、不复跑子会话跑过的验证、不点页面、不起 dev server（保持上下文轻；要实测就派一个实测子会话） |
| **实现方** | `claude-code` 子会话（每批新开） | 跑 `/dev-loop T<起>-T<止> [ORCH:<总控id>]`：批内逐条 实现 → 验证门 → `/check` → 勾台账 → **规范提交**（一条一个提交） | 不续期、不做批外的任务 |
| **验收方** | `codex` 子会话（按「验收方式」派，每次新开；未装 Codex 回落 `claude-code`） | 只读审 `<基线>..HEAD` 的提交，给出 `VERDICT: PASS / REJECT` | 不改业务文件、不提交 |

> **提交策略（已定）**：实现方先提交、验收方审提交；驳回就追加 `fix(scope): …` 修复提交，不改写历史。
> 这样会话交接时工作区始终干净，不会触发 L2「15 分钟内未提交改动」打断。

## 验收方式（`--review=`，默认 `risk`）

验收查出的是真问题（本机编排统计：派了验收的编排里实现被退回返工 19%，没派的 5%），但它约占每个任务四成时间，
而且风险差别很大（实测页面类 8 条 0 驳回，同步 / 迁移 / SEO 类 9 条驳回 5 条）。所以默认按风险分级，不是每条都审：

| 方式 | 做法 |
|------|------|
| `risk`（默认）按风险分级 | 满足任一条的写入类任务**逐条**走第 5 步：对接外部数据源或跑 `data-sync` / 数据迁移、改 `src/content.config.ts`（集合 schema）或路由结构、动 SEO 结构（结构化数据 / sitemap / llms.txt / canonical）、改了 `.claude/framework-config.json` 列出的框架核心文件、实现超过 20 分钟或改了 15 个及以上文件。其余（页面、组件样式、文案、内容条目）记进 state.json 的 `pendingReview`（连同各自基线），攒到 3–5 条或里程碑收尾时**合并派一次**验收 |
| `each` 逐条 | 每个写入类任务都走第 5 步 |
| `final` 只在最后 | 中间任务过了第 4 步就记完成；本次范围全部做完后派一次整体验收，范围 `<startBaseline>..HEAD` |
| `none` 不派验收 | 不派验收方；第 4 步额外核对 `ORCH-RESULT` 写着验证门已绿（`/dev-loop` 自带验证门 + `/check`），缺了就按第 6 步驳回；收尾汇报写明「本次未经独立验收」，并列出建议人工重点看的地方 |

方式写进 state.json 的 `reviewMode`，上下文压缩后照它继续。合并 / 整体验收的任务书把这几条任务原文列全、审查范围改成对应区间（`<最早基线>..HEAD`）；
被驳回时按问题清单定位到具体任务，返工与复审照第 6 步走，不受方式影响。

## 每一批的标准流程

1. **选任务并组批**：读台账（按范围过滤），从「## 🎯 实现步骤」区块里按编号第一个未勾、且 `依赖:` 都已完成的 `- [ ] T<数字>` 起，往后取**相邻**的几条组成一批，记下各条的 `读写:` 字段和 `基线 = git rev-parse HEAD`，写入 state.json。首批时另记 `startBaseline`（= 编排开始时的 HEAD，整体验收的范围靠它）。
   - **组批规则**：同一里程碑、依赖都在批内或已完成、预计合计 **20–45 分钟**（页面 / 组件样式 / 文案 / 内容条目这类通常 3–6 条一批）。满足「验收方式」里 `risk` 高风险条件的任务**单独成一批**，不和别的混；只读任务可以和相邻只读任务成批，不和写入任务混。
   - **为什么按批**：一条一个子会话时，每条都要付一次冷启动（重载 CLAUDE.md + 技能表 + 重读真相源，约 1–3 分钟、十几万 token）外加一次总控醒来处理；小任务上这部分比干活还长。2026-10-29 按批派 35 条任务 3 小时 50 分钟做完，子会话之间几乎无空档；此前逐条派 + 逐条验收，一条小任务走完常要 40–60 分钟。
   - **粒度**：该条预计超过 60 分钟、要改 15 个及以上文件、或任务书要写到 5000 字以上 → 先派一个子会话把它在台账里拆成几条（按台账编号规则追加、提交 `docs(tasks)`），再按拆后的条目推进。实测这一档返工率 22%、会触发上下文压缩；改 ≥15 个文件返工 18%，1–14 个只有 3–6%。
2. **派实现方**：
   ```
   start_agent_session(project_path=<项目根>, provider_id="claude-code", title="实现-T12-T15",
     prompt="/dev-loop T12-T15 [ORCH:<yourSessionId>]", label="实现-T12-T15", timeout_min=90)
   ```
   批里只有一条时写 `/dev-loop T12 [ORCH:…]`。返回 `watching=true` = 已替你登记等待（`supervision` 缺省即 orchestrate），**不必再调 `watch_session`**；`watching=false`（系统拿不到你的身份）才补 `watch_session(watch_session_ids=[<实现方id>], notify_session_id=<yourSessionId>, label="实现-T12-T15", timeout_min=90)`。
   然后**立刻停下**，不轮询、不读 transcript。
3. **被 `[AGENT-EVENT]` 唤醒后按 status 分流**：
   - `idle` → 进第 4 步
   - 回执里写着「还有 N 个后台任务没回来 · 系统已替你续挂了一个跟进等待」→ 它在等自己起的构建 / 子代理，**别催、别重派、不用重新 watch**，等下一条回执（那一轮才有真结果）
   - `stalled` / `stale` / `timeout` → `get_session_status` 看 state：`awaiting-input` → `control_session(action=key)`；`context-full` → `continue`；`crashed` → `restart`；跑飞 → `interrupt`；处置后**重新 watch**
   - `rate-limited` → 什么都别做（智码在换档案），重新 watch 等它续跑
   - `dead` → `open_session` 拉起后重新 watch；`resumed` → 必须读 transcript 核实到底跑完没有
4. **核实产出（不凭猜测，判据同 `CLAUDE.md`「编排完成判据」）**：
   - 先看回执末尾的回复摘录：收尾小结（`ORCH-RESULT` 行，**批里每条一行**）在摘录里就直接用，**不读 transcript**；摘录里没有或行数不够才 `read_session_transcript(id, grep="ORCH-RESULT")`
   - **按条核实、按条处置**：下面几条对批里每条任务分别判；某条没完成只把**那一条**退回或另派，已完成的照常记完成，不整批返工
   - **写入类任务**：台账该条已 `[x]`，且 `git log <基线>..HEAD --oneline` 有新提交（类型按「提交与进度口径」，如 `feat` / `fix` / `docs(tasks)` / `chore(data)`）→ 按「验收方式」定：这一条要逐条验收就进第 5 步；否则记进 `pendingReview`（`risk`）或直接记完成（`final` / `none`）；批里各条都处置完再回第 1 步组下一批
   - **只读任务**（`读写: 只读`）：台账该条已 `[x]` 且收尾行 `status=done` → 总控读任务卡里的结论核对是否回答了任务问题，**不派验收方**，直接记完成（有问题按第 6 步驳回）
   - `status=blocked` → 读 `docs/BLOCKERS.md` 里该任务的 `[需决策]` 行，按「熔断与决策分流」处理（记下、跳过依赖它的任务、接着派别的，不为它单独停下）
   - 没勾 / 该有提交却没有 / 小结写「验证门未绿」→ 视为驳回一次，按第 6 步返工
5. **派验收方（逐条验收的任务每条一次；合并 / 整体验收一次审多条；必须另开，禁止复用实现方）**：
   ```
   # 任务书写进 .agent-pipeline/review-T12.task.md，prompt 只发单行
   start_agent_session(project_path=<项目根>, provider_id="codex", title="验收-T12",
     prompt="请阅读并严格执行 .agent-pipeline/review-T12.task.md 中的验收任务（只读审查），结论写入 .agent-pipeline/review-T12.result.md",
     label="验收-T12", timeout_min=45)
   ```
   （`watching=false` 时同第 2 步补 `watch_session`。）
   - 🔴 **验收方不可用就立刻回落，不等**：未装 Codex、Codex 额度用完、起来几秒就退出（`stalled` / `crashed`）、或连续两次起不来 → 同样的单行 prompt 改 `provider_id="claude-code"` 另开，state.json 记 `reviewerProvider`。实测等 Codex 额度恢复白等过 4 小时，期间没有任何子会话在跑。

   🔴 **任务书与结论一律走文件**：多行 prompt 派给 Codex 会卡在输入框不提交；`read_session_transcript` 读不到 Codex 正文；Codex 跑完的唤醒事件常报 `unknown` / `awaiting-input`（其实已跑完）。所以：
   - 被唤醒后**先看结论文件**：`review-T12.result.md` 存在且末行是 `VERDICT:` → 直接裁决，无视事件里的 state。
   - 结论文件不在 + state=`awaiting-input` 且 stopDetail 是 prompt 原文 → `control_session(action=key, key=enter)` 补回车，**隔 10 秒再** `watch_session`（立刻登记会被误判 alreadyIdle）。
   - 结论文件不在 + 其他状态 → 等 watch 超时兜底，或请用户去该 Tab 看一眼。

   验收任务书必须写全（Codex 没有本项目斜杠命令，全靠任务书），但**通用部分只写一次**：本次编排第一次派验收前，把下面的「第一段 / 第二段 / 约束 / 输出」写进 `.agent-pipeline/review-checklist.md`；之后每份 `review-T12.task.md` 开头写「先读 .agent-pipeline/review-checklist.md 并逐条执行」，正文只写本任务的差异——任务原文与审查范围（下面第一条）+ 本任务特有的检查点。（实测每份任务书把同一段规范重抄一遍，平均 6.3K 字。）
   - 任务原文（台账该条的标题、`需求:`、`文件:`、`验证:` 与验收标准）+ 审查范围 `git diff <基线>..HEAD`
   - **第一段 · 功能正确性**：是否真达成目标；边界（空集合 / 单条 / 超长标题 / 无封面）、空态、有无回归（首页、列表、llms.txt、sitemap）
   - **第二段 · 框架规范**：
     - Astro 7 写法（`src/content.config.ts`、`z` 从 `astro/zod`、Zod 4、`render(entry)`、`entry.id`、无 `Astro.glob`）
     - 页面经 `BaseLayout`；不手写 `<head>` / canonical / og:url；JSON-LD 用 `serializeJsonLd()`
     - 宽度用 `Container`、区块用 `Section`、按钮用 `Button`；颜色只用语义令牌，品牌色文字用 `text-brand-ink`
     - island 只接收服务端算好的 props，不在客户端 `getCollection` / `getImage`；能静态就不水合
     - 页面只调 `src/lib/*` 查询封装；站内链接带结尾斜杠
     - 图片 `alt` 与 `width` / `height` 齐全；中文标题不用 `text-balance`
     - 孵化项目里改了 `.claude/framework-config.json` 列出的框架核心文件 → 必须单独提交且 scope 为 `framework`
     - 文件首行注释、UTF-8 无 BOM、commit 类型与 scope 符合 `CLAUDE.md`「提交与进度口径」
   - 约束：**只读**，可跑 `pnpm build` / `pnpm check:seo` / `pnpm test` 核实（此时没有别的会话在构建），不改仓库文件、不提交；唯一允许写的是结论文件
   - 输出：写入 `.agent-pipeline/review-T12.result.md`，先列 `文件:行 — 问题 — 建议`，每条标「阻断」或「非阻断」（无问题写「无」）；**只有存在阻断项才判 REJECT**（数据损坏 / 安全凭据 / 真实计费 / 核心流程走不通一律算阻断），只有非阻断项时判 PASS 并照常列出；最后一行单独 `VERDICT: PASS` 或 `VERDICT: REJECT`
6. **裁决**：
   - `PASS` → state.json 记完成，回第 1 步组下一批。结论里列了非阻断项的，原样记进 state.json 的 `leftovers`（带任务编号），**不单开加固任务、不返工**——里程碑边界 / 全部 `[x]` 时合并处理（见「里程碑与收尾」）。实测按建议项一条条开加固、加固完再验一轮，比实现本身还耗时
   - `REJECT` → 驳回计数 +1，把问题清单原样转给返工方：
     - 实现方 `contextPercent < 50` → `send_to_session(实现方id, 驳回意见 + "按意见修复，过验证门后追加 fix(scope) 提交")`
     - 否则另开 `claude-code` 子会话（同样带 `project_path`），任务书 = 任务原文 + 驳回意见 + 同样的提交要求
     - 返工完成后复审：验收方 `contextPercent < 50` 就 `send_to_session` 让它审新增提交，否则另开验收方
7. 每批结束输出一行：✅ T12–T15 通过（驳回 N 次，卡住的列编号）| 📊 X/总（只数 `T<数字>` 任务行）| ⏭️ 下一批。

## 里程碑与收尾

- **完成一个里程碑（`里程碑:` 字段相同的任务全部 `[x]`）/ 一个模块**：`risk` 方式下先把 `pendingReview` 里剩下的任务合并验收掉；`leftovers` 非空就合并派一个实现子会话处理（任务书 = 遗留项原文 + 「按意见修复，过验证门后追加 fix(scope) 提交」），修完随下一次合并 / 整体验收一起复核；再派一个子会话跑 `/update-status`（总控不自己跑，避免上下文膨胀），watch 等它提交。
- **全部 `[x]`**：先把 `leftovers` 合并处理掉（同上；拿不准该不该修的列进最终汇报交用户定），`risk` / `final` 方式再派一次整体验收（范围 `<startBaseline>..HEAD`，重点看任务之间的衔接），通过后再往下；`none` 方式在最终汇报里写明「本次未经独立验收」。然后派 `/update-status` 汇总三文档 → 再派一个子会话跑 `/seo-check --local` → 输出「✅ 全部计划功能已实现」+ 各任务驳回次数 + 熔断记录，结束编排。

## 熔断与决策分流

- **同一任务驳回达 2 次** → 停止编排：在台账该条下补一行 `⚠️ 编排熔断：<验收意见摘要>`，报告用户（错误原文 + 判断 + 建议）。
- **连续 3 个任务无实质进展**（无新提交 / 反复 stalled）→ 停止并报告。
- 实现方报 `status=blocked`，或 `docs/BLOCKERS.md` 出现未勾的 `[需决策]` 行 → **不停整个编排**：该任务记进 state.json 的 `blocked`，跳过依赖它的任务，接着派别的。问题**攒起来一次问**：到里程碑边界、或已经没有不依赖答案的任务可派时，把攒下的几条合成一条消息问用户（每条写清选项和你的推荐）。用户决定后把该行勾成 `[x]`，再重派该任务。不替用户拍板的仍是不可逆 / 合规 / 缺凭据 / 架构级这几类。
- **有推荐项、而且能回滚的决定直接按推荐项做**（文案措辞、默认值、两种都行的实现方式之类）：记进 state.json 的 `decidedForUser`（任务编号 + 决定 + 理由），收尾汇报里列出来给用户过目，不为它停下。（实测用户对这类问题多半回「都选你的推荐项」，等这一句常常要几十分钟到一夜。）
- **除以上几种情况，不停下来问人**：任务之间、里程碑之间照常往下派，不请示「要不要继续」（实测 60 次这样的长等待里 11 次本可自主继续，白等 9.3 小时）。
- 真要问时：先把不依赖答案的下一条派出去再问；**有子会话在跑时不用 AskUserQuestion**——选项菜单挂着时回执会扣在菜单后面，你答之前一条都进不来，改用普通文字把问题写清楚。

## 状态恢复（上下文被压缩后）

`.agent-pipeline/state.json`（不入库，只存调度信息，**进度真相源仍是台账**），每次派活 / 裁决后更新：

```json
{
  "orchestratorSessionId": "…", "scope": "M2", "reviewMode": "risk", "startBaseline": "<sha>",
  "current": { "taskIds": ["T12", "T13", "T14", "T15"], "rw": "写入", "phase": "implement|review|fix", "baseline": "<sha>",
               "implementerSessionId": "…", "reviewerSessionId": "…", "rejections": 1 },
  "pendingReview": [{ "taskId": "T13", "baseline": "<sha>" }],
  "leftovers": [{ "taskId": "T12", "item": "<验收列出的非阻断项原文>" }],
  "decidedForUser": [{ "taskId": "T14", "decision": "<按推荐项定了什么>", "why": "<理由>" }],
  "done": ["T10", "T11"], "fused": [], "blocked": []
}
```

压缩后恢复：读 state.json + `get_session_status`（`childSessionIds` 是系统记的派活拓扑）→ 对当前任务的子会话查 state → 该 watch 的重新 watch。

## 红线

- 🔴 **改代码的子会话同一时刻只能有 1 个**（共用一个 git 仓库和构建产物 `dist/`，同一目录并行 `astro build` 会搅乱内容缓存）；只有不构建的只读活（调研 / 读代码审查）可以并行。
- 🔴 **每次派活后确认已登记等待**（watcher 一次性，触发即失效）：`start_agent_session`、以及发给自己子会话的 `send_to_session` 返回 `watching=true` 即已登记，`false` 才补 `watch_session`；**不传 `replace_existing=true`**；不写轮询循环。
- 🔴 判断子会话死活只信 `get_session_status`，不拿 transcript 内容推断。
- 「实现 → 验收」必须另开会话；验收方不看实现方的自辩，只看任务原文 + diff。
- 总控不 kill 进程、不关 Tab；dev server 由实现方用 `resolve_and_start_task(command="pnpm dev")` 起（智码托管，跨子会话存活）。
- 子会话默认全自动权限（`cli_args` 省略），红线靠 `CLAUDE.md` + `/dev-loop` 约束——所以任务书里**不许**放宽任何项目禁令。
- 不 `git push`，也不为推送停下来问（收尾汇报列出未推送的提交，由用户自己推）；仓库私有；反捏造（验收意见、完成度以 diff 与验证门结果为准）。
- 严守 `.claude/PROJECT.md` / `CLAUDE.md` 项目禁令（**PROJECT.md 优先级最高**）。
- 🔴 **总控不亲自下场干重活**：编排期间用户插进来的活（更新数据、浏览器抓取 / 操作、排查线上问题、大段读写文件）一律派子会话（`start_agent_session`，任务书写清用户原话、目标与边界），或请用户在新会话里跑；总控只转述结果、按结果调度。总控自己只做调度、裁决、记账这类轻动作。（2026-10-23 实录：总控亲自做浏览器抓取，上下文涨到 3000+ 条后判断退化——反复给三选一、漏抓关键页、未核实就说「数据还在」、为补 1 条视频自行新开开发任务。）
- 🔴 **用户插话先对齐目标、按最小动作做**：先用一句话复述「你要的是 X」（如「只补最新那 1 条」），再选最小的做法；要新增台账任务、改代码、放宽限制这类决定，先说一句再派，不先斩后奏。用户追问同一件事第二次，说明上一轮没对准目标——停下重新复述，不在原方案上加码。
- 总控自己的 `contextPercent`（`get_session_status` 里 `isYou` 那条）超过 70 时：收尾手上的裁决、更新 state.json，建议用户开新会话接着 `/dev-orchestrate`（按「状态恢复」接上），不在膨胀的上下文里继续调度。

## 与相邻能力的边界

| 能力 | 角色 |
|------|------|
| `/loop /dev-loop` | 单会话自主循环（通用、省 token，任何环境可用） |
| **/dev-orchestrate**（本命令） | 智码内的多会话编排：总控调度 + 实现方按批跑 `/dev-loop` + 异构验收 |
| `/dev-loop T<编号>` / `T<起>-T<止>` | 一个任务（或一批相邻任务逐条）的标准作业（两种模式共用） |
| 智码「协同编排」弹窗 | 通用编排（不懂本项目规范）；意图不固定的长任务用 `/loop-gen` 生成弹窗变量 |
