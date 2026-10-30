---
name: delivery-sync
description: 把项目已提交的内容单向镜像成给客户的干净交付副本：去掉 git 历史、技能体系、内部文档与密钥，支持首次创建、增量同步、预览、客户预设。触发词：交付、交付物、交付副本、客户版本、对外版本、剥离技能、移除技能体系、deliver、干净副本、同步交付
---

# 交付副本同步（delivery-sync）

## 何时使用

- 要把项目交付给客户 / 合作方
- 在同级目录维护一份「对外版本」，项目有新提交后把增量同步过去
- 不同客户交付不同内容（预设）
- 查看交付目录落后项目多少提交

只想给构建产物时不需要本技能：`pnpm build` 后把 `dist/` 打包即可。

## 概述

```
项目仓库（HEAD 里已提交的文件）
        │  node .claude/skills/delivery-sync/scripts/delivery-sync.mjs
        ▼
交付目录（默认 ../<项目目录名>-delivery）
  ├── README.md / DEPLOY.md        ← 来自项目的 delivery/*.md，替代内部 README
  ├── src/ scripts/ deploy/ public/ package.json pnpm-lock.yaml Dockerfile …
  └── .delivery-sync-marker        ← 受管目录标记
```

**只交付已提交的内容**：源文件清单取自 `git ls-tree HEAD`，内容取自提交里的版本。
未跟踪的文件、被 `.gitignore` 忽略的文件（`.env`、`.agent-pipeline/`、别的会话刚建的临时文件）**绝不会**进交付副本；
改了没提交的内容也不会进去（脚本会列出这些文件提醒你）。所以同步前先把要交付的改动提交掉。

**硬约束**（脚本强制，即使 `.deliveryignore` 被改坏也生效）：交付目录里不能出现 `.git/`、`.claude/`、`.codex/`、`.agents/`、`.agent-pipeline/`、`AGENTS.md`、`CLAUDE.md`、`.framework-sync.json`、`.env` 与任何 `.env.*`（`.env.example` 除外）、`node_modules/`。
同步结束后还会再扫一遍交付目录，漏网的敏感项直接删除（只在交付目录内部操作，不进交付方自己的 `node_modules` 等目录）。

交付的是**可构建的源码**：客户拿到后 `pnpm install && pnpm build` 或 `docker compose up -d --build` 即可。

## 文件结构

### 项目侧

| 文件 | 入库？ | 说明 |
|------|-------|------|
| `.delivery-sync.json` | ❌（脚本自动加进 `.gitignore`） | 交付目录路径、上次同步的提交（baseline）、预设、历史 |
| `.deliveryignore` | ❌（同上） | gitignore 语法的排除清单，首次执行从模板生成 |
| `delivery/README.md`、`delivery/DEPLOY.md` | ✅ | 给交付方看的文档，首次执行从模板生成，**需要按项目改写并提交**（脚本读的是提交里的版本） |

### 技能侧

```
.claude/skills/delivery-sync/
├── SKILL.md
├── scripts/delivery-sync.mjs         # 零依赖 Node 脚本（需要 git）
└── templates/
    ├── deliveryignore.template       # 默认排除清单
    ├── README.md.template            # delivery/README.md 初始内容
    └── DEPLOY.md.template            # delivery/DEPLOY.md 初始内容
```

### 默认排除（deliveryignore.template）

| 类别 | 条目 |
|------|------|
| 技能体系与版本控制 | `.git/` `.github/` `.claude/` `.codex/` `.agents/` `AGENTS.md` `CLAUDE.md` |
| 技能体系配套脚本 | `/scripts/sync-agents-skills.mjs` `/scripts/validate-skills.mjs` |
| 内部状态 | `.framework-sync.json` `.delivery-sync.json` `.deliveryignore` |
| 内部协作文档 | `/docs/`（项目根的需求、原型、任务台账、测试报告）、`/delivery/`（其内容已复制到交付目录根）、`.agent-pipeline/` |
| 密钥与本地配置 | `.env` `.env.*`（保留 `.env.example`）`*-local.*` |
| 依赖与构建产物 | `node_modules/` `/dist/` `/.astro/` `/.cache/` `/logs/` `/output/` |
| 测试产物 / IDE | `/test-results/` `/playwright-report/` `/coverage/` `.idea/` `.vscode/` 等 |

- 以 `/` 开头的规则只匹配项目根；不带 `/` 的匹配任意层级。`/docs/` 特意锚定在根：写成 `docs/` 会把 src/content/docs/ 这类站点内容目录一起排除掉
- 需要多排除什么，直接改项目根的 `.deliveryignore`（下次同步生效）
- 交付副本里还会带上项目的 `.gitignore`、`.dockerignore`，它们的注释可能提到内部工具名；介意的话在交付前看一眼

交付副本的 `package.json` 会自动去掉指向已排除脚本的命令（如 `check:skills`、`agents:sync`），避免客户执行时报找不到文件。

## 命令

```bash
S=.claude/skills/delivery-sync/scripts/delivery-sync.mjs

node $S --status                                        # baseline、待同步提交、累计次数
node $S --first-time --dry-run                          # 首次：预览（不写任何文件）
node $S --first-time --delivery-dir ../my-site-delivery # 首次：创建交付目录
node $S --dry-run --verbose                             # 增量：预览完整文件清单
node $S                                                 # 增量：执行
node $S --preset 客户A                                   # 用指定预设
```

两道需要确认的闸门，各用一个参数放行。🔴 **加参数之前必须把 `--dry-run` 的清单给用户看，拿到明确同意再加**：

| 参数 | 放行什么 | 什么时候会遇到 |
|------|---------|---------------|
| `--allow-unmanaged` | 目标目录已有内容、但没有 `.delivery-sync-marker` | 第一次指向一个已有文件的目录；也可能是路径指错了——执行会删掉里面所有不在交付清单里的文件 |
| `--allow-mass-delete` | 一次要删除交付目录 30% 以上的文件 | 排除规则被改坏、预设改了，或确实大改了项目结构 |

旧的 `--force` 已拆分，传了会报错。其他未知参数也一律报错退出。

退出码：`0` 成功 / `1` 需要确认（没加对应的 `--allow-*`）/ `2` 安全检查失败或参数错误（交付目录与项目互相包含、交付目录里有 `.git`，这两种不可绕过）/ `3` 环境异常（不是 git 仓库、没有提交、缺 `.delivery-sync.json` 却没加 `--first-time`、预设不存在）。

也可以通过斜杠命令 `/sync-delivery` 触发（命令里调用同一个脚本）。

## 标准流程

### 首次创建

1. 把要交付的改动都提交掉（脚本只交付已提交的内容）
2. `--first-time --dry-run` 预览，把「交付目录、新增文件数、排除规则来源」给用户确认
   - 需要核对完整清单时加 `--verbose`，重点看有没有内部文件漏进来
3. 用户确认后去掉 `--dry-run` 执行，脚本会：
   - 从模板生成 `.deliveryignore`、`delivery/README.md`、`delivery/DEPLOY.md`
   - 把 `.delivery-sync.json`、`.deliveryignore` 追加进 `.gitignore`
   - 复制文件、清理空目录、后置清理漏网敏感项
   - 写 `.delivery-sync-marker`，记录 baseline 与历史
4. **改写 `delivery/README.md` 与 `delivery/DEPLOY.md`**（模板只是骨架），提交 `delivery/` 与 `.gitignore`，再同步一次
   - 首次同步时 `delivery/` 还没提交，交付副本里用的是模板内容；提交改写后的版本后，下一次同步才会换上

### 增量同步

```bash
node $S --status            # 看落后几个提交
node $S --dry-run           # 预览 +新增 / ~修改 / -删除
node $S                     # 用户确认后执行
```

- 内容无变化时直接提示「已是最新」，不写状态；新提交只动了被排除的文件（如 `docs/`）时，只推进 baseline、不计同步次数
- 交付目录里多出来的文件（手工放进去的、项目里已删除的）会被删除 —— **交付目录不接受手工修改**，要改就在项目里改、提交、再同步
- 交付目录里的 `node_modules`、`dist`、`.astro`、`.cache` 是交付方本地安装 / 构建的产物，同步不扫描、不删除，也不计入删除比例

## 预设（不同客户不同内容）

在 `.delivery-sync.json` 里配置：

```json
{
  "deliveryDir": "../my-site-delivery",
  "activePreset": "default",
  "presets": {
    "default": { "extraExclude": [] },
    "客户A-不要文章": {
      "extraExclude": ["/scripts/sync/sources/example.mjs"],
      "stripModules": ["posts"]
    }
  }
}
```

- `extraExclude`：叠加在 `.deliveryignore` 之上的额外排除规则（同样是 gitignore 语法）。只排除「删了不影响构建」的文件；排除 `tests/` 会让交付副本的 `pnpm test` / `pnpm verify` 因为找不到测试而失败
- `stripModules`：该客户不要的**功能模块**。文件级排除做不到（删了页面还要改首页、导航、集合定义），同步完成后脚本会打印要执行的命令：

```bash
cd "<交付目录>" && pnpm install      # 第一次裁剪前装一次依赖（之后同步会保留 node_modules）
node .claude/skills/module-strip/scripts/module-strip.mjs posts --target "<交付目录>" --verify
```

- module-strip 没有 `--delivery` 参数，交付目录一律用 `--target <交付目录>`
- 🔴 每次增量同步都会把被裁的文件恢复回来（交付目录是项目的镜像），**所以每次同步后都要重新裁剪**

## 安全保护

| 检查 | 触发 | 处置 |
|------|------|------|
| 只取已提交内容 | 任何未跟踪 / 被忽略 / 未提交的文件 | 不进交付副本；有未提交改动时列出提醒 |
| 交付目录与项目互相包含 | `--delivery-dir ./out` 这类路径 | 拒绝（退出码 2，不可绕过） |
| 目标目录里有 `.git` | 交付目录被误初始化成仓库 | 拒绝（退出码 2），**绝不删除外部 `.git`**，请人工处理 |
| 目标目录已有内容但没有 marker | 可能指向了无关目录 | 退出码 1，用户确认后加 `--allow-unmanaged` |
| 一次删除超过交付目录 30% 的文件 | 排除规则被改坏 / 路径指错 | 退出码 1，用户确认删除清单后加 `--allow-mass-delete` |
| `.deliveryignore` 删掉了强制项 | 规则被人误改 | 强制清单兜底 + 后置清理，报告里列出清理项 |
| 未知参数（含旧的 `--force`） | 拼错或用了旧参数 | 报错退出（退出码 2），不执行 |

## 与其他技能 / 命令的关系

| 关系 | 技能 / 命令 | 说明 |
|------|------------|------|
| 上游 | `git-workflow` | 同步前先提交：只有提交过的内容才会交付 |
| 下游 | `module-strip` | 同步后按预设裁剪功能模块（`--target <交付目录>`） |
| 入口 | `/sync-delivery` | 斜杠命令调用本脚本 |
| 参考 | `deployment-guide` | `DEPLOY.md` 的内容来源 |
| 区别 | `framework-sync` | 框架 → 项目；本技能是项目 → 交付副本 |

## 常见错误

| 错误 | 后果 | 正确做法 |
|------|------|---------|
| 直接复制项目目录给客户 | 带上 `.git` 历史、技能体系、`.env`、内部文档 | 用本脚本 |
| 改了文件没提交就同步 | 交付副本里还是旧内容 | 先提交再同步 |
| 在交付目录里改代码 | 下次同步被覆盖 | 在项目里改，提交后再同步 |
| 在交付目录 `git init` | 脚本拒绝继续同步 | 交付方需要 git 时，把目录复制出去再自己 init |
| 把 `.deliveryignore` / `.delivery-sync.json` 提交进仓库 | 暴露内部目录结构与交付记录 | 首次执行已自动加入 `.gitignore`，确认没有被强制添加 |
| 用 `extraExclude` 删功能模块 | 首页、导航仍引用被删页面，构建失败 | 用 `stripModules` + `module-strip` |
| 忘了改 `delivery/README.md` | 客户拿到的是模板占位内容 | 首次同步后立即改写并提交 |
| 没问用户就加 `--allow-unmanaged` / `--allow-mass-delete` | 路径指错时会删掉无关目录里的文件 | 先 `--dry-run` 给用户看清单，确认后再加 |

## 执行后自检

- [ ] 交付目录没有 `.git` `.claude` `.codex` `.agents` `.agent-pipeline` `CLAUDE.md` `AGENTS.md` `.env` `.env.*`（`.env.example` 除外）`docs/`
- [ ] 交付目录根有 `README.md`、`DEPLOY.md`（内容已按项目改写）、`.delivery-sync-marker`
- [ ] `.delivery-sync.json` 的 `lastSyncCommit` 等于项目 HEAD
- [ ] 项目 `.gitignore` 含 `.delivery-sync.json`、`.deliveryignore`
- [ ] 配了 `stripModules` 的预设，已执行 module-strip 且 `--verify` 通过
- [ ] 在交付目录里 `pnpm install && pnpm build` 能成功（首次交付前至少验证一次；装出来的 `node_modules`、`dist` 不影响之后的同步）
