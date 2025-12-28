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

## ❓ 常见问题

### 1. 打印内容显示不完整或样式丢失

**问题描述**

调用打印功能后，打印预览或实际打印结果中部分样式丢失，如背景色、边框、图标等不显示，或者内容被截断。

**问题原因**

- 浏览器默认禁用背景色和背景图片打印以节省墨水
- 打印样式表 `@media print` 未正确配置
- 动态渲染内容未完成时就触发打印
- CSS选择器优先级问题导致样式被覆盖
- 使用了浏览器不支持的打印CSS属性

**解决方案**

```vue
<template>
  <div>
    <!-- 打印区域 -->
    <div ref="printAreaRef" class="print-area">
      <div class="print-header">
        <img :src="logoUrl" class="logo print-logo" />
        <h1>{{ documentTitle }}</h1>
      </div>
      <div class="print-content">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.prop">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableData" :key="row.id">
              <td v-for="col in columns" :key="col.prop">{{ row[col.prop] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <el-button @click="safePrint" type="primary">安全打印</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const printAreaRef = ref<HTMLElement>()
const logoUrl = ref('/logo.png')
const documentTitle = ref('报表标题')
const columns = ref([
  { prop: 'name', label: '姓名' },
  { prop: 'dept', label: '部门' }
])
const tableData = ref([
  { id: 1, name: '张三', dept: '技术部' }
])

// ❌ 错误做法 - 直接打印可能导致内容不完整
const wrongPrint = () => {
  window.print()
}

// ✅ 正确做法 - 等待内容渲染完成后再打印
const safePrint = async () => {
  // 1. 等待动态内容渲染完成
  await nextTick()

  // 2. 等待图片加载完成
  const images = printAreaRef.value?.querySelectorAll('img') || []
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
    })
  )

  // 3. 小延迟确保样式应用
  await new Promise(resolve => setTimeout(resolve, 100))

  // 4. 执行打印
  window.print()
}
</script>

<style lang="scss">
/* ✅ 正确的打印样式配置 */
@media print {
  /* 强制打印背景色和图片 */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* 隐藏非打印元素 */
  .no-print,
  .el-button,
  nav,
  footer {
    display: none !important;
  }

  /* 确保打印区域样式 */
  .print-area {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }

  /* Logo图片确保显示 */
  .print-logo {
    display: block !important;
    max-width: 150px;
    height: auto;
  }

  /* 表格样式 */
  .data-table {
    width: 100% !important;
    border-collapse: collapse !important;

    th, td {
      border: 1px solid #000 !important;
      padding: 8px !important;
      background-color: transparent !important;
    }

    th {
      background-color: #f0f0f0 !important;
      font-weight: bold !important;
    }
  }
}
</style>
```

**关键要点**：
- 使用 `-webkit-print-color-adjust: exact` 强制打印背景
- 等待所有图片加载完成后再触发打印
- 为打印样式使用 `!important` 确保优先级
- 使用 `@media print` 定义专用打印样式

---

### 2. PDF生成时图片无法显示

**问题描述**

使用html2canvas或类似库生成PDF时，页面中的图片显示为空白或报跨域错误，特别是外部图片或Canvas图表。

**问题原因**

- 图片跨域(CORS)导致无法被html2canvas捕获
- 图片未加载完成就开始生成PDF
- SVG图标无法正确转换为Canvas
- Base64图片格式不正确
- 服务器未配置正确的CORS响应头

**解决方案**

```typescript
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface PDFGeneratorOptions {
  element: HTMLElement
  filename: string
  scale?: number
  useCORS?: boolean
  allowTaint?: boolean
  imageTimeout?: number
}

/**
 * 安全的PDF生成器
 * 处理图片跨域和加载问题
 */
class SafePDFGenerator {
  private options: PDFGeneratorOptions

  constructor(options: PDFGeneratorOptions) {
    this.options = {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
      ...options
    }
  }

  /**
   * 预处理图片 - 转换为Base64
   */
  private async preprocessImages(element: HTMLElement): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>()
    const images = element.querySelectorAll('img')

    for (const img of Array.from(images)) {
      const src = img.src
      if (!src || src.startsWith('data:')) continue

      try {
        const base64 = await this.imageToBase64(src)
        imageMap.set(src, base64)
        img.src = base64
      } catch (error) {
        console.warn(`图片加载失败: ${src}`, error)
        // 设置占位图
        img.src = this.createPlaceholderImage(img.width, img.height)
      }
    }

    return imageMap
  }

  /**
   * 图片转Base64
   */
  private async imageToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      const timeoutId = setTimeout(() => {
        reject(new Error('图片加载超时'))
      }, this.options.imageTimeout)

      img.onload = () => {
        clearTimeout(timeoutId)
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('无法创建Canvas上下文'))
            return
          }

          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        clearTimeout(timeoutId)
        reject(new Error(`图片加载失败: ${url}`))
      }

      // 添加时间戳避免缓存问题
      img.src = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`
    })
  }

  /**
   * 创建占位图
   */
  private createPlaceholderImage(width: number, height: number): string {
    const canvas = document.createElement('canvas')
    canvas.width = width || 100
    canvas.height = height || 100

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#999'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('图片加载失败', canvas.width / 2, canvas.height / 2)
    }

    return canvas.toDataURL('image/png')
  }

  /**
   * SVG转换为Canvas
   */
  private async convertSVGToCanvas(element: HTMLElement): Promise<void> {
    const svgs = element.querySelectorAll('svg')

    for (const svg of Array.from(svgs)) {
      try {
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = svg.clientWidth || 100
            canvas.height = svg.clientHeight || 100

            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0)
              const parent = svg.parentNode
              if (parent) {
                const replacement = document.createElement('img')
                replacement.src = canvas.toDataURL('image/png')
                replacement.style.width = `${canvas.width}px`
                replacement.style.height = `${canvas.height}px`
                parent.replaceChild(replacement, svg)
              }
            }
            URL.revokeObjectURL(url)
            resolve()
          }
          img.onerror = reject
          img.src = url
        })
      } catch (error) {
        console.warn('SVG转换失败', error)
      }
    }
  }

  /**
   * 生成PDF
   */
  async generate(): Promise<Blob> {
    const { element, filename, scale, useCORS, allowTaint } = this.options

    // 1. 克隆元素避免修改原始DOM
    const clonedElement = element.cloneNode(true) as HTMLElement
    document.body.appendChild(clonedElement)
    clonedElement.style.position = 'absolute'
    clonedElement.style.left = '-9999px'
    clonedElement.style.top = '0'

    try {
      // 2. 预处理图片
      await this.preprocessImages(clonedElement)

      // 3. 转换SVG
      await this.convertSVGToCanvas(clonedElement)

      // 4. 等待渲染
      await new Promise(resolve => setTimeout(resolve, 200))

      // 5. 使用html2canvas生成Canvas
      const canvas = await html2canvas(clonedElement, {
        scale,
        useCORS,
        allowTaint,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 确保克隆文档中的样式正确应用
          const clonedEl = clonedDoc.body.querySelector('[data-pdf-content]')
          if (clonedEl) {
            (clonedEl as HTMLElement).style.display = 'block'
          }
        }
      })

      // 6. 生成PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)

      return pdf.output('blob')
    } finally {
      // 7. 清理临时元素
      document.body.removeChild(clonedElement)
    }
  }

  /**
   * 下载PDF
   */
  async download(): Promise<void> {
    const blob = await this.generate()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = this.options.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// 使用示例
const generatePDFSafely = async () => {
  const element = document.getElementById('pdf-content')
  if (!element) return

  const generator = new SafePDFGenerator({
    element,
    filename: '报表.pdf',
    scale: 2,
    useCORS: true
  })

  try {
    await generator.download()
    ElMessage.success('PDF生成成功')
  } catch (error) {
    ElMessage.error('PDF生成失败，请重试')
    console.error(error)
  }
}
```

**后端CORS配置（必需）**：

```java
// Spring Boot CORS配置
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        // 关键：允许前端读取图片
        config.addExposedHeader("Content-Disposition");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

---

### 3. 打印预览与实际打印效果不一致

**问题描述**

在打印预览对话框中显示的效果与实际打印出来的效果不一致，包括布局错位、字体大小不对、分页位置不正确等。

**问题原因**

- 预览使用的是屏幕像素，打印使用的是物理尺寸
- 打印预览未正确模拟打印媒体查询
- 不同浏览器的打印引擎实现差异
- 预览容器尺寸与实际纸张比例不匹配
- 缩放比例计算错误

**解决方案**

```vue
<template>
  <div>
    <!-- 打印内容 -->
    <div ref="printContentRef" class="print-content">
      <slot />
    </div>

    <!-- 精确打印预览 -->
    <el-dialog
      v-model="previewVisible"
      title="打印预览"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close>

      <div class="preview-controls">
        <el-select v-model="paperSize" @change="updatePreview">
          <el-option label="A4" value="A4" />
          <el-option label="A3" value="A3" />
          <el-option label="Letter" value="Letter" />
        </el-select>

        <el-radio-group v-model="orientation" @change="updatePreview">
          <el-radio label="portrait">纵向</el-radio>
          <el-radio label="landscape">横向</el-radio>
        </el-radio-group>

        <el-slider
          v-model="previewScale"
          :min="50"
          :max="150"
          :step="10"
          :format-tooltip="val => `${val}%`"
        />
      </div>

      <div class="preview-container" ref="previewContainerRef">
        <div
          class="preview-page"
          :style="previewPageStyle"
          ref="previewPageRef">
          <iframe
            ref="previewIframeRef"
            :srcdoc="previewHTML"
            frameborder="0"
            :style="iframeStyle"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPrint">确认打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

// 纸张尺寸定义 (mm)
const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 }
} as const

type PaperSize = keyof typeof PAPER_SIZES
type Orientation = 'portrait' | 'landscape'

const printContentRef = ref<HTMLElement>()
const previewContainerRef = ref<HTMLElement>()
const previewPageRef = ref<HTMLElement>()
const previewIframeRef = ref<HTMLIFrameElement>()

const previewVisible = ref(false)
const paperSize = ref<PaperSize>('A4')
const orientation = ref<Orientation>('portrait')
const previewScale = ref(100)
const previewHTML = ref('')

// 获取实际纸张尺寸（考虑方向）
const actualPaperSize = computed(() => {
  const size = PAPER_SIZES[paperSize.value]
  return orientation.value === 'portrait'
    ? { width: size.width, height: size.height }
    : { width: size.height, height: size.width }
})

// mm转px（按96 DPI标准）
const mmToPx = (mm: number): number => mm * 96 / 25.4

// 预览页面样式
const previewPageStyle = computed(() => {
  const { width, height } = actualPaperSize.value
  const scale = previewScale.value / 100

  return {
    width: `${mmToPx(width)}px`,
    height: `${mmToPx(height)}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    margin: '0 auto',
    overflow: 'hidden'
  }
})

// iframe样式
const iframeStyle = computed(() => ({
  width: '100%',
  height: '100%',
  border: 'none'
}))

/**
 * 生成精确的打印预览HTML
 */
const generatePreviewHTML = (): string => {
  const content = printContentRef.value?.innerHTML || ''
  const { width, height } = actualPaperSize.value

  // 收集当前页面样式
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        /* 重置样式 */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* 模拟打印纸张 */
        @page {
          size: ${width}mm ${height}mm;
          margin: 20mm;
        }

        html, body {
          width: ${width}mm;
          min-height: ${height}mm;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          background: #fff;
        }

        /* 应用打印媒体查询 */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        /* 原始样式 */
        ${styles}

        /* 强制应用打印样式 */
        .no-print {
          display: none !important;
        }

        /* 分页控制 */
        .page-break-before {
          page-break-before: always;
        }
        .page-break-after {
          page-break-after: always;
        }
        .avoid-break {
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `
}

/**
 * 更新预览
 */
const updatePreview = async () => {
  await nextTick()
  previewHTML.value = generatePreviewHTML()
}

/**
 * 打开预览
 */
const openPreview = async () => {
  previewVisible.value = true
  await updatePreview()
}

/**
 * 确认打印 - 使用iframe打印确保一致性
 */
const confirmPrint = () => {
  const iframe = previewIframeRef.value
  if (!iframe?.contentWindow) return

  iframe.contentWindow.focus()
  iframe.contentWindow.print()
}

// 监听设置变化
watch([paperSize, orientation], updatePreview)

defineExpose({
  openPreview,
  confirmPrint
})
</script>

<style scoped lang="scss">
.preview-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.preview-container {
  max-height: 60vh;
  overflow: auto;
  background: #e0e0e0;
  padding: 20px;
  border-radius: 4px;
}

.preview-page {
  transition: transform 0.2s ease;
}
</style>
```

**使用精确预览组件**：

```vue
<template>
  <div>
    <AccuratePrintPreview ref="printPreviewRef">
      <div class="report-content">
        <h1>财务报表</h1>
        <table class="data-table">
          <!-- 表格内容 -->
        </table>
      </div>
    </AccuratePrintPreview>

    <el-button @click="openPreview">打印预览</el-button>
  </div>
</template>

<script setup lang="ts">
import AccuratePrintPreview from './AccuratePrintPreview.vue'

const printPreviewRef = ref()

const openPreview = () => {
  printPreviewRef.value?.openPreview()
}
</script>
```

---

### 4. 分页导致表格内容被切断

**问题描述**

打印多页内容时，表格行或其他内容块在页面边界处被分割，导致一行数据分布在两页上，影响可读性。

**问题原因**

- 浏览器默认分页算法不智能
- 未使用CSS分页控制属性
- 表格行高度超过可用空间
- 动态内容高度无法预计算

**解决方案**

```typescript
import { ref, onMounted, nextTick } from 'vue'

interface PageBreakConfig {
  pageHeight: number  // 页面可用高度(px)
  headerHeight: number  // 每页页眉高度
  footerHeight: number  // 每页页脚高度
  minRowsPerPage: number  // 每页最少行数
}

/**
 * 智能分页管理器
 * 自动计算并插入分页符,避免内容被切断
 */
class SmartPageBreakManager {
  private config: PageBreakConfig
  private contentElement: HTMLElement | null = null

  constructor(config: Partial<PageBreakConfig> = {}) {
    // A4纸张默认配置 (按96 DPI)
    this.config = {
      pageHeight: 1123,  // 297mm ≈ 1123px
      headerHeight: 60,
      footerHeight: 60,
      minRowsPerPage: 3,
      ...config
    }
  }

  /**
   * 设置打印内容元素
   */
  setContent(element: HTMLElement): this {
    this.contentElement = element
    return this
  }

  /**
   * 获取可用页面高度
   */
  private getAvailableHeight(): number {
    const { pageHeight, headerHeight, footerHeight } = this.config
    return pageHeight - headerHeight - footerHeight
  }

  /**
   * 处理表格分页
   */
  processTable(table: HTMLTableElement): void {
    const availableHeight = this.getAvailableHeight()
    const rows = Array.from(table.querySelectorAll('tbody tr'))
    const thead = table.querySelector('thead')
    const theadHeight = thead?.offsetHeight || 0

    let currentPageHeight = theadHeight
    let rowsInCurrentPage = 0

    rows.forEach((row, index) => {
      const rowElement = row as HTMLElement
      const rowHeight = rowElement.offsetHeight

      // 检查是否需要分页
      if (currentPageHeight + rowHeight > availableHeight &&
          rowsInCurrentPage >= this.config.minRowsPerPage) {
        // 在当前行前插入分页标记
        this.insertPageBreak(rowElement, thead)
        currentPageHeight = theadHeight + rowHeight
        rowsInCurrentPage = 1
      } else {
        currentPageHeight += rowHeight
        rowsInCurrentPage++
      }
    })
  }

  /**
   * 插入分页符和表头复制
   */
  private insertPageBreak(beforeElement: HTMLElement, thead: HTMLElement | null): void {
    // 创建分页符
    const pageBreak = document.createElement('div')
    pageBreak.className = 'print-page-break'
    pageBreak.style.cssText = `
      page-break-before: always;
      break-before: page;
      height: 0;
      overflow: hidden;
    `

    beforeElement.parentNode?.insertBefore(pageBreak, beforeElement)

    // 如果有表头,在新页复制表头
    if (thead) {
      const theadClone = thead.cloneNode(true) as HTMLElement
      theadClone.className = 'print-thead-repeat'
      theadClone.style.cssText = `
        display: none;
      `
      // 在打印时显示
      beforeElement.parentNode?.insertBefore(theadClone, beforeElement)
    }
  }

  /**
   * 处理内容块分页
   */
  processContentBlocks(selector: string): void {
    if (!this.contentElement) return

    const blocks = Array.from(this.contentElement.querySelectorAll(selector))
    const availableHeight = this.getAvailableHeight()
    let currentPageHeight = 0

    blocks.forEach((block, index) => {
      const element = block as HTMLElement
      const blockHeight = element.offsetHeight

      // 标记不可分割的块
      element.style.pageBreakInside = 'avoid'
      element.style.breakInside = 'avoid'

      if (currentPageHeight + blockHeight > availableHeight && currentPageHeight > 0) {
        // 需要分页
        element.style.pageBreakBefore = 'always'
        element.style.breakBefore = 'page'
        currentPageHeight = blockHeight
      } else {
        currentPageHeight += blockHeight
      }
    })
  }

  /**
   * 清理分页标记
   */
  cleanup(): void {
    if (!this.contentElement) return

    // 移除分页符
    this.contentElement.querySelectorAll('.print-page-break').forEach(el => el.remove())
    // 移除复制的表头
    this.contentElement.querySelectorAll('.print-thead-repeat').forEach(el => el.remove())
  }
}

// Vue组合式函数
export function useSmartPageBreak() {
  const printContentRef = ref<HTMLElement>()
  const manager = new SmartPageBreakManager()

  const processPrintContent = async () => {
    if (!printContentRef.value) return

    await nextTick()
    manager.setContent(printContentRef.value)

    // 处理所有表格
    const tables = printContentRef.value.querySelectorAll('table')
    tables.forEach(table => manager.processTable(table as HTMLTableElement))

    // 处理内容块
    manager.processContentBlocks('.content-block')
  }

  const cleanup = () => {
    manager.cleanup()
  }

  return {
    printContentRef,
    processPrintContent,
    cleanup
  }
}
```

**配合CSS使用**：

```scss
// 打印分页控制样式
@media print {
  // 表格分页优化
  table {
    border-collapse: collapse;
    width: 100%;

    thead {
      // 每页重复表头
      display: table-header-group;
    }

    tbody {
      display: table-row-group;
    }

    tfoot {
      // 每页重复表尾
      display: table-footer-group;
    }

    tr {
      // 避免行被切断
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }

  // 内容块分页
  .content-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  // 章节标题保持与内容在同一页
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid;
  }

  // 复制的表头在打印时显示
  .print-thead-repeat {
    display: table-header-group !important;
  }

  // 强制分页
  .page-break-before {
    page-break-before: always;
    break-before: page;
  }

  .page-break-after {
    page-break-after: always;
    break-after: page;
  }
}
```

---

### 5. 打印时中文乱码

**问题描述**

生成PDF或打印时，中文字符显示为乱码、方块或问号，特别是在使用jsPDF等库时问题更为明显。

**问题原因**

- jsPDF默认不支持中文字体
- 未正确嵌入中文字体文件
- 字体文件格式不兼容
- 编码问题(UTF-8未正确处理)
- 字体回退机制失效

**解决方案**

```typescript
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * 中文PDF生成器
 * 解决jsPDF中文乱码问题
 */
class ChinesePDFGenerator {
  private fontLoaded = false
  private fontData: string | null = null

  /**
   * 加载中文字体
   * 使用思源黑体或其他开源中文字体
   */
  async loadChineseFont(): Promise<void> {
    if (this.fontLoaded) return

    try {
      // 方案1: 从CDN或本地加载字体
      const fontUrl = '/fonts/SourceHanSansCN-Regular.ttf'
      const response = await fetch(fontUrl)
      const fontBuffer = await response.arrayBuffer()

      // 转换为Base64
      this.fontData = this.arrayBufferToBase64(fontBuffer)
      this.fontLoaded = true
    } catch (error) {
      console.warn('字体加载失败，将使用图片模式', error)
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * 使用字体嵌入方式生成PDF
   */
  async generateWithFont(element: HTMLElement, filename: string): Promise<void> {
    await this.loadChineseFont()

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4'
    })

    // 添加字体
    if (this.fontData) {
      pdf.addFileToVFS('SourceHanSansCN-Regular.ttf', this.fontData)
      pdf.addFont('SourceHanSansCN-Regular.ttf', 'SourceHanSans', 'normal')
      pdf.setFont('SourceHanSans')
    }

    // 提取文本内容并添加到PDF
    const textContent = element.innerText
    const lines = pdf.splitTextToSize(textContent, 170) // A4宽度减去边距

    let y = 20
    const lineHeight = 7
    const pageHeight = 280

    lines.forEach((line: string) => {
      if (y > pageHeight) {
        pdf.addPage()
        y = 20
      }
      pdf.text(line, 20, y)
      y += lineHeight
    })

    pdf.save(filename)
  }

  /**
   * 使用图片模式生成PDF（推荐，兼容性最好）
   */
  async generateWithCanvas(element: HTMLElement, filename: string): Promise<void> {
    // 设置元素字体确保渲染正确
    const originalFont = element.style.fontFamily
    element.style.fontFamily = '"Microsoft YaHei", "微软雅黑", "PingFang SC", "Helvetica Neue", sans-serif'

    try {
      const canvas = await html2canvas(element, {
        scale: 2,  // 高清输出
        useCORS: true,
        logging: false,
        // 确保中文渲染
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.body.firstElementChild as HTMLElement
          if (clonedElement) {
            clonedElement.style.fontFamily = '"Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif'
          }
        }
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210 // A4宽度mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'A4'
      })

      const pageHeight = pdf.internal.pageSize.getHeight()
      let position = 0

      // 处理多页
      while (position < imgHeight) {
        if (position > 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight)
        position += pageHeight
      }

      pdf.save(filename)
    } finally {
      element.style.fontFamily = originalFont
    }
  }
}

// Vue组合式函数
export function useChinesePDF() {
  const generator = new ChinesePDFGenerator()

  const generatePDF = async (
    element: HTMLElement | string,
    filename: string,
    mode: 'font' | 'canvas' = 'canvas'
  ) => {
    const el = typeof element === 'string'
      ? document.querySelector(element) as HTMLElement
      : element

    if (!el) {
      throw new Error('未找到打印元素')
    }

    if (mode === 'font') {
      await generator.generateWithFont(el, filename)
    } else {
      await generator.generateWithCanvas(el, filename)
    }
  }

  return { generatePDF }
}
```

**打印样式中的字体设置**：

```scss
// 确保打印时使用正确的中文字体
@media print {
  * {
    font-family:
      "Microsoft YaHei",      // Windows
      "微软雅黑",
      "PingFang SC",          // macOS
      "苹方-简",
      "Hiragino Sans GB",     // macOS备选
      "Heiti SC",             // macOS/iOS
      "Source Han Sans CN",   // 思源黑体
      "Noto Sans CJK SC",     // Google Noto
      "WenQuanYi Micro Hei",  // Linux
      sans-serif !important;
  }

  // 特定元素字体强化
  .print-content {
    font-family: "SimSun", "宋体", serif !important;  // 正式文档用宋体
  }

  .print-title {
    font-family: "SimHei", "黑体", sans-serif !important;  // 标题用黑体
  }
}
```

---

### 6. 批量打印导致浏览器崩溃或内存溢出

**问题描述**

批量打印大量文档或生成多个PDF时，浏览器变得卡顿、无响应，甚至崩溃，内存占用持续增长不释放。

**问题原因**

- 同时处理过多DOM元素导致内存溢出
- Canvas对象未及时释放
- 闭包引用导致垃圾回收失效
- 未使用队列控制并发数
- 大图片未压缩处理

**解决方案**

```typescript
import { ref, shallowRef } from 'vue'

interface BatchPrintJob {
  id: string
  element: HTMLElement | string
  filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
}

interface BatchPrintOptions {
  concurrency: number  // 并发数
  delayBetweenJobs: number  // 任务间隔(ms)
  onProgress?: (job: BatchPrintJob) => void
  onComplete?: (results: BatchPrintJob[]) => void
  onError?: (job: BatchPrintJob, error: Error) => void
}

/**
 * 批量打印管理器
 * 使用队列和内存管理避免崩溃
 */
class BatchPrintManager {
  private queue: BatchPrintJob[] = []
  private processing = new Set<string>()
  private completed: BatchPrintJob[] = []
  private options: BatchPrintOptions
  private abortController: AbortController | null = null

  constructor(options: Partial<BatchPrintOptions> = {}) {
    this.options = {
      concurrency: 2,  // 默认同时处理2个
      delayBetweenJobs: 500,
      ...options
    }
  }

  /**
   * 添加打印任务
   */
  addJob(job: Omit<BatchPrintJob, 'status' | 'progress'>): string {
    const newJob: BatchPrintJob = {
      ...job,
      id: job.id || `job_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: 'pending',
      progress: 0
    }
    this.queue.push(newJob)
    return newJob.id
  }

  /**
   * 开始批量处理
   */
  async start(): Promise<BatchPrintJob[]> {
    this.abortController = new AbortController()
    this.completed = []

    const processNext = async (): Promise<void> => {
      if (this.abortController?.signal.aborted) return

      // 获取下一个待处理任务
      const job = this.queue.find(j => j.status === 'pending')
      if (!job) return

      // 检查并发限制
      if (this.processing.size >= this.options.concurrency) {
        await new Promise(resolve => setTimeout(resolve, 100))
        return processNext()
      }

      job.status = 'processing'
      this.processing.add(job.id)

      try {
        await this.processJob(job)
        job.status = 'completed'
        job.progress = 100
        this.options.onProgress?.(job)
      } catch (error) {
        job.status = 'failed'
        job.error = error instanceof Error ? error.message : String(error)
        this.options.onError?.(job, error as Error)
      } finally {
        this.processing.delete(job.id)
        this.completed.push(job)

        // 释放内存
        this.releaseJobMemory(job)

        // 延迟后处理下一个
        if (!this.abortController?.signal.aborted) {
          await new Promise(resolve =>
            setTimeout(resolve, this.options.delayBetweenJobs)
          )
          await processNext()
        }
      }
    }

    // 启动并发任务
    const workers = Array(this.options.concurrency)
      .fill(null)
      .map(() => processNext())

    await Promise.all(workers)

    this.options.onComplete?.(this.completed)
    return this.completed
  }

  /**
   * 处理单个任务
   */
  private async processJob(job: BatchPrintJob): Promise<void> {
    const element = typeof job.element === 'string'
      ? document.querySelector(job.element) as HTMLElement
      : job.element

    if (!element) {
      throw new Error('元素不存在')
    }

    // 克隆元素避免影响原始DOM
    const clone = element.cloneNode(true) as HTMLElement
    const container = document.createElement('div')
    container.style.cssText = 'position:absolute;left:-9999px;top:0;'
    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      job.progress = 20
      this.options.onProgress?.(job)

      // 压缩图片
      await this.compressImages(clone)
      job.progress = 40
      this.options.onProgress?.(job)

      // 生成Canvas
      const canvas = await this.createCanvas(clone)
      job.progress = 70
      this.options.onProgress?.(job)

      // 生成PDF
      await this.generatePDF(canvas, job.filename)
      job.progress = 100
      this.options.onProgress?.(job)

      // 释放Canvas内存
      canvas.width = 0
      canvas.height = 0
    } finally {
      // 移除临时容器
      document.body.removeChild(container)
    }
  }

  /**
   * 压缩图片减少内存占用
   */
  private async compressImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img')
    const maxDimension = 1200  // 最大尺寸

    for (const img of Array.from(images)) {
      if (!img.src || img.src.startsWith('data:')) continue

      try {
        const compressed = await this.compressImage(img.src, maxDimension)
        img.src = compressed
      } catch (error) {
        console.warn('图片压缩失败', error)
      }
    }
  }

  private async compressImage(src: string, maxDimension: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        let { width, height } = img

        // 计算缩放比例
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width *= ratio
          height *= ratio
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        } else {
          reject(new Error('无法创建Canvas'))
        }

        // 释放资源
        canvas.width = 0
        canvas.height = 0
      }

      img.onerror = reject
      img.src = src
    })
  }

  private async createCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    const html2canvas = (await import('html2canvas')).default
    return html2canvas(element, {
      scale: 1.5,  // 适当降低清晰度以节省内存
      useCORS: true,
      logging: false
    })
  }

  private async generatePDF(canvas: HTMLCanvasElement, filename: string): Promise<void> {
    const { jsPDF } = await import('jspdf')

    const imgData = canvas.toDataURL('image/jpeg', 0.8)  // 使用JPEG减少大小
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
    pdf.save(filename)
  }

  /**
   * 释放任务内存
   */
  private releaseJobMemory(job: BatchPrintJob): void {
    // 如果element是字符串选择器，不需要处理
    if (typeof job.element !== 'string') {
      // 清空引用
      (job as any).element = null
    }

    // 强制垃圾回收（如果支持）
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
  }

  /**
   * 取消批量处理
   */
  abort(): void {
    this.abortController?.abort()
    this.queue.forEach(job => {
      if (job.status === 'pending') {
        job.status = 'failed'
        job.error = '已取消'
      }
    })
  }

  /**
   * 获取进度
   */
  getProgress(): { total: number; completed: number; failed: number } {
    return {
      total: this.queue.length,
      completed: this.completed.filter(j => j.status === 'completed').length,
      failed: this.completed.filter(j => j.status === 'failed').length
    }
  }
}

// Vue组合式函数
export function useBatchPrint() {
  const manager = shallowRef<BatchPrintManager>()
  const jobs = ref<BatchPrintJob[]>([])
  const isProcessing = ref(false)
  const progress = ref({ total: 0, completed: 0, failed: 0 })

  const initManager = (options?: Partial<BatchPrintOptions>) => {
    manager.value = new BatchPrintManager({
      ...options,
      onProgress: (job) => {
        const index = jobs.value.findIndex(j => j.id === job.id)
        if (index > -1) {
          jobs.value[index] = { ...job }
        }
        progress.value = manager.value!.getProgress()
      },
      onComplete: () => {
        isProcessing.value = false
      }
    })
  }

  const addJob = (element: HTMLElement | string, filename: string) => {
    if (!manager.value) initManager()

    const id = manager.value!.addJob({ id: '', element, filename })
    jobs.value.push({
      id,
      element,
      filename,
      status: 'pending',
      progress: 0
    })
    return id
  }

  const startBatch = async () => {
    if (!manager.value) return
    isProcessing.value = true
    await manager.value.start()
  }

  const abort = () => {
    manager.value?.abort()
    isProcessing.value = false
  }

  const clear = () => {
    jobs.value = []
    manager.value = undefined
  }

  return {
    jobs,
    isProcessing,
    progress,
    initManager,
    addJob,
    startBatch,
    abort,
    clear
  }
}
```

---

### 7. 打印弹窗被浏览器拦截

**问题描述**

调用 `window.print()` 或打开新窗口进行打印时，浏览器阻止弹窗，用户无法正常打印。

**问题原因**

- 打印操作不在用户交互事件处理函数中直接调用
- 异步操作后再调用打印被认为是非用户触发
- 新窗口打印被浏览器弹窗拦截器阻止
- 多次快速调用打印被拦截

**解决方案**

```vue
<template>
  <div>
    <!-- 打印内容 -->
    <div ref="printContentRef" class="print-content">
      <h1>{{ title }}</h1>
      <div v-html="content"></div>
    </div>

    <!-- 打印按钮 -->
    <el-button @click="handlePrint" type="primary" :loading="isPrinting">
      打印
    </el-button>

    <!-- 隐藏iframe用于打印 -->
    <iframe
      ref="printFrameRef"
      style="display: none; width: 0; height: 0; border: none;"
      title="print-frame"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const printContentRef = ref<HTMLElement>()
const printFrameRef = ref<HTMLIFrameElement>()
const isPrinting = ref(false)
const title = ref('打印标题')
const content = ref('<p>打印内容</p>')

/**
 * 同步打印处理器
 * 确保在用户交互事件中直接调用
 */
const handlePrint = async () => {
  isPrinting.value = true

  try {
    // 方案1: 使用隐藏iframe打印（推荐，不会被拦截）
    await printViaIframe()

    // 方案2: 直接打印当前页面
    // await printCurrentPage()

    // 方案3: 预加载后打印
    // await printWithPreload()
  } catch (error) {
    console.error('打印失败', error)
    ElMessage.error('打印失败，请重试')
  } finally {
    isPrinting.value = false
  }
}

/**
 * 方案1: 使用iframe打印（推荐）
 * 不会触发弹窗拦截
 */
const printViaIframe = async (): Promise<void> => {
  const iframe = printFrameRef.value
  if (!iframe) throw new Error('打印框架未初始化')

  const contentHtml = printContentRef.value?.innerHTML || ''

  // 收集样式
  const styles = collectStyles()

  // 构建打印文档
  const printDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>打印</title>
      <style>
        ${styles}

        @media print {
          body {
            margin: 0;
            padding: 20mm;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `

  // 写入iframe
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) throw new Error('无法访问iframe文档')

  doc.open()
  doc.write(printDocument)
  doc.close()

  // 等待内容加载
  await new Promise<void>((resolve, reject) => {
    const checkReady = () => {
      if (doc.readyState === 'complete') {
        resolve()
      } else {
        setTimeout(checkReady, 50)
      }
    }

    // 超时处理
    const timeout = setTimeout(() => {
      reject(new Error('加载超时'))
    }, 10000)

    iframe.onload = () => {
      clearTimeout(timeout)
      resolve()
    }

    checkReady()
  })

  // 等待图片加载
  const images = doc.querySelectorAll('img')
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()  // 图片加载失败也继续
      })
    })
  )

  // 执行打印
  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()
}

/**
 * 方案2: 直接打印当前页面
 * 需要确保在同步事件处理中调用
 */
const printCurrentPage = async (): Promise<void> => {
  // 添加打印类
  document.body.classList.add('printing')

  // 使用nextTick确保DOM更新
  await nextTick()

  // 直接调用print（同步，不会被拦截）
  window.print()

  // 移除打印类
  document.body.classList.remove('printing')
}

/**
 * 方案3: 预加载内容后打印
 * 适用于需要异步加载数据的场景
 */
const printWithPreload = async (): Promise<void> => {
  // 1. 先显示加载提示
  const loadingInstance = ElLoading.service({
    text: '正在准备打印内容...'
  })

  try {
    // 2. 异步加载数据
    await loadPrintData()

    // 3. 等待渲染
    await nextTick()

    // 4. 关闭loading
    loadingInstance.close()

    // 5. 小延迟确保用户交互上下文
    await new Promise(resolve => setTimeout(resolve, 0))

    // 6. 打印
    window.print()
  } catch (error) {
    loadingInstance.close()
    throw error
  }
}

const loadPrintData = async () => {
  // 模拟异步数据加载
  await new Promise(resolve => setTimeout(resolve, 500))
}

/**
 * 收集页面样式
 */
const collectStyles = (): string => {
  const styles: string[] = []

  // 收集所有style标签
  document.querySelectorAll('style').forEach(style => {
    styles.push(style.innerHTML)
  })

  // 收集所有link样式表
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    try {
      const sheet = (link as HTMLLinkElement).sheet
      if (sheet) {
        const rules = Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n')
        styles.push(rules)
      }
    } catch (e) {
      // 跨域样式表无法访问，忽略
    }
  })

  return styles.join('\n')
}
</script>

<style lang="scss">
// 打印模式下的页面样式
body.printing {
  // 隐藏非打印内容
  > *:not(.print-content) {
    display: none !important;
  }

  .print-content {
    display: block !important;
    position: static !important;
  }
}

@media print {
  body.printing {
    margin: 0;
    padding: 0;
  }
}
</style>
```

**关键要点**：

1. **使用iframe打印是最可靠的方案**，不会触发弹窗拦截
2. **确保打印调用在用户交互的同步上下文中**
3. **异步加载数据后，使用setTimeout(0)重新进入事件循环**
4. **避免使用window.open进行打印**，容易被拦截

---

### 8. PDF水印生成失败或位置不正确

**问题描述**

为PDF添加水印时，水印不显示、位置偏移、被内容遮挡，或者在不同页面上显示不一致。

**问题原因**

- 水印层级(z-index)设置不正确
- 坐标计算未考虑页面尺寸和边距
- Canvas绑定时机不对
- 透明度设置导致水印不可见
- 多页文档未循环添加水印

**解决方案**

```typescript
import jsPDF from 'jspdf'

interface WatermarkOptions {
  text: string
  fontSize?: number
  color?: string
  opacity?: number
  angle?: number
  position?: 'center' | 'tile' | 'corner'
  gap?: number  // 平铺间距
}

interface PDFWithWatermarkOptions {
  element: HTMLElement
  filename: string
  watermark: WatermarkOptions
  pageSize?: 'A4' | 'A3' | 'Letter'
  orientation?: 'portrait' | 'landscape'
}

/**
 * PDF水印生成器
 */
class PDFWatermarkGenerator {
  private defaultOptions: Required<WatermarkOptions> = {
    text: '机密文档',
    fontSize: 48,
    color: '#000000',
    opacity: 0.1,
    angle: -45,
    position: 'tile',
    gap: 200
  }

  /**
   * 生成带水印的PDF
   */
  async generate(options: PDFWithWatermarkOptions): Promise<Blob> {
    const watermarkOpts = { ...this.defaultOptions, ...options.watermark }

    // 1. 生成内容Canvas
    const contentCanvas = await this.createContentCanvas(options.element)

    // 2. 创建PDF
    const pdf = this.createPDF(contentCanvas, options)

    // 3. 添加水印到每一页
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      this.addWatermarkToPage(pdf, watermarkOpts)
    }

    return pdf.output('blob')
  }

  /**
   * 创建内容Canvas
   */
  private async createContentCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    const html2canvas = (await import('html2canvas')).default
    return html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
  }

  /**
   * 创建PDF文档
   */
  private createPDF(canvas: HTMLCanvasElement, options: PDFWithWatermarkOptions): jsPDF {
    const { pageSize = 'A4', orientation = 'portrait' } = options

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10  // mm

    const contentWidth = pageWidth - margin * 2
    const contentHeight = (canvas.height * contentWidth) / canvas.width

    const imgData = canvas.toDataURL('image/png')

    // 处理多页
    let position = margin
    let remainingHeight = contentHeight
    const availableHeight = pageHeight - margin * 2

    while (remainingHeight > 0) {
      if (position > margin) {
        pdf.addPage()
        position = margin
      }

      // 计算当前页显示高度
      const currentHeight = Math.min(remainingHeight, availableHeight)

      // 使用裁剪方式添加图片
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        contentWidth,
        contentHeight,
        undefined,
        'FAST'
      )

      remainingHeight -= availableHeight
      position = margin - (contentHeight - remainingHeight - availableHeight)
    }

    return pdf
  }

  /**
   * 添加水印到单页
   */
  private addWatermarkToPage(pdf: jsPDF, options: Required<WatermarkOptions>): void {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // 保存当前状态
    pdf.saveGraphicsState()

    // 设置透明度
    pdf.setGState(new (pdf as any).GState({ opacity: options.opacity }))

    // 设置字体
    pdf.setFontSize(options.fontSize)
    pdf.setTextColor(options.color)

    switch (options.position) {
      case 'center':
        this.addCenterWatermark(pdf, options, pageWidth, pageHeight)
        break
      case 'tile':
        this.addTileWatermark(pdf, options, pageWidth, pageHeight)
        break
      case 'corner':
        this.addCornerWatermark(pdf, options, pageWidth, pageHeight)
        break
    }

    // 恢复状态
    pdf.restoreGraphicsState()
  }

  /**
   * 中心水印
   */
  private addCenterWatermark(
    pdf: jsPDF,
    options: Required<WatermarkOptions>,
    pageWidth: number,
    pageHeight: number
  ): void {
    const textWidth = pdf.getTextWidth(options.text)
    const centerX = pageWidth / 2
    const centerY = pageHeight / 2

    // 旋转文字
    pdf.text(options.text, centerX, centerY, {
      angle: options.angle,
      align: 'center',
      baseline: 'middle'
    })
  }

  /**
   * 平铺水印
   */
  private addTileWatermark(
    pdf: jsPDF,
    options: Required<WatermarkOptions>,
    pageWidth: number,
    pageHeight: number
  ): void {
    const { text, gap, angle } = options
    const textWidth = pdf.getTextWidth(text)

    // 计算旋转后的有效间距
    const radians = (angle * Math.PI) / 180
    const horizontalGap = gap
    const verticalGap = gap * 0.75

    // 扩展绘制范围以覆盖旋转后的角落
    const extendedWidth = pageWidth + pageHeight * Math.abs(Math.sin(radians))
    const extendedHeight = pageHeight + pageWidth * Math.abs(Math.sin(radians))
    const startX = -pageHeight * Math.abs(Math.sin(radians)) / 2
    const startY = -pageWidth * Math.abs(Math.sin(radians)) / 2

    for (let y = startY; y < extendedHeight; y += verticalGap) {
      for (let x = startX; x < extendedWidth; x += horizontalGap) {
        pdf.text(text, x, y, {
          angle,
          align: 'center',
          baseline: 'middle'
        })
      }
    }
  }

  /**
   * 角落水印
   */
  private addCornerWatermark(
    pdf: jsPDF,
    options: Required<WatermarkOptions>,
    pageWidth: number,
    pageHeight: number
  ): void {
    const margin = 15
    const positions = [
      { x: margin, y: margin, align: 'left' },
      { x: pageWidth - margin, y: margin, align: 'right' },
      { x: margin, y: pageHeight - margin, align: 'left' },
      { x: pageWidth - margin, y: pageHeight - margin, align: 'right' }
    ]

    positions.forEach(pos => {
      pdf.text(options.text, pos.x, pos.y, {
        angle: options.angle,
        align: pos.align as any,
        baseline: 'middle'
      })
    })
  }
}

/**
 * Canvas水印生成器
 * 用于html2canvas前添加水印
 */
class CanvasWatermarkGenerator {
  /**
   * 为Canvas添加水印层
   */
  addWatermark(canvas: HTMLCanvasElement, options: WatermarkOptions): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas

    const {
      text = '机密文档',
      fontSize = 24,
      color = '#000000',
      opacity = 0.1,
      angle = -45,
      position = 'tile',
      gap = 150
    } = options

    // 保存当前状态
    ctx.save()

    // 设置样式
    ctx.globalAlpha = opacity
    ctx.fillStyle = color
    ctx.font = `${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const radians = (angle * Math.PI) / 180

    if (position === 'tile') {
      // 平铺水印
      for (let y = 0; y < canvas.height + gap; y += gap) {
        for (let x = 0; x < canvas.width + gap; x += gap) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(radians)
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
    } else if (position === 'center') {
      // 中心水印
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)
      ctx.fillText(text, 0, 0)
    }

    // 恢复状态
    ctx.restore()

    return canvas
  }
}

// Vue组合式函数
export function usePDFWatermark() {
  const pdfGenerator = new PDFWatermarkGenerator()
  const canvasGenerator = new CanvasWatermarkGenerator()

  const generatePDFWithWatermark = async (options: PDFWithWatermarkOptions): Promise<void> => {
    try {
      const blob = await pdfGenerator.generate(options)

      // 下载
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = options.filename
      link.click()
      URL.revokeObjectURL(url)

      ElMessage.success('PDF生成成功')
    } catch (error) {
      ElMessage.error('PDF生成失败')
      console.error(error)
    }
  }

  const addCanvasWatermark = (canvas: HTMLCanvasElement, options: WatermarkOptions) => {
    return canvasGenerator.addWatermark(canvas, options)
  }

  return {
    generatePDFWithWatermark,
    addCanvasWatermark
  }
}
```

**使用示例**：

```vue
<template>
  <div>
    <div ref="contentRef" class="document-content">
      <h1>机密报告</h1>
      <p>这是一份机密文档...</p>
    </div>

    <el-button @click="exportWithWatermark" type="primary">
      导出带水印PDF
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePDFWatermark } from '@/composables/usePDFWatermark'

const contentRef = ref<HTMLElement>()
const { generatePDFWithWatermark } = usePDFWatermark()

const exportWithWatermark = async () => {
  if (!contentRef.value) return

  await generatePDFWithWatermark({
    element: contentRef.value,
    filename: '机密报告.pdf',
    watermark: {
      text: '内部机密',
      fontSize: 36,
      color: '#ff0000',
      opacity: 0.15,
      angle: -30,
      position: 'tile',
      gap: 180
    },
    pageSize: 'A4',
    orientation: 'portrait'
  })
}
</script>
```