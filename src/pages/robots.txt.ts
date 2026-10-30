// robots.txt：动态生成，Sitemap 地址跟随 site.url，换域名不用改这里
// 名单里的每个爬虫都输出显式分组（Allow 或 Disallow）：只写「User-agent: *」时，
// 部分 AI 爬虫与站长工具会把站点判为「未明确授权」；想拒绝某类爬虫（如训练类）也必须显式 Disallow。
import type { APIRoute } from 'astro';
import { AI_CRAWLERS, absoluteUrl } from '@/lib/seo';

const PURPOSE_LABELS = {
  search: '检索与引用',
  user: '用户点名访问',
  training: '训练数据采集',
} as const;

export const GET: APIRoute = () => {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    '# 搜索引擎与 AI 爬虫：逐个显式声明（名单与策略见 src/data/ai-crawlers.json）',
    ...AI_CRAWLERS.flatMap((crawler) => [
      `# ${PURPOSE_LABELS[crawler.purpose]}`,
      `User-agent: ${crawler.name}`,
      crawler.allow ? 'Allow: /' : 'Disallow: /',
      '',
    ]),
    `Sitemap: ${absoluteUrl('/sitemap-index.xml')}`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
