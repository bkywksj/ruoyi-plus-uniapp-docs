# AFormImgUpload 图片上传

AFormImgUpload 是一个功能丰富的图片上传组件，基于 Element Plus 的 Upload 组件封装，提供了图片压缩、直传云存储、素材库选择等高级功能。

## 基础用法

最简单的图片上传，支持单张或多张图片。

```vue
<template>
  <el-form :model="form">
    <!-- 基础单图上传 -->
    <AFormImgUpload 
      label="头像" 
      v-model="form.avatar" 
      prop="avatar" 
      :limit="1"
      :span="12" 
    />
    
    <!-- 基础多图上传 -->
    <AFormImgUpload 
      label="图片" 
      v-model="form.imageUrls" 
      prop="imageUrls" 
      :limit="5"
      :span="12" 
    />
  </el-form>
</template>

<script setup>
const form = reactive({
  avatar: '',
  imageUrls: ''
})
</script>
```

## 高级功能

### 直传模式

启用直传模式可以将图片直接上传到云存储，减少服务器压力。

```vue
<template>
  <AFormImgUpload 
    label="图片" 
    v-model="form.images" 
    prop="images"
    :enable-direct-upload="true"
    :span="12" 
  />
</template>
```

### 图片压缩

自动压缩大图片以优化上传速度和存储空间。

```vue
<template>
  <AFormImgUpload 
    label="图片" 
    v-model="form.images" 
    prop="images"
    :compress-support="true"
    :compress-target-size="300"
    :span="12" 
  />
</template>
```

### 拖拽上传

支持拖拽文件到上传区域。

```vue
<template>
  <AFormImgUpload 
    label="图片" 
    v-model="form.images" 
    prop="images"
    :drag="true"
    :span="12" 
  />
</template>
```

### 文件类型和大小限制

限制上传的文件类型和大小。

```vue
<template>
  <AFormImgUpload 
    label="图片" 
    v-model="form.images" 
    prop="images"
    :file-type="['jpg', 'png', 'gif']"
    :file-size="2"
    :span="12" 
  />
</template>
```

### 不含表单项容器

可以不使用 el-form-item 包装，适合在非表单场景使用。

```vue
<template>
  <AFormImgUpload 
    label="图片" 
    v-model="form.imageUrls" 
    :show-form-item="false" 
  />
</template>
```

### 替换模式

通过上传参数控制是否为替换模式。

```vue
<template>
  <AFormImgUpload 
    label="图片" 
    v-model="form.images" 
    :upload-params="{isReplace: true, replaceOssId: 123}"
    :span="12" 
  />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| modelValue | 绑定值，可以是字符串、对象或数组 | string | — | '' |
| label | 标签文本 | string | — | '图片' |
| labelWidth | 标签宽度，支持数字或字符串 | string \| number | — | undefined |
| prop | 表单域model数据字段名 | string | — | '' |
| showFormItem | 是否显示表单项 | boolean | — | true |
| disabled | 是否禁用 | boolean | — | false |
| limit | 上传文件数量限制 | number | — | 1 |
| fileSize | 文件大小限制(MB) | number | — | 5 |
| fileType | 允许的图片类型 | string[] | — | ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] |
| isShowTip | 是否显示上传提示 | boolean | — | true |
| span | 栅格占据的列数 | number | — | undefined |
| compressSupport | 是否支持图片压缩 | boolean | — | false |
| compressTargetSize | 压缩目标大小(KB) | number | — | 300 |
| enableOssMediaManager | 是否启用素材库 | boolean | — | true |
| enableClearAll | 是否启用清空全部功能 | boolean | — | true |
| uploadParams | 上传参数，用于传递额外参数 | Record<string, any> | — | {} |
| tooltip | 提示信息 | string | — | '' |
| multiple | 是否支持多选 | boolean | — | true |
| drag | 是否启用拖拽上传 | boolean | — | false |
| autoUpload | 是否自动上传 | boolean | — | true |
| listType | 文件列表类型 | string | text / picture / picture-card | 'picture-card' |
| showFileList | 是否显示文件列表 | boolean | — | true |
| uploadButtonText | 上传按钮文字 | string | — | '选择图片' |
| enableDirectUpload | 是否启用直传模式 | boolean | — | false |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 绑定值变化时触发 | (value: string) |
| success | 上传成功时触发 | (response: any, file: ElUploadFile, newFile: ImageItem) |
| error | 上传失败时触发 | (error: string, file: ElUploadFile) |
| progress | 上传进度变化时触发 | (event: any, file: ElUploadFile, fileList: ElUploadFile[]) |
| exceed | 超出文件数量限制时触发 | — |

### 方法

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| clearAll | 清空所有图片 | — |
| forceRefreshUpload | 强制刷新上传组件 | — |

## 类型定义

```typescript
interface ImageItem {
  /** 文件名 */
  name: string
  /** 文件URL */
  url: string
  /** OSS文件ID */
  ossId?: string | number
}

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
    /** 文件URL */
    url: string
    /** OSS文件ID */
    ossId: string
    /** 更新时间 */
    updateTime: string
  }
}
```

## 注意事项

1. **图片格式支持**：默认支持 jpg, jpeg, png, gif, webp, bmp 格式，可通过 `fileType` 属性自定义
2. **文件名限制**：文件名不能包含英文逗号，因为组件使用逗号分隔多个图片URL
3. **直传模式**：启用直传模式时，组件会自动判断存储类型（本地/云端）并选择合适的上传方式
4. **图片压缩**：压缩功能基于 `image-conversion` 库，只对超过目标大小的图片进行压缩
5. **素材库集成**：组件内置了素材库选择功能，可从已上传的图片中选择
6. **替换模式**：通过 `uploadParams` 传入 `isReplace: true` 和 `replaceOssId` 可启用图片替换功能

## 样式定制

组件提供了多个CSS类名用于样式定制：

- `.hide .el-upload--picture-card`：隐藏上传按钮（达到数量限制时）
- `.el-upload-list`：文件列表容器
- `.el-upload-dragger`：拖拽上传区域
- `.el-progress`：进度条样式
- `.el-upload--picture-card`：图片卡片样式

```css
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
