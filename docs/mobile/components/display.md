# 展示组件

展示组件用于数据展示和内容呈现，包括卡片、列表、图片、进度等。

## 组件列表

| 组件 | 说明 |
|------|------|
| Card | 卡片容器 |
| Cell | 单元格 |
| CellGroup | 单元格组 |
| Badge | 徽标数 |
| Tag | 标签 |
| Img | 图片，支持懒加载 |
| Swiper | 轮播图 |
| CountDown | 倒计时 |
| CountTo | 数字动画 |
| Progress | 线性进度条 |
| Circle | 环形进度条 |
| Skeleton | 骨架屏 |
| Collapse | 折叠面板 |
| Table | 表格 |
| RichText | 富文本 |
| Watermark | 水印 |
| Curtain | 幕帘广告 |

## 快速使用

### Cell 单元格

```vue
<template>
  <wd-cell-group title="基础用法">
    <wd-cell title="标题" value="内容" />
    <wd-cell title="带图标" icon="setting" value="内容" />
    <wd-cell title="带箭头" is-link value="内容" />
  </wd-cell-group>
</template>
```

### Card 卡片

```vue
<template>
  <wd-card title="卡片标题">
    <template #footer>
      <wd-button size="small">操作</wd-button>
    </template>
    卡片内容
  </wd-card>
</template>
```

### Swiper 轮播图

```vue
<template>
  <wd-swiper :list="banners" autoplay :interval="3000">
    <template #default="{ item }">
      <wd-img :src="item.image" mode="aspectFill" />
    </template>
  </wd-swiper>
</template>
```

### Progress 进度条

```vue
<template>
  <wd-progress :percentage="50" />
  <wd-progress :percentage="75" status="success" />
  <wd-circle :percentage="80" text="80%" />
</template>
```

### Skeleton 骨架屏

```vue
<template>
  <wd-skeleton :loading="loading" :rows="3" avatar>
    <wd-cell title="真实内容" value="加载完成" />
  </wd-skeleton>
</template>
```

### Collapse 折叠面板

```vue
<template>
  <wd-collapse v-model="activeNames">
    <wd-collapse-item title="标题1" name="1">内容1</wd-collapse-item>
    <wd-collapse-item title="标题2" name="2">内容2</wd-collapse-item>
  </wd-collapse>
</template>
```

## 图片加载

支持懒加载和加载状态：

```vue
<template>
  <wd-img
    src="/path/to/image.jpg"
    width="200"
    height="200"
    mode="aspectFill"
    lazy-load
  >
    <template #loading>
      <wd-loading />
    </template>
    <template #error>
      加载失败
    </template>
  </wd-img>
</template>
```
