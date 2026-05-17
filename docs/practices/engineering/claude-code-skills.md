# Claude Code Skills 开发指南

## 什么是 Skills？

Skills 是 Claude Code 的预置知识模块，通过触发词按需激活。相比每次对话都要加载的 `CLAUDE.md`，Skills 只在需要时才加载，实现了**知识分片、按需调用**。

### 核心优势

| 传统方式 | Skills 方式 |
|---------|------------|
| 每次对话都要解释项目规范 | 规范写一次，永久生效 |
| Token 消耗在"解释"上 | Token 用在"干活"上 |
| AI 生成的代码需要大量修改 | 一次生成，直接可用 |
| 上下文满了就"失忆" | 知识持久化，不会忘 |

### Token 消耗对比

| 开发任务 | 无 Skills | 有 Skills | 节省 |
|---------|----------|----------|------|
| 开发一个 CRUD 模块 | ~15,000 tokens | ~3,500 tokens | **77%** |
| 集成微信支付 | ~12,000 tokens | ~3,000 tokens | **75%** |
| 排查数据库问题 | ~8,000 tokens | ~2,000 tokens | **75%** |

---

## 目录结构

```text
项目根目录/
├── CLAUDE.md                    # 入口文件（每次加载）
└── .claude/
    └── skills/
        ├── crud-development/
        │   └── SKILL.md         # CRUD 开发规范
        ├── payment-integration/
        │   └── SKILL.md         # 支付集成指南
        ├── database-ops/
        │   └── SKILL.md         # 数据库操作
        └── ...
```

---

## 项目已有 Skills 清单

本项目包含 **54 个 Skills**，按功能分为 11 大类：

### 后端开发类（10 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **crud-development** | CRUD、增删改查、Entity、Service、DAO | 全栈四层架构 CRUD 代码生成 |
| **api-development** | API、接口、RESTful | API 设计规范 |
| **database-ops** | 数据库、建表、SQL | 数据库设计与多库操作 |
| **backend-annotations** | SerialMap、限流、脱敏 | 后端高级注解使用 |
| **error-handler** | 异常处理、ServiceException | 全局异常处理机制 |
| **utils-toolkit** | 工具类、MapstructUtils | 全栈工具类速查 |
| **json-serialization** | JSON、序列化、BigDecimal | JSON 处理规范 |
| **test-development** | 单元测试、JUnit5、Mockito | 测试开发规范 |
| **log-audit** | 操作日志、@Log、审计追踪 | `@Log` 注解、操作类型、登录日志、敏感参数脱敏 |
| **workflow-engine** | 工作流、WarmFlow、审批、流程 | 基于 WarmFlow 的流程定义、实例、任务管理 |

### 安全与权限类（4 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **security-guard** | Sa-Token、权限、加密 | 认证授权和数据安全 |
| **data-permission** | 数据权限、部门隔离 | 行级数据权限控制 |
| **multi-tenant** | 多租户、TenantEntity | 多租户数据隔离 |
| **social-login** | OAuth2、微信登录、JustAuth | 第三方社交登录 |

### 中间件与集成类（9 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **redis-cache** | Redis、缓存、@Cacheable | 缓存策略和分布式锁 |
| **scheduled-jobs** | 定时任务、SnailJob、@Scheduled | 定时任务开发（3 种方案） |
| **realtime-communication** | WebSocket、SSE、实时推送 | 实时通信（双向 + 单向） |
| **file-oss-management** | 文件上传、OSS、MinIO | 文件存储管理 |
| **notification-system** | 短信、邮件、消息推送 | 短信 + 邮件 + 统一消息 |
| **message-queue** | RocketMQ、消息队列 | 消息队列开发 |
| **iot-mqtt** | MQTT、物联网、IoT | MQTT 设备通信 |
| **third-party-api** | 高德地图、Forest、HTTP | 第三方 API 集成 |
| **ai-langchain4j** | AI、大模型、ChatGPT | LangChain4j AI 集成 |

### 前端开发类（2 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **ui-pc** | AForm、AModal、Element Plus | PC 端 71 个自定义组件 |
| **store-pc** | Pinia、useUserStore | PC 端状态管理 |

### 移动端开发类（4 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **ui-mobile** | wd- 组件、WD UI | 移动端 99+ 组件 |
| **ui-design-mobile** | 页面布局、间距、大气 | 移动端设计思维 |
| **store-mobile** | useAuth、Composable | 移动端状态管理 |
| **uniapp-platform** | 条件编译、ifdef | 多端条件编译 |

### APP原生类（1 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **app-adapter** | plus-app、APP端、原生插件、HBuilderX | plus-app 原生 APP 适配指南 |

### 微信与支付类（2 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **payment-integration** | 微信支付、支付宝、退款 | 多渠道支付集成 |
| **wechat-integration** | 小程序登录、订阅消息 | 微信生态集成 |

### 质量与排查类（5 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **bug-detective** | Bug、报错、异常排查 | Bug 排查方法论 |
| **performance-doctor** | 性能、慢查询、优化 | 性能诊断和优化 |
| **code-patterns** | 代码规范、命名 | 全栈编码规范速查 |
| **media-processing** | 图片处理、二维码、Excel | 媒体处理工具 |
| **icon-management** | 图标、菜单图标、IconSelect | PC 端与移动端图标管理 |

### 部署运维类（2 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **deployment-guide** | 部署、上线、Docker、Nginx、1Panel、生产环境 | 生产环境部署、一键自动化部署脚本、构建 JAR/前端/小程序/APP、密钥轮换 |
| **env-config** | 环境配置、profile、application.yml、.env、多环境 | 后端 Spring Boot 多 profile、前端/移动端 `.env` 文件、环境变量占位符 |

### 规划与协作类（13 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **architecture-design** | 架构、模块划分、重构 | 系统架构规划 |
| **tech-decision** | 技术选型、方案对比 | 技术决策分析 |
| **brainstorm** | 头脑风暴、方案设计、业界怎么做 | 创意方案探索,内置 5 种发散方法(类比/反向/约束/跨界 + 联网借鉴法按需查最新最佳实践) |
| **i18n-development** | 国际化、多语言、i18n | 全栈国际化方案 |
| **project-navigator** | 项目结构、文件在哪 | 项目导航和定位 |
| **git-workflow** | Git、提交、分支 | Git 工作流规范 |
| **task-tracker** | 任务跟踪、记录进度 | 开发任务持久化跟踪 |
| **add-skill** | 添加技能、创建技能 | 扩展技能系统 |
| **project-init** | 新项目、初始化项目、independent deployment | 基于框架模板创建独立业务项目，含标识符替换、Git 仓库创建、数据库初始化 |
| **project-migration** | 迁移项目、架构迁移、框架迁移 | 项目迁移与重构方法论，支持浅/标准/深度三种策略 |
| **framework-sync** | 框架同步、upstream、拉取更新、合并上游 | 将 ruoyi-plus-uniapp 框架原仓库更新同步到子项目（多分支、选择性合并） |
| **exp-sediment** | 沉淀经验、总结会话、/exp、以前怎么处理、之前的方案、查记录、历史经验、查笔记、上次怎么解决、类似问题 | 双向触发(产出/消费):产出经验时将本次会话或最近提交的隐性知识沉淀到 Skills/Memory/CLAUDE.md/`.claude/docs/experience/`;消费经验时按主题 grep 历史踩坑记录避免重蹈覆辙,提供"轻量/按主题/全量"三档读取深度策略 |
| **html-to-code** | HTML转代码、设计稿转换、原型转代码 | HTML/Tailwind 设计稿转换为 plus-ui 或 plus-uniapp/plus-app 代码 |

### AI 协作类（2 个）

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **collaborating-with-codex** | Codex、算法分析 | 委托 Codex 处理任务 |
| **collaborating-with-gemini** | Gemini、UI 设计 | 委托 Gemini 处理任务 |

---

## Skill 编写规范

### YAML 头部格式

每个 Skill 必须包含 YAML 头部：

```yaml
---
name: crud-development
description: |
  当需要开发 CRUD 功能时自动使用此 Skill。

  触发场景：
  - 创建新的业务模块
  - 编写 Entity、Service、DAO
  - 前端 API 定义

  触发词：CRUD、增删改查、Entity、Service、DAO、Controller
---

# CRUD 全栈开发规范

（正文内容...）
```

### 编写技巧

#### 技巧 1：代码模板优于文字说明

```markdown
❌ 不好的写法：
Service 层不要继承基类，要直接实现接口。

✅ 好的写法：
## Service 实现类

```java
@Service
@RequiredArgsConstructor
public class XxxServiceImpl implements IXxxService {

    private final IXxxDao xxxDao;  // 只注入 DAO

    @Override
    public XxxVo get(Long id) {
        Xxx entity = xxxDao.getById(id);
        return MapstructUtils.convert(entity, XxxVo.class);
    }
}
```text
```

#### 技巧 2：对比展示错误和正确做法

```markdown
### 常见错误

```java
// ❌ 错误：Service 继承了基类
public class XxxServiceImpl extends ServiceImpl<XxxMapper, Xxx> {

// ❌ 错误：直接注入 Mapper
private final XxxMapper xxxMapper;
```text

### 正确做法

```java
// ✅ 正确：不继承任何基类
public class XxxServiceImpl implements IXxxService {

// ✅ 正确：注入 DAO
private final IXxxDao xxxDao;
```text
```

#### 技巧 3：包含完整可运行的示例

不要只给代码片段，要给完整的、可以直接复制使用的代码。

#### 技巧 4：设置清晰的触发词

触发词要覆盖用户可能的表达方式：

```yaml
触发词：支付、付款、微信支付、支付宝、银联、余额支付、退款、回调、notify、PayService
```

---

## 快速开始

### 第一步：创建目录结构

```bash
mkdir -p .claude/skills
```

### 第二步：从最常用的场景开始

建议先创建这 3 个 Skills：

1. **项目规范 Skill**：你的代码风格、架构约定
2. **CRUD Skill**：最常写的业务代码模板
3. **工具类 Skill**：项目中有哪些工具可以用

### 第三步：在 CLAUDE.md 中添加索引

```markdown
## Skills 索引

| Skill | 触发词 | 说明 |
|-------|--------|------|
| crud-development | CRUD、增删改查 | 业务模块开发 |
| database-ops | 数据库、建表 | 数据库操作 |
| ...
```

### 第四步：持续迭代

- 遇到 AI 不懂的场景 → 写个 Skill
- 发现代码生成不对 → 补充示例
- 团队有新规范 → 更新 Skill

---

## 实战效果对比

### 场景：开发一个"优惠券管理"模块

**无 Skills 的对话：**

```text
我：帮我开发优惠券管理模块

AI：好的，我需要了解一些信息：
    1. 你使用什么后端框架？
    2. Service 层是否继承基类？
    3. 数据库表结构是怎样的？

我：Spring Boot，不继承基类，表名 b_coupon

AI：好的，我来生成代码...
    [生成了继承 ServiceImpl 的代码]

我：不对，我说了不继承基类

[30 分钟后，代码终于对了]
```

**有 Skills 的对话：**

```text
我：帮我开发优惠券管理模块的 CRUD

AI：[自动激活 crud-development Skill]

    好的，我会按照项目规范生成优惠券管理模块。

    1. Entity: Coupon.java（继承 BaseEntity）
    2. BO: CouponBo.java（使用 @AutoMappers）
    3. VO: CouponVo.java
    4. Service: ICouponService.java / CouponServiceImpl.java（不继承基类）
    5. DAO: ICouponDao.java / CouponDaoImpl.java（含 buildQueryWrapper）
    6. Controller: CouponController.java
    7. 前端 API: couponApi.ts / couponTypes.ts

    [直接生成 7 个完整文件，代码风格 100% 符合项目规范]

[3 分钟完成，代码直接可用]
```

### 效率提升数据

| 指标 | 无 Skills | 有 Skills | 提升 |
|------|----------|----------|------|
| 开发时间 | 30 分钟 | 3 分钟 | **10x** |
| Token 消耗 | 15,000 | 3,500 | **77%↓** |
| 代码修改次数 | 5+ 次 | 0-1 次 | **显著减少** |

---

## 最佳实践

### 知识分层策略

```text
CLAUDE.md（248行）      ← 每次必加载：核心禁令、架构要点
    ↓
Skills（10,000+行）     ← 按需加载：详细规范、代码模板
    ↓
Docs（3,800+行）        ← 深度参考：完整指南、复杂场景
```

### Skill 设计原则

1. **单一职责**：每个 Skill 解决一类问题
2. **自包含**：Skill 内容应该完整，不依赖其他 Skill
3. **实用优先**：代码模板 > 文字说明
4. **持续迭代**：根据 AI 表现不断优化

### 团队协作

- 将 `.claude/` 目录加入版本控制
- 团队成员共享同一套 Skills
- 统一代码风格，减少 Review 成本

---

## 视频教程

想看实操演示？点击下方视频：

**[Claude Code Skills 实战教程](https://www.bilibili.com/video/BV1WmSKBEEtt/)**

---

## 总结

Skills 解决的核心问题：**让 AI 从"通用助手"变成"专属专家"**。

| 维度 | 收益 |
|------|------|
| **效率** | Token 消耗降低 75%+，开发速度提升 10 倍 |
| **质量** | 生成的代码直接符合项目规范，减少返工 |
| **一致性** | 团队成员用同一套 Skills，代码风格统一 |
| **积累** | 知识写一次，受益终身，还能共享给团队 |

**记住**：不要追求一次写完所有 Skills，按需逐步积累，定期更新保持与项目同步。
