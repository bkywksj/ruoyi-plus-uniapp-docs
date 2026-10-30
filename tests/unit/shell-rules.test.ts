// pre-tool-use hook 规则回归：拦该拦的，放该放的（审查中实测过的误拦 / 漏拦场景都在这里）
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { analyzeShellCommand } = require('../../.claude/hooks/lib/shell-rules.cjs') as {
  analyzeShellCommand: (
    command: string,
    options?: { shell?: 'bash' | 'powershell'; cwd?: string },
  ) => {
    action: string;
    reason?: string;
    command?: string;
  };
};

const action = (command: string, shell: 'bash' | 'powershell' = 'bash') =>
  analyzeShellCommand(command, { shell }).action;
const longBody = Array.from({ length: 20 }, (_, i) => `print(${i})`).join('\n');

describe('应当拦截', () => {
  it.each([
    ['cat /tmp/a.txt'],
    ['echo x > /tmp/a.txt'],
    ['python gen.py >/tmp/out.json'],
    ['ls > nul'],
    ['echo hi 2>nul'],
    ['TZ=Asia/Shanghai date "+%F"'],
    ['git push'],
    ['git push origin master'],
    ['git -C some/dir fetch --all'],
    ['git clone https://github.com/a/b.git'],
    ['printf "host=x\\n" | git credential fill'],
    ['git add -A'],
    ['git add .'],
    ['git stash'],
    ['git reset --hard HEAD'],
    ['git clean -fd'],
    ['git checkout -- src/a.ts'],
    ['taskkill /F /IM node.exe'],
    ['rm -rf "D:/work/proj"'],
    [`python - <<'PY'\n${longBody}\nPY`],
  ])('%s', (command) => {
    expect(action(command)).toBe('block');
  });

  it.each([
    ['Stop-Process -Name node -Force'],
    ['Get-Process node | Stop-Process'],
    ['taskkill /IM pwsh.exe /F'],
  ])('PowerShell：%s', (command) => {
    expect(action(command, 'powershell')).toBe('block');
  });

  // 两种 heredoc 的正确做法不同，提示要对得上（演练里 cat >> 测试文件被提示「落成文件再执行」，答非所问）
  it('喂给解释器的长脚本：提示落成文件再执行', () => {
    const result = analyzeShellCommand(`python - <<'PY'\n${longBody}\nPY`);
    expect(result.reason).toMatch(/内联长脚本/);
  });
  it('cat >> 源码文件：提示改用 Edit / Write', () => {
    const result = analyzeShellCommand(`cat >> tests/unit/seo.test.ts <<'EOF'\n${longBody}\nEOF`);
    expect(result.action).toBe('block');
    expect(result.reason).toMatch(/Edit/);
    expect(result.reason).not.toMatch(/再执行该文件/);
  });
});

describe('应当放行（此前误拦的场景）', () => {
  it.each([
    ['git commit -m "docs: 禁止 /tmp/ 中转目录"'],
    ['grep -rn "/tmp/" scripts --include=*.mjs'],
    ['git commit -m "fix: 不再使用 > nul 重定向"'],
    ['git commit -m "chore: 说明 git push 只走 Sigil"'],
    [`cd E:/my/node-site && git commit -F - <<'EOF'\n${longBody}\nEOF`],
    [
      `git commit -F - <<'MSG'\nfeat: 支持 cat > x.py <<'PY' 的检测\n\n正文里出现 /tmp/ 与 > nul 也不应被拦\nMSG`,
    ],
    ['git add src/lib/seo.ts tests/unit/seo.test.ts'],
    ['git stash list'],
    ['git status -s && git log --oneline -5'],
    ['npx kill-port 4321'],
    ['netstat -ano | findstr :4321'],
    ['mkdir -p logs/tmp && ls logs/tmp'],
    ['date "+%Y-%m-%dT%H:%M:%S%:z"'],
    ['pnpm build && pnpm check:seo'],
  ])('%s', (command) => {
    expect(action(command)).toBe('allow');
  });

  it('remote 指向本机目录时放行 git fetch（孵化项目的 upstream 指向框架目录）', () => {
    expect(action('git fetch E:/my/AI框架/next-ai-astro master')).toBe('allow');
    expect(action('git clone ../next-ai-astro copy')).toBe('allow');
  });
});

describe('PowerShell 2>&1 自动摘除', () => {
  it('原生程序的 2>&1 被摘掉，引号内的字面量不动', () => {
    const result = analyzeShellCommand('pnpm build 2>&1 | Select-String "2>&1"', { shell: 'powershell' });
    expect(result.action).toBe('rewrite');
    expect(result.command).toBe('pnpm build | Select-String "2>&1"');
  });
  it('cmd /c 里的 2>&1 是正确用法，不动', () => {
    expect(action('cmd /c "pnpm build 2>&1"', 'powershell')).toBe('allow');
  });
});
