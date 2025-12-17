# 自定义组件开发

本文档介绍如何在项目中开发自定义组件，包括组件结构、TypeScript 集成、父子组件通信、样式开发等内容。

## 组件结构规范

### 目录结构

```
src/
├── wd/                              # WD UI 组件库
│   ├── components/                  # 组件目录
│   │   ├── wd-button/              # 按钮组件
│   │   │   └── wd-button.vue       # 组件实现
│   │   ├── common/                 # 公共资源
│   │   │   ├── util.ts             # 工具函数
│   │   │   └── abstracts/          # SCSS 抽象层
│   │   └── composables/            # 组合式函数
│   └── index.ts                    # 组件库导出
├── components/                      # 业务组件
└── composables/                    # 业务组合式函数
```

### 文件命名规范

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 组件文件 | kebab-case | `wd-button.vue` |
| 类型文件 | kebab-case | `wd-form-key.ts` |
| 工具函数 | camelCase | `useParent.ts` |

## 组件基础模板

### 标准组件结构

```vue
<template>
  <view :class="rootClass" :style="rootStyle" @click="handleClick">
    <slot name="prefix" />
    <view class="wd-example__content">
      <slot />
    </view>
    <slot name="suffix" />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({
  name: 'WdExample',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

export interface WdExampleProps {
  customStyle?: string
  customClass?: string
  type?: 'primary' | 'success' | 'warning' | 'error' | 'default'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

interface WdExampleEmits {
  click: [event: Event]
  change: [value: string]
}

const props = withDefaults(defineProps<WdExampleProps>(), {
  customStyle: '',
  customClass: '',
  type: 'default',
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<WdExampleEmits>()

const rootClass = computed(() => {
  return `wd-example is-${props.type} is-${props.size} ${props.customClass} ${
    props.disabled ? 'is-disabled' : ''
  }`
})

const rootStyle = computed(() => props.customStyle)

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import './../common/abstracts/_mixin.scss';
@import './../common/abstracts/variable.scss';

@include b(example) {
  display: flex;
  align-items: center;

  @include e(content) {
    flex: 1;
  }

  @include when(disabled) {
    opacity: 0.6;
    pointer-events: none;
  }

  @include when(primary) {
    color: $-color-theme;
  }
}
</style>
```

### defineOptions 配置

| 选项 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 组件名称 |
| `addGlobalClass` | `boolean` | 允许使用全局样式类 |
| `virtualHost` | `boolean` | 启用虚拟主机节点 |
| `styleIsolation` | `string` | 样式隔离级别 |

## TypeScript 类型定义

### Props 接口定义

```typescript
export interface WdButtonProps {
  customStyle?: string
  customClass?: string
  plain?: boolean
  round?: boolean
  disabled?: boolean
  block?: boolean
  type?: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'default'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  loading?: boolean
}

const props = withDefaults(defineProps<WdButtonProps>(), {
  customStyle: '',
  type: 'primary',
  size: 'medium',
  disabled: false,
})
```

### Emits 接口定义

```typescript
interface WdButtonEmits {
  click: [event: Event]
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

const emit = defineEmits<WdButtonEmits>()
```

## 父子组件通信

### InjectionKey 定义

```typescript
// wd-form-key.ts
import type { InjectionKey } from 'vue'

export interface FormProvide {
  props: {
    model: Record<string, any>
    rules?: FormRules
  }
  errorMessages?: Record<string, string>
  children: any[]
}

export const FORM_KEY: InjectionKey<FormProvide> = Symbol('wd-form')
```

### useChildren 父组件管理子组件

```typescript
import { getCurrentInstance, provide, reactive } from 'vue'

export const useChildren = <Child, ProvideValue>(
  key: InjectionKey<ProvideValue>,
) => {
  const publicChildren: Child[] = reactive([])
  const internalChildren: ComponentInternalInstance[] = reactive([])
  const parent = getCurrentInstance()!

  const linkChildren = (value?: ProvideValue) => {
    const link = (child: ComponentInternalInstance) => {
      if (child.proxy) {
        internalChildren.push(child)
        publicChildren.push(child.proxy as Child)
      }
    }

    const unlink = (child: ComponentInternalInstance) => {
      const index = internalChildren.indexOf(child)
      if (index > -1) {
        publicChildren.splice(index, 1)
        internalChildren.splice(index, 1)
      }
    }

    provide(key, Object.assign({ link, unlink, children: publicChildren }, value))
  }

  return { children: publicChildren, linkChildren }
}
```

**父组件使用：**

```vue
<script lang="ts" setup>
import { useChildren } from '../composables/useChildren'
import { FORM_KEY } from './wd-form-key'

const { children, linkChildren } = useChildren(FORM_KEY)

linkChildren({
  props,
  errorMessages: reactive({}),
  children,
})

const validate = async () => {
  const results = await Promise.all(children.map(child => child.validate()))
  return results.every(Boolean)
}

defineExpose({ validate })
</script>
```

### useParent 子组件访问父组件

```typescript
import { computed, getCurrentInstance, inject, onUnmounted, ref } from 'vue'

export const useParent = <T>(key: InjectionKey<ParentProvide<T>>) => {
  const parent = inject(key, null)

  if (parent) {
    const instance = getCurrentInstance()!
    const { link, unlink, internalChildren } = parent

    link(instance)
    onUnmounted(() => unlink(instance))

    const index = computed(() => internalChildren.indexOf(instance))
    return { parent, index }
  }

  return { parent: null, index: ref(-1) }
}
```

**子组件使用：**

```vue
<script lang="ts" setup>
import { useParent } from '../composables/useParent'
import { FORM_KEY } from '../wd-form/wd-form-key'

const { parent, index } = useParent(FORM_KEY)

const errorMessage = computed(() => {
  return parent?.errorMessages?.[props.prop] || ''
})

defineExpose({ validate })
</script>
```

## 工具函数

### 类型检查

```typescript
import { isDef, isObj, isArray, isString, isNumber, isFunction } from '@/wd/components/common/util'

isDef(value)        // value !== undefined && value !== null
isObj({})           // true
isArray([])         // true
isString('hello')   // true
isNumber(123)       // true
isFunction(() => {}) // true
```

### 对象操作

```typescript
import { deepClone, isEqual, deepMerge, getPropByPath } from '@/wd/components/common/util'

const copy = deepClone({ a: 1, b: { c: 2 } })
isEqual([1, 2], [1, 2])  // true
const merged = deepMerge({ a: 1 }, { b: 2 })  // { a: 1, b: 2 }
getPropByPath({ a: { b: 1 } }, 'a.b')  // 1
```

### 字符串与单位

```typescript
import { uuid, addUnit, padZero, kebabCase } from '@/wd/components/common/util'

uuid()                    // 'a1b2c3d4...'
addUnit(10)               // '10rpx'
addUnit(10, 'px')         // '10px'
padZero(5)                // '05'
kebabCase('backgroundColor')  // 'background-color'
```

### 异步控制

```typescript
import { debounce, throttle, pause } from '@/wd/components/common/util'

const debouncedFn = debounce((val) => console.log(val), 300)
const throttledFn = throttle((e) => console.log(e), 100)
await pause(1000)  // 暂停 1 秒
```

### DOM 操作

```typescript
import { getRect } from '@/wd/components/common/util'

const rect = await getRect('.my-element', false, this)
console.log(rect.width, rect.height, rect.top, rect.left)
```

## 样式开发规范

### BEM 命名

```scss
// Block
.wd-button { }

// Element (使用 __)
.wd-button__content { }
.wd-button__icon { }

// Modifier (使用 is-)
.wd-button.is-primary { }
.wd-button.is-disabled { }
```

### SCSS Mixin 使用

```scss
@import './../common/abstracts/_mixin.scss';
@import './../common/abstracts/variable.scss';

@include b(button) {
  display: inline-flex;

  @include e(content) {
    display: flex;
  }

  @include e(icon) {
    margin-right: 8rpx;
  }

  @include when(primary) {
    background: $-button-primary-bg-color;
  }

  @include when(disabled) {
    opacity: 0.6;
    pointer-events: none;
  }

  @include when(small) {
    height: $-button-small-height;
  }
}
```

### Mixin 参考

| Mixin | 语法 | 生成结果 |
|-------|------|---------|
| `b($name)` | `@include b(button)` | `.wd-button` |
| `e($name)` | `@include e(content)` | `.wd-button__content` |
| `m($name)` | `@include m(primary)` | `.wd-button--primary` |
| `when($state)` | `@include when(disabled)` | `.wd-button.is-disabled` |

### 常用样式 Mixin

```scss
// 单行超出隐藏
@include lineEllipsis;

// 多行超出隐藏
@include multiEllipsis(3);

// 0.5px 边框
@include halfPixelBorder('bottom', 0, $-color-border-light);
```

## 主题变量

### CSS 变量定义

```scss
// 主题颜色
$-color-theme: var(--wot-color-theme, #4D80F0) !default;
$-color-success: var(--wot-color-success, #34d19d) !default;
$-color-warning: var(--wot-color-warning, #f0883a) !default;
$-color-danger: var(--wot-color-danger, #fa4350) !default;

// 组件变量
$-button-primary-bg-color: var(--wot-button-primary-bg-color, $-color-theme) !default;
$-button-small-height: var(--wot-button-small-height, 48rpx) !default;
```

### 主题定制

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">主题按钮</wd-button>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import type { ConfigProviderThemeVars } from '@/wd'

const themeVars: ConfigProviderThemeVars = {
  colorTheme: '#1989fa',
  buttonPrimaryBgColor: '#1989fa',
}
</script>
```

### 暗黑模式

```vue
<template>
  <wd-config-provider :theme="theme">
    <wd-button @click="toggleTheme">切换主题</wd-button>
  </wd-config-provider>
</template>

<script lang="ts" setup>
const theme = ref<'light' | 'dark'>('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>
```

## 组件实例暴露

### 使用 defineExpose

```vue
<script lang="ts" setup>
const inputRef = ref<HTMLInputElement>()
const value = ref('')

const focus = () => inputRef.value?.focus()
const blur = () => inputRef.value?.blur()
const clear = () => { value.value = '' }

defineExpose({ focus, blur, clear })
</script>
```

### 使用实例类型

```typescript
// 导出实例类型
export type { FormInstance } from './components/wd-form/wd-form.vue'

// 使用
import type { FormInstance } from '@/wd'
const formRef = ref<FormInstance>()
formRef.value?.validate()
```

## 组合式函数开发

### 自定义 Composable

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(options = {}) {
  const { initialValue = 0, min = -Infinity, max = Infinity, step = 1 } = options

  const count = ref(initialValue)
  const canIncrease = computed(() => count.value + step <= max)
  const canDecrease = computed(() => count.value - step >= min)

  const increase = () => { if (canIncrease.value) count.value += step }
  const decrease = () => { if (canDecrease.value) count.value -= step }
  const reset = () => { count.value = initialValue }

  return { count, canIncrease, canDecrease, increase, decrease, reset }
}
```

## 条件编译

### 平台判断

```vue
<template>
  <!-- 仅微信小程序 -->
  <!-- #ifdef MP-WEIXIN -->
  <button open-type="getPhoneNumber">获取手机号</button>
  <!-- #endif -->

  <!-- 仅 H5 -->
  <!-- #ifdef H5 -->
  <input type="tel" placeholder="请输入手机号" />
  <!-- #endif -->

  <!-- 非微信小程序 -->
  <!-- #ifndef MP-WEIXIN -->
  <wd-button @click="login">登录</wd-button>
  <!-- #endif -->
</template>

<script lang="ts" setup>
// #ifdef MP-WEIXIN
const handlePhone = (e) => console.log('手机号:', e.detail)
// #endif
</script>
```

### 平台检测工具

```typescript
// utils/platform.ts
const PLATFORM = {
  isMpWeixin: false,
  isH5: false,
  isApp: false,
}

// #ifdef MP-WEIXIN
PLATFORM.isMpWeixin = true
// #endif

// #ifdef H5
PLATFORM.isH5 = true
// #endif

export default PLATFORM
```

**使用：**

```typescript
import PLATFORM from '@/utils/platform'

if (PLATFORM.isMpWeixin) {
  wx.login({ success: (res) => console.log(res.code) })
}
```

## 最佳实践

### 1. 属性命名统一

```typescript
// ✅ 推荐
interface WdComponentProps {
  customStyle?: string
  customClass?: string
}

// ❌ 避免
interface BadProps {
  style?: string
  className?: string
}
```

### 2. 事件命名规范

```typescript
// ✅ 推荐
interface WdComponentEmits {
  click: [event: Event]
  change: [value: string]
}

// ❌ 避免 on 前缀
interface BadEmits {
  onClick: [event: Event]
}
```

### 3. 计算属性优化

```typescript
// ✅ 推荐
const rootClass = computed(() => {
  const classes = ['wd-button']
  if (props.type) classes.push(`is-${props.type}`)
  if (props.disabled) classes.push('is-disabled')
  return classes.join(' ')
})

// ❌ 避免在模板中计算
```

### 4. 避免不必要的响应式

```typescript
// ✅ 静态数据不使用 ref
const OPTIONS = [{ label: '选项1', value: 1 }]

// ❌ 静态数据使用 ref
const options = ref([{ label: '选项1', value: 1 }])
```

## 常见问题

### 1. 样式不生效

**解决：**

```vue
<script lang="ts" setup>
defineOptions({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },
})
</script>

<style lang="scss">
@import './../common/abstracts/_mixin.scss';
@import './../common/abstracts/variable.scss';
</style>
```

### 2. 父子组件通信失败

**解决：**

```typescript
// 父组件必须调用 linkChildren
linkChildren({ props, children })

// 子组件检查父组件存在
const { parent } = useParent(MY_KEY)
if (parent) {
  // 访问父组件数据
}
```

### 3. 类型提示不正确

**解决：**

```typescript
// 正确定义并导出类型
export interface WdMyComponentProps { }
export interface WdMyComponentEmits { }

const props = withDefaults(defineProps<WdMyComponentProps>(), {})
const emit = defineEmits<WdMyComponentEmits>()
```

### 4. 组件方法无法调用

**解决：**

```vue
<!-- 子组件必须 defineExpose -->
<script lang="ts" setup>
const focus = () => { }
defineExpose({ focus })
</script>

<!-- 父组件使用 -->
<script lang="ts" setup>
const inputRef = ref<InputInstance>()
onMounted(() => inputRef.value?.focus())
</script>
```

### 5. 条件编译不生效

```vue
<!-- 正确：注释紧贴内容 -->
<!-- #ifdef MP-WEIXIN -->
<view>微信小程序</view>
<!-- #endif -->

<!-- 错误：有空行 -->
<!-- #ifdef MP-WEIXIN -->

<view>不生效</view>

<!-- #endif -->
```

## API 速查

### Props 通用属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `customStyle` | 自定义样式 | `string` | `''` |
| `customClass` | 自定义类名 | `string` | `''` |

### defineOptions 配置

| 选项 | 推荐值 |
|------|--------|
| `name` | `'WdXxx'` |
| `addGlobalClass` | `true` |
| `virtualHost` | `true` |
| `styleIsolation` | `'shared'` |

### BEM Mixin

| Mixin | 输出 |
|-------|------|
| `b($name)` | `.wd-$name` |
| `e($name)` | `.wd-block__$name` |
| `when($state)` | `.wd-block.is-$state` |

### 工具函数

| 分类 | 函数 |
|------|------|
| 类型检查 | `isDef`, `isObj`, `isArray`, `isString`, `isNumber`, `isFunction` |
| 对象操作 | `deepClone`, `isEqual`, `deepMerge`, `getPropByPath` |
| 字符串 | `uuid`, `addUnit`, `padZero`, `kebabCase` |
| 异步 | `debounce`, `throttle`, `pause` |
| DOM | `getRect` |
