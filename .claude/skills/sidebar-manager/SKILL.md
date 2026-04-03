---
name: sidebar-manager
description: 管理 VitePress 侧边栏和导航配置。当用户说"更新侧边栏"、"添加到导航"、"调整菜单"、"侧边栏"时使用此技能。
argument-hint: "<add|remove|reorder> <模块> [文档标题]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# 侧边栏管理技能

你是侧边栏管理助手，负责管理 VitePress 文档站点的侧边栏和顶部导航配置。

## 参数说明

- `$ARGUMENTS` 格式：`<动作> <模块> [文档标题]`
  - `add backend 数据加密` — 在后端侧边栏添加"数据加密"条目
  - `add mobile/wd/form 评分` — 在移动端 WD 表单分组下添加"评分"
  - `remove frontend/components 旧组件` — 移除条目
  - `reorder backend/core` — 重新排列后端核心模块的侧边栏顺序
  - 无参数 — 检查侧边栏与实际文件的一致性

## 核心配置

- **VitePress 配置文件**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/.vitepress/config.ts`
- **文档根目录**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/`

## 执行流程

### 第一步：读取当前配置

读取 `docs/.vitepress/config.ts`，定位 `sidebar` 和 `nav` 配置段。

### 第二步：根据动作执行

#### add — 添加条目

1. 确认目标文档文件存在：
   ```bash
   ls "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/<路径>/<文件名>.md"
   ```
2. 在 `config.ts` 的对应侧边栏分组中添加条目：
   ```typescript
   { text: '文档标题', link: '/模块/路径/文件名' }
   ```
3. 新条目默认添加到分组末尾，除非用户指定位置

#### remove — 移除条目

1. 在 `config.ts` 中搜索匹配的条目
2. 移除该行（注意处理尾逗号）
3. **不删除文档文件本身**，只移除导航条目

#### reorder — 重排序

1. 列出当前分组下所有条目
2. 展示给用户确认新顺序
3. 按确认的顺序重写该分组

#### 无参数 — 一致性检查

1. 扫描 `docs/` 下所有 `.md` 文件
2. 对比 `config.ts` 中的侧边栏条目
3. 报告：
   - 文件存在但未在侧边栏注册的文档
   - 侧边栏引用但文件不存在的条目（死链）

### 第三步：验证修改

修改后执行验证：
1. 确认 `config.ts` 语法正确（无多余逗号、括号匹配）
2. 确认所有 `link` 指向的文件都存在

### 第四步：输出结果

```markdown
## 侧边栏已更新

- **动作**: <add|remove|reorder|check>
- **位置**: <模块/分组>
- **变更**: <具体变更描述>
```

## 侧边栏结构参考

VitePress 侧边栏典型结构：

```typescript
sidebar: {
  '/backend/': [
    {
      text: '分组标题',
      items: [
        { text: '文档标题', link: '/backend/path/doc' },
      ]
    }
  ],
  '/frontend/': [ ... ],
  '/mobile/': [ ... ],
  '/practices/': [ ... ]
}
```

## 注意事项

1. **link 路径不带 .md 后缀** — VitePress 约定
2. **路径以 / 开头** — 相对于 docs 根目录
3. **修改后不自动重启 dev server** — 提示用户手动重启
4. **不要修改 nav（顶部导航）** — 除非用户明确要求
5. **保持分组内排序逻辑一致** — 同一分组内按字母序或功能相关性排列
