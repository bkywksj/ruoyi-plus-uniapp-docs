# 布局概述

## 介绍

RuoYi-Plus-UniApp 使用基于 Vue Router 的布局系统,通过 `<slot>` 插槽实现页面内容的灵活组织。布局组件提供了统一的页面结构、导航栏、底部栏等通用元素,页面组件只需关注业务内容的实现。

**核心特性:**

- **布局复用** - 多个页面共享相同的布局结构
- **灵活配置** - 通过 route 配置块自定义布局
- **全局组件** - 统一管理 Toast、Modal 等反馈组件
- **主题集成** - 与主题系统无缝集成
- **响应式布局** - 适配不同屏幕尺寸

## 布局系统架构

### 布局层级

```
App.vue (应用根组件)
  └── Layout Component (布局组件)
        ├── Navigation Bar (导航栏)
        ├── <slot /> (页面内容插槽)
        ├── Tab Bar (底部导航)
        └── Global Components (全局组件)
              ├── wd-toast (轻提示)
              ├── wd-notify (通知)
              └── wd-message-box (确认框)
```

### 布局文件结构

```
src/layouts/
├── default.vue       # 默认布局
├── navbar.vue        # 带导航栏布局
├── tabbar.vue        # 带底部栏布局
├── capsule.vue       # 胶囊布局
├── custom.vue        # 自定义布局
└── demo.vue          # 演示布局
```

## 默认布局 (default.vue)

### 基本结构

默认布局是最简单的布局方式,只包含全局组件和主题配置:

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!--  内容插槽  -->
    <slot />
    <!--  轻提示组件  -->
    <wd-toast />
    <!--  消息通知   -->
    <wd-notify />
    <!--  消息确认弹窗   -->
    <wd-message-box />
    <!--  授权头像昵称弹窗  -->
    <AuthModal />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  // 需要覆盖的主题变量
})
</script>
```

### 组件说明

| 组件 | 用途 | 调用方式 |
|------|------|---------|
| `wd-config-provider` | 主题配置提供者 | 包裹所有内容 |
| `<slot />` | 页面内容插槽 | 自动注入 |
| `wd-toast` | 轻提示 | `useToast()` |
| `wd-notify` | 通知消息 | `useNotify()` |
| `wd-message-box` | 确认对话框 | `useMessageBox()` |
| `AuthModal` | 授权弹窗 | 自动触发 |

### 使用示例

页面无需配置即可使用默认布局:

```vue
<template>
  <view class="page">
    <text>页面内容</text>
  </view>
</template>

<script lang="ts" setup>
// 页面逻辑
</script>
```

## 布局配置

### Route 块配置

通过在页面顶部添加 `<route>` 块来配置布局:

```vue
<template>
  <view class="page">
    内容
  </view>
</template>

<route lang="json5">
{
  layout: 'navbar', // 使用 navbar 布局
  style: {
    navigationBarTitleText: '页面标题',
  },
}
</route>
```

### 布局类型

| 布局名称 | 文件名 | 适用场景 |
|---------|--------|---------|
| default | default.vue | 默认布局,简单页面 |
| navbar | navbar.vue | 带导航栏的页面 |
| tabbar | tabbar.vue | 底部导航页面 |
| capsule | capsule.vue | 胶囊式导航 |
| custom | custom.vue | 完全自定义布局 |
| demo | demo.vue | 演示和测试 |

### 页面样式配置

完整的页面样式配置示例:

```vue
<route lang="json5">
{
  layout: 'default',

  style: {
    // ===== 导航栏配置 =====
    navigationStyle: 'default', // 'default' | 'custom' 是否自定义导航栏
    navigationBarTitleText: '页面标题',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black', // 'black' | 'white'
    navigationBarShadow: {
      colorType: 1 // 0-无阴影 1-有阴影
    },

    // ===== 窗口配置 =====
    backgroundColor: '#f5f5f5',
    backgroundTextStyle: 'dark', // 下拉loading样式
    backgroundColorTop: '#ffffff', // 顶部背景(仅iOS)
    backgroundColorBottom: '#ffffff', // 底部背景(仅iOS)

    // ===== 下拉刷新 =====
    enablePullDownRefresh: false,
    onReachBottomDistance: 50,

    // ===== 其他配置 =====
    disableScroll: false, // 禁止页面滚动
    titlePenetrate: 'NO', // 允许点击穿透标题栏
  },

  // ===== 自定义元数据 =====
  meta: {
    auth: true, // 需要登录
    title: '自定义标题',
    roles: ['admin'], // 权限角色
    keepAlive: true, // 缓存页面
  },
}
</route>
```

### 平台特定配置

不同平台可以有不同的配置:

```vue
<route lang="json5">
{
  style: {
    // App 平台配置
    'app-plus': {
      bounce: 'vertical', // 页面回弹
      scrollIndicator: 'none', // 滚动条
      animationType: 'slide-in-right',
      animationDuration: 300,
    },

    // H5 平台配置
    h5: {
      pullToRefresh: {
        color: '#2bd009'
      },
    },

    // 微信小程序配置
    'mp-weixin': {
      shareElement: 'element-id'
    },

    // 支付宝小程序配置
    'mp-alipay': {
      allowsBounceVertical: 'YES'
    },
  },
}
</route>
```

## 全局组件

### Toast 轻提示

轻量级的消息提示:

```typescript
import { useToast } from '@/wd'

const toast = useToast()

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 警告提示
toast.warning('请注意')

// 加载提示
toast.loading('加载中...')
```

### Notify 通知

页面顶部的通知消息:

```typescript
import { useNotify } from '@/wd'

const notify = useNotify()

// 成功通知
notify.success('保存成功')

// 错误通知
notify.error('网络错误')

// 警告通知
notify.warning('请检查输入')

// 信息通知
notify.info('新消息')
```

### MessageBox 确认框

模态确认对话框:

```typescript
import { useMessageBox } from '@/wd'

const messageBox = useMessageBox()

// 确认操作
const result = await messageBox.confirm({
  title: '提示',
  message: '确定要删除吗?',
})

if (result) {
  // 用户点击确定
}

// 警告提示
await messageBox.alert({
  title: '警告',
  message: '操作不可撤销',
})
```

## 主题集成

### 主题变量

布局组件通过 `wd-config-provider` 提供主题变量:

```vue
<script lang="ts" setup>
const { themeVars } = useTheme({
  // 覆盖主题变量
  colorPrimary: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorDanger: '#ff4d4f',

  // 背景色
  colorBgBase: '#ffffff',
  colorBgContainer: '#f5f5f5',

  // 文本色
  colorText: '#333333',
  colorTextSecondary: '#666666',
})
</script>
```

### 暗色模式

自动适配暗色模式:

```typescript
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()

// 切换主题
toggleTheme()

// 检查当前主题
if (isDark.value) {
  console.log('当前是暗色模式')
}
```

## 自定义布局

### 创建自定义布局

在 `src/layouts/` 目录下创建新的布局文件:

```vue
<!-- src/layouts/custom.vue -->
<template>
  <view class="custom-layout">
    <!-- 自定义头部 -->
    <view class="custom-header">
      <text>自定义头部</text>
    </view>

    <!-- 页面内容 -->
    <view class="custom-content">
      <slot />
    </view>

    <!-- 自定义底部 -->
    <view class="custom-footer">
      <text>自定义底部</text>
    </view>

    <!-- 全局组件 -->
    <wd-toast />
    <wd-notify />
  </view>
</template>

<script lang="ts" setup>
// 布局逻辑
</script>

<style lang="scss" scoped>
.custom-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.custom-header {
  height: 88rpx;
  background: #fff;
}

.custom-content {
  flex: 1;
  overflow-y: auto;
}

.custom-footer {
  height: 100rpx;
  background: #f5f5f5;
}
</style>
```

### 使用自定义布局

在页面中指定使用自定义布局:

```vue
<template>
  <view class="page">
    内容
  </view>
</template>

<route lang="json5">
{
  layout: 'custom', // 使用自定义布局
}
</route>
```

## 响应式布局

### 屏幕尺寸适配

使用 rpx 单位实现响应式:

```scss
.layout {
  padding: 32rpx; // 自动适配不同屏幕

  @media (min-width: 768px) {
    padding: 64rpx; // 平板端
  }

  @media (min-width: 1024px) {
    padding: 96rpx; // PC端
  }
}
```

### 安全区域适配

处理刘海屏和底部指示器:

```scss
.layout {
  /* 顶部安全区 */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);

  /* 底部安全区 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

## 布局最佳实践

### 1. 选择合适的布局

根据页面特点选择布局:

```typescript
// 简单页面 → default 布局
// 需要导航 → navbar 布局
// 底部导航 → tabbar 布局
// 特殊需求 → custom 布局
```

### 2. 避免布局嵌套

不要在布局内部使用布局:

```vue
<!-- ❌ 错误:布局嵌套 -->
<template>
  <default-layout>
    <navbar-layout>
      <slot />
    </navbar-layout>
  </default-layout>
</template>

<!-- ✅ 正确:单一布局 -->
<template>
  <navbar-layout>
    <slot />
  </navbar-layout>
</template>
```

### 3. 全局组件统一管理

所有全局反馈组件放在布局中:

```vue
<template>
  <view class="layout">
    <slot />

    <!-- 全局组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />
    <wd-action-sheet />
  </view>
</template>
```

### 4. 主题变量注入

在布局根组件注入主题:

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme()
</script>
```

### 5. 性能优化

避免在布局中进行复杂计算:

```vue
<script lang="ts" setup>
// ❌ 避免:复杂计算
const complexComputed = computed(() => {
  // 大量计算...
})

// ✅ 推荐:简单逻辑
const { themeVars } = useTheme()
</script>
```

## 常见问题

### 1. 布局不生效

**问题原因:**

route 配置块格式错误或布局文件不存在。

**解决方案:**

```vue
<!-- 检查 route 块格式 -->
<route lang="json5">
{
  layout: 'default', // 确保布局名称正确
}
</route>

<!-- 确保布局文件存在 -->
<!-- src/layouts/default.vue -->
```

### 2. 全局组件无法使用

**问题原因:**

全局组件未在布局中注册。

**解决方案:**

```vue
<template>
  <view class="layout">
    <slot />
    <!-- 确保添加全局组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />
  </view>
</template>
```

### 3. 主题变量不生效

**问题原因:**

缺少 `wd-config-provider` 包裹。

**解决方案:**

```vue
<template>
  <!-- 必须用 wd-config-provider 包裹 -->
  <wd-config-provider :theme-vars="themeVars">
    <slot />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme()
</script>
```

### 4. 安全区域适配问题

**问题原因:**

未正确使用 CSS 变量。

**解决方案:**

```scss
.layout {
  /* 同时使用 constant 和 env */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
```

### 5. 页面内容被遮挡

**问题原因:**

固定定位的导航栏遮挡内容。

**解决方案:**

```vue
<template>
  <view class="layout">
    <view class="navbar" />
    <!-- 添加 padding 避免遮挡 -->
    <view class="content" :style="{ paddingTop: navbarHeight + 'px' }">
      <slot />
    </view>
  </view>
</template>

<script lang="ts" setup>
const navbarHeight = ref(88) // 导航栏高度
</script>
```

## 布局调试

### 开发工具调试

```typescript
// 在布局组件中添加调试日志
onMounted(() => {
  console.log('布局已挂载:', getCurrentInstance()?.type.name)
})

onUnmounted(() => {
  console.log('布局已卸载')
})
```

### 样式调试

```scss
// 临时添加边框查看布局
.layout {
  border: 1rpx solid red; // 调试用
}

.content {
  border: 1rpx solid blue; // 调试用
}
```

## 布局性能优化

### 1. 使用 v-once

对于静态内容使用 v-once:

```vue
<template>
  <view v-once class="static-header">
    静态头部内容
  </view>
</template>
```

### 2. 懒加载组件

按需加载全局组件:

```vue
<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'

const AuthModal = defineAsyncComponent(
  () => import('@/components/AuthModal.vue')
)
</script>
```

### 3. 避免频繁更新

使用 computed 缓存计算结果:

```vue
<script lang="ts" setup>
const { themeVars } = useTheme()

// 缓存主题变量
const cachedThemeVars = computed(() => themeVars.value)
</script>
```

## 布局扩展

### 添加新布局

1. 创建布局文件
2. 定义布局结构
3. 添加全局组件
4. 在页面中使用

```vue
<!-- src/layouts/新布局.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 自定义结构 -->
    <slot />

    <!-- 全局组件 -->
    <wd-toast />
  </wd-config-provider>
</template>
```

### 布局预设

可以创建布局预设配置:

```typescript
// src/config/layouts.ts
export const layoutPresets = {
  simple: 'default',
  withNav: 'navbar',
  withTab: 'tabbar',
  custom: 'custom',
}
```

## 总结

布局系统是 UniApp 应用的基础架构,合理使用布局可以:

- ✅ 统一页面结构
- ✅ 提高代码复用性
- ✅ 简化页面开发
- ✅ 统一管理全局组件
- ✅ 更好地支持主题切换

选择合适的布局,遵循最佳实践,可以显著提升开发效率和用户体验。
