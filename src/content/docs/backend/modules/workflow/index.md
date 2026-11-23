---
title: "工作流模块"
description: "RuoYi-Plus 工作流模块是一个功能完善、高度可扩展的企业级工作流解决方案，基于 Dromara 开源社区的 Warm-Flow 工作流引擎深度集成开发。该模块提供了流程定义、流程实例、任务管理、消息通知等完整的工作流能力，支持复杂的业务审批场景，如请假审批、报销审批、合同审批等。"
---
# 工作流模块

## 介绍

RuoYi-Plus 工作流模块是一个功能完善、高度可扩展的企业级工作流解决方案，基于 Dromara 开源社区的 Warm-Flow 工作流引擎深度集成开发。该模块提供了流程定义、流程实例、任务管理、消息通知等完整的工作流能力，支持复杂的业务审批场景，如请假审批、报销审批、合同审批等。

工作流模块采用轻量级设计理念，相比传统的 Activiti、Flowable 等重型工作流引擎，Warm-Flow 具有学习成本低、集成简单、性能优异等特点。同时，RuoYi-Plus 在 Warm-Flow 基础上进行了深度定制，增加了业务扩展表、SPEL 规则引擎、多种消息通知方式等企业级特性。

**核心特性：**

- **轻量级引擎** - 基于 Warm-Flow 2.1.1 版本，核心代码精简，启动快速，内存占用低
- **可视化设计** - 提供 Web 端流程设计器，支持拖拽式流程定义，所见即所得
- **多种节点类型** - 支持开始节点、中间节点、结束节点、互斥网关、并行网关等
- **灵活的任务分配** - 支持审批人、转办人、委托人、抄送人四种办理人类型
- **丰富的任务操作** - 支持办理、驳回、转办、委托、加签、减签、终止、作废等操作
- **消息通知集成** - 支持邮件、短信、SSE 实时推送三种通知方式
- **多租户支持** - 完整的租户数据隔离，适用于 SaaS 场景
- **业务扩展能力** - 通过业务扩展表关联业务数据，支持自定义流程变量
- **SPEL 规则引擎** - 支持 SpEL 表达式动态计算条件分支
- **权限精细控制** - 节点级别的权限控制，按钮级别的操作权限

**技术栈：**

| 技术 | 版本 | 说明 |
|------|------|------|
| Warm-Flow | 2.1.1 | 轻量级工作流引擎（Maven groupId `io.github.sgs98`） |
| Spring Boot | 3.5.16 | 应用框架 |
| MyBatis-Plus | 3.5.16 | ORM 框架 |
| Sa-Token | 1.45.0 | 认证授权 |
| Redisson | 3.52.0 | 分布式锁 |

**模块依赖：**

工作流模块依赖以下 RuoYi-Plus 通用模块：

| 模块 | 说明 |
|------|------|
| ruoyi-common-web | Web 服务支持 |
| ruoyi-common-security | 权限控制 |
| ruoyi-common-mybatis | 数据库访问 |
| ruoyi-common-excel | Excel 导入导出 |
| ruoyi-common-tenant | 多租户支持 |
| ruoyi-common-log | 操作日志记录 |
| ruoyi-common-idempotent | 幂等性控制 |
| ruoyi-common-sms | 短信通知 |
| ruoyi-common-mail | 邮件通知 |
| ruoyi-common-sse | SSE 实时推送 |

---

## 快速开始

### 环境要求

在开始使用工作流模块之前，请确保您的开发环境满足以下要求：

- **JDK**: 17+
- **Maven**: 3.8+
- **MySQL**: 5.7+
- **Redis**: 6.0+
- **Node.js**: 18+ (前端开发)

### Maven 依赖配置

工作流模块已集成在 `ruoyi-modules` 中，如需在其他模块中使用工作流功能，添加以下依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-workflow</artifactId>
</dependency>
```

工作流模块的核心依赖配置如下：

```xml
<!-- Warm Flow 工作流引擎 - 提供工作流核心功能 -->
<dependency>
    <groupId>io.github.sgs98</groupId>
    <artifactId>warm-flow-mybatis-plus-sb3-starter</artifactId>
</dependency>

<!-- Warm Flow UI 插件 - 提供流程设计器界面 -->
<dependency>
    <groupId>io.github.sgs98</groupId>
    <artifactId>warm-flow-plugin-ui-sb-web</artifactId>
</dependency>
```

版本号由根 `pom.xml` 统一管理：

```xml
<properties>
    <warm-flow.version>2.1.1</warm-flow.version>
</properties>
```

> Warm-Flow 从 2.x 起 Maven 坐标由 `org.dromara.warm` 改为 `io.github.sgs98`（artifactId 不变），Java 包名仍是 `org.dromara.warm.flow.*`。本项目基于 Spring Boot 3，使用 `sb3` starter。

### 数据库初始化

工作流模块需要初始化以下数据库表：

**Warm-Flow 核心表：**

| 表名 | 说明 |
|------|------|
| `flow_definition` | 流程定义表 |
| `flow_node` | 流程节点表 |
| `flow_skip` | 节点跳转关系表 |
| `flow_instance` | 流程实例表 |
| `flow_task` | 待办任务表 |
| `flow_his_task` | 历史任务表 |
| `flow_user` | 流程用户表 |
| `flow_event_wait` | 事件等待表（2.x 新增，定时 / 消息等需要等待的事件落在此表） |

**RuoYi-Plus 扩展表：**

| 表名 | 说明 |
|------|------|
| `flow_instance_biz_ext` | 流程实例业务扩展表 |
| `flow_category` | 流程分类表 |
| `flow_spel` | SPEL 规则表 |
| `test_leave` | 请假测试表（示例） |

以上引擎表、扩展表以及工作流菜单、字典都在同一个脚本 `*_ry_plus_workflow.sql` 中，全新安装时在系统表脚本之后执行（以 MySQL 为例）：

```bash
# 在项目根目录执行，库名以配置文件中的 DB_NAME 为准
mysql --default-character-set=utf8mb4 -uroot -p ryplus_uni_workflow < script/sql/mysql/ry_plus_sys.sql
mysql --default-character-set=utf8mb4 -uroot -p ryplus_uni_workflow < script/sql/mysql/ry_plus_app.sql
mysql --default-character-set=utf8mb4 -uroot -p ryplus_uni_workflow < script/sql/mysql/ry_plus_workflow.sql
```

其他数据库对应 `script/sql/oracle/oracle_ry_plus_workflow.sql`、`script/sql/postgres/postgres_ry_plus_workflow.sql`、`script/sql/sqlserver/sqlserver_ry_plus_workflow.sql`，完整的执行顺序与注意事项见 `script/sql/README.md`。

> 已经用 Warm-Flow 1.8.9 跑过业务的老库**不要**重跑全量脚本，改为执行迁移脚本，见本文「从 Warm-Flow 1.8.9 升级」。

### 配置文件

在 `application.yml` 中配置工作流相关参数：

```yaml
warm-flow:
  # 是否开启工作流，默认true
  enabled: true
  # 是否开启设计器ui
  ui: true
  # 默认Authorization，如果有多个token，用逗号分隔
  token-name: ${sa-token.token-name},clientId
  # 流程状态对应的三元色
  chart-status-color:
    ## 未办理
    - 62,62,62
    ## 待办理
    - 255,205,23
    ## 已办理
    - 157,255,0
```

**定时事件开关 `warm-flow.timer-enabled`**

Warm-Flow 2.x 新增了定时事件线程，由 `warm-flow.timer-enabled` 控制，引擎默认值为 `false`。本项目 `application.yml` 未配置该项，即**默认关闭**。关闭时，流程定义里含定时事件节点会在发布时被拦截（见「流程定义发布校验」）。如需开启：

```yaml
warm-flow:
  # 开启定时事件线程（多租户环境下的限制见「从 Warm-Flow 1.8.9 升级」中的「暂未接入的引擎能力」）
  timer-enabled: true
```

### 流程定义发布校验

调用 `publishDefinition` 发布流程定义时，`FlwDefinitionServiceImpl` 会依次校验：

| 校验项 | 规则 |
|--------|------|
| 办理人 | 中间节点（`nodeType = 1`）必须配置办理人；申请人节点、事件节点（`event_type` 非空）不要求 |
| 定时事件 | `event_type` 以 `TIMER_` 开头，且未开启 `warm-flow.timer-enabled` → 拦截 |
| 消息 / 错误事件 | `event_type` 以 `MESSAGE_` 或 `ERROR_` 开头 → 一律拦截（本系统尚未接入触发接口） |
| 服务任务 | `nodeType = 6`：`node_config` 必须能解析；按类名方式（`type` 为空或 `class`）配置时，处理器类必须存在且实现 `ServiceTaskHandler`，否则拦截；表达式方式运行时才求值，发布时放行 |
| 终止结束 | `TERMINATE_END` 只是结束节点的一种，放行 |

校验不通过时抛出 `ServiceException`，提示形如「以下节点暂不支持，无法发布：【xxx】是定时事件，需先开启 warm-flow.timer-enabled」。

> 设计器（warm-flow-ui）只负责保存流程 JSON，没有发布入口，发布只能走后台「流程定义」页面的发布按钮（即 `publishDefinition` 接口）。

### 启动验证

启动应用后，可以通过以下方式验证工作流模块是否正常工作：

1. **访问流程设计器**

流程设计器由 `warm-flow-plugin-ui-sb-web` 提供，前端在「流程定义」页面以 iframe 方式嵌入（`plus-ui/src/views/workflow/processDefinition/design.vue`），地址形如：

```text
http://localhost:5503/warm-flow-ui/index.html?id={流程定义ID}
```

> 2.x 起前端不再传 `onlyDesignShow=true`，设计器会完整显示自动审批、抄送等配置面板。

2. **查看 API 文档**

访问 Swagger 文档查看工作流相关接口：

```text
http://localhost:5503/doc.html#/workflow
```

3. **测试请假流程**

系统内置了请假流程示例，可以通过以下步骤测试：

```java
// 1. 启动请假流程
StartProcessBo startBo = new StartProcessBo();
startBo.setBusinessId("LEAVE_001");
startBo.setFlowCode("leave_flow");
startBo.setBizExt(new FlowInstanceBizExt()
    .setBusinessCode("LEAVE_001")
    .setBusinessTitle("张三的请假申请"));

StartProcessReturnDTO result = flwTaskService.startWorkFlow(startBo);

// 2. 查询待办任务
FlowTaskBo taskBo = new FlowTaskBo();
PageResult<FlowTaskVo> waitingTasks = flwTaskService.pageWaitingTasks(taskBo, new PageQuery());

// 3. 办理任务
CompleteTaskBo completeBo = new CompleteTaskBo();
completeBo.setTaskId(waitingTasks.getRecords().get(0).getId());
completeBo.setMessage("同意请假申请");
flwTaskService.completeTask(completeBo);
```

---

## 架构设计

### 整体架构

工作流模块采用分层架构设计，从上到下分为表现层、业务层、服务层和数据层：

```text
┌─────────────────────────────────────────────────────────────────┐
│                         表现层 (Controller)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │FlwTask      │ │FlwDefinition│ │FlwInstance  │ │FlwCategory  ││
│  │Controller   │ │Controller   │ │Controller   │ │Controller   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                         业务层 (Service)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │IFlwTask     │ │IFlwDefinition│ │IFlwInstance │ │IFlwCategory ││
│  │Service      │ │Service      │ │Service      │ │Service      ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │IFlwSpel     │ │IFlwNodeExt  │ │IFlwCommon   │                │
│  │Service      │ │Service      │ │Service      │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│                      Warm-Flow 引擎层                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │DefService   │ │InsService   │ │TaskService  │                │
│  │(流程定义)    │ │(流程实例)    │ │(任务管理)   │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│                         数据层 (Mapper)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │FlwTask      │ │FlwInstance  │ │FlwCategory  │ │FlwSpel      ││
│  │Mapper       │ │Mapper       │ │Mapper       │ │Mapper       ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                         数据库层                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  flow_definition │ flow_node │ flow_instance │ flow_task    ││
│  │  flow_his_task   │ flow_user │ flow_category │ flow_spel    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 模块结构

工作流模块的包结构如下：

```text
plus.ruoyi.workflow
├── config/                          # 配置类
│   └── WarmFlowConfig.java          # Warm-Flow 配置
├── common/                          # 通用类
│   ├── ConditionalOnEnable.java     # 条件装配注解
│   ├── constant/
│   │   └── FlowConstant.java        # 流程常量
│   └── enums/                       # 枚举定义
│       ├── TaskStatusEnum.java      # 任务状态枚举（与引擎 2.x TaskStatus 编码对齐）
│       ├── TaskAssigneeType.java    # 办理人类型枚举
│       ├── TaskAssigneeEnum.java    # 办理人分配方式枚举（用户/角色/部门/岗位/SpEL）
│       ├── TaskOperationEnum.java   # 任务操作枚举（委派/转办/加签/减签）
│       ├── ButtonPermissionEnum.java # 按钮权限枚举
│       ├── MessageTypeEnum.java     # 消息类型枚举
│       ├── NodeExtEnum.java         # 节点扩展枚举
│       └── VariablesEnum.java       # 流程变量枚举
├── controller/                      # 控制器 (6个)
│   ├── FlwTaskController.java       # 任务管理
│   ├── FlwDefinitionController.java # 流程定义管理
│   ├── FlwInstanceController.java   # 流程实例管理
│   ├── FlwCategoryController.java   # 流程分类管理
│   ├── FlwSpelController.java       # SPEL 规则管理
│   └── TestLeaveController.java     # 请假流程演示
├── service/                         # 服务接口 (10个)
│   ├── IFlwTaskService.java         # 任务服务
│   ├── IFlwDefinitionService.java   # 定义服务
│   ├── IFlwInstanceService.java     # 实例服务
│   ├── IFlwCategoryService.java     # 分类服务
│   ├── IFlwSpelService.java         # SPEL 服务
│   ├── IFlwNodeExtService.java      # 节点扩展服务
│   ├── IFlwTaskAssigneeService.java # 任务分配服务
│   ├── IFlwCommonService.java       # 通用服务
│   ├── ITestLeaveService.java       # 请假服务
│   └── impl/                        # 服务实现 (9个)
├── domain/                          # 领域对象
│   ├── bo/                          # 业务对象 (16个)
│   │   ├── StartProcessBo.java      # 启动流程参数
│   │   ├── CompleteTaskBo.java      # 办理任务参数
│   │   ├── BackProcessBo.java       # 驳回流程参数
│   │   ├── FlowCancelBo.java        # 取消流程参数
│   │   ├── FlowTerminationBo.java   # 终止流程参数
│   │   ├── FlowInvalidBo.java       # 作废流程参数
│   │   └── ...
│   ├── vo/                          # 视图对象 (10个)
│   │   ├── FlowTaskVo.java          # 任务视图
│   │   ├── FlowHisTaskVo.java       # 历史任务视图
│   │   ├── FlowInstanceVo.java      # 实例视图
│   │   ├── FlowDefinitionVo.java    # 定义视图
│   │   └── ...
│   ├── FlowInstanceBizExt.java      # 业务扩展实体
│   ├── FlowCategory.java            # 分类实体
│   └── FlowSpel.java                # SPEL 规则实体
├── mapper/                          # 数据访问 (6个)
│   ├── FlwTaskMapper.java
│   ├── FlwInstanceMapper.java
│   ├── FlwCategoryMapper.java
│   └── ...
├── handler/                         # 处理器
│   ├── FlowProcessEventHandler.java # 流程事件处理
│   └── WorkflowPermissionHandler.java # 权限处理（实现 org.dromara.warm.flow.core.spi.PermissionHandler）
├── listener/                        # 监听器
│   └── WorkflowGlobalListener.java  # 全局监听器（实现 org.dromara.warm.flow.core.spi.GlobalListener）
└── rule/                            # 规则引擎
    └── SpelRuleComponent.java       # SPEL 规则组件
```

**与引擎的调用方式：** Warm-Flow 2.x 删除了 1.8.9 的 `FlowParams`，`FlwTaskServiceImpl` / `FlwInstanceServiceImpl` 统一通过 `FlowEngine.workflow()` 加命令对象驱动引擎（命令类位于 `org.dromara.warm.flow.core.workflow.command`，上下文位于 `org.dromara.warm.flow.core.workflow.context`）：

| 业务操作 | 命令 | 调用 |
|----------|------|------|
| 启动流程 | `StartCommand` | `FlowEngine.workflow().start(command)` |
| 办理任务 | `CompleteCommand` | `FlowEngine.workflow().complete(command)` |
| 驳回任务 | `RejectCommand` | `FlowEngine.workflow().reject(command)` |
| 终止 / 作废 | `TerminateCommand` | `FlowEngine.workflow().terminate(command)` |
| 撤销流程 | `RevokeCommand` | `FlowEngine.workflow().revoke(command)` |
| 委派 / 转办 | `DelegateCommand` / `TransferCommand` | `delegate(command)` / `transfer(command)` |
| 加签 / 减签 | `AddSignerCommand` / `RemoveSignerCommand` | `addSigner(command)` / `removeSigner(command)` |

办理人通过 `OperatorContext` 传入，监听器里通过 `ListenerVariable#getContext()` 拿到 `WorkflowContext`（1.8.9 为 `getFlowParams()`）。

### 流程执行流程

工作流的核心执行流程如下：

```text
┌──────────────────────────────────────────────────────────────────┐
│ 1. 启动流程 (startWorkFlow)                                       │
│    ├─ 验证流程定义和业务数据                                        │
│    ├─ 创建 flow_instance 流程实例                                  │
│    ├─ 创建 flow_instance_biz_ext 业务扩展                          │
│    ├─ 创建首个 flow_task 待办任务                                   │
│    ├─ 发布 ProcessStartEvent 事件                                  │
│    └─ 返回 StartProcessReturnDTO                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. 办理任务 (completeTask)                                        │
│    ├─ 验证任务权限和办理人                                          │
│    ├─ 处理办理时手动选择的抄送人 (flowCopyList)                     │
│    ├─ 执行业务逻辑验证                                              │
│    ├─ 计算下一节点 (listNextNodes)                                 │
│    │   ├─ 互斥网关: 根据条件选择分支                                 │
│    │   └─ 并行网关: 同时创建多个任务                                 │
│    ├─ 生成新任务或结束流程                                          │
│    │   ├─ 节点抄送: 引擎按 node_config.copy 自动抄送                │
│    │   └─ 自动审批: 引擎按 def_config.autoPass 自动通过(auto_pass) │
│    ├─ 当前任务移入历史 (flow_his_task)                              │
│    ├─ 发送通知 (邮件/短信/SSE)                                      │
│    ├─ 发布 ProcessCompleteEvent 事件                               │
│    └─ 返回办理结果                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. 驳回/退回 (rejectTask/backProcess)                             │
│    ├─ 获取可驳回的前置节点列表                                       │
│    ├─ 验证驳回目标节点有效性                                         │
│    ├─ 创建新任务回退到指定节点                                       │
│    ├─ 更新流程状态为 back                                           │
│    ├─ 发送驳回通知                                                  │
│    └─ 发布 ProcessRejectEvent 事件                                 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. 流程结束                                                        │
│    ├─ 到达结束节点（实例当前节点为结束节点且无待办任务）            │
│    ├─ 更新 flow_instance 状态为已完成 (finish)                      │
│    ├─ 所有任务移入历史表                                            │
│    ├─ 发布 ProcessEndEvent 事件                                    │
│    └─ 触发业务回调                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**流程完成判定：** `WorkflowGlobalListener` 只有在实例当前节点是结束节点（`NodeType.isEnd(instance.getNodeType())`）且该实例已无待办任务时，才把实例状态改为 `finish` 并发布完成事件。Warm-Flow 2.x 的流程可能停在定时 / 消息等待事件上，此时同样没有待办任务，仅以「无待办」判断会把仍在等待的实例误判为已完成。

### 数据库 ER 图

工作流核心数据表关系：

```text
┌─────────────────┐       ┌─────────────────┐
│ flow_definition │───────│   flow_node     │
│ (流程定义)       │ 1:N   │   (流程节点)     │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ flow_code       │       │ definition_id   │
│ flow_name       │       │ node_code       │
│ version         │       │ node_name       │
│ is_publish      │       │ node_type       │
│ category        │       │ permission_flag │
└─────────────────┘       └─────────────────┘
         │                         │
         │ 1:N                     │
         ↓                         │
┌─────────────────┐                │
│ flow_instance   │────────────────┘
│ (流程实例)       │
├─────────────────┤       ┌─────────────────┐
│ id              │───────│ flow_instance_  │
│ definition_id   │ 1:1   │ biz_ext         │
│ business_id     │       │ (业务扩展)       │
│ flow_status     │       ├─────────────────┤
│ create_by       │       │ instance_id     │
└─────────────────┘       │ business_code   │
         │                │ business_title  │
         │ 1:N            └─────────────────┘
         ↓
┌─────────────────┐       ┌─────────────────┐
│   flow_task     │───────│ flow_his_task   │
│   (待办任务)     │ 办理后 │ (历史任务)       │
├─────────────────┤  移入  ├─────────────────┤
│ id              │       │ id              │
│ instance_id     │       │ instance_id     │
│ node_code       │       │ node_code       │
│ node_name       │       │ flow_status     │
│ assignee_ids    │       │ message         │
└─────────────────┘       └─────────────────┘
```

---

## 核心概念

### 流程定义 (Definition)

流程定义是工作流的模板，描述了一个业务流程的完整结构，包括节点、连线、条件等。流程定义可以通过可视化设计器创建，也可以通过 JSON 导入。

**流程定义属性：**

| 属性 | 说明 |
|------|------|
| flowCode | 流程编码，全局唯一标识 |
| flowName | 流程名称 |
| version | 版本号 |
| isPublish | 是否已发布 (0: 未发布, 1: 已发布) |
| category | 流程分类 ID |
| formCustom | 是否自定义表单 (Y/N) |
| formPath | 表单路径 |

**流程定义生命周期：**

```text
创建 → 设计 → 保存 → 发布 → 使用 → 取消发布 → 修改 → 重新发布
                              ↓
                         挂起/激活
```

### 流程实例 (Instance)

流程实例是流程定义的运行态，代表一次具体的业务流程执行。每次启动流程都会创建一个新的流程实例。

**流程实例状态（业务状态）：**

实例状态记录在 `flow_instance.flow_status`，由 `BusinessStatusEnum`（`plus.ruoyi.common.core.enums`）定义，编码与引擎 2.x 的 `FlowStatus` 一致，字典为 `wf_business_status`：

| 状态码 | 状态名 | 说明 |
|--------|--------|------|
| `draft` | 草稿 | 已发起、申请人尚未提交 |
| `waiting` | 待审核 | 流程运行中，有待办任务（也包括停在事件等待上的实例） |
| `back` | 已退回 | 退回到申请人节点 |
| `cancel` | 已撤销 | 申请人主动撤销 |
| `finish` | 已完成 | 流程已到达结束节点 |
| `invalid` | 已作废 | 流程被作废 |
| `termination` | 已终止 | 流程被终止 |
| `restart` | 已重启 | 2.x 新增编码，当前引擎版本不会主动写入，仅用于状态描述与字典翻译 |

> 「挂起 / 激活」是实例的激活状态（`activeInstance` 接口），与 `flow_status` 相互独立。

**业务扩展信息：**

RuoYi-Plus 通过 `FlowInstanceBizExt` 实体扩展了流程实例的业务信息：

```java
public class FlowInstanceBizExt {
    /**
     * 流程实例 ID
     */
    private Long instanceId;

    /**
     * 业务 ID (关联业务表主键)
     */
    private String businessId;

    /**
     * 业务编码 (如: LEAVE_202401001)
     */
    private String businessCode;

    /**
     * 业务标题 (如: 张三的年假申请)
     */
    private String businessTitle;
}
```

### 任务状态 (TaskStatus)

任务状态记录在 `flow_task.flow_status`（待办）与 `flow_his_task.flow_status`（审批历史），取值与 Warm-Flow 2.x 引擎 `TaskStatus` 的编码一致，另加本项目会主动写入的「撤销」「终止」。`TaskStatusEnum` 共 9 个取值：

| 状态码 | 状态名 | 说明 |
|--------|--------|------|
| `pending` | 待审批 | 运行中的待办任务 |
| `pass` | 通过 | 审批通过，流转到下一节点 |
| `auto_pass` | 自动审批 | 引擎按流程定义 `def_config` 中的 `autoPass` 自动通过 |
| `back` | 退回 | 驳回到上一节点或指定节点 |
| `invalid` | 失效 | 任务被作废，或会签 / 票签中被其他人决定后失效 |
| `take_back` | 拿回 | 办理人把已办任务拿回重新处理 |
| `copy` | 抄送 | 抄送记录，不参与审批 |
| `cancel` | 撤销 | 撤销流程时本项目显式写入 |
| `termination` | 终止 | 流程被终止 |

**状态枚举定义：**

```java
@Getter
@AllArgsConstructor
public enum TaskStatusEnum {

    PENDING("pending", "待审批"),
    PASS("pass", "通过"),
    AUTO_PASS("auto_pass", "自动审批"),
    BACK("back", "退回"),
    INVALID("invalid", "失效"),
    TAKE_BACK("take_back", "拿回"),
    COPY("copy", "抄送"),
    CANCEL("cancel", "撤销"),
    TERMINATION("termination", "终止");

    private final String status;
    private final String desc;

    /**
     * 判断状态是否为通过或退回
     */
    public static boolean isPassOrBack(String status) {
        return PASS.getStatus().equals(status) || BACK.getStatus().equals(status);
    }
}
```

### 协作方式 (CooperateType)

转办、委派、加签、减签在 2.x 不再是任务状态，而是记在 `flow_his_task.cooperate_type`（`varchar(20)`，默认 `none`），取值为引擎 `org.dromara.warm.flow.core.enums.CooperateType` 的编码：

| 编码 | 名称 | 说明 |
|------|------|------|
| `none` | 无 | 普通审批（会签 / 票签 / 抄送也不落此列） |
| `transfer` | 转办 | 任务转交给其他人办理 |
| `delegate` | 委派 | 委托他人代为办理 |
| `add_signer` | 加签 | 增加审批人 |
| `remove_signer` | 减签 | 移除审批人 |

协作操作产生的历史记录，其 `flow_status` 与 `cooperate_type` 相同（如转办历史的 `flow_status = transfer`）。`FlowHisTaskVo` 中 `cooperateType` 为 `String`，并附带由引擎枚举翻译的 `cooperateTypeName`。

**任务状态字典 `wf_task_status`：** 除任务状态外还包含协作编码（对应协作历史的 `flow_status`），共 13 项：`pending` 待审批、`pass` 通过、`auto_pass` 自动审批、`copy` 抄送、`back` 退回、`take_back` 拿回、`invalid` 失效、`cancel` 撤销、`transfer` 转办、`delegate` 委派、`add_signer` 加签、`remove_signer` 减签、`termination` 已终止。

### 办理人类型 (AssigneeType)

办理人类型定义了用户在任务中的角色和权限：

| 类型码 | 类型名 | 说明 |
|--------|--------|------|
| `1` | 审批人 | 负责审核任务，具有完整的办理权限 |
| `2` | 转办人 | 可以将任务转交给其他人 |
| `3` | 委托人 | 可以委托他人代为处理 |
| `4` | 抄送人 | 仅接收通知，不参与审批 |

**办理人类型枚举：**

```java
@Getter
@AllArgsConstructor
public enum TaskAssigneeType {

    /**
     * 待办任务的审批人权限
     */
    APPROVER("1", "待办任务的审批人权限"),

    /**
     * 待办任务的转办人权限
     */
    TRANSFER("2", "待办任务的转办人权限"),

    /**
     * 待办任务的委托人权限
     */
    DELEGATE("3", "待办任务的委托人权限"),

    /**
     * 待办任务的抄送人权限
     */
    COPY("4", "待办任务的抄送人权限");

    private final String code;
    private final String description;
}
```

### 节点类型 (NodeType)

工作流支持以下节点类型（引擎 `org.dromara.warm.flow.core.enums.NodeType`）：

| 类型值 | 节点类型 | 说明 |
|--------|----------|------|
| `0` | 开始节点 | 流程起点，每个流程有且仅有一个 |
| `1` | 中间节点 | 审批节点，需要办理人处理 |
| `2` | 结束节点 | 流程终点，可以有多个 |
| `3` | 互斥网关 | 条件分支，根据条件选择一条路径 |
| `4` | 并行网关 | 并行分支，同时执行多条路径 |
| `5` | 包容网关 | 引擎 `INCLUSIVE` 类型 |
| `6` | 服务任务 | 引擎 `SERVICE` 类型，需实现 `ServiceTaskHandler`，本项目暂未接入（见升级章节） |

> 2.x 的事件节点（定时 / 消息 / 错误 / 终止结束等）不是独立的节点类型，而是通过 `flow_node.event_type` 标识，相关列还有 `event_name`、`attached_to_node_code`、`interrupting`。

**节点示例：**

```text
       ┌──────────────┐
       │   开始节点    │ (nodeType: 0)
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │   提交申请    │ (nodeType: 1)
       └──────┬───────┘
              ↓
       ┌──────────────┐
       │   互斥网关    │ (nodeType: 3)
       └──────┬───────┘
         ↙         ↘
┌─────────────┐ ┌─────────────┐
│ 部门经理审批 │ │ 直接通过    │ (条件: amount < 1000)
│(amount>=1000)│ └──────┬──────┘
└──────┬──────┘        │
       ↓               │
┌──────────────┐       │
│   财务审批    │       │
└──────┬───────┘       │
       ↓               ↓
       ┌───────────────┐
       │    结束节点    │ (nodeType: 2)
       └───────────────┘
```

---

## API 概览

### 任务管理 API

任务管理是工作流的核心功能，提供任务的启动、办理、查询等操作。

**基础路径：** `/workflow/task`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/startWorkFlow` | 启动流程 |
| POST | `/completeTask` | 办理任务 |
| GET | `/pageWaitingTasks` | 查询当前用户待办任务 |
| GET | `/pageFinishedTasks` | 查询当前用户已办任务 |
| GET | `/pageAllWaitingTasks` | 查询所有待办任务 |
| GET | `/pageAllFinishedTasks` | 查询所有已办任务 |
| GET | `/pageCopyTasks` | 查询抄送列表 |
| GET | `/getTask/{taskId}` | 获取任务详情 |
| POST | `/listNextNodes` | 获取下一节点信息 |
| POST | `/terminateTask` | 终止任务 |
| POST | `/rejectTask` | 驳回任务 |
| POST | `/taskOperation/{operation}` | 任务操作 (转办/委托/加签/减签) |
| PUT | `/updateAssignee/{userId}` | 修改办理人 |
| GET | `/listRejectableNodes/{taskId}/{nodeCode}` | 获取可驳回节点 |
| GET | `/listTaskAssignees/{taskId}` | 获取任务办理人 |
| POST | `/urgeTask` | 催办任务 |

**启动流程示例：**

```java
// 请求参数
StartProcessBo startBo = new StartProcessBo();
startBo.setBusinessId("LEAVE_001");           // 业务 ID
startBo.setFlowCode("leave_flow");            // 流程编码
startBo.setHandler("user_001");               // 办理人 (可选)
startBo.setVariables(Map.of(                  // 流程变量
    "days", 3,
    "reason", "年假"
));
startBo.setBizExt(new FlowInstanceBizExt()    // 业务扩展
    .setBusinessCode("LEAVE_202401001")
    .setBusinessTitle("张三的年假申请"));

// 响应结果
StartProcessReturnDTO result = flwTaskService.startWorkFlow(startBo);
// result.getInstanceId()  - 流程实例 ID
// result.getTaskId()      - 首个任务 ID
```

**办理任务示例：**

```java
// 请求参数
CompleteTaskBo completeBo = new CompleteTaskBo();
completeBo.setTaskId(1001L);                  // 任务 ID
completeBo.setMessage("同意申请");             // 审批意见
completeBo.setFileId("file_001,file_002");    // 附件 ID
completeBo.setMessageType(List.of("email", "sms")); // 通知方式
completeBo.setFlowCopyList(List.of(           // 抄送人
    new FlowCopyBo().setUserId("user_002")
));
completeBo.setVariables(Map.of(               // 流程变量
    "approved", true
));

// 执行办理
boolean success = flwTaskService.completeTask(completeBo);
```

### 流程定义 API

流程定义管理提供流程的增删改查、发布、导入导出等功能。

**基础路径：** `/workflow/definition`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/pageFlowDefinitions` | 分页查询已发布流程 |
| GET | `/pageUnpublishedDefinitions` | 分页查询未发布流程 |
| GET | `/getFlowDefinition/{id}` | 获取流程定义详情 |
| POST | `/addFlowDefinition` | 新增流程定义 |
| PUT | `/updateFlowDefinition` | 修改流程定义 |
| PUT | `/publishDefinition/{id}` | 发布流程定义 |
| PUT | `/unpublishDefinition/{id}` | 取消发布 |
| DELETE | `/deleteFlowDefinitions/{ids}` | 删除流程定义 |
| POST | `/copyFlowDefinition/{id}` | 复制流程定义 |
| POST | `/importFlowDefinition` | 导入流程定义 |
| POST | `/exportFlowDefinition/{id}` | 导出流程定义 |
| GET | `/getFlowDefinitionJson/{id}` | 获取流程 JSON |
| PUT | `/activeFlowDefinition/{id}` | 激活/挂起流程 |

### 流程实例 API

流程实例管理提供实例的查询、撤销、删除等功能。

**基础路径：** `/workflow/instance`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/pageRunningInstances` | 查询运行中的实例 |
| GET | `/pageFinishedInstances` | 查询已完成的实例 |
| GET | `/pageCurrentInstances` | 查询当前用户发起的实例 |
| GET | `/getInstance/{businessId}` | 根据业务 ID 查询实例 |
| GET | `/getFlowHistory/{businessId}` | 获取流程历史记录 |
| GET | `/getVariable/{instanceId}` | 获取流程变量 |
| PUT | `/cancelInstance` | 撤销流程 |
| PUT | `/activeInstance/{id}` | 激活/挂起实例 |
| PUT | `/updateVariable` | 修改流程变量 |
| POST | `/invalidInstance` | 作废流程 |
| DELETE | `/deleteByBusinessIds/{ids}` | 按业务 ID 删除 |
| DELETE | `/deleteByInstanceIds/{ids}` | 按实例 ID 删除 |

### 流程分类 API

流程分类用于组织管理流程定义。

**基础路径：** `/workflow/category`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/listCategory` | 查询分类列表 |
| GET | `/listCategoryTree` | 查询分类树 |
| GET | `/getCategory/{id}` | 获取分类详情 |
| POST | `/addCategory` | 新增分类 |
| PUT | `/updateCategory` | 修改分类 |
| DELETE | `/deleteCategory/{ids}` | 删除分类 |

---

## 业务集成

### 请假流程示例

系统内置了完整的请假流程示例，展示如何将工作流与业务系统集成。

**1. 定义业务实体**

```java
/**
 * 请假实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("test_leave")
public class TestLeave extends BaseEntity {

    /**
     * 主键（雪花ID）
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 申请编号
     */
    private String applyCode;

    /**
     * 请假类型
     */
    private String leaveType;

    /**
     * 开始时间
     */
    private Date startDate;

    /**
     * 结束时间
     */
    private Date endDate;

    /**
     * 请假天数
     */
    private Integer leaveDays;

    /**
     * 请假原因
     */
    private String remark;

    /**
     * 状态（与流程状态 BusinessStatusEnum 同步：draft / waiting / finish / back ...）
     */
    private String status;
}
```

**2. 启动请假流程**

```java
@ConditionalOnEnable
@RequiredArgsConstructor
@Service
public class TestLeaveServiceImpl implements ITestLeaveService {

    private final ITestLeaveDao testLeaveDao;
    private final WorkflowService workflowService;

    /**
     * 提交请假并发起流程（后端发起，启动后自动办理申请人节点）
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public TestLeaveVo submitAndFlowStart(TestLeaveBo bo) {
        long day = DateUtil.betweenDay(bo.getStartDate(), bo.getEndDate(), true);
        // 截止日期也算一天
        bo.setLeaveDays((int) day + 1);
        if (ObjectUtil.isNull(bo.getId())) {
            bo.setApplyCode(System.currentTimeMillis() + StrUtil.EMPTY);
        }
        // 1. 保存请假数据
        TestLeave leave = MapstructUtils.convert(bo, TestLeave.class);
        boolean flag = testLeaveDao.save(leave) > 0;
        if (flag) {
            bo.setId(leave.getId());
            // 后端发起需要忽略权限
            bo.getParams().put("ignore", true);

            // 2. 启动工作流：variables 必须是可变 Map，启动时会写入 initiator 等内置变量
            StartProcessDTO startProcess = new StartProcessDTO();
            startProcess.setBusinessId(leave.getId().toString());
            startProcess.setFlowCode(StringUtils.isEmpty(bo.getFlowCode()) ? "leave1" : bo.getFlowCode());
            startProcess.setVariables(bo.getParams());

            boolean flag1 = workflowService.startCompleteTask(startProcess);
            if (!flag1) {
                throw new ServiceException("流程发起异常");
            }
        }
        return MapstructUtils.convert(leave, TestLeaveVo.class);
    }
}
```

**3. 处理审批回调**

项目里没有 `FlowListener` 这类业务回调接口。引擎全局监听器 `WorkflowGlobalListener`（实现 `org.dromara.warm.flow.core.spi.GlobalListener`）在任务完成时通过 `FlowProcessEventHandler` 发布 Spring 事件 `ProcessEvent` / `ProcessTaskEvent` / `ProcessDeleteEvent`，业务模块用 `@EventListener` 按 `flowCode` 过滤监听即可（请假示例就写在 `TestLeaveServiceImpl` 里）：

```java
/**
 * 总体流程监听（草稿、撤销、退回、作废、终止、已完成等）
 * 正常使用只需 #processEvent.flowCode=='leave1'
 */
@EventListener(condition = "#processEvent.flowCode.startsWith('leave')")
public void processHandler(ProcessEvent processEvent) {
    TestLeave testLeave = testLeaveDao.getById(Convert.toLong(processEvent.getBusinessId()));
    // 流程状态（BusinessStatusEnum 编码）直接同步到业务单
    testLeave.setStatus(processEvent.getStatus());
    // 办理参数：hisTaskExt 附件、handler 办理人、message 办理意见
    Map<String, Object> params = processEvent.getParams();
    if (processEvent.getSubmit()) {
        // 申请人提交
        if (StringUtils.isBlank(testLeave.getApplyCode())) {
            testLeave.setApplyCode(MapUtil.getStr(params, "businessCode", StrUtil.EMPTY));
        }
        testLeave.setStatus(BusinessStatusEnum.WAITING.getStatus());
    }
    testLeaveDao.updateById(testLeave);
}

/**
 * 流程删除监听：删除流程实例时同步删除业务数据
 */
@EventListener(condition = "#processDeleteEvent.flowCode.startsWith('leave')")
public void processDeleteHandler(ProcessDeleteEvent processDeleteEvent) {
    TestLeave testLeave = testLeaveDao.getById(Convert.toLong(processDeleteEvent.getBusinessId()));
    if (ObjectUtil.isNull(testLeave)) {
        return;
    }
    testLeaveDao.deleteById(testLeave.getId());
}
```

### 自定义业务流程

创建自定义业务流程的步骤：

**步骤 1：创建业务表**

```sql
CREATE TABLE `order_approval` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    `applicant` VARCHAR(64) NOT NULL COMMENT '申请人',
    `status` VARCHAR(32) DEFAULT 'draft' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) COMMENT='订单审批表';
```

**步骤 2：设计流程定义**

在流程设计器中创建订单审批流程：

```text
开始 → 提交申请 → [金额判断]
                    ├─ amount < 10000 → 部门经理审批 → 结束
                    └─ amount >= 10000 → 部门经理审批 → 财务总监审批 → 结束
```

**步骤 3：实现业务服务**

```java
@Service
@RequiredArgsConstructor
public class OrderApprovalServiceImpl implements IOrderApprovalService {

    private final IFlwTaskService flwTaskService;
    private final OrderApprovalMapper orderMapper;

    /**
     * 提交订单审批
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitOrder(OrderApprovalBo bo) {
        // 保存业务数据
        OrderApproval order = BeanUtil.toBean(bo, OrderApproval.class);
        order.setStatus("submitted");
        orderMapper.insert(order);

        // 启动审批流程
        StartProcessBo startBo = new StartProcessBo();
        startBo.setBusinessId(order.getId().toString());
        startBo.setFlowCode("order_approval");
        startBo.setBizExt(new FlowInstanceBizExt()
            .setBusinessCode(order.getOrderNo())
            .setBusinessTitle("订单审批-" + order.getOrderNo()));
        // 必须用可变 Map：startWorkFlow 会往里写入 initiator / initiatorDeptId / businessId
        Map<String, Object> variables = new HashMap<>();
        variables.put("amount", order.getAmount());
        variables.put("orderNo", order.getOrderNo());
        startBo.setVariables(variables);

        flwTaskService.startWorkFlow(startBo);
    }

    /**
     * 查询我的订单审批
     */
    @Override
    public PageResult<OrderApprovalVo> pageMyOrders(OrderApprovalBo bo, PageQuery pageQuery) {
        // 查询业务数据
        Page<OrderApproval> page = orderMapper.selectPage(pageQuery.build(),
            Wrappers.<OrderApproval>lambdaQuery()
                .eq(OrderApproval::getApplicant, LoginHelper.getUserId())
                .orderByDesc(OrderApproval::getCreateTime));

        PageResult<OrderApprovalVo> pageResult = PageResult.of();
        pageResult.setRecords(MapstructUtils.convert(page.getRecords(), OrderApprovalVo.class));
        pageResult.setTotal(page.getTotal());
        return pageResult;
    }
}
```

---

## 消息通知

### 通知类型

工作流支持三种消息通知方式：

| 编码（`MessageTypeEnum`） | 说明 | 配置模块 |
|------|------|----------|
| `1` | 站内信（SSE 实时推送） | ruoyi-common-sse |
| `2` | 邮件通知 | ruoyi-common-mail |
| `3` | 短信通知（`FlwCommonServiceImpl` 中为注释示例，需自行接入短信模板） | ruoyi-common-sms |

### 配置通知

在办理任务时指定通知方式：

```java
CompleteTaskBo completeBo = new CompleteTaskBo();
completeBo.setTaskId(taskId);
completeBo.setMessage("审批通过");

// 指定通知方式（MessageTypeEnum 编码：1 站内信、2 邮件、3 短信）
completeBo.setMessageType(List.of("1", "2"));

// 自定义通知内容
completeBo.setNotice("您的申请已通过审批，请及时查看。");

flwTaskService.completeTask(completeBo);
```

### 抄送配置

办理任务时可以添加抄送人：

```java
CompleteTaskBo completeBo = new CompleteTaskBo();
completeBo.setTaskId(taskId);

// 配置抄送人
List<FlowCopyBo> copyList = new ArrayList<>();

// FlowCopyBo.userId 为 Long 类型的用户ID
FlowCopyBo copy1 = new FlowCopyBo();
copy1.setUserId(1L);
copy1.setUserName("张三");
copyList.add(copy1);

FlowCopyBo copy2 = new FlowCopyBo();
copy2.setUserId(2L);
copy2.setUserName("李四");
copyList.add(copy2);

completeBo.setFlowCopyList(copyList);
flwTaskService.completeTask(completeBo);
```

办理时手动选择的抄送人由 `FlwTaskServiceImpl#setCopy` 交给引擎 `taskService.copy(...)` 留痕：引擎写一条 `flow_status = copy` 的历史记录，抄送人记在 `flow_user`（`type = '4'`），其 `associated` 关联的是**抄送历史的主键 `flow_his_task.id`**（1.8.9 时代关联的是 `flow_his_task.task_id`）。

**节点抄送与自动审批改由引擎配置：**

| 能力 | 1.8.9 | 2.1.1 |
|------|-------|-------|
| 节点抄送 | 节点扩展属性 `ext` 中的抄送设置（`CopySettingEnum`） | 引擎节点配置 `flow_node.node_config.copy`，在设计器中配置，流转时由引擎自动抄送；角色 / 部门会经 `WorkflowPermissionHandler#convertPermissions` 展开成用户 |
| 自动审批 | 流程定义 `ext.autoPass` + 本项目递归办理 | 引擎流程定义配置 `flow_definition.def_config.autoPass`，在设计器中配置，由引擎在办理链内自动通过并记为 `auto_pass` |

`CopySettingEnum` 与 `NodeExtVo.copySettings` 已删除，`FlwNodeExtServiceImpl` 解析节点扩展属性时会静默跳过旧的抄送配置；后台「流程定义」表单中的「自动审批」勾选也已移除，避免与设计器配置互相覆盖。

---

## 最佳实践

### 1. 流程设计规范

**命名规范：**

```text
流程编码: 业务类型_流程名称 (如: leave_annual, order_approval)
节点编码: node_功能描述 (如: node_submit, node_manager_approve)
变量名称: 小驼峰命名 (如: leaveDays, orderAmount)
```

**设计原则：**

- 每个流程只有一个开始节点和至少一个结束节点
- 使用互斥网关处理条件分支，避免使用复杂的条件嵌套
- 并行网关必须成对出现（分支和汇聚）
- 合理设置节点的办理人权限

### 2. 性能优化

**查询优化：**

```java
// 使用分页查询，避免一次性加载大量数据
PageResult<FlowTaskVo> tasks = flwTaskService.pageWaitingTasks(
    flowTaskBo,
    new PageQuery(20, 1)  // 构造参数为 (pageSize, pageNum)，限制每页数量
);

// 使用索引字段进行查询
flowTaskBo.setFlowCode("leave_flow");  // 使用流程编码过滤
```

**缓存策略：**

```java
// 流程定义可以缓存
@Cacheable(value = "workflow:definition", key = "#flowCode")
public Definition getDefinitionByCode(String flowCode) {
    // 引擎 DefService.getOne(T) 按实体非空字段等值查询
    return defService.getOne(new FlowDefinition()
        .setFlowCode(flowCode)
        .setIsPublish(PublishStatus.PUBLISHED.getKey()));
}
```

### 3. 异常处理

**统一异常处理：**

```java
@RestControllerAdvice
public class WorkflowExceptionHandler {

    /**
     * 引擎内部校验失败抛出 org.dromara.warm.flow.core.exception.FlowException
     */
    @ExceptionHandler(FlowException.class)
    public R<Void> handleFlowException(FlowException e) {
        log.error("工作流异常: {}", e.getMessage(), e);
        return R.fail("工作流处理失败: " + e.getMessage());
    }

    // 本项目业务层（如 FlwTaskServiceImpl）统一抛 ServiceException（如「流程任务不存在或任务已审批！」），
    // 已由框架全局异常处理器转换为 R.fail，无需另行定义「任务不存在」异常
}
```

### 4. 事务管理

**保证业务数据和流程数据一致性：**

```java
@Service
@RequiredArgsConstructor
public class LeaveService {

    @Transactional(rollbackFor = Exception.class)
    public void submitLeave(LeaveBo bo) {
        // 1. 保存业务数据
        Leave leave = saveLeave(bo);

        // 2. 启动流程 (在同一事务中)
        try {
            flwTaskService.startWorkFlow(buildStartBo(leave));
        } catch (Exception e) {
            // 流程启动失败，事务回滚
            throw new ServiceException("流程启动失败: " + e.getMessage());
        }
    }
}
```

### 5. 多租户配置

**租户隔离：**

工作流模块默认支持多租户：`flow_*` 引擎表都带 `tenant_id` 字段，由系统的租户插件（`tenant.enable`）按当前登录租户自动拼接过滤条件，无需额外配置 `warm-flow` 的租户处理器。新增租户时，`SysTenantServiceImpl` 会在 `warm-flow.enabled` 为 `true` 时调用 `WorkflowService#syncDef(tenantId)` 为新租户同步流程定义。

> ⚠️ 开启 `warm-flow.timer-enabled` 后，定时线程没有登录上下文，租户插件会给 `flow_event_wait` 的轮询与处理 SQL 都加上默认租户 `000000` 的条件，**非默认租户的定时事件不会触发**。详见「从 Warm-Flow 1.8.9 升级」中的「暂未接入的引擎能力」。

---

## 常见问题

### 1. 流程启动失败

**问题描述：** 调用 `startWorkFlow` 时抛出异常。

**可能原因：**

- 流程定义未发布
- 流程编码不存在
- 业务 ID 重复
- 办理人配置错误

**解决方案：**

```java
// 1. 检查流程是否已发布（startWorkFlow 内部同样会校验，未发布时抛「流程【xxx】未发布…」）
Definition def = defService.getOne(new FlowDefinition()
    .setFlowCode(flowCode)
    .setIsPublish(PublishStatus.PUBLISHED.getKey()));
if (def == null) {
    throw new ServiceException("流程未发布: " + flowCode);
}

// 2. 检查业务 ID 是否已存在（已存在时 startWorkFlow 会按 BusinessStatusEnum.checkStartStatus 校验能否重新提交）
Instance existing = insService.getOne(new FlowInstance().setBusinessId(businessId));
if (existing != null) {
    throw new ServiceException("该业务已启动流程");
}
```

### 2. 任务办理权限不足

**问题描述：** 办理任务时提示无权限。

**可能原因：**

- 当前用户不是任务办理人
- 任务已被其他人处理
- 办理人类型不匹配

**解决方案：**

```java
// 验证任务办理权限
FlowTaskVo task = flwTaskService.getById(taskId);
if (task == null) {
    throw new ServiceException("任务不存在");
}

String currentUser = LoginHelper.getUserId().toString();
if (!task.getAssigneeIds().contains(currentUser)) {
    throw new ServiceException("您不是该任务的办理人");
}
```

### 3. 驳回节点选择问题

**问题描述：** 驳回时找不到目标节点。

**可能原因：**

- 目标节点不在当前节点的前置路径上
- 流程定义中未配置可驳回节点

**解决方案：**

```java
// 获取可驳回的节点列表
List<Node> rejectableNodes = flwTaskService.listRejectableNodes(
    taskId,
    currentNodeCode
);

if (rejectableNodes.isEmpty()) {
    throw new ServiceException("当前节点不支持驳回");
}

// 选择驳回目标
BackProcessBo backBo = new BackProcessBo();
backBo.setTaskId(taskId);
backBo.setNodeCode(rejectableNodes.get(0).getNodeCode());
backBo.setMessage("资料不完整，请补充");

flwTaskService.rejectTask(backBo);
```

### 4. 并行网关同步问题

**问题描述：** 并行分支无法正确汇聚。

**可能原因：**

- 并行网关未正确闭合
- 分支数量与汇聚数量不匹配

**解决方案：**

确保并行网关正确配置：

```text
        ┌─────────────┐
        │  并行分支    │
        └─────┬───────┘
         ↙         ↘
┌──────────┐   ┌──────────┐
│  分支 A   │   │  分支 B   │
└────┬─────┘   └────┬─────┘
     ↘             ↙
     ┌─────────────┐
     │  并行汇聚    │  ← 必须等待所有分支完成
     └─────────────┘
```

### 5. 流程变量丢失

**问题描述：** 下一节点无法获取流程变量。

**可能原因：**

- 变量未正确传递
- 变量名拼写错误

**解决方案：**

```java
// 启动流程时设置变量
StartProcessBo startBo = new StartProcessBo();
startBo.setVariables(Map.of(
    "amount", 5000,
    "applicant", "张三"
));

// 办理任务时可以修改/添加变量
CompleteTaskBo completeBo = new CompleteTaskBo();
completeBo.setVariables(Map.of(
    "approved", true,
    "approver", "李四"
));

// 获取流程变量
Map<String, Object> variables = flwInstanceService.getVariable(instanceId);
```

### 6. 消息通知未发送

**问题描述：** 配置了消息通知但未收到。

**可能原因：**

- 通知模块未正确配置
- 用户联系方式缺失
- 消息队列阻塞

**解决方案：**

```java
// 1. 检查通知模块配置
// application.yml
spring:
  mail:
    host: smtp.qq.com
    username: xxx@qq.com
    password: xxx

sms:
  enabled: true
  # 短信配置...

// 2. 确保用户有联系方式
SysUser user = userService.getById(userId);
if (StrUtil.isBlank(user.getEmail())) {
    log.warn("用户 {} 未配置邮箱，跳过邮件通知", userId);
}

// 3. 检查消息发送日志
log.info("发送审批通知: 用户={}, 类型={}", userId, messageType);
```

---

## 扩展开发

### 自定义节点监听器

项目和引擎都没有 `NodeHandler` 接口。需要在某个节点上挂自定义逻辑时，用 Warm-Flow 的节点级监听器：实现 `org.dromara.warm.flow.core.spi.Listener`，注册为 Spring Bean，再在设计器节点的「监听器」中配置监听类型（`start` / `assignment` / `finish` / `create`，多个用逗号分隔）与监听器路径（类的全限定名，多个用 `@@` 分隔），引擎由 `ListenerUtil` 通过 `FrameInvoker.getBean` 取到该 Bean 执行。所有节点都要执行的逻辑则放在全局监听器 `WorkflowGlobalListener`（实现 `GlobalListener`）里。

```java
import org.dromara.warm.flow.core.entity.Node;
import org.dromara.warm.flow.core.spi.Listener;
import org.dromara.warm.flow.core.spi.ListenerVariable;

/**
 * 节点完成监听器：在设计器节点上配置 监听类型=finish、监听器路径=本类全限定名
 */
@Slf4j
@Component
public class LeaveManagerFinishListener implements Listener {

    @Override
    public void notify(ListenerVariable listenerVariable) {
        Node node = listenerVariable.getNode();
        Map<String, Object> variable = listenerVariable.getVariable();
        // 可读取实例 / 任务 / 下一批任务：getInstance()、getTask()、getNextTasks()
        // 办理上下文（办理人、意见、任务状态）：getContext()
        log.info("节点 {} 办理完成，业务ID: {}, 变量: {}",
            node.getNodeCode(), listenerVariable.getInstance().getBusinessId(), variable);
    }
}
```

> 自动审批无需自己实现：Warm-Flow 2.x 已内置该能力，在设计器中开启流程定义的自动审批（写入 `def_config.autoPass`）即可，自动通过的任务状态记为 `auto_pass`。

### 自定义事件监听

项目只发布三类 Spring 事件（`plus.ruoyi.common.core.domain.event`，由 `FlowProcessEventHandler` 发布），没有单独的「流程启动 / 任务完成 / 流程结束」事件：流程启动（申请人提交）与结束都体现为 `ProcessEvent`，用 `submit` 与 `status` 区分。

```java
@Slf4j
@Component
public class WorkflowEventListener {

    /**
     * 流程状态变化：申请人提交时 submit=true；status 为 BusinessStatusEnum 编码（finish 完成、back 退回、cancel 撤销、termination 终止、invalid 作废等）
     */
    @EventListener(condition = "#event.flowCode == 'leave1'")
    public void onProcessEvent(ProcessEvent event) {
        if (Boolean.TRUE.equals(event.getSubmit())) {
            log.info("流程提交: instanceId={}, businessId={}", event.getInstanceId(), event.getBusinessId());
        }
        if (BusinessStatusEnum.FINISH.getStatus().equals(event.getStatus())) {
            log.info("流程结束: instanceId={}, status={}", event.getInstanceId(), event.getStatus());
            // 触发业务回调
        }
    }

    /**
     * 新任务创建（也代表上一个任务办理完成）；params 中可取 handler 办理人、message 办理意见
     */
    @EventListener(condition = "#event.flowCode == 'leave1'")
    public void onTaskCreated(ProcessTaskEvent event) {
        log.info("任务创建: taskId={}, nodeCode={}, handler={}",
            event.getTaskId(), event.getNodeCode(), MapUtil.getStr(event.getParams(), "handler"));
    }

    /**
     * 流程实例删除
     */
    @EventListener(condition = "#event.flowCode == 'leave1'")
    public void onProcessDeleted(ProcessDeleteEvent event) {
        log.info("流程删除: businessId={}", event.getBusinessId());
    }
}
```

### 自定义 SPEL 规则

SpEL 表达式里可以用 `@beanName` 调用任意 Spring Bean 的方法，用 `#变量名` 引用流程变量。内置示例有两处：条件分支用的 `TestLeaveServiceImpl#eval`，办理人用的 `SpelRuleComponent#selectDeptLeaderById`。自定义规则照此写一个 Bean 即可：

```java
@Component
@RequiredArgsConstructor
public class CustomSpelRule {

    // 业务自己的用户服务，此处仅作示意
    private final UserService userService;

    /**
     * 条件分支：判断是否为 VIP 用户（返回 boolean）
     */
    public boolean isVipUser(String userId) {
        return userService.isVip(userId);
    }

    /**
     * 办理人：返回用户ID（单个或逗号分隔的多个）
     */
    public Long selectManager(Long initiatorDeptId) {
        return userService.getDeptManagerId(initiatorDeptId);
    }
}
```

在流程设计器中使用（条件选择 SpEL 类型，引擎存为 `spel@@` 前缀；内置请假流程即 `spel@@#{@testLeaveServiceImpl.eval(#leaveDays)}`）：

```text
条件表达式: #{@customSpelRule.isVipUser(#initiator)}
办理人表达式: #{@customSpelRule.selectManager(#initiatorDeptId)}
```

---

## 前端集成

### 工作流组件

前端提供了以下工作流相关组件：

| 组件 | 说明 | 路径 |
|------|------|------|
| ApprovalButton | 审批按钮组 | `views/workflow/components/ApprovalButton.vue` |
| ApprovalRecord | 审批记录 | `views/workflow/components/ApprovalRecord.vue` |
| FlowChart | 流程图展示 | `views/workflow/components/FlowChart.vue` |
| SubmitVerify | 提交验证 | `views/workflow/components/SubmitVerify.vue` |

### 待办任务页面

```vue
<template>
  <div class="task-waiting">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" inline>
      <el-form-item label="流程名称">
        <el-input v-model="queryParams.flowName" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 任务列表 -->
    <el-table :data="taskList" v-loading="loading">
      <el-table-column label="业务标题" prop="businessTitle" />
      <el-table-column label="流程名称" prop="flowName" />
      <el-table-column label="当前节点" prop="nodeName" />
      <el-table-column label="申请人" prop="createByName" />
      <el-table-column label="申请时间" prop="createTime" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="primary" @click="handleApprove(row)">
            办理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pageWaitingTasks } from '@/api/workflow/task/taskApi'

const router = useRouter()
const loading = ref(false)
const taskList = ref([])
const total = ref(0)
const queryParams = ref({
  flowName: '',
  pageNum: 1,
  pageSize: 10
})

const getList = async () => {
  loading.value = true
  // 项目 http 封装返回 [err, data] 元组
  const [err, data] = await pageWaitingTasks(queryParams.value)
  if (!err) {
    taskList.value = data.records
    total.value = data.total
  }
  loading.value = false
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const handleApprove = (row) => {
  // 跳转到审批页面
  router.push({
    path: row.formPath,
    query: { taskId: row.id, businessId: row.businessId }
  })
}

onMounted(() => {
  getList()
})
</script>
```

### 审批操作

```typescript
// api/workflow/task/taskApi.ts（http / Result 为全局自动导入，无需 import）

/**
 * 办理任务
 */
export const completeTask = (data: object): Result<any> => {
  return http.post('/workflow/task/completeTask', data)
}

/**
 * 驳回任务
 */
export const rejectTask = (data: any): Result<any> => {
  return http.post('/workflow/task/rejectTask', data)
}

/**
 * 获取可驳回节点
 */
export const listRejectableNodes = (taskId: string, nodeCode: string): Result<any> => {
  return http.get(`/workflow/task/listRejectableNodes/${taskId}/${nodeCode}`)
}
```

---

## 从 Warm-Flow 1.8.9 升级

工作流引擎已从 Warm-Flow 1.8.9 升级到 2.1.1。2.x 引擎读取新的表结构与状态编码，**升级代码必须同时迁移数据库**，不能只换 jar。

### 破坏性变更概要

| 类别 | 1.8.9 | 2.1.1 |
|------|-------|-------|
| Maven 坐标 | `org.dromara.warm` | `io.github.sgs98`（artifactId 不变，本项目用 `warm-flow-mybatis-plus-sb3-starter`） |
| 引擎调用 | `FlowParams` | `FlowEngine.workflow()` + `StartCommand` / `CompleteCommand` 等命令对象，`OperatorContext` / `WorkflowContext` |
| 扩展接口包路径 | `org.dromara.warm.flow.core.listener.GlobalListener` / `ListenerVariable`、`org.dromara.warm.flow.core.handler.PermissionHandler` | 迁到 `org.dromara.warm.flow.core.spi`，监听器内 `getFlowParams()` 改为 `getContext()` |
| 任务状态 | `waiting`、`depute`、`sign`、`sign_off`、`timeout` 等 | `pending` / `pass` / `auto_pass` / `back` / `invalid` / `take_back` / `copy`，本项目另写 `cancel` / `termination` |
| 实例状态 | — | 编码不变，新增 `restart` |
| 协作方式 | `flow_his_task.cooperate_type` 为 `tinyint`（数字码） | `varchar(20)`：`none` / `transfer` / `delegate` / `add_signer` / `remove_signer` |
| 抄送 | 本项目自行生成抄送历史，抄送人 `flow_user.associated` 关联 `flow_his_task.task_id` | 引擎 `taskService.copy()`，`associated` 关联 `flow_his_task.id`；节点抄送读 `node_config.copy` |
| 自动审批 | 流程定义 `ext.autoPass` | 流程定义 `def_config.autoPass`，由引擎处理 |
| 表结构 | — | `flow_definition` 加 `def_config`；`flow_node` 删 `version`，加 `node_config` / `event_type` / `event_name` / `attached_to_node_code` / `interrupting`；`flow_his_task` 加 `node_config`；`flow_instance.node_code` 加长到 100；新表 `flow_event_wait` |
| 配置 | — | 新增 `warm-flow.timer-enabled`（引擎默认 `false`，本项目未配置即关闭） |
| 流程完成判定 | 无待办即完成 | 到达结束节点且无待办才完成 |

本项目代码侧对应的调整：删除 `CopySettingEnum`、`NodeExtVo.copySettings`；`TaskStatusEnum` 改为新编码；`BusinessStatusEnum` 补 `RESTART`；`FlowHisTaskVo.cooperateType` 改为 `String`；`FlwTaskMapper.xml` 的抄送查询改为按 `flow_user.associated = flow_his_task.id` 关联；发布流程定义时增加事件节点与服务任务的校验（见「流程定义发布校验」）。前端「流程定义」页去掉自动审批勾选，设计器不再传 `onlyDesignShow`。

**语义变化需要注意：** 委派 / 转办 / 加签 / 减签不再写任务状态，改由 `cooperate_type` 记录；撤销写 `cancel`；作废走终止命令（实例 `invalid`、任务 `invalid`）。旧的自动审批与节点抄送配置**不迁移就会失效**。

### 数据库迁移脚本

全新安装直接执行全量脚本 `*_ry_plus_workflow.sql`（已是 2.1.1 结构），无需迁移。已用 1.8.9 跑过业务的存量库，执行 `script/sql/update/` 下与数据库类型匹配的一个脚本：

| 数据库 | 迁移脚本 | 最低版本 | 执行方式 |
|--------|----------|----------|----------|
| MySQL | `script/sql/update/mysql_workflow_warmflow2.sql` | 8.0.4（第 6 段用到 `JSON_TABLE`；5.7 跳过第 6 段并按 8.7 查询人工迁移抄送配置） | `mysql --default-character-set=utf8mb4 -uroot -p 库名 < script/sql/update/mysql_workflow_warmflow2.sql`，须在同一会话中从头执行 |
| Oracle | `script/sql/update/oracle_workflow_warmflow2.sql` | 12.1.0.2 | 用流程表属主用户，以 SQL*Plus / SQLcl / DBeaver「执行脚本」整体执行（PL/SQL 块以单独一行 `/` 结束） |
| PostgreSQL | `script/sql/update/postgres_workflow_warmflow2.sql` | 9.6 | 在流程表所在 schema 下 `psql -f` 执行，须同一会话；需要整体回滚可加 `-1` |
| SQL Server | `script/sql/update/sqlserver_workflow_warmflow2.sql` | 2016（第 6 段还要求数据库兼容级别 >= 130，不满足时该段自动跳过，改按 8.7 人工迁移） | `sqlcmd -b -I -f 65001 -d 库名 -i script/sql/update/sqlserver_workflow_warmflow2.sql`，同一连接执行 |

脚本按段执行：`1 DDL → 2 状态码迁移 → 3 协作方式 → 4 抄送人关联 → 5 自动审批配置 → 6 节点抄送配置 → 7 字典 → 8 校验查询`，第 1 ~ 7 段可重复执行，已迁移的数据不会被二次改写。

**主要映射规则：**

| 对象 | 旧值 → 新值 |
|------|-------------|
| 待办 `flow_task.flow_status` | `draft` / `waiting` → `pending`，`cancel` → `back` |
| 历史 `flow_his_task.flow_status` | `draft` → `pass`，`depute` → `delegate`，`sign` → `add_signer`，`sign_off` → `remove_signer` |
| 协作方式 `cooperate_type` | `0` / `1` / `4` / `5` → `none`，`2` → `transfer`，`3` → `delegate`，`6` → `add_signer`，`7` → `remove_signer` |
| 抄送人 `flow_user.associated`（`type = '4'`） | 旧 `task_id` → 对应抄送历史的 `flow_his_task.id`（仅在恰好匹配 1 条时改写） |
| 自动审批 | `flow_definition.ext.autoPass` → `def_config.autoPass` |
| 节点抄送 | `flow_node.ext` 中的纯数字抄送对象 → `node_config.copy` |
| 字典 `wf_task_status` | 按原主键改值（如 `waiting` → `pending`、`depute` → `delegate`、`timeout` → `take_back`），新增 `auto_pass`；`wf_business_status` 新增 `restart` |

实例状态 `flow_instance.flow_status` 的字符串编码与 2.x 一致，保持不变，只转换引擎遗留的数字码。

### 执行步骤与注意事项

1. **完整备份数据库**（至少 `flow_definition` / `flow_node` / `flow_instance` / `flow_task` / `flow_his_task` / `flow_user` / `sys_dict_data`），脚本会改写审批历史，无法自动回滚。
2. **停掉旧版（1.8.9）应用**：旧版会继续写入旧编码，混跑期间写入的数据不会被脚本覆盖。
3. 执行迁移脚本。
4. 部署 2.1.1 版本应用并启动。
5. 在「系统管理 → 缓存管理」**刷新字典缓存**，否则前端仍显示旧的任务状态文案。
6. 在「租户管理 → 同步租户字典」执行一次：脚本只给 `000000` 租户插入新增的两条字典，其他租户由该功能补齐。
7. 逐条执行脚本第 8 段的校验查询，按注释核对结果。

**需要人工处理的项**（第 8 段校验查询可查出）：

- 节点抄送配置中带角色 / 部门前缀等非纯数字 ID、节点已有 `node_config.copy`，或 `node_config` 不是合法 JSON 的节点，不会自动迁移
- 同一个抄送 `task_id` 对应多条抄送历史的抄送人记录
- 历史中的 `waiting` / `timeout` 记录：2.x 没有「超时」状态，脚本 2.5 段提供了改为 `invalid` 的注释语句，确认后手动执行
- 旧自动审批历史（`pass` + 固定意见「流程引擎自动审批！」）想统一显示为「自动审批」，可确认后执行脚本 2.4 段的注释语句
- 实例状态中的引擎数字码 `2` / `3` / `10` / `11`（本项目旧代码不会写入，正常应为 0 行）
- 旧抄送历史的 `task_id` 是旧代码临时生成的 ID，2.x 按「待办 + 抄送历史」做的抄送人查看权限校验对这些旧记录不生效；「我的抄送」列表按 `associated = flow_his_task.id` 查询，不受影响

> Oracle / SQL Server 版本的第 5、6 段只在目标列为空时写入（不做 JSON 合并），节点抄送只迁移恰好含 1 个旧抄送设置的节点，具体以各脚本文件头说明为准。

### 暂未接入的引擎能力

Warm-Flow 2.x 引擎具备以下能力，本项目目前暂未接入，设计器虽然能画出对应节点，但发布时会被拦截或需要额外开发：

| 能力 | 现状 |
|------|------|
| 定时事件（定时启动 / 定时捕获 / 定时边界） | 依赖 `warm-flow.timer-enabled`，项目默认关闭，含定时事件的流程无法发布。**多租户限制**：开启后定时线程没有登录上下文，`flow_event_wait` 的轮询与处理只会命中默认租户 `000000`，非默认租户的定时事件不会触发；接入前需让轮询忽略租户、处理时切换到记录所属租户 |
| 消息事件（消息启动 / 捕获 / 边界 / 抛出 / 结束） | 引擎提供 `InsService#triggerMessage` / `startByMessage`，本项目尚未提供对外触发接口，发布时一律拦截 |
| 错误事件 | 发布时一律拦截 |
| 服务任务 | 需开发者实现 `org.dromara.warm.flow.core.service.task.ServiceTaskHandler`，并在节点 `node_config` 中配置处理器（`type` / `handler`）；发布时校验处理器类 |
| 事件等待管理 | 引擎新增 `flow_event_wait` 表，本项目暂无对应管理页面 |
| 自由跳转 | 引擎支持，本项目未提供对应操作入口 |

> 终止结束事件（`TERMINATE_END`）不依赖触发器，可以正常发布使用，实例与业务单会记为 `termination`。

---

## 总结

RuoYi-Plus 工作流模块提供了完整的企业级工作流解决方案，具有以下优势：

1. **轻量高效** - 基于 Warm-Flow 引擎，启动快、占用低
2. **功能完善** - 支持复杂的审批场景和多种任务操作
3. **易于集成** - 提供完善的 API 和前端组件
4. **高度可扩展** - 支持自定义处理器、监听器、规则
5. **多租户支持** - 完整的数据隔离能力

如需更多帮助，请参考 Warm-Flow 官方文档或在项目中查看示例代码。
