#!/usr/bin/env node
// CSP 审计：扫描 dist/ 每个页面，核对「会执行的内联脚本 / 内联样式 / style 属性 / 外部脚本」是否都被该页 CSP 放行
//
// 用法（先 pnpm build）：
//   node .claude/skills/security-guard/scripts/csp-audit.mjs            # 审计 ./dist
//   node .claude/skills/security-guard/scripts/csp-audit.mjs --dist <目录>
//
// 为什么需要它：开启 security.csp 后，Astro 只给它自己处理过的脚本/样式生成 hash；
// is:inline 脚本（如 ThemeScript）、set:html 注入的统计代码、HTML 里的 style="" 属性都不会自动放行，
// 构建照样成功，问题只在浏览器里表现为「深色模式失效、统计不上报、品牌色丢失」。
// 退出码：0 全部覆盖（或未启用 CSP，仅给出启用时需要的 hash）/ 1 已启用 CSP 但有未覆盖项
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, resolve, sep } from 'node:path';

const argv = process.argv.slice(2);
const distIndex = argv.indexOf('--dist');
const DIST = resolve(distIndex >= 0 ? argv[distIndex + 1] : 'dist');

if (!existsSync(DIST)) {
  console.error(`❌ 找不到 ${DIST}，请先 pnpm build`);
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const sha256 = (text) => `sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}`;
// 只有 JavaScript 类型的 <script> 受 script-src 约束；application/ld+json 等数据块浏览器不执行，CSP 不管
const EXECUTABLE_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);

/** 解析 CSP 字符串 → Map<指令名, 源列表> */
function parseCsp(text) {
  const map = new Map();
  for (const part of text.split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/);
    if (name) map.set(name.toLowerCase(), sources);
  }
  return map;
}

/** 按 CSP 回退规则取某类资源生效的源列表 */
function effective(csp, ...names) {
  for (const name of names) if (csp.has(name)) return csp.get(name);
  return null; // 没有任何相关指令 = 不限制
}

const allows = (sources, token) => sources === null || sources.includes(`'${token}'`) || sources.includes(token);

let enabled = 0;
let problems = 0;
const neededWhenEnabling = new Map(); // hash → 来源说明（未启用 CSP 时给参考）

for (const file of walk(DIST).filter((f) => f.endsWith('.html'))) {
  const page = relative(DIST, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  const cspText = html.match(/<meta\s+http-equiv="content-security-policy"\s+content="([^"]*)"/i)?.[1];
  const csp = cspText ? parseCsp(cspText) : null;
  if (csp) enabled += 1;
  const issues = [];

  const scriptSources = csp ? effective(csp, 'script-src-elem', 'script-src', 'default-src') : null;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1];
    const body = match[2];
    const type = (attrs.match(/\btype="([^"]*)"/i)?.[1] ?? '').toLowerCase();
    if (!EXECUTABLE_TYPES.has(type)) continue;
    const src = attrs.match(/\bsrc="([^"]*)"/i)?.[1];
    if (src) {
      if (!/^https?:\/\//i.test(src)) continue; // 同源脚本由 'self' 放行
      const origin = new URL(src).origin;
      if (csp && !(scriptSources ?? []).some((s) => s === origin || src.startsWith(s))) {
        issues.push(`外部脚本未放行：${src} → scriptDirective.resources 加 "${origin}"`);
      }
      continue;
    }
    const hash = sha256(body);
    if (!csp) {
      neededWhenEnabling.set(hash, `内联脚本：${JSON.stringify(body.trim().slice(0, 40))}…`);
    } else if (!allows(scriptSources, hash) && !allows(scriptSources, 'unsafe-inline')) {
      issues.push(`内联脚本未放行（${JSON.stringify(body.trim().slice(0, 40))}…）→ scriptDirective.hashes 加 '${hash}'`);
    }
  }

  const styleElemSources = csp ? effective(csp, 'style-src-elem', 'style-src', 'default-src') : null;
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const hash = sha256(match[1]);
    if (csp && !allows(styleElemSources, hash) && !allows(styleElemSources, 'unsafe-inline')) {
      issues.push(`内联 <style> 未放行 → styleDirective.hashes 加 '${hash}'`);
    }
  }

  const styleAttrCount = (html.match(/\sstyle="[^"]*"/g) ?? []).length;
  if (csp && styleAttrCount > 0) {
    const attrSources = effective(csp, 'style-src-attr', 'style-src', 'default-src');
    if (!allows(attrSources, 'unsafe-inline')) {
      issues.push(
        `${styleAttrCount} 个 style="" 属性会被拦截（品牌色 --brand、视图过渡名等）→ styleDirective.resources 加 { resource: "'unsafe-inline'", kind: 'attribute' }`,
      );
    }
  }

  if (issues.length) {
    problems += issues.length;
    console.log(`\n❌ ${page}`);
    issues.forEach((issue) => console.log(`   - ${issue}`));
  }
}

if (enabled === 0) {
  console.log('ℹ️  未启用 CSP（页面里没有 content-security-policy meta）。');
  if (neededWhenEnabling.size) {
    console.log(
      '   页面里有以下内联脚本。开启 security.csp 后，Astro 自己处理过的（打包的 <script>、island 引导代码）会自动生成 hash，\n' +
        '   is:inline / set:html 写的需要手动加进 scriptDirective.hashes。最可靠的做法：先开启 CSP 构建一次，再跑本脚本看缺哪些。',
    );
    neededWhenEnabling.forEach((note, hash) => console.log(`   '${hash}'  ← ${note}`));
  }
  process.exit(0);
}

if (problems) {
  console.log(`\n共 ${problems} 处未被 CSP 覆盖（${enabled} 个页面启用了 CSP）`);
  process.exit(1);
}
console.log(`✅ CSP 审计通过：${enabled} 个页面，内联脚本 / 样式 / style 属性 / 外部脚本均已放行`);
