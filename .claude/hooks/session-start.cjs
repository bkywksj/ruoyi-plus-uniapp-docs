#!/usr/bin/env node
/**
 * Claude Code SessionStart Hook - 启动 / clear / 压缩后注入「项目专属规则 + 最近经验摘要」
 *
 * CLAUDE.md 约定会话开始要读两样东西：
 *   1. .claude/PROJECT.md（孵化项目的专属禁令，由 project-init 生成；框架仓库本身没有）
 *   2. .claude/docs/experience/ 下最近一份 *-exp-summary.md（/exp 沉淀）
 * 靠模型自觉读取命中率不稳定，压缩之后更是经常丢；这里在 SessionStart 自动注入。
 *
 * stdin：{ session_id, cwd, hook_event_name, source, model? }，source ∈ startup / resume / clear / compact / fork
 * 输出：{ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext } }；没有可注入内容时什么都不输出
 * 触发：startup、clear、compact 注入；resume / fork 跳过（原会话里已经有这段注入）
 *
 * 与 .codex/hooks/session-start.cjs 的区别（两份各自维护，不共用 lib）：
 *   - Claude Code 对 additionalContext 每个字段限 10,000 字符，超出会落成文件、只给 2,000 字符预览，
 *     所以这里按总预算分配（PROJECT.md 优先），而不是两段各截 8KB
 *   - 官方建议注入内容写成事实陈述，命令式「系统指令」口吻可能触发提示注入防御，标题因此只描述来源
 */

const fs = require('fs');
const path = require('path');

const INJECT_SOURCES = new Set(['startup', 'clear', 'compact']);
// 留出余量，确保拼接后的整段不超过官方 10,000 字符上限
const MAX_TOTAL = 9500;
const MAX_PROJECT = 6000;
const SEPARATOR = '\n\n---\n\n';

const readSafe = (file) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
};

/**
 * 截到不超过 max 个字符（含截断说明），超出时在末尾注明完整内容在哪个文件
 * @param {string} text 原文
 * @param {number} max 结果最大字符数
 * @param {string} relPath 原文件相对路径，用于截断说明
 * @returns {string}
 */
function clip(text, max, relPath) {
  if (text.length <= max) return text;
  const note = `\n\n…（已截断，完整内容见 ${relPath}）`;
  return `${text.slice(0, Math.max(0, max - note.length))}${note}`;
}

/**
 * 最新的经验摘要文件：按月份目录名（YYYY-MM）倒序，再按文件名倒序
 * @param {string} root 项目根目录
 * @returns {string|null} 绝对路径；没有经验目录或没有摘要时返回 null
 */
function latestSummary(root) {
  const expDir = path.join(root, '.claude', 'docs', 'experience');
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

/**
 * 拼出要注入的上下文：PROJECT.md 在前（有摘要时最多 maxProject 字符，没有就用满 maxTotal），经验摘要用剩余额度
 * @param {string} root 项目根目录
 * @param {{ maxTotal?: number, maxProject?: number }} [options] 总长度上限与 PROJECT.md 段上限（字符数）
 * @returns {string} 注入文本；两样都没有时返回空串
 */
function buildSessionContext(root, { maxTotal = MAX_TOTAL, maxProject = MAX_PROJECT } = {}) {
  const sections = [];
  let used = 0;

  const summaryFile = latestSummary(root);
  const summary = summaryFile ? readSafe(summaryFile).trim() : '';

  const projectRules = readSafe(path.join(root, '.claude', 'PROJECT.md')).trim();
  if (projectRules) {
    const header = '## 本项目的专属规则（.claude/PROJECT.md，优先级高于 CLAUDE.md 的通用规则）\n\n';
    // 有经验摘要时给它留额度；没有就把整份预算都给 PROJECT.md
    const cap = summary ? Math.min(maxProject, maxTotal) : maxTotal;
    const section = header + clip(projectRules, cap - header.length, '.claude/PROJECT.md');
    sections.push(section);
    used += section.length;
  }

  if (summary) {
    const relPath = path.relative(root, summaryFile).replace(/\\/g, '/');
    const header = `## 最近一次经验沉淀摘要（${relPath}）\n\n> 由 /exp 生成：已沉淀的禁令、踩过的坑、待观察事项。\n\n`;
    const budget = maxTotal - used - (sections.length ? SEPARATOR.length : 0) - header.length;
    // 额度只够放几个字时不如不放，改成只给出处
    if (budget >= 200) sections.push(header + clip(summary, budget, relPath));
    else if (maxTotal - used - SEPARATOR.length >= 80) sections.push(`最近一次经验沉淀摘要见 ${relPath}（本次注入额度已用完）`);
  }

  return sections.join(SEPARATOR);
}

function main() {
  let input = {};
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    return; // stdin 不是合法 JSON：不注入，也不打断会话启动
  }
  const source = input.source || '';
  if (source && !INJECT_SOURCES.has(source)) return;

  // 会话中途 cd 过子目录时 cwd 会变，PROJECT.md 与经验目录都在项目根，优先用 CLAUDE_PROJECT_DIR
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const context = buildSessionContext(root);
  if (!context) return;
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }),
  );
}

if (require.main === module) {
  try {
    main();
  } catch {
    // 任何意外都不能挡住会话启动
  }
  // 不调用 process.exit：Windows 上 stdout 是管道时写入是异步的，立刻 exit 可能截断近 10KB 的输出
  process.exitCode = 0;
}

module.exports = { buildSessionContext, latestSummary, INJECT_SOURCES, MAX_TOTAL, MAX_PROJECT };
