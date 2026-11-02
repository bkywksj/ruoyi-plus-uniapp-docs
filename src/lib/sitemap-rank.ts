// docs 模块：sitemap 条目的 priority / changefreq 分档。规则在 src/data/docs.json 的 sitemap（各站不同，迁移旧站时照抄旧站
// docs/.vitepress/seo/sitemap.mjs 的档位，站点自己的测试用旧站构建产物 sitemap 的实际值核对）。
//
// priority 是相对值（同站内页面之间的排序建议），全站给同一个值等于没给，所以按「离转化有多近」拉开档次：
// 首页、下载页是转化终点；功能页与常见问题是搜索流量主入口；赞赏页这类不需要抢排名的往下放。

import { ChangeFreqEnum } from '@astrojs/sitemap';
import { docsConfig, type SitemapRule } from './docs-config';

export interface SitemapRank {
  priority: number;
  changefreq: ChangeFreqEnum;
}

/**
 * 按规则表决定抓取优先级与更新频率：按顺序匹配，第一条命中的生效（paths 整条相等、prefixes 前缀），都不命中走 fallback。
 * @param url 完整地址或站内路径都可以（先剥掉协议与域名再匹配）；
 *   🔴 必须是补过 .html 之后的最终地址 —— 旧站就栽在「拿到的地址形态和规则不一致，全部静默落到兜底档」上
 * @param rules 规则表，默认 docs.json 的 sitemap（单测传入固定规则）
 */
export function sitemapRank(
  url: string,
  rules: { rules: SitemapRule[]; fallback: Omit<SitemapRule, 'paths' | 'prefixes' | 'why'> } = docsConfig.sitemap ?? { rules: [], fallback: { priority: 0.5, changefreq: 'monthly' } },
): SitemapRank {
  let path = url.replace(/^https?:\/\/[^/]+/, '');
  if (!path.startsWith('/')) path = `/${path}`;
  // 首页两种写法同一页：file 形态下 Astro 给的是 /index.html
  if (path === '/index.html') path = '/';
  const hit = rules.rules.find((r) => r.paths?.includes(path) || r.prefixes?.some((p) => path.startsWith(p))) ?? rules.fallback;
  // 用 @astrojs/sitemap 自己的枚举：serialize 的返回类型只认它（运行时值就是 'daily' / 'weekly' / 'monthly' 这些字符串）
  return { priority: hit.priority, changefreq: hit.changefreq as ChangeFreqEnum };
}
