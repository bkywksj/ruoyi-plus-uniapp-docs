---
name: collaborating-with-gemini
description: 仅当用户点名 Gemini 时使用：经内置桥接脚本把指定任务委托给 Google Gemini CLI 并整合结果；未点名的 UI 设计、原型、代码审查不算。触发词：Gemini、gemini协同、委托给Gemini、gemini CLI、gemini_bridge
---

# 与 Gemini CLI 协同开发

## 何时使用

- 用户明确说「用 Gemini / 让 gemini 看看 / gemini 协同」
- 用户要求把某个具体任务委托给 Gemini CLI 执行
- 用户要求多模型交叉验证，并点名 Gemini 作为其中一方
- 用户要求接续之前的 Gemini 会话（SESSION_ID / latest）

前置要求：
- 已安装 Gemini CLI（`npm install -g @google/gemini-cli`）
- 已认证：首次在终端直接运行 `gemini`，按提示选择登录方式；或设置环境变量 `GEMINI_API_KEY`。
  本机 Gemini CLI 0.27 的 `gemini --help` 里没有 `auth login` 子命令，别让用户照着敲

🔴 不适用场景（未点名 Gemini 一律不激活本技能）：
- UI / UX / 前端原型 / CSS / 样式设计 → 走 ui-components、design-system、html-to-code，或用户指定的工具（如 AI 工作站）；不要因为出现「UI 设计」「原型」就调 Gemini
- 代码审查 / Bug 分析 → 走 bug-detective、code-patterns
- 数据同步 / 构建脚本等纯逻辑任务 → 用户点名时也建议改用 Codex

> 用户点名后，通过 Python 桥接脚本调用 Gemini CLI，常见用途是拿前端原型与样式方面的第二意见。

## 快速开始

```bash
# 相对路径（推荐，在项目根目录执行）；Windows 下加 PYTHONIOENCODING=utf-8，避免中文输出乱码
PYTHONIOENCODING=utf-8 python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py --cd . --PROMPT "Your task"
```

**输出**: JSON 格式，包含 `success`、`SESSION_ID`、`agent_messages` 和可选的 `error`。脚本本身总以退出码 0 结束，成败看 JSON 里的 `success`。

脚本实际执行的是 `gemini -o stream-json "<PROMPT>" [--sandbox] [--model …] [--resume <SESSION_ID>]`（在 `--cd` 目录里运行）：
PROMPT 作为命令行参数传入，Windows 上换行会被转成字面量 `\n`。

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--PROMPT` | str | ✅ | - | 发送给 Gemini 的任务指令（使用英语） |
| `--cd` | Path | ✅ | - | 工作目录根路径（不存在时直接返回 `success: false`） |
| `--sandbox` | bool | ❌ | `False` | 是否启用沙箱模式 |
| `--SESSION_ID` | str | ❌ | `""` | 会话 ID，原样传给 `gemini --resume`。本机 0.27 的 help 只写明支持 `latest` 或序号；传 UUID 失败时改传 `latest` |
| `--return-all-messages` | bool | ❌ | `False` | 返回完整推理信息 |
| `--model` | str | ❌ | `None` | 指定模型（仅用户明确要求时使用） |

## 使用模式

### 1. 基础调用

```bash
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd . \
  --PROMPT "Design a responsive card component for product display"
```

### 2. 多轮会话

**始终保存 SESSION_ID** 用于后续对话：

```bash
# 第一轮：设计 UI
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd "/project" \
  --PROMPT "Design a mobile-first login page with form validation"

# 后续轮次：使用 SESSION_ID 继续
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd "/project" \
  --SESSION_ID "uuid-from-previous-response" \
  --PROMPT "Add dark mode support to the login page design"
```

### 3. 获取 Unified Diff 补丁

```bash
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd "/project" \
  --PROMPT "Generate a unified diff to improve the hero section layout in src/pages/index.astro (Tailwind v4, semantic tokens only). OUTPUT: Unified Diff Patch ONLY."
```

### 4. 调试模式（返回完整信息）

```bash
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd "/project" \
  --PROMPT "Debug this styling issue: elements overflow on mobile" \
  --return-all-messages
```

## 返回值结构

**成功时：**
```json
{
  "success": true,
  "SESSION_ID": "550e8400-e29b-41d4-a716-446655440000",
  "agent_messages": "模型回复内容..."
}
```

**失败时：**
```json
{
  "success": false,
  "error": "错误信息描述"
}
```

## 协作工作流

### 推荐场景

| 场景 | 说明 |
|------|------|
| **前端/UI/UX** | Gemini 擅长 CSS、样式和视觉设计 |
| **组件设计** | `.astro` 组件与 React island 的原型设计 |
| **响应式布局** | 移动端适配和布局优化 |
| **样式审查** | Tailwind 类名组织、语义令牌使用 |

### 重要约束

1. **输入保持聚焦**: 给文件路径和约束，让 Gemini 自己去读，不要把整段代码 / 整个仓库塞进 PROMPT。
   PROMPT 是命令行参数：Windows 上 `gemini` 是 `.cmd`，经 `cmd.exe` 转一道，命令行总长度有上限（约 8K 字符），太长会失败
2. **英语交互**: 与 Gemini 交互时使用英语，获得更好效果
3. **Diff 输出**: 在 PROMPT 中明确要求 `OUTPUT: Unified Diff Patch ONLY`
4. **纯逻辑任务**: 数据同步、检索排序这类逻辑优先使用 Codex
5. **告知项目约束**: PROMPT 里说明「Tailwind v4 + 语义令牌（bg-canvas / text-ink / text-muted / border-line / text-brand-ink），禁止原始色值」，否则产出会混入 `gray-500` 之类的硬编码
6. **重构代码**: 将 Gemini 的输出视为"脏原型"，由 Claude 重构为生产代码
7. **后台运行**: 对于长时间任务，使用 `Run in the background`

## 与本项目的集成

### 典型用例：区块设计

```bash
# 设计首页新区块
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd . \
  --PROMPT "Design a 'learning path' section for src/pages/index.astro. Reuse src/components/ui/Section.astro and src/components/works/WorkCard.tsx patterns. Tailwind v4 with semantic tokens only (bg-canvas, text-ink, text-muted, border-line, text-brand-ink). Mobile first."
```

### 典型用例：卡片变体

```bash
# 设计卡片的横向变体
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd "/project" \
  --PROMPT "Propose a horizontal list variant of WorkCard (src/components/works/WorkCard.tsx) for dense category pages. Keep the WorkCardData props contract unchanged. OUTPUT: Unified Diff Patch."
```

### 典型用例：样式审查

```bash
# 审查响应式与深色模式
python .claude/skills/collaborating-with-gemini/scripts/gemini_bridge.py \
  --cd "/project" \
  --PROMPT "Review src/pages/works/[id].astro for mobile responsiveness, dark mode (html.dark) contrast, and misuse of raw Tailwind colors instead of semantic tokens."
```

## 安装前置

```bash
# 安装 Gemini CLI
npm install -g @google/gemini-cli

# 认证：在终端直接运行一次，按提示选择登录方式（或提前设置环境变量 GEMINI_API_KEY）
gemini
```

🔴 安装、登录属于改用户环境的操作：AI 只给命令，由用户在自己的终端执行。

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| `gemini: command not found` | 确保已安装并添加到 PATH |
| `SESSION_ID` 获取失败 | 检查网络连接与认证状态（终端里运行 `gemini` 看是否要求登录） |
| 返回「Failed to retrieve agent_messages」 | Gemini 这一轮在调工具、没给文本答复；用返回的 `SESSION_ID` 续接，或把任务改成只要文本结论 |
| 续接会话失败 | `--SESSION_ID` 改传 `latest` |
| 输出被截断 | 使用 `--return-all-messages` 获取完整信息 |
| PROMPT 太长报错 / 被截断 | 缩短 PROMPT，改为给文件路径让 Gemini 自己读 |
| Windows 路径问题 | 使用正斜杠 `/` 或双反斜杠 `\\` |

## Gemini vs Codex 选择指南

| 任务类型 | 推荐模型 | 原因 |
|---------|---------|------|
| 前端 UI/CSS | Gemini | 视觉设计能力强 |
| 数据同步 / 构建脚本 | Codex | 算法和逻辑分析强 |
| 组件样式 | Gemini | CSS 和布局专长 |
| 集合 schema / 信息架构 | Codex | 结构与约束推理 |
| 代码审查 | 两者皆可 | 双模型交叉验证更好 |
