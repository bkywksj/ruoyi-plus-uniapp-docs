# 图标类型生成

项目使用 Vite 插件自动扫描图标 JSON 文件,生成 TypeScript 类型定义,提供完整的类型安全和智能提示支持。

## 🔧 核心插件

### iconfont-types.ts

```typescript
// vite/plugins/iconfont-types.ts
import type { Plugin } from 'vite'
import fs from 'fs-extra'
import path from 'path'

export default function iconfontTypesPlugin(): Plugin {
  return {
    name: 'iconfont-types',

    buildStart() {
      // 在构建开始时生成类型
      generateIconTypes()
    },

    handleHotUpdate({ file }) {
      // JSON 文件变化时重新生成
      if (file.endsWith('.json') && file.includes('icons/system')) {
        generateIconTypes()
      }
    }
  }
}
```

## 📊 数据源

### 1. Iconfont JSON 格式

```json
// src/assets/icons/system/iconfont.json
{
  "css_prefix_text": "icon-",
  "glyphs": [
    {
      "icon_id": "1001",
      "name": "elevator3",
      "font_class": "elevator3",
      "unicode": "e665"
    }
  ]
}
```

### 2. Iconify JSON 格式

```json
// src/assets/icons/system/iconify.json
{
  "icons": [
    {
      "name": "首页",
      "iconifyIcon": "ep:home"
    }
  ]
}
```

## 🔄 生成流程

### 1. 读取 JSON 文件

```typescript
function generateIconTypes() {
  const iconsDir = path.resolve(__dirname, '../../src/assets/icons/system')

  // 读取 iconfont.json
  const iconfontPath = path.join(iconsDir, 'iconfont.json')
  const iconfontData = fs.readJSONSync(iconfontPath)

  // 读取 iconify.json
  const iconifyPath = path.join(iconsDir, 'iconify.json')
  const iconifyData = fs.readJSONSync(iconifyPath)
}
```

### 2. 解析图标数据

```typescript
// 解析 Iconfont
function parseIconfontIcons(data: any): IconItem[] {
  const prefix = data.css_prefix_text || 'icon-'

  return data.glyphs.map((glyph: any) => ({
    label: glyph.name,                    // "elevator3"
    value: `${prefix}${glyph.font_class}` // "icon-elevator3"
  }))
}

// 解析 Iconify
function parseIconifyIcons(data: any): IconifyIconItem[] {
  return data.icons.map((icon: any) => {
    const [collection, name] = icon.iconifyIcon.split(':')
    return {
      label: icon.name,           // "首页"
      value: `i-${collection}-${name}` // "i-ep-home"
    }
  })
}
```

### 3. 生成类型定义

```typescript
function generateTypeDefinition(
  iconfontIcons: IconItem[],
  iconifyIcons: IconifyIconItem[]
): string {
  // 生成联合类型
  const iconCodeType = [
    ...iconfontIcons.map(i => `'${i.value}'`),
    ...iconifyIcons.map(i => `'${i.value}'`)
  ].join(' | ')

  return `
/**
 * 图标类型定义 (自动生成)
 * @description 总计 ${iconfontIcons.length + iconifyIcons.length} 个图标
 * - iconfont: ${iconfontIcons.length}
 * - iconify: ${iconifyIcons.length}
 */

export interface IconItem {
  label: string
  value: string
}

export interface IconifyIconItem {
  label: string
  value: string
}

// Iconfont 图标列表
export const ICONFONT_ICONS: IconItem[] = ${JSON.stringify(iconfontIcons, null, 2)}

// Iconify 图标列表
export const ICONIFY_ICONS: IconifyIconItem[] = ${JSON.stringify(iconifyIcons, null, 2)}

// 所有图标代码联合类型
export type IconCode = ${iconCodeType}

// 工具函数
export function isValidIconCode(code: string): code is IconCode {
  return ICONFONT_ICONS.some(i => i.value === code) ||
         ICONIFY_ICONS.some(i => i.value === code)
}

export function searchIcons(keyword: string): (IconItem | IconifyIconItem)[] {
  return [
    ...ICONFONT_ICONS.filter(i => i.label.includes(keyword) || i.value.includes(keyword)),
    ...ICONIFY_ICONS.filter(i => i.label.includes(keyword) || i.value.includes(keyword))
  ]
}
`
}
```

### 4. 写入文件

```typescript
function writeTypeFile(content: string) {
  const outputPath = path.resolve(__dirname, '../../src/types/icons.d.ts')

  fs.ensureDirSync(path.dirname(outputPath))
  fs.writeFileSync(outputPath, content, 'utf-8')

  console.log('✅ 图标类型已生成:', outputPath)
}
```

## 📝 生成的类型文件

### icons.d.ts 结构

```typescript
// src/types/icons.d.ts (自动生成)

/**
 * 图标类型定义 (自动生成)
 * @description 总计 817 个图标
 * - iconfont: 644
 * - iconify: 173
 */

export interface IconItem {
  label: string
  value: string
}

export interface IconifyIconItem {
  label: string
  value: string
}

// Iconfont 图标列表 (644 个)
export const ICONFONT_ICONS: IconItem[] = [
  { "label": "elevator3", "value": "icon-elevator3" },
  { "label": "equipment-setting2", "value": "icon-equipment-setting2" },
  // ... 642 more
]

// Iconify 图标列表 (173 个)
export const ICONIFY_ICONS: IconifyIconItem[] = [
  { "label": "首页", "value": "i-ep-home" },
  { "label": "设置", "value": "i-ep-setting" },
  // ... 171 more
]

// 图标代码联合类型
export type IconCode =
  | 'icon-elevator3'
  | 'icon-equipment-setting2'
  | 'i-ep-home'
  | 'i-ep-setting'
  // ... 813 more

// 验证图标代码
export function isValidIconCode(code: string): code is IconCode

// 搜索图标
export function searchIcons(keyword: string): (IconItem | IconifyIconItem)[]
```

## 🚀 使用类型

### 1. 类型安全

```typescript
import type { IconCode } from '@/types/icons'

// ✅ 类型检查通过
const validIcon: IconCode = 'icon-elevator3'

// ❌ 编译错误: 类型不匹配
const invalidIcon: IconCode = 'icon-not-exist'
```

### 2. 智能提示

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

// 输入时自动提示所有可用图标
const icon = ref<IconCode>('icon-')  // 智能提示 644 + 173 个图标
</script>
```

### 3. 工具函数

```typescript
import { isValidIconCode, searchIcons } from '@/types/icons'

// 验证图标代码
if (isValidIconCode('icon-elevator3')) {
  console.log('有效的图标代码')
}

// 搜索图标
const results = searchIcons('电梯')
console.log(results)
// [{ label: "elevator3", value: "icon-elevator3" }]
```

## ⚙️ 插件配置

### 注册插件

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import iconfontTypes from './vite/plugins/iconfont-types'

export default defineConfig({
  plugins: [
    iconfontTypes(),  // 注册图标类型生成插件
    // ... other plugins
  ]
})
```

### 开发模式

```typescript
// 监听 JSON 文件变化
export default function iconfontTypesPlugin(): Plugin {
  return {
    name: 'iconfont-types',

    // 开发模式热更新
    handleHotUpdate({ file, server }) {
      if (file.includes('icons/system') && file.endsWith('.json')) {
        console.log('🔄 检测到图标文件变化,重新生成类型...')
        generateIconTypes()

        // 通知客户端刷新
        server.ws.send({
          type: 'full-reload',
          path: '*'
        })
      }
    }
  }
}
```

## 🔍 高级功能

### 1. 图标分组

```typescript
// 生成分组信息
function groupIcons(icons: IconItem[]): Record<string, IconItem[]> {
  return icons.reduce((groups, icon) => {
    const category = icon.label.split('-')[0] || 'other'
    if (!groups[category]) groups[category] = []
    groups[category].push(icon)
    return groups
  }, {} as Record<string, IconItem[]>)
}

// 在类型文件中导出
export const ICON_GROUPS = ${JSON.stringify(groupIcons(iconfontIcons), null, 2)}
```

### 2. 图标统计

```typescript
// 生成统计信息
function generateStats(iconfont: IconItem[], iconify: IconifyIconItem[]) {
  return {
    total: iconfont.length + iconify.length,
    iconfont: iconfont.length,
    iconify: iconify.length,
    categories: Object.keys(groupIcons(iconfont))
  }
}

export const ICON_STATS = ${JSON.stringify(generateStats(iconfontIcons, iconifyIcons))}
```

### 3. 图标预览

```typescript
// 生成图标预览数据
export const ICON_PREVIEWS = [
  ...iconfontIcons.map(icon => ({
    ...icon,
    type: 'iconfont',
    class: icon.value
  })),
  ...iconifyIcons.map(icon => ({
    ...icon,
    type: 'iconify',
    class: icon.value
  }))
]
```

## 🛠️ 自定义配置

### 扩展插件选项

```typescript
interface PluginOptions {
  inputDir?: string        // 图标 JSON 目录
  outputPath?: string      // 类型文件输出路径
  prefix?: string          // 图标前缀
  groupBy?: 'category' | 'type'  // 分组方式
}

export default function iconfontTypesPlugin(options: PluginOptions = {}): Plugin {
  const {
    inputDir = 'src/assets/icons/system',
    outputPath = 'src/types/icons.d.ts',
    prefix = 'icon-',
    groupBy = 'category'
  } = options

  // ... 使用配置生成类型
}
```

### 使用自定义配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    iconfontTypes({
      inputDir: 'src/assets/icons/custom',
      outputPath: 'src/types/custom-icons.d.ts',
      prefix: 'custom-',
      groupBy: 'type'
    })
  ]
})
```

## 🔄 手动生成

### 命令行脚本

```typescript
// scripts/generate-icon-types.ts
import { generateIconTypes } from '../vite/plugins/iconfont-types'

console.log('🚀 开始生成图标类型...')
generateIconTypes()
console.log('✅ 图标类型生成完成!')
```

### package.json 配置

```json
{
  "scripts": {
    "generate:icons": "tsx scripts/generate-icon-types.ts"
  }
}
```

### 执行生成

```bash
pnpm run generate:icons
```

## ⚠️ 注意事项

1. **JSON 格式**: 确保 JSON 文件格式正确
2. **文件路径**: 检查图标文件路径配置
3. **编码格式**: 使用 UTF-8 编码
4. **版本控制**: 将生成的类型文件提交到版本控制
5. **构建顺序**: 确保类型生成在构建之前完成

## 📋 故障排查

### 类型未生成

```bash
# 检查插件是否注册
grep -r "iconfontTypes" vite.config.ts

# 检查 JSON 文件是否存在
ls -la src/assets/icons/system/

# 手动触发生成
pnpm run generate:icons
```

### 类型不更新

```bash
# 清除缓存
rm -rf node_modules/.vite
rm -rf dist

# 重启开发服务器
pnpm dev
```

## 🔗 相关文档

- [Iconfont 配置](./iconfont-config.md)
- [Iconify 配置](./iconify-config.md)
- [图标组件使用](./component-usage.md)

自动类型生成机制确保了图标使用的类型安全,提高了开发效率和代码质量。
