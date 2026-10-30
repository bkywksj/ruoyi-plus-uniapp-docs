// 示例数据源：演示数据源模块的写法（不联网，读本地样例再做字段映射）
// 新项目接真实接口时：复制本文件改名（如 bilibili.mjs），改 fetch() 里的请求与映射，把 enabled 设为 true。
// 运行：pnpm sync example --dry-run
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export default {
  name: 'example',
  output: 'src/data/works.json',
  // 示例源默认不参与 `pnpm sync`，避免误覆盖手写数据；点名运行不受影响
  enabled: false,

  /** @param {ReturnType<import('../context.mjs').createContext>} ctx */
  async fetch(ctx) {
    // 真实数据源这里通常是：const data = await ctx.fetchJson('https://api.example.com/items?page=1');
    const raw = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'works.json'), 'utf8'));
    ctx.log(`读到 ${raw.length} 条样例数据`);

    // 字段映射：把接口字段转成 src/content.config.ts 里 works 的 schema
    return raw.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      description: item.description,
      category: item.category,
      tags: item.tags ?? [],
      date: item.date,
      cover: item.cover,
      url: item.url,
      featured: item.featured ?? false,
      metrics: item.metrics,
    }));
  },
};
