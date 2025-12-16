# WD UI 快速开始

本章节将帮助你快速上手 WD UI 组件库，从安装配置到创建第一个使用WD UI的页面。

## 📦 安装

### npm 安装

```bash
# 使用 npm
npm install wot-design-uni

# 使用 yarn
yarn add wot-design-uni

# 使用 pnpm
pnpm add wot-design-uni
```

### 版本要求

- **Vue**: 3.2+
- **uni-app**: 3.0+
- **Node.js**: 16+
- **TypeScript**: 4.0+ (可选)

## ⚙️ 配置

### 全局引入

在 `main.js` 中全局注册组件：

```javascript
// main.js
import { createSSRApp } from 'vue'
import App from './App.vue'
import WotDesign from 'wot-design-uni'
import 'wot-design-uni/index.scss'

export function createApp() {
  const app = createSSRApp(App)

  // 全局注册 WD UI 组件
  app.use(WotDesign)

  return {
    app
  }
}
```

### 按需引入（推荐）

为了减小包体积，推荐使用按需引入的方式：

```vue
<template>
  <view class="container">
    <wd-button type="primary" @click="handleClick">
      主要按钮
    </wd-button>

    <wd-cell title="单元格" value="内容" />

    <wd-input v-model="value" placeholder="请输入内容" />
  </view>
</template>

<script setup>
// 按需引入组件
import { WdButton, WdCell, WdInput } from 'wot-design-uni'

const value = ref('')

const handleClick = () => {
  uni.showToast({
    title: '按钮被点击',
    icon: 'success'
  })
}
</script>
```

### 自动导入（HBuilderX）

如果使用 HBuilderX，可以配置自动导入：

```javascript
// pages.json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "wot-design-uni/components/wd-$1/wd-$1.vue"
    }
  }
}
```

配置后可以直接在模板中使用组件，无需import：

```vue
<template>
  <view>
    <!-- 无需手动导入，直接使用 -->
    <wd-button type="primary">按钮</wd-button>
    <wd-cell title="标题" value="值" />
  </view>
</template>

<script setup>
// 无需手动导入组件
</script>
```

## 🎨 主题配置

### 基础主题定制

```scss
// theme.scss
:root {
  // 主色调
  --wd-color-primary: #4D7FFF;
  --wd-color-success: #00C853;
  --wd-color-warning: #FFB300;
  --wd-color-danger: #FA2C19;

  // 文本颜色
  --wd-color-text: #262626;
  --wd-color-text-secondary: #8C8C8C;

  // 背景色
  --wd-color-bg: #FFFFFF;
  --wd-color-bg-secondary: #F8F8F8;

  // 圆角
  --wd-radius-md: 12rpx;

  // 间距
  --wd-spacing-md: 24rpx;
}
```

在 `App.vue` 中引入主题文件：

```vue
<style lang="scss">
@import './theme.scss';
@import 'wot-design-uni/index.scss';
</style>
```

### 深色主题支持

```scss
// 深色主题
@media (prefers-color-scheme: dark) {
  :root {
    --wd-color-bg: #1a1a1a;
    --wd-color-text: #ffffff;
    --wd-color-text-secondary: #b3b3b3;
    --wd-color-border: #333333;
  }
}

// 或者通过类名控制
.dark-theme {
  --wd-color-bg: #1a1a1a;
  --wd-color-text: #ffffff;
  --wd-color-text-secondary: #b3b3b3;
  --wd-color-border: #333333;
}
```

## 📱 基础使用示例

### 创建第一个页面

```vue
<!-- pages/demo/index.vue -->
<template>
  <view class="demo-page">
    <!-- 导航栏 -->
    <wd-navbar title="WD UI 示例" />

    <!-- 表单区域 -->
    <view class="form-section">
      <wd-cell-group title="基础信息">
        <wd-input
          v-model="formData.name"
          label="姓名"
          placeholder="请输入姓名"
          required
        />

        <wd-input
          v-model="formData.phone"
          label="手机号"
          placeholder="请输入手机号"
          type="number"
        />

        <wd-picker
          v-model="formData.city"
          label="城市"
          :columns="cityOptions"
          placeholder="请选择城市"
        />

        <wd-switch
          v-model="formData.notification"
          label="接收通知"
        />
      </wd-cell-group>
    </view>

    <!-- 按钮区域 -->
    <view class="button-section">
      <wd-button
        type="primary"
        block
        @click="handleSubmit"
        :loading="loading"
      >
        提交
      </wd-button>

      <wd-button
        block
        custom-style="margin-top: 16rpx"
        @click="handleReset"
      >
        重置
      </wd-button>
    </view>

    <!-- 展示区域 -->
    <view class="display-section">
      <wd-card title="信息展示">
        <wd-tag v-if="formData.name" type="primary">
          {{ formData.name }}
        </wd-tag>

        <wd-badge :value="formData.phone ? 1 : 0" type="success">
          手机号状态
        </wd-badge>
      </wd-card>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 表单数据
const formData = reactive({
  name: '',
  phone: '',
  city: '',
  notification: false
})

// 城市选项
const cityOptions = ref([
  '北京', '上海', '广州', '深圳', '杭州', '南京'
])

// 加载状态
const loading = ref(false)

// 提交处理
const handleSubmit = async () => {
  if (!formData.name) {
    uni.showToast({
      title: '请输入姓名',
      icon: 'none'
    })
    return
  }

  loading.value = true

  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 2000))

    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 重置处理
const handleReset = () => {
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'boolean') {
      formData[key] = false
    } else {
      formData[key] = ''
    }
  })

  uni.showToast({
    title: '已重置',
    icon: 'success'
  })
}
</script>

```

### 列表页面示例

```vue
<!-- pages/list/index.vue -->
<template>
  <view class="list-page">
    <wd-navbar title="列表示例" />

    <!-- 搜索栏 -->
    <wd-search
      v-model="searchValue"
      placeholder="搜索用户"
      @search="handleSearch"
      @clear="handleClear"
    />

    <!-- 筛选标签 -->
    <view class="filter-tags">
      <wd-tag
        v-for="tag in filterTags"
        :key="tag.value"
        :type="tag.active ? 'primary' : 'default'"
        @click="handleFilterChange(tag)"
        custom-style="margin-right: 16rpx; margin-bottom: 16rpx"
      >
        {{ tag.label }}
      </wd-tag>
    </view>

    <!-- 用户列表 -->
    <view class="user-list">
      <wd-cell-group>
        <wd-cell
          v-for="user in filteredUsers"
          :key="user.id"
          :title="user.name"
          :value="user.department"
          :label="user.email"
          is-link
          @click="handleUserClick(user)"
        >
          <template #icon>
            <wd-img
              :src="user.avatar"
              width="80rpx"
              height="80rpx"
              round
            />
          </template>

          <template #right-icon>
            <wd-badge
              v-if="user.unread > 0"
              :value="user.unread"
              type="danger"
            />
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- 加载更多 -->
    <wd-loadmore
      :state="loadState"
      @reload="handleReload"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 搜索值
const searchValue = ref('')

// 加载状态
const loadState = ref('loading')

// 筛选标签
const filterTags = ref([
  { label: '全部', value: 'all', active: true },
  { label: '技术部', value: 'tech', active: false },
  { label: '市场部', value: 'marketing', active: false },
  { label: '设计部', value: 'design', active: false }
])

// 用户列表
const users = ref([])

// 过滤后的用户列表
const filteredUsers = computed(() => {
  let result = users.value

  // 按搜索条件过滤
  if (searchValue.value) {
    result = result.filter(user =>
      user.name.includes(searchValue.value) ||
      user.email.includes(searchValue.value)
    )
  }

  // 按标签过滤
  const activeTag = filterTags.value.find(tag => tag.active)
  if (activeTag && activeTag.value !== 'all') {
    result = result.filter(user => user.department === activeTag.label)
  }

  return result
})

// 搜索处理
const handleSearch = () => {
  console.log('搜索:', searchValue.value)
}

// 清空搜索
const handleClear = () => {
  searchValue.value = ''
}

// 筛选标签变化
const handleFilterChange = (tag) => {
  filterTags.value.forEach(item => {
    item.active = item.value === tag.value
  })
}

// 用户点击
const handleUserClick = (user) => {
  uni.navigateTo({
    url: `/pages/user/detail?id=${user.id}`
  })
}

// 重新加载
const handleReload = () => {
  loadUsers()
}

// 加载用户数据
const loadUsers = async () => {
  try {
    loadState.value = 'loading'

    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    users.value = [
      {
        id: 1,
        name: '张三',
        department: '技术部',
        email: 'zhangsan@example.com',
        avatar: 'https://via.placeholder.com/80',
        unread: 3
      },
      {
        id: 2,
        name: '李四',
        department: '市场部',
        email: 'lisi@example.com',
        avatar: 'https://via.placeholder.com/80',
        unread: 0
      },
      // ... 更多用户数据
    ]

    loadState.value = 'finished'
  } catch (error) {
    loadState.value = 'error'
  }
}

onMounted(() => {
  loadUsers()
})
</script>

```

## 🔧 常用配置

### TypeScript 支持

如果使用 TypeScript，需要在 `tsconfig.json` 中添加类型声明：

```json
{
  "compilerOptions": {
    "types": ["wot-design-uni/global"]
  }
}
```

### 小程序配置

在 `manifest.json` 中添加必要的权限：

```json
{
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      }
    }
  }
}
```

### H5 配置

如果需要在H5端使用，确保正确配置路由模式：

```javascript
// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  // 其他配置...
}
```

## 🎯 下一步

现在你已经成功配置了 WD UI，可以：

1. **探索组件**: 查看[组件文档](/mobile/wd/basic/button)了解更多组件用法
2. **主题定制**: 学习[主题定制](/mobile/styles/theme)来定制你的设计风格
3. **最佳实践**: 参考[开发规范](/mobile/dev-standards)来规范开发流程
4. **示例项目**: 查看更多[示例代码](https://github.com/Moonofweisheng/wot-design-uni/tree/master/example)

## ❓ 常见问题

### 组件无法正常显示？

1. 检查是否正确引入了样式文件
2. 确认组件是否正确注册
3. 查看控制台是否有错误信息

### 样式不生效？

1. 确认CSS变量是否正确设置
2. 检查样式优先级问题
3. 确认平台兼容性

### 性能问题？

1. 使用按需引入减少包体积
2. 合理使用图片懒加载
3. 避免在循环中使用复杂组件

如果遇到其他问题，可以查看[官方文档](https://wot-design-uni.cn/)或提交[Issue](https://github.com/Moonofweisheng/wot-design-uni/issues)。