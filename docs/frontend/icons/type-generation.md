# 图标类型生成

项目使用自定义 Vite 插件自动扫描图标 JSON 文件，生成 TypeScript 类型定义，为图标系统提供完整的类型安全和智能提示支持。

## 概述

图标类型生成是整个图标系统的基础，它解决了以下核心问题：

- **类型安全**：所有图标使用都经过 TypeScript 类型检查
- **智能提示**：IDE 自动补全所有可用图标
- **运行时验证**：提供工具函数验证图标代码有效性
- **多源整合**：统一 Iconfont 和 Iconify 两种图标源

### 核心特性

- **自动化生成**：Vite 插件在构建时自动生成类型
- **热更新支持**：开发模式下修改 JSON 即时重新生成
- **递归扫描**：支持多层目录结构
- **去重机制**：自动处理重复图标代码
- **工具函数**：提供图标验证、搜索等实用函数

## 核心插件

### iconfont-types.ts

项目的类型生成由 `vite/plugins/iconfont-types.ts` 插件实现。

```typescript
// vite/plugins/iconfont-types.ts
import type { Plugin } from 'vite'
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'

// 图标项接口定义
interface IconItem {
  code: string
  name: string
}

// Iconify 图标项扩展接口
interface IconifyIconItem extends IconItem {
  value: string // iconify 图标的 CSS 类名
}

// Iconfont JSON 中的图形定义
interface IconfontGlyph {
  font_class: string
  name: string
  unicode: string
  unicode_decimal: number
}

// Iconify JSON 中的图标定义
interface IconifyIcon {
  code: string
  name: string
  value: string
}

// Iconfont JSON 文件格式
interface IconfontJson {
  glyphs: IconfontGlyph[]
}

// Iconify JSON 文件格式
interface IconifyJson {
  type: 'iconify'
  icons: IconifyIcon[]
}
```

### 插件工作原理

插件在 Vite 构建的不同生命周期执行类型生成：

```typescript
export default (): Plugin => {
  const iconsDir = 'src/assets/icons'      // 图标源目录
  const outputPath = 'src/types/icons.d.ts' // 输出文件路径
  let projectRoot = ''                      // 项目根目录

  return {
    name: 'iconfont-types',

    // 获取项目配置，确定项目根目录
    configResolved(config) {
      projectRoot = config.root
    },

    // 构建开始时生成类型
    buildStart() {
      writeTypeFile()
    },

    // 开发模式热更新支持
    handleHotUpdate({ file }) {
      const iconsPath = resolve(projectRoot, iconsDir)

      // 监听图标目录下的 JSON 文件变化
      if (file.startsWith(iconsPath) && file.endsWith('.json')) {
        console.log(`检测到图标文件变化: ${relative(projectRoot, file)}`)
        writeTypeFile()
      }
    }
  }
}
```

### 插件生命周期

| 生命周期 | 触发时机 | 执行操作 |
|---------|---------|---------|
| `configResolved` | Vite 配置解析完成 | 获取项目根目录 |
| `buildStart` | 开发服务器启动 / 生产构建开始 | 生成类型文件 |
| `handleHotUpdate` | 文件变化触发热更新 | 检测图标 JSON 变化并重新生成 |

## 数据源

### 1. Iconfont JSON 格式

Iconfont 图标来自阿里巴巴图标库导出的 JSON 文件。

**文件位置**: `src/assets/icons/system/iconfont.json`

```json
{
  "id": "5022572",
  "name": "plus-ui",
  "font_family": "iconfont",
  "css_prefix_text": "icon-",
  "description": "ruoyi-plus-uniapp图标库",
  "glyphs": [
    {
      "icon_id": "25331853",
      "name": "电梯",
      "font_class": "elevator3",
      "unicode": "e8b9",
      "unicode_decimal": 59577
    },
    {
      "icon_id": "32102715",
      "name": "电量",
      "font_class": "battery",
      "unicode": "e6e5",
      "unicode_decimal": 59109
    },
    {
      "icon_id": "16322949",
      "name": "漂流瓶",
      "font_class": "floating-bottle",
      "unicode": "e7eb",
      "unicode_decimal": 59371
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 图标项目 ID |
| `name` | `string` | 图标项目名称 |
| `font_family` | `string` | 字体族名称 |
| `css_prefix_text` | `string` | CSS 类名前缀 |
| `description` | `string` | 项目描述 |
| `glyphs` | `array` | 图标列表 |

**glyph 字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `icon_id` | `string` | 图标唯一 ID |
| `name` | `string` | 图标中文名称 |
| `font_class` | `string` | CSS 类名（不含前缀） |
| `unicode` | `string` | Unicode 编码（十六进制） |
| `unicode_decimal` | `number` | Unicode 编码（十进制） |

### 2. Iconify JSON 格式

Iconify 图标使用自定义 JSON 格式，包含图标代码、名称和实际 CSS 类名的映射。

**文件位置**: `src/assets/icons/iconify/preset.json`

```json
{
  "name": "iconify-preset",
  "description": "iconify 预设图标集合",
  "type": "iconify",
  "icons": [
    {
      "code": "button",
      "name": "按钮",
      "value": "i-fluent:button-16-regular"
    },
    {
      "code": "cascader",
      "name": "级联选择",
      "value": "i-ion:ios-arrow-dropdown"
    },
    {
      "code": "dashboard",
      "name": "仪表盘",
      "value": "i-tabler:layout-dashboard"
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 预设集合名称 |
| `description` | `string` | 集合描述 |
| `type` | `"iconify"` | 类型标识，用于区分 Iconfont |
| `icons` | `array` | 图标列表 |

**icon 字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `string` | 业务代码，用于组件引用 |
| `name` | `string` | 图标中文名称 |
| `value` | `string` | Iconify CSS 类名（如 `i-ep-home`） |

### 3. 两种格式的区别

| 特性 | Iconfont | Iconify |
|------|----------|---------|
| 来源 | 阿里巴巴图标库 | Iconify 图标集 |
| 使用方式 | 字体图标 | SVG 图标 |
| 类名格式 | `icon-xxx` | `i-集合-名称` |
| 颜色支持 | 单色 | 单色/多色 |
| 代码字段 | `font_class` | `code` |
| 名称字段 | `name` | `name` |
| 额外字段 | `unicode` | `value` |

## 生成流程

### 1. 解析 Iconfont JSON

```typescript
// 解析 iconfont JSON 文件
const parseIconfontJson = (jsonPath: string): IconItem[] => {
  try {
    const content = readFileSync(jsonPath, 'utf-8')
    const data: IconfontJson = JSON.parse(content)

    if (data.glyphs && Array.isArray(data.glyphs)) {
      return data.glyphs.map((glyph) => ({
        code: glyph.font_class || glyph.name,
        name: glyph.name
      }))
    }

    return []
  } catch (error) {
    console.warn(`解析 iconfont 文件失败: ${jsonPath}`, error)
    return []
  }
}
```

**处理逻辑**：

1. 读取 JSON 文件内容
2. 解析 JSON 并提取 `glyphs` 数组
3. 映射为统一的 `IconItem` 格式
4. `code` 优先使用 `font_class`，回退到 `name`
5. 错误时返回空数组并输出警告

### 2. 解析 Iconify JSON

```typescript
// 解析 iconify JSON 文件
const parseIconifyJson = (jsonPath: string): IconifyIconItem[] => {
  try {
    const content = readFileSync(jsonPath, 'utf-8')
    const data: IconifyJson = JSON.parse(content)

    if (data.type === 'iconify' && data.icons && Array.isArray(data.icons)) {
      return data.icons.map((icon) => ({
        code: icon.code,
        name: icon.name,
        value: icon.value
      }))
    }

    return []
  } catch (error) {
    console.warn(`解析 iconify 文件失败: ${jsonPath}`, error)
    return []
  }
}
```

**处理逻辑**：

1. 读取 JSON 文件内容
2. 验证 `type` 字段为 `"iconify"`
3. 提取 `icons` 数组并映射
4. 保留 `value` 字段用于 CSS 类名生成
5. 错误时返回空数组

### 3. 递归扫描目录

```typescript
// 获取所有图标
const getAllIcons = (iconsPath: string) => {
  const iconfontIcons: IconItem[] = []
  const iconifyIcons: IconifyIconItem[] = []
  const seenCodes = new Set<string>() // 用于去重

  if (!existsSync(iconsPath)) {
    console.warn(`图标目录不存在: ${iconsPath}`)
    return { iconfontIcons, iconifyIcons, allIcons: [] }
  }

  // 递归扫描目录
  const scanDirectory = (dirPath: string) => {
    try {
      const items = readdirSync(dirPath)

      items.forEach((item) => {
        const itemPath = join(dirPath, item)

        try {
          if (statSync(itemPath).isDirectory()) {
            scanDirectory(itemPath) // 递归扫描子目录
          } else if (item.endsWith('.json')) {
            // 优先尝试解析为 iconify 格式
            const iconifyIconsFromFile = parseIconifyJson(itemPath)
            if (iconifyIconsFromFile.length > 0) {
              console.log(`发现 iconify 图标文件: ${itemPath}, 图标数量: ${iconifyIconsFromFile.length}`)
              iconifyIcons.push(...iconifyIconsFromFile)
            } else {
              // 否则按 iconfont 格式解析
              const iconfontIconsFromFile = parseIconfontJson(itemPath)
              if (iconfontIconsFromFile.length > 0) {
                console.log(`发现 iconfont 图标文件: ${itemPath}, 图标数量: ${iconfontIconsFromFile.length}`)
                iconfontIcons.push(...iconfontIconsFromFile)
              }
            }
          }
        } catch (error) {
          console.warn(`跳过无法访问的文件: ${itemPath}`)
        }
      })
    } catch (error) {
      console.warn(`无法读取目录: ${dirPath}`)
    }
  }

  scanDirectory(iconsPath)

  // 合并去重
  const allIcons: IconItem[] = []

  // 先添加 iconfont 图标
  iconfontIcons.forEach((icon) => {
    if (!seenCodes.has(icon.code)) {
      seenCodes.add(icon.code)
      allIcons.push(icon)
    }
  })

  // 再添加 iconify 图标
  iconifyIcons.forEach((icon) => {
    if (!seenCodes.has(icon.code)) {
      seenCodes.add(icon.code)
      allIcons.push({ code: icon.code, name: icon.name })
    }
  })

  console.log(`图标扫描完成 - iconfont: ${iconfontIcons.length}, iconify: ${iconifyIcons.length}, 总计: ${allIcons.length}`)

  return {
    iconfontIcons: iconfontIcons.sort((a, b) => a.code.localeCompare(b.code)),
    iconifyIcons: iconifyIcons.sort((a, b) => a.code.localeCompare(b.code)),
    allIcons: allIcons.sort((a, b) => a.code.localeCompare(b.code))
  }
}
```

**扫描流程**：

```
src/assets/icons/
├── system/
│   └── iconfont.json    ← 解析为 iconfont
├── iconify/
│   └── preset.json      ← 解析为 iconify
└── custom/
    ├── business.json    ← 自动检测格式
    └── modules/
        └── extra.json   ← 递归扫描
```

### 4. 去重策略

项目使用 `Set` 数据结构进行图标代码去重：

```typescript
const seenCodes = new Set<string>()

// 添加图标时检查重复
if (!seenCodes.has(icon.code)) {
  seenCodes.add(icon.code)
  allIcons.push(icon)
}
```

**去重规则**：

1. **Iconfont 优先**：先添加 Iconfont 图标
2. **后来覆盖**：相同 code 的后续图标被忽略
3. **跨文件去重**：多个 JSON 文件间也会去重

### 5. 排序策略

所有图标列表按 `code` 字母顺序排序，便于查找和对比：

```typescript
return {
  iconfontIcons: iconfontIcons.sort((a, b) => a.code.localeCompare(b.code)),
  iconifyIcons: iconifyIcons.sort((a, b) => a.code.localeCompare(b.code)),
  allIcons: allIcons.sort((a, b) => a.code.localeCompare(b.code))
}
```

## 类型文件生成

### 生成模板

```typescript
const generateTypeContent = (iconData: ReturnType<typeof getAllIcons>): string => {
  const { iconfontIcons, iconifyIcons, allIcons } = iconData

  // 生成联合类型
  const iconCodes = allIcons.map((icon) => `    | '${icon.code}'`).join('\n')

  // 生成数组字面量
  const iconfontArray = iconfontIcons.map((icon) =>
    `  { code: '${icon.code}', name: '${icon.name}' }`
  ).join(',\n')

  const iconifyArray = iconifyIcons.map((icon) =>
    `  { code: '${icon.code}', name: '${icon.name}', value: '${icon.value}' }`
  ).join(',\n')

  const allArray = allIcons.map((icon) =>
    `  { code: '${icon.code}', name: '${icon.name}' }`
  ).join(',\n')

  return `/** 类型声明内容 */`
}
```

### 生成的文件结构

```typescript
/**
 * 图标类型声明文件
 *
 * 此文件由 iconfont-types 插件自动生成
 * 扫描目录: src/assets/icons
 * 图标数量: 817 个图标 (iconfont: 644, iconify: 173)
 *
 * 请勿手动修改此文件，所有修改将在下次构建时被覆盖
 */

declare global {
  /** 图标代码类型 */
  type IconCode =
    | 'admin'
    | 'alipay'
    | 'arrow-down'
    | 'arrow-up'
    | 'audio'
    | 'bag'
    // ... 更多图标
}

/** 图标项接口 */
export interface IconItem {
  code: string
  name: string
}

/** iconify 图标项接口 */
export interface IconifyIconItem extends IconItem {
  value: string
}

/** iconfont 图标列表 (仅来自 iconfont JSON 文件) */
export const ICONFONT_ICONS: IconItem[] = [
  { code: 'elevator3', name: '电梯' },
  { code: 'battery', name: '电量' },
  { code: 'floating-bottle', name: '漂流瓶' },
  // ... 644 个图标
]

/** iconify 预设图标列表 (包含 value 属性) */
export const ICONIFY_ICONS: IconifyIconItem[] = [
  { code: 'admin', name: '管理员', value: 'i-clarity:administrator-line' },
  { code: 'alipay', name: '支付宝支付', value: 'i-ri-alipay-fill' },
  { code: 'arrow-down', name: '向下箭头', value: 'i-mdi:arrow-down' },
  // ... 173 个图标
]

/** 所有可用图标列表 (用于图标选择器) */
export const ALL_ICONS: IconItem[] = [
  { code: 'admin', name: '管理员' },
  { code: 'alipay', name: '支付宝支付' },
  // ... 817 个图标
]
```

### 写入类型文件

```typescript
const writeTypeFile = (showLog = true) => {
  const iconsPath = resolve(projectRoot, iconsDir)
  const outputFilePath = resolve(projectRoot, outputPath)

  try {
    // 获取图标数据
    const iconData = getAllIcons(iconsPath)

    // 生成类型内容
    const typeContent = generateTypeContent(iconData)

    // 确保输出目录存在
    const outputDir = dirname(outputFilePath)
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    // 写入文件
    writeFileSync(outputFilePath, typeContent, 'utf-8')

    if (showLog) {
      console.log(`图标类型已生成: ${outputPath} (${iconData.allIcons.length} 个图标)`)
    }
  } catch (error) {
    console.error('生成图标类型时出错:', error)
  }
}
```

## 工具函数

生成的类型文件包含多个实用工具函数。

### isValidIconCode

验证代码是否为有效的图标代码。

```typescript
/** 检查代码是否为有效的图标 */
export const isValidIconCode = (code: string): code is IconCode => {
  return ALL_ICONS.some((icon) => icon.code === code)
}

// 使用示例
if (isValidIconCode('dashboard')) {
  console.log('有效的图标代码')
}

// 类型收窄
function renderIcon(code: string) {
  if (isValidIconCode(code)) {
    // 这里 code 的类型是 IconCode
    return <Icon icon={code} />
  }
  return null
}
```

### isIconfontIcon

检查代码是否为 Iconfont 图标。

```typescript
/** 检查代码是否为 iconfont 图标 */
export const isIconfontIcon = (code: string): boolean => {
  return ICONFONT_ICONS.some((icon) => icon.code === code)
}

// 使用示例
if (isIconfontIcon('elevator3')) {
  console.log('这是一个 Iconfont 图标')
}
```

### isIconifyIcon

检查代码是否为 Iconify 图标。

```typescript
/** 检查代码是否为 iconify 图标 */
export const isIconifyIcon = (code: string): boolean => {
  return ICONIFY_ICONS.some((icon) => icon.code === code)
}

// 使用示例
if (isIconifyIcon('dashboard')) {
  console.log('这是一个 Iconify 图标')
}
```

### getIconifyValue

获取 Iconify 图标的 CSS 类名。

```typescript
/** 获取 iconify 图标的 value */
export const getIconifyValue = (code: string): string | undefined => {
  return ICONIFY_ICONS.find((icon) => icon.code === code)?.value
}

// 使用示例
const cssClass = getIconifyValue('dashboard')
// 返回: 'i-tabler:layout-dashboard'

// 在组件中使用
<div :class="getIconifyValue('dashboard')"></div>
```

### getIconName

根据代码获取图标的中文名称。

```typescript
/** 根据代码获取图标名称 */
export const getIconName = (code: IconCode): string => {
  return ALL_ICONS.find((icon) => icon.code === code)?.name || code
}

// 使用示例
const name = getIconName('dashboard')
// 返回: '仪表盘'

// 用于界面显示
<span>{{ getIconName(selectedIcon) }}</span>
```

### searchIcons

根据关键词搜索图标。

```typescript
/** 搜索图标 */
export const searchIcons = (query: string): IconItem[] => {
  const searchTerm = query.toLowerCase()
  return ALL_ICONS.filter((icon) =>
    icon.code.toLowerCase().includes(searchTerm) ||
    icon.name.toLowerCase().includes(searchTerm)
  )
}

// 使用示例
const results = searchIcons('仪表')
// 返回: [{ code: 'dashboard', name: '仪表盘' }, ...]

// 搜索英文
const results2 = searchIcons('chart')
// 返回所有包含 'chart' 的图标
```

### getAllIconCodes

获取所有图标代码数组。

```typescript
/** 获取所有图标代码 */
export const getAllIconCodes = (): IconCode[] => {
  return ALL_ICONS.map((icon) => icon.code as IconCode)
}

// 使用示例
const allCodes = getAllIconCodes()
console.log(allCodes.length) // 817

// 用于图标选择器
const options = getAllIconCodes().map(code => ({
  label: getIconName(code),
  value: code
}))
```

## 插件配置

### 注册插件

插件在 `vite/plugins/index.ts` 中注册：

```typescript
// vite/plugins/index.ts
import vue from '@vitejs/plugin-vue'
import createUnoCss from './unocss'
import createAutoImport from './auto-imports'
import createComponents from './components'
import createIcons from './icons'
import createIconfontTypes from './iconfont-types'

export default (viteEnv: any, isBuild = false): [] => {
  const vitePlugins: any = []

  // Vue 官方插件
  vitePlugins.push(vue())

  // UnoCSS 原子化 CSS 引擎
  vitePlugins.push(createUnoCss())

  // 自动导入插件
  vitePlugins.push(createAutoImport(path))

  // 组件自动导入插件
  vitePlugins.push(createComponents(path))

  // 图标自动导入插件（iconify）
  vitePlugins.push(createIcons())

  // ⭐ iconfont 图标类型生成插件
  vitePlugins.push(createIconfontTypes())

  return vitePlugins
}
```

### 图标插件 (icons.ts)

配合 unplugin-icons 使用，支持图标自动安装：

```typescript
// vite/plugins/icons.ts
import Icons from 'unplugin-icons/vite'

// 图标使用方法：https://icones.js.org/ 前往搜索图标
// 点击 unocss，得到样式类
// <div class="i-material-symbols-home-rounded"/>

export default () => {
  return Icons({
    // 自动安装图标库
    // 当使用未安装的图标集合时，将自动下载并安装相应的图标依赖
    autoInstall: true
  })
}
```

### vite.config.ts 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import createPlugins from './vite/plugins'

export default defineConfig(({ mode }) => {
  const isBuild = mode === 'production'
  const viteEnv = loadEnv(mode, process.cwd())

  return {
    plugins: createPlugins(viteEnv, isBuild),
    // 其他配置...
  }
})
```

## 开发模式

### 热更新支持

插件在开发模式下监听图标 JSON 文件变化：

```typescript
handleHotUpdate({ file }) {
  const iconsPath = resolve(projectRoot, iconsDir)

  // 只处理图标目录下的 JSON 文件
  if (file.startsWith(iconsPath) && file.endsWith('.json')) {
    console.log(`检测到图标文件变化: ${relative(projectRoot, file)}`)
    writeTypeFile()
  }
}
```

**触发条件**：

1. 文件必须在 `src/assets/icons/` 目录下
2. 文件扩展名必须是 `.json`
3. 文件内容发生变化

**输出示例**：

```
检测到图标文件变化: src/assets/icons/iconify/preset.json
发现 iconify 图标文件: D:\project\plus-ui\src\assets\icons\iconify\preset.json, 图标数量: 173
图标扫描完成 - iconfont: 644, iconify: 173, 总计: 817
图标类型已生成: src/types/icons.d.ts (817 个图标)
```

### 开发工作流

```
1. 编辑 preset.json 添加新图标
   ↓
2. Vite 检测到文件变化
   ↓
3. handleHotUpdate 触发
   ↓
4. 重新扫描所有图标 JSON
   ↓
5. 重新生成 icons.d.ts
   ↓
6. TypeScript 检测到类型文件变化
   ↓
7. IDE 更新智能提示
```

## 使用类型

### 类型安全

```typescript
import type { IconCode } from '@/types/icons'

// ✅ 类型检查通过
const validIcon: IconCode = 'dashboard'

// ❌ 编译错误: Type '"not-exist"' is not assignable to type 'IconCode'
const invalidIcon: IconCode = 'not-exist'
```

### 组件 Props

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

interface Props {
  icon: IconCode
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 16
})
</script>

<template>
  <div :class="getIconClass(props.icon)" :style="{ fontSize: props.size + 'px' }"></div>
</template>
```

### 智能提示

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

// 输入时自动提示所有 817 个可用图标
const icon = ref<IconCode>('dash') // IDE 会提示 'dashboard'
</script>
```

### 表单验证

```typescript
import { isValidIconCode } from '@/types/icons'

// 验证用户输入的图标代码
function validateIcon(value: string): boolean {
  if (!isValidIconCode(value)) {
    console.error(`无效的图标代码: ${value}`)
    return false
  }
  return true
}

// 在表单校验中使用
const rules = {
  icon: [
    { required: true, message: '请选择图标' },
    { validator: (rule, value, callback) => {
      if (!isValidIconCode(value)) {
        callback(new Error('无效的图标代码'))
      } else {
        callback()
      }
    }}
  ]
}
```

### 图标选择器

```vue
<script setup lang="ts">
import { ALL_ICONS, searchIcons, getIconName } from '@/types/icons'
import type { IconCode } from '@/types/icons'

const keyword = ref('')
const selectedIcon = ref<IconCode>('dashboard')

// 过滤后的图标列表
const filteredIcons = computed(() => {
  if (!keyword.value) return ALL_ICONS
  return searchIcons(keyword.value)
})

// 选择图标
const selectIcon = (code: IconCode) => {
  selectedIcon.value = code
}
</script>

<template>
  <div class="icon-picker">
    <input v-model="keyword" placeholder="搜索图标..." />

    <div class="icon-grid">
      <div
        v-for="icon in filteredIcons"
        :key="icon.code"
        :class="{ selected: icon.code === selectedIcon }"
        @click="selectIcon(icon.code as IconCode)"
      >
        <Icon :icon="icon.code" />
        <span>{{ icon.name }}</span>
      </div>
    </div>
  </div>
</template>
```

## 高级功能

### 自定义输出路径

修改插件配置以自定义输出路径：

```typescript
// 插件内修改
const iconsDir = 'src/assets/icons'           // 图标源目录
const outputPath = 'src/types/custom-icons.d.ts' // 自定义输出路径
```

### 多图标源配置

支持扫描多个目录：

```typescript
const iconsDirs = [
  'src/assets/icons',      // 主图标目录
  'src/modules/*/icons'    // 模块级图标
]

const getAllIcons = () => {
  const allIconfontIcons: IconItem[] = []
  const allIconifyIcons: IconifyIconItem[] = []

  iconsDirs.forEach(dir => {
    const { iconfontIcons, iconifyIcons } = scanDirectory(dir)
    allIconfontIcons.push(...iconfontIcons)
    allIconifyIcons.push(...iconifyIcons)
  })

  return mergeAndDedupe(allIconfontIcons, allIconifyIcons)
}
```

### 生成分组信息

扩展生成的类型文件，包含分组信息：

```typescript
// 按前缀分组
function groupIcons(icons: IconItem[]): Record<string, IconItem[]> {
  return icons.reduce((groups, icon) => {
    const prefix = icon.code.split('-')[0] || 'other'
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(icon)
    return groups
  }, {} as Record<string, IconItem[]>)
}

// 生成分组导出
export const ICON_GROUPS: Record<string, IconItem[]> = {
  arrow: [
    { code: 'arrow-up', name: '向上箭头' },
    { code: 'arrow-down', name: '向下箭头' }
  ],
  chart: [
    { code: 'chart', name: '图表' },
    { code: 'pie-chart', name: '饼图' },
    { code: 'bar-chart', name: '柱状图' },
    { code: 'line-chart', name: '折线图' }
  ]
  // ...
}
```

### 生成统计信息

扩展类型文件，包含统计信息：

```typescript
// 生成统计常量
export const ICON_STATS = {
  total: 817,
  iconfont: 644,
  iconify: 173,
  groups: 45,
  lastGenerated: '2025-12-25T10:30:00Z'
} as const

// 使用统计信息
console.log(`共有 ${ICON_STATS.total} 个图标`)
```

### 自定义验证规则

添加更严格的验证规则：

```typescript
/** 验证图标代码格式 */
export const validateIconCodeFormat = (code: string): { valid: boolean; error?: string } => {
  // 检查空值
  if (!code || typeof code !== 'string') {
    return { valid: false, error: '图标代码不能为空' }
  }

  // 检查格式
  if (!/^[a-z][a-z0-9-]*$/.test(code)) {
    return { valid: false, error: '图标代码只能包含小写字母、数字和连字符' }
  }

  // 检查是否存在
  if (!isValidIconCode(code)) {
    return { valid: false, error: `未知的图标代码: ${code}` }
  }

  return { valid: true }
}
```

## 手动生成

### 命令行脚本

创建独立脚本用于手动生成类型：

```typescript
// scripts/generate-icon-types.ts
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

// 复用插件逻辑
import { generateIconTypes } from '../vite/plugins/iconfont-types'

console.log('🚀 开始生成图标类型...')

try {
  generateIconTypes(projectRoot)
  console.log('✅ 图标类型生成完成!')
} catch (error) {
  console.error('❌ 生成失败:', error)
  process.exit(1)
}
```

### package.json 配置

```json
{
  "scripts": {
    "generate:icons": "tsx scripts/generate-icon-types.ts",
    "icons": "npm run generate:icons"
  }
}
```

### 执行生成

```bash
# 使用 npm
npm run generate:icons

# 使用 pnpm
pnpm generate:icons

# 直接执行
npx tsx scripts/generate-icon-types.ts
```

### CI/CD 集成

在 CI 流程中确保类型是最新的：

```yaml
# .github/workflows/build.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: pnpm install

      - name: Generate icon types
        run: pnpm generate:icons

      - name: Type check
        run: pnpm type-check

      - name: Build
        run: pnpm build
```

## 与 UnoCSS 集成

### safelist 配置

生成的类型文件与 UnoCSS safelist 配合使用：

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons.d'

export default defineConfig({
  safelist: [
    // 预加载所有 Iconify 图标
    ...ICONIFY_ICONS.map((icon) => icon.value)
  ],

  presets: [
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    })
  ]
})
```

### 动态图标支持

```typescript
// 获取动态图标的 CSS 类名
const getIconClass = (code: string): string => {
  // 先检查是否是 Iconify 图标
  const iconifyValue = getIconifyValue(code)
  if (iconifyValue) {
    return iconifyValue
  }

  // 否则按 Iconfont 处理
  if (isIconfontIcon(code)) {
    return `icon-${code}`
  }

  // 回退
  return code
}
```

## 故障排查

### 类型未生成

**症状**：`src/types/icons.d.ts` 文件不存在或为空

**排查步骤**：

```bash
# 1. 检查插件是否注册
grep -r "iconfontTypes" vite.config.ts

# 2. 检查图标目录
ls -la src/assets/icons/

# 3. 检查 JSON 文件格式
cat src/assets/icons/iconify/preset.json | jq .

# 4. 手动触发生成
pnpm generate:icons
```

### 类型不更新

**症状**：添加新图标后类型没有更新

**解决方案**：

```bash
# 1. 清除 Vite 缓存
rm -rf node_modules/.vite

# 2. 删除旧类型文件
rm src/types/icons.d.ts

# 3. 重启开发服务器
pnpm dev
```

### 图标重复

**症状**：控制台警告图标代码重复

**解决方案**：

1. 检查多个 JSON 文件中是否有相同的 `code`
2. 使用 `seenCodes` Set 确保去重正确
3. 明确 Iconfont 和 Iconify 的优先级

### JSON 解析失败

**症状**：控制台输出 "解析 xxx 文件失败"

**解决方案**：

```bash
# 验证 JSON 格式
cat src/assets/icons/iconify/preset.json | python -m json.tool

# 常见问题：
# - 尾随逗号
# - 缺少引号
# - 特殊字符未转义
```

### 热更新不触发

**症状**：修改 JSON 后类型没有重新生成

**排查**：

1. 确认文件路径在 `src/assets/icons/` 下
2. 确认文件扩展名是 `.json`
3. 检查 Vite 热更新是否正常工作
4. 查看控制台是否有 "检测到图标文件变化" 日志

## 性能优化

### 缓存机制

添加生成结果缓存，避免重复计算：

```typescript
let cachedContent: string | null = null
let cachedHash: string | null = null

const generateWithCache = (iconsPath: string) => {
  const currentHash = computeDirectoryHash(iconsPath)

  if (cachedHash === currentHash && cachedContent) {
    return cachedContent
  }

  const content = generateTypeContent(getAllIcons(iconsPath))
  cachedContent = content
  cachedHash = currentHash

  return content
}
```

### 增量更新

只更新变化的部分：

```typescript
const updateIncrementally = (changedFile: string) => {
  // 只重新解析变化的文件
  const newIcons = parseJsonFile(changedFile)

  // 合并到现有数据
  mergeIcons(existingIcons, newIcons)

  // 只重新生成类型
  regenerateTypes()
}
```

### 并行处理

大量文件时使用并行处理：

```typescript
import { Worker } from 'worker_threads'

const parseFilesInParallel = async (files: string[]) => {
  const workers = files.map(file =>
    new Promise((resolve) => {
      const worker = new Worker('./parse-worker.js', { workerData: file })
      worker.on('message', resolve)
    })
  )

  return Promise.all(workers)
}
```

## 最佳实践

### 1. 保持代码唯一

```json
// ✅ 好的实践：使用唯一、有意义的代码
{
  "code": "user-management",
  "name": "用户管理"
}

// ❌ 不推荐：使用模糊或重复的代码
{
  "code": "icon1",
  "name": "图标1"
}
```

### 2. 使用语义化名称

```json
// ✅ 好的实践
{
  "code": "arrow-left",
  "name": "向左箭头",
  "value": "i-mdi:arrow-left"
}

// ❌ 不推荐
{
  "code": "a1",
  "name": "箭头",
  "value": "i-mdi:arrow-left"
}
```

### 3. 组织目录结构

```
src/assets/icons/
├── system/              # 系统级图标
│   └── iconfont.json    # Iconfont 图标
├── iconify/             # Iconify 图标
│   └── preset.json      # 预设图标
├── business/            # 业务图标
│   ├── shop.json        # 商城模块
│   └── workflow.json    # 工作流模块
└── custom/              # 自定义图标
    └── brand.json       # 品牌图标
```

### 4. 版本控制

```bash
# 将生成的类型文件加入版本控制
git add src/types/icons.d.ts

# 在 .gitignore 中不要忽略它
# 这确保团队成员都有一致的类型
```

### 5. 类型文件检查

在 CI 中验证类型文件是否最新：

```bash
#!/bin/bash
# scripts/check-icon-types.sh

# 生成新的类型文件
pnpm generate:icons --output=.tmp-icons.d.ts

# 比较差异
if ! diff -q src/types/icons.d.ts .tmp-icons.d.ts > /dev/null; then
  echo "❌ 图标类型文件不是最新的，请运行 pnpm generate:icons"
  rm .tmp-icons.d.ts
  exit 1
fi

echo "✅ 图标类型文件是最新的"
rm .tmp-icons.d.ts
```

### 6. 文档化图标

为重要图标添加注释说明：

```json
{
  "icons": [
    {
      "code": "workflow-approve",
      "name": "审批通过",
      "value": "i-mdi:check-circle",
      "_description": "用于工作流审批通过状态图标"
    },
    {
      "code": "workflow-reject",
      "name": "审批拒绝",
      "value": "i-mdi:close-circle",
      "_description": "用于工作流审批拒绝状态图标"
    }
  ]
}
```

## 配置示例

### 小型项目配置

```typescript
// 简单配置，单一图标源
const iconsDir = 'src/assets/icons'
const outputPath = 'src/types/icons.d.ts'

// 最小化输出
const generateTypeContent = (iconData) => {
  const codes = iconData.allIcons.map(i => `'${i.code}'`).join(' | ')
  return `export type IconCode = ${codes}`
}
```

### 中型项目配置

```typescript
// 标准配置，多图标源
const iconsDirs = [
  'src/assets/icons/system',
  'src/assets/icons/business'
]

// 完整输出，包含工具函数
// 使用默认的 generateTypeContent
```

### 大型项目配置

```typescript
// 企业级配置
const config = {
  // 多目录源
  iconsDirs: [
    'src/assets/icons/system',
    'src/assets/icons/business',
    'packages/*/src/assets/icons'
  ],

  // 多输出文件
  outputs: {
    types: 'src/types/icons.d.ts',
    json: 'public/icons.json',
    stats: 'docs/icons-stats.json'
  },

  // 验证规则
  validation: {
    requireUniqueCode: true,
    requireChineseName: true,
    maxIcons: 2000
  },

  // 性能配置
  performance: {
    parallel: true,
    cache: true,
    incremental: true
  }
}
```

## 常见问题

### 1. 为什么使用 code 而不是直接用 value？

**原因**：
- `code` 是业务层面的抽象，不依赖具体图标实现
- 更换图标库时只需修改 JSON，不需要改代码
- 更短更易记忆
- 支持 Iconfont 和 Iconify 统一处理

### 2. 如何添加新的图标类型？

**步骤**：
1. 在 `parseXxxJson` 函数中添加解析逻辑
2. 定义新的接口类型
3. 在 `scanDirectory` 中添加识别逻辑
4. 更新 `generateTypeContent` 的输出模板

### 3. 图标数量太多影响性能吗？

**回答**：
- 类型生成只在构建时执行，不影响运行时
- 类型文件会被 TypeScript 缓存
- 搜索函数使用线性查找，1000+ 图标仍然很快
- 如需优化，可以考虑索引或分组

### 4. 如何支持多语言图标名称？

**方案**：

```json
{
  "code": "dashboard",
  "name": {
    "zh": "仪表盘",
    "en": "Dashboard",
    "ja": "ダッシュボード"
  },
  "value": "i-tabler:layout-dashboard"
}
```

```typescript
export const getIconName = (code: IconCode, locale = 'zh'): string => {
  const icon = ALL_ICONS.find(i => i.code === code)
  if (typeof icon?.name === 'object') {
    return icon.name[locale] || icon.name['zh'] || code
  }
  return icon?.name || code
}
```

### 5. 如何处理图标版本更新？

**建议**：
1. 使用 Git 跟踪 JSON 文件变化
2. 在提交信息中说明图标变更
3. 考虑添加 `_version` 字段
4. 使用 CHANGELOG 记录重大变更

### 6. 生成的类型文件很大怎么办？

**优化建议**：
1. 移除未使用的图标
2. 按模块分割类型文件
3. 使用 TypeScript 项目引用
4. 考虑按需加载图标数据

自动类型生成机制确保了图标使用的类型安全，提高了开发效率和代码质量。通过 Vite 插件的热更新支持，开发者可以即时看到新图标的类型提示，无需手动维护类型定义。
