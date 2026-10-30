// 软件版本数据源：从发版脚本上传的版本清单（versions.json）拉取，写入 src/data/releases.json
// 运行：pnpm sync releases [--dry-run]。默认关闭（enabled: false），卖软件的站孵化后改 VERSIONS_URL 再打开。
//
// 清单格式（发版脚本生成，放在对象存储上、公开可读）：
//   { "versions": [ { "version": "v1.2.3", "notes": "…", "pub_date": "…", "url": "…", "size": 123, "sha256": "…",
//                     "assets": [ { "platform": "macos-aarch64", "label": "…", "file": "…", "url": "…", "size": 1, "sha256": "…" } ] } ] }
// 首发前清单还不存在（404）→ 运行器按失败处理、保留上一版（空数组），站点照常构建出「即将发布」空态。
// 字段校验在 src/lib/releases.ts（构建期 zod 解析，含下载地址白名单），这里只做形状映射。
const VERSIONS_URL = 'https://downloads.example.com/my-app/versions.json';

export default {
  name: 'releases',
  output: 'src/data/releases.json',
  enabled: false,

  /** @param {ReturnType<import('../context.mjs').createContext>} ctx */
  async fetch(ctx) {
    const data = await ctx.fetchJson(VERSIONS_URL, { retries: 2 });
    const list = Array.isArray(data?.versions) ? data.versions : [];
    ctx.log(`versions.json 共 ${list.length} 个版本`);
    return list.map((v) => {
      // 清单里的 version 常带 v 前缀（与存储目录名一致），站内统一去掉
      const version = String(v.version).replace(/^v/, '');
      return {
        id: version,
        version,
        notes: v.notes,
        date: v.pub_date,
        url: v.url,
        size: v.size,
        sha256: v.sha256,
        // 多平台安装包；只发过一个平台的老版本没有这个字段
        assets: Array.isArray(v.assets)
          ? v.assets.map((a) => ({ platform: a.platform, label: a.label, file: a.file, url: a.url, size: a.size, sha256: a.sha256 }))
          : [],
      };
    });
  },
};
