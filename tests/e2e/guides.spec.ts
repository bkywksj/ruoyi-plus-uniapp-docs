// 使用指南模块的端到端用例（需要先 pnpm build，搜索依赖 build 里生成的 Pagefind 索引）
// 裁掉 guides 模块时整个文件随预设一起删除
import { expect, test } from '@playwright/test';

test('指南首页按分组列出篇目', async ({ page }) => {
  await page.goto('/guide/');
  await expect(page.locator('h1')).toHaveText('使用指南');
  await expect(page.getByRole('link', { name: /快速开始/ }).first()).toBeVisible();
});

test('详情页：侧栏高亮当前篇、本页内容、下一篇', async ({ page, isMobile }) => {
  await page.goto('/guide/quick-start/');
  // 侧栏渲染了两份（宽屏左栏 + 窄屏 details），按视口取看得见的那份
  const nav = isMobile ? page.locator('[data-guide-mobile-nav]') : page.locator('aside').first();
  if (isMobile) await nav.locator('summary').click();
  await expect(nav.locator('a[aria-current="page"]', { hasText: '快速开始' })).toBeVisible();
  // 步骤编号由 CSS 计数器画出：<Steps> 里的二级标题都应进入时间轴
  await expect(page.locator('.guide-steps > h2')).toHaveCount(4);
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(/\/guide\/troubleshooting\/$/);
  await expect(page.locator('a[rel="prev"]')).toContainText('快速开始');
});

test('桌面端显示「本页内容」目录', async ({ page, isMobile }) => {
  test.skip(isMobile, '窄屏不显示右侧目录');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/guide/quick-start/');
  const toc = page.getByRole('navigation', { name: '本页内容' });
  await expect(toc.getByRole('link', { name: '孵化新站点' })).toHaveAttribute('href', /^#/);
});

test('Ctrl K 搜索能搜到篇目和篇内小节', async ({ page }) => {
  await page.goto('/guide/');
  await page.keyboard.press('Control+k');
  const input = page.locator('#site-search-input');
  await expect(input).toBeVisible();
  await input.fill('端口');
  const results = page.locator('#site-search-results a');
  await expect(results.filter({ hasText: '常见问题排查' }).first()).toBeVisible();
  // 有带锚点的小节级结果，点开直接定位到那一节
  await expect(page.locator('#site-search-results a[href*="#"]').first()).toBeVisible();
});
