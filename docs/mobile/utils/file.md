# 文件处理工具

## 概述

RuoYi-Plus-UniApp 移动端提供了完整的文件处理解决方案,涵盖文件选择、上传、下载、预览、验证等核心功能。基于 UniApp 原生 API 深度封装,支持多平台兼容,配合 OSS 对象存储实现高效的文件管理。

### 核心特性

- **文件选择** - 支持图片、视频、音频、文档等多种文件类型选择
- **文件上传** - 提供标准上传和直传模式,支持进度监控和中断控制
- **文件下载** - 支持文件下载、缓存管理、断点续传
- **文件预览** - 图片预览、文档预览、视频播放等
- **文件验证** - 类型验证、大小限制、文件名检查等
- **类型检测** - 自动识别文件类型、MIME 类型、扩展名
- **剪贴板操作** - 跨平台的复制粘贴功能
- **TypeScript 支持** - 完整的类型定义,提供开发时类型检查

### 技术栈

| 依赖 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0+ | 跨平台框架 |
| Vue 3 | 3.4.21 | 组合式 API |
| TypeScript | 5.7.2 | 类型支持 |

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                       应用层 (业务代码)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                   文件上传 Composable                  │  │
│   │  ┌─────────────────────────────────────────────────┐  │  │
│   │  │               useUpload.ts                       │  │  │
│   │  │ ┌─────────────┬─────────────┬─────────────────┐ │  │  │
│   │  │ │ 标准上传    │ 直传模式    │ 进度监控        │ │  │  │
│   │  │ │ uploadFile  │ directUpload│ onProgressUpdate│ │  │  │
│   │  │ └─────────────┴─────────────┴─────────────────┘ │  │  │
│   │  └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    文件工具层                         │  │
│   │  ┌───────────────┬───────────────┬───────────────┐  │  │
│   │  │  validators   │   function    │    types      │  │  │
│   │  │ ┌───────────┐ │ ┌───────────┐ │ ┌───────────┐ │  │  │
│   │  │ │ 文件验证  │ │ │ 剪贴板    │ │ │ 类型定义  │ │  │  │
│   │  │ │ 类型检测  │ │ │ 异步工具  │ │ │ 接口声明  │ │  │  │
│   │  │ │ 大小限制  │ │ │ 平台兼容  │ │ │ 枚举定义  │ │  │  │
│   │  │ └───────────┘ │ └───────────┘ │ └───────────┘ │  │  │
│   │  └───────────────┴───────────────┴───────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    存储服务层                         │  │
│   │  ┌─────────────────────────────────────────────────┐  │  │
│   │  │              OSS 对象存储服务                     │  │  │
│   │  │   getPresignedUrl / uploadFile / confirmUpload  │  │  │
│   │  └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心文件结构

```
plus-uniapp/src/
├── composables/
│   └── useUpload.ts       # 文件上传组合式函数
├── utils/
│   ├── function.ts        # 剪贴板、异步工具
│   └── validators.ts      # 文件验证工具
└── types/
    └── upload.ts          # 上传相关类型定义
```

## 文件选择

### uni.chooseFile API

UniApp 提供了统一的文件选择 API,支持选择不同类型的文件:

```typescript
// 基础用法
uni.chooseFile({
  count: 1,                    // 最多选择文件数量
  type: 'all',                 // 文件类型
  extension: ['.pdf', '.doc'], // 限制文件扩展名
  success: (res) => {
    console.log('选择的文件:', res.tempFiles)
  },
  fail: (err) => {
    console.error('选择失败:', err)
  }
})
```

### 选择图片

```typescript
/**
 * 选择图片文件
 */
const chooseImage = () => {
  return new Promise<UniApp.ChooseImageSuccessCallbackResult>((resolve, reject) => {
    uni.chooseImage({
      count: 9,                        // 最多选择9张
      sizeType: ['original', 'compressed'], // 原图或压缩图
      sourceType: ['album', 'camera'], // 相册或相机
      success: resolve,
      fail: reject
    })
  })
}

// 使用示例
const handleChooseImage = async () => {
  try {
    const res = await chooseImage()
    console.log('选择的图片:', res.tempFilePaths)
    console.log('图片信息:', res.tempFiles)

    // 遍历处理每张图片
    res.tempFiles.forEach((file, index) => {
      console.log(`图片${index + 1}:`, {
        path: file.path,
        size: file.size,
        name: file.name
      })
    })
  } catch (error) {
    console.error('选择图片失败:', error)
  }
}
```

**参数说明:**

| 参数 | 类型 | 说明 |
|------|------|------|
| count | number | 最多选择数量,默认9 |
| sizeType | `string[]` | 图片尺寸类型 |
| sourceType | `string[]` | 图片来源 |

### 选择视频

```typescript
/**
 * 选择视频文件
 */
const chooseVideo = () => {
  return new Promise<UniApp.ChooseVideoSuccessCallbackResult>((resolve, reject) => {
    uni.chooseVideo({
      sourceType: ['album', 'camera'], // 相册或相机
      maxDuration: 60,                  // 最长时长(秒)
      camera: 'back',                   // 默认后置摄像头
      compressed: true,                 // 是否压缩
      success: resolve,
      fail: reject
    })
  })
}

// 使用示例
const handleChooseVideo = async () => {
  try {
    const res = await chooseVideo()
    console.log('视频信息:', {
      path: res.tempFilePath,
      duration: res.duration,
      size: res.size,
      width: res.width,
      height: res.height
    })
  } catch (error) {
    console.error('选择视频失败:', error)
  }
}
```

### 选择媒体文件

```typescript
/**
 * 选择媒体文件(图片或视频)
 */
const chooseMedia = () => {
  return new Promise<UniApp.ChooseMediaSuccessCallbackResult>((resolve, reject) => {
    uni.chooseMedia({
      count: 9,                         // 最多选择数量
      mediaType: ['image', 'video'],    // 媒体类型
      sourceType: ['album', 'camera'],  // 来源
      maxDuration: 30,                  // 视频最长时长
      camera: 'back',                   // 摄像头
      success: resolve,
      fail: reject
    })
  })
}

// 使用示例
const handleChooseMedia = async () => {
  try {
    const res = await chooseMedia()
    console.log('媒体类型:', res.type)  // 'image' 或 'video'

    res.tempFiles.forEach((file, index) => {
      console.log(`文件${index + 1}:`, {
        path: file.tempFilePath,
        size: file.size,
        duration: file.duration,  // 仅视频有
        width: file.width,
        height: file.height,
        fileType: file.fileType   // 'image' 或 'video'
      })
    })
  } catch (error) {
    console.error('选择媒体失败:', error)
  }
}
```

### 选择任意文件

```typescript
/**
 * 选择任意类型文件
 */
const chooseFile = (options: {
  count?: number
  type?: 'all' | 'image' | 'video' | 'file'
  extension?: string[]
}) => {
  return new Promise<UniApp.ChooseFileSuccessCallbackResult>((resolve, reject) => {
    uni.chooseFile({
      count: options.count || 1,
      type: options.type || 'all',
      extension: options.extension,
      success: resolve,
      fail: reject
    })
  })
}

// 选择 PDF 文件
const handleChoosePDF = async () => {
  try {
    const res = await chooseFile({
      count: 1,
      type: 'file',
      extension: ['.pdf']
    })
    console.log('PDF文件:', res.tempFiles[0])
  } catch (error) {
    console.error('选择失败:', error)
  }
}

// 选择文档文件
const handleChooseDocument = async () => {
  try {
    const res = await chooseFile({
      count: 5,
      type: 'file',
      extension: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf']
    })
    console.log('文档文件:', res.tempFiles)
  } catch (error) {
    console.error('选择失败:', error)
  }
}

// 选择所有类型
const handleChooseAll = async () => {
  try {
    const res = await chooseFile({
      count: 10,
      type: 'all'
    })
    console.log('选择的文件:', res.tempFiles)
  } catch (error) {
    console.error('选择失败:', error)
  }
}
```

### 文件选择组件封装

```vue
<template>
  <view class="file-picker">
    <view class="picker-header">
      <text class="title">选择文件</text>
      <text class="count">{{ files.length }}/{{ maxCount }}</text>
    </view>

    <!-- 文件列表 -->
    <view class="file-list">
      <view
        v-for="(file, index) in files"
        :key="index"
        class="file-item"
      >
        <!-- 图片预览 -->
        <image
          v-if="isImage(file)"
          :src="file.path"
          mode="aspectFill"
          class="file-preview"
        />
        <!-- 其他文件图标 -->
        <view v-else class="file-icon">
          <wd-icon :name="getFileIcon(file)" size="48" />
        </view>

        <!-- 文件信息 -->
        <view class="file-info">
          <text class="file-name">{{ file.name }}</text>
          <text class="file-size">{{ formatSize(file.size) }}</text>
        </view>

        <!-- 删除按钮 -->
        <view class="delete-btn" @click="removeFile(index)">
          <wd-icon name="close" size="24" />
        </view>
      </view>

      <!-- 添加按钮 -->
      <view
        v-if="files.length < maxCount"
        class="add-btn"
        @click="showActionSheet"
      >
        <wd-icon name="add" size="48" color="#999" />
        <text class="add-text">添加文件</text>
      </view>
    </view>

    <!-- 选择方式 -->
    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface FileItem {
  path: string
  name: string
  size: number
  type?: string
}

const props = withDefaults(defineProps<{
  maxCount?: number
  maxSize?: number  // 单位: MB
  accept?: string[] // 允许的扩展名
}>(), {
  maxCount: 9,
  maxSize: 10,
  accept: () => []
})

const emit = defineEmits<{
  change: [files: FileItem[]]
}>()

const files = ref<FileItem[]>([])
const showSheet = ref(false)

const actions = [
  { name: '拍照', value: 'camera' },
  { name: '从相册选择', value: 'album' },
  { name: '选择文件', value: 'file' }
]

// 显示选择方式
const showActionSheet = () => {
  showSheet.value = true
}

// 处理选择
const handleSelect = async (item: { value: string }) => {
  showSheet.value = false

  try {
    let newFiles: FileItem[] = []

    if (item.value === 'camera') {
      // 拍照
      const res = await uni.chooseImage({
        count: 1,
        sourceType: ['camera']
      })
      newFiles = res.tempFiles.map(f => ({
        path: f.path,
        name: f.name || `photo_${Date.now()}.jpg`,
        size: f.size,
        type: 'image'
      }))
    } else if (item.value === 'album') {
      // 相册
      const remaining = props.maxCount - files.value.length
      const res = await uni.chooseImage({
        count: remaining,
        sourceType: ['album']
      })
      newFiles = res.tempFiles.map(f => ({
        path: f.path,
        name: f.name || `image_${Date.now()}.jpg`,
        size: f.size,
        type: 'image'
      }))
    } else {
      // 文件
      const res = await uni.chooseFile({
        count: props.maxCount - files.value.length,
        type: 'all',
        extension: props.accept.length > 0 ? props.accept : undefined
      })
      newFiles = res.tempFiles.map(f => ({
        path: f.path,
        name: f.name,
        size: f.size
      }))
    }

    // 验证文件大小
    const validFiles = newFiles.filter(f => {
      if (f.size > props.maxSize * 1024 * 1024) {
        uni.showToast({
          title: `${f.name} 超过${props.maxSize}MB限制`,
          icon: 'none'
        })
        return false
      }
      return true
    })

    files.value = [...files.value, ...validFiles]
    emit('change', files.value)
  } catch (error) {
    console.error('选择文件失败:', error)
  }
}

// 删除文件
const removeFile = (index: number) => {
  files.value.splice(index, 1)
  emit('change', files.value)
}

// 判断是否为图片
const isImage = (file: FileItem) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')
}

// 获取文件图标
const getFileIcon = (file: FileItem) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    ppt: 'file-ppt',
    pptx: 'file-ppt',
    zip: 'file-zip',
    rar: 'file-zip',
    mp3: 'file-music',
    mp4: 'file-video',
    txt: 'file-text'
  }
  return iconMap[ext || ''] || 'file'
}

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>

```

## 文件上传

### useUpload 组合式函数

项目提供了 `useUpload` 组合式函数,封装了完整的文件上传逻辑:

```typescript
// composables/useUpload.ts

import { ref } from 'vue'

/**
 * 上传状态枚举
 */
export enum UPLOAD_STATUS {
  PENDING = 'pending',   // 等待上传
  LOADING = 'loading',   // 上传中
  SUCCESS = 'success',   // 上传成功
  FAIL = 'fail'          // 上传失败
}

/**
 * 上传文件项接口
 */
export interface UploadFileItem {
  /** 文件唯一标识 */
  uid: string
  /** 文件名称 */
  name: string
  /** 文件大小(字节) */
  size: number
  /** 文件类型 */
  type?: string
  /** 本地临时路径 */
  tempFilePath: string
  /** 上传后的URL */
  url?: string
  /** 上传状态 */
  status: UPLOAD_STATUS
  /** 上传进度(0-100) */
  percent: number
  /** 错误信息 */
  error?: string
  /** OSS 文件ID */
  ossId?: string
}

/**
 * 上传配置接口
 */
export interface UploadOptions {
  /** 上传地址 */
  action?: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 附加参数 */
  formData?: Record<string, any>
  /** 文件字段名 */
  name?: string
  /** 最大文件大小(MB) */
  maxSize?: number
  /** 允许的文件类型 */
  accept?: string[]
  /** 是否直传 */
  directUpload?: boolean
}

/**
 * 文件上传组合式函数
 */
export function useUpload(options: UploadOptions = {}) {
  const {
    action = '/resource/oss/upload',
    headers = {},
    formData = {},
    name = 'file',
    maxSize = 10,
    accept = [],
    directUpload = false
  } = options

  // 文件列表
  const fileList = ref<UploadFileItem[]>([])

  // 是否正在上传
  const uploading = ref(false)

  /**
   * 生成唯一ID
   */
  const generateUid = () => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 添加文件到列表
   */
  const addFile = (file: {
    path: string
    name: string
    size: number
    type?: string
  }): UploadFileItem => {
    const item: UploadFileItem = {
      uid: generateUid(),
      name: file.name,
      size: file.size,
      type: file.type,
      tempFilePath: file.path,
      status: UPLOAD_STATUS.PENDING,
      percent: 0
    }
    fileList.value.push(item)
    return item
  }

  /**
   * 验证文件
   */
  const validateFile = (file: { name: string; size: number }): string | null => {
    // 验证大小
    if (file.size > maxSize * 1024 * 1024) {
      return `文件大小不能超过${maxSize}MB`
    }

    // 验证类型
    if (accept.length > 0) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!accept.includes(ext)) {
        return `不支持${ext}格式的文件`
      }
    }

    return null
  }

  /**
   * 标准上传
   */
  const uploadFile = async (item: UploadFileItem): Promise<void> => {
    item.status = UPLOAD_STATUS.LOADING
    item.percent = 0

    return new Promise((resolve, reject) => {
      const uploadTask = uni.uploadFile({
        url: action,
        filePath: item.tempFilePath,
        name,
        header: headers,
        formData,
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data)
              if (data.code === 200) {
                item.status = UPLOAD_STATUS.SUCCESS
                item.percent = 100
                item.url = data.data.url
                item.ossId = data.data.ossId
                resolve()
              } else {
                throw new Error(data.msg || '上传失败')
              }
            } catch (e) {
              item.status = UPLOAD_STATUS.FAIL
              item.error = e instanceof Error ? e.message : '解析响应失败'
              reject(e)
            }
          } else {
            item.status = UPLOAD_STATUS.FAIL
            item.error = `HTTP错误: ${res.statusCode}`
            reject(new Error(item.error))
          }
        },
        fail: (err) => {
          item.status = UPLOAD_STATUS.FAIL
          item.error = err.errMsg || '上传失败'
          reject(err)
        }
      })

      // 监听进度
      uploadTask.onProgressUpdate((res) => {
        item.percent = res.progress
      })
    })
  }

  /**
   * 直传模式 - 获取预签名URL
   */
  const getPresignedUrl = async (filename: string): Promise<{
    url: string
    ossId: string
  }> => {
    const [err, res] = await http.get<{
      url: string
      ossId: string
    }>('/resource/oss/presignedUrl', { filename })

    if (err) {
      throw new Error('获取上传地址失败')
    }

    return res!
  }

  /**
   * 直传模式 - 上传到云存储
   */
  const uploadToCloud = async (
    item: UploadFileItem,
    presignedUrl: string
  ): Promise<void> => {
    item.status = UPLOAD_STATUS.LOADING
    item.percent = 0

    return new Promise((resolve, reject) => {
      const uploadTask = uni.uploadFile({
        url: presignedUrl,
        filePath: item.tempFilePath,
        name: 'file',
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            item.percent = 100
            resolve()
          } else {
            item.status = UPLOAD_STATUS.FAIL
            item.error = `上传失败: ${res.statusCode}`
            reject(new Error(item.error))
          }
        },
        fail: (err) => {
          item.status = UPLOAD_STATUS.FAIL
          item.error = err.errMsg || '上传失败'
          reject(err)
        }
      })

      uploadTask.onProgressUpdate((res) => {
        item.percent = Math.min(res.progress, 99) // 保留1%给确认步骤
      })
    })
  }

  /**
   * 直传模式 - 确认上传
   */
  const confirmDirectUpload = async (ossId: string): Promise<string> => {
    const [err, res] = await http.post<{ url: string }>(
      '/resource/oss/confirmDirectUpload',
      { ossId }
    )

    if (err) {
      throw new Error('确认上传失败')
    }

    return res!.url
  }

  /**
   * 直传文件
   */
  const directUploadFile = async (item: UploadFileItem): Promise<void> => {
    try {
      // 1. 获取预签名URL
      const { url: presignedUrl, ossId } = await getPresignedUrl(item.name)
      item.ossId = ossId

      // 2. 上传到云存储
      await uploadToCloud(item, presignedUrl)

      // 3. 确认上传
      item.url = await confirmDirectUpload(ossId)
      item.status = UPLOAD_STATUS.SUCCESS
      item.percent = 100
    } catch (error) {
      item.status = UPLOAD_STATUS.FAIL
      item.error = error instanceof Error ? error.message : '直传失败'
      throw error
    }
  }

  /**
   * 上传单个文件
   */
  const upload = async (item: UploadFileItem): Promise<void> => {
    if (directUpload) {
      return directUploadFile(item)
    }
    return uploadFile(item)
  }

  /**
   * 上传所有待上传文件
   */
  const uploadAll = async (): Promise<void> => {
    const pendingFiles = fileList.value.filter(
      f => f.status === UPLOAD_STATUS.PENDING || f.status === UPLOAD_STATUS.FAIL
    )

    if (pendingFiles.length === 0) return

    uploading.value = true

    try {
      await Promise.all(pendingFiles.map(upload))
    } finally {
      uploading.value = false
    }
  }

  /**
   * 移除文件
   */
  const removeFile = (uid: string) => {
    const index = fileList.value.findIndex(f => f.uid === uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }

  /**
   * 清空文件列表
   */
  const clearFiles = () => {
    fileList.value = []
  }

  /**
   * 获取成功上传的文件
   */
  const getSuccessFiles = () => {
    return fileList.value.filter(f => f.status === UPLOAD_STATUS.SUCCESS)
  }

  /**
   * 获取失败的文件
   */
  const getFailedFiles = () => {
    return fileList.value.filter(f => f.status === UPLOAD_STATUS.FAIL)
  }

  return {
    fileList,
    uploading,
    addFile,
    validateFile,
    upload,
    uploadAll,
    removeFile,
    clearFiles,
    getSuccessFiles,
    getFailedFiles
  }
}
```

### 基础上传示例

```vue
<template>
  <view class="upload-demo">
    <!-- 选择文件按钮 -->
    <wd-button type="primary" @click="chooseAndUpload">
      选择并上传
    </wd-button>

    <!-- 上传列表 -->
    <view class="upload-list">
      <view
        v-for="file in fileList"
        :key="file.uid"
        class="upload-item"
      >
        <view class="file-info">
          <text class="name">{{ file.name }}</text>
          <text class="size">{{ formatSize(file.size) }}</text>
        </view>

        <!-- 进度条 -->
        <wd-progress
          v-if="file.status === 'loading'"
          :percentage="file.percent"
        />

        <!-- 状态 -->
        <view class="status">
          <text v-if="file.status === 'pending'" class="pending">等待上传</text>
          <text v-if="file.status === 'loading'" class="loading">上传中...</text>
          <text v-if="file.status === 'success'" class="success">上传成功</text>
          <text v-if="file.status === 'fail'" class="fail">{{ file.error }}</text>
        </view>

        <!-- 操作 -->
        <view class="actions">
          <wd-button
            v-if="file.status === 'fail'"
            size="small"
            @click="retryUpload(file)"
          >
            重试
          </wd-button>
          <wd-button
            size="small"
            type="error"
            @click="removeFile(file.uid)"
          >
            删除
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUpload, UPLOAD_STATUS } from '@/composables/useUpload'

const {
  fileList,
  uploading,
  addFile,
  validateFile,
  upload,
  removeFile
} = useUpload({
  maxSize: 10,
  accept: ['.jpg', '.jpeg', '.png', '.pdf']
})

// 选择并上传
const chooseAndUpload = async () => {
  try {
    // 选择文件
    const res = await uni.chooseFile({
      count: 5,
      type: 'all'
    })

    // 验证并添加文件
    for (const file of res.tempFiles) {
      const error = validateFile(file)
      if (error) {
        uni.showToast({ title: error, icon: 'none' })
        continue
      }

      const item = addFile({
        path: file.path,
        name: file.name,
        size: file.size
      })

      // 立即上传
      try {
        await upload(item)
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (e) {
        console.error('上传失败:', e)
      }
    }
  } catch (error) {
    console.error('选择文件失败:', error)
  }
}

// 重试上传
const retryUpload = async (file: UploadFileItem) => {
  file.status = UPLOAD_STATUS.PENDING
  file.error = undefined
  try {
    await upload(file)
  } catch (e) {
    console.error('重试失败:', e)
  }
}

// 格式化大小
const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>

```

### 直传模式示例

```vue
<template>
  <view class="direct-upload">
    <wd-button type="primary" @click="handleDirectUpload">
      直传文件
    </wd-button>

    <view v-if="currentFile" class="upload-progress">
      <text>{{ currentFile.name }}</text>
      <wd-progress :percentage="currentFile.percent" />
      <text>{{ statusText }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUpload, UPLOAD_STATUS, type UploadFileItem } from '@/composables/useUpload'

const {
  addFile,
  validateFile,
  upload
} = useUpload({
  directUpload: true,  // 启用直传模式
  maxSize: 50          // 直传支持更大文件
})

const currentFile = ref<UploadFileItem | null>(null)

const statusText = computed(() => {
  if (!currentFile.value) return ''
  switch (currentFile.value.status) {
    case UPLOAD_STATUS.PENDING: return '准备上传...'
    case UPLOAD_STATUS.LOADING: return '上传中...'
    case UPLOAD_STATUS.SUCCESS: return '上传成功'
    case UPLOAD_STATUS.FAIL: return currentFile.value.error || '上传失败'
    default: return ''
  }
})

const handleDirectUpload = async () => {
  try {
    // 选择文件
    const res = await uni.chooseFile({
      count: 1,
      type: 'all'
    })

    const file = res.tempFiles[0]

    // 验证
    const error = validateFile(file)
    if (error) {
      uni.showToast({ title: error, icon: 'none' })
      return
    }

    // 添加文件
    currentFile.value = addFile({
      path: file.path,
      name: file.name,
      size: file.size
    })

    // 直传
    await upload(currentFile.value)

    uni.showToast({ title: '上传成功', icon: 'success' })
    console.log('文件URL:', currentFile.value.url)
  } catch (error) {
    console.error('直传失败:', error)
    uni.showToast({ title: '上传失败', icon: 'none' })
  }
}
</script>
```

## 文件下载

### 基础下载

```typescript
/**
 * 下载文件
 */
const downloadFile = (url: string, filename?: string) => {
  return new Promise<string>((resolve, reject) => {
    uni.showLoading({ title: '下载中...' })

    const downloadTask = uni.downloadFile({
      url,
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode === 200) {
          // 保存文件
          if (filename) {
            uni.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                resolve(saveRes.savedFilePath)
              },
              fail: () => {
                resolve(res.tempFilePath)
              }
            })
          } else {
            resolve(res.tempFilePath)
          }
        } else {
          reject(new Error(`下载失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        reject(err)
      }
    })

    // 监听下载进度
    downloadTask.onProgressUpdate((res) => {
      console.log(`下载进度: ${res.progress}%`)
    })
  })
}

// 使用示例
const handleDownload = async () => {
  try {
    const filePath = await downloadFile(
      'https://example.com/file.pdf',
      'document.pdf'
    )
    console.log('下载完成:', filePath)
    uni.showToast({ title: '下载成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '下载失败', icon: 'none' })
  }
}
```

### 带进度的下载组件

```vue
<template>
  <view class="download-demo">
    <view class="file-card" v-for="file in files" :key="file.id">
      <view class="file-info">
        <wd-icon :name="getFileIcon(file.name)" size="48" />
        <view class="file-detail">
          <text class="name">{{ file.name }}</text>
          <text class="size">{{ file.size }}</text>
        </view>
      </view>

      <!-- 下载进度 -->
      <view v-if="downloadingId === file.id" class="progress-wrap">
        <wd-progress :percentage="downloadProgress" />
        <text class="progress-text">{{ downloadProgress }}%</text>
      </view>

      <!-- 操作按钮 -->
      <view class="actions">
        <wd-button
          v-if="downloadingId !== file.id"
          size="small"
          @click="handleDownload(file)"
        >
          下载
        </wd-button>
        <wd-button
          v-else
          size="small"
          type="error"
          @click="cancelDownload"
        >
          取消
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface FileInfo {
  id: string
  name: string
  size: string
  url: string
}

const files = ref<FileInfo[]>([
  { id: '1', name: '项目文档.pdf', size: '2.5 MB', url: 'https://...' },
  { id: '2', name: '数据报表.xlsx', size: '1.2 MB', url: 'https://...' }
])

const downloadingId = ref<string | null>(null)
const downloadProgress = ref(0)
let downloadTask: UniApp.DownloadTask | null = null

// 获取文件图标
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel'
  }
  return iconMap[ext || ''] || 'file'
}

// 下载文件
const handleDownload = (file: FileInfo) => {
  downloadingId.value = file.id
  downloadProgress.value = 0

  downloadTask = uni.downloadFile({
    url: file.url,
    success: (res) => {
      if (res.statusCode === 200) {
        // 打开文件
        uni.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          success: () => {
            uni.showToast({ title: '打开成功', icon: 'success' })
          },
          fail: () => {
            // 不支持打开,提示保存
            uni.saveFile({
              tempFilePath: res.tempFilePath,
              success: () => {
                uni.showToast({ title: '已保存到本地', icon: 'success' })
              }
            })
          }
        })
      }
    },
    fail: (err) => {
      if (err.errMsg.includes('abort')) {
        uni.showToast({ title: '已取消下载', icon: 'none' })
      } else {
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    },
    complete: () => {
      downloadingId.value = null
      downloadTask = null
    }
  })

  downloadTask.onProgressUpdate((res) => {
    downloadProgress.value = res.progress
  })
}

// 取消下载
const cancelDownload = () => {
  if (downloadTask) {
    downloadTask.abort()
  }
}
</script>

```

## 文件预览

### 图片预览

```typescript
/**
 * 预览图片
 */
const previewImage = (urls: string[], current?: string) => {
  uni.previewImage({
    urls,
    current: current || urls[0],
    indicator: 'default',
    loop: true,
    longPressActions: {
      itemList: ['保存图片', '分享'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 保存图片
          saveImage(current || urls[0])
        } else if (res.tapIndex === 1) {
          // 分享
          shareImage(current || urls[0])
        }
      }
    }
  })
}

/**
 * 保存图片到相册
 */
const saveImage = (url: string) => {
  uni.showLoading({ title: '保存中...' })

  // 先下载图片
  uni.downloadFile({
    url,
    success: (res) => {
      if (res.statusCode === 200) {
        // 保存到相册
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.hideLoading()
            uni.showToast({ title: '保存成功', icon: 'success' })
          },
          fail: (err) => {
            uni.hideLoading()
            if (err.errMsg.includes('auth')) {
              // 无权限
              uni.showModal({
                title: '提示',
                content: '请授权保存图片到相册',
                success: (res) => {
                  if (res.confirm) {
                    uni.openSetting()
                  }
                }
              })
            } else {
              uni.showToast({ title: '保存失败', icon: 'none' })
            }
          }
        })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
}

// 使用示例
const images = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
]

// 预览第二张图片
previewImage(images, images[1])
```

### 文档预览

```typescript
/**
 * 预览文档
 */
const previewDocument = async (url: string, filename?: string) => {
  uni.showLoading({ title: '加载中...' })

  try {
    // 下载文档
    const res = await new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
      uni.downloadFile({
        url,
        success: resolve,
        fail: reject
      })
    })

    uni.hideLoading()

    if (res.statusCode !== 200) {
      throw new Error('下载失败')
    }

    // 打开文档
    uni.openDocument({
      filePath: res.tempFilePath,
      showMenu: true,  // 显示右上角菜单
      fileType: getFileType(filename || url),
      success: () => {
        console.log('打开文档成功')
      },
      fail: (err) => {
        console.error('打开文档失败:', err)
        // 不支持的文件类型
        uni.showModal({
          title: '提示',
          content: '该文件类型暂不支持预览,是否下载到本地?',
          success: (res) => {
            if (res.confirm) {
              downloadToLocal(url, filename)
            }
          }
        })
      }
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

/**
 * 获取文件类型
 */
const getFileType = (filename: string): string | undefined => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    doc: 'doc',
    docx: 'docx',
    xls: 'xls',
    xlsx: 'xlsx',
    ppt: 'ppt',
    pptx: 'pptx',
    pdf: 'pdf'
  }
  return typeMap[ext || '']
}

// 使用示例
previewDocument('https://example.com/document.pdf', 'report.pdf')
```

### 视频预览

```typescript
/**
 * 预览视频
 */
const previewVideo = (url: string, title?: string) => {
  // 跳转到视频播放页面
  uni.navigateTo({
    url: `/pages/common/video-player?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`
  })
}

// 视频播放页面 video-player.vue
```

```vue
<!-- pages/common/video-player.vue -->
<template>
  <view class="video-player-page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="24" color="#fff" />
      </view>
      <text class="title">{{ title }}</text>
    </view>

    <video
      ref="videoRef"
      class="video"
      :src="videoUrl"
      :title="title"
      :autoplay="true"
      :controls="true"
      :show-fullscreen-btn="true"
      :show-play-btn="true"
      :show-center-play-btn="true"
      :enable-progress-gesture="true"
      @error="handleError"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onLoad } from '@dcloudio/uni-app'

const videoUrl = ref('')
const title = ref('')

onLoad((options) => {
  videoUrl.value = decodeURIComponent(options?.url || '')
  title.value = decodeURIComponent(options?.title || '视频播放')
})

const goBack = () => {
  uni.navigateBack()
}

const handleError = (e: any) => {
  console.error('视频播放错误:', e)
  uni.showToast({ title: '视频加载失败', icon: 'none' })
}
</script>

```

## 文件类型检测

### 扩展名获取

```typescript
/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') return ''

  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) return ''

  return filename.substring(lastDotIndex + 1).toLowerCase()
}

// 使用示例
console.log(getFileExtension('document.pdf'))    // 'pdf'
console.log(getFileExtension('image.JPG'))       // 'jpg'
console.log(getFileExtension('archive.tar.gz'))  // 'gz'
console.log(getFileExtension('noextension'))     // ''
console.log(getFileExtension('.gitignore'))      // 'gitignore'
```

### 文件类型判断

```typescript
/**
 * 文件类型映射
 */
const FILE_TYPE_MAP: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'ape'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
  code: ['js', 'ts', 'vue', 'jsx', 'tsx', 'css', 'scss', 'less', 'html', 'json', 'xml', 'md']
}

/**
 * 获取文件类型
 */
export function getFileType(filename: string): string {
  const ext = getFileExtension(filename)
  if (!ext) return 'unknown'

  for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
    if (extensions.includes(ext)) {
      return type
    }
  }

  return 'unknown'
}

// 使用示例
console.log(getFileType('photo.jpg'))      // 'image'
console.log(getFileType('movie.mp4'))      // 'video'
console.log(getFileType('song.mp3'))       // 'audio'
console.log(getFileType('report.pdf'))     // 'document'
console.log(getFileType('files.zip'))      // 'archive'
console.log(getFileType('app.tsx'))        // 'code'
console.log(getFileType('unknown.xyz'))    // 'unknown'
```

### MIME 类型获取

```typescript
/**
 * MIME 类型映射
 */
const MIME_TYPE_MAP: Record<string, string> = {
  // 图片
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',

  // 视频
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  mkv: 'video/x-matroska',
  webm: 'video/webm',

  // 音频
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  wma: 'audio/x-ms-wma',
  m4a: 'audio/mp4',

  // 文档
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  rtf: 'application/rtf',

  // 压缩包
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',

  // 代码
  js: 'application/javascript',
  ts: 'application/typescript',
  json: 'application/json',
  xml: 'application/xml',
  html: 'text/html',
  css: 'text/css',
  md: 'text/markdown'
}

/**
 * 获取 MIME 类型
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename)
  return MIME_TYPE_MAP[ext] || 'application/octet-stream'
}

// 使用示例
console.log(getMimeType('photo.jpg'))    // 'image/jpeg'
console.log(getMimeType('movie.mp4'))    // 'video/mp4'
console.log(getMimeType('data.json'))    // 'application/json'
console.log(getMimeType('unknown.xyz'))  // 'application/octet-stream'
```

### 类型判断工具

```typescript
/**
 * 判断是否为图片文件
 */
export function isImage(filename: string): boolean {
  return getFileType(filename) === 'image'
}

/**
 * 判断是否为视频文件
 */
export function isVideo(filename: string): boolean {
  return getFileType(filename) === 'video'
}

/**
 * 判断是否为音频文件
 */
export function isAudio(filename: string): boolean {
  return getFileType(filename) === 'audio'
}

/**
 * 判断是否为文档文件
 */
export function isDocument(filename: string): boolean {
  return getFileType(filename) === 'document'
}

/**
 * 判断是否为压缩包
 */
export function isArchive(filename: string): boolean {
  return getFileType(filename) === 'archive'
}

/**
 * 判断是否为代码文件
 */
export function isCode(filename: string): boolean {
  return getFileType(filename) === 'code'
}

// 使用示例
if (isImage(file.name)) {
  // 图片处理
  previewImage([file.url])
} else if (isVideo(file.name)) {
  // 视频处理
  previewVideo(file.url)
} else if (isDocument(file.name)) {
  // 文档处理
  previewDocument(file.url)
} else {
  // 其他文件下载
  downloadFile(file.url)
}
```

## 文件验证

### 文件类型验证

```typescript
/**
 * 验证文件类型是否允许
 */
export function isAllowedFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  if (!allowedTypes || allowedTypes.length === 0) return true

  const ext = getFileExtension(filename)
  if (!ext) return false

  // 支持两种格式: '.pdf' 或 'pdf'
  return allowedTypes.some(type => {
    const normalizedType = type.startsWith('.') ? type.slice(1) : type
    return ext === normalizedType.toLowerCase()
  })
}

// 使用示例
const allowed = ['.jpg', '.png', '.pdf']
console.log(isAllowedFileType('photo.jpg', allowed))   // true
console.log(isAllowedFileType('photo.PNG', allowed))   // true
console.log(isAllowedFileType('doc.docx', allowed))    // false
```

### 文件大小验证

```typescript
/**
 * 验证文件大小是否在限制内
 * @param size 文件大小(字节)
 * @param maxSize 最大大小(MB)
 */
export function isWithinFileSize(size: number, maxSize: number): boolean {
  if (!maxSize || maxSize <= 0) return true
  return size <= maxSize * 1024 * 1024
}

// 使用示例
const file = { size: 5 * 1024 * 1024 }  // 5MB
console.log(isWithinFileSize(file.size, 10))  // true (< 10MB)
console.log(isWithinFileSize(file.size, 3))   // false (> 3MB)
```

### 文件名验证

```typescript
/**
 * 验证文件名是否合法
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false

  // 文件名不能包含特殊字符
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/
  if (invalidChars.test(filename)) return false

  // 文件名不能以点或空格开头/结尾
  if (/^[\s.]|[\s.]$/.test(filename)) return false

  // 文件名长度限制
  if (filename.length > 255) return false

  // Windows 保留名称
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '')
  if (reservedNames.test(nameWithoutExt)) return false

  return true
}

// 使用示例
console.log(isValidFilename('document.pdf'))       // true
console.log(isValidFilename('file<name>.txt'))     // false
console.log(isValidFilename('.hidden'))            // false
console.log(isValidFilename('CON.txt'))            // false
```

### 综合验证函数

```typescript
/**
 * 文件验证结果接口
 */
interface FileValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 文件验证配置接口
 */
interface FileValidationOptions {
  /** 允许的文件类型 */
  allowedTypes?: string[]
  /** 最大文件大小(MB) */
  maxSize?: number
  /** 最小文件大小(字节) */
  minSize?: number
  /** 是否验证文件名 */
  validateName?: boolean
}

/**
 * 综合验证文件
 */
export function validateFile(
  file: { name: string; size: number },
  options: FileValidationOptions = {}
): FileValidationResult {
  const errors: string[] = []

  // 验证文件类型
  if (options.allowedTypes && options.allowedTypes.length > 0) {
    if (!isAllowedFileType(file.name, options.allowedTypes)) {
      const allowedStr = options.allowedTypes.join(', ')
      errors.push(`文件类型不支持,仅支持 ${allowedStr}`)
    }
  }

  // 验证最大大小
  if (options.maxSize && options.maxSize > 0) {
    if (!isWithinFileSize(file.size, options.maxSize)) {
      errors.push(`文件大小不能超过 ${options.maxSize}MB`)
    }
  }

  // 验证最小大小
  if (options.minSize && options.minSize > 0) {
    if (file.size < options.minSize) {
      errors.push(`文件大小不能小于 ${options.minSize} 字节`)
    }
  }

  // 验证文件名
  if (options.validateName !== false) {
    if (!isValidFilename(file.name)) {
      errors.push('文件名包含非法字符')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 使用示例
const file = { name: 'report.pdf', size: 5 * 1024 * 1024 }

const result = validateFile(file, {
  allowedTypes: ['.pdf', '.doc', '.docx'],
  maxSize: 10,
  minSize: 1024,
  validateName: true
})

if (!result.valid) {
  console.log('验证失败:', result.errors)
} else {
  console.log('验证通过')
}
```

## 剪贴板操作

### 复制文本

```typescript
/**
 * 复制文本到剪贴板
 */
export function copy(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(resolve)
        .catch(reject)
      return
    }

    // 降级方案
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      resolve()
    } catch (error) {
      reject(error)
    }
    // #endif

    // #ifndef H5
    uni.setClipboardData({
      data: text,
      success: () => resolve(),
      fail: (err) => reject(err)
    })
    // #endif
  })
}

// 使用示例
const handleCopy = async () => {
  try {
    await copy('要复制的文本内容')
    uni.showToast({ title: '复制成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '复制失败', icon: 'none' })
  }
}
```

### 粘贴文本

```typescript
/**
 * 从剪贴板粘贴文本
 */
export function paste(): Promise<string> {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    if (navigator.clipboard) {
      navigator.clipboard.readText()
        .then(resolve)
        .catch(reject)
      return
    }
    reject(new Error('浏览器不支持剪贴板读取'))
    // #endif

    // #ifndef H5
    uni.getClipboardData({
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    })
    // #endif
  })
}

// 使用示例
const handlePaste = async () => {
  try {
    const text = await paste()
    console.log('粘贴的内容:', text)
  } catch (error) {
    console.error('粘贴失败:', error)
  }
}
```

### 剪贴板操作组件

```vue
<template>
  <view class="clipboard-demo">
    <wd-input
      v-model="inputText"
      placeholder="输入要复制的内容"
    />

    <view class="btn-group">
      <wd-button type="primary" @click="handleCopy">
        复制
      </wd-button>
      <wd-button @click="handlePaste">
        粘贴
      </wd-button>
    </view>

    <view v-if="pastedText" class="result">
      <text class="label">粘贴结果:</text>
      <text class="content">{{ pastedText }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { copy, paste } from '@/utils/function'

const inputText = ref('')
const pastedText = ref('')

const handleCopy = async () => {
  if (!inputText.value) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  try {
    await copy(inputText.value)
    uni.showToast({ title: '复制成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '复制失败', icon: 'none' })
  }
}

const handlePaste = async () => {
  try {
    pastedText.value = await paste()
    uni.showToast({ title: '粘贴成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '粘贴失败', icon: 'none' })
  }
}
</script>

```

## 类型定义

### 完整类型定义

```typescript
/**
 * 上传状态枚举
 */
export enum UPLOAD_STATUS {
  /** 等待上传 */
  PENDING = 'pending',
  /** 上传中 */
  LOADING = 'loading',
  /** 上传成功 */
  SUCCESS = 'success',
  /** 上传失败 */
  FAIL = 'fail'
}

/**
 * 文件类型枚举
 */
export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'code'
  | 'unknown'

/**
 * 文件信息接口
 */
export interface FileInfo {
  /** 文件路径 */
  path: string
  /** 文件名 */
  name: string
  /** 文件大小(字节) */
  size: number
  /** 文件类型 */
  type?: string
  /** MIME 类型 */
  mimeType?: string
}

/**
 * 上传文件项接口
 */
export interface UploadFileItem extends FileInfo {
  /** 唯一标识 */
  uid: string
  /** 本地临时路径 */
  tempFilePath: string
  /** 上传后的 URL */
  url?: string
  /** 上传状态 */
  status: UPLOAD_STATUS
  /** 上传进度(0-100) */
  percent: number
  /** 错误信息 */
  error?: string
  /** OSS 文件ID */
  ossId?: string
}

/**
 * 上传配置接口
 */
export interface UploadOptions {
  /** 上传地址 */
  action?: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 附加参数 */
  formData?: Record<string, any>
  /** 文件字段名 */
  name?: string
  /** 最大文件大小(MB) */
  maxSize?: number
  /** 允许的文件类型 */
  accept?: string[]
  /** 是否直传 */
  directUpload?: boolean
}

/**
 * 文件验证配置接口
 */
export interface FileValidationOptions {
  /** 允许的文件类型 */
  allowedTypes?: string[]
  /** 最大文件大小(MB) */
  maxSize?: number
  /** 最小文件大小(字节) */
  minSize?: number
  /** 是否验证文件名 */
  validateName?: boolean
}

/**
 * 文件验证结果接口
 */
export interface FileValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误信息列表 */
  errors: string[]
}

/**
 * 预签名URL响应接口
 */
export interface PresignedUrlResponse {
  /** 预签名上传URL */
  url: string
  /** OSS 文件ID */
  ossId: string
}

/**
 * 下载进度接口
 */
export interface DownloadProgress {
  /** 下载进度(0-100) */
  progress: number
  /** 已下载字节数 */
  totalBytesWritten: number
  /** 总字节数 */
  totalBytesExpectedToWrite: number
}

// ============== 工具函数类型 ==============

/**
 * 获取文件扩展名
 */
declare function getFileExtension(filename: string): string

/**
 * 获取文件类型
 */
declare function getFileType(filename: string): FileType

/**
 * 获取 MIME 类型
 */
declare function getMimeType(filename: string): string

/**
 * 判断是否为图片文件
 */
declare function isImage(filename: string): boolean

/**
 * 判断是否为视频文件
 */
declare function isVideo(filename: string): boolean

/**
 * 判断是否为音频文件
 */
declare function isAudio(filename: string): boolean

/**
 * 判断是否为文档文件
 */
declare function isDocument(filename: string): boolean

/**
 * 判断是否为压缩包
 */
declare function isArchive(filename: string): boolean

/**
 * 验证文件类型是否允许
 */
declare function isAllowedFileType(
  filename: string,
  allowedTypes: string[]
): boolean

/**
 * 验证文件大小是否在限制内
 */
declare function isWithinFileSize(size: number, maxSize: number): boolean

/**
 * 验证文件名是否合法
 */
declare function isValidFilename(filename: string): boolean

/**
 * 综合验证文件
 */
declare function validateFile(
  file: { name: string; size: number },
  options?: FileValidationOptions
): FileValidationResult

/**
 * 复制文本到剪贴板
 */
declare function copy(text: string): Promise<void>

/**
 * 从剪贴板粘贴文本
 */
declare function paste(): Promise<string>
```

## 最佳实践

### 1. 文件选择前验证

```typescript
// ✅ 正确: 选择前配置好允许的类型
const chooseDocument = async () => {
  const res = await uni.chooseFile({
    count: 5,
    type: 'file',
    extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
  })
  return res.tempFiles
}

// ❌ 错误: 选择后才验证导致用户体验差
const chooseFile = async () => {
  const res = await uni.chooseFile({ type: 'all' })
  // 用户选了很多文件后才发现不支持...
  const validFiles = res.tempFiles.filter(f => isDocument(f.name))
  return validFiles
}
```

### 2. 上传进度反馈

```typescript
// ✅ 正确: 实时显示上传进度
const uploadWithProgress = async (file: UploadFileItem) => {
  const uploadTask = uni.uploadFile({
    url: '/api/upload',
    filePath: file.tempFilePath,
    name: 'file',
    success: handleSuccess,
    fail: handleFail
  })

  // 监听进度
  uploadTask.onProgressUpdate((res) => {
    file.percent = res.progress
    // 更新 UI
    updateProgressBar(file.uid, res.progress)
  })
}

// ❌ 错误: 没有进度反馈,用户不知道上传状态
const uploadWithoutProgress = async (file: UploadFileItem) => {
  uni.showLoading({ title: '上传中...' })
  await uni.uploadFile({
    url: '/api/upload',
    filePath: file.tempFilePath,
    name: 'file'
  })
  uni.hideLoading()
}
```

### 3. 错误处理和重试

```typescript
// ✅ 正确: 完善的错误处理和重试机制
const uploadWithRetry = async (
  file: UploadFileItem,
  maxRetries = 3
): Promise<void> => {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      await uploadFile(file)
      return // 成功则退出
    } catch (error) {
      lastError = error as Error
      console.warn(`上传失败,第 ${i + 1} 次重试...`)

      // 指数退避
      if (i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000)
      }
    }
  }

  throw lastError
}

// ❌ 错误: 失败后没有重试机制
const uploadWithoutRetry = async (file: UploadFileItem) => {
  try {
    await uploadFile(file)
  } catch (error) {
    uni.showToast({ title: '上传失败', icon: 'none' })
    // 用户需要手动重新选择文件...
  }
}
```

### 4. 大文件处理

```typescript
// ✅ 正确: 大文件使用直传模式
const uploadLargeFile = async (file: UploadFileItem) => {
  const MAX_SERVER_UPLOAD = 10 * 1024 * 1024  // 10MB

  if (file.size > MAX_SERVER_UPLOAD) {
    // 大文件使用直传
    return await directUploadFile(file)
  } else {
    // 小文件使用标准上传
    return await uploadFile(file)
  }
}

// ❌ 错误: 所有文件都走服务器
const uploadAllThroughServer = async (file: UploadFileItem) => {
  // 大文件会导致服务器内存压力和超时
  return await uploadFile(file)
}
```

### 5. 文件类型图标映射

```typescript
// ✅ 正确: 集中管理图标映射
const FILE_ICON_MAP: Record<string, string> = {
  // 图片
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  // 视频
  mp4: 'video',
  avi: 'video',
  mov: 'video',
  // 文档
  pdf: 'file-pdf',
  doc: 'file-word',
  docx: 'file-word',
  xls: 'file-excel',
  xlsx: 'file-excel',
  ppt: 'file-ppt',
  pptx: 'file-ppt',
  // 压缩包
  zip: 'file-zip',
  rar: 'file-zip',
  // 默认
  default: 'file'
}

const getFileIcon = (filename: string): string => {
  const ext = getFileExtension(filename)
  return FILE_ICON_MAP[ext] || FILE_ICON_MAP.default
}
```

## 常见问题

### 1. 文件选择在某些平台不生效

**问题原因:**
- 不同平台支持的 API 不同
- 小程序对文件类型有限制
- 缺少必要的权限

**解决方案:**

```typescript
/**
 * 跨平台文件选择
 */
const chooseFileCrossPlatform = async (options: {
  count?: number
  type?: 'image' | 'video' | 'file' | 'all'
  accept?: string[]
}) => {
  const { count = 9, type = 'all', accept = [] } = options

  // #ifdef MP-WEIXIN
  // 微信小程序使用 chooseMessageFile
  if (type === 'file' || type === 'all') {
    return uni.chooseMessageFile({
      count,
      type: type === 'all' ? 'all' : 'file',
      extension: accept.length > 0 ? accept : undefined
    })
  }
  // #endif

  // #ifdef H5
  // H5 使用标准 chooseFile
  return uni.chooseFile({
    count,
    type,
    extension: accept.length > 0 ? accept : undefined
  })
  // #endif

  // #ifdef APP-PLUS
  // App 使用原生能力
  return new Promise((resolve, reject) => {
    plus.io.chooseFile({
      filter: type,
      multiple: count > 1
    }, resolve, reject)
  })
  // #endif
}
```

### 2. 上传大文件超时

**问题原因:**
- 服务器上传超时配置过短
- 网络带宽限制
- 文件太大导致内存溢出

**解决方案:**

```typescript
// 使用直传模式避免服务器超时
const { upload } = useUpload({
  directUpload: true,  // 启用直传
  maxSize: 100         // 允许更大的文件
})

// 或者分片上传(需要后端支持)
const uploadInChunks = async (file: UploadFileItem) => {
  const CHUNK_SIZE = 5 * 1024 * 1024  // 5MB 每片

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)

    // 读取文件片段
    const chunk = await readFileChunk(file.tempFilePath, start, end)

    // 上传片段
    await uploadChunk(file.uid, i, totalChunks, chunk)

    // 更新进度
    file.percent = Math.round(((i + 1) / totalChunks) * 100)
  }

  // 合并文件
  await mergeChunks(file.uid, totalChunks)
}
```

### 3. 图片预览不显示

**问题原因:**
- URL 格式不正确
- 图片地址需要鉴权
- 跨域问题

**解决方案:**

```typescript
// 确保 URL 格式正确
const formatImageUrl = (url: string): string => {
  // 处理相对路径
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`
  }

  // 处理 OSS 私有链接(添加签名)
  if (url.includes('oss') && !url.includes('Signature')) {
    return addOssSignature(url)
  }

  return url
}

// 预览前格式化所有 URL
const previewImages = (urls: string[], current: number = 0) => {
  const formattedUrls = urls.map(formatImageUrl)

  uni.previewImage({
    urls: formattedUrls,
    current: formattedUrls[current]
  })
}
```

### 4. 复制功能在部分浏览器失效

**问题原因:**
- 老版浏览器不支持 Clipboard API
- 需要用户交互才能访问剪贴板
- HTTPS 环境要求

**解决方案:**

```typescript
// 已在 copy 函数中实现降级方案
export async function copy(text: string): Promise<void> {
  // #ifdef H5
  // 优先使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (e) {
      // 降级处理
    }
  }

  // 降级方案: execCommand
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.cssText = 'position:fixed;opacity:0;left:-9999px'
  document.body.appendChild(textarea)

  try {
    textarea.focus()
    textarea.select()

    const success = document.execCommand('copy')
    if (!success) {
      throw new Error('复制失败')
    }
  } finally {
    document.body.removeChild(textarea)
  }
  // #endif

  // #ifndef H5
  return new Promise((resolve, reject) => {
    uni.setClipboardData({
      data: text,
      success: () => resolve(),
      fail: reject
    })
  })
  // #endif
}
```

### 5. 文件下载后无法打开

**问题原因:**
- 文件类型不支持预览
- 文件损坏
- 权限问题

**解决方案:**

```typescript
// 根据文件类型选择合适的打开方式
const openFile = async (filePath: string, filename: string) => {
  const ext = getFileExtension(filename)

  // 支持预览的文档类型
  const previewableTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']

  if (previewableTypes.includes(ext)) {
    // 使用文档预览
    uni.openDocument({
      filePath,
      fileType: ext as any,
      showMenu: true,
      fail: (err) => {
        // 预览失败,提示用户
        uni.showModal({
          title: '无法预览',
          content: '当前设备不支持预览此类型文件,是否保存到本地?',
          success: (res) => {
            if (res.confirm) {
              saveToLocal(filePath, filename)
            }
          }
        })
      }
    })
  } else if (isImage(filename)) {
    // 图片预览
    uni.previewImage({ urls: [filePath] })
  } else if (isVideo(filename)) {
    // 视频播放
    previewVideo(filePath, filename)
  } else {
    // 其他类型直接保存
    saveToLocal(filePath, filename)
  }
}

// 保存到本地
const saveToLocal = (tempPath: string, filename: string) => {
  uni.saveFile({
    tempFilePath: tempPath,
    success: (res) => {
      uni.showToast({
        title: '已保存到: ' + res.savedFilePath,
        icon: 'none',
        duration: 3000
      })
    },
    fail: () => {
      uni.showToast({ title: '保存失败', icon: 'none' })
    }
  })
}
```

### 6. 上传进度不更新

**问题原因:**
- 没有正确监听进度事件
- 文件太小,上传瞬间完成
- 某些平台不支持进度监听

**解决方案:**

```typescript
// 确保正确监听进度
const uploadWithProgress = (item: UploadFileItem) => {
  return new Promise<void>((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: '/api/upload',
      filePath: item.tempFilePath,
      name: 'file',
      success: (res) => {
        item.percent = 100
        resolve()
      },
      fail: reject
    })

    // 确保监听器在上传任务创建后立即绑定
    if (uploadTask && typeof uploadTask.onProgressUpdate === 'function') {
      uploadTask.onProgressUpdate((res) => {
        // 进度取整,避免频繁更新
        const progress = Math.floor(res.progress)
        if (progress !== item.percent) {
          item.percent = progress
        }
      })
    } else {
      // 不支持进度监听,显示模拟进度
      simulateProgress(item)
    }
  })
}

// 模拟进度(用于不支持进度监听的平台)
const simulateProgress = (item: UploadFileItem) => {
  let progress = 0
  const timer = setInterval(() => {
    progress += Math.random() * 10
    if (progress >= 90) {
      clearInterval(timer)
      progress = 90  // 保留最后10%给实际完成
    }
    item.percent = Math.floor(progress)
  }, 200)

  // 上传完成后清除定时器
  const checkComplete = setInterval(() => {
    if (item.status === UPLOAD_STATUS.SUCCESS || item.status === UPLOAD_STATUS.FAIL) {
      clearInterval(timer)
      clearInterval(checkComplete)
    }
  }, 100)
}
```

