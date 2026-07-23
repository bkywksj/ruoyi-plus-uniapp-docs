# 相机插件

## 介绍

相机插件为 RuoYi-Plus-UniApp 提供完整的媒体采集能力,支持相机拍照、视频录制、相册选择和媒体文件处理等功能。通过统一的 `useUpload` Composable 封装,实现了跨平台的媒体选择和上传功能,支持 App、H5、微信小程序、支付宝小程序等多个平台。

插件采用声明式 API 设计,开发者只需指定文件类型、来源和数量限制,即可轻松完成图片拍照、视频录制、相册选择等操作。同时支持图片压缩、尺寸类型选择、摄像头切换、时长限制等高级功能,满足各种业务场景的需求。

**核心特性:**

- **跨平台兼容** - 统一封装 uni-app 原生 API,自动适配不同平台差异
- **多媒体支持** - 支持图片、视频、混合媒体和文件选择四种模式
- **来源灵活** - 支持相机拍摄和相册选择,可同时开放或单独限制
- **配置丰富** - 提供压缩选项、尺寸类型、时长限制、扩展名过滤等配置
- **上传集成** - 与上传功能无缝集成,支持选择后自动上传
- **类型安全** - 完整的 TypeScript 类型定义,提供良好的开发体验

## 平台支持

| 功能 | App | H5 | 微信小程序 | 支付宝小程序 | 说明 |
|------|-----|-----|-----------|-------------|------|
| 拍照 | 是 | 是 | 是 | 是 | 全平台支持 |
| 视频录制 | 是 | 是 | 是 | 是 | 全平台支持 |
| 相册选择 | 是 | 是 | 是 | 是 | 全平台支持 |
| 媒体混选 | 否 | 否 | 是 | 否 | 仅微信小程序 |
| 文件选择 | 否 | 是 | 是 | 否 | 微信/H5支持 |
| 扩展名过滤 | 否 | 是 | 部分 | 否 | H5完整支持,微信部分支持 |
| 多选 | 是 | 是 | 是 | 是 | 全平台支持 |
| 压缩选项 | 是 | 是 | 是 | 是 | 全平台支持 |

## 基本用法

### 选择图片

选择图片是最常用的功能,可以从相册选择或使用相机拍照:

```vue
<template>
  <view class="camera-demo">
    <wd-button @click="selectImage">选择图片</wd-button>
    <view class="image-list">
      <image
        v-for="(img, index) in images"
        :key="index"
        :src="img.path"
        mode="aspectFill"
        class="preview-image"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

// 获取选择文件方法
const { chooseFile } = useUpload()

// 存储选择的图片
const images = ref<Array<{ path: string; name: string; size: number }>>([])

// 选择图片
const selectImage = async () => {
  try {
    const files = await chooseFile({
      accept: 'image',           // 选择图片
      multiple: true,            // 支持多选
      maxCount: 9,              // 最多选择9张
      sourceType: ['album', 'camera'],  // 相册和相机都可以
      sizeType: ['original', 'compressed']  // 原图和压缩图都可以
    })

    // 将选择的图片添加到列表
    images.value = files.map(file => ({
      path: file.path,
      name: file.name || '',
      size: file.size
    }))

    console.log('选择的图片:', files)
  } catch (error) {
    console.error('选择图片失败:', error)
  }
}
</script>

```

**配置说明:**

- `accept: 'image'` - 指定选择图片类型
- `multiple: true` - 允许多选
- `maxCount: 9` - 最多选择数量,图片最大支持9张
- `sourceType` - 指定来源,包括相册(`album`)和相机(`camera`)
- `sizeType` - 指定尺寸类型,原图(`original`)或压缩图(`compressed`)

### 仅从相机拍照

有时候需要限制用户只能通过相机拍照,禁止从相册选择:

```vue
<template>
  <view class="camera-only-demo">
    <wd-button type="primary" @click="takePhoto">拍照</wd-button>
    <image
      v-if="photoPath"
      :src="photoPath"
      mode="widthFix"
      class="photo-preview"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()
const photoPath = ref('')

// 仅从相机拍照
const takePhoto = async () => {
  try {
    const files = await chooseFile({
      accept: 'image',
      multiple: false,          // 单选
      sourceType: ['camera'],   // 仅相机
      sizeType: ['compressed'], // 仅压缩图
    })

    if (files.length > 0) {
      photoPath.value = files[0].path
    }
  } catch (error) {
    console.error('拍照失败:', error)
  }
}
</script>

```

### 仅从相册选择

有些场景需要限制用户只能从相册选择,比如选择已有的证件照:

```vue
<template>
  <view class="album-only-demo">
    <wd-button type="success" @click="selectFromAlbum">从相册选择</wd-button>
    <view class="selected-info" v-if="selectedFile">
      <text>文件名: {{ selectedFile.name }}</text>
      <text>大小: {{ formatSize(selectedFile.size) }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()
const selectedFile = ref<{ name: string; size: number; path: string } | null>(null)

// 仅从相册选择
const selectFromAlbum = async () => {
  try {
    const files = await chooseFile({
      accept: 'image',
      multiple: false,
      sourceType: ['album'],    // 仅相册
      sizeType: ['original'],   // 仅原图
    })

    if (files.length > 0) {
      selectedFile.value = {
        name: files[0].name || '未命名',
        size: files[0].size,
        path: files[0].path
      }
    }
  } catch (error) {
    console.error('选择失败:', error)
  }
}

// 格式化文件大小
const formatSize = (size: number): string => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / 1024 / 1024).toFixed(2) + ' MB'
  }
}
</script>
```

## 视频录制

### 录制视频

选择视频或使用相机录制视频:

```vue
<template>
  <view class="video-demo">
    <wd-button type="warning" @click="selectVideo">选择视频</wd-button>
    <view class="video-info" v-if="videoInfo">
      <video
        :src="videoInfo.path"
        class="video-preview"
        controls
      />
      <view class="video-meta">
        <text>时长: {{ videoInfo.duration }}秒</text>
        <text>大小: {{ formatSize(videoInfo.size) }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()

interface VideoInfo {
  path: string
  size: number
  duration?: number
  thumb?: string
}

const videoInfo = ref<VideoInfo | null>(null)

// 选择视频
const selectVideo = async () => {
  try {
    const files = await chooseFile({
      accept: 'video',           // 选择视频
      sourceType: ['album', 'camera'],
      compressed: true,          // 压缩视频
      maxDuration: 60,          // 最长60秒
      camera: 'back',           // 使用后置摄像头
    })

    if (files.length > 0) {
      videoInfo.value = {
        path: files[0].path,
        size: files[0].size,
        duration: files[0].duration,
        thumb: files[0].thumb
      }
    }
  } catch (error) {
    console.error('选择视频失败:', error)
  }
}

const formatSize = (size: number): string => {
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / 1024 / 1024).toFixed(2) + ' MB'
  }
}
</script>

```

**视频配置说明:**

- `accept: 'video'` - 指定选择视频类型
- `compressed: true` - 是否压缩视频,推荐开启以减小文件大小
- `maxDuration: 60` - 最大录制时长,单位秒
- `camera: 'back'` - 摄像头选择,`back` 后置或 `front` 前置

### 短视频录制

专门为短视频场景设计,限制时长并强制使用相机:

```vue
<template>
  <view class="short-video-demo">
    <wd-button type="error" @click="recordShortVideo">录制短视频</wd-button>
    <text class="tip">最长录制15秒</text>
  </view>
</template>

<script lang="ts" setup>
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()

// 录制短视频
const recordShortVideo = async () => {
  try {
    const files = await chooseFile({
      accept: 'video',
      sourceType: ['camera'],   // 仅相机录制
      compressed: true,
      maxDuration: 15,          // 最长15秒
      camera: 'front',          // 默认前置摄像头
    })

    if (files.length > 0) {
      console.log('录制完成:', files[0])
      // 处理录制的视频...
    }
  } catch (error) {
    console.error('录制失败:', error)
  }
}
</script>

```

## 媒体混选

### 同时选择图片和视频

在微信小程序中可以同时选择图片和视频,其他平台会自动降级为图片选择:

```vue
<template>
  <view class="media-demo">
    <wd-button @click="selectMedia">选择图片/视频</wd-button>
    <view class="media-list">
      <view
        v-for="(media, index) in mediaList"
        :key="index"
        class="media-item"
      >
        <image
          v-if="media.type === 'image'"
          :src="media.path"
          mode="aspectFill"
        />
        <video
          v-else
          :src="media.path"
          :poster="media.thumb"
        />
        <text class="media-type">{{ media.type }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()

interface MediaItem {
  type: 'image' | 'video'
  path: string
  thumb?: string
  size: number
}

const mediaList = ref<MediaItem[]>([])

// 选择媒体文件(图片+视频)
const selectMedia = async () => {
  try {
    const files = await chooseFile({
      accept: 'media',           // 媒体类型(图片+视频)
      multiple: true,
      maxCount: 9,
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      maxDuration: 30,
    })

    mediaList.value = files.map(file => ({
      type: file.type,
      path: file.path,
      thumb: file.thumb,
      size: file.size
    }))

    console.log('选择的媒体:', files)
  } catch (error) {
    console.error('选择媒体失败:', error)
  }
}
</script>

```

**注意事项:**

- `accept: 'media'` 仅在微信小程序中完整支持
- 其他平台会自动降级为 `chooseImage`,无法同时选择视频
- 返回的文件对象包含 `type` 字段,用于区分图片和视频

## 文件选择

### 选择任意文件

在微信小程序和 H5 平台可以选择任意类型的文件:

```vue
<template>
  <view class="file-demo">
    <wd-button @click="selectFile">选择文件</wd-button>
    <view class="file-list">
      <view
        v-for="(file, index) in fileList"
        :key="index"
        class="file-item"
      >
        <text class="file-name">{{ file.name }}</text>
        <text class="file-size">{{ formatSize(file.size) }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()

interface FileItem {
  name: string
  path: string
  size: number
}

const fileList = ref<FileItem[]>([])

// 选择文件
const selectFile = async () => {
  try {
    const files = await chooseFile({
      accept: 'file',            // 选择文件
      multiple: true,
      maxCount: 10,
    })

    fileList.value = files.map(file => ({
      name: file.name || '未命名文件',
      path: file.path,
      size: file.size
    }))
  } catch (error) {
    console.error('选择文件失败:', error)
  }
}

const formatSize = (size: number): string => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / 1024 / 1024).toFixed(2) + ' MB'
  }
}
</script>

```

### 限制文件扩展名

可以通过 `extension` 参数限制允许选择的文件类型:

```vue
<template>
  <view class="extension-demo">
    <wd-button @click="selectPDF">选择 PDF</wd-button>
    <wd-button @click="selectDoc">选择文档</wd-button>
    <wd-button @click="selectImage">选择指定图片</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()

// 只选择 PDF 文件
const selectPDF = async () => {
  const files = await chooseFile({
    accept: 'file',
    multiple: true,
    extension: ['pdf'],  // 仅 PDF
  })
  console.log('PDF 文件:', files)
}

// 选择文档文件
const selectDoc = async () => {
  const files = await chooseFile({
    accept: 'file',
    multiple: true,
    extension: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  })
  console.log('文档文件:', files)
}

// 选择指定格式图片
const selectImage = async () => {
  const files = await chooseFile({
    accept: 'image',
    multiple: true,
    // #ifdef H5
    extension: ['jpg', 'jpeg', 'png'],  // H5 支持扩展名过滤
    // #endif
  })
  console.log('图片文件:', files)
}
</script>
```

**平台差异:**

- H5 平台支持完整的扩展名过滤
- 微信小程序在 `file` 和 `all` 类型时支持扩展名过滤
- 其他平台不支持扩展名过滤

## 选择后上传

### 选择图片并上传

最常用的场景是选择图片后立即上传到服务器:

```vue
<template>
  <view class="upload-demo">
    <wd-button type="primary" @click="selectAndUpload" :loading="uploading">
      选择并上传图片
    </wd-button>

    <view class="upload-list">
      <view
        v-for="(file, index) in uploadList"
        :key="index"
        class="upload-item"
      >
        <image :src="file.thumb" mode="aspectFill" class="thumb" />
        <view class="info">
          <text class="name">{{ file.name }}</text>
          <view class="progress-bar" v-if="file.status === 'loading'">
            <view class="progress" :style="{ width: file.percent + '%' }" />
          </view>
          <text class="status" :class="file.status">
            {{ getStatusText(file.status) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile, startUpload, UPLOAD_STATUS } = useUpload()

interface UploadItem {
  uid: number
  name: string
  thumb: string
  url: string
  status: string
  percent: number
  error?: string
}

const uploading = ref(false)
const uploadList = ref<UploadItem[]>([])

// 选择并上传图片
const selectAndUpload = async () => {
  try {
    // 1. 选择图片
    const files = await chooseFile({
      accept: 'image',
      multiple: true,
      maxCount: 3,
      sizeType: ['compressed'],
    })

    if (files.length === 0) return

    uploading.value = true

    // 2. 创建上传项
    const items = files.map((file, index) => ({
      uid: Date.now() + index,
      name: file.name || `图片${index + 1}`,
      thumb: file.path,
      url: file.path,
      status: 'pending',
      percent: 0
    }))

    uploadList.value = items

    // 3. 逐个上传
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      await new Promise<void>((resolve) => {
        startUpload(
          {
            uid: item.uid,
            url: item.url,
            name: item.name,
            type: 'image',
            size: 0,
            status: UPLOAD_STATUS.LOADING,
            percent: 0
          },
          {
            action: '/resource/oss/upload',
            name: 'file',
            onProgress: (res) => {
              item.status = 'loading'
              item.percent = res.progress
            },
            onSuccess: (res) => {
              item.status = 'success'
              item.percent = 100
              item.url = res.url  // 替换为服务器返回的URL
              resolve()
            },
            onError: (error) => {
              item.status = 'fail'
              item.error = error.errMsg
              resolve()
            }
          }
        )
      })
    }

    uploading.value = false
  } catch (error) {
    console.error('上传失败:', error)
    uploading.value = false
  }
}

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return '等待上传'
    case 'loading': return '上传中'
    case 'success': return '上传成功'
    case 'fail': return '上传失败'
    default: return ''
  }
}
</script>

```

### 快速上传

使用 `fastUpload` 方法可以快速上传单个文件,自动处理文件类型识别:

```vue
<template>
  <view class="fast-upload-demo">
    <wd-button @click="quickUpload">快速上传</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile, fastUpload } = useUpload()

const quickUpload = async () => {
  try {
    // 选择图片
    const files = await chooseFile({
      accept: 'image',
      multiple: false
    })

    if (files.length === 0) return

    // 快速上传
    fastUpload(files[0].path, {
      onProgress: (res) => {
        console.log('上传进度:', res.progress + '%')
      },
      onSuccess: (res) => {
        console.log('上传成功:', res.url)
        uni.showToast({ title: '上传成功', icon: 'success' })
      },
      onError: (err) => {
        console.error('上传失败:', err)
        uni.showToast({ title: '上传失败', icon: 'error' })
      }
    })
  } catch (error) {
    console.error('操作失败:', error)
  }
}
</script>
```

### 直传模式

支持直传到云存储(如 S3、OSS),跳过服务器中转,提高上传效率:

```vue
<template>
  <view class="direct-upload-demo">
    <wd-button @click="directUpload">直传到云存储</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile, fastUpload } = useUpload()

const directUpload = async () => {
  try {
    const files = await chooseFile({
      accept: 'image',
      multiple: false
    })

    if (files.length === 0) return

    // 启用直传模式
    fastUpload(files[0].path, {
      enableDirectUpload: true,  // 启用直传
      moduleName: 'avatar',      // 模块名称
      directoryId: 123,          // 目录ID
      onSuccess: (res) => {
        console.log('直传成功:', res)
      },
      onError: (err) => {
        console.error('直传失败:', err)
      }
    })
  } catch (error) {
    console.error('操作失败:', error)
  }
}
</script>
```

**直传流程:**

1. 获取预签名 URL
2. 判断存储类型(本地/云存储)
3. 若为云存储,直接上传到云端
4. 确认上传完成,返回文件信息

## 高级用法

### 头像上传

用户头像上传场景,使用裁剪后的压缩图:

```vue
<template>
  <view class="avatar-demo">
    <view class="avatar-wrapper" @click="changeAvatar">
      <image :src="avatar || defaultAvatar" mode="aspectFill" class="avatar" />
      <view class="avatar-mask">
        <text>更换头像</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile, fastUpload } = useUpload()

const defaultAvatar = '/static/images/default-avatar.png'
const avatar = ref('')

const changeAvatar = async () => {
  try {
    // 选择头像(相机优先)
    const files = await chooseFile({
      accept: 'image',
      multiple: false,
      maxCount: 1,
      sourceType: ['camera', 'album'],
      sizeType: ['compressed'],  // 使用压缩图
    })

    if (files.length === 0) return

    // 显示加载
    uni.showLoading({ title: '上传中...' })

    // 上传头像
    fastUpload(files[0].path, {
      moduleName: 'avatar',
      onSuccess: (res) => {
        uni.hideLoading()
        avatar.value = res.url

        // 更新用户信息
        updateUserAvatar(res.url)

        uni.showToast({ title: '头像已更新', icon: 'success' })
      },
      onError: (err) => {
        uni.hideLoading()
        uni.showToast({ title: '上传失败', icon: 'error' })
      }
    })
  } catch (error) {
    console.error('更换头像失败:', error)
  }
}

// 更新用户头像
const updateUserAvatar = (url: string) => {
  // 调用后端接口更新用户头像
  // ...
}
</script>

```

### 证件照上传

身份证等证件照上传,需要原图以保证清晰度:

```vue
<template>
  <view class="id-card-demo">
    <view class="card-item" @click="uploadIdCard('front')">
      <image
        :src="idCardFront || placeholderFront"
        mode="aspectFit"
        class="card-image"
      />
      <text>点击上传身份证正面</text>
    </view>

    <view class="card-item" @click="uploadIdCard('back')">
      <image
        :src="idCardBack || placeholderBack"
        mode="aspectFit"
        class="card-image"
      />
      <text>点击上传身份证背面</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile, fastUpload } = useUpload()

const placeholderFront = '/static/images/id-card-front.png'
const placeholderBack = '/static/images/id-card-back.png'
const idCardFront = ref('')
const idCardBack = ref('')

const uploadIdCard = async (side: 'front' | 'back') => {
  try {
    // 选择身份证照片(仅相机,需要原图)
    const files = await chooseFile({
      accept: 'image',
      multiple: false,
      sourceType: ['camera'],    // 仅相机拍摄
      sizeType: ['original'],    // 必须原图
    })

    if (files.length === 0) return

    uni.showLoading({ title: '识别中...' })

    // 上传到 OCR 识别接口
    fastUpload(files[0].path, {
      action: '/api/ocr/idcard',
      formData: { side },  // 传递正反面标识
      onSuccess: (res) => {
        uni.hideLoading()

        if (side === 'front') {
          idCardFront.value = res.url
        } else {
          idCardBack.value = res.url
        }

        // 展示识别结果
        // showOcrResult(res.ocrData)
      },
      onError: (err) => {
        uni.hideLoading()
        uni.showToast({ title: '识别失败', icon: 'error' })
      }
    })
  } catch (error) {
    console.error('上传证件照失败:', error)
  }
}
</script>

```

### 多图批量上传

支持选择多张图片并批量上传,带进度显示:

```vue
<template>
  <view class="batch-upload-demo">
    <wd-button @click="batchUpload" :disabled="uploading">
      批量上传 ({{ uploadedCount }}/{{ totalCount }})
    </wd-button>

    <view class="total-progress" v-if="uploading">
      <view class="progress-bar">
        <view
          class="progress"
          :style="{ width: totalProgress + '%' }"
        />
      </view>
      <text>{{ totalProgress }}%</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile, startUpload, UPLOAD_STATUS } = useUpload()

const uploading = ref(false)
const uploadedCount = ref(0)
const totalCount = ref(0)

const totalProgress = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((uploadedCount.value / totalCount.value) * 100)
})

const batchUpload = async () => {
  try {
    const files = await chooseFile({
      accept: 'image',
      multiple: true,
      maxCount: 9,
      sizeType: ['compressed']
    })

    if (files.length === 0) return

    uploading.value = true
    totalCount.value = files.length
    uploadedCount.value = 0

    // 并发上传(最多3个并发)
    const concurrency = 3
    const queue = [...files]
    const results: any[] = []

    const uploadOne = async () => {
      while (queue.length > 0) {
        const file = queue.shift()!

        await new Promise<void>((resolve) => {
          startUpload(
            {
              uid: Date.now() + Math.random(),
              url: file.path,
              name: file.name || '',
              type: 'image',
              size: file.size,
              status: UPLOAD_STATUS.LOADING,
              percent: 0
            },
            {
              action: '/resource/oss/upload',
              name: 'file',
              onSuccess: (res) => {
                results.push(res)
                uploadedCount.value++
                resolve()
              },
              onError: () => {
                uploadedCount.value++
                resolve()
              }
            }
          )
        })
      }
    }

    // 启动并发上传
    await Promise.all(
      Array(Math.min(concurrency, files.length))
        .fill(null)
        .map(() => uploadOne())
    )

    uploading.value = false

    console.log('上传完成:', results)
    uni.showToast({
      title: `成功上传 ${results.length} 张`,
      icon: 'success'
    })

  } catch (error) {
    console.error('批量上传失败:', error)
    uploading.value = false
  }
}
</script>

```

### 图片预览

选择图片后支持点击预览大图:

```vue
<template>
  <view class="preview-demo">
    <wd-button @click="selectImages">选择图片</wd-button>

    <view class="image-grid">
      <image
        v-for="(img, index) in images"
        :key="index"
        :src="img"
        mode="aspectFill"
        class="grid-image"
        @click="previewImage(index)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUpload } from '@/wd/components/composables/useUpload'

const { chooseFile } = useUpload()
const images = ref<string[]>([])

const selectImages = async () => {
  try {
    const files = await chooseFile({
      accept: 'image',
      multiple: true,
      maxCount: 9
    })

    images.value = files.map(f => f.path)
  } catch (error) {
    console.error('选择失败:', error)
  }
}

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    urls: images.value,
    current: index,
    indicator: 'number',
    loop: true
  })
}
</script>

```

## API 参考

### chooseFile 选项

```typescript
interface ChooseFileOption {
  /** 文件类型: image/video/media/file/all */
  accept?: 'image' | 'video' | 'media' | 'file' | 'all'

  /** 是否多选 */
  multiple?: boolean

  /** 最大选择数量 */
  maxCount?: number

  /**
   * 图片尺寸类型
   * original: 原图
   * compressed: 压缩图
   */
  sizeType?: ('original' | 'compressed')[]

  /**
   * 来源类型
   * album: 相册
   * camera: 相机
   */
  sourceType?: ('album' | 'camera')[]

  /** 是否压缩(视频) */
  compressed?: boolean

  /** 最大时长(视频,单位秒) */
  maxDuration?: number

  /**
   * 摄像头
   * back: 后置
   * front: 前置
   */
  camera?: 'back' | 'front'

  /** 文件扩展名过滤 */
  extension?: string[]
}
```

### ChooseFile 返回值

```typescript
interface ChooseFile {
  /** 文件路径 */
  path: string

  /** 文件名称 */
  name?: string

  /** 文件大小(字节) */
  size: number

  /** 文件类型 */
  type: 'image' | 'video' | 'file'

  /** 缩略图路径(图片/视频) */
  thumb?: string

  /** 时长(视频,单位秒) */
  duration?: number
}
```

### FastUploadOptions

```typescript
interface FastUploadOptions {
  /** 上传地址 */
  action?: string

  /** 请求头 */
  header?: Record<string, any>

  /** 表单数据 */
  formData?: Record<string, any>

  /** 文件字段名 */
  name?: string

  /** 成功状态码 */
  statusCode?: number

  /** 自定义上传方法 */
  uploadMethod?: UploadMethod

  /** 上传成功回调 */
  onSuccess?: (res: UploadResult, file: UploadFileItem, formData: Record<string, any>) => void

  /** 上传失败回调 */
  onError?: (error: UniApp.GeneralCallbackResult, file: UploadFileItem, formData: Record<string, any>) => void

  /** 上传进度回调 */
  onProgress?: (res: UniApp.OnProgressUpdateResult, file: UploadFileItem) => void

  /** 是否中断之前的上传 */
  abortPrevious?: boolean

  /** 是否启用直传 */
  enableDirectUpload?: boolean

  /** 模块名称 */
  moduleName?: string

  /** 目录ID */
  directoryId?: string | number

  /** 文件路径 */
  directoryPath?: string
}
```

### UploadResult

```typescript
interface UploadResult {
  /** 文件名称 */
  fileName: string

  /** 文件URL */
  url: string

  /** OSS文件ID */
  ossId: string

  /** 更新时间 */
  updateTime: string
}
```

### useUpload 返回值

```typescript
interface UseUploadReturn {
  /** 开始上传 */
  startUpload: (file: UploadFileItem, options: UseUploadOptions) => UniApp.UploadTask | void | Promise<void>

  /** 快速上传 */
  fastUpload: (filePath: string, options?: FastUploadOptions) => UniApp.UploadTask | void | Promise<void>

  /** 中断上传 */
  abort: (task?: UniApp.UploadTask) => void

  /** 上传状态常量 */
  UPLOAD_STATUS: Record<string, UploadStatusType>

  /** 选择文件 */
  chooseFile: (options: ChooseFileOption) => Promise<ChooseFile[]>
}
```

## 最佳实践

### 1. 合理配置压缩选项

```typescript
// 头像场景 - 使用压缩图
const selectAvatar = () => chooseFile({
  accept: 'image',
  sizeType: ['compressed'],  // 头像不需要高清
  maxCount: 1
})

// 证件场景 - 使用原图
const selectIdCard = () => chooseFile({
  accept: 'image',
  sizeType: ['original'],    // 需要高清识别
  maxCount: 1
})

// 普通场景 - 都可以
const selectImages = () => chooseFile({
  accept: 'image',
  sizeType: ['original', 'compressed'],  // 让用户选择
  maxCount: 9
})
```

### 2. 合理限制文件来源

```typescript
// 实名认证 - 仅相机
const authPhoto = () => chooseFile({
  accept: 'image',
  sourceType: ['camera'],  // 防止使用他人照片
})

// 发布内容 - 都可以
const contentImage = () => chooseFile({
  accept: 'image',
  sourceType: ['album', 'camera'],
})

// 选择文档 - 仅相册
const selectDoc = () => chooseFile({
  accept: 'file',
  sourceType: ['album'],  // 文件只能从相册
})
```

### 3. 处理平台差异

```typescript
const selectMedia = async () => {
  try {
    const files = await chooseFile({
      accept: 'media',  // 微信小程序支持混选
      multiple: true
    })

    // 根据类型分别处理
    const images = files.filter(f => f.type === 'image')
    const videos = files.filter(f => f.type === 'video')

    console.log('图片:', images.length, '视频:', videos.length)
  } catch (error) {
    // 非微信平台会降级为图片选择
    console.error('选择失败:', error)
  }
}
```

### 4. 上传前验证

```typescript
const uploadWithValidation = async () => {
  const files = await chooseFile({
    accept: 'image',
    multiple: true
  })

  // 验证文件大小
  const maxSize = 5 * 1024 * 1024  // 5MB
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      uni.showToast({
        title: `${file.name} 超过5MB`,
        icon: 'none'
      })
      return false
    }
    return true
  })

  // 验证文件数量
  if (validFiles.length === 0) {
    uni.showToast({ title: '没有可上传的文件', icon: 'none' })
    return
  }

  // 开始上传
  // ...
}
```

## 常见问题

### 1. 选择图片返回空数组

**问题描述:** 调用 `chooseFile` 后返回空数组,没有选择到图片。

**原因分析:**
- 用户取消了选择操作
- 权限被拒绝
- 相机/相册不可用

**解决方案:**

```typescript
const selectImage = async () => {
  try {
    const files = await chooseFile({
      accept: 'image',
      multiple: true
    })

    if (files.length === 0) {
      // 用户取消选择,静默处理
      return
    }

    // 处理选择的文件
    processFiles(files)
  } catch (error: any) {
    // 判断错误类型
    if (error.errMsg?.includes('cancel')) {
      // 用户取消
      return
    } else if (error.errMsg?.includes('auth')) {
      // 权限问题
      uni.showModal({
        title: '权限提示',
        content: '请授权访问相册/相机',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting({})
          }
        }
      })
    } else {
      // 其他错误
      uni.showToast({ title: '选择失败', icon: 'error' })
    }
  }
}
```

### 2. 上传进度不更新

**问题描述:** 上传文件时进度回调没有触发。

**原因分析:**
- 小文件上传太快
- 回调函数未正确绑定
- 直传模式的进度是模拟的

**解决方案:**

```typescript
const { startUpload } = useUpload()

startUpload(file, {
  action: '/upload',
  onProgress: (res, file) => {
    console.log('进度:', res.progress)

    // 确保UI更新
    file.percent = res.progress

    // 如果使用响应式数据
    uploadProgress.value = res.progress
  },
  onSuccess: (res) => {
    // 成功时确保进度为100%
    uploadProgress.value = 100
  }
})
```

### 3. 微信小程序无法选择文件

**问题描述:** 在微信小程序中使用 `accept: 'file'` 无法选择文件。

**原因分析:**
- 微信小程序使用 `chooseMessageFile` 从会话选择
- 需要用户先在聊天中发送文件

**解决方案:**

```typescript
const selectFile = async () => {
  try {
    const files = await chooseFile({
      accept: 'file',
      multiple: true
    })

    // 处理文件
  } catch (error: any) {
    // #ifdef MP-WEIXIN
    if (error.errMsg?.includes('cancel')) {
      // 提示用户
      uni.showToast({
        title: '请从聊天记录选择文件',
        icon: 'none'
      })
    }
    // #endif
  }
}
```

### 4. 直传失败

**问题描述:** 启用直传模式后上传失败。

**原因分析:**
- 预签名 URL 过期
- CORS 配置问题
- 文件类型不匹配

**解决方案:**

```typescript
const { fastUpload } = useUpload()

fastUpload(filePath, {
  enableDirectUpload: true,
  moduleName: 'images',
  onError: (error, file) => {
    console.error('直传失败:', error)

    // 降级为普通上传
    if (error.errMsg?.includes('presigned') ||
        error.errMsg?.includes('CORS')) {
      uni.showModal({
        title: '提示',
        content: '直传失败,是否使用普通上传?',
        success: (res) => {
          if (res.confirm) {
            // 使用普通上传
            fastUpload(filePath, {
              enableDirectUpload: false,
              onSuccess: (res) => {
                console.log('普通上传成功')
              }
            })
          }
        }
      })
    }
  }
})
```

### 5. 视频录制时长不生效

**问题描述:** 设置 `maxDuration` 后,录制时长限制不起作用。

**原因分析:**
- 部分平台不支持精确控制
- 从相册选择不受限制

**解决方案:**

```typescript
const recordVideo = async () => {
  const files = await chooseFile({
    accept: 'video',
    sourceType: ['camera'],  // 仅相机才能限制时长
    maxDuration: 15,
    compressed: true
  })

  if (files.length > 0) {
    // 服务端二次验证时长
    if (files[0].duration && files[0].duration > 15) {
      uni.showToast({
        title: '视频时长不能超过15秒',
        icon: 'none'
      })
      return
    }
  }
}
```
