import { afterEach, describe, expect, it } from 'vitest';
import {
  canonicalPath,
  pagePath,
  absoluteUrl,
  breadcrumbJsonLd,
  buildTitle,
  isoDuration,
  serializeJsonLd,
  truncate,
  videoJsonLd,
  type JsonLd,
} from '@/lib/seo';
import { site } from '@/site.config';

describe('buildTitle', () => {
  it('首页不重复拼站名', () => {
    expect(buildTitle()).toBe(site.name);
    expect(buildTitle(site.name)).toBe(site.name);
  });
  it('普通页拼接站名后缀', () => {
    expect(buildTitle('关于')).toBe(`关于 | ${site.name}`);
  });
});

describe('pagePath', () => {
  // site 是普通对象，临时改 urlFormat 测两种形态，用完还原（其它用例按框架默认 directory 跑）
  const original = site.urlFormat;
  afterEach(() => {
    site.urlFormat = original;
  });

  it('directory：补结尾斜杠，传入已带斜杠或 .html 的先归一', () => {
    site.urlFormat = 'directory';
    expect(pagePath('/guide/quick-start')).toBe('/guide/quick-start/');
    expect(pagePath('/guide/quick-start/')).toBe('/guide/quick-start/');
    expect(pagePath('/faq.html')).toBe('/faq/');
  });

  it('file：输出 .html（保住旧站已收录的网址），不留结尾斜杠', () => {
    site.urlFormat = 'file';
    expect(pagePath('/guide/quick-start')).toBe('/guide/quick-start.html');
    expect(pagePath('/guide/')).toBe('/guide.html');
    expect(pagePath('/faq.html')).toBe('/faq.html');
  });

  it('首页两种形态都是 /', () => {
    site.urlFormat = 'file';
    expect(pagePath('/')).toBe('/');
    site.urlFormat = 'directory';
    expect(pagePath('')).toBe('/');
  });

  it('file 形态的地址转绝对 URL 不被补斜杠', () => {
    site.urlFormat = 'file';
    expect(absoluteUrl(pagePath('/guide/quick-start'), 'https://a.com')).toBe('https://a.com/guide/quick-start.html');
  });
});

describe('canonicalPath', () => {
  it('file 形态首页 /index.html 归一成 /，子目录首页同理', () => {
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/docs/index.html')).toBe('/docs/');
  });

  it('其余路径原样（directory 与 file 形态都不受影响）', () => {
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('/guide/quick-start/')).toBe('/guide/quick-start/');
    expect(canonicalPath('/guide/quick-start.html')).toBe('/guide/quick-start.html');
    // 只认整段文件名 index.html，不误伤 xxxindex.html
    expect(canonicalPath('/reindex.html')).toBe('/reindex.html');
  });
});

describe('absoluteUrl', () => {
  it('补齐结尾斜杠（trailingSlash: always）', () => {
    expect(absoluteUrl('/works/a', 'https://a.com')).toBe('https://a.com/works/a/');
    expect(absoluteUrl('/works/a/', 'https://a.com')).toBe('https://a.com/works/a/');
  });
  it('带扩展名的路径不补斜杠', () => {
    expect(absoluteUrl('/llms.txt', 'https://a.com')).toBe('https://a.com/llms.txt');
    expect(absoluteUrl('/og.png', 'https://a.com')).toBe('https://a.com/og.png');
  });
  it('已是绝对地址时原样返回', () => {
    expect(absoluteUrl('https://b.com/x.png', 'https://a.com')).toBe('https://b.com/x.png');
  });
});

describe('truncate', () => {
  it('按字符截断中文且补省略号', () => {
    const text = '中'.repeat(200);
    const result = truncate(text, 160);
    expect(Array.from(result)).toHaveLength(160);
    expect(result.endsWith('…')).toBe(true);
  });
  it('短文本原样返回并压缩空白', () => {
    expect(truncate('  你好   世界  ')).toBe('你好 世界');
  });
});

describe('serializeJsonLd', () => {
  it('转义 < 防止提前闭合 script', () => {
    const output = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(output).not.toContain('</script>');
    expect(JSON.parse(output).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('breadcrumbJsonLd', () => {
  it('position 从 1 开始且 item 为绝对地址', () => {
    const data = breadcrumbJsonLd([
      { name: '首页', path: '/' },
      { name: '作品', path: '/works/' },
    ]) as { itemListElement: Array<{ position: number; item: string }> };
    expect(data.itemListElement[0].position).toBe(1);
    expect(data.itemListElement[1].item).toMatch(/^https?:\/\/.+\/works\/$/);
  });
});

describe('isoDuration', () => {
  it.each([
    [0, 'PT0S'],
    [59, 'PT59S'],
    [60, 'PT1M'],
    [3600, 'PT1H'],
    [3661, 'PT1H1M1S'],
    [754.9, 'PT12M34S'],
  ])('%s 秒 → %s', (input, expected) => {
    expect(isoDuration(input)).toBe(expected);
  });
  it('负数、NaN、Infinity 返回 undefined（不输出 duration）', () => {
    expect(isoDuration(-1)).toBeUndefined();
    expect(isoDuration(Number.NaN)).toBeUndefined();
    expect(isoDuration(Number.POSITIVE_INFINITY)).toBeUndefined();
  });
});

describe('videoJsonLd', () => {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: '标题',
    description: '摘要',
    keywords: 'a,b',
    author: { '@type': 'Person', name: '作者' },
  };
  const input = {
    thumbnail: '/cover.webp',
    uploadDate: new Date('2026-09-24T16:30:00Z'),
    embedUrl: 'https://player.example/embed?id=1',
  };

  it('升级 @type 并保留 base 的 keywords / author，且不改动 base 本身', () => {
    const data = videoJsonLd(base, input);
    expect(data['@type']).toBe('VideoObject');
    expect(data.keywords).toBe('a,b');
    expect(data.author).toEqual(base.author);
    expect(base['@type']).toBe('CreativeWork');
  });
  it('必填字段：thumbnailUrl 转绝对地址、uploadDate 为带时区的 ISO 字符串', () => {
    const data = videoJsonLd(base, input);
    expect(data.thumbnailUrl).toEqual([absoluteUrl('/cover.webp')]);
    expect(data.uploadDate).toBe('2026-09-24T16:30:00.000Z');
    expect(data.embedUrl).toBe(input.embedUrl);
  });
  it('embedUrl 与 contentUrl 都缺时抛错', () => {
    expect(() => videoJsonLd(base, { thumbnail: '/c.png', uploadDate: new Date(0) })).toThrow(/embedUrl/);
  });
  it('时长与播放量换算为 duration 与 WatchAction 计数', () => {
    const data = videoJsonLd(base, { ...input, durationSeconds: 754, views: 12800 });
    expect(data.duration).toBe('PT12M34S');
    expect(data.interactionStatistic).toEqual({
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: 12800,
    });
  });
  it.each([-1, 1.5, Number.NaN])('views 为 %s 时不输出 interactionStatistic', (views) => {
    const data = JSON.parse(serializeJsonLd(videoJsonLd(base, { ...input, views })));
    expect(data).not.toHaveProperty('interactionStatistic');
  });
  it('缺时长与 contentUrl 时序列化结果里没有对应键', () => {
    const data = JSON.parse(serializeJsonLd(videoJsonLd(base, input)));
    expect(data).not.toHaveProperty('duration');
    expect(data).not.toHaveProperty('contentUrl');
  });
});
