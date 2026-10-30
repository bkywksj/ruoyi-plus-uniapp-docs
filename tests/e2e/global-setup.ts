// E2E 前置校验：确认端口上跑的就是本项目刚构建的站，不是别的项目、也不是旧产物
// 为什么需要：所有派生站共用 preview 端口约定 4329，配置里 reuseExistingServer 为真，
// 端口被别的站占着时 Playwright 会直接复用它，用例对着别人的页面逐条失败，报错只说「找不到元素」（aibid-docs 2026-10-30 实录）。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FullConfig } from '@playwright/test';

/**
 * 取首页 HTML 与本地 dist/index.html 比对；astro preview 原样返回 dist，二者应逐字相同。
 * @param config Playwright 配置，取第一个 project 的 baseURL
 * @returns 一致时返回；不一致或拿不到首页时抛错，整批用例不再运行
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) throw new Error('playwright.config.ts 没有配置 baseURL');

  let local: string;
  try {
    local = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');
  } catch {
    throw new Error('没有 dist/index.html：先 pnpm build 再跑 e2e');
  }

  const served = await fetch(baseURL).then((r) => r.text());
  if (served !== local) {
    const title = served.match(/<title>([^<]*)/)?.[1] ?? '（无标题）';
    throw new Error(
      `${baseURL} 上跑的不是本项目刚构建的站（对方标题：${title}）。` +
        '可能是别的项目的 preview 占着端口，或本项目的 preview 还在用旧产物。' +
        '换端口跑：E2E_PORT=4339 pnpm test:e2e；或停掉占用端口的服务后重跑。',
    );
  }
}
