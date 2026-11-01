#!/usr/bin/env node
// UserPromptSubmit Hook - 强制技能评估
// 每次用户提问时注入技能清单，要求模型先评估、再激活、后实现（技能激活率从约 25% 提升到 90% 以上）。
// 🔴 技能清单必须与 .claude/skills/ 目录一一对应：新增/删除技能后同步修改 SKILL_GROUPS，
//    `pnpm check:skills` 会校验两边是否一致（它 require 本文件读取 SKILLS，所以 stdin 逻辑只在直接执行时运行）。
// 触发词不在本文件手写：运行时从各 SKILL.md 的 description「触发词：」段读取。
//    那段文字也是 Claude Code 技能列表里显示的内容，两处曾各写一份、演练时实测已经对不上
//    （description 有 iframe / VideoObject，注入清单里没有），所以只留 SKILL.md 这一个来源。

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

// 按「流程 → Astro 开发 → SEO → 质量 → 发布 → 协作」分组，便于模型扫读
const SKILL_GROUPS = [
  ['流程与规划', ['brainstorm', 'tech-decision', 'writing-plans', 'task-tracker', 'project-init', 'vitepress-migration', 'project-navigator', 'architecture-design', 'code-patterns']],
  ['Astro 开发', ['astro-routing', 'content-collections', 'guides-docs', 'data-sync', 'islands-interaction', 'ui-components', 'design-system', 'motion-transitions', 'image-optimization', 'site-search', 'icon-management', 'i18n-development', 'html-to-code']],
  ['SEO / GEO / 统计', ['seo-meta', 'geo-optimization', 'analytics']],
  ['质量', ['bug-detective', 'test-development', 'e2e-test', 'performance-doctor', 'security-guard']],
  ['环境与发布', ['dev-startup', 'env-config', 'deployment-guide', 'git-workflow', 'framework-sync', 'delivery-sync', 'module-strip']],
  ['经验与协作', ['exp-sediment', 'add-skill', 'collaborating-with-codex', 'collaborating-with-gemini', 'collaborating-with-antigravity']],
  // 本站（RuoYi-Plus-UniApp 文档）专属：从旧 VitePress 仓库 .claude 迁来并改写成 Astro 路径
  ['文档内容（本站）', ['doc-writer', 'component-doc', 'doc-review', 'doc-search', 'doc-stats', 'update-docs', 'changelog-gen', 'version-migrate', 'sidebar-manager', 'link-checker', 'preview-server', 'sync-products', 'edgeone-deploy']],
];

// 点名才激活的协同技能：触发词前加限定语，防止「代码审查」「多模型」「UI 设计」这类泛词把它们带出来
const GUARDS = {
  'collaborating-with-codex': '仅当用户点名"Codex"时（未点名的代码审查、多模型不算）—— ',
  'collaborating-with-gemini': '仅当用户点名"Gemini"时（未点名的 UI 设计、前端原型不算）—— ',
  'collaborating-with-antigravity': '仅当用户点名"Antigravity / 反重力 / agy"时（未点名的多模型、交叉验证不算）—— ',
};

// 用户没键入命令时也可以照命令文档的流程做（例如一次做完一个功能 → 按 /dev 的步骤）
const FLOW_COMMANDS = '/dev 开发功能、/collection 新增内容类型、/check 规范检查、/seo-check 上线前 SEO 验收、/sync-data 数据同步、/deploy 部署、/exp 沉淀经验、/next 下一步建议';

/**
 * 读取 description 里「触发词：」之后的部分，「、」换成「/」。
 * 先找技能，再找同名命令（少数希望参与自动评估的命令也可以登记进 SKILL_GROUPS，description 同样要带触发词段）。
 * @returns 文件不存在或没有触发词段时返回空串（check:skills 会把空串报成错误）
 */
function readTriggers(name) {
  for (const file of [path.join(SKILLS_DIR, name, 'SKILL.md'), path.join(COMMANDS_DIR, `${name}.md`)]) {
    if (!fs.existsSync(file)) continue;
    const description = (fs.readFileSync(file, 'utf8').match(/^description:\s*(.*)$/m) || [])[1] || '';
    const triggers = description.split('触发词：')[1];
    return triggers ? triggers.trim().split(/\s*、\s*/).join('/') : '';
  }
  return '';
}

/** [技能名, 触发词]，顺序即注入顺序；validate-skills 与 sync-agents-skills 也读它 */
const SKILLS = SKILL_GROUPS.flatMap(([, names]) => names).map((name) => [name, (GUARDS[name] || '') + readTriggers(name)]);

function buildInstructions() {
  return `## 强制技能激活流程（必须执行）

### 步骤 1 - 评估（必须在响应中明确展示）

针对用户问题，列出匹配的技能：\`技能名: 理由\`，无匹配则写"无匹配技能"

可用技能：
${SKILLS.map(([name, triggers]) => `- ${name}: ${triggers}`).join('\n')}

相关流程命令（用户没键入时，也可以读 .claude/commands/<名>.md 按其步骤执行）：${FLOW_COMMANDS}

### 步骤 2 - 激活
对每个匹配的技能逐个激活：一次激活一个，等它返回后再激活下一个（不要一次性批量激活）。无匹配则跳过本步。

### 步骤 3 - 实现
所有匹配技能激活完成后，再开始动手实现。

要点：先评估 → 再激活 → 后实现；不要跳过激活直接实现，也不要漏掉匹配的技能。`;
}

// Claude Code 内置命令（不在项目 commands 目录里，但同样是明确意图）
const BUILTIN_COMMANDS = new Set([
  'loop', 'init', 'clear', 'compact', 'config', 'help', 'model', 'review', 'mcp', 'memory', 'cost',
  'doctor', 'status', 'resume', 'agents', 'hooks', 'permissions', 'context', 'exit', 'login', 'logout',
]);

/** /xxx 是不是一个真实存在的命令：项目命令、用户级命令、技能、插件命令（含冒号）、内置命令 */
function isKnownCommand(name, projectDir) {
  if (name.includes(':') || BUILTIN_COMMANDS.has(name)) return true;
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const candidates = [
    path.join(projectDir, '.claude', 'commands', `${name}.md`),
    path.join(projectDir, '.claude', 'skills', name, 'SKILL.md'),
    home && path.join(home, '.claude', 'commands', `${name}.md`),
    home && path.join(home, '.claude', 'skills', name, 'SKILL.md'),
  ].filter(Boolean);
  return candidates.some((file) => fs.existsSync(file));
}

function main() {
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return;
  }
  const prompt = (input.prompt || '').trim();
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

  // 恢复会话（上下文压缩后续跑）不注入，防止上下文溢出死循环。
  // 只认系统续跑消息里的固定句子，不用「context window」这种用户正常聊天也会说的词
  const skipPatterns = ['session is being continued from a previous conversation', 'conversation compacted'];
  if (skipPatterns.some((pattern) => prompt.toLowerCase().includes(pattern))) return;

  // 斜杠命令本身就是明确意图：只有真实存在的命令才跳过（`/about 页面描述重复了` 这类提到路径的普通提问照常评估）
  const firstToken = prompt.split(/\s/)[0];
  const slash = firstToken.match(/^\/([^/\s]+)$/);
  const isSlashCommand = Boolean(slash && isKnownCommand(slash[1], projectDir));
  const isExpandedCommand = /<command-name>/.test(prompt);
  if (isSlashCommand || isExpandedCommand) return;

  // 智码编排系统的唤醒通知不是用户提问，是总控会话的调度信号；后台任务通知同理。
  // 长回执会被 CLI 包进 <pasted_content id="…">（本机总控会话里约三分之一的回执是这样），先剥掉外壳再认；
  // 通知只认开头，别把正文里引用了一段通知原文的普通提问也跳过
  const unwrapped = prompt.replace(/^(?:<pasted_content[^>]*>\s*)+/, '');
  if (unwrapped.startsWith('[AGENT-EVENT]') || unwrapped.startsWith('<task-notification>')) return;

  console.log(buildInstructions());
}

if (require.main === module) {
  main();
  process.exit(0);
}

module.exports = { SKILLS, buildInstructions };
