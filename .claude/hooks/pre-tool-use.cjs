#!/usr/bin/env node
/**
 * PreToolUse Hook - 工具使用前触发（Claude Code）
 * 规则本体在 ./lib/shell-rules.cjs（与 .codex/hooks/pre-tool-use.cjs 共用），这里只做输入解析与输出协议：
 *   - 拦截：{ decision: 'block', reason }
 *   - 改写：hookSpecificOutput.updatedInput（静默改写命令，如摘掉 PowerShell 的 2>&1）
 *   - 提醒：{ continue: true, systemMessage }
 * 规则回归见 tests/unit/shell-rules.test.ts。
 */

const fs = require('fs');
const path = require('path');
const { analyzeShellCommand, sensitiveFileWarning } = require('./lib/shell-rules.cjs');

const allow = () => {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
};

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  allow();
}

const toolName = input.tool_name;
const toolInput = input.tool_input || {};
const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

if (toolName === 'Bash' || toolName === 'PowerShell') {
  const result = analyzeShellCommand(toolInput.command || '', {
    shell: toolName === 'PowerShell' ? 'powershell' : 'bash',
    cwd,
  });
  if (result.action === 'block') {
    console.log(JSON.stringify({ decision: 'block', reason: result.reason }));
    process.exit(0);
  }
  if (result.action === 'rewrite') {
    console.log(
      JSON.stringify({
        systemMessage: result.message,
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          updatedInput: Object.assign({}, toolInput, { command: result.command }),
        },
      }),
    );
    process.exit(0);
  }
  if (result.action === 'warn') {
    console.log(JSON.stringify({ continue: true, systemMessage: result.message }));
    process.exit(0);
  }
}

if (toolName === 'Write') {
  const warning = sensitiveFileWarning(path.normalize(toolInput.file_path || ''));
  if (warning) {
    console.log(JSON.stringify({ continue: true, systemMessage: warning }));
    process.exit(0);
  }
}

allow();
