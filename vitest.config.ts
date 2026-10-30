/// <reference types="vitest/config" />
// 单元测试配置：复用 Astro 的 Vite 配置（路径别名 @/ 等），只跑 tests/unit
// 上面的三斜杠引用让 getViteConfig 认识 `test` 字段，否则 astro check 报 ts(2353)
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
