// docs 模块的站点配置（src/data/docs.json）的类型与读取：站点相关的值只在那份 JSON 里，模块代码在各站逐字节相同。
// JSON 而不是 .ts：scripts/ 下的 build-llms / indexnow 是纯 Node 脚本，读不了 .ts；两边读同一份，不会各写一份再漂移
import raw from '../data/docs.json';

/** 一个栏目 = 页面 id 的第一段（guide/getting-started 属于 guide） */
export interface DocsSection {
  /** 页面 id 的第一段，也是网址第一段 */
  id: string;
  /** 中文名：面包屑、404 页栏目直达、栏目首页首屏用 */
  label: string;
  /**
   * 面包屑上栏目名点过去的地方：
   * - 文档 id（guide/getting-started）= 该栏目第一篇；
   * - 以 / 开头的站内路径（/features）= 独立栏目页（按 site.urlFormat 补 .html 或结尾斜杠）；
   * - 省略 = 栏目首页 <id>/index（旧站有 /backend/ 这类目录首页时）
   */
  home?: string;
}

/** 站点地图的一档：命中 paths（整条相等）或 prefixes（前缀）的地址用这一档 */
export interface SitemapRule {
  paths?: string[];
  prefixes?: string[];
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** 为什么给这一档（只给人看） */
  why?: string;
}

export interface DocsConfig {
  sections: DocsSection[];
  /**
   * 由独立 .astro 页面渲染的文档 id（正文仍在 docs 集合里，页面用 getEntry 取来嵌进去），统一路由 [...slug] 跳过它们，
   * 否则两条路由抢同一个网址。站点首页 index 与栏目首页 x/index 无论登没登记都跳过
   */
  standalonePages: string[];
  /**
   * 文档的最后更新日期（frontmatter lastUpdated）：
   * - required：每篇必填；页底显示「最后更新」、进 TechArticle.dateModified 与 sitemap lastmod（三处同源）
   * - optional：写了就用，没写不显示
   * - off：不显示、不进结构化数据（旧站没有这一行时）
   */
  lastUpdated: 'required' | 'optional' | 'off';
  /**
   * sitemap 的 lastmod：
   * - strict：每个网址都必须有日期（文档 frontmatter + src/data/page-dates.json 登记的独立页），缺一个构建失败；
   * - known：有日期的写上，没有的不写；
   * - off：不写
   */
  sitemapLastmod: 'strict' | 'known' | 'off';
  /** 每页 TechArticle 的固定字段（照旧站 transformPageData，帮 AI 把页面关联到产品）；author 为 null 时用 site.author */
  article: {
    about: string[];
    author: Record<string, unknown> | null;
    publisher: Record<string, unknown> | null;
    proficiencyLevel: string;
  };
  /** 「在 GitHub 上编辑此页面」链接模板，{id} 换成页面 id；留空不显示 */
  editUrl: string;
  /** 常见问题页的文档 id：这一页额外输出 FAQPage 结构化数据（问答取 src/lib/site-jsonld.ts 的 faqJsonLd）；留空没有 */
  faqPage: string;
  /** 栏目首页（x/index）正文上方加首屏大图：需要项目自己提供 src/components/docs/SectionHero.astro */
  sectionHero: boolean;
  /** 移动端演示站域名：正文里指向它的链接改指本站手机外框预览页（src/lib/preview.mjs）；没有演示站留空 */
  previewHosts: string[];
  /** 站点地图分档；null = 不写 priority / changefreq（旧站 sitemap 里本来就没有时，如 ruoyi.plus） */
  sitemap: { rules: SitemapRule[]; fallback: Omit<SitemapRule, 'paths' | 'prefixes' | 'why'> } | null;
  /** IndexNow：key 对应 public/<key>.txt（随站点发布，搜索引擎回读它校验归属）；alwaysPush 是每次都推的站内路径 */
  indexnow: { key: string; alwaysPush: string[] };
  /** llms.txt 里侧栏之外的页面（独立 .astro 页、不在侧栏里的文档）；brief 省略时取 id 那篇的 description */
  llms: {
    extraPages: { text: string; path?: string; id?: string; brief?: string; line?: string }[];
    /** 侧栏外页面那一节的小标题；空字符串 = 不出小标题，直接接在最后一组后面 */
    extraHeading?: string;
    /** 每栏目一棵侧栏时各节标题（栏目 id → 标题），不写用栏目名 */
    sectionTitles?: Record<string, string>;
    /** top（默认）：子分组的页面并进顶层分组；nested：每个直接含页面的分组各成一节 */
    groups?: 'top' | 'nested';
  };
}

/** 当前站点的 docs 配置 */
export const docsConfig = raw as unknown as DocsConfig;
