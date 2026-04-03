# /sidebar - 侧边栏管理

## 参数
- `$ARGUMENTS`：`<add|remove|reorder> <模块> [文档标题]`

## 执行步骤

1. **读取技能文件** `.claude/skills/sidebar-manager/SKILL.md`
2. **按技能指导执行**：读取 config.ts，执行添加/移除/重排/一致性检查
3. **输出变更结果**

## 示例
- `/sidebar` — 检查侧边栏与文件的一致性
- `/sidebar add backend 数据加密` — 添加条目
- `/sidebar remove frontend/components 旧组件` — 移除条目
- `/sidebar reorder mobile/wd/form` — 重排分组
