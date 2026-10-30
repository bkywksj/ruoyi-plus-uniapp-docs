// 软件版本数据：src/data/releases.json（由 scripts/sync/sources/releases.mjs 从发版清单同步）
// 下载页、更新日志、首页的版本号 / 大小 / 发布日期只从这里取，页面上不写死。不卖软件的站整块不用（见 data-sync 技能「软件版本数据」）。
import { z } from 'astro/zod';
import raw from '@/data/releases.json';

/**
 * 下载地址白名单：安装包只能来自这些前缀。
 * 为什么要白名单：数据源被改坏或被投毒时，页面宁可构建失败，也不能挂出一个别处的安装包。
 * 孵化后改成自己的对象存储 / CDN 前缀（以 / 结尾，精确到项目目录）。
 */
export const DOWNLOAD_ORIGINS: readonly string[] = ['https://downloads.example.com/my-app/'];

/** 平台标识：与发版脚本生成的清单一致；要加移动端等平台时在这里扩 */
export const ASSET_PLATFORMS = ['windows-x64', 'macos-aarch64', 'macos-x64', 'linux-x64-deb', 'linux-x64-appimage'] as const;
export type AssetPlatform = (typeof ASSET_PLATFORMS)[number];

const downloadUrl = z
  .string()
  .refine((u) => DOWNLOAD_ORIGINS.some((origin) => u.startsWith(origin)), {
    message: `下载地址必须在 ${DOWNLOAD_ORIGINS.join(' / ')} 下`,
  });
// sha256 可选：有的发版清单只给版本号与说明（如 storyloom），不能因此整站不发；给了就必须是 64 位小写十六进制
const sha256 = z.string().regex(/^[0-9a-f]{64}$/, 'sha256 必须是 64 位小写十六进制').optional();

export const assetSchema = z.object({
  platform: z.enum(ASSET_PLATFORMS),
  /** 展示名，如「macOS（Apple 芯片）」 */
  label: z.string().min(1),
  /** 存储上的文件名；只允许 ASCII，中文与空格进网址要百分号编码，下载后的文件名也会变 */
  file: z.string().regex(/^[A-Za-z0-9._-]+$/),
  url: downloadUrl,
  size: z.number().int().positive(),
  sha256,
});
export type ReleaseAsset = z.infer<typeof assetSchema>;

export const releaseSchema = z.object({
  /** 与 version 相同，供同步器去重排序 */
  id: z.string(),
  /** 不带 v 前缀的版本号，如 1.2.3 */
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  /** 更新说明，多行纯文本 */
  notes: z.string().min(1),
  date: z.coerce.date(),
  /** 主安装包（只有一个平台时就是它；多平台时通常是 Windows 包） */
  url: downloadUrl,
  /** 主安装包字节数 */
  size: z.number().int().positive(),
  sha256,
  /** 各平台安装包；老版本只有主安装包时为空数组 */
  assets: z.array(assetSchema).default([]),
});
export type Release = z.infer<typeof releaseSchema>;

/**
 * 解析并按版本号从新到旧排序。
 * @param input releases.json 的内容
 * @returns 新 → 旧的版本列表
 * @throws 数据不合法时抛错让构建失败 —— 宁可不发站，也不在下载页挂一个错的链接或校验值
 */
export function parseReleases(input: unknown): Release[] {
  return z
    .array(releaseSchema)
    .parse(input)
    .sort((a, b) => compareVersion(b.version, a.version));
}

/**
 * semver 数字比较（x.y.z，不含预发布段）。按数字逐段比，0.1.10 > 0.1.9（按字符串比会反过来）。
 * @returns a > b 为正数，相等为 0
 */
export function compareVersion(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

/** 字节数 → 「11.4 MB」，下载按钮与版本表用 */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** 更新说明拆成行（去掉空行与「- 」列表前缀），更新日志逐条渲染用 */
export function noteLines(notes: string): string[] {
  return notes
    .split('\n')
    .map((line) => line.trim().replace(/^[-*·]\s*/, ''))
    .filter(Boolean);
}

/**
 * 取某版本某平台的安装包。
 * @returns 找不到（老版本或该平台未发）返回 undefined —— 页面据此整块不显示该平台，而不是挂一个空按钮
 */
export function findAsset(release: Release | undefined, platform: AssetPlatform): ReleaseAsset | undefined {
  return release?.assets.find((a) => a.platform === platform);
}

/** 全部版本（新 → 旧）。首发前为空数组，页面要有「即将发布」空态 */
export const releases: Release[] = parseReleases(raw);

/** 最新版本；首发前为 undefined */
export const latestRelease: Release | undefined = releases[0];
