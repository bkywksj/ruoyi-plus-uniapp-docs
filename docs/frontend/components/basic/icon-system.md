# 图标系统

图标系统是组件库的视觉基础，提供统一的图标管理和使用方案。基于现代化的图标库构建，支持多种使用方式和自定义配置。

## 🎯 设计理念

- **统一性** - 提供一致的图标风格和使用规范
- **灵活性** - 支持多种图标库和自定义图标
- **高效性** - 按需加载，优化性能
- **可扩展** - 易于添加新图标和图标集

## 📦 核心组件

### Icon 图标组件

通用的图标显示组件，支持两种使用方式：预设图标代码和自定义图标类。

```vue
<template>
  <!-- 使用预设图标代码 -->
  <Icon code="user" />
  <Icon code="home" size="lg" color="#409eff" />

  <!-- 使用自定义图标类 -->
  <Icon value="i-carbon-user" size="24px" />

  <!-- 不同尺寸 -->
  <Icon code="search" size="xs" />
  <Icon code="search" size="sm" />
  <Icon code="search" size="md" />
  <Icon code="search" size="lg" />
  <Icon code="search" size="20px" />
</template>
```

## 🔧 API 参考

### Icon Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `code` | `IconCode` | - | 图标代码，使用预定义的图标标识 |
| `value` | `string` | - | 自定义图标类名，以 `i-` 开头 |
| `size` | `SizePreset \| string \| number` | `'1.3em'` | 图标尺寸 |
| `color` | `string` | - | 图标颜色，支持任何 CSS 颜色值 |

### 尺寸预设

| 预设值 | 实际尺寸 | 使用场景 |
|--------|----------|----------|
| `xs` | `12px` | 小型按钮、标签 |
| `sm` | `16px` | 文本内图标 |
| `md` | `20px` | 默认图标 |
| `lg` | `24px` | 按钮图标 |
| `xl` | `32px` | 大图标 |
| `2xl` | `40px` | 特大图标 |

## 📚 图标分类

### 🧱 界面元素
用于构建用户界面的基础图标

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `button` | 按钮 | <Icon code="button" /> |
| `form` | 表单 | <Icon code="form" /> |
| `input` | 输入框 | <Icon code="input" /> |
| `select` | 选择器 | <Icon code="select" /> |
| `table` | 表格 | <Icon code="table" /> |
| `menu` | 菜单 | <Icon code="menu" /> |
| `tab` | 标签页 | <Icon code="tab" /> |
| `switch` | 开关 | <Icon code="switch" /> |
| `filter` | 筛选 | <Icon code="filter" /> |
| `sort` | 排序 | <Icon code="sort" /> |

### 🧭 导航类
用于页面导航和路由跳转

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `home` | 首页 | <Icon code="home" /> |
| `dashboard` | 仪表板 | <Icon code="dashboard" /> |
| `back` | 返回 | <Icon code="back" /> |
| `forward` | 前进 | <Icon code="forward" /> |
| `arrow-up` | 向上 | <Icon code="arrow-up" /> |
| `arrow-down` | 向下 | <Icon code="arrow-down" /> |
| `refresh` | 刷新 | <Icon code="refresh" /> |
| `breadcrumb` | 面包屑 | <Icon code="breadcrumb" /> |

### 📊 数据类
用于数据展示和统计图表

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `chart` | 图表 | <Icon code="chart" /> |
| `pie-chart` | 饼图 | <Icon code="pie-chart" /> |
| `bar-chart` | 柱状图 | <Icon code="bar-chart" /> |
| `line-chart` | 折线图 | <Icon code="line-chart" /> |
| `statistics` | 统计 | <Icon code="statistics" /> |
| `database` | 数据库 | <Icon code="database" /> |
| `monitor` | 监控 | <Icon code="monitor" /> |
| `data-analysis` | 数据分析 | <Icon code="data-analysis" /> |

### 📁 文件类
用于文件管理和文档操作

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `file` | 文件 | <Icon code="file" /> |
| `folder` | 文件夹 | <Icon code="folder" /> |
| `image` | 图片 | <Icon code="image" /> |
| `video` | 视频 | <Icon code="video" /> |
| `audio` | 音频 | <Icon code="audio" /> |
| `zip` | 压缩包 | <Icon code="zip" /> |
| `pdf` | PDF | <Icon code="pdf" /> |
| `excel` | Excel | <Icon code="excel" /> |
| `word` | Word | <Icon code="word" /> |
| `download` | 下载 | <Icon code="download" /> |
| `upload` | 上传 | <Icon code="upload" /> |

### 👤 用户类
用于用户管理和权限控制

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `user` | 用户 | <Icon code="user" /> |
| `user-group` | 用户组 | <Icon code="user-group" /> |
| `admin` | 管理员 | <Icon code="admin" /> |
| `permission` | 权限 | <Icon code="permission" /> |
| `role` | 角色 | <Icon code="role" /> |
| `profile` | 档案 | <Icon code="profile" /> |
| `avatar` | 头像 | <Icon code="avatar" /> |
| `online` | 在线 | <Icon code="online" /> |
| `offline` | 离线 | <Icon code="offline" /> |

### ⚡ 操作类
用于各种操作和动作

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `add` | 添加 | <Icon code="add" /> |
| `delete` | 删除 | <Icon code="delete" /> |
| `edit` | 编辑 | <Icon code="edit" /> |
| `save` | 保存 | <Icon code="save" /> |
| `cancel` | 取消 | <Icon code="cancel" /> |
| `copy` | 复制 | <Icon code="copy" /> |
| `search` | 搜索 | <Icon code="search" /> |
| `reset` | 重置 | <Icon code="reset" /> |
| `export` | 导出 | <Icon code="export" /> |
| `import` | 导入 | <Icon code="import" /> |

### 💰 业务类
用于特定业务场景

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `money` | 金钱 | <Icon code="money" /> |
| `shopping` | 购物 | <Icon code="shopping" /> |
| `order` | 订单 | <Icon code="order" /> |
| `payment` | 支付 | <Icon code="payment" /> |
| `wxpay` | 微信支付 | <Icon code="wxpay" /> |
| `alipay` | 支付宝 | <Icon code="alipay" /> |
| `product` | 商品 | <Icon code="product" /> |
| `store` | 商店 | <Icon code="store" /> |
| `coupon` | 优惠券 | <Icon code="coupon" /> |

### 🌐 社交类
用于社交媒体和通讯

| 图标代码 | 图标名称 | 示例 |
|----------|----------|------|
| `wechat` | 微信 | <Icon code="wechat" /> |
| `qq` | QQ | <Icon code="qq" /> |
| `weibo` | 微博 | <Icon code="weibo" /> |
| `twitter` | Twitter | <Icon code="twitter" /> |
| `facebook` | Facebook | <Icon code="facebook" /> |
| `message` | 消息 | <Icon code="message" /> |
| `comment` | 评论 | <Icon code="comment" /> |
| `like` | 点赞 | <Icon code="like" /> |
| `share` | 分享 | <Icon code="share" /> |

## 💡 使用指南

### 基础用法

```vue
<template>
  <!-- 使用预设图标代码 -->
  <Icon code="user" />
  <Icon code="home" size="lg" color="#409eff" />

  <!-- 使用 Icônes 图标库 -->
  <Icon value="i-material-symbols-10k" />
  <Icon value="i-heroicons-heart-20-solid" size="md" color="red" />
  <Icon value="i-lucide-settings" size="lg" />

  <!-- 在按钮中使用 -->
  <el-button>
    <Icon code="add" />
    新增用户
  </el-button>

  <el-button type="primary">
    <Icon value="i-heroicons-plus-20-solid" />
    添加项目
  </el-button>
</template>
```

### 在组件中集成

```vue
<template>
  <!-- 在数据卡片中使用预设图标 -->
  <ADataCard
    title="用户统计"
    icon-code="user"
    :data-list="userStats"
  />
  
  <!-- 在数据卡片中使用 Icônes 图标 -->
  <ADataCard
    title="销售数据" 
    icon-value="i-heroicons-chart-bar-20-solid"
    :data-list="salesStats"
  />
  
  <!-- 在表格操作列中使用 -->
  <el-table-column label="操作">
    <template #default>
      <!-- 预设图标 -->
      <el-button link>
        <Icon code="edit" />
      </el-button>
      <el-button link type="danger">
        <Icon code="delete" />
      </el-button>
      
      <!-- Icônes 图标 -->
      <el-button link type="primary">
        <Icon value="i-heroicons-eye-20-solid" />
      </el-button>
      <el-button link type="warning">
        <Icon value="i-lucide-settings" />
      </el-button>
    </template>
  </el-table-column>
  
  <!-- 在导航菜单中使用 -->
  <el-menu>
    <el-menu-item index="dashboard">
      <Icon value="i-material-symbols-dashboard-outline" />
      <span>仪表板</span>
    </el-menu-item>
    <el-menu-item index="users">
      <Icon value="i-heroicons-users-20-solid" />
      <span>用户管理</span>
    </el-menu-item>
  </el-menu>
</template>
```

### 自定义图标

如果预设图标无法满足需求，可以使用自定义图标类。系统支持从 [Icônes](https://icones.js.org/collection/all) 网站选择图标：

#### 使用 Icônes 图标库

1. **访问网站**：打开 [https://icones.js.org/collection/all](https://icones.js.org/collection/all)
2. **搜索图标**：在搜索框中输入关键词查找图标
3. **选择图标**：点击心仪的图标
4. **复制代码**：选择 "UnoCSS" 选项卡，复制图标类名（如：`i-material-symbols-10k`）

```vue
<template>
  <!-- 使用 Icônes 图标库中的图标 -->
  <Icon value="i-material-symbols-10k" />
  <Icon value="i-carbon-user-avatar" />
  <Icon value="i-mdi-account-circle" />
  <Icon value="i-heroicons-heart-20-solid" />
  <Icon value="i-lucide-settings" />
  
  <!-- 支持所有 Iconify 图标集合 -->
  <Icon value="i-ant-design-home-outlined" />
  <Icon value="i-ph-phone-bold" />
  <Icon value="i-tabler-brand-github" />
</template>
```

#### 常用图标库推荐

| 图标库 | 前缀 | 特点 | 示例 |
|--------|------|------|------|
| **Material Symbols** | `i-material-symbols-` | Google 设计，现代感强 | `i-material-symbols-home` |
| **Heroicons** | `i-heroicons-` | Tailwind CSS 官方图标 | `i-heroicons-heart-20-solid` |
| **Lucide** | `i-lucide-` | 简洁优雅，线条清晰 | `i-lucide-user` |
| **Carbon** | `i-carbon-` | IBM 设计系统 | `i-carbon-user-avatar` |
| **Ant Design** | `i-ant-design-` | 企业级设计语言 | `i-ant-design-home-outlined` |
| **Tabler** | `i-tabler-` | 免费开源，种类丰富 | `i-tabler-brand-github` |
| **Phosphor** | `i-ph-` | 灵活多样的设计风格 | `i-ph-phone-bold` |

#### 图标搜索技巧

```vue
<template>
  <!-- 按功能分类搜索 -->
  
  <!-- 用户相关 -->
  <Icon value="i-heroicons-user-20-solid" />
  <Icon value="i-lucide-user-circle" />
  <Icon value="i-material-symbols-person" />
  
  <!-- 操作相关 -->
  <Icon value="i-heroicons-plus-20-solid" />
  <Icon value="i-lucide-edit" />
  <Icon value="i-material-symbols-delete" />
  
  <!-- 导航相关 -->
  <Icon value="i-heroicons-home-20-solid" />
  <Icon value="i-lucide-arrow-left" />
  <Icon value="i-material-symbols-menu" />
  
  <!-- 状态相关 -->
  <Icon value="i-heroicons-check-circle-20-solid" />
  <Icon value="i-lucide-alert-triangle" />
  <Icon value="i-material-symbols-error" />
</template>
```

#### 自定义 CSS 图标

```vue
<template>
  <!-- 使用自定义 CSS 类 -->
  <Icon value="custom-icon-class" />
</template>

<style>
.custom-icon-class {
  background: url('/path/to/icon.svg') no-repeat center;
  background-size: contain;
}
</style>
```

### 响应式图标

```vue
<template>
  <!-- 在不同屏幕尺寸下使用不同大小 -->
  <Icon 
    code="menu" 
    :size="$route.meta.mobile ? 'sm' : 'md'"
  />
  
  <!-- 根据设备类型选择不同图标 -->
  <Icon 
    :value="isMobile ? 'i-heroicons-device-phone-mobile-20-solid' : 'i-heroicons-computer-desktop-20-solid'" 
  />
  
  <!-- 主题自适应图标 -->
  <Icon 
    :value="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" 
    @click="toggleTheme"
  />
</template>

<script setup>
const isMobile = ref(false)
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>
```

### 图标组合使用

```vue
<template>
  <!-- 图标 + 文字组合 -->
  <div class="icon-text-group">
    <Icon value="i-heroicons-exclamation-triangle-20-solid" color="#f56c6c" />
    <span>警告信息</span>
  </div>
  
  <!-- 多个图标组合 -->
  <div class="icon-group">
    <Icon value="i-heroicons-star-20-solid" color="#ffd700" />
    <Icon value="i-heroicons-star-20-solid" color="#ffd700" />
    <Icon value="i-heroicons-star-20-solid" color="#ffd700" />
    <Icon value="i-heroicons-star-20-outline" color="#ddd" />
    <Icon value="i-heroicons-star-20-outline" color="#ddd" />
  </div>
  
  <!-- 状态指示图标 -->
  <div class="status-icons">
    <Icon value="i-heroicons-check-circle-20-solid" color="#67c23a" />
    <span>已完成</span>
  </div>
</template>

<style scoped>
.icon-text-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-group {
  display: flex;
  gap: 2px;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
```

## 🎨 图标规范

### 设计原则

1. **风格统一** - 所有图标应保持一致的设计风格
2. **清晰可辨** - 在小尺寸下也要保持清晰度
3. **语义化** - 图标应直观表达其功能含义
4. **适配性** - 支持深色/浅色主题切换

### 使用建议

1. **合理选择** - 根据功能选择合适的图标
2. **保持一致** - 同一功能在不同页面使用相同图标
3. **适当尺寸** - 根据使用场景选择合适的图标尺寸
4. **颜色搭配** - 图标颜色应与整体设计保持协调

### 无障碍访问

```vue
<template>
  <!-- 为图标添加语义化描述 -->
  <Icon code="user" aria-label="用户信息" />
  
  <!-- 在交互元素中使用 -->
  <button aria-label="删除用户">
    <Icon code="delete" />
  </button>
</template>
```

## 🔧 扩展图标

### 添加新的预设图标

在 `icons.ts` 文件中添加新的图标定义：

```typescript
export const icons: Icon[] = [
  // 现有图标...
  
  // 添加新图标（推荐使用 Icônes 图标）
  { 
    code: 'notification', 
    name: '通知', 
    value: 'i-heroicons-bell-20-solid' 
  },
  { 
    code: 'analytics', 
    name: '分析', 
    value: 'i-material-symbols-analytics-outline' 
  },
  { 
    code: 'calendar', 
    name: '日历', 
    value: 'i-lucide-calendar' 
  },
]
```

### 更新类型定义

在 `Icon.vue` 中更新 `IconCode` 类型：

```typescript
export type IconCode = 
  | 'existing-icons'
  // ... 现有图标代码
  | 'notification'  // 添加新图标代码
  | 'analytics'
  | 'calendar'
```

### 批量导入图标

如果需要大量图标，可以按分类批量添加：

```typescript
// 新增业务图标分组
const businessIcons = [
  { code: 'inventory', name: '库存', value: 'i-material-symbols-inventory-2' },
  { code: 'shipping', name: '物流', value: 'i-heroicons-truck-20-solid' },
  { code: 'customer', name: '客户', value: 'i-lucide-user-check' },
  { code: 'supplier', name: '供应商', value: 'i-heroicons-building-office-2-20-solid' },
]

// 新增图标到主数组
export const icons: Icon[] = [
  ...existingIcons,
  ...businessIcons,
]
```

## 🌟 最佳实践

### 1. 图标选择指南

**预设图标 vs Icônes 图标**
- **预设图标**：项目常用图标，语义化命名，团队共识
- **Icônes 图标**：丰富的选择，适合特殊需求和个性化设计

```vue
<template>
  <!-- ✅ 推荐：常用功能使用预设图标 -->
  <Icon code="user" />
  <Icon code="add" />
  <Icon code="delete" />
  
  <!-- ✅ 推荐：特殊需求使用 Icônes 图标 -->
  <Icon value="i-heroicons-academic-cap-20-solid" />
  <Icon value="i-material-symbols-psychology" />
</template>
```

### 2. 图标一致性原则

```vue
<template>
  <!-- ✅ 推荐：同一功能使用相同图标库风格 -->
  <div class="toolbar">
    <Icon value="i-heroicons-plus-20-solid" />
    <Icon value="i-heroicons-pencil-20-solid" />
    <Icon value="i-heroicons-trash-20-solid" />
  </div>
  
  <!-- ❌ 不推荐：混用不同风格的图标库 -->
  <div class="toolbar">
    <Icon value="i-heroicons-plus-20-solid" />
    <Icon value="i-material-symbols-edit" />
    <Icon value="i-lucide-trash-2" />
  </div>
</template>
```

### 3. 尺寸适配建议

- **按需使用** - 只使用必要的图标，避免过度装饰
- **语义清晰** - 确保图标含义直观易懂
- **尺寸适中** - 根据内容层级选择合适尺寸
- **颜色协调** - 与整体设计保持色彩一致性
- **性能优化** - 优先使用 SVG 图标避免位图放大失真
- **统一风格** - 同一页面内保持图标库风格一致

### 4. 性能优化技巧

```vue
<template>
  <!-- ✅ 推荐：使用具体的图标名称 -->
  <Icon value="i-heroicons-home-20-solid" />
  
  <!-- ✅ 推荐：预设常用图标减少类名长度 -->
  <Icon code="home" />
  
  <!-- ⚠️  注意：大量使用时考虑图标库体积 -->
  <div v-for="item in items" :key="item.id">
    <Icon :value="item.iconClass" />
  </div>
</template>
```

### 5. 团队协作规范

```typescript
// ✅ 推荐：建立图标使用规范文档
const ICON_USAGE_GUIDE = {
  // 操作类图标统一使用 Heroicons
  actions: {
    add: 'i-heroicons-plus-20-solid',
    edit: 'i-heroicons-pencil-20-solid', 
    delete: 'i-heroicons-trash-20-solid',
    view: 'i-heroicons-eye-20-solid',
  },
  
  // 状态类图标统一使用 Material Symbols
  status: {
    success: 'i-material-symbols-check-circle',
    warning: 'i-material-symbols-warning',
    error: 'i-material-symbols-error',
    info: 'i-material-symbols-info',
  },
  
  // 导航类图标使用预设图标
  navigation: {
    home: 'home',      // 预设图标 
    back: 'back',      // 预设图标
    menu: 'menu',      // 预设图标
  }
}
```
