// 冒烟测试：与具体内容模块无关的全站基础行为（需要先 pnpm build）
// 各模块自己的用例放在同目录 <模块>.spec.ts，裁剪模块时只删模块自己的文件，本文件始终保留
import { expect, test } from '@playwright/test';

test('首页有且仅有一个 h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('深色模式切换并记住选择', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
  await page.getByRole('button', { name: '切换深色模式' }).click();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
  await page.reload();
  expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(!wasDark);
});

test('页头与页脚的品牌标志一致（配了 site.logo 两处都用图，没配两处都是圆点）', async ({ page }) => {
  await page.goto('/');
  const headerImg = await page.locator('header a[href="/"] img').count();
  const footerImg = await page.locator('footer p').first().locator('img').count();
  expect(footerImg).toBe(headerImg);
});
