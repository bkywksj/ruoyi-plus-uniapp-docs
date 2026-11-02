// docs 模块的端到端用例（需要先 pnpm build）。🔴 模块测试各站共用、框架同步原样覆盖：页面从本站 sidebar.json / docs.json 现取，
// 不写死任何站的网址与文字；各站自己的页面核对（旧网址、标题后缀、FAQ 结构、下载卡）写在站点的 tests/e2e/site.spec.ts。
// 裁掉 docs 模块时整个文件随预设一起删除
import { readFileSync, statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { pagePathFor, readDocsConfig, readSiteMeta } from '../../scripts/lib/site-meta.mjs';

const meta = readSiteMeta(process.cwd());
const config = readDocsConfig(process.cwd());
const sidebar = JSON.parse(readFileSync('src/data/sidebar.json', 'utf8')) as Record<string, { text: string; id?: string; items?: unknown[] }[]>;
type Item = { text: string; id?: string; items?: Item[] };
/** 侧栏里的页面（按侧栏顺序，含所在分组路径），只取属于某个栏目的 */
const leaves: { id: string; text: string; trail: string[] }[] = [];
const walk = (items: Item[], trail: string[]) => {
  for (const it of items) {
    if (it.id && !it.items && config.sections.some((s: { id: string }) => it.id!.startsWith(`${s.id}/`))) leaves.push({ id: it.id, text: it.text, trail });
    if (it.items) walk(it.items, [...trail, it.text]);
  }
};
for (const items of Object.values(sidebar)) walk(items as Item[], []);
const url = (id: string) => pagePathFor(`/${id}`, meta.urlFormat);
const sizeOf = (id: string) => statSync(`src/content/docs/${id}.md`).size;
/** 页面标题（frontmatter title）：面包屑最后一段显示它，不是侧栏里的文字（officia 侧栏用简称） */
const titleOf = (id: string) => JSON.parse(/^title:\s*(".*")\s*$/m.exec(readFileSync(`src/content/docs/${id}.md`, 'utf8'))![1]) as string;
// 正文最长的一篇：用来验证滚动（短页面滚不动）
/** 普通文档页（不含栏目首页 x/index：开了 sectionHero 的站在那里用首屏大图代替面包屑，ruoyi.plus 侧栏第一项就是它） */
const pages = leaves.filter((l) => !l.id.endsWith("/index"));
const longest = [...pages].sort((a, b) => sizeOf(b.id) - sizeOf(a.id))[0];
// 侧栏第二篇：前后都有邻居（侧栏只有一篇时没有上下篇可测）
const middle = leaves[1];

test('文档页：标题、面包屑、最后更新、TechArticle', async ({ page }) => {
  const doc = pages[0];
  await page.goto(url(doc.id));
  await expect(page.locator('h1').first()).toBeVisible();
  const section = config.sections.find((s: { id: string }) => doc.id.startsWith(`${s.id}/`));
  await expect(page.locator('nav[aria-label="所在位置"]')).toContainText(section.label);
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
  const article = jsonLd.find((d) => d['@type'] === 'TechArticle');
  expect(article?.about).toEqual(config.article.about);
  if (config.lastUpdated !== 'off') {
    await expect(page.locator('[data-last-updated]')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    expect(article?.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
});

test('文档页：上一篇 / 下一篇按侧栏顺序', async ({ page }) => {
  test.skip(!middle, '侧栏只有一篇');
  await page.goto(url(middle.id));
  await expect(page.locator('a[rel="prev"]')).toContainText(leaves[0].text);
});

// 文档页统一方案（2026-11-02，五个站一致）：面包屑在正文标题上方随正文滚动；侧栏吸顶位置 = 起始位置，滚动时一动不动。
// 反证（知识库站与框架都做过）：把 DocsLayout 侧栏的 top-[calc(4rem+1px+2.5rem)] 改回 top-20，读数出现两种，这条变红
test('文档页：面包屑在正文里，滚动时侧栏与目录不跟着动', async ({ page, isMobile }) => {
  test.skip(isMobile, '窄屏没有吸顶侧栏');
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(url(longest.id));
  const crumb = page.locator('nav[aria-label="所在位置"]');
  await expect(crumb).toContainText(titleOf(longest.id));
  // 面包屑与正文同列（在正文列的左边线上），不是页头下方的整条横带
  const crumbBox = (await crumb.boundingBox())!;
  const articleBox = (await page.locator('article').boundingBox())!;
  expect(Math.abs(crumbBox.x - articleBox.x)).toBeLessThan(2);
  // 页面要够长才能验证滚动：至少能往下滚 400
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeGreaterThan(400);
  const side = page.locator('aside .ry-sidebar').first();
  const tops: number[] = [];
  for (const y of [0, 10, 60, 400]) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    tops.push(Math.round((await side.boundingBox())!.y));
  }
  expect(new Set(tops).size).toBe(1);
  expect(await side.evaluate((el) => getComputedStyle(el).overscrollBehaviorY)).toBe('contain');
});

test('窄屏：侧栏收进「本栏目菜单」，当前页高亮', async ({ page, isMobile }) => {
  test.skip(!isMobile, '宽屏侧栏常驻');
  const doc = pages[0];
  await page.goto(url(doc.id));
  // 按 summary 的字定位外层菜单：侧栏里可折叠的子分组也是 <details>，按「含这几个字的 details」会连它们一起匹配（tauri-docs 实测 11 个）
  const summary = page.locator('summary', { hasText: '本栏目菜单' });
  const menu = summary.locator('xpath=..');
  await summary.click();
  await expect(menu.locator('a[aria-current="page"]')).toHaveText(doc.text);
});

test('站点地图：文档页在里面，lastmod 与分档按 docs.json', async ({ request }) => {
  test.skip(config.sitemapLastmod === 'off', '本站不写 lastmod');
  const xml = await (await request.get('/sitemap-0.xml')).text();
  const loc = `${meta.url}${url(leaves[0].id)}`;
  const entry = xml.split('<url>').find((u) => u.includes(`<loc>${loc}</loc>`)) ?? '';
  expect(entry, loc).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}/);
  expect(entry).toMatch(/<priority>[\d.]+<\/priority>/);
});
