// Astro 配置：站点级的值一律来自 src/site.config.ts，这里只放构建行为
import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/site.config';
import { unified } from '@astrojs/markdown-remark';
import { remarkVpCompat, rehypeVpHeadingIds } from './src/lib/markdown/vp-compat.mjs';

// 目录首页的网址集合（/backend、/backend/modules/workflow、/guide…）：sitemap 按它决定补 / 还是补 .html。
// 来源：迁移文档里的 **/index.md 与 src/pages 下的 **/index.astro（不含站点首页）
const DIR_INDEXES = new Set(
  [
    ...readdirSync('src/content/docs', { recursive: true }).map(String).filter((f) => /(^|[\\/])index\.md$/.test(f)),
    ...readdirSync('src/pages', { recursive: true }).map(String).filter((f) => /[\\/]index\.astro$/.test(f) && !f.includes('[')),
  ].map((f) => `/${f.replace(/\\/g, '/').replace(/\/?index\.(md|astro)$/, '')}`),
);

// 正文里没被兼容插件处理的大写组件标签：构建时逐个打印（同一标签同一文件只报一次），迁移验收时人工过目
const reported = new Set<string>();
const onUnknown = (tag: string, file?: string) => {
  const key = `${tag}@${file}`;
  if (reported.has(key)) return;
  reported.add(key);
  console.warn(`[vp-compat] 正文里有未处理的组件 <${tag}>：${file}`);
};

export default defineConfig({
  // 迁移文档（.md）还原 VitePress 写法：状态标记 / 图标 / .md 链接 / 锚点规则，见 src/lib/markdown/vp-compat.mjs
  // Astro 7 默认的 Sätteri 管线不跑 remark / rehype 插件，显式用 unified()（@astrojs/markdown-remark）
  markdown: {
    processor: unified({
      // 关掉 SmartyPants：它把正文里的 'none'、"代码即文档" 改成弯引号，技术文档里的字面值就变了（旧站 markdown-it 不改）
      smartypants: false,
      remarkPlugins: [[remarkVpCompat, { onUnknown }]],
      rehypePlugins: [rehypeVpHeadingIds],
    }),
    // 与旧站同一对主题；深色由 vp-compat.css 按 :root.dark 切到 --shiki-dark
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  site: site.url,
  // 网址形态由 site.urlFormat 决定：canonical、sitemap、站内链接三者必须一致，否则搜索引擎会当成两个 URL。
  // directory → /a/ + 结尾斜杠；file → /a.html（迁移旧站时保住已收录的 .html 网址）
  // 本项目（VitePress 迁移）的 file 形态用 Astro 的 'preserve'：普通页 a/b.html，分区首页 backend/index.html（网址 /backend/）——
  // 与 VitePress 产物一模一样。'file' 会把 backend/index 折成 backend.html，旧站 /backend/ 就 404 了。
  // preserve 下首页类网址带斜杠、其余带 .html，trailingSlash 只能 ignore
  trailingSlash: site.urlFormat === 'file' ? 'ignore' : 'always',
  build: { format: site.urlFormat === 'file' ? 'preserve' : site.urlFormat },
  // Astro 7 默认 'jsx' 会删掉行内元素之间的空格（中英混排时英文单词会粘在一起），显式恢复 HTML 感知压缩
  compressHTML: true,
  integrations: [
    react(),
    // 使用指南（guides 集合）用 MDX：正文里嵌 Steps / Callout / Screenshot 等文档组件
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      // file 网址形态：@astrojs/sitemap 输出的是不带 .html 的 /a，与页面 canonical（/a.html）对不上，补齐。
      // 首页与已带扩展名的地址不动；check:seo 会核对 sitemap 每条都是某一页的 canonical
      // preserve 输出下目录首页（backend/index.html）的网址是 /backend/，不能补 .html（旧站 sitemap 就是 /backend/）
      serialize: (item) => {
        const path = new URL(item.url).pathname;
        if (site.urlFormat !== 'file' || /(\/|\.[a-z0-9]+)$/i.test(path)) return item;
        return { ...item, url: DIR_INDEXES.has(path) ? `${item.url}/` : `${item.url}.html` };
      },
    }),
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
