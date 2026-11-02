// 站点全局配置 —— 单一真相源
// project-init 孵化新项目时只改这一个文件；canonical / sitemap / robots / llms.txt / 品牌色全部从这里取，
// 所以不要在页面或组件里再硬编码域名、站名、主色。
// 🔴 本文件被 astro.config.ts 引用，而 Astro 不会把 .env 加载进配置文件的执行环境：
//    这里不要读 import.meta.env，需要按环境切换的值见 env-config 技能（loadEnv / 系统环境变量）。

export type AnalyticsProvider = 'none' | 'umami' | 'baidu';

/**
 * 网址形态：
 * - directory = /guide/a/（框架默认）
 * - file      = /guide/a.html；目录首页也折成 /guide.html（保住旧站已收录的 .html 网址，旧站没有目录首页时用）
 * - preserve  = 叶子页 /guide/a.html、目录首页 /guide/（产物 guide/index.html）——与 VitePress cleanUrls: false 的产物一模一样，
 *               旧站有 /backend/ 这类目录首页时必须用它，否则目录首页 404
 */
export type UrlFormat = 'directory' | 'file' | 'preserve';

/**
 * Markdown 兼容模式：none = Astro 默认处理器（Sätteri，快）；vitepress = 换成 unified 管线并装 VitePress 写法兼容插件
 * （::: 容器、<Ok/> 状态标记、<Icon>、.md 链接、VitePress 锚点规则，见 src/lib/markdown/vp-compat.mjs）。迁移 VitePress 站时开
 */
export type MarkdownCompat = 'none' | 'vitepress';

export interface NavItem {
  label: string;
  href: string;
  /**
   * 高亮前缀：一组页面共用一个导航项时填（如「功能」指向 /features/writing.html，match 写 /features/，整组都高亮）。
   * 省略时按 href 本身判断
   */
  match?: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export const site = {
  /** 站点全名：出现在 <title> 后缀、og:site_name、JSON-LD WebSite.name */
  name: 'RuoYi-Plus-UniApp 全栈开发文档',
  /** <title> 后缀（buildTitle 用）：旧站 VitePress 的 title，每页都是「页名 | 这一串」，首页就是这一串；搜索结果里已收录的就是它 */
  titleSuffix: 'RuoYi-Plus-UniApp 全栈开发文档 — Spring Boot 3 + Vue 3 企业级框架',
  /** 短名：页头 Logo 文字、移动端空间不够时使用 */
  shortName: 'Ruoyi-Plus-Uniapp',
  /** 一句话定位（首页 H1 下方 + 默认 meta description），写成「X 是 Y」的定义句对 GEO 更友好 */
  tagline:
    'RuoYi-Plus-UniApp 是基于 Spring Boot 3 + Vue 3 + UniApp 的企业级全栈快速开发框架，文档涵盖后端架构、前端组件、移动端开发、AI 集成、多租户与支付。',
  /** 默认 meta description：页面没传 description 时兜底，建议 70~160 字 */
  description:
    'RuoYi-Plus-UniApp 全栈开发文档 — 基于 Spring Boot 3 + Vue 3 + UniApp 的企业级快速开发框架，涵盖后端架构、前端组件、移动端开发、AI 集成、多租户、支付等完整指南。',
  /**
   * 生产域名（不带结尾斜杠）。canonical、og:url、sitemap、robots、llms.txt 的绝对地址都基于它。
   * 🔴 上线前必须改成真实域名，否则所有 canonical 都会指向 example.com。
   */
  url: 'https://ruoyi.plus',
  /**
   * 网址形态。astro.config 的 build.format / trailingSlash、lib/seo.ts 的 pagePath() 都读它，站内链接用 pagePath() 生成。
   * 🔴 上线后不要再改：改了等于全站换网址，旧链接与搜索收录全部失效（迁移旧站时按旧网址选，见 vitepress-migration 技能）
   */
  urlFormat: 'preserve' as UrlFormat,
  /** Markdown 兼容模式：本站正文是 VitePress 迁来的 511 篇 .md，开 vitepress（两种模式都关智能标点） */
  markdownCompat: 'vitepress' as MarkdownCompat,
  /** 文档正文代码块显示行号（旧站 markdown.lineNumbers: true）；行号用 CSS 画，不进复制内容 */
  codeLineNumbers: true,
  /**
   * 文档页右侧的手机实时预览（旧站 PreviewFrame：frontmatter iframe + url 的 84 页）：
   * origin = H5 演示站；qr = 扫码预览的二维码（旧站同一张 public/uni.png）
   */
  mobilePreview: { origin: 'https://uni.ruoyi.plus', qr: '/uni.png' },
  /** <html lang> 与 og:locale */
  locale: 'zh-CN',
  /** 品牌主色：注入为 CSS 变量 --brand，Tailwind 里用 bg-brand / text-brand */
  brandColor: '#0B6EF0',
  author: {
    name: '若依科技工作室',
    url: 'https://ruoyi.plus',
  },
  /** 页头标志图（放 public/ 下，正方形）；留空则用品牌色圆点。标志自带底色的直接用，不要再套背景 */
  logo: '/logo.png',
  /** 导航横排的断点：导航项多（6 个以上）时改 'lg'，否则平板宽度下会挤出页头 */
  navBreakpoint: 'lg' as 'md' | 'lg',
  /**
   * 站点图标（放 public/ 下）：svg / png / ico 都行，BaseLayout 按扩展名输出 type。
   * 用旧站同一个 favicon.ico（若依立方体，16–256 六帧，由 logo.png 上方的立方体裁出）；
   * 孵化时这里是框架默认的 favicon.svg（橙色 N），线上标签页一直显示它，2026-11-02 改回
   */
  favicon: '/favicon.ico',
  /** 默认分享图（放 public/ 下），1200×630 */
  ogImage: '/og-default.png',
  /**
   * 允许构建期下载并优化的远程图片域名（astro:assets image.domains）。
   * 数据源里的封面是外链（如 B 站 i0.hdslb.com）时加进来，构建时会下载转成 WebP 自托管，顺带绕开防盗链。
   */
  imageDomains: [] as string[],
  /** 站点关键词：输出到每页 <meta name="keywords">（旧站 config.ts head 原值；Google 不看，百度仍参考）。空数组不输出 */
  keywords: [
    'RuoYi', 'RuoYi-Plus', 'UniApp', 'Spring Boot 3', 'Vue 3', '企业级框架', '快速开发', '全栈开发', '后台管理系统',
    '多租户', 'SaaS', '代码生成器', 'MyBatis Plus', 'Element Plus', '微信小程序',
  ] as string[],
  analytics: {
    // 旧站每页都加载百度统计 hm.js（config.ts head），迁移后照旧
    provider: 'baidu' as AnalyticsProvider,
    /** umami: website-id；baidu: hm.js 后面那串 id */
    id: 'c5543d0699fa3d232a032fd56c45b460',
    /** umami 自托管脚本地址，provider=umami 时必填 */
    src: '',
  },
  // 照旧站顶部导航十项；四个文档分区的入口是各自的 index 页，旧网址 /backend/ 与 /backend/index.html 都要能打开
  nav: [
    { label: '后端', href: '/backend/index.html', match: '/backend/' },
    { label: '前端', href: '/frontend/index.html', match: '/frontend/' },
    { label: '移动端', href: '/mobile/index.html', match: '/mobile/' },
    { label: '最佳实践', href: '/practices/index.html', match: '/practices/' },
    { label: '特性', href: '/changelog.html' },
    { label: '框架对比', href: '/comparison.html' },
    { label: '视频', href: '/video.html' },
    { label: '演示', href: '/demo.html' },
    { label: '产品矩阵', href: '/products.html' },
    { label: '技术服务', href: '/services.html' },
  ] as NavItem[],
  social: [
    // 照旧站 socialLinks：只有文档仓库的 GitHub
    { label: 'GitHub', href: 'https://github.com/bkywksj/ruoyi-plus-uniapp-docs' },
  ] as SocialLink[],
  /** 备案号（国内服务器必填，显示在页脚；为空则不显示） */
  icp: '粤ICP备2021091549号-5',
  /** 页头右侧主按钮（旧站首页第一个按钮「开始使用」的去处）；null 不显示 */
  headerCta: { label: '开始使用', href: '/backend/getting-started.html' } as NavItem | null,
  /** 页脚链接分组（方案 C 三栏）；空数组时页脚退回「站内」一栏列出全部 nav */
  footerGroups: [
    {
      title: '文档',
      items: [
        { label: '后端', href: '/backend/index.html' },
        { label: '前端', href: '/frontend/index.html' },
        { label: '移动端', href: '/mobile/index.html' },
        { label: '最佳实践', href: '/practices/index.html' },
      ],
    },
    {
      title: '了解',
      items: [
        { label: '特性', href: '/changelog.html' },
        { label: '框架对比', href: '/comparison.html' },
        { label: '视频', href: '/video.html' },
        { label: '演示', href: '/demo.html' },
      ],
    },
    {
      title: '更多',
      items: [
        { label: '授权定价', href: '/demo.html#授权定价' },
        { label: '产品矩阵', href: '/products.html' },
        { label: '技术服务', href: '/services.html' },
      ],
    },
  ] as { title: string; items: NavItem[] }[],
  /** 页脚说明行（旧站 themeConfig.footer.message 原文）：text 原样显示，link 接在末尾 */
  footerNote: {
    text: '湛江智脑科技有限公司 · 若依科技工作室 · 承接全栈 / 桌面软件 / 小程序定制开发 · ',
    link: { label: '技术服务咨询', href: '/services.html' },
  } as { text: string; link?: NavItem } | null,
  /** 版权行署名（旧站 footer.copyright「© 年份 抓蛙师」）；为空时用 author.name */
  copyrightName: '抓蛙师',
  /**
   * 联系方式：页脚「联系」一栏、首页与营销页右下角「咨询」悬浮按钮、定价卡「立即购买」弹窗、群二维码下的兜底提示都从这里取。
   * wechatQr 是作者个人微信（长期有效）；groupQr 是交流群，微信群码 7 天过期，所以群码处一律附「过期请加作者微信」
   */
  contact: {
    wechat: '770492966',
    phone: '198 6657 9313',
    tel: '19866579313',
    wechatQr: '/wx.jpg',
    groupQr: '/wxq.jpg',
  } as { wechat: string; phone: string; tel: string; wechatQr: string; groupQr: string } | null,
};

export type SiteConfig = typeof site;
