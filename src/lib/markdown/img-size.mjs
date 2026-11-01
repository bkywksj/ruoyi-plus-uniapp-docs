// 读本地图片的原始宽高（只读文件头，不解码整张图）：PNG / JPEG / WebP / GIF / SVG。
// 给 rehypeImgSize 用：正文图片写上 width / height，浏览器在图片下载前就按比例留出位置。
// 为什么不用 sharp：它是 Astro 的依赖，pnpm 严格隔离下项目代码引不到；这几种格式的头部格式固定，几十行就够
import { readFileSync } from 'node:fs';

/**
 * 读图片宽高
 * @param file 本地文件绝对路径
 * @returns `{ width, height }`；格式不认识或文件头坏了返回 null（调用方原样跳过，不影响构建）
 */
export function imageSize(file) {
  let b;
  try {
    b = readFileSync(file);
  } catch {
    return null;
  }
  const ok = (w, h) => (w > 0 && h > 0 ? { width: w, height: h } : null);
  // PNG：IHDR 紧跟在 8 字节签名后
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return ok(b.readUInt32BE(16), b.readUInt32BE(20));
  // GIF：逻辑屏幕宽高，小端
  if (b.length > 10 && b.toString('ascii', 0, 3) === 'GIF') return ok(b.readUInt16LE(6), b.readUInt16LE(8));
  // WebP：RIFF....WEBP 后按三种块分别取
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return ok(b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff);
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return ok((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1);
    }
    if (chunk === 'VP8X') return ok(b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1);
    return null;
  }
  // JPEG：逐段找 SOFn（C0–CF，去掉 C4 / C8 / CC 这三个不是帧头的标记）
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return ok(b.readUInt16BE(i + 7), b.readUInt16BE(i + 5));
      i += 2 + b.readUInt16BE(i + 2);
    }
    return null;
  }
  // SVG：取根元素的 width / height（纯数字或 px），没有就用 viewBox
  const head = b.toString('utf8', 0, Math.min(b.length, 4096));
  const svg = head.match(/<svg\b[^>]*>/i)?.[0];
  if (svg) {
    const num = (name) => {
      const v = svg.match(new RegExp(`\\s${name}="\\s*([\\d.]+)(px)?\\s*"`))?.[1];
      return v ? Math.round(Number(v)) : 0;
    };
    const w = num('width');
    const h = num('height');
    if (w && h) return ok(w, h);
    const vb = svg.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
    if (vb) return ok(Math.round(Number(vb[1])), Math.round(Number(vb[2])));
  }
  return null;
}
