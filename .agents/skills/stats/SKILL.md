---
name: stats
description: |
  /stats - 文档覆盖率统计与健康报告（页数、行数、过短页、孤立页、过期页）

  参数：[模块]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /stats，或描述同类意图时，按本文流程执行。）

  触发词：/stats、stats
---

# /stats - 文档统计报告

## 参数
- `$ARGUMENTS`：`[模块名]`

## 执行步骤

1. **读取技能文件** `.claude/skills/doc-stats/SKILL.md`
2. **按技能指导执行**：扫描文件、统计各维度指标、对比进度清单
3. **输出统计报告**

## 示例
- `/stats` — 全站统计
- `/stats backend` — 后端文档统计
- `/stats mobile` — 移动端文档统计
