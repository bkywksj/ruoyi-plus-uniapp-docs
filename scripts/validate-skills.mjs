#!/usr/bin/env node
// 技能体系一致性校验：pnpm check:skills
// 检查项（error 会让命令失败，warning 只提示）：
//   1. 每个技能目录都有 SKILL.md，frontmatter 的 name 与目录名一致，description 含「触发词：」段（hook 从这里取触发词）
//   2. hook（skill-forced-eval.cjs）里的技能清单与 .claude/skills/ 目录完全一致
//   3. 每个命令文件都有 frontmatter description；CLAUDE.md「快速命令」表里的命令都存在
//   4. .claude/ .codex/ src/ scripts/ 与根文档没有 UTF-8 BOM
//   5. .agents/skills 与源头一致（没跑 pnpm agents:sync 会报出来）
//   6. 技能里引用的框架文件路径是否真实存在（warning：可能是「待创建」的示例路径）
//   7. module-strip 各预设在当前代码上能完整预演（锚点没有因页面改动而失效）；已裁模块跑 --audit，改造模块两者都不做
//   8. 参考代码表（CLAUDE.md / AGENTS.md / .claude/agents/*.md / PROJECT.md 覆盖表）里的 src/ scripts/ 路径必须存在；
//      属于已裁剪 / 已改造模块的只警告并点名模块
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const require = createRequire(import.meta.url);
const { SKILLS } = require(join(ROOT, '.claude', 'hooks', 'skill-forced-eval.cjs'));

const errors = [];
const warnings = [];
const rel = (file) => relative(ROOT, file).split(sep).join('/');

const listDirs = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory()) : [];

function walk(dir, filter) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    if (name === 'node_modules' || name === 'dist' || name === '.astro') return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full, filter) : filter(full) ? [full] : [];
  });
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

/** 取 frontmatter 里 description 的纯文本（支持单行与 | / > 多行块） */
function descriptionOf(fm) {
  const lines = fm.split(/\r?\n/);
  const start = lines.findIndex((line) => /^description:/.test(line));
  if (start === -1) return '';
  const inline = lines[start].replace(/^description:\s*/, '');
  if (inline && !/^[|>][-+]?$/.test(inline)) return inline.replace(/^['"](.*)['"]$/, '$1').trim();
  const block = [];
  for (let i = start + 1; i < lines.length && (/^\s+/.test(lines[i]) || lines[i] === ''); i += 1)
    block.push(lines[i].trim());
  return block.join('').trim();
}

// Claude Code 技能列表有总字符预算（官方文档：约为上下文窗口的 1%，单条 description 超 1536 字符直接截断），
// 描述过长时部分技能在列表里只剩名字（真实会话演练中 11 个技能、5 个命令出现过这种情况），hook 失效时就几乎发现不了
const MAX_SKILL_DESCRIPTION = 200;
const MAX_COMMAND_DESCRIPTION = 120;

// 1. 技能文件结构
const skillsDir = join(ROOT, '.claude', 'skills');
const skillDirs = listDirs(skillsDir);
for (const name of skillDirs) {
  const file = join(skillsDir, name, 'SKILL.md');
  if (!existsSync(file)) {
    errors.push(`.claude/skills/${name}/ 缺少 SKILL.md`);
    continue;
  }
  const fm = frontmatter(readFileSync(file, 'utf8'));
  if (!fm) {
    errors.push(`${name}: SKILL.md 缺少 frontmatter`);
    continue;
  }
  const declared = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  if (declared !== name) errors.push(`${name}: frontmatter name 为「${declared}」，应与目录名一致`);
  if (!/^description:/m.test(fm)) errors.push(`${name}: frontmatter 缺少 description`);
  else {
    const description = descriptionOf(fm);
    // hook 注入清单的触发词就取自这一段，缺了清单里只剩技能名，所以是 error
    if (!/触发词：/.test(description))
      errors.push(`${name}: description 里没有「触发词：」段（hook 注入清单从这里取触发词）`);
    const length = Array.from(description).length;
    if (length > MAX_SKILL_DESCRIPTION) {
      errors.push(
        `${name}: description ${length} 字符，超过 ${MAX_SKILL_DESCRIPTION}（触发场景挪到正文「## 何时使用」）`,
      );
    }
  }
}

// 2. hook 清单 ↔ 目录
const hookNames = SKILLS.map(([name]) => name);
const duplicated = hookNames.filter((name, index) => hookNames.indexOf(name) !== index);
if (duplicated.length) errors.push(`hook 技能清单有重复：${duplicated.join(', ')}`);
// hook 里也允许登记命令（少数希望参与自动评估的命令），所以存在同名命令文件也算合法
const commandFileNames = existsSync(join(ROOT, '.claude', 'commands'))
  ? readdirSync(join(ROOT, '.claude', 'commands')).map((file) => file.replace(/\.md$/, ''))
  : [];
for (const name of hookNames) {
  if (!skillDirs.includes(name) && !commandFileNames.includes(name)) {
    errors.push(`hook 列了 ${name}，但 .claude/skills/${name}/ 与 .claude/commands/${name}.md 都不存在`);
  }
}
for (const name of skillDirs) {
  if (!hookNames.includes(name))
    errors.push(`.claude/skills/${name}/ 存在，但 hook 技能清单里没有（模型永远不会被提示激活它）`);
}
// hook 的触发词运行时取自 description 的「触发词：」段。技能缺这一段在第 1 项已报错，这里只补查登记进 hook 的命令
for (const [name, triggers] of SKILLS) {
  if (!skillDirs.includes(name) && !triggers.replace(/^仅当.*?——\s*/, ''))
    errors.push(
      `hook 登记了命令 ${name}，但 .claude/commands/${name}.md 的 description 没有「触发词：」段，注入清单里只剩名字`,
    );
}

// 3. 命令
const commandsDir = join(ROOT, '.claude', 'commands');
const commands = existsSync(commandsDir)
  ? readdirSync(commandsDir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''))
  : [];
for (const command of commands) {
  const fm = frontmatter(readFileSync(join(commandsDir, `${command}.md`), 'utf8'));
  if (!fm || !/^description:/m.test(fm)) errors.push(`/${command}: 命令文件缺少 frontmatter description`);
  else {
    const length = Array.from(descriptionOf(fm)).length;
    if (length > MAX_COMMAND_DESCRIPTION)
      errors.push(`/${command}: description ${length} 字符，超过 ${MAX_COMMAND_DESCRIPTION}`);
  }
}
const claudeMd = existsSync(join(ROOT, 'CLAUDE.md')) ? readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8') : '';
const quickSection = claudeMd.split('## 快速命令')[1]?.split(/\n## /)[0] ?? '';
// Claude Code 内置命令不是项目命令文件，出现在说明里不算缺失
const BUILTIN_COMMANDS = new Set([
  'loop',
  'init',
  'clear',
  'compact',
  'config',
  'help',
  'model',
  'review',
  'mcp',
]);
const mentioned = [...new Set([...quickSection.matchAll(/`\/([a-z][a-z0-9-]*)`/g)].map((m) => m[1]))].filter(
  (name) => !BUILTIN_COMMANDS.has(name),
);
for (const command of mentioned) {
  if (!commands.includes(command))
    errors.push(`CLAUDE.md 快速命令表列了 /${command}，但 .claude/commands/${command}.md 不存在`);
}

// 4. BOM
const textExt = /\.(md|mjs|cjs|js|ts|tsx|astro|json|css|toml|conf|ya?ml)$/;
const bomTargets = [
  ...walk(join(ROOT, '.claude'), (f) => textExt.test(f)),
  ...walk(join(ROOT, '.codex'), (f) => textExt.test(f)),
  ...walk(join(ROOT, 'src'), (f) => textExt.test(f)),
  ...walk(join(ROOT, 'scripts'), (f) => textExt.test(f)),
  ...['CLAUDE.md', 'AGENTS.md', 'README.md', 'package.json', 'astro.config.ts']
    .map((f) => join(ROOT, f))
    .filter(existsSync),
];
for (const file of bomTargets) {
  const head = readFileSync(file).subarray(0, 3);
  if (head[0] === 0xef && head[1] === 0xbb && head[2] === 0xbf) errors.push(`${rel(file)} 带 UTF-8 BOM`);
}

// 5. .agents 镜像
const agentsDir = join(ROOT, '.agents', 'skills');
if (!existsSync(agentsDir)) {
  warnings.push('.agents/skills 不存在：运行 pnpm agents:sync 生成 Codex 技能镜像');
} else {
  // 逐文件比对（含 scripts / presets / templates 等附属文件），不只看 SKILL.md
  for (const name of skillDirs) {
    const sourceDir = join(skillsDir, name);
    const mirrorDir = join(agentsDir, name);
    if (!existsSync(join(mirrorDir, 'SKILL.md'))) {
      errors.push(`.agents/skills/${name} 缺失：运行 pnpm agents:sync`);
      continue;
    }
    const sourceFiles = walk(sourceDir, () => true).map((file) => relative(sourceDir, file));
    const drifted = sourceFiles.filter((file) => {
      const mirrorFile = join(mirrorDir, file);
      return !existsSync(mirrorFile) || !readFileSync(join(sourceDir, file)).equals(readFileSync(mirrorFile));
    });
    if (drifted.length) {
      errors.push(
        `.agents/skills/${name} 与源头不一致（${drifted.slice(0, 3).join(', ')}${drifted.length > 3 ? ' …' : ''}）：运行 pnpm agents:sync`,
      );
    }
  }
  for (const command of commands.filter((name) => !name.endsWith('-local'))) {
    const skillName = skillDirs.includes(command) ? `cmd-${command}` : command;
    if (!existsSync(join(agentsDir, skillName, 'SKILL.md')))
      errors.push(`.agents/skills/${skillName}（/${command}）缺失：运行 pnpm agents:sync`);
  }
}

// 5b. AGENTS.md 技能索引（第四方：目录 / hook / .agents / AGENTS.md 必须一致）
const agentsMd = existsSync(join(ROOT, 'AGENTS.md')) ? readFileSync(join(ROOT, 'AGENTS.md'), 'utf8') : '';
const indexBlock = agentsMd.match(/<!-- skills:start -->([\s\S]*?)<!-- skills:end -->/)?.[1] ?? '';
for (const name of skillDirs) {
  if (!indexBlock.includes(`\`${name}\``))
    errors.push(`AGENTS.md 技能索引缺少 ${name}：运行 pnpm agents:sync`);
}

// 6. 技能引用的框架路径
const pathPattern = /`((?:src|scripts|deploy|tests|public|docs)\/[^`\s]+?)`/g;
const missingRefs = new Map();
for (const name of skillDirs) {
  const file = join(skillsDir, name, 'SKILL.md');
  if (!existsSync(file)) continue;
  for (const [, ref] of readFileSync(file, 'utf8').matchAll(pathPattern)) {
    // 占位符 / 通配 / 示例名 一律跳过
    if (/[<>{}*[\]]|xxx|\.\.\.|…|<name>|example\.com/i.test(ref)) continue;
    const clean = ref.replace(/[:#].*$/, '').replace(/[，。、；）)]+$/, '');
    if (!existsSync(join(ROOT, clean))) {
      const list = missingRefs.get(name) ?? [];
      if (!list.includes(clean)) list.push(clean);
      missingRefs.set(name, list);
    }
  }
}
for (const [name, refs] of missingRefs) {
  warnings.push(
    `${name}: 引用了不存在的路径（若是「待创建」示例可忽略）→ ${refs.slice(0, 6).join(', ')}${refs.length > 6 ? ' …' : ''}`,
  );
}

// 7. module-strip 预设锚点：预设靠文件内容定位要删改的代码，改了 index.astro / llms.txt.ts / content.config.ts
//    等文件后锚点可能失效（预览时该模块会被跳过，退出码非 0），在这里统一预演一遍
//    已经裁掉的模块（.framework-sync.json 的 strippedModules）锚点本来就不在了，不再预演，
//    改为用 --audit 检查它们有没有被框架同步「复活」
//    改造过的模块（transformedModules，如 works → videos）：原文件已改名 / 改写，预设的锚点和删除清单都不再适用
//    （works 预设会把改写成视频站的 e2e / schema 测试当成「带回的示例文件」），既不预演也不 audit；
//    上游对它们的改动由 framework-sync 逐条人工判断
const stripScript = join(ROOT, '.claude', 'skills', 'module-strip', 'scripts', 'module-strip.mjs');
const presetsDir = join(ROOT, '.claude', 'skills', 'module-strip', 'presets');
const syncFile = join(ROOT, '.framework-sync.json');
const syncConfig = existsSync(syncFile) ? JSON.parse(readFileSync(syncFile, 'utf8')) : {};
const strippedModules = syncConfig.strippedModules ?? [];
const transformedModules = Array.isArray(syncConfig.transformedModules)
  ? syncConfig.transformedModules
  : Object.keys(syncConfig.transformedModules ?? {});
// 裁掉与改造是互斥的两种状态，同时登记说明记账写错了（框架同步会按「跳过」处理，漏掉该移植的修复）
const bothStates = strippedModules.filter((name) => transformedModules.includes(name));
if (bothStates.length) {
  errors.push(
    `.framework-sync.json 里 ${bothStates.join(', ')} 同时在 strippedModules 与 transformedModules：裁掉的留前者，改造的留后者`,
  );
}
const runStrip = (args) =>
  spawnSync(process.execPath, [stripScript, ...args], { cwd: ROOT, encoding: 'utf8' });
const outputTail = (result) =>
  `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().split('\n').slice(-3).join(' / ');
if (existsSync(stripScript) && existsSync(presetsDir)) {
  const presets = readdirSync(presetsDir)
    .filter((file) => file.endsWith('.json') && !file.startsWith('_'))
    .map((file) => file.replace(/\.json$/, ''))
    .filter((preset) => !strippedModules.includes(preset) && !transformedModules.includes(preset));
  for (const preset of presets) {
    const result = runStrip([preset, '--preview']);
    if (result.status !== 0) {
      errors.push(
        `module-strip 预设「${preset}」预演失败（退出码 ${result.status}），锚点可能已失效：${outputTail(result)}`,
      );
    }
  }
  if (strippedModules.length) {
    const audit = runStrip(['--audit']);
    if (audit.status !== 0) {
      errors.push(
        `已裁剪的模块（${strippedModules.join(', ')}）有文件被恢复（多半是框架同步带回来的）：${outputTail(audit)}`,
      );
    }
  }
}

// 8. 参考代码表：AI 写页面前照着读的文件清单，路径失效时它会去读不存在的文件或凭记忆仿写
//    孵化项目裁掉 / 改造模块后，框架这几张表必然留下死路径——它们来自框架、会被框架同步覆盖，
//    所以不改原表，而是在 .claude/PROJECT.md 写「参考代码位置（覆盖 CLAUDE.md）」表；这类路径只警告并点名模块
/**
 * 取 Markdown 里某个标题下的正文，到下一个同级或更高级标题为止
 * @param text 文档全文
 * @param heading 标题行开头（含 # 号），如 '### 参考代码位置'
 * @returns 小节正文；找不到标题时返回 null
 */
function sectionOf(text, heading) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(heading));
  if (start === -1) return null;
  const level = heading.match(/^#+/)[0].length;
  const nextHeading = new RegExp(`^#{1,${level}} `);
  const end = lines.findIndex((line, index) => index > start && nextHeading.test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}
// 与第 6 项不同：动态路由文件名本身带方括号（[id].astro、[...id].astro），不能当占位符跳过
const refPathPattern = /`((?:src|scripts)\/[^`\s]+?)`/g;
const isRefPlaceholder = (ref) => /[<>{}*]|xxx|…/i.test(ref);
const refPathsIn = (text) =>
  [...new Set([...text.matchAll(refPathPattern)].map(([, ref]) => ref))]
    .filter((ref) => !isRefPlaceholder(ref))
    .map((ref) => ref.replace(/[:#].*$/, '').replace(/[，。、；）)]+$/, ''));

// 已裁剪 / 已改造模块各自拥有的路径（取自预设的删除清单）
const moduleOwnedPaths = new Map();
for (const name of [...strippedModules, ...transformedModules]) {
  const presetFile = join(presetsDir, `${name}.json`);
  if (!existsSync(presetFile)) continue;
  const preset = JSON.parse(readFileSync(presetFile, 'utf8'));
  moduleOwnedPaths.set(name, [...(preset.delete_dirs ?? []), ...(preset.delete_files ?? [])]);
}
const moduleOwning = (ref) =>
  [...moduleOwnedPaths].find(([, paths]) => paths.some((path) => ref === path || ref.startsWith(`${path}/`)))?.[0];

const projectMdFile = join(ROOT, '.claude', 'PROJECT.md');
const overrideTable = existsSync(projectMdFile)
  ? sectionOf(readFileSync(projectMdFile, 'utf8'), '## 参考代码位置（覆盖 CLAUDE.md）')
  : null;
const agentsDefDir = join(ROOT, '.claude', 'agents');
const refSources = [
  { label: 'CLAUDE.md「参考代码位置」', text: sectionOf(claudeMd, '### 参考代码位置') },
  { label: 'AGENTS.md「页面开发强制要求」', text: sectionOf(agentsMd, '## ⚠️ 页面开发强制要求') },
  ...(existsSync(agentsDefDir)
    ? readdirSync(agentsDefDir)
        .filter((file) => file.endsWith('.md'))
        .map((file) => ({ label: `.claude/agents/${file}`, text: readFileSync(join(agentsDefDir, file), 'utf8') }))
    : []),
];
const ownedMissing = new Map(); // `${label}|${模块}` → 路径列表，按来源与模块聚合，避免一张表刷出十几条
for (const { label, text } of refSources) {
  if (!text) continue;
  for (const ref of refPathsIn(text)) {
    if (existsSync(join(ROOT, ref))) continue;
    const owner = moduleOwning(ref);
    if (!owner) {
      // 不属于任何预设、但项目已在覆盖表里登记替代（如孵化时按提示人工删掉的 sync 示例源 example.mjs）：
      // 原表来自框架、改了会被同步覆盖，所以只警告。覆盖表里原路径写成不带反引号的纯文本，避免被当成「必须存在」
      if (overrideTable?.includes(ref)) {
        warnings.push(`${label} 引用的 ${ref} 不存在（PROJECT.md 覆盖表已登记替代）`);
        continue;
      }
      errors.push(`${label} 引用的 ${ref} 不存在：改成实际存在的文件，或删掉这一行`);
      continue;
    }
    const key = `${label}|${owner}`;
    ownedMissing.set(key, [...(ownedMissing.get(key) ?? []), ref]);
  }
}
for (const [key, refs] of ownedMissing) {
  const [label, owner] = key.split('|');
  const state = strippedModules.includes(owner) ? '已裁剪' : '已改造';
  const hint = overrideTable
    ? '以 PROJECT.md 的覆盖表为准'
    : '在 .claude/PROJECT.md 写「## 参考代码位置（覆盖 CLAUDE.md）」表给出替代文件';
  warnings.push(`${label} 引用了${state}模块 ${owner} 的路径（${hint}）→ ${refs.join(', ')}`);
}
// 覆盖表是项目自己写的，里面的路径不存在一律算错
if (overrideTable) {
  for (const ref of refPathsIn(overrideTable)) {
    if (!existsSync(join(ROOT, ref)))
      errors.push(`PROJECT.md「参考代码位置（覆盖 CLAUDE.md）」引用的 ${ref} 不存在`);
  }
}

console.log(
  `\n技能体系校验：技能 ${skillDirs.length} 个（hook 登记 ${hookNames.length} 个）、命令 ${commands.length} 个`,
);
if (warnings.length) {
  console.log(`\n⚠️  警告 ${warnings.length} 条：`);
  warnings.forEach((line) => console.log(`  - ${line}`));
}
if (errors.length) {
  console.log(`\n❌ 错误 ${errors.length} 条：`);
  errors.forEach((line) => console.log(`  - ${line}`));
  process.exit(1);
}
console.log('\n✅ 全部通过');
