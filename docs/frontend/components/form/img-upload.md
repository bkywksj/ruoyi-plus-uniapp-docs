# AFormImgUpload 图片上传

## 介绍

AFormImgUpload 是一个功能强大且灵活的图片上传组件，基于 Element Plus 的 Upload 组件进行深度封装。该组件专为企业级应用设计，提供了图片压缩、云端直传、素材库集成、预签名URL处理等高级功能，能够满足各种复杂的图片上传场景需求。

**核心特性：**

- **智能上传模式** - 支持传统服务器中转上传和云端直传两种模式，云端直传可显著减少服务器压力
- **图片压缩处理** - 基于 image-conversion 库实现客户端图片压缩，自动压缩超过指定大小的图片
- **素材库集成** - 内置素材库选择功能，支持从已上传的文件中直接选择，提高重复使用效率
- **多种返回模式** - 支持返回URL地址或OSS文件ID，灵活适配不同的后端存储需求
- **预签名URL支持** - 自动处理私有存储桶的预签名URL，兼容AWS S3、阿里云OSS、腾讯云COS等主流云存储
- **响应式布局** - 支持栅格布局和响应式配置，适配各种屏幕尺寸和弹窗场景
- **表单深度集成** - 与 Element Plus Form 组件深度集成，支持表单验证和数据绑定
- **多尺寸卡片** - 提供 small/medium/large 三种卡片尺寸，适配表格、表单等不同场景
- **拖拽上传** - 支持拖拽文件到上传区域进行上传
- **批量操作** - 支持多选上传和批量清空功能

---

## 基础用法

### 单图上传

最基础的使用场景，用于上传单张图片，如用户头像、封面图等。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormImgUpload
      label="头像"
      v-model="form.avatar"
      prop="avatar"
      :limit="1"
      :span="12"
    />
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  avatar: ''
})
</script>
```

**使用说明：**
- `v-model` 绑定图片URL字符串
- `limit="1"` 限制只能上传一张图片
- `prop` 对应表单验证的字段名
- `span` 设置栅格布局的列宽

### 多图上传

支持上传多张图片，适用于商品相册、证件上传等场景。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormImgUpload
      label="商品图片"
      v-model="form.images"
      prop="images"
      :limit="9"
      :span="24"
    />
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  images: '' // 多图URL以逗号分隔存储
})
</script>
```

**使用说明：**
- 多图模式下，`v-model` 的值为逗号分隔的URL字符串
- `limit` 设置最大上传数量
- 达到上传限制后，上传按钮会自动隐藏

### 无表单项模式

在非表单场景下使用，如表格内嵌编辑、独立使用等。

```vue
<template>
  <div class="upload-demo">
    <AFormImgUpload
      v-model="imageUrl"
      :show-form-item="false"
      :limit="1"
      size="small"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const imageUrl = ref('')
</script>
```

**使用说明：**
- `show-form-item="false"` 移除外层的 el-form-item 包装
- `size="small"` 使用小尺寸卡片，适合表格场景
- 此模式下不需要 label 和 prop 属性

---

## 上传模式

### 传统上传模式

默认模式，图片先上传到服务器，由服务器转存到存储服务。

```vue
<template>
  <AFormImgUpload
    label="产品图片"
    v-model="form.productImg"
    prop="productImg"
    :span="12"
  />
</template>
```

**技术实现：**
- 图片通过服务器 `/resource/oss/upload` 接口上传
- 服务器接收文件后转存到配置的存储服务
- 适合小型项目或对上传速度要求不高的场景

### 直传模式

启用直传模式后，图片直接上传到云存储服务，减少服务器带宽消耗。

```vue
<template>
  <AFormImgUpload
    label="宣传图"
    v-model="form.bannerImg"
    prop="bannerImg"
    :enable-direct-upload="true"
    module-name="promotion"
    :span="12"
  />
</template>
```

**使用说明：**
- `enable-direct-upload="true"` 启用直传模式
- `module-name` 指定存储模块名称，用于控制物理存储路径
- 组件会自动判断存储类型并选择合适的上传方式

**直传流程：**
1. 客户端请求预签名URL
2. 服务器返回预签名URL和文件密钥
3. 客户端直接将文件上传到云存储
4. 上传完成后通知服务器确认

**支持的云存储：**
- AWS S3 及兼容存储（MinIO等）
- 阿里云 OSS
- 腾讯云 COS
- 七牛云
- 华为云 OBS

### 存储路径控制

可以通过多个参数控制文件的存储位置。

```vue
<template>
  <AFormImgUpload
    label="产品图片"
    v-model="form.productImg"
    prop="productImg"
    module-name="product"
    directory-path="/图片/商品"
    :directory-id="456"
    :span="12"
  />
</template>
```

**参数说明：**
- `module-name` - 模块名称，用于控制物理存储路径
- `directory-path` - 目录路径，用于逻辑分类
- `directory-id` - 目录ID，用于关联素材库目录

---

## 图片压缩

### 启用压缩

自动压缩大图片以优化上传速度和存储空间。

```vue
<template>
  <AFormImgUpload
    label="高清图片"
    v-model="form.hdImage"
    prop="hdImage"
    :compress-support="true"
    :compress-target-size="500"
    :span="12"
  />
</template>
```

**使用说明：**
- `compress-support="true"` 启用图片压缩
- `compress-target-size` 设置压缩目标大小（KB），超过此大小的图片将被压缩
- 压缩基于 `image-conversion` 库实现

**压缩策略：**
- 只对超过目标大小的图片进行压缩
- 保持图片质量的同时减小文件体积
- 压缩失败时会提示错误并阻止上传

### 压缩配合直传

在直传模式下同时启用压缩，可以获得最佳的上传体验。

```vue
<template>
  <AFormImgUpload
    label="高清宣传图"
    v-model="form.bannerHd"
    prop="bannerHd"
    :enable-direct-upload="true"
    :compress-support="true"
    :compress-target-size="300"
    :span="12"
  />
</template>
```

**工作流程：**
1. 检查图片大小，超过阈值则进行压缩
2. 获取云存储预签名URL
3. 压缩后的图片直传到云存储
4. 上传完成后确认文件信息

---

## 文件限制

### 类型限制

限制可上传的图片格式。

```vue
<template>
  <AFormImgUpload
    label="封面图"
    v-model="form.cover"
    prop="cover"
    :file-type="['jpg', 'png', 'webp']"
    :span="12"
  />
</template>
```

**默认支持格式：** `['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']`

### 大小限制

限制上传图片的最大文件大小。

```vue
<template>
  <AFormImgUpload
    label="图片"
    v-model="form.image"
    prop="image"
    :file-size="10"
    :span="12"
  />
</template>
```

**使用说明：**
- `file-size` 单位为 MB
- 默认限制为 5MB
- 超过限制时会显示错误提示

### 数量限制

限制可上传的图片数量。

```vue
<template>
  <AFormImgUpload
    label="相册"
    v-model="form.gallery"
    prop="gallery"
    :limit="20"
    :span="24"
  />
</template>
```

**使用说明：**
- `limit` 设置最大上传数量
- 达到限制后上传按钮自动隐藏
- 超出限制时会触发 `exceed` 事件

### 组合限制

同时应用多种限制条件。

```vue
<template>
  <AFormImgUpload
    label="身份证照片"
    v-model="form.idCards"
    prop="idCards"
    :file-type="['jpg', 'png']"
    :file-size="5"
    :limit="2"
    tooltip="请上传清晰的身份证正反面照片"
    :span="12"
  />
</template>
```

---

## 拖拽上传

### 基础拖拽

启用拖拽上传功能。

```vue
<template>
  <AFormImgUpload
    label="批量图片"
    v-model="form.batchImages"
    prop="batchImages"
    :drag="true"
    :limit="20"
    :span="24"
  />
</template>
```

**使用说明：**
- `drag="true"` 启用拖拽模式
- 拖拽模式会显示大的拖拽区域
- 支持拖拽多个文件

### 拖拽配合多选

拖拽模式下配合多选功能。

```vue
<template>
  <AFormImgUpload
    label="批量上传"
    v-model="form.images"
    prop="images"
    :drag="true"
    :multiple="true"
    :limit="50"
    :compress-support="true"
    :compress-target-size="200"
    :span="24"
  />
</template>
```

---

## 素材库集成

### 启用素材库

从已上传的文件中选择图片。

```vue
<template>
  <AFormImgUpload
    label="背景图"
    v-model="form.background"
    prop="background"
    :enable-oss-media-manager="true"
    :span="12"
  />
</template>
```

**使用说明：**
- `enable-oss-media-manager="true"` 启用素材库功能
- 点击"从素材库选择"按钮打开素材库对话框
- 支持单选和多选模式

### 素材库多选

在多图模式下使用素材库。

```vue
<template>
  <AFormImgUpload
    label="商品图片集"
    v-model="form.productGallery"
    prop="productGallery"
    :enable-oss-media-manager="true"
    :limit="9"
    :span="24"
  />
</template>
```

**使用说明：**
- 当 `limit > 1` 时，素材库自动启用多选模式
- 选择的图片会追加到现有列表
- 不会超出 `limit` 限制

---

## 返回值模式

### URL模式（默认）

返回图片的URL地址。

```vue
<template>
  <AFormImgUpload
    label="宣传图"
    v-model="form.bannerImages"
    prop="bannerImages"
    return-mode="url"
    :limit="3"
    :span="12"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  bannerImages: '' // 例如: "https://xxx.com/a.jpg,https://xxx.com/b.jpg"
})
</script>
```

### OSS ID模式

返回OSS文件ID，适合需要关联文件管理的场景。

```vue
<template>
  <AFormImgUpload
    label="产品图片"
    v-model="form.productImages"
    prop="productImages"
    return-mode="ossId"
    :limit="5"
    :span="12"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  productImages: '' // 例如: "1234567890,1234567891"
})
</script>
```

**使用说明：**
- `return-mode="ossId"` 返回文件的OSS ID
- 数据回显时会自动通过ID查询文件信息
- 兼容旧数据（如果数据是URL格式则继续使用URL）

---

## 卡片尺寸

### 三种尺寸

组件提供三种卡片尺寸以适配不同场景。

```vue
<template>
  <div class="size-demo">
    <!-- 小尺寸 - 适合表格 -->
    <AFormImgUpload
      v-model="form.smallImg"
      :show-form-item="false"
      size="small"
      :limit="1"
    />

    <!-- 中等尺寸 -->
    <AFormImgUpload
      label="中等尺寸"
      v-model="form.mediumImg"
      prop="mediumImg"
      size="medium"
      :limit="3"
      :span="12"
    />

    <!-- 大尺寸（默认）-->
    <AFormImgUpload
      label="大尺寸"
      v-model="form.largeImg"
      prop="largeImg"
      size="large"
      :limit="5"
      :span="24"
    />
  </div>
</template>
```

**尺寸对照：**

| 尺寸 | 像素大小 | 适用场景 |
|------|----------|----------|
| small | 60x60px | 表格内嵌、紧凑布局 |
| medium | 100x100px | 普通表单、侧边栏 |
| large | 148x148px | 大表单、详情页 |

---

## 替换模式

### 图片替换

启用替换模式后，上传新图片会替换指定的旧图片。

```vue
<template>
  <AFormImgUpload
    label="Logo"
    v-model="form.logo"
    prop="logo"
    :upload-params="{ isReplace: true, replaceOssId: currentLogoOssId }"
    :limit="1"
    :span="12"
  />
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const currentLogoOssId = ref(123) // 要替换的文件ID

const form = reactive({
  logo: ''
})
</script>
```

**使用说明：**
- 通过 `uploadParams` 传递替换参数
- `isReplace: true` 启用替换模式
- `replaceOssId` 指定要替换的文件ID
- 替换模式下素材库和清空按钮会自动隐藏

---

## 响应式布局

### 基础响应式

使用 `span` 属性设置栅格列宽。

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <AFormImgUpload
        label="图片1"
        v-model="form.img1"
        prop="img1"
        :span="12"
      />
      <AFormImgUpload
        label="图片2"
        v-model="form.img2"
        prop="img2"
        :span="12"
      />
    </el-row>
  </el-form>
</template>
```

### 自动响应式

使用 `span="auto"` 实现自动响应式布局。

```vue
<template>
  <el-form :model="form">
    <AFormImgUpload
      label="图片"
      v-model="form.image"
      prop="image"
      span="auto"
    />
  </el-form>
</template>
```

### 弹窗场景

在弹窗中使用时，可以配置响应式模式。

```vue
<template>
  <AModal v-model="visible" title="编辑信息" size="large">
    <el-form :model="form">
      <AFormImgUpload
        label="图片"
        v-model="form.image"
        prop="image"
        responsive-mode="modal-size"
        modal-size="large"
        span="auto"
      />
    </el-form>
  </AModal>
</template>
```

**响应式模式：**
- `screen` - 基于屏幕尺寸（默认）
- `container` - 基于容器尺寸
- `modal-size` - 基于弹窗的 size 属性

---

## 清空功能

### 清空全部

启用清空全部功能（默认开启）。

```vue
<template>
  <AFormImgUpload
    label="相册"
    v-model="form.gallery"
    prop="gallery"
    :enable-clear-all="true"
    :limit="20"
    :span="24"
  />
</template>
```

**使用说明：**
- 当图片数量大于1时显示"清空全部"按钮
- 会分别处理云端文件（调用删除接口）和本地文件
- 删除前会弹出确认对话框

### 禁用清空

在某些场景下可以禁用清空功能。

```vue
<template>
  <AFormImgUpload
    label="必填图片"
    v-model="form.requiredImages"
    prop="requiredImages"
    :enable-clear-all="false"
    :limit="3"
    :span="12"
  />
</template>
```

---

## 提示信息

### 上传提示

显示文件限制提示信息。

```vue
<template>
  <AFormImgUpload
    label="图片"
    v-model="form.image"
    prop="image"
    :is-show-tip="true"
    :file-type="['jpg', 'png']"
    :file-size="5"
    :limit="3"
    :span="12"
  />
</template>
```

**提示内容包括：**
- 文件大小限制
- 允许的文件格式
- 最大上传数量
- 压缩阈值（如启用压缩）
- 直传模式标识

### 工具提示

添加额外的说明信息。

```vue
<template>
  <AFormImgUpload
    label="营业执照"
    v-model="form.license"
    prop="license"
    tooltip="请上传清晰的营业执照照片，支持 JPG、PNG 格式"
    :file-type="['jpg', 'png']"
    :file-size="10"
    :limit="1"
    :span="12"
  />
</template>
```

---

## 事件处理

### 监听上传事件

```vue
<template>
  <AFormImgUpload
    label="图片"
    v-model="form.image"
    prop="image"
    @success="handleUploadSuccess"
    @error="handleUploadError"
    @progress="handleUploadProgress"
    @exceed="handleExceed"
    @change="handleChange"
    :span="12"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  image: ''
})

// 上传成功
const handleUploadSuccess = (response: any, file: any, newFile: any) => {
  console.log('上传成功:', newFile)
}

// 上传失败
const handleUploadError = (error: string, file: any) => {
  console.error('上传失败:', error)
}

// 上传进度
const handleUploadProgress = (event: any, file: any, fileList: any[]) => {
  console.log('上传进度:', event.percent)
}

// 超出数量限制
const handleExceed = () => {
  console.warn('超出上传数量限制')
}

// 值变化
const handleChange = (value: string) => {
  console.log('值变化:', value)
}
</script>
```

---

## 实际应用场景

### 商品管理

在商城系统中管理商品图片。

```vue
<template>
  <el-form :model="goodsForm" :rules="goodsRules" ref="formRef" label-width="100px">
    <el-row :gutter="20">
      <!-- 商品主图 -->
      <AFormImgUpload
        label="商品主图"
        v-model="goodsForm.mainImage"
        prop="mainImage"
        :limit="1"
        :enable-oss-media-manager="true"
        tooltip="建议尺寸 800x800，支持 JPG、PNG 格式"
        span="auto"
      />

      <!-- 商品图片集 -->
      <AFormImgUpload
        label="商品图片集"
        v-model="goodsForm.images"
        prop="images"
        :limit="9"
        :enable-oss-media-manager="true"
        :compress-support="true"
        :compress-target-size="300"
        span="auto"
      />

      <!-- 商品详情图 -->
      <AFormImgUpload
        label="详情图"
        v-model="goodsForm.detailImages"
        prop="detailImages"
        :limit="20"
        :drag="true"
        :enable-direct-upload="true"
        module-name="goods"
        directory-path="/商品/详情图"
        :span="24"
      />
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const goodsForm = reactive({
  mainImage: '',
  images: '',
  detailImages: ''
})

const goodsRules: FormRules = {
  mainImage: [
    { required: true, message: '请上传商品主图', trigger: 'change' }
  ],
  images: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ]
}
</script>
```

### 用户认证

身份证等证件上传场景。

```vue
<template>
  <el-form :model="authForm" :rules="authRules" ref="formRef" label-width="120px">
    <el-row :gutter="20">
      <!-- 身份证正面 -->
      <AFormImgUpload
        label="身份证正面"
        v-model="authForm.idCardFront"
        prop="idCardFront"
        :limit="1"
        :file-type="['jpg', 'png']"
        :file-size="5"
        tooltip="请上传身份证人像面，确保四角完整、信息清晰"
        :span="12"
      />

      <!-- 身份证反面 -->
      <AFormImgUpload
        label="身份证反面"
        v-model="authForm.idCardBack"
        prop="idCardBack"
        :limit="1"
        :file-type="['jpg', 'png']"
        :file-size="5"
        tooltip="请上传身份证国徽面，确保四角完整、信息清晰"
        :span="12"
      />

      <!-- 手持身份证 -->
      <AFormImgUpload
        label="手持身份证"
        v-model="authForm.holdIdCard"
        prop="holdIdCard"
        :limit="1"
        :file-type="['jpg', 'png']"
        :file-size="10"
        tooltip="请手持身份证在光线充足处拍摄，确保人脸和证件信息清晰可见"
        :span="24"
      />
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const authForm = reactive({
  idCardFront: '',
  idCardBack: '',
  holdIdCard: ''
})

const authRules: FormRules = {
  idCardFront: [
    { required: true, message: '请上传身份证正面', trigger: 'change' }
  ],
  idCardBack: [
    { required: true, message: '请上传身份证反面', trigger: 'change' }
  ],
  holdIdCard: [
    { required: true, message: '请上传手持身份证照片', trigger: 'change' }
  ]
}
</script>
```

### 表格内嵌编辑

在表格中嵌入图片上传。

```vue
<template>
  <el-table :data="tableData" border>
    <el-table-column prop="name" label="名称" width="200" />
    <el-table-column label="图片" width="100">
      <template #default="{ row }">
        <AFormImgUpload
          v-model="row.image"
          :show-form-item="false"
          :limit="1"
          size="small"
          :enable-clear-all="false"
          @change="handleRowImageChange(row)"
        />
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" width="100" />
    <el-table-column label="操作" width="150">
      <template #default="{ row }">
        <el-button type="primary" size="small" @click="handleSave(row)">保存</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TableRow {
  id: number
  name: string
  image: string
  status: string
}

const tableData = ref<TableRow[]>([
  { id: 1, name: '商品A', image: '', status: '正常' },
  { id: 2, name: '商品B', image: '', status: '正常' },
])

const handleRowImageChange = (row: TableRow) => {
  console.log('图片变化:', row)
}

const handleSave = (row: TableRow) => {
  console.log('保存:', row)
}
</script>
```

### 广告位管理

广告图片上传与管理。

```vue
<template>
  <el-form :model="adForm" :rules="adRules" ref="formRef" label-width="100px">
    <AFormImgUpload
      label="广告图片"
      v-model="adForm.imageUrl"
      prop="imageUrl"
      :limit="1"
      :file-size="2"
      :enable-direct-upload="true"
      :compress-support="true"
      :compress-target-size="500"
      :enable-oss-media-manager="true"
      module-name="advertisement"
      tooltip="推荐尺寸 1920x600，文件大小不超过 2MB"
      :span="24"
    />

    <AFormInput
      label="跳转链接"
      v-model="adForm.linkUrl"
      prop="linkUrl"
      placeholder="请输入广告跳转链接"
      :span="24"
    />
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const adForm = reactive({
  imageUrl: '',
  linkUrl: ''
})

const adRules: FormRules = {
  imageUrl: [
    { required: true, message: '请上传广告图片', trigger: 'change' }
  ]
}
</script>
```

---

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值，逗号分隔的URL或OSS ID字符串 | `string` | `''` |
| label | 标签文本 | `string` | `'图片'` |
| labelWidth | 标签宽度 | `string \| number` | `undefined` |
| prop | 表单域字段名 | `string` | `''` |
| showFormItem | 是否显示表单项容器 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| limit | 上传数量限制 | `number` | `1` |
| fileSize | 文件大小限制（MB） | `number` | `5` |
| fileType | 允许的图片类型 | `string[]` | `['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']` |
| isShowTip | 是否显示上传提示 | `boolean` | `true` |
| span | 栅格列宽 | `number \| string \| object` | `undefined` |
| compressSupport | 是否支持图片压缩 | `boolean` | `false` |
| compressTargetSize | 压缩目标大小（KB） | `number` | `300` |
| enableOssMediaManager | 是否启用素材库 | `boolean` | `false` |
| enableClearAll | 是否启用清空全部 | `boolean` | `true` |
| uploadParams | 上传参数 | `Record<string, any>` | `{}` |
| tooltip | 提示信息 | `string` | `''` |
| multiple | 是否支持多选 | `boolean` | `true` |
| drag | 是否启用拖拽上传 | `boolean` | `false` |
| autoUpload | 是否自动上传 | `boolean` | `true` |
| listType | 文件列表类型 | `'text' \| 'picture' \| 'picture-card'` | `'picture-card'` |
| showFileList | 是否显示文件列表 | `boolean` | `true` |
| uploadButtonText | 上传按钮文字 | `string` | `'选择图片'` |
| enableDirectUpload | 是否启用直传模式 | `boolean` | `false` |
| moduleName | 模块名称 | `string` | `undefined` |
| directoryId | 目录ID | `string \| number` | `undefined` |
| directoryPath | 目录路径 | `string` | `undefined` |
| responsiveMode | 响应式模式 | `'screen' \| 'container' \| 'modal-size'` | `'screen'` |
| modalSize | 弹窗尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `undefined` |
| returnMode | 返回值模式 | `'url' \| 'ossId'` | `'url'` |
| size | 卡片尺寸 | `'small' \| 'medium' \| 'large'` | `'large'` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值更新时触发 | `(value: string)` |
| change | 值变化时触发 | `(value: string)` |
| success | 上传成功时触发 | `(response: UploadResponse, file: ElUploadFile, newFile: ImageItem)` |
| error | 上传失败时触发 | `(error: string, file: ElUploadFile)` |
| progress | 上传进度变化时触发 | `(event: ProgressEvent, file: ElUploadFile, fileList: ElUploadFile[])` |
| exceed | 超出数量限制时触发 | `()` |

### Methods

通过 ref 获取组件实例后可调用以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| clearAll | 清空所有图片 | - |
| forceRefreshUpload | 强制刷新上传组件 | - |

### Slots

组件暂不支持自定义插槽。

---

## 类型定义

### ImageItem

图片项接口定义。

```typescript
interface ImageItem {
  /** 文件名 */
  name: string
  /** 文件URL（不带签名参数） */
  url: string
  /** OSS文件ID */
  ossId?: string | number
  /** 带签名的完整URL，用于回显 */
  signedUrl?: string
}
```

### UploadResponse

上传响应接口定义。

```typescript
interface UploadResponse {
  /** 响应码 */
  code: number
  /** 响应消息 */
  msg?: string
  /** 响应数据 */
  data?: {
    /** 文件名 */
    fileName: string
    /** 原始文件名 */
    originalName: string
    /** 文件URL（私有桶可能带预签名参数） */
    url: string
    /** 原始URL（不带预签名参数，用于存储） */
    originalUrl?: string
    /** OSS文件ID */
    ossId: string
    /** 更新时间 */
    updateTime: string
  }
}
```

### AFormImgUploadProps

组件完整Props类型定义。

```typescript
interface AFormImgUploadProps {
  modelValue?: string
  label?: string
  labelWidth?: string | number
  prop?: string
  showFormItem?: boolean
  disabled?: boolean
  limit?: number
  fileSize?: number
  fileType?: string[]
  isShowTip?: boolean
  span?: SpanType
  compressSupport?: boolean
  compressTargetSize?: number
  enableOssMediaManager?: boolean
  enableClearAll?: boolean
  uploadParams?: Record<string, any>
  tooltip?: string
  multiple?: boolean
  drag?: boolean
  autoUpload?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  showFileList?: boolean
  uploadButtonText?: string
  enableDirectUpload?: boolean
  moduleName?: string
  directoryId?: string | number
  directoryPath?: string
  responsiveMode?: 'screen' | 'container' | 'modal-size'
  modalSize?: 'small' | 'medium' | 'large' | 'xl'
  returnMode?: 'url' | 'ossId'
  size?: 'small' | 'medium' | 'large'
}
```

### SpanType

栅格列宽类型定义。

```typescript
type SpanType =
  | number
  | string
  | 'auto'
  | {
      xs?: number
      sm?: number
      md?: number
      lg?: number
      xl?: number
    }
```

---

## 样式定制

### CSS 类名

组件提供以下 CSS 类名用于样式定制：

| 类名 | 说明 |
|------|------|
| `.hide .el-upload--picture-card` | 隐藏上传按钮（达到限制时） |
| `.el-upload-list` | 文件列表容器 |
| `.el-upload-dragger` | 拖拽上传区域 |
| `.el-progress` | 进度条样式 |
| `.el-upload--picture-card` | 图片卡片样式 |
| `.el-upload-list--picture-card .el-upload-list__item` | 图片列表项 |

### 自定义卡片尺寸

```scss
/* 自定义图片卡片大小 */
:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
}
```

### 自定义拖拽区域

```scss
/* 自定义拖拽区域样式 */
:deep(.el-upload-dragger) {
  padding: 60px 40px;
  background-color: var(--el-fill-color-light);
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}
```

### 自定义进度条

```scss
/* 自定义进度条样式 */
:deep(.el-progress) {
  margin-top: 12px;

  .el-progress-bar__outer {
    height: 8px !important;
    border-radius: 4px;
  }

  .el-progress-bar__inner {
    border-radius: 4px;
  }
}
```

---

## 最佳实践

### 1. 合理设置文件限制

根据业务需求合理设置文件大小和数量限制，避免用户上传过大的文件。

```vue
<!-- 推荐做法 -->
<AFormImgUpload
  :file-size="5"
  :file-type="['jpg', 'png', 'webp']"
  :limit="9"
  :compress-support="true"
  :compress-target-size="300"
/>
```

### 2. 启用图片压缩

对于用户上传的图片，建议开启压缩功能以减少存储成本和提升加载速度。

```vue
<!-- 推荐做法 -->
<AFormImgUpload
  :compress-support="true"
  :compress-target-size="500"
/>
```

### 3. 大文件使用直传模式

当需要上传大文件或高并发场景时，启用直传模式减少服务器压力。

```vue
<!-- 推荐做法 -->
<AFormImgUpload
  :enable-direct-upload="true"
  :file-size="50"
  module-name="large-files"
/>
```

### 4. 配合表单验证

始终配合表单验证使用，确保必填字段有值。

```vue
<!-- 推荐做法 -->
<template>
  <el-form :model="form" :rules="rules">
    <AFormImgUpload
      label="图片"
      v-model="form.image"
      prop="image"
    />
  </el-form>
</template>

<script setup>
const rules = {
  image: [
    { required: true, message: '请上传图片', trigger: 'change' }
  ]
}
</script>
```

### 5. 使用合适的卡片尺寸

根据使用场景选择合适的卡片尺寸。

```vue
<!-- 表格场景使用小尺寸 -->
<AFormImgUpload size="small" :show-form-item="false" />

<!-- 表单场景使用大尺寸 -->
<AFormImgUpload size="large" :span="12" />
```

### 6. 添加提示信息

为用户提供清晰的上传指引。

```vue
<!-- 推荐做法 -->
<AFormImgUpload
  label="营业执照"
  tooltip="请上传清晰的营业执照照片，确保四角完整"
  :is-show-tip="true"
/>
```

### 7. 选择合适的返回模式

根据后端存储方式选择返回模式。

```vue
<!-- 需要关联文件管理时使用 ossId 模式 -->
<AFormImgUpload return-mode="ossId" />

<!-- 简单存储场景使用 url 模式 -->
<AFormImgUpload return-mode="url" />
```

---

## 常见问题

### 1. 图片上传后不显示

**问题原因：**
- 私有存储桶的URL需要预签名才能访问
- 浏览器缓存了旧的URL

**解决方案：**
组件已内置处理逻辑，会自动处理预签名URL。如果仍有问题，可以尝试：

```vue
<script setup>
// 手动刷新组件
const uploadRef = ref()

const refresh = () => {
  uploadRef.value?.forceRefreshUpload()
}
</script>
```

### 2. 上传进度不显示

**问题原因：**
- 直传模式下可能需要特殊处理进度

**解决方案：**
确保服务器正确返回进度信息，组件会自动显示进度条。

### 3. 素材库选择后图片不显示

**问题原因：**
- 素材库返回的URL格式不正确
- 组件未正确刷新

**解决方案：**
组件已处理此场景，会在选择后自动刷新。如果仍有问题，检查素材库返回的数据格式是否正确。

### 4. 文件名包含逗号导致解析错误

**问题原因：**
- 组件使用逗号分隔多个URL，文件名中的逗号会造成冲突

**解决方案：**
组件已在上传前校验文件名，包含逗号的文件会被拒绝上传并提示用户重命名。

### 5. 图片压缩失败

**问题原因：**
- 图片格式不支持压缩
- 图片已损坏

**解决方案：**
```vue
<!-- 捕获压缩错误 -->
<AFormImgUpload
  :compress-support="true"
  @error="handleError"
/>

<script setup>
const handleError = (error: string, file: any) => {
  if (error.includes('压缩')) {
    // 提示用户更换图片或禁用压缩
  }
}
</script>
```

### 6. 直传模式下上传失败

**问题原因：**
- 云存储配置不正确
- 预签名URL过期
- 跨域配置问题

**解决方案：**
1. 检查云存储配置是否正确
2. 确保预签名URL有效期足够
3. 配置正确的CORS策略

### 7. OSS ID 模式下回显失败

**问题原因：**
- 后端接口返回数据格式不正确
- 网络请求失败

**解决方案：**
```vue
<!-- 确保后端返回正确格式 -->
<script setup>
// 后端应返回格式
// {
//   ossId: "123456",
//   fileName: "example.jpg",
//   originalName: "example.jpg",
//   url: "https://..."
// }
</script>
```

---

## 完整示例

### 商品编辑表单

```vue
<template>
  <AModal
    v-model="visible"
    :title="isEdit ? '编辑商品' : '新增商品'"
    size="large"
    :loading="submitLoading"
    @confirm="handleSubmit"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <!-- 基本信息 -->
        <AFormInput
          label="商品名称"
          v-model="form.name"
          prop="name"
          :maxlength="100"
          span="auto"
        />

        <AFormInput
          label="商品编码"
          v-model="form.code"
          prop="code"
          :maxlength="50"
          span="auto"
        />

        <!-- 图片上传 -->
        <AFormImgUpload
          label="商品主图"
          v-model="form.mainImage"
          prop="mainImage"
          :limit="1"
          :enable-oss-media-manager="true"
          :compress-support="true"
          :compress-target-size="500"
          tooltip="推荐尺寸 800x800 像素"
          responsive-mode="modal-size"
          modal-size="large"
          span="auto"
        />

        <AFormImgUpload
          label="商品相册"
          v-model="form.gallery"
          prop="gallery"
          :limit="9"
          :enable-oss-media-manager="true"
          :enable-direct-upload="true"
          :compress-support="true"
          :compress-target-size="300"
          module-name="goods"
          directory-path="/商品/相册"
          tooltip="最多上传9张图片"
          responsive-mode="modal-size"
          modal-size="large"
          :span="24"
        />

        <AFormImgUpload
          label="详情长图"
          v-model="form.detailImages"
          prop="detailImages"
          :limit="20"
          :drag="true"
          :enable-direct-upload="true"
          :compress-support="true"
          :compress-target-size="500"
          module-name="goods"
          directory-path="/商品/详情"
          :span="24"
        />

        <!-- 价格库存 -->
        <AFormInput
          label="销售价格"
          v-model="form.price"
          prop="price"
          type="number"
          :min="0"
          span="auto"
        />

        <AFormInput
          label="库存数量"
          v-model="form.stock"
          prop="stock"
          type="number"
          :min="0"
          span="auto"
        />

        <!-- 商品描述 -->
        <AFormEditor
          label="商品描述"
          v-model="form.description"
          prop="description"
          :span="24"
        />
      </el-row>
    </el-form>
  </AModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  editData?: any
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  mainImage: '',
  gallery: '',
  detailImages: '',
  price: 0,
  stock: 0,
  description: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入商品编码', trigger: 'blur' }
  ],
  mainImage: [
    { required: true, message: '请上传商品主图', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入销售价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ]
}

// 初始化表单数据
const initForm = () => {
  if (props.editData) {
    Object.assign(form, props.editData)
  } else {
    Object.assign(form, {
      id: undefined,
      name: '',
      code: '',
      mainImage: '',
      gallery: '',
      detailImages: '',
      price: 0,
      stock: 0,
      description: ''
    })
  }
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    // 调用保存接口
    // await saveGoods(form)
    emit('success')
    visible.value = false
  } finally {
    submitLoading.value = false
  }
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    initForm()
  }
})
</script>
```

---

## 注意事项

1. **图片格式支持**：默认支持 jpg、jpeg、png、gif、webp、bmp 格式，可通过 `fileType` 属性自定义
2. **文件名限制**：文件名不能包含英文逗号，因为组件使用逗号分隔多个图片URL
3. **直传模式**：启用直传模式时，组件会自动判断存储类型（本地/云端）并选择合适的上传方式
4. **图片压缩**：压缩功能基于 `image-conversion` 库，只对超过目标大小的图片进行压缩
5. **素材库集成**：组件内置了素材库选择功能，可从已上传的图片中选择
6. **替换模式**：通过 `uploadParams` 传入 `isReplace: true` 和 `replaceOssId` 可启用图片替换功能
7. **预签名URL**：私有存储桶返回的URL会自动处理，存储时使用干净URL，显示时使用签名URL
8. **OSS ID模式**：使用 `ossId` 返回模式时，数据回显需要额外的接口调用获取文件信息
