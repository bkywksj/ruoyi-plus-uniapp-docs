// docs 模块接到 @astrojs/sitemap 上：在框架原有的过滤 / 网址补齐之外，
// 1. 内容过期页（src/data/outdated.json，页面带 noindex）与手机外框预览页（工具页）不进站点地图；
// 2. 补 lastmod（docs.json 的 sitemapLastmod，来源见 lib/lastmod.ts）与 priority / changefreq 分档（lib/sitemap-rank.ts）。
// astro.config.ts 里写 sitemap(withDocsSitemap(核心配置))；裁掉 docs 模块时换回 sitemap(核心配置)
import type { SitemapOptions } from '@astrojs/sitemap';
import outdated from '../data/outdated.json';
import { docsConfig } from './docs-config';
import { collectLastmod, pageIdOf } from './lastmod';
import { sitemapRank } from './sitemap-rank';

type Options = NonNullable<SitemapOptions>;
type SitemapItem = Parameters<NonNullable<Options['serialize']>>[0];

/**
 * 在核心站点地图配置外包一层 docs 模块的过滤与字段
 * @param core 框架的 filter（排除 404）与 serialize（按 site.urlFormat 补齐 .html / 结尾斜杠）
 * @returns 交给 sitemap() 的配置；分档必须拿补齐之后的最终地址去匹配，所以先跑核心 serialize
 */
export function withDocsSitemap(core: {
  filter: (page: string) => boolean;
  serialize: (item: SitemapItem) => SitemapItem;
}): Options {
  const mode = docsConfig.sitemapLastmod;
  // 加载配置时就收集：strict 下缺日期在这里抛错让构建失败（serialize 里抛错会被 @astrojs/sitemap 吞掉，只打 ERROR、构建照样成功）
  const lastmod = collectLastmod(process.cwd(), mode);
  const stale = outdated.pages as Record<string, unknown>;
  return {
    filter: (page) =>
      core.filter(page) && !/\/preview(\.html)?\/?$/.test(page) && !(decodeURI(new URL(page).pathname).replace(/(\.html|\/)$/, '').slice(1) in stale),
    serialize: (raw) => {
      const item = core.serialize(raw);
      const id = pageIdOf(new URL(item.url).pathname);
      // 栏目首页 /backend/ 的页面 id 是 backend/index
      const date = lastmod[id] ?? lastmod[`${id}/index`];
      // 第二道（正常走不到）：strict 下缺日期已在 collectLastmod 抛错
      if (!date && mode === 'strict') throw new Error(`[sitemap] ${item.url} 没有最后更新日期：docs 写 frontmatter lastUpdated，独立页面登记到 src/data/page-dates.json`);
      // docs.json 的 sitemap 为 null：不写 priority / changefreq（旧站 sitemap 里本来就没有）
      return { ...item, ...(date ? { lastmod: date } : {}), ...(docsConfig.sitemap ? sitemapRank(item.url) : {}) };
    },
  };
}
