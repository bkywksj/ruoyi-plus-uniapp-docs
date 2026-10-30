// Shell 命令安全规则（Claude 与 Codex 的 pre-tool-use hook 共用，单一真相源）
// 设计要点：
//   1. 先把命令拆成「一条条命令 → 词元」再判断，引号里的文字（commit message、grep 模式）与 heredoc 正文
//      不会触发规则——此前按整段字符串正则匹配，`git commit -m "docs: 禁止 /tmp 中转"` 也会被拦。
//   2. 远程 git 操作一律走 Sigil；但 remote 是本机路径（如孵化项目的 upstream 指向框架目录）时放行。
//   3. 返回结构化结果，由各端 hook 按自己的输出协议翻译。
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const KILL_TARGETS = /^(node|pwsh|powershell)(\.exe)?$/i;
const INTERPRETERS = '(?:python3?|node|deno|bun|sh|bash|zsh|perl|ruby|php)(?:\\.exe)?';

/**
 * 找出 heredoc，返回去掉正文后的文本（保留起始行）和每个 heredoc 的信息。
 * 正文里常是 commit message 或文档片段，不应参与规则匹配。
 */
function splitHeredocs(command) {
  const lines = command.split('\n');
  const kept = [];
  const heredocs = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    kept.push(line);
    const match = line.match(/<<-?\s*(['"]?)([A-Za-z_]\w*)\1/);
    if (!match) continue;
    const tag = match[2];
    let end = -1;
    for (let j = i + 1; j < lines.length; j += 1) {
      if (new RegExp(`^\\s*${tag}\\s*$`).test(lines[j])) {
        end = j;
        break;
      }
    }
    heredocs.push({ tag, opener: line, bodyLines: end === -1 ? lines.length - i - 1 : end - i - 1, closed: end !== -1 });
    if (end === -1) break;
    i = end;
  }
  return { text: kept.join('\n'), heredocs };
}

/**
 * 简易 shell 词法：按 ; & | 换行 括号切成多条命令，每条命令切成词元（引号内容作为一个词元，引号本身去掉）。
 * PowerShell 下反斜杠是路径分隔符，不当转义符。
 */
function tokenize(text, shell) {
  const commands = [];
  let tokens = [];
  let current = '';
  let hasToken = false;
  let quote = null;
  const pushToken = () => {
    if (hasToken) tokens.push(current);
    current = '';
    hasToken = false;
  };
  const pushCommand = () => {
    pushToken();
    if (tokens.length) commands.push(tokens);
    tokens = [];
  };
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === '\\' && quote === '"' && shell !== 'powershell' && i + 1 < text.length) current += text[(i += 1)];
      else current += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      hasToken = true;
    } else if ('\n;&|()'.includes(c)) {
      pushCommand();
    } else if (/\s/.test(c)) {
      pushToken();
    } else if (c === '\\' && shell !== 'powershell' && i + 1 < text.length && text[i + 1] !== '\n') {
      current += text[(i += 1)];
      hasToken = true;
    } else {
      current += c;
      hasToken = true;
    }
  }
  pushCommand();
  return commands;
}

/** 词元里的程序名：去掉路径与 .exe，小写 */
function programName(token) {
  return path.basename(token.replace(/\\/g, '/')).replace(/\.exe$/i, '').toLowerCase();
}

/** 远程地址是否指向本机路径（本机路径的 fetch / push 不涉及凭据，允许直接用 git） */
function isLocalRemote(target, cwd) {
  let url = target;
  // 不含 : / \ 的是 remote 名，先解析成地址
  if (!/[:/\\]/.test(target)) {
    try {
      url = execFileSync('git', ['remote', 'get-url', target], { cwd, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return false;
    }
  }
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(url);
  const scpLike = /^[^@\s/\\]+@[^:\s]+:/.test(url);
  return !hasScheme && !scpLike;
}

const REMOTE_GIT_REASON =
  '🚫 本地 git 远程操作被阻止（{sub}）\n\n' +
  '本机不存明文凭据，push / fetch / pull / clone / ls-remote 会弹出凭据窗口卡住会话，且会绕开凭据审计。\n\n' +
  '改用 Sigil：推送 `mcp__sigil__git_push` / `workspace_push`；拉取 `workspace_fetch` / `workspace_pull`；克隆 `git_clone`；' +
  '查远端分支与提交 `git_branches_list` / `git_commits_list`。Sigil 不可用时停下提示用户，不要回退原生 git。\n' +
  '（remote 指向本机目录时不受此限制。）';

/** 逐条命令检查 git / 杀进程 / 时区 / 重定向等规则，命中返回拦截原因 */
function checkCommandTokens(tokens, context) {
  // 跳过前置的环境变量赋值（X=1 cmd ...），记下 TZ
  let index = 0;
  const assignments = {};
  while (index < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[index])) {
    const [key, ...value] = tokens[index].split('=');
    assignments[key] = value.join('=');
    index += 1;
  }
  const args = tokens.slice(index);
  if (!args.length) return null;
  const program = programName(args[0]);
  const rest = args.slice(1);

  if (program === 'date' && /asia\/shanghai/i.test(assignments.TZ ?? '')) {
    return '🚫 `TZ=Asia/Shanghai date` 被阻止：Git Bash 没有 zoneinfo，会退化成 UTC、少 8 小时。\n系统时区已是东八区，直接用裸 `date \'+%Y-%m-%dT%H:%M:%S%:z\'`。';
  }

  // > nul：重定向目标是 nul（Windows 会生成名为 nul 的实体文件）
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    const redirectThenNul = /^\d?>>?$/.test(token) && /^nul$/i.test(args[i + 1] ?? '');
    if (/^\d?>>?nul$/i.test(token) || redirectThenNul) {
      return '🚫 检测到 `> nul`：Windows 下 Git Bash 不认 nul 设备，会创建名为 nul 的文件。\n改用 `> /dev/null 2>&1`，或干脆不重定向。';
    }
  }

  // /tmp 当中转目录：重定向目标与 X=/tmp/... 一律算；普通参数里 grep / rg / git / echo / printf 的不算（多是搜索模式或说明文字）
  const tmpAsRedirect = args.some(
    (token, i) => (/^\d?>>?$/.test(args[i - 1] ?? '') && /^\/tmp\//.test(token)) || /^\d?>>?\/tmp\//.test(token) || /=\/tmp\//.test(token),
  );
  const tmpAsArgument =
    !['grep', 'rg', 'git', 'echo', 'printf'].includes(program) && args.some((token) => /^\/tmp\//.test(token));
  if (tmpAsRedirect || tmpAsArgument) {
    return '🛑 `/tmp` 路径被阻止：Git Bash 的 /tmp 与 Windows 原生程序（python / node / tar）理解的不是同一个位置，bash 写进去 node 读不到。\n改用 scratchpad 绝对路径、项目内 logs/，或 $TEMP（Bash）/ $env:TEMP（PowerShell）。';
  }

  if (program === 'git') {
    let cwd = context.cwd;
    let i = 0;
    while (i < rest.length && rest[i].startsWith('-')) {
      if (rest[i] === '-C' && rest[i + 1]) {
        cwd = path.resolve(context.cwd, rest[i + 1]);
        i += 2;
      } else if (rest[i] === '-c' && rest[i + 1]) {
        i += 2;
      } else {
        i += 1;
      }
    }
    const sub = rest[i];
    const subArgs = rest.slice(i + 1);
    const positional = subArgs.filter((token) => !token.startsWith('-'));

    if (['push', 'fetch', 'pull', 'ls-remote'].includes(sub)) {
      const target = positional[0] ?? 'origin';
      if (!isLocalRemote(target, cwd)) return REMOTE_GIT_REASON.replace('{sub}', `git ${sub}`);
    }
    if (sub === 'clone') {
      const source = positional[0];
      if (!source || !isLocalRemote(source, cwd)) return REMOTE_GIT_REASON.replace('{sub}', 'git clone');
    }
    if (sub === 'credential' && ['fill', 'approve', 'reject'].includes(subArgs[0])) {
      return '🚫 `git credential` 被阻止：本机未存凭据时会弹窗阻塞，写进循环会变成弹窗风暴。需要 token 用 `gh auth token` 或环境变量，推送走 Sigil。';
    }
    if (sub === 'add' && subArgs.some((token) => ['-A', '--all', '.', ':/'].includes(token))) {
      return '🚫 `git add -A` / `git add .` 被阻止：会把其他会话的未提交改动一起提交。\n逐个 `git add <具体文件>`（CLAUDE.md「多会话并发自动避让协议」L3）。';
    }
    if (sub === 'stash' && !['list', 'show'].includes(subArgs[0])) {
      return '🚫 `git stash` 被阻止：会卷走其他会话的未提交改动。需要暂存自己的改动时先提交到本地分支。';
    }
    if (sub === 'reset' && subArgs.includes('--hard')) {
      return '🚫 `git reset --hard` 被阻止：会丢掉工作区里所有未提交改动（可能属于其他会话）。如确需执行，请用户在终端手动运行。';
    }
    if (sub === 'clean' && subArgs.some((token) => /^-[a-zA-Z]*f/.test(token))) {
      return '🚫 `git clean -f` 被阻止：会删除未跟踪文件（可能属于其他会话）。';
    }
    if (sub === 'checkout' && (subArgs[0] === '.' || subArgs.includes('--'))) {
      return '🚫 `git checkout -- <文件>` / `git checkout .` 被阻止：会丢弃未提交改动。只想撤掉暂存用 `git restore --staged <文件>`。';
    }
  }

  // 按名字杀进程：会杀掉 Claude Code / Codex 自身或宿主 shell
  const killHint = '\n停自己起的服务用 `npx kill-port <端口>`；查 PID 用 `netstat -ano | findstr <端口>`，再 `taskkill /F /PID <pid>`。';
  if (program === 'taskkill') {
    for (let i = 0; i < rest.length; i += 1) {
      if (/^[/-]im$/i.test(rest[i]) && KILL_TARGETS.test(rest[i + 1] ?? '')) {
        return `🚫 \`taskkill /IM ${rest[i + 1]}\` 被阻止：会终止 AI CLI 自身或宿主 shell。${killHint}`;
      }
    }
  }
  if (program === 'stop-process') {
    for (let i = 0; i < rest.length; i += 1) {
      if (/^-name$/i.test(rest[i]) && KILL_TARGETS.test((rest[i + 1] ?? '').replace(/\*$/, ''))) {
        return `🚫 \`Stop-Process -Name ${rest[i + 1]}\` 被阻止：会终止 AI CLI 自身或宿主 shell。${killHint}`;
      }
    }
  }
  if (['pkill', 'killall'].includes(program) && rest.some((token) => KILL_TARGETS.test(token))) {
    return `🚫 按名字杀 node / pwsh 进程被阻止：会终止 AI CLI 自身。${killHint}`;
  }
  return null;
}

// 整段命令上的正则规则（路径常在引号里，所以这里看的是保留引号内容的文本）
const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+-rf\s+\/(?!\w)/, reason: '删除根目录' },
  { pattern: /rm\s+-rf\s+\*/, reason: '删除所有文件' },
  { pattern: /rm\s+-rf\s+["']?[A-Za-z]:[/\\][^"'\s]*["']?\s*\*?/i, reason: '删除 Windows 绝对路径下的文件' },
  { pattern: /rm\s+-rf\s+["']?\/(home|usr|etc|var|opt|root|tmp|bin|sbin|lib)\b/i, reason: '删除系统关键目录' },
  { pattern: /drop\s+database/i, reason: '删除数据库' },
  { pattern: /truncate\s+table/i, reason: '清空表数据' },
  { pattern: />\s*\/dev\/sd[a-z]/, reason: '直接写入磁盘设备' },
  { pattern: /mkfs\./, reason: '格式化文件系统' },
  { pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, reason: 'Fork 炸弹' },
  { pattern: /Get-Process\b[^|;\n]*\b(node|pwsh|powershell)\b[^|;\n]*\|\s*Stop-Process/i, reason: '管道按名字杀 node / pwsh 进程会终止 AI CLI 自身' },
  { pattern: /\b(powershell|pwsh)(\.exe)?\s+[-/]+(enc|encodedcommand|e\b)/i, reason: 'PowerShell -EncodedCommand 包装命令绕过审计' },
  { pattern: /\bFormat-Volume\b/i, reason: '格式化磁盘卷' },
  { pattern: /\bClear-Disk\b[^|;\n]*-RemoveData/i, reason: '清空磁盘数据' },
  { pattern: /\b(Remove-Partition|Remove-Volume)\b[^|;\n]*-(Confirm|Force)/i, reason: '删除磁盘分区 / 卷' },
  { pattern: /\b(Stop-Computer|Restart-Computer)\b[^|;\n]*-Force/i, reason: '强制关机 / 重启' },
  { pattern: /\bshutdown\b[^|;\n]*\/[rspf]\b/i, reason: 'shutdown 关机 / 重启' },
  { pattern: /\b(Invoke-RestMethod|Invoke-WebRequest|irm|iwr)\b[^|;\n]*\|\s*(iex|Invoke-Expression)\b/i, reason: '远程下载并执行，无法审计远端脚本' },
];

const WARNING_PATTERNS = [
  { pattern: /\bnpm\s+publish\b/, message: '即将发布到 npm' },
  { pattern: /\bdocker\s+system\s+prune\b/, message: '将清理所有未使用的 Docker 资源' },
];

/**
 * 分析一条 shell 命令。
 * @param {string} command
 * @param {{ shell?: 'bash' | 'powershell', cwd?: string }} [options]
 * @returns {{ action: 'allow' } | { action: 'block', reason: string } | { action: 'warn', message: string } | { action: 'rewrite', command: string, message: string }}
 */
function analyzeShellCommand(command, options = {}) {
  const shell = options.shell ?? 'bash';
  const cwd = options.cwd ?? process.cwd();
  if (!command || typeof command !== 'string') return { action: 'allow' };

  const { text, heredocs } = splitHeredocs(command);

  // 1. 内联长脚本：只看 heredoc 起始行，不看正文（正文里引用坏写法做说明不该被拦）
  for (const heredoc of heredocs) {
    const feedsInterpreter = new RegExp(`(?:^|[\\s;&|(])${INTERPRETERS}\\b[^<]*<<-?\\s*['"]?\\w`, 'i').test(heredoc.opener);
    const writesScript = /\b(cat|tee)\b[^|<]*>\s*\S+\.(py|js|cjs|mjs|ts|sh|ps1|rb|pl|php)\b[^<]*<<-?\s*['"]?\w/i.test(heredoc.opener);
    if ((feedsInterpreter || writesScript) && (heredoc.bodyLines > 15 || !heredoc.closed)) {
      const size = `定界符 \`${heredoc.tag}\`，正文约 ${heredoc.bodyLines} 行${heredoc.closed ? '' : '，且未找到闭合定界符'}`;
      // 两种场景的正确做法不同：喂给解释器的是「脚本」，落成文件再执行；cat > / >> 源码文件是「改代码」，应该用编辑工具
      const reason = feedsInterpreter
        ? `🛑 内联长脚本被阻止（${size}）\n\n` +
          '定界符没闭合或引号多层嵌套会报 `unexpected EOF`，失败时整段还得重打。\n' +
          '用 Write 工具把脚本落成文件（scratchpad 或 logs/），再执行该文件。\n'
        : `🛑 用 heredoc 往源码文件写内容被阻止（${size}）\n\n` +
          '这是在改代码，不是执行脚本：追加或修改已有文件用 Edit，新建文件用 Write。\n' +
          '改动不经 shell 解析（不会被引号、`$` 展开搞坏），也能被审阅。\n';
      return {
        action: 'block',
        reason: `${reason}（15 行以内的短 heredoc、\`git commit -F -\` 这类纯文本输入不受限制。）`,
      };
    }
  }

  // 2. 逐条命令的词元规则
  for (const tokens of tokenize(text, shell)) {
    const reason = checkCommandTokens(tokens, { cwd });
    if (reason) return { action: 'block', reason };
  }

  // 3. 整段正则规则
  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(text)) {
      return { action: 'block', reason: `⚠️ 危险操作被阻止：${reason}\n\n如确需执行，请用户在终端手动运行。` };
    }
  }

  // 4. PowerShell 里给原生程序加 2>&1：自动摘掉（引号内的字面量不动）
  if (shell === 'powershell' && /2>&1/.test(text)) {
    const delegated = /\bcmd(\.exe)?\s*\/c\b|\bbash\s+-c\b|\bsh\s+-c\b/i.test(text);
    const native = /\b(mvn|java|javac|gradle|cargo|cmake|ctest|npm|npx|pnpm|yarn|node|tsc|python3?|git|docker|rg|astro)\b/i.test(text);
    if (!delegated && native) {
      let out = '';
      let quote = null;
      for (let i = 0; i < command.length; i += 1) {
        const c = command[i];
        if (quote) {
          out += c;
          if (c === quote) quote = null;
          continue;
        }
        if (c === '"' || c === "'") {
          quote = c;
          out += c;
          continue;
        }
        if (command.startsWith('2>&1', i) && (command[i + 4] === undefined || /\s/.test(command[i + 4]))) {
          out = out.replace(/[ \t]+$/, '');
          i += 3;
          continue;
        }
        out += c;
      }
      if (out !== command) {
        return {
          action: 'rewrite',
          command: out,
          message: 'pre-tool-use: 已摘掉 `2>&1` —— PowerShell 5.1 会把原生程序的 stderr 逐行包成 NativeCommandError。',
        };
      }
    }
  }

  for (const { pattern, message } of WARNING_PATTERNS) {
    if (pattern.test(text)) return { action: 'warn', message: `⚠️ 注意：${message}` };
  }
  return { action: 'allow' };
}

/** 写入敏感文件时提醒（不阻止） */
const SENSITIVE_FILES = ['.env', '.env.local', '.env.production', 'credentials.json', 'secrets.json'];

function sensitiveFileWarning(filePath) {
  const hit = SENSITIVE_FILES.find((name) => (filePath || '').replace(/\\/g, '/').endsWith(`/${name}`) || filePath === name);
  return hit ? `⚠️ 敏感文件：正在写入 \`${hit}\`，确保不要把密钥提交到 Git。` : null;
}

module.exports = { analyzeShellCommand, sensitiveFileWarning, tokenize, splitHeredocs, isLocalRemote };
