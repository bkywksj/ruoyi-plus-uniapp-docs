# 图标最佳实践

图标使用的最佳实践指南,涵盖选择、使用、优化和维护等方面,帮助开发者高效管理图标资源。本文档基于 Plus-UI 项目实际代码总结,提供经过验证的图标使用模式。

## 概述

图标是用户界面的重要组成部分,正确使用图标可以:

- **提升用户体验** - 帮助用户快速理解功能
- **增强视觉层次** - 创建清晰的视觉引导
- **保持界面一致性** - 统一的图标风格传达专业感
- **优化页面性能** - 合理的图标策略减少加载时间

本项目提供两套图标系统:

| 系统 | 图标数量 | 适用场景 | 渲染方式 |
|------|---------|---------|---------|
| **Iconify** | 173+ | 通用 UI 图标 | SVG (UnoCSS) |
| **Iconfont** | 644+ | 业务定制图标 | 字体 (CSS Font) |

## 图标选择策略

### 1. 选择合适的图标系统

根据图标用途选择合适的系统:

```vue
<template>
  <div class="icon-demo">
    <!-- ✅ 推荐: 通用图标使用 Iconify -->
    <i class="i-ep-home" />           <!-- 首页导航 -->
    <i class="i-ep-setting" />        <!-- 设置入口 -->
    <i class="i-ep-user" />           <!-- 用户中心 -->
    <i class="i-ep-search" />         <!-- 搜索功能 -->
    <i class="i-ep-plus" />           <!-- 新增操作 -->
    <i class="i-ep-edit" />           <!-- 编辑操作 -->
    <i class="i-ep-delete" />         <!-- 删除操作 -->

    <!-- ✅ 推荐: 业务专属图标使用 Iconfont -->
    <i class="iconfont icon-elevator3" />           <!-- 电梯设备 -->
    <i class="iconfont icon-equipment-setting2" />  <!-- 设备设置 -->
    <i class="iconfont icon-datacenter" />          <!-- 数据中心 -->
    <i class="iconfont icon-workflow" />            <!-- 工作流 -->
    <i class="iconfont icon-approve" />             <!-- 审批流程 -->
  </div>
</template>
```

**选择决策矩阵**:

| 场景 | 推荐系统 | 原因 |
|------|---------|------|
| 导航菜单 | Iconify | 标准化图标,易于识别 |
| 操作按钮 | Iconify | Element Plus 风格统一 |
| 状态指示 | Iconify | 语义化图标丰富 |
| 业务图标 | Iconfont | 定制化需求高 |
| 品牌图标 | Iconfont | 独特设计要求 |
| 行业专属 | Iconfont | 标准图标库缺失 |

### 2. 图标语义化选择

选择语义明确的图标,提升用户理解:

```vue
<template>
  <div class="semantic-icons">
    <!-- ✅ 语义化命名 - 状态图标 -->
    <i class="i-ep-success-filled" />  <!-- 成功状态 -->
    <i class="i-ep-warning-filled" />  <!-- 警告状态 -->
    <i class="i-ep-error-filled" />    <!-- 错误状态 -->
    <i class="i-ep-info-filled" />     <!-- 信息提示 -->

    <!-- ✅ 语义化命名 - 操作图标 -->
    <i class="i-ep-circle-check" />    <!-- 确认/选中 -->
    <i class="i-ep-circle-close" />    <!-- 取消/关闭 -->
    <i class="i-ep-refresh" />         <!-- 刷新/重试 -->
    <i class="i-ep-full-screen" />     <!-- 全屏 -->

    <!-- ❌ 避免无意义或模糊的命名 -->
    <!-- <i class="i-ep-aim" /> 不够直观,用户难以理解 -->
    <!-- <i class="i-ep-baseball" /> 与业务无关 -->
  </div>
</template>
```

**语义化选择原则**:

1. **动作明确** - 图标应直接表达功能意图
2. **文化通用** - 避免特定文化才能理解的符号
3. **一致性** - 相同功能使用相同图标
4. **可识别性** - 用户能快速识别图标含义

### 3. 图标风格一致性

保持整个应用图标风格统一:

```vue
<template>
  <div class="style-consistency">
    <!-- ✅ 风格一致 - 全部使用 Element Plus 图标集 -->
    <nav class="sidebar">
      <a><i class="i-ep-home" /> 首页</a>
      <a><i class="i-ep-menu" /> 菜单</a>
      <a><i class="i-ep-setting" /> 设置</a>
      <a><i class="i-ep-user" /> 用户</a>
    </nav>

    <!-- ❌ 风格混乱 - 混用不同风格图标集 -->
    <!--
    <nav class="sidebar-bad">
      <a><i class="i-ep-home" /> 首页</a>          // Element Plus
      <a><i class="i-mdi-account" /> 用户</a>     // Material Design
      <a><i class="i-carbon-settings" /> 设置</a> // Carbon
      <a><i class="i-fa-bars" /> 菜单</a>         // Font Awesome
    </nav>
    -->
  </div>
</template>
```

**风格统一指南**:

| 应用区域 | 推荐图标集 | 备选方案 |
|---------|-----------|---------|
| 管理后台 | Element Plus (ep) | Ant Design (ant-design) |
| 移动端 | Carbon (carbon) | Material Design (mdi) |
| 工具类 | Carbon (carbon) | Lucide (lucide) |
| 社交媒体 | Simple Icons (simple-icons) | - |

### 4. 图标选择流程

```text
┌─────────────────────────────────────────────────────────────┐
│                     图标选择决策流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 确定功能需求                                              │
│     └──→ 这个图标代表什么功能/状态?                           │
│                                                              │
│  2. 检查现有图标                                              │
│     ├──→ Iconify 预设 (173个) 是否有合适的?                  │
│     └──→ Iconfont 图标 (644个) 是否有合适的?                  │
│                                                              │
│  3. 选择图标系统                                              │
│     ├──→ 通用 UI → Iconify                                   │
│     └──→ 业务定制 → Iconfont                                 │
│                                                              │
│  4. 验证一致性                                                │
│     └──→ 与现有图标风格是否一致?                              │
│                                                              │
│  5. 测试可用性                                                │
│     └──→ 用户能否快速理解图标含义?                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 类型安全实践

### 1. 使用 TypeScript 类型定义

项目提供完整的图标类型系统,确保类型安全:

```typescript
// ✅ 推荐: 使用类型定义
import type { IconCode } from '@/types/icons'
import { isIconfontIcon, isIconifyIcon, searchIcons } from '@/types/icons.d'

// 类型安全的图标状态
const currentIcon = ref<IconCode>('i-ep-home')

// 类型安全的图标列表
const menuIcons: IconCode[] = [
  'i-ep-home',
  'i-ep-menu',
  'i-ep-setting',
  'i-ep-user'
]

// 类型安全的图标配置
interface MenuItem {
  title: string
  icon: IconCode
  path: string
}

const menuItems: MenuItem[] = [
  { title: '首页', icon: 'i-ep-home', path: '/' },
  { title: '设置', icon: 'i-ep-setting', path: '/settings' }
]
```

```typescript
// ❌ 避免: 字符串硬编码
const icon = ref('i-ep-home')  // 无类型检查,可能拼写错误

// ❌ 避免: 使用 any 类型
const icons: any[] = ['i-ep-home', 'i-ep-user']
```

### 2. 图标类型检查函数

使用内置的类型检查函数确定图标类型:

```typescript
import {
  isIconfontIcon,
  isIconifyIcon,
  isValidIconCode,
  getIconName,
  searchIcons
} from '@/types/icons.d'

// 检查图标是否为 Iconfont 类型
const checkIconType = (code: string) => {
  if (isIconfontIcon(code)) {
    console.log(`${code} 是 Iconfont 图标`)
    // 使用 font-size 控制大小
  } else if (isIconifyIcon(code)) {
    console.log(`${code} 是 Iconify 图标`)
    // 使用 width/height 控制大小
  } else {
    console.log(`${code} 未知类型`)
  }
}

// 验证图标代码是否有效
const validateIcon = (code: string): boolean => {
  return isValidIconCode(code)
}

// 获取图标的中文名称
const getChineseName = (code: IconCode): string => {
  return getIconName(code) // 如: "i-ep-home" → "首页"
}

// 搜索图标
const findIcons = (keyword: string) => {
  const results = searchIcons(keyword)
  console.log(`找到 ${results.length} 个匹配图标`)
  return results
}
```

### 3. 类型安全的组件 Props

定义组件时使用严格的图标类型:

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

interface ButtonProps {
  /** 按钮图标 */
  icon?: IconCode
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
  /** 仅图标模式 */
  iconOnly?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  iconPosition: 'left',
  iconOnly: false
})
</script>

<template>
  <button class="custom-button" :class="{ 'icon-only': iconOnly }">
    <Icon v-if="icon && iconPosition === 'left'" :code="icon" />
    <span v-if="!iconOnly"><slot /></span>
    <Icon v-if="icon && iconPosition === 'right'" :code="icon" />
  </button>
</template>
```

### 4. 动态图标的类型安全

处理动态图标时保持类型安全:

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

// 状态图标映射 - 类型安全
const statusIconMap: Record<string, IconCode> = {
  success: 'i-ep-success-filled',
  warning: 'i-ep-warning-filled',
  error: 'i-ep-error-filled',
  info: 'i-ep-info-filled',
  pending: 'i-ep-loading'
}

// 当前状态
const status = ref<keyof typeof statusIconMap>('success')

// 计算当前状态图标 - 类型安全
const statusIcon = computed<IconCode>(() => {
  return statusIconMap[status.value]
})

// 状态颜色映射
const statusColorMap: Record<keyof typeof statusIconMap, string> = {
  success: 'var(--el-color-success)',
  warning: 'var(--el-color-warning)',
  error: 'var(--el-color-error)',
  info: 'var(--el-color-info)',
  pending: 'var(--el-color-primary)'
}
</script>

<template>
  <div class="status-display">
    <Icon
      :code="statusIcon"
      :color="statusColorMap[status]"
      size="lg"
    />
    <span>{{ status }}</span>
  </div>
</template>
```

## 组件封装规范

### 1. 使用 Icon 统一组件

项目提供统一的 Icon 组件,支持两种图标系统:

```vue
<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
</script>

<template>
  <div class="icon-examples">
    <!-- ✅ 推荐: 使用 Icon 组件 -->
    <!-- 通过 code 属性 - 自动识别图标类型 -->
    <Icon code="home" :size="24" color="#409eff" />
    <Icon code="battery" :size="24" color="#67c23a" />

    <!-- 通过 value 属性 - 直接指定图标类名 -->
    <Icon value="i-ep-home" size="lg" />
    <Icon value="iconfont icon-elevator3" size="lg" />

    <!-- 预设尺寸 -->
    <Icon code="search" size="xs" />  <!-- 12px -->
    <Icon code="search" size="sm" />  <!-- 16px -->
    <Icon code="search" size="md" />  <!-- 20px -->
    <Icon code="search" size="lg" />  <!-- 24px -->
    <Icon code="search" size="xl" />  <!-- 32px -->
    <Icon code="search" size="2xl" /> <!-- 40px -->

    <!-- 自定义尺寸 -->
    <Icon code="search" size="28px" />
    <Icon code="search" :size="36" />

    <!-- 动画效果 -->
    <Icon code="search" animate="shake" />
    <Icon code="refresh" animate="rotate180" />
    <Icon code="notification" animate="breathing" />
  </div>
</template>
```

```vue
<!-- ❌ 避免: 重复写内联样式 -->
<template>
  <div class="bad-example">
    <i class="i-ep-home" style="font-size: 24px; color: #409eff" />
    <i class="i-ep-menu" style="font-size: 24px; color: #409eff" />
    <i class="i-ep-user" style="font-size: 24px; color: #409eff" />
    <i class="i-ep-setting" style="font-size: 24px; color: #409eff" />
  </div>
</template>
```

### 2. Icon 组件工作原理

Icon 组件自动识别图标类型并选择正确的渲染方式:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Icon 组件渲染流程                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  输入: code="battery" 或 value="i-ep-home"                  │
│                                                              │
│  ┌────────────────────┐                                      │
│  │  1. 解析输入参数    │                                      │
│  └─────────┬──────────┘                                      │
│            │                                                 │
│            ▼                                                 │
│  ┌────────────────────┐                                      │
│  │  2. 判断图标类型    │                                      │
│  │  isIconfontIcon()  │                                      │
│  │  isIconifyIcon()   │                                      │
│  └─────────┬──────────┘                                      │
│            │                                                 │
│      ┌─────┴─────┐                                           │
│      ▼           ▼                                           │
│  ┌────────┐  ┌────────┐                                      │
│  │Iconfont│  │Iconify │                                      │
│  └────┬───┘  └────┬───┘                                      │
│       │           │                                          │
│       ▼           ▼                                          │
│  ┌─────────────────────────────────────┐                     │
│  │  3. 生成对应的 CSS 类名              │                     │
│  │  Iconfont: "iconfont icon-{code}"   │                     │
│  │  Iconify:  "i-{collection}-{name}"  │                     │
│  └─────────────────────────────────────┘                     │
│                                                              │
│  输出:                                                       │
│  Iconfont: <div class="iconfont icon-battery" />            │
│  Iconify:  <div class="i-ep-home" />                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. 图标按钮组件封装

封装常用的图标按钮组件:

```vue
<!-- components/IconButton/IconButton.vue -->
<script setup lang="ts">
import type { IconCode } from '@/types/icons'
import Icon from '@/components/Icon/Icon.vue'

interface IconButtonProps {
  /** 图标代码 */
  icon: IconCode
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 按钮尺寸 */
  size?: 'small' | 'default' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否为加载状态 */
  loading?: boolean
  /** 是否为圆形按钮 */
  circle?: boolean
  /** 提示文本 */
  tooltip?: string
}

const props = withDefaults(defineProps<IconButtonProps>(), {
  type: 'primary',
  size: 'default',
  disabled: false,
  loading: false,
  circle: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 计算图标尺寸
const iconSize = computed(() => {
  const sizeMap = { small: 'sm', default: 'md', large: 'lg' }
  return sizeMap[props.size]
})

// 处理点击
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <el-tooltip v-if="tooltip" :content="tooltip" placement="top">
    <el-button
      :type="type"
      :size="size"
      :disabled="disabled"
      :loading="loading"
      :circle="circle"
      @click="handleClick"
    >
      <Icon v-if="!loading" :code="icon" :size="iconSize" />
    </el-button>
  </el-tooltip>

  <el-button
    v-else
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :circle="circle"
    @click="handleClick"
  >
    <Icon v-if="!loading" :code="icon" :size="iconSize" />
  </el-button>
</template>
```

使用封装的组件:

```vue
<template>
  <div class="button-group">
    <IconButton icon="i-ep-plus" tooltip="新增" @click="handleAdd" />
    <IconButton icon="i-ep-edit" type="warning" tooltip="编辑" @click="handleEdit" />
    <IconButton icon="i-ep-delete" type="danger" tooltip="删除" @click="handleDelete" />
    <IconButton icon="i-ep-refresh" :loading="loading" tooltip="刷新" @click="handleRefresh" />
  </div>
</template>
```

### 4. 图标选择器组件

项目提供 IconSelect 组件用于图标选择:

```vue
<script setup lang="ts">
import IconSelect from '@/components/Icon/IconSelect.vue'

const selectedIcon = ref('')

// 监听图标变化
watch(selectedIcon, (newIcon) => {
  console.log('选中的图标:', newIcon)
})
</script>

<template>
  <div class="icon-select-demo">
    <el-form-item label="菜单图标">
      <IconSelect
        v-model="selectedIcon"
        width="300px"
        empty-value="#"
      />
    </el-form-item>

    <div v-if="selectedIcon" class="preview">
      <span>预览:</span>
      <Icon :code="selectedIcon" size="lg" />
    </div>
  </div>
</template>
```

**IconSelect 特性**:

- 支持图标搜索(按代码或名称)
- 实时预览悬停图标
- 显示图标中文名称
- 支持清空选择
- 可配置空值(如菜单图标需要 `#`)

## 动态图标处理

### 1. 条件渲染优化

使用计算属性代替多个 v-if:

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

// ✅ 推荐: 使用计算属性和映射
const status = ref<'success' | 'warning' | 'error' | 'info'>('success')

const statusConfig = computed(() => {
  const configs: Record<typeof status.value, { icon: IconCode; color: string; text: string }> = {
    success: { icon: 'i-ep-success-filled', color: 'var(--el-color-success)', text: '成功' },
    warning: { icon: 'i-ep-warning-filled', color: 'var(--el-color-warning)', text: '警告' },
    error: { icon: 'i-ep-error-filled', color: 'var(--el-color-error)', text: '错误' },
    info: { icon: 'i-ep-info-filled', color: 'var(--el-color-info)', text: '信息' }
  }
  return configs[status.value]
})
</script>

<template>
  <!-- ✅ 推荐: 单个动态绑定 -->
  <div class="status-badge" :style="{ color: statusConfig.color }">
    <Icon :code="statusConfig.icon" size="sm" />
    <span>{{ statusConfig.text }}</span>
  </div>
</template>
```

```vue
<!-- ❌ 避免: 多个 v-if 判断 -->
<template>
  <div class="status-badge-bad">
    <template v-if="status === 'success'">
      <i class="i-ep-success-filled" style="color: var(--el-color-success)" />
      <span>成功</span>
    </template>
    <template v-else-if="status === 'warning'">
      <i class="i-ep-warning-filled" style="color: var(--el-color-warning)" />
      <span>警告</span>
    </template>
    <template v-else-if="status === 'error'">
      <i class="i-ep-error-filled" style="color: var(--el-color-error)" />
      <span>错误</span>
    </template>
    <template v-else>
      <i class="i-ep-info-filled" style="color: var(--el-color-info)" />
      <span>信息</span>
    </template>
  </div>
</template>
```

### 2. 列表图标渲染

优化列表中的图标渲染:

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

interface MenuItem {
  id: string
  title: string
  icon: IconCode
  children?: MenuItem[]
}

const menuItems = ref<MenuItem[]>([
  { id: '1', title: '首页', icon: 'i-ep-home' },
  { id: '2', title: '用户管理', icon: 'i-ep-user', children: [
    { id: '2-1', title: '用户列表', icon: 'i-ep-list' },
    { id: '2-2', title: '角色管理', icon: 'i-ep-key' }
  ]},
  { id: '3', title: '系统设置', icon: 'i-ep-setting' }
])
</script>

<template>
  <el-menu>
    <template v-for="item in menuItems" :key="item.id">
      <!-- 有子菜单 -->
      <el-sub-menu v-if="item.children?.length" :index="item.id">
        <template #title>
          <Icon :code="item.icon" size="sm" class="mr-2" />
          <span>{{ item.title }}</span>
        </template>
        <el-menu-item
          v-for="child in item.children"
          :key="child.id"
          :index="child.id"
        >
          <Icon :code="child.icon" size="sm" class="mr-2" />
          <span>{{ child.title }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 无子菜单 -->
      <el-menu-item v-else :index="item.id">
        <Icon :code="item.icon" size="sm" class="mr-2" />
        <span>{{ item.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>
```

### 3. 表格操作图标

表格操作列的图标处理:

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

// 操作配置类型
interface ActionConfig {
  icon: IconCode
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  tooltip: string
  permission?: string
  handler: (row: any) => void
}

// 表格操作配置
const actions: ActionConfig[] = [
  {
    icon: 'i-ep-view',
    type: 'primary',
    tooltip: '查看详情',
    handler: (row) => handleView(row)
  },
  {
    icon: 'i-ep-edit',
    type: 'warning',
    tooltip: '编辑',
    permission: 'system:user:edit',
    handler: (row) => handleEdit(row)
  },
  {
    icon: 'i-ep-delete',
    type: 'danger',
    tooltip: '删除',
    permission: 'system:user:remove',
    handler: (row) => handleDelete(row)
  }
]

// 检查权限
const hasPermission = (permission?: string) => {
  if (!permission) return true
  // 实际权限检查逻辑
  return true
}
</script>

<template>
  <el-table :data="tableData">
    <el-table-column label="操作" width="180" fixed="right">
      <template #default="{ row }">
        <template v-for="action in actions" :key="action.icon">
          <el-tooltip
            v-if="hasPermission(action.permission)"
            :content="action.tooltip"
            placement="top"
          >
            <el-button
              link
              :type="action.type"
              @click="action.handler(row)"
            >
              <Icon :code="action.icon" />
            </el-button>
          </el-tooltip>
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>
```

## 样式规范

### 1. 尺寸标准化

定义统一的图标尺寸变量:

```scss
// styles/variables/icons.scss

// 图标尺寸定义
:root {
  // 基础尺寸
  --icon-xs: 12px;   // 极小图标
  --icon-sm: 14px;   // 小图标
  --icon-md: 16px;   // 默认图标
  --icon-lg: 20px;   // 大图标
  --icon-xl: 24px;   // 特大图标
  --icon-2xl: 32px;  // 超大图标

  // 场景尺寸
  --icon-button: 14px;      // 按钮内图标
  --icon-input: 16px;       // 输入框图标
  --icon-menu: 18px;        // 菜单图标
  --icon-title: 24px;       // 标题图标
  --icon-empty: 48px;       // 空状态图标
  --icon-logo: 32px;        // Logo 图标
}

// 图标尺寸类
.icon-xs { font-size: var(--icon-xs) !important; width: var(--icon-xs); height: var(--icon-xs); }
.icon-sm { font-size: var(--icon-sm) !important; width: var(--icon-sm); height: var(--icon-sm); }
.icon-md { font-size: var(--icon-md) !important; width: var(--icon-md); height: var(--icon-md); }
.icon-lg { font-size: var(--icon-lg) !important; width: var(--icon-lg); height: var(--icon-lg); }
.icon-xl { font-size: var(--icon-xl) !important; width: var(--icon-xl); height: var(--icon-xl); }
.icon-2xl { font-size: var(--icon-2xl) !important; width: var(--icon-2xl); height: var(--icon-2xl); }
```

使用标准尺寸:

```vue
<template>
  <div class="size-demo">
    <!-- ✅ 使用标准尺寸类 -->
    <i class="i-ep-home icon-md" />
    <i class="i-ep-menu icon-lg" />
    <i class="i-ep-setting icon-xl" />

    <!-- ✅ 使用 Icon 组件预设尺寸 -->
    <Icon code="i-ep-home" size="md" />
    <Icon code="i-ep-menu" size="lg" />
    <Icon code="i-ep-setting" size="xl" />

    <!-- ❌ 避免随意尺寸 -->
    <!-- <i class="i-ep-home" style="font-size: 17px" /> -->
    <!-- <i class="i-ep-menu" style="font-size: 23px" /> -->
  </div>
</template>
```

### 2. 颜色主题化

使用 CSS 变量控制图标颜色:

```vue
<template>
  <div class="color-demo">
    <!-- ✅ 使用 CSS 变量 -->
    <i class="i-ep-home" style="color: var(--el-color-primary)" />
    <i class="i-ep-check" style="color: var(--el-color-success)" />
    <i class="i-ep-warning" style="color: var(--el-color-warning)" />
    <i class="i-ep-close" style="color: var(--el-color-danger)" />

    <!-- ✅ 使用工具类 -->
    <i class="i-ep-home text-primary" />
    <i class="i-ep-check text-success" />
    <i class="i-ep-warning text-warning" />
    <i class="i-ep-close text-danger" />

    <!-- ✅ 使用 Icon 组件 color 属性 -->
    <Icon code="i-ep-home" color="var(--el-color-primary)" />

    <!-- ❌ 避免硬编码颜色 -->
    <!-- <i class="i-ep-home" style="color: #409eff" /> -->
    <!-- <i class="i-ep-check" style="color: #67c23a" /> -->
  </div>
</template>
```

**颜色变量对照**:

| 语义 | CSS 变量 | 工具类 |
|-----|---------|-------|
| 主要 | `var(--el-color-primary)` | `text-primary` |
| 成功 | `var(--el-color-success)` | `text-success` |
| 警告 | `var(--el-color-warning)` | `text-warning` |
| 危险 | `var(--el-color-danger)` | `text-danger` |
| 信息 | `var(--el-color-info)` | `text-info` |
| 常规 | `var(--el-text-color-regular)` | `text-regular` |
| 次要 | `var(--el-text-color-secondary)` | `text-secondary` |
| 占位 | `var(--el-text-color-placeholder)` | `text-placeholder` |

### 3. 图标对齐处理

解决图标与文字对齐问题:

```scss
// 全局图标对齐样式
i[class^="i-"],
i[class*=" i-"],
.iconfont {
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// 与文字组合时的间距
.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  i, .icon {
    flex-shrink: 0;
  }
}

// 按钮内图标对齐
.el-button {
  i[class^="i-"],
  i[class*=" i-"],
  .iconfont {
    margin-right: 4px;

    &:last-child {
      margin-right: 0;
      margin-left: 4px;
    }

    &:only-child {
      margin: 0;
    }
  }
}
```

```vue
<template>
  <div class="alignment-demo">
    <!-- ✅ 使用 flex 对齐 -->
    <span class="icon-text">
      <i class="i-ep-location" />
      <span>北京市</span>
    </span>

    <!-- ✅ 按钮内图标 -->
    <el-button type="primary">
      <i class="i-ep-plus" />
      <span>新增</span>
    </el-button>

    <!-- ✅ 使用 Icon 组件(自带对齐) -->
    <span class="inline-flex items-center gap-1">
      <Icon code="i-ep-location" size="sm" />
      <span>北京市</span>
    </span>
  </div>
</template>
```

### 4. 响应式图标

根据屏幕尺寸调整图标大小:

```vue
<template>
  <i class="responsive-icon i-ep-home" />
</template>

<style scoped>
.responsive-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
  transition: all 0.2s ease;

  /* 平板端 */
  @media (max-width: 768px) {
    font-size: 14px;
    width: 14px;
    height: 14px;
  }

  /* 大屏幕 */
  @media (min-width: 1200px) {
    font-size: 20px;
    width: 20px;
    height: 20px;
  }

  /* 超大屏幕 */
  @media (min-width: 1920px) {
    font-size: 24px;
    width: 24px;
    height: 24px;
  }
}
</style>
```

## 性能优化

### 1. 按需预设图标

只预设实际使用的图标,减少打包体积:

```typescript
// vite.config.ts - UnoCSS 配置
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      // ✅ 推荐: 仅预设常用图标
      safelist: [
        // 导航图标
        'i-ep-home',
        'i-ep-menu',
        'i-ep-setting',
        'i-ep-user',

        // 操作图标
        'i-ep-plus',
        'i-ep-edit',
        'i-ep-delete',
        'i-ep-refresh',
        'i-ep-search',

        // 状态图标
        'i-ep-success-filled',
        'i-ep-warning-filled',
        'i-ep-error-filled',
        'i-ep-info-filled',

        // 方向图标
        'i-ep-arrow-up',
        'i-ep-arrow-down',
        'i-ep-arrow-left',
        'i-ep-arrow-right'
      ]
    })
  ]
})
```

```typescript
// ❌ 避免: 预设所有图标
import { ICONIFY_ICONS } from '@/types/icons'

export default defineConfig({
  plugins: [
    UnoCSS({
      // 这会预设 173 个图标,大部分可能未使用
      safelist: ICONIFY_ICONS.map(i => i.value)
    })
  ]
})
```

### 2. 图标懒加载

对于非首屏图标,使用懒加载:

```vue
<script setup lang="ts">
import { defineAsyncComponent, Suspense } from 'vue'

// 懒加载 Icon 组件
const IconLazy = defineAsyncComponent(() =>
  import('@/components/Icon/Icon.vue')
)

// 懒加载 IconSelect 组件
const IconSelectLazy = defineAsyncComponent(() =>
  import('@/components/Icon/IconSelect.vue')
)
</script>

<template>
  <div class="lazy-demo">
    <!-- 懒加载图标组件 -->
    <Suspense>
      <template #default>
        <IconLazy code="i-ep-home" size="lg" />
      </template>
      <template #fallback>
        <span class="icon-placeholder" />
      </template>
    </Suspense>

    <!-- 懒加载图标选择器 -->
    <Suspense>
      <template #default>
        <IconSelectLazy v-model="selectedIcon" />
      </template>
      <template #fallback>
        <el-input placeholder="加载中..." disabled />
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.icon-placeholder {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
```

### 3. 减少重复渲染

使用 `v-once` 优化静态图标:

```vue
<template>
  <div class="list-demo">
    <!-- ✅ 静态图标使用 v-once -->
    <div v-for="item in list" :key="item.id" class="list-item">
      <i v-once :class="item.icon" />  <!-- 图标不会变化时使用 v-once -->
      <span>{{ item.name }}</span>      <!-- 动态内容正常渲染 -->
      <span>{{ item.count }}</span>
    </div>

    <!-- ✅ 使用 v-memo 优化 -->
    <div
      v-for="item in list"
      :key="item.id"
      v-memo="[item.icon]"
      class="list-item"
    >
      <i :class="item.icon" />
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>
```

### 4. Iconfont 字体优化

优化字体加载性能:

```css
/* 使用 font-display: swap 避免字体阻塞 */
@font-face {
  font-family: "iconfont";
  src: url('iconfont.woff2') format('woff2'),
       url('iconfont.woff') format('woff'),
       url('iconfont.ttf') format('truetype');
  font-display: swap;
}
```

```html
<!-- index.html - 预加载字体文件 -->
<head>
  <link
    rel="preload"
    href="/fonts/iconfont.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
</head>
```

### 5. 图标精灵图(可选)

对于超大量图标场景,可考虑 SVG 精灵图:

```vue
<script setup lang="ts">
// SVG 精灵图引用方式
const iconHref = (name: string) => `#icon-${name}`
</script>

<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="iconHref('home')" />
  </svg>
</template>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}
</style>
```

## 图标维护

### 1. 未使用图标清理

定期清理未使用的图标:

```typescript
// scripts/clean-unused-icons.ts
import { globSync } from 'glob'
import fs from 'fs'
import path from 'path'

// 导入图标列表
import { ICONIFY_ICONS, ICONFONT_ICONS } from '../src/types/icons.d'

/**
 * 扫描项目中使用的图标
 */
function scanUsedIcons(): Set<string> {
  const usedIcons = new Set<string>()

  // 扫描所有 Vue 和 TypeScript 文件
  const files = globSync('src/**/*.{vue,ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**']
  })

  // 图标匹配模式
  const iconPatterns = [
    /i-ep-[\w-]+/g,           // Iconify 图标
    /icon-[\w-]+/g,           // Iconfont 图标
    /code="([\w-]+)"/g,       // Icon 组件 code 属性
    /value="(i-[\w-]+)"/g     // Icon 组件 value 属性
  ]

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')

    iconPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        usedIcons.add(match[0] || match[1])
      }
    })
  })

  return usedIcons
}

/**
 * 分析未使用的图标
 */
function analyzeUnusedIcons() {
  const usedIcons = scanUsedIcons()

  const allIcons = [
    ...ICONIFY_ICONS.map(i => i.value),
    ...ICONFONT_ICONS.map(i => `icon-${i.code}`)
  ]

  const unusedIcons = allIcons.filter(icon => !usedIcons.has(icon))

  console.log('=== 图标使用分析 ===')
  console.log(`总图标数: ${allIcons.length}`)
  console.log(`已使用: ${usedIcons.size}`)
  console.log(`未使用: ${unusedIcons.length}`)
  console.log('')
  console.log('未使用的图标:')
  unusedIcons.forEach(icon => console.log(`  - ${icon}`))

  // 输出报告
  const report = {
    total: allIcons.length,
    used: usedIcons.size,
    unused: unusedIcons.length,
    unusedList: unusedIcons,
    scanTime: new Date().toISOString()
  }

  fs.writeFileSync(
    'unused-icons-report.json',
    JSON.stringify(report, null, 2)
  )

  console.log('')
  console.log('报告已保存到 unused-icons-report.json')
}

analyzeUnusedIcons()
```

运行清理脚本:

```bash
npx tsx scripts/clean-unused-icons.ts
```

### 2. 图标文档化

维护图标使用文档:

```typescript
/**
 * 图标使用规范文档
 *
 * ## 导航图标
 * | 图标代码 | 用途 | 使用位置 |
 * |---------|------|---------|
 * | i-ep-home | 首页 | 侧边栏菜单 |
 * | i-ep-menu | 菜单 | 面包屑、导航 |
 * | i-ep-setting | 设置 | 系统设置入口 |
 * | i-ep-user | 用户 | 个人中心入口 |
 *
 * ## 操作图标
 * | 图标代码 | 用途 | 使用位置 |
 * |---------|------|---------|
 * | i-ep-plus | 新增 | 工具栏按钮 |
 * | i-ep-edit | 编辑 | 表格操作列 |
 * | i-ep-delete | 删除 | 表格操作列 |
 * | i-ep-view | 查看 | 表格操作列 |
 * | i-ep-download | 下载 | 导出功能 |
 * | i-ep-upload | 上传 | 导入功能 |
 *
 * ## 状态图标
 * | 图标代码 | 用途 | 颜色 |
 * |---------|------|------|
 * | i-ep-success-filled | 成功状态 | --el-color-success |
 * | i-ep-warning-filled | 警告状态 | --el-color-warning |
 * | i-ep-error-filled | 错误状态 | --el-color-danger |
 * | i-ep-info-filled | 信息提示 | --el-color-info |
 *
 * ## 业务图标 (Iconfont)
 * | 图标代码 | 用途 | 分类 |
 * |---------|------|------|
 * | icon-elevator3 | 电梯设备 | 设备类 |
 * | icon-datacenter | 数据中心 | 系统类 |
 * | icon-workflow | 工作流 | 流程类 |
 * | icon-approve | 审批 | 流程类 |
 */
```

### 3. 版本管理

锁定图标依赖版本:

```json
// package.json
{
  "devDependencies": {
    "@iconify-json/ep": "^1.2.0",
    "@iconify/json": "^2.2.0",
    "@unocss/preset-icons": "^0.58.0"
  }
}
```

更新图标依赖的流程:

```bash
# 1. 检查可用更新
pnpm outdated @iconify-json/ep @iconify/json

# 2. 在开发分支更新
git checkout -b feat/update-icons
pnpm update @iconify-json/ep @iconify/json

# 3. 运行类型生成验证
pnpm build

# 4. 测试图标显示
pnpm dev

# 5. 提交更新
git add package.json pnpm-lock.yaml
git commit -m "chore: 更新图标依赖"
```

### 4. Iconfont 更新流程

从 Iconfont 平台更新图标的标准流程:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Iconfont 更新流程                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 登录 Iconfont 平台                                       │
│     └──→ https://www.iconfont.cn/                           │
│                                                              │
│  2. 进入项目 "plus-ui" (ID: 5022572)                        │
│     └──→ 添加/删除/修改图标                                  │
│                                                              │
│  3. 下载更新后的字体文件                                      │
│     └──→ iconfont.css                                        │
│     └──→ iconfont.json                                       │
│     └──→ iconfont.woff2                                      │
│     └──→ iconfont.woff                                       │
│     └──→ iconfont.ttf                                        │
│                                                              │
│  4. 替换本地文件                                              │
│     └──→ src/assets/icons/system/                           │
│                                                              │
│  5. 重新生成类型定义                                          │
│     └──→ pnpm build (触发 iconfont-types 插件)              │
│                                                              │
│  6. 验证更新                                                  │
│     └──→ 检查 icons.d.ts 类型定义                            │
│     └──→ 测试新图标显示                                      │
│                                                              │
│  7. 提交变更                                                  │
│     └──→ git add src/assets/icons/ src/types/icons.d.ts     │
│     └──→ git commit -m "feat: 更新 Iconfont 图标"           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 无障碍支持

### 1. 语义化标签

为图标添加无障碍属性:

```vue
<template>
  <div class="a11y-demo">
    <!-- ✅ 功能性图标 - 使用 aria-label -->
    <button aria-label="关闭对话框">
      <i class="i-ep-close" aria-hidden="true" />
    </button>

    <!-- ✅ 信息性图标 - 使用 role 和 aria-label -->
    <i
      class="i-ep-warning-filled"
      role="img"
      aria-label="警告"
      style="color: var(--el-color-warning)"
    />

    <!-- ✅ 带文本的图标 - 使用 title -->
    <span title="用户设置">
      <i class="i-ep-setting" aria-hidden="true" />
      设置
    </span>

    <!-- ✅ 状态指示图标 -->
    <span class="status-indicator" role="status" aria-live="polite">
      <i
        class="i-ep-success-filled"
        aria-hidden="true"
      />
      <span class="sr-only">操作成功</span>
    </span>
  </div>
</template>

<style scoped>
/* 屏幕阅读器专用文本 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

### 2. 装饰性图标

纯装饰性图标应隐藏于无障碍树:

```vue
<template>
  <div class="decorative-demo">
    <!-- ✅ 装饰性图标使用 aria-hidden -->
    <h2>
      <i class="i-ep-star" aria-hidden="true" />
      热门推荐
    </h2>

    <p>
      <i class="i-ep-location" aria-hidden="true" />
      北京市朝阳区
    </p>

    <!-- ✅ 评分显示 - 图标装饰,文本表达含义 -->
    <div class="rating" aria-label="评分 4.5 分(满分 5 分)">
      <i class="i-ep-star-filled" aria-hidden="true" />
      <i class="i-ep-star-filled" aria-hidden="true" />
      <i class="i-ep-star-filled" aria-hidden="true" />
      <i class="i-ep-star-filled" aria-hidden="true" />
      <i class="i-ep-star" aria-hidden="true" />
      <span class="sr-only">4.5 分</span>
    </div>
  </div>
</template>
```

### 3. 交互图标按钮

可交互的图标按钮需要完整的无障碍支持:

```vue
<script setup lang="ts">
const isExpanded = ref(false)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="interactive-demo">
    <!-- ✅ 图标按钮完整的无障碍支持 -->
    <button
      class="icon-button"
      :aria-label="isExpanded ? '收起面板' : '展开面板'"
      :aria-expanded="isExpanded"
      aria-controls="panel-content"
      @click="toggleExpand"
    >
      <i
        :class="isExpanded ? 'i-ep-arrow-up' : 'i-ep-arrow-down'"
        aria-hidden="true"
      />
    </button>

    <div
      id="panel-content"
      v-show="isExpanded"
      role="region"
      aria-labelledby="panel-title"
    >
      <h3 id="panel-title">面板内容</h3>
      <p>这里是可展开的内容区域</p>
    </div>

    <!-- ✅ 删除按钮 -->
    <button
      class="delete-button"
      aria-label="删除项目"
      @click="handleDelete"
    >
      <i class="i-ep-delete" aria-hidden="true" />
    </button>

    <!-- ✅ 加载状态按钮 -->
    <button
      class="refresh-button"
      :aria-label="loading ? '正在刷新' : '刷新数据'"
      :aria-busy="loading"
      :disabled="loading"
      @click="handleRefresh"
    >
      <i
        :class="loading ? 'i-ep-loading' : 'i-ep-refresh'"
        :class="{ 'animate-spin': loading }"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<style scoped>
.icon-button,
.delete-button,
.refresh-button {
  /* 确保可点击区域足够大 (最小 44x44px) */
  min-width: 44px;
  min-height: 44px;

  /* 焦点可见性 */
  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

### 4. 键盘导航支持

确保图标元素支持键盘操作:

```vue
<script setup lang="ts">
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <div class="keyboard-demo">
    <!-- ✅ 可聚焦的图标元素 -->
    <span
      role="button"
      tabindex="0"
      aria-label="复制内容"
      class="icon-action"
      @click="handleCopy"
      @keydown="handleKeyDown"
    >
      <i class="i-ep-copy-document" aria-hidden="true" />
    </span>

    <!-- ✅ 图标链接 -->
    <a
      href="/settings"
      aria-label="前往设置页面"
      class="icon-link"
    >
      <i class="i-ep-setting" aria-hidden="true" />
    </a>
  </div>
</template>

<style scoped>
.icon-action,
.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}
</style>
```

## 常见问题解决

### 1. 图标不显示

**问题描述**: 图标代码正确但无法显示

**排查步骤**:

```vue
<script setup lang="ts">
import { isIconfontIcon, isIconifyIcon, isValidIconCode } from '@/types/icons.d'

// 诊断图标问题
const diagnoseIcon = (code: string) => {
  console.log('=== 图标诊断 ===')
  console.log(`图标代码: ${code}`)
  console.log(`是否有效: ${isValidIconCode(code)}`)
  console.log(`是 Iconfont: ${isIconfontIcon(code)}`)
  console.log(`是 Iconify: ${isIconifyIcon(code)}`)
}
</script>

<template>
  <div class="debug-icons">
    <!-- 检查点 1: 确认图标代码拼写 -->
    <i class="i-ep-home" />  <!-- ✅ 正确 -->
    <i class="i-ep-homes" /> <!-- ❌ 拼写错误 -->

    <!-- 检查点 2: 确认 Iconfont 样式已引入 -->
    <!-- 在 main.ts 中确认:
    import '@/assets/icons/system/iconfont.css'
    -->

    <!-- 检查点 3: 确认 UnoCSS 配置正确 -->
    <!-- 在 uno.config.ts 中确认:
    presetIcons({
      collections: {
        ep: () => import('@iconify-json/ep/icons.json')
      }
    })
    -->

    <!-- 检查点 4: 使用开发者工具检查元素 -->
    <!-- 查看是否生成了正确的 CSS 类 -->
  </div>
</template>
```

**常见原因和解决方案**:

| 原因 | 解决方案 |
|------|---------|
| 图标代码拼写错误 | 使用 TypeScript 类型检查 |
| 未引入 Iconfont CSS | 在 main.ts 引入 iconfont.css |
| UnoCSS 配置错误 | 检查 presetIcons 配置 |
| 图标未在 safelist | 将图标添加到 safelist 或确保被扫描到 |
| 字体文件未加载 | 检查网络请求,确认 woff2 文件加载成功 |

### 2. 图标样式异常

**问题描述**: 图标大小不一致或对齐错误

```vue
<template>
  <div class="style-fix">
    <!-- 问题: 图标与文字不对齐 -->

    <!-- ✅ 解决方案 1: 使用 flex 对齐 -->
    <span class="inline-flex items-center gap-1">
      <i class="i-ep-location" />
      <span>北京市</span>
    </span>

    <!-- ✅ 解决方案 2: 设置 vertical-align -->
    <span>
      <i class="i-ep-location" style="vertical-align: middle" />
      北京市
    </span>

    <!-- ✅ 解决方案 3: 使用 Icon 组件 -->
    <span class="inline-flex items-center gap-1">
      <Icon code="i-ep-location" size="sm" />
      <span>北京市</span>
    </span>
  </div>
</template>

<style scoped>
/* 全局修复图标对齐 */
i[class^="i-"],
i[class*=" i-"],
.iconfont {
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 3. 图标颜色不生效

**问题描述**: 设置颜色后图标颜色未变化

```vue
<template>
  <div class="color-fix">
    <!-- 问题: Iconfont 颜色被覆盖 -->

    <!-- ❌ 样式可能被覆盖 -->
    <i class="iconfont icon-home" style="color: red" />

    <!-- ✅ 提高样式优先级 -->
    <i class="iconfont icon-home custom-red" />

    <!-- ✅ 使用 Icon 组件 -->
    <Icon code="home" color="red" />

    <!-- ✅ 使用 CSS 变量 -->
    <i class="iconfont icon-home" style="color: var(--el-color-danger)" />
  </div>
</template>

<style scoped>
.custom-red {
  color: red !important;
}

/* 或使用更高优先级选择器 */
.iconfont.icon-home {
  color: red;
}
</style>
```

### 4. 图标加载闪烁

**问题描述**: 页面加载时图标出现闪烁

```vue
<template>
  <div class="flash-fix">
    <!-- ✅ 使用 font-display: swap -->
    <!-- 在 iconfont.css 中添加 -->

    <!-- ✅ 预加载字体 -->
    <!-- 在 index.html 中添加 -->

    <!-- ✅ 使用骨架屏 -->
    <Suspense>
      <template #default>
        <Icon code="i-ep-home" size="lg" />
      </template>
      <template #fallback>
        <span class="icon-skeleton" />
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.icon-skeleton {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

### 5. 动态图标切换卡顿

**问题描述**: 切换图标时出现卡顿

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'

// ✅ 使用 shallowRef 优化性能
const currentIcon = shallowRef('i-ep-home')

// ✅ 使用 CSS transition 而非 JS 动画
const changeIcon = (newIcon: string) => {
  currentIcon.value = newIcon
}
</script>

<template>
  <div class="transition-fix">
    <!-- ✅ 使用 CSS transition -->
    <i
      :class="currentIcon"
      class="icon-transition"
    />

    <!-- ✅ 使用 Vue Transition -->
    <Transition name="icon-fade" mode="out-in">
      <i :key="currentIcon" :class="currentIcon" />
    </Transition>
  </div>
</template>

<style scoped>
.icon-transition {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.15s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}
</style>
```

### 6. SSR 图标渲染问题

**问题描述**: 服务端渲染时图标显示异常

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'

// ✅ 客户端渲染图标
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <div class="ssr-fix">
    <!-- ✅ 仅客户端渲染 -->
    <ClientOnly>
      <Icon code="i-ep-home" size="lg" />
    </ClientOnly>

    <!-- ✅ 条件渲染 -->
    <template v-if="isMounted">
      <Icon code="i-ep-home" size="lg" />
    </template>
    <template v-else>
      <span class="icon-placeholder" />
    </template>
  </div>
</template>
```

## 开发检查清单

### 开发前检查

- [ ] 确认图标系统选择 (Iconify / Iconfont)
- [ ] 使用 TypeScript 类型定义 (`IconCode`)
- [ ] 了解项目现有图标风格
- [ ] 确认图标尺寸规范
- [ ] 了解图标颜色主题

### 开发中检查

- [ ] 图标语义化命名
- [ ] 使用 Icon 统一组件
- [ ] 使用 CSS 变量控制颜色
- [ ] 添加无障碍支持 (`aria-label`, `aria-hidden`)
- [ ] 避免硬编码样式
- [ ] 保持风格一致性

### 发布前检查

- [ ] 运行图标清理脚本
- [ ] 优化 safelist 配置
- [ ] 检查图标显示效果
- [ ] 验证响应式表现
- [ ] 测试暗色模式
- [ ] 验证无障碍功能
- [ ] 更新图标文档

### 代码审查要点

- [ ] 是否使用类型安全的图标代码
- [ ] 是否遵循图标选择策略
- [ ] 是否添加必要的无障碍属性
- [ ] 是否使用 CSS 变量控制颜色
- [ ] 是否避免内联样式
- [ ] 动态图标是否使用计算属性

遵循这些最佳实践能够提高图标使用效率,保持代码质量和可维护性,同时确保良好的用户体验和无障碍支持。
