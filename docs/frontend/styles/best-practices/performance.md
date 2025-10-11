# 性能优化

样式性能优化确保应用的渲染速度和流畅度,提升用户体验。

## 🚀 CSS 性能优化

### 1. 选择器优化

```scss
// ✅ 高效选择器
.card { }
.card-header { }
.card-body { }

// ❌ 低效选择器
div.card { }
.container > div > .card { }
*[class*="card"] { }
```

### 2. 避免昂贵属性

```scss
// ✅ 性能友好
.element {
  transform: translateX(10px);  // GPU 加速
  opacity: 0.8;
}

// ❌ 性能消耗
.element {
  margin-left: 10px;            // 触发布局
  filter: blur(5px);            // 消耗性能
}
```

### 3. 使用 will-change

```scss
// 提前告知浏览器元素将要变化
.dialog {
  will-change: transform, opacity;
}

.animated-element {
  will-change: transform;
}

// ⚠️ 使用后记得移除
.dialog.animated {
  will-change: auto;
}
```

## 🎬 动画性能

### 1. 使用 transform 和 opacity

```scss
// ✅ GPU 加速动画
@keyframes slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

// ❌ 触发重排的动画
@keyframes slide {
  from { left: -100%; }
  to { left: 0; }
}
```

### 2. 启用硬件加速

```scss
.animated {
  transform: translateZ(0);          // 启用 GPU
  backface-visibility: hidden;       // 隐藏背面
  perspective: 1000px;               // 3D 透视
}
```

## 📦 加载优化

### 1. 关键 CSS 内联

```html
<!-- 内联关键 CSS -->
<style>
  .above-fold { }
</style>

<!-- 异步加载非关键 CSS -->
<link rel="stylesheet" href="main.css" media="print" onload="this.media='all'">
```

### 2. CSS 按需加载

```typescript
// 动态加载样式
const loadStyle = (href: string) => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

// 路由切换时加载
router.beforeEach((to) => {
  if (to.meta.style) {
    loadStyle(to.meta.style)
  }
})
```

## 🔧 构建优化

### 1. CSS 压缩

```javascript
// vite.config.ts
export default {
  css: {
    postcss: {
      plugins: [
        cssnano({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true
          }]
        })
      ]
    }
  }
}
```

### 2. 移除未使用的样式

```javascript
// vite.config.ts
import { PurgeCSS } from 'purgecss'

export default {
  build: {
    rollupOptions: {
      plugins: [
        // PurgeCSS 配置
      ]
    }
  }
}
```

## 📊 性能监控

### 1. 检测渲染性能

```typescript
// 测量样式计算时间
const start = performance.now()
element.classList.add('active')
const end = performance.now()
console.log('样式应用耗时:', end - start)
```

### 2. 监控重排重绘

```typescript
// 使用 PerformanceObserver 监控布局变化
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'layout-shift') {
      console.warn('检测到布局偏移:', entry)
    }
  }
})

observer.observe({ entryTypes: ['layout-shift'] })
```

## ✅ 性能检查清单

- [ ] 避免复杂选择器(嵌套 < 3层)
- [ ] 动画使用 `transform` 和 `opacity`
- [ ] 使用 `will-change` 提示浏览器
- [ ] 启用 GPU 硬件加速
- [ ] 压缩和优化 CSS 文件
- [ ] 移除未使用的样式
- [ ] 关键 CSS 内联
- [ ] 非关键 CSS 异步加载

遵循这些优化实践可以显著提升样式性能和用户体验。
