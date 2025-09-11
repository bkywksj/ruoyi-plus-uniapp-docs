# AOssMediaManager 媒体库组件

OSS媒体库管理器组件，提供完整的OSS文件管理界面，整合文件目录树、文件列表和各种操作功能。适用于需要进行OSS文件管理的场景，如内容管理系统、媒体库等。

## 基础用法

最简单的使用方式：

```vue
<template>
  <div>
    <el-button @click="openMediaManager">打开媒体库</el-button>
    <AOssMediaManager
      v-model="showMediaManager"
      @select="handleFileSelect"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showMediaManager = ref(false)

const openMediaManager = () => {
  showMediaManager.value = true
}

const handleFileSelect = (selectedFiles) => {
  console.log('选中的文件：', selectedFiles)
}

const handleCancel = () => {
  console.log('用户取消选择')
}
</script>
```

## 多选模式

支持选择多个文件：

```vue
<template>
  <AOssMediaManager
    v-model="visible"
    :multi-select="true"
    @select="handleMultiSelect"
  />
</template>

<script setup>
const handleMultiSelect = (files) => {
  console.log(`选中了 ${files.length} 个文件：`, files)
}
</script>
```

## 文件类型限制

限制可选择的文件类型：

```vue
<template>
  <!-- 只允许选择图片文件 -->
  <AOssMediaManager
    v-model="visible"
    :accept-file-types="['jpg', 'jpeg', 'png', 'gif', 'webp']"
    @select="handleImageSelect"
  />
</template>

<script setup>
const handleImageSelect = (imageFiles) => {
  console.log('选中的图片：', imageFiles)
}
</script>
```

## 指定默认目录

设置默认选中的目录：

```vue
<template>
  <AOssMediaManager
    v-model="visible"
    :default-directory-id="123"
    @select="handleSelect"
  />
</template>
```

## 自定义文件大小限制

设置上传文件的大小限制：

```vue
<template>
  <AOssMediaManager
    v-model="visible"
    :file-size="50"
    @select="handleSelect"
  />
</template>
```

## 禁用文件移动功能

某些场景下不需要文件移动功能：

```vue
<template>
  <AOssMediaManager
    v-model="visible"
    :show-move="false"
    @select="handleSelect"
  />
</template>
```

## 禁用文件替换功能

禁用文件替换功能：

```vue
<template>
  <AOssMediaManager
    v-model="visible"
    :enable-replace="false"
    @select="handleSelect"
  />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value | 控制对话框是否显示 | `boolean` | — | `false` |
| multi-select | 是否支持多选 | `boolean` | — | `false` |
| file-size | 限制文件大小（MB） | `number` | — | `10` |
| show-move | 是否显示移动文件功能 | `boolean` | — | `true` |
| default-directory-id | 默认选中的目录ID | `number \| string \| null` | — | `null` |
| accept-file-types | 接受的文件类型 | `string[]` | — | `[]` |
| enable-replace | 是否启用替换功能 | `boolean` | — | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 对话框显示状态变化 | `(visible: boolean)` |
| select | 文件选择确认 | `(files: SysOssVo \| SysOssVo[])` |
| cancel | 取消选择 | `()` |

### 文件对象接口

```typescript
interface SysOssVo {
  /** OSS文件ID */
  ossId: string
  /** 文件名 */
  fileName: string
  /** 原始文件名 */
  originalName: string
  /** 文件后缀 */
  fileSuffix: string
  /** 文件URL */
  url: string
  /** 文件大小（字节） */
  fileSize: number
  /** 目录ID */
  directoryId?: number | string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}
```

## 功能特性

### 目录管理
- **目录树结构**：支持多级目录的树形展示
- **目录搜索**：实时搜索过滤目录
- **目录操作**：新建、重命名、删除目录
- **响应式布局**：小屏幕下自动折叠目录侧边栏

### 文件管理
- **网格视图**：文件以网格形式展示，支持预览缩略图
- **文件搜索**：按文件名实时搜索
- **文件类型过滤**：按图片、文档、视频、音频等类型过滤
- **排序功能**：支持按时间、文件名、大小、类型排序
- **无限滚动**：大量文件时的分页加载优化

### 文件操作
- **文件预览**：支持图片、视频、音频、PDF、文本文件的预览
- **文件上传**：拖拽或点击上传，支持批量上传
- **文件替换**：替换现有文件
- **文件移动**：在目录间移动文件
- **批量删除**：支持批量选择和删除

### 交互体验
- **响应式设计**：适配各种屏幕尺寸
- **快捷操作**：右键菜单、快捷键支持
- **状态保持**：跨页面保持选择状态
- **错误处理**：完善的错误提示和处理

## 权限控制

组件内置权限控制，需要配置相应的权限：

- `system:ossDirectory:add` - 新建目录
- `system:ossDirectory:update` - 重命名目录
- `system:ossDirectory:delete` - 删除目录
- `system:oss:upload` - 上传文件

## 响应式设计

组件针对不同屏幕尺寸进行了优化：

- **大屏幕（≥768px）**：目录树和文件列表并排显示
- **小屏幕（<768px）**：目录树可折叠，通过按钮切换显示
- **文件网格**：根据屏幕宽度自动调整列数

## 文件类型支持

### 支持预览的文件类型

- **图片**：`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.svg`
- **视频**：`.mp4`, `.avi`, `.mov`, `.wmv`, `.flv`, `.mkv`
- **音频**：`.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`
- **文档**：`.pdf`
- **文本**：`.txt`, `.json`, `.xml`, `.md`, `.csv`, `.log`, `.html`, `.css`, `.js`

### 文件类型过滤

组件支持按文件类型进行过滤：
- 图片类型
- 文档类型（Office文档、PDF等）
- 视频类型
- 音频类型
- 其他类型

## 注意事项

1. **权限要求**：确保用户具有相应的OSS操作权限
2. **文件大小**：默认限制单文件10MB，可通过`file-size`属性调整
3. **网络状况**：大文件上传时注意网络稳定性
4. **浏览器兼容**：现代浏览器支持，IE需要额外兼容处理
5. **移动端**：触摸设备上的操作体验已优化
