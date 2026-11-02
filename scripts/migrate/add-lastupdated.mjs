// docs 模块迁移脚本：给迁移来的文档补 frontmatter lastUpdated：取旧站仓库里该文件最后一次提交的日期（旧站 VitePress lastUpdated 显示的就是它）
// 用法：node scripts/migrate/add-lastupdated.mjs <旧站仓库根目录>
// 在 convert.mjs 之后跑（convert 会重写 frontmatter）；已有 lastUpdated 的页面不动。
// 为什么不从本仓 git 取：迁移换了路径，本仓里所有页面都是迁移那天新加的，日期全是同一天
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const oldRepo = process.argv[2];
if (!oldRepo) {
  console.error('用法：node scripts/migrate/add-lastupdated.mjs <旧站仓库根目录>');
  process.exit(2);
}
const ROOT = 'src/content/docs';
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
let n = 0;
for (const file of walk(ROOT).filter((f) => f.endsWith('.md'))) {
  const id = relative(ROOT, file).split(sep).join('/');
  const src = readFileSync(file, 'utf8');
  if (/^lastUpdated:/m.test(src.split('\n---')[0])) continue;
  const date = execFileSync('git', ['-C', oldRepo, 'log', '-1', '--format=%cs', '--', `docs/${id}`], { encoding: 'utf8' }).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${id}：旧站仓库里查不到提交日期（${date || '空'}）`);
  // 插在 description 那一行后面（convert.mjs 写出的 frontmatter 前两行固定是 title / description）
  const out = src.replace(/^(---\ntitle: .*\ndescription: .*\n)/, `$1lastUpdated: ${date}\n`);
  if (out === src) throw new Error(`${id}：frontmatter 形态不对，没插进去`);
  writeFileSync(file, out);
  n++;
  console.log(`${id.padEnd(36)} ${date}`);
}
console.log(`补了 ${n} 页`);
