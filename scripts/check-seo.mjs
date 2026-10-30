#!/usr/bin/env node
// 构建后 SEO / GEO 校验：pnpm check:seo（先 pnpm build）
// 专抓「构建成功、字段写了、值全错」的静默失败：
//   canonical 全站指向首页、og:url 出现两个、全站共用 description、JSON-LD 解析失败、图片缺 alt、
//   robots 没放行 AI 爬虫、llms.txt / sitemap 缺失、VideoObject 标在不能直接播放的页面上、
//   og:image 指向本站却没有这个文件、页面用了 Pagefind 站内搜索却没生成索引、sitemap 里的地址不是任何一页的 canonical。
// 任一 error → 退出码 1；warning 只提示不阻断。
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'node-html-parser';

const DIST = join(process.cwd(), 'dist');
// 与 robots.txt.ts 读同一份名单（src/lib/seo.ts 的 AI_CRAWLERS 也来自这里），改名单与策略只改 JSON
// 每项：{ name, purpose: search|user|training, allow }
const REQUIRED_CRAWLERS = JSON.parse(
  readFileSync(join(process.cwd(), 'src', 'data', 'ai-crawlers.json'), 'utf8'),
);

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

if (!existsSync(DIST)) {
  console.error('❌ 没有 dist/ 目录，请先运行 pnpm build');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// 只校验真正的页面：站长平台验证文件（public/google<id>.html，全文就一行 google-site-verification: …）
// 也以 .html 结尾，当成页面会报缺 canonical / og / h1 —— 上传过 Google 验证文件的站都会撞上
const htmlFiles = walk(DIST)
  .filter((file) => file.endsWith('.html'))
  .filter((file) => /<html[\s>]/i.test(readFileSync(file, 'utf8')));

// 由文件路径推出页面应有的 URL 路径：dist/works/a/index.html → /works/a/
function expectedPath(file) {
  const rel = relative(DIST, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

// 站点根地址取首页的 canonical，避免在脚本里再维护一份域名
const homeFile = join(DIST, 'index.html');
const homeCanonical = existsSync(homeFile)
  ? parse(readFileSync(homeFile, 'utf8')).querySelector('link[rel="canonical"]')?.getAttribute('href')
  : undefined;
if (!homeCanonical) {
  console.error('❌ 首页缺少 canonical，无法确定站点地址');
  process.exit(1);
}
const siteUrl = homeCanonical.replace(/\/$/, '');
// RFC 2606 / 6761 保留的示例域名：example.com/.org/.net 及子域、.example/.test/.invalid/.localhost 顶级域、本机地址。
// 只认 example.com 时，孵化项目随手填的 videos.example.org 会零警告通过，上线后全站 canonical 都指向占位域名
const PLACEHOLDER_HOST =
  /(^|\.)example\.(com|org|net)$|\.(example|test|invalid|localhost)$|^localhost$|^127\./;
let siteHost = '';
try {
  siteHost = new URL(siteUrl).hostname;
} catch {
  // 解析失败时 canonical 本身就有问题，逐页检查会报出来
}
if (PLACEHOLDER_HOST.test(siteHost)) {
  warnings.push(`site.url 仍是占位域名 ${siteUrl}，上线前必须改 src/site.config.ts`);
}

const descriptions = new Map();
const titles = new Map();
// 站内链接 → 出现在哪些页面，最后统一核对目标是否真的构建出来了
const internalLinks = new Map();

/** 站内路径是否有对应产物：/a/ → dist/a/index.html；/x.txt → dist/x.txt */
function existsInDist(pathname) {
  const clean = decodeURIComponent(pathname.split(/[?#]/)[0]);
  if (clean.endsWith('/')) return existsSync(join(DIST, clean, 'index.html'));
  return existsSync(join(DIST, clean)) || existsSync(join(DIST, clean, 'index.html'));
}

// ISO 8601 时长（PT1M54S / P1DT2H）；单独的 P、PT 不合法
const ISO_DURATION = /^P(?!$)(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/;
// ISO 8601 日期或日期时间（2026-09-26 / 2026-09-26T06:23:16.000Z / …+08:00）
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * VideoObject 专项：Google 视频结构化数据的必填字段 + 「用户能在本页观看」前提。
 * 页面里必须有 src 与 embedUrl 相同的 <iframe>，或 src 与 contentUrl 相同的 <video> / <source>；
 * 「点击封面才插入播放器」的 facade 在静态 HTML 里没有这些元素，会在这里被拦下。
 */
function checkVideoObject(file, root, data, pageUrl) {
  const abs = (value) => {
    try {
      return new URL(value, pageUrl).href;
    } catch {
      return value;
    }
  };
  for (const field of ['name', 'thumbnailUrl', 'uploadDate']) {
    const value = data[field];
    if (!value || (Array.isArray(value) && value.length === 0))
      err(file, `VideoObject 缺少必填字段 ${field}`);
  }
  for (const url of [data.thumbnailUrl ?? []].flat()) {
    if (typeof url !== 'string' || !/^https?:\/\//.test(url))
      err(file, `VideoObject.thumbnailUrl 必须是绝对地址，实际 ${url}`);
  }
  // Date.parse 会放过「2026/09/26」这类非 ISO 写法，先卡格式再卡能否解析
  if (
    data.uploadDate &&
    (!ISO_DATE.test(String(data.uploadDate)) || Number.isNaN(Date.parse(data.uploadDate)))
  )
    err(file, `VideoObject.uploadDate 不是 ISO 8601 日期：${data.uploadDate}`);
  if (data.duration !== undefined && !ISO_DURATION.test(String(data.duration)))
    err(file, `VideoObject.duration 不是 ISO 8601 时长：${data.duration}`);
  // schema.org 允许 interactionStatistic 是单个对象或数组
  for (const counter of [data.interactionStatistic ?? []].flat()) {
    const count = counter?.userInteractionCount;
    if (!Number.isInteger(count) || count < 0) err(file, `VideoObject 播放量必须是非负整数，实际 ${count}`);
  }
  if (!data.embedUrl && !data.contentUrl) {
    err(file, 'VideoObject 需要 embedUrl 或 contentUrl（本页没有可播放的视频就不要标 VideoObject）');
    return;
  }
  const frames = root.querySelectorAll('iframe[src]').map((el) => abs(el.getAttribute('src')));
  const videos = root
    .querySelectorAll('video[src], video source[src]')
    .map((el) => abs(el.getAttribute('src')));
  const playable =
    (data.embedUrl && frames.includes(abs(data.embedUrl))) ||
    (data.contentUrl && videos.includes(abs(data.contentUrl)));
  if (!playable)
    err(
      file,
      '标了 VideoObject，但页面里没有 src 与 embedUrl / contentUrl 一致的 <iframe> / <video>（Google 要求本页可直接观看）',
    );
}

for (const file of htmlFiles) {
  const name = relative(DIST, file).split(sep).join('/');
  const root = parse(readFileSync(file, 'utf8'));
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  const noindex = /noindex/i.test(robots);

  // 收集站内链接（含 noindex 页面：404 页上的链接坏了一样影响用户）
  root.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href') ?? '';
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/_astro/')) return;
    const list = internalLinks.get(href) ?? new Set();
    list.add(name);
    internalLinks.set(href, list);
  });

  // astro.config 的 redirects 在静态构建里生成的跳转页（meta refresh + noindex + canonical 指向目标）不是真实页面：
  // 上面已收集它指向的链接（目标不存在照样报死链），页面级检查跳过，否则每个旧地址都报缺 lang / description
  if (root.querySelector('meta[http-equiv="refresh"]')) continue;

  if (!root.querySelector('html')?.getAttribute('lang')) err(name, '<html> 缺少 lang 属性');

  const title = root.querySelector('title')?.text.trim() ?? '';
  if (!title) err(name, '缺少 <title>');
  else if (Array.from(title).length > 60)
    warn(name, `标题 ${Array.from(title).length} 字，超过 60 字会在搜索结果里被截断`);

  const descTags = root.querySelectorAll('meta[name="description"]');
  if (descTags.length !== 1) err(name, `meta description 应恰好 1 个，实际 ${descTags.length} 个`);
  const description = descTags[0]?.getAttribute('content')?.trim() ?? '';
  if (!description) err(name, 'meta description 为空');
  else if (Array.from(description).length < 20)
    warn(name, `描述只有 ${Array.from(description).length} 字，过短`);

  // 404 等 noindex 页面不参与收录类检查
  if (noindex) continue;

  const canonicals = root.querySelectorAll('link[rel="canonical"]');
  if (canonicals.length !== 1) err(name, `canonical 应恰好 1 个，实际 ${canonicals.length} 个`);
  const canonical = canonicals[0]?.getAttribute('href') ?? '';
  const expected = `${siteUrl}${expectedPath(file)}`;
  if (canonical && canonical !== expected) err(name, `canonical 应为 ${expected}，实际 ${canonical}`);

  const ogUrls = root.querySelectorAll('meta[property="og:url"]');
  if (ogUrls.length !== 1) err(name, `og:url 应恰好 1 个，实际 ${ogUrls.length} 个`);
  else if (ogUrls[0].getAttribute('content') !== canonical) err(name, 'og:url 与 canonical 不一致');

  for (const prop of ['og:title', 'og:description', 'og:image']) {
    if (!root.querySelector(`meta[property="${prop}"]`)) err(name, `缺少 ${prop}`);
  }
  const ogImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
  if (ogImage && !/^https?:\/\//.test(ogImage)) err(name, `og:image 必须是绝对地址，实际 ${ogImage}`);
  // 指向本站的分享图必须真在产物里：写了地址、文件却没放，分享卡片就是一张裂图，所有检查都看不出来
  if (ogImage.startsWith(`${siteUrl}/`)) {
    const local = decodeURIComponent(new URL(ogImage).pathname);
    if (!existsSync(join(DIST, local))) err(name, `og:image 指向的 ${local} 不在 dist/ 里（文件放进 public/ 了吗）`);
  }

  const h1Count = root.querySelectorAll('h1').length;
  if (h1Count !== 1) err(name, `<h1> 应恰好 1 个，实际 ${h1Count} 个`);

  root.querySelectorAll('img').forEach((img) => {
    if (img.getAttribute('alt') === undefined) err(name, `图片缺少 alt 属性：${img.getAttribute('src')}`);
    if (!img.getAttribute('width') || !img.getAttribute('height')) {
      warn(name, `图片未声明 width/height（会造成布局偏移 CLS）：${img.getAttribute('src')}`);
    }
  });

  root.querySelectorAll('script[type="application/ld+json"]').forEach((node, index) => {
    let data;
    try {
      // rawText：script 内容不是 HTML，不能做实体解码（.text 会把 URL 里的 &para= 解成 ¶=）
      data = JSON.parse(node.rawText);
    } catch (error) {
      err(name, `第 ${index + 1} 段 JSON-LD 解析失败：${error.message}`);
      return;
    }
    if (!data || typeof data !== 'object') {
      err(name, `第 ${index + 1} 段 JSON-LD 不是对象：${JSON.stringify(data)}`);
      return;
    }
    // 顶层可以是单个对象、对象数组，或带 @graph 的对象（@context 写在外层），逐个节点检查
    const outerContext = Array.isArray(data) ? undefined : data['@context'];
    const nodes = Array.isArray(data) ? data : Array.isArray(data['@graph']) ? data['@graph'] : [data];
    for (const item of nodes) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        err(name, `第 ${index + 1} 段 JSON-LD 含非对象节点：${JSON.stringify(item)}`);
        continue;
      }
      if (!(item['@context'] ?? outerContext) || !item['@type'])
        err(name, `第 ${index + 1} 段 JSON-LD 缺少 @context 或 @type`);
      if ([item['@type']].flat().includes('VideoObject')) checkVideoObject(name, root, item, expected);
    }
  });

  if (description) {
    const list = descriptions.get(description) ?? [];
    list.push(name);
    descriptions.set(description, list);
  }
  if (title) {
    const list = titles.get(title) ?? [];
    list.push(name);
    titles.set(title, list);
  }
}

for (const [description, pages] of descriptions) {
  if (pages.length > 1)
    errors.push(`描述重复（${pages.length} 页共用）：「${description.slice(0, 30)}…」→ ${pages.join(', ')}`);
}
for (const [title, pages] of titles) {
  if (pages.length > 1) errors.push(`标题重复（${pages.length} 页共用）：「${title}」→ ${pages.join(', ')}`);
}

// 站内死链：列表页链到的详情页没构建出来，通常意味着 getStaticPaths 拿到了空数据
//（例如同一目录并行跑两个 astro build 把内容缓存搅乱），这种情况构建本身不会报错
for (const [href, pages] of internalLinks) {
  if (existsInDist(href)) continue;
  if (!href.endsWith('/') && !href.split('/').pop().includes('.')) {
    errors.push(`站内链接缺结尾斜杠：${href}（trailingSlash: always）← ${[...pages].slice(0, 3).join(', ')}`);
  } else {
    errors.push(
      `站内死链：${href} 没有对应页面 ← ${[...pages].slice(0, 3).join(', ')}${pages.size > 3 ? ' …' : ''}`,
    );
  }
}

// 站点级文件
const robotsFile = join(DIST, 'robots.txt');
if (!existsSync(robotsFile)) {
  errors.push('缺少 robots.txt');
} else {
  const robots = readFileSync(robotsFile, 'utf8');
  if (!/^Sitemap:\s*https?:\/\//m.test(robots)) errors.push('robots.txt 缺少绝对地址的 Sitemap 行');

  // 按分组解析：User-agent 行开一个组，之后的 Allow / Disallow 归这个组
  const groups = new Map();
  let currentAgents = [];
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (/^user-agent$/i.test(key)) {
      currentAgents = lastWasAgent ? [...currentAgents, value] : [value];
      currentAgents.forEach((agent) => groups.set(agent, groups.get(agent) ?? []));
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (/^(allow|disallow)$/i.test(key)) {
        currentAgents.forEach((agent) => groups.get(agent).push(`${key.toLowerCase()}:${value}`));
      }
    }
  }

  // 名单里每个爬虫都必须有显式分组，且指令与 allow 字段一致（改了 JSON 却没重新构建也能抓出来）
  for (const crawler of REQUIRED_CRAWLERS) {
    const rules = groups.get(crawler.name);
    const expected = crawler.allow ? 'allow:/' : 'disallow:/';
    if (!rules) errors.push(`robots.txt 没有 ${crawler.name} 的显式分组`);
    else if (!rules.includes(expected))
      errors.push(`robots.txt 中 ${crawler.name} 应为「${crawler.allow ? 'Allow' : 'Disallow'}: /」`);
  }
  // 只有通配组整站 Disallow 才是危险信号；针对个别爬虫（如训练类）的 Disallow 是有意为之
  if ((groups.get('*') ?? []).includes('disallow:/')) {
    warnings.push('robots.txt 的「User-agent: *」组整站 Disallow，确认不是误把全站屏蔽');
  }
}

if (!existsSync(join(DIST, 'sitemap-index.xml'))) errors.push('缺少 sitemap-index.xml');

// sitemap 每条地址都必须是某一页的 canonical：两边对不上，搜索引擎拿到的是两套网址
// （file 网址形态下 @astrojs/sitemap 默认输出不带 .html 的地址，就是这样漏过去的）
const canonicals = new Set(
  htmlFiles
    .map((file) => parse(readFileSync(file, 'utf8')).querySelector('link[rel="canonical"]')?.getAttribute('href'))
    .filter(Boolean),
);
for (const file of walk(DIST).filter((f) => /sitemap-\d+\.xml$/.test(f))) {
  for (const [, loc] of readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!canonicals.has(loc)) errors.push(`sitemap 地址 ${loc} 不是任何页面的 canonical（${relative(DIST, file)}）`);
  }
}

const llmsFile = join(DIST, 'llms.txt');
if (!existsSync(llmsFile)) {
  errors.push('缺少 llms.txt');
} else if (!readFileSync(llmsFile, 'utf8').startsWith('# ')) {
  errors.push('llms.txt 必须以「# 站点名」开头');
}

// Pagefind：页面标了 data-pagefind-body 或脚本里引用了 /pagefind/，就必须有索引。
// 索引只在跑过 pagefind 的构建里存在；托管平台只跑 pnpm build，若索引放在别的脚本里，线上搜索整体 404 而本地一切正常
const usesPagefind = walk(DIST)
  .filter((file) => file.endsWith('.html') || file.endsWith('.js'))
  .filter((file) => !relative(DIST, file).split(sep).join('/').startsWith('pagefind/'))
  .find((file) => {
    const text = readFileSync(file, 'utf8');
    return text.includes('data-pagefind-body') || text.includes('/pagefind/');
  });
if (usesPagefind && !existsSync(join(DIST, 'pagefind', 'pagefind-entry.json'))) {
  errors.push(
    `${relative(DIST, usesPagefind)} 用了 Pagefind 站内搜索，但 dist/pagefind/ 没有索引：把 pagefind --site dist 并进 pnpm build（见 site-search 技能）`,
  );
}

console.log(`\nSEO/GEO 校验：${htmlFiles.length} 个页面`);
if (warnings.length) {
  console.log(`\n⚠️  警告 ${warnings.length} 条：`);
  warnings.forEach((line) => console.log(`  - ${line}`));
}
if (errors.length) {
  console.log(`\n❌ 错误 ${errors.length} 条：`);
  errors.forEach((line) => console.log(`  - ${line}`));
  process.exit(1);
}
console.log('\n✅ 全部通过');
