# Claude Code MCP 服务器配置

## 什么是 MCP？

MCP（Model Context Protocol）是一个开源标准协议，允许 Claude Code 连接到外部工具和数据源。通过 MCP 服务器，Claude 可以访问数据库、API、文件系统和各种第三方服务，极大扩展 Claude Code 的能力边界。

### 核心价值

| 场景 | 无 MCP | 有 MCP |
|------|--------|--------|
| 搜索代码示例 | 手动搜索复制 | Claude 直接搜索获取 |
| 查询数据库 | 切换工具执行 | Claude 直接查询 |
| 浏览器调试 | 手动操作描述 | Claude 直接控制 |
| 设计稿查看 | 截图上传 | 直接读取 Figma |

---

## 配置位置

| 作用域 | 配置文件 | 说明 |
|--------|--------|------|
| **全局用户配置** | `~/.claude/claude_config.json` | 所有项目通用 |
| **项目级配置** | `项目根/.mcp.json` | 仅当前项目可用（推荐） |
| **项目设置** | `.claude/settings.json` | 项目设置中配置 |

---

## 配置格式

### 方式 1：.mcp.json 文件（推荐）

在项目根目录创建 `.mcp.json` 文件：

```json
{
  "mcpServers": {
    "服务器名称": {
      "command": "启动命令",
      "args": ["参数1", "参数2"],
      "env": {
        "环境变量": "值"
      }
    }
  }
}
```

### 方式 2：全局配置

在 `~/.claude/claude_config.json` 中配置：

```json
{
  "mcpServers": {
    "服务器名称": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-xxx"]
    }
  }
}
```

---

## MCP 服务器类型

### 1. Stdio 服务器（本地进程）

适合需要直接系统访问或自定义脚本的场景。

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/share"]
    }
  }
}
```

### 2. HTTP 服务器（远程服务）

适合连接远程 MCP 服务。

```json
{
  "mcpServers": {
    "remote-api": {
      "type": "http",
      "url": "https://api.example.com/mcp"
    }
  }
}
```

---

## 常用 MCP 服务器

### 1. 文件系统服务器

访问本地文件系统：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/documents"]
    }
  }
}
```

### 2. PostgreSQL 数据库

连接 PostgreSQL 数据库：

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/database"
      }
    }
  }
}
```

### 3. Exa 搜索服务

Web 搜索和代码搜索：

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-exa"],
      "env": {
        "EXA_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 4. Chrome DevTools

浏览器控制和调试：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-chrome-devtools"]
    }
  }
}
```

### 5. Figma 设计工具

读取 Figma 设计文件：

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

### 6. GitHub 集成

GitHub API 访问：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-github-token"
      }
    }
  }
}
```

### 7. Slack 集成

Slack 消息读写：

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token"
      }
    }
  }
}
```

### 8. Sequential Thinking

增强推理能力：

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-sequential-thinking"]
    }
  }
}
```

### 9. Context7 文档服务

获取最新库文档：

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

---

## Windows 特殊配置

在 Windows 上，需要使用 `cmd` 包装器来运行 npx 命令：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem", "D:/project-folder"]
    }
  }
}
```

---

## 命令行操作

### 添加服务器

```bash
# 添加 HTTP 服务器
claude mcp add --transport http weather https://api.weather.com/mcp

# 添加 stdio 服务器
claude mcp add --transport stdio filesystem -- npx -y @modelcontextprotocol/server-filesystem /home/user/documents

# 添加带参数的服务器
claude mcp add --transport stdio postgres -- node /path/to/postgres-server.js
```

### 管理服务器

```bash
# 列出所有已配置的服务器
claude mcp list

# 获取特定服务器的详细信息
claude mcp get filesystem

# 删除服务器
claude mcp remove weather
```

### 在 Claude Code 中检查状态

```bash
# 查看 MCP 服务器状态
/mcp
```

---

## 完整配置示例

### 开发环境配置

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-exa"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-chrome-devtools"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-sequential-thinking"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

### 数据库开发配置

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://dev:dev123@localhost:5432/ruoyi_plus"
      }
    },
    "redis": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-redis"],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

### 全栈开发配置

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-exa"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_TOKEN}"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-chrome-devtools"]
    }
  }
}
```

---

## 输出限制管理

MCP 工具输出可能产生大量 token：

| 配置 | 说明 |
|------|------|
| **警告阈值** | 输出超过 10,000 tokens 时显示警告 |
| **默认限制** | 25,000 tokens |
| **自定义限制** | 通过环境变量设置 |

```bash
# 设置更高的输出限制
export MAX_MCP_OUTPUT_TOKENS=50000
claude
```

---

## 安全注意事项

### 1. 敏感信息保护

```json
// ❌ 不推荐：明文存储密钥
{
  "env": {
    "API_KEY": "sk-xxxxx"
  }
}

// ✅ 推荐：使用环境变量
{
  "env": {
    "API_KEY": "${API_KEY}"
  }
}
```

### 2. 文件系统访问限制

```json
// ❌ 不推荐：访问整个系统
{
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/"]
}

// ✅ 推荐：限制到项目目录
{
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
}
```

### 3. 数据库权限最小化

```bash
# ✅ 推荐：使用只读用户
POSTGRES_CONNECTION_STRING=postgresql://readonly_user:xxx@localhost/db
```

---

## MCP 工具使用示例

配置完成后，Claude 可以自动发现和使用这些工具：

### Exa 搜索

```
用户：搜索 Vue 3 组合式 API 的最佳实践

Claude：[使用 mcp__exa__web_search_exa 工具]
        找到以下相关文章...
```

### Chrome DevTools

```
用户：帮我检查页面的网络请求

Claude：[使用 mcp__chrome-devtools__list_network_requests 工具]
        当前页面有以下网络请求...
```

### Context7 文档

```
用户：查询 Element Plus 的 Table 组件用法

Claude：[使用 mcp__context7__get-library-docs 工具]
        Element Plus Table 组件的使用方法如下...
```

---

## 自定义 MCP 服务器

### 基本结构

```javascript
// my-mcp-server.js
const { Server } = require('@modelcontextprotocol/sdk/server');

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0',
});

// 注册工具
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my_tool',
      description: '我的自定义工具',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    }
  ]
}));

// 实现工具
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'my_tool') {
    // 工具逻辑
    return { result: '处理结果' };
  }
});

server.listen();
```

### 配置使用

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./scripts/my-mcp-server.js"]
    }
  }
}
```

---

## 调试技巧

### 查看服务器状态

```bash
# 在 Claude Code 中
/mcp
```

### 检查服务器日志

```bash
# 查看 npx 输出
DEBUG=* npx -y @modelcontextprotocol/server-filesystem ./src
```

### 常见问题

**Q: 服务器没有启动？**

A: 检查以下几点：
1. 命令路径是否正确
2. 参数格式是否正确
3. 环境变量是否设置
4. 网络是否可访问

**Q: 工具调用失败？**

A: 检查：
1. API Key 是否有效
2. 权限是否足够
3. 输入格式是否正确
4. 服务器是否响应

**Q: Windows 上无法运行？**

A: 使用 cmd 包装器：
```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "server-name"]
}
```

---

## 最佳实践

### 1. 按需配置

只配置实际需要的服务器，避免资源浪费。

### 2. 项目级配置优先

使用 `.mcp.json` 进行项目级配置，便于团队共享。

### 3. 安全第一

- 使用环境变量存储敏感信息
- 限制文件系统访问范围
- 使用最小权限原则

### 4. 版本控制

将 `.mcp.json` 加入 `.gitignore`（包含敏感信息时）或版本控制（不含敏感信息时）。

---

## 总结

MCP 服务器是扩展 Claude Code 能力的核心机制：

| 能力 | 说明 |
|------|------|
| **数据访问** | 连接数据库、文件系统、API |
| **工具集成** | 浏览器调试、设计工具、搜索服务 |
| **流程自动化** | 与外部系统无缝对接 |
| **知识增强** | 实时获取最新文档和代码示例 |

**推荐配置：**

1. **基础配置**：filesystem + sequential-thinking
2. **开发增强**：+ exa + context7 + chrome-devtools
3. **全栈开发**：+ postgresql + github + figma
