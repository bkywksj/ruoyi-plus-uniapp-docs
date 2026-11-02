// docs 模块 · sitemap 分档引擎：按顺序匹配、整条相等与前缀两种规则、地址写法归一、兜底档。
// 用固定规则测引擎本身；各站的档位（照旧站 sitemap 实际值）核对写在站点的 tests/unit/site-sitemap.test.ts
import { describe, expect, it } from 'vitest';
import { sitemapRank } from '@/lib/sitemap-rank';
import { docsConfig, type SitemapRule } from '@/lib/docs-config';

const RULES: { rules: SitemapRule[]; fallback: { priority: number; changefreq: SitemapRule['changefreq'] } } = {
  rules: [
    { paths: ['/', '/download.html'], priority: 1, changefreq: 'daily' },
    { prefixes: ['/features/'], paths: ['/features.html', '/faq.html'], priority: 0.9, changefreq: 'weekly' },
    // 顺序有意义：/features/legacy/ 也匹配上一条前缀，排在后面就永远轮不到
    { prefixes: ['/features/legacy/'], priority: 0.3, changefreq: 'yearly' },
  ],
  fallback: { priority: 0.6, changefreq: 'monthly' },
};

describe('sitemapRank', () => {
  it('整条相等：首页、下载页', () => {
    expect(sitemapRank('https://example.com/', RULES)).toEqual({ priority: 1, changefreq: 'daily' });
    expect(sitemapRank('https://example.com/download.html', RULES)).toEqual({ priority: 1, changefreq: 'daily' });
  });
  it('首页两种写法同一档：file 形态下 Astro 给的是 /index.html', () => {
    expect(sitemapRank('https://example.com/index.html', RULES)).toEqual(sitemapRank('https://example.com/', RULES));
  });
  it('前缀与整条可写在同一档', () => {
    expect(sitemapRank('https://example.com/features/sync.html', RULES)).toEqual({ priority: 0.9, changefreq: 'weekly' });
    expect(sitemapRank('https://example.com/faq.html', RULES)).toEqual({ priority: 0.9, changefreq: 'weekly' });
  });
  it('第一条命中的生效', () => {
    expect(sitemapRank('https://example.com/features/legacy/a.html', RULES).priority).toBe(0.9);
  });
  it('完整地址、站内路径、不带开头斜杠三种写法结果一致', () => {
    const full = sitemapRank('https://example.com/features/sync.html', RULES);
    expect(sitemapRank('/features/sync.html', RULES)).toEqual(full);
    expect(sitemapRank('features/sync.html', RULES)).toEqual(full);
  });
  it('🔴 补 .html 之前的地址（/features 而不是 /features.html）落到兜底档 —— 所以必须拿补齐后的最终地址来分档', () => {
    expect(sitemapRank('https://example.com/features', RULES)).toEqual({ priority: 0.6, changefreq: 'monthly' });
    expect(sitemapRank('https://example.com/features-old.html', RULES)).toEqual({ priority: 0.6, changefreq: 'monthly' });
  });
  it('不传规则时用本站 docs.json 的配置', () => {
    // 模块测试各站共用：不断言具体档位（那是站点配置），只断言默认参数确实是 docs.json 的那份；本站关了分档（sitemap: null）时不适用
    const config = docsConfig.sitemap;
    if (!config) return;
    expect(sitemapRank('/no-such-page-for-rank-test.html')).toEqual({ priority: config.fallback.priority, changefreq: config.fallback.changefreq });
  });
});
