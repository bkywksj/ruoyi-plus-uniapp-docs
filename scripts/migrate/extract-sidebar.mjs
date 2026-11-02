// docs 模块迁移脚本 · 侧栏：从旧站构建产物里读出 VitePress 渲染好的侧栏（比解析 1287 行的 config.ts 可靠），写成 src/data/sidebar.json
// 用法：node scripts/migrate/extract-sidebar.mjs <旧站 dist 目录>
// 每个分区取其首页（backend/index.html 等）上的侧栏；保留分组层级、默认折叠状态与顺序，链接换成页面 id（backend/common/pay）。
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';
import { readDocsConfig } from '../lib/site-meta.mjs';

const dist = process.argv[2];
// 栏目表取 docs.json（先把 sections 配好再跑）。旧站整站只有一棵侧栏时，结果里各栏目的树是同一棵：手工合成 { "docs": [...] } 即可
const SECTIONS = readDocsConfig(process.cwd()).sections.map((s) => s.id);

/**
 * 旧站链接 → 页面 id：/backend/ → backend/index；/backend/x.html → backend/x；站外链接原样保留并标 external。
 * @returns { id } 或 { href, external: true }
 */
function target(href) {
  if (/^https?:\/\//.test(href)) return { href, external: true };
  const path = href.split('#')[0].replace(/^\//, '');
  const id = path.endsWith('/') || path === '' ? `${path}index` : path.replace(/\.html$/, '');
  return { id };
}

/** 递归读一个 .VPSidebarItem：文字、链接、是否默认折叠、子项 */
function readItem(el) {
  const head = el.querySelector(':scope > .item');
  const text = head.querySelector('.text').textContent.trim();
  const a = head.querySelector('a');
  const kids = el.querySelector(':scope > .items');
  const node = { text, ...(a ? target(a.getAttribute('href')) : {}) };
  const cls = el.getAttribute('class');
  if (cls.includes('collapsible')) node.collapsed = cls.includes('collapsed') && !cls.includes('has-active');
  if (kids) node.items = kids.querySelectorAll(':scope > .VPSidebarItem').map(readItem);
  return node;
}

const out = {};
let pages = 0;
for (const s of SECTIONS) {
  const root = parse(readFileSync(join(dist, s, 'index.html'), 'utf8'));
  const nav = root.querySelector('#VPSidebarNav');
  // 顶层分组外面包了一层 div.group
  out[s] = nav.querySelectorAll('.group > .VPSidebarItem').map(readItem);
  const count = (items) => items.reduce((n, i) => n + (i.id ? 1 : 0) + (i.items ? count(i.items) : 0), 0);
  pages += count(out[s]);
  console.log(`${s}：顶层 ${out[s].length} 组，链接 ${count(out[s])} 个`);
}
writeFileSync('src/data/sidebar.json', JSON.stringify(out, null, 2) + '\n');
console.log(`共 ${pages} 个侧栏链接 → src/data/sidebar.json`);
