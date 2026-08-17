// 从 Markdown 正文自动提取页面描述，供 config.ts 的 transformPageData 兜底调用。
//
// 为什么需要：VitePress 默认让所有页面共用 config 里的站点级 description。
// 全站挂同一段话，对 SEO 是「重复元描述」（Google 会警告并自行改写摘要），
// 对 GEO 伤害更大 —— AI 判断「这页讲什么」时 description 权重很高，
// 全站一个样等于告诉大模型「我们都在讲同一件事」，精准引用某一页就无从谈起。
//
// 优先级：frontmatter.description（手写，最准） > 正文首段自动提取 > 站点默认（兜底）
// 本站是产品营销站，description 直接影响点击率，核心页应尽量手写。

import { readFileSync } from 'fs'

/** 摘要目标长度：Google 搜索结果约展示 155-160 字符，中文按字数算更短 */
const MAX_LENGTH = 150
/**
 * 摘要下限。定得低（而非常见的 50）是有意的：
 * 一句 17 字的短句仍远比站点级通用描述精准 ——
 * 宁可要一句短的真话，也不要一段长的套话。
 */
const MIN_LENGTH = 12

/**
 * 逐行剥离 Markdown 语法，还原成纯文本。
 *
 * 不用现成的 markdown 解析库：这里只需要「大致像人话」的一段文字，
 * 为几十个页面各跑一遍 AST 解析器不划算。
 */
const stripMarkdown = (text) =>
  text
    // 图片要在链接之前处理 —— ![alt](url) 的前缀 ! 会让链接规则匹配错位
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // 链接只保留文字：[多实例](/features/multi-instance) → 多实例
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 行内代码保留内容：`~/.claude.json` → ~/.claude.json（往往正是关键术语）
    .replace(/`([^`]*)`/g, '$1')
    // 粗体 / 斜体 / 删除线
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    // 残留的 HTML / Vue 组件标签
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * 判断一行是否属于「不该进摘要」的结构。
 *
 * @param {string} line 已 trim 的行
 */
const isSkippable = (line) =>
  line === '' ||
  line.startsWith('#') ||           // 标题（title 已单独占位）
  line.startsWith('>') ||           // 引用块
  line.startsWith('|') ||           // 表格
  line.startsWith('---') ||         // 分隔线
  // 注：VitePress 容器（:::）在主循环里按「整段跳过」单独处理，不在这里判断 ——
  // 只跳过 ::: 那一行的话，容器内部的文字仍会被当正文抓走
  line.startsWith('<') ||           // HTML / Vue 组件（本站有 BilibiliVideo 等）
  /^[-*+]\s/.test(line) ||          // 无序列表 —— 列表项零碎，拼起来读着像乱码
  /^\d+\.\s/.test(line) ||          // 有序列表
  /^\w+=["']/.test(line)            // Vue 组件的属性行（如 bvid="BV1..."）

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

  // home 布局（首页）的正文只有零散 slogan，提取出来反而不如站点级描述有信息量
  if (/^---[\s\S]*?^layout:\s*home\s*$/m.test(raw)) {
    return ''
  }

  // 去掉 frontmatter
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')

  let inCodeBlock = false
  const parts = []

  let inContainer = false

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim()

    // 代码块整段跳过 —— 摘要里出现半截代码既难读也帮不上搜索引擎
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // VitePress 自定义容器（::: info / tip / warning / details）整段跳过。
    // 光跳过 ::: 那一行不够 —— 容器**内部**的文字会被当正文抓走。
    // 实测踩过：一批页面开头有「::: info 章节正在完善中 / 本页详细内容正在撰写 :::」，
    // 提取到的摘要就成了「本页详细内容正在撰写」，等于告诉搜索用户这页没内容。
    if (line.startsWith(':::')) {
      // 单行容器（::: tip xxx :::）不改变状态；否则是开或闭
      const isSelfClosing = line.length > 3 && line.endsWith(':::')
      if (!isSelfClosing) inContainer = !inContainer
      continue
    }

    if (inContainer || inCodeBlock || isSkippable(line)) {
      // 攒够了才收手。没攒够就继续往下找 —— 有些页面首段只有一句话，
      // 后面紧跟列表或组件，就此打住会白白丢掉这句。
      if (parts.join(' ').length >= MIN_LENGTH) break
      continue
    }

    parts.push(line)
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
  // 标点太靠前（不足 60%）就不用它，宁可硬截也别丢掉大半内容
  return (lastPunct > MAX_LENGTH * 0.6 ? cut.slice(0, lastPunct) : cut).trim() + '…'
}
