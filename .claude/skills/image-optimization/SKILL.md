---
name: image-optimization
description: 图片优化：astro:assets 的 Image 与 getImage（仅服务端）、resolveCover 封面解析、远程图片授权、构建期转存防盗链、首屏 eager 与 priority、alt 与宽高、og 分享图。触发词：图片、封面、astro:assets、getImage、Image组件、WebP、AVIF、远程图片、防盗链、懒加载、og图、分享图
---

# 图片优化（next-ai-astro）

## 何时使用

- 数据里的封面是外链（B 站、GitHub、CDN）要显示在站内
- 图片加载慢、LCP 差、布局跳动（CLS）
- 外链图片在站内不显示（防盗链 / Referer）
- 要加本地图片、做响应式图片（srcset）、转 WebP / AVIF
- 设置分享图（og:image）
- 写 alt 文本

## 概述

内容站的图片（封面、头图）是首屏最重的资源，也是 SEO 与 AI 抓取的重要信号。本框架的原则：
- **能在构建期处理的都在构建期处理**：裁切、转 WebP、生成多尺寸 srcset、把外链图转存为站内文件。
- **每张 `<img>` 都有宽高**（防布局偏移）和 `alt`（装饰图 `alt=""`）。
- **首屏一行图不懒加载（eager），其中只有 1 张高优先级（priority）**，其余懒加载。

---

## 本框架现状

### `src/lib/images.ts`

```ts
export async function resolveCover(src: string, width = 640, height = 360): Promise<ResolvedImage> {
  if (!isOptimizableRemote(src)) {
    return { src, width, height };          // 本地 public/ 路径、未授权外链：原样返回
  }
  const image = await getImage({
    src, width, height, fit: 'cover', format: 'webp',
    widths: [Math.round(width * 0.625), width, Math.round(width * 1.5)],
  });
  return { src: image.src, srcSet: image.srcSet.attribute || undefined, width, height };
}
```

- `isOptimizableRemote(src)`：`http(s)` 外链且 hostname 在 `site.imageDomains` 里才优化。
- 列表卡片：`toCardData()` 调 `resolveCover(cover)`（640×360），结果进 `WorkCardData.cover`，由 `WorkCard` 渲染。
- 详情头图：`resolveCover(cover, 1280, 720)`，`loading="eager"` + `fetchpriority="high"`（本页唯一的高优先级图）。
- `astro.config.ts`：`image: { domains: site.imageDomains }`。
- 示例封面是 `public/examples/*.svg`（本地路径，不走优化）；分享图默认 `public/og-default.png`（1200×630）。

### `WorkCard` 的图片属性

```tsx
<img
  src={work.cover.src}
  srcSet={work.cover.srcSet}
  sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
  width={work.cover.width}
  height={work.cover.height}
  alt=""                                   // 卡片标题就在旁边，封面是装饰：读屏不重复朗读
  loading={eager ? 'eager' : 'lazy'}       // eager：不懒加载
  decoding="async"
  fetchPriority={priority ? 'high' : 'auto'} // priority：只给整页那 1 张 LCP 候选
/>
```

`eager` 与 `priority` 是两个独立 prop（口径与 `ui-components` 一致）：

| 位置 | `eager`（不懒加载） | `priority`（fetchpriority=high） |
|------|------------------|-------------------------------|
| 卡片网格在首屏的页面（列表页 `/works/`、分类页、首页精选） | 前 3 张（桌面端第一行） | 只有第 1 张 |
| 详情页 | 头图（页面里直接写的 `<img>`，`loading="eager"`） | 头图 `fetchpriority="high"`；相关推荐卡片都不设 |

各页面当前的具体取值以页面源码为准；新页面照这个口径写：`eager={index < 3} priority={index === 0}`。

---

## 标准做法

### 1. 外链封面：加白名单，构建期转存

```ts
// src/site.config.ts
imageDomains: ['i0.hdslb.com', 'i1.hdslb.com', 'i2.hdslb.com'],
```

加入后，`getImage()` 会在**构建期下载**原图、裁切、转 WebP、生成多个宽度，输出到 `dist/_astro/`。
页面上引用的是站内地址，于是：
- **防盗链问题消失**：防盗链一般校验浏览器请求的 `Referer`；构建期由 Node 在服务端下载，访客浏览器根本不再请求原站。
- **不依赖第三方 CDN 可用性**，图片与站点同域同缓存策略。
- 体积与尺寸可控（原图可能是几 MB 的大图）。

官方说明（images 指南）：未授权的远程图片**不会被优化**，`<Image />` 仍可防止布局偏移；`inferSize` 自 5.17.3 起也只对已授权域名生效。

🔴 **白名单以实际数据为准**：同步完数据后检查 `src/data/*.json` 里封面的真实域名再填，不要凭印象。
另外数据源映射时把 `http://` 统一改 `https://`（见 `data-sync`）。

### 2. `getImage()` 只能在服务端

Astro 6 起在客户端调用 `getImage()` 会直接抛错。正确流程：

```
页面 frontmatter / .astro 组件  ──getImage()──▶  { src, srcSet, width, height }  ──props──▶  React island / WorkCard
```

island 里只拿结果渲染 `<img>`，不 import `astro:assets`。

### 3. 选 `<Image />` 还是 `getImage()`

| 场景 | 用 |
|------|-----|
| `.astro` 组件里渲染单张图 | `<Image />`（自动生成 width/height/srcset） |
| 结果要传给 React 组件、或要同时拿 URL 做 og:image / JSON-LD | `getImage()`（本框架封装成 `resolveCover`） |
| 纯装饰 SVG、极小图标 | 直接 `<img>` 或内联 SVG |

`<Image />` 远程图片需要宽高：要么传 `width` + `height`，要么 `inferSize`（仅授权域名）：

```astro
---
import { Image } from 'astro:assets';
---
<Image src={remoteUrl} width={640} height={360} alt="…" />
<Image src={remoteUrl} inferSize alt="…" />
```

本地图片（放 `src/assets/`，import 引入）可用响应式布局：

```astro
---
import { Image } from 'astro:assets';
import hero from '@/assets/hero.png';
---
<Image src={hero} alt="…" layout="constrained" width={800} height={600} />
```

`layout="constrained"` 会自动生成 `srcset` 与 `sizes`；Astro 6 起响应式图片样式通过 `data-*` 属性实现，不再写内联 style。

### 4. 本地图片放哪

| 位置 | 是否优化 | 用于 |
|------|---------|------|
| `src/assets/` + import | 是（哈希文件名、格式转换、尺寸） | 页面里的内容图、头图 |
| `public/` | 否（原样复制，路径固定） | favicon、og 默认图、robots 等需要固定 URL 的文件 |

### 5. 首屏与懒加载

- `loading="eager"`（不懒加载）给首屏那一行：卡片网格前 3 张、详情页头图。
- `fetchpriority="high"` **整页只给 1 张**（LCP 候选）：卡片网格第 1 张，或详情页头图。多张同时 high 等于没有优先级，还会互相抢带宽。
- 其余一律 `loading="lazy"` + `decoding="async"`。
- 用 `<Image />` 渲染首屏图时可直接传 `priority`（Astro 5.10+，自动把 `loading` / `decoding` / `fetchpriority` 设为首屏图的最优值，
  见 `astro:assets` 参考），同样全页只用一次。
- `sizes` 要贴合真实布局：列表三栏时单卡约 400px，写对 `sizes` 浏览器才会选小图。

### 6. alt 规则

| 图片类型 | alt |
|---------|-----|
| 卡片封面（旁边就是标题链接） | `alt=""`（装饰，避免读屏重复） |
| 详情页头图 | `alt={\`${title} 封面\`}` 或更具体的描述 |
| 文章内容图 | 描述图中信息（图表写结论，截图写界面名称与要点） |
| 纯装饰（光斑、分隔） | `alt=""` 或用 CSS 背景 |

`pnpm check:seo` 会检查每张 `<img>` 是否**有** alt 属性、是否声明宽高。

### 7. og 分享图

- 默认 `site.ogImage`（`public/og-default.png`，1200×630）。
- 详情页把封面传给 `BaseLayout` 的 `image`（`works/[id].astro` 已这样做），`SEOHead` 会转成绝对地址。
- 需要为每条内容生成定制分享图时：构建期生成 PNG 放到可访问路径（例如用 Satori 类工具在端点里渲染），
  这属于扩展，先评估构建耗时。

---

## 扩展做法

### remotePatterns（按规则放行）

域名多、有子域名规律时用模式匹配（官方 images 指南）：

```ts
image: {
  remotePatterns: [{ protocol: 'https', hostname: '**.hdslb.com' }],
},
```

本框架的 `isOptimizableRemote()` 目前只比对 `site.imageDomains` 的精确域名；改用 `remotePatterns` 时要同步修改该函数的判断，
否则 `resolveCover` 会把本可优化的图片当成未授权外链原样返回。`src/lib/images.ts` 属于框架核心：在框架仓库里正常提交；
在孵化项目里单独一个提交、scope 写 `framework`（见 CLAUDE.md「框架核心 vs 业务代码」）。

### AVIF

`format: 'avif'` 体积更小但编码更慢，图片多时显著拉长构建时间。先保持 WebP；确有需要时对首屏头图单独用 AVIF。

### 构建期下载失败

远程图下载失败会导致构建失败。数据量大、源站不稳定时：

1. **同步阶段落到 `public/`**：数据源把封面下载到 `public/covers/<id>.jpg`，数据里存 `/covers/<id>.jpg`。
   `resolveCover()` 对非 http 地址原样返回，`<img src="/covers/x.jpg">` 能直接访问，只是**不再经过构建期优化**（不转 WebP、不生成 srcset），
   所以下载时就要把尺寸和格式处理好（如用框架已装的 `sharp` 缩到 1280 宽、转 WebP）。封面文件量大时评估仓库体积。
   🔴 **不要**存成 `src/assets/covers/...` 这类路径字符串：`src/assets` 下的文件只有被 `import` 或经 schema 的 `image()` 解析才会进构建产物，
   字符串原样进 `<img src>` 会全部裂图，而且 `check:seo` 查不出来。
2. 需要继续走构建期优化，就得改 schema 用 `image()` 辅助函数并同步改 `resolveCover()`（框架核心改动，见上一节的提交规则），
   写之前用 context7 `/withastro/docs` 核对 `image()` 在 `file()` loader 下的路径解析规则。
3. 最后兜底才在 `resolveCover` 外层 try/catch 回退到原外链：会重新暴露防盗链裂图，而且构建不再报错、`check:seo` 也发现不了，
   采用时必须在构建日志里打印回退了哪些条目，并在检查清单里人工核对。

---

## 检查清单

- [ ] 外链封面域名已加入 `site.imageDomains`（按实际数据核对）
- [ ] island 里没有调用 `getImage()` / `astro:assets`
- [ ] 每张图都有 `width` / `height` 和 `alt` 属性
- [ ] 首屏一行 `eager`；`fetchpriority="high"` 全页只有 1 张
- [ ] 数据里的本地封面路径都在 `public/` 下（没有 `src/assets/...` 字符串路径）
- [ ] `sizes` 与实际布局一致
- [ ] 详情页传了 `image` 给 `BaseLayout`，og:image 是绝对地址
- [ ] `pnpm build && pnpm check:seo` 无图片相关警告

## 常见坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 外链封面在站内显示裂图 | 防盗链拦截浏览器 Referer | 域名加白名单，构建期转存 |
| 加了白名单仍是原外链 | 数据是 `http://`，或域名与白名单不完全一致 | 改 https；核对精确 hostname |
| 构建报错下载超时 | 构建期要下载全部远程图 | 本机网络构建；或同步阶段落本地 |
| island 报 `getImage` 相关错误 | 客户端调用 | 移到页面 frontmatter |
| 页面加载时内容跳动 | `<img>` 没有宽高 | 补 `width` / `height`（或 `aspect-video` 容器） |
| 列表页首屏慢 | 首屏图被懒加载 / 所有图都 eager / 多张图都 `fetchpriority="high"` | 第一行 `eager`，只有第 1 张 `priority` |
| 本地封面全部裂图、构建却成功 | 数据里存了 `src/assets/...` 字符串路径 | 改放 `public/` 并存 `/covers/...`，或改用 schema `image()` |
| og:image 在社交平台不显示 | 相对路径 | 由 `SEOHead` 输出绝对地址，不要在页面里手写 |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `data-sync` | 封面 URL 的来源与 https 规范化 |
| `seo-meta` | og:image、JSON-LD 里的 image / thumbnailUrl |
| `performance-doctor` | LCP、CLS 指标诊断 |
| `islands-interaction` | 服务端算好图片结果再传给 island |

## 参考

- Astro 图片指南（授权远程图、layout、inferSize）：https://docs.astro.build/en/guides/images/
- `astro:assets` 参考（inferSize 5.17.3 起仅限授权域名、`priority`）：https://docs.astro.build/en/reference/modules/astro-assets/
- Astro 6 升级指南（getImage 客户端报错、响应式图片改用 data 属性、默认裁切、不放大）：https://docs.astro.build/en/guides/upgrade-to/v6/
