# ConfigProvider 配置

WD UI 全局配置组件，用于向下传递全局配置信息，包括主题、语言、尺寸等。

## 基本使用

### 基础配置

```vue
<template>
  <wd-config-provider :config="globalConfig">
    <view class="app">
      <!-- 应用内容 -->
      <wd-button type="primary">按钮</wd-button>
      <wd-input v-model="inputValue" placeholder="输入内容" />
    </view>
  </wd-config-provider>
</template>

<script setup>
import { ref } from 'vue'

const inputValue = ref('')

const globalConfig = {
  // 主题配置
  theme: {
    primaryColor: '#1890ff',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#f5222d'
  },
  // 组件尺寸
  size: 'medium'
}
</script>
```

### 主题定制

```vue
<template>
  <view class="demo-block">
    <!-- 默认主题 -->
    <wd-config-provider>
      <view class="theme-section">
        <h3>默认主题</h3>
        <wd-button type="primary">主要按钮</wd-button>
        <wd-button type="success">成功按钮</wd-button>
        <wd-button type="warning">警告按钮</wd-button>
        <wd-button type="error">危险按钮</wd-button>
      </view>
    </wd-config-provider>
    
    <!-- 自定义主题 -->
    <wd-config-provider :config="customThemeConfig">
      <view class="theme-section">
        <h3>自定义主题</h3>
        <wd-button type="primary">主要按钮</wd-button>
        <wd-button type="success">成功按钮</wd-button>
        <wd-button type="warning">警告按钮</wd-button>
        <wd-button type="error">危险按钮</wd-button>
      </view>
    </wd-config-provider>
  </view>
</template>

<script setup>
const customThemeConfig = {
  theme: {
    primaryColor: '#722ed1',   // 紫色
    successColor: '#13c2c2',   // 青色
    warningColor: '#fa8c16',   // 橙色
    errorColor: '#eb2f96'      // 品红
  }
}
</script>
```

### 组件尺寸配置

```vue
<template>
  <view class="demo-block">
    <!-- 小尺寸 -->
    <wd-config-provider :config="{ size: 'small' }">
      <view class="size-section">
        <h4>小尺寸</h4>
        <wd-button type="primary">按钮</wd-button>
        <wd-input placeholder="输入框" />
        <wd-switch v-model="switchValue1" />
      </view>
    </wd-config-provider>
    
    <!-- 中等尺寸 -->
    <wd-config-provider :config="{ size: 'medium' }">
      <view class="size-section">
        <h4>中等尺寸</h4>
        <wd-button type="primary">按钮</wd-button>
        <wd-input placeholder="输入框" />
        <wd-switch v-model="switchValue2" />
      </view>
    </wd-config-provider>
    
    <!-- 大尺寸 -->
    <wd-config-provider :config="{ size: 'large' }">
      <view class="size-section">
        <h4>大尺寸</h4>
        <wd-button type="primary">按钮</wd-button>
        <wd-input placeholder="输入框" />
        <wd-switch v-model="switchValue3" />
      </view>
    </wd-config-provider>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const switchValue1 = ref(false)
const switchValue2 = ref(false)
const switchValue3 = ref(false)
</script>
```

### 国际化配置

```vue
<template>
  <view class="demo-block">
    <!-- 中文 -->
    <wd-config-provider :config="zhConfig">
      <view class="locale-section">
        <h4>中文环境</h4>
        <wd-calendar v-model="date1" />
        <wd-picker 
          v-model="pickerValue1" 
          :columns="pickerColumns"
          placeholder="请选择"
        />
      </view>
    </wd-config-provider>
    
    <!-- English -->
    <wd-config-provider :config="enConfig">
      <view class="locale-section">
        <h4>English Environment</h4>
        <wd-calendar v-model="date2" />
        <wd-picker 
          v-model="pickerValue2" 
          :columns="pickerColumns"
          placeholder="Please select"
        />
      </view>
    </wd-config-provider>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const date1 = ref(new Date())
const date2 = ref(new Date())
const pickerValue1 = ref('')
const pickerValue2 = ref('')
const pickerColumns = ref(['选项1', '选项2', '选项3'])

const zhConfig = {
  locale: {
    name: 'zh-CN',
    // 中文语言包
    calendar: {
      confirm: '确认',
      cancel: '取消',
      today: '今天'
    },
    picker: {
      confirm: '确认',
      cancel: '取消'
    }
  }
}

const enConfig = {
  locale: {
    name: 'en-US',
    // English locale
    calendar: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      today: 'Today'
    },
    picker: {
      confirm: 'Confirm',
      cancel: 'Cancel'
    }
  }
}
</script>
```

## 嵌套配置

```vue
<template>
  <wd-config-provider :config="parentConfig">
    <view class="parent-container">
      <h3>父级配置（蓝色主题）</h3>
      <wd-button type="primary">父级按钮</wd-button>
      
      <!-- 子级配置会覆盖父级配置 -->
      <wd-config-provider :config="childConfig">
        <view class="child-container">
          <h4>子级配置（红色主题）</h4>
          <wd-button type="primary">子级按钮</wd-button>
        </view>
      </wd-config-provider>
      
      <wd-button type="success">父级按钮2</wd-button>
    </view>
  </wd-config-provider>
</template>

<script setup>
const parentConfig = {
  theme: {
    primaryColor: '#1890ff'
  },
  size: 'medium'
}

const childConfig = {
  theme: {
    primaryColor: '#f5222d'
  },
  size: 'large'
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| config | 全局配置对象 | object | — | {} |

### Config 对象结构

```typescript
interface Config {
  // 主题配置
  theme?: {
    primaryColor?: string      // 主色
    successColor?: string      // 成功色
    warningColor?: string      // 警告色
    errorColor?: string        // 错误色
    infoColor?: string         // 信息色
    textColor?: string         // 文本色
    borderColor?: string       // 边框色
    backgroundColor?: string   // 背景色
    borderRadius?: string      // 圆角
    boxShadow?: string         // 阴影
  }
  
  // 组件尺寸
  size?: 'small' | 'medium' | 'large'
  
  // 国际化配置
  locale?: {
    name: string
    [componentName: string]: any
  }
  
  // 全局禁用
  disabled?: boolean
  
  // Z-Index 基准值
  zIndex?: number
  
  // 动画配置
  animation?: {
    duration?: number          // 动画持续时间
    timingFunction?: string    // 缓动函数
    disabled?: boolean         // 是否禁用动画
  }
}
```

### Slots

| 名称 | 说明 |
|------|------|
| default | 需要传递配置的内容 |

## 使用配置

### 在组件中获取配置

```vue
<template>
  <view class="custom-component">
    <text :style="{ color: themeColor }">自定义组件</text>
  </view>
</template>

<script setup>
import { inject, computed } from 'vue'

// 注入全局配置
const config = inject('wd-config', {})

// 使用主题色
const themeColor = computed(() => {
  return config.theme?.primaryColor || '#1890ff'
})
</script>
```

### 使用 Composable

```javascript
// composables/useConfig.js
import { inject } from 'vue'

export function useConfig() {
  const config = inject('wd-config', {})
  
  const getThemeColor = (type = 'primary') => {
    const colorMap = {
      primary: config.theme?.primaryColor || '#1890ff',
      success: config.theme?.successColor || '#52c41a',
      warning: config.theme?.warningColor || '#faad14',
      error: config.theme?.errorColor || '#f5222d'
    }
    return colorMap[type]
  }
  
  const getSize = () => {
    return config.size || 'medium'
  }
  
  const getLocale = (component, key) => {
    return config.locale?.[component]?.[key] || key
  }
  
  return {
    config,
    getThemeColor,
    getSize,
    getLocale
  }
}
```

## 默认配置

```javascript
const defaultConfig = {
  theme: {
    primaryColor: '#1890ff',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#f5222d',
    infoColor: '#909399',
    textColor: '#323233',
    borderColor: '#ebeef5',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  size: 'medium',
  locale: {
    name: 'zh-CN'
  },
  disabled: false,
  zIndex: 1000,
  animation: {
    duration: 300,
    timingFunction: 'ease',
    disabled: false
  }
}
```

## 注意事项

1. **传递机制**：使用 Vue 的 `provide/inject` 机制向下传递配置
2. **嵌套优先级**：子级 ConfigProvider 的配置会覆盖父级配置
3. **配置合并**：对象属性会进行深度合并，而不是完全替换
4. **性能考虑**：避免在配置中放置过多动态数据，以免影响性能
5. **类型安全**：建议使用 TypeScript 并定义配置接口以获得更好的类型检查
6. **兼容性**：在使用自定义配置时，请确保在不同平台上的兼容性