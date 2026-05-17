# 平台编译插件

## 介绍

平台编译插件（@uni-helper/vite-plugin-uni-platform）为 UniApp 项目提供平台特定文件的自动识别和编译支持。通过文件名后缀约定，可以为不同平台编写专属代码，插件会在编译时自动选择对应平台的文件，实现更精细化的跨平台开发。

**核心特性：**

- **平台特定文件** - 通过文件名后缀区分不同平台的实现
- **自动选择** - 编译时自动选择当前平台对应的文件
- **无缝降级** - 平台文件不存在时自动使用通用文件
- **完整覆盖** - 支持组件、页面、工具函数等各类文件
- **类型安全** - 与 TypeScript 完美配合

## 基本用法

### 插件注册

在 `vite/plugins/index.ts` 中注册：

```typescript
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // UniApp 相关插件
  vitePlugins.push(UniPlatform())  // 平台编译插件

  return vitePlugins
}
```

### 文件命名约定

通过在文件名中添加平台后缀来创建平台特定文件：

```text
src/
├── components/
│   ├── MyButton.vue           # 通用实现
│   ├── MyButton.h5.vue        # H5 专属实现
│   ├── MyButton.mp-weixin.vue # 微信小程序专属实现
│   └── MyButton.app.vue       # App 专属实现
├── utils/
│   ├── storage.ts             # 通用存储工具
│   ├── storage.h5.ts          # H5 存储实现
│   └── storage.mp-weixin.ts   # 微信小程序存储实现
└── pages/
    └── index/
        ├── index.vue          # 通用页面
        ├── index.h5.vue       # H5 专属页面
        └── index.app.vue      # App 专属页面
```

### 平台后缀

| 后缀 | 适用平台 |
|------|---------|
| `.h5` | H5 网页 |
| `.app` | App（iOS/Android） |
| `.mp-weixin` | 微信小程序 |
| `.mp-alipay` | 支付宝小程序 |
| `.mp-baidu` | 百度小程序 |
| `.mp-toutiao` | 字节跳动小程序 |
| `.mp-qq` | QQ 小程序 |
| `.mp-kuaishou` | 快手小程序 |
| `.mp-lark` | 飞书小程序 |
| `.mp-jd` | 京东小程序 |

## 使用场景

### 平台特定组件

```vue
<!-- src/components/ShareButton.vue（通用实现） -->
<template>
  <button @click="handleShare">分享</button>
</template>

<script lang="ts" setup>
const handleShare = () => {
  // 通用分享逻辑
  console.log('分享功能')
}
</script>
```

```vue
<!-- src/components/ShareButton.mp-weixin.vue（微信小程序实现） -->
<template>
  <button open-type="share">分享给好友</button>
</template>

<script lang="ts" setup>
// 微信小程序使用原生分享能力
</script>
```

```vue
<!-- src/components/ShareButton.h5.vue（H5 实现） -->
<template>
  <button @click="handleShare">分享</button>
</template>

<script lang="ts" setup>
const handleShare = () => {
  // H5 使用 Web Share API
  if (navigator.share) {
    navigator.share({
      title: '分享标题',
      text: '分享内容',
      url: window.location.href,
    })
  } else {
    // 降级处理：复制链接
    navigator.clipboard.writeText(window.location.href)
    uni.showToast({ title: '链接已复制' })
  }
}
</script>
```

### 平台特定工具函数

```typescript
// src/utils/storage.ts（通用实现）
export const storage = {
  get(key: string): any {
    try {
      return uni.getStorageSync(key)
    } catch {
      return null
    }
  },

  set(key: string, value: any): void {
    try {
      uni.setStorageSync(key, value)
    } catch {
      console.error('存储失败')
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(key)
    } catch {
      console.error('删除失败')
    }
  },
}
```

```typescript
// src/utils/storage.h5.ts（H5 实现）
export const storage = {
  get(key: string): any {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('存储失败，可能是存储空间不足')
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  // H5 专属：获取存储使用情况
  getUsage(): { used: number; total: number } {
    let used = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        used += localStorage.getItem(key)?.length || 0
      }
    }
    return {
      used: used * 2, // UTF-16 编码，每个字符 2 字节
      total: 5 * 1024 * 1024, // 通常 5MB
    }
  },
}
```

```typescript
// src/utils/storage.mp-weixin.ts（微信小程序实现）
export const storage = {
  get(key: string): any {
    try {
      return wx.getStorageSync(key)
    } catch {
      return null
    }
  },

  set(key: string, value: any): void {
    try {
      wx.setStorageSync(key, value)
    } catch {
      console.error('存储失败')
    }
  },

  remove(key: string): void {
    try {
      wx.removeStorageSync(key)
    } catch {
      console.error('删除失败')
    }
  },

  // 微信小程序专属：获取存储信息
  async getInfo(): Promise<WechatMiniprogram.GetStorageInfoSyncOption> {
    return wx.getStorageInfoSync()
  },
}
```

### 平台特定 Composable

```typescript
// src/composables/useLocation.ts（通用实现）
export function useLocation() {
  const location = ref<{ latitude: number; longitude: number } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getLocation = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await uni.getLocation({
        type: 'gcj02',
      })
      location.value = {
        latitude: res.latitude,
        longitude: res.longitude,
      }
    } catch (e: any) {
      error.value = e.errMsg || '获取位置失败'
    } finally {
      loading.value = false
    }
  }

  return {
    location,
    loading,
    error,
    getLocation,
  }
}
```

```typescript
// src/composables/useLocation.h5.ts（H5 实现）
export function useLocation() {
  const location = ref<{ latitude: number; longitude: number } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getLocation = async () => {
    loading.value = true
    error.value = null

    // 检查是否支持地理位置
    if (!navigator.geolocation) {
      error.value = '当前浏览器不支持地理位置'
      loading.value = false
      return
    }

    // 检查是否为 HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      error.value = '地理位置需要 HTTPS 环境'
      loading.value = false
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      location.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
    } catch (e: any) {
      switch (e.code) {
        case 1:
          error.value = '用户拒绝了位置请求'
          break
        case 2:
          error.value = '无法获取位置信息'
          break
        case 3:
          error.value = '获取位置超时'
          break
        default:
          error.value = '获取位置失败'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    location,
    loading,
    error,
    getLocation,
  }
}
```

### 平台特定页面

```vue
<!-- src/pages/payment/index.vue（通用页面） -->
<template>
  <view class="payment-page">
    <view class="amount">¥{{ amount }}</view>
    <button @click="handlePay">立即支付</button>
  </view>
</template>

<script lang="ts" setup>
const amount = ref(100)

const handlePay = () => {
  // 通用支付逻辑
}
</script>
```

```vue
<!-- src/pages/payment/index.mp-weixin.vue（微信小程序页面） -->
<template>
  <view class="payment-page">
    <view class="amount">¥{{ amount }}</view>
    <!-- 微信支付按钮 -->
    <button type="primary" @click="handleWxPay">微信支付</button>
  </view>
</template>

<script lang="ts" setup>
const amount = ref(100)

const handleWxPay = async () => {
  // 调用后端获取支付参数
  const payParams = await getWxPayParams()

  // 调用微信支付
  wx.requestPayment({
    ...payParams,
    success: () => {
      uni.showToast({ title: '支付成功' })
    },
    fail: (err) => {
      uni.showToast({ title: '支付失败', icon: 'error' })
    },
  })
}
</script>
```

## 文件优先级

当存在多个同名文件时，插件按以下优先级选择：

```text
1. 精确平台匹配  →  MyComponent.mp-weixin.vue
2. 通用实现      →  MyComponent.vue
```

### 示例

假设当前编译目标是微信小程序（mp-weixin）：

| 存在的文件 | 使用的文件 |
|-----------|-----------|
| `Button.vue` | `Button.vue` |
| `Button.vue`, `Button.mp-weixin.vue` | `Button.mp-weixin.vue` |
| `Button.h5.vue` | 编译错误（缺少通用或对应平台文件） |
| `Button.vue`, `Button.h5.vue` | `Button.vue` |

## 目录结构建议

### 按功能组织

```text
src/
├── components/
│   ├── common/           # 通用组件
│   │   └── Button.vue
│   └── platform/         # 平台特定组件
│       ├── Share.vue
│       ├── Share.h5.vue
│       ├── Share.mp-weixin.vue
│       └── Share.app.vue
├── utils/
│   ├── common/           # 通用工具
│   │   └── format.ts
│   └── platform/         # 平台特定工具
│       ├── storage.ts
│       ├── storage.h5.ts
│       └── storage.mp-weixin.ts
└── composables/
    ├── common/           # 通用 Composable
    │   └── useUser.ts
    └── platform/         # 平台特定 Composable
        ├── useLocation.ts
        ├── useLocation.h5.ts
        └── useLocation.mp-weixin.ts
```

### 按平台组织

```text
src/
├── components/
│   ├── Button.vue
│   ├── Button.h5.vue
│   └── Button.mp-weixin.vue
├── utils/
│   ├── storage.ts
│   ├── storage.h5.ts
│   └── storage.mp-weixin.ts
└── pages/
    └── index/
        ├── index.vue
        ├── index.h5.vue
        └── index.mp-weixin.vue
```

## 与条件编译对比

### 条件编译

适用于小段代码的平台差异：

```vue
<template>
  <!-- #ifdef H5 -->
  <div class="h5-container">H5 内容</div>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="weixin-container">微信内容</view>
  <!-- #endif -->
</template>

<script lang="ts" setup>
// #ifdef H5
console.log('H5 平台')
// #endif

// #ifdef MP-WEIXIN
console.log('微信小程序')
// #endif
</script>
```

### 平台文件

适用于整体实现差异较大的场景：

```text
# 当整个组件逻辑都不同时，使用平台文件更清晰
MyComponent.vue          # 通用
MyComponent.h5.vue       # H5 完全不同的实现
MyComponent.mp-weixin.vue # 微信完全不同的实现
```

### 选择建议

| 场景 | 推荐方案 |
|------|---------|
| 少量代码差异（几行） | 条件编译 `#ifdef` |
| 中等代码差异（一个函数） | 条件编译 `#ifdef` |
| 大量代码差异（多个函数） | 平台文件 |
| 整体实现不同 | 平台文件 |
| API 调用方式不同 | 平台文件 |
| 仅样式差异 | 条件编译 `/* #ifdef */` |

## 工作原理

```text
┌─────────────────────────────────────────────────────────────┐
│                  uni-platform 工作流程                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 模块解析请求                                             │
│       ├─ import Button from './Button.vue'                  │
│       └─ 触发插件处理                                        │
│       ↓                                                     │
│  2. 获取当前平台                                             │
│       └─ UNI_PLATFORM = 'mp-weixin'                         │
│       ↓                                                     │
│  3. 查找平台文件                                             │
│       ├─ 检查 Button.mp-weixin.vue 是否存在                  │
│       ├─ 存在 → 使用平台文件                                 │
│       └─ 不存在 → 使用 Button.vue                            │
│       ↓                                                     │
│  4. 返回解析结果                                             │
│       └─ 返回实际使用的文件路径                              │
│       ↓                                                     │
│  5. Vite 继续处理                                            │
│       └─ 编译选中的文件                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API

### 插件选项

```typescript
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'

// 基本使用（无需配置）
UniPlatform()

// 可选配置
UniPlatform({
  // 自定义配置（通常不需要）
})
```

### 支持的文件类型

- `.vue` - Vue 单文件组件
- `.ts` / `.js` - TypeScript/JavaScript 文件
- `.tsx` / `.jsx` - TSX/JSX 文件
- `.json` - JSON 配置文件
- `.scss` / `.css` - 样式文件

## 最佳实践

### 1. 保持接口一致

```typescript
// 确保所有平台实现导出相同的接口
// src/utils/auth.ts
export interface AuthService {
  login(): Promise<void>
  logout(): Promise<void>
  getToken(): string | null
}

export const authService: AuthService = {
  // 通用实现
}

// src/utils/auth.mp-weixin.ts
export const authService: AuthService = {
  // 微信小程序实现，接口保持一致
}
```

### 2. 提取通用逻辑

```typescript
// src/utils/storage.base.ts - 共享的基础逻辑
export function parseValue(value: string | null): any {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function stringifyValue(value: any): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

// src/utils/storage.h5.ts
import { parseValue, stringifyValue } from './storage.base'

export const storage = {
  get(key: string) {
    return parseValue(localStorage.getItem(key))
  },
  set(key: string, value: any) {
    localStorage.setItem(key, stringifyValue(value))
  },
}
```

### 3. 类型定义共享

```typescript
// src/types/platform.ts - 共享类型定义
export interface LocationInfo {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface UseLocationReturn {
  location: Ref<LocationInfo | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  getLocation: () => Promise<void>
}

// 所有平台实现都遵循此类型
```

## 常见问题

### 1. 平台文件未生效

**问题原因：**
- 文件名后缀拼写错误
- 插件未正确注册

**解决方案：**

```bash
# 确保后缀正确
Button.mp-weixin.vue  # ✅
Button.weixin.vue     # ❌
Button.mpweixin.vue   # ❌

# 确保插件已注册
vitePlugins.push(UniPlatform())
```

### 2. 类型提示丢失

**问题原因：**
- TypeScript 无法识别平台文件

**解决方案：**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@uni-helper/vite-plugin-uni-platform/client"]
  }
}
```

### 3. 导入路径问题

**问题原因：**
- 导入时包含了平台后缀

**解决方案：**

```typescript
// ✅ 正确：不包含平台后缀
import { storage } from '@/utils/storage'
import Button from '@/components/Button.vue'

// ❌ 错误：包含平台后缀
import { storage } from '@/utils/storage.h5'
import Button from '@/components/Button.mp-weixin.vue'
```

### 4. 通用文件缺失

**问题原因：**
- 只有平台文件，没有通用实现

**解决方案：**

```text
# 必须有通用文件作为降级
Button.vue           # ✅ 必需的通用实现
Button.h5.vue        # ✅ H5 专属
Button.mp-weixin.vue # ✅ 微信专属

# 如果没有通用实现，其他平台会编译失败
Button.h5.vue        # ❌ 仅 H5，其他平台无法使用
```

### 5. 开发时预览问题

**问题原因：**
- 开发时切换平台需要重启

**解决方案：**

```bash
# 切换平台后需要重启开发服务器
# 停止当前服务
Ctrl + C

# 启动新平台
pnpm dev:mp-weixin  # 切换到微信小程序
pnpm dev:h5         # 切换到 H5
```

