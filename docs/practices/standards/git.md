# Git 使用规范

> **文档状态**: ✅ 已完成
>
> 本文档详细介绍 RuoYi-Plus-UniApp 项目的 Git 版本控制使用规范，包括分支管理、提交规范、工作流程等内容。

## 介绍

Git 是现代软件开发中不可或缺的版本控制工具。规范的 Git 使用能够：

**核心价值:**

- **提高协作效率** - 统一的规范减少团队沟通成本，让代码协作更加顺畅
- **保证代码质量** - 规范的提交和审查流程确保代码质量可控
- **追踪变更历史** - 清晰的提交记录让代码变更可追溯、可回滚
- **简化版本管理** - 合理的分支策略让版本发布和维护更加简单
- **降低错误风险** - 标准化的工作流程减少人为失误和代码冲突
- **便于问题定位** - 规范的提交信息帮助快速定位问题根源

本文档基于项目实际使用情况编写，所有规范和示例均来源于真实的开发实践。

参考: ruoyi-plus-uniapp-docs/.git/logs/HEAD

## Commit Message 规范

### 提交消息格式

项目采用 **Conventional Commits** 规范，提交消息格式如下：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**格式说明:**

- **type**: 提交类型（必填）
- **scope**: 影响范围（可选）
- **subject**: 简短描述（必填）
- **body**: 详细描述（可选）
- **footer**: 关联信息（可选）

### 提交类型 (type)

提交类型用于说明本次提交的性质，必须是以下类型之一：

| 类型 | 说明 | 使用场景 | 示例 |
|------|------|----------|------|
| `feat` | 新功能 | 添加新特性、新模块、新页面 | `feat(mobile): 添加用户中心页面` |
| `fix` | 修复问题 | 修复 Bug、异常、错误 | `fix(backend): 修复用户登录异常` |
| `docs` | 文档变更 | 修改文档、注释、README | `docs(mobile): 完善 Button 组件文档` |
| `style` | 代码格式 | 代码格式化、缩进、空格等 | `style(components): 格式化代码` |
| `refactor` | 代码重构 | 代码重构，不影响功能 | `refactor(docker): 优化配置` |
| `perf` | 性能优化 | 提升性能的代码改动 | `perf(query): 优化数据库查询` |
| `test` | 测试相关 | 添加测试、修改测试 | `test(user): 添加用户模块测试` |
| `build` | 构建系统 | 构建配置、依赖更新 | `build(deps): 升级 Vue 到 3.5` |
| `ci` | CI/CD | CI 配置、脚本修改 | `ci(github): 添加自动部署` |
| `chore` | 其他杂项 | 不影响代码的其他修改 | `chore(release): 发布 v1.0.0` |
| `revert` | 回滚提交 | 回滚之前的提交 | `revert: 回滚提交 abc123` |

**类型选择原则:**

1. **功能相关**: 优先使用 `feat`（新增）或 `fix`（修复）
2. **代码改进**: 使用 `refactor`（重构）或 `perf`（性能）
3. **非代码内容**: 使用 `docs`（文档）、`style`（格式）、`test`（测试）
4. **工程配置**: 使用 `build`（构建）、`ci`（CI）、`chore`（杂项）

参考: ruoyi-plus-uniapp-docs/.git/logs/HEAD:1-30

### 影响范围 (scope)

影响范围用于说明本次提交影响的模块或功能，使用小写字母。

**后端模块:**

```
system      # 系统管理模块
business    # 业务模块
generator   # 代码生成器
mall        # 商城模块
payment     # 支付模块
miniapp     # 小程序模块
mp          # 公众号模块
auth        # 认证授权
core        # 核心模块
config      # 配置模块
security    # 安全模块
```

**前端模块:**

```
frontend    # 前端管理系统
components  # 组件
views       # 页面
utils       # 工具函数
store       # 状态管理
router      # 路由
api         # API 接口
types       # 类型定义
styles      # 样式
icons       # 图标
i18n        # 国际化
chart       # 图表
```

**移动端模块:**

```
mobile      # 移动端
uniapp      # UniApp 相关
wd          # WD UI 组件库
pages       # 页面
composables # 组合式函数
```

**文档模块:**

```
docs        # 文档项目
backend     # 后端文档
frontend    # 前端文档
mobile      # 移动端文档
practices   # 最佳实践
changelog   # 更新日志
```

**通用模块:**

```
database    # 数据库
docker      # Docker
deps        # 依赖
config      # 配置
lint        # 代码检查
release     # 版本发布
```

**使用建议:**

- 优先使用功能模块名称作为 scope
- 跨模块修改可以使用更宽泛的 scope（如 `core`、`config`）
- 文档类提交使用具体的文档分类（如 `mobile`、`backend`）
- 当影响范围不明确时，scope 可以省略

参考: ruoyi-plus-uniapp-docs/.git/logs/HEAD:1-30

### 简短描述 (subject)

简短描述是对本次提交的简要说明，遵循以下规则：

**基本要求:**

1. **长度限制**: 不超过 50 个字符（中文约 25 个字）
2. **动词开头**: 使用动词开头，如"添加"、"修复"、"更新"、"删除"
3. **不加句号**: 结尾不加句号或其他标点符号
4. **描述清晰**: 准确描述改动内容，让人一目了然
5. **使用中文**: 统一使用中文描述

**动词选择:**

| 动词 | 使用场景 | 示例 |
|------|----------|------|
| 添加 | 新增文件、功能、模块 | `添加用户头像上传功能` |
| 新增 | 同"添加" | `新增支付配置选项列表接口` |
| 完善 | 改进已有功能 | `完善 Button 组件文档` |
| 更新 | 更新内容、版本 | `更新 AI 接口路径` |
| 修复 | 修复 Bug | `修复字典项 ID 获取方式` |
| 优化 | 性能优化、代码改进 | `优化文件上传逻辑` |
| 重构 | 代码重构 | `重构 AI 助手组件` |
| 调整 | 调整配置、参数 | `调整用户选择组件弹窗高度` |
| 移除 | 删除代码、功能 | `移除过时的文档链接` |
| 删除 | 同"移除" | `删除冗余的配置项` |
| 支持 | 添加对某功能的支持 | `支持自定义宽度设置` |
| 引入 | 引入新的依赖、技术 | `引入确认提示功能` |
| 统一 | 统一规范、格式 | `统一 AI 接口参数命名` |
| 确保 | 确保某种行为 | `确保文件上传初始化后清理签名` |
| 简化 | 简化逻辑、流程 | `简化邀请链接生成逻辑` |

**示例对比:**

✅ **正确示例:**

```
feat(mobile): 添加用户中心页面
fix(generator): 修复字典项值转换问题
docs(button): 完善按钮组件文档内容
refactor(ai): 重构 AI 助手组件并优化类型定义
perf(query): 优化数据库查询性能
```

❌ **错误示例:**

```
feat(mobile): add user center page              # 使用了英文
fix(generator): 修复了一个关于字典项值转换的问题。  # 太详细，且有句号
docs: 更新文档                                  # 描述不清晰
update button component                         # 缺少类型和中文
优化代码                                        # 缺少类型和 scope
```

参考: ruoyi-plus-uniapp-docs/.git/logs/HEAD:1-30

### 详细描述 (body)

详细描述是对 subject 的补充，用于说明更多细节，遵循以下规则：

**使用场景:**

1. **复杂功能**: 新增的功能比较复杂，需要详细说明
2. **重大改动**: 涉及架构、API 等重大变更
3. **问题修复**: 需要说明问题原因和解决方案
4. **特殊说明**: 需要特别说明的注意事项

**格式要求:**

1. **空行分隔**: 与 subject 之间空一行
2. **列表形式**: 建议使用列表形式，每项以 `-` 或数字开头
3. **段落清晰**: 每段描述一个方面，段落之间空行
4. **字数适中**: 每行不超过 72 个字符

**示例:**

```bash
git commit -m "feat(upload): 支持处理带签名的OSS文件URL

- 添加 signedUrl 字段存储带签名的完整 URL 用于回显
- 实现 extractCleanUrl 函数提取不带签名的干净 URL
- 更新文件列表初始化逻辑，分离存储干净 URL 和签名 URL
- 修改重复文件检查逻辑，使用清理后的 URL 进行比较
- 调整删除文件前的匹配逻辑，优先使用签名 URL 匹配
- 优化图片上传组件的 URL 显示逻辑，优先使用签名 URL
- 解决预签名 URL 添加缓存参数导致签名失效的问题"
```

参考: ruoyi-plus-uniapp/.git/logs/HEAD:dcbbced66

### 关联信息 (footer)

关联信息用于说明与本次提交相关的其他信息，如关联的 Issue、破坏性变更等。

**使用场景:**

1. **关联 Issue**: 关联相关的 Issue 编号
2. **破坏性变更**: 说明不兼容的变更（Breaking Changes）
3. **关闭 Issue**: 通过提交关闭 Issue

**格式示例:**

```bash
# 关联 Issue
git commit -m "fix(auth): 修复登录超时问题

Refs: #123"

# 关闭 Issue
git commit -m "feat(payment): 添加支付宝支付

Closes #456"

# 破坏性变更
git commit -m "refactor(api): 重构用户 API 接口

BREAKING CHANGE: 用户 API 路径从 /user 改为 /api/user，需要更新所有调用方"
```

**关键词说明:**

- `Refs:` 或 `Related to:` - 关联 Issue
- `Closes:` 或 `Fixes:` - 关闭 Issue
- `BREAKING CHANGE:` - 破坏性变更

### 完整示例

以下是完整的提交消息示例，展示了各个部分的组合使用：

**示例 1: 简单提交（仅 type + scope + subject）**

```bash
git commit -m "feat(mobile): 添加用户中心页面"
```

**示例 2: 带详细描述**

```bash
git commit -m "feat(AFormFileUpload): 优化文件上传逻辑以支持批量处理

- 新增 pendingFiles 临时存储待添加文件
- 移除调试日志输出语句
- 重构上传成功回调逻辑，统一处理多文件上传
- 在所有文件上传完成后批量更新文件列表
- 修复替换模式下的文件更新问题
- 优化上传完成后的组件刷新逻辑
- 增强错误处理时的文件列表同步机制"
```

**示例 3: 复杂功能（包含所有部分）**

```bash
git commit -m "feat(ai): 添加智能内容审核和数据生成组件

## 功能说明

本次提交新增了两个 AI 辅助组件：

1. **智能内容审核组件 (AContentReview)**
   - 支持文本内容自动审核
   - 提供敏感词检测和替换建议
   - 集成反垃圾内容检测

2. **智能数据生成组件 (ADataGenerator)**
   - 支持根据模板生成测试数据
   - 提供多种数据类型生成器
   - 支持批量生成和导出

## 技术实现

- 使用 LangChain4j 集成 AI 能力
- 实现了统一的 AI 接口封装
- 添加了完整的类型定义和错误处理

## 影响范围

- 后端新增 AI 接口：/api/ai/review 和 /api/ai/generate
- 前端新增两个组件和相关类型定义
- 更新了 AI 服务的配置项

Refs: #789"
```

参考: ruoyi-plus-uniapp/.git/logs/HEAD:1f2ea345c

### 提交消息检查清单

在提交前，请检查以下事项：

**✅ 必须满足:**

- [ ] 包含正确的 type（feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert）
- [ ] 包含清晰的 subject（不超过 50 字符）
- [ ] subject 使用中文动词开头
- [ ] subject 结尾不加句号
- [ ] 提交消息准确描述了改动内容

**✅ 建议满足:**

- [ ] 包含合适的 scope（模块名称）
- [ ] 复杂改动包含 body 详细描述
- [ ] 关联相关 Issue（如果有）
- [ ] 破坏性变更添加 BREAKING CHANGE 说明

**❌ 禁止出现:**

- [ ] 使用英文描述（除非是专有名词）
- [ ] 描述模糊不清（如"修改代码"、"更新文件"）
- [ ] 提交消息过长（subject 超过 100 字符）
- [ ] 包含无关内容或调试信息

## 分支管理策略

### 主要分支

项目采用简化的分支管理策略，主要包含以下分支：

#### master (主分支)

**用途:** 生产环境分支，存储正式发布的代码

**特点:**

- 始终保持稳定可发布状态
- 所有提交都经过充分测试
- 直接对应生产环境版本
- 受保护分支，不允许直接推送

**命名:** `master`

**保护规则:**

1. 禁止直接推送代码
2. 合并前必须经过代码审查
3. 必须通过所有 CI 检查
4. 需要至少 1 人审核通过

**操作示例:**

```bash
# 禁止直接在 master 上开发
git checkout master           # ❌ 不要这样做
vim some-file.ts
git commit -m "fix: 修复问题"
git push origin master        # ❌ 会被拒绝

# 正确做法：从 master 创建功能分支
git checkout master
git pull origin master
git checkout -b feature/user-management
# 在功能分支上开发...
```

参考: ruoyi-plus-uniapp-docs/.git/logs/refs/heads/master

#### develop (开发分支)

**用途:** 开发环境分支，集成所有已完成的功能

**特点:**

- 包含最新的开发代码
- 对应开发/测试环境
- 相对稳定但可能包含未完全测试的功能
- 所有功能分支从此分支创建

**命名:** `develop`

**使用场景:**

1. 功能分支合并目标
2. 日常开发基准分支
3. 集成测试基础分支

**操作示例:**

```bash
# 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/payment-module

# 开发完成后合并回 develop
git checkout develop
git merge --no-ff feature/payment-module
git push origin develop
```

**注意:** 本项目当前使用 master 作为主分支，如需使用 develop 分支，需要在项目中创建并配置。

### 辅助分支

辅助分支用于特定目的的开发工作，使用完毕后应该删除。

#### feature (功能分支)

**用途:** 开发新功能

**命名规范:** `feature/<功能名称>`

**示例:**

```
feature/user-management      # 用户管理功能
feature/payment-alipay       # 支付宝支付功能
feature/ai-assistant         # AI 助手功能
feature/mobile-upload        # 移动端上传功能
```

**生命周期:**

```bash
# 1. 创建功能分支
git checkout master
git pull origin master
git checkout -b feature/user-management

# 2. 开发功能（多次提交）
git add .
git commit -m "feat(system): 添加用户列表页面"
git add .
git commit -m "feat(system): 添加用户编辑功能"

# 3. 合并到 master（通过 Pull Request）
git checkout master
git pull origin master
git merge --no-ff feature/user-management
git push origin master

# 4. 删除功能分支
git branch -d feature/user-management
git push origin --delete feature/user-management
```

**注意事项:**

1. 功能分支只存在于开发者本地，或者推送到远程进行协作
2. 功能开发期间，定期同步 master 最新代码
3. 功能完成后，通过 Pull Request 合并到 master
4. 合并后立即删除功能分支

#### bugfix (修复分支)

**用途:** 修复非紧急的 Bug

**命名规范:** `bugfix/<问题描述>`

**示例:**

```
bugfix/login-timeout         # 修复登录超时问题
bugfix/upload-error          # 修复上传错误
bugfix/query-performance     # 修复查询性能问题
```

**生命周期:**

```bash
# 1. 创建修复分支
git checkout master
git pull origin master
git checkout -b bugfix/login-timeout

# 2. 修复问题
git add .
git commit -m "fix(auth): 修复登录超时问题

- 增加超时重试机制
- 优化 Token 刷新逻辑
- 添加超时错误提示

Closes #123"

# 3. 合并到 master
git checkout master
git merge --no-ff bugfix/login-timeout
git push origin master

# 4. 删除修复分支
git branch -d bugfix/login-timeout
```

#### hotfix (热修复分支)

**用途:** 修复生产环境紧急 Bug

**命名规范:** `hotfix/<版本号>-<问题描述>`

**示例:**

```
hotfix/v1.0.1-login-crash    # v1.0.1 修复登录崩溃
hotfix/v2.1.3-data-loss      # v2.1.3 修复数据丢失
```

**生命周期:**

```bash
# 1. 从 master 创建热修复分支
git checkout master
git pull origin master
git checkout -b hotfix/v1.0.1-login-crash

# 2. 快速修复问题
git add .
git commit -m "fix(auth): 修复登录崩溃问题 [紧急]"

# 3. 合并到 master 并打标签
git checkout master
git merge --no-ff hotfix/v1.0.1-login-crash
git tag -a v1.0.1 -m "hotfix: 修复登录崩溃"
git push origin master --tags

# 4. 如果有 develop 分支，也需要合并
git checkout develop
git merge --no-ff hotfix/v1.0.1-login-crash
git push origin develop

# 5. 删除热修复分支
git branch -d hotfix/v1.0.1-login-crash
```

**注意事项:**

1. hotfix 是唯一可以从 master 创建的分支
2. 修复完成后必须同时合并到 master 和 develop
3. 合并到 master 后必须打版本标签
4. 热修复应该快速完成（通常 1-2 小时内）

#### release (发布分支)

**用途:** 准备新版本发布

**命名规范:** `release/<版本号>`

**示例:**

```
release/v1.0.0               # 1.0.0 版本发布
release/v2.1.0               # 2.1.0 版本发布
```

**生命周期:**

```bash
# 1. 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. 准备发布（修改版本号、更新文档等）
git add .
git commit -m "chore(release): 准备 v1.0.0 发布

- 更新版本号到 1.0.0
- 更新 CHANGELOG.md
- 更新依赖版本"

# 3. 测试验证...

# 4. 合并到 master 并打标签
git checkout master
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "release: v1.0.0"
git push origin master --tags

# 5. 合并到 develop
git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop

# 6. 删除发布分支
git branch -d release/v1.0.0
```

### 分支命名规范

**基本规则:**

1. **小写字母**: 分支名称全部使用小写字母
2. **连字符分隔**: 单词之间使用连字符 `-` 分隔
3. **类型前缀**: 使用类型前缀（feature/、bugfix/、hotfix/、release/）
4. **描述清晰**: 分支名称清楚描述分支用途
5. **简洁明了**: 不超过 30 个字符（中文约 15 个字）

**命名格式:**

```
<type>/<description>
<type>/<module>-<description>
<type>/v<version>-<description>
```

**示例对比:**

✅ **正确示例:**

```bash
feature/user-management          # 用户管理功能
feature/mobile-upload            # 移动端上传
bugfix/login-timeout             # 修复登录超时
hotfix/v1.0.1-crash              # v1.0.1 热修复
release/v2.0.0                   # 2.0.0 版本发布
docs/api-documentation           # API 文档
```

❌ **错误示例:**

```bash
Feature/UserManagement           # 使用了大写字母
feature_user_management          # 使用了下划线
user-management                  # 缺少类型前缀
feature/add-a-new-user-management-module-for-admin  # 名称过长
feature/修复用户管理              # 使用了中文
```

### 分支操作最佳实践

#### 创建分支

```bash
# 1. 确保本地 master 是最新的
git checkout master
git pull origin master

# 2. 创建并切换到新分支
git checkout -b feature/user-management

# 3. 推送分支到远程（如果需要协作）
git push -u origin feature/user-management
```

#### 同步主分支

在功能分支开发期间，定期同步主分支的最新代码：

```bash
# 方式1: 使用 merge
git checkout feature/user-management
git merge master

# 方式2: 使用 rebase（推荐）
git checkout feature/user-management
git rebase master
```

#### 删除分支

```bash
# 删除本地分支
git branch -d feature/user-management    # 已合并的分支
git branch -D feature/user-management    # 强制删除

# 删除远程分支
git push origin --delete feature/user-management
```

#### 查看分支

```bash
# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支
git branch -a

# 查看分支详细信息
git branch -vv
```

## 工作流程

### 日常开发流程

以下是标准的日常开发流程，适用于大多数功能开发场景：

**步骤 1: 获取最新代码**

```bash
# 切换到主分支
git checkout master

# 拉取最新代码
git pull origin master
```

**步骤 2: 创建功能分支**

```bash
# 创建并切换到功能分支
git checkout -b feature/user-management

# 或者分两步
git branch feature/user-management
git checkout feature/user-management
```

**步骤 3: 开发功能**

```bash
# 修改代码...

# 查看修改状态
git status

# 查看具体修改内容
git diff
```

**步骤 4: 提交代码**

```bash
# 添加修改的文件
git add src/views/user/index.vue
git add src/api/userApi.ts

# 或添加所有修改
git add .

# 提交代码
git commit -m "feat(system): 添加用户列表页面"
```

**步骤 5: 推送到远程**

```bash
# 首次推送，建立跟踪关系
git push -u origin feature/user-management

# 后续推送
git push
```

**步骤 6: 创建 Pull Request**

在 Git 托管平台（GitHub/GitLab/Gitee）上创建 Pull Request：

1. 访问仓库页面
2. 点击 "New Pull Request" 或 "新建合并请求"
3. 选择源分支: `feature/user-management`
4. 选择目标分支: `master`
5. 填写 PR 标题和描述
6. 指定审核人员
7. 提交 Pull Request

**步骤 7: 代码审查**

等待团队成员审查代码：

1. 审核人员查看代码改动
2. 提出修改意见或批准
3. 如有修改意见，继续在功能分支上修改并推送
4. 所有审核通过后，合并到主分支

**步骤 8: 合并代码**

```bash
# 切换到主分支
git checkout master

# 拉取最新代码
git pull origin master

# 合并功能分支（使用 --no-ff 保留分支历史）
git merge --no-ff feature/user-management

# 推送到远程
git push origin master
```

**步骤 9: 清理分支**

```bash
# 删除本地功能分支
git branch -d feature/user-management

# 删除远程功能分支
git push origin --delete feature/user-management
```

参考: ruoyi-plus-uniapp-docs/.git/logs/refs/heads/master

### 紧急修复流程

当生产环境出现紧急 Bug 时，使用以下流程快速修复：

**步骤 1: 创建热修复分支**

```bash
# 从 master 创建热修复分支
git checkout master
git pull origin master
git checkout -b hotfix/v1.0.1-login-crash
```

**步骤 2: 快速修复问题**

```bash
# 修改代码...

# 提交修复
git add .
git commit -m "fix(auth): 修复登录崩溃问题 [紧急]

- 修复空指针异常
- 添加空值检查
- 增强错误处理

Closes #789"
```

**步骤 3: 测试验证**

```bash
# 本地测试...
# 或推送到测试环境
git push -u origin hotfix/v1.0.1-login-crash
```

**步骤 4: 合并到 master**

```bash
# 切换到 master
git checkout master

# 合并热修复
git merge --no-ff hotfix/v1.0.1-login-crash

# 打版本标签
git tag -a v1.0.1 -m "hotfix: 修复登录崩溃"

# 推送到远程
git push origin master --tags
```

**步骤 5: 同步到开发分支**

```bash
# 如果有 develop 分支，也需要合并
git checkout develop
git merge --no-ff hotfix/v1.0.1-login-crash
git push origin develop
```

**步骤 6: 清理分支**

```bash
# 删除热修复分支
git branch -d hotfix/v1.0.1-login-crash
git push origin --delete hotfix/v1.0.1-login-crash
```

**注意事项:**

1. 热修复应在 1-2 小时内完成
2. 必须经过测试验证，不能引入新问题
3. 必须同时更新 master 和 develop 分支
4. 必须打版本标签，便于追溯

### 版本发布流程

当准备发布新版本时，使用以下流程：

**步骤 1: 创建发布分支**

```bash
# 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```

**步骤 2: 准备发布**

```bash
# 更新版本号
# 修改 package.json、pom.xml 等文件中的版本号

# 更新 CHANGELOG.md
# 添加本次版本的更新内容

# 提交准备工作
git add .
git commit -m "chore(release): 准备 v1.0.0 发布

- 更新版本号到 1.0.0
- 更新 CHANGELOG.md
- 更新依赖版本
- 更新文档"
```

**步骤 3: 测试验证**

```bash
# 推送到测试环境
git push -u origin release/v1.0.0

# 执行完整的测试流程
# - 单元测试
# - 集成测试
# - 功能测试
# - 性能测试

# 如果发现问题，在发布分支上修复
git add .
git commit -m "fix(release): 修复测试发现的问题"
```

**步骤 4: 合并到 master**

```bash
# 切换到 master
git checkout master
git pull origin master

# 合并发布分支
git merge --no-ff release/v1.0.0

# 打版本标签
git tag -a v1.0.0 -m "release: v1.0.0 正式版本

主要更新:
- 新增用户管理模块
- 新增支付功能
- 优化性能
- 修复若干 Bug

详细更新内容参见 CHANGELOG.md"

# 推送到远程
git push origin master --tags
```

**步骤 5: 同步到 develop**

```bash
# 切换到 develop
git checkout develop
git pull origin develop

# 合并发布分支
git merge --no-ff release/v1.0.0

# 推送到远程
git push origin develop
```

**步骤 6: 清理分支**

```bash
# 删除发布分支
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

**步骤 7: 部署上线**

```bash
# 根据项目的部署流程进行上线
# 例如：
# - 构建 Docker 镜像
# - 推送到镜像仓库
# - 更新 Kubernetes 配置
# - 执行滚动更新
```

### 协作开发流程

多人协作开发同一功能时，使用以下流程：

**场景:** 张三和李四共同开发用户管理功能

**张三的操作:**

```bash
# 1. 创建功能分支并推送到远程
git checkout -b feature/user-management
git push -u origin feature/user-management

# 2. 开发用户列表页面
git add .
git commit -m "feat(system): 添加用户列表页面"
git push

# 3. 通知李四可以开始开发
```

**李四的操作:**

```bash
# 1. 拉取功能分支
git fetch origin
git checkout feature/user-management

# 2. 开发用户编辑功能
git add .
git commit -m "feat(system): 添加用户编辑功能"

# 3. 推送前先拉取最新代码
git pull --rebase origin feature/user-management

# 4. 推送到远程
git push
```

**冲突处理:**

如果李四推送时发现有冲突：

```bash
# 1. 拉取最新代码
git pull --rebase origin feature/user-management

# 2. 解决冲突
# 编辑冲突文件，解决冲突标记

# 3. 标记冲突已解决
git add .

# 4. 继续 rebase
git rebase --continue

# 5. 推送到远程
git push
```

**最佳实践:**

1. 及时推送代码，避免累积大量修改
2. 推送前先拉取最新代码
3. 使用 `git pull --rebase` 保持历史记录清晰
4. 遇到冲突及时沟通解决
5. 大功能分解成多个小任务，减少冲突

## 合并策略

### Merge vs Rebase

Git 提供了两种主要的合并策略：Merge 和 Rebase，了解它们的区别和使用场景非常重要。

#### Merge (合并)

**原理:** 创建一个新的合并提交，保留所有分支的完整历史

**特点:**

- 保留完整的分支历史
- 历史记录呈树状结构
- 操作安全，不会改变已有提交
- 产生额外的合并提交

**使用场景:**

1. 合并功能分支到主分支
2. 合并公共分支（多人协作的分支）
3. 重要的版本合并（如 release 合并到 master）

**命令:**

```bash
# 普通合并
git merge feature/user-management

# 非快进合并（推荐，保留分支历史）
git merge --no-ff feature/user-management

# 合并时指定提交消息
git merge --no-ff -m "Merge feature/user-management" feature/user-management
```

**示例:**

```bash
# 场景：将功能分支合并到 master
git checkout master
git pull origin master
git merge --no-ff feature/user-management
git push origin master
```

**历史记录:**

```
* commit abc123 (HEAD -> master)  Merge branch 'feature/user-management'
|\
| * commit def456  feat(system): 添加用户编辑功能
| * commit ghi789  feat(system): 添加用户列表页面
|/
* commit jkl012  docs(mobile): 完善组件文档
```

#### Rebase (变基)

**原理:** 将当前分支的提交"移动"到目标分支的最新提交之后，重写历史记录

**特点:**

- 产生线性的历史记录
- 历史记录更清晰易读
- 会改变提交的 SHA 值
- 不产生额外的合并提交

**使用场景:**

1. 更新功能分支（同步主分支最新代码）
2. 整理本地提交历史（未推送的提交）
3. 保持历史记录线性清晰

**命令:**

```bash
# 变基到指定分支
git rebase master

# 交互式变基（整理提交历史）
git rebase -i HEAD~3

# 继续变基（解决冲突后）
git rebase --continue

# 放弃变基
git rebase --abort
```

**示例:**

```bash
# 场景：在功能分支上同步 master 最新代码
git checkout feature/user-management
git rebase master
```

**历史记录:**

```
* commit abc123 (HEAD -> feature/user-management)  feat(system): 添加用户编辑功能
* commit def456  feat(system): 添加用户列表页面
* commit ghi789 (master)  docs(mobile): 完善组件文档
* commit jkl012  fix(backend): 修复登录问题
```

#### Merge vs Rebase 对比

| 特性 | Merge | Rebase |
|------|-------|--------|
| 历史记录 | 保留完整分支历史 | 产生线性历史 |
| 提交记录 | 保持不变 | 重写提交（新 SHA） |
| 合并提交 | 产生合并提交 | 不产生合并提交 |
| 操作复杂度 | 简单 | 相对复杂 |
| 冲突处理 | 一次性解决 | 可能多次解决 |
| 使用场景 | 公共分支合并 | 私有分支同步 |
| 风险 | 低 | 中等（可能重写历史） |

#### 使用建议

**使用 Merge 的场景:**

✅ 合并功能分支到 master
✅ 合并 release 分支到 master
✅ 合并 hotfix 分支到 master
✅ 多人协作的分支合并
✅ 需要保留完整历史记录

**使用 Rebase 的场景:**

✅ 功能分支同步主分支
✅ 整理本地未推送的提交
✅ 保持提交历史线性清晰
✅ 私有分支的日常更新

**禁止 Rebase 的场景:**

❌ 已推送到远程的公共分支
❌ 多人协作的分支
❌ master 或 develop 等主要分支
❌ 已经合并到其他分支的提交

### Fast-Forward vs No-Fast-Forward

#### Fast-Forward (快进合并)

**原理:** 当目标分支没有新提交时，直接移动分支指针

**特点:**

- 不产生合并提交
- 历史记录完全线性
- 丢失分支信息

**示例:**

```bash
# 默认使用快进合并
git merge feature/user-management
```

**历史记录:**

```
* commit abc123 (HEAD -> master, feature/user-management)  feat(system): 添加用户编辑功能
* commit def456  feat(system): 添加用户列表页面
* commit ghi789  docs(mobile): 完善组件文档
```

#### No-Fast-Forward (非快进合并)

**原理:** 始终创建一个新的合并提交，即使可以快进

**特点:**

- 产生合并提交
- 保留分支信息
- 历史记录呈树状

**示例:**

```bash
# 强制创建合并提交
git merge --no-ff feature/user-management
```

**历史记录:**

```
*   commit abc123 (HEAD -> master)  Merge branch 'feature/user-management'
|\
| * commit def456 (feature/user-management)  feat(system): 添加用户编辑功能
| * commit ghi789  feat(system): 添加用户列表页面
|/
* commit jkl012  docs(mobile): 完善组件文档
```

#### 推荐使用 --no-ff

**原因:**

1. **保留分支历史**: 可以看出哪些提交属于同一个功能
2. **便于回滚**: 可以整体回滚一个功能的所有提交
3. **清晰的项目历史**: 能够区分功能开发和日常维护
4. **符合 Git Flow**: 标准 Git Flow 推荐使用 --no-ff

**配置默认使用 --no-ff:**

```bash
# 全局配置
git config --global merge.ff false

# 项目配置
git config merge.ff false

# 或者在 .gitconfig 中添加
[merge]
    ff = false
```

### Squash (压缩合并)

**原理:** 将多个提交压缩成一个提交后再合并

**特点:**

- 产生单个合并提交
- 简化历史记录
- 丢失详细的提交历史

**使用场景:**

1. 功能分支有大量临时提交
2. 想要简化历史记录
3. 提交消息质量较低

**命令:**

```bash
# 压缩合并
git merge --squash feature/user-management

# 需要手动提交
git commit -m "feat(system): 添加用户管理功能

- 添加用户列表页面
- 添加用户编辑功能
- 添加用户删除功能
- 完善用户权限控制"
```

**示例:**

```bash
# 场景：功能分支有 10 个提交，想要合并成 1 个
git checkout master
git merge --squash feature/user-management
git commit -m "feat(system): 添加用户管理功能"
git push origin master
```

**优缺点:**

✅ 优点:
- 历史记录非常简洁
- 易于理解和维护
- 减少噪音提交

❌ 缺点:
- 丢失详细的开发历史
- 无法追踪具体的修改过程
- 不适合需要保留完整历史的场景

### 合并策略最佳实践

**1. 功能分支合并到 master**

```bash
# 推荐：使用 --no-ff
git checkout master
git merge --no-ff feature/user-management
```

**2. 功能分支同步 master**

```bash
# 推荐：使用 rebase
git checkout feature/user-management
git rebase master
```

**3. 热修复合并**

```bash
# 推荐：使用 --no-ff
git checkout master
git merge --no-ff hotfix/v1.0.1-login-crash
```

**4. 发布分支合并**

```bash
# 推荐：使用 --no-ff
git checkout master
git merge --no-ff release/v1.0.0
```

**5. 协作分支更新**

```bash
# 推荐：使用 pull --rebase
git pull --rebase origin feature/user-management
```

## 标签管理

### 标签类型

Git 支持两种类型的标签：

#### 轻量标签 (Lightweight Tag)

**特点:**

- 只是一个指向特定提交的引用
- 不包含额外信息
- 类似于一个不会改变的分支

**创建:**

```bash
# 创建轻量标签
git tag v1.0.0

# 为特定提交创建轻量标签
git tag v1.0.0 abc123
```

#### 附注标签 (Annotated Tag)

**特点:**

- 包含标签创建者信息
- 包含标签创建时间
- 包含标签说明信息
- 可以用 GPG 签名

**创建:**

```bash
# 创建附注标签
git tag -a v1.0.0 -m "release: v1.0.0 正式版本"

# 为特定提交创建附注标签
git tag -a v1.0.0 abc123 -m "release: v1.0.0 正式版本"
```

**推荐:** 始终使用附注标签，因为它包含更多有用的信息。

### 标签命名规范

**版本号格式:** 采用语义化版本 (Semantic Versioning)

```
v<major>.<minor>.<patch>
```

**版本号说明:**

- **major (主版本号)**: 不兼容的 API 修改
- **minor (次版本号)**: 向下兼容的功能性新增
- **patch (修订号)**: 向下兼容的问题修正

**示例:**

```
v1.0.0      # 第一个正式版本
v1.1.0      # 新增功能，向下兼容
v1.1.1      # Bug 修复
v2.0.0      # 重大更新，可能不兼容
```

**预发布版本:**

```
v1.0.0-alpha.1      # Alpha 测试版本
v1.0.0-beta.1       # Beta 测试版本
v1.0.0-rc.1         # Release Candidate 候选版本
```

**其他标签:**

```
v1.0.0-hotfix.1     # 热修复版本
v1.0.0-snapshot     # 快照版本
```

### 标签操作

#### 创建标签

```bash
# 为当前提交创建标签
git tag -a v1.0.0 -m "release: v1.0.0 正式版本

主要更新:
- 新增用户管理模块
- 新增支付功能
- 优化性能
- 修复若干 Bug"

# 为指定提交创建标签
git tag -a v1.0.0 abc123 -m "release: v1.0.0 正式版本"
```

#### 推送标签

```bash
# 推送单个标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 推送代码和标签
git push origin master --tags
```

#### 查看标签

```bash
# 列出所有标签
git tag

# 列出符合模式的标签
git tag -l "v1.0.*"

# 查看标签详细信息
git show v1.0.0
```

#### 删除标签

```bash
# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin :refs/tags/v1.0.0
# 或
git push origin --delete v1.0.0
```

#### 检出标签

```bash
# 查看标签对应的代码（分离头指针状态）
git checkout v1.0.0

# 基于标签创建新分支
git checkout -b hotfix/v1.0.1 v1.0.0
```

### 标签使用场景

#### 1. 版本发布

每次正式发布版本时，都应该打标签：

```bash
# 发布 1.0.0 版本
git checkout master
git tag -a v1.0.0 -m "release: v1.0.0 正式版本"
git push origin master --tags
```

#### 2. 里程碑标记

重要的项目节点可以打标签：

```bash
# 项目初始化完成
git tag -a milestone-init -m "项目初始化完成"

# 核心功能完成
git tag -a milestone-core -m "核心功能开发完成"
```

#### 3. 热修复发布

热修复版本也需要打标签：

```bash
# 发布热修复版本
git checkout master
git tag -a v1.0.1 -m "hotfix: 修复登录崩溃问题"
git push origin master --tags
```

#### 4. 回滚到特定版本

通过标签快速回滚到历史版本：

```bash
# 创建基于 v1.0.0 的热修复分支
git checkout -b hotfix/v1.0.1 v1.0.0

# 回滚到 v1.0.0
git checkout v1.0.0
```

### 标签最佳实践

**1. 使用附注标签**

```bash
# ✅ 推荐
git tag -a v1.0.0 -m "release: v1.0.0 正式版本"

# ❌ 不推荐
git tag v1.0.0
```

**2. 标签信息要详细**

```bash
# ✅ 推荐
git tag -a v1.0.0 -m "release: v1.0.0 正式版本

主要更新:
- 新增用户管理模块
- 新增支付功能
- 优化查询性能 50%
- 修复登录超时问题
- 更新依赖到最新版本

详细更新内容参见 CHANGELOG.md"

# ❌ 不推荐
git tag -a v1.0.0 -m "v1.0.0"
```

**3. 及时推送标签**

```bash
# 创建标签后立即推送
git tag -a v1.0.0 -m "release: v1.0.0 正式版本"
git push origin v1.0.0
```

**4. 遵循语义化版本**

```bash
# 主版本号：不兼容的 API 修改
v1.0.0 -> v2.0.0

# 次版本号：向下兼容的功能新增
v1.0.0 -> v1.1.0

# 修订号：向下兼容的问题修正
v1.0.0 -> v1.0.1
```

**5. 不要修改已推送的标签**

```bash
# ❌ 不要这样做
git tag -f v1.0.0
git push -f origin v1.0.0

# ✅ 如果标签有误，删除后重新创建
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag -a v1.0.1 -m "正确的版本"
git push origin v1.0.1
```

## .gitignore 规范

### 基本规则

`.gitignore` 文件用于指定 Git 应该忽略的文件和目录，遵循以下规则：

**语法规则:**

1. **空行**: 不匹配任何文件，用于增加可读性
2. **注释**: 以 `#` 开头的行是注释
3. **标准模式**: 使用标准的 glob 模式匹配
4. **目录**: 以 `/` 结尾表示目录
5. **取反**: 以 `!` 开头表示不忽略（白名单）
6. **根目录**: 以 `/` 开头表示项目根目录

**模式匹配:**

```gitignore
# 忽略所有 .log 文件
*.log

# 忽略 node_modules 目录
node_modules/

# 忽略根目录下的 temp 目录
/temp/

# 忽略所有目录下的 .env 文件
**/.env

# 不忽略 .gitkeep 文件
!.gitkeep

# 忽略 build 目录下的所有文件
build/**
```

### 项目 .gitignore

项目的 `.gitignore` 文件应该包含以下内容：

#### 文档项目 .gitignore

```gitignore
# 日志文件
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# 依赖目录
node_modules

# 系统文件
.DS_Store

# 构建产物
dist
*.local

# 编辑器配置
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.hbuilderx

# 缓存文件
.stylelintcache
.eslintcache

# VitePress 构建
docs/.vitepress/dist
docs/.vitepress/cache

# 锁文件（可选）
pnpm-lock.yaml
```

参考: ruoyi-plus-uniapp-docs/.gitignore

#### 后端项目 .gitignore

```gitignore
# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# Gradle
.gradle
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

# IntelliJ IDEA
.idea/
*.iws
*.iml
*.ipr
out/

# Eclipse
.classpath
.project
.settings/
bin/
tmp/

# VS Code
.vscode/
*.code-workspace

# 日志文件
logs/
*.log

# 临时文件
*.tmp
*.bak
*.swp
*~.nib

# 系统文件
.DS_Store
Thumbs.db

# 配置文件（包含敏感信息）
application-local.yml
application-dev.yml
!application-dev.yml.example
```

#### 前端项目 .gitignore

```gitignore
# 依赖
node_modules/
.pnp
.pnp.js

# 测试
coverage/

# 生产构建
dist/
dist-ssr/
build/

# 编辑器
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# 系统文件
.DS_Store
Thumbs.db

# 临时文件
*.tmp
.temp/

# 缓存
.eslintcache
.stylelintcache
.cache/

# 调试
.vite-inspect/
```

#### 移动端项目 .gitignore

```gitignore
# UniApp
unpackage/
.hbuilderx/

# 依赖
node_modules/

# 构建产物
dist/
dist-build/

# 编辑器
.idea/
.vscode/
*.sw?

# 环境变量
.env
.env.local
.env.development
.env.production

# 日志
logs/
*.log

# 系统文件
.DS_Store
Thumbs.db

# 临时文件
*.tmp
.temp/

# 缓存
.cache/
.eslintcache
```

### .gitignore 最佳实践

**1. 分层管理**

```gitignore
# ============================================
# 依赖和包管理
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

# ============================================
# 环境配置
# ============================================
.env
.env.local

# ============================================
# 日志文件
# ============================================
logs/
*.log

# ============================================
# 系统文件
# ============================================
.DS_Store
Thumbs.db
```

**2. 使用注释**

```gitignore
# 忽略所有日志文件，但保留日志目录
logs/*
!logs/.gitkeep

# 忽略配置文件，但保留示例
config/local.yml
!config/local.yml.example
```

**3. 全局 .gitignore**

设置全局 `.gitignore` 文件，忽略所有项目都需要忽略的文件：

```bash
# 创建全局 .gitignore
touch ~/.gitignore_global

# 配置 Git 使用全局 .gitignore
git config --global core.excludesfile ~/.gitignore_global
```

**全局 .gitignore 内容:**

```gitignore
# 操作系统
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# 编辑器
.vscode/
.idea/
*.swp
*.swo
*~
.project
.settings/

# 临时文件
*.tmp
*.bak
```

**4. 检查忽略规则**

```bash
# 检查某个文件是否被忽略
git check-ignore -v filename

# 列出所有被忽略的文件
git status --ignored
```

**5. 清理已提交的忽略文件**

```bash
# 从 Git 仓库中删除，但保留本地文件
git rm --cached filename

# 删除整个目录
git rm -r --cached directory/

# 提交删除
git commit -m "chore: 从仓库移除不应提交的文件"
```

## Git Hooks

### 什么是 Git Hooks

Git Hooks 是 Git 在特定事件发生时自动执行的脚本，用于自动化工作流程和强制执行规范。

**Hook 类型:**

| Hook | 触发时机 | 使用场景 |
|------|----------|----------|
| `pre-commit` | 提交前 | 代码检查、格式化 |
| `prepare-commit-msg` | 准备提交消息 | 自动生成提交模板 |
| `commit-msg` | 提交消息完成后 | 验证提交消息格式 |
| `post-commit` | 提交完成后 | 通知、统计 |
| `pre-push` | 推送前 | 运行测试、检查 |
| `post-receive` | 接收推送后 | 自动部署 |

### 常用 Hooks

#### pre-commit

**用途:** 在提交前执行代码检查和格式化

**安装 Husky:**

```bash
# 安装 Husky
pnpm install -D husky

# 初始化 Husky
npx husky init

# 创建 pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

**pre-commit 脚本:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running pre-commit checks..."

# 运行 ESLint
npm run lint

# 运行类型检查
npm run type-check

# 运行测试
npm run test

echo "Pre-commit checks passed!"
```

#### commit-msg

**用途:** 验证提交消息格式

**安装 commitlint:**

```bash
# 安装 commitlint
pnpm install -D @commitlint/cli @commitlint/config-conventional

# 创建配置文件
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# 创建 commit-msg hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
```

**commitlint 配置:**

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能
        'test',     // 测试
        'build',    // 构建
        'ci',       // CI
        'chore',    // 其他
        'revert'    // 回滚
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 100],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.']
  }
}
```

#### pre-push

**用途:** 在推送前运行测试

**pre-push 脚本:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running pre-push checks..."

# 运行测试套件
npm run test

# 运行构建检查
npm run build

echo "Pre-push checks passed!"
```

### lint-staged

**用途:** 只对暂存区的文件运行检查，提高效率

**安装:**

```bash
# 安装 lint-staged
pnpm install -D lint-staged

# 在 package.json 中配置
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.md": [
      "prettier --write"
    ]
  }
}

# 更新 pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### Hooks 最佳实践

**1. 保持 Hooks 快速**

```bash
# ✅ 推荐：只检查暂存区文件
npx lint-staged

# ❌ 不推荐：检查所有文件
npm run lint
```

**2. 提供跳过选项**

```bash
# 允许在紧急情况下跳过 hooks
git commit --no-verify -m "fix: 紧急修复"
```

**3. 友好的错误提示**

```bash
#!/bin/sh
echo "🔍 Running pre-commit checks..."

if ! npm run lint; then
  echo "❌ ESLint failed. Please fix the errors and try again."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
```

**4. 团队共享配置**

将 Hooks 配置提交到仓库，确保团队成员使用相同的规范：

```bash
# .husky/ 目录应该被提交到仓库
git add .husky/
git commit -m "chore: 添加 Git Hooks 配置"
```

## 冲突处理

### 冲突产生原因

当多人修改同一文件的相同位置时，Git 无法自动合并，就会产生冲突。

**常见场景:**

1. 多人同时修改同一行代码
2. 一人修改，一人删除同一文件
3. 二进制文件被多人修改

### 识别冲突

**冲突标记:**

```
<<<<<<< HEAD
// 当前分支的代码
const name = '张三'
=======
// 要合并的分支的代码
const name = '李四'
>>>>>>> feature/user-management
```

**标记说明:**

- `<<<<<<< HEAD`: 当前分支的代码开始
- `=======`: 分隔符
- `>>>>>>> branch-name`: 要合并的分支的代码结束

### 解决冲突

#### 手动解决

**步骤 1: 识别冲突文件**

```bash
# 查看冲突文件
git status

# 输出示例:
# Unmerged paths:
#   (use "git add <file>..." to mark resolution)
#         both modified:   src/views/user/index.vue
```

**步骤 2: 编辑冲突文件**

打开冲突文件，手动选择或合并代码：

```vue
<!-- 冲突前 -->
<<<<<<< HEAD
<template>
  <div>用户管理 - 张三版本</div>
</template>
=======
<template>
  <div>用户管理 - 李四版本</div>
</template>
>>>>>>> feature/user-management

<!-- 解决后 -->
<template>
  <div>用户管理</div>
</template>
```

**步骤 3: 标记冲突已解决**

```bash
# 添加已解决的文件
git add src/views/user/index.vue

# 查看状态
git status
```

**步骤 4: 完成合并**

```bash
# 如果是 merge 产生的冲突
git commit -m "Merge branch 'feature/user-management'"

# 如果是 rebase 产生的冲突
git rebase --continue
```

#### 使用工具解决

**VS Code:**

1. 打开冲突文件
2. 点击"Accept Current Change"（接受当前更改）
3. 或点击"Accept Incoming Change"（接受传入更改）
4. 或点击"Accept Both Changes"（接受双方更改）
5. 或手动编辑代码

**Git 工具:**

```bash
# 使用 Git 自带的合并工具
git mergetool

# 使用第三方工具（如 Beyond Compare）
git config --global merge.tool bc3
git mergetool
```

### 冲突处理策略

#### 1. 保留当前分支

```bash
# 保留当前分支的所有更改
git checkout --ours <file>
git add <file>
git commit
```

#### 2. 保留传入分支

```bash
# 保留传入分支的所有更改
git checkout --theirs <file>
git add <file>
git commit
```

#### 3. 手动合并

```bash
# 手动编辑文件，合并双方更改
vim <file>
git add <file>
git commit
```

#### 4. 放弃合并

```bash
# 放弃当前合并
git merge --abort

# 或放弃 rebase
git rebase --abort
```

### 预防冲突

**1. 及时同步代码**

```bash
# 每天开始工作前，先拉取最新代码
git checkout master
git pull origin master
git checkout feature/user-management
git rebase master
```

**2. 小步提交**

```bash
# 频繁提交小的改动，减少冲突范围
git add src/views/user/list.vue
git commit -m "feat(system): 添加用户列表表格"

git add src/views/user/edit.vue
git commit -m "feat(system): 添加用户编辑表单"
```

**3. 功能模块化**

```bash
# 不同功能在不同文件中实现
feature/user-list       # 只修改 list.vue
feature/user-edit       # 只修改 edit.vue
```

**4. 沟通协作**

- 提前沟通，避免同时修改同一文件
- 使用代码审查，及时发现潜在冲突
- 重要功能由一人负责

### 复杂冲突处理

#### 大量冲突

```bash
# 如果冲突太多，考虑放弃合并，重新规划
git merge --abort

# 或者使用 rebase 逐个处理
git rebase -i master
```

#### 二进制文件冲突

```bash
# 二进制文件无法自动合并，只能选择一个版本
# 保留当前版本
git checkout --ours binary-file.png

# 或保留传入版本
git checkout --theirs binary-file.png

# 添加并继续
git add binary-file.png
git rebase --continue
```

#### 删除文件冲突

```bash
# 一方修改，一方删除
# 如果要保留文件
git add <file>

# 如果要删除文件
git rm <file>

# 继续合并
git commit
```

## 常见问题

### 1. 提交了错误的代码怎么办?

**场景:** 刚刚提交了代码，发现有错误或遗漏

**解决方案:**

```bash
# 方式1: 修改最后一次提交（未推送）
git add forgotten-file.ts
git commit --amend --no-edit

# 方式2: 修改提交消息
git commit --amend -m "fix(auth): 修复登录问题（更正后的消息）"

# 方式3: 回滚最后一次提交，保留更改
git reset --soft HEAD~1
# 修改代码...
git add .
git commit -m "正确的提交消息"

# 方式4: 回滚最后一次提交，丢弃更改
git reset --hard HEAD~1
```

**注意:** `--amend` 会修改提交历史，不要修改已推送的提交。

参考: .git/logs/refs/heads/master

### 2. 推送被拒绝怎么办?

**场景:** 执行 `git push` 时提示 "Updates were rejected"

**原因:** 远程分支有新的提交，本地分支落后

**解决方案:**

```bash
# 方式1: 先拉取再推送
git pull origin master
git push origin master

# 方式2: 使用 rebase 保持历史清晰
git pull --rebase origin master
git push origin master

# 方式3: 强制推送（谨慎使用）
git push -f origin master  # ⚠️ 危险操作
```

**注意:** 不要在公共分支上使用 `git push -f`。

### 3. 如何回滚到之前的版本?

**场景:** 需要回滚到某个历史版本

**解决方案:**

```bash
# 查看提交历史
git log --oneline

# 方式1: 重置到指定提交（丢弃之后的提交）
git reset --hard abc123

# 方式2: 创建反向提交（推荐）
git revert abc123

# 方式3: 重置到指定标签
git reset --hard v1.0.0
```

**reset vs revert:**

- `reset`: 丢弃历史提交，重写历史
- `revert`: 创建新提交来撤销，保留历史

### 4. 误删分支如何恢复?

**场景:** 不小心删除了重要分支

**解决方案:**

```bash
# 查看所有操作历史
git reflog

# 找到分支被删除前的最后一次提交
# 输出示例:
# abc123 HEAD@{0}: checkout: moving from feature/user-management to master
# def456 HEAD@{1}: commit: feat(system): 添加用户编辑功能

# 恢复分支
git checkout -b feature/user-management def456
```

### 5. 如何合并多个提交?

**场景:** 功能分支有太多琐碎的提交，想要合并成一个

**解决方案:**

```bash
# 交互式 rebase
git rebase -i HEAD~5

# 在编辑器中，将要合并的提交标记为 squash 或 s
# pick abc123 feat(system): 添加用户列表
# squash def456 fix(system): 修复样式问题
# squash ghi789 fix(system): 修复拼写错误

# 保存并编辑合并后的提交消息
```

**注意:** 只能合并未推送的提交。

### 6. 如何暂存当前工作?

**场景:** 需要紧急切换分支，但当前工作还没完成

**解决方案:**

```bash
# 暂存当前工作
git stash save "工作进行中：用户管理功能"

# 查看暂存列表
git stash list

# 恢复暂存
git stash pop

# 或应用指定暂存
git stash apply stash@{0}

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear
```

### 7. 如何查看文件的修改历史?

**场景:** 想知道某个文件是何时、为什么被修改的

**解决方案:**

```bash
# 查看文件的提交历史
git log -- src/views/user/index.vue

# 查看文件的修改内容
git log -p -- src/views/user/index.vue

# 查看文件的每一行是谁修改的
git blame src/views/user/index.vue

# 查看某一行的修改历史
git log -L 100,110:src/views/user/index.vue
```

### 8. 如何处理 large file 警告?

**场景:** 推送时提示文件过大

**解决方案:**

```bash
# 方式1: 从历史中移除大文件
git filter-branch --tree-filter 'rm -f large-file.zip' HEAD

# 方式2: 使用 BFG Repo-Cleaner
bfg --delete-files large-file.zip
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 方式3: 使用 Git LFS
git lfs install
git lfs track "*.zip"
git add .gitattributes
git add large-file.zip
git commit -m "chore: 使用 Git LFS 管理大文件"
```

### 9. 如何修改历史提交?

**场景:** 发现历史提交中有敏感信息或错误

**解决方案:**

```bash
# 交互式 rebase
git rebase -i HEAD~5

# 在编辑器中，将要修改的提交标记为 edit
# edit abc123 feat(system): 添加用户管理
# pick def456 fix(system): 修复问题

# 修改代码...
git add .
git commit --amend --no-edit
git rebase --continue
```

**注意:** 修改历史会改变提交 SHA，不要修改已推送的公共分支。

### 10. 如何统计代码贡献?

**场景:** 想统计团队成员的代码贡献

**解决方案:**

```bash
# 统计所有人的提交次数
git shortlog -s -n

# 统计某人的提交次数
git log --author="张三" --oneline | wc -l

# 统计某人的代码行数
git log --author="张三" --pretty=tformat: --numstat | \
  awk '{ add += $1; subs += $2; loc += $1 - $2 } \
  END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }'

# 统计某段时间的提交
git log --since="2025-01-01" --until="2025-12-31" --oneline | wc -l
```

## 实用技巧

### 1. 配置别名

简化常用命令，提高效率：

```bash
# 配置别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# 使用别名
git co master
git br -a
git ci -m "提交消息"
git st
git lg
```

### 2. 美化日志输出

```bash
# 图形化显示分支历史
git log --graph --oneline --all

# 详细的图形化历史
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative

# 显示文件变更统计
git log --stat

# 显示每次提交的差异
git log -p

# 搜索提交消息
git log --grep="用户管理"

# 搜索代码变更
git log -S"function_name"
```

### 3. 快速修复

```bash
# 快速修复最后一次提交
git add forgotten-file.ts
git commit --amend --no-edit

# 快速修复提交消息
git commit --amend -m "新的提交消息"

# 快速放弃所有未提交的更改
git reset --hard HEAD

# 快速放弃某个文件的更改
git checkout -- filename

# 快速删除所有未跟踪的文件
git clean -fd
```

### 4. 批量操作

```bash
# 批量删除已合并的分支
git branch --merged master | grep -v "\* master" | xargs -n 1 git branch -d

# 批量删除远程已删除的本地跟踪分支
git remote prune origin

# 批量修改提交作者
git filter-branch --env-filter '
if [ "$GIT_COMMITTER_EMAIL" = "old@example.com" ]; then
    export GIT_COMMITTER_NAME="新名字"
    export GIT_COMMITTER_EMAIL="new@example.com"
fi
if [ "$GIT_AUTHOR_EMAIL" = "old@example.com" ]; then
    export GIT_AUTHOR_NAME="新名字"
    export GIT_AUTHOR_EMAIL="new@example.com"
fi
' --tag-name-filter cat -- --branches --tags
```

### 5. 高效查找

```bash
# 查找引入 Bug 的提交（二分查找）
git bisect start
git bisect bad                 # 标记当前提交有问题
git bisect good v1.0.0        # 标记某个版本是好的
# Git 会自动切换到中间的提交，测试后标记 good 或 bad
git bisect good/bad
# 重复直到找到问题提交
git bisect reset              # 结束查找

# 查找文件来源
git log --follow -- filename

# 查找删除的文件
git log --diff-filter=D --summary | grep delete
```

### 6. 性能优化

```bash
# 清理不必要的文件和优化仓库
git gc --aggressive --prune=now

# 查看仓库大小
git count-objects -vH

# 查找大文件
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -n 10

# 压缩历史
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 7. 安全操作

```bash
# 查看将要推送的内容
git push --dry-run

# 查看将要拉取的内容
git fetch --dry-run

# 安全的强制推送（确保不会覆盖他人的提交）
git push --force-with-lease

# 备份当前分支
git branch backup-master master

# 恢复误删的提交
git reflog
git cherry-pick <commit-hash>
```

## 工具推荐

### 图形化工具

**1. GitKraken**
- 功能强大的跨平台 Git 客户端
- 美观的界面和可视化历史
- 支持 Git Flow 工作流
- 官网: https://www.gitkraken.com/

**2. Sourcetree**
- Atlassian 出品的免费 Git 客户端
- 支持 Windows 和 macOS
- 集成 Git Flow
- 官网: https://www.sourcetreeapp.com/

**3. GitHub Desktop**
- GitHub 官方客户端
- 简单易用，适合新手
- 与 GitHub 深度集成
- 官网: https://desktop.github.com/

**4. TortoiseGit**
- Windows 资源管理器集成
- 类似 TortoiseSVN
- 适合习惯 SVN 的用户
- 官网: https://tortoisegit.org/

### 命令行工具

**1. lazygit**
- 终端下的简单 Git 客户端
- 键盘操作，效率高
- 官网: https://github.com/jesseduffield/lazygit

**2. tig**
- 基于 ncurses 的文本界面
- 强大的浏览和查询功能
- 官网: https://jonas.github.io/tig/

**3. git-extras**
- Git 命令增强工具集
- 提供额外的实用命令
- 官网: https://github.com/tj/git-extras

### VS Code 插件

**1. GitLens**
- 强大的 Git 可视化工具
- 显示代码作者和修改历史
- 支持比较和搜索

**2. Git Graph**
- 可视化 Git 分支图
- 方便查看和管理分支

**3. Git History**
- 查看文件历史
- 比较不同版本

## 最佳实践总结

### 提交规范

✅ **推荐做法:**

1. 使用 Conventional Commits 规范
2. 提交消息清晰描述改动内容
3. 一次提交只做一件事
4. 提交前进行代码检查
5. 及时推送代码

❌ **禁止做法:**

1. 提交消息模糊不清
2. 一次提交包含多个不相关的改动
3. 提交未经测试的代码
4. 提交敏感信息（密码、密钥等）
5. 直接在主分支上开发

### 分支管理

✅ **推荐做法:**

1. 使用 feature 分支开发新功能
2. 定期同步主分支代码
3. 功能完成后及时合并和删除分支
4. 使用 --no-ff 合并保留分支历史
5. 热修复使用 hotfix 分支

❌ **禁止做法:**

1. 在主分支上直接开发
2. 长期不合并的功能分支
3. 分支命名不规范
4. 删除未合并的功能分支
5. 在公共分支上使用 rebase

### 代码审查

✅ **推荐做法:**

1. 所有代码都经过 Pull Request
2. 至少一人审核通过才能合并
3. 审查时关注代码质量和规范
4. 提供建设性的反馈意见
5. 及时响应审查请求

❌ **禁止做法:**

1. 未经审查直接合并代码
2. 形式化审查，不认真看代码
3. 提出过于苛刻的要求
4. 长时间不响应审查请求
5. 自己审查自己的代码

### 冲突处理

✅ **推荐做法:**

1. 及时同步主分支代码
2. 小步提交，减少冲突范围
3. 遇到冲突及时沟通解决
4. 冲突解决后充分测试
5. 使用工具辅助处理复杂冲突

❌ **禁止做法:**

1. 长期不同步代码
2. 累积大量改动再提交
3. 遇到冲突就放弃合并
4. 随意选择冲突解决策略
5. 冲突解决后不测试

## 学习资源

### 官方文档

- **Git 官方文档**: https://git-scm.com/doc
- **Git 官方教程**: https://git-scm.com/book/zh/v2
- **GitHub 文档**: https://docs.github.com/
- **GitLab 文档**: https://docs.gitlab.com/

### 在线教程

- **Learn Git Branching**: https://learngitbranching.js.org/?locale=zh_CN
- **Git 简明指南**: https://rogerdudler.github.io/git-guide/index.zh.html
- **廖雪峰 Git 教程**: https://www.liaoxuefeng.com/wiki/896043488029600

### 速查表

- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Conventional Commits**: https://www.conventionalcommits.org/zh-hans/

### 进阶阅读

- 《Pro Git》（中文版）: https://git-scm.com/book/zh/v2
- 《Git 权威指南》
- 《Git 团队协作》

## 总结

本文档详细介绍了 RuoYi-Plus-UniApp 项目的 Git 使用规范，包括：

1. **Commit Message 规范** - 采用 Conventional Commits，包含 type、scope、subject 等部分
2. **分支管理策略** - 主分支 master，辅助分支 feature/bugfix/hotfix/release
3. **工作流程** - 日常开发、紧急修复、版本发布、协作开发的标准流程
4. **合并策略** - Merge vs Rebase，Fast-Forward vs No-Fast-Forward
5. **标签管理** - 语义化版本，附注标签的使用
6. **.gitignore 规范** - 各类型项目的忽略规则
7. **Git Hooks** - pre-commit、commit-msg、pre-push 等自动化检查
8. **冲突处理** - 识别冲突、解决冲突、预防冲突的方法
9. **常见问题** - 10 个常见问题的解决方案
10. **实用技巧** - 别名配置、日志美化、批量操作等高效技巧

遵循这些规范，可以：

- ✅ 提高团队协作效率
- ✅ 保证代码质量
- ✅ 简化版本管理
- ✅ 减少错误和冲突
- ✅ 便于问题追溯

**记住**: Git 规范不是束缚，而是帮助团队更好地协作和交付高质量代码的工具。

---

**参考资料:**

- Git 官方文档: https://git-scm.com/doc
- Conventional Commits: https://www.conventionalcommits.org/
- Git Flow: https://nvie.com/posts/a-successful-git-branching-model/
- Semantic Versioning: https://semver.org/

**文档维护:**

- 创建时间: 2025-11-01
- 最后更新: 2025-11-01
- 维护者: RuoYi-Plus-UniApp 开发团队
- 联系方式: 770492966 (微信/QQ)

---

*本文档将持续更新和完善，欢迎提出建议和改进意见。*
