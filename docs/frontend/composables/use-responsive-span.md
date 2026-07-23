# useResponsiveSpan

响应式栅格组合函数，提供统一的响应式栅格计算逻辑，包含屏幕响应式、容器响应式、弹窗尺寸响应式等多种模式。该组合函数是构建自适应布局的核心工具，广泛应用于表单、卡片网格、弹窗表单等场景。

## 功能特性

- **屏幕响应式**: 基于屏幕尺寸的响应式布局，使用 CSS Media Query 检测屏幕断点
- **容器响应式**: 基于容器宽度的响应式布局，使用 ResizeObserver 监听容器尺寸变化
- **Modal 尺寸响应式**: 基于弹窗尺寸的响应式布局，通过 provide/inject 获取弹窗尺寸
- **智能模式选择**: 自动检测运行环境，智能选择最合适的响应式模式
- **小弹窗优化**: 针对小弹窗场景提供优化的响应式配置，优先使用全宽布局
- **断点配置灵活**: 支持自定义断点配置，可覆盖默认配置
- **统一接口**: 提供统一的 API 接口，简化响应式布局开发
- **自动清理**: 组件卸载时自动清理 ResizeObserver，避免内存泄漏
- **TypeScript 支持**: 完整的类型定义，提供良好的开发体验

## 快速开始

### 安装与导入

```typescript
import {
  useResponsiveSpan,
  useScreenResponsiveSpan,
  useContainerResponsiveSpan,
  useModalSizeResponsiveSpan
} from '@/composables/useResponsiveSpan'
```

### 最简用法

```vue
<template>
  <el-row :gutter="16">
    <el-col v-if="shouldUseCol" :span="computedSpan">
      <div class="content">响应式内容</div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

// 使用自动响应式配置
const { computedSpan, shouldUseCol } = useResponsiveSpan('auto')
</script>
```

## 核心概念

### 栅格系统

Element Plus 使用 24 栅格系统，一行被划分为 24 等份。`span` 值决定元素占据的栅格数：

| span 值 | 占比 | 一行显示数量 |
|---------|------|--------------|
| `24` | 100% | 1 个 |
| `12` | 50% | 2 个 |
| `8` | 33.33% | 3 个 |
| `6` | 25% | 4 个 |
| `4` | 16.67% | 6 个 |

### 响应式模式

系统提供三种响应式模式：

| 模式 | 检测方式 | 适用场景 |
|------|----------|----------|
| `screen` | CSS Media Query | 全屏页面、主布局 |
| `container` | ResizeObserver | 弹窗、抽屉、侧边栏 |
| `modal-size` | provide/inject | AModal 组件内部 |

### 断点定义

#### 屏幕断点

基于 CSS Media Query 的屏幕尺寸检测：

```typescript
const SCREEN_BREAKPOINTS = {
  xs: '(max-width: 767px)',              // 手机
  sm: '(min-width: 768px) and (max-width: 991px)',   // 平板
  md: '(min-width: 992px) and (max-width: 1199px)',  // 小桌面
  lg: '(min-width: 1200px) and (max-width: 1919px)', // 大桌面
  xl: '(min-width: 1920px)'              // 超大屏
}
```

#### 容器断点

基于容器宽度的断点定义：

```typescript
const CONTAINER_BREAKPOINTS = {
  xs: 480,   // 超小容器 (< 480px)
  sm: 600,   // 小容器 (480-600px)
  md: 800,   // 中等容器 (600-800px)
  lg: 1000,  // 大容器 (800-1000px)
  xl: 1200   // 超大容器 (> 1200px)
}
```

### 默认响应式配置

系统提供两套默认配置：

#### 标准配置

适用于大多数场景：

```typescript
const DEFAULT_RESPONSIVE_CONFIG: ResponsiveSpan = {
  xs: 24,  // 手机/超小容器：全宽（1列）
  sm: 24,  // 小屏/小容器：全宽（1列）
  md: 12,  // 中屏/中等容器：半宽（2列）
  lg: 12,  // 大屏/大容器：半宽（2列）
  xl: 8    // 超大屏/超大容器：三分之一宽（3列）
}
```

#### 小弹窗优化配置

针对小弹窗场景优化，优先使用全宽布局提升用户体验：

```typescript
const SMALL_MODAL_RESPONSIVE_CONFIG: ResponsiveSpan = {
  xs: 24,  // 手机：全宽
  sm: 24,  // 小屏/小弹窗：全宽（重点优化）
  md: 24,  // 中屏：全宽（重点优化）
  lg: 12,  // 大屏：一行两个
  xl: 8    // 超大屏：一行三个
}
```

## 组合函数详解

### useResponsiveSpan（统一入口）

智能响应式入口函数，自动选择最合适的响应式模式。

#### 函数签名

```typescript
function useResponsiveSpan(
  spanProp: Ref<SpanType> | SpanType,
  options?: {
    mode?: 'screen' | 'container' | 'modal-size'
    modalSize?: Ref<string> | string
    containerSelector?: string
  }
): {
  computedSpan: ComputedRef<number | undefined>
  shouldUseCol: ComputedRef<boolean>
  containerWidth?: Readonly<Ref<number>>
  currentBreakpoint?: Readonly<Ref<string>>
}
```

#### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `spanProp` | `Ref<SpanType> \| SpanType` | 是 | span 配置值 |
| `options.mode` | `'screen' \| 'container' \| 'modal-size'` | 否 | 响应式模式 |
| `options.modalSize` | `Ref<string> \| string` | 否 | 弹窗尺寸 |
| `options.containerSelector` | `string` | 否 | 容器选择器 |

#### 智能模式选择

当不指定 `mode` 时，函数会智能选择模式：

1. **如果能获取到 modalSize**（通过 inject 或 props），使用 `modal-size` 模式
2. **否则**，使用 `container` 模式作为默认

```typescript
const actualMode = computed(() => {
  // 如果明确指定了模式，使用指定的模式
  if (mode) {
    return mode
  }

  // 如果能获取到 modalSize（说明在弹窗中），使用 modal-size 模式
  if (injectedModalSize.value || unref(modalSize)) {
    return 'modal-size'
  }

  // 否则使用默认的 container 模式
  return 'container'
})
```

#### 基础用法

```vue
<template>
  <el-row :gutter="16">
    <el-col v-if="shouldUseCol" :span="computedSpan">
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

const form = reactive({
  username: ''
})

// 方式1：使用自动响应式
const { computedSpan, shouldUseCol } = useResponsiveSpan('auto')

// 方式2：使用固定值
const { computedSpan: fixedSpan } = useResponsiveSpan(12)

// 方式3：使用自定义响应式配置
const { computedSpan: customSpan } = useResponsiveSpan({
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 6
})

// 方式4：指定响应式模式
const { computedSpan: screenSpan } = useResponsiveSpan('auto', {
  mode: 'screen'
})
</script>
```

### useScreenResponsiveSpan（屏幕响应式）

基于屏幕尺寸的响应式组合函数，使用 `@vueuse/core` 的 `useMediaQuery` 检测屏幕断点。

#### 函数签名

```typescript
function useScreenResponsiveSpan(
  spanProp: Ref<SpanType> | SpanType
): {
  computedSpan: ComputedRef<number | undefined>
  shouldUseCol: ComputedRef<boolean>
}
```

#### 实现原理

使用 CSS Media Query 检测当前屏幕尺寸：

```typescript
const isXs = useMediaQuery('(max-width: 767px)')
const isSm = useMediaQuery('(min-width: 768px) and (max-width: 991px)')
const isMd = useMediaQuery('(min-width: 992px) and (max-width: 1199px)')
const isLg = useMediaQuery('(min-width: 1200px) and (max-width: 1919px)')
const isXl = useMediaQuery('(min-width: 1920px)')
```

#### 使用示例

```vue
<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col
        v-for="card in cards"
        :key="card.id"
        :span="computedSpan"
      >
        <el-card :header="card.title">
          {{ card.content }}
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useScreenResponsiveSpan } from '@/composables/useResponsiveSpan'

const cards = ref([
  { id: 1, title: '卡片1', content: '内容1' },
  { id: 2, title: '卡片2', content: '内容2' },
  { id: 3, title: '卡片3', content: '内容3' },
  { id: 4, title: '卡片4', content: '内容4' }
])

// 响应式卡片网格
const { computedSpan } = useScreenResponsiveSpan({
  xs: 24,  // 手机：1列
  sm: 12,  // 平板：2列
  md: 8,   // 桌面：3列
  lg: 6,   // 大屏：4列
  xl: 4    // 超大屏：6列
})
</script>
```

### useContainerResponsiveSpan（容器响应式）

基于容器宽度的响应式组合函数，使用 `ResizeObserver` 监听容器尺寸变化。

#### 函数签名

```typescript
function useContainerResponsiveSpan(
  spanProp: Ref<SpanType> | SpanType,
  containerSelector?: string
): {
  computedSpan: ComputedRef<number | undefined>
  shouldUseCol: ComputedRef<boolean>
  containerWidth: Readonly<Ref<number>>
  currentBreakpoint: Readonly<Ref<string>>
}
```

#### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `spanProp` | `Ref<SpanType> \| SpanType` | 是 | span 配置值 |
| `containerSelector` | `string` | 否 | 容器 CSS 选择器，默认查找 `.el-dialog` 或 `.el-drawer` |

#### 返回值说明

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `computedSpan` | `ComputedRef<number \| undefined>` | 计算后的 span 值 |
| `shouldUseCol` | `ComputedRef<boolean>` | 是否应使用 el-col 包装 |
| `containerWidth` | `Readonly<Ref<number>>` | 当前容器宽度（只读） |
| `currentBreakpoint` | `Readonly<Ref<string>>` | 当前断点名称（只读） |

#### 容器查找逻辑

```typescript
const findContainer = (): HTMLElement | null => {
  if (containerSelector) {
    return document.querySelector(containerSelector)
  }

  // 自动查找最近的弹窗容器
  const dialogContainer = document.querySelector('.el-dialog')
  const drawerContainer = document.querySelector('.el-drawer')

  return dialogContainer || drawerContainer
}
```

#### 使用示例

```vue
<template>
  <el-dialog v-model="visible" title="用户信息" width="60%">
    <!-- 调试信息 -->
    <div class="debug-info" v-if="isDev">
      <el-tag>容器宽度: {{ containerWidth }}px</el-tag>
      <el-tag type="success">当前断点: {{ currentBreakpoint }}</el-tag>
      <el-tag type="warning">计算 span: {{ computedSpan }}</el-tag>
    </div>

    <el-form :model="form" label-width="100px">
      <el-row :gutter="16">
        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="用户名">
            <el-input v-model="form.username" />
          </el-form-item>
        </el-col>

        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="邮箱">
            <el-input v-model="form.email" />
          </el-form-item>
        </el-col>

        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="手机号">
            <el-input v-model="form.phone" />
          </el-form-item>
        </el-col>

        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="部门">
            <el-select v-model="form.department" style="width: 100%">
              <el-option label="技术部" value="tech" />
              <el-option label="产品部" value="product" />
              <el-option label="运营部" value="operation" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useContainerResponsiveSpan } from '@/composables/useResponsiveSpan'

const isDev = import.meta.env.DEV
const visible = ref(false)

const form = reactive({
  username: '',
  email: '',
  phone: '',
  department: ''
})

// 容器响应式，自动查找 .el-dialog 容器
const {
  computedSpan,
  shouldUseCol,
  containerWidth,
  currentBreakpoint
} = useContainerResponsiveSpan('auto')

const handleSubmit = () => {
  console.log('提交表单:', form)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.debug-info {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
</style>
```

#### 自定义容器选择器

```vue
<template>
  <div class="custom-panel" ref="panelRef">
    <el-row :gutter="16">
      <el-col :span="computedSpan">
        <div class="panel-item">内容1</div>
      </el-col>
      <el-col :span="computedSpan">
        <div class="panel-item">内容2</div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { useContainerResponsiveSpan } from '@/composables/useResponsiveSpan'

// 指定自定义容器选择器
const { computedSpan } = useContainerResponsiveSpan('auto', '.custom-panel')
</script>
```

### useModalSizeResponsiveSpan（弹窗尺寸响应式）

基于 AModal 组件 size 属性的响应式组合函数，智能处理弹窗内的布局。

#### 函数签名

```typescript
function useModalSizeResponsiveSpan(
  spanProp: Ref<SpanType> | SpanType,
  modalSize?: Ref<string> | string
): {
  computedSpan: ComputedRef<number | undefined>
  shouldUseCol: ComputedRef<boolean>
}
```

#### 尺寸映射

Modal size 与断点的映射关系：

```typescript
const sizeToBreakpoint: Record<string, keyof ResponsiveSpan> = {
  small: 'sm',   // 小弹窗 → 小断点
  medium: 'md',  // 中弹窗 → 中断点
  large: 'lg',   // 大弹窗 → 大断点
  xl: 'xl'       // 超大弹窗 → 超大断点
}
```

#### 智能配置选择

根据弹窗尺寸选择最合适的响应式配置：

```typescript
const getConfigByModalSize = (size: string) => {
  // 小弹窗使用优化的配置，优先全宽布局
  if (size === 'small') {
    return SMALL_MODAL_RESPONSIVE_CONFIG
  }
  // 其他尺寸使用默认配置
  return DEFAULT_RESPONSIVE_CONFIG
}
```

#### 手机模式优先

在手机模式下，无论弹窗尺寸如何，都优先使用 xs/sm 断点的配置：

```typescript
// 优先使用实际屏幕断点（手机模式）
const screenBreakpoint = getActualScreenBreakpoint()
if ((screenBreakpoint === 'xs' || screenBreakpoint === 'sm') &&
    config[screenBreakpoint] !== undefined) {
  return config[screenBreakpoint]
}
```

#### 使用示例

```vue
<template>
  <AModal v-model="visible" :size="modalSize" title="用户表单">
    <el-form :model="form" label-width="100px">
      <el-row :gutter="16">
        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="姓名">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>

        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="年龄">
            <el-input-number v-model="form.age" :min="1" :max="120" />
          </el-form-item>
        </el-col>

        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="性别">
            <el-radio-group v-model="form.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </AModal>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useModalSizeResponsiveSpan } from '@/composables/useResponsiveSpan'

const visible = ref(false)
const modalSize = ref<'small' | 'medium' | 'large' | 'xl'>('medium')

const form = reactive({
  name: '',
  age: 18,
  gender: 'male'
})

// 基于弹窗尺寸的响应式
const { computedSpan, shouldUseCol } = useModalSizeResponsiveSpan('auto', modalSize)
</script>
```

## 高级用法

### 动态切换响应式模式

```vue
<template>
  <div class="responsive-demo">
    <el-card header="响应式模式切换">
      <el-radio-group v-model="currentMode" @change="handleModeChange">
        <el-radio-button value="screen">屏幕响应式</el-radio-button>
        <el-radio-button value="container">容器响应式</el-radio-button>
        <el-radio-button value="modal-size">Modal响应式</el-radio-button>
      </el-radio-group>

      <div v-if="currentMode === 'modal-size'" class="modal-size-selector">
        <span>弹窗尺寸：</span>
        <el-select v-model="modalSize" style="width: 120px">
          <el-option label="小" value="small" />
          <el-option label="中" value="medium" />
          <el-option label="大" value="large" />
          <el-option label="超大" value="xl" />
        </el-select>
      </div>

      <div class="demo-container" :style="containerStyle">
        <el-row :gutter="16">
          <el-col
            v-for="n in 6"
            :key="n"
            :span="computedSpan"
          >
            <div class="demo-item">{{ n }}</div>
          </el-col>
        </el-row>
      </div>

      <div class="info-panel">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="当前模式">{{ currentMode }}</el-descriptions-item>
          <el-descriptions-item label="计算 Span">{{ computedSpan }}</el-descriptions-item>
          <el-descriptions-item label="一行显示">{{ 24 / (computedSpan || 24) }} 个</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import {
  useScreenResponsiveSpan,
  useContainerResponsiveSpan,
  useModalSizeResponsiveSpan
} from '@/composables/useResponsiveSpan'

type Mode = 'screen' | 'container' | 'modal-size'

const currentMode = ref<Mode>('container')
const modalSize = ref('medium')
const containerWidth = ref(800)

// 不同模式的响应式结果
const screenResult = useScreenResponsiveSpan('auto')
const containerResult = useContainerResponsiveSpan('auto', '.demo-container')
const modalResult = useModalSizeResponsiveSpan('auto', modalSize)

// 根据当前模式选择结果
const computedSpan = computed(() => {
  switch (currentMode.value) {
    case 'screen':
      return screenResult.computedSpan.value
    case 'container':
      return containerResult.computedSpan.value
    case 'modal-size':
      return modalResult.computedSpan.value
    default:
      return 24
  }
})

// 容器样式
const containerStyle = computed(() => ({
  width: currentMode.value === 'container' ? `${containerWidth.value}px` : '100%',
  margin: '20px 0',
  padding: '16px',
  border: '1px dashed #ddd',
  borderRadius: '4px'
}))

const handleModeChange = (mode: Mode) => {
  console.log('切换到模式:', mode)
}
</script>

<style lang="scss" scoped>
.responsive-demo {
  .modal-size-selector {
    margin: 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .demo-item {
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
    border-radius: 4px;
    padding: 20px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .info-panel {
    margin-top: 16px;
  }
}
</style>
```

### 多表单项响应式布局

```vue
<template>
  <el-dialog v-model="visible" title="完整用户信息" width="80%">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <!-- 基本信息区域 -->
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="basicSpan">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>

        <el-col :span="basicSpan">
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="form.realName" placeholder="请输入真实姓名" />
          </el-form-item>
        </el-col>

        <el-col :span="basicSpan">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>

        <el-col :span="basicSpan">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 工作信息区域 -->
      <el-divider content-position="left">工作信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="workSpan">
          <el-form-item label="部门" prop="department">
            <el-tree-select
              v-model="form.department"
              :data="deptOptions"
              placeholder="请选择部门"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="workSpan">
          <el-form-item label="职位" prop="position">
            <el-select v-model="form.position" placeholder="请选择职位" style="width: 100%">
              <el-option label="工程师" value="engineer" />
              <el-option label="主管" value="supervisor" />
              <el-option label="经理" value="manager" />
              <el-option label="总监" value="director" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="workSpan">
          <el-form-item label="入职日期" prop="joinDate">
            <el-date-picker
              v-model="form.joinDate"
              type="date"
              placeholder="请选择入职日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 详细描述区域 - 始终全宽 -->
      <el-divider content-position="left">其他信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="fullSpan">
          <el-form-item label="个人简介" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入个人简介"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

const visible = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  realName: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  joinDate: '',
  description: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

const deptOptions = [
  { value: 'tech', label: '技术部', children: [
    { value: 'frontend', label: '前端组' },
    { value: 'backend', label: '后端组' }
  ]},
  { value: 'product', label: '产品部' },
  { value: 'operation', label: '运营部' }
]

// 基本信息：小屏全宽，大屏半宽
const { computedSpan: basicSpan } = useResponsiveSpan({
  xs: 24, sm: 24, md: 12, lg: 12, xl: 12
})

// 工作信息：小屏全宽，大屏三分之一宽
const { computedSpan: workSpan } = useResponsiveSpan({
  xs: 24, sm: 24, md: 12, lg: 8, xl: 8
})

// 描述信息：始终全宽
const { computedSpan: fullSpan } = useResponsiveSpan(24)

const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    console.log('表单数据:', form)
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 打开弹窗
const open = () => {
  visible.value = true
}

defineExpose({ open })
</script>
```

### 响应式卡片网格

```vue
<template>
  <div class="card-grid-demo">
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品..."
        prefix-icon="Search"
        style="width: 300px"
      />

      <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px">
        <el-option label="默认排序" value="default" />
        <el-option label="价格升序" value="price_asc" />
        <el-option label="价格降序" value="price_desc" />
        <el-option label="销量优先" value="sales" />
      </el-select>
    </div>

    <el-row :gutter="16">
      <el-col
        v-for="product in filteredProducts"
        :key="product.id"
        :span="cardSpan"
        class="card-col"
      >
        <el-card :body-style="{ padding: '0' }" shadow="hover">
          <img :src="product.image" class="product-image" :alt="product.name" />

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>

            <div class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">
                ¥{{ product.originalPrice }}
              </span>
            </div>

            <div class="product-actions">
              <el-button type="primary" size="small">加入购物车</el-button>
              <el-button size="small">收藏</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="filteredProducts.length === 0" description="暂无商品" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useScreenResponsiveSpan } from '@/composables/useResponsiveSpan'

interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  sales: number
}

const searchKeyword = ref('')
const sortBy = ref('default')

const products = ref<Product[]>([
  { id: 1, name: '商品A', description: '这是商品A的描述', price: 99, originalPrice: 199, image: '/images/product1.jpg', sales: 1000 },
  { id: 2, name: '商品B', description: '这是商品B的描述', price: 199, image: '/images/product2.jpg', sales: 800 },
  { id: 3, name: '商品C', description: '这是商品C的描述', price: 299, originalPrice: 399, image: '/images/product3.jpg', sales: 500 },
  { id: 4, name: '商品D', description: '这是商品D的描述', price: 399, image: '/images/product4.jpg', sales: 300 },
  { id: 5, name: '商品E', description: '这是商品E的描述', price: 499, originalPrice: 699, image: '/images/product5.jpg', sales: 200 },
  { id: 6, name: '商品F', description: '这是商品F的描述', price: 599, image: '/images/product6.jpg', sales: 100 }
])

// 响应式卡片网格
const { computedSpan: cardSpan } = useScreenResponsiveSpan({
  xs: 24,  // 手机：1列
  sm: 12,  // 平板：2列
  md: 8,   // 桌面：3列
  lg: 6,   // 大屏：4列
  xl: 4    // 超大屏：6列
})

// 过滤和排序商品
const filteredProducts = computed(() => {
  let result = [...products.value]

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
  }

  return result
})
</script>

<style lang="scss" scoped>
.card-grid-demo {
  .toolbar {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card-col {
    margin-bottom: 16px;
  }

  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .product-info {
    padding: 14px;
  }

  .product-name {
    margin: 0 0 8px;
    font-size: 16px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-desc {
    margin: 0 0 12px;
    color: #999;
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price {
    margin-bottom: 12px;

    .current-price {
      color: #f56c6c;
      font-size: 18px;
      font-weight: bold;
    }

    .original-price {
      margin-left: 8px;
      color: #999;
      font-size: 14px;
      text-decoration: line-through;
    }
  }

  .product-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
```

### 抽屉表单响应式

```vue
<template>
  <el-drawer
    v-model="visible"
    title="编辑设置"
    :size="drawerSize"
    direction="rtl"
  >
    <el-form :model="settings" label-position="top">
      <el-row :gutter="16">
        <el-col :span="settingSpan">
          <el-form-item label="主题色">
            <el-color-picker v-model="settings.primaryColor" />
          </el-form-item>
        </el-col>

        <el-col :span="settingSpan">
          <el-form-item label="布局模式">
            <el-select v-model="settings.layout" style="width: 100%">
              <el-option label="侧边菜单" value="side" />
              <el-option label="顶部菜单" value="top" />
              <el-option label="混合菜单" value="mix" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="settingSpan">
          <el-form-item label="固定头部">
            <el-switch v-model="settings.fixedHeader" />
          </el-form-item>
        </el-col>

        <el-col :span="settingSpan">
          <el-form-item label="显示面包屑">
            <el-switch v-model="settings.showBreadcrumb" />
          </el-form-item>
        </el-col>

        <el-col :span="settingSpan">
          <el-form-item label="显示标签页">
            <el-switch v-model="settings.showTabs" />
          </el-form-item>
        </el-col>

        <el-col :span="settingSpan">
          <el-form-item label="页面动画">
            <el-select v-model="settings.pageTransition" style="width: 100%">
              <el-option label="无动画" value="none" />
              <el-option label="淡入淡出" value="fade" />
              <el-option label="滑动" value="slide" />
              <el-option label="缩放" value="zoom" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useContainerResponsiveSpan } from '@/composables/useResponsiveSpan'

const visible = ref(false)
const drawerSize = ref('30%')

const settings = reactive({
  primaryColor: '#409EFF',
  layout: 'side',
  fixedHeader: true,
  showBreadcrumb: true,
  showTabs: true,
  pageTransition: 'fade'
})

// 使用容器响应式，指定抽屉容器
const { computedSpan: settingSpan } = useContainerResponsiveSpan({
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12
}, '.el-drawer')

const handleReset = () => {
  Object.assign(settings, {
    primaryColor: '#409EFF',
    layout: 'side',
    fixedHeader: true,
    showBreadcrumb: true,
    showTabs: true,
    pageTransition: 'fade'
  })
}

const handleSave = () => {
  console.log('保存设置:', settings)
  visible.value = false
}

const open = () => {
  visible.value = true
}

defineExpose({ open })
</script>
```

### 与 AModal 集成

AModal 组件通过 `provide` 注入 `modalSize`，useResponsiveSpan 可以自动获取：

```vue
<!-- AModal 组件内部实现 -->
<script lang="ts" setup>
import { provide, toRef } from 'vue'

const props = defineProps<{
  size?: 'small' | 'medium' | 'large' | 'xl'
}>()

// 注入 modalSize 供子组件使用
provide('modalSize', toRef(props, 'size'))
</script>
```

```vue
<!-- 在 AModal 中使用 useResponsiveSpan -->
<template>
  <AModal v-model="visible" size="medium" title="用户表单">
    <el-form :model="form" label-width="100px">
      <el-row :gutter="16">
        <!-- 自动获取 AModal 的 size，无需手动传递 -->
        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="用户名">
            <el-input v-model="form.username" />
          </el-form-item>
        </el-col>

        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </AModal>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

const visible = ref(false)
const form = reactive({
  username: '',
  password: ''
})

// 自动检测在 AModal 中，使用 modal-size 模式
// 并自动获取注入的 modalSize
const { computedSpan, shouldUseCol } = useResponsiveSpan('auto')
</script>
```

## API 参考

### SpanType 类型

```typescript
/**
 * Span 配置类型
 */
type SpanType =
  | undefined          // 不使用 el-col 包装
  | number            // 固定 span 值 (1-24)
  | string            // 数字字符串 ("12") 或 'auto'
  | ResponsiveSpan    // 自定义响应式配置对象
```

### ResponsiveSpan 接口

```typescript
/**
 * 响应式断点配置
 */
interface ResponsiveSpan {
  xs?: number  // 超小屏/容器断点的 span 值
  sm?: number  // 小屏/容器断点的 span 值
  md?: number  // 中屏/容器断点的 span 值
  lg?: number  // 大屏/容器断点的 span 值
  xl?: number  // 超大屏/容器断点的 span 值
}
```

### useResponsiveSpan 选项

```typescript
/**
 * useResponsiveSpan 配置选项
 */
interface UseResponsiveSpanOptions {
  /**
   * 响应式模式
   * - 'screen': 基于屏幕尺寸
   * - 'container': 基于容器宽度
   * - 'modal-size': 基于弹窗尺寸
   */
  mode?: 'screen' | 'container' | 'modal-size'

  /**
   * 弹窗尺寸，用于 modal-size 模式
   * 可以是响应式 Ref 或普通字符串
   */
  modalSize?: Ref<string> | string

  /**
   * 容器选择器，用于 container 模式
   * 默认查找 .el-dialog 或 .el-drawer
   */
  containerSelector?: string
}
```

### 返回值类型

```typescript
/**
 * 基础返回值（所有模式通用）
 */
interface BaseResponsiveSpanReturn {
  /**
   * 计算后的 span 值
   * undefined 表示不使用 el-col 包装
   */
  computedSpan: ComputedRef<number | undefined>

  /**
   * 是否应该使用 el-col 包装
   * 当 computedSpan 不为 undefined 时为 true
   */
  shouldUseCol: ComputedRef<boolean>
}

/**
 * 容器响应式额外返回值
 */
interface ContainerResponsiveSpanReturn extends BaseResponsiveSpanReturn {
  /**
   * 当前容器宽度（只读）
   */
  containerWidth: Readonly<Ref<number>>

  /**
   * 当前断点名称（只读）
   * 值为 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   */
  currentBreakpoint: Readonly<Ref<string>>
}
```

### 断点配置常量

```typescript
/**
 * 屏幕断点配置（CSS Media Query）
 */
const SCREEN_BREAKPOINTS = {
  xs: '(max-width: 767px)',
  sm: '(min-width: 768px) and (max-width: 991px)',
  md: '(min-width: 992px) and (max-width: 1199px)',
  lg: '(min-width: 1200px) and (max-width: 1919px)',
  xl: '(min-width: 1920px)'
} as const

/**
 * 容器断点配置（像素值）
 */
const CONTAINER_BREAKPOINTS = {
  xs: 480,
  sm: 600,
  md: 800,
  lg: 1000,
  xl: 1200
} as const

/**
 * 默认响应式配置
 */
const DEFAULT_RESPONSIVE_CONFIG: ResponsiveSpan = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 8
}

/**
 * 小弹窗优化配置
 */
const SMALL_MODAL_RESPONSIVE_CONFIG: ResponsiveSpan = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 8
}
```

### Modal Size 映射

```typescript
/**
 * Modal size 到断点的映射
 */
const sizeToBreakpoint: Record<string, keyof ResponsiveSpan> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
  xl: 'xl'
}
```

## 最佳实践

### 1. 选择合适的响应式模式

```typescript
// ✅ 全屏页面使用屏幕响应式
const { computedSpan } = useResponsiveSpan('auto', { mode: 'screen' })

// ✅ 弹窗/抽屉使用容器响应式
const { computedSpan } = useResponsiveSpan('auto', { mode: 'container' })

// ✅ AModal 内部使用 modal-size 模式（通常自动检测）
const { computedSpan } = useResponsiveSpan('auto', { mode: 'modal-size' })

// ✅ 不确定时使用统一入口，让系统自动选择
const { computedSpan } = useResponsiveSpan('auto')
```

### 2. 合理使用 shouldUseCol

```vue
<template>
  <el-row :gutter="16">
    <!-- ✅ 使用 shouldUseCol 条件渲染，避免不必要的 el-col -->
    <el-col v-if="shouldUseCol" :span="computedSpan">
      <div class="content">内容</div>
    </el-col>
    <div v-else class="content">内容</div>
  </el-row>
</template>

<script lang="ts" setup>
// 当 span 为 undefined 时，shouldUseCol 为 false
const { computedSpan, shouldUseCol } = useResponsiveSpan(undefined)
</script>
```

### 3. 不同区域使用不同配置

```typescript
// ✅ 根据内容类型定制响应式配置

// 基础表单项：小屏全宽，大屏双列
const { computedSpan: basicSpan } = useResponsiveSpan({
  xs: 24, sm: 24, md: 12, lg: 12, xl: 12
})

// 日期时间选择器：通常需要更宽
const { computedSpan: dateSpan } = useResponsiveSpan({
  xs: 24, sm: 24, md: 24, lg: 12, xl: 12
})

// 长文本输入：始终全宽
const { computedSpan: textareaSpan } = useResponsiveSpan(24)

// 开关类控件：可以更紧凑
const { computedSpan: switchSpan } = useResponsiveSpan({
  xs: 12, sm: 8, md: 6, lg: 6, xl: 4
})
```

### 4. 配合 AForm 组件使用

```vue
<template>
  <AForm
    v-model="formData"
    :schema="formSchema"
    :span="formSpan"
    label-width="100px"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

const formData = ref({})

// 在 AForm 中使用响应式 span
const { computedSpan: formSpan } = useResponsiveSpan('auto')

const formSchema = [
  { field: 'username', label: '用户名', component: 'Input' },
  { field: 'email', label: '邮箱', component: 'Input' },
  { field: 'phone', label: '手机号', component: 'Input' }
]
</script>
```

### 5. 监听容器宽度变化

```vue
<template>
  <div class="responsive-panel">
    <div class="debug-bar" v-if="isDev">
      容器宽度: {{ containerWidth }}px | 断点: {{ currentBreakpoint }}
    </div>

    <el-row :gutter="16">
      <el-col :span="computedSpan">
        <div class="content">内容</div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useContainerResponsiveSpan } from '@/composables/useResponsiveSpan'

const isDev = import.meta.env.DEV

const {
  computedSpan,
  containerWidth,
  currentBreakpoint
} = useContainerResponsiveSpan('auto', '.responsive-panel')

// 监听断点变化
watch(currentBreakpoint, (newBreakpoint, oldBreakpoint) => {
  console.log(`断点从 ${oldBreakpoint} 变为 ${newBreakpoint}`)
})

// 监听容器宽度变化
watch(containerWidth, (newWidth) => {
  console.log(`容器宽度: ${newWidth}px`)
})
</script>
```

### 6. 响应式配置的可维护性

```typescript
// ✅ 将常用配置抽取为常量，便于复用和维护

// 表单配置集合
export const FORM_SPAN_CONFIGS = {
  // 基础表单项
  basic: {
    xs: 24, sm: 24, md: 12, lg: 12, xl: 12
  },
  // 日期时间
  datetime: {
    xs: 24, sm: 24, md: 24, lg: 12, xl: 12
  },
  // 全宽
  full: 24,
  // 开关控件
  switch: {
    xs: 12, sm: 8, md: 6, lg: 6, xl: 4
  }
} as const

// 使用时
const { computedSpan } = useResponsiveSpan(FORM_SPAN_CONFIGS.basic)
```

## 常见问题

### 1. 容器响应式不生效

**问题描述**: 使用 `useContainerResponsiveSpan` 时，布局没有响应式变化。

**可能原因**:
- DOM 尚未渲染完成
- 容器选择器不正确
- 容器没有设置明确的宽度

**解决方案**:

```vue
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'
import { useContainerResponsiveSpan } from '@/composables/useResponsiveSpan'

// 确保在 onMounted 后使用
onMounted(async () => {
  await nextTick()
  // 此时 DOM 已渲染完成
})

// 使用正确的容器选择器
const { computedSpan, containerWidth } = useContainerResponsiveSpan(
  'auto',
  '.my-container'  // 确保选择器正确
)

// 检查容器宽度是否正常获取
watch(containerWidth, (width) => {
  console.log('容器宽度:', width)
  if (width === 0) {
    console.warn('容器宽度为0，请检查容器是否正确渲染')
  }
})
</script>
```

### 2. AModal 中 modalSize 获取失败

**问题描述**: 在 AModal 中使用 `useResponsiveSpan`，但没有正确获取弹窗尺寸。

**可能原因**:
- AModal 没有正确 provide modalSize
- 组件层级问题

**解决方案**:

```vue
<script lang="ts" setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

// 方案1：明确指定 modalSize
const { computedSpan } = useResponsiveSpan('auto', {
  mode: 'modal-size',
  modalSize: 'medium'  // 手动指定
})

// 方案2：使用容器响应式作为备选
const { computedSpan } = useResponsiveSpan('auto', {
  mode: 'container'
})
</script>
```

### 3. 断点跳跃导致布局抖动

**问题描述**: 在断点临界值附近，布局频繁变化导致视觉抖动。

**解决方案**:

```typescript
// 使用防抖或节流处理
import { useDebounceFn } from '@vueuse/core'

const { computedSpan, containerWidth } = useContainerResponsiveSpan('auto')

// 对容器宽度变化进行防抖处理
const debouncedWidth = ref(containerWidth.value)
const updateWidth = useDebounceFn(() => {
  debouncedWidth.value = containerWidth.value
}, 100)

watch(containerWidth, updateWidth)
```

### 4. 如何自定义断点配置

**问题描述**: 默认断点配置不符合项目需求。

**解决方案**:

```typescript
// 创建自定义的响应式配置
const customResponsiveConfig = {
  xs: 24,  // < 576px
  sm: 12,  // 576px - 768px
  md: 8,   // 768px - 992px
  lg: 6,   // 992px - 1200px
  xl: 4    // > 1200px
}

const { computedSpan } = useResponsiveSpan(customResponsiveConfig)

// 如果需要完全自定义断点逻辑，可以封装自己的组合函数
function useCustomResponsiveSpan(config: ResponsiveSpan) {
  const windowWidth = useWindowSize().width

  const computedSpan = computed(() => {
    if (windowWidth.value < 576) return config.xs
    if (windowWidth.value < 768) return config.sm
    if (windowWidth.value < 992) return config.md
    if (windowWidth.value < 1200) return config.lg
    return config.xl
  })

  return { computedSpan }
}
```

### 5. 如何在非 Vue 组件中使用

**问题描述**: 需要在工具函数或 Pinia store 中使用响应式栅格计算。

**解决方案**:

```typescript
// 在 Pinia store 中
import { defineStore } from 'pinia'
import { useMediaQuery } from '@vueuse/core'

export const useLayoutStore = defineStore('layout', () => {
  // 屏幕断点检测
  const isXs = useMediaQuery('(max-width: 767px)')
  const isSm = useMediaQuery('(min-width: 768px) and (max-width: 991px)')
  const isMd = useMediaQuery('(min-width: 992px) and (max-width: 1199px)')
  const isLg = useMediaQuery('(min-width: 1200px) and (max-width: 1919px)')
  const isXl = useMediaQuery('(min-width: 1920px)')

  const currentBreakpoint = computed(() => {
    if (isXl.value) return 'xl'
    if (isLg.value) return 'lg'
    if (isMd.value) return 'md'
    if (isSm.value) return 'sm'
    return 'xs'
  })

  // 计算默认表单 span
  const defaultFormSpan = computed(() => {
    const config = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8 }
    return config[currentBreakpoint.value as keyof typeof config]
  })

  return {
    currentBreakpoint,
    defaultFormSpan,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl
  }
})
```

### 6. ResizeObserver 内存泄漏

**问题描述**: 担心 ResizeObserver 可能导致内存泄漏。

**说明**: `useContainerResponsiveSpan` 已经内置了清理逻辑，在 `onUnmounted` 时自动断开 ResizeObserver。

```typescript
// 源码中的清理逻辑
const cleanup = () => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
    resizeObserver.value = null
  }
}

onUnmounted(() => {
  cleanup()
})
```

如果需要手动控制，可以：

```typescript
import { onBeforeUnmount } from 'vue'

const { computedSpan, containerWidth } = useContainerResponsiveSpan('auto')

// 在特定条件下手动清理（通常不需要）
onBeforeUnmount(() => {
  // 组合函数会自动清理，这里只是示例
})
```

## 注意事项

1. **容器响应式依赖 DOM**: `useContainerResponsiveSpan` 需要 DOM 渲染完成后才能正确计算宽度，建议在 `onMounted` 后使用

2. **Modal 响应式依赖注入**: `useModalSizeResponsiveSpan` 需要父级 AModal 正确 provide `modalSize`

3. **shouldUseCol 的重要性**: 当 span 为 `undefined` 时，应该不使用 `el-col` 包装，使用 `shouldUseCol` 条件渲染可以避免不必要的 DOM 结构

4. **ResizeObserver 兼容性**: 现代浏览器都支持 ResizeObserver，但在旧版浏览器中可能需要 polyfill

5. **响应式配置的合并**: 自定义配置会与默认配置合并，未指定的断点会使用默认值

6. **数字字符串的处理**: 传入 `"12"` 这样的字符串会被转换为数字 `12`，而非响应式配置

7. **智能模式选择的优先级**: 当不指定 mode 时，如果检测到 modalSize（通过 inject 或 props），会优先使用 `modal-size` 模式
