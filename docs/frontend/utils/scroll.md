# 滚动工具 (scroll.ts)

滚动相关工具函数，提供平滑滚动、位置控制、可见性检测等功能，让页面滚动体验更加流畅和用户友好。

## 📖 概述

滚动工具库包含以下核心功能：
- **滚动动画控制**：提供动画缓动和平滑切换
- **滚动位置操作**：获取和设置页面滚动位置
- **平滑滚动导航**：滚动到指定位置或元素
- **可见性检测**：检查元素是否在视口内可见

## 🎨 动画控制函数

### easeInOutQuad

二次缓动函数，提供平滑的开始和结束动画效果。

```typescript
easeInOutQuad(t: number, b: number, c: number, d: number): number
```

**参数：**
- `t` - 当前时间
- `b` - 起始值
- `c` - 变化量
- `d` - 持续时间

**返回值：**
- `number` - 当前时间对应的值

**特点：**
- 动画开始时缓慢加速
- 中段快速运动
- 结束时平滑减速
- 提供自然的用户体验

### requestAnimFrame

`requestAnimationFrame` 的跨浏览器兼容版本，用于智能动画控制。

```typescript
const requestAnimFrame: (callback: FrameRequestCallback) => void
```

**特点：**
- 自动检测浏览器支持
- 提供降级方案（60fps setTimeout）
- 优化性能和电池使用
- 确保动画流畅运行

## 📍 位置操作

### getScrollPosition

获取当前页面的滚动位置。

```typescript
getScrollPosition(): number
```

**返回值：**
- `number` - 当前滚动位置（像素）

**示例：**
```typescript
// 获取当前滚动位置
const currentPos = getScrollPosition()
console.log(`当前滚动到: ${currentPos}px`)

// 在滚动事件中使用
window.addEventListener('scroll', () => {
  const scrollTop = getScrollPosition()
  
  if (scrollTop > 100) {
    // 显示回到顶部按钮
    showBackToTopButton()
  } else {
    // 隐藏回到顶部按钮
    hideBackToTopButton()
  }
})
```

### setScrollPosition

设置页面滚动位置。

```typescript
setScrollPosition(position: number): void
```

**参数：**
- `position` - 滚动位置（像素）

**示例：**
```typescript
// 立即滚动到指定位置
setScrollPosition(500)

// 保存和恢复滚动位置
const savedPosition = getScrollPosition()
// ... 进行其他操作
setScrollPosition(savedPosition)
```

**特点：**
- 兼容多种DOM结构
- 同时设置多个可能的滚动元素
- 确保在各种环境下都能正常工作

## 🚀 平滑滚动

### scrollTo

平滑滚动到指定位置。

```typescript
scrollTo(to: number, duration?: number, callback?: () => void): void
```

**参数：**
- `to` - 目标位置（像素）
- `duration` - 动画持续时间（毫秒），默认为500ms
- `callback` - 滚动完成后的回调函数

**示例：**
```typescript
// 基本使用：滚动到500px位置
scrollTo(500)

// 自定义动画时间
scrollTo(1000, 1000) // 1秒内滚动到1000px

// 带回调函数
scrollTo(800, 600, () => {
  console.log('滚动完成！')
  // 可以在这里执行其他操作
  highlightTargetElement()
})

// 实际应用：点击导航滚动到对应部分
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const targetId = link.getAttribute('href').substring(1)
    const targetElement = document.getElementById(targetId)
    const targetPosition = targetElement.offsetTop
    
    scrollTo(targetPosition, 800, () => {
      // 更新URL但不触发页面跳转
      history.pushState(null, '', `#${targetId}`)
    })
  })
})
```

### scrollToTop

滚动到页面顶部的快捷方法。

```typescript
scrollToTop(duration?: number, callback?: () => void): void
```

**参数：**
- `duration` - 动画持续时间（毫秒），默认为500ms
- `callback` - 滚动完成后的回调函数

**示例：**
```typescript
// 基本使用
scrollToTop()

// 慢速滚动到顶部
scrollToTop(1500)

// 带回调的回到顶部
scrollToTop(800, () => {
  console.log('已回到页面顶部')
  // 可以在这里隐藏"回到顶部"按钮
  hideBackToTopButton()
})

// 回到顶部按钮实现
const backToTopBtn = document.querySelector('.back-to-top')
backToTopBtn.addEventListener('click', () => {
  scrollToTop(600)
})
```

### scrollToElement

滚动到指定元素位置。

```typescript
scrollToElement(
  element: HTMLElement | string, 
  offset?: number, 
  duration?: number, 
  callback?: () => void
): void
```

**参数：**
- `element` - 目标元素或元素选择器
- `offset` - 偏移量（像素），默认为0
- `duration` - 动画持续时间（毫秒），默认为500ms
- `callback` - 滚动完成后的回调函数

**示例：**
```typescript
// 滚动到指定元素
const targetElement = document.querySelector('.target-section')
scrollToElement(targetElement)

// 使用选择器
scrollToElement('.about-section')

// 带偏移量（考虑固定头部）
scrollToElement('.content', -80) // 向上偏移80px

// 完整配置
scrollToElement('.contact', -100, 1000, () => {
  console.log('已滚动到联系我们部分')
  // 高亮显示目标元素
  targetElement.classList.add('highlight')
})

// 实际应用：锚点导航
class SmoothNavigation {
  constructor() {
    this.bindEvents()
  }
  
  bindEvents() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const targetId = link.getAttribute('href')
        
        scrollToElement(targetId, -60, 800, () => {
          // 更新活动导航项
          this.updateActiveNav(targetId)
        })
      })
    })
  }
  
  updateActiveNav(targetId: string) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active')
    })
    
    const activeLink = document.querySelector(`[href="${targetId}"]`)
    if (activeLink) {
      activeLink.classList.add('active')
    }
  }
}

const smoothNav = new SmoothNavigation()
```

## 👁️ 可见性检测

### isElementInViewport

检查元素是否在视口内可见。

```typescript
isElementInViewport(element: HTMLElement, partiallyVisible?: boolean): boolean
```

**参数：**
- `element` - 要检查的元素
- `partiallyVisible` - 是否计算部分可见，默认为false（完全可见）

**返回值：**
- `boolean` - 元素是否在视口内

**示例：**
```typescript
const element = document.querySelector('.animate-on-scroll')

// 检查元素是否完全可见
if (isElementInViewport(element)) {
  console.log('元素完全可见')
  element.classList.add('animate')
}

// 检查元素是否部分可见
if (isElementInViewport(element, true)) {
  console.log('元素至少部分可见')
  element.classList.add('fade-in')
}

// 滚动监听实现懒加载
window.addEventListener('scroll', () => {
  document.querySelectorAll('.lazy-load').forEach(img => {
    if (isElementInViewport(img, true)) {
      // 加载图片
      img.src = img.dataset.src
      img.classList.remove('lazy-load')
    }
  })
})
```

## 💡 实际应用场景

### 1. 平滑导航系统

```typescript
class SmoothScrollNavigation {
  private navItems: NodeListOf<HTMLElement>
  private sections: NodeListOf<HTMLElement>
  private headerHeight: number
  
  constructor() {
    this.navItems = document.querySelectorAll('.nav-item')
    this.sections = document.querySelectorAll('.section')
    this.headerHeight = 80
    
    this.bindEvents()
    this.updateActiveOnScroll()
  }
  
  bindEvents() {
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault()
        const targetId = item.getAttribute('href')?.substring(1)
        const targetSection = document.getElementById(targetId)
        
        if (targetSection) {
          scrollToElement(targetSection, -this.headerHeight, 800, () => {
            this.updateActiveNav(item)
          })
        }
      })
    })
  }
  
  updateActiveOnScroll() {
    window.addEventListener('scroll', () => {
      const scrollPos = getScrollPosition() + this.headerHeight + 50
      
      this.sections.forEach((section, index) => {
        const sectionTop = section.offsetTop
        const sectionBottom = sectionTop + section.offsetHeight
        
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          this.updateActiveNav(this.navItems[index])
        }
      })
    })
  }
  
  updateActiveNav(activeItem: HTMLElement) {
    this.navItems.forEach(item => item.classList.remove('active'))
    activeItem.classList.add('active')
  }
}
```

### 2. 回到顶部按钮

```typescript
class BackToTopButton {
  private button: HTMLElement
  private threshold: number
  
  constructor(selector: string, threshold: number = 300) {
    this.button = document.querySelector(selector)
    this.threshold = threshold
    
    this.bindEvents()
    this.handleScroll()
  }
  
  bindEvents() {
    this.button.addEventListener('click', () => {
      scrollToTop(800, () => {
        this.button.classList.add('success')
        setTimeout(() => {
          this.button.classList.remove('success')
        }, 1000)
      })
    })
    
    window.addEventListener('scroll', () => {
      this.handleScroll()
    })
  }
  
  handleScroll() {
    const scrollPos = getScrollPosition()
    
    if (scrollPos > this.threshold) {
      this.button.classList.add('show')
    } else {
      this.button.classList.remove('show')
    }
  }
}

// 使用
const backToTop = new BackToTopButton('.back-to-top', 500)
```

### 3. 滚动动画触发器

```typescript
class ScrollAnimationTrigger {
  private elements: NodeListOf<HTMLElement>
  private animatedElements: Set<HTMLElement>
  
  constructor() {
    this.elements = document.querySelectorAll('.scroll-animate')
    this.animatedElements = new Set()
    
    this.bindScrollEvent()
    this.checkVisibility() // 初始检查
  }
  
  bindScrollEvent() {
    let ticking = false
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.checkVisibility()
          ticking = false
        })
        ticking = true
      }
    })
  }
  
  checkVisibility() {
    this.elements.forEach(element => {
      if (this.animatedElements.has(element)) return
      
      if (isElementInViewport(element, true)) {
        this.triggerAnimation(element)
        this.animatedElements.add(element)
      }
    })
  }
  
  triggerAnimation(element: HTMLElement) {
    const animationType = element.dataset.animation || 'fadeIn'
    const delay = parseInt(element.dataset.delay || '0')
    
    setTimeout(() => {
      element.classList.add('animate', animationType)
    }, delay)
  }
}

// 使用
const scrollTrigger = new ScrollAnimationTrigger()
```

### 4. 无限滚动加载

```typescript
class InfiniteScroll {
  private container: HTMLElement
  private loading: boolean = false
  private page: number = 1
  private hasMore: boolean = true
  
  constructor(containerSelector: string) {
    this.container = document.querySelector(containerSelector)
    this.bindScrollEvent()
  }
  
  bindScrollEvent() {
    window.addEventListener('scroll', () => {
      if (this.shouldLoadMore()) {
        this.loadMore()
      }
    })
  }
  
  shouldLoadMore(): boolean {
    if (this.loading || !this.hasMore) return false
    
    const scrollPos = getScrollPosition()
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // 距离底部还有200px时开始加载
    return scrollPos + windowHeight >= documentHeight - 200
  }
  
  async loadMore() {
    this.loading = true
    this.showLoading()
    
    try {
      const data = await this.fetchData(this.page)
      if (data.length === 0) {
        this.hasMore = false
      } else {
        this.renderData(data)
        this.page++
      }
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      this.loading = false
      this.hideLoading()
    }
  }
  
  async fetchData(page: number): Promise<any[]> {
    // 模拟API调用
    const response = await fetch(`/api/data?page=${page}`)
    return response.json()
  }
  
  renderData(data: any[]) {
    data.forEach(item => {
      const element = this.createDataElement(item)
      this.container.appendChild(element)
    })
  }
  
  createDataElement(item: any): HTMLElement {
    const div = document.createElement('div')
    div.className = 'data-item scroll-animate'
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.content}</p>
    `
    return div
  }
  
  showLoading() {
    const loader = document.querySelector('.loading')
    if (loader) loader.classList.add('show')
  }
  
  hideLoading() {
    const loader = document.querySelector('.loading')
    if (loader) loader.classList.remove('show')
  }
}

// 使用
const infiniteScroll = new InfiniteScroll('.content-container')
```

### 5. 滚动进度指示器

```typescript
class ScrollProgressIndicator {
  private progressBar: HTMLElement
  private progressText: HTMLElement
  
  constructor() {
    this.createProgressBar()
    this.bindScrollEvent()
  }
  
  createProgressBar() {
    // 创建进度条
    this.progressBar = document.createElement('div')
    this.progressBar.className = 'scroll-progress-bar'
    document.body.appendChild(this.progressBar)
    
    // 创建进度文本（可选）
    this.progressText = document.createElement('div')
    this.progressText.className = 'scroll-progress-text'
    document.body.appendChild(this.progressText)
  }
  
  bindScrollEvent() {
    window.addEventListener('scroll', () => {
      this.updateProgress()
    })
  }
  
  updateProgress() {
    const scrollTop = getScrollPosition()
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = Math.min((scrollTop / docHeight) * 100, 100)
    
    // 更新进度条
    this.progressBar.style.width = `${progress}%`
    
    // 更新进度文本
    this.progressText.textContent = `${Math.round(progress)}%`
    
    // 根据进度改变样式
    if (progress > 80) {
      this.progressBar.classList.add('near-end')
    } else {
      this.progressBar.classList.remove('near-end')
    }
  }
}

// 使用
const progressIndicator = new ScrollProgressIndicator()
```

## 🎨 CSS 配合使用

这些滚动工具通常需要配合相应的CSS样式：

```css
/* 平滑滚动（CSS方式，作为备选） */
html {
  scroll-behavior: smooth;
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-to-top.show {
  opacity: 1;
  transform: translateY(0);
}

.back-to-top.success {
  background: #28a745;
  transform: scale(1.1);
}

/* 滚动动画 */
.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.scroll-animate.animate {
  opacity: 1;
  transform: translateY(0);
}

/* 滚动进度条 */
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #007bff, #28a745);
  z-index: 9999;
  transition: width 0.1s ease;
}

.scroll-progress-bar.near-end {
  background: linear-gradient(90deg, #28a745, #ffc107);
}

/* 导航激活状态 */
.nav-item.active {
  color: #007bff;
  font-weight: bold;
}

/* 加载器 */
.loading {
  text-align: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.loading.show {
  opacity: 1;
}
```

## ⚡ 性能优化建议

### 1. 节流滚动事件

```typescript
import { throttle } from './function' // 假设有节流函数

// ❌ 不推荐：频繁触发
window.addEventListener('scroll', () => {
  checkElementsVisibility()
})

// ✅ 推荐：节流处理
window.addEventListener('scroll', throttle(() => {
  checkElementsVisibility()
}, 100))
```

### 2. 使用 Intersection Observer

```typescript
// 现代浏览器推荐使用 Intersection Observer
class ModernScrollAnimationTrigger {
  private observer: IntersectionObserver
  
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.triggerAnimation(entry.target as HTMLElement)
            this.observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    
    document.querySelectorAll('.scroll-animate').forEach(el => {
      this.observer.observe(el)
    })
  }
  
  triggerAnimation(element: HTMLElement) {
    element.classList.add('animate')
  }
}
```

### 3. 缓存DOM查询

```typescript
// ❌ 不推荐：重复查询DOM
function handleScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll') // 每次都查询
  // ...
}

// ✅ 推荐：缓存DOM引用
class ScrollHandler {
  private elements: NodeListOf<HTMLElement>
  
  constructor() {
    this.elements = document.querySelectorAll('.animate-on-scroll') // 只查询一次
  }
  
  handleScroll() {
    this.elements.forEach(element => {
      // 使用缓存的引用
    })
  }
}
```

## ⚠️ 注意事项

1. **兼容性**：某些功能在老旧浏览器中可能需要polyfill
2. **性能影响**：频繁的滚动事件监听可能影响性能，建议使用节流
3. **内存泄漏**：记得在组件销毁时移除事件监听器
4. **移动端适配**：在移动设备上测试滚动体验
5. **可访问性**：考虑用户的减少动画偏好设置

## ❓ 常见问题

### 1. 平滑滚动在某些浏览器上不生效

**问题描述：**

使用 `scrollTo` 或 `scrollToElement` 函数时，在某些浏览器上滚动动画不生效，直接跳转到目标位置。

```typescript
// 期望平滑滚动，但实际表现为瞬间跳转
scrollToElement('.target-section', 0, 800)
```

**问题原因：**

- 浏览器不支持 `requestAnimationFrame` API
- CSS 设置了 `scroll-behavior: auto` 与 JS 动画冲突
- 页面使用了自定义滚动容器而非 `window`
- 某些浏览器安全策略阻止了动画帧调用
- 浏览器处于后台标签页时暂停动画

**解决方案：**

```typescript
// ❌ 错误：未考虑兼容性和滚动容器
const scrollToTarget = (target: string) => {
  scrollToElement(target)
}

// ✅ 正确：完善的兼容性处理和容器检测
class ScrollManager {
  private scrollContainer: HTMLElement | Window
  private rafSupported: boolean

  constructor(containerSelector?: string) {
    // 检测滚动容器
    if (containerSelector) {
      this.scrollContainer = document.querySelector(containerSelector) || window
    } else {
      this.scrollContainer = window
    }

    // 检测 requestAnimationFrame 支持
    this.rafSupported = typeof window.requestAnimationFrame === 'function'
  }

  scrollTo(to: number, duration: number = 500, callback?: () => void): void {
    const start = this.getScrollPosition()
    const change = to - start
    const startTime = performance.now()

    // 无动画帧支持时直接设置位置
    if (!this.rafSupported || duration <= 0) {
      this.setScrollPosition(to)
      callback?.()
      return
    }

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 二次缓动
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const currentPosition = start + change * easeProgress
      this.setScrollPosition(currentPosition)

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        callback?.()
      }
    }

    requestAnimationFrame(animateScroll)
  }

  private getScrollPosition(): number {
    if (this.scrollContainer === window) {
      return window.pageYOffset || document.documentElement.scrollTop
    }
    return (this.scrollContainer as HTMLElement).scrollTop
  }

  private setScrollPosition(position: number): void {
    if (this.scrollContainer === window) {
      window.scrollTo(0, position)
    } else {
      (this.scrollContainer as HTMLElement).scrollTop = position
    }
  }
}

// 使用示例
const windowScroll = new ScrollManager()
const containerScroll = new ScrollManager('.scroll-container')

windowScroll.scrollTo(500, 800, () => {
  console.log('滚动完成')
})
```

---

### 2. 滚动事件监听导致页面卡顿

**问题描述：**

添加滚动事件监听后，页面在滚动时出现明显卡顿，帧率下降，用户体验变差。

```typescript
// 直接监听滚动事件
window.addEventListener('scroll', () => {
  // 每次滚动都执行大量DOM操作
  updateNavigation()
  checkVisibility()
  updateProgress()
  loadMoreContent()
})
```

**问题原因：**

- 滚动事件触发频率极高（每秒可达几十次）
- 每次触发都执行大量计算或DOM操作
- 没有使用节流或防抖优化
- 强制同步布局（读写DOM交替）导致重排
- 事件处理函数阻塞主线程

**解决方案：**

```typescript
// ❌ 错误：未优化的滚动处理
window.addEventListener('scroll', () => {
  const elements = document.querySelectorAll('.item')
  elements.forEach(el => {
    el.style.transform = `translateY(${getScrollPosition()}px)`
  })
})

// ✅ 正确：使用多种优化策略的滚动处理
class OptimizedScrollHandler {
  private ticking: boolean = false
  private lastKnownScrollPosition: number = 0
  private elements: HTMLElement[] = []
  private rafId: number | null = null

  constructor() {
    // 缓存DOM查询
    this.elements = Array.from(document.querySelectorAll('.item'))
    this.bindEvents()
  }

  private bindEvents(): void {
    // 使用 passive: true 提升滚动性能
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true })
  }

  private onScroll(): void {
    this.lastKnownScrollPosition = getScrollPosition()

    // 使用 requestAnimationFrame 节流
    if (!this.ticking) {
      this.rafId = requestAnimationFrame(() => {
        this.update(this.lastKnownScrollPosition)
        this.ticking = false
      })
      this.ticking = true
    }
  }

  private update(scrollPosition: number): void {
    // 批量读取布局信息
    const viewportHeight = window.innerHeight
    const positions = this.elements.map(el => ({
      el,
      top: el.offsetTop,
      height: el.offsetHeight
    }))

    // 批量写入样式
    requestAnimationFrame(() => {
      positions.forEach(({ el, top, height }) => {
        const isVisible = top < scrollPosition + viewportHeight &&
                         top + height > scrollPosition

        if (isVisible) {
          el.classList.add('visible')
        } else {
          el.classList.remove('visible')
        }
      })
    })
  }

  // 使用节流函数处理特定场景
  private throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }

  destroy(): void {
    window.removeEventListener('scroll', this.onScroll.bind(this))
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }
}

// 使用 Intersection Observer 替代滚动监听
class VisibilityObserver {
  private observer: IntersectionObserver

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: options?.root || null,
        rootMargin: options?.rootMargin || '0px',
        threshold: options?.threshold || [0, 0.25, 0.5, 0.75, 1]
      }
    )
  }

  observe(elements: NodeListOf<Element> | Element[]): void {
    elements.forEach(el => this.observer.observe(el))
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const target = entry.target as HTMLElement

      if (entry.isIntersecting) {
        target.classList.add('in-view')
        target.style.setProperty('--visibility-ratio', String(entry.intersectionRatio))
      } else {
        target.classList.remove('in-view')
      }
    })
  }

  disconnect(): void {
    this.observer.disconnect()
  }
}

// 使用示例
const visibilityObserver = new VisibilityObserver({
  threshold: [0, 0.5, 1]
})
visibilityObserver.observe(document.querySelectorAll('.animate-on-scroll'))
```

---

### 3. 固定头部导致滚动位置计算错误

**问题描述：**

页面有固定定位的头部导航栏时，使用 `scrollToElement` 滚动到目标元素后，元素被头部遮挡。

```typescript
// 滚动后目标元素被固定头部遮挡
scrollToElement('#section-2')
```

**问题原因：**

- 未考虑固定定位头部的高度偏移
- 头部高度可能随屏幕尺寸变化
- 多级固定元素（如固定头部+固定标签栏）叠加
- 响应式设计下头部高度不一致
- 头部可能动态显示/隐藏

**解决方案：**

```typescript
// ❌ 错误：硬编码固定偏移值
scrollToElement('#section', -80)

// ✅ 正确：动态计算头部高度和偏移
class SmartScrollNavigation {
  private headerSelector: string
  private additionalOffset: number

  constructor(headerSelector: string = '.fixed-header', additionalOffset: number = 20) {
    this.headerSelector = headerSelector
    this.additionalOffset = additionalOffset
  }

  /**
   * 获取当前固定元素的总高度
   */
  private getFixedElementsHeight(): number {
    const fixedElements = document.querySelectorAll(
      `${this.headerSelector}, .fixed-nav, .sticky-banner`
    )

    let totalHeight = 0

    fixedElements.forEach(el => {
      const styles = window.getComputedStyle(el)
      const position = styles.position

      // 只计算固定定位和粘性定位的元素
      if (position === 'fixed' || position === 'sticky') {
        const display = styles.display
        const visibility = styles.visibility

        // 排除隐藏元素
        if (display !== 'none' && visibility !== 'hidden') {
          const rect = el.getBoundingClientRect()
          // 只计算在视口顶部的固定元素
          if (rect.top >= 0 && rect.top < 100) {
            totalHeight = Math.max(totalHeight, rect.bottom)
          }
        }
      }
    })

    return totalHeight
  }

  /**
   * 滚动到指定元素，自动处理偏移
   */
  scrollToElement(
    selector: string,
    duration: number = 500,
    callback?: () => void
  ): void {
    const element = document.querySelector(selector) as HTMLElement
    if (!element) {
      console.warn(`Element not found: ${selector}`)
      return
    }

    const elementRect = element.getBoundingClientRect()
    const absoluteTop = elementRect.top + getScrollPosition()
    const offset = this.getFixedElementsHeight() + this.additionalOffset
    const targetPosition = absoluteTop - offset

    scrollTo(Math.max(0, targetPosition), duration, callback)
  }

  /**
   * 监听头部高度变化并更新偏移
   */
  observeHeaderChanges(callback?: (height: number) => void): void {
    const header = document.querySelector(this.headerSelector)
    if (!header) return

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) {
        const newHeight = entry.contentRect.height
        callback?.(newHeight)
      }
    })

    resizeObserver.observe(header)
  }
}

// 使用示例
const navigation = new SmartScrollNavigation('.site-header', 16)

// 锚点导航
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const target = link.getAttribute('href') || ''
    navigation.scrollToElement(target, 600)
  })
})

// 监听头部高度变化
navigation.observeHeaderChanges((height) => {
  console.log('Header height changed:', height)
})
```

---

### 4. 滚动动画与 CSS scroll-behavior 冲突

**问题描述：**

当页面 CSS 设置了 `scroll-behavior: smooth` 时，JavaScript 滚动动画出现异常，表现为滚动速度不一致或动画中断。

```css
/* 页面全局样式 */
html {
  scroll-behavior: smooth;
}
```

```typescript
// JS 动画与 CSS 动画冲突
scrollTo(1000, 500) // 动画表现异常
```

**问题原因：**

- CSS `scroll-behavior` 和 JS 动画同时作用
- 两种动画的缓动曲线和时间不一致
- 浏览器对两种滚动方式的处理优先级不同
- 在动画过程中设置新的滚动位置会中断动画

**解决方案：**

```typescript
// ❌ 错误：不考虑 CSS scroll-behavior 的存在
const scrollToPosition = (position: number) => {
  scrollTo(position, 500)
}

// ✅ 正确：在 JS 动画期间临时禁用 CSS scroll-behavior
class HybridScrollManager {
  private originalBehavior: string = ''
  private isAnimating: boolean = false

  /**
   * 临时禁用 CSS 平滑滚动
   */
  private disableCSSSmooth(): void {
    const html = document.documentElement
    this.originalBehavior = getComputedStyle(html).scrollBehavior
    html.style.scrollBehavior = 'auto'
  }

  /**
   * 恢复 CSS 平滑滚动设置
   */
  private restoreCSSSmooth(): void {
    document.documentElement.style.scrollBehavior = this.originalBehavior
  }

  /**
   * 使用 JS 动画滚动（自动处理冲突）
   */
  scrollWithJS(
    to: number,
    duration: number = 500,
    callback?: () => void
  ): void {
    if (this.isAnimating) return

    this.isAnimating = true
    this.disableCSSSmooth()

    scrollTo(to, duration, () => {
      this.isAnimating = false
      // 延迟恢复，确保动画完全结束
      setTimeout(() => {
        this.restoreCSSSmooth()
      }, 50)
      callback?.()
    })
  }

  /**
   * 使用 CSS 原生平滑滚动
   */
  scrollWithCSS(to: number): void {
    if (this.isAnimating) return

    // 确保 CSS scroll-behavior 处于 smooth 状态
    const html = document.documentElement
    const currentBehavior = getComputedStyle(html).scrollBehavior

    if (currentBehavior !== 'smooth') {
      html.style.scrollBehavior = 'smooth'
    }

    window.scrollTo({
      top: to,
      behavior: 'smooth'
    })
  }

  /**
   * 智能选择滚动方式
   */
  smartScroll(
    to: number,
    options?: {
      duration?: number
      preferJS?: boolean
      callback?: () => void
    }
  ): void {
    const {
      duration = 500,
      preferJS = false,
      callback
    } = options || {}

    // 检测用户是否偏好减少动画
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      // 尊重用户偏好，直接跳转
      setScrollPosition(to)
      callback?.()
      return
    }

    if (preferJS || duration !== 500) {
      // 需要自定义时长或明确要求 JS 动画
      this.scrollWithJS(to, duration, callback)
    } else {
      // 使用 CSS 原生平滑滚动
      this.scrollWithCSS(to)
      // CSS 动画没有回调，需要估算时间
      if (callback) {
        const distance = Math.abs(to - getScrollPosition())
        const estimatedDuration = Math.min(distance * 0.5, 1000)
        setTimeout(callback, estimatedDuration)
      }
    }
  }
}

// 使用示例
const scrollManager = new HybridScrollManager()

// 使用 JS 动画（精确控制时长）
scrollManager.scrollWithJS(1000, 800, () => {
  console.log('JS 动画完成')
})

// 使用 CSS 原生动画（简单快速）
scrollManager.scrollWithCSS(500)

// 智能选择
scrollManager.smartScroll(800, {
  preferJS: false,
  callback: () => console.log('滚动完成')
})
```

---

### 5. 组件销毁后滚动事件监听器未清理导致内存泄漏

**问题描述：**

在 Vue 组件中使用滚动监听，组件销毁后事件监听器未被移除，导致内存泄漏和控制台错误。

```typescript
// Vue 组件中
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

// 忘记在 onUnmounted 中移除监听器
```

**问题原因：**

- 未在组件销毁时移除事件监听器
- 使用箭头函数或 `.bind()` 创建的新函数无法正确移除
- 多次挂载组件导致重复添加监听器
- 异步操作完成时组件已销毁
- 闭包引用阻止垃圾回收

**解决方案：**

```typescript
// ❌ 错误：无法正确移除的监听器
export default {
  mounted() {
    window.addEventListener('scroll', () => {
      this.handleScroll()
    })
  },
  unmounted() {
    // 无法移除匿名函数
    window.removeEventListener('scroll', ???)
  }
}

// ✅ 正确：Vue 3 Composition API 完善的清理机制
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

export function useScrollHandler() {
  const scrollPosition = ref(0)
  const isScrolling = ref(false)

  // 保存函数引用以便正确移除
  let scrollHandler: ((e: Event) => void) | null = null
  let scrollEndTimer: ReturnType<typeof setTimeout> | null = null
  let rafId: number | null = null

  const handleScroll = () => {
    // 使用 RAF 节流
    if (rafId) return

    rafId = requestAnimationFrame(() => {
      scrollPosition.value = getScrollPosition()
      isScrolling.value = true

      // 清除之前的定时器
      if (scrollEndTimer) {
        clearTimeout(scrollEndTimer)
      }

      // 滚动结束检测
      scrollEndTimer = setTimeout(() => {
        isScrolling.value = false
      }, 150)

      rafId = null
    })
  }

  const startListening = () => {
    if (scrollHandler) return // 防止重复添加

    scrollHandler = handleScroll
    window.addEventListener('scroll', scrollHandler, { passive: true })
  }

  const stopListening = () => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler)
      scrollHandler = null
    }

    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer)
      scrollEndTimer = null
    }

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  // 组件挂载时开始监听
  onMounted(() => {
    startListening()
  })

  // 组件销毁时停止监听
  onUnmounted(() => {
    stopListening()
  })

  // 支持 keep-alive 的组件
  onActivated(() => {
    startListening()
  })

  onDeactivated(() => {
    stopListening()
  })

  return {
    scrollPosition,
    isScrolling,
    startListening,
    stopListening
  }
}

// 使用 VueUse 的 useEventListener（自动清理）
import { useEventListener, useThrottleFn } from '@vueuse/core'

export function useScrollWithVueUse() {
  const scrollY = ref(0)

  const updateScrollPosition = useThrottleFn(() => {
    scrollY.value = getScrollPosition()
  }, 100)

  // useEventListener 会自动在组件卸载时移除监听器
  useEventListener(window, 'scroll', updateScrollPosition, { passive: true })

  return {
    scrollY
  }
}

// 类组件的清理模式
class ScrollComponent {
  private cleanupFunctions: Array<() => void> = []

  addCleanup(fn: () => void): void {
    this.cleanupFunctions.push(fn)
  }

  destroy(): void {
    this.cleanupFunctions.forEach(fn => fn())
    this.cleanupFunctions = []
  }

  init(): void {
    const handleScroll = () => {
      // 处理滚动
    }

    window.addEventListener('scroll', handleScroll)

    // 注册清理函数
    this.addCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  }
}
```

---

### 6. 动态内容加载后文档高度变化导致滚动位置异常

**问题描述：**

页面加载动态内容（如图片、异步数据）后，文档总高度变化，导致滚动位置计算不准确，无限滚动加载或进度指示器表现异常。

```typescript
// 进度计算在内容加载后变得不准确
const progress = (scrollTop / (docHeight - windowHeight)) * 100
// docHeight 在图片加载后会增加，导致进度条回退
```

**问题原因：**

- 图片等资源加载完成前占位高度为0
- 异步数据加载后动态插入内容
- 懒加载内容改变文档高度
- 折叠/展开组件改变高度
- 虚拟滚动列表高度计算延迟

**解决方案：**

```typescript
// ❌ 错误：不考虑动态内容的高度变化
class SimpleProgressIndicator {
  update(): void {
    const docHeight = document.documentElement.scrollHeight
    const progress = getScrollPosition() / (docHeight - window.innerHeight)
    this.setProgress(progress)
  }
}

// ✅ 正确：处理动态内容高度变化的滚动进度指示器
class AdaptiveProgressIndicator {
  private progressBar: HTMLElement
  private cachedDocHeight: number = 0
  private resizeObserver: ResizeObserver
  private mutationObserver: MutationObserver
  private updateScheduled: boolean = false

  constructor(progressBarSelector: string) {
    this.progressBar = document.querySelector(progressBarSelector) as HTMLElement
    this.setupObservers()
    this.bindEvents()
  }

  private setupObservers(): void {
    // 监听文档大小变化
    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleUpdate()
    })
    this.resizeObserver.observe(document.body)

    // 监听 DOM 变化（新内容插入）
    this.mutationObserver = new MutationObserver((mutations) => {
      const hasStructuralChanges = mutations.some(
        mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0
      )

      if (hasStructuralChanges) {
        this.scheduleUpdate()
      }
    })

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  private bindEvents(): void {
    window.addEventListener('scroll', () => this.scheduleUpdate(), { passive: true })

    // 监听图片加载完成
    document.addEventListener('load', (e) => {
      if ((e.target as HTMLElement)?.tagName === 'IMG') {
        this.scheduleUpdate()
      }
    }, true)
  }

  private scheduleUpdate(): void {
    if (this.updateScheduled) return

    this.updateScheduled = true
    requestAnimationFrame(() => {
      this.update()
      this.updateScheduled = false
    })
  }

  private update(): void {
    const scrollTop = getScrollPosition()
    const windowHeight = window.innerHeight
    const docHeight = document.documentElement.scrollHeight

    // 检测高度变化
    if (Math.abs(docHeight - this.cachedDocHeight) > 50) {
      this.cachedDocHeight = docHeight
      // 可以在这里触发高度变化回调
    }

    const maxScroll = docHeight - windowHeight

    if (maxScroll <= 0) {
      // 内容不足以滚动
      this.setProgress(100)
      return
    }

    const progress = Math.min((scrollTop / maxScroll) * 100, 100)
    this.setProgress(progress)
  }

  private setProgress(progress: number): void {
    this.progressBar.style.width = `${progress}%`
    this.progressBar.setAttribute('aria-valuenow', String(Math.round(progress)))
  }

  destroy(): void {
    this.resizeObserver.disconnect()
    this.mutationObserver.disconnect()
  }
}

// 无限滚动的高度变化处理
class AdaptiveInfiniteScroll {
  private lastDocHeight: number = 0
  private loading: boolean = false
  private hasMore: boolean = true

  shouldLoadMore(): boolean {
    if (this.loading || !this.hasMore) return false

    const scrollTop = getScrollPosition()
    const windowHeight = window.innerHeight
    const docHeight = document.documentElement.scrollHeight

    // 记录高度变化
    if (docHeight !== this.lastDocHeight) {
      this.lastDocHeight = docHeight
    }

    // 使用相对距离而非绝对值
    const scrollableHeight = docHeight - windowHeight
    const scrollPercentage = scrollTop / scrollableHeight

    // 滚动超过 80% 时加载更多
    return scrollPercentage > 0.8
  }

  async loadMore(): Promise<void> {
    this.loading = true

    try {
      // 加载新内容
      const newItems = await this.fetchItems()

      if (newItems.length === 0) {
        this.hasMore = false
        return
      }

      // 保存当前滚动位置
      const scrollBefore = getScrollPosition()

      // 插入新内容
      this.appendItems(newItems)

      // 等待 DOM 更新
      await this.waitForDOMUpdate()

      // 某些情况下可能需要恢复滚动位置
      // setScrollPosition(scrollBefore)
    } finally {
      this.loading = false
    }
  }

  private waitForDOMUpdate(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve()
        })
      })
    })
  }

  private async fetchItems(): Promise<unknown[]> {
    // 模拟 API 调用
    return []
  }

  private appendItems(items: unknown[]): void {
    // 追加内容到页面
  }
}
```

---

### 7. 页面导航后无法恢复之前的滚动位置

**问题描述：**

用户在列表页滚动到某个位置后点击进入详情页，返回时列表页回到了顶部，丢失了之前的滚动位置。

```typescript
// 用户在列表页滚动到第50项
// 点击进入详情页
// 点击返回按钮
// 列表页回到顶部，需要重新滚动找到之前的位置
```

**问题原因：**

- SPA 路由切换重新渲染组件，滚动位置丢失
- 浏览器默认的滚动恢复行为被覆盖
- 动态内容加载时滚动恢复过早执行
- 使用 `keep-alive` 时缓存策略不当
- 虚拟滚动列表无法正确恢复位置

**解决方案：**

```typescript
// ❌ 错误：简单保存滚动位置但时机不对
const saveScrollPosition = () => {
  sessionStorage.setItem('scrollPosition', String(getScrollPosition()))
}

const restoreScrollPosition = () => {
  const saved = sessionStorage.getItem('scrollPosition')
  if (saved) {
    setScrollPosition(parseInt(saved))
  }
}

// ✅ 正确：完善的滚动位置管理系统
import { ref, watch, nextTick, onMounted, onUnmounted, onActivated } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'

interface ScrollPositionEntry {
  position: number
  timestamp: number
  path: string
}

class ScrollPositionManager {
  private positions: Map<string, ScrollPositionEntry> = new Map()
  private maxAge: number = 30 * 60 * 1000 // 30分钟过期
  private storageKey: string = 'app_scroll_positions'

  constructor() {
    this.loadFromStorage()
    this.cleanExpired()
  }

  /**
   * 生成路由唯一标识
   */
  private getRouteKey(route: RouteLocationNormalized): string {
    // 使用路径和查询参数生成唯一 key
    const params = new URLSearchParams(route.query as Record<string, string>)
    params.sort()
    return `${route.path}?${params.toString()}`
  }

  /**
   * 保存当前滚动位置
   */
  save(route: RouteLocationNormalized): void {
    const key = this.getRouteKey(route)
    const position = getScrollPosition()

    // 只保存有意义的滚动位置
    if (position > 0) {
      this.positions.set(key, {
        position,
        timestamp: Date.now(),
        path: route.path
      })
      this.saveToStorage()
    }
  }

  /**
   * 恢复滚动位置
   */
  async restore(
    route: RouteLocationNormalized,
    options?: {
      smooth?: boolean
      waitForContent?: boolean
      maxWaitTime?: number
    }
  ): Promise<boolean> {
    const key = this.getRouteKey(route)
    const entry = this.positions.get(key)

    if (!entry) return false

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.positions.delete(key)
      return false
    }

    const { smooth = false, waitForContent = true, maxWaitTime = 1000 } = options || {}

    // 等待内容加载
    if (waitForContent) {
      await this.waitForContentReady(maxWaitTime)
    }

    // 确保文档高度足够
    const docHeight = document.documentElement.scrollHeight
    if (docHeight < entry.position + window.innerHeight) {
      // 文档高度不足，可能内容还未加载
      console.warn('Document height insufficient for scroll restore')
      return false
    }

    if (smooth) {
      scrollTo(entry.position, 300)
    } else {
      setScrollPosition(entry.position)
    }

    return true
  }

  /**
   * 等待内容准备就绪
   */
  private waitForContentReady(maxWait: number): Promise<void> {
    return new Promise(resolve => {
      let lastHeight = 0
      let stableCount = 0
      const checkInterval = 50
      let elapsed = 0

      const check = () => {
        const currentHeight = document.documentElement.scrollHeight

        if (currentHeight === lastHeight) {
          stableCount++
          // 高度稳定3次后认为内容已加载
          if (stableCount >= 3) {
            resolve()
            return
          }
        } else {
          stableCount = 0
          lastHeight = currentHeight
        }

        elapsed += checkInterval
        if (elapsed >= maxWait) {
          resolve()
          return
        }

        setTimeout(check, checkInterval)
      }

      check()
    })
  }

  /**
   * 清除过期记录
   */
  private cleanExpired(): void {
    const now = Date.now()

    this.positions.forEach((entry, key) => {
      if (now - entry.timestamp > this.maxAge) {
        this.positions.delete(key)
      }
    })

    this.saveToStorage()
  }

  private loadFromStorage(): void {
    try {
      const data = sessionStorage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.positions = new Map(Object.entries(parsed))
      }
    } catch {
      // 忽略解析错误
    }
  }

  private saveToStorage(): void {
    try {
      const obj = Object.fromEntries(this.positions)
      sessionStorage.setItem(this.storageKey, JSON.stringify(obj))
    } catch {
      // 忽略存储错误
    }
  }
}

// Vue Composable
export function useScrollRestore() {
  const route = useRoute()
  const router = useRouter()
  const manager = new ScrollPositionManager()
  const isRestoring = ref(false)

  // 路由离开前保存滚动位置
  const removeBeforeEach = router.beforeEach((to, from) => {
    if (from.path !== to.path) {
      manager.save(from)
    }
  })

  // 路由进入后恢复滚动位置
  const restorePosition = async () => {
    if (isRestoring.value) return
    isRestoring.value = true

    await nextTick()

    const restored = await manager.restore(route, {
      waitForContent: true,
      maxWaitTime: 1500
    })

    if (!restored) {
      // 如果没有保存的位置，滚动到顶部
      setScrollPosition(0)
    }

    isRestoring.value = false
  }

  onMounted(() => {
    restorePosition()
  })

  // 支持 keep-alive
  onActivated(() => {
    restorePosition()
  })

  onUnmounted(() => {
    removeBeforeEach()
  })

  return {
    isRestoring,
    savePosition: () => manager.save(route),
    restorePosition
  }
}
```

---

### 8. 多个滚动处理器相互冲突导致滚动行为异常

**问题描述：**

页面同时使用多个滚动相关功能（如导航高亮、回到顶部按钮、懒加载、进度条），它们之间产生冲突，导致性能问题或功能失效。

```typescript
// 多个独立的滚动监听
window.addEventListener('scroll', updateNavigation)
window.addEventListener('scroll', updateProgressBar)
window.addEventListener('scroll', checkLazyLoad)
window.addEventListener('scroll', showBackToTop)
// 每个监听器都在触发，造成性能浪费和潜在冲突
```

**问题原因：**

- 多个滚动监听器各自独立触发
- 缺乏统一的事件管理和调度
- 重复的 DOM 读写操作导致强制重排
- 多个组件竞争修改同一元素
- 异步操作时序不确定

**解决方案：**

```typescript
// ❌ 错误：分散的滚动监听
class Navigation {
  init() {
    window.addEventListener('scroll', () => this.update())
  }
}

class ProgressBar {
  init() {
    window.addEventListener('scroll', () => this.update())
  }
}

class LazyLoader {
  init() {
    window.addEventListener('scroll', () => this.check())
  }
}

// ✅ 正确：统一的滚动事件管理器
type ScrollCallback = (state: ScrollState) => void

interface ScrollState {
  position: number
  direction: 'up' | 'down' | 'none'
  velocity: number
  isAtTop: boolean
  isAtBottom: boolean
  progress: number
  timestamp: number
}

interface ScrollSubscription {
  id: string
  callback: ScrollCallback
  priority: number
  throttle?: number
  lastCall?: number
}

class UnifiedScrollManager {
  private static instance: UnifiedScrollManager
  private subscriptions: Map<string, ScrollSubscription> = new Map()
  private state: ScrollState
  private lastPosition: number = 0
  private lastTimestamp: number = 0
  private ticking: boolean = false
  private rafId: number | null = null

  private constructor() {
    this.state = this.createInitialState()
    this.bindEvents()
  }

  static getInstance(): UnifiedScrollManager {
    if (!UnifiedScrollManager.instance) {
      UnifiedScrollManager.instance = new UnifiedScrollManager()
    }
    return UnifiedScrollManager.instance
  }

  private createInitialState(): ScrollState {
    return {
      position: 0,
      direction: 'none',
      velocity: 0,
      isAtTop: true,
      isAtBottom: false,
      progress: 0,
      timestamp: Date.now()
    }
  }

  private bindEvents(): void {
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true })
  }

  private onScroll(): void {
    if (this.ticking) return

    this.ticking = true
    this.rafId = requestAnimationFrame(() => {
      this.updateState()
      this.notifySubscribers()
      this.ticking = false
    })
  }

  private updateState(): void {
    const now = Date.now()
    const position = getScrollPosition()
    const timeDelta = now - this.lastTimestamp
    const positionDelta = position - this.lastPosition

    const docHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    const maxScroll = docHeight - windowHeight

    this.state = {
      position,
      direction: positionDelta > 0 ? 'down' : positionDelta < 0 ? 'up' : 'none',
      velocity: timeDelta > 0 ? Math.abs(positionDelta) / timeDelta * 1000 : 0,
      isAtTop: position <= 0,
      isAtBottom: position >= maxScroll - 1,
      progress: maxScroll > 0 ? (position / maxScroll) * 100 : 0,
      timestamp: now
    }

    this.lastPosition = position
    this.lastTimestamp = now
  }

  private notifySubscribers(): void {
    const now = Date.now()

    // 按优先级排序执行
    const sortedSubscriptions = Array.from(this.subscriptions.values())
      .sort((a, b) => b.priority - a.priority)

    sortedSubscriptions.forEach(subscription => {
      // 检查节流
      if (subscription.throttle && subscription.lastCall) {
        if (now - subscription.lastCall < subscription.throttle) {
          return
        }
      }

      try {
        subscription.callback(this.state)
        subscription.lastCall = now
      } catch (error) {
        console.error(`Scroll handler error [${subscription.id}]:`, error)
      }
    })
  }

  /**
   * 订阅滚动事件
   */
  subscribe(
    id: string,
    callback: ScrollCallback,
    options?: {
      priority?: number
      throttle?: number
    }
  ): () => void {
    const subscription: ScrollSubscription = {
      id,
      callback,
      priority: options?.priority ?? 0,
      throttle: options?.throttle
    }

    this.subscriptions.set(id, subscription)

    // 立即执行一次，提供初始状态
    callback(this.state)

    // 返回取消订阅函数
    return () => {
      this.subscriptions.delete(id)
    }
  }

  /**
   * 获取当前滚动状态
   */
  getState(): ScrollState {
    return { ...this.state }
  }

  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    this.subscriptions.clear()
  }
}

// 使用统一管理器的各个功能模块
class NavigationHighlight {
  private unsubscribe: (() => void) | null = null

  init(): void {
    const manager = UnifiedScrollManager.getInstance()

    this.unsubscribe = manager.subscribe(
      'navigation-highlight',
      (state) => {
        this.updateActiveSection(state.position)
      },
      { priority: 10, throttle: 100 }
    )
  }

  private updateActiveSection(scrollPosition: number): void {
    // 更新导航高亮逻辑
  }

  destroy(): void {
    this.unsubscribe?.()
  }
}

class ProgressIndicator {
  private unsubscribe: (() => void) | null = null
  private progressBar: HTMLElement

  constructor(selector: string) {
    this.progressBar = document.querySelector(selector) as HTMLElement
  }

  init(): void {
    const manager = UnifiedScrollManager.getInstance()

    this.unsubscribe = manager.subscribe(
      'progress-indicator',
      (state) => {
        this.progressBar.style.width = `${state.progress}%`
      },
      { priority: 5 }
    )
  }

  destroy(): void {
    this.unsubscribe?.()
  }
}

class BackToTopButton {
  private unsubscribe: (() => void) | null = null
  private button: HTMLElement

  constructor(selector: string) {
    this.button = document.querySelector(selector) as HTMLElement
  }

  init(): void {
    const manager = UnifiedScrollManager.getInstance()

    this.unsubscribe = manager.subscribe(
      'back-to-top',
      (state) => {
        this.button.classList.toggle('show', state.position > 300)
        this.button.classList.toggle('hide-on-up', state.direction === 'up')
      },
      { priority: 3, throttle: 50 }
    )

    this.button.addEventListener('click', () => {
      scrollToTop(600)
    })
  }

  destroy(): void {
    this.unsubscribe?.()
  }
}

// Vue Composable 封装
export function useUnifiedScroll(
  id: string,
  callback: ScrollCallback,
  options?: { priority?: number; throttle?: number }
) {
  const manager = UnifiedScrollManager.getInstance()
  const state = ref<ScrollState>(manager.getState())

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = manager.subscribe(
      id,
      (newState) => {
        state.value = newState
        callback(newState)
      },
      options
    )
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    state,
    manager
  }
}

// 使用示例
// const { state } = useUnifiedScroll('my-component', (state) => {
//   console.log('Scroll position:', state.position)
// }, { priority: 5, throttle: 100 })
```
