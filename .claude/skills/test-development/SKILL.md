---
name: test-development
description: Vitest 单元测试：测 src/lib 纯函数、schema 安全规则与同步源字段映射，按需用 Container API 测 .astro 输出，含 Astro 7 下的配置坑。触发词：单元测试、Vitest、测试用例、写测试、断言、覆盖率、参数化测试、Container API、测试失败
---

# 单元测试开发（Vitest）

## 何时使用

- 给 `src/lib` 新增或修改的函数补单元测试
- 写测试用例、断言、参数化测试
- 测 `.astro` 组件渲染出的 HTML（Container API）
- 测数据同步源的字段映射（`scripts/sync/sources`）
- 提升测试覆盖率、排查 vitest 报错

其他常见说法：vitest、expect、describe、it、coverage、test.each。

## 测试分层：各层抓什么

框架的质量保障分三层，**单元测试只负责最底下那层**，别拿它去测别的层能更便宜抓到的问题。

| 层 | 工具 | 抓什么 | 命令 |
|----|------|-------|------|
| 纯函数 | Vitest（本技能） | `src/lib/*.ts` 的逻辑：URL 拼接、截断、转义、检索打分、格式化、字段映射 | `pnpm test` |
| 构建产物 | `scripts/check-seo.mjs` | 每页 canonical / og:url / 描述重复 / JSON-LD / alt / robots / llms.txt | `pnpm check:seo` |
| 页面行为 | aicoder 浏览器截图 / Playwright | 筛选交互、水合前输入保留、深色模式、跳转、与原型的视觉差异 | 见 `e2e-test` 技能 |

判断口诀：**能用输入输出描述的逻辑 → 单测；要看整页 HTML 才知道对不对 → check-seo；要点、要看 → e2e。**

## 框架现状

```
vitest.config.ts          # getViteConfig(...)：复用 Astro 的 Vite 配置，@/ 别名直接可用
tests/unit/
├── seo.test.ts             # buildTitle / absoluteUrl / truncate / serializeJsonLd / breadcrumbJsonLd
├── search.test.ts          # normalize / parseQuery / searchItems（中文子串命中、AND 语义、排序）
├── format.test.ts          # formatDate（东八区）/ formatCount / formatDuration
├── content-schema.test.ts  # 通用对照：裸 z.url() 会放行 javascript:（不依赖任何集合，裁剪模块后仍保留）
└── works-schema.test.ts    # 安全回归：真实 schema 里 works.url 只收 http/https（works 预设裁剪时一并删除）
```

🔴 模块专属的用例放在以模块命名的文件里（`<集合>-schema.test.ts`、`tests/e2e/<模块>.spec.ts`），通用用例留在公共文件：
`module-strip` 的预设只删模块自己的测试文件，混写在一起会让裁剪连通用用例一起删掉。

`works-schema.test.ts` 是**安全类规则**的写法示范：直接从 `content.config.ts` 取字段，正反例都测（http/https 放行，`javascript:` / `data:` 拒绝），
有人删掉真实 schema 里的协议限制时会变红；`content-schema.test.ts` 的对照用例说明为什么必须带 `protocol`。取字段的写法（`file()` / `glob()` 集合的 `schema` 是 Zod 对象）：

```ts
import { collections } from '../../src/content.config';

// 类型断言只为拿到 shape；这里测的就是线上真正生效的那条规则
const shape = (collections.works.schema as unknown as { shape: Record<string, { safeParse(v: unknown): { success: boolean } }> }).shape;
expect(shape.url.safeParse('javascript:alert(1)').success).toBe(false);
```

新增会进 `href` / `src` 的外部字段时，按这个方式在 `<集合>-schema.test.ts` 里补正反例。

`pnpm test` = `vitest run`（单次运行，不进 watch）。它也是 `pnpm verify` 的最后一步。

### vitest.config.ts 的一个坑

```ts
/// <reference types="vitest/config" />
// ↑ 必须有：getViteConfig 的参数类型来自 Vite，本身不认识 `test` 字段，
//   缺了这行 `pnpm test` 能跑，但 `pnpm build` 里的 astro check 会报 ts(2353)
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
```

- **environment 必须是 `node`**：Astro 6 起不允许在 jsdom / happy-dom 里渲染 Astro 组件
- 新测试放 `tests/unit/`，文件名 `<被测模块>.test.ts`；`tests/e2e/` 归 Playwright，Vitest 不扫

---

## 什么该测

| 该测 | 原因 | 例子 |
|------|------|------|
| 有分支 / 边界的纯函数 | 改一处可能悄悄坏另一处 | `absoluteUrl` 对带扩展名路径不补斜杠 |
| 安全相关的转义 | 出错是 XSS，不是样式问题 | `serializeJsonLd` 必须转义 `<` |
| 中文 / 时区处理 | 最容易「本机对、线上错」 | `formatDate` 固定 `Asia/Shanghai`；`truncate` 按字符截断 |
| 数据映射 | 外部接口字段一变就错 | 同步源把接口字段转成集合 schema 的函数 |
| 排序 / 打分规则 | 用户能直接感知的顺序 | `searchItems` 标题命中排在摘要命中前 |

## 什么不该测

| 不该测 | 交给谁 |
|--------|-------|
| 页面有没有 canonical、描述是否重复 | `pnpm check:seo`（扫真实构建产物，比 mock 准） |
| 集合 schema 是否生效 | `pnpm build`（schema 不符会直接构建失败） |
| Tailwind 类名、样式 | 截图比对（`e2e-test`） |
| `getCollection` 返回值 | 单测里拿不到集合数据（见下文实测）；把逻辑抽成接收数组的纯函数再测 |
| 第三方库本身 | 不测 React / Astro / Zod |

### 让代码可测：把逻辑从页面里抽出来

页面 frontmatter 里写了排序、过滤、拼接逻辑 → 抽到 `src/lib/<业务>.ts` 的纯函数，页面只负责调用。

```ts
// ✅ src/lib/works.ts：接收数组，不碰 getCollection，可以直接单测
export function relatedWorks(all: Work[], current: Work, limit = 3): Work[] { ... }

// ❌ 逻辑写死在 [id].astro 的 frontmatter 里：没法单测，只能靠肉眼
```

**虚拟模块在单测里的真实表现**（Astro 7.3 + Vitest 5 + `getViteConfig`，临时副本实测）：

| 做法 | 结果 |
|------|------|
| import 顶层依赖 `astro:content` / `astro:assets` 的文件（`@/lib/works`、`@/lib/images`、`src/content.config.ts`） | ✅ 能导入——`getViteConfig` 带着 Astro 的 Vite 插件，虚拟模块可以解析 |
| 调 `getWorks()` 等内部走 `getCollection()` 的函数 | ⚠️ 不报错，但拿到**空数组**（单测环境没有内容数据），断言会误判 |
| 调 `resolveCover()` 处理非白名单地址 | ✅ 原样返回，不触发图片处理 |

所以规则是：**可以 import 这些文件，但只测「接收数组 / 参数」的纯函数**。测 `relatedWorks` / `countByCategory` 时手工构造最小条目：

```ts
import { describe, expect, it } from 'vitest';
import { countByCategory, relatedWorks, type Work } from '@/lib/works';

// 只构造被测函数用到的字段；类型断言让测试不必填满整条 entry
const work = (id: string, category: string) =>
  ({ id, collection: 'works', data: { category: { id: category, collection: 'categories' } } }) as unknown as Work;

describe('relatedWorks', () => {
  it('只取同分类、排除自己', () => {
    const all = [work('a', 'x'), work('b', 'x'), work('c', 'y')];
    expect(relatedWorks(all, all[0]).map((w) => w.id)).toEqual(['b']);
  });
});

describe('countByCategory', () => {
  it('按分类计数', () => {
    expect(countByCategory([work('a', 'x'), work('b', 'x')]).get('x')).toBe(2);
  });
});
```

依赖集合真实数据的结论（条目数、排序后的首条是谁）交给构建产物校验（`pnpm check:seo`）与 e2e，不在单测里断言。

---

## 标准写法

### 1. 纯函数测试（最常用）

```ts
// tests/unit/seo.test.ts
import { describe, expect, it } from 'vitest';
import { absoluteUrl } from '@/lib/seo';

describe('absoluteUrl', () => {
  it('补齐结尾斜杠（trailingSlash: always）', () => {
    expect(absoluteUrl('/works/a', 'https://a.com')).toBe('https://a.com/works/a/');
  });
  it('带扩展名的路径不补斜杠', () => {
    expect(absoluteUrl('/llms.txt', 'https://a.com')).toBe('https://a.com/llms.txt');
  });
});
```

- 被测函数有「默认取 site.url」这类隐式依赖时，**显式传参**（如上面传 `'https://a.com'`），测试不随站点配置变化
- 用例名写「在什么条件下应该怎样」，失败时一眼看出是哪条规则坏了

### 2. 参数化测试

```ts
import { describe, expect, it } from 'vitest';
import { formatCount } from '@/lib/format';

describe('formatCount', () => {
  it.each([
    [9999, '9999'],
    [12800, '1.3万'],
    [20000, '2万'],
    [150_000_000, '1.5亿'],
  ])('%i → %s', (input, expected) => {
    expect(formatCount(input)).toBe(expected);
  });
});
```

### 3. 时区与日期

```ts
// UTC 16:30 已是东八区次日 00:30 —— 专门挑跨日的时刻，才能证明时区真的生效
expect(formatDate(new Date('2026-09-24T16:30:00Z'))).toBe('2026-09-25');
```

不要用 `new Date()` 当前时间做断言（结果随运行时刻变化）；需要「现在」时用 `vi.useFakeTimers()` + `vi.setSystemTime()`。

### 4. 数据同步源的字段映射

数据源模块（`scripts/sync/sources/*.mjs`）里把「接口响应 → 集合条目」的映射写成导出的纯函数，测试喂一份接口响应样例：

```ts
// scripts/sync/sources/bilibili.mjs 里：export function mapVideo(raw) { ... }
// tests/unit/sync-bilibili.test.ts
import { describe, expect, it } from 'vitest';
import { mapVideo } from '../../scripts/sync/sources/bilibili.mjs';
import sample from './fixtures/bilibili-video.json';

describe('mapVideo', () => {
  it('时长字符串 "12:34" 转成秒', () => {
    expect(mapVideo(sample).metrics.duration).toBe(754);
  });
  it('id 只含 URL 安全字符', () => {
    expect(mapVideo(sample).id).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
```

样例放 `tests/unit/fixtures/`，**用脱敏后的真实响应**，不要手编字段（手编的样例和真实接口不一致，测试就失去意义）。
`.mjs` 没有类型：测试里只断言关键字段即可。

### 5. 测 .astro 组件输出（Container API，按需）

只在「组件输出的 HTML 结构本身就是需求」时使用，例如 SEOHead 在某个 prop 组合下必须输出 noindex：

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Badge from '@/components/ui/Badge.astro';

test('Badge 传 href 时渲染为链接', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Badge, {
    props: { href: '/works/?tag=SEO' },
    slots: { default: '#SEO' },
  });
  expect(html).toContain('href="/works/?tag=SEO"');
});
```

- API 仍带 `experimental_` 前缀，升级 Astro 时优先检查这里
- 渲染含 React 组件的 .astro 需要加载渲染器：`getContainerRenderer` 从 **`@astrojs/react/container-renderer`** 导入（Astro 7 起的新路径），配合 `loadRenderers`（`astro:container`）
- 依赖 `Astro.url`、集合数据的页面级组件不适合这样测，交给 `check-seo` 与 e2e

---

## 运行与排错

```bash
pnpm test                               # 全部单测
pnpm vitest run tests/unit/seo.test.ts  # 单个文件
pnpm vitest run -t "absoluteUrl"        # 按用例名过滤
pnpm vitest                             # watch 模式（开发时）
```

| 报错 | 原因 | 处理 |
|------|------|------|
| `Cannot find module 'astro:content'` / `astro:assets` | 配置没走 `getViteConfig`（例如改成了 `vitest/config` 的 `defineConfig`），Astro 的 Vite 插件没加载 | 保持 `vitest.config.ts` 用 `getViteConfig` |
| 调集合查询函数得到空数组、断言莫名失败 | 单测环境没有内容数据，`getCollection` 返回空 | 改测接收数组的纯函数，手工构造条目 |
| astro check 报 `'test' does not exist in type 'UserConfig'` | vitest.config.ts 缺三斜杠引用 | 首行加 `/// <reference types="vitest/config" />` |
| `@/xxx` 解析失败 | 用了 `defineConfig` from `vitest/config` 而不是 `getViteConfig` | 保持 `getViteConfig`，它带着 Astro 的别名配置 |
| 日期断言本机过、CI 挂 | 断言依赖机器时区 | 用 `formatDate`（已固定时区）或挑跨日时刻构造输入 |
| 渲染 Astro 组件报 client 环境错误 | environment 设成了 jsdom | 改回 `node` |

## 开发检查清单

- [ ] 被测逻辑已抽成纯函数，测试不 mock Astro 虚拟模块，也不依赖 `getCollection` 的返回值
- [ ] 新增会进 `href` / `src` 的外部字段时，已按 `works-schema.test.ts` 在 `<集合>-schema.test.ts` 补协议白名单的正反例
- [ ] 用例覆盖边界：空值、超长、中文、跨日时刻、非法字符
- [ ] 隐式依赖（站点域名、当前时间）已显式传参或用 fake timers 固定
- [ ] 外部接口样例来自真实响应（脱敏），放 `tests/unit/fixtures/`
- [ ] `pnpm test` 全绿，且 `pnpm build`（含 astro check）没有因测试文件报类型错误

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `e2e-test` | 浏览器里的交互与视觉验收 |
| `seo-meta` / `geo-optimization` | 字段该怎么写；构建后校验靠 `pnpm check:seo` |
| `data-sync` | 同步源怎么写；本技能负责给它的字段映射补测试 |
| `bug-detective` | 先定位问题，修完后回到本技能补一条回归用例 |
