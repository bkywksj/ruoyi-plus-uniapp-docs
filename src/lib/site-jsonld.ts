// 全站结构化数据：旧站 config.ts 的 head 在每一页都输出这四段（WebSite / SoftwareApplication / Organization / ProfessionalService），
// 迁移后照样每页带上——AI 与搜索引擎在任意一页都能认出「这是什么框架、谁做的、能承接什么」。取值逐字照搬旧站，改动时两边对一下
import type { JsonLd } from '@/lib/seo';

const FOUNDER_SAME_AS = 'https://space.bilibili.com/520725002';

export const siteJsonLd: JsonLd[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RuoYi-Plus-UniApp',
    url: 'https://ruoyi.plus',
    description: '基于 Spring Boot 3 + Vue 3 + UniApp 的企业级全栈快速开发框架文档',
    inLanguage: 'zh-CN',
    publisher: { '@type': 'Organization', name: '抓蛙师', url: 'https://ruoyi.plus' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RuoYi-Plus-UniApp',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    description: '企业级全栈快速开发框架，基于 Spring Boot 3 + Vue 3 + UniApp',
    url: 'https://ruoyi.plus',
    offers: { '@type': 'Offer', price: '2588', priceCurrency: 'CNY' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '湛江智脑科技有限公司',
    legalName: '湛江智脑科技有限公司',
    alternateName: '智脑科技',
    founder: { '@type': 'Person', name: '抓蛙师', sameAs: FOUNDER_SAME_AS },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CN',
      addressRegion: '广东省',
      addressLocality: '湛江市霞山区',
      streetAddress: '人民大道南53号国贸大厦B座3幢五层A02房',
    },
    telephone: '+86-198-6657-9313',
    sameAs: [FOUNDER_SAME_AS],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: '若依科技工作室',
    alternateName: '抓蛙师',
    url: 'https://ruoyi.plus',
    image: 'https://ruoyi.plus/logo.png',
    description:
      '由抓蛙师创办的全栈技术工作室，承接后台管理系统、Java 后端 + 前端全栈、桌面软件、微信小程序 / 公众号、商城、物联网、大模型 Agent 应用及项目 AI 技能体系（Claude Code 技能 / 命令 / 钩子）的定制开发，提供完整源码交付，可签订源码交付合同。',
    telephone: '+86-198-6657-9313',
    email: '770492966@qq.com',
    founder: { '@type': 'Person', name: '抓蛙师', jobTitle: 'Java 全栈 AI 架构师 / Agent 架构师', sameAs: FOUNDER_SAME_AS },
    address: { '@type': 'PostalAddress', addressCountry: 'CN', addressRegion: '广东省', addressLocality: '湛江市麻章区湖光镇' },
    areaServed: 'CN',
    knowsAbout: [
      '后台管理系统',
      'Spring Boot 3',
      'Vue 3',
      'UniApp',
      'Tauri 桌面开发',
      '微信小程序',
      '大模型应用',
      'Agent 架构',
      'RAG',
      '多租户 SaaS',
      'Claude Code 技能开发',
      'AI 技能体系定制',
    ],
    sameAs: [FOUNDER_SAME_AS, 'https://github.com/bkywksj'],
    makesOffer: [
      '后台管理系统 / 全栈项目定制开发',
      '桌面软件开发（Tauri 跨平台）',
      '微信小程序 / 公众号开发',
      '大模型与 Agent 应用开发',
      '项目 AI 技能体系定制（Claude Code 技能 / 命令 / 钩子）',
      '完整源码交付',
    ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
  },
];
