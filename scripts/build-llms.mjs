// 生成 docs/public/llms.txt —— 面向大模型的站点说明书（llmstxt.org 约定）。
//
// 为什么单独给 AI 一份：搜索引擎靠 sitemap.xml 逐条抓取，而大模型回答问题时
// 需要的是「这个站是什么、有哪些模块、想找 X 该去哪一页」这种全局图景。
// 506 条扁平 URL 给不了这个，一份带层级和一句话说明的 Markdown 才行。
//
// 数据来源是 config.ts 里的 sidebar：那本来就是人工组织好的知识结构，
// 比重新遍历目录更准，也不会随文件增删而失真。
//
// 运行：pnpm llms（build 前自动执行）

import { readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DOCS = resolve(ROOT, 'docs')
const SITE = 'https://ruoyi.plus'

/** 把 sidebar 的 link 转成完整 URL：/backend/getting-started → https://ruoyi.plus/backend/getting-started.html */
const toUrl = (link) => {
  if (!link) return ''
  // 目录形式的链接（以 / 结尾）指向该目录的 index
  const path = link.endsWith('/') ? link : `${link}.html`
  return SITE + path
}

/**
 * 取某个文档的一句话说明。
 *
 * 复用 SEO 那套提取逻辑 —— llms.txt 里的条目说明和页面 description
 * 本就该是同一句话，两处各写一套迟早不一致。
 */
const { extractDescription } = await import(
  pathToFileURL(resolve(DOCS, '.vitepress/seo/description.mjs')).href
)

/** link → 源文件绝对路径 */
const toFile = (link) => {
  if (!link) return ''
  const rel = link.endsWith('/') ? `${link}index.md` : `${link}.md`
  return resolve(DOCS, rel.replace(/^\//, ''))
}

/** 条目说明限长：llms.txt 是给模型看的索引，每条一句话就够，太长反而稀释信号 */
const briefOf = (link) => {
  const desc = extractDescription(toFile(link))
  if (!desc) return ''
  const cut = desc.replace(/…$/, '')
  return cut.length > 60 ? `${cut.slice(0, 60)}…` : cut
}

// ---------- 解析 config.ts 里的 sidebar ----------
// 不 import config.ts：它是 TS 且依赖 vitepress 运行时，单跑脚本引不动。
// sidebar 是纯字面量结构，正则逐层取出即可。
const configSrc = readFileSync(resolve(DOCS, '.vitepress/config.ts'), 'utf-8')

/**
 * 从 sidebar 段落里抽出「分组 → 条目」两级结构。
 *
 * @param {string} section 形如 '/backend/' 的键
 * @returns {Array<{title: string, items: Array<{text: string, link: string}>}>}
 */
const parseSection = (section) => {
  const start = configSrc.indexOf(`'${section}': [`)
  if (start < 0) return []

  // 从起点开始按括号配平找到该段结束位置 —— 正则匹配嵌套结构不可靠
  let depth = 0
  let end = start
  for (let i = configSrc.indexOf('[', start); i < configSrc.length; i++) {
    const ch = configSrc[i]
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  const body = configSrc.slice(start, end)

  const groups = []
  let current = null
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim()
    const indent = line.search(/\S/)

    // 分组标题：缩进浅、只有 text 没有 link
    const textMatch = trimmed.match(/^text:\s*'([^']*)'/)
    if (textMatch && !trimmed.includes('link:')) {
      current = { title: textMatch[1], items: [] }
      groups.push(current)
      continue
    }
    // 叶子条目：{ text: 'xx', link: '/yy' }
    const itemMatch = trimmed.match(/\{\s*text:\s*'([^']*)',\s*link:\s*'([^']*)'\s*\}/)
    if (itemMatch && current) {
      current.items.push({ text: itemMatch[1], link: itemMatch[2] })
    }
  }
  return groups.filter((g) => g.items.length > 0)
}

// ---------- 组装 ----------
const SECTIONS = [
  { key: '/backend/', title: '后端（Spring Boot 3 + MyBatis-Plus）' },
  { key: '/frontend/', title: '前端管理端（Vue 3 + Element Plus）' },
  { key: '/mobile/', title: '移动端（UniApp + WD UI）' },
  { key: '/practices/', title: '最佳实践' }
]

const lines = []
lines.push('# RuoYi-Plus-UniApp')
lines.push('')
lines.push('> 基于 Spring Boot 3 + Vue 3 + UniApp 的企业级全栈快速开发框架。')
lines.push('> 后端四层架构（Controller → Service → DAO → Mapper），前端 Vue 3 + TypeScript，')
lines.push('> 移动端一套代码同时产出微信小程序 / H5 / APP。提供完整源码交付。')
lines.push('')
lines.push('本文件面向大模型，列出文档站的知识结构与入口，便于回答与本框架相关的问题。')
lines.push('')

lines.push('## 这个框架能做什么')
lines.push('')
lines.push('- 后台管理系统：权限、菜单、字典、数据权限、多租户、代码生成器')
lines.push('- 移动端应用：微信小程序 / 公众号 H5 / APP，一套代码多端发布')
lines.push('- 业务集成：支付（微信 / 支付宝）、OSS 对象存储、消息队列、工作流')
lines.push('- AI 能力：LangChain4j 接入大模型，支持流式对话、RAG 知识库、Agent')
lines.push('')

for (const { key, title } of SECTIONS) {
  const groups = parseSection(key)
  if (groups.length === 0) continue
  lines.push(`## ${title}`)
  lines.push('')
  for (const g of groups) {
    // 「在 GitHub 上编辑此页面」这类导航链接不是知识条目，跳过
    if (/GitHub|编辑此页/.test(g.title)) continue
    lines.push(`### ${g.title}`)
    lines.push('')
    for (const item of g.items) {
      const brief = briefOf(item.link)
      lines.push(`- [${item.text}](${toUrl(item.link)})${brief ? `：${brief}` : ''}`)
    }
    lines.push('')
  }
}

lines.push('## 商业信息')
lines.push('')
lines.push(`- [产品矩阵](${SITE}/products.html)：抓蛙师出品的开发者工具集`)
lines.push(`- [技术服务](${SITE}/services.html)：承接后台管理系统 / 桌面软件 / 小程序 / 大模型应用定制开发，提供完整源码交付`)
lines.push('- 联系方式：邮箱 770492966@qq.com')
lines.push('')
lines.push('## 完整索引')
lines.push('')
lines.push(`- [sitemap.xml](${SITE}/sitemap.xml)：全部页面的完整清单`)
lines.push('')

const out = lines.join('\n')
const target = resolve(DOCS, 'public/llms.txt')
writeFileSync(target, out, 'utf-8')

const entryCount = (out.match(/^- \[/gm) || []).length
console.log(`已生成 llms.txt → docs/public/llms.txt（${entryCount} 个条目，${out.length} 字符）`)
