---
name: sync-data
description: |
  /sync-data - 运行数据同步：先 dry-run 核对条目数，再写入并检查 git diff 与构建，异常时不提交

  参数：[数据源名...] [--force]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /sync-data，或描述同类意图时，按本文流程执行。）

  触发词：/sync-data、sync-data
---

# /sync-data - 运行数据同步并核对变化

把 `scripts/sync/sources/` 里的数据源跑一遍，更新 `src/data/*.json`，**核对无误才提交**。
写数据源 / 改字段映射 / 对接新平台属于开发工作，激活 `data-sync` 技能，不在本命令范围内。

## 用法

| 用法 | 说明 |
|------|------|
| `/sync-data` | 跑所有 `enabled !== false` 的数据源 |
| `/sync-data videos` | 只跑指定数据源（可多个；`enabled: false` 的也能点名运行） |
| `/sync-data videos --force` | 允许条目数骤降超过 50% 时仍写入 —— **必须先得到用户明确同意** |

## 运行器的安全规则（`scripts/sync/run.mjs`，本命令依赖它）

1. 拉取失败 / 返回空数组 / id 缺失或重复 → **不写文件，保留上一版数据**，退出码 1
2. 条目数比上一版少了一半以上（上一版 ≥ 10 条时）→ 视为接口异常，不写文件（`--force` 可越过）
3. 先写 `.tmp` 再原子替换；输出按 `id` 稳定排序，数据没变时 git diff 为空
4. `.env` 由 `scripts/sync/context.mjs` 自动读取；缺变量时报「缺少环境变量 XXX」

---

## 第一步：盘点数据源

```bash
ls scripts/sync/sources/
```

逐个读取数据源模块，记录：`name`、`output`、`enabled`、用到的环境变量（`ctx.env('XXX')`）。

- 用到的环境变量在 `.env` 里没有 → 停下提示用户补（只报变量名，**不读取、不展示 `.env` 里的值**）
- 只有示例源 `example`（`enabled: false`）→ 说明还没有真实数据源，建议用 `data-sync` 技能先写一个

## 第二步：试运行（必做）

```bash
pnpm sync <名...> --dry-run
```

输出形如 `🔍 [videos] 128 条（dry-run，未写入），与现有数据有差异`。核对：

- 条目数与预期量级一致（与上一版 `src/data/<文件>.json` 的条数对比）
- 失败的数据源：读错误原文判断是凭据 / 限流风控 / 接口改版 / 网络问题，**不要反复重试**（风控类错误重试只会更糟，交给 `data-sync` 技能的退避策略）

## 第三步：正式写入

```bash
pnpm sync <名...>
```

## 第四步：核对变化

```bash
git diff --stat src/data/
```

- 变化量符合预期（新增几条、字段更新）→ 继续
- 出现大面积删除、字段整体变空、中文变乱码 → **不提交**，`git diff src/data/<文件>.json` 看具体差异，报告用户
- 需要精确统计新增 / 删除的 id 时：用 Write 工具在 `logs/` 下写一个小脚本对比 `git show HEAD:src/data/<文件>.json` 与当前文件，不要内联长脚本

## 第五步：构建验证

```bash
pnpm build        # 新数据不符合 schema（缺字段、日期格式错、id 含非法字符）会在这里报错
pnpm check:seo    # 新条目的描述是否与已有页面重复、封面 alt / 宽高是否齐全
```

- schema 报错 → 是数据源映射的问题，交给 `data-sync` 技能修数据源，**不要为了过构建去放宽 schema**
- 新增了外链封面域名 → 提醒把域名加进 `src/site.config.ts` 的 `imageDomains`（否则封面不会被构建期优化）

## 第六步：提交

```bash
git add src/data/videos.json          # 只加本次同步写入的数据文件，逐个添加
git commit -m "chore(data): 同步 videos 数据（128 条，+3 / -0）"
```

- 数据更新用 `chore(data)`：它不是功能开发，不计入进度统计
- 本地提交；推送 / 部署走 `/deploy`

## 输出

```markdown
## 数据同步结果

| 数据源 | 状态 | 条目数（前 → 后） | 变化 | 输出文件 |
|--------|------|-----------------|------|---------|
| videos | ✅ | 125 → 128 | +3 / -0 | src/data/videos.json |
| github | ❌ 保留旧数据 | 42 | — | src/data/repos.json（原因：HTTP 403，凭据失效） |

- 构建：✅　check:seo：✅
- 提交：abc1234 chore(data): …
- 需要你处理：{缺失的环境变量 / 失效的凭据 / 需要确认的大幅变化}
```

## 注意事项

- 🔴 不在数据源里写死凭据；凭据只放 `.env`（不入库），变量名登记在 `.env.example`
- 🔴 不擅自 `--force`：骤降保护就是为了防止接口出错把全站数据清空
- 定时自动同步（服务器 cron / CI）的搭建交给 `data-sync` 与 `deployment-guide` 技能；外部平台对海外 / 数据中心 IP 风控更严时，同步应在国内网络环境运行
- 反捏造：同步失败时不要手工编数据补位，保留上一版并如实报告

## 与其他命令的关系

| 命令 / 技能 | 关系 |
|------------|------|
| `data-sync` 技能 | 写数据源、字段映射、限流退避、防风控 |
| `/collection` | 新内容类型的数据源在那里创建 |
| `/deploy` | 同步并提交后重新构建部署，站点才会更新 |
