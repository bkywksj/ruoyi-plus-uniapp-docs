# 布局组件

布局组件用于页面布局和内容排版，提供栅格、宫格、间距等功能。

## 组件列表

| 组件 | 说明 |
|------|------|
| Row | 行布局容器 |
| Col | 列布局单元 |
| Grid | 宫格布局 |
| GridItem | 宫格项 |
| Divider | 分割线 |
| Gap | 间距 |
| Sticky | 粘性布局 |
| StickyBox | 粘性容器 |

## 快速使用

### Row/Col 栅格布局

基于 24 栅格系统：

```vue
<template>
  <!-- 等分布局 -->
  <wd-row>
    <wd-col :span="8">span: 8</wd-col>
    <wd-col :span="8">span: 8</wd-col>
    <wd-col :span="8">span: 8</wd-col>
  </wd-row>

  <!-- 间距布局 -->
  <wd-row :gutter="20">
    <wd-col :span="12">span: 12</wd-col>
    <wd-col :span="12">span: 12</wd-col>
  </wd-row>

  <!-- 偏移布局 -->
  <wd-row>
    <wd-col :span="6" :offset="6">offset: 6</wd-col>
    <wd-col :span="6" :offset="6">offset: 6</wd-col>
  </wd-row>
</template>
```

### Grid 宫格布局

```vue
<template>
  <wd-grid :column="4">
    <wd-grid-item icon="home" text="首页" @click="handleClick" />
    <wd-grid-item icon="search" text="搜索" />
    <wd-grid-item icon="bell" text="通知" badge="5" />
    <wd-grid-item icon="user" text="我的" />
  </wd-grid>
</template>
```

### Divider 分割线

```vue
<template>
  <wd-divider />
  <wd-divider>文字</wd-divider>
  <wd-divider content-position="left">左侧文字</wd-divider>
  <wd-divider dashed>虚线</wd-divider>
</template>
```

### Gap 间距

```vue
<template>
  <wd-gap height="20" />
  <wd-gap height="40" bg-color="#f5f5f5" />
</template>
```

### Sticky 粘性布局

```vue
<template>
  <wd-sticky :offset-top="0">
    <wd-navbar title="粘性导航" />
  </wd-sticky>

  <view class="content">
    <!-- 页面内容 -->
  </view>
</template>
```

## 响应式布局

支持不同屏幕尺寸的响应式配置：

```vue
<template>
  <wd-row>
    <wd-col :xs="24" :sm="12" :md="8" :lg="6">
      响应式列
    </wd-col>
  </wd-row>
</template>
```

## Flex 布局

Row 组件支持 Flex 对齐方式：

```vue
<template>
  <!-- 水平对齐 -->
  <wd-row justify="center">
    <wd-col :span="6">居中</wd-col>
  </wd-row>

  <!-- 垂直对齐 -->
  <wd-row align="middle" style="height: 100px">
    <wd-col :span="6">垂直居中</wd-col>
  </wd-row>
</template>
```
