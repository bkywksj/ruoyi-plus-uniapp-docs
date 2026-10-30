// 重复标题去重：旧站有 16 组页面 <title> 完全相同（如 4 页都叫「快速开始」），搜索结果里分不出是哪一页、也会被当成重复内容。
// 用户 2026-10-30 定：页面上的 h1 不动，只在 <title> 里加上区分名（「快速开始 · LangChain4j」）。
// 本脚本按侧栏算区分名并检查唯一性，结果写 src/data/title-qualifiers.json（DocsLayout 读它）；内容改了重跑即可。
// 区分名取法（先短后长，取第一种能让同名页全部区分开的）：分区名 → 侧栏最近分组名 → 最近分组 · 分区 → 最近分组 · 文件名；
// 不在侧栏里的页没有分组，最近分组用文件名
// 用法：node scripts/migrate/title-qualifiers.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = 'src/content/docs';
const sidebar = JSON.parse(readFileSync('src/data/sidebar.json', 'utf8'));
const SECTION_LABEL = { backend: '后端', frontend: '前端', mobile: '移动端', practices: '最佳实践' };

/** 页面 id → 侧栏里从顶到父的分组名链 */
const chains = new Map();
const walk = (items, trail) => {
  for (const it of items) {
    if (it.id) chains.set(it.id, trail);
    if (it.items) walk(it.items, [...trail, it.text.replace(/\s*[（(][^）)]*[）)]\s*$/, '').trim()]);
  }
};
for (const [section, items] of Object.entries(sidebar)) walk(items, [SECTION_LABEL[section]]);

const files = readdirSync(DOCS, { recursive: true }).map(String).filter((f) => f.endsWith('.md'));
const titleOf = (f) => JSON.parse(readFileSync(join(DOCS, f), 'utf8').match(/^title: (".*")$/m)[1]);
const pages = files.map((f) => ({ id: f.replace(/\\/g, '/').replace(/\.md$/, ''), title: titleOf(f) }));
const groups = new Map();
for (const p of pages) if (p.title) groups.set(p.title, [...(groups.get(p.title) ?? []), p]);

const sectionOf = (id) => SECTION_LABEL[id.split('/')[0]] ?? id.split('/')[0];
/** 最近分组：侧栏里的父分组名；不在侧栏的页没有分组，用文件名（如 custom-dev）区分 */
const nearestOf = (id) => {
  const c = chains.get(id);
  return c && c.length > 1 ? c[c.length - 1] : id.split('/').pop();
};

const out = {};
for (const [title, list] of groups) {
  if (list.length < 2) continue;
  // 候选从短到长，取第一种能让组内每页都不同的
  const candidates = [
    (p) => sectionOf(p.id),
    (p) => nearestOf(p.id),
    (p) => `${nearestOf(p.id)} · ${sectionOf(p.id)}`,
    (p) => `${nearestOf(p.id)} · ${p.id.split('/').pop()}`,
  ];
  const labels = candidates.map((f) => list.map(f)).find((ls) => new Set(ls).size === list.length);
  if (!labels) throw new Error(`「${title}」找不到能区分的名字：${list.map((p) => p.id).join(', ')}`);
  list.forEach((p, i) => (out[p.id] = labels[i]));
  console.log(`「${title}」`);
  list.forEach((p, i) => console.log(`   ${p.id.padEnd(48)} → ${title} · ${labels[i]}`));
}
writeFileSync('src/data/title-qualifiers.json', JSON.stringify(out, null, 2) + '\n');
console.log(`\n${Object.keys(out).length} 页加区分名 → src/data/title-qualifiers.json`);
