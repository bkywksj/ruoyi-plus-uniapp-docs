// 试点选页：按难度从旧站源码里挑页面（最长、手机预览、mermaid、容器、正文花括号 / 尖括号 / 组件最多、四个分区首页、各分区代表页）
// 用法：node scripts/migrate/pick-pilot.mjs <旧站 docs 目录> > .migrate/pilot-pages.txt
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const docs = process.argv[2];
const walk = (d) => readdirSync(d).flatMap((n) => {
  if (['.vitepress', 'public', 'node_modules'].includes(n)) return [];
  const f = join(d, n);
  return statSync(f).isDirectory() ? walk(f) : n.endsWith('.md') ? [f] : [];
});
const rows = walk(docs).map((f) => {
  const rel = relative(docs, f).split(sep).join('/');
  const src = readFileSync(f, 'utf8');
  const prose = src.replace(/^---[\s\S]*?\n---/, '').replace(/^(```|~~~)[\s\S]*?^\1/gm, '').replace(/`[^`\n]*`/g, '');
  return {
    rel,
    lines: src.split('\n').length,
    iframe: /^iframe:\s*true/m.test(src),
    mermaid: (src.match(/^```mermaid/gm) ?? []).length,
    container: (src.match(/^:::\s*\w/gm) ?? []).length,
    braces: (prose.match(/[{}]/g) ?? []).length,
    tags: (prose.match(/<[a-z][\w-]*[\s/>]/g) ?? []).length,
    comps: (prose.match(/<[A-Z][\w]*[\s/>]/g) ?? []).length,
  };
});
const picked = new Map();
const take = (list, n, why) => { for (const r of list.slice(0, n)) if (!picked.has(r.rel)) picked.set(r.rel, why); };
const by = (k) => [...rows].sort((a, b) => b[k] - a[k]).filter((r) => r[k] > 0);
take(by('lines'), 2, '最长');
take(rows.filter((r) => r.iframe).sort((a, b) => b.lines - a.lines), 5, '手机预览');
take(by('mermaid'), 30, 'mermaid');
take(by('container'), 4, ':::容器');
take(by('braces'), 3, '正文花括号');
take(by('tags'), 3, '正文尖括号');
take(by('comps'), 3, '组件标记');
for (const s of ['backend', 'frontend', 'mobile', 'practices']) take(rows.filter((r) => r.rel === `${s}/index.md`), 1, '分区首页');
take(rows.filter((r) => r.rel.startsWith('frontend/')).sort((a, b) => b.lines - a.lines), 1, '前端代表');
take(rows.filter((r) => r.rel.startsWith('practices/')).sort((a, b) => b.lines - a.lines), 1, '实践代表');
const list = [...picked].slice(0, 36);
for (const [rel, why] of list) {
  const r = rows.find((x) => x.rel === rel);
  console.error(`${rel.padEnd(48)} ${why.padEnd(8)} 行${r.lines} 预览${r.iframe ? 1 : 0} mermaid${r.mermaid} 容器${r.container} 花括号${r.braces} 尖括号${r.tags} 组件${r.comps}`);
  console.log(rel);
}
console.error(`共 ${list.length} 页（全站 mermaid 页 ${rows.filter((r) => r.mermaid).length}、容器页 ${rows.filter((r) => r.container).length}、预览页 ${rows.filter((r) => r.iframe).length}）`);
