# 调试工具

## 概述

uni-app 支持多平台调试，每个平台都有对应的调试工具和方法。本文档介绍各平台的调试方式、常用技巧和项目中的调试实践。

## H5 调试

### 浏览器开发者工具

H5 平台可以直接使用浏览器开发者工具调试。

**启动开发服务器**：

```bash
pnpm dev:h5
```

默认访问地址：http://localhost:100

**调试步骤**：

1. 打开浏览器（推荐 Chrome）
2. 访问 http://localhost:100
3. 按 F12 打开开发者工具
4. 在 Console 面板查看日志
5. 在 Sources 面板设置断点调试
6. 在 Network 面板查看网络请求

### Vue DevTools

**安装 Vue DevTools**：

1. Chrome 浏览器：在 Chrome Web Store 搜索"Vue.js devtools"
2. Firefox 浏览器：在 Firefox Add-ons 搜索"Vue.js devtools"

**使用**：

- 查看组件层级结构
- 查看组件 props、data、computed
- 查看 Pinia store 状态
- 追踪事件触发

### 移动端调试

**方法一：Chrome 远程调试**

```bash
# Android 设备
1. 手机开启开发者模式和 USB 调试
2. 连接电脑，打开 Chrome
3. 访问 chrome://inspect
4. 选择设备，点击 inspect
```

**方法二：vConsole**

在 H5 环境显示移动端控制台：

```typescript
// 开发环境引入 vConsole
// #ifdef H5
if (import.meta.env.DEV) {
  import('vconsole').then((module) => {
    new module.default()
  })
}
// #endif
```

### Source Map

项目配置了 Source Map，方便调试：

```typescript
// vite.config.ts:80
build: {
  sourcemap: VITE_SHOW_SOURCEMAP === 'true',
  target: 'es6',
  minify: mode === 'development' ? false : 'esbuild',
}
```

**配置**：

```bash
# .env.development
VITE_SHOW_SOURCEMAP = true

# .env.production
VITE_SHOW_SOURCEMAP = false
```

## 微信小程序调试

### 微信开发者工具

**安装**：

下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

**启动项目**：

```bash
pnpm dev:mp-weixin
```

编译产物位置：`dist/dev/mp-weixin`

**导入项目**：

1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目目录选择：`dist/dev/mp-weixin`
4. AppID：使用测试号或真实 AppID

**调试功能**：

| 功能 | 说明 |
|------|------|
| **Console** | 查看日志输出 |
| **Sources** | 查看源代码、设置断点 |
| **Network** | 查看网络请求 |
| **Storage** | 查看本地存储 |
| **AppData** | 查看页面数据 |
| **Wxml** | 查看页面结构 |
| **Sensor** | 模拟设备传感器 |

### 真机调试

**步骤**：

1. 手机微信扫描开发者工具预览二维码
2. 开发者工具点击"真机调试"
3. 手机扫码进入真机调试模式
4. 在开发者工具查看手机日志

### 性能分析

**Trace 面板**：
- 页面渲染性能
- setData 调用频率
- 脚本执行耗时

**Audits 面板**：
- 体验评分
- 性能建议
- 最佳实践检查

## App 调试

### HBuilderX 调试

**安装 HBuilderX**：

下载地址：https://www.dcloud.io/hbuilderx.html

**启动项目**：

```bash
pnpm dev:app
```

**运行到模拟器**：

1. 打开 HBuilderX
2. 导入 `dist/dev/app` 目录
3. 点击"运行" -> "运行到手机或模拟器"
4. 选择设备运行

**真机调试**：

1. 手机开启开发者模式
2. 连接电脑
3. HBuilderX 自动识别设备
4. 点击"运行到手机"

### Chrome DevTools

**Android 调试**：

```bash
1. 手机连接电脑
2. 打开 Chrome 浏览器
3. 访问 chrome://inspect
4. 选择 WebView 进行调试
```

**iOS 调试**：

使用 Safari 远程调试：

```bash
1. iPhone 连接 Mac
2. iPhone 设置 -> Safari -> 高级 -> 网页检查器（开启）
3. Mac Safari -> 开发 -> 选择设备
```

## 其他小程序调试

### 支付宝小程序

**启动项目**：

```bash
pnpm dev:mp-alipay
```

**开发者工具**：

下载地址：https://opendocs.alipay.com/mini/ide/download

**导入项目**：`dist/dev/mp-alipay`

### 百度小程序

```bash
pnpm dev:mp-baidu
```

开发者工具：https://smartprogram.baidu.com/docs/develop/devtools/show_sur/

### 字节跳动小程序

```bash
pnpm dev:mp-toutiao
```

开发者工具：https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/developer-tool/download/developer-tool-update-and-download

## 调试技巧

### 1. Console 日志

**基础日志**：

```typescript
console.log('普通日志')
console.info('信息日志')
console.warn('警告日志')
console.error('错误日志')
```

**格式化输出**：

```typescript
// 对象日志
console.log('用户信息:', userInfo)

// 多个参数
console.log('用户', userId, '登录成功')

// 表格输出（H5）
console.table([
  { name: '张三', age: 20 },
  { name: '李四', age: 25 }
])
```

**条件日志**：

```typescript
// 仅开发环境输出
if (import.meta.env.DEV) {
  console.log('开发环境日志')
}

// 使用 console.assert
console.assert(userId > 0, '用户ID必须大于0')
```

### 2. 网络请求调试

**查看请求详情**：

```typescript
// src/composables/useHttp.ts
const request = async <T = any>(
  url: string,
  method: UniApp.RequestOptions['method'],
  data?: any,
  config?: CustomRequestOptions,
): Promise<T> => {
  // 请求日志
  console.log(`[HTTP ${method}]`, url, data)

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      success: (response) => {
        // 响应日志
        console.log(`[HTTP ${method} Success]`, url, response.data)
        resolve(response.data)
      },
      fail: (error) => {
        // 错误日志
        console.error(`[HTTP ${method} Error]`, url, error)
        reject(error)
      }
    })
  })
}
```

### 3. 性能调试

**计时器**：

```typescript
// 开始计时
console.time('数据加载')

// 执行操作
await loadData()

// 结束计时
console.timeEnd('数据加载')  // 输出：数据加载: 152.3ms
```

**内存使用**：

```typescript
// H5 环境
if (__UNI_PLATFORM__ === 'h5') {
  console.log('内存使用:', performance.memory)
}
```

### 4. 断点调试

**debugger 语句**：

```typescript
const handleLogin = () => {
  debugger  // 程序会在此处暂停

  // 登录逻辑
  const result = await login(form)
}
```

**条件断点**：

在开发者工具 Sources 面板右键断点，设置条件：

```typescript
userId === 123  // 仅当 userId 为 123 时暂停
```

### 5. 错误捕获

**全局错误监听**：

```typescript
// src/utils/logger.ts:199
private listenErrors() {
  // #ifdef H5
  // H5 环境错误监听
  window.addEventListener('error', (event) => {
    console.error('未捕获的错误:', event.message)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason)
  })
  // #endif

  // #ifndef H5
  // 小程序/App 环境
  uni.onError((error) => {
    console.error('未捕获的错误:', error)
  })

  uni.onUnhandledRejection((event) => {
    console.error('未处理的Promise错误:', event.reason)
  })
  // #endif
}
```

**Try-Catch**：

```typescript
const loadData = async () => {
  try {
    const data = await fetchData()
    return data
  } catch (error) {
    console.error('数据加载失败:', error)
    // 错误处理
  }
}
```

## 项目调试实践

### 前端日志收集器

项目实现了日志收集器，可以将前端日志发送到后端：

```typescript
// src/utils/logger.ts
class Logger {
  /** 日志队列 */
  private queue: LogItem[] = []

  /** 批量发送间隔(ms) */
  private readonly SEND_INTERVAL = 2000

  /**
   * 初始化日志收集器
   * 仅开发环境以及打开方法开关为true才生效
   */
  init(enable: boolean = false) {
    if (import.meta.env.PROD || !enable) {
      return
    }

    this.overrideConsole()
    this.startTimer()
    this.listenErrors()
  }

  /**
   * 重写console方法
   */
  private overrideConsole() {
    console.log = (...args: any[]) => {
      this.originalConsole.log(...args)
      this.collect('log', args)
    }
    // ... 其他方法
  }

  /**
   * 发送日志到后端
   */
  private async sendLogs() {
    if (this.queue.length === 0) return

    const logs = this.queue.splice(0, this.MAX_BATCH_SIZE)

    try {
      await http.post('/system/devLog/collect', { logs })
    } catch (err) {
      console.error('日志发送失败:', err)
    }
  }
}

export const logger = new Logger()
```

**启用日志收集**：

```typescript
// src/App.vue
import { logger } from '@/utils/logger'

onLaunch(() => {
  // 启用日志收集（仅开发环境）
  logger.init(true)
})
```

### 平台信息输出

**输出当前平台信息**：

```typescript
// src/utils/platform.ts
console.log('当前平台:', __UNI_PLATFORM__)
console.log('是否H5:', isH5)
console.log('是否微信小程序:', isMpWeixin)
console.log('是否App:', isApp)
```

### 环境变量调试

**查看环境变量**：

```typescript
// vite.config.ts:23
const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
console.log('环境变量 env -> ', env)
```

**输出编译信息**：

```typescript
// vite.config.ts:9
console.log('command, mode -> ', command, mode)
// pnpm dev:h5 时得到 => serve development
// pnpm build:h5 时得到 => build production

console.log('UNI_PLATFORM -> ', UNI_PLATFORM)
// 得到 mp-weixin, h5, app 等
```

## 常用调试命令

### 开发命令

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin

# 支付宝小程序开发
pnpm dev:mp-alipay

# App 开发
pnpm dev:app

# Android App 开发
pnpm dev:app-android

# iOS App 开发
pnpm dev:app-ios
```

### 构建命令

```bash
# H5 生产构建
pnpm build:h5

# 微信小程序生产构建
pnpm build:mp-weixin

# App 生产构建
pnpm build:app
```

### 类型检查

```bash
# TypeScript 类型检查
pnpm type-check
```

### 代码检查

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix
```

## 常见问题调试

### 1. 页面白屏

**排查步骤**：

1. 检查控制台是否有错误
2. 检查网络请求是否成功
3. 检查路由配置是否正确
4. 检查组件是否正确导入

**调试代码**：

```typescript
// 页面生命周期中添加日志
onLoad((options) => {
  console.log('页面加载', options)
})

onShow(() => {
  console.log('页面显示')
})

onReady(() => {
  console.log('页面渲染完成')
})
```

### 2. 接口请求失败

**排查步骤**：

1. 检查网络连接
2. 检查请求 URL 是否正确
3. 检查请求参数是否正确
4. 检查后端服务是否启动

**调试代码**：

```typescript
// 添加请求日志
const [err, data] = await http.get('/api/users')

if (err) {
  console.error('请求失败:', err)
  console.log('错误详情:', err.message)
} else {
  console.log('请求成功:', data)
}
```

### 3. 样式不生效

**排查步骤**：

1. 检查样式选择器是否正确
2. 检查 scoped 是否影响样式
3. 检查样式优先级
4. 检查是否被其他样式覆盖

**调试方法**：

- H5：使用浏览器开发者工具 Elements 面板
- 小程序：使用开发者工具 Wxml 面板
- 检查计算后的样式

### 4. 数据不更新

**排查步骤**：

1. 检查响应式数据是否正确声明
2. 检查数据修改方式是否正确
3. 检查是否触发了视图更新

**调试代码**：

```typescript
// 监听数据变化
watch(() => userInfo.value, (newVal, oldVal) => {
  console.log('userInfo 变化:', oldVal, '->', newVal)
}, { deep: true })

// 检查响应式
console.log('是否响应式:', isReactive(userInfo))
console.log('是否ref:', isRef(count))
```

### 5. 小程序包体积过大

**排查方法**：

```bash
# 分析构建产物
pnpm build:mp-weixin

# 查看 dist/build/mp-weixin 目录大小
```

**优化建议**：

1. 使用分包加载
2. 压缩图片资源
3. 按需导入组件
4. 移除未使用的代码

## 最佳实践

### 1. 日志规范

```typescript
// ✅ 推荐：使用有意义的日志前缀
console.log('[用户登录]', '登录成功')
console.log('[数据加载]', '加载用户列表')

// ❌ 不推荐：无意义的日志
console.log('success')
console.log(data)
```

### 2. 生产环境移除日志

```typescript
// vite.config.ts:71
esbuild: {
  drop: VITE_DELETE_CONSOLE === 'true' ? ['console', 'debugger'] : ['debugger'],
}
```

配置环境变量：

```bash
# .env.production
VITE_DELETE_CONSOLE = true
```

### 3. 使用调试工具函数

```typescript
// utils/debug.ts
export const debug = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log('[DEBUG]', ...args)
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.error('[ERROR]', ...args)
    }
  }
}

// 使用
import { debug } from '@/utils/debug'
debug.log('调试信息')
```

### 4. 分平台调试

```typescript
// 不同平台输出不同信息
if (__UNI_PLATFORM__ === 'h5') {
  console.log('[H5] 页面加载')
} else if (__UNI_PLATFORM__ === 'mp-weixin') {
  console.log('[微信小程序] 页面加载')
}
```

### 5. 错误边界

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', instance)

  // 返回 false 阻止错误继续传播
  return false
})
</script>
```

## 调试工具推荐

### VSCode 插件

- **uni-create-view**：快速创建 uni-app 页面
- **uni-helper**：uni-app 代码提示
- **Volar**：Vue 3 支持
- **ESLint**：代码质量检查
- **Prettier**：代码格式化

### Chrome 插件

- **Vue.js devtools**：Vue 调试工具
- **JSON Viewer**：JSON 格式化查看
- **Lighthouse**：性能分析
