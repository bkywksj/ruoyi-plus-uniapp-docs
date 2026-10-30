// SessionStart hook 回归：注入内容、选最新摘要、长度预算、触发来源与输出结构
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const HOOK = resolve('.claude/hooks/session-start.cjs');
const { buildSessionContext, MAX_TOTAL, MAX_PROJECT } = require(HOOK) as {
  buildSessionContext: (root: string, options?: { maxTotal?: number; maxProject?: number }) => string;
  MAX_TOTAL: number;
  MAX_PROJECT: number;
};

let root: string;

/** 在临时项目根下写文件（自动建目录） */
function put(rel: string, content: string) {
  const full = join(root, rel);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, content, 'utf8');
}

/** 以子进程方式运行 hook，模拟 Claude Code 调用 */
function runHook(stdin: string, env: Record<string, string | undefined> = {}) {
  const childEnv: NodeJS.ProcessEnv = { ...process.env, CLAUDE_PROJECT_DIR: undefined, ...env };
  return spawnSync(process.execPath, [HOOK], { input: stdin, encoding: 'utf8', env: childEnv });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'session-start-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('buildSessionContext', () => {
  it('没有 PROJECT.md 也没有经验摘要时返回空串', () => {
    expect(buildSessionContext(root)).toBe('');
  });

  it('PROJECT.md 在前、经验摘要在后', () => {
    put('.claude/PROJECT.md', '# PROJECT\n- 禁令 A');
    put('.claude/docs/experience/2026-10/2026-10-01-exp-summary.md', '摘要内容 B');
    const context = buildSessionContext(root);
    expect(context.indexOf('禁令 A')).toBeGreaterThanOrEqual(0);
    expect(context.indexOf('禁令 A')).toBeLessThan(context.indexOf('摘要内容 B'));
    expect(context).toContain('2026-10/2026-10-01-exp-summary.md');
  });

  it('跨月目录也选最新一份摘要', () => {
    put('.claude/docs/experience/2026-09/2026-09-30-exp-summary.md', '九月');
    put('.claude/docs/experience/2026-10/2026-10-02-exp-summary.md', '十月新');
    put('.claude/docs/experience/2026-10/2026-10-01-exp-summary.md', '十月旧');
    put('.claude/docs/experience/2026-10/notes.md', '不是摘要');
    const context = buildSessionContext(root);
    expect(context).toContain('十月新');
    expect(context).not.toContain('十月旧');
    expect(context).not.toContain('九月');
  });

  it('超长时总长度不超过上限，并注明完整内容所在文件', () => {
    put('.claude/PROJECT.md', '规'.repeat(20_000));
    put('.claude/docs/experience/2026-10/2026-10-01-exp-summary.md', '经'.repeat(20_000));
    const context = buildSessionContext(root);
    expect(context.length).toBeLessThanOrEqual(MAX_TOTAL);
    expect(context).toContain('完整内容见 .claude/PROJECT.md');
    expect(context).toContain('完整内容见 .claude/docs/experience/2026-10/2026-10-01-exp-summary.md');
  });

  it('没有经验摘要时 PROJECT.md 用满整份预算', () => {
    put('.claude/PROJECT.md', '规'.repeat(20_000));
    const context = buildSessionContext(root);
    expect(context.length).toBeGreaterThan(MAX_PROJECT);
    expect(context.length).toBeLessThanOrEqual(MAX_TOTAL);
  });

  it('PROJECT.md 占满预算时，摘要退化为只给出处', () => {
    put('.claude/PROJECT.md', '规'.repeat(20_000));
    put('.claude/docs/experience/2026-10/2026-10-01-exp-summary.md', '经验');
    const context = buildSessionContext(root, { maxTotal: 1000, maxProject: 900 });
    expect(context.length).toBeLessThanOrEqual(1000);
    expect(context).toContain('本次注入额度已用完');
    expect(context).not.toContain('经验\n');
  });
});

describe('hook 进程', () => {
  it.each(['startup', 'clear', 'compact'])('source=%s 输出 hookSpecificOutput 结构', (source) => {
    put('.claude/PROJECT.md', '- 禁令 A');
    const result = runHook(JSON.stringify({ hook_event_name: 'SessionStart', source, cwd: root }));
    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.hookSpecificOutput.hookEventName).toBe('SessionStart');
    expect(output.hookSpecificOutput.additionalContext).toContain('禁令 A');
  });

  it.each(['resume', 'fork'])('source=%s 不注入', (source) => {
    put('.claude/PROJECT.md', '- 禁令 A');
    const result = runHook(JSON.stringify({ source, cwd: root }));
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('stdin 不是合法 JSON 时不输出、退出码 0', () => {
    put('.claude/PROJECT.md', '- 禁令 A');
    const result = runHook('not json');
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('没有可注入内容时不输出', () => {
    const result = runHook(JSON.stringify({ source: 'startup', cwd: root }));
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('优先用 CLAUDE_PROJECT_DIR 定位项目根（会话中途 cd 进子目录后压缩）', () => {
    put('.claude/PROJECT.md', '- 禁令 A');
    mkdirSync(join(root, 'src'), { recursive: true });
    const result = runHook(JSON.stringify({ source: 'compact', cwd: join(root, 'src') }), {
      CLAUDE_PROJECT_DIR: root,
    });
    expect(JSON.parse(result.stdout).hookSpecificOutput.additionalContext).toContain('禁令 A');
  });

  it('接近上限的输出完整写出（没有被 exit 截断）', () => {
    put('.claude/PROJECT.md', '规'.repeat(20_000));
    put('.claude/docs/experience/2026-10/2026-10-01-exp-summary.md', '经'.repeat(20_000));
    const result = runHook(JSON.stringify({ source: 'startup', cwd: root }));
    expect(() => JSON.parse(result.stdout)).not.toThrow();
  });
});
