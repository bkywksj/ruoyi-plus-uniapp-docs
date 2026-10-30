// 数据源运行上下文：统一的请求（超时 + 重试 + 退避）、缓存目录、日志、环境变量
// 数据源只管「怎么拿、怎么映射字段」，网络的脏活都在这里。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

/** 读取 .env（不引依赖；已存在的系统环境变量优先） */
function loadDotEnv() {
  const file = join(ROOT, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadDotEnv();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createContext(sourceName) {
  const cacheDir = join(ROOT, '.cache', 'sync', sourceName);
  mkdirSync(cacheDir, { recursive: true });

  const log = (...parts) => console.log(`   [${sourceName}]`, ...parts);

  /**
   * 带超时与重试的 fetch。
   * 429 / 5xx / 网络错误 → 指数退避重试；4xx（除 429）直接失败（重试也没用）。
   * @param {string} url
   * @param {RequestInit & { retries?: number, timeoutMs?: number, backoffMs?: number }} [options]
   */
  async function request(url, options = {}) {
    const { retries = 3, timeoutMs = 15_000, backoffMs = 1_000, headers, ...init } = options;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(url, {
          ...init,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; next-ai-astro-sync/1.0)',
            Accept: 'application/json, text/plain, */*',
            ...headers,
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (response.ok) return response;
        if (response.status !== 429 && response.status < 500) {
          throw Object.assign(new Error(`HTTP ${response.status} ${url}`), { fatal: true });
        }
        lastError = new Error(`HTTP ${response.status} ${url}`);
      } catch (error) {
        if (error.fatal) throw error;
        lastError = error;
      }
      if (attempt < retries) {
        const wait = backoffMs * 2 ** attempt;
        log(`请求失败，${wait}ms 后第 ${attempt + 1} 次重试：${lastError.message}`);
        await sleep(wait);
      }
    }
    throw lastError;
  }

  async function fetchJson(url, options) {
    const response = await request(url, options);
    return response.json();
  }

  /** 简单的 JSON 文件缓存：接口限流时减少重复请求（缓存可随时删，.cache/ 不入库） */
  function cache(key) {
    const file = join(cacheDir, `${key.replace(/[^A-Za-z0-9_-]/g, '_')}.json`);
    return {
      read(maxAgeMs = Infinity) {
        if (!existsSync(file)) return undefined;
        const { savedAt, value } = JSON.parse(readFileSync(file, 'utf8'));
        return Date.now() - savedAt <= maxAgeMs ? value : undefined;
      },
      write(value) {
        writeFileSync(file, JSON.stringify({ savedAt: Date.now(), value }), 'utf8');
      },
    };
  }

  /** 读取必填环境变量，缺失时给出明确提示 */
  function env(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (value === undefined || value === '') {
      throw new Error(`缺少环境变量 ${name}（写进 .env，参考 .env.example）`);
    }
    return value;
  }

  return { log, request, fetchJson, cache, env, sleep, cacheDir };
}
