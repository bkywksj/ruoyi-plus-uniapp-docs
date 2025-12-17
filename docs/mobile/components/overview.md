# 组件系统概览

## 介绍

RuoYi-Plus-UniApp 移动端提供了完整的组件系统，由 **WD UI 组件库**和**自定义业务组件**组成。WD UI 基于 Wot Design Uni 深度改造，使用 Vue 3 + TypeScript + Composition API 构建，提供 90+ 个高质量组件。

**核心特性**:

- **丰富完整** - 90+ 个组件，覆盖基础、布局、导航、表单、展示、反馈全场景
- **类型安全** - 完整的 TypeScript 类型定义
- **统一规范** - 组件命名、Props、Events、Slots 遵循统一设计规范
- **主题定制** - 支持 CSS 变量自定义样式和主题
- **跨平台兼容** - 支持微信小程序、H5、App 等多平台

## 目录结构

```
src/
├── wd/                          # WD UI 组件库
│   ├── components/              # 组件实现
│   │   ├── common/             # 公共工具模块
│   │   ├── composables/        # 组合式函数
│   │   └── wd-button/          # 组件目录
│   ├── locale/                 # 国际化语言包
│   └── index.ts                # 统一导出
├── components/                  # 自定义业务组件
│   ├── auth/                   # 认证组件
│   └── tabbar/                 # 标签栏组件
└── pages/                       # 页面组件
```

## 组件分类

### 基础组件 (6个)

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Button | 按钮 | 触发操作、提交表单 |
| Icon | 图标 | 展示图标 |
| Text | 文本 | 格式化文本展示 |
| Transition | 过渡动画 | 元素动画效果 |
| Resize | 尺寸监听 | 监听元素尺寸变化 |
| ConfigProvider | 全局配置 | 配置默认属性和主题 |

### 布局组件 (7个)

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Layout | 布局容器 | Row/Col 栅格布局 |
| Grid | 宫格 | 图标导航、功能入口 |
| Cell | 单元格 | 列表项展示 |
| Divider | 分割线 | 内容分隔 |
| Space | 间距 | 元素间距管理 |
| Row | 行容器 | 栅格布局行 |
| Col | 列容器 | 栅格布局列 |

### 导航组件 (13个)

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Navbar | 导航栏 | 页面顶部导航 |
| Tabbar | 标签栏 | 底部导航切换 |
| Tabs | 标签页 | 内容分类切换 |
| Sidebar | 侧边导航 | 侧边分类导航 |
| IndexBar | 索引栏 | 列表索引 |
| Steps | 步骤条 | 流程进度展示 |
| Pagination | 分页 | 数据分页 |
| Sticky | 粘性布局 | 固定元素定位 |
| Backtop | 回到顶部 | 快速返回顶部 |
| DropMenu | 下拉菜单 | 筛选条件选择 |

### 表单组件 (22个)

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Input | 输入框 | 文本输入 |
| Textarea | 文本域 | 多行文本输入 |
| Radio/RadioGroup | 单选框 | 单选选择 |
| Checkbox/CheckboxGroup | 复选框 | 多选选择 |
| Switch | 开关 | 开关切换 |
| Rate | 评分 | 星级评分 |
| Slider | 滑块 | 数值范围选择 |
| Stepper | 步进器 | 数值增减 |
| Picker | 选择器 | 单列/多列选择 |
| DatetimePicker | 时间选择 | 日期时间选择 |
| Calendar | 日历 | 日期范围选择 |
| Upload | 上传 | 文件/图片上传 |
| Search | 搜索 | 搜索输入 |
| Form | 表单 | 表单容器和验证 |

### 展示组件 (18个)

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Tag | 标签 | 标签展示 |
| Badge | 徽标 | 数字角标 |
| Progress | 进度条 | 进度展示 |
| Circle | 环形进度 | 环形进度展示 |
| Image | 图片 | 图片展示、懒加载 |
| Swiper | 轮播 | 图片轮播 |
| Collapse | 折叠面板 | 内容折叠展开 |
| NoticeBar | 通知栏 | 滚动通知 |
| CountDown | 倒计时 | 倒计时展示 |
| Card | 卡片 | 卡片容器 |
| Skeleton | 骨架屏 | 加载占位 |
| StatusTip | 状态提示 | 空态、错误提示 |

### 反馈组件 (24个)

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Toast | 轻提示 | 操作结果提示 |
| Loading | 加载 | 加载状态展示 |
| MessageBox | 消息弹窗 | 确认、提示弹窗 |
| ActionSheet | 动作面板 | 操作选项选择 |
| Popup | 弹出层 | 自定义弹出内容 |
| SwipeAction | 滑动操作 | 列表项滑动操作 |
| Notify | 通知 | 顶部通知消息 |
| Overlay | 遮罩层 | 遮罩背景 |
| Popover | 气泡 | 气泡提示框 |
| Fab | 浮动按钮 | 悬浮操作按钮 |
| PullRefresh | 下拉刷新 | 列表下拉刷新 |

## 组件使用

### 全局注册（推荐）

通过 `easycom` 机制自动全局注册，无需手动导入：

```json
// pages.json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  }
}
```

```vue
<template>
  <!-- 直接使用，无需导入 -->
  <wd-button type="primary" @click="handleClick">按钮</wd-button>
  <wd-input v-model="value" placeholder="请输入" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref('')
const handleClick = () => console.log('clicked')
</script>
```

### 组合式函数

```vue
<script lang="ts" setup>
import { useToast, useMessage, useNotify } from '@/wd'

const toast = useToast()
const message = useMessage()
const notify = useNotify()

// Toast
toast.success('操作成功')
toast.error('操作失败')
toast.loading('加载中...')

// Message
const result = await message.confirm({
  title: '提示',
  content: '确定删除吗？'
})

// Notify
notify.success('成功提示')
</script>
```

### 工具函数

```typescript
import { dayjs, CommonUtil } from '@/wd'

const now = dayjs()
const formatted = dayjs().format('YYYY-MM-DD HH:mm:ss')
```

## Props 系统

### 定义规范

```typescript
interface WdButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'default'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
}

const props = withDefaults(defineProps<WdButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false
})
```

### 常见类型

```typescript
interface ComponentProps {
  // 基础类型
  title?: string
  count?: number
  disabled?: boolean
  items?: string[]

  // 枚举类型
  type?: 'primary' | 'success' | 'warning' | 'error'

  // 样式类型
  customStyle?: string
  customClass?: string
}
```

## Events 系统

### 定义规范

```typescript
interface WdButtonEmits {
  click: [event: Event]
  longpress: [event: Event]
}

const emit = defineEmits<WdButtonEmits>()

const handleClick = (event: Event) => {
  emit('click', event)
}
```

### 使用示例

```vue
<template>
  <wd-button @click="handleClick" @longpress="handleLongpress">按钮</wd-button>
  <wd-input v-model="value" @input="handleInput" @change="handleChange" />
</template>

<script lang="ts" setup>
const handleClick = (event: Event) => console.log('clicked', event)
const handleInput = (value: string) => console.log('input', value)
</script>
```

## Slots 系统

### 默认插槽

```vue
<wd-button type="primary">提交表单</wd-button>

<wd-cell title="标题">
  <template #default>自定义内容</template>
</wd-cell>
```

### 具名插槽

```vue
<wd-cell>
  <template #title>
    <view class="custom-title">
      <wd-icon name="user" />
      <text>用户信息</text>
    </view>
  </template>
  <template #icon>
    <wd-icon name="setting" color="#ff0000" />
  </template>
</wd-cell>
```

### 作用域插槽

```vue
<wd-picker :columns="columns">
  <template #option="{ item, index }">
    <view class="custom-option">{{ index + 1 }}. {{ item.label }}</view>
  </template>
</wd-picker>
```

## 组件通信

### Props / Events

```vue
<!-- 父组件 -->
<child-component :user="user" @update="handleUpdate" />

<!-- 子组件 -->
<script lang="ts" setup>
const props = defineProps<{ user: User }>()
const emit = defineEmits<{ update: [user: User] }>()
</script>
```

### v-model 双向绑定

```vue
<wd-input v-model="username" />

<!-- 多个 v-model -->
<custom-form v-model:username="form.username" v-model:password="form.password" />
```

### Provide / Inject

```vue
<!-- 祖先组件 -->
<script lang="ts" setup>
import { provide } from 'vue'
const theme = ref('light')
provide('theme', theme)
</script>

<!-- 后代组件 -->
<script lang="ts" setup>
import { inject } from 'vue'
const theme = inject('theme')
</script>
```

### Ref 获取组件实例

```vue
<template>
  <wd-form ref="formRef" :model="form">
    <wd-input v-model="form.username" prop="username" />
  </wd-form>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const handleSubmit = async () => {
  await formRef.value?.validate()
}
</script>
```

### Pinia 状态管理

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)
  const isLoggedIn = computed(() => !!userInfo.value)

  const login = async (username: string, password: string) => {
    // 登录逻辑
  }

  return { userInfo, isLoggedIn, login }
})
```

## 自定义组件开发

### 组件模板

```vue
<template>
  <view :class="rootClass" :style="rootStyle">
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({
  name: 'CustomComponent',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared'
  }
})

interface Props {
  type?: 'default' | 'primary'
  disabled?: boolean
  customStyle?: string
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  disabled: false
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const rootClass = computed(() => [
  'custom-component',
  `custom-component--${props.type}`,
  { 'custom-component--disabled': props.disabled },
  props.customClass
])

const rootStyle = computed(() => props.customStyle)

defineExpose({
  // 暴露方法
})
</script>
```

## 性能优化

### 按需渲染

```vue
<!-- 频繁切换用 v-show -->
<wd-popup v-show="showPopup" />

<!-- 条件渲染用 v-if -->
<view v-if="userType === 'admin'" />
```

### 列表优化

```vue
<wd-paging ref="pagingRef" :fetch-api="fetchList" :page-size="20">
  <template #default="{ item }">
    <wd-cell :title="item.name" />
  </template>
</wd-paging>
```

### 计算属性缓存

```typescript
// 推荐：使用计算属性
const filteredList = computed(() => list.value.filter(item => item.active))

// 不推荐：使用方法
const getFilteredList = () => list.value.filter(item => item.active)
```

### 组件懒加载

```typescript
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/heavy-component/index.vue')
)
```

## 最佳实践

### 单一职责

```vue
<!-- 好：职责单一 -->
<user-avatar :avatar="user.avatar" />
<user-info :user="user" />

<!-- 不好：职责混乱 -->
<user-profile :user="user" :show-avatar="true" :show-info="true" />
```

### Props 设计

```typescript
// 提供合理默认值
const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false
})

// 使用描述性名称
interface Props {
  buttonText: string   // 好
  isLoading: boolean   // 好
  text: string         // 不好
  flag: boolean        // 不好
}
```

### 样式规范

```scss
// 使用 BEM 命名
.wd-button {
  &__icon { }
  &--primary { }
  &--disabled { }
}

// 使用 CSS 变量
.wd-button {
  background-color: var(--wd-button-bg-color, #ffffff);
}

// 使用 rpx 单位
.component {
  padding: 32rpx;
  font-size: 28rpx;
}
```

## 常见问题

### 组件不显示

检查 easycom 配置：

```json
{
  "easycom": {
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  }
}
```

### v-model 不生效

确保组件正确实现：

```vue
<script lang="ts" setup>
interface Props {
  modelValue: string  // 必须是 modelValue
}
interface Emits {
  'update:modelValue': [value: string]  // 必须是 update:modelValue
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
```

### ref 获取不到实例

使用 `defineExpose` 暴露方法：

```vue
<script lang="ts" setup>
const validate = () => { }
defineExpose({ validate })  // 必须显式暴露
</script>
```

### 平台差异

使用条件编译：

```vue
<!-- #ifdef MP-WEIXIN -->
<button open-type="getUserInfo">获取用户信息</button>
<!-- #endif -->

<!-- #ifdef H5 -->
<button @click="handleLogin">登录</button>
<!-- #endif -->
```

统一使用 rpx 单位：

```scss
.component {
  width: 750rpx;   // 推荐
  // width: 375px; // 避免
}
```
