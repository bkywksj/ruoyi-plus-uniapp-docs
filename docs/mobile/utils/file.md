# 文件处理工具

## 概述

RuoYi-Plus-UniApp 移动端提供完整的文件处理解决方案，涵盖文件选择、上传、下载、预览、验证等核心功能。

**核心特性:**

- **文件选择** - 支持图片、视频、音频、文档等多种文件类型选择
- **文件上传** - 提供标准上传和直传模式，支持进度监控
- **文件下载** - 支持文件下载、缓存管理
- **文件预览** - 图片预览、文档预览、视频播放
- **文件验证** - 类型验证、大小限制、文件名检查
- **剪贴板操作** - 跨平台的复制粘贴功能

## 文件选择

### 选择图片

```typescript
const chooseImage = () => {
  return new Promise<UniApp.ChooseImageSuccessCallbackResult>((resolve, reject) => {
    uni.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: resolve,
      fail: reject
    })
  })
}

// 使用
const res = await chooseImage()
console.log('图片路径:', res.tempFilePaths)
```

### 选择视频

```typescript
const chooseVideo = () => {
  return new Promise<UniApp.ChooseVideoSuccessCallbackResult>((resolve, reject) => {
    uni.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      compressed: true,
      success: resolve,
      fail: reject
    })
  })
}
```

### 选择任意文件

```typescript
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
const res = await chooseFile({
  count: 1,
  type: 'file',
  extension: ['.pdf']
})

// 选择文档文件
const docs = await chooseFile({
  count: 5,
  extension: ['.doc', '.docx', '.xls', '.xlsx', '.pdf']
})
```

## 文件上传

### useUpload 组合式函数

```typescript
import { ref } from 'vue'

export enum UPLOAD_STATUS {
  PENDING = 'pending',
  LOADING = 'loading',
  SUCCESS = 'success',
  FAIL = 'fail'
}

export interface UploadFileItem {
  uid: string
  name: string
  size: number
  tempFilePath: string
  url?: string
  status: UPLOAD_STATUS
  percent: number
  error?: string
  ossId?: string
}

export interface UploadOptions {
  action?: string
  headers?: Record<string, string>
  formData?: Record<string, any>
  name?: string
  maxSize?: number
  accept?: string[]
  directUpload?: boolean
}

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

  const fileList = ref<UploadFileItem[]>([])
  const uploading = ref(false)

  const generateUid = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addFile = (file: { path: string; name: string; size: number }): UploadFileItem => {
    const item: UploadFileItem = {
      uid: generateUid(),
      name: file.name,
      size: file.size,
      tempFilePath: file.path,
      status: UPLOAD_STATUS.PENDING,
      percent: 0
    }
    fileList.value.push(item)
    return item
  }

  const validateFile = (file: { name: string; size: number }): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `文件大小不能超过${maxSize}MB`
    }
    if (accept.length > 0) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!accept.includes(ext)) {
        return `不支持${ext}格式的文件`
      }
    }
    return null
  }

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
            const data = JSON.parse(res.data)
            if (data.code === 200) {
              item.status = UPLOAD_STATUS.SUCCESS
              item.percent = 100
              item.url = data.data.url
              item.ossId = data.data.ossId
              resolve()
            } else {
              item.status = UPLOAD_STATUS.FAIL
              item.error = data.msg || '上传失败'
              reject(new Error(item.error))
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

      uploadTask.onProgressUpdate((res) => {
        item.percent = res.progress
      })
    })
  }

  const uploadAll = async (): Promise<void> => {
    const pendingFiles = fileList.value.filter(
      f => f.status === UPLOAD_STATUS.PENDING || f.status === UPLOAD_STATUS.FAIL
    )
    if (pendingFiles.length === 0) return

    uploading.value = true
    try {
      await Promise.all(pendingFiles.map(uploadFile))
    } finally {
      uploading.value = false
    }
  }

  const removeFile = (uid: string) => {
    const index = fileList.value.findIndex(f => f.uid === uid)
    if (index > -1) fileList.value.splice(index, 1)
  }

  const clearFiles = () => { fileList.value = [] }

  const getSuccessFiles = () => fileList.value.filter(f => f.status === UPLOAD_STATUS.SUCCESS)

  return {
    fileList,
    uploading,
    addFile,
    validateFile,
    upload: uploadFile,
    uploadAll,
    removeFile,
    clearFiles,
    getSuccessFiles
  }
}
```

### 基础上传示例

```vue
<template>
  <view class="upload-demo">
    <wd-button type="primary" @click="chooseAndUpload">选择并上传</wd-button>

    <view class="upload-list">
      <view v-for="file in fileList" :key="file.uid" class="upload-item">
        <text>{{ file.name }} - {{ file.percent }}%</text>
        <text v-if="file.status === 'fail'" class="error">{{ file.error }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUpload, UPLOAD_STATUS } from '@/composables/useUpload'

const { fileList, addFile, validateFile, upload, removeFile } = useUpload({
  maxSize: 10,
  accept: ['.jpg', '.jpeg', '.png', '.pdf']
})

const chooseAndUpload = async () => {
  const res = await uni.chooseFile({ count: 5, type: 'all' })

  for (const file of res.tempFiles) {
    const error = validateFile(file)
    if (error) {
      uni.showToast({ title: error, icon: 'none' })
      continue
    }

    const item = addFile({ path: file.path, name: file.name, size: file.size })
    await upload(item)
  }
}
</script>
```

## 文件下载

### 基础下载

```typescript
const downloadFile = (url: string) => {
  return new Promise<string>((resolve, reject) => {
    uni.showLoading({ title: '下载中...' })

    const downloadTask = uni.downloadFile({
      url,
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(new Error(`下载失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        reject(err)
      }
    })

    downloadTask.onProgressUpdate((res) => {
      console.log(`下载进度: ${res.progress}%`)
    })
  })
}
```

### 下载并打开文件

```typescript
const downloadAndOpen = async (url: string, filename: string) => {
  const filePath = await downloadFile(url)

  uni.openDocument({
    filePath,
    showMenu: true,
    fileType: getFileType(filename),
    fail: () => {
      uni.saveFile({
        tempFilePath: filePath,
        success: () => uni.showToast({ title: '已保存到本地', icon: 'success' })
      })
    }
  })
}
```

## 文件预览

### 图片预览

```typescript
const previewImage = (urls: string[], current?: string) => {
  uni.previewImage({
    urls,
    current: current || urls[0],
    indicator: 'default',
    loop: true
  })
}

// 保存图片到相册
const saveImage = (url: string) => {
  uni.downloadFile({
    url,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
          fail: (err) => {
            if (err.errMsg.includes('auth')) {
              uni.showModal({
                title: '提示',
                content: '请授权保存图片到相册',
                success: (res) => { if (res.confirm) uni.openSetting() }
              })
            }
          }
        })
      }
    }
  })
}
```

### 文档预览

```typescript
const previewDocument = async (url: string, filename?: string) => {
  uni.showLoading({ title: '加载中...' })

  const res = await new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
    uni.downloadFile({ url, success: resolve, fail: reject })
  })

  uni.hideLoading()

  if (res.statusCode !== 200) {
    throw new Error('下载失败')
  }

  uni.openDocument({
    filePath: res.tempFilePath,
    showMenu: true,
    fileType: getDocFileType(filename || url),
    fail: () => {
      uni.showModal({
        title: '提示',
        content: '该文件类型暂不支持预览，是否下载到本地?',
        success: (res) => { if (res.confirm) downloadToLocal(url, filename) }
      })
    }
  })
}

const getDocFileType = (filename: string): string | undefined => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    doc: 'doc', docx: 'docx', xls: 'xls', xlsx: 'xlsx',
    ppt: 'ppt', pptx: 'pptx', pdf: 'pdf'
  }
  return typeMap[ext || '']
}
```

## 文件类型检测

### 工具函数

```typescript
// 文件类型映射
const FILE_TYPE_MAP: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz']
}

// MIME 类型映射
const MIME_TYPE_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  mp4: 'video/mp4', mp3: 'audio/mpeg', pdf: 'application/pdf',
  doc: 'application/msword', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.substring(lastDotIndex + 1).toLowerCase()
}

// 获取文件类型
export function getFileType(filename: string): string {
  const ext = getFileExtension(filename)
  for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
    if (extensions.includes(ext)) return type
  }
  return 'unknown'
}

// 获取 MIME 类型
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename)
  return MIME_TYPE_MAP[ext] || 'application/octet-stream'
}

// 类型判断函数
export const isImage = (filename: string) => getFileType(filename) === 'image'
export const isVideo = (filename: string) => getFileType(filename) === 'video'
export const isAudio = (filename: string) => getFileType(filename) === 'audio'
export const isDocument = (filename: string) => getFileType(filename) === 'document'
export const isArchive = (filename: string) => getFileType(filename) === 'archive'
```

## 文件验证

```typescript
// 验证文件类型
export function isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
  if (!allowedTypes.length) return true
  const ext = getFileExtension(filename)
  return allowedTypes.some(type => {
    const normalized = type.startsWith('.') ? type.slice(1) : type
    return ext === normalized.toLowerCase()
  })
}

// 验证文件大小
export function isWithinFileSize(size: number, maxSize: number): boolean {
  if (!maxSize) return true
  return size <= maxSize * 1024 * 1024
}

// 验证文件名
export function isValidFilename(filename: string): boolean {
  if (!filename) return false
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/
  if (invalidChars.test(filename)) return false
  if (/^[\s.]|[\s.]$/.test(filename)) return false
  if (filename.length > 255) return false
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
  if (reservedNames.test(filename.replace(/\.[^.]+$/, ''))) return false
  return true
}

// 综合验证
export function validateFile(
  file: { name: string; size: number },
  options: { allowedTypes?: string[]; maxSize?: number; minSize?: number } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (options.allowedTypes?.length && !isAllowedFileType(file.name, options.allowedTypes)) {
    errors.push(`文件类型不支持，仅支持 ${options.allowedTypes.join(', ')}`)
  }

  if (options.maxSize && !isWithinFileSize(file.size, options.maxSize)) {
    errors.push(`文件大小不能超过 ${options.maxSize}MB`)
  }

  if (options.minSize && file.size < options.minSize) {
    errors.push(`文件大小不能小于 ${options.minSize} 字节`)
  }

  if (!isValidFilename(file.name)) {
    errors.push('文件名包含非法字符')
  }

  return { valid: errors.length === 0, errors }
}
```

## 剪贴板操作

```typescript
// 复制文本
export function copy(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject)
      return
    }
    // 降级方案
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.cssText = 'position:fixed;opacity:0'
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

// 粘贴文本
export function paste(): Promise<string> {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    if (navigator.clipboard) {
      navigator.clipboard.readText().then(resolve).catch(reject)
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
const handleCopy = async () => {
  try {
    await copy('要复制的文本')
    uni.showToast({ title: '复制成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '复制失败', icon: 'none' })
  }
}
```

## 类型定义

```typescript
export enum UPLOAD_STATUS {
  PENDING = 'pending',
  LOADING = 'loading',
  SUCCESS = 'success',
  FAIL = 'fail'
}

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'unknown'

export interface FileInfo {
  path: string
  name: string
  size: number
  type?: string
}

export interface UploadFileItem extends FileInfo {
  uid: string
  tempFilePath: string
  url?: string
  status: UPLOAD_STATUS
  percent: number
  error?: string
  ossId?: string
}

export interface UploadOptions {
  action?: string
  headers?: Record<string, string>
  formData?: Record<string, any>
  name?: string
  maxSize?: number
  accept?: string[]
  directUpload?: boolean
}

export interface FileValidationResult {
  valid: boolean
  errors: string[]
}
```

## 最佳实践

### 1. 选择前配置好类型

```typescript
// ✅ 正确: 选择前配置允许的类型
const res = await uni.chooseFile({
  count: 5,
  type: 'file',
  extension: ['.pdf', '.doc', '.docx']
})

// ❌ 错误: 选择后才验证
const res = await uni.chooseFile({ type: 'all' })
const valid = res.tempFiles.filter(f => isDocument(f.name))
```

### 2. 上传进度反馈

```typescript
// ✅ 正确: 监听进度
const uploadTask = uni.uploadFile({ ... })
uploadTask.onProgressUpdate((res) => {
  file.percent = res.progress
})
```

### 3. 大文件使用直传

```typescript
// ✅ 大文件直传到 OSS
if (file.size > 10 * 1024 * 1024) {
  return await directUploadFile(file)
}
```

### 4. 根据类型选择操作

```typescript
if (isImage(file.name)) {
  previewImage([file.url])
} else if (isDocument(file.name)) {
  previewDocument(file.url)
} else {
  downloadFile(file.url)
}
```

## 常见问题

### 1. 文件选择在某些平台不生效

**解决:** 使用条件编译处理平台差异

```typescript
// #ifdef MP-WEIXIN
return uni.chooseMessageFile({ count, type: 'all' })
// #endif

// #ifdef H5
return uni.chooseFile({ count, type })
// #endif
```

### 2. 上传大文件超时

**解决:** 使用直传模式或分片上传

```typescript
const { upload } = useUpload({
  directUpload: true,
  maxSize: 100
})
```

### 3. 图片预览不显示

**解决:** 确保 URL 格式正确，处理鉴权链接

```typescript
const formatImageUrl = (url: string) => {
  if (url.startsWith('/')) return `${BASE_URL}${url}`
  if (url.includes('oss') && !url.includes('Signature')) {
    return addOssSignature(url)
  }
  return url
}
```

### 4. 复制功能在部分浏览器失效

**解决:** 已在 copy 函数中实现 execCommand 降级方案

## 总结

文件处理工具提供了完整的文件操作能力：

- **文件选择**: 支持图片、视频、文档等多种类型
- **文件上传**: useUpload 组合式函数，支持标准上传和直传
- **文件下载**: 带进度监控的下载功能
- **文件预览**: 图片、文档、视频预览
- **文件验证**: 类型、大小、文件名验证
- **剪贴板**: 跨平台复制粘贴

使用建议：选择前配置类型限制，上传时显示进度，大文件使用直传模式。
