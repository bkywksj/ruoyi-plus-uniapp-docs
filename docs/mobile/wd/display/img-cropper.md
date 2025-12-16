# ImgCropper 图片裁剪

## 介绍

ImgCropper 是一个功能完善的图片裁剪组件,提供了直观的全屏裁剪界面,让用户能够轻松地对图片进行裁剪、缩放和旋转操作。该组件基于 Canvas 技术实现,能够输出高质量的裁剪结果,广泛应用于头像上传、图片编辑、证件照处理等场景。

**核心特性:**

- **手势操作** - 支持单指拖动移动图片位置,双指捏合缩放图片大小
- **旋转功能** - 支持 90 度步进旋转,可通过按钮或方法控制旋转角度
- **自定义比例** - 支持设置裁剪框宽高比,如 1:1、4:3、16:9 等常见比例
- **图片尺寸** - 支持设置图片初始宽高,支持百分比和 rpx 单位
- **缩放限制** - 支持设置最大缩放倍数,防止图片过度放大
- **输出控制** - 支持设置输出图片的格式、质量和缩放比例
- **边界检测** - 智能边界检测确保裁剪区域始终在图片范围内
- **动画过渡** - 旋转和边界回弹时带有平滑的动画效果
- **多语言支持** - 内置国际化支持,按钮文案自动适配语言环境

## 基本用法

### 基础裁剪

最基础的用法,打开裁剪器并处理裁剪结果:

```vue
<template>
  <view class="demo">
    <wd-button @click="openCropper">选择图片裁剪</wd-button>
    <view v-if="croppedImage" class="result">
      <text>裁剪结果:</text>
      <image :src="croppedImage" mode="aspectFit" class="preview" />
    </view>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')
const croppedImage = ref('')

// 选择图片并打开裁剪器
const openCropper = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}

// 处理裁剪确认
const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪结果:', result)
  croppedImage.value = result.tempFilePath
}

// 处理裁剪取消
const handleCancel = () => {
  console.log('用户取消裁剪')
}
</script>

```

**使用说明:**
- 通过 `v-model` 控制裁剪器的显示和隐藏
- `img-src` 属性指定待裁剪的图片路径,支持本地临时路径和网络图片
- `confirm` 事件返回裁剪后的图片临时路径及尺寸信息
- 组件打开时会自动全屏显示,并将图片居中对齐到裁剪框

### 自定义裁剪比例

通过 `aspect-ratio` 属性设置裁剪框的宽高比:

```vue
<template>
  <view class="demo">
    <wd-button @click="cropSquare">1:1 正方形</wd-button>
    <wd-button @click="cropLandscape">16:9 横向</wd-button>
    <wd-button @click="cropPortrait">3:4 竖向</wd-button>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      :aspect-ratio="aspectRatio"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')
const aspectRatio = ref('1:1')

const selectAndCrop = (ratio: string) => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      aspectRatio.value = ratio
      showCropper.value = true
    }
  })
}

const cropSquare = () => selectAndCrop('1:1')
const cropLandscape = () => selectAndCrop('16:9')
const cropPortrait = () => selectAndCrop('3:4')

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪比例:', aspectRatio.value)
  console.log('输出尺寸:', result.width, 'x', result.height)
}
</script>
```

**使用说明:**
- `aspect-ratio` 属性格式为 `宽:高`,如 `1:1`、`4:3`、`16:9` 等
- 裁剪框会根据屏幕宽度自动计算合适的尺寸
- 宽高比改变时,裁剪框高度会相应调整

### 设置图片尺寸

通过 `img-width` 和 `img-height` 属性控制图片的初始显示尺寸:

```vue
<template>
  <view class="demo">
    <wd-button @click="cropWithSize">指定尺寸裁剪</wd-button>
    <wd-button @click="cropWithPercent">百分比尺寸</wd-button>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      :img-width="imgWidth"
      :img-height="imgHeight"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')
const imgWidth = ref<string | number>('')
const imgHeight = ref<string | number>('')

// 使用固定 rpx 尺寸
const cropWithSize = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      imgWidth.value = 600  // 600rpx
      imgHeight.value = ''  // 高度自动按比例计算
      showCropper.value = true
    }
  })
}

// 使用百分比尺寸
const cropWithPercent = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      imgWidth.value = '80%'  // 屏幕宽度的 80%
      imgHeight.value = ''
      showCropper.value = true
    }
  })
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪完成')
}
</script>
```

**使用说明:**
- `img-width` 和 `img-height` 支持数值(rpx)和百分比字符串
- 只设置宽度或高度时,另一边会按图片原始比例自动计算
- 不设置尺寸时,组件会自动计算使图片填满裁剪框
- 百分比相对于屏幕尺寸计算

### 缩放控制

通过 `max-scale` 属性限制最大缩放倍数:

```vue
<template>
  <view class="demo">
    <wd-button @click="openCropper">打开裁剪器</wd-button>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      :max-scale="5"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')

const openCropper = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪完成')
}
</script>
```

**使用说明:**
- `max-scale` 默认值为 3,表示最大放大 3 倍
- 双指捏合缩放时会受到最大缩放限制
- 缩放时会自动进行边界检测,确保裁剪框始终在图片范围内

### 禁用旋转

通过 `disabled-rotate` 属性禁用旋转功能:

```vue
<template>
  <view class="demo">
    <wd-button @click="openCropper">打开裁剪器(禁用旋转)</wd-button>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      disabled-rotate
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')

const openCropper = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪完成')
}
</script>
```

**使用说明:**
- 设置 `disabled-rotate` 后,底部旋转按钮将隐藏
- 调用 `setRoate` 方法也将不生效
- 适用于不需要旋转功能的场景

### 输出配置

通过 `file-type`、`quality` 和 `export-scale` 属性控制输出图片的格式和质量:

```vue
<template>
  <view class="demo">
    <wd-button @click="cropHighQuality">高质量输出</wd-button>
    <wd-button @click="cropCompressed">压缩输出</wd-button>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      :file-type="fileType"
      :quality="quality"
      :export-scale="exportScale"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')
const fileType = ref('png')
const quality = ref(1)
const exportScale = ref(2)

// 高质量输出配置
const cropHighQuality = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      fileType.value = 'png'
      quality.value = 1
      exportScale.value = 3
      showCropper.value = true
    }
  })
}

// 压缩输出配置
const cropCompressed = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      fileType.value = 'jpg'
      quality.value = 0.8
      exportScale.value = 1
      showCropper.value = true
    }
  })
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('输出图片尺寸:', result.width, 'x', result.height)
}
</script>
```

**使用说明:**
- `file-type` 支持 `png` 和 `jpg` 格式,默认为 `png`
- `quality` 取值范围 0-1,仅在 `file-type` 为 `jpg` 时生效
- `export-scale` 控制输出图片的缩放比例,默认为 2,即输出 2 倍裁剪框尺寸的图片

### 自定义按钮文案

通过 `cancel-button-text` 和 `confirm-button-text` 属性自定义按钮文案:

```vue
<template>
  <view class="demo">
    <wd-button @click="openCropper">打开裁剪器</wd-button>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      cancel-button-text="返回"
      confirm-button-text="保存"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')

const openCropper = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪完成')
}
</script>
```

**使用说明:**
- 不设置时会使用国际化配置的默认文案
- 中文环境默认为"取消"和"完成"

### 组件方法调用

通过 ref 获取组件实例,调用组件方法:

```vue
<template>
  <view class="demo">
    <wd-button @click="openCropper">打开裁剪器</wd-button>

    <wd-img-cropper
      ref="cropperRef"
      v-model="showCropper"
      :img-src="imgSrc"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ImgCropperInstance } from '@/wd'

const cropperRef = ref<ImgCropperInstance>()
const showCropper = ref(false)
const imgSrc = ref('')

const openCropper = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}

// 重置图片状态
const resetImage = () => {
  cropperRef.value?.resetImg()
}

// 设置旋转角度
const rotateImage = (angle: number) => {
  cropperRef.value?.setRoate(angle)
}

// 控制动画
const toggleAnimation = (enable: boolean) => {
  cropperRef.value?.revertIsAnimation(enable)
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪完成')
}
</script>
```

**使用说明:**
- `resetImg()` 方法重置图片的位置、缩放和旋转状态
- `setRoate(angle)` 方法设置图片旋转角度,支持任意角度,会自动校正为 90 度的倍数
- `revertIsAnimation(enable)` 方法控制是否启用动画效果

### 处理图片加载事件

监听图片加载成功和失败事件:

```vue
<template>
  <view class="demo">
    <wd-button @click="openCropper">打开裁剪器</wd-button>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      @imgloaded="handleImgLoaded"
      @imgloaderror="handleImgLoadError"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showCropper = ref(false)
const imgSrc = ref('')

const openCropper = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      imgSrc.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}

// 图片加载成功
const handleImgLoaded = (res: any) => {
  console.log('图片加载成功:', res)
}

// 图片加载失败
const handleImgLoadError = (err: any) => {
  console.error('图片加载失败:', err)
  uni.showToast({
    title: '图片加载失败',
    icon: 'none'
  })
  showCropper.value = false
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  console.log('裁剪完成')
}
</script>
```

**使用说明:**
- `imgloaded` 事件在图片加载成功时触发
- `imgloaderror` 事件在图片加载失败时触发
- 可以在加载失败时关闭裁剪器并提示用户

### 头像上传场景

完整的头像上传示例:

```vue
<template>
  <view class="avatar-upload">
    <view class="avatar" @click="selectAvatar">
      <image v-if="avatar" :src="avatar" mode="aspectFill" class="avatar-img" />
      <view v-else class="avatar-placeholder">
        <wd-icon name="camera" size="60rpx" color="#999" />
        <text class="tip">点击上传头像</text>
      </view>
    </view>

    <wd-img-cropper
      v-model="showCropper"
      :img-src="tempImage"
      aspect-ratio="1:1"
      :export-scale="2"
      file-type="jpg"
      :quality="0.9"
      @confirm="handleCropConfirm"
      @cancel="handleCropCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const avatar = ref('')
const tempImage = ref('')
const showCropper = ref(false)

// 选择图片
const selectAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      tempImage.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}

// 裁剪确认,上传头像
const handleCropConfirm = async (result: { tempFilePath: string; width: number; height: number }) => {
  try {
    uni.showLoading({ title: '上传中...' })

    // 模拟上传,实际项目替换为真实上传逻辑
    // const uploadResult = await uploadFile(result.tempFilePath)
    // avatar.value = uploadResult.url

    // 演示直接使用本地路径
    avatar.value = result.tempFilePath

    uni.hideLoading()
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '上传失败', icon: 'none' })
  }
}

// 裁剪取消
const handleCropCancel = () => {
  tempImage.value = ''
}
</script>

```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 控制裁剪器显示/隐藏 | `boolean` | `false` |
| img-src | 图片源路径 | `string` | `''` |
| img-width | 图片宽度,支持 rpx 数值和百分比字符串 | `string \| number` | `''` |
| img-height | 图片高度,支持 rpx 数值和百分比字符串 | `string \| number` | `''` |
| aspect-ratio | 裁剪框宽高比,格式为 `宽:高` | `string` | `'1:1'` |
| max-scale | 最大缩放倍数 | `number` | `3` |
| disabled-rotate | 是否禁用旋转功能 | `boolean` | `false` |
| file-type | 输出图片格式 | `'png' \| 'jpg'` | `'png'` |
| quality | 输出图片质量,仅 jpg 格式有效,取值 0-1 | `number` | `1` |
| export-scale | 输出图片缩放比例 | `number` | `2` |
| cancel-button-text | 取消按钮文案 | `string` | - |
| confirm-button-text | 确认按钮文案 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 确认裁剪时触发 | `{ tempFilePath: string; width: number; height: number }` |
| cancel | 取消裁剪时触发 | - |
| imgloaded | 图片加载成功时触发 | `res: any` |
| imgloaderror | 图片加载失败时触发 | `err: any` |
| update:modelValue | 显示状态变化时触发 | `value: boolean` |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 |
|--------|------|------|
| resetImg | 重置图片状态(位置、缩放、旋转) | - |
| setRoate | 设置图片旋转角度 | `angle: number` |
| revertIsAnimation | 控制是否启用动画 | `enable: boolean` |

### 类型定义

```typescript
/**
 * 图片裁剪组件属性接口
 */
interface WdImgCropperProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 打开图片裁剪组件 */
  modelValue?: boolean
  /** 取消按钮文案 */
  cancelButtonText?: string
  /** 确认按钮文案 */
  confirmButtonText?: string
  /** 是否禁用旋转 */
  disabledRotate?: boolean
  /** 目标文件的类型 */
  fileType?: string
  /** 生成的图片质量,取值 0-1 */
  quality?: number
  /** 设置导出图片尺寸缩放比例 */
  exportScale?: number
  /** 图片源路径 */
  imgSrc?: string
  /** 图片宽(rpx 或百分比) */
  imgWidth?: string | number
  /** 图片高(rpx 或百分比) */
  imgHeight?: string | number
  /** 最大缩放倍数 */
  maxScale?: number
  /** 裁剪框宽高比,格式为 width:height */
  aspectRatio?: string
}

/**
 * 裁剪结果接口
 */
interface CropResult {
  /** 裁剪后的临时文件路径 */
  tempFilePath: string
  /** 裁剪后图片宽度(px) */
  width: number
  /** 裁剪后图片高度(px) */
  height: number
}

/**
 * 图片裁剪组件暴露方法接口
 */
interface WdImgCropperExpose {
  /** 逆转是否使用动画 */
  revertIsAnimation: (animation: boolean) => void
  /** 初始化图片的大小和角度以及距离 */
  resetImg: () => void
  /** 控制旋转角度 */
  setRoate: (angle: number) => void
}

/** 图片裁剪组件实例类型 */
type ImgCropperInstance = ComponentPublicInstance<WdImgCropperProps, WdImgCropperExpose>
```

## 主题定制

### CSS 变量

ImgCropper 组件提供以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-img-cropper-icon-size | 旋转图标大小 | `48rpx` |
| --wot-img-cropper-icon-color | 旋转图标颜色 | `#fff` |

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <wd-img-cropper
      v-model="showCropper"
      :img-src="imgSrc"
      custom-class="custom-cropper"
      @confirm="handleConfirm"
    />
  </view>
</template>

<style lang="scss">
.custom-cropper {
  --wot-img-cropper-icon-size: 56rpx;
  --wot-img-cropper-icon-color: #4caf50;
}
</style>
```

## 最佳实践

### 1. 图片选择前的预处理

建议在选择图片时进行适当的压缩,减少内存占用:

```vue
<script lang="ts" setup>
const selectImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],  // 使用压缩图
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 可以进一步检查文件大小
      const tempFile = res.tempFiles[0]
      if (tempFile.size > 10 * 1024 * 1024) {
        uni.showToast({ title: '图片过大,请选择较小的图片', icon: 'none' })
        return
      }
      imgSrc.value = res.tempFilePaths[0]
      showCropper.value = true
    }
  })
}
</script>
```

### 2. 合理配置输出参数

根据使用场景选择合适的输出配置:

```vue
<script lang="ts" setup>
// 头像场景:中等质量,小尺寸
const avatarConfig = {
  aspectRatio: '1:1',
  fileType: 'jpg',
  quality: 0.8,
  exportScale: 2
}

// 证件照场景:高质量,标准比例
const idPhotoConfig = {
  aspectRatio: '35:45',  // 证件照标准比例
  fileType: 'jpg',
  quality: 0.95,
  exportScale: 3
}

// 封面图场景:高质量,宽屏比例
const coverConfig = {
  aspectRatio: '16:9',
  fileType: 'jpg',
  quality: 0.9,
  exportScale: 2
}
</script>
```

### 3. 错误处理

完善的错误处理能提升用户体验:

```vue
<script lang="ts" setup>
const handleImgLoadError = (err: any) => {
  console.error('图片加载失败:', err)
  showCropper.value = false

  uni.showModal({
    title: '提示',
    content: '图片加载失败,请重新选择',
    showCancel: false,
    success: () => {
      selectImage()
    }
  })
}

const handleConfirm = (result: { tempFilePath: string; width: number; height: number }) => {
  if (!result.tempFilePath) {
    uni.showToast({ title: '裁剪失败,请重试', icon: 'none' })
    return
  }
  // 正常处理逻辑
}
</script>
```

## 常见问题

### 1. 裁剪后图片模糊

**问题原因:**
- `exportScale` 值设置过小
- 原图分辨率不足
- 输出格式和质量设置不当

**解决方案:**

```vue
<template>
  <wd-img-cropper
    v-model="showCropper"
    :img-src="imgSrc"
    :export-scale="3"
    file-type="png"
    :quality="1"
    @confirm="handleConfirm"
  />
</template>
```

建议根据实际需要的输出尺寸调整 `exportScale`,例如需要 600px 的图片,裁剪框 200px 时设置 `exportScale` 为 3。

### 2. 图片无法完全填满裁剪框

**问题原因:**
- 图片原始比例与裁剪框比例差异较大
- 设置了固定的 `imgWidth` 或 `imgHeight`

**解决方案:**

不设置 `imgWidth` 和 `imgHeight`,让组件自动计算合适的尺寸:

```vue
<template>
  <wd-img-cropper
    v-model="showCropper"
    :img-src="imgSrc"
    aspect-ratio="1:1"
    @confirm="handleConfirm"
  />
</template>
```

### 3. 旋转后图片位置异常

**问题原因:**
- 旋转后图片宽高互换,可能导致超出裁剪框边界

**解决方案:**

组件内部已实现自动边界检测和缩放调整,确保旋转后图片仍能完全覆盖裁剪框。如果仍有问题,可以调用 `resetImg()` 方法重置:

```vue
<script lang="ts" setup>
const handleRotate = () => {
  // 如果旋转后位置异常,可以重置
  cropperRef.value?.resetImg()
}
</script>
```

### 4. 在某些设备上裁剪失败

**问题原因:**
- Canvas 尺寸超出设备限制
- 图片过大导致内存不足

**解决方案:**

```vue
<template>
  <wd-img-cropper
    v-model="showCropper"
    :img-src="imgSrc"
    :export-scale="2"
    file-type="jpg"
    :quality="0.8"
    @imgloaderror="handleError"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup>
const handleError = () => {
  uni.showToast({ title: '图片处理失败,请选择较小的图片', icon: 'none' })
}
</script>
```

### 5. 网络图片无法裁剪

**问题原因:**
- 跨域图片无法绘制到 Canvas
- 网络图片加载超时

**解决方案:**

先下载网络图片到本地再进行裁剪:

```vue
<script lang="ts" setup>
const cropNetworkImage = async (url: string) => {
  try {
    uni.showLoading({ title: '加载中...' })

    const result = await uni.downloadFile({ url })
    if (result.statusCode === 200) {
      imgSrc.value = result.tempFilePath
      showCropper.value = true
    } else {
      throw new Error('Download failed')
    }
  } catch (error) {
    uni.showToast({ title: '图片加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>
```
