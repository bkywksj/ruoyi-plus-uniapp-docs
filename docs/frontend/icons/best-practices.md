# 图标最佳实践

图标使用的最佳实践指南,涵盖选择、使用、优化和维护等方面,帮助开发者高效管理图标资源。

## 🎯 图标选择

### 1. 选择合适的图标系统

```vue
<!-- ✅ 推荐: 通用图标使用 Iconify -->
<i class="i-ep-home" />      <!-- 首页 -->
<i class="i-ep-setting" />   <!-- 设置 -->
<i class="i-ep-user" />      <!-- 用户 -->

<!-- ✅ 推荐: 业务专属图标使用 Iconfont -->
<i class="iconfont icon-elevator3" />           <!-- 电梯 -->
<i class="iconfont icon-equipment-setting2" />  <!-- 设备设置 -->
```

**选择原则**:
- **Iconify**: 通用 UI 图标、第三方图标集
- **Iconfont**: 业务定制图标、品牌专属图标

### 2. 图标语义化

```vue
<!-- ✅ 语义化命名 -->
<i class="i-ep-success-filled" />  <!-- 成功状态 -->
<i class="i-ep-warning-filled" />  <!-- 警告状态 -->
<i class="i-ep-error-filled" />    <!-- 错误状态 -->

<!-- ❌ 避免无意义命名 -->
<i class="i-ep-circle-check" />    <!-- 不够直观 -->
```

### 3. 图标一致性

```vue
<!-- ✅ 风格一致 -->
<i class="i-ep-home" />         <!-- Element Plus 风格 -->
<i class="i-ep-menu" />         <!-- Element Plus 风格 -->
<i class="i-ep-setting" />      <!-- Element Plus 风格 -->

<!-- ❌ 风格混乱 -->
<i class="i-ep-home" />         <!-- Element Plus -->
<i class="i-mdi-account" />     <!-- Material Design -->
<i class="i-carbon-user" />     <!-- Carbon -->
```

## 💡 使用规范

### 1. 类型安全

```typescript
// ✅ 使用类型定义
import type { IconCode } from '@/types/icons'

const icon = ref<IconCode>('i-ep-home')  // 类型安全

// ❌ 避免字符串硬编码
const icon = ref('i-ep-home')  // 无类型检查
```

### 2. 组件封装

```vue
<!-- ✅ 推荐: 封装 Icon 组件 -->
<Icon icon="i-ep-home" :size="24" color="#409eff" />

<!-- ❌ 避免: 重复写样式 -->
<i class="i-ep-home" style="font-size: 24px; color: #409eff" />
<i class="i-ep-menu" style="font-size: 24px; color: #409eff" />
<i class="i-ep-user" style="font-size: 24px; color: #409eff" />
```

### 3. 动态图标

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

// ✅ 推荐: 使用计算属性
const status = ref<'success' | 'warning' | 'error'>('success')
const statusIcon = computed<IconCode>(() => ({
  success: 'i-ep-success-filled',
  warning: 'i-ep-warning-filled',
  error: 'i-ep-error-filled',
}[status.value]))

// ❌ 避免: 多个 v-if
</script>

<template>
  <!-- ✅ 推荐 -->
  <i :class="statusIcon" />

  <!-- ❌ 避免 -->
  <i v-if="status === 'success'" class="i-ep-success-filled" />
  <i v-else-if="status === 'warning'" class="i-ep-warning-filled" />
  <i v-else class="i-ep-error-filled" />
</template>
```

## 🎨 样式规范

### 1. 尺寸标准化

```scss
// 定义图标尺寸变量
:root {
  --icon-xs: 12px;
  --icon-sm: 14px;
  --icon-md: 16px;
  --icon-lg: 20px;
  --icon-xl: 24px;
}

// 使用标准尺寸
.icon {
  &-xs { font-size: var(--icon-xs); }
  &-sm { font-size: var(--icon-sm); }
  &-md { font-size: var(--icon-md); }
  &-lg { font-size: var(--icon-lg); }
  &-xl { font-size: var(--icon-xl); }
}
```

```vue
<template>
  <!-- ✅ 使用标准尺寸 -->
  <i class="i-ep-home icon-md" />
  <i class="i-ep-menu icon-lg" />

  <!-- ❌ 避免随意尺寸 -->
  <i class="i-ep-home" style="font-size: 17px" />
  <i class="i-ep-menu" style="font-size: 23px" />
</template>
```

### 2. 颜色主题化

```vue
<template>
  <!-- ✅ 使用 CSS 变量 -->
  <i class="i-ep-home" style="color: var(--el-color-primary)" />

  <!-- ✅ 使用工具类 -->
  <i class="i-ep-home text-primary" />

  <!-- ❌ 避免硬编码 -->
  <i class="i-ep-home" style="color: #409eff" />
</template>
```

### 3. 响应式图标

```vue
<template>
  <i class="icon-responsive i-ep-home" />
</template>

<style scoped>
.icon-responsive {
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;  /* 移动端缩小 */
  }

  @media (min-width: 1200px) {
    font-size: 20px;  /* 大屏幕放大 */
  }
}
</style>
```

## 🚀 性能优化

### 1. 按需加载

```typescript
// ✅ 推荐: 仅预设常用图标
export default defineConfig({
  safelist: [
    'i-ep-home',
    'i-ep-menu',
    'i-ep-user',
    'i-ep-setting',
  ]
})

// ❌ 避免: 预设所有图标
export default defineConfig({
  safelist: [
    ...ICONIFY_ICONS.map(i => i.value)  // 173 个全部加载
  ]
})
```

### 2. 图标懒加载

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 懒加载图标组件
const IconLazy = defineAsyncComponent(() =>
  import('@/components/Icon/index.vue')
)
</script>

<template>
  <Suspense>
    <template #default>
      <IconLazy icon="i-ep-home" />
    </template>
    <template #fallback>
      <span>Loading...</span>
    </template>
  </Suspense>
</template>
```

### 3. 减少重复渲染

```vue
<script setup lang="ts">
// ✅ 使用 v-once 减少重复渲染
</script>

<template>
  <div v-for="item in list" :key="item.id">
    <i v-once :class="item.icon" />  <!-- 图标不变时使用 v-once -->
    <span>{{ item.name }}</span>
  </div>
</template>
```

## 🔧 维护建议

### 1. 图标清理

```typescript
// scripts/clean-unused-icons.ts
import { globSync } from 'glob'
import fs from 'fs'
import { ICONIFY_ICONS, ICONFONT_ICONS } from '../src/types/icons'

const allIcons = [
  ...ICONIFY_ICONS.map(i => i.value),
  ...ICONFONT_ICONS.map(i => i.value)
]

const vueFiles = globSync('src/**/*.{vue,ts,tsx}')
const usedIcons = new Set<string>()

vueFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8')
  allIcons.forEach(icon => {
    if (content.includes(icon)) {
      usedIcons.add(icon)
    }
  })
})

const unusedIcons = allIcons.filter(icon => !usedIcons.has(icon))
console.log('未使用的图标:', unusedIcons)
console.log('未使用图标数量:', unusedIcons.length)
```

### 2. 图标文档化

```typescript
// docs/icons.md
/**
 * 图标使用文档
 *
 * ## 导航图标
 * - i-ep-home: 首页
 * - i-ep-menu: 菜单
 * - i-ep-setting: 设置
 *
 * ## 操作图标
 * - i-ep-edit: 编辑
 * - i-ep-delete: 删除
 * - i-ep-plus: 添加
 *
 * ## 状态图标
 * - i-ep-success-filled: 成功
 * - i-ep-warning-filled: 警告
 * - i-ep-error-filled: 错误
 */
```

### 3. 版本管理

```json
// package.json
{
  "devDependencies": {
    "@iconify-json/ep": "^1.2.0",     // 锁定版本
    "@iconify/json": "^2.2.0",
    "@unocss/preset-icons": "^0.58.0"
  }
}
```

## 🎯 无障碍支持

### 1. 添加语义化标签

```vue
<template>
  <!-- ✅ 使用 aria-label -->
  <i class="i-ep-home" aria-label="首页" />

  <!-- ✅ 使用 title -->
  <i class="i-ep-setting" title="设置" />

  <!-- ✅ 使用 role -->
  <button>
    <i class="i-ep-delete" role="img" aria-label="删除" />
  </button>
</template>
```

### 2. 装饰性图标

```vue
<template>
  <!-- 纯装饰图标使用 aria-hidden -->
  <span>
    <i class="i-ep-star" aria-hidden="true" />
    评分: 5.0
  </span>
</template>
```

### 3. 交互图标

```vue
<template>
  <!-- 可交互图标提供完整的无障碍支持 -->
  <button
    class="icon-button"
    aria-label="关闭对话框"
    @click="handleClose"
  >
    <i class="i-ep-close" aria-hidden="true" />
  </button>
</template>
```

## 📋 常见问题

### 1. 图标不显示

```vue
<!-- 检查点 -->
<!-- 1. 确认图标代码正确 -->
<i class="i-ep-home" />  <!-- ✅ 正确 -->
<i class="i-ep-homes" /> <!-- ❌ 拼写错误 -->

<!-- 2. 确认已引入样式 -->
<style>
@import '@/assets/icons/system/iconfont.css';  /* Iconfont */
</style>

<!-- 3. 确认 UnoCSS 配置正确 -->
```

### 2. 图标样式异常

```vue
<template>
  <!-- 问题: 图标大小不一致 -->
  <!-- 解决: 设置基准线对齐 -->
  <i class="i-ep-home" style="vertical-align: middle" />
</template>

<style scoped>
/* 或全局设置 */
i[class^="i-"],
i[class*=" i-"],
.iconfont {
  vertical-align: middle;
  display: inline-block;
}
</style>
```

### 3. 图标颜色不变

```vue
<template>
  <!-- 问题: Iconfont 颜色不变 -->
  <!-- 原因: 样式优先级问题 -->

  <!-- ❌ 样式被覆盖 -->
  <i class="iconfont icon-home" style="color: red" />

  <!-- ✅ 提高优先级 -->
  <i class="iconfont icon-home custom-color" />
</template>

<style scoped>
.custom-color {
  color: red !important;
}
</style>
```

## ✅ 检查清单

开发前检查:
- [ ] 确认图标系统选择 (Iconify / Iconfont)
- [ ] 使用 TypeScript 类型定义
- [ ] 封装通用图标组件
- [ ] 定义图标尺寸标准

开发中检查:
- [ ] 图标语义化命名
- [ ] 使用 CSS 变量控制颜色
- [ ] 添加无障碍支持
- [ ] 避免硬编码样式

发布前检查:
- [ ] 清理未使用的图标
- [ ] 优化图标预设配置
- [ ] 检查图标显示效果
- [ ] 更新图标文档

## 🔗 相关文档

- [图标系统概述](./overview.md)
- [Iconify 配置](./iconify-config.md)
- [Iconfont 配置](./iconfont-config.md)
- [图标类型生成](./type-generation.md)
- [图标组件使用](./component-usage.md)
- [图标预设管理](./preset-management.md)

遵循这些最佳实践能够提高图标使用效率,保持代码质量和可维护性。
