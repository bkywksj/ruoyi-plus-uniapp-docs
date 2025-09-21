# usePrint

打印功能组合函数，提供页面打印、PDF生成、打印预览和打印设置等功能，支持自定义打印样式和多种打印模式。

## 📋 功能特性

- **页面打印**: 打印当前页面或指定区域
- **PDF生成**: 将页面内容生成PDF文件
- **打印预览**: 打印前预览效果
- **自定义样式**: 专用打印样式表
- **批量打印**: 支持多页面批量打印
- **打印设置**: 纸张大小、方向、边距等配置

## 🎯 基础用法

### 简单页面打印

```vue
<template>
  <div>
    <div id="print-content">
      <h1>打印标题</h1>
      <p>这是要打印的内容...</p>
      <table class="print-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>部门</th>
            <th>薪资</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.department }}</td>
            <td>{{ item.salary }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="print-actions no-print">
      <el-button @click="printPage" type="primary">
        打印页面
      </el-button>

      <el-button @click="printArea('#print-content')">
        打印指定区域
      </el-button>

      <el-button @click="showPreview">
        打印预览
      </el-button>

      <el-button @click="exportToPDF">
        导出PDF
      </el-button>
    </div>

    <!-- 打印预览对话框 -->
    <el-dialog v-model="previewVisible" title="打印预览" width="80%">
      <div v-html="previewContent" class="preview-container"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { usePrint } from '@/composables/usePrint'

const {
  printPage,
  printArea,
  exportToPDF,
  showPreview,
  previewVisible,
  previewContent
} = usePrint()

const tableData = ref([
  { id: 1, name: '张三', department: '技术部', salary: '15000' },
  { id: 2, name: '李四', department: '市场部', salary: '12000' }
])
</script>

<style>
/* 打印专用样式 */
@media print {
  .no-print {
    display: none !important;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
  }

  .print-table th,
  .print-table td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
  }
}
</style>
```

### 自定义打印配置

```vue
<template>
  <div>
    <!-- 打印设置面板 -->
    <el-card class="print-settings">
      <template #header>
        <span>打印设置</span>
      </template>

      <el-form :model="printConfig" label-width="100px">
        <el-form-item label="纸张大小">
          <el-select v-model="printConfig.paperSize">
            <el-option label="A4" value="A4" />
            <el-option label="A3" value="A3" />
            <el-option label="Letter" value="Letter" />
          </el-select>
        </el-form-item>

        <el-form-item label="方向">
          <el-radio-group v-model="printConfig.orientation">
            <el-radio label="portrait">纵向</el-radio>
            <el-radio label="landscape">横向</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="边距">
          <el-input-number
            v-model="printConfig.margin"
            :min="0"
            :max="50"
            label="边距(mm)" />
        </el-form-item>

        <el-form-item label="打印选项">
          <el-checkbox-group v-model="printConfig.options">
            <el-checkbox label="headerFooter">页眉页脚</el-checkbox>
            <el-checkbox label="background">背景图形</el-checkbox>
            <el-checkbox label="selection">仅选中内容</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <div class="settings-actions">
        <el-button @click="printWithConfig" type="primary">
          应用设置并打印
        </el-button>
        <el-button @click="saveSettings">
          保存设置
        </el-button>
        <el-button @click="resetSettings">
          重置设置
        </el-button>
      </div>
    </el-card>

    <!-- 要打印的内容 -->
    <div id="custom-print-area" class="print-content">
      <h2>自定义打印内容</h2>
      <p>这里是按照自定义设置打印的内容...</p>
    </div>
  </div>
</template>

<script setup>
import { usePrint } from '@/composables/usePrint'

const {
  printConfig,
  printWithConfig,
  saveSettings,
  resetSettings,
  setPrintStyle
} = usePrint()

// 设置自定义打印样式
const customPrintStyle = `
  @page {
    size: A4 portrait;
    margin: 20mm;
  }

  .print-content {
    font-family: "SimSun", serif;
    font-size: 14px;
    line-height: 1.6;
  }

  .print-content h2 {
    color: #333;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
  }
`

setPrintStyle(customPrintStyle)
</script>
```

## 📄 PDF生成

### 基础PDF导出

```vue
<template>
  <div>
    <div ref="pdfContent" class="pdf-content">
      <h1>PDF文档标题</h1>
      <div class="content-section">
        <h2>章节一</h2>
        <p>这是第一章节的内容...</p>
      </div>

      <div class="content-section">
        <h2>章节二</h2>
        <p>这是第二章节的内容...</p>

        <!-- 图表 -->
        <div ref="chartContainer" class="chart-container">
          <!-- ECharts图表 -->
        </div>
      </div>
    </div>

    <div class="pdf-actions">
      <el-button @click="generatePDF" type="primary">
        生成PDF
      </el-button>

      <el-button @click="generatePDFWithOptions">
        高级PDF生成
      </el-button>

      <el-button @click="batchExportPDF">
        批量导出PDF
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { usePrint } from '@/composables/usePrint'

const {
  generatePDF,
  generatePDFWithOptions,
  batchExportPDF,
  setPDFOptions
} = usePrint()

const pdfContent = ref()

// 基础PDF生成
const generatePDF = () => {
  exportToPDF({
    element: pdfContent.value,
    filename: 'document.pdf'
  })
}

// 高级PDF生成选项
const generatePDFWithOptions = () => {
  const options = {
    element: pdfContent.value,
    filename: '高级文档.pdf',
    format: 'A4',
    orientation: 'portrait',
    border: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    header: {
      height: '20mm',
      contents: '<div style="text-align: center;">{{page}}/{{pages}}</div>'
    },
    footer: {
      height: '20mm',
      contents: '<div style="text-align: center;">© 2024 公司名称</div>'
    },
    quality: 2, // 图片质量
    type: 'pdf',
    timeout: 30000
  }

  exportToPDF(options)
}

// 批量PDF导出
const batchExportPDF = () => {
  const documents = [
    {
      element: '#doc1',
      filename: '文档1.pdf'
    },
    {
      element: '#doc2',
      filename: '文档2.pdf'
    }
  ]

  batchExportPDF(documents)
}
</script>
```

### PDF水印和安全

```vue
<script setup>
import { usePrint } from '@/composables/usePrint'

const {
  addWatermark,
  setPDFSecurity,
  generateSecurePDF
} = usePrint()

// 添加水印
const createPDFWithWatermark = () => {
  const watermarkOptions = {
    text: '机密文档',
    opacity: 0.3,
    fontSize: 48,
    color: '#ff0000',
    angle: -45,
    position: 'center'
  }

  addWatermark(watermarkOptions)

  generatePDF({
    element: '#secure-content',
    filename: '带水印文档.pdf'
  })
}

// PDF安全设置
const createSecurePDF = () => {
  const securityOptions = {
    userPassword: 'user123',
    ownerPassword: 'owner456',
    permissions: {
      printing: 'highResolution', // 'lowResolution' | 'highResolution' | false
      modifying: false,
      copying: false,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false
    }
  }

  generateSecurePDF({
    element: '#secure-content',
    filename: '加密文档.pdf',
    security: securityOptions
  })
}
</script>
```

## 🖼️ 打印预览

### 自定义预览组件

```vue
<template>
  <div>
    <!-- 触发预览 -->
    <el-button @click="openPreview" type="primary">
      打印预览
    </el-button>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="打印预览"
      width="90%"
      top="5vh"
      :close-on-click-modal="false">

      <div class="preview-toolbar">
        <el-button-group>
          <el-button @click="zoomIn" :disabled="zoom >= 200">
            <el-icon><ZoomIn /></el-icon>
            放大
          </el-button>
          <el-button @click="zoomOut" :disabled="zoom <= 50">
            <el-icon><ZoomOut /></el-icon>
            缩小
          </el-button>
          <el-button @click="resetZoom">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-button-group>

        <span class="zoom-info">{{ zoom }}%</span>

        <el-button-group>
          <el-button @click="prevPage" :disabled="!hasPrevPage">
            <el-icon><ArrowLeft /></el-icon>
            上一页
          </el-button>
          <el-button @click="nextPage" :disabled="!hasNextPage">
            <el-icon><ArrowRight /></el-icon>
            下一页
          </el-button>
        </el-button-group>

        <span class="page-info">{{ currentPage }}/{{ totalPages }}</span>
      </div>

      <div class="preview-container" :style="{ transform: `scale(${zoom / 100})` }">
        <div v-html="previewContent" class="preview-page"></div>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">
          取消
        </el-button>
        <el-button @click="confirmPrint" type="primary">
          确认打印
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { usePrint } from '@/composables/usePrint'

const {
  // 预览相关
  previewVisible,
  previewContent,
  openPreview,

  // 缩放控制
  zoom,
  zoomIn,
  zoomOut,
  resetZoom,

  // 分页控制
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  prevPage,
  nextPage,

  // 确认打印
  confirmPrint
} = usePrint()
</script>

<style scoped>
.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.preview-container {
  max-height: 60vh;
  overflow: auto;
  border: 1px solid #ddd;
  background: white;
  transform-origin: top left;
}

.preview-page {
  min-height: 100%;
  padding: 20px;
}
</style>
```

## 🔧 高级功能

### 批量打印管理

```vue
<template>
  <div>
    <el-card class="batch-print-manager">
      <template #header>
        <span>批量打印管理</span>
      </template>

      <!-- 打印队列 -->
      <div class="print-queue">
        <h3>打印队列</h3>
        <el-table :data="printQueue" style="width: 100%">
          <el-table-column prop="name" label="文档名称" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button @click="pauseJob(row.id)" size="small">
                暂停
              </el-button>
              <el-button @click="cancelJob(row.id)" size="small" type="danger">
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 批量操作 -->
      <div class="batch-actions">
        <el-button @click="addToBatch" type="primary">
          添加到批量打印
        </el-button>
        <el-button @click="startBatchPrint" :disabled="printQueue.length === 0">
          开始批量打印
        </el-button>
        <el-button @click="clearQueue">
          清空队列
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { usePrint } from '@/composables/usePrint'

const {
  // 批量打印
  printQueue,
  addToBatch,
  startBatchPrint,
  clearQueue,

  // 任务控制
  pauseJob,
  cancelJob,
  resumeJob,

  // 状态监听
  onJobStatusChange,
  onBatchComplete
} = usePrint()

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'pending': '',
    'printing': 'warning',
    'completed': 'success',
    'failed': 'danger',
    'paused': 'info'
  }
  return statusMap[status] || ''
}

// 监听任务状态变化
onJobStatusChange((job) => {
  console.log(`任务 ${job.name} 状态变更为: ${job.status}`)
})

// 监听批量打印完成
onBatchComplete((results) => {
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  ElMessage.success(`批量打印完成: ${successCount}/${totalCount} 成功`)
})
</script>
```

### 打印模板系统

```vue
<script setup>
import { usePrint } from '@/composables/usePrint'

const {
  createTemplate,
  useTemplate,
  getTemplate,
  listTemplates,
  deleteTemplate
} = usePrint()

// 创建打印模板
const createReportTemplate = () => {
  const template = {
    name: '财务报表模板',
    description: '标准财务报表打印模板',
    style: `
      @page {
        size: A4 portrait;
        margin: 25mm;
      }

      .report-header {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .report-table {
        width: 100%;
        border-collapse: collapse;
      }

      .report-table th,
      .report-table td {
        border: 1px solid #000;
        padding: 8px;
        text-align: right;
      }
    `,
    layout: `
      <div class="report-header">
        {{title}}
      </div>

      <div class="report-meta">
        <p>报表日期: {{date}}</p>
        <p>制表人: {{creator}}</p>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>项目</th>
            <th>金额</th>
            <th>比例</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{name}}</td>
            <td>{{amount}}</td>
            <td>{{percentage}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    `,
    variables: {
      title: '月度财务报表',
      date: '2024-12-20',
      creator: '财务部',
      items: []
    }
  }

  createTemplate(template)
}

// 使用模板打印
const printWithTemplate = () => {
  const data = {
    title: '2024年12月财务报表',
    date: '2024-12-20',
    creator: '张三',
    items: [
      { name: '收入', amount: '1,000,000', percentage: '100%' },
      { name: '成本', amount: '600,000', percentage: '60%' },
      { name: '利润', amount: '400,000', percentage: '40%' }
    ]
  }

  useTemplate('财务报表模板', data)
}
</script>
```

## 📚 API 参考

### 基础打印

| 方法 | 类型 | 描述 |
|------|------|------|
| printPage | () => void | 打印整个页面 |
| printArea | (selector: string) => void | 打印指定区域 |
| printElement | (element: HTMLElement) => void | 打印指定元素 |

### PDF功能

| 方法 | 类型 | 描述 |
|------|------|------|
| exportToPDF | (options: PDFOptions) => Promise\<void\> | 导出为PDF |
| generatePDF | (config: PDFConfig) => Promise\<Blob\> | 生成PDF数据 |
| batchExportPDF | (docs: PDFDocument[]) => Promise\<void\> | 批量PDF导出 |

### 预览功能

| 属性/方法 | 类型 | 描述 |
|----------|------|------|
| previewVisible | Ref\<boolean\> | 预览对话框可见性 |
| previewContent | Ref\<string\> | 预览内容HTML |
| showPreview | (element?: string) => void | 显示打印预览 |

### 配置管理

| 方法 | 类型 | 描述 |
|------|------|------|
| setPrintConfig | (config: PrintConfig) => void | 设置打印配置 |
| getPrintConfig | () => PrintConfig | 获取当前打印配置 |
| resetPrintConfig | () => void | 重置打印配置 |

## 🎯 最佳实践

### 打印样式优化

1. **专用打印样式**：使用`@media print`定义专用样式
2. **隐藏无关元素**：使用`.no-print`类隐藏不需要打印的元素
3. **页面布局**：合理设置页边距和页面尺寸
4. **字体选择**：使用打印友好的字体

### 性能优化

1. **图片优化**：适当压缩图片，使用矢量图标
2. **分页处理**：避免表格跨页断裂
3. **内存管理**：及时清理打印资源
4. **异步处理**：大文档使用异步生成

### 用户体验

1. **进度反馈**：显示打印/PDF生成进度
2. **错误处理**：友好的错误提示和重试机制
3. **预览功能**：提供打印前预览
4. **设置保存**：记住用户的打印偏好设置