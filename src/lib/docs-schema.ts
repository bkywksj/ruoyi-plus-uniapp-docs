// docs 模块：docs 集合定义（src/content.config.ts 引用它）。字段是四个迁移站用到的并集，各站不用的字段不写即可。
// 正文保持旧站的 .md（大站转 MDX 成本太高，见 vitepress-migration 技能），id 就是相对路径去掉 .md
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsConfig } from '@/lib/docs-config';

const date = z.coerce.date();

export const docsCollection = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/docs',
    // 默认 id 会把 backend/index 折成 backend，网址就对不上旧站的 /backend/index.html、/backend/ 了
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    /** 页面标题：取旧站渲染出的 h1（转换脚本写入），正文里的 # 标题保留不删 */
    title: z.string(),
    /** 取旧站渲染出的 meta description（frontmatter 手写或首段提取的结果），与旧站逐字相同 */
    description: z.string(),
    /**
     * 最后更新日期（YYYY-MM-DD）：页面底部「最后更新」、TechArticle.dateModified、sitemap lastmod 三处同源。
     * docs.json 的 lastUpdated 为 required 时必填。🔴 改了读者看得到的内容就改它；只改排版 / 渲染方式不算。
     * sitemap 那一侧不经 astro:content，由 src/lib/lastmod.ts 直接读这一行，所以写法固定为「lastUpdated: 2026-11-02」
     */
    lastUpdated: docsConfig.lastUpdated === 'required' ? date : date.optional(),
    /** 本页 meta keywords（逗号分隔），不写用全站 site.keywords。旧站在 frontmatter head 里单独写过的页迁过来放这里 */
    keywords: z.string().optional(),
    /** 移动端组件页：右侧显示手机实时预览（url 是 H5 演示地址） */
    iframe: z.boolean().default(false),
    url: z.url({ protocol: /^https$/ }).optional(),
    /** false：不显示右侧「页面导航」（旧站 aside: false） */
    aside: z.boolean().default(true),
    /** 首页（index.md）专用：VitePress home 布局的 hero 与功能卡，由项目的 src/pages/index.astro 渲染；其余页没有 */
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
    // VitePress 的 features：icon 可以是字符串（emoji / 字符）或图片 { src, width, height }（知识库首页用后者）
    features: z
      .array(
        z.object({
          icon: z
            .union([z.string(), z.object({ src: z.string(), alt: z.string().optional(), width: z.number().optional(), height: z.number().optional() })])
            .optional(),
          title: z.string(),
          details: z.string(),
          link: z.string().optional(),
          linkText: z.string().optional(),
        }),
      )
      .optional(),
    /** 旧站 frontmatter 里有、但旧主题从未渲染的字段：保留数据，不显示（与旧站一致） */
    highlights: z.array(z.object({ title: z.string(), details: z.string() })).optional(),
  }),
});
