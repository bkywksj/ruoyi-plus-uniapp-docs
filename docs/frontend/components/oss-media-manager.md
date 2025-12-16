# 媒体库组件 (AOssMediaManager)

## 介绍

AOssMediaManager 是一个功能完善的对象存储服务(OSS)媒体资源管理组件,为系统提供了强大的文件管理能力。该组件采用弹窗形式展示,集成了目录树导航、文件网格视图、文件上传下载、文件预览等核心功能,支持图片、文档、视频、音频等多种文件类型的统一管理。组件基于 Element Plus 的 Dialog 和 Tree 组件构建,结合 Vue 3 Composition API 实现了高性能的响应式交互体验。

该组件特别适用于内容管理系统、文档管理系统、资源库系统等需要统一管理大量媒体文件的应用场景。通过目录树可以方便地组织文件结构,通过文件网格视图可以直观地浏览和选择文件,通过无限滚动加载机制可以高效处理海量文件数据。

**核心特性:**

- **目录树导航** - 提供完整的目录树结构,支持目录的创建、重命名、删除操作,支持拖拽排序和层级管理,可快速定位和切换不同目录
- **文件网格视图** - 采用响应式网格布局展示文件列表,每个文件卡片显示缩略图、文件名、大小、上传时间等信息,支持自适应不同屏幕尺寸
- **多种选择模式** - 支持单选和多选两种模式,单选模式下点击文件即可选中,多选模式下可通过复选框批量选择文件
- **文件上传管理** - 集成 Element Plus Upload 组件,支持拖拽上传、点击上传,支持文件类型限制和大小限制,提供上传进度显示
- **文件操作功能** - 提供文件替换、移动、删除等常用操作,支持批量操作,所有操作都有二次确认提示保障数据安全
- **文件类型筛选** - 支持按文件类型筛选,包括图片、文档、视频、音频、其他五大类型,方便快速定位目标文件
- **文件预览功能** - 内置文件预览对话框,支持图片、视频、音频的在线预览,支持 PDF、文本文件的查看,提供下载和替换操作入口
- **无限滚动加载** - 基于 IntersectionObserver API 实现高性能的无限滚动,自动加载更多文件,避免一次性加载大量数据导致的性能问题
- **响应式设计** - 针对小屏幕设备优化,在移动端提供侧边栏折叠功能,确保在不同设备上都有良好的使用体验
- **搜索过滤功能** - 支持按文件名搜索过滤,实时更新文件列表,方便在大量文件中快速查找目标文件

组件采用 TypeScript 开发,提供完整的类型定义,配合 Pinia 状态管理和组合式 API,代码结构清晰,易于维护和扩展。所有 API 调用都遵循统一的 `Result<T>` 错误处理模式,确保异常情况的优雅处理。

## 基本用法

### 单文件选择模式

最基本的用法是在单选模式下选择单个文件。组件通过 `v-model` 控制显示隐藏,通过 `@confirm` 事件获取用户选择的文件。

```vue
<template>
  <div class="demo-container">
    <el-button type="primary" @click="openMediaManager">
      选择文件
    </el-button>

    <div v-if="selectedFile" class="selected-info">
      <p>已选择文件: {{ selectedFile.fileName }}</p>
      <p>文件大小: {{ formatFileSize(selectedFile.fileSize) }}</p>
      <p>文件 URL: {{ selectedFile.url }}</p>
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :multi-select="false"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

// 控制对话框显示
const dialogVisible = ref(false)

// 存储选中的文件
const selectedFile = ref<SysOssVo | null>(null)

// 打开媒体库
const openMediaManager = () => {
  dialogVisible.value = true
}

// 处理文件选择确认
const handleConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0]
    ElMessage.success('文件选择成功')
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
</script>

```

**使用说明:**

- 使用 `v-model` 双向绑定控制组件的显示和隐藏
- 设置 `:multi-select="false"` 启用单选模式
- 监听 `@confirm` 事件获取用户选择的文件数组
- 单选模式下数组只包含一个元素,通过 `files[0]` 获取
- `SysOssVo` 接口包含文件的完整信息,包括文件名、URL、大小等

### 多文件选择模式

在需要批量选择文件的场景下,可以启用多选模式。用户可以通过复选框选择多个文件。

```vue
<template>
  <div class="demo-container">
    <el-button type="primary" @click="openMediaManager">
      批量选择文件
    </el-button>

    <div v-if="selectedFiles.length > 0" class="selected-list">
      <h4>已选择 {{ selectedFiles.length }} 个文件:</h4>
      <el-table :data="selectedFiles" style="width: 100%">
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="fileSuffix" label="类型" width="80" />
        <el-table-column label="大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ $index }">
            <el-button
              type="danger"
              size="small"
              link
              @click="removeFile($index)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :multi-select="true"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const selectedFiles = ref<SysOssVo[]>([])

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  selectedFiles.value = files
  ElMessage.success(`成功选择 ${files.length} 个文件`)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
</script>

```

**使用说明:**

- 设置 `:multi-select="true"` 启用多选模式
- 多选模式下文件卡片会显示复选框,用户可以勾选多个文件
- `@confirm` 事件回调中的 `files` 参数是包含所有选中文件的数组
- 可以结合 El-Table 组件展示选中的文件列表,方便用户查看和管理
- 支持后续移除已选择的文件,实现灵活的文件管理

### 限制文件类型

通过 `accept-file-types` 属性可以限制用户只能选择特定类型的文件,组件会自动过滤文件列表。

```vue
<template>
  <div class="demo-container">
    <div class="button-group">
      <el-button type="primary" @click="selectImages">
        只选择图片
      </el-button>
      <el-button type="success" @click="selectDocuments">
        只选择文档
      </el-button>
      <el-button type="warning" @click="selectVideos">
        只选择视频
      </el-button>
    </div>

    <div v-if="selectedFile" class="selected-info">
      <p>文件名: {{ selectedFile.fileName }}</p>
      <p>文件类型: {{ selectedFile.fileSuffix }}</p>
      <img
        v-if="isImage(selectedFile)"
        :src="selectedFile.url"
        alt="预览"
        class="preview-image"
      />
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :accept-file-types="acceptTypes"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const acceptTypes = ref<string[]>([])
const selectedFile = ref<SysOssVo | null>(null)

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

const handleConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const isImage = (file: SysOssVo): boolean => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(
    file.fileSuffix.toLowerCase()
  )
}
</script>

```

**使用说明:**

- `accept-file-types` 属性接受文件扩展名数组,如 `['jpg', 'png', 'pdf']`
- 组件会根据文件的 `fileSuffix` 字段进行过滤,只显示匹配的文件
- 不区分大小写,`jpg` 和 `JPG` 都会被识别
- 可以动态修改 `accept-file-types` 的值,组件会实时更新过滤结果
- 适用于特定业务场景,如头像上传只允许图片,文档管理只允许文档类型

### 限制文件大小

通过 `file-size` 属性可以限制用户只能选择指定大小范围内的文件,单位为 MB。

```vue
<template>
  <div class="demo-container">
    <el-form :model="form" label-width="120px">
      <el-form-item label="文件大小限制">
        <el-input-number
          v-model="form.maxFileSize"
          :min="1"
          :max="100"
          :step="1"
        />
        <span class="unit">MB</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="openMediaManager">
          选择文件 (最大 {{ form.maxFileSize }}MB)
        </el-button>
      </el-form-item>
    </el-form>

    <div v-if="selectedFile" class="selected-info">
      <p>文件名: {{ selectedFile.fileName }}</p>
      <p>文件大小: {{ formatFileSize(selectedFile.fileSize) }}</p>
      <el-tag :type="getFileSizeType(selectedFile.fileSize)">
        {{ getFileSizeStatus(selectedFile.fileSize) }}
      </el-tag>
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :file-size="form.maxFileSize"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const selectedFile = ref<SysOssVo | null>(null)

const form = reactive({
  maxFileSize: 10 // 默认限制 10MB
})

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0]
    const sizeMB = files[0].fileSize / 1024 / 1024
    if (sizeMB > form.maxFileSize) {
      ElMessage.warning('所选文件超出大小限制')
    } else {
      ElMessage.success('文件选择成功')
    }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const getFileSizeType = (bytes: number): string => {
  const sizeMB = bytes / 1024 / 1024
  if (sizeMB > form.maxFileSize) return 'danger'
  if (sizeMB > form.maxFileSize * 0.8) return 'warning'
  return 'success'
}

const getFileSizeStatus = (bytes: number): string => {
  const sizeMB = bytes / 1024 / 1024
  if (sizeMB > form.maxFileSize) return '超出限制'
  if (sizeMB > form.maxFileSize * 0.8) return '接近限制'
  return '正常范围'
}
</script>

```

**使用说明:**

- `file-size` 属性单位为 MB,如设置为 `10` 表示限制文件最大为 10MB
- 组件内部会过滤掉超过大小限制的文件,不在列表中显示
- 文件大小的判断基于 `SysOssVo` 接口的 `fileSize` 字段(字节为单位)
- 可以配合业务逻辑在确认时进行二次校验,提供更友好的提示
- 适用于需要控制资源占用的场景,如防止上传过大的文件导致存储空间不足

### 指定默认目录

通过 `default-directory-id` 属性可以指定组件打开时默认展开和选中的目录,方便用户快速定位。

```vue
<template>
  <div class="demo-container">
    <el-form :model="form" label-width="120px">
      <el-form-item label="选择默认目录">
        <el-tree-select
          v-model="form.defaultDirId"
          :data="directoryTree"
          :props="{
            value: 'id',
            label: 'label',
            children: 'children'
          }"
          placeholder="请选择默认目录"
          style="width: 300px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="openMediaManager">
          打开媒体库
        </el-button>
      </el-form-item>
    </el-form>

    <AOssMediaManager
      v-model="dialogVisible"
      :default-directory-id="form.defaultDirId"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'
import type { SysOssDirectoryTreeVo } from '@/api/system/oss/ossDirectory/ossDirectoryTypes'
import { listOssDirectoryTree } from '@/api/system/oss/ossDirectory/ossDirectoryApi'

const dialogVisible = ref(false)
const directoryTree = ref<SysOssDirectoryTreeVo[]>([])

const form = reactive({
  defaultDirId: null as number | null
})

// 加载目录树
onMounted(async () => {
  const [err, data] = await listOssDirectoryTree()
  if (!err && data) {
    directoryTree.value = data
    // 默认选中第一个目录
    if (data.length > 0) {
      form.defaultDirId = data[0].id as number
    }
  }
})

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
  ElMessage.success(`成功选择 ${files.length} 个文件`)
}
</script>

```

**使用说明:**

- `default-directory-id` 接受目录 ID,类型为 `number | string | null`
- 组件打开时会自动展开并选中指定的目录,文件列表也会加载该目录下的文件
- 如果传入 `null` 或不传,默认选中根目录或第一个目录
- 适用于需要引导用户到特定目录的场景,如编辑文章时默认打开文章图片目录
- 可以配合业务逻辑动态设置默认目录,提升用户体验

### 启用文件移动功能

通过 `show-move` 属性可以控制是否显示文件移动功能按钮,允许用户将文件移动到其他目录。

```vue
<template>
  <div class="demo-container">
    <el-space>
      <el-button type="primary" @click="openWithMove">
        打开(支持移动)
      </el-button>
      <el-button @click="openWithoutMove">
        打开(禁用移动)
      </el-button>
    </el-space>

    <div v-if="selectedFiles.length > 0" class="selected-info">
      <h4>已选择的文件:</h4>
      <el-tag
        v-for="file in selectedFiles"
        :key="file.ossId"
        class="file-tag"
      >
        {{ file.fileName }}
      </el-tag>
    </div>

    <AOssMediaManager
      v-model="dialogVisible"
      :show-move="showMoveBtn"
      :multi-select="true"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const showMoveBtn = ref(true)
const selectedFiles = ref<SysOssVo[]>([])

const openWithMove = () => {
  showMoveBtn.value = true
  dialogVisible.value = true
}

const openWithoutMove = () => {
  showMoveBtn.value = false
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  selectedFiles.value = files
  ElMessage.success('文件选择成功')
}
</script>

```

**使用说明:**

- `show-move` 默认为 `true`,显示文件移动功能按钮
- 设置为 `false` 可以隐藏移动按钮,适用于只需要选择文件不需要管理文件的场景
- 移动功能允许用户批量移动文件到其他目录,提供二次确认避免误操作
- 移动操作会调用后端 API 更新文件的目录归属,操作成功后自动刷新文件列表
- 适用于文件整理和归档场景,可以根据业务需求灵活控制

### 启用文件替换功能

通过 `enable-replace` 属性可以在文件预览对话框中显示替换按钮,允许用户替换现有文件。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="文件替换说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      启用文件替换后,在文件预览对话框中会显示"替换"按钮,
      可以上传新文件替换当前文件,保持文件 URL 不变。
    </el-alert>

    <el-switch
      v-model="enableReplace"
      active-text="启用替换"
      inactive-text="禁用替换"
      style="margin-bottom: 20px"
    />

    <el-button type="primary" @click="openMediaManager">
      打开媒体库
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      :enable-replace="enableReplace"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const enableReplace = ref(true)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**使用说明:**

- `enable-replace` 默认为 `false`,不显示替换按钮
- 设置为 `true` 后,在文件预览对话框中会显示"替换"按钮
- 点击替换按钮后可以上传新文件,新文件会替换原文件内容但保持 URL 不变
- 适用于需要更新文件内容但不想修改引用链接的场景,如更新产品图片、更新文档版本等
- 替换操作会调用后端 API,确保文件的元数据(文件名、URL等)保持一致性

## 高级功能

### 目录树管理

组件提供了完整的目录树管理功能,包括创建目录、重命名目录、删除目录等操作。目录树采用 Element Plus Tree 组件实现,支持懒加载和虚拟滚动,可以高效处理大量目录节点。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="目录树功能"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <ul>
        <li>右键点击目录节点可以进行创建、重命名、删除操作</li>
        <li>点击目录节点可以加载该目录下的文件列表</li>
        <li>支持目录树的展开和折叠</li>
        <li>支持拖拽调整目录顺序</li>
      </ul>
    </el-alert>

    <el-button type="primary" @click="openMediaManager">
      打开媒体库
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**技术实现:**

- 目录树数据结构基于 `SysOssDirectoryTreeVo` 接口,包含 `id`、`label`、`parentId`、`children` 等字段
- 使用递归算法构建树形结构,支持无限层级
- 右键菜单通过 `contextmenu` 事件实现,提供创建、重命名、删除等操作入口
- 创建目录时弹出输入框让用户输入目录名,调用 `createOssDirectory` API 创建
- 重命名目录时弹出输入框显示当前名称,用户修改后调用 `updateOssDirectory` API 更新
- 删除目录时弹出确认框,确认后调用 `deleteOssDirectory` API 删除,如果目录下有子目录或文件会提示用户
- 所有操作成功后都会重新加载目录树,确保数据同步

### 文件上传管理

组件集成了 Element Plus Upload 组件,提供拖拽上传、点击上传、上传进度显示等功能。支持文件类型限制、文件大小限制,上传前会进行校验。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="文件上传功能"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <ul>
        <li>支持拖拽文件到上传区域进行上传</li>
        <li>支持点击上传按钮选择文件上传</li>
        <li>上传前会校验文件类型和大小</li>
        <li>上传过程中显示进度条</li>
        <li>上传成功后自动刷新文件列表</li>
      </ul>
    </el-alert>

    <el-button type="primary" @click="openMediaManager">
      打开媒体库并上传
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      :file-size="10"
      :accept-file-types="['jpg', 'png', 'pdf']"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**技术实现:**

- 上传区域使用 `el-upload` 组件,设置 `drag` 属性启用拖拽上传
- 通过 `before-upload` 钩子进行上传前校验,检查文件类型和大小是否符合要求
- 文件类型校验通过判断文件扩展名是否在 `acceptFileTypes` 数组中
- 文件大小校验通过比较文件 `size` 字段和 `fileSize` 属性(转换为字节)
- 校验失败时使用 `ElMessage` 提示用户,并返回 `false` 阻止上传
- 上传时调用 `uploadOss` API,传入文件对象和当前目录 ID
- 使用 `on-progress` 钩子监听上传进度,显示进度条
- 上传成功后调用 `on-success` 钩子,触发文件列表刷新
- 上传失败时调用 `on-error` 钩子,显示错误信息

### 文件预览功能

组件内置了文件预览对话框,支持图片、视频、音频的在线预览,支持 PDF、文本文件的查看,提供下载和替换操作入口。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="文件预览功能"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <ul>
        <li>图片文件: 显示图片,支持缩放和旋转</li>
        <li>视频文件: 使用 video 标签播放</li>
        <li>音频文件: 使用 audio 标签播放</li>
        <li>PDF 文件: 使用 iframe 嵌入显示</li>
        <li>文本文件: 显示文本内容</li>
        <li>其他文件: 提示不支持预览,可下载</li>
      </ul>
    </el-alert>

    <el-button type="primary" @click="openMediaManager">
      打开媒体库
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      :enable-replace="true"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**技术实现:**

- 预览对话框使用 `el-dialog` 组件,设置 `width` 为 `80%` 以适应不同屏幕
- 根据文件的 `fileSuffix` 字段判断文件类型,渲染不同的预览组件
- 图片预览使用 `el-image` 组件,支持缩放、旋转等操作,设置 `preview-src-list` 支持画廊模式
- 视频预览使用原生 `<video>` 标签,设置 `controls` 显示控制栏,`preload="metadata"` 预加载元数据
- 音频预览使用原生 `<audio>` 标签,同样设置 `controls` 和 `preload="metadata"`
- PDF 预览使用 `<iframe>` 标签,`src` 设置为文件 URL,部分浏览器支持内嵌显示
- 文本文件预览通过 `fetch` 获取文件内容,使用 `<pre>` 标签显示
- 不支持预览的文件类型显示提示信息,提供下载按钮
- 预览对话框底部提供"下载"、"替换"(可选)、"关闭"按钮
- 下载功能通过创建隐藏的 `<a>` 标签,设置 `href` 为文件 URL,`download` 属性触发下载

### 无限滚动加载

组件采用 IntersectionObserver API 实现高性能的无限滚动加载,用户滚动到列表底部时自动加载下一页数据,避免一次性加载大量数据导致的性能问题。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="无限滚动功能"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <ul>
        <li>滚动到列表底部时自动加载下一页数据</li>
        <li>使用 IntersectionObserver API,性能优异</li>
        <li>加载过程中显示加载提示</li>
        <li>加载完所有数据后显示"已加载全部"提示</li>
        <li>支持搜索和筛选条件下的分页加载</li>
      </ul>
    </el-alert>

    <el-button type="primary" @click="openMediaManager">
      打开媒体库(体验无限滚动)
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**技术实现:**

- 在文件列表容器底部放置一个哨兵元素(sentinel element)
- 使用 `IntersectionObserver` 监听哨兵元素的可见性变化
- 当哨兵元素进入视口时,触发回调函数加载下一页数据
- 回调函数中首先检查是否正在加载或已加载完所有数据,避免重复请求
- 设置加载状态为 `true`,显示加载提示
- 调用 `listOss` API 获取下一页数据,传入当前页码 + 1
- 获取到数据后,将新数据追加到现有文件列表中
- 更新页码和总页数,如果当前页 >= 总页数,标记为已加载完毕
- 设置加载状态为 `false`,隐藏加载提示
- Observer 配置 `rootMargin: '100px'`,提前 100px 触发加载,提升用户体验
- 组件销毁时断开 Observer 连接,避免内存泄漏

### 文件类型筛选

组件提供了文件类型筛选功能,用户可以按照图片、文档、视频、音频、其他五大类型快速筛选文件,提高查找效率。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="文件类型筛选"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>点击不同的文件类型标签,可以快速筛选对应类型的文件:</p>
      <ul>
        <li>全部: 显示所有文件</li>
        <li>图片: jpg, jpeg, png, gif, webp, svg, bmp</li>
        <li>文档: pdf, doc, docx, xls, xlsx, ppt, pptx, txt</li>
        <li>视频: mp4, avi, mov, wmv, flv, mkv</li>
        <li>音频: mp3, wav, ogg, aac, flac</li>
        <li>其他: 不属于以上分类的文件</li>
      </ul>
    </el-alert>

    <el-button type="primary" @click="openMediaManager">
      打开媒体库
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**技术实现:**

- 在工具栏区域使用 `el-radio-group` 和 `el-radio-button` 渲染文件类型选项
- 定义文件类型分类映射对象,每种类型对应一个扩展名数组
- 用户点击类型按钮时,更新 `activeFileType` 响应式变量
- 使用计算属性 `filteredFileList` 根据 `activeFileType` 过滤文件列表
- 过滤逻辑: 如果 `activeFileType` 为 `'all'`,返回完整列表;否则检查文件的 `fileSuffix` 是否在对应类型的扩展名数组中
- 扩展名判断时统一转小写,确保不区分大小写
- 筛选操作不会重新请求 API,只是前端过滤,性能高效
- 切换类型时会重置滚动位置到顶部,提升用户体验

### 搜索过滤功能

组件提供了搜索框,用户可以输入关键字实时过滤文件列表,支持模糊匹配文件名。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="搜索功能"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <ul>
        <li>在搜索框中输入关键字,实时过滤文件列表</li>
        <li>支持文件名的模糊匹配</li>
        <li>不区分大小写</li>
        <li>清空搜索框恢复完整列表</li>
        <li>搜索结果保持文件类型筛选条件</li>
      </ul>
    </el-alert>

    <el-button type="primary" @click="openMediaManager">
      打开媒体库
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**技术实现:**

- 在工具栏区域使用 `el-input` 组件渲染搜索框,设置 `clearable` 属性显示清空按钮
- 搜索框绑定 `searchKeyword` 响应式变量,使用 `v-model` 双向绑定
- 在 `filteredFileList` 计算属性中,先按文件类型筛选,再按搜索关键字过滤
- 搜索过滤逻辑: 将文件名和关键字都转为小写,使用 `includes` 方法判断是否匹配
- 如果 `searchKeyword` 为空字符串,跳过搜索过滤,返回类型筛选后的结果
- 搜索操作实时触发,用户输入时立即更新文件列表
- 搜索结果数量显示在搜索框下方,提示用户当前匹配的文件数量
- 搜索不会触发 API 请求,只是前端过滤,响应速度快

### 响应式设计

组件针对不同屏幕尺寸进行了优化,在桌面端和移动端都能提供良好的使用体验。

```vue
<template>
  <div class="demo-container">
    <el-alert
      title="响应式设计"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>组件在不同屏幕尺寸下的表现:</p>
      <ul>
        <li>桌面端(宽度 ≥ 768px): 左侧显示目录树,右侧显示文件列表</li>
        <li>移动端(宽度 < 768px): 目录树默认隐藏,点击按钮展开侧边栏</li>
        <li>文件卡片网格自适应,根据容器宽度调整列数</li>
        <li>对话框宽度自适应,移动端占满屏幕</li>
        <li>工具栏按钮在小屏幕下调整布局</li>
      </ul>
    </el-alert>

    <el-button type="primary" @click="openMediaManager">
      打开媒体库(调整窗口大小查看效果)
    </el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const openMediaManager = () => {
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**技术实现:**

- 使用 `@vueuse/core` 的 `useWindowSize` 组合式函数监听窗口尺寸变化
- 定义响应式变量 `isSmallScreen`,根据窗口宽度 `< 768px` 判断是否为小屏幕
- 小屏幕模式下,左侧目录树默认隐藏,使用 `el-drawer` 组件实现侧边栏抽屉
- 添加"显示目录"按钮,点击时打开抽屉显示目录树
- 文件卡片使用 CSS Grid 布局,设置 `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`
- 这样卡片会根据容器宽度自动调整列数,保持每个卡片宽度在 150px 以上
- 对话框使用媒体查询,在小屏幕下设置 `width: 100%` 和 `height: 100%`
- 工具栏按钮在小屏幕下使用 `flex-wrap: wrap` 允许换行
- 所有尺寸和间距都使用相对单位,确保在不同设备上的一致性

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 控制组件显示隐藏的绑定值 | `boolean` | `false` |
| multiSelect | 是否启用多选模式 | `boolean` | `false` |
| fileSize | 文件大小限制(MB),超过此大小的文件不显示 | `number` | `undefined` |
| showMove | 是否显示文件移动功能按钮 | `boolean` | `true` |
| defaultDirectoryId | 默认选中的目录 ID | `number \| string \| null` | `null` |
| acceptFileTypes | 允许选择的文件类型数组,如 `['jpg', 'png', 'pdf']` | `string[]` | `undefined` |
| enableReplace | 是否在预览对话框中显示替换按钮 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 组件显示隐藏状态改变时触发 | `value: boolean` |
| confirm | 用户点击确定按钮时触发,返回选中的文件列表 | `files: SysOssVo[]` |

### 类型定义

#### AOssMediaManagerProps

```typescript
/**
 * OSS 媒体管理器组件属性接口
 */
interface AOssMediaManagerProps {
  /**
   * 控制组件显示隐藏的绑定值
   */
  modelValue: boolean

  /**
   * 是否启用多选模式
   * @default false
   */
  multiSelect?: boolean

  /**
   * 文件大小限制(MB)
   * 超过此大小的文件不会在列表中显示
   * @default undefined (不限制)
   */
  fileSize?: number

  /**
   * 是否显示文件移动功能按钮
   * @default true
   */
  showMove?: boolean

  /**
   * 默认选中的目录 ID
   * 组件打开时会自动展开并选中此目录
   * @default null
   */
  defaultDirectoryId?: number | string | null

  /**
   * 允许选择的文件类型数组
   * 如 ['jpg', 'png', 'pdf']
   * 不区分大小写
   * @default undefined (不限制)
   */
  acceptFileTypes?: string[]

  /**
   * 是否在预览对话框中显示替换按钮
   * @default false
   */
  enableReplace?: boolean
}
```

#### AOssMediaManagerEmits

```typescript
/**
 * OSS 媒体管理器组件事件接口
 */
interface AOssMediaManagerEmits {
  /**
   * 组件显示隐藏状态改变时触发
   * @param value 新的显示状态
   */
  'update:modelValue': (value: boolean) => void

  /**
   * 用户点击确定按钮时触发
   * @param files 选中的文件列表
   */
  confirm: (files: SysOssVo[]) => void
}
```

#### SysOssVo

```typescript
/**
 * OSS 文件视图对象
 */
interface SysOssVo {
  /**
   * OSS 文件 ID
   */
  ossId: string | number

  /**
   * 所属目录 ID
   */
  directoryId: string | number

  /**
   * 存储文件名(服务端生成的唯一文件名)
   */
  fileName: string

  /**
   * 原始文件名(用户上传时的文件名)
   */
  originalName: string

  /**
   * 文件后缀(不含点,如 'jpg', 'pdf')
   */
  fileSuffix: string

  /**
   * 文件大小(字节)
   */
  fileSize: number

  /**
   * 文件访问 URL
   */
  url: string

  /**
   * 创建时间
   */
  createTime?: string

  /**
   * 创建者
   */
  createBy?: string

  /**
   * 更新时间
   */
  updateTime?: string

  /**
   * 更新者
   */
  updateBy?: string
}
```

#### SysOssDirectoryTreeVo

```typescript
/**
 * OSS 目录树视图对象
 */
interface SysOssDirectoryTreeVo {
  /**
   * 目录 ID
   */
  id: number | string

  /**
   * 目录名称
   */
  label: string

  /**
   * 父目录 ID
   */
  parentId: number | string

  /**
   * 排序权重
   */
  weight: number

  /**
   * 子目录列表
   */
  children: SysOssDirectoryTreeVo[]

  /**
   * 目录路径(从根目录到当前目录的完整路径)
   */
  directoryPath: string
}
```

#### FileTypeCategory

```typescript
/**
 * 文件类型分类
 */
type FileTypeCategory = 'all' | 'image' | 'document' | 'video' | 'audio' | 'other'

/**
 * 文件类型映射
 */
interface FileTypeMap {
  image: string[]    // ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  document: string[] // ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  video: string[]    // ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
  audio: string[]    // ['mp3', 'wav', 'ogg', 'aac', 'flac']
}
```

## 主题定制

组件使用 Element Plus 的 CSS 变量系统,可以通过覆盖 CSS 变量来自定义主题样式。

### CSS 变量

```scss
.a-oss-media-manager {
  // 目录树样式
  --oss-tree-width: 240px;                    // 目录树宽度
  --oss-tree-bg: var(--el-bg-color);         // 目录树背景色
  --oss-tree-border: var(--el-border-color); // 目录树边框色

  // 文件卡片样式
  --oss-card-width: 150px;                   // 文件卡片最小宽度
  --oss-card-gap: 16px;                      // 文件卡片间距
  --oss-card-bg: var(--el-fill-color-light); // 文件卡片背景色
  --oss-card-hover-bg: var(--el-fill-color); // 文件卡片悬停背景色
  --oss-card-selected-border: var(--el-color-primary); // 选中卡片边框色

  // 工具栏样式
  --oss-toolbar-height: 60px;                // 工具栏高度
  --oss-toolbar-bg: var(--el-bg-color);     // 工具栏背景色
  --oss-toolbar-border: var(--el-border-color); // 工具栏边框色

  // 预览对话框样式
  --oss-preview-max-width: 80%;              // 预览对话框最大宽度
  --oss-preview-max-height: 80vh;            // 预览对话框最大高度
}
```

### 自定义主题示例

```vue
<template>
  <div class="custom-theme-demo">
    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

### 暗黑模式适配

组件完全支持 Element Plus 的暗黑模式,会自动使用暗黑模式的 CSS 变量。

```vue
<template>
  <div class="dark-mode-demo">
    <el-switch
      v-model="isDark"
      active-text="暗黑模式"
      inactive-text="亮色模式"
      @change="toggleDarkMode"
    />

    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const isDark = useDark()
const toggleDarkMode = useToggle(isDark)

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

## 最佳实践

### 1. 合理使用文件类型限制

在特定业务场景下,应该使用 `accept-file-types` 属性限制用户只能选择合适的文件类型,避免用户选择错误类型的文件导致后续处理失败。

```vue
<template>
  <div class="avatar-upload-demo">
    <!-- 头像上传场景:只允许图片 -->
    <el-button @click="selectAvatar">选择头像</el-button>

    <AOssMediaManager
      v-model="avatarDialogVisible"
      :accept-file-types="['jpg', 'jpeg', 'png', 'gif']"
      :file-size="2"
      @confirm="handleAvatarConfirm"
    />

    <!-- 文档上传场景:只允许 PDF 和 Word -->
    <el-button @click="selectDocument">上传文档</el-button>

    <AOssMediaManager
      v-model="documentDialogVisible"
      :accept-file-types="['pdf', 'doc', 'docx']"
      :file-size="10"
      :multi-select="true"
      @confirm="handleDocumentConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const avatarDialogVisible = ref(false)
const documentDialogVisible = ref(false)

const selectAvatar = () => {
  avatarDialogVisible.value = true
}

const selectDocument = () => {
  documentDialogVisible.value = true
}

const handleAvatarConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    // 更新用户头像
    console.log('更新头像:', files[0].url)
  }
}

const handleDocumentConfirm = (files: SysOssVo[]) => {
  // 批量上传文档
  console.log('上传文档:', files)
}
</script>
```

**实践要点:**

- 根据业务需求明确允许的文件类型,不要设置过于宽泛的类型限制
- 头像、图标等场景限制为图片类型,文件大小建议不超过 2MB
- 文档场景可以同时允许多种文档格式,文件大小根据实际需求调整
- 视频、音频等大文件场景要特别注意大小限制,避免占用过多存储空间
- 配合后端验证,前端限制只是第一道防线,后端也要进行类型和大小校验

### 2. 优化大文件列表性能

当目录下有大量文件时,应该充分利用组件的无限滚动功能,避免一次性加载过多数据导致性能问题。

```vue
<template>
  <div class="large-list-demo">
    <el-alert
      title="性能优化建议"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <ul>
        <li>组件已内置无限滚动,会自动分页加载数据</li>
        <li>建议服务端每页返回 20-50 条数据</li>
        <li>使用文件类型筛选和搜索功能减少数据量</li>
        <li>定期整理和归档旧文件,保持目录简洁</li>
      </ul>
    </el-alert>

    <AOssMediaManager
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

**实践要点:**

- 后端 API 应该支持分页查询,每页返回合理数量的数据(建议 20-50 条)
- 前端利用无限滚动加载,用户滚动时自动加载更多数据
- 提供文件类型筛选和搜索功能,帮助用户快速定位目标文件
- 建议按业务类型或时间建立目录结构,避免单个目录文件过多
- 定期清理过期文件,或将旧文件归档到专门的目录
- 如果文件数量特别大(数千上万),考虑使用虚拟滚动技术进一步优化

### 3. 正确处理文件选择结果

在 `confirm` 事件回调中,应该正确处理选择的文件数据,根据业务需求进行相应的操作。

```vue
<template>
  <div class="file-selection-demo">
    <el-form :model="form" label-width="120px">
      <el-form-item label="商品主图">
        <div class="image-selector">
          <img
            v-if="form.mainImage"
            :src="form.mainImage"
            alt="主图"
            class="preview"
          />
          <el-button @click="selectMainImage">选择主图</el-button>
        </div>
      </el-form-item>

      <el-form-item label="商品相册">
        <div class="images-selector">
          <div v-for="(img, index) in form.images" :key="index" class="image-item">
            <img :src="img" alt="商品图片" />
            <el-button
              type="danger"
              size="small"
              circle
              icon="Close"
              @click="removeImage(index)"
            />
          </div>
          <el-button @click="selectImages">添加图片</el-button>
        </div>
      </el-form-item>

      <el-form-item label="商品附件">
        <div class="files-selector">
          <el-tag
            v-for="(file, index) in form.files"
            :key="index"
            closable
            @close="removeFile(index)"
          >
            {{ file.name }}
          </el-tag>
          <el-button @click="selectFiles">添加附件</el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 主图选择器 -->
    <AOssMediaManager
      v-model="mainImageDialogVisible"
      :accept-file-types="['jpg', 'jpeg', 'png']"
      :file-size="2"
      @confirm="handleMainImageConfirm"
    />

    <!-- 相册选择器 -->
    <AOssMediaManager
      v-model="imagesDialogVisible"
      :accept-file-types="['jpg', 'jpeg', 'png']"
      :file-size="2"
      :multi-select="true"
      @confirm="handleImagesConfirm"
    />

    <!-- 附件选择器 -->
    <AOssMediaManager
      v-model="filesDialogVisible"
      :multi-select="true"
      @confirm="handleFilesConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const mainImageDialogVisible = ref(false)
const imagesDialogVisible = ref(false)
const filesDialogVisible = ref(false)

const form = reactive({
  mainImage: '',
  images: [] as string[],
  files: [] as Array<{ name: string; url: string }>
})

// 选择主图
const selectMainImage = () => {
  mainImageDialogVisible.value = true
}

const handleMainImageConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    // 单文件选择,直接取第一个文件的 URL
    form.mainImage = files[0].url
    ElMessage.success('主图设置成功')
  }
}

// 选择相册图片
const selectImages = () => {
  imagesDialogVisible.value = true
}

const handleImagesConfirm = (files: SysOssVo[]) => {
  // 多文件选择,追加到现有数组
  const newImages = files.map(file => file.url)
  form.images.push(...newImages)
  ElMessage.success(`添加了 ${files.length} 张图片`)
}

const removeImage = (index: number) => {
  form.images.splice(index, 1)
}

// 选择附件
const selectFiles = () => {
  filesDialogVisible.value = true
}

const handleFilesConfirm = (files: SysOssVo[]) => {
  // 保存文件名和 URL,用于显示和下载
  const newFiles = files.map(file => ({
    name: file.originalName,
    url: file.url
  }))
  form.files.push(...newFiles)
  ElMessage.success(`添加了 ${files.length} 个附件`)
}

const removeFile = (index: number) => {
  form.files.splice(index, 1)
}
</script>

```

**实践要点:**

- 单文件选择时,取 `files[0]` 获取第一个文件
- 多文件选择时,遍历 `files` 数组处理所有文件
- 根据业务需求提取文件的不同字段,如 URL、原始文件名、文件大小等
- 注意文件数据的存储格式,确保与后端接口要求一致
- 提供删除功能,允许用户移除已选择的文件
- 在提交表单前验证必填的文件字段是否已选择
- 大文件上传建议显示上传进度,提升用户体验

### 4. 目录结构规划

合理规划 OSS 目录结构,可以提高文件管理效率,方便团队协作。

```vue
<template>
  <div class="directory-planning-demo">
    <el-alert
      title="目录结构规划建议"
      type="success"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>推荐的目录结构:</p>
      <pre>
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
├── public/         # 公共资源
│   ├── icons/      # 图标
│   └── banners/    # Banner 图
└── temp/           # 临时文件
      </pre>
    </el-alert>

    <AOssMediaManager
      v-model="dialogVisible"
      :default-directory-id="defaultDirId"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const defaultDirId = ref<number | null>(null)

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>

```

**实践要点:**

- 按业务模块划分顶级目录,如用户、商品、文章等
- 每个模块下按文件类型或用途划分子目录
- 避免目录层级过深,建议不超过 4 层
- 目录命名使用英文小写,单词间用下划线或中划线分隔
- 建立临时目录存放临时文件,定期清理
- 重要文件建议建立归档目录,按年份或月份归档
- 配置目录权限,敏感目录限制访问
- 制定团队规范,确保所有成员按统一标准管理文件

### 5. 与表单组件集成

将 OSS 媒体管理器与表单组件集成时,应该提供良好的用户交互体验,清晰展示选中的文件。

```vue
<template>
  <div class="form-integration-demo">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文章标题" />
      </el-form-item>

      <el-form-item label="文章封面" prop="cover" required>
        <div class="cover-selector">
          <div v-if="form.cover" class="cover-preview">
            <img :src="form.cover" alt="封面" />
            <div class="cover-actions">
              <el-button size="small" @click="selectCover">更换</el-button>
              <el-button size="small" type="danger" @click="removeCover">删除</el-button>
            </div>
          </div>
          <el-button v-else type="primary" @click="selectCover">
            选择封面
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="文章内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="请输入文章内容"
        />
      </el-form-item>

      <el-form-item label="附件">
        <div class="attachments">
          <el-table :data="form.attachments" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" width="120" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeAttachment($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button style="margin-top: 10px" @click="selectAttachments">
            添加附件
          </el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 封面选择器 -->
    <AOssMediaManager
      v-model="coverDialogVisible"
      :accept-file-types="['jpg', 'jpeg', 'png']"
      :file-size="2"
      @confirm="handleCoverConfirm"
    />

    <!-- 附件选择器 -->
    <AOssMediaManager
      v-model="attachmentsDialogVisible"
      :multi-select="true"
      @confirm="handleAttachmentsConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const formRef = ref<FormInstance>()
const coverDialogVisible = ref(false)
const attachmentsDialogVisible = ref(false)

const form = reactive({
  title: '',
  cover: '',
  content: '',
  attachments: [] as Array<{ name: string; size: string; url: string }>
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  cover: [
    { required: true, message: '请选择文章封面', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

// 选择封面
const selectCover = () => {
  coverDialogVisible.value = true
}

const handleCoverConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    form.cover = files[0].url
    // 触发表单验证
    formRef.value?.validateField('cover')
  }
}

const removeCover = () => {
  form.cover = ''
}

// 选择附件
const selectAttachments = () => {
  attachmentsDialogVisible.value = true
}

const handleAttachmentsConfirm = (files: SysOssVo[]) => {
  const newAttachments = files.map(file => ({
    name: file.originalName,
    size: formatFileSize(file.fileSize),
    url: file.url
  }))
  form.attachments.push(...newAttachments)
}

const removeAttachment = (index: number) => {
  form.attachments.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交表单:', form)
      ElMessage.success('提交成功')
    } else {
      ElMessage.error('请完善表单信息')
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  form.attachments = []
}
</script>

```

**实践要点:**

- 与 El-Form 集成时,在 `confirm` 回调中更新表单字段值
- 更新表单字段后调用 `validateField` 触发验证,清除错误提示
- 提供预览功能,让用户直观看到选中的文件
- 提供删除/更换功能,允许用户修改选择
- 必填的文件字段要配置表单验证规则
- 提交表单前验证所有必填字段,包括文件字段
- 重置表单时清空文件选择状态
- 文件数据格式要符合后端接口要求

## 常见问题

### 1. 文件上传后列表未刷新

**问题描述:**

用户通过组件上传了新文件,但文件列表没有自动更新,需要手动刷新或重新打开组件才能看到新文件。

**问题原因:**

- 上传成功回调中没有触发文件列表刷新
- 文件上传到了其他目录,当前目录列表未包含新文件
- 文件类型或大小超出筛选条件,被过滤掉了
- 缓存机制导致显示的是旧数据

**解决方案:**

```vue
<template>
  <div class="upload-refresh-demo">
    <el-alert
      title="解决方案"
      type="success"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>确保上传成功后刷新文件列表:</p>
      <ol>
        <li>在上传组件的 on-success 回调中调用刷新方法</li>
        <li>确认上传的目录与当前浏览的目录一致</li>
        <li>检查筛选条件,确保新文件符合条件</li>
        <li>必要时清除缓存重新加载数据</li>
      </ol>
    </el-alert>

    <AOssMediaManager
      ref="mediaManagerRef"
      v-model="dialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const mediaManagerRef = ref()

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}

// 如果组件提供了刷新方法,可以手动调用
const refreshFileList = () => {
  mediaManagerRef.value?.refresh()
}
</script>
```

组件内部实现时,在上传成功回调中应该:

```typescript
const handleUploadSuccess = () => {
  // 重置分页为第一页
  pagination.pageNum = 1
  fileList.value = []

  // 重新加载文件列表
  loadFileList()

  ElMessage.success('文件上传成功')
}
```

### 2. 大文件上传超时

**问题描述:**

上传大文件(如视频、高清图片)时,经常出现超时错误,上传失败。

**问题原因:**

- 文件过大,超过服务器配置的请求超时时间
- 网络速度慢,传输时间过长
- 服务器上传大小限制
- 前端请求超时配置过短

**解决方案:**

```typescript
// 在上传前进行大文件检查
const beforeUpload = (file: File): boolean => {
  const maxSize = 100 // MB
  const fileSizeMB = file.size / 1024 / 1024

  if (fileSizeMB > maxSize) {
    ElMessage.error(`文件大小不能超过 ${maxSize}MB`)
    return false
  }

  // 大文件提示用户耐心等待
  if (fileSizeMB > 20) {
    ElMessage.info('文件较大,上传可能需要较长时间,请耐心等待')
  }

  return true
}

// 配置上传请求的超时时间
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directoryId', currentDirectoryId.value)

  try {
    // 设置较长的超时时间(如 5 分钟)
    const [err, data] = await uploadOss(formData, {
      timeout: 5 * 60 * 1000
    })

    if (err) {
      throw err
    }

    ElMessage.success('上传成功')
    refreshFileList()
  } catch (error) {
    ElMessage.error('上传失败,请检查网络连接或稍后重试')
  }
}
```

后端配置优化:

```yaml
# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB

server:
  tomcat:
    connection-timeout: 300000 # 5分钟
```

### 3. 目录树展开状态未保存

**问题描述:**

用户展开了某些目录节点,关闭组件后再打开,之前的展开状态丢失了,所有节点都恢复为折叠状态。

**问题原因:**

- 组件关闭时清空了目录树状态
- 没有持久化展开状态到本地存储
- 每次打开组件都重新初始化目录树

**解决方案:**

```vue
<template>
  <el-tree
    ref="treeRef"
    :data="directoryTree"
    :props="{ children: 'children', label: 'label' }"
    :default-expanded-keys="expandedKeys"
    @node-expand="handleNodeExpand"
    @node-collapse="handleNodeCollapse"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const treeRef = ref()
const expandedKeys = ref<Array<string | number>>([])

// 从本地存储加载展开状态
onMounted(() => {
  const saved = localStorage.getItem('oss-tree-expanded-keys')
  if (saved) {
    try {
      expandedKeys.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载目录树展开状态失败:', error)
    }
  }
})

// 节点展开时保存状态
const handleNodeExpand = (data: any) => {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value.push(data.id)
    saveExpandedKeys()
  }
}

// 节点折叠时更新状态
const handleNodeCollapse = (data: any) => {
  const index = expandedKeys.value.indexOf(data.id)
  if (index > -1) {
    expandedKeys.value.splice(index, 1)
    saveExpandedKeys()
  }
}

// 保存展开状态到本地存储
const saveExpandedKeys = () => {
  localStorage.setItem(
    'oss-tree-expanded-keys',
    JSON.stringify(expandedKeys.value)
  )
}
</script>
```

### 4. 文件预览加载失败

**问题描述:**

点击文件卡片预览时,预览对话框打开了但内容显示失败,图片显示损坏图标,视频无法播放。

**问题原因:**

- 文件 URL 不可访问,可能是权限问题或文件已被删除
- CORS 跨域问题导致浏览器阻止资源加载
- 文件格式不被浏览器支持
- 网络问题导致资源加载超时

**解决方案:**

```vue
<template>
  <el-dialog
    v-model="previewDialogVisible"
    title="文件预览"
    width="80%"
  >
    <div v-if="previewFile" class="preview-container">
      <!-- 图片预览 -->
      <div v-if="isImage(previewFile)" class="image-preview">
        <el-image
          :src="previewFile.url"
          fit="contain"
          :preview-src-list="[previewFile.url]"
          @error="handleImageError"
        >
          <template #error>
            <div class="image-error">
              <el-icon :size="50"><Picture /></el-icon>
              <p>图片加载失败</p>
              <el-button size="small" @click="retryLoad">重试</el-button>
            </div>
          </template>
        </el-image>
      </div>

      <!-- 视频预览 -->
      <div v-else-if="isVideo(previewFile)" class="video-preview">
        <video
          :src="previewFile.url"
          controls
          preload="metadata"
          @error="handleVideoError"
        >
          您的浏览器不支持视频播放
        </video>
        <div v-if="videoError" class="video-error">
          <p>视频加载失败,请尝试下载后播放</p>
          <el-button size="small" @click="downloadFile">下载文件</el-button>
        </div>
      </div>

      <!-- 不支持预览的文件类型 -->
      <div v-else class="unsupported-preview">
        <el-icon :size="60"><Document /></el-icon>
        <p>此文件类型不支持在线预览</p>
        <p class="file-info">
          文件名: {{ previewFile.originalName }}<br>
          文件大小: {{ formatFileSize(previewFile.fileSize) }}
        </p>
        <el-button type="primary" @click="downloadFile">下载文件</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const previewDialogVisible = ref(false)
const previewFile = ref<SysOssVo | null>(null)
const videoError = ref(false)

const isImage = (file: SysOssVo): boolean => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(
    file.fileSuffix.toLowerCase()
  )
}

const isVideo = (file: SysOssVo): boolean => {
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(
    file.fileSuffix.toLowerCase()
  )
}

const handleImageError = (error: Event) => {
  console.error('图片加载失败:', error)
  ElMessage.error('图片加载失败,请检查文件是否存在或网络连接')
}

const handleVideoError = (error: Event) => {
  console.error('视频加载失败:', error)
  videoError.value = true
  ElMessage.error('视频加载失败,建议下载后播放')
}

const retryLoad = () => {
  // 强制刷新图片
  if (previewFile.value) {
    const url = previewFile.value.url
    previewFile.value.url = ''
    setTimeout(() => {
      if (previewFile.value) {
        previewFile.value.url = url
      }
    }, 100)
  }
}

const downloadFile = () => {
  if (previewFile.value) {
    const link = document.createElement('a')
    link.href = previewFile.value.url
    link.download = previewFile.value.originalName
    link.click()
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
</script>

```

### 5. 多选模式下无法取消选择

**问题描述:**

在多选模式下,点击已选中的文件卡片时,复选框状态不更新,无法取消选择,只能重新打开组件才能清空选择。

**问题原因:**

- 选中状态管理逻辑有误,没有处理取消选择的情况
- 复选框的 `v-model` 绑定有问题
- 点击事件被其他元素拦截,没有触发选择逻辑

**解决方案:**

```vue
<template>
  <div
    v-for="file in fileList"
    :key="file.ossId"
    class="file-card"
    :class="{ selected: isFileSelected(file) }"
    @click="toggleFileSelection(file)"
  >
    <!-- 多选模式下显示复选框 -->
    <el-checkbox
      v-if="multiSelect"
      :model-value="isFileSelected(file)"
      @click.stop="toggleFileSelection(file)"
    />

    <!-- 文件缩略图 -->
    <div class="file-thumbnail">
      <img v-if="isImage(file)" :src="file.url" alt="" />
      <el-icon v-else :size="40"><Document /></el-icon>
    </div>

    <!-- 文件信息 -->
    <div class="file-info">
      <p class="file-name">{{ file.fileName }}</p>
      <p class="file-size">{{ formatFileSize(file.fileSize) }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

interface Props {
  multiSelect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiSelect: false
})

const fileList = ref<SysOssVo[]>([])
const selectedFiles = ref<SysOssVo[]>([])

// 判断文件是否已选中
const isFileSelected = (file: SysOssVo): boolean => {
  return selectedFiles.value.some(f => f.ossId === file.ossId)
}

// 切换文件选中状态
const toggleFileSelection = (file: SysOssVo) => {
  const index = selectedFiles.value.findIndex(f => f.ossId === file.ossId)

  if (index > -1) {
    // 已选中,取消选择
    selectedFiles.value.splice(index, 1)
  } else {
    // 未选中,添加选择
    if (props.multiSelect) {
      // 多选模式:追加到数组
      selectedFiles.value.push(file)
    } else {
      // 单选模式:替换数组
      selectedFiles.value = [file]
    }
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// 判断是否为图片
const isImage = (file: SysOssVo): boolean => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(
    file.fileSuffix.toLowerCase()
  )
}
</script>

```

**技术要点:**

- 使用数组管理选中的文件列表,通过 `ossId` 判断文件是否已选中
- `toggleFileSelection` 方法处理选中和取消选中的逻辑
- 使用 `findIndex` 查找文件在选中数组中的位置
- 如果找到(index > -1),使用 `splice` 移除该文件
- 如果未找到,根据单选/多选模式添加文件到选中数组
- 复选框使用 `:model-value` 而不是 `v-model`,避免双向绑定导致的状态混乱
- 复选框添加 `@click.stop` 阻止事件冒泡,确保点击复选框时只触发一次选择逻辑
- 文件卡片添加 `selected` 类名提供视觉反馈,让用户清楚知道哪些文件已选中
