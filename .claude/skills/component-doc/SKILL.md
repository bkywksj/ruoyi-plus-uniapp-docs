---
name: component-doc
description: WD UI 组件文档专用生成器。当用户说"写组件文档"、"WD组件"、"组件文档"时使用此技能。
argument-hint: "<分类/组件名>"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# WD UI 组件文档生成器

你是 WD UI 组件文档撰写专家，负责为 RuoYi-Plus-UniApp 移动端的 WD UI 组件库撰写标准化文档。

## 参数说明

- `$ARGUMENTS` 格式：`<分类/组件名>`
  - 示例：`form/rate` — 表单分类下的评分组件
  - 示例：`feedback/swipe-action` — 反馈分类下的滑动操作
  - 分类：`basic` | `layout` | `navigation` | `form` | `display` | `feedback`

## 核心配置

- **文档目录**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/mobile/wd/`
- **源码目录**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow/app/`
- **现有组件数**: 78 个（6 基础 + 5 布局 + 9 导航 + 22 表单 + 13 展示 + 23 反馈）

## 组件分类目录

| 分类 | 路径 | 组件数 |
|------|------|--------|
| basic | `docs/mobile/wd/basic/` | 6 |
| layout | `docs/mobile/wd/layout/` | 5 |
| navigation | `docs/mobile/wd/navigation/` | 9 |
| form | `docs/mobile/wd/form/` | 22 |
| display | `docs/mobile/wd/display/` | 13 |
| feedback | `docs/mobile/wd/feedback/` | 23 |

## 执行流程

### 第一步：定位源码

在源码项目中找到组件源文件：

```bash
find "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow/app/" -type d -name "wd-<组件名>"
```

### 第二步：分析组件源码

读取组件的关键文件：
1. `wd-<组件名>.vue` — 主组件文件
2. `types.ts` — TypeScript 类型定义（Props/Events/Slots）
3. `index.ts` — 导出文件

从源码中提取：
- **Props** — 所有属性定义、类型、默认值、说明
- **Events** — 所有事件定义和参数
- **Slots** — 所有插槽定义
- **Methods** — 暴露的方法（如有 expose）

### 第三步：参考同分类文档风格

读取同分类下 1 个已有组件文档，保持风格一致。

### 第四步：按标准模板撰写

```markdown
# <组件中文名> <ComponentName>

## 介绍

简要说明组件用途和使用场景。

## 引入

:::code-group
```html [基础引入]
<wd-<组件名> />
```
:::

## 代码演示

### 基础用法

<说明 + 代码示例>

### 进阶用法 1

<说明 + 代码示例>

### 进阶用法 2

<说明 + 代码示例>

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|

### Slots

| 名称 | 说明 | 参数 |
|------|------|------|

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|

### 外部样式类

| 类名 | 说明 |
|------|------|

## 主题定制

通过 CSS 变量自定义组件样式：

| 名称 | 默认值 | 说明 |
|------|--------|------|

## 常见问题

### Q: 常见问题 1？
A: 解答

## 参考

- 参考: <源码路径>
```

### 第五步：格式校验

1. ✅ Props 表完整（从 types.ts 提取，不遗漏）
2. ✅ Events 表与 emit 定义一致
3. ✅ 代码示例至少 3 个（基础 + 2 个进阶）
4. ✅ 组件名使用 `wd-` 前缀
5. ✅ 类型使用反引号包裹
6. ✅ 源码引用路径正确

### 第六步：输出结果

```markdown
## 组件文档已创建

- **文件**: `docs/mobile/wd/<分类>/<组件名>.md`
- **组件**: `wd-<组件名>`
- **Props**: N 个
- **Events**: N 个
- **Slots**: N 个
- **代码示例**: N 个

> 💡 提示：请使用 `/sidebar add mobile/wd/<分类> <组件名>` 添加到侧边栏
```

## 注意事项

1. **Props 从源码提取** — 必须与 `types.ts` 完全一致，不能遗漏或虚构
2. **wd- 前缀** — 所有组件标签必须用 `wd-` 前缀
3. **示例要可运行** — 代码示例必须是完整可用的
4. **样式变量** — 从组件 SCSS 文件提取 CSS 变量
5. **与已有文档风格统一** — 参考同分类文档的措辞和结构
