---
name: data-sync
description: 构建前从外部接口拉数据写成集合 JSON：scripts/sync 运行器与数据源协议、重试退避与缓存、安全落盘，含 B 站投稿同步与软件版本数据。触发词：数据同步、下载页、版本数据、安装包、更新日志、versions.json、拉取接口、抓数据、外部API、B站、bilibili、GitHub API、RSS、定时更新数据、scripts/sync、数据源、防风控
---

# 数据同步（next-ai-astro）

## 何时使用

- 站点内容来自外部平台（视频平台、代码托管、博客 RSS、商品接口）
- 要写一个新的数据源 / 改字段映射
- 同步失败、接口被限流 / 风控（B 站 `-352` / `-412`）、数据突然变少
- 要定时更新数据（本机计划任务 / 服务器 cron / CI）
- 做 B 站视频归类站、作品集同步（WBI 签名、合集映射分类）

## 概述

外部数据**不在构建时直连**，而是先由 `scripts/sync` 拉取、校验、落成 `src/data/*.json` 并提交，构建只读本地文件。
这样做的原因：构建可复现（同一提交构建出同一站点）、对方接口挂了不影响发版、数据变化能在 git diff 里审查。

```
外部接口 ──(pnpm sync)──▶ 数据源映射 ──▶ 校验 ──▶ 原子写入 src/data/xxx.json ──(git commit)──▶ pnpm build
                              失败 / 空 / 骤降 → 不写入，保留上一版
```

---

## 本框架现状

| 文件 | 作用 |
|------|------|
| `scripts/sync/run.mjs` | 运行器：加载数据源、校验、原子写、稳定排序、退出码 |
| `scripts/sync/context.mjs` | 数据源上下文：`request` / `fetchJson` / `cache` / `env` / `log` / `sleep` |
| `scripts/sync/sources/example.mjs` | 示例数据源（`enabled: false`，不联网） |
| `.env.example` | 数据源需要的环境变量模板（`SYNC_*`） |
| `.cache/sync/<源名>/` | 缓存目录（gitignore，可随时删） |

### 命令

```bash
pnpm sync                      # 运行全部 enabled !== false 的数据源
pnpm sync bilibili             # 只跑点名的数据源（enabled: false 的也能点名跑）
pnpm sync bilibili --dry-run   # 只拉取与校验，不写文件，报告是否有差异
pnpm sync --allow-fail         # 有数据源失败也返回 0（给 CI 的「尽力同步」用）
pnpm sync bilibili --force     # 跳过「骤降 50%」保护（确认是真实删减时）
```

### 数据源协议

```js
// scripts/sync/sources/<name>.mjs
export default {
  name: 'works',                  // 命令行用它点名
  output: 'src/data/works.json',  // 写入目标（对应 content.config.ts 里的 file() loader）
  enabled: true,                  // false = 只有点名时才跑
  /** @param {ReturnType<import('../context.mjs').createContext>} ctx */
  async fetch(ctx) {
    return [/* 每条必须有唯一 id，字段符合集合 schema */];
  },
};
```

文件名以 `_` 开头的模块不会被加载，可用来放共享工具（如 `_bilibili-wbi.mjs`）。

### 四条安全规则（运行器已实现，数据源不用重复写）

1. **拉取失败 / 返回空数组 / id 重复 → 不写文件**，保留上一版，站点绝不会被构建成空页面
2. **条目数比上一版骤降超过 50%**（上一版 ≥ 10 条时）→ 视为异常不写入，需人工确认后 `--force`
3. **先写 `.tmp` 再 rename**：中断不会留下半截 JSON
4. **按 id 稳定排序输出**：数据没变时 git diff 为空，有变化时 diff 可读

### context 工具

| 方法 | 说明 |
|------|------|
| `ctx.request(url, { retries, timeoutMs, backoffMs, headers })` | 超时（默认 15s）+ 重试（默认 3 次，指数退避从 1s 起）。429 / 5xx / 网络错误重试；其余 4xx 直接失败 |
| `ctx.fetchJson(url, options)` | 同上并解析 JSON |
| `ctx.cache(key).read(maxAgeMs)` / `.write(value)` | JSON 文件缓存，减少重复请求（签名密钥、详情接口） |
| `ctx.env('SYNC_XXX')` | 读必填环境变量，缺失时报明确错误（会自动读项目根 `.env`） |
| `ctx.sleep(ms)` / `ctx.log(...)` | 限速、带数据源前缀的日志 |

---

## 标准做法

### 1. 写一个数据源

1. 复制 `scripts/sync/sources/example.mjs` 改名，改 `name` / `output`。
2. `fetch()` 里：请求 → 检查业务状态码 → 分页取全 → 映射字段。
3. `pnpm sync <name> --dry-run` 看条数与差异，再正式运行，`git diff src/data/` 审查后提交。

### 2. 字段映射规范

映射目标是 `src/content.config.ts` 的 schema，逐条对齐：

| 目标字段 | 规则 |
|---------|------|
| `id` | 平台稳定 id（BV 号、repo 名），只含 `[A-Za-z0-9_-]`；**不要用标题做 id**（改标题就断链） |
| `title` | 原样，去首尾空白 |
| `summary` | 取简介前 80~120 字（按字符截，中文不乱码）；简介为空时写**真实**的兜底句，不编造 |
| `description` | 完整简介，保留换行（详情页按空行分段） |
| `date` | ISO 字符串；平台给秒级时间戳时 `new Date(sec * 1000).toISOString()` |
| `cover` | `http://` 统一改 `https://`；域名加进 `site.imageDomains` 让构建期转存（见 `image-optimization`） |
| `category` | 映射到 `categories.json` 里**已存在**的分类 id；未映射的归到兜底分类并 `ctx.log` 提示 |
| `metrics` | 只放平台真实返回的数字。保留键：`views` = 播放 / 浏览**次数**（非负整数），`duration` = 时长**秒**（非负整数）；其他键自定（见 `content-collections` 3.1） |

> 分类名和分类导语是 SEO 文案，应由人写在 `src/data/categories.json`；同步脚本只负责把条目**映射**到分类，
> 不自动生成分类描述。

### 3. 业务状态码必须检查

很多平台（包括 B 站）HTTP 状态是 200，真正的结果在 JSON 的 `code` 里。**不检查就会把错误响应当成空列表**：

```js
const json = await ctx.fetchJson(url, { headers });
if (json.code !== 0) {
  throw new Error(`接口返回 code=${json.code} message=${json.message}`);
}
```

抛错后运行器会保留上一版数据。

### 4. 分页与限速

- 按平台返回的总数（`count` / `total`）判断何时停，不要「拿到空页才停」（空页也可能是被限流）。
- 页与页之间 `await ctx.sleep(1000~2000)`，一次同步只跑一个平台的全量。
- 详情类接口（每条一个请求）务必用 `ctx.cache(id)` 缓存，数据没变的条目不重复请求。

### 5. 什么时候跑、在哪跑

| 方式 | 适合 | 注意 |
|------|------|------|
| 本机手动 `pnpm sync` | 数据更新不频繁（每周几次） | 最稳：本机是家用网络，平台风控最宽松（经验判断，见下方 B 站节） |
| 本机计划任务 | 每天定时 | 同步后仍需构建 + 部署，建议串成一个脚本 |
| 国内服务器 cron | 无人值守 | 服务器 IP 属于数据中心，部分平台更容易触发风控 |
| CI（GitHub Actions 等） | 开源数据、无风控接口 | 海外 IP，访问国内平台接口不稳定 |

同步 → 构建 → 部署三步不要合并进 Dockerfile（镜像构建要可复现），见 `deployment-guide`。

---

## B 站 UP 主投稿同步（示例，接真实项目时使用）

> 🔴 以下接口来自社区整理的**非官方**文档 bilibili-API-collect，B 站随时可能调整。
> 原仓库 SocialSisterYi/bilibili-API-collect 在编写本技能时（2026-09）已归档（archived），默认分支改为 `deprecated`、
> 只剩 README 与一张说明图，文档文件与 issues 链接均为 404；
> 以下内容核对自其镜像 **pskdje/bilibili-API-collect**（`docs/user/space.md`、`docs/video/collection.md`、`docs/misc/sign/wbi.md`）。
> 实现前先用 `--dry-run` 实测，与文档不符以实测为准并更新本节。

### 接口清单

| 用途 | 接口 | 鉴权 | 来源 |
|------|------|------|------|
| 获取 WBI 密钥 | `GET https://api.bilibili.com/x/web-interface/nav` → `data.wbi_img.img_url` / `sub_url` | 无需登录（未登录也返回两个 key，code 为 -101） | wbi.md |
| **UP 主投稿列表（主力）** | `GET https://api.bilibili.com/x/space/wbi/arc/search` | WBI 签名 | space.md「查询用户投稿视频明细」 |
| 投稿列表（备选） | `GET https://api.bilibili.com/x/series/recArchivesByKeywords` | 无签名；space.md 在投稿列表一节注明它「功能基本相同, 暂未发现风控校验」，但实测同样会被 HTTP 412 拦截（见下方「实测记录」） | 参数与返回见 collection.md「根据关键词查找视频」 |
| 合集内视频 | `GET https://api.bilibili.com/x/polymer/web-space/seasons_archives_list` | 需验证 Referer；WBI 可选 | collection.md「获取视频合集信息」 |
| 系列 + 合集列表 | `GET https://api.bilibili.com/x/polymer/web-space/seasons_series_list` | 正常浏览器 UA；仍被风控再带 `.bilibili.com` 下的 Referer | collection.md「获取系列和合集视频」 |

### 投稿列表 `x/space/wbi/arc/search`

参数（space.md）：`mid`（必要）、`order`（`pubdate` 最新 / `click` 最多播放 / `stow` 最多收藏，默认 pubdate）、
`tid`（分区筛选，默认 0）、`keyword`、`pn`（默认 1）、`ps`（默认 30）。

返回：`data.list.vlist[]` 是视频数组，`data.page.count` 是总稿件数。`vlist` 每项的关键字段：

| 字段 | 含义 | 映射到 |
|------|------|-------|
| `bvid` | 稿件 BV 号 | `id` |
| `title` | 标题 | `title` |
| `description` | 简介（🔴 实测最多 255 字，长简介被截断；完整简介要逐条请求详情接口） | `summary` / `description` |
| `created` | 投稿时间（时间戳，秒） | `date` |
| `pic` | 封面 URL | `cover`（改 https） |
| `length` | 时长，文档标注格式 `MM:SS` | `metrics.duration`（换算成秒） |
| `play` / `comment` / `video_review` | 播放 / 评论 / 弹幕数 | `play` → `metrics.views`（保留键，次数）；其余进自定义键 |
| `typeid` | 分区 tid | 可做辅助标签 |
| `season_id` / `meta` | 所属**合集或课堂**（都不属于时 season_id 为 0，meta 为 null）；`meta.id` 合集 id、`meta.title` 合集名；课堂时 `meta.mid` 为 0 | `category` 映射依据（课堂视频按需单独映射或归兜底分类） |
| `is_lesson_video` / `jump_url` | 是否课堂视频 / 跳转到课堂的链接 | 课堂视频按需过滤 |
| `is_union_video` / `author` / `mid` | 合作视频时 UP 主不一定是目标用户 | 按需过滤 |
| `is_self_view` | 是否仅自己可见 | 为 true 的不要同步 |

业务状态码：`0` 成功、`-400` 请求错误、`-412` 请求被拦截（space.md）；合集类接口文档另记有 `-352` 请求被风控（collection.md）。

### WBI 签名算法（wbi.md）

1. 请求 nav 接口，从 `img_url` / `sub_url` 截取**文件名去掉 `.png`** 得到 `img_key`、`sub_key`。
2. `mixin_key` = 把 `img_key + sub_key` 按下表重排后取前 32 位。
3. 参数里加 `wts`（当前秒级时间戳），按 key 排序；每个值去掉 `!'()*` 字符后 `encodeURIComponent`。
4. `w_rid = md5(拼好的 query 字符串 + mixin_key)`，把 `w_rid` 和 `wts` 带上请求。
5. 密钥**每日更替**，缓存不超过一天。

```js
// scripts/sync/sources/_bilibili-wbi.mjs（下划线开头 = 不作为数据源加载，只做工具模块）
// B 站 WBI 签名：算法与重排表来自 bilibili-API-collect docs/misc/sign/wbi.md
import { createHash } from 'node:crypto';

const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38,
  41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36,
  20, 34, 44, 52,
];

const fileKey = (url) => url.slice(url.lastIndexOf('/') + 1).split('.')[0];

/** 取 img_key / sub_key（缓存 12 小时，密钥每日更替） */
export async function getWbiKeys(ctx, headers) {
  const cache = ctx.cache('wbi-keys');
  const cached = cache.read(12 * 3600 * 1000);
  if (cached) return cached;
  const json = await ctx.fetchJson('https://api.bilibili.com/x/web-interface/nav', { headers });
  // 未登录时 code 为 -101，但 wbi_img 仍会返回
  const wbi = json?.data?.wbi_img;
  if (!wbi?.img_url || !wbi?.sub_url) throw new Error(`nav 接口未返回 wbi_img（code=${json?.code}）`);
  const keys = { imgKey: fileKey(wbi.img_url), subKey: fileKey(wbi.sub_url) };
  cache.write(keys);
  return keys;
}

/** 返回带 wts 与 w_rid 的查询字符串 */
export function signQuery(params, { imgKey, subKey }) {
  const orig = imgKey + subKey;
  const mixinKey = MIXIN_KEY_ENC_TAB.map((n) => orig[n]).join('').slice(0, 32);
  const all = { ...params, wts: Math.round(Date.now() / 1000) };
  const query = Object.keys(all)
    .sort()
    .map((key) => {
      const value = String(all[key]).replace(/[!'()*]/g, '');
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  const wRid = createHash('md5').update(query + mixinKey).digest('hex');
  return `${query}&w_rid=${wRid}`;
}
```

### 数据源示例

```js
// scripts/sync/sources/bilibili.mjs
// B 站 UP 主投稿 → src/data/works.json；合集按 bilibili.map.json 映射到分类
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getWbiKeys, signQuery } from './_bilibili-wbi.mjs';

const PAGE_SIZE = 30; // 文档默认值；调大前先实测
const FALLBACK_CATEGORY = 'uncategorized'; // 需在 categories.json 里存在

/** "MM:SS" / "HH:MM:SS" → 秒 */
const toSeconds = (length) =>
  String(length)
    .split(':')
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);

export default {
  name: 'bilibili',
  output: 'src/data/works.json',
  enabled: true,

  async fetch(ctx) {
    const mid = ctx.env('SYNC_BILIBILI_UID');
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
      Referer: `https://space.bilibili.com/${mid}`,
    };
    // 合集 id → 分类 id 的人工映射，例：{ "12345": "getting-started" }
    const mapFile = join(process.cwd(), 'scripts', 'sync', 'bilibili.map.json');
    const seasonMap = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, 'utf8')) : {};

    // 实测（2026-09-26）：arc/search 只带 WBI 签名返回 -352，带上 buvid 指纹 cookie 后第 1 页可过（翻页仍可能 -352，见「实测记录」）
    const spi = await ctx.fetchJson('https://api.bilibili.com/x/frontend/finger/spi', { headers });
    if (spi.code === 0) headers.Cookie = `buvid3=${spi.data.b_3}; buvid4=${encodeURIComponent(spi.data.b_4)}`;

    const keys = await getWbiKeys(ctx, headers);
    const videos = [];
    let total = Infinity;
    for (let pn = 1; videos.length < total; pn += 1) {
      const query = signQuery({ mid, ps: PAGE_SIZE, pn, order: 'pubdate' }, keys);
      const json = await ctx.fetchJson(`https://api.bilibili.com/x/space/wbi/arc/search?${query}`, { headers });
      if (json.code !== 0) throw new Error(`arc/search code=${json.code} message=${json.message}`);
      const list = json.data?.list?.vlist ?? [];
      total = json.data?.page?.count ?? 0;
      if (list.length === 0) break;
      videos.push(...list);
      ctx.log(`第 ${pn} 页 ${list.length} 条，累计 ${videos.length}/${total}`);
      // 实测 1.2~2.5 秒间隔、约 8 次请求后被 412 拦截，间隔至少 3 秒并尽量减少总请求数
      await ctx.sleep(3000);
    }

    const unmapped = new Set();
    const items = videos
      .filter((video) => !video.is_self_view)
      .map((video) => {
        const seasonId = video.season_id ? String(video.season_id) : '';
        const category = seasonMap[seasonId] ?? FALLBACK_CATEGORY;
        if (seasonId && !seasonMap[seasonId]) unmapped.add(`${seasonId}(${video.meta?.title ?? '未知合集'})`);
        const description = (video.description ?? '').trim();
        return {
          id: video.bvid,
          title: video.title.trim(),
          summary: Array.from(description || video.title).slice(0, 100).join(''),
          description: description || undefined,
          category,
          tags: [],
          date: new Date(video.created * 1000).toISOString(),
          cover: String(video.pic).replace(/^http:\/\//, 'https://'),
          url: `https://www.bilibili.com/video/${video.bvid}/`,
          // 详情页播放器的判据；schema 需先加 bvid 字段（security-guard 8.1），漏写这一行同步后就没有播放器
          bvid: video.bvid,
          featured: false,
          metrics: { views: video.play, comments: video.comment, duration: toSeconds(video.length) },
        };
      });
    if (unmapped.size) ctx.log(`⚠️ 未映射的合集（归入 ${FALLBACK_CATEGORY}）：${[...unmapped].join('、')}`);
    return items;
  },
};
```

配套改动：
- `.env` 里写 `SYNC_BILIBILI_UID=<UP 主 mid>`，`.env.example` 已预留注释行。
- `site.config.ts` 的 `imageDomains` 加封面域名（B 站封面常见 `i0.hdslb.com`、`i1.hdslb.com`、`i2.hdslb.com`，合集预览里还实测出现过 `archive.biliimg.com`；**以实际同步到的 `pic` 域名为准**，同步后 `grep` 一遍 works.json 再填）。
- `categories.json` 里加兜底分类 `uncategorized`，以及每个合集对应的分类（分类名、导语人工写）。
- 精选（`featured`）由人决定：可在映射文件里维护精选 BV 号列表，映射时置 true。需要自动补位时**不要按总播放排序**——总播放随时间累积，老视频会永远霸榜（实测一个 UP 主的总播放第一是 6 年前的视频）；改用「近 12 个月、发布满 14 天、按日均播放 = 播放 ÷ 发布天数」，并允许人工排除。
- 合集列表 `seasons_series_list` 里合集的 `meta.cover` 可能是 B 站默认占位图（文件名含 `default`），这时系列封面改用第 1 集的封面；`meta.description` 多数为空，导语要人工写，不用模板句凑。
- 映射是逐字段显式写的：`content.config.ts` 给 works 加了字段（如 `bvid`），所有同步源的映射都要补上，否则跑一次同步该字段就被清空，构建也不会报错。

### 风控处置

| 现象 | 处置 |
|------|------|
| `code=-412` / HTTP 412 | 请求被拦截：**立即停止**，不要连续重试（运行器对 412 不重试）；隔几小时后在本机网络重跑 |
| `code=-352` | 风控校验失败：检查签名是否过期（删 `.cache/sync/bilibili/` 重取密钥）、UA 与 Referer 是否正常 |
| arc/search 持续失败 | 改用备选接口 `x/series/recArchivesByKeywords`（`mid` + `keywords` 为空取全部，`ps` 最大 100）；该接口返回 `archives[]`，字段为 `aid` `bvid` `title` `pic` `pubdate` `duration`（秒）`stat.view`（只有播放数，没有评论 / 弹幕）和简介 `desc`——`desc` 与 arc/search 一样**截断到 255 字**，完整简介要对单条请求详情接口并按 BV 号缓存 |
| 合集接口失败 | 检查 Referer；合集信息也可直接从投稿列表的 `meta` 字段取得，不一定要单独请求 |

**实测记录**（2026-09-26，本机家用网络、匿名、浏览器 UA + space Referer，一个约 118 条投稿的 UP 主）：

| 请求 | 结果 |
|------|------|
| `x/web-interface/card?mid=`（UP 主公开卡片，无签名） | ✅ code 0；`archive_count` 可用来核对投稿总数 |
| `x/frontend/finger/spi`（取 buvid3 / buvid4） | ✅ code 0 |
| arc/search 只带 WBI 签名 | ❌ `-352 风控校验失败` |
| arc/search 签名 + buvid cookie | 第 1 页 ✅；第 2 页 ❌ `-352`（`dm_img_*` 参数这次没来得及试） |
| arc/search 的 `page.count` | 比公开卡片的 `archive_count` 少 4 条，原因未查明——同步时用两者互相核对并报警 |
| `seasons_series_list`（不签名） | ✅ code 0，一次返回全部合集 + 系列（含前几集预览） |
| `recArchivesByKeywords` 第 1 页（`ps=100`） | ✅ 但只返回 96 条（total 118）；第 2 页 ❌ **HTTP 412** |
| 两个列表接口的简介 | 同一 BV 号两边完全一致，都截断到 255 字 |

结论：匿名能拉，但很脆——全程约 8 次请求、间隔 1.2~2.5 秒就吃了 412。同步要**只在本机网络、间隔 ≥ 3 秒、总请求数尽量少**（合集成员、详情接口都按 id 缓存），412 / -352 立即停，保留上一版数据。

**仍待核实**（写实现时实测，结果回填本节）：
- arc/search 翻页 -352 是否靠 `dm_img_list` / `dm_img_str` / `dm_cover_img_str` 等参数解决
  （社区 issue：https://github.com/SocialSisterYi/bilibili-API-collect/issues/868 ，编写时无法打开原文核实）。
- 视频详情接口（取完整简介）的路径、是否需要签名、批量请求时的风控阈值。
- 数据中心 / 海外 IP 更容易被拦截：属经验判断，未见文档说明；**默认建议在本机网络运行同步**。
- `ps` 可设置的最大值（`recArchivesByKeywords` 传 100 只回 96 条，是否有过滤待查）。

### 嵌入播放器（详情页用）

B 站外链播放器：`https://player.bilibili.com/player.html?bvid=<BV号>&autoplay=0`（官方说明页：https://player.bilibili.com/ ）。
iframe 放在详情页时用 `loading="lazy"`，并保留醒目的「去 B 站观看」按钮（点赞、投币、关注只在 B 站站内生效）。

🔴 iframe 是第三方内容进站，字段设计、属性和 CSP 以 `security-guard` 第 8 节为准（本节不另写一套），要点：

| 要求 | 做法 |
|------|------|
| 数据只存 BV 号 | works 单独加 `bvid` 字段（`^BV[0-9A-Za-z]{10}$`），上面的映射写 `bvid: video.bvid`；播放器地址用固定 `https://` 模板拼，**不要**把数据源给的整段 URL 放进 `src` |
| 域名白名单 | 只存 ID 时主机名是代码常量，不必再校验；数据源只能给完整地址时才需要 https + 精确主机名白名单。白名单放 `site.config.ts`，开 CSP 时同步进 `frame-src` |
| `sandbox` | 默认加 `sandbox`，只放行播放器实际需要的能力（放行项以 `security-guard` 与实测为准，不要图省事整段去掉） |
| `title` | 写可读标题（如 `title={\`${title} 播放器\`}`），读屏才知道这个 iframe 是什么 |
- 页面嵌了播放器，详情页才可以标 `VideoObject`（`embedUrl` 指向该播放器地址）；只有封面 + 外链按钮、或「点击封面才插入 iframe」的 facade，
  都不算可观看页，不能标 VideoObject（见 `seo-meta`「VideoObject」一节）。

---

## 软件版本数据（卖软件的站：下载页 / 更新日志）

框架自带一套「发版清单 → 下载页」的数据链，默认不启用：

| 文件 | 作用 |
|------|------|
| `scripts/sync/sources/releases.mjs` | 拉发版脚本上传的 `versions.json`，映射成 `src/data/releases.json`；默认 `enabled: false` |
| `src/lib/releases.ts` | zod 校验 + 排序 + `latestRelease` / `findAsset` / `formatSize` / `noteLines` |
| `tests/unit/releases.test.ts` | 排序、白名单、sha256、多平台取包 |

启用：改 `releases.mjs` 的 `VERSIONS_URL` 与 `releases.ts` 的 `DOWNLOAD_ORIGINS`（精确到项目目录、以 `/` 结尾）→ `enabled: true` → `pnpm sync releases` → 提交 `chore(data): …`。

三条规矩（都由 `releases.ts` 的 schema 守着，测试已反证）：

1. **下载地址白名单**：主安装包和每个平台包的 `url` 都必须在 `DOWNLOAD_ORIGINS` 下，否则构建失败。宁可不发站，也不在下载页挂别处的安装包
2. **sha256 可选，给了就必须是 64 位小写十六进制**：有就在下载页原样展示给用户核对；清单不给校验值的（只有版本号 / 说明 / 日期）也能发站
3. **多平台包放 `assets`，缺省空数组**：老版本只有主安装包也能解析；页面用 `findAsset(latestRelease, 平台)` 取包，**取不到就整块不显示**，不挂空按钮、不提前写「已支持」

清单只有版本号、没有下载地址的（如 storyloom 的 versions.json）：数据源按发版流程的命名规则拼地址，再对每个包
`ctx.request(url, { method: 'HEAD' })`，200 才收录并取 `content-length` 当大小，404 不收——页面上不会出现点了 404 的按钮。
不公开的词（合作方名等）在数据源里从更新说明剔掉，并写单测。

页面用法：

```astro
---
import { findAsset, formatSize, latestRelease } from '@/lib/releases';
const mac = findAsset(latestRelease, 'macos-aarch64');
---
{latestRelease ? <a href={latestRelease.url} download>下载 v{latestRelease.version}（{formatSize(latestRelease.size)}）</a> : <p>即将发布</p>}
{mac && <a href={mac.url} download>{mac.label}</a>}
```

- 首发前清单 404：运行器按失败处理、保留空数组，页面走「即将发布」空态，构建照常
- 平台标识与发版脚本一致；要加平台改 `ASSET_PLATFORMS`
- 对象存储的文件名用 ASCII（schema 会拦中文与空格）：中文进网址要百分号编码，下载后的文件名也会变
- 不卖软件的站不用管：没有页面引用 `releases.ts` 时它不进产物
- 🔴 托管平台推送即构建时，把同步串进 build：`node scripts/sync/run.mjs releases --allow-fail && …`——拉不到时保留仓库里已提交的那份、构建不失败；
  发版后由发版流程改一下站点仓库里的触发文件（如 `public/.last-release.json`）推送，触发重建拿到新版本（知识库站的做法）
- 安装包大小：清单不给的，HEAD 取 `content-length`；老版本复用上一版数据里已有的大小，不必每次全量 HEAD

## 检查清单

- [ ] 新数据源用 `--dry-run` 看过条数与差异再正式写入
- [ ] 检查了业务状态码（`code !== 0` 抛错）
- [ ] 分页按总数停止，页间有 `sleep`
- [ ] id 是平台稳定 id，只含 `[A-Za-z0-9_-]`
- [ ] 封面改 https，域名已加入 `site.imageDomains`
- [ ] 分类映射到已存在的分类，未映射的有日志提示
- [ ] 凭据 / UID 走 `.env`（`ctx.env`），没写死在源码里
- [ ] 同步后 `git diff src/data/` 审查过，再 `pnpm build && pnpm check:seo`
- [ ] 详情页嵌了播放器的：https + 域名白名单 + `sandbox` + `title` 齐全（`security-guard`）

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 同步「成功」但站点变空 | 把错误响应当空列表写入 | 用运行器（空数组会被拒）；检查业务 code |
| 每次同步 git diff 都是整文件 | 输出顺序不稳定 / 带了抓取时间戳 | 运行器已按 id 排序；数据里不要放「同步时间」字段 |
| 构建报 schema 校验失败 | 映射字段类型不对（数字 id、缺 summary、日期格式） | 对照 `content.config.ts` 修映射 |
| 封面在构建时下载失败 | 域名没进 `imageDomains`，或用了 http | 加白名单、改 https |
| 连续重试后被封更久 | 对 412 / 风控做了重试 | 风控类错误直接停，隔时间再跑 |
| 视频简介停在半句话 | B 站两个列表接口的简介都截断到 255 字 | 详情接口补全并按 BV 号缓存（首次分批跑）；补齐前页面截到最后一个完整行，给「在 B 站看完整简介」链接，不自己续写 |
| 同步脚本在 Docker 构建里跑 | 构建不可复现、依赖网络 | 同步在构建之前单独运行并提交数据 |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `content-collections` | 目标 schema 怎么定义；新增内容类型的整体步骤 |
| `image-optimization` | 远程封面的构建期转存与防盗链 |
| `env-config` | `.env` 与 `SYNC_*` 变量管理 |
| `deployment-guide` | 同步 → 构建 → 部署的串联与定时 |
| `bug-detective` | 同步报错的深入排查 |
| `security-guard` | 嵌入第三方播放器（iframe）的安全要求、CSP `frame-src` |
| `seo-meta` | 嵌了播放器的详情页怎么标 VideoObject |

## 参考

- bilibili-API-collect 镜像（本节核对来源）：
  - 投稿列表：https://github.com/pskdje/bilibili-API-collect/blob/main/docs/user/space.md
  - 合集 / 系列 / 关键词查找：https://github.com/pskdje/bilibili-API-collect/blob/main/docs/video/collection.md
  - WBI 签名：https://github.com/pskdje/bilibili-API-collect/blob/main/docs/misc/sign/wbi.md
- 原仓库（编写时已归档、文档已清空）：https://github.com/SocialSisterYi/bilibili-API-collect
- B 站外链播放器说明：https://player.bilibili.com/
