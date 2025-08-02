# 前端项目简介

Ruoyi-Plus-Uniapp 前端是一个基于 Vue 3 + TypeScript 的现代化企业级 Web 管理系统，遵循"代码即文档"、"全栈统一"、"开发友好"
的核心理念。项目采用组合式 API 架构，注重开发体验和可维护性。

## 技术栈

- **核心框架**: Vue 3 + TypeScript + Vite
- **UI组件库**: Element Plus
- **CSS框架**: UnoCSS
- **状态管理**: Pinia
- **图标系统**: Iconify
- **富文本编辑器**: UMO Editor (基于 Tiptap)

## 架构特色

### 1. 组合式架构设计

- 全面采用 Vue 3 组合式 API，摒弃传统 utils 工具类
- 将工具函数重构为 **Composables 组合函数函数**，发挥 Vue 3 优势
- 提供丰富的内置组合函数：`useAuth`、`useToken`、`useDict`、`useTheme`、`useI18n` 等

### 2. 标准化目录结构

```text
src/
├── api/             # 接口集中管理
├── assets/          # 静态资源
├── components/      # 自定义组件
├── composables/     # 组合式函数（替代传统 utils）
├── directives/      # 自定义指令
├── layouts/         # 布局组件
├── locales/         # 国际化配置
├── plugins/         # 插件配置
├── router/          # 路由配置
├── stores/          # Pinia 状态管理
├── types/           # 类型定义
└── utils/           # 工具类
└── views/           # 页面文件
```

### 3. 组件系统重构

- **命名规范化**: 自定义组件使用大驼峰，页面组件使用小驼峰
- **表单组件库**: 提供完整的 A 系列表单组件（AFormInput、AFormSelect 等）
- **媒体管理**: AOssMediaManager 组件支持文件直传和目录管理

## 核心功能

### 🔐 权限管理

- 完善的自定义指令：`v-permi`、`v-role`、`v-admin`、`v-superadmin` 、`v-permi-all` 、`v-role-all` 、`v-tenant`、
  `v-no-permi`、`v-no-role`、`v-no-permi`等
- 支持延迟加载和细粒度权限控制
- 与后端权限标识符保持一致

### 🌍 国际化支持

- 增强的 `useI18n` 组合函数，支持智能提示
- 菜单国际化自动键名计算
- Element Plus 国际化资源集成

### 🎨 主题系统

- `useTheme` 组合函数统一主题管理
- UnoCSS 深度定制配置
- 支持动态主题切换

### 📊 数据处理

- 统一类型规范：`R<T>` 响应类型，`PageResult<T>` 分页类型
- `useHttp` 组合函数封装网络请求
- 表格组件支持跨页选择和高度自适应

### 🔧 开发工具增强

- **表格功能**: `useSelection`、`useTableHeight` 组合函数
- **文件处理**: `useDownload` 组合函数，支持文件直传
- **实时通信**: `useSSE`、`useWS` 组合函数，支持重连策略
- **动画效果**: `useAnimation` 组合函数

## 项目优势

1. **开发体验优秀**: 完整的 TypeScript 类型支持和智能提示
2. **代码质量高**: 统一的命名规范和完善的注释文档
3. **功能丰富**: 覆盖企业级应用的各种场景需求
4. **扩展性强**: 模块化设计，易于定制和扩展
5. **多端支持**: Web 端 + 移动端一体化解决方案

## 适用场景

- 企业级 Web 管理系统
- SaaS 多租户管理平台
- 内容管理系统后台
- 需要权限管理的业务系统
- 中后台管理界面

Ruoyi Plus 前端通过现代化的技术栈和精心设计的架构，为开发者提供了一个高效、可维护的企业级 Web 管理系统解决方案。
