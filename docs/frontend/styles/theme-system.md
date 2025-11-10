# 主题系统

## 介绍

RuoYi-Plus-UniApp 前端管理系统提供了一套完整且强大的主题系统,支持亮色/暗色双模式切换、自定义主题色、动态主题切换动画等功能。主题系统基于 CSS Variables 实现,通过分层的颜色系统和灵活的 Composable API,为开发者提供了高度可定制的主题解决方案。

**核心特性:**

- **双主题模式** - 支持亮色(Light)和暗色(Dark)两种内置主题,可一键切换
- **CSS 变量架构** - 基于 CSS Custom Properties 实现,支持实时主题切换无需刷新页面
- **五层背景色系统** - 通过背景色层级系统(bg-base 到 bg-level-4)实现层次分明的视觉效果
- **动态主题色** - 支持自定义主题色,自动生成 9 个亮色变体和 9 个暗色变体
- **View Transition 动画** - 使用现代浏览器 View Transition API 实现圆形扩散切换动画
- **组件库集成** - 与 Element Plus 深度集成,自动同步主题变量
- **持久化存储** - 主题配置自动保存到 localStorage,刷新页面后保持用户偏好
- **类型安全** - 完整的 TypeScript 类型定义,提供良好的开发体验


## 主题架构

### CSS 变量层级

主题系统采用分层的 CSS 变量架构,分为以下几个层次:

#### 1. 背景色层级系统

五层背景色设计,从浅到深(亮色模式)或从深到浅(暗色模式),用于不同的视觉层次:

```scss
/* 亮色模式 */
:root {
  --bg-base: #fafbfc;           /* 最浅层：应用主背景 */
  --bg-level-1: #ffffff;        /* 一级：卡片、侧边栏基础背景 */
  --bg-level-2: #f8f9fa;        /* 二级：轻微悬停、子区域 */
  --bg-level-3: #f5f7fa;        /* 三级：明显悬停、表格行悬停 */
  --bg-level-4: #e9ecef;        /* 四级：选中、激活状态 */
}

/* 暗色模式 */
html.dark {
  --bg-base: #111113;           /* 最深层：应用主背景 */
  --bg-level-1: #161618;        /* 一级：卡片、侧边栏基础背景 */
  --bg-level-2: #1f1f23;        /* 二级：轻微悬停、子区域 */
  --bg-level-3: #262727;        /* 三级：明显悬停、表格行悬停 */
  --bg-level-4: #2d2d30;        /* 四级：选中、激活状态 */
}
```

**使用场景:**
- `--bg-base`: 整个应用的基础背景,用于 body 或 app 容器
- `--bg-level-1`: 卡片、对话框、侧边栏等主要组件的背景
- `--bg-level-2`: 次级区域、表格偶数行等
- `--bg-level-3`: 悬停状态、高亮区域
- `--bg-level-4`: 选中、激活、按下等强调状态


#### 2. 应用级颜色变量

全局应用级别的颜色定义:

```scss
/* 亮色模式 */
:root {
  --app-bg: var(--bg-base);     /* 应用整体背景色 */
  --app-text: #303133;          /* 应用主要文字颜色 */
  --app-border: #dbdfe9;        /* 应用边框颜色 */
}

/* 暗色模式 */
html.dark {
  --app-bg: var(--bg-base);     /* 应用整体背景色 */
  --app-text: #f1f5f9;          /* 应用主要文字颜色 */
  --app-border: #363843;        /* 应用边框颜色 */
}
```


#### 3. 菜单主题变量

侧边栏菜单的专属颜色系统:

```scss
/* 亮色模式 - 深色侧边栏 */
:root {
  --menu-bg: #161618;              /* 侧边栏菜单背景色 */
  --menu-text: #bfcbd9;            /* 菜单普通文字颜色 */
  --menu-text-active: #f4f4f5;     /* 菜单激活状态文字颜色 */
  --menu-hover: #475569;           /* 基础悬停背景色 */
  --menu-hover-text: #f4f4f5;      /* 基础悬停文字色 */
  --menu-hover-color: var(--menu-hover);
  --menu-hover-text-color: var(--menu-hover-text);
  --menu-active-bg: var(--el-menu-active-bg-color);
  --menu-active-text: var(--el-menu-active-text-color);

  --submenu-bg: #1f2d3d;           /* 子菜单背景色 */
  --submenu-text-active: #f4f4f5;  /* 子菜单激活文字色 */
  --submenu-hover: var(--menu-hover-color);
  --submenu-title-hover: var(--menu-hover-color);
}

/* 暗色模式 - 与应用背景统一 */
html.dark {
  --menu-bg: var(--bg-level-1);    /* 侧边栏与应用背景统一 */
  --menu-text: #cbd5e1;
  --menu-text-active: #f4f4f5;
  --menu-hover: var(--bg-level-2);
  --menu-hover-text: #f4f4f5;
  /* ... 其他菜单变量 */
}
```

**技术实现:**

亮色模式下,侧边栏采用独立的深色背景(`#161618`),与主内容区形成对比,提供更好的导航识别度。暗色模式下,侧边栏与应用背景保持一致,采用统一的暗色调。


#### 4. 头部与表格变量

```scss
/* 头部区域 */
--header-bg: var(--app-bg);          /* 头部背景色 */
--header-text: #303133;              /* 头部文字色 */
--header-border: #e4e7ed;            /* 头部边框色 */

/* 表格组件 */
--table-header-bg: #f8f8f9;          /* 表格头部背景色 */
--table-header-text: #6b7785;        /* 表格头部文字色 */

/* 标签视图 */
--tags-view-active-bg: var(--el-color-primary);
--tags-view-active-border: var(--el-color-primary);
```


#### 5. Element Plus 集成变量

与 Element Plus 组件库的颜色映射:

```scss
/* 亮色模式 */
:root {
  --el-color-primary: #409eff;
  --el-color-primary-light-3: #79bbff;
  --el-color-primary-light-2: #409eff;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
  --el-border-color-light: #e4e7ed;
}

/* 暗色模式 */
html.dark {
  --el-color-primary: #3b82f6;
  --el-color-primary-light-3: #60a5fa;
  --el-color-primary-light-2: #3b82f6;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-bg-color: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
  --el-border-color-light: #475569;
}
```


### 主题文件组织

```
src/assets/styles/
├── themes/
│   ├── _light.scss          # 亮色主题定义
│   ├── _dark.scss           # 暗色主题定义
│   └── index.scss           # 主题入口(可选)
├── theme-animation.scss     # 主题切换动画
└── main.scss                # 样式总入口
```

## 亮色主题

### 主题定义

亮色主题使用 `:root` 伪类定义,作为默认主题:

```scss
/**
 * 亮色主题样式
 * 集中定义亮色模式下的所有变量和样式覆盖
 */

:root {
  /* === 背景色层级系统 === */
  --bg-base: #fafbfc;
  --bg-level-1: #ffffff;
  --bg-level-2: #f8f9fa;
  --bg-level-3: #f5f7fa;
  --bg-level-4: #e9ecef;

  /* 应用整体背景色 */
  --app-bg: var(--bg-base);
  --app-text: #303133;
  --app-border: #dbdfe9;

  /* ... 其他变量定义 */
}
```


### 亮色主题特定样式

针对亮色主题的组件样式覆盖:

```scss
/* 亮色主题特定样式 */
html:not(.dark) {
  /** 侧边栏右侧边框 */
  .sidebar-container {
    box-shadow: none;
    border-right: 0.5px solid var(--app-border);
  }

  .tags-view-container {
    /** 标签页容器 */
  }

  /* 表格悬停颜色 */
  .el-table__body .el-table__row:hover > td {
    background-color: var(--bg-level-3) !important;
  }
}
```

**技术实现:**

使用 `html:not(.dark)` 选择器,确保样式只在非暗色模式下生效。这种方式比使用媒体查询更灵活,支持手动切换主题。


### 使用示例

在组件中使用亮色主题变量:

```vue
<template>
  <div class="light-card">
    <div class="card-header">标题</div>
    <div class="card-body">内容区域</div>
  </div>
</template>

<style lang="scss" scoped>
.light-card {
  /* 使用一级背景色 */
  background: var(--bg-level-1);
  /* 使用应用边框色 */
  border: 1px solid var(--app-border);
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  /* 使用二级背景色 */
  background: var(--bg-level-2);
  /* 使用应用文字色 */
  color: var(--app-text);
  padding: 16px;
  font-weight: 600;
}

.card-body {
  padding: 16px;

  /* 悬停时使用三级背景色 */
  &:hover {
    background: var(--bg-level-3);
  }
}
</style>
```

## 暗色主题

### 主题定义

暗色主题使用 `html.dark` 选择器定义:

```scss
/**
 * 暗色主题样式
 * 集中定义暗色模式下的所有变量和样式覆盖
 */

html.dark {
  /* === 背景色层级系统 === */
  --bg-base: #111113;
  --bg-level-1: #161618;
  --bg-level-2: #1f1f23;
  --bg-level-3: #262727;
  --bg-level-4: #2d2d30;

  /* 应用整体背景色 */
  --app-bg: var(--bg-base);
  --app-text: #f1f5f9;
  --app-border: #363843;

  /* ... 其他变量定义 */
}
```


### 暗色主题组件覆盖

针对暗色主题的组件样式覆盖:

```scss
html.dark {
  /* Element UI 组件样式覆盖 */
  .el-tree-node__content {
    /** 树节点内容背景色 */
    --el-color-primary-light-9: var(--bg-level-3);
  }

  .el-button--primary {
    /** 主要按钮背景色 */
    --el-button-bg-color: var(--el-color-primary-dark-6);
    /** 主要按钮边框色 */
    --el-button-border-color: var(--el-color-primary-light-2);
  }

  .el-switch {
    /** 开关开启状态颜色 */
    --el-switch-on-color: var(--el-color-primary-dark-6);
    /** 开关边框颜色 */
    --el-switch-border-color: var(--el-color-primary-light-2);
  }

  .el-tag--primary {
    /** 主要标签背景色 */
    --el-tag-bg-color: var(--el-color-primary-dark-6);
    /** 主要标签边框色 */
    --el-tag-border-color: var(--el-color-primary-light-2);
  }

  /* 表格悬停颜色 */
  .el-table__body .el-table__row:hover > td {
    background-color: var(--bg-level-3) !important;
  }

  /* 自定义暗色主题变量 */
  --dark-bg-color: #1e293b;
  --dark-text-color: #f1f5f9;
  --dark-border-color: #334155;
}
```

**技术实现:**

暗色主题通过覆盖 Element Plus 组件的 CSS 变量,实现组件样式的自动适配。这种方式无需修改组件代码,只需调整 CSS 变量即可。


### 暗色主题布局样式

```scss
html.dark {
  /* 布局相关样式 */
  .app-main {
    /** 主内容区背景色 */
    background-color: var(--app-bg);
  }

  .sidebar-container {
    /** 侧边栏右侧边框 */
    box-shadow: none;
    border-right: 0.5px solid var(--app-border);
  }

  .tags-view-container {
    /** 标签页容器背景色 */
    background-color: var(--header-bg);
    /** 标签页容器边框色 */
    border-color: var(--header-border);
  }

  .search, .panel, .el-card {
    /** 卡片类组件阴影 */
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  }

  /* SVG图标颜色 */
  .svg-icon, svg {
    /** SVG图标填充色 */
    fill: var(--app-text);
  }
}
```


### 使用示例

在组件中适配暗色主题:

```vue
<template>
  <div class="theme-aware-card">
    <div class="card-icon">
      <svg class="icon"><!-- icon path --></svg>
    </div>
    <div class="card-content">
      <h3>自适应主题的卡片</h3>
      <p>这个卡片会根据主题自动调整样式</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.theme-aware-card {
  /* 使用主题变量,自动适配亮色/暗色 */
  background: var(--bg-level-1);
  border: 1px solid var(--app-border);
  color: var(--app-text);
  padding: 24px;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    background: var(--bg-level-2);
    /* 暗色模式下的阴影会自动加深 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-icon {
  margin-bottom: 16px;

  svg {
    width: 48px;
    height: 48px;
    /* SVG 颜色会根据主题自动调整 */
    fill: var(--app-text);
  }
}

.card-content {
  h3 {
    color: var(--app-text);
    margin-bottom: 8px;
  }

  p {
    /* 次要文字可以使用略浅的颜色 */
    color: var(--app-text);
    opacity: 0.7;
  }
}

/* 可选:仅在暗色主题下的特殊样式 */
html.dark .theme-aware-card {
  /* 暗色主题下增强阴影 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
</style>
```

## 主题切换

### useLayout Composable

主题切换通过 `useLayout` Composable 实现:

```typescript
/**
 * 布局管理钩子
 * 提供主题切换、布局配置等功能
 */
import { useLayout } from '@/composables/useLayout'

export default defineComponent({
  setup() {
    const layout = useLayout()

    // 获取当前暗色模式状态
    const isDark = layout.dark

    // 获取当前主题色
    const currentTheme = layout.theme

    // 切换暗色模式
    const toggleDarkMode = () => {
      layout.toggleDark(!isDark.value)
    }

    // 设置主题色
    const changeThemeColor = (color: string) => {
      layout.theme.value = color
    }

    return {
      isDark,
      currentTheme,
      toggleDarkMode,
      changeThemeColor
    }
  }
})
```

**useLayout API:**

- `dark: Ref<boolean>` - 暗色模式状态
- `theme: Ref<string>` - 当前主题色(十六进制)
- `toggleDark(value: boolean): void` - 切换暗色模式
- `theme.value = '#color'` - 设置主题色


### 基本切换

简单的主题切换实现:

```vue
<template>
  <div class="theme-switcher">
    <el-switch
      v-model="isDark"
      @change="handleToggle"
      inline-prompt
      active-text="暗"
      inactive-text="亮"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 响应式的暗色模式状态
const isDark = computed({
  get: () => layout.dark.value,
  set: (value) => layout.toggleDark(value)
})

// 切换处理函数
const handleToggle = (value: boolean) => {
  console.log('主题已切换:', value ? '暗色' : '亮色')
}
</script>

<style lang="scss" scoped>
.theme-switcher {
  padding: 16px;
}
</style>
```

### 带动画切换

使用 View Transition API 实现动画切换:

```vue
<template>
  <div class="animated-theme-switcher">
    <el-button
      @click="handleAnimatedToggle"
      :icon="isDark ? Moon : Sunny"
      circle
    >
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

const layout = useLayout()

const isDark = computed(() => layout.dark.value)

// 带动画的切换
const handleAnimatedToggle = (event: MouseEvent) => {
  toggleThemeWithAnimation(event, isDark.value)
}
</script>

<style lang="scss" scoped>
.animated-theme-switcher {
  padding: 16px;
}
</style>
```

**技术实现:**

`toggleThemeWithAnimation` 函数使用 View Transition API 实现圆形扩散效果:

1. 获取点击位置坐标 `(x, y)`
2. 计算从点击位置到视窗最远角的距离作为圆半径
3. 设置 CSS 变量 `--theme-x`, `--theme-y`, `--theme-r`
4. 使用 `document.startViewTransition()` 执行动画
5. 在动画回调中切换主题


### 主题切换动画原理

动画通过 CSS 和 View Transition API 实现:

```scss
/**
 * 主题切换动画样式
 * 使用 View Transition API 实现圆形扩散效果
 */

// 定义动画时长
$theme-animation-duration: 0.5s;

html {
  // View Transition 样式 - 亮色模式切换到暗黑模式
  &::view-transition-old(root),
  &::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  // 亮色模式 -> 暗黑模式: 新层(暗黑)从圆心扩散
  &::view-transition-new(root) {
    animation: theme-clip-in $theme-animation-duration ease-in both;
    z-index: 9999;
  }

  &::view-transition-old(root) {
    z-index: 1;
  }

  // 暗黑模式 -> 亮色模式: 旧层(暗黑)从外向圆心收缩
  &.dark {
    &::view-transition-old(root) {
      animation: theme-clip-out $theme-animation-duration ease-in both;
      z-index: 9999;
    }

    &::view-transition-new(root) {
      animation: none;
      z-index: 1;
    }
  }
}

// 定义圆形扩散动画 (从小到大)
@keyframes theme-clip-in {
  from {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }

  to {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
}

// 定义圆形收缩动画 (从大到小)
@keyframes theme-clip-out {
  from {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }

  to {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }
}
```

**动画流程:**

1. **亮色 → 暗色**: 新的暗色层从点击位置以圆形扩散(clip-in),覆盖旧的亮色层
2. **暗色 → 亮色**: 旧的暗色层从边缘向点击位置收缩(clip-out),显示出新的亮色层


### 完整切换组件示例

一个功能完整的主题切换器:

```vue
<template>
  <div class="theme-toggle-wrapper">
    <!-- 动画切换按钮 -->
    <el-tooltip :content="isDark ? '切换到亮色模式' : '切换到暗色模式'" placement="bottom">
      <el-button
        class="theme-toggle-btn"
        @click="handleToggle"
        :icon="isDark ? Moon : Sunny"
        circle
        size="large"
      />
    </el-tooltip>

    <!-- 当前主题状态提示 -->
    <div class="theme-status" :class="{ 'is-dark': isDark }">
      {{ isDark ? '暗色模式' : '亮色模式' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLayout } from '@/composables/useLayout'
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

const layout = useLayout()

const isDark = computed(() => layout.dark.value)

const handleToggle = (event: MouseEvent) => {
  // 使用动画切换
  toggleThemeWithAnimation(event, isDark.value)

  // 显示提示
  ElMessage.success({
    message: `已切换到${!isDark.value ? '暗色' : '亮色'}模式`,
    duration: 1500
  })
}
</script>

<style lang="scss" scoped>
.theme-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle-btn {
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.theme-status {
  font-size: 14px;
  color: var(--app-text);
  opacity: 0.7;
  transition: all 0.3s;

  &.is-dark {
    opacity: 1;
  }
}
</style>
```

## 自定义主题色

### useTheme Composable

自定义主题色通过 `useTheme` Composable 实现:

```typescript
/**
 * 主题管理钩子 (useTheme)
 *
 * 提供对应用主题的响应式管理功能，包括颜色变量设置、主题切换和自定义。
 */
import { useTheme } from '@/composables/useTheme'

export default defineComponent({
  setup() {
    const {
      currentTheme,      // 当前主题色
      setTheme,          // 设置主题色
      resetTheme,        // 重置主题
      getLightColor,     // 获取亮色变体
      getDarkColor,      // 获取暗色变体
      generateThemeColors, // 生成主题色系
      addAlphaToHex      // 添加透明度
    } = useTheme()

    // 设置自定义主题色
    const changeToCustomTheme = () => {
      setTheme('#1890ff')
    }

    // 重置为默认主题
    const resetToDefault = () => {
      resetTheme()
    }

    // 生成主题色的所有变体
    const colors = generateThemeColors('#1890ff')
    console.log('主色:', colors.primary)
    console.log('亮色变体:', colors.lightColors)
    console.log('暗色变体:', colors.darkColors)

    return {
      currentTheme,
      changeToCustomTheme,
      resetToDefault
    }
  }
})
```


### 主题色设置

设置自定义主题色:

```vue
<template>
  <div class="theme-color-picker">
    <div class="current-theme">
      <span>当前主题色:</span>
      <div
        class="color-preview"
        :style="{ backgroundColor: currentTheme }"
      />
      <span>{{ currentTheme }}</span>
    </div>

    <el-color-picker
      v-model="selectedColor"
      @change="handleColorChange"
      show-alpha
      :predefine="predefineColors"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { ElMessage } from 'element-plus'

const { currentTheme, setTheme } = useTheme()

const selectedColor = ref(currentTheme.value)

// 预定义颜色
const predefineColors = ref([
  '#409eff', // Element Plus 默认蓝
  '#67c23a', // 成功绿
  '#e6a23c', // 警告橙
  '#f56c6c', // 危险红
  '#909399', // 信息灰
  '#1890ff', // 蚂蚁蓝
  '#722ed1', // 紫色
  '#13c2c2', // 青色
])

// 颜色改变处理
const handleColorChange = (value: string) => {
  if (value) {
    setTheme(value)
    ElMessage.success('主题色已更新')
  }
}
</script>

<style lang="scss" scoped>
.theme-color-picker {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-theme {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--app-text);
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--app-border);
}
</style>
```

### 颜色变体生成

系统自动为主题色生成 18 个变体(9 个亮色 + 9 个暗色):

```typescript
/**
 * 为指定颜色生成所有变体
 * @param color 基础颜色
 * @returns 主题颜色对象，包含主色和变体
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

**生成规则:**

- **亮色变体**: level 1-9, 每级增加 10% 亮度, `getLightColor(color, 0.1)` 到 `getLightColor(color, 0.9)`
- **暗色变体**: level 1-9, 每级增加 10% 暗度, `getDarkColor(color, 0.1)` 到 `getDarkColor(color, 0.9)`


### 应用主题颜色

将主题色应用到 CSS 变量:

```typescript
/**
 * 应用主题颜色到CSS变量
 * @param color 主题颜色
 */
const applyThemeColors = (color: string): void => {
  // 设置主色
  document.documentElement.style.setProperty('--el-color-primary', color)

  // 设置亮色变体
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(color, i / 10)
    )
  }

  // 设置暗色变体
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(color, i / 10)
    )
  }

  // 更新当前主题变量
  currentTheme.value = color
}
```

**CSS 变量映射:**

- `--el-color-primary`: 主色
- `--el-color-primary-light-1` 到 `--el-color-primary-light-9`: 亮色变体
- `--el-color-primary-dark-1` 到 `--el-color-primary-dark-9`: 暗色变体


### 完整主题定制器示例

一个功能完整的主题定制器:

```vue
<template>
  <el-card class="theme-customizer">
    <template #header>
      <div class="card-header">
        <span>主题定制器</span>
        <el-button @click="handleReset" size="small" text>重置</el-button>
      </div>
    </template>

    <!-- 当前主题预览 -->
    <div class="theme-preview">
      <div class="preview-label">当前主题色</div>
      <div class="preview-color" :style="{ backgroundColor: currentTheme }">
        {{ currentTheme }}
      </div>
    </div>

    <!-- 颜色选择器 -->
    <div class="color-picker-wrapper">
      <el-color-picker
        v-model="customColor"
        @change="handleColorChange"
        show-alpha
        :predefine="predefineColors"
        size="large"
      />
    </div>

    <!-- 预定义主题 -->
    <div class="preset-themes">
      <div class="preset-label">预设主题</div>
      <div class="preset-colors">
        <div
          v-for="preset in presetThemes"
          :key="preset.name"
          class="preset-item"
          :class="{ active: currentTheme === preset.color }"
          @click="handlePresetClick(preset.color)"
        >
          <div
            class="preset-color"
            :style="{ backgroundColor: preset.color }"
          />
          <div class="preset-name">{{ preset.name }}</div>
        </div>
      </div>
    </div>

    <!-- 主题色变体预览 -->
    <div class="color-variants" v-if="variants">
      <div class="variants-section">
        <div class="variants-label">亮色变体</div>
        <div class="variants-grid">
          <div
            v-for="(color, index) in variants.lightColors"
            :key="`light-${index}`"
            class="variant-item"
            :style="{ backgroundColor: color }"
            :title="`light-${index + 1}: ${color}`"
          />
        </div>
      </div>

      <div class="variants-section">
        <div class="variants-label">暗色变体</div>
        <div class="variants-grid">
          <div
            v-for="(color, index) in variants.darkColors"
            :key="`dark-${index}`"
            class="variant-item"
            :style="{ backgroundColor: color }"
            :title="`dark-${index + 1}: ${color}`"
          />
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { ElMessage } from 'element-plus'

const {
  currentTheme,
  setTheme,
  resetTheme,
  generateThemeColors
} = useTheme()

// 自定义颜色
const customColor = ref(currentTheme.value)

// 预定义颜色
const predefineColors = ref([
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#1890ff',
  '#722ed1',
  '#13c2c2',
])

// 预设主题
const presetThemes = ref([
  { name: '默认蓝', color: '#409eff' },
  { name: '科技蓝', color: '#1890ff' },
  { name: '成功绿', color: '#67c23a' },
  { name: '活力橙', color: '#e6a23c' },
  { name: '危险红', color: '#f56c6c' },
  { name: '优雅紫', color: '#722ed1' },
  { name: '清新青', color: '#13c2c2' },
  { name: '中性灰', color: '#909399' },
])

// 颜色变体
const variants = computed(() => {
  return generateThemeColors(currentTheme.value)
})

// 颜色改变处理
const handleColorChange = (value: string) => {
  if (value) {
    setTheme(value)
    ElMessage.success({
      message: '主题色已更新',
      duration: 1500
    })
  }
}

// 预设主题点击
const handlePresetClick = (color: string) => {
  customColor.value = color
  setTheme(color)
  ElMessage.success({
    message: '已应用预设主题',
    duration: 1500
  })
}

// 重置主题
const handleReset = () => {
  resetTheme()
  customColor.value = currentTheme.value
  ElMessage.info({
    message: '已重置为默认主题',
    duration: 1500
  })
}

// 监听当前主题变化
watch(currentTheme, (newVal) => {
  customColor.value = newVal
})
</script>

<style lang="scss" scoped>
.theme-customizer {
  max-width: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-preview {
  margin-bottom: 24px;
}

.preview-label {
  font-size: 14px;
  color: var(--app-text);
  margin-bottom: 8px;
  opacity: 0.7;
}

.preview-color {
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-picker-wrapper {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.preset-themes {
  margin-bottom: 24px;
}

.preset-label {
  font-size: 14px;
  color: var(--app-text);
  margin-bottom: 12px;
  opacity: 0.7;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.preset-item {
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    background: var(--bg-level-2);
  }

  &.active {
    border-color: var(--el-color-primary);
    background: var(--bg-level-2);
  }
}

.preset-color {
  width: 100%;
  height: 48px;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preset-name {
  font-size: 12px;
  color: var(--app-text);
}

.color-variants {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--app-border);
}

.variants-section {
  &:not(:last-child) {
    margin-bottom: 16px;
  }
}

.variants-label {
  font-size: 14px;
  color: var(--app-text);
  margin-bottom: 8px;
  opacity: 0.7;
}

.variants-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 4px;
}

.variant-item {
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
```

## 颜色工具函数

### 颜色转换

十六进制与 RGB 互转:

```typescript
import { hexToRgb, rgbToHex, hexToRgba } from '@/utils/colors'

// Hex -> RGB
const rgb = hexToRgb('#409eff')
console.log(rgb) // [64, 158, 255]

// RGB -> Hex
const hex = rgbToHex(64, 158, 255)
console.log(hex) // '#409eff'

// Hex -> RGBA
const rgba = hexToRgba('#409eff', 0.5)
console.log(rgba)
// {
//   red: 64,
//   green: 158,
//   blue: 255,
//   rgba: 'rgba(64, 158, 255, 0.50)'
// }
```


### 颜色验证

验证颜色格式:

```typescript
import { isValidHex, isValidRgb } from '@/utils/colors'

// 验证 Hex 颜色
console.log(isValidHex('#409eff'))  // true
console.log(isValidHex('#fff'))     // true
console.log(isValidHex('409eff'))   // true (会自动处理)
console.log(isValidHex('invalid'))  // false

// 验证 RGB 值
console.log(isValidRgb(64, 158, 255))  // true
console.log(isValidRgb(256, 158, 255)) // false (超出范围)
console.log(isValidRgb(64.5, 158, 255)) // false (非整数)
```


### 颜色调节

调亮和调暗颜色:

```typescript
import { lightenColor, darkenColor } from '@/utils/colors'

const baseColor = '#409eff'

// 调亮颜色
const light1 = lightenColor(baseColor, 0.1) // 调亮 10%
const light5 = lightenColor(baseColor, 0.5) // 调亮 50%
const light9 = lightenColor(baseColor, 0.9) // 调亮 90%

// 调暗颜色
const dark1 = darkenColor(baseColor, 0.1) // 调暗 10%
const dark5 = darkenColor(baseColor, 0.5) // 调暗 50%
const dark9 = darkenColor(baseColor, 0.9) // 调暗 90%

console.log('原色:', baseColor)
console.log('亮色变体:', light1, light5, light9)
console.log('暗色变体:', dark1, dark5, dark9)
```

**算法说明:**

- **调亮**: `RGB' = RGB + (255 - RGB) × level`, 向白色(255)混合
- **调暗**: `RGB' = RGB × (1 - level)`, 向黑色(0)混合


### 颜色混合

按比例混合两种颜色:

```typescript
import { blendColor } from '@/utils/colors'

const color1 = '#409eff' // 蓝色
const color2 = '#67c23a' // 绿色

// 混合比例 0-1
const blend25 = blendColor(color1, color2, 0.25)  // 75% 蓝 + 25% 绿
const blend50 = blendColor(color1, color2, 0.5)   // 50% 蓝 + 50% 绿
const blend75 = blendColor(color1, color2, 0.75)  // 25% 蓝 + 75% 绿

console.log('蓝绿混合:', blend25, blend50, blend75)
```


### 透明度处理

为颜色添加透明度:

```typescript
import { addAlphaToHex } from '@/composables/useTheme'

const { addAlphaToHex } = useTheme()

const baseColor = '#409eff'

// 添加不同透明度
const alpha10 = addAlphaToHex(baseColor, 0.1)   // 10% 不透明度
const alpha50 = addAlphaToHex(baseColor, 0.5)   // 50% 不透明度
const alpha100 = addAlphaToHex(baseColor, 1)    // 100% 不透明度 (完全不透明)

console.log('透明度变体:', alpha10, alpha50, alpha100)
// '#409eff1a', '#409eff80', '#409eff'
```


### 完整工具函数示例

综合使用颜色工具函数:

```vue
<template>
  <div class="color-tools-demo">
    <div class="demo-section">
      <h3>颜色转换</h3>
      <div class="demo-row">
        <span>Hex: {{ hexColor }}</span>
        <span>RGB: {{ rgbColor.join(', ') }}</span>
        <span>RGBA: {{ rgbaColor.rgba }}</span>
      </div>
    </div>

    <div class="demo-section">
      <h3>颜色变体</h3>
      <div class="color-grid">
        <div
          v-for="(color, index) in variants"
          :key="index"
          class="color-box"
          :style="{ backgroundColor: color }"
          :title="color"
        />
      </div>
    </div>

    <div class="demo-section">
      <h3>颜色混合</h3>
      <div class="blend-demo">
        <div class="blend-source">
          <div class="blend-color" :style="{ backgroundColor: color1 }">
            {{ color1 }}
          </div>
          <div class="blend-color" :style="{ backgroundColor: color2 }">
            {{ color2 }}
          </div>
        </div>
        <div class="blend-result">
          <div
            v-for="ratio in [0.25, 0.5, 0.75]"
            :key="ratio"
            class="blend-color"
            :style="{ backgroundColor: blendedColors[ratio] }"
          >
            {{ (ratio * 100).toFixed(0) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import {
  hexToRgb,
  rgbToHex,
  hexToRgba,
  lightenColor,
  darkenColor,
  blendColor
} from '@/utils/colors'

const hexColor = '#409eff'
const rgbColor = computed(() => hexToRgb(hexColor))
const rgbaColor = computed(() => hexToRgba(hexColor, 0.5))

// 颜色变体
const variants = computed(() => {
  const lights = Array.from({ length: 5 }, (_, i) =>
    lightenColor(hexColor, (i + 1) * 0.15)
  )
  const darks = Array.from({ length: 5 }, (_, i) =>
    darkenColor(hexColor, (i + 1) * 0.15)
  )
  return [...darks.reverse(), hexColor, ...lights]
})

// 颜色混合
const color1 = '#409eff'
const color2 = '#67c23a'
const blendedColors = computed(() => ({
  0.25: blendColor(color1, color2, 0.25),
  0.5: blendColor(color1, color2, 0.5),
  0.75: blendColor(color1, color2, 0.75)
}))
</script>

<style lang="scss" scoped>
.color-tools-demo {
  padding: 24px;
}

.demo-section {
  margin-bottom: 32px;

  h3 {
    margin-bottom: 16px;
    color: var(--app-text);
  }
}

.demo-row {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--app-text);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 8px;
}

.color-box {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
  }
}

.blend-demo {
  display: flex;
  gap: 24px;
  align-items: center;
}

.blend-source,
.blend-result {
  display: flex;
  gap: 8px;
}

.blend-color {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
```

## 最佳实践

### 1. 使用主题变量而非硬编码

**推荐做法:**

```vue
<style lang="scss" scoped>
.card {
  /* ✅ 使用主题变量 */
  background: var(--bg-level-1);
  color: var(--app-text);
  border: 1px solid var(--app-border);
}
</style>
```

**不推荐做法:**

```vue
<style lang="scss" scoped>
.card {
  /* ❌ 硬编码颜色 */
  background: #ffffff;
  color: #303133;
  border: 1px solid #dbdfe9;
}
</style>
```

**原因:**
- 硬编码颜色无法响应主题切换
- 在暗色模式下会出现样式问题
- 不利于统一调整主题风格

### 2. 合理使用背景色层级

**推荐做法:**

```vue
<template>
  <div class="page">
    <!-- 页面基础背景 -->
    <div class="page-main">
      <!-- 一级卡片 -->
      <div class="card-level-1">
        <!-- 二级内容区 -->
        <div class="content-level-2">
          <!-- 三级悬停区 -->
          <div class="item-level-3">
            内容
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  background: var(--bg-base);
}

.card-level-1 {
  background: var(--bg-level-1);
}

.content-level-2 {
  background: var(--bg-level-2);
}

.item-level-3 {
  &:hover {
    background: var(--bg-level-3);
  }

  &:active {
    background: var(--bg-level-4);
  }
}
</style>
```

**不推荐做法:**

```vue
<style lang="scss" scoped>
/* ❌ 跳跃使用层级,缺乏层次感 */
.card {
  background: var(--bg-level-1);
}

.content {
  background: var(--bg-level-4); /* 跳过 level-2 和 level-3 */
}
</style>
```

### 3. 暗色模式专属样式的正确使用

**推荐做法:**

```vue
<style lang="scss" scoped>
.component {
  /* 通用样式,使用主题变量 */
  background: var(--bg-level-1);
  color: var(--app-text);
  border: 1px solid var(--app-border);
}

/* 仅在暗色模式下需要调整的特殊样式 */
html.dark .component {
  /* ✅ 增强暗色模式下的阴影 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  /* ✅ 调整特定元素的透明度 */
  .component-icon {
    opacity: 0.8;
  }
}
</style>
```

**不推荐做法:**

```vue
<style lang="scss" scoped>
/* ❌ 在暗色样式中重复定义已有主题变量 */
html.dark .component {
  background: #161618;  /* 应该使用 var(--bg-level-1) */
  color: #f1f5f9;       /* 应该使用 var(--app-text) */
}
</style>
```

### 4. 主题色变体的正确使用

**推荐做法:**

```vue
<template>
  <div class="status-card">
    <div class="status-success">成功</div>
    <div class="status-warning">警告</div>
    <div class="status-error">错误</div>
  </div>
</template>

<style lang="scss" scoped>
.status-success {
  /* ✅ 使用 Element Plus 的颜色变量 */
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
  border: 1px solid var(--el-color-success-light-5);
}

.status-warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  border: 1px solid var(--el-color-warning-light-5);
}

.status-error {
  background: var(--el-color-error-light-9);
  color: var(--el-color-error);
  border: 1px solid var(--el-color-error-light-5);
}
</style>
```

**不推荐做法:**

```vue
<style lang="scss" scoped>
.status-success {
  /* ❌ 硬编码主题色及其变体 */
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
}
</style>
```

### 5. 过渡动画的最佳实践

**推荐做法:**

```vue
<style lang="scss" scoped>
.theme-aware-component {
  /* ✅ 为主题相关属性添加过渡 */
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
  background: var(--bg-level-1);
  color: var(--app-text);
  border: 1px solid var(--app-border);
}

/* 交互状态也保持过渡 */
.theme-aware-component:hover {
  background: var(--bg-level-2);
  transition: background-color 0.2s; /* 悬停更快响应 */
}
</style>
```

**不推荐做法:**

```vue
<style lang="scss" scoped>
.component {
  /* ❌ 使用 all 过渡,性能差 */
  transition: all 0.3s;
}

/* ❌ 没有过渡,主题切换生硬 */
.another-component {
  background: var(--bg-level-1);
  color: var(--app-text);
}
</style>
```

## 常见问题

### 1. 主题切换后部分组件颜色未更新

**问题原因:**
- 组件使用了硬编码颜色而非主题变量
- 组件样式使用了 `!important` 覆盖了主题变量
- 第三方组件未正确集成主题系统

**解决方案:**

```vue
<!-- 问题代码 -->
<template>
  <div class="problem-component">
    内容
  </div>
</template>

<style lang="scss" scoped>
.problem-component {
  /* ❌ 硬编码颜色 */
  background: #ffffff !important;
  color: #303133;
}
</style>

<!-- 解决方案 -->
<template>
  <div class="fixed-component">
    内容
  </div>
</template>

<style lang="scss" scoped>
.fixed-component {
  /* ✅ 使用主题变量,移除 !important */
  background: var(--bg-level-1);
  color: var(--app-text);
}
</style>
```


### 2. 自定义主题色后 Element Plus 组件样式异常

**问题原因:**
- Element Plus 组件依赖主题色变体(light-1 到 light-9, dark-1 到 dark-9)
- 自定义主题色后未正确生成变体

**解决方案:**

```typescript
// ❌ 错误做法:直接修改 CSS 变量
document.documentElement.style.setProperty('--el-color-primary', '#1890ff')

// ✅ 正确做法:使用 useTheme 自动生成变体
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// 自动生成 18 个变体并应用
setTheme('#1890ff')
```


### 3. 暗色模式下表格行悬停颜色不明显

**问题原因:**
- 默认的表格悬停颜色在暗色模式下对比度不够
- 需要针对暗色模式调整悬停背景色

**解决方案:**

```scss
/* ✅ 在暗色主题文件中覆盖表格悬停样式 */
html.dark {
  /* 表格悬停颜色 */
  .el-table__body .el-table__row:hover > td {
    background-color: var(--bg-level-3) !important;
  }
}
```

这段代码已经在暗色主题文件中定义,如果仍然不明显,可以调整为更深的层级:

```scss
html.dark {
  .el-table__body .el-table__row:hover > td {
    /* 使用 level-4 提供更强对比 */
    background-color: var(--bg-level-4) !important;
  }
}
```


### 4. 主题切换动画在某些浏览器不生效

**问题原因:**
- View Transition API 是较新的特性,部分浏览器不支持
- 需要降级处理

**解决方案:**

`toggleThemeWithAnimation` 函数已内置降级处理:

```typescript
export const toggleThemeWithAnimation = (event: MouseEvent, isDark: boolean) => {
  const layout = useLayout()
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  const root = document.documentElement
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${endRadius}px`)

  // ✅ 检查浏览器支持,自动降级
  if (document.startViewTransition) {
    // 支持 View Transition API,使用动画
    document.startViewTransition(() => {
      layout.toggleDark(!isDark)
    })
  } else {
    // 不支持则直接切换,无动画
    layout.toggleDark(!isDark)
  }
}
```


### 5. 刷新页面后主题设置丢失

**问题原因:**
- 主题配置未持久化到 localStorage
- useLayout 的状态管理未正确初始化

**解决方案:**

useLayout Composable 已内置持久化逻辑,确保正确使用:

```typescript
import { useLayout } from '@/composables/useLayout'

export default defineComponent({
  setup() {
    const layout = useLayout()

    // ✅ 主题设置会自动保存到 localStorage
    layout.theme.value = '#1890ff'
    layout.toggleDark(true)

    // 刷新页面后,useLayout 会自动从 localStorage 恢复配置

    return {
      layout
    }
  }
})
```

如果仍然出现问题,检查浏览器 localStorage:

```typescript
// 检查 localStorage 中的布局配置
const layoutConfig = localStorage.getItem('layout-config')
console.log('Layout Config:', JSON.parse(layoutConfig))

// 手动清除并重置
localStorage.removeItem('layout-config')
location.reload()
```

