---
name: strip-modules
description: |
  /strip-modules - 裁剪不需要的示例模块（作品目录 / 文章 / FAQ / 示例数据），作用于当前项目或交付目录，裁剪后验证

  参数：[模块名...] [--list | --preview | --verify | --target <目录>]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /strip-modules，或描述同类意图时，按本文流程执行。）

  触发词：/strip-modules、strip-modules
---

# /strip-modules - 模块裁剪

框架自带的示例模块不一定都用得上：孵化后的新项目可能不要文章、不要 FAQ，或者要把示例 `works` 清空后换成自己的内容。
本命令只做编排，每个模块具体删哪些文件、改哪些引用，见 **`module-strip` 技能**，执行前先激活它。所有动作都经同一个脚本：

```bash
S=.claude/skills/module-strip/scripts/module-strip.mjs
```

## 用法

| 用法 | 等价脚本调用 | 说明 |
|------|------------|------|
| `/strip-modules --list` | `node $S --list` | 列出可裁剪的模块（预设） |
| `/strip-modules posts faq --preview` | `node $S posts faq --preview` | 预览裁剪文章与 FAQ 会删 / 改哪些文件，不写盘 |
| `/strip-modules posts faq` | `node $S posts faq` | 在**当前项目**裁剪 |
| `/strip-modules posts --target <交付目录>` | `node $S posts --target "<交付目录>"` | 在**交付目录**裁剪；交付目录取 `.delivery-sync.json` 的 `deliveryDir`（由 `/sync-delivery` 生成） |
| 追加 `--verify` | `… --verify` | 裁剪后在目标目录跑 `pnpm verify`（build + check:seo + test） |

取交付目录：

```bash
grep -m1 '"deliveryDir"' .delivery-sync.json
```

## 可裁剪模块（以 `module-strip` 技能与 `--list` 输出为准）

| 模块 | 大致范围 | 裁掉后需要同步处理 |
|------|---------|------------------|
| `works` | 作品目录：`works` / `categories` 集合与数据、`src/pages/works/`、`src/components/works/`、`WorksExplorer` island、`src/lib/works.ts`、作品专属测试（`tests/e2e/works.spec.ts`、`tests/unit/works-schema.test.ts`） | 首页精选与分类区块、`llms.txt` 分区、导航、404 页里的链接；按新站点补写 `<模块>.spec.ts` |
| `posts` | 文章：`posts` 集合、`src/content/posts/`、`src/pages/posts/` | 首页「最新文章」区块、`llms.txt` 分区、导航 |
| `faq` | 首页常见问题：`src/data/faq.json` 与首页 FAQ 区块 | 首页 `faqJsonLd` |
| `examples` | 只清示例数据与示例封面（`.claude/framework-config.json` 的 `framework.examples.paths`），保留结构 | 需要替换成真实数据，否则构建时集合为空 |

## 执行流程

1. **确认是裁剪还是改造**：用户要的是「把 works 改成视频 / 课程…」→ 不裁，开发阶段改名改写，完成后把模块登记进 `.framework-sync.json` 的 `transformedModules`（见 `module-strip` 技能「已改造的模块」），本命令到此为止；已登记的改造模块脚本会输出「🔁 已改造，跳过」
2. **确认目标**：当前项目（默认）还是交付目录（`--target <deliveryDir>`）；当前项目有未提交改动时按 L1 协议避让，不覆盖他者文件（脚本也会拦「工作区不干净」，确认无妨才加 `--force`）
3. **预览**：`--preview` 列出每个模块将删除的文件、将修改的引用位置（首页区块、导航、llms.txt、404 链接），等用户确认
4. **执行**：按 `module-strip` 技能删除与修改；修改了 `src/pages/index.astro`、`src/pages/llms.txt.ts` 等共享文件时在报告里逐一列出。当前项目有 `.framework-sync.json` 时，脚本会把裁掉的模块记进它的 `strippedModules`，`/framework-sync` 据此跳过这些路径
5. **验证**：加 `--verify` 由脚本在目标目录跑，或手动：

```bash
pnpm verify       # build（残留引用、集合不存在会在这里报）+ check:seo（首页描述、llms.txt 仍合规）+ test
```

6. **提交**（仅当前项目；交付目录不是 git 仓库）：逐个 `git add` 本次修改的文件、`git rm <具体文件>` 删除的文件，`git commit -m "refactor(strip): 裁剪 posts、faq 模块"`（不计入业务进度，见 `CLAUDE.md`「提交与进度口径」）

## 输出

```markdown
## 模块裁剪完成

- 目标：{当前项目 / 交付目录 <路径>}
- 已裁剪：{模块列表}
- 删除文件：X 个；修改文件：Y 个（其中框架核心：{列表}）
- 验证：pnpm verify ✅（build / check:seo / test）
- 待手动处理：{如：导航文案、首页布局需要重新排版、补写冒烟用例}
```

## 注意事项

- 🔴 当前项目裁剪会删除文件：预览确认后才执行；已提交的内容可以通过 git 找回，未提交的不行，所以先确保工作区干净
- 在框架仓库本身运行时，脚本会拒绝执行（框架要保留全部示例）；只想看会改什么就加 `--preview`。裁剪应在孵化出的子项目或交付目录里做
- 交付目录每次 `/sync-delivery` 增量同步都会把被裁的文件恢复回来，**每次同步后都要重新裁剪**
- 裁剪后若 `/framework-sync` 又带回示例文件，同步时按「示例内容 → 跳过」处理，并用 `node $S --audit` 检查已裁模块有没有被合回来

## 关联命令

- `/sync-delivery` —— 生成交付目录
- `/collection` —— 裁掉示例后新增自己的内容类型
- `/framework-sync` —— 同步框架时跳过已裁模块
