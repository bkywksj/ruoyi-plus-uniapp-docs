# 业务组件

业务组件是针对项目业务场景封装的专用组件，提供开箱即用的功能。

## 组件列表

| 组件 | 说明 | 位置 |
|------|------|------|
| AuthLogin | 登录认证组件 | `components/auth/` |
| IndexPage | 首页组件 | `components/index/` |
| TabbarNav | 底部导航 | `components/tabbar/` |

## AuthLogin 登录认证

### 账号密码登录

```vue
<template>
  <view class="login-form">
    <wd-form ref="formRef" :model="loginForm" :rules="rules">
      <wd-form-item prop="username">
        <wd-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
          prefix-icon="i-ep-user"
        />
      </wd-form-item>
      <wd-form-item prop="password">
        <wd-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="i-ep-lock"
          show-password
        />
      </wd-form-item>
    </wd-form>
    <wd-button type="primary" block @click="handleLogin">登录</wd-button>
  </view>
</template>
```

### 手机号登录

```vue
<template>
  <view class="phone-login">
    <wd-input v-model="phone" placeholder="请输入手机号" />
    <view class="code-row">
      <wd-input v-model="code" placeholder="请输入验证码" />
      <wd-button :disabled="countdown > 0" @click="sendCode">
        {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
      </wd-button>
    </view>
    <wd-button type="primary" block @click="handleLogin">登录</wd-button>
  </view>
</template>
```

## TabbarNav 底部导航

项目使用自定义 Tabbar 组件：

```vue
<template>
  <wd-tabbar v-model="current" fixed placeholder safe-area-inset-bottom>
    <wd-tabbar-item
      v-for="item in tabbarList"
      :key="item.path"
      :icon="item.icon"
      :text="item.text"
      @click="switchTab(item.path)"
    />
  </wd-tabbar>
</template>

<script setup>
const tabbarList = [
  { path: '/pages/index/index', icon: 'home', text: '首页' },
  { path: '/pages/category/index', icon: 'category', text: '分类' },
  { path: '/pages/cart/index', icon: 'cart', text: '购物车' },
  { path: '/pages/my/index', icon: 'user', text: '我的' }
]
</script>
```

## 封装业务组件

### 组件结构

```
src/components/
├── auth/              # 认证相关
│   ├── login.vue     # 登录表单
│   └── register.vue  # 注册表单
├── index/            # 首页相关
│   └── banner.vue    # 轮播图
└── tabbar/           # 标签栏
    └── index.vue     # 自定义tabbar
```

### 组件规范

1. **命名规范**: 使用 PascalCase 命名
2. **Props 定义**: 使用 TypeScript 类型
3. **事件命名**: 使用 kebab-case
4. **插槽设计**: 提供灵活的自定义能力

```vue
<script lang="ts" setup>
interface Props {
  title: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}>()
</script>
```
