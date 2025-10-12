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
