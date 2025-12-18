# useToast 轻提示

## 介绍

`useToast` 是一个专为 UniApp 应用设计的轻量级消息提示 Composable,提供了优雅、灵活的全局消息提示功能。

**核心特性:**

- **全局队列管理** - 基于 Map 数据结构管理所有活跃的 Toast 实例,支持多实例并发显示
- **自动堆叠布局** - 智能计算每个 Toast 的垂直偏移量,避免重叠覆盖
- **层级自动管理** - 基于 BASE_Z_INDEX(1000) 自动分配 zIndex
- **单例模式缓存** - 每个 selector 对应唯一的 Toast 实例
- **五种预设方法** - 提供 loading、success、error、warning、info 五种常用消息类型
- **自动关闭定时器** - 支持配置显示时长,可设置 duration=0 实现手动关闭
- **TypeScript 支持** - 完整的类型定义
- **平台兼容性** - 支持 H5、微信小程序、App 等多个 UniApp 平台

## 基本用法

### 简单文本提示

```vue
<template>
  <view class="demo">
    <wd-button @click="showToast">显示提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showToast = () => {
  toast.show('这是一条简单的提示消息')
}
</script>
```

### 预设类型提示

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 成功提示 - 绿色图标,1500ms
toast.success('提交成功')

// 错误提示 - 红色图标,2000ms
toast.error('删除失败,请稍后重试')

// 警告提示 - 橙色图标,2000ms
toast.warning('库存不足,请及时补货')

// 信息提示 - 蓝色图标,2000ms
toast.info('长按列表项可进行更多操作')
</script>
```

### 加载提示

加载提示默认不自动关闭,需要手动调用 `close()`:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleLoad = async () => {
  toast.loading('加载中...')

  try {
    await fetchData()
    toast.close()
    toast.success('加载完成')
  } catch (error) {
    toast.close()
    toast.error('加载失败')
  }
}
</script>
```

### 自定义配置

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'
import type { ToastOptions } from '@/wd'

const toast = useToast()

const showCustomToast = () => {
  const options: ToastOptions = {
    msg: '自定义样式的提示消息',
    duration: 3000,
    position: 'bottom',
    iconName: 'success',
    iconSize: 48,
    iconColor: '#00c853',
    direction: 'horizontal',
  }

  toast.show(options)
}
</script>
```

### 不同位置的 Toast

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 顶部
toast.show({ msg: '顶部提示', position: 'top' })

// 中上部(默认)
toast.show({ msg: '中上提示', position: 'middle-top' })

// 中部
toast.show({ msg: '中部提示', position: 'middle' })

// 底部
toast.show({ msg: '底部提示', position: 'bottom' })
</script>
```

## 高级用法

### 多实例管理

使用 selector 参数创建多个独立的 Toast 实例:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

// 创建不同的实例
const mainToast = useToast('main')
const secondaryToast = useToast('secondary')

mainToast.success('主要操作成功')
secondaryToast.info('次要信息')
</script>
```

### 加载状态切换

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleUpload = async () => {
  toast.loading({
    msg: '正在上传...',
    loadingType: 'ring',
    loadingColor: '#1890ff',
  })

  try {
    await uploadFile()
    toast.close()
    toast.success({ msg: '上传成功', duration: 2000 })
  } catch (error) {
    toast.close()
    toast.error({ msg: '上传失败,请重试', duration: 3000 })
  }
}
</script>
```

### 回调函数

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

toast.show({
  msg: '带回调的提示消息',
  duration: 2000,
  opened: () => {
    console.log('Toast 已完全展示')
  },
  closed: () => {
    console.log('Toast 已完全关闭')
  },
})
</script>
```

### 遮罩层控制

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 带遮罩的提示(阻止用户操作)
toast.show({
  msg: '这是一条重要提示',
  duration: 3000,
  cover: true,
  iconName: 'warning',
})
</script>
```

## API

### useToast()

创建或获取 Toast 实例。

```typescript
function useToast(selector?: string): Toast
```

**返回值方法:**

| 方法 | 说明 | 类型 |
|------|------|------|
| show | 显示 Toast | `(option: ToastOptions \| string) => void` |
| success | 显示成功 Toast | `(option: ToastOptions \| string) => void` |
| error | 显示错误 Toast | `(option: ToastOptions \| string) => void` |
| warning | 显示警告 Toast | `(option: ToastOptions \| string) => void` |
| info | 显示信息 Toast | `(option: ToastOptions \| string) => void` |
| loading | 显示加载 Toast | `(option: ToastOptions \| string) => void` |
| close | 关闭当前 Toast | `() => void` |

### 预设配置

| 方法 | iconName | duration | 其他 |
|------|----------|----------|------|
| success | `'success'` | `1500` | - |
| error | `'error'` | `2000` | - |
| warning | `'warning'` | `2000` | - |
| info | `'info'` | `2000` | - |
| loading | `'loading'` | `0` | `cover: true` |

### ToastOptions

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| msg | 提示信息 | `string` | - |
| duration | 显示时长(ms),0表示不自动关闭 | `number` | `2000` |
| direction | 图标和文字排列方向 | `'vertical' \| 'horizontal'` | `'vertical'` |
| iconName | 图标名称 | `'success' \| 'error' \| 'warning' \| 'loading' \| 'info' \| ''` | `''` |
| iconSize | 图标大小(rpx) | `number` | `42` |
| iconColor | 图标颜色 | `string` | - |
| loadingType | 加载图标类型 | `'outline' \| 'ring'` | `'outline'` |
| loadingColor | 加载图标颜色 | `string` | `'#4D80F0'` |
| position | Toast 位置 | `'top' \| 'middle-top' \| 'middle' \| 'bottom'` | `'middle-top'` |
| zIndex | 层级 | `number` | `1000` |
| cover | 是否显示遮罩层 | `boolean` | `false` |
| iconClass | 图标自定义类名 | `string` | `''` |
| classPrefix | 图标类名前缀 | `string` | `'wd-icon'` |
| opened | 完全展示后的回调 | `() => void` | - |
| closed | 完全关闭后的回调 | `() => void` | - |

### 工具函数

| 函数 | 说明 |
|------|------|
| `getToastOption(selector?)` | 获取或创建指定 selector 的 Toast 配置 |
| `clearToastOption(selector?)` | 清理指定 selector 的 Toast 配置缓存 |
| `clearAllToastOptions()` | 清理所有 Toast 配置缓存 |
| `cleanupClosedToasts()` | 清理已关闭的 Toast 实例 |

## 类型定义

```typescript
// 图标类型
type ToastIconType = 'success' | 'error' | 'warning' | 'loading' | 'info' | ''

// 位置类型
type ToastPositionType = 'top' | 'middle-top' | 'middle' | 'bottom'

// 排列方向
type ToastDirection = 'vertical' | 'horizontal'

// 加载图标类型
type ToastLoadingType = 'outline' | 'ring'

// Toast 实例接口
interface Toast {
  show: (toastOptions: ToastOptions | string) => void
  success: (toastOptions: ToastOptions | string) => void
  error: (toastOptions: ToastOptions | string) => void
  info: (toastOptions: ToastOptions | string) => void
  warning: (toastOptions: ToastOptions | string) => void
  loading: (toastOptions: ToastOptions | string) => void
  close: () => void
}

// 常量
const TOAST_HEIGHT = 60     // Toast 基础高度(px)
const BASE_Z_INDEX = 1000   // 基础层级
```

## 最佳实践

### 1. 合理选择提示类型

```typescript
// ✅ 根据操作结果选择类型
const handleSave = async () => {
  try {
    await saveData()
    toast.success('保存成功')
  } catch (error) {
    toast.error('保存失败')
  }
}

// ❌ 所有场景都用 show
toast.show('删除成功')  // 应该用 toast.success()
```

### 2. 正确管理 loading 状态

```typescript
// ✅ 使用 try-finally 确保关闭
const handleSubmit = async () => {
  toast.loading('提交中...')
  try {
    await submitForm()
    toast.success('提交成功')
  } catch (error) {
    toast.error('提交失败')
  } finally {
    toast.close()
  }
}
```

### 3. 避免 Toast 滥用

```typescript
// ✅ 批量操作后统一提示
const handleBatchDelete = async (items: any[]) => {
  toast.loading('批量删除中...')
  try {
    await Promise.all(items.map(item => deleteItem(item)))
    toast.close()
    toast.success(`成功删除 ${items.length} 条数据`)
  } catch (error) {
    toast.close()
    toast.error('批量删除失败')
  }
}

// ❌ 循环中频繁显示
items.forEach(item => {
  toast.success(`删除 ${item.name} 成功`)  // 可能堆叠几十个
})
```

### 4. 合理设置显示时长

```typescript
// 短消息: 默认时长
toast.success('保存成功')

// 长消息: 延长时长
toast.info({
  msg: '您的订单已提交,预计1-2个工作日内发货',
  duration: 4000,
})

// 动态计算时长
const showDynamic = (msg: string) => {
  const duration = Math.min(2000 + Math.floor(msg.length / 10) * 500, 5000)
  toast.show({ msg, duration })
}
```

### 5. 使用多实例隔离

```typescript
// ✅ 不同功能模块使用不同实例
const formToast = useToast('form')
const uploadToast = useToast('upload')

// 表单和上传可以独立控制,互不干扰
formToast.loading('提交中...')
uploadToast.loading('上传中...')
```

## 常见问题

### 1. Toast 不显示

**原因**: 未在页面中放置 `<wd-toast />` 组件

**解决**:

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
    <wd-toast />
    <!-- 如果使用命名实例 -->
    <wd-toast selector="main" />
  </view>
</template>
```

### 2. loading Toast 无法关闭

**原因**: 忘记调用 `close()` 或异常未捕获

**解决**: 使用 try-finally 确保关闭

```typescript
toast.loading('加载中...')
try {
  await fetchData()
} finally {
  toast.close()
}
```

### 3. 多个 Toast 重叠显示

**原因**: 相同 selector 的 Toast 组件放置多次

**解决**: 每个 selector 只放置一次组件,让系统自动管理 zIndex

### 4. 小程序平台层级问题

**原因**: 小程序原生组件(map、video)层级高于普通元素

**解决**:

```typescript
toast.success({
  msg: '操作成功',
  zIndex: 99999,  // 提高层级
  cover: true,    // 遮罩层可覆盖原生组件
})
```

### 5. TypeScript 类型错误

**解决**: 正确导入类型

```typescript
import { useToast } from '@/wd'
import type { Toast, ToastOptions } from '@/wd'

const toast: Toast = useToast()
const options: ToastOptions = {
  msg: '类型安全的配置',
  duration: 3000,
  position: 'top',
}
```

## 总结

`useToast` 核心使用要点:

1. **创建实例**: `const toast = useToast()` 或 `useToast('selector')`
2. **显示提示**: 根据场景选择 `success/error/warning/info/loading`
3. **关闭 loading**: 必须手动调用 `toast.close()`
4. **页面配置**: 必须放置 `<wd-toast />` 组件
5. **多实例隔离**: 不同功能模块使用不同 selector
