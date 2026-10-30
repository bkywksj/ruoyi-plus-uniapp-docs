// VitePress 写法兼容插件（site.markdownCompat: 'vitepress' 时由 astro.config 装上）：迁来的 .md 正文一个字不改，构建期还原旧站的扩展写法
// - remarkVpContainers：`::: tip 标题` … `:::` 容器 → Callout 样式的 HTML 块（tip / info / warning / danger / details）
// - remarkVpMarks：正文里的 <Ok/> 这类状态标记与 <Icon icon="lucide:x" /> → 构建期内联 SVG（标记名与图标映射在 src/data/vp-marks.json，图标数据离线）
// - remarkVpLinks：站内链接 x.md → x.html、无扩展名的 /a/b → /a/b.html（VitePress 构建时自动做的事；只在 file / preserve 网址形态下装）
// - rehypeVpHeadingIds：标题 id 用 VitePress 的 slug 规则（数字开头加 _ 等），旧站的 #锚点 书签不失效
// 为什么不用 MDX：迁移正文里常有 List<String>、{ } 这类字符，MDX 当 JSX / 表达式解析会成片报错；.md 管线把它们当普通文本，{{ }} 也原样显示。
// 只处理 Markdown 的 html 节点与段落文本；代码块是 code 节点，碰都不碰。

/** VitePress 容器的默认标题（旧站没配 markdown.container 文案时用的就是这几个） */
const CONTAINER_TITLE = {
  tip: 'TIP',
  info: 'INFO',
  warning: 'WARNING',
  danger: 'DANGER',
  details: 'Details',
};
const OPEN = /^:::\s*(tip|info|warning|danger|details)\b[ \t]*(.*)$/;
const CLOSE = /^:::\s*$/;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 容器开 / 闭标签的 HTML 节点 */
function openNode(type, title) {
  const t = escapeHtml(title.trim() || CONTAINER_TITLE[type]);
  return {
    type: 'html',
    value:
      type === 'details'
        ? `<details class="vp-callout vp-callout-details"><summary>${t}</summary>`
        : `<div class="vp-callout vp-callout-${type}"><p class="vp-callout-title">${t}</p>`,
  };
}
const closeNode = (type) => ({ type: 'html', value: type === 'details' ? '</details>' : '</div>' });

/** 段落只剩空文本时丢掉 */
const isEmptyParagraph = (node) =>
  node.type === 'paragraph' && node.children.every((c) => c.type === 'text' && c.value.trim() === '');

/**
 * 处理一组兄弟节点里的容器。Markdown 里 `::: tip` 与内容没空行时会和内容挤在同一段（"::: tip\n内容\n:::"），
 * 所以开 / 闭标记按「段落首行 / 末行」认，必要时把段落拆开。
 * @returns 新的兄弟节点数组
 */
function transformChildren(children, stack) {
  const out = [];
  for (const node of children) {
    if (node.type !== 'paragraph' || node.children[0]?.type !== 'text') {
      out.push(node);
      continue;
    }
    let para = node;
    const first = para.children[0];
    const firstLine = first.value.split('\n')[0];
    const open = firstLine.match(OPEN);
    if (open) {
      const [, type, title] = open;
      stack.push(type);
      out.push(openNode(type, title));
      const rest = first.value.slice(firstLine.length).replace(/^\n/, '');
      para = { ...para, children: [{ ...first, value: rest }, ...para.children.slice(1)] };
    }
    // 闭标记：段落末行是单独的 :::
    const last = para.children[para.children.length - 1];
    let closes = 0;
    if (last?.type === 'text' && stack.length > 0) {
      const lines = last.value.split('\n');
      while (lines.length > 0 && stack.length - closes > 0 && CLOSE.test(lines[lines.length - 1])) {
        lines.pop();
        closes++;
      }
      if (closes > 0) {
        para = { ...para, children: [...para.children.slice(0, -1), { ...last, value: lines.join('\n') }] };
      }
    }
    if (!isEmptyParagraph(para)) out.push(para);
    for (let i = 0; i < closes; i++) out.push(closeNode(stack.pop()));
  }
  return out;
}

/** remark 插件：::: 容器。容器没闭合时构建失败（旧站 markdown-it 会把后文全吞进容器，这里让它显形） */
export function remarkVpContainers() {
  return (tree, file) => {
    const visit = (parent) => {
      if (!parent.children) return;
      for (const child of parent.children) visit(child);
      if (['root', 'listItem', 'blockquote'].includes(parent.type)) {
        const stack = [];
        parent.children = transformChildren(parent.children, stack);
        if (stack.length > 0) throw new Error(`::: 容器没闭合（${stack.join(', ')}）：${file.path ?? ''}`);
      }
    };
    visit(tree);
  };
}

/**
 * 图标名 → 内联 SVG。
 * @param icons 离线图标数据：{ 'lucide:rocket': { body, width, height } }
 * @throws 图标数据里没有这个名字 —— Iconify 运行时遇到缺图标会静默画空，这里直接让构建失败
 */
export function iconSvg(icons, name, cls = '') {
  const icon = icons[name];
  if (!icon) throw new Error(`图标不存在：${name}（src/data/vp-icons.json 里没有，先补进去）`);
  const klass = ['iconify', cls].filter(Boolean).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width ?? 24} ${icon.height ?? 24}" width="1em" height="1em" class="${klass}" aria-hidden="true">${icon.body}</svg>`;
}

/**
 * 一段 html 节点文本里的状态标记 / 图标替换。
 * @param html 节点文本
 * @param marks 标记名 → { icon, class }
 * @param icons 离线图标数据
 * @returns [新文本, 没处理到的大写组件标签名]
 */
export function replaceComponents(html, marks, icons) {
  const names = Object.keys(marks).map((n) => n.replace(/[^A-Za-z0-9]/g, ''));
  let out = html;
  if (names.length > 0) {
    out = out.replace(new RegExp(`<(${names.join('|')})\\s*/>`, 'g'), (_, n) =>
      iconSvg(icons, marks[n].icon, marks[n].class),
    );
  }
  out = out.replace(/<Icon\s+icon="([\w-]+:[\w-]+)"[^>]*?\/>/g, (_, n) =>
    iconSvg(icons, n, 'iconify-inline'),
  );
  const unknown = [...out.matchAll(/<\/?([A-Z]\w*)\b/g)].map((m) => m[1]);
  return [out, unknown];
}

function walk(node, fn) {
  fn(node);
  if (node.children) for (const c of node.children) walk(c, fn);
}

/**
 * remark 插件：状态标记与图标。
 * @param {{ marks?: Record<string, { icon: string, class?: string }>, icons?: Record<string, { body: string, width?: number, height?: number }>, onUnknown?: (tag: string, file?: string) => void }} opts
 */
export function remarkVpMarks(opts = {}) {
  const { marks = {}, icons = {}, onUnknown } = opts;
  return (tree, file) => {
    walk(tree, (node) => {
      if (node.type !== 'html') return;
      const [out, unknown] = replaceComponents(node.value, marks, icons);
      node.value = out;
      for (const u of unknown) onUnknown?.(u, file.path);
    });
  };
}

/**
 * 站内链接补 .html：x.md → x.html；/a/b → /a/b.html；以 / 结尾、带扩展名、站外、纯锚点的不动。
 * @param url 链接
 */
export function fixLink(url) {
  if (!url || /^(https?:|mailto:|tel:|#|\/\/)/.test(url)) return url;
  const [path, hash = ''] = url.split(/(?=#)/);
  let p = path.replace(/\.md$/, '.html');
  if (p.startsWith('/') && !p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '.html';
  return p + hash;
}

/** remark 插件：站内链接按 VitePress 规则补 .html（只在 file / preserve 网址形态下装） */
export function remarkVpLinks() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type === 'link' || node.type === 'definition') node.url = fixLink(node.url);
    });
  };
}

// VitePress（@mdit-vue/shared）的 slugify，照搬以保证锚点一致
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[̀-ͯ]/g;

/** VitePress 的标题 slug 规则 */
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
