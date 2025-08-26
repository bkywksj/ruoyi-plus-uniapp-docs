# 应用状态管理 (state)

## 功能概述

应用状态管理模块负责控制应用的交互状态、设备适配和多语言支持，提供统一的UI状态管理方案。

## 核心职责

- **侧边栏控制**：管理侧边栏的展开、收起、隐藏状态
- **设备适配**：响应式识别和适配不同设备类型
- **尺寸管理**：统一控制UI组件的尺寸规格
- **多语言支持**：切换和持久化语言设置

## 状态定义

```typescript
// 配置状态
stateConfig: {
  sidebarStatus: string    // 侧边栏状态 '0'关闭 '1'开启
  size: ElSize             // UI尺寸 'default' | 'large' | 'small'
  language: LanguageCode   // 语言设置
}

// 侧边栏状态
sidebar: {
  opened: boolean          // 是否展开
  withoutAnimation: boolean // 是否禁用动画
  hide: boolean            // 是否隐藏
}

// 设备类型
device: 'pc' | 'mobile' | 'tablet'

// 计算属性
locale: LocaleType        // Element Plus语言包
```

## 核心方法

### toggleSideBar - 切换侧边栏
```typescript
toggleSideBar(withoutAnimation?: boolean): void
```
智能切换侧边栏状态：
- 隐藏状态下不生效
- 支持禁用动画效果
- 自动持久化状态

### openSideBar / closeSideBar - 强制控制
```typescript
openSideBar(withoutAnimation?: boolean): void
closeSideBar(withoutAnimation?: boolean): void
```
强制打开或关闭侧边栏，不考虑当前状态。

### toggleSideBarHide - 显示/隐藏控制
```typescript
toggleSideBarHide(status: boolean): void
```
完全隐藏或显示侧边栏：
- true: 完全隐藏，toggle方法失效
- false: 显示侧边栏

### toggleDevice - 设备切换
```typescript
toggleDevice(device: DeviceType): void
```
设置当前设备类型，用于响应式布局适配。

### setSize - 尺寸设置
```typescript
setSize(size: ElSize): void
```
设置全局UI组件尺寸：
- `default`: 默认尺寸
- `large`: 大尺寸
- `small`: 紧凑尺寸

### changeLanguage - 语言切换
```typescript
changeLanguage(lang: LanguageCode): void
```
切换应用语言并自动持久化。

## 持久化机制

### 自动同步
```typescript
// 监听配置变化，自动保存到localStorage
watch(stateConfig, (newConfig) => {
  localCache.setJSON(STORAGE_KEY, newConfig)
}, { deep: true })
```

### 初始化加载
```typescript
// 从缓存读取配置
const stateConfig = ref(
  localCache.getJSON(STORAGE_KEY) || DEFAULT_STATE_CONFIG
)
```

## 使用示例

### 响应式布局
```typescript
// 监听窗口变化，自动切换设备类型
const WIDTH = 992
const handleResize = () => {
  const width = document.body.getBoundingClientRect().width
  if (width < WIDTH) {
    stateStore.toggleDevice('mobile')
    stateStore.closeSideBar()
  } else {
    stateStore.toggleDevice('pc')
    stateStore.openSideBar()
  }
}
```

### 语言切换
```typescript
// 语言选择器
<el-dropdown @command="changeLanguage">
  <template #dropdown>
    <el-dropdown-item command="zh_CN">简体中文</el-dropdown-item>
    <el-dropdown-item command="en_US">English</el-dropdown-item>
  </template>
</el-dropdown>

// 处理切换
const changeLanguage = (lang: LanguageCode) => {
  stateStore.changeLanguage(lang)
  ElMessage.success('语言切换成功')
}
```

### 尺寸调整
```typescript
// 在设置面板中
<el-radio-group v-model="size" @change="handleSizeChange">
  <el-radio-button value="large">大型</el-radio-button>
  <el-radio-button value="default">默认</el-radio-button>
  <el-radio-button value="small">小型</el-radio-button>
</el-radio-group>

const handleSizeChange = (val: ElSize) => {
  stateStore.setSize(val)
  // 可能需要刷新页面以完全应用
  window.location.reload()
}
```

## 多语言配置

### 语言映射
```typescript
const LANGUAGE_MAP = {
  zh_CN: zhCN,  // Element Plus 中文包
  en_US: enUS   // Element Plus 英文包
}
```

### Element Plus集成
```typescript
// App.vue
<el-config-provider :locale="stateStore.locale">
  <App />
</el-config-provider>
```

## 与其他模块协作

### 与 Theme Store
- 共同管理应用的视觉表现
- 侧边栏主题与状态联动

### 与布局组件
- Layout组件监听sidebar状态
- AppMain响应device变化
- Navbar使用size配置

## 移动端适配策略

1. **断点定义**
    - < 768px: 移动设备
    - 768px - 992px: 平板设备
    - > 992px: 桌面设备

2. **自动行为**
    - 移动端自动收起侧边栏
    - 平板端显示收缩的侧边栏
    - 桌面端完全展开

3. **触摸优化**
    - 移动端增大点击区域
    - 支持滑动手势
    - 优化动画性能

## 最佳实践

1. **初始化时机**：在App.vue的setup中初始化设备类型
2. **防抖处理**：窗口resize事件使用防抖
3. **动画性能**：移动端考虑禁用复杂动画
4. **语言切换**：提供用户友好的切换提示
5. **尺寸一致**：确保自定义组件响应全局尺寸设置
