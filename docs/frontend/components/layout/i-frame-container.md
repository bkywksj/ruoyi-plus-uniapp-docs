# IFrameContainer iframe容器组件

用于嵌入外部页面的iframe容器组件，支持响应式高度自适应和优雅的样式设计。

## 基础用法

最简单的使用方式，嵌入外部页面：

```vue
<template>
  <IFrameContainer src="https://example.com" />
</template>
```

## 嵌入文档或工具

常用于嵌入在线文档、表单或第三方工具：

```vue
<template>
  <div class="iframe-container">
    <h2 class="mb-4">产品文档</h2>
    <IFrameContainer src="https://docs.example.com/product-guide" />
  </div>
</template>
```

## 嵌入本地页面

也可以用于加载本地的HTML页面：

```vue
<template>
  <IFrameContainer src="/static/report.html" />
</template>
```

## 在弹窗中使用

结合弹窗组件使用，展示外部内容：

```vue
<template>
  <div>
    <el-button @click="showDialog = true">打开外部页面</el-button>
    
    <el-dialog
      v-model="showDialog"
      title="外部页面"
      width="80%"
      :before-close="handleClose"
    >
      <IFrameContainer src="https://example.com/dashboard" />
    </el-dialog>
  </div>
</template>

<script setup>
const showDialog = ref(false)

const handleClose = (done) => {
  done()
}
</script>
```

## 响应式布局示例

在不同布局中使用：

```vue
<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-semibold mb-4">数据可视化</h3>
      <IFrameContainer src="https://charts.example.com" />
    </div>
    
    <div class="bg-white rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-semibold mb-4">监控面板</h3>
      <IFrameContainer src="https://monitor.example.com" />
    </div>
  </div>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| src | iframe要加载的源地址 | `string` | — | — |

### IFrameContainerProps 接口

```typescript
interface IFrameContainerProps {
  /**
   * iframe 要加载的源地址
   * 必填，必须是一个有效的 URL 字符串
   */
  src: string
}
```

## 特性

- **自适应高度**：自动计算并设置合适的高度（视口高度 - 90px）
- **响应式设计**：监听窗口大小变化，动态调整尺寸
- **优雅样式**：提供美观的加载状态和边框样式
- **内存优化**：组件卸载时自动清理事件监听器
- **简洁设计**：专注于核心功能，保持组件轻量

## 样式说明

组件提供以下样式特性：

### 容器样式
- 相对定位容器，支持内部元素定位
- 100%宽度，动态计算高度
- 灰色背景（`bg-gray-100`），提供加载时的视觉反馈
- 隐藏溢出内容

### iframe样式
- 移除默认边框
- 白色背景
- 自动滚动条
- 块级显示，占满容器

## 使用场景

- **文档集成**：嵌入在线文档、API文档
- **第三方工具**：集成外部管理工具、监控面板
- **报表展示**：显示BI报表、数据可视化图表
- **表单系统**：嵌入外部表单或问卷系统
- **预览功能**：预览外部网页或文件
- **微前端**：作为微前端架构的容器组件

## 注意事项

1. **跨域限制**：某些网站可能通过X-Frame-Options阻止被嵌入
2. **HTTPS要求**：在HTTPS页面中只能嵌入HTTPS内容
3. **性能考虑**：嵌入的页面会增加整体页面的加载时间
4. **安全风险**：嵌入不信任的第三方内容存在安全风险
5. **移动端适配**：某些移动端浏览器对iframe支持有限
6. **SEO影响**：搜索引擎无法索引iframe内的内容

## 高度计算逻辑

组件使用以下逻辑计算iframe高度：

```typescript
const calculateHeight = () => {
  // 减去90px，为了适应页面布局（如头部导航栏等）
  containerHeight.value = `${document.documentElement.clientHeight - 90}px`
}
```

### 自定义高度调整

如需调整高度计算逻辑，可以修改减去的固定值：

- `90px`：适用于有固定头部导航的页面
- `60px`：适用于较小的头部区域
- `120px`：适用于有头部和底部固定区域的页面

## 事件处理

组件自动处理以下事件：

### 窗口大小变化
- 监听`window.resize`事件
- 实时调整iframe容器高度
- 组件卸载时自动清理监听器

### 生命周期管理
- `onMounted`：初始化高度计算和事件监听
- `onUnmounted`：清理事件监听器，防止内存泄漏

## 组件结构

```vue
<template>
  <div class="relative w-full overflow-hidden bg-gray-100" :style="{ height: containerHeight }">
    <iframe class="block w-full h-full border-none bg-white" :src="props.src" border="0" scrolling="auto" />
  </div>
</template>

<script setup lang="ts" name="IFrameContainer">
// 组件逻辑
</script>
```
