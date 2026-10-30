// 内容集合定义 —— 站点的「数据库表」
//   docs：旧 VitePress 站迁来的 511 篇文档（.md，侧栏见 src/data/sidebar.json）。框架的 guides 集合已改造为它（.framework-sync.json）
// 改 schema 后跑一次 `pnpm astro sync` 刷新类型。
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 旧 VitePress 站迁来的文档（backend / frontend / mobile / practices 四个分区，正文保持 .md）。
 * id 就是相对路径去掉 .md（backend/common/pay、backend/index），网址照旧站：/backend/common/pay.html、/backend/。
 * 侧栏不在 frontmatter 里，而在 src/data/sidebar.json（从旧站构建产物读出的分组层级与顺序）。
 */
const docs = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/docs',
    // 默认 id 会把 backend/index 折成 backend，网址就对不上旧站的 /backend/index.html 了
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    /** 页面标题：取旧站渲染出的 h1（转换脚本写入），正文里的 # 标题保留不删 */
    title: z.string(),
    /** 取旧站渲染出的 meta description（frontmatter 手写或首段提取的结果），与旧站逐字相同 */
    description: z.string(),
    /** 移动端组件页：右侧显示手机实时预览（url 是 H5 演示地址） */
    iframe: z.boolean().default(false),
    url: z.url({ protocol: /^https$/ }).optional(),
    /** false：不显示右侧「页面导航」（旧站 aside: false） */
    aside: z.boolean().default(true),
    /** 首页（index.md）专用：VitePress home 布局的 hero 与功能卡，src/pages/index.astro 渲染；其余页没有 */
    layout: z.string().optional(),
    hero: z
      .object({
        name: z.string(),
        text: z.string().optional(),
        tagline: z.string().optional(),
        image: z.object({ src: z.string(), alt: z.string().optional() }).optional(),
        actions: z.array(z.object({ theme: z.string().optional(), text: z.string(), link: z.string() })).default([]),
      })
      .optional(),
    features: z
      .array(z.object({ icon: z.string().optional(), title: z.string(), details: z.string(), link: z.string().optional() }))
      .optional(),
    /** 旧站 frontmatter 里有、但旧主题从未渲染的字段：保留数据，不显示（与旧站一致） */
    highlights: z.array(z.object({ title: z.string(), details: z.string() })).optional(),
  }),
});

export const collections = { docs };
