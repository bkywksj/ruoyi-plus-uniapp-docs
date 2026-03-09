# Claude Code Hooks 钩子机制

## 什么是 Hooks？

Hooks（钩子）是 Claude Code 的自动化机制，允许你在工具执行的特定时刻自动运行脚本或提示。通过 Hooks，你可以实现工作流自动化、输入验证、行为监控等高级功能。

### 核心价值

| 场景 | 无 Hooks | 有 Hooks |
|------|---------|---------|
| 危险命令防护 | 每次手动检查 | 自动拦截并警告 |
| 代码提交前检查 | 容易遗忘 | 自动触发检查 |
| 操作日志记录 | 手动记录 | 自动记录所有操作 |
| 输出后处理 | 手动处理 | 自动执行后续流程 |

---

## Hook 事件类型

| 事件类型 | 触发时刻 | 典型用途 |
|---------|---------|---------|
| **PreToolUse** | 工具执行前 | 验证参数、拦截危险操作、修改输入（推荐超时5s） |
| **PostToolUse** | 工具执行完成后 | 处理输出、记录日志、触发后续操作 |
| **UserPromptSubmit** | 用户提交提示时 | 验证提示、预处理输入、技能评估注入 |
| **PermissionRequest** | 请求工具权限时 | 自动批准/拒绝权限请求 |
| **Stop** | Claude 完成响应时 | 清理资源、生成报告、播放提示音（推荐超时10s） |
| **SubagentStop** | 子代理完成时 | 处理子代理结果 |
| **SessionEnd** | 会话终止时 | 最终清理、日志记录 |

---

## 配置位置

Hooks 在 Claude Code 的设置文件中配置：

| 作用域 | 配置文件 | 说明 |
|--------|--------|------|
| **项目级** | `.claude/settings.json` | 仅当前项目生效 |
| **用户全局** | `~/.claude/settings.json` | 所有项目通用 |

---

## 配置格式

### 基本结构

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "工具匹配模式",
        "hooks": [
          {
            "type": "command",
            "command": "要执行的命令",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "工具匹配模式",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "LLM 提示内容",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

### Matcher 匹配模式

Matcher 用于指定哪些工具触发 Hook：

| 模式 | 说明 | 示例 |
|------|------|------|
| `"*"` | 匹配所有工具 | 全局监控 |
| `"Bash"` | 精确匹配工具名 | 只匹配 Bash 工具 |
| `"Bash(*)"` | 匹配工具的所有命令 | Bash 的所有命令 |
| `"Bash(npm*)"` | 匹配特定命令模式 | npm 开头的命令 |
| `"Bash(rm -rf*)"` | 匹配危险命令 | 删除命令 |
| `"Read"` | 文件读取工具 | 监控文件读取 |
| `"Write"` | 文件写入工具 | 监控文件写入 |
| `"Grep"` | 搜索工具 | 监控代码搜索 |

### Hook 类型

#### 1. Command 类型

执行 Shell 命令：

```json
{
  "type": "command",
  "command": "echo '执行了 Bash 命令' >> ~/.claude/audit.log",
  "timeout": 30
}
```

#### 2. Prompt 类型

调用 LLM 进行验证或处理：

```json
{
  "type": "prompt",
  "prompt": "请检查这个操作是否安全，如果有风险请说明",
  "timeout": 60
}
```

---

## 环境变量

Hook 脚本可以访问以下环境变量：

| 变量 | 说明 | 可用阶段 |
|------|------|---------|
| `$CLAUDE_PROJECT_DIR` | 项目根目录绝对路径 | 所有阶段 |
| `$CLAUDE_TOOL_NAME` | 触发 Hook 的工具名称 | 所有阶段 |
| `$CLAUDE_TOOL_INPUT` | 工具的 JSON 输入 | PreToolUse |
| `$CLAUDE_TOOL_OUTPUT` | 工具的输出结果 | PostToolUse |

---

## 实战示例

### 示例 1：危险命令防护

拦截可能造成破坏的命令：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(rm -rf*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '⚠️ 警告：检测到危险的删除命令！' && exit 1"
          }
        ]
      },
      {
        "matcher": "Bash(git push --force*)",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "检测到强制推送命令，这可能会覆盖远程历史。请确认是否真的需要执行此操作，并说明潜在风险。"
          }
        ]
      }
    ]
  }
}
```

### 示例 2：操作审计日志

记录所有工具调用：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$(date '+%Y-%m-%d %H:%M:%S') [PRE] $CLAUDE_TOOL_NAME\" >> $CLAUDE_PROJECT_DIR/.claude/audit.log"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$(date '+%Y-%m-%d %H:%M:%S') [POST] $CLAUDE_TOOL_NAME completed\" >> $CLAUDE_PROJECT_DIR/.claude/audit.log"
          }
        ]
      }
    ]
  }
}
```

### 示例 3：代码格式化

文件写入后自动格式化：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_PROJECT_DIR/**/*.{js,ts,vue,json}\" 2>/dev/null || true",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

### 示例 4：Git 提交前检查

提交前自动运行测试：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [
          {
            "type": "command",
            "command": "cd $CLAUDE_PROJECT_DIR && npm run lint && npm run test:unit",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

### 示例 5：敏感信息检测

防止提交敏感信息：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git add*)",
        "hooks": [
          {
            "type": "command",
            "command": "cd $CLAUDE_PROJECT_DIR && git diff --cached | grep -iE '(password|secret|api_key|token)' && echo '⚠️ 检测到可能的敏感信息！' && exit 1 || exit 0"
          }
        ]
      }
    ]
  }
}
```

### 示例 6：NPM 命令后通知

NPM 命令完成后发送通知：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash(npm*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'NPM 命令已完成' >> $CLAUDE_PROJECT_DIR/.claude/npm.log"
          }
        ]
      }
    ]
  }
}
```

### 示例 7：权限自动处理

自动处理权限请求：

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "Bash(npm run*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'approved'"
          }
        ]
      },
      {
        "matcher": "Bash(rm*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'denied'"
          }
        ]
      }
    ]
  }
}
```

---

## 完整配置示例

### 本项目实际配置

ruoyi-plus-uniapp-workflow 项目使用三个 JavaScript 钩子文件实现自动化流程：

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/skill-forced-eval.js"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/pre-tool-use.js",
            "timeout": 5000
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/stop.js",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

**三个钩子的职责：**

| 钩子文件 | 事件类型 | 核心功能 |
|---------|---------|---------|
| `skill-forced-eval.js` | UserPromptSubmit | 注入48个技能评估流程，强制逐个激活匹配技能 |
| `pre-tool-use.js` | PreToolUse | 拦截危险Bash命令（`rm -rf /`、`drop database`等），警告敏感文件写入 |
| `stop.js` | Stop | 清理误创建的 `nul` 文件，播放完成提示音（跨平台） |

### 通用配置示例

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(rm -rf*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '危险命令已被拦截' && exit 1"
          }
        ]
      },
      {
        "matcher": "Bash(git push --force*)",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "强制推送可能覆盖远程历史，请谨慎操作"
          }
        ]
      },
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$(date) PRE: $CLAUDE_TOOL_NAME\" >> ~/.claude/audit.log"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_PROJECT_DIR/**/*.{ts,vue}\" 2>/dev/null || true"
          }
        ]
      },
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$(date) POST: $CLAUDE_TOOL_NAME\" >> ~/.claude/audit.log"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"Session ended at $(date)\" >> ~/.claude/sessions.log"
          }
        ]
      }
    ]
  }
}
```

---

## 重要特性

### 1. Hook 审查机制

出于安全考虑，更改 Hook 配置后需要审核：

```bash
# 在 Claude Code 中查看和审核 Hooks
/hooks
```

修改 Hook 配置后，必须在 `/hooks` 菜单中确认，才能在当前会话中生效。

### 2. 并行执行

所有匹配的 Hook 会并行运行，提高执行效率。

### 3. 自动去重

相同的 Hook 命令会自动去重，避免重复执行。

### 4. 超时控制

- 默认超时：60 秒
- 可通过 `timeout` 参数自定义
- 超时后 Hook 会被终止

### 5. PreToolUse 修改能力

PreToolUse Hook 可以修改工具的输入参数：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"command\": \"modified command\"}'"
          }
        ]
      }
    ]
  }
}
```

---

## 最佳实践

### 1. 分层配置

```
全局配置（~/.claude/settings.json）
├── 通用安全规则
├── 审计日志
└── 个人偏好

项目配置（.claude/settings.json）
├── 项目特定规则
├── 代码格式化
└── 测试集成
```

### 2. 安全优先

```json
// 推荐：拦截危险操作
{
  "matcher": "Bash(rm -rf /)",
  "hooks": [{ "type": "command", "command": "exit 1" }]
}

// 推荐：敏感操作需要确认
{
  "matcher": "Bash(git push --force*)",
  "hooks": [{ "type": "prompt", "prompt": "确认强制推送？" }]
}
```

### 3. 性能考虑

- 避免在 `"*"` matcher 上执行耗时操作
- 合理设置 timeout，避免阻塞
- 使用异步日志记录

### 4. 错误处理

```bash
# Hook 命令应该处理错误
command_that_might_fail || true  # 失败时不阻塞
command_that_must_succeed || exit 1  # 失败时阻塞
```

---

## 调试技巧

### 查看 Hook 状态

```bash
# 在 Claude Code 中
/hooks
```

### 测试 Hook 命令

```bash
# 手动测试命令
export CLAUDE_PROJECT_DIR=/path/to/project
export CLAUDE_TOOL_NAME=Bash
export CLAUDE_TOOL_INPUT='{"command":"npm run build"}'

# 执行 Hook 命令
echo "Test" >> $CLAUDE_PROJECT_DIR/.claude/audit.log
```

### 常见问题

**Q: Hook 没有触发？**

A: 检查以下几点：
1. 配置文件路径是否正确
2. Matcher 模式是否匹配
3. 是否在 `/hooks` 中审核通过
4. JSON 格式是否正确

**Q: Hook 执行失败？**

A: 检查：
1. 命令路径是否正确
2. 权限是否足够
3. 环境变量是否可用
4. 超时设置是否合理

**Q: 如何禁用 Hook？**

A: 可以：
1. 删除配置文件中的 Hook
2. 将 matcher 改为不会匹配的模式
3. 在 `/hooks` 中拒绝审核

---

## 总结

Hooks 是实现 Claude Code 自动化的强大工具：

| 功能 | 说明 |
|------|------|
| **安全防护** | 拦截危险操作，保护系统安全 |
| **流程自动化** | 自动执行代码格式化、测试等 |
| **审计追踪** | 记录所有操作，便于审计 |
| **工作流集成** | 与 CI/CD 等工具无缝集成 |

**推荐配置顺序：**

1. 先配置安全防护 Hooks
2. 再配置审计日志
3. 最后配置自动化流程
