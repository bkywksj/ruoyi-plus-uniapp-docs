# Iconfont 配置

Iconfont 是项目的自定义字体图标系统，包含 644 个业务专属图标，通过字体文件的方式提供图标支持。相比 SVG 图标，Iconfont 具有更好的浏览器兼容性和更小的请求数量，是项目中业务图标的首选方案。

## 技术架构

### 工作原理

Iconfont（字体图标）的核心原理是将矢量图标制作成字体文件，通过 CSS 的 `@font-face` 规则加载字体，然后使用 Unicode 编码或 CSS 伪元素来显示图标。

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Iconfont 工作流程                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │ Iconfont 平台 │───▶│   字体文件    │───▶│  @font-face  │          │
│  │  (SVG 上传)   │    │ (woff2/woff) │    │   CSS 加载    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │ iconfont.json │    │ Unicode 映射 │    │ .icon-xxx 类 │          │
│  │   (元数据)    │    │   (e665...)  │    │  :before 伪  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                                       │                  │
│         ▼                                       ▼                  │
│  ┌──────────────────────────────────────────────────────┐          │
│  │              Vite Plugin 自动生成类型                 │          │
│  │         icons.d.ts (644 个 iconfont 图标)            │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 与 Iconify 的对比

| 特性 | Iconfont | Iconify |
|------|----------|---------|
| **渲染方式** | CSS 字体 + 伪元素 | SVG 矢量图 |
| **请求数量** | 一次加载所有图标 | 按需加载 |
| **多色支持** | 仅单色 | 支持多色 |
| **缩放质量** | 矢量无损 | 矢量无损 |
| **浏览器兼容** | IE6+ | 现代浏览器 |
| **动态修改** | 仅颜色和大小 | 完全可控 |
| **图标数量** | 644 个业务图标 | 200,000+ 开源图标 |
| **适用场景** | 业务专属图标 | 通用图标 |

### 系统集成架构

```
┌───────────────────────────────────────────────────────────────────┐
│                         图标系统总览                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Icon.vue 统一组件                         │  │
│  │  ┌─────────────────────┬─────────────────────────────────┐  │  │
│  │  │     Iconfont        │          Iconify                │  │  │
│  │  │   (CSS 字体渲染)     │        (SVG 渲染)               │  │  │
│  │  │   isIconfontIcon()  │       isIconifyIcon()           │  │  │
│  │  └─────────────────────┴─────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│              ┌───────────────┴───────────────┐                   │
│              ▼                               ▼                    │
│  ┌────────────────────────┐    ┌────────────────────────┐        │
│  │   ICONFONT_ICONS[]     │    │   ICONIFY_ICONS[]      │        │
│  │     644 个图标          │    │     173 个图标          │        │
│  │   code, name           │    │   code, name, value    │        │
│  └────────────────────────┘    └────────────────────────┘        │
│              │                               │                    │
│              └───────────────┬───────────────┘                   │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     ALL_ICONS[]                              │  │
│  │               817 个图标 (全局 IconCode 类型)                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## 资源文件

### 文件结构

项目中 Iconfont 相关文件存放在 `src/assets/icons/system/` 目录下：

```
src/assets/icons/
├── system/                      # Iconfont 字体图标目录
│   ├── iconfont.css            # 字体样式定义文件
│   ├── iconfont.json           # 图标元数据 (644 个图标)
│   ├── iconfont.woff2          # 字体文件 - WOFF2 格式 (推荐，体积最小)
│   ├── iconfont.woff           # 字体文件 - WOFF 格式 (备用)
│   └── iconfont.ttf            # 字体文件 - TTF 格式 (兼容性备用)
│
└── iconify/                     # Iconify 图标配置目录
    └── preset.json             # Iconify 预设图标配置
```

### 文件说明

| 文件名 | 大小估算 | 说明 |
|--------|----------|------|
| `iconfont.woff2` | ~50KB | 推荐使用，压缩率最高 |
| `iconfont.woff` | ~60KB | WOFF2 的降级方案 |
| `iconfont.ttf` | ~100KB | 最大兼容性，体积最大 |
| `iconfont.css` | ~40KB | 包含 644 个图标类定义 |
| `iconfont.json` | ~80KB | 完整的图标元数据 |

### 字体格式优先级

浏览器会按照 CSS 中 `src` 的顺序尝试加载字体：

```css
@font-face {
  font-family: "iconfont";
  src: url('iconfont.woff2?t=1758257308429') format('woff2'),  /* 优先级 1 */
       url('iconfont.woff?t=1758257308429') format('woff'),    /* 优先级 2 */
       url('iconfont.ttf?t=1758257308429') format('truetype'); /* 优先级 3 */
}
```

**格式说明：**

| 格式 | 浏览器支持 | 压缩率 | 推荐指数 |
|------|-----------|--------|---------|
| WOFF2 | Chrome 36+, Firefox 39+, Edge 14+ | 最高 (~30% 更小) | ⭐⭐⭐⭐⭐ |
| WOFF | IE9+, 所有现代浏览器 | 高 | ⭐⭐⭐⭐ |
| TTF | IE9+, 所有浏览器 | 无压缩 | ⭐⭐⭐ |

## CSS 配置

### 完整的 iconfont.css 结构

```css
/* src/assets/icons/system/iconfont.css */

/* ========== 1. 字体定义 ========== */
@font-face {
  font-family: "iconfont";              /* 字体族名称 */
  /* Project id: 5022572 */
  src: url('iconfont.woff2?t=1758257308429') format('woff2'),
       url('iconfont.woff?t=1758257308429') format('woff'),
       url('iconfont.ttf?t=1758257308429') format('truetype');
}

/* ========== 2. 基础类定义 ========== */
.iconfont {
  font-family: "iconfont" !important;   /* 指定字体族 */
  font-size: 16px;                       /* 默认字号 */
  font-style: normal;                    /* 正常样式，非斜体 */
  -webkit-font-smoothing: antialiased;   /* Webkit 抗锯齿 */
  -moz-osx-font-smoothing: grayscale;    /* Firefox/macOS 抗锯齿 */
}

/* ========== 3. 图标类定义 (共 644 个) ========== */

/* 交通类图标 */
.icon-elevator3:before { content: "\e8b9"; }
.icon-car:before { content: "\e7fa"; }
.icon-bus:before { content: "\e7f7"; }
.icon-train:before { content: "\e7f6"; }
.icon-airplane:before { content: "\e802"; }
.icon-bicycle:before { content: "\e7f9"; }
.icon-motorcycle:before { content: "\e7fe"; }
.icon-subway:before { content: "\e7f5"; }
.icon-ship:before { content: "\e801"; }
.icon-helicopter:before { content: "\e805"; }

/* 操作类图标 */
.icon-add:before { content: "\e717"; }
.icon-delete:before { content: "\e71c"; }
.icon-edit:before { content: "\e706"; }
.icon-search:before { content: "\e6cb"; }
.icon-refresh:before { content: "\e6b3"; }
.icon-save:before { content: "\e767"; }
.icon-copy:before { content: "\e624"; }
.icon-download:before { content: "\e87f"; }
.icon-upload:before { content: "\e79b"; }
.icon-share:before { content: "\e72d"; }

/* 状态类图标 */
.icon-success:before { content: "\e617"; }
.icon-warn:before { content: "\e600"; }
.icon-check:before { content: "\e616"; }
.icon-close:before { content: "\e6db"; }
.icon-complete:before { content: "\e708"; }
.icon-failure:before { content: "\e71a"; }

/* 用户类图标 */
.icon-user:before { content: "\e608"; }
.icon-account:before { content: "\e70d"; }
.icon-team:before { content: "\e724"; }
.icon-member:before { content: "\e745"; }
.icon-my:before { content: "\e70a"; }

/* 导航类图标 */
.icon-home:before { content: "\e7bb"; }
.icon-menu:before { content: "\e662"; }
.icon-settings:before { content: "\e72b"; }
.icon-back:before { content: "\e752"; }
.icon-category:before { content: "\e886"; }

/* 媒体类图标 */
.icon-image:before { content: "\e634"; }
.icon-video:before { content: "\e778"; }
.icon-music:before { content: "\e7ec"; }
.icon-camera:before { content: "\e7f2"; }
.icon-play:before { content: "\e6e8"; }

/* 社交类图标 */
.icon-wechat:before { content: "\e7f3"; }
.icon-qq:before { content: "\e8cd"; }
.icon-github:before { content: "\e8d6"; }
.icon-bilibili:before { content: "\e6b4"; }

/* ... 其他 600+ 图标类 */
```

### Unicode 编码说明

Iconfont 图标的 Unicode 编码遵循 **Private Use Area (PUA)** 规范：

```
Unicode 范围: U+E600 - U+F8FF (私有使用区域)

示例：
- \e600 = U+E600 (warn 图标)
- \e617 = U+E617 (success 图标)
- \e8b9 = U+E8B9 (elevator3 图标)
```

### 图标命名规范

所有图标类名遵循以下命名规则：

```
.icon-{图标名称}:before { content: "\{unicode}"; }

规则说明：
1. 前缀统一为 icon-
2. 图标名称使用 kebab-case (连字符分隔)
3. 同类图标使用数字后缀区分 (如 icon-edit, icon-edit2, icon-edit3)
4. 伪元素 :before 放置图标内容
```

**命名示例：**

| 中文名称 | 类名 | Unicode |
|---------|------|---------|
| 电梯 | `icon-elevator3` | `\e8b9` |
| 电量 | `icon-battery` | `\e6e5` |
| 图片 | `icon-image` | `\e634` |
| 斜体 | `icon-italic` | `\e638` |
| 地球 | `icon-globe` | `\e611` |
| 用户 | `icon-user` | `\e608` |
| 首页 | `icon-home` | `\e7bb` |

## JSON 元数据

### iconfont.json 完整结构

```json
{
  "id": "5022572",
  "name": "plus-ui",
  "font_family": "iconfont",
  "css_prefix_text": "icon-",
  "description": "ruoyi-plus-uniapp图标库",
  "glyphs": [
    {
      "icon_id": "25331853",
      "name": "电梯",
      "font_class": "elevator3",
      "unicode": "e8b9",
      "unicode_decimal": 59577
    },
    {
      "icon_id": "32102715",
      "name": "电量",
      "font_class": "battery",
      "unicode": "e6e5",
      "unicode_decimal": 59109
    },
    {
      "icon_id": "16322949",
      "name": "漂流瓶",
      "font_class": "floating-bottle",
      "unicode": "e7eb",
      "unicode_decimal": 59371
    },
    {
      "icon_id": "27469006",
      "name": "图片",
      "font_class": "image",
      "unicode": "e634",
      "unicode_decimal": 58932
    }
    // ... 644 个图标定义
  ]
}
```

### 字段详解

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | Iconfont 项目唯一标识 |
| `name` | string | 项目名称 |
| `font_family` | string | 字体族名称，与 CSS 中 `font-family` 对应 |
| `css_prefix_text` | string | CSS 类名前缀，默认为 `icon-` |
| `description` | string | 项目描述 |
| `glyphs` | array | 图标数组，包含所有图标定义 |

**glyphs 字段结构：**

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `icon_id` | string | 图标唯一 ID | `"25331853"` |
| `name` | string | 图标中文名称 | `"电梯"` |
| `font_class` | string | CSS 类名后缀 | `"elevator3"` |
| `unicode` | string | Unicode 编码 (十六进制) | `"e8b9"` |
| `unicode_decimal` | number | Unicode 编码 (十进制) | `59577` |

### 图标分类统计

根据 iconfont.json 中的 644 个图标，可按功能分类：

```typescript
// 图标分类统计
const ICON_CATEGORIES = {
  '交通工具': [
    'elevator', 'elevator2', 'elevator3', 'elevator4',
    'car', 'car2', 'car3', 'car4', 'bus', 'train', 'train2',
    'airplane', 'airplane2', 'bicycle', 'bike', 'motorcycle',
    'subway', 'ship', 'boat', 'helicopter', 'sailboat',
    'speedboat', 'sightseeing-car', 'rocket', 'rocket2'
  ],
  '用户账户': [
    'user', 'user2', 'user3', 'user4', 'user5',
    'account', 'my', 'my2', 'my3', 'my4',
    'team', 'team2', 'team3', 'team4', 'team5',
    'member', 'male', 'female', 'baby', 'inviter', 'inviter2'
  ],
  '操作编辑': [
    'add', 'add2', 'add3', 'add4', 'add5',
    'delete', 'delete2', 'delete3', 'delete4',
    'edit', 'edit2', 'edit3', 'edit4', 'edit5', 'edit6',
    'edit-pencil', 'edit-pencil2', 'edit-pencil3', 'edit-pencil-line',
    'save', 'copy', 'copy2', 'undo', 'redo'
  ],
  '状态反馈': [
    'success', 'failure', 'warn', 'alert', 'tip', 'tip2', 'tip3',
    'check', 'check2', 'close', 'close2', 'close-circle',
    'complete', 'complete2', 'complete3', 'complete4', 'complete5',
    'correct', 'ban', 'question', 'help', 'help2'
  ],
  '导航菜单': [
    'home', 'home2', 'home3', 'home4', 'home5', 'home6', 'home7', 'home8', 'home9',
    'menu', 'category', 'category2', 'category3', 'category4', 'category5',
    'settings', 'settings2', 'settings3', 'settings4', 'settings5',
    'back', 'navigation', 'navigation2'
  ],
  '媒体文件': [
    'image', 'picture', 'photo', 'video', 'music', 'music2',
    'camera', 'camera2', 'camera3', 'play', 'voice',
    'microphone', 'handheld-microphone', 'mute', 'film'
  ],
  '社交通讯': [
    'wechat', 'qq', 'github', 'github2', 'bilibili',
    'comment', 'comment2', 'comment3', 'comment4',
    'share', 'share2', 'share3', 'share4', 'share5', 'share6', 'share7',
    'message', 'email', 'phone', 'phone2', 'call'
  ],
  '商务办公': [
    'file', 'file2', 'file3', 'document', 'paper',
    'order', 'order-list', 'invoice', 'invoice2',
    'calendar', 'date', 'clock', 'clock-in', 'clock-in2',
    'time', 'time2', 'timer', 'timer2', 'deadline'
  ],
  '电商购物': [
    'shopping', 'shopping2', 'shopping-cart', 'shopping-cart2', 'shopping-cart3', 'shopping-cart4', 'shopping-cart5',
    'shopping-bag', 'store', 'store2', 'store3',
    'goods', 'product', 'coupon', 'coupon2', 'wallet', 'wallet2',
    'vip', 'vip2', 'coin', 'money', 'price'
  ],
  '建筑地点': [
    'building', 'building2', 'building3', 'building4', 'building5', 'building6',
    'city', 'city2', 'city3', 'factory', 'hospital', 'school', 'school2',
    'church', 'museum', 'memorial', 'pharmacy', 'pharmacy2', 'pharmacy3'
  ],
  '箭头方向': [
    'up', 'up2', 'up3', 'up4', 'down', 'down2', 'down3', 'down4',
    'left', 'left2', 'left3', 'right', 'right2', 'right3', 'right4',
    'arrow', 'arrow-up', 'arrow-down', 'arrow-up-right', 'arrow-down-left',
    'expand', 'expand2', 'shrink', 'shrink2'
  ]
}
```

## 引入配置

### 1. 全局引入 (推荐)

在 `main.ts` 中全局引入 Iconfont 样式：

```typescript
// src/main.ts

import { createApp } from 'vue'
import App from './App.vue'

// 全局引入 iconfont 样式
import '@/assets/icons/system/iconfont.css'

const app = createApp(App)
app.mount('#app')
```

**优点：**
- 一次引入，全局可用
- 无需在每个组件中单独引入
- 字体文件只加载一次

### 2. 按需引入

在特定组件中引入（不推荐，会导致字体重复加载）：

```vue
<template>
  <div>
    <i class="iconfont icon-home"></i>
  </div>
</template>

<style scoped>
/* 仅在需要时引入 */
@import '@/assets/icons/system/iconfont.css';
</style>
```

### 3. Vite 构建配置

确保字体文件被正确处理：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // 资源处理配置
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf'],

  build: {
    // 资源内联阈值 (字节)
    assetsInlineLimit: 4096,

    // 确保字体文件被正确输出
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 字体文件放入 fonts 目录
          if (/\.(woff2?|ttf|eot|otf)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
```

### 4. 字体预加载优化

在 `index.html` 中添加字体预加载：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 预加载 iconfont 字体 -->
  <link
    rel="preload"
    href="/src/assets/icons/system/iconfont.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  >

  <title>RuoYi Plus</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## 使用方式

### 1. 基础用法

```vue
<template>
  <div class="demo-icons">
    <!-- 标准用法：iconfont 基础类 + 图标类 -->
    <i class="iconfont icon-home"></i>
    <i class="iconfont icon-user"></i>
    <i class="iconfont icon-settings"></i>

    <!-- 使用 span 标签同样有效 -->
    <span class="iconfont icon-search"></span>
  </div>
</template>

<style scoped>
.demo-icons {
  display: flex;
  gap: 16px;
  font-size: 24px;
}
</style>
```

### 2. 通过 Icon 组件使用 (推荐)

```vue
<template>
  <div class="demo-icons">
    <!-- 使用 code 属性，自动识别 iconfont 图标 -->
    <Icon code="home" />
    <Icon code="user" />
    <Icon code="settings" />

    <!-- 设置尺寸 -->
    <Icon code="search" size="small" />
    <Icon code="search" size="medium" />
    <Icon code="search" size="large" />
    <Icon code="search" :size="32" />

    <!-- 设置颜色 -->
    <Icon code="success" color="#67c23a" />
    <Icon code="warn" color="#e6a23c" />
    <Icon code="failure" color="#f56c6c" />

    <!-- 添加动画 -->
    <Icon code="refresh" animate="spin" />
    <Icon code="settings" animate="rotate" />
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
</script>
```

### 3. 动态图标

```vue
<template>
  <div class="dynamic-icons">
    <!-- 动态绑定图标 -->
    <i :class="['iconfont', `icon-${currentIcon}`]"></i>

    <!-- 或使用 Icon 组件 -->
    <Icon :code="currentIcon" />

    <!-- 图标切换按钮 -->
    <button @click="toggleIcon">切换图标</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/Icon/Icon.vue'

const icons = ['home', 'user', 'settings', 'search', 'menu'] as const
const currentIndex = ref(0)
const currentIcon = computed(() => icons[currentIndex.value])

const toggleIcon = () => {
  currentIndex.value = (currentIndex.value + 1) % icons.length
}
</script>
```

### 4. 样式定制

```vue
<template>
  <div class="styled-icons">
    <!-- 内联样式 -->
    <i
      class="iconfont icon-home"
      style="font-size: 32px; color: #409eff;"
    ></i>

    <!-- CSS 类定制 -->
    <i class="iconfont icon-user icon-primary icon-lg"></i>

    <!-- 悬停效果 -->
    <i class="iconfont icon-settings icon-hover"></i>

    <!-- 禁用状态 -->
    <i class="iconfont icon-delete icon-disabled"></i>

    <!-- 使用 Tailwind/UnoCSS -->
    <i class="iconfont icon-search text-2xl text-blue-500 hover:text-blue-600"></i>
  </div>
</template>

<style scoped>
/* 预设尺寸 */
.icon-sm { font-size: 14px; }
.icon-md { font-size: 18px; }
.icon-lg { font-size: 24px; }
.icon-xl { font-size: 32px; }

/* 预设颜色 */
.icon-primary { color: var(--el-color-primary); }
.icon-success { color: var(--el-color-success); }
.icon-warning { color: var(--el-color-warning); }
.icon-danger { color: var(--el-color-danger); }

/* 悬停效果 */
.icon-hover {
  cursor: pointer;
  transition: all 0.3s ease;
}
.icon-hover:hover {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

/* 禁用状态 */
.icon-disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
```

### 5. 图标按钮

```vue
<template>
  <div class="icon-buttons">
    <!-- 基础图标按钮 -->
    <button class="icon-btn" @click="handleAdd">
      <i class="iconfont icon-add"></i>
    </button>

    <!-- 带文字的图标按钮 -->
    <button class="icon-btn with-text" @click="handleEdit">
      <i class="iconfont icon-edit"></i>
      <span>编辑</span>
    </button>

    <!-- 圆形图标按钮 -->
    <button class="icon-btn circle" @click="handleDelete">
      <i class="iconfont icon-delete"></i>
    </button>

    <!-- 使用 Element Plus 按钮 -->
    <el-button type="primary" circle>
      <i class="iconfont icon-search"></i>
    </el-button>

    <el-button type="success">
      <i class="iconfont icon-add mr-1"></i>
      新增
    </el-button>
  </div>
</template>

<script setup lang="ts">
const handleAdd = () => console.log('添加')
const handleEdit = () => console.log('编辑')
const handleDelete = () => console.log('删除')
</script>

<style scoped>
.icon-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: var(--el-color-primary);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-btn:hover {
  background: var(--el-color-primary-light-3);
}

.icon-btn.with-text {
  gap: 4px;
}

.icon-btn.circle {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
}
</style>
```

### 6. 导航菜单图标

```vue
<template>
  <el-menu :default-active="activeMenu" class="sidebar-menu">
    <el-menu-item index="dashboard">
      <i class="iconfont icon-home"></i>
      <span>首页</span>
    </el-menu-item>

    <el-sub-menu index="system">
      <template #title>
        <i class="iconfont icon-settings"></i>
        <span>系统管理</span>
      </template>
      <el-menu-item index="system/user">
        <i class="iconfont icon-user"></i>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="system/role">
        <i class="iconfont icon-team"></i>
        <span>角色管理</span>
      </el-menu-item>
      <el-menu-item index="system/menu">
        <i class="iconfont icon-menu"></i>
        <span>菜单管理</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeMenu = ref('dashboard')
</script>

<style scoped>
.sidebar-menu .iconfont {
  margin-right: 8px;
  font-size: 18px;
  vertical-align: middle;
}
</style>
```

## 类型生成

### Vite 插件工作原理

项目使用自定义 Vite 插件 `iconfont-types` 自动解析 JSON 文件并生成 TypeScript 类型定义：

```typescript
// vite/plugins/iconfont-types.ts

import type { Plugin } from 'vite'
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'

interface IconItem {
  code: string
  name: string
}

interface IconfontGlyph {
  font_class: string
  name: string
  unicode: string
  unicode_decimal: number
}

interface IconfontJson {
  glyphs: IconfontGlyph[]
}

export default (): Plugin => {
  const iconsDir = 'src/assets/icons'
  const outputPath = 'src/types/icons.d.ts'
  let projectRoot = ''

  // 解析 iconfont JSON 文件
  const parseIconfontJson = (jsonPath: string): IconItem[] => {
    try {
      const content = readFileSync(jsonPath, 'utf-8')
      const data: IconfontJson = JSON.parse(content)

      if (data.glyphs && Array.isArray(data.glyphs)) {
        return data.glyphs.map((glyph) => ({
          code: glyph.font_class || glyph.name,
          name: glyph.name
        }))
      }

      return []
    } catch (error) {
      console.warn(`解析 iconfont 文件失败: ${jsonPath}`, error)
      return []
    }
  }

  // ... 其他代码

  return {
    name: 'iconfont-types',

    configResolved(config) {
      projectRoot = config.root
    },

    buildStart() {
      writeTypeFile()
    },

    handleHotUpdate({ file }) {
      const iconsPath = resolve(projectRoot, iconsDir)

      if (file.startsWith(iconsPath) && file.endsWith('.json')) {
        console.log(`检测到图标文件变化: ${relative(projectRoot, file)}`)
        writeTypeFile()
      }
    }
  }
}
```

### 生成的类型文件

```typescript
// src/types/icons.d.ts (自动生成)

/**
 * 图标类型声明文件
 *
 * 此文件由 iconfont-types 插件自动生成
 * 扫描目录: src/assets/icons
 * 图标数量: 817 个图标 (iconfont: 644, iconify: 173)
 *
 * 请勿手动修改此文件，所有修改将在下次构建时被覆盖
 */

declare global {
  /** 图标代码类型 */
  type IconCode =
    | 'account'
    | 'activity'
    | 'activity2'
    | 'activity3'
    | 'add'
    | 'add-column'
    | 'add-document'
    // ... 817 个图标代码
}

/** 图标项接口 */
export interface IconItem {
  code: string
  name: string
}

/** iconfont 图标列表 (仅来自 iconfont JSON 文件) */
export const ICONFONT_ICONS: IconItem[] = [
  { code: 'account', name: '账户' },
  { code: 'activity', name: '活动' },
  // ... 644 个 iconfont 图标
]

/** 所有可用图标列表 (用于图标选择器) */
export const ALL_ICONS: IconItem[] = [
  // ... 817 个图标
]

/** 检查代码是否为有效的图标 */
export const isValidIconCode = (code: string): code is IconCode => {
  return ALL_ICONS.some((icon) => icon.code === code)
}

/** 检查代码是否为 iconfont 图标 */
export const isIconfontIcon = (code: string): boolean => {
  return ICONFONT_ICONS.some((icon) => icon.code === code)
}

/** 根据代码获取图标名称 */
export const getIconName = (code: IconCode): string => {
  return ALL_ICONS.find((icon) => icon.code === code)?.name || code
}

/** 搜索图标 */
export const searchIcons = (query: string): IconItem[] => {
  const searchTerm = query.toLowerCase()
  return ALL_ICONS.filter((icon) =>
    icon.code.toLowerCase().includes(searchTerm) ||
    icon.name.toLowerCase().includes(searchTerm)
  )
}

/** 获取所有图标代码 */
export const getAllIconCodes = (): IconCode[] => {
  return ALL_ICONS.map((icon) => icon.code as IconCode)
}

export {}
```

### 热更新机制

插件支持热更新，修改 JSON 文件后自动重新生成类型：

```typescript
// 热更新处理
handleHotUpdate({ file }) {
  const iconsPath = resolve(projectRoot, iconsDir)

  // 只处理 icons 目录下的 JSON 文件变化
  if (file.startsWith(iconsPath) && file.endsWith('.json')) {
    console.log(`检测到图标文件变化: ${relative(projectRoot, file)}`)
    writeTypeFile()  // 重新生成类型文件
  }
}
```

## 性能优化

### 1. 字体加载优化

```css
@font-face {
  font-family: "iconfont";
  src: url('iconfont.woff2?t=1758257308429') format('woff2'),
       url('iconfont.woff?t=1758257308429') format('woff'),
       url('iconfont.ttf?t=1758257308429') format('truetype');

  /* 字体显示策略 */
  font-display: swap;  /* 优先显示后备字体，字体加载后切换 */
  /* 可选值：
   * auto: 浏览器默认行为
   * block: 短暂阻塞，然后显示字体
   * swap: 立即显示后备字体，加载后替换 (推荐)
   * fallback: 短暂阻塞，然后使用后备字体
   * optional: 短暂阻塞，可能使用后备字体
   */
}
```

### 2. 字体预加载

```html
<!-- index.html -->
<head>
  <!-- 预加载最常用的 WOFF2 格式 -->
  <link
    rel="preload"
    href="/src/assets/icons/system/iconfont.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  >
</head>
```

### 3. 字体子集化

如果只需要部分图标，可以使用字体子集化工具减小文件体积：

```bash
# 使用 fonttools 进行子集化
pip install fonttools

# 只保留需要的字符
pyftsubset iconfont.ttf \
  --unicodes="U+E600-U+E620" \
  --output-file="iconfont-subset.ttf"
```

### 4. CDN 加速

将字体文件托管到 CDN 加速加载：

```css
@font-face {
  font-family: "iconfont";
  src: url('https://cdn.example.com/fonts/iconfont.woff2') format('woff2'),
       url('https://cdn.example.com/fonts/iconfont.woff') format('woff'),
       url('https://cdn.example.com/fonts/iconfont.ttf') format('truetype');
}
```

### 5. 缓存策略

配置强缓存策略：

```nginx
# Nginx 配置
location ~* \.(woff2?|ttf|eot|otf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

## 图标管理

### 1. 搜索图标

```typescript
import { ICONFONT_ICONS, searchIcons } from '@/types/icons'

// 使用内置搜索函数
const results = searchIcons('elevator')
// 返回: [{ code: 'elevator', name: '电梯' }, { code: 'elevator2', name: '电梯2' }, ...]

// 自定义搜索
const searchByCategory = (category: string) => {
  return ICONFONT_ICONS.filter(icon =>
    icon.name.includes(category) || icon.code.includes(category)
  )
}

// 搜索交通类图标
const transportIcons = searchByCategory('car')
// 返回所有包含 'car' 的图标
```

### 2. 图标验证

```typescript
import { isValidIconCode, isIconfontIcon, getIconName } from '@/types/icons'

// 验证图标代码是否有效
isValidIconCode('home')      // true
isValidIconCode('not-exist') // false

// 验证是否为 iconfont 图标
isIconfontIcon('home')       // true (来自 iconfont)
isIconfontIcon('dashboard')  // false (可能是 iconify)

// 获取图标名称
getIconName('elevator3')     // '电梯'
getIconName('home')          // '首页'
```

### 3. 图标列表组件

```vue
<template>
  <div class="icon-list">
    <el-input
      v-model="searchQuery"
      placeholder="搜索图标..."
      prefix-icon="Search"
      clearable
    />

    <div class="icon-grid">
      <div
        v-for="icon in filteredIcons"
        :key="icon.code"
        class="icon-item"
        :class="{ active: selectedIcon === icon.code }"
        @click="selectIcon(icon.code)"
      >
        <i :class="['iconfont', `icon-${icon.code}`]"></i>
        <span class="icon-name">{{ icon.name }}</span>
        <span class="icon-code">{{ icon.code }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ICONFONT_ICONS, searchIcons } from '@/types/icons'

const searchQuery = ref('')
const selectedIcon = ref('')

const filteredIcons = computed(() => {
  if (!searchQuery.value) {
    return ICONFONT_ICONS
  }
  return searchIcons(searchQuery.value)
})

const selectIcon = (code: string) => {
  selectedIcon.value = code
}
</script>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.icon-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-8);
}

.icon-item .iconfont {
  font-size: 28px;
  color: var(--el-text-color-primary);
}

.icon-name {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.icon-code {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
</style>
```

## 更新图标库

### 1. 从 Iconfont 平台导出

1. 访问 [Iconfont 平台](https://www.iconfont.cn/)
2. 登录账号并打开项目
3. 选择需要更新的图标
4. 点击 **"下载至本地"** 按钮
5. 选择 **"Font class"** 格式下载

### 2. 替换项目文件

```bash
# 进入项目目录
cd ruoyi-plus-uniapp-workflow/plus-ui

# 备份现有文件
cp -r src/assets/icons/system src/assets/icons/system.backup

# 解压下载的文件
unzip download.zip -d temp_icons

# 复制新文件
cp temp_icons/iconfont.css src/assets/icons/system/
cp temp_icons/iconfont.json src/assets/icons/system/
cp temp_icons/iconfont.woff2 src/assets/icons/system/
cp temp_icons/iconfont.woff src/assets/icons/system/
cp temp_icons/iconfont.ttf src/assets/icons/system/

# 清理临时文件
rm -rf temp_icons download.zip
```

### 3. 重新生成类型

```bash
# 重启开发服务器，插件会自动重新生成类型文件
pnpm dev

# 或手动触发构建
pnpm build
```

### 4. 验证更新

```typescript
import { ICONFONT_ICONS, getAllIconCodes } from '@/types/icons'

// 验证图标数量
console.log(`Iconfont 图标总数: ${ICONFONT_ICONS.length}`)

// 验证新增图标
const newIcons = ['new-icon-1', 'new-icon-2']
newIcons.forEach(icon => {
  const exists = isIconfontIcon(icon)
  console.log(`${icon}: ${exists ? '✓ 已添加' : '✗ 未找到'}`)
})
```

### 5. 更新注意事项

```markdown
**更新检查清单：**

- [ ] 备份原有图标文件
- [ ] 确保新文件包含所有需要的图标
- [ ] 检查 CSS 前缀是否一致 (icon-)
- [ ] 验证字体族名称 (iconfont)
- [ ] 重启开发服务器
- [ ] 检查类型文件是否正确生成
- [ ] 测试关键页面图标显示
- [ ] 清除浏览器缓存验证
```

## 高级用法

### 1. 图标动画

```vue
<template>
  <div class="animated-icons">
    <!-- 旋转动画 -->
    <i class="iconfont icon-refresh icon-spin"></i>

    <!-- 脉冲动画 -->
    <i class="iconfont icon-notification icon-pulse"></i>

    <!-- 弹跳动画 -->
    <i class="iconfont icon-bell icon-bounce"></i>

    <!-- 摇摆动画 -->
    <i class="iconfont icon-alert icon-shake"></i>

    <!-- 淡入淡出 -->
    <i class="iconfont icon-heart icon-fade"></i>
  </div>
</template>

<style scoped>
/* 旋转动画 */
@keyframes icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.icon-spin {
  animation: icon-spin 1s linear infinite;
}

/* 脉冲动画 */
@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
.icon-pulse {
  animation: icon-pulse 1s ease-in-out infinite;
}

/* 弹跳动画 */
@keyframes icon-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.icon-bounce {
  animation: icon-bounce 0.6s ease-in-out infinite;
}

/* 摇摆动画 */
@keyframes icon-shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
.icon-shake {
  animation: icon-shake 0.5s ease-in-out infinite;
}

/* 淡入淡出 */
@keyframes icon-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.icon-fade {
  animation: icon-fade 1.5s ease-in-out infinite;
}
</style>
```

### 2. 图标堆叠

```vue
<template>
  <div class="stacked-icons">
    <!-- 基础堆叠 -->
    <span class="icon-stack">
      <i class="iconfont icon-circle icon-stack-2x"></i>
      <i class="iconfont icon-user icon-stack-1x"></i>
    </span>

    <!-- 带背景的图标 -->
    <span class="icon-stack">
      <i class="iconfont icon-circle icon-stack-2x text-primary"></i>
      <i class="iconfont icon-check icon-stack-1x text-white"></i>
    </span>

    <!-- 角标效果 -->
    <span class="icon-with-badge">
      <i class="iconfont icon-notification"></i>
      <span class="badge">5</span>
    </span>
  </div>
</template>

<style scoped>
.stacked-icons {
  display: flex;
  gap: 24px;
  align-items: center;
}

.icon-stack {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
}

.icon-stack-2x {
  font-size: 2em;
}

.icon-stack-1x {
  position: absolute;
  font-size: 1em;
}

.icon-with-badge {
  position: relative;
  display: inline-block;
}

.icon-with-badge .iconfont {
  font-size: 24px;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: #fff;
  background: #f56c6c;
  border-radius: 9px;
}
</style>
```

### 3. 响应式图标

```vue
<template>
  <div class="responsive-icons">
    <i class="iconfont icon-menu responsive-icon"></i>
  </div>
</template>

<style scoped>
.responsive-icon {
  /* 移动端 */
  font-size: 20px;
}

/* 平板 */
@media (min-width: 768px) {
  .responsive-icon {
    font-size: 24px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .responsive-icon {
    font-size: 28px;
  }
}

/* 大屏 */
@media (min-width: 1440px) {
  .responsive-icon {
    font-size: 32px;
  }
}
</style>
```

### 4. 主题适配

```vue
<template>
  <div class="themed-icons">
    <i class="iconfont icon-home themed-icon"></i>
    <i class="iconfont icon-user themed-icon"></i>
    <i class="iconfont icon-settings themed-icon"></i>
  </div>
</template>

<style scoped>
.themed-icon {
  color: var(--el-text-color-primary);
  transition: color 0.3s;
}

/* 暗黑模式适配 */
html.dark .themed-icon {
  color: var(--el-text-color-primary);
}

/* 悬停效果适配 */
.themed-icon:hover {
  color: var(--el-color-primary);
}
</style>
```

## 常见问题

### 1. 图标显示为方块或乱码

**问题原因：**
- 字体文件未正确加载
- 字体文件路径错误
- 浏览器缓存问题

**解决方案：**

```css
/* 1. 检查字体文件路径 */
@font-face {
  font-family: "iconfont";
  /* 确保路径正确 */
  src: url('./iconfont.woff2') format('woff2');
}

/* 2. 添加降级方案 */
.iconfont {
  font-family: "iconfont", "Helvetica Neue", sans-serif !important;
}
```

```bash
# 3. 清除浏览器缓存
# Chrome: Ctrl + Shift + Delete
# 或开启开发者工具，禁用缓存
```

### 2. 图标大小不一致

**问题原因：**
- 不同图标的设计尺寸不同
- 未设置统一的容器尺寸

**解决方案：**

```css
/* 使用固定宽度容器 */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.icon-wrapper .iconfont {
  font-size: 16px;
}
```

### 3. 图标颜色无法修改

**问题原因：**
- CSS 选择器优先级不够
- 使用了 !important 覆盖

**解决方案：**

```css
/* 提高选择器优先级 */
.my-icon.iconfont.icon-home {
  color: #409eff !important;
}

/* 或使用 currentColor */
.icon-container {
  color: #409eff;
}
.icon-container .iconfont {
  color: currentColor;
}
```

### 4. 开发环境图标正常，生产环境异常

**问题原因：**
- 构建时字体文件路径变化
- 资源未正确复制到输出目录

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 固定字体文件输出路径
          if (/\.(woff2?|ttf|eot|otf)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name][extname]'  // 不使用 hash
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
```

### 5. 类型提示不生效

**问题原因：**
- 类型文件未正确生成
- TypeScript 配置问题

**解决方案：**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "types": ["./src/types/icons.d.ts"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]
}
```

```bash
# 手动重新生成类型
pnpm dev  # 或 pnpm build
```

### 6. 字体加载闪烁 (FOIT/FOUT)

**问题原因：**
- 字体加载期间显示空白 (FOIT) 或后备字体 (FOUT)

**解决方案：**

```css
/* 使用 font-display: swap 减少闪烁 */
@font-face {
  font-family: "iconfont";
  src: url('./iconfont.woff2') format('woff2');
  font-display: swap;
}

/* 或使用预加载 */
```

```html
<link rel="preload" href="/fonts/iconfont.woff2" as="font" type="font/woff2" crossorigin>
```

## API 参考

### 类型定义

```typescript
/** 图标代码类型 (全局类型) */
declare global {
  type IconCode =
    | 'home'
    | 'user'
    | 'settings'
    // ... 817 个图标代码
}

/** 图标项接口 */
interface IconItem {
  /** 图标代码 */
  code: string
  /** 图标名称 (中文) */
  name: string
}
```

### 工具函数

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `isValidIconCode` | `code: string` | `boolean` | 检查是否为有效图标代码 |
| `isIconfontIcon` | `code: string` | `boolean` | 检查是否为 iconfont 图标 |
| `getIconName` | `code: IconCode` | `string` | 获取图标中文名称 |
| `searchIcons` | `query: string` | `IconItem[]` | 搜索图标 |
| `getAllIconCodes` | - | `IconCode[]` | 获取所有图标代码 |

### 常量

| 常量名 | 类型 | 说明 |
|--------|------|------|
| `ICONFONT_ICONS` | `IconItem[]` | 所有 iconfont 图标列表 (644 个) |
| `ALL_ICONS` | `IconItem[]` | 所有图标列表 (817 个) |

### Icon 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `code` | `IconCode` | - | 图标代码 |
| `value` | `string` | - | 直接指定图标类名 |
| `size` | `string \| number` | `'medium'` | 图标尺寸 |
| `color` | `string` | - | 图标颜色 |
| `animate` | `string` | - | 动画类型 |

Iconfont 作为项目的业务图标解决方案，提供了稳定、高效的图标支持。通过与 Vite 插件的集成，实现了完整的类型安全和开发体验优化。
