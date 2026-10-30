// E2E 公共工具：各模块的 spec 共用，不属于任何可裁剪模块
import type { Page } from '@playwright/test';

/**
 * 等页面上的 island 水合完成：Astro 水合后会移除 astro-island 的 ssr 属性。
 * astro-island 是 display: contents，永远不「可见」，只能等 attached。
 * @param page 当前页面
 * @returns 第一个 island 水合完成后 resolve；页面上没有 island 时会一直等到超时，所以只在有 island 的页面调用
 */
export async function waitForHydration(page: Page) {
  await page.locator('astro-island:not([ssr])').first().waitFor({ state: 'attached' });
}
