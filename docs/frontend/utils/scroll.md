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
