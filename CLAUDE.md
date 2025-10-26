# CLAUDE.md - AI 协作开发规范

> **RuoYi-Plus-UniApp 全栈开发文档项目 - Claude Code 协作指南**
>
> 本文档为 AI 助手(Claude Code)提供项目上下文和开发规范,确保高质量、一致性的文档输出，回答时务必使用中文。
>
> **版本**: v1.0.0
> **更新时间**: 2025-10-26
> **作者**: 抓蛙师 (bkywksj)

---

## 📋 目录

- [项目概览](#项目概览)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [文档编写规范](#文档编写规范)
- [组件文档模板](#组件文档模板)
- [常用命令](#常用命令)
- [Git 工作流](#git-工作流)
- [注意事项](#注意事项)

---

## 项目概览

### 项目信息

- **项目名称**: RuoYi-Plus-UniApp 全栈开发文档
- **项目定位**: 为 RuoYi-Plus-UniApp 全栈框架提供完整、详细的技术文档
- **技术栈**: VitePress 1.6.3 + Vue 3.5.18 + TypeScript 5.9.2
- **包管理器**: pnpm (≥8.0.0)
- **Node 版本**: ≥18.0.0
- **文档总数**: 323+ 个 Markdown 文档

### 核心理念

1. **代码即文档** - 文档基于实际源代码编写,所有示例和说明必须对应真实实现
2. **详细且准确** - 每个组件文档必须详尽完整,包含所有特性、用法、API、最佳实践和常见问题
3. **源码引用** - 所有技术说明必须标注源码位置,格式: `参考: src/path/to/file.ext:行号`
4. **开发友好** - 注重开发者体验,提供完整代码示例和实用建议
5. **全栈统一** - 前后端、移动端命名规范、类型定义保持一致

### 项目范围

本文档项目涵盖三大模块:

1. **后端文档** (`docs/backend/`) - RuoYi-Plus 后端框架文档
2. **前端文档** (`docs/frontend/`) - Vue 3 + Element Plus 管理端文档
3. **移动端文档** (`docs/mobile/`) - UniApp + WD UI 移动端文档

---

## 项目结构

### 目录树

```
ruoyi-plus-uniapp-docs/           # 文档项目根目录
├── docs/                          # 文档源文件目录
│   ├── .vitepress/               # VitePress 配置
│   │   ├── config.ts             # 核心配置文件(侧边栏、导航等)
│   │   └── theme/                # 自定义主题
│   ├── backend/                  # 后端文档
│   │   ├── guide/               # 后端开发指南
│   │   ├── modules/             # 功能模块文档
│   │   └── api/                 # API 接口文档
│   ├── frontend/                 # 前端文档
│   │   ├── guide/               # 前端开发指南
│   │   ├── components/          # 组件文档
│   │   └── utils/               # 工具函数文档
│   ├── mobile/                   # 移动端文档
│   │   ├── uniapp/              # UniApp 基础文档
│   │   │   ├── overview.md      # UniApp 概览
│   │   │   ├── manifest-config.md
│   │   │   ├── pages-config.md
│   │   │   └── ...
│   │   └── wd/                  # WD UI 组件库文档
│   │       ├── overview.md      # 组件库概览
│   │       ├── getting-started.md
│   │       ├── basic/           # 基础组件(6个)
│   │       │   ├── button.md
│   │       │   ├── icon.md
│   │       │   ├── text.md
│   │       │   ├── transition.md
│   │       │   ├── resize.md
│   │       │   └── config-provider.md
│   │       ├── layout/          # 布局组件(5个)
│   │       ├── navigation/      # 导航组件(9个)
│   │       ├── form/            # 表单组件(22个)
│   │       ├── display/         # 展示组件(13个)
│   │       └── feedback/        # 反馈组件(23个)
│   ├── practices/               # 最佳实践
│   ├── public/                  # 静态资源
│   └── index.md                 # 首页
├── package.json                  # 项目依赖配置
├── pnpm-lock.yaml               # 依赖锁定文件
├── README.md                     # 项目说明(新特性列表)
└── CLAUDE.md                     # 本文档(AI 协作规范)
```

### 源码项目结构

```
ruoyi-plus-uniapp/                # 源码项目根目录(上级目录)
├── ruoyi-plus-uniapp-docs/      # 本文档项目
└── ruoyi-plus-uniapp/           # 源码项目
    └── plus-uniapp/             # UniApp 移动端项目
        ├── src/
        │   ├── wd/              # WD UI 组件库源码
        │   │   ├── components/  # 组件实现
        │   │   │   ├── wd-button/
        │   │   │   │   └── wd-button.vue
        │   │   │   ├── wd-icon/
        │   │   │   │   └── wd-icon.vue
        │   │   │   └── ...
        │   │   └── index.ts     # 组件导出
        │   ├── pages/           # 页面
        │   ├── stores/          # Pinia 状态管理
        │   ├── composables/     # 组合式函数
        │   └── utils/           # 工具函数
        ├── manifest.json        # 应用配置
        ├── pages.json           # 页面路由配置
        └── package.json         # 依赖配置
```

### WD UI 组件库分类

| 分类 | 组件数量 | 目录 | 状态 |
|------|---------|------|------|
| 基础组件 | 6 | `mobile/wd/basic/` | Button/Icon 已完成 |
| 布局组件 | 5 | `mobile/wd/layout/` | 待完善 |
| 导航组件 | 9 | `mobile/wd/navigation/` | 待完善 |
| 表单组件 | 22 | `mobile/wd/form/` | 待完善 |
| 展示组件 | 13 | `mobile/wd/display/` | 待完善 |
| 反馈组件 | 23 | `mobile/wd/feedback/` | 待完善 |
| **总计** | **78** | - | **2/78 已完成** |

---

## 开发规范

### 技术栈规范

#### 移动端技术栈

- **框架**: UniApp 3.0.0-4060620250520001
- **语言**: Vue 3.4.21 + TypeScript 5.7.2
- **状态管理**: Pinia 2.0.36
- **构建工具**: Vite 6.3.5
- **样式**: SCSS + UnoCSS 65.4.2
- **图标**: Iconify + 自定义字体图标
- **UI 组件**: Wot Design Uni (WD UI) 自维护版本

#### 文档技术栈

- **静态站点生成**: VitePress 1.6.3
- **UI 框架**: Vue 3.5.18
- **图标**: Iconify (unplugin-icons 22.2.0)
- **工具库**: @vueuse/core 13.6.0

### 命名规范

#### 文件命名

1. **组件源码文件**: 小写连字符 (kebab-case)
   - ✅ `wd-button.vue`
   - ✅ `wd-icon.vue`
   - ❌ `WdButton.vue`
   - ❌ `button.vue`

2. **文档文件**: 小写连字符 (kebab-case)
   - ✅ `button.md`
   - ✅ `config-provider.md`
   - ❌ `Button.md`
   - ❌ `configProvider.md`

3. **TypeScript 类型文件**: 小写 `.ts`
   - ✅ `types.ts`
   - ✅ `index.ts`

#### 组件命名

1. **组件名称**: 大驼峰 (PascalCase) + `Wd` 前缀
   ```typescript
   defineOptions({
     name: 'WdButton',  // ✅ 正确
   })
   ```

2. **Props 接口**: `Wd{ComponentName}Props`
   ```typescript
   interface WdButtonProps { ... }  // ✅
   interface WdIconProps { ... }    // ✅
   ```

3. **Emits 接口**: `Wd{ComponentName}Emits`
   ```typescript
   interface WdButtonEmits { ... }
   interface WdIconEmits { ... }
   ```

4. **类型导出**: `{ComponentName}Type`
   ```typescript
   export type ButtonType = 'primary' | 'success' | ...
   export type IconName = FontIconName | UnoIconName | string
   ```

#### 变量命名

1. **响应式变量**: 小驼峰 (camelCase)
   ```typescript
   const isLoading = ref(false)      // ✅
   const buttonType = ref('primary') // ✅
   ```

2. **常量**: 大写下划线 (SCREAMING_SNAKE_CASE)
   ```typescript
   const MAX_SIZE = 100
   const DEFAULT_COLOR = '#1890ff'
   ```

3. **函数/方法**: 小驼峰 + 动词前缀
   ```typescript
   const handleClick = () => { ... }
   const getIconClass = () => { ... }
   ```

### 代码风格

#### TypeScript

```typescript
// ✅ 推荐写法
interface WdButtonProps {
  /** 按钮类型 */
  type?: ButtonType
  /** 按钮尺寸 */
  size?: ButtonSize
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<WdButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
})

// ❌ 不推荐
const props = defineProps({
  type: String,
  size: String,
  disabled: Boolean,
})
```

#### Vue 组件

```vue
<!-- ✅ 推荐结构 -->
<template>
  <view :class="rootClass" :style="rootStyle" @click="handleClick">
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({
  name: 'WdButton',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

interface WdButtonProps {
  // Props 定义
}

const props = withDefaults(defineProps<WdButtonProps>(), {
  // 默认值
})

const emit = defineEmits<{
  click: [event: Event]
}>()

// 计算属性
const rootClass = computed(() => { ... })

// 方法
const handleClick = (event: Event) => {
  emit('click', event)
}
</script>

<style lang="scss" scoped>
// 样式
</style>
```

---

## 文档编写规范

### 基本要求

1. **必须基于源码**
   - 所有文档内容必须基于实际源码编写
   - 禁止编造不存在的功能或 API
   - 每个特性都要标注源码引用

2. **详细完整**
   - 每个组件文档目标 1000+ 行
   - 涵盖所有 Props、Events、Slots、方法
   - 提供丰富的代码示例和使用场景

3. **源码引用格式**
   ```markdown
   参考: src/wd/components/wd-button/wd-button.vue:372-376
   ```

4. **代码示例要求**
   - 必须是完整可运行的代码
   - 包含 `<template>` 和 `<script>` 部分
   - 必要时添加 `<style>` 部分
   - 示例代码使用 `lang="ts"` 和 `setup`

### 文档结构模板

每个组件文档必须包含以下章节:

```markdown
# 组件名称 组件中文名

## 介绍

[组件功能描述,300-500字]

**核心特性:**

- **特性1** - 说明
- **特性2** - 说明
- **特性3** - 说明
- ...

参考: [源码路径:行号]

## 基本用法

### 子章节1

[说明文字]

```vue
<template>
  [示例代码]
</template>

<script lang="ts" setup>
[示例代码]
</script>
```

**使用说明:**
- 说明点1
- 说明点2

参考: [源码路径:行号]

### 子章节2

[继续...]

## [更多章节]

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| xxx | xxx | `type` | `value` |

参考: [源码路径:行号]

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| xxx | xxx | `type` |

参考: [源码路径:行号]

### 类型定义

```typescript
[类型定义代码]
```

参考: [源码路径:行号]

## 主题定制

[主题定制说明]

## 最佳实践

### 1. 实践标题

[说明]

```vue
[示例]
```

### 2. 下一个实践

[...]

## 常见问题

### 1. 问题标题

**问题原因:**
- 原因1
- 原因2

**解决方案:**
```vue
[解决方案代码]
```

参考: [源码路径:行号]

### 2. 下一个问题

[...]
```

### 章节编写指南

#### 1. 介绍章节

- **字数**: 300-500 字
- **内容**: 组件功能、使用场景、核心特性
- **格式**:
  - 第一段: 组件功能总述
  - 核心特性: 使用无序列表,每项包含**加粗标题** + 说明
  - 必须添加源码引用

#### 2. 基本用法章节

- **子章节数量**: 根据组件复杂度,通常 5-15 个
- **每个子章节包含**:
  - 说明文字 (50-200 字)
  - 完整代码示例 (Vue SFC 格式)
  - 使用说明/技术实现 (列表形式)
  - 源码引用

#### 3. API 章节

- **Props 表格**:
  - 列: 参数、说明、类型、默认值
  - 类型使用反引号包裹: \`string\`, \`number\`, \`ButtonType\`
  - 默认值使用反引号: \`'default'\`, \`false\`, \`40\`

- **Events 表格**:
  - 列: 事件名、说明、回调参数
  - 回调参数格式: \`event: Event\`, \`value: string\`

- **类型定义**:
  - 使用 TypeScript 代码块
  - 包含接口、类型别名、枚举等
  - 添加注释说明

#### 4. 主题定制章节

- CSS 变量定义
- 暗黑模式支持
- 自定义样式示例

#### 5. 最佳实践章节

- **数量**: 3-5 个实践
- **格式**:
  - 编号标题
  - 说明文字
  - 代码示例 (好的示例 ✅ 和坏的示例 ❌)

#### 6. 常见问题章节

- **数量**: 3-5 个问题
- **格式**:
  - 问题标题
  - 问题原因 (列表)
  - 解决方案 (代码示例)
  - 源码引用

### 代码示例规范

#### Vue 组件示例

```vue
<template>
  <view class="demo">
    <!-- 注释说明 -->
    <wd-button type="primary" @click="handleClick">
      按钮文字
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 响应式数据
const count = ref(0)

// 方法定义
const handleClick = () => {
  count.value++
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

#### TypeScript 类型示例

```typescript
/**
 * 按钮类型
 */
export type ButtonType =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'

/**
 * 按钮属性接口
 */
interface WdButtonProps {
  /** 按钮类型 */
  type?: ButtonType
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
}
```

### 语言风格

1. **专业准确**: 使用准确的技术术语
2. **简洁明了**: 避免冗余表述
3. **友好易懂**: 面向开发者,避免过度学术化
4. **统一规范**:
   - 使用中文标点符号
   - 中英文之间无需空格
   - 代码使用反引号包裹: \`code\`
   - 专业术语首次出现时可标注英文

---

## 组件文档模板

### 参考示例

已完成的高质量文档示例:

1. **Button 组件** - `docs/mobile/wd/basic/button.md` (1202 行)
   - 完整的组件介绍
   - 8 种按钮类型详细说明
   - 全部 22 个 Props 和 9 个 Events
   - 丰富的代码示例
   - 主题定制和最佳实践
   - 5 个常见问题及解决方案

2. **Icon 组件** - `docs/mobile/wd/basic/icon.md` (1716 行)
   - 三种图标类型说明
   - 300+ 图标完整分类
   - 11 个分类详细介绍
   - 自定义图标字体
   - 动画效果实现
   - 图标按钮组合

### 编写新文档流程

1. **阅读源码**
   ```bash
   # 找到组件源码
   D:\desktop\my\framework\ruoyi-plus-uniapp\ruoyi-plus-uniapp\plus-uniapp\src\wd\components\wd-{component}\
   ```

2. **分析组件**
   - Props: 所有属性及其类型、默认值
   - Events: 所有事件及其参数
   - Slots: 所有插槽
   - 计算属性和方法
   - 样式和主题变量

3. **编写文档**
   - 按照模板结构编写
   - 每个章节添加源码引用
   - 提供完整代码示例
   - 确保示例可运行

4. **质量检查**
   - 文档行数 ≥ 1000 行
   - 所有 API 都已文档化
   - 所有示例都可运行
   - 源码引用准确
   - 无拼写错误

---

## 常用命令

### 文档开发

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev
# 访问: http://localhost:5173

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 源码项目

```bash
# 切换到源码目录
cd ../ruoyi-plus-uniapp/plus-uniapp

# 安装依赖
pnpm install

# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 代码格式化
pnpm lint:fix
```

### 文件查找

```bash
# 查找组件源码
find ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components -name "wd-*.vue"

# 查找文档文件
find docs/mobile/wd -name "*.md"

# 统计文档数量
find docs -name "*.md" | wc -l

# 查看组件导出
cat ../ruoyi-plus-uniapp/plus-uniapp/src/wd/index.ts
```

---

## Git 工作流

### 分支策略

- **main/master**: 主分支,稳定版本
- **develop**: 开发分支
- **feature/***: 功能分支
- **docs/***: 文档分支

### 提交规范

```bash
# 提交格式
<type>(<scope>): <subject>

# 类型 (type)
feat      # 新功能
fix       # 修复
docs      # 文档
style     # 格式
refactor  # 重构
test      # 测试
chore     # 构建/工具

# 示例
git commit -m "docs(mobile): 完善 Button 组件文档"
git commit -m "docs(mobile): 新增 Icon 组件文档"
git commit -m "feat(docs): 添加 CLAUDE.md 规范文档"
```

### 常用操作

```bash
# 查看状态
git status

# 添加文件
git add docs/mobile/wd/basic/button.md

# 提交
git commit -m "docs(mobile): 完善 Button 组件文档"

# 推送
git push origin main

# 查看提交历史
git log --oneline -10
```

---

## 注意事项

### ⚠️ 重要约定

1. **禁止编造内容**
   - 所有文档必须基于真实源码
   - 不要添加不存在的 Props/Events
   - 不要描述未实现的功能

2. **必须添加源码引用**
   - 每个技术点都要标注源码位置
   - 格式: `参考: 路径:行号`
   - 行号可以是单行或范围: `123` 或 `100-150`

3. **代码示例必须完整**
   - 包含必要的导入
   - 包含必要的类型定义
   - 确保代码可以直接运行

4. **文档不包含其他文档链接**
   - 用户明确要求: "文档里面不用包含其他的文档链接"
   - 不要添加相关文档、延伸阅读等链接

5. **统一单位使用**
   - 移动端统一使用 `rpx` 单位
   - 示例: `size="32"` (自动转换为 32rpx)
   - 或明确指定: `size="32rpx"`

### 💡 最佳实践

1. **编写文档前**
   - 先完整阅读组件源码
   - 理解所有功能和特性
   - 查看已完成的文档示例

2. **编写文档时**
   - 使用 TodoWrite 工具跟踪进度
   - 一次完成一个组件
   - 保持文档结构一致

3. **完成文档后**
   - 检查文档行数 (≥1000 行)
   - 检查源码引用完整性
   - 检查代码示例正确性
   - 更新 TodoWrite 状态

### 🎯 工作流程示例

```markdown
1. 接收任务: "完善 Text 组件文档"

2. 创建 Todo:
   - 阅读 Text 组件源码
   - 分析组件 API
   - 编写文档
   - 质量检查

3. 阅读源码:
   - 打开 src/wd/components/wd-text/wd-text.vue
   - 分析 Props、Events、Slots
   - 记录关键代码位置

4. 编写文档:
   - 按照模板结构编写
   - 添加代码示例
   - 标注源码引用

5. 质量检查:
   - 行数检查: ✓ 1200+ 行
   - API 完整性: ✓ 所有 Props/Events 已文档化
   - 示例完整性: ✓ 所有功能都有示例
   - 源码引用: ✓ 每个技术点都有引用

6. 完成任务:
   - 更新 Todo 状态为 completed
   - 提交代码: git commit -m "docs(mobile): 完善 Text 组件文档"
```

### 📚 参考资源

- **VitePress 官方文档**: https://vitepress.dev/
- **Vue 3 官方文档**: https://vuejs.org/
- **UniApp 官方文档**: https://uniapp.dcloud.net.cn/
- **TypeScript 官方文档**: https://www.typescriptlang.org/
- **项目官网**: https://ruoyi.plus

---

## 更新日志

### v1.0.0 (2025-10-26)

- 📝 创建 CLAUDE.md 规范文档
- 📋 定义项目结构和开发规范
- 📖 制定文档编写标准
- ✅ 提供组件文档模板
- 🎯 明确质量标准和工作流程

---

## 联系方式

- **作者**: 抓蛙师 (bkywksj)
- **联系方式**: 770492966 (微信/QQ)
- **官网**: https://ruoyi.plus
- **邮箱**: 770492966@qq.com

---

**本文档是 AI 协作开发的重要指南,请严格遵守以上规范,确保文档质量和一致性。**
