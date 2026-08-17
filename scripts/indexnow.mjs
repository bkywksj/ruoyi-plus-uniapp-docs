// 把本次变更的页面主动推送给搜索引擎（IndexNow 协议）。
//
// 搜索引擎默认靠爬虫自己「路过」发现更新，506 页的站点轮一遍要很久。
// IndexNow 反过来：发布完就通知，通常几分钟到几小时内被重新抓取。
// 推一次即覆盖 Bing / Yandex / Seznam / Naver / Yep（它们之间互相转发）；
// Google 不参与该协议，那边靠 sitemap 的 lastmod 与自然抓取。
//
// 用法：
//   pnpm indexnow           推送最近一次提交里变更的文档（日常发布用这个）
//   pnpm indexnow --all     全量推送 sitemap 里的所有 URL（首次接入时用一次）
//   pnpm indexnow --dry     只打印将要推送的 URL，不真正发请求
//
// 为什么默认只推变更页而非全量：协议方明确不鼓励反复提交未改动的 URL，
// 每次全推 506 条会被当成噪声，反而稀释了「这几页真的更新了」的信号。

import { execFileSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DOCS = resolve(ROOT, 'docs')
const SITE = 'https://ruoyi.plus'
const KEY = 'd9bf148b4143c578b73c88858968c800'
const ENDPOINT = 'https://api.indexnow.org/IndexNow'

const args = process.argv.slice(2)
const isAll = args.includes('--all')
const isDry = args.includes('--dry')

/** docs 相对路径 → 站点 URL，口径与 sitemap.xml、canonical 三处保持一致 */
const toUrl = (rel) => {
  if (rel === 'index.md') return `${SITE}/`
  return SITE + '/' + rel.replace(/\.md$/, '.html').replace(/\/index\.html$/, '/')
}

/** 从最近一次提交里取出变更的文档路径 */
const changedFromGit = () => {
  let out
  try {
    // --diff-filter=d 排除删除的文件：已经不存在的页面推过去只会得到 404
    out = execFileSync(
      'git',
      ['show', '--name-only', '--pretty=format:', '--diff-filter=d', 'HEAD', '--', 'docs'],
      { cwd: ROOT, encoding: 'utf-8' }
    )
  } catch {
    console.error('× 读取 git 变更失败（不在仓库内？）。可用 --all 全量推送。')
    process.exit(1)
  }

  const urls = []
  for (const line of out.split(/\r?\n/)) {
    const path = line.trim()
    if (!path.startsWith('docs/') || !path.endsWith('.md')) continue
    const rel = path.slice('docs/'.length)
    // .vitepress 下的是配置不是页面
    if (rel.startsWith('.vitepress/')) continue
    if (existsSync(resolve(DOCS, rel))) urls.push(toUrl(rel))
  }
  return urls
}

/** 从构建产物的 sitemap 取全部 URL */
const allFromSitemap = () => {
  const file = resolve(DOCS, '.vitepress/dist/sitemap.xml')
  if (!existsSync(file)) {
    console.error('× 找不到 sitemap.xml，请先执行 pnpm build')
    process.exit(1)
  }
  const xml = readFileSync(file, 'utf-8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const urls = isAll ? allFromSitemap() : changedFromGit()

if (urls.length === 0) {
  console.log('本次没有文档变更，无需推送。')
  process.exit(0)
}

console.log(`将推送 ${urls.length} 个 URL：`)
urls.slice(0, 10).forEach((u) => console.log('  ' + u))
if (urls.length > 10) console.log(`  …… 其余 ${urls.length - 10} 条`)

if (isDry) {
  console.log('\n(--dry 模式，未真正发送)')
  process.exit(0)
}

// 协议单次上限 10000 条，本站远达不到；仍分批以防将来文档暴涨
const BATCH = 1000
let failed = false

for (let i = 0; i < urls.length; i += BATCH) {
  const batch = urls.slice(i, i + BATCH)
  const body = {
    host: new URL(SITE).host,
    key: KEY,
    // 对方会回读这个文件校验归属，对不上整批丢弃
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: batch
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  }).catch((e) => {
    console.error(`× 请求失败：${e.message}`)
    return null
  })

  if (!res) { failed = true; continue }
  // 200=已接收 202=已接收待校验密钥，都算成功
  if (res.status === 200 || res.status === 202) {
    console.log(`✓ 推送成功（HTTP ${res.status}，${batch.length} 条）`)
  } else {
    const text = await res.text().catch(() => '')
    console.error(`× 推送被拒（HTTP ${res.status}）：${text.slice(0, 200)}`)
    failed = true
  }
}

// 推送是尽力而为的旁路，失败不该让整条发布流程红掉 —— 只提示，不非零退出
if (failed) {
  console.error('\n部分批次未成功。检查：密钥文件是否可访问、URL 是否都属于本站域名。')
}
