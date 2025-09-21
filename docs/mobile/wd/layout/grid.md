# Grid 宫格

WD UI 宫格组件，用于展示网格列表，支持自定义列数和间距。

## 基本使用

### 基础宫格

```vue
<template>
  <view class="demo-block">
    <wd-grid>
      <wd-grid-item 
        v-for="item in 8" 
        :key="item"
        @click="handleClick(item)"
      >
        <wd-icon name="home" size="32" />
        <text>菜单{{ item }}</text>
      </wd-grid-item>
    </wd-grid>
  </view>
</template>

<script setup>
const handleClick = (item) => {
  console.log(`点击了菜单${item}`)
}
</script>
```

### 自定义列数

```vue
<template>
  <view class="demo-block">
    <!-- 3列宫格 -->
    <wd-grid :column-num="3">
      <wd-grid-item v-for="item in 6" :key="item">
        <wd-icon name="star" size="32" />
        <text>菜单{{ item }}</text>
      </wd-grid-item>
    </wd-grid>
    
    <!-- 5列宫格 -->
    <wd-grid :column-num="5">
      <wd-grid-item v-for="item in 10" :key="item">
        <wd-icon name="heart" size="24" />
        <text>菜单{{ item }}</text>
      </wd-grid-item>
    </wd-grid>
  </view>
</template>
```

### 设置间距

```vue
<template>
  <view class="demo-block">
    <wd-grid :column-num="3" gutter="20">
      <wd-grid-item v-for="item in 6" :key="item">
        <view class="grid-content">
          <wd-icon name="add" size="32" />
          <text>菜单{{ item }}</text>
        </view>
      </wd-grid-item>
    </wd-grid>
  </view>
</template>

<style>
.grid-content {
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  text-align: center;
}
</style>
```

## API

### Grid Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| column-num | 列数 | number | 4 |
| gutter | 间距 | string/number | 0 |
| border | 是否显示边框 | boolean | true |
| square | 是否固定正方形格子 | boolean | false |

### GridItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| text | 文本 | string | — |
| icon | 图标 | string | — |
| dot | 是否显示小红点 | boolean | false |
| badge | 徽标内容 | string/number | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击宫格时触发 | index: 索引 |