// 孵化残留扫描：从别的站复制骨架 / 孵化新站后，查当前项目里还有没有来源站的域名、站名、标题后缀、IndexNow 密钥、品牌色。
// 为什么要它：复制过来的文件里写死的站点值，构建、测试全都照样通过（知识库从 officia 孵化，上线后才发现
// IndexNow 推的还是 ruoyi.plus 的域名与密钥；迁移脚本里的标题后缀还是 officia 的，整条 <title> 被当成页名写进了 frontmatter）。
//
// 用法：node scripts/check-residue.mjs <来源站目录> [--allow 词1,词2]
//   来源站目录里要有 src/site.config.ts（读它的 url / name / shortName / titleSuffix / brandColor）；有 src/data/docs.json 时再加 IndexNow 密钥
//   --allow：确认是有意保留的词（如产品矩阵里列着来源站的名字），逗号分隔
// 退出码：0 没有残留 / 1 有残留 / 2 用法错误
// 只扫 git 跟踪的文本文件；scripts/migrate/known-diffs.json 与 CHANGELOG 类的说明文字也会被扫到，按 --allow 放行或改掉
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const from = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--allow');
const allowIdx = args.indexOf('--allow');
const allow = new Set(allowIdx >= 0 ? (args[allowIdx + 1] ?? '').split(',').filter(Boolean) : []);
if (!from || !existsSync(resolve(from, 'src/site.config.ts'))) {
  console.error('用法：node scripts/check-residue.mjs <来源站目录（含 src/site.config.ts）> [--allow 词1,词2]');
  process.exit(2);
}

const src = readFileSync(resolve(from, 'src/site.config.ts'), 'utf8');
const field = (name) => new RegExp(`^ {2}${name}:\\s*'([^']+)'`, 'm').exec(src)?.[1];
const url = field('url');
const needles = new Map();
const add = (label, value) => {
  if (value && value.length >= 4 && !allow.has(value)) needles.set(value, label);
};
if (url) add('域名', new URL(url).host);
add('站名', field('name'));
add('短名', field('shortName'));
add('标题后缀', field('titleSuffix'));
add('品牌色', field('brandColor'));
const docsJson = resolve(from, 'src/data/docs.json');
if (existsSync(docsJson)) add('IndexNow 密钥', JSON.parse(readFileSync(docsJson, 'utf8')).indexnow?.key);

// 与当前项目自己的值相同的不算（两站同名 / 同色时没法区分，跳过并提示）
const own = readFileSync('src/site.config.ts', 'utf8');
for (const value of [...needles.keys()]) {
  if (own.includes(`'${value}'`) || own.includes(`//${value}`)) {
    console.log(`  （跳过「${value}」：当前项目自己的配置里也是它）`);
    needles.delete(value);
  }
}
if (needles.size === 0) {
  console.log('来源站没有可比对的特征值');
  process.exit(0);
}

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8', maxBuffer: 1 << 26 })
  .split('\n')
  .filter((f) => f && /\.(astro|ts|tsx|mjs|cjs|js|json|md|mdx|css|txt|xml|yml|yaml|html)$/.test(f) && !f.startsWith('.claude/') && !f.startsWith('.codex/') && !f.startsWith('.agents/'));
const hits = [];
for (const file of files) {
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [value, label] of needles) {
      if (line.toLowerCase().includes(value.toLowerCase())) hits.push(`${file}:${i + 1}  [${label}] ${value}  ${line.trim().slice(0, 100)}`);
    }
  });
}
console.log(`来源站特征值：${[...needles].map(([v, l]) => `${l}=${v}`).join('，')}`);
if (hits.length === 0) {
  console.log('✅ 没有发现来源站残留');
  process.exit(0);
}
console.log(`\n⛔ 发现 ${hits.length} 处来源站残留（有意保留的用 --allow 放行）：`);
hits.slice(0, 60).forEach((h) => console.log(`  ${h}`));
if (hits.length > 60) console.log(`  …… 其余 ${hits.length - 60} 处`);
process.exit(1);
