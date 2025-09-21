# Text 文本

WD UI 文本组件，用于显示文本内容，支持多种样式和特效。

## 基本使用

### 基础文本

```vue
<template>
  <view class="demo-block">
    <!-- 基础文本 -->
    <wd-text>这是一段文本</wd-text>
    
    <!-- 带标题的文本 -->
    <wd-text type="title">标题文本</wd-text>
    
    <!-- 带副标题的文本 -->
    <wd-text type="subtitle">副标题文本</wd-text>
  </view>
</template>
```

### 文本类型

```vue
<template>
  <view class="demo-block">
    <!-- 不同类型的文本 -->
    <wd-text type="default">默认文本</wd-text>
    <wd-text type="primary">主要文本</wd-text>
    <wd-text type="success">成功文本</wd-text>
    <wd-text type="warning">警告文本</wd-text>
    <wd-text type="error">错误文本</wd-text>
    <wd-text type="info">信息文本</wd-text>
  </view>
</template>
```

### 文本大小

```vue
<template>
  <view class="demo-block">
    <!-- 不同大小的文本 -->
    <wd-text size="12">小号文本</wd-text>
    <wd-text size="14">普通文本</wd-text>
    <wd-text size="16">中等文本</wd-text>
    <wd-text size="18">大号文本</wd-text>
    <wd-text size="20">特大文本</wd-text>
  </view>
</template>
```

### 文本颜色

```vue
<template>
  <view class="demo-block">
    <!-- 自定义颜色 -->
    <wd-text color="#ff0000">红色文本</wd-text>
    <wd-text color="#00ff00">绿色文本</wd-text>
    <wd-text color="#0000ff">蓝色文本</wd-text>
    
    <!-- 使用CSS变量 -->
    <wd-text color="var(--wd-color-primary)">主题色文本</wd-text>
  </view>
</template>
```

## 高级功能

### 文本裁剪

```vue
<template>
  <view class="demo-block">
    <!-- 单行裁剪 -->
    <wd-text lines="1" width="200rpx">
      这是一段很长的文本，超出容器宽度时会被裁剪
    </wd-text>
    
    <!-- 多行裁剪 -->
    <wd-text lines="2" width="300rpx">
      这是一段很长的文本，超出两行时会被裁剪，并在末尾显示省略号
    </wd-text>
  </view>
</template>
```

### 文本加粗和斜体

```vue
<template>
  <view class="demo-block">
    <!-- 加粗文本 -->
    <wd-text bold>加粗文本</wd-text>
    
    <!-- 斜体文本 -->
    <wd-text italic>斜体文本</wd-text>
    
    <!-- 加粗斜体 -->
    <wd-text bold italic>加粗斜体文本</wd-text>
  </view>
</template>
```

### 下划线和删除线

```vue
<template>
  <view class="demo-block">
    <!-- 下划线 -->
    <wd-text underline>下划线文本</wd-text>
    
    <!-- 删除线 -->
    <wd-text line-through>删除线文本</wd-text>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 文本类型 | string | default/primary/success/warning/error/info/title/subtitle | default |
| size | 文本大小 | string/number | — | 14 |
| color | 文本颜色 | string | — | — |
| bold | 是否加粗 | boolean | true/false | false |
| italic | 是否斜体 | boolean | true/false | false |
| underline | 是否添加下划线 | boolean | true/false | false |
| line-through | 是否添加删除线 | boolean | true/false | false |
| lines | 显示行数，超出后裁剪 | number | — | — |
| width | 文本容器宽度 | string | — | — |
| align | 文本对齐方式 | string | left/center/right | left |
| custom-class | 自定义类名 | string | — | — |
| custom-style | 自定义样式 | string | — | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击文本时触发 | event |

### Slots

| 名称 | 说明 |
|------|------|
| default | 文本内容 |

## 样式变量

组件提供了下列CSS变量，可用于自定义样式：

```css
:root {
  --wd-text-color-default: #323233;
  --wd-text-color-primary: #1890ff;
  --wd-text-color-success: #52c41a;
  --wd-text-color-warning: #faad14;
  --wd-text-color-error: #f5222d;
  --wd-text-color-info: #909399;
  --wd-text-size-default: 14px;
  --wd-text-line-height: 1.5;
}
```

## 注意事项

1. 当设置 `lines` 属性时，建议同时设置 `width` 属性来限制容器宽度
2. 文本颜色优先级：`color` 属性 > `type` 属性
3. 在小程序中使用时，注意部分样式可能不生效，需要使用原生组件替代
4. 裁剪功能在不同平台可能有细微差异，建议在实际设备上测试