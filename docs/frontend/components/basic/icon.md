# Icon 图标组件

Icon 组件是一个功能丰富的图标组件，支持通过预定义的图标代码或自定义图标类名来显示图标。组件基于 Iconify 图标库构建，提供了大量预设图标和灵活的配置选项。

## 基础用法

### 使用预定义图标代码

```vue
<template>
  <Icon code="user" />
  <Icon code="home" />
  <Icon code="search" />
</template>
```

### 使用自定义图标类名

```vue
<template>
  <Icon value="i-carbon-user" />
  <Icon value="i-ph:magnifying-glass" />
</template>
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `code` | `IconCode` | - | 图标代码，使用预定义的图标标识符 |
| `value` | `string` | - | 图标值，完整的图标类名 |
| `size` | `SizePreset \| string \| number` | `'md'` | 图标大小 |
| `color` | `string` | - | 图标颜色，支持任何 CSS 颜色值 |

## 尺寸设置

### 预设尺寸

组件支持以下预设尺寸：

| 尺寸 | 大小 |
|------|------|
| `xs` | 12px |
| `sm` | 14px |
| `md` | 16px |
| `lg` | 18px |
| `xl` | 20px |
| `2xl` | 24px |

```vue
<template>
  <Icon code="user" size="xs" />
  <Icon code="user" size="sm" />
  <Icon code="user" size="md" />
  <Icon code="user" size="lg" />
  <Icon code="user" size="xl" />
  <Icon code="user" size="2xl" />
</template>
```

### 自定义尺寸

```vue
<template>
  <!-- 数字形式（像素） -->
  <Icon code="user" :size="24" />
  <Icon code="user" :size="32" />
  
  <!-- 字符串形式 -->
  <Icon code="user" size="2rem" />
  <Icon code="user" size="24px" />
</template>
```

## 颜色设置

```vue
<template>
  <!-- 使用颜色名称 -->
  <Icon code="heart" color="red" />
  
  <!-- 使用十六进制颜色 -->
  <Icon code="star" color="#409eff" />
  
  <!-- 使用 RGB 颜色 -->
  <Icon code="home" color="rgb(64, 158, 255)" />
  
  <!-- 使用 CSS 变量 -->
  <Icon code="setting" color="var(--el-color-primary)" />
</template>
```

## 预设图标分类

### 界面元素

用于表示各种 UI 组件和界面元素的图标。

```vue
<template>
  <Icon code="button" />      <!-- 按钮 -->
  <Icon code="form" />        <!-- 表单 -->
  <Icon code="input" />       <!-- 输入框 -->
  <Icon code="table" />       <!-- 表格 -->
  <Icon code="menu" />        <!-- 菜单 -->
  <Icon code="tab" />         <!-- 标签页 -->
  <Icon code="switch" />      <!-- 开关 -->
  <Icon code="slider" />      <!-- 滑块 -->
</template>
```

### 导航

用于导航和方向指示的图标。

```vue
<template>
  <Icon code="home" />         <!-- 首页 -->
  <Icon code="back" />         <!-- 返回 -->
  <Icon code="forward" />      <!-- 前进 -->
  <Icon code="caret-up" />     <!-- 向上箭头 -->
  <Icon code="caret-down" />   <!-- 向下箭头 -->
  <Icon code="refresh" />      <!-- 刷新 -->
  <Icon code="dashboard" />    <!-- 仪表盘 -->
</template>
```

### 操作

表示各种操作动作的图标。

```vue
<template>
  <Icon code="add" />          <!-- 添加 -->
  <Icon code="edit" />         <!-- 编辑 -->
  <Icon code="delete" />       <!-- 删除 -->
  <Icon code="search" />       <!-- 搜索 -->
  <Icon code="save" />         <!-- 保存 -->
  <Icon code="upload" />       <!-- 上传 -->
  <Icon code="download" />     <!-- 下载 -->
  <Icon code="copy" />         <!-- 复制 -->
</template>
```

### 文件类型

用于表示不同文件类型的图标。

```vue
<template>
  <Icon code="file" />         <!-- 通用文件 -->
  <Icon code="image" />        <!-- 图片 -->
  <Icon code="video" />        <!-- 视频 -->
  <Icon code="word" />         <!-- Word 文档 -->
  <Icon code="excel" />        <!-- Excel 表格 -->
  <Icon code="pdf" />          <!-- PDF 文件 -->
  <Icon code="folder" />       <!-- 文件夹 -->
</template>
```

### 用户与权限

用于表示用户、角色和权限的图标。

```vue
<template>
  <Icon code="user" />         <!-- 用户 -->
  <Icon code="group" />        <!-- 用户组 -->
  <Icon code="role" />         <!-- 角色 -->
  <Icon code="lock" />         <!-- 锁定 -->
  <Icon code="unlock" />       <!-- 解锁 -->
  <Icon code="shield" />       <!-- 权限 -->
</template>
```

### 状态

用于表示不同状态的图标。

```vue
<template>
  <Icon code="success" />      <!-- 成功 -->
  <Icon code="error" />        <!-- 错误 -->
  <Icon code="warning" />      <!-- 警告 -->
  <Icon code="info" />         <!-- 信息 -->
  <Icon code="loading" />      <!-- 加载中 -->
  <Icon code="online" />       <!-- 在线 -->
</template>
```

### 业务场景

适用于各种业务场景的图标。

```vue
<template>
  <Icon code="money" />        <!-- 金钱 -->
  <Icon code="order" />        <!-- 订单 -->
  <Icon code="payment" />      <!-- 支付 -->
  <Icon code="shopping" />     <!-- 购物 -->
  <Icon code="company" />      <!-- 公司 -->
  <Icon code="location" />     <!-- 位置 -->
</template>
```

### 社交媒体

用于社交媒体平台的图标。

```vue
<template>
  <Icon code="wechat" />       <!-- 微信 -->
  <Icon code="qq" />           <!-- QQ -->
  <Icon code="weibo" />        <!-- 微博 -->
  <Icon code="twitter" />      <!-- Twitter -->
  <Icon code="facebook" />     <!-- Facebook -->
</template>
```

## 实用示例

### 按钮中使用图标

```vue
<template>
  <el-button>
    <Icon code="add" />
    新增
  </el-button>
  
  <el-button type="primary">
    <Icon code="search" color="white" />
    搜索
  </el-button>
</template>
```

### 表单标签

```vue
<template>
  <el-form-item>
    <template #label>
      <Icon code="user" />
      用户名
    </template>
    <el-input />
  </el-form-item>
</template>
```

### 菜单项

```vue
<template>
  <el-menu>
    <el-menu-item index="1">
      <Icon code="dashboard" />
      <span>仪表盘</span>
    </el-menu-item>
    
    <el-menu-item index="2">
      <Icon code="user" />
      <span>用户管理</span>
    </el-menu-item>
  </el-menu>
</template>
```

### 状态指示

```vue
<template>
  <div class="status-list">
    <div class="status-item">
      <Icon code="success" color="green" />
      <span>运行正常</span>
    </div>
    
    <div class="status-item">
      <Icon code="error" color="red" />
      <span>系统异常</span>
    </div>
    
    <div class="status-item">
      <Icon code="warning" color="orange" />
      <span>需要注意</span>
    </div>
  </div>
</template>
```

## 高级用法

### 动态图标

```vue
<template>
  <Icon :code="currentIcon" />
</template>

<script setup>
import { ref } from 'vue'

const currentIcon = ref('home')

// 根据路由或状态动态切换图标
const changeIcon = () => {
  currentIcon.value = currentIcon.value === 'home' ? 'user' : 'home'
}
</script>
```

### 响应式尺寸

```vue
<template>
  <Icon code="search" :size="iconSize" />
</template>

<script setup>
import { computed } from 'vue'

const iconSize = computed(() => {
  // 根据屏幕尺寸调整图标大小
  return window.innerWidth > 768 ? 'lg' : 'sm'
})
</script>
```

## 注意事项

1. **图标优先级**：如果同时提供了 `code` 和 `value` 属性，`value` 将优先生效
2. **颜色继承**：如果不指定 `color` 属性，图标将继承父元素的文字颜色
3. **无障碍访问**：对于重要的功能图标，建议添加适当的 `title` 或 `aria-label` 属性
4. **图标库依赖**：组件基于 Iconify 图标库，确保项目中已正确配置相关依赖

## 扩展图标

如需添加新的预设图标，可以在 `icons.ts` 文件中添加：

```typescript
export const icons: Icon[] = [
  // 现有图标...
  
  // 添加新图标
  { code: 'my-icon', name: '我的图标', value: 'i-custom:my-icon' },
]
```

同时更新 `IconCode` 类型定义，将新的图标代码添加到类型联合中。
