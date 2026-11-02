// docs 模块迁移脚本 · 全站比对：旧站基线产物 vs 新站产物（页面以外的部分；逐页正文见 compare-baseline.mjs）
// 用法：node scripts/migrate/compare-site.mjs <基线清单> <新站清单> <基线 dist> <新站 dist>
// 判定（任一不满足退出码 1）：
//   - 网址：旧站每一页在新站都有对应页面（页面清单键相同）
//   - sitemap：旧站 sitemap.xml 的每条网址都在新站 sitemap 里；新站 /sitemap.xml 仍可用（站长平台登记的地址）
//     例外：src/data/outdated.json 登记的过期页（页面带 noindex）有意移出，单独列出；页面本身仍须存在
//   - public：旧站产物里的静态文件（图片、验证文件、llms.txt …）新站一个不少，且站长验证文件逐字节相同
//   - JSON-LD：旧站出现过的每种 @type，新站页数不少于旧站
//   - robots：旧站显式放行的每个 User-agent，新站都放行；Sitemap 声明仍在
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const [basePath, newPath, baseDist, newDist] = process.argv.slice(2);
if (!newDist) {
  console.error('用法：node scripts/migrate/compare-site.mjs <基线清单> <新站清单> <基线 dist> <新站 dist>');
  process.exit(2);
}
const base = JSON.parse(readFileSync(basePath, 'utf8'));
const next = JSON.parse(readFileSync(newPath, 'utf8'));
const problems = [];
const ok = (msg) => console.log(`✅ ${msg}`);
const bad = (msg) => {
  problems.push(msg);
  console.log(`❌ ${msg}`);
};

// 网址
const lostPages = Object.keys(base.pages).filter((p) => !next.pages[p]);
lostPages.length ? bad(`旧站页面在新站缺 ${lostPages.length} 个：${lostPages.slice(0, 10).join(', ')}`) : ok(`网址 ${Object.keys(base.pages).length}/${Object.keys(base.pages).length}`);

// sitemap
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURI(m[1]));
const oldLocs = locs(readFileSync(join(baseDist, 'sitemap.xml'), 'utf8'));
const newLocs = new Set(
  ['sitemap-0.xml', 'sitemap-1.xml'].filter((f) => existsSync(join(newDist, f))).flatMap((f) => locs(readFileSync(join(newDist, f), 'utf8'))),
);
// 过期页：网址形如 https://<本站>/<id>.html
const outdated = JSON.parse(readFileSync(new URL('../../src/data/outdated.json', import.meta.url), 'utf8')).pages;
const isOutdated = (l) => new URL(l).pathname.replace(/\.html$/, '').slice(1) in outdated;
const removed = oldLocs.filter((l) => !newLocs.has(l) && isOutdated(l));
const lostLocs = oldLocs.filter((l) => !newLocs.has(l) && !isOutdated(l));
lostLocs.length ? bad(`旧 sitemap 有 ${lostLocs.length} 条新站没有：${lostLocs.slice(0, 5).join(', ')}`) : ok(`sitemap 旧站 ${oldLocs.length - removed.length} 条全在新站（另有 ${removed.length} 条过期页有意移出；新站 ${newLocs.size} 条）`);
if (removed.length) console.log(`   有意移出 ${removed.length} 条（内容过期页，noindex，见 outdated.json）：${removed.map((l) => new URL(l).pathname).join(', ')}`);
const strayOutdated = Object.keys(outdated).filter((id) => !next.pages[`${id}.html`]);
if (strayOutdated.length) bad(`outdated.json 登记的页面在新站不存在：${strayOutdated.join(', ')}`);
const extraLocs = [...newLocs].filter((l) => !oldLocs.includes(l));
if (extraLocs.length) console.log(`   新站多出 ${extraLocs.length} 条：${extraLocs.slice(0, 5).join(', ')}`);
existsSync(join(newDist, 'sitemap.xml')) ? ok('/sitemap.xml 仍可用') : bad('新站没有 /sitemap.xml（站长平台登记的地址会 404）');

// public 静态文件
// VitePress 自己的构建产物（页面哈希表、图标样式），不是站点内容，新站不会有
const VITEPRESS_INTERNAL = new Set(['hashmap.json', 'vp-icons.css']);
const lostAssets = base.assets.filter((a) => !VITEPRESS_INTERNAL.has(a) && !existsSync(join(newDist, a)));
lostAssets.length ? bad(`旧站静态文件新站缺 ${lostAssets.length} 个：${lostAssets.slice(0, 10).join(', ')}`) : ok(`静态文件 ${base.assets.length} 个全在`);
for (const v of base.verification) {
  const a = join(baseDist, v);
  const b = join(newDist, v);
  if (!existsSync(b)) bad(`站长验证文件缺：${v}`);
  else if (!readFileSync(a).equals(readFileSync(b))) bad(`站长验证文件内容不同：${v}`);
}
if (!problems.some((p) => p.includes('验证文件'))) ok(`站长验证文件 ${base.verification.length} 个逐字节相同`);

// JSON-LD
for (const [type, count] of Object.entries(base.jsonLdTypes)) {
  const n = next.jsonLdTypes?.[type] ?? 0;
  n >= count ? ok(`JSON-LD ${type}：${n}/${count} 页`) : bad(`JSON-LD ${type} 只有 ${n} 页（旧站 ${count}）`);
}

// robots
const agents = (txt) => new Set([...txt.matchAll(/^User-agent:\s*([^\s#]+)/gim)].map((m) => m[1].toLowerCase()));
const oldRobots = readFileSync(join(baseDist, 'robots.txt'), 'utf8');
const newRobots = readFileSync(join(newDist, 'robots.txt'), 'utf8');
const lostAgents = [...agents(oldRobots)].filter((a) => !agents(newRobots).has(a));
lostAgents.length ? bad(`robots 少了 ${lostAgents.length} 个 User-agent：${lostAgents.join(', ')}`) : ok(`robots 旧站 ${agents(oldRobots).size} 个 User-agent 全部保留`);
/^Disallow:\s*\/\s*$/m.test(newRobots) && !/^Disallow:\s*\/\s*$/m.test(oldRobots) && bad('新站 robots 出现了 Disallow: /');
/^Sitemap:/m.test(newRobots) ? ok('robots 声明了 Sitemap') : bad('robots 没有 Sitemap 声明');

console.log(problems.length ? `\n全站比对：${problems.length} 项不通过` : '\n全站比对：全部通过');
process.exit(problems.length ? 1 : 0);
