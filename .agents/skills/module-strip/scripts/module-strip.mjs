#!/usr/bin/env node
// module-strip：按预设裁剪 next-ai-astro 的示例模块（文章 / 作品 / FAQ / 示例数据）
//
// 用法（在要裁剪的项目根目录执行，或用 --target 指定）：
//   node .claude/skills/module-strip/scripts/module-strip.mjs --list
//   node .claude/skills/module-strip/scripts/module-strip.mjs posts faq --preview
//   node .claude/skills/module-strip/scripts/module-strip.mjs posts faq --verify
//   node .claude/skills/module-strip/scripts/module-strip.mjs works --target ../my-site-delivery
//   node .claude/skills/module-strip/scripts/module-strip.mjs --audit
//
// 设计要点：
//   1. 预设 = 删目录 / 删文件 / 锚点式文本改动（presets/*.json），不做 AST 解析，零依赖
//   2. 每个模块「先全部预检、再一次性应用」：任一必需改动的锚点找不到 → 整个模块跳过，绝不半截裁剪
//   3. 真正写盘前要求目标是 git 干净工作区（或交付目录），出错可整体回退
//   4. 拒绝在框架模板仓库本身执行真实裁剪（预览与 --audit 不受限）
//   5. 裁剪结果记入目标项目的 .framework-sync.json（strippedModules），framework-sync 同步时据此跳过；
//      已记录的模块再次预览 / 裁剪时直接跳过（锚点早已不在，报「预检失败」只会误导）
//   6. --audit 只读检查已裁模块的文件有没有被框架同步「带回来」
//   6b. 改造过的模块（.framework-sync.json 的 transformedModules，如 works → videos）没被裁掉，而是改名 / 改写成了别的东西：
//      预设的锚点与删除清单都不再适用，预览 / 裁剪按「已改造」跳过，--audit 也不检查（否则会把改写后的测试当成被带回的示例）
//   7. 参数写错（如 --delivery、--preveiw）一律报错退出：静默忽略会让一次本想预览的调用真的去删文件
//   8. 几个模块共用的文件（presets/_shared-*.json，如 guides 与 docs 共用的侧栏树、站内搜索）：成员模块全部不在了才裁，
//      只裁其中一个时保留并在报告里说明；共享部分不记入 strippedModules（它不是模块）
//
// 退出码：0 成功 / 1 --audit 发现被带回的文件 / 2 安全拦截、参数错误或有模块预检失败 / 3 环境异常 / 4 --verify 未通过
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRESETS_DIR = join(SKILL_DIR, 'presets');
const TEMPLATE_PACKAGE_NAME = 'next-ai-astro';

const EXIT = { OK: 0, AUDIT_FOUND: 1, SAFETY: 2, ENV: 3, VERIFY: 4 };
const USAGE =
  '用法：module-strip.mjs <模块...> [--preview|--dry-run] [--verify] [--target <目录>] [--force] [--allow-template]\n' +
  '      module-strip.mjs --audit [<模块...>] [--target <目录>]\n' +
  '      module-strip.mjs --list';

// ---------- 参数 ----------
// 逐个解析：未知参数直接报错，避免拼错的开关被当成「没传」而执行真实裁剪
const BOOLEAN_FLAGS = new Set(['--list', '--preview', '--dry-run', '--verify', '--force', '--allow-template', '--audit', '--help', '-h']);
const VALUE_OPTIONS = new Set(['--target']);
const flags = new Set();
const options = new Map();
const modules = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (BOOLEAN_FLAGS.has(arg)) {
    flags.add(arg);
  } else if (VALUE_OPTIONS.has(arg)) {
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('-')) {
      console.error(`❌ ${arg} 需要一个值\n${USAGE}`);
      process.exit(EXIT.SAFETY);
    }
    options.set(arg, value);
    i += 1;
  } else if (arg.startsWith('-')) {
    const hint = arg === '--delivery' ? '（交付目录请用 --target <交付目录>，目录见 .delivery-sync.json 的 deliveryDir）' : '';
    console.error(`❌ 未知参数：${arg}${hint}\n${USAGE}`);
    process.exit(EXIT.SAFETY);
  } else {
    modules.push(arg);
  }
}
const flag = (name) => flags.has(name);
const preview = flag('--preview') || flag('--dry-run');
const verify = flag('--verify');
const force = flag('--force');
const allowTemplate = flag('--allow-template');
const audit = flag('--audit');
const target = resolve(options.get('--target') ?? process.cwd());

if (flag('--help') || flag('-h')) {
  console.log(USAGE);
  process.exit(EXIT.OK);
}
if (audit && (preview || verify || force || allowTemplate)) {
  console.error('❌ --audit 是只读检查，不能与 --preview / --verify / --force / --allow-template 同用');
  process.exit(EXIT.SAFETY);
}

function loadPresets() {
  const presets = new Map();
  for (const file of readdirSync(PRESETS_DIR).filter((name) => name.endsWith('.json') && !name.startsWith('_'))) {
    const preset = JSON.parse(readFileSync(join(PRESETS_DIR, file), 'utf8'));
    presets.set(file.replace(/\.json$/, ''), preset);
  }
  return presets;
}

const presets = loadPresets();

/**
 * 几个模块共用的文件与改动（presets/_shared-*.json，{ name, modules: [...], delete_dirs, delete_files, edits }）：
 * 只裁其中一个模块时必须留着（如 guides 与 docs 都用侧栏树、站内搜索），成员全部不在了才删。
 * 「不在」= 已裁（strippedModules）、本次一起裁、或项目里本来就没有（预设的 marker 文件不存在）；改造过的模块（transformedModules）算在
 */
function loadShared() {
  return readdirSync(PRESETS_DIR)
    .filter((name) => name.startsWith('_shared-') && name.endsWith('.json'))
    .map((file) => ({ file, ...JSON.parse(readFileSync(join(PRESETS_DIR, file), 'utf8')) }));
}
const sharedGroups = loadShared();

if (flag('--list') || (modules.length === 0 && !audit)) {
  console.log('可用的裁剪预设：\n');
  for (const [name, preset] of presets) {
    console.log(`  ${name.padEnd(10)} ${preset.name} —— ${preset.description}`);
  }
  for (const group of sharedGroups) {
    console.log(`\n  共享部分「${group.name}」：${group.modules.join(' 与 ')} 都裁掉后才删 —— ${group.description}`);
  }
  console.log(`\n${USAGE}`);
  process.exit(EXIT.OK);
}

// ---------- 环境与安全检查 ----------
const unknown = modules.filter((name) => !presets.has(name));
if (unknown.length) {
  console.error(`❌ 没有这些预设：${unknown.join(', ')}；可用：${[...presets.keys()].join(', ')}`);
  process.exit(EXIT.ENV);
}

const pkgFile = join(target, 'package.json');
const hasAstroConfig = ['astro.config.ts', 'astro.config.mjs', 'astro.config.js'].some((name) =>
  existsSync(join(target, name)),
);
if (!existsSync(pkgFile) || !hasAstroConfig) {
  console.error(`❌ ${target} 不是 Astro 项目根目录（缺 package.json 或 astro.config.*）`);
  process.exit(EXIT.ENV);
}

const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'));
const syncFile = join(target, '.framework-sync.json');
const isDelivery = existsSync(join(target, '.delivery-sync-marker'));
const isTemplate = pkg.name === TEMPLATE_PACKAGE_NAME && !existsSync(syncFile) && !isDelivery;

let syncData = null;
if (existsSync(syncFile)) {
  try {
    syncData = JSON.parse(readFileSync(syncFile, 'utf8'));
  } catch (error) {
    console.error(`❌ .framework-sync.json 不是合法 JSON：${error.message}`);
    process.exit(EXIT.ENV);
  }
}
const alreadyStripped = new Set(Array.isArray(syncData?.strippedModules) ? syncData.strippedModules : []);
// transformedModules 约定为 { 模块名: 改名对照说明 }；手写成数组也兼容（此时没有说明）
const rawTransformed = syncData?.transformedModules;
const transformed = new Map(
  Array.isArray(rawTransformed)
    ? rawTransformed.map((name) => [name, ''])
    : Object.entries(rawTransformed && typeof rawTransformed === 'object' ? rawTransformed : {}),
);
const transformedNote = (name) => (transformed.get(name) ? `：${transformed.get(name)}` : '');

function countFiles(full) {
  if (!existsSync(full)) return 0;
  if (!statSync(full).isDirectory()) return 1;
  return readdirSync(full).reduce((sum, name) => sum + countFiles(join(full, name)), 0);
}

// ---------- --audit：只读检查已裁模块是否被「带回来」 ----------
// 典型场景：framework-sync 合并了框架对 src/pages/posts/ 的修复，而本项目早已裁掉 posts。
// 只看预设的 delete_dirs / delete_files 与 write_json 守卫（示例数据标记），不看文本锚点：
// 锚点在裁剪后本来就不存在，拿它判断只会得到「预检失败」这种无用信号。
if (audit) {
  const fromCli = modules.length > 0;
  const list = fromCli ? modules : [...alreadyStripped];
  if (list.length === 0) {
    console.log(`没有需要检查的模块：${existsSync(syncFile) ? '.framework-sync.json 的 strippedModules 为空' : '没有 .framework-sync.json'}，命令行也没指定模块`);
    process.exit(EXIT.OK);
  }
  console.log(`\n已裁模块回归检查（只读）：${target}`);
  console.log(`  检查对象：${list.join(', ')}（来源：${fromCli ? '命令行' : '.framework-sync.json strippedModules'}）`);
  const found = [];
  for (const name of list) {
    if (transformed.has(name)) {
      console.log(`  🔁 ${name}：已改造（transformedModules${transformedNote(name)}），不检查；上游对它的改动由 framework-sync 逐条判断`);
      continue;
    }
    const preset = presets.get(name);
    if (!preset) {
      console.log(`  ⚠️  ${name}：没有同名预设，无法检查（预设被删或是手工裁剪的模块）`);
      continue;
    }
    for (const rel of [...(preset.delete_dirs ?? []), ...(preset.delete_files ?? [])]) {
      const count = countFiles(join(target, rel));
      if (count > 0) found.push({ name, rel, note: `${count} 个文件` });
    }
    for (const edit of preset.edits ?? []) {
      if (edit.op !== 'write_json' || !edit.only_if_contains) continue;
      const full = join(target, edit.file);
      if (existsSync(full) && readFileSync(full, 'utf8').includes(edit.only_if_contains)) {
        found.push({ name, rel: edit.file, note: `又出现了示例标记 ${edit.only_if_contains}` });
      }
    }
  }
  // 共享部分：成员全部在检查对象里（都已裁）时，它的文件也不该再出现
  for (const group of sharedGroups) {
    if (!group.modules.every((name) => list.includes(name) && !transformed.has(name))) continue;
    for (const rel of [...(group.delete_dirs ?? []), ...(group.delete_files ?? [])]) {
      const count = countFiles(join(target, rel));
      if (count > 0) found.push({ name: `共享：${group.name}`, rel, note: `${count} 个文件` });
    }
  }
  if (found.length === 0) {
    console.log('\n✅ 没有发现被带回的文件');
    process.exit(EXIT.OK);
  }
  console.log(`\n⛔ 发现 ${found.length} 处被带回的内容：`);
  found.forEach(({ name, rel, note }) => console.log(`   - [${name}] ${rel}（${note}）`));
  console.log('\n处理：确认是同步误带回的 → 删除这些文件（git rm）；若是有意恢复该模块 → 从 .framework-sync.json 的 strippedModules 移除');
  process.exit(EXIT.AUDIT_FOUND);
}

if (isTemplate && !preview && !allowTemplate) {
  console.error(
    '🛑 目标是框架模板仓库本身（package.json name = next-ai-astro 且没有 .framework-sync.json）。\n' +
      '   模板要保留全部示例模块，裁剪只在孵化出的项目或交付目录里做。\n' +
      '   只想看会改什么：加 --preview；确实要裁模板：加 --allow-template。',
  );
  process.exit(EXIT.SAFETY);
}

function git(args) {
  const result = spawnSync('git', args, { cwd: target, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

const isGitRepo = git(['rev-parse', '--is-inside-work-tree']) === 'true';
if (!preview && isGitRepo && !force) {
  const dirty = git(['status', '--porcelain']);
  if (dirty) {
    console.error(
      '🛑 目标仓库有未提交改动。裁剪会改动多个文件，需要从干净状态开始才能整体回退。\n' +
        '   先提交当前工作，或确认无妨后加 --force。\n' +
        dirty
          .split('\n')
          .slice(0, 10)
          .map((line) => `   ${line}`)
          .join('\n'),
    );
    process.exit(EXIT.SAFETY);
  }
}
if (!preview && !isGitRepo && !isDelivery && !force) {
  console.error('🛑 目标既不是 git 仓库也不是交付目录（无 .delivery-sync-marker），裁剪后无法回退。确认无妨后加 --force。');
  process.exit(EXIT.SAFETY);
}

// ---------- 依赖展开 ----------
// 已记录在 strippedModules 里的模块直接跳过：它们的锚点在裁剪后必然不存在，再预检只会报「失败」
const ordered = [];
const skippedAsStripped = [];
const skippedAsTransformed = [];
function addModule(name, chain = []) {
  if (ordered.includes(name) || skippedAsStripped.includes(name) || skippedAsTransformed.includes(name)) return;
  if (chain.includes(name)) throw new Error(`预设依赖成环：${[...chain, name].join(' → ')}`);
  const preset = presets.get(name);
  if (!preset) throw new Error(`依赖的预设不存在：${name}`);
  if (alreadyStripped.has(name)) {
    skippedAsStripped.push(name);
    return;
  }
  // 改造模块与已裁模块同样处理：锚点已随改名 / 改写失效，再预检只会报「失败」，真删则会删掉改造后的代码
  if (transformed.has(name)) {
    skippedAsTransformed.push(name);
    return;
  }
  for (const dep of preset.depends_on ?? []) addModule(dep, [...chain, name]);
  ordered.push(name);
}
modules.forEach((name) => addModule(name));

// ---------- 文本改动引擎（在内存里对文件内容做变换） ----------
const files = new Map(); // 相对路径 → 当前内容（内存态，预检与应用共用）
// 已被前面模块排定删除的路径：后续模块读它们视为「不存在」，写盘阶段也跳过，
// 否则 works + examples 同时裁剪时，examples 会把刚删掉的 works.json 重新写回来
const deleted = new Set();
const isDeleted = (rel) => [...deleted].some((path) => rel === path || rel.startsWith(`${path}/`));
function readText(rel) {
  if (isDeleted(rel)) return null;
  if (files.has(rel)) return files.get(rel);
  const full = join(target, rel);
  const content = existsSync(full) ? readFileSync(full, 'utf8') : null;
  files.set(rel, content);
  return content;
}

const toLines = (text) => text.split('\n');
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 执行单个改动，返回 { ok, content, note }；ok=false 且非 optional 时整个模块放弃
 * 支持的 op：
 *   remove_lines      { contains: [...] }                 删除包含任一字面量的整行（每个字面量至少命中 1 行）
 *   replace           { find, replace }                   字面量替换，find 必须恰好出现 1 次
 *   replace_regex     { pattern, flags?, replace }        正则替换，至少命中 1 处
 *   remove_block      { start, end, wrap_before?, wrap_after?, blank_before?, blank_after? }
 *                     从含 start 的行删到其后第一个含 end 的行（含）；wrap_* 是必须逐行核对内容的包裹行（trim 后比较），
 *                     blank_* 只在相邻行确实为空时顺带删掉（二者都有时优先删后面的空行）
 *   remove_list_item  { anchor, item }                    在含 anchor 的那一行里，把 item 从逗号列表中删掉（{ a, b } / [a, b]）
 *   write_json        { value, only_if_contains? }        整个文件替换为 JSON（常用于清空示例数据），可加内容守卫
 *   first_of          { options: [改动, …] }              依次尝试候选改动（各自带 op），第一个命中的生效；用于同一段代码的多种排版
 */
function applyEdit(content, edit) {
  switch (edit.op) {
    case 'remove_lines': {
      const lines = toLines(content);
      for (const needle of edit.contains) {
        if (!lines.some((line) => line.includes(needle))) return { ok: false, note: `找不到行：${needle}` };
      }
      const kept = lines.filter((line) => !edit.contains.some((needle) => line.includes(needle)));
      return { ok: true, content: kept.join('\n') };
    }
    case 'replace': {
      const count = content.split(edit.find).length - 1;
      if (count !== 1) return { ok: false, note: `字面量应恰好出现 1 次，实际 ${count} 次：${edit.find}` };
      return { ok: true, content: content.replace(edit.find, () => edit.replace) };
    }
    case 'replace_regex': {
      const regex = new RegExp(edit.pattern, edit.flags ?? '');
      if (!regex.test(content)) return { ok: false, note: `正则未命中：${edit.pattern}` };
      return { ok: true, content: content.replace(new RegExp(edit.pattern, edit.flags ?? ''), edit.replace) };
    }
    case 'remove_block': {
      const lines = toLines(content);
      const startIndex = lines.findIndex((line) => line.includes(edit.start));
      if (startIndex < 0) return { ok: false, note: `找不到块起点：${edit.start}` };
      const endOffset = lines.slice(startIndex).findIndex((line) => line.includes(edit.end));
      if (endOffset < 0) return { ok: false, note: `找不到块终点：${edit.end}` };
      let from = startIndex;
      let to = startIndex + endOffset;
      // 包裹行（如 JSX 里的 `{` … `)` `}`）必须逐行核对内容，对不上就放弃，绝不盲删相邻行
      const wrapBefore = edit.wrap_before ?? [];
      for (let i = wrapBefore.length - 1; i >= 0; i -= 1) {
        if (lines[from - 1]?.trim() !== wrapBefore[i]) {
          return { ok: false, note: `块前一行应为「${wrapBefore[i]}」，实际「${lines[from - 1]?.trim() ?? '(无)'}」` };
        }
        from -= 1;
      }
      for (const expected of edit.wrap_after ?? []) {
        if (lines[to + 1]?.trim() !== expected) {
          return { ok: false, note: `块后一行应为「${expected}」，实际「${lines[to + 1]?.trim() ?? '(无)'}」` };
        }
        to += 1;
      }
      // 相邻空行：只有真的是空行才一并删掉，避免留下双空行
      if (edit.blank_after && lines[to + 1]?.trim() === '') to += 1;
      else if (edit.blank_before && lines[from - 1]?.trim() === '') from -= 1;
      lines.splice(from, to - from + 1);
      return { ok: true, content: lines.join('\n') };
    }
    case 'remove_list_item': {
      const lines = toLines(content);
      const index = lines.findIndex((line) => line.includes(edit.anchor));
      if (index < 0) return { ok: false, note: `找不到列表所在行：${edit.anchor}` };
      // 词边界只加在「字母数字」一侧：getPosts() 以 ) 结尾，) 与 ] 之间不存在 \b，硬加会永远匹配不上
      const lead = /^\w/.test(edit.item) ? '\\b' : '';
      const tail = /\w$/.test(edit.item) ? '\\b' : '';
      const item = `${lead}${escapeRegExp(edit.item)}${tail}`;
      const line = lines[index];
      // 依次尝试：「item, 」（首项/中间项）→「, item」（末项）→「item」（唯一项）
      const candidates = [
        new RegExp(`${item}\\s*,\\s*`),
        new RegExp(`\\s*,\\s*${item}`),
        new RegExp(item),
      ];
      const hit = candidates.find((regex) => regex.test(line));
      if (!hit) return { ok: false, note: `列表里没有 ${edit.item}：${line.trim()}` };
      lines[index] = line.replace(hit, '');
      return { ok: true, content: lines.join('\n') };
    }
    case 'write_json': {
      if (edit.only_if_contains && !content.includes(edit.only_if_contains)) {
        return { ok: false, note: `内容已不是框架示例（不含 ${edit.only_if_contains}），不覆盖` };
      }
      return { ok: true, content: `${JSON.stringify(edit.value, null, 2)}\n` };
    }
    case 'first_of': {
      // 同一处代码有多种合法排版（如 Prettier 把 `{` 与条件表达式并到一行、把长 JSX 拆成多行）：
      // 依次尝试候选改动，第一个命中的生效；全不命中才算失败
      const notes = [];
      for (const option of edit.options ?? []) {
        const result = applyEdit(content, option);
        if (result.ok) return result;
        notes.push(result.note);
      }
      return { ok: false, note: `所有候选写法都没命中：${notes.join(' ｜ ')}` };
    }
    default:
      return { ok: false, note: `未知 op：${edit.op}` };
  }
}

// ---------- 预检 + 应用 ----------
const report = [];
const manual = [];
let failedModules = 0;

for (const name of ordered) {
  const preset = presets.get(name);
  const snapshot = new Map(files); // 预检失败时回滚内存态
  const problems = [];
  const touched = new Set();

  for (const edit of preset.edits ?? []) {
    const content = readText(edit.file);
    if (content === null) {
      if (!edit.optional) problems.push(`${edit.file}：文件不存在`);
      continue;
    }
    const result = applyEdit(content, edit);
    if (result.ok) {
      files.set(edit.file, result.content);
      touched.add(edit.file);
    } else if (!edit.optional) {
      problems.push(`${edit.file}：${result.note}${edit.why ? `（用途：${edit.why}）` : ''}`);
    }
  }

  if (problems.length) {
    failedModules += 1;
    files.clear();
    snapshot.forEach((value, key) => files.set(key, value));
    report.push({ name, preset, skipped: true, problems });
    continue;
  }

  const deletions = [...(preset.delete_dirs ?? []), ...(preset.delete_files ?? [])].map((rel) => ({
    rel,
    count: isDeleted(rel) ? 0 : countFiles(join(target, rel)),
  }));
  deletions.forEach(({ rel }) => deleted.add(rel));
  report.push({ name, preset, skipped: false, touched: [...touched], deletions });
  manual.push(...(preset.manual_actions ?? []).map((text) => `[${name}] ${text}`));
}

// ---------- 共享部分：成员模块全部不在了才裁 ----------
const appliedNow = new Set(report.filter((item) => !item.skipped).map((item) => item.name));
const isGone = (name) => {
  if (transformed.has(name)) return false;
  if (alreadyStripped.has(name) || appliedNow.has(name)) return true;
  const marker = presets.get(name)?.marker;
  return Boolean(marker) && !existsSync(join(target, marker));
};
const sharedKept = [];
for (const group of sharedGroups) {
  // 本次没裁它的任何一个成员：要么之前已经一起处理过，要么与本次无关
  if (!group.modules.some((name) => appliedNow.has(name))) continue;
  const keepers = group.modules.filter((name) => !isGone(name));
  if (keepers.length) {
    sharedKept.push({ group, keepers });
    continue;
  }
  const label = `共享：${group.name}`;
  const snapshot = new Map(files);
  const problems = [];
  const touched = new Set();
  for (const edit of group.edits ?? []) {
    const content = readText(edit.file);
    if (content === null) {
      if (!edit.optional) problems.push(`${edit.file}：文件不存在`);
      continue;
    }
    const result = applyEdit(content, edit);
    if (result.ok) {
      files.set(edit.file, result.content);
      touched.add(edit.file);
    } else if (!edit.optional) {
      problems.push(`${edit.file}：${result.note}${edit.why ? `（用途：${edit.why}）` : ''}`);
    }
  }
  if (problems.length) {
    failedModules += 1;
    files.clear();
    snapshot.forEach((value, key) => files.set(key, value));
    report.push({ name: label, preset: group, skipped: true, shared: true, problems });
    continue;
  }
  const deletions = [...(group.delete_dirs ?? []), ...(group.delete_files ?? [])].map((rel) => ({
    rel,
    count: isDeleted(rel) ? 0 : countFiles(join(target, rel)),
  }));
  deletions.forEach(({ rel }) => deleted.add(rel));
  report.push({ name: label, preset: group, skipped: false, shared: true, touched: [...touched], deletions });
  manual.push(...(group.manual_actions ?? []).map((text) => `[${label}] ${text}`));
}

// ---------- 输出 ----------
console.log(`\n模块裁剪${preview ? '预览（未写盘）' : ''}：${target}`);
for (const name of skippedAsStripped) {
  console.log(`\n⏭️  ${name}（${presets.get(name).name}）已裁剪（记录在 .framework-sync.json 的 strippedModules），跳过；要检查是否被框架同步带回，用 --audit`);
}
for (const name of skippedAsTransformed) {
  console.log(`\n🔁 ${name}（${presets.get(name).name}）已改造（transformedModules${transformedNote(name)}），跳过`);
}
for (const item of report) {
  if (item.skipped) {
    console.log(`\n⛔ ${item.name}（${item.preset.name}）已跳过——锚点预检失败，项目可能已改过这些文件，请手动裁剪：`);
    item.problems.forEach((problem) => console.log(`   - ${problem}`));
    continue;
  }
  const removed = item.deletions.filter((d) => d.count > 0);
  console.log(`\n✂️  ${item.name}（${item.preset.name}）`);
  removed.forEach((d) => console.log(`   删除 ${d.rel}（${d.count} 个文件）`));
  item.deletions.filter((d) => d.count === 0).forEach((d) => console.log(`   跳过 ${d.rel}（不存在）`));
  item.touched.forEach((rel) => console.log(`   修改 ${rel}`));
}
for (const { group, keepers } of sharedKept) {
  console.log(`\n🔗 共享部分「${group.name}」保留：${keepers.join('、')} 还在用（${group.modules.join(' 与 ')} 都裁掉后才删）`);
}

if (preview) {
  if (manual.length) {
    console.log('\n裁剪后需人工确认：');
    manual.forEach((text, index) => console.log(`  ${index + 1}. ${text}`));
  }
  process.exit(failedModules ? EXIT.SAFETY : EXIT.OK);
}

// ---------- 写盘 ----------
const applied = report.filter((item) => !item.skipped);
for (const item of applied) {
  for (const { rel } of item.deletions) {
    const full = resolve(target, rel);
    // 防御：任何删除都必须落在目标目录内部
    if (!full.startsWith(target + sep)) throw new Error(`拒绝删除目标目录之外的路径：${full}`);
    if (existsSync(full)) rmSync(full, { recursive: true, force: true });
  }
}
for (const item of applied) {
  for (const rel of item.touched) {
    if (isDeleted(rel)) continue;
    const full = join(target, rel);
    // 多处删除后可能出现连续空行，统一收成一个空行（只作用于本次改过的文件）
    if (existsSync(dirname(full))) writeFileSync(full, files.get(rel).replace(/\n{3,}/g, '\n\n'), 'utf8');
  }
}

if (existsSync(syncFile) && applied.length) {
  const sync = JSON.parse(readFileSync(syncFile, 'utf8'));
  const stripped = new Set(sync.strippedModules ?? []);
  applied.filter((item) => !item.shared).forEach((item) => stripped.add(item.name));
  sync.strippedModules = [...stripped];
  writeFileSync(syncFile, `${JSON.stringify(sync, null, 2)}\n`, 'utf8');
  console.log(`\n已记录到 .framework-sync.json → strippedModules: ${sync.strippedModules.join(', ')}`);
}

if (manual.length) {
  console.log('\n裁剪后需人工确认：');
  manual.forEach((text, index) => console.log(`  ${index + 1}. ${text}`));
}

if (verify && applied.length) {
  console.log('\n▶ 验证：pnpm verify（build + check:seo + test）');
  const result = spawnSync('pnpm', ['verify'], { cwd: target, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error('\n❌ 裁剪后验证未通过，按上方报错修复（或整体回退后改用手动裁剪）');
    process.exit(EXIT.VERIFY);
  }
  console.log('\n✅ 裁剪后验证通过');
}

process.exit(failedModules ? EXIT.SAFETY : EXIT.OK);
