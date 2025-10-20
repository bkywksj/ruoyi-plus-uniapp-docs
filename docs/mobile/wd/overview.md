# WD UI 组件库概览

## 简介

**Wot Design Uni** 是一个基于 Vue 3 + TypeScript 的 uni-app 组件库，提供 **98 个**高质量的移动端 UI 组件，完美适配各个小程序平台（微信、支付宝、钉钉、百度、抖音、QQ）和 H5、App 端。

本项目在 Wot Design Uni 的基础上进行了**二次封装和扩展**，位于 `src/wd` 目录，提供更符合项目需求的组件实现。

## 版本信息

```json
{
  "wot-design-uni": "^1.5.13"
}
```

项目使用 Wot Design Uni 的稳定版本，定期随 uni-app 生态更新。

参考：package.json:1

## 核心特性

### 1. 全平台兼容

支持所有 uni-app 支持的平台：

- ✅ **H5**
- ✅ **微信小程序**
- ✅ **支付宝小程序**
- ✅ **钉钉小程序**
- ✅ **百度小程序**
- ✅ **抖音小程序**
- ✅ **QQ 小程序**
- ✅ **快手小程序**
- ✅ **小红书小程序**
- ✅ **Android App**
- ✅ **iOS App**
- ✅ **鸿蒙 App**

### 2. TypeScript 支持

- 完整的类型定义
- 智能代码提示
- 类型安全保障
- 更好的开发体验

### 3. 自动按需引入

项目已配置自动按需引入：

- 无需手动导入组件
- 自动生成类型声明
- 减小打包体积
- 提升加载性能

### 4. 主题定制

- CSS 变量系统
- 灵活的主题配置
- 支持暗色模式
- 动态主题切换

### 5. 二次封装

项目对部分组件进行了二次封装（src/wd），提供：

- 更贴合业务需求的 API
- 增强的功能特性
- 统一的样式风格
- 优化的性能表现

## 项目结构

### 源码组件目录（src/wd）

```bash
src/wd/
├── components/           # 组件源码（98个）
│   ├── common/          # 通用工具
│   ├── composables/     # 组合式函数
│   ├── wd-button/       # 按钮组件
│   ├── wd-input/        # 输入框组件
│   ├── wd-tabbar/       # 自定义标签栏
│   └── ...              # 其他98个组件
├── locale/              # 多语言支持
├── global.d.ts          # 全局类型声明
├── index.ts             # 导出入口
├── package.json         # 组件库配置
└── readme.md            # 组件库说明
```

参考：src/wd/

### 二次封装组件

项目对以下组件进行了扩展：

| 组件 | 说明 | 扩展功能 |
|------|------|---------|
| wd-tabbar | 标签栏 | 支持双图标模式、状态管理集成 |
| wd-navbar-capsule | 导航栏胶囊 | 适配小程序胶囊按钮 |
| wd-language-selector | 语言选择器 | 国际化集成 |

参考：src/wd/components/

## 组件分类

### 基础组件（6 个）

| 组件 | 说明 | 常用场景 | 文档 |
|------|------|---------|------|
| Button | 按钮 | 操作触发 | [查看](./basic/button.md) |
| Icon | 图标 | 图标展示 | [查看](./basic/icon.md) |
| Text | 文本 | 文字显示 | [查看](./basic/text.md) |
| Transition | 动画 | 过渡效果 | [查看](./basic/transition.md) |
| Resize | 尺寸监听 | 响应式布局 | [查看](./basic/resize.md) |
| ConfigProvider | 全局配置 | 主题定制 | [查看](./basic/config-provider.md) |

### 布局组件（5 个）

| 组件 | 说明 | 常用场景 | 文档 |
|------|------|---------|------|
| Row-Col | 行列布局 | 栅格系统 | [查看](./layout/row-col.md) |
| Grid | 宫格 | 图标导航 | [查看](./layout/grid.md) |
| Gap | 间隙槽 | 内容分隔 | [查看](./layout/gap.md) |
| Divider | 分割线 | 内容分割 | [查看](./layout/divider.md) |
| Sticky | 吸顶布局 | 导航吸顶 | [查看](./layout/sticky.md) |

### 导航组件（9 个）

| 组件 | 说明 | 常用场景 | 文档 |
|------|------|---------|------|
| Navbar | 导航栏 | 页面标题 | [查看](./navigation/navbar.md) |
| Tabbar | 标签栏 | 底部导航 | [查看](./navigation/tabbar.md) |
| Tabs | 标签页 | 内容切换 | [查看](./navigation/tabs.md) |
| Segmented | 分段器 | 选项切换 | [查看](./navigation/segmented.md) |
| Sidebar | 侧边栏 | 侧边导航 | [查看](./navigation/sidebar.md) |
| IndexBar | 索引栏 | 城市选择 | [查看](./navigation/index-bar.md) |
| Pagination | 分页 | 数据分页 | [查看](./navigation/pagination.md) |
| Paging | 分页加载 | 下拉加载 | [查看](./navigation/paging.md) |
| Backtop | 回到顶部 | 快速返回 | [查看](./navigation/backtop.md) |

### 表单组件（22 个）

| 组件 | 说明 | 常用场景 | 文档 |
|------|------|---------|------|
| Input | 输入框 | 文本输入 | [查看](./form/input.md) |
| Textarea | 文本域 | 长文本 | [查看](./form/textarea.md) |
| InputNumber | 计数器 | 数量调整 | [查看](./form/input-number.md) |
| PasswordInput | 密码输入 | 密码输入 | [查看](./form/password-input.md) |
| Search | 搜索框 | 搜索功能 | [查看](./form/search.md) |
| Checkbox | 复选框 | 多选 | [查看](./form/checkbox.md) |
| Radio | 单选框 | 单选 | [查看](./form/radio.md) |
| Switch | 开关 | 状态切换 | [查看](./form/switch.md) |
| Rate | 评分 | 评价打分 | [查看](./form/rate.md) |
| Slider | 滑块 | 范围选择 | [查看](./form/slider.md) |
| Picker | 选择器 | 数据选择 | [查看](./form/picker.md) |
| PickerView | 选择器视图 | 内嵌选择 | [查看](./form/picker-view.md) |
| ColPicker | 多列选择器 | 级联选择 | [查看](./form/col-picker.md) |
| SelectPicker | 单复选 | 列表选择 | [查看](./form/select-picker.md) |
| DatetimePicker | 时间选择 | 日期时间 | [查看](./form/datetime-picker.md) |
| DatetimePickerView | 时间视图 | 内嵌时间 | [查看](./form/datetime-picker-view.md) |
| Calendar | 日历 | 日期选择 | [查看](./form/calendar.md) |
| CalendarView | 日历板 | 日期范围 | [查看](./form/calendar-view.md) |
| Upload | 上传 | 文件上传 | [查看](./form/upload.md) |
| Form | 表单 | 表单容器 | [查看](./form/form.md) |
| Signature | 签名 | 手写签名 | [查看](./form/signature.md) |
| Recorder | 录音 | 语音录制 | [查看](./form/voice-recorder.md) |

### 展示组件（13 个）

| 组件 | 说明 | 常用场景 | 文档 |
|------|------|---------|------|
| Cell | 单元格 | 列表项 | [查看](./display/cell.md) |
| Badge | 徽标 | 数量提示 | [查看](./display/badge.md) |
| Tag | 标签 | 标记分类 | [查看](./display/tag.md) |
| Card | 卡片 | 信息容器 | [查看](./display/card.md) |
| Collapse | 折叠面板 | 内容折叠 | [查看](./display/collapse.md) |
| Steps | 步骤条 | 流程展示 | [查看](./display/steps.md) |
| Table | 表格 | 数据展示 | [查看](./display/table.md) |
| Img | 图片 | 图片显示 | [查看](./display/img.md) |
| ImgCropper | 图片裁剪 | 图片编辑 | [查看](./display/img-cropper.md) |
| Swiper | 轮播图 | 图片轮播 | [查看](./display/swiper.md) |
| Skeleton | 骨架屏 | 加载占位 | [查看](./display/skeleton.md) |
| Curtain | 幕帘 | 引导页 | [查看](./display/curtain.md) |
| Watermark | 水印 | 版权保护 | [查看](./display/watermark.md) |

### 反馈组件（23 个）

| 组件 | 说明 | 常用场景 | 文档 |
|------|------|---------|------|
| ActionSheet | 上拉菜单 | 操作选择 | [查看](./feedback/action-sheet.md) |
| Popup | 弹出层 | 内容弹出 | [查看](./feedback/popup.md) |
| Overlay | 遮罩层 | 蒙层显示 | [查看](./feedback/overlay.md) |
| MessageBox | 弹框 | 确认提示 | [查看](./feedback/message-box.md) |
| Toast | 轻提示 | 消息提示 | [查看](./feedback/toast.md) |
| Notify | 消息通知 | 顶部通知 | [查看](./feedback/notify.md) |
| Loading | 加载指示器 | 加载状态 | [查看](./feedback/loading.md) |
| Progress | 进度条 | 进度显示 | [查看](./feedback/progress.md) |
| Circle | 环形进度条 | 圆形进度 | [查看](./feedback/circle.md) |
| Loadmore | 加载更多 | 列表加载 | [查看](./feedback/loadmore.md) |
| StatusTip | 缺省提示 | 空状态 | [查看](./feedback/status-tip.md) |
| Tooltip | 文字提示 | 气泡提示 | [查看](./feedback/tooltip.md) |
| Popover | 气泡 | 菜单气泡 | [查看](./feedback/popover.md) |
| DropMenu | 下拉菜单 | 筛选菜单 | [查看](./feedback/drop-menu.md) |
| FloatingPanel | 浮动面板 | 底部面板 | [查看](./feedback/floating-panel.md) |
| SwipeAction | 滑动操作 | 滑动删除 | [查看](./feedback/swipe-action.md) |
| SortButton | 排序按钮 | 排序切换 | [查看](./feedback/sort-button.md) |
| NoticeBar | 通知栏 | 滚动通知 | [查看](./feedback/notice-bar.md) |
| CountDown | 倒计时 | 限时活动 | [查看](./feedback/count-down.md) |
| CountTo | 数字滚动 | 数字动画 | [查看](./feedback/count-to.md) |
| Keyboard | 虚拟键盘 | 自定义键盘 | [查看](./feedback/keyboard.md) |
| NumberKeyboard | 数字键盘 | 数字输入 | [查看](./feedback/number-keyboard.md) |
| Fab | 悬浮按钮 | 快捷操作 | [查看](./feedback/fab.md) |

## 安装配置

### 1. 自动按需引入配置

项目已配置自动按需引入，无需手动导入组件。

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

参考：vite/plugins/components.ts:1-14

### 2. 类型声明

TypeScript 类型自动生成在：

```
src/types/components.d.ts
```

包含所有组件的类型定义和智能提示支持。

### 3. 组件导出

组件库提供的组合式 API 和类型导出：

**src/wd/index.ts**:

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

// 类型导出
export type { CalendarInstance } from './components/wd-calendar/wd-calendar.vue'
export type { FormInstance } from './components/wd-form/wd-form.vue'
export type { PickerInstance } from './components/wd-picker/wd-picker.vue'
// ... 更多类型
```

参考：src/wd/index.ts:1-90

## 使用示例

### 基础用法

直接在模板中使用组件，无需导入：

```vue
<template>
  <view class="container">
    <!-- 按钮组件 -->
    <wd-button type="primary" @click="handleClick">
      点击按钮
    </wd-button>

    <!-- 输入框组件 -->
    <wd-input v-model="value" placeholder="请输入内容" />
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

### 项目实际示例：Tabbar 使用

**首页 Tabbar**（src/pages/index/index.vue:18）:

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
// 使用 tabbar 状态管理 store
const tabbarStore = useTabbarStore()
const { currentTab, tabs } = storeToRefs(tabbarStore)

// 处理标签页切换事件
const handleTabChange = (index: number) => {
  tabbarStore.toTab(index)
}
</script>
```

参考：src/pages/index/index.vue:1-69

### 组合式 API 使用

**Toast 轻提示**:

```typescript
import { useToast } from '@/wd'

const toast = useToast()

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 加载提示
toast.loading('加载中...')

// 自定义提示
toast.show({
  msg: '自定义消息',
  duration: 3000,
  type: 'warning'
})
```

**MessageBox 对话框**:

```typescript
import { useMessage } from '@/wd'

const messageBox = useMessage()

// 确认对话框
messageBox.confirm({
  msg: '确定删除吗？',
  title: '提示'
}).then(() => {
  console.log('确认操作')
}).catch(() => {
  console.log('取消操作')
})

// 提示对话框
messageBox.alert({
  msg: '操作成功',
  title: '提示'
})
```

**Notify 通知**:

```typescript
import { useNotify } from '@/wd'

const notify = useNotify()

// 主要通知
notify.primary('这是一条通知消息')

// 成功通知
notify.success('操作成功')

// 警告通知
notify.warning('请注意')

// 错误通知
notify.danger('操作失败')
```

## 主题定制

### 1. CSS 变量定制

在全局样式中覆盖 CSS 变量：

```scss
/* src/uni.scss */

page {
  /* 主色调 */
  --wot-color-theme: #0957DE;

  /* 成功色 */
  --wot-color-success: #4cd964;

  /* 警告色 */
  --wot-color-warning: #f0ad4e;

  /* 危险色 */
  --wot-color-danger: #dd524d;

  /* 默认圆角 */
  --wot-radius-default: 8rpx;

  /* 按钮高度 */
  --wot-button-height: 88rpx;

  /* 字体大小 */
  --wot-font-size-base: 28rpx;
}
```

### 2. ConfigProvider 全局配置

使用 ConfigProvider 配置全局主题：

```vue
<template>
  <wd-config-provider :theme="themeVars">
    <view class="app">
      <!-- 应用内容 -->
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
const themeVars = {
  // 主色
  colorTheme: '#0957DE',

  // 成功色
  colorSuccess: '#4cd964',

  // 警告色
  colorWarning: '#f0ad4e',

  // 错误色
  colorDanger: '#dd524d',

  // 圆角
  radiusDefault: '8rpx',

  // 字体
  fontSizeBase: '28rpx',
}
</script>
```

详细主题配置请参考：[主题定制](../styles/theme.md)

## 平台差异处理

### 支付宝小程序特殊处理

支付宝小程序不支持 v-show，需使用 v-if：

```vue
<template>
  <!-- #ifdef MP-ALIPAY -->
  <Home v-if="currentTab === 0 && tabs[0].loaded" />
  <Menu v-if="currentTab === 1 && tabs[1].loaded" />
  <!-- #endif -->

  <!-- #ifndef MP-ALIPAY -->
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
  <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
  <!-- #endif -->
</template>
```

参考：src/pages/index/index.vue:4-15

### 条件编译

某些组件在不同平台表现不同，需使用条件编译：

```vue
<template>
  <!-- H5 端使用原生滚动 -->
  <!-- #ifdef H5 -->
  <scroll-view>
    <wd-list />
  </scroll-view>
  <!-- #endif -->

  <!-- 小程序端优化 -->
  <!-- #ifdef MP -->
  <wd-paging>
    <wd-list />
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

### 2. 虚拟列表

对于长列表使用虚拟滚动：

```vue
<template>
  <wd-paging
    :loading="loading"
    :finished="finished"
    @load="loadMore"
  >
    <wd-cell
      v-for="item in list"
      :key="item.id"
      :title="item.title"
    />
  </wd-paging>
</template>
```

### 3. 懒加载

使用 v-if 和 v-show 结合实现懒加载：

```vue
<template>
  <!-- 首次加载用 v-if -->
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
  <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
</template>
```

参考：src/pages/index/index.vue:12-14

## 常见问题

### 1. 组件样式不生效？

**原因**：未正确引入组件或样式被覆盖

**解决方案**：

```vue
<!-- ✅ 正确：使用 scoped 避免样式污染 -->
<style lang="scss" scoped>
.custom-button {
  /* 自定义样式 */
}
</style>

<!-- ❌ 错误：直接覆盖组件样式 -->
<style lang="scss">
.wd-button {
  /* 这样会污染全局 */
}
</style>
```

### 2. TypeScript 类型提示不生效？

**解决方案**：

1. 确保已生成类型文件 `src/types/components.d.ts`
2. 重启 VSCode 或重新编译项目

```bash
# 清除缓存重新编译
rm -rf node_modules/.vite
pnpm dev:h5
```

### 3. 组件自动引入失败？

**解决方案**：

1. 检查 `vite/plugins/components.ts` 配置
2. 清除缓存重新编译
3. 检查组件名称是否正确（必须以 `wd-` 开头）

### 4. 小程序端组件显示异常？

**解决方案**：

1. 检查是否使用了平台不支持的特性
2. 使用条件编译处理平台差异
3. 查看官方文档的平台兼容性说明

## 最佳实践

### 1. 统一使用组合式 API

```typescript
// ✅ 推荐：使用组合式 API
import { useToast } from '@/wd'

const toast = useToast()
toast.success('成功')

// ❌ 不推荐：使用 uni 原生方法
uni.showToast({ title: '成功' })
```

### 2. 合理使用组件

```vue
<!-- ✅ 推荐：使用专用组件 -->
<wd-button type="primary" @click="submit">提交</wd-button>

<!-- ❌ 不推荐：使用 view 模拟 -->
<view class="custom-button" @click="submit">提交</view>
```

### 3. 主题统一管理

```typescript
// src/config/theme.ts
export const themeConfig = {
  colorTheme: '#0957DE',
  colorSuccess: '#4cd964',
  colorWarning: '#f0ad4e',
  colorDanger: '#dd524d',
}

// 在 App.vue 中使用
<wd-config-provider :theme="themeConfig">
  <view class="app">...</view>
</wd-config-provider>
```

### 4. 性能优化

```vue
<template>
  <!-- 长列表使用虚拟滚动 -->
  <wd-paging :loading="loading" :finished="finished" @load="loadMore">
    <wd-cell
      v-for="item in list"
      :key="item.id"
      :title="item.title"
    />
  </wd-paging>
</template>
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

## 下一步

- [快速开始](./getting-started.md) - 快速上手使用
- [主题定制](../styles/theme.md) - 自定义主题
- [基础组件](./basic/button.md) - 查看基础组件文档
- [表单组件](./form/input.md) - 查看表单组件文档

## 相关文档

- [UniApp 概览](../uniapp/overview.md) - UniApp 基础知识
- [样式系统](../styles/overview.md) - 样式架构设计
- [组件开发](../components/custom-development.md) - 自定义组件开发
- [类型系统](../types/overview.md) - TypeScript 类型定义
