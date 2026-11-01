// 移动端在线体验 → 本站「手机外框预览页」（/preview.html?url=…）：电脑上直接打开 H5 会被拉满整屏，套进手机壳里看才是真实效果。
// 正文链接（rehype 插件 ry-layout.mjs）、栏目首页按钮、手机预览卡的「新窗口打开」都经这里换算，保证只有一处规则。
// .mjs 而不是 .ts：astro.config 引用的 rehype 插件也要用它，配置文件阶段不经 TS 编译。

/** 允许嵌进预览页的演示站：只放自己的 H5，防止预览页被拿去套别人的网站 */
export const PREVIEW_HOSTS = ['uni.ruoyi.plus'];
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
