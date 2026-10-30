// 旧站营销页里的 Vue 组件（AProductCard / APricingCard / ImagePreview）→ 构建期静态 HTML，信息一项不丢
// 为什么在 remark 里做：这几页正文仍是迁来的 .md（不转 MDX），组件标签被解析成 html 节点，在这里按旧组件的模板逐字段输出；
// 视觉在第 5 步重做，这里只保证内容与旧站等价（产品名 / 标语 / 描述 / 亮点 / 按钮、价格 / 原价 / 节省 / 功能 / 按钮 / 页脚、全部图片）。
// 绑定属性（:highlights="[...]"）是旧站作者写的字面量数组 / 对象，用 Function 求值；只在构建期跑、只处理本仓库自己的文档。
import { iconSvg } from './vp-compat.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * 解析组件标签的属性：name="…" 是字符串，:name="…" 是 JS 字面量（数组 / 对象 / 数字 / 布尔）。kebab-case 转 camelCase
 * @param tag 整个标签文本（<X a="1" :b="[…]" />）
 * @returns 属性对象
 * @throws 绑定属性求值失败（写错了宁可构建失败，也不在页面上静默丢一段内容）
 */
export function parseAttrs(tag) {
  const props = {};
  const toCamel = (n) => n.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  // 不带值的布尔属性（旧站 demo.md 的 `recommended`）：去掉标签名与全部 name="…" 之后剩下的单词
  const rest = tag
    .replace(/^<[A-Za-z]\w*/, '')
    .replace(/(:?)([A-Za-z][\w-]*)="[^"]*"/g, ' ')
    .replace(/\/?>\s*$/, '');
  for (const m of rest.matchAll(/[A-Za-z][\w-]*/g)) props[toCamel(m[0])] = true;
  for (const m of tag.matchAll(/(:?)([A-Za-z][\w-]*)="([^"]*)"/g)) {
    const [, bound, rawName, raw] = m;
    const name = toCamel(rawName);
    if (!bound) props[name] = raw;
    else {
      try {
        props[name] = Function(`"use strict"; return (${raw});`)();
      } catch (e) {
        throw new Error(`组件属性 :${rawName} 求值失败：${e.message}`);
      }
    }
  }
  return props;
}

/** 旧站 AProductCard：左（logo / 名称 / 角标 / 标语 / 描述 / 按钮），右（亮点列表） */
export function productCard(p, icons) {
  const logo = p.logo
    ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" class="vc-product-logo" loading="lazy" />`
    : p.icon
      ? iconSvg(icons, p.icon, 'vc-product-icon')
      : '';
  const actions = (p.actions ?? [])
    .map(
      (a, i) =>
        `<a href="${esc(a.link)}" target="_blank" rel="noopener noreferrer" class="vc-btn${i === 0 ? ' vc-btn-primary' : ''}">${esc(a.text)}</a>`,
    )
    .join('');
  const highlights = (p.highlights ?? []).map((h) => `<li>${esc(h)}</li>`).join('');
  return `<div class="vc-product vc-theme-${esc(p.theme ?? 'blue')}"><div class="vc-product-main"><div class="vc-product-head">${logo}<div><div class="vc-product-title"><h3 class="vc-product-name">${esc(p.name)}</h3>${
    p.badge ? `<span class="vc-badge">${esc(p.badge)}</span>` : ''
  }</div>${p.slogan ? `<p class="vc-product-slogan">${esc(p.slogan)}</p>` : ''}</div></div>${
    p.description ? `<p class="vc-product-desc">${esc(p.description)}</p>` : ''
  }<div class="vc-actions">${actions}</div></div><ul class="vc-product-highlights">${highlights}</ul></div>`;
}

/** 旧站 APricingCard。按钮原来是「复制微信号 + 弹窗」，零 JS 版改成可展开的同一段联系方式 */
export function pricingCard(p, icons) {
  const features = (p.features ?? [])
    .map((f) => `<li>${iconSvg(icons, 'lucide:check', 'vc-check')}<span>${esc(f)}</span></li>`)
    .join('');
  const price = typeof p.price === 'number' ? `<span class="vc-currency">¥</span><span class="vc-price-value">${p.price}</span>` : `<span class="vc-price-value">${esc(p.price ?? '')}</span>`;
  return `<div class="vc-pricing${p.recommended ? ' is-recommended' : ''}">${
    p.recommended ? `<p class="vc-recommended">${iconSvg(icons, 'lucide:star', 'vc-star')} 推荐</p>` : ''
  }<h3 class="vc-plan">${esc(p.plan)}</h3>${p.description ? `<p class="vc-plan-desc">${esc(p.description)}</p>` : ''}<div class="vc-price">${price}</div>${
    p.originalPrice ? `<p class="vc-original">原价 ¥${esc(p.originalPrice)}</p>` : ''
  }${p.savingText ? `<p class="vc-saving">${esc(p.savingText)}</p>` : ''}<ul class="vc-features">${features}</ul><details class="vc-contact"><summary class="vc-btn${
    p.recommended ? ' vc-btn-primary' : ''
  }">${esc(p.buttonText ?? '立即咨询')}</summary><div data-migrate-ignore><p>微信同QQ：<strong>770492966</strong></p><p>请添加好友咨询</p></div></details>${
    p.footerText ? `<p class="vc-footer">${esc(p.footerText)}</p>` : ''
  }</div>`;
}

/** 旧站 ImagePreview：src 逗号分隔多张。旧组件首屏只露第一张、其余在点击预览里；这里全部输出（图片一张不丢），多张排成可横向滚动的图廊 */
export function imagePreview(p) {
  const urls = String(p.src ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const size = (v) => (v === undefined ? '' : typeof v === 'number' ? `${v}px` : v);
  const style = [p.width !== undefined && `width:${size(p.width)}`, p.height !== undefined && p.height !== 'auto' && urls.length === 1 && `height:${size(p.height)}`, p.objectFit && `object-fit:${p.objectFit}`]
    .filter(Boolean)
    .join(';');
  const img = (u) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="" loading="lazy"${style ? ` style="${style}"` : ''} /></a>`;
  return urls.length === 1
    ? `<span class="vc-image">${img(urls[0])}</span>`
    : `<div class="vc-gallery">${urls.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="" loading="lazy" /></a>`).join('')}</div>`;
}

const RENDER = { AProductCard: productCard, APricingCard: pricingCard, ImagePreview: imagePreview };

/**
 * Markdown 相对链接按 VitePress 规则补 .html（./changelog → ./changelog.html）。
 * 框架 remarkVpLinks（fixLink）只处理 / 开头的站内链接，相对链接会落成 /changelog 这种旧站没有的网址；本插件先跑，补完后框架那步不再改它。
 * 站外、根路径、纯锚点、已有扩展名、以 / 结尾的不动
 * @param url 链接
 */
export function fixRelativeLink(url) {
  if (!url || /^(https?:|mailto:|tel:|#|\/)/.test(url)) return url;
  const [path, rest = ''] = url.split(/(?=[#?])/);
  if (!path || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path)) return url;
  return `${path}.html${rest}`;
}

/**
 * 正文原始 HTML 里的站内 <a href>（如首页 <a href="./changelog">）按 VitePress 规则补 .html：
 * 相对或根路径、没有扩展名、不以 / 结尾的才补；锚点 / 查询串保留。Markdown 链接由框架 remarkVpLinks 处理，这里只管 html 节点
 * @param html html 节点文本
 */
export function fixRawLinks(html) {
  return html.replace(/(<a\b[^>]*?\bhref=")(\.{0,2}\/[^"#?]*?)([#?][^"]*)?"/g, (whole, pre, path, rest = '') =>
    path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? whole : `${pre}${path}.html${rest}"`,
  );
}
const TAG = /<(AProductCard|APricingCard|ImagePreview)\b([\s\S]*?)\/>/g;

/**
 * remark 插件：html 节点里的三种组件替换成静态 HTML。要放在 remarkVpMarks 之前（它会把剩下的大写组件当未处理报出来）
 * @param {{ icons: Record<string, { body: string, width?: number, height?: number }> }} opts
 */
export function remarkVueComponents(opts = {}) {
  const icons = opts.icons ?? {};
  return (tree, file) => {
    // 段落里只有组件标签（旧站写法：标签与上下文之间有空行）→ 整段换成块级 html 节点，避免输出 <p><div>…</div></p> 这种非法嵌套
    const lift = (parent) => {
      parent.children = parent.children?.map((c) => {
        if (
          c.type === 'paragraph' &&
          c.children.some((x) => x.type === 'html' && /<(AProductCard|APricingCard|ImagePreview)\b/.test(x.value)) &&
          c.children.every((x) => x.type === 'html' || (x.type === 'text' && x.value.trim() === ''))
        )
          return { type: 'html', value: c.children.map((x) => (x.type === 'html' ? x.value : '')).join('\n') };
        lift(c);
        return c;
      });
    };
    lift(tree);
    const walk = (node) => {
      if (node.type === 'html') node.value = fixRawLinks(node.value);
      if (node.type === 'link' || node.type === 'definition') node.url = fixRelativeLink(node.url);
      if (node.type === 'html' && TAG.test(node.value)) {
        TAG.lastIndex = 0;
        node.value = node.value.replace(TAG, (whole, name) => {
          try {
            return RENDER[name](parseAttrs(whole), icons);
          } catch (e) {
            throw new Error(`${name}（${file.path ?? ''}）：${e.message}`);
          }
        });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
