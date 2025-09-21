# Row-Col 行列布局

WD UI 行列布局组件，基于 Flexbox 实现的响应式格子系统。

## 基本使用

### 基础布局

```vue
<template>
  <view class="demo-block">
    <wd-row>
      <wd-col span="24">
        <view class="col-item">span: 24</view>
      </wd-col>
    </wd-row>
    
    <wd-row>
      <wd-col span="12">
        <view class="col-item">span: 12</view>
      </wd-col>
      <wd-col span="12">
        <view class="col-item">span: 12</view>
      </wd-col>
    </wd-row>
    
    <wd-row>
      <wd-col span="8">
        <view class="col-item">span: 8</view>
      </wd-col>
      <wd-col span="8">
        <view class="col-item">span: 8</view>
      </wd-col>
      <wd-col span="8">
        <view class="col-item">span: 8</view>
      </wd-col>
    </wd-row>
  </view>
</template>

<style>
.col-item {
  padding: 20rpx;
  background: #f5f5f5;
  text-align: center;
  margin: 4rpx;
}
</style>
```

### 间距设置

```vue
<template>
  <view class="demo-block">
    <wd-row gutter="20">
      <wd-col span="6">
        <view class="col-item">span: 6</view>
      </wd-col>
      <wd-col span="6">
        <view class="col-item">span: 6</view>
      </wd-col>
      <wd-col span="6">
        <view class="col-item">span: 6</view>
      </wd-col>
      <wd-col span="6">
        <view class="col-item">span: 6</view>
      </wd-col>
    </wd-row>
  </view>
</template>
```

### 偏移列

```vue
<template>
  <view class="demo-block">
    <wd-row>
      <wd-col span="8">
        <view class="col-item">span: 8</view>
      </wd-col>
      <wd-col span="8" offset="8">
        <view class="col-item">span: 8, offset: 8</view>
      </wd-col>
    </wd-row>
    
    <wd-row>
      <wd-col span="6" offset="6">
        <view class="col-item">span: 6, offset: 6</view>
      </wd-col>
      <wd-col span="6" offset="6">
        <view class="col-item">span: 6, offset: 6</view>
      </wd-col>
    </wd-row>
  </view>
</template>
```

## API

### Row Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| gutter | 列间距 | string/number | 0 |
| justify | 水平对齐方式 | string | start |
| align | 垂直对齐方式 | string | top |

### Col Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| span | 列的宽度 | string/number | 24 |
| offset | 列的偏移 | string/number | 0 |