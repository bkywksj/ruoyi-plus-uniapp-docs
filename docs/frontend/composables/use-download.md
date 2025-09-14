# useDownload

文件下载相关的组合式函数，提供了完整的文件下载解决方案，支持多种下载方式和格式。

## 📋 功能特性

- **通用下载**: 基础下载文件方法，支持自定义文件名和参数
- **Excel导出**: 支持导出全部/当前页数据，带用户选择确认
- **OSS下载**: 下载OSS存储的文件，支持文件名解析
- **ZIP下载**: 下载ZIP压缩文件
- **下载状态**: 提供下载中状态标志，防止重复操作
- **进度提示**: 内置加载提示和成功/失败反馈
- **错误处理**: 完善的错误处理和用户提示

## 🎯 基础用法

### 导入使用

```js
import { useDownload } from '@/composables/useDownload'

const { downloading, download, exportExcel, downloadOss, downloadZip } = useDownload()
```

### 基本下载

```vue
<template>
  <el-button 
    @click="handleDownload" 
    :loading="downloading"
    type="primary"
  >
    下载文件
  </el-button>
</template>

<script setup>
import { useDownload } from '@/composables/useDownload'

const { download, downloading } = useDownload()

const handleDownload = async () => {
  const [error] = await download(
    '用户数据.xlsx',
    '/api/user/export',
    { type: 'all' }
  )
  
  if (error) {
    console.error('下载失败:', error)
  }
}
</script>
```

## 📥 Excel导出

### 导出当前页或全部数据

```vue
<template>
  <div>
    <!-- 搜索表单 -->
    <el-form :model="queryParams" inline>
      <el-form-item label="用户名">
        <el-input v-model="queryParams.userName" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status">
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-button 
      @click="handleExport" 
      :loading="downloading"
      type="success"
      icon="Download"
    >
      导出Excel
    </el-button>

    <!-- 表格和分页 -->
    <el-table :data="userList">
      <!-- 表格列... -->
    </el-table>
    
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
    />
  </div>
</template>

<script setup>
import { useDownload } from '@/composables/useDownload'

const { exportExcel, downloading } = useDownload()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: ''
})

const handleExport = async () => {
  // 弹出选择框让用户选择导出范围
  const [error] = await exportExcel(
    '用户列表',
    '/api/user/export',
    queryParams
  )
  
  if (!error) {
    console.log('导出成功')
  }
}
</script>
```

### 自定义导出逻辑

```js
// 如果需要在导出前进行数据处理
const handleCustomExport = async () => {
  // 显示确认对话框
  const [confirmErr] = await showConfirm({
    message: '确定要导出用户数据吗？',
    title: '导出确认'
  })
  
  if (confirmErr) return
  
  // 添加额外的导出参数
  const exportParams = {
    ...queryParams,
    includeDeleted: false,
    exportFields: ['userName', 'email', 'phone', 'status']
  }
  
  const [error] = await exportExcel('用户数据', '/api/user/export', exportParams)
}
```

## 🗂️ OSS文件下载

### 下载OSS文件

```vue
<template>
  <div>
    <el-table :data="fileList">
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="fileSize" label="文件大小" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button 
            @click="handleDownloadOss(row.ossId)"
            :loading="downloading"
            type="primary"
            link
          >
            下载
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { useDownload } from '@/composables/useDownload'

const { downloadOss, downloading } = useDownload()

const handleDownloadOss = async (ossId) => {
  const [error] = await downloadOss(ossId)
  if (!error) {
    console.log('OSS文件下载成功')
  }
}
</script>
```

## 🗜️ ZIP文件下载

### 批量下载为ZIP

```vue
<template>
  <div>
    <el-button 
      @click="handleDownloadZip"
      :loading="downloading"
      type="warning"
    >
      批量下载
    </el-button>
  </div>
</template>

<script setup>
import { useDownload } from '@/composables/useDownload'

const { downloadZip, downloading } = useDownload()

const handleDownloadZip = async () => {
  const [error] = await downloadZip(
    '/api/files/batch-download',
    '批量文件.zip'
  )
}
</script>
```

## 📊 返回值说明

### useDownload 返回对象

```js
const {
  downloading,    // Ref<boolean> - 下载状态
  download,       // 通用下载方法
  exportExcel,    // Excel导出方法  
  downloadOss,    // OSS下载方法
  downloadZip     // ZIP下载方法
} = useDownload()
```

### 方法参数详解

#### download(title, url, params?)

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| title | string | 下载文件名 | `'用户数据.xlsx'` |
| url | string | 下载接口地址 | `'/api/user/export'` |
| params | object? | 请求参数 | `{ type: 'all' }` |

#### exportExcel(title, url, params)

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| title | string | 文件标题 | `'用户列表'` |
| url | string | 导出接口 | `'/api/user/export'` |
| params | PageQuery | 包含分页信息的查询参数 | `{ pageNum: 1, pageSize: 10 }` |

#### downloadOss(ossId)

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| ossId | string/number | OSS文件ID | `'123456'` |

#### downloadZip(url, name)

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| url | string | ZIP下载接口 | `'/api/files/batch'` |
| name | string | ZIP文件名 | `'批量文件.zip'` |

## 🔧 高级用法

### 结合表格选择使用

```vue
<template>
  <div>
    <el-button 
      @click="exportSelected"
      :disabled="!selectedUsers.length"
      :loading="downloading"
    >
      导出选中用户 ({{ selectedUsers.length }})
    </el-button>
    
    <el-table 
      :data="userList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" />
      <!-- 其他列... -->
    </el-table>
  </div>
</template>

<script setup>
const selectedUsers = ref([])
const { exportExcel, downloading } = useDownload()

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const exportSelected = async () => {
  const userIds = selectedUsers.value.map(user => user.id)
  
  const [error] = await exportExcel(
    '选中用户数据',
    '/api/user/export-selected',
    { userIds }
  )
}
</script>
```

### 自定义下载提示

```js
import { showLoading, hideLoading, showMsgSuccess } from '@/utils/modal'

const customDownload = async () => {
  try {
    showLoading('正在生成文件，请稍候...')
    
    const [error] = await download(
      '自定义报表.pdf',
      '/api/report/generate',
      { format: 'pdf' }
    )
    
    if (!error) {
      showMsgSuccess('文件下载完成！')
    }
  } finally {
    hideLoading()
  }
}
```

## ⚠️ 注意事项

### 文件大小限制
- 大文件下载可能需要较长时间，建议添加进度提示
- 超大文件建议使用分片下载或提供下载链接

### 浏览器兼容性
- 使用 FileSaver.js 确保跨浏览器兼容性
- IE浏览器可能需要额外的 polyfill

### 错误处理
```js
const handleDownload = async () => {
  const [error] = await download('file.xlsx', '/api/export')
  
  if (error) {
    // 根据错误类型进行处理
    if (error.message.includes('网络')) {
      showMsgError('网络连接失败，请检查网络后重试')
    } else if (error.message.includes('权限')) {
      showMsgError('没有下载权限，请联系管理员')
    } else {
      showMsgError('下载失败，请重试')
    }
  }
}
```

### 防重复下载
```js
// downloading 状态会自动防止重复点击
<el-button 
  @click="handleDownload"
  :loading="downloading"  // 自动禁用按钮
  :disabled="downloading" // 额外保险
>
  下载
</el-button>
```
