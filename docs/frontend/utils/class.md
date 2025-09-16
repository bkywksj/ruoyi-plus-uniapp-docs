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
