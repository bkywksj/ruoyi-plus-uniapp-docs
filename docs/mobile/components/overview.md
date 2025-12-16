# 组件系统概览

## 介绍

RuoYi-Plus-UniApp 移动端提供了一套完整且强大的组件系统，旨在帮助开发者快速构建高质量的跨平台移动应用。组件系统由两部分组成：**WD UI 组件库**和**自定义业务组件**。

WD UI 组件库是基于 Wot Design Uni 深度改造和优化的企业级 UI 组件库，使用 Vue 3 + TypeScript + Composition API 构建，提供了 90+ 个高质量组件，覆盖移动端开发的各个场景。组件库采用统一的设计规范、类型系统和开发模式，确保了组件的一致性和可维护性。

自定义业务组件则针对具体业务场景进行封装，提供了认证、导航、权限等业务级功能组件，与 WD UI 组件库无缝配合，共同构成完整的组件生态。

**核心特性**:

- **丰富完整** - 提供 90+ 个 WD UI 组件，覆盖基础、布局、导航、表单、展示、反馈等全场景
- **类型安全** - 完整的 TypeScript 类型定义，提供智能提示和类型检查
- **统一规范** - 组件命名、Props、Events、Slots 遵循统一的设计规范
- **组合式 API** - 使用 Vue 3 Composition API 开发，支持组合式函数复用逻辑
- **主题定制** - 支持通过 CSS 变量自定义组件样式和主题
- **按需引入** - 支持全局注册和按需引入，优化包体积
- **跨平台兼容** - 完美支持微信小程序、H5、App 等多个平台
- **单位统一** - 统一使用 rpx 响应式单位，适配不同屏幕尺寸
- **性能优化** - 组件内部进行了渲染优化和性能调优
- **文档完善** - 每个组件都有详细的文档、示例和最佳实践

## 组件系统架构

### 目录结构

组件系统的目录结构清晰合理，便于管理和维护：

```
src/
├── wd/                          # WD UI 组件库
│   ├── components/              # 组件实现目录
│   │   ├── common/             # 公共工具模块
│   │   │   ├── clickoutside/   # 点击外部关闭功能
│   │   │   ├── dayjs/          # 日期处理库
│   │   │   └── util/           # 通用工具函数
│   │   ├── composables/        # 组合式函数
│   │   │   ├── useQueue/       # 队列管理
│   │   │   ├── useTouch/       # 触摸事件管理
│   │   │   └── useUpload/      # 上传管理
│   │   ├── wd-button/          # 按钮组件
│   │   ├── wd-icon/            # 图标组件
│   │   ├── wd-input/           # 输入框组件
│   │   └── ...                 # 其他 90+ 个组件
│   ├── locale/                 # 国际化语言包
│   ├── index.ts                # 组件统一导出文件
│   ├── global.d.ts             # 全局类型声明
│   ├── package.json            # 包配置
│   └── readme.md               # 组件库说明
│
├── components/                  # 自定义业务组件
│   ├── auth/                   # 认证相关组件
│   ├── tabbar/                 # 自定义标签栏
│   └── index/                  # 其他业务组件
│
└── pages/                       # 页面组件
    └── ...
```

### 组件分类

WD UI 组件库按照功能将组件分为 6 大类：

#### 1. 基础组件 (6个)

基础组件提供了构建界面的基本元素，是其他复杂组件的基础。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Button | 按钮 | 触发操作、提交表单、页面跳转 |
| Icon | 图标 | 展示图标、图标按钮 |
| Text | 文本 | 格式化文本展示 |
| Transition | 过渡动画 | 元素进入/离开动画效果 |
| Resize | 尺寸监听 | 监听元素尺寸变化 |
| ConfigProvider | 全局配置 | 配置组件默认属性和主题 |

**适用场景**: 页面基础元素构建、交互反馈、视觉效果。

#### 2. 布局组件 (7个)

布局组件用于页面结构搭建，提供灵活的布局方案。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Layout | 布局容器 | Row/Col 栅格布局 |
| Grid | 宫格 | 图标导航、功能入口 |
| Cell | 单元格 | 列表项展示、设置项 |
| Divider | 分割线 | 内容分隔 |
| Space | 间距 | 元素间距管理 |
| Row | 行容器 | 栅格布局行 |
| Col | 列容器 | 栅格布局列 |

**适用场景**: 页面布局、导航菜单、列表展示、设置页面。

#### 3. 导航组件 (13个)

导航组件提供页面导航和内容切换功能。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Navbar | 导航栏 | 页面顶部导航 |
| Tabbar | 标签栏 | 底部导航切换 |
| Tabs | 标签页 | 内容分类切换 |
| Sidebar | 侧边导航 | 侧边分类导航 |
| IndexBar | 索引栏 | 城市列表、联系人列表索引 |
| Steps | 步骤条 | 流程进度展示 |
| Pagination | 分页 | 数据分页展示 |
| SegmentedControl | 分段器 | 选项卡切换 |
| Sticky | 粘性布局 | 固定元素定位 |
| StickyBox | 粘性容器 | 粘性布局容器 |
| Backtop | 回到顶部 | 快速返回顶部 |
| DropMenu | 下拉菜单 | 筛选条件选择 |
| DropMenuItem | 下拉菜单项 | 下拉菜单子项 |

**适用场景**: 页面导航、内容筛选、流程引导、快捷操作。

#### 4. 表单组件 (22个)

表单组件提供数据录入和表单管理功能。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Input | 输入框 | 文本输入 |
| Textarea | 文本域 | 多行文本输入 |
| Radio | 单选框 | 单选选择 |
| RadioGroup | 单选组 | 单选框组容器 |
| Checkbox | 复选框 | 多选选择 |
| CheckboxGroup | 复选组 | 复选框组容器 |
| Switch | 开关 | 开关切换 |
| Rate | 评分 | 星级评分 |
| Slider | 滑块 | 数值范围选择 |
| Stepper | 步进器 | 数值增减 |
| Picker | 选择器 | 单列/多列选择 |
| PickerView | 选择器视图 | 内嵌选择器 |
| ColPicker | 列选择器 | 多列级联选择 |
| SelectPicker | 选择选择器 | 带搜索的选择器 |
| DatetimePicker | 时间选择 | 日期时间选择 |
| DatetimePickerView | 时间视图 | 内嵌时间选择器 |
| Calendar | 日历 | 日期范围选择 |
| CalendarView | 日历视图 | 内嵌日历 |
| Upload | 上传 | 文件/图片上传 |
| Search | 搜索 | 搜索输入 |
| Form | 表单 | 表单容器和验证 |
| ImgCropper | 图片裁剪 | 图片裁剪编辑 |

**适用场景**: 表单填写、数据录入、信息提交、内容编辑。

#### 5. 展示组件 (18个)

展示组件用于信息展示和内容呈现。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Tag | 标签 | 标签展示、分类标记 |
| Badge | 徽标 | 数字角标、消息提示 |
| Progress | 进度条 | 进度展示 |
| Circle | 环形进度 | 环形进度展示 |
| Image | 图片 | 图片展示、懒加载 |
| Swiper | 轮播 | 图片轮播、内容切换 |
| SwiperNav | 轮播导航 | 轮播导航指示器 |
| Collapse | 折叠面板 | 内容折叠展开 |
| CollapseItem | 折叠项 | 折叠面板子项 |
| NoticeBar | 通知栏 | 滚动通知、公告 |
| CountDown | 倒计时 | 倒计时展示 |
| CountTo | 数字滚动 | 数字动画滚动 |
| Card | 卡片 | 卡片容器 |
| GridItem | 宫格项 | 宫格子项 |
| Skeleton | 骨架屏 | 加载占位 |
| StatusTip | 状态提示 | 空态、错误提示 |
| Watermark | 水印 | 页面水印 |
| RichText | 富文本 | 富文本展示 |

**适用场景**: 信息展示、数据呈现、内容预览、加载状态。

#### 6. 反馈组件 (24个)

反馈组件提供用户操作反馈和交互提示。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Toast | 轻提示 | 操作结果提示 |
| Loading | 加载 | 加载状态展示 |
| Modal | 模态框 | 确认对话框、信息展示 |
| MessageBox | 消息弹窗 | 确认、提示、输入弹窗 |
| ActionSheet | 动作面板 | 操作选项选择 |
| Popup | 弹出层 | 自定义弹出内容 |
| SwipeAction | 滑动操作 | 列表项滑动操作 |
| Dialog | 对话框 | 自定义对话框 |
| Notify | 通知 | 顶部通知消息 |
| Overlay | 遮罩层 | 遮罩背景 |
| Popover | 气泡 | 气泡提示框 |
| Tooltip | 工具提示 | 文字提示 |
| Curtain | 幕帘 | 幕帘弹窗 |
| FloatingPanel | 浮动面板 | 浮动内容面板 |
| Fab | 浮动按钮 | 悬浮操作按钮 |
| PullRefresh | 下拉刷新 | 列表下拉刷新 |
| Paging | 分页加载 | 列表分页加载 |
| PasswordInput | 密码输入 | 密码输入框 |
| NumberKeyboard | 数字键盘 | 数字输入键盘 |
| Signature | 签名 | 手写签名 |
| VoiceRecorder | 语音录制 | 语音录制 |
| VideoPreview | 视频预览 | 视频播放预览 |
| Table | 表格 | 数据表格展示 |
| TableCol | 表格列 | 表格列定义 |

**适用场景**: 操作反馈、确认提示、消息通知、加载状态、数据交互。

### 组件命名规范

组件系统采用统一的命名规范，确保代码的可读性和一致性。

#### 1. WD 组件命名

所有 WD UI 组件遵循 `wd-` 前缀的 kebab-case 命名：

```
目录名称: wd-button/
文件名称: wd-button.vue
组件名称: WdButton (defineOptions 中定义)
使用方式: <wd-button>
```

#### 2. 组件 Props 命名

Props 使用 camelCase 驼峰命名：

```typescript
interface WdButtonProps {
  type?: ButtonType           // ✅ 驼峰命名
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
}
```

模板中使用 kebab-case：

```vue
<wd-button
  button-type="primary"        <!-- ✅ kebab-case -->
  button-size="large"
  :disabled="false"
  :loading="true"
>
  提交
</wd-button>
```

#### 3. 组件 Events 命名

事件使用 camelCase 驼峰命名，避免使用 `on` 前缀：

```typescript
interface WdButtonEmits {
  click: [event: Event]        // ✅ click 不是 onClick
  change: [value: any]         // ✅ change 不是 onChange
}
```

监听事件使用 `@` 语法：

```vue
<wd-button
  @click="handleClick"         <!-- ✅ 直接使用事件名 -->
  @change="handleChange"
/>
```

#### 4. 类型定义命名

类型定义采用 PascalCase，并添加明确的后缀：

```typescript
// 组件 Props 接口
interface WdButtonProps { }

// 组件 Emits 接口
interface WdButtonEmits { }

// 组件实例类型
export type ButtonInstance = InstanceType<typeof WdButton>

// 枚举类型
export type ButtonType = 'primary' | 'success' | 'info' | 'warning' | 'error'
export type ButtonSize = 'small' | 'medium' | 'large'
```

### 组件导出机制

WD UI 组件库通过统一的 `index.ts` 文件导出所有组件、类型和工具函数。

#### 1. 组件类型导出

```typescript
// src/wd/index.ts

/** 按钮组件实例类型 */
export type { ButtonInstance } from './components/wd-button/wd-button.vue'

/** 输入框组件实例类型 */
export type { InputInstance } from './components/wd-input/wd-input.vue'

/** 表单组件实例类型 */
export type { FormInstance } from './components/wd-form/wd-form.vue'

// ... 其他组件实例类型
```

#### 2. 工具函数导出

```typescript
/** 点击外部关闭功能管理模块 */
export * as clickOut from './components/common/clickoutside'

/** Dayjs 类 - 轻量级日期处理库 */
export { dayjs } from './components/common/dayjs'

/** 通用工具函数库 */
export * as CommonUtil from './components/common/util'
```

#### 3. 组合式函数导出

```typescript
/** 队列管理组合式函数 */
export { useQueue } from './components/composables/useQueue'

/** 触摸事件管理组合式函数 */
export { useTouch } from './components/composables/useTouch'

/** 轻提示管理组合式函数 */
export { useToast } from './components/wd-toast/useToast'

/** 消息弹窗管理组合式函数 */
export { useMessage } from './components/wd-message-box/useMessage'

/** 通知管理组合式函数 */
export { useNotify } from './components/wd-notify/useNotify'
```

#### 4. 国际化导出

```typescript
/** 多语言相关导出 */
export * from './locale'
```

### 使用导出的类型

在项目中可以直接从 `wd` 导入需要的类型：

```typescript
import type { ButtonInstance, FormInstance, InputInstance } from '@/wd'
import { useToast, useMessage, dayjs } from '@/wd'

// 使用组件实例类型
const buttonRef = ref<ButtonInstance>()
const formRef = ref<FormInstance>()

// 使用组合式函数
const toast = useToast()
const message = useMessage()

// 使用工具函数
const now = dayjs()
```

## 组件使用方式

WD UI 组件库支持两种使用方式：全局注册和按需引入。

### 全局注册（推荐）

在 UniApp 项目中，WD UI 组件已经通过 `easycom` 机制自动全局注册，无需手动导入即可直接使用。

#### 配置 easycom

在 `pages.json` 中配置 easycom：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  }
}
```

#### 直接使用组件

配置完成后，可以在任意页面或组件中直接使用，无需导入：

```vue
<template>
  <view class="page">
    <!-- 直接使用，无需导入 -->
    <wd-button type="primary" @click="handleClick">
      点击按钮
    </wd-button>

    <wd-input v-model="value" placeholder="请输入内容" />

    <wd-cell title="单元格标题" value="内容" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const handleClick = () => {
  console.log('按钮被点击')
}
</script>
```

### 按需引入

如果需要手动控制组件的引入，可以使用按需引入方式。

#### 1. 组件按需引入

```vue
<template>
  <view class="page">
    <WdButton type="primary">按钮</WdButton>
    <WdInput v-model="value" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import WdButton from '@/wd/components/wd-button/wd-button.vue'
import WdInput from '@/wd/components/wd-input/wd-input.vue'

const value = ref('')
</script>
```

#### 2. 局部注册组件

```vue
<template>
  <view class="page">
    <custom-button type="primary">自定义按钮</custom-button>
  </view>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'

// 异步加载组件
const CustomButton = defineAsyncComponent(
  () => import('@/wd/components/wd-button/wd-button.vue')
)
</script>
```

### 组合式函数使用

组合式函数需要手动导入后使用。

#### 1. Toast 轻提示

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 显示成功提示
const showSuccess = () => {
  toast.success('操作成功')
}

// 显示错误提示
const showError = () => {
  toast.error('操作失败')
}

// 显示加载提示
const showLoading = () => {
  toast.loading('加载中...')
}

// 关闭提示
const hideToast = () => {
  toast.close()
}
</script>
```

#### 2. Message 消息弹窗

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

// 确认对话框
const showConfirm = async () => {
  const result = await message.confirm({
    title: '提示',
    content: '确定要删除吗？'
  })

  if (result) {
    console.log('用户点击了确定')
  }
}

// 提示对话框
const showAlert = () => {
  message.alert({
    title: '提示',
    content: '这是一条提示信息'
  })
}

// 输入对话框
const showPrompt = async () => {
  const result = await message.prompt({
    title: '请输入',
    placeholder: '请输入内容'
  })

  console.log('用户输入:', result)
}
</script>
```

#### 3. Notify 通知

```vue
<script lang="ts" setup>
import { useNotify } from '@/wd'

const notify = useNotify()

// 显示通知
const showNotify = () => {
  notify.show({
    type: 'success',
    message: '操作成功'
  })
}

// 显示不同类型的通知
const showSuccess = () => notify.success('成功提示')
const showError = () => notify.error('错误提示')
const showWarning = () => notify.warning('警告提示')
const showInfo = () => notify.info('普通提示')
</script>
```

### 工具函数使用

工具函数可以直接从 `wd` 导入使用。

```typescript
import { dayjs, CommonUtil } from '@/wd'

// 使用 dayjs 处理日期
const now = dayjs()
const tomorrow = dayjs().add(1, 'day')
const formatted = dayjs().format('YYYY-MM-DD HH:mm:ss')

// 使用通用工具函数
const result = CommonUtil.someFunction()
```

## 组件 Props 系统

WD UI 组件库采用完整的 TypeScript 类型系统定义组件 Props，提供良好的类型提示和类型检查。

### Props 定义规范

每个组件的 Props 都通过 TypeScript 接口定义：

```typescript
// 基础类型 Props
interface WdButtonProps {
  /** 按钮类型 */
  type?: ButtonType
  /** 按钮尺寸 */
  size?: ButtonSize
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 按钮文本 */
  text?: string
}

// 使用枚举类型
export type ButtonType = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'default'
export type ButtonSize = 'small' | 'medium' | 'large'
```

### Props 默认值

使用 `withDefaults` 定义 Props 默认值：

```typescript
const props = withDefaults(defineProps<WdButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false
})
```

### Props 验证

对于复杂的 Props，可以添加运行时验证：

```typescript
interface WdInputProps {
  /** 输入类型 */
  type?: 'text' | 'number' | 'password' | 'tel' | 'email'
  /** 最大长度 */
  maxlength?: number
  /** 最小长度 */
  minlength?: number
  /** 正则验证 */
  pattern?: string | RegExp
}

// 组件内部验证
watchEffect(() => {
  if (props.maxlength && props.maxlength < 0) {
    console.warn('maxlength 必须大于 0')
  }
})
```

### 常见 Props 类型

#### 1. 基础数据类型

```typescript
interface BasicProps {
  // 字符串
  title?: string
  // 数字
  count?: number
  // 布尔值
  disabled?: boolean
  // 数组
  items?: string[]
  // 对象
  config?: Record<string, any>
}
```

#### 2. 枚举类型

```typescript
interface EnumProps {
  // 字符串字面量联合
  type?: 'primary' | 'success' | 'warning' | 'error'
  // 数字字面量联合
  level?: 1 | 2 | 3 | 4 | 5
}
```

#### 3. 泛型类型

```typescript
interface GenericProps<T = any> {
  // 泛型数据
  data?: T
  // 泛型数组
  list?: T[]
  // 泛型函数
  formatter?: (value: T) => string
}
```

#### 4. 函数类型

```typescript
interface FunctionProps {
  // 点击事件处理
  onClick?: (event: Event) => void
  // 值变化处理
  onChange?: (value: string) => void
  // 异步处理函数
  onSubmit?: (data: FormData) => Promise<void>
  // 格式化函数
  formatter?: (value: any) => string
}
```

#### 5. 样式类型

```typescript
interface StyleProps {
  // 自定义样式
  customStyle?: string | CSSProperties
  // 自定义类名
  customClass?: string | string[]
  // 颜色
  color?: string
  // 尺寸
  size?: number | string
}
```

### Props 响应式处理

组件内部使用 `toRefs` 或 `computed` 处理 Props：

```vue
<script lang="ts" setup>
import { computed, toRefs } from 'vue'

interface WdButtonProps {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
}

const props = withDefaults(defineProps<WdButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false
})

// 解构 Props (保持响应性)
const { type, size, disabled } = toRefs(props)

// 计算属性基于 Props
const buttonClass = computed(() => {
  return [
    'wd-button',
    `wd-button--${props.type}`,
    `wd-button--${props.size}`,
    {
      'wd-button--disabled': props.disabled
    }
  ]
})
</script>
```

## 组件 Events 系统

组件 Events 用于子组件向父组件传递事件和数据。

### Events 定义规范

使用 TypeScript 定义组件事件：

```typescript
// 定义事件类型
interface WdButtonEmits {
  // 点击事件
  click: [event: Event]
  // 长按事件
  longpress: [event: Event]
  // 触摸开始
  touchstart: [event: TouchEvent]
  // 触摸结束
  touchend: [event: TouchEvent]
}

// 使用 defineEmits
const emit = defineEmits<WdButtonEmits>()

// 触发事件
const handleClick = (event: Event) => {
  emit('click', event)
}
```

### 常见 Events 类型

#### 1. 基础事件

```typescript
interface BasicEmits {
  // 点击事件
  click: [event: Event]
  // 变化事件
  change: [value: any]
  // 输入事件
  input: [value: string]
  // 聚焦事件
  focus: [event: FocusEvent]
  // 失焦事件
  blur: [event: FocusEvent]
}
```

#### 2. 表单事件

```typescript
interface FormEmits {
  // v-model 更新
  'update:modelValue': [value: any]
  // 表单提交
  submit: [data: FormData]
  // 表单重置
  reset: []
  // 验证失败
  validate: [errors: Record<string, string>]
}
```

#### 3. 生命周期事件

```typescript
interface LifecycleEmits {
  // 组件就绪
  ready: []
  // 加载完成
  load: []
  // 关闭前
  'before-close': [done: () => void]
  // 关闭后
  closed: []
}
```

### Events 使用示例

#### 1. 监听组件事件

```vue
<template>
  <wd-button
    type="primary"
    @click="handleClick"
    @longpress="handleLongpress"
  >
    按钮
  </wd-button>

  <wd-input
    v-model="value"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const handleClick = (event: Event) => {
  console.log('按钮被点击', event)
}

const handleLongpress = (event: Event) => {
  console.log('按钮被长按', event)
}

const handleInput = (value: string) => {
  console.log('输入内容', value)
}

const handleFocus = (event: FocusEvent) => {
  console.log('输入框聚焦', event)
}

const handleBlur = (event: FocusEvent) => {
  console.log('输入框失焦', event)
}

const handleChange = (value: string) => {
  console.log('内容变化', value)
}
</script>
```

#### 2. v-model 双向绑定

```vue
<template>
  <!-- 基础 v-model -->
  <wd-input v-model="username" placeholder="请输入用户名" />

  <!-- 多个 v-model -->
  <wd-datetime-picker
    v-model:start="startDate"
    v-model:end="endDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const username = ref('')
const startDate = ref('')
const endDate = ref('')
</script>
```

#### 3. 自定义事件修饰符

```vue
<template>
  <!-- 阻止事件冒泡 -->
  <wd-button @click.stop="handleClick">
    阻止冒泡
  </wd-button>

  <!-- 只触发一次 -->
  <wd-button @click.once="handleOnce">
    只触发一次
  </wd-button>

  <!-- 事件捕获 -->
  <wd-button @click.capture="handleCapture">
    事件捕获
  </wd-button>
</template>
```

## 组件 Slots 系统

Slots 插槽用于自定义组件内容，提供灵活的内容分发机制。

### Slots 类型

#### 1. 默认插槽

```vue
<template>
  <wd-button type="primary">
    <!-- 默认插槽内容 -->
    提交表单
  </wd-button>

  <wd-cell title="标题">
    <!-- 默认插槽 - 右侧内容 -->
    <template #default>
      <text>自定义内容</text>
    </template>
  </wd-cell>
</template>
```

#### 2. 具名插槽

```vue
<template>
  <wd-cell>
    <!-- title 插槽 -->
    <template #title>
      <view class="custom-title">
        <wd-icon name="user" />
        <text>用户信息</text>
      </view>
    </template>

    <!-- icon 插槽 -->
    <template #icon>
      <wd-icon name="setting" color="#ff0000" />
    </template>

    <!-- 默认插槽 - 右侧内容 -->
    <template #default>
      <text>张三</text>
    </template>
  </wd-cell>
</template>
```

#### 3. 作用域插槽

```vue
<template>
  <wd-picker :columns="columns">
    <!-- 自定义选项渲染 -->
    <template #option="{ item, index }">
      <view class="custom-option">
        <text>{{ index + 1 }}. {{ item.label }}</text>
      </view>
    </template>
  </wd-picker>

  <wd-table :data="tableData">
    <!-- 自定义列渲染 -->
    <template #column="{ row, column, value }">
      <view v-if="column.prop === 'status'">
        <wd-tag :type="value === 1 ? 'success' : 'error'">
          {{ value === 1 ? '正常' : '禁用' }}
        </wd-tag>
      </view>
      <text v-else>{{ value }}</text>
    </template>
  </wd-table>
</template>
```

### 常见插槽场景

#### 1. 按钮组件插槽

```vue
<template>
  <!-- 纯文本内容 -->
  <wd-button type="primary">
    提交
  </wd-button>

  <!-- 图标 + 文本 -->
  <wd-button type="success">
    <wd-icon name="check" />
    <text>确认</text>
  </wd-button>

  <!-- 自定义复杂内容 -->
  <wd-button type="warning">
    <view class="button-content">
      <wd-badge :value="3">
        <wd-icon name="message" />
      </wd-badge>
      <text>消息</text>
    </view>
  </wd-button>
</template>
```

#### 2. 单元格组件插槽

```vue
<template>
  <wd-cell title="手机号" value="138****8888">
    <!-- icon 插槽 -->
    <template #icon>
      <wd-icon name="phone" />
    </template>

    <!-- 右侧箭头 -->
    <template #right-icon>
      <wd-icon name="arrow-right" />
    </template>
  </wd-cell>

  <wd-cell>
    <!-- 完全自定义标题 -->
    <template #title>
      <view class="custom-title">
        <wd-tag type="primary">VIP</wd-tag>
        <text>会员用户</text>
      </view>
    </template>

    <!-- 自定义内容 -->
    <template #default>
      <wd-switch v-model="vipEnabled" />
    </template>
  </wd-cell>
</template>
```

#### 3. 弹窗组件插槽

```vue
<template>
  <wd-popup v-model="visible" position="bottom">
    <!-- 头部插槽 -->
    <template #header>
      <view class="popup-header">
        <text>选择城市</text>
        <wd-icon name="close" @click="visible = false" />
      </view>
    </template>

    <!-- 内容插槽 -->
    <template #default>
      <view class="popup-content">
        <!-- 内容区域 -->
      </view>
    </template>

    <!-- 底部插槽 -->
    <template #footer>
      <view class="popup-footer">
        <wd-button block @click="handleConfirm">确定</wd-button>
      </view>
    </template>
  </wd-popup>
</template>
```

## 组件通信方式

组件之间的通信是构建复杂应用的基础，WD UI 组件库支持多种组件通信方式。

### 1. Props / Events（父子通信）

这是最基本的父子组件通信方式。

```vue
<!-- 父组件 -->
<template>
  <view class="parent">
    <!-- 通过 Props 传递数据给子组件 -->
    <child-component
      :user="user"
      :count="count"
      @update="handleUpdate"
      @delete="handleDelete"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const user = ref({ name: '张三', age: 25 })
const count = ref(0)

// 处理子组件触发的事件
const handleUpdate = (newUser: User) => {
  user.value = newUser
}

const handleDelete = (id: number) => {
  console.log('删除', id)
}
</script>

<!-- 子组件 -->
<template>
  <view class="child">
    <text>{{ user.name }} - {{ user.age }}岁</text>
    <wd-button @click="updateUser">更新</wd-button>
    <wd-button @click="deleteUser">删除</wd-button>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  user: User
  count: number
}

interface Emits {
  update: [user: User]
  delete: [id: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateUser = () => {
  emit('update', { ...props.user, age: props.user.age + 1 })
}

const deleteUser = () => {
  emit('delete', 1)
}
</script>
```

### 2. v-model（双向绑定）

v-model 是 Props + Events 的语法糖，用于实现双向数据绑定。

```vue
<!-- 父组件 -->
<template>
  <view class="page">
    <!-- 基础 v-model -->
    <wd-input v-model="username" />

    <!-- 等价于 -->
    <wd-input
      :model-value="username"
      @update:model-value="username = $event"
    />

    <!-- 多个 v-model -->
    <custom-form
      v-model:username="form.username"
      v-model:password="form.password"
      v-model:email="form.email"
    />
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const username = ref('')

const form = reactive({
  username: '',
  password: '',
  email: ''
})
</script>

<!-- 子组件实现 v-model -->
<template>
  <input
    :value="modelValue"
    @input="handleInput"
    type="text"
  />
</template>

<script lang="ts" setup>
interface Props {
  modelValue: string
}

interface Emits {
  'update:modelValue': [value: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
```

### 3. Provide / Inject（跨层级通信）

用于祖先组件向后代组件传递数据，无需逐层传递 Props。

```vue
<!-- 祖先组件 -->
<template>
  <view class="ancestor">
    <child-component />
  </view>
</template>

<script lang="ts" setup>
import { provide, ref } from 'vue'

// 提供数据
const theme = ref('light')
const user = ref({ name: '张三', role: 'admin' })

provide('theme', theme)
provide('user', user)

// 提供方法
const updateTheme = (newTheme: string) => {
  theme.value = newTheme
}
provide('updateTheme', updateTheme)
</script>

<!-- 后代组件（可以跨多层） -->
<template>
  <view class="descendant">
    <text>当前主题: {{ theme }}</text>
    <text>用户: {{ user?.name }}</text>
    <wd-button @click="handleChangeTheme">切换主题</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import type { Ref } from 'vue'

// 注入数据
const theme = inject<Ref<string>>('theme')
const user = inject<Ref<User>>('user')
const updateTheme = inject<(theme: string) => void>('updateTheme')

const handleChangeTheme = () => {
  if (updateTheme) {
    updateTheme(theme?.value === 'light' ? 'dark' : 'light')
  }
}
</script>
```

### 4. Ref 获取组件实例

通过 `ref` 获取子组件实例，直接调用子组件的方法或访问数据。

```vue
<template>
  <view class="page">
    <!-- 绑定 ref -->
    <wd-form ref="formRef" :model="form" :rules="rules">
      <wd-input v-model="form.username" prop="username" />
      <wd-input v-model="form.password" prop="password" />
    </wd-form>

    <wd-button @click="handleSubmit">提交</wd-button>
    <wd-button @click="handleReset">重置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

// 定义 ref，指定类型
const formRef = ref<FormInstance>()

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}

// 调用子组件方法
const handleSubmit = async () => {
  try {
    // 调用表单验证方法
    await formRef.value?.validate()
    console.log('验证通过', form.value)
  } catch (error) {
    console.log('验证失败', error)
  }
}

const handleReset = () => {
  // 调用表单重置方法
  formRef.value?.reset()
}
</script>
```

### 5. Event Bus（兄弟/跨组件通信）

使用事件总线实现任意组件之间的通信。

```typescript
// utils/eventBus.ts
import { ref } from 'vue'

type EventCallback = (...args: any[]) => void

class EventBus {
  private events: Map<string, EventCallback[]> = new Map()

  // 订阅事件
  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  // 取消订阅
  off(event: string, callback?: EventCallback) {
    if (!this.events.has(event)) return

    if (callback) {
      const callbacks = this.events.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      this.events.delete(event)
    }
  }

  // 触发事件
  emit(event: string, ...args: any[]) {
    if (!this.events.has(event)) return

    const callbacks = this.events.get(event)!
    callbacks.forEach(callback => callback(...args))
  }

  // 只订阅一次
  once(event: string, callback: EventCallback) {
    const onceCallback = (...args: any[]) => {
      callback(...args)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }
}

export const eventBus = new EventBus()
```

```vue
<!-- 组件 A - 发送事件 -->
<template>
  <wd-button @click="sendMessage">发送消息</wd-button>
</template>

<script lang="ts" setup>
import { eventBus } from '@/utils/eventBus'

const sendMessage = () => {
  eventBus.emit('message', { text: 'Hello', from: 'ComponentA' })
}
</script>

<!-- 组件 B - 接收事件 -->
<template>
  <view>{{ message }}</view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/utils/eventBus'

const message = ref('')

const handleMessage = (data: any) => {
  message.value = `收到来自 ${data.from} 的消息: ${data.text}`
}

onMounted(() => {
  // 订阅事件
  eventBus.on('message', handleMessage)
})

onUnmounted(() => {
  // 组件销毁时取消订阅
  eventBus.off('message', handleMessage)
})
</script>
```

### 6. Pinia 状态管理

使用 Pinia 进行全局状态管理，适合跨页面、跨组件共享数据。

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<User | null>(null)
  const token = ref('')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '未登录')

  // 方法
  const login = async (username: string, password: string) => {
    // 登录逻辑
    const response = await api.login({ username, password })
    token.value = response.token
    userInfo.value = response.userInfo
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    userName,
    login,
    logout
  }
})
```

```vue
<!-- 在组件中使用 -->
<template>
  <view class="page">
    <text>用户: {{ userName }}</text>
    <text>登录状态: {{ isLoggedIn ? '已登录' : '未登录' }}</text>

    <wd-button v-if="!isLoggedIn" @click="handleLogin">
      登录
    </wd-button>
    <wd-button v-else @click="handleLogout">
      退出登录
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { userName, isLoggedIn } = storeToRefs(userStore)

const handleLogin = async () => {
  await userStore.login('admin', '123456')
}

const handleLogout = () => {
  userStore.logout()
}
</script>
```

## 自定义组件开发

除了使用 WD UI 组件库，项目中也可以开发自定义业务组件。

### 组件开发规范

#### 1. 组件目录结构

```
src/components/
├── custom-component/
│   ├── index.vue              # 组件主文件
│   ├── types.ts               # 类型定义
│   ├── hooks.ts               # 组合式函数
│   └── utils.ts               # 工具函数
```

#### 2. 组件模板

```vue
<template>
  <view :class="rootClass" :style="rootStyle">
    <!-- 组件内容 -->
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

/**
 * 组件名称：CustomComponent
 * 组件说明：自定义组件示例
 */
defineOptions({
  name: 'CustomComponent',
  options: {
    // 使用外部样式类
    addGlobalClass: true,
    // 使用虚拟 host 节点
    virtualHost: true,
    // 样式隔离
    styleIsolation: 'shared'
  }
})

/**
 * Props 定义
 */
interface CustomComponentProps {
  /** 组件类型 */
  type?: 'default' | 'primary' | 'success'
  /** 组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式 */
  customStyle?: string
  /** 自定义类名 */
  customClass?: string
}

const props = withDefaults(defineProps<CustomComponentProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false
})

/**
 * Events 定义
 */
interface CustomComponentEmits {
  /** 点击事件 */
  click: [event: Event]
  /** 值变化事件 */
  change: [value: any]
}

const emit = defineEmits<CustomComponentEmits>()

/**
 * 计算根元素类名
 */
const rootClass = computed(() => {
  return [
    'custom-component',
    `custom-component--${props.type}`,
    `custom-component--${props.size}`,
    {
      'custom-component--disabled': props.disabled
    },
    props.customClass
  ]
})

/**
 * 计算根元素样式
 */
const rootStyle = computed(() => {
  return props.customStyle
})

/**
 * 处理点击事件
 */
const handleClick = (event: Event) => {
  if (props.disabled) return
  emit('click', event)
}

/**
 * 暴露给父组件的方法和属性
 */
defineExpose({
  // 暴露方法
  handleClick,
  // 暴露数据
  disabled: props.disabled
})
</script>

```

### 组件类型定义

将组件的类型单独提取到 `types.ts` 文件：

```typescript
// components/custom-component/types.ts

/**
 * 组件类型
 */
export type CustomComponentType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 组件尺寸
 */
export type CustomComponentSize = 'small' | 'medium' | 'large'

/**
 * 组件 Props 接口
 */
export interface CustomComponentProps {
  /** 组件类型 */
  type?: CustomComponentType
  /** 组件尺寸 */
  size?: CustomComponentSize
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式 */
  customStyle?: string
  /** 自定义类名 */
  customClass?: string
}

/**
 * 组件 Emits 接口
 */
export interface CustomComponentEmits {
  /** 点击事件 */
  click: [event: Event]
  /** 值变化事件 */
  change: [value: any]
}

/**
 * 组件实例类型
 */
export interface CustomComponentInstance {
  /** 处理点击 */
  handleClick: (event: Event) => void
  /** 是否禁用 */
  disabled: boolean
}
```

### 组件组合式函数

提取可复用的逻辑到组合式函数：

```typescript
// components/custom-component/hooks.ts
import { ref, computed } from 'vue'

/**
 * 使用组件状态
 */
export function useComponentState() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<any>(null)

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (err: Error | null) => {
    error.value = err
  }

  const setData = (value: any) => {
    data.value = value
  }

  return {
    loading,
    error,
    data,
    setLoading,
    setError,
    setData
  }
}

/**
 * 使用组件样式
 */
export function useComponentStyle(props: any) {
  const rootClass = computed(() => {
    return [
      'custom-component',
      `custom-component--${props.type}`,
      `custom-component--${props.size}`,
      {
        'custom-component--disabled': props.disabled
      },
      props.customClass
    ]
  })

  const rootStyle = computed(() => {
    return props.customStyle
  })

  return {
    rootClass,
    rootStyle
  }
}
```

### 业务组件示例

#### 1. 用户头像组件

```vue
<!-- components/user-avatar/index.vue -->
<template>
  <view class="user-avatar" :class="sizeClass" @click="handleClick">
    <image
      v-if="avatar"
      :src="avatar"
      class="user-avatar__image"
      mode="aspectFill"
    />
    <view v-else class="user-avatar__placeholder">
      <text>{{ nameInitial }}</text>
    </view>
    <view v-if="showBadge" class="user-avatar__badge">
      <wd-badge :value="badgeValue" :max="99" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface UserAvatarProps {
  /** 头像地址 */
  avatar?: string
  /** 用户名（用于显示首字母） */
  name?: string
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示徽标 */
  showBadge?: boolean
  /** 徽标数值 */
  badgeValue?: number
}

const props = withDefaults(defineProps<UserAvatarProps>(), {
  size: 'medium',
  showBadge: false,
  badgeValue: 0
})

const emit = defineEmits<{
  click: []
}>()

// 计算用户名首字母
const nameInitial = computed(() => {
  if (!props.name) return '?'
  return props.name.charAt(0).toUpperCase()
})

// 尺寸类名
const sizeClass = computed(() => {
  return `user-avatar--${props.size}`
})

const handleClick = () => {
  emit('click')
}
</script>

```

#### 2. 空状态组件

```vue
<!-- components/empty-state/index.vue -->
<template>
  <view class="empty-state">
    <image v-if="image" :src="image" class="empty-state__image" mode="aspectFit" />
    <wd-icon v-else-if="icon" :name="icon" :size="iconSize" :color="iconColor" />

    <text class="empty-state__title">{{ title }}</text>
    <text v-if="description" class="empty-state__description">{{ description }}</text>

    <view v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </view>
  </view>
</template>

<script lang="ts" setup>
interface EmptyStateProps {
  /** 图片地址 */
  image?: string
  /** 图标名称 */
  icon?: string
  /** 图标尺寸 */
  iconSize?: number
  /** 图标颜色 */
  iconColor?: string
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
}

withDefaults(defineProps<EmptyStateProps>(), {
  iconSize: 128,
  iconColor: '#cccccc',
  title: '暂无数据'
})
</script>

```

使用空状态组件：

```vue
<template>
  <view class="page">
    <!-- 基础用法 -->
    <empty-state
      v-if="list.length === 0"
      icon="empty"
      title="暂无数据"
      description="快去添加一些内容吧"
    >
      <template #action>
        <wd-button type="primary" @click="handleAdd">
          添加内容
        </wd-button>
      </template>
    </empty-state>

    <!-- 列表内容 -->
    <view v-else>
      <!-- 列表项 -->
    </view>
  </view>
</template>
```

## 组件性能优化

### 1. 按需渲染

使用 `v-if` 和 `v-show` 合理控制组件渲染：

```vue
<template>
  <view class="page">
    <!-- 频繁切换使用 v-show -->
    <wd-popup v-show="showPopup" position="bottom">
      <!-- 弹窗内容 -->
    </wd-popup>

    <!-- 条件渲染使用 v-if -->
    <view v-if="userType === 'admin'" class="admin-panel">
      <!-- 管理员面板 -->
    </view>
  </view>
</template>
```

### 2. 列表优化

对于长列表，使用虚拟滚动或分页加载：

```vue
<template>
  <view class="page">
    <!-- 使用 Paging 组件实现分页加载 -->
    <wd-paging
      ref="pagingRef"
      :fetch-api="fetchList"
      :page-size="20"
    >
      <template #default="{ item }">
        <wd-cell :title="item.name" :value="item.value" />
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { PagingInstance } from '@/wd'

const pagingRef = ref<PagingInstance>()

const fetchList = async (page: number, pageSize: number) => {
  const response = await api.getList({ page, pageSize })
  return {
    list: response.data,
    total: response.total
  }
}
</script>
```

### 3. 计算属性缓存

使用计算属性而不是方法，利用缓存机制：

```vue
<script lang="ts" setup>
import { computed, ref } from 'vue'

const list = ref([/* ... */])

// ✅ 推荐：使用计算属性（有缓存）
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ❌ 不推荐：使用方法（每次都计算）
const getFilteredList = () => {
  return list.value.filter(item => item.active)
}
</script>
```

### 4. 组件懒加载

使用 `defineAsyncComponent` 异步加载组件：

```typescript
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(
  () => import('@/components/heavy-component/index.vue')
)
```

### 5. 事件防抖节流

对高频触发的事件进行防抖或节流处理：

```vue
<template>
  <wd-input
    v-model="keyword"
    @input="handleSearch"
    placeholder="搜索"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { debounce } from '@/utils'

const keyword = ref('')

// 防抖处理搜索
const handleSearch = debounce((value: string) => {
  console.log('搜索:', value)
  // 执行搜索逻辑
}, 300)
</script>
```

## 最佳实践

### 1. 组件设计原则

**单一职责原则**

每个组件应该只负责一个功能，保持组件的简单和专注。

```vue
<!-- ✅ 好的设计：职责单一 -->
<user-avatar :avatar="user.avatar" :name="user.name" />
<user-info :user="user" />

<!-- ❌ 不好的设计：职责混乱 -->
<user-profile :user="user" :show-avatar="true" :show-info="true" />
```

**组件复用性**

设计组件时考虑复用性，通过 Props 和 Slots 提供灵活的配置。

```vue
<!-- ✅ 灵活可配置 -->
<data-table
  :columns="columns"
  :data="data"
  :loading="loading"
  @row-click="handleRowClick"
>
  <template #empty>
    <empty-state title="暂无数据" />
  </template>
</data-table>
```

**组件解耦**

组件之间应该尽量解耦，避免紧密耦合。

```vue
<!-- ✅ 通过 Props 和 Events 通信 -->
<parent-component>
  <child-component
    :data="parentData"
    @update="handleUpdate"
  />
</parent-component>

<!-- ❌ 直接访问父组件或全局状态 -->
<!-- 在子组件中使用 getCurrentInstance().$parent -->
```

### 2. Props 设计最佳实践

**提供合理的默认值**

```typescript
const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',      // 提供默认值
  size: 'medium',
  disabled: false,
  loading: false
})
```

**Props 命名规范**

```typescript
interface ComponentProps {
  // ✅ 使用描述性名称
  buttonText: string
  isLoading: boolean
  userList: User[]

  // ❌ 避免使用模糊名称
  text: string
  flag: boolean
  data: any[]
}
```

**Props 类型定义完整**

```typescript
interface UserCardProps {
  /** 用户信息 */
  user: {
    id: number
    name: string
    avatar: string
    role: 'admin' | 'user'
  }
  /** 卡片尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示操作按钮 */
  showActions?: boolean
  /** 点击回调 */
  onClick?: (user: User) => void
}
```

### 3. 样式设计最佳实践

**使用 BEM 命名规范**

```scss
.wd-button {
  // Block（块）

  &__icon {
    // Element（元素）
  }

  &--primary {
    // Modifier（修饰符）
  }

  &--disabled {
    // Modifier（修饰符）
  }
}
```

**使用 CSS 变量**

```scss
.wd-button {
  background-color: var(--wd-button-bg-color, #ffffff);
  color: var(--wd-button-text-color, #333333);
  border-radius: var(--wd-button-border-radius, 8rpx);
}
```

**响应式单位**

```scss
.component {
  // ✅ 使用 rpx 适配不同屏幕
  padding: 32rpx;
  font-size: 28rpx;

  // ❌ 避免使用固定 px
  // padding: 16px;
  // font-size: 14px;
}
```

### 4. 类型安全最佳实践

**充分利用 TypeScript**

```typescript
// 定义严格的类型
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

// 使用泛型
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 类型推导
const users: User[] = []
const response: ApiResponse<User[]> = await api.getUsers()
```

**避免使用 any**

```typescript
// ❌ 避免
const data: any = {}

// ✅ 推荐
const data: Record<string, unknown> = {}
// 或
interface Data {
  id: number
  name: string
}
const data: Data = { id: 1, name: 'test' }
```

### 5. 组件文档注释

为组件添加完整的 JSDoc 注释：

```typescript
/**
 * 按钮组件
 *
 * @description 用于触发操作的按钮组件，支持多种类型和尺寸
 * @example
 * ```vue
 * <wd-button type="primary" @click="handleClick">
 *   提交
 * </wd-button>
 * ```
 */
interface WdButtonProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: ButtonType

  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: ButtonSize

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
}
```

## 常见问题

### 1. 组件不显示或样式异常

**问题原因**:
- easycom 配置不正确
- 组件路径错误
- 样式未正确加载
- 平台差异导致样式问题

**解决方案**:

检查 `pages.json` 中的 easycom 配置：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  }
}
```

确保组件路径正确：

```vue
<!-- ✅ 正确 -->
<wd-button type="primary">按钮</wd-button>

<!-- ❌ 错误：组件名称不匹配 -->
<WdButton type="primary">按钮</WdButton>
```

检查样式是否添加了 `scoped`：

```vue
<!-- 如果样式不生效，尝试移除 scoped 或使用深度选择器 -->
<style lang="scss">
/* 全局样式 */
.wd-button {
  /* ... */
}
</style>

```

### 2. v-model 不生效

**问题原因**:
- Props 名称不是 `modelValue`
- 未正确 emit `update:modelValue` 事件
- 双向绑定语法错误

**解决方案**:

确保组件正确实现 v-model：

```vue
<!-- 子组件 -->
<template>
  <input
    :value="modelValue"
    @input="handleInput"
  />
</template>

<script lang="ts" setup>
interface Props {
  modelValue: string  // ✅ 必须是 modelValue
}

interface Emits {
  'update:modelValue': [value: string]  // ✅ 必须是 update:modelValue
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<!-- 父组件使用 -->
<template>
  <custom-input v-model="value" />  <!-- ✅ 正确 -->
</template>
```

### 3. 组件 ref 获取不到实例

**问题原因**:
- ref 命名冲突
- 组件未挂载时访问
- 未使用 `defineExpose` 暴露

**解决方案**:

确保组件使用 `defineExpose` 暴露方法：

```vue
<!-- 子组件 -->
<script lang="ts" setup>
const validate = () => {
  // 验证逻辑
}

const reset = () => {
  // 重置逻辑
}

// ✅ 必须显式暴露
defineExpose({
  validate,
  reset
})
</script>

<!-- 父组件 -->
<template>
  <custom-form ref="formRef" />
  <wd-button @click="handleSubmit">提交</wd-button>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const formRef = ref()

const handleSubmit = () => {
  // ✅ 在事件处理中访问（组件已挂载）
  formRef.value?.validate()
}

onMounted(() => {
  // ✅ 在 onMounted 中访问（组件已挂载）
  console.log(formRef.value)
})

// ❌ 错误：在 setup 顶层访问（组件未挂载）
// console.log(formRef.value) // undefined
</script>
```

### 4. 组件事件监听无效

**问题原因**:
- 事件名称拼写错误
- 事件未正确 emit
- 使用了原生事件而非自定义事件

**解决方案**:

确保事件名称一致：

```vue
<!-- 子组件 -->
<script lang="ts" setup>
interface Emits {
  change: [value: string]  // ✅ 定义事件
}

const emit = defineEmits<Emits>()

const handleChange = (value: string) => {
  emit('change', value)  // ✅ emit 事件
}
</script>

<!-- 父组件 -->
<template>
  <!-- ✅ 正确：事件名称匹配 -->
  <custom-input @change="handleChange" />

  <!-- ❌ 错误：事件名称不匹配 -->
  <custom-input @onChange="handleChange" />
</template>
```

### 5. 样式穿透不生效

**问题原因**:
- 深度选择器语法错误
- 组件使用了 styleIsolation
- 选择器优先级问题

**解决方案**:

使用正确的深度选择器：

```vue
```

### 6. 组件通信失败

**问题原因**:
- Props 类型不匹配
- 跨层级组件通信方式不当
- Provide/Inject 注入失败

**解决方案**:

使用正确的通信方式：

```vue
<!-- 父子通信：Props + Events -->
<child-component
  :data="parentData"
  @update="handleUpdate"
/>

<!-- 跨层级通信：Provide/Inject -->
<script lang="ts" setup>
// 祖先组件
import { provide } from 'vue'
provide('key', value)

// 后代组件
import { inject } from 'vue'
const value = inject('key')
</script>

<!-- 全局通信：Pinia -->
<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
</script>
```

### 7. 组件在不同平台表现不一致

**问题原因**:
- 使用了平台特定的 API
- 样式单位不统一
- 条件编译配置错误

**解决方案**:

使用条件编译处理平台差异：

```vue
<template>
  <view class="page">
    <!-- 微信小程序 -->
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="getUserInfo">获取用户信息</button>
    <!-- #endif -->

    <!-- H5 -->
    <!-- #ifdef H5 -->
    <button @click="handleLogin">登录</button>
    <!-- #endif -->
  </view>
</template>

<style lang="scss">
.page {
  /* ✅ 使用 rpx 适配所有平台 */
  padding: 32rpx;

  /* #ifdef H5 */
  /* H5 特定样式 */
  max-width: 750rpx;
  margin: 0 auto;
  /* #endif */
}
</style>
```

统一使用 rpx 单位：

```scss
/* ✅ 推荐 */
.component {
  width: 750rpx;
  height: 100rpx;
  font-size: 28rpx;
}

/* ❌ 避免 */
.component {
  width: 375px;    /* 在不同屏幕上显示不一致 */
  height: 50px;
  font-size: 14px;
}
```

### 8. 组件性能问题

**问题原因**:
- 不必要的重渲染
- 大列表未优化
- 组件未按需加载

**解决方案**:

使用分页加载优化长列表：

```vue
<template>
  <wd-paging
    ref="pagingRef"
    :fetch-api="fetchList"
    :page-size="20"
  >
    <template #default="{ item }">
      <list-item :data="item" />
    </template>
  </wd-paging>
</template>
```

使用计算属性缓存：

```typescript
// ✅ 使用计算属性（有缓存）
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active')
})

// ❌ 在模板中使用方法（每次都计算）
const filterList = () => {
  return list.value.filter(item => item.status === 'active')
}
```

组件懒加载：

```typescript
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/heavy-component/index.vue')
)
```

---

## 总结

RuoYi-Plus-UniApp 组件系统提供了完整、强大、易用的组件库和开发规范。通过 90+ 个 WD UI 组件和灵活的自定义组件机制，可以快速构建高质量的跨平台移动应用。

**核心优势**:
- 🎨 组件丰富，覆盖全场景
- 💪 TypeScript 支持，类型安全
- 🚀 性能优化，流畅体验
- 📱 跨平台兼容，一次开发多端运行
- 🛠 开发规范，易于维护

掌握组件系统的使用方法和最佳实践，将大大提升开发效率和代码质量。建议深入学习每个组件的详细文档，结合实际项目需求灵活运用。
