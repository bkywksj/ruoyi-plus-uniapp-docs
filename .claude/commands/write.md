# /write - 撰写新文档

## 参数
- `$ARGUMENTS`：`<模块/路径> [标题]`

## 执行步骤

1. **读取技能文件** `.claude/skills/doc-writer/SKILL.md`
2. **按技能指导执行**：根据路径判断文档类型，读取规范，查阅源码，按模板撰写
3. **输出文档文件路径**

## 示例
- `/write backend/common/新模块 数据加密` — 后端模块文档
- `/write frontend/components/新组件` — 前端组件文档
- `/write practices/security/新实践` — 最佳实践文档
