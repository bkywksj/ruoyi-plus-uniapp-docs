# 自定义组件样式

自定义组件样式用于项目特有的UI组件,补充 Element Plus 组件库的不足。

## 🎯 面板组件

### panel 样式

```scss
.panel,
.search {
  @include card-style;
  margin-bottom: 12px;
  padding: 12px;
}
```

**特点**:
- 使用 `card-style` mixin 提供统一的卡片样式
- 自动适配主题
- 包含悬停效果

## 🎨 容器组件

### components-container

```scss
.components-container {
  margin: 30px 50px;
  position: relative;
}
```

### aside 侧边栏

```scss
aside {
  background: #eef1f6;
  padding: 8px 24px;
  margin-bottom: 20px;
  border-radius: var(--radius-sm);
  display: block;
  line-height: 32px;
  font-size: 16px;
  color: #2c3e50;

  a {
    color: #337ab7;
    cursor: pointer;

    &:hover {
      color: rgb(32, 160, 255);
    }
  }
}
```

## 🏷️ 子导航栏

### sub-navbar

```scss
.sub-navbar {
  height: 50px;
  line-height: 50px;
  position: relative;
  width: 100%;
  text-align: right;
  padding-right: 20px;
  transition: var(--duration-slow) ease position;
  background: linear-gradient(90deg, rgba(32, 182, 249, 1) 0%, rgba(33, 120, 241, 1) 100%);

  .subtitle {
    font-size: 20px;
    color: #fff;
  }

  &.draft {
    background: #d0d0d0;
  }

  &.deleted {
    background: #d0d0d0;
  }
}
```

## 🔗 链接样式

### link-type

```scss
.link-type,
.link-type:focus {
  color: #337ab7;
  cursor: pointer;

  &:hover {
    color: rgb(32, 160, 255);
  }
}
```

## 🔍 筛选容器

### filter-container

```scss
.filter-container {
  padding-bottom: 10px;

  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}
```

## 📝 文本省略

### 单行省略

```scss
.lines1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 多行省略

```scss
.lines2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.lines3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
```

**使用示例**:
```html
<p class="lines2">这段文本会被限制在两行内显示...</p>
```

## ✅ 使用建议

1. **优先使用 UnoCSS** - `text-ellipsis` 工具类
2. **保持样式一致** - 使用统一的变量和 mixin
3. **主题兼容** - 确保在多主题下正常显示

自定义组件样式补充了组件库的不足,为项目提供了更丰富的UI选择。
