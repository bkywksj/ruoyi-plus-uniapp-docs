---
name: deploy
description: 一键部署文档站点到腾讯云EdgeOne。当用户说"开始部署"、"部署"、"发布"时使用此技能。自动检查代码提交状态、群二维码更新、推送到Gitee和GitHub、构建并部署。
argument-hint: "[--skip-qr] 跳过二维码检查"
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent, AskUserQuestion
---

# 一键部署技能

你是部署助手，负责执行完整的文档站点部署流程。严格按以下步骤顺序执行，任何步骤失败时停止并报告。

## 参数说明

- `$ARGUMENTS` 支持以下参数：
  - 无参数：执行完整部署流程
  - `--skip-qr`：跳过群二维码检查

## 部署流程

### 第一步：检查群二维码是否最新

除非传入了 `--skip-qr` 参数，否则必须执行此检查：

1. 检查 `docs/public/wxq.jpg` 的最后修改时间：
   ```bash
   stat -c %Y docs/public/wxq.jpg 2>/dev/null || stat -f %m docs/public/wxq.jpg
   ```

2. 获取今天的日期起始时间戳，比较文件修改日期是否为今天。

3. 判断逻辑（使用Bash工具执行）：
   ```bash
   cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs"
   file_date=$(date -r docs/public/wxq.jpg +%Y-%m-%d 2>/dev/null || stat -c %y docs/public/wxq.jpg | cut -d' ' -f1)
   today=$(date +%Y-%m-%d)
   if [ "$file_date" != "$today" ]; then
     echo "NOT_TODAY|$file_date"
   else
     echo "TODAY|$file_date"
   fi
   ```

4. 如果不是今天修改的：
   - 使用 AskUserQuestion 工具提示用户：
     > ⚠️ 群二维码 `docs/public/wxq.jpg` 最后修改日期为 {file_date}，不是今天。请确认是否需要更新最新的群二维码？
     > - 输入 `y` 或 `继续`：跳过检查，继续部署
     > - 输入 `n` 或 `取消`：中止部署，请先更新二维码后再次执行部署
   - 如果用户选择取消，终止流程并输出提示

5. 如果是今天修改的，输出：`✅ 群二维码已是最新 (${file_date})`

### 第二步：检查代码提交状态

1. 检查工作区状态：
   ```bash
   cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && git status --porcelain
   ```

2. 如果有未提交的更改：
   a. 输出变更文件列表
   b. 查看最近的提交记录以匹配提交风格：
      ```bash
      git log --oneline -5
      ```
   c. 暂存所有变更（排除敏感文件）：
      ```bash
      git add -A
      ```
   d. 根据变更内容自动生成提交信息，格式遵循项目规范：
      ```bash
      git commit -m "$(cat <<'EOF'
      <type>(<scope>): <subject>

      Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
      EOF
      )"
      ```
   e. 输出：`✅ 代码已提交`

3. 如果没有未提交的更改：
   - 输出：`✅ 工作区干净，无需提交`

### 第三步：推送到远程仓库

1. 推送到 Gitee（origin）：
   ```bash
   cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && git push origin master
   ```
   - 成功：输出 `✅ 已推送到 Gitee`
   - 失败：输出错误信息，询问用户是否继续

2. 推送到 GitHub：
   ```bash
   cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && git push github master
   ```
   - 成功：输出 `✅ 已推送到 GitHub`
   - 失败：输出错误信息，询问用户是否继续

### 第四步：构建项目

1. 执行构建命令：
   ```bash
   cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && pnpm run build
   ```

2. 检查构建结果：
   - 构建成功：输出 `✅ 项目构建完成`
   - 构建失败：输出错误日志，终止流程

### 第五步：部署到腾讯云EdgeOne

1. 执行部署命令：
   ```bash
   cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && pnpm run deploy
   ```

2. 检查部署结果：
   - 部署成功：输出 `✅ 已部署到腾讯云EdgeOne`
   - 部署失败：输出错误信息

### 第六步：输出部署报告

输出完整的部署报告：

```markdown
## 🚀 部署完成

| 步骤 | 状态 |
|------|------|
| 群二维码检查 | ✅/⚠️ |
| 代码提交 | ✅ 已提交 / ✅ 无需提交 |
| 推送到 Gitee | ✅/❌ |
| 推送到 GitHub | ✅/❌ |
| 项目构建 | ✅ |
| EdgeOne部署 | ✅ |

**部署时间**: <当前时间>
```

## 注意事项

1. **提交信息规范**：遵循项目的 `<type>(<scope>): <subject>` 格式
2. **错误处理**：构建失败时必须终止，不要继续部署
3. **推送失败**：单个远程仓库推送失败不影响另一个，但需要报告
4. **超时设置**：构建命令设置 5 分钟超时，部署命令设置 3 分钟超时
