# AFormFileUpload 文件上传组件

AFormFileUpload 是一个功能丰富的文件上传组件，基于 Element Plus 的 ElUpload 封装，支持多种文件类型、拖拽上传、进度显示等功能，并集成了 OSS 直传功能。

## 基础用法

### 标准文件上传

```vue
<template>
  <!-- 表单中使用 -->
  <AFormFileUpload 
    v-model="form.attachments" 
    label="附件" 
    prop="attachments" 
    :span="12" 
  />
  
  <!-- 不含表单项的简单上传 -->
  <AFormFileUpload 
    v-model="fileUrls" 
    label="文件" 
    :show-form-item="false" 
  />
</template>

<script lang="ts" setup>
const form = reactive({
  title: '',
  attachments: ''
})

const fileUrls = ref('')
</script>
```

### 带提示信息的上传

```vue
<template>
  <AFormFileUpload 
    v-model="form.documents" 
    label="相关文档" 
    prop="documents" 
    tooltip="支持上传PDF、Word、Excel等格式文件，单个文件不超过10MB" 
    :file-size="10"
    :file-type="['pdf', 'doc', 'docx', 'xls', 'xlsx']"
    :span="12" 
  />
</template>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 绑定值（文件URL字符串） |
| `label` | `string` | `'文件'` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项 |

### 上传限制属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | `number` | `5` | 文件数量限制 |
| `fileSize` | `number` | `5` | 文件大小限制(MB) |
| `fileType` | `string[]` | `['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf']` | 允许的文件类型 |
| `multiple` | `boolean` | `true` | 是否支持多选 |

### 功能属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `disabled` | `boolean` | `false` | 是否禁用 |
| `drag` | `boolean` | `false` | 是否启用拖拽上传 |
| `autoUpload` | `boolean` | `true` | 是否自动上传 |
| `listType` | `'text' \| 'picture' \| 'picture-card'` | `'text'` | 文件列表类型 |
| `showFileList` | `boolean` | `true` | 是否显示文件列表 |

### 显示属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `isShowTip` | `boolean` | `true` | 是否显示上传提示 |
| `uploadButtonText` | `string` | `'选择文件'` | 上传按钮文字 |
| `tooltip` | `string` | `''` | 提示信息 |

### OSS属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableOssMediaManager` | `boolean` | `true` | 是否启用素材库 |
| `enableClearAll` | `boolean` | `true` | 是否启用清空全部 |
| `enableDirectUpload` | `boolean` | `false` | 是否启用直传模式 |
| `uploadParams` | `object` | `{}` | 上传额外参数 |

## 使用示例

### 限制文件类型和大小

```vue
<template>
  <!-- PDF文档上传 -->
  <AFormFileUpload 
    v-model="form.pdfFiles" 
    label="PDF文档" 
    prop="pdfFiles"
    :file-type="['pdf']" 
    :file-size="20"
    :limit="3"
    :span="12" 
  />
  
  <!-- 图片文件上传 -->
  <AFormFileUpload 
    v-model="form.imageFiles" 
    label="图片文件" 
    prop="imageFiles"
    :file-type="['jpg', 'png', 'gif']" 
    :file-size="5"
    :span="12" 
  />
</template>
```

### 单文件模式

```vue
<template>
  <AFormFileUpload 
    v-model="form.contract" 
    label="合同文件" 
    prop="contract"
    :limit="1" 
    :multiple="false"
    :file-type="['pdf', 'doc', 'docx']"
    :span="12" 
  />
</template>
```

### 拖拽上传模式

```vue
<template>
  <AFormFileUpload 
    v-model="form.batchFiles" 
    label="批量文件" 
    prop="batchFiles"
    :drag="true" 
    :limit="10"
    :file-size="50"
    upload-button-text="拖拽文件到此处或点击上传"
    :span="24" 
  />
</template>
```

### 启用直传模式

```vue
<template>
  <AFormFileUpload 
    v-model="form.largeFiles" 
    label="大文件上传" 
    prop="largeFiles"
    :enable-direct-upload="true" 
    :file-size="100"
    :span="12" 
  />
</template>
```

### 替换模式

```vue
<template>
  <AFormFileUpload 
    v-model="form.replaceFile" 
    label="文件替换" 
    prop="replaceFile"
    :upload-params="{ isReplace: true, replaceOssId: originalFileId }" 
    :limit="1"
    :span="12" 
  />
</template>

<script lang="ts" setup>
const originalFileId = ref(123) // 要替换的文件ID
</script>
```

### 自定义上传按钮

```vue
<template>
  <AFormFileUpload 
    v-model="form.customFiles" 
    label="自定义上传"
    :show-form-item="false"
  >
    <template #trigger>
      <el-button type="primary" :icon="Upload">
        自定义上传按钮
      </el-button>
    </template>
    
    <template #tip>
      <div class="upload-tip">
        支持上传 jpg/png 文件，且不超过 500kb
      </div>
    </template>
  </AFormFileUpload>
</template>

<style scoped>
.upload-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}
</style>
```

### 手动上传控制

```vue
<template>
  <AFormFileUpload 
    v-model="form.manualFiles" 
    label="手动上传"
    :auto-upload="false"
    @change="handleFilesChange"
    ref="uploadRef"
  />
  
  <el-button @click="submitUpload" type="primary" :loading="uploading">
    开始上传
  </el-button>
  <el-button @click="clearFiles">清空文件</el-button>
</template>

<script lang="ts" setup>
const uploading = ref(false)
const uploadRef = ref()

const handleFilesChange = (fileList) => {
  console.log('文件列表变化：', fileList)
}

const submitUpload = () => {
  uploading.value = true
  uploadRef.value.submit()
}

const clearFiles = () => {
  uploadRef.value.clearFiles()
}
</script>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormFileUpload 
    v-model="form.files" 
    label="文件上传"
    @change="handleChange"
    @remove="handleRemove"
    @success="handleSuccess"
    @error="handleError"
    @progress="handleProgress"
    @exceed="handleExceed"
  />
</template>

<script lang="ts" setup>
const handleChange = (file, fileList) => {
  console.log('文件变化：', { file, fileList })
}

const handleRemove = (file, fileList) => {
  console.log('文件移除：', { file, fileList })
  ElMessage.info(`移除文件: ${file.name}`)
}

const handleSuccess = (response, file, fileList) => {
  console.log('上传成功：', { response, file, fileList })
  ElMessage.success(`${file.name} 上传成功`)
}

const handleError = (error, file, fileList) => {
  console.error('上传失败：', { error, file, fileList })
  ElMessage.error(`${file.name} 上传失败: ${error.message}`)
}

const handleProgress = (event, file, fileList) => {
  console.log('上传进度：', `${file.name} ${Math.round(event.percent)}%`)
}

const handleExceed = (files, fileList) => {
  ElMessage.warning('文件数量超出限制')
}
</script>
```

### 上传前验证

```vue
<template>
  <AFormFileUpload 
    v-model="form.validatedFiles" 
    label="验证上传"
    :before-upload="beforeUpload"
    @change="handleValidatedChange"
  />
</template>

<script lang="ts" setup>
const beforeUpload = (file) => {
  // 文件类型检查
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
  if (!isValidType) {
    ElMessage.error('只能上传 JPG/PNG/PDF 格式的文件!')
    return false
  }
  
  // 文件大小检查
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  
  // 文件名检查
  const hasValidName = /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+\.(jpg|jpeg|png|pdf)$/i.test(file.name)
  if (!hasValidName) {
    ElMessage.error('文件名包含非法字符或格式不正确!')
    return false
  }
  
  return true
}

const handleValidatedChange = (file, fileList) => {
  console.log('验证通过的文件：', file.name)
}
</script>
```

### 自定义上传请求

```vue
<template>
  <AFormFileUpload 
    v-model="form.customFiles" 
    label="自定义上传"
    :http-request="customUpload"
    :show-progress="true"
  />
</template>

<script lang="ts" setup>
const customUpload = (options) => {
  const { file, onProgress, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', 'documents')
  formData.append('userId', userStore.userId)
  
  // 使用自定义的上传API
  return uploadFileWithProgress({
    url: '/api/upload/custom',
    data: formData,
    onProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress({ percent })
    }
  }).then(response => {
    onSuccess(response.data)
  }).catch(error => {
    onError(error)
  })
}

// 带进度的文件上传函数
const uploadFileWithProgress = ({ url, data, onProgress }) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', onProgress)
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })
    
    xhr.open('POST', url)
    xhr.send(data)
  })
}
</script>
```

## 高级功能

### 文件预览

```vue
<template>
  <AFormFileUpload 
    v-model="form.previewFiles" 
    label="可预览文件"
    :show-file-list="true"
    @preview="handlePreview"
  />
  
  <!-- 文件预览对话框 -->
  <el-dialog v-model="previewDialogVisible" title="文件预览" width="80%">
    <div v-if="previewFile" class="file-preview">
      <!-- 图片预览 -->
      <el-image 
        v-if="isImageFile(previewFile)" 
        :src="previewFile.url" 
        fit="contain" 
        class="preview-image"
      />
      
      <!-- PDF预览 -->
      <iframe 
        v-else-if="isPdfFile(previewFile)" 
        :src="previewFile.url" 
        class="preview-iframe"
      />
      
      <!-- 其他文件显示信息 -->
      <div v-else class="file-info">
        <el-icon size="64"><Document /></el-icon>
        <h3>{{ previewFile.name }}</h3>
        <p>文件大小: {{ formatFileSize(previewFile.size) }}</p>
        <el-button type="primary" @click="downloadFile(previewFile)">
          下载文件
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
const previewDialogVisible = ref(false)
const previewFile = ref(null)

const handlePreview = (file) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

const isImageFile = (file) => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
    file.name.split('.').pop().toLowerCase()
  )
}

const isPdfFile = (file) => {
  return file.name.toLowerCase().endsWith('.pdf')
}

const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

const downloadFile = (file) => {
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  link.click()
}
</script>

<style scoped>
.file-preview {
  text-align: center;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
}

.preview-iframe {
  width: 100%;
  height: 60vh;
  border: none;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
</style>
```

### 分片上传大文件

```vue
<template>
  <AFormFileUpload 
    v-model="form.largeFiles" 
    label="大文件分片上传"
    :file-size="1024"
    :http-request="chunkUpload"
    :show-progress="true"
  />
</template>

<script lang="ts" setup>
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB per chunk

const chunkUpload = async (options) => {
  const { file, onProgress, onSuccess, onError } = options
  
  try {
    const chunks = createFileChunks(file)
    const uploadResults = []
    
    // 上传所有分片
    for (let i = 0; i < chunks.length; i++) {
      const formData = new FormData()
      formData.append('chunk', chunks[i])
      formData.append('chunkIndex', i)
      formData.append('totalChunks', chunks.length)
      formData.append('fileName', file.name)
      formData.append('fileHash', await calculateFileHash(file))
      
      const response = await uploadChunk(formData)
      uploadResults.push(response)
      
      // 更新进度
      const progress = Math.round(((i + 1) / chunks.length) * 100)
      onProgress({ percent: progress })
    }
    
    // 合并分片
    const mergeResult = await mergeChunks({
      fileName: file.name,
      fileHash: await calculateFileHash(file),
      totalChunks: chunks.length
    })
    
    onSuccess(mergeResult)
  } catch (error) {
    onError(error)
  }
}

const createFileChunks = (file) => {
  const chunks = []
  let start = 0
  
  while (start < file.size) {
    const end = Math.min(start + CHUNK_SIZE, file.size)
    chunks.push(file.slice(start, end))
    start = end
  }
  
  return chunks
}

const calculateFileHash = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      const hashBuffer = crypto.subtle.digest('SHA-256', arrayBuffer)
      hashBuffer.then(hash => {
        const hashArray = Array.from(new Uint8Array(hash))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        resolve(hashHex)
      })
    }
    reader.readAsArrayBuffer(file)
  })
}

const uploadChunk = (formData) => {
  return fetch('/api/upload/chunk', {
    method: 'POST',
    body: formData
  }).then(res => res.json())
}

const mergeChunks = (params) => {
  return fetch('/api/upload/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  }).then(res => res.json())
}
</script>
```

### 文件压缩

```vue
<template>
  <AFormFileUpload 
    v-model="form.compressedFiles" 
    label="自动压缩文件"
    :before-upload="compressFile"
    :file-type="['jpg', 'jpeg', 'png']"
  />
</template>

<script lang="ts" setup>
const compressFile = async (file) => {
  // 只对图片进行压缩
  if (!file.type.startsWith('image/')) {
    return file
  }
  
  try {
    const compressedFile = await compressImage(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080
    })
    
    console.log(`文件压缩: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`)
    return compressedFile
  } catch (error) {
    console.error('文件压缩失败:', error)
    return file
  }
}

const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options
      
      // 计算压缩后的尺寸
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(resolve, file.type, quality)
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
</script>
```

### 批量操作

```vue
<template>
  <div>
    <div class="batch-actions">
      <el-button @click="selectAll">全选</el-button>
      <el-button @click="clearSelection">清空选择</el-button>
      <el-button @click="downloadSelected" :disabled="selectedFiles.length === 0">
        下载选中 ({{ selectedFiles.length }})
      </el-button>
      <el-button @click="deleteSelected" type="danger" :disabled="selectedFiles.length === 0">
        删除选中
      </el-button>
    </div>
    
    <AFormFileUpload 
      v-model="form.batchFiles" 
      label="批量文件管理"
      :show-file-list="true"
      :multiple="true"
      :limit="20"
      @change="handleFileListChange"
    />
    
    <!-- 自定义文件列表 -->
    <div class="custom-file-list">
      <div 
        v-for="(file, index) in fileList" 
        :key="file.uid"
        class="file-item"
        :class="{ selected: selectedFiles.includes(file.uid) }"
        @click="toggleSelection(file.uid)"
      >
        <el-checkbox 
          :model-value="selectedFiles.includes(file.uid)"
          @change="toggleSelection(file.uid)"
        />
        <el-icon class="file-icon"><Document /></el-icon>
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">{{ formatFileSize(file.size) }}</div>
        </div>
        <div class="file-actions">
          <el-button size="small" @click.stop="previewFile(file)">预览</el-button>
          <el-button size="small" @click.stop="downloadFile(file)">下载</el-button>
          <el-button size="small" type="danger" @click.stop="deleteFile(index)">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const fileList = ref([])
const selectedFiles = ref([])

const handleFileListChange = (file, files) => {
  fileList.value = files
}

const toggleSelection = (fileId) => {
  const index = selectedFiles.value.indexOf(fileId)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(fileId)
  }
}

const selectAll = () => {
  selectedFiles.value = fileList.value.map(file => file.uid)
}

const clearSelection = () => {
  selectedFiles.value = []
}

const downloadSelected = () => {
  const selected = fileList.value.filter(file => selectedFiles.value.includes(file.uid))
  selected.forEach(file => {
    downloadFile(file)
  })
}

const deleteSelected = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`,
    '批量删除',
    { type: 'warning' }
  ).then(() => {
    fileList.value = fileList.value.filter(file => !selectedFiles.value.includes(file.uid))
    selectedFiles.value = []
    ElMessage.success('删除成功')
  })
}

const deleteFile = (index) => {
  fileList.value.splice(index, 1)
}
</script>

<style scoped>
.batch-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.custom-file-list {
  margin-top: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-item:hover {
  background-color: #f5f7fa;
}

.file-item.selected {
  background-color: #ecf5ff;
}

.file-icon {
  margin: 0 10px;
  color: #909399;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-actions {
  display: flex;
  gap: 5px;
}
</style>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormFileUpload 
      v-model="form.documents" 
      label="必需文档" 
      prop="documents"
      :span="12" 
    />
    
    <AFormFileUpload 
      v-model="form.certificates" 
      label="证书文件" 
      prop="certificates"
      :file-type="['pdf', 'jpg', 'png']"
      :span="12" 
    />
  </el-form>
</template>

<script lang="ts" setup>
const rules = {
  documents: [
    { required: true, message: '请上传必需文档', trigger: 'change' }
  ],
  certificates: [
    { required: true, message: '请上传证书文件', trigger: 'change' },
    { validator: validateFileCount, trigger: 'change' }
  ]
}

const validateFileCount = (rule, value, callback) => {
  if (!value || value.length === 0) {
    callback(new Error('请至少上传一个证书文件'))
  } else if (value.split(',').length > 3) {
    callback(new Error('证书文件不能超过3个'))
  } else {
    callback()
  }
}
</script>
```

### 文件内容验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormFileUpload 
      v-model="form.excelFile" 
      label="Excel文件" 
      prop="excelFile"
      :file-type="['xlsx', 'xls']"
      :limit="1"
      @success="validateExcelContent"
    />
  </el-form>
</template>

<script lang="ts" setup>
const validateExcelContent = async (response, file) => {
  try {
    // 验证Excel文件内容
    const validation = await validateUploadedExcel(response.data.url)
    
    if (!validation.isValid) {
      ElMessage.error(`Excel文件格式错误: ${validation.errors.join(', ')}`)
      // 删除已上传的文件
      form.excelFile = ''
    } else {
      ElMessage.success('Excel文件验证通过')
    }
  } catch (error) {
    ElMessage.error('文件验证失败')
  }
}

const validateUploadedExcel = async (fileUrl) => {
  // 模拟Excel内容验证
  return {
    isValid: true,
    errors: []
  }
}
</script>
```

## 最佳实践

### 1. 性能优化

```vue
<script lang="ts" setup>
// 使用计算属性优化文件列表显示
const displayFileList = computed(() => {
  return fileList.value.map(file => ({
    ...file,
    sizeFormatted: formatFileSize(file.size),
    typeIcon: getFileTypeIcon(file.name)
  }))
})

// 防抖处理文件变更事件
const debouncedHandleChange = debounce((fileList) => {
  emit('update:modelValue', fileList.map(f => f.url).join(','))
}, 300)
</script>
```

### 2. 错误处理

```vue
<script lang="ts" setup>
const handleUploadError = (error, file) => {
  console.error('Upload error:', error)
  
  let errorMessage = '上传失败'
  
  if (error.status === 413) {
    errorMessage = '文件过大，请选择较小的文件'
  } else if (error.status === 415) {
    errorMessage = '不支持的文件类型'
  } else if (error.status === 403) {
    errorMessage = '没有上传权限'
  }
  
  ElMessage.error(`${file.name} ${errorMessage}`)
}
</script>
```

### 3. 移动端适配

```vue
<template>
  <AFormFileUpload 
    v-model="form.mobileFiles" 
    label="移动端文件上传"
    :drag="!isMobile"
    :list-type="isMobile ? 'text' : 'picture-card'"
    :class="{ 'mobile-upload': isMobile }"
  />
</template>

<script lang="ts" setup>
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile } = useBreakpoint()
</script>

<style scoped>
.mobile-upload {
  /* 移动端优化样式 */
}

@media (max-width: 768px) {
  .mobile-upload :deep(.el-upload) {
    width: 100%;
  }
  
  .mobile-upload :deep(.el-upload-dragger) {
    width: 100%;
    height: 100px;
  }
}
</style>
```

## 注意事项

1. **文件大小限制**：合理设置文件大小限制，避免上传过大文件影响性能
2. **类型检查**：严格控制允许上传的文件类型，防止恶意文件上传
3. **安全性**：对上传的文件进行病毒扫描和内容验证
4. **存储空间**：监控存储空间使用情况，定期清理无用文件
5. **网络处理**：大文件上传时考虑网络中断的处理和断点续传
6. **用户体验**：提供清晰的上传进度和错误提示
7. **移动端优化**：在移动设备上简化上传界面，考虑触控操作
8. **权限控制**：根据用户权限控制可上传的文件类型和数量
