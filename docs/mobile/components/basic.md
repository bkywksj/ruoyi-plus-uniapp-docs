# 基础组件

基础组件是构建用户界面的核心元素，提供按钮、图标、文本等基础功能。

## 组件列表

| 组件 | 说明 | 文档 |
|------|------|------|
| Button | 按钮，支持多种类型、尺寸、状态 | [查看](/mobile/wd/basic/button) |
| Icon | 图标，支持 Iconify 和自定义图标 | [查看](/mobile/wd/basic/icon) |
| Text | 文本，支持多种样式和省略 | [查看](/mobile/wd/basic/text) |
| Transition | 过渡动画，内置多种动画效果 | [查看](/mobile/wd/basic/transition) |
| Resize | 尺寸监听，监听元素大小变化 | [查看](/mobile/wd/basic/resize) |
| ConfigProvider | 全局配置，主题和国际化配置 | [查看](/mobile/wd/basic/config-provider) |
| Popup | 弹出层，底层弹窗组件 | [查看](/mobile/wd/feedback/popup) |

## 快速使用

### Button 按钮

```vue
<template>
  <wd-button type="primary">主要按钮</wd-button>
  <wd-button type="success">成功按钮</wd-button>
  <wd-button type="warning">警告按钮</wd-button>
  <wd-button type="error">危险按钮</wd-button>
  <wd-button plain>朴素按钮</wd-button>
  <wd-button disabled>禁用按钮</wd-button>
  <wd-button loading>加载中</wd-button>
</template>
```

### Icon 图标

```vue
<template>
  <wd-icon name="home" size="24" color="#1989fa" />
  <wd-icon name="i-ep-setting" />
  <wd-icon name="icon-user" />
</template>
```

### Text 文本

```vue
<template>
  <wd-text text="普通文本" />
  <wd-text text="主题色文本" type="primary" />
  <wd-text text="超长文本省略..." lines="1" />
</template>
```

## 设计原则

- **简洁**: 组件 API 设计简洁，易于上手
- **一致**: 视觉风格统一，交互行为一致
- **灵活**: 支持丰富的自定义配置
- **高效**: 组件性能优化，渲染高效
