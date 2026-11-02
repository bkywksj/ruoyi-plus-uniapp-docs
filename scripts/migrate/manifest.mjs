// docs 模块迁移脚本 · 构建产物清单：逐页抽取正文、代码块、标题、图片、链接、表格，供迁移前后逐页比对（compare-baseline.mjs）
// 用法：node scripts/migrate/manifest.mjs <dist 目录> <输出 json> [--pages 页面清单.txt]
// 新旧两站用同一套抽取与归一化规则，比对才公平：先找 [data-pagefind-body]（新站），没有再找 .vp-doc（旧站），都没有退到 main。
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'node-html-parser';
import { readSiteMeta } from '../lib/site-meta.mjs';

/** 本站域名（http / https 都算）：正文里写成绝对地址的站内链接按站内路径比 */
const SITE_ORIGIN = new RegExp(`^https?://${new URL(readSiteMeta(process.cwd()).url).host.replace(/\./g, '\\.')}`);

const [dist, out] = process.argv.slice(2);
if (!dist || !out) {
  console.error('用法：node scripts/migrate/manifest.mjs <dist 目录> <输出 json> [--pages 页面清单.txt]');
  process.exit(2);
}
const pagesArg = process.argv.indexOf('--pages');
const onlyPages = pagesArg > 0 ? new Set(readFileSync(process.argv[pagesArg + 1], 'utf8').split(/\r?\n/).filter(Boolean)) : null;

const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);
/** 正文归一化：去零宽字符、合并空白。两站排版不同（换行、缩进）不应算差异 */
const normText = (s) => s.replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
/** 代码归一化：只去每行行尾空白与首尾空行，行内一个字符都不改 —— 代码块必须逐字相等 */
const normCode = (s) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/^\n+|\n+$/g, '');
/** HTML 实体解码（node-html-parser 的 text 已解码大部分，这里兜底） */
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

const walk = (d) => readdirSync(d).flatMap((n) => {
  const f = join(d, n);
  return statSync(f).isDirectory() ? walk(f) : [f];
});

const files = walk(dist);
const pages = {};
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const rel = relative(dist, file).split(sep).join('/');
  if (onlyPages && !onlyPages.has(rel)) continue;
  const html = readFileSync(file, 'utf8');
  if (!/<html[\s>]/i.test(html)) continue; // 站长验证文件等非页面
  // blockTextElements 不含 pre：node-html-parser 默认把 <pre> 内部当原始文本，取到的是带高亮 style 的 HTML 而不是代码，
  // 两站高亮配色写法不同（--shiki-light 与 color:），会让每个代码块都「不一致」
  const root = parse(html, { comment: false, blockTextElements: { script: true, noscript: true, style: true } });
  // 先认 [data-pagefind-body]：旧站没有这个属性，照样落到 .vp-doc；新站文档页两者是同一个元素；下载页把它放在整页内容上（下载卡、正文、版本列表都算）
  const box = root.querySelector('[data-pagefind-body]') ?? root.querySelector('.vp-doc') ?? root.querySelector('main');
  if (!box) continue;
  // 去掉两站各自的装饰：标题锚点、复制按钮、语言标签、行号列、手机预览面板
  for (const sel of ['.header-anchor', 'button.copy', 'span.lang', '.line-numbers-wrapper', '[data-migrate-ignore]', 'script', 'style']) {
    for (const el of box.querySelectorAll(sel)) el.remove();
  }
  // 任务列表：旧站把 [x] 当文字，新站（GFM）渲染成复选框。两边统一成文字再比，含义相同不算差异
  for (const box2 of box.querySelectorAll('input[type="checkbox"]')) {
    box2.replaceWith(box2.hasAttribute('checked') ? '[x] ' : '[ ] ');
  }
  const codes = box.querySelectorAll('pre').map((pre) => {
    const code = pre.querySelector('code') ?? pre;
    const lang = (pre.parentNode?.getAttribute?.('class') ?? '').match(/language-([\w-]+)/)?.[1]
      ?? (pre.getAttribute('data-language') ?? '');
    const text = normCode(decode(code.textContent));
    return { lang, lines: text ? text.split('\n').length : 0, hash: sha(text) };
  });
  for (const pre of box.querySelectorAll('pre')) pre.remove();
  const headings = box.querySelectorAll('h1,h2,h3,h4').map((h) => `${h.tagName.toLowerCase()} ${normText(decode(h.textContent))}`);
  // 标题锚点 id：旧站书签与站内 #锚点 链接靠它，迁移后必须逐个相同
  const anchors = box.querySelectorAll('h1,h2,h3,h4,h5,h6').map((h) => h.getAttribute('id') ?? '').filter(Boolean);
  const text = normText(decode(box.textContent));
  const images = box.querySelectorAll('img').map((i) => ({ alt: i.getAttribute('alt') ?? '', src: i.getAttribute('src') ?? '' }));
  // 指向本站的绝对地址折成站内路径（新旧两站同一域名，写法不同不算差异）
  const links = box.querySelectorAll('a[href]').map((a) => (a.getAttribute('href') ?? '').replace(SITE_ORIGIN, ''));
  const head = root.querySelector('head');
  pages[rel] = {
    title: normText(head?.querySelector('title')?.textContent ?? ''),
    description: head?.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    canonical: head?.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
    headings,
    anchors,
    textLength: text.length,
    textHash: sha(text),
    text,
    codes,
    images,
    links,
    tableRows: box.querySelectorAll('tr').length,
    jsonLd: root.querySelectorAll('script[type="application/ld+json"]').length,
  };
}

const assets = files.filter((f) => !f.endsWith('.html')).map((f) => relative(dist, f).split(sep).join('/'))
  .filter((f) => !/^(assets|_astro|pagefind)\//.test(f));
const verification = files.map((f) => relative(dist, f).split(sep).join('/'))
  .filter((f) => /^(google[\w]+\.html|BingSiteAuth\.xml|baidu_verify_[\w-]+\.html|[0-9a-f]{32}\.txt)$/.test(f));
const jsonLdTypes = {};
for (const file of files.filter((f) => f.endsWith('.html'))) {
  for (const m of readFileSync(file, 'utf8').matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      for (const node of [JSON.parse(m[1])].flat().flatMap((x) => x['@graph'] ?? [x])) jsonLdTypes[node['@type']] = (jsonLdTypes[node['@type']] ?? 0) + 1;
    } catch { /* 解析失败的计数不进来，check:seo 会单独报 */ }
  }
}
writeFileSync(out, JSON.stringify({ dist, pageCount: Object.keys(pages).length, assets, verification, jsonLdTypes, pages }, null, 1));
console.log(`清单：${Object.keys(pages).length} 页，非页面文件 ${assets.length} 个，验证文件 ${verification.length} 个 → ${out}`);
