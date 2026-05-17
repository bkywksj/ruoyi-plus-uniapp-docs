# DOM 类操作 (class.ts)

DOM 元素 class 操作相关工具函数，提供全面的 CSS 类名操作功能，包括检查、添加、移除、切换、替换等常用操作。

## 📖 概述

DOM 类操作工具库提供以下核心功能：
- **类名检查**：检查元素是否包含指定类名
- **类名添加**：向元素添加类名
- **类名移除**：从元素移除类名
- **类名切换**：切换元素的类名
- **类名替换**：替换元素的类名
- **类名设置**：设置元素的类名（替换所有现有类名）
- **类名获取**：获取元素的所有类名数组

## 🔍 类名检查

### hasClass

检查元素是否包含指定类名。

```typescript
hasClass(element: HTMLElement, className: string): boolean
```

**参数：**
- `element` - 要检查的 DOM 元素
- `className` - 要检查的类名

**返回值：**
- `boolean` - 是否包含该类名

**示例：**
```typescript
const button = document.querySelector('.btn')

// 检查按钮是否包含 'active' 类
if (hasClass(button, 'active')) {
  console.log('按钮处于激活状态')
} else {
  console.log('按钮未激活')
}

// 检查导航项是否为当前页面
const navItem = document.querySelector('.nav-item')
if (hasClass(navItem, 'current')) {
  // 处理当前页面导航
}
```

**使用场景：**
- 检查元素状态（如激活、选中、禁用）
- 条件渲染和样式判断
- 事件处理中的状态检查

## ➕ 类名添加

### addClass

向元素添加类名。如果类名已存在，则不会重复添加。

```typescript
addClass(element: HTMLElement, className: string): void
```

**参数：**
- `element` - 目标 DOM 元素
- `className` - 要添加的类名

**示例：**
```typescript
const modal = document.querySelector('.modal')

// 显示模态框
addClass(modal, 'show')

// 添加动画类
addClass(modal, 'fade-in')

// 添加状态类
const button = document.querySelector('.btn')
addClass(button, 'loading')
```

**使用场景：**
- 显示/隐藏元素
- 添加动画效果
- 状态变化（加载、成功、错误等）
- 主题切换

## ➖ 类名移除

### removeClass

从元素移除类名。如果类名不存在，操作不会产生错误。

```typescript
removeClass(element: HTMLElement, className: string): void
```

**参数：**
- `element` - 目标 DOM 元素
- `className` - 要移除的类名

**示例：**
```typescript
const modal = document.querySelector('.modal')

// 隐藏模态框
removeClass(modal, 'show')

// 移除动画类
removeClass(modal, 'fade-in')

// 移除加载状态
const button = document.querySelector('.btn')
removeClass(button, 'loading')
```

**使用场景：**
- 隐藏元素
- 移除动画效果
- 清除临时状态
- 重置元素样式

## 🔄 类名切换

### toggleClass

切换元素的类名（有则移除，无则添加）。

```typescript
toggleClass(element: HTMLElement, className: string): void
```

**参数：**
- `element` - 目标 DOM 元素
- `className` - 要切换的类名

**示例：**
```typescript
const sidebar = document.querySelector('.sidebar')
const toggleBtn = document.querySelector('.toggle-btn')

// 切换侧边栏显示/隐藏
toggleBtn.addEventListener('click', () => {
  toggleClass(sidebar, 'collapsed')
})

// 切换主题
const themeBtn = document.querySelector('.theme-toggle')
themeBtn.addEventListener('click', () => {
  toggleClass(document.body, 'dark-theme')
})

// 切换菜单项激活状态
const menuItem = document.querySelector('.menu-item')
menuItem.addEventListener('click', () => {
  toggleClass(menuItem, 'active')
})
```

**使用场景：**
- 开关式功能（展开/收起、显示/隐藏）
- 主题切换
- 选中状态切换
- 交互式UI组件

## 🔧 类名替换

### replaceClass

替换元素的类名。

```typescript
replaceClass(element: HTMLElement, oldClassName: string, newClassName: string): void
```

**参数：**
- `element` - 目标 DOM 元素
- `oldClassName` - 要替换的旧类名
- `newClassName` - 替换成的新类名

**示例：**
```typescript
const alert = document.querySelector('.alert')

// 将错误提示改为成功提示
replaceClass(alert, 'alert-error', 'alert-success')

// 改变按钮尺寸
const button = document.querySelector('.btn')
replaceClass(button, 'btn-small', 'btn-large')

// 状态流转
const task = document.querySelector('.task')
replaceClass(task, 'status-pending', 'status-completed')
```

**使用场景：**
- 状态流转（待处理 → 进行中 → 已完成）
- 样式变更（颜色、尺寸、风格）
- 等级切换（优先级、重要性）

## 📝 类名设置

### setClass

设置元素的类名（替换所有现有类名）。

```typescript
setClass(element: HTMLElement, className: string): void
```

**参数：**
- `element` - 目标 DOM 元素
- `className` - 要设置的类名

**示例：**
```typescript
const element = document.querySelector('.complex-element')

// 完全重置类名
setClass(element, 'new-simple-class')

// 设置多个类名
setClass(element, 'btn btn-primary btn-large')

// 清空所有类名
setClass(element, '')
```

**使用场景：**
- 完全重置元素样式
- 组件状态重置
- 动态生成元素的样式设置

## 📋 类名获取

### getClassList

获取元素的所有类名数组。

```typescript
getClassList(element: HTMLElement): string[]
```

**参数：**
- `element` - 目标 DOM 元素

**返回值：**
- `string[]` - 类名数组

**示例：**
```typescript
const element = document.querySelector('.multi-class-element')

// 获取所有类名
const classes = getClassList(element)
console.log(classes) // ['btn', 'btn-primary', 'active', 'large']

// 检查类名数量
if (classes.length > 3) {
  console.log('元素有太多类名，考虑优化')
}

// 遍历所有类名
classes.forEach(className => {
  if (className.startsWith('btn-')) {
    console.log('找到按钮样式类:', className)
  }
})
```

**使用场景：**
- 调试和日志记录
- 类名分析和统计
- 条件处理和过滤
- 样式审计

## 💡 实际应用场景

### 1. 模态框控制

```typescript
class Modal {
  private element: HTMLElement
  
  constructor(selector: string) {
    this.element = document.querySelector(selector)
  }
  
  show() {
    addClass(this.element, 'modal-show')
    addClass(document.body, 'modal-open')
  }
  
  hide() {
    removeClass(this.element, 'modal-show')
    removeClass(document.body, 'modal-open')
  }
  
  toggle() {
    if (hasClass(this.element, 'modal-show')) {
      this.hide()
    } else {
      this.show()
    }
  }
}

// 使用示例
const loginModal = new Modal('.login-modal')
document.querySelector('.login-btn').addEventListener('click', () => {
  loginModal.show()
})
```

### 2. 导航菜单激活

```typescript
// 导航菜单管理
class Navigation {
  private menuItems: NodeListOf<HTMLElement>
  
  constructor() {
    this.menuItems = document.querySelectorAll('.nav-item')
    this.bindEvents()
  }
  
  private bindEvents() {
    this.menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        this.setActive(e.target as HTMLElement)
      })
    })
  }
  
  private setActive(activeItem: HTMLElement) {
    // 移除所有激活状态
    this.menuItems.forEach(item => {
      removeClass(item, 'active')
    })
    
    // 设置当前项为激活状态
    addClass(activeItem, 'active')
  }
}

const nav = new Navigation()
```

### 3. 主题切换器

```typescript
class ThemeToggler {
  private isDark = false
  
  constructor() {
    this.loadTheme()
    this.bindEvents()
  }
  
  private bindEvents() {
    document.querySelector('.theme-toggle').addEventListener('click', () => {
      this.toggle()
    })
  }
  
  private toggle() {
    if (this.isDark) {
      this.setLight()
    } else {
      this.setDark()
    }
  }
  
  private setDark() {
    addClass(document.body, 'dark-theme')
    removeClass(document.body, 'light-theme')
    this.isDark = true
    localStorage.setItem('theme', 'dark')
  }
  
  private setLight() {
    addClass(document.body, 'light-theme')
    removeClass(document.body, 'dark-theme')
    this.isDark = false
    localStorage.setItem('theme', 'light')
  }
  
  private loadTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      this.setDark()
    } else {
      this.setLight()
    }
  }
}

const themeToggler = new ThemeToggler()
```

### 4. 表单验证状态

```typescript
class FormValidator {
  private form: HTMLElement
  
  constructor(formSelector: string) {
    this.form = document.querySelector(formSelector)
  }
  
  validateField(field: HTMLElement, isValid: boolean) {
    // 移除之前的状态
    removeClass(field, 'field-valid')
    removeClass(field, 'field-invalid')
    
    // 添加新状态
    if (isValid) {
      addClass(field, 'field-valid')
    } else {
      addClass(field, 'field-invalid')
    }
  }
  
  setFormState(state: 'submitting' | 'success' | 'error' | 'idle') {
    const states = ['submitting', 'success', 'error', 'idle']
    
    // 移除所有状态类
    states.forEach(s => removeClass(this.form, `form-${s}`))
    
    // 添加当前状态类
    addClass(this.form, `form-${state}`)
  }
}

// 使用示例
const validator = new FormValidator('.contact-form')
validator.setFormState('submitting')
```

### 5. 动画序列控制

```typescript
class AnimationController {
  private element: HTMLElement
  
  constructor(selector: string) {
    this.element = document.querySelector(selector)
  }
  
  async fadeIn() {
    addClass(this.element, 'fade-in')
    
    // 等待动画完成
    await this.waitForAnimation()
    
    removeClass(this.element, 'fade-in')
    addClass(this.element, 'visible')
  }
  
  async slideUp() {
    addClass(this.element, 'slide-up')
    await this.waitForAnimation()
    removeClass(this.element, 'slide-up')
  }
  
  private waitForAnimation(): Promise<void> {
    return new Promise(resolve => {
      this.element.addEventListener('animationend', resolve, { once: true })
    })
  }
  
  reset() {
    // 移除所有动画类
    const animationClasses = getClassList(this.element)
      .filter(cls => cls.includes('fade') || cls.includes('slide'))
    
    animationClasses.forEach(cls => {
      removeClass(this.element, cls)
    })
  }
}
```

## 🎨 CSS 配合使用

这些工具函数通常需要配合相应的CSS样式使用：

```css
/* 模态框样式 */
.modal {
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal.modal-show {
  display: block;
  opacity: 1;
}

/* 主题切换 */
.light-theme {
  --bg-color: #ffffff;
  --text-color: #333333;
}

.dark-theme {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

/* 表单验证状态 */
.field-valid {
  border-color: #28a745;
}

.field-invalid {
  border-color: #dc3545;
}

/* 导航激活状态 */
.nav-item.active {
  color: #007bff;
  font-weight: bold;
}

/* 动画效果 */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## ⚡ 性能优化建议

### 1. 批量操作优化

```typescript
// ❌ 不推荐：多次DOM操作
function updateMultipleElements(elements: HTMLElement[]) {
  elements.forEach(el => {
    removeClass(el, 'old-class')
    addClass(el, 'new-class')
  })
}

// ✅ 推荐：使用DocumentFragment或一次性更新
function updateMultipleElementsOptimized(elements: HTMLElement[]) {
  // 先收集所有需要的操作
  const operations = elements.map(el => ({
    element: el,
    remove: ['old-class'],
    add: ['new-class']
  }))
  
  // 批量执行
  requestAnimationFrame(() => {
    operations.forEach(op => {
      op.remove.forEach(cls => removeClass(op.element, cls))
      op.add.forEach(cls => addClass(op.element, cls))
    })
  })
}
```

### 2. 避免频繁类名检查

```typescript
// ❌ 不推荐：重复检查
function toggleMultiple(element: HTMLElement) {
  if (hasClass(element, 'active')) {
    removeClass(element, 'active')
  } else {
    addClass(element, 'active')
  }
}

// ✅ 推荐：直接使用toggle
function toggleMultipleOptimized(element: HTMLElement) {
  toggleClass(element, 'active')  // 内部已经处理了检查逻辑
}
```

## ⚠️ 注意事项

1. **空值检查**：所有函数都会检查元素和类名是否有效
2. **类名格式**：类名应该符合CSS类名规范，不包含空格
3. **性能考虑**：频繁的DOM操作可能影响性能，考虑批量处理
4. **浏览器兼容性**：这些函数使用了现代DOM API，在老旧浏览器中可能需要polyfill

## 🆚 与原生API对比

| 功能 | 本工具库 | 原生API |
|------|---------|---------|
| 检查类名 | `hasClass(el, 'cls')` | `el.classList.contains('cls')` |
| 添加类名 | `addClass(el, 'cls')` | `el.classList.add('cls')` |
| 移除类名 | `removeClass(el, 'cls')` | `el.classList.remove('cls')` |
| 切换类名 | `toggleClass(el, 'cls')` | `el.classList.toggle('cls')` |
| 获取类名 | `getClassList(el)` | `Array.from(el.classList)` |

**优势：**
- 统一的API风格
- 更好的错误处理
- 兼容性处理
- 额外的功能（如replaceClass、setClass）

## ❓ 常见问题

### 1. 类名操作在元素不存在或为null时报错

**问题描述：**

在进行类名操作时，如果目标元素不存在或为 `null`/`undefined`，会抛出运行时错误：

```typescript
// 报错：Cannot read properties of null (reading 'classList')
const element = document.querySelector('.non-existent')
addClass(element, 'active')  // element 为 null，抛出错误
```

**问题原因：**

- `document.querySelector` 找不到匹配元素时返回 `null`
- 动态生成的元素可能尚未挂载到 DOM
- 组件卸载后仍持有对已销毁元素的引用
- 条件渲染导致元素临时不存在

**解决方案：**

```typescript
// 方案1：添加空值检查
function safeAddClass(element: HTMLElement | null, className: string): boolean {
  if (!element) {
    console.warn('Element is null, class operation skipped')
    return false
  }
  addClass(element, className)
  return true
}

// 使用示例
const button = document.querySelector('.btn')
safeAddClass(button, 'active')  // 安全操作，不会报错

// 方案2：封装带错误处理的工具函数
function safeClassOperation<T>(
  element: HTMLElement | null | undefined,
  operation: (el: HTMLElement) => T,
  fallback?: T
): T | undefined {
  if (!element || !(element instanceof HTMLElement)) {
    return fallback
  }
  try {
    return operation(element)
  } catch (error) {
    console.error('Class operation failed:', error)
    return fallback
  }
}

// 使用示例
const result = safeClassOperation(
  document.querySelector('.btn'),
  el => {
    addClass(el, 'active')
    return true
  },
  false
)

// 方案3：使用可选链和类型守卫
function isValidElement(el: unknown): el is HTMLElement {
  return el instanceof HTMLElement
}

const maybeElement = document.querySelector('.btn')
if (isValidElement(maybeElement)) {
  addClass(maybeElement, 'active')  // TypeScript 现在知道 maybeElement 是 HTMLElement
}

// 方案4：在Vue中使用ref确保元素存在
import { ref, onMounted, nextTick } from 'vue'

const buttonRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await nextTick()  // 确保DOM已更新
  if (buttonRef.value) {
    addClass(buttonRef.value, 'active')
  }
})

// 模板中
// <button ref="buttonRef">按钮</button>

// 方案5：创建智能类名操作器
class SafeClassManager {
  private element: HTMLElement | null = null
  private pendingOperations: Array<() => void> = []

  bind(element: HTMLElement | null) {
    this.element = element
    // 执行所有待处理的操作
    if (this.element) {
      this.pendingOperations.forEach(op => op())
      this.pendingOperations = []
    }
    return this
  }

  add(className: string) {
    if (this.element) {
      addClass(this.element, className)
    } else {
      this.pendingOperations.push(() => {
        if (this.element) addClass(this.element, className)
      })
    }
    return this
  }

  remove(className: string) {
    if (this.element) {
      removeClass(this.element, className)
    } else {
      this.pendingOperations.push(() => {
        if (this.element) removeClass(this.element, className)
      })
    }
    return this
  }

  toggle(className: string) {
    if (this.element) {
      toggleClass(this.element, className)
    } else {
      this.pendingOperations.push(() => {
        if (this.element) toggleClass(this.element, className)
      })
    }
    return this
  }
}

// 使用示例
const manager = new SafeClassManager()
manager.add('loading').add('disabled')  // 操作被缓存

// 稍后绑定元素
const element = document.querySelector('.btn') as HTMLElement
manager.bind(element)  // 自动执行缓存的操作
```

### 2. 批量添加或移除多个类名时只有部分生效

**问题描述：**

尝试一次添加多个类名时，使用空格分隔的字符串只添加了第一个类名，或者完全不生效：

```typescript
// 期望添加 'btn', 'btn-primary', 'btn-large' 三个类
addClass(element, 'btn btn-primary btn-large')  // 可能只添加了 'btn btn-primary btn-large' 整体作为一个类名
```

**问题原因：**

- `addClass` 函数设计为单个类名操作
- 包含空格的字符串被当作整体处理
- `classList.add` 虽支持多参数，但函数封装时未提供此能力
- 用户误解了函数的使用方式

**解决方案：**

```typescript
// 方案1：扩展addClass支持多类名
function addClasses(element: HTMLElement, classNames: string | string[]): void {
  if (!element) return

  const classes = Array.isArray(classNames)
    ? classNames
    : classNames.split(/\s+/).filter(Boolean)

  classes.forEach(cls => {
    if (cls.trim()) {
      element.classList.add(cls.trim())
    }
  })
}

// 使用示例
addClasses(button, 'btn btn-primary btn-large')  // 字符串形式
addClasses(button, ['btn', 'btn-primary', 'btn-large'])  // 数组形式

// 方案2：创建类名批量操作器
class ClassBatchOperator {
  private element: HTMLElement

  constructor(element: HTMLElement) {
    this.element = element
  }

  add(...classNames: string[]): this {
    const classes = this.normalizeClassNames(classNames)
    this.element.classList.add(...classes)
    return this
  }

  remove(...classNames: string[]): this {
    const classes = this.normalizeClassNames(classNames)
    this.element.classList.remove(...classes)
    return this
  }

  replace(oldClasses: string | string[], newClasses: string | string[]): this {
    this.remove(...(Array.isArray(oldClasses) ? oldClasses : [oldClasses]))
    this.add(...(Array.isArray(newClasses) ? newClasses : [newClasses]))
    return this
  }

  private normalizeClassNames(classNames: string[]): string[] {
    return classNames
      .flatMap(cls => cls.split(/\s+/))
      .filter(Boolean)
      .map(cls => cls.trim())
  }
}

// 使用示例
const batch = new ClassBatchOperator(element)
batch
  .remove('old-class-1', 'old-class-2')
  .add('new-class-1 new-class-2 new-class-3')

// 方案3：工具函数版本
function batchClassOperation(
  element: HTMLElement,
  options: {
    add?: string | string[]
    remove?: string | string[]
    toggle?: string | string[]
  }
): void {
  if (!element) return

  const normalize = (cls: string | string[] | undefined): string[] => {
    if (!cls) return []
    return (Array.isArray(cls) ? cls : cls.split(/\s+/))
      .filter(Boolean)
      .map(c => c.trim())
  }

  normalize(options.remove).forEach(cls => element.classList.remove(cls))
  normalize(options.add).forEach(cls => element.classList.add(cls))
  normalize(options.toggle).forEach(cls => element.classList.toggle(cls))
}

// 使用示例
batchClassOperation(element, {
  remove: 'loading disabled',
  add: ['active', 'visible', 'highlighted'],
  toggle: 'expanded'
})

// 方案4：使用setClass完全重置类名
function setClasses(element: HTMLElement, classNames: string | string[]): void {
  if (!element) return

  const classes = Array.isArray(classNames)
    ? classNames
    : classNames.split(/\s+/).filter(Boolean)

  element.className = classes.join(' ')
}

// 使用示例
setClasses(element, 'btn btn-primary btn-large')  // 完全替换所有类名

// 方案5：链式API实现
function classChain(element: HTMLElement) {
  return {
    add: function(...classes: string[]) {
      classes.flatMap(c => c.split(/\s+/)).filter(Boolean)
        .forEach(c => element.classList.add(c))
      return this
    },
    remove: function(...classes: string[]) {
      classes.flatMap(c => c.split(/\s+/)).filter(Boolean)
        .forEach(c => element.classList.remove(c))
      return this
    },
    toggle: function(...classes: string[]) {
      classes.flatMap(c => c.split(/\s+/)).filter(Boolean)
        .forEach(c => element.classList.toggle(c))
      return this
    },
    has: function(className: string): boolean {
      return element.classList.contains(className)
    },
    set: function(...classes: string[]) {
      element.className = classes.flatMap(c => c.split(/\s+/))
        .filter(Boolean).join(' ')
      return this
    }
  }
}

// 使用示例
classChain(element)
  .remove('old-class')
  .add('new-class-1 new-class-2')
  .toggle('conditional-class')
```

### 3. 动态生成元素的类名操作失效或时机不对

**问题描述：**

对通过 JavaScript 动态创建或 Vue/React 渲染的元素进行类名操作时，操作似乎没有生效：

```typescript
// Vue 组件中
const items = ref<Item[]>([])

// 获取数据后尝试操作
const fetchData = async () => {
  items.value = await api.getItems()

  // 立即操作 DOM - 失败，因为 DOM 还未更新
  const itemElements = document.querySelectorAll('.item')
  itemElements.forEach(el => addClass(el as HTMLElement, 'loaded'))
}
```

**问题原因：**

- Vue/React 的 DOM 更新是异步的
- 在数据变化后立即访问 DOM，元素可能尚未渲染
- 使用 `v-for` 或 `map` 渲染的列表项尚未挂载
- 组件的生命周期时机不正确

**解决方案：**

```typescript
// 方案1：使用 nextTick 等待 DOM 更新
import { ref, nextTick } from 'vue'

const items = ref<Item[]>([])

const fetchData = async () => {
  items.value = await api.getItems()

  // 等待 DOM 更新完成
  await nextTick()

  const itemElements = document.querySelectorAll('.item')
  itemElements.forEach(el => addClass(el as HTMLElement, 'loaded'))
}

// 方案2：使用 MutationObserver 监听 DOM 变化
function observeAndOperateClass(
  container: HTMLElement,
  selector: string,
  className: string,
  operation: 'add' | 'remove' | 'toggle' = 'add'
): () => void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.matches(selector)) {
            performOperation(node, className, operation)
          }
          // 检查子元素
          node.querySelectorAll(selector).forEach(el => {
            performOperation(el as HTMLElement, className, operation)
          })
        }
      })
    })
  })

  observer.observe(container, { childList: true, subtree: true })

  // 返回清理函数
  return () => observer.disconnect()
}

function performOperation(el: HTMLElement, className: string, op: string) {
  switch (op) {
    case 'add': addClass(el, className); break
    case 'remove': removeClass(el, className); break
    case 'toggle': toggleClass(el, className); break
  }
}

// 使用示例
const container = document.querySelector('.list-container') as HTMLElement
const cleanup = observeAndOperateClass(container, '.item', 'animated')

// 清理
onUnmounted(() => cleanup())

// 方案3：使用 Vue 的 ref 函数式引用
<template>
  <div v-for="(item, index) in items" :key="item.id">
    <div :ref="el => setItemRef(el, index)" class="item">
      {{ item.name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const itemRefs = ref<Map<number, HTMLElement>>(new Map())

const setItemRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    itemRefs.value.set(index, el)
    // 元素挂载时自动添加类名
    addClass(el, 'mounted')
  } else {
    itemRefs.value.delete(index)
  }
}

// 可以随时操作已缓存的元素
const highlightItem = (index: number) => {
  const el = itemRefs.value.get(index)
  if (el) {
    addClass(el, 'highlighted')
  }
}
</script>

// 方案4：使用自定义指令
import type { Directive } from 'vue'

const vAutoClass: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const classes = Array.isArray(binding.value)
      ? binding.value
      : binding.value.split(/\s+/)

    classes.forEach(cls => addClass(el, cls))
  },
  updated(el, binding) {
    // 处理值变化
    const oldClasses = Array.isArray(binding.oldValue)
      ? binding.oldValue
      : (binding.oldValue || '').split(/\s+/)
    const newClasses = Array.isArray(binding.value)
      ? binding.value
      : binding.value.split(/\s+/)

    oldClasses.forEach(cls => removeClass(el, cls))
    newClasses.forEach(cls => addClass(el, cls))
  }
}

// 使用示例
// <div v-auto-class="'animated fade-in'" />
// <div v-auto-class="['active', 'highlighted']" />

// 方案5：使用 requestAnimationFrame 确保在下一帧渲染
function deferClassOperation(
  selector: string,
  className: string,
  operation: 'add' | 'remove' | 'toggle' = 'add',
  maxRetries = 10
): void {
  let retries = 0

  const tryOperation = () => {
    const elements = document.querySelectorAll(selector)

    if (elements.length > 0) {
      elements.forEach(el => {
        performOperation(el as HTMLElement, className, operation)
      })
    } else if (retries < maxRetries) {
      retries++
      requestAnimationFrame(tryOperation)
    } else {
      console.warn(`Element not found after ${maxRetries} retries: ${selector}`)
    }
  }

  requestAnimationFrame(tryOperation)
}

// 使用示例
deferClassOperation('.dynamic-item', 'loaded', 'add')
```

### 4. 类名操作与 Vue 响应式系统或动态绑定冲突

**问题描述：**

使用工具函数直接操作 DOM 类名后，Vue 的 `:class` 绑定在下次更新时覆盖了手动添加的类名：

```vue
<template>
  <!-- Vue 管理的类名 -->
  <button
    ref="buttonRef"
    :class="{ active: isActive, disabled: isDisabled }"
    @click="handleClick"
  >
    按钮
  </button>
</template>

<script lang="ts" setup>
const buttonRef = ref(null)
const isActive = ref(false)

const handleClick = () => {
  // 直接操作 DOM 添加类名
  addClass(buttonRef.value, 'clicked')  // 添加成功

  // 但当 isActive 变化时，'clicked' 类会被移除
  setTimeout(() => {
    isActive.value = true  // Vue 重新渲染，'clicked' 类丢失
  }, 1000)
}
</script>
```

**问题原因：**

- Vue 的虚拟 DOM diff 会重置被手动修改的属性
- `:class` 绑定是响应式的，每次更新都会重新计算
- 直接 DOM 操作与 Vue 的声明式渲染理念冲突
- 状态同步问题：DOM 状态与组件状态不一致

**解决方案：**

```typescript
// 方案1：完全使用响应式数据管理类名
<template>
  <button
    :class="computedClasses"
    @click="handleClick"
  >
    按钮
  </button>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const isActive = ref(false)
const isDisabled = ref(false)
const isClicked = ref(false)
const customClasses = ref<string[]>([])

// 使用计算属性统一管理所有类名
const computedClasses = computed(() => {
  return [
    { active: isActive.value },
    { disabled: isDisabled.value },
    { clicked: isClicked.value },
    ...customClasses.value
  ]
})

const handleClick = () => {
  isClicked.value = true

  setTimeout(() => {
    isActive.value = true  // 'clicked' 类不会丢失
  }, 1000)
}

// 动态添加类名的函数
const addCustomClass = (className: string) => {
  if (!customClasses.value.includes(className)) {
    customClasses.value.push(className)
  }
}

const removeCustomClass = (className: string) => {
  const index = customClasses.value.indexOf(className)
  if (index > -1) {
    customClasses.value.splice(index, 1)
  }
}
</script>

// 方案2：使用类名状态管理 Composable
// composables/useClassManager.ts
import { ref, computed, watch } from 'vue'

interface ClassState {
  [key: string]: boolean
}

export function useClassManager(initialClasses: ClassState = {}) {
  const classState = ref<ClassState>(initialClasses)

  const classObject = computed(() => classState.value)

  const addClass = (className: string) => {
    classState.value[className] = true
  }

  const removeClass = (className: string) => {
    classState.value[className] = false
  }

  const toggleClass = (className: string) => {
    classState.value[className] = !classState.value[className]
  }

  const hasClass = (className: string): boolean => {
    return !!classState.value[className]
  }

  const setClasses = (classes: ClassState) => {
    classState.value = { ...classes }
  }

  const resetClasses = () => {
    classState.value = {}
  }

  return {
    classObject,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    setClasses,
    resetClasses
  }
}

// 组件中使用
<template>
  <button :class="classManager.classObject.value" @click="handleClick">
    按钮
  </button>
</template>

<script lang="ts" setup>
import { useClassManager } from '@/composables/useClassManager'

const classManager = useClassManager({ base: true })

const handleClick = () => {
  classManager.addClass('clicked')
  classManager.toggleClass('active')
}
</script>

// 方案3：分离 Vue 管理和 DOM 直接操作的类名
<template>
  <!-- Vue 管理的类名使用 :class -->
  <!-- DOM 直接操作的类名使用 ref 配合 class 属性 -->
  <button
    ref="buttonRef"
    class="btn dom-controlled-classes"
    :class="vueClasses"
    @click="handleClick"
  >
    按钮
  </button>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

const buttonRef = ref<HTMLElement | null>(null)
const isActive = ref(false)

// Vue 管理的类名
const vueClasses = computed(() => ({
  'vue-active': isActive.value
}))

// DOM 直接操作的类名（不会被 Vue 覆盖）
// 因为它们是通过 class 静态属性添加的
onMounted(() => {
  if (buttonRef.value) {
    // 这些类名 Vue 不会管理
    addClass(buttonRef.value, 'initialized')
  }
})

const handleClick = () => {
  if (buttonRef.value) {
    // 使用特定前缀区分 DOM 操作的类名
    toggleClass(buttonRef.value, 'dom-clicked')
  }
  isActive.value = !isActive.value
}
</script>

// 方案4：使用 watchEffect 同步状态
<template>
  <button ref="buttonRef" @click="handleClick">按钮</button>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'

const buttonRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const isClicked = ref(false)
const isLoading = ref(false)

// 使用 watchEffect 自动同步类名
watchEffect(() => {
  const el = buttonRef.value
  if (!el) return

  // 根据状态同步类名
  if (isActive.value) {
    addClass(el, 'active')
  } else {
    removeClass(el, 'active')
  }

  if (isClicked.value) {
    addClass(el, 'clicked')
  } else {
    removeClass(el, 'clicked')
  }

  if (isLoading.value) {
    addClass(el, 'loading')
  } else {
    removeClass(el, 'loading')
  }
})

const handleClick = () => {
  isClicked.value = true
  setTimeout(() => {
    isActive.value = true
  }, 1000)
}
</script>

// 方案5：创建响应式类名代理
import { reactive, watch } from 'vue'

function createReactiveClassManager(element: Ref<HTMLElement | null>) {
  const classes = reactive<Record<string, boolean>>({})

  watch(
    () => ({ ...classes }),
    (newClasses, oldClasses) => {
      if (!element.value) return

      // 移除旧的类名
      if (oldClasses) {
        Object.entries(oldClasses).forEach(([cls, active]) => {
          if (active && !newClasses[cls]) {
            removeClass(element.value!, cls)
          }
        })
      }

      // 添加新的类名
      Object.entries(newClasses).forEach(([cls, active]) => {
        if (active) {
          addClass(element.value!, cls)
        } else {
          removeClass(element.value!, cls)
        }
      })
    },
    { deep: true, immediate: true }
  )

  return classes
}

// 使用示例
const buttonRef = ref<HTMLElement | null>(null)
const buttonClasses = createReactiveClassManager(buttonRef)

// 现在可以像操作对象一样操作类名
buttonClasses.active = true
buttonClasses.disabled = false
delete buttonClasses.temporary
```

### 5. 动画类名切换时机不正确导致动画不生效

**问题描述：**

添加动画类名后动画不播放，或者动画只播放了第一次，后续切换不再生效：

```typescript
// 点击按钮添加动画类
const shake = () => {
  addClass(element, 'shake-animation')  // 第一次有效
}

// 第二次点击，动画不再播放
shake()  // 动画类已存在，不会重新触发
```

**问题原因：**

- CSS 动画只在类名从无到有时触发
- 动画结束后类名仍存在，再次添加不会触发
- 使用 `animation-fill-mode: forwards` 导致动画停留在最后一帧
- 浏览器的回流/重绘优化导致类名变化被合并

**解决方案：**

```typescript
// 方案1：动画结束后自动移除类名
function addAnimationClass(
  element: HTMLElement,
  className: string,
  options: {
    removeAfter?: boolean
    onComplete?: () => void
  } = {}
): void {
  const { removeAfter = true, onComplete } = options

  // 先移除再添加，触发重新动画
  removeClass(element, className)

  // 强制浏览器回流
  void element.offsetWidth

  addClass(element, className)

  if (removeAfter || onComplete) {
    const handleAnimationEnd = () => {
      if (removeAfter) {
        removeClass(element, className)
      }
      onComplete?.()
      element.removeEventListener('animationend', handleAnimationEnd)
    }

    element.addEventListener('animationend', handleAnimationEnd)
  }
}

// 使用示例
const shakeButton = () => {
  addAnimationClass(button, 'shake-animation', {
    removeAfter: true,
    onComplete: () => console.log('动画完成')
  })
}

// 方案2：使用 reflow 技巧强制重新触发动画
function triggerAnimation(element: HTMLElement, className: string): void {
  // 移除类名
  removeClass(element, className)

  // 强制重绘
  // 以下任意方法都可以触发回流
  element.offsetHeight  // 读取布局属性
  // 或者 element.getBoundingClientRect()
  // 或者 window.getComputedStyle(element).opacity

  // 重新添加类名
  addClass(element, className)
}

// 使用示例
document.querySelector('.btn').addEventListener('click', () => {
  triggerAnimation(element, 'bounce')
})

// 方案3：使用 requestAnimationFrame 确保在下一帧添加类名
function animateWithRAF(element: HTMLElement, className: string): Promise<void> {
  return new Promise((resolve) => {
    removeClass(element, className)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        addClass(element, className)

        const handleEnd = () => {
          element.removeEventListener('animationend', handleEnd)
          resolve()
        }
        element.addEventListener('animationend', handleEnd)
      })
    })
  })
}

// 使用示例
const playAnimation = async () => {
  await animateWithRAF(element, 'fade-in')
  console.log('动画播放完成')
}

// 方案4：完整的动画控制器
class AnimationController {
  private element: HTMLElement
  private currentAnimation: string | null = null
  private animationQueue: Array<{ className: string; resolve: () => void }> = []
  private isPlaying = false

  constructor(element: HTMLElement) {
    this.element = element
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.element.addEventListener('animationend', () => {
      if (this.currentAnimation) {
        removeClass(this.element, this.currentAnimation)
        this.currentAnimation = null
      }
      this.isPlaying = false
      this.processQueue()
    })
  }

  private processQueue(): void {
    if (this.animationQueue.length === 0 || this.isPlaying) return

    const next = this.animationQueue.shift()!
    this.playImmediate(next.className).then(next.resolve)
  }

  private playImmediate(className: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentAnimation) {
        removeClass(this.element, this.currentAnimation)
      }

      this.isPlaying = true
      this.currentAnimation = className

      // 强制回流
      void this.element.offsetWidth

      addClass(this.element, className)

      // 设置超时保护
      const timeout = setTimeout(() => {
        if (this.isPlaying) {
          this.isPlaying = false
          if (this.currentAnimation) {
            removeClass(this.element, this.currentAnimation)
            this.currentAnimation = null
          }
          resolve()
        }
      }, 5000)  // 5秒超时

      const handleEnd = () => {
        clearTimeout(timeout)
        this.element.removeEventListener('animationend', handleEnd)
        resolve()
      }

      this.element.addEventListener('animationend', handleEnd)
    })
  }

  play(className: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.isPlaying) {
        this.animationQueue.push({ className, resolve })
      } else {
        this.playImmediate(className).then(resolve)
      }
    })
  }

  stop(): void {
    if (this.currentAnimation) {
      removeClass(this.element, this.currentAnimation)
      this.currentAnimation = null
    }
    this.isPlaying = false
    this.animationQueue = []
  }

  async playSequence(classNames: string[]): Promise<void> {
    for (const className of classNames) {
      await this.play(className)
    }
  }
}

// 使用示例
const animator = new AnimationController(element)

// 播放单个动画
await animator.play('bounce')

// 播放动画序列
await animator.playSequence(['fade-in', 'slide-up', 'pulse'])

// 停止所有动画
animator.stop()

// 方案5：使用 Web Animations API（更现代的方案）
function animateElement(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation {
  return element.animate(keyframes, options)
}

// 使用示例
const bounceAnimation = animateElement(
  element,
  [
    { transform: 'scale(1)' },
    { transform: 'scale(1.2)' },
    { transform: 'scale(1)' }
  ],
  { duration: 300, easing: 'ease-out' }
)

bounceAnimation.onfinish = () => {
  console.log('动画完成')
}
```

### 6. 类名操作在服务端渲染（SSR）环境中报错

**问题描述：**

在 Nuxt、Next.js 等 SSR 框架中使用类名操作函数时，服务端抛出错误：

```
ReferenceError: document is not defined
ReferenceError: HTMLElement is not defined
```

**问题原因：**

- SSR 环境中没有 DOM API（`document`、`window` 等）
- 类名操作函数依赖浏览器环境
- 代码在服务端和客户端都会执行
- 未正确判断执行环境

**解决方案：**

```typescript
// 方案1：环境检测包装器
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

function safeAddClass(element: HTMLElement | null, className: string): void {
  if (!isBrowser || !element) return
  addClass(element, className)
}

function safeRemoveClass(element: HTMLElement | null, className: string): void {
  if (!isBrowser || !element) return
  removeClass(element, className)
}

function safeToggleClass(element: HTMLElement | null, className: string): void {
  if (!isBrowser || !element) return
  toggleClass(element, className)
}

function safeHasClass(element: HTMLElement | null, className: string): boolean {
  if (!isBrowser || !element) return false
  return hasClass(element, className)
}

// 方案2：创建 SSR 安全的类名操作模块
// utils/ssr-safe-class.ts
export const isClient = typeof window !== 'undefined'
export const isServer = !isClient

type ClassOperation = (element: HTMLElement, className: string) => void
type ClassCheck = (element: HTMLElement, className: string) => boolean

function createSafeOperation<T extends ClassOperation | ClassCheck>(
  operation: T,
  fallback: T extends ClassCheck ? boolean : void
): T {
  return ((element: HTMLElement | null, className: string) => {
    if (!isClient || !element) {
      return fallback
    }
    return (operation as any)(element, className)
  }) as T
}

export const safeAddClass = createSafeOperation(addClass, undefined)
export const safeRemoveClass = createSafeOperation(removeClass, undefined)
export const safeToggleClass = createSafeOperation(toggleClass, undefined)
export const safeHasClass = createSafeOperation(hasClass, false)

// 方案3：使用 Vue 的 onMounted 确保在客户端执行
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const elementRef = ref<HTMLElement | null>(null)

// 只在客户端执行的类名操作
onMounted(() => {
  if (elementRef.value) {
    addClass(elementRef.value, 'mounted')
    addClass(elementRef.value, 'client-side')
  }
})
</script>

// 方案4：创建客户端专用的 Composable
// composables/useClientClass.ts
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useClientClass(elementRef: Ref<HTMLElement | null>) {
  const isClient = ref(false)

  onMounted(() => {
    isClient.value = true
  })

  const add = (className: string) => {
    if (isClient.value && elementRef.value) {
      addClass(elementRef.value, className)
    }
  }

  const remove = (className: string) => {
    if (isClient.value && elementRef.value) {
      removeClass(elementRef.value, className)
    }
  }

  const toggle = (className: string) => {
    if (isClient.value && elementRef.value) {
      toggleClass(elementRef.value, className)
    }
  }

  const has = (className: string): boolean => {
    if (isClient.value && elementRef.value) {
      return hasClass(elementRef.value, className)
    }
    return false
  }

  return { add, remove, toggle, has, isClient }
}

// 组件中使用
<script lang="ts" setup>
const buttonRef = ref<HTMLElement | null>(null)
const { add, remove, toggle, isClient } = useClientClass(buttonRef)

// 安全地操作类名
const handleClick = () => {
  toggle('active')  // 只在客户端执行
}
</script>

// 方案5：Nuxt 3 的 useNuxtApp 方式
// plugins/class-utils.client.ts (注意 .client 后缀)
export default defineNuxtPlugin(() => {
  // 这个插件只在客户端加载
  return {
    provide: {
      addClass: (el: HTMLElement, cls: string) => addClass(el, cls),
      removeClass: (el: HTMLElement, cls: string) => removeClass(el, cls),
      toggleClass: (el: HTMLElement, cls: string) => toggleClass(el, cls),
      hasClass: (el: HTMLElement, cls: string) => hasClass(el, cls)
    }
  }
})

// 组件中使用
<script lang="ts" setup>
const { $addClass, $removeClass } = useNuxtApp()

onMounted(() => {
  const el = document.querySelector('.element')
  if (el) {
    $addClass(el, 'mounted')
  }
})
</script>

// 方案6：使用动态导入延迟加载
// 只在需要时加载类名操作函数
const loadClassUtils = async () => {
  if (typeof window === 'undefined') {
    return null
  }
  return await import('@/utils/class')
}

// 使用示例
const handleUserAction = async () => {
  const classUtils = await loadClassUtils()
  if (classUtils && elementRef.value) {
    classUtils.addClass(elementRef.value, 'active')
  }
}
```

### 7. 高频类名操作导致性能问题和页面卡顿

**问题描述：**

在滚动、鼠标移动等高频事件中操作类名，导致页面卡顿或性能下降：

```typescript
// 滚动时频繁操作类名
window.addEventListener('scroll', () => {
  const elements = document.querySelectorAll('.animate-on-scroll')
  elements.forEach(el => {
    if (isInViewport(el)) {
      addClass(el as HTMLElement, 'visible')  // 每次滚动都执行
    } else {
      removeClass(el as HTMLElement, 'visible')
    }
  })
})
```

**问题原因：**

- 滚动事件每秒可触发数十次
- 每次事件都遍历所有元素并操作类名
- DOM 操作触发浏览器回流和重绘
- 没有使用防抖或节流
- 没有缓存 DOM 查询结果

**解决方案：**

```typescript
// 方案1：使用节流（throttle）控制执行频率
function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = delay - (now - lastCall)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastCall = now
      fn(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        fn(...args)
      }, remaining)
    }
  }) as T
}

// 使用节流优化滚动处理
const handleScroll = throttle(() => {
  const elements = document.querySelectorAll('.animate-on-scroll')
  elements.forEach(el => {
    if (isInViewport(el)) {
      addClass(el as HTMLElement, 'visible')
    } else {
      removeClass(el as HTMLElement, 'visible')
    }
  })
}, 100)  // 每 100ms 最多执行一次

window.addEventListener('scroll', handleScroll, { passive: true })

// 方案2：使用 IntersectionObserver 替代滚动监听
class ScrollAnimationManager {
  private observer: IntersectionObserver
  private animatedElements = new WeakSet<Element>()

  constructor(options: {
    threshold?: number | number[]
    rootMargin?: string
    animationClass?: string
  } = {}) {
    const { threshold = 0.1, rootMargin = '0px', animationClass = 'visible' } = options

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target as HTMLElement

        if (entry.isIntersecting) {
          if (!this.animatedElements.has(element)) {
            addClass(element, animationClass)
            this.animatedElements.add(element)
          }
        } else {
          // 可选：离开视口时移除类名
          // removeClass(element, animationClass)
          // this.animatedElements.delete(element)
        }
      })
    }, { threshold, rootMargin })
  }

  observe(selector: string): void {
    document.querySelectorAll(selector).forEach(el => {
      this.observer.observe(el)
    })
  }

  unobserve(selector: string): void {
    document.querySelectorAll(selector).forEach(el => {
      this.observer.unobserve(el)
    })
  }

  disconnect(): void {
    this.observer.disconnect()
    this.animatedElements = new WeakSet()
  }
}

// 使用示例
const animationManager = new ScrollAnimationManager({
  threshold: 0.2,
  rootMargin: '50px',
  animationClass: 'fade-in-visible'
})

animationManager.observe('.animate-on-scroll')

// 方案3：批量操作和 requestAnimationFrame
class BatchClassOperator {
  private pendingOperations: Map<HTMLElement, { add: Set<string>; remove: Set<string> }> = new Map()
  private rafId: number | null = null

  private getOrCreateEntry(element: HTMLElement) {
    if (!this.pendingOperations.has(element)) {
      this.pendingOperations.set(element, { add: new Set(), remove: new Set() })
    }
    return this.pendingOperations.get(element)!
  }

  add(element: HTMLElement, className: string): this {
    const entry = this.getOrCreateEntry(element)
    entry.add.add(className)
    entry.remove.delete(className)  // 确保不会同时添加和移除
    this.scheduleFlush()
    return this
  }

  remove(element: HTMLElement, className: string): this {
    const entry = this.getOrCreateEntry(element)
    entry.remove.add(className)
    entry.add.delete(className)
    this.scheduleFlush()
    return this
  }

  private scheduleFlush(): void {
    if (this.rafId !== null) return

    this.rafId = requestAnimationFrame(() => {
      this.flush()
      this.rafId = null
    })
  }

  private flush(): void {
    this.pendingOperations.forEach((ops, element) => {
      // 批量移除
      if (ops.remove.size > 0) {
        element.classList.remove(...ops.remove)
      }
      // 批量添加
      if (ops.add.size > 0) {
        element.classList.add(...ops.add)
      }
    })
    this.pendingOperations.clear()
  }

  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.pendingOperations.clear()
  }
}

// 使用示例
const batchOperator = new BatchClassOperator()

// 高频事件中使用
window.addEventListener('mousemove', (e) => {
  const target = e.target as HTMLElement
  if (target.matches('.hover-target')) {
    batchOperator.add(target, 'hovered')
  }
}, { passive: true })

// 方案4：缓存 DOM 查询结果
class CachedElementOperator {
  private elementCache = new Map<string, HTMLElement[]>()
  private stateCache = new WeakMap<HTMLElement, Set<string>>()

  constructor() {
    // 监听 DOM 变化以清理缓存
    const observer = new MutationObserver(() => {
      this.elementCache.clear()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  getElements(selector: string): HTMLElement[] {
    if (!this.elementCache.has(selector)) {
      this.elementCache.set(
        selector,
        Array.from(document.querySelectorAll(selector)) as HTMLElement[]
      )
    }
    return this.elementCache.get(selector)!
  }

  addClass(element: HTMLElement, className: string): boolean {
    let classes = this.stateCache.get(element)
    if (!classes) {
      classes = new Set(element.classList)
      this.stateCache.set(element, classes)
    }

    // 只有状态实际变化时才操作 DOM
    if (!classes.has(className)) {
      classes.add(className)
      element.classList.add(className)
      return true
    }
    return false
  }

  removeClass(element: HTMLElement, className: string): boolean {
    let classes = this.stateCache.get(element)
    if (!classes) {
      classes = new Set(element.classList)
      this.stateCache.set(element, classes)
    }

    if (classes.has(className)) {
      classes.delete(className)
      element.classList.remove(className)
      return true
    }
    return false
  }
}

// 使用示例
const cachedOperator = new CachedElementOperator()

const handleScroll = throttle(() => {
  const elements = cachedOperator.getElements('.animate-on-scroll')
  elements.forEach(el => {
    if (isInViewport(el)) {
      cachedOperator.addClass(el, 'visible')  // 只在需要时操作 DOM
    } else {
      cachedOperator.removeClass(el, 'visible')
    }
  })
}, 50)

// 方案5：使用 CSS 变量代替类名切换
function setStyleVar(element: HTMLElement, name: string, value: string): void {
  element.style.setProperty(`--${name}`, value)
}

// CSS 中使用变量
/*
.element {
  opacity: var(--opacity, 0);
  transform: translateY(var(--translate-y, 20px));
  transition: opacity 0.3s, transform 0.3s;
}
*/

// JavaScript 中设置变量（比类名切换更高效）
window.addEventListener('scroll', throttle(() => {
  const scrollY = window.scrollY
  const elements = document.querySelectorAll('.parallax-element')

  elements.forEach(el => {
    const rect = (el as HTMLElement).getBoundingClientRect()
    const progress = Math.min(1, Math.max(0, 1 - rect.top / window.innerHeight))

    setStyleVar(el as HTMLElement, 'opacity', String(progress))
    setStyleVar(el as HTMLElement, 'translate-y', `${(1 - progress) * 20}px`)
  })
}, 16))  // 约 60fps
```

### 8. 类名操作与 CSS Modules 或 Scoped CSS 不兼容

**问题描述：**

使用 CSS Modules 或 Vue 的 scoped 样式时，直接使用字符串类名无法匹配到实际的类名：

```vue
<template>
  <div ref="boxRef" :class="$style.box">盒子</div>
</template>

<script lang="ts" setup>
const boxRef = ref(null)

const highlight = () => {
  // 无效：实际类名是类似 .box_a1b2c3 的哈希值
  addClass(boxRef.value, 'highlighted')
}
</script>

<style module>
.box { background: white; }
.highlighted { background: yellow; }  /* 实际类名是 .highlighted_x7y8z9 */
</style>
```

**问题原因：**

- CSS Modules 会将类名转换为带哈希的唯一标识
- Vue scoped 样式使用 data 属性而非修改类名
- 直接使用字符串类名无法匹配转换后的类名
- 类名映射只在编译时可用

**解决方案：**

```vue
// 方案1：使用 $style 对象获取真实类名
<template>
  <div ref="boxRef" :class="boxClasses">盒子</div>
</template>

<script lang="ts" setup>
import { ref, computed, useCssModule } from 'vue'

const boxRef = ref<HTMLElement | null>(null)
const isHighlighted = ref(false)

// 获取 CSS Module 样式对象
const $style = useCssModule()

// 使用计算属性管理类名
const boxClasses = computed(() => [
  $style.box,
  isHighlighted.value ? $style.highlighted : ''
])

// 如果必须使用 DOM 操作
const highlightWithDOM = () => {
  if (boxRef.value && $style.highlighted) {
    addClass(boxRef.value, $style.highlighted)  // 使用转换后的类名
  }
}

const removeHighlightWithDOM = () => {
  if (boxRef.value && $style.highlighted) {
    removeClass(boxRef.value, $style.highlighted)
  }
}
</script>

<style module>
.box { background: white; }
.highlighted { background: yellow; }
</style>

// 方案2：创建 CSS Modules 感知的类名操作函数
// utils/module-class.ts
type CSSModuleClasses = Record<string, string>

export function createModuleClassOperator(styles: CSSModuleClasses) {
  const getClassName = (name: string): string => {
    const moduleName = styles[name]
    if (!moduleName) {
      console.warn(`CSS Module class "${name}" not found`)
      return name  // 降级使用原始类名
    }
    return moduleName
  }

  return {
    add(element: HTMLElement | null, className: string): void {
      if (!element) return
      addClass(element, getClassName(className))
    },

    remove(element: HTMLElement | null, className: string): void {
      if (!element) return
      removeClass(element, getClassName(className))
    },

    toggle(element: HTMLElement | null, className: string): void {
      if (!element) return
      toggleClass(element, getClassName(className))
    },

    has(element: HTMLElement | null, className: string): boolean {
      if (!element) return false
      return hasClass(element, getClassName(className))
    },

    // 批量操作
    addMultiple(element: HTMLElement | null, ...classNames: string[]): void {
      if (!element) return
      classNames.forEach(name => addClass(element, getClassName(name)))
    },

    removeMultiple(element: HTMLElement | null, ...classNames: string[]): void {
      if (!element) return
      classNames.forEach(name => removeClass(element, getClassName(name)))
    }
  }
}

// 组件中使用
<script lang="ts" setup>
import { useCssModule } from 'vue'
import { createModuleClassOperator } from '@/utils/module-class'

const $style = useCssModule()
const classOp = createModuleClassOperator($style)

const boxRef = ref<HTMLElement | null>(null)

const highlight = () => {
  classOp.add(boxRef.value, 'highlighted')  // 自动转换类名
}
</script>

// 方案3：使用全局样式配合 :global
<style module>
.box {
  background: white;
}

/* 使用 :global 创建全局类名 */
:global(.highlighted) {
  background: yellow !important;
}
</style>

<script lang="ts" setup>
// 现在可以直接使用全局类名
const highlight = () => {
  addClass(boxRef.value, 'highlighted')  // 使用全局类名
}
</script>

// 方案4：混合使用 scoped 和非 scoped 样式
<template>
  <div ref="boxRef" class="box">盒子</div>
</template>

<script lang="ts" setup>
const boxRef = ref(null)

// 操作非 scoped 的类名
const highlight = () => {
  addClass(boxRef.value, 'global-highlighted')
}
</script>

<style scoped>
.box {
  background: white;
}
</style>

<style>
/* 非 scoped 样式，类名不会被转换 */
.global-highlighted {
  background: yellow !important;
}
</style>

// 方案5：创建类名映射 Composable
// composables/useModuleClass.ts
import { useCssModule, type Ref } from 'vue'

export function useModuleClass(elementRef: Ref<HTMLElement | null>) {
  const $style = useCssModule()

  const resolveClass = (name: string): string => {
    return $style[name] || name
  }

  const resolveClasses = (names: string[]): string[] => {
    return names.map(name => resolveClass(name))
  }

  return {
    // 响应式类名绑定
    classes: (...names: string[]) => {
      return names.map(name => $style[name]).filter(Boolean)
    },

    // DOM 操作
    add: (className: string) => {
      if (elementRef.value) {
        addClass(elementRef.value, resolveClass(className))
      }
    },

    remove: (className: string) => {
      if (elementRef.value) {
        removeClass(elementRef.value, resolveClass(className))
      }
    },

    toggle: (className: string) => {
      if (elementRef.value) {
        toggleClass(elementRef.value, resolveClass(className))
      }
    },

    has: (className: string): boolean => {
      if (elementRef.value) {
        return hasClass(elementRef.value, resolveClass(className))
      }
      return false
    },

    // 获取原始样式对象
    styles: $style
  }
}

// 组件中使用
<template>
  <div ref="boxRef" :class="mc.classes('box', isActive ? 'active' : '')">
    盒子
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useModuleClass } from '@/composables/useModuleClass'

const boxRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const mc = useModuleClass(boxRef)

const handleClick = () => {
  mc.toggle('highlighted')
  mc.add('clicked')
}
</script>

<style module>
.box { background: white; }
.active { border: 2px solid blue; }
.highlighted { background: yellow; }
.clicked { box-shadow: 0 0 10px rgba(0,0,0,0.3); }
</style>

// 方案6：使用 CSS 变量实现动态样式（绕过类名问题）
<template>
  <div
    ref="boxRef"
    :class="$style.box"
    :style="dynamicStyles"
  >
    盒子
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const isHighlighted = ref(false)
const customColor = ref('')

const dynamicStyles = computed(() => ({
  '--highlight-bg': isHighlighted.value ? 'yellow' : 'transparent',
  '--custom-color': customColor.value || 'inherit'
}))

// 通过修改响应式变量来改变样式，无需操作类名
const highlight = () => {
  isHighlighted.value = true
}

const setColor = (color: string) => {
  customColor.value = color
}
</script>

<style module>
.box {
  background: var(--highlight-bg, white);
  color: var(--custom-color, black);
  transition: background 0.3s;
}
</style>
```
