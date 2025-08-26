# 主题状态管理 (theme)

## 功能概述

主题状态管理模块负责应用的视觉风格、布局配置和用户界面偏好设置，提供完整的主题定制能力。

## 核心职责

- **主题控制**：管理应用主题色和暗黑模式
- **布局配置**：控制页面布局结构和组件显示
- **视觉元素**：管理Logo、标题、动画等UI元素
- **偏好持久化**：保存用户的界面设置

## 状态定义

```typescript
// 布局设置
layoutSetting: {
  topNav: boolean         // 顶部导航
  tagsView: boolean       // 标签视图
  fixedHeader: boolean    // 固定头部
  sidebarLogo: boolean    // 侧边栏Logo
  dynamicTitle: boolean   // 动态标题
  sideTheme: SideTheme    // 侧边栏主题
  theme: string           // 主题色
  dark: boolean           // 暗黑模式
}

// 其他状态
title: string             // 页面标题
showSettings: boolean     // 显示设置面板
animationEnable: boolean  // 启用动画
```

## 核心方法

### saveSettings - 保存设置
```typescript
saveSettings(newLayoutSetting?: LayoutSetting): void
```
手动保存布局设置到本地存储：
- 支持完整配置替换
- 不传参数时重置为默认设置
- 立即持久化到localStorage

### setTitle - 设置标题
```typescript
setTitle(value: string): void
```
动态设置页面标题：
- 更新浏览器标签页标题
- 支持动态标题模式
- 自动拼接应用名称

### toggleDark - 切换暗黑模式
```typescript
toggleDark(value: boolean): void
```
切换明暗主题：
- 实时预览效果
- 需手动调用saveSettings保存
- 自动应用Element Plus暗黑变量

### resetTitle - 重置标题
```typescript
resetTitle(): void
```
将标题恢复为系统默认值。

## 布局选项详解

### topNav - 顶部导航
控制是否使用顶部导航布局：
- true: 菜单显示在顶部
- false: 传统侧边栏布局

### tagsView - 标签视图
控制多标签页功能：
- true: 显示标签导航栏
- false: 隐藏标签，单页模式

### fixedHeader - 固定头部
控制页面滚动时头部行为：
- true: 头部固定在顶部
- false: 头部随页面滚动

### sidebarLogo - 侧边栏Logo
控制Logo显示位置：
- true: 在侧边栏显示Logo
- false: 隐藏Logo

### dynamicTitle - 动态标题
控制浏览器标题显示方式：
- true: 页面名称 - 应用名称
- false: 仅显示应用名称

## 暗黑模式实现

### 与VueUse集成
```typescript
// 使用useDark但禁用其存储功能
const isDark = useDark({
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
})

// 双向同步
watch(dark, (newValue) => {
  isDark.value = newValue
})
```

### CSS变量切换
自动切换Element Plus的CSS变量：
- 亮色主题变量
- 暗色主题变量
- 自定义组件适配

## 使用示例

### 主题色设置
```typescript
// 主题色选择器
const predefineColors = [
  '#409EFF',
  '#1890ff',
  '#304156',
  '#212121',
  '#11a983',
  '#13c2c2',
  '#6959CD'
]

// 应用主题色
const handleThemeChange = (color: string) => {
  themeStore.theme = color
  // 预览效果，未保存
}
```

### 布局切换
```typescript
// 切换顶部导航模式
const toggleTopNav = () => {
  themeStore.topNav = !themeStore.topNav
  // 可能需要刷新路由
  router.replace(router.currentRoute.value)
}
```

### 设置面板保存
```typescript
// 保存所有设置
const saveAllSettings = () => {
  themeStore.saveSettings(layoutSetting.value)
  ElMessage.success('设置已保存')
}

// 重置设置
const resetSettings = () => {
  themeStore.saveSettings() // 不传参数重置
  window.location.reload()
}
```

## 标题管理策略

### 动态标题流程
```typescript
// 路由切换时更新标题
router.afterEach((to) => {
  if (themeStore.dynamicTitle) {
    themeStore.setTitle(to.meta.title || '未命名')
  }
})
```

### 标题格式
- 静态模式：`系统名称`
- 动态模式：`页面标题 - 系统名称`

## 与其他模块协作

### 与 State Store
- 共同管理UI状态
- 侧边栏主题与状态联动

### 与 TagsView Store
- tagsView设置控制标签栏显示
- 影响页面缓存策略

### 与布局组件
- Settings面板读写配置
- Layout响应布局变化
- Sidebar应用主题样式

## 性能优化

1. **预览与保存分离**
    - 设置改变时仅预览
    - 用户确认后才持久化
    - 减少localStorage写入

2. **防抖处理**
    - 主题色选择使用防抖
    - 避免频繁的样式计算

3. **按需加载**
    - 暗黑模式CSS按需加载
    - 减少初始加载体积

## 主题定制指南

### 自定义主题色
1. 修改CSS变量
2. 更新Element Plus主题
3. 应用到自定义组件

### 扩展布局选项
1. 在LayoutSetting接口添加字段
2. 实现对应的UI控制
3. 处理布局组件响应

### 主题预设
可以提供多套预设主题供用户选择：
- 默认主题
- 暗黑主题
- 护眼主题
- 高对比度主题

## 最佳实践

1. **设置分组**：将相关设置组织在一起
2. **即时预览**：改变立即生效，保存才持久化
3. **重置功能**：提供一键恢复默认
