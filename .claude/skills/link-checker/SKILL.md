---
name: link-checker
description: 全站死链检测与修复。当用户说"检查链接"、"死链"、"链接检查"、"broken link"时使用此技能。
argument-hint: "[目录路径] [--fix]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# 死链检测技能

你是链接检查助手，负责扫描文档站点中的所有内部链接，检测死链并提供修复建议。

## 参数说明

- `$ARGUMENTS` 支持以下参数：
  - 无参数：扫描全站
  - `backend/`：只扫描后端文档
  - `frontend/`：只扫描前端文档
  - `mobile/`：只扫描移动端文档
  - `--fix`：自动修复可修复的死链
  - 可组合：`mobile/ --fix`

## 核心配置

- **文档根目录**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/`
- **VitePress 配置**: `docs/.vitepress/config.ts`

## 执行流程

### 第一步：扫描所有 Markdown 文件

```bash
find "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/<范围>" -name "*.md" -type f
```

### 第二步：提取链接

从每个 `.md` 文件中提取以下类型的链接：

1. **Markdown 链接**: `[text](path)`
2. **VitePress 链接**: `[text](/absolute/path)`
3. **图片引用**: `![alt](path)`
4. **HTML 链接**: `<a href="path">`（如有）

排除外部链接（http:// 或 https:// 开头）。

### 第三步：验证每个链接

对每个内部链接：

1. 解析为绝对路径（相对链接基于当前文件位置解析）
2. 检查目标文件是否存在
3. 如果链接包含锚点（`#section`），检查目标文件中是否有对应标题
4. 记录结果：✅ 有效 / ❌ 文件不存在 / ⚠️ 锚点不存在

### 第四步：检查侧边栏链接

读取 `config.ts` 中所有 `link` 字段，验证对应文件是否存在。

### 第五步：输出报告

```markdown
## 链接检查报告

**扫描范围**: <全站|指定目录>
**扫描文件**: N 个
**检查链接**: N 个

### ❌ 死链 (N个)

| 所在文件 | 行号 | 链接 | 问题 |
|----------|------|------|------|
| `docs/backend/xxx.md` | 42 | `[text](path)` | 目标文件不存在 |

### ⚠️ 锚点失效 (N个)

| 所在文件 | 行号 | 链接 | 问题 |
|----------|------|------|------|
| `docs/frontend/xxx.md` | 15 | `[text](path#anchor)` | 锚点不存在 |

### ✅ 总结

- 有效链接: N 个
- 死链: N 个
- 锚点失效: N 个
```

### 第六步：自动修复（--fix 模式）

如果传入 `--fix` 参数：

1. **文件已移动** — 搜索同名文件的新位置，替换路径
2. **文件已重命名** — 基于文件内容相似度匹配，建议替换
3. **锚点变更** — 搜索目标文件中最相似的标题，替换锚点
4. **无法修复** — 标记为需人工处理

修复后再次扫描验证。

## 注意事项

1. **VitePress 路径规则** — link 不带 `.md` 后缀，但实际文件有 `.md`
2. **index.md 特殊处理** — `/backend/` 实际指向 `/backend/index.md`
3. **锚点格式** — VitePress 将标题转为 kebab-case 作为锚点 ID
4. **不检查外部链接** — 仅检查站内链接，外部链接可能超时
5. **大量死链时分批修复** — 避免一次性修改过多文件
