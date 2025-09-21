# Icon 图标

WD UI 图标组件，提供了丰富的图标库支持。

## 基本使用

### 基础图标

```vue
<template>
  <view class="demo-block">
    <!-- 基础图标 -->
    <wd-icon name="add" size="24" />
    <wd-icon name="search" size="24" />
    <wd-icon name="close" size="24" />
  </view>
</template>
```

### 图标颜色

```vue
<template>
  <view class="demo-block">
    <!-- 设置图标颜色 -->
    <wd-icon name="heart" color="#ff0000" size="24" />
    <wd-icon name="star" color="#ffa500" size="24" />
    <wd-icon name="like" color="#1890ff" size="24" />
  </view>
</template>
```

### 图标大小

```vue
<template>
  <view class="demo-block">
    <!-- 不同大小的图标 -->
    <wd-icon name="home" size="16" />
    <wd-icon name="home" size="24" />
    <wd-icon name="home" size="32" />
    <wd-icon name="home" size="48" />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| name | 图标名称 | string | — | — |
| size | 图标大小 | string/number | — | 16 |
| color | 图标颜色 | string | — | — |
| class-prefix | 图标类名前缀 | string | — | wd-icon |
| custom-class | 自定义类名 | string | — | — |
| custom-style | 自定义样式 | string | — | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击图标时触发 | event |

## 图标库

### 基础图标

- add: 添加
- close: 关闭
- search: 搜索
- back: 返回
- more: 更多
- home: 首页
- user: 用户
- setting: 设置

### 操作图标

- edit: 编辑
- delete: 删除
- save: 保存
- upload: 上传
- download: 下载
- share: 分享
- copy: 复制
- refresh: 刷新

### 状态图标

- success: 成功
- error: 错误
- warning: 警告
- info: 信息
- loading: 加载中

### 箭头图标

- arrow-up: 向上箭头
- arrow-down: 向下箭头
- arrow-left: 向左箭头
- arrow-right: 向右箭头

## 注意事项

1. 图标名称必须是图标库中存在的名称
2. 图标大小支持数字和字符串格式
3. 颜色值支持十六进制、RGB、颜色名称等格式
4. 可以通过 custom-class 添加自定义样式

## 自定义图标

如果需要使用自定义图标，可以通过以下方式：

```vue
<template>
  <view class="demo-block">
    <!-- 使用自定义图标字体 -->
    <wd-icon name="custom-icon" class-prefix="my-icon" />
    
    <!-- 使用图片作为图标 -->
    <image src="/static/icons/custom.png" class="custom-icon" />
  </view>
</template>

<style>
.my-icon {
  font-family: 'MyIconFont';
}

.custom-icon {
  width: 24px;
  height: 24px;
}
</style>
```