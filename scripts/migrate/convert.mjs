// docs 模块：旧站 Markdown → src/content/docs（可重跑：旧站切换前又改了内容，再跑一遍覆盖即可）
// 用法：node scripts/migrate/convert.mjs <旧站 docs 目录> <基线清单 json> [页面清单.txt]
// 正文保持 .md、尽量一个字不改，只做两件事：
//   1. frontmatter 补 title / description —— 直接取基线构建产物里旧站渲染出的值（h1 与 meta description），与旧站逐字相同；
//      lastUpdated 取旧仓库里这一篇的最后提交日期（旧站页底「最后更新于」、sitemap lastmod 用的就是它，换站后日期不跳）；
//      旧站 frontmatter head 里单独写的 keywords 提成 keywords 字段（其余 head 项新站逐页自动生成，整块丢掉）
//   2. `::: tip 标题` 容器 → HTML 块（Markdown 内容照常解析）；只在代码块外处理，列表里缩进的代码块也算代码块
// 其余旧站写法（状态标记、图标、.md 链接、锚点规则）交给框架构建期插件（site.markdownCompat: 'vitepress'），源文件不动。
// ::: 容器在这里按行预转换（与 markdown-it 同规则）而不交给框架 remarkVpContainers：后者按段落认标记，
// 闭合 ::: 紧跟列表时会被并进列表项、标题里带 <Icon/> 时标题会被拆散（全量构建实测 6 页失败）。预转换后正文里不再有 :::，框架插件自然不动，不会转两遍。
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readSiteMeta } from '../lib/site-meta.mjs';

const [docs, manifestPath, listPath] = process.argv.slice(2);
if (!docs || !manifestPath) {
  console.error('用法：node scripts/migrate/convert.mjs <旧站 docs 目录> <基线清单 json> [页面清单.txt]');
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const OUT = 'src/content/docs';
// 首页 index.md 也进文档集合：正文照旧；hero / features 留在 frontmatter，由 src/pages/index.astro 渲染（第 5 步只换视觉，不换数据来源）
const SKIP = new Set([]);

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
      // 标题里的行内代码照 markdown-it 渲染成 <code>（旧站「关于 `maxImageDpi`」显示为代码样式）；标题塞进 HTML 块后不再走 Markdown，这里先转好
      const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const t = esc(title.trim() || DEFAULT_TITLE[type]).replace(/`([^`]+)`/g, '<code>$1</code>');
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

/**
 * `::: code-group` … `:::` → 纯 CSS 选项卡（单选框 + :has()，零 JS）。
 * 组内每个代码块围栏写成 ```xml [Maven]：方括号里是页签名，转换时摘掉（留着会被当成语言名的一部分），代码块照常高亮。
 * 选项卡样式在 src/styles/docs-content.css 的 .vp-code-group（按第 n 个单选框显示第 n 个代码块）
 * @returns [新正文, 转换的代码组数]
 */
function convertCodeGroups(body) {
  const lines = body.split('\n');
  const out = [];
  let inGroup = false, fence = null, tabs = [], start = 0, count = 0;
  for (const line of lines) {
    if (!inGroup && !fence && /^ {0,3}:::\s*code-group\s*$/.test(line)) { inGroup = true; tabs = []; start = out.length; continue; }
    const f = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (f) {
      if (!fence) {
        fence = f[2];
        const label = inGroup ? f[3].match(/\[([^\]]+)\]/) : null;
        if (label) { tabs.push(label[1]); out.push(`${f[1]}${f[2]}${f[3].replace(/\s*\[[^\]]+\]/, '')}`); continue; }
      } else if (line.trim().startsWith(fence) && line.trim().replace(/[`~]/g, '') === '') fence = null;
      out.push(line);
      continue;
    }
    if (inGroup && !fence && /^ {0,3}:::\s*$/.test(line)) {
      count++;
      const id = `cg-${count}`;
      const head = `<div class="vp-code-group"><div class="vp-cg-tabs" role="tablist">${tabs
        .map((t, i) => `<input type="radio" name="${id}" id="${id}-${i}"${i ? '' : ' checked'}><label for="${id}-${i}">${t}</label>`).join('')}</div>`;
      out.splice(start, 0, '', head, '');
      out.push('', '</div>', '');
      inGroup = false;
      continue;
    }
    out.push(line);
  }
  if (inGroup) throw new Error('code-group 没闭合');
  return [out.join('\n'), count];
}

const SITE_META = readSiteMeta(process.cwd());
const yaml = (v) => JSON.stringify(v); // JSON 字符串就是合法的 YAML 双引号字符串
let written = 0, containers = 0;
for (const rel of list) {
  if (SKIP.has(rel)) continue;
  const page = manifest.pages[rel.replace(/\.md$/, '.html')];
  if (!page) throw new Error(`基线里没有这一页：${rel}`);
  const src = readFileSync(join(docs, rel), 'utf8').replace(/\r\n/g, '\n');
  const fm = src.match(/^---\n([\s\S]*?)\n---\n?/);
  const body = fm ? src.slice(fm[0].length) : src;
  // 页面标题取旧站 <title> 的页名部分（去掉站点后缀）：旧站 frontmatter 写了 title 时 <title> 用它而不是正文 h1（技术服务页）；首页 <title> 只有后缀，页名为空
  // 旧站 VitePress 的 title（<title> 的站点后缀）：每页是「页名 | 后缀」，后缀与 site.titleSuffix（没配时站名）同一句。
  // 🔴 先把 site.titleSuffix 配好再跑：后缀对不上时整条 <title> 会被当成页名写进 frontmatter（知识库迁移时脚本里写死的还是 officia 的后缀，实录）
  const SUFFIX = SITE_META.titleSuffix || SITE_META.name;
  const h1 = page.title === SUFFIX ? '' : page.title.endsWith(` | ${SUFFIX}`) ? page.title.slice(0, -` | ${SUFFIX}`.length) : page.title;
  const [grouped, g] = convertCodeGroups(body);
  const [converted, n] = convertContainers(grouped);
  containers += n + g;
  // 旧站 frontmatter 的 head（VitePress 专有，往 <head> 里加 meta）：新站只认其中的 keywords，提出来写成 keywords 字段
  const fmLines = fm ? fm[1].split('\n') : [];
  const headStart = fmLines.findIndex((l) => /^head:/.test(l));
  let headEnd = headStart;
  if (headStart >= 0) while (headEnd + 1 < fmLines.length && /^\s/.test(fmLines[headEnd + 1])) headEnd++;
  const headBlock = headStart >= 0 ? fmLines.slice(headStart, headEnd + 1).join('\n') : '';
  const keywords = headBlock.match(/name:\s*keywords\s*\n\s*content:\s*(.+)/)?.[1].trim();
  const keep = fmLines.filter((l, i) => !(headStart >= 0 && i >= headStart && i <= headEnd) && !/^(title|description|lastUpdated):/.test(l));
  if (keywords) keep.push(`keywords: ${yaml(keywords)}`);
  // lastUpdated 取旧仓库里这一篇的最后提交日期；旧站目录不在 git 仓库里时不写（docs.json 的 lastUpdated 为 required 时再用 add-lastupdated.mjs 补）
  let lastUpdated = '';
  try {
    lastUpdated = execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: docs, encoding: 'utf8' }).trim();
  } catch {
    /* 不是 git 仓库 */
  }
  const front = [`title: ${yaml(h1)}`, `description: ${yaml(page.description)}`, ...(lastUpdated ? [`lastUpdated: ${lastUpdated}`] : []), ...keep].join('\n');
  const dest = join(OUT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `---\n${front}\n---\n${converted}`);
  written++;
}
console.log(`写入 ${written} 页 → ${OUT}，转换容器 ${containers} 个`);
