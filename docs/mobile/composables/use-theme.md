# useTheme 主题配置管理

## 介绍

`useTheme` 是一个用于主题配置管理的组合式函数,提供统一的主题定制和切换能力。该 Composable 基于 WD UI 组件库的 ConfigProvider,支持默认主题、全局主题覆盖和局部主题定制三级配置体系,让开发者可以灵活地控制应用的视觉风格。

在现代移动应用开发中,主题定制是提升用户体验和品牌识别度的重要手段。`useTheme` 通过响应式的主题配置系统,实现了从全局到局部的多层级主题管理,支持动态切换主题、暗黑模式适配、品牌色定制等功能,同时保持了良好的开发体验和性能表现。

**核心特性:**

- **三级配置体系** - 默认主题、全局覆盖、局部定制,按优先级自动合并
- **响应式设计** - 基于 Vue 3 响应式系统,主题变化自动更新所有组件
- **全局状态共享** - 全局主题配置在所有组件实例间共享,统一管理
- **局部定制能力** - 支持在特定页面或组件中覆盖全局主题配置
- **完整类型支持** - 完整的 TypeScript 类型定义,智能提示所有可配置项
- **性能优化** - 使用计算属性缓存主题配置,避免不必要的计算
- **易于集成** - 与 WD UI 组件库无缝集成,直接绑定到 ConfigProvider
- **动态切换** - 支持运行时动态修改主题,实时生效
- **配置重置** - 提供重置功能,快速恢复到默认主题
- **主题隔离** - 局部主题不影响全局配置,实现完美隔离
- **调试友好** - 提供获取当前主题配置的方法,便于调试和问题排查
- **扩展性强** - 支持自定义任意 WD UI 组件的主题变量

## 基本用法

### 使用默认主题

最简单的使用方式,直接使用默认主题配置。

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="page">
      <wd-button type="primary">主题色按钮</wd-button>
      <wd-button type="success">成功色按钮</wd-button>
      <wd-button type="warning">警告色按钮</wd-button>
      <wd-button type="danger">危险色按钮</wd-button>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { themeVars } = useTheme()
</script>

<style lang="scss" scoped>
.page {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `themeVars` 是响应式的主题配置对象
- 直接绑定到 `wd-config-provider` 的 `theme-vars` 属性
- 使用默认主题配置,包括主题色、成功色、警告色、危险色等
- 默认主题色为 `#409EFF` (Element Plus 风格)

### 局部主题定制

在特定页面或组件中自定义主题配置。

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="custom-page">
      <text class="title">品牌色定制页面</text>
      <wd-button type="primary">品牌色按钮</wd-button>
      <wd-button type="success">成功色按钮</wd-button>

      <wd-loading :size="loadingSize" />

      <view class="navbar">
        <text class="navbar-title">大号标题</text>
      </view>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

// 局部定制主题
const { themeVars } = useTheme({
  // 自定义主题色为品牌色
  colorTheme: '#FF4757',
  // 自定义成功色
  colorSuccess: '#26DE81',
  // 自定义 Loading 大小
  loadingSize: '60rpx',
  // 自定义导航栏标题样式
  navbarTitleFontSize: '36rpx',
  navbarTitleFontWeight: 'bold',
})
</script>

<style lang="scss" scoped>
.custom-page {
  padding: 32rpx;

  .title {
    font-size: 32rpx;
    margin-bottom: 24rpx;
  }

  .navbar {
    margin-top: 48rpx;

    .navbar-title {
      font-size: var(--wd-navbar-title-font-size);
      font-weight: var(--wd-navbar-title-font-weight);
    }
  }
}
</style>
```

**使用说明:**
- 通过 `useTheme()` 的参数传入局部主题配置
- 局部配置仅在当前 ConfigProvider 作用域内生效
- 不影响其他页面或组件的主题配置
- 可以覆盖任意数量的主题变量
- 未覆盖的变量使用默认值或全局配置

### 全局主题配置

在应用入口设置全局主题,影响所有页面。

```vue
<template>
  <view class="app">
    <view class="theme-panel">
      <text class="title">全局主题配置</text>
      <wd-button @click="applyLightTheme">亮色主题</wd-button>
      <wd-button @click="applyDarkTheme">暗色主题</wd-button>
      <wd-button @click="applyBrandTheme">品牌主题</wd-button>
      <wd-button type="danger" @click="handleReset">重置主题</wd-button>
    </view>

    <view class="preview">
      <wd-button type="primary">主题色按钮</wd-button>
      <wd-button type="success">成功色按钮</wd-button>
      <wd-loading />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { setGlobalTheme, resetGlobalTheme } = useTheme()

// 应用亮色主题
const applyLightTheme = () => {
  setGlobalTheme({
    colorTheme: '#409EFF',
    colorSuccess: '#52C41A',
    colorWarning: '#FFBA00',
    colorDanger: '#F56C6C',
  })

  uni.showToast({
    title: '已切换到亮色主题',
    icon: 'success'
  })
}

// 应用暗色主题
const applyDarkTheme = () => {
  setGlobalTheme({
    colorTheme: '#177DDC',
    colorSuccess: '#49AA19',
    colorWarning: '#D89614',
    colorDanger: '#D32029',
  })

  uni.showToast({
    title: '已切换到暗色主题',
    icon: 'success'
  })
}

// 应用品牌主题
const applyBrandTheme = () => {
  setGlobalTheme({
    colorTheme: '#FF4757',
    colorSuccess: '#26DE81',
    colorWarning: '#FFA502',
    colorDanger: '#E74C3C',
    loadingSize: '50rpx',
  })

  uni.showToast({
    title: '已切换到品牌主题',
    icon: 'success'
  })
}

// 重置到默认主题
const handleReset = () => {
  resetGlobalTheme()

  uni.showToast({
    title: '已重置到默认主题',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.app {
  padding: 32rpx;

  .theme-panel {
    margin-bottom: 48rpx;

    .title {
      font-size: 32rpx;
      margin-bottom: 24rpx;
      display: block;
    }

    wd-button {
      margin-right: 16rpx;
      margin-bottom: 16rpx;
    }
  }

  .preview {
    padding: 32rpx;
    background: #f5f5f5;
    border-radius: 16rpx;

    wd-button {
      margin-right: 16rpx;
      margin-bottom: 16rpx;
    }
  }
}
</style>
```

**使用说明:**
- `setGlobalTheme()` 设置全局主题配置
- 全局配置会影响应用中所有使用主题的组件
- 多次调用会合并配置,不会完全替换
- `resetGlobalTheme()` 可以清空全局配置,恢复默认主题
- 全局配置的优先级低于局部配置

### 动态主题切换

实现主题动态切换功能,如暗黑模式切换。

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="page">
      <view class="header">
        <text class="title">暗黑模式示例</text>
        <wd-switch v-model="isDark" @change="handleThemeChange" />
      </view>

      <view class="content">
        <wd-button type="primary">主按钮</wd-button>
        <wd-button type="success">成功按钮</wd-button>
        <wd-button type="warning">警告按钮</wd-button>
        <wd-button type="danger">危险按钮</wd-button>

        <view class="card">
          <text class="card-title">卡片标题</text>
          <text class="card-content">这是卡片内容,会根据主题变化</text>
        </view>
      </view>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const isDark = ref(false)
const { themeVars, setGlobalTheme } = useTheme()

// 亮色主题配置
const lightTheme = {
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',
  messageBoxTitleColor: '#333333',
  messageBoxContentColor: '#666666',
}

// 暗色主题配置
const darkTheme = {
  colorTheme: '#177DDC',
  colorSuccess: '#49AA19',
  colorWarning: '#D89614',
  colorDanger: '#D32029',
  messageBoxTitleColor: '#E8E8E8',
  messageBoxContentColor: '#B3B3B3',
}

// 主题切换处理
const handleThemeChange = (value: boolean) => {
  const theme = value ? darkTheme : lightTheme
  setGlobalTheme(theme)

  // 保存主题偏好到本地存储
  uni.setStorageSync('theme', value ? 'dark' : 'light')

  uni.showToast({
    title: `已切换到${value ? '暗色' : '亮色'}主题`,
    icon: 'success'
  })
}

// 初始化时恢复用户主题偏好
onMounted(() => {
  const savedTheme = uni.getStorageSync('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    setGlobalTheme(darkTheme)
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: var(--wd-bg-color, #ffffff);
  transition: background-color 0.3s;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
    }
  }

  .content {
    wd-button {
      margin-right: 16rpx;
      margin-bottom: 16rpx;
    }

    .card {
      margin-top: 48rpx;
      padding: 32rpx;
      background: #f5f5f5;
      border-radius: 16rpx;

      .card-title {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 16rpx;
      }

      .card-content {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}
</style>
```

**使用说明:**
- 定义亮色和暗色两套主题配置
- 使用 `wd-switch` 组件实现主题切换交互
- 通过 `setGlobalTheme()` 动态应用主题
- 使用 `uni.setStorageSync` 持久化用户主题偏好
- 在 `onMounted` 钩子中恢复用户的主题设置
- 建议添加 CSS 过渡动画,提升切换体验

### 获取当前主题配置

获取当前生效的完整主题配置,用于调试或外部使用。

```vue
<template>
  <view class="debug-panel">
    <text class="title">主题配置调试</text>

    <wd-button @click="showCurrentTheme">查看当前主题</wd-button>
    <wd-button @click="exportTheme">导出主题配置</wd-button>

    <view v-if="currentConfig" class="config-display">
      <text class="subtitle">当前主题配置:</text>
      <view class="config-item" v-for="(value, key) in currentConfig" :key="key">
        <text class="key">{{ key }}:</text>
        <text class="value">{{ value }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
import type { ConfigProviderThemeVars } from '@/wd'

const { getCurrentTheme } = useTheme()
const currentConfig = ref<ConfigProviderThemeVars | null>(null)

// 显示当前主题配置
const showCurrentTheme = () => {
  const config = getCurrentTheme()
  currentConfig.value = config

  console.log('当前主题配置:', config)

  uni.showToast({
    title: '配置已输出到控制台',
    icon: 'success'
  })
}

// 导出主题配置为 JSON
const exportTheme = () => {
  const config = getCurrentTheme()
  const jsonStr = JSON.stringify(config, null, 2)

  // H5 环境下可以下载文件
  // #ifdef H5
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'theme-config.json'
  a.click()
  URL.revokeObjectURL(url)
  // #endif

  // 小程序环境下复制到剪贴板
  // #ifndef H5
  uni.setClipboardData({
    data: jsonStr,
    success: () => {
      uni.showToast({
        title: '配置已复制到剪贴板',
        icon: 'success'
      })
    }
  })
  // #endif

  console.log('主题配置 JSON:', jsonStr)
}
</script>

<style lang="scss" scoped>
.debug-panel {
  padding: 32rpx;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
    display: block;
  }

  wd-button {
    margin-right: 16rpx;
    margin-bottom: 16rpx;
  }

  .config-display {
    margin-top: 48rpx;
    padding: 24rpx;
    background: #f5f5f5;
    border-radius: 16rpx;

    .subtitle {
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 16rpx;
      display: block;
    }

    .config-item {
      display: flex;
      padding: 8rpx 0;
      font-size: 24rpx;

      .key {
        color: #666;
        min-width: 300rpx;
      }

      .value {
        color: #333;
        font-weight: 500;
      }
    }
  }
}
</style>
```

**使用说明:**
- `getCurrentTheme()` 返回当前生效的完整主题配置
- 返回的配置是合并后的最终结果
- 包含默认主题、全局覆盖和局部定制的所有配置
- 适用于调试、配置导出、主题分享等场景
- 可以将配置保存为 JSON 文件或分享给其他开发者

### 主题配置合并

理解主题配置的优先级和合并规则。

```vue
<template>
  <view class="merge-demo">
    <text class="title">主题配置合并示例</text>

    <view class="section">
      <text class="subtitle">默认主题</text>
      <wd-config-provider :theme-vars="defaultTheme">
        <wd-button type="primary">默认主题色 (#409EFF)</wd-button>
      </wd-config-provider>
    </view>

    <view class="section">
      <text class="subtitle">全局覆盖主题</text>
      <wd-config-provider :theme-vars="globalTheme">
        <wd-button type="primary">全局主题色 (#FF4757)</wd-button>
      </wd-config-provider>
    </view>

    <view class="section">
      <text class="subtitle">局部定制主题</text>
      <wd-config-provider :theme-vars="localTheme">
        <wd-button type="primary">局部主题色 (#9C27B0)</wd-button>
      </wd-config-provider>
    </view>

    <view class="section">
      <text class="subtitle">优先级说明</text>
      <text class="desc">默认主题 < 全局覆盖 < 局部定制</text>
      <text class="desc">局部定制的优先级最高,会覆盖全局配置</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

// 1. 默认主题 (优先级最低)
const { themeVars: defaultTheme } = useTheme()

// 2. 设置全局覆盖
const { themeVars: globalTheme, setGlobalTheme } = useTheme()
setGlobalTheme({
  colorTheme: '#FF4757',
  colorSuccess: '#26DE81',
})

// 3. 局部定制 (优先级最高)
const { themeVars: localTheme } = useTheme({
  colorTheme: '#9C27B0',
  colorWarning: '#FFA502',
})

onMounted(() => {
  // 演示配置合并
  console.log('默认主题:', defaultTheme.value.colorTheme) // #409EFF
  console.log('全局主题:', globalTheme.value.colorTheme) // #FF4757
  console.log('局部主题:', localTheme.value.colorTheme) // #9C27B0
})
</script>

<style lang="scss" scoped>
.merge-demo {
  padding: 32rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 48rpx;
    display: block;
  }

  .section {
    margin-bottom: 48rpx;

    .subtitle {
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 16rpx;
      display: block;
    }

    .desc {
      display: block;
      font-size: 24rpx;
      color: #666;
      margin-top: 8rpx;
    }
  }
}
</style>
```

**技术实现:**
- 主题配置按优先级合并: 默认主题 → 全局覆盖 → 局部定制
- 使用对象展开运算符 `...` 实现配置合并
- 后面的配置会覆盖前面的同名属性
- 未配置的属性使用默认值
- 全局配置在所有实例间共享,局部配置仅影响当前作用域

## 高级用法

### 品牌主题定制

根据品牌设计规范定制完整的主题方案。

```typescript
// theme/brand.ts
import type { ConfigProviderThemeVars } from '@/wd'

/**
 * 品牌主题配置
 */
export const brandTheme: Partial<ConfigProviderThemeVars> = {
  // 品牌色彩系统
  colorTheme: '#1890FF',      // 主品牌色
  colorSuccess: '#52C41A',    // 成功色
  colorWarning: '#FAAD14',    // 警告色
  colorDanger: '#F5222D',     // 危险色

  // Loading 组件
  loadingSize: '44rpx',

  // MessageBox 组件
  messageBoxTitleColor: '#262626',
  messageBoxContentColor: '#595959',

  // Notify 组件
  notifyPadding: '20rpx 32rpx',
  notifyFontSize: '28rpx',

  // 导航栏组件
  navbarTitleFontSize: '34rpx',
  navbarTitleFontWeight: '500',
}

/**
 * 暗色主题配置
 */
export const darkTheme: Partial<ConfigProviderThemeVars> = {
  colorTheme: '#177DDC',
  colorSuccess: '#49AA19',
  colorWarning: '#D89614',
  colorDanger: '#D32029',

  messageBoxTitleColor: '#E8E8E8',
  messageBoxContentColor: '#B3B3B3',
}
```

在应用中使用:

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="app">
      <!-- 应用内容 -->
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
import { brandTheme } from '@/theme/brand'

const { themeVars, setGlobalTheme } = useTheme()

// 应用品牌主题
onMounted(() => {
  setGlobalTheme(brandTheme)
})
</script>
```

**技术实现:**
- 将品牌主题配置提取到独立文件
- 使用 TypeScript 类型约束确保配置正确
- 支持定义多套主题方案(品牌色、暗色等)
- 在应用启动时统一应用主题
- 便于团队协作和主题维护

### 主题切换动画

为主题切换添加平滑的过渡动画效果。

```vue
<template>
  <view class="theme-animation-demo" :class="{ dark: isDark }">
    <view class="header">
      <text class="title">主题切换动画</text>
      <wd-switch v-model="isDark" @change="handleThemeSwitch" />
    </view>

    <view class="content">
      <wd-button type="primary">主按钮</wd-button>
      <wd-button type="success">成功按钮</wd-button>

      <view class="card">
        <text class="card-title">主题动画卡片</text>
        <text class="card-desc">切换主题时会有平滑的颜色过渡</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const isDark = ref(false)
const { setGlobalTheme } = useTheme()

const handleThemeSwitch = (value: boolean) => {
  // 添加切换动画类
  const pageEl = document.querySelector('.theme-animation-demo')
  pageEl?.classList.add('theme-switching')

  // 应用新主题
  if (value) {
    setGlobalTheme({
      colorTheme: '#177DDC',
      colorSuccess: '#49AA19',
    })
  } else {
    setGlobalTheme({
      colorTheme: '#409EFF',
      colorSuccess: '#52C41A',
    })
  }

  // 动画结束后移除动画类
  setTimeout(() => {
    pageEl?.classList.remove('theme-switching')
  }, 300)
}
</script>

<style lang="scss" scoped>
.theme-animation-demo {
  min-height: 100vh;
  padding: 32rpx;
  background: #ffffff;
  transition: all 0.3s ease;

  &.dark {
    background: #1a1a1a;

    .title {
      color: #ffffff;
    }

    .card {
      background: #2a2a2a;

      .card-title {
        color: #ffffff;
      }

      .card-desc {
        color: #b3b3b3;
      }
    }
  }

  &.theme-switching {
    * {
      transition: all 0.3s ease !important;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      transition: color 0.3s ease;
    }
  }

  .content {
    wd-button {
      margin-right: 16rpx;
      margin-bottom: 16rpx;
    }

    .card {
      margin-top: 48rpx;
      padding: 32rpx;
      background: #f5f5f5;
      border-radius: 16rpx;
      transition: background-color 0.3s ease;

      .card-title {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 16rpx;
        transition: color 0.3s ease;
      }

      .card-desc {
        font-size: 28rpx;
        color: #666;
        transition: color 0.3s ease;
      }
    }
  }
}
</style>
```

**技术实现:**
- 使用 CSS `transition` 属性添加过渡动画
- 在主题切换时临时添加 `.theme-switching` 类
- 通过 JavaScript 控制动画时机
- 动画结束后移除动画类,避免影响其他交互
- 推荐动画时长 0.3s,符合用户体验最佳实践

### 主题持久化

将用户的主题偏好保存到本地存储,实现跨会话保持。

```typescript
// composables/useThemePersist.ts
import { useTheme } from '@/composables/useTheme'
import type { ConfigProviderThemeVars } from '@/wd'

const THEME_STORAGE_KEY = 'app_theme_config'
const THEME_MODE_KEY = 'app_theme_mode'

/**
 * 主题持久化 Composable
 */
export const useThemePersist = () => {
  const { setGlobalTheme, resetGlobalTheme, getCurrentTheme } = useTheme()

  /**
   * 保存主题配置到本地存储
   */
  const saveTheme = (config: Partial<ConfigProviderThemeVars>) => {
    try {
      uni.setStorageSync(THEME_STORAGE_KEY, JSON.stringify(config))
      console.log('主题配置已保存')
    } catch (error) {
      console.error('保存主题配置失败:', error)
    }
  }

  /**
   * 从本地存储加载主题配置
   */
  const loadTheme = (): Partial<ConfigProviderThemeVars> | null => {
    try {
      const configStr = uni.getStorageSync(THEME_STORAGE_KEY)
      if (configStr) {
        return JSON.parse(configStr)
      }
    } catch (error) {
      console.error('加载主题配置失败:', error)
    }
    return null
  }

  /**
   * 保存主题模式(亮色/暗色)
   */
  const saveThemeMode = (mode: 'light' | 'dark') => {
    uni.setStorageSync(THEME_MODE_KEY, mode)
  }

  /**
   * 加载主题模式
   */
  const loadThemeMode = (): 'light' | 'dark' => {
    return uni.getStorageSync(THEME_MODE_KEY) || 'light'
  }

  /**
   * 应用已保存的主题
   */
  const applyStoredTheme = () => {
    const config = loadTheme()
    if (config) {
      setGlobalTheme(config)
      console.log('已应用保存的主题配置')
    }
  }

  /**
   * 清除保存的主题
   */
  const clearStoredTheme = () => {
    uni.removeStorageSync(THEME_STORAGE_KEY)
    uni.removeStorageSync(THEME_MODE_KEY)
    resetGlobalTheme()
    console.log('已清除主题配置')
  }

  return {
    saveTheme,
    loadTheme,
    saveThemeMode,
    loadThemeMode,
    applyStoredTheme,
    clearStoredTheme,
  }
}
```

使用示例:

```vue
<template>
  <view class="app">
    <wd-button @click="saveCurrentTheme">保存当前主题</wd-button>
    <wd-button @click="loadSavedTheme">加载保存的主题</wd-button>
    <wd-button @click="clearTheme">清除主题</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
import { useThemePersist } from '@/composables/useThemePersist'

const { getCurrentTheme } = useTheme()
const { saveTheme, applyStoredTheme, clearStoredTheme } = useThemePersist()

// 保存当前主题
const saveCurrentTheme = () => {
  const current = getCurrentTheme()
  saveTheme(current)

  uni.showToast({
    title: '主题已保存',
    icon: 'success'
  })
}

// 加载保存的主题
const loadSavedTheme = () => {
  applyStoredTheme()

  uni.showToast({
    title: '主题已加载',
    icon: 'success'
  })
}

// 清除主题
const clearTheme = () => {
  clearStoredTheme()

  uni.showToast({
    title: '主题已清除',
    icon: 'success'
  })
}

// 应用启动时恢复主题
onMounted(() => {
  applyStoredTheme()
})
</script>
```

**技术实现:**
- 使用 `uni.setStorageSync` 保存主题配置
- 将主题对象序列化为 JSON 字符串存储
- 应用启动时自动恢复用户的主题偏好
- 提供清除功能,方便重置到默认状态
- 区分主题配置和主题模式,分别存储

### 多主题方案切换

支持多套预设主题方案,用户可快速切换。

```typescript
// theme/presets.ts
import type { ConfigProviderThemeVars } from '@/wd'

/**
 * 预设主题方案
 */
export const themePresets = {
  // 默认主题
  default: {
    name: '默认主题',
    colorTheme: '#409EFF',
    colorSuccess: '#52C41A',
    colorWarning: '#FFBA00',
    colorDanger: '#F56C6C',
  } as Partial<ConfigProviderThemeVars>,

  // 清新主题
  fresh: {
    name: '清新主题',
    colorTheme: '#00BCD4',
    colorSuccess: '#4CAF50',
    colorWarning: '#FF9800',
    colorDanger: '#F44336',
  } as Partial<ConfigProviderThemeVars>,

  // 科技主题
  tech: {
    name: '科技主题',
    colorTheme: '#3F51B5',
    colorSuccess: '#009688',
    colorWarning: '#FFC107',
    colorDanger: '#E91E63',
  } as Partial<ConfigProviderThemeVars>,

  // 优雅主题
  elegant: {
    name: '优雅主题',
    colorTheme: '#9C27B0',
    colorSuccess: '#8BC34A',
    colorWarning: '#FFEB3B',
    colorDanger: '#FF5722',
  } as Partial<ConfigProviderThemeVars>,

  // 暗黑主题
  dark: {
    name: '暗黑主题',
    colorTheme: '#177DDC',
    colorSuccess: '#49AA19',
    colorWarning: '#D89614',
    colorDanger: '#D32029',
    messageBoxTitleColor: '#E8E8E8',
    messageBoxContentColor: '#B3B3B3',
  } as Partial<ConfigProviderThemeVars>,
}

export type ThemePresetKey = keyof typeof themePresets
```

使用预设主题:

```vue
<template>
  <view class="theme-selector">
    <text class="title">选择主题方案</text>

    <view class="preset-list">
      <view
        v-for="(theme, key) in themePresets"
        :key="key"
        class="preset-item"
        :class="{ active: currentPreset === key }"
        @click="selectPreset(key as ThemePresetKey)"
      >
        <view class="preset-preview">
          <view
            class="color-dot"
            :style="{ background: theme.colorTheme }"
          />
          <view
            class="color-dot"
            :style="{ background: theme.colorSuccess }"
          />
          <view
            class="color-dot"
            :style="{ background: theme.colorWarning }"
          />
          <view
            class="color-dot"
            :style="{ background: theme.colorDanger }"
          />
        </view>
        <text class="preset-name">{{ theme.name }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
import { themePresets, type ThemePresetKey } from '@/theme/presets'

const { setGlobalTheme } = useTheme()
const currentPreset = ref<ThemePresetKey>('default')

const selectPreset = (key: ThemePresetKey) => {
  currentPreset.value = key
  const theme = themePresets[key]
  setGlobalTheme(theme)

  // 保存用户选择
  uni.setStorageSync('theme_preset', key)

  uni.showToast({
    title: `已切换到${theme.name}`,
    icon: 'success'
  })
}

// 恢复用户选择的主题
onMounted(() => {
  const saved = uni.getStorageSync('theme_preset')
  if (saved && saved in themePresets) {
    selectPreset(saved as ThemePresetKey)
  }
})
</script>

<style lang="scss" scoped>
.theme-selector {
  padding: 32rpx;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 32rpx;
    display: block;
  }

  .preset-list {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;

    .preset-item {
      width: 200rpx;
      padding: 24rpx;
      background: #f5f5f5;
      border-radius: 16rpx;
      border: 2rpx solid transparent;
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        border-color: #409EFF;
        background: #E3F2FD;
      }

      .preset-preview {
        display: flex;
        justify-content: center;
        gap: 8rpx;
        margin-bottom: 16rpx;

        .color-dot {
          width: 32rpx;
          height: 32rpx;
          border-radius: 50%;
        }
      }

      .preset-name {
        display: block;
        text-align: center;
        font-size: 24rpx;
      }
    }
  }
}
</style>
```

**技术实现:**
- 定义多套预设主题方案
- 提供可视化的主题选择界面
- 显示主题配色预览,便于用户选择
- 保存用户选择到本地存储
- 应用启动时恢复用户的主题选择

### 跟随系统主题

自动跟随系统的明暗模式设置。

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="app">
      <view class="settings">
        <text class="label">跟随系统主题</text>
        <wd-switch v-model="followSystem" @change="handleFollowSystemChange" />
      </view>

      <view class="preview">
        <text class="current-mode">当前模式: {{ currentMode }}</text>
        <wd-button type="primary">主按钮</wd-button>
        <wd-button type="success">成功按钮</wd-button>
      </view>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { themeVars, setGlobalTheme } = useTheme()
const followSystem = ref(true)
const currentMode = ref<'light' | 'dark'>('light')

// 亮色主题
const lightTheme = {
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',
}

// 暗色主题
const darkTheme = {
  colorTheme: '#177DDC',
  colorSuccess: '#49AA19',
  colorWarning: '#D89614',
  colorDanger: '#D32029',
}

// 应用主题
const applyTheme = (mode: 'light' | 'dark') => {
  currentMode.value = mode
  const theme = mode === 'dark' ? darkTheme : lightTheme
  setGlobalTheme(theme)
}

// 监听系统主题变化
const watchSystemTheme = () => {
  // H5 环境
  // #ifdef H5
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (followSystem.value) {
      applyTheme(e.matches ? 'dark' : 'light')
    }
  }

  // 初始化
  handleChange(mediaQuery)

  // 监听变化
  mediaQuery.addEventListener('change', handleChange)

  // 清理
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleChange)
  })
  // #endif

  // 小程序环境
  // #ifndef H5
  // 部分小程序支持获取系统主题
  const systemInfo = uni.getSystemInfoSync()
  const theme = systemInfo.theme || 'light'
  applyTheme(theme as 'light' | 'dark')
  // #endif
}

// 处理跟随系统开关变化
const handleFollowSystemChange = (value: boolean) => {
  if (value) {
    watchSystemTheme()
  }

  uni.setStorageSync('follow_system_theme', value)
}

// 初始化
onMounted(() => {
  const saved = uni.getStorageSync('follow_system_theme')
  if (saved !== undefined) {
    followSystem.value = saved
  }

  if (followSystem.value) {
    watchSystemTheme()
  }
})
</script>

<style lang="scss" scoped>
.app {
  padding: 32rpx;

  .settings {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    background: #f5f5f5;
    border-radius: 16rpx;
    margin-bottom: 48rpx;

    .label {
      font-size: 28rpx;
    }
  }

  .preview {
    .current-mode {
      display: block;
      font-size: 28rpx;
      margin-bottom: 24rpx;
    }

    wd-button {
      margin-right: 16rpx;
    }
  }
}
</style>
```

**技术实现:**
- H5 环境使用 `window.matchMedia` 监听系统主题
- 小程序环境通过 `uni.getSystemInfoSync` 获取系统主题
- 使用 `addEventListener` 监听主题变化事件
- 组件卸载时移除事件监听,避免内存泄漏
- 提供开关让用户选择是否跟随系统

### 主题变量扩展

扩展自定义主题变量,支持更多组件定制。

```typescript
// types/theme.d.ts
import type { ConfigProviderThemeVars } from '@/wd'

/**
 * 扩展主题变量接口
 */
export interface ExtendedThemeVars extends ConfigProviderThemeVars {
  // 自定义卡片组件变量
  cardBgColor?: string
  cardBorderColor?: string
  cardBorderRadius?: string
  cardShadow?: string

  // 自定义列表组件变量
  listItemBgColor?: string
  listItemHoverBgColor?: string
  listItemPadding?: string

  // 自定义表单变量
  formLabelColor?: string
  formInputBgColor?: string
  formInputBorderColor?: string
}
```

使用扩展主题:

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="page">
      <view class="card" :style="cardStyle">
        <text class="card-title">自定义卡片</text>
        <text class="card-content">使用扩展的主题变量</text>
      </view>

      <view class="list-item" :style="listItemStyle">
        <text>列表项 1</text>
      </view>
      <view class="list-item" :style="listItemStyle">
        <text>列表项 2</text>
      </view>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
import type { ExtendedThemeVars } from '@/types/theme'

const { themeVars } = useTheme({
  // WD UI 原生变量
  colorTheme: '#409EFF',

  // 扩展的自定义变量
  cardBgColor: '#ffffff',
  cardBorderColor: '#e0e0e0',
  cardBorderRadius: '16rpx',
  cardShadow: '0 4rpx 12rpx rgba(0,0,0,0.1)',

  listItemBgColor: '#f5f5f5',
  listItemHoverBgColor: '#e8e8e8',
  listItemPadding: '24rpx 32rpx',
} as ExtendedThemeVars)

// 卡片样式
const cardStyle = computed(() => ({
  background: (themeVars.value as ExtendedThemeVars).cardBgColor,
  borderColor: (themeVars.value as ExtendedThemeVars).cardBorderColor,
  borderRadius: (themeVars.value as ExtendedThemeVars).cardBorderRadius,
  boxShadow: (themeVars.value as ExtendedThemeVars).cardShadow,
}))

// 列表项样式
const listItemStyle = computed(() => ({
  background: (themeVars.value as ExtendedThemeVars).listItemBgColor,
  padding: (themeVars.value as ExtendedThemeVars).listItemPadding,
}))
</script>

<style lang="scss" scoped>
.page {
  padding: 32rpx;

  .card {
    padding: 32rpx;
    margin-bottom: 24rpx;
    border: 2rpx solid;

    .card-title {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 16rpx;
    }

    .card-content {
      font-size: 28rpx;
      color: #666;
    }
  }

  .list-item {
    margin-bottom: 16rpx;
    border-radius: 12rpx;
    transition: background 0.3s;

    &:active {
      background: var(--list-item-hover-bg-color);
    }

    text {
      font-size: 28rpx;
    }
  }
}
</style>
```

**技术实现:**
- 扩展 `ConfigProviderThemeVars` 接口添加自定义变量
- 使用类型断言将主题配置转换为扩展类型
- 通过计算属性将主题变量应用到组件样式
- 支持与 WD UI 原生变量混用
- 保持类型安全和智能提示

## API

### 返回值

`useTheme()` 返回一个包含以下属性和方法的对象:

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| themeVars | `ComputedRef<ConfigProviderThemeVars>` | 响应式主题配置对象 |
| setGlobalTheme | `(overrides: Partial<ConfigProviderThemeVars>) => void` | 设置全局主题覆盖 |
| resetGlobalTheme | `() => void` | 重置全局主题覆盖 |
| getCurrentTheme | `() => ConfigProviderThemeVars` | 获取当前完整主题配置 |

### 参数

```typescript
function useTheme(
  localOverrides?: Partial<ConfigProviderThemeVars>
): UseThemeReturn
```

**参数:**
- `localOverrides?` - 可选,局部主题覆盖配置,优先级最高

**返回值:**
- `UseThemeReturn` - 主题配置对象和相关操作方法

### 方法详解

#### themeVars

响应式的主题配置对象,直接绑定到 ConfigProvider。

```typescript
const themeVars: ComputedRef<ConfigProviderThemeVars>
```

**说明:**
- 计算属性,按优先级合并配置
- 合并顺序: 默认主题 → 全局覆盖 → 局部覆盖
- 自动响应配置变化
- 直接绑定到 `<wd-config-provider :theme-vars="themeVars">`

**示例:**
```typescript
const { themeVars } = useTheme()
console.log('当前主题色:', themeVars.value.colorTheme)
```

#### setGlobalTheme

设置全局主题覆盖配置。

```typescript
function setGlobalTheme(
  overrides: Partial<ConfigProviderThemeVars>
): void
```

**参数:**
- `overrides` - 要覆盖的主题配置项

**说明:**
- 会与现有全局配置合并,不会完全替换
- 影响所有使用主题的组件
- 多次调用会累加配置
- 全局配置在所有 `useTheme()` 实例间共享

**示例:**
```typescript
const { setGlobalTheme } = useTheme()

// 设置全局主题色
setGlobalTheme({
  colorTheme: '#FF4757',
  colorSuccess: '#26DE81',
})

// 再次调用会合并配置
setGlobalTheme({
  colorWarning: '#FFA502',
})
// 最终配置包含 colorTheme、colorSuccess、colorWarning
```

#### resetGlobalTheme

重置全局主题覆盖,恢复到默认主题。

```typescript
function resetGlobalTheme(): void
```

**说明:**
- 清空所有全局主题覆盖
- 恢复到默认主题配置
- 不影响局部主题定制
- 所有使用全局主题的组件会同步更新

**示例:**
```typescript
const { resetGlobalTheme } = useTheme()

// 重置到默认主题
resetGlobalTheme()
```

#### getCurrentTheme

获取当前生效的完整主题配置。

```typescript
function getCurrentTheme(): ConfigProviderThemeVars
```

**返回值:**
- `ConfigProviderThemeVars` - 当前生效的完整主题配置对象

**说明:**
- 返回合并后的最终主题配置
- 包含默认主题、全局覆盖和局部定制的所有配置
- 用于调试或外部使用
- 返回的是普通对象,不是响应式的

**示例:**
```typescript
const { getCurrentTheme } = useTheme()

const currentConfig = getCurrentTheme()
console.log('当前主题配置:', currentConfig)
console.log('主题色:', currentConfig.colorTheme)
```

## 主题变量

### 基础色彩

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| colorTheme | 主题色调 | `#409EFF` |
| colorSuccess | 成功色调 | `#52C41A` |
| colorWarning | 警告色调 | `#FFBA00` |
| colorDanger | 危险色调 | `#F56C6C` |

### Loading 组件

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| loadingSize | Loading 大小 | `40rpx` |

### MessageBox 组件

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| messageBoxTitleColor | 标题颜色 | `#333333` |
| messageBoxContentColor | 内容颜色 | `#666666` |

### Notify 组件

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| notifyPadding | 内边距 | `24rpx 32rpx` |
| notifyFontSize | 字体大小 | `28rpx` |

### 导航栏组件

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| navbarTitleFontSize | 标题字体大小 | `32rpx` |
| navbarTitleFontWeight | 标题字体粗细 | `normal` |

## 配置优先级

主题配置按以下优先级合并:

```
默认主题 < 全局覆盖 < 局部定制
```

**示例:**
```typescript
// 1. 默认主题 (优先级最低)
const DEFAULT_THEME = {
  colorTheme: '#409EFF',  // 默认主题色
  loadingSize: '40rpx',   // 默认 Loading 大小
}

// 2. 全局覆盖 (优先级中等)
setGlobalTheme({
  colorTheme: '#FF4757',  // 覆盖主题色
  // loadingSize 未覆盖,使用默认值
})

// 3. 局部定制 (优先级最高)
const { themeVars } = useTheme({
  loadingSize: '60rpx',   // 覆盖 Loading 大小
  // colorTheme 未定制,使用全局配置
})

// 最终生效配置:
// colorTheme: '#FF4757'  (来自全局覆盖)
// loadingSize: '60rpx'   (来自局部定制)
```

## 类型定义

### UseThemeReturn

```typescript
/**
 * useTheme 返回值类型
 */
interface UseThemeReturn {
  /** 响应式主题配置变量 */
  themeVars: ComputedRef<ConfigProviderThemeVars>

  /** 设置全局主题覆盖 */
  setGlobalTheme: (overrides: Partial<ConfigProviderThemeVars>) => void

  /** 重置全局主题覆盖 */
  resetGlobalTheme: () => void

  /** 获取当前完整主题配置 */
  getCurrentTheme: () => ConfigProviderThemeVars
}
```

### ConfigProviderThemeVars

```typescript
/**
 * 配置提供者主题变量接口
 * 完整类型定义请参考 WD UI 组件库文档
 */
interface ConfigProviderThemeVars {
  // 基础色彩
  colorTheme?: string
  colorSuccess?: string
  colorWarning?: string
  colorDanger?: string

  // Loading 组件
  loadingSize?: string

  // MessageBox 组件
  messageBoxTitleColor?: string
  messageBoxContentColor?: string

  // Notify 组件
  notifyPadding?: string
  notifyFontSize?: string

  // 导航栏
  navbarTitleFontSize?: string
  navbarTitleFontWeight?: string

  // ... 更多主题变量
}
```

## 最佳实践

### 1. 在应用入口统一配置主题

在 `App.vue` 中设置全局主题,确保整个应用风格统一。

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <router-view />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'
import { brandTheme } from '@/theme/brand'

const { themeVars, setGlobalTheme } = useTheme()

// 应用启动时设置品牌主题
onMounted(() => {
  setGlobalTheme(brandTheme)
})
</script>
```

### 2. 提取主题配置到独立文件

将主题配置集中管理,便于维护和复用。

```typescript
// theme/index.ts
import type { ConfigProviderThemeVars } from '@/wd'

/**
 * 品牌主题
 */
export const brandTheme: Partial<ConfigProviderThemeVars> = {
  colorTheme: '#1890FF',
  colorSuccess: '#52C41A',
  colorWarning: '#FAAD14',
  colorDanger: '#F5222D',
}

/**
 * 暗色主题
 */
export const darkTheme: Partial<ConfigProviderThemeVars> = {
  colorTheme: '#177DDC',
  colorSuccess: '#49AA19',
  colorWarning: '#D89614',
  colorDanger: '#D32029',
}

/**
 * 主题切换器
 */
export const useThemeSwitch = () => {
  const { setGlobalTheme } = useTheme()

  const switchToBrand = () => setGlobalTheme(brandTheme)
  const switchToDark = () => setGlobalTheme(darkTheme)

  return { switchToBrand, switchToDark }
}
```

### 3. 持久化用户主题偏好

保存用户的主题选择,提升用户体验。

```typescript
// 保存主题
const saveThemePreference = (mode: 'light' | 'dark') => {
  uni.setStorageSync('theme_mode', mode)
}

// 恢复主题
const restoreThemePreference = () => {
  const mode = uni.getStorageSync('theme_mode') || 'light'
  if (mode === 'dark') {
    setGlobalTheme(darkTheme)
  } else {
    setGlobalTheme(lightTheme)
  }
}

// 应用启动时恢复
onMounted(() => {
  restoreThemePreference()
})
```

### 4. 局部主题仅用于特殊页面

大部分页面使用全局主题,仅在特殊页面使用局部定制。

```vue
<!-- 特殊营销页面 -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="marketing-page">
      <!-- 使用特殊主题色的内容 -->
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

// 仅在此页面使用特殊主题色
const { themeVars } = useTheme({
  colorTheme: '#FF4757',  // 营销红色
  colorSuccess: '#26DE81',
})
</script>
```

### 5. 添加主题切换动画

为主题切换添加平滑过渡,提升用户体验。

```scss
// 全局样式
* {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}

// 或者添加主题切换类
.theme-transition {
  * {
    transition: all 0.3s ease !important;
  }
}
```

### 6. 使用 CSS 变量配合主题系统

结合 CSS 变量实现更灵活的主题定制。

```scss
// 定义 CSS 变量
:root {
  --primary-color: var(--wd-color-theme);
  --success-color: var(--wd-color-success);
  --card-bg: #ffffff;
  --text-color: #333333;
}

// 暗色模式变量
.dark {
  --card-bg: #1a1a1a;
  --text-color: #e8e8e8;
}

// 使用变量
.card {
  background: var(--card-bg);
  color: var(--text-color);
}
```

### 7. 性能优化:避免频繁切换主题

合理控制主题切换频率,避免性能问题。

```typescript
import { debounce } from 'lodash-es'

// 使用防抖避免频繁切换
const debouncedSetTheme = debounce((theme: Partial<ConfigProviderThemeVars>) => {
  setGlobalTheme(theme)
}, 300)

// 用户操作时使用防抖函数
const handleThemeChange = (theme: Partial<ConfigProviderThemeVars>) => {
  debouncedSetTheme(theme)
}
```

## 常见问题

### 1. 主题配置不生效

**问题原因:**
- 没有将 `themeVars` 绑定到 `wd-config-provider`
- `wd-config-provider` 没有包裹目标组件
- 局部配置的作用域不正确

**解决方案:**

```vue
<template>
  <!-- ✅ 正确: 使用 ConfigProvider 包裹 -->
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">按钮</wd-button>
  </wd-config-provider>

  <!-- ❌ 错误: 没有 ConfigProvider 包裹 -->
  <wd-button type="primary">按钮</wd-button>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { themeVars } = useTheme({
  colorTheme: '#FF4757'
})
</script>
```

### 2. 全局主题和局部主题冲突

**问题原因:**
- 不理解配置优先级
- 局部配置覆盖了全局配置

**解决方案:**

```typescript
// 配置优先级: 默认主题 < 全局覆盖 < 局部定制

// 全局配置
setGlobalTheme({
  colorTheme: '#409EFF',  // 全局主题色
})

// 局部定制会覆盖全局
const { themeVars } = useTheme({
  colorTheme: '#FF4757',  // 局部主题色,优先级更高
})

// 如果想在局部使用全局配置,不要传入 localOverrides
const { themeVars: globalTheme } = useTheme()
```

### 3. 主题切换后没有响应

**问题原因:**
- 没有使用响应式的 `themeVars`
- 直接使用了主题配置的值而不是响应式引用

**解决方案:**

```vue
<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { themeVars } = useTheme()

// ✅ 正确: 使用响应式 themeVars
const currentColor = computed(() => themeVars.value.colorTheme)

// ❌ 错误: 直接取值,失去响应性
const wrongColor = themeVars.value.colorTheme
</script>

<template>
  <!-- ✅ 正确: 绑定响应式值 -->
  <wd-config-provider :theme-vars="themeVars">
    <!-- 内容 -->
  </wd-config-provider>

  <!-- ❌ 错误: 绑定非响应式值 -->
  <view :style="{ color: wrongColor }">文本</view>
</template>
```

### 4. 主题持久化失败

**问题原因:**
- 存储配置时未序列化
- 读取配置时未反序列化
- 存储的数据格式错误

**解决方案:**

```typescript
// ✅ 正确: 序列化存储
const saveTheme = (config: Partial<ConfigProviderThemeVars>) => {
  try {
    const jsonStr = JSON.stringify(config)
    uni.setStorageSync('theme_config', jsonStr)
  } catch (error) {
    console.error('保存主题失败:', error)
  }
}

// ✅ 正确: 反序列化读取
const loadTheme = (): Partial<ConfigProviderThemeVars> | null => {
  try {
    const jsonStr = uni.getStorageSync('theme_config')
    if (jsonStr) {
      return JSON.parse(jsonStr)
    }
  } catch (error) {
    console.error('加载主题失败:', error)
  }
  return null
}

// ❌ 错误: 直接存储对象
uni.setStorageSync('theme_config', config)  // 可能导致数据丢失
```

### 5. 跟随系统主题不生效

**问题原因:**
- 平台不支持系统主题检测
- 事件监听未正确设置
- 权限问题

**解决方案:**

```typescript
// H5 环境
// #ifdef H5
const watchSystemTheme = () => {
  // 检查浏览器支持
  if (!window.matchMedia) {
    console.warn('浏览器不支持 matchMedia')
    return
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    const isDark = e.matches
    applyTheme(isDark ? 'dark' : 'light')
  }

  // 初始化
  handleChange(mediaQuery)

  // 监听变化
  mediaQuery.addEventListener('change', handleChange)

  // 清理
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleChange)
  })
}
// #endif

// 小程序环境
// #ifndef H5
// 检查小程序 API 支持
if (uni.getSystemInfoSync) {
  const systemInfo = uni.getSystemInfoSync()
  console.log('系统主题:', systemInfo.theme)
} else {
  console.warn('小程序不支持系统主题检测')
}
// #endif
```

### 6. 主题变量类型提示缺失

**问题原因:**
- TypeScript 类型定义缺失
- 导入类型错误

**解决方案:**

```typescript
// ✅ 正确: 导入正确的类型
import type { ConfigProviderThemeVars } from '@/wd'

const { themeVars } = useTheme({
  colorTheme: '#FF4757',  // 有类型提示
  loadingSize: '50rpx',   // 有类型提示
} as Partial<ConfigProviderThemeVars>)

// ❌ 错误: 没有类型约束
const { themeVars } = useTheme({
  colorTheme: '#FF4757',
  unknownProp: 'value',  // 不会报错,但无效
})
```

### 7. 多个 ConfigProvider 嵌套冲突

**问题原因:**
- 多层 ConfigProvider 嵌套导致配置覆盖
- 不理解 ConfigProvider 的作用域

**解决方案:**

```vue
<template>
  <!-- 全局 ConfigProvider -->
  <wd-config-provider :theme-vars="globalTheme">
    <view class="app">
      <!-- 页面内容使用全局主题 -->
      <wd-button type="primary">全局主题按钮</wd-button>

      <!-- 局部 ConfigProvider (仅影响子组件) -->
      <wd-config-provider :theme-vars="localTheme">
        <wd-button type="primary">局部主题按钮</wd-button>
      </wd-config-provider>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { themeVars: globalTheme } = useTheme({
  colorTheme: '#409EFF',
})

const { themeVars: localTheme } = useTheme({
  colorTheme: '#FF4757',  // 仅影响嵌套的 ConfigProvider 内的组件
})
</script>
```

## 使用示例汇总

### 基础使用

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">按钮</wd-button>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { themeVars } = useTheme()
</script>
```

### 全局主题配置

```typescript
import { useTheme } from '@/composables/useTheme'

const { setGlobalTheme } = useTheme()

setGlobalTheme({
  colorTheme: '#FF4757',
  colorSuccess: '#26DE81',
})
```

### 局部主题定制

```typescript
import { useTheme } from '@/composables/useTheme'

const { themeVars } = useTheme({
  colorTheme: '#9C27B0',
  loadingSize: '60rpx',
})
```

### 主题切换

```typescript
import { useTheme } from '@/composables/useTheme'

const { setGlobalTheme, resetGlobalTheme } = useTheme()

// 切换到暗色主题
setGlobalTheme({ colorTheme: '#177DDC' })

// 重置到默认主题
resetGlobalTheme()
```

### 获取当前主题

```typescript
import { useTheme } from '@/composables/useTheme'

const { getCurrentTheme } = useTheme()

const currentConfig = getCurrentTheme()
console.log('当前主题:', currentConfig)
```
