// /sitemap.xml：旧 VitePress 站的站点地图地址，已提交给 Google / Bing / 百度站长平台，旧站页面 <link rel="sitemap"> 与 llms.txt 也指向它。
// 本站真正的站点地图由 @astrojs/sitemap 生成在 /sitemap-index.xml → /sitemap-0.xml；这里输出一个指向它的站点地图索引，
// 让旧地址继续有效（返回 404 的话平台会把整份站点地图判为失效）
import type { APIRoute } from 'astro';
import { absoluteUrl } from '@/lib/seo';

export const GET: APIRoute = () => {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${absoluteUrl('/sitemap-0.xml')}</loc></sitemap>`,
    '</sitemapindex>',
    '',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
