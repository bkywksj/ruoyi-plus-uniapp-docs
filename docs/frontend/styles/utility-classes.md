# 工具类

## 介绍

RuoYi-Plus-UniApp 前端项目基于 **UnoCSS** 构建了一套完整的原子化 CSS 工具类系统,提供即时、按需的样式类生成能力。工具类系统通过预设、自定义规则、快捷方式和主题变量的组合,为开发者提供了灵活且高效的样式开发体验。

工具类系统采用"工具类优先"的开发理念,鼓励使用原子化的CSS类来构建界面,而不是编写大量的自定义CSS。这种方式可以显著提高开发效率、减少CSS体积、提升代码可维护性,并确保整个应用的视觉一致性。

**核心特性:**

- **即时生成** - 按需生成CSS,只包含实际使用的样式,极大减小CSS体积和提升加载性能
- **零学习成本** - 基于 Tailwind CSS 语法,熟悉的类名命名方式,无需学习新语法即可上手
- **高度可配置** - 完全可自定义的规则、快捷方式、主题变量和预设,满足各种业务需求
- **主题集成** - 通过 CSS 变量与项目主题系统无缝对接,支持亮色/暗色模式自动切换
- **类型安全** - 完整的 TypeScript 支持,提供类型提示和检查
- **响应式友好** - 内置响应式断点支持,轻松实现各种屏幕尺寸的适配
- **丰富的预设** - 包含 Uno、Attributify、Icons、Typography 等多种预设
- **高性能** - 编译时生成,运行时零开销,相比传统CSS框架性能提升显著

**工具类分类:**

本项目的工具类系统分为以下几个主要类别:

1. **预设工具类** - 来自 `presetUno`,提供完整的 Tailwind CSS 兼容工具类
2. **自定义快捷类** - 通过 `shortcuts` 配置,将常用样式组合封装为简洁类名
3. **主题变量类** - 通过 `theme` 配置,使用项目主题变量的语义化工具类
4. **自定义规则类** - 通过 `rules` 配置,针对特殊需求定义的工具类
5. **属性化模式** - 来自 `presetAttributify`,支持将类名拆分为属性的写法

## 预设工具类

预设工具类来自 UnoCSS 的 `presetUno`,它提供了与 Tailwind CSS 兼容的完整工具类集合。这些工具类覆盖了布局、间距、尺寸、颜色、文本、边框、效果等几乎所有常见的CSS属性。

### 布局工具类

#### Display 显示类型

控制元素的显示类型:

```vue
<template>
  <div class="container">
    <!-- 块级元素 -->
    <div class="block bg-blue-100 p-4">Block Element</div>

    <!-- 行内块元素 -->
    <span class="inline-block bg-green-100 p-4">Inline Block</span>

    <!-- 弹性布局 -->
    <div class="flex items-center justify-between bg-purple-100 p-4">
      <span>Item 1</span>
      <span>Item 2</span>
      <span>Item 3</span>
    </div>

    <!-- 网格布局 -->
    <div class="grid grid-cols-3 gap-4 bg-yellow-100 p-4">
      <div class="bg-white p-2">Grid 1</div>
      <div class="bg-white p-2">Grid 2</div>
      <div class="bg-white p-2">Grid 3</div>
    </div>

    <!-- 隐藏元素 -->
    <div class="hidden">Hidden Element</div>
  </div>
</template>

<script lang="ts" setup>
// 显示类型在响应式设计中很常用
</script>
```

**常用显示类型:**

- `block` - 块级元素 (`display: block`)
- `inline` - 行内元素 (`display: inline`)
- `inline-block` - 行内块元素 (`display: inline-block`)
- `flex` - 弹性布局 (`display: flex`)
- `inline-flex` - 行内弹性布局 (`display: inline-flex`)
- `grid` - 网格布局 (`display: grid`)
- `inline-grid` - 行内网格布局 (`display: inline-grid`)
- `table` - 表格布局 (`display: table`)
- `hidden` - 隐藏元素 (`display: none`)

#### Flexbox 弹性布局

弹性布局是现代网页开发中最常用的布局方式:

```vue
<template>
  <div class="demo-container">
    <!-- 水平居中 -->
    <div class="flex justify-center items-center h-32 bg-blue-50 mb-4">
      <div class="bg-blue-500 text-white px-4 py-2">水平居中内容</div>
    </div>

    <!-- 两端对齐 -->
    <div class="flex justify-between items-center bg-green-50 p-4 mb-4">
      <button class="bg-green-500 text-white px-4 py-2">左侧按钮</button>
      <span>中间文本</span>
      <button class="bg-green-500 text-white px-4 py-2">右侧按钮</button>
    </div>

    <!-- 垂直布局 -->
    <div class="flex flex-col gap-4 bg-purple-50 p-4 mb-4">
      <div class="bg-purple-500 text-white p-4">Item 1</div>
      <div class="bg-purple-500 text-white p-4">Item 2</div>
      <div class="bg-purple-500 text-white p-4">Item 3</div>
    </div>

    <!-- 自动换行 -->
    <div class="flex flex-wrap gap-2 bg-yellow-50 p-4">
      <div class="bg-yellow-500 text-white px-4 py-2" v-for="i in 10" :key="i">
        Tag {{ i }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Flexbox 示例
</script>
```

**常用 Flexbox 工具类:**

**主轴对齐 (justify-*):**
- `justify-start` - 起始对齐
- `justify-center` - 居中对齐
- `justify-end` - 结束对齐
- `justify-between` - 两端对齐,元素之间平均分配空间
- `justify-around` - 环绕对齐,元素周围平均分配空间
- `justify-evenly` - 均匀对齐,所有空间完全相等

**交叉轴对齐 (items-*):**
- `items-start` - 起始对齐
- `items-center` - 居中对齐
- `items-end` - 结束对齐
- `items-baseline` - 基线对齐
- `items-stretch` - 拉伸对齐(默认值)

**方向 (flex-*):**
- `flex-row` - 水平方向 (默认)
- `flex-col` - 垂直方向
- `flex-row-reverse` - 水平反向
- `flex-col-reverse` - 垂直反向

**换行 (flex-wrap):**
- `flex-nowrap` - 不换行 (默认)
- `flex-wrap` - 允许换行
- `flex-wrap-reverse` - 反向换行

**伸缩 (flex):**
- `flex-1` - `flex: 1 1 0%` (自动伸缩,平均分配空间)
- `flex-auto` - `flex: 1 1 auto` (根据内容伸缩)
- `flex-initial` - `flex: 0 1 auto` (初始值)
- `flex-none` - `flex: none` (不伸缩)

#### Grid 网格布局

网格布局提供了强大的二维布局能力:

```vue
<template>
  <div class="demo-grid">
    <!-- 等宽网格 -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-blue-500 text-white p-4 text-center" v-for="i in 8" :key="i">
        {{ i }}
      </div>
    </div>

    <!-- 响应式网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div class="bg-green-500 text-white p-6" v-for="i in 6" :key="i">
        Card {{ i }}
      </div>
    </div>

    <!-- 自动填充网格 -->
    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
      <div class="bg-purple-500 text-white p-6" v-for="i in 5" :key="i">
        Auto {{ i }}
      </div>
    </div>

    <!-- 跨列网格 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="col-span-2 bg-red-500 text-white p-6">跨2列</div>
      <div class="bg-yellow-500 text-white p-6">1列</div>
      <div class="bg-yellow-500 text-white p-6">1列</div>
      <div class="bg-orange-500 text-white p-6">1列</div>
      <div class="col-span-3 bg-pink-500 text-white p-6">跨3列</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Grid 布局示例
</script>
```

**常用 Grid 工具类:**

**列数定义 (grid-cols-*):**
- `grid-cols-1` 到 `grid-cols-12` - 定义1到12列
- `grid-cols-none` - 无网格列

**行数定义 (grid-rows-*):**
- `grid-rows-1` 到 `grid-rows-6` - 定义1到6行
- `grid-rows-none` - 无网格行

**跨列 (col-span-*):**
- `col-span-1` 到 `col-span-12` - 跨越指定列数
- `col-span-full` - 跨越所有列

**跨行 (row-span-*):**
- `row-span-1` 到 `row-span-6` - 跨越指定行数
- `row-span-full` - 跨越所有行

**间距 (gap-*):**
- `gap-0` - 无间距
- `gap-1` - 0.25rem (4px)
- `gap-2` - 0.5rem (8px)
- `gap-4` - 1rem (16px)
- `gap-8` - 2rem (32px)
- 可使用任意数值: `gap-[30px]`

#### Position 定位

定位工具类用于控制元素的定位方式:

```vue
<template>
  <div class="demo-position">
    <!-- 相对定位 -->
    <div class="relative bg-blue-100 h-48 mb-8">
      <div class="absolute top-0 left-0 bg-blue-500 text-white px-4 py-2">
        左上角
      </div>
      <div class="absolute top-0 right-0 bg-green-500 text-white px-4 py-2">
        右上角
      </div>
      <div class="absolute bottom-0 left-0 bg-purple-500 text-white px-4 py-2">
        左下角
      </div>
      <div class="absolute bottom-0 right-0 bg-red-500 text-white px-4 py-2">
        右下角
      </div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-2">
        居中
      </div>
    </div>

    <!-- 固定定位 -->
    <div class="fixed bottom-4 right-4 bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg">
      固定按钮
    </div>

    <!-- 粘性定位 -->
    <div class="sticky top-0 bg-green-500 text-white p-4 z-10">
      粘性头部 (滚动时会固定在顶部)
    </div>
  </div>
</template>

<script lang="ts" setup>
// 定位示例
</script>
```

**常用定位工具类:**

**定位类型:**
- `static` - 静态定位 (默认)
- `relative` - 相对定位
- `absolute` - 绝对定位
- `fixed` - 固定定位
- `sticky` - 粘性定位

**位置控制:**
- `top-0`, `right-0`, `bottom-0`, `left-0` - 边缘对齐
- `top-1/2`, `left-1/2` - 50%位置
- `inset-0` - 同时设置 top、right、bottom、left 为 0

**层级控制:**
- `z-0` 到 `z-50` - Z轴层级
- `z-auto` - 自动层级

### 间距工具类

间距工具类控制元素的内外边距,是最常用的工具类之一。

#### Padding 内边距

```vue
<template>
  <div class="demo-padding">
    <!-- 全方向内边距 -->
    <div class="p-4 bg-blue-100 mb-4">
      <div class="bg-blue-500 text-white">p-4 (1rem / 16px)</div>
    </div>

    <!-- 单方向内边距 -->
    <div class="pt-8 pr-4 pb-2 pl-6 bg-green-100 mb-4">
      <div class="bg-green-500 text-white">不同方向的内边距</div>
    </div>

    <!-- 水平/垂直内边距 -->
    <div class="px-8 py-4 bg-purple-100 mb-4">
      <div class="bg-purple-500 text-white">px-8 py-4</div>
    </div>

    <!-- 任意值内边距 -->
    <div class="p-[24px] bg-yellow-100">
      <div class="bg-yellow-500 text-white">自定义值 24px</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 内边距示例
</script>
```

**内边距工具类语法:**

- `p-{size}` - 全方向内边距
- `px-{size}` - 水平方向 (左右)
- `py-{size}` - 垂直方向 (上下)
- `pt-{size}` - 上内边距
- `pr-{size}` - 右内边距
- `pb-{size}` - 下内边距
- `pl-{size}` - 左内边距

**尺寸对应关系:**

- `0` - 0px
- `1` - 0.25rem (4px)
- `2` - 0.5rem (8px)
- `3` - 0.75rem (12px)
- `4` - 1rem (16px)
- `5` - 1.25rem (20px)
- `6` - 1.5rem (24px)
- `8` - 2rem (32px)
- `10` - 2.5rem (40px)
- `12` - 3rem (48px)
- `16` - 4rem (64px)

#### Margin 外边距

```vue
<template>
  <div class="demo-margin">
    <!-- 正值外边距 -->
    <div class="m-4 bg-blue-500 text-white p-4">m-4</div>
    <div class="mt-8 mb-4 bg-green-500 text-white p-4">mt-8 mb-4</div>

    <!-- 负值外边距 -->
    <div class="bg-gray-100 p-8">
      <div class="-mt-4 bg-red-500 text-white p-4">负值 -mt-4</div>
    </div>

    <!-- 自动外边距 (水平居中) -->
    <div class="mx-auto w-64 bg-purple-500 text-white p-4 text-center">
      mx-auto 水平居中
    </div>
  </div>
</template>

<script lang="ts" setup>
// 外边距示例
</script>
```

**外边距工具类语法:**

- `m-{size}` - 全方向外边距
- `mx-{size}` - 水平方向
- `my-{size}` - 垂直方向
- `mt-{size}` - 上外边距
- `mr-{size}` - 右外边距
- `mb-{size}` - 下外边距
- `ml-{size}` - 左外边距
- `-m-{size}` - 负外边距
- `mx-auto` - 水平自动 (居中)

### 尺寸工具类

#### Width 宽度

```vue
<template>
  <div class="demo-width">
    <!-- 固定宽度 -->
    <div class="w-32 bg-blue-500 text-white p-2 mb-4">w-32 (8rem)</div>
    <div class="w-64 bg-green-500 text-white p-2 mb-4">w-64 (16rem)</div>

    <!-- 百分比宽度 -->
    <div class="w-1/2 bg-purple-500 text-white p-2 mb-4">w-1/2 (50%)</div>
    <div class="w-full bg-red-500 text-white p-2 mb-4">w-full (100%)</div>

    <!-- 视口宽度 -->
    <div class="w-screen bg-yellow-500 text-white p-2 mb-4">w-screen (100vw)</div>

    <!-- 最小/最大宽度 -->
    <div class="min-w-64 max-w-xl bg-indigo-500 text-white p-2">
      min-w-64 max-w-xl
    </div>
  </div>
</template>

<script lang="ts" setup>
// 宽度示例
</script>
```

**常用宽度工具类:**

- `w-{size}` - 固定宽度 (如 `w-32` = 8rem)
- `w-1/2`, `w-1/3`, `w-2/3`, `w-1/4` 等 - 分数宽度
- `w-full` - 100%
- `w-screen` - 100vw
- `w-auto` - 自动宽度
- `min-w-{size}` - 最小宽度
- `max-w-{size}` - 最大宽度

#### Height 高度

```vue
<template>
  <div class="demo-height">
    <!-- 固定高度 -->
    <div class="h-32 bg-blue-500 text-white p-4 mb-4">h-32</div>

    <!-- 百分比高度 -->
    <div class="relative h-64 bg-gray-200">
      <div class="h-1/2 bg-green-500 text-white p-4">h-1/2</div>
    </div>

    <!-- 视口高度 -->
    <div class="h-screen bg-purple-500 text-white p-4">h-screen (全屏)</div>
  </div>
</template>

<script lang="ts" setup>
// 高度示例
</script>
```

**常用高度工具类:**

- `h-{size}` - 固定高度
- `h-1/2`, `h-1/3`, `h-full` 等 - 分数高度
- `h-screen` - 100vh
- `h-auto` - 自动高度
- `min-h-{size}` - 最小高度
- `max-h-{size}` - 最大高度

### 颜色工具类

UnoCSS 提供了丰富的颜色工具类,支持多种颜色调色板。

#### 文本颜色

```vue
<template>
  <div class="demo-text-color space-y-2">
    <!-- 标准颜色 -->
    <p class="text-red-500">红色文本 text-red-500</p>
    <p class="text-green-600">绿色文本 text-green-600</p>
    <p class="text-blue-700">蓝色文本 text-blue-700</p>

    <!-- 灰度 -->
    <p class="text-gray-400">浅灰文本 text-gray-400</p>
    <p class="text-gray-600">中灰文本 text-gray-600</p>
    <p class="text-gray-900">深灰文本 text-gray-900</p>

    <!-- 透明度 -->
    <p class="text-blue-500/50">50%透明度</p>
    <p class="text-blue-500/80">80%透明度</p>

    <!-- 任意值 -->
    <p class="text-[#FF6B6B]">自定义颜色 #FF6B6B</p>
  </div>
</template>

<script lang="ts" setup>
// 文本颜色示例
</script>
```

#### 背景颜色

```vue
<template>
  <div class="demo-bg-color space-y-2">
    <!-- 纯色背景 -->
    <div class="bg-red-100 text-red-900 p-4">浅红背景</div>
    <div class="bg-blue-500 text-white p-4">蓝色背景</div>
    <div class="bg-green-700 text-white p-4">深绿背景</div>

    <!-- 渐变背景 -->
    <div class="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-4">
      渐变背景
    </div>

    <!-- 透明背景 -->
    <div class="bg-black/20 p-4">20%黑色透明背景</div>
  </div>
</template>

<script lang="ts" setup>
// 背景颜色示例
</script>
```

**颜色调色板:**

UnoCSS 默认提供以下颜色,每种颜色有 50-950 的亮度等级:

- `gray`, `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `indigo`, `purple`, `pink`

**颜色工具类语法:**

- `text-{color}-{level}` - 文本颜色
- `bg-{color}-{level}` - 背景颜色
- `border-{color}-{level}` - 边框颜色
- `{color}-{level}/{opacity}` - 带透明度的颜色

### 文本工具类

#### 字体大小

```vue
<template>
  <div class="demo-text-size space-y-2">
    <p class="text-xs">超小字体 text-xs (0.75rem)</p>
    <p class="text-sm">小字体 text-sm (0.875rem)</p>
    <p class="text-base">基础字体 text-base (1rem)</p>
    <p class="text-lg">大字体 text-lg (1.125rem)</p>
    <p class="text-xl">超大字体 text-xl (1.25rem)</p>
    <p class="text-2xl">2倍大字体 text-2xl (1.5rem)</p>
    <p class="text-3xl">3倍大字体 text-3xl (1.875rem)</p>
    <p class="text-4xl">4倍大字体 text-4xl (2.25rem)</p>

    <!-- 任意值 -->
    <p class="text-[18px]">自定义大小 18px</p>
  </div>
</template>

<script lang="ts" setup>
// 字体大小示例
</script>
```

#### 字重和样式

```vue
<template>
  <div class="demo-text-style space-y-2">
    <!-- 字重 -->
    <p class="font-light">细字重 font-light (300)</p>
    <p class="font-normal">正常字重 font-normal (400)</p>
    <p class="font-medium">中等字重 font-medium (500)</p>
    <p class="font-semibold">半粗字重 font-semibold (600)</p>
    <p class="font-bold">粗字重 font-bold (700)</p>

    <!-- 字体样式 -->
    <p class="italic">斜体 italic</p>
    <p class="not-italic">非斜体 not-italic</p>

    <!-- 文本装饰 -->
    <p class="underline">下划线 underline</p>
    <p class="line-through">删除线 line-through</p>
    <p class="no-underline">无装饰 no-underline</p>
  </div>
</template>

<script lang="ts" setup>
// 字重和样式示例
</script>
```

#### 文本对齐

```vue
<template>
  <div class="demo-text-align space-y-4">
    <div class="text-left border p-4">左对齐 text-left</div>
    <div class="text-center border p-4">居中对齐 text-center</div>
    <div class="text-right border p-4">右对齐 text-right</div>
    <div class="text-justify border p-4">
      两端对齐 text-justify - 这是一段很长的文本用来演示两端对齐的效果,
      文本会在行尾自动对齐到容器边缘。
    </div>
  </div>
</template>

<script lang="ts" setup>
// 文本对齐示例
</script>
```

### 边框工具类

```vue
<template>
  <div class="demo-border space-y-4">
    <!-- 基础边框 -->
    <div class="border border-gray-300 p-4">默认边框</div>

    <!-- 单边边框 -->
    <div class="border-t-2 border-blue-500 p-4">顶部边框</div>
    <div class="border-r-4 border-green-500 p-4">右侧边框</div>
    <div class="border-b border-red-500 p-4">底部边框</div>
    <div class="border-l-8 border-purple-500 p-4">左侧边框</div>

    <!-- 圆角 -->
    <div class="border border-gray-300 rounded p-4">小圆角 rounded</div>
    <div class="border border-gray-300 rounded-lg p-4">大圆角 rounded-lg</div>
    <div class="border border-gray-300 rounded-full p-4 w-32 h-32 flex items-center justify-center">
      圆形
    </div>

    <!-- 边框样式 -->
    <div class="border-2 border-dashed border-gray-400 p-4">虚线边框</div>
    <div class="border-2 border-dotted border-gray-400 p-4">点状边框</div>
  </div>
</template>

<script lang="ts" setup>
// 边框示例
</script>
```

**常用边框工具类:**

**边框宽度:**
- `border` - 1px边框
- `border-0` - 无边框
- `border-2`, `border-4`, `border-8` - 指定宽度
- `border-t-{width}`, `border-r-{width}` 等 - 单边边框

**边框样式:**
- `border-solid` - 实线 (默认)
- `border-dashed` - 虚线
- `border-dotted` - 点状
- `border-double` - 双线
- `border-none` - 无边框

**圆角:**
- `rounded` - 0.25rem
- `rounded-md` - 0.375rem
- `rounded-lg` - 0.5rem
- `rounded-xl` - 0.75rem
- `rounded-2xl` - 1rem
- `rounded-full` - 9999px (圆形)
- `rounded-t-{size}`, `rounded-r-{size}` 等 - 单角圆角

### 效果工具类

#### 阴影

```vue
<template>
  <div class="demo-shadow space-y-8 p-8">
    <!-- 盒阴影 -->
    <div class="shadow-sm bg-white p-4">微小阴影 shadow-sm</div>
    <div class="shadow bg-white p-4">标准阴影 shadow</div>
    <div class="shadow-md bg-white p-4">中等阴影 shadow-md</div>
    <div class="shadow-lg bg-white p-4">大阴影 shadow-lg</div>
    <div class="shadow-xl bg-white p-4">超大阴影 shadow-xl</div>
    <div class="shadow-2xl bg-white p-4">2倍大阴影 shadow-2xl</div>

    <!-- 无阴影 -->
    <div class="shadow-none bg-white p-4 border">无阴影 shadow-none</div>

    <!-- 内阴影 -->
    <div class="shadow-inner bg-gray-100 p-4">内阴影 shadow-inner</div>
  </div>
</template>

<script lang="ts" setup>
// 阴影示例
</script>
```

#### 不透明度

```vue
<template>
  <div class="demo-opacity space-y-4">
    <div class="bg-blue-500 text-white p-4 opacity-100">完全不透明 opacity-100</div>
    <div class="bg-blue-500 text-white p-4 opacity-75">75%不透明 opacity-75</div>
    <div class="bg-blue-500 text-white p-4 opacity-50">50%不透明 opacity-50</div>
    <div class="bg-blue-500 text-white p-4 opacity-25">25%不透明 opacity-25</div>
    <div class="bg-blue-500 text-white p-4 opacity-0">完全透明 opacity-0</div>
  </div>
</template>

<script lang="ts" setup>
// 不透明度示例
</script>
```

## 自定义快捷类

项目通过 UnoCSS 的 `shortcuts` 配置定义了一系列自定义快捷类,将常用的样式组合封装为简洁的类名,提高开发效率。

### 布局快捷类

#### flex-center 居中布局

完美居中的弹性布局,用于快速实现内容的水平和垂直居中:

```vue
<template>
  <div class="demo-flex-center">
    <!-- 卡片内容居中 -->
    <div class="flex-center h-64 bg-blue-50 border-2 border-blue-200 rounded-lg">
      <div class="text-center">
        <div class="text-4xl mb-2">🎯</div>
        <p class="text-lg font-medium text-blue-600">完美居中的内容</p>
      </div>
    </div>

    <!-- 按钮居中 -->
    <div class="flex-center h-32 bg-gray-50 mt-4">
      <button class="bg-blue-500 text-white px-6 py-3 rounded-lg">
        居中按钮
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
// flex-center 等价于: flex items-center justify-center
</script>
```

**使用说明:**

- `flex-center` 等价于 `flex items-center justify-center`
- 适用于需要完美居中内容的场景
- 常用于卡片、对话框、加载状态等

#### flex-between 两端对齐

两端对齐的弹性布局,左右元素分别靠边,常用于标题栏、工具栏等:

```vue
<template>
  <div class="demo-flex-between space-y-4">
    <!-- 页面头部 -->
    <div class="flex-between bg-white p-4 border-b">
      <h1 class="text-xl font-bold">页面标题</h1>
      <div class="flex gap-2">
        <button class="bg-gray-200 px-4 py-2 rounded">取消</button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded">保存</button>
      </div>
    </div>

    <!-- 列表项 -->
    <div class="flex-between bg-gray-50 p-4 rounded">
      <div>
        <p class="font-medium">商品名称</p>
        <p class="text-sm text-gray-500">商品描述信息</p>
      </div>
      <div class="text-right">
        <p class="text-lg font-bold text-red-500">¥99.00</p>
        <p class="text-sm text-gray-500">库存: 100</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="flex-between bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
      <div>
        <p class="text-sm opacity-90">总访问量</p>
        <p class="text-3xl font-bold mt-1">1,234</p>
      </div>
      <div class="text-5xl opacity-50">📊</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// flex-between 等价于: flex items-center justify-between
</script>
```

**使用说明:**

- `flex-between` 等价于 `flex items-center justify-between`
- 适用于需要两端对齐的布局场景
- 常用于标题栏、卡片头部、列表项等

#### absolute-center 绝对定位居中

使用绝对定位实现元素的完美居中:

```vue
<template>
  <div class="demo-absolute-center">
    <!-- 容器需要设置 relative -->
    <div class="relative h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
      <!-- 居中的对话框 -->
      <div class="absolute-center bg-white p-8 rounded-lg shadow-xl w-80">
        <h3 class="text-xl font-bold mb-4">对话框标题</h3>
        <p class="text-gray-600 mb-4">这是一个完美居中的对话框内容。</p>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 border rounded">取消</button>
          <button class="px-4 py-2 bg-purple-500 text-white rounded">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// absolute-center 等价于: absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
</script>
```

**使用说明:**

- `absolute-center` 使用 transform 实现完美居中
- 父元素需要设置 `position: relative`
- 适用于对话框、遮罩层内容等

### 容器快捷类

#### card 卡片容器

标准的卡片容器样式,包含背景色、圆角、阴影和内边距:

```vue
<template>
  <div class="demo-card space-y-4">
    <!-- 基础卡片 -->
    <div class="card">
      <h3 class="text-lg font-bold mb-2">基础卡片</h3>
      <p class="text-gray-600">这是一个使用 card 快捷类创建的卡片容器。</p>
    </div>

    <!-- 信息卡片 -->
    <div class="card">
      <div class="flex items-start gap-4">
        <div class="text-4xl">ℹ️</div>
        <div class="flex-1">
          <h4 class="font-bold mb-1">提示信息</h4>
          <p class="text-sm text-gray-600">
            这里是卡片的详细内容,可以包含任意的文本、图片或其他元素。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// card 等价于: bg-white dark:bg-dark-800 rounded shadow p-4
// 自动支持暗色模式
</script>
```

**使用说明:**

- `card` 提供了标准的卡片样式
- 自动支持亮色/暗色模式切换
- 常用于内容展示、表单容器等

### 标签快捷类

#### tag 标签基础样式

标签的基础样式,可以与颜色类组合使用:

```vue
<template>
  <div class="demo-tag space-y-4">
    <!-- 基础标签 -->
    <div class="flex flex-wrap gap-2">
      <span class="tag bg-blue-100 text-blue-700">蓝色标签</span>
      <span class="tag bg-green-100 text-green-700">绿色标签</span>
      <span class="tag bg-red-100 text-red-700">红色标签</span>
      <span class="tag bg-yellow-100 text-yellow-700">黄色标签</span>
      <span class="tag bg-purple-100 text-purple-700">紫色标签</span>
    </div>

    <!-- 状态标签 -->
    <div class="flex gap-2">
      <span class="tag bg-green-500 text-white">已完成</span>
      <span class="tag bg-yellow-500 text-white">进行中</span>
      <span class="tag bg-red-500 text-white">已取消</span>
      <span class="tag bg-gray-500 text-white">已关闭</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// tag 等价于: inline-block px-2 py-1 text-xs rounded
</script>
```

**使用说明:**

- `tag` 提供标签的基础样式
- 需要配合颜色类使用
- 适用于状态标识、分类标签等

### panel-title 面板标题

专门用于面板标题的样式类:

```vue
<template>
  <div class="demo-panel">
    <div class="bg-white p-6 rounded-lg border">
      <h3 class="panel-title">用户信息</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">姓名:</span>
          <span>张三</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">邮箱:</span>
          <span>zhangsan@example.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// panel-title 提供统一的面板标题样式
</script>
```

## 主题变量类

项目通过 UnoCSS 的 `theme` 配置定义了与主题系统集成的语义化工具类,这些类通过 CSS 变量实现,支持亮色/暗色模式自动切换。

### 颜色变量类

#### 状态颜色

```vue
<template>
  <div class="demo-theme-colors space-y-4">
    <!-- 主题色 -->
    <div class="bg-primary text-white p-4 rounded">
      bg-primary - 主题色背景
    </div>

    <!-- 状态颜色 -->
    <div class="flex gap-4">
      <div class="bg-success text-white px-4 py-2 rounded">成功</div>
      <div class="bg-warning text-white px-4 py-2 rounded">警告</div>
      <div class="bg-danger text-white px-4 py-2 rounded">危险</div>
      <div class="bg-info text-white px-4 py-2 rounded">信息</div>
    </div>

    <!-- 文本颜色 -->
    <div class="space-y-2">
      <p class="text-text-base">基础文本颜色</p>
      <p class="text-text-secondary">次要文本颜色</p>
      <p class="text-text-muted">弱化文本颜色</p>
      <p class="text-heading text-xl font-bold">标题文本颜色</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 这些颜色通过CSS变量定义,自动支持主题切换
</script>
```

**可用的主题颜色类:**

**状态颜色:**
- `bg-primary` / `text-primary` - 主题色
- `bg-success` / `text-success` - 成功状态
- `bg-warning` / `text-warning` - 警告状态
- `bg-danger` / `text-danger` - 危险/错误状态
- `bg-info` / `text-info` - 信息/提示状态

**文本颜色:**
- `text-text-base` - 基础文本颜色
- `text-text-secondary` - 次要文本颜色
- `text-text-muted` - 弱化文本颜色
- `text-heading` - 标题文本颜色

**边框颜色:**
- `border-border` - 标准边框颜色
- `border-border-light` - 浅色边框
- `border-border-lighter` - 更浅的边框颜色

**背景颜色:**
- `bg-bg-base` - 基础背景颜色
- `bg-bg-page` - 页面背景颜色
- `bg-bg-overlay` - 覆盖层背景颜色

### 间距变量类

```vue
<template>
  <div class="demo-theme-spacing">
    <!-- 侧边栏宽度 -->
    <div class="w-sidebar bg-blue-100 p-4">
      侧边栏宽度 (var(--sidebar-width))
    </div>

    <!-- 头部高度 -->
    <div class="h-header bg-green-100 p-4 flex items-center">
      头部高度 (var(--header-height))
    </div>

    <!-- 标签视图高度 -->
    <div class="h-tags-view bg-purple-100 p-4 flex items-center">
      标签视图高度 (var(--tags-view-height))
    </div>
  </div>
</template>

<script lang="ts" setup>
// 间距变量类使用项目定义的布局尺寸
</script>
```

**可用的间距变量类:**

- `w-sidebar` / `p-sidebar` - 侧边栏宽度
- `h-header` / `p-header` - 头部高度
- `h-tags-view` / `p-tags-view` - 标签视图高度

### 菜单颜色类

```vue
<template>
  <div class="demo-menu-colors">
    <!-- 菜单样式 -->
    <div class="bg-menu-bg text-menu-text p-4 space-y-2">
      <div class="hover:bg-menu-hover p-2 rounded cursor-pointer">
        菜单项 1
      </div>
      <div class="bg-menu-hover text-menu-active p-2 rounded">
        激活的菜单项
      </div>
      <div class="hover:bg-menu-hover p-2 rounded cursor-pointer">
        菜单项 2
      </div>
    </div>

    <!-- 子菜单样式 -->
    <div class="bg-submenu-bg p-4 space-y-2">
      <div class="hover:bg-submenu-hover p-2 rounded cursor-pointer">
        子菜单项 1
      </div>
      <div class="bg-submenu-hover text-submenu-active p-2 rounded">
        激活的子菜单项
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 菜单颜色类用于侧边栏菜单的样式定制
</script>
```

**可用的菜单颜色类:**

**主菜单:**
- `bg-menu-bg` - 菜单背景色
- `text-menu-text` - 菜单文本颜色
- `text-menu-active` - 菜单激活项文本颜色
- `bg-menu-hover` - 菜单悬停背景色

**子菜单:**
- `bg-submenu-bg` - 子菜单背景色
- `text-submenu-active` - 子菜单激活项文本颜色
- `bg-submenu-hover` - 子菜单悬停背景色

## 自定义规则类

项目通过 UnoCSS 的 `rules` 配置定义了一些无法用预设满足的特殊工具类。

### 布局规则类

```vue
<template>
  <div class="demo-custom-rules">
    <!-- 侧边栏宽度 -->
    <div class="sidebar-width bg-blue-100 p-4">
      sidebar-width - 使用CSS变量的侧边栏宽度
    </div>

    <!-- 头部高度 -->
    <div class="header-height bg-green-100 p-4 flex items-center">
      header-height - 使用CSS变量的头部高度
    </div>
  </div>
</template>

<script lang="ts" setup>
// 这些规则类直接使用项目的CSS变量
</script>
```

**可用的布局规则类:**

- `sidebar-width` - 侧边栏宽度 (`width: var(--sidebar-width)`)
- `header-height` - 头部高度 (`height: var(--header-height)`)

### 滚动条规则类

```vue
<template>
  <div class="demo-scrollbar space-y-4">
    <!-- 双向滚动 -->
    <div class="scrollbar h-48 w-96 bg-gray-100 p-4">
      <div class="w-[600px] h-[300px] bg-gradient-to-br from-blue-400 to-purple-500">
        scrollbar - 双向滚动区域
      </div>
    </div>

    <!-- 垂直滚动 -->
    <div class="scrollbar-y h-48 bg-gray-100 p-4">
      <div class="space-y-2">
        <div v-for="i in 20" :key="i" class="bg-blue-100 p-2">
          Item {{ i }}
        </div>
      </div>
    </div>

    <!-- 水平滚动 -->
    <div class="scrollbar-x w-96 bg-gray-100 p-4">
      <div class="flex gap-2 w-max">
        <div v-for="i in 20" :key="i" class="bg-green-100 p-4 w-32 flex-shrink-0">
          Item {{ i }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 滚动条规则类用于控制滚动方向
</script>
```

**可用的滚动条规则类:**

- `scrollbar` - 启用双向滚动条 (`overflow: auto`)
- `scrollbar-y` - 仅垂直滚动条 (`overflow-y: auto; overflow-x: hidden`)
- `scrollbar-x` - 仅水平滚动条 (`overflow-x: auto; overflow-y: hidden`)

### 文本处理规则类

```vue
<template>
  <div class="demo-text-rules space-y-4">
    <!-- 单行文本省略 -->
    <div class="text-ellipsis w-64 bg-blue-100 p-4">
      这是一段很长的文本内容,超出容器宽度的部分会被省略并显示省略号...
    </div>

    <!-- 多行文本省略 (2行) -->
    <div class="line-clamp-2 w-64 bg-green-100 p-4">
      这是一段很长的文本内容,会在第二行被截断并显示省略号。
      这部分内容会被隐藏,不会显示出来。
      还有更多的内容也不会显示。
    </div>
  </div>
</template>

<script lang="ts" setup>
// 文本处理规则类用于文本溢出处理
</script>
```

**可用的文本处理规则类:**

- `text-ellipsis` - 单行文本省略,超出显示省略号
- `line-clamp-2` - 多行文本省略,显示2行后截断

### 定位规则类

```vue
<template>
  <div class="demo-position-rules">
    <div class="relative h-64 bg-gray-200">
      <div class="relative-full bg-blue-100 p-4">
        relative-full - 相对定位且填满容器 (position: relative; width: 100%; height: 100%)
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 定位规则类
</script>
```

**可用的定位规则类:**

- `relative-full` - 相对定位且填满容器

## 响应式工具类

UnoCSS 提供了完整的响应式设计支持,可以根据屏幕尺寸应用不同的样式。

### 响应式断点

项目定义了以下响应式断点:

- `sm` - ≥768px (平板)
- `md` - ≥992px (小型桌面)
- `lg` - ≥1200px (桌面)
- `xl` - ≥1920px (大屏)

### 响应式语法

```vue
<template>
  <div class="demo-responsive">
    <!-- 响应式布局 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-blue-500 text-white p-6 rounded text-center">
        Card {{ i }}
      </div>
    </div>

    <!-- 响应式隐藏/显示 -->
    <div class="mt-8 space-y-4">
      <div class="bg-green-500 text-white p-4 rounded sm:hidden">
        仅在小屏幕显示 (< 768px)
      </div>
      <div class="bg-blue-500 text-white p-4 rounded hidden sm:block md:hidden">
        仅在平板显示 (768px ~ 992px)
      </div>
      <div class="bg-purple-500 text-white p-4 rounded hidden md:block">
        仅在桌面显示 (≥ 992px)
      </div>
    </div>

    <!-- 响应式文本大小 -->
    <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-8">
      响应式标题
    </h1>

    <!-- 响应式间距 -->
    <div class="p-4 sm:p-6 md:p-8 lg:p-12 bg-yellow-100 mt-4">
      响应式内边距
    </div>
  </div>
</template>

<script lang="ts" setup>
// 响应式工具类使用断点前缀
</script>
```

**响应式工具类语法:**

在任何工具类前添加断点前缀即可实现响应式:

```
{breakpoint}:{utility-class}
```

**示例:**

- `sm:text-center` - 在 ≥768px 时文本居中
- `md:flex` - 在 ≥992px 时使用弹性布局
- `lg:w-1/2` - 在 ≥1200px 时宽度为 50%
- `xl:text-4xl` - 在 ≥1920px 时文本超大

## 属性化模式

UnoCSS 的 `presetAttributify` 预设支持将类名拆分为属性的写法,使 HTML 更加简洁和语义化。

### 基础用法

```vue
<template>
  <div class="demo-attributify">
    <!-- 传统写法 -->
    <div class="flex items-center justify-center bg-blue-500 text-white p-4 rounded-lg">
      传统写法
    </div>

    <!-- 属性化写法 -->
    <div
      flex="~ items-center justify-center"
      bg="blue-500"
      text="white"
      p="4"
      rounded="lg"
    >
      属性化写法
    </div>

    <!-- 混合使用 -->
    <div
      class="shadow-lg"
      flex="~ col gap-4"
      p="6"
      bg="gradient-to-r from-purple-500 to-pink-500"
      text="white"
    >
      <h3 text="2xl" font="bold">混合写法</h3>
      <p text="sm">可以同时使用 class 和属性化写法</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 属性化模式使 HTML 更加清晰
</script>
```

**属性化模式语法:**

- `flex="~"` - 等价于 `class="flex"`
- `text="xl blue-500"` - 等价于 `class="text-xl text-blue-500"`
- `p="4"` - 等价于 `class="p-4"`
- `bg="gradient-to-r from-blue-500"` - 等价于 `class="bg-gradient-to-r from-blue-500"`

**注意事项:**

- 属性名对应类名的前缀部分
- 属性值可以包含多个值,用空格分隔
- `~` 符号表示该属性本身(如 `flex="~"` 表示 `flex` 类)

## 变体和伪类

UnoCSS 支持各种 CSS 伪类和变体,用于处理交互状态和特殊场景。

### 交互状态

```vue
<template>
  <div class="demo-variants space-y-4">
    <!-- Hover 悬停 -->
    <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded transition">
      悬停时变色
    </button>

    <!-- Focus 聚焦 -->
    <input
      type="text"
      placeholder="聚焦时显示边框"
      class="border-2 border-gray-300 focus:border-blue-500 focus:outline-none px-4 py-2 rounded w-full"
    />

    <!-- Active 激活 -->
    <button class="bg-green-500 active:bg-green-700 text-white px-6 py-3 rounded">
      点击时变色
    </button>

    <!-- Disabled 禁用 -->
    <button disabled class="bg-gray-300 disabled:opacity-50 text-gray-600 px-6 py-3 rounded cursor-not-allowed">
      禁用按钮
    </button>
  </div>
</template>

<script lang="ts" setup>
// 伪类变体用于交互状态
</script>
```

**常用交互变体:**

- `hover:` - 鼠标悬停
- `focus:` - 获得焦点
- `active:` - 激活/按下
- `disabled:` - 禁用状态
- `focus-within:` - 内部元素获得焦点
- `focus-visible:` - 键盘导航焦点

### 暗色模式

```vue
<template>
  <div class="demo-dark-mode">
    <!-- 自动适应暗色模式 -->
    <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg">
      <h3 class="text-xl font-bold mb-2">自动暗色模式</h3>
      <p class="text-gray-600 dark:text-gray-300">
        这个卡片会根据系统主题自动切换颜色
      </p>
    </div>

    <!-- 按钮暗色模式 -->
    <button class="bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white px-6 py-3 rounded mt-4">
      按钮暗色模式
    </button>
  </div>
</template>

<script lang="ts" setup>
// dark: 变体用于暗色模式样式
</script>
```

**暗色模式变体:**

- `dark:` - 暗色模式下的样式
- 可与其他变体组合: `dark:hover:bg-gray-700`

### 组合变体

```vue
<template>
  <div class="demo-variant-group">
    <!-- 组合多个变体 -->
    <button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded transition">
      多状态按钮
    </button>

    <!-- 使用变体组简化 (需要 transformerVariantGroup) -->
    <button class="bg-blue-500 hover:(bg-blue-600 scale-105) active:(bg-blue-800 scale-95) text-white px-6 py-3 rounded transition">
      变体组写法
    </button>
  </div>
</template>

<script lang="ts" setup>
// 变体可以组合使用
</script>
```

## 最佳实践

### 1. 优先使用预设工具类

始终优先使用 UnoCSS 预设提供的标准工具类,而不是自定义样式:

```vue
<!-- ✅ 推荐 -->
<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
    <h3 class="text-lg font-bold">标题</h3>
    <button class="bg-blue-500 text-white px-4 py-2 rounded">按钮</button>
  </div>
</template>

<!-- ❌ 不推荐 -->
<template>
  <div class="custom-header">
    <h3>标题</h3>
    <button class="custom-button">按钮</button>
  </div>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
```

### 2. 使用快捷类简化代码

对于频繁使用的样式组合,使用自定义快捷类:

```vue
<!-- ✅ 推荐 -->
<template>
  <div class="flex-center h-64">
    <p>居中内容</p>
  </div>
</template>

<!-- ❌ 不推荐 -->
<template>
  <div class="flex items-center justify-center h-64">
    <p>居中内容</p>
  </div>
</template>
```

### 3. 使用主题变量类

使用主题变量类而不是硬编码颜色值,以支持主题切换:

```vue
<!-- ✅ 推荐 -->
<template>
  <div class="bg-primary text-white p-4">
    <p class="text-text-secondary">次要文本</p>
  </div>
</template>

<!-- ❌ 不推荐 -->
<template>
  <div class="bg-[#409eff] text-white p-4">
    <p class="text-gray-500">次要文本</p>
  </div>
</template>
```

### 4. 合理使用响应式工具类

根据内容和布局需求,合理设置响应式断点:

```vue
<!-- ✅ 推荐 -->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- 移动端1列,平板2列,桌面3列 -->
  </div>
</template>

<!-- ❌ 不推荐 - 所有屏幕都强制3列 -->
<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- 在小屏幕上可能显示不佳 -->
  </div>
</template>
```

### 5. 避免过度嵌套

保持标记简洁,避免不必要的包装元素:

```vue
<!-- ✅ 推荐 -->
<template>
  <button class="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded">
    <span class="i-carbon-add"></span>
    添加
  </button>
</template>

<!-- ❌ 不推荐 -->
<template>
  <div class="button-wrapper">
    <div class="button-inner">
      <button class="button">
        <div class="button-content">
          <span class="icon i-carbon-add"></span>
          <span class="text">添加</span>
        </div>
      </button>
    </div>
  </div>
</template>
```

## 常见问题

### 1. 工具类不生效

**问题描述:**

添加的工具类在页面上不生效,或者样式显示不正确。

**可能原因:**

- 类名拼写错误
- 类名未被 UnoCSS 扫描到
- 样式被其他CSS覆盖
- 使用了不存在的工具类

**解决方案:**

```vue
<!-- ✅ 正确 -->
<template>
  <div class="flex items-center justify-center">
    内容
  </div>
</template>

<!-- ❌ 错误 - 类名拼写错误 -->
<template>
  <div class="flex item-center justfy-center">
    内容
  </div>
</template>
```

**检查步骤:**

1. 检查类名拼写是否正确
2. 确认 UnoCSS 配置中包含了该类所需的预设
3. 使用浏览器开发工具检查元素是否正确应用了样式
4. 检查是否有其他样式覆盖了工具类

### 2. 任意值语法不生效

**问题描述:**

使用方括号语法定义任意值时不生效。

**可能原因:**

- 语法错误
- 值的单位缺失或不正确
- 特殊字符未正确转义

**解决方案:**

```vue
<!-- ✅ 正确 -->
<template>
  <div class="w-[500px] h-[300px] text-[18px] bg-[#FF6B6B]">
    任意值
  </div>
</template>

<!-- ❌ 错误 - 缺少单位或格式不正确 -->
<template>
  <div class="w-[500] h-[300] text-[18] bg-[FF6B6B]">
    任意值
  </div>
</template>
```

### 3. 响应式断点不生效

**问题描述:**

响应式工具类在不同屏幕尺寸下没有按预期工作。

**可能原因:**

- 断点前缀使用错误
- 浏览器窗口尺寸未达到断点
- 移动端需要设置 viewport meta 标签

**解决方案:**

```vue
<!-- ✅ 正确 - 使用正确的断点前缀 -->
<template>
  <div class="text-base sm:text-lg md:text-xl lg:text-2xl">
    响应式文本
  </div>
</template>

<!-- ❌ 错误 - 断点前缀不存在 -->
<template>
  <div class="text-base mobile:text-lg tablet:text-xl">
    响应式文本
  </div>
</template>
```

**确保 HTML 中包含 viewport meta 标签:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 4. 暗色模式不自动切换

**问题描述:**

使用 `dark:` 变体定义的暗色模式样式不生效。

**可能原因:**

- 没有启用暗色模式
- 暗色模式策略配置不正确
- 缺少必要的类名或属性

**解决方案:**

项目使用 CSS 变量实现主题切换,建议优先使用主题变量类而不是 `dark:` 变体:

```vue
<!-- ✅ 推荐 - 使用主题变量类 -->
<template>
  <div class="bg-bg-base text-text-base">
    自动支持主题切换
  </div>
</template>

<!-- ⚠️ 需要配置 - 使用 dark: 变体 -->
<template>
  <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    需要配置暗色模式策略
  </div>
</template>
```

### 5. 自定义快捷类无法使用

**问题描述:**

在 `uno.config.ts` 中定义的快捷类在代码中无法使用。

**可能原因:**

- 配置文件修改后未重启开发服务器
- 快捷类名称与预设工具类冲突
- 配置语法错误

**解决方案:**

1. **重启开发服务器** - 配置文件修改后需要重启
2. **检查配置语法** - 确保配置格式正确
3. **避免命名冲突** - 使用独特的命名避免与预设类冲突

```typescript
// ✅ 正确
shortcuts: {
  'my-button': 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600'
}

// ❌ 错误 - 语法错误
shortcuts: {
  my-button: px-4 py-2 rounded // 缺少引号
}
```
