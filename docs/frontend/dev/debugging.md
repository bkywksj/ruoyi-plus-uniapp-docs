# 调试技巧

前端项目的调试方法和工具使用指南。

## 🎯 调试工具概览

| 工具 | 用途 | 适用场景 |
|------|------|---------|
| **Vue DevTools** | Vue 组件调试 | 组件状态、Props、Events |
| **Browser DevTools** | 通用调试 | Network、Console、Sources |
| **VS Code Debugger** | 源码调试 | 断点调试、变量监控 |
| **Vite DevTools** | Vite 分析 | 模块依赖、性能分析 |
| **Console API** | 日志输出 | 快速调试、信息追踪 |

## 🔍 Vue DevTools

### 安装

**Chrome**：
- [Vue DevTools Extension](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

**Firefox**：
- [Vue DevTools Extension](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

**Standalone**：
```bash
npm install -g @vue/devtools
vue-devtools
```

### 功能面板

#### Components 面板

**查看组件树**：
- 组件层级关系
- 组件名称和路径
- 组件实例数量

**查看组件状态**：
```vue
<script setup>
const count = ref(0)
const userInfo = reactive({ name: 'John', age: 30 })
</script>
```

DevTools 中显示：
```
count: 0
userInfo: { name: 'John', age: 30 }
```

**编辑组件状态**：
- 双击值直接修改
- 实时查看组件响应

**查看组件 Props**：
```vue
<UserCard :name="userName" :age="userAge" />
```

Props 面板显示：
```
name: "John"
age: 30
```

**查看组件 Emits**：
- 触发的事件列表
- 事件参数
- 触发时间

#### Pinia 面板

**查看 Store 状态**：
```typescript
// stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null
  })
})
```

Pinia 面板显示：
- 所有 Store 列表
- Store 状态树
- Getters 计算值

**操作 Store**：
- 编辑状态值
- 查看 Actions 调用历史
- 时间旅行调试

#### Timeline 面板

**事件时间线**：
- 组件事件
- 路由导航
- Store 变更
- Performance 性能

**性能追踪**：
- 组件渲染时间
- 更新触发原因
- 性能瓶颈分析

#### Routes 面板

**当前路由信息**：
```
path: /system/user
name: SystemUser
params: {}
query: { id: '123' }
meta: { title: '用户管理' }
```

**路由历史**：
- 导航历史记录
- 跳转来源
- 导航守卫执行

## 🌐 浏览器 DevTools

### Console 面板

#### 基本日志

```typescript
console.log('普通日志')
console.info('信息日志')
console.warn('警告日志')
console.error('错误日志')
```

#### 格式化输出

```typescript
// 对象美化
console.log({ name: 'John', age: 30 })

// 表格展示
console.table([
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
])

// 分组输出
console.group('用户信息')
console.log('姓名: John')
console.log('年龄: 30')
console.groupEnd()
```

#### 性能计时

```typescript
console.time('数据加载')
await fetchData()
console.timeEnd('数据加载')
// 输出: 数据加载: 234.56ms
```

#### 追踪调用栈

```typescript
function processData() {
  console.trace('处理数据')  // 显示完整调用栈
}
```

### Network 面板

#### 请求监控

**查看 API 请求**：
- 请求方法 (GET/POST/PUT/DELETE)
- 请求 URL
- 状态码
- 响应时间
- 响应大小

**筛选请求**：
- XHR - API 请求
- Doc - HTML 文档
- CSS - 样式文件
- JS - 脚本文件
- Img - 图片资源

**查看请求详情**：
- **Headers**: 请求头、响应头
- **Payload**: 请求参数
- **Preview**: 响应预览
- **Response**: 原始响应
- **Timing**: 时间详情

#### 常见问题排查

**404 Not Found**：
```
请求 URL: http://localhost/api/user/list
检查: 后端路由是否正确
检查: API 代理配置是否正确
```

**401 Unauthorized**：
```
检查: Token 是否过期
检查: 请求头是否携带 Authorization
```

**500 Internal Server Error**：
```
检查: 后端日志
检查: 请求参数是否正确
```

**请求超时**：
```
检查: 后端服务是否启动
检查: 网络连接是否正常
检查: 代理配置是否正确
```

### Sources 面板

#### 断点调试

**设置断点**：
- 点击行号设置断点
- 条件断点：右键 → Add conditional breakpoint

```typescript
// 条件断点示例
function processUser(user) {
  // 断点条件: user.age > 18
  console.log(user)
}
```

**断点类型**：
- **普通断点**: 每次执行都暂停
- **条件断点**: 满足条件才暂停
- **日志断点**: 输出日志但不暂停

**控制按钮**：
- **Resume (F8)**: 继续执行
- **Step Over (F10)**: 单步跳过
- **Step Into (F11)**: 单步进入
- **Step Out (Shift+F11)**: 跳出函数

**监视变量**：
- Scope: 当前作用域变量
- Watch: 自定义监视表达式
- Call Stack: 调用栈

#### Source Maps

**启用 Source Map**：
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true  // 生成 Source Map
  }
})
```

**效果**：
- 调试时查看源代码而非编译后代码
- 定位错误到源文件行号

### Elements 面板

#### 检查元素

**查看 DOM 结构**：
- 选择元素查看 HTML
- 查看元素属性
- 查看元素尺寸

**编辑元素**：
- 双击编辑文本内容
- 编辑属性值
- 添加/删除属性

#### 样式调试

**查看样式**：
- Styles: 当前元素样式
- Computed: 计算后的样式
- Layout: 盒模型布局

**修改样式**：
- 实时修改 CSS 属性
- 查看样式优先级
- 查看样式来源

**常用技巧**：
```css
/* 快速隐藏元素 */
display: none !important;

/* 查看元素边界 */
outline: 1px solid red !important;

/* 禁用滚动 */
overflow: hidden !important;
```

## 💻 VS Code 调试

### launch.json 配置

`.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:80",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///./*": "${webRoot}/*",
        "webpack:///src/*": "${webRoot}/*",
        "webpack:///*": "*"
      }
    }
  ]
}
```

### 使用步骤

1. **启动开发服务器**：
```bash
pnpm dev
```

2. **启动调试**：
- VS Code 侧边栏 → Run and Debug (Ctrl+Shift+D)
- 点击 "Launch Chrome"

3. **设置断点**：
- 在代码行号左侧点击设置断点
- 红点表示断点已激活

4. **调试控制**：
- 变量监视
- 调用栈
- 断点管理

## 🔧 Vite 调试

### 开发模式调试

```bash
# 启动开发服务器（详细日志）
pnpm dev --debug

# 查看模块依赖
pnpm dev --debug hmr
```

### 构建调试

```bash
# 构建时显示详细信息
vite build --debug

# 生成构建报告
vite build --mode production
```

### 预构建依赖调试

```bash
# 强制重新预构建
rm -rf node_modules/.vite
pnpm dev
```

### 查看 Vite 配置

```typescript
// 打印实际使用的配置
export default defineConfig(({ command, mode }) => {
  const config = { /* ... */ }
  console.log('Vite Config:', config)
  return config
})
```

## 🎯 常见调试场景

### 组件不渲染

**排查步骤**：
1. Vue DevTools 检查组件是否挂载
2. Console 查看是否有错误
3. 检查组件注册是否正确
4. 检查路由配置

```typescript
// 检查组件注册
console.log('组件已挂载:', import.meta.url)
```

### 数据不更新

**排查步骤**：
1. Vue DevTools 查看响应式数据
2. 检查是否修改了响应式对象
3. 检查是否使用了错误的赋值方式

```typescript
// ✅ 正确 - 响应式更新
userInfo.value.name = 'John'

// ❌ 错误 - 失去响应式
userInfo.value = { name: 'John' }  // 需要用整个对象赋值
```

### API 请求失败

**排查步骤**：
1. Network 面板查看请求详情
2. 检查请求 URL 和参数
3. 检查响应状态码和错误信息
4. 检查后端日志

```typescript
// 添加请求拦截器调试
http.interceptors.request.use(config => {
  console.log('请求配置:', config)
  return config
})

// 添加响应拦截器调试
http.interceptors.response.use(
  response => {
    console.log('响应数据:', response)
    return response
  },
  error => {
    console.error('请求失败:', error)
    return Promise.reject(error)
  }
)
```

### 样式不生效

**排查步骤**：
1. Elements 面板检查元素样式
2. 检查样式优先级
3. 检查 CSS 选择器是否正确
4. 检查是否被其他样式覆盖

```vue
<style scoped>
/* 调试时添加 !important */
.container {
  color: red !important;
}
</style>
```

### 路由跳转失败

**排查步骤**：
1. Vue DevTools → Routes 查看当前路由
2. Console 查看路由错误
3. 检查路由配置
4. 检查导航守卫

```typescript
// 添加路由调试
router.beforeEach((to, from) => {
  console.log('路由跳转:', from.path, '->', to.path)
  return true
})
```

### 性能问题

**排查步骤**：
1. Performance 面板录制性能
2. Vue DevTools → Timeline 查看组件更新
3. 检查是否有大量重复渲染
4. 检查是否有内存泄漏

```typescript
// 监控组件渲染次数
let renderCount = 0
onMounted(() => {
  console.log('组件渲染次数:', ++renderCount)
})
```

## 🛠️ 调试技巧

### 使用 debugger 语句

```typescript
function processData(data) {
  debugger  // 浏览器会在此处暂停
  return data.map(item => item.value)
}
```

### 快速定位组件

```typescript
// 在组件中添加标识
console.log('[UserList] 组件加载')
console.log('[UserList] 数据:', data)
```

### 监控 Props 变化

```vue
<script setup>
const props = defineProps<{ userId: string }>()

watch(() => props.userId, (newVal, oldVal) => {
  console.log('userId 变化:', oldVal, '->', newVal)
})
</script>
```

### 监控 Store 变化

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({ token: '' }),
  actions: {
    setToken(token: string) {
      console.log('设置 token:', token)
      this.token = token
    }
  }
})
```

### 禁用缓存调试

Network 面板 → 勾选 "Disable cache"，避免缓存干扰。

### 模拟慢速网络

Network 面板 → Throttling → Slow 3G，测试慢速网络下的表现。

### 移动端调试

1. **Chrome 远程调试**：
   - chrome://inspect
   - 连接手机，启用 USB 调试

2. **vconsole**：
```bash
pnpm add vconsole
```

```typescript
// main.ts
import VConsole from 'vconsole'
if (import.meta.env.MODE === 'development') {
  new VConsole()
}
```

## 📊 调试检查清单

**开发阶段**：
- [ ] 组件是否正确渲染
- [ ] 数据是否正确绑定
- [ ] 事件是否正确触发
- [ ] 样式是否符合预期

**接口调试**：
- [ ] 请求 URL 是否正确
- [ ] 请求参数是否完整
- [ ] 响应数据格式是否正确
- [ ] 错误处理是否完善

**性能优化**：
- [ ] 组件是否重复渲染
- [ ] 是否有不必要的 API 请求
- [ ] 是否有内存泄漏
- [ ] 打包体积是否合理

## ❓ 常见问题

### 1. Vue DevTools 无法连接或检测不到应用

**问题描述：**

安装 Vue DevTools 扩展后，无法在 DevTools 中看到 Vue 面板，或者面板提示 "Vue.js not detected"：

```
Vue.js not detected

Make sure you are running a Vue.js app in development mode.
```

**问题原因：**

- Vue 应用运行在生产模式
- Vue DevTools 版本与 Vue 版本不兼容
- 浏览器扩展权限问题
- 跨域或 iframe 限制
- 页面加载顺序问题

**解决方案：**

```typescript
// 方案1：确保开发模式启用 DevTools
// vite.config.ts
export default defineConfig({
  define: {
    // 开发模式启用 DevTools
    __VUE_PROD_DEVTOOLS__: true
  }
})

// 方案2：在 main.ts 中手动配置
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 开发模式启用 DevTools
if (import.meta.env.DEV) {
  app.config.devtools = true
  app.config.performance = true
}

app.mount('#app')

// 方案3：检查是否正确安装
// 在控制台检查 Vue 是否正确加载
console.log('Vue version:', Vue.version)
console.log('DevTools enabled:', app.config.devtools)

// 方案4：使用独立版 DevTools（适用于扩展无法使用的情况）
// 安装独立版
// npm install -g @vue/devtools
// 运行
// vue-devtools

// 在应用中添加连接脚本
// index.html
// <script src="http://localhost:8098"></script>

// 方案5：检查扩展权限
// Chrome 设置:
// 1. 打开 chrome://extensions/
// 2. 找到 Vue.js devtools
// 3. 点击"详情"
// 4. 确保"允许访问文件网址"已启用
// 5. 确保扩展已启用

// 方案6：强制刷新扩展连接
// 在控制台运行
if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('Vue DevTools hook found')
  // 手动触发连接
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue)
}

// 方案7：检查 iframe 和跨域问题
// 如果应用在 iframe 中，需要确保父页面允许访问
// Content-Security-Policy 可能阻止 DevTools

// 在 vite.config.ts 中添加
server: {
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}

// 方案8：使用 devtools-next（Vue 3.4+）
// 安装新版 DevTools
// npm install --save-dev @vue/devtools-next

// vite.config.ts
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools()  // 添加 DevTools 插件
  ]
})

// 方案9：创建 DevTools 诊断工具
function diagnoseDevTools() {
  const diagnosis = {
    vueDetected: typeof Vue !== 'undefined',
    hookExists: !!window.__VUE_DEVTOOLS_GLOBAL_HOOK__,
    devMode: import.meta.env.DEV,
    vueVersion: Vue?.version || 'Not found',
    appInstance: !!document.querySelector('#app')?.__vue_app__
  }

  console.table(diagnosis)

  if (!diagnosis.hookExists) {
    console.warn('Vue DevTools hook not found. Please check:')
    console.warn('1. Vue DevTools extension is installed and enabled')
    console.warn('2. Page is running on http:// or https:// (not file://)')
    console.warn('3. Try refreshing the page after installing extension')
  }

  return diagnosis
}

// 在控制台运行
diagnoseDevTools()
```

### 2. 断点不生效或无法命中

**问题描述：**

在源代码中设置断点后，代码执行时断点没有触发，调试器不会暂停：

```typescript
// 设置断点后，代码直接执行完毕，断点未触发
function handleSubmit() {
  // 🔴 这里设置了断点，但不生效
  const data = form.value
  submitForm(data)
}
```

**问题原因：**

- Source Map 配置不正确
- 浏览器缓存了旧版本代码
- 代码被压缩/混淆，断点位置偏移
- 异步代码执行时机问题
- 热更新导致代码版本不一致
- 断点设置在未执行的代码分支

**解决方案：**

```typescript
// 方案1：确保 Source Map 正确配置
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true,  // 生产构建也生成 sourcemap
    minify: false     // 调试时禁用压缩
  },
  css: {
    devSourcemap: true  // CSS 也生成 sourcemap
  }
})

// 方案2：清除缓存并硬刷新
// 1. DevTools -> Network -> 勾选 "Disable cache"
// 2. Ctrl+Shift+R 或 Cmd+Shift+R 硬刷新
// 3. 或者在 Sources 面板右键 -> Clear cache and reload

// 方案3：使用 debugger 语句（最可靠的方式）
function handleSubmit() {
  debugger  // 浏览器一定会在这里暂停
  const data = form.value
  submitForm(data)
}

// 方案4：检查断点是否在正确的文件
// DevTools -> Sources -> 使用 Ctrl+P 搜索文件
// 确保打开的是源文件而不是编译后的文件

// 方案5：设置条件断点避免频繁触发
// 右键断点 -> Add conditional breakpoint
// 输入条件：userId === '123'

function processUser(user: User) {
  // 条件断点：user.role === 'admin'
  handleUserData(user)
}

// 方案6：使用日志断点（不暂停但输出日志）
// 右键断点 -> Add logpoint
// 输入日志内容：'User:', user, 'at', new Date()

// 方案7：处理异步代码断点
async function fetchData() {
  debugger  // 这里会触发

  const data = await api.getData()  // await 后可能不触发

  debugger  // 这里也会触发

  return data
}

// 对于 Promise 链，在每个步骤添加断点
api.getData()
  .then(data => {
    debugger  // Promise 回调中的断点
    return processData(data)
  })
  .then(result => {
    debugger  // 链式调用中的断点
    return result
  })

// 方案8：处理热更新导致的断点失效
// 热更新后断点可能失效，需要重新设置
// 在代码中使用 debugger 语句更可靠

// 方案9：VS Code 调试配置
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Chrome",
      "url": "http://localhost:80",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///./*": "${webRoot}/*",
        "webpack:///src/*": "${webRoot}/*",
        "webpack:///*": "*",
        "vite:///*": "*",
        "vite-source:///*": "*"
      },
      // 禁用跳过文件，确保所有断点都能触发
      "skipFiles": []
    }
  ]
}

// 方案10：创建断点诊断函数
function testBreakpoint(label: string) {
  console.log(`[Breakpoint Test] ${label}`)
  debugger  // 如果这里触发，说明调试器正常工作
  console.log(`[Breakpoint Test] ${label} - passed`)
}

// 在关键位置调用
testBreakpoint('before-submit')
handleSubmit()
testBreakpoint('after-submit')

// 方案11：检查是否在正确的执行上下文
// 有些断点可能在 Service Worker 或 iframe 中
// 确保在正确的上下文中设置断点
console.log('Current context:', {
  isMainFrame: window === window.top,
  isServiceWorker: typeof ServiceWorkerGlobalScope !== 'undefined',
  location: window.location.href
})
```

### 3. Source Map 配置问题导致无法定位源码

**问题描述：**

调试时 DevTools 显示的是编译后的代码而不是源代码，错误堆栈指向压缩后的文件：

```
Error: Something went wrong
    at c (app.d7f8a.js:1:12345)
    at e (app.d7f8a.js:1:23456)
    at t (app.d7f8a.js:1:34567)
```

**问题原因：**

- Source Map 未生成或未正确加载
- Source Map 路径配置错误
- 服务器未正确提供 Source Map 文件
- 浏览器禁用了 Source Map
- 构建配置问题

**解决方案：**

```typescript
// 方案1：完整的 Vite Source Map 配置
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],

  build: {
    // 开发模式使用 cheap-module-source-map（更快）
    // 生产模式使用 source-map（更准确）
    sourcemap: mode === 'production' ? 'source-map' : 'cheap-module-source-map',

    // 或者始终生成完整 sourcemap
    // sourcemap: true,

    // 如果使用 hidden 模式，sourcemap 不会链接到源文件
    // sourcemap: 'hidden',  // 生成但不引用

    // 如果只需要在错误追踪服务中使用
    // sourcemap: 'inline',  // 内联到文件中

    rollupOptions: {
      output: {
        // 确保 chunk 文件名包含哈希，避免缓存问题
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  css: {
    devSourcemap: true  // CSS Source Map
  },

  // 开发服务器配置
  server: {
    // 确保 sourcemap 文件可访问
    fs: {
      strict: false
    }
  }
}))

// 方案2：检查 Source Map 是否正确加载
// 在控制台执行
function checkSourceMap(jsUrl: string) {
  return fetch(jsUrl)
    .then(res => res.text())
    .then(content => {
      // 查找 sourceMappingURL
      const match = content.match(/\/\/# sourceMappingURL=(.+)/)
      if (match) {
        console.log('Source Map URL found:', match[1])
        return match[1]
      } else {
        console.warn('No sourceMappingURL found in', jsUrl)
        return null
      }
    })
}

// 检查主要的 JS 文件
checkSourceMap('/assets/index-abc123.js')

// 方案3：确保服务器正确提供 Source Map
// 检查 Source Map 文件是否可访问
async function verifySourceMapAccess(jsUrl: string) {
  const mapUrl = jsUrl + '.map'
  try {
    const response = await fetch(mapUrl)
    if (response.ok) {
      const map = await response.json()
      console.log('Source Map loaded successfully:')
      console.log('- Version:', map.version)
      console.log('- Sources:', map.sources?.length || 0, 'files')
      console.log('- Has sourcesContent:', !!map.sourcesContent)
      return true
    } else {
      console.error('Source Map not accessible:', response.status)
      return false
    }
  } catch (error) {
    console.error('Failed to load Source Map:', error)
    return false
  }
}

// 方案4：Nginx 配置提供 Source Map
/*
location ~ \.map$ {
    add_header Access-Control-Allow-Origin *;
    add_header Content-Type application/json;
}

# 或者限制只有内部可访问
location ~ \.map$ {
    # 只允许内网访问
    allow 192.168.0.0/16;
    allow 10.0.0.0/8;
    deny all;
}
*/

// 方案5：修复路径映射问题
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug with Source Maps",
      "url": "http://localhost:80",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        // Vite 路径映射
        "/src/*": "${webRoot}/src/*",

        // Webpack 路径映射
        "webpack:///./*": "${webRoot}/*",
        "webpack:///src/*": "${webRoot}/src/*",

        // 通用映射
        "file:///*": "*",
        "/*": "${webRoot}/*"
      },
      // 调试 sourcemap 加载
      "trace": true
    }
  ]
}

// 方案6：启用浏览器 Source Map 支持
// Chrome DevTools:
// 1. 打开 DevTools -> Settings (F1)
// 2. Preferences -> Sources
// 3. 勾选 "Enable JavaScript source maps"
// 4. 勾选 "Enable CSS source maps"

// 方案7：处理第三方库的 Source Map
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 需要预构建的依赖
    include: ['lodash-es', 'axios'],
    // 保留 sourcemap
    esbuildOptions: {
      sourcemap: true
    }
  }
})

// 方案8：内联 Source Map（调试时使用）
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === 'development' ? 'inline' : true
  }
}))

// 方案9：创建 Source Map 诊断工具
async function diagnoseSourceMaps() {
  const scripts = document.querySelectorAll('script[src]')
  const results: { url: string; hasMap: boolean; mapAccessible: boolean }[] = []

  for (const script of scripts) {
    const src = (script as HTMLScriptElement).src
    if (!src.includes('.js')) continue

    try {
      const response = await fetch(src)
      const content = await response.text()
      const hasMap = content.includes('sourceMappingURL')

      let mapAccessible = false
      if (hasMap) {
        const match = content.match(/sourceMappingURL=(.+)/)
        if (match) {
          const mapUrl = new URL(match[1], src).href
          const mapResponse = await fetch(mapUrl)
          mapAccessible = mapResponse.ok
        }
      }

      results.push({ url: src, hasMap, mapAccessible })
    } catch (error) {
      results.push({ url: src, hasMap: false, mapAccessible: false })
    }
  }

  console.table(results)
  return results
}

// 运行诊断
diagnoseSourceMaps()

// 方案10：使用 @sentry/vite-plugin 上传 Source Map
// 适用于错误监控服务
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**'
      }
    })
  ],
  build: {
    sourcemap: true  // 必须生成 sourcemap
  }
})
```

### 4. 热更新（HMR）不生效或页面不刷新

**问题描述：**

修改代码后，浏览器没有自动刷新或更新，需要手动刷新才能看到变化：

```bash
# 控制台显示 HMR 更新，但页面没有变化
[vite] hmr update /src/components/UserCard.vue

# 或者出现 HMR 错误
[vite] hmr invalidate /src/stores/user.ts Could not Fast Refresh.
```

**问题原因：**

- WebSocket 连接失败
- 网络代理或防火墙阻止
- 组件状态导致无法热更新
- 文件监听失效
- Vite 配置问题
- 浏览器缓存问题

**解决方案：**

```typescript
// 方案1：配置 HMR 连接参数
// vite.config.ts
export default defineConfig({
  server: {
    // HMR 配置
    hmr: {
      // 使用不同的协议（默认 ws，可尝试 wss）
      protocol: 'ws',

      // 指定主机（用于容器或反向代理环境）
      host: 'localhost',

      // 指定端口
      port: 24678,

      // 禁用覆盖层（某些情况下可解决问题）
      overlay: true,

      // 超时时间（毫秒）
      timeout: 30000
    },

    // 文件监听配置
    watch: {
      // 使用轮询（某些文件系统需要）
      usePolling: true,

      // 轮询间隔
      interval: 100,

      // 忽略 node_modules
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  }
})

// 方案2：处理 WSL/Docker 环境
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',  // 允许外部访问
    hmr: {
      // Docker 或 WSL 环境使用客户端主机
      clientPort: 80,  // 或者你的实际端口
      host: 'localhost'
    },
    watch: {
      // WSL 需要轮询
      usePolling: true
    }
  }
})

// 方案3：检查 WebSocket 连接
// 在浏览器控制台执行
function checkHMRConnection() {
  // 检查 WebSocket 连接
  const wsUrl = `ws://${location.hostname}:${location.port}/__vite_hmr`

  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('✅ HMR WebSocket 连接成功')
    ws.close()
  }

  ws.onerror = (error) => {
    console.error('❌ HMR WebSocket 连接失败:', error)
    console.log('检查项:')
    console.log('1. 开发服务器是否正在运行')
    console.log('2. 防火墙是否阻止了 WebSocket')
    console.log('3. 是否使用了代理或 VPN')
  }

  ws.onclose = (event) => {
    if (event.code !== 1000) {
      console.warn('WebSocket 非正常关闭:', event.code, event.reason)
    }
  }
}

checkHMRConnection()

// 方案4：处理组件热更新问题
// 某些情况下需要标记组件不使用 HMR
// MyComponent.vue
<script lang="ts" setup>
// @ts-ignore
if (import.meta.hot) {
  // 接受自身热更新
  import.meta.hot.accept()

  // 或者完全刷新
  // import.meta.hot.invalidate()
}
</script>

// 方案5：处理 Store 热更新
// stores/user.ts
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({ token: '' }),
  actions: {
    setToken(token: string) {
      this.token = token
    }
  }
})

// 启用 Store 热更新
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}

// 方案6：处理 CSS 热更新问题
// 确保 CSS 正确配置
// vite.config.ts
export default defineConfig({
  css: {
    // 启用 CSS 模块
    modules: {
      localsConvention: 'camelCase'
    },
    // 预处理器配置
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})

// 方案7：清除 Vite 缓存
// 删除缓存目录
// rm -rf node_modules/.vite
// 然后重新启动开发服务器

// 或者在配置中禁用预构建缓存
export default defineConfig({
  optimizeDeps: {
    force: true  // 强制重新预构建
  },
  cacheDir: '.vite-cache-new'  // 使用新缓存目录
})

// 方案8：监控 HMR 事件
// 在代码中添加 HMR 事件监听
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('[HMR] 即将更新:', payload)
  })

  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('[HMR] 更新完成:', payload)
  })

  import.meta.hot.on('vite:error', (payload) => {
    console.error('[HMR] 更新失败:', payload)
  })

  import.meta.hot.on('vite:ws:disconnect', () => {
    console.warn('[HMR] WebSocket 断开连接')
  })

  import.meta.hot.on('vite:ws:connect', () => {
    console.log('[HMR] WebSocket 已连接')
  })
}

// 方案9：创建 HMR 诊断工具
function diagnoseHMR() {
  const diagnosis = {
    hmrAvailable: !!import.meta.hot,
    wsProtocol: location.protocol === 'https:' ? 'wss' : 'ws',
    wsHost: location.hostname,
    wsPort: location.port || (location.protocol === 'https:' ? '443' : '80'),
    isSecureContext: window.isSecureContext,
    serviceWorkerActive: !!navigator.serviceWorker?.controller
  }

  console.table(diagnosis)

  // 检查可能的问题
  if (diagnosis.serviceWorkerActive) {
    console.warn('⚠️ Service Worker 可能干扰 HMR，考虑在开发时禁用')
  }

  if (!diagnosis.hmrAvailable) {
    console.error('❌ HMR 不可用，可能是生产构建或配置问题')
  }

  return diagnosis
}

diagnoseHMR()

// 方案10：使用环境变量控制 HMR
// .env.development
VITE_HMR_HOST=localhost
VITE_HMR_PORT=24678

// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: Number(process.env.VITE_HMR_PORT) || 24678
    }
  }
})
```

### 5. Console 日志在生产环境泄露敏感信息

**问题描述：**

开发时添加的 console.log 语句在生产环境中没有被移除，导致敏感信息泄露：

```typescript
// 这些日志在生产环境中不应该出现
console.log('用户 Token:', userToken)
console.log('API 响应:', sensitiveData)
console.log('密码:', password)
```

**问题原因：**

- 没有配置构建时移除 console
- 开发调试代码忘记删除
- 没有使用统一的日志管理
- 环境判断逻辑不正确

**解决方案：**

```typescript
// 方案1：Vite 构建时移除 console
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    // 生产环境移除 console 和 debugger
    drop: ['console', 'debugger']
  }
})

// 或者只移除特定的 console 方法
export default defineConfig({
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.trace']
    // 保留 console.error 和 console.warn
  }
})

// 方案2：使用 Terser 配置（更精细控制）
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // 移除所有 console
        drop_debugger: true,     // 移除 debugger
        pure_funcs: ['console.log', 'console.debug']  // 移除特定函数
      },
      format: {
        comments: false  // 移除注释
      }
    }
  }
})

// 方案3：创建安全的日志工具
// utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  enabled: boolean
  prefix: string
}

const config: LoggerConfig = {
  level: import.meta.env.DEV ? 'debug' : 'error',
  enabled: import.meta.env.DEV,
  prefix: '[App]'
}

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

function shouldLog(level: LogLevel): boolean {
  if (!config.enabled && level !== 'error') return false
  return levelPriority[level] >= levelPriority[config.level]
}

function sanitize(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization']
  const sanitized = { ...data as object }

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      (sanitized as Record<string, unknown>)[key] = '[REDACTED]'
    }
  }

  return sanitized
}

export const logger = {
  debug(...args: unknown[]) {
    if (shouldLog('debug')) {
      console.debug(config.prefix, ...args.map(sanitize))
    }
  },

  info(...args: unknown[]) {
    if (shouldLog('info')) {
      console.info(config.prefix, ...args.map(sanitize))
    }
  },

  warn(...args: unknown[]) {
    if (shouldLog('warn')) {
      console.warn(config.prefix, ...args.map(sanitize))
    }
  },

  error(...args: unknown[]) {
    if (shouldLog('error')) {
      console.error(config.prefix, ...args.map(sanitize))
    }
  },

  // 时间追踪
  time(label: string) {
    if (shouldLog('debug')) {
      console.time(`${config.prefix} ${label}`)
    }
  },

  timeEnd(label: string) {
    if (shouldLog('debug')) {
      console.timeEnd(`${config.prefix} ${label}`)
    }
  },

  // 分组
  group(label: string) {
    if (shouldLog('debug')) {
      console.group(`${config.prefix} ${label}`)
    }
  },

  groupEnd() {
    if (shouldLog('debug')) {
      console.groupEnd()
    }
  },

  // 表格
  table(data: unknown) {
    if (shouldLog('debug')) {
      console.table(sanitize(data))
    }
  }
}

// 使用示例
logger.debug('用户信息:', { name: 'John', password: '123456' })
// 输出: [App] 用户信息: { name: 'John', password: '[REDACTED]' }

// 方案4：使用 ESLint 规则禁止裸 console
// .eslintrc.js
module.exports = {
  rules: {
    'no-console': ['error', {
      allow: ['warn', 'error']
    }]
  }
}

// 方案5：使用自定义 Vite 插件
// plugins/remove-console.ts
import type { Plugin } from 'vite'

export function removeConsole(): Plugin {
  return {
    name: 'remove-console',
    apply: 'build',
    transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.js') && !id.endsWith('.vue')) {
        return null
      }

      // 移除 console.log 和 console.debug
      const cleaned = code
        .replace(/console\.log\([^)]*\);?/g, '')
        .replace(/console\.debug\([^)]*\);?/g, '')

      return cleaned
    }
  }
}

// vite.config.ts
import { removeConsole } from './plugins/remove-console'

export default defineConfig({
  plugins: [vue(), removeConsole()]
})

// 方案6：环境感知的调试装饰器
function devOnly<T extends (...args: any[]) => any>(fn: T): T {
  if (import.meta.env.DEV) {
    return fn
  }
  return (() => {}) as T
}

// 只在开发环境执行
const debugLog = devOnly((message: string, data?: unknown) => {
  console.log(`[Debug] ${message}`, data)
})

debugLog('测试消息', { foo: 'bar' })

// 方案7：创建调试模块开关
// utils/debug.ts
const DEBUG_MODULES = {
  api: import.meta.env.VITE_DEBUG_API === 'true',
  router: import.meta.env.VITE_DEBUG_ROUTER === 'true',
  store: import.meta.env.VITE_DEBUG_STORE === 'true'
}

export function createDebugger(module: keyof typeof DEBUG_MODULES) {
  const enabled = DEBUG_MODULES[module]

  return {
    log: enabled ? console.log.bind(console, `[${module}]`) : () => {},
    warn: enabled ? console.warn.bind(console, `[${module}]`) : () => {},
    error: console.error.bind(console, `[${module}]`)  // 错误始终输出
  }
}

// 使用
const apiDebug = createDebugger('api')
apiDebug.log('请求开始:', url)  // 只在 VITE_DEBUG_API=true 时输出

// 方案8：Git hooks 防止提交 console.log
// .husky/pre-commit
#!/bin/sh
# 检查是否有 console.log
if git diff --cached --name-only | xargs grep -l 'console\.log' 2>/dev/null; then
  echo "Error: console.log found in staged files"
  exit 1
fi

// 或使用 lint-staged
// package.json
{
  "lint-staged": {
    "*.{ts,vue}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

### 6. 内存泄漏问题排查

**问题描述：**

应用运行一段时间后变得越来越慢，内存使用持续增长，最终可能导致页面崩溃：

```typescript
// 常见的内存泄漏场景
setInterval(() => {
  fetchData()  // 定时器未清理
}, 1000)

element.addEventListener('click', handler)  // 事件未移除

const cache = new Map()
cache.set(key, largeData)  // 缓存无限增长
```

**问题原因：**

- 定时器未清理
- 事件监听器未移除
- 闭包持有大对象引用
- 全局变量累积
- DOM 引用未释放
- 未取消的异步操作

**解决方案：**

```typescript
// 方案1：正确清理 Vue 组件中的副作用
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

const timerId = ref<number | null>(null)
const eventTarget = ref<HTMLElement | null>(null)

// 定时器
onMounted(() => {
  timerId.value = window.setInterval(() => {
    fetchData()
  }, 1000)
})

onUnmounted(() => {
  if (timerId.value !== null) {
    clearInterval(timerId.value)
    timerId.value = null
  }
})

// 事件监听
const handleResize = () => {
  console.log('窗口大小变化')
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

// 方案2：使用 VueUse 自动清理
import { useIntervalFn, useEventListener } from '@vueuse/core'

// 自动清理的定时器
const { pause, resume } = useIntervalFn(() => {
  fetchData()
}, 1000)

// 自动清理的事件监听
useEventListener(window, 'resize', () => {
  console.log('窗口大小变化')
})

// 方案3：创建安全的订阅管理器
class SubscriptionManager {
  private subscriptions: Array<() => void> = []

  add(cleanup: () => void): void {
    this.subscriptions.push(cleanup)
  }

  addInterval(callback: () => void, ms: number): void {
    const id = setInterval(callback, ms)
    this.add(() => clearInterval(id))
  }

  addTimeout(callback: () => void, ms: number): void {
    const id = setTimeout(callback, ms)
    this.add(() => clearTimeout(id))
  }

  addEventListener<K extends keyof WindowEventMap>(
    target: Window | HTMLElement,
    type: K,
    listener: (ev: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener as EventListener, options)
    this.add(() => target.removeEventListener(type, listener as EventListener, options))
  }

  cleanup(): void {
    this.subscriptions.forEach(fn => fn())
    this.subscriptions = []
  }
}

// 在 Vue 组件中使用
const subs = new SubscriptionManager()

onMounted(() => {
  subs.addInterval(() => fetchData(), 1000)
  subs.addEventListener(window, 'resize', handleResize)
})

onUnmounted(() => {
  subs.cleanup()
})

// 方案4：使用 AbortController 取消异步操作
const controller = ref<AbortController | null>(null)

const fetchData = async () => {
  // 取消之前的请求
  controller.value?.abort()
  controller.value = new AbortController()

  try {
    const response = await fetch('/api/data', {
      signal: controller.value.signal
    })
    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('请求已取消')
      return null
    }
    throw error
  }
}

onUnmounted(() => {
  controller.value?.abort()
})

// 方案5：使用 Chrome DevTools 检测内存泄漏
// 1. 打开 DevTools -> Memory
// 2. 选择 "Heap snapshot"
// 3. 执行可疑操作（如打开/关闭模态框）
// 4. 再次拍摄快照
// 5. 选择 "Comparison" 对比两次快照
// 6. 查看增长的对象

// 创建内存泄漏检测工具
class MemoryLeakDetector {
  private snapshots: number[] = []
  private intervalId: number | null = null

  start(intervalMs = 5000): void {
    this.intervalId = window.setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedHeap = memory.usedJSHeapSize / 1024 / 1024

        this.snapshots.push(usedHeap)

        // 保留最近 10 个快照
        if (this.snapshots.length > 10) {
          this.snapshots.shift()
        }

        // 检测持续增长
        if (this.snapshots.length >= 5) {
          const isGrowing = this.snapshots.every((val, i, arr) => {
            return i === 0 || val >= arr[i - 1]
          })

          if (isGrowing) {
            console.warn('⚠️ 可能存在内存泄漏，内存持续增长')
            console.log('内存趋势:', this.snapshots.map(v => v.toFixed(2) + 'MB'))
          }
        }
      }
    }, intervalMs)
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  report(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.table({
        'Used Heap (MB)': (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        'Total Heap (MB)': (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
        'Heap Limit (MB)': (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
      })
    } else {
      console.log('此浏览器不支持 performance.memory')
    }
  }
}

// 使用
const detector = new MemoryLeakDetector()
detector.start()  // 开始监控
detector.report()  // 输出当前内存状态

// 方案6：使用 WeakMap 和 WeakRef 避免内存泄漏
// 缓存系统使用 WeakMap
const elementCache = new WeakMap<HTMLElement, any>()

// 设置缓存
const element = document.querySelector('.item') as HTMLElement
elementCache.set(element, { data: 'some data' })

// 当 element 被垃圾回收后，缓存也会自动清理

// 使用 WeakRef 持有可能被回收的引用
class WeakCache<T extends object> {
  private cache = new Map<string, WeakRef<T>>()
  private registry = new FinalizationRegistry<string>((key) => {
    this.cache.delete(key)
  })

  set(key: string, value: T): void {
    const ref = new WeakRef(value)
    this.cache.set(key, ref)
    this.registry.register(value, key)
  }

  get(key: string): T | undefined {
    return this.cache.get(key)?.deref()
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }
}

// 方案7：限制缓存大小
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined

    // 移到最后（最近使用）
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
}

// 使用 LRU 缓存
const dataCache = new LRUCache<string, any>(50)
dataCache.set('user-1', userData)

// 方案8：组件内存诊断
function diagnoseComponent(name: string) {
  console.group(`[Memory Diagnosis] ${name}`)

  // 检查全局变量
  const globalVars = Object.keys(window).length
  console.log('全局变量数量:', globalVars)

  // 检查 DOM 节点
  const domNodes = document.querySelectorAll('*').length
  console.log('DOM 节点数量:', domNodes)

  // 检查事件监听器（仅 Chrome）
  if ('getEventListeners' in window) {
    console.log('提示: 使用 getEventListeners(element) 检查元素的事件监听器')
  }

  console.groupEnd()
}

diagnoseComponent('UserList')
```

### 7. 异步代码调试困难

**问题描述：**

在调试异步代码（Promise、async/await、回调）时，难以追踪执行流程，断点不按预期触发，错误堆栈不完整：

```typescript
// 调试这类代码时很难追踪执行顺序
async function processData() {
  const users = await fetchUsers()
  const orders = await Promise.all(users.map(u => fetchOrders(u.id)))
  return orders.flat()
}

// 错误堆栈可能丢失上下文
setTimeout(() => {
  throw new Error('异步错误')  // 堆栈只显示 setTimeout
}, 1000)
```

**问题原因：**

- 异步代码执行顺序不直观
- Promise 链中断点不易设置
- 错误堆栈在异步边界被截断
- 并发执行难以追踪
- 调试器的 async 支持不完善

**解决方案：**

```typescript
// 方案1：启用 async 堆栈追踪
// Chrome DevTools -> Settings -> Experiments
// 勾选 "Enable async stack traces"

// 或者在代码中添加标记
Error.stackTraceLimit = Infinity  // 保留完整堆栈

// 方案2：使用 console.trace 追踪异步调用
async function fetchUserData(userId: string) {
  console.trace(`[fetchUserData] 开始获取用户 ${userId}`)

  const user = await api.getUser(userId)
  console.trace(`[fetchUserData] 用户数据已获取`)

  return user
}

// 方案3：创建异步追踪包装器
function traceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  const callStack = new Error().stack

  console.log(`[${name}] 开始执行`)
  console.log(`调用栈:\n${callStack}`)

  return fn()
    .then(result => {
      const duration = performance.now() - startTime
      console.log(`[${name}] 成功完成 (${duration.toFixed(2)}ms)`)
      return result
    })
    .catch(error => {
      const duration = performance.now() - startTime
      console.error(`[${name}] 失败 (${duration.toFixed(2)}ms)`)
      console.error(`原始调用栈:\n${callStack}`)
      console.error(`错误:`, error)
      throw error
    })
}

// 使用
const users = await traceAsync('fetchUsers', () => api.getUsers())

// 方案4：使用 debugger 语句在关键点暂停
async function complexFlow() {
  debugger  // 步骤 1: 开始

  const users = await fetchUsers()
  debugger  // 步骤 2: 用户获取完成

  const enriched = await Promise.all(
    users.map(async user => {
      debugger  // 步骤 3: 每个用户处理
      return enrichUser(user)
    })
  )
  debugger  // 步骤 4: 所有处理完成

  return enriched
}

// 方案5：为 Promise 添加可调试的包装
class DebuggablePromise<T> extends Promise<T> {
  private name: string

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void,
    name = 'Anonymous'
  ) {
    super((resolve, reject) => {
      console.log(`[Promise:${name}] 创建`)
      executor(
        (value) => {
          console.log(`[Promise:${name}] Resolved:`, value)
          resolve(value)
        },
        (reason) => {
          console.error(`[Promise:${name}] Rejected:`, reason)
          reject(reason)
        }
      )
    })
    this.name = name
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    console.log(`[Promise:${this.name}] .then() 调用`)
    return super.then(onfulfilled, onrejected)
  }
}

// 使用
const result = await new DebuggablePromise<User>(
  (resolve) => {
    setTimeout(() => resolve({ id: '1', name: 'John' }), 1000)
  },
  'FetchUser'
)

// 方案6：并发调试工具
async function debugConcurrent<T>(
  tasks: Array<{ name: string; task: () => Promise<T> }>
): Promise<T[]> {
  console.group('并发任务执行')
  console.time('总耗时')

  const results = await Promise.all(
    tasks.map(async ({ name, task }) => {
      console.time(name)
      try {
        const result = await task()
        console.timeEnd(name)
        console.log(`✓ ${name} 完成`)
        return result
      } catch (error) {
        console.timeEnd(name)
        console.error(`✗ ${name} 失败:`, error)
        throw error
      }
    })
  )

  console.timeEnd('总耗时')
  console.groupEnd()

  return results
}

// 使用
const [users, orders, products] = await debugConcurrent([
  { name: '获取用户', task: () => api.getUsers() },
  { name: '获取订单', task: () => api.getOrders() },
  { name: '获取产品', task: () => api.getProducts() }
])

// 方案7：使用 Performance API 追踪异步操作
const asyncTracker = {
  marks: new Map<string, number>(),

  start(name: string): void {
    this.marks.set(name, performance.now())
    performance.mark(`${name}-start`)
  },

  end(name: string): number {
    const startTime = this.marks.get(name)
    performance.mark(`${name}-end`)

    if (startTime) {
      const duration = performance.now() - startTime
      performance.measure(name, `${name}-start`, `${name}-end`)
      this.marks.delete(name)
      return duration
    }
    return 0
  },

  report(): void {
    const entries = performance.getEntriesByType('measure')
    console.table(
      entries.map(e => ({
        name: e.name,
        duration: e.duration.toFixed(2) + 'ms'
      }))
    )
  }
}

// 使用
asyncTracker.start('fetchAllData')
const data = await fetchAllData()
console.log('耗时:', asyncTracker.end('fetchAllData'), 'ms')
asyncTracker.report()

// 方案8：增强错误堆栈
class AsyncError extends Error {
  originalStack: string | undefined

  constructor(message: string, originalError?: Error) {
    super(message)
    this.name = 'AsyncError'

    if (originalError) {
      this.originalStack = originalError.stack
      this.stack = `${this.stack}\n\nCaused by:\n${originalError.stack}`
    }
  }
}

// 包装异步函数以保留堆栈
function withStackTrace<Args extends any[], Return>(
  fn: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  return async (...args: Args): Promise<Return> => {
    const callSite = new Error().stack

    try {
      return await fn(...args)
    } catch (error) {
      const enhancedError = new AsyncError(
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      )
      enhancedError.stack = `${enhancedError.stack}\n\nOriginal call site:\n${callSite}`
      throw enhancedError
    }
  }
}

// 使用
const trackedFetch = withStackTrace(async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
})

// 方案9：可视化 Promise 状态
function createPromiseWithStatus<T>(
  promise: Promise<T>,
  name: string
): Promise<T> & { getStatus: () => string } {
  let status = 'pending'

  const wrapped = promise
    .then(value => {
      status = 'fulfilled'
      return value
    })
    .catch(error => {
      status = 'rejected'
      throw error
    }) as Promise<T> & { getStatus: () => string }

  wrapped.getStatus = () => status

  // 每秒检查状态
  const intervalId = setInterval(() => {
    if (status === 'pending') {
      console.log(`[${name}] 仍在执行...`)
    } else {
      clearInterval(intervalId)
    }
  }, 1000)

  return wrapped
}

// 使用
const trackedPromise = createPromiseWithStatus(
  fetch('/api/slow-endpoint').then(r => r.json()),
  'SlowAPI'
)
console.log('当前状态:', trackedPromise.getStatus())
```

### 8. 生产环境问题无法复现

**问题描述：**

用户报告的问题在本地开发环境无法复现，只在生产环境出现：

```
用户报告: "点击提交按钮没有反应"
开发环境: 一切正常
生产环境: 确实有问题
```

**问题原因：**

- 环境配置差异
- 数据差异（生产数据复杂）
- 用户特定的浏览器/设备
- 网络条件差异
- 缓存问题
- 第三方服务差异
- 时区/语言环境差异

**解决方案：**

```typescript
// 方案1：添加全面的错误监控
// 使用 Sentry 或类似服务
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: 'https://xxx@sentry.io/xxx',
  environment: import.meta.env.MODE,
  release: `app@${__APP_VERSION__}`,

  // 采样率
  tracesSampleRate: 0.1,

  // 捕获更多上下文
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router)
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false
    })
  ],

  // 错误过滤
  beforeSend(event) {
    // 添加用户信息
    event.user = {
      id: getCurrentUserId(),
      email: getCurrentUserEmail()
    }

    // 添加额外上下文
    event.contexts = {
      ...event.contexts,
      browser: {
        name: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    }

    return event
  }
})

// 方案2：创建问题复现信息收集器
class IssueReporter {
  private logs: Array<{ time: Date; type: string; data: unknown }> = []
  private maxLogs = 100

  constructor() {
    this.interceptConsole()
    this.interceptNetwork()
    this.interceptErrors()
  }

  private interceptConsole(): void {
    const methods = ['log', 'warn', 'error', 'info'] as const

    methods.forEach(method => {
      const original = console[method]
      console[method] = (...args: unknown[]) => {
        this.addLog(`console.${method}`, args)
        original.apply(console, args)
      }
    })
  }

  private interceptNetwork(): void {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const [url, options] = args
      this.addLog('fetch:request', { url, method: options?.method || 'GET' })

      try {
        const response = await originalFetch(...args)
        this.addLog('fetch:response', {
          url,
          status: response.status,
          ok: response.ok
        })
        return response
      } catch (error) {
        this.addLog('fetch:error', { url, error: String(error) })
        throw error
      }
    }
  }

  private interceptErrors(): void {
    window.addEventListener('error', (event) => {
      this.addLog('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.addLog('unhandledrejection', {
        reason: String(event.reason)
      })
    })
  }

  private addLog(type: string, data: unknown): void {
    this.logs.push({ time: new Date(), type, data })
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  generateReport(): object {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screenSize: {
        width: screen.width,
        height: screen.height
      },
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      online: navigator.onLine,
      memory: 'memory' in performance
        ? (performance as any).memory
        : null,
      localStorage: {
        usage: Object.keys(localStorage).length,
        quota: 'estimate' in navigator.storage
          ? navigator.storage.estimate()
          : null
      },
      logs: this.logs.slice(-50)  // 最近 50 条日志
    }
  }

  downloadReport(): void {
    const report = this.generateReport()
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issue-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// 初始化
const issueReporter = new IssueReporter()

// 在设置页面添加报告按钮
// <button @click="issueReporter.downloadReport()">导出问题报告</button>

// 方案3：环境差异检测
function detectEnvironmentDifferences(): object {
  return {
    // 基本信息
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,

    // 屏幕信息
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    },

    // 时区
    timezone: {
      name: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offset: new Date().getTimezoneOffset()
    },

    // 网络
    connection: 'connection' in navigator
      ? {
          type: (navigator as any).connection?.type,
          effectiveType: (navigator as any).connection?.effectiveType,
          downlink: (navigator as any).connection?.downlink,
          rtt: (navigator as any).connection?.rtt
        }
      : null,

    // 功能检测
    features: {
      webGL: !!document.createElement('canvas').getContext('webgl'),
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test')
          localStorage.removeItem('test')
          return true
        } catch {
          return false
        }
      })(),
      indexedDB: !!window.indexedDB,
      serviceWorker: 'serviceWorker' in navigator,
      webSocket: 'WebSocket' in window
    },

    // 性能
    performance: {
      memory: 'memory' in performance
        ? (performance as any).memory
        : null,
      timing: performance.timing
        ? {
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            load: performance.timing.loadEventEnd - performance.timing.navigationStart
          }
        : null
    }
  }
}

// 方案4：添加远程调试能力
class RemoteDebugger {
  private ws: WebSocket | null = null

  connect(serverUrl: string): void {
    this.ws = new WebSocket(serverUrl)

    this.ws.onopen = () => {
      console.log('远程调试已连接')
      this.send('init', detectEnvironmentDifferences())
    }

    this.ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data)

      switch (type) {
        case 'eval':
          // 执行远程命令（仅限调试环境）
          try {
            const result = eval(payload.code)
            this.send('result', { success: true, result })
          } catch (error) {
            this.send('result', { success: false, error: String(error) })
          }
          break

        case 'getState':
          // 获取应用状态
          this.send('state', {
            route: window.location.href,
            // 添加其他状态信息
          })
          break
      }
    }
  }

  send(type: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    }
  }

  disconnect(): void {
    this.ws?.close()
    this.ws = null
  }
}

// 方案5：条件性启用详细日志
function enableVerboseLogging(): void {
  // URL 参数启用
  const params = new URLSearchParams(window.location.search)
  if (params.get('debug') !== 'true') return

  // 或者通过密钥启用
  // if (params.get('debugKey') !== 'secret123') return

  console.log('详细日志模式已启用')

  // 记录所有状态变化
  const originalSetItem = localStorage.setItem.bind(localStorage)
  localStorage.setItem = (key: string, value: string) => {
    console.log('[Storage] 设置:', key, value)
    originalSetItem(key, value)
  }

  // 记录所有路由变化
  window.addEventListener('popstate', () => {
    console.log('[Router] URL 变化:', window.location.href)
  })

  // 记录所有点击事件
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    console.log('[Click]', {
      tag: target.tagName,
      class: target.className,
      id: target.id,
      text: target.textContent?.slice(0, 50)
    })
  }, true)
}

// 页面加载时检查
enableVerboseLogging()

// 方案6：Session Replay 实现
class SessionRecorder {
  private events: Array<{ time: number; type: string; data: unknown }> = []
  private startTime = Date.now()

  start(): void {
    // 记录点击
    document.addEventListener('click', (e) => {
      this.record('click', {
        x: e.clientX,
        y: e.clientY,
        target: this.getSelector(e.target as Element)
      })
    })

    // 记录输入
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.record('input', {
        target: this.getSelector(target),
        value: target.type === 'password' ? '***' : target.value.slice(0, 100)
      })
    })

    // 记录滚动
    let scrollTimeout: number
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        this.record('scroll', {
          x: window.scrollX,
          y: window.scrollY
        })
      }, 100)
    })

    // 记录页面变化
    window.addEventListener('popstate', () => {
      this.record('navigation', { url: window.location.href })
    })
  }

  private record(type: string, data: unknown): void {
    this.events.push({
      time: Date.now() - this.startTime,
      type,
      data
    })
  }

  private getSelector(element: Element): string {
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  export(): object {
    return {
      startTime: new Date(this.startTime).toISOString(),
      duration: Date.now() - this.startTime,
      events: this.events
    }
  }
}

// 使用
const recorder = new SessionRecorder()
recorder.start()

// 用户报告问题时导出
// const session = recorder.export()
```
