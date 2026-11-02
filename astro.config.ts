// Astro 配置：站点级的值一律来自 src/site.config.ts，这里只放构建行为
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/site.config';
import {
  rehypeVpHeadingIds,
  remarkVpContainers,
  remarkVpLinks,
  remarkVpMarks,
} from './src/lib/markdown/vp-compat.mjs';
import vpMarks from './src/data/vp-marks.json';
import vpIcons from './src/data/vp-icons.json';
import { docsRehypePlugins, docsRemarkPlugins } from './src/lib/markdown/docs-plugins.mjs'; // docs 模块
import { withDocsSitemap } from './src/lib/docs-sitemap'; // docs 模块

// 迁移正文里没被兼容插件处理的大写组件标签：构建时逐个打印（同一标签同一文件只报一次），迁移验收时人工过目
const reportedUnknown = new Set<string>();
const onUnknownComponent = (tag: string, file?: string) => {
  if (reportedUnknown.has(`${tag}@${file}`)) return;
  reportedUnknown.add(`${tag}@${file}`);
  console.warn(`[vp-compat] 正文里有未处理的组件 <${tag}>：${file}`);
};

// Markdown 处理器：两种模式都关智能标点（技术文档里的 'none'、"x" 被改成弯引号，读者照抄就错了）。
// vitepress 模式换成 unified：Astro 7 默认的 Sätteri 不跑 remark / rehype 插件。
// 🔴 改了 remark / rehype 插件后先 pnpm cache:clear 再构建：内容层按正文缓存渲染结果，插件变了不会重新渲染，测试会假绿
const markdownProcessor =
  site.markdownCompat === 'vitepress'
    ? unified({
        smartypants: false,
        remarkPlugins: [
          remarkVpContainers,
          ...docsRemarkPlugins({ icons: vpIcons, contact: site.contact }), // docs 模块：营销页 Vue 组件 → 静态 HTML（要在 remarkVpMarks 之前）
          [remarkVpMarks, { marks: vpMarks, icons: vpIcons, onUnknown: onUnknownComponent }],
          // .md / 无扩展名链接补 .html 只对 .html 网址形态有意义；directory 形态下补了反而成死链
          ...(site.urlFormat === 'directory' ? [] : [remarkVpLinks]),
        ],
        rehypePlugins: [
          rehypeVpHeadingIds,
          ...docsRehypePlugins, // docs 模块：表格横滑、营销页首屏、演示站链接、图片宽高（只动结构，要在锚点插件之后）
        ],
      })
    : satteri({ features: { smartPunctuation: false } });

// 站点地图：排除 404；file / preserve 网址形态下补齐 .html / 结尾斜杠（与页面 canonical 一致）
const sitemapOptions = {
  filter: (page: string) => !page.includes('/404'),
  // file / preserve 网址形态：@astrojs/sitemap 输出的是不带 .html 的 /a，与页面 canonical（/a.html）对不上，补齐。
  // preserve 下目录首页（产物 a/index.html）的网址是 /a/，不能补成 /a.html —— 按产物里有没有 a/index.html 判断
  // （serialize 在 astro:build:done 之后跑，dist 已写完）。首页与已带扩展名的地址不动；check:seo 核对 sitemap 每条都是某一页的 canonical
  serialize: <T extends { url: string }>(item: T): T => {
    const path = new URL(item.url).pathname;
    if (site.urlFormat === 'directory' || /(\/|\.[a-z0-9]+)$/i.test(path)) return item;
    if (site.urlFormat === 'preserve' && existsSync(`dist${decodeURIComponent(path)}/index.html`))
      return { ...item, url: `${item.url}/` };
    return { ...item, url: `${item.url}.html` };
  },
};

export default defineConfig({
  markdown: {
    processor: markdownProcessor,
    // 代码高亮出成双主题：shiki 在行内样式里多写一份 --shiki-dark，docs 模块的深色代码窗与深色模式取它。
    // vitepress 兼容模式照 VitePress 默认那一对；其余模式两档都用 github-dark —— 与原来的单主题外观一致，文章页代码块不变色
    shikiConfig: {
      themes: site.markdownCompat === 'vitepress' ? { light: 'github-light', dark: 'github-dark' } : { light: 'github-dark', dark: 'github-dark' },
    },
  },
  site: site.url,
  // 网址形态由 site.urlFormat 决定：canonical、sitemap、站内链接三者必须一致，否则搜索引擎会当成两个 URL。
  // directory → /a/ + 结尾斜杠；file → /a.html（迁移旧站时保住已收录的 .html 网址）；
  // preserve → 叶子页 a.html、目录首页 a/index.html（网址 /a/），与 VitePress 产物一致。preserve 下两种结尾并存，trailingSlash 只能 ignore
  trailingSlash: ({ directory: 'always', file: 'never', preserve: 'ignore' } as const)[site.urlFormat],
  build: { format: site.urlFormat },
  // Astro 7 默认 'jsx' 会删掉行内元素之间的空格（中英混排时英文单词会粘在一起），显式恢复 HTML 感知压缩
  compressHTML: true,
  integrations: [
    react(),
    // 使用指南（guides 集合）用 MDX：正文里嵌 Steps / Callout / Screenshot 等文档组件
    mdx(),
    sitemap(withDocsSitemap(sitemapOptions)), // docs 模块：过期页 / 预览页不进站点地图，补 lastmod 与 priority 分档
  ],
  image: {
    domains: site.imageDomains,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rolldownOptions: {
        // 每篇 MDX 一条 MODULE_LEVEL_DIRECTIVE：来自 Astro 自己生成的内容代理模块里的
        // "use astro:head-inject"（astro/dist/content/vite-plugin-content-assets.js）。
        // 7.3.x 里没有任何地方读这个字符串，样式上提靠模块元数据 propagation 与 __astroPropagation，
        // 打包时丢掉它不影响结果。只按「代码 + 这条指令」精确放过，别的指令告警照常报
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('astro:head-inject'))
            return;
          warn(warning);
        },
      },
    },
  },
});
