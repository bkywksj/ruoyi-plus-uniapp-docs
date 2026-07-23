// 扫描全站 md，报告"疑似装饰性 emoji 但未被 icon-map 覆盖"的字符（排除代码块、箭头、几何图表字符）。
// 用于全量转换前补全映射表。
import { readFileSync, statSync, readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const mapUrl = pathToFileURL(resolve(__dirname, '../docs/.vitepress/theme/icon-map.mjs')).href
const { decorativeMap, statusInlineMap, dotMap, tableCellText } = await import(mapUrl)

const stripVS = (s) => s.replace(/️/g, '')
const mapped = new Set()
for (const m of [decorativeMap, statusInlineMap, dotMap, tableCellText]) for (const k of Object.keys(m)) mapped.add(stripVS(k))

// 保留集：箭头 + 几何/目录树字符（用于 ASCII 图，不算装饰 emoji，故不报告）
const keepRanges = [
  [0x2190, 0x21ff], // 箭头
  [0x2500, 0x259f], // 制表/块
  [0x25a0, 0x25ff], // 几何形状 ▼►●○ 等
  [0x2b00, 0x2b1f], // 杂项箭头
]
const inKeep = (cp) => keepRanges.some(([a, b]) => cp >= a && cp <= b)
// 装饰 emoji 候选范围
const emojiRanges = [
  [0x1f000, 0x1faff],
  [0x2600, 0x27bf],
  [0x2b00, 0x2bff],
  [0x2300, 0x23ff],
]
const isEmojiRange = (cp) => emojiRanges.some(([a, b]) => cp >= a && cp <= b)

const counts = new Map()
function scan(file) {
  const lines = readFileSync(file, 'utf8').split('\n')
  let inFence = false
  let mark = ''
  for (const line of lines) {
    const f = line.match(/^\s*(```+|~~~+)/)
    if (f) {
      if (!inFence) { inFence = true; mark = f[1][0] }
      else if (line.trim().startsWith(mark)) inFence = false
      continue
    }
    if (inFence) continue
    for (const ch of line) {
      const cp = ch.codePointAt(0)
      if (ch === '️' || cp === 0x20e3) continue
      if (!isEmojiRange(cp)) continue
      if (inKeep(cp)) continue
      const base = stripVS(ch)
      if (mapped.has(base)) continue
      counts.set(base, (counts.get(base) || 0) + 1)
    }
  }
}
function walk(p) {
  const st = statSync(p)
  if (st.isDirectory()) for (const n of readdirSync(p)) walk(join(p, n))
  else if (p.endsWith('.md')) scan(p)
}
walk(resolve(root, 'docs'))

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
console.log(`未映射的疑似装饰 emoji：${sorted.length} 种`)
for (const [ch, n] of sorted) {
  console.log(`${String(n).padStart(6)}  U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}  ${ch}`)
}
