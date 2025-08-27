# 设置面板(Settings)

## 简介

设置面板是后台管理系统的个性化配置中心，提供主题风格、系统布局、颜色方案等全方位的界面定制功能。该组件以右侧滑出的抽屉形式呈现，支持实时预览、配置持久化和一键重置，让用户能够根据个人喜好和使用习惯定制专属的工作界面。

## 组件架构

```
Settings/
└── Settings.vue           # 设置面板主组件
```

## 组件详解

### Settings.vue - 设置抽屉面板

集成了完整主题配置和布局选项的抽屉式设置面板。

#### 组件结构

```vue
<template>
  <!-- 设置抽屉：右侧滑出的配置面板 -->
  <el-drawer v-model="isDrawerVisible" :with-header="false" direction="rtl" size="300px" close-on-click-modal>
    <!-- 主题风格设置区域 -->
    <h5 class="mb-3 text-rgba-0-0-0-85 leading-5.5">主题风格设置</h5>

    <!-- 主题选择器：深色/浅色主题切换 -->
    <div class="flex justify-start items-center mt-2.5 mb-5">
      <!-- 深色主题选项 -->
      <div class="relative mr-4 rounded-0.5 cursor-pointer group" @click="onSideThemeSelect(SideTheme.Dark)">
        <img src="@/assets/images/dark.svg" alt="dark" class="w-12 h-12 transition-all duration-200" />
        <!-- 选中状态指示器 -->
        <div v-if="currentSideTheme === 'theme-dark'" class="absolute top-0 right-0 w-full h-full">
          <!-- 选中图标 -->
        </div>
      </div>

      <!-- 浅色主题选项 -->
      <div class="relative mr-4 rounded-0.5 cursor-pointer group" @click="onSideThemeSelect(SideTheme.Light)">
        <img src="@/assets/images/light.svg" alt="light" class="w-12 h-12 transition-all duration-200" />
        <!-- 选中状态指示器 -->
      </div>
    </div>

    <!-- 主题颜色选择器 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>主题颜色</span>
      <el-color-picker v-model="currentThemeColor" :predefine="PREDEFINED_THEME_COLORS" @change="onThemeColorChange" />
    </div>

    <!-- 深色模式开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>深色模式</span>
      <el-switch v-model="themeStore.dark" @change="onDarkModeToggle" />
    </div>

    <el-divider />

    <!-- 系统布局配置区域 -->
    <h5 class="mb-3 text-rgba-0-0-0-85 leading-5.5">系统布局配置</h5>

    <!-- 布局配置开关组 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>开启 TopNav</span>
      <el-switch v-model="themeStore.topNav" @change="onTopNavToggle" />
    </div>

    <!-- 标签视图开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>开启 Tags-Views</span>
      <el-switch v-model="themeStore.tagsView" />
    </div>

    <div class="py-3 text-14px flex justify-between items-center">
      <span>固定 Header</span>
      <el-switch v-model="themeStore.fixedHeader" />
    </div>

    <!-- 显示Logo开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>显示 Logo</span>
      <el-switch v-model="themeStore.sidebarLogo" />
    </div>

    <!-- 动态标题开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>动态标题</span>
      <el-switch v-model="themeStore.dynamicTitle" />
    </div>

    <el-divider />

    <!-- 底部操作按钮组 -->
    <div class="flex">
      <el-button type="primary" plain icon="DocumentAdd" class="w-full" @click="onSaveSettings">
        保存配置
      </el-button>
      <el-button plain icon="Refresh" class="w-full" @click="onResetSettings">
        重置配置
      </el-button>
    </div>
  </el-drawer>
</template>
```

## 核心功能实现

### 主题管理系统

**预定义主题色配置**
```typescript
/** 预定义主题色配置 */
const PREDEFINED_THEME_COLORS = [
  '#409EFF', // Element Plus 默认蓝色
  '#ff4500', // 红橙色 - 活力橙
  '#ff8c00', // 深橙色 - 温暖橙
  '#ffd700', // 金黄色 - 富贵金
  '#90ee90', // 淡绿色 - 清新绿
  '#00ced1', // 青色 - 科技蓝
  '#1e90ff', // 道奇蓝 - 天空蓝
  '#c71585'  // 中紫红色 - 优雅紫
]
```

**侧边栏主题选择**
```typescript
/**
 * 处理侧边栏主题选择
 * @param themeType - 选择的主题类型
 */
const onSideThemeSelect = (themeType: SideTheme) => {
  // 记录用户的选择偏好
  userSelectedSideTheme.value = themeType

  // 深色模式下不允许切换到浅色侧边栏
  if (themeStore.dark && themeType === SideTheme.Light) {
    return
  }

  // 应用选择的主题
  themeStore.sideTheme = themeType
}
```

**主题颜色变更**
```typescript
/**
 * 处理主题颜色变更
 * @param color - 新的主题颜色
 */
const onThemeColorChange = (color: string) => {
  setTheme(color)
}
```

**深色模式切换**
```typescript
/**
 * 处理深色模式切换
 * @param isDark - 是否开启深色模式
 */
const onDarkModeToggle = (isDark: boolean) => {
  themeStore.toggleDark(isDark)
}
```

### 布局配置管理

**顶部导航切换处理**
```typescript
/**
 * 处理顶部导航切换
 * @param isEnabled - 是否启用顶部导航
 */
const onTopNavToggle = (isEnabled: boolean) => {
  if (!isEnabled) {
    // 关闭顶部导航时，确保侧边栏可见并重置路由
    stateStore.toggleSideBarHide(false)
    permissionStore.setSidebarRouters(permissionStore.defaultRoutes as any)
  }
}
```

**布局选项响应式处理**
```typescript
// 组件状态
const isDrawerVisible = ref(false)
const userSelectedSideTheme = ref(themeStore.sideTheme)

// 计算属性
const currentSideTheme = computed(() => themeStore.sideTheme)
const currentThemeColor = computed(() => themeStore.theme)

// Store 集成
const stateStore = useStateStore()
const themeStore = useThemeStore()
const permissionStore = usePermissionStore()
const { currentTheme: currentThemeColor, setTheme } = useTheme()
```

### 配置持久化

**保存配置到本地存储**
```typescript
/**
 * 保存当前所有配置到本地存储
 */
const onSaveSettings = async () => {
  showLoadingMessage('正在保存到本地，请稍候...')

  try {
    const currentSettings = {
      topNav: themeStore.topNav,
      tagsView: themeStore.tagsView,
      fixedHeader: themeStore.fixedHeader,
      sidebarLogo: themeStore.sidebarLogo,
      dynamicTitle: themeStore.dynamicTitle,
      sideTheme: themeStore.sideTheme,
      theme: currentThemeColor.value,
      dark: themeStore.dark
    }

    themeStore.saveSettings(currentSettings)

    // 模拟保存时间，提供用户反馈
    await delay(1000)
  } finally {
    hideLoading()
  }
}
```

**重置所有配置**
```typescript
/**
 * 重置所有配置到默认状态
 */
const onResetSettings = async () => {
  showLoadingMessage('正在清除设置缓存并刷新，请稍候...')

  try {
    themeStore.saveSettings()
    await delay(1000)

    // 刷新页面以应用默认配置
    window.location.reload()
  } catch (error) {
    console.error('重置配置失败:', error)
    hideLoading()
  }
}
```

### 深色模式智能适配

**自动侧边栏主题调整**
```typescript
/**
 * 监听深色模式变化，自动调整侧边栏主题
 */
watch(
  () => themeStore.dark,
  (isDarkMode) => {
    if (isDarkMode) {
      // 开启深色模式：强制使用深色侧边栏
      themeStore.sideTheme = SideTheme.Dark
    } else {
      // 关闭深色模式：恢复用户选择的主题
      themeStore.sideTheme = userSelectedSideTheme.value
    }
  },
  { immediate: true }
)
```

## Store 集成

### ThemeStore 状态管理

```typescript
// ThemeStore 中的主要状态
interface ThemeState {
  // 主题相关
  theme: string           // 主题颜色
  dark: boolean          // 深色模式开关
  sideTheme: SideTheme   // 侧边栏主题
  
  // 布局相关
  topNav: boolean        // 顶部导航开关
  tagsView: boolean      // 标签视图开关
  fixedHeader: boolean   // 固定头部开关
  sidebarLogo: boolean   // 侧边栏Logo开关
  dynamicTitle: boolean  // 动态标题开关
}
```

### 配置项详解

| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `theme` | string | '#409EFF' | 主题颜色，影响整体色调 |
| `dark` | boolean | false | 深色模式开关 |
| `sideTheme` | SideTheme | Light | 侧边栏主题（深色/浅色） |
| `topNav` | boolean | false | 是否启用顶部导航模式 |
| `tagsView` | boolean | true | 是否显示标签视图 |
| `fixedHeader` | boolean | false | 是否固定顶部导航栏 |
| `sidebarLogo` | boolean | true | 是否显示侧边栏Logo |
| `dynamicTitle` | boolean | false | 是否启用动态页面标题 |

## 用户体验设计

### 抽屉式交互

```typescript
// 抽屉控制方法
const openSettingsDrawer = () => {
  isDrawerVisible.value = true
}

const closeSettingsDrawer = () => {
  isDrawerVisible.value = false
}

// 组件对外接口
defineExpose({
  openSetting: openSettingsDrawer,
  closeSetting: closeSettingsDrawer,
  isVisible: readonly(isDrawerVisible)
})
```

### 实时预览效果

```typescript
// 主题色实时预览
watch(
  () => currentThemeColor.value,
  (newColor) => {
    // 立即应用新颜色
    document.documentElement.style.setProperty('--el-color-primary', newColor)
  }
)
```

## 配置持久化策略

### 本地存储管理

```typescript
// 配置存储键名
const THEME_CONFIG_KEY = 'theme-config'

// 保存配置到localStorage
const saveToLocal = (config: ThemeConfig) => {
  try {
    localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(config))
    return true
  } catch (error) {
    console.error('保存主题配置失败:', error)
    return false
  }
}

// 从localStorage读取配置
const loadFromLocal = (): ThemeConfig | null => {
  try {
    const saved = localStorage.getItem(THEME_CONFIG_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('读取主题配置失败:', error)
    return null
  }
}
```

## 最佳实践

### 推荐做法

1. **合理的默认配置**
   ```typescript
   const DEFAULT_THEME_CONFIG = {
     theme: '#409EFF',
     dark: false,
     sideTheme: SideTheme.Light,
     topNav: false,
     tagsView: true
   }
   ```

2. **用户偏好记忆**
   ```typescript
   // 记住用户的主题选择偏好
   const userSelectedSideTheme = ref(themeStore.sideTheme)
   
   watch(() => themeStore.dark, (isDark) => {
     if (!isDark) {
       // 退出深色模式时恢复用户偏好
       themeStore.sideTheme = userSelectedSideTheme.value
     }
   })
   ```

3. **优雅的加载反馈**
   ```typescript
   const handleSave = async () => {
     showLoading('正在保存配置...')
     try {
       await saveConfig()
       showSuccess('配置保存成功')
     } finally {
       hideLoading()
     }
   }
   ```

### 避免做法

1. **频繁的配置保存**
   ```typescript
   // ❌ 每次变化都保存
   watch(() => themeStore.theme, saveConfig)
   
   // ✅ 使用防抖保存
   watch(() => themeStore.theme, debounce(saveConfig, 1000))
   ```

2. **缺少用户反馈**
   ```typescript
   // ❌ 静默操作
   const resetConfig = () => {
     themeStore.$reset()
     location.reload()
   }
   
   // ✅ 提供操作反馈
   const resetConfig = async () => {
     await showConfirm('确定要重置所有配置吗？')
     showLoading('正在重置...')
     themeStore.$reset()
     location.reload()
   }
   ```

## 扩展开发

### 添加新配置项

```typescript
// 1. 在ThemeStore中添加新状态
const customFeature = ref(false)

// 2. 在Settings组件中添加控件
const onCustomFeatureToggle = (enabled: boolean) => {
  themeStore.customFeature = enabled
}

// 3. 在保存配置时包含新项
const currentSettings = {
  // ... 其他配置
  customFeature: themeStore.customFeature
}
```

### 自定义主题预设

```typescript
// 定义主题预设
const THEME_PRESETS = [
  {
    name: '经典蓝',
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C'
    }
  },
  {
    name: '优雅紫',
    colors: {
      primary: '#722ED1',
      success: '#52C41A',
      warning: '#FAAD14'
    }
  }
]
```

## 总结

设置面板作为系统的个性化配置中心，通过直观的界面和丰富的选项，让用户能够轻松定制符合个人喜好的工作环境。组件采用抽屉式设计，支持实时预览、配置持久化等特性，为用户提供了优秀的定制体验。合理的默认配置、完善的错误处理和优雅的用户反馈，使得主题系统既强大又易用。
