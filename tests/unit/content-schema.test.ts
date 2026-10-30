// 内容 schema 写法的通用安全回归：不依赖任何具体集合，裁剪模块后仍保留
// 各集合外链字段的协议白名单测在 <集合>-schema.test.ts（如 works-schema.test.ts），新集合有进 <a href> 的字段时照着补
import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';

describe('外链字段写法', () => {
  it('作为对照：不加 protocol 的 z.url() 会放行 javascript:（这正是要防的坑）', () => {
    expect(z.url().safeParse('javascript:alert(1)').success).toBe(true);
  });
});
