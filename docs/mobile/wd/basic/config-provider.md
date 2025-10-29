# ConfigProvider 全局配置

## 介绍

ConfigProvider 是 WD UI 提供的全局配置组件,用于向下传递配置信息,实现主题定制、深色模式切换等功能。通过在应用最外层包裹 ConfigProvider 组件,可以一次性配置所有子组件的样式和行为。

在大型应用开发中,统一的主题风格和配置管理至关重要。ConfigProvider 组件提供了一种优雅的方式来管理全局配置,支持主题切换、样式定制、CSS 变量覆盖等功能,帮助开发者快速实现品牌化定制和个性化需求。

**核心特性:**

- **主题模式切换** - 支持 light 和 dark 两种主题模式,一键切换深色模式
- **海量主题变量** - 提供 2000+ 个主题变量,覆盖 78 个组件的所有样式细节
- **CSS 变量映射** - 自动将驼峰命名的主题变量转换为 CSS 变量(--wot-*)
- **嵌套配置支持** - 支持多层嵌套,子级配置可以覆盖父级配置
- **完整类型定义** - TypeScript 类型覆盖所有主题变量,提供完整的类型提示
- **自动颜色转换** - 内置十六进制颜色转 RGB 格式的工具函数
- **零侵入设计** - 不影响原有组件结构,通过 CSS 变量实现主题定制
- **性能优化** - 使用计算属性缓存样式转换,避免重复计算

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:1-2119

## 工作原理

ConfigProvider 通过以下机制实现全局配置:

### 主题类名

根据 `theme` 属性动态添加主题类名 `wot-theme-light` 或 `wot-theme-dark`:

```vue
<view :class="`wot-theme-${theme}`">
  <slot />
</view>
```

所有组件样式都基于这个主题类名编写,切换主题时样式自动变化。

### CSS 变量映射

组件内部将驼峰命名的主题变量转换为 CSS 变量:

```typescript
// colorTheme → --wot-color-theme
// buttonPrimaryBgColor → --wot-button-primary-bg-color
const mapThemeVarsToCSSVars = (themeVars) => {
  const cssVars = {}
  Object.keys(themeVars).forEach((key) => {
    cssVars[`--wot-${kebabCase(key)}`] = themeVars[key]
  })
  return cssVars
}
```

### 样式优先级

通过内联样式设置 CSS 变量,优先级高于组件默认样式:

```html
<view style="--wot-color-theme: #1890ff;">
  <!-- 子组件会继承这个 CSS 变量 -->
</view>
```

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:3-6,2050-2081

## 基本用法

### 深色模式

通过 `theme` 属性切换浅色和深色模式:

```vue
<template>
  <view class="demo">
    <view class="mode-switch">
      <wd-button size="small" @click="toggleTheme">
        {{ theme === 'light' ? '切换到深色模式' : '切换到浅色模式' }}
      </wd-button>
      <text class="current-theme">当前主题: {{ theme === 'light' ? '浅色' : '深色' }}</text>
    </view>

    <wd-config-provider :theme="theme">
      <view class="theme-content">
        <view class="section">
          <text class="section-title">按钮组件</text>
          <view class="button-group">
            <wd-button type="primary">主要按钮</wd-button>
            <wd-button type="success">成功按钮</wd-button>
            <wd-button type="warning">警告按钮</wd-button>
            <wd-button type="error">错误按钮</wd-button>
          </view>
        </view>

        <view class="section">
          <text class="section-title">表单组件</text>
          <wd-input v-model="inputValue" placeholder="请输入内容" />
          <wd-switch v-model="switchValue" />
          <wd-radio v-model="radioValue" :options="radioOptions" />
        </view>

        <view class="section">
          <text class="section-title">反馈组件</text>
          <wd-tag type="primary">标签</wd-tag>
          <wd-badge :value="10">
            <wd-button size="small">徽标</wd-button>
          </wd-badge>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const theme = ref<'light' | 'dark'>('light')
const inputValue = ref('')
const switchValue = ref(false)
const radioValue = ref('1')
const radioOptions = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
]

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
  min-height: 100vh;
}

.mode-switch {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.current-theme {
  font-size: 26rpx;
  color: #666;
}

.theme-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.button-group {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
</style>
```

**使用说明:**
- `theme="light"`: 浅色模式(默认)
- `theme="dark"`: 深色模式
- 所有子组件会自动应用对应的主题样式
- 切换主题时无需刷新页面,样式实时更新

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:24,2032,2041

### 自定义主题颜色

通过 `theme-vars` 属性自定义主题颜色:

```vue
<template>
  <view class="demo">
    <view class="theme-selector">
      <wd-button
        v-for="preset in presetThemes"
        :key="preset.name"
        size="small"
        :type="currentPreset === preset.name ? 'primary' : 'default'"
        @click="switchPreset(preset.name)"
      >
        {{ preset.label }}
      </wd-button>
    </view>

    <wd-config-provider :theme-vars="currentThemeVars">
      <view class="custom-theme-content">
        <view class="color-preview">
          <view
            v-for="color in colorList"
            :key="color.name"
            class="color-item"
          >
            <view
              class="color-block"
              :style="{ backgroundColor: color.value }"
            ></view>
            <text class="color-name">{{ color.label }}</text>
          </view>
        </view>

        <view class="component-preview">
          <wd-button type="primary">主题色按钮</wd-button>
          <wd-button type="success">成功色按钮</wd-button>
          <wd-button type="warning">警告色按钮</wd-button>
          <wd-button type="error">错误色按钮</wd-button>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const currentPreset = ref('default')

// 预设主题
const presetThemes = [
  {
    name: 'default',
    label: '默认蓝',
    vars: {
      colorTheme: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorDanger: '#f5222d',
    },
  },
  {
    name: 'purple',
    label: '优雅紫',
    vars: {
      colorTheme: '#722ed1',
      colorSuccess: '#13c2c2',
      colorWarning: '#fa8c16',
      colorDanger: '#eb2f96',
    },
  },
  {
    name: 'green',
    label: '清新绿',
    vars: {
      colorTheme: '#52c41a',
      colorSuccess: '#13c2c2',
      colorWarning: '#faad14',
      colorDanger: '#f5222d',
    },
  },
  {
    name: 'orange',
    label: '活力橙',
    vars: {
      colorTheme: '#fa8c16',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorDanger: '#f5222d',
    },
  },
]

const currentThemeVars = computed(() => {
  const preset = presetThemes.find(p => p.name === currentPreset.value)
  return preset?.vars || {}
})

const colorList = computed(() => [
  { name: 'theme', label: '主题色', value: currentThemeVars.value.colorTheme },
  { name: 'success', label: '成功色', value: currentThemeVars.value.colorSuccess },
  { name: 'warning', label: '警告色', value: currentThemeVars.value.colorWarning },
  { name: 'danger', label: '错误色', value: currentThemeVars.value.colorDanger },
])

const switchPreset = (name: string) => {
  currentPreset.value = name
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.theme-selector {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-bottom: 32rpx;
}

.custom-theme-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.color-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.color-block {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.color-name {
  font-size: 26rpx;
  color: #666;
}

.component-preview {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
</style>
```

**使用说明:**
- 通过 `theme-vars` 传入主题变量对象
- 变量名使用驼峰命名,如 `colorTheme`、`buttonPrimaryBgColor`
- 组件内部自动转换为 CSS 变量,如 `--wot-color-theme`
- 修改 `theme-vars` 后,所有组件样式实时更新

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:2034,2060-2081

### 按钮组件主题定制

自定义按钮组件的样式变量:

```vue
<template>
  <view class="demo">
    <view class="config-panel">
      <text class="panel-title">按钮样式配置</text>
      <view class="config-item">
        <text class="config-label">按钮高度:</text>
        <wd-input-number v-model="buttonHeight" :min="60" :max="100" :step="10" />
      </view>
      <view class="config-item">
        <text class="config-label">按钮圆角:</text>
        <wd-input-number v-model="buttonRadius" :min="0" :max="40" :step="4" />
      </view>
      <view class="config-item">
        <text class="config-label">字体大小:</text>
        <wd-input-number v-model="buttonFontSize" :min="24" :max="40" :step="2" />
      </view>
    </view>

    <wd-config-provider :theme-vars="buttonThemeVars">
      <view class="button-preview">
        <text class="preview-title">按钮预览</text>
        <wd-button type="primary" size="medium">主要按钮</wd-button>
        <wd-button type="success" size="medium">成功按钮</wd-button>
        <wd-button type="warning" size="medium">警告按钮</wd-button>
        <wd-button type="error" size="medium">错误按钮</wd-button>
        <wd-button type="primary" size="medium" plain>朴素按钮</wd-button>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const buttonHeight = ref(80)
const buttonRadius = ref(8)
const buttonFontSize = ref(28)

const buttonThemeVars = computed(() => ({
  // 中等尺寸按钮配置
  buttonMediumHeight: `${buttonHeight.value}rpx`,
  buttonMediumRadius: `${buttonRadius.value}rpx`,
  buttonMediumFs: `${buttonFontSize.value}rpx`,
  // 按钮内边距
  buttonMediumPadding: '0 32rpx',
}))
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.config-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 32rpx;
}

.panel-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.config-label {
  font-size: 26rpx;
  color: #666;
}

.button-preview {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.preview-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}
</style>
```

**按钮主题变量说明:**
- `buttonSmallHeight`/`buttonMediumHeight`/`buttonLargeHeight`: 按钮高度
- `buttonSmallRadius`/`buttonMediumRadius`/`buttonLargeRadius`: 按钮圆角
- `buttonSmallFs`/`buttonMediumFs`/`buttonLargeFs`: 按钮字体大小
- `buttonPrimaryBgColor`/`buttonSuccessBgColor`等: 按钮背景色

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:234-312

### 输入框组件主题定制

自定义输入框组件的样式变量:

```vue
<template>
  <view class="demo">
    <view class="theme-tabs">
      <view
        v-for="tab in themeTabs"
        :key="tab.value"
        :class="['tab-item', { active: currentTheme === tab.value }]"
        @click="currentTheme = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <wd-config-provider :theme-vars="inputThemeVars">
      <view class="input-group">
        <text class="group-title">{{ currentThemeConfig.title }}</text>

        <wd-cell title="用户名">
          <wd-input v-model="username" placeholder="请输入用户名" />
        </wd-cell>

        <wd-cell title="密码">
          <wd-input v-model="password" type="password" placeholder="请输入密码" />
        </wd-cell>

        <wd-cell title="手机号">
          <wd-input v-model="phone" type="number" placeholder="请输入手机号" />
        </wd-cell>

        <wd-cell title="备注">
          <wd-textarea v-model="remark" placeholder="请输入备注" />
        </wd-cell>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const currentTheme = ref('modern')
const username = ref('')
const password = ref('')
const phone = ref('')
const remark = ref('')

const themeTabs = [
  { label: '现代风格', value: 'modern' },
  { label: '简约风格', value: 'simple' },
  { label: '科技风格', value: 'tech' },
]

const themeConfigs = {
  modern: {
    title: '现代风格输入框',
    vars: {
      inputBorderColor: '#d9d9d9',
      inputNotEmptyBorderColor: '#1890ff',
      inputFs: '28rpx',
      inputColor: '#333',
      inputPlaceholderColor: '#bfbfbf',
      inputBg: '#ffffff',
    },
  },
  simple: {
    title: '简约风格输入框',
    vars: {
      inputBorderColor: '#e8e8e8',
      inputNotEmptyBorderColor: '#666',
      inputFs: '26rpx',
      inputColor: '#333',
      inputPlaceholderColor: '#c0c0c0',
      inputBg: '#fafafa',
    },
  },
  tech: {
    title: '科技风格输入框',
    vars: {
      inputBorderColor: '#00ffff',
      inputNotEmptyBorderColor: '#0088ff',
      inputFs: '28rpx',
      inputColor: '#00ffff',
      inputPlaceholderColor: '#004466',
      inputBg: '#001122',
    },
  },
}

const currentThemeConfig = computed(() => themeConfigs[currentTheme.value])
const inputThemeVars = computed(() => currentThemeConfig.value.vars)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.theme-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
  padding: 8rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.tab-item {
  flex: 1;
  padding: 16rpx;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  background: transparent;
  border-radius: 8rpx;
  transition: all 0.3s ease;

  &.active {
    color: white;
    background: #1890ff;
    font-weight: bold;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.group-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}
</style>
```

**输入框主题变量说明:**
- `inputBorderColor`: 输入框边框颜色
- `inputNotEmptyBorderColor`: 输入框非空时边框颜色
- `inputFs`/`inputFsLarge`: 输入框字体大小
- `inputColor`: 输入框文字颜色
- `inputPlaceholderColor`: 占位符颜色
- `inputBg`: 输入框背景色

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:599-656

### 标签和徽标组件

自定义标签和徽标组件的样式:

```vue
<template>
  <view class="demo">
    <wd-config-provider :theme-vars="customThemeVars">
      <view class="tag-section">
        <text class="section-title">标签组件</text>
        <view class="tag-group">
          <wd-tag type="primary">主要标签</wd-tag>
          <wd-tag type="success">成功标签</wd-tag>
          <wd-tag type="warning">警告标签</wd-tag>
          <wd-tag type="danger">危险标签</wd-tag>
          <wd-tag type="info">信息标签</wd-tag>
        </view>
      </view>

      <view class="badge-section">
        <text class="section-title">徽标组件</text>
        <view class="badge-group">
          <wd-badge value="5">
            <wd-button size="small">消息</wd-button>
          </wd-badge>
          <wd-badge value="99+">
            <wd-button size="small">通知</wd-button>
          </wd-badge>
          <wd-badge dot>
            <wd-button size="small">待办</wd-button>
          </wd-badge>
          <wd-badge value="NEW">
            <wd-button size="small">新功能</wd-button>
          </wd-badge>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const customThemeVars = ref({
  // 标签样式
  tagFs: '24rpx',
  tagPrimaryColor: '#1890ff',
  tagSuccessColor: '#52c41a',
  tagWarningColor: '#faad14',
  tagDangerColor: '#f5222d',
  tagInfoColor: '#909399',
  tagRoundRadius: '20rpx',

  // 徽标样式
  badgeBg: '#f5222d',
  badgeColor: '#ffffff',
  badgeFs: '20rpx',
  badgePadding: '0 8rpx',
  badgeHeight: '32rpx',
  badgeDotSize: '16rpx',
})
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.tag-section,
.badge-section {
  margin-bottom: 48rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.tag-group {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.badge-group {
  display: flex;
  gap: 32rpx;
  flex-wrap: wrap;
}
</style>
```

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:203-230,1199-1240

### 嵌套配置

支持多层嵌套,子级配置覆盖父级配置:

```vue
<template>
  <view class="demo">
    <!-- 父级配置：蓝色主题 -->
    <wd-config-provider :theme-vars="parentTheme">
      <view class="parent-section">
        <text class="section-title">父级配置（蓝色主题）</text>
        <view class="button-row">
          <wd-button type="primary">父级按钮1</wd-button>
          <wd-button type="success">父级按钮2</wd-button>
        </view>

        <!-- 子级配置：红色主题 -->
        <wd-config-provider :theme-vars="child1Theme">
          <view class="child-section">
            <text class="section-title">子级配置1（红色主题）</text>
            <view class="button-row">
              <wd-button type="primary">子级按钮1</wd-button>
              <wd-button type="success">子级按钮2</wd-button>
            </view>

            <!-- 孙级配置：绿色主题 -->
            <wd-config-provider :theme-vars="child2Theme">
              <view class="grandchild-section">
                <text class="section-title">孙级配置（绿色主题）</text>
                <view class="button-row">
                  <wd-button type="primary">孙级按钮1</wd-button>
                  <wd-button type="success">孙级按钮2</wd-button>
                </view>
              </view>
            </wd-config-provider>
          </view>
        </wd-config-provider>

        <text class="note">回到父级配置区域</text>
        <view class="button-row">
          <wd-button type="primary">父级按钮3</wd-button>
          <wd-button type="success">父级按钮4</wd-button>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 父级主题：蓝色
const parentTheme = ref({
  colorTheme: '#1890ff',
  colorSuccess: '#52c41a',
  buttonPrimaryBgColor: '#1890ff',
  buttonSuccessBgColor: '#52c41a',
})

// 子级主题1：红色
const child1Theme = ref({
  colorTheme: '#f5222d',
  colorSuccess: '#fa8c16',
  buttonPrimaryBgColor: '#f5222d',
  buttonSuccessBgColor: '#fa8c16',
})

// 孙级主题：绿色
const child2Theme = ref({
  colorTheme: '#52c41a',
  colorSuccess: '#13c2c2',
  buttonPrimaryBgColor: '#52c41a',
  buttonSuccessBgColor: '#13c2c2',
})
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.parent-section {
  padding: 24rpx;
  background: #e6f7ff;
  border-radius: 12rpx;
}

.child-section {
  margin: 24rpx 0;
  padding: 24rpx;
  background: #fff1f0;
  border-radius: 12rpx;
}

.grandchild-section {
  margin: 24rpx 0;
  padding: 24rpx;
  background: #f6ffed;
  border-radius: 12rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.button-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.note {
  display: block;
  margin: 24rpx 0 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

**使用说明:**
- 支持无限层级嵌套
- 子级配置会覆盖父级的同名变量
- 未定义的变量会继承父级配置
- CSS 变量的继承特性使得嵌套配置非常高效

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:3-6

## 高级用法

### 完整的按钮主题定制

展示按钮组件的所有可定制变量:

```vue
<template>
  <view class="demo">
    <wd-config-provider :theme-vars="buttonTheme">
      <view class="button-showcase">
        <view class="size-section">
          <text class="section-title">不同尺寸</text>
          <wd-button type="primary" size="small">小型按钮</wd-button>
          <wd-button type="primary" size="medium">中型按钮</wd-button>
          <wd-button type="primary" size="large">大型按钮</wd-button>
        </view>

        <view class="type-section">
          <text class="section-title">不同类型</text>
          <wd-button type="primary">主要按钮</wd-button>
          <wd-button type="success">成功按钮</wd-button>
          <wd-button type="info">信息按钮</wd-button>
          <wd-button type="warning">警告按钮</wd-button>
          <wd-button type="error">错误按钮</wd-button>
        </view>

        <view class="style-section">
          <text class="section-title">不同样式</text>
          <wd-button type="primary">默认按钮</wd-button>
          <wd-button type="primary" plain>朴素按钮</wd-button>
          <wd-button type="primary" icon="search">带图标</wd-button>
          <wd-button type="primary" loading>加载中</wd-button>
          <wd-button type="primary" disabled>禁用按钮</wd-button>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const buttonTheme = ref({
  // 小按钮配置
  buttonSmallHeight: '56rpx',
  buttonSmallPadding: '0 24rpx',
  buttonSmallFs: '24rpx',
  buttonSmallRadius: '6rpx',
  buttonSmallLoading: '28rpx',

  // 中按钮配置
  buttonMediumHeight: '80rpx',
  buttonMediumPadding: '0 32rpx',
  buttonMediumFs: '28rpx',
  buttonMediumRadius: '8rpx',
  buttonMediumLoading: '32rpx',

  // 大按钮配置
  buttonLargeHeight: '100rpx',
  buttonLargePadding: '0 40rpx',
  buttonLargeFs: '32rpx',
  buttonLargeRadius: '12rpx',
  buttonLargeLoading: '36rpx',

  // 颜色配置
  buttonPrimaryColor: '#ffffff',
  buttonPrimaryBgColor: '#1890ff',
  buttonSuccessColor: '#ffffff',
  buttonSuccessBgColor: '#52c41a',
  buttonInfoColor: '#ffffff',
  buttonInfoBgColor: '#909399',
  buttonWarningColor: '#ffffff',
  buttonWarningBgColor: '#faad14',
  buttonErrorColor: '#ffffff',
  buttonErrorBgColor: '#f5222d',

  // 朴素按钮配置
  buttonPlainBgColor: '#ffffff',

  // 图标配置
  buttonIconSize: '32rpx',
  buttonIconColor: '#ffffff',

  // 禁用状态
  buttonDisabledOpacity: '0.6',
})
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.button-showcase {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.size-section,
.type-section,
.style-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}
</style>
```

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:234-312

### 深色模式主题变量

配合深色模式使用主题变量:

```vue
<template>
  <view class="demo">
    <view class="mode-toggle">
      <wd-button @click="toggleMode">
        切换到{{ theme === 'light' ? '深色' : '浅色' }}模式
      </wd-button>
    </view>

    <wd-config-provider :theme="theme" :theme-vars="themeVars">
      <view class="content-area">
        <view class="card">
          <text class="card-title">卡片标题</text>
          <text class="card-content">
            这是一个示例卡片,展示了深色模式下的样式效果。
            可以通过切换按钮来查看不同主题下的显示效果。
          </text>
          <view class="card-actions">
            <wd-button size="small" type="primary">操作1</wd-button>
            <wd-button size="small">操作2</wd-button>
          </view>
        </view>

        <view class="form-area">
          <wd-cell title="用户名">
            <wd-input v-model="username" placeholder="请输入用户名" />
          </wd-cell>
          <wd-cell title="密码">
            <wd-input v-model="password" type="password" placeholder="请输入密码" />
          </wd-cell>
          <wd-cell title="记住密码">
            <wd-switch v-model="remember" />
          </wd-cell>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const theme = ref<'light' | 'dark'>('light')
const username = ref('')
const password = ref('')
const remember = ref(false)

// 深色模式主题变量
const darkThemeVars = {
  // 背景色
  darkBackground: '#1a1a1a',
  darkBackground2: '#2a2a2a',
  darkBackground3: '#333333',
  darkBackground4: '#404040',

  // 文字颜色
  darkColor: '#e8e8e8',
  darkColor2: '#b8b8b8',
  darkColor3: '#888888',

  // 边框颜色
  darkBorderColor: '#404040',

  // 按钮在深色模式下的配置
  buttonPrimaryBgColor: '#1890ff',
  buttonPrimaryColor: '#ffffff',
}

// 浅色模式主题变量
const lightThemeVars = {
  // 背景色
  colorBg: '#f5f5f5',

  // 文字颜色
  colorTitle: '#333333',
  colorContent: '#666666',
  colorSecondary: '#999999',

  // 边框颜色
  colorBorder: '#ebeef5',
}

const themeVars = computed(() => {
  return theme.value === 'dark' ? darkThemeVars : lightThemeVars
})

const toggleMode = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<style lang="scss" scoped>
.demo {
  min-height: 100vh;
  padding: 32rpx;
}

.mode-toggle {
  margin-bottom: 32rpx;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.card {
  padding: 32rpx;
  background: var(--wot-dark-background2, #ffffff);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: var(--wot-dark-color, #333);
  margin-bottom: 16rpx;
}

.card-content {
  display: block;
  font-size: 26rpx;
  color: var(--wot-dark-color2, #666);
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.card-actions {
  display: flex;
  gap: 16rpx;
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 1rpx;
}
</style>
```

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:98-121

### 颜色系统定制

完整的颜色系统定制示例:

```vue
<template>
  <view class="demo">
    <view class="color-picker">
      <text class="picker-title">选择品牌色</text>
      <view class="color-options">
        <view
          v-for="color in brandColors"
          :key="color.value"
          class="color-option"
          :class="{ active: selectedColor === color.value }"
          :style="{ backgroundColor: color.value }"
          @click="selectedColor = color.value"
        >
          <wd-icon v-if="selectedColor === color.value" name="check" color="#ffffff" size="24" />
        </view>
      </view>
    </view>

    <wd-config-provider :theme-vars="colorSystemVars">
      <view class="color-system-demo">
        <view class="color-category">
          <text class="category-title">主题色系</text>
          <view class="color-row">
            <view class="color-block theme-block"></view>
            <text class="color-label">主题色</text>
          </view>
        </view>

        <view class="color-category">
          <text class="category-title">功能色系</text>
          <view class="color-row">
            <view class="color-block success-block"></view>
            <text class="color-label">成功色</text>
          </view>
          <view class="color-row">
            <view class="color-block warning-block"></view>
            <text class="color-label">警告色</text>
          </view>
          <view class="color-row">
            <view class="color-block danger-block"></view>
            <text class="color-label">危险色</text>
          </view>
          <view class="color-row">
            <view class="color-block info-block"></view>
            <text class="color-label">信息色</text>
          </view>
        </view>

        <view class="color-category">
          <text class="category-title">中性色系</text>
          <view class="neutral-colors">
            <view class="color-block gray1-block"></view>
            <view class="color-block gray2-block"></view>
            <view class="color-block gray3-block"></view>
            <view class="color-block gray4-block"></view>
            <view class="color-block gray5-block"></view>
            <view class="color-block gray6-block"></view>
          </view>
        </view>

        <view class="component-samples">
          <text class="category-title">组件示例</text>
          <wd-button type="primary">主题色按钮</wd-button>
          <wd-tag type="primary">主题色标签</wd-tag>
          <wd-badge value="NEW" type="primary">
            <wd-button size="small">新功能</wd-button>
          </wd-badge>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const selectedColor = ref('#1890ff')

const brandColors = [
  { label: '默认蓝', value: '#1890ff' },
  { label: '优雅紫', value: '#722ed1' },
  { label: '活力橙', value: '#fa8c16' },
  { label: '清新绿', value: '#52c41a' },
  { label: '科技青', value: '#13c2c2' },
  { label: '浪漫粉', value: '#eb2f96' },
]

const colorSystemVars = computed(() => ({
  // 主题色
  colorTheme: selectedColor.value,

  // 功能色
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorDanger: '#f5222d',
  colorInfo: '#909399',

  // 中性色
  colorGray1: '#f8f8f8',
  colorGray2: '#f0f0f0',
  colorGray3: '#e8e8e8',
  colorGray4: '#d9d9d9',
  colorGray5: '#bfbfbf',
  colorGray6: '#8c8c8c',

  // 文本色
  colorTitle: '#333333',
  colorContent: '#666666',
  colorSecondary: '#999999',
  colorAid: '#c0c0c0',

  // 边框色
  colorBorder: '#ebeef5',
  colorBorderLight: '#f0f0f0',

  // 背景色
  colorBg: '#f5f5f5',
}))
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.color-picker {
  margin-bottom: 48rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.picker-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.color-options {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.color-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

  &.active {
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
    transform: scale(1.1);
  }
}

.color-system-demo {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.color-category {
  padding: 24rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.category-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.color-block {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.theme-block {
  background: var(--wot-color-theme);
}

.success-block {
  background: var(--wot-color-success);
}

.warning-block {
  background: var(--wot-color-warning);
}

.danger-block {
  background: var(--wot-color-danger);
}

.info-block {
  background: var(--wot-color-info);
}

.gray1-block {
  background: var(--wot-color-gray-1);
}

.gray2-block {
  background: var(--wot-color-gray-2);
}

.gray3-block {
  background: var(--wot-color-gray-3);
}

.gray4-block {
  background: var(--wot-color-gray-4);
}

.gray5-block {
  background: var(--wot-color-gray-5);
}

.gray6-block {
  background: var(--wot-color-gray-6);
}

.color-label {
  font-size: 26rpx;
  color: #666;
}

.neutral-colors {
  display: flex;
  gap: 12rpx;
}

.component-samples {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}
</style>
```

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:29-146

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| theme | 主题模式 | `'light' \| 'dark'` | `'light'` |
| theme-vars | 自定义主题变量对象 | `ConfigProviderThemeVars` | `{}` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:2025-2043

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 需要应用主题配置的内容 |

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:4

### 类型定义

#### 主题模式类型

```typescript
/**
 * 主题风格类型
 */
type ConfigProviderTheme = 'light' | 'dark'
```

#### 组件属性接口

```typescript
/**
 * 配置提供者组件属性接口
 */
interface WdConfigProviderProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 主题风格，设置为 dark 来开启深色模式，全局生效 */
  theme?: ConfigProviderTheme
  /** 自定义主题变量 */
  themeVars?: ConfigProviderThemeVars
}
```

#### 基础主题变量

```typescript
/**
 * 基础主题变量接口
 */
interface BaseThemeVars {
  /** 主题色 */
  colorTheme?: string
  /** 用于mix的白色 */
  colorWhite?: string
  /** 用于mix的黑色 */
  colorBlack?: string
  /** 成功色 */
  colorSuccess?: string
  /** 警告色 */
  colorWarning?: string
  /** 危险出错色 */
  colorDanger?: string
  /** 紫色 */
  colorPurple?: string
  /** 黄色 */
  colorYellow?: string
  /** 蓝色 */
  colorBlue?: string
  /** 信息色 */
  colorInfo?: string
  /** 灰色1-8 */
  colorGray1?: string
  colorGray2?: string
  colorGray3?: string
  colorGray4?: string
  colorGray5?: string
  colorGray6?: string
  colorGray7?: string
  colorGray8?: string
  /** 字体灰色1-4 */
  fontGray1?: string
  fontGray2?: string
  fontGray3?: string
  fontGray4?: string
  /** 字体白色1-4 */
  fontWhite1?: string
  fontWhite2?: string
  fontWhite3?: string
  fontWhite4?: string
  /** 模块标题/重要正文 */
  colorTitle?: string
  /** 普通正文 */
  colorContent?: string
  /** 次要信息，注释/补充/正文 */
  colorSecondary?: string
  /** 辅助文字字号，弱化信息，引导性/不可点文字 */
  colorAid?: string
  /** 失效、默认提示文字 */
  colorTip?: string
  /** 控件边框线 */
  colorBorder?: string
  /** 分割线颜色 */
  colorBorderLight?: string
  /** 背景色、禁用填充色 */
  colorBg?: string
  /** 深色背景1-7 */
  darkBackground?: string
  darkBackground2?: string
  darkBackground3?: string
  darkBackground4?: string
  darkBackground5?: string
  darkBackground6?: string
  darkBackground7?: string
  /** 深色字体1-3 */
  darkColor?: string
  darkColor2?: string
  darkColor3?: string
  /** 深色灰色 */
  darkColorGray?: string
  /** 深色边框颜色 */
  darkBorderColor?: string
  /** icon颜色 */
  colorIcon?: string
  /** icon颜色hover */
  colorIconActive?: string
  /** icon颜色disabled */
  colorIconDisabled?: string
  /** 大型标题字号 */
  fsBig?: string
  /** 重要数据字号 */
  fsImportant?: string
  /** 标题字号/重要正文字号 */
  fsTitle?: string
  /** 普通正文字号 */
  fsContent?: string
  /** 次要信息字号 */
  fsSecondary?: string
  /** 辅助文字字号 */
  fsAid?: string
  /** 字重500 */
  fwMedium?: string
  /** 字重600 */
  fwSemibold?: string
  /** 屏幕两边留白padding */
  sizeSidePadding?: string
}
```

#### 完整主题变量类型

```typescript
/**
 * 配置提供者主题变量接口
 * 包含所有组件的主题变量（78个组件，2000+变量）
 */
export type ConfigProviderThemeVars = BaseThemeVars &
  ActionSheetThemeVars &    // 操作表
  BadgeThemeVars &          // 徽标
  ButtonThemeVars &         // 按钮
  CellThemeVars &           // 单元格
  CalendarThemeVars &       // 日历
  CheckboxThemeVars &       // 复选框
  CollapseThemeVars &       // 折叠面板
  DividerThemeVars &        // 分割线
  DropMenuThemeVars &       // 下拉菜单
  InputNumberThemeVars &    // 数字输入框
  InputThemeVars &          // 输入框
  TextareaThemeVars &       // 文本域
  LoadmoreThemeVars &       // 加载更多
  MessageBoxThemeVars &     // 消息框
  NoticeBarThemeVars &      // 通知栏
  PaginationThemeVars &     // 分页
  PickerThemeVars &         // 选择器
  ColPickerThemeVars &      // 列选择器
  OverlayThemeVars &        // 遮罩层
  PopupThemeVars &          // 弹出层
  ProgressThemeVars &       // 进度条
  RadioThemeVars &          // 单选框
  SearchThemeVars &         // 搜索
  SliderThemeVars &         // 滑块
  SortButtonThemeVars &     // 排序按钮
  StepsThemeVars &          // 步骤条
  SwitchThemeVars &         // 开关
  TabsThemeVars &           // 选项卡
  TagThemeVars &            // 标签
  ToastThemeVars &          // 提示
  LoadingThemeVars &        // 加载
  TooltipThemeVars &        // 工具提示
  PopoverThemeVars &        // 气泡框
  // ... 还有 50+ 个组件主题变量接口
```

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:23-2021

## 主题变量完整列表

### 按钮组件 (ButtonThemeVars)

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| buttonDisabledOpacity | 按钮禁用透明度 | `0.6` |
| buttonSmallHeight | 小按钮高度 | `56rpx` |
| buttonSmallPadding | 小按钮内边距 | `0 24rpx` |
| buttonSmallFs | 小按钮字体大小 | `24rpx` |
| buttonSmallRadius | 小按钮圆角 | `6rpx` |
| buttonMediumHeight | 中等按钮高度 | `80rpx` |
| buttonMediumPadding | 中等按钮内边距 | `0 32rpx` |
| buttonMediumFs | 中等按钮字体大小 | `28rpx` |
| buttonMediumRadius | 中等按钮圆角 | `8rpx` |
| buttonLargeHeight | 大按钮高度 | `100rpx` |
| buttonLargePadding | 大按钮内边距 | `0 40rpx` |
| buttonLargeFs | 大按钮字体大小 | `32rpx` |
| buttonLargeRadius | 大按钮圆角 | `12rpx` |
| buttonPrimaryColor | 主要按钮颜色 | `#ffffff` |
| buttonPrimaryBgColor | 主要按钮背景色 | `#1890ff` |
| buttonSuccessColor | 成功按钮颜色 | `#ffffff` |
| buttonSuccessBgColor | 成功按钮背景色 | `#52c41a` |
| buttonWarningColor | 警告按钮颜色 | `#ffffff` |
| buttonWarningBgColor | 警告按钮背景色 | `#faad14` |
| buttonErrorColor | 错误按钮颜色 | `#ffffff` |
| buttonErrorBgColor | 错误按钮背景色 | `#f5222d` |

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:234-312

### 输入框组件 (InputThemeVars)

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| inputPadding | 输入框内边距 | `0 24rpx` |
| inputBorderColor | 输入框边框颜色 | `#d9d9d9` |
| inputNotEmptyBorderColor | 输入框非空边框颜色 | `#1890ff` |
| inputFs | 输入框字体大小 | `28rpx` |
| inputFsLarge | 输入框大字体大小 | `32rpx` |
| inputColor | 输入框文字颜色 | `#333333` |
| inputPlaceholderColor | 占位符颜色 | `#bfbfbf` |
| inputDisabledColor | 输入框禁用颜色 | `#c0c0c0` |
| inputErrorColor | 输入框错误颜色 | `#f5222d` |
| inputIconColor | 输入框图标颜色 | `#666666` |
| inputClearColor | 输入框清除颜色 | `#999999` |
| inputBg | 输入框背景 | `#ffffff` |
| inputCellHeight | 输入框单元格高度 | `96rpx` |

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:599-656

### 标签组件 (TagThemeVars)

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| tagFs | 标签字体大小 | `24rpx` |
| tagColor | 标签颜色 | `#333333` |
| tagSmallFs | 标签小字体大小 | `20rpx` |
| tagPrimaryColor | 标签主要颜色 | `#1890ff` |
| tagSuccessColor | 标签成功颜色 | `#52c41a` |
| tagWarningColor | 标签警告颜色 | `#faad14` |
| tagDangerColor | 标签危险颜色 | `#f5222d` |
| tagInfoColor | 标签信息颜色 | `#909399` |
| tagPrimaryBg | 标签主要背景 | `#e6f7ff` |
| tagSuccessBg | 标签成功背景 | `#f6ffed` |
| tagWarningBg | 标签警告背景 | `#fffbe6` |
| tagDangerBg | 标签危险背景 | `#fff1f0` |
| tagInfoBg | 标签信息背景 | `#f4f4f5` |
| tagRoundRadius | 标签圆形圆角 | `20rpx` |
| tagCloseSize | 标签关闭大小 | `24rpx` |

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:1199-1240

### 徽标组件 (BadgeThemeVars)

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| badgeBg | 徽标背景色 | `#f5222d` |
| badgeColor | 徽标文字颜色 | `#ffffff` |
| badgeFs | 徽标字体大小 | `20rpx` |
| badgePadding | 徽标内边距 | `0 8rpx` |
| badgeHeight | 徽标高度 | `32rpx` |
| badgePrimary | 徽标主要颜色 | `#1890ff` |
| badgeSuccess | 徽标成功颜色 | `#52c41a` |
| badgeWarning | 徽标警告颜色 | `#faad14` |
| badgeDanger | 徽标危险颜色 | `#f5222d` |
| badgeInfo | 徽标信息颜色 | `#909399` |
| badgeDotSize | 徽标圆点大小 | `16rpx` |

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:203-230

**说明**: 由于主题变量数量庞大(2000+),这里只列出部分常用组件的变量。完整的变量列表请参考源码中的类型定义。

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:29-2021

## 最佳实践

### 1. 统一主题配置

在应用最外层统一配置主题,避免多处配置:

```vue
<!-- App.vue -->
<template>
  <wd-config-provider :theme="appTheme" :theme-vars="appThemeVars">
    <view class="app">
      <router-view />
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

// ✅ 推荐: 在应用根组件统一配置主题
const appTheme = ref<'light' | 'dark'>('light')

const appThemeVars = computed(() => ({
  // 品牌色配置
  colorTheme: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorDanger: '#f5222d',

  // 按钮配置
  buttonMediumHeight: '80rpx',
  buttonMediumRadius: '8rpx',

  // 输入框配置
  inputBorderColor: '#d9d9d9',
  inputNotEmptyBorderColor: '#1890ff',
}))

// 从本地存储恢复主题设置
onMounted(() => {
  const savedTheme = uni.getStorageSync('app-theme')
  if (savedTheme) {
    appTheme.value = savedTheme
  }
})

// ❌ 不推荐: 在多个页面分别配置主题
// 这会导致主题不一致,且难以维护
</script>
```

**优点:**
- 主题配置集中管理,易于维护
- 所有子组件自动应用主题
- 便于实现主题切换功能

### 2. 主题变量分类管理

将主题变量按类别组织,便于管理和复用:

```typescript
// theme/variables.ts

// ✅ 推荐: 按类别组织主题变量
export const colorSystem = {
  // 品牌色
  colorTheme: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorDanger: '#f5222d',
  colorInfo: '#909399',

  // 文本色
  colorTitle: '#333333',
  colorContent: '#666666',
  colorSecondary: '#999999',

  // 边框色
  colorBorder: '#ebeef5',
  colorBorderLight: '#f0f0f0',

  // 背景色
  colorBg: '#f5f5f5',
}

export const buttonTheme = {
  buttonMediumHeight: '80rpx',
  buttonMediumPadding: '0 32rpx',
  buttonMediumFs: '28rpx',
  buttonMediumRadius: '8rpx',
  buttonPrimaryBgColor: colorSystem.colorTheme,
  buttonSuccessBgColor: colorSystem.colorSuccess,
}

export const inputTheme = {
  inputFs: '28rpx',
  inputColor: colorSystem.colorTitle,
  inputPlaceholderColor: colorSystem.colorSecondary,
  inputBorderColor: colorSystem.colorBorder,
  inputNotEmptyBorderColor: colorSystem.colorTheme,
}

// 导出完整主题
export const appTheme = {
  ...colorSystem,
  ...buttonTheme,
  ...inputTheme,
}

// ❌ 不推荐: 所有变量混在一起
// const theme = {
//   colorTheme: '#1890ff',
//   buttonMediumHeight: '80rpx',
//   inputFs: '28rpx',
//   tagPrimaryColor: '#1890ff',
//   // ... 100+ 个变量混在一起
// }
```

**优点:**
- 变量分类清晰,易于查找和修改
- 可以复用颜色变量,保持一致性
- 便于团队协作和代码审查

### 3. 响应式主题切换

实现用户友好的主题切换功能:

```vue
<template>
  <view class="theme-manager">
    <!-- 主题切换按钮 -->
    <view class="theme-switch" @click="toggleTheme">
      <wd-icon :name="themeIcon" size="24" />
      <text>{{ themeLabel }}</text>
    </view>

    <!-- 应用内容 -->
    <wd-config-provider :theme="currentTheme" :theme-vars="currentThemeVars">
      <view class="app-content">
        <slot />
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

const currentTheme = ref<'light' | 'dark'>('light')

// ✅ 推荐: 提供友好的主题切换体验
const themeIcon = computed(() => {
  return currentTheme.value === 'light' ? 'sunny' : 'moon'
})

const themeLabel = computed(() => {
  return currentTheme.value === 'light' ? '浅色模式' : '深色模式'
})

const currentThemeVars = computed(() => {
  if (currentTheme.value === 'dark') {
    return {
      // 深色模式变量
      darkBackground: '#1a1a1a',
      darkColor: '#e8e8e8',
      darkBorderColor: '#404040',
    }
  }
  return {}
})

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'

  // 保存到本地存储
  uni.setStorageSync('app-theme', currentTheme.value)

  // 设置状态栏样式
  uni.setNavigationBarColor({
    frontColor: currentTheme.value === 'light' ? '#000000' : '#ffffff',
    backgroundColor: currentTheme.value === 'light' ? '#ffffff' : '#1a1a1a',
  })
}

// 监听主题变化,添加过渡动画
watch(currentTheme, () => {
  // 可以添加主题切换动画
  console.log('主题切换至:', currentTheme.value)
})

// ❌ 不推荐: 切换主题时刷新页面
// const toggleTheme = () => {
//   location.reload()
// }
</script>
```

**优点:**
- 主题切换流畅,无需刷新页面
- 保存用户偏好,下次自动恢复
- 同步更新状态栏样式,体验更好

### 4. 按需覆盖变量

只覆盖需要自定义的变量,保持其他变量使用默认值:

```vue
<template>
  <wd-config-provider :theme-vars="customVars">
    <!-- 应用内容 -->
  </wd-config-provider>
</template>

<script lang="ts" setup>
// ✅ 推荐: 只覆盖需要自定义的变量
const customVars = {
  // 只修改品牌色
  colorTheme: '#722ed1',

  // 只修改按钮高度
  buttonMediumHeight: '88rpx',

  // 其他变量使用默认值
}

// ❌ 不推荐: 复制所有默认变量再修改
// const customVars = {
//   colorTheme: '#1890ff',
//   colorSuccess: '#52c41a',
//   colorWarning: '#faad14',
//   // ... 复制了 100+ 个变量
//   buttonMediumHeight: '88rpx', // 只需要改这一个
//   // ... 又复制了 100+ 个变量
// }
</script>
```

**优点:**
- 代码简洁,只包含差异部分
- 未覆盖的变量自动使用默认值
- 减少维护成本,降低出错概率

### 5. 类型安全

使用 TypeScript 类型定义,获得类型提示和检查:

```vue
<script lang="ts" setup>
import type { ConfigProviderThemeVars } from '@/wd/components/wd-config-provider/wd-config-provider.vue'

// ✅ 推荐: 使用类型定义
const customTheme: ConfigProviderThemeVars = {
  colorTheme: '#1890ff',
  buttonMediumHeight: '80rpx',
  // TypeScript 会提示可用的变量名
  // 如果拼写错误,会在编译时报错
}

// ❌ 不推荐: 不使用类型定义
// const customTheme = {
//   colorTheme: '#1890ff',
//   buttonMeidum Height: '80rpx', // 拼写错误,不会报错
// }
</script>
```

**优点:**
- 编辑器自动提示可用变量名
- 拼写错误在编译时就能发现
- 类型安全,减少运行时错误

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:1956-2035

## 常见问题

### 1. 主题变量不生效

**问题原因:**
- 变量名拼写错误
- 变量名使用了短横线命名而非驼峰命名
- 组件内部未使用该 CSS 变量

**解决方案:**

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 组件内容 -->
  </wd-config-provider>
</template>

<script lang="ts" setup>
// ❌ 错误: 使用了短横线命名
// const themeVars = {
//   'color-theme': '#1890ff',
//   'button-medium-height': '80rpx',
// }

// ✅ 正确: 使用驼峰命名
const themeVars = {
  colorTheme: '#1890ff',
  buttonMediumHeight: '80rpx',
}

// ❌ 错误: 变量名拼写错误
// const themeVars = {
//   colourTheme: '#1890ff',      // 应该是 colorTheme
//   buttonMeduimHeight: '80rpx', // 应该是 buttonMediumHeight
// }
</script>
```

**检查方法:**
1. 使用浏览器开发者工具查看元素的 CSS 变量
2. 确认变量名是否正确转换为 `--wot-{kebab-case}`
3. 使用 TypeScript 类型定义,编译时会提示错误

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:2050-2053,2060-2072

### 2. 嵌套配置优先级问题

**问题原因:**
- 不理解嵌套配置的覆盖规则
- 子级配置未正确覆盖父级配置
- CSS 变量继承特性导致的混淆

**解决方案:**

```vue
<template>
  <!-- 父级配置: 蓝色主题 -->
  <wd-config-provider :theme-vars="{ colorTheme: '#1890ff' }">
    <wd-button type="primary">蓝色按钮</wd-button>

    <!-- 子级配置: 红色主题,会覆盖父级 -->
    <wd-config-provider :theme-vars="{ colorTheme: '#f5222d' }">
      <wd-button type="primary">红色按钮</wd-button>
    </wd-config-provider>

    <!-- 回到父级配置 -->
    <wd-button type="primary">蓝色按钮</wd-button>
  </wd-config-provider>
</template>

<script lang="ts" setup>
// ✅ 正确理解: 子级配置只影响子级范围内的组件
// 子级配置的变量会覆盖父级的同名变量
// 未定义的变量会继承父级配置

// ❌ 常见误解: 子级配置会影响父级或兄弟级组件
// 实际上CSS变量遵循DOM树的继承规则
</script>
```

**规则说明:**
- 子级 ConfigProvider 的变量会覆盖父级同名变量
- 子级未定义的变量会继承父级配置
- 配置只影响 ConfigProvider 内部的子组件
- CSS 变量遵循 DOM 树的继承规则

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:3-6

### 3. 深色模式样式不完整

**问题原因:**
- 只设置了 `theme="dark"`,未配置深色模式变量
- 组件内部某些样式未适配深色模式
- 自定义样式未使用 CSS 变量

**解决方案:**

```vue
<template>
  <!-- ❌ 错误: 只设置 theme,未配置深色变量 -->
  <wd-config-provider theme="dark">
    <!-- 部分组件可能显示不正常 -->
  </wd-config-provider>

  <!-- ✅ 正确: 同时设置 theme 和深色变量 -->
  <wd-config-provider theme="dark" :theme-vars="darkVars">
    <!-- 所有组件都能正常显示 -->
  </wd-config-provider>
</template>

<script lang="ts" setup>
// ✅ 完整的深色模式配置
const darkVars = {
  // 背景色
  darkBackground: '#1a1a1a',
  darkBackground2: '#2a2a2a',
  darkBackground3: '#333333',

  // 文字颜色
  darkColor: '#e8e8e8',
  darkColor2: '#b8b8b8',
  darkColor3: '#888888',

  // 边框颜色
  darkBorderColor: '#404040',

  // 组件特定配置
  buttonPrimaryBgColor: '#1890ff',
  inputBg: '#2a2a2a',
  inputColor: '#e8e8e8',
  inputBorderColor: '#404040',
}

// ❌ 不完整的配置
// const darkVars = {
//   darkBackground: '#1a1a1a',
//   // 缺少其他变量,部分组件显示不正常
// }
</script>

<style lang="scss" scoped>
// ✅ 推荐: 自定义样式使用 CSS 变量
.custom-box {
  background: var(--wot-dark-background, #ffffff);
  color: var(--wot-dark-color, #333333);
}

// ❌ 不推荐: 硬编码颜色值
// .custom-box {
//   background: #ffffff; // 深色模式下不会变化
//   color: #333333;
// }
</style>
```

**解决建议:**
- 使用完整的深色模式变量配置
- 自定义样式使用 CSS 变量而非硬编码
- 测试所有组件在深色模式下的显示效果

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:98-121

### 4. 性能问题

**问题原因:**
- theme-vars 对象频繁变化导致重复计算
- 在 theme-vars 中放置了大量动态数据
- 未使用计算属性缓存变量转换

**解决方案:**

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 应用内容 -->
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// ❌ 不推荐: 频繁变化的响应式对象
// const themeVars = ref({
//   colorTheme: '#1890ff',
//   dynamicValue: Math.random(), // 随机值,每次渲染都不同
// })

// ✅ 推荐: 使用计算属性,只在依赖变化时重新计算
const brandColor = ref('#1890ff')

const themeVars = computed(() => ({
  colorTheme: brandColor.value,
  buttonPrimaryBgColor: brandColor.value,
  // 只在 brandColor 变化时才重新计算
}))

// ✅ 推荐: 静态配置使用普通对象
// const themeVars = {
//   colorTheme: '#1890ff',
//   buttonMediumHeight: '80rpx',
// }
</script>
```

**优化建议:**
- 静态配置使用普通对象,避免不必要的响应式
- 动态配置使用 computed 缓存计算结果
- 避免在 theme-vars 中放置频繁变化的数据
- 组件内部已使用 computed 缓存样式转换

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:2078-2081

### 5. CSS 变量名不匹配

**问题原因:**
- 不理解驼峰命名到短横线命名的转换规则
- 手动编写 CSS 变量名时拼写错误
- 组件内部变量名与文档不一致

**解决方案:**

```typescript
// 驼峰命名转短横线命名规则:
// colorTheme → --wot-color-theme
// buttonPrimaryBgColor → --wot-button-primary-bg-color
// inputFsLarge → --wot-input-fs-large

// ✅ 正确的变量名对应关系
const themeVars = {
  colorTheme: '#1890ff',              // → --wot-color-theme
  buttonMediumHeight: '80rpx',        // → --wot-button-medium-height
  inputPlaceholderColor: '#bfbfbf',   // → --wot-input-placeholder-color
}

// ❌ 常见错误
// colorTheme → --wot-colorTheme (错误,未转换)
// buttonMediumHeight → --wot-button-medium_height (错误,使用了下划线)
// inputPlaceholderColor → --wot-input-placeholder (错误,不完整)
```

**验证方法:**
1. 使用浏览器开发者工具查看元素的 computed styles
2. 搜索 `--wot-` 前缀的 CSS 变量
3. 确认变量名是否正确转换

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:2050-2072

## 注意事项

1. **变量命名规范**
   - theme-vars 中的变量名必须使用驼峰命名(camelCase)
   - 组件内部自动转换为短横线命名(kebab-case)的 CSS 变量
   - 所有 CSS 变量以 `--wot-` 为前缀

2. **配置优先级**
   - 子级 ConfigProvider 的配置会覆盖父级配置
   - 未定义的变量会继承父级配置
   - CSS 变量的继承遵循 DOM 树结构

3. **深色模式支持**
   - 设置 `theme="dark"` 只是添加主题类名
   - 需要配合深色模式变量才能完整适配
   - 建议使用完整的深色变量配置

4. **性能考虑**
   - 静态配置使用普通对象
   - 动态配置使用 computed 缓存
   - 避免频繁修改 theme-vars
   - 组件内部已优化样式计算

5. **类型安全**
   - 使用 TypeScript 类型定义获得类型提示
   - 编译时检查变量名拼写错误
   - 类型定义涵盖所有 2000+ 个变量

6. **兼容性**
   - 所有主流浏览器和小程序平台都支持 CSS 变量
   - H5 端支持所有特性
   - 小程序端部分平台可能有 CSS 变量限制
   - 建议在目标平台测试主题效果

参考: src/wd/components/wd-config-provider/wd-config-provider.vue:2050-2115
