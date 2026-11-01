---
name: review
description: |
  /review - 审查文档质量：对照源码查准确性、规范性、完整性

  参数：<文档路径或目录>

  （Claude Code 斜杠命令的 Codex 版：用户输入 /review，或描述同类意图时，按本文流程执行。）

  触发词：/review、review
---

# /review - 文档质量审查

## 参数
- `$ARGUMENTS`：`[目录或文件路径] [--strict]`

## 执行步骤

1. **读取技能文件** `.claude/skills/doc-review/SKILL.md`
2. **按技能指导执行**：格式规范检查、内容准确性检查、完整性检查
3. **输出审查报告与评分**

## 示例
- `/review` — 审查最近修改的文档
- `/review backend/common/redis/` — 审查指定目录
- `/review src/content/docs/frontend/components/table.md` — 审查指定文件
- `/review --strict` — 严格模式审查
