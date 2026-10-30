// 前端检索：几百到几千条数据的量级，用「多词子串匹配 + 字段加权」就够了。
// 不用 MiniSearch/Fuse 这类分词库的原因：它们默认按空格分词，中文整句会变成一个 token，
// 搜「静态站」反而搜不到；子串匹配对中文天然准确，且零依赖。
// 数据量上万或要检索文章全文时，改用构建期索引（Pagefind），见 site-search 技能。

export interface SearchableFields {
  title: string;
  summary?: string;
  tags?: string[];
  category?: string;
}

/** 统一小写 + 全角转半角，保证「ＡＩ」「ai」「AI」都能互相命中 */
export function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** 按空白拆查询词；空查询返回空数组（= 不过滤） */
export function parseQuery(query: string): string[] {
  const normalized = normalize(query);
  return normalized ? normalized.split(' ').filter(Boolean) : [];
}

/**
 * 打分：每个查询词都必须命中（AND 语义），命中标题权重最高。
 * 返回 0 表示不匹配。
 */
export function scoreItem(item: SearchableFields, terms: string[]): number {
  if (terms.length === 0) return 1;
  const title = normalize(item.title);
  const tags = normalize((item.tags ?? []).join(' '));
  const category = normalize(item.category ?? '');
  const summary = normalize(item.summary ?? '');

  let score = 0;
  for (const term of terms) {
    let termScore = 0;
    if (title.includes(term)) termScore += title.startsWith(term) ? 12 : 8;
    if (tags.includes(term)) termScore += 5;
    if (category.includes(term)) termScore += 4;
    if (summary.includes(term)) termScore += 2;
    if (termScore === 0) return 0;
    score += termScore;
  }
  return score;
}

/** 过滤并按相关度排序；terms 为空时保持原顺序 */
export function searchItems<T extends SearchableFields>(items: T[], query: string): T[] {
  const terms = parseQuery(query);
  if (terms.length === 0) return items;
  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}
