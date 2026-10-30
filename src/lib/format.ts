// 展示层格式化工具：日期、数字、时长，统一东八区与中文习惯

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Shanghai',
});

/** 2026-09-25 形式的日期（用于列表、详情页可见文本） */
export function formatDate(date: Date): string {
  return dateFormatter.format(date).replace(/\//g, '-');
}

/** 机器可读日期：<time datetime> 用 */
export function isoDate(date: Date): string {
  return date.toISOString();
}

/** 1.2万 / 3456 形式的数字，适合播放量、点赞数等 */
export function formatCount(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1).replace(/\.0$/, '')}亿`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1).replace(/\.0$/, '')}万`;
  return String(value);
}

/** 秒数 → 12:34 或 1:02:03，用于视频/音频时长角标 */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
