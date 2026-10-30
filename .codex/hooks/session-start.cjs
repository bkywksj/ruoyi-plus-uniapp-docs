#!/usr/bin/env node
/**
 * Codex SessionStart Hook - 会话启动时注入「项目专属规则 + 最近经验摘要」
 *
 * CLAUDE.md / AGENTS.md 约定会话开始要读两样东西：
 *   1. .claude/PROJECT.md（孵化项目的专属禁令，由 project-init 生成；框架仓库本身没有）
 *   2. .claude/docs/experience/ 下最近一份 *-exp-summary.md（/exp 沉淀）
 * Claude 端靠模型自觉读取，命中率不稳定；Codex 端在这里用 hook 自动注入 additionalContext。
 *
 * Codex stdin schema：{ session_id, source, cwd, hook_event_name, model }，source ∈ { startup, resume, clear }
 * Codex 输出：{ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext } } → 加入开发者上下文；{} → 不注入
 * 触发策略：仅 startup（resume / clear 时上下文已存在或被刻意清空，不应再塞）
 */

const fs = require('fs');
const path = require('path');

let input = {};
try {
  const raw = fs.readFileSync(0, 'utf8');
  if (raw) input = JSON.parse(raw);
} catch {
  process.stdout.write('{}');
  process.exit(0);
}

const source = input.source || '';
const cwd = input.cwd || process.cwd();

if (source && source !== 'startup') {
  process.stdout.write('{}');
  process.exit(0);
}

// 每段注入最多 8KB（保留头部），避免一次会话开头就塞满上下文
const MAX = 8 * 1024;
const clip = (text) => (text.length > MAX ? `${text.slice(0, MAX)}\n\n…（已截断，完整内容见原文件）` : text);
const readSafe = (file) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
};

/** 最新的经验摘要文件：按目录名（YYYY-MM）倒序，再按文件名倒序 */
function latestSummary() {
  const expDir = path.join(cwd, '.claude', 'docs', 'experience');
  try {
    const dirs = fs
      .readdirSync(expDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .reverse();
    for (const dir of dirs) {
      const files = fs
        .readdirSync(path.join(expDir, dir))
        .filter((file) => file.endsWith('-exp-summary.md'))
        .sort()
        .reverse();
      if (files.length) return path.join(expDir, dir, files[0]);
    }
  } catch {
    // 目录不存在或无权限：没有经验可加载
  }
  return null;
}

const sections = [];

const projectRules = readSafe(path.join(cwd, '.claude', 'PROJECT.md'));
if (projectRules.trim()) {
  sections.push(`## 项目专属规则（来自 .claude/PROJECT.md，优先级高于 AGENTS.md 的通用规则）\n\n${clip(projectRules)}`);
}

const summaryFile = latestSummary();
const summary = summaryFile ? readSafe(summaryFile) : '';
if (summary.trim()) {
  const relPath = path.relative(cwd, summaryFile).replace(/\\/g, '/');
  sections.push(
    `## 历史经验加载（来自 ${relPath}）\n\n> 最近一次 \`/exp\` 沉淀的经验摘要：已沉淀的禁令、踩过的坑、待观察事项。\n\n${clip(summary)}`,
  );
}

// Codex 校验 SessionStart 输出 schema：顶层 additionalContext 会被判为
// "invalid session start JSON output"，必须放进 hookSpecificOutput 嵌套结构
process.stdout.write(sections.length ? JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: sections.join('\n\n---\n\n') } }) : '{}');
process.exit(0);
