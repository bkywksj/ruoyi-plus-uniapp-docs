// 站内锚点检查：构建产物里每个带 #锚点 的站内链接，目标页上都要有这个 id（页面存不存在由 check:seo 管，这里只管锚点）。
// 为什么查产物而不是 md：锚点 id 由 rehype 插件按 VitePress 规则生成（中文、标点、重名加 -1），在 md 里推算容易和实际对不上。
// 用法：pnpm build 后 node scripts/check-anchors.mjs [--json]；有失效锚点时退出码 1
// 只报正文里的链接（[data-pagefind-body] 内），页头页脚与章节条这类由模板生成的导航不在范围内
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'node-html-parser';

const DIST = 'dist';
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const files = walk(DIST).filter((f) => f.endsWith('.html'));
/** 产物文件 → 站内地址：backend/index.html → /backend/，其余原样 */
const urlOf = (f) => `/${relative(DIST, f).split(sep).join('/')}`.replace(/(^|\/)index\.html$/, '$1');

const ids = new Map();
const links = [];
for (const f of files) {
  const root = parse(readFileSync(f, 'utf8'));
  const url = urlOf(f);
  ids.set(url, new Set(root.querySelectorAll('[id]').map((e) => e.getAttribute('id'))));
  const body = root.querySelector('[data-pagefind-body]');
  if (!body) continue;
  for (const a of body.querySelectorAll('a[href*="#"]')) {
    const href = a.getAttribute('href');
    if (/^[a-z]+:/i.test(href)) continue; // 站外
    const [path, hash] = href.split('#');
    if (!hash) continue;
    const target = path ? new URL(path, `https://x${url}`).pathname : url;
    links.push({ from: url, href, target, id: decodeURIComponent(hash) });
  }
}
const bad = links.filter((l) => ids.has(l.target) && !ids.get(l.target).has(l.id));
if (process.argv.includes('--json')) console.log(JSON.stringify(bad, null, 1));
else for (const b of bad) console.log(`❌ ${b.from} → ${b.href}（目标页没有 id="${b.id}"）`);
console.log(`锚点链接 ${links.length} 个，失效 ${bad.length} 个`);
process.exit(bad.length ? 1 : 0);
