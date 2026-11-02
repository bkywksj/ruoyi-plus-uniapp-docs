// docs 模块 · withDocsSitemap：包在框架站点地图配置外的那一层。
// 🔴 分档必须拿「核心 serialize 补过 .html / 结尾斜杠之后」的最终地址去匹配：拿补齐前的 /a 去匹配 /a.html 的规则会全部静默落到兜底档
// （旧站与知识库都栽过）。这里把 sitemapRank 换成记录参数的假函数，直接断言它拿到的是哪个地址
import { describe, expect, it, vi } from 'vitest';

const seen: string[] = [];
vi.mock('../../src/lib/sitemap-rank', () => ({
  sitemapRank: (url: string) => {
    seen.push(url);
    return { priority: 0.5, changefreq: 'monthly' };
  },
}));
// 不读本站真实日期（strict 站会要求每页都有日期），给一张固定的表
vi.mock('../../src/lib/lastmod', async (orig) => ({
  ...(await orig<typeof import('../../src/lib/lastmod')>()),
  collectLastmod: () => ({ 'guide/a': '2026-08-17' }),
}));
// 模块测试各站共用，不读本站 docs.json（ruoyi.plus 关了分档，sitemapRank 根本不会被调用）：配置也给固定值，可在用例里改
const config = { sitemapLastmod: 'known', sitemap: { rules: [], fallback: { priority: 0.5, changefreq: 'monthly' } } as unknown };
vi.mock('../../src/lib/docs-config', () => ({ docsConfig: config }));

const { withDocsSitemap } = await import('../../src/lib/docs-sitemap');

describe('withDocsSitemap', () => {
  const core = {
    filter: (page: string) => !page.includes('/404'),
    serialize: <T extends { url: string }>(item: T): T => ({ ...item, url: `${item.url}.html` }),
  };
  const options = withDocsSitemap(core);

  it('先跑核心 serialize，再拿最终地址分档、查日期', () => {
    seen.length = 0;
    const out = options.serialize!({ url: 'https://example.com/guide/a' } as never) as unknown as { url: string; lastmod?: string; priority: number };
    expect(seen).toEqual(['https://example.com/guide/a.html']);
    expect(out.url).toBe('https://example.com/guide/a.html');
    expect(out.lastmod).toBe('2026-08-17');
    expect(out.priority).toBe(0.5);
  });

  it('docs.json 的 sitemap 为 null：不分档、不写 priority（旧站 sitemap 里本来就没有时）', () => {
    const saved = config.sitemap;
    config.sitemap = null;
    try {
      seen.length = 0;
      const out = options.serialize!({ url: 'https://example.com/guide/a' } as never) as unknown as Record<string, unknown>;
      expect(seen).toEqual([]);
      expect(out).not.toHaveProperty('priority');
      expect(out.lastmod).toBe('2026-08-17');
    } finally {
      config.sitemap = saved;
    }
  });

  it('核心 filter 照旧生效；手机外框预览页不进站点地图', () => {
    expect(options.filter!('https://example.com/404')).toBe(false);
    expect(options.filter!('https://example.com/preview')).toBe(false);
    expect(options.filter!('https://example.com/preview.html')).toBe(false);
    expect(options.filter!('https://example.com/guide/a')).toBe(true);
  });
});
