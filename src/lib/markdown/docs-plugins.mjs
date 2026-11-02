// docs 模块的 Markdown 插件汇总：astro.config.ts 在 vitepress 兼容模式下把它们接进 unified 管线（Sätteri 不跑 remark / rehype 插件）。
// 收在一处是为了接线只有两行：裁掉 docs 模块时 module-strip 只需删这两处引用
import { remarkVueComponents } from './vue-components.mjs';
import { rehypeImgSize, rehypeLanding, rehypePreviewLinks, rehypeTableWrap } from './docs-layout.mjs';

/**
 * remark 插件：营销页里的 Vue 组件（AProductCard / APricingCard / ImagePreview / DownloadSection）→ 静态 HTML。
 * 🔴 要排在 remarkVpMarks 之前，否则这些标签会先被当成「未处理的组件」报出来
 * @param {{ icons: Record<string, any>, contact: { wechat: string, groupQr: string } | null }} options
 * @returns {any[]} unified 的 remarkPlugins 项（插件或 [插件, 选项]）
 */
export function docsRemarkPlugins({ icons, contact }) {
  return [
    [
      remarkVueComponents,
      {
        icons,
        groupQr: contact?.groupQr,
        groupNote: contact ? `二维码过期请加作者微信 ${contact.wechat} 拉你进群` : undefined,
      },
    ],
  ];
}

/**
 * rehype 插件（只动结构与链接去处，不动文字，要排在锚点插件 rehypeVpHeadingIds 之后）：
 * 表格外包横滑容器、营销页开头 h1 + 导语包进首屏 header、演示站链接改指手机外框预览页、本站图片补原始宽高
 * @type {any[]}
 */
export const docsRehypePlugins = [rehypeTableWrap, rehypeLanding, rehypePreviewLinks, rehypeImgSize];
