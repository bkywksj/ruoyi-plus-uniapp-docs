// 从 Markdown 正文自动提取页面描述，供 config.ts 的 transformPageData 调用。
//
// 为什么需要：VitePress 默认让所有页面共用 config 里的站点级 description。
// 506 个页面挂同一段描述，对 SEO 是「重复元描述」（Google 会警告并自行改写摘要），
// 对 GEO 伤害更大 —— AI 判断「这页讲什么」时 description 权重很高，
// 全站一个样等于告诉大模型「我们都在讲同一件事」，精准引用某一页就无从谈起。
//
// 优先级：frontmatter.description（手写，最准） > 正文首段自动提取 > 站点默认（兜底）

import { readFileSync } from 'fs'

/** 摘要目标长度：Google 搜索结果约展示 155-160 字符，中文按字数算更短 */
const MAX_LENGTH = 150
/**
 * 摘要下限。定得低（而非常见的 50）是有意的：
 * 「前端项目的开发规范和最佳实践指南。」只有 17 字，但仍远比站点级那段
 * 通用描述精准 —— 宁可要一句短的真话，也不要一段长的套话。
 */
const MIN_LENGTH = 12

/**
 * 逐行剥离 Markdown 语法，还原成纯文本。
 *
 * 不用现成的 markdown 解析库：这里只需要「大致像人话」的一段文字，
 * 引一个 AST 解析器为 506 个页面各跑一遍，构建时间的代价不划算。
 */
const stripMarkdown = (text) =>
  text
    // 图片要在链接之前处理 —— ![alt](url) 的前缀 ! 会让链接规则匹配错位
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // 链接只保留文字：[数据权限](/xxx) → 数据权限
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 行内代码保留内容：`R<T>` → R<T>（这些往往正是关键术语，不能丢）
    .replace(/`([^`]*)`/g, '$1')
    // 粗体 / 斜体 / 删除线
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    // 残留的 HTML 标签（文档里有 <Badge> 之类的组件）
    .replace(/<[^>]+>/g, '')
    // 折叠空白
    .replace(/\s+/g, ' ')
    .trim()

/**
 * 判断一行是否属于「不该进摘要」的结构。
 *
 * @param {string} line 已 trim 的行
 */
const isSkippable = (line) =>
  line === '' ||
  line.startsWith('#') ||           // 标题（title 已单独占位，重复没意义）
  line.startsWith('>') ||           // 引用块（VitePress 的 tip/warning 容器）
  line.startsWith('|') ||           // 表格
  line.startsWith('---') ||         // 分隔线
  line.startsWith(':::') ||         // VitePress 自定义容器
  line.startsWith('<') ||           // HTML / Vue 组件
  /^[-*+]\s/.test(line) ||          // 无序列表 —— 列表项零碎，拼起来读着像乱码
  /^\d+\.\s/.test(line)             // 有序列表

/**
 * 从 Markdown 文件正文提取一段适合做 description 的文字。
 *
 * @param {string} filePath 绝对路径
 * @returns {string} 提取到的摘要；文件读不到或全是结构化内容时返回空串
 */
export const extractDescription = (filePath) => {
  let raw
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch {
    // 虚拟页面（如 404）没有真实文件，静默回落到站点默认描述
    return ''
  }

  // 去掉 frontmatter：--- 到下一个 --- 之间的部分
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')

  // home 布局（首页）的正文只有零散 slogan，提取出来反而不如站点级描述有信息量
  if (/^---[\s\S]*?^layout:\s*home\s*$/m.test(raw)) {
    return ''
  }

  let inCodeBlock = false
  const parts = []

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim()

    // 代码块整段跳过 —— 摘要里出现半截代码既难读也帮不上搜索引擎
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock || isSkippable(line)) {
      // 攒够了才收手。没攒够就继续往下找 —— 有些页面首段只有一句话
      // （如「生命周期」页），后面紧跟列表，就此打住会白白丢掉这句。
      if (parts.join(' ').length >= MIN_LENGTH) break
      continue
    }

    parts.push(line)
    // 连续的正文行拼成一段，够长就停
    if (parts.join(' ').length >= MAX_LENGTH) break
  }

  const text = stripMarkdown(parts.join(' '))
  if (text.length < MIN_LENGTH) {
    return ''
  }
  if (text.length <= MAX_LENGTH) {
    return text
  }

  // 超长时在标点处截断，避免把词切一半
  const cut = text.slice(0, MAX_LENGTH)
  const lastPunct = Math.max(
    cut.lastIndexOf('。'), cut.lastIndexOf('，'), cut.lastIndexOf('；'),
    cut.lastIndexOf('、'), cut.lastIndexOf('.'), cut.lastIndexOf(',')
  )
  // 标点太靠前（不足 2/3）就不用它，宁可硬截也别丢掉大半内容
  return (lastPunct > MAX_LENGTH * 0.6 ? cut.slice(0, lastPunct) : cut).trim() + '…'
}
