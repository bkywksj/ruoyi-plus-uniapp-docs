---
name: update-docs
description: 基于源码项目Git提交记录，智能分析并更新文档。当用户说"更新文档"、"同步文档"、"检查文档是否需要更新"时使用此技能。
argument-hint: "[branch] [backend|frontend|mobile] [--init|--dry-run]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, TaskCreate, TaskUpdate, TaskGet, TaskList
---

# 更新文档技能

你是文档更新助手，负责根据源码项目的 Git 提交记录，分析哪些文档需要更新，并执行更新。

框架现有 **5 个分支变体**，每个变体是**独立的本地 git 仓库**。本技能支持从**任意指定分支**同步文档，检查点按分支分别记录、互不干扰。

## 参数说明

- `$ARGUMENTS` 支持以下参数组合：
  - **分支名**（可选）：指定同步源分支，取值 `master` | `single` | `workflow` | `6.x` | `6.x-single`；不指定时使用**默认分支 workflow**
  - 无参数：检查默认分支(workflow)的所有模块
  - `backend`：只检查后端相关提交
  - `frontend`：只检查前端相关提交
  - `mobile`：只检查移动端相关提交
  - `--init`：初始化，记录**指定分支**当前最新 commit 为起点
  - `--dry-run`：只分析不执行更新，预览需要更新的内容
  - 可组合使用，如：`6.x backend --dry-run`、`single --init`、`workflow frontend`

## 核心配置

### 源码分支仓库（5 个本地分支）

框架 5 个分支业务代码与规范一致，按「租户模型 × 技术栈」区分。**用户提到分支时按下表定位对应本地仓库**（支持多种叫法）：

| 分支（标准名） | 用户可能的叫法 | 本地仓库路径 | **git 分支名** | Spring Boot | JDK | 多租户 | 工作流 |
|------|------|------|:---:|:---:|:---:|:---:|:---:|
| **master** | 主线 / 默认 / 多租户版 | `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp` | `master` | 3.5.x | 21 | ✅ | ❌ |
| **single** | 单租户 / single | `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-single` | `single` | 3.5.x | 21 | ❌ | ❌ |
| **workflow** | 工作流 / warm-flow | `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow` | `workflow` | 3.5.x | 21 | ✅ | ✅ |
| **6.x** | 6x / SpringBoot4 / SB4 | `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-6x` | `6.x` | 4.1.0 | 21 | ✅ | ✅ |
| **6.x-single** | 6x单租户 / SB4单租户 | `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-6x-single` | `single-6.x` | 4.1.0 | 21 | ❌ | ✅ |

> ⚠️ **重要坑点**：`6.x-single` 的目录名是 `ruoyi-plus-uniapp-6x-single`，但其**真实 git 分支名是 `single-6.x`**（不是 `6.x-single`）。运行 `git` 命令切换/校验分支时必须用真实分支名，定位仓库用目录路径。

**分支解析规则**：用户说"6x"/"6.x"/"SpringBoot4"→ `6.x` 分支；说"单租户"/"single"→ `single` 分支；说"6x单租户"→ `6.x-single` 分支；说"主线"/"默认"→ `master` 分支；未指定 → **默认 workflow 分支**。拿不准时按上表"用户可能的叫法"列匹配。

**默认同步源**：未指定分支时使用 **workflow** 分支（功能最全：多租户 + 工作流，是文档正文的主要参考源）。

- **文档项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs`
- **检查点文件**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/.claude/docs-sync-checkpoint.json`（**按分支分别记录**同步进度，见下方结构）
- **目录映射规则**: 见 [mapping.md](mapping.md)（5 个分支模块结构一致，映射规则通用）

### 检查点文件结构（按分支）

```json
{
  "defaultBranch": "workflow",
  "branches": {
    "<分支名>": {
      "path": "<该分支本地仓库路径>",
      "gitBranch": "<真实 git 分支名>",
      "lastSyncCommit": "<上次同步到的 commit，null 表示未初始化>",
      "lastSyncDate": "<ISO 日期>"
    }
  },
  "syncHistory": [
    { "branch": "<分支名>", "commit": "...", "date": "...", "summary": "...", "updatedDocs": [] }
  ]
}
```

- 每个分支独立记录 `lastSyncCommit`，同步某分支只读写该分支的节点，**不影响其他分支**。
- `lastSyncCommit` 为 `null` 表示该分支尚未初始化，需先执行 `<分支> --init`。
- `syncHistory` 为全局共享的审计轨迹，新增记录必须带 `branch` 字段（早期无 `branch` 字段的记录默认属于 workflow）。

## 执行流程

### 第一步：解析参数

解析 `$ARGUMENTS`，确定：
1. **目标分支**：`master` | `single` | `workflow` | `6.x` | `6.x-single`（未指定 → `defaultBranch`，即 workflow）。按上方"分支解析规则"把用户的口语叫法归一到标准分支名。
2. 检查范围：`all` | `backend` | `frontend` | `mobile`
3. 执行模式：`normal` | `init` | `dry-run`
4. 从检查点 `branches[目标分支]` 读取该分支的 `path` 与 `gitBranch`。后续所有 git 命令都在该 `path` 下、针对该 `gitBranch` 执行。

> 校验：进入 `path` 后确认当前分支与 `gitBranch` 一致（`git -C <path> rev-parse --abbrev-ref HEAD`）。若不一致，提示用户该仓库当前不在预期分支，不要擅自切换分支。

### 第二步：处理 --init 模式

如果是 `--init` 模式（针对**目标分支**）：

1. 获取该分支最新 commit hash 和日期：
   ```bash
   git -C <目标分支 path> log -1 --format="%H %aI"
   ```

2. 更新检查点文件中 `branches[目标分支]` 的 `lastSyncCommit` / `lastSyncDate`，并在 `syncHistory` 追加一条带 `branch` 字段的初始化记录：
   ```json
   {
     "branch": "<目标分支>",
     "commit": "<commit-hash>",
     "date": "<ISO-date>",
     "summary": "初始化节点",
     "updatedDocs": []
   }
   ```

3. 输出确认信息后结束。

### 第三步：读取检查点

1. 读取 `.claude/docs-sync-checkpoint.json` 中 `branches[目标分支]`
2. 如果 `lastSyncCommit` 为 `null`（未初始化），提示用户先执行 `<目标分支> --init`
3. 获取 `lastSyncCommit` 作为起始节点

### 第四步：获取提交记录

在**目标分支仓库**下，获取从上次检查点到现在的所有提交：

```bash
git -C <目标分支 path> log <lastSyncCommit>..HEAD --format="%H|%aI|%s" --no-merges
```

如果没有新提交，记录当前节点并输出"无新提交"后结束。

### 第五步：分析提交内容

对每个提交，获取变更文件列表：

```bash
git -C <目标分支 path> diff-tree --no-commit-id -r --name-only <commit-hash>
```

根据 [mapping.md](mapping.md) 中的映射规则，将变更文件分类：

1. **按模块过滤**（如果指定了 backend/frontend/mobile）
2. **按影响程度分类**：
   - **重大更新**：新增模块/组件、大版本升级、`feat` 类型且改动文件 ≥10
   - **普通更新**：功能修改、bug修复、配置变更
   - **无需更新**：格式化、注释、测试用例、CI/CD、文档本身的修改
3. **区分分支专属特性**：若目标分支是 `6.x`/`6.x-single`（Spring Boot 4）或 `single`/`6.x-single`（单租户），注意其相对主线的**差异化提交**（如 SB4 依赖升级、去多租户逻辑）——这类改动只应更新到分支说明/特性对比处，不要污染以主线(master/workflow)为准的文档正文。
4. **汇总分析结果**，生成待更新文档清单

### 第六步：输出分析报告

无论什么模式，都输出分析报告：

```markdown
## 文档更新报告

**目标分支**: <分支名> (git: <gitBranch>)
**检查范围**: <lastSyncCommit 前7位> → <HEAD 前7位> (共 N 个提交)
**检查日期**: <当前日期>
**检查模块**: <all|backend|frontend|mobile>

### 需要更新的文档 (N个)
1. `docs/xxx/xxx.md` - 变更原因描述
2. ...

### 重大特性变更 (N个)
- 变更描述（需更新特性列表 / changelog）

### 无需更新 (N个提交)
- 简要说明跳过原因
```

### 第七步：执行更新（仅 normal 模式）

如果是 `--dry-run` 模式，输出报告后跳到第八步。

如果是 `normal` 模式：

1. 创建任务清单，跟踪每个文档的更新进度
2. 对每个需要更新的文档：
   a. 阅读源码中的变更内容，理解改了什么
   b. 阅读当前文档内容
   c. 更新文档中受影响的部分（不重写整个文档，只更新变更部分）
   d. 遵守 CLAUDE.md 中的所有文档编写规范
3. 如果有重大特性变更：
   a. 更新 `docs/changelog.md` 特性页（如果适用）
   b. 更新 `docs/index.md` 首页（如果适用）
   c. 涉及分支差异（SB4 / 单租户）时，更新 `docs/changelog.md` 顶部的分支说明表

**更新原则**：
- 只更新受变更影响的部分，不做无关修改
- 遵守所有文档编写规范（泛型用反引号、禁止文档跳转链接等）
- 新增的 API/配置项需补充到对应的 API 表格中
- 删除的功能需从文档中移除
- **文档正文以主线(master/workflow, 3.5.x)为准**，SB4/单租户的差异只落到分支说明与特性对比，不改写正文默认口径

### 第八步：记录新节点

1. 获取**目标分支**当前最新 commit：
   ```bash
   git -C <目标分支 path> log -1 --format="%H %aI"
   ```

2. 更新 `.claude/docs-sync-checkpoint.json`：
   - 更新 `branches[目标分支]` 的 `lastSyncCommit` 和 `lastSyncDate`
   - 在 `syncHistory` 数组末尾追加本次记录（**必须带 `branch` 字段**）
   - `syncHistory` 最多保留最近 50 条记录

3. 如果是 normal 模式且有文档更新，同时更新 `PROJECT_PROGRESS.md` 中对应文档的状态

### 第九步：输出最终结果

```markdown
## 更新完成

- 目标分支: <分支名>
- 已更新文档: N 个
- 重大特性更新: N 个
- 新检查点: <commit-hash 前7位> (<日期>)

### 更新详情
1. `docs/xxx/xxx.md` - 更新了 XXX 部分
2. ...
```

## 注意事项

1. **先定位分支再动手**：任何操作前先按参数解析出目标分支及其仓库路径，所有 git 命令都在该仓库执行；`6.x-single` 的真实分支名是 `single-6.x`。
2. **不要遗漏提交**：必须检查从该分支上次节点到现在的所有提交
3. **精准分析**：通过变更文件路径判断影响范围，不要猜测
4. **最小化更新**：只更新受影响的文档部分，不做大规模重写
5. **分支隔离**：检查点按分支独立记录，同步某分支不得改动其他分支的节点
6. **遵守规范**：严格遵守 CLAUDE.md 中的所有文档编写规范
7. **保留历史**：syncHistory 记录便于回溯，最多保留 50 条，每条须带 `branch` 字段
8. **只跑离线 git**：仅使用 `log`/`show`/`diff-tree`/`rev-parse` 等离线命令，不执行 `fetch`/`pull`/`push`（远程操作走 Sigil）
9. **处理异常**：如果某分支仓库不存在、不在预期分支或 git 命令失败，给出明确提示，不擅自切分支
