#!/usr/bin/env node
/**
 * UserPromptSubmit Hook - 强制技能评估 (文档项目版本)
 * 功能: 在用户提交提示时，自动评估并激活匹配的技能
 */

const fs = require('fs');

// 从 stdin 读取用户输入
let inputData = '';
try {
  inputData = fs.readFileSync(0, 'utf8');
} catch {
  process.exit(0);
}

let input;
try {
  input = JSON.parse(inputData);
} catch {
  process.exit(0);
}

const prompt = (input.prompt || '').trim();

// 检测是否是恢复会话（防止上下文溢出死循环）
const skipPatterns = [
  'continued from a previous conversation',
  'ran out of context',
  'No code restore',
  'Conversation compacted',
  'commands restored',
  'context window',
  'session is being continued'
];

const isRecoverySession = skipPatterns.some(pattern =>
  prompt.toLowerCase().includes(pattern.toLowerCase())
);

if (isRecoverySession) {
  process.exit(0);
}

// 检测是否是斜杠命令
const isSlashCommand = /^\/[^\/\s]+$/.test(prompt.split(/\s/)[0]);

if (isSlashCommand) {
  process.exit(0);
}

const instructions = `## 强制技能激活流程（必须执行）

### 步骤 1 - 评估（必须在响应中明确展示）

针对用户问题，列出匹配的技能：\`技能名: 理由\`，无匹配则写"无匹配技能"

可用技能：
- deploy: 部署/开始部署/发布/上线/打包发布/构建部署
- update-docs: 更新文档/同步文档/检查文档是否需要更新
- doc-writer: 写文档/新建文档/添加文档/写一篇文档/撰写文档
- sidebar-manager: 侧边栏/更新侧边栏/添加到导航/调整菜单/导航配置
- link-checker: 检查链接/死链/链接检查/broken link/链接扫描
- doc-review: 审查文档/检查文档质量/review/文档审查/质量检查
- component-doc: 写组件文档/WD组件/组件文档/wd-/WD UI
- changelog-gen: 更新日志/changelog/版本记录/更新记录/release notes
- doc-search: 搜索文档/哪些文档提到/查找文档/文档搜索/引用分析
- doc-stats: 文档统计/覆盖率/文档状态/stats/文档报告/健康报告
- version-migrate: 版本升级/迁移文档/升级指南/版本变更/依赖升级
- preview-server: 预览/启动预览/本地预览/dev server/构建/build

### 步骤 2 - 激活（逐个调用，等待每个完成）

⚠️ **必须逐个调用 Skill() 工具，每次调用后等待返回再调用下一个**
- 有 N 个匹配技能 → 逐个发起 N 次 Skill() 调用（不要并行！）
- 无匹配技能 → 写"无匹配技能"

### 步骤 3 - 实现

只有在步骤 2 的所有 Skill() 调用完成后，才能开始实现。

---

**关键规则（违反将导致任务失败）**：
1. ⛔ 禁止：评估后跳过 Skill() 直接实现
2. ⛔ 禁止：只调用部分技能（必须全部调用）
3. ⛔ 禁止：并行调用多个 Skill()（必须串行，一个一个来）
4. ✅ 正确：评估 → 逐个调用 Skill() → 全部完成后实现`;

console.log(instructions);
process.exit(0);
