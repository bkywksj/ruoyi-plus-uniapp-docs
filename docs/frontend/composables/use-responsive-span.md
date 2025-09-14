# useResponsiveSpan

响应式栅格组合函数，提供统一的响应式栅格计算逻辑，包含屏幕响应式、容器响应式等多种模式。

## 📋 功能特性

- **屏幕响应式**: 基于屏幕尺寸的响应式布局
- **容器响应式**: 基于容器宽度的响应式布局
- **Modal 尺寸响应式**: 基于弹窗尺寸的响应式布局
- **自动断点检测**: 智能检测当前环境的断点
- **配置灵活**: 支持自定义断点配置
- **统一接口**: 提供统一的 API 接口

## 🎯 基础用法

### 屏幕响应式

基于屏幕尺寸进行响应式布局：

```vue
<template>
  <el-row>
    <el-col v-if="shouldUseCol" :span="computedSpan">
      <div class="form-item">内容</div>
    </el-col>
    <div v-else class="form-item">内容</div>
  </el-row>
</template>

<script setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

// 自动响应式配置
const { computedSpan, shouldUseCol } = useResponsiveSpan('auto', {
  mode: 'screen'
})

// 自定义响应式配置
const customSpan = ref({
  xs: 24,  // 手机端全宽
  sm: 12,  // 平板端一行两个
  md: 8,   // 桌面端一行三个
  lg: 6,   // 大屏一行四个
  xl: 4    // 超大屏一行六个
})
const { computedSpan: customComputedSpan } = useResponsiveSpan(customSpan, {
  mode: 'screen'
})
</script>
```

### 容器响应式

基于容器宽度进行响应式布局，适用于弹窗、抽屉等场景：

```vue
<template>
  <el-dialog v-model="visible" title="用户信息">
    <el-form>
      <el-row>
        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="用户名">
            <el-input v-model="form.username" />
          </el-form-item>
        </el-col>
        <div v-else class="form-item">
          <el-form-item label="用户名">
            <el-input v-model="form.username" />
          </el-form-item>
        </div>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

const visible = ref(false)

// 容器响应式，自动查找最近的 .el-dialog 容器
const { computedSpan, shouldUseCol, containerWidth } = useResponsiveSpan('auto', {
  mode: 'container'
})

// 指定容器选择器
const { computedSpan: customSpan } = useResponsiveSpan('auto', {
  mode: 'container',
  containerSelector: '.my-custom-container'
})
</script>
```

### Modal 尺寸响应式

基于 AModal 的 size 属性进行响应式布局：

```vue
<template>
  <AModal v-model="visible" :size="modalSize">
    <el-form>
      <el-row>
        <el-col v-if="shouldUseCol" :span="computedSpan">
          <el-form-item label="标题">
            <el-input v-model="form.title" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </AModal>
</template>

<script setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

const visible = ref(false)
const modalSize = ref('medium')

const { computedSpan, shouldUseCol } = useResponsiveSpan('auto', {
  mode: 'modal-size',
  modalSize
})
</script>
```

## 🔧 配置选项

### SpanType 类型

```typescript
type SpanType = 
  | undefined          // 不使用 el-col 包装
  | number            // 固定 span 值
  | 'auto'            // 使用默认响应式配置
  | ResponsiveSpan    // 自定义响应式配置

interface ResponsiveSpan {
  xs?: number  // 超小屏/容器 (< 480px)
  sm?: number  // 小屏/容器 (480-600px)
  md?: number  // 中屏/容器 (600-800px)
  lg?: number  // 大屏/容器 (800-1000px)
  xl?: number  // 超大屏/容器 (> 1000px)
}
```

### 默认响应式配置

```javascript
const DEFAULT_RESPONSIVE_CONFIG = {
  xs: 24,  // 超小屏：全宽
  sm: 24,  // 小屏：全宽
  md: 12,  // 中屏：一行两个
  lg: 12,  // 大屏：一行两个
  xl: 8    // 超大屏：一行三个
}
```

### 断点配置

#### 屏幕断点
```javascript
const SCREEN_BREAKPOINTS = {
  xs: '(max-width: 767px)',
  sm: '(min-width: 768px) and (max-width: 991px)',
  md: '(min-width: 992px) and (max-width: 1199px)',
  lg: '(min-width: 1200px) and (max-width: 1919px)',
  xl: '(min-width: 1920px)'
}
```

#### 容器断点
```javascript
const CONTAINER_BREAKPOINTS = {
  xs: 480,   // 超小容器
  sm: 600,   // 小容器
  md: 800,   // 中等容器
  lg: 1000,  // 大容器
  xl: 1200   // 超大容器
}
```

## 🎨 高级用法

### 动态切换模式

```vue
<template>
  <div>
    <el-radio-group v-model="mode">
      <el-radio value="screen">屏幕响应式</el-radio>
      <el-radio value="container">容器响应式</el-radio>
      <el-radio value="modal-size">Modal响应式</el-radio>
    </el-radio-group>
    
    <el-row>
      <el-col v-if="shouldUseCol" :span="computedSpan">
        <div class="content">响应式内容</div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

const mode = ref('container')
const modalSize = ref('medium')

const { computedSpan, shouldUseCol } = useResponsiveSpan('auto', {
  mode,
  modalSize
})
</script>
```

### 自定义断点配置

```vue
<script setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

// 表单场景：小屏单列，大屏双列
const formSpan = ref({
  xs: 24,  // 手机单列
  sm: 24,  // 平板单列
  md: 12,  // 桌面双列
  lg: 12,  // 大屏双列
  xl: 12   // 超大屏双列
})

// 卡片场景：响应式网格
const cardSpan = ref({
  xs: 24,  // 手机单列
  sm: 12,  // 平板双列
  md: 8,   // 桌面三列
  lg: 6,   // 大屏四列
  xl: 4    // 超大屏六列
})

const { computedSpan: formComputedSpan } = useResponsiveSpan(formSpan)
const { computedSpan: cardComputedSpan } = useResponsiveSpan(cardSpan)
</script>
```

### 容器宽度监听

```vue
<template>
  <div>
    <p>当前容器宽度: {{ containerWidth }}px</p>
    <p>当前断点: {{ currentBreakpoint }}</p>
    <p>计算的span: {{ computedSpan }}</p>
  </div>
</template>

<script setup>
import { useContainerResponsiveSpan } from '@/composables/useResponsiveSpan'

const { 
  computedSpan, 
  shouldUseCol, 
  containerWidth, 
  currentBreakpoint 
} = useContainerResponsiveSpan('auto')
</script>
```

## 🎯 实际应用场景

### 表单布局

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="16">
      <!-- 用户基本信息 -->
      <el-col :span="basicInfoSpan">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
      </el-col>
      
      <el-col :span="basicInfoSpan">
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
      </el-col>
      
      <!-- 详细信息在小屏时独占一行 -->
      <el-col :span="detailSpan">
        <el-form-item label="详细描述">
          <el-input type="textarea" v-model="form.description" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

// 基本信息：小屏全宽，大屏半宽
const { computedSpan: basicInfoSpan } = useResponsiveSpan({
  xs: 24, sm: 24, md: 12, lg: 12, xl: 12
})

// 详细信息：始终全宽
const { computedSpan: detailSpan } = useResponsiveSpan(24)
</script>
```

### 卡片网格

```vue
<template>
  <el-row :gutter="16">
    <el-col 
      v-for="item in items" 
      :key="item.id"
      :span="cardSpan"
    >
      <el-card>{{ item.title }}</el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

// 响应式卡片网格
const { computedSpan: cardSpan } = useResponsiveSpan({
  xs: 24,  // 手机：1列
  sm: 12,  // 平板：2列
  md: 8,   // 桌面：3列
  lg: 6,   // 大屏：4列
  xl: 4    // 超大屏：6列
})
</script>
```

## 🔍 返回值

### useScreenResponsiveSpan
```typescript
{
  computedSpan: ComputedRef<number | undefined>
  shouldUseCol: ComputedRef<boolean>
}
```

### useContainerResponsiveSpan
```typescript
{
  computedSpan: ComputedRef<number | undefined>
  shouldUseCol: ComputedRef<boolean>
  containerWidth: Readonly<Ref<number>>
  currentBreakpoint: Readonly<Ref<string>>
}
```

### useModalSizeResponsiveSpan
```typescript
{
  computedSpan: ComputedRef<number | undefined>
  shouldUseCol: ComputedRef<boolean>
}
```

## ⚠️ 注意事项

1. **容器响应式**需要 DOM 渲染完成后才能正确计算宽度
2. **Modal 响应式**依赖于 AModal 组件的 size 属性
3. 使用 `shouldUseCol` 判断是否需要 `el-col` 包装器
4. 容器响应式会创建 `ResizeObserver`，组件卸载时会自动清理

## 🎯 最佳实践

- 根据使用场景选择合适的响应式模式
- 使用 `shouldUseCol` 条件渲染避免不必要的 DOM 结构
- 在弹窗场景推荐使用容器响应式
- 合理设置断点配置，确保各种屏幕下的良好体验
