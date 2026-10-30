#!/usr/bin/env node
// Codex UserPromptSubmit Hook - 强制技能评估（极简版）
//
// Codex 与 Claude 的核心差异：
//   - Claude 端没有 skills 自动加载机制，hook 必须把技能列表全注入（本框架 40 个）
//   - Codex 端已经从 .agents/skills 把所有 SKILL.md frontmatter 加载到 context
//     再注入一遍 = 重复浪费 5KB token + 污染 TUI 显示
// 所以本脚本只输出 ~500 字符的"流程指令"，让 Codex 用它已加载的 skills 自己匹配。
//
// Codex stdin: { session_id, turn_id, prompt, cwd, hook_event_name, model }
// Codex 输出: stdout 普通文本 → 注入 context；空输出 → 跳过

const fs = require('fs');

let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch {
  process.exit(0);
}

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const prompt = (input.prompt || '').trim();

// 恢复会话/上下文截断时跳过，避免在已塞满的 turn 里再次膨胀。
// 只认系统续跑消息里的固定句子，不用「context window」这种用户正常聊天也会说的词
const skipPatterns = ['session is being continued from a previous conversation', 'conversation compacted'];
if (skipPatterns.some((p) => prompt.toLowerCase().includes(p))) {
  process.exit(0);
}

// 斜杠命令直接放行（如 /dev、/kickoff）：Codex 把它们当命令型技能跑。
// 只有 .agents/skills 里真实存在的名字才算，`/about 页面描述重复了` 这类提到路径的普通提问照常评估
const slash = (prompt.split(/\s/)[0] || '').match(/^\/([^/\s]+)$/);
if (slash) {
  const fs2 = require('fs');
  const path2 = require('path');
  const skillsRoot = path2.join(input.cwd || process.cwd(), '.agents', 'skills');
  const known = [slash[1], `cmd-${slash[1]}`].some((name) => fs2.existsSync(path2.join(skillsRoot, name, 'SKILL.md')));
  if (known) process.exit(0);
}

// 智码编排系统的唤醒通知（[AGENT-EVENT]）是总控会话的调度信号而非用户提问，
// Codex 当总控时会被反复唤醒，每次都走技能评估纯属浪费，直接跳过
if (prompt.startsWith('[AGENT-EVENT]')) {
  process.exit(0);
}

const instructions = `## 强制技能激活流程

参考 Codex 已加载的 skills 列表（.agents/skills/），按以下流程响应：

1. **评估**：列出匹配此 prompt 的技能名（格式：\`技能名: 理由\`），无匹配则写"无匹配技能"
2. **加载**：用 Read 逐个读取 \`.agents/skills/<技能名>/SKILL.md\`，必须读完所有匹配技能的 SKILL.md 后才能执行任何 Bash/apply_patch/搜索命令
3. **实现**：按 SKILL.md 中的规范执行任务

⛔ 禁止：跳过 Read 直接执行命令；边读边执行；只读部分技能
✅ 正确：评估 → 全部 Read → 实现`;

process.stdout.write(instructions);
process.exit(0);
