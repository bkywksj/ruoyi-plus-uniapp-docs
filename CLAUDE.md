# CLAUDE.md - AI 协作开发规范

> **RuoYi-Plus-UniApp 全栈开发文档项目 - Claude Code 协作指南**
>
> 本文档为 AI 助手(Claude Code)提供项目上下文和开发规范,确保高质量、一致性的文档输出，回答时务必使用中文。
>

> **作者**: 抓蛙师 (bkywksj)

---

## 📋 目录

- [项目概览](#项目概览)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [文档编写规范](#文档编写规范)
- [文档编写流程](#文档编写流程)
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
ruoyi-plus-uniapp/                    # 源码项目根目录(上级目录)
├── ruoyi-plus-uniapp-docs/          # 本文档项目
├── ruoyi-plus-uniapp-workflow/      # ⭐ 源码参考项目(编写文档时参考)
│   ├── plus-app/                    # App 应用端
│   ├── plus-ui/                     # 管理端前端
│   ├── plus-uniapp/                 # UniApp 移动端
│   ├── plus-uniapp-demo/            # UniApp 示例项目
│   ├── ruoyi-admin/                 # 后端主模块(启动入口)
│   ├── ruoyi-common/                # 后端通用模块(31个子模块)
│   ├── ruoyi-modules/               # 后端业务模块(5个子模块)
│   ├── ruoyi-extend/                # 后端扩展模块(2个子模块)
│   ├── script/                      # 脚本文件
│   └── pom.xml                      # Maven 项目配置
└── ruoyi-plus-uniapp/               # 旧源码项目(仅供参考)
    └── plus-uniapp/                 # UniApp 移动端项目
        ├── src/
        │   ├── wd/                  # WD UI 组件库源码
        │   │   ├── components/      # 组件实现
        │   │   └── index.ts         # 组件导出
        │   ├── pages/               # 页面
        │   ├── stores/              # Pinia 状态管理
        │   ├── composables/         # 组合式函数
        │   └── utils/               # 工具函数
        ├── manifest.json            # 应用配置
        ├── pages.json               # 页面路由配置
        └── package.json             # 依赖配置
```

### 后端模块详细结构

#### ruoyi-common 通用模块 (31个子模块)

| 模块名称 | 说明 |
|---------|------|
| `ruoyi-common-bom` | 依赖版本管理(BOM) |
| `ruoyi-common-core` | 核心工具类、基础配置 |
| `ruoyi-common-doc` | 接口文档配置(SpringDoc) |
| `ruoyi-common-encrypt` | 数据加密模块 |
| `ruoyi-common-excel` | Excel导入导出(FastExcel) |
| `ruoyi-common-http` | HTTP客户端(Forest) |
| `ruoyi-common-idempotent` | 幂等性处理 |
| `ruoyi-common-job` | 定时任务(SnailJob) |
| `ruoyi-common-json` | JSON序列化配置 |
| `ruoyi-common-langchain4j` | AI大模型集成(LangChain4j) |
| `ruoyi-common-log` | 日志处理模块 |
| `ruoyi-common-mail` | 邮件发送模块 |
| `ruoyi-common-media` | 媒体文件处理 |
| `ruoyi-common-miniapp` | 微信小程序模块 |
| `ruoyi-common-mp` | 微信公众号模块 |
| `ruoyi-common-mybatis` | MyBatis-Plus配置 |
| `ruoyi-common-openapi` | OpenAPI接口规范 |
| `ruoyi-common-oss` | 对象存储(AWS S3兼容) |
| `ruoyi-common-pay` | 支付模块(含4个子模块) |
| `ruoyi-common-ratelimiter` | 限流模块 |
| `ruoyi-common-redis` | Redis缓存模块(Redisson) |
| `ruoyi-common-rocketmq` | 消息队列(RocketMQ) |
| `ruoyi-common-satoken` | Sa-Token认证配置 |
| `ruoyi-common-security` | 安全模块 |
| `ruoyi-common-sensitive` | 数据脱敏模块 |
| `ruoyi-common-serialMap` | 序列化映射工具 |
| `ruoyi-common-sms` | 短信模块(SMS4J) |
| `ruoyi-common-social` | 社交登录(JustAuth) |
| `ruoyi-common-sse` | SSE服务端推送 |
| `ruoyi-common-tenant` | 多租户模块 |
| `ruoyi-common-test` | 测试工具模块 |
| `ruoyi-common-web` | Web通用配置 |
| `ruoyi-common-websocket` | WebSocket模块 |

#### ruoyi-common-pay 支付子模块

| 模块名称 | 说明 |
|---------|------|
| `ruoyi-common-pay-core` | 支付核心抽象 |
| `ruoyi-common-pay-alipay` | 支付宝支付 |
| `ruoyi-common-pay-wechat` | 微信支付 |
| `ruoyi-common-pay-balance` | 余额支付 |

#### ruoyi-modules 业务模块 (5个子模块)

| 模块名称 | 说明 |
|---------|------|
| `ruoyi-system` | 系统管理模块(用户、角色、菜单等) |
| `ruoyi-generator` | 代码生成器模块 |
| `ruoyi-workflow` | 工作流模块(Warm-Flow) |
| `ruoyi-business` | 业务扩展模块 |
| `ruoyi-mall` | 商城模块 |

#### ruoyi-extend 扩展模块 (2个子模块)

| 模块名称 | 说明 |
|---------|------|
| `ruoyi-monitor-admin` | Spring Boot Admin监控 |
| `ruoyi-snailjob-server` | SnailJob任务调度服务端 |

### 后端技术栈版本

| 技术 | 版本 |
|------|------|
| Java | 21 |
| Spring Boot | 3.5.6 |
| MyBatis-Plus | 3.5.14 |
| Sa-Token | 1.44.0 |
| Redisson | 3.51.0 |
| Hutool | 5.8.40 |
| Warm-Flow | 1.8.1 |
| SnailJob | 1.8.0 |
| LangChain4j | 0.35.0 |
| WxJava | 4.7.6.B |

**⚠️ 重要说明**:
- **主要参考源码**: `ruoyi-plus-uniapp-workflow` 是最新的完整项目,编写文档时应主要参考此项目
- **次要参考源码**: `ruoyi-plus-uniapp` 是早期项目,仅在 workflow 项目中找不到对应实现时参考

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
   - 优先参考 `ruoyi-plus-uniapp-workflow` 项目中的实现
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

5. **⚠️ Markdown 标签规范(重要)**
   - **绝对禁止**在非代码块区域写未闭合的 HTML 标签或泛型标签
   - 如果必须在文本中写带尖括号的内容(如泛型 `R<String>`),必须用反引号包裹
   - ✅ 正确: `R<String>` 或 `Promise<User>` 或 `Array<T>`
   - ❌ 错误: R<String> 或 Promise<User> 或 Array<T>
   - ✅ 正确: `<view>` 标签、`<template>` 标签
   - ❌ 错误: <view> 标签、<template> 标签
   - 原因: 未闭合的尖括号会被 Markdown 解析器当作 HTML 标签处理,导致渲染错误

6. **⚠️ 禁止文档跳转链接(重要)**
   - **绝对禁止**在文档中添加跳转到其他文档的链接
   - **禁止**添加"相关文档"、"延伸阅读"、"参考链接"等章节
   - **禁止**使用 Markdown 链接语法指向其他文档,如 `[按钮组件](./button.md)`
   - ✅ 允许: 源码引用、外部资源链接(官方文档、API 文档等)
   - ❌ 禁止: 项目内文档之间的跳转链接

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

## 文档编写流程

### ⚠️ 开始编写文档前必读

**在开始编写任何文档之前,必须严格遵循以下流程:**

#### 第一步: 查看项目进度表

1. **打开进度表**
   - 文件路径: `PROJECT_PROGRESS.md`
   - 查看整体完成度和待完成任务

2. **了解优先级**
   - 🔴 HIGH PRIORITY: 紧急任务(本周完成)
   - 🟡 MEDIUM PRIORITY: 重要任务(本月完成)
   - 🟢 LOW PRIORITY: 持续优化任务

3. **选择文档**
   - 优先选择 HIGH PRIORITY 中的文档
   - 查看文档当前状态(未开始/进行中/已完成)
   - 确认文档路径和目标行数

#### 第二步: 查找源码实现

1. **定位源码目录**
   - 主要参考: `D:\desktop\my\framework\ruoyi-plus-uniapp\ruoyi-plus-uniapp-workflow`
   - 次要参考: `D:\desktop\my\framework\ruoyi-plus-uniapp\ruoyi-plus-uniapp`

2. **根据文档类型找对应目录**
   ```bash
   # 后端文档 → workflow 项目
   docs/backend/core/xxx.md → ruoyi-plus-uniapp-workflow/ruoyi-common/
   docs/backend/modules/xxx.md → ruoyi-plus-uniapp-workflow/ruoyi-modules/
   docs/backend/extend/xxx.md → ruoyi-plus-uniapp-workflow/ruoyi-extend/

   # 前端文档 → workflow 项目
   docs/frontend/xxx.md → ruoyi-plus-uniapp-workflow/plus-ui/

   # 移动端文档 → workflow 项目
   docs/mobile/xxx.md → ruoyi-plus-uniapp-workflow/plus-app/
   docs/mobile/uniapp/xxx.md → ruoyi-plus-uniapp-workflow/plus-uniapp/

   # WD 组件库 → 旧项目(已完成,无需参考)
   docs/mobile/wd/xxx.md → ruoyi-plus-uniapp/plus-uniapp/src/wd/
   ```

3. **阅读源码**
   - 使用 Read 工具阅读相关源码文件
   - 使用 Glob 工具查找相关文件
   - 使用 Grep 工具搜索关键代码
   - 理解功能实现、API 定义、配置选项等

#### 第三步: 编写文档

1. **创建 Todo 清单**
   - 使用 TodoWrite 工具创建任务清单
   - 将文档分解为多个小任务
   - 示例:
     ```
     - 阅读 xxx 源码
     - 分析 API 接口
     - 编写介绍章节
     - 编写基本用法章节
     - 编写 API 章节
     - 编写最佳实践章节
     - 编写常见问题章节
     - 质量检查
     ```

2. **按模板编写**
   - 严格遵守[文档结构模板](#文档结构模板)
   - 添加源码引用(格式: `参考: 路径:行号`)
   - 提供完整代码示例
   - 注意 Markdown 标签规范(泛型必须用反引号包裹)
   - 禁止添加文档跳转链接

3. **质量标准**
   - 核心文档: ≥ 1000 行
   - 普通文档: ≥ 500 行
   - 所有 API 都已文档化
   - 所有示例都可运行
   - 源码引用准确
   - 无拼写错误
   - 无未闭合标签

#### 第四步: 更新进度表

**⚠️ 这一步非常重要,完成文档后必须立即更新进度表!**

1. **更新文档状态**
   - 打开 `PROJECT_PROGRESS.md`
   - 找到对应文档条目
   - 更新状态: ⚠️ 或 🔄 → ✅
   - 更新行数统计

2. **更新优先级清单**
   - 从待办清单中移除已完成项
   - 勾选对应的 checkbox

3. **更新整体统计**
   - 更新顶部的"最后更新"时间
   - 重新计算完成度百分比
   - 更新各模块统计数据

4. **示例**
   ```markdown
   # 完成前
   - [ ] `docs/frontend/styles/theme-system.md` - 1 行 → 1000+ 行

   # 完成后(在进度表中更新)
   | Theme System | `docs/frontend/styles/theme-system.md` | ✅ 已完成 | 1,234 |

   # 并更新顶部统计
   > **最后更新**: 2025-11-10
   > **整体完成度**: 84.0% (B+ 评分)  # 从 83.5% 更新
   ```

#### 第五步: 提交代码

1. **查看变更**
   ```bash
   git status
   git diff docs/xxx/xxx.md
   ```

2. **提交文档**
   ```bash
   git add docs/xxx/xxx.md PROJECT_PROGRESS.md
   git commit -m "docs(模块): 完善 XXX 文档"
   ```

3. **推送**
   ```bash
   git push origin master
   ```

### 📋 快速检查清单

在提交文档前,使用此清单检查:

- [ ] 已查看 `PROJECT_PROGRESS.md` 进度表
- [ ] 已选择优先级任务
- [ ] 已查找并阅读源码实现
- [ ] 已创建 Todo 清单并跟踪进度
- [ ] 文档行数达到标准(核心 ≥1000 行,普通 ≥500 行)
- [ ] 所有技术点都有源码引用
- [ ] 所有代码示例都完整可运行
- [ ] 所有泛型标签都用反引号包裹(如 `R<String>`)
- [ ] 没有添加文档跳转链接
- [ ] 没有添加"参考资源"章节
- [ ] 没有添加"版本历史"章节
- [ ] 没有添加"附录"章节(示例代码除外)
- [ ] 已更新 `PROJECT_PROGRESS.md` 进度表
- [ ] 已更新文档状态和完成度统计
- [ ] 已提交代码并推送

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

#### 1. 禁止编造内容

- 所有文档必须基于真实源码
- 优先参考 `ruoyi-plus-uniapp-workflow` 项目
- 不要添加不存在的 Props/Events
- 不要描述未实现的功能

#### 2. 必须添加源码引用

- 每个技术点都要标注源码位置
- 格式: `参考: 路径:行号`
- 行号可以是单行或范围: `123` 或 `100-150`
- 示例:
  ```markdown
  参考: ruoyi-plus-uniapp-workflow/plus-ui/src/components/Form/BasicForm.vue:156-178
  ```

#### 3. 代码示例必须完整

- 包含必要的导入
- 包含必要的类型定义
- 确保代码可以直接运行
- 示例代码使用 `lang="ts"` 和 `setup`

#### 4. ⚠️ Markdown 标签规范(重点强调)

**这是最容易出错的地方,必须严格遵守!**

- **绝对禁止**在非代码块区域写未闭合的 HTML 标签或泛型标签
- 如果必须在文本中写带尖括号的内容,必须用反引号包裹

**错误示例** ❌:
```markdown
返回值类型为 Promise<User>,包含用户信息
使用 Array<T> 泛型定义数组类型
<view> 标签用于布局
```

**正确示例** ✅:
```markdown
返回值类型为 `Promise<User>`,包含用户信息
使用 `Array<T>` 泛型定义数组类型
`<view>` 标签用于布局
```

**常见需要包裹的情况**:
- 泛型类型: `Promise<T>`, `Array<User>`, `Ref<string>`, `R<List<User>>`
- HTML/组件标签: `<view>`, `<template>`, `<div>`, `<wd-button>`
- 比较符号: `a < b`, `x > y`

#### 5. ⚠️ 禁止文档跳转链接(重点强调)

**用户明确要求: "文档里面不用包含其他的文档链接"**

- **绝对禁止**在文档中添加跳转到其他文档的链接
- **禁止**添加"相关文档"、"延伸阅读"、"参考链接"等章节
- **禁止**使用 Markdown 链接语法指向其他文档

**错误示例** ❌:
```markdown
## 相关文档

- [Button 按钮](./button.md)
- [Icon 图标](../basic/icon.md)

详见[表单组件文档](../form/form.md)
```

**正确示例** ✅:
```markdown
参考: ruoyi-plus-uniapp-workflow/plus-ui/src/components/Button/index.vue:123

官方文档: https://element-plus.org/zh-CN/component/button.html
```

#### 6. ⚠️ 禁止特定章节(重要)

**用户明确要求: 禁止编写"参考资源"和"版本历史"章节**

- **绝对禁止**在文档末尾添加"参考资源"章节
- **绝对禁止**在文档末尾添加"版本历史"或"更新日志"章节
- **绝对禁止**在文档末尾添加"附录"章节(除非是完整示例代码)

**错误示例** ❌:
```markdown
## 参考资源

**官方文档:**
- Spring Boot Admin: https://...
- Vue 3: https://...

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.0.0 | 2024-11 | 初始版本 |

## 附录

### 参考链接
- 官方网站: https://...
```

**正确做法** ✅:
- 在文档正文中直接说明技术细节
- 在介绍章节中提及相关技术栈
- 使用源码引用代替外部链接
- 不添加版本历史记录

#### 7. ⚠️ 禁止源码引用格式(新增)

**用户明确要求: 不要使用"参考: src/xxx:行号"这种字眼**

- **绝对禁止**在文档中使用 `参考:` 开头的源码引用格式
- 技术说明直接基于源码编写,无需显式标注源码位置
- 所有内容必须准确对应源码实现,但不显示引用格式

**错误示例** ❌:
```markdown
主题系统支持亮色和暗色两种模式。

参考: src/composables/useTheme.ts:115-118
参考: src/assets/styles/themes/_light.scss:7-12
```

**正确示例** ✅:
```markdown
主题系统支持亮色和暗色两种模式,通过 useTheme Composable 实现主题切换功能。系统提供了完整的 CSS 变量体系,包括五层背景色层级系统,从 --bg-base 到 --bg-level-4,用于不同的视觉层次。
```

#### 8. 统一单位使用

- 移动端统一使用 `rpx` 单位
- 示例: `size="32"` (自动转换为 32rpx)
- 或明确指定: `size="32rpx"`

#### 9. ⚠️ 必须查看和更新进度表

**在开始编写文档前**:
- 必须先查看 `PROJECT_PROGRESS.md` 进度表
- 选择优先级任务
- 了解文档目标行数

**完成文档后**:
- 必须立即更新 `PROJECT_PROGRESS.md` 进度表
- 更新文档状态和行数统计
- 更新整体完成度

### 💡 最佳实践

#### 1. 编写文档前

- **查看进度表**: 打开 `PROJECT_PROGRESS.md`,选择优先级任务
- **查找源码**: 在 `ruoyi-plus-uniapp-workflow` 项目中找到对应实现
- **阅读源码**: 完整阅读组件/模块源码,理解所有功能和特性
- **参考示例**: 查看已完成的高质量文档示例

#### 2. 编写文档时

- **创建 Todo**: 使用 TodoWrite 工具跟踪进度
- **遵守模板**: 严格按照文档结构模板编写
- **添加引用**: 每个技术点都添加源码引用
- **包裹标签**: 所有泛型、HTML标签用反引号包裹
- **禁止链接**: 不添加文档跳转链接
- **保持一致**: 保持文档结构和风格一致

#### 3. 完成文档后

- **质量检查**:
  - ✓ 文档行数 (核心 ≥1000 行,普通 ≥500 行)
  - ✓ 源码引用完整性
  - ✓ 代码示例正确性
  - ✓ 标签全部用反引号包裹
  - ✓ 无文档跳转链接
- **更新进度表**: 立即更新 `PROJECT_PROGRESS.md`
- **更新 Todo**: 标记任务为完成
- **提交代码**: 提交文档和进度表

### 🎯 工作流程示例

**任务**: 完善前端主题系统文档 (`docs/frontend/styles/theme-system.md`)

#### 流程:

```markdown
1. 查看进度表:
   - 打开 PROJECT_PROGRESS.md
   - 找到任务: docs/frontend/styles/theme-system.md - 1 行 → 1000+ 行
   - 优先级: 🔴 HIGH PRIORITY
   - 状态: ⚠️ 紧急待完成

2. 创建 Todo:
   - 阅读 theme-system 源码实现
   - 分析主题配置和切换逻辑
   - 编写介绍章节
   - 编写主题配置章节
   - 编写主题切换章节
   - 编写暗黑模式章节
   - 编写 API 文档
   - 编写最佳实践
   - 编写常见问题
   - 质量检查
   - 更新进度表

3. 查找源码:
   - 在 ruoyi-plus-uniapp-workflow/plus-ui/src/ 中搜索主题相关代码
   - 使用 Grep 搜索: theme、dark、css variables
   - 找到主题配置文件、切换逻辑、CSS 变量定义
   - 记录关键代码位置

4. 阅读源码:
   - 阅读主题配置文件
   - 分析主题切换逻辑
   - 理解 CSS 变量体系
   - 理解暗黑模式实现
   - 记录所有 API 和配置项

5. 编写文档:
   - 按照模板结构编写
   - 添加完整代码示例
   - 标注源码引用(如: ruoyi-plus-uniapp-workflow/plus-ui/src/theme/index.ts:45-67)
   - 所有泛型用反引号包裹(如: `Ref<ThemeConfig>`)
   - 不添加文档跳转链接

6. 质量检查:
   - ✓ 行数检查: 1234 行 (目标 ≥1000 行)
   - ✓ API 完整性: 所有配置项和方法已文档化
   - ✓ 示例完整性: 所有功能都有示例
   - ✓ 源码引用: 每个技术点都有引用
   - ✓ 标签包裹: 所有泛型都用反引号包裹
   - ✓ 无跳转链接: 没有文档间的链接

7. 更新进度表:
   - 打开 PROJECT_PROGRESS.md
   - 更新文档状态: ⚠️ → ✅
   - 更新行数: 1 → 1,234
   - 从待办清单移除: [x] docs/frontend/styles/theme-system.md
   - 更新整体统计: 83.5% → 83.7%
   - 更新最后更新时间

8. 提交代码:
   - git add docs/frontend/styles/theme-system.md PROJECT_PROGRESS.md
   - git commit -m "docs(frontend): 完善主题系统文档"
   - git push origin master

9. 完成 Todo:
   - 标记所有任务为 completed
```

### 📚 参考资源

- **VitePress 官方文档**: https://vitepress.dev/
- **Vue 3 官方文档**: https://vuejs.org/
- **UniApp 官方文档**: https://uniapp.dcloud.net.cn/
- **TypeScript 官方文档**: https://www.typescriptlang.org/
- **项目官网**: https://ruoyi.plus

---

## 更新日志

### v1.4.0 (2025-11-22)

- 📦 更新后端模块详细结构(31个通用模块、5个业务模块、2个扩展模块)
- 📋 新增 ruoyi-common 所有子模块说明表格
- 📋 新增 ruoyi-common-pay 支付子模块说明
- 📋 新增 ruoyi-modules 业务模块说明
- 📋 新增 ruoyi-extend 扩展模块说明
- 🔧 新增后端技术栈版本表(Java 21、Spring Boot 3.5.6等)

### v1.3.0 (2025-11-10)

- 🚫 添加禁止源码引用格式规范(`参考: src/xxx:行号`)
- 📝 技术说明直接基于源码编写,无需显式标注源码位置
- 🎯 所有内容必须准确对应源码实现,但不显示引用格式

### v1.2.0 (2025-11-10)

- 🚫 添加禁止"参考资源"和"版本历史"章节规范
- 📋 更新快速检查清单,添加新的禁止项检查
- 📝 明确文档结尾不添加附录章节(示例代码除外)

### v1.1.0 (2025-11-10)

- 🎯 添加[文档编写流程](#文档编写流程)章节
- 📊 创建 PROJECT_PROGRESS.md 项目进度表
- ⚠️ 强化 Markdown 标签规范(泛型必须用反引号包裹)
- ⚠️ 强化禁止文档跳转链接规范
- 📂 添加源码项目结构说明(workflow 项目为主要参考)
- 📋 添加完整的文档编写流程和检查清单
- 🔄 明确进度表更新流程
- 💡 更新最佳实践和工作流程示例

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
