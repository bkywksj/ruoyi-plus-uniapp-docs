# 技术栈介绍

## 概述

Ruoyi-Plus-Uniapp 前端框架采用现代化的技术栈构建，基于 Vue 3 生态系统，结合 TypeScript、Vite 等先进技术，为企业级应用提供高性能、高可维护性的开发解决方案。

## 核心技术栈

### 🚀 前端框架

#### Vue 3
- **响应式系统**：基于 Proxy 的全新响应式系统，性能更优
- **Composition API**：更好的逻辑复用和代码组织
- **Tree-shaking**：更小的打包体积
- **TypeScript 支持**：原生支持 TypeScript，类型推导更准确

```vue
<script setup lang="ts">
// Composition API 示例
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
</script>
```

#### Vue Router 4
- **动态路由**：支持基于权限的动态路由生成
- **路由守卫**：完整的权限控制机制
- **嵌套路由**：支持多层级页面结构
- **TypeScript 集成**：完整的类型定义

### 📦 状态管理

#### Pinia
- **Vue 3 官方推荐**：替代 Vuex 的新一代状态管理库
- **TypeScript 友好**：原生 TypeScript 支持
- **模块化设计**：支持多个独立的 store
- **开发工具**：完整的 Vue DevTools 支持

```typescript
// Pinia store 示例
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const login = async (data: LoginData) => {
    // 登录逻辑
  }
  return { userInfo, login }
})
```

### 🛠️ 构建工具

#### Vite
- **极速冷启动**：基于 ESM 的开发服务器
- **HMR 热更新**：毫秒级的热更新体验
- **按需编译**：只编译当前页面相关代码
- **插件生态**：丰富的插件系统

#### TypeScript
- **静态类型检查**：编译时发现潜在错误
- **智能提示**：更好的 IDE 开发体验
- **代码重构**：安全的代码重构支持
- **接口定义**：完整的 API 类型定义

### 🎨 UI 组件库

#### Element Plus
- **企业级组件**：丰富的业务组件
- **主题定制**：支持深度主题定制
- **TypeScript 支持**：完整的类型定义
- **国际化**：内置多语言支持

#### Element Plus Icons
- **图标库**：1000+ 精美图标
- **按需加载**：自动按需引入
- **SVG 格式**：矢量图标，支持任意缩放

### 🎯 样式解决方案

#### UnoCSS
- **原子化 CSS**：即时的原子化 CSS 引擎
- **按需生成**：只生成使用到的样式
- **灵活配置**：支持自定义规则和预设
- **性能优异**：比传统 CSS 框架更快

```html
<!-- UnoCSS 示例 -->
<div class="flex items-center justify-center bg-blue-500 text-white p-4 rounded-lg">
  居中内容
</div>
```

#### Sass
- **CSS 预处理器**：支持变量、嵌套、混入等特性
- **模块化**：支持现代模块化语法
- **兼容性**：完全兼容标准 CSS

### 🔧 开发工具

#### 自动导入系统
- **unplugin-auto-import**：自动导入 Vue、VueUse 等 API
- **unplugin-vue-components**：自动导入组件
- **unplugin-icons**：自动导入图标组件

```typescript
// 无需手动导入
const count = ref(0) // 自动导入 ref
const { width } = useWindowSize() // 自动导入 useWindowSize
```

#### 代码质量工具
- **ESLint**：代码规范检查
- **Prettier**：代码格式化
- **Vue ESLint Config**：Vue 专用 ESLint 规则

### 📡 HTTP 请求

#### Axios
- **Promise 基础**：基于 Promise 的 HTTP 客户端
- **请求拦截**：统一的请求/响应处理
- **错误处理**：完善的错误处理机制
- **TypeScript 支持**：完整的类型定义

### 🌍 国际化

#### Vue I18n
- **多语言支持**：支持多种语言切换
- **懒加载**：按需加载语言包
- **格式化**：支持日期、数字格式化
- **插值**：支持动态内容插值

### 🛡️ 安全加密

#### 加密库
- **crypto-js**：AES 对称加密
- **jsencrypt**：RSA 非对称加密
- **双重加密**：请求数据安全传输

```typescript
// 加密示例
const aesKey = generateAesKey()
const encryptedData = encryptWithAes(data, aesKey)
const encryptedKey = rsaEncrypt(aesKey)
```

### 📊 数据可视化

#### ECharts
- **图表库**：丰富的图表类型
- **交互性**：支持图表交互
- **主题定制**：支持自定义主题
- **响应式**：自适应不同屏幕尺寸

### 🎮 功能增强

#### VueUse
- **组合式 API 工具集**：200+ 实用的组合式函数
- **响应式工具**：浏览器 API 的响应式封装
- **跨平台**：支持多种运行环境

#### 其他功能库
- **nprogress**：页面加载进度条
- **screenfull**：全屏功能
- **animate.css**：CSS 动画库
- **fuse.js**：模糊搜索

### 🗂️ 文件处理

- **file-saver**：文件下载
- **vue-cropper**：图片裁剪
- **image-conversion**：图片格式转换

## 兼容性支持

### 浏览器兼容性
- **Chrome** >= 87
- **Edge** >= 88
- **Safari** >= 14
- **Firefox** >= 78

### 环境要求
- **Node.js** >= 18.18.0
- **包管理器**：npm、yarn 或 pnpm（推荐）

## 技术栈优势

### 🚀 开发效率
- **热更新**：毫秒级的开发体验
- **自动导入**：减少重复的 import 代码
- **类型安全**：编译时错误检查
- **代码提示**：完整的智能提示

### 📦 性能优化
- **按需加载**：组件和样式按需引入
- **Tree Shaking**：自动移除未使用代码
- **代码分割**：路由级别的代码分割
- **资源压缩**：生产环境自动压缩

### 🛡️ 企业级特性
- **权限系统**：完整的 RBAC 权限控制
- **国际化**：多语言无缝切换
- **主题系统**：支持亮色/暗色主题
- **数据加密**：请求数据安全传输

### 🔧 工程化能力
- **代码规范**：ESLint + Prettier 统一代码风格
- **类型安全**：TypeScript 全面类型保障
- **自动化构建**：一键构建部署
- **环境配置**：灵活的多环境配置

## 总结

Ruoyi-Plus-Uniapp 框架基于现代化的前端技术栈，提供了完整的企业级应用开发解决方案。通过合理的技术选型和架构设计，既保证了开发效率，又确保了应用的性能和可维护性。无论是中小型项目还是大型企业应用，都能提供稳定可靠的技术支撑。
