# 图标系统 Icon System

## 介绍

RuoYi-Plus 前端项目采用双图标系统架构，整合 Iconfont 字体图标和 Iconify 图标方案，内置 817 个图标。

**核心特性:**

- **双图标系统** - 同时支持 Iconfont (644个) 和 Iconify (173个) 图标
- **类型安全** - 基于 TypeScript 的完整类型定义，提供代码提示和类型检查
- **自动类型生成** - Vite 插件自动生成 `IconCode` 类型定义
- **丰富尺寸系统** - 6 种预设尺寸 (xs/sm/md/lg/xl/2xl)
- **内置动画效果** - 6 种 CSS 动画 (shake/rotate180/moveUp/expand/shrink/breathing)
- **图标选择器** - 支持搜索和实时预览的 IconSelect 组件

## 架构设计

### 双图标系统对比

| 特性 | Iconfont | Iconify |
|------|----------|---------|
| 图标数量 | 644 | 173 |
| 加载方式 | 字体文件一次性加载 | SVG 按需加载 |
| 颜色支持 | 单色 | 多色 |
| 浏览器兼容 | 极好 | 现代浏览器 |
| 使用场景 | 常用图标 | 特殊图标 |

**选择建议:**
- 优先使用 Iconfont，性能好、兼容性强
- Iconfont 无合适图标时使用 Iconify
- 需要多色图标时使用 Iconify

### 文件结构

```
src/assets/icons/
├── system/               # 系统图标
│   ├── iconfont.css     # 字体样式
│   ├── iconfont.json    # 图标配置
│   ├── iconfont.woff2   # 字体文件
│   └── iconfont.ttf
└── iconify/
    └── preset.json      # Iconify 预设
```

### 类型系统

类型定义文件 `src/types/icons.d.ts` 由 Vite 插件自动生成:

```typescript
// 图标代码类型 (817 个)
type IconCode = 'account' | 'activity' | 'add' | ... | 'zip'

// 图标项接口
interface IconItem {
  code: string     // 图标代码
  name: string     // 中文名称
  type: 'iconfont' | 'iconify'
}

// 工具函数
declare const ALL_ICONS: readonly IconItem[]
declare function searchIcons(keyword: string): IconItem[]
declare function getIconName(code: string): string
declare function isIconfontIcon(code: string): boolean
```

## Icon 组件

### 基本用法

**使用 code 属性（推荐）:**

```vue
<template>
  <Icon code="user" />
  <Icon code="setting" />
  <Icon code="dashboard" />
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**使用 value 属性:**

```vue
<!-- Iconfont 图标 -->
<Icon value="user" />
<Icon value="icon-setting" />

<!-- Iconify 图标 (i- 前缀) -->
<Icon value="i-ep-user" />
<Icon value="i-mdi-home" />
```

### 尺寸系统

**预设尺寸:**

| 尺寸 | 大小 | 使用场景 |
|-----|------|---------|
| `xs` | 12px | 表格内图标 |
| `sm` | 14px | 按钮图标 |
| `md` | 16px | 常规图标（默认） |
| `lg` | 20px | 标题图标 |
| `xl` | 24px | 页面图标 |
| `2xl` | 32px | Logo |

```vue
<Icon code="user" size="xs" />
<Icon code="user" size="lg" />
<Icon code="user" :size="18" />
<Icon code="user" size="1.5rem" />
```

### 颜色配置

```vue
<!-- 十六进制颜色 -->
<Icon code="user" color="#409eff" />

<!-- CSS 变量 -->
<Icon code="success" color="var(--el-color-success)" />
<Icon code="warning" color="var(--el-color-warning)" />
<Icon code="error" color="var(--el-color-danger)" />
```

### 动画效果

| 动画 | 效果 | 使用场景 |
|-----|------|---------|
| `shake` | 左右抖动 | 错误/警告 |
| `rotate180` | 旋转180度 | 展开/收起 |
| `moveUp` | 上移渐显 | 加载完成 |
| `expand` | 放大 | 强调效果 |
| `shrink` | 缩小 | 淡出效果 |
| `breathing` | 呼吸缩放 | 加载中 |

```vue
<Icon code="warning" animate="shake" />
<Icon code="loading" animate="breathing" />
<Icon code="caret-down" animate="rotate180" />
```

### Props API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `code` | 图标代码（类型安全） | `IconCode` | - |
| `value` | 图标类名或 Iconify 图标 | `string` | - |
| `size` | 图标尺寸 | `SizePreset \| string \| number` | `md` |
| `color` | 图标颜色 | `string` | 继承父元素 |
| `animate` | 动画效果 | `AnimateType` | - |

## IconSelect 组件

### 基本用法

```vue
<template>
  <IconSelect v-model="selectedIcon" />
  <Icon v-if="selectedIcon" :code="selectedIcon as IconCode" size="xl" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const selectedIcon = ref('')
</script>
```

### 在表单中使用

```vue
<template>
  <el-form :model="form">
    <el-form-item label="菜单图标">
      <IconSelect v-model="form.icon" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const form = ref({ icon: 'dashboard' })
</script>
```

### 搜索功能

- 支持按图标代码搜索: `user` → user, users, user-add
- 支持按中文名称搜索: `用户` → 用户、用户组、用户设置
- 悬停显示图标名称和代码
- 选中图标高亮显示

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `modelValue` | 选中的图标代码 | `string` | `''` |
| `width` | 组件宽度 | `string` | `'400px'` |

## 图标库

### 常用 Iconfont 图标

**用户权限类:**
- `user` 用户、`users` 用户组、`role` 角色、`permission` 权限、`admin` 管理员、`department` 部门

**系统操作类:**
- `add` 新增、`edit` 编辑、`delete` 删除、`search` 搜索、`refresh` 刷新
- `download` 下载、`upload` 上传、`import` 导入、`export` 导出

**文件文档类:**
- `folder` 文件夹、`file` 文件、`word` Word、`excel` Excel、`pdf` PDF、`zip` 压缩包

**状态指示类:**
- `success` 成功、`error` 错误、`warning` 警告、`info` 信息、`finish` 完成

### 常用 Iconify 图标

**组件类:** `button` 按钮、`form` 表单、`input` 输入框、`select` 选择器

**图表类:** `chart` 图表、`pie-chart` 饼图、`bar-chart` 柱状图、`line-chart` 折线图

**导航类:** `dashboard` 仪表盘、`breadcrumb` 面包屑、`hamburger` 菜单

**社交类:** `wechat-fill` 微信、`weibo` 微博、`twitter` Twitter

### 自定义图标

**添加步骤:**

1. 从 Iconfont 下载图标文件
2. 放置到 `src/assets/icons/custom/` 目录
3. 在 `main.ts` 导入样式:
   ```typescript
   import '@/assets/icons/custom/iconfont.css'
   ```
4. 重启开发服务器，类型定义自动更新

## 类型定义

```typescript
// 尺寸预设
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 动画类型
type AnimateType = 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'

// Icon 组件属性
interface IconProps {
  code?: IconCode
  value?: string
  size?: SizePreset | string | number
  color?: string
  animate?: AnimateType
}

// IconSelect 组件属性
interface IconSelectProps {
  modelValue: string
  width?: string
}
```

## 最佳实践

### 1. 优先使用 code 属性

```vue
<!-- ✅ 推荐：类型安全 -->
<Icon code="user" />

<!-- ❌ 不推荐 -->
<Icon value="user" />
```

### 2. 预定义图标映射

```typescript
import type { IconCode } from '@/types/icons.d'

const iconMap: Record<string, IconCode> = {
  user: 'user',
  admin: 'admin',
  role: 'role',
}

// 使用
<Icon :code="iconMap[item.type]" />
```

### 3. 合理使用动画

```vue
<!-- ✅ 条件性启用动画 -->
<Icon code="refresh" :animate="isLoading ? 'breathing' : undefined" />

<!-- ❌ 避免大量动画图标 -->
<div v-for="item in 100" :key="item">
  <Icon code="loading" animate="breathing" />
</div>
```

### 4. IconSelect 懒加载

```typescript
const IconSelect = defineAsyncComponent(() =>
  import('@/components/Icon/IconSelect.vue')
)
```

### 5. 保持尺寸一致

```vue
<!-- ✅ 同一列表统一尺寸 -->
<li><Icon code="user" size="md" /> 用户</li>
<li><Icon code="role" size="md" /> 角色</li>
```

## 常见问题

### 1. 图标不显示

**检查项:**
- 字体文件是否加载成功（Network 面板）
- 图标代码是否存在
- CSS 样式是否被覆盖
- Iconify 网络请求是否成功

```typescript
// 确保导入样式
import '@/assets/icons/system/iconfont.css'
```

### 2. 类型提示不生效

**解决方案:**
- 重启 TypeScript 服务: `Ctrl+Shift+P → TypeScript: Restart TS Server`
- 检查 `src/types/icons.d.ts` 是否存在
- 重启开发服务器触发类型生成

### 3. 动画不生效

**检查项:**
- CSS 动画是否被禁用
- 样式是否被覆盖（避免 `animation: none !important`）
- 系统是否启用了"减少动画"

### 4. 图标颜色无法修改

**原因:**
- Iconify 多色图标不支持 color 修改
- CSS 优先级问题

```vue
<!-- 显式指定颜色 -->
<div style="color: black">
  <Icon code="user" color="#409eff" />
</div>
```

### 5. 自定义图标类型未更新

**解决方案:**
- 重启开发服务器
- 检查 `iconfont.json` 文件格式
- 确保图标代码不与系统图标重复

## 总结

图标系统核心要点:

1. **双系统架构** - Iconfont (644) + Iconify (173) = 817 个图标
2. **类型安全** - 使用 `code` 属性获得完整类型提示
3. **尺寸系统** - xs/sm/md/lg/xl/2xl 六种预设
4. **动画效果** - shake/rotate180/moveUp/expand/shrink/breathing
5. **图标选择器** - IconSelect 组件支持搜索和预览
