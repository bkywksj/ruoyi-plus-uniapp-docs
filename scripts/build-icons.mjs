// 生成 src/data/vp-icons.json —— 正文里 <Icon icon="x:y"/>、状态标记（<Ok/> 等）、营销页组件用到的离线图标数据，旧站 scripts/build-icons.mjs 的 Astro 版。
//
// 为什么要生成：remark 插件把图标渲染成内联 SVG（零 JS、离线可用），图标数据只从这份 JSON 取；
// 作者在 md 里新用一个图标而 JSON 里没有，构建会直接失败（vp-compat.mjs 的 iconSvg 抛错，宁可失败也不在页面上静默丢图标）。
// 所以构建前按「正文实际用到的」重新抽一遍：新增图标自动补上，不再用的自动去掉。
//
// 图标库版本锁在旧站同一版（@iconify-json/lucide 1.2.118、simple-icons 1.2.91），迁移前后图标线条逐笔相同。
// 运行：pnpm icons（pnpm build 前自动执行）；--check 只比对不写入，与仓库里那份不同时退出码 1

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getIconData } from '@iconify/utils';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const collections = {
  lucide: require('@iconify-json/lucide/icons.json'),
  'simple-icons': require('@iconify-json/simple-icons/icons.json'),
};

const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const used = new Map(); // 图标名 → 第一处用到的位置（报错时指给作者看）
const add = (name, where) => used.has(name) || used.set(name, where);

// 1. 正文：<Icon icon="lucide:rocket" /> —— 单双引号都认。先去掉代码块与行内代码：那里的 <Icon icon="ep:home"/> 是给读者看的示例代码，
//    remark 插件不会渲染它（与插件同一口径，否则示例里的 ep: / mdi: 图标会被当成缺图标）
const prose = (src) => src.replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, '').replace(/`[^`\n]*`/g, '');
for (const file of walk(resolve(ROOT, 'src/content/docs')).filter((f) => f.endsWith('.md'))) {
  for (const m of prose(readFileSync(file, 'utf8')).matchAll(/<Icon\b[^>]*?\bicon=["']([\w-]+:[\w-]+)["']/g)) add(m[1], file);
}
// 2. 状态标记：<Ok/> <Warn/> <DotRed/> … 各自对应的图标
for (const [mark, v] of Object.entries(JSON.parse(readFileSync(resolve(ROOT, 'src/data/vp-marks.json'), 'utf8')))) add(v.icon, `vp-marks.json <${mark}/>`);
// 3. 插件代码里写死的图标（营销页定价卡的对勾、推荐星标等）：iconSvg(icons, 'lucide:check', …)
for (const file of walk(resolve(ROOT, 'src/lib/markdown')).filter((f) => f.endsWith('.mjs'))) {
  for (const m of readFileSync(file, 'utf8').matchAll(/iconSvg\(\s*icons\s*,\s*'([\w-]+:[\w-]+)'/g)) add(m[1], file);
}

const out = {};
const missing = [];
for (const name of [...used.keys()].sort()) {
  const [prefix, icon] = name.split(':');
  const data = collections[prefix] ? getIconData(collections[prefix], icon) : null;
  if (!data) missing.push(`${name}（${used.get(name)}）`);
  else out[name] = { body: data.body, width: data.width ?? 24, height: data.height ?? 24 };
}
if (missing.length) {
  console.error(`图标库里找不到：\n  ${missing.join('\n  ')}\n先到 https://icones.js.org 查准图标名（只支持 lucide / simple-icons 两套）`);
  process.exit(2);
}

const target = resolve(ROOT, 'src/data/vp-icons.json');
const json = `${JSON.stringify(out, null, 1)}\n`;
if (process.argv.includes('--check')) {
  const same = readFileSync(target, 'utf8') === json;
  console.log(same ? `vp-icons.json 已是最新（${Object.keys(out).length} 个图标）` : 'vp-icons.json 与正文用到的图标不一致：跑 pnpm icons 重新生成');
  process.exit(same ? 0 : 1);
}
writeFileSync(target, json);
console.log(`已生成 ${Object.keys(out).length} 个离线图标 → src/data/vp-icons.json`);
