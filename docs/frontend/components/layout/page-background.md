# APageBackground 页面背景组件

用于提供页面背景装饰的根级组件，支持渐变背景、图片背景、浮动装饰元素和多种自定义配置。

## 基础用法

作为页面根标签使用，包装页面内容：

```vue
<template>
  <APageBackground>
    <div class="page-content">
      <!-- 页面内容 -->
    </div>
  </APageBackground>
</template>
```

## 图片背景模式

使用图片作为背景，支持本地和远程图片：

```vue
<template>
  <APageBackground
    background-image="/images/bg.jpg"
    image-position="cover"
    :image-overlay-opacity="0.3"
  >
    <div class="page-content">
      <!-- 页面内容 -->
    </div>
  </APageBackground>
</template>
```

## 自定义渐变色

通过 `gradient-colors` 属性自定义渐变色彩：

```vue
<template>
  <APageBackground
    :gradient-colors="{
      start: '#667eea',
      middle: '#764ba2', 
      end: '#f093fb'
    }"
  >
    <div class="page-content">
      <!-- 页面内容 -->
    </div>
  </APageBackground>
</template>
```

## 禁用浮动装饰

关闭浮动装饰元素，获得更简洁的背景：

```vue
<template>
  <APageBackground :enable-floating-shapes="false">
    <div class="page-content">
      <!-- 页面内容 -->
    </div>
  </APageBackground>
</template>
```

## 组合使用示例

同时使用图片背景和自定义装饰：

```vue
<template>
  <APageBackground
    background-image="https://example.com/bg.jpg"
    image-position="cover"
    :image-overlay-opacity="0.4"
    :enable-floating-shapes="true"
  >
    <div class="min-h-screen flex items-center justify-center">
      <div class="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl">
        <h1 class="text-3xl font-bold text-gray-800">欢迎页面</h1>
        <p class="text-gray-600 mt-4">这是一个带有美丽背景的页面</p>
      </div>
    </div>
  </APageBackground>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| enable-floating-shapes | 是否启用浮动装饰元素 | `boolean` | — | `true` |
| gradient-colors | 自定义渐变色配置 | `GradientColors` | — | `{ start: '#81ecec', middle: '#74b9ff', end: '#0984e3' }` |
| shape-count | 装饰元素数量（预留） | `number` | — | `4` |
| background-image | 背景图片路径 | `string` | — | `''` |
| image-position | 图片显示模式 | `string` | `cover` / `contain` / `center` | `cover` |
| image-overlay-opacity | 图片遮罩透明度 | `number` | `0-1` | `0.3` |

### GradientColors 接口

```typescript
interface GradientColors {
  /** 渐变起始色 */
  start: string
  /** 渐变中间色 */
  middle: string
  /** 渐变结束色 */
  end: string
}
```

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 页面内容区域 |

## 特性

- **双重背景模式**：支持CSS渐变和图片背景两种模式
- **智能遮罩**：图片模式下自动添加渐变遮罩确保内容可读性
- **浮动装饰**：4个带有动画的半透明装饰元素
- **响应式设计**：全屏适配，支持各种设备尺寸
- **性能优化**：使用CSS3动画和`backdrop-filter`实现流畅效果
- **灵活配置**：支持关闭装饰元素，适应不同设计需求

## 样式说明

组件提供以下视觉特性：

### 渐变背景模式
- 默认使用青蓝色调的三色渐变（135度方向）
- 包含三层径向渐变装饰增强视觉层次

### 图片背景模式
- 支持固定背景附着（`background-attachment: fixed`）
- 自动添加与渐变色一致的遮罩层
- 可调节遮罩透明度平衡美观与可读性

### 浮动装饰元素
- 4个不同尺寸的圆角矩形装饰
- 使用`backdrop-filter`实现玻璃质感
- 6秒周期的上下浮动动画，不同延迟营造错落感

## 使用场景

- **登录页面**：提供美观的背景装饰
- **落地页**：增强视觉吸引力
- **仪表板**：营造专业的界面氛围
- **展示页面**：突出内容的重要性
- **错误页面**：减少页面的空白感

## 注意事项

1. 组件设计为页面根级使用，会占据100vh的高度
2. 内容区域会自动层级置于装饰元素之上
3. 图片背景模式下，遮罩透明度建议在0.2-0.5之间以保证可读性
4. 浮动装饰元素使用`pointer-events: none`不会干扰页面交互
5. 建议在内容区域使用半透明背景以确保文字清晰度
6. 组件内部使用`overflow: hidden`防止装饰元素溢出
