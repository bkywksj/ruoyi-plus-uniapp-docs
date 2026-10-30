// llms.txt：给 AI 的站点摘要（https://llmstxt.org 约定格式）
// 由集合数据自动生成，内容与站点永远同步；不要手写静态文件放 public/
import type { APIRoute } from 'astro';
import { site } from '@/site.config';
import { absoluteUrl } from '@/lib/seo';
import { getGuides, guidePath } from '@/lib/guides';

export const GET: APIRoute = async () => {
  const guides = await getGuides();

  const sections = [
    `# ${site.name}`,
    '',
    `> ${site.tagline}`,
    '',
    site.description,
    '',
    '## 使用指南',
    '',
    ...guides.map(
      (guide) => `- [${guide.data.title}](${absoluteUrl(guidePath(guide.id))}): ${guide.data.description}`,
    ),
    '',
    // llmstxt.org 约定：「Optional」分组里的链接可在上下文不够时被 AI 跳过
    '## Optional',
    '',
    `- [关于本站](${absoluteUrl('/about/')})`,
    `- [站点地图](${absoluteUrl('/sitemap-index.xml')})`,
    '',
  ];

  return new Response(sections.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
