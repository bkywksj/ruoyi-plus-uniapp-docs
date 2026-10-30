// SEO / GEO 纯函数工具：不依赖 Astro 运行时，方便单测（tests/unit/seo.test.ts）
import { site } from '@/site.config';
import aiCrawlers from '@/data/ai-crawlers.json';

/** 标题模板：页面标题 + 站名；首页直接用站名，避免「站名 | 站名」 */
export function buildTitle(title?: string): string {
  // 标题后缀默认是站名；迁移旧站时可用 site.titleSuffix 保住旧站已被收录的完整标题（站名本身仍用于页头 / 页脚 / og:site_name）
  const suffix = (site as { titleSuffix?: string }).titleSuffix || site.name;
  if (!title || title === site.name || title === suffix) return suffix;
  return `${title} | ${suffix}`;
}

/**
 * 站内页面地址：按 site.urlFormat 输出 /a/b/（directory）、/a/b.html（file），preserve 下目录首页 /a/、其余 /a/b.html。
 * 页面链接一律经它生成，不手写结尾斜杠或 .html —— 换网址形态时只改配置一处。
 * @param path 不带格式的页面路径，如 /guide/quick-start；传入已带 / 或 .html 的也会先归一。
 *   preserve 形态靠写法区分目录首页：以 / 或 /index 结尾的是目录首页（/backend/、/backend/index），其余是叶子页
 * @returns 首页恒为 /
 */
export function pagePath(path: string): string {
  const dirIndex = /(\/|\/index(\.html)?)$/.test(path);
  const clean = path
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/+$/, '');
  if (clean === '') return '/';
  if (site.urlFormat === 'preserve') return dirIndex ? `${clean}/` : `${clean}.html`;
  return site.urlFormat === 'file' ? `${clean}.html` : `${clean}/`;
}

/**
 * 当前页的规范路径：file 形态下 Astro 给首页的 Astro.url.pathname 是 /index.html（子目录首页同理 /a/index.html），
 * 原样当 canonical 会让首页规范地址变成 /index.html，而 sitemap、外链、搜索收录都是 /。
 * @param pathname Astro.url.pathname
 * @returns 去掉结尾 index.html 后的路径；其余原样
 */
export function canonicalPath(pathname: string): string {
  return pathname.replace(/(^|\/)index\.html$/, '$1') || '/';
}

/**
 * 把站内路径转成绝对 URL，并按 trailingSlash: 'always' 补齐结尾斜杠。
 * 带扩展名的路径（/llms.txt、/og.png、file 形态的 /a.html）不补斜杠。
 */
export function absoluteUrl(pathOrUrl: string, base: string = site.url): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const url = new URL(pathOrUrl, base.endsWith('/') ? base : `${base}/`);
  const lastSegment = url.pathname.split('/').pop() ?? '';
  if (!url.pathname.endsWith('/') && !lastSegment.includes('.')) {
    url.pathname = `${url.pathname}/`;
  }
  return url.toString();
}

/**
 * 按「字符数」截断描述：中文 1 字 = 1 字符，保证搜索结果摘要不被从中间截断成乱码。
 * 超长时在末尾补省略号。
 */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chars = Array.from(clean);
  if (chars.length <= max) return clean;
  return `${chars.slice(0, max - 1).join('')}…`;
}

/**
 * JSON-LD 序列化：必须转义 `<`，否则数据里出现 `</script>` 会提前闭合标签（XSS 与结构化数据全部失效）。
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export type JsonLd = Record<string, unknown>;

/** 爬虫用途：search = 检索与引用；user = 用户在 AI 里点名访问时临时抓取；training = 采集训练数据 */
export type CrawlerPurpose = 'search' | 'user' | 'training';

export interface CrawlerRule {
  name: string;
  purpose: CrawlerPurpose;
  /** true 输出 Allow: /，false 输出 Disallow: / */
  allow: boolean;
}

/**
 * robots.txt 里逐个显式声明的爬虫（搜索引擎 + AI 搜索 / 问答 / 训练）。
 * 名单放在 src/data/ai-crawlers.json：scripts/check-seo.mjs 是纯 Node 脚本、读不了 TS，
 * 两边读同一个 JSON，才不会出现「robots 改了、校验没改」。
 * 🔴 只想被 AI 检索引用、不想被拿去训练：把 purpose 为 training 的项改成 allow: false。
 *    只从名单里删掉是没用的——robots 第一段是 `User-agent: *` + `Allow: /`，删掉的爬虫照样被放行。
 */
export const AI_CRAWLERS: CrawlerRule[] = aiCrawlers as CrawlerRule[];

/** 全站通用：WebSite 结构化数据，只挂在首页 */
export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: absoluteUrl('/'),
    description: site.description,
    inLanguage: site.locale,
    publisher: { '@type': 'Person', name: site.author.name, url: site.author.url },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** 面包屑结构化数据：详情页、分类页必挂，帮助搜索结果显示层级路径 */
export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQPage 结构化数据：只放页面上真实可见的问答，不可见内容标 FAQ 属于违规 */
export function faqJsonLd(items: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * 秒 → ISO 8601 时长（PT1H2M3S），用于 VideoObject.duration。
 * @param totalSeconds 时长秒数（works.metrics.duration）
 * @returns 非有限数（NaN / Infinity）或负数返回 undefined（调用方据此不输出 duration）；小数向下取整；0 → PT0S
 */
export function isoDuration(totalSeconds: number): string | undefined {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return undefined;
  const seconds = Math.floor(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}

export interface VideoJsonLdInput {
  /** 缩略图：站内路径或绝对地址（resolveCover 的结果即可），输出时转绝对地址 */
  thumbnail: string;
  uploadDate: Date;
  /** 播放器地址，必须与本页 iframe 的 src 完全相同 */
  embedUrl?: string;
  /** 视频文件直链（有才填） */
  contentUrl?: string;
  /** 时长（秒） */
  durationSeconds?: number;
  /** 播放次数：只接受非负整数，其余值不输出 interactionStatistic */
  views?: number;
}

/**
 * 把详情页的 CreativeWork 升级为 VideoObject：保留 base 的全部字段（keywords / author / sameAs…），只改 @type 并补视频字段。
 * 用「合并」而不是新建对象，是因为 VideoObject 本身就是 CreativeWork 的子类型，另起一个会丢掉已有字段。
 * 🔴 只在本页嵌了可直接播放的播放器时调用（Google：VideoObject 必须放在用户能观看该视频的页面）；
 *    embedUrl 与 contentUrl 都没有时直接抛错，让构建失败，而不是输出违规标记。
 * @param base  详情页原有的 CreativeWork 对象（需含 name、description）
 * @param input 视频字段，见 VideoJsonLdInput
 * @returns 值为 undefined 的键在 JSON.stringify 时自动省略，不会输出空字段
 */
export function videoJsonLd(base: JsonLd, input: VideoJsonLdInput): JsonLd {
  if (!input.embedUrl && !input.contentUrl) {
    throw new Error('videoJsonLd：embedUrl 与 contentUrl 至少一个；本页没有可播放的视频就不要标 VideoObject');
  }
  const views =
    typeof input.views === 'number' && Number.isInteger(input.views) && input.views >= 0
      ? input.views
      : undefined;
  return {
    ...base,
    '@type': 'VideoObject',
    thumbnailUrl: [absoluteUrl(input.thumbnail)],
    // toISOString 带 Z（UTC），满足 Google「uploadDate 建议带时区」
    uploadDate: input.uploadDate.toISOString(),
    duration: input.durationSeconds === undefined ? undefined : isoDuration(input.durationSeconds),
    embedUrl: input.embedUrl,
    contentUrl: input.contentUrl,
    interactionStatistic:
      views === undefined
        ? undefined
        : {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'WatchAction' },
            userInteractionCount: views,
          },
  };
}

/** 文章结构化数据 */
export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    image: input.image ? absoluteUrl(input.image) : undefined,
    author: { '@type': 'Person', name: site.author.name, url: site.author.url },
    inLanguage: site.locale,
  };
}
