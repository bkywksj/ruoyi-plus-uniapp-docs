// 渲染默认分享图：design/og/og-default.html → public/og-default.png（1200×630）
// 用法：pnpm og [--src <html>] [--out <png>]
// 用 e2e 已安装的 Playwright Chromium 截图：跨平台、不引新依赖、不依赖本机装了哪种浏览器。
// 首次使用先 pnpm exec playwright install chromium（与 e2e 同一份）。
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

/**
 * 读命令行参数 --name value。
 * @param name 参数名（不含 --）
 * @param fallback 没传时的默认值
 * @returns 参数值
 */
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const src = resolve(arg('src', 'design/og/og-default.html'));
const out = resolve(arg('out', 'public/og-default.png'));

// channel: 'chromium' 与 playwright.config.ts 一致：用完整版 Chromium，国内网络下 headless shell 常下载失败
const browser = await chromium.launch({ channel: 'chromium' });
try {
  // deviceScaleFactor 固定 1：分享平台按 1200×630 取图，2 倍图只会被缩回去还白占体积
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(src).href);
  // 等字体就绪再截，否则中文可能先用回退字体渲染、截出来字形不对
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
} finally {
  await browser.close();
}
console.log(`已生成 ${out}（${statSync(out).size} 字节）`);
