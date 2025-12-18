# AGeometricBackground 几何装饰背景组件

用于提供页面几何装饰背景的根级组件，包含多种几何图形元素和动画效果，常用于登录页、落地页等场景。

## 介绍

AGeometricBackground 是一个纯装饰性背景组件，提供以下视觉元素：

- **几何形状**：圆形轮廓、旋转方块、小圆点等
- **背景气泡**：右上角大型圆形装饰
- **装饰点**：分布在页面不同位置的小圆点
- **叠加方块组**：左下角的三色方块组合
- **入场动画**：所有元素都有平滑的入场动画效果

组件自动适配亮色/暗色主题，在暗色模式下会调整元素透明度和隐藏部分装饰。

## 基础用法

作为页面根标签使用，包装页面内容：

```vue
<template>
  <AGeometricBackground>
    <div class="page-content">
      <!-- 页面内容 -->
    </div>
  </AGeometricBackground>
</template>
```

## 登录页示例

典型的登录页面使用场景：

```vue
<template>
  <AGeometricBackground>
    <div class="login-container">
      <div class="login-card">
        <h1 class="title">系统登录</h1>
        <el-form :model="form" class="login-form">
          <el-form-item>
            <el-input v-model="form.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码" />
          </el-form-item>
          <el-button type="primary" class="login-btn">登录</el-button>
        </el-form>
      </div>
    </div>
  </AGeometricBackground>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: ''
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.title {
  margin-bottom: 32px;
  font-size: 24px;
  text-align: center;
  color: var(--el-text-color-primary);
}

.login-btn {
  width: 100%;
  margin-top: 16px;
}
</style>
```

## API

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 页面内容区域，内容会显示在几何装饰之上 |

## 几何元素说明

组件包含以下装饰元素：

| 元素名称 | 位置 | 说明 |
|---------|------|------|
| circle-outline | 左上区域 (10%, 25%) | 42px 圆形轮廓，2px 边框 |
| square-rotated | 左中区域 (50%, 16%) | 60px 旋转方块，-25度旋转 |
| circle-small | 左下区域 (26%, 30%) | 18px 实心小圆 |
| square-bottom-right | 右下区域 (10%, 10%) | 50px 方块，45度旋转 |
| bg-bubble | 右上角 | 360px 大型圆形背景气泡 |
| dot-top-left | 左上 (140px, 100px) | 14px 装饰点 |
| dot-top-right | 右上 (140px, 120px) | 14px 装饰点 |
| dot-center-right | 右中 (46%, 22%) | 14px 装饰点 |
| squares-group | 左下角 | 三色叠加方块组 |

## 动画效果

所有几何元素都有入场动画：

| 动画类型 | 应用元素 | 效果 |
|---------|---------|------|
| fadeInUp | circle-outline, circle-small | 从下向上淡入 |
| fadeInLeft | square-rotated, squares-group | 从左向右淡入 |
| fadeInRight | square-bottom-right | 从右向左淡入 |
| scaleIn | bg-bubble | 缩放淡入 (1.2s) |
| bounceIn | dot 系列 | 弹跳淡入 (0.6s) |

动画参数：
- 默认时长: 0.8s
- 缓动函数: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- 填充模式: forwards

## 主题适配

### 亮色模式

- 背景: 主题色浅色渐变 (`primary-light-9` → `primary-light-8`)
- 几何元素: 使用 `primary-light-7` 到 `primary-light-8` 色调
- 方块组阴影: `rgba(64, 87, 167, 0.12)`

### 暗色模式

组件自动适配暗色主题：

- 背景: 深色渐变 (`#0a0a0a` → `#141414`)
- 几何元素: 使用主题色的半透明版本 (10%-30%)
- bg-bubble: 隐藏
- dot-top-right: 隐藏
- 方块组阴影: `rgba(0, 0, 0, 0.3)`

```scss
// 暗色模式下的几何元素示例
.dark .geometric-background {
  .circle-outline {
    border-color: color-mix(in srgb, $primary-base 30%, transparent);
  }
  .square-rotated {
    background-color: color-mix(in srgb, $primary-base 8%, transparent);
  }
}
```

## 样式变量

组件使用以下 CSS 变量：

| 变量 | 说明 |
|------|------|
| `--el-color-primary` | 主题主色 |
| `--el-color-primary-light-7` | 主题色浅色7级 |
| `--el-color-primary-light-8` | 主题色浅色8级 |
| `--el-color-primary-light-9` | 主题色浅色9级 |
| `--bg-base` | 基础背景色 |
| `--radius-md` | 中等圆角 |

## 使用场景

- **登录页面**：提供美观的几何装饰背景
- **注册页面**：增强视觉吸引力
- **落地页**：营造专业的界面氛围
- **欢迎页**：突出内容的重要性
- **错误页面**：减少页面的空白感

## 注意事项

1. 组件设计为页面根级使用，占据容器的 100% 宽高
2. 内容区域通过插槽传入，会自动层级置于装饰元素之上
3. 几何装饰元素使用 `pointer-events: none`，不会干扰页面交互
4. 组件内部使用 `overflow: hidden` 防止装饰元素溢出
5. 建议在内容区域使用半透明背景配合 `backdrop-filter` 以确保文字清晰度
6. 暗色模式下部分装饰元素会自动隐藏以保持视觉平衡
