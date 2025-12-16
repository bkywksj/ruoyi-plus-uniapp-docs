# 图标系统 Icon System

## 介绍

RuoYi-Plus 前端项目采用了先进的双图标系统架构，完美整合了传统的 Iconfont 字体图标和现代化的 Iconify 图标方案，为开发者提供了灵活、高效且类型安全的图标解决方案。系统内置 817 个精心挑选的图标，涵盖了企业级应用开发的各种场景需求。

**核心特性:**

- **双图标系统支持** - 同时支持 Iconfont 字体图标和 Iconify 图标，兼顾传统稳定性和现代化特性
- **类型安全** - 基于 TypeScript 的完整类型定义，提供 817 个图标的代码提示和类型检查
- **自动类型生成** - 通过 Vite 插件自动生成图标类型定义，无需手动维护
- **丰富的尺寸系统** - 提供 6 种预设尺寸（xs/sm/md/lg/xl/2xl）和自定义尺寸支持
- **内置动画效果** - 6 种精心设计的 CSS 动画效果（shake/rotate180/moveUp/expand/shrink/breathing）
- **图标选择器** - 可搜索的图标选择组件，支持实时预览和模糊搜索
- **易于扩展** - 支持添加自定义 Iconfont 图标，类型定义自动同步更新
- **按需加载** - Iconify 图标按需加载，有效减小打包体积

系统包含 644 个 Iconfont 图标和 173 个 Iconify 预设图标，所有图标都经过精心分类和命名，确保开发者能够快速找到所需图标。图标系统与 Element Plus UI 框架深度集成，可在任何需要图标的场景中使用。

## 架构设计

### 双图标系统

RuoYi-Plus 图标系统采用 Iconfont 和 Iconify 双轨并行的架构，充分发挥两种方案的优势。

**Iconfont 字体图标系统**

Iconfont 是阿里巴巴提供的矢量图标管理平台，本项目使用的是项目 ID 为 5022572 的 `plus-ui` 图标库。Iconfont 图标通过字体文件（woff2/woff/ttf）加载，具有以下特点：

- 浏览器兼容性好，支持所有现代浏览器
- 一次性加载所有图标，无需网络请求
- 可通过 CSS 修改颜色和大小
- 渲染性能优秀

项目中的 Iconfont 配置文件位于 `src/assets/icons/system/` 目录：

```
src/assets/icons/system/
├── iconfont.css      # 字体样式定义
├── iconfont.json     # 图标配置信息
├── iconfont.js       # 图标 JavaScript 加载器
├── iconfont.woff2    # 字体文件（WOFF2 格式）
├── iconfont.woff     # 字体文件（WOFF 格式）
└── iconfont.ttf      # 字体文件（TTF 格式）
```

**Iconify 现代图标系统**

Iconify 是一个统一的图标框架，支持超过 150 个图标集。本项目从中精选了 173 个常用图标作为预设。Iconify 的特点包括：

- 统一的图标接口，支持多个图标集
- 按需加载，减小初始包体积
- 图标以 SVG 方式渲染，支持多色图标
- 与 UnoCSS 深度集成

项目中的 Iconify 预设配置位于 `src/assets/icons/iconify/preset.json`。

**两种方案的对比**

| 特性 | Iconfont | Iconify |
|------|----------|---------|
| 图标数量 | 644 | 173 |
| 加载方式 | 字体文件 | SVG 动态渲染 |
| 网络请求 | 一次性加载 | 按需加载 |
| 颜色支持 | 单色 | 多色 |
| 浏览器兼容 | 极好 | 现代浏览器 |
| 类型提示 | 完整支持 | 完整支持 |
| 使用场景 | 常用图标 | 特殊图标 |

**选择建议**

- 优先使用 Iconfont 图标，性能更好且兼容性强
- 当 Iconfont 中没有合适图标时，使用 Iconify
- 需要多色图标时，使用 Iconify
- 项目中频繁使用的图标，建议添加到 Iconfont

### 核心组件

图标系统包含两个核心组件：

**Icon 组件**

Icon 是基础图标展示组件，支持三种使用方式：

1. **通过 code 属性使用类型安全的图标** - 推荐方式，提供完整的类型提示
2. **通过 value 属性使用 Iconfont 类名** - 兼容旧代码
3. **通过 value 属性使用 Iconify 图标** - 使用 `i-` 前缀的图标

Icon 组件会自动识别图标类型并应用正确的渲染方式。组件支持尺寸、颜色、动画等丰富的配置选项。

**IconSelect 组件**

IconSelect 是图标选择器组件，提供可视化的图标选择界面。组件特点：

- 展示所有 817 个可用图标
- 支持按图标代码或名称搜索
- 悬停时实时预览图标信息
- 高亮显示当前选中的图标
- 响应式网格布局

### 类型系统

图标系统的类型定义文件 `src/types/icons.d.ts` 由 Vite 插件自动生成，包含以下关键类型：

**IconCode 类型**

```typescript
type IconCode =
  | 'account'
  | 'activity'
  | 'add'
  // ... 共 817 个图标代码
```

`IconCode` 是一个联合类型，包含了所有可用图标的代码，为开发者提供完整的类型提示。

**IconItem 接口**

```typescript
interface IconItem {
  code: string     // 图标代码
  name: string     // 图标中文名称
  type: 'iconfont' | 'iconify'  // 图标类型
}
```

**工具函数**

类型文件还导出了一些实用工具函数：

- `ALL_ICONS: IconItem[]` - 所有图标的列表
- `searchIcons(keyword: string): IconItem[]` - 搜索图标
- `getIconName(code: string): string` - 获取图标名称
- `isIconfontIcon(code: string): boolean` - 判断是否为 Iconfont 图标

**自动生成机制**

类型定义通过 `iconfont-types` Vite 插件自动生成，插件会：

1. 读取 `src/assets/icons/system/iconfont.json` 获取 Iconfont 图标
2. 读取 `src/assets/icons/iconify/preset.json` 获取 Iconify 图标
3. 合并两者生成 `IconCode` 联合类型
4. 生成 `ALL_ICONS` 常量和工具函数
5. 在开发模式下监听文件变化，实时更新类型

这种自动化机制确保类型定义始终与实际图标保持同步，无需手动维护。

## Icon 组件详解

### 基本用法

Icon 组件提供了三种使用方式，以适应不同的开发场景。

#### 使用 code 属性（推荐）

通过 `code` 属性使用图标是最推荐的方式，它提供完整的 TypeScript 类型检查和代码提示：

```vue
<template>
  <div class="demo">
    <Icon code="user" />
    <Icon code="setting" />
    <Icon code="dashboard" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

**优势说明:**
- 在编写 `code="` 时，IDE 会自动提示所有 817 个可用图标
- TypeScript 会检查图标代码是否有效，避免运行时错误
- 组件会自动识别是 Iconfont 还是 Iconify 图标

#### 使用 value 属性（Iconfont 类名）

对于 Iconfont 图标，可以直接使用类名：

```vue
<template>
  <div class="demo">
    <Icon value="user" />
    <Icon value="icon-setting" />
    <Icon value="icon-dashboard" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**使用说明:**
- `value` 属性接受 Iconfont 图标类名
- 可以省略 `icon-` 前缀，组件会自动添加
- 例如 `value="user"` 会被解析为 `icon-user`

#### 使用 value 属性（Iconify 图标）

Iconify 图标使用 `i-` 前缀：

```vue
<template>
  <div class="demo">
    <Icon value="i-ep-user" />
    <Icon value="i-mdi-home" />
    <Icon value="i-tabler-layout-dashboard" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**格式说明:**
- Iconify 图标格式：`i-{collection}-{icon-name}`
- `collection` 是图标集名称（如 ep、mdi、tabler）
- `icon-name` 是图标名称，使用连字符连接
- 组件会自动识别 `i-` 前缀并使用 Iconify 渲染

### 尺寸系统

Icon 组件提供了灵活的尺寸控制系统，支持预设尺寸和自定义尺寸。

#### 预设尺寸

系统内置 6 个预设尺寸：

```vue
<template>
  <div class="demo">
    <!-- 超小尺寸 12px -->
    <Icon code="user" size="xs" />

    <!-- 小尺寸 14px -->
    <Icon code="user" size="sm" />

    <!-- 中等尺寸 16px，默认值 -->
    <Icon code="user" size="md" />

    <!-- 大尺寸 20px -->
    <Icon code="user" size="lg" />

    <!-- 超大尺寸 24px -->
    <Icon code="user" size="xl" />

    <!-- 特大尺寸 32px -->
    <Icon code="user" size="2xl" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

**预设尺寸对照表:**

| 尺寸代码 | 实际大小 | 使用场景 |
|---------|---------|---------|
| `xs` | 12px | 表格内图标、标签图标 |
| `sm` | 14px | 按钮图标、菜单图标 |
| `md` | 16px | 常规图标（默认） |
| `lg` | 20px | 标题图标、强调图标 |
| `xl` | 24px | 页面图标、卡片图标 |
| `2xl` | 32px | Logo、大型图标 |

#### 自定义数字尺寸

可以传入数字指定精确的像素大小：

```vue
<template>
  <div class="demo">
    <!-- 18px -->
    <Icon code="user" :size="18" />

    <!-- 22px -->
    <Icon code="user" :size="22" />

    <!-- 28px -->
    <Icon code="user" :size="28" />

    <!-- 40px -->
    <Icon code="user" :size="40" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**技术实现:**
- 数字会被转换为 `{数字}px` 的 CSS 值
- 同时设置 `font-size` 和 `width/height`
- 确保图标按比例缩放

#### 自定义字符串尺寸

支持任何 CSS 合法的尺寸单位：

```vue
<template>
  <div class="demo">
    <!-- rem 单位 -->
    <Icon code="user" size="1.5rem" />

    <!-- em 单位 -->
    <Icon code="user" size="2em" />

    <!-- 百分比 -->
    <Icon code="user" size="150%" />

    <!-- vw 单位 -->
    <Icon code="user" size="5vw" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**使用建议:**
- 大多数情况下使用预设尺寸即可
- 需要精确控制时使用数字尺寸
- 响应式场景可使用 rem、em、vw 等单位

### 颜色配置

Icon 组件支持灵活的颜色自定义。

#### 默认颜色

不指定颜色时，图标继承父元素的文本颜色：

```vue
<template>
  <div class="demo">
    <!-- 继承默认文本颜色 -->
    <div class="normal">
      <Icon code="user" />
    </div>

    <!-- 继承蓝色文本 -->
    <div class="blue-text">
      <Icon code="setting" />
    </div>

    <!-- 继承主题色 -->
    <div class="primary-text">
      <Icon code="dashboard" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

#### 自定义颜色

通过 `color` 属性指定图标颜色：

```vue
<template>
  <div class="demo">
    <!-- 十六进制颜色 -->
    <Icon code="user" color="#409eff" />

    <!-- RGB 颜色 -->
    <Icon code="user" color="rgb(64, 158, 255)" />

    <!-- CSS 变量 -->
    <Icon code="user" color="var(--el-color-primary)" />

    <!-- 颜色名称 -->
    <Icon code="user" color="red" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

#### 主题色预设

配合 Element Plus 主题色使用：

```vue
<template>
  <div class="demo">
    <!-- 主色 -->
    <Icon code="user" color="var(--el-color-primary)" />

    <!-- 成功色 -->
    <Icon code="success" color="var(--el-color-success)" />

    <!-- 警告色 -->
    <Icon code="warning" color="var(--el-color-warning)" />

    <!-- 危险色 -->
    <Icon code="error" color="var(--el-color-danger)" />

    <!-- 信息色 -->
    <Icon code="info" color="var(--el-color-info)" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

**Element Plus 颜色变量:**

| CSS 变量 | 说明 | 默认颜色 |
|---------|------|---------|
| `--el-color-primary` | 主题色 | #409eff |
| `--el-color-success` | 成功色 | #67c23a |
| `--el-color-warning` | 警告色 | #e6a23c |
| `--el-color-danger` | 危险色 | #f56c6c |
| `--el-color-info` | 信息色 | #909399 |

### 动画效果

Icon 组件内置 6 种 CSS 动画效果，通过 `animate` 属性启用。

#### shake（抖动）

图标左右抖动效果，适合表示错误或警告：

```vue
<template>
  <div class="demo">
    <Icon code="warning" animate="shake" color="var(--el-color-warning)" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

**动画细节:**
- 持续时间: 0.8 秒
- 重复次数: 无限循环
- 效果: 图标左右摆动 ±5 度

#### rotate180（180度旋转）

图标旋转 180 度，适合展开/收起切换：

```vue
<template>
  <div class="demo">
    <Icon
      code="caret-down"
      animate="rotate180"
      @click="toggle"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Icon from '@/components/Icon/Icon.vue'

const expanded = ref(false)

const toggle = () => {
  expanded.value = !expanded.value
}
</script>

```

**动画细节:**
- 持续时间: 0.3 秒
- 过渡函数: ease-in-out
- 效果: 平滑旋转 180 度

#### moveUp（上移）

图标向上移动并渐显，适合加载完成提示：

```vue
<template>
  <div class="demo">
    <Icon code="finish" animate="moveUp" color="var(--el-color-success)" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**动画细节:**
- 持续时间: 0.5 秒
- 效果: 从下方 20px 位置渐显上移

#### expand（放大）

图标从小到大放大，适合强调效果：

```vue
<template>
  <div class="demo">
    <Icon code="error" animate="expand" color="var(--el-color-danger)" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**动画细节:**
- 持续时间: 0.3 秒
- 效果: 从 0.5 倍缩放到 1 倍

#### shrink（缩小）

图标从大到小缩小，适合淡出效果：

```vue
<template>
  <div class="demo">
    <Icon code="close" animate="shrink" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**动画细节:**
- 持续时间: 0.3 秒
- 效果: 从 1.5 倍缩放到 1 倍，同时渐显

#### breathing（呼吸）

图标缓慢放大缩小，适合表示加载或等待状态：

```vue
<template>
  <div class="demo">
    <Icon code="loading" animate="breathing" color="var(--el-color-primary)" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**动画细节:**
- 持续时间: 2 秒
- 重复次数: 无限循环
- 效果: 在 1 倍和 1.1 倍之间平滑过渡

#### 动画组合使用

在实际场景中组合使用动画：

```vue
<template>
  <div class="demo">
    <!-- 错误提示 -->
    <div class="message error">
      <Icon code="error" animate="shake" color="var(--el-color-danger)" />
      <span>操作失败</span>
    </div>

    <!-- 成功提示 -->
    <div class="message success">
      <Icon code="finish" animate="moveUp" color="var(--el-color-success)" />
      <span>操作成功</span>
    </div>

    <!-- 加载中 -->
    <div class="message loading">
      <Icon code="loading" animate="breathing" color="var(--el-color-primary)" />
      <span>正在处理...</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

### Props API

Icon 组件的完整属性列表：

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| `code` | 图标代码（类型安全） | `IconCode` | 817 个图标代码 | `undefined` |
| `value` | 图标类名或 Iconify 图标 | `string` | - | `undefined` |
| `size` | 图标尺寸 | `SizePreset \| string \| number` | `xs` / `sm` / `md` / `lg` / `xl` / `2xl` 或任意 CSS 尺寸 | `md` |
| `color` | 图标颜色 | `string` | 任意 CSS 颜色值 | 继承父元素 |
| `animate` | 动画效果 | `AnimateType` | `shake` / `rotate180` / `moveUp` / `expand` / `shrink` / `breathing` | `undefined` |

**类型定义:**

```typescript
/**
 * 尺寸预设类型
 */
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * 动画类型
 */
type AnimateType = 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'

/**
 * Icon 组件属性接口
 */
interface IconProps {
  /**
   * 图标代码（类型安全，推荐使用）
   * 使用时会有完整的代码提示和类型检查
   */
  code?: IconCode

  /**
   * 图标值（兼容方式）
   * - Iconfont: 直接传入类名，如 "user" 或 "icon-user"
   * - Iconify: 传入以 "i-" 开头的图标，如 "i-ep-user"
   */
  value?: string

  /**
   * 图标尺寸
   * - 预设: xs(12px) / sm(14px) / md(16px) / lg(20px) / xl(24px) / 2xl(32px)
   * - 数字: 转换为 px 单位，如 18 → "18px"
   * - 字符串: 任意 CSS 尺寸，如 "1.5rem", "2em"
   */
  size?: SizePreset | string | number

  /**
   * 图标颜色
   * 支持任意 CSS 颜色值，如 "#409eff", "rgb(64, 158, 255)", "var(--el-color-primary)"
   */
  color?: string

  /**
   * 动画效果
   * - shake: 左右抖动
   * - rotate180: 旋转 180 度
   * - moveUp: 向上移动并渐显
   * - expand: 放大
   * - shrink: 缩小
   * - breathing: 呼吸效果（缩放循环）
   */
  animate?: AnimateType
}
```

## IconSelect 组件详解

### 基本用法

IconSelect 是一个图标选择器组件，提供可视化的图标选择界面。

#### 简单选择

最基本的使用方式：

```vue
<template>
  <div class="demo">
    <IconSelect v-model="selectedIcon" />
    <div class="result">
      <div>选中的图标: {{ selectedIcon }}</div>
      <Icon v-if="selectedIcon" :code="selectedIcon as IconCode" size="xl" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'
import Icon from '@/components/Icon/Icon.vue'

const selectedIcon = ref('')
</script>

```

#### 双向绑定

IconSelect 使用 `v-model` 进行双向数据绑定：

```vue
<template>
  <div class="demo">
    <el-form :model="form" label-width="100px">
      <el-form-item label="菜单图标">
        <IconSelect v-model="form.icon" />
      </el-form-item>

      <el-form-item label="预览">
        <Icon v-if="form.icon" :code="form.icon as IconCode" size="2xl" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'
import Icon from '@/components/Icon/Icon.vue'

const form = ref({
  icon: 'dashboard'
})
</script>

```

**使用说明:**
- IconSelect 会在输入框前显示当前选中的图标预览
- 点击输入框会打开图标选择弹窗
- 选择图标后自动更新 `v-model` 绑定的值
- 弹窗会自动关闭

### 搜索功能

IconSelect 内置强大的搜索功能，支持按图标代码或中文名称搜索。

#### 按代码搜索

搜索图标代码（英文）：

```vue
<template>
  <div class="demo">
    <IconSelect v-model="icon" />
    <div class="tip">
      提示: 在搜索框输入 "user" 可以找到所有包含 user 的图标
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon = ref('')
</script>

```

**搜索示例:**
- 搜索 `user` 可找到: user, users, user-add, user-delete 等
- 搜索 `dashboard` 可找到所有仪表盘相关图标
- 搜索 `arrow` 可找到所有箭头图标

#### 按名称搜索

搜索图标的中文名称：

```vue
<template>
  <div class="demo">
    <IconSelect v-model="icon" />
    <div class="tip">
      提示: 在搜索框输入 "用户" 可以找到所有用户相关图标
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon = ref('')
</script>
```

**搜索示例:**
- 搜索 `用户` 可找到: 用户、用户组、用户设置 等
- 搜索 `文件` 可找到所有文件相关图标
- 搜索 `图表` 可找到所有图表图标

#### 实时预览

悬停和选中时的图标信息预览：

```vue
<template>
  <div class="demo">
    <IconSelect v-model="icon" />
    <div class="description">
      <p>功能说明:</p>
      <ul>
        <li>鼠标悬停在图标上时，顶部会显示图标的名称和代码</li>
        <li>当前选中的图标会高亮显示</li>
        <li>搜索时会实时过滤图标列表</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon = ref('dashboard')
</script>

```

**预览功能:**
- 顶部信息栏默认显示 "共 817 个图标"
- 鼠标悬停时显示图标名称和代码
- 选中图标会用主题色高亮边框和背景

### 自定义宽度

通过 `width` 属性自定义组件宽度：

```vue
<template>
  <div class="demo">
    <div class="row">
      <label>小尺寸 (200px):</label>
      <IconSelect v-model="icon1" width="200px" />
    </div>

    <div class="row">
      <label>中等尺寸 (400px, 默认):</label>
      <IconSelect v-model="icon2" width="400px" />
    </div>

    <div class="row">
      <label>大尺寸 (600px):</label>
      <IconSelect v-model="icon3" width="600px" />
    </div>

    <div class="row">
      <label>响应式 (100%):</label>
      <IconSelect v-model="icon4" width="100%" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon1 = ref('')
const icon2 = ref('')
const icon3 = ref('')
const icon4 = ref('')
</script>

```

**宽度说明:**
- 默认宽度为 `400px`
- 支持任意 CSS 宽度单位（px、%、rem、vw 等）
- 弹窗宽度固定为 `450px`，不受此属性影响

### Props 和 Events

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `modelValue` | 当前选中的图标代码 | `string` | `''` |
| `width` | 组件宽度 | `string` | `'400px'` |

#### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `update:modelValue` | 选中图标变化时触发 | `(value: string)` |

**类型定义:**

```typescript
/**
 * IconSelect 组件属性接口
 */
interface IconSelectProps {
  /**
   * 当前选中的图标代码
   * 使用 v-model 绑定
   */
  modelValue: string

  /**
   * 组件宽度
   * 支持任意 CSS 宽度单位
   * @default '400px'
   */
  width?: string
}

/**
 * IconSelect 组件事件接口
 */
interface IconSelectEmits {
  /**
   * 选中图标变化时触发
   * @param value 新选中的图标代码
   */
  'update:modelValue': [value: string]
}
```

## 图标库

### Iconfont 图标（644 个）

Iconfont 图标库包含 644 个精心挑选的图标，涵盖企业级应用开发的各种场景。

#### 用户与权限类

用户管理、角色权限相关图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="user" size="xl" />
      <span>用户</span>
    </div>
    <div class="icon-item">
      <Icon code="users" size="xl" />
      <span>用户组</span>
    </div>
    <div class="icon-item">
      <Icon code="role" size="xl" />
      <span>角色</span>
    </div>
    <div class="icon-item">
      <Icon code="permission" size="xl" />
      <span>权限</span>
    </div>
    <div class="icon-item">
      <Icon code="admin" size="xl" />
      <span>管理员</span>
    </div>
    <div class="icon-item">
      <Icon code="department" size="xl" />
      <span>部门</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

```

**常用图标代码:**
- `user` - 用户
- `users` - 用户组
- `role` - 角色
- `permission` - 权限
- `admin` - 管理员
- `department` - 部门
- `post` - 岗位
- `customer` - 客户

#### 系统操作类

常用的系统操作图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="add" size="xl" color="var(--el-color-success)" />
      <span>新增</span>
    </div>
    <div class="icon-item">
      <Icon code="edit" size="xl" color="var(--el-color-primary)" />
      <span>编辑</span>
    </div>
    <div class="icon-item">
      <Icon code="delete" size="xl" color="var(--el-color-danger)" />
      <span>删除</span>
    </div>
    <div class="icon-item">
      <Icon code="search" size="xl" color="var(--el-color-info)" />
      <span>搜索</span>
    </div>
    <div class="icon-item">
      <Icon code="refresh" size="xl" color="var(--el-color-primary)" />
      <span>刷新</span>
    </div>
    <div class="icon-item">
      <Icon code="download" size="xl" color="var(--el-color-success)" />
      <span>下载</span>
    </div>
    <div class="icon-item">
      <Icon code="upload" size="xl" color="var(--el-color-warning)" />
      <span>上传</span>
    </div>
    <div class="icon-item">
      <Icon code="export" size="xl" color="var(--el-color-primary)" />
      <span>导出</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**常用图标代码:**
- `add` - 新增
- `edit` - 编辑
- `delete` - 删除
- `search` - 搜索
- `refresh` - 刷新
- `download` - 下载
- `upload` - 上传
- `import` - 导入
- `export` - 导出
- `print` - 打印

#### 文件文档类

文件和文档相关图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="folder" size="xl" color="#f7ba2a" />
      <span>文件夹</span>
    </div>
    <div class="icon-item">
      <Icon code="folder-open" size="xl" color="#f7ba2a" />
      <span>打开文件夹</span>
    </div>
    <div class="icon-item">
      <Icon code="file" size="xl" color="#909399" />
      <span>文件</span>
    </div>
    <div class="icon-item">
      <Icon code="word" size="xl" color="#2b5797" />
      <span>Word</span>
    </div>
    <div class="icon-item">
      <Icon code="excel" size="xl" color="#207245" />
      <span>Excel</span>
    </div>
    <div class="icon-item">
      <Icon code="ppt" size="xl" color="#d24726" />
      <span>PPT</span>
    </div>
    <div class="icon-item">
      <Icon code="pdf" size="xl" color="#e94f3b" />
      <span>PDF</span>
    </div>
    <div class="icon-item">
      <Icon code="zip" size="xl" color="#909399" />
      <span>压缩包</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**常用图标代码:**
- `folder` - 文件夹
- `folder-open` - 打开的文件夹
- `file` - 文件
- `word` - Word 文档
- `excel` - Excel 表格
- `ppt` - PPT 演示文稿
- `pdf` - PDF 文件
- `zip` - 压缩包
- `code-file` - 代码文件
- `documentation` - 文档

#### 状态指示类

表示各种状态的图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="success" size="xl" color="var(--el-color-success)" />
      <span>成功</span>
    </div>
    <div class="icon-item">
      <Icon code="error" size="xl" color="var(--el-color-danger)" />
      <span>错误</span>
    </div>
    <div class="icon-item">
      <Icon code="warning" size="xl" color="var(--el-color-warning)" />
      <span>警告</span>
    </div>
    <div class="icon-item">
      <Icon code="info" size="xl" color="var(--el-color-info)" />
      <span>信息</span>
    </div>
    <div class="icon-item">
      <Icon code="online" size="xl" color="var(--el-color-success)" />
      <span>在线</span>
    </div>
    <div class="icon-item">
      <Icon code="waiting" size="xl" color="var(--el-color-warning)" />
      <span>等待</span>
    </div>
    <div class="icon-item">
      <Icon code="disabled" size="xl" color="var(--el-color-info)" />
      <span>禁用</span>
    </div>
    <div class="icon-item">
      <Icon code="finish" size="xl" color="var(--el-color-success)" />
      <span>完成</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**常用图标代码:**
- `success` - 成功
- `error` - 错误
- `warning` - 警告
- `info` - 信息
- `online` - 在线
- `waiting` - 等待
- `disabled` - 禁用
- `finish` - 完成

### Iconify 图标（173 个）

Iconify 预设图标精选了 173 个高质量的现代图标，主要用于补充 Iconfont 图标库。

#### 组件类图标

UI 组件相关图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="button" size="xl" />
      <span>按钮</span>
    </div>
    <div class="icon-item">
      <Icon code="form" size="xl" />
      <span>表单</span>
    </div>
    <div class="icon-item">
      <Icon code="input" size="xl" />
      <span>输入框</span>
    </div>
    <div class="icon-item">
      <Icon code="select" size="xl" />
      <span>选择器</span>
    </div>
    <div class="icon-item">
      <Icon code="cascader" size="xl" />
      <span>级联选择</span>
    </div>
    <div class="icon-item">
      <Icon code="slider" size="xl" />
      <span>滑块</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**图标代码:**
- `button` - 按钮
- `form` - 表单
- `input` - 输入框
- `select` - 选择器
- `cascader` - 级联选择
- `slider` - 滑块
- `rate` - 评分
- `textarea` - 文本域

#### 图表类图标

数据可视化图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="chart" size="xl" color="var(--el-color-primary)" />
      <span>图表</span>
    </div>
    <div class="icon-item">
      <Icon code="pie-chart" size="xl" color="var(--el-color-success)" />
      <span>饼图</span>
    </div>
    <div class="icon-item">
      <Icon code="bar-chart" size="xl" color="var(--el-color-warning)" />
      <span>柱状图</span>
    </div>
    <div class="icon-item">
      <Icon code="line-chart" size="xl" color="var(--el-color-danger)" />
      <span>折线图</span>
    </div>
    <div class="icon-item">
      <Icon code="data-analysis" size="xl" color="var(--el-color-primary)" />
      <span>数据分析</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**图标代码:**
- `chart` - 图表
- `pie-chart` - 饼图
- `bar-chart` - 柱状图
- `line-chart` - 折线图
- `data-analysis` - 数据分析

#### 导航类图标

页面导航相关图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="dashboard" size="xl" />
      <span>仪表盘</span>
    </div>
    <div class="icon-item">
      <Icon code="breadcrumb" size="xl" />
      <span>面包屑</span>
    </div>
    <div class="icon-item">
      <Icon code="hamburger" size="xl" />
      <span>菜单</span>
    </div>
    <div class="icon-item">
      <Icon code="nested" size="xl" />
      <span>嵌套菜单</span>
    </div>
    <div class="icon-item">
      <Icon code="caret-back" size="xl" />
      <span>后退</span>
    </div>
    <div class="icon-item">
      <Icon code="caret-forward" size="xl" />
      <span>前进</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**图标代码:**
- `dashboard` - 仪表盘
- `breadcrumb` - 面包屑
- `hamburger` - 汉堡菜单
- `nested` - 嵌套菜单
- `caret-back` - 后退箭头
- `caret-forward` - 前进箭头
- `caret-up` - 向上箭头
- `caret-down` - 向下箭头

#### 社交媒体类

社交平台图标：

```vue
<template>
  <div class="icon-grid">
    <div class="icon-item">
      <Icon code="wechat-fill" size="xl" color="#07c160" />
      <span>微信</span>
    </div>
    <div class="icon-item">
      <Icon code="weibo" size="xl" color="#e6162d" />
      <span>微博</span>
    </div>
    <div class="icon-item">
      <Icon code="twitter" size="xl" color="#1da1f2" />
      <span>Twitter</span>
    </div>
    <div class="icon-item">
      <Icon code="facebook" size="xl" color="#1877f2" />
      <span>Facebook</span>
    </div>
    <div class="icon-item">
      <Icon code="linkedin" size="xl" color="#0a66c2" />
      <span>LinkedIn</span>
    </div>
    <div class="icon-item">
      <Icon code="instagram" size="xl" color="#e4405f" />
      <span>Instagram</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**图标代码:**
- `wechat-fill` - 微信
- `weibo` - 微博
- `twitter` - Twitter
- `facebook` - Facebook
- `linkedin` - LinkedIn
- `instagram` - Instagram
- `moments` - 朋友圈
- `share-social` - 社交分享

### 自定义图标

系统支持添加自定义 Iconfont 图标，类型定义会自动更新。

#### 添加自定义图标

**步骤 1: 下载图标文件**

从 Iconfont 官网创建项目并下载图标：

1. 登录 Iconfont，创建新项目或使用现有项目
2. 添加需要的图标到项目
3. 下载项目文件，获得以下文件：
   - `iconfont.css`
   - `iconfont.json`
   - `iconfont.js`
   - `iconfont.woff2`
   - `iconfont.woff`
   - `iconfont.ttf`

**步骤 2: 放置文件**

将下载的文件放到 `src/assets/icons/custom/` 目录：

```
src/assets/icons/custom/
├── iconfont.css
├── iconfont.json
├── iconfont.js
├── iconfont.woff2
├── iconfont.woff
└── iconfont.ttf
```

**步骤 3: 导入样式**

在 `src/main.ts` 中导入样式文件：

```typescript
// 导入系统图标
import '@/assets/icons/system/iconfont.css'

// 导入自定义图标
import '@/assets/icons/custom/iconfont.css'
```

**步骤 4: 自动生成类型**

`iconfont-types` Vite 插件会自动扫描 `custom` 目录并更新类型定义。重启开发服务器后，新图标的类型提示会自动生效。

#### 使用自定义图标

添加完成后，可以像使用系统图标一样使用自定义图标：

```vue
<template>
  <div class="demo">
    <!-- 使用 code 属性，有类型提示 -->
    <Icon code="my-custom-icon" />

    <!-- 使用 value 属性 -->
    <Icon value="my-custom-icon" />
    <Icon value="icon-my-custom-icon" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**注意事项:**
- 自定义图标会与系统图标合并到同一个类型定义中
- 确保图标代码不与系统图标重复
- 修改图标文件后需要重启开发服务器
- 生产环境打包前确保所有图标文件已正确配置

## 类型定义

### IconCode 类型

`IconCode` 是一个联合类型，包含所有可用图标的代码：

```typescript
/**
 * 图标代码类型
 * 包含所有可用图标的代码（817 个）
 * 该类型由 iconfont-types 插件自动生成
 */
type IconCode =
  | 'account'
  | 'activity'
  | 'add'
  | 'admin'
  | 'alipay'
  | 'api'
  // ... 共 817 个图标代码
  | 'wxpay'
  | 'zip'
```

**使用示例:**

```typescript
import type { IconCode } from '@/types/icons.d'

// 函数参数
function renderIcon(code: IconCode) {
  return `<Icon code="${code}" />`
}

// 变量声明
const myIcon: IconCode = 'user'  // ✅ 正确
const badIcon: IconCode = 'not-exist'  // ❌ 类型错误

// 组件 Props
interface MenuItemProps {
  icon?: IconCode
  label: string
}
```

### Icon Props 接口

Icon 组件的完整 TypeScript 接口定义：

```typescript
/**
 * 尺寸预设类型
 */
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * 动画类型
 */
type AnimateType =
  | 'shake'      // 抖动
  | 'rotate180'  // 旋转 180 度
  | 'moveUp'     // 向上移动
  | 'expand'     // 放大
  | 'shrink'     // 缩小
  | 'breathing'  // 呼吸效果

/**
 * Icon 组件属性接口
 */
interface IconProps {
  /**
   * 图标代码（类型安全，推荐使用）
   * 使用时会有完整的代码提示和类型检查
   * @example
   * <Icon code="user" />
   * <Icon code="dashboard" />
   */
  code?: IconCode

  /**
   * 图标值（兼容方式）
   * - Iconfont: 直接传入类名，如 "user" 或 "icon-user"
   * - Iconify: 传入以 "i-" 开头的图标，如 "i-ep-user"
   * @example
   * <Icon value="user" />
   * <Icon value="i-ep-user" />
   */
  value?: string

  /**
   * 图标尺寸
   * - 预设: xs(12px) / sm(14px) / md(16px) / lg(20px) / xl(24px) / 2xl(32px)
   * - 数字: 转换为 px 单位，如 18 → "18px"
   * - 字符串: 任意 CSS 尺寸，如 "1.5rem", "2em"
   * @default 'md'
   * @example
   * <Icon code="user" size="lg" />
   * <Icon code="user" :size="20" />
   * <Icon code="user" size="1.5rem" />
   */
  size?: SizePreset | string | number

  /**
   * 图标颜色
   * 支持任意 CSS 颜色值
   * @example
   * <Icon code="user" color="#409eff" />
   * <Icon code="user" color="var(--el-color-primary)" />
   */
  color?: string

  /**
   * 动画效果
   * @example
   * <Icon code="warning" animate="shake" />
   * <Icon code="loading" animate="breathing" />
   */
  animate?: AnimateType
}
```

### IconSelect Props 接口

IconSelect 组件的 TypeScript 接口定义：

```typescript
/**
 * IconSelect 组件属性接口
 */
interface IconSelectProps {
  /**
   * 当前选中的图标代码
   * 使用 v-model 绑定
   * @example
   * <IconSelect v-model="iconCode" />
   */
  modelValue: string

  /**
   * 组件宽度
   * 支持任意 CSS 宽度单位
   * @default '400px'
   * @example
   * <IconSelect v-model="iconCode" width="300px" />
   * <IconSelect v-model="iconCode" width="100%" />
   */
  width?: string
}

/**
 * IconSelect 组件事件接口
 */
interface IconSelectEmits {
  /**
   * 选中图标变化时触发
   * @param value 新选中的图标代码
   */
  'update:modelValue': [value: string]
}
```

### IconItem 接口

图标项的数据结构：

```typescript
/**
 * 图标项接口
 * 表示单个图标的完整信息
 */
interface IconItem {
  /**
   * 图标代码
   * 在代码中使用的唯一标识符
   * @example 'user', 'dashboard', 'setting'
   */
  code: string

  /**
   * 图标名称
   * 用于显示和搜索的中文名称
   * @example '用户', '仪表盘', '设置'
   */
  name: string

  /**
   * 图标类型
   * 标识图标来源
   */
  type: 'iconfont' | 'iconify'
}
```

### 工具函数类型

图标系统提供的工具函数类型定义：

```typescript
/**
 * 所有图标列表
 * 包含 817 个图标的完整信息
 */
declare const ALL_ICONS: readonly IconItem[]

/**
 * 搜索图标
 * 按图标代码或名称模糊搜索
 * @param keyword 搜索关键词
 * @returns 匹配的图标列表
 * @example
 * searchIcons('用户')  // 返回所有用户相关图标
 * searchIcons('user')  // 返回所有代码包含 user 的图标
 */
declare function searchIcons(keyword: string): IconItem[]

/**
 * 获取图标名称
 * @param code 图标代码
 * @returns 图标的中文名称，如果不存在则返回代码本身
 * @example
 * getIconName('user')  // 返回 '用户'
 * getIconName('dashboard')  // 返回 '仪表盘'
 */
declare function getIconName(code: string): string

/**
 * 判断是否为 Iconfont 图标
 * @param code 图标代码
 * @returns 是否为 Iconfont 图标
 * @example
 * isIconfontIcon('user')  // 返回 true
 * isIconfontIcon('dashboard')  // 返回 true （Iconify 图标返回 false）
 */
declare function isIconfontIcon(code: string): boolean
```

## 主题定制

### CSS 变量

Icon 组件使用 CSS 变量进行主题定制，可以通过覆盖这些变量来自定义样式。

#### 全局颜色变量

图标默认使用 Element Plus 的主题色变量：

```scss
// Element Plus 主题色变量
:root {
  --el-color-primary: #409eff;       // 主色
  --el-color-success: #67c23a;       // 成功色
  --el-color-warning: #e6a23c;       // 警告色
  --el-color-danger: #f56c6c;        // 危险色
  --el-color-info: #909399;          // 信息色

  // 浅色版本（用于背景）
  --el-color-primary-light-9: #ecf5ff;
  --el-color-success-light-9: #f0f9ff;
  --el-color-warning-light-9: #fdf6ec;
  --el-color-danger-light-9: #fef0f0;
  --el-color-info-light-9: #f4f4f5;
}
```

#### 自定义主题色

覆盖主题色变量：

```vue
<template>
  <div class="custom-theme">
    <Icon code="user" color="var(--my-primary-color)" />
    <Icon code="success" color="var(--my-success-color)" />
  </div>
</template>

```

#### IconSelect 样式变量

IconSelect 组件的样式可以通过以下变量定制：

```scss
// 图标选择器变量
.icon-select-custom {
  // 边框颜色
  --icon-border-color: #eee;

  // 悬停边框颜色
  --icon-hover-border: var(--el-color-primary);

  // 激活背景色
  --icon-active-bg: var(--el-color-primary-light-9);

  // 信息栏背景色
  --icon-info-bg: #fafafa;
}
```

**使用示例:**

```vue
<template>
  <div class="icon-select-custom">
    <IconSelect v-model="icon" />
  </div>
</template>

```

### 动画定制

可以通过 CSS 覆盖内置动画效果。

#### 自定义抖动动画

```vue
<template>
  <div class="custom-shake">
    <Icon code="warning" animate="shake" />
  </div>
</template>

```

#### 自定义呼吸动画

```vue
<template>
  <div class="custom-breathing">
    <Icon code="loading" animate="breathing" />
  </div>
</template>

```

#### 添加新动画

除了覆盖内置动画，还可以通过 CSS 类添加新动画：

```vue
<template>
  <div class="demo">
    <Icon code="heart" class="pulse-animation" color="var(--el-color-danger)" />
  </div>
</template>

```

## 最佳实践

### 1. 图标选择建议

**优先使用 code 属性**

始终优先使用 `code` 属性而不是 `value` 属性，以获得完整的类型安全和代码提示：

```vue
<!-- ✅ 推荐：使用 code 属性 -->
<Icon code="user" />

<!-- ❌ 不推荐：使用 value 属性 -->
<Icon value="user" />
```

**理由:**
- TypeScript 会检查图标代码是否存在
- IDE 提供完整的代码提示
- 重构时更容易追踪图标使用

**选择合适的图标类型**

优先使用 Iconfont 图标，在没有合适图标时才使用 Iconify：

```vue
<!-- ✅ 推荐：使用 Iconfont 图标 -->
<Icon code="user" />

<!-- ⚠️ 仅在必要时：使用 Iconify 图标 -->
<Icon code="button" />
```

**理由:**
- Iconfont 图标一次性加载，性能更好
- Iconfont 浏览器兼容性更强
- Iconify 图标需要按需加载，增加网络请求

### 2. 性能优化

**避免动态图标代码**

不要在循环中动态计算图标代码，应该预先定义：

```vue
<!-- ❌ 不推荐：动态计算图标代码 -->
<template>
  <div v-for="item in list" :key="item.id">
    <Icon :code="getIconCode(item.type)" />
  </div>
</template>

<script lang="ts" setup>
const getIconCode = (type: string) => {
  return `icon-${type}` as IconCode  // 每次都要计算
}
</script>

<!-- ✅ 推荐：预定义图标映射 -->
<template>
  <div v-for="item in list" :key="item.id">
    <Icon :code="iconMap[item.type]" />
  </div>
</template>

<script lang="ts" setup>
import type { IconCode } from '@/types/icons.d'

const iconMap: Record<string, IconCode> = {
  user: 'user',
  admin: 'admin',
  role: 'role',
}
</script>
```

**合理使用动画**

动画会持续消耗 CPU 资源，不要过度使用：

```vue
<!-- ❌ 不推荐：页面上有大量动画图标 -->
<template>
  <div class="list">
    <div v-for="item in 100" :key="item">
      <Icon code="loading" animate="breathing" />
    </div>
  </div>
</template>

<!-- ✅ 推荐：仅在必要时使用动画 -->
<template>
  <div class="list">
    <div v-for="item in list" :key="item.id">
      <Icon
        code="loading"
        :animate="item.loading ? 'breathing' : undefined"
      />
    </div>
  </div>
</template>
```

**IconSelect 懒加载**

对于不常用的图标选择功能，可以使用动态导入：

```vue
<template>
  <div class="demo">
    <el-button @click="showSelector = true">选择图标</el-button>
    <IconSelect v-if="showSelector" v-model="icon" />
  </div>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'

const showSelector = ref(false)

// 懒加载 IconSelect 组件
const IconSelect = defineAsyncComponent(() =>
  import('@/components/Icon/IconSelect.vue')
)

const icon = ref('')
</script>
```

### 3. 类型使用

**定义图标类型的 Props**

在组件中使用 `IconCode` 类型：

```vue
<template>
  <div class="menu-item">
    <Icon v-if="icon" :code="icon" />
    <span>{{ label }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { IconCode } from '@/types/icons.d'
import Icon from '@/components/Icon/Icon.vue'

interface MenuItemProps {
  icon?: IconCode  // 使用 IconCode 类型
  label: string
}

const props = defineProps<MenuItemProps>()
</script>
```

**图标映射对象**

创建类型安全的图标映射：

```typescript
import type { IconCode } from '@/types/icons.d'

// 状态图标映射
const statusIconMap: Record<string, IconCode> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
}

// 文件类型图标映射
const fileTypeIconMap: Record<string, IconCode> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'ppt',
  pptx: 'ppt',
  zip: 'zip',
}

// 使用
const getFileIcon = (ext: string): IconCode => {
  return fileTypeIconMap[ext] || 'file'
}
```

### 4. 动画使用建议

**根据场景选择合适的动画**

不同场景使用不同的动画效果：

```vue
<template>
  <div class="demo">
    <!-- 错误提示：使用 shake -->
    <Icon code="error" animate="shake" />

    <!-- 加载状态：使用 breathing -->
    <Icon code="loading" animate="breathing" />

    <!-- 展开收起：使用 rotate180 -->
    <Icon code="caret-down" animate="rotate180" />

    <!-- 完成提示：使用 moveUp -->
    <Icon code="finish" animate="moveUp" />
  </div>
</template>
```

**条件性启用动画**

根据状态动态启用动画：

```vue
<template>
  <div class="demo">
    <Icon
      code="refresh"
      :animate="isLoading ? 'breathing' : undefined"
      @click="handleRefresh"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Icon from '@/components/Icon/Icon.vue'

const isLoading = ref(false)

const handleRefresh = async () => {
  isLoading.value = true
  try {
    await fetchData()
  } finally {
    isLoading.value = false
  }
}
</script>
```

### 5. 图标尺寸规范

**遵循设计规范**

根据使用场景选择合适的尺寸：

```vue
<template>
  <div class="demo">
    <!-- 表格内图标：xs (12px) -->
    <el-table>
      <el-table-column>
        <template #default>
          <Icon code="edit" size="xs" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 按钮图标：sm (14px) -->
    <el-button>
      <Icon code="add" size="sm" />
      <span>新增</span>
    </el-button>

    <!-- 菜单图标：md (16px) -->
    <div class="menu-item">
      <Icon code="dashboard" size="md" />
      <span>仪表盘</span>
    </div>

    <!-- 页面标题图标：lg (20px) -->
    <h2>
      <Icon code="setting" size="lg" />
      <span>系统设置</span>
    </h2>

    <!-- 卡片图标：xl (24px) -->
    <el-card>
      <Icon code="user" size="xl" />
    </el-card>

    <!-- 空状态图标：2xl (32px) -->
    <el-empty>
      <Icon code="empty" size="2xl" />
    </el-empty>
  </div>
</template>
```

**保持一致性**

在同一场景中保持图标尺寸一致：

```vue
<!-- ❌ 不推荐：同一列表中尺寸不一致 -->
<template>
  <ul>
    <li><Icon code="user" size="sm" /> 用户</li>
    <li><Icon code="role" size="md" /> 角色</li>
    <li><Icon code="permission" size="lg" /> 权限</li>
  </ul>
</template>

<!-- ✅ 推荐：统一尺寸 -->
<template>
  <ul>
    <li><Icon code="user" size="md" /> 用户</li>
    <li><Icon code="role" size="md" /> 角色</li>
    <li><Icon code="permission" size="md" /> 权限</li>
  </ul>
</template>
```

## 常见问题

### 1. 图标不显示

**问题描述:**

Icon 组件渲染后，图标不显示，只显示空白或方框。

**可能原因:**

1. 字体文件未正确加载
2. 图标代码不存在
3. CSS 样式被覆盖
4. Iconify 图标网络请求失败

**解决方案:**

**检查字体文件加载**

打开浏览器开发者工具，查看 Network 标签，确认字体文件已成功加载：

```
iconfont.woff2  200  OK
```

如果字体文件 404，检查文件路径是否正确：

```typescript
// main.ts
import '@/assets/icons/system/iconfont.css'  // 确保路径正确
```

**检查图标代码**

使用 `code` 属性时，TypeScript 会检查代码是否存在。如果使用 `value` 属性，需要手动检查：

```vue
<!-- ❌ 错误：图标代码不存在 -->
<Icon value="not-exist-icon" />

<!-- ✅ 正确：使用存在的图标代码 -->
<Icon code="user" />
```

**检查 CSS 优先级**

确保图标的 CSS 样式没有被覆盖：

```scss
// ❌ 可能导致问题
.my-icon {
  font-family: Arial !important;  // 覆盖了 iconfont
}

// ✅ 正确
.my-icon {
  color: #409eff;  // 只修改颜色
}
```

**Iconify 图标加载失败**

Iconify 图标需要网络请求，如果网络不通会导致图标不显示。可以检查控制台是否有错误。解决方法：确保网络连接正常，或者使用 Iconfont 图标替代。

### 2. 自定义图标如何添加

**问题描述:**

需要添加项目专属的图标，如何集成到系统中？

**解决方案:**

**步骤 1: 创建 Iconfont 项目**

1. 访问 Iconfont 官网
2. 登录账号（可使用 GitHub、微博等）
3. 点击"图标管理 → 我的项目 → 新建项目"
4. 设置项目名称和前缀（如 `custom-`）

**步骤 2: 添加图标**

1. 搜索需要的图标或上传自己的 SVG
2. 点击"添加入库"
3. 在购物车中选择图标，添加到项目

**步骤 3: 下载项目**

1. 进入项目详情页
2. 点击"下载至本地"
3. 解压获得以下文件：
   - `iconfont.css`
   - `iconfont.json`
   - `iconfont.woff2`
   - `iconfont.woff`
   - `iconfont.ttf`

**步骤 4: 集成到项目**

将文件复制到 `src/assets/icons/custom/` 目录：

```bash
cp iconfont.* src/assets/icons/custom/
```

**步骤 5: 导入样式**

在 `src/main.ts` 中导入：

```typescript
import '@/assets/icons/custom/iconfont.css'
```

**步骤 6: 重启开发服务器**

```bash
npm run dev
```

类型定义会自动生成，新图标即可使用。

### 3. 类型提示不生效

**问题描述:**

使用 `code` 属性时，IDE 没有显示图标代码的自动补全提示。

**可能原因:**

1. TypeScript 服务未启动
2. 类型定义文件未生成
3. IDE 缓存问题
4. tsconfig.json 配置不正确

**解决方案:**

**重启 TypeScript 服务**

在 VS Code 中：
1. 按 `Ctrl/Cmd + Shift + P` 打开命令面板
2. 输入 "TypeScript: Restart TS Server"
3. 回车重启

**检查类型定义文件**

确认 `src/types/icons.d.ts` 文件存在且内容正确：

```bash
ls -la src/types/icons.d.ts
```

如果文件不存在，重启开发服务器以触发类型生成。

**清理 IDE 缓存**

VS Code:
```bash
rm -rf .vscode/
```

WebStorm:
```
File → Invalidate Caches / Restart
```

**检查 tsconfig.json**

确保 `icons.d.ts` 被包含在编译范围内：

```json
{
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ]
}
```

### 4. 动画不生效

**问题描述:**

设置了 `animate` 属性，但图标没有动画效果。

**可能原因:**

1. CSS 动画被禁用
2. 样式被覆盖
3. 浏览器不支持 CSS 动画

**解决方案:**

**检查 CSS 动画支持**

确认浏览器支持 CSS 动画（现代浏览器都支持）：

```javascript
const supportsAnimation = 'animation' in document.body.style
console.log('支持 CSS 动画:', supportsAnimation)
```

**检查样式覆盖**

使用开发者工具检查图标元素，确认动画类已应用：

```html
<i class="iconfont icon-user animate-shake"></i>
```

如果类存在但动画不生效，可能是样式被覆盖：

```scss
// ❌ 可能覆盖动画
.my-icon {
  animation: none !important;
}

// ✅ 保留动画
.my-icon {
  color: red;  // 只修改其他属性
}
```

**检查 prefers-reduced-motion**

某些用户可能在系统中启用了"减少动画"选项，导致所有 CSS 动画被禁用。可以强制启用：

```scss
.icon-force-animate {
  @media (prefers-reduced-motion: reduce) {
    animation: auto !important;
  }
}
```

### 5. 图标颜色无法修改

**问题描述:**

设置了 `color` 属性，但图标颜色没有改变。

**可能原因:**

1. 使用了 SVG 多色图标（Iconify）
2. CSS 优先级问题
3. 继承颜色被覆盖

**解决方案:**

**Iconfont 图标颜色修改**

Iconfont 图标是单色的，可以通过 `color` 属性修改：

```vue
<template>
  <Icon code="user" color="#409eff" />
</template>
```

如果不生效，检查是否有其他样式覆盖：

```scss
// ❌ 可能覆盖颜色
.icon-wrapper i {
  color: black !important;  // 移除 !important
}
```

**Iconify 多色图标**

某些 Iconify 图标是多色的（如 Logo），无法通过 `color` 属性修改。这是正常现象，可以选择使用单色版本的图标。

**使用 CSS 变量**

如果需要统一修改所有图标颜色：

```scss
.my-section {
  --icon-color: #409eff;

  i {
    color: var(--icon-color);
  }
}
```

**检查继承**

Icon 组件默认继承父元素颜色。如果父元素颜色被固定，需要显式指定：

```vue
<!-- ❌ 父元素颜色固定 -->
<div style="color: black">
  <Icon code="user" />  <!-- 图标会是黑色 -->
</div>

<!-- ✅ 显式指定颜色 -->
<div style="color: black">
  <Icon code="user" color="#409eff" />  <!-- 图标是蓝色 -->
</div>
```
