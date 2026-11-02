// docs 模块：把本次变更的页面主动推送给搜索引擎（IndexNow 协议）。
//
// 搜索引擎默认靠爬虫自己「路过」发现更新，500 页的站点轮一遍要很久。IndexNow 反过来：发布完就通知，通常几分钟到几小时内被重新抓取。
// 推一次即覆盖 Bing / Yandex / Seznam / Naver / Yep（它们之间互相转发）；Google 不参与该协议，那边靠 sitemap 与自然抓取。
//
// 用法（上线之后跑，推的是线上地址）：
//   pnpm indexnow           推送最近一次提交里变更的文档（日常发布用这个）
//   pnpm indexnow --all     全量推送 dist/sitemap-0.xml 里的所有地址（首次接入时用一次，先 pnpm build）
//   pnpm indexnow --since <提交>  推送 <提交>..HEAD 之间变更的文档（一次上线含多个提交时用，<提交> 填上次上线时的 HEAD）
//   pnpm indexnow --dry     只打印将要推送的地址，不真正发请求
//
// 为什么默认只推变更页而非全量：协议方明确不鼓励反复提交未改动的地址，每次全推会被当成噪声，反而稀释了「这几页真的更新了」的信号。
// 内容过期页（src/data/outdated.json，页面带 noindex）不推。docs.json 的 indexnow.alwaysPush 里的站内路径每次都推（如首页、下载页）。
// 域名取 src/site.config.ts 的 url、密钥取 docs.json 的 indexnow.key —— 不在本文件里写死：孵化时从别的站复制过来，
// 写死的域名与密钥会原样带过来（知识库上线后才发现 IndexNow 推的还是 ruoyi.plus 的域名与密钥）

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { docUrl, pagePathFor, readDocsConfig, readSiteMeta } from './lib/site-meta.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_REL = 'src/content/docs';
const meta = readSiteMeta(ROOT);
const SITE = meta.url;
const { key: KEY, alwaysPush = [] } = readDocsConfig(ROOT).indexnow ?? {};
// 密钥文件 public/<KEY>.txt 随站点发布，对方会回读它校验归属：没配密钥、或文件不在（推过去只会被拒）都先停下
if (!KEY) {
  console.error('× docs.json 的 indexnow.key 为空：生成一个 32 位十六进制密钥，写进配置并放一份 public/<密钥>.txt（内容就是密钥本身）');
  process.exit(1);
}
const keyFile = resolve(ROOT, `public/${KEY}.txt`);
if (!existsSync(keyFile) || readFileSync(keyFile, 'utf8').trim() !== KEY) {
  console.error(`× 密钥文件 public/${KEY}.txt 不存在或内容不是密钥本身：搜索引擎回读它校验归属，对不上会拒收`);
  process.exit(1);
}
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const outdated = JSON.parse(readFileSync(resolve(ROOT, 'src/data/outdated.json'), 'utf8')).pages;

const args = process.argv.slice(2);
const isAll = args.includes('--all');
const isDry = args.includes('--dry');
/** --since <提交>：取该提交之后（不含）到 HEAD 的全部变更；不传则只看最近一次提交 */
const sinceIdx = args.indexOf('--since');
const since = sinceIdx >= 0 ? args[sinceIdx + 1] : undefined;
if (sinceIdx >= 0 && (!since || since.startsWith('--'))) {
  console.error('× --since 后面要跟一个提交（如 pnpm indexnow --since 4637ce6）');
  process.exit(1);
}

/** 文档相对路径（backend/index.md）→ 站点地址，口径与 sitemap、canonical 一致（lib/docs.ts 的 docPath） */
const toUrl = (rel) => docUrl(meta, rel.replace(/\.md$/, ''));

/** 从最近一次提交（或 --since 指定的区间）里取出变更的文档地址 */
const changedFromGit = () => {
  let out;
  try {
    // --diff-filter=d 排除删除的文件：已经不存在的页面推过去只会得到 404
    const gitArgs = since
      ? ['diff', '--name-only', '--diff-filter=d', `${since}..HEAD`, '--', DOCS_REL]
      : ['show', '--name-only', '--pretty=format:', '--diff-filter=d', 'HEAD', '--', DOCS_REL];
    out = execFileSync('git', gitArgs, {
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

const urls = isAll ? allFromSitemap() : [...new Set([...changedFromGit(), ...alwaysPush.map((p) => SITE + pagePathFor(p, meta.urlFormat))])];
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
