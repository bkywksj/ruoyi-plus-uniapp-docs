# 常见问题

样式开发中的常见问题及解决方案。

## 🎨 主题相关

### Q1: 主题切换后样式不生效

**问题描述**: 切换主题后某些组件样式没有更新

**解决方案**:
```scss
// ✅ 使用CSS变量确保主题兼容
.component {
  background: var(--bg-level-1);  // 自动适配主题
  color: var(--app-text);
}

// ❌ 避免硬编码颜色
.component {
  background: #ffffff;  // 无法适配暗色主题
}
```

### Q2: CSS变量未定义

**问题**: 控制台报错 `Invalid property value`

**检查步骤**:
1. 确认变量是否在 `:root` 或 `html.dark` 中定义
2. 检查变量名拼写
3. 确认变量作用域

```scss
// 检查变量定义
:root {
  --app-bg: #fafbfc;  // ✅ 已定义
}

.component {
  background: var(--app-bg);  // ✅ 正确
  background: var(--app-background);  // ❌ 未定义
}
```

## 🎬 动画相关

### Q3: 对话框动画不流畅

**问题**: 对话框打开/关闭动画卡顿

**优化方案**:
```scss
// 启用GPU加速
.el-dialog {
  will-change: transform, opacity;
  transform: translateZ(0);
}

// 使用硬件加速的属性
@keyframes dialog-open {
  from {
    transform: scale(0.2);  // ✅ GPU加速
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Q4: 图标动画触发多次

**问题**: 鼠标快速移入移出导致动画叠加

**解决方案**:
```scss
.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
    // 防止动画叠加
    animation-fill-mode: forwards;
  }
}
```

## 📱 响应式相关

### Q5: 移动端样式不生效

**检查点**:
1. 确认断点顺序(从大到小)
2. 检查 `@media` 查询语法

```scss
// ✅ 正确顺序
.component {
  width: 100%;

  @include respond-to('lg') { width: 80%; }
  @include respond-to('md') { width: 90%; }
  @include respond-to('sm') { width: 100%; }
}

// ❌ 错误顺序
.component {
  @include respond-to('sm') { width: 100%; }
  @include respond-to('md') { width: 90%; }  // 被覆盖
}
```

### Q6: 平板设备显示异常

**检查meta标签**:
```html
<!-- 确保有viewport设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 🎯 Element Plus 相关

### Q7: Element Plus 组件样式被覆盖

**问题**: 自定义样式无法覆盖 Element Plus

**解决方案**:
```vue
<style scoped lang="scss">
// 使用 :deep() 覆盖组件内部样式
:deep(.el-button) {
  border-radius: var(--radius-md);
}

// 或使用 !important (谨慎使用)
.el-button {
  border-radius: var(--radius-md) !important;
}
</style>
```

### Q8: Element Plus 主题色不统一

**问题**: 组件主色与设计不一致

**解决方案**:
```scss
:root {
  // 覆盖 Element Plus 主题色
  --el-color-primary: #409eff;
  --el-color-primary-light-3: #79bbff;

  // 确保所有主色相关变量
  --main-color: var(--el-color-primary);
}
```

## 🔧 构建相关

### Q9: SCSS 编译错误

**常见错误**:
```scss
// ❌ 错误: 除法已废弃
.component {
  width: 100px / 2;
}

// ✅ 正确: 使用 math.div()
@use 'sass:math';

.component {
  width: math.div(100px, 2);
}
```

### Q10: CSS 变量在 SCSS 中计算错误

**问题**: CSS变量无法在SCSS中直接计算

```scss
// ❌ 错误
$spacing: var(--spacing-base) * 2;

// ✅ 正确: 使用 calc()
.component {
  padding: calc(var(--spacing-base) * 2);
}
```

## 🎨 UnoCSS 相关

### Q11: UnoCSS 类名不生效

**检查步骤**:
1. 确认 UnoCSS 配置正确
2. 检查类名是否在安全列表中
3. 重启开发服务器

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    'i-ep-home',  // 确保图标类被包含
    // ...
  ]
})
```

## 📊 性能相关

### Q12: 样式加载缓慢

**优化方案**:
1. 启用CSS压缩
2. 移除未使用的样式
3. 使用关键CSS内联

```javascript
// vite.config.ts
export default {
  build: {
    cssCodeSplit: true,  // CSS代码分割
    minify: 'esbuild',   // 启用压缩
  }
}
```

### Q13: 首屏样式闪烁(FOUC)

**问题**: 无样式内容闪烁

**解决方案**:
```html
<!-- 内联关键CSS -->
<style>
  .app-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
```

## 🔍 调试技巧

### 1. 检查CSS变量值

```javascript
// 浏览器控制台
const value = getComputedStyle(document.documentElement)
  .getPropertyValue('--app-bg')
console.log('变量值:', value)
```

### 2. 查看应用的样式

```javascript
// 查看元素应用的所有样式
const styles = window.getComputedStyle(element)
console.log('背景色:', styles.backgroundColor)
```

### 3. 检测样式性能

```javascript
// 测量样式应用时间
const start = performance.now()
element.classList.add('active')
const duration = performance.now() - start
console.log('耗时:', duration, 'ms')
```

## 📋 问题排查清单

遇到样式问题时,按以下顺序排查:

1. [ ] 检查浏览器控制台错误
2. [ ] 确认CSS变量是否正确定义
3. [ ] 验证选择器优先级
4. [ ] 检查主题模式(亮色/暗色)
5. [ ] 确认响应式断点
6. [ ] 查看Element Plus组件样式
7. [ ] 检查构建配置
8. [ ] 清除缓存重新构建

掌握这些常见问题的解决方案能够快速定位和修复样式相关的bug。
