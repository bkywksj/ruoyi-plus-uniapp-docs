# WD UI 组件库概览

WD UI（Wot Design Uni）是基于 uni-app 开发的移动端组件库，提供了98个高质量的组件，支持多端运行，包括H5、微信小程序、支付宝小程序、抖音小程序等各种平台。

## 📋 组件库特性

- **多端兼容**: 支持H5、微信小程序、支付宝小程序、抖音小程序、百度小程序、QQ小程序等
- **组件丰富**: 提供98个组件，覆盖移动端开发的各种场景
- **TypeScript**: 完整的TypeScript类型定义
- **主题定制**: 支持CSS变量和SCSS变量自定义主题
- **按需引入**: 支持组件按需引入，减小包体积
- **无障碍**: 遵循无障碍设计规范

## 🎯 快速开始

### 安装

```bash
npm install wot-design-uni
```

### 全局注册

```javascript
// main.js
import { createSSRApp } from 'vue'
import WotDesign from 'wot-design-uni'
import 'wot-design-uni/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.use(WotDesign)
  return {
    app
  }
}
```

### 按需引入

```vue
<template>
  <wd-button type="primary" @click="handleClick">
    按钮
  </wd-button>
</template>

<script setup>
import { WdButton } from 'wot-design-uni'

const handleClick = () => {
  console.log('button clicked')
}
</script>
```

## 📊 组件分类统计

根据功能特性，WD UI的98个组件分为以下6大类：

| 分类 | 数量 | 主要组件 |
|------|------|----------|
| **基础组件** | 6个 | Button、Icon、Text、Transition、Resize、ConfigProvider |
| **布局组件** | 5个 | Row-Col、Grid、Gap、Divider、Sticky |
| **导航组件** | 9个 | Navbar、Tabbar、Tabs、Segmented、Sidebar、IndexBar 等 |
| **表单组件** | 22个 | Input、Textarea、Picker、Calendar、Upload、Form 等 |
| **展示组件** | 11个 | Cell、Badge、Tag、Card、Collapse、Steps、Table 等 |
| **反馈组件** | 23个 | ActionSheet、Popup、Toast、Loading、Progress 等 |

## 🎨 设计原则

### 一致性
- **视觉一致性**: 统一的设计语言和视觉风格
- **交互一致性**: 相同功能在不同组件中的交互行为保持一致
- **代码一致性**: 统一的API设计和命名规范

### 易用性
- **简单易懂**: API设计简洁明了，降低学习成本
- **开箱即用**: 提供合理的默认配置，满足大部分使用场景
- **灵活扩展**: 支持自定义样式和功能扩展

### 性能
- **按需加载**: 支持组件按需引入，减小包体积
- **优化渲染**: 避免不必要的重渲染，提升性能
- **兼容性**: 保证在各个平台上的性能表现

## 🔧 主题定制

### CSS变量定制

```scss
// 主题变量
:root {
  --wd-color-primary: #4D7FFF;
  --wd-color-success: #00C853;
  --wd-color-warning: #FFB300;
  --wd-color-danger: #FA2C19;
  --wd-color-info: #409EFF;

  // 文本颜色
  --wd-color-text: #262626;
  --wd-color-text-secondary: #8C8C8C;
  --wd-color-text-disabled: #BFBFBF;

  // 背景颜色
  --wd-color-bg: #FFFFFF;
  --wd-color-bg-secondary: #F8F8F8;
  --wd-color-bg-disabled: #F5F5F5;

  // 边框颜色
  --wd-color-border: #E8E8E8;
  --wd-color-border-light: #F0F0F0;

  // 圆角
  --wd-radius-xs: 4px;
  --wd-radius-sm: 8px;
  --wd-radius-md: 12px;
  --wd-radius-lg: 16px;

  // 间距
  --wd-spacing-xs: 4px;
  --wd-spacing-sm: 8px;
  --wd-spacing-md: 12px;
  --wd-spacing-lg: 16px;
  --wd-spacing-xl: 20px;
}
```

### SCSS变量定制

```scss
// theme.scss
$-color-primary: #4D7FFF;
$-color-success: #00C853;
$-color-warning: #FFB300;
$-color-danger: #FA2C19;

// 导入主题
@import 'wot-design-uni/index.scss';
```

## 📱 平台差异处理

### 条件编译

```vue
<template>
  <view>
    <!-- 微信小程序特有功能 -->
    <!-- #ifdef MP-WEIXIN -->
    <wd-button open-type="getUserInfo" @getuserinfo="getUserInfo">
      获取用户信息
    </wd-button>
    <!-- #endif -->

    <!-- H5特有功能 -->
    <!-- #ifdef H5 -->
    <wd-button @click="showToast">
      H5 Toast
    </wd-button>
    <!-- #endif -->

    <!-- 通用功能 -->
    <wd-button type="primary">
      通用按钮
    </wd-button>
  </view>
</template>
```

### 平台适配

```javascript
// 平台检测
const isH5 = uni.getSystemInfoSync().platform === 'web'
const isMp = uni.getSystemInfoSync().platform === 'mp'

// 根据平台调整组件行为
const buttonSize = isH5 ? 'large' : 'medium'
```

## 🎯 最佳实践

### 组件使用建议

1. **合理选择组件**: 根据业务场景选择合适的组件
2. **统一设计规范**: 在项目中保持设计规范的一致性
3. **性能优化**: 合理使用组件，避免过度渲染
4. **主题定制**: 根据品牌要求定制主题色彩

### 开发规范

1. **命名规范**: 使用语义化的组件名称和属性名称
2. **事件处理**: 统一的事件处理方式
3. **数据流**: 清晰的数据流向和状态管理
4. **错误处理**: 完善的错误边界和异常处理

### 性能优化

1. **按需引入**: 只引入使用到的组件
2. **图片优化**: 使用适当尺寸和格式的图片
3. **列表优化**: 长列表使用虚拟滚动
4. **缓存策略**: 合理使用缓存减少网络请求

## 📚 相关资源

- [WD UI 官方文档](https://wot-design-uni.cn/)
- [GitHub仓库](https://github.com/Moonofweisheng/wot-design-uni)
- [示例项目](https://github.com/Moonofweisheng/wot-design-uni/tree/master/example)
- [问题反馈](https://github.com/Moonofweisheng/wot-design-uni/issues)

## 🔄 版本更新

### 最新版本特性

- **Vue 3支持**: 完全基于Vue 3 Composition API
- **TypeScript**: 完整的类型定义
- **Tree Shaking**: 更好的tree shaking支持
- **新增组件**: 持续新增实用组件

### 升级指南

```bash
# 升级到最新版本
npm update wot-design-uni

# 检查版本
npm list wot-design-uni
```

### 兼容性说明

- **Vue版本**: 支持Vue 3.2+
- **uni-app版本**: 支持uni-app 3.0+
- **Node版本**: 建议Node 16+
- **TypeScript版本**: 支持TypeScript 4.0+

## 🤝 贡献指南

欢迎参与WD UI的开发和维护：

1. **Bug报告**: 发现问题请提交Issue
2. **功能建议**: 提出新功能需求和改进建议
3. **代码贡献**: 提交PR参与开发
4. **文档完善**: 帮助完善和翻译文档

### 本地开发

```bash
# 克隆项目
git clone https://github.com/Moonofweisheng/wot-design-uni.git

# 安装依赖
npm install

# 运行示例
npm run dev:mp-weixin
```

## 📞 技术支持

- **官方文档**: 详细的组件使用文档和API说明
- **示例代码**: 丰富的示例代码和最佳实践
- **社区讨论**: GitHub Discussions和QQ群交流
- **版本发布**: 及时的版本更新和功能迭代