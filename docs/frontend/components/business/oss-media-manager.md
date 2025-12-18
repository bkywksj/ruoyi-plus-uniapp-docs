# 媒体库组件 (AOssMediaManager)

## 介绍

AOssMediaManager 是一个功能完善的对象存储服务(OSS)媒体资源管理组件，提供文件浏览、上传、预览等核心功能。

**核心特性:**

- **目录树导航** - 支持目录创建、重命名、删除操作
- **文件网格视图** - 响应式网格布局展示文件列表
- **多种选择模式** - 支持单选和多选两种模式
- **文件上传管理** - 拖拽上传、点击上传、进度显示
- **文件操作功能** - 替换、移动、删除等操作
- **文件类型筛选** - 按图片、文档、视频、音频分类筛选
- **文件预览功能** - 图片、视频、音频在线预览
- **无限滚动加载** - IntersectionObserver 实现高性能加载

## 基本用法

### 单文件选择模式

```vue
<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">选择文件</el-button>

    <div v-if="selectedFile">
      <p>已选择: {{ selectedFile.fileName }}</p>
      <p>URL: {{ selectedFile.url }}</p>
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

const dialogVisible = ref(false)
const selectedFile = ref<SysOssVo | null>(null)

const handleConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}
</script>
```

### 多文件选择模式

```vue
<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">批量选择</el-button>

    <el-table v-if="selectedFiles.length" :data="selectedFiles">
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="fileSuffix" label="类型" width="80" />
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
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'

const dialogVisible = ref(false)
const selectedFiles = ref<SysOssVo[]>([])

const handleConfirm = (files: SysOssVo[]) => {
  selectedFiles.value = files
}
</script>
```

### 限制文件类型

```vue
<template>
  <div>
    <el-button @click="selectImages">只选择图片</el-button>
    <el-button @click="selectDocuments">只选择文档</el-button>

    <AOssMediaManager
      v-model="dialogVisible"
      :accept-file-types="acceptTypes"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dialogVisible = ref(false)
const acceptTypes = ref<string[]>([])

const selectImages = () => {
  acceptTypes.value = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  dialogVisible.value = true
}

const selectDocuments = () => {
  acceptTypes.value = ['pdf', 'doc', 'docx', 'xls', 'xlsx']
  dialogVisible.value = true
}

const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

### 限制文件大小

```vue
<template>
  <AOssMediaManager
    v-model="dialogVisible"
    :file-size="10"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dialogVisible = ref(false)

// fileSize 单位为 MB，设置为 10 表示限制最大 10MB
const handleConfirm = (files: SysOssVo[]) => {
  console.log('选中的文件:', files)
}
</script>
```

### 指定默认目录

```vue
<template>
  <AOssMediaManager
    v-model="dialogVisible"
    :default-directory-id="defaultDirId"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { listOssDirectoryTree } from '@/api/system/oss/ossDirectory/ossDirectoryApi'

const dialogVisible = ref(false)
const defaultDirId = ref<number | null>(null)

onMounted(async () => {
  const [err, data] = await listOssDirectoryTree()
  if (!err && data?.length) {
    defaultDirId.value = data[0].id as number
  }
})
</script>
```

### 启用文件替换功能

```vue
<template>
  <AOssMediaManager
    v-model="dialogVisible"
    :enable-replace="true"
    @confirm="handleConfirm"
  />
</template>
```

## 高级功能

### 目录树管理

- 右键点击目录节点可进行创建、重命名、删除操作
- 点击目录节点加载该目录下的文件列表
- 支持目录树的展开和折叠

### 文件上传管理

- 支持拖拽文件到上传区域
- 支持点击上传按钮选择文件
- 上传前校验文件类型和大小
- 上传过程中显示进度条
- 上传成功后自动刷新文件列表

### 文件预览功能

| 文件类型 | 预览方式 |
|---------|---------|
| 图片 | `el-image` 组件，支持缩放旋转 |
| 视频 | `<video>` 标签播放 |
| 音频 | `<audio>` 标签播放 |
| PDF | `<iframe>` 嵌入显示 |
| 文本 | `<pre>` 标签显示内容 |
| 其他 | 提示不支持，提供下载 |

### 文件类型筛选

| 类型 | 扩展名 |
|------|--------|
| 图片 | jpg, jpeg, png, gif, webp, svg, bmp |
| 文档 | pdf, doc, docx, xls, xlsx, ppt, pptx, txt |
| 视频 | mp4, avi, mov, wmv, flv, mkv |
| 音频 | mp3, wav, ogg, aac, flac |

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 控制显示隐藏 | `boolean` | `false` |
| multiSelect | 是否多选模式 | `boolean` | `false` |
| fileSize | 文件大小限制(MB) | `number` | - |
| showMove | 是否显示移动按钮 | `boolean` | `true` |
| defaultDirectoryId | 默认目录 ID | `number \| string \| null` | `null` |
| acceptFileTypes | 允许的文件类型 | `string[]` | - |
| enableReplace | 是否显示替换按钮 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显示状态改变 | `value: boolean` |
| confirm | 点击确定按钮 | `files: SysOssVo[]` |

### 类型定义

```typescript
/** OSS 媒体管理器组件属性 */
interface AOssMediaManagerProps {
  modelValue: boolean
  multiSelect?: boolean
  fileSize?: number
  showMove?: boolean
  defaultDirectoryId?: number | string | null
  acceptFileTypes?: string[]
  enableReplace?: boolean
}

/** OSS 文件视图对象 */
interface SysOssVo {
  ossId: string | number
  directoryId: string | number
  fileName: string
  originalName: string
  fileSuffix: string
  fileSize: number
  url: string
  createTime?: string
  createBy?: string
  updateTime?: string
  updateBy?: string
}

/** OSS 目录树视图对象 */
interface SysOssDirectoryTreeVo {
  id: number | string
  label: string
  parentId: number | string
  weight: number
  children: SysOssDirectoryTreeVo[]
  directoryPath: string
}

/** 文件类型分类 */
type FileTypeCategory = 'all' | 'image' | 'document' | 'video' | 'audio' | 'other'
```

## 主题定制

```scss
.a-oss-media-manager {
  --oss-tree-width: 240px;
  --oss-tree-bg: var(--el-bg-color);
  --oss-tree-border: var(--el-border-color);
  --oss-card-width: 150px;
  --oss-card-gap: 16px;
  --oss-card-bg: var(--el-fill-color-light);
  --oss-card-hover-bg: var(--el-fill-color);
  --oss-card-selected-border: var(--el-color-primary);
  --oss-toolbar-height: 60px;
}
```

## 最佳实践

### 1. 合理使用文件类型限制

```vue
<!-- 头像上传：只允许图片，限制 2MB -->
<AOssMediaManager
  v-model="avatarDialogVisible"
  :accept-file-types="['jpg', 'jpeg', 'png', 'gif']"
  :file-size="2"
  @confirm="handleAvatarConfirm"
/>

<!-- 文档上传：允许多种文档格式 -->
<AOssMediaManager
  v-model="documentDialogVisible"
  :accept-file-types="['pdf', 'doc', 'docx']"
  :file-size="10"
  :multi-select="true"
  @confirm="handleDocumentConfirm"
/>
```

### 2. 正确处理文件选择结果

```typescript
// 单文件选择
const handleSingleConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    form.cover = files[0].url
    formRef.value?.validateField('cover')
  }
}

// 多文件选择
const handleMultiConfirm = (files: SysOssVo[]) => {
  const newImages = files.map(file => file.url)
  form.images.push(...newImages)
}
```

### 3. 目录结构规划

```
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
└── temp/           # 临时文件
```

### 4. 与表单组件集成

```vue
<template>
  <el-form :model="form" :rules="rules">
    <el-form-item label="封面" prop="cover" required>
      <div v-if="form.cover" class="cover-preview">
        <img :src="form.cover" alt="封面" />
        <el-button size="small" @click="selectCover">更换</el-button>
      </div>
      <el-button v-else @click="selectCover">选择封面</el-button>
    </el-form-item>
  </el-form>

  <AOssMediaManager
    v-model="coverDialogVisible"
    :accept-file-types="['jpg', 'jpeg', 'png']"
    :file-size="2"
    @confirm="handleCoverConfirm"
  />
</template>

<script lang="ts" setup>
const handleCoverConfirm = (files: SysOssVo[]) => {
  if (files.length > 0) {
    form.cover = files[0].url
    formRef.value?.validateField('cover')
  }
}
</script>
```

## 常见问题

### 1. 文件上传后列表未刷新

**原因:** 上传成功回调未触发刷新

**解决方案:**

```typescript
const handleUploadSuccess = () => {
  pagination.pageNum = 1
  fileList.value = []
  loadFileList()
  ElMessage.success('文件上传成功')
}
```

### 2. 大文件上传超时

**解决方案:**

```typescript
// 前端：设置较长超时时间
const uploadFile = async (file: File) => {
  const [err, data] = await uploadOss(formData, {
    timeout: 5 * 60 * 1000 // 5分钟
  })
}
```

```yaml
# 后端配置
spring:
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB
```

### 3. 文件预览加载失败

**原因:** URL 不可访问、CORS 问题、格式不支持

**解决方案:**

```vue
<el-image :src="file.url" @error="handleImageError">
  <template #error>
    <div class="image-error">
      <p>图片加载失败</p>
      <el-button size="small" @click="downloadFile">下载文件</el-button>
    </div>
  </template>
</el-image>
```

### 4. 多选模式下无法取消选择

**解决方案:**

```typescript
const toggleFileSelection = (file: SysOssVo) => {
  const index = selectedFiles.value.findIndex(f => f.ossId === file.ossId)

  if (index > -1) {
    // 已选中，取消选择
    selectedFiles.value.splice(index, 1)
  } else {
    // 未选中，添加选择
    if (props.multiSelect) {
      selectedFiles.value.push(file)
    } else {
      selectedFiles.value = [file]
    }
  }
}
```

### 5. 目录树展开状态未保存

**解决方案:**

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
  expandedKeys.value.push(data.id)
  localStorage.setItem('oss-tree-expanded-keys', JSON.stringify(expandedKeys.value))
}
```

## 总结

AOssMediaManager 核心要点:

1. **选择模式** - 通过 `multiSelect` 控制单选/多选
2. **文件限制** - `acceptFileTypes` 限制类型，`fileSize` 限制大小
3. **目录导航** - `defaultDirectoryId` 指定默认目录
4. **文件操作** - `showMove` 控制移动，`enableReplace` 控制替换
5. **事件处理** - 通过 `confirm` 事件获取选中文件
