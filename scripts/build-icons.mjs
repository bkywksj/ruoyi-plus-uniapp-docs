// 从完整 Iconify 集合中，仅抽取 icon-map.mjs 用到的图标，生成精简离线数据
// docs/.vitepress/theme/icons.data.json（客户端只加载这个小文件，保证离线且不臃肿）。
// 映射表变动后需重跑：pnpm icons（dev/build 前会自动执行）。
import { getIconData } from '@iconify/utils'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve } from 'path'
import { writeFileSync } from 'fs'

const require = createRequire(import.meta.url)
const lucide = require('@iconify-json/lucide/icons.json')
const simple = require('@iconify-json/simple-icons/icons.json')

const __dirname = dirname(fileURLToPath(import.meta.url))
const mapUrl = pathToFileURL(resolve(__dirname, '../docs/.vitepress/theme/icon-map.mjs')).href
const { decorativeMap } = await import(mapUrl)

const collections = { lucide, 'simple-icons': simple }

// 状态/圆点组件内部用到的图标（不在 decorativeMap 里，需一并抽取）
const extra = [
  'lucide:circle-check',
  'lucide:circle-x',
  'lucide:triangle-alert',
  'lucide:circle-help',
  'lucide:circle', // 优先级圆点底图（配色由组件控制）
  'lucide:check', // 卡片特性项对勾（APricingCard）
]

const all = new Set([...Object.values(decorativeMap), ...extra])
const out = {}
const missing = []
for (const full of all) {
  const [prefix, name] = full.split(':')
  const col = collections[prefix]
  const d = col ? getIconData(col, name) : null
  if (!d) {
    missing.push(full)
    continue
  }
  out[full] = { body: d.body, width: d.width ?? 24, height: d.height ?? 24 }
}

if (missing.length) {
  console.error('缺失图标(请修正 icon-map.mjs):', missing.join(', '))
  process.exit(2)
}

const outPath = resolve(__dirname, '../docs/.vitepress/theme/icons.data.json')
writeFileSync(outPath, JSON.stringify(out))
console.log(`已生成 ${Object.keys(out).length} 个离线图标 → theme/icons.data.json`)
