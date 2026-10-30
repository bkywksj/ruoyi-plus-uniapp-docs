// 内容集合定义 —— 站点的「数据库表」
// 三类集合对应内容站的三种典型数据：
//   guides：    使用指南（MDX，正文里嵌 Steps / Callout / Screenshot 等文档组件；分组与排序见 src/lib/guides.ts）
// 改 schema 后跑一次 `pnpm astro sync` 刷新类型。
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { GUIDE_SECTIONS } from './lib/guide-sections';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    /** 必填：meta description + 指南首页卡片摘要 */
    description: z.string(),
    /** 侧栏分组；可选值与顺序在 src/lib/guide-sections.ts */
    section: z.enum(GUIDE_SECTIONS),
    /** 组内顺序，越小越靠前 */
    order: z.number().int(),
    /** 「约 3 分钟」这类读者可感知的用时 */
    duration: z.string().optional(),
    /** 说明对应的最低产品版本，如 1.2.0；文档描述某个软件 / 接口版本时填 */
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, '版本号写成 1.2.0 这样的三段数字')
      .optional(),
    /** 需要提前准备的东西，如「一个 API Key」 */
    prepare: z.string().optional(),
    /**
     * 本篇常见问题：页尾渲染成可展开的问答，同时输出 FAQPage 结构化数据。
     * 只写页面上真会显示的内容（不可见内容标 FAQ 属于违规），答案用纯文本
     */
    faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).default([]),
    updated: z.coerce.date(),
    /** false：H1 下不渲染 description 导语（从别的站迁来的篇目，描述常取自正文首段，再渲染一遍就重复了） */
    lead: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

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
  }),
});

export const collections = { guides, docs };
