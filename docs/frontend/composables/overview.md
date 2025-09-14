# 🎣 组合式函数概览

组合式函数（Composables）是 Vue 3 Composition API 的核心概念，它们是利用 Vue 的响应式 API 来封装和复用有状态逻辑的函数。我们的应用中包含了丰富的组合式函数，涵盖了各种业务场景。

## 📋 函数分类

### 🎨 动画相关
- **useAnimation** - 动画工具，基于 Animate.css 提供丰富的动画效果和管理功能

### 🔐 认证授权
- **useAuth** - 认证与授权，提供用户权限检查、角色校验和路由访问控制
- **useToken** - Token 管理，处理用户认证令牌的存储、获取和清除

### 🎛️ 界面控制
- **useDialog** - 对话框管理，提供对话框状态控制和操作方法
- **useResponsiveSpan** - 响应式栅格，提供基于屏幕或容器的响应式布局计算
- **useTableHeight** - 表格高度自适应，动态计算表格最佳高度确保内容完整显示
- **useTheme** - 主题管理，提供主题色设置、切换和自定义功能

### 📊 数据处理
- **useDict** - 字典数据，支持字典缓存、并行加载和错误处理
- **useSelection** - 表格选择管理，统一处理单选和多选，支持跨页选择
- **useDownload** - 文件下载，支持 Excel 导出、OSS 下载、ZIP 下载等

### 🌐 网络通信
- **useHttp** - HTTP 请求服务，基于 Axios 提供完整的请求拦截、响应处理和错误处理
- **useSSE** - 服务器推送事件，提供实时消息推送和动态退避重连策略
- **useWebSocket** - WebSocket 通信，支持自动重连、心跳检测和消息管理

### 🌍 国际化
- **useI18n** - 增强的国际化，扩展 Vue I18n 功能，支持多语言字段国际化

## 🚀 使用特点

### 响应式设计
所有组合式函数都采用 Vue 3 的响应式 API，提供实时的状态更新和自动的依赖追踪。

### 类型安全
完整的 TypeScript 支持，提供类型提示和编译时错误检查，确保代码质量。

### 统一接口
遵循一致的 API 设计模式，降低学习成本，提高开发效率。

### 错误处理
内置完善的错误处理机制，提供友好的错误提示和降级策略。

### 性能优化
采用防抖、缓存、懒加载等技术，确保应用性能。

## 💡 最佳实践

### 命名规范
- 所有组合式函数以 `use` 开头
- 使用清晰、描述性的函数名
- 返回对象使用解构的形式提供 API

### 状态管理
- 使用 `ref` 和 `reactive` 创建响应式状态
- 合理使用 `computed` 进行派生状态计算
- 及时清理副作用，避免内存泄漏

### 错误处理
- 统一使用 `[error, data]` 的返回格式
- 提供有意义的错误消息
- 实现优雅降级策略

## 📖 快速开始

在组件中使用组合式函数：

```vue
<template>
  <div>
    <el-button @click="handleDownload" :loading="downloading">
      下载文件
    </el-button>
  </div>
</template>

<script setup>
// 通过插件已经自动导入了，此处可以不用导入  
import { useDownload } from '@/composables/useDownload'

const { download, downloading } = useDownload()

const handleDownload = async () => {
  const [error] = await download('report.xlsx', '/api/export/report')
  if (!error) {
    console.log('下载成功')
  }
}
</script>
```

每个组合式函数都有详细的文档和示例，请查看相应的章节了解具体用法。
