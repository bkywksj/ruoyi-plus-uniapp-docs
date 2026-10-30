// 迁移逐页比对：新站清单 vs 旧站基线清单（两份都由 manifest.mjs 生成），列出每页丢了什么、多了什么
// 用法：node scripts/migrate/compare-baseline.mjs <基线清单> <新站清单> [--details]
// 判定（任一不满足即该页不通过，退出码 1）：
//   - 正文：把正文切成短句，旧站有、新站没有的句子数 = 0（多出来的只提示，如新站的「上一页」文案）
//   - 代码块：数量相等，且逐块内容哈希相等（代码一个字符都不能变）
//   - 标题：文字序列相等；锚点 id 序列相等（旧书签、站内 #链接 都靠它）
//   - 图片地址（多重集）相等、表格行数相等
//   - title / description / canonical 逐字相等（搜索结果里显示的就是它们）
//   - 旧站正文里的链接，新站一个不少（多出来的只提示）；JSON-LD 段数不少于旧站
import { readFileSync } from 'node:fs';

const [basePath, newPath] = process.argv.slice(2);
const details = process.argv.includes('--details');
const base = JSON.parse(readFileSync(basePath, 'utf8')).pages;
const next = JSON.parse(readFileSync(newPath, 'utf8')).pages;
// 已核对接受的差异：新站只多出 extra 这些文字（去掉后与旧站逐字相等）才算通过，见 known-diffs.json
const known = JSON.parse(readFileSync(new URL('./known-diffs.json', import.meta.url), 'utf8')).pages;
const squashAll = (t) => t.replace(/\s+/g, '');
/**
 * 新站正文去掉允许多出的文字后，是否与旧站逐字相等。
 * 同一段文字在页面里可能出现多次（别处行内代码里的照常显示），逐个出现位置试删，有一种删法能对上才算接受
 */
function acceptedDiff(page, oldText, newText) {
  const k = known[page];
  if (!k) return false;
  const target = squashAll(oldText);
  const tryRemove = (text, extras) => {
    if (extras.length === 0) return text === target;
    const [e, ...rest] = extras;
    for (let i = text.indexOf(e); i >= 0; i = text.indexOf(e, i + 1)) {
      if (tryRemove(text.slice(0, i) + text.slice(i + e.length), rest)) return true;
    }
    return false;
  };
  return tryRemove(squashAll(newText), k.extra);
}

/**
 * 正文切句：先去掉全部空白再按句读切。必须先去空白——两站在块级元素之间放的空白不同（VitePress 保留换行、Astro 压缩），
 * 先切后去会让同一段话在两边切出不同的边界，误报成「丢句子」
 */
const sentences = (t) =>
  t.replace(/\s+/g, '').split(/(?<=[。！？；!?;])/).filter((s) => s.length >= 4);

/** 多重集差：a 里有、b 里不够数的元素 */
function missing(a, b) {
  const count = new Map();
  for (const x of b) count.set(x, (count.get(x) ?? 0) + 1);
  const out = [];
  for (const x of a) {
    const n = count.get(x) ?? 0;
    if (n > 0) count.set(x, n - 1);
    else out.push(x);
  }
  return out;
}

const rows = [];
let failed = 0;
for (const page of Object.keys(next).sort()) {
  const o = base[page];
  const n = next[page];
  if (!o) continue; // 新站独有的页（如新首页、指南示例），不在比对范围
  const lostText = missing(sentences(o.text), sentences(n.text));
  const extraText = missing(sentences(n.text), sentences(o.text));
  const codeCountOk = o.codes.length === n.codes.length;
  const codeMismatch = codeCountOk ? o.codes.filter((c, i) => c.hash !== n.codes[i].hash).length : Math.abs(o.codes.length - n.codes.length);
  const headOk = JSON.stringify(o.headings) === JSON.stringify(n.headings);
  const anchorDiff = missing(o.anchors ?? [], n.anchors ?? []);
  // 图片地址：两站对中文文件名的编码不同（/软著.png vs /%E8%BD%AF%E8%91%97.png），解码后再比
  const src = (imgs) => imgs.map((i) => { try { return decodeURI(i.src); } catch { return i.src; } });
  const imgLost = missing(src(o.images), src(n.images));
  const imgExtra = missing(src(n.images), src(o.images));
  // 链接解码后再比：新站把中文锚点 / 路径编码成 %E5…，浏览器视为同一地址
  const dec = (l) => { try { return decodeURI(l); } catch { return l; } };
  const linkLost = missing((o.links ?? []).map(dec), (n.links ?? []).map(dec));
  const metaDiff = ['title', 'description', 'canonical'].filter((k) => (o[k] ?? '') !== (n[k] ?? ''));
  const jsonLdOk = (n.jsonLd ?? 0) >= (o.jsonLd ?? 0);
  const r = {
    page,
    lost: lostText.length,
    extra: extraText.length,
    codes: `${n.codes.length}/${o.codes.length}`,
    codeMismatch,
    headings: headOk ? 'ok' : `${n.headings.length}/${o.headings.length}`,
    anchors: anchorDiff.length,
    images: imgLost.length + imgExtra.length ? `${n.images.length}/${o.images.length}（缺 ${imgLost.length} 多 ${imgExtra.length}）` : `${n.images.length}/${o.images.length}`,
    links: linkLost.length ? `缺 ${linkLost.length}` : 'ok',
    meta: metaDiff.length ? metaDiff.join(',') : 'ok',
    jsonLd: `${n.jsonLd ?? 0}/${o.jsonLd ?? 0}`,
    rows: `${n.tableRows}/${o.tableRows}`,
  };
  const textOk = r.lost === 0 || acceptedDiff(page, o.text, n.text);
  if (r.lost > 0 && textOk) r.lost = `0（已核对：${known[page].reason.slice(0, 12)}…）`;
  const pass =
    textOk && codeCountOk && codeMismatch === 0 && headOk && r.anchors === 0 &&
    imgLost.length === 0 && imgExtra.length === 0 && n.tableRows === o.tableRows &&
    linkLost.length === 0 && metaDiff.length === 0 && jsonLdOk;
  if (!pass) failed++;
  rows.push({ ...r, pass });
  if (details && !pass) {
    console.log(`\n── ${page}`);
    if (lostText.length) console.log('  丢失句子：', lostText.slice(0, 8));
    if (extraText.length) console.log('  多出句子：', extraText.slice(0, 5));
    if (!headOk) console.log('  标题 旧：', missing(o.headings, n.headings).slice(0, 5), '\n  标题 新：', missing(n.headings, o.headings).slice(0, 5));
    if (imgLost.length || imgExtra.length) console.log('  图片 缺：', imgLost.slice(0, 5), ' 多：', imgExtra.slice(0, 5));
    if (linkLost.length) console.log('  缺链接：', linkLost.slice(0, 8), '\n  新站链接：', (n.links ?? []).slice(0, 8));
    for (const k of metaDiff) console.log(`  ${k} 旧：${o[k]}\n  ${k} 新：${n[k]}`);
    if (!jsonLdOk) console.log(`  JSON-LD 段数 旧 ${o.jsonLd} 新 ${n.jsonLd}`);
    if (anchorDiff.length) console.log('  缺锚点：', anchorDiff.slice(0, 8), '\n  新站多出：', missing(n.anchors ?? [], o.anchors ?? []).slice(0, 8));
    if (codeMismatch) {
      const bad = o.codes.map((c, i) => [i, c, n.codes[i]]).filter(([, c, d]) => !d || c.hash !== d.hash).slice(0, 5);
      console.log('  代码块不一致：', bad.map(([i, c, d]) => `#${i} ${c.lang}/${d?.lang ?? '无'} 行${c.lines}/${d?.lines ?? 0}`));
    }
  }
}
console.table(rows.map(({ pass, ...r }) => ({ ...r, 结果: pass ? '✅' : '❌' })));
console.log(`比对 ${rows.length} 页：通过 ${rows.length - failed}，不通过 ${failed}`);
process.exit(failed ? 1 : 0);
