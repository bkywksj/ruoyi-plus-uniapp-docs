---
name: changelog-gen
description: 自动生成更新日志。当用户说"生成更新日志"、"changelog"、"版本记录"、"更新记录"时使用此技能。
argument-hint: "[版本号] [--since=<commit|date>]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# 更新日志生成技能

你是更新日志助手，负责从 Git 提交记录中提取有意义的变更，生成格式化的 changelog。

## 参数说明

- `$ARGUMENTS` 支持以下参数：
  - 无参数：从上次 tag 或最近 30 天的提交生成
  - `v1.2.0`：指定版本号
  - `--since=abc1234`：从指定 commit 开始
  - `--since=2026-03-01`：从指定日期开始
  - 可组合：`v1.2.0 --since=v1.1.0`

## 核心配置

- **文档项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs`
- **源码项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow`
- **Changelog 文件**: `docs/changelog.md`

## 执行流程

### 第一步：获取提交记录

```bash
cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && git log <起点>..HEAD --format="%H|%aI|%s|%an" --no-merges
```

同时获取源码项目的提交（如果需要包含源码变更）。

### 第二步：分类提交

按 Conventional Commits 规范分类：

| 前缀 | 分类 | 展示标题 |
|------|------|---------|
| `feat:` / `✨` | 新功能 | ✨ 新功能 |
| `fix:` / `🐛` | 修复 | 🐛 Bug 修复 |
| `docs:` / `📝` | 文档 | 📝 文档更新 |
| `perf:` / `⚡` | 性能 | ⚡ 性能优化 |
| `refactor:` / `♻️` | 重构 | ♻️ 代码重构 |
| `style:` / `💄` | 样式 | 💄 样式调整 |
| `chore:` / `🔧` | 杂务 | 🔧 其他 |
| `BREAKING CHANGE` | 破坏性变更 | ⚠️ 破坏性变更 |

无前缀的提交根据内容智能分类。

### 第三步：生成 Changelog

```markdown
# 更新日志

## [版本号] - 日期

### ⚠️ 破坏性变更

- 变更描述

### ✨ 新功能

- 功能描述 ([commit](link))

### 🐛 Bug 修复

- 修复描述

### 📝 文档更新

- 文档描述

### ⚡ 性能优化

- 优化描述

### ♻️ 代码重构

- 重构描述
```

### 第四步：更新 changelog.md

将新版本内容插入到 `docs/changelog.md` 的顶部（在已有内容之前）。

### 第五步：输出结果

```markdown
## Changelog 已生成

- **版本**: <版本号>
- **日期范围**: <起始日期> → <结束日期>
- **提交数**: N 个
- **分类统计**:
  - 新功能: N
  - 修复: N
  - 文档: N
  - 其他: N
- **文件**: `docs/changelog.md`
```

## 注意事项

1. **过滤无意义提交** — 跳过 merge commit、CI/CD 相关、格式化提交
2. **合并相关提交** — 同一功能的多次提交合并为一条记录
3. **保留已有内容** — 只在文件顶部插入，不覆盖历史记录
4. **破坏性变更置顶** — BREAKING CHANGE 始终放在最前面
