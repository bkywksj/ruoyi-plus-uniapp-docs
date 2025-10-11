# 图标组件使用

项目提供了 `Icon` 和 `IconSelect` 两个核心组件，支持 Iconfont 和 Iconify 双图标系统，提供灵活的尺寸、颜色和动画配置。

## 📦 Icon 组件

### 组件特性

- ✅ 支持 iconfont 和 iconify 双图标系统
- ✅ 自动图标类型识别（优先 iconfont，其次 iconify）
- ✅ 灵活的尺寸设置（预设尺寸、数字或字符串）
- ✅ 自定义颜色支持
- ✅ 内置 6 种动画效果
- ✅ 自动处理 iconfont 和 iconify 样式差异

### 基础用法

```vue
<template>
  <!-- 使用 code 属性（推荐） -->
  <Icon code="elevator3" />
  <Icon code="user" />
  <Icon code="search" />

  <!-- 使用 value 属性 -->
  <Icon value="i-ep-home" />
  <Icon value="icon-elevator3" />
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
</script>
```

### Props 属性

```typescript
interface IconProps {
  /** 图标值，可以是完整的图标类名（用于 iconify 或自定义类） */
  value?: string

  /** 图标代码，用于标识图标，优先从 iconfont 查找，然后从 iconify 查找 */
  code?: IconCode

  /** 图标大小，支持预设尺寸、数字(px)或字符串 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string | number

  /** 图标颜色，支持任何CSS颜色值 */
  color?: string

  /** 图标动画效果类型 */
  animate?: 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'
}
```

## 🎨 图标识别机制

### 自动类型识别

Icon 组件会按以下优先级自动识别图标类型：

```vue
<template>
  <!-- 1. value 以 i- 开头 → iconify -->
  <Icon value="i-ep-home" />  <!-- Iconify 图标 -->

  <!-- 2. value 不以 i- 开头 → iconfont -->
  <Icon value="icon-elevator3" />  <!-- Iconfont 图标 -->

  <!-- 3. code 在 iconfont 中存在 → iconfont -->
  <Icon code="elevator3" />  <!-- 自动识别为 icon-elevator3 -->

  <!-- 4. code 在 iconify 预设中存在 → iconify -->
  <Icon code="home" />  <!-- 自动识别为 i-ep-home -->

  <!-- 5. code 不在任何库中 → 尝试作为 iconify 处理 -->
  <Icon code="carbon-user" />  <!-- 转为 i-carbon-user -->
</template>
```

### 识别示例

```vue
<template>
  <!-- ✅ Iconfont 图标（644个） -->
  <Icon code="elevator3" />           <!-- 自动添加 icon- 前缀 -->
  <Icon code="equipment-setting2" />
  <Icon value="icon-elevator3" />     <!-- 直接使用完整类名 -->

  <!-- ✅ Iconify 图标（173个预设） -->
  <Icon code="home" />                <!-- 自动转为 i-ep-home -->
  <Icon value="i-ep-home" />          <!-- 直接使用完整类名 -->

  <!-- ✅ 其他 Iconify 图标集 -->
  <Icon value="i-carbon-user" />
  <Icon value="i-mdi-account" />
</template>
```

## 📏 尺寸设置

### 预设尺寸

```vue
<template>
  <Icon code="search" size="xs" />    <!-- 12px -->
  <Icon code="search" size="sm" />    <!-- 16px -->
  <Icon code="search" size="md" />    <!-- 20px (默认) -->
  <Icon code="search" size="lg" />    <!-- 24px -->
  <Icon code="search" size="xl" />    <!-- 32px -->
  <Icon code="search" size="2xl" />   <!-- 40px -->
</template>
```

### 数字尺寸（像素）

```vue
<template>
  <Icon code="user" :size="16" />
  <Icon code="user" :size="20" />
  <Icon code="user" :size="24" />
  <Icon code="user" :size="32" />
</template>
```

### 字符串尺寸

```vue
<template>
  <Icon code="setting" size="1.5em" />
  <Icon code="setting" size="2rem" />
  <Icon code="setting" size="24px" />
  <Icon code="setting" size="1.3em" />  <!-- 默认值 -->
</template>
```

## 🎨 颜色设置

### CSS 颜色值

```vue
<template>
  <!-- 十六进制 -->
  <Icon code="home" color="#409eff" />

  <!-- RGB/RGBA -->
  <Icon code="user" color="rgb(64, 158, 255)" />
  <Icon code="user" color="rgba(64, 158, 255, 0.8)" />

  <!-- 命名颜色 -->
  <Icon code="setting" color="red" />
  <Icon code="setting" color="blue" />
</template>
```

### CSS 变量

```vue
<template>
  <!-- Element Plus 主题色 -->
  <Icon code="success" color="var(--el-color-success)" />
  <Icon code="warning" color="var(--el-color-warning)" />
  <Icon code="danger" color="var(--el-color-danger)" />
  <Icon code="primary" color="var(--el-color-primary)" />

  <!-- 自定义变量 -->
  <Icon code="custom" color="var(--app-text)" />
</template>
```

## 🎬 动画效果

### 6 种内置动画

```vue
<template>
  <!-- 震动 -->
  <Icon code="bell" animate="shake" />

  <!-- 旋转180度 -->
  <Icon code="refresh" animate="rotate180" />

  <!-- 向上移动 -->
  <Icon code="upload" animate="moveUp" />

  <!-- 放大 -->
  <Icon code="fullscreen" animate="expand" />

  <!-- 缩小 -->
  <Icon code="fullscreen-exit" animate="shrink" />

  <!-- 呼吸效果 -->
  <Icon code="notification" animate="breathing" />
</template>
```

### 动画使用场景

```vue
<template>
  <!-- 通知图标 - 呼吸效果 -->
  <Icon code="notification" animate="breathing" color="#f56c6c" />

  <!-- 刷新按钮 - 旋转效果 -->
  <Icon code="refresh" animate="rotate180" />

  <!-- 上传图标 - 向上移动 -->
  <Icon code="upload" animate="moveUp" />

  <!-- 全屏切换 - 放大/缩小 -->
  <Icon :code="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
        :animate="isFullscreen ? 'shrink' : 'expand'" />
</template>
```

## 🔧 组合使用

### 完整配置

```vue
<template>
  <!-- 带颜色、尺寸和动画 -->
  <Icon
    code="notification"
    size="24"
    color="#409eff"
    animate="breathing"
  />

  <!-- 预设尺寸 + 主题色 + 动画 -->
  <Icon
    code="refresh"
    size="lg"
    color="var(--el-color-primary)"
    animate="rotate180"
  />
</template>
```

### 动态图标

```vue
<template>
  <Icon
    :code="iconCode"
    :size="iconSize"
    :color="iconColor"
    :animate="iconAnimate"
  />
</template>

<script setup lang="ts">
import type { IconCode } from '@/types/icons'

const iconCode = ref<IconCode>('home')
const iconSize = ref<number>(24)
const iconColor = ref('#409eff')
const iconAnimate = ref<'shake' | 'rotate180'>('shake')

function changeIcon() {
  iconCode.value = iconCode.value === 'home' ? 'user' : 'home'
}
</script>
```

## 📋 IconSelect 组件

图标选择器组件，提供图标选择功能，支持搜索和实时预览。

### 基础用法

```vue
<template>
  <IconSelect v-model="selectedIcon" width="400px" />
</template>

<script setup lang="ts">
import IconSelect from '@/components/Icon/IconSelect.vue'

const selectedIcon = ref('elevator3')
</script>
```

### Props 属性

```typescript
interface IconSelectProps {
  /** 当前选中的图标代码 */
  modelValue: string

  /** 组件宽度 */
  width?: string  // 默认 '400px'
}
```

### 组件特性

- ✅ v-model 双向绑定
- ✅ 图标搜索（支持代码和名称）
- ✅ 实时预览（悬停显示图标信息）
- ✅ 图标网格展示
- ✅ 选中状态高亮
- ✅ 支持 817 个图标（644 iconfont + 173 iconify）

### 完整示例

```vue
<template>
  <el-form>
    <el-form-item label="选择图标">
      <IconSelect v-model="form.icon" width="100%" />
    </el-form-item>

    <el-form-item label="当前选中">
      <div class="flex items-center gap-2">
        <Icon :code="form.icon" size="lg" />
        <span>{{ form.icon }}</span>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const form = reactive({
  icon: 'home'
})
</script>
```

## 🎯 常见使用场景

### 1. 导航菜单

```vue
<template>
  <el-menu>
    <el-menu-item index="1">
      <Icon code="home" size="lg" color="var(--el-menu-text-color)" />
      <span>首页</span>
    </el-menu-item>

    <el-menu-item index="2">
      <Icon code="user" size="lg" color="var(--el-menu-text-color)" />
      <span>用户管理</span>
    </el-menu-item>

    <el-menu-item index="3">
      <Icon code="setting" size="lg" color="var(--el-menu-text-color)" />
      <span>系统设置</span>
    </el-menu-item>
  </el-menu>
</template>
```

### 2. 按钮图标

```vue
<template>
  <el-button type="primary">
    <Icon code="plus" size="sm" color="#fff" />
    添加
  </el-button>

  <el-button type="success">
    <Icon code="edit" size="sm" color="#fff" />
    编辑
  </el-button>

  <el-button type="danger">
    <Icon code="delete" size="sm" color="#fff" />
    删除
  </el-button>
</template>
```

### 3. 状态图标

```vue
<template>
  <div class="status-list">
    <div class="status-item">
      <Icon code="success" size="lg" color="var(--el-color-success)" />
      <span>操作成功</span>
    </div>

    <div class="status-item">
      <Icon code="warning" size="lg" color="var(--el-color-warning)" />
      <span>警告提示</span>
    </div>

    <div class="status-item">
      <Icon code="error" size="lg" color="var(--el-color-danger)" />
      <span>操作失败</span>
    </div>
  </div>
</template>
```

### 4. 操作按钮组

```vue
<template>
  <div class="action-buttons">
    <el-tooltip content="编辑">
      <Icon
        code="edit"
        size="18"
        color="#409eff"
        class="cursor-pointer hover:scale-110 transition-transform"
        @click="handleEdit"
      />
    </el-tooltip>

    <el-tooltip content="删除">
      <Icon
        code="delete"
        size="18"
        color="#f56c6c"
        class="cursor-pointer hover:scale-110 transition-transform"
        @click="handleDelete"
      />
    </el-tooltip>

    <el-tooltip content="查看">
      <Icon
        code="view"
        size="18"
        color="#67c23a"
        class="cursor-pointer hover:scale-110 transition-transform"
        @click="handleView"
      />
    </el-tooltip>
  </div>
</template>

<style scoped>
.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
```

### 5. 加载状态

```vue
<template>
  <div class="loading-container">
    <Icon
      code="loading"
      size="xl"
      color="#409eff"
      animate="rotate180"
    />
    <p>加载中...</p>
  </div>
</template>
```

## ⚠️ 注意事项

### 1. code vs value

```vue
<!-- ✅ 推荐：使用 code（自动识别） -->
<Icon code="elevator3" />
<Icon code="home" />

<!-- ✅ 可用：使用 value（明确指定） -->
<Icon value="icon-elevator3" />
<Icon value="i-ep-home" />
```

**使用建议**：
- 优先使用 `code` 属性，组件会自动识别图标类型
- 当需要明确指定图标类型时使用 `value`

### 2. 类型安全

```typescript
import type { IconCode } from '@/types/icons'

// ✅ 使用类型定义
const icon = ref<IconCode>('elevator3')

// ❌ 避免字符串硬编码
const icon = ref('elevator3')  // 无类型检查
```

### 3. 样式优先级

```vue
<template>
  <!-- iconfont 使用 font-size 控制大小 -->
  <Icon code="elevator3" :size="24" />

  <!-- iconify 使用 width/height 控制大小 -->
  <Icon value="i-ep-home" :size="24" />
</template>
```

组件内部已自动处理，无需手动区分。

## 🔗 相关文档

- [图标系统概述](./overview.md) - 图标系统架构
- [Iconify 配置](./iconify-config.md) - Iconify 图标配置
- [Iconfont 配置](./iconfont-config.md) - Iconfont 图标配置
- [图标类型生成](./type-generation.md) - 自动类型生成
- [图标最佳实践](./best-practices.md) - 使用建议

Icon 组件提供了统一、灵活的图标使用方式，是项目中图标展示的标准解决方案。
