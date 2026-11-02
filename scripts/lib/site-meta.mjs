// docs 模块的 Node 脚本（build-llms / indexnow / 迁移脚本）读站点信息用：从 src/site.config.ts 取顶层的几个字面量，
// 并按 lib/seo.ts 的 pagePath 同一规则拼页面网址。
// 为什么不直接 import site.config.ts：这些脚本由 node 直接跑、不经 Vite，读不了 .ts；而另写一份域名正是孵化时漏改的来源
// （知识库上线后 IndexNow 仍是骨架带来的 ruoyi.plus 域名）。两边规则一致由 tests/unit/site-meta.test.ts 守着
import { readFileSync } from 'node:fs';

/**
 * 读 site.config.ts 顶层（两格缩进）的字符串字段
 * @param {string} root 站点根目录
 * @returns {{ url: string, name: string, urlFormat: 'directory' | 'file' | 'preserve', titleSuffix: string }}
 * @throws 找不到 url / urlFormat —— 配置写法变了就停下，别拿空值去拼地址
 */
export function readSiteMeta(root) {
  const src = readFileSync(`${root}/src/site.config.ts`, 'utf8');
  const field = (name) => new RegExp(`^ {2}${name}:\\s*'([^']*)'`, 'm').exec(src)?.[1];
  const url = field('url');
  const urlFormat = field('urlFormat');
  if (!url || !urlFormat) throw new Error('[site-meta] src/site.config.ts 里找不到顶层的 url / urlFormat（应写成两格缩进的 url: \'…\'）');
  return { url: url.replace(/\/+$/, ''), name: field('name') ?? '', urlFormat, titleSuffix: field('titleSuffix') ?? '' };
}

/**
 * 站内页面路径，与 lib/seo.ts 的 pagePath 同一规则：directory → /a/b/，file → /a/b.html，preserve → 目录首页 /a/、其余 /a/b.html
 * @param {string} path 不带格式的页面路径，如 /guide/quick-start；以 / 或 /index 结尾的是目录首页
 * @param {'directory' | 'file' | 'preserve'} format
 */
export function pagePathFor(path, format) {
  const dirIndex = /(\/|\/index(\.html)?)$/.test(path);
  const clean = path
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/+$/, '');
  if (clean === '') return '/';
  if (format === 'preserve') return dirIndex ? `${clean}/` : `${clean}.html`;
  return format === 'file' ? `${clean}.html` : `${clean}/`;
}

/**
 * 文档 id → 绝对网址（与 lib/docs.ts 的 docPath 同一规则）
 * @param {{ url: string, urlFormat: 'directory' | 'file' | 'preserve' }} meta readSiteMeta 的结果
 * @param {string} id 文档 id（guide/ipc、backend/index；站点首页 index）
 */
export function docUrl(meta, id) {
  return meta.url + (id === 'index' ? '/' : pagePathFor(`/${id}`, meta.urlFormat));
}

/** 读 src/data/docs.json（docs 模块配置） */
export function readDocsConfig(root) {
  return JSON.parse(readFileSync(`${root}/src/data/docs.json`, 'utf8'));
}
