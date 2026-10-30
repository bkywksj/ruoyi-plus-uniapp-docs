#!/usr/bin/env node
/**
 * Codex PreToolUse Hook - 工具执行前拦截
 *
 * 通用 shell 规则与 Claude 端共用 ../../.claude/hooks/lib/shell-rules.cjs（单一真相源，回归见 tests/unit/shell-rules.test.ts）；
 * 本文件额外保留 Codex 端特有的「Windows 绝对路径 + 删除动词」组合拦截。
 *
 * Codex stdin schema：
 *   { session_id, turn_id, tool_name, tool_use_id, tool_input, cwd, ... }
 *   - Bash / shell: tool_input.command（字符串）或 tool_input.argv（数组）
 *   - apply_patch: tool_input.input（unified diff 字符串，路径在 +++ 行）
 *
 * Codex 输出：
 *   - { hookSpecificOutput: { permissionDecision: 'deny', ... } } → 阻止（不可与旧格式 decision/reason 混用，否则 Codex 判为无效输出并放行）
 *   - { systemMessage } → 仅提示
 *   - {} → 放行
 */

const fs = require('fs');
const path = require('path');
const { analyzeShellCommand, sensitiveFileWarning } = require('../../.claude/hooks/lib/shell-rules.cjs');

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.stdout.write('{}');
  process.exit(0);
}

const toolName = input.tool_name || '';
const toolInput = input.tool_input || {};
const cwd = input.cwd || process.cwd();

const block = (reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
};

const warn = (message) => {
  process.stdout.write(JSON.stringify({ systemMessage: message }));
  process.exit(0);
};

if (toolName === 'Bash' || /^shell$/i.test(toolName)) {
  const command = toolInput.command || (Array.isArray(toolInput.argv) ? toolInput.argv.join(' ') : '');
  const shell = /\b(powershell|pwsh)(\.exe)?\b/i.test(command.split(/\s/)[0] || '') ? 'powershell' : 'bash';

  const result = analyzeShellCommand(command, { shell, cwd });
  if (result.action === 'block') block(result.reason);

  // Codex 端特有：命令里同时出现 Windows 绝对路径与删除动词就拦。
  // 之所以按「组合」判定：PowerShell 路径常先存进变量（$path = 'D:\...'），单看删除那一行识别不出路径。
  if (/[A-Za-z]:[\\/][^"'\s|;<>]+/.test(command)) {
    const deletePatterns = [
      { p: /Remove-Item\b/i, why: 'PowerShell Remove-Item 删除 Windows 绝对路径' },
      { p: /\b(rm|ri|erase|del)\b\s+[^|;\n]*[A-Za-z]:[\\/]/i, why: '删除 Windows 绝对路径' },
      { p: /\b(rd|rmdir)\b[^|;\n]*\/[sS]\b/i, why: 'cmd 递归删除 Windows 绝对路径' },
      { p: /\bdel\b[^|;\n]*\/[sSfF]\b/i, why: 'cmd 强制 / 递归删除 Windows 绝对路径' },
      { p: /\[\s*(System\.)?IO\.(File|Directory)\s*\]\s*::\s*Delete/i, why: '.NET API 删除 Windows 绝对路径' },
      { p: /\bNew-Object\s+(System\.)?IO\.(FileInfo|DirectoryInfo)\b/i, why: '.NET FileInfo / DirectoryInfo 删除 Windows 绝对路径' },
      { p: /Microsoft\.VisualBasic\.FileIO\.FileSystem.*Delete(File|Directory)/i, why: 'VisualBasic FileSystem 删除 Windows 绝对路径' },
      { p: /\b(Invoke-Expression|iex)\b/i, why: '间接执行（Invoke-Expression）+ Windows 绝对路径，无法静态审计' },
      { p: /\brobocopy\b[^|;\n]*\/(mir|purge)\b/i, why: 'robocopy MIR / PURGE 镜像删除 Windows 绝对路径' },
      { p: /\bClear-Content\b/i, why: 'Clear-Content 清空 Windows 绝对路径文件' },
    ];
    for (const { p, why } of deletePatterns) {
      if (p.test(command)) block(`⚠️ 危险操作被阻止\n\n命令: \`${command}\`\n原因: ${why}\n\n如确需执行，请用户在终端手动运行`);
    }
  }

  // Codex 端没有「改写命令」的输出协议：需要改写的情况（PowerShell 2>&1）只提示
  if (result.action === 'rewrite' || result.action === 'warn') warn(result.message);
}

if (/^(apply_patch|Edit|Write)$/i.test(toolName)) {
  const filePath = toolInput.file_path || '';
  const patchText = toolInput.input || toolInput.patch || '';
  const patchedFiles = [...patchText.matchAll(/^\+\+\+ (?:b\/)?(.+)$/gm)].map((match) => match[1].trim());
  const warning = [filePath, ...patchedFiles]
    .filter(Boolean)
    .map((file) => sensitiveFileWarning(path.normalize(file)))
    .find(Boolean);
  if (warning) warn(warning);
}

process.stdout.write('{}');
process.exit(0);
