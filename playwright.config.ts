// E2E 回归（可选）：首次使用先 pnpm exec playwright install chromium
// 日常开发的界面验收优先用智码内置浏览器截图比对（见 e2e-test 技能），这里是给 CI / 批量回归用的脚本化版本。
import { defineConfig, devices } from '@playwright/test';

// 默认 4329（CLAUDE.md 端口约定）；派生站之间会撞端口，可用 E2E_PORT 换一个，tests/e2e/global-setup.ts 会核对端口上确实是本站
const PORT = Number(process.env.E2E_PORT ?? 4329);
// channel: 'chromium' = 用完整版 Chromium 跑新版 headless，不依赖单独的 chrome-headless-shell。
// 国内网络下 headless shell 经常下载失败（实测），完整版 Chromium 已能满足全部用例。
const browser = { channel: 'chromium' } as const;

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...browser } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...browser } },
  ],
  webServer: {
    command: `pnpm preview --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
