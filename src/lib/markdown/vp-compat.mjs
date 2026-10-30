// VitePress 写法兼容插件（正文保持 .md，不转 MDX）：迁移来的 511 页一个字不改，构建期还原旧站的扩展写法
// - remarkVpCompat：正文里的 <Ok/> <No/> <Warn/> <Ask/> <Dot*/> 状态标记与 <Icon icon="lucide:x" /> → 内联 SVG（离线图标数据，与旧站同一份）；
//                   站内链接 x.md → x.html、无扩展名的 /a/b → /a/b.html（VitePress 构建时自动做的事）
// - rehypeVpHeadingIds：标题 id 用 VitePress 的 slug 规则（数字开头加 _ 前缀等），旧站的 #锚点 书签与站内锚点链接不失效
// 为什么不用 MDX：正文里有大量 List<String>、{ } 这类字符，MDX 当 JSX 解析会成片报错；.md 管线把它们当普通文本。
// 只处理 Markdown 的 html 节点（正文里的标签），代码块是 code 节点，碰都不碰。
import { readFileSync } from 'node:fs';

const ICONS = JSON.parse(readFileSync(new URL('../../data/vp-icons.json', import.meta.url), 'utf8'));

/** 旧站 marks.ts 的状态标记：组件名 → [图标, class] */
const MARKS = {
  Ok: ['lucide:circle-check', 'imark imark-ok'],
  No: ['lucide:circle-x', 'imark imark-no'],
  Warn: ['lucide:triangle-alert', 'imark imark-warn'],
  Ask: ['lucide:circle-help', 'imark imark-ask'],
  DotRed: ['lucide:circle', 'idot idot-red'],
  DotYellow: ['lucide:circle', 'idot idot-yellow'],
  DotGreen: ['lucide:circle', 'idot idot-green'],
  DotOrange: ['lucide:circle', 'idot idot-orange'],
  DotBlue: ['lucide:circle', 'idot idot-blue'],
  DotPurple: ['lucide:circle', 'idot idot-purple'],
};

/**
 * 图标名 → 内联 SVG 字符串。
 * @throws 图标数据里没有这个名字 —— 旧站 Iconify 遇到缺失图标静默画空，这里直接让构建失败
 */
export function iconSvg(name, cls = '') {
  const icon = ICONS[name];
  if (!icon) throw new Error(`图标不存在：${name}（src/data/vp-icons.json 里没有，先按旧站 build-icons 规则补进去）`);
  const klass = ['iconify', cls].filter(Boolean).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width} ${icon.height}" width="1em" height="1em" class="${klass}" aria-hidden="true">${icon.body}</svg>`;
}

/** 一段 html 节点文本里的标记 / 图标替换；返回 [新文本, 未识别的大写组件标签] */
export function replaceComponents(html) {
  const unknown = [];
  let out = html
    .replace(/<(Ok|No|Warn|Ask|Dot(?:Red|Yellow|Green|Orange|Blue|Purple))\s*\/>/g, (_, n) => iconSvg(MARKS[n][0], MARKS[n][1]))
    .replace(/<Icon\s+icon="([\w-]+:[\w-]+)"[^>]*?\/>/g, (_, n) => iconSvg(n, 'iconify-inline'));
  for (const m of out.matchAll(/<\/?([A-Z][\w]*)\b/g)) unknown.push(m[1]);
  return [out, unknown];
}

/** 站内链接补 .html：x.md → x.html；/a/b → /a/b.html；以 / 结尾、带扩展名、站外、纯锚点的不动 */
export function fixLink(url) {
  if (!url || /^(https?:|mailto:|tel:|#|\/\/)/.test(url)) return url;
  const [path, hash = ''] = url.split(/(?=#)/);
  let p = path.replace(/\.md$/, '.html');
  if (p.startsWith('/') && !p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '.html';
  return p + hash;
}

function walk(node, fn, parent) {
  fn(node, parent);
  if (node.children) for (const c of node.children) walk(c, fn, node);
}

/** remark 插件：状态标记 / 图标 / 链接。opts.onUnknown(标签, 文件) 收集正文里没处理的大写组件 */
export function remarkVpCompat(opts = {}) {
  return (tree, file) => {
    walk(tree, (node) => {
      if (node.type === 'html') {
        const [out, unknown] = replaceComponents(node.value);
        node.value = out;
        for (const u of unknown) opts.onUnknown?.(u, file.path);
      } else if (node.type === 'link' || node.type === 'definition') {
        node.url = fixLink(node.url);
      }
    });
  };
}

// VitePress（@mdit-vue/shared）的 slugify，照搬以保证锚点一致
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[̀-ͯ]/g;
export function vpSlugify(str) {
  return str
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(rSpecial, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

const textOf = (n) => (n.type === 'text' ? n.value : n.children ? n.children.map(textOf).join('') : '');

/** rehype 插件：h1–h6 的 id 改成 VitePress 规则，同页重名按 -1、-2 递增（与 markdown-it-anchor 一致） */
export function rehypeVpHeadingIds() {
  return (tree) => {
    const seen = new Map();
    walk(tree, (node) => {
      if (node.type !== 'element' || !/^h[1-6]$/.test(node.tagName)) return;
      const base = vpSlugify(textOf(node).trim());
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      node.properties = { ...node.properties, id: n === 0 ? base : `${base}-${n}` };
    });
  };
}
