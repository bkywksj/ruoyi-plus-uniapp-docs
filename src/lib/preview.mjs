// docs 模块：移动端在线体验 → 本站「手机外框预览页」（/preview.html?url=…）：电脑上直接打开 H5 会被拉满整屏，套进手机壳里看才是真实效果。
// 正文链接（rehype 插件 docs-layout.mjs）、栏目首页按钮、手机预览卡的「新窗口打开」都经这里换算，保证只有一处规则。
// .mjs 而不是 .ts：astro.config 引用的 rehype 插件也要用它，配置文件阶段不经 TS 编译。
// 预览页本身（src/pages/preview.astro）是项目页面：只有有 H5 演示站的站点才做，白名单为空时插件什么都不改
import { previewHosts } from '../data/docs.json';

/**
 * 允许嵌进预览页的演示站（docs.json 的 previewHosts）：只放自己的 H5，防止预览页被拿去套别人的网站。
 * 🔴 用 Vite 的 JSON 具名导入，不用 readFileSync：本文件还会被预览页的浏览器端脚本引用（preview.astro 的 <script>），
 * node:fs 打进浏览器包会在运行时报错（ruoyi.plus 同步时比对产物发现）；具名导入只把这一个字段内联进去，不把整份配置打进浏览器。
 * 引用方（组件、预览页脚本、astro.config 的 rehype 插件、vitest）都经过 Vite，所以可以用具名导入
 */
export const PREVIEW_HOSTS = previewHosts ?? [];
export const PREVIEW_PATH = '/preview.html';

/**
 * 是不是可以放进手机外框的演示地址
 * @param href 任意链接
 * @returns http / https 且主机在白名单里
 */
export function isPreviewable(href) {
  try {
    const u = new URL(href);
    return /^https?:$/.test(u.protocol) && PREVIEW_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

/**
 * 演示地址 → 预览页链接；不在白名单里的原样返回
 * url 参数保留原写法（旧站正文是 http://），预览页加载时再升 https —— 迁移比对按参数还原后与旧站链接逐字相等
 * @param href 演示站地址，如 http://uni.ruoyi.plus/h5
 */
export function previewHref(href) {
  return isPreviewable(href) ? `${PREVIEW_PATH}?url=${encodeURIComponent(href)}` : href;
}
