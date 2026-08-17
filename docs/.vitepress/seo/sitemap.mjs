// 给 sitemap 补 lastmod / changefreq / priority，供 config.ts 的 sitemap.transformItems 调用。
//
// 为什么需要 lastmod：搜索引擎靠它判断「这页变了没有、要不要重抓」。
// 缺这个字段，506 条 URL 在爬虫眼里一律「不知道新旧」，只能靠自己盲猜，
// 抓取预算被浪费在没变过的页面上，真正更新的页面反而迟迟不被重新索引。
//
// 时间从 git 取而不是文件 mtime：mtime 会被 clone、checkout、编辑器保存改掉，
// 在 CI 上更是全部等于构建时间 —— 那等于告诉搜索引擎「506 页刚刚全改了一遍」，
// 反复几次会被判定为不可信信号。git 提交时间才是内容真实变更的时刻。

import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * 一次性取出全部 Markdown 的最后提交时间。
 *
 * 不用「每个文件跑一次 git log」：506 次进程创建在 Windows 上要几十秒，
 * 而 `--name-only` 一遍遍历全部历史只需一次调用（实测约 1 秒）。
 *
 * ⚠️ `--name-only` 输出的路径始终相对**仓库根**（`docs/backend/x.md`），
 * 即使把 cwd 设成 docs 目录也一样。所以这里要剥掉 docs 前缀，
 * 才能和调用方按 docs 相对路径查表对上 —— 不剥的话查表全部落空，
 * 表现为「lastmod 一个都没有」，而且不报任何错。
 *
 * @param {string} docsRoot docs 目录绝对路径
 * @returns {Map<string, string>} docs 相对路径（正斜杠） → 日期串（YYYY-MM-DD）
 */
const collectGitDates = (docsRoot) => {
  const map = new Map()
  let out
  try {
    out = execFileSync(
      'git',
      ['log', '--pretty=format:@%cs', '--name-only', '--', '.'],
      { cwd: docsRoot, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }
    )
  } catch {
    // 不在 git 仓库里、或 git 不可用（某些 CI 镜像）—— 静默跳过，
    // sitemap 退回没有 lastmod 的状态，与改动前一致，不影响构建
    return map
  }

  // docs 目录相对仓库根的前缀，用于把 git 路径转成 docs 相对路径
  let prefix = ''
  try {
    const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: docsRoot, encoding: 'utf-8'
    }).trim()
    prefix = docsRoot.replace(/\\/g, '/').slice(repoRoot.length).replace(/^\//, '')
    if (prefix) prefix += '/'
  } catch {
    // 取不到就按无前缀处理
  }

  let current = null
  for (const line of out.split(/\r?\n/)) {
    if (line.startsWith('@')) {
      current = line.slice(1)
      continue
    }
    let path = line.trim()
    if (!path || !current) continue
    if (prefix && path.startsWith(prefix)) {
      path = path.slice(prefix.length)
    }
    // git log 按时间倒序：某文件第一次出现时就是它的最后提交，后面的都更旧
    if (!map.has(path)) {
      map.set(path, current)
    }
  }
  return map
}

/**
 * 按 URL 深度决定抓取优先级与更新频率。
 *
 * priority 是相对值（同站内页面之间的排序建议），不是绝对权重 ——
 * 全站给 1.0 等于全站没给，所以这里按层级拉开档次。
 */
const rank = (url) => {
  // 去掉协议与域名，只看路径部分
  const path = url.replace(/^https?:\/\/[^/]+/, '')
  if (path === '/' || path === '/index.html') {
    return { priority: 1.0, changefreq: 'daily' }
  }
  // 商业页面：产品矩阵与技术服务是转化入口，给次高优先级
  if (/^\/(products|services)\.html?$/.test(path)) {
    return { priority: 0.9, changefreq: 'weekly' }
  }
  // 各板块首页（/backend/、/frontend/ 这类，只有一层）
  const depth = path.split('/').filter(Boolean).length
  if (depth <= 1) {
    return { priority: 0.8, changefreq: 'weekly' }
  }
  return { priority: 0.7, changefreq: 'monthly' }
}

/**
 * 增强 sitemap 条目。
 *
 * @param {Array<{url: string, [k: string]: unknown}>} items VitePress 传入的原始条目
 * @param {string} docsRoot docs 目录绝对路径
 */
export const enhanceSitemap = (items, docsRoot) => {
  const dates = collectGitDates(docsRoot)

  return items.map((item) => {
    const { priority, changefreq } = rank(item.url)
    const enhanced = { ...item, priority, changefreq }

    // item.url 形如 https://ruoyi.plus/backend/common/core.html
    // 反推回源文件：/backend/common/core.html → backend/common/core.md
    const path = item.url.replace(/^https?:\/\/[^/]+\//, '')
    const md = path === '' || path === 'index.html'
      ? 'index.md'
      : path.replace(/\.html$/, '.md')

    const date = dates.get(md)
    if (date) {
      enhanced.lastmod = date
    } else if (existsSync(join(docsRoot, md))) {
      // 文件存在但 git 里查不到（新增未提交）—— 不编造时间，宁可留空
      // 留空只是少一个提示，编错则是主动给出错误信号
    }
    return enhanced
  })
}
