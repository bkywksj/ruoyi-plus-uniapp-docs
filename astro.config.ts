// Astro 配置：站点级的值一律来自 src/site.config.ts，这里只放构建行为
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/site.config';

export default defineConfig({
  site: site.url,
  // 网址形态由 site.urlFormat 决定：canonical、sitemap、站内链接三者必须一致，否则搜索引擎会当成两个 URL。
  // directory → /a/ + 结尾斜杠；file → /a.html（迁移旧站时保住已收录的 .html 网址）
  trailingSlash: site.urlFormat === 'file' ? 'never' : 'always',
  build: { format: site.urlFormat },
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
      serialize: (item) =>
        site.urlFormat === 'file' && !/(\/|\.[a-z0-9]+)$/i.test(new URL(item.url).pathname)
          ? { ...item, url: `${item.url}.html` }
          : item,
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
