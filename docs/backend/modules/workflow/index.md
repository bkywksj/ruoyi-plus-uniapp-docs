# 工作流模块

## 介绍

RuoYi-Plus 工作流模块是一个功能完善、高度可扩展的企业级工作流解决方案，基于 Dromara 开源社区的 Warm-Flow 工作流引擎深度集成开发。该模块提供了流程定义、流程实例、任务管理、消息通知等完整的工作流能力，支持复杂的业务审批场景，如请假审批、报销审批、合同审批等。

工作流模块采用轻量级设计理念，相比传统的 Activiti、Flowable 等重型工作流引擎，Warm-Flow 具有学习成本低、集成简单、性能优异等特点。同时，RuoYi-Plus 在 Warm-Flow 基础上进行了深度定制，增加了业务扩展表、SPEL 规则引擎、多种消息通知方式等企业级特性。

**核心特性：**

- **轻量级引擎** - 基于 Warm-Flow 1.8.1 版本，核心代码精简，启动快速，内存占用低
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
| Warm-Flow | 1.8.1 | 轻量级工作流引擎 |
| Spring Boot | 3.5.6 | 应用框架 |
| MyBatis-Plus | 3.5.14 | ORM 框架 |
| Sa-Token | 1.44.0 | 认证授权 |
| Redisson | 3.51.0 | 分布式锁 |

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
    <groupId>org.dromara.warm</groupId>
    <artifactId>warm-flow-mybatis-plus-sb3-starter</artifactId>
</dependency>

<!-- Warm Flow UI 插件 - 提供流程设计器界面 -->
<dependency>
    <groupId>org.dromara.warm</groupId>
    <artifactId>warm-flow-plugin-ui-sb-web</artifactId>
</dependency>
```

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

**RuoYi-Plus 扩展表：**

| 表名 | 说明 |
|------|------|
| `flow_instance_biz_ext` | 流程实例业务扩展表 |
| `flow_category` | 流程分类表 |
| `flow_spel` | SPEL 规则表 |
| `test_leave` | 请假测试表（示例） |

执行 SQL 脚本初始化数据库：

```bash
# 进入脚本目录
cd ruoyi-plus-uniapp-workflow/script/sql

# 执行 Warm-Flow 核心表脚本
mysql -u root -p your_database < warm-flow.sql

# 执行 RuoYi-Plus 扩展表脚本
mysql -u root -p your_database < workflow-ext.sql
```

### 配置文件

在 `application.yml` 中配置工作流相关参数：

```yaml
# Warm-Flow 工作流配置
warm-flow:
  # 是否启用工作流模块
  enabled: true
  # 数据填充处理器
  data-fill-handler-path: plus.ruoyi.workflow.handler.WorkflowDataFillHandler
  # 租户处理器
  tenant-handler-path: plus.ruoyi.workflow.handler.WorkflowTenantHandler
  # 流程设计器配置
  ui:
    # 是否启用设计器
    enabled: true
    # 设计器访问路径
    path: /workflow/designer
```

### 启动验证

启动应用后，可以通过以下方式验证工作流模块是否正常工作：

1. **访问流程设计器**

打开浏览器访问流程设计器界面：

```
http://localhost:8080/workflow/designer
```

2. **查看 API 文档**

访问 Swagger 文档查看工作流相关接口：

```
http://localhost:8080/doc.html#/workflow
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

```
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

```
plus.ruoyi.workflow
├── config/                          # 配置类
│   └── WarmFlowConfig.java          # Warm-Flow 配置
├── common/                          # 通用类
│   ├── ConditionalOnEnable.java     # 条件装配注解
│   ├── constant/
│   │   └── FlowConstant.java        # 流程常量
│   └── enums/                       # 枚举定义
│       ├── TaskStatusEnum.java      # 任务状态枚举
│       ├── TaskAssigneeType.java    # 办理人类型枚举
│       ├── ButtonPermissionEnum.java # 按钮权限枚举
│       ├── CopySettingEnum.java     # 抄送设置枚举
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
│   └── WorkflowPermissionHandler.java # 权限处理
├── listener/                        # 监听器
│   └── WorkflowGlobalListener.java  # 全局监听器
└── rule/                            # 规则引擎
    └── SpelRuleComponent.java       # SPEL 规则组件
```

### 流程执行流程

工作流的核心执行流程如下：

```
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
│    ├─ 处理抄送人 (flowCopyList)                                    │
│    ├─ 执行业务逻辑验证                                              │
│    ├─ 计算下一节点 (listNextNodes)                                 │
│    │   ├─ 互斥网关: 根据条件选择分支                                 │
│    │   └─ 并行网关: 同时创建多个任务                                 │
│    ├─ 生成新任务或结束流程                                          │
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
│    ├─ 到达结束节点                                                  │
│    ├─ 更新 flow_instance 状态为已完成                               │
│    ├─ 所有任务移入历史表                                            │
│    ├─ 发布 ProcessEndEvent 事件                                    │
│    └─ 触发业务回调                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 数据库 ER 图

工作流核心数据表关系：

```
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

```
创建 → 设计 → 保存 → 发布 → 使用 → 取消发布 → 修改 → 重新发布
                              ↓
                         挂起/激活
```

### 流程实例 (Instance)

流程实例是流程定义的运行态，代表一次具体的业务流程执行。每次启动流程都会创建一个新的流程实例。

**流程实例状态：**

| 状态 | 说明 |
|------|------|
| 运行中 | 流程正在执行，有待办任务 |
| 已完成 | 流程已到达结束节点 |
| 已撤销 | 申请人主动撤销 |
| 已终止 | 管理员强制终止 |
| 已作废 | 流程被作废 |
| 已挂起 | 流程暂停执行 |

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

任务状态描述了任务在流程中的处理结果，RuoYi-Plus 定义了 12 种任务状态：

| 状态码 | 状态名 | 说明 |
|--------|--------|------|
| `waiting` | 待审核 | 等待办理人处理 |
| `pass` | 通过 | 审批通过，流转到下一节点 |
| `back` | 退回 | 驳回到上一节点或指定节点 |
| `cancel` | 撤销 | 申请人撤回流程 |
| `termination` | 终止 | 管理员强制终止流程 |
| `invalid` | 作废 | 流程被作废 |
| `transfer` | 转办 | 转交给其他人办理 |
| `depute` | 委托 | 委托他人代为办理 |
| `copy` | 抄送 | 抄送通知，不参与审批 |
| `sign` | 加签 | 增加审批人 |
| `sign_off` | 减签 | 移除审批人 |
| `timeout` | 超时 | 任务超时未处理 |

**状态枚举定义：**

```java
@Getter
@AllArgsConstructor
public enum TaskStatusEnum {

    CANCEL("cancel", "撤销"),
    PASS("pass", "通过"),
    WAITING("waiting", "待审核"),
    INVALID("invalid", "作废"),
    BACK("back", "退回"),
    TERMINATION("termination", "终止"),
    TRANSFER("transfer", "转办"),
    DEPUTE("depute", "委托"),
    COPY("copy", "抄送"),
    SIGN("sign", "加签"),
    SIGN_OFF("sign_off", "减签"),
    TIMEOUT("timeout", "超时");

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

工作流支持以下节点类型：

| 类型值 | 节点类型 | 说明 |
|--------|----------|------|
| `0` | 开始节点 | 流程起点，每个流程有且仅有一个 |
| `1` | 中间节点 | 审批节点，需要办理人处理 |
| `2` | 结束节点 | 流程终点，可以有多个 |
| `3` | 互斥网关 | 条件分支，根据条件选择一条路径 |
| `4` | 并行网关 | 并行分支，同时执行多条路径 |

**节点示例：**

```
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
@TableName("test_leave")
public class TestLeave {

    @TableId(type = IdType.AUTO)
    private Long id;

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
    private String reason;

    /**
     * 状态 (draft/submitted/approved/rejected)
     */
    private String status;
}
```

**2. 启动请假流程**

```java
@Service
@RequiredArgsConstructor
public class TestLeaveServiceImpl implements ITestLeaveService {

    private final IFlwTaskService flwTaskService;
    private final TestLeaveMapper leaveMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitLeave(TestLeaveBo bo) {
        // 1. 保存请假数据
        TestLeave leave = BeanUtil.toBean(bo, TestLeave.class);
        leave.setStatus("submitted");
        leaveMapper.insert(leave);

        // 2. 启动工作流
        StartProcessBo startBo = new StartProcessBo();
        startBo.setBusinessId(leave.getId().toString());
        startBo.setFlowCode("leave_flow");
        startBo.setBizExt(new FlowInstanceBizExt()
            .setBusinessCode("LEAVE_" + leave.getId())
            .setBusinessTitle(LoginHelper.getNickname() + "的请假申请"));

        // 设置流程变量供条件判断
        startBo.setVariables(Map.of(
            "leaveDays", leave.getLeaveDays(),
            "leaveType", leave.getLeaveType()
        ));

        flwTaskService.startWorkFlow(startBo);
    }
}
```

**3. 处理审批回调**

```java
@Component
@RequiredArgsConstructor
public class LeaveFlowListener implements FlowListener {

    private final TestLeaveMapper leaveMapper;

    /**
     * 流程结束回调
     */
    @Override
    public void onProcessEnd(FlowEndEvent event) {
        String businessId = event.getBusinessId();
        String flowStatus = event.getFlowStatus();

        // 更新请假状态
        TestLeave leave = new TestLeave();
        leave.setId(Long.valueOf(businessId));

        if ("pass".equals(flowStatus)) {
            leave.setStatus("approved");
        } else if ("back".equals(flowStatus)) {
            leave.setStatus("rejected");
        }

        leaveMapper.updateById(leave);
    }
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

```
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
        startBo.setVariables(Map.of(
            "amount", order.getAmount(),
            "orderNo", order.getOrderNo()
        ));

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

        return PageResult.build(page, OrderApprovalVo.class);
    }
}
```

---

## 消息通知

### 通知类型

工作流支持三种消息通知方式：

| 类型 | 说明 | 配置模块 |
|------|------|----------|
| email | 邮件通知 | ruoyi-common-mail |
| sms | 短信通知 | ruoyi-common-sms |
| sse | SSE 实时推送 | ruoyi-common-sse |

### 配置通知

在办理任务时指定通知方式：

```java
CompleteTaskBo completeBo = new CompleteTaskBo();
completeBo.setTaskId(taskId);
completeBo.setMessage("审批通过");

// 指定通知方式
completeBo.setMessageType(List.of("email", "sms", "sse"));

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

FlowCopyBo copy1 = new FlowCopyBo();
copy1.setUserId("user_001");
copy1.setUserName("张三");
copyList.add(copy1);

FlowCopyBo copy2 = new FlowCopyBo();
copy2.setUserId("user_002");
copy2.setUserName("李四");
copyList.add(copy2);

completeBo.setFlowCopyList(copyList);
flwTaskService.completeTask(completeBo);
```

---

## 最佳实践

### 1. 流程设计规范

**命名规范：**

```
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
    PageQuery.of(1, 20)  // 限制每页数量
);

// 使用索引字段进行查询
flowTaskBo.setFlowCode("leave_flow");  // 使用流程编码过滤
```

**缓存策略：**

```java
// 流程定义可以缓存
@Cacheable(value = "workflow:definition", key = "#flowCode")
public FlowDefinition getDefinitionByCode(String flowCode) {
    return defService.getOne(Wrappers.<FlowDefinition>lambdaQuery()
        .eq(FlowDefinition::getFlowCode, flowCode)
        .eq(FlowDefinition::getIsPublish, 1));
}
```

### 3. 异常处理

**统一异常处理：**

```java
@RestControllerAdvice
public class WorkflowExceptionHandler {

    @ExceptionHandler(FlowException.class)
    public R<Void> handleFlowException(FlowException e) {
        log.error("工作流异常: {}", e.getMessage(), e);
        return R.fail("工作流处理失败: " + e.getMessage());
    }

    @ExceptionHandler(TaskNotFoundException.class)
    public R<Void> handleTaskNotFound(TaskNotFoundException e) {
        return R.fail("任务不存在或已被处理");
    }
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

工作流模块默认支持多租户，通过 `tenant_id` 字段实现数据隔离：

```yaml
# 配置租户处理器
warm-flow:
  tenant-handler-path: plus.ruoyi.workflow.handler.WorkflowTenantHandler
```

```java
/**
 * 工作流租户处理器
 */
@Component
public class WorkflowTenantHandler implements TenantHandler {

    @Override
    public String getTenantId() {
        return TenantHelper.getTenantId();
    }

    @Override
    public boolean isIgnore() {
        return TenantHelper.isIgnore();
    }
}
```

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
// 1. 检查流程是否已发布
FlowDefinition def = defService.getOne(Wrappers.<FlowDefinition>lambdaQuery()
    .eq(FlowDefinition::getFlowCode, flowCode)
    .eq(FlowDefinition::getIsPublish, 1));
if (def == null) {
    throw new ServiceException("流程未发布: " + flowCode);
}

// 2. 检查业务 ID 是否已存在
FlowInstance existing = insService.getOne(Wrappers.<FlowInstance>lambdaQuery()
    .eq(FlowInstance::getBusinessId, businessId));
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

```
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

### 自定义节点处理器

实现自定义的节点处理逻辑：

```java
@Component
public class CustomNodeHandler implements NodeHandler {

    @Override
    public void handle(FlowTask task, Map<String, Object> variables) {
        // 自定义处理逻辑
        String nodeCode = task.getNodeCode();

        if ("node_auto_approve".equals(nodeCode)) {
            // 自动审批逻辑
            autoApprove(task);
        }
    }

    private void autoApprove(FlowTask task) {
        // 实现自动审批
    }
}
```

### 自定义事件监听

监听工作流事件：

```java
@Component
@RequiredArgsConstructor
public class WorkflowEventListener {

    @EventListener
    public void onProcessStart(ProcessStartEvent event) {
        log.info("流程启动: instanceId={}, businessId={}",
            event.getInstanceId(), event.getBusinessId());
    }

    @EventListener
    public void onTaskComplete(TaskCompleteEvent event) {
        log.info("任务完成: taskId={}, handler={}",
            event.getTaskId(), event.getHandler());
    }

    @EventListener
    public void onProcessEnd(ProcessEndEvent event) {
        log.info("流程结束: instanceId={}, status={}",
            event.getInstanceId(), event.getFlowStatus());

        // 触发业务回调
        notifyBusinessSystem(event);
    }
}
```

### 自定义 SPEL 规则

扩展 SPEL 规则引擎：

```java
@Component
public class CustomSpelRule {

    /**
     * 判断是否为 VIP 用户
     */
    public boolean isVipUser(String userId) {
        // 查询用户等级
        return userService.isVip(userId);
    }

    /**
     * 获取用户部门
     */
    public String getUserDept(String userId) {
        return userService.getDeptId(userId);
    }
}
```

在流程设计器中使用：

```
条件表达式: #{@customSpelRule.isVipUser(applicant)}
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
import { pageWaitingTasks } from '@/api/workflow/task/taskApi'

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
  const { data } = await pageWaitingTasks(queryParams.value)
  taskList.value = data.records
  total.value = data.total
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
// api/workflow/task/taskApi.ts
import request from '@/utils/request'

/**
 * 办理任务
 */
export function completeTask(data: CompleteTaskBo) {
  return request({
    url: '/workflow/task/completeTask',
    method: 'post',
    data
  })
}

/**
 * 驳回任务
 */
export function rejectTask(data: BackProcessBo) {
  return request({
    url: '/workflow/task/rejectTask',
    method: 'post',
    data
  })
}

/**
 * 获取可驳回节点
 */
export function listRejectableNodes(taskId: number, nodeCode: string) {
  return request({
    url: `/workflow/task/listRejectableNodes/${taskId}/${nodeCode}`,
    method: 'get'
  })
}
```

---

## 总结

RuoYi-Plus 工作流模块提供了完整的企业级工作流解决方案，具有以下优势：

1. **轻量高效** - 基于 Warm-Flow 引擎，启动快、占用低
2. **功能完善** - 支持复杂的审批场景和多种任务操作
3. **易于集成** - 提供完善的 API 和前端组件
4. **高度可扩展** - 支持自定义处理器、监听器、规则
5. **多租户支持** - 完整的数据隔离能力

如需更多帮助，请参考 Warm-Flow 官方文档或在项目中查看示例代码。
