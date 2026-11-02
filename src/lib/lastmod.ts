// docs 模块：页面最后更新日期，sitemap lastmod 用（astro.config 的 serialize 里调，那里拿不到 astro:content，只能直接读文件）。
// 来源：docs 集合每篇 frontmatter 的 lastUpdated（schema 见 src/lib/docs-schema.ts），独立页面登记在 src/data/page-dates.json。
// 严格程度看 docs.json 的 sitemapLastmod：strict = 缺一个日期构建失败；known = 有就写；off = 不收集。
// 文档页底部「最后更新」与 TechArticle.dateModified 走 astro:content 的同一个字段，三处同源。
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 从一篇 Markdown 的 frontmatter 里取 lastUpdated。
 * @returns YYYY-MM-DD；没有 frontmatter、没有该字段或格式不对返回 undefined（调用方据此报错，不猜日期）
 */
export function frontmatterDate(source: string): string | undefined {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1];
  const value = fm && /^lastUpdated:\s*["']?([^"'\s]+)["']?\s*$/m.exec(fm)?.[1];
  return value && DATE.test(value) ? value : undefined;
}

/**
 * 全站页面 id → 最后更新日期（id 与网址一一对应：modules/words ↔ /modules/words.html，首页是 index）。
 * @param root 站点根目录（构建时传 process.cwd()）
 * @param mode docs.json 的 sitemapLastmod：strict 时缺日期抛错，known 时跳过，off 时返回空表
 * @throws strict 下有文档缺日期、独立页没登记；任何模式下 page-dates.json 里日期格式不对 —— 让构建失败，而不是 sitemap 里悄悄少一项
 */
export function collectLastmod(root: string, mode: 'strict' | 'known' | 'off' = 'strict'): Record<string, string> {
  const dates: Record<string, string> = {};
  if (mode === 'off') return dates;
  const base = join(root, 'src/content/docs');
  for (const rel of readdirSync(base, { recursive: true }) as string[]) {
    if (!rel.endsWith('.md')) continue;
    const id = rel.replace(/\\/g, '/').replace(/\.md$/, '');
    const date = frontmatterDate(readFileSync(join(base, rel), 'utf8'));
    if (date) dates[id] = date;
    else if (mode === 'strict') throw new Error(`[lastmod] ${id}.md 缺少 lastUpdated（写成 lastUpdated: YYYY-MM-DD）`);
  }
  const datesFile = join(root, 'src/data/page-dates.json');
  const pages = (existsSync(datesFile) ? JSON.parse(readFileSync(datesFile, 'utf8')).pages : {}) as Record<string, string>;
  for (const [id, date] of Object.entries(pages)) {
    if (!DATE.test(date)) throw new Error(`[lastmod] page-dates.json 里 ${id} 的日期不是 YYYY-MM-DD：${date}`);
    dates[id] = date;
  }
  // 独立页面必须都登记了日期。🔴 这道检查必须在这里（加载 astro.config 时）做：
  // 放进 sitemap 的 serialize 里抛错没用 —— @astrojs/sitemap 会吞掉，只打一行 ERROR、构建照样成功，整份 sitemap 却没生成（2026-11-02 反证实测）
  for (const id of mode === 'strict' ? staticPageIds(root) : []) {
    if (!dates[id]) throw new Error(`[lastmod] src/pages/${id}.astro 没有登记最后更新日期：加到 src/data/page-dates.json`);
  }
  return dates;
}

/**
 * src/pages 下会进 sitemap 的独立页面 id：.astro 文件，去掉动态路由（[...slug]，那是 docs 集合）与 404。
 * 端点（robots.txt.ts、sitemap.xml.ts）不是页面，不算
 */
export function staticPageIds(root: string): string[] {
  const base = join(root, 'src/pages');
  return (readdirSync(base, { recursive: true }) as string[])
    .map((rel) => rel.replace(/\\/g, '/'))
    .filter((rel) => rel.endsWith('.astro') && !rel.includes('[') && !/(^|\/)404\.astro$/.test(rel))
    .map((rel) => rel.replace(/\.astro$/, '').replace(/(^|\/)index$/, '$1') || 'index')
    .map((id) => id.replace(/\/$/, ''));
}

/** 网址路径 → 页面 id：/ → index，/modules/words.html → modules/words，/a/ → a */
export function pageIdOf(pathname: string): string {
  return decodeURIComponent(pathname).replace(/^\//, '').replace(/(\.html|\/)$/, '') || 'index';
}

/** Date → YYYY-MM-DD。frontmatter 的日期被解析成 UTC 零点，按 UTC 取，避免在东八区以西的机器上差一天 */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
