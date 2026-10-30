---
name: collaborating-with-antigravity
description: 仅当用户点名 Antigravity / 反重力 / agy 时使用：用 agy CLI 委托任务、做多厂商模型交叉验证，或用 --json-schema 强制结构化输出；未点名的多模型、交叉验证不算。触发词：Antigravity、反重力、agy、agy协同、委托给Antigravity、agy CLI
---

# 与 Antigravity CLI（agy）协同开发

## 何时使用

- 用户明确说「用 Antigravity / 用反重力 / 用 agy / agy 协同」
- 用户要求把某个具体任务委托给 Antigravity CLI 执行
- 用户要求多模型交叉验证，并点名 Antigravity 作为其中一方
- 用户要求让外部模型返回严格 JSON 结构（`--json-schema` 强制结构化输出）
- 用户要求接续之前的 agy 会话（`--continue` / `--conversation <ID>`）

前置要求：
- 已安装 Antigravity CLI（Windows 路径 `%LOCALAPPDATA%\agy\bin\agy.exe`；本机当前版本以 `agy --version` 为准，写本文时为 1.2.3）
- 已完成登录认证（`agy models` 能列出模型即为已认证）

🔴 不适用场景（未点名 Antigravity 一律不激活本技能）：
- UI / UX / 前端原型 / CSS / 样式设计 → 走 ui-components、design-system、html-to-code，或用户指定的工具（如 AI 工作站）
- 代码审查 / 规范检查 → 走 code-patterns、/check；Bug 排查 → 走 bug-detective
- 方案探索 / 技术选型 → 走 brainstorm、tech-decision
- 泛泛的「多模型」「交叉验证」字样但没点名用哪个 CLI → 不要自作主张拉起本技能

> Google Antigravity 的命令行代理。**原生支持非交互 + 结构化输出，不需要 Python 桥接脚本** ——
> 这是它与 `collaborating-with-gemini` / `collaborating-with-codex` 最大的工程差异（那两个都要靠 `scripts/*_bridge.py` 包一层）。

## 与另外两个协同技能的边界

| 能力 | `agy`（本技能） | `gemini` CLI | `codex` CLI |
|------|----------------|--------------|-------------|
| 调用方式 | 直接命令行 | Python 桥接 | Python 桥接 / 官方插件 |
| 结构化输出 | ✅ 原生 `--output-format json` | 桥接自己包 | 桥接自己包 |
| 强制 JSON Schema | ✅ `--json-schema` | ❌ | ❌ |
| 可选模型 | 跨三家厂商（以 `agy models` 为准） | 仅 Gemini | 仅 GPT |
| 最适合 | 多模型交叉验证、要求严格结构化返回 | 前端原型 | 逻辑分析、对抗审查 |

**选它的理由**：`agy` 能从一个入口调到 Gemini、Claude、GPT-OSS 三家的模型，做「同一问题让不同厂商模型各答一遍再比对」时，比分别去调 gemini / codex 两个桥接要干净得多。

---

## 前置检查（每次激活先跑）

```powershell
agy --version          # 期望输出版本号
agy models             # 能列出模型 = 已认证；报错 = 未登录
```

未安装或未认证时**停下告知用户**，不要自己去装、也不要回退到别的 CLI。

---

## 🔴 权限边界（先读这一节再调用）

agy 是一个会自己读文件、跑命令的代理，它的工具调用**不经过 Claude Code 的 hook 与权限系统**。
所以本项目里「不跑本地 git push」「不删他者文件」这类护栏，对 agy 放行的工具**一概不生效**。

按任务需要选最小权限，从上往下选：

| 档位 | 怎么调 | 适合 |
|------|-------|------|
| ① 纯文本推理 | 把需要的代码片段 / 结论写进 prompt，让它只回答，不给任何放行参数 | 评价一段写法、比较两个方案、给结构化结论（多数交叉验证属于这一档） |
| ② 只读分析 | `--mode plan`，并在 `~/.gemini/antigravity-cli/settings.json` 的 `permissions.allow` 里只放行需要的只读命令（agy 在 stderr 里会提示需要哪条规则） | 让它自己读仓库里的文件再下结论 |
| ③ 全部放行 | `--dangerously-skip-permissions` | 🔴 只有用户**明确同意**、且当前工作区干净时才用；它会放行写文件、跑任意命令（包括远程 git） |

`--mode plan` 在无人值守的 print 模式下是否还会因为权限被拒而空手返回，没有实测过；遇到「坑 1」的空响应时按 stderr 提示补 allow 规则，不要直接升到档位 ③。

---

## 快速开始

```bash
# Git Bash（推荐：引号与空格按字面传递；MSYS_NO_PATHCONV=1 防止 prompt 里的 // 被当成路径改写成 /）
MSYS_NO_PATHCONV=1 agy -p '用一句话评价这个函数名是否表意清楚：getCategories' --output-format json --print-timeout 10m
```

```powershell
# PowerShell：prompt 里别用英文双引号（原因见「坑 2」）
agy -p '用一句话评价这个函数名是否表意清楚：getCategories' --output-format json --print-timeout 10m
```

---

## 参数速查（`agy --help` 实测，1.2.3）

| 参数 | 说明 |
|------|------|
| `-p` / `--print` / `--prompt` | 非交互跑一轮并打印结果（**协同调用一律用它**） |
| `-i` / `--prompt-interactive` | 带初始 prompt 进入交互会话（协同调用不用） |
| `--output-format` | `text`（默认）/ `json` / `stream-json` |
| `--input-format` | `text`（默认）/ `stream-json`（每行一条 NDJSON 消息，需配 `--output-format stream-json`） |
| `--json-schema` | JSON Schema 字符串**或文件路径**，强制结构化输出 |
| `--model` | 指定模型，取值见 `agy models` |
| `--effort` | 推理档位 `low` / `medium` / `high` |
| `--mode` | `plan`（只读规划）/ `accept-edits`（自动接受改动） |
| `--sandbox` | 启用终端限制沙箱 |
| `--continue` / `-c` | 接着最近一次对话 |
| `--conversation <ID>` | 按 ID 恢复指定对话 |
| `--add-dir` | 追加工作区目录（可重复） |
| `--agent` / `--project` / `--new-project` | 指定 agent、项目；新建项目 |
| `--print-timeout` | print 模式超时，**默认仅 5m** |
| `--dangerously-skip-permissions` | 自动批准所有工具权限（见「权限边界」档位 ③） |
| `--disable-slash-commands` | print 模式下禁用斜杠命令 / 技能展开 |
| `--log-file` | 覆盖 CLI 日志路径 |

子命令：`models` / `agent(s)` / `mcp` / `plugin(s)` / `install` / `update` / `changelog` / `remote-control` / `mic-serve` / `help`。版本变化时以 `agy --help` 为准。

---

## 返回值结构（`--output-format json` 实测原文）

```json
{
  "conversation_id": "799da8b5-f195-466b-b5b6-946cfd8bc881",
  "status": "SUCCESS",
  "response": "可用\n",
  "duration_seconds": 3.63,
  "num_turns": 1,
  "usage": {
    "input_tokens": 13819,
    "output_tokens": 1,
    "thinking_tokens": 0,
    "cache_read_tokens": 0,
    "total_tokens": 13820
  }
}
```

带 `--json-schema` 时**额外**多出两个顶层字段：

```json
{
  "structured_output": { "verdict": "fail", "score": 20, "reason": "..." },
  "json_schema": { "type": "object", "properties": { ... } }
}
```

- `conversation_id` → 存下来给 `--conversation` 续接用
- `usage` → 报告 token 消耗时用真实值，不要估算

---

## 🔴 四个必踩的坑

### 坑 1：headless 权限被拒 = 静默假成功（最危险）

headless 模式没法弹审批框，需要 `command` 权限的工具会被**自动拒绝**，但进程**照样返回成功**：

```jsonc
// stderr（真相在这里）：
// jetski: no output produced — a tool required the "command" permission that headless
// mode cannot prompt for, so it was auto-denied. Add an allow-rule under
// permissions.allow in settings.json (e.g. command(<target>)).
// Alternatively, re-run with --dangerously-skip-permissions to auto-approve all tools.

// stdout（骗人的）：
{"status":"SUCCESS","response":"","duration_seconds":2.1,"num_turns":1}
// 退出码：0
```

`status` 是 `SUCCESS`、退出码是 `0`、`response` 却是**空字符串**。只要任务需要它看代码、跑命令，就可能遇到。

**判定成功的正确姿势 —— 三个条件缺一不可**：

1. 退出码 `== 0`
2. `status == "SUCCESS"`
3. **`response` 非空**（带 schema 时改判 `structured_output` 存在）

只要 `response` 是空串，就当失败处理并去看 stderr。

**处理顺序**（对应「权限边界」的三个档位）：

1. 能不能把需要的内容直接写进 prompt、让它只做文本推理？能就这么改，最安全
2. 必须让它自己读文件：按 stderr 提示，在 `~/.gemini/antigravity-cli/settings.json` 的 `permissions.allow` 里加**只读**命令的规则，配合 `--mode plan`
3. 前两条都不行：把风险讲给用户（它会绕过本项目所有 hook 护栏），用户明确同意后才加 `--dangerously-skip-permissions`，且先确认工作区干净

### 坑 2：PowerShell 5.1 会吃掉 / 拆开 prompt 里的双引号

PowerShell 5.1 把参数交给原生 exe 时不转义内部的英文双引号（实测，用 Python 打印收到的 argv）：

```powershell
# 单引号包裹、内部有双引号：不会报错，但双引号被吃掉了
python -c "import sys;print(sys.argv[1:])" '评价这句注释："// 处理数据"。给出结论'
# → ['评价这句注释：// 处理数据。给出结论']

# 引号外还有空格时：被拆成两个参数，agy 会报 Error: unexpected argument，退出码 2
$p = 'a b "c d" e'; python -c "import sys;print(sys.argv[1:])" $p
# → ['a b c', 'd e']
```

把 prompt 先读进变量再传也一样会被拆，**落成文件不能解决这个问题**。可行做法：

- prompt 里不用英文双引号，改用「」或单引号
- 或改在 Git Bash 里调用，prompt 较长时先用 Write 工具落成文件再读进来（实测引号、空格原样传到程序里）：

```bash
MSYS_NO_PATHCONV=1 agy -p "$(cat "$TEMP/agy-prompt.txt")" --output-format json
```

### 坑 3：带 schema 时别去解析 `response`

`--json-schema` 生效后，`response` 正文里会混进模型自己写的 JSON，还可能多出 `toolAction` / `toolSummary` 等 schema 里没有的字段。**只读顶层 `structured_output`**：

```powershell
# ✅ 正确
$r = agy -p '...' --output-format json --json-schema .\schema.json | ConvertFrom-Json
$r.structured_output.verdict

# ❌ 错误：response 里混着自然语言 + 冗余字段，解析必翻车
$r.response | ConvertFrom-Json
```

另外带 schema 会多跑一轮（实测 `num_turns` 从 1 变 2），耗时和 token 都会涨。

### 坑 4：每次调用有约 1.4 万 token 的固定基线（换目录省不掉）

实测三个完全不同的工作目录，`input_tokens` 几乎一样：

| 工作目录 | input_tokens |
|---------|--------------|
| 空临时目录（scratchpad） | 13,830 |
| 本仓库根 | 13,819 |
| 另一个 Tauri + Rust 仓库根 | 13,826 |

说明这 ~13.8k **是 agy 自身系统提示 + 工具定义的固定开销，与项目大小无关**。

- ❌ 别指望「换到空目录调用」能省 token
- ✅ 真正能省的是**续接**：`-c` / `--conversation` 会命中缓存（实测 `cache_read_tokens` 复用 8,130）
- ⚠️ 带 `--json-schema` 因为多跑一轮，实测涨到约 28,459
- 结论：**agy 适合「问得少而重」的任务**，不适合拿来做几十次的碎问碎答

---

## 使用模式

### 1. 基础委托（只读分析）

```powershell
agy -p '解释 src/components/islands/WorksExplorer.tsx 里 URL 参数与筛选状态的同步时序' --mode plan --output-format json --print-timeout 10m
```

### 2. 强制结构化输出（推荐用于任何需要机读结果的场景）

先把 schema 落成文件（避免命令行引号地狱）：

```json
// review-schema.json
{
  "type": "object",
  "properties": {
    "verdict": { "type": "string", "enum": ["pass", "warn", "fail"] },
    "score":   { "type": "integer" },
    "reason":  { "type": "string" }
  },
  "required": ["verdict", "score", "reason"]
}
```

```powershell
$r = agy -p '按项目规范评估这段代码' --output-format json --json-schema .\review-schema.json | ConvertFrom-Json
if ($r.structured_output) { $r.structured_output.verdict } else { "调用失败，检查 stderr" }
```

### 3. 多模型交叉验证（本技能的主场）

同一问题分别交给三家模型，再由 Claude Code 汇总分歧点（模型名先用 `agy models` 核对）：

```powershell
$q = 'src/components/seo/SEOHead.astro 与 src/lib/seo.ts 生成的 canonical / og:url / JSON-LD 有没有可能在某类页面上出错？'
agy -p $q --model gemini-3.1-pro-high        --mode plan --output-format json --effort high
agy -p $q --model claude-opus-4-6-thinking   --mode plan --output-format json --effort high
agy -p $q --model gpt-oss-120b-medium        --mode plan --output-format json
```

> 三次调用互相独立、无共享上下文，这正是交叉验证要的「互不污染」。`$q` 里不要放英文双引号（坑 2）。

### 4. 会话续接

```powershell
# 第一轮，记下 conversation_id
$r1 = agy -p '梳理作品数据从外部接口到详情页的完整链路' --mode plan --output-format json | ConvertFrom-Json

# 后续轮次
agy -p '基于上面的结论，补充接口限流时的降级方案' --conversation $r1.conversation_id --output-format json

# 或直接接最近一次
agy -c -p '再补充一下封面图防盗链的处理'
```

### 5. 流式多轮（CI / 批处理）

```bash
printf '%s\n' \
  '{"event":"user","message":{"content":"第一问"}}' \
  '{"event":"user","message":{"content":"第二问"}}' \
  | agy --input-format stream-json --output-format stream-json
```

---

## 模型选择指南（以 `agy models` 实际输出为准）

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| 复杂架构分析 | `gemini-3.1-pro-high` | Pro 档推理最强 |
| 对抗审查 / 找漏洞 | `claude-opus-4-6-thinking` | 思考型，挑刺细 |
| 快速问答 / 批量任务 | `gemini-3.7-flash-low` | 最快最省 |
| 第三方交叉验证 | `gpt-oss-120b-medium` | 与前两家同源性最低 |

上表是编写时 `agy models` 列出的名字。模型清单会随版本变化，**报给用户或写进命令前先跑一次 `agy models` 核对**，不要凭本文档硬报。

---

## 与本项目的集成

### Windows / PowerShell 调用注意（项目 CLAUDE.md 硬性要求）

```powershell
# ✅ 调 agy 前固定输出编码，否则中文回复乱码
[Console]::OutputEncoding = [Text.Encoding]::UTF8

# ❌ 禁止给 agy 加 2>&1（PS 5.1 会把 stderr 逐行包成 NativeCommandError）
agy -p '...' 2>&1 | Select-String "SUCCESS"

# ✅ 工具层已捕获 stderr，直接跑即可
agy -p '...' --output-format json
```

> 这条尤其重要：**坑 1 的真相全在 stderr**，加了 `2>&1` 反而会把它包成异常对象，更难看清。

### 典型用例：规范对抗审查

```powershell
agy -p '审查 src/pages 下所有页面是否都经过 BaseLayout、是否存在页面里直接 getCollection 再各自排序（本项目规范要求查询统一走 src/lib/<集合>.ts）' `
    --model claude-opus-4-6-thinking --effort high --mode plan --output-format json
```

### 典型用例：让外部模型产出可直接入库的结构化结论

配合 `--json-schema`，把审查结果落成机读 JSON，再由 Claude Code 汇总进任务卡（配合 `task-tracker` 技能）。

---

## 故障排除

| 现象 | 原因 | 解决 |
|------|------|------|
| `status: SUCCESS` 但 `response` 为空 | 工具权限被 headless 自动拒绝 | 见「坑 1」的处理顺序，先改纯文本 / 补只读 allow 规则，最后才考虑全部放行 |
| `Error: unexpected argument "..."`，退出码 2 | PowerShell 把 prompt 按空格拆开了 | 见「坑 2」，去掉英文双引号或改用 Git Bash |
| 解析 `response` 得到脏 JSON | 带 schema 时误读了 `response` | 见「坑 3」，改读 `structured_output` |
| 想靠换目录省 token 但没效果 | ~13.8k 是固定基线 | 见「坑 4」，改用 `-c` 续接吃缓存 |
| 复杂任务被截断 / 超时 | `--print-timeout` 默认只有 5m | 显式设大，如 `--print-timeout 20m` |
| `agy models` 报错 | 未登录 | 停下让用户完成认证，不要自行处理凭据 |
| 中文回复乱码 | 未固定控制台编码 | 先 `[Console]::OutputEncoding = [Text.Encoding]::UTF8` |

---

## 三个协同技能怎么选

| 任务 | 选谁 |
|------|------|
| 用户点名 Antigravity / 反重力 / agy | **本技能** |
| 用户点名 Gemini | `collaborating-with-gemini` |
| 用户点名 Codex，或 `/dev-loop` 的 review-gate | `collaborating-with-codex` |
| 用户点名本技能且要多厂商模型对同一问题交叉验证 | **本技能**（一个入口调三家，最省事） |
| 用户点名本技能且要外部模型返回严格 JSON 结构 | **本技能**（三者中唯一支持 `--json-schema`） |
| 用户没点名任何 CLI | **一个都不激活**，走框架自有技能 |
