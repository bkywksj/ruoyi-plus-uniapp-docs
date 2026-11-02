// docs 模块：生成 public/llms.txt —— 面向大模型的站点说明书（llmstxt.org 约定）。
// 为什么单独给 AI 一份：搜索引擎靠 sitemap 逐条抓取，而大模型回答问题时需要的是「这个站是什么、有哪些模块、想找 X 该去哪」
// 这种全局图景，几百条扁平网址给不了，一份带层级和一句话说明的 Markdown 才行。
//
// 由四段拼成：
//   1. src/data/llms-facts.md —— 人工核对过的产品事实（一句话定义、核心功能、授权、出品方……），改事实时同步末尾「最后更新」日期；
//      与常见问题页、站点 JSON-LD（src/lib/site-jsonld.ts）说法一致
//   2. 页面索引：src/data/sidebar.json（与页面左侧栏同一份）+ 每页 frontmatter 的 description（迁移时取自旧站 meta description）。
//      全站一棵侧栏 → 一节「页面索引」；每栏目一棵 → 按 docs.json 的栏目顺序各一节（标题可用 llms.sectionTitles 改写）。
//      内容过期页（src/data/outdated.json，页面带 noindex）不进清单
//   3. 侧栏之外的页面：docs.json 的 llms.extraPages（独立 .astro 页、不在侧栏里的文档、纯文字行）
//   4. 完整索引（sitemap.xml）+ 可选的 src/data/llms-tail.md
//
// 运行：pnpm llms（pnpm build 前自动执行）；--check 只比对不写入，内容与仓库里那份不同时退出码 1
// 🔴 与框架的 src/pages/llms.txt.ts 端点二选一：两者都出 /llms.txt，项目里还有那个端点时本脚本拒绝运行

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { docUrl, pagePathFor, readDocsConfig, readSiteMeta } from './lib/site-meta.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(resolve(ROOT, 'src/pages/llms.txt.ts'))) {
  console.error('× 项目里有 src/pages/llms.txt.ts（框架默认的 llms.txt 端点）：它和本脚本都生成 /llms.txt，二选一。迁移型文档站删掉那个端点改用本脚本');
  process.exit(1);
}
const DOCS = resolve(ROOT, 'src/content/docs');
const meta = readSiteMeta(ROOT);
const SITE = meta.url;
const config = readDocsConfig(ROOT);
const llms = config.llms ?? {};
const read = (rel) => (existsSync(resolve(ROOT, rel)) ? readFileSync(resolve(ROOT, rel), 'utf8').replace(/\r\n/g, '\n').trimEnd() : '');
const facts = read('src/data/llms-facts.md');
const tail = read('src/data/llms-tail.md');
const sidebar = JSON.parse(readFileSync(resolve(ROOT, 'src/data/sidebar.json'), 'utf8'));
const outdated = JSON.parse(readFileSync(resolve(ROOT, 'src/data/outdated.json'), 'utf8')).pages;

/**
 * 页面的一句话说明：frontmatter description，限 60 字（llms.txt 是给模型看的索引，每条一句话就够，太长反而稀释信号）
 * @param id 页面 id
 */
const briefOf = (id) => {
  const file = resolve(DOCS, `${id}.md`);
  if (!existsSync(file)) return '';
  const m = readFileSync(file, 'utf8').match(/^---\r?\n[\s\S]*?^description:\s*"((?:[^"\\]|\\.)*)"/m);
  if (!m) return '';
  const desc = JSON.parse(`"${m[1]}"`).replace(/…$/, '');
  return desc.length > 60 ? `${desc.slice(0, 60)}…` : desc;
};

/**
 * 侧栏树 → 「分组 → 条目」两级：每个直接含页面的分组输出一节（嵌套分组各自成节）；站外链接与过期页跳过
 * @param items 侧栏某一层
 * @param out 收集结果
 */
const collect = (items, out = []) => {
  for (const item of items) {
    if (!item.items) continue;
    const pages = item.items.filter((i) => i.id && !i.items && !(i.id in outdated));
    if (pages.length) out.push({ title: item.text, items: pages });
    collect(item.items, out);
  }
  return out;
};

/** 分组里的全部页面（含子分组里的），按侧栏顺序 */
const pagesOf = (items = []) => items.flatMap((i) => [...(i.id ? [i] : []), ...pagesOf(i.items)]);
/**
 * 侧栏树 → 输出用的分组：llms.groups 为 nested 时每个直接含页面的分组各成一节（ruoyi.plus 的多层侧栏）；
 * 默认 top：只按顶层分组分节，子分组的页面并进顶层分组（tauri-docs「指南」下的「入门」「核心概念」）
 */
const groupsOf = (items) =>
  llms.groups === 'nested'
    ? collect(items)
    : items
        .filter((g) => g.items)
        .map((g) => ({ title: g.text, items: pagesOf(g.items).filter((i) => !(i.id in outdated)) }))
        .filter((g) => g.items.length);

/** 一组页面 → 「### 分组」+ 条目行 */
const pushGroups = (lines, groups) => {
  for (const g of groups) {
    lines.push(`### ${g.title}`, '');
    for (const item of g.items) {
      const brief = briefOf(item.id);
      lines.push(`- [${item.text}](${docUrl(meta, item.id)})${brief ? `：${brief}` : ''}`);
    }
    lines.push('');
  }
};

const lines = facts ? [facts, ''] : [`# ${meta.name}`, ''];
const singleTree = Object.keys(sidebar).length === 1 && 'docs' in sidebar && !config.sections.some((s) => s.id === 'docs');
if (singleTree) {
  lines.push('## 页面索引（自动生成）', '');
  pushGroups(lines, groupsOf(sidebar.docs));
} else {
  for (const s of config.sections) {
    const groups = groupsOf(sidebar[s.id] ?? []);
    if (groups.length === 0) continue;
    lines.push(`## ${llms.sectionTitles?.[s.id] ?? s.label}`, '');
    pushGroups(lines, groups);
  }
}

// 侧栏之外的页面：{ text, path | id, brief? } 输出链接（brief 省略时取 id 那篇的 description），{ line } 原样输出一行
const extra = llms.extraPages ?? [];
if (extra.length) {
  // extraHeading 写空字符串 = 不出小标题，直接接在最后一组后面（officia 的 llms.txt 一直是这样）
  if (llms.extraHeading !== '') lines.push(llms.extraHeading ?? '### 其他页面', '');
  for (const p of extra) {
    if (p.line) {
      lines.push(p.line);
      continue;
    }
    const href = p.id ? docUrl(meta, p.id) : SITE + pagePathFor(p.path, meta.urlFormat);
    const brief = p.brief ?? (p.id ? briefOf(p.id) : '');
    lines.push(`- [${p.text}](${href})${brief ? `：${brief}` : ''}`);
  }
  lines.push('');
}
lines.push('## 完整索引', '', `- [sitemap.xml](${SITE}/sitemap.xml)：全部页面的完整清单`, '');
if (tail) lines.push(tail, '');

const out = lines.join('\n');
const target = resolve(ROOT, 'public/llms.txt');
const entryCount = (out.match(/^- \[/gm) || []).length;
if (process.argv.includes('--check')) {
  const same = existsSync(target) && readFileSync(target, 'utf8') === out;
  console.log(same ? `llms.txt 已是最新（${entryCount} 个条目）` : 'llms.txt 与侧栏 / 描述不一致：跑 pnpm llms 重新生成');
  process.exit(same ? 0 : 1);
}
writeFileSync(target, out, 'utf8');
console.log(`已生成 llms.txt → public/llms.txt（${entryCount} 个条目，${out.length} 字符）`);
