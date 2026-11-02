// 迁移文档页的 e2e：旧网址形态、多层侧栏高亮、手机实时预览、上一页 / 下一页、状态标记与图标、站内搜索
import { expect, test } from '@playwright/test';

test('旧网址形态：分区首页是 /backend/，普通页是 .html，canonical 与网址一致', async ({ page }) => {
  await page.goto('/backend/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ruoyi.plus/backend/');
  await page.goto('/backend/common/pay.html');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ruoyi.plus/backend/common/pay.html');
  await expect(page.locator('article h1')).toHaveText('支付模块 (pay)');
});

test('多层侧栏：当前页高亮，所在分组展开', async ({ page, isMobile }) => {
  test.skip(isMobile, '窄屏侧栏收在「菜单」里，宽屏验证即可');
  await page.goto('/backend/common/encrypt/api-encryption.html');
  const current = page.locator('aside a[aria-current="page"]');
  await expect(current).toHaveText('API接口加密');
  await expect(current).toBeVisible();
});

test('移动端组件页：右侧手机实时预览指向 uni.ruoyi.plus，可收起', async ({ page, isMobile }) => {
  test.skip(isMobile, '预览面板只在宽屏显示');
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/mobile/wd/layout/grid.html');
  const frame = page.locator('iframe[title="移动端实时预览"]');
  await expect(frame).toHaveAttribute('src', 'https://uni.ruoyi.plus/demo/pages-sub/layout/grid');
  await page.locator('details[data-migrate-ignore] > summary').click();
  await expect(frame).toBeHidden();
});

test('上一页 / 下一页按侧栏顺序', async ({ page }) => {
  await page.goto('/backend/getting-started.html');
  await expect(page.locator('a[rel="prev"]')).toContainText('项目简介');
  await expect(page.locator('a[rel="next"]')).toContainText('项目结构');
});

test('状态标记与图标渲染成 SVG，正文里没有残留的组件标签', async ({ page }) => {
  await page.goto('/practices/backend/controller-layer.html');
  expect(await page.locator('article svg.imark-ok').count()).toBeGreaterThan(0);
  const html = await page.locator('article').innerHTML();
  expect(html.length).toBeGreaterThan(1000);
  expect(html).not.toMatch(/<(ok|no|warn|icon)\b/i);
  expect(html).not.toContain(':::');
});
