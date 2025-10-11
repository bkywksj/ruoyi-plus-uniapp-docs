# 主题切换

本项目实现了灵活的主题切换功能,支持亮色和暗色模式的无缝切换,并可扩展自定义主题。

## 🔄 切换机制

### HTML 类名控制

主题切换通过给 `<html>` 元素添加或移除 `dark` 类名实现:

```html
<!-- 亮色主题 (默认) -->
<html>
  <!-- ... -->
</html>

<!-- 暗色主题 -->
<html class="dark">
  <!-- ... -->
</html>
```

### JavaScript 切换

```typescript
// 切换到暗色模式
document.documentElement.classList.add('dark')

// 切换到亮色模式
document.documentElement.classList.remove('dark')

// 切换主题
document.documentElement.classList.toggle('dark')
```

## 🛠️ 实现方案

### 方案一:VueUse composable (推荐)

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <el-switch v-model="isDark" @change="toggleDark" />
</template>
```

**优势**:
- 自动持久化到 localStorage
- 响应式状态管理
- 简洁易用

### 方案二:Pinia Store

```typescript
// stores/theme.ts
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('dark', this.isDark)
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },

    initTheme() {
      const savedTheme = localStorage.getItem('theme')
      this.isDark = savedTheme === 'dark'
      document.documentElement.classList.toggle('dark', this.isDark)
    }
  }
})
```

```vue
<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <el-switch v-model="themeStore.isDark" @change="themeStore.toggleTheme" />
</template>
```

### 方案三:自定义 Composable

```typescript
// composables/useTheme.ts
import { ref, watch } from 'vue'

export function useTheme() {
  const isDark = ref(false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  const setTheme = (dark: boolean) => {
    isDark.value = dark
    updateTheme()
  }

  const updateTheme = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    isDark.value = saved ? saved === 'dark' : prefersDark
    updateTheme()
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
    initTheme
  }
}
```

## 🎯 主题初始化

### 应用启动时初始化

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark)
}

initTheme()
app.mount('#app')
```

### 根组件初始化

```vue
<!-- App.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>
```

## 🎨 主题切换按钮

### Element Plus Switch

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <el-switch
    v-model="isDark"
    inline-prompt
    active-icon="Moon"
    inactive-icon="Sunny"
    @change="toggleDark"
  />
</template>
```

### 图标按钮

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <el-button circle @click="toggleDark">
    <el-icon v-if="isDark" class="i-ep-moon" />
    <el-icon v-else class="i-ep-sunny" />
  </el-button>
</template>
```

### 自定义切换器

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="theme-toggle" @click="toggleDark">
    <transition name="fade" mode="out-in">
      <span v-if="isDark" key="dark">🌙 暗色模式</span>
      <span v-else key="light">☀️ 亮色模式</span>
    </transition>
  </div>
</template>

<style scoped>
.theme-toggle {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: var(--bg-level-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## 🔄 持久化存储

### LocalStorage

```typescript
// 保存主题
localStorage.setItem('theme', isDark ? 'dark' : 'light')

// 读取主题
const theme = localStorage.getItem('theme')
const isDark = theme === 'dark'
```

### 完整持久化方案

```typescript
export function useThemePersist() {
  const THEME_KEY = 'app-theme'

  const saveTheme = (isDark: boolean) => {
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
    } catch (error) {
      console.error('保存主题失败:', error)
    }
  }

  const loadTheme = (): boolean => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      return saved === 'dark'
    } catch (error) {
      console.error('读取主题失败:', error)
      return false
    }
  }

  return {
    saveTheme,
    loadTheme
  }
}
```

## 🌍 响应系统偏好

### 检测系统主题

```typescript
// 检测系统是否使用暗色模式
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

if (prefersDark.matches) {
  // 系统使用暗色模式
  document.documentElement.classList.add('dark')
}
```

### 监听系统主题变化

```typescript
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

darkModeQuery.addEventListener('change', (e) => {
  // 只有在用户未手动设置主题时才跟随系统
  if (!localStorage.getItem('theme')) {
    document.documentElement.classList.toggle('dark', e.matches)
  }
})
```

### 完整的系统主题集成

```typescript
export function useSystemTheme() {
  const { saveTheme, loadTheme } = useThemePersist()

  // 检查用户是否手动设置过主题
  const hasUserPreference = () => {
    return localStorage.getItem('theme') !== null
  }

  // 获取系统主题偏好
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 初始化主题
  const initTheme = () => {
    const isDark = hasUserPreference() ? loadTheme() : getSystemTheme()
    document.documentElement.classList.toggle('dark', isDark)
    return isDark
  }

  // 监听系统主题变化
  const watchSystemTheme = (callback: (isDark: boolean) => void) => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      if (!hasUserPreference()) {
        callback(e.matches)
      }
    }

    query.addEventListener('change', handler)

    return () => query.removeEventListener('change', handler)
  }

  return {
    initTheme,
    watchSystemTheme,
    hasUserPreference
  }
}
```

## 🎬 平滑过渡动画

### CSS 过渡

```scss
// 全局过渡效果
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

// 禁用初始加载时的过渡
.no-transition * {
  transition: none !important;
}
```

### 切换时的过渡处理

```typescript
function toggleTheme() {
  // 临时禁用过渡
  document.documentElement.classList.add('no-transition')

  // 切换主题
  document.documentElement.classList.toggle('dark')

  // 重新启用过渡
  setTimeout(() => {
    document.documentElement.classList.remove('no-transition')
  }, 0)
}
```

## 📊 主题切换事件

### 发布主题变化事件

```typescript
export function useThemeEvents() {
  const emitThemeChange = (isDark: boolean) => {
    window.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: { isDark }
      })
    )
  }

  const onThemeChange = (callback: (isDark: boolean) => void) => {
    const handler = (e: Event) => {
      const { isDark } = (e as CustomEvent).detail
      callback(isDark)
    }

    window.addEventListener('theme-change', handler)

    return () => window.removeEventListener('theme-change', handler)
  }

  return {
    emitThemeChange,
    onThemeChange
  }
}
```

### 监听主题变化

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useThemeEvents } from '@/composables/useThemeEvents'

const { onThemeChange } = useThemeEvents()

let unwatch: (() => void) | null = null

onMounted(() => {
  unwatch = onThemeChange((isDark) => {
    console.log('主题已切换:', isDark ? '暗色' : '亮色')
    // 执行其他操作,如重新加载图表等
  })
})

onUnmounted(() => {
  unwatch?.()
})
</script>
```

## ✅ 最佳实践

1. **提供切换按钮** - 在明显位置放置主题切换控件
2. **持久化设置** - 保存用户的主题偏好
3. **响应系统偏好** - 默认跟随系统主题设置
4. **平滑过渡** - 添加适当的过渡动画
5. **全面测试** - 确保所有组件都支持主题切换
6. **性能优化** - 避免不必要的重渲染

```typescript
// 完整的主题切换 Hook
export function useTheme() {
  const { saveTheme, loadTheme } = useThemePersist()
  const { initTheme, watchSystemTheme } = useSystemTheme()
  const { emitThemeChange } = useThemeEvents()

  const isDark = ref(initTheme())

  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    saveTheme(isDark.value)
    emitThemeChange(isDark.value)
  }

  watchSystemTheme((systemIsDark) => {
    isDark.value = systemIsDark
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  return {
    isDark,
    toggleTheme
  }
}
```

通过这套完整的主题切换机制,用户可以自由选择适合自己的视觉模式,提升使用体验。
