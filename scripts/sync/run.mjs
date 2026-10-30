#!/usr/bin/env node
// 数据同步运行器：pnpm sync [数据源名...] [--dry-run] [--allow-fail]
//
// 每个数据源是 scripts/sync/sources/<name>.mjs，默认导出：
//   {
//     name: 'works',                    // 数据源名（命令行用它选择）
//     output: 'src/data/works.json',    // 写入的集合数据文件
//     enabled: true,                    // false = 只有命令行点名时才跑
//     async fetch(ctx) { return [...] } // 返回条目数组，每条必须有唯一 id
//   }
//
// 安全规则（这是本运行器存在的意义）：
//   1. 拉取失败 / 返回空数组 / id 重复 → 不写文件，保留上一版数据（站点绝不会被构建成空页面）
//   2. 条目数比上一版骤降超过 50% → 视为异常，不写文件（需要时加 --force）
//   3. 先写临时文件再原子替换，写到一半中断也不会留下半截 JSON
//   4. 输出按 id 稳定排序，数据没变时 git diff 为空
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createContext } from './context.mjs';

const ROOT = process.cwd();
const SOURCES_DIR = join(ROOT, 'scripts', 'sync', 'sources');

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const picked = args.filter((arg) => !arg.startsWith('--'));
const dryRun = flags.has('--dry-run');
const allowFail = flags.has('--allow-fail');
const force = flags.has('--force');

async function loadSources() {
  if (!existsSync(SOURCES_DIR)) return [];
  const files = readdirSync(SOURCES_DIR).filter((name) => name.endsWith('.mjs') && !name.startsWith('_'));
  const sources = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(join(SOURCES_DIR, file)).href);
    const source = mod.default;
    if (!source?.name || !source?.output || typeof source.fetch !== 'function') {
      throw new Error(`${file} 导出格式不对：需要 { name, output, fetch }`);
    }
    sources.push(source);
  }
  return sources;
}

function readExisting(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function validate(items, previous) {
  if (!Array.isArray(items)) return '返回值不是数组';
  if (items.length === 0) return '返回了空数组';
  const ids = new Set();
  for (const item of items) {
    if (item?.id === undefined || item.id === null || item.id === '') return '存在缺少 id 的条目';
    const id = String(item.id);
    if (ids.has(id)) return `id 重复：${id}`;
    ids.add(id);
  }
  if (!force && Array.isArray(previous) && previous.length >= 10 && items.length < previous.length * 0.5) {
    return `条目数从 ${previous.length} 骤降到 ${items.length}（超过 50%），疑似接口异常；确认无误请加 --force`;
  }
  return null;
}

function writeAtomic(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  renameSync(tmp, file);
}

const sources = await loadSources();
const selected = picked.length
  ? sources.filter((source) => picked.includes(source.name))
  : sources.filter((source) => source.enabled !== false);

if (picked.length && selected.length !== picked.length) {
  const known = sources.map((source) => source.name).join(', ') || '（无）';
  console.error(
    `❌ 找不到数据源：${picked.filter((name) => !sources.some((s) => s.name === name)).join(', ')}；已有：${known}`,
  );
  process.exit(1);
}
if (selected.length === 0) {
  console.log(
    '没有启用的数据源（scripts/sync/sources/ 下的 enabled !== false 的模块）。点名运行：pnpm sync <name>',
  );
  process.exit(0);
}

let failed = 0;
for (const source of selected) {
  const output = resolve(ROOT, source.output);
  const previous = readExisting(output);
  const ctx = createContext(source.name);
  const started = Date.now();
  try {
    const items = await source.fetch(ctx);
    const problem = validate(items, previous);
    if (problem) throw new Error(problem);
    const sorted = [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const changed = JSON.stringify(sorted) !== JSON.stringify(previous);
    if (dryRun) {
      console.log(
        `🔍 [${source.name}] ${sorted.length} 条（dry-run，未写入）${changed ? '，与现有数据有差异' : '，无变化'}`,
      );
    } else if (changed) {
      writeAtomic(output, sorted);
      console.log(
        `✅ [${source.name}] 写入 ${sorted.length} 条 → ${source.output}（${Date.now() - started}ms）`,
      );
    } else {
      console.log(`✅ [${source.name}] ${sorted.length} 条，无变化`);
    }
  } catch (error) {
    failed += 1;
    console.error(`❌ [${source.name}] 同步失败，已保留上一版数据：${error.message}`);
  }
}

if (failed > 0 && !allowFail) process.exit(1);
