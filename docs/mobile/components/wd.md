# WD UI 组件库

WD UI 是 RuoYi-Plus-UniApp 移动端使用的组件库，基于 Wot Design Uni 深度定制。

## 介绍

WD UI 是专为 UniApp 打造的移动端组件库，基于 Vue 3 Composition API 和 TypeScript 开发，提供 78 个高质量组件。

**核心特性：**

- **Vue 3 Composition API** - 支持 `<script setup>` 语法
- **TypeScript 支持** - 完整的类型定义
- **多端兼容** - 支持 H5、微信小程序、支付宝小程序、App
- **主题定制** - 基于 CSS 变量的主题系统
- **国际化** - 内置 15 种语言支持
- **组合式函数** - 提供 useToast、useMessage 等实用函数

## 组件分类

| 分类 | 数量 | 说明 |
|------|------|------|
| 基础组件 | 6 | Button、Icon、Text 等 |
| 布局组件 | 5 | Grid、Row/Col、Divider 等 |
| 导航组件 | 9 | Navbar、Tabbar、Tabs 等 |
| 表单组件 | 22 | Input、Picker、Form 等 |
| 展示组件 | 13 | Card、Cell、Badge 等 |
| 反馈组件 | 23 | Toast、Loading、Popup 等 |

## 快速开始

### 组件使用

组件已全局注册，可直接使用：

```vue
<template>
  <wd-button type="primary">按钮</wd-button>
  <wd-icon name="home" />
  <wd-cell title="单元格" value="内容" />
</template>
```

### 引入组合式函数

```typescript
import { useToast, useMessage, useNotify, useUpload } from '@/wd'

const toast = useToast()
toast.success('操作成功')

const { confirm } = useMessage()
const result = await confirm({ title: '确认', msg: '确定要删除吗？' })
```

### 引入类型定义

```typescript
import type {
  FormInstance,
  PickerInstance,
  CalendarInstance,
  ToastOptions,
  MessageOptions
} from '@/wd'
```

## 组件列表

### 基础组件

| 组件 | 说明 | 主要功能 |
|------|------|---------|
| Button | 按钮 | 8种类型、4种尺寸、图标按钮、加载状态 |
| Icon | 图标 | 字体图标、UnoCSS图标、自定义图标 |
| Text | 文本 | 文本类型、截断、可复制、价格格式 |
| Transition | 动画 | 内置动画、自定义动画 |
| Resize | 尺寸 | 监听元素尺寸变化 |
| ConfigProvider | 配置 | 主题定制、语言配置 |

```vue
<template>
  <!-- 按钮 -->
  <wd-button type="primary">主要按钮</wd-button>
  <wd-button type="primary" plain>朴素按钮</wd-button>
  <wd-button type="primary" loading>加载中</wd-button>
  <wd-button type="primary" icon="edit">编辑</wd-button>

  <!-- 图标 -->
  <wd-icon name="home" />
  <wd-icon name="setting" size="40" color="#1989fa" />
  <wd-icon name="i-carbon-home" />
</template>
```

### 布局组件

| 组件 | 说明 | 主要功能 |
|------|------|---------|
| Grid | 宫格 | 自定义列数、图标大小、可点击 |
| Row/Col | 栅格 | 24列栅格、间距控制 |
| Divider | 分割线 | 水平/垂直、文字位置 |
| Gap | 间距 | 统一间距管理 |
| Sticky | 吸顶 | 吸顶定位、偏移量 |

```vue
<template>
  <!-- 宫格 -->
  <wd-grid :column="4" clickable @item-click="handleClick">
    <wd-grid-item icon="home" text="首页" />
    <wd-grid-item icon="cart" text="购物车" badge="99+" />
  </wd-grid>

  <!-- 栅格 -->
  <wd-row :gutter="16">
    <wd-col :span="8"><view>span: 8</view></wd-col>
    <wd-col :span="8"><view>span: 8</view></wd-col>
    <wd-col :span="8"><view>span: 8</view></wd-col>
  </wd-row>
</template>
```

### 导航组件

| 组件 | 说明 | 主要功能 |
|------|------|---------|
| Navbar | 导航栏 | 标题、左右按钮、固定顶部 |
| Tabbar | 标签栏 | 图标、徽标、路由联动 |
| Tabs | 标签页 | 滑动切换、徽标、禁用 |
| Sidebar | 侧边栏 | 徽标、禁用 |
| IndexBar | 索引栏 | 快速定位、吸顶效果 |
| Pagination | 分页 | 页码显示、上一页/下一页 |
| Paging | 滚动分页 | 下拉刷新、上拉加载 |
| Segmented | 分段器 | 块状/线型、禁用 |
| Backtop | 返回顶部 | 自定义图标、触发高度 |

```vue
<template>
  <!-- 导航栏 -->
  <wd-navbar title="页面标题" left-arrow @click-left="handleBack">
    <template #right>
      <wd-icon name="more" />
    </template>
  </wd-navbar>

  <!-- 标签页 -->
  <wd-tabs v-model="activeTab" @change="handleTabChange">
    <wd-tab title="推荐" name="recommend">推荐内容</wd-tab>
    <wd-tab title="热门" name="hot" badge="99+">热门内容</wd-tab>
  </wd-tabs>

  <!-- 滚动分页 -->
  <wd-paging ref="pagingRef" :fetch="fetchList" :params="queryParams">
    <template #item="{ item }">
      <wd-card>{{ item.title }}</wd-card>
    </template>
  </wd-paging>
</template>

<script lang="ts" setup>
import type { PagingInstance } from '@/wd'

const pagingRef = ref<PagingInstance>()
const activeTab = ref('recommend')

const fetchList = async (params: any) => {
  const res = await api.getList(params)
  return res.data
}
</script>
```

### 表单组件

| 组件 | 说明 | 主要功能 |
|------|------|---------|
| Form | 表单 | 表单验证、规则配置 |
| Input | 输入框 | 类型、前后缀、清除 |
| Textarea | 文本域 | 自动高度、字数统计 |
| Picker | 选择器 | 单列/多列、级联 |
| DatetimePicker | 时间选择 | 年月日时分秒 |
| Calendar | 日历 | 单选/多选/范围 |
| Checkbox | 复选框 | 全选、最大数量 |
| Radio | 单选框 | 按钮样式、禁用 |
| Switch | 开关 | 加载状态、禁用 |
| Slider | 滑块 | 范围、步长 |
| Rate | 评分 | 半星、只读 |
| Search | 搜索 | 取消按钮、防抖 |
| Upload | 上传 | 图片/视频/文件、预览 |

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <wd-cell-group title="基本信息">
      <wd-input v-model="formData.username" label="用户名" prop="username" placeholder="请输入用户名" clearable />
      <wd-input v-model="formData.password" label="密码" prop="password" type="password" placeholder="请输入密码" show-password />
      <wd-input v-model="formData.phone" label="手机号" prop="phone" type="number" maxlength="11" />
    </wd-cell-group>
    <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
  </wd-form>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()
const formData = reactive({ username: '', password: '', phone: '' })

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '长度为3-20个字符' }
  ],
  password: [{ required: true, message: '请输入密码' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) console.log('表单数据:', formData)
}
</script>
```

**时间选择与上传：**

```vue
<template>
  <!-- 时间选择 -->
  <wd-datetime-picker v-model="dateValue" type="datetime" label="选择时间" :min-date="minDate" :max-date="maxDate" />

  <!-- 文件上传 -->
  <wd-upload v-model:file-list="fileList" action="/api/upload" :max-count="9" :max-size="5 * 1024 * 1024" accept="image" @success="handleSuccess" />
</template>

<script lang="ts" setup>
const dateValue = ref(Date.now())
const minDate = Date.now() - 30 * 24 * 60 * 60 * 1000
const maxDate = Date.now() + 30 * 24 * 60 * 60 * 1000
const fileList = ref([])
</script>
```

### 展示组件

| 组件 | 说明 | 主要功能 |
|------|------|---------|
| Cell | 单元格 | 图标、标题、值、箭头 |
| Card | 卡片 | 标题、内容、底部操作 |
| Badge | 徽标 | 数字、圆点、自定义颜色 |
| Tag | 标签 | 类型、尺寸、可关闭 |
| Progress | 进度条 | 线型/环形、动画 |
| Steps | 步骤条 | 横向/竖向、点状/数字 |
| Collapse | 折叠面板 | 手风琴模式、禁用 |
| Swiper | 轮播 | 自动播放、指示器 |
| Skeleton | 骨架屏 | 自定义形状、动画 |
| Table | 表格 | 表头固定、排序 |
| Img | 图片 | 懒加载、预览 |
| Watermark | 水印 | 文字/图片水印 |

```vue
<template>
  <!-- 单元格 -->
  <wd-cell-group title="基础用法">
    <wd-cell title="单元格" value="内容" />
    <wd-cell title="带图标" icon="setting" value="内容" />
    <wd-cell title="可点击" value="内容" is-link @click="handleClick" />
  </wd-cell-group>

  <!-- 步骤条 -->
  <wd-steps :active="activeStep">
    <wd-step title="提交订单" description="2024-01-01 10:00" />
    <wd-step title="商家接单" />
    <wd-step title="已完成" />
  </wd-steps>
</template>

<script lang="ts" setup>
const activeStep = ref(1)
</script>
```

### 反馈组件

| 组件 | 说明 | 主要功能 |
|------|------|---------|
| Toast | 轻提示 | 文字、图标、加载 |
| Loading | 加载 | 类型、尺寸、颜色 |
| Popup | 弹出层 | 位置、圆角、关闭按钮 |
| MessageBox | 消息框 | alert/confirm/prompt |
| ActionSheet | 动作面板 | 选项列表、取消按钮 |
| Notify | 通知 | 类型、位置、持续时间 |
| NoticeBar | 通知栏 | 滚动、链接、关闭 |
| Overlay | 遮罩 | 透明度、点击关闭 |
| SwipeAction | 滑动操作 | 左右操作按钮 |

```vue
<template>
  <wd-button @click="showToast">普通提示</wd-button>
  <wd-button @click="showConfirm">确认框</wd-button>
  <wd-button @click="showActionSheet">动作面板</wd-button>

  <!-- 反馈组件需要在页面中放置 -->
  <wd-toast />
  <wd-message-box />
  <wd-action-sheet v-model="actionSheetVisible" :actions="actions" @select="handleSelect" />
</template>

<script lang="ts" setup>
import { useToast, useMessage } from '@/wd'

const toast = useToast()
const { confirm } = useMessage()
const actionSheetVisible = ref(false)
const actions = [{ name: '选项一' }, { name: '选项二' }, { name: '删除', color: '#ee0a24' }]

const showToast = () => toast.success('操作成功')

const showConfirm = async () => {
  const result = await confirm({ title: '确认删除', msg: '确定要删除吗？' })
  if (result.action === 'confirm') console.log('用户确认')
}

const showActionSheet = () => actionSheetVisible.value = true
const handleSelect = (action: any) => console.log('选择:', action.name)
</script>
```

## 组合式函数

### useToast

```typescript
import { useToast } from '@/wd'

const toast = useToast()

toast.show('提示信息')
toast.success('操作成功')
toast.error('操作失败')
toast.warning('警告信息')
toast.loading('加载中...')
toast.close()
```

**配置选项：**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| msg | 提示消息 | `string` | - |
| iconName | 图标名称 | `string` | - |
| duration | 持续时间，0不自动关闭 | `number` | `2000` |
| position | 位置 | `'middle-top' \| 'middle' \| 'middle-bottom'` | `'middle'` |
| cover | 是否显示遮罩 | `boolean` | `false` |

### useMessage

```typescript
import { useMessage } from '@/wd'

const { alert, confirm, prompt, close } = useMessage()

// Alert 提示框
await alert({ title: '提示', msg: '这是一条提示' })

// Confirm 确认框
const result = await confirm({ title: '确认', msg: '确定执行吗？' })
if (result.action === 'confirm') { /* 用户确认 */ }

// Prompt 输入框
const result = await prompt({
  title: '输入',
  msg: '请输入内容',
  inputPlaceholder: '请输入',
  inputPattern: /\S+/,
  inputError: '内容不能为空'
})
if (result.action === 'confirm') console.log('输入:', result.value)
```

**配置选项：**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题 | `string` | - |
| msg | 消息内容 | `string` | - |
| type | 弹窗类型 | `'alert' \| 'confirm' \| 'prompt'` | `'alert'` |
| confirmButtonText | 确定按钮文案 | `string` | `'确定'` |
| cancelButtonText | 取消按钮文案 | `string` | `'取消'` |
| inputType | 输入框类型 | `string` | `'text'` |
| inputValue | 输入框初始值 | `string` | - |
| inputPattern | 校验正则 | `RegExp` | - |
| inputError | 校验失败提示 | `string` | - |

### useNotify

```typescript
import { useNotify } from '@/wd'

const notify = useNotify()

notify.show('通知消息')
notify.primary('主要通知')
notify.success('成功通知')
notify.warning('警告通知')
notify.danger('危险通知')
notify.close()
```

**配置选项：**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 通知类型 | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` |
| message | 通知消息 | `string` | - |
| duration | 持续时间 | `number` | `3000` |
| position | 显示位置 | `'top' \| 'bottom'` | `'top'` |

### useUpload

```typescript
import { useUpload } from '@/wd'

const { startUpload, fastUpload, abort, chooseFile } = useUpload()

// 选择文件
const files = await chooseFile({ accept: 'image', multiple: true, maxCount: 9 })

// 快速上传
fastUpload(files[0].path, {
  enableDirectUpload: true,
  moduleName: 'avatar',
  onSuccess: (res) => console.log('上传成功:', res.url),
  onError: (err) => console.log('上传失败:', err),
  onProgress: (res) => console.log('进度:', res.progress)
})

// 中断上传
abort()
```

**上传配置选项：**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| action | 上传地址 | `string` | - |
| header | 请求头 | `Record<string, any>` | - |
| formData | 表单数据 | `Record<string, any>` | - |
| name | 文件字段名 | `string` | `'file'` |
| enableDirectUpload | 是否启用直传 | `boolean` | `false` |
| moduleName | 模块名称 | `string` | - |
| onSuccess | 成功回调 | `Function` | - |
| onError | 失败回调 | `Function` | - |
| onProgress | 进度回调 | `Function` | - |

**文件选择配置：**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| accept | 文件类型 | `'image' \| 'video' \| 'media' \| 'file' \| 'all'` | `'image'` |
| multiple | 是否多选 | `boolean` | `false` |
| maxCount | 最大数量 | `number` | `9` |
| sizeType | 尺寸类型 | `('original' \| 'compressed')[]` | - |
| sourceType | 来源类型 | `('album' \| 'camera')[]` | - |

## 国际化

### 支持的语言

zh-CN、zh-TW、zh-HK、en-US、ja-JP、ko-KR、de-DE、fr-FR、es-ES、pt-PT、ru-RU、ar-SA、th-TH、tr-TR、vi-VN

### 切换语言

```typescript
import { Locale, useCurrentLang } from '@/wd'

// 切换语言
Locale.use('en-US')
Locale.use('ja-JP')

// 获取当前语言
const currentLang = useCurrentLang()

// 添加自定义语言包
Locale.add({
  'my-custom': {
    calendar: { placeholder: '请选择', title: '选择日期', confirm: '确定' },
    messageBox: { confirm: '确定', cancel: '取消' }
  }
})
Locale.use('my-custom')
```

## 主题定制

### 基础主题变量

```scss
page {
  // 主色调
  --wd-color-primary: #1989fa;
  --wd-color-success: #07c160;
  --wd-color-warning: #ff976a;
  --wd-color-danger: #ee0a24;

  // 文字颜色
  --wd-color-text: #323233;
  --wd-color-text-secondary: #969799;

  // 背景颜色
  --wd-color-bg: #f7f8fa;
  --wd-color-bg-white: #ffffff;

  // 边框颜色
  --wd-color-border: #ebedf0;

  // 圆角
  --wd-radius-small: 4rpx;
  --wd-radius-medium: 8rpx;
  --wd-radius-large: 16rpx;

  // 字体大小
  --wd-font-size-small: 24rpx;
  --wd-font-size-medium: 28rpx;
  --wd-font-size-large: 32rpx;
}
```

### 组件级主题变量

```scss
page {
  // Button
  --wd-button-primary-bg: #1989fa;
  --wd-button-small-height: 56rpx;
  --wd-button-medium-height: 72rpx;

  // Cell
  --wd-cell-padding: 24rpx 32rpx;
  --wd-cell-font-size: 28rpx;

  // Toast
  --wd-toast-max-width: 70%;
  --wd-toast-border-radius: 16rpx;
  --wd-toast-bg-color: rgba(0, 0, 0, 0.7);
}
```

### ConfigProvider 组件

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">主要按钮</wd-button>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import type { ConfigProviderThemeVars } from '@/wd'

const themeVars = ref<ConfigProviderThemeVars>({
  colorPrimary: '#7232dd',
  buttonPrimaryBg: '#7232dd'
})
</script>
```

### 暗黑模式

```scss
page.dark-mode {
  --wd-color-text: #f5f5f5;
  --wd-color-bg: #1a1a1a;
  --wd-color-bg-white: #2c2c2c;
  --wd-color-border: #3a3a3a;
}
```

## 类型导出

### 组件实例类型

```typescript
import type {
  FormInstance,
  PickerInstance,
  DatetimePickerInstance,
  CalendarInstance,
  PagingInstance,
  UploadInstance,
  TabsInstance,
  CollapseInstance,
  SwipeActionInstance
} from '@/wd'
```

### 使用组件实例

```vue
<template>
  <wd-form ref="formRef" :model="formData">...</wd-form>
</template>

<script lang="ts" setup>
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const validate = async () => {
  const valid = await formRef.value?.validate()
  return valid
}

const reset = () => formRef.value?.resetFields()
</script>
```

### 工具类型

```typescript
import type { ConfigProviderThemeVars } from '@/wd'
import { dayjs, CommonUtil } from '@/wd'

// 日期处理
const date = dayjs('2024-01-01')
console.log(date.format('YYYY年MM月DD日'))

// 工具函数
const cloned = CommonUtil.deepClone({ a: 1 })
const debounced = CommonUtil.debounce(() => {}, 300)
```

## 设计规范

### 颜色规范

- **主色**: `#1989fa` - 主要按钮、链接
- **成功色**: `#07c160` - 成功状态
- **警告色**: `#ff976a` - 警告提示
- **危险色**: `#ee0a24` - 危险操作

### 尺寸规范

- **圆角**: 8rpx（按钮 4rpx）
- **间距**: 8、16、24、32rpx
- **字号**: 正文 28rpx，标题 32rpx，小字 24rpx

### 交互规范

- **点击反馈**: 所有可点击元素都有点击态
- **动画时长**: 快速 0.2s，普通 0.3s，慢速 0.4s
- **触摸区域**: 最小 44rpx × 44rpx

## 最佳实践

### 1. 合理使用组合式函数

```typescript
// ✅ 正确：在 setup 中调用一次
const toast = useToast()
const handleClick = () => toast.success('操作成功')

// ❌ 错误：在事件处理中重复调用
const handleClick = () => {
  const toast = useToast() // 每次点击都创建新实例
  toast.success('操作成功')
}
```

### 2. 正确放置反馈组件

```vue
<template>
  <view class="page"><!-- 页面内容 --></view>

  <!-- 反馈组件放在页面底部 -->
  <wd-toast />
  <wd-message-box />
  <wd-notify />
</template>
```

### 3. 使用 ref 获取组件实例

```vue
<script lang="ts" setup>
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) { /* 提交表单 */ }
}
</script>
```

### 4. 使用 custom-class 自定义样式

```vue
<template>
  <wd-button custom-class="my-button" type="primary">自定义按钮</wd-button>
</template>

<style scoped>
.my-button { width: 200rpx; }
</style>
```

## 常见问题

### 1. 组件样式不生效

**解决方案：** 使用 deep 选择器或 custom-class

```vue
<style scoped>
:deep(.wd-button) { background-color: #7232dd; }
</style>

<!-- 或 -->
<wd-button custom-class="my-button" />
```

### 2. Toast/Message 不显示

**解决方案：** 在页面中放置对应组件

```vue
<template>
  <view class="page"><!-- 内容 --></view>
  <wd-toast />
  <wd-message-box />
</template>
```

### 3. 表单验证不触发

**解决方案：** 确保设置 prop 属性且与 model 字段名一致

```vue
<wd-form :model="formData" :rules="rules">
  <wd-input v-model="formData.username" prop="username" />
</wd-form>
```

### 4. 多端样式差异

**解决方案：** 使用条件编译

```vue
<style scoped>
/* #ifdef MP-WEIXIN */
.my-class { /* 微信小程序特定样式 */ }
/* #endif */

/* #ifdef H5 */
.my-class { /* H5 特定样式 */ }
/* #endif */
</style>
```

### 5. 组件方法调用失败

**解决方案：** 等待组件挂载后调用

```typescript
const formRef = ref<FormInstance>()

onMounted(() => {
  formRef.value?.resetFields()
})

// 或使用 nextTick
const handleClick = async () => {
  await nextTick()
  formRef.value?.validate()
}
```

### 6. 图标不显示

**解决方案：** 检查图标名称或 UnoCSS 配置

```vue
<!-- 字体图标 -->
<wd-icon name="home" />

<!-- UnoCSS 图标需要配置 uno.config.ts -->
```

```typescript
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default)
      }
    })
  ]
})
```
