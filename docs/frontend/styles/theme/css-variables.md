# CSS 变量系统

CSS 变量(CSS Custom Properties)是本项目主题系统的核心,提供了灵活的样式定制和动态主题切换能力。

## 🎨 变量分类

### 1. 布局相关变量

```scss
:root {
  // Z-index 层级管理
  --z-sidebar: 1001;                    // 侧边栏层级
  --z-header: 9;                        // 头部层级
  --z-mask: 999;                        // 遮罩层级
  --z-modal: 1050;                      // 模态框层级

  // 侧边栏尺寸
  --sidebar-collapsed-width: 54px;      // 折叠状态宽度
}
```

### 2. 动画时长变量

```scss
:root {
  --duration-normal: 0.3s;              // 标准过渡时长
  --duration-slow: 0.6s;                // 慢速过渡时长
}
```

### 3. 圆角变量

```scss
:root {
  // 基础圆角系统
  --radius-sm: 4px;                     // 小圆角
  --radius-md: 8px;                     // 中等圆角
  --radius-lg: 12px;                    // 大圆角
  --radius-round: 20px;                 // 圆形边角

  // 动态圆角系统
  --custom-radius: 12px;                // 基础圆角值
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px);
  --el-border-radius-small: calc(var(--custom-radius) / 3 + 4px);
}
```

### 4. 颜色系统变量

```scss
:root {
  // 主色系
  --main-color: var(--el-color-primary);

  // 背景色层级
  --bg-base: #fafbfc;
  --bg-level-1: #ffffff;
  --bg-level-2: #f8f9fa;
  --bg-level-3: #f5f7fa;
  --bg-level-4: #e9ecef;

  // 应用级变量
  --app-bg: var(--bg-base);
  --app-text: #303133;
  --app-border: #dbdfe9;
}
```

## 🔧 变量使用

### 在 CSS/SCSS 中使用

```scss
.component {
  // 直接使用变量
  background: var(--bg-level-1);
  color: var(--app-text);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal);

  &:hover {
    background: var(--bg-level-2);
  }
}
```

### 带回退值的使用

```scss
.component {
  // 提供回退值,当变量未定义时使用
  color: var(--app-text, #333);
  border-radius: var(--radius-md, 8px);
}
```

### 在 JavaScript 中读取

```typescript
// 读取CSS变量
const appBg = getComputedStyle(document.documentElement)
  .getPropertyValue('--app-bg')

console.log('应用背景色:', appBg)  // #fafbfc
```

### 在 JavaScript 中设置

```typescript
// 动态设置CSS变量
document.documentElement.style.setProperty('--app-bg', '#f0f0f0')

// 移除CSS变量
document.documentElement.style.removeProperty('--app-bg')
```

## 🎯 Element Plus 集成

### 组件尺寸变量

```scss
:root {
  // 统一组件高度
  --el-component-custom-height: 32px !important;
  --el-component-size: var(--el-component-custom-height) !important;
}
```

### 字体权重变量

```scss
:root {
  // 按钮字体权重
  --el-font-weight-primary: 400 !important;
}
```

### 菜单颜色变量

```scss
:root {
  // 自定义菜单颜色
  --custom-active-bg-color: rgba(64, 158, 255, 0.1);
  --cutsom-active-text-color: rgba(66, 161, 255, 1);

  // Element UI 菜单颜色映射
  --el-menu-active-bg-color: rgba(64, 158, 255, 0.1);
  --el-menu-active-text-color: rgba(66, 161, 255, 1);
}
```

## 🌓 主题变量

### 亮色主题变量

```scss
:root {
  --bg-base: #fafbfc;
  --app-text: #303133;
  --menu-bg: #161618;
  // ... 其他亮色主题变量
}
```

### 暗色主题变量

```scss
html.dark {
  --bg-base: #111113;
  --app-text: #f1f5f9;
  --menu-bg: var(--bg-level-1);
  // ... 其他暗色主题变量
}
```

## 💡 变量计算

### calc() 函数

```scss
:root {
  --base-size: 16px;
  --large-size: calc(var(--base-size) * 1.5);  // 24px
  --small-size: calc(var(--base-size) * 0.75); // 12px

  // 动态圆角计算
  --custom-radius: 12px;
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px);
}
```

### 变量嵌套

```scss
:root {
  --primary-color: #409eff;
  --main-color: var(--primary-color);
  --button-bg: var(--main-color);

  // 多层嵌套
  --bg-base: #fafbfc;
  --app-bg: var(--bg-base);
  --container-bg: var(--app-bg);
}
```

## 🔄 动态变量修改

### 主题切换

```typescript
function toggleTheme(isDark: boolean) {
  const root = document.documentElement

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}
```

### 动态修改变量

```typescript
function updatePrimaryColor(color: string) {
  document.documentElement.style.setProperty('--el-color-primary', color)
}

// 使用
updatePrimaryColor('#ff6b6b')  // 切换主色为红色
```

### 批量更新变量

```typescript
function updateThemeVariables(variables: Record<string, string>) {
  const root = document.documentElement

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

// 使用
updateThemeVariables({
  'app-bg': '#f5f5f5',
  'app-text': '#222',
  'radius-md': '12px'
})
```

## 🎨 自定义变量

### 添加新变量

```scss
// 在 _variables.scss 中添加
:root {
  // 自定义变量
  --custom-highlight: #ffeb3b;
  --custom-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --custom-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 组件特定变量

```scss
// 为特定组件定义变量
.my-component {
  --component-padding: 16px;
  --component-gap: 12px;

  padding: var(--component-padding);
  gap: var(--component-gap);
}
```

## 📋 变量命名规范

### 语义化命名

```scss
// ✅ 推荐:语义清晰
--app-bg: #fafbfc;
--menu-hover-bg: #f5f5f5;
--button-primary-text: #fff;

// ❌ 避免:含义模糊
--color-1: #fafbfc;
--bg-2: #f5f5f5;
--text-a: #fff;
```

### 分层命名

```scss
// 按层级组织变量
--bg-base: #fafbfc;          // 基础层
--bg-level-1: #ffffff;       // 一级层
--bg-level-2: #f8f9fa;       // 二级层

// 按功能组织
--sidebar-width: 240px;      // 侧边栏
--header-height: 60px;       // 头部
--footer-height: 40px;       // 底部
```

## 🔍 调试技巧

### 查看所有变量

```javascript
// 获取所有CSS变量
const styles = getComputedStyle(document.documentElement)
const cssVars = Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules))
  .filter(rule => rule.type === CSSRule.STYLE_RULE)
  .flatMap(rule => Array.from(rule.style))
  .filter(prop => prop.startsWith('--'))

console.log('所有CSS变量:', cssVars)
```

### 监听变量变化

```javascript
// 使用 MutationObserver 监听变量变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'style') {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--app-bg')
      console.log('背景色已变化:', bg)
    }
  })
})

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['style']
})
```

## ✅ 最佳实践

1. **使用语义化命名** - 变量名应清楚表达其用途
2. **提供回退值** - `var(--color, #333)` 确保兼容性
3. **避免过度嵌套** - 保持变量引用链简洁
4. **统一管理变量** - 集中定义在主题文件中
5. **文档化变量** - 为关键变量添加注释说明

```scss
/**
 * 应用主背景色
 * 亮色主题: #fafbfc
 * 暗色主题: #111113
 */
--app-bg: var(--bg-base);
```

CSS 变量系统为项目提供了强大而灵活的样式定制能力,是实现动态主题的基石。
