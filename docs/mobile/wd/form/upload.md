# Upload 上传

## 介绍

Upload 上传组件是一个功能强大的文件上传组件,专为移动端设计,支持图片、视频、音频和各类文档上传。组件提供了完善的上传流程管理、丰富的钩子函数、灵活的数据返回模式,以及与表单系统的深度集成。无论是简单的图片上传还是复杂的文件管理场景,都能轻松应对。

**核心特性:**

- **多文件类型支持** - 支持图片、视频、音频、文档等多种文件类型,自动识别文件类型并显示对应图标
- **双返回模式** - 支持 URL 模式(返回文件地址)和 ossId 模式(返回 OSS 文件ID),兼容旧数据格式
- **直传模式** - 支持客户端直传 OSS,减轻服务器压力,提升上传速度
- **完整生命周期钩子** - 提供 beforeChoose、beforeUpload、beforeRemove、beforePreview、buildFormData 等钩子
- **自定义上传方法** - 支持完全自定义上传逻辑,满足特殊业务需求
- **实时上传进度** - 显示上传进度百分比,支持加载动画自定义
- **智能文件预览** - 图片支持原生预览,视频支持播放,文档支持打开
- **表单深度集成** - 完整支持表单验证、必填标识、错误提示,支持水平/垂直布局
- **灵活的数据格式** - v-model 支持数组和字符串两种格式,自动转换
- **文件大小限制** - 支持单文件大小限制,超出自动提示
- **数量限制** - 支持最大上传数量限制,达到上限自动隐藏上传按钮
- **预览尺寸控制** - 提供 small、medium、large 三种预览尺寸

参考: src/wd/components/wd-upload/wd-upload.vue:1-16

## 基本用法

### 图片上传(默认)

最简单的图片上传,默认返回图片 URL。

```vue
<template>
  <view class="demo">
    <wd-upload v-model="images" :limit="3" />
    <view class="result">已上传: {{ images }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 图片URL数组
const images = ref<string>('https://example.com/img1.jpg,https://example.com/img2.jpg')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.result {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**
- 默认 `accept="image"`,只能选择图片
- 默认返回逗号分隔的 URL 字符串
- `limit` 限制最大上传数量
- 自动显示上传进度和成功/失败状态

参考: src/wd/components/wd-upload/wd-upload.vue:642-706

### ossId 返回模式

使用 `returnMode="ossId"` 返回 OSS 文件 ID,适用于需要关联文件记录的场景。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="attachments"
      :limit="5"
      return-mode="ossId"
      accept="all"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// ossId 字符串: "123,456,789"
const attachments = ref<string>('123,456,789')
</script>
```

**使用说明:**
- `returnMode="ossId"` 返回 OSS 文件 ID
- 组件会自动调用接口获取文件详细信息进行回显
- 兼容旧的 URL 格式数据,自动识别
- ossId 模式下可以获取完整的文件信息(文件名、URL、大小等)

参考: src/wd/components/wd-upload/wd-upload.vue:942-965, 972-1059

### 视频上传

上传视频文件,支持视频预览。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="videos"
      accept="video"
      :limit="3"
      :max-duration="60"
      :compressed="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const videos = ref<string>('')
</script>
```

**使用说明:**
- `accept="video"` 只能选择视频
- `maxDuration` 限制拍摄视频的最长时长(秒)
- `compressed` 是否压缩视频
- 视频预览显示播放按钮,点击可预览

参考: src/wd/components/wd-upload/wd-upload.vue:64-96, 1501-1533

### 文件上传

上传各类文档文件,自动显示文件类型图标。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="files"
      accept="file"
      :limit="10"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const files = ref<string>('')
</script>
```

**使用说明:**
- `accept="file"` 选择文档文件
- 默认支持 PDF、Word、Excel、PPT、TXT、ZIP 等格式
- 根据文件扩展名自动显示对应图标
- 点击文件可预览(支持的格式)

参考: src/wd/components/wd-upload/wd-upload.vue:98-103, 808-848

### 混合上传(图片+视频)

同时支持图片和视频上传。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="media"
      accept="media"
      :limit="9"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const media = ref<string>('')
</script>
```

**使用说明:**
- `accept="media"` 同时支持图片和视频
- 自动识别文件类型并正确显示
- 图片和视频统一计入 limit 限制

参考: src/wd/components/wd-upload/wd-upload.vue:754-773

### 数组格式绑定

v-model 使用数组格式,适合需要文件详细信息的场景。

```vue
<template>
  <view class="demo">
    <wd-upload v-model="fileList" :limit="3" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadFile } from '@/wd'

const fileList = ref<UploadFile[]>([
  {
    url: 'https://example.com/img1.jpg',
    name: '图片1.jpg',
    uid: 1,
  },
  {
    url: 'https://example.com/img2.jpg',
    name: '图片2.jpg',
    uid: 2,
  },
])
</script>
```

**使用说明:**
- v-model 绑定 `UploadFile[]` 数组
- 数组中包含完整的文件信息(url、name、uid、size、status 等)
- 适合需要获取文件详细信息的场景

参考: src/wd/components/wd-upload/wd-upload.vue:1648-1688

### 禁用状态

禁用上传功能。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :disabled="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('https://example.com/img1.jpg')
</script>
```

**使用说明:**
- `disabled="true"` 禁用上传
- 禁用后无法选择文件,无法删除已有文件
- 唤起按钮置灰显示

参考: src/wd/components/wd-upload/wd-upload.vue:1444-1445

### 文件大小限制

限制单个文件的最大大小。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :max-size="5 * 1024 * 1024"
      @oversize="handleOversize"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { uni } from '@dcloudio/uni-app'

const images = ref<string>('')

const handleOversize = ({ file }) => {
  uni.showToast({
    title: `文件大小不能超过 5MB`,
    icon: 'none',
  })
}
</script>
```

**使用说明:**
- `maxSize` 单位为字节(byte)
- 超出大小的文件不会上传,触发 `oversize` 事件
- 默认值为 `Number.MAX_VALUE`(不限制)

参考: src/wd/components/wd-upload/wd-upload.vue:1417

## 高级用法

### 直传模式

启用客户端直传 OSS,提升上传速度。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :enable-direct-upload="true"
      module-name="product"
      directory-id="123"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')
</script>
```

**使用说明:**
- `enableDirectUpload="true"` 启用直传模式
- `moduleName` 指定模块名称,用于 OSS 分类
- `directoryId` 指定目录 ID
- `directoryPath` 指定目录路径
- 直传模式下文件直接上传到 OSS,不经过业务服务器

参考: src/wd/components/wd-upload/wd-upload.vue:1211-1288

### beforeUpload 上传前校验

在文件开始上传前进行校验。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :before-upload="handleBeforeUpload"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadBeforeUploadOption } from '@/wd'

const images = ref<string>('')

const handleBeforeUpload = (option: UploadBeforeUploadOption) => {
  const { files, fileList, resolve } = option

  // 检查文件类型
  const invalidFile = files.find(file => {
    return !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  })

  if (invalidFile) {
    uni.showToast({
      title: '只能上传 JPG/PNG 格式图片',
      icon: 'none',
    })
    resolve(false) // 阻止上传
  } else {
    resolve(true) // 允许上传
  }
}
</script>
```

**使用说明:**
- `beforeUpload` 在文件上传前触发
- 通过 `resolve(true)` 允许上传,`resolve(false)` 阻止上传
- 可以进行文件类型、内容等校验
- 支持异步校验

参考: src/wd/components/wd-upload/wd-upload.vue:1422-1432

### beforeChoose 选择前钩子

在用户选择文件前进行拦截。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :before-choose="handleBeforeChoose"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadBeforeChooseOption } from '@/wd'

const images = ref<string>('')

const handleBeforeChoose = (option: UploadBeforeChooseOption) => {
  const { fileList, resolve } = option

  // 检查是否已有文件
  if (fileList.length >= 3) {
    uni.showToast({
      title: '最多只能上传3张图片',
      icon: 'none',
    })
    resolve(false)
  } else {
    resolve(true)
  }
}
</script>
```

**使用说明:**
- `beforeChoose` 在打开文件选择器前触发
- 可以根据当前文件列表判断是否允许继续选择
- 通过 `resolve(true/false)` 控制是否打开选择器

参考: src/wd/components/wd-upload/wd-upload.vue:1444-1458

### beforeRemove 删除前确认

在删除文件前进行确认。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :before-remove="handleBeforeRemove"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadBeforeRemoveOption } from '@/wd'

const images = ref<string>('')

const handleBeforeRemove = (option: UploadBeforeRemoveOption) => {
  const { file, index, fileList, resolve } = option

  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${file.name || '这个文件'} 吗?`,
    success: (res) => {
      if (res.confirm) {
        resolve(true) // 确认删除
      } else {
        resolve(false) // 取消删除
      }
    },
  })
}
</script>
```

**使用说明:**
- `beforeRemove` 在删除文件前触发
- 可以弹出确认框或进行其他检查
- 通过 `resolve(true/false)` 控制是否删除

参考: src/wd/components/wd-upload/wd-upload.vue:1342-1359

### beforePreview 预览前钩子

在预览文件前进行拦截。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :before-preview="handleBeforePreview"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadBeforePreviewOption } from '@/wd'

const images = ref<string>('')

const handleBeforePreview = (option: UploadBeforePreviewOption) => {
  const { file, index, imgList, fileList, resolve } = option

  // 检查文件状态
  if (file.status !== 'success') {
    uni.showToast({
      title: '文件未上传成功,无法预览',
      icon: 'none',
    })
    resolve(false)
  } else {
    resolve(true)
  }
}
</script>
```

**使用说明:**
- `beforePreview` 在预览文件前触发
- 可以根据文件状态判断是否允许预览
- 通过 `resolve(true/false)` 控制是否预览

参考: src/wd/components/wd-upload/wd-upload.vue:1549-1562

### buildFormData 自定义表单数据

在上传前构建自定义的表单数据。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :build-form-data="handleBuildFormData"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadBuildFormDataOption } from '@/wd'

const images = ref<string>('')

const handleBuildFormData = (option: UploadBuildFormDataOption) => {
  const { file, formData, resolve } = option

  // 添加自定义字段
  const customFormData = {
    ...formData,
    userId: '12345',
    bizType: 'product',
    category: 'image',
  }

  resolve(customFormData)
}
</script>
```

**使用说明:**
- `buildFormData` 在构建上传表单数据时触发
- 可以添加自定义字段到表单数据中
- 通过 `resolve(formData)` 返回最终的表单数据

参考: src/wd/components/wd-upload/wd-upload.vue:1242-1266

### 自定义上传方法

完全自定义上传逻辑。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :upload-method="customUpload"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadMethod, UploadFileItem } from '@/wd'

const images = ref<string>('')

const customUpload: UploadMethod = (uploadFile, formData, options) => {
  const { onSuccess, onError, onProgress } = options

  // 模拟上传
  const task = uni.uploadFile({
    url: 'https://your-api.com/upload',
    filePath: uploadFile.url,
    name: 'file',
    formData,
    success: (res) => {
      const data = JSON.parse(res.data)
      onSuccess(
        {
          url: data.url,
          ossId: data.ossId,
        },
        uploadFile,
        formData,
      )
    },
    fail: (err) => {
      onError(err, uploadFile, formData)
    },
  })

  // 监听上传进度
  task.onProgressUpdate((res) => {
    onProgress(res, uploadFile)
  })

  return task
}
</script>
```

**使用说明:**
- `uploadMethod` 完全自定义上传逻辑
- 必须调用 `onSuccess`、`onError`、`onProgress` 回调
- 可以使用自己的上传接口和逻辑
- 返回 `UploadTask` 以支持取消上传

参考: src/wd/components/wd-upload/wd-upload.vue:379-400, 1211-1288

### 表单集成

与表单系统完整集成,支持验证。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-upload
        v-model="formData.images"
        prop="images"
        label="商品图片"
        :limit="5"
      />

      <wd-upload
        v-model="formData.attachments"
        prop="attachments"
        label="附件"
        accept="file"
        :limit="10"
        return-mode="ossId"
      />

      <view class="form-actions">
        <wd-button type="primary" @click="handleSubmit">提交</wd-button>
        <wd-button @click="handleReset">重置</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const formData = ref({
  images: '',
  attachments: '',
})

const rules = {
  images: [
    { required: true, message: '请上传商品图片' },
    {
      validator: (value: string) => {
        const count = value.split(',').filter(Boolean).length
        return count >= 3
      },
      message: '至少上传3张图片',
    },
  ],
  attachments: [
    { required: true, message: '请上传附件' },
  ],
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单验证通过:', formData.value)
    }
  })
}

const handleReset = () => {
  formRef.value?.reset()
}
</script>

<style lang="scss" scoped>
.form-actions {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `prop` 指定表单字段名,用于验证
- 支持 `required` 必填验证
- 支持自定义 `validator` 函数
- 验证失败时自动显示错误提示

参考: src/wd/components/wd-upload/wd-upload.vue:722-895

### 表单布局模式

表单模式下支持水平/垂直两种布局。

```vue
<template>
  <view class="demo">
    <!-- 垂直布局(默认) -->
    <wd-upload
      v-model="images1"
      label="商品图片"
      form-layout="vertical"
      :limit="9"
    />

    <!-- 水平布局 -->
    <wd-upload
      v-model="images2"
      label="商品图片"
      form-layout="horizontal"
      :max-preview-in-horizontal="3"
      :limit="9"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images1 = ref<string>('')
const images2 = ref<string>('')
</script>
```

**使用说明:**
- `formLayout="vertical"` 垂直布局,预览列表在下方
- `formLayout="horizontal"` 水平布局,预览列表横向排列
- `maxPreviewInHorizontal` 水平布局时每行最大预览数量

参考: src/wd/components/wd-upload/wd-upload.vue:915-928

### 预览尺寸控制

控制预览图片/文件的显示尺寸。

```vue
<template>
  <view class="demo">
    <!-- 小尺寸 -->
    <wd-upload
      v-model="images1"
      label="小尺寸"
      preview-size="small"
    />

    <!-- 中尺寸(默认) -->
    <wd-upload
      v-model="images2"
      label="中尺寸"
      preview-size="medium"
    />

    <!-- 大尺寸 -->
    <wd-upload
      v-model="images3"
      label="大尺寸"
      preview-size="large"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images1 = ref<string>('')
const images2 = ref<string>('')
const images3 = ref<string>('')
</script>
```

**使用说明:**
- `previewSize="small"` 120rpx × 120rpx
- `previewSize="medium"` 160rpx × 160rpx (默认)
- `previewSize="large"` 210rpx × 210rpx

参考: src/wd/components/wd-upload/wd-upload.vue:859-865, 2020-2044

### 清空功能

显示清空按钮,一键清除所有文件。

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      :clearable="true"
      @clear="handleClear"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')

const handleClear = () => {
  console.log('已清空所有文件')
}
</script>
```

**使用说明:**
- `clearable="true"` 显示清空按钮
- 点击清空按钮会清除所有文件
- 触发 `clear` 事件

参考: src/wd/components/wd-upload/wd-upload.vue:1364-1369

### 自定义上传按钮

使用默认插槽自定义上传按钮样式。

```vue
<template>
  <view class="demo">
    <wd-upload v-model="images">
      <view class="custom-trigger">
        <wd-icon name="camera-fill" size="64" color="#1890ff" />
        <text class="custom-text">点击上传</text>
      </view>
    </wd-upload>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')
</script>

<style lang="scss" scoped>
.custom-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
}

.custom-text {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #fff;
}
</style>
```

**使用说明:**
- 使用默认插槽自定义上传按钮
- 可以完全自定义按钮样式和内容
- 保持原有的上传功能

参考: src/wd/components/wd-upload/wd-upload.vue:136-142

### 自定义预览覆盖层

使用 `preview-cover` 插槽自定义预览图上的覆盖层。

```vue
<template>
  <view class="demo">
    <wd-upload v-model="images">
      <template #preview-cover="{ file, index }">
        <view class="custom-cover">
          <view class="custom-badge">{{ index + 1 }}</view>
          <view class="custom-info">{{ file.name }}</view>
        </view>
      </template>
    </wd-upload>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')
</script>

<style lang="scss" scoped>
.custom-cover {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  padding: 16rpx;
}

.custom-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background: #1890ff;
  color: #fff;
  border-radius: 50%;
  font-size: 20rpx;
}

.custom-info {
  font-size: 20rpx;
  color: #fff;
}
</style>
```

**使用说明:**
- `preview-cover` 插槽提供 `file` 和 `index` 参数
- 可以显示自定义的标签、信息等
- 覆盖层会显示在预览图上方

参考: src/wd/components/wd-upload/wd-upload.vue:132

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值,支持数组和字符串 | `UploadFile[] \| string` | - |
| separator | 字符串模式下的分隔符 | `string` | `','` |
| value-key | 字符串模式下取文件对象的哪个字段 | `string` | `'url'` |
| return-mode | 返回值模式:'url'(返回URL) 或 'ossId'(返回OSS文件ID) | `'url' \| 'ossId'` | `'url'` |
| file-list | 文件列表(已废弃,使用 v-model) | `UploadFile[]` | `[]` |
| action | 上传的地址 | `string` | `'/resource/oss/upload'` |
| header | 上传请求头 | `Record<string, any>` | `{}` |
| disabled | 是否禁用 | `boolean` | `false` |
| name | 文件对应的key | `string` | `'file'` |
| form-data | 额外的表单数据 | `Record<string, any>` | `{}` |
| multiple | 是否支持多选 | `boolean` | `false` |
| limit | 最大上传数量 | `number` | - |
| show-limit-num | 是否显示当前上传数量 | `boolean` | `true` |
| max-size | 文件大小限制(byte) | `number` | `Number.MAX_VALUE` |
| source-type | 图片来源 | `('album' \| 'camera')[]` | `['album', 'camera']` |
| size-type | 图片尺寸 | `('original' \| 'compressed')[]` | `['original', 'compressed']` |
| accept | 文件类型 | `'image' \| 'video' \| 'media' \| 'audio' \| 'all' \| 'file'` | `'image'` |
| extension | 根据文件扩展名过滤 | `string[]` | `[]` |
| compressed | 是否压缩视频 | `boolean` | `true` |
| max-duration | 视频最长拍摄时间(秒) | `number` | `60` |
| camera | 使用前置或后置相机 | `'front' \| 'back'` | `'back'` |
| image-mode | 预览图片的mode属性 | `ImageMode` | `'aspectFit'` |
| loading-type | 加载中图标类型 | `LoadingType` | `'ring'` |
| loading-color | 加载中图标颜色 | `string` | `'#ffffff'` |
| loading-size | 加载中图标尺寸 | `string` | `'48rpx'` |
| status-key | status字段对应的key | `string` | `'status'` |
| success-status | 接口成功状态值 | `number` | `200` |
| auto-upload | 选择后自动上传 | `boolean` | `true` |
| reupload | 点击已上传时是否重新上传 | `boolean` | `false` |
| label | 左侧标题 | `string` | - |
| label-width | 标题宽度 | `string \| number` | `'240rpx'` |
| prefix-icon | 前置图标 | `string` | - |
| center | 标题和上传区域垂直居中 | `boolean` | `false` |
| vertical | 上下结构 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| prop | 表单字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| no-border | 是否隐藏下划线 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |
| form-layout | 表单模式下的布局 | `'horizontal' \| 'vertical'` | `'vertical'` |
| max-preview-in-horizontal | 水平布局时最大预览数 | `number` | `3` |
| preview-size | 预览尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| enable-direct-upload | 是否启用直传 | `boolean` | `false` |
| module-name | 模块名称 | `string` | - |
| directory-id | 目录ID | `string \| number` | - |
| directory-path | 目录路径 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-evoke-class | 自定义上传按钮样式类 | `string` | `''` |
| custom-preview-class | 自定义预览样式类 | `string` | `''` |
| custom-label-class | 自定义label样式类 | `string` | `''` |
| custom-icon-class | 自定义图标样式类 | `string` | `''` |
| on-preview-fail | 预览失败回调 | `UploadOnPreviewFail` | - |
| before-upload | 上传前钩子 | `UploadBeforeUpload` | - |
| before-choose | 选择前钩子 | `UploadBeforeChoose` | - |
| before-remove | 删除前钩子 | `UploadBeforeRemove` | - |
| before-preview | 预览前钩子 | `UploadBeforePreview` | - |
| build-form-data | 构建表单数据钩子 | `UploadBuildFormData` | - |
| upload-method | 自定义上传方法 | `UploadMethod` | - |

参考: src/wd/components/wd-upload/wd-upload.vue:440-581, 642-706

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model更新时触发 | `value: UploadFile[] \| string` |
| update:fileList | 文件列表更新时触发 | `value: UploadFileItem[]` |
| change | 文件列表变化时触发 | `{ fileList: UploadFileItem[] }` |
| success | 上传成功时触发 | `{ file: UploadFileItem, fileList: UploadFileItem[], formData: UploadFormData }` |
| fail | 上传失败时触发 | `{ error: UniApp.GeneralCallbackResult, file: UploadFileItem, formData: UploadFormData }` |
| progress | 上传进度变化时触发 | `{ response: UniApp.OnProgressUpdateResult, file: UploadFileItem }` |
| oversize | 文件超出大小时触发 | `{ file: ChooseFile }` |
| chooseerror | 选择文件错误时触发 | `{ error: any }` |
| remove | 删除文件时触发 | `{ file: UploadFileItem }` |
| clear | 清空文件时触发 | - |
| field-change | 字段值变化时触发(用于表单验证) | `value: UploadFileItem[]` |

参考: src/wd/components/wd-upload/wd-upload.vue:588-611

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 自定义上传按钮 | - |
| label | 自定义标题 | - |
| prefix | 自定义前置图标 | - |
| preview-cover | 自定义预览覆盖层 | `{ file: UploadFileItem, index: number }` |

参考: src/wd/components/wd-upload/wd-upload.vue:28-43, 132, 136-142

### Methods

通过 ref 可以获取到 Upload 实例并调用实例方法。

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| submit | 手动触发上传 | - | - |
| abort | 取消上传 | `task?: UniApp.UploadTask` | - |
| clear | 清空所有文件 | - | - |
| getValue | 获取当前文件列表 | - | `UploadFileItem[]` |
| setValue | 设置文件列表 | `files: UploadFileItem[]` | - |
| getModelValue | 获取当前值 | - | `UploadFile[] \| string` |
| setModelValue | 设置当前值 | `value: UploadFile[] \| string` | - |
| validate | 手动触发验证 | - | `Promise<boolean>` |
| clearValidate | 清除验证状态 | - | - |

```vue
<template>
  <view class="demo">
    <wd-upload
      ref="uploadRef"
      v-model="images"
      :auto-upload="false"
    />
    <view class="actions">
      <wd-button @click="handleSubmit">手动上传</wd-button>
      <wd-button @click="handleClear">清空</wd-button>
      <wd-button @click="handleGetValue">获取值</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadInstance } from '@/wd'

const uploadRef = ref<UploadInstance>()
const images = ref<string>('')

// 手动上传
const handleSubmit = () => {
  uploadRef.value?.submit()
}

// 清空文件
const handleClear = () => {
  uploadRef.value?.clear()
}

// 获取值
const handleGetValue = () => {
  const files = uploadRef.value?.getValue()
  console.log('文件列表:', files)

  const modelValue = uploadRef.value?.getModelValue()
  console.log('当前值:', modelValue)
}
</script>
```

参考: src/wd/components/wd-upload/wd-upload.vue:618-637, 1796-1845

### 类型定义

```typescript
/**
 * 文件类型
 */
export type UploadFileType = 'image' | 'video' | 'media' | 'audio' | 'all' | 'file'
export type UploadStatusType = 'pending' | 'loading' | 'success' | 'fail'

/**
 * 上传文件项接口
 */
export interface UploadFileItem {
  /** 唯一标识 */
  uid: number
  /** 缩略图地址 */
  thumb?: string
  /** 文件名称 */
  name?: string
  /** 上传状态 */
  status?: UploadStatusType
  /** 文件大小 */
  size?: number
  /** 文件地址 */
  url: string
  /** 上传进度 */
  percent?: number
  /** 后端响应 */
  response?: string | Record<string, any>
  /** OSS文件ID */
  ossId?: string | number
  /** 错误信息 */
  error?: string
}

/**
 * 上传文件类型
 */
export type UploadFile = Partial<UploadFileItem> & { url: string }

/**
 * beforeUpload 钩子选项
 */
interface UploadBeforeUploadOption {
  files: Record<string, any>[]
  fileList: UploadFileItem[]
  resolve: (isPass: boolean) => void
}

export type UploadBeforeUpload = (options: UploadBeforeUploadOption) => void

/**
 * beforeChoose 钩子选项
 */
interface UploadBeforeChooseOption {
  fileList: UploadFileItem[]
  resolve: (isPass: boolean) => void
}

export type UploadBeforeChoose = (option: UploadBeforeChooseOption) => void

/**
 * beforeRemove 钩子选项
 */
interface UploadBeforeRemoveOption {
  file: UploadFileItem
  index: number
  fileList: UploadFileItem[]
  resolve: (isPass: boolean) => void
}

export type UploadBeforeRemove = (option: UploadBeforeRemoveOption) => void

/**
 * beforePreview 钩子选项
 */
interface UploadBeforePreviewOption {
  file: UploadFileItem
  index: number
  imgList: string[]
  fileList: UploadFileItem[]
  resolve: (isPass: boolean) => void
}

export type UploadBeforePreview = (option: UploadBeforePreviewOption) => void

/**
 * buildFormData 钩子选项
 */
interface UploadBuildFormDataOption {
  file: UploadFileItem
  formData: UploadFormData
  resolve: (formData: Record<string, any>) => void
}

export type UploadBuildFormData = (options: UploadBuildFormDataOption) => void

/**
 * 自定义上传方法类型
 */
export type UploadMethod = (
  uploadFile: UploadFileItem,
  formData: UploadFormData,
  options: {
    action: string
    header: Record<string, any>
    name: string
    fileName: string
    fileType: 'image' | 'video' | 'audio'
    statusCode: number
    abortPrevious?: boolean
    enableDirectUpload?: boolean
    onSuccess: (res: UploadResult, file: UploadFileItem, formData: UploadFormData) => void
    onError: (error: UniApp.GeneralCallbackResult, file: UploadFileItem, formData: UploadFormData) => void
    onProgress: (res: UniApp.OnProgressUpdateResult, file: UploadFileItem) => void
  },
) => UniApp.UploadTask | void | Promise<void>

/**
 * 上传组件实例类型
 */
export type UploadInstance = ComponentPublicInstance<WdUploadProps, WdUploadExpose>
```

参考: src/wd/components/wd-upload/wd-upload.vue:218-400, 1848

## 主题定制

### CSS 变量

Upload 组件提供了以下 CSS 变量用于主题定制:

```scss
// 唤起按钮
--wd-upload-size: 160rpx;
--wd-upload-evoke-bg: #f4f4f5;
--wd-upload-evoke-color: #c8c9cc;
--wd-upload-evoke-disabled-color: #dcdee0;
--wd-upload-evoke-icon-size: 64rpx;

// 关闭按钮
--wd-upload-close-icon-size: 32rpx;
--wd-upload-close-icon-color: #c8c9cc;

// 文件信息
--wd-upload-file-fs: 24rpx;
--wd-upload-file-color: #999;

// 进度信息
--wd-upload-progress-fs: 24rpx;

// 预览遮罩
--wd-upload-preview-name-bg: rgba(0, 0, 0, 0.6);

// 覆盖层图标
--wd-upload-cover-icon-size: 64rpx;
```

参考: src/wd/components/wd-upload/wd-upload.vue:1851-2236

### 暗黑模式

Upload 组件支持暗黑模式,在 `wot-theme-dark` 类下自动应用暗色主题:

```vue
<template>
  <wd-config-provider theme="dark">
    <wd-upload v-model="images" />
  </wd-config-provider>
</template>
```

**暗黑模式变量:**

```scss
.wot-theme-dark {
  .wd-upload {
    --wd-upload-bg: var(--wd-dark-background2);
    --wd-upload-label-color: var(--wd-dark-color);
    --wd-upload-evoke-bg: var(--wd-dark-background4);
    --wd-upload-evoke-color: var(--wd-dark-color3);
    --wd-upload-evoke-disabled-color: var(--wd-dark-color-gray);
    --wd-upload-file-bg: var(--wd-dark-background4);
    --wd-upload-file-name-color: var(--wd-dark-color3);
  }
}
```

参考: src/wd/components/wd-upload/wd-upload.vue:1857-1886

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <wd-upload
      v-model="images"
      custom-class="custom-theme-upload"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')
</script>

<style lang="scss">
.custom-theme-upload {
  // 修改唤起按钮样式
  --wd-upload-evoke-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --wd-upload-evoke-color: #ffffff;

  // 修改预览尺寸
  --wd-upload-size: 180rpx;

  // 修改关闭按钮颜色
  --wd-upload-close-icon-color: #f56c6c;
}
</style>
```

## 最佳实践

### 1. 合理选择返回模式

根据业务场景选择合适的返回模式:

**URL 模式 - 适用场景:**

```vue
<script lang="ts" setup>
// ✅ 推荐:简单展示场景,不需要文件详细信息
const avatar = ref<string>('https://example.com/avatar.jpg')

// 适用于:
// - 头像上传
// - 商品主图
// - 临时文件
</script>
```

**ossId 模式 - 适用场景:**

```vue
<script lang="ts" setup>
// ✅ 推荐:需要关联文件记录的场景
const attachments = ref<string>('123,456,789')

// 适用于:
// - 附件管理
// - 需要文件元数据的场景
// - 需要文件权限控制
// - 需要文件统计分析
</script>
```

### 2. 钩子函数的正确使用

各个钩子函数的使用时机:

```vue
<script lang="ts" setup>
// ✅ beforeChoose: 限制选择次数、权限检查
const handleBeforeChoose = ({ fileList, resolve }) => {
  if (fileList.length >= 9) {
    uni.showToast({ title: '最多9张', icon: 'none' })
    resolve(false)
  } else {
    resolve(true)
  }
}

// ✅ beforeUpload: 文件类型、内容校验
const handleBeforeUpload = ({ files, resolve }) => {
  const valid = files.every(file => file.size < 5 * 1024 * 1024)
  if (!valid) {
    uni.showToast({ title: '文件过大', icon: 'none' })
    resolve(false)
  } else {
    resolve(true)
  }
}

// ✅ buildFormData: 添加业务字段
const handleBuildFormData = ({ file, formData, resolve }) => {
  resolve({
    ...formData,
    bizType: 'product',
    categoryId: '123',
  })
}

// ✅ beforeRemove: 删除确认
const handleBeforeRemove = ({ file, resolve }) => {
  uni.showModal({
    title: '确认删除',
    content: `确定删除 ${file.name}?`,
    success: (res) => resolve(res.confirm),
  })
}

// ✅ beforePreview: 预览权限检查
const handleBeforePreview = ({ file, resolve }) => {
  if (file.status !== 'success') {
    uni.showToast({ title: '上传中无法预览', icon: 'none' })
    resolve(false)
  } else {
    resolve(true)
  }
}
</script>
```

### 3. 文件大小和数量限制

合理设置文件大小和数量限制:

```vue
<template>
  <!-- ✅ 推荐:明确的限制 -->
  <wd-upload
    v-model="images"
    :limit="9"
    :max-size="10 * 1024 * 1024"
    @oversize="handleOversize"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')

// 超出大小时给出明确提示
const handleOversize = ({ file }) => {
  uni.showToast({
    title: `${file.name} 超过10MB限制`,
    icon: 'none',
  })
}
</script>
```

### 4. 表单验证的最佳配置

在表单中使用时的验证配置:

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <wd-upload
      v-model="formData.images"
      prop="images"
      label="商品图片"
      :limit="9"
    />
  </wd-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  images: '',
})

// ✅ 推荐:完整的验证规则
const rules = {
  images: [
    {
      required: true,
      message: '请上传商品图片',
    },
    {
      validator: (value: string) => {
        const count = value.split(',').filter(Boolean).length
        return count >= 3 && count <= 9
      },
      message: '请上传3-9张图片',
    },
    {
      validator: (value: string) => {
        // 检查是否全部上传成功
        const urls = value.split(',').filter(Boolean)
        return urls.length > 0 && urls.every(url => url.startsWith('http'))
      },
      message: '部分图片上传失败,请重试',
    },
  ],
}
</script>
```

### 5. 直传模式的使用建议

直传模式的配置和使用:

```vue
<template>
  <!-- ✅ 推荐:大文件或高并发场景使用直传 -->
  <wd-upload
    v-model="files"
    :enable-direct-upload="true"
    module-name="product"
    directory-id="123"
    accept="video"
    :max-size="100 * 1024 * 1024"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const files = ref<string>('')

// 适用场景:
// ✅ 视频文件上传(文件较大)
// ✅ 高并发上传场景
// ✅ 需要减轻服务器压力
// ❌ 小图片(额外的签名请求开销)
</script>
```

## 常见问题

### 1. 为什么上传后 v-model 没有更新?

**问题原因:**
- 上传失败但未正确处理
- 后端返回格式不正确
- 使用了 `autoUpload="false"` 但未手动触发上传

**解决方案:**

```vue
<template>
  <!-- ✅ 正确:监听上传状态 -->
  <wd-upload
    v-model="images"
    @success="handleSuccess"
    @fail="handleFail"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')

const handleSuccess = ({ file, fileList }) => {
  console.log('上传成功:', file)
  console.log('当前列表:', fileList)
}

const handleFail = ({ error, file }) => {
  console.error('上传失败:', error, file)
  uni.showToast({
    title: `上传失败: ${error.errMsg}`,
    icon: 'none',
  })
}
</script>
```

参考: src/wd/components/wd-upload/wd-upload.vue:1110-1128, 1165-1193

### 2. 如何实现图片压缩?

**问题原因:**
- 图片文件过大,上传慢
- 需要节省服务器存储空间

**解决方案:**

```vue
<template>
  <wd-upload
    v-model="images"
    :size-type="['compressed']"
    :before-upload="handleBeforeUpload"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const images = ref<string>('')

// 进一步压缩或验证
const handleBeforeUpload = ({ files, resolve }) => {
  // 这里可以使用第三方库进一步压缩
  // 或者根据尺寸/大小进行筛选
  resolve(true)
}
</script>
```

参考: src/wd/components/wd-upload/wd-upload.vue:667

### 3. 如何实现拖拽排序?

**问题原因:**
- 需要调整已上传文件的顺序

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-upload v-model="fileList" />
    <view class="file-list">
      <view
        v-for="(file, index) in parsedFileList"
        :key="file.uid"
        class="file-item"
      >
        <image :src="file.url" class="file-img" />
        <view class="file-actions">
          <wd-button
            v-if="index > 0"
            size="small"
            @click="moveUp(index)"
          >
            上移
          </wd-button>
          <wd-button
            v-if="index < parsedFileList.length - 1"
            size="small"
            @click="moveDown(index)"
          >
            下移
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { UploadFile } from '@/wd'

const fileList = ref<UploadFile[]>([])

const parsedFileList = computed(() => {
  return Array.isArray(fileList.value) ? fileList.value : []
})

const moveUp = (index: number) => {
  const list = [...parsedFileList.value]
  ;[list[index], list[index - 1]] = [list[index - 1], list[index]]
  fileList.value = list
}

const moveDown = (index: number) => {
  const list = [...parsedFileList.value]
  ;[list[index], list[index + 1]] = [list[index + 1], list[index]]
  fileList.value = list
}
</script>
```

参考: src/wd/components/wd-upload/wd-upload.vue:1655-1670

### 4. 如何实现自定义文件名?

**问题原因:**
- 需要按照特定规则命名文件

**解决方案:**

```vue
<template>
  <wd-upload
    v-model="images"
    :build-form-data="handleBuildFormData"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadBuildFormDataOption } from '@/wd'
import dayjs from 'dayjs'

const images = ref<string>('')

const handleBuildFormData = (option: UploadBuildFormDataOption) => {
  const { file, formData, resolve } = option

  // 生成自定义文件名
  const timestamp = dayjs().format('YYYYMMDDHHmmss')
  const extension = file.name?.split('.').pop() || 'jpg'
  const customFileName = `product_${timestamp}_${file.uid}.${extension}`

  resolve({
    ...formData,
    fileName: customFileName,
  })
}
</script>
```

参考: src/wd/components/wd-upload/wd-upload.vue:1242-1266

### 5. 如何实现断点续传?

**问题原因:**
- 大文件上传中断后需要从断点继续

**解决方案:**

```vue
<template>
  <wd-upload
    v-model="files"
    :upload-method="customUpload"
    accept="video"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadMethod } from '@/wd'

const files = ref<string>('')

// 存储上传任务
const uploadTasks = new Map<number, UniApp.UploadTask>()

const customUpload: UploadMethod = (uploadFile, formData, options) => {
  const { onSuccess, onError, onProgress } = options

  // 检查是否有未完成的上传任务
  const savedProgress = localStorage.getItem(`upload_${uploadFile.uid}`)
  const startByte = savedProgress ? parseInt(savedProgress) : 0

  // 实现分片上传逻辑
  // 这里简化示例,实际需要后端支持
  const task = uni.uploadFile({
    url: options.action,
    filePath: uploadFile.url,
    name: options.name,
    formData: {
      ...formData,
      startByte, // 从断点开始
    },
    success: (res) => {
      localStorage.removeItem(`upload_${uploadFile.uid}`)
      const data = JSON.parse(res.data)
      onSuccess(data, uploadFile, formData)
    },
    fail: (err) => {
      onError(err, uploadFile, formData)
    },
  })

  task.onProgressUpdate((res) => {
    // 保存进度
    localStorage.setItem(`upload_${uploadFile.uid}`, String(res.totalBytesSent))
    onProgress(res, uploadFile)
  })

  uploadTasks.set(uploadFile.uid, task)
  return task
}
</script>
```

参考: src/wd/components/wd-upload/wd-upload.vue:379-400, 1211-1288

## 注意事项

### 1. v-model 数据格式

- v-model 支持两种格式:**数组**和**字符串**
- 字符串格式使用 `separator` 分隔,默认为逗号
- 数组格式包含完整的文件信息
- 只有上传成功的文件才会更新到 v-model

参考: src/wd/components/wd-upload/wd-upload.vue:1110-1128

### 2. returnMode 模式说明

- `returnMode="url"` 返回文件 URL 地址(默认)
- `returnMode="ossId"` 返回 OSS 文件 ID
- ossId 模式兼容旧的 URL 数据,自动识别格式
- ossId 模式会调用接口获取文件详细信息

参考: src/wd/components/wd-upload/wd-upload.vue:942-1059

### 3. 文件类型限制

- `accept="image"` 只能选择图片
- `accept="video"` 只能选择视频
- `accept="audio"` 只能选择音频
- `accept="file"` 选择文档文件
- `accept="media"` 同时支持图片和视频
- `accept="all"` 不限制类型

参考: src/wd/components/wd-upload/wd-upload.vue:754-803

### 4. 钩子函数调用时机

- `beforeChoose`: 打开文件选择器**之前**
- `beforeUpload`: 文件选择完成,开始上传**之前**
- `buildFormData`: 构建上传表单数据时
- `beforeRemove`: 删除文件**之前**
- `beforePreview`: 预览文件**之前**
- 所有钩子必须调用 `resolve()` 才能继续流程

参考: src/wd/components/wd-upload/wd-upload.vue:307-374

### 5. 上传状态说明

- `pending`: 待上传(已选择但未上传)
- `loading`: 上传中
- `success`: 上传成功
- `fail`: 上传失败
- 可以通过 `statusKey` 自定义状态字段名

参考: src/wd/components/wd-upload/wd-upload.vue:227

### 6. 文件预览支持

- 图片: 使用 `uni.previewImage` 原生预览
- 视频: 微信小程序使用 `uni.previewMedia`,其他平台使用自定义播放器
- 文档: 使用 `uni.openDocument` 打开(需要下载到本地)
- 自定义预览: 使用 `beforePreview` 钩子

参考: src/wd/components/wd-upload/wd-upload.vue:1466-1621

### 7. 表单集成注意事项

- 必须设置 `prop` 属性才能进行表单验证
- 验证失败时自动显示错误提示
- 支持 `required` 和自定义 `validator`
- 表单重置时会清空文件列表

参考: src/wd/components/wd-upload/wd-upload.vue:722-895

### 8. 直传模式注意事项

- 直传模式需要后端支持 OSS 签名接口
- 适用于大文件或高并发场景
- 小文件使用直传会增加签名请求开销
- `moduleName`、`directoryId`、`directoryPath` 用于文件分类

参考: src/wd/components/wd-upload/wd-upload.vue:1211-1288

### 9. 性能优化建议

- 图片上传使用 `sizeType="['compressed']"` 压缩
- 视频上传设置 `compressed="true"`
- 大文件使用直传模式
- 设置合理的 `limit` 限制上传数量
- 使用 `maxSize` 限制文件大小

参考: src/wd/components/wd-upload/wd-upload.vue:667, 672

### 10. 自定义上传方法注意事项

- 必须返回 `UniApp.UploadTask` 以支持取消上传
- 必须调用 `onSuccess`、`onError`、`onProgress` 回调
- `onSuccess` 的响应数据必须包含 `url` 字段
- ossId 模式下响应数据应包含 `ossId` 字段

参考: src/wd/components/wd-upload/wd-upload.vue:379-400

### 11. 事件处理说明

- `change`: 文件列表任何变化都会触发(添加、删除、状态变化)
- `success`: 单个文件上传成功时触发
- `fail`: 单个文件上传失败时触发
- `progress`: 上传进度变化时触发
- `field-change`: 用于表单验证,在文件列表变化时触发

参考: src/wd/components/wd-upload/wd-upload.vue:588-611

### 12. 样式定制建议

- 优先使用 CSS 变量进行主题定制
- 使用 `custom-class`、`custom-evoke-class`、`custom-preview-class` 添加自定义样式
- 需要穿透组件样式时使用 `:deep()` 选择器
- 预览尺寸通过 `previewSize` 控制,支持 small/medium/large

参考: src/wd/components/wd-upload/wd-upload.vue:1851-2236
