// 全局类型声明：第三方统计脚本注入到 window 上的对象
// 只在生产构建注入（见 Analytics.astro），所以调用处一律可选链：window.umami?.track(...)

interface UmamiTracker {
  track(event?: string, data?: Record<string, string | number | boolean>): void;
}

interface Window {
  /** Umami：site.config.analytics.provider = 'umami' 时存在 */
  umami?: UmamiTracker;
  /** 百度统计：site.config.analytics.provider = 'baidu' 时存在，事件用 _hmt.push(['_trackEvent', ...]) */
  _hmt?: unknown[];
}
