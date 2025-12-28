# WD UI 组件库概览

## 简介

**Wot Design Uni** 是一个基于 Vue 3 + TypeScript 的 uni-app 组件库，提供 **98 个**高质量的移动端 UI 组件，完美适配各个小程序平台（微信、支付宝、钉钉、百度、抖音、QQ）和 H5、App 端。

本项目在 Wot Design Uni 的基础上进行了**二次封装和扩展**，位于 `src/wd` 目录，提供更符合项目需求的组件实现。

**核心优势：**

- **全平台兼容** - 支持 H5、微信/支付宝/钉钉/百度/抖音/QQ/快手/小红书小程序、Android/iOS/鸿蒙 App
- **TypeScript 支持** - 完整类型定义、智能代码提示、类型安全保障
- **自动按需引入** - 无需手动导入组件，自动生成类型声明
- **主题定制** - CSS 变量系统、暗色模式支持、动态主题切换
- **国际化** - 内置 15 种语言包，支持动态语言切换
- **丰富的组合式 API** - 提供 Toast、Message、Notify 等命令式调用

## 版本信息

```json
{
  "wot-design-uni": "^1.5.13"
}
```

项目使用 Wot Design Uni 的稳定版本，定期随 uni-app 生态更新。

## 核心特性

### 1. 全平台兼容

支持所有 uni-app 支持的平台：

| 平台类型 | 支持平台 | 状态 |
|---------|---------|------|
| **Web** | H5 | ✅ 完全支持 |
| **小程序** | 微信、支付宝、钉钉、百度、抖音、QQ、快手、小红书 | ✅ 完全支持 |
| **App** | Android、iOS、鸿蒙 | ✅ 完全支持 |

**平台差异处理**:

```vue
<template>
  <!-- 支付宝小程序不支持 v-show，需使用 v-if -->
  <!-- #ifdef MP-ALIPAY -->
  <wd-button v-if="visible">支付宝专用</wd-button>
  <!-- #endif -->

  <!-- 非支付宝端使用 v-show 提高性能 -->
  <!-- #ifndef MP-ALIPAY -->
  <wd-button v-show="visible">其他平台</wd-button>
  <!-- #endif -->
</template>
```

### 2. TypeScript 支持

组件库提供完整的 TypeScript 类型定义：

```typescript
// 导入组件实例类型
import type {
  FormInstance,
  PickerInstance,
  CalendarInstance,
  TooltipInstance,
  UploadInstance
} from '@/wd'

// 在组件中使用
const formRef = ref<FormInstance | null>(null)
const pickerRef = ref<PickerInstance | null>(null)

// 调用组件方法时获得完整类型提示
formRef.value?.validate()
pickerRef.value?.open()
```

**主要类型导出**:

| 类型名称 | 说明 | 使用场景 |
|---------|------|---------|
| `FormInstance` | 表单组件实例 | 表单校验、重置 |
| `PickerInstance` | 选择器实例 | 打开/关闭选择器 |
| `CalendarInstance` | 日历组件实例 | 日期选择控制 |
| `UploadInstance` | 上传组件实例 | 文件上传管理 |
| `TooltipInstance` | 工具提示实例 | 提示显示/隐藏 |
| `SwipeActionInstance` | 滑动操作实例 | 滑动状态控制 |
| `CountDownInstance` | 倒计时实例 | 倒计时控制 |
| `ConfigProviderThemeVars` | 主题变量类型 | 主题定制 |

### 3. 自动按需引入

项目已配置自动按需引入，无需手动导入组件：

**vite/plugins/components.ts**:

```typescript
import Components from '@uni-helper/vite-plugin-uni-components'

export default () => {
  return Components({
    extensions: ['vue'],
    deep: true,                          // 递归扫描子目录
    directoryAsNamespace: false,         // 不使用目录名作为命名空间
    dts: 'src/types/components.d.ts',    // 类型声明文件路径
  })
}
```

**使用方式**:

```vue
<template>
  <!-- 直接使用，无需导入 -->
  <wd-button type="primary">按钮</wd-button>
  <wd-input v-model="value" placeholder="请输入" />
  <wd-cell title="标题" value="内容" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 只需定义响应式数据，无需导入组件
const value = ref('')
</script>
```

### 4. 主题定制

组件库支持多种主题定制方式：

**方式一：CSS 变量覆盖**

```scss
/* src/uni.scss */
page {
  /* 品牌色系 */
  --wot-color-theme: #0957DE;
  --wot-color-success: #4cd964;
  --wot-color-warning: #f0ad4e;
  --wot-color-danger: #dd524d;

  /* 圆角 */
  --wot-radius-default: 8rpx;
  --wot-radius-lg: 16rpx;

  /* 尺寸 */
  --wot-button-height: 88rpx;
  --wot-cell-height: 100rpx;

  /* 字体 */
  --wot-font-size-base: 28rpx;
  --wot-font-size-lg: 32rpx;
}
```

**方式二：ConfigProvider 组件**

```vue
<template>
  <wd-config-provider :theme="themeVars">
    <view class="app">
      <wd-button type="primary">主题按钮</wd-button>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import type { ConfigProviderThemeVars } from '@/wd'

const themeVars: ConfigProviderThemeVars = {
  colorTheme: '#0957DE',
  colorSuccess: '#4cd964',
  colorWarning: '#f0ad4e',
  colorDanger: '#dd524d',
  radiusDefault: '8rpx',
  fontSizeBase: '28rpx',
}
</script>
```

### 5. 国际化支持

组件库内置 15 种语言包，支持动态语言切换：

**内置语言**:

| 语言代码 | 语言名称 | 语言代码 | 语言名称 |
|---------|---------|---------|---------|
| `zh-CN` | 简体中文 | `zh-TW` | 繁体中文(台湾) |
| `zh-HK` | 繁体中文(香港) | `en-US` | 英语 |
| `ja-JP` | 日语 | `ko-KR` | 韩语 |
| `fr-FR` | 法语 | `de-DE` | 德语 |
| `es-ES` | 西班牙语 | `pt-PT` | 葡萄牙语 |
| `ru-RU` | 俄语 | `ar-SA` | 阿拉伯语 |
| `th-TH` | 泰语 | `vi-VN` | 越南语 |
| `tr-TR` | 土耳其语 | - | - |

**切换语言**:

```typescript
import Locale, { useCurrentLang } from '@/wd'

// 切换到英语
Locale.use('en-US')

// 获取当前语言
const currentLang = useCurrentLang()
console.log(currentLang.value) // 'en-US'

// 添加自定义语言包
Locale.add({
  'custom-lang': {
    confirm: 'OK',
    cancel: 'Cancel',
    // ...
  }
})
```

## 项目结构

### 源码组件目录（src/wd）

```bash
src/wd/
├── components/           # 组件源码（98个）
│   ├── common/          # 通用工具
│   │   ├── util.ts      # 工具函数库（50+函数）
│   │   ├── dayjs.ts     # 日期处理库封装
│   │   ├── clickoutside.ts  # 点击外部关闭
│   │   └── AbortablePromise.ts  # 可中止Promise
│   ├── composables/     # 组合式函数（11个）
│   │   ├── useQueue.ts      # 队列管理
│   │   ├── useTouch.ts      # 触摸事件
│   │   ├── useUpload.ts     # 文件上传
│   │   ├── useCountDown.ts  # 倒计时
│   │   ├── useParent.ts     # 父组件通信
│   │   ├── useChildren.ts   # 子组件通信
│   │   ├── useCell.ts       # 单元格逻辑
│   │   ├── useLockScroll.ts # 滚动锁定
│   │   ├── usePopover.ts    # 气泡提示
│   │   ├── useRaf.ts        # 动画帧请求
│   │   └── useTranslate.ts  # 国际化翻译
│   ├── wd-button/       # 按钮组件
│   ├── wd-input/        # 输入框组件
│   ├── wd-tabbar/       # 自定义标签栏
│   ├── wd-toast/        # Toast 轻提示
│   │   ├── wd-toast.vue     # 组件实现
│   │   └── useToast.ts      # 组合式 API
│   ├── wd-message-box/  # 消息弹框
│   │   ├── wd-message-box.vue
│   │   └── useMessage.ts
│   ├── wd-notify/       # 通知提示
│   │   ├── wd-notify.vue
│   │   └── useNotify.ts
│   └── ...              # 其他95个组件
├── locale/              # 多语言支持
│   ├── index.ts         # 语言管理器
│   └── lang/            # 语言包（15个）
│       ├── zh-CN.ts     # 简体中文
│       ├── en-US.ts     # 英语
│       └── ...          # 其他语言
├── global.d.ts          # 全局类型声明
├── index.ts             # 导出入口
├── package.json         # 组件库配置
└── readme.md            # 组件库说明
```

### 二次封装组件

项目对以下组件进行了扩展：

| 组件 | 说明 | 扩展功能 |
|------|------|---------|
| wd-tabbar | 标签栏 | 支持双图标模式、状态管理集成 |
| wd-navbar-capsule | 导航栏胶囊 | 适配小程序胶囊按钮 |
| wd-language-selector | 语言选择器 | 国际化集成 |
| wd-rich-text | 富文本编辑器 | 增强的编辑功能 |
| wd-voice-recorder | 语音录制 | 录音功能封装 |

## 组件分类

### 基础组件（6 个）

提供构建移动端界面的基础元素。

| 组件 | 说明 | 核心特性 |
|------|------|---------|
| **Button** | 按钮 | 8种类型、3种尺寸、图标按钮、加载状态 |
| **Icon** | 图标 | 300+图标、自定义图标、动画效果 |
| **Text** | 文本 | 文本类型、价格格式、省略显示 |
| **Transition** | 动画 | 12种动画、自定义时长、动画回调 |
| **Resize** | 尺寸监听 | 响应式布局、尺寸变化回调 |
| **ConfigProvider** | 全局配置 | 主题定制、暗色模式 |

**Button 示例**:

```vue
<template>
  <view class="button-group">
    <!-- 按钮类型 -->
    <wd-button type="primary">主要按钮</wd-button>
    <wd-button type="success">成功按钮</wd-button>
    <wd-button type="warning">警告按钮</wd-button>
    <wd-button type="error">危险按钮</wd-button>

    <!-- 按钮尺寸 -->
    <wd-button size="large">大型按钮</wd-button>
    <wd-button size="medium">中型按钮</wd-button>
    <wd-button size="small">小型按钮</wd-button>

    <!-- 图标按钮 -->
    <wd-button type="primary" icon="add-circle">新增</wd-button>
    <wd-button type="primary" round icon="search" />

    <!-- 加载状态 -->
    <wd-button type="primary" :loading="loading" @click="handleSubmit">
      {{ loading ? '提交中...' : '提交' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  loading.value = false
}
</script>
```

### 布局组件（5 个）

提供灵活的页面布局能力。

| 组件 | 说明 | 核心特性 |
|------|------|---------|
| **Row-Col** | 行列布局 | 24栅格系统、间距设置、响应式 |
| **Grid** | 宫格 | 图标导航、自定义列数、正方形模式 |
| **Gap** | 间隙槽 | 内容分隔、自定义高度 |
| **Divider** | 分割线 | 水平/垂直、自定义文本 |
| **Sticky** | 吸顶布局 | 滚动吸顶、偏移距离 |

**栅格布局示例**:

```vue
<template>
  <view class="layout-demo">
    <!-- 基础栅格 -->
    <wd-row>
      <wd-col :span="8">span: 8</wd-col>
      <wd-col :span="8">span: 8</wd-col>
      <wd-col :span="8">span: 8</wd-col>
    </wd-row>

    <!-- 设置间距 -->
    <wd-row :gutter="20">
      <wd-col :span="12">左侧</wd-col>
      <wd-col :span="12">右侧</wd-col>
    </wd-row>

    <!-- 偏移 -->
    <wd-row>
      <wd-col :span="6" :offset="6">偏移6格</wd-col>
      <wd-col :span="6" :offset="6">偏移6格</wd-col>
    </wd-row>
  </view>
</template>
```

### 导航组件（9 个）

提供页面导航和内容切换能力。

| 组件 | 说明 | 核心特性 |
|------|------|---------|
| **Navbar** | 导航栏 | 标题、返回按钮、自定义内容 |
| **Tabbar** | 标签栏 | 底部导航、图标、徽标 |
| **Tabs** | 标签页 | 内容切换、滑动切换、懒加载 |
| **Segmented** | 分段器 | 选项切换、块状样式 |
| **Sidebar** | 侧边栏 | 侧边导航、联动滚动 |
| **IndexBar** | 索引栏 | 字母索引、城市选择 |
| **Pagination** | 分页 | 数据分页、页码跳转 |
| **Paging** | 分页加载 | 下拉加载、上拉刷新 |
| **Backtop** | 回到顶部 | 快速返回、显示条件 |

**Tabbar 示例**:

```vue
<template>
  <view class="container">
    <!-- 页面内容 -->
    <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
    <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
    <My v-if="tabs[2].loaded" v-show="currentTab === 2" />

    <!-- 标签栏 -->
    <wd-tabbar v-model="currentTab" :items="tabs" @change="handleTabChange" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Home from './Home.vue'
import Menu from './Menu.vue'
import My from './My.vue'

const currentTab = ref(0)

const tabs = ref([
  { title: '首页', icon: 'home', loaded: true },
  { title: '菜单', icon: 'menu', loaded: false },
  { title: '我的', icon: 'user', loaded: false },
])

const handleTabChange = (index: number) => {
  tabs.value[index].loaded = true
}
</script>
```

### 表单组件（22 个）

提供完整的表单输入和数据收集能力。

| 组件 | 说明 | 核心特性 |
|------|------|---------|
| **Input** | 输入框 | 文本输入、密码、清除按钮 |
| **Textarea** | 文本域 | 多行文本、字数统计、自适应高度 |
| **InputNumber** | 计数器 | 数量调整、步长、范围限制 |
| **PasswordInput** | 密码输入 | 密码格子、长度设置 |
| **Search** | 搜索框 | 搜索建议、取消按钮 |
| **Checkbox** | 复选框 | 多选、全选、禁用状态 |
| **Radio** | 单选框 | 单选、按钮样式、禁用 |
| **Switch** | 开关 | 状态切换、加载状态 |
| **Rate** | 评分 | 星级评分、半星、自定义图标 |
| **Slider** | 滑块 | 范围选择、刻度、步长 |
| **Picker** | 选择器 | 单列/多列、级联选择 |
| **PickerView** | 选择器视图 | 内嵌选择、自定义样式 |
| **ColPicker** | 多列选择器 | 省市区选择、动态数据 |
| **SelectPicker** | 单复选 | 列表选择、搜索过滤 |
| **DatetimePicker** | 时间选择 | 日期时间、范围选择 |
| **DatetimePickerView** | 时间视图 | 内嵌时间选择 |
| **Calendar** | 日历 | 日期选择、范围选择、自定义日期 |
| **CalendarView** | 日历板 | 内嵌日历、多选模式 |
| **Upload** | 上传 | 图片/文件上传、预览、压缩 |
| **Form** | 表单 | 表单容器、校验规则、提交 |
| **Signature** | 签名 | 手写签名、导出图片 |
| **Recorder** | 录音 | 语音录制、播放、上传 |

**表单校验示例**:

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <wd-cell-group>
      <wd-input
        v-model="formData.username"
        label="用户名"
        prop="username"
        placeholder="请输入用户名"
      />
      <wd-input
        v-model="formData.password"
        type="password"
        label="密码"
        prop="password"
        placeholder="请输入密码"
      />
      <wd-input
        v-model="formData.phone"
        label="手机号"
        prop="phone"
        placeholder="请输入手机号"
      />
    </wd-cell-group>

    <view class="form-actions">
      <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
      <wd-button block @click="handleReset">重置</wd-button>
    </view>
  </wd-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance } from '@/wd'
import { useToast } from '@/wd'

const toast = useToast()
const formRef = ref<FormInstance | null>(null)

const formData = reactive({
  username: '',
  password: '',
  phone: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '密码长度在6-20个字符' },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
  ],
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    toast.success('提交成功')
  } catch (error) {
    toast.error('请检查表单')
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

### 展示组件（13 个）

提供丰富的数据展示能力。

| 组件 | 说明 | 核心特性 |
|------|------|---------|
| **Cell** | 单元格 | 列表项、图标、箭头、分组 |
| **Badge** | 徽标 | 数量提示、圆点、自定义内容 |
| **Tag** | 标签 | 标记分类、可关闭、自定义颜色 |
| **Card** | 卡片 | 信息容器、封面、操作按钮 |
| **Collapse** | 折叠面板 | 内容折叠、手风琴模式 |
| **Steps** | 步骤条 | 流程展示、垂直/水平、图标 |
| **Table** | 表格 | 数据展示、排序、固定列 |
| **Img** | 图片 | 懒加载、加载状态、填充模式 |
| **ImgCropper** | 图片裁剪 | 裁剪比例、旋转、缩放 |
| **Swiper** | 轮播图 | 图片轮播、指示器、自动播放 |
| **Skeleton** | 骨架屏 | 加载占位、自定义形状 |
| **Curtain** | 幕帘 | 广告弹窗、引导页 |
| **Watermark** | 水印 | 图片/文字水印、全屏覆盖 |

### 反馈组件（23 个）

提供用户交互反馈能力。

| 组件 | 说明 | 核心特性 |
|------|------|---------|
| **ActionSheet** | 上拉菜单 | 操作选择、取消按钮 |
| **Popup** | 弹出层 | 多方向弹出、自定义内容 |
| **Overlay** | 遮罩层 | 蒙层显示、点击关闭 |
| **MessageBox** | 弹框 | 确认/取消、输入框 |
| **Toast** | 轻提示 | 消息提示、加载状态、图标 |
| **Notify** | 消息通知 | 顶部通知、多种类型 |
| **Loading** | 加载指示器 | 加载动画、自定义文本 |
| **Progress** | 进度条 | 进度显示、自定义颜色 |
| **Circle** | 环形进度条 | 圆形进度、渐变色 |
| **Loadmore** | 加载更多 | 列表加载、完成状态 |
| **StatusTip** | 缺省提示 | 空状态、网络错误 |
| **Tooltip** | 文字提示 | 气泡提示、多方向 |
| **Popover** | 气泡 | 菜单气泡、自定义内容 |
| **DropMenu** | 下拉菜单 | 筛选菜单、多选 |
| **FloatingPanel** | 浮动面板 | 底部面板、可拖动 |
| **SwipeAction** | 滑动操作 | 滑动删除、多按钮 |
| **SortButton** | 排序按钮 | 排序切换、状态指示 |
| **NoticeBar** | 通知栏 | 滚动通知、可关闭 |
| **CountDown** | 倒计时 | 限时活动、自定义格式 |
| **CountTo** | 数字滚动 | 数字动画、缓动效果 |
| **Keyboard** | 虚拟键盘 | 自定义键盘布局 |
| **NumberKeyboard** | 数字键盘 | 数字输入、身份证 |
| **Fab** | 悬浮按钮 | 快捷操作、展开菜单 |

## 组合式 API

组件库提供了丰富的组合式 API，支持命令式调用。

### useToast - 轻提示

提供轻量级的消息提示功能，支持多实例队列管理。

```typescript
import { useToast } from '@/wd'

const toast = useToast()

// 基础用法
toast.show('这是一条提示')
toast.show({ msg: '带配置的提示', duration: 3000 })

// 快捷方法
toast.success('操作成功')
toast.error('操作失败')
toast.warning('请注意')
toast.info('提示信息')

// 加载提示
toast.loading('加载中...')

// 关闭提示
toast.close()
```

**配置选项**:

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `msg` | 提示消息 | `string` | - |
| `duration` | 显示时长(ms) | `number` | `2000` |
| `iconName` | 图标名称 | `string` | - |
| `position` | 显示位置 | `'middle-top' \| 'middle' \| 'middle-bottom'` | `'middle-top'` |
| `cover` | 是否显示遮罩 | `boolean` | `false` |
| `zIndex` | 层级 | `number` | `1000` |

**多实例使用**:

```typescript
// 支持同时显示多个 Toast
const toast1 = useToast('#toast1')
const toast2 = useToast('#toast2')

toast1.success('第一个提示')
toast2.warning('第二个提示')
```

### useMessage - 消息弹框

提供对话框功能，支持确认、取消、输入等交互。

```typescript
import { useMessage } from '@/wd'

const message = useMessage()

// 警告弹框
message.alert({
  title: '提示',
  msg: '这是一条警告消息'
})

// 确认弹框
const result = await message.confirm({
  title: '确认删除',
  msg: '删除后无法恢复，确定要删除吗？'
})

if (result.action === 'confirm') {
  console.log('用户点击了确认')
} else {
  console.log('用户点击了取消')
}

// 输入弹框
const inputResult = await message.prompt({
  title: '请输入',
  msg: '请输入您的姓名',
  inputPlaceholder: '姓名',
  inputPattern: /^[\u4e00-\u9fa5]{2,10}$/,
  inputError: '请输入2-10个中文字符'
})

if (inputResult.action === 'confirm') {
  console.log('用户输入:', inputResult.value)
}
```

**配置选项**:

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题 | `string` | - |
| `msg` | 消息内容 | `string` | - |
| `type` | 弹框类型 | `'alert' \| 'confirm' \| 'prompt'` | `'alert'` |
| `showCancelButton` | 显示取消按钮 | `boolean` | `false` |
| `confirmButtonText` | 确认按钮文案 | `string` | `'确定'` |
| `cancelButtonText` | 取消按钮文案 | `string` | `'取消'` |
| `closeOnClickModal` | 点击遮罩关闭 | `boolean` | `true` |
| `inputType` | 输入框类型 | `'text' \| 'password' \| 'number'` | `'text'` |
| `inputValue` | 输入框初始值 | `string \| number` | `''` |
| `inputPlaceholder` | 输入框占位符 | `string` | - |
| `inputPattern` | 输入校验正则 | `RegExp` | - |
| `inputValidate` | 输入校验函数 | `(value: string) => boolean` | - |
| `inputError` | 校验错误提示 | `string` | - |
| `beforeConfirm` | 确认前钩子 | `(options) => void` | - |

### useNotify - 消息通知

提供顶部通知功能，支持多种类型。

```typescript
import { useNotify } from '@/wd'

const notify = useNotify()

// 基础用法
notify.show('这是一条通知')

// 不同类型
notify.primary('主要通知')
notify.success('成功通知')
notify.warning('警告通知')
notify.danger('危险通知')

// 自定义配置
notify.show({
  message: '自定义通知',
  type: 'success',
  duration: 3000,
  color: '#fff',
  background: '#07c160'
})
```

## 工具函数库

组件库提供了丰富的工具函数，位于 `src/wd/components/common/util.ts`。

### 类型检查

```typescript
import { CommonUtil } from '@/wd'

// 检查是否不为 null 或 undefined
CommonUtil.isDef(value) // boolean

// 检查是否为对象
CommonUtil.isObj(value) // boolean

// 检查是否为数组
CommonUtil.isArray(value) // boolean

// 检查是否为字符串
CommonUtil.isString(value) // boolean

// 检查是否为数字
CommonUtil.isNumber(value) // boolean

// 检查是否为函数
CommonUtil.isFunction(value) // boolean

// 检查是否为布尔值
CommonUtil.isBoolean(value) // boolean

// 检查是否为 Promise
CommonUtil.isPromise(value) // boolean

// 检查是否为日期
CommonUtil.isDate(value) // boolean

// 获取类型字符串
CommonUtil.getType(value) // 'string' | 'number' | 'array' | ...
```

### 对象操作

```typescript
import { CommonUtil } from '@/wd'

// 深拷贝
const cloned = CommonUtil.deepClone(obj)

// 深度合并
const merged = CommonUtil.deepMerge(target, source)

// 深度比较
const isEqual = CommonUtil.isEqual(value1, value2)

// 根据路径获取属性值
const value = CommonUtil.getPropByPath(obj, 'a.b.c')

// 判断对象是否有字段
CommonUtil.hasFields(obj) // boolean

// 判断是否为空对象
CommonUtil.isEmptyObj(obj) // boolean

// 剔除对象属性
const filtered = CommonUtil.omitBy(obj, (value, key) => key.startsWith('_'))
```

### 字符串处理

```typescript
import { CommonUtil } from '@/wd'

// 生成 UUID
const id = CommonUtil.uuid() // 32位唯一字符串

// 添加单位
CommonUtil.addUnit(10) // '10rpx'
CommonUtil.addUnit(10, 'px') // '10px'
CommonUtil.addUnit('auto') // 'auto'

// 数字补零
CommonUtil.padZero(5) // '05'
CommonUtil.padZero(5, 3) // '005'

// 驼峰转短横线
CommonUtil.kebabCase('backgroundColor') // 'background-color'

// 短横线转驼峰
CommonUtil.camelCase('background-color') // 'backgroundColor'
```

### 单位转换

```typescript
import { CommonUtil } from '@/wd'

// rpx 转 px（基于 750 设计稿）
const px = CommonUtil.rpxToPx(100) // 在 375 宽度设备上返回 50

// px 转 rpx
const rpx = CommonUtil.pxToRpx(50) // 在 375 宽度设备上返回 100
```

### 异步控制

```typescript
import { CommonUtil } from '@/wd'

// 防抖函数
const debouncedSearch = CommonUtil.debounce((keyword: string) => {
  console.log('搜索:', keyword)
}, 300)

// 节流函数
const throttledScroll = CommonUtil.throttle(() => {
  console.log('滚动事件')
}, 100)

// 暂停指定时间
await CommonUtil.pause(1000) // 暂停 1 秒

// 请求动画帧
await CommonUtil.requestAnimationFrame(() => {
  console.log('动画帧回调')
})
```

### 样式处理

```typescript
import { CommonUtil } from '@/wd'

// 对象转样式字符串
const style = CommonUtil.objToStyle({
  color: 'red',
  fontSize: '14px',
  backgroundColor: '#fff'
})
// 'color:red;font-size:14px;background-color:#fff;'

// RGB 转十六进制
CommonUtil.rgbToHex(255, 100, 50) // '#ff6432'

// 十六进制转 RGB
CommonUtil.hexToRgb('#ff6432') // [255, 100, 50]

// 生成渐变色数组
CommonUtil.gradient('#ff0000', '#0000ff', 5)
// ['#ff0000', '#cc0033', '#990066', '#660099', '#3300cc']
```

### DOM 操作

```typescript
import { CommonUtil } from '@/wd'

// 获取节点信息
const rect = await CommonUtil.getRect('.my-element', false)
console.log(rect.width, rect.height, rect.top, rect.left)

// 获取所有匹配节点
const rects = await CommonUtil.getRect('.items', true)
rects.forEach(rect => console.log(rect))
```

## 日期处理

组件库集成了 dayjs 库，提供强大的日期处理能力。

```typescript
import { dayjs } from '@/wd'

// 创建日期
const now = dayjs()
const date = dayjs('2024-01-15')

// 格式化
dayjs().format('YYYY-MM-DD') // '2024-01-15'
dayjs().format('YYYY年MM月DD日 HH:mm:ss') // '2024年01月15日 10:30:00'

// 操作
dayjs().add(1, 'day').format('YYYY-MM-DD')
dayjs().subtract(1, 'month').format('YYYY-MM-DD')
dayjs().startOf('month').format('YYYY-MM-DD')
dayjs().endOf('month').format('YYYY-MM-DD')

// 比较
dayjs('2024-01-15').isBefore('2024-01-20') // true
dayjs('2024-01-15').isAfter('2024-01-10') // true
dayjs('2024-01-15').isSame('2024-01-15', 'day') // true

// 相对时间
dayjs('2024-01-15').fromNow() // '2天前'
dayjs().to('2024-12-31') // '11个月后'
```

## 安装配置

### 1. 自动按需引入配置

项目已配置自动按需引入，无需手动导入组件。

**vite/plugins/components.ts**:

```typescript
import Components from '@uni-helper/vite-plugin-uni-components'

export default () => {
  return Components({
    extensions: ['vue'],
    deep: true,
    directoryAsNamespace: false,
    dts: 'src/types/components.d.ts',
  })
}
```

### 2. 类型声明

TypeScript 类型自动生成在 `src/types/components.d.ts`，包含所有组件的类型定义和智能提示支持。

### 3. 组件导出配置

**src/wd/index.ts** 导出了所有可用的组合式 API 和类型：

```typescript
// 组合式 API
export { useToast } from './components/wd-toast/useToast'
export { useMessage } from './components/wd-message-box/useMessage'
export { useNotify } from './components/wd-notify/useNotify'

// 工具函数
export * as CommonUtil from './components/common/util'
export { dayjs } from './components/common/dayjs'

// 组合式函数
export { useQueue } from './components/composables/useQueue'
export { useTouch } from './components/composables/useTouch'
export { useUpload } from './components/composables/useUpload'

// 国际化
export * from './locale'

// 类型导出
export type { FormInstance } from './components/wd-form/wd-form.vue'
export type { PickerInstance } from './components/wd-picker/wd-picker.vue'
export type { CalendarInstance } from './components/wd-calendar/wd-calendar.vue'
// ... 更多类型
```

## 使用示例

### 项目实际示例：Tabbar 使用

**首页 Tabbar**:

```vue
<template>
  <scroll-view class="h-100vh" scroll-y>
    <!-- 支付宝端特殊处理：只保留 v-if，v-show 无效 -->
    <!-- #ifdef MP-ALIPAY -->
    <Home v-if="currentTab === 0 && tabs[0].loaded" />
    <Menu v-if="currentTab === 1 && tabs[1].loaded" />
    <My v-if="currentTab === 2 && tabs[2].loaded" />
    <!-- #endif -->

    <!-- 非支付宝端：用 v-show 提高性能 -->
    <!-- #ifndef MP-ALIPAY -->
    <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
    <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
    <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
    <!-- #endif -->

    <!-- Tabbar 组件 -->
    <wd-tabbar v-model="currentTab" :items="tabs" @change="handleTabChange" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useTabbarStore } from '@/stores/tabbar'

const tabbarStore = useTabbarStore()
const { currentTab, tabs } = storeToRefs(tabbarStore)

const handleTabChange = (index: number) => {
  tabbarStore.toTab(index)
}
</script>
```

### 表单提交完整示例

```vue
<template>
  <view class="form-page">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-cell-group title="基本信息">
        <wd-input
          v-model="formData.username"
          label="用户名"
          prop="username"
          placeholder="请输入用户名"
          clearable
        />
        <wd-input
          v-model="formData.nickname"
          label="昵称"
          prop="nickname"
          placeholder="请输入昵称"
        />
      </wd-cell-group>

      <wd-cell-group title="联系方式">
        <wd-input
          v-model="formData.phone"
          label="手机号"
          prop="phone"
          type="number"
          placeholder="请输入手机号"
        />
        <wd-input
          v-model="formData.email"
          label="邮箱"
          prop="email"
          placeholder="请输入邮箱"
        />
      </wd-cell-group>

      <wd-cell-group title="其他信息">
        <wd-picker
          v-model="formData.gender"
          label="性别"
          prop="gender"
          :columns="genderOptions"
          placeholder="请选择性别"
        />
        <wd-datetime-picker
          v-model="formData.birthday"
          label="生日"
          prop="birthday"
          type="date"
          placeholder="请选择生日"
        />
        <wd-textarea
          v-model="formData.remark"
          label="备注"
          prop="remark"
          placeholder="请输入备注信息"
          :maxlength="200"
          show-word-limit
        />
      </wd-cell-group>
    </wd-form>

    <view class="form-footer">
      <wd-button type="primary" block :loading="submitting" @click="handleSubmit">
        提交
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance } from '@/wd'
import { useToast, useMessage } from '@/wd'

const toast = useToast()
const message = useMessage()
const formRef = ref<FormInstance | null>(null)
const submitting = ref(false)

const formData = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: '',
  birthday: '',
  remark: '',
})

const genderOptions = ['男', '女', '保密']

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 2, max: 20, message: '用户名长度在2-20个字符' },
  ],
  nickname: [
    { required: true, message: '请输入昵称' },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
  ],
  email: [
    { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '请输入正确的邮箱' },
  ],
  gender: [
    { required: true, message: '请选择性别' },
  ],
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    const result = await message.confirm({
      title: '确认提交',
      msg: '确定要提交表单吗？',
    })

    if (result.action !== 'confirm') return

    submitting.value = true
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('提交成功')
  } catch (error) {
    toast.error('请检查表单')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-page {
  padding-bottom: 120rpx;
}

.form-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
```

## 平台差异处理

### 支付宝小程序特殊处理

支付宝小程序不支持 v-show，需使用 v-if：

```vue
<template>
  <!-- #ifdef MP-ALIPAY -->
  <wd-popup v-if="visible" position="bottom">
    <view>支付宝小程序专用</view>
  </wd-popup>
  <!-- #endif -->

  <!-- #ifndef MP-ALIPAY -->
  <wd-popup v-show="visible" position="bottom">
    <view>其他平台</view>
  </wd-popup>
  <!-- #endif -->
</template>
```

### 条件编译

某些组件在不同平台表现不同，需使用条件编译：

```vue
<template>
  <!-- H5 端使用原生滚动 -->
  <!-- #ifdef H5 -->
  <scroll-view scroll-y>
    <wd-cell v-for="item in list" :key="item.id" :title="item.title" />
  </scroll-view>
  <!-- #endif -->

  <!-- 小程序端使用分页加载组件 -->
  <!-- #ifdef MP -->
  <wd-paging :loading="loading" :finished="finished" @load="loadMore">
    <wd-cell v-for="item in list" :key="item.id" :title="item.title" />
  </wd-paging>
  <!-- #endif -->
</template>
```

## 性能优化

### 1. 按需加载

项目已配置自动按需引入，只打包使用的组件：

```typescript
// vite/plugins/components.ts
Components({
  extensions: ['vue'],
  deep: true,
  dts: 'src/types/components.d.ts',
})
```

### 2. 懒加载

使用 v-if 和 v-show 结合实现懒加载：

```vue
<template>
  <!-- 首次加载用 v-if，切换用 v-show -->
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
  <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
  <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
</template>

<script lang="ts" setup>
const handleTabChange = (index: number) => {
  // 首次切换时标记为已加载
  if (!tabs.value[index].loaded) {
    tabs.value[index].loaded = true
  }
}
</script>
```

### 3. 虚拟列表

对于长列表使用虚拟滚动：

```vue
<template>
  <wd-paging
    :loading="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="loadMore"
  >
    <wd-cell
      v-for="item in list"
      :key="item.id"
      :title="item.title"
      :label="item.description"
    />
  </wd-paging>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const loadMore = async () => {
  if (loading.value || finished.value) return

  loading.value = true
  try {
    const newData = await fetchData(page.value)
    list.value.push(...newData)
    page.value++

    if (newData.length < 20) {
      finished.value = true
    }
  } finally {
    loading.value = false
  }
}
</script>
```

### 4. 防抖节流

使用工具函数优化高频操作：

```typescript
import { CommonUtil } from '@/wd'

// 搜索防抖
const handleSearch = CommonUtil.debounce((keyword: string) => {
  searchApi(keyword)
}, 300)

// 滚动节流
const handleScroll = CommonUtil.throttle(() => {
  updateScrollPosition()
}, 100)
```

## 常见问题

### 1. 组件样式不生效？

**原因**：样式作用域或优先级问题

**解决方案**：

```vue
<!-- 使用 :deep() 穿透 scoped 样式 -->
<style lang="scss" scoped>
:deep(.wd-button) {
  --wot-button-height: 100rpx;
}

:deep(.wd-input) {
  --wot-input-cell-padding: 20rpx;
}
</style>
```

### 2. TypeScript 类型提示不生效？

**解决方案**：

1. 确保已生成类型文件 `src/types/components.d.ts`
2. 重启 VSCode 或 IDE
3. 清除缓存重新编译

```bash
# 清除缓存重新编译
rm -rf node_modules/.vite
pnpm dev:h5
```

### 3. 组件自动引入失败？

**解决方案**：

1. 检查 `vite/plugins/components.ts` 配置
2. 确保组件名称正确（以 `wd-` 开头）
3. 清除缓存重新编译

### 4. 小程序端组件显示异常？

**解决方案**：

1. 检查是否使用了平台不支持的特性
2. 使用条件编译处理平台差异
3. 查看官方文档的平台兼容性说明

### 5. Toast/Message 不显示？

**原因**：组件实例未正确初始化

**解决方案**：

```vue
<template>
  <view>
    <!-- 确保在模板中放置组件 -->
    <wd-toast />
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useToast, useMessage } from '@/wd'

const toast = useToast()
const message = useMessage()

// 现在可以正常使用
toast.success('成功')
</script>
```

### 6. 表单校验不触发？

**原因**：prop 属性未设置或 rules 未定义

**解决方案**：

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <!-- 必须设置 prop 属性 -->
    <wd-input
      v-model="formData.username"
      prop="username"
      label="用户名"
    />
  </wd-form>
</template>

<script lang="ts" setup>
const formData = reactive({ username: '' })

// 必须定义对应的规则
const rules = {
  username: [{ required: true, message: '请输入用户名' }]
}
</script>
```

### 7. 国际化切换后组件文本未更新？

**解决方案**：

```typescript
import Locale, { useCurrentLang } from '@/wd'
import { watch } from 'vue'

const currentLang = useCurrentLang()

// 监听语言变化，强制刷新组件
watch(currentLang, () => {
  // 触发页面重新渲染
  uni.$emit('languageChanged')
})
```

### 8. 主题变量在小程序中不生效？

**原因**：CSS 变量作用域问题

**解决方案**：

```scss
/* 在 uni.scss 中定义全局变量 */
page {
  --wot-color-theme: #0957DE;
}

/* 或使用 ConfigProvider 组件包裹 */
```

## 最佳实践

### 1. 统一使用组合式 API

```typescript
// ✅ 推荐：使用组合式 API
import { useToast, useMessage } from '@/wd'

const toast = useToast()
const message = useMessage()

toast.success('成功')
await message.confirm({ title: '确认', msg: '确定吗？' })

// ❌ 不推荐：使用 uni 原生方法
uni.showToast({ title: '成功' })
uni.showModal({ title: '确认', content: '确定吗？' })
```

### 2. 合理使用组件

```vue
<!-- ✅ 推荐：使用专用组件 -->
<wd-button type="primary" @click="submit">提交</wd-button>
<wd-input v-model="value" placeholder="请输入" />

<!-- ❌ 不推荐：使用 view 模拟 -->
<view class="custom-button" @click="submit">提交</view>
<input class="custom-input" v-model="value" />
```

### 3. 主题统一管理

```typescript
// src/config/theme.ts
import type { ConfigProviderThemeVars } from '@/wd'

export const lightTheme: ConfigProviderThemeVars = {
  colorTheme: '#0957DE',
  colorSuccess: '#4cd964',
  colorWarning: '#f0ad4e',
  colorDanger: '#dd524d',
}

export const darkTheme: ConfigProviderThemeVars = {
  colorTheme: '#409eff',
  colorSuccess: '#67c23a',
  colorWarning: '#e6a23c',
  colorDanger: '#f56c6c',
}
```

### 4. 表单统一封装

```typescript
// composables/useFormRules.ts
export const useFormRules = () => {
  const required = (message: string) => ({ required: true, message })

  const phone = [
    required('请输入手机号'),
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ]

  const email = [
    { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '请输入正确的邮箱' }
  ]

  const password = [
    required('请输入密码'),
    { min: 6, max: 20, message: '密码长度在6-20个字符' }
  ]

  return { required, phone, email, password }
}
```

## 官方资源

### 文档地址

- **官方文档**：https://wot-design-uni.netlify.app
- **GitHub**：https://github.com/Moonofweisheng/wot-design-uni
- **Gitee**：https://gitee.com/wot-design-uni/wot-design-uni

### 在线示例

- **H5 演示**：https://wot-design-uni.netlify.app/demo.html
- **微信小程序**：搜索"Wot Design Uni"体验

### 社区支持

- **Issues**：https://github.com/Moonofweisheng/wot-design-uni/issues
- **讨论区**：https://github.com/Moonofweisheng/wot-design-uni/discussions

## 版本更新

### 当前版本：1.5.13

**主要更新**：

- 🎉 新增鸿蒙 App 支持
- ✨ 优化 TypeScript 类型定义
- 🐛 修复已知问题
- 📝 完善文档示例

### 升级指南

```bash
# 查看最新版本
pnpm outdated wot-design-uni

# 升级到最新版本
pnpm update wot-design-uni

# 升级后清除缓存
rm -rf node_modules/.vite
pnpm dev:h5
```
