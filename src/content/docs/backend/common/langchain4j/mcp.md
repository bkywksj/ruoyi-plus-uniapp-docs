---
title: "MCP 工具集成"
description: "通过 MCP（Model Context Protocol）把业务能力开放给 Claude Code、Cursor 等外部 AI Agent，并让内置 AI 对话调用外部 MCP 工具。两个方向默认关闭、互不依赖。"
---
# MCP 工具集成

## 介绍

MCP（Model Context Protocol）是让大模型调用外部工具的开放协议。框架两个方向都提供：

| 方向 | 作用 | 模块 | 开关（默认关闭） |
|------|------|------|------|
| **服务端** | 把业务能力以 MCP 工具开放给 Claude Code、Cursor 等外部 AI Agent | `ruoyi-common-mcp` | `spring.ai.mcp.server.enabled`（环境变量 `MCP_SERVER_ENABLED`） |
| **客户端** | 内置 AI 对话（`FUNCTION` 模式）调用外部 MCP Server 的工具 | `ruoyi-common-langchain4j` | `langchain4j.mcp.enabled` |

设计原则：框架只负责「接通 + 安全底线」，不新增数据表和管理页面。认证复用后台「API 密钥」，权限复用菜单权限串，审计写入操作日志。

## 服务端：把业务能力开放给外部 Agent

### 开启

模块自带默认配置（`mcp-server.yml`），只需覆盖开关：

```yaml
# application.yml
spring:
  ai:
    mcp:
      server:
        enabled: true   # 或设置环境变量 MCP_SERVER_ENABLED=true
```

开启后后端多出一个端点 `POST /mcp`。经 Nginx 部署时地址为 `https://你的域名/ryplus_uni/mcp`，现有的 `/ryplus_uni/` 反向代理已经覆盖，不需要新增 location。

> **注意**：协议固定为无状态同步。框架使用 Streamable HTTP 的**无状态**模式（`protocol: STATELESS`、`type: SYNC`），多实例部署不需要会话粘滞。改成其他组合时应用会**直接启动失败**，避免工具绕过权限校验运行。

### 认证

外部客户端在请求头中携带后台「API 密钥」：

```
Authorization: Bearer <appKey>:<appSecret>
```

- 密钥在后台「API 密钥」页面创建，启停、过期时间、IP 白名单、关联用户全部生效
- 工具以**密钥关联用户**的身份执行：数据范围受该用户所属租户、角色菜单权限、数据权限约束
- 认证失败直接返回 HTTP 401，连工具列表都看不到
- 开发调试时可开启 `mcp.allow-login-token: true`（默认关闭），直接用登录 token：`Authorization: Bearer <token>`；生产环境建议保持关闭

> **注意**：生产环境必须使用 HTTPS。密钥会随每次请求发送，明文 HTTP 传输有泄露风险。

### 在 Claude Code 中接入

在项目根目录的 `.mcp.json`（或用户级 `~/.claude.json`）中添加：

```json
{
  "mcpServers": {
    "ruoyi": {
      "type": "http",
      "url": "https://你的域名/ryplus_uni/mcp",
      "headers": {
        "Authorization": "Bearer ${RUOYI_MCP_KEY}"
      }
    }
  }
}
```

`RUOYI_MCP_KEY` 设为 `appKey:appSecret` 的环境变量，避免把密钥写进文件。

### 编写工具

框架内置一个示例工具 `ruoyi_page_ads`（`ruoyi-business` 模块 `base/mcp/AdMcpTool.java`），新工具照此编写：

```java
@Component
@RequiredArgsConstructor
public class AdMcpTool {

    private final IAdService adService;

    @SaCheckPermission("base:ad:query")
    @McpTool(name = "ruoyi_page_ads",
        description = "分页查询广告配置，返回广告名称、类型、位置、状态等字段。",
        annotations = @McpTool.McpAnnotations(readOnlyHint = true, destructiveHint = false))
    public String pageAds(
        @McpToolParam(description = "广告名称，模糊匹配", required = false) String adName,
        @McpToolParam(description = "每页条数，默认 10，最大 50", required = false) Integer pageSize) {
        PageQuery pageQuery = new PageQuery(pageSize == null ? 10 : Math.min(pageSize, 50), 1);
        AdBo bo = new AdBo();
        bo.setAdName(adName);
        return JsonUtils.toJsonString(adService.page(bo, pageQuery));
    }
}
```

编写约定：

| 约定 | 原因 |
|------|------|
| 必须标 `@SaCheckPermission`（只需认证时标 `@SaIgnore`） | 未声明权限的工具调用会被拒绝；谁能调哪个工具由角色菜单分配决定 |
| 只调用 Service，不直接访问 DAO / Mapper | 绕过 Service 会跳过业务校验 |
| 只做查询 | 工具由 AI **自主调用**，框架不提供审批流程；确需写操作时由业务自行设计确认机制 |
| 返回 `JsonUtils.toJsonString(...)` 序列化后的字符串 | 保证 Long 精度、日期格式、脱敏等与接口返回一致 |
| 列表必须分页并限制每页上限 | 避免一次把大量数据塞进模型上下文 |
| 工具名加业务前缀（如 `ruoyi_`） | 外部 Agent 同时接入多个 MCP Server 时避免重名 |

### 框架自动处理的事项

工具方法里**不需要**关心以下内容：

| 事项 | 说明 |
|------|------|
| 租户隔离、数据权限 | 工具执行前自动重建登录用户与租户上下文，执行后清理；`LoginHelper`、`TenantHelper`、`@DataPermission` 与普通接口行为一致 |
| 权限校验 | 按工具方法上的 `@SaCheckPermission` 校验密钥关联用户的菜单权限 |
| 操作日志 | 每次调用写入 `sys_oper_log`：标题「MCP工具」，操作人为 `mcp:用户名`，记录入参（截断）、耗时、成败 |
| 错误提示 | 失败时结果文本以 `[denied]`（未认证或无权限，提示用户去后台授权）或 `[error]`（执行出错）开头，方便 AI 判断下一步 |

## 客户端：内置 AI 对话调用外部工具

### 配置

```yaml
langchain4j:
  mcp:
    enabled: true
    max-sequential-tool-calls: 10   # 单轮对话最多连续调用工具次数
    retry-interval: 1m              # 连接失败的 Server 多久后重试
    servers:
      - key: weather                # 唯一标识，也是工具名前缀（weather__xxx）
        transport: streamable-http  # 远程 Server（默认）
        url: http://localhost:3001/mcp
        headers:
          Authorization: Bearer ${WEATHER_MCP_TOKEN:}
        timeout: 60s
      - key: everything
        transport: stdio            # 本地子进程
        command: ["npx.cmd", "-y", "@modelcontextprotocol/server-everything"]
```

| 配置项 | 说明 |
|------|------|
| `key` | 只用字母、数字、下划线；所有工具名会加上 `{key}__` 前缀，多个 Server 有同名工具也不会冲突 |
| `transport` | `streamable-http`（远程，默认）或 `stdio`（本地子进程） |
| `url` / `headers` | streamable-http 使用；凭据请用 `${环境变量:}` 占位，不要写死 |
| `command` / `env` | stdio 使用；Windows 下 `npx` 要写成 `npx.cmd` |
| `timeout` | 建连与单次工具调用的超时 |

> **注意**：stdio 命令只能写在配置文件里。stdio 传输会在服务器上启动进程，`command` 绝不能来自用户输入或可编辑的数据库字段，否则等同于远程命令执行漏洞。

> **注意**：`headers` 里的凭据是所有使用 AI 对话的用户共享的服务身份，任何能登录系统的用户都可以借 AI 调用该 Server 的工具。只授予最小权限，不要用超级管理员等高权限的 API 密钥连回本系统的 `/mcp`，否则普通用户可借 AI 越权查询。

### 运行行为

- PC 端 AI 对话（导航栏 AI 助手）统一使用 `FUNCTION` 模式。后端未开启 MCP 或外部 Server 都不可用时，**自动按多轮对话处理**，体验与之前完全一致
- 首次对话时才连接外部 Server，不影响应用启动；某个 Server 连不上只记录警告并跳过，冷却 `retry-interval` 后再试
- 模型调用工具前，WebSocket 推送 `phase: 'tool'` 的流式消息（带 `toolName`），前端在回复上方显示「调用工具」标签
- 应用关闭时自动断开所有客户端，stdio 启动的子进程随之结束

### WebSocket 流式消息

```typescript
// ai_chat_stream 新增 tool 阶段
{
  type: 'ai_chat_stream',
  sessionId: 'session-xxx',
  messageId: 'msg-xxx',
  phase: 'tool',               // content 正文 | thinking 思考 | tool 即将调用工具
  toolName: 'weather__get_weather'
}
```

## 常见问题

### 外部 Agent 连接返回 401

依次检查：请求头格式是否为 `Bearer appKey:appSecret`、密钥是否启用且未过期、调用方 IP 是否在白名单内、密钥是否关联了用户。为防止枚举，AppKey 不存在与 AppSecret 错误统一提示「AppKey 或 AppSecret 无效」；提示「不支持登录 token 访问」时，说明使用了登录 token 而未开启 `mcp.allow-login-token`。

### 能看到工具列表，但调用返回 `[denied] 当前账号缺少权限`

给密钥关联用户的角色分配工具上 `@SaCheckPermission` 对应的菜单权限。

### 内置 AI 对话从不调用工具

1. 确认 `langchain4j.mcp.enabled: true` 且 `servers` 已配置
2. 首次对话后查看日志：`MCP 客户端建连成功` 或 `MCP 客户端建连失败(已跳过...)` 及原因
3. 确认所用模型支持工具调用（部分小模型、本地模型不支持）

### 关闭应用后残留 node 进程

stdio 子进程会随应用关闭回收。若手动排查，请按 PID 结束进程，不要按进程名批量结束 `node`，以免误杀其他程序。
