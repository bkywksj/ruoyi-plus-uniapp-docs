# 维护指南

样式维护指南帮助开发者更好地管理和维护项目的样式代码,保持代码库的健康和可持续发展。

## 📋 维护原则

### 1. 保持一致性

```scss
// ✅ 统一使用变量
.component {
  background: var(--bg-level-1);
  border-radius: var(--radius-md);
}

// ❌ 避免混用硬编码
.component {
  background: #ffffff;
  border-radius: 8px;
}
```

### 2. 文档化关键代码

```scss
/**
 * 对话框动画
 * @description 现代化的缩放动画效果
 * @keyframes dialog-open - 打开动画
 * @keyframes dialog-close - 关闭动画
 */
@keyframes dialog-open {
  // ...
}
```

### 3. 定期审查和重构

- 每季度审查一次样式代码
- 移除未使用的样式
- 优化重复代码
- 更新过时的写法

## 🔧 添加新样式

### 1. 确定样式位置

```
styles/
├── base/           # 基础样式(重置、排版)
├── themes/         # 主题相关
├── components/     # 组件样式
├── layout/         # 布局样式
└── utilities/      # 工具类
```

### 2. 使用现有变量和 Mixin

```scss
// 先检查是否有可用的变量
.new-component {
  background: var(--bg-level-1);      // 使用现有变量
  @include card-style;                 // 使用现有Mixin

  // 如需新变量,先在variables中定义
  border: 1px solid var(--new-border-color);
}
```

### 3. 遵循命名规范

```scss
// BEM命名
.feature { }
.feature__header { }
.feature__body { }
.feature--active { }
```

## 🔄 修改现有样式

### 1. 影响范围评估

```scss
// 修改前检查影响范围
// 全局变量影响所有使用该变量的地方
:root {
  --app-bg: #f5f5f5;  // ⚠️ 全局影响
}

// 组件样式只影响该组件
.specific-component {
  background: #f5f5f5;  // ✅ 局部影响
}
```

### 2. 向后兼容

```scss
// 添加新变量时保留旧变量(渐进式重构)
:root {
  --button-padding-new: 12px 24px;
  --button-padding: var(--button-padding-new);  // 兼容性别名
}
```

### 3. 记录变更

```scss
/**
 * @changed 2024-01-15 调整按钮圆角
 * @reason 统一设计规范
 */
.button {
  border-radius: var(--radius-md);  // 从 4px 改为 8px
}
```

## 🗑️ 删除废弃样式

### 1. 标记为废弃

```scss
/**
 * @deprecated 使用 .new-component 代替
 * @since v2.0.0
 */
.old-component {
  // ...
}
```

### 2. 检查使用情况

```bash
# 搜索样式类使用情况
grep -r "old-component" src/
```

### 3. 安全删除

1. 添加废弃警告
2. 提供迁移指南
3. 等待1-2个版本
4. 完全移除

## 📊 样式审计

### 1. 检测未使用的样式

```javascript
// 使用工具检测
import { PurgeCSS } from 'purgecss'

const purgeCSSResults = await new PurgeCSS().purge({
  content: ['src/**/*.{vue,ts,tsx}'],
  css: ['src/**/*.{css,scss}']
})
```

### 2. 检测重复样式

```bash
# 使用工具检测重复
npx csscss src/styles
```

### 3. 性能分析

```typescript
// 检测样式计算时间
const start = performance.now()
document.body.classList.add('theme-dark')
const duration = performance.now() - start
console.log('主题切换耗时:', duration)
```

## 🔄 版本管理

### 1. 样式版本控制

```scss
/**
 * Styles Version 2.0.0
 *
 * v2.0.0 (2024-01-15)
 * - 新增暗色主题
 * - 重构圆角系统
 *
 * v1.5.0 (2023-12-01)
 * - 优化动画性能
 */
```

### 2. 迁移指南

```markdown
## 从 v1.x 迁移到 v2.x

### 变量变更
- `--old-bg` → `--bg-level-1`
- `--old-text` → `--app-text`

### 类名变更
- `.old-card` → `.card`
- `.old-btn` → `.button`
```

## 📝 维护检查清单

- [ ] 定期审查未使用的样式
- [ ] 更新过时的浏览器前缀
- [ ] 检查样式性能
- [ ] 验证主题兼容性
- [ ] 更新样式文档
- [ ] 测试响应式布局
- [ ] 检查无障碍性

## 🔍 常见维护任务

### 1. 添加新主题变量

```scss
// 1. 在亮色主题添加
:root {
  --new-variable: #value;
}

// 2. 在暗色主题添加对应值
html.dark {
  --new-variable: #dark-value;
}

// 3. 更新文档
```

### 2. 重构组件样式

```scss
// 1. 创建新样式(保留旧样式)
.component-v2 {
  // 新样式
}

// 2. 逐步迁移
// 3. 移除旧样式
```

### 3. 优化性能

```scss
// 1. 识别性能瓶颈
// 2. 使用 transform 代替 position
// 3. 启用 GPU 加速
.optimized {
  transform: translateZ(0);
}
```

良好的维护习惯能够保持样式代码的健康,提高项目的可维护性。
