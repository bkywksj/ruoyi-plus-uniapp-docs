// docs 模块 · 图片宽高读取（rehypeImgSize 用）：真实图片的期望值取自 `file` 命令的独立读数，不是本函数自己算出来的；
// 模块测试只能依赖每个站都有的文件：public/og-default.png（框架必备的分享图，1200×630）。
// WebP 三种头（VP8 / VP8L / VP8X）、JPEG（SOF0）、SVG 用手工写的临时文件覆盖；中文文件名把真实 PNG 复制到临时目录改名后再读
import { copyFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import { imageSize } from '../../src/lib/markdown/img-size.mjs';
import { rehypeImgSize } from '../../src/lib/markdown/docs-layout.mjs';

const pub = (p: string) => join(process.cwd(), 'public', p);
const tmp = mkdtempSync(join(tmpdir(), 'img-size-'));
const write = (name: string, buf: Buffer | string) => {
  const f = join(tmp, name);
  writeFileSync(f, buf);
  return f;
};

describe('imageSize', () => {
  it('真实图片：PNG / JPEG / 中文文件名 PNG / SVG', () => {
    // file 命令读数：og-default.png 1200×630
    expect(imageSize(pub('og-default.png'))).toEqual({ width: 1200, height: 630 });
    const cn = join(tmp, '分享图.png');
    copyFileSync(pub('og-default.png'), cn);
    expect(imageSize(cn)).toEqual({ width: 1200, height: 630 });
    expect(imageSize(write('a.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"></svg>'))).toEqual({ width: 1280, height: 720 });
    // JPEG：SOI + APP0(JFIF) + SOF0（高 100 = 0x0064、宽 200 = 0x00C8）+ EOI
    const jpg = write(
      'a.jpg',
      Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
        0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x64, 0x00, 0xc8, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xd9,
      ]),
    );
    expect(imageSize(jpg)).toEqual({ width: 200, height: 100 });
  });

  it('WebP 的 VP8 / VP8L / VP8X 三种头', () => {
    // VP8（有损）：第 26、28 字节起各 16 位，取低 14 位
    const v = Buffer.alloc(32);
    v.write('RIFF', 0, 'ascii');
    v.write('WEBPVP8 ', 8, 'ascii');
    v.writeUInt16LE(1920, 26);
    v.writeUInt16LE(1012, 28);
    expect(imageSize(write('v8.webp', v))).toEqual({ width: 1920, height: 1012 });
    // VP8L：第 21 字节起 14 位宽 - 1、14 位高 - 1
    const l = Buffer.alloc(32);
    l.write('RIFF', 0, 'ascii');
    l.write('WEBPVP8L', 8, 'ascii');
    l.writeUInt32LE((300 - 1) | ((200 - 1) << 14), 21);
    expect(imageSize(write('l.webp', l))).toEqual({ width: 300, height: 200 });
    // VP8X：第 24、27 字节起各 24 位，存的是宽 - 1、高 - 1
    const x = Buffer.alloc(32);
    x.write('RIFF', 0, 'ascii');
    x.write('WEBPVP8X', 8, 'ascii');
    x.writeUIntLE(640 - 1, 24, 3);
    x.writeUIntLE(480 - 1, 27, 3);
    expect(imageSize(write('x.webp', x))).toEqual({ width: 640, height: 480 });
  });

  it('SVG 只有 viewBox 时用 viewBox；认不出的文件与不存在的文件返回 null', () => {
    expect(imageSize(write('v.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"></svg>'))).toEqual({ width: 120, height: 40 });
    expect(imageSize(write('a.txt', 'hello'))).toBeNull();
    expect(imageSize(join(tmp, 'none.png'))).toBeNull();
  });
});

describe('rehypeImgSize', () => {
  const render = async (md: string) => {
    const p = await createMarkdownProcessor({ rehypePlugins: [rehypeImgSize] });
    return (await p.render(md)).code;
  };

  it('本站图片补宽高与 decoding，站外图片只补 decoding', async () => {
    const html = await render('![](/og-default.png)\n\n![](https://example.com/a.png)');
    expect(html).toMatch(/<img[^>]*src="\/og-default\.png"[^>]*width="1200"[^>]*height="630"|<img[^>]*width="1200"[^>]*height="630"[^>]*src="\/og-default\.png"/);
    expect(html).toMatch(/<img[^>]*src="https:\/\/example\.com\/a\.png"[^>]*decoding="async"/);
    expect(html).not.toMatch(/example\.com\/a\.png"[^>]*width=/);
  });

  it('正文里的原始 HTML 图片也处理；已写宽高或行内 style 指定尺寸的不动', async () => {
    const html = await render('<img src="/og-default.png" alt="">\n\n<img src="/og-default.png" width="50">\n\n<img src="/og-default.png" style="width:240px;height:320px">');
    expect(html).toMatch(/<img[^>]*src="\/og-default\.png"[^>]*alt=""[^>]*width="1200"[^>]*height="630"|<img[^>]*width="1200"[^>]*height="630"/);
    expect(html).toMatch(/<img[^>]*src="\/og-default\.png"[^>]*width="50"(?![^>]*height=)/);
    expect(html).toMatch(/<img[^>]*style="width:240px;height:320px"(?![^>]*width=")/);
  });
});
