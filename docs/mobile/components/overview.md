# 组件系统概览

## 介绍

RuoYi-Plus-UniApp 移动端提供了完整的组件系统，由 **WD UI 组件库**和**自定义业务组件**两大部分组成。WD UI 基于 Wot Design Uni 深度定制，使用 Vue 3 + TypeScript + Composition API 构建，提供 90+ 个高质量组件，覆盖移动端开发的全部场景。

组件系统采用模块化设计，每个组件独立维护，支持按需引入和 Tree Shaking。通过 easycom 机制实现自动注册，开发者无需手动导入即可直接使用。所有组件均提供完整的 TypeScript 类型定义，确保开发时的类型安全和智能提示。

**核心特性**:

- **组件丰富** - 90+ 个组件，覆盖基础、布局、导航、表单、展示、反馈全场景
- **类型安全** - 完整的 TypeScript 类型定义，Props/Events/Slots 均有类型支持
- **统一规范** - 组件命名、Props、Events、Slots 遵循统一设计规范
- **主题定制** - 支持 CSS 变量自定义样式，内置 15 种语言国际化
- **跨平台兼容** - 支持微信小程序、H5、App、支付宝小程序等多平台
- **组合式 API** - 提供 useToast、useMessage、useNotify 等组合式函数
- **工具函数库** - 内置 CommonUtil 通用工具函数，包含 60+ 个实用函数

## 架构设计

### 整体架构

```text
┌─────────────────────────────────────────────────────────────┐
│                        应用层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Pages     │  │  Components │  │   Layouts   │          │
│  │   页面组件   │  │  业务组件   │  │   布局组件   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      WD UI 组件层                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │  基础   │ │  布局   │ │  导航   │ │  表单   │ │  反馈  │ │
│  │ Button  │ │  Grid   │ │  Tabs   │ │  Input  │ │  Toast │ │
│  │  Icon   │ │  Cell   │ │ Navbar  │ │  Form   │ │  Modal │ │
│  │  Text   │ │  Row    │ │ Tabbar  │ │ Picker  │ │  Popup │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      组合式函数层                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ useToast │ │useMessage│ │ useNotify│ │ useTouch │        │
│  │ useQueue │ │ useUpload│ │useCurrentLang│             │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────────────────┤
│                      工具函数层                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  CommonUtil: 类型检查、对象操作、字符串处理、      │       │
│  │             单位转换、异步控制、样式处理           │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  dayjs: 日期时间处理库                            │       │
│  └──────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                      国际化层                                │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Locale: zh-CN, en-US, ja-JP, ko-KR 等 15 种语言  │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```text
src/
├── wd/                          # WD UI 组件库
│   ├── components/              # 组件实现
│   │   ├── common/              # 公共工具模块
│   │   │   ├── util.ts          # 通用工具函数 (60+)
│   │   │   ├── dayjs.ts         # 日期时间处理
│   │   │   ├── clickoutside.ts  # 点击外部关闭
│   │   │   └── AbortablePromise.ts # 可中止Promise
│   │   ├── composables/         # 组合式函数
│   │   │   ├── useQueue.ts      # 队列管理
│   │   │   ├── useTouch.ts      # 触摸事件处理
│   │   │   └── useUpload.ts     # 文件上传
│   │   ├── wd-button/           # 按钮组件
│   │   ├── wd-icon/             # 图标组件
│   │   ├── wd-input/            # 输入框组件
│   │   ├── wd-form/             # 表单组件
│   │   ├── wd-toast/            # 轻提示组件
│   │   │   ├── wd-toast.vue     # 组件实现
│   │   │   └── useToast.ts      # 组合式函数
│   │   ├── wd-message-box/      # 消息弹窗
│   │   │   ├── wd-message-box.vue
│   │   │   └── useMessage.ts
│   │   ├── wd-notify/           # 通知组件
│   │   │   ├── wd-notify.vue
│   │   │   └── useNotify.ts
│   │   └── ...                  # 其他 90+ 组件
│   ├── locale/                  # 国际化语言包
│   │   ├── index.ts             # 语言管理入口
│   │   └── lang/                # 语言文件
│   │       ├── zh-CN.ts         # 简体中文
│   │       ├── zh-TW.ts         # 繁体中文(台湾)
│   │       ├── zh-HK.ts         # 繁体中文(香港)
│   │       ├── en-US.ts         # 英语
│   │       ├── ja-JP.ts         # 日语
│   │       ├── ko-KR.ts         # 韩语
│   │       ├── fr-FR.ts         # 法语
│   │       ├── de-DE.ts         # 德语
│   │       ├── es-ES.ts         # 西班牙语
│   │       ├── pt-PT.ts         # 葡萄牙语
│   │       ├── ru-RU.ts         # 俄语
│   │       ├── ar-SA.ts         # 阿拉伯语
│   │       ├── th-TH.ts         # 泰语
│   │       ├── vi-VN.ts         # 越南语
│   │       └── tr-TR.ts         # 土耳其语
│   └── index.ts                 # 统一导出入口
├── components/                   # 自定义业务组件
│   ├── auth/                    # 认证组件
│   │   └── AuthModal.vue        # 授权弹窗
│   └── tabbar/                  # 标签栏组件
│       ├── Home.vue             # 首页标签
│       ├── Menu.vue             # 菜单标签
│       └── My.vue               # 我的标签
└── pages/                        # 页面组件
```

## 组件分类

### 基础组件 (6个)

基础组件提供最基本的 UI 元素，是构建复杂界面的基石。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Button | 按钮 | 触发操作、提交表单、导航跳转 |
| Icon | 图标 | 展示图标、装饰元素、状态指示 |
| Text | 文本 | 格式化文本展示、文本截断、链接 |
| Transition | 过渡动画 | 元素进入/离开动画效果 |
| Resize | 尺寸监听 | 监听元素尺寸变化、响应式布局 |
| ConfigProvider | 全局配置 | 配置默认属性、主题变量、国际化 |

**基础组件使用示例**:

```vue
<template>
  <view class="demo">
    <!-- 按钮 -->
    <wd-button type="primary" size="large" @click="handleClick">
      <wd-icon name="check" />
      确认提交
    </wd-button>

    <!-- 文本 -->
    <wd-text
      text="这是一段很长的文本内容，超出会自动截断..."
      :lines="2"
      mode="text"
    />

    <!-- 过渡动画 -->
    <wd-transition :show="visible" name="fade">
      <view class="content">动画内容</view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
const handleClick = () => {
  visible.value = !visible.value
}
</script>
```

### 布局组件 (7个)

布局组件用于页面结构的组织和元素的排列。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Layout | 布局容器 | Row/Col 栅格布局系统 |
| Row | 行容器 | 栅格布局行，配合 Col 使用 |
| Col | 列容器 | 栅格布局列，支持响应式 |
| Grid | 宫格 | 图标导航、功能入口、九宫格布局 |
| Cell | 单元格 | 列表项展示、设置项、导航链接 |
| CellGroup | 单元格组 | 单元格分组、带标题的列表 |
| Divider | 分割线 | 内容分隔、视觉分割 |
| Space | 间距 | 元素间距管理、flex 布局 |
| Gap | 间隙 | 固定高度间隙 |

**布局组件使用示例**:

```vue
<template>
  <view class="demo">
    <!-- 栅格布局 -->
    <wd-row gutter="20">
      <wd-col :span="12">
        <view class="col-content">左侧</view>
      </wd-col>
      <wd-col :span="12">
        <view class="col-content">右侧</view>
      </wd-col>
    </wd-row>

    <!-- 宫格布局 -->
    <wd-grid :column="4" border>
      <wd-grid-item
        v-for="item in gridItems"
        :key="item.id"
        :icon="item.icon"
        :text="item.text"
        @click="handleGridClick(item)"
      />
    </wd-grid>

    <!-- 单元格列表 -->
    <wd-cell-group title="设置">
      <wd-cell title="个人信息" is-link to="/pages/profile/index" />
      <wd-cell title="账户安全" is-link to="/pages/security/index" />
      <wd-cell title="通知设置" is-link>
        <wd-switch v-model="notifyEnabled" />
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const notifyEnabled = ref(true)
const gridItems = [
  { id: 1, icon: 'scan', text: '扫一扫' },
  { id: 2, icon: 'photo', text: '相册' },
  { id: 3, icon: 'location', text: '位置' },
  { id: 4, icon: 'more', text: '更多' },
]

const handleGridClick = (item: any) => {
  console.log('点击:', item.text)
}
</script>
```

### 导航组件 (13个)

导航组件用于页面间的切换和内容区域的导航。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Navbar | 导航栏 | 页面顶部导航、标题栏 |
| NavbarCapsule | 胶囊导航栏 | 小程序胶囊按钮适配 |
| Tabbar | 标签栏 | 底部导航切换、主要入口 |
| TabbarItem | 标签栏项 | 单个标签栏项目 |
| Tabs | 标签页 | 内容分类切换、选项卡 |
| Tab | 标签页项 | 单个标签页内容 |
| Sidebar | 侧边导航 | 侧边分类导航、商品分类 |
| SidebarItem | 侧边导航项 | 单个侧边导航项 |
| IndexBar | 索引栏 | 列表索引、通讯录 |
| IndexAnchor | 索引锚点 | 索引锚点标记 |
| Steps | 步骤条 | 流程进度展示、订单状态 |
| Step | 步骤项 | 单个步骤项 |
| Pagination | 分页 | 数据分页、翻页控制 |
| Sticky | 粘性布局 | 固定元素定位、吸顶效果 |
| StickyBox | 粘性容器 | 粘性布局容器 |
| Backtop | 回到顶部 | 快速返回页面顶部 |
| DropMenu | 下拉菜单 | 筛选条件选择、排序 |
| DropMenuItem | 下拉菜单项 | 单个下拉菜单项 |
| Segmented | 分段器 | 分段选择、视图切换 |

**导航组件使用示例**:

```vue
<template>
  <view class="demo">
    <!-- 自定义导航栏 -->
    <wd-navbar
      title="商品详情"
      left-arrow
      @click-left="handleBack"
    >
      <template #right>
        <wd-icon name="share" @click="handleShare" />
      </template>
    </wd-navbar>

    <!-- 标签页 -->
    <wd-tabs v-model="activeTab">
      <wd-tab title="全部" name="all">
        <view class="tab-content">全部内容</view>
      </wd-tab>
      <wd-tab title="待付款" name="pending" :badge="3">
        <view class="tab-content">待付款订单</view>
      </wd-tab>
      <wd-tab title="已完成" name="completed">
        <view class="tab-content">已完成订单</view>
      </wd-tab>
    </wd-tabs>

    <!-- 步骤条 -->
    <wd-steps :active="currentStep">
      <wd-step title="下单" description="2024-01-01" />
      <wd-step title="付款" description="2024-01-02" />
      <wd-step title="发货" description="2024-01-03" />
      <wd-step title="收货" />
    </wd-steps>

    <!-- 下拉筛选菜单 -->
    <wd-drop-menu>
      <wd-drop-menu-item v-model="sortValue" :options="sortOptions" />
      <wd-drop-menu-item v-model="filterValue" :options="filterOptions" />
    </wd-drop-menu>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('all')
const currentStep = ref(2)
const sortValue = ref('default')
const filterValue = ref('all')

const sortOptions = [
  { label: '默认排序', value: 'default' },
  { label: '价格升序', value: 'price-asc' },
  { label: '价格降序', value: 'price-desc' },
]

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '有货', value: 'in-stock' },
  { label: '促销', value: 'promotion' },
]

const handleBack = () => uni.navigateBack()
const handleShare = () => console.log('分享')
</script>
```

### 表单组件 (22个)

表单组件用于数据采集和用户输入。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Form | 表单 | 表单容器、校验管理 |
| FormItem | 表单项 | 单个表单项容器 |
| Input | 输入框 | 单行文本输入 |
| Textarea | 文本域 | 多行文本输入 |
| Radio | 单选框 | 单选选择 |
| RadioGroup | 单选框组 | 单选框分组管理 |
| Checkbox | 复选框 | 多选选择 |
| CheckboxGroup | 复选框组 | 复选框分组管理 |
| Switch | 开关 | 开关状态切换 |
| Rate | 评分 | 星级评分、满意度 |
| Slider | 滑块 | 数值范围选择 |
| Stepper | 步进器 | 数值增减、购物车数量 |
| Picker | 选择器 | 单列/多列选择 |
| PickerView | 选择器视图 | 内嵌选择器 |
| DatetimePicker | 时间选择 | 日期时间选择 |
| DatetimePickerView | 时间选择视图 | 内嵌时间选择器 |
| Calendar | 日历 | 日期范围选择 |
| CalendarView | 日历视图 | 内嵌日历 |
| ColPicker | 级联选择器 | 省市区、多级联动 |
| SelectPicker | 选择选择器 | 下拉选择 |
| Upload | 上传 | 文件/图片上传 |
| Search | 搜索 | 搜索输入框 |
| NumberKeyboard | 数字键盘 | 数字输入 |
| PasswordInput | 密码输入 | 密码/验证码输入 |
| Signature | 签名 | 电子签名 |
| Keyboard | 键盘 | 自定义键盘 |
| VoiceRecorder | 录音器 | 语音录制 |

**表单组件使用示例**:

```vue
<template>
  <wd-form ref="formRef" :model="form" :rules="rules">
    <!-- 文本输入 -->
    <wd-input
      v-model="form.username"
      label="用户名"
      prop="username"
      placeholder="请输入用户名"
      clearable
    />

    <!-- 密码输入 -->
    <wd-input
      v-model="form.password"
      label="密码"
      prop="password"
      type="password"
      placeholder="请输入密码"
      show-password
    />

    <!-- 手机号输入 -->
    <wd-input
      v-model="form.phone"
      label="手机号"
      prop="phone"
      type="number"
      maxlength="11"
      placeholder="请输入手机号"
    />

    <!-- 单选 -->
    <wd-cell title="性别" prop="gender">
      <wd-radio-group v-model="form.gender">
        <wd-radio value="male">男</wd-radio>
        <wd-radio value="female">女</wd-radio>
      </wd-radio-group>
    </wd-cell>

    <!-- 多选 -->
    <wd-cell title="爱好" prop="hobbies">
      <wd-checkbox-group v-model="form.hobbies">
        <wd-checkbox value="reading">阅读</wd-checkbox>
        <wd-checkbox value="sports">运动</wd-checkbox>
        <wd-checkbox value="music">音乐</wd-checkbox>
      </wd-checkbox-group>
    </wd-cell>

    <!-- 日期选择 -->
    <wd-datetime-picker
      v-model="form.birthday"
      label="生日"
      prop="birthday"
      type="date"
      placeholder="请选择生日"
    />

    <!-- 省市区选择 -->
    <wd-col-picker
      v-model="form.region"
      label="地区"
      prop="region"
      :columns="regionColumns"
      placeholder="请选择地区"
    />

    <!-- 图片上传 -->
    <wd-cell title="头像">
      <wd-upload
        v-model:file-list="form.avatar"
        :limit="1"
        accept="image"
        @success="handleUploadSuccess"
      />
    </wd-cell>

    <!-- 开关 -->
    <wd-cell title="接收通知">
      <wd-switch v-model="form.notify" />
    </wd-cell>

    <!-- 提交按钮 -->
    <view class="submit-btn">
      <wd-button type="primary" block @click="handleSubmit">
        提交
      </wd-button>
    </view>
  </wd-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  phone: '',
  gender: '',
  hobbies: [],
  birthday: '',
  region: [],
  avatar: [],
  notify: true,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
  gender: [{ required: true, message: '请选择性别' }],
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    console.log('表单数据:', form)
    // 提交逻辑
  } catch (error) {
    console.error('校验失败:', error)
  }
}

const handleUploadSuccess = (res: any) => {
  console.log('上传成功:', res)
}
</script>
```

### 展示组件 (18个)

展示组件用于信息的呈现和展示。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Tag | 标签 | 标签展示、状态标记 |
| Badge | 徽标 | 数字角标、消息提示 |
| Progress | 进度条 | 线性进度展示 |
| Circle | 环形进度 | 环形进度展示 |
| Image | 图片 | 图片展示、懒加载、预览 |
| Swiper | 轮播 | 图片轮播、Banner |
| SwiperNav | 轮播导航 | 轮播指示器 |
| Collapse | 折叠面板 | 内容折叠展开 |
| CollapseItem | 折叠面板项 | 单个折叠项 |
| NoticeBar | 通知栏 | 滚动通知、公告 |
| CountDown | 倒计时 | 倒计时展示、秒杀 |
| CountTo | 数字滚动 | 数字动态变化 |
| Card | 卡片 | 卡片容器 |
| Skeleton | 骨架屏 | 加载占位 |
| StatusTip | 状态提示 | 空态、错误提示 |
| Table | 表格 | 数据表格展示 |
| TableCol | 表格列 | 表格列定义 |
| Watermark | 水印 | 页面水印 |
| Curtain | 幕帘 | 弹出幕帘、广告 |
| RichText | 富文本 | 富文本内容渲染 |
| VideoPreview | 视频预览 | 视频播放预览 |

**展示组件使用示例**:

```vue
<template>
  <view class="demo">
    <!-- 轮播图 -->
    <wd-swiper
      :list="bannerList"
      autoplay
      :interval="3000"
      indicator
      @click="handleBannerClick"
    />

    <!-- 标签和徽标 -->
    <view class="tags">
      <wd-tag type="primary">新品</wd-tag>
      <wd-tag type="success">热卖</wd-tag>
      <wd-badge :value="99" :max="99">
        <wd-icon name="bell" size="24" />
      </wd-badge>
    </view>

    <!-- 进度展示 -->
    <wd-progress :percentage="75" status="success" />
    <wd-circle :rate="75" text="75%" />

    <!-- 倒计时 -->
    <wd-count-down :time="3600000" format="HH:mm:ss">
      <template #default="{ hours, minutes, seconds }">
        <text class="countdown-item">{{ hours }}</text>
        <text class="countdown-colon">:</text>
        <text class="countdown-item">{{ minutes }}</text>
        <text class="countdown-colon">:</text>
        <text class="countdown-item">{{ seconds }}</text>
      </template>
    </wd-count-down>

    <!-- 折叠面板 -->
    <wd-collapse v-model="activeCollapse">
      <wd-collapse-item title="商品详情" name="detail">
        <view class="collapse-content">商品详情内容...</view>
      </wd-collapse-item>
      <wd-collapse-item title="规格参数" name="spec">
        <view class="collapse-content">规格参数内容...</view>
      </wd-collapse-item>
    </wd-collapse>

    <!-- 通知栏 -->
    <wd-notice-bar
      text="这是一条滚动通知消息..."
      left-icon="volume"
      scrollable
    />

    <!-- 骨架屏 -->
    <wd-skeleton v-if="loading" :row="3" avatar />
    <view v-else class="content">实际内容</view>

    <!-- 空状态 -->
    <wd-status-tip
      v-if="isEmpty"
      image="empty"
      tip="暂无数据"
    >
      <wd-button type="primary" size="small">去添加</wd-button>
    </wd-status-tip>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const bannerList = [
  { url: '/static/banner1.jpg' },
  { url: '/static/banner2.jpg' },
  { url: '/static/banner3.jpg' },
]

const activeCollapse = ref(['detail'])
const loading = ref(true)
const isEmpty = ref(false)

const handleBannerClick = (index: number) => {
  console.log('点击轮播图:', index)
}

// 模拟加载
setTimeout(() => {
  loading.value = false
}, 2000)
</script>
```

### 反馈组件 (24个)

反馈组件用于操作反馈和用户交互。

| 组件 | 说明 | 主要用途 |
|------|------|---------|
| Toast | 轻提示 | 操作结果提示、加载中 |
| Loading | 加载 | 加载状态展示 |
| Loadmore | 加载更多 | 列表加载更多 |
| MessageBox | 消息弹窗 | 确认、提示、输入弹窗 |
| ActionSheet | 动作面板 | 操作选项选择 |
| Popup | 弹出层 | 自定义弹出内容 |
| SwipeAction | 滑动操作 | 列表项滑动操作 |
| Notify | 通知 | 顶部通知消息 |
| Overlay | 遮罩层 | 遮罩背景 |
| Popover | 气泡 | 气泡提示框 |
| Tooltip | 文字提示 | 悬浮文字提示 |
| Fab | 浮动按钮 | 悬浮操作按钮 |
| FloatingPanel | 浮动面板 | 可拖拽浮动面板 |
| PullRefresh | 下拉刷新 | 列表下拉刷新 |
| Paging | 分页列表 | 分页数据列表 |
| SortButton | 排序按钮 | 排序切换按钮 |
| LanguageSelector | 语言选择器 | 国际化语言切换 |

**反馈组件使用示例**:

```vue
<template>
  <view class="demo">
    <!-- 弹出层 -->
    <wd-popup v-model="showPopup" position="bottom" round>
      <view class="popup-content">
        弹出层内容
      </view>
    </wd-popup>

    <!-- 动作面板 -->
    <wd-action-sheet
      v-model="showActionSheet"
      :actions="actions"
      @select="handleActionSelect"
    />

    <!-- 滑动操作 -->
    <wd-swipe-action>
      <wd-cell title="滑动我" value="查看更多" />
      <template #right>
        <view class="action-btn delete" @click="handleDelete">删除</view>
        <view class="action-btn edit" @click="handleEdit">编辑</view>
      </template>
    </wd-swipe-action>

    <!-- 气泡提示 -->
    <wd-popover v-model="showPopover" :content="popoverContent">
      <wd-button size="small">点击显示气泡</wd-button>
    </wd-popover>

    <!-- 浮动按钮 -->
    <wd-fab
      type="primary"
      :position="{ bottom: 100, right: 20 }"
      @click="handleFabClick"
    >
      <wd-icon name="add" />
    </wd-fab>

    <!-- 下拉刷新 -->
    <wd-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <view class="list">
        <wd-cell v-for="item in list" :key="item.id" :title="item.title" />
      </view>
    </wd-pull-refresh>

    <!-- 操作按钮 -->
    <view class="buttons">
      <wd-button @click="showToastSuccess">成功提示</wd-button>
      <wd-button @click="showToastError">错误提示</wd-button>
      <wd-button @click="showToastLoading">加载中</wd-button>
      <wd-button @click="showMessageConfirm">确认弹窗</wd-button>
      <wd-button @click="showNotify">顶部通知</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast, useMessage, useNotify } from '@/wd'

const toast = useToast()
const message = useMessage()
const notify = useNotify()

const showPopup = ref(false)
const showActionSheet = ref(false)
const showPopover = ref(false)
const refreshing = ref(false)
const popoverContent = '这是气泡提示内容'

const actions = [
  { name: '选项一' },
  { name: '选项二' },
  { name: '选项三', color: '#ee0a24' },
]

const list = ref([
  { id: 1, title: '列表项 1' },
  { id: 2, title: '列表项 2' },
  { id: 3, title: '列表项 3' },
])

// Toast 提示
const showToastSuccess = () => toast.success('操作成功')
const showToastError = () => toast.error('操作失败')
const showToastLoading = () => {
  toast.loading('加载中...')
  setTimeout(() => toast.close(), 2000)
}

// 确认弹窗
const showMessageConfirm = async () => {
  const result = await message.confirm({
    title: '提示',
    msg: '确定要执行此操作吗？',
  })
  if (result) {
    toast.success('已确认')
  }
}

// 顶部通知
const showNotify = () => {
  notify.success({ message: '操作成功' })
}

// 动作面板选择
const handleActionSelect = (action: any) => {
  toast.info(`选择了: ${action.name}`)
  showActionSheet.value = false
}

// 下拉刷新
const handleRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
    toast.success('刷新成功')
  }, 1500)
}

// 滑动操作
const handleDelete = () => toast.info('删除')
const handleEdit = () => toast.info('编辑')

// 浮动按钮
const handleFabClick = () => toast.info('点击了浮动按钮')
</script>
```

## 组件注册

### easycom 自动注册（推荐）

通过 easycom 机制自动全局注册，无需手动导入，这是推荐的使用方式：

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

配置后，所有 `wd-` 前缀的组件都会自动注册，可以直接在模板中使用：

```vue
<template>
  <!-- 直接使用，无需导入 -->
  <wd-button type="primary" @click="handleClick">按钮</wd-button>
  <wd-input v-model="value" placeholder="请输入" />
  <wd-cell title="标题" value="内容" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const handleClick = () => console.log('clicked')
</script>
```

### 手动导入

如果需要手动导入组件，可以从组件路径直接引入：

```vue
<script lang="ts" setup>
// 导入组件（通常不需要，easycom 会自动处理）
import WdButton from '@/wd/components/wd-button/wd-button.vue'
import WdInput from '@/wd/components/wd-input/wd-input.vue'
</script>
```

### 组件实例类型导入

从 `@/wd` 导入组件实例类型，用于 ref 引用：

```vue
<template>
  <wd-form ref="formRef" :model="form">
    <wd-input v-model="form.name" prop="name" />
  </wd-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

// 使用类型定义
const formRef = ref<FormInstance>()

const handleSubmit = async () => {
  // 调用表单方法
  await formRef.value?.validate()
}
</script>
```

**可导入的实例类型**：

```typescript
// 从 @/wd 导入的类型
import type {
  FormInstance,           // 表单实例
  CalendarInstance,       // 日历实例
  CalendarViewInstance,   // 日历视图实例
  CheckboxInstance,       // 复选框实例
  ColPickerInstance,      // 级联选择器实例
  CollapseInstance,       // 折叠面板实例
  CollapseItemInstance,   // 折叠面板项实例
  CountDownInstance,      // 倒计时实例
  CountToInstance,        // 数字滚动实例
  DatetimePickerInstance, // 时间选择器实例
  DatetimePickerViewInstance, // 时间选择器视图实例
  DropMenuItemInstance,   // 下拉菜单项实例
  FabInstance,            // 浮动按钮实例
  GridItemInstance,       // 宫格项实例
  ImgCropperInstance,     // 图片裁剪实例
  NoticeBarInstance,      // 通知栏实例
  PagingInstance,         // 分页列表实例
  PickerInstance,         // 选择器实例
  PickerViewInstance,     // 选择器视图实例
  PopoverInstance,        // 气泡实例
  SegmentedInstance,      // 分段器实例
  SelectPickerInstance,   // 选择选择器实例
  SignatureInstance,      // 签名实例
  SliderInstance,         // 滑块实例
  StickyInstance,         // 粘性布局实例
  SwipeActionInstance,    // 滑动操作实例
  TableColInstance,       // 表格列实例
  TabsInstance,           // 标签页实例
  TooltipInstance,        // 工具提示实例
  UploadInstance,         // 上传实例
  VideoPreviewInstance,   // 视频预览实例
  ConfigProviderThemeVars, // 主题变量类型
} from '@/wd'
```

## 组合式函数

WD UI 提供了多个组合式函数，用于以编程方式调用组件功能。

### useToast - 轻提示

```typescript
import { useToast } from '@/wd'

const toast = useToast()

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 警告提示
toast.warning('请注意')

// 普通提示
toast.info('提示信息')

// 加载中
toast.loading('加载中...')

// 关闭提示
toast.close()

// 自定义配置
toast.show({
  msg: '自定义提示',
  icon: 'success',
  duration: 3000,
  position: 'middle',
})
```

### useMessage - 消息弹窗

```typescript
import { useMessage } from '@/wd'

const message = useMessage()

// 确认弹窗
const confirmed = await message.confirm({
  title: '提示',
  msg: '确定要删除吗？',
})

// 提示弹窗
await message.alert({
  title: '提示',
  msg: '操作成功',
})

// 输入弹窗
const inputValue = await message.prompt({
  title: '请输入',
  msg: '请输入您的意见',
  inputPlaceholder: '请输入内容',
})

// 自定义弹窗
await message.show({
  title: '自定义弹窗',
  msg: '这是一个自定义弹窗',
  showCancelButton: true,
  confirmButtonText: '确定',
  cancelButtonText: '取消',
})
```

### useNotify - 通知

```typescript
import { useNotify } from '@/wd'

const notify = useNotify()

// 成功通知
notify.success({ message: '操作成功' })

// 警告通知
notify.warning({ message: '警告信息' })

// 错误通知
notify.danger({ message: '错误信息' })

// 普通通知
notify.primary({ message: '普通通知' })

// 自定义通知
notify.show({
  message: '自定义通知',
  type: 'success',
  duration: 3000,
  color: '#fff',
  background: '#07c160',
})

// 关闭通知
notify.close()
```

### useTouch - 触摸事件

```typescript
import { useTouch } from '@/wd'

const {
  touchStart,
  touchMove,
  direction,
  deltaX,
  deltaY,
  offsetX,
  offsetY,
  startX,
  startY,
} = useTouch()

// 在模板中使用
// <view @touchstart="touchStart" @touchmove="touchMove">
//   滑动方向: {{ direction }}
//   水平位移: {{ deltaX }}
//   垂直位移: {{ deltaY }}
// </view>
```

### useUpload - 文件上传

```typescript
import { useUpload } from '@/wd'

const upload = useUpload()

// 选择文件
const files = await upload.chooseFile({
  accept: 'image',
  maxCount: 9,
  sizeType: ['compressed'],
})

// 快速上传
upload.fastUpload(filePath, {
  onSuccess(res, file) {
    console.log('上传成功:', res.url)
  },
  onError(err, file) {
    console.log('上传失败:', err)
  },
  onProgress(progress, file) {
    console.log('上传进度:', progress)
  },
})
```

### useQueue - 队列管理

```typescript
import { useQueue } from '@/wd'

const queue = useQueue()

// 添加任务到队列
queue.add(async () => {
  // 异步任务
  await someAsyncTask()
})

// 队列会按顺序执行任务
```

## 工具函数库

WD UI 内置了丰富的工具函数，从 `@/wd` 导入 `CommonUtil` 使用。

### 类型检查函数

```typescript
import { CommonUtil } from '@/wd'

// 基础类型检查
CommonUtil.isDef(value)       // 判断是否不为 null 或 undefined
CommonUtil.isObj(value)       // 判断是否为对象
CommonUtil.isArray(value)     // 判断是否为数组
CommonUtil.isString(value)    // 判断是否为字符串
CommonUtil.isNumber(value)    // 判断是否为数值
CommonUtil.isFunction(value)  // 判断是否为函数
CommonUtil.isBoolean(value)   // 判断是否为布尔值
CommonUtil.isPromise(value)   // 判断是否为 Promise
CommonUtil.isDate(value)      // 判断是否为 Date 对象
CommonUtil.getType(value)     // 获取数据原始类型

// 扩展类型检查
CommonUtil.isUndefined(value)    // 判断是否为 undefined
CommonUtil.isNotUndefined(value) // 判断是否不为 undefined
CommonUtil.isOdd(value)          // 判断是否为奇数
CommonUtil.isBase64Image(url)    // 判断是否为 base64 图片
CommonUtil.isVideoUrl(url)       // 判断是否为视频 URL
CommonUtil.isImageUrl(url)       // 判断是否为图片 URL
```

### 对象操作函数

```typescript
import { CommonUtil } from '@/wd'

// 深拷贝
const cloned = CommonUtil.deepClone(obj)

// 深度比较
const isEqual = CommonUtil.isEqual(value1, value2)

// 深度合并（返回新对象）
const merged = CommonUtil.deepMerge(target, source)

// 深度合并（原地修改）
CommonUtil.deepAssign(target, source)

// 根据路径获取属性值
const value = CommonUtil.getPropByPath(obj, 'a.b.c')

// 判断对象是否有字段
CommonUtil.hasFields(obj)   // true/false
CommonUtil.isEmptyObj(obj)  // true/false

// 根据条件剔除属性
const filtered = CommonUtil.omitBy(obj, (value, key) => value === undefined)
```

### 字符串处理函数

```typescript
import { CommonUtil } from '@/wd'

// 生成 UUID
const id = CommonUtil.uuid()  // 'a1b2c3d4e5f6g7h8...'

// 添加单位
CommonUtil.addUnit(10)        // '10rpx'
CommonUtil.addUnit(10, 'px')  // '10px'
CommonUtil.addUnit('auto')    // 'auto'

// 数字补零
CommonUtil.padZero(5)         // '05'
CommonUtil.padZero(5, 3)      // '005'

// 命名转换
CommonUtil.kebabCase('backgroundColor')  // 'background-color'
CommonUtil.camelCase('background-color') // 'backgroundColor'
```

### 单位转换函数

```typescript
import { CommonUtil } from '@/wd'

// rpx 转 px
const px = CommonUtil.rpxToPx(100)   // 在 750px 设备上返回 50

// px 转 rpx
const rpx = CommonUtil.pxToRpx(50)   // 在 375px 设备上返回 100
```

### 数值处理函数

```typescript
import { CommonUtil } from '@/wd'

// 限制数值范围
CommonUtil.range(150, 0, 100)  // 100
CommonUtil.range(-10, 0, 100)  // 0
CommonUtil.range(50, 0, 100)   // 50

// 找到最接近的值
CommonUtil.closest([10, 20, 30], 18)  // 20

// 数值校验
CommonUtil.checkNumRange(num, 'value')    // 检查不小于零
CommonUtil.checkPixelRange(num, 'value')  // 检查大于零
```

### 异步控制函数

```typescript
import { CommonUtil } from '@/wd'

// 防抖函数
const debouncedFn = CommonUtil.debounce((value: string) => {
  console.log('搜索:', value)
}, 300)

// 节流函数
const throttledFn = CommonUtil.throttle((e: Event) => {
  console.log('滚动事件')
}, 100)

// 暂停指定时间
await CommonUtil.pause(1000)  // 暂停 1 秒

// 请求动画帧
const promise = CommonUtil.requestAnimationFrame(() => {
  // 动画回调
})
```

### 样式处理函数

```typescript
import { CommonUtil } from '@/wd'

// 对象转样式字符串
CommonUtil.objToStyle({ color: 'red', fontSize: '14px' })
// 'color:red;font-size:14px;'

// 颜色转换
CommonUtil.rgbToHex(255, 0, 0)      // '#ff0000'
CommonUtil.hexToRgb('#ff0000')      // [255, 0, 0]

// 生成渐变色数组
CommonUtil.gradient('#ff0000', '#0000ff', 5)
// ['#ff0000', '#cc0033', '#990066', '#660099', '#3300cc']
```

### DOM 操作函数

```typescript
import { CommonUtil } from '@/wd'

// 获取节点信息
const rect = await CommonUtil.getRect('.selector', false, this)
console.log(rect.width, rect.height, rect.top, rect.left)

// 获取所有匹配节点
const rects = await CommonUtil.getRect('.selector', true, this)
```

### 网络工具函数

```typescript
import { CommonUtil } from '@/wd'

// 构建带参数的 URL
const url = CommonUtil.buildUrlWithParams('https://api.example.com/users', {
  page: '1',
  size: '10',
})
// 'https://api.example.com/users?page=1&size=10'
```

## 日期时间处理

WD UI 内置了 dayjs 日期处理库：

```typescript
import { dayjs } from '@/wd'

// 当前时间
const now = dayjs()

// 格式化
dayjs().format('YYYY-MM-DD HH:mm:ss')  // '2024-01-01 12:00:00'
dayjs().format('MM/DD')                 // '01/01'

// 解析
dayjs('2024-01-01')
dayjs('2024-01-01 12:00:00')

// 操作
dayjs().add(1, 'day')      // 加一天
dayjs().subtract(1, 'week') // 减一周
dayjs().startOf('month')    // 月初
dayjs().endOf('month')      // 月末

// 比较
dayjs('2024-01-01').isBefore('2024-01-02')  // true
dayjs('2024-01-01').isAfter('2023-12-31')   // true
dayjs('2024-01-01').isSame('2024-01-01')    // true

// 差值
dayjs('2024-01-02').diff('2024-01-01', 'day')  // 1
```

## 国际化

WD UI 内置了完整的国际化支持，默认支持 15 种语言。

### 切换语言

```typescript
import Locale, { useCurrentLang } from '@/wd/locale'

// 切换到英语
Locale.use('en-US')

// 切换到日语
Locale.use('ja-JP')

// 获取当前语言
const currentLang = useCurrentLang()
console.log(currentLang.value)  // 'zh-CN'

// 获取当前语言包
const messages = Locale.messages()
```

### 支持的语言

| 语言代码 | 语言名称 |
|----------|----------|
| zh-CN | 简体中文 |
| zh-TW | 繁体中文（台湾） |
| zh-HK | 繁体中文（香港） |
| en-US | 英语 |
| ja-JP | 日语 |
| ko-KR | 韩语 |
| fr-FR | 法语 |
| de-DE | 德语 |
| es-ES | 西班牙语 |
| pt-PT | 葡萄牙语 |
| ru-RU | 俄语 |
| ar-SA | 阿拉伯语 |
| th-TH | 泰语 |
| vi-VN | 越南语 |
| tr-TR | 土耳其语 |

### 添加自定义语言包

```typescript
import Locale from '@/wd/locale'

// 添加自定义语言
Locale.add({
  'custom-lang': {
    calendar: {
      title: 'Custom Calendar',
      // ...
    },
    // ...
  },
})

// 使用自定义语言
Locale.use('custom-lang')
```

## 自定义业务组件

除了 WD UI 组件库，项目还提供了自定义业务组件。

### AuthModal - 授权弹窗

用于用户授权获取头像和昵称：

```vue
<template>
  <!-- AuthModal 由 userStore 控制显示 -->
  <AuthModal />
</template>

<script lang="ts" setup>
import AuthModal from '@/components/auth/AuthModal.vue'
</script>
```

组件特性：
- 支持微信小程序头像昵称获取
- 支持手机号绑定（微信小程序）
- 支持图片上传（头像选择）
- 自动与用户状态管理集成

### Tabbar 组件

自定义底部标签栏组件：

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
  </view>

  <!-- 底部标签栏 -->
  <TabbarHome v-if="currentTab === 'home'" />
  <TabbarMenu v-if="currentTab === 'menu'" />
  <TabbarMy v-if="currentTab === 'my'" />
</template>

<script lang="ts" setup>
import TabbarHome from '@/components/tabbar/Home.vue'
import TabbarMenu from '@/components/tabbar/Menu.vue'
import TabbarMy from '@/components/tabbar/My.vue'
</script>
```

## Props 设计规范

### Props 定义

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
  /** 自定义样式 */
  customStyle?: string
  /** 自定义类名 */
  customClass?: string
}

const props = withDefaults(defineProps<WdButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
})
```

### Props 类型规范

| 类型 | 说明 | 示例 |
|------|------|------|
| 字符串 | 使用 `string` | `title?: string` |
| 数值 | 使用 `number` | `count?: number` |
| 布尔值 | 使用 `boolean` | `disabled?: boolean` |
| 数组 | 使用泛型数组 | `items?: string[]` |
| 对象 | 使用接口定义 | `user?: UserInfo` |
| 枚举 | 使用联合类型 | `type?: 'a' \| 'b' \| 'c'` |
| 函数 | 使用函数签名 | `formatter?: (val: string) => string` |

### customStyle 和 customClass

所有 WD UI 组件都支持 `customStyle` 和 `customClass` 属性：

```vue
<wd-button
  custom-class="my-button"
  custom-style="margin-top: 20rpx;"
>
  按钮
</wd-button>
```

## Events 设计规范

### Events 定义

```typescript
interface WdButtonEmits {
  click: [event: Event]
  longpress: [event: Event]
}

const emit = defineEmits<WdButtonEmits>()

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
```

### 常见事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击事件 | `event: Event` |
| change | 值变化 | `value: T` |
| input | 输入事件 | `value: string` |
| focus | 获取焦点 | `event: FocusEvent` |
| blur | 失去焦点 | `event: FocusEvent` |
| open | 打开事件 | - |
| close | 关闭事件 | - |
| confirm | 确认事件 | `value: T` |
| cancel | 取消事件 | - |

## Slots 设计规范

### 默认插槽

```vue
<wd-button type="primary">
  提交表单
</wd-button>

<wd-cell title="标题">
  <template #default>
    自定义内容
  </template>
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
  <template #value>
    <text class="custom-value">自定义值</text>
  </template>
</wd-cell>
```

### 作用域插槽

```vue
<wd-picker :columns="columns">
  <template #option="{ item, index }">
    <view class="custom-option">
      {{ index + 1 }}. {{ item.label }}
    </view>
  </template>
</wd-picker>

<wd-count-down :time="3600000">
  <template #default="{ hours, minutes, seconds }">
    <text class="time">{{ hours }}:{{ minutes }}:{{ seconds }}</text>
  </template>
</wd-count-down>
```

## 组件通信

### Props / Events

父子组件通过 Props 传递数据，通过 Events 传递事件：

```vue
<!-- 父组件 -->
<template>
  <child-component
    :user="user"
    @update="handleUpdate"
    @delete="handleDelete"
  />
</template>

<script lang="ts" setup>
const user = ref({ name: '张三' })
const handleUpdate = (newUser: User) => {
  user.value = newUser
}
const handleDelete = () => {
  // 删除逻辑
}
</script>

<!-- 子组件 -->
<script lang="ts" setup>
interface Props {
  user: User
}

interface Emits {
  update: [user: User]
  delete: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateUser = () => {
  emit('update', { ...props.user, name: '李四' })
}
</script>
```

### v-model 双向绑定

```vue
<!-- 单个 v-model -->
<wd-input v-model="username" />

<!-- 多个 v-model -->
<custom-form
  v-model:username="form.username"
  v-model:password="form.password"
/>

<!-- 自定义组件实现 v-model -->
<script lang="ts" setup>
interface Props {
  modelValue: string
}

interface Emits {
  'update:modelValue': [value: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateValue = (value: string) => {
  emit('update:modelValue', value)
}
</script>
```

### Provide / Inject

跨层级组件通信：

```vue
<!-- 祖先组件 -->
<script lang="ts" setup>
import { provide, ref } from 'vue'

const theme = ref('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

provide('theme', theme)
provide('toggleTheme', toggleTheme)
</script>

<!-- 后代组件 -->
<script lang="ts" setup>
import { inject } from 'vue'
import type { Ref } from 'vue'

const theme = inject<Ref<string>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
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
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const handleSubmit = async () => {
  // 调用组件方法
  await formRef.value?.validate()
}

const resetForm = () => {
  formRef.value?.resetFields()
}
</script>
```

### Pinia 状态管理

全局状态通过 Pinia 管理：

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)
  const token = ref<string>('')

  const isLoggedIn = computed(() => !!token.value)

  const login = async (username: string, password: string) => {
    const res = await loginApi({ username, password })
    token.value = res.token
    userInfo.value = res.user
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
  }

  return { userInfo, token, isLoggedIn, login, logout }
})

// 在组件中使用
const userStore = useUserStore()
```

## 自定义组件开发

### 组件模板

```vue
<template>
  <view :class="rootClass" :style="rootStyle" @click="handleClick">
    <slot name="prefix" />
    <view class="custom-component__content">
      <slot />
    </view>
    <slot name="suffix" />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({
  name: 'CustomComponent',
  options: {
    addGlobalClass: true,      // 允许外部样式类
    virtualHost: true,          // 虚拟化组件节点
    styleIsolation: 'shared',   // 样式隔离模式
  },
})

// Props 定义
interface Props {
  /** 组件类型 */
  type?: 'default' | 'primary' | 'success'
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式 */
  customStyle?: string
  /** 自定义类名 */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  disabled: false,
})

// Events 定义
const emit = defineEmits<{
  click: [event: Event]
}>()

// 计算属性
const rootClass = computed(() => [
  'custom-component',
  `custom-component--${props.type}`,
  {
    'custom-component--disabled': props.disabled,
  },
  props.customClass,
])

const rootStyle = computed(() => props.customStyle)

// 方法
const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

// 暴露方法给父组件
defineExpose({
  // 可以暴露内部方法
})
</script>

<style lang="scss" scoped>
.custom-component {
  display: flex;
  align-items: center;
  padding: 24rpx;

  &--primary {
    background-color: var(--wd-color-primary);
    color: #fff;
  }

  &--success {
    background-color: var(--wd-color-success);
    color: #fff;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__content {
    flex: 1;
  }
}
</style>
```

### 组合式函数封装

```typescript
// composables/useCustom.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useCustom = (options: CustomOptions = {}) => {
  // 状态
  const loading = ref(false)
  const data = ref<any>(null)
  const error = ref<Error | null>(null)

  // 计算属性
  const isEmpty = computed(() => !data.value)

  // 方法
  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await options.fetchFn?.()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    error.value = null
  }

  // 生命周期
  onMounted(() => {
    if (options.immediate) {
      fetchData()
    }
  })

  return {
    loading,
    data,
    error,
    isEmpty,
    fetchData,
    reset,
  }
}
```

## 性能优化

### 按需渲染

```vue
<!-- 频繁切换用 v-show（保留 DOM） -->
<wd-popup v-show="showPopup" />

<!-- 条件渲染用 v-if（销毁 DOM） -->
<view v-if="userType === 'admin'">
  管理员内容
</view>
```

### 列表优化

使用 `wd-paging` 组件实现虚拟列表和分页加载：

```vue
<wd-paging
  ref="pagingRef"
  :fetch-api="fetchList"
  :page-size="20"
  :preload-page="2"
>
  <template #default="{ item }">
    <wd-cell :title="item.name" :value="item.value" />
  </template>
</wd-paging>
```

### 计算属性缓存

```typescript
// ✅ 推荐：使用计算属性（有缓存）
const filteredList = computed(() =>
  list.value.filter(item => item.active)
)

// ❌ 不推荐：使用方法（每次调用都重新计算）
const getFilteredList = () =>
  list.value.filter(item => item.active)
```

### 组件懒加载

```typescript
// 异步组件
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/heavy-component/index.vue')
)

// 带加载状态的异步组件
const AsyncComponent = defineAsyncComponent({
  loader: () => import('@/components/async-component/index.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000,
})
```

### 防抖和节流

```typescript
import { CommonUtil } from '@/wd'

// 搜索防抖
const debouncedSearch = CommonUtil.debounce((keyword: string) => {
  // 搜索逻辑
}, 300)

// 滚动节流
const throttledScroll = CommonUtil.throttle((e: Event) => {
  // 滚动处理
}, 100)
```

## 最佳实践

### 1. 组件拆分原则

```vue
<!-- ✅ 好：职责单一的小组件 -->
<user-avatar :avatar="user.avatar" :size="40" />
<user-name :name="user.name" />
<user-badge :level="user.level" />

<!-- ❌ 不好：大而全的组件 -->
<user-card
  :user="user"
  :show-avatar="true"
  :show-name="true"
  :show-badge="true"
  :avatar-size="40"
/>
```

### 2. Props 设计原则

```typescript
// ✅ 好：提供合理默认值和描述性名称
interface Props {
  /** 按钮文本 */
  buttonText: string
  /** 是否加载中 */
  isLoading?: boolean
  /** 最大数量限制 */
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  maxCount: 10,
})

// ❌ 不好：模糊的命名
interface Props {
  text: string
  flag: boolean
  num: number
}
```

### 3. 样式规范

```scss
// 使用 BEM 命名规范
.wd-button {
  // 元素
  &__icon { }
  &__text { }

  // 修饰符
  &--primary { }
  &--disabled { }
  &--large { }
}

// 使用 CSS 变量支持主题定制
.wd-button {
  background-color: var(--wd-button-bg-color, #ffffff);
  color: var(--wd-button-text-color, #333333);
}

// 使用 rpx 单位保证多端一致
.component {
  padding: 32rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
}
```

### 4. 错误处理

```typescript
// 表单校验错误处理
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    // 提交逻辑
  } catch (errors) {
    // 校验失败，errors 包含具体错误信息
    console.error('校验失败:', errors)
  }
}

// API 请求错误处理
const fetchData = async () => {
  try {
    loading.value = true
    const [err, data] = await api.getData()
    if (err) {
      toast.error(err.message || '请求失败')
      return
    }
    // 处理数据
  } finally {
    loading.value = false
  }
}
```

## 常见问题

### 1. 组件不显示

**问题原因**：
- easycom 配置错误
- 组件路径不正确
- 缺少必要的 Props

**解决方案**：

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

### 2. v-model 不生效

**问题原因**：
- 组件未正确实现 v-model 协议
- Props 名称不是 `modelValue`
- Events 名称不是 `update:modelValue`

**解决方案**：

确保组件正确实现 v-model：

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

const updateValue = (value: string) => {
  emit('update:modelValue', value)
}
</script>
```

### 3. ref 获取不到实例

**问题原因**：
- 组件未使用 `defineExpose` 暴露方法
- ref 声明时类型不正确

**解决方案**：

组件内使用 `defineExpose` 暴露需要的方法：

```vue
<script lang="ts" setup>
const validate = () => { /* ... */ }
const resetFields = () => { /* ... */ }

defineExpose({
  validate,
  resetFields
})
</script>
```

使用正确的类型声明 ref：

```typescript
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()
```

### 4. 平台差异问题

**问题原因**：
- 不同平台 API 差异
- 样式表现不一致

**解决方案**：

使用条件编译处理平台差异：

```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <button open-type="getUserInfo" @getuserinfo="handleGetUserInfo">
    获取用户信息
  </button>
  <!-- #endif -->

  <!-- #ifdef H5 -->
  <button @click="handleLogin">登录</button>
  <!-- #endif -->
</template>

<script lang="ts" setup>
// #ifdef MP-WEIXIN
const handleGetUserInfo = (e: any) => {
  // 微信小程序特有逻辑
}
// #endif

// #ifdef H5
const handleLogin = () => {
  // H5 特有逻辑
}
// #endif
</script>
```

### 5. 样式不生效

**问题原因**：
- 样式隔离导致外部样式无法穿透
- 单位使用不正确

**解决方案**：

使用 `customClass` 和 `customStyle` 覆盖样式：

```vue
<wd-button
  custom-class="my-button"
  custom-style="background-color: #ff0000;"
>
  按钮
</wd-button>
```

统一使用 rpx 单位：

```scss
.component {
  width: 750rpx;    // ✅ 推荐
  // width: 375px;  // ❌ 避免
}
```

### 6. 表单校验不触发

**问题原因**：
- 未设置 `prop` 属性
- 校验规则格式错误
- 未正确绑定 `model`

**解决方案**：

```vue
<wd-form ref="formRef" :model="form" :rules="rules">
  <wd-input
    v-model="form.username"
    prop="username"  <!-- 必须设置 prop -->
    label="用户名"
  />
</wd-form>

<script lang="ts" setup>
const form = reactive({
  username: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },  // 必须有 message
  ],
}
</script>
```
