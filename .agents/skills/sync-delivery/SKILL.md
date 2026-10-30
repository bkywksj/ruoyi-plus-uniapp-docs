---
name: sync-delivery
description: |
  /sync-delivery - 把当前项目镜像到同级「交付目录」：去掉 git 历史、AI 技能体系与内部协作文档，生成可交给客户的版本

  参数：[--first-time | --status | --dry-run | --preset <名称>]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /sync-delivery，或描述同类意图时，按本文流程执行。）

  触发词：/sync-delivery、sync-delivery
---

# /sync-delivery - 交付副本同步

把当前项目同步到一个独立的交付目录，产出**不带 git 历史、不带 AI 技能体系、不带内部协作文档**的可交付版本。
本命令只做编排，完整流程（配置字段、排除规则、安全检查、常见错误）见 **`delivery-sync` 技能**，执行前先激活它。所有动作都经同一个脚本，不要自己拼复制命令：

```bash
S=.claude/skills/delivery-sync/scripts/delivery-sync.mjs
```

## 用法

| 用法 | 等价脚本调用 | 说明 |
|------|------------|------|
| `/sync-delivery --first-time` | `node $S --first-time --dry-run` → 确认 → `node $S --first-time --delivery-dir <路径>` | 首次创建交付目录（默认 `../<项目目录名>-delivery`，询问用户确认路径） |
| `/sync-delivery` | `node $S --dry-run` → 确认 → `node $S` | 增量同步（先预览再确认） |
| `/sync-delivery --status` | `node $S --status` | 只看交付基线与待同步提交数，不写文件 |
| `/sync-delivery --dry-run` | `node $S --dry-run --verbose` | 只预览将新增 / 更新 / 删除的文件 |
| `/sync-delivery --preset <名称>` | `node $S --preset <名称>` | 用 `.delivery-sync.json` 里的客户预设（额外排除、需裁剪的模块） |

脚本退出码：`0` 成功 / `1` 需要确认（未加 `--force`）/ `2` 安全检查失败 / `3` 环境异常。`--force` 只在用户明确同意后才加。

## 执行流程

### 第一步：环境检查

```bash
git status --short        # 交付的是已提交版本；有未提交改动时提示先提交（否则 baseline 不精确）
git log -1 --format="%h %s"
```

交付前建议先确认 `pnpm verify` 全绿——交付物构建不过比不交付更糟。

### 第二步：按技能执行同步

- **首次**：预览 → 把「交付目录、新增文件数、排除规则来源」给用户确认 → 执行。脚本会从模板生成 `.deliveryignore`、`delivery/README.md`、`delivery/DEPLOY.md`，并把 `.delivery-sync.json`、`.deliveryignore` 加进 `.gitignore`
  - 🔴 执行前检查项目根有没有 `.agent-pipeline/`（跑过 `/dev-orchestrate` 就会有）：它不在默认排除清单里，首次生成 `.deliveryignore` 后先把 `.agent-pipeline/` 加进去再同步
  - 首次同步后**改写 `delivery/README.md` 与 `delivery/DEPLOY.md`**（模板只是骨架；DEPLOY.md 的访问地址要与 `docker-compose.yml` 的端口绑定一致——当前只绑 `127.0.0.1:8080`，外部访问要经反向代理），提交 `delivery/` 与 `.gitignore`，再同步一次
- **增量**：比对当前 HEAD 与交付基线 → 列出新增提交 → 预览 → 用户确认 → 同步
- **状态**：只读输出

默认排除（以 `delivery-sync` 技能的 `deliveryignore.template` 与脚本强制清单为准）：

| 排除 | 原因 |
|------|------|
| `.git/`、`.github/` | 交付不带历史 |
| `.claude/`、`.codex/`、`.agents/`、`CLAUDE.md`、`AGENTS.md`、`scripts/sync-agents-skills.mjs`、`scripts/validate-skills.mjs` | AI 技能体系与配套脚本是内部工具 |
| `.framework-sync.json`、`.delivery-sync.json`、`.deliveryignore` | 内部状态文件 |
| `docs/`（整个目录：需求、原型、任务台账、BLOCKERS、测试报告） | 内部协作文档 |
| `/delivery/` | 其内容已复制到交付目录根，替代内部 README |
| `node_modules/`、`dist/`、`.astro/`、`.cache/`、`logs/`、`output/`、`test-results/`、`playwright-report/`、`coverage/` | 可重建的产物 |
| `.env`、`.env.*`（保留 `.env.example`）、`*-local.*` | 凭据与本机配置不外泄 |

### 第三步：交付后核对

在交付目录里：

```bash
pnpm install && pnpm build          # 交付物能独立构建
grep -rl "CLAUDE.md\|\.claude/" . --include=*.md --exclude-dir=node_modules   # 文档里不残留内部路径引用
ls -a                               # 没有 .git .claude .codex .agents docs .agent-pipeline .env
```

需要去掉示例模块或按客户裁剪 → 接着跑 `/strip-modules <模块> --target <交付目录> --verify`（交付目录取 `.delivery-sync.json` 的 `deliveryDir`）。🔴 每次增量同步都会把被裁的文件恢复回来，所以**每次同步后都要重新裁剪**。

### 第四步：同步报告

```markdown
## 交付同步完成

- 交付目录：{绝对路径}
- 基线：{旧 hash} → {新 hash}（新增提交 N 个）
- 文件变化：+X / ~Y / -Z
- 交付物构建：✅ / ❌（错误摘要）
- 下一步：{/strip-modules <模块> --target <交付目录> --preview（如需裁剪）}
```

## 注意事项

- `.delivery-sync.json` 与 `.deliveryignore` 不入库（本机维护）；`delivery/` 下的交付文档要入库
- 🔴 交付物里不能出现 `.env` 真实值、内部仓库地址、个人凭据；脚本的安全检查报出问题时先处理再交付
- 交付目录不是 git 仓库；不要在交付目录里做开发，也不要在里面 `git init`（脚本会拒绝继续同步）

## 关联命令

- `/strip-modules` —— 在交付目录（`--target`）或当前项目裁剪不需要的模块
- `/framework-sync` —— 从框架仓库同步更新到当前项目（方向相反）
