# Git 规范

## 介绍

本文档定义了 RuoYi-Plus-UniApp 项目的 Git 使用规范，包括提交消息格式、分支管理策略、工作流程、合并策略等内容。遵循这些规范可以：

- **提高协作效率** - 统一的规范让团队成员更容易理解彼此的代码
- **便于追溯** - 规范的提交消息和分支命名便于问题定位
- **自动化支持** - 规范的格式支持自动生成 CHANGELOG、版本管理等
- **减少冲突** - 合理的分支策略和工作流程减少代码冲突

## Commit Message 规范

### 格式规范

项目采用 **Conventional Commits** 规范，提交消息格式如下：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| type | ✅ | 提交类型 |
| scope | ❌ | 影响范围 |
| subject | ✅ | 简短描述 |
| body | ❌ | 详细描述 |
| footer | ❌ | 脚注信息 |

### Type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(user): 新增用户导出功能` |
| `fix` | 修复Bug | `fix(login): 修复验证码不刷新问题` |
| `docs` | 文档更新 | `docs(api): 更新接口文档` |
| `style` | 代码格式 | `style: 调整代码缩进` |
| `refactor` | 重构 | `refactor(utils): 重构日期工具函数` |
| `perf` | 性能优化 | `perf(list): 优化列表渲染性能` |
| `test` | 测试相关 | `test(user): 添加用户模块单元测试` |
| `build` | 构建相关 | `build: 升级 vite 到 5.0` |
| `ci` | CI配置 | `ci: 添加 GitHub Actions` |
| `chore` | 其他修改 | `chore: 更新依赖版本` |
| `revert` | 回滚提交 | `revert: 回滚 feat(user)` |

### Scope 范围

Scope 用于说明提交影响的范围，常用的 scope 包括：

**后端模块：**
- `system` - 系统管理
- `auth` - 认证授权
- `workflow` - 工作流
- `generator` - 代码生成

**前端模块：**
- `components` - 组件
- `views` - 页面
- `stores` - 状态管理
- `utils` - 工具函数

**移动端模块：**
- `pages` - 页面
- `wd` - WD UI组件
- `composables` - 组合式函数

### Subject 规范

- 使用动词开头：添加、修复、更新、移除、优化
- 不超过50个字符
- 不以句号结尾
- 使用中文或英文，保持一致

```bash
# ✅ 正确示例
feat(user): 添加用户导出功能
fix(login): 修复验证码不刷新问题

# ❌ 错误示例
feat(user): 添加用户导出功能。     # 不要句号
feat(user): 用户导出              # 要用动词开头
feat: 添加了一个新的用户导出功能   # 太长
```

### Body 详细描述

当改动较大或需要说明原因时，使用 Body 提供详细描述：

```bash
git commit -m "feat(user): 添加用户批量导入功能

- 支持 Excel 文件导入
- 支持数据校验和错误提示
- 支持导入进度显示

相关需求: #123"
```

### Footer 脚注

用于关联 Issue 或说明破坏性变更：

```bash
# 关联 Issue
Closes #123, #456

# 破坏性变更
BREAKING CHANGE: 用户接口返回格式变更
旧格式: { data: user }
新格式: { code: 200, data: user, msg: 'success' }
```

### 完整示例

```bash
# 简单提交
git commit -m "feat(user): 添加用户导出功能"

# 带 Body
git commit -m "fix(login): 修复验证码不刷新问题

原因: 缓存时间设置过长导致验证码一直显示同一张图片
方案: 将缓存时间从5分钟调整为1分钟"

# 带 Footer
git commit -m "feat(api): 重构用户接口

BREAKING CHANGE: 用户查询接口路径变更
旧路径: /api/user/list
新路径: /api/system/user/list

Closes #789"
```

## 分支管理策略

### 分支类型

| 分支类型 | 命名规范 | 说明 | 生命周期 |
|----------|----------|------|----------|
| master | `master` | 主分支，始终保持可发布状态 | 永久 |
| develop | `develop` | 开发分支，集成最新开发代码 | 永久 |
| feature | `feature/功能名` | 功能分支 | 开发完成后删除 |
| bugfix | `bugfix/问题描述` | Bug修复分支 | 修复完成后删除 |
| hotfix | `hotfix/问题描述` | 紧急修复分支 | 修复完成后删除 |
| release | `release/版本号` | 发布分支 | 发布完成后删除 |

### 分支命名规范

```bash
# 功能分支
feature/user-management          # ✅ 用户管理功能
feature/123-add-export          # ✅ 关联Issue的功能

# Bug修复分支
bugfix/login-error              # ✅ 登录错误修复
bugfix/456-fix-timeout          # ✅ 关联Issue的修复

# 紧急修复分支
hotfix/security-vulnerability   # ✅ 安全漏洞修复
hotfix/v1.0.1                   # ✅ 版本号修复

# 发布分支
release/v1.0.0                  # ✅ 版本发布
release/v2.0.0-beta.1           # ✅ 预发布版本
```

### 分支保护规则

**master 分支：**
- 禁止直接推送
- 必须通过 Pull Request 合并
- 必须通过 CI 检查
- 必须至少一人 Code Review

**develop 分支：**
- 限制直接推送
- 建议通过 Pull Request 合并
- 必须通过 CI 检查

### 分支操作

```bash
# 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-management

# 创建Bug修复分支
git checkout develop
git pull origin develop
git checkout -b bugfix/login-error

# 创建紧急修复分支（从master创建）
git checkout master
git pull origin master
git checkout -b hotfix/security-fix

# 删除分支
git branch -d feature/user-management     # 删除本地分支
git push origin -d feature/user-management # 删除远程分支
```

## 工作流程

### 日常开发流程

```bash
# 1. 同步最新代码
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/user-management

# 3. 开发并提交
git add .
git commit -m "feat(user): 添加用户列表页面"

# 4. 推送到远程
git push -u origin feature/user-management

# 5. 创建 Pull Request 并请求 Code Review

# 6. 合并到 develop（通过 PR）

# 7. 删除功能分支
git branch -d feature/user-management
git push origin -d feature/user-management
```

### 紧急修复流程

```bash
# 1. 从 master 创建修复分支
git checkout master
git pull origin master
git checkout -b hotfix/critical-bug

# 2. 修复并提交
git add .
git commit -m "fix(auth): 修复认证绕过漏洞"

# 3. 合并到 master
git checkout master
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1 -m "hotfix: 修复认证绕过漏洞"
git push origin master --tags

# 4. 同步到 develop
git checkout develop
git merge --no-ff hotfix/critical-bug
git push origin develop

# 5. 删除修复分支
git branch -d hotfix/critical-bug
```

### 版本发布流程

```bash
# 1. 创建发布分支
git checkout develop
git checkout -b release/v1.0.0

# 2. 更新版本号和文档
# 修改 package.json 版本号
# 更新 CHANGELOG.md

# 3. 提交版本更新
git add .
git commit -m "chore(release): 准备发布 v1.0.0"

# 4. 合并到 master
git checkout master
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "release: v1.0.0 正式版本"
git push origin master --tags

# 5. 同步到 develop
git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop

# 6. 删除发布分支
git branch -d release/v1.0.0
```

## 合并策略

### Merge vs Rebase

| 特性 | Merge | Rebase |
|------|-------|--------|
| 历史记录 | 保留完整历史，创建合并提交 | 线性历史，不创建合并提交 |
| 适用场景 | 公共分支、需要保留历史 | 私有分支、保持历史清晰 |
| 冲突处理 | 一次性处理所有冲突 | 逐个提交处理冲突 |
| 推荐用法 | 合并到主分支 | 同步上游代码 |

**使用建议：**
- **功能分支同步 develop**：使用 `rebase`
- **功能分支合并到 develop**：使用 `merge --no-ff`
- **develop 合并到 master**：使用 `merge --no-ff`

```bash
# ✅ 推荐: 功能分支同步 develop
git checkout feature/user-management
git rebase develop

# ✅ 推荐: 合并功能分支到 develop
git checkout develop
git merge --no-ff feature/user-management

# ❌ 不推荐: 在公共分支上 rebase
git checkout develop
git rebase feature/xxx  # 危险操作
```

### Fast-Forward vs No-Fast-Forward

```bash
# Fast-Forward 合并（不创建合并提交）
git merge feature/xxx
# A---B---C  (master)
#          \
#           D---E  (feature)
# 结果: A---B---C---D---E  (master)

# No-Fast-Forward 合并（创建合并提交）
git merge --no-ff feature/xxx
# A---B---C---------M  (master)
#          \       /
#           D---E    (feature)
```

**项目约定**：合并功能分支时使用 `--no-ff`，保留分支历史信息。

### Squash 合并

将多个提交压缩成一个：

```bash
# 将功能分支的所有提交压缩成一个
git checkout develop
git merge --squash feature/user-management
git commit -m "feat(user): 添加用户管理功能"
```

**适用场景**：
- 功能分支有太多琐碎提交
- 想要保持主分支历史清晰
- 不需要保留开发过程中的细节

## 标签管理

### 版本号规范

采用 **语义化版本**（Semantic Versioning）：

```
主版本号.次版本号.修订号[-预发布标识]
MAJOR.MINOR.PATCH[-PRERELEASE]
```

| 版本变化 | 说明 | 示例 |
|----------|------|------|
| 主版本号 | 不兼容的 API 修改 | `v1.0.0 → v2.0.0` |
| 次版本号 | 向下兼容的功能新增 | `v1.0.0 → v1.1.0` |
| 修订号 | 向下兼容的问题修正 | `v1.0.0 → v1.0.1` |

**预发布标识：**
- `alpha` - 内测版本
- `beta` - 公测版本
- `rc` - 候选版本

```bash
v1.0.0-alpha.1    # 第一个内测版本
v1.0.0-beta.1     # 第一个公测版本
v1.0.0-rc.1       # 第一个候选版本
v1.0.0            # 正式版本
```

### 标签操作

```bash
# 创建附注标签（推荐）
git tag -a v1.0.0 -m "release: v1.0.0 正式版本

主要更新:
- 新增用户管理模块
- 新增支付功能
- 优化查询性能"

# 推送标签
git push origin v1.0.0
git push origin --tags  # 推送所有标签

# 查看标签
git tag
git tag -l "v1.*"
git show v1.0.0

# 删除标签
git tag -d v1.0.0                    # 删除本地
git push origin :refs/tags/v1.0.0    # 删除远程
```

### 标签最佳实践

```bash
# ✅ 使用附注标签
git tag -a v1.0.0 -m "release: v1.0.0"

# ✅ 标签信息要详细
git tag -a v1.0.0 -m "release: v1.0.0 正式版本

主要更新:
- 新增用户管理模块
- 优化性能50%"

# ❌ 不要修改已推送的标签
git tag -f v1.0.0  # 错误做法
```

## .gitignore 规范

### 基本规则

```bash
# 空行：不匹配任何文件
# 注释：以 # 开头
# 目录：以 / 结尾
# 取反：以 ! 开头表示不忽略
# 根目录：以 / 开头表示项目根目录

*.log               # 忽略所有 .log 文件
node_modules/       # 忽略 node_modules 目录
/temp/              # 忽略根目录下的 temp 目录
**/.env             # 忽略所有目录下的 .env 文件
!.gitkeep           # 不忽略 .gitkeep 文件
```

### 通用 .gitignore

```bash
# ============================================
# 依赖目录
# ============================================
node_modules/
vendor/

# ============================================
# 构建产物
# ============================================
dist/
build/
target/

# ============================================
# 编辑器和 IDE
# ============================================
.idea/
.vscode/
*.sw?

# ============================================
# 环境配置
# ============================================
.env
.env.local
.env.*.local

# ============================================
# 日志文件
# ============================================
logs/
*.log
npm-debug.log*

# ============================================
# 系统文件
# ============================================
.DS_Store
Thumbs.db

# ============================================
# 缓存文件
# ============================================
.cache/
.eslintcache
.stylelintcache
```

### 项目特定配置

**前端/文档项目补充：**
```bash
# VitePress
docs/.vitepress/dist
docs/.vitepress/cache
```

**后端项目补充：**
```bash
# Maven
target/
pom.xml.tag
*.jar
!**/src/main/**/target/

# 敏感配置
application-local.yml
```

**移动端项目补充：**
```bash
# UniApp
unpackage/
.hbuilderx/
```

### .gitignore 技巧

```bash
# 忽略文件但保留目录
logs/*
!logs/.gitkeep

# 检查忽略规则
git check-ignore -v filename

# 清理已提交的忽略文件
git rm --cached filename
git commit -m "chore: 移除不应提交的文件"
```

## Git Hooks

### 常用 Hooks

| Hook | 触发时机 | 用途 |
|------|----------|------|
| `pre-commit` | 提交前 | 代码检查、格式化 |
| `commit-msg` | 提交消息完成后 | 验证提交消息格式 |
| `pre-push` | 推送前 | 运行测试 |

### 配置 Husky + lint-staged

```bash
# 安装依赖
pnpm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# 初始化 Husky
npx husky init
```

**package.json 配置：**
```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"]
  }
}
```

**commitlint.config.js：**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'subject-max-length': [2, 'always', 100]
  }
}
```

**创建 Hooks：**
```bash
# pre-commit
npx husky add .husky/pre-commit "npx lint-staged"

# commit-msg
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
```

## 冲突处理

### 识别冲突

```
<<<<<<< HEAD
// 当前分支的代码
const name = '张三'
=======
// 要合并的分支的代码
const name = '李四'
>>>>>>> feature/user-management
```

### 解决冲突

```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑文件，解决冲突

# 3. 标记已解决
git add <file>

# 4. 完成合并
git commit  # merge 冲突
# 或
git rebase --continue  # rebase 冲突
```

### 冲突处理策略

```bash
# 保留当前分支版本
git checkout --ours <file>

# 保留传入分支版本
git checkout --theirs <file>

# 放弃合并
git merge --abort
git rebase --abort
```

### 预防冲突

1. **及时同步代码** - 每天开始工作前拉取最新代码
2. **小步提交** - 频繁提交小的改动
3. **功能模块化** - 不同功能在不同文件中实现
4. **沟通协作** - 避免同时修改同一文件

## 常见问题

### 1. 修改最后一次提交

```bash
# 修改提交内容（未推送）
git add forgotten-file.ts
git commit --amend --no-edit

# 修改提交消息
git commit --amend -m "新的提交消息"

# 回滚最后一次提交，保留更改
git reset --soft HEAD~1
```

### 2. 推送被拒绝

```bash
# 先拉取再推送
git pull origin master
git push origin master

# 使用 rebase 保持历史清晰
git pull --rebase origin master
git push origin master
```

### 3. 回滚到之前版本

```bash
# 重置到指定提交（丢弃之后的提交）
git reset --hard abc123

# 创建反向提交（推荐，保留历史）
git revert abc123
```

### 4. 恢复误删的分支

```bash
# 查看操作历史
git reflog

# 恢复分支
git checkout -b feature/xxx def456
```

### 5. 合并多个提交

```bash
# 交互式 rebase（只能合并未推送的提交）
git rebase -i HEAD~5

# 在编辑器中将要合并的提交标记为 squash
```

### 6. 暂存当前工作

```bash
git stash save "工作进行中"
git stash list
git stash pop
git stash apply stash@{0}
```

### 7. 查看文件修改历史

```bash
git log -- <file>             # 提交历史
git log -p -- <file>          # 详细内容
git blame <file>              # 每行修改人
```

### 8. 处理大文件

```bash
# 使用 Git LFS
git lfs install
git lfs track "*.zip"
git add .gitattributes
```

## 实用技巧

### 配置别名

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --graph --oneline --all"
```

### 美化日志

```bash
# 图形化历史
git log --graph --oneline --all

# 搜索提交消息
git log --grep="用户管理"

# 搜索代码变更
git log -S"function_name"
```

### 快速操作

```bash
# 放弃所有未提交更改
git reset --hard HEAD

# 放弃某个文件更改
git checkout -- filename

# 删除未跟踪文件
git clean -fd

# 批量删除已合并分支
git branch --merged master | grep -v "\* master" | xargs -n 1 git branch -d
```

### 安全操作

```bash
# 查看将要推送的内容
git push --dry-run

# 安全的强制推送
git push --force-with-lease

# 备份分支
git branch backup-master master
```

### 查找问题提交

```bash
# 二分查找引入Bug的提交
git bisect start
git bisect bad              # 标记当前有问题
git bisect good v1.0.0      # 标记某版本是好的
# Git会自动切换提交，测试后标记 good/bad
git bisect reset            # 结束查找
```

## 最佳实践总结

### 提交规范

✅ **推荐：**
- 使用 Conventional Commits 规范
- 提交消息清晰描述改动
- 一次提交只做一件事
- 提交前进行代码检查

❌ **禁止：**
- 提交消息模糊不清
- 一次提交多个不相关改动
- 提交敏感信息（密码、密钥）
- 直接在主分支开发

### 分支管理

✅ **推荐：**
- 使用 feature 分支开发
- 定期同步主分支代码
- 功能完成后及时删除分支
- 使用 `--no-ff` 合并保留历史

❌ **禁止：**
- 在主分支直接开发
- 长期不合并的功能分支
- 分支命名不规范
- 在公共分支上 rebase

### 代码审查

✅ **推荐：**
- 所有代码通过 Pull Request
- 至少一人审核通过才能合并
- 提供建设性反馈

❌ **禁止：**
- 未经审查直接合并
- 自己审查自己的代码

## 总结

本文档定义了 RuoYi-Plus-UniApp 项目的 Git 规范：

1. **Commit Message** - 采用 Conventional Commits 规范
2. **分支管理** - master/develop/feature/bugfix/hotfix/release 分支策略
3. **工作流程** - 日常开发、紧急修复、版本发布的标准流程
4. **合并策略** - 功能分支用 rebase 同步，用 merge --no-ff 合并
5. **标签管理** - 语义化版本，附注标签
6. **Git Hooks** - Husky + lint-staged + commitlint 自动化检查
7. **冲突处理** - 及时同步、小步提交、沟通协作

遵循这些规范可以提高协作效率、保证代码质量、简化版本管理。
