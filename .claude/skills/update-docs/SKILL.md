---
name: update-docs
description: 基于源码项目Git提交记录，智能分析并更新文档。当用户说"更新文档"、"同步文档"、"检查文档是否需要更新"时使用此技能。
argument-hint: "[backend|frontend|mobile] [--init|--dry-run]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, TaskCreate, TaskUpdate, TaskGet, TaskList
---

# 更新文档技能

你是文档更新助手，负责根据源码项目的 Git 提交记录，分析哪些文档需要更新，并执行更新。

## 参数说明

- `$ARGUMENTS` 支持以下参数组合：
  - 无参数：检查所有模块
  - `backend`：只检查后端相关提交
  - `frontend`：只检查前端相关提交
  - `mobile`：只检查移动端相关提交
  - `--init`：初始化，记录当前源码项目的最新 commit 为起点
  - `--dry-run`：只分析不执行更新，预览需要更新的内容
  - 可组合使用，如：`backend --dry-run`

## 核心配置

- **源码项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow`
- **文档项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs`
- **检查点文件**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs/.claude/docs-sync-checkpoint.json`
- **目录映射规则**: 见 [mapping.md](mapping.md)

## 执行流程

### 第一步：解析参数

解析 `$ARGUMENTS`，确定：
1. 检查范围：`all` | `backend` | `frontend` | `mobile`
2. 执行模式：`normal` | `init` | `dry-run`

### 第二步：处理 --init 模式

如果是 `--init` 模式：

1. 进入源码项目目录，获取最新 commit hash 和日期：
   ```bash
   cd D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow && git log -1 --format="%H %aI"
   ```

2. 创建或更新检查点文件 `.claude/docs-sync-checkpoint.json`：
   ```json
   {
     "lastSyncCommit": "<commit-hash>",
     "lastSyncDate": "<ISO-date>",
     "syncHistory": [
       {
         "commit": "<commit-hash>",
         "date": "<ISO-date>",
         "summary": "初始化节点",
         "updatedDocs": []
       }
     ]
   }
   ```

3. 输出确认信息后结束。

### 第三步：读取检查点

1. 读取 `.claude/docs-sync-checkpoint.json`
2. 如果文件不存在，提示用户先执行 `/update-docs --init`
3. 获取 `lastSyncCommit` 作为起始节点

### 第四步：获取提交记录

进入源码项目目录，获取从上次检查点到现在的所有提交：

```bash
cd D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow && git log <lastSyncCommit>..HEAD --format="%H|%aI|%s" --no-merges
```

如果没有新提交，记录当前节点并输出"无新提交"后结束。

### 第五步：分析提交内容

对每个提交，获取变更文件列表：

```bash
cd D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow && git diff-tree --no-commit-id -r --name-only <commit-hash>
```

根据 [mapping.md](mapping.md) 中的映射规则，将变更文件分类：

1. **按模块过滤**（如果指定了 backend/frontend/mobile）
2. **按影响程度分类**：
   - **重大更新**：新增模块/组件、大版本升级、`feat` 类型且改动文件 ≥10
   - **普通更新**：功能修改、bug修复、配置变更
   - **无需更新**：格式化、注释、测试用例、CI/CD、文档本身的修改

3. **汇总分析结果**，生成待更新文档清单

### 第六步：输出分析报告

无论什么模式，都输出分析报告：

```markdown
## 文档更新报告

**检查范围**: <lastSyncCommit 前7位> → <HEAD 前7位> (共 N 个提交)
**检查日期**: <当前日期>
**检查模块**: <all|backend|frontend|mobile>

### 需要更新的文档 (N个)
1. `docs/xxx/xxx.md` - 变更原因描述
2. ...

### 重大特性变更 (N个)
- 变更描述（需更新特性列表）

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
   a. 更新 `README.md` 中的特性列表（如果适用）
   b. 更新 `docs/index.md` 首页（如果适用）

**更新原则**：
- 只更新受变更影响的部分，不做无关修改
- 遵守所有文档编写规范（泛型用反引号、禁止文档跳转链接等）
- 新增的 API/配置项需补充到对应的 API 表格中
- 删除的功能需从文档中移除

### 第八步：记录新节点

1. 获取源码项目当前最新 commit：
   ```bash
   cd D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow && git log -1 --format="%H %aI"
   ```

2. 更新 `.claude/docs-sync-checkpoint.json`：
   - 更新 `lastSyncCommit` 和 `lastSyncDate`
   - 在 `syncHistory` 数组末尾追加本次记录
   - `syncHistory` 最多保留最近 50 条记录

3. 如果是 normal 模式且有文档更新，同时更新 `PROJECT_PROGRESS.md` 中对应文档的状态

### 第九步：输出最终结果

```markdown
## 更新完成

- 已更新文档: N 个
- 重大特性更新: N 个
- 新检查点: <commit-hash 前7位> (<日期>)

### 更新详情
1. `docs/xxx/xxx.md` - 更新了 XXX 部分
2. ...
```

## 注意事项

1. **不要遗漏提交**：必须检查从上次节点到现在的所有提交
2. **精准分析**：通过变更文件路径判断影响范围，不要猜测
3. **最小化更新**：只更新受影响的文档部分，不做大规模重写
4. **遵守规范**：严格遵守 CLAUDE.md 中的所有文档编写规范
5. **保留历史**：syncHistory 记录便于回溯，最多保留 50 条
6. **处理异常**：如果源码项目不存在或 git 命令失败，给出明确提示
