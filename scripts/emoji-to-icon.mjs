// Emoji → Iconify 图标 / 状态组件 / 表格文字 的批量转换脚本（白名单策略）
//
// 安全原则：
//  1. 只转换 icon-map.mjs 白名单里的字符，其余（箭头 → ↓ ↑ ←、几何/目录树字符 ▼ ► ● ○ 等）一律不动。
//  2. 完整跳过 ``` / ~~~ 围栏代码块，以及行内 `code` 反引号区间——绝不破坏代码/ASCII 图。
//  3. 区分上下文：表格单元格内的状态标记 → 文字；正文行内 → 彩色组件；装饰 emoji → <Icon/>。
//
// 用法：
//   node scripts/emoji-to-icon.mjs <目标目录或文件> [--dry]
//   node scripts/emoji-to-icon.mjs docs/backend/modules --dry
//   node scripts/emoji-to-icon.mjs docs            # 全量
import { readFileSync, writeFileSync, statSync, readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve, join, relative } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const mapUrl = pathToFileURL(resolve(__dirname, '../docs/.vitepress/theme/icon-map.mjs')).href
const { decorativeMap, statusInlineMap, dotMap, tableCellText } = await import(mapUrl)

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const target = args.find((a) => !a.startsWith('--')) || 'docs'

const stripVS = (s) => s.replace(/️/g, '')
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 装饰 emoji → <Icon .../>（表格内、正文内都用图标）
const decor = {}
for (const [k, v] of Object.entries(decorativeMap)) decor[stripVS(k)] = `<Icon icon="${v}" />`
// 行内状态/圆点 → 组件
const inlineComp = {}
for (const [k, v] of Object.entries(statusInlineMap)) inlineComp[stripVS(k)] = `<${v}/>`
for (const [k, v] of Object.entries(dotMap)) inlineComp[stripVS(k)] = `<${v}/>`
// 表格内状态/圆点 → 文字
const tableText = {}
for (const [k, v] of Object.entries(tableCellText)) tableText[stripVS(k)] = v

// 两套上下文映射
const nonTableMap = { ...decor, ...inlineComp } // 正文：装饰→图标，状态→组件
const tableMap = { ...decor, ...tableText } // 表格：装饰→图标，状态→文字

const buildRe = (m) => new RegExp('(' + Object.keys(m).sort((a, b) => b.length - a.length).map(esc).join('|') + ')\\uFE0F?', 'g')
const nonTableRe = buildRe(nonTableMap)
const tableRe = buildRe(tableMap)

// 标题（# 开头）里的所有白名单字符：直接移除（不塞组件，避免污染锚点/永久链接 aria-label/大纲）
const allKeys = new Set([...Object.keys(nonTableMap), ...Object.keys(tableMap)])
const stripMap = {}
for (const k of allKeys) stripMap[k] = ''
const stripRe = buildRe(stripMap)
const isHeading = (line) => /^\s{0,3}#{1,6}\s/.test(line)

const stats = { files: 0, changed: 0, repl: 0, tableFilesNeedReview: [] }

/** 只在非行内代码(反引号)区间做替换 */
function replaceOutsideInlineCode(line, re, map) {
  let count = 0
  // 用反引号分段：以 ` 开头的段是代码，跳过
  const parts = line.split(/(`[^`]*`)/)
  const out = parts
    .map((seg) => {
      if (seg.startsWith('`') && seg.endsWith('`')) return seg
      return seg.replace(re, (_, ch) => {
        count++
        return map[stripVS(ch)]
      })
    })
    .join('')
  return { out, count }
}

const isTableRow = (line) => /^\s*\|.*\|/.test(line) || /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line)

function processFile(file) {
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n')
  let inFence = false
  let fenceMark = ''
  let fileRepl = 0
  let tableStatusHit = false

  // 计算 YAML frontmatter 结束行（首行为 --- 时，到下一处 --- 为止），整块跳过
  let fmEnd = -1
  if (lines[0] === '---' || lines[0] === '---\r') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---' || lines[i] === '---\r') { fmEnd = i; break }
    }
  }

  const outLines = lines.map((line, idx) => {
    // frontmatter：整块不动（其中的 icon:/title: 等是数据字段，组件在此不生效）
    if (idx <= fmEnd) return line

    const fenceOpen = line.match(/^\s*(```+|~~~+)/)
    if (fenceOpen) {
      if (!inFence) {
        inFence = true
        fenceMark = fenceOpen[1][0]
      } else if (line.trim().startsWith(fenceMark)) {
        inFence = false
      }
      return line
    }
    if (inFence) return line

    // 组件属性/数据行：
    //  - 以直引号开头的数组项/字符串（如 pricing 卡片 :features 的每一项）
    //  - 属性赋值行（如 `icon="🤖"`、`:highlights="[`）——emoji 在属性值里会破坏标签解析
    // 这类由组件渲染的数据，组件标签不生效 → 直接移除 emoji（不转组件）
    if (/^\s*['"]/.test(line) || /^\s*[:@\w.-]+=['"]/.test(line)) {
      const r = replaceOutsideInlineCode(line, stripRe, stripMap)
      fileRepl += r.count
      return r.out.replace(/[ \t]{2,}/g, ' ').replace(/([ \t])+(['"],?\s*)$/, '$2')
    }

    // 标题行：移除白名单 emoji（不转组件），并整理空白
    if (isHeading(line)) {
      const r = replaceOutsideInlineCode(line, stripRe, stripMap)
      fileRepl += r.count
      let h = r.out.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+$/, '')
      return h
    }

    const table = isTableRow(line)
    const re = table ? tableRe : nonTableRe
    const map = table ? tableMap : nonTableMap
    const { out, count } = replaceOutsideInlineCode(line, re, map)
    fileRepl += count
    // 表格里命中了会被转成文字的状态标记 → 标记需人工复核列义
    if (table && count > 0) {
      for (const ch of Object.keys(tableText)) {
        if (line.includes(ch)) { tableStatusHit = true; break }
      }
    }
    return out
  })

  stats.files++
  if (fileRepl > 0) {
    stats.repl += fileRepl
    stats.changed++
    if (tableStatusHit) stats.tableFilesNeedReview.push(relative(root, file))
    if (!dry) writeFileSync(file, outLines.join('\n'))
    console.log(`${dry ? '[dry] ' : ''}${relative(root, file)}  (+${fileRepl})`)
  }
}

function walk(p) {
  const st = statSync(p)
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) walk(join(p, name))
  } else if (p.endsWith('.md')) {
    processFile(p)
  }
}

walk(resolve(root, target))

console.log('\n===== 汇总 =====')
console.log(`扫描 ${stats.files} 个 md，改动 ${stats.changed} 个，共替换 ${stats.repl} 处`)
if (stats.tableFilesNeedReview.length) {
  console.log(`\n⚠ 以下文件的表格状态标记已按默认词(支持/不支持/部分)转换，需人工按列义复核：`)
  stats.tableFilesNeedReview.forEach((f) => console.log('  - ' + f))
}
