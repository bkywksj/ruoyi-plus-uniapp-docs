---
name: exp-sediment
description: 把会话与近期提交里的踩坑、纠正、重复模式沉淀到技能 / CLAUDE.md / PROJECT.md / 经验文档，也用来查以前怎么处理过；/exp 的执行指南。触发词：沉淀经验、经验沉淀、总结会话、记下来、记录经验、新增禁令、避免再踩坑、以前怎么处理、之前踩过、有没有遇到过、/exp
---

# 经验沉淀指南（Experience Sedimentation）

## 何时使用

产出经验（写入）：
- 用户说「沉淀经验 / 总结本次会话 / 把这个记下来」「这个以后还会遇到 / 避免下次再踩坑」
- 会话末尾用户询问「有什么可以沉淀的」
- 需要从 git log 中抽取可复用模式、识别现有技能的漏洞并补强
- 需要审计经验资产健康度（过时 / 冗余 / 孤岛），即 `/exp review`

消费经验（读取）：
- 用户说「以前怎么处理 / 之前的方案 / 之前踩过 / 上次怎么解决 / 有没有遇到过类似问题」
- 用户说「查一下记录 / 查笔记 / 查沉淀」；解决问题前希望先看历史踩坑记录

## 概述

本技能是 `/exp` 命令的详细执行指南。它解决一个关键问题：**每次会话产生的隐性知识（踩坑心得、反复纠正、重复模式）如果不主动沉淀，就会随会话结束而蒸发**。

本技能把这些隐性知识按 6 类分类，分发到正确的去向（Skills / CLAUDE.md / PROJECT.md / Memory / 经验文档 / Commands），并在子项目下提供**反哺框架**的机制。

**适用仓库**：
- **框架仓库**（next-ai-astro 本体）：沉淀通用经验，随 `framework-sync` 同步到下游
- **子项目仓库**（由框架孵化的业务项目）：沉淀业务经验，同时识别「应反哺到框架」的候选

**核心理念**：
- **Why 优先**：每条经验必须带「为什么」，否则是僵尸经验
- **优先更新不优先新建**：补强现有技能 > 新建技能，避免技能膨胀
- **交互式确认**：用户是最终决定者，模型只负责识别和建议

---

## 仓库模式识别

### 判定规则（每次都现场判断，不读缓存）

```
1. 项目根有 .framework-sync.json                         → subproject（孵化出的子项目）
2. 否则 package.json 的 name = next-ai-astro             → framework（框架仓库本身）
3. 两条都不满足（手工拷贝、改了名却没有同步记录）          → 问用户；通常是子项目，
   建议先按 framework-sync 的「首次配置」补一份 .framework-sync.json
```

与 `.claude/framework-config.json` 的 `modeDetection` 一致。仓库身份只由这两个文件决定：`.framework-sync.json` 随子项目入库，
`package.json` 的 name 在孵化时由 project-init 改掉，所以同一套规则在两边都不会误判。

### `.claude/exp.config.json`：本机缓存，不决定模式

该文件已加入 `.gitignore`，只缓存「模式判定之外」的本机信息，缺了就按需重建：

```json
{
  "frameworkRepo": "<框架仓库地址或本机路径；子项目反哺时用>",
  "knownSubprojects": [
    { "name": "project-a", "path": "../project-a" }
  ],
  "updatedAt": "2026-09-26T10:00:00+08:00"
}
```

- 🔴 不要往里写 `mode` 字段，也不要根据它判断模式：它曾经入库过，孵化时会被带进子项目，导致子项目按框架模式改框架文件
- `knownSubprojects` 只在框架模式下的 `/exp review` 用（见下文）

### 模式差异表

| 维度 | framework 模式 | subproject 模式 |
|------|--------------|----------------|
| 新技能 | `.claude/skills/<名>/`（委托 add-skill） | 同样放 `.claude/skills/<项目前缀>-<名>/` 并登记 hook（委托 add-skill）；加项目前缀避免与框架以后新增的技能撞名 |
| 现有技能漏洞 | 直接改 `.claude/skills/<名>/SKILL.md` | 框架原有技能**不改**，写进 `feedback-to-framework.md`；本项目自己新增的技能可以直接改 |
| 禁令 / 规范 | 根 `CLAUDE.md`（「绝对禁止的写法」「Bash/Shell 禁止项」「Astro 7 版本红线」等表） | `.claude/PROJECT.md`（CLAUDE.md 规定会话开始时读它，优先级高于通用规则） |
| Memory | Claude Code 自动记忆目录（见下方注解） | 同左 |
| Codex 镜像 | 改完技能 / 命令后 `pnpm agents:sync` | 同左（子项目也带着 `.agents/` 和 `check:skills`，不同步会校验失败） |
| 反哺机制 | 审阅子项目的反哺清单 | `.claude/docs/experience/feedback-to-framework.md` |
| 只读 | — | 根 `CLAUDE.md`、框架原有的 `.claude/skills/*`（它们由 `/framework-sync` 维护） |

> **Memory 实际路径**：不在仓库内，而在 `C:\Users\<user>\.claude\projects\<project-slug>\memory\`（Windows）或 `~/.claude/projects/<project-slug>/memory/`（macOS/Linux）。
> `<project-slug>` 是项目绝对路径里所有非字母数字字符都换成 `-` 的结果，例如 `E:\my\AI工作站` → `E--my-AI---`。两个模式都使用同一位置；下文「目录结构参考」里画在仓库内的 `memory/` 只是逻辑示意。

---

## 六类经验的识别信号与去向

### ① 新技能候选

**识别信号**：
- 同类问题在会话中反复出现 ≥ 2 次
- 现有技能（`ls .claude/skills/` 查看清单）的 description 均无法覆盖
- 用户暗示「这块我们之前没有成熟做法」

**判断清单**：
- [ ] 查过 `.claude/skills/` 列表，无重叠
- [ ] 能提炼出至少 3 个具体触发场景
- [ ] 内容足够形成 200+ 行文档（否则应并入现有技能）

**去向**：委托 add-skill 创建 `.claude/skills/<名>/`，登记 hook 清单，`pnpm agents:sync && pnpm check:skills`。子项目加项目前缀。

**重要**：优先考虑「现有技能漏洞」（②）而非新建。新建门槛应严格。

---

### ② 现有技能漏洞

**识别信号**：
- 会话中激活了某技能但仍答错
- 用户补充了该技能文档里没有的规则
- 某技能缺少常见边界场景说明

**判断清单**：
- [ ] 定位到具体哪个技能
- [ ] 找到该技能内应该插入的章节
- [ ] 有明确的「为什么」理由（而非「感觉更好」）

**去向**：
- framework：Edit `.claude/skills/<名>/SKILL.md` → `pnpm agents:sync` → `pnpm check:skills`
- subproject：框架原有技能 → 追加到 `.claude/docs/experience/feedback-to-framework.md`，不直接改；本项目新增的技能 → 同 framework

**写入模板**：
```markdown
## {章节名}（建议插入在「常见错误」或「标准做法」下方）

### {具体问题/规则}

**错误做法**：{代码/配置}

**正确做法**：{代码/配置}

**Why**：{为什么必须这样，来源 - 引用会话/commit/bug}
```

---

### ③ 新禁令 / 规范

**识别信号**：
- 用户说「以后不要…」/「禁止…」/「永远别…」
- 用户纠正代码风格（命名、格式、引用方式）
- 用户补充了一条「看似显而易见但容易忘」的规则

**判断清单**：
- [ ] 是普适规则（不是一次性修复）
- [ ] 有对应的「错误写法」可举例
- [ ] 不与现有禁令重复

**去向**：
- framework：
  - 页面 / 组件 / 数据 / SEO 通用禁令 → `CLAUDE.md` 的「绝对禁止的写法」表
  - Astro 旧写法 → `CLAUDE.md` 的「Astro 7 版本红线」表
  - Bash/Shell 禁令 → `CLAUDE.md` 的「Bash/Shell 禁止项」章节
  - 特定领域（如数据同步）→ 对应技能的「常见错误」章节
  - `AGENTS.md` 有同名章节时一并同步
- subproject：`.claude/PROJECT.md`（通常由 project-init 生成；不存在时先创建）

**写入模板**（禁止表新行）：
```markdown
| **{分类}** | `{错误写法}` | `{正确写法}` |
```

并在相关章节补一条 Why 说明（简短）：
```markdown
> **Why {禁令名}**：{原因，例如「Windows 下 > nul 会在某些 Shell 环境里创建名为 nul 的普通文件」}
```

---

### ④ 用户偏好 / 项目事实（Memory）

**识别信号**：
- 用户描述自己的工作习惯
- 用户透露项目约束（客户 / 部署环境 / 历史债务）
- 用户明确说「记住这个」

**与禁令的区别**：
- 禁令是**普适规则**（任何人都适用）→ 写 CLAUDE.md / PROJECT.md
- 偏好 / 事实是**当前用户 / 项目特定的** → 写 memory

**判断清单**：
- [ ] 只对当前用户 / 项目有效
- [ ] 能在未来会话中用到
- [ ] 非临时状态（不是「今天想做 X」）

**去向**：记忆目录下的 `{type}_{slug}.md`，并在同目录的 `MEMORY.md` 索引里加一行

**类型选择**（Claude Code 自动记忆的四种类型）：
- `user` - 用户角色 / 偏好
- `feedback` - 用户纠正 / 确认的做法
- `project` - 项目上下文
- `reference` - 外部系统指针

**写入模板**：
```markdown
---
name: {memory 名称}
description: {一句话描述}
type: feedback | user | project | reference
---

{规则/事实本身}

**Why**：{原因}
**How to apply**：{什么场景触发}
```

---

### ⑤ 最佳实践文档

**识别信号**：
- 本次会话产出了完整的「怎么做」流程（多步骤）
- 内容不够通用到做成技能，但值得保存
- 是「一次性复杂解决方案」的全流程记录

**判断清单**：
- [ ] 多步骤（≥ 5 步）
- [ ] 涉及多个文件 / 模块
- [ ] 有独特的决策 / 权衡过程

**去向**：`.claude/docs/experience/YYYY-MM/YYYY-MM-DD-{主题}.md`

**写入模板**：
```markdown
# {主题}

**日期**：YYYY-MM-DD
**场景**：{为什么要做这件事}
**模式**：framework | subproject

## 问题

{要解决的具体问题}

## 方案选择

{对比了哪些方案，为什么选这个}

## 实施步骤

1. ...
2. ...

## 关键决策点

| 决策 | 选项 | 选择 | 理由 |

## 踩坑记录

| 问题 | 排查 | 解决 |

## 可复用部分

- [ ] 将来可以抽为技能的部分：...
- [ ] 纯一次性、不可复用：...
```

---

### ⑥ 高频命令候选

**识别信号**：
- 某组操作在一周内出现 ≥ 3 次
- 操作步骤多但固定
- 用户每次都要口述同样的流程

**判断清单**：
- [ ] 步骤 ≥ 5 且每次都相同
- [ ] 没有对应的现有命令
- [ ] 值得用户键入 `/xxx` 快速触发

**去向**：
- framework：`.claude/commands/<名>.md`（YAML 头写 `description`，≤ 120 字符）→ `pnpm agents:sync` → `pnpm check:skills`
- subproject：**慎重**——先观察，门槛比框架更高

---

## 执行流程详解

### Step 1 - 输入收集

```bash
# Git 信号（天数按参数，默认 7）
git log --since="7 days ago" --pretty="%h %s %an" --no-merges
git diff --stat
git status --short

# 任务信号
ls docs/tasks/active/ 2>/dev/null

# 去重基准：最近 3 次 /exp 沉淀过什么
ls -t .claude/docs/experience/*/*-exp-summary.md 2>/dev/null | head -3
```

> 会话开始时 CLAUDE.md 只要求读**最近 1 份**摘要（轻量上下文）；`/exp` 做去重时读**最近 3 份**，两者不冲突。

**会话 transcript 扫描**（模型自主）：
- 纠正信号：「不要」「禁止」「错了」「以后」「应该」「正确做法」
- 反复信号：同一关键词在会话中出现 ≥ 2 次；用户多次纠正同一错误（如同一个 Astro 7 写法写错两次、同一类 check:seo 错误反复出现）
- 惊讶信号：「原来」「没想到」「居然」

---

### Step 2 - 候选分类

对每个识别出的信号：

```
1. 加载 .claude/exp.ignore，slug 命中的候选直接跳过
2. 计算置信度（见下方评分表）
3. 选择类型（① ~ ⑥）
4. 确定建议去向
5. 子项目模式：标注归属（本项目专属 / 框架通用-反哺）
6. 对照去重基准，已沉淀的跳过
```

**置信度评分表**：

| 证据 | 分值 |
|------|-----|
| 用户明确说「记住 / 以后 / 不要 / 必须」 | +3 |
| 同类信号出现 2 次以上 | +2 |
| 仅 1 次出现 | +1 |
| 有清晰的 Why 描述 | +1 |
| 能映射到具体文件 / 技能 | +1 |
| 有对应的 commit 支持 | +1 |

**阈值**：
- ≥ 5：**高**（用户选 [B] 时可在本次会话里直接写入）
- 3-4：**中**（逐项确认）
- 1-2：**低**（默认跳过，除非用户全选）

---

### Step 3 - 候选表展示

格式见 `.claude/commands/exp.md` 第三步。关键字段：摘要（一句话）、类型编号（①～⑥）、置信度、建议去向（具体文件路径）、归属（子项目模式额外列）。

**展示上限**：最多 10 条。超出部分压缩到一条「其他观察」。

选项：[A] 逐项确认（推荐）/ [B] 高置信直接写、中低逐项问 / [C] 只沉淀高置信 / [D] 全部跳过。
[B] 是用户在本次会话里当面授权批量写入，不是无人值守的自动模式。

---

### Step 4 - 逐项确认

每条候选展示：

```markdown
## 候选 #N：{摘要}

**原始信号**：{引用会话/commit 原文}
**类型**：{①~⑥}
**置信度**：{高/中/低}
**建议去向**：{文件路径 + 章节}

**预览写入内容**：
---
{完整的即将写入的内容}
---

**Why**（必填）：{为什么值得沉淀}

操作：
[Y] 写入   [E] 编辑后写入   [S] 跳过   [M] 换个去向   [W] Why 不够清晰，需要补充
```

**关键约束**：
- **Why 缺失或模糊** → 必须走 `[W]` 补充，不允许直接写入
- **归属不确定**（子项目）→ 必须让用户选择

---

### Step 5 - 分发执行

| 类型 | framework 模式 | subproject 模式 |
|------|---------------|----------------|
| ① 新技能 | 按 add-skill 完整执行：YAML 头、正文、登记 hook 清单、`pnpm agents:sync`、`pnpm check:skills` | 同左，技能名加项目前缀 |
| ② 技能漏洞 | Edit `.claude/skills/<名>/SKILL.md` → `pnpm agents:sync` → `pnpm check:skills` | 框架原有技能：追加到 `feedback-to-framework.md`；本项目技能：同左 |
| ③ 新禁令 | Edit `CLAUDE.md` 对应的表（`AGENTS.md` 有同名章节时一并改）；特定领域改对应技能的「常见错误」 | Edit `.claude/PROJECT.md`（不存在先创建） |
| ④ Memory | Write 记忆文件 + 更新 `MEMORY.md` 索引 | 同左 |
| ⑤ 文档 | Write `.claude/docs/experience/YYYY-MM/YYYY-MM-DD-{slug}.md`（按月分目录） | 同左 |
| ⑥ 新命令 | Write `.claude/commands/<名>.md` → `pnpm agents:sync`（生成 `.agents/skills/<名>/SKILL.md` 并更新 AGENTS.md 命令索引）→ 需要参与自动评估时再加进 hook 清单 → `pnpm check:skills` | 先观察 |

---

### Step 6 - 摘要归档

**必须**写入 `.claude/docs/experience/YYYY-MM/YYYY-MM-DD-exp-summary.md`（文件名以 `-exp-summary.md` 结尾，CLAUDE.md 约定会话开始时读最近一份）：

```markdown
# /exp 沉淀摘要 - {YYYY-MM-DD HH:MM}

**仓库模式**：{framework | subproject}
**扫描范围**：会话 + 最近 N 天 commits
**识别候选**：X 条　**已沉淀**：Y 条　**已跳过**：Z 条

## 已沉淀

| # | 摘要 | 类型 | 去向 | 置信度 |
|---|------|------|------|-------|
| 1 | {摘要} | ③ 新禁令 | CLAUDE.md#Bash禁止项 | 高 |

## 仍需遵守的禁令 / 踩过的坑（给下次会话读）

- {一句话规则 + 原因}

## 已跳过

| # | 摘要 | 跳过原因 |
|---|------|---------|
| 3 | {摘要} | 置信度不足 |

## 反哺候选（仅子项目）

追加到 `.claude/docs/experience/feedback-to-framework.md` 的条目数：N

## 可能需要后续关注

- {待观察的模式，当前置信度不足，需要后续验证}
```

时间用裸 `date '+%Y-%m-%d %H:%M'`（CLAUDE.md 时区约定）。

提交：逐个 `git add` 本次写入 / 修改的文件 → `git commit -m "docs(exp): 沉淀 {N} 条经验"`（不计入业务进度）。
改了技能 / 命令的，技能改动与经验文档可以放同一个提交，也可以按 CLAUDE.md「功能与注释分开提交」拆开。

---

### Step 7 - 反哺提示（子项目模式专属）

若本次有「框架通用」归属的候选：

```markdown
🔁 反哺提示

本次追加 N 条通用经验到：
  .claude/docs/experience/feedback-to-framework.md

下次在框架仓库运行 `/exp review` 时，会读取 exp.config.json 里 knownSubprojects 登记的子项目反哺清单，
由你决定是否合并进框架的 .claude/skills/ 或 CLAUDE.md。
```

子项目还没登记在框架的 `knownSubprojects` 里时，提醒用户在框架仓库的 `.claude/exp.config.json` 里加一条（本机路径）。

---

## /exp review 子命令（盘点模式）

### 用途

定期审计经验资产健康度，避免「沉淀—遗忘—腐化」。

### 检查维度

#### 1. 过时技能

技能内容与当前代码 / 依赖版本是否还一致（如 Astro 升级后 API 已变、技能里的路径已不存在）：

```bash
pnpm check:skills          # 会列出技能里引用了不存在路径的警告
```

**输出建议**：精简（删除过期章节）/ 合并（两个相似技能合并）/ 淘汰（整个技能过时，归档到 `.claude/docs/experience/archive/`）。
没有技能激活频率的统计数据，不要凭印象判断「很久没用」。

#### 2. 冗余重叠

语义相近的技能对（关键词 / 描述高度重叠）：
- 示例：`seo-meta` ↔ `geo-optimization`（结构化数据、robots 归谁）
- 示例：`bug-detective` ↔ `performance-doctor`（「页面慢」算 Bug 还是性能）

**输出**：重叠报告 + 建议的边界澄清（写进双方的「与相邻技能的边界」章节）。

#### 3. 孤岛经验

```bash
# .claude/docs/experience/ 中超过 3 个月未修改的文档
find .claude/docs/experience -name "*.md" -mtime +90
```

**输出**：列出孤岛文档，建议提炼为技能 / 归档到 `archive/` / 直接删除（已完全过时）。

#### 4. 反哺候选（框架模式专属）

读 `.claude/exp.config.json` 的 `knownSubprojects` 里每个子项目的 `.claude/docs/experience/feedback-to-framework.md`（只读；路径不存在就跳过并提示），聚合、去重，输出合并建议。
没有登记任何子项目时，请用户提供路径，或跳过本项。

#### 5. Memory 腐化

检查记忆条目里引用的文件 / 函数是否仍存在（例如 memory 提到某个 src/lib 下的查询函数，但该文件已被删除或改名）：

```bash
grep -rn "src/\|scripts/" <记忆目录>/*.md        # 找出引用了路径的条目，逐个核对是否还存在
```

**输出**：腐化条目列表 + 建议删除 / 更新。

### 输出路径

`.claude/docs/experience/review-reports/{YYYY}-Q{N}-audit.md`

---

## 防止过度沉淀

### 规则 1：推荐上限

每次 /exp 最多展示 **10 条候选**。超出的压缩为一条：
```
| N+1 | 其他观察（共 X 条低置信信号） | 混合 | 低 | .claude/docs/experience/raw-observations.md |
```

### 规则 2：连续跳过降级（持久化在 `.claude/exp.ignore`）

某条候选在连续 2 次 /exp 中都被识别出来、又都被跳过 → 追加到 `.claude/exp.ignore`，以后不再推荐。

**文件格式**：纯文本，每行一条，`#` 开头为注释。每条形如 `<候选slug> | <最后一次跳过日期 YYYY-MM-DD> | <原因摘要>`：
```
# 自动维护 - 由 /exp 在用户连续两次跳过同一候选时追加
trailing-slash-reminder | 2026-09-15 | code-patterns 已覆盖站内链接结尾斜杠
lucide-icon-size-rule | 2026-09-22 | 用户认为按设计稿调整即可，不需要成文规则
```
读取规则：每次 /exp 分类前加载本文件，按第一列 slug 与新识别的候选比对，命中则跳过。
该文件随仓库提交（它记录的是本仓库的决定）；用户想恢复某条推荐时删掉对应行即可。

### 规则 3：摘要文档清理

当 `.claude/docs/experience/YYYY-MM/` 中的摘要超过 20 个 → 提示执行 `/exp review` 做季度整合。

### 规则 4：敏感信息过滤

以下内容**自动跳过**，不沉淀：
- 包含 token、password、secret、key 的字符串，`.env` 里的值
- 看起来像真实用户数据（邮箱、手机号、身份证）
- 商业敏感信息（客户名、合同金额）

### 规则 5：一次会话最多一次 /exp

---

## 常见陷阱

### 陷阱 1：沉淀了没有 Why 的规则

**症状**：半年后读到某条禁令，不知道为什么，不敢删也不敢改。
**预防**：每条候选强制要求 Why，不完整的走 `[W]` 分支要求用户补充。

### 陷阱 2：新建技能而不是改现有技能

**症状**：技能数无序膨胀，用户激活时困惑「用哪个」。
**预防**：① 类候选必须先检查「能否归并到现有 ② 类」；新建门槛是「内容 ≥ 200 行 + 独立领域」。

### 陷阱 3：子项目污染框架

**症状**：子项目的业务规则被写进了根 CLAUDE.md 或框架原有技能，下次 framework-sync 时冲突、或被框架版本覆盖。
**预防**：子项目模式下根 `CLAUDE.md` 与框架原有技能**只读**；业务规则写 `.claude/PROJECT.md`，通用经验写 `feedback-to-framework.md`。

### 陷阱 4：重复沉淀同一条

**症状**：同一条规则在 CLAUDE.md、技能、Memory 多处出现，彼此还略有不同。
**预防**：分发前先查找是否已有同类内容（grep 摘要关键词），命中则走「更新」而非「新增」。

### 陷阱 5：沉淀了一次性修复

**症状**：某 bug 的具体修复方法被写进禁令表，下次遇到类似场景反而造成误导。
**预防**：③ 类判断清单必须包含「是普适规则（不是一次性修复）」。一次性修复走 ⑤ 类（文档）。

### 陷阱 6：按缓存判断仓库模式

**症状**：子项目里的 /exp 把规则写进了根 CLAUDE.md 和框架技能。
**原因**：旧版把 `mode` 写在入库的 `exp.config.json` 里，孵化时被带进子项目。
**预防**：每次按「仓库模式识别」的判定规则现场判断，缓存文件不参与。

---

## 目录结构参考

```
.claude/
├── commands/
│   └── exp.md                            # 命令入口
├── skills/
│   └── exp-sediment/
│       └── SKILL.md                      # 本技能
├── exp.config.json                       # 本机缓存（gitignore，不决定模式）
├── exp.ignore                            # 永久跳过列表（随仓库提交）
└── PROJECT.md                            # 仅子项目：项目专属规则（project-init 生成）

.claude/docs/experience/
├── YYYY-MM/
│   ├── YYYY-MM-DD-exp-summary.md         # 每次 /exp 摘要
│   └── YYYY-MM-DD-{主题}.md              # ⑤ 类文档
├── feedback-to-framework.md              # 仅子项目：反哺候选
├── raw-observations.md                   # 低置信信号收集（如有）
├── review-reports/
│   └── YYYY-QN-audit.md                  # /exp review 输出
└── archive/                              # 过时文档归档

<Claude Code 记忆目录>/                    # 跨会话记忆（不在仓库内）
├── MEMORY.md                             # 索引
├── feedback_{slug}.md
└── project_{slug}.md
```

---

## 沉淀目录读取策略

### 三档读取深度

| 档位 | 读什么 | 何时触发 | 谁触发 |
|------|------|---------|------|
| **轻量** | 最近 1 份 `*-exp-summary.md`（子项目再加 `.claude/PROJECT.md`） | 每次新会话开始 | 根 `CLAUDE.md` 约定（自动） |
| **按主题** | 用关键词 grep 命中的具体文档 | 设计 / 排查时遇到「似曾相识」信号 | 模型主动判断 |
| **全量** | `.claude/docs/experience/` 全部 | 特定命令显式要求 | 用户输入命令 |

### 全量扫描的合法触发场景

只有以下命令 / 操作允许做全量扫描，避免无谓占用上下文：

1. **`/exp`** — 读最近 3 份摘要做去重
2. **`/exp review`** — 扫全部目录，做过时 / 冗余 / 孤岛 / 腐化审计
3. **`/start`** — 项目智能导航时，建议带一句「最近 N 次沉淀了 X」
4. **`framework-sync` 前**（子项目模式）— 读 `feedback-to-framework.md`
5. **跨子项目反哺整合**（框架仓库）— review 时聚合多个子项目的反哺清单

### 何时只需轻量读

以下场景**不需要**全量扫描，最近 1 份摘要已够用：
- 日常写页面 / 组件 — 核心禁令已沉淀到 CLAUDE.md / PROJECT.md / 技能 / Memory，由各自机制自动加载
- 单点 bug 排查 — 按关键词 grep 命中即可
- 普通对话、继续上次任务 — 最近摘要包含跳过 / 沉淀清单，足够定位

**一句话判断**：做决策（写代码 / 排查 / 设计）→ 按主题 grep；产出经验（沉淀 / 审计 / 反哺）→ 全量扫；普通对话 → 最近 1 份摘要即可。

---

## 与其他技能的边界

| 技能 | 联动方式 |
|------|---------|
| `add-skill` | ① 类候选委托 add-skill 执行完整流程（含 hook、镜像、校验） |
| `task-tracker` | 识别到「任务已完成但未归档」，提示调用 task-tracker |
| `brainstorm` | ⑤ 类文档往往是 brainstorm 结论落地后的产物 |
| `framework-sync` | 子项目做 framework-sync 前先 /exp，把通用经验记进反哺清单 |
| `project-navigator` | 识别到「代码位置经常找不到」时，提示改进 project-navigator |

---

## 当前没有的能力

- 没有技能激活频率统计（没有 hook 日志），「过时技能」只按内容与代码是否一致判断
- 没有无人值守模式：每次写入都经过用户在会话里确认（[B] 也是当面授权）
- 子项目反哺清单不会自动发现：只读 `knownSubprojects` 里登记过的路径

---

## 快速参考

### 一次标准 /exp 流程

```
用户：/exp
  ↓
模型：判定模式 → 扫描 → 候选表（≤ 10 条）→ 用户选 [A/B/C/D]
  ↓
逐项：展示预览 → 确认 Why → [Y/E/S/M/W]
  ↓
分发：① add-skill | ② Edit 技能 / 反哺清单 | ③ CLAUDE.md / PROJECT.md | ④ memory | ⑤ 文档 | ⑥ 命令
  ↓
摘要：写 .claude/docs/experience/YYYY-MM/YYYY-MM-DD-exp-summary.md → docs(exp) 提交
  ↓
（子项目）反哺提示
```

### 初始化检查清单

首次在一个仓库运行 /exp 时：

- [ ] 按判定规则识别模式（framework / subproject），告诉用户判定结果
- [ ] 确保 `.claude/docs/experience/` 目录存在（否则创建）
- [ ] 子项目模式：确认 `.claude/PROJECT.md` 存在（不存在则创建）
- [ ] 子项目模式：创建 `.claude/docs/experience/feedback-to-framework.md`（如不存在）
- [ ] 需要反哺整合时，在 `.claude/exp.config.json`（本机缓存）里记下 `frameworkRepo` / `knownSubprojects`
