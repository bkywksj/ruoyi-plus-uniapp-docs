#!/usr/bin/env node
// delivery-sync：把当前项目「已提交的内容」单向镜像成一份交付副本（无 git 历史、无技能体系、无内部文档）
//
// 用法（在项目根目录执行）：
//   node .claude/skills/delivery-sync/scripts/delivery-sync.mjs --status
//   node .claude/skills/delivery-sync/scripts/delivery-sync.mjs --first-time --dry-run [--delivery-dir ../site-delivery]
//   node .claude/skills/delivery-sync/scripts/delivery-sync.mjs --first-time [--delivery-dir ../site-delivery]
//   node .claude/skills/delivery-sync/scripts/delivery-sync.mjs [--preset 客户A] [--dry-run] [--verbose]
//   需要确认的两道闸门（加之前必须征得用户同意）：--allow-unmanaged / --allow-mass-delete
//
// 设计要点：
//   1. 源文件只取 HEAD 里已跟踪的文件（git ls-tree + cat-file）：未跟踪、被 .gitignore 忽略、改了没提交的内容一律不进交付副本。
//      以前扫整个工作区，别的会话刚建的临时文件、.agent-pipeline/ 任务书、本机凭据文件都可能被带出去。
//   2. 排除规则 = .deliveryignore（gitignore 语法）+ 预设 extraExclude + 强制清单（不可被 ! 否定）
//   3. 交付目录里的 node_modules / dist / .astro / .cache 是交付方本地安装与构建的产物：扫描、删除、清理都跳过，
//      否则在交付目录里自检过一次 pnpm install，下次同步就会被当成「要删除的 3 万个文件」
//   4. 「目标目录不是受管目录」「一次删除超过 30%」是两件不同的事，各用一个参数放行，不再共用一个 --force
//
// 零依赖、跨平台（需要 git）。
// 退出码：0 成功 / 1 需要确认（加对应的 --allow-* 前先征得用户同意）/ 2 安全检查失败或参数错误 / 3 环境异常
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, appendFileSync, copyFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = join(SKILL_DIR, 'templates');
const EXIT = { OK: 0, CONFIRM: 1, SAFETY: 2, ENV: 3 };
const USAGE =
  '用法：delivery-sync.mjs [--status] [--first-time] [--dry-run] [--verbose] [--preset <名称>] [--delivery-dir <目录>] [--source <项目根>]\n' +
  '                        [--allow-unmanaged] [--allow-mass-delete]';

// ---------- 参数 ----------
// 逐个解析：未知参数直接报错。旧的 --force 已拆成两个参数，继续接受它会让人以为两道闸门都放开了
const BOOLEAN_FLAGS = new Set(['--status', '--first-time', '--dry-run', '--verbose', '--allow-unmanaged', '--allow-mass-delete', '--help', '-h']);
const VALUE_OPTIONS = new Set(['--delivery-dir', '--preset', '--source']);
const flags = new Set();
const options = new Map();
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
  } else if (arg === '--force') {
    console.error('❌ --force 已拆分：目标目录不是受管目录 → --allow-unmanaged；一次删除超过 30% → --allow-mass-delete（加之前先征得用户同意）');
    process.exit(EXIT.SAFETY);
  } else {
    console.error(`❌ 未知参数：${arg}\n${USAGE}`);
    process.exit(EXIT.SAFETY);
  }
}
const flag = (name) => flags.has(name);
if (flag('--help') || flag('-h')) {
  console.log(USAGE);
  process.exit(EXIT.OK);
}

const SOURCE = resolve(options.get('--source') ?? process.cwd());
const STATE_FILE = join(SOURCE, '.delivery-sync.json');
const IGNORE_FILE = join(SOURCE, '.deliveryignore');
const MARKER = '.delivery-sync-marker';
const dryRun = flag('--dry-run');
const allowUnmanaged = flag('--allow-unmanaged');
const allowMassDelete = flag('--allow-mass-delete');
const firstTime = flag('--first-time');
const verbose = flag('--verbose');

// 无论 .deliveryignore 怎么写都强制排除（防止有人误删规则导致技能体系 / 密钥 / 内部任务书外泄）
const FORCED = [
  '.git/',
  '.claude/',
  '.codex/',
  '.agents/',
  '.agent-pipeline/',
  'AGENTS.md',
  'CLAUDE.md',
  '.delivery-sync.json',
  '.deliveryignore',
  '.framework-sync.json',
  'node_modules/',
  '/delivery/',
];
// .env 与 .env.<任意后缀>（.env.local / .env.production …）一律排除，只放行模板 .env.example
const isEnvFile = (name) => /^\.env(\..+)?$/.test(name) && name !== '.env.example';
// 同步完成后在交付目录里再扫一遍，漏网的一律删除（另加 isEnvFile）
const POST_CLEAN = ['.git', '.claude', '.codex', '.agents', '.agent-pipeline', 'AGENTS.md', 'CLAUDE.md', '.framework-sync.json'];
// 交付目录里属于交付方本地安装 / 构建的目录：不扫描、不删除、不清理
const DEST_LOCAL_DIRS = new Set(['node_modules', 'dist', '.astro', '.cache']);
const DELETE_RATIO_THRESHOLD = 0.3;

// ---------- 工具 ----------
function shanghaiIso(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  // Asia/Shanghai 无夏令时，偏移恒为 +08:00
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}

/** 运行 git，返回 { ok, stdout(Buffer), stderr } */
function gitRaw(args, input) {
  const result = spawnSync('git', args, {
    cwd: SOURCE,
    // input 必须传 Buffer：encoding 设成 'buffer' 时 Node 会拿它去编码字符串输入并报 ERR_UNKNOWN_ENCODING
    input: input === undefined ? undefined : Buffer.from(input, 'utf8'),
    encoding: 'buffer',
    // 默认 1MB 放不下整个仓库的文件内容
    maxBuffer: 1024 * 1024 * 1024,
  });
  return { ok: result.status === 0, stdout: result.stdout ?? Buffer.alloc(0), stderr: result.stderr?.toString('utf8') ?? '' };
}
const git = (args) => {
  const result = gitRaw(args);
  // 只去尾部换行：git status --porcelain 每行开头的空格是状态位，不能 trim 掉
  return result.ok ? result.stdout.toString('utf8').replace(/\s+$/, '') : '';
};

const toPosix = (path) => path.split(sep).join('/');

/** gitignore 风格规则 → { regex, negate, dirOnly } */
function compileRule(raw) {
  let line = raw.trim();
  if (!line || line.startsWith('#')) return null;
  const negate = line.startsWith('!');
  if (negate) line = line.slice(1);
  const dirOnly = line.endsWith('/');
  if (dirOnly) line = line.slice(0, -1);
  const anchored = line.startsWith('/') || line.includes('/');
  line = line.replace(/^\//, '');
  let source = '';
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '*') {
      if (line[i + 1] === '*') {
        source += '.*';
        i += 1;
        if (line[i + 1] === '/') i += 1;
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  // 不含斜杠的规则匹配任意层级的同名文件/目录；含斜杠（或以 / 开头）的相对项目根匹配
  const regex = new RegExp(anchored ? `^${source}$` : `(^|/)${source}$`);
  return { regex, negate, dirOnly };
}

function loadRules(extra = []) {
  const text = existsSync(IGNORE_FILE)
    ? readFileSync(IGNORE_FILE, 'utf8')
    : readFileSync(join(TEMPLATES, 'deliveryignore.template'), 'utf8');
  return [...text.split(/\r?\n/), ...extra].map(compileRule).filter(Boolean);
}

const forcedRules = FORCED.map(compileRule);

/** 单个路径（文件或目录）是否被排除：后出现的规则覆盖先出现的（同 gitignore）；强制规则最后判定且不可被否定 */
function matches(rel, isDir, rules) {
  let excluded = false;
  for (const rule of rules) {
    if (rule.dirOnly && !isDir) continue;
    if (rule.regex.test(rel)) excluded = !rule.negate;
  }
  if (!isDir && isEnvFile(basename(rel))) return true;
  return excluded || forcedRules.some((rule) => (!rule.dirOnly || isDir) && rule.regex.test(rel));
}

/** 文件是否被排除：任一上级目录被排除则整体排除（与 gitignore「父目录被忽略，子文件无法再放行」一致） */
function isExcludedFile(rel, rules) {
  const parts = rel.split('/');
  for (let depth = 1; depth < parts.length; depth += 1) {
    if (matches(parts.slice(0, depth).join('/'), true, rules)) return true;
  }
  return matches(rel, false, rules);
}

/** HEAD 里的已跟踪文件：[{ path, oid }]（跳过子模块与符号链接） */
function listHeadFiles() {
  const result = gitRaw(['ls-tree', '-r', '-z', '--full-tree', 'HEAD']);
  if (!result.ok) return null;
  const files = [];
  for (const record of result.stdout.toString('utf8').split('\0')) {
    if (!record) continue;
    const tab = record.indexOf('\t');
    const [mode, type, oid] = record.slice(0, tab).split(' ');
    if (type !== 'blob' || mode === '120000') continue;
    files.push({ path: record.slice(tab + 1), oid });
  }
  return files;
}

/** 批量读取 blob 内容：一次 git cat-file --batch，返回 oid → Buffer */
function readBlobs(oids) {
  const unique = [...new Set(oids)];
  const blobs = new Map();
  if (unique.length === 0) return blobs;
  const result = gitRaw(['cat-file', '--batch'], `${unique.join('\n')}\n`);
  if (!result.ok) throw new Error(`git cat-file 失败：${result.stderr}`);
  const out = result.stdout;
  let offset = 0;
  while (offset < out.length) {
    const newline = out.indexOf(0x0a, offset);
    const header = out.subarray(offset, newline).toString('utf8');
    const [oid, type, size] = header.split(' ');
    if (type === 'missing') throw new Error(`git cat-file 找不到对象 ${oid}`);
    const start = newline + 1;
    const end = start + Number(size);
    blobs.set(oid, out.subarray(start, end));
    offset = end + 1; // 每个对象内容后面跟一个换行
  }
  return blobs;
}

function listDest(dest) {
  const files = [];
  if (!existsSync(dest)) return files;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      const rel = toPosix(relative(dest, full));
      if (rel === MARKER || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!DEST_LOCAL_DIRS.has(entry.name)) walk(full);
      } else {
        files.push(rel);
      }
    }
  };
  walk(dest);
  return files.sort();
}

function readState() {
  return existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : null;
}

function isInside(child, parent) {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !rel.includes(`..${sep}`) && !/^[A-Za-z]:/.test(rel));
}

// ---------- 环境：必须是 git 仓库根目录且有提交 ----------
const topLevel = git(['rev-parse', '--show-toplevel']);
if (!topLevel) {
  console.error(`❌ ${SOURCE} 不是 git 仓库：交付内容以「已提交的文件」为准，需要先 git init 并提交`);
  process.exit(EXIT.ENV);
}
const samePath = (a, b) => (process.platform === 'win32' ? resolve(a).toLowerCase() === resolve(b).toLowerCase() : resolve(a) === resolve(b));
if (!samePath(topLevel, SOURCE)) {
  console.error(`❌ 请在仓库根目录执行（当前 ${SOURCE}，仓库根 ${resolve(topLevel)}），或用 --source 指向仓库根`);
  process.exit(EXIT.ENV);
}
const head = git(['rev-parse', '--short', 'HEAD']);
if (!head) {
  console.error('❌ 仓库还没有任何提交：交付内容以已提交的文件为准，先提交一次');
  process.exit(EXIT.ENV);
}
const dirtyTracked = git(['status', '--porcelain', '--untracked-files=no']);

// ---------- 状态查看 ----------
const state = readState();

if (flag('--status')) {
  if (!state) {
    console.log('还没有交付记录（.delivery-sync.json 不存在），首次请用 --first-time');
    process.exit(EXIT.OK);
  }
  const pending = state.lastSyncCommit ? git(['log', '--oneline', `${state.lastSyncCommit}..HEAD`]) : '';
  console.log('=================================');
  console.log('交付同步状态');
  console.log('=================================');
  console.log(`交付目录:    ${state.deliveryDir}`);
  console.log(`当前预设:    ${state.activePreset ?? 'default'}`);
  console.log(`累计同步:    ${state.syncCount ?? 0} 次`);
  console.log(`上次同步:    ${state.lastSyncDate ?? '-'} (commit ${state.lastSyncCommit ?? '-'})`);
  console.log(`项目 HEAD:   ${head}${dirtyTracked ? '（有未提交改动：这些改动不会进入交付副本）' : ''}`);
  const lines = pending ? pending.split('\n') : [];
  console.log(`\n待同步提交（${lines.length} 个）:`);
  lines.forEach((line) => console.log(`  ${line}`));
  process.exit(EXIT.OK);
}

// ---------- 确定交付目录 ----------
const projectName = basename(SOURCE);
if (!state && !firstTime) {
  console.error('❌ 没有 .delivery-sync.json，首次创建交付目录请加 --first-time');
  process.exit(EXIT.ENV);
}
const deliveryDirSetting = options.get('--delivery-dir') ?? state?.deliveryDir ?? `../${projectName}-delivery`;
const DEST = resolve(SOURCE, deliveryDirSetting);

// 安全：交付目录不能是项目本身、不能在项目里面、项目也不能在它里面
if (isInside(DEST, SOURCE) || isInside(SOURCE, DEST)) {
  console.error(`🛑 交付目录 ${DEST} 与项目目录互相包含，拒绝执行（会自我覆盖或无限递归）`);
  process.exit(EXIT.SAFETY);
}
if (existsSync(join(DEST, '.git'))) {
  console.error(`🛑 ${DEST} 里有 .git，交付目录不应是 git 仓库；本脚本绝不删除外部 .git，请人工确认后处理`);
  process.exit(EXIT.SAFETY);
}
const destExists = existsSync(DEST) && readdirSync(DEST).length > 0;
const unmanaged = destExists && !existsSync(join(DEST, MARKER));
if (unmanaged && !allowUnmanaged && !dryRun) {
  console.error(
    `⚠️  ${DEST} 已有内容但没有 ${MARKER}，不是受管的交付目录（可能指错了路径）。\n` +
      '   执行会删除其中所有不属于交付清单的文件。先用 --dry-run 看清单，向用户确认后再加 --allow-unmanaged',
  );
  process.exit(EXIT.CONFIRM);
}

const presets = state?.presets ?? { default: { extraExclude: [] } };
const presetName = options.get('--preset') ?? state?.activePreset ?? 'default';
const preset = presets[presetName];
if (!preset) {
  console.error(`❌ 预设不存在：${presetName}；已有：${Object.keys(presets).join(', ')}`);
  process.exit(EXIT.ENV);
}

// ---------- 计划 ----------
// 交付文档：delivery/*.md 放到交付目录根，替代项目根的同名文件（项目 README 往往写的是内部开发说明）。
// 同样以 HEAD 为准：delivery/ 还没提交时按模板生成，保证预览与实际执行的计划一致。
const DOC_TEMPLATES = [
  ['README.md.template', 'README.md'],
  ['DEPLOY.md.template', 'DEPLOY.md'],
];
const renderTemplate = (tpl) => readFileSync(join(TEMPLATES, tpl), 'utf8').replaceAll('{{PROJECT_NAME}}', projectName);

const headFiles = listHeadFiles();
if (!headFiles) {
  console.error('❌ 读取 HEAD 文件清单失败（git ls-tree）');
  process.exit(EXIT.ENV);
}
const rules = loadRules(preset.extraExclude ?? []);
const docEntries = headFiles.filter((file) => /^delivery\/[^/]+\.md$/.test(file.path));
const included = headFiles.filter((file) => !isExcludedFile(file.path, rules));
const blobs = readBlobs([...included, ...docEntries].map((file) => file.oid));

const docs = new Map();
for (const file of docEntries) docs.set(file.path.slice('delivery/'.length), blobs.get(file.oid));
for (const [tpl, out] of DOC_TEMPLATES) if (!docs.has(out)) docs.set(out, Buffer.from(renderTemplate(tpl)));

// entries：交付目录里应有的每个文件 → 内容
const entries = new Map();
for (const file of included) {
  if (!docs.has(file.path)) entries.set(file.path, blobs.get(file.oid));
}
for (const [name, buffer] of docs) entries.set(name, buffer);

// 交付副本的 package.json：去掉指向「已被排除的脚本」的 npm scripts
// （如 check:skills → scripts/validate-skills.mjs、agents:sync → scripts/sync-agents-skills.mjs），
// 否则客户执行时报找不到文件。只处理 `node <文件>` 形式，其余脚本原样保留。
// 在计划阶段就改写，交付目录里的 package.json 才能与计划一致，不会每次都被判为「修改」。
const droppedScripts = [];
if (entries.has('package.json')) {
  const deliveredPkg = JSON.parse(entries.get('package.json').toString('utf8'));
  for (const [name, command] of Object.entries(deliveredPkg.scripts ?? {})) {
    const scriptTarget = String(command).match(/^node\s+(\S+\.(?:mjs|cjs|js))\b/)?.[1];
    if (scriptTarget && !entries.has(scriptTarget.replace(/^\.\//, ''))) {
      delete deliveredPkg.scripts[name];
      droppedScripts.push(name);
    }
  }
  if (droppedScripts.length) entries.set('package.json', Buffer.from(`${JSON.stringify(deliveredPkg, null, 2)}\n`, 'utf8'));
}

const destFiles = listDest(DEST);
const differs = (rel) => {
  const destFile = join(DEST, rel);
  const expected = entries.get(rel);
  return statSync(destFile).size !== expected.length || !readFileSync(destFile).equals(expected);
};
const planned = [...entries.keys()].sort();
const added = planned.filter((rel) => !existsSync(join(DEST, rel)));
const modified = planned.filter((rel) => existsSync(join(DEST, rel)) && differs(rel));
const removed = destFiles.filter((rel) => !entries.has(rel));
const ratio = destFiles.length ? removed.length / destFiles.length : 0;
const massDelete = ratio > DELETE_RATIO_THRESHOLD;

console.log(`\n交付同步${dryRun ? '（预览，不写盘）' : ''}`);
console.log(`  项目：    ${SOURCE}  HEAD ${head}（只交付已提交的内容）`);
if (dirtyTracked) {
  const lines = dirtyTracked.split('\n');
  console.log(`  ⚠️  有 ${lines.length} 个已跟踪文件改了没提交，这些改动不会进入交付副本：`);
  lines.slice(0, 10).forEach((line) => console.log(`     ${line}`));
}
console.log(`  交付目录：${DEST}${destExists ? '' : '（新建）'}${unmanaged ? '（⚠️ 非受管目录）' : ''}`);
console.log(`  预设：    ${presetName}`);
console.log(`  规则来源：${existsSync(IGNORE_FILE) ? '.deliveryignore' : '模板（.deliveryignore 尚未创建）'} + 强制排除 ${FORCED.length} 条 + .env*（保留 .env.example）`);
console.log(`  计划：    新增 ${added.length} / 修改 ${modified.length} / 删除 ${removed.length}（共交付 ${planned.length} 个文件；交付目录里的 node_modules / dist / .astro / .cache 不参与比对）`);
if (droppedScripts.length) console.log(`  package.json 将移除指向已排除脚本的命令：${droppedScripts.join(', ')}`);
const show = (label, list) => {
  if (!list.length) return;
  console.log(`\n  ${label}${verbose ? `（${list.length} 个）` : '（前 20 个，--verbose 看全部）'}:`);
  (verbose ? list : list.slice(0, 20)).forEach((rel) => console.log(`    ${rel}`));
};
show('新增', added);
show('修改', modified);
show('删除', removed);

const nothingToDo = added.length === 0 && modified.length === 0 && removed.length === 0 && existsSync(join(DEST, MARKER));
if (nothingToDo) {
  if (!dryRun && state && state.lastSyncCommit !== head) {
    // 新提交只动了被排除的文件（如 docs/）：内容无变化，只推进 baseline，不计入同步次数
    writeFileSync(STATE_FILE, `${JSON.stringify({ ...state, lastSyncCommit: head, lastSyncDate: shanghaiIso() }, null, 2)}\n`, 'utf8');
    console.log(`\n✅ 交付内容已是最新，baseline 推进到 ${head}（新提交只涉及被排除的文件）`);
  } else {
    console.log(`\n✅ 交付目录已是最新（commit ${state?.lastSyncCommit ?? head}）`);
  }
  process.exit(EXIT.OK);
}

if (dryRun) {
  if (unmanaged) console.log(`\n  ⚠️  目标不是受管目录：实际执行需要 --allow-unmanaged（先向用户确认路径没指错）`);
  if (massDelete) {
    console.log(`\n  ⚠️  将删除交付目录 ${(ratio * 100).toFixed(0)}% 的文件：实际执行需要 --allow-mass-delete（先向用户确认排除规则没改坏）`);
  }
  if (!existsSync(IGNORE_FILE)) {
    console.log('\n  （实际执行时会从模板创建 .deliveryignore、delivery/README.md、delivery/DEPLOY.md，并把状态文件加入 .gitignore）');
  }
  process.exit(EXIT.OK);
}

if (massDelete && !allowMassDelete) {
  console.error(
    `\n⚠️  将删除交付目录 ${(ratio * 100).toFixed(0)}% 的文件（阈值 ${DELETE_RATIO_THRESHOLD * 100}%），可能是排除规则被改坏或目录指错。\n` +
      '   把上面的删除清单给用户确认后，再加 --allow-mass-delete',
  );
  process.exit(EXIT.CONFIRM);
}

// ---------- 执行 ----------
// 首次：初始化 .deliveryignore / delivery 文档 / .gitignore（都在项目侧，delivery/ 需要提交，另两个本地保留）
if (!existsSync(IGNORE_FILE)) copyFileSync(join(TEMPLATES, 'deliveryignore.template'), IGNORE_FILE);
mkdirSync(join(SOURCE, 'delivery'), { recursive: true });
for (const [tpl, out] of DOC_TEMPLATES) {
  const docTarget = join(SOURCE, 'delivery', out);
  if (!existsSync(docTarget)) writeFileSync(docTarget, renderTemplate(tpl), 'utf8');
}
const gitignore = join(SOURCE, '.gitignore');
const gitignoreText = existsSync(gitignore) ? readFileSync(gitignore, 'utf8') : '';
const missing = ['.delivery-sync.json', '.deliveryignore'].filter((entry) => !gitignoreText.split(/\r?\n/).includes(entry));
if (missing.length) {
  appendFileSync(gitignore, `${gitignoreText.endsWith('\n') || !gitignoreText ? '' : '\n'}\n# 交付副本本地状态（不提交）\n${missing.join('\n')}\n`);
}

mkdirSync(DEST, { recursive: true });
for (const rel of removed) rmSync(join(DEST, rel), { force: true });
for (const rel of [...added, ...modified]) {
  mkdirSync(dirname(join(DEST, rel)), { recursive: true });
  writeFileSync(join(DEST, rel), entries.get(rel));
}

// 清理删文件后留下的空目录（交付方的本地构建目录不碰）
const pruneEmpty = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !DEST_LOCAL_DIRS.has(entry.name)) pruneEmpty(join(dir, entry.name));
  }
  if (dir !== DEST && readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
};
pruneEmpty(DEST);

// 后置清理：再扫一遍交付目录，任何漏网的敏感项一律删除（只在 DEST 内部操作；不进交付方的 node_modules 等目录，
// 那里的第三方包自带 AGENTS.md / .env 之类文件是正常的）
const cleaned = [];
const postClean = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (POST_CLEAN.includes(entry.name) || (!entry.isDirectory() && isEnvFile(entry.name))) {
      if (!isInside(full, DEST)) continue;
      rmSync(full, { recursive: true, force: true });
      cleaned.push(toPosix(relative(DEST, full)));
    } else if (entry.isDirectory() && !DEST_LOCAL_DIRS.has(entry.name)) {
      postClean(full);
    }
  }
};
postClean(DEST);

const now = shanghaiIso();
writeFileSync(
  join(DEST, MARKER),
  `sourceProject=${projectName}\nsourceCommit=${head}\nsyncedAt=${now}\npreset=${presetName}\nmanagedBy=delivery-sync skill\n`,
  'utf8',
);

const nextState = {
  deliveryDir: deliveryDirSetting,
  lastSyncCommit: head,
  lastSyncDate: now,
  syncCount: (state?.syncCount ?? 0) + 1,
  presets,
  activePreset: presetName,
  stripModules: state?.stripModules ?? [],
  history: [
    ...(state?.history ?? []),
    {
      date: now,
      fromCommit: state?.lastSyncCommit ?? null,
      toCommit: head,
      preset: presetName,
      filesAdded: added.length,
      filesModified: modified.length,
      filesDeleted: removed.length,
    },
  ].slice(-50),
};
writeFileSync(STATE_FILE, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');

console.log(`\n✅ 交付同步完成 | +${added.length}/~${modified.length}/-${removed.length} | baseline: ${state?.lastSyncCommit ?? '-'} → ${head}`);
if (cleaned.length) console.log(`   后置清理删除了漏网项：${cleaned.join(', ')}（检查 .deliveryignore 是否被改坏）`);
if (droppedScripts.length) console.log(`   package.json 移除了指向已排除脚本的命令：${droppedScripts.join(', ')}`);
const strip = preset.stripModules ?? state?.stripModules ?? [];
if (strip.length) {
  console.log(
    `\n下一步：该预设配置了模块裁剪 ${strip.join(', ')}，每次同步后都要重新裁剪（同步会把被裁的文件恢复）：\n` +
      `  1. 交付目录还没装过依赖时先装（node_modules 会保留，之后同步不受影响）：cd "${DEST}" && pnpm install\n` +
      `  2. node .claude/skills/module-strip/scripts/module-strip.mjs ${strip.join(' ')} --target "${DEST}" --verify`,
  );
}
