// 把本次变更的页面主动推送给搜索引擎（IndexNow 协议），旧站 scripts/indexnow.mjs 的 Astro 版。
//
// 搜索引擎默认靠爬虫自己「路过」发现更新，500 页的站点轮一遍要很久。IndexNow 反过来：发布完就通知，通常几分钟到几小时内被重新抓取。
// 推一次即覆盖 Bing / Yandex / Seznam / Naver / Yep（它们之间互相转发）；Google 不参与该协议，那边靠 sitemap 与自然抓取。
//
// 用法（上线之后跑，推的是线上地址）：
//   pnpm indexnow           推送最近一次提交里变更的文档（日常发布用这个）
//   pnpm indexnow --all     全量推送 dist/sitemap-0.xml 里的所有地址（首次接入时用一次，先 pnpm build）
//   pnpm indexnow --dry     只打印将要推送的地址，不真正发请求
//
// 为什么默认只推变更页而非全量：协议方明确不鼓励反复提交未改动的地址，每次全推会被当成噪声，反而稀释了「这几页真的更新了」的信号。
// 内容过期页（src/data/outdated.json，页面带 noindex）不推。

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_REL = 'src/content/docs';
const SITE = 'https://ruoyi.plus';
// 密钥文件 public/<KEY>.txt 随站点发布，对方会回读它校验归属
const KEY = 'd9bf148b4143c578b73c88858968c800';
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const outdated = JSON.parse(readFileSync(resolve(ROOT, 'src/data/outdated.json'), 'utf8')).pages;

const args = process.argv.slice(2);
const isAll = args.includes('--all');
const isDry = args.includes('--dry');

/** 文档相对路径（backend/index.md）→ 站点地址，口径与 sitemap、canonical 一致（lib/docs.ts 的 docPath） */
const toUrl = (rel) => {
  if (rel === 'index.md') return `${SITE}/`;
  return `${SITE}/${rel.replace(/\.md$/, '.html').replace(/\/index\.html$/, '/')}`;
};

/** 从最近一次提交里取出变更的文档地址 */
const changedFromGit = () => {
  let out;
  try {
    // --diff-filter=d 排除删除的文件：已经不存在的页面推过去只会得到 404
    out = execFileSync('git', ['show', '--name-only', '--pretty=format:', '--diff-filter=d', 'HEAD', '--', DOCS_REL], {
      cwd: ROOT,
      encoding: 'utf8',
    });
  } catch {
    console.error('× 读取 git 变更失败（不在仓库内？）。可用 --all 全量推送。');
    process.exit(1);
  }
  const urls = [];
  for (const line of out.split(/\r?\n/)) {
    const path = line.trim();
    if (!path.startsWith(`${DOCS_REL}/`) || !path.endsWith('.md')) continue;
    const rel = path.slice(DOCS_REL.length + 1);
    if (rel.replace(/\.md$/, '') in outdated) continue;
    if (existsSync(resolve(ROOT, path))) urls.push(toUrl(rel));
  }
  return urls;
};

/** 从构建产物的站点地图取全部地址（sitemap 已排除 404 与过期页） */
const allFromSitemap = () => {
  const file = resolve(ROOT, 'dist/sitemap-0.xml');
  if (!existsSync(file)) {
    console.error('× 找不到 dist/sitemap-0.xml，请先执行 pnpm build');
    process.exit(1);
  }
  return [...readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
};

const urls = isAll ? allFromSitemap() : changedFromGit();
if (urls.length === 0) {
  console.log('本次没有文档变更，无需推送。');
  process.exit(0);
}

console.log(`将推送 ${urls.length} 个地址：`);
urls.slice(0, 10).forEach((u) => console.log(`  ${u}`));
if (urls.length > 10) console.log(`  …… 其余 ${urls.length - 10} 条`);
if (isDry) {
  console.log('\n(--dry 模式，未真正发送)');
  process.exit(0);
}

// 协议单次上限 10000 条，本站远达不到；仍分批以防将来文档暴涨
const BATCH = 1000;
let failed = false;
for (let i = 0; i < urls.length; i += BATCH) {
  const batch = urls.slice(i, i + BATCH);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: batch }),
  }).catch((e) => {
    console.error(`× 请求失败：${e.message}`);
    return null;
  });
  if (!res) {
    failed = true;
    continue;
  }
  // 200 = 已接收；202 = 已接收待校验密钥，都算成功
  if (res.status === 200 || res.status === 202) console.log(`✓ 推送成功（HTTP ${res.status}，${batch.length} 条）`);
  else {
    const text = await res.text().catch(() => '');
    console.error(`× 推送被拒（HTTP ${res.status}）：${text.slice(0, 200)}`);
    failed = true;
  }
}
// 推送是尽力而为的旁路，失败不该让整条发布流程红掉 —— 只提示，不非零退出
if (failed) console.error('\n部分批次未成功。检查：密钥文件是否可访问、地址是否都属于本站域名。');
