#!/usr/bin/env node
// Codex 技能镜像生成：pnpm agents:sync
// Codex 从 .agents/skills/ 加载技能、没有斜杠命令，所以：
//   1. .claude/skills/<name>/          → 原样复制到 .agents/skills/<name>/（含 scripts/ 等附属文件）
//   2. .claude/commands/<name>.md      → 包装成 .agents/skills/<name>/SKILL.md（与技能重名时加 cmd- 前缀）
//   3. .codex/skills-extra/<name>/     → Codex 专属技能（如 autonomous-dev），原样复制
//   4. 重写 AGENTS.md 里 <!-- skills:start --> 与 <!-- skills:end --> 之间的技能索引表
// .agents/ 是生成物：不要手改，改源头后重跑本脚本。上一次生成的目录清单记在 .agents/skills/.generated.json，
// 源头删掉的技能会在下次生成时一并清理（只清理本脚本生成过的目录，不碰别的文件）。
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = process.cwd();
const CLAUDE_SKILLS = join(ROOT, '.claude', 'skills');
const CLAUDE_COMMANDS = join(ROOT, '.claude', 'commands');
const CODEX_EXTRA = join(ROOT, '.codex', 'skills-extra');
const TARGET = join(ROOT, '.agents', 'skills');
const MANIFEST = join(TARGET, '.generated.json');
const AGENTS_MD = join(ROOT, 'AGENTS.md');

const require = createRequire(import.meta.url);
const { SKILLS } = require(join(ROOT, '.claude', 'hooks', 'skill-forced-eval.cjs'));

const listDirs = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory()) : [];

/**
 * 递归复制目录。
 * 不用 fs.cpSync：Node 22 在 Windows 上对含中文的路径（如 E:\my\AI框架\…）执行 cpSync 会直接让进程崩溃退出
 *（无异常、无输出，实测复现），逐个 copyFileSync 没有这个问题。
 */
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else if (entry.isFile()) copyFileSync(source, target);
  }
}

/** 读 markdown 头部 YAML 的 description（支持单行与 | 多行块），不引 YAML 依赖 */
function readFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };
  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const kv = lines[i].match(/^([A-Za-z_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rest] = kv;
    if (rest === '|' || rest === '>') {
      const block = [];
      while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1] === '')) {
        block.push(lines[i + 1].replace(/^ {2}/, ''));
        i += 1;
      }
      data[key] = block.join('\n').trim();
    } else {
      data[key] = rest.replace(/^['"](.*)['"]$/, '$1').trim();
    }
  }
  return { data, body: text.slice(match[0].length) };
}

const indent = (text) =>
  text
    .split('\n')
    .map((line) => (line ? `  ${line}` : ''))
    .join('\n');

mkdirSync(TARGET, { recursive: true });
const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : [];
const generated = [];

// 1. 技能原样复制
const skillNames = listDirs(CLAUDE_SKILLS);
for (const name of skillNames) {
  const dest = join(TARGET, name);
  rmSync(dest, { recursive: true, force: true });
  copyDir(join(CLAUDE_SKILLS, name), dest);
  generated.push(name);
}

// 2. 命令包装成技能
const commandRows = [];
// *-local.md 是只在本机用的命令（不提交、不分发），不进 Codex 镜像
const commandFiles = existsSync(CLAUDE_COMMANDS)
  ? readdirSync(CLAUDE_COMMANDS).filter((file) => file.endsWith('.md') && !file.endsWith('-local.md'))
  : [];
for (const file of commandFiles) {
  const command = file.replace(/\.md$/, '');
  const skillName = skillNames.includes(command) ? `cmd-${command}` : command;
  const { data, body } = readFrontmatter(readFileSync(join(CLAUDE_COMMANDS, file), 'utf8'));
  const summary = data.description || `/${command} 命令`;
  const hint = data['argument-hint'] ? `\n\n参数：${data['argument-hint']}` : '';
  const description = `/${command} - ${summary}${hint}\n\n（Claude Code 斜杠命令的 Codex 版：用户输入 /${command}，或描述同类意图时，按本文流程执行。）\n\n触发词：/${command}、${command}`;
  const content = `---\nname: ${skillName}\ndescription: |\n${indent(description)}\n---\n\n${body.trimStart()}`;
  const dest = join(TARGET, skillName);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, 'SKILL.md'), content, 'utf8');
  generated.push(skillName);
  commandRows.push([command, summary]);
}

// 3. Codex 专属技能
for (const name of listDirs(CODEX_EXTRA)) {
  const dest = join(TARGET, name);
  rmSync(dest, { recursive: true, force: true });
  copyDir(join(CODEX_EXTRA, name), dest);
  generated.push(name);
}

// 清理：上次生成过、这次源头已删除的目录
const stale = previous.filter((name) => !generated.includes(name));
for (const name of stale) rmSync(join(TARGET, name), { recursive: true, force: true });
writeFileSync(MANIFEST, `${JSON.stringify(generated.sort(), null, 2)}\n`, 'utf8');

// 4. AGENTS.md 技能索引
if (existsSync(AGENTS_MD)) {
  const table = [
    '| 技能 | 触发条件 |',
    '|------|---------|',
    ...SKILLS.map(([name, triggers]) => `| \`${name}\` | ${triggers.replace(/\|/g, '/')} |`),
    '| `autonomous-dev` | 自主开发/连续开发/一轮一提交（Codex 版自主循环方法论） |',
    '',
    '**命令型技能**（Claude Code 斜杠命令的 Codex 版，用户输入 `/命令名` 时读对应 SKILL.md）：',
    '',
    '| 命令 | 用途 |',
    '|------|------|',
    ...commandRows.map(([command, summary]) => `| \`/${command}\` | ${summary.replace(/\|/g, '/')} |`),
  ].join('\n');
  const text = readFileSync(AGENTS_MD, 'utf8');
  const updated = text.replace(
    /<!-- skills:start -->[\s\S]*?<!-- skills:end -->/,
    `<!-- skills:start -->\n<!-- 由 pnpm agents:sync 生成，勿手改 -->\n${table}\n<!-- skills:end -->`,
  );
  if (updated !== text) writeFileSync(AGENTS_MD, updated, 'utf8');
  const size = Buffer.byteLength(updated, 'utf8');
  if (size > 30 * 1024)
    console.warn(`⚠️ AGENTS.md ${size} 字节，超过 30KB（Codex 只注入前 32KiB，超出部分被静默截断）`);
}

console.log(
  `✅ .agents/skills 已同步：技能 ${skillNames.length} + 命令 ${commandFiles.length} + Codex 专属 ${listDirs(CODEX_EXTRA).length}` +
    (stale.length ? `；清理 ${stale.length} 个过期目录（${stale.join(', ')}）` : ''),
);
