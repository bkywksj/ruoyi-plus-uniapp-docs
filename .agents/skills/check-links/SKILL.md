---
name: check-links
description: |
  /check-links - 全站死链与失效锚点检查（构建后跑 check:seo 与 check-anchors），可加 --fix 修复

  参数：[目录] [--fix]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /check-links，或描述同类意图时，按本文流程执行。）

  触发词：/check-links、check-links
---

# /check-links - 死链检测

## 参数
- `$ARGUMENTS`：`[目录路径] [--fix]`

## 执行步骤

1. **读取技能文件** `.claude/skills/link-checker/SKILL.md`
2. **按技能指导执行**：扫描 Markdown 链接，验证目标文件存在，检查锚点有效性
3. **输出检查报告**

## 示例
- `/check-links` — 全站死链扫描
- `/check-links mobile/` — 只扫描移动端文档
- `/check-links --fix` — 扫描并自动修复
- `/check-links frontend/ --fix` — 扫描前端文档并修复
