# 图标使用

项目支持多种图标方案，包括 Iconify 图标库、自定义字体图标和图片图标。

## 图标类型

### Iconify 图标

使用 Iconify 图标库，支持数万个图标：

```vue
<template>
  <!-- Element Plus 图标 -->
  <wd-icon name="i-ep-user" />
  <wd-icon name="i-ep-setting" />
  <wd-icon name="i-ep-search" />

  <!-- Carbon 图标 -->
  <wd-icon name="i-carbon-home" />

  <!-- Material Design 图标 -->
  <wd-icon name="i-mdi-account" />
</template>
```

### 自定义字体图标

使用项目内置的 iconfont 图标：

```vue
<template>
  <wd-icon name="icon-home" />
  <wd-icon name="icon-user" />
  <wd-icon name="icon-setting" />
</template>
```

### 图片图标

使用图片作为图标：

```vue
<template>
  <wd-icon name="/static/icons/custom.png" />
</template>
```

## 图标属性

### 尺寸

```vue
<template>
  <wd-icon name="i-ep-user" size="16" />
  <wd-icon name="i-ep-user" size="24" />
  <wd-icon name="i-ep-user" size="32" />
  <wd-icon name="i-ep-user" size="48" />
</template>
```

### 颜色

```vue
<template>
  <wd-icon name="i-ep-user" color="#1989fa" />
  <wd-icon name="i-ep-user" color="#07c160" />
  <wd-icon name="i-ep-user" color="#ee0a24" />
</template>
```

### 旋转动画

```vue
<template>
  <wd-icon name="i-ep-loading" :spin="true" />
</template>
```

## 常用图标

### 操作类

| 图标 | 名称 | 说明 |
|------|------|------|
| i-ep-plus | 添加 | 新增操作 |
| i-ep-edit | 编辑 | 修改操作 |
| i-ep-delete | 删除 | 删除操作 |
| i-ep-search | 搜索 | 搜索操作 |
| i-ep-refresh | 刷新 | 刷新操作 |

### 导航类

| 图标 | 名称 | 说明 |
|------|------|------|
| i-ep-arrow-left | 返回 | 返回上一页 |
| i-ep-arrow-right | 箭头 | 进入详情 |
| i-ep-close | 关闭 | 关闭弹窗 |
| i-ep-menu | 菜单 | 菜单入口 |

### 状态类

| 图标 | 名称 | 说明 |
|------|------|------|
| i-ep-success-filled | 成功 | 操作成功 |
| i-ep-warning-filled | 警告 | 警告提示 |
| i-ep-circle-close-filled | 错误 | 操作失败 |
| i-ep-info-filled | 信息 | 信息提示 |

## 图标按钮

图标与按钮组合使用：

```vue
<template>
  <wd-button icon="i-ep-plus">新增</wd-button>
  <wd-button icon="i-ep-edit" type="primary">编辑</wd-button>
  <wd-button icon="i-ep-delete" type="error">删除</wd-button>
</template>
```
