# 设置面板(Settings)

## 介绍

设置面板是后台管理系统的个性化配置中心，提供主题风格、菜单布局、颜色方案、水印配置等全方位的界面定制功能。该组件以右侧滑出的抽屉形式呈现，采用可视化的图片选择器设计，支持实时预览、配置持久化和一键重置，让用户能够根据个人喜好和使用习惯定制专属的工作界面。

**核心特性:**

- **可视化配置** - 使用图片预览方式直观展示各种布局和主题效果
- **三种菜单布局** - 支持垂直(Vertical)、混合(Mixed)、水平(Horizontal)三种菜单布局模式
- **主题风格切换** - 浅色/深色主题一键切换，支持 View Transition API 圆形扩散动画
- **菜单风格定制** - 侧边栏支持深色和浅色两种独立风格
- **预设主题色** - 提供七种预定义主题色，圆形色块直观选择
- **水印功能** - 支持自定义水印内容，默认显示当前用户名
- **自动持久化** - 所有配置自动保存到 localStorage，刷新页面保持设置
- **智能联动** - 深色模式与菜单风格、布局模式与侧边栏状态智能联动

## 组件架构

```
Settings/
├── Settings.vue              # 设置抽屉面板主组件
└── (Navbar/tools/)
    └── LayoutSetting.vue     # 导航栏设置触发按钮

Composables/
├── useLayout.ts              # 统一布局状态管理
└── useTheme.ts               # 主题颜色管理

Utils/
└── themeAnimation.ts         # 主题切换动画工具

Config/
└── systemConfig.ts           # 系统配置常量
```

## 组件详解

### Settings.vue - 设置抽屉面板

设置抽屉面板是整个配置系统的核心组件，采用 Element Plus 的 `el-drawer` 实现右侧滑出效果，内部按功能模块划分为多个配置区域。

#### 完整组件源码

```vue
<template>
  <!-- 设置抽屉：右侧滑出的配置面板 -->
  <el-drawer
    v-model="isDrawerVisible"
    :with-header="true"
    direction="rtl"
    size="300px"
    header-class="mb-0!"
    modal-class="bg-transparent!"
    close-on-click-modal
  >
    <!-- 自定义头部：重置配置按钮 -->
    <template #header="{ titleId }">
      <div>
        <el-button link @click="handleResetSettings">
          <el-icon :id="titleId">
            <Refresh class="color-[--el-color-primary]" />
          </el-icon>
          重置配置
        </el-button>
      </div>
    </template>

    <!-- 主题风格区域 -->
    <el-divider content-position="center">主题风格</el-divider>
    <div class="grid grid-cols-2 gap-x-1 text-center">
      <div>
        <img
          src="@/assets/images/settings/light.png"
          alt="light"
          class="w-30 h-18 rounded-[--radius-md] cursor-pointer"
          :class="{ 'border-3px! border-[--el-color-primary]! border-solid!': !layout.dark.value }"
          @click="handleDarkModeToggle($event, false)"
        />
        <div>浅色</div>
      </div>
      <div>
        <img
          src="@/assets/images/settings/dark.png"
          alt="dark"
          class="w-30 h-18 rounded-[--radius-md] cursor-pointer"
          :class="{ 'border-3px! border-[--el-color-primary]! border-solid!': layout.dark.value }"
          @click="handleDarkModeToggle($event, true)"
        />
        <div>深色</div>
      </div>
    </div>

    <!-- 菜单布局区域 -->
    <el-divider content-position="center">菜单布局</el-divider>
    <div class="grid grid-cols-3 gap-x-1 text-center">
      <div>
        <img
          src="@/assets/images/settings/menu-layout-vertical.png"
          alt="vertical"
          class="w-20 h-12 rounded-[--radius-md] cursor-pointer"
          :class="{
            'border-3px! border-[--el-color-primary]! border-solid!':
              layout.menuLayout.value === MenuLayoutMode.Vertical
          }"
          @click="handleMenuLayoutChange(MenuLayoutMode.Vertical)"
        />
        <div class="text-xs mt-1">垂直</div>
      </div>
      <div>
        <img
          src="@/assets/images/settings/menu-layout-horizontal.png"
          alt="horizontal"
          class="w-20 h-12 rounded-[--radius-md] cursor-pointer"
          :class="{
            'border-3px! border-[--el-color-primary]! border-solid!':
              layout.menuLayout.value === MenuLayoutMode.Horizontal
          }"
          @click="handleMenuLayoutChange(MenuLayoutMode.Horizontal)"
        />
        <div class="text-xs mt-1">水平</div>
      </div>
      <div>
        <img
          src="@/assets/images/settings/menu-layout-mixed.png"
          alt="mixed"
          class="w-20 h-12 rounded-[--radius-md] cursor-pointer"
          :class="{
            'border-3px! border-[--el-color-primary]! border-solid!':
              layout.menuLayout.value === MenuLayoutMode.Mixed
          }"
          @click="handleMenuLayoutChange(MenuLayoutMode.Mixed)"
        />
        <div class="text-xs mt-1">混合</div>
      </div>
    </div>

    <!-- 菜单风格区域 -->
    <el-divider content-position="center">菜单风格</el-divider>
    <div class="grid grid-cols-2 gap-x-1 text-center">
      <div>
        <img
          src="@/assets/images/settings/menu-sidebar-light.png"
          alt="light"
          class="w-30 h-18 rounded-[--radius-md]"
          :class="{
            'border-3px! border-[--el-color-primary]! border-solid!':
              layout.sideTheme.value === SideTheme.Light,
            'opacity-50 cursor-not-allowed': isMenuStyleDisabled,
            'cursor-pointer': !isMenuStyleDisabled
          }"
          @click="!isMenuStyleDisabled && handleSideThemeSelect(SideTheme.Light)"
        />
        <div :class="{ 'opacity-50': isMenuStyleDisabled }">浅色</div>
      </div>
      <div>
        <img
          src="@/assets/images/settings/menu-sidebar-dark.png"
          alt="dark"
          class="w-30 h-18 rounded-[--radius-md]"
          :class="{
            'border-3px! border-[--el-color-primary]! border-solid!':
              layout.sideTheme.value === SideTheme.Dark,
            'opacity-50 cursor-not-allowed': isMenuStyleDisabled,
            'cursor-pointer': !isMenuStyleDisabled
          }"
          @click="!isMenuStyleDisabled && handleSideThemeSelect(SideTheme.Dark)"
        />
        <div :class="{ 'opacity-50': isMenuStyleDisabled }">深色</div>
      </div>
    </div>

    <!-- 系统主题颜色区域 -->
    <el-divider content-position="center">系统主题颜色</el-divider>
    <div class="flex justify-between items-center">
      <div
        v-for="(item, index) in PREDEFINED_THEME_COLORS"
        :key="index"
        class="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110"
        :style="{ backgroundColor: item }"
        :class="{
          'ring-2 ring-[--el-color-primary] ring-offset-1': currentTheme === item
        }"
        @click="handleThemeColorChange(item)"
      ></div>
    </div>

    <!-- 基础配置区域 -->
    <el-divider content-position="center">基础配置</el-divider>

    <!-- 标签视图开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>开启 Tags-Views</span>
      <span class="float-right -mt-0.75 mr-2">
        <el-switch v-model="layout.tagsView.value" />
      </span>
    </div>

    <!-- 固定头部开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>固定 Header</span>
      <span class="float-right -mt-0.75 mr-2">
        <el-switch v-model="layout.fixedHeader.value" />
      </span>
    </div>

    <!-- 显示Logo开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>显示 Logo</span>
      <span class="float-right -mt-0.75 mr-2">
        <el-switch v-model="layout.sidebarLogo.value" />
      </span>
    </div>

    <!-- 动态标题开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>动态标题</span>
      <span class="float-right -mt-0.75 mr-2">
        <el-switch v-model="layout.dynamicTitle.value" />
      </span>
    </div>

    <!-- 选择器显示值开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>选择器显示选项值</span>
      <span class="float-right -mt-0.75 mr-2">
        <el-switch v-model="showSelectValueSwitch" />
      </span>
    </div>

    <!-- 水印配置区域 -->
    <el-divider content-position="center">水印配置</el-divider>

    <!-- 水印开关 -->
    <div class="py-3 text-14px flex justify-between items-center">
      <span>显示水印</span>
      <span class="float-right -mt-0.75 mr-2">
        <el-switch
          v-model="layout.watermark.value"
          :disabled="isWatermarkSwitchDisabled"
        />
      </span>
    </div>

    <!-- 水印内容输入 -->
    <div v-if="layout.watermark.value" class="py-3 text-14px">
      <div class="mb-2">水印内容</div>
      <el-input
        v-model="layout.watermarkContent.value"
        placeholder="请输入水印内容（留空则显示用户名）"
        clearable
        :disabled="isWatermarkContentDisabled"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="Settings">
import { SideTheme, MenuLayoutMode, PREDEFINED_THEME_COLORS } from '@/systemConfig'
import { showLoading, hideLoading } from '@/utils/modal'
import { Refresh } from '@element-plus/icons-vue'
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

// 状态管理
const layout = useLayout()
const permissionStore = usePermissionStore()
const { currentTheme, setTheme, addAlphaToHex } = useTheme()

// 组件状态
const isDrawerVisible = ref(false)
const userSelectedSideTheme = ref(layout.sideTheme.value)
const currentSideTheme = layout.sideTheme

// 计算属性
const isMenuStyleDisabled = computed(() => {
  return layout.menuLayout.value === MenuLayoutMode.Horizontal
})

// ... 更多实现代码
</script>
```

#### 抽屉配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `direction` | `'rtl'` | 从右侧滑出 |
| `size` | `'300px'` | 抽屉宽度 |
| `with-header` | `true` | 显示自定义头部 |
| `header-class` | `'mb-0!'` | 移除头部下边距 |
| `modal-class` | `'bg-transparent!'` | 遮罩层透明 |
| `close-on-click-modal` | `true` | 点击遮罩关闭 |

### LayoutSetting.vue - 触发按钮

导航栏中的设置按钮，带有旋转动画效果的图标。

```vue
<template>
  <el-tooltip :content="t('navbar.layoutSetting')" effect="dark" placement="bottom">
    <div class="flex-center h-full px-1">
      <div
        class="navbar-tool-item flex-center w-9 h-9 rounded-2 cursor-pointer"
        @click="openLayoutSetting"
      >
        <Icon code="settings" size="md" animate="rotate180" />
      </div>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts" name="LayoutSetting">
const { t } = useI18n()

const emit = defineEmits<{
  'setLayout': []
}>()

const openLayoutSetting = () => {
  emit('setLayout')
}
</script>
```

**交互特性:**

- **悬停提示** - 使用 `el-tooltip` 显示国际化的"布局设置"文字
- **图标动画** - 使用自定义 Icon 组件，配置 `animate="rotate180"` 悬停旋转效果
- **事件触发** - 点击时触发 `setLayout` 事件，由父组件(Navbar)捕获后打开设置抽屉

## 主题管理系统

### 主题风格(浅色/深色)

系统支持全局浅色和深色两种主题风格，使用 VueUse 的 `useDark` 管理暗黑模式状态。

#### 深色模式切换动画

采用 View Transition API 实现从点击位置扩散的圆形切换动画效果：

```typescript
// themeAnimation.ts
import { useLayout } from '@/composables/useLayout'

/**
 * 主题切换动画
 * @param event 鼠标点击事件
 * @param isDark 当前是否为暗黑模式
 */
export const toggleThemeWithAnimation = (event: MouseEvent, isDark: boolean) => {
  const layout = useLayout()

  // 获取点击位置
  const x = event.clientX
  const y = event.clientY

  // 计算从点击位置到视窗最远角的距离(最大圆半径)
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // 设置 CSS 变量,用于圆形动画的中心点和半径
  const root = document.documentElement
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${endRadius}px`)

  // 检查浏览器是否支持 View Transition API
  if (document.startViewTransition) {
    // 使用 View Transition API 执行动画
    document.startViewTransition(() => {
      layout.toggleDark(!isDark)
    })
  } else {
    // 不支持则直接切换,无动画
    layout.toggleDark(!isDark)
  }
}
```

**动画原理:**

1. 获取用户点击的坐标位置 `(x, y)`
2. 计算从点击点到视窗四角的最大距离作为圆半径
3. 设置 CSS 变量 `--theme-x`、`--theme-y`、`--theme-r`
4. 使用 `document.startViewTransition` 触发视图过渡
5. CSS 使用 `clip-path: circle()` 实现圆形扩散效果

#### 深色模式状态同步

```typescript
// useLayout.ts 中的暗黑模式处理
const isDark = useDark({
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
})

// 初始化时同步暗黑模式状态
isDark.value = state.config.dark

// 监听配置中的暗黑模式变化，同步到 VueUse
watch(dark, (newValue) => {
  isDark.value = newValue
})

// 监听 VueUse 的暗黑模式变化，同步到配置
watch(isDark, (newValue) => {
  dark.value = newValue
})
```

### 侧边栏主题(菜单风格)

侧边栏支持独立于全局主题的浅色/深色风格：

```typescript
/** 侧边栏主题枚举 */
export enum SideTheme {
  /** 深色主题 */
  Dark = 'theme-dark',
  /** 浅色主题 */
  Light = 'theme-light'
}
```

**智能联动逻辑:**

```typescript
// Settings.vue 中的主题联动
const handleSideThemeSelect = (themeType: SideTheme) => {
  // 记录用户的选择偏好
  userSelectedSideTheme.value = themeType

  // 深色模式下不允许切换到浅色侧边栏
  if (layout.dark.value && themeType === SideTheme.Light) {
    return
  }

  // 应用选择的主题
  layout.sideTheme.value = themeType
}

// 监听深色模式变化，自动调整侧边栏主题
watch(
  () => layout.dark.value,
  (isDarkMode) => {
    if (isDarkMode) {
      // 开启深色模式：强制使用深色侧边栏
      layout.sideTheme.value = SideTheme.Dark
    } else {
      // 关闭深色模式：恢复用户选择的主题
      layout.sideTheme.value = userSelectedSideTheme.value
    }
  },
  { immediate: true }
)
```

**禁用条件:**

水平布局模式下，侧边栏被隐藏，菜单风格选择器会被禁用：

```typescript
const isMenuStyleDisabled = computed(() => {
  return layout.menuLayout.value === MenuLayoutMode.Horizontal
})
```

### 主题颜色选择

系统提供7种预定义主题色：

```typescript
// systemConfig.ts
export const PREDEFINED_THEME_COLORS = [
  '#5D87FF', // 默认蓝色
  '#B48DF3', // 紫色
  '#1D84FF', // 深蓝
  '#60C041', // 绿色
  '#38C0FC', // 青色
  '#F9901F', // 橙色
  '#FF80C8'  // 粉色
] as const
```

#### 主题色应用机制

```typescript
// useTheme.ts
export const useTheme = () => {
  const layout = useLayout()
  const currentTheme: Ref<string> = layout.theme

  /**
   * 生成亮色变体
   * @param color 基础颜色
   * @param level 亮度级别 (0-1)
   */
  const getLightColor = (color: string, level: number): string => {
    return lightenColor(color, level)
  }

  /**
   * 生成暗色变体
   * @param color 基础颜色
   * @param level 暗度级别 (0-1)
   */
  const getDarkColor = (color: string, level: number): string => {
    return darkenColor(color, level)
  }

  /**
   * 应用主题颜色到CSS变量
   * @param color 主题颜色
   */
  const applyThemeColors = (color: string): void => {
    // 设置主色
    document.documentElement.style.setProperty('--el-color-primary', color)

    // 设置9个亮色变体
    for (let i = 1; i <= 9; i++) {
      document.documentElement.style.setProperty(
        `--el-color-primary-light-${i}`,
        getLightColor(color, i / 10)
      )
    }

    // 设置9个暗色变体
    for (let i = 1; i <= 9; i++) {
      document.documentElement.style.setProperty(
        `--el-color-primary-dark-${i}`,
        getDarkColor(color, i / 10)
      )
    }

    currentTheme.value = color
  }

  /**
   * 设置主题色
   * @param color 十六进制颜色字符串
   */
  const setTheme = (color: string): void => {
    layout.theme.value = color
    applyThemeColors(color)
  }

  // 初始化主题
  watchEffect(() => {
    applyThemeColors(layout.theme.value)
  })

  return {
    currentTheme,
    setTheme,
    resetTheme,
    getLightColor,
    getDarkColor,
    generateThemeColors,
    addAlphaToHex
  }
}
```

#### 菜单激活色联动

主题色变化时自动更新菜单激活状态的颜色：

```typescript
// Settings.vue 中的颜色联动
watch(
  [() => layout.sideTheme.value, () => layout.theme.value],
  ([newSideTheme, newTheme]) => {
    // 设置自定义活跃背景颜色、文字
    document.documentElement.style.setProperty(
      '--custom-active-bg-color',
      addAlphaToHex(newTheme, 0.1)
    )
    document.documentElement.style.setProperty(
      '--custom-active-text-color',
      newTheme
    )

    // 菜单激活颜色设置
    if (newSideTheme === SideTheme.Light) {
      document.documentElement.style.setProperty(
        '--el-menu-active-bg-color',
        addAlphaToHex(newTheme, 0.1)
      )
      document.documentElement.style.setProperty(
        '--el-menu-active-text-color',
        newTheme
      )
    } else if (newSideTheme === SideTheme.Dark) {
      document.documentElement.style.setProperty(
        '--el-menu-active-bg-color',
        newTheme
      )
      document.documentElement.style.setProperty(
        '--el-menu-active-text-color',
        '#fff'
      )
    }
  },
  { immediate: true }
)
```

## 菜单布局系统

### 三种布局模式

```typescript
/** 菜单布局模式枚举 */
export enum MenuLayoutMode {
  /** 垂直布局（左侧边栏） */
  Vertical = 'vertical',
  /** 混合布局（顶部+左侧） */
  Mixed = 'mixed',
  /** 水平布局（纯顶部） */
  Horizontal = 'horizontal'
}
```

#### 布局模式对比

| 特性 | 垂直布局 | 混合布局 | 水平布局 |
|------|---------|---------|---------|
| 侧边栏显示 | ✅ 显示 | ✅ 显示 | ❌ 隐藏 |
| 顶部导航 | ❌ 关闭 | ✅ 开启 | ✅ 开启 |
| 菜单层级 | 完整层级 | 一级在顶部，子级在侧边 | 完整层级在顶部 |
| 菜单风格可选 | ✅ 可选 | ✅ 可选 | ❌ 禁用 |
| 适用场景 | 菜单项较多 | 兼顾两者 | 菜单项较少 |

### 布局切换处理

```typescript
/**
 * 处理菜单布局模式切换
 * @param mode 选择的布局模式
 */
const handleMenuLayoutChange = (mode: MenuLayoutMode) => {
  // 更新菜单布局模式
  layout.menuLayout.value = mode

  // 根据布局模式设置相应的状态
  switch (mode) {
    case MenuLayoutMode.Vertical:
      // 垂直布局：关闭顶部导航，显示侧边栏
      layout.topNav.value = false
      layout.toggleSideBarHide(false)
      // 恢复完整的侧边栏路由
      permissionStore.setSidebarRouters(permissionStore.defaultRoutes as any)
      break

    case MenuLayoutMode.Mixed:
      // 混合布局：开启顶部导航，显示侧边栏
      layout.topNav.value = true
      layout.toggleSideBarHide(false)
      // 侧边栏将根据选中的顶级菜单动态显示子菜单
      break

    case MenuLayoutMode.Horizontal:
      // 水平布局：开启顶部导航，隐藏侧边栏
      layout.topNav.value = true
      layout.toggleSideBarHide(true)
      // 确保侧边栏路由数据包含完整的菜单结构
      const fullRoutes = permissionStore.getDefaultRoutes()
      if (fullRoutes && fullRoutes.length > 0) {
        permissionStore.setSidebarRouters(fullRoutes)
      }
      break
  }

  // 在深色模式下切换菜单布局时，强制触发侧边栏主题更新
  if (layout.dark.value) {
    nextTick(() => {
      const currentTheme = layout.sideTheme.value
      layout.sideTheme.value = currentTheme === SideTheme.Dark
        ? SideTheme.Light
        : SideTheme.Dark
      nextTick(() => {
        layout.sideTheme.value = SideTheme.Dark
      })
    })
  }
}
```

## useLayout 状态管理

### 架构设计

`useLayout` 是一个单例模式的 Composable，统一管理所有布局相关状态。

```typescript
// 全局布局状态实例
let layoutStateInstance: ReturnType<typeof createLayoutState> | null = null

/**
 * 统一布局状态管理 Hook
 */
export const useLayout = () => {
  if (!layoutStateInstance) {
    layoutStateInstance = createLayoutState()
  }
  return layoutStateInstance
}
```

### 状态结构

```typescript
interface LayoutState {
  /** 当前设备类型 */
  device: DeviceType
  /** 侧边栏状态配置 */
  sidebar: SidebarState
  /** 当前页面标题 */
  title: string
  /** 是否显示设置面板 */
  showSettings: boolean
  /** 是否启用页面切换动画 */
  animationEnable: boolean
  /** 标签视图状态 */
  tagsView: TagsViewState
  /** 布局配置 */
  config: LayoutSetting
}

interface LayoutSetting {
  // 标题配置
  title: string

  // 布局相关
  topNav: boolean
  menuLayout: MenuLayoutMode
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
  layout: string

  // 外观主题
  theme: string
  sideTheme: SideTheme
  dark: boolean

  // 功能配置
  showSettings: boolean
  animationEnable: boolean

  // 用户偏好
  sidebarStatus: string
  size: ElSize
  language: LanguageCode

  // 选择器配置
  showSelectValue?: boolean

  // 水印配置
  watermark?: boolean
  watermarkContent?: string
}
```

### 配置持久化

配置自动保存到 localStorage：

```typescript
// 本地存储键名
const CACHE_KEY = 'layout-config'

// 从本地缓存加载配置
const cachedConfig = localCache.getJSON<LayoutSetting>(CACHE_KEY) || { ...DEFAULT_CONFIG }

// 监听配置变化并持久化
watch(
  () => state.config,
  (newConfig) => {
    localCache.setJSON(CACHE_KEY, newConfig)
    // 同步更新侧边栏状态
    state.sidebar.opened = newConfig.sidebarStatus ? !!+newConfig.sidebarStatus : true
  },
  { deep: true }
)
```

### 响应式设备检测

```typescript
const { width } = useWindowSize()
const BREAKPOINT = 992 // 移动端断点

watch(width, () => {
  const isMobile = width.value - 1 < BREAKPOINT

  if (state.device === 'mobile') {
    closeSideBar()
  }

  if (isMobile) {
    toggleDevice('mobile')
    closeSideBar()
  } else {
    toggleDevice('pc')
    openSideBar()
  }
})
```

## 配置项详解

### 基础配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `tagsView` | `boolean` | `true` | 是否显示多标签页导航 |
| `fixedHeader` | `boolean` | `true` | 是否固定顶部导航栏 |
| `sidebarLogo` | `boolean` | `true` | 是否显示侧边栏Logo |
| `dynamicTitle` | `boolean` | `true` | 是否启用动态页面标题 |
| `showSelectValue` | `boolean \| undefined` | `undefined` | 选择器是否显示选项值 |

### 主题配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `dark` | `boolean` | `false` | 是否启用深色模式 |
| `theme` | `string` | `'#5d87ff'` | 主题颜色 |
| `sideTheme` | `SideTheme` | `'theme-dark'` | 侧边栏主题 |

### 布局配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `menuLayout` | `MenuLayoutMode` | `'vertical'` | 菜单布局模式 |
| `topNav` | `boolean` | `false` | 是否显示顶部导航 |
| `sidebarStatus` | `string` | `'1'` | 侧边栏状态('1'打开/'0'关闭) |

### 水印配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `watermark` | `boolean` | `false` | 是否显示水印 |
| `watermarkContent` | `string` | `''` | 水印内容(空则显示用户名) |

### 选择器显示值逻辑

选择器显示值开关有特殊的默认值逻辑：

```typescript
const showSelectValueSwitch = computed({
  get() {
    const value = layout.showSelectValue.value
    // 如果有明确设置，返回该值
    if (value !== undefined) {
      return value
    }
    // 否则根据角色判断（超管默认为 true）
    const userStore = useUserStore()
    const userRoles = userStore.roles
    if (userRoles && userRoles.length > 0) {
      return userRoles.includes('superadmin') || userRoles.includes('admin')
    }
    return false
  },
  set(value: boolean) {
    layout.showSelectValue.value = value
  }
})
```

## CSS 变量系统

### 主题色变量

设置面板会动态更新以下 CSS 变量：

```css
/* 主题色 */
--el-color-primary: #5D87FF;

/* 亮色变体 (1-9级) */
--el-color-primary-light-1: /* 10% 亮度 */
--el-color-primary-light-2: /* 20% 亮度 */
/* ... */
--el-color-primary-light-9: /* 90% 亮度 */

/* 暗色变体 (1-9级) */
--el-color-primary-dark-1: /* 10% 暗度 */
--el-color-primary-dark-2: /* 20% 暗度 */
/* ... */
--el-color-primary-dark-9: /* 90% 暗度 */

/* 自定义激活色 */
--custom-active-bg-color: /* 主题色 10% 透明度 */
--custom-active-text-color: /* 主题色 */

/* 菜单激活色 */
--el-menu-active-bg-color: /* 根据侧边栏主题变化 */
--el-menu-active-text-color: /* 根据侧边栏主题变化 */

/* 主题切换动画变量 */
--theme-x: /* 动画中心X坐标 */
--theme-y: /* 动画中心Y坐标 */
--theme-r: /* 动画最大半径 */
```

### 颜色工具函数

```typescript
/**
 * 将十六进制颜色转换为带透明度的颜色
 * @param hex 十六进制颜色
 * @param alpha 透明度 (0-1)
 */
const addAlphaToHex = (hex: string, alpha: number = 1): string => {
  if (alpha >= 1) return hex
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${alphaHex}`
}

/**
 * 生成主题颜色对象
 * @param color 基础颜色
 */
const generateThemeColors = (color: string): ThemeColors => {
  // 生成9个亮色变体
  const lightColors = Array.from({ length: 9 }, (_, i) =>
    getLightColor(color, (i + 1) / 10)
  )

  // 生成9个暗色变体
  const darkColors = Array.from({ length: 9 }, (_, i) =>
    getDarkColor(color, (i + 1) / 10)
  )

  return {
    primary: color,
    lightColors,
    darkColors
  }
}
```

## 配置重置

### 重置配置流程

```typescript
/**
 * 重置所有配置到默认状态
 */
const handleResetSettings = async () => {
  showLoading('正在清除设置缓存并刷新，请稍候...')

  try {
    // 调用 useLayout 的重置方法
    layout.resetConfig()

    // 延迟以显示加载反馈
    await delay(1000)

    // 刷新页面以应用默认配置
    window.location.reload()
  } catch (error) {
    console.error('重置配置失败:', error)
    hideLoading()
  }
}

// useLayout 中的重置实现
const resetConfig = (): void => {
  state.config = { ...DEFAULT_CONFIG }
}
```

### 默认配置定义

```typescript
// useLayout.ts
const DEFAULT_CONFIG: LayoutSetting = {
  // 标题配置
  title: SystemConfig.ui.title,

  // 布局相关配置
  topNav: SystemConfig.ui.topNav,           // false
  menuLayout: SystemConfig.ui.menuLayout,   // Vertical
  tagsView: SystemConfig.ui.tagsView,       // true
  fixedHeader: SystemConfig.ui.fixedHeader, // true
  sidebarLogo: SystemConfig.ui.sidebarLogo, // true
  dynamicTitle: SystemConfig.ui.dynamicTitle, // true
  layout: SystemConfig.ui.layout,

  // 外观主题配置
  theme: SystemConfig.ui.theme,             // '#5d87ff'
  sideTheme: SystemConfig.ui.sideTheme,     // Dark
  dark: SystemConfig.ui.dark,               // false

  // 功能配置
  showSettings: SystemConfig.ui.showSettings,
  animationEnable: SystemConfig.ui.animationEnable,

  // 用户偏好配置
  sidebarStatus: SystemConfig.ui.sidebarStatus,
  size: SystemConfig.ui.size,
  language: SystemConfig.ui.language,

  // 选择器配置
  showSelectValue: SystemConfig.ui.showSelectValue,

  // 水印配置
  watermark: SystemConfig.ui.watermark,           // false
  watermarkContent: SystemConfig.ui.watermarkContent // ''
}
```

## API 文档

### Settings.vue Props

该组件不接收外部 Props，所有状态通过 `useLayout` 管理。

### Settings.vue Expose

| 方法/属性 | 类型 | 说明 |
|-----------|------|------|
| `openSetting` | `() => void` | 打开设置抽屉 |
| `closeSetting` | `() => void` | 关闭设置抽屉 |
| `isVisible` | `Readonly<Ref<boolean>>` | 抽屉是否可见(只读) |

```typescript
defineExpose({
  openSetting: openSettingsDrawer,
  closeSetting: closeSettingsDrawer,
  isVisible: readonly(isDrawerVisible)
})
```

### LayoutSetting.vue Emits

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `setLayout` | 无 | 点击设置按钮时触发 |

### useLayout 返回值

#### 状态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `state` | `Readonly<LayoutState>` | 只读的完整状态对象 |
| `device` | `ComputedRef<DeviceType>` | 当前设备类型 |
| `sidebar` | `ComputedRef<SidebarState>` | 侧边栏状态 |
| `title` | `ComputedRef<string>` | 当前页面标题 |
| `language` | `WritableComputedRef<LanguageCode>` | 界面语言设置 |
| `locale` | `ComputedRef<LocaleType>` | Element Plus 本地化配置 |
| `size` | `WritableComputedRef<ElSize>` | 组件尺寸设置 |
| `theme` | `WritableComputedRef<string>` | 主题色配置 |
| `sideTheme` | `WritableComputedRef<SideTheme>` | 侧边栏主题配置 |
| `dark` | `WritableComputedRef<boolean>` | 暗黑模式配置 |
| `topNav` | `WritableComputedRef<boolean>` | 顶部导航栏显示 |
| `menuLayout` | `WritableComputedRef<MenuLayoutMode>` | 菜单布局模式 |
| `tagsView` | `WritableComputedRef<boolean>` | 标签视图显示 |
| `fixedHeader` | `WritableComputedRef<boolean>` | 固定头部配置 |
| `sidebarLogo` | `WritableComputedRef<boolean>` | 侧边栏Logo显示 |
| `dynamicTitle` | `WritableComputedRef<boolean>` | 动态标题配置 |
| `showSelectValue` | `WritableComputedRef<boolean \| undefined>` | 选择器显示值 |
| `watermark` | `WritableComputedRef<boolean \| undefined>` | 水印显示 |
| `watermarkContent` | `WritableComputedRef<string \| undefined>` | 水印内容 |

#### 操作方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `toggleSideBar` | `(withoutAnimation?: boolean) => void` | 切换侧边栏 |
| `openSideBar` | `(withoutAnimation?: boolean) => void` | 打开侧边栏 |
| `closeSideBar` | `(withoutAnimation?: boolean) => void` | 关闭侧边栏 |
| `toggleSideBarHide` | `(status: boolean) => void` | 设置侧边栏隐藏状态 |
| `toggleDevice` | `(device: DeviceType) => void` | 切换设备类型 |
| `setSize` | `(newSize: ElSize) => void` | 设置组件尺寸 |
| `changeLanguage` | `(lang: LanguageCode) => void` | 切换界面语言 |
| `toggleDark` | `(value: boolean) => void` | 切换暗黑模式 |
| `setTitle` | `(value: string) => void` | 设置页面标题 |
| `resetTitle` | `() => void` | 重置页面标题 |
| `saveSettings` | `(newConfig?: Partial<LayoutSetting>) => void` | 保存布局设置 |
| `resetConfig` | `() => void` | 重置所有配置 |

### useTheme 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `currentTheme` | `Ref<string>` | 当前主题色 |
| `setTheme` | `(color: string) => void` | 设置主题色 |
| `resetTheme` | `() => void` | 重置为默认主题 |
| `getLightColor` | `(color: string, level: number) => string` | 生成亮色变体 |
| `getDarkColor` | `(color: string, level: number) => string` | 生成暗色变体 |
| `generateThemeColors` | `(color: string) => ThemeColors` | 生成完整色系 |
| `addAlphaToHex` | `(hex: string, alpha?: number) => string` | 添加透明度 |

## 最佳实践

### 1. 正确访问布局状态

```typescript
// ✅ 推荐：在组件中使用 useLayout
const layout = useLayout()

// 读取配置
const isDark = layout.dark.value
const currentTheme = layout.theme.value

// 修改配置（自动持久化）
layout.dark.value = true
layout.theme.value = '#ff6b6b'

// ❌ 避免：直接操作 localStorage
localStorage.setItem('layout-config', JSON.stringify(config))
```

### 2. 响应式使用配置

```vue
<template>
  <!-- ✅ 直接在模板中使用 -->
  <div :class="{ 'dark-mode': layout.dark.value }">
    <!-- 内容 -->
  </div>
</template>

<script lang="ts" setup>
const layout = useLayout()

// ✅ 在 computed 中使用
const containerClass = computed(() => ({
  'dark-mode': layout.dark.value,
  'fixed-header': layout.fixedHeader.value
}))

// ✅ 在 watch 中响应变化
watch(() => layout.dark.value, (isDark) => {
  console.log('深色模式切换:', isDark)
})
</script>
```

### 3. 扩展配置项

```typescript
// 1. 在 systemConfig.ts 中添加默认值
export const SystemConfig = {
  ui: {
    // ... 现有配置
    newFeature: false // 新配置项
  }
}

// 2. 在 LayoutSetting 接口中添加类型
interface LayoutSetting {
  // ... 现有字段
  newFeature?: boolean
}

// 3. 在 useLayout 中添加计算属性
const newFeature = createConfigGetter('newFeature')

// 4. 在 Settings.vue 中添加控件
<div class="py-3 text-14px flex justify-between items-center">
  <span>新功能</span>
  <el-switch v-model="layout.newFeature.value" />
</div>
```

### 4. 自定义主题色

```typescript
const { setTheme, generateThemeColors } = useTheme()

// 设置自定义颜色
setTheme('#722ED1')

// 获取完整色系用于自定义样式
const colors = generateThemeColors('#722ED1')
console.log(colors.lightColors) // 9个亮色变体
console.log(colors.darkColors)  // 9个暗色变体
```

### 5. 主题切换带动画

```typescript
// 从事件触发点开始圆形扩散动画
const handleThemeToggle = (event: MouseEvent) => {
  toggleThemeWithAnimation(event, layout.dark.value)
}
```

## 常见问题

### 1. 配置不生效

**问题原因:**
- localStorage 中的旧配置覆盖了新默认值
- 配置键名冲突

**解决方案:**

```typescript
// 清除本地配置缓存
localStorage.removeItem('layout-config')
location.reload()

// 或使用设置面板的重置功能
layout.resetConfig()
location.reload()
```

### 2. 深色模式下菜单风格切换无效

**问题原因:**
- 深色模式下强制使用深色侧边栏主题

**解决方案:**

这是设计预期。深色模式下浅色侧边栏会影响视觉一致性，因此被禁用。用户选择的偏好会被记录，退出深色模式后自动恢复。

```typescript
// 查看用户偏好
console.log(userSelectedSideTheme.value)

// 先关闭深色模式再切换菜单风格
layout.dark.value = false
layout.sideTheme.value = SideTheme.Light
```

### 3. 主题切换动画不生效

**问题原因:**
- 浏览器不支持 View Transition API

**解决方案:**

View Transition API 目前主要在 Chrome 111+ 支持。其他浏览器会降级为无动画切换。

```typescript
// 检测支持情况
if (document.startViewTransition) {
  console.log('支持 View Transition API')
} else {
  console.log('不支持，使用无动画切换')
}
```

### 4. 水平布局下菜单风格选项被禁用

**问题原因:**
- 水平布局隐藏了侧边栏，菜单风格设置无意义

**解决方案:**

这是预期行为。切换到垂直或混合布局后菜单风格选项会自动启用。

```typescript
// 检查是否禁用
const isDisabled = layout.menuLayout.value === MenuLayoutMode.Horizontal
```

### 5. 选择器显示值开关行为不一致

**问题原因:**
- 默认值根据用户角色动态计算

**解决方案:**

```typescript
// 理解默认值逻辑
// - 超管(superadmin/admin): 默认显示
// - 普通用户: 默认不显示
// - 用户手动设置后: 使用用户设置的值

// 强制设置
layout.showSelectValue.value = true // 或 false
```

### 6. 配置持久化延迟

**问题原因:**
- deep watch 的性能开销

**解决方案:**

配置变化会立即响应，localStorage 的写入是异步的但不影响使用。如果需要确保保存完成：

```typescript
// 使用 nextTick 确保配置已写入
layout.theme.value = '#ff6b6b'
await nextTick()
console.log('配置已保存')
```

## 类型定义

### ThemeColors 接口

```typescript
/**
 * 主题颜色接口
 */
export interface ThemeColors {
  /** 主题主色调 */
  primary: string
  /** 亮色变体(9个等级) */
  lightColors: string[]
  /** 暗色变体(9个等级) */
  darkColors: string[]
}
```

### SidebarState 接口

```typescript
/**
 * 侧边栏状态接口
 */
interface SidebarState {
  /** 是否打开侧边栏 */
  opened: boolean
  /** 是否禁用切换动画 */
  withoutAnimation: boolean
  /** 是否完全隐藏侧边栏 */
  hide: boolean
}
```

### DeviceType 类型

```typescript
/**
 * 设备类型定义
 */
type DeviceType = 'pc' | 'mobile' | 'tablet'
```

### 枚举定义

```typescript
/** 侧边栏主题枚举 */
export enum SideTheme {
  Dark = 'theme-dark',
  Light = 'theme-light'
}

/** 菜单布局模式枚举 */
export enum MenuLayoutMode {
  Vertical = 'vertical',
  Mixed = 'mixed',
  Horizontal = 'horizontal'
}

/** 语言代码枚举 */
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US'
}
```

## 总结

设置面板作为系统的个性化配置中心，通过可视化的界面和丰富的选项，让用户能够轻松定制符合个人喜好的工作环境。组件采用抽屉式设计，集成了 useLayout 和 useTheme 两个核心 Composable，实现了主题、布局、水印等多维度的配置管理。

核心亮点包括：
- 三种菜单布局模式灵活切换
- View Transition API 实现炫酷的主题切换动画
- 智能的深色模式与侧边栏主题联动
- 自动持久化配置到本地存储
- 完整的 TypeScript 类型支持
- 响应式设计自动适配移动端

合理的默认配置、完善的状态管理和优雅的用户反馈，使得设置系统既强大又易用。
