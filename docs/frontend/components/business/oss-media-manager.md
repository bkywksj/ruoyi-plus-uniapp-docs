# 媒体库组件 (AOssMediaManager)

## 介绍

AOssMediaManager 是一个功能完善的对象存储服务(OSS)媒体资源管理组件,提供文件浏览、上传、预览、管理等核心功能。该组件采用对话框形式展示,集成了目录树导航、文件网格视图、多种选择模式、文件上传管理、文件操作功能、文件类型筛选、文件预览功能和无限滚动加载等特性。

**核心特性:**

- **目录树导航** - 支持目录创建、重命名、删除操作,带搜索过滤功能
- **文件网格视图** - 响应式网格布局展示文件列表,自适应不同屏幕尺寸
- **多种选择模式** - 支持单选和多选两种模式,满足不同业务场景需求
- **文件上传管理** - 拖拽上传、点击上传、进度显示、类型校验
- **文件操作功能** - 替换、移动、删除、批量操作等完整文件管理
- **文件类型筛选** - 按图片、文档、视频、音频分类筛选
- **文件预览功能** - 图片、视频、音频、PDF、文本文件在线预览
- **无限滚动加载** - IntersectionObserver 实现高性能分页加载
- **响应式设计** - 自适应 PC 端和移动端,小屏幕可折叠目录侧边栏
- **权限控制** - 集成 v-permi 指令实现细粒度操作权限控制

## 组件架构

AOssMediaManager 采用模块化架构设计,主要包含以下核心模块:

### 布局结构

```text
┌─────────────────────────────────────────────────────────────┐
│                        对话框标题栏                           │
├──────────────────────┬──────────────────────────────────────┤
│                      │  工具栏 (上传/替换/移动/删除/搜索)      │
│    目录树            │──────────────────────────────────────│
│    (可折叠)          │  筛选栏 (文件类型/排序)                │
│                      │──────────────────────────────────────│
│    - 全部            │                                      │
│    - 未分类          │        文件网格区域                    │
│    - 用户目录        │     (无限滚动 + 响应式布局)            │
│      └─ 子目录       │                                      │
│                      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│                     对话框底部按钮                            │
└─────────────────────────────────────────────────────────────┘
```

### 核心模块说明

| 模块 | 功能 | 实现方式 |
|------|------|----------|
| 目录树模块 | 目录结构展示与管理 | el-tree + 右键菜单 |
| 文件列表模块 | 文件网格展示与选择 | 响应式 Grid 布局 |
| 文件上传模块 | 文件上传与替换 | el-upload + 自定义校验 |
| 文件预览模块 | 多类型文件预览 | 条件渲染 + 原生标签 |
| 分页加载模块 | 无限滚动分页 | IntersectionObserver |

## 基本用法

### 单文件选择模式

单选模式适用于需要选择单个文件的场景,如头像上传、封面选择等。

```vue
<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">选择文件</el-button>

    <div v-if="selectedFile" class="mt-4">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文件名">{{ selectedFile.fileName }}</el-descriptions-item>
        <el-descriptions-item label="原始名称">{{ selectedFile.originalName }}</el-descriptions-item>
        <el-descriptions-item label="文件类型">{{ selectedFile.fileSuffix }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ formatFileSize(selectedFile.fileSize) }}</el-descriptions-item>
        <el-descriptions-item label="文件URL">
          <el-link :href="selectedFile.url" target="_blank" type="primary">
            {{ selectedFile.url }}
          </el-link>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :multi-select="false"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'
import { formatFileSize } from '@/utils/format'

const dialogVisible = ref(false)
const selectedFile = ref<SysOssVo | null>(null)

const handleSelect = (file: SysOssVo) => {
  selectedFile.value = file
  console.log('选中的文件:', file)
}
</script>
```

**使用说明:**

- 单选模式下 `multiSelect` 设置为 `false`(默认值)
- 选择文件后会自动关闭对话框
- `@select` 事件直接返回单个 `SysOssVo` 对象

### 多文件选择模式

多选模式适用于需要批量选择文件的场景,如图片批量上传、附件选择等。

```vue
<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">批量选择</el-button>

    <el-table v-if="selectedFiles.length" :data="selectedFiles" class="mt-4">
      <el-table-column prop="originalName" label="文件名" show-overflow-tooltip />
      <el-table-column prop="fileSuffix" label="类型" width="80" />
      <el-table-column label="大小" width="100">
        <template #default="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column label="预览" width="80">
        <template #default="{ row }">
          <el-image
            v-if="isImageFile(row.fileSuffix)"
            :src="row.url"
            :preview-src-list="[row.url]"
            style="width: 40px; height: 40px"
            fit="cover"
          />
          <el-icon v-else><Document /></el-icon>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ $index }">
          <el-button type="danger" size="small" link @click="selectedFiles.splice($index, 1)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <AOssMediaManager
      v-model="dialogVisible"
      :multi-select="true"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'
import { formatFileSize } from '@/utils/format'

const dialogVisible = ref(false)
const selectedFiles = ref<SysOssVo[]>([])

// 判断是否为图片文件
const isImageFile = (fileSuffix: string): boolean => {
  if (!fileSuffix) return false
  const imageTypes = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']
  return imageTypes.includes(fileSuffix.toLowerCase())
}

const handleSelect = (files: SysOssVo[]) => {
  selectedFiles.value = files
  console.log('选中的文件列表:', files)
}
</script>
```

**使用说明:**

- 多选模式下 `multiSelect` 设置为 `true`
- 点击文件可切换选中状态
- 需要手动点击"确认选择"按钮才会关闭对话框
- `@select` 事件返回 `SysOssVo[]` 数组

### 限制文件类型

通过 `acceptFileTypes` 属性可以限制用户只能选择和上传特定类型的文件。

```vue
<template>
  <div>
    <div class="flex gap-2 mb-4">
      <el-button @click="selectImages">只选择图片</el-button>
      <el-button @click="selectDocuments">只选择文档</el-button>
      <el-button @click="selectVideos">只选择视频</el-button>
      <el-button @click="selectAll">选择所有类型</el-button>
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :accept-file-types="acceptTypes"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dialogVisible = ref(false)
const acceptTypes = ref<string[]>([])

// 只选择图片
const selectImages = () => {
  acceptTypes.value = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  dialogVisible.value = true
}

// 只选择文档
const selectDocuments = () => {
  acceptTypes.value = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  dialogVisible.value = true
}

// 只选择视频
const selectVideos = () => {
  acceptTypes.value = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
  dialogVisible.value = true
}

// 选择所有类型
const selectAll = () => {
  acceptTypes.value = [] // 空数组表示不限制
  dialogVisible.value = true
}

const handleSelect = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

**使用说明:**

- `acceptFileTypes` 可以带或不带点号前缀,如 `['jpg']` 或 `['.jpg']`
- 设置后会影响三个方面:文件筛选选项、上传文件类型限制、文件列表过滤
- 空数组 `[]` 表示接受所有类型文件

### 限制文件大小

通过 `fileSize` 属性可以限制上传文件的最大大小。

```vue
<template>
  <div>
    <p class="mb-4 text-gray-500">
      当前限制: 最大 {{ currentLimit }}MB
    </p>

    <div class="flex gap-2 mb-4">
      <el-button @click="setLimit(2)">限制 2MB</el-button>
      <el-button @click="setLimit(5)">限制 5MB</el-button>
      <el-button @click="setLimit(10)">限制 10MB</el-button>
      <el-button @click="setLimit(50)">限制 50MB</el-button>
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :file-size="currentLimit"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dialogVisible = ref(false)
const currentLimit = ref(10) // 默认 10MB

const setLimit = (size: number) => {
  currentLimit.value = size
  dialogVisible.value = true
}

const handleSelect = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

**使用说明:**

- `fileSize` 单位为 MB,默认值为 10
- 上传时会自动校验文件大小,超出限制会提示错误
- 此限制仅针对新上传的文件,已存在的文件不受影响

### 指定默认目录

通过 `defaultDirectoryId` 属性可以指定打开对话框时默认选中的目录。

```vue
<template>
  <div>
    <el-select v-model="selectedDirId" placeholder="选择默认目录" class="mb-4">
      <el-option label="全部" :value="ALL_DIR_ID" />
      <el-option label="未分类" :value="UNCATEGORIZED_DIR_ID" />
      <el-option
        v-for="dir in directoryOptions"
        :key="dir.id"
        :label="dir.label"
        :value="dir.id"
      />
    </el-select>

    <el-button type="primary" @click="dialogVisible = true" class="ml-2">
      打开媒体库
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      :default-directory-id="selectedDirId"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getOssDirectoryTreeOptions } from '@/api/system/oss/ossDirectory/ossDirectoryApi'

// 特殊目录 ID 常量
const ALL_DIR_ID = '9999999999999999'
const UNCATEGORIZED_DIR_ID = '10000000000000000'

const dialogVisible = ref(false)
const selectedDirId = ref<string | number>(ALL_DIR_ID)
const directoryOptions = ref<any[]>([])

// 加载目录选项
onMounted(async () => {
  const [err, data] = await getOssDirectoryTreeOptions()
  if (!err && data) {
    // 扁平化目录树获取所有目录选项
    const flattenDirs = (dirs: any[], result: any[] = []): any[] => {
      for (const dir of dirs) {
        if (dir.id !== ALL_DIR_ID && dir.id !== UNCATEGORIZED_DIR_ID) {
          result.push({ id: dir.id, label: dir.directoryPath || dir.label })
        }
        if (dir.children?.length) {
          flattenDirs(dir.children, result)
        }
      }
      return result
    }
    directoryOptions.value = flattenDirs(data)
  }
})

const handleSelect = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

**使用说明:**

- 系统预设两个特殊目录: "全部"(ID: 9999999999999999) 和 "未分类"(ID: 10000000000000000)
- 设置默认目录后,打开对话框会自动选中并加载该目录的文件
- 如果指定的目录 ID 不存在,会回退到默认的"未分类"目录

### 启用文件替换功能

通过 `enableReplace` 属性可以启用文件替换功能。

```vue
<template>
  <AOssMediaManager
    v-model="dialogVisible"
    :enable-replace="true"
    @select="handleSelect"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dialogVisible = ref(false)

const handleSelect = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

**使用说明:**

- 启用后,选中单个文件时工具栏会显示"替换"按钮
- 替换文件时必须选择与原文件相同类型的文件
- 替换成功后原文件的 ossId 和 URL 保持不变,内容更新

### 控制移动功能显示

通过 `showMove` 属性可以控制是否显示移动文件功能。

```vue
<template>
  <div>
    <el-switch v-model="showMoveBtn" active-text="显示移动" inactive-text="隐藏移动" />

    <AOssMediaManager
      v-model="dialogVisible"
      :show-move="showMoveBtn"
      :multi-select="true"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dialogVisible = ref(false)
const showMoveBtn = ref(true) // 默认显示

const handleSelect = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

**使用说明:**

- 默认值为 `true`,显示移动按钮
- 设置为 `false` 后,工具栏不会显示"移动到"按钮
- 隐藏移动功能可简化界面,适用于只需要选择功能的场景

## 高级功能

### 目录树管理

目录树提供完整的目录管理功能,包括创建、重命名、删除等操作。

**目录操作功能:**

| 操作 | 触发方式 | 权限标识 |
|------|----------|----------|
| 新建顶级目录 | 点击目录区域标题栏"新建"按钮 | `system:ossDirectory:add` |
| 新建子目录 | 悬停目录节点,点击"+"图标 | `system:ossDirectory:add` |
| 重命名目录 | 悬停目录节点,点击编辑图标 | `system:ossDirectory:update` |
| 删除目录 | 悬停目录节点,点击删除图标 | `system:ossDirectory:delete` |

**目录搜索过滤:**

```vue
<template>
  <!-- 目录树内部已集成搜索功能 -->
  <AOssMediaManager v-model="dialogVisible" />
</template>
```

目录树顶部提供搜索输入框,输入关键词可实时过滤目录节点。过滤逻辑会匹配目录名称(label)和目录路径(directoryPath)。

**目录节点展开状态:**

目录树会自动记录展开的节点,切换目录或重新加载时保持展开状态不变。

### 文件上传管理

文件上传支持多种方式和完整的校验机制。

**上传方式:**

1. **点击上传** - 点击"上传文件"按钮选择文件
2. **多文件上传** - 支持同时选择多个文件上传
3. **替换上传** - 选中单个文件后点击"替换"按钮

**上传校验:**

```typescript
// 上传前校验逻辑
const beforeFileUpload = (file: File) => {
  // 1. 文件大小限制
  const maxSize = props.fileSize * 1024 * 1024
  if (file.size > maxSize) {
    showMsgError(`文件大小不能超过${props.fileSize}MB`)
    return false
  }

  // 2. 替换操作时校验文件类型一致性
  if (uploadDialog.value.type === 'replace' && fileToReplace.value) {
    const newFileSuffix = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    const oldFileSuffix = fileToReplace.value.fileSuffix.toLowerCase()
    if (newFileSuffix !== oldFileSuffix) {
      showMsgError(`替换文件类型必须与原文件类型一致`)
      return false
    }
  }

  // 3. 文件类型限制
  if (props.acceptFileTypes && props.acceptFileTypes.length > 0) {
    const fileSuffix = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    const isAcceptType = props.acceptFileTypes.some(type => {
      const acceptType = type.startsWith('.') ? type.toLowerCase() : '.' + type.toLowerCase()
      return fileSuffix === acceptType
    })
    if (!isAcceptType) {
      showMsgError(`文件类型必须是 ${props.acceptFileTypes.join('/')} 格式`)
      return false
    }
  }

  return true
}
```

**上传 URL 动态生成:**

```typescript
// 根据操作类型和当前目录动态生成上传URL
const getUploadUrl = computed(() => {
  let url
  if (uploadDialog.value.type === 'replace' && fileToReplace.value) {
    // 替换操作使用专用接口
    url = `${baseUrl}/resource/oss/replace/${fileToReplace.value.ossId}`
  } else {
    // 普通上传,附加目录ID参数
    url = uploadUrl.value
    if (currentDirectory.value &&
        currentDirectory.value.id !== ALL.value &&
        currentDirectory.value.id !== UNCATEGORIZED.value) {
      url += `?directoryId=${currentDirectory.value.id}`
    }
  }
  return url
})
```

### 文件预览功能

组件支持多种文件类型的在线预览。

| 文件类型 | 预览方式 | 支持格式 |
|---------|---------|----------|
| 图片 | `el-image` 组件,支持缩放旋转 | png, jpg, jpeg, gif, webp, svg, bmp |
| 视频 | `<video>` 标签播放 | mp4, avi, mov, wmv, flv, mkv |
| 音频 | `<audio>` 标签播放 | mp3, wav, ogg, flac, aac |
| PDF | `<iframe>` 嵌入显示 | pdf |
| 文本 | `<pre>` 标签显示内容 | txt, json, xml, md, csv, log, html, css, js |
| 其他 | 显示文件信息,提供下载 | 其他所有格式 |

**预览触发方式:**

- 双击文件卡片打开预览对话框
- 预览对话框支持关闭按钮和点击遮罩关闭

**文本文件预览:**

```typescript
// 文本文件自动加载(小于100KB)
const handleFilePreview = (file: SysOssVo) => {
  previewFile.value = file
  textPreviewContent.value = ''
  previewDialogVisible.value = true

  // 小于100KB的文本文件自动加载
  if (isTextFile(file.fileSuffix) && file.fileSize && file.fileSize < 100 * 1024) {
    loadTextPreview(file)
  }
}

// 加载文本内容
const loadTextPreview = async (file: any) => {
  try {
    textPreviewContent.value = '加载中...'
    const response = await fetch(file.url)
    const text = await response.text()
    textPreviewContent.value = text
  } catch (error) {
    textPreviewContent.value = '无法加载文件内容，请下载后查看。'
  }
}
```

### 文件类型筛选

组件提供多种文件类型筛选选项。

**内置文件类型分类:**

```typescript
const fileTypeMap = {
  image: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'],
  document: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt'],
  video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
  audio: ['.mp3', '.wav', '.ogg', '.flac', '.aac'],
  all: [],
  other: []
}
```

**智能筛选选项显示:**

当设置 `acceptFileTypes` 时,筛选下拉框只显示与接受类型相关的选项:

```typescript
const showFileTypeOption = (typeGroup: 'image' | 'document' | 'video' | 'audio' | 'other'): boolean => {
  // 没有限制时显示所有选项
  if (!props.acceptFileTypes || props.acceptFileTypes.length === 0) {
    return true
  }

  // 检查是否有任何该组的文件类型在接受的类型列表中
  const typeList = fileTypeMap[typeGroup]
  return typeList.some(type => acceptTypesNormalized.includes(type))
}
```

### 排序功能

文件列表支持多种排序方式。

**可用排序选项:**

| 排序方式 | 字段 | 顺序 |
|----------|------|------|
| 按更新时间(最新) | updateTime | desc |
| 按更新时间(最旧) | updateTime | asc |
| 按文件名(A-Z) | originalName | asc |
| 按文件名(Z-A) | originalName | desc |
| 按文件大小(从小到大) | fileSize | asc |
| 按文件大小(从大到小) | fileSize | desc |
| 按文件类型(A-Z) | fileSuffix | asc |
| 按文件类型(Z-A) | fileSuffix | desc |

**使用示例:**

排序功能通过下拉菜单触发,切换排序方式会自动重新加载文件列表。

### 无限滚动加载

组件使用 IntersectionObserver 实现高性能的无限滚动分页加载。

**实现原理:**

```typescript
// 初始化无限滚动观察器
const setupInfiniteScroll = () => {
  loadMoreObserver.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting && !isLoadingMore.value && !isLoading.value) {
        if (files.value.length < pagination.value.total) {
          loadMoreFiles()
        }
      }
    },
    {
      threshold: 0.1,
      root: fileScrollbarRef.value?.$el,
      rootMargin: '200px 0px' // 提前200px触发加载
    }
  )
}
```

**性能优化:**

- 使用防抖机制(300ms)避免频繁请求
- 提前200px触发加载,提升用户体验
- 自动判断是否已加载全部数据
- 观察器在对话框关闭时断开连接

### 响应式设计

组件针对不同屏幕尺寸进行了优化。

**屏幕尺寸判断:**

```typescript
const updateScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 768
  // 大屏幕下总是显示侧边栏
  if (!isSmallScreen.value) {
    sidebarVisible.value = true
  }
}
```

**小屏幕适配:**

- 目录树变为可折叠侧边栏
- 提供切换按钮显示/隐藏目录
- 目录节点操作按钮收缩为下拉菜单
- 文件网格列数自适应减少

**响应式网格布局:**

```scss
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .responsive-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.25rem;
  }
}
```

### 预签名 URL 处理

组件智能处理各种云存储服务的预签名 URL。

```typescript
// 判断URL是否已经是预签名URL
const isPresignedUrl = (url: string): boolean => {
  if (!url) return false

  return (
    url.includes('X-Amz-Algorithm') ||    // AWS S3/MinIO
    url.includes('X-Amz-Signature') ||    // AWS S3/MinIO
    url.includes('OSSAccessKeyId') ||     // 阿里云OSS
    url.includes('q-sign-algorithm') ||   // 腾讯云COS
    url.includes('e=') && url.includes('token=') || // 七牛云
    url.includes('Expires') && url.includes('Signature') // 华为云OBS
  )
}

// 获取带缓存参数的图片地址
const getImageSrcWithCache = (file: SysOssVo): string => {
  if (!file.url) return ''

  // 预签名URL直接返回,不添加缓存参数
  if (isPresignedUrl(file.url)) {
    return file.url
  }

  // 非预签名URL添加缓存参数
  const separator = file.url.includes('?') ? '&' : '?'
  return `${file.url}${separator}t=${file.updateTime || Date.now()}`
}
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 控制对话框显示隐藏(v-model) | `boolean` | `false` |
| multiSelect | 是否启用多选模式 | `boolean` | `false` |
| fileSize | 上传文件大小限制,单位 MB | `number` | `10` |
| showMove | 是否显示移动文件按钮 | `boolean` | `true` |
| defaultDirectoryId | 默认选中的目录 ID | `number \| string \| null` | `null` |
| acceptFileTypes | 允许的文件类型列表 | `string[]` | `[]` |
| enableReplace | 是否启用文件替换功能 | `boolean` | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 对话框显示状态改变时触发 | `(value: boolean) => void` |
| select | 确认选择文件时触发 | 单选模式: `(file: SysOssVo) => void`<br>多选模式: `(files: SysOssVo[]) => void` |
| cancel | 取消选择时触发 | `() => void` |

### 类型定义

```typescript
/**
 * OSS 媒体管理器组件属性
 */
interface AOssMediaManagerProps {
  /** 控制对话框是否显示 */
  modelValue: boolean
  /** 是否支持多选 */
  multiSelect?: boolean
  /** 限制文件大小(MB) */
  fileSize?: number
  /** 是否显示移动文件功能 */
  showMove?: boolean
  /** 默认选中的目录ID */
  defaultDirectoryId?: number | string | null
  /** 接受的文件类型 */
  acceptFileTypes?: string[]
  /** 是否启用替换功能 */
  enableReplace?: boolean
}

/**
 * OSS 文件视图对象
 */
interface SysOssVo {
  /** 文件ID */
  ossId: string | number
  /** 所属目录ID */
  directoryId: string | number
  /** 存储后的文件名 */
  fileName: string
  /** 原始文件名 */
  originalName: string
  /** 文件后缀 */
  fileSuffix: string
  /** 文件大小(字节) */
  fileSize: number
  /** 文件访问URL */
  url: string
  /** 创建时间 */
  createTime?: string
  /** 创建者 */
  createBy?: string
  /** 更新时间 */
  updateTime?: string
  /** 更新者 */
  updateBy?: string
}

/**
 * OSS 目录树视图对象
 */
interface SysOssDirectoryTreeVo {
  /** 目录ID */
  id: number | string
  /** 目录显示名称 */
  label: string
  /** 父目录ID */
  parentId: number | string
  /** 排序权重 */
  weight: number
  /** 子目录列表 */
  children: SysOssDirectoryTreeVo[]
  /** 完整目录路径 */
  directoryPath: string
}

/**
 * OSS 目录业务对象
 */
interface SysOssDirectoryBo {
  /** 目录ID(编辑时使用) */
  directoryId?: number | string
  /** 父目录ID */
  parentId?: number | string
  /** 目录名称 */
  directoryName: string
}

/**
 * 文件类型分类
 */
type FileTypeCategory = 'all' | 'image' | 'document' | 'video' | 'audio' | 'other'

/**
 * 排序配置
 */
interface SortConfig {
  /** 排序字段 */
  orderByColumn: string
  /** 排序方向 */
  isAsc: 'asc' | 'desc'
}

/**
 * 分页配置
 */
interface PaginationConfig {
  /** 当前页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 总记录数 */
  total: number
}
```

### 权限标识

| 权限标识 | 说明 |
|----------|------|
| `system:oss:upload` | 文件上传权限 |
| `system:ossDirectory:add` | 新建目录权限 |
| `system:ossDirectory:update` | 编辑目录权限 |
| `system:ossDirectory:delete` | 删除目录权限 |

## 主题定制

### CSS 变量

组件使用 Element Plus 的 CSS 变量体系,可通过覆盖以下变量实现主题定制:

```scss
// 在全局样式或组件样式中覆盖
.a-oss-media-manager {
  // 目录树相关
  --oss-tree-width: 240px;
  --oss-tree-bg: var(--el-bg-color);
  --oss-tree-border: var(--el-border-color);

  // 文件卡片相关
  --oss-card-width: 150px;
  --oss-card-gap: 16px;
  --oss-card-bg: var(--el-fill-color-light);
  --oss-card-hover-bg: var(--el-fill-color);
  --oss-card-selected-border: var(--el-color-primary);

  // 工具栏相关
  --oss-toolbar-height: 60px;

  // 容器高度
  --oss-container-height: 65vh;
  --oss-container-min-height: 400px;
  --oss-container-max-height: 90vh;
}
```

### 样式覆盖示例

```scss
// 自定义文件卡片样式
.responsive-grid > div {
  .border {
    border-radius: 12px;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
  }
}

// 自定义目录树样式
.directory-tree {
  .el-tree-node__content {
    height: 36px;
    border-radius: 6px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}

// 自定义选中状态
.ring-2 {
  ring-color: var(--el-color-success);
  ring-width: 3px;
}
```

### 暗黑模式

组件自动适配 Element Plus 的暗黑模式,无需额外配置:

```typescript
// main.ts 中启用暗黑模式
import 'element-plus/theme-chalk/dark/css-vars.css'

// 切换暗黑模式
document.documentElement.classList.toggle('dark')
```

## 最佳实践

### 1. 合理规划目录结构

为不同类型的文件创建清晰的目录结构,便于管理和查找:

```text
/
├── users/          # 用户相关
│   ├── avatars/    # 用户头像
│   └── documents/  # 用户文档
├── products/       # 商品相关
│   ├── images/     # 商品图片
│   └── videos/     # 商品视频
├── articles/       # 文章相关
│   ├── covers/     # 文章封面
│   └── content/    # 文章内容图片
├── system/         # 系统相关
│   ├── icons/      # 系统图标
│   └── banners/    # 轮播图
└── temp/           # 临时文件
```

### 2. 合理使用文件类型限制

根据业务场景设置合适的文件类型限制:

```vue
<template>
  <!-- 头像上传：只允许图片，限制 2MB -->
  <AOssMediaManager
    v-model="avatarDialogVisible"
    :accept-file-types="['jpg', 'jpeg', 'png', 'gif']"
    :file-size="2"
    :multi-select="false"
    @select="handleAvatarSelect"
  />

  <!-- 文档上传：允许多种文档格式，限制 20MB -->
  <AOssMediaManager
    v-model="documentDialogVisible"
    :accept-file-types="['pdf', 'doc', 'docx', 'xls', 'xlsx']"
    :file-size="20"
    :multi-select="true"
    @select="handleDocumentSelect"
  />

  <!-- 视频上传：只允许视频，限制 100MB -->
  <AOssMediaManager
    v-model="videoDialogVisible"
    :accept-file-types="['mp4', 'avi', 'mov']"
    :file-size="100"
    :multi-select="false"
    @select="handleVideoSelect"
  />
</template>
```

### 3. 正确处理文件选择结果

根据不同的选择模式正确处理返回结果:

```typescript
// 单文件选择 - 直接使用文件对象
const handleSingleSelect = (file: SysOssVo) => {
  // 获取文件URL用于表单
  form.value.cover = file.url
  form.value.coverName = file.originalName

  // 触发表单验证
  formRef.value?.validateField('cover')
}

// 多文件选择 - 处理文件数组
const handleMultiSelect = (files: SysOssVo[]) => {
  // 追加到现有列表
  const newImages = files.map(file => ({
    url: file.url,
    name: file.originalName,
    ossId: file.ossId
  }))
  form.value.images.push(...newImages)

  // 或替换现有列表
  form.value.attachments = files.map(file => file.url)
}

// 处理取消选择
const handleCancel = () => {
  console.log('用户取消了选择')
}
```

### 4. 与表单组件集成

将媒体库组件与表单无缝集成:

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    <el-form-item label="封面图" prop="cover" required>
      <div class="cover-container">
        <div v-if="form.cover" class="cover-preview">
          <el-image :src="form.cover" fit="cover" class="w-32 h-32" />
          <div class="cover-actions">
            <el-button size="small" @click="selectCover">更换</el-button>
            <el-button size="small" type="danger" @click="removeCover">删除</el-button>
          </div>
        </div>
        <el-button v-else @click="selectCover" class="upload-btn">
          <el-icon><Plus /></el-icon>
          选择封面
        </el-button>
      </div>
    </el-form-item>

    <el-form-item label="图片列表" prop="images">
      <div class="images-container">
        <div v-for="(img, index) in form.images" :key="index" class="image-item">
          <el-image :src="img" fit="cover" class="w-24 h-24" />
          <el-button
            type="danger"
            size="small"
            circle
            class="remove-btn"
            @click="form.images.splice(index, 1)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <el-button @click="selectImages" class="add-btn">
          <el-icon><Plus /></el-icon>
          添加图片
        </el-button>
      </div>
    </el-form-item>
  </el-form>

  <!-- 封面选择器 -->
  <AOssMediaManager
    v-model="coverDialogVisible"
    :accept-file-types="['jpg', 'jpeg', 'png']"
    :file-size="2"
    :multi-select="false"
    @select="handleCoverSelect"
  />

  <!-- 图片列表选择器 -->
  <AOssMediaManager
    v-model="imagesDialogVisible"
    :accept-file-types="['jpg', 'jpeg', 'png', 'gif']"
    :file-size="5"
    :multi-select="true"
    @select="handleImagesSelect"
  />
</template>

<script lang="ts" setup>
const formRef = ref()
const form = ref({
  cover: '',
  images: [] as string[]
})

const coverDialogVisible = ref(false)
const imagesDialogVisible = ref(false)

const selectCover = () => {
  coverDialogVisible.value = true
}

const removeCover = () => {
  form.value.cover = ''
}

const selectImages = () => {
  imagesDialogVisible.value = true
}

const handleCoverSelect = (file: SysOssVo) => {
  form.value.cover = file.url
  formRef.value?.validateField('cover')
}

const handleImagesSelect = (files: SysOssVo[]) => {
  const urls = files.map(f => f.url)
  form.value.images.push(...urls)
}
</script>
```

### 5. 封装业务组件

将常用的媒体选择场景封装为业务组件:

```vue
<!-- ImagePicker.vue -->
<template>
  <div class="image-picker">
    <div v-if="modelValue" class="preview">
      <el-image :src="modelValue" fit="cover" />
      <div class="actions">
        <el-button size="small" @click="handleChange">更换</el-button>
        <el-button size="small" type="danger" @click="handleClear">删除</el-button>
      </div>
    </div>
    <el-button v-else @click="handleSelect">
      <el-icon><Plus /></el-icon>
      选择图片
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      :accept-file-types="['jpg', 'jpeg', 'png', 'gif', 'webp']"
      :file-size="fileSize"
      :multi-select="false"
      @select="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  modelValue?: string
  fileSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  fileSize: 5
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)

const handleSelect = () => {
  dialogVisible.value = true
}

const handleChange = () => {
  dialogVisible.value = true
}

const handleClear = () => {
  emit('update:modelValue', '')
}

const handleConfirm = (file: SysOssVo) => {
  emit('update:modelValue', file.url)
}
</script>
```

## 常见问题

### 1. 文件上传后列表未刷新

**问题原因:**

- 上传成功回调未正确触发刷新
- 网络延迟导致刷新过早

**解决方案:**

```typescript
const handleUploadSuccess = async (response: any, file: any) => {
  if (response.code === 200) {
    showMsgSuccess('上传成功')
    uploadDialogVisible.value = false

    // 重置分页并重新加载
    await loadFiles(true)
  } else {
    showMsgError(response.msg || '上传失败')
  }
}
```

### 2. 大文件上传超时

**问题原因:**

- 前端请求超时设置过短
- 后端文件大小限制不足

**解决方案:**

```typescript
// 前端：设置较长超时时间(在 axios 配置中)
const service = axios.create({
  timeout: 5 * 60 * 1000 // 5分钟
})
```

```yaml
# 后端配置 application.yml
spring:
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB
```

### 3. 文件预览加载失败

**问题原因:**

- 文件 URL 不可访问
- CORS 跨域问题
- 预签名 URL 过期

**解决方案:**

```vue
<template>
  <el-image :src="file.url" @error="handleImageError">
    <template #error>
      <div class="image-error">
        <el-icon><Picture /></el-icon>
        <p>图片加载失败</p>
        <el-button size="small" @click="downloadFile(file)">下载查看</el-button>
      </div>
    </template>
  </el-image>
</template>

<script lang="ts" setup>
const handleImageError = () => {
  console.warn('图片加载失败,可能是URL过期或网络问题')
}

const downloadFile = (file: SysOssVo) => {
  const a = document.createElement('a')
  a.href = file.url
  a.download = file.originalName
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>
```

### 4. 多选模式下无法取消选择

**问题原因:**

- 点击事件处理逻辑不正确

**解决方案:**

组件内部已正确实现选择切换逻辑:

```typescript
const toggleFileSelection = (file: SysOssVo, event: MouseEvent) => {
  const isSelected = isFileSelected(file)

  if (props.multiSelect) {
    // 多选模式：切换选择状态
    if (isSelected) {
      removeSelection(file)
    } else {
      addSelection(file)
    }
  } else {
    // 单选模式：清空后选择当前
    clearSelection()
    addSelection(file)
  }
}
```

### 5. 目录树展开状态未保存

**问题原因:**

- 页面刷新后状态丢失
- 未持久化展开节点

**解决方案:**

可以扩展实现本地存储:

```typescript
// 从本地存储加载展开状态
onMounted(() => {
  const saved = localStorage.getItem('oss-tree-expanded-keys')
  if (saved) {
    expandedKeys.value = JSON.parse(saved)
  }
})

// 节点展开时保存状态
const handleNodeExpand = (data: any) => {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value.push(data.id)
    localStorage.setItem('oss-tree-expanded-keys', JSON.stringify(expandedKeys.value))
  }
}

// 节点折叠时更新状态
const handleNodeCollapse = (data: any) => {
  const index = expandedKeys.value.indexOf(data.id)
  if (index !== -1) {
    expandedKeys.value.splice(index, 1)
    localStorage.setItem('oss-tree-expanded-keys', JSON.stringify(expandedKeys.value))
  }
}
```

### 6. 替换文件时类型校验失败

**问题原因:**

- 新文件类型与原文件不一致

**解决方案:**

替换功能要求新文件与原文件类型相同,这是设计如此:

```typescript
// 替换前校验
if (uploadDialog.value.type === 'replace' && fileToReplace.value) {
  const newFileSuffix = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  const oldFileSuffix = fileToReplace.value.fileSuffix.toLowerCase()

  if (newFileSuffix !== oldFileSuffix) {
    showMsgError(`替换文件类型必须与原文件类型一致，原文件类型：${oldFileSuffix}，新文件类型：${newFileSuffix}`)
    return false
  }
}
```

如果需要更换为不同类型的文件,应使用删除+上传的方式。

### 7. 移动端目录侧边栏显示问题

**问题原因:**

- 小屏幕下侧边栏遮挡内容

**解决方案:**

组件已内置响应式处理:

```typescript
const updateScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 768
  // 大屏幕下总是显示侧边栏
  if (!isSmallScreen.value) {
    sidebarVisible.value = true
  }
}

// 切换侧边栏
const toggleDirectorySidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}
```

小屏幕下会显示"显示目录/隐藏目录"切换按钮。

### 8. 无限滚动不触发

**问题原因:**

- 容器高度设置不正确
- IntersectionObserver 根元素配置错误

**解决方案:**

确保滚动容器有固定高度:

```scss
.el-scrollbar {
  min-height: 300px;
  height: 450px;
  overflow: auto !important;
}

.load-more-trigger {
  height: 50px;
  visibility: visible !important;
}
```

### 9. 文件搜索无结果

**问题原因:**

- 搜索关键词不匹配
- 当前目录下没有匹配文件

**解决方案:**

搜索功能搜索的是 `originalName` 字段,注意:

- 搜索范围是当前选中目录下的文件
- 如果要全局搜索,需要先切换到"全部"目录
- 搜索时会自动重置分页

### 10. 权限按钮不显示

**问题原因:**

- 用户没有对应权限
- v-permi 指令未正确配置

**解决方案:**

确保用户拥有以下权限:

```typescript
// 检查权限
const { hasPermission } = useAuth()

// 权限列表
const permissions = [
  'system:oss:upload',        // 上传权限
  'system:ossDirectory:add',   // 新建目录
  'system:ossDirectory:update', // 编辑目录
  'system:ossDirectory:delete'  // 删除目录
]

// 验证是否拥有权限
permissions.forEach(perm => {
  console.log(`${perm}: ${hasPermission(perm)}`)
})
```

## 总结

AOssMediaManager 核心要点:

1. **选择模式** - 通过 `multiSelect` 控制单选/多选,单选自动确认,多选需手动确认
2. **文件限制** - `acceptFileTypes` 限制类型,`fileSize` 限制大小,影响筛选和上传
3. **目录导航** - `defaultDirectoryId` 指定默认目录,支持创建/重命名/删除操作
4. **文件操作** - `showMove` 控制移动功能,`enableReplace` 控制替换功能
5. **事件处理** - `@select` 获取选中文件,`@cancel` 处理取消操作
6. **响应式** - 自动适配 PC/移动端,小屏幕可折叠目录侧边栏
7. **权限控制** - 通过 v-permi 指令实现操作按钮的权限控制
8. **性能优化** - IntersectionObserver 实现无限滚动,防抖处理请求

