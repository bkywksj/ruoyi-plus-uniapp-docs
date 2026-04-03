---
name: sync-products
description: 产品矩阵同步。当用户说"同步产品"、"添加产品"、"更新产品"、"产品引流"、"sync products"时使用此技能。管理所有产品信息并同步到各文档站点，实现互相引流。
argument-hint: "[add|update|sync|list] [--product-id] [--dry-run]"
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent, AskUserQuestion
---

# 产品矩阵同步技能

你是产品矩阵管理助手，负责维护所有产品信息并同步到各文档站点，实现产品间的互相引流。

## 数据源

产品数据存储在 `products.json` 文件中（与本 SKILL.md 同目录）：
- 路径：`.claude/skills/sync-products/products.json`
- 包含所有产品的完整信息（名称、描述、亮点、链接、站点路径等）

## 参数说明

- `$ARGUMENTS` 支持以下命令：
  - `list`：列出当前所有产品信息
  - `add`：交互式添加新产品
  - `update <product-id>`：更新指定产品的信息
  - `sync`：将产品数据同步到所有文档站点（默认行为）
  - `--dry-run`：只预览变更，不实际修改文件

## 执行流程

### 命令：`list`

1. 读取 `products.json`
2. 以表格形式展示所有产品：

```
| ID | 名称 | 主题色 | 官网 | 文档站路径 |
```

### 命令：`add`

1. 读取当前 `products.json`
2. 使用 AskUserQuestion 交互式收集新产品信息：
   - 产品ID（英文，用于标识，如 `my-new-product`）
   - 产品名称
   - 图标 emoji
   - 一句话定位 (slogan)
   - 详细描述 (description)
   - 主题色 (blue/purple/green/orange)
   - 角标文字 (badge，可选)
   - 5个产品亮点
   - 操作按钮（名称+链接，至少1个）
   - 首页预览信息（标语颜色、短标语、一行摘要）
   - 文档站路径信息（docsPath、configPath等）
3. 将新产品追加到 `products.json`
4. 自动执行 `sync` 命令同步到所有站点

### 命令：`update <product-id>`

1. 读取 `products.json`，找到指定产品
2. 展示当前信息，询问用户要修改哪些字段
3. 更新 `products.json`
4. 自动执行 `sync` 命令同步到所有站点

### 命令：`sync`（默认）

这是核心同步逻辑。对每个产品的文档站点执行以下操作：

#### 第一步：读取产品数据

```bash
cat ".claude/skills/sync-products/products.json"
```

#### 第二步：对每个站点生成并更新文件

遍历 `products.json` 中的每个产品，以该产品的 `site.docsPath` 为目标站点：

**规则：每个站点的产品页面排除自身，只展示其他产品。**

对每个站点，执行以下操作：

##### 2a. 确保 AProductCard 组件存在

检查 `{docsPath}/{themePath}/components/AProductCard.vue` 是否存在：
- 如果不存在，从当前项目复制：
  ```
  源：D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/.vitepress/theme/components/AProductCard.vue
  目标：{docsPath}/{themePath}/components/AProductCard.vue
  ```

##### 2b. 确保 theme/index.ts 正确注册组件

检查 `{docsPath}/{themePath}/index.ts`：
- 如果不存在，创建标准的 theme/index.ts（extends DefaultTheme，注册 AProductCard，导入 style.css）
- 如果存在，检查是否已注册 AProductCard，没有则追加注册

##### 2c. 确保 style.css 包含卡片样式

检查 `{docsPath}/{stylePath}`：
- 如果不存在，创建包含 `.product-preview-card` 样式的文件
- 如果存在，检查是否已有 `.product-preview-card` 样式，没有则追加
- 确保包含 `text-decoration: none !important` 规则

##### 2d. 生成 products.md 页面

根据产品数据，为该站点生成 `{docsPath}/products.md`：

```markdown
# 更多产品

**抓蛙师出品** — 覆盖 AI 效率、全栈开发、智能编程、桌面应用等场景

---

<div class="products-grid">

{对每个排除自身的产品，生成 AProductCard 组件调用}

</div>

---

<div class="products-footer">
  <p>以上产品均由 <strong>抓蛙师</strong> 独立开发维护，如有合作意向或技术咨询，欢迎联系</p>
  <p>微信/QQ：<strong>770492966</strong> | 官网：<a href="https://ruoyi.plus" target="_blank">ruoyi.plus</a></p>
</div>

<style>
.products-grid { display: flex; flex-direction: column; gap: 24px; margin: 32px 0; }
.products-footer { text-align: center; padding: 32px 0 16px; color: var(--vp-c-text-2); font-size: 14px; }
.products-footer p { margin: 4px 0; }
.products-footer a { color: var(--vp-c-brand-1); text-decoration: none; }
.products-footer a:hover { text-decoration: underline; }
</style>
```

每个 AProductCard 的生成格式：
```markdown
<AProductCard
  icon="{product.icon}"
  name="{product.name}"
  slogan="{product.slogan}"
  description="{product.description}"
  theme="{product.theme}"
  {badge属性，仅在非空时添加}
  :highlights="[
    '{highlight1}',
    '{highlight2}',
    ...
  ]"
  :actions="[
    { text: '{action.text}', link: '{action.link}' },
    ...
  ]"
/>
```

##### 2e. 更新首页 index.md 中的产品预览区块

在首页中查找 `## 🎯 更多产品` 区块：
- 如果存在，替换该区块的内容（从 `## 🎯 更多产品` 到下一个 `##` 之前）
- 如果不存在，在页面底部合适位置插入

首页预览区块的生成格式：
```markdown
## 🎯 更多产品

抓蛙师出品，覆盖 AI 效率、全栈开发、智能编程、桌面应用等场景

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">

{对每个排除自身的产品，生成预览卡片}

</div>
```

每个预览卡片的格式：
```html
<a href="{product.actions[0].link}" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <div style="font-size: 40px; margin-bottom: 12px;">{product.icon}</div>
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">{product.name}</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: {product.preview.color}; font-weight: 500;">{product.preview.tagline}</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">{product.preview.summary}</p>
</a>
```

注意：如果排除自身后产品数量不是3的倍数，可以调整 grid 列数为 `repeat(auto-fit, minmax(250px, 1fr))`。

##### 2f. 确保导航栏包含"更多产品"链接

检查 `{docsPath}/{configPath}` 的 nav 数组：
- 如果已有 `更多产品` 链接，跳过
- 如果没有，在 nav 数组末尾添加 `{ text: '更多产品', link: '/products' }`

#### 第三步：输出同步报告

```markdown
## 🔄 产品矩阵同步完成

| 站点 | products.md | index.md | 导航栏 | 组件 |
|------|------------|----------|--------|------|
| {站点名} | ✅ 已更新 | ✅ 已更新 | ✅ 已有 | ✅ 已有 |
| ... | ... | ... | ... | ... |

**产品总数**: {N} 个
**同步站点**: {M} 个
**每个站点展示**: 排除自身的 {N-1} 个产品
```

## 注意事项

1. **排除自身**：每个站点的产品页面和首页预览都不显示自身产品
2. **UTF-8编码**：所有文件必须使用 UTF-8 无 BOM 编码
3. **不破坏现有功能**：更新 theme/index.ts 时保留已有的组件注册
4. **幂等操作**：多次执行 sync 结果一致，不会重复添加
5. **并行处理**：可以使用 Agent 工具并行处理多个站点的更新
6. **AProductCard 组件源**：始终以当前项目（ruoyi-plus-uniapp-docs）中的版本为准
