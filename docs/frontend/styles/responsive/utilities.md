# 响应式工具

响应式工具提供了一系列辅助类和方法,简化响应式开发流程。

## 🔧 响应式 Mixin

### respond-to

```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: #{$sm}) { @content; }
  } @else if $breakpoint == 'md' {
    @media (max-width: #{$md}) { @content; }
  } @else if $breakpoint == 'lg' {
    @media (max-width: #{$lg}) { @content; }
  } @else if $breakpoint == 'xl' {
    @media (max-width: #{$xl}) { @content; }
  }
}
```

### respond-from (最小宽度)

```scss
@mixin respond-from($breakpoint) {
  @media (min-width: #{$breakpoint + 1px}) {
    @content;
  }
}
```

### respond-between (范围)

```scss
@mixin respond-between($min, $max) {
  @media (min-width: #{$min}) and (max-width: #{$max}) {
    @content;
  }
}
```

## 🎨 UnoCSS 响应式

### 断点前缀

```html
<!-- 小屏隐藏 -->
<div class="sm:hidden">小屏隐藏</div>

<!-- 中屏显示 -->
<div class="hidden md:block">中屏显示</div>

<!-- 响应式间距 -->
<div class="p-4 md:p-6 lg:p-8">响应式内边距</div>

<!-- 响应式布局 -->
<div class="flex-col md:flex-row">响应式方向</div>
```

### 响应式网格

```html
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <!-- 网格项 -->
</div>
```

## 📱 设备检测

### JavaScript 检测

```typescript
// 检测设备类型
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768

// 检测屏幕宽度
const isSmallScreen = window.matchMedia('(max-width: 768px)').matches
const isMediumScreen = window.matchMedia('(max-width: 992px)').matches

// 监听屏幕变化
const mql = window.matchMedia('(max-width: 768px)')
mql.addEventListener('change', (e) => {
  if (e.matches) {
    // 切换到小屏
  } else {
    // 切换到大屏
  }
})
```

### Vue Composable

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint() {
  const isMobile = ref(false)
  const isTablet = ref(false)

  const updateBreakpoint = () => {
    isMobile.value = window.innerWidth < 768
    isTablet.value = window.innerWidth >= 768 && window.innerWidth < 992
  }

  onMounted(() => {
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint)
  })

  return { isMobile, isTablet }
}
```

## ✅ 最佳实践

1. **移动优先** - 从小屏开始设计
2. **使用 Mixin** - 统一响应式写法
3. **避免硬编码** - 使用预定义断点
4. **性能优化** - 合理使用媒体查询
5. **测试多端** - 确保各断点正常

响应式工具简化了多端适配开发,提高了开发效率。
