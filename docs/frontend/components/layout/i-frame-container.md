# IFrameContainer iframe容器组件

## 介绍

IFrameContainer是一个专业的iframe嵌入容器组件，用于在Vue 3应用中安全、高效地嵌入外部网页内容。该组件提供了响应式的高度自适应功能，能够根据视口大小动态调整iframe的尺寸，确保嵌入内容在各种屏幕尺寸下都能获得最佳的展示效果。

**核心特性:**

- **响应式高度** - 自动计算并适应视口高度，减去固定导航区域的占用空间，确保iframe内容完整显示
- **窗口监听** - 实时监听浏览器窗口的resize事件，动态调整容器尺寸，保持最佳的视觉体验
- **内存安全** - 组件卸载时自动清理事件监听器，防止内存泄漏，确保应用稳定运行
- **样式隔离** - 采用Tailwind CSS工具类，提供美观的默认样式，同时保持良好的样式隔离
- **类型安全** - 完整的TypeScript类型定义，提供优秀的开发体验和代码提示
- **简洁轻量** - 专注于核心功能，代码简洁高效，无冗余依赖

## 基础用法

### 最简用法

最基本的使用方式只需要提供`src`属性即可嵌入外部页面：

```vue
<template>
  <IFrameContainer src="https://example.com" />
</template>

<script lang="ts" setup>
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'
</script>
```

**使用说明:**
- 组件会自动计算合适的高度，默认为视口高度减去90px
- 自动处理窗口大小变化，无需额外配置
- 支持任何有效的URL地址

### 嵌入文档站点

常用于嵌入在线API文档、技术文档等：

```vue
<template>
  <div class="documentation-wrapper">
    <div class="doc-header">
      <h1 class="text-xl font-bold text-gray-800">API 文档</h1>
      <p class="text-gray-500 mt-2">查阅完整的接口说明和使用示例</p>
    </div>
    <div class="doc-content mt-4">
      <IFrameContainer src="https://api-docs.example.com/v2" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'
</script>

<style scoped>
.documentation-wrapper {
  padding: 16px;
  background: var(--bg-base);
}

.doc-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
```

**技术实现:**
- 组件自动适应父容器宽度（100%）
- 背景色使用`bg-gray-100`提供视觉层次
- iframe内部使用白色背景确保内容清晰可读

### 嵌入本地页面

可以嵌入项目静态资源目录下的HTML文件：

```vue
<template>
  <div class="report-container">
    <div class="report-toolbar">
      <el-button type="primary" @click="refreshReport">
        <el-icon><Refresh /></el-icon>
        刷新报表
      </el-button>
      <el-button @click="downloadReport">
        <el-icon><Download /></el-icon>
        下载
      </el-button>
    </div>
    <div class="report-frame mt-4">
      <IFrameContainer :src="reportUrl" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Refresh, Download } from '@element-plus/icons-vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

// 报表URL，添加时间戳防止缓存
const timestamp = ref(Date.now())
const reportUrl = computed(() => `/static/reports/monthly-report.html?t=${timestamp.value}`)

// 刷新报表
const refreshReport = () => {
  timestamp.value = Date.now()
}

// 下载报表
const downloadReport = () => {
  const link = document.createElement('a')
  link.href = '/static/reports/monthly-report.pdf'
  link.download = 'monthly-report.pdf'
  link.click()
}
</script>

<style scoped>
.report-container {
  padding: 20px;
}

.report-toolbar {
  display: flex;
  gap: 12px;
}
</style>
```

**使用说明:**
- 本地文件路径相对于项目public目录
- 可以通过时间戳参数强制刷新内容
- 支持配合工具栏实现更丰富的交互

## 高级用法

### 在弹窗中使用

结合Element Plus的Dialog组件，可以在弹窗中展示外部内容：

```vue
<template>
  <div class="page-container">
    <!-- 触发按钮 -->
    <el-button type="primary" @click="openPreview">
      <el-icon><View /></el-icon>
      预览外部页面
    </el-button>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="页面预览"
      width="90%"
      :fullscreen="isFullscreen"
      :before-close="handleClose"
      destroy-on-close
    >
      <template #header>
        <div class="dialog-header">
          <span class="title">{{ pageTitle }}</span>
          <div class="header-actions">
            <el-button
              :icon="isFullscreen ? 'FullscreenExit' : 'Fullscreen'"
              circle
              size="small"
              @click="toggleFullscreen"
            />
            <el-button
              icon="Link"
              circle
              size="small"
              @click="openInNewTab"
            />
          </div>
        </div>
      </template>

      <div class="preview-content" :style="{ height: contentHeight }">
        <IFrameContainer v-if="dialogVisible" :src="previewUrl" />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <span class="url-display">{{ previewUrl }}</span>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { View } from '@element-plus/icons-vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

// 弹窗状态
const dialogVisible = ref(false)
const isFullscreen = ref(false)
const previewUrl = ref('https://dashboard.example.com')
const pageTitle = ref('外部监控面板')

// 内容高度
const contentHeight = computed(() => {
  return isFullscreen.value ? 'calc(100vh - 120px)' : '500px'
})

// 打开预览
const openPreview = () => {
  dialogVisible.value = true
}

// 处理关闭
const handleClose = (done: () => void) => {
  isFullscreen.value = false
  done()
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 新标签页打开
const openInNewTab = () => {
  window.open(previewUrl.value, '_blank')
}
</script>

<style scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  overflow: hidden;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.url-display {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

**技术实现:**
- 使用`destroy-on-close`确保关闭时销毁iframe
- 支持全屏切换功能
- 提供在新标签页打开的快捷操作
- 底部显示当前访问的URL

### 多iframe并排展示

在需要对比或同时展示多个页面时的用法：

```vue
<template>
  <div class="multi-frame-container">
    <div class="frame-grid">
      <!-- 左侧iframe -->
      <div class="frame-item">
        <div class="frame-header">
          <span class="frame-title">生产环境</span>
          <el-tag type="success" size="small">Online</el-tag>
        </div>
        <div class="frame-content">
          <IFrameContainer :src="prodUrl" />
        </div>
      </div>

      <!-- 右侧iframe -->
      <div class="frame-item">
        <div class="frame-header">
          <span class="frame-title">测试环境</span>
          <el-tag type="warning" size="small">Staging</el-tag>
        </div>
        <div class="frame-content">
          <IFrameContainer :src="stagingUrl" />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="frame-actions">
      <el-button type="primary" @click="syncEnvironments">
        同步配置
      </el-button>
      <el-button @click="refreshAll">
        全部刷新
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

const prodUrl = ref('https://prod.example.com/dashboard')
const stagingUrl = ref('https://staging.example.com/dashboard')

// 同步环境配置
const syncEnvironments = () => {
  ElMessage.success('环境配置已同步')
}

// 刷新全部
const refreshAll = () => {
  const timestamp = Date.now()
  prodUrl.value = `https://prod.example.com/dashboard?t=${timestamp}`
  stagingUrl.value = `https://staging.example.com/dashboard?t=${timestamp}`
}
</script>

<style scoped>
.multi-frame-container {
  padding: 16px;
}

.frame-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.frame-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.frame-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.frame-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.frame-content {
  height: calc(100vh - 250px);
  overflow: hidden;
}

.frame-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 1024px) {
  .frame-grid {
    grid-template-columns: 1fr;
  }

  .frame-content {
    height: 400px;
  }
}
</style>
```

**使用说明:**
- 使用CSS Grid实现响应式并排布局
- 每个iframe有独立的标题和状态标识
- 小屏幕自动切换为单列布局
- 支持批量操作（刷新、同步等）

### 条件渲染与模式切换

在某些场景下需要在iframe和其他内容之间切换：

```vue
<template>
  <div class="mode-switch-container">
    <!-- 模式切换工具栏 -->
    <div class="toolbar">
      <el-radio-group v-model="displayMode" size="small">
        <el-radio-button label="iframe">嵌入模式</el-radio-button>
        <el-radio-button label="redirect">跳转模式</el-radio-button>
      </el-radio-group>

      <el-input
        v-model="targetUrl"
        placeholder="输入目标URL"
        class="url-input"
        clearable
      >
        <template #prepend>URL</template>
      </el-input>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- iframe嵌入模式 -->
      <template v-if="displayMode === 'iframe'">
        <IFrameContainer v-if="isValidUrl" :src="targetUrl" />
        <div v-else class="empty-state">
          <el-empty description="请输入有效的URL地址" />
        </div>
      </template>

      <!-- 跳转模式 -->
      <template v-else>
        <div class="redirect-panel">
          <div class="redirect-icon">🔗</div>
          <h3>外部链接</h3>
          <p class="redirect-url">{{ targetUrl }}</p>
          <div class="redirect-actions">
            <el-button type="primary" @click="openExternal">
              在新窗口打开
            </el-button>
            <el-button @click="copyUrl">
              复制链接
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

// 显示模式
const displayMode = ref<'iframe' | 'redirect'>('iframe')

// 目标URL
const targetUrl = ref('https://example.com')

// URL验证
const isValidUrl = computed(() => {
  try {
    new URL(targetUrl.value)
    return true
  } catch {
    return false
  }
})

// 外部打开
const openExternal = () => {
  if (isValidUrl.value) {
    window.open(targetUrl.value, '_blank')
  }
}

// 复制URL
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(targetUrl.value)
    ElMessage.success('链接已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.mode-switch-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.url-input {
  flex: 1;
  max-width: 500px;
}

.content-area {
  flex: 1;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.redirect-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.redirect-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.redirect-url {
  color: var(--el-text-color-secondary);
  margin: 16px 0 32px;
  word-break: break-all;
  max-width: 500px;
}

.redirect-actions {
  display: flex;
  gap: 12px;
}
</style>
```

**技术实现:**
- 提供iframe嵌入和外链跳转两种模式
- 实时验证URL有效性
- 无效URL时显示空状态提示
- 支持URL复制到剪贴板

### 与SnailJob调度服务集成

实际项目中的使用示例，嵌入SnailJob任务调度控制台：

```vue
<template>
  <div class="snailjob-container">
    <!-- 内链打开：使用 iframe -->
    <IFrameContainer v-if="currentOpenMode === 'internal'" :src="url" />

    <!-- 外链打开：显示跳转提示 -->
    <div v-else class="redirect-view">
      <div class="redirect-content">
        <div class="redirect-header">
          <div class="icon-wrapper">🐌</div>
          <h2 class="title">{{ displayText.title }}</h2>
          <p class="description">{{ displayText.description }}</p>
        </div>

        <div class="url-display" @click="copyUrl">
          <span class="url-text">{{ url }}</span>
          <span class="copy-icon" :class="{ copied: isCopied }">
            {{ isCopied ? '✓' : '📋' }}
          </span>
        </div>

        <div class="action-buttons">
          <el-button type="primary" size="large" @click="openExternal">
            <el-icon><Link /></el-icon>
            立即打开
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { Link } from '@element-plus/icons-vue'
import { SystemConfig } from '@/systemConfig'
import { copy } from '@/utils/function'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

// 是否启用自动检测模式
const autoDetect = ref<boolean>(true)

// 开发/生产环境打开方式配置
const devOpenMode = ref<'internal' | 'external'>('internal')
const prodOpenMode = ref<'internal' | 'external'>('external')

// 状态管理
const isPreparing = ref<boolean>(true)
const isCopied = ref(false)

// 访问地址
const url = computed(() => SystemConfig.services.snailJob)

// 环境判断
const isDevelopment = computed(() => {
  return SystemConfig.app.env === 'development'
})

// 检测父页面协议
const isParentHttps = computed(() => {
  return window.location.protocol === 'https:'
})

// 计算当前应该使用的打开方式
const currentOpenMode = computed(() => {
  if (autoDetect.value) {
    // 自动检测模式：根据协议决定
    return isParentHttps.value ? 'internal' : 'internal'
  } else {
    // 手动模式：根据环境设置
    return isDevelopment.value ? devOpenMode.value : prodOpenMode.value
  }
})

// 显示文案
const displayText = computed(() => {
  if (isPreparing.value) {
    return {
      title: '正在跳转...',
      description: '即将为您打开SnailJob控制台'
    }
  } else {
    return {
      title: 'SnailJob控制台链接已准备就绪',
      description: '请点击下方按钮打开，或复制链接手动访问'
    }
  }
})

// 打开外部链接
const openExternal = () => {
  if (!url.value) return
  window.open(url.value, '_blank')
}

// 拷贝访问链接
const copyUrl = () => {
  copy(url.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

// 自动跳转逻辑
onMounted(() => {
  let shouldAutoOpen = false

  if (autoDetect.value) {
    shouldAutoOpen = isParentHttps.value
  } else {
    shouldAutoOpen = isDevelopment.value
      ? devOpenMode.value === 'external'
      : prodOpenMode.value === 'external'
  }

  if (shouldAutoOpen) {
    setTimeout(() => {
      openExternal()
      isPreparing.value = false
    }, 1500)
  }
})
</script>

<style scoped>
.snailjob-container {
  height: 100%;
}

.redirect-view {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  padding-top: 200px;
  background: var(--el-bg-color);
}

.redirect-content {
  text-align: center;
  max-width: 500px;
}

.icon-wrapper {
  font-size: 64px;
  margin-bottom: 24px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.description {
  color: var(--el-text-color-secondary);
  margin-bottom: 32px;
}

.url-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 32px;
}

.url-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.copy-icon {
  font-size: 14px;
  transition: color 0.3s;
}

.copy-icon.copied {
  color: var(--el-color-success);
}

.action-buttons {
  display: flex;
  justify-content: center;
}
</style>
```

**使用说明:**
- 支持自动检测协议决定打开方式
- 开发和生产环境可配置不同行为
- 提供友好的跳转等待界面
- 支持一键复制链接地址

## 响应式布局

### 自适应高度计算

组件使用以下逻辑计算iframe高度，确保内容在各种布局下都能完整显示：

```typescript
/**
 * 计算并设置 iframe 容器高度
 * 减去90px以适应页面布局（如头部导航栏等）
 */
const calculateHeight = () => {
  containerHeight.value = `${document.documentElement.clientHeight - 90}px`
}
```

**高度计算说明:**

| 配置值 | 适用场景 | 说明 |
|--------|----------|------|
| `90px` | 标准导航 | 默认值，适用于有固定头部导航的页面 |
| `60px` | 紧凑导航 | 适用于较小的头部区域 |
| `120px` | 复合布局 | 适用于有头部和底部固定区域的页面 |
| `150px` | 多层导航 | 适用于有多级导航栏的复杂布局 |

### 窗口尺寸监听

组件自动监听窗口大小变化，实时调整iframe尺寸：

```typescript
onMounted(() => {
  // 初始计算高度
  calculateHeight()
  // 监听窗口大小变化
  window.addEventListener('resize', calculateHeight)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', calculateHeight)
})
```

**技术要点:**
- 使用`resize`事件监听窗口变化
- 组件挂载时立即计算初始高度
- 组件卸载时移除事件监听，防止内存泄漏

### 自定义高度配置

如需自定义高度计算逻辑，可以创建包装组件：

```vue
<template>
  <div
    class="custom-iframe-wrapper"
    :style="{ height: customHeight }"
  >
    <iframe
      class="w-full h-full border-none bg-white"
      :src="src"
      scrolling="auto"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface CustomIFrameProps {
  src: string
  /** 头部预留高度 */
  headerOffset?: number
  /** 底部预留高度 */
  footerOffset?: number
  /** 最小高度 */
  minHeight?: number
  /** 最大高度 */
  maxHeight?: number
}

const props = withDefaults(defineProps<CustomIFrameProps>(), {
  headerOffset: 90,
  footerOffset: 0,
  minHeight: 300,
  maxHeight: undefined
})

const viewportHeight = ref(0)

const customHeight = computed(() => {
  let height = viewportHeight.value - props.headerOffset - props.footerOffset

  // 应用最小高度限制
  if (height < props.minHeight) {
    height = props.minHeight
  }

  // 应用最大高度限制
  if (props.maxHeight && height > props.maxHeight) {
    height = props.maxHeight
  }

  return `${height}px`
})

const calculateHeight = () => {
  viewportHeight.value = document.documentElement.clientHeight
}

onMounted(() => {
  calculateHeight()
  window.addEventListener('resize', calculateHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateHeight)
})
</script>

<style scoped>
.custom-iframe-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>
```

**使用示例:**

```vue
<template>
  <CustomIFrame
    src="https://example.com"
    :header-offset="120"
    :footer-offset="60"
    :min-height="400"
    :max-height="800"
  />
</template>
```

## 安全考虑

### 跨域限制处理

在嵌入第三方页面时，需要注意跨域安全限制：

```vue
<template>
  <div class="secure-iframe-container">
    <!-- 安全状态指示器 -->
    <div v-if="securityStatus.checked" class="security-indicator">
      <el-tag :type="securityStatus.safe ? 'success' : 'warning'" size="small">
        {{ securityStatus.message }}
      </el-tag>
    </div>

    <!-- iframe容器 -->
    <div v-if="securityStatus.safe" class="iframe-wrapper">
      <IFrameContainer :src="sanitizedUrl" />
    </div>

    <!-- 安全警告 -->
    <div v-else class="security-warning">
      <el-alert
        title="安全提示"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <p>目标页面可能存在安全风险：</p>
          <ul>
            <li v-for="warning in securityStatus.warnings" :key="warning">
              {{ warning }}
            </li>
          </ul>
          <el-button
            type="warning"
            size="small"
            class="mt-2"
            @click="proceedAnyway"
          >
            我了解风险，继续访问
          </el-button>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

interface Props {
  url: string
  /** 受信任的域名列表 */
  trustedDomains?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  trustedDomains: () => ['example.com', 'trusted-site.com']
})

// 安全状态
const securityStatus = ref({
  checked: false,
  safe: false,
  message: '',
  warnings: [] as string[]
})

// 是否强制继续
const forceAccess = ref(false)

// URL清洗
const sanitizedUrl = computed(() => {
  try {
    const url = new URL(props.url)
    // 强制使用HTTPS
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
    }
    return url.toString()
  } catch {
    return ''
  }
})

// 安全检查
const checkSecurity = () => {
  const warnings: string[] = []

  try {
    const url = new URL(props.url)

    // 检查协议
    if (url.protocol === 'http:') {
      warnings.push('目标页面使用不安全的HTTP协议')
    }

    // 检查域名是否受信任
    const hostname = url.hostname
    const isTrusted = props.trustedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    )

    if (!isTrusted) {
      warnings.push(`域名 ${hostname} 不在信任列表中`)
    }

    // 检查是否包含可疑参数
    const suspiciousParams = ['javascript:', 'data:', 'vbscript:']
    for (const param of url.searchParams.values()) {
      if (suspiciousParams.some(s => param.toLowerCase().includes(s))) {
        warnings.push('URL参数中包含可疑内容')
        break
      }
    }

    securityStatus.value = {
      checked: true,
      safe: warnings.length === 0 || forceAccess.value,
      message: warnings.length === 0 ? '已验证安全' : '存在安全风险',
      warnings
    }
  } catch {
    securityStatus.value = {
      checked: true,
      safe: false,
      message: '无效的URL',
      warnings: ['无法解析目标URL']
    }
  }
}

// 强制继续访问
const proceedAnyway = () => {
  forceAccess.value = true
  checkSecurity()
}

// 监听URL变化
watch(() => props.url, () => {
  forceAccess.value = false
  checkSecurity()
}, { immediate: true })
</script>

<style scoped>
.secure-iframe-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.security-indicator {
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.iframe-wrapper {
  flex: 1;
  overflow: hidden;
}

.security-warning {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.security-warning ul {
  margin: 8px 0;
  padding-left: 20px;
}

.security-warning li {
  margin: 4px 0;
  color: var(--el-text-color-secondary);
}
</style>
```

### HTTPS要求

当主页面使用HTTPS时，嵌入的iframe内容也必须使用HTTPS：

```vue
<template>
  <div class="https-checker">
    <template v-if="isSecureContext">
      <IFrameContainer :src="secureUrl" />
    </template>
    <template v-else>
      <el-result
        icon="warning"
        title="混合内容警告"
        sub-title="在HTTPS页面中无法加载HTTP内容"
      >
        <template #extra>
          <el-button type="primary" @click="openInNewTab">
            在新标签页打开
          </el-button>
        </template>
      </el-result>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

interface Props {
  url: string
}

const props = defineProps<Props>()

// 检查是否为安全上下文
const isSecureContext = computed(() => {
  const parentIsHttps = window.location.protocol === 'https:'
  const targetIsHttps = props.url.startsWith('https://')

  // 如果父页面是HTTPS，目标也必须是HTTPS
  // 如果父页面是HTTP，则无限制
  return !parentIsHttps || targetIsHttps
})

// 安全URL
const secureUrl = computed(() => {
  if (props.url.startsWith('http://')) {
    return props.url.replace('http://', 'https://')
  }
  return props.url
})

// 新标签页打开
const openInNewTab = () => {
  window.open(props.url, '_blank')
}
</script>
```

### X-Frame-Options处理

某些网站通过响应头阻止被嵌入，需要提供回退方案：

```vue
<template>
  <div class="frame-with-fallback">
    <div v-if="loadError" class="fallback-view">
      <el-result
        icon="error"
        title="页面无法嵌入"
        :sub-title="errorMessage"
      >
        <template #extra>
          <div class="fallback-actions">
            <el-button type="primary" @click="openExternal">
              <el-icon><Link /></el-icon>
              在新窗口打开
            </el-button>
            <el-button @click="copyUrl">
              <el-icon><CopyDocument /></el-icon>
              复制链接
            </el-button>
            <el-button @click="retry">
              <el-icon><Refresh /></el-icon>
              重试
            </el-button>
          </div>
        </template>
      </el-result>
    </div>

    <div v-else class="iframe-container" :class="{ loading: isLoading }">
      <div v-if="isLoading" class="loading-overlay">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <span class="loading-text">加载中...</span>
      </div>
      <iframe
        ref="iframeRef"
        class="w-full h-full border-none"
        :src="url"
        @load="handleLoad"
        @error="handleError"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, CopyDocument, Refresh, Loading } from '@element-plus/icons-vue'

interface Props {
  url: string
}

const props = defineProps<Props>()

const iframeRef = ref<HTMLIFrameElement>()
const isLoading = ref(true)
const loadError = ref(false)
const errorMessage = ref('')

// 加载完成
const handleLoad = () => {
  isLoading.value = false

  // 尝试访问iframe内容以检测X-Frame-Options错误
  try {
    const doc = iframeRef.value?.contentDocument
    if (!doc) {
      // 可能被X-Frame-Options阻止
      loadError.value = true
      errorMessage.value = '目标页面禁止被嵌入（X-Frame-Options限制）'
    }
  } catch (e) {
    // 跨域访问错误是正常的，不代表加载失败
    console.log('Cross-origin frame access (expected)')
  }
}

// 加载错误
const handleError = () => {
  isLoading.value = false
  loadError.value = true
  errorMessage.value = '页面加载失败，请检查URL是否正确'
}

// 重试
const retry = () => {
  loadError.value = false
  isLoading.value = true
}

// 外部打开
const openExternal = () => {
  window.open(props.url, '_blank')
}

// 复制URL
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(props.url)
    ElMessage.success('链接已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 设置超时检测
onMounted(() => {
  setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false
      loadError.value = true
      errorMessage.value = '加载超时，目标页面响应过慢或无法访问'
    }
  }, 10000)
})
</script>

<style scoped>
.frame-with-fallback {
  height: calc(100vh - 90px);
  position: relative;
}

.iframe-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.iframe-container.loading iframe {
  visibility: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
  gap: 16px;
}

.loading-text {
  color: var(--el-text-color-secondary);
}

.fallback-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fallback-actions {
  display: flex;
  gap: 12px;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| src | iframe要加载的源地址URL | `string` | 任意有效URL | — |

### IFrameContainerProps接口

```typescript
/**
 * IFrame 容器组件的属性接口
 */
interface IFrameContainerProps {
  /**
   * iframe 要加载的源地址
   * 必填，必须是一个有效的 URL 字符串
   * @required
   * @example "https://example.com"
   * @example "/static/report.html"
   */
  src: string
}
```

### 相关组件对比

项目中存在两个相关的iframe组件，用途略有不同：

| 组件 | 路径 | 用途 | 高度偏移 |
|------|------|------|----------|
| `IFrameContainer` | `components/IFrameContainer/` | 通用iframe容器 | 90px |
| `InnerLink` | `layouts/components/AppMain/iframe/` | 布局系统内链 | 94.5px |

**InnerLink接口定义:**

```typescript
/**
 * IFrame 组件的 Props 接口定义
 * 用于布局系统中的内部链接展示
 */
interface IFrameProps {
  /**
   * iframe 的源地址 URL
   * @default '/'
   */
  src?: string

  /**
   * iframe 的唯一标识 ID
   * 必填，用于精确定位和操作特定的 iframe
   * @required
   */
  iframeId: string
}
```

### 内部方法

组件内部使用的方法说明：

```typescript
/**
 * 计算并设置 iframe 容器高度
 * 在组件挂载时和窗口resize时调用
 */
const calculateHeight = () => {
  // 减去90px，为了适应页面布局（如头部导航栏等）
  containerHeight.value = `${document.documentElement.clientHeight - 90}px`
}
```

### 样式类说明

组件使用Tailwind CSS工具类：

| 类名 | 作用 |
|------|------|
| `relative` | 相对定位，支持内部元素定位 |
| `w-full` | 宽度100% |
| `overflow-hidden` | 隐藏溢出内容 |
| `bg-gray-100` | 灰色背景，提供加载时的视觉反馈 |
| `block` | 块级显示 |
| `h-full` | 高度100% |
| `border-none` | 移除默认边框 |
| `bg-white` | 白色背景 |

## 主题定制

### CSS变量覆盖

可以通过CSS变量自定义组件外观：

```css
/* 自定义iframe容器样式 */
.custom-iframe-container {
  /* 容器背景色 */
  --iframe-bg-color: #f0f2f5;

  /* 容器边框 */
  --iframe-border-radius: 8px;
  --iframe-border-color: #e4e7ed;

  /* 阴影效果 */
  --iframe-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.custom-iframe-container :deep(.relative) {
  background-color: var(--iframe-bg-color);
  border-radius: var(--iframe-border-radius);
  border: 1px solid var(--iframe-border-color);
  box-shadow: var(--iframe-shadow);
}

.custom-iframe-container :deep(iframe) {
  border-radius: var(--iframe-border-radius);
}
```

### 暗黑模式适配

组件自动适应Element Plus暗黑模式：

```css
/* 暗黑模式样式调整 */
html.dark .iframe-wrapper {
  /* 暗黑模式下的背景色 */
  --iframe-bg-color: #1d1e1f;
  --iframe-border-color: #4c4d4f;
}

html.dark .iframe-wrapper :deep(.relative) {
  background-color: var(--iframe-bg-color);
}

html.dark .iframe-wrapper :deep(iframe) {
  /* 为iframe添加滤镜实现暗黑效果（可选） */
  /* filter: invert(1) hue-rotate(180deg); */
}
```

### 自定义加载状态

添加自定义加载动画：

```vue
<template>
  <div class="loading-iframe-container">
    <!-- 加载状态 -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-mask">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <span class="loading-text">页面加载中...</span>
        </div>
      </div>
    </transition>

    <!-- iframe -->
    <iframe
      ref="iframeRef"
      class="w-full border-none bg-white"
      :style="{ height: containerHeight }"
      :src="src"
      @load="isLoading = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
}

defineProps<Props>()

const isLoading = ref(true)
const containerHeight = ref('')

const calculateHeight = () => {
  containerHeight.value = `${document.documentElement.clientHeight - 90}px`
}

onMounted(() => {
  calculateHeight()
  window.addEventListener('resize', calculateHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateHeight)
})
</script>

<style scoped>
.loading-iframe-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid var(--el-border-color-lighter);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## 最佳实践

### 1. 合理使用条件渲染

避免不必要的iframe加载，使用条件渲染优化性能：

```vue
<template>
  <!-- ✅ 推荐：使用v-if延迟加载 -->
  <IFrameContainer v-if="shouldLoad" :src="url" />

  <!-- ❌ 不推荐：使用v-show会立即加载 -->
  <IFrameContainer v-show="isVisible" :src="url" />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

const isTabActive = ref(false)
const url = ref('https://example.com')

// 仅在需要时加载
const shouldLoad = computed(() => isTabActive.value && url.value)
</script>
```

### 2. 处理加载状态

提供良好的加载反馈：

```vue
<template>
  <div class="iframe-with-status">
    <div v-if="loading" class="status-bar loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>正在加载外部内容...</span>
    </div>
    <div v-else class="status-bar ready">
      <el-icon><Check /></el-icon>
      <span>加载完成</span>
    </div>
    <IFrameContainer :src="url" @load="loading = false" />
  </div>
</template>
```

### 3. 避免内存泄漏

在使用动态URL时，确保正确清理：

```vue
<script lang="ts" setup>
import { ref, watch, onUnmounted } from 'vue'

const currentUrl = ref('')
const iframeKey = ref(0)

// URL变化时强制重新创建iframe
watch(currentUrl, () => {
  iframeKey.value++
})

// 组件卸载时清理
onUnmounted(() => {
  currentUrl.value = ''
})
</script>

<template>
  <IFrameContainer :key="iframeKey" :src="currentUrl" />
</template>
```

### 4. 合理配置sandbox属性

根据需求配置iframe安全策略：

```vue
<template>
  <iframe
    :src="src"
    sandbox="allow-scripts allow-same-origin allow-forms"
    referrerpolicy="no-referrer"
  />
</template>
```

**sandbox选项说明:**

| 选项 | 作用 |
|------|------|
| `allow-scripts` | 允许执行脚本 |
| `allow-same-origin` | 允许同源请求 |
| `allow-forms` | 允许表单提交 |
| `allow-popups` | 允许弹出窗口 |
| `allow-modals` | 允许模态对话框 |

### 5. 提供降级方案

为不支持iframe的场景提供备选方案：

```vue
<template>
  <div class="iframe-fallback">
    <IFrameContainer
      v-if="supportsIframe"
      :src="url"
      @error="handleError"
    />
    <div v-else class="fallback-content">
      <p>您的浏览器不支持嵌入外部内容</p>
      <a :href="url" target="_blank" rel="noopener noreferrer">
        点击此处在新窗口打开
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const supportsIframe = ref(true)

const handleError = () => {
  supportsIframe.value = false
}
</script>
```

## 常见问题

### 1. 嵌入的页面显示空白

**问题原因:**
- 目标网站设置了`X-Frame-Options`响应头，禁止被嵌入
- 目标网站设置了`Content-Security-Policy`的frame-ancestors指令
- URL地址错误或网站无法访问
- HTTPS页面嵌入HTTP内容被阻止

**解决方案:**

```vue
<template>
  <div class="iframe-checker">
    <!-- 添加错误处理 -->
    <IFrameContainer
      v-if="!hasError"
      :src="url"
      @error="handleError"
    />

    <!-- 错误回退 -->
    <el-result
      v-else
      icon="warning"
      title="页面无法嵌入"
    >
      <template #sub-title>
        <p>目标页面禁止被嵌入，请尝试以下方式：</p>
        <ol class="error-tips">
          <li>在新标签页中打开链接</li>
          <li>联系管理员修改目标站点配置</li>
          <li>使用代理服务器转发请求</li>
        </ol>
      </template>
      <template #extra>
        <el-button type="primary" @click="openInNewTab">
          在新窗口打开
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{ url: string }>()

const hasError = ref(false)

const handleError = () => {
  hasError.value = true
}

const openInNewTab = () => {
  window.open(props.url, '_blank')
}
</script>
```

### 2. iframe高度计算不准确

**问题原因:**
- 页面布局复杂，固定区域高度不是90px
- 组件挂载时页面尚未完全渲染
- 存在动态变化的头部或底部区域

**解决方案:**

```vue
<template>
  <div
    ref="containerRef"
    class="dynamic-iframe"
    :style="{ height: calculatedHeight }"
  >
    <iframe :src="src" class="w-full h-full border-none" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{ src: string }>()

const containerRef = ref<HTMLElement>()
const windowHeight = ref(0)
const headerHeight = ref(0)
const footerHeight = ref(0)

// 动态计算高度
const calculatedHeight = computed(() => {
  const available = windowHeight.value - headerHeight.value - footerHeight.value
  return `${Math.max(available, 300)}px`
})

// 测量页面固定区域
const measureLayout = () => {
  windowHeight.value = document.documentElement.clientHeight

  // 测量实际的头部高度
  const header = document.querySelector('.layout-header')
  headerHeight.value = header?.getBoundingClientRect().height || 60

  // 测量实际的底部高度
  const footer = document.querySelector('.layout-footer')
  footerHeight.value = footer?.getBoundingClientRect().height || 0
}

onMounted(async () => {
  // 等待DOM完全渲染
  await nextTick()
  measureLayout()

  // 使用ResizeObserver监听布局变化
  const observer = new ResizeObserver(measureLayout)
  observer.observe(document.body)

  window.addEventListener('resize', measureLayout)
})

onUnmounted(() => {
  window.removeEventListener('resize', measureLayout)
})
</script>
```

### 3. 跨域通信问题

**问题原因:**
- 父页面和iframe页面不同源
- 未正确配置postMessage通信

**解决方案:**

```vue
<template>
  <div class="communicating-iframe">
    <IFrameContainer ref="iframeRef" :src="url" />

    <div class="message-panel">
      <el-input v-model="message" placeholder="输入消息" />
      <el-button @click="sendMessage">发送到iframe</el-button>
    </div>

    <div class="received-messages">
      <h4>收到的消息：</h4>
      <div v-for="(msg, index) in receivedMessages" :key="index">
        {{ msg }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

const props = defineProps<{ url: string }>()

const iframeRef = ref()
const message = ref('')
const receivedMessages = ref<string[]>([])

// 发送消息到iframe
const sendMessage = () => {
  const iframe = iframeRef.value?.$el?.querySelector('iframe')
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      { type: 'PARENT_MESSAGE', data: message.value },
      '*' // 生产环境应指定具体origin
    )
    message.value = ''
  }
}

// 接收iframe消息
const handleMessage = (event: MessageEvent) => {
  // 验证消息来源
  if (event.origin !== new URL(props.url).origin) {
    return
  }

  if (event.data?.type === 'IFRAME_MESSAGE') {
    receivedMessages.value.push(event.data.data)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>
```

### 4. 移动端适配问题

**问题原因:**
- 移动端浏览器对iframe的滚动支持有限
- 触摸事件穿透问题
- 视口尺寸计算差异

**解决方案:**

```vue
<template>
  <div
    class="mobile-iframe-container"
    :class="{ 'is-mobile': isMobile }"
  >
    <IFrameContainer :src="url" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

defineProps<{ url: string }>()

// 检测是否为移动设备
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
})
</script>

<style scoped>
.mobile-iframe-container {
  width: 100%;
  height: calc(100vh - 90px);
  overflow: hidden;
}

/* 移动端优化 */
.mobile-iframe-container.is-mobile {
  /* 启用滚动 */
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

.mobile-iframe-container.is-mobile :deep(iframe) {
  /* 移动端高度调整 */
  height: 100%;
  min-height: 500px;
}
</style>
```

### 5. SEO影响处理

**问题原因:**
- 搜索引擎无法索引iframe内的内容
- 影响页面的SEO得分

**解决方案:**

```vue
<template>
  <div class="seo-friendly-iframe">
    <!-- 为搜索引擎提供替代内容 -->
    <noscript>
      <p>此内容需要JavaScript支持。</p>
      <a :href="url" target="_blank">点击访问原始页面</a>
    </noscript>

    <!-- iframe内容 -->
    <IFrameContainer :src="url" />

    <!-- 隐藏的SEO友好链接 -->
    <a
      :href="url"
      class="sr-only"
      target="_blank"
      rel="noopener"
    >
      {{ title }}
    </a>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  url: string
  title: string
}>()
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

### 6. 性能优化

**问题原因:**
- 多个iframe同时加载导致性能下降
- iframe内容过大影响主页面渲染

**解决方案:**

```vue
<template>
  <div class="lazy-iframe" ref="containerRef">
    <template v-if="shouldLoad">
      <IFrameContainer :src="url" />
    </template>
    <template v-else>
      <div class="placeholder" @click="forceLoad">
        <el-icon :size="48"><VideoPlay /></el-icon>
        <span>点击加载内容</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

defineProps<{ url: string }>()

const containerRef = ref<HTMLElement>()
const isInView = ref(false)
const forceLoaded = ref(false)

const shouldLoad = ref(false)

// 强制加载
const forceLoad = () => {
  forceLoaded.value = true
  shouldLoad.value = true
}

// 使用IntersectionObserver实现懒加载
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isInView.value = true
        shouldLoad.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.1 }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})
</script>

<style scoped>
.lazy-iframe {
  width: 100%;
  min-height: 400px;
}

.placeholder {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.placeholder:hover {
  background: var(--el-fill-color);
}

.placeholder span {
  color: var(--el-text-color-secondary);
}
</style>
```

### 7. 打印支持

**问题原因:**
- iframe内容在打印时可能被截断
- 跨域iframe无法直接打印

**解决方案:**

```vue
<template>
  <div class="printable-iframe">
    <div class="print-toolbar no-print">
      <el-button @click="handlePrint">
        <el-icon><Printer /></el-icon>
        打印
      </el-button>
    </div>

    <IFrameContainer ref="iframeRef" :src="url" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

defineProps<{ url: string }>()

const iframeRef = ref()

const handlePrint = () => {
  const iframe = iframeRef.value?.$el?.querySelector('iframe')

  if (!iframe) {
    ElMessage.error('无法获取iframe元素')
    return
  }

  try {
    // 尝试直接打印iframe
    iframe.contentWindow?.print()
  } catch (e) {
    // 跨域情况下，在新窗口打开并打印
    const printWindow = window.open(iframe.src, '_blank')
    printWindow?.addEventListener('load', () => {
      printWindow.print()
    })
  }
}
</script>

<style scoped>
.print-toolbar {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

@media print {
  .no-print {
    display: none;
  }

  .printable-iframe :deep(iframe) {
    height: auto !important;
    min-height: 100vh;
  }
}
</style>
```

## 组件完整示例

### 综合使用示例

以下是一个综合了多种功能的完整示例：

```vue
<template>
  <div class="iframe-demo-container">
    <!-- 工具栏 -->
    <div class="demo-toolbar">
      <el-input
        v-model="urlInput"
        placeholder="输入URL地址"
        class="url-input"
        clearable
        @keyup.enter="loadUrl"
      >
        <template #prepend>
          <el-select v-model="protocol" style="width: 100px">
            <el-option label="https://" value="https://" />
            <el-option label="http://" value="http://" />
          </el-select>
        </template>
        <template #append>
          <el-button @click="loadUrl">加载</el-button>
        </template>
      </el-input>

      <div class="toolbar-actions">
        <el-button-group>
          <el-button @click="goBack" :disabled="!canGoBack">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button @click="goForward" :disabled="!canGoForward">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button @click="refresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-button-group>

        <el-button @click="openInNewTab">
          <el-icon><TopRight /></el-icon>
          新窗口打开
        </el-button>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <el-tag v-if="isLoading" type="warning" size="small">
          加载中...
        </el-tag>
        <el-tag v-else type="success" size="small">
          已加载
        </el-tag>
        <span class="current-url">{{ currentUrl }}</span>
      </div>
      <div class="status-right">
        <span class="timestamp">最后加载: {{ lastLoadTime }}</span>
      </div>
    </div>

    <!-- iframe内容 -->
    <div class="iframe-content">
      <IFrameContainer
        v-if="currentUrl"
        :key="refreshKey"
        :src="currentUrl"
        @load="handleLoad"
      />
      <el-empty v-else description="请输入URL地址" />
    </div>

    <!-- 历史记录 -->
    <div class="history-panel" v-if="showHistory">
      <h4>浏览历史</h4>
      <ul>
        <li
          v-for="(item, index) in history"
          :key="index"
          @click="navigateTo(item)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Refresh,
  TopRight
} from '@element-plus/icons-vue'
import IFrameContainer from '@/components/IFrameContainer/IFrameContainer.vue'

// 状态
const protocol = ref('https://')
const urlInput = ref('example.com')
const currentUrl = ref('')
const isLoading = ref(false)
const refreshKey = ref(0)
const lastLoadTime = ref('')
const showHistory = ref(false)

// 历史记录
const history = ref<string[]>([])
const historyIndex = ref(-1)

// 计算属性
const canGoBack = computed(() => historyIndex.value > 0)
const canGoForward = computed(() => historyIndex.value < history.value.length - 1)

// 加载URL
const loadUrl = () => {
  if (!urlInput.value) return

  const fullUrl = protocol.value + urlInput.value.replace(/^https?:\/\//, '')

  // 添加到历史记录
  if (currentUrl.value && currentUrl.value !== fullUrl) {
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(fullUrl)
    historyIndex.value = history.value.length - 1
  } else if (!currentUrl.value) {
    history.value.push(fullUrl)
    historyIndex.value = 0
  }

  currentUrl.value = fullUrl
  isLoading.value = true
}

// 处理加载完成
const handleLoad = () => {
  isLoading.value = false
  lastLoadTime.value = new Date().toLocaleTimeString()
}

// 后退
const goBack = () => {
  if (canGoBack.value) {
    historyIndex.value--
    currentUrl.value = history.value[historyIndex.value]
    refreshKey.value++
  }
}

// 前进
const goForward = () => {
  if (canGoForward.value) {
    historyIndex.value++
    currentUrl.value = history.value[historyIndex.value]
    refreshKey.value++
  }
}

// 刷新
const refresh = () => {
  refreshKey.value++
  isLoading.value = true
}

// 新窗口打开
const openInNewTab = () => {
  if (currentUrl.value) {
    window.open(currentUrl.value, '_blank')
  }
}

// 导航到指定URL
const navigateTo = (url: string) => {
  currentUrl.value = url
  historyIndex.value = history.value.indexOf(url)
  refreshKey.value++
}
</script>

<style scoped>
.iframe-demo-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.demo-toolbar {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.url-input {
  flex: 1;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-url {
  color: var(--el-text-color-secondary);
  max-width: 500px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timestamp {
  color: var(--el-text-color-placeholder);
}

.iframe-content {
  flex: 1;
  overflow: hidden;
}

.history-panel {
  position: absolute;
  right: 16px;
  top: 120px;
  width: 300px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--el-box-shadow);
}

.history-panel h4 {
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}

.history-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-panel li {
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.history-panel li:hover {
  background: var(--el-fill-color-light);
}
</style>
```

该示例展示了IFrameContainer组件在实际项目中的综合应用，包括URL输入、历史导航、刷新、新窗口打开等完整功能。
