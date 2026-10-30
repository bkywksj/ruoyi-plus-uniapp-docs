import { describe, expect, it } from 'vitest';
import { formatCount, formatDate, formatDuration } from '@/lib/format';

describe('formatDate', () => {
  it('按东八区输出 YYYY-MM-DD', () => {
    // UTC 16:30 已是东八区次日 00:30
    expect(formatDate(new Date('2026-09-24T16:30:00Z'))).toBe('2026-09-25');
  });
});

describe('formatCount', () => {
  it('万 / 亿 单位', () => {
    expect(formatCount(9999)).toBe('9999');
    expect(formatCount(12800)).toBe('1.3万');
    expect(formatCount(20000)).toBe('2万');
    expect(formatCount(150_000_000)).toBe('1.5亿');
  });
});

describe('formatDuration', () => {
  it('分秒与时分秒', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3723)).toBe('1:02:03');
    expect(formatDuration(-3)).toBe('0:00');
  });
});
