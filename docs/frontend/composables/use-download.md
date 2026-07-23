# useDownload

文件下载相关的组合式函数，提供了完整的文件下载解决方案，支持多种下载方式和格式。该组合函数封装了通用下载、Excel导出、OSS文件下载和ZIP压缩包下载等常见场景，并提供统一的加载状态管理和错误处理机制。

## 功能特性

- **通用下载**: 基础下载文件方法，支持自定义文件名和请求参数，采用 POST 请求方式
- **Excel导出**: 支持导出全部数据或当前页数据，带用户选择确认对话框
- **OSS下载**: 下载OSS对象存储的文件，自动解析响应头中的文件名
- **ZIP下载**: 下载ZIP压缩文件，支持批量文件打包下载
- **下载状态**: 提供响应式的 `downloading` 状态标志，防止重复操作
- **进度提示**: 内置加载提示和成功/失败反馈，使用 Element Plus 的消息组件
- **错误处理**: 完善的错误处理机制，支持解析服务端返回的错误信息
- **Blob验证**: 自动验证响应数据是否为有效的 Blob 格式
- **统一返回格式**: 所有方法统一返回 `[error, data]` 元组格式，便于错误处理
- **TypeScript支持**: 完整的类型定义，支持泛型参数

## 基础用法

### 导入使用

```typescript
import { useDownload } from '@/composables/useDownload'

// 解构获取所有下载方法和状态
const { downloading, download, exportExcel, downloadOss, downloadZip } = useDownload()
```

### 基本下载

最基础的文件下载场景，适用于需要下载单个文件的情况：

```vue
<template>
  <el-button
    @click="handleDownload"
    :loading="downloading"
    :disabled="downloading"
    type="primary"
  >
    <el-icon><Download /></el-icon>
    下载文件
  </el-button>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'

const { download, downloading } = useDownload()

const handleDownload = async () => {
  // download 方法返回 [error, data] 元组
  const [error] = await download(
    '用户数据.xlsx',           // 下载后的文件名
    '/api/user/export',        // 下载接口地址
    { type: 'all' }            // 可选的请求参数
  )

  if (error) {
    console.error('下载失败:', error)
  } else {
    console.log('下载成功')
  }
}
</script>
```

**实现说明:**

- `download` 方法内部使用 POST 请求，参数通过 `application/x-www-form-urlencoded` 格式发送
- 下载过程中会自动显示加载提示 "正在下载数据，请稍候"
- 下载完成后自动触发浏览器下载并显示成功提示
- 如果服务端返回错误信息（非 Blob 格式），会自动解析并显示错误消息

### 下载带时间戳的文件

为了避免缓存问题或区分不同时间导出的文件，可以在文件名中添加时间戳：

```vue
<template>
  <el-button @click="handleDownloadWithTimestamp" :loading="downloading">
    导出带时间戳的文件
  </el-button>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'
import { getCurrentDateTime } from '@/utils/date'

const { download, downloading } = useDownload()

const handleDownloadWithTimestamp = async () => {
  // 文件名格式: 用户数据_2024-01-15_14-30-25.xlsx
  const fileName = `用户数据_${getCurrentDateTime()}.xlsx`

  const [error] = await download(fileName, '/api/user/export', {
    status: 1,
    deptId: 100
  })

  if (!error) {
    console.log('导出成功:', fileName)
  }
}
</script>
```

### 条件下载

根据业务条件判断是否允许下载：

```vue
<template>
  <div class="download-section">
    <el-alert
      v-if="!canDownload"
      title="暂无可下载的数据"
      type="warning"
      :closable="false"
    />

    <el-button
      @click="handleConditionalDownload"
      :loading="downloading"
      :disabled="!canDownload || downloading"
      type="primary"
    >
      下载报表
    </el-button>

    <span v-if="downloading" class="download-tip">
      正在生成文件，请勿关闭页面...
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDownload } from '@/composables/useDownload'

const { download, downloading } = useDownload()

// 模拟数据列表
const dataList = ref([])

// 计算是否可以下载
const canDownload = computed(() => dataList.value.length > 0)

const handleConditionalDownload = async () => {
  if (!canDownload.value) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  const [error] = await download(
    '数据报表.xlsx',
    '/api/report/export',
    { ids: dataList.value.map(item => item.id) }
  )

  if (error) {
    ElMessage.error('导出失败，请重试')
  }
}
</script>

<style scoped>
.download-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.download-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
```

## Excel导出

### 导出当前页或全部数据

`exportExcel` 方法会弹出确认对话框，让用户选择导出范围（全部数据或当前页）：

```vue
<template>
  <div class="export-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" inline class="search-form">
      <el-form-item label="用户名">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <el-tree-select
          v-model="queryParams.deptId"
          :data="deptOptions"
          placeholder="请选择部门"
          check-strictly
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button
        @click="handleExport"
        :loading="downloading"
        type="success"
      >
        <el-icon><Download /></el-icon>
        导出Excel
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="userList" v-loading="loading" border>
      <el-table-column prop="userName" label="用户名" min-width="120" />
      <el-table-column prop="nickName" label="昵称" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="phonenumber" label="手机号" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useDownload } from '@/composables/useDownload'
import { listUser } from '@/api/system/user'

const { exportExcel, downloading } = useDownload()

// 查询参数（包含分页信息）
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: '',
  deptId: undefined
})

const userList = ref([])
const total = ref(0)
const loading = ref(false)
const deptOptions = ref([])

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res = await listUser(queryParams)
    userList.value = res.rows
    total.value = res.total
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    status: '',
    deptId: undefined
  })
  getList()
}

// 分页
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 导出Excel
const handleExport = async () => {
  // exportExcel 会弹出选择框:
  // - 点击"导出全部": 导出所有数据
  // - 点击"导出本页": 只导出当前页数据
  // - 点击关闭按钮: 取消导出
  const [error] = await exportExcel(
    '用户列表',              // 文件标题（不含扩展名）
    '/api/user/export',      // 导出接口
    queryParams              // 查询参数（包含分页信息）
  )

  if (!error) {
    console.log('导出成功')
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.export-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 16px;
}

.toolbar {
  margin-bottom: 16px;
}
</style>
```

**导出逻辑说明:**

1. 用户点击"导出Excel"按钮后，弹出选择对话框
2. 选择"导出全部"：将 `pageSize` 设置为 `2147483647`（Integer.MAX_VALUE），导出所有数据
3. 选择"导出本页"：使用当前的 `pageNum` 和 `pageSize`，只导出当前页数据
4. 点击关闭按钮（X）：取消导出操作
5. 生成的文件名格式：
   - 导出全部：`用户列表-全部_2024-01-15_14-30-25.xlsx`
   - 导出本页：`用户列表-第1页_2024-01-15_14-30-25.xlsx`

### 自定义导出确认

如果需要在导出前进行额外的数据处理或验证：

```vue
<template>
  <div>
    <el-button @click="handleCustomExport" :loading="downloading">
      自定义导出
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'
import { showConfirm, showMsgWarning } from '@/utils/modal'

const { download, downloading } = useDownload()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: ''
})

// 当前数据总数
const total = ref(0)

const handleCustomExport = async () => {
  // 验证是否有数据可导出
  if (total.value === 0) {
    showMsgWarning('没有可导出的数据')
    return
  }

  // 大数据量警告
  if (total.value > 10000) {
    const [confirmErr] = await showConfirm({
      message: `当前数据量较大（${total.value}条），导出可能需要较长时间，是否继续？`,
      title: '导出确认',
      type: 'warning'
    })

    if (confirmErr) return
  }

  // 准备导出参数
  const exportParams = {
    ...queryParams,
    pageNum: 1,
    pageSize: 2147483647,  // 导出全部
    // 添加额外的导出配置
    exportFields: ['userName', 'nickName', 'email', 'phonenumber', 'status', 'createTime'],
    includeDeleted: false,
    dateFormat: 'yyyy-MM-dd HH:mm:ss'
  }

  const [error] = await download(
    `用户数据_${new Date().getTime()}.xlsx`,
    '/api/user/export',
    exportParams
  )

  if (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}
</script>
```

### 导出选中数据

配合表格选择功能，只导出用户选中的数据：

```vue
<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button
        @click="handleExportSelected"
        :disabled="selectedRows.length === 0"
        :loading="downloading"
        type="success"
      >
        <el-icon><Download /></el-icon>
        导出选中 ({{ selectedRows.length }})
      </el-button>

      <el-button
        @click="handleExportAll"
        :loading="downloading"
        type="primary"
      >
        导出全部
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="dataList"
      @selection-change="handleSelectionChange"
      row-key="id"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="code" label="编码" />
      <el-table-column prop="status" label="状态" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from '@/composables/useDownload'

interface DataItem {
  id: number
  name: string
  code: string
  status: string
}

const { download, downloading } = useDownload()

const tableRef = ref()
const dataList = ref<DataItem[]>([])
const selectedRows = ref<DataItem[]>([])

// 表格选择变化
const handleSelectionChange = (selection: DataItem[]) => {
  selectedRows.value = selection
}

// 导出选中数据
const handleExportSelected = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条数据')
    return
  }

  const ids = selectedRows.value.map(row => row.id)

  const [error] = await download(
    `选中数据_${selectedRows.value.length}条.xlsx`,
    '/api/data/export-selected',
    { ids }
  )

  if (!error) {
    // 导出成功后清空选择
    tableRef.value?.clearSelection()
    selectedRows.value = []
  }
}

// 导出全部数据
const handleExportAll = async () => {
  const [error] = await download(
    '全部数据.xlsx',
    '/api/data/export-all',
    {}
  )
}
</script>
```

### 多Sheet导出

导出包含多个工作表的Excel文件：

```vue
<template>
  <div>
    <el-button @click="handleMultiSheetExport" :loading="downloading">
      导出多Sheet报表
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'

const { download, downloading } = useDownload()

const handleMultiSheetExport = async () => {
  // 服务端接口支持多Sheet导出
  const exportConfig = {
    sheets: [
      {
        name: '用户数据',
        type: 'user',
        query: { status: '0' }
      },
      {
        name: '部门数据',
        type: 'dept',
        query: { status: '0' }
      },
      {
        name: '角色数据',
        type: 'role',
        query: {}
      }
    ],
    fileName: '综合报表'
  }

  const [error] = await download(
    `综合报表_${new Date().toISOString().split('T')[0]}.xlsx`,
    '/api/export/multi-sheet',
    exportConfig
  )
}
</script>
```

## OSS文件下载

### 基本OSS下载

从OSS对象存储下载文件，适用于已上传到云存储的文件：

```vue
<template>
  <div>
    <!-- 文件列表 -->
    <el-table :data="fileList" border>
      <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
      <el-table-column prop="fileSuffix" label="类型" width="80" align="center" />
      <el-table-column prop="fileSize" label="大小" width="120" align="right">
        <template #default="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="上传时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            @click="handlePreview(row)"
            type="primary"
            link
            :disabled="!isPreviewable(row.fileSuffix)"
          >
            预览
          </el-button>
          <el-button
            @click="handleDownloadOss(row.ossId)"
            :loading="downloading"
            type="success"
            link
          >
            下载
          </el-button>
          <el-button
            @click="handleDelete(row)"
            type="danger"
            link
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from '@/composables/useDownload'
import { listOssFile, delOssFile } from '@/api/system/oss'

interface OssFile {
  ossId: string | number
  fileName: string
  originalName: string
  fileSuffix: string
  fileSize: number
  url: string
  createTime: string
}

const { downloadOss, downloading } = useDownload()

const fileList = ref<OssFile[]>([])

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 判断是否可预览
const isPreviewable = (suffix: string): boolean => {
  const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  return previewableTypes.includes(suffix.toLowerCase())
}

// 预览文件
const handlePreview = (row: OssFile) => {
  window.open(row.url, '_blank')
}

// 下载OSS文件
const handleDownloadOss = async (ossId: string | number) => {
  const [error] = await downloadOss(ossId)

  if (error) {
    ElMessage.error('下载失败: ' + error.message)
  }
}

// 删除文件
const handleDelete = async (row: OssFile) => {
  await ElMessageBox.confirm('确定要删除该文件吗？', '提示', {
    type: 'warning'
  })

  await delOssFile(row.ossId)
  ElMessage.success('删除成功')
  // 刷新列表
  getFileList()
}

// 获取文件列表
const getFileList = async () => {
  const res = await listOssFile({})
  fileList.value = res.rows
}
</script>
```

**OSS下载特性:**

- 使用 GET 请求下载文件
- 自动从响应头 `download-filename` 获取文件名
- 文件名自动进行 URL 解码（`decodeURIComponent`）
- 设置 `Content-Type: application/octet-stream` 作为默认 MIME 类型

### 批量OSS下载

批量下载多个OSS文件：

```vue
<template>
  <div>
    <el-button
      @click="handleBatchDownload"
      :disabled="selectedFiles.length === 0"
      :loading="batchDownloading"
    >
      批量下载 ({{ selectedFiles.length }})
    </el-button>

    <el-table
      :data="fileList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="fileSize" label="大小" />
    </el-table>

    <!-- 下载进度 -->
    <el-dialog v-model="progressVisible" title="批量下载" :close-on-click-modal="false">
      <div class="progress-list">
        <div v-for="(item, index) in downloadProgress" :key="index" class="progress-item">
          <span class="file-name">{{ item.fileName }}</span>
          <el-progress
            :percentage="item.progress"
            :status="item.status"
            :stroke-width="10"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDownload } from '@/composables/useDownload'

interface OssFile {
  ossId: string
  fileName: string
  fileSize: number
}

interface DownloadProgressItem {
  fileName: string
  progress: number
  status: '' | 'success' | 'exception'
}

const { downloadOss } = useDownload()

const fileList = ref<OssFile[]>([])
const selectedFiles = ref<OssFile[]>([])
const batchDownloading = ref(false)
const progressVisible = ref(false)
const downloadProgress = ref<DownloadProgressItem[]>([])

const handleSelectionChange = (selection: OssFile[]) => {
  selectedFiles.value = selection
}

// 批量下载
const handleBatchDownload = async () => {
  if (selectedFiles.value.length === 0) return

  batchDownloading.value = true
  progressVisible.value = true

  // 初始化进度
  downloadProgress.value = selectedFiles.value.map(file => ({
    fileName: file.fileName,
    progress: 0,
    status: ''
  }))

  // 逐个下载（避免同时下载过多文件）
  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i]
    downloadProgress.value[i].progress = 50

    const [error] = await downloadOss(file.ossId)

    if (error) {
      downloadProgress.value[i].status = 'exception'
      downloadProgress.value[i].progress = 100
    } else {
      downloadProgress.value[i].status = 'success'
      downloadProgress.value[i].progress = 100
    }

    // 添加延迟，避免下载过快
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  batchDownloading.value = false

  // 统计下载结果
  const successCount = downloadProgress.value.filter(p => p.status === 'success').length
  const failCount = downloadProgress.value.filter(p => p.status === 'exception').length

  ElMessage.info(`下载完成：成功 ${successCount} 个，失败 ${failCount} 个`)
}
</script>

<style scoped>
.progress-list {
  max-height: 400px;
  overflow-y: auto;
}

.progress-item {
  margin-bottom: 12px;
}

.file-name {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
```

### 带预览的OSS下载

先预览后下载的场景：

```vue
<template>
  <div>
    <!-- 文件卡片列表 -->
    <div class="file-cards">
      <el-card
        v-for="file in fileList"
        :key="file.ossId"
        class="file-card"
        shadow="hover"
      >
        <!-- 文件预览 -->
        <div class="file-preview" @click="openPreview(file)">
          <el-image
            v-if="isImage(file.fileSuffix)"
            :src="file.url"
            fit="cover"
            :preview-src-list="[file.url]"
            preview-teleported
          />
          <div v-else class="file-icon">
            <el-icon :size="48">
              <Document v-if="isDocument(file.fileSuffix)" />
              <VideoPlay v-else-if="isVideo(file.fileSuffix)" />
              <Headset v-else-if="isAudio(file.fileSuffix)" />
              <Files v-else />
            </el-icon>
            <span class="file-suffix">{{ file.fileSuffix }}</span>
          </div>
        </div>

        <!-- 文件信息 -->
        <div class="file-info">
          <div class="file-name" :title="file.fileName">
            {{ file.fileName }}
          </div>
          <div class="file-meta">
            <span>{{ formatFileSize(file.fileSize) }}</span>
            <span>{{ file.createTime }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="file-actions">
          <el-button
            @click.stop="handleDownloadOss(file.ossId)"
            :loading="downloading"
            type="primary"
            size="small"
          >
            下载
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from '@/composables/useDownload'

const { downloadOss, downloading } = useDownload()

const fileList = ref([])

// 判断文件类型
const isImage = (suffix: string) => ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(suffix.toLowerCase())
const isDocument = (suffix: string) => ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(suffix.toLowerCase())
const isVideo = (suffix: string) => ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(suffix.toLowerCase())
const isAudio = (suffix: string) => ['mp3', 'wav', 'flac', 'aac'].includes(suffix.toLowerCase())

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 预览文件
const openPreview = (file: any) => {
  if (isImage(file.fileSuffix)) return // 图片使用 el-image 的预览
  window.open(file.url, '_blank')
}

// 下载文件
const handleDownloadOss = async (ossId: string) => {
  const [error] = await downloadOss(ossId)
  if (error) {
    ElMessage.error('下载失败')
  }
}
</script>

<style scoped>
.file-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.file-card {
  cursor: pointer;
}

.file-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  margin-bottom: 12px;
}

.file-icon {
  text-align: center;
  color: var(--el-text-color-secondary);
}

.file-suffix {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  text-transform: uppercase;
}

.file-info {
  margin-bottom: 12px;
}

.file-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.file-actions {
  text-align: right;
}
</style>
```

## ZIP文件下载

### 批量下载为ZIP

将多个文件打包成ZIP下载：

```vue
<template>
  <div>
    <el-button
      @click="handleDownloadZip"
      :loading="downloading"
      type="warning"
    >
      <el-icon><FolderOpened /></el-icon>
      批量下载
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'

const { downloadZip, downloading } = useDownload()

const handleDownloadZip = async () => {
  const [error] = await downloadZip(
    '/api/files/batch-download',  // ZIP 下载接口
    '批量文件.zip'                  // 保存的文件名
  )

  if (error) {
    ElMessage.error('打包下载失败')
  }
}
</script>
```

### 选中文件打包下载

根据用户选择的文件进行打包下载：

```vue
<template>
  <div class="zip-download-container">
    <!-- 文件选择区域 -->
    <div class="selection-area">
      <el-checkbox-group v-model="selectedIds">
        <div v-for="file in fileList" :key="file.id" class="file-item">
          <el-checkbox :value="file.id">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatSize(file.size) }}</span>
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </div>

    <!-- 操作区域 -->
    <div class="action-area">
      <div class="selection-info">
        已选择 {{ selectedIds.length }} 个文件
        <span v-if="selectedIds.length > 0">
          （共 {{ formatSize(totalSize) }}）
        </span>
      </div>

      <div class="buttons">
        <el-button @click="selectAll">全选</el-button>
        <el-button @click="clearSelection">清空</el-button>
        <el-button
          @click="handleBatchZipDownload"
          :disabled="selectedIds.length === 0"
          :loading="downloading"
          type="primary"
        >
          打包下载
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDownload } from '@/composables/useDownload'

interface FileItem {
  id: number
  name: string
  size: number
}

const { downloadZip, downloading } = useDownload()

const fileList = ref<FileItem[]>([
  { id: 1, name: '报表1.xlsx', size: 1024 * 100 },
  { id: 2, name: '报表2.xlsx', size: 1024 * 200 },
  { id: 3, name: '文档.docx', size: 1024 * 150 },
  { id: 4, name: '图片.png', size: 1024 * 500 },
])

const selectedIds = ref<number[]>([])

// 计算选中文件的总大小
const totalSize = computed(() => {
  return fileList.value
    .filter(f => selectedIds.value.includes(f.id))
    .reduce((sum, f) => sum + f.size, 0)
})

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 全选
const selectAll = () => {
  selectedIds.value = fileList.value.map(f => f.id)
}

// 清空选择
const clearSelection = () => {
  selectedIds.value = []
}

// 打包下载
const handleBatchZipDownload = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一个文件')
    return
  }

  // 构建下载URL（带查询参数）
  const idsParam = selectedIds.value.join(',')
  const url = `/api/files/zip?ids=${idsParam}`

  const fileName = `批量文件_${new Date().toISOString().split('T')[0]}.zip`

  const [error] = await downloadZip(url, fileName)

  if (!error) {
    // 下载成功后清空选择
    clearSelection()
    ElMessage.success('打包下载成功')
  }
}
</script>

<style scoped>
.zip-download-container {
  padding: 20px;
}

.selection-area {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.file-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  flex: 1;
}

.file-size {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.action-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  color: var(--el-text-color-regular);
}

.buttons {
  display: flex;
  gap: 8px;
}
</style>
```

### 代码生成ZIP下载

专用于代码生成模块的ZIP打包下载：

```vue
<template>
  <div>
    <el-table :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="tableName" label="表名称" />
      <el-table-column prop="tableComment" label="表描述" />
      <el-table-column prop="className" label="实体类名" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button @click="handlePreviewCode(row)" type="primary" link>
            预览
          </el-button>
          <el-button
            @click="handleGenCode(row.tableId)"
            :loading="downloading"
            type="success"
            link
          >
            生成代码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-actions">
      <el-button
        @click="handleBatchGenCode"
        :disabled="selectedTableIds.length === 0"
        :loading="downloading"
        type="primary"
      >
        批量生成 ({{ selectedTableIds.length }})
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from '@/composables/useDownload'

interface TableInfo {
  tableId: number
  tableName: string
  tableComment: string
  className: string
}

const { downloadZip, downloading } = useDownload()

const tableList = ref<TableInfo[]>([])
const selectedTableIds = ref<number[]>([])

const handleSelectionChange = (selection: TableInfo[]) => {
  selectedTableIds.value = selection.map(item => item.tableId)
}

// 生成单个表的代码
const handleGenCode = async (tableId: number) => {
  const [error] = await downloadZip(
    `/tool/gen/download/${tableId}`,
    `code_${tableId}.zip`
  )

  if (!error) {
    ElMessage.success('代码生成成功')
  }
}

// 批量生成代码
const handleBatchGenCode = async () => {
  if (selectedTableIds.value.length === 0) {
    ElMessage.warning('请选择要生成的表')
    return
  }

  const ids = selectedTableIds.value.join(',')

  const [error] = await downloadZip(
    `/tool/gen/batch-download?tableIds=${ids}`,
    `batch_code_${new Date().getTime()}.zip`
  )

  if (!error) {
    ElMessage.success('批量生成成功')
    selectedTableIds.value = []
  }
}

// 预览代码
const handlePreviewCode = (row: TableInfo) => {
  // 打开预览弹窗
}
</script>

<style scoped>
.footer-actions {
  margin-top: 16px;
  text-align: right;
}
</style>
```

## 返回值说明

### useDownload 返回对象

```typescript
const {
  downloading,    // Ref<boolean> - 下载状态，下载过程中为 true
  download,       // 通用下载方法
  exportExcel,    // Excel导出方法（带选择对话框）
  downloadOss,    // OSS文件下载方法
  downloadZip     // ZIP文件下载方法
} = useDownload()
```

### 方法参数详解

#### download(title, url, params?)

通用文件下载方法，使用 POST 请求。

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| title | `string` | 是 | 下载保存的文件名（含扩展名） | `'用户数据.xlsx'` |
| url | `string` | 是 | 下载接口地址 | `'/api/user/export'` |
| params | `object` | 否 | 请求参数，会转换为表单格式发送 | `{ type: 'all', status: 1 }` |

**返回值:** `Promise<[Error | null, null]>`

```typescript
// 使用示例
const [error] = await download('用户列表.xlsx', '/api/user/export', { status: '0' })

if (error) {
  console.error('下载失败:', error.message)
} else {
  console.log('下载成功')
}
```

#### exportExcel(title, url, params)

Excel导出方法，会弹出选择对话框让用户选择导出范围。

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| title | `string` | 是 | 文件标题（不含扩展名和时间戳） | `'用户列表'` |
| url | `string` | 是 | 导出接口地址 | `'/api/user/export'` |
| params | `PageQuery & object` | 是 | 包含分页信息的查询参数 | `{ pageNum: 1, pageSize: 10, userName: '' }` |

**返回值:** `Promise<[Error | null, null]>`

**导出文件名格式:**
- 导出全部: `{title}-全部_{时间戳}.xlsx`
- 导出本页: `{title}-第{pageNum}页_{时间戳}.xlsx`

```typescript
// 使用示例
const queryParams = {
  pageNum: 1,
  pageSize: 10,
  userName: 'admin'
}

const [error] = await exportExcel('用户列表', '/api/user/export', queryParams)

// 用户选择"导出全部"后，实际请求参数变为:
// { pageNum: 1, pageSize: 2147483647, userName: 'admin' }
```

#### downloadOss(ossId)

OSS对象存储文件下载方法。

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| ossId | `string \| number` | 是 | OSS文件唯一标识 | `'123456'` 或 `123456` |

**返回值:** `Promise<[Error | null, R<void> | null]>`

**实现细节:**
- 使用 GET 请求: `/resource/oss/download/{ossId}`
- 自动携带认证头信息
- 从响应头 `download-filename` 获取文件名
- 文件名自动进行 URL 解码

```typescript
// 使用示例
const [error] = await downloadOss('abc123')

// 实际请求: GET /resource/oss/download/abc123
// 响应头: download-filename: %E7%94%A8%E6%88%B7%E6%95%B0%E6%8D%AE.xlsx
// 解码后文件名: 用户数据.xlsx
```

#### downloadZip(url, name)

ZIP压缩文件下载方法。

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| url | `string` | 是 | ZIP文件下载接口（可包含查询参数） | `'/api/files/batch?ids=1,2,3'` |
| name | `string` | 是 | 保存的ZIP文件名（需含 `.zip` 扩展名） | `'批量文件.zip'` |

**返回值:** `Promise<[Error | null, null]>`

```typescript
// 使用示例
const [error] = await downloadZip(
  '/api/gen/batch-download?tableIds=1,2,3',
  'generated_code.zip'
)
```

## 高级用法

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
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="nickName" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from '@/composables/useDownload'

interface User {
  id: number
  userName: string
  nickName: string
  email: string
}

const { download, downloading } = useDownload()

const userList = ref<User[]>([])
const selectedUsers = ref<User[]>([])

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const exportSelected = async () => {
  const userIds = selectedUsers.value.map(user => user.id)

  const [error] = await download(
    `选中用户_${userIds.length}条.xlsx`,
    '/api/user/export-selected',
    { userIds }
  )

  if (!error) {
    ElMessage.success('导出成功')
  }
}
</script>
```

### 自定义下载提示

```typescript
import { useDownload } from '@/composables/useDownload'
import { showLoading, hideLoading, showMsgSuccess, showMsgError } from '@/utils/modal'

const { download } = useDownload()

const customDownload = async () => {
  try {
    // 显示自定义加载提示
    showLoading('正在生成报表，预计需要30秒...')

    const [error] = await download(
      '自定义报表.pdf',
      '/api/report/generate',
      {
        format: 'pdf',
        includeCharts: true,
        dateRange: ['2024-01-01', '2024-12-31']
      }
    )

    if (!error) {
      showMsgSuccess('报表生成完成，已开始下载！')
    } else {
      showMsgError('报表生成失败，请稍后重试')
    }
  } finally {
    hideLoading()
  }
}
```

### 下载重试机制

```vue
<template>
  <div>
    <el-button @click="handleDownloadWithRetry" :loading="downloading">
      下载（自动重试）
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from '@/composables/useDownload'

const { download, downloading } = useDownload()

const MAX_RETRY = 3
const RETRY_DELAY = 2000 // 2秒

const handleDownloadWithRetry = async () => {
  let retryCount = 0

  while (retryCount < MAX_RETRY) {
    const [error] = await download('数据.xlsx', '/api/data/export', {})

    if (!error) {
      return // 下载成功，退出
    }

    retryCount++

    if (retryCount < MAX_RETRY) {
      ElMessage.warning(`下载失败，${RETRY_DELAY / 1000}秒后进行第${retryCount + 1}次重试...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
    }
  }

  ElMessage.error(`下载失败，已重试${MAX_RETRY}次`)
}
</script>
```

### 下载队列管理

```vue
<template>
  <div>
    <el-button @click="addToQueue('file1.xlsx', '/api/export/1')">
      添加文件1到队列
    </el-button>
    <el-button @click="addToQueue('file2.xlsx', '/api/export/2')">
      添加文件2到队列
    </el-button>
    <el-button @click="startDownloadQueue" :loading="isProcessing" type="primary">
      开始下载 ({{ downloadQueue.length }})
    </el-button>

    <!-- 队列状态 -->
    <div v-if="downloadQueue.length > 0" class="queue-status">
      <div v-for="(item, index) in downloadQueue" :key="index" class="queue-item">
        <span>{{ item.fileName }}</span>
        <el-tag :type="getStatusType(item.status)" size="small">
          {{ item.status }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from '@/composables/useDownload'

interface QueueItem {
  fileName: string
  url: string
  params?: object
  status: 'pending' | 'downloading' | 'success' | 'failed'
}

const { download } = useDownload()

const downloadQueue = ref<QueueItem[]>([])
const isProcessing = ref(false)

// 添加到下载队列
const addToQueue = (fileName: string, url: string, params?: object) => {
  downloadQueue.value.push({
    fileName,
    url,
    params,
    status: 'pending'
  })
  ElMessage.success(`已添加 ${fileName} 到下载队列`)
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    downloading: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

// 开始处理下载队列
const startDownloadQueue = async () => {
  if (downloadQueue.value.length === 0) {
    ElMessage.warning('下载队列为空')
    return
  }

  isProcessing.value = true

  for (const item of downloadQueue.value) {
    if (item.status !== 'pending') continue

    item.status = 'downloading'

    const [error] = await download(item.fileName, item.url, item.params)

    item.status = error ? 'failed' : 'success'

    // 每个文件下载后等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  isProcessing.value = false

  // 统计结果
  const successCount = downloadQueue.value.filter(i => i.status === 'success').length
  const failedCount = downloadQueue.value.filter(i => i.status === 'failed').length

  ElMessage.info(`下载完成：成功 ${successCount} 个，失败 ${failedCount} 个`)

  // 清除已完成的任务
  downloadQueue.value = downloadQueue.value.filter(i => i.status === 'failed')
}
</script>

<style scoped>
.queue-status {
  margin-top: 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.queue-item:last-child {
  border-bottom: none;
}
</style>
```

### 大文件分片下载

对于超大文件，可以实现分片下载：

```typescript
import { ref } from 'vue'
import { useHttp } from '@/composables/useHttp'

const http = useHttp()

interface ChunkInfo {
  index: number
  start: number
  end: number
  blob: Blob | null
  status: 'pending' | 'downloading' | 'success' | 'failed'
}

export const useLargeFileDownload = () => {
  const progress = ref(0)
  const downloading = ref(false)

  const downloadLargeFile = async (url: string, fileName: string) => {
    downloading.value = true
    progress.value = 0

    try {
      // 1. 获取文件大小
      const [headErr, headRes] = await http.head(url)
      if (headErr) throw headErr

      const fileSize = parseInt(headRes.headers['content-length'], 10)
      const chunkSize = 1024 * 1024 * 5 // 5MB per chunk
      const chunkCount = Math.ceil(fileSize / chunkSize)

      // 2. 创建分片任务
      const chunks: ChunkInfo[] = []
      for (let i = 0; i < chunkCount; i++) {
        chunks.push({
          index: i,
          start: i * chunkSize,
          end: Math.min((i + 1) * chunkSize - 1, fileSize - 1),
          blob: null,
          status: 'pending'
        })
      }

      // 3. 并发下载分片（限制并发数）
      const concurrency = 3
      let completed = 0

      const downloadChunk = async (chunk: ChunkInfo) => {
        chunk.status = 'downloading'

        const [err, data] = await http.get(url, {}, {
          responseType: 'blob',
          headers: {
            Range: `bytes=${chunk.start}-${chunk.end}`
          }
        })

        if (err) {
          chunk.status = 'failed'
          throw err
        }

        chunk.blob = data
        chunk.status = 'success'
        completed++
        progress.value = Math.round((completed / chunkCount) * 100)
      }

      // 使用队列控制并发
      const queue = [...chunks]
      const workers = Array(concurrency).fill(null).map(async () => {
        while (queue.length > 0) {
          const chunk = queue.shift()
          if (chunk) {
            await downloadChunk(chunk)
          }
        }
      })

      await Promise.all(workers)

      // 4. 合并分片
      const blobs = chunks
        .sort((a, b) => a.index - b.index)
        .map(c => c.blob!)

      const mergedBlob = new Blob(blobs)

      // 5. 触发下载
      const downloadUrl = URL.createObjectURL(mergedBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = fileName
      a.click()
      URL.revokeObjectURL(downloadUrl)

      return [null, null]
    } catch (error) {
      return [error, null]
    } finally {
      downloading.value = false
    }
  }

  return {
    progress,
    downloading,
    downloadLargeFile
  }
}
```

## 类型定义

```typescript
/**
 * 分页查询参数接口
 */
interface PageQuery {
  pageNum?: number
  pageSize?: number
  [key: string]: any
}

/**
 * 统一响应结果类型
 * [error, data] 元组格式
 */
type Result<T> = Promise<[Error | null, T | null]>

/**
 * 后端统一响应格式
 */
interface R<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * useDownload 返回类型
 */
interface UseDownloadReturn {
  /** 下载状态 */
  downloading: Ref<boolean>

  /** 通用下载方法 */
  download: (title: string, url: string, params?: any) => Result<void>

  /** Excel导出方法（带选择对话框） */
  exportExcel: <T extends Partial<PageQuery>>(
    title: string,
    url: string,
    params: T
  ) => Result<void>

  /** OSS文件下载方法 */
  downloadOss: (ossId: string | number) => Result<R<void>>

  /** ZIP文件下载方法 */
  downloadZip: (url: string, name: string) => Result<void>
}

/**
 * 使用示例类型
 */
// 定义导出参数类型
interface UserExportParams extends PageQuery {
  userName?: string
  status?: string
  deptId?: number
}

// 使用时具有完整类型推导
const params: UserExportParams = {
  pageNum: 1,
  pageSize: 10,
  userName: 'admin'
}

const [error] = await exportExcel<UserExportParams>('用户列表', '/api/user/export', params)
```

## 注意事项

### 文件大小限制

- 大文件下载可能需要较长时间，建议添加进度提示
- 超大文件（>100MB）建议使用分片下载或提供直接下载链接
- 服务端需要配置合适的超时时间

```typescript
// 对于大文件，可以设置更长的超时时间
const [error] = await http.post(url, params, {
  timeout: 600000, // 10分钟
  responseType: 'blob'
})
```

### 浏览器兼容性

- 使用 FileSaver.js 确保跨浏览器兼容性
- IE浏览器可能需要额外的 polyfill
- Safari 浏览器对某些 Blob 类型可能有限制

```typescript
// 检测浏览器是否支持 Blob
const isBlobSupported = () => {
  try {
    return !!new Blob()
  } catch (e) {
    return false
  }
}
```

### 错误处理

```typescript
const handleDownload = async () => {
  const [error] = await download('file.xlsx', '/api/export')

  if (error) {
    // 根据错误类型进行处理
    const message = error.message || ''

    if (message.includes('网络') || message.includes('Network')) {
      showMsgError('网络连接失败，请检查网络后重试')
    } else if (message.includes('权限') || message.includes('403')) {
      showMsgError('没有下载权限，请联系管理员')
    } else if (message.includes('超时') || message.includes('timeout')) {
      showMsgError('下载超时，请稍后重试')
    } else if (message.includes('404')) {
      showMsgError('文件不存在')
    } else {
      showMsgError('下载失败，请重试')
    }

    // 上报错误
    console.error('Download error:', error)
  }
}
```

### 防重复下载

```vue
<template>
  <!-- downloading 状态会自动防止重复点击 -->
  <el-button
    @click="handleDownload"
    :loading="downloading"
    :disabled="downloading"
  >
    {{ downloading ? '下载中...' : '下载' }}
  </el-button>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'

const { download, downloading } = useDownload()

const handleDownload = async () => {
  // downloading 会在下载开始时自动设置为 true
  // 下载完成或失败后自动设置为 false
  await download('file.xlsx', '/api/export', {})
}
</script>
```

### 内存管理

对于大文件下载，需要注意内存管理：

```typescript
// 下载完成后，Blob URL 应该被释放
const downloadWithCleanup = async () => {
  const [error, response] = await http.get(url, {}, { responseType: 'blob' })

  if (!error && response) {
    const blob = new Blob([response.data])
    const blobUrl = URL.createObjectURL(blob)

    try {
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'file.xlsx'
      a.click()
    } finally {
      // 释放 Blob URL，防止内存泄漏
      URL.revokeObjectURL(blobUrl)
    }
  }
}
```

## 最佳实践

### 1. 统一的下载按钮状态

```vue
<template>
  <el-button
    @click="handleDownload"
    :loading="downloading"
    :disabled="downloading || !canDownload"
    type="primary"
  >
    <template #loading>
      <el-icon class="is-loading"><Loading /></el-icon>
    </template>
    <el-icon v-if="!downloading"><Download /></el-icon>
    {{ downloading ? '正在下载...' : '导出数据' }}
  </el-button>
</template>
```

### 2. 下载前的数据验证

```typescript
const handleExport = async () => {
  // 验证是否有数据
  if (dataList.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  // 验证必要参数
  if (!queryParams.startDate || !queryParams.endDate) {
    ElMessage.warning('请先选择日期范围')
    return
  }

  // 验证日期范围
  const daysDiff = dayjs(queryParams.endDate).diff(queryParams.startDate, 'day')
  if (daysDiff > 365) {
    ElMessage.warning('日期范围不能超过一年')
    return
  }

  // 开始导出
  const [error] = await exportExcel('数据报表', '/api/report/export', queryParams)
}
```

### 3. 封装业务导出方法

```typescript
// api/modules/user.ts
import { useDownload } from '@/composables/useDownload'

export const useUserExport = () => {
  const { download, exportExcel, downloading } = useDownload()

  // 导出用户列表
  const exportUserList = (params: UserQuery) => {
    return exportExcel('用户列表', '/api/user/export', params)
  }

  // 导出用户详情
  const exportUserDetail = (userId: number) => {
    return download(
      `用户详情_${userId}.xlsx`,
      `/api/user/export/${userId}`,
      {}
    )
  }

  // 导出用户模板
  const exportUserTemplate = () => {
    return download('用户导入模板.xlsx', '/api/user/template', {})
  }

  return {
    downloading,
    exportUserList,
    exportUserDetail,
    exportUserTemplate
  }
}

// 在组件中使用
const { downloading, exportUserList } = useUserExport()
```

### 4. 统一的导出权限控制

```vue
<template>
  <el-button
    v-hasPermi="['system:user:export']"
    @click="handleExport"
    :loading="downloading"
  >
    导出
  </el-button>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'

const { exportExcel, downloading } = useDownload()
</script>
```

### 5. 导出操作日志记录

```typescript
const handleExportWithLog = async () => {
  const startTime = Date.now()

  const [error] = await exportExcel('操作日志', '/api/log/export', queryParams)

  const duration = Date.now() - startTime

  // 记录导出操作
  if (!error) {
    await recordOperation({
      type: 'export',
      module: 'log',
      params: queryParams,
      duration,
      success: true
    })
  } else {
    await recordOperation({
      type: 'export',
      module: 'log',
      params: queryParams,
      duration,
      success: false,
      error: error.message
    })
  }
}
```

## 常见问题

### 1. 下载的文件内容为空或乱码

**问题原因:**
- 响应头 `Content-Type` 设置不正确
- 前端未正确处理 Blob 数据
- 服务端返回的是错误信息而非文件

**解决方案:**

```typescript
// 检查响应是否为有效的 Blob
const isBlob = (data: { type: string }): boolean => {
  return data?.type !== 'application/json'
}

// 如果不是 Blob，解析错误信息
const printErrMsg = async (data: Blob) => {
  try {
    const blob = new Blob([data])
    const resText = await blob.text()
    const rspObj = JSON.parse(resText)
    showMsgError(rspObj.msg)
  } catch (error) {
    showMsgError('解析响应失败')
  }
}
```

### 2. 导出Excel中文文件名乱码

**问题原因:**
- 服务端响应头中的文件名未正确编码

**解决方案:**

```typescript
// 服务端需要对文件名进行 URL 编码
// Java: URLEncoder.encode(fileName, "UTF-8")

// 前端解码
const fileName = decodeURIComponent(response.headers['download-filename'] as string)
```

### 3. 大文件下载失败

**问题原因:**
- 请求超时
- 内存不足
- 网络不稳定

**解决方案:**

```typescript
// 1. 增加超时时间
const [err, data] = await http.post(url, params, {
  timeout: 600000, // 10分钟
  responseType: 'blob'
})

// 2. 使用流式下载（需要服务端支持）
const downloadStream = async (url: string, fileName: string) => {
  const response = await fetch(url)
  const reader = response.body?.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break
    chunks.push(value)
  }

  const blob = new Blob(chunks)
  FileSaver.saveAs(blob, fileName)
}
```

### 4. 多个下载按钮共享同一个 downloading 状态

**问题原因:**
- 所有按钮使用同一个 useDownload 实例

**解决方案:**

```vue
<script setup lang="ts">
// 为不同的下载场景创建独立的实例
const userDownload = useDownload()
const orderDownload = useDownload()
const reportDownload = useDownload()

// 使用各自的 downloading 状态
const handleUserExport = async () => {
  await userDownload.exportExcel('用户', '/api/user/export', {})
}

const handleOrderExport = async () => {
  await orderDownload.exportExcel('订单', '/api/order/export', {})
}
</script>

<template>
  <el-button :loading="userDownload.downloading.value">导出用户</el-button>
  <el-button :loading="orderDownload.downloading.value">导出订单</el-button>
</template>
```

### 5. 下载文件类型不正确

**问题原因:**
- Blob 的 MIME 类型设置不正确

**解决方案:**

```typescript
// 根据文件类型设置正确的 MIME 类型
const getMimeType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

// 创建 Blob 时指定类型
const blob = new Blob([data], { type: getMimeType(fileName) })
```
