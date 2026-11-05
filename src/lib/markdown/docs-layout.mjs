// docs 模块版式用的 rehype 插件：只调整结构（包一层容器）或改链接去处，正文文字、标题、图片一个不改，迁移逐页比对照旧通过
// - rehypeTableWrap：表格外包 <div class="tbl">——表格本身保持 display:table 才能整宽排版，横向滚动交给外层（窄屏宽表不撑破版心）
// - rehypeLanding：营销页开头的 h1 + 紧跟的导语段落包进 <header class="lp-hero">（LandingLayout 的样式铺成深色首屏），其余正文按 h2 / h3 包分组容器；
//   首屏上的装饰（标签行 / 数字 / 产品图标带）取 src/data/landing.json，标 data-migrate-ignore（比对不看）+ data-pagefind-ignore（不进搜索）
// - rehypePreviewLinks：正文里指向移动端演示站（docs.json 的 previewHosts）的链接改指本站手机外框预览页（src/lib/preview.mjs）；
//   迁移比对会把 /preview.html?url=原地址 还原成原地址再比（compare-baseline.mjs），链接一条不少的检查照样有效
// - rehypeImgSize：正文里引用本站 public/ 下的图片补上原始 width / height 与 decoding="async"（见函数注释）
// - rehypeExternalLinks：正文里的站外链接在新标签页打开（与 VitePress 默认一致）
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { previewHref } from '../preview.mjs';
import { imageSize } from './img-size.mjs';

const landing = JSON.parse(readFileSync(new URL('../../data/landing.json', import.meta.url), 'utf8'));
const PUBLIC_DIR = fileURLToPath(new URL('../../../public/', import.meta.url));
/** 同一张图在多页出现（如二维码），读一次即可 */
const sizeCache = new Map();

/**
 * 正文图片补 width / height 与 decoding="async"。
 * 为什么：图片默认懒加载，下载前浏览器不知道它多高，按 0 排版；手机上快速下滑再回滑时，上方的图这才加载、突然撑开，
 * 把下面的内容往下推，看起来像页面「回退」。iOS 与部分内置浏览器没有滚动锚定，不会替你把位置拉回来。
 * 写上原始宽高后，浏览器按 width / height 的比例提前留位（全局样式里 img 已是 max-width:100%; height:auto，显示尺寸不变）。
 * 只处理 / 开头、在 public/ 里找得到的图；已经写了 width 或 height 的不动（行内 style 指定了尺寸的同理，保持原样）
 */
export function rehypeImgSize() {
  /** 本站图片（/ 开头、public/ 里有）的原始宽高；站外、找不到、认不出的返回 null */
  const localSize = (src) => {
    if (!src.startsWith('/') || src.startsWith('//')) return null;
    let rel;
    try {
      rel = decodeURI(src.split(/[?#]/)[0]).slice(1);
    } catch {
      return null;
    }
    if (!sizeCache.has(rel)) sizeCache.set(rel, imageSize(PUBLIC_DIR + rel));
    return sizeCache.get(rel);
  };
  const styledSize = (style) => /\b(width|height)\s*:/.test(String(style ?? ''));
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const p = node.properties ?? (node.properties = {});
        if (p.decoding === undefined) p.decoding = 'async';
        if (p.width === undefined && p.height === undefined && !styledSize(p.style)) {
          const size = localSize(typeof p.src === 'string' ? p.src : '');
          if (size) {
            p.width = size.width;
            p.height = size.height;
          }
        }
      }
      // 正文里直接写的 HTML（首页产品图标、二维码等）在这条管线里是原样字符串，不会变成元素节点，按标签文本补
      if (node.type === 'raw' && typeof node.value === 'string' && node.value.includes('<img')) {
        node.value = node.value.replace(/<img\b[^>]*>/gi, (tag) => {
          let out = tag;
          const attr = (name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i'))?.[1];
          const add = [];
          if (attr('decoding') === undefined) add.push('decoding="async"');
          if (attr('width') === undefined && attr('height') === undefined && !styledSize(attr('style'))) {
            const size = localSize(attr('src') ?? '');
            if (size) add.push(`width="${size.width}"`, `height="${size.height}"`);
          }
          if (add.length) out = tag.replace(/\s*\/?>$/, (end) => ` ${add.join(' ')}${end.trim() === '/>' ? ' />' : '>'}`);
          return out;
        });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/** 正文里的演示站链接改指手机外框预览页（电脑上直接打开 H5 会被拉满整屏） */
export function rehypePreviewLinks() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && typeof node.properties?.href === 'string') {
        node.properties.href = previewHref(node.properties.href);
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/**
 * 正文里指向站外的链接（http / https 绝对地址）在新标签页打开，补 target="_blank" 与 rel="noopener"。
 * 为什么：VitePress 默认这样处理外链，迁过来以后正文里的产品官网、授权站等链接变成在当前页打开，读者看完就回不到文档了。
 * 站内链接都是相对地址（/x、./x.md），不受影响；排在 rehypePreviewLinks 之后，被改成本站预览页的演示站链接照旧在本页打开。
 * 已经写了 target 的不动；rel 原有值保留，只补 noopener
 */
export function rehypeExternalLinks() {
  return (tree) => {
    const walk = (node) => {
      const href = node.type === 'element' && node.tagName === 'a' ? node.properties?.href : undefined;
      if (typeof href === 'string' && /^https?:\/\//i.test(href) && node.properties.target == null) {
        node.properties.target = '_blank';
        const rel = [node.properties.rel ?? []].flat().flatMap((r) => String(r).split(/\s+/)).filter(Boolean);
        if (!rel.includes('noopener')) rel.push('noopener');
        node.properties.rel = rel;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/** 表格包一层横向滚动容器 */
export function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((c) => {
        if (c.type === 'element' && c.tagName === 'table') {
          return { type: 'element', tagName: 'div', properties: { className: ['tbl'] }, children: [c] };
        }
        walk(c);
        return c;
      });
    };
    walk(tree);
  };
}

/**
 * 页面 id（相对 src/content/docs 去掉 .md，分隔符统一成 /）
 * @param path vfile 路径
 * @returns 如 products、backend/index；不在 docs 目录下返回 null
 */
export function docIdOf(path) {
  const m = String(path ?? '').replace(/\\/g, '/').match(/\/src\/content\/docs\/(.+)\.md$/);
  return m ? m[1] : null;
}

const raw = (value) => ({ type: 'raw', value });
const isWhitespace = (n) => n.type === 'text' && !n.value.trim();

const el = (tagName, className, children, extra = {}) => ({ type: 'element', tagName, properties: { className, ...extra }, children });
const isTag = (n, tag) => n.type === 'element' && n.tagName === tag;

/**
 * 把一串顶层节点按 h2 / h3 分组包起来（只加容器，节点顺序不变）：
 * <section class="lp-sec" data-sec="h2 的 id"> h2 + 引言 + <div class="lp-items"> <div class="lp-item">h3 + 内容</div>… </div></section>
 * 第一个 h2 之前的节点原样留在外面
 */
function wrapSections(nodes) {
  const out = [];
  let sec = null;
  let items = null;
  let item = null;
  for (const n of nodes) {
    if (isTag(n, 'h2')) {
      items = item = null;
      sec = el('section', ['lp-sec'], [n], { dataSec: n.properties?.id ?? '' });
      out.push(sec);
    } else if (sec && isTag(n, 'h3')) {
      if (!items) {
        items = el('div', ['lp-items'], []);
        sec.children.push(items);
      }
      item = el('div', ['lp-item'], [n]);
      items.children.push(item);
    } else (item ?? sec ?? { children: out }).children.push(n);
  }
  return out;
}

/**
 * 营销页版式（landing.json 登记的页）：
 * 1. hero（默认开）：开头 h1 + 导语段落进 <header class="lp-hero">，装饰按 landing.json 加在前后
 * 2. chapters：首屏后加一排按 h2 生成的章节跳转条
 * 3. sections（默认开）：其余正文按 h2 / h3 分组包容器，供 landing.css 排成卡片网格
 */
export function rehypeLanding() {
  return (tree, file) => {
    const id = docIdOf(file.path);
    const conf = id && landing.pages[id];
    if (!conf) return;
    let kids = tree.children;
    const head = [];
    if (conf.hero !== false) {
      const h1 = kids.findIndex((n) => isTag(n, 'h1'));
      if (h1 < 0) throw new Error(`${id}：营销页首屏要包住开头的 h1，正文里没找到`);
      let end = h1 + 1;
      while (end < kids.length && isWhitespace(kids[end])) end++;
      const hasLead = conf.lead !== false && isTag(kids[end] ?? {}, 'p');
      const taken = kids.slice(h1, hasLead ? end + 1 : h1 + 1);
      const before = conf.kicker ? [raw(`<p class="lp-kicker" data-migrate-ignore data-pagefind-ignore>${conf.kicker}</p>`)] : [];
      const after = conf.extra ? [raw(`<div class="lp-extra" data-migrate-ignore data-pagefind-ignore>${conf.extra}</div>`)] : [];
      head.push(...kids.slice(0, h1), el('header', ['lp-hero'], [el('div', ['lp-hero-in'], [...before, ...taken, ...after])]));
      kids = kids.slice(h1 + taken.length);
    }
    // 长页的章节条：按正文 h2（锚点 id 已由 rehypeVpHeadingIds 生成）列一排吸顶跳转，紧跟在首屏后面
    if (conf.chapters) {
      const links = kids
        .filter((n) => isTag(n, 'h2') && n.properties?.id)
        .map((h, i) => `<a href="#${encodeURIComponent(h.properties.id)}"><span>${String(i + 1).padStart(2, '0')}</span>${escapeHtml(textOf(h))}</a>`)
        .join('');
      head.push(raw(`<nav class="lp-chips" aria-label="章节" data-migrate-ignore data-pagefind-ignore><div>${links}</div></nav>`));
    }
    tree.children = [...head, ...(conf.sections === false ? kids : wrapSections(kids))];
  };
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** hast 节点的纯文字（标题里可能夹着行内代码、图标） */
const rawText = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(rawText).join(''));
const textOf = (n) => rawText(n).replace(/\s+/g, ' ').trim();
