// 旧站 Markdown → src/content/docs（可重跑：旧站切换前又改了内容，再跑一遍覆盖即可）
// 用法：node scripts/migrate/convert.mjs <旧站 docs 目录> <基线清单 json> [页面清单.txt]
// 正文保持 .md、尽量一个字不改，只做两件事：
//   1. frontmatter 补 title / description —— 直接取基线构建产物里旧站渲染出的值（h1 与 meta description），与旧站逐字相同
//   2. `::: tip 标题` 容器 → HTML 块（Markdown 内容照常解析）；只在代码块外处理，列表里缩进的代码块也算代码块
// 其余旧站写法（状态标记、图标、.md 链接、锚点规则）交给框架构建期插件（site.markdownCompat: 'vitepress'），源文件不动。
// ::: 容器在这里按行预转换（与 markdown-it 同规则）而不交给框架 remarkVpContainers：后者按段落认标记，
// 闭合 ::: 紧跟列表时会被并进列表项、标题里带 <Icon/> 时标题会被拆散（全量构建实测 6 页失败）。预转换后正文里不再有 :::，框架插件自然不动，不会转两遍。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [docs, manifestPath, listPath] = process.argv.slice(2);
if (!docs || !manifestPath) {
  console.error('用法：node scripts/migrate/convert.mjs <旧站 docs 目录> <基线清单 json> [页面清单.txt]');
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const OUT = 'src/content/docs';
// 首页与营销页（layout: home、带 Vue 卡片组件的）走第 5 步重做，不进文档集合
const SKIP = new Set(['index.md']);

const list = listPath
  ? readFileSync(listPath, 'utf8').split(/\r?\n/).filter(Boolean)
  : Object.keys(manifest.pages).map((p) => p.replace(/\.html$/, '.md'));

/** VitePress 容器默认标题（旧站没配 markdown.container 文案，用的就是这几个） */
const DEFAULT_TITLE = { tip: 'TIP', info: 'INFO', warning: 'WARNING', danger: 'DANGER', details: 'Details' };

/**
 * `::: type 标题` … `:::` → HTML 块。开闭标签各占一段（前后空行），中间的 Markdown 照常解析。
 * @returns [新正文, 转换的容器数]
 */
function convertContainers(body) {
  const lines = body.split('\n');
  const out = [];
  let fence = null; // 当前所在代码块的围栏（``` 或 ~~~，含缩进）
  const stack = [];
  let count = 0;
  for (const line of lines) {
    const f = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[2];
      else if (line.trim().startsWith(fence) && line.trim().replace(/[`~]/g, '') === '') fence = null;
      out.push(line);
      continue;
    }
    if (fence) { out.push(line); continue; }
    // 与 markdown-it 一致：开闭标记前可有 0–3 个空格（列表里缩进的 :::，旧站照样闭合，见 backend/common/mail.md）
    const open = line.match(/^ {0,3}:::\s*(tip|info|warning|danger|details)\b\s*(.*)$/);
    if (open) {
      const [, type, title] = open;
      const t = title.trim() || DEFAULT_TITLE[type];
      stack.push(type);
      count++;
      out.push('', type === 'details'
        ? `<details class="vp-callout vp-callout-details"><summary>${t}</summary>`
        : `<div class="vp-callout vp-callout-${type}"><p class="vp-callout-title">${t}</p>`, '');
      continue;
    }
    if (/^ {0,3}:::\s*$/.test(line) && stack.length) {
      const type = stack.pop();
      out.push('', type === 'details' ? '</details>' : '</div>', '');
      continue;
    }
    out.push(line);
  }
  if (stack.length) throw new Error(`容器没闭合：${stack.join(', ')}`);
  return [out.join('\n'), count];
}

const yaml = (v) => JSON.stringify(v); // JSON 字符串就是合法的 YAML 双引号字符串
let written = 0, containers = 0;
for (const rel of list) {
  if (SKIP.has(rel)) continue;
  const page = manifest.pages[rel.replace(/\.md$/, '.html')];
  if (!page) throw new Error(`基线里没有这一页：${rel}`);
  const src = readFileSync(join(docs, rel), 'utf8').replace(/\r\n/g, '\n');
  const fm = src.match(/^---\n([\s\S]*?)\n---\n?/);
  const body = fm ? src.slice(fm[0].length) : src;
  const h1 = page.headings.find((h) => h.startsWith('h1 '))?.slice(3) ?? '';
  const [converted, n] = convertContainers(body);
  containers += n;
  const keep = fm ? fm[1].split('\n').filter((l) => !/^(title|description):/.test(l)) : [];
  const front = [`title: ${yaml(h1)}`, `description: ${yaml(page.description)}`, ...keep].join('\n');
  const dest = join(OUT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `---\n${front}\n---\n${converted}`);
  written++;
}
console.log(`写入 ${written} 页 → ${OUT}，转换容器 ${containers} 个`);
