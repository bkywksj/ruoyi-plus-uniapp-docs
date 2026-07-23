// 校验 icon-map.mjs 中的图标名是否真实存在于对应 Iconify 集合
import { getIconData } from '@iconify/utils'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const lucide = require('@iconify-json/lucide/icons.json')
const simple = require('@iconify-json/simple-icons/icons.json')

const __dirname = dirname(fileURLToPath(import.meta.url))
const mapUrl = pathToFileURL(resolve(__dirname, '../docs/.vitepress/theme/icon-map.mjs')).href
const { decorativeMap } = await import(mapUrl)

const collections = { lucide, 'simple-icons': simple }
const missing = []
let okCount = 0
for (const [emoji, full] of Object.entries(decorativeMap)) {
  const [prefix, name] = full.split(':')
  const col = collections[prefix]
  const data = col ? getIconData(col, name) : null
  if (!data) missing.push(`${emoji}  ${full}`)
  else okCount++
}
console.log(`OK: ${okCount} / ${Object.keys(decorativeMap).length}`)
if (missing.length) {
  console.log('\n缺失(图标名不存在，需改名):')
  missing.forEach((m) => console.log('  ' + m))
  process.exit(2)
} else {
  console.log('全部图标名有效')
}
