// docs 模块 · 最后更新日期收集（sitemap lastmod 的来源）：三档严格程度、frontmatter 解析、独立页登记
// 用临时站点目录跑，不依赖框架示例内容；各站自己的日期核对（如「首页日期与原型交付同日」）写在站点的 tests/unit/site-*.test.ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectLastmod, frontmatterDate, isoDate, pageIdOf, staticPageIds } from '@/lib/lastmod';

/** 建一个最小站点：docs 下两篇（一篇带日期、一篇不带）、两个独立页面、page-dates 登记其中一个 */
function fixture(pageDates: Record<string, string> = { index: '2026-11-02' }) {
  const root = mkdtempSync(join(tmpdir(), 'lastmod-'));
  mkdirSync(join(root, 'src/content/docs/guide'), { recursive: true });
  mkdirSync(join(root, 'src/pages'), { recursive: true });
  mkdirSync(join(root, 'src/data'), { recursive: true });
  writeFileSync(join(root, 'src/content/docs/guide/a.md'), '---\ntitle: "A"\nlastUpdated: 2026-08-17\n---\n正文');
  writeFileSync(join(root, 'src/content/docs/guide/b.md'), '---\ntitle: "B"\n---\n正文');
  for (const p of ['index.astro', 'download.astro', '404.astro', '[...slug].astro', 'robots.txt.ts']) writeFileSync(join(root, 'src/pages', p), '');
  writeFileSync(join(root, 'src/data/page-dates.json'), JSON.stringify({ pages: pageDates }));
  return root;
}

describe('frontmatterDate', () => {
  it('取 YYYY-MM-DD，引号可有可无；没有字段或格式不对返回 undefined（不猜日期）', () => {
    expect(frontmatterDate('---\nlastUpdated: 2026-08-17\n---\n')).toBe('2026-08-17');
    expect(frontmatterDate('---\nlastUpdated: "2026-08-17"\n---\n')).toBe('2026-08-17');
    expect(frontmatterDate('---\ntitle: x\n---\n')).toBeUndefined();
    expect(frontmatterDate('---\nlastUpdated: 2026/08/17\n---\n')).toBeUndefined();
    expect(frontmatterDate('没有 frontmatter')).toBeUndefined();
  });
});

describe('collectLastmod', () => {
  it('strict：有文档缺日期就抛错（让构建失败，而不是 sitemap 里悄悄少一项）', () => {
    expect(() => collectLastmod(fixture(), 'strict')).toThrow(/guide\/b\.md 缺少 lastUpdated/);
  });
  it('strict：独立页面没登记日期也抛错', () => {
    const root = fixture();
    writeFileSync(join(root, 'src/content/docs/guide/b.md'), '---\nlastUpdated: 2026-01-01\n---\n');
    expect(() => collectLastmod(root, 'strict')).toThrow(/src\/pages\/download\.astro 没有登记/);
  });
  it('strict：都齐了返回全站 id → 日期', () => {
    const root = fixture({ index: '2026-11-02', download: '2026-11-03' });
    writeFileSync(join(root, 'src/content/docs/guide/b.md'), '---\nlastUpdated: 2026-01-01\n---\n');
    expect(collectLastmod(root, 'strict')).toEqual({ 'guide/a': '2026-08-17', 'guide/b': '2026-01-01', index: '2026-11-02', download: '2026-11-03' });
  });
  it('known：缺日期的跳过、不抛错', () => {
    expect(collectLastmod(fixture(), 'known')).toEqual({ 'guide/a': '2026-08-17', index: '2026-11-02' });
  });
  it('off：不收集', () => {
    expect(collectLastmod(fixture(), 'off')).toEqual({});
  });
  it('任何模式下 page-dates.json 里日期写错都抛错', () => {
    expect(() => collectLastmod(fixture({ index: '2026-1-2' }), 'known')).toThrow(/不是 YYYY-MM-DD/);
  });
});

describe('staticPageIds / pageIdOf / isoDate', () => {
  it('独立页面 = src/pages 下的 .astro，去掉动态路由、404 与端点', () => {
    expect(staticPageIds(fixture()).sort()).toEqual(['download', 'index']);
  });
  it('网址路径 → 页面 id：三种网址形态都认', () => {
    expect(pageIdOf('/')).toBe('index');
    expect(pageIdOf('/guide/a.html')).toBe('guide/a');
    expect(pageIdOf('/guide/a/')).toBe('guide/a');
    expect(pageIdOf('/%E4%B8%AD%E6%96%87.html')).toBe('中文');
  });
  it('Date → YYYY-MM-DD 按 UTC 取（frontmatter 日期被解析成 UTC 零点）', () => {
    expect(isoDate(new Date('2026-08-17'))).toBe('2026-08-17');
  });
});
