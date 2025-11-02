# 文件接口

## 介绍

文件接口是RuoYi-Plus-UniApp移动端应用的文件管理核心模块,提供完整的文件上传、下载、查询、删除等功能。该模块基于对象存储服务(OSS),支持多种云存储服务商(阿里云OSS、腾讯云COS、七牛云、MinIO等),实现了统一的文件管理接口。文件上传采用分片上传、断点续传、进度监控等技术,确保大文件上传的稳定性和效率。

**核心特性:**

- **多云存储支持** - 支持阿里云OSS、腾讯云COS、七牛云、MinIO等主流云存储服务
- **统一接口封装** - 提供统一的上传、下载、查询接口,屏蔽底层存储差异
- **文件上传功能** - 支持图片、视频、音频、文档等各类文件上传
- **进度监控** - 实时监控上传进度,支持进度回调
- **分片上传** - 大文件自动分片上传,提高上传成功率
- **断点续传** - 支持上传中断后继续上传,节省流量和时间
- **文件预览** - 支持图片预览、视频播放、文档在线查看
- **文件下载** - 支持文件下载到本地,可监控下载进度
- **文件压缩** - 图片自动压缩,减少上传流量和存储空间
- **文件类型验证** - 上传前验证文件类型和大小,防止非法文件
- **批量操作** - 支持批量上传、批量查询、批量删除
- **TypeScript类型安全** - 完整的类型定义和智能提示

参考: src/api/system/oss/oss/ossApi.ts:1-11

## API列表

### 1. listOssByIds - 根据ID查询文件列表

根据文件ID列表批量查询文件详细信息。

**请求方法:** GET

**请求路径:** `/resource/oss/listOssByIds/{ossIds}`

**请求参数:**

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| ossIds | 文件ID数组 | `string[]` | 是 |

**响应数据:**

```typescript
interface SysOssVo {
  /** 对象存储主键 */
  ossId: string | number
  /** 所属目录ID */
  directoryId: string | number
  /** 所属目录 */
  directoryName: string
  /** 文件名 */
  fileName: string
  /** 原名 */
  originalName: string
  /** 文件后缀名 */
  fileSuffix: string
  /** 文件大小(字节) */
  fileSize: number
  /** URL地址 */
  url: string
  /** 创建人名称 */
  createByName: string
  /** 服务商 */
  service: string
  /** 更新时间 */
  updateTime: string
}
```

**使用示例:**

```vue
<template>
  <view class="file-list-page">
    <wd-navbar title="文件列表" />

    <view class="file-list">
      <view
        v-for="file in fileList"
        :key="file.ossId"
        class="file-item"
        @click="handleFileClick(file)"
      >
        <view class="file-icon">
          <image
            v-if="isImage(file)"
            :src="file.url"
            class="thumbnail"
            mode="aspectFill"
          />
          <wd-icon
            v-else
            :name="getFileIcon(file)"
            size="48"
          />
        </view>

        <view class="file-info">
          <text class="file-name">{{ file.originalName }}</text>
          <text class="file-meta">
            {{ formatFileSize(file.fileSize) }} · {{ formatDate(file.updateTime) }}
          </text>
        </view>

        <wd-icon name="arrow-right" size="20" color="#999" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { listOssByIds } from '@/api/system/oss/oss/ossApi'
import type { SysOssVo } from '@/api/system/oss/oss/ossTypes'
import { formatDate } from '@/utils/date'
import { to } from '@/utils/to'

const fileList = ref<SysOssVo[]>([])
const fileIds = ref<string[]>([])

// 判断是否为图片
const isImage = (file: SysOssVo): boolean => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  return imageExts.includes(file.fileSuffix.toLowerCase())
}

// 获取文件图标
const getFileIcon = (file: SysOssVo): string => {
  const ext = file.fileSuffix.toLowerCase()
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
    mp4: 'video',
    avi: 'video',
    mp3: 'music',
    wav: 'music'
  }
  return iconMap[ext] || 'file'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 加载文件列表
const loadFiles = async () => {
  if (fileIds.value.length === 0) {
    return
  }

  const [error, data] = await to(listOssByIds(fileIds.value))

  if (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    return
  }

  fileList.value = data
}

// 文件点击
const handleFileClick = (file: SysOssVo) => {
  if (isImage(file)) {
    // 图片预览
    uni.previewImage({
      current: file.url,
      urls: fileList.value
        .filter(f => isImage(f))
        .map(f => f.url)
    })
  } else {
    // 其他文件下载或预览
    uni.showActionSheet({
      itemList: ['预览', '下载'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 预览文件
          previewFile(file)
        } else if (res.tapIndex === 1) {
          // 下载文件
          downloadFile(file)
        }
      }
    })
  }
}

// 预览文件
const previewFile = (file: SysOssVo) => {
  // #ifdef MP-WEIXIN
  // 微信小程序使用wx.openDocument
  uni.downloadFile({
    url: file.url,
    success: (res) => {
      uni.openDocument({
        filePath: res.tempFilePath,
        showMenu: true
      })
    }
  })
  // #endif

  // #ifdef H5
  // H5端直接打开
  window.open(file.url, '_blank')
  // #endif
}

// 下载文件
const downloadFile = (file: SysOssVo) => {
  uni.showLoading({ title: '下载中...' })

  uni.downloadFile({
    url: file.url,
    success: (res) => {
      uni.hideLoading()

      if (res.statusCode === 200) {
        uni.showToast({
          title: '下载成功',
          icon: 'success'
        })

        // 保存文件到相册(仅图片)
        if (isImage(file)) {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath
          })
        }
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  })
}

onMounted(() => {
  // 从页面参数获取文件ID列表
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options

  if (options.fileIds) {
    fileIds.value = options.fileIds.split(',')
    loadFiles()
  }
})
</script>

<style lang="scss" scoped>
.file-list-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.file-list {
  padding: 20rpx;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: white;
  border-radius: 12rpx;
  margin-bottom: 20rpx;

  .file-icon {
    width: 96rpx;
    height: 96rpx;
    margin-right: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 8rpx;

    .thumbnail {
      width: 100%;
      height: 100%;
      border-radius: 8rpx;
    }
  }

  .file-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .file-name {
      font-size: 28rpx;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-meta {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style>
```

**技术实现:**

- 支持批量查询文件信息
- 文件ID使用字符串格式,避免雪花ID精度丢失
- 返回文件的完整信息包括URL、大小、类型等

参考: src/api/system/oss/oss/ossApi.ts:8-10

### 2. http.upload - 文件上传

使用http.upload方法上传文件到服务器。该方法基于uni.uploadFile封装,提供了更便捷的上传接口。

**请求方法:** POST

**请求路径:** `/resource/oss/upload` (默认,可自定义)

**请求参数:**

```typescript
interface UploadConfig extends UniApp.UploadFileOption {
  /** 上传地址 */
  url: string
  /** 文件路径 */
  filePath: string
  /** 文件对应的key */
  name?: string
  /** HTTP请求Header */
  header?: Record<string, string>
  /** 额外的表单数据 */
  formData?: Record<string, any>
  /** 上传进度回调 */
  onProgress?: (progress: number) => void
}
```

**响应数据:**

```typescript
interface UploadResult {
  /** 文件ID */
  ossId: string
  /** 文件名 */
  fileName: string
  /** 原始文件名 */
  originalName: string
  /** 文件URL */
  url: string
  /** 文件大小 */
  fileSize: number
}
```

**使用示例:**

```vue
<template>
  <view class="upload-page">
    <wd-navbar title="文件上传" />

    <!-- 图片上传 -->
    <view class="upload-section">
      <text class="section-title">图片上传</text>

      <view class="image-list">
        <view
          v-for="(image, index) in imageList"
          :key="index"
          class="image-item"
        >
          <image :src="image.url" class="image" mode="aspectFill" />
          <view class="image-mask" v-if="image.uploading">
            <wd-loading type="ring" />
            <text class="progress">{{ image.progress }}%</text>
          </view>
          <view class="delete-btn" @click="removeImage(index)">
            <wd-icon name="close" size="20" color="#fff" />
          </view>
        </view>

        <view
          class="image-item upload-btn"
          @click="chooseImage"
          v-if="imageList.length < maxCount"
        >
          <wd-icon name="plus" size="40" color="#999" />
          <text class="tip">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 文件上传 -->
    <view class="upload-section">
      <text class="section-title">文件上传</text>

      <view class="file-list">
        <view
          v-for="(file, index) in fileList"
          :key="index"
          class="file-item"
        >
          <wd-icon :name="getFileIcon(file)" size="32" />
          <view class="file-info">
            <text class="file-name">{{ file.name }}</text>
            <text class="file-size">{{ formatFileSize(file.size) }}</text>
          </view>
          <view class="file-status">
            <wd-loading v-if="file.uploading" type="ring" size="24" />
            <text v-else-if="file.success" class="success">✓</text>
            <text v-else-if="file.error" class="error">✗</text>
          </view>
        </view>
      </view>

      <wd-button block @click="chooseFile">
        选择文件
      </wd-button>
    </view>

    <view class="button-section">
      <wd-button
        type="primary"
        block
        :loading="uploading"
        :disabled="!canUpload"
        @click="handleUploadAll"
      >
        全部上传
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useHttp } from '@/composables/useHttp'
import { to } from '@/utils/to'

const http = useHttp()

interface ImageItem {
  url: string
  path: string
  uploading: boolean
  progress: number
  ossId?: string
}

interface FileItem {
  name: string
  path: string
  size: number
  uploading: boolean
  success: boolean
  error: boolean
  ossId?: string
}

const maxCount = ref(9)
const imageList = ref<ImageItem[]>([])
const fileList = ref<FileItem[]>([])
const uploading = ref(false)

// 是否可以上传
const canUpload = computed(() => {
  return imageList.value.length > 0 || fileList.value.length > 0
})

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: maxCount.value - imageList.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      res.tempFilePaths.forEach(path => {
        imageList.value.push({
          url: path,
          path: path,
          uploading: false,
          progress: 0
        })
      })
    }
  })
}

// 移除图片
const removeImage = (index: number) => {
  imageList.value.splice(index, 1)
}

// 选择文件
const chooseFile = () => {
  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 10,
    type: 'file',
    success: (res) => {
      res.tempFiles.forEach(file => {
        fileList.value.push({
          name: file.name,
          path: file.path,
          size: file.size,
          uploading: false,
          success: false,
          error: false
        })
      })
    }
  })
  // #endif

  // #ifdef H5
  // H5端使用input[type=file]
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = (e: any) => {
    const files = e.target.files
    Array.from(files).forEach((file: any) => {
      fileList.value.push({
        name: file.name,
        path: URL.createObjectURL(file),
        size: file.size,
        uploading: false,
        success: false,
        error: false
      })
    })
  }
  input.click()
  // #endif
}

// 获取文件图标
const getFileIcon = (file: FileItem): string => {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    zip: 'file-zip',
    rar: 'file-zip'
  }
  return iconMap[ext] || 'file'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 上传单个图片
const uploadImage = async (image: ImageItem) => {
  image.uploading = true
  image.progress = 0

  const [error, data] = await to(
    http.upload({
      url: '/resource/oss/upload',
      filePath: image.path,
      name: 'file',
      formData: {
        type: 'image'
      },
      onProgress: (progress) => {
        image.progress = Math.floor(progress)
      }
    })
  )

  image.uploading = false

  if (error) {
    uni.showToast({
      title: '上传失败',
      icon: 'none'
    })
    return false
  }

  image.ossId = data.ossId
  image.url = data.url
  return true
}

// 上传单个文件
const uploadFile = async (file: FileItem) => {
  file.uploading = true
  file.success = false
  file.error = false

  const [error, data] = await to(
    http.upload({
      url: '/resource/oss/upload',
      filePath: file.path,
      name: 'file',
      formData: {
        type: 'file'
      }
    })
  )

  file.uploading = false

  if (error) {
    file.error = true
    return false
  }

  file.success = true
  file.ossId = data.ossId
  return true
}

// 全部上传
const handleUploadAll = async () => {
  uploading.value = true

  // 上传所有图片
  for (const image of imageList.value) {
    if (!image.ossId) {
      await uploadImage(image)
    }
  }

  // 上传所有文件
  for (const file of fileList.value) {
    if (!file.ossId && !file.success) {
      await uploadFile(file)
    }
  }

  uploading.value = false

  // 检查是否全部上传成功
  const allSuccess =
    imageList.value.every(img => img.ossId) &&
    fileList.value.every(file => file.success)

  if (allSuccess) {
    uni.showToast({
      title: '全部上传成功',
      icon: 'success'
    })

    // 返回上传的文件ID列表
    const ossIds = [
      ...imageList.value.map(img => img.ossId),
      ...fileList.value.map(file => file.ossId)
    ].filter(Boolean)

    // 返回上一页并传递文件ID
    setTimeout(() => {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage) {
        // 通过eventChannel传递数据
        const eventChannel = (prevPage as any).getOpenerEventChannel()
        if (eventChannel) {
          eventChannel.emit('uploadSuccess', { ossIds })
        }
      }
      uni.navigateBack()
    }, 1000)
  } else {
    uni.showToast({
      title: '部分文件上传失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.upload-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.upload-section {
  padding: 30rpx;
  background-color: white;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
    display: block;
  }
}

.image-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;

  .image-item {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    overflow: hidden;

    .image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .image-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16rpx;

      .progress {
        color: white;
        font-size: 24rpx;
      }
    }

    .delete-btn {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      width: 40rpx;
      height: 40rpx;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.upload-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: static;
      padding-bottom: 0;
      aspect-ratio: 1;

      .tip {
        font-size: 24rpx;
        color: #999;
        margin-top: 12rpx;
      }
    }
  }
}

.file-list {
  margin-bottom: 24rpx;

  .file-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    margin-bottom: 16rpx;

    .file-info {
      flex: 1;
      margin: 0 20rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .file-name {
        font-size: 28rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-size {
        font-size: 24rpx;
        color: #999;
      }
    }

    .file-status {
      .success {
        color: #00c853;
        font-size: 32rpx;
        font-weight: bold;
      }

      .error {
        color: #fa2c19;
        font-size: 32rpx;
        font-weight: bold;
      }
    }
  }
}

.button-section {
  padding: 40rpx 30rpx;
}
</style>
```

**技术实现:**

- 基于uni.uploadFile封装,统一H5、小程序、APP上传接口
- 支持上传进度监控
- 自动添加认证Token
- 支持自定义请求头和表单数据
- 返回Promise便于错误处理

参考: src/composables/useHttp.ts:300-400

## 类型定义

### 完整类型定义

```typescript
/**
 * OSS对象存储视图对象
 */
export interface SysOssVo {
  /** 对象存储主键 */
  ossId: string | number
  /** 所属目录ID */
  directoryId: string | number
  /** 所属目录 */
  directoryName: string
  /** 文件名 */
  fileName: string
  /** 原名 */
  originalName: string
  /** 文件后缀名 */
  fileSuffix: string
  /** 文件大小(字节) */
  fileSize: number
  /** URL地址 */
  url: string
  /** 创建人名称 */
  createByName: string
  /** 服务商 */
  service: string
  /** 更新时间 */
  updateTime: string
}

/**
 * 文件上传配置
 */
interface UploadConfig {
  /** 上传地址 */
  url: string
  /** 文件路径 */
  filePath: string
  /** 文件对应的key,默认为'file' */
  name?: string
  /** HTTP请求Header */
  header?: Record<string, string>
  /** 额外的表单数据 */
  formData?: Record<string, any>
  /** 上传进度回调 */
  onProgress?: (progress: number) => void
  /** 超时时间(毫秒) */
  timeout?: number
}

/**
 * 文件上传结果
 */
interface UploadResult {
  /** 文件ID */
  ossId: string
  /** 文件名 */
  fileName: string
  /** 原始文件名 */
  originalName: string
  /** 文件URL */
  url: string
  /** 文件大小 */
  fileSize: number
  /** 文件后缀 */
  fileSuffix: string
}
```

参考: src/api/system/oss/oss/ossTypes.ts:1-36

## 最佳实践

### 1. 图片上传前压缩

上传图片前进行压缩,减少上传时间和存储空间:

```typescript
// ✅ 推荐: 上传前压缩
const uploadImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'], // 自动压缩
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const [error, data] = await to(
        http.upload({
          url: '/resource/oss/upload',
          filePath: res.tempFilePaths[0],
          name: 'file'
        })
      )

      if (!error) {
        console.log('上传成功:', data.url)
      }
    }
  })
}

// ❌ 不推荐: 上传原图
const uploadImageBad = () => {
  uni.chooseImage({
    sizeType: ['original'], // 原图,文件可能很大
    success: async (res) => {
      // 上传可能很慢
      await http.upload({
        url: '/resource/oss/upload',
        filePath: res.tempFilePaths[0],
        name: 'file'
      })
    }
  })
}
```

参考: src/composables/useHttp.ts:300-400

### 2. 上传进度监控

实时监控上传进度,提升用户体验:

```typescript
// ✅ 推荐: 监控上传进度
const uploadWithProgress = async (filePath: string) => {
  const progress = ref(0)

  const [error, data] = await to(
    http.upload({
      url: '/resource/oss/upload',
      filePath,
      name: 'file',
      onProgress: (percent) => {
        progress.value = percent
        console.log(`上传进度: ${percent}%`)
      }
    })
  )

  if (!error) {
    uni.showToast({ title: '上传成功', icon: 'success' })
  }
}
```

### 3. 文件类型验证

上传前验证文件类型和大小:

```typescript
// ✅ 推荐: 上传前验证
const uploadFileWithValidation = (filePath: string, fileSize: number) => {
  // 验证文件大小(最大10MB)
  const maxSize = 10 * 1024 * 1024
  if (fileSize > maxSize) {
    uni.showToast({
      title: '文件大小不能超过10MB',
      icon: 'none'
    })
    return
  }

  // 验证文件类型
  const ext = filePath.split('.').pop()?.toLowerCase()
  const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']

  if (!ext || !allowedTypes.includes(ext)) {
    uni.showToast({
      title: '不支持的文件类型',
      icon: 'none'
    })
    return
  }

  // 开始上传
  http.upload({
    url: '/resource/oss/upload',
    filePath,
    name: 'file'
  })
}
```

### 4. 批量上传优化

批量上传时控制并发数,避免占用过多资源:

```typescript
// ✅ 推荐: 控制并发数
const batchUpload = async (files: string[], concurrency = 3) => {
  const results: any[] = []
  const executing: Promise<any>[] = []

  for (const file of files) {
    const promise = http.upload({
      url: '/resource/oss/upload',
      filePath: file,
      name: 'file'
    }).then(([error, data]) => {
      // 移除已完成的任务
      executing.splice(executing.indexOf(promise), 1)
      return error ? null : data
    })

    results.push(promise)
    executing.push(promise)

    // 达到并发数限制,等待一个完成
    if (executing.length >= concurrency) {
      await Promise.race(executing)
    }
  }

  // 等待所有上传完成
  return await Promise.all(results)
}

// ❌ 不推荐: 全部并发上传
const batchUploadBad = async (files: string[]) => {
  // 可能导致内存溢出或网络拥塞
  return await Promise.all(
    files.map(file =>
      http.upload({
        url: '/resource/oss/upload',
        filePath: file,
        name: 'file'
      })
    )
  )
}
```

### 5. 上传失败重试

上传失败时自动重试,提高成功率:

```typescript
// ✅ 推荐: 失败自动重试
const uploadWithRetry = async (
  filePath: string,
  maxRetries = 3
): Promise<UploadResult | null> => {
  let lastError: any = null

  for (let i = 0; i < maxRetries; i++) {
    const [error, data] = await to(
      http.upload({
        url: '/resource/oss/upload',
        filePath,
        name: 'file'
      })
    )

    if (!error) {
      return data
    }

    lastError = error
    console.log(`上传失败,第${i + 1}次重试...`)

    // 等待一段时间后重试
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
  }

  uni.showToast({
    title: `上传失败: ${lastError.msg}`,
    icon: 'none'
  })

  return null
}
```

参考: src/utils/function.ts:400-450

## 注意事项

### 1. 文件大小限制

不同环境下文件上传大小限制不同:

- **H5端**: 通常无限制,但建议不超过100MB
- **小程序端**: 单文件最大10MB(微信小程序)
- **APP端**: 取决于设备内存,建议不超过50MB

建议在上传前验证文件大小,超过限制提示用户。

### 2. 文件类型限制

根据业务需求限制可上传的文件类型:

- **图片**: jpg, jpeg, png, gif, webp
- **文档**: pdf, doc, docx, xls, xlsx, ppt, pptx
- **压缩包**: zip, rar, 7z
- **音视频**: mp3, mp4, avi, mov

### 3. 上传超时设置

大文件上传时需要设置较长的超时时间:

```typescript
// 大文件上传,设置10分钟超时
http.upload({
  url: '/resource/oss/upload',
  filePath,
  name: 'file',
  timeout: 10 * 60 * 1000 // 10分钟
})
```

### 4. 文件名处理

- 服务器会自动生成唯一文件名,避免文件覆盖
- 原始文件名保存在originalName字段
- 文件后缀从原始文件名中提取

### 5. 存储服务商

系统支持多种云存储服务商:

- **阿里云OSS**: 阿里云对象存储服务
- **腾讯云COS**: 腾讯云对象存储服务
- **七牛云**: 七牛云存储
- **MinIO**: 私有化部署的对象存储

service字段标识文件存储的服务商。

### 6. 文件访问权限

- 默认上传的文件为公开读取
- 敏感文件建议设置为私有,通过签名URL访问
- URL可能包含时效性签名参数

### 7. 小程序文件选择限制

微信小程序文件选择功能受限:

- 只能选择聊天文件或本地文件
- 无法直接访问文件系统
- 需要使用`uni.chooseMessageFile`选择文件

### 8. 图片预览优化

图片预览时建议使用缩略图:

```typescript
// 列表展示使用缩略图
const thumbnailUrl = file.url + '?x-oss-process=image/resize,w_200'

// 点击后查看原图
uni.previewImage({
  current: file.url, // 原图
  urls: [file.url]
})
```

---

通过合理使用文件接口API,可以实现完善的文件上传、下载和管理功能。
