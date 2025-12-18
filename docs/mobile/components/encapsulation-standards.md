# 组件封装规范

## 介绍

本文档定义了 RuoYi-Plus-UniApp 项目中组件封装的规范标准，包括命名规则、代码组织、类型定义、样式规范等内容，确保团队开发的一致性和代码质量。

**规范要点:**

- **命名规范** - 统一的文件、组件、变量命名规则
- **代码组织** - 规范的代码结构和顺序
- **类型规范** - TypeScript 类型定义标准
- **样式规范** - SCSS 和 BEM 命名约定
- **文档规范** - 组件文档和注释标准

## 命名规范

### 文件命名

```
# 组件文件：小写连字符
user-card.vue          ✅
UserCard.vue           ❌
userCard.vue           ❌

# 类型文件
types.ts               ✅
user-card.types.ts     ✅

# 导出文件
index.ts               ✅
```

### 组件名称

```typescript
// 组件名使用 PascalCase
defineOptions({
  name: 'UserCard',        // ✅
  // name: 'user-card',    // ❌
  // name: 'userCard',     // ❌
})
```

### Props 接口命名

```typescript
// 接口名：组件名 + Props
interface UserCardProps { }     // ✅
interface IUserCardProps { }    // ❌
interface UserCardPropsType { } // ❌
```

### Emits 接口命名

```typescript
// 接口名：组件名 + Emits
interface UserCardEmits { }     // ✅
interface UserCardEvents { }    // ❌
```

### 变量命名

```typescript
// 响应式变量：camelCase
const isLoading = ref(false)    // ✅
const is_loading = ref(false)   // ❌

// 常量：SCREAMING_SNAKE_CASE
const MAX_COUNT = 100           // ✅
const maxCount = 100            // ❌（用于常量时）

// 函数：camelCase + 动词前缀
const handleClick = () => { }   // ✅
const onClick = () => { }       // ✅
const click = () => { }         // ❌
```

### CSS 类名

```scss
// BEM 命名规范
.user-card { }                  // Block
.user-card__header { }          // Element
.user-card--large { }           // Modifier
.user-card.is-active { }        // State
```

## 代码组织

### 组件结构顺序

```vue
<template>
  <!-- 1. 模板内容 -->
</template>

<script lang="ts" setup>
// 2. 导入语句（按类型分组）
import { ref, computed, watch, onMounted } from 'vue'
import type { UserCardProps, UserCardEmits } from './types'
import { formatDate } from '@/utils/date'

// 3. 组件配置
defineOptions({
  name: 'UserCard',
  options: {
    virtualHost: true,
    styleIsolation: 'shared'
  }
})

// 4. Props 定义
const props = withDefaults(defineProps<UserCardProps>(), {
  size: 'medium'
})

// 5. Emits 定义
const emit = defineEmits<UserCardEmits>()

// 6. 响应式状态
const isLoading = ref(false)
const currentIndex = ref(0)

// 7. 计算属性
const rootClass = computed(() => [...])
const displayValue = computed(() => [...])

// 8. 侦听器
watch(() => props.value, (val) => { ... })

// 9. 方法定义
const handleClick = () => { ... }
const loadData = async () => { ... }

// 10. 生命周期
onMounted(() => { ... })

// 11. 暴露方法（如需要）
defineExpose({
  refresh: loadData
})
</script>

<style lang="scss" scoped>
// 12. 样式
</style>
```

### 导入语句分组

```typescript
// 1. Vue 核心
import { ref, computed, watch } from 'vue'

// 2. 类型导入
import type { PropType } from 'vue'
import type { UserInfo } from '@/types'

// 3. 第三方库
import dayjs from 'dayjs'

// 4. 项目内部模块
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'

// 5. 组件导入
import UserAvatar from '../user-avatar/user-avatar.vue'

// 6. 本地模块
import type { UserCardProps } from './types'
```

## 类型规范

### Props 类型定义

```typescript
// types.ts
/**
 * 用户卡片属性
 */
export interface UserCardProps {
  /**
   * 用户 ID
   */
  userId: string

  /**
   * 用户名称
   */
  name?: string

  /**
   * 头像地址
   */
  avatar?: string

  /**
   * 卡片尺寸
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * 是否显示徽章
   * @default false
   */
  showBadge?: boolean

  /**
   * 自定义类名
   */
  customClass?: string

  /**
   * 自定义样式
   */
  customStyle?: Record<string, string>
}
```

### Emits 类型定义

```typescript
/**
 * 用户卡片事件
 */
export interface UserCardEmits {
  /**
   * 点击事件
   */
  (e: 'click', userId: string): void

  /**
   * 加载完成事件
   */
  (e: 'load', data: UserInfo): void

  /**
   * 错误事件
   */
  (e: 'error', error: Error): void
}
```

### 内部类型定义

```typescript
// 组件内部状态类型
interface ComponentState {
  loading: boolean
  error: Error | null
  data: DataItem[]
}

// 方法参数类型
interface LoadOptions {
  page?: number
  pageSize?: number
  refresh?: boolean
}
```

### 类型导出

```typescript
// types.ts
export interface UserCardProps { ... }
export interface UserCardEmits { ... }
export type UserCardSize = 'small' | 'medium' | 'large'
export type UserCardInstance = InstanceType<typeof UserCard>

// index.ts
export { default as UserCard } from './user-card.vue'
export * from './types'
```

## 样式规范

### BEM 命名

```scss
// Block
.user-card {
  display: flex;
  padding: 24rpx;

  // Element
  &__avatar {
    width: 80rpx;
    height: 80rpx;
  }

  &__content {
    flex: 1;
  }

  &__title {
    font-size: 32rpx;
  }

  &__desc {
    font-size: 24rpx;
    color: #999;
  }

  // Modifier
  &--small {
    padding: 16rpx;

    .user-card__avatar {
      width: 60rpx;
      height: 60rpx;
    }
  }

  &--large {
    padding: 32rpx;

    .user-card__avatar {
      width: 100rpx;
      height: 100rpx;
    }
  }

  // State
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.is-loading {
    .user-card__content {
      visibility: hidden;
    }
  }
}
```

### 变量使用

```scss
// 使用项目定义的变量
.user-card {
  // 颜色变量
  color: $-color-content;
  background: $-color-white;
  border-color: $-color-border;

  // 字号变量
  font-size: $-fs-content;

  &__title {
    font-size: $-fs-title;
    color: $-color-title;
  }

  &__desc {
    font-size: $-fs-secondary;
    color: $-color-aid;
  }
}
```

### 响应式单位

```scss
.user-card {
  // 使用 rpx 实现响应式
  width: 690rpx;
  padding: 24rpx 32rpx;
  margin: 24rpx 0;
  border-radius: 16rpx;

  // 边框使用 px（保持 1 像素清晰）
  border: 1px solid #eee;

  // 字号使用 rpx
  font-size: 28rpx;
  line-height: 40rpx;
}
```

### 层级管理

```scss
// z-index 层级定义
$zindex-dropdown: 1000;
$zindex-sticky: 1020;
$zindex-fixed: 1030;
$zindex-modal-backdrop: 1040;
$zindex-modal: 1050;
$zindex-popover: 1060;
$zindex-tooltip: 1070;
$zindex-toast: 1080;
```

## 文档规范

### 组件文档结构

```markdown
# 组件名称

## 介绍

组件功能描述...

## 基本用法

### 示例 1

```vue
<template>
  <user-card :name="name" />
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 名称 | `string` | - |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击 | - |

## Slots

| 名称 | 说明 |
|------|------|
| default | 默认内容 |
```

### 代码注释

```typescript
/**
 * 用户卡片组件
 * @description 用于展示用户基本信息的卡片组件
 * @example
 * ```vue
 * <user-card :user-id="123" @click="handleClick" />
 * ```
 */

/**
 * 加载用户数据
 * @param userId - 用户 ID
 * @param options - 加载选项
 * @returns 用户信息
 */
const loadUserData = async (
  userId: string,
  options?: LoadOptions
): Promise<UserInfo> => {
  // ...
}
```

## Props 设计原则

### 1. 使用语义化命名

```typescript
// ✅ 好的命名
interface Props {
  showHeader: boolean
  enableDrag: boolean
  maxLength: number
}

// ❌ 不好的命名
interface Props {
  sh: boolean        // 不清晰
  flag1: boolean     // 无意义
  num: number        // 不明确
}
```

### 2. 提供合理默认值

```typescript
const props = withDefaults(defineProps<Props>(), {
  // 常用默认值
  size: 'medium',
  disabled: false,
  loading: false,
  // 数组和对象使用工厂函数
  list: () => [],
  config: () => ({})
})
```

### 3. 布尔值命名约定

```typescript
interface Props {
  // is/has/can/show 前缀
  isActive: boolean
  hasHeader: boolean
  canEdit: boolean
  showFooter: boolean

  // 或省略前缀使用形容词
  disabled: boolean
  loading: boolean
  readonly: boolean
}
```

### 4. 避免过度 Props

```typescript
// ❌ Props 过多
interface BadProps {
  title: string
  titleColor: string
  titleSize: number
  titleWeight: string
  titleAlign: string
  // ...20+ props
}

// ✅ 使用对象聚合
interface GoodProps {
  title: string
  titleStyle?: TitleStyleConfig
}

interface TitleStyleConfig {
  color?: string
  size?: number
  weight?: string
  align?: string
}
```

## 最佳实践

### 1. 保持组件纯净

```typescript
// ✅ 好的做法：通过 props 和 events 通信
const props = defineProps<{ value: string }>()
const emit = defineEmits<{ change: [value: string] }>()

// ❌ 不好的做法：直接操作外部状态
const store = useStore()
const handleClick = () => {
  store.setValue('xxx') // 组件内部不应直接修改 store
}
```

### 2. 合理拆分组件

```
# 组件粒度指南

- 重复使用 2 次以上 → 抽取为组件
- 逻辑复杂度高 → 拆分子组件
- 代码行数超过 300 行 → 考虑拆分
- 可独立测试 → 抽取为组件
```

### 3. 统一错误处理

```typescript
const handleError = (error: Error, context: string) => {
  console.error(`[UserCard] ${context}:`, error)
  emit('error', error)
}

const loadData = async () => {
  try {
    isLoading.value = true
    const data = await api.getData()
    return data
  } catch (error) {
    handleError(error as Error, 'loadData')
    return null
  } finally {
    isLoading.value = false
  }
}
```

## 常见问题

### 1. 何时使用 setup 语法糖？

推荐始终使用 `<script setup>`，它更简洁且性能更好。

### 2. Props 解构会丢失响应式？

是的，不要直接解构 props：

```typescript
// ❌ 失去响应式
const { value } = props

// ✅ 保持响应式
const value = computed(() => props.value)
// 或
const { value } = toRefs(props)
```

### 3. 组件需要暴露方法给父组件？

使用 `defineExpose`：

```typescript
const refresh = () => { ... }
const reset = () => { ... }

defineExpose({
  refresh,
  reset
})
```
