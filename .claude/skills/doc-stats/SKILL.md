---
name: doc-stats
description: 文档覆盖率统计与健康报告。当用户说"文档统计"、"覆盖率"、"文档状态"、"stats"时使用此技能。
argument-hint: "[模块名]"
allowed-tools: Read, Grep, Glob, Bash
---

# 文档统计技能

你是文档统计助手，负责生成文档覆盖率报告、健康度评估和趋势分析。

## 参数说明

- `$ARGUMENTS` 支持：
  - 无参数：全站统计
  - `backend`：只统计后端文档
  - `frontend`：只统计前端文档
  - `mobile`：只统计移动端文档
  - `practices`：只统计最佳实践

## 核心配置

- **文档根目录**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/`
- **进度文件**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/PROJECT_PROGRESS.md`

## 执行流程

### 第一步：扫描文档文件

```bash
# 统计各模块文件数
find "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/backend" -name "*.md" | wc -l
find "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/frontend" -name "*.md" | wc -l
find "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/mobile" -name "*.md" | wc -l
find "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/docs/practices" -name "*.md" | wc -l
```

### 第二步：统计各维度指标

对每个文档文件统计：

1. **行数** — `wc -l`
2. **字数** — 估算（中文字数 + 英文词数）
3. **代码块数** — 统计 ` ``` ` 出现次数 / 2
4. **表格数** — 统计 `|` 开头行的分组数
5. **图片数** — 统计 `![` 出现次数
6. **最后修改时间** — `git log -1 --format="%aI" -- <file>`

### 第三步：对比进度清单

读取 `PROJECT_PROGRESS.md`，对比：
- ✅ 已标记完成且文件存在
- ⚠️ 已标记完成但文件很短（可能是占位符）
- ❌ 标记未完成
- 🆕 文件存在但未在进度清单中

### 第四步：生成报告

```markdown
## 文档统计报告

**统计日期**: <当前日期>
**统计范围**: <全站|指定模块>

### 总览

| 指标 | 值 |
|------|-----|
| 文档总数 | N |
| 总行数 | N |
| 估算总字数 | ~N 万字 |
| 代码块总数 | N |
| 表格总数 | N |

### 模块分布

| 模块 | 文档数 | 行数 | 代码块 | 表格 |
|------|--------|------|--------|------|
| 后端 | N | N | N | N |
| 前端 | N | N | N | N |
| 移动端 | N | N | N | N |
| 最佳实践 | N | N | N | N |

### 完成度

| 模块 | 已完成 | 总计 | 完成率 |
|------|--------|------|--------|
| 后端 | N | N | 100% |
| 前端 | N | N | 100% |
| 移动端 | N | N | 100% |
| 最佳实践 | N | N | 100% |

### 质量指标

| 指标 | 值 | 评价 |
|------|-----|------|
| 平均文档长度 | N 行 | ★★★★☆ |
| 代码示例密度 | N 个/篇 | ★★★★★ |
| 表格使用率 | N% | ★★★★☆ |

### 最近更新

| 文件 | 最后修改 | 天数前 |
|------|---------|--------|
| `docs/xxx.md` | 2026-04-01 | 2 天 |
| ... | ... | ... |

### 需要关注

- 超过 90 天未更新的文档: N 个
- 内容少于 50 行的文档: N 个（可能是占位符）
```

## 注意事项

1. **字数为估算** — 中文按字符数，英文按空格分词
2. **git log 可能较慢** — 大量文件时分批执行
3. **占位符检测** — 少于 50 行的文档标记为可能的占位符
4. **不修改任何文件** — 纯只读统计
