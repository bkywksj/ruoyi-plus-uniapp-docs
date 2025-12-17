# WD UI 组件库

WD UI 是基于 Wot Design Uni 深度定制的移动端组件库，专为 RuoYi-Plus-UniApp 项目优化，提供了 90+ 高质量组件。

## 组件分类

### 基础组件

| 组件 | 说明 |
|------|------|
| Button | 按钮 |
| Icon | 图标 |
| Text | 文本 |
| Transition | 过渡动画 |
| Resize | 尺寸监听 |
| ConfigProvider | 全局配置 |
| Popup | 弹出层 |

### 布局组件

| 组件 | 说明 |
|------|------|
| Row/Col | 栅格布局 |
| Grid | 宫格布局 |
| Divider | 分割线 |
| Gap | 间距 |
| Sticky | 粘性布局 |

### 表单组件

| 组件 | 说明 |
|------|------|
| Form | 表单 |
| Input | 输入框 |
| Textarea | 文本域 |
| InputNumber | 数字输入 |
| Checkbox | 复选框 |
| Radio | 单选框 |
| Switch | 开关 |
| Slider | 滑块 |
| Rate | 评分 |
| Picker | 选择器 |
| DatetimePicker | 日期时间选择 |
| Calendar | 日历 |
| SelectPicker | 下拉选择 |
| ColPicker | 多列选择 |
| Upload | 文件上传 |
| Search | 搜索框 |
| PasswordInput | 密码输入 |
| NumberKeyboard | 数字键盘 |
| Signature | 签名 |
| ImgCropper | 图片裁剪 |

### 展示组件

| 组件 | 说明 |
|------|------|
| Card | 卡片 |
| Cell | 单元格 |
| Badge | 徽标 |
| Tag | 标签 |
| Img | 图片 |
| Swiper | 轮播图 |
| CountDown | 倒计时 |
| CountTo | 数字滚动 |
| Progress | 进度条 |
| Circle | 环形进度 |
| Skeleton | 骨架屏 |
| Collapse | 折叠面板 |
| Table | 表格 |
| RichText | 富文本 |
| Watermark | 水印 |
| Curtain | 幕帘 |

### 导航组件

| 组件 | 说明 |
|------|------|
| Navbar | 导航栏 |
| NavbarCapsule | 胶囊导航 |
| Tabbar | 标签栏 |
| Tabs | 选项卡 |
| Sidebar | 侧边栏 |
| Pagination | 分页 |
| Paging | 滚动分页 |
| IndexBar | 索引栏 |
| Segmented | 分段器 |
| Steps | 步骤条 |
| Backtop | 返回顶部 |
| FloatingPanel | 浮动面板 |

### 反馈组件

| 组件 | 说明 |
|------|------|
| ActionSheet | 动作面板 |
| DropMenu | 下拉菜单 |
| Fab | 浮动按钮 |
| Loading | 加载 |
| Loadmore | 加载更多 |
| MessageBox | 消息弹窗 |
| NoticeBar | 通知栏 |
| Notify | 消息通知 |
| Overlay | 遮罩层 |
| Popover | 气泡弹出 |
| StatusTip | 状态提示 |
| SwipeAction | 滑动操作 |
| Toast | 轻提示 |
| Tooltip | 文字提示 |
| SortButton | 排序按钮 |

## 使用方式

### 自动导入

项目已配置组件自动导入，直接在模板中使用即可：

```vue
<template>
  <wd-button type="primary">按钮</wd-button>
  <wd-cell title="标题" value="内容" />
</template>
```

### 全局配置

通过 `wd-config-provider` 配置全局主题：

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <App />
  </wd-config-provider>
</template>

<script setup>
const themeVars = {
  colorTheme: '#1989fa',
  buttonPrimaryBgColor: '#1989fa'
}
</script>
```

## 设计规范

- **色彩**: 主色 `#1989fa`，辅助色系完整
- **字体**: 系统默认字体，支持多端一致性
- **间距**: 基于 4px 网格系统
- **圆角**: 统一 4px/8px/12px 三档
- **阴影**: 轻量级阴影，提升层次感
