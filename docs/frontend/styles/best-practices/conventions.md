# 样式规范

样式规范定义了项目中CSS/SCSS代码的编写标准,确保代码的一致性和可维护性。

## 📝 命名规范

### BEM 命名法

```scss
// Block Element Modifier
.card { }
.card__header { }
.card__body { }
.card--primary { }
.card--large { }
```

### CSS 变量命名

```scss
// 语义化命名
--app-bg: #fafbfc;
--menu-hover-bg: #f5f5f5;
--button-primary-text: #fff;

// ❌ 避免
--color-1: #fafbfc;
--bg-2: #f5f5f5;
```

### SCSS 变量命名

```scss
// 使用连字符分隔
$primary-color: #409eff;
$sidebar-width: 240px;
$border-radius-base: 8px;

// ❌ 避免驼峰命名
$primaryColor: #409eff;
$sidebarWidth: 240px;
```

## 🎨 代码组织

### 文件结构

```scss
// 1. 外部导入
@use 'abstracts/variables' as *;
@use 'abstracts/mixins' as *;

// 2. 局部变量
$local-spacing: 16px;

// 3. Mixin 定义
@mixin component-style { }

// 4. 样式规则
.component { }
```

### 选择器顺序

```scss
.component {
  // 1. 定位
  position: relative;
  top: 0;
  left: 0;

  // 2. 盒模型
  display: flex;
  width: 100%;
  height: auto;
  padding: 16px;
  margin: 0;

  // 3. 排版
  font-size: 14px;
  line-height: 1.5;
  text-align: center;

  // 4. 视觉
  background: var(--bg-level-1);
  border: 1px solid var(--app-border);
  border-radius: var(--radius-md);
  color: var(--app-text);

  // 5. 其他
  cursor: pointer;
  transition: all var(--duration-normal);
}
```

## 🔧 使用规范

### 1. 优先使用变量

```scss
// ✅ 推荐
.component {
  background: var(--bg-level-1);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal);
}

// ❌ 避免硬编码
.component {
  background: #ffffff;
  border-radius: 8px;
  transition: all 0.3s;
}
```

### 2. 嵌套层级控制

```scss
// ✅ 推荐:嵌套不超过3层
.nav {
  .nav-item {
    .nav-link {
      // ...
    }
  }
}

// ❌ 避免过深嵌套
.nav {
  .nav-list {
    .nav-item {
      .nav-link {
        .nav-icon {
          // 过深
        }
      }
    }
  }
}
```

### 3. 使用 Mixin 复用

```scss
// ✅ 推荐
.card {
  @include card-style;
}

// ❌ 重复代码
.card {
  background-color: var(--bg-level-1);
  border: 1px solid var(--bg-level-2);
  border-radius: var(--radius-md);
  // ...
}
```

## 📏 代码格式

### 缩进和空格

```scss
// 使用2个空格缩进
.component {
  padding: 16px;

  &:hover {
    background: var(--bg-level-2);
  }
}

// 选择器后加空格
.component { }  // ✅
.component{ }   // ❌

// 属性值前加空格
padding: 16px;  // ✅
padding:16px;   // ❌
```

### 注释规范

```scss
/**
 * 卡片组件样式
 * @description 提供统一的卡片视觉效果
 */
.card {
  // 基础样式
  padding: 16px;

  /* 悬停效果 */
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}
```

## ✅ 最佳实践

1. **保持一致性** - 遵循项目既定规范
2. **语义化命名** - 使用清晰表达意图的命名
3. **避免重复** - 使用变量和Mixin复用代码
4. **控制嵌套** - 嵌套层级不超过3层
5. **添加注释** - 为复杂逻辑添加说明

遵循样式规范能提高代码质量和团队协作效率。
