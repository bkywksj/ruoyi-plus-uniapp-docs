# AFormEditor 富文本编辑器组件

AFormEditor 是一个功能丰富的富文本编辑器组件，基于 WangEditor 构建，支持图片上传、表格编辑、代码高亮等功能，特别适用于内容管理、文档编辑等场景。

## 基础用法

### 标准富文本编辑器

```vue
<template>
  <!-- 表单中使用 -->
  <AFormEditor 
    v-model="form.content" 
    label="文章内容" 
    prop="content" 
    :span="24" 
  />
  
  <!-- 不含表单项的编辑器 -->
  <AFormEditor 
    v-model="articleContent" 
    placeholder="请输入文章内容..."
    :show-form-item="false"
    :height="400"
  />
</template>

<script setup>
const form = reactive({
  title: '',
  content: ''
})

const articleContent = ref('<p>欢迎使用富文本编辑器！</p>')
</script>
```

### 带提示信息的编辑器

```vue
<template>
  <AFormEditor 
    v-model="form.description" 
    label="产品描述" 
    prop="description" 
    tooltip="请详细描述产品特性，支持图片、表格等富文本格式" 
    :height="300"
    :span="24" 
  />
</template>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 绑定的HTML内容 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项 |
| `placeholder` | `string` | `'请输入内容...'` | 占位符文本 |

### 编辑器属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `height` | `number` | `300` | 编辑器高度(px) |
| `minHeight` | `number` | `200` | 最小高度(px) |
| `maxHeight` | `number` | `600` | 最大高度(px) |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `autofocus` | `boolean` | `false` | 是否自动聚焦 |

### 功能控制属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableImageUpload` | `boolean` | `true` | 是否启用图片上传 |
| `enableTable` | `boolean` | `true` | 是否启用表格功能 |
| `enableCodeBlock` | `boolean` | `true` | 是否启用代码块 |
| `enableLink` | `boolean` | `true` | 是否启用链接功能 |
| `enableVideo` | `boolean` | `false` | 是否启用视频嵌入 |

### 上传属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uploadUrl` | `string` | - | 图片上传地址 |
| `maxImageSize` | `number` | `5` | 图片最大尺寸(MB) |
| `allowedImageTypes` | `Array<string>` | `['jpg', 'jpeg', 'png', 'gif', 'webp']` | 允许的图片类型 |
| `uploadParams` | `object` | `{}` | 上传额外参数 |

## 使用示例

### 基础文档编辑

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormEditor 
      v-model="form.content" 
      label="文档内容" 
      prop="content"
      :height="500"
      placeholder="开始编写您的文档..."
      :span="24" 
    />
    
    <el-form-item>
      <el-button type="primary" @click="saveDocument">保存文档</el-button>
      <el-button @click="previewDocument">预览</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
const form = reactive({
  title: '',
  content: ''
})

const rules = {
  content: [
    { required: true, message: '请输入文档内容', trigger: 'blur' },
    { min: 10, message: '内容至少10个字符', trigger: 'blur' }
  ]
}

const saveDocument = () => {
  // 保存文档逻辑
  console.log('保存内容：', form.content)
}

const previewDocument = () => {
  // 预览文档
  const preview = window.open('', '_blank')
  preview.document.write(`
    <html>
      <head><title>文档预览</title></head>
      <body>${form.content}</body>
    </html>
  `)
}
</script>
```

### 图片上传配置

```vue
<template>
  <AFormEditor 
    v-model="form.content" 
    label="图文内容" 
    prop="content"
    :enable-image-upload="true"
    :upload-url="uploadUrl"
    :max-image-size="10"
    :allowed-image-types="['jpg', 'png', 'gif']"
    :upload-params="uploadParams"
    @image-upload-success="handleImageUploadSuccess"
    @image-upload-error="handleImageUploadError"
    :span="24" 
  />
</template>

<script setup>
const uploadUrl = '/api/upload/image'

const uploadParams = {
  category: 'article',
  userId: userStore.userId
}

const handleImageUploadSuccess = (response) => {
  console.log('图片上传成功：', response)
  ElMessage.success('图片上传成功')
}

const handleImageUploadError = (error) => {
  console.error('图片上传失败：', error)
  ElMessage.error('图片上传失败')
}
</script>
```

### 自定义工具栏

```vue
<template>
  <AFormEditor 
    v-model="form.content" 
    label="自定义编辑器" 
    prop="content"
    :toolbar="customToolbar"
    :span="24" 
  />
</template>

<script setup>
const customToolbar = [
  'bold', 'italic', 'underline', 'strike',
  '|',
  'heading', 'bulletList', 'orderedList',
  '|',
  'link', 'image', 'table',
  '|',
  'textAlign', 'indent', 'outdent',
  '|',
  'undo', 'redo'
]
</script>
```

### 代码编辑器模式

```vue
<template>
  <AFormEditor 
    v-model="form.readme" 
    label="README文档" 
    prop="readme"
    :enable-code-block="true"
    :enable-markdown="true"
    :height="400"
    placeholder="支持Markdown语法和代码高亮"
    :span="24" 
  />
</template>

<script setup>
const form = reactive({
  readme: `# 项目标题

## 简介
这是一个示例项目。

## 代码示例
\`\`\`javascript
function hello() {
  console.log('Hello World!')
}
\`\`\`

## 特性
- 支持Markdown
- 代码高亮
- 表格编辑`
})
</script>
```

### 只读模式

```vue
<template>
  <AFormEditor 
    v-model="articleContent" 
    label="文章预览" 
    :readonly="true"
    :show-toolbar="false"
    :height="400"
    :show-form-item="false"
  />
</template>

<script setup>
const articleContent = ref(`
  <h2>文章标题</h2>
  <p>这是一篇示例文章的内容...</p>
  <img src="/images/demo.jpg" alt="示例图片" />
`)
</script>
```

### 协同编辑

```vue
<template>
  <div class="collaborative-editor">
    <div class="editor-header">
      <span>当前在线：{{ onlineUsers.length }}人</span>
      <div class="online-users">
        <el-avatar 
          v-for="user in onlineUsers" 
          :key="user.id" 
          :src="user.avatar" 
          :title="user.name"
          size="small"
        />
      </div>
    </div>
    
    <AFormEditor 
      v-model="documentContent" 
      label="协同文档" 
      prop="content"
      :height="500"
      @content-change="handleContentChange"
      @cursor-change="handleCursorChange"
      :span="24" 
    />
  </div>
</template>

<script setup>
const documentContent = ref('')
const onlineUsers = ref([])

// WebSocket连接用于协同编辑
const ws = new WebSocket('ws://localhost:8080/collaborative-edit')

const handleContentChange = (content) => {
  // 发送内容变更到其他用户
  ws.send(JSON.stringify({
    type: 'content-change',
    content: content,
    userId: currentUser.id
  }))
}

const handleCursorChange = (position) => {
  // 发送光标位置变更
  ws.send(JSON.stringify({
    type: 'cursor-change',
    position: position,
    userId: currentUser.id
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  switch (data.type) {
    case 'content-update':
      documentContent.value = data.content
      break
    case 'users-online':
      onlineUsers.value = data.users
      break
  }
}
</script>

<style scoped>
.collaborative-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.online-users {
  display: flex;
  gap: 5px;
}
</style>
```

## 事件处理

### 内容变更事件

```vue
<template>
  <AFormEditor 
    v-model="content" 
    label="内容编辑"
    @change="handleChange"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup>
const content = ref('')

const handleChange = (newContent) => {
  console.log('内容改变：', newContent)
  // 可以在这里进行自动保存
  autoSave(newContent)
}

const handleInput = (newContent) => {
  console.log('输入中：', newContent)
  // 实时保存草稿
  saveDraft(newContent)
}

const handleFocus = () => {
  console.log('编辑器获得焦点')
}

const handleBlur = () => {
  console.log('编辑器失去焦点')
  // 失去焦点时保存
  saveContent()
}

const handleSelectionChange = (selection) => {
  console.log('选择变更：', selection)
  // 可以用于显示当前选择的格式状态
}

// 自动保存功能
const autoSave = debounce((content) => {
  localStorage.setItem('draft', content)
  console.log('自动保存完成')
}, 2000)
</script>
```

### 图片处理事件

```vue
<template>
  <AFormEditor 
    v-model="content" 
    label="图文编辑"
    @image-paste="handleImagePaste"
    @image-drop="handleImageDrop"
    @image-insert="handleImageInsert"
  />
</template>

<script setup>
const handleImagePaste = (file) => {
  console.log('粘贴图片：', file)
  // 处理粘贴的图片
  uploadPastedImage(file)
}

const handleImageDrop = (files) => {
  console.log('拖拽图片：', files)
  // 处理拖拽的图片
  files.forEach(file => uploadImage(file))
}

const handleImageInsert = (imageInfo) => {
  console.log('插入图片：', imageInfo)
  // 图片插入完成后的处理
}

const uploadPastedImage = async (file) => {
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await uploadApi.uploadImage(formData)
    return response.data.url
  } catch (error) {
    ElMessage.error('图片上传失败')
    throw error
  }
}
</script>
```

## 高级功能

### 内容导出

```vue
<template>
  <div>
    <AFormEditor v-model="content" label="内容编辑" />
    
    <div class="export-actions">
      <el-button @click="exportToHtml">导出HTML</el-button>
      <el-button @click="exportToMarkdown">导出Markdown</el-button>
      <el-button @click="exportToPdf">导出PDF</el-button>
      <el-button @click="exportToWord">导出Word</el-button>
    </div>
  </div>
</template>

<script setup>
const content = ref('')

const exportToHtml = () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>导出文档</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>${content.value}</body>
    </html>
  `
  
  downloadFile(html, 'document.html', 'text/html')
}

const exportToMarkdown = () => {
  // 将HTML转换为Markdown
  const markdown = htmlToMarkdown(content.value)
  downloadFile(markdown, 'document.md', 'text/markdown')
}

const exportToPdf = async () => {
  // 使用库如 html2pdf 或 jsPDF
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF()
  
  // 将HTML内容添加到PDF
  pdf.html(content.value, {
    callback: function (doc) {
      doc.save('document.pdf')
    }
  })
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const htmlToMarkdown = (html) => {
  // 简单的HTML到Markdown转换
  return html
    .replace(/<h([1-6])>/g, (match, level) => '#'.repeat(parseInt(level)) + ' ')
    .replace(/<\/h[1-6]>/g, '\n\n')
    .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '*').replace(/<\/em>/g, '*')
    .replace(/<p>/g, '').replace(/<\/p>/g, '\n\n')
    .replace(/<br>/g, '\n')
    .replace(/<[^>]*>/g, '') // 移除其他HTML标签
    .trim()
}
</script>
```

### 内容模板

```vue
<template>
  <div>
    <div class="template-selector">
      <el-select v-model="selectedTemplate" placeholder="选择模板" @change="applyTemplate">
        <el-option 
          v-for="template in templates" 
          :key="template.id" 
          :label="template.name" 
          :value="template.id" 
        />
      </el-select>
      <el-button @click="saveAsTemplate">保存为模板</el-button>
    </div>
    
    <AFormEditor 
      v-model="content" 
      label="内容编辑"
      :height="500"
      :span="24" 
    />
  </div>
</template>

<script setup>
const content = ref('')
const selectedTemplate = ref('')

const templates = ref([
  {
    id: 'article',
    name: '文章模板',
    content: `
      <h1>文章标题</h1>
      <p><strong>摘要：</strong>在这里写文章摘要...</p>
      <h2>正文</h2>
      <p>在这里写正文内容...</p>
      <h2>结论</h2>
      <p>在这里写结论...</p>
    `
  },
  {
    id: 'report',
    name: '报告模板',
    content: `
      <h1>报告标题</h1>
      <p><strong>日期：</strong>${new Date().toLocaleDateString()}</p>
      <h2>概述</h2>
      <p>报告概述...</p>
      <h2>详细分析</h2>
      <table>
        <tr><th>项目</th><th>数值</th><th>说明</th></tr>
        <tr><td>项目1</td><td>100</td><td>说明1</td></tr>
        <tr><td>项目2</td><td>200</td><td>说明2</td></tr>
      </table>
      <h2>建议</h2>
      <ul>
        <li>建议1</li>
        <li>建议2</li>
      </ul>
    `
  }
])

const applyTemplate = (templateId) => {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    content.value = template.content
    ElMessage.success('模板应用成功')
  }
}

const saveAsTemplate = () => {
  ElMessageBox.prompt('请输入模板名称', '保存模板', {
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    const newTemplate = {
      id: `custom_${Date.now()}`,
      name: value,
      content: content.value
    }
    templates.value.push(newTemplate)
    ElMessage.success('模板保存成功')
  })
}
</script>

<style scoped>
.template-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
</style>
```

### 内容统计

```vue
<template>
  <div>
    <AFormEditor 
      v-model="content" 
      label="内容编辑"
      @change="updateStats"
      :height="400"
      :span="24" 
    />
    
    <el-card class="stats-card">
      <template #header>
        <span>内容统计</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="字符数" :value="stats.characters" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="单词数" :value="stats.words" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="段落数" :value="stats.paragraphs" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="图片数" :value="stats.images" />
        </el-col>
      </el-row>
      
      <div class="reading-time">
        <el-tag type="info">预计阅读时间：{{ stats.readingTime }}分钟</el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup>
const content = ref('')

const stats = reactive({
  characters: 0,
  words: 0,
  paragraphs: 0,
  images: 0,
  readingTime: 0
})

const updateStats = (html) => {
  // 提取纯文本
  const textContent = html.replace(/<[^>]*>/g, '')
  
  // 字符数统计
  stats.characters = textContent.length
  
  // 单词数统计（中英文混合）
  const chineseWords = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (textContent.match(/[a-zA-Z]+/g) || []).length
  stats.words = chineseWords + englishWords
  
  // 段落数统计
  stats.paragraphs = (html.match(/<p>/g) || []).length
  
  // 图片数统计
  stats.images = (html.match(/<img/g) || []).length
  
  // 预计阅读时间（按每分钟200字计算）
  stats.readingTime = Math.ceil(stats.words / 200)
}

watch(content, updateStats, { immediate: true })
</script>

<style scoped>
.stats-card {
  margin-top: 15px;
}

.reading-time {
  margin-top: 15px;
  text-align: center;
}
</style>
```

### 版本历史

```vue
<template>
  <div class="version-editor">
    <div class="version-toolbar">
      <el-button @click="saveVersion" type="primary" size="small">
        保存版本
      </el-button>
      <el-button @click="showVersionHistory" size="small">
        版本历史
      </el-button>
      <span class="version-info">当前版本：v{{ currentVersion }}</span>
    </div>
    
    <AFormEditor 
      v-model="content" 
      label="版本化编辑器"
      @change="handleContentChange"
      :height="500"
      :span="24" 
    />
    
    <!-- 版本历史对话框 -->
    <el-dialog v-model="versionDialogVisible" title="版本历史" width="80%">
      <el-table :data="versions" @row-click="previewVersion">
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="comment" label="备注" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button @click="restoreVersion(row)" size="small">恢复</el-button>
            <el-button @click="compareVersion(row)" size="small">对比</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    
    <!-- 版本对比对话框 -->
    <el-dialog v-model="compareDialogVisible" title="版本对比" width="90%">
      <div class="version-compare">
        <div class="compare-panel">
          <h4>当前版本</h4>
          <div class="content-preview" v-html="content"></div>
        </div>
        <div class="compare-panel">
          <h4>版本 v{{ selectedVersion?.version }}</h4>
          <div class="content-preview" v-html="selectedVersion?.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
const content = ref('')
const currentVersion = ref(1)
const versionDialogVisible = ref(false)
const compareDialogVisible = ref(false)
const selectedVersion = ref(null)

const versions = ref([
  {
    version: 1,
    content: '<p>初始版本内容</p>',
    createTime: '2024-01-01 10:00:00',
    comment: '文档初始创建',
    author: '张三'
  }
])

const handleContentChange = debounce((newContent) => {
  // 自动保存草稿
  localStorage.setItem('editor_draft', newContent)
}, 1000)

const saveVersion = () => {
  ElMessageBox.prompt('请输入版本备注', '保存版本', {
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    const newVersion = {
      version: currentVersion.value + 1,
      content: content.value,
      createTime: new Date().toLocaleString(),
      comment: value || '无备注',
      author: '当前用户'
    }
    
    versions.value.push(newVersion)
    currentVersion.value++
    
    ElMessage.success('版本保存成功')
  })
}

const showVersionHistory = () => {
  versionDialogVisible.value = true
}

const previewVersion = (version) => {
  selectedVersion.value = version
}

const restoreVersion = (version) => {
  ElMessageBox.confirm('确定要恢复到此版本吗？', '恢复版本', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    content.value = version.content
    currentVersion.value = version.version
    versionDialogVisible.value = false
    ElMessage.success('版本恢复成功')
  })
}

const compareVersion = (version) => {
  selectedVersion.value = version
  compareDialogVisible.value = true
}

// 页面加载时恢复草稿
onMounted(() => {
  const draft = localStorage.getItem('editor_draft')
  if (draft) {
    content.value = draft
  }
})
</script>

<style scoped>
.version-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.version-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.version-info {
  margin-left: auto;
  color: #909399;
  font-size: 12px;
}

.version-compare {
  display: flex;
  gap: 20px;
}

.compare-panel {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.compare-panel h4 {
  margin: 0;
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.content-preview {
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormEditor 
      v-model="form.content" 
      label="文章内容" 
      prop="content"
      :span="24" 
    />
    
    <el-form-item>
      <el-button type="primary" @click="submitForm">发布文章</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
const formRef = ref()

const form = reactive({
  title: '',
  content: ''
})

const rules = {
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 50, message: '文章内容至少50个字符', trigger: 'blur' },
    { validator: validateContent, trigger: 'blur' }
  ]
}

// 自定义内容验证
const validateContent = (rule, value, callback) => {
  // 去除HTML标签后的纯文本长度
  const textContent = value.replace(/<[^>]*>/g, '').trim()
  
  if (textContent.length < 20) {
    callback(new Error('文章内容不能少于20个字'))
  } else if (textContent.length > 10000) {
    callback(new Error('文章内容不能超过10000个字'))
  } else {
    callback()
  }
}

const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    console.log('提交表单：', form)
    // 提交逻辑
  }
}
</script>
```

### 图片数量验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormEditor 
      v-model="form.content" 
      label="图文内容" 
      prop="content"
      :enable-image-upload="true"
      @content-change="validateImageCount"
    />
  </el-form>
</template>

<script setup>
const rules = {
  content: [
    { validator: validateImageLimit, trigger: 'blur' }
  ]
}

const validateImageLimit = (rule, value, callback) => {
  const imageCount = (value.match(/<img/g) || []).length
  
  if (imageCount > 10) {
    callback(new Error('图片数量不能超过10张'))
  } else {
    callback()
  }
}

const validateImageCount = (content) => {
  const imageCount = (content.match(/<img/g) || []).length
  if (imageCount > 8) {
    ElMessage.warning(`当前图片数量：${imageCount}张，建议不要超过10张`)
  }
}
</script>
```

## 最佳实践

### 1. 性能优化

```vue
<script setup>
// 使用防抖优化内容变更
const debouncedSave = debounce((content) => {
  // 自动保存逻辑
  autoSave(content)
}, 2000)

// 懒加载编辑器
const showEditor = ref(false)

onMounted(() => {
  // 延迟加载编辑器以提升页面加载速度
  setTimeout(() => {
    showEditor.value = true
  }, 100)
})
</script>
```

### 2. 内容安全

```vue
<script setup>
// XSS防护
const sanitizeContent = (content) => {
  // 使用DOMPurify或类似库清理HTML内容
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'img', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target']
  })
}

// 在保存前清理内容
const saveContent = () => {
  form.content = sanitizeContent(form.content)
  // 保存逻辑
}
</script>
```

### 3. 移动端适配

```vue
<template>
  <AFormEditor 
    v-model="content" 
    label="内容编辑"
    :height="responsive.height"
    :toolbar="responsive.toolbar"
    :enable-image-upload="responsive.enableImageUpload"
  />
</template>

<script setup>
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile } = useBreakpoint()

const responsive = computed(() => {
  if (isMobile.value) {
    return {
      height: 300,
      toolbar: ['bold', 'italic', '|', 'bulletList', '|', 'image'],
      enableImageUpload: true
    }
  } else {
    return {
      height: 500,
      toolbar: 'full',
      enableImageUpload: true
    }
  }
})
</script>
```

## 注意事项

1. **内容安全**：始终对用户输入的HTML内容进行清理和验证
2. **图片上传**：配置合理的图片大小限制和类型检查
3. **性能考虑**：大量内容时使用防抖优化，避免频繁的DOM操作
4. **浏览器兼容**：确保在目标浏览器中编辑器功能正常
5. **移动端体验**：在小屏幕设备上简化工具栏，提升触控体验
6. **数据备份**：实现自动保存和版本管理，防止内容丢失
7. **表单验证**：对内容长度、格式等进行合理验证
8. **无障碍访问**：确保编辑器支持键盘导航和屏幕阅读器
