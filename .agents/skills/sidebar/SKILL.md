---
name: sidebar
description: |
  /sidebar - 管理侧栏 src/data/sidebar.json：添加 / 移除 / 重排条目，或检查侧栏与文件是否一致

  参数：<add|remove|reorder> <模块> [标题]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /sidebar，或描述同类意图时，按本文流程执行。）

  触发词：/sidebar、sidebar
---

# /sidebar - 侧边栏管理

## 参数
- `$ARGUMENTS`：`<add|remove|reorder> <模块> [文档标题]`

## 执行步骤

1. **读取技能文件** `.claude/skills/sidebar-manager/SKILL.md`
2. **按技能指导执行**：读取 src/data/sidebar.json，执行添加/移除/重排/一致性检查
3. **输出变更结果**

## 示例
- `/sidebar` — 检查侧边栏与文件的一致性
- `/sidebar add backend 数据加密` — 添加条目
- `/sidebar remove frontend/components 旧组件` — 移除条目
- `/sidebar reorder mobile/wd/form` — 重排分组
