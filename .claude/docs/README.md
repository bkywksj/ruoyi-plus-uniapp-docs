# .claude/docs — 框架内部文档

| 目录 / 文件 | 内容 | 谁来写 |
|------------|------|-------|
| `AI使用指南.md` | 面向使用者的一页纸：怎么开始、20 个命令、40 个技能、两种起飞方式、常见问题 | 框架维护者 |
| `新项目开发流程.md` | 从一句话想法到上线的完整链路与各环节产物 | 框架维护者 |
| `experience/YYYY-MM/` | `/exp` 沉淀的经验，按月份分目录：`YYYY-MM-DD-exp-summary.md` 是会话开始时要读的摘要（取最近一份），`YYYY-MM-DD-<摘要>.md` 是单篇最佳实践 | `/exp` 命令 |
| `experience/review-reports/` | `/exp review` 的盘点报告（`YYYY-QN-audit.md`） | `/exp review` |
| `experience/feedback-to-framework.md` | 仅孵化项目：值得反哺给框架的通用经验，回框架仓库跑 `/exp review` 时决定是否合并 | `/exp`（子项目模式） |

> 与 `docs/` 的区别：`docs/` 放**项目**的真相源（需求 / 原型 / 任务台账 / 状态 / BLOCKERS）；`.claude/docs/` 放 **AI 协作**用的内部资料。
> 生成交付副本（`/sync-delivery`）时两者都**整体剥离**：`.claude/` 与 `docs/` 都在默认排除清单里，交付物的说明文档来自项目的 `delivery/README.md`、`delivery/DEPLOY.md`。
