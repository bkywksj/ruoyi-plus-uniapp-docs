---
title: "工作流核心概念"
description: "工作流模块的核心概念是理解和使用工作流功能的基础。本文档详细介绍了工作流系统中的关键概念，包括流程定义、流程实例、任务、节点类型、办理人机制、任务状态等核心要素。掌握这些概念，将帮助开发者更好地设计和实现业务流程自动化。"
---
# 工作流核心概念

## 概述

工作流模块的核心概念是理解和使用工作流功能的基础。本文档详细介绍了工作流系统中的关键概念，包括流程定义、流程实例、任务、节点类型、办理人机制、任务状态等核心要素。掌握这些概念，将帮助开发者更好地设计和实现业务流程自动化。

RuoYi-Plus 工作流模块基于 Warm-Flow 2.1.1 轻量级工作流引擎构建，在保持轻量化的同时，提供了丰富的企业级功能扩展，包括多租户支持、消息通知、权限控制等。

## 流程定义

### 什么是流程定义

流程定义是对业务流程的抽象描述，它定义了流程的结构、节点、流转规则等信息。流程定义是流程实例的模板，可以基于一个流程定义创建多个流程实例。

```java
/**
 * 流程定义核心属性
 */
public class FlowDefinition {
    /** 流程定义ID */
    private Long id;

    /** 流程编码（唯一标识） */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 流程版本 */
    private String version;

    /** 是否发布（0-未发布，1-已发布） */
    private Integer isPublish;

    /** 流程分类 */
    private String category;

    /** 创建者 */
    private String createBy;

    /** 扩展信息（JSON格式） */
    private String ext;

    /** 引擎流程定义配置（JSON格式，2.x 新增，如自动审批 autoPass） */
    private String defConfig;
}
```

### 流程定义状态

| 状态 | 说明 | 可执行操作 |
|------|------|------------|
| 未发布 | 流程定义草稿状态，可编辑修改 | 编辑、删除、发布 |
| 已发布 | 流程定义可用状态，可创建实例 | 停用、导出 |

### 流程定义服务接口

```java
public interface IFlwDefinitionService {

    /**
     * 分页查询流程定义列表
     *
     * @param flowDefinition 参数
     * @param pageQuery      分页
     * @return 返回分页列表
     */
    PageResult<FlowDefinitionVo> pageFlowDefinitions(FlowDefinition flowDefinition, PageQuery pageQuery);

    /**
     * 分页查询未发布的流程定义列表
     */
    PageResult<FlowDefinitionVo> pageUnpublishedDefinitions(FlowDefinition flowDefinition, PageQuery pageQuery);

    /**
     * 发布流程定义
     *
     * @param id 流程定义id
     * @return 结果
     */
    boolean publishDefinition(Long id);

    /**
     * 导出流程定义
     */
    void exportDefinition(Long id, HttpServletResponse response) throws IOException;

    /**
     * 导入流程定义
     */
    boolean importDefinition(MultipartFile file, String category);

    /**
     * 删除流程定义
     */
    boolean deleteDefinitions(List<Long> ids);

    /**
     * 新增租户流程定义（多租户同步）
     */
    void syncDef(String tenantId);
}
```

### 流程定义扩展属性与引擎配置

Warm-Flow 2.x 把流程定义的 JSON 配置分成两列：

| 列 | 用途 | 维护方式 |
|----|------|----------|
| `ext` | 业务自定义扩展属性 | 后台「流程定义」表单提交时原样回写，不会被覆盖 |
| `def_config` | 引擎读取的流程级配置，如自动审批 `autoPass` | 在流程设计器中配置 |

```json
// def_config 示例
{
    "autoPass": true
}
```

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `autoPass` | Boolean | 自动审批，由引擎在办理链内自动通过，任务状态记为 `auto_pass`（引擎常量 `FlowCons.DEF_CONFIG_AUTO_PASS`） |

> 1.8.9 时代自动审批存放在 `ext.autoPass`，由后台「流程定义」表单勾选。2.x 引擎只认 `def_config.autoPass`，该勾选已移除；存量数据由升级脚本迁移，见「工作流模块」页的「从 Warm-Flow 1.8.9 升级」一节。

## 流程实例

### 什么是流程实例

流程实例是流程定义的具体执行，代表一次完整的业务流程执行过程。每个流程实例都有唯一的业务ID，关联具体的业务数据。

```java
/**
 * 流程实例核心属性
 */
public class FlowInstance {
    /** 实例ID */
    private Long id;

    /** 流程定义ID */
    private Long definitionId;

    /** 业务ID（关联业务数据的唯一标识） */
    private String businessId;

    /** 流程状态 */
    private String flowStatus;

    /** 流程变量（JSON格式） */
    private String variable;

    /** 创建者（发起人） */
    private String createBy;

    /** 创建时间 */
    private Date createTime;
}
```

### 业务扩展表

为了更好地关联业务数据，系统提供了流程实例业务扩展表：

```java
/**
 * 流程实例业务扩展
 */
public class FlowInstanceBizExt {
    /** 主键ID */
    private Long id;

    /** 流程实例ID */
    private Long instanceId;

    /** 业务ID */
    private String businessId;

    /** 业务编号（自动生成或手动指定） */
    private String businessCode;

    /** 业务标题 */
    private String title;

    /** 表名 */
    private String tableName;

    /** 扩展信息（JSON格式） */
    private String ext;
}
```

### 流程实例状态

流程实例状态由 `BusinessStatusEnum`（`plus.ruoyi.common.core.enums`）枚举定义，编码与 Warm-Flow 2.x 引擎的 `FlowStatus` 一致，对应字典 `wf_business_status`：

```java
public enum BusinessStatusEnum {
    /** 已撤销 */
    CANCEL("cancel", "已撤销"),

    /** 草稿 */
    DRAFT("draft", "草稿"),

    /** 待审核 */
    WAITING("waiting", "待审核"),

    /** 已完成 */
    FINISH("finish", "已完成"),

    /** 已作废 */
    INVALID("invalid", "已作废"),

    /** 已退回 */
    BACK("back", "已退回"),

    /** 已终止 */
    TERMINATION("termination", "已终止"),

    /** 已重启（2.x 新增编码，当前引擎版本不会主动写入，仅用于状态描述与字典翻译） */
    RESTART("restart", "已重启");
}
```

> `RESTART` 不纳入 `runningStatus()` / `finishStatus()`，不影响现有「运行中 / 已结束」的查询口径。

### 流程实例状态流转图

```text
                    ┌─────────────┐
                    │   草稿      │
                    │   (draft)   │
                    └──────┬──────┘
                           │ 提交申请
                           ▼
                    ┌─────────────┐
         ┌─────────│   待审核    │─────────┐
         │  退回   │  (waiting)  │  撤销   │
         │         └──────┬──────┘         │
         │                │                │
         ▼                │                ▼
  ┌─────────────┐         │         ┌─────────────┐
  │   已退回    │         │         │   已撤销    │
  │   (back)    │         │         │  (cancel)   │
  └──────┬──────┘         │         └─────────────┘
         │ 重新提交       │ 审批通过
         └───────┐        │
                 │        ▼
                 │ ┌─────────────┐
                 └►│   已完成    │
                   │  (finish)   │
                   └─────────────┘

         另外可从 waiting 状态转为：
         - invalid（已作废）：管理员作废流程
         - termination（已终止）：办理人终止流程
```

**完成判定：** 只有当实例当前节点是结束节点、且已无待办任务时，`WorkflowGlobalListener` 才把实例改为 `finish` 并发布完成事件。2.x 的流程可能停在定时 / 消息等待事件上（此时实例仍为 `waiting`、同样没有待办），不会被误判为已完成。

### 流程实例服务接口

```java
public interface IFlwInstanceService {

    /**
     * 分页查询正在运行的流程实例
     */
    PageResult<FlowInstanceVo> pageRunningInstances(FlowInstanceBo flowInstanceBo, PageQuery pageQuery);

    /**
     * 分页查询已结束的流程实例
     */
    PageResult<FlowInstanceVo> pageFinishedInstances(FlowInstanceBo flowInstanceBo, PageQuery pageQuery);

    /**
     * 根据业务id查询流程实例详细信息
     */
    FlowInstanceVo getByBusinessId(Long businessId);

    /**
     * 按照业务id查询流程实例
     */
    FlowInstance getInstanceByBusinessId(String businessId);

    /**
     * 撤销流程
     */
    boolean cancelInstance(FlowCancelBo bo);

    /**
     * 作废流程
     */
    boolean invalidInstance(FlowInvalidBo bo);

    /**
     * 获取流程图，流程记录
     */
    Map<String, Object> getFlowHistory(String businessId);

    /**
     * 获取流程变量
     */
    Map<String, Object> getVariable(Long instanceId);

    /**
     * 更新流程变量
     */
    boolean updateVariable(FlowVariableBo bo);

    /**
     * 设置流程变量
     */
    void setVariable(Long instanceId, Map<String, Object> variable);
}
```

## 流程任务

### 什么是流程任务

流程任务是流程执行过程中需要人工处理的节点。当流程流转到某个需要人工参与的节点时，系统会创建一个待办任务，分配给相应的办理人。

```java
/**
 * 流程任务核心属性
 */
public class FlowTask {
    /** 任务ID */
    private Long id;

    /** 流程实例ID */
    private Long instanceId;

    /** 流程定义ID */
    private Long definitionId;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 节点类型 */
    private Integer nodeType;

    /** 创建时间 */
    private Date createTime;
}
```

### 任务状态

任务状态由 `TaskStatusEnum` 枚举定义，取值与 Warm-Flow 2.x 写入 `flow_task` / `flow_his_task.flow_status` 的编码一致（引擎 `org.dromara.warm.flow.core.enums.TaskStatus` 的 key），另加本项目会主动写入的「撤销」「终止」，共 9 种：

```java
public enum TaskStatusEnum {
    /** 待审批（运行中的待办任务） */
    PENDING("pending", "待审批"),

    /** 通过 */
    PASS("pass", "通过"),

    /** 自动审批（引擎按流程定义 def_config 自动通过） */
    AUTO_PASS("auto_pass", "自动审批"),

    /** 退回 */
    BACK("back", "退回"),

    /** 失效（任务被作废 / 会签票签中被其他人决定后失效） */
    INVALID("invalid", "失效"),

    /** 拿回（办理人把已办任务拿回重新处理） */
    TAKE_BACK("take_back", "拿回"),

    /** 抄送 */
    COPY("copy", "抄送"),

    /** 撤销（撤销流程时本项目显式写入） */
    CANCEL("cancel", "撤销"),

    /** 终止 */
    TERMINATION("termination", "终止");
}
```

### 任务状态说明

| 状态 | 标识 | 说明 | 触发场景 |
|------|------|------|----------|
| 待审批 | pending | 等待办理 | 任务创建后等待办理人处理 |
| 通过 | pass | 任务审批通过 | 办理人点击"通过"按钮；发起流程时申请节点的历史也记为 pass |
| 自动审批 | auto_pass | 引擎自动通过 | 流程定义 `def_config.autoPass` 开启时由引擎写入 |
| 退回 | back | 任务被驳回 | 办理人将任务退回给前一节点；撤销后重建的申请节点待办也是 back |
| 失效 | invalid | 任务失效 | 流程被作废，或会签 / 票签中被其他人决定后失效 |
| 拿回 | take_back | 任务拿回 | 办理人把已办任务拿回重新处理 |
| 抄送 | copy | 任务抄送 | 办理时抄送或节点配置抄送时生成的抄送记录 |
| 撤销 | cancel | 发起人撤销流程 | 发起人在流程未结束前主动撤销 |
| 终止 | termination | 流程终止 | 办理人直接终止整个流程（由引擎写入） |

### 协作方式

转办、委派、加签、减签在 2.x 不再是任务状态，而是记录在历史任务的 `cooperate_type` 列（`varchar(20)`，默认 `none`），取值为引擎 `org.dromara.warm.flow.core.enums.CooperateType` 的编码：

| 协作方式 | 编码 | 说明 |
|----------|------|------|
| 无 | none | 普通审批，会签 / 票签 / 抄送也记为 none |
| 转办 | transfer | 将任务转交给其他人办理 |
| 委派 | delegate | 将任务委托给他人代为办理 |
| 加签 | add_signer | 在会签节点增加办理人 |
| 减签 | remove_signer | 在会签节点减少办理人 |

协作操作产生的历史记录，`flow_status` 与 `cooperate_type` 取值相同（例如委派历史的 `flow_status = delegate`），因此字典 `wf_task_status` 在 9 种任务状态之外还包含 `transfer` / `delegate` / `add_signer` / `remove_signer` 四项，共 13 项。

> 1.8.9 的 `waiting` / `depute` / `sign` / `sign_off` / `timeout` 等编码已不再使用，存量数据由升级脚本转换，见「工作流模块」页的「从 Warm-Flow 1.8.9 升级」一节。

### 历史任务

历史任务记录了已完成任务的详细信息：

```java
/**
 * 历史任务核心属性
 */
public class FlowHisTask {
    /** 历史任务ID */
    private Long id;

    /** 任务ID */
    private Long taskId;

    /** 流程实例ID */
    private Long instanceId;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 目标节点编码 */
    private String targetNodeCode;

    /** 目标节点名称 */
    private String targetNodeName;

    /** 审批人 */
    private String approver;

    /** 审批意见 */
    private String message;

    /** 流程状态 */
    private String flowStatus;

    /** 协作方式（none / transfer / delegate / add_signer / remove_signer） */
    private String cooperateType;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间（办理时间） */
    private Date updateTime;
}
```

### 任务服务接口

```java
public interface IFlwTaskService {

    /**
     * 启动流程
     */
    StartProcessReturnDTO startWorkFlow(StartProcessBo startProcessBo);

    /**
     * 办理任务
     */
    boolean completeTask(CompleteTaskBo completeTaskBo);

    /**
     * 驳回任务
     */
    boolean rejectTask(BackProcessBo bo);

    /**
     * 终止任务
     */
    boolean terminateTask(FlowTerminationBo bo);

    /**
     * 查询当前用户的待办任务
     */
    PageResult<FlowTaskVo> pageWaitingTasks(FlowTaskBo flowTaskBo, PageQuery pageQuery);

    /**
     * 查询当前用户的已办任务
     */
    PageResult<FlowHisTaskVo> pageFinishedTasks(FlowTaskBo flowTaskBo, PageQuery pageQuery);

    /**
     * 查询当前用户的抄送任务
     */
    PageResult<FlowTaskVo> pageCopyTasks(FlowTaskBo flowTaskBo, PageQuery pageQuery);

    /**
     * 任务操作（委派、转办、加签、减签）
     *
     * @param bo            参数
     * @param taskOperation 操作类型：delegateTask、transferTask、addSignature、reductionSignature
     */
    boolean taskOperation(TaskOperationBo bo, String taskOperation);

    /**
     * 获取可驳回的前置节点
     */
    List<Node> listRejectableNodes(Long taskId, String nowNodeCode);

    /**
     * 获取下一节点信息
     */
    List<FlowNode> listNextNodes(FlowNextNodeBo bo);

    /**
     * 催办任务
     */
    boolean urgeTask(FlowUrgeTaskBo bo);

    /**
     * 修改任务办理人
     */
    boolean updateAssignee(List<Long> taskIdList, String userId);
}
```

## 节点类型

### 节点类型枚举

Warm-Flow 2.1.1 的 `org.dromara.warm.flow.core.enums.NodeType` 定义了 7 种节点类型：

```java
public enum NodeType {
    /** 开始节点 */
    START(0, "start"),

    /** 中间节点（审批节点） */
    BETWEEN(1, "between"),

    /** 结束节点 */
    END(2, "end"),

    /** 排他网关 */
    SERIAL(3, "serial"),

    /** 并行网关 */
    PARALLEL(4, "parallel"),

    /** 包容网关 */
    INCLUSIVE(5, "inclusive"),

    /** 服务任务 */
    SERVICE(6, "service");
}
```

> 服务任务需要开发者实现 `ServiceTaskHandler`，本项目暂未接入；发布流程定义时会校验处理器配置。
>
> 事件节点（定时启动 / 定时捕获 / 定时边界 / 消息事件 / 错误事件 / 终止结束等）不是独立的节点类型，而是通过 `flow_node.event_type` 标识（取值如 `TIMER_START`、`TIMER_CATCH`、`MESSAGE_CATCH`、`ERROR_BOUNDARY`、`TERMINATE_END` 等）。本项目发布时终止结束事件直接放行；定时事件需开启 `warm-flow.timer-enabled`，消息 / 错误事件暂未接入，详见「工作流模块」页的「流程定义发布校验」一节。

### 节点类型详解

#### 开始节点 (START)

开始节点是流程的入口点，每个流程有且只有一个开始节点。

**特点：**
- 流程启动时自动执行
- 不需要人工干预
- 通常连接到第一个审批节点

#### 中间节点 (BETWEEN)

中间节点是需要人工处理的审批节点，是流程中最常用的节点类型。

**特点：**
- 需要指定办理人
- 支持会签（多人同时审批）
- 支持票签（投票审批）
- 可配置按钮权限
- 可设置审批意见

```java
/**
 * 中间节点扩展属性
 */
public class FlowNode {
    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 节点类型 */
    private Integer nodeType;

    /** 权限标识（办理人配置） */
    private String permissionFlag;

    /** 节点比例（会签比例，0表示非会签） */
    private BigDecimal nodeRatio;

    /** 任意跳转节点编码（驳回指定节点） */
    private String anyNodeSkip;

    /** 扩展信息（JSON格式，本项目存按钮权限、自定义参数） */
    private String ext;

    /** 引擎节点配置（JSON格式，2.x 新增，如抄送 copy、服务任务配置） */
    private String nodeConfig;

    /** 事件类型（2.x 新增，非事件节点为空） */
    private String eventType;
}
```

#### 结束节点 (END)

结束节点是流程的终点，流程流转到此节点表示流程正常结束。

**特点：**
- 流程结束的标志
- 不需要人工干预
- 触发流程完成事件

#### 排他网关 (SERIAL)

排他网关用于条件分支，根据条件表达式选择其中一条路径执行。

**特点：**
- 只能选择一条分支
- 根据条件表达式判断
- 支持 SpEL 表达式

```text
          ┌─────────────┐
          │   排他网关   │
          └──────┬──────┘
                 │
         ┌───────┼───────┐
         │       │       │
         ▼       ▼       ▼
    [条件A]  [条件B]  [默认]
         │       │       │
         ▼       ▼       ▼
      节点A    节点B    节点C
```

#### 并行网关 (PARALLEL)

并行网关用于并行处理，可以同时启动多个分支，等待所有分支完成后继续流转。

**特点：**
- 同时启动多个分支
- 等待所有分支完成
- 支持分支和汇聚

```text
                    ┌─────────────┐
                    │   并行分支   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           分支A         分支B        分支C
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────┴──────┐
                    │   并行汇聚   │
                    └─────────────┘
```

### 会签与票签

会签和票签是中间节点的特殊模式，用于多人审批场景。

#### 会签模式

会签模式要求所有指定的办理人都必须审批通过，流程才能继续。

```java
// 节点比例为 1.0 表示 100% 通过才能继续
flowNode.setNodeRatio(new BigDecimal("1.0"));
```

**会签特点：**
- 所有人必须审批
- 任一人驳回则整体驳回
- 支持加签和减签操作

#### 票签模式

票签模式只要达到指定比例的办理人审批通过，流程即可继续。

```java
// 节点比例为 0.5 表示 50% 通过即可继续
flowNode.setNodeRatio(new BigDecimal("0.5"));
```

**票签特点：**
- 达到比例即可通过
- 适用于投票决策场景
- 支持动态调整比例

## 办理人机制

### 办理人类型

系统支持5种办理人配置方式：

```java
public enum TaskAssigneeEnum {
    /** 用户 - 直接指定用户ID */
    USER("用户", ""),

    /** 角色 - 按角色分配 */
    ROLE("角色", "role:"),

    /** 部门 - 按部门分配 */
    DEPT("部门", "dept:"),

    /** 岗位 - 按岗位分配 */
    POST("岗位", "post:"),

    /** SpEL表达式 - 动态计算 */
    SPEL("SpEL表达式", "");
}
```

### 办理人配置格式

| 类型 | 格式示例 | 说明 |
|------|----------|------|
| 用户 | `1,2,3` | 直接指定用户ID列表 |
| 角色 | `role:1,2` | 指定角色ID，系统自动转换为用户 |
| 部门 | `dept:100,101` | 指定部门ID，系统自动转换为用户 |
| 岗位 | `post:1,2` | 指定岗位ID，系统自动转换为用户 |
| SpEL | `${initiator}` | 使用 SpEL 表达式动态计算 |

### 权限处理器

系统通过 `WorkflowPermissionHandler` 处理办理人权限转换，它实现的是 Warm-Flow 2.x 的 `org.dromara.warm.flow.core.spi.PermissionHandler`（1.8.9 时位于 `org.dromara.warm.flow.core.handler` 包）：

```java
import org.dromara.warm.flow.core.spi.PermissionHandler;

@ConditionalOnEnable
@RequiredArgsConstructor
@Component
public class WorkflowPermissionHandler implements PermissionHandler {

    private final IFlwTaskAssigneeService flwTaskAssigneeService;

    /**
     * 当前用户的权限标识，引擎办理时放进 WorkflowContext 用于校验
     */
    @Override
    public List<String> permissions() {
        return Collections.singletonList(LoginHelper.getUserIdStr());
    }

    /**
     * 当前办理人
     */
    @Override
    public String getHandler() {
        return LoginHelper.getUserIdStr();
    }

    /**
     * 将设计器中配置的角色、部门、岗位等标识转换为用户ID
     * 引擎按 node_config.copy 自动抄送时也走这里，节点抄送配置里的角色、部门同样会展开成用户
     */
    @Override
    public List<String> convertPermissions(List<String> permissions) {
        if (CollUtil.isEmpty(permissions)) {
            return permissions;
        }
        String storageIds = CollUtil.join(permissions, StringUtils.SEPARATOR);
        List<UserDTO> users = flwTaskAssigneeService.fetchUsersByStorageIds(storageIds);
        return StreamUtils.toList(users, userDTO -> Convert.toStr(userDTO.getUserId()));
    }
}
```

### 任务办理人类型

任务办理人记录在 `flow_user` 表中，通过 `TaskAssigneeType` 区分类型：

```java
public enum TaskAssigneeType {
    /** 审批人 - 负责审批任务的人 */
    APPROVER(1, "审批人"),

    /** 转办人 - 任务被转办后的新办理人 */
    TRANSFER(2, "转办人"),

    /** 被委托人 - 任务被委托后的代办人 */
    DELEGATE(3, "被委托人"),

    /** 抄送人 - 任务抄送的接收人 */
    COPY(4, "抄送人");
}
```

> 抄送人（`type = '4'`）的 `flow_user.associated` 在 2.x 关联的是抄送历史记录的主键 `flow_his_task.id`（1.8.9 关联 `flow_his_task.task_id`），「我的抄送」查询按 `associated = flow_his_task.id` 关联。

### SpEL 表达式

系统内置了常用的流程变量，可在 SpEL 表达式中使用：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `initiator` | 流程发起人ID | `${initiator}` |
| `initiatorDeptId` | 发起人部门ID | `${initiatorDeptId}` |
| `businessId` | 业务ID | `${businessId}` |

**SpEL 表达式示例：**

```java
// 返回发起人
${initiator}

// 返回发起人部门
${initiatorDeptId}

// 自定义表达式（需在SpEL规则表中配置）
#{leaderOfDept(initiatorDeptId)}
```

### SpEL 规则配置

系统支持自定义 SpEL 规则，存储在 `flow_spel` 表中：

```java
public class FlowSpel {
    /** 规则ID */
    private Long id;

    /** 规则名称 */
    private String name;

    /** 规则内容（SpEL表达式） */
    private String expression;

    /** 返回值类型 */
    private String returnType;

    /** 备注说明 */
    private String remark;
}
```

## 按钮权限

### 按钮权限枚举

节点可以配置不同的操作按钮权限：

```java
public enum ButtonPermissionEnum implements NodeExtEnum {
    /** 弹窗选人 - 审批时可选择下一节点办理人 */
    POP("弹窗选人", "pop", false),

    /** 委托 - 将任务委托给他人代办 */
    TRUST("委托", "trust", false),

    /** 转办 - 将任务转交给他人办理 */
    TRANSFER("转办", "transfer", false),

    /** 抄送 - 办理时抄送给相关人员 */
    COPY("抄送", "copy", false),

    /** 退回 - 驳回任务到前置节点 */
    BACK("退回", "back", true),

    /** 加签 - 在会签节点增加办理人 */
    ADD_SIGN("加签", "addSign", false),

    /** 减签 - 在会签节点减少办理人 */
    SUB_SIGN("减签", "subSign", false),

    /** 终止 - 直接终止整个流程 */
    TERMINATION("终止", "termination", false),

    /** 附件 - 支持上传附件 */
    FILE("附件", "file", true);
}
```

### 按钮权限说明

| 按钮 | 标识 | 默认 | 说明 |
|------|------|------|------|
| 弹窗选人 | pop | 否 | 审批时弹窗选择下一节点办理人 |
| 委托 | trust | 否 | 委托他人代为办理，完成后流转回委托人 |
| 转办 | transfer | 否 | 完全转交给他人办理 |
| 抄送 | copy | 否 | 审批时抄送给指定人员 |
| 退回 | back | 是 | 将任务驳回到前置节点 |
| 加签 | addSign | 否 | 在会签节点增加审批人 |
| 减签 | subSign | 否 | 在会签节点减少审批人 |
| 终止 | termination | 否 | 直接终止整个流程 |
| 附件 | file | 是 | 支持上传审批附件 |

### 节点扩展配置

按钮权限存储在节点的扩展信息（`flow_node.ext`）中，由 `FlwNodeExtServiceImpl` 解析为 `NodeExtVo`：

```java
public class NodeExtVo {
    /** 按钮权限列表 */
    private List<ButtonPermissionVo> buttonPermissions;

    /** 自定义参数（key=value） */
    private Map<String, String> variables;
}
```

### 节点抄送配置

Warm-Flow 2.x 起，节点上的抄送对象不再放在 `ext` 中，而是由引擎节点配置 `flow_node.node_config.copy` 承载：在流程设计器中配置，流程流转到该节点时由引擎自动抄送，角色 / 部门会经 `WorkflowPermissionHandler#convertPermissions` 展开成用户。

- 原 `CopySettingEnum` 与 `NodeExtVo.copySettings` 已删除
- `FlwNodeExtServiceImpl` 遇到 `ext` 里残留的旧抄送配置会静默跳过（存量数据由升级脚本迁到 `node_config.copy`）
- 办理页展示的节点抄送人（`FlowTaskVo.copyList`）读取的也是 `node_config.copy`
- 按钮权限中的「抄送」(`copy`) 控制的是办理时能否手动选择抄送人，与节点抄送配置相互独立

## 消息通知

### 消息类型

系统支持三种消息通知方式：

```java
public enum MessageTypeEnum {
    /** 站内信 */
    SYSTEM_MESSAGE("1", "站内信"),

    /** 邮箱 */
    EMAIL_MESSAGE("2", "邮箱"),

    /** 短信 */
    SMS_MESSAGE("3", "短信");
}
```

### 消息通知场景

| 场景 | 触发条件 | 通知对象 |
|------|----------|----------|
| 任务创建 | 新任务生成时 | 任务办理人 |
| 任务办理 | 任务审批后 | 流程发起人、下一节点办理人 |
| 任务退回 | 任务被驳回时 | 流程发起人 |
| 任务抄送 | 办理时选择抄送 | 抄送人员 |
| 催办提醒 | 管理员催办时 | 任务办理人 |
| 流程结束 | 流程正常完成 | 流程发起人 |

### 消息发送实现

```java
@Service
public class FlwCommonServiceImpl implements IFlwCommonService {

    @Override
    public void sendMessage(List<String> messageType, String content,
                           String title, List<UserDTO> userList) {
        if (CollUtil.isEmpty(messageType) || CollUtil.isEmpty(userList)) {
            return;
        }

        for (String type : messageType) {
            MessageTypeEnum messageTypeEnum = MessageTypeEnum.getByCode(type);
            if (messageTypeEnum == null) {
                continue;
            }

            switch (messageTypeEnum) {
                case SYSTEM_MESSAGE:
                    // 发送站内信
                    sendSystemMessage(title, content, userList);
                    break;
                case EMAIL_MESSAGE:
                    // 发送邮件
                    sendEmailMessage(title, content, userList);
                    break;
                case SMS_MESSAGE:
                    // 发送短信
                    sendSmsMessage(content, userList);
                    break;
            }
        }
    }
}
```

## 流程变量

### 内置变量

系统启动流程时自动设置的变量：

```java
// 流程发起人ID
variables.put("initiator", LoginHelper.getUserIdStr());

// 发起人部门ID
variables.put("initiatorDeptId", LoginHelper.getDeptId());

// 业务ID
variables.put("businessId", businessId);

// 业务编号
variables.put("businessCode", businessCode);
```

> 2.x 起自动审批由引擎按流程定义 `def_config.autoPass` 在办理链内完成，启动流程时不再往实例变量里写入 `autoPass`。

### 常量定义

```java
public interface FlowConstant {
    /** 流程发起人 */
    String INITIATOR = "initiator";

    /** 业务ID */
    String BUSINESS_ID = "businessId";

    /** 发起人部门 */
    String INITIATOR_DEPT_ID = "initiatorDeptId";

    /** 流程分类Id转名称 */
    String CATEGORY_ID_TO_NAME = "category_id_to_name";

    /** 流程分类名称 */
    String FLOW_CATEGORY_NAME = "flow_category_name#30d";

    /** 默认租户OA申请分类id */
    Long FLOW_CATEGORY_ID = 100L;

    /** 是否为申请人提交 */
    String SUBMIT = "submit";

    /** 抄送列表 */
    String FLOW_COPY_LIST = "flowCopyList";

    /** 消息类型 */
    String MESSAGE_TYPE = "messageType";

    /** 消息通知内容 */
    String MESSAGE_NOTICE = "messageNotice";

    /** 任务状态字典类型 */
    String WF_TASK_STATUS = "wf_task_status";

    /** 业务编号 */
    String BUSINESS_CODE = "businessCode";
}
```

> 委派 / 转办 / 加签 / 减签的操作编码（`delegateTask` / `transferTask` / `addSignature` / `reductionSignature`）定义在 `TaskOperationEnum` 中。

### 变量传递

流程变量在办理任务时传递：

```java
@Data
public class CompleteTaskBo {
    /** 任务id */
    private Long taskId;

    /** 附件id */
    private String fileId;

    /** 抄送人员 */
    private List<FlowCopyBo> flowCopyList;

    /** 消息类型 */
    private List<String> messageType;

    /** 办理意见 */
    private String message;

    /** 消息通知 */
    private String notice;

    /** 办理人（可不填，用于覆盖当前节点办理人） */
    private String handler;

    /** 流程变量 */
    private Map<String, Object> variables;

    /** 弹窗选择的办理人 */
    private Map<String, Object> assigneeMap;

    /** 扩展变量 */
    private String ext;
}
```

## 全局监听器

### 监听器接口

系统实现了 Warm-Flow 2.x 的 `org.dromara.warm.flow.core.spi.GlobalListener` 接口（1.8.9 时位于 `org.dromara.warm.flow.core.listener` 包），四个回调统一接收 `org.dromara.warm.flow.core.spi.ListenerVariable`：

```java
import org.dromara.warm.flow.core.spi.GlobalListener;
import org.dromara.warm.flow.core.spi.ListenerVariable;

@Component
public class WorkflowGlobalListener implements GlobalListener {

    /**
     * 创建监听器，任务创建时执行
     */
    @Override
    public void create(ListenerVariable listenerVariable) {
    }

    /**
     * 开始监听器，任务开始办理时执行
     * 把节点扩展属性中的自定义参数合并进流程变量
     */
    @Override
    public void start(ListenerVariable listenerVariable) {
        // ...
    }

    /**
     * 分派监听器，动态修改待办任务的办理人
     * 处理办理 / 退回时指定的办理人，申请节点的办理人设为发起人
     */
    @Override
    public void assignment(ListenerVariable listenerVariable) {
        // ...
    }

    /**
     * 完成监听器，当前任务完成后执行
     */
    @Override
    public void finish(ListenerVariable listenerVariable) {
        // ...
    }
}
```

> 2.x 删除了 `FlowParams`，监听器中通过 `listenerVariable.getContext()` 获取 `WorkflowContext`（1.8.9 为 `getFlowParams()`），任务状态通过 `workflowContext.getTaskStatus()` 读取。

### 监听器处理逻辑

```java
@Override
public void finish(ListenerVariable listenerVariable) {
    Instance instance = listenerVariable.getInstance();
    Definition definition = listenerVariable.getDefinition();
    Task task = listenerVariable.getTask();
    WorkflowContext workflowContext = listenerVariable.getContext();

    // 1. 判断流程状态并发布流程事件（撤销、退回、作废、终止、已完成）
    String status = determineFlowStatus(instance);

    // 2. 发布下一节点的任务事件
    // ...

    // 3. 只有办理或退回时才处理手动抄送与消息通知
    if (!isPassOrBack(workflowContext.getTaskStatus())) {
        return;
    }
    // 办理时手动选择的抄送人，交给引擎 taskService.copy() 留痕
    flwTaskService.setCopy(task, flowCopyList);
    // 发送消息通知
    flwCommonService.sendMessage(definition.getFlowName(), instance.getId(), messageType, notice);
}

private String determineFlowStatus(Instance instance) {
    String flowStatus = instance.getFlowStatus();
    if (StringUtils.isNotBlank(flowStatus) && BusinessStatusEnum.initialState(flowStatus)) {
        return flowStatus;
    }
    // 只有到达结束节点才算完成：流程可能停在定时 / 消息等待事件上，此时同样没有待办任务
    if (NodeType.isEnd(instance.getNodeType()) && flwTaskService.isTaskEnd(instance.getId())) {
        String status = BusinessStatusEnum.FINISH.getStatus();
        flwInstanceService.updateStatus(instance.getId(), status);
        return status;
    }
    return null;
}
```

> 节点上配置的抄送对象（`node_config.copy`）由引擎在流转时自动抄送，监听器不再预填进 `flowCopyList`，避免同一批人被抄送两次。

### 事件发布机制

系统通过 Spring 事件机制发布流程事件：

```java
@Component
public class FlowProcessEventHandler {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * 发布流程事件
     */
    public void processHandler(String flowStatus, FlowInstance instance) {
        ProcessEvent event = new ProcessEvent();
        event.setFlowStatus(flowStatus);
        event.setBusinessId(instance.getBusinessId());
        event.setInstanceId(instance.getId());
        eventPublisher.publishEvent(event);
    }

    /**
     * 发布任务事件
     */
    public void processTaskHandler(HisTask hisTask, Instance instance) {
        ProcessTaskEvent event = new ProcessTaskEvent();
        event.setTaskId(hisTask.getId());
        event.setBusinessId(instance.getBusinessId());
        event.setFlowStatus(hisTask.getFlowStatus());
        eventPublisher.publishEvent(event);
    }
}
```

## 请求对象

### 启动流程请求

```java
@Data
public class StartProcessBo {
    /** 业务唯一值id */
    @NotBlank(message = "业务ID不能为空")
    private String businessId;

    /** 流程定义编码 */
    @NotBlank(message = "流程定义编码不能为空")
    private String flowCode;

    /** 办理人（可不填，用于覆盖当前节点办理人） */
    private String handler;

    /** 流程变量 */
    private Map<String, Object> variables;

    /** 流程业务扩展信息 */
    private FlowInstanceBizExt bizExt;
}
```

### 办理任务请求

```java
@Data
public class CompleteTaskBo {
    /** 任务id */
    @NotNull(message = "任务id不能为空")
    private Long taskId;

    /** 附件id */
    private String fileId;

    /** 抄送人员 */
    private List<FlowCopyBo> flowCopyList;

    /** 消息类型 */
    private List<String> messageType;

    /** 办理意见 */
    private String message;

    /** 消息通知 */
    private String notice;

    /** 办理人 */
    private String handler;

    /** 流程变量 */
    private Map<String, Object> variables;

    /** 弹窗选择的办理人 */
    private Map<String, Object> assigneeMap;
}
```

### 驳回任务请求

```java
@Data
public class BackProcessBo {
    /** 任务ID */
    @NotNull(message = "任务ID不能为空")
    private Long taskId;

    /** 附件id */
    private String fileId;

    /** 消息类型 */
    private List<String> messageType;

    /** 驳回的节点id */
    private String nodeCode;

    /** 办理意见 */
    private String message;

    /** 通知 */
    private String notice;

    /** 流程变量 */
    private Map<String, Object> variables;
}
```

### 任务操作请求

```java
@Data
public class TaskOperationBo {
    /** 任务id */
    @NotNull(message = "任务id不能为空")
    private Long taskId;

    /** 用户id（委派/转办时使用） */
    private String userId;

    /** 用户id列表（加签/减签时使用） */
    private List<String> userIds;

    /** 操作意见 */
    private String message;
}
```

## 返回对象

### 流程定义视图

```java
@Data
public class FlowDefinitionVo {
    /** 主键id */
    private Long id;

    /** 流程编码 */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 流程类别 */
    private String category;

    /** 流程类别名称 */
    private String categoryName;

    /** 流程版本 */
    private String version;

    /** 是否发布 */
    private Integer isPublish;

    /** 表单路径 */
    private String formPath;

    /** 审批表单是否自定义 */
    private String formCustom;

    /** 创建时间 */
    private Date createTime;
}
```

### 流程实例视图

```java
@Data
public class FlowInstanceVo {
    /** 实例id */
    private Long id;

    /** 流程定义id */
    private Long definitionId;

    /** 流程编码 */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 业务id */
    private String businessId;

    /** 业务编号 */
    private String businessCode;

    /** 业务标题 */
    private String title;

    /** 节点类型 */
    private Integer nodeType;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 流程状态 */
    private String flowStatus;

    /** 创建者id */
    private Long createBy;

    /** 创建者名称 */
    private String createByName;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
```

### 流程任务视图

```java
@Data
public class FlowTaskVo {
    /** 任务id */
    private Long id;

    /** 流程实例id */
    private Long instanceId;

    /** 流程定义id */
    private Long definitionId;

    /** 流程编码 */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 业务id */
    private String businessId;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 节点类型 */
    private Integer nodeType;

    /** 流程状态 */
    private String flowStatus;

    /** 版本 */
    private String version;

    /** 办理人ID列表 */
    private String assigneeIds;

    /** 按钮权限列表 */
    private List<String> buttonList;

    /** 抄送列表 */
    private List<FlowCopyVo> copyList;

    /** 变量列表 */
    private List<VariablesEnum> varList;

    /** 节点比例（会签比例） */
    private BigDecimal nodeRatio;

    /** 是否为申请节点 */
    private Boolean applyNode;

    /** 创建时间 */
    private Date createTime;
}
```

### 历史任务视图

```java
@Data
public class FlowHisTaskVo {
    /** 历史任务id */
    private Long id;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 协作方式（none无 transfer转办 delegate委派 add_signer加签 remove_signer减签） */
    private String cooperateType;

    /** 协作方式展示名，由 cooperateType 经引擎 CooperateType 翻译而来 */
    private String cooperateTypeName;

    /** 审批人 */
    private String approver;

    /** 审批人名称 */
    private String approverName;

    /** 流程定义id */
    private Long definitionId;

    /** 流程实例id */
    private Long instanceId;

    /** 任务id */
    private Long taskId;

    /** 目标节点编码 */
    private String targetNodeCode;

    /** 目标节点名称 */
    private String targetNodeName;

    /** 审批意见 */
    private String message;

    /** 流程状态 */
    private String flowStatus;

    /** 流程状态描述 */
    private String flowStatusName;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
```

## 数据库表结构

### 核心表说明

| 表名 | 说明 |
|------|------|
| `flow_definition` | 流程定义表 |
| `flow_node` | 流程节点表 |
| `flow_skip` | 流程跳转表 |
| `flow_instance` | 流程实例表 |
| `flow_task` | 流程任务表 |
| `flow_his_task` | 历史任务表 |
| `flow_user` | 任务办理人表 |
| `flow_event_wait` | 事件等待表（2.x 新增，定时 / 消息等需要等待的事件） |
| `flow_category` | 流程分类表 |
| `flow_spel` | SpEL规则表 |
| `flow_instance_biz_ext` | 流程实例业务扩展表 |

### 表关系图

```text
flow_definition (流程定义)
    │
    ├── flow_node (节点定义)
    │
    └── flow_instance (流程实例)
            │
            ├── flow_instance_biz_ext (业务扩展)
            │
            ├── flow_task (待办任务)
            │       │
            │       └── flow_user (办理人)
            │
            ├── flow_his_task (历史任务)
            │       │
            │       └── flow_user (抄送人，associated = flow_his_task.id)
            │
            └── flow_event_wait (事件等待)

flow_category (流程分类)
    │
    └── flow_definition (流程定义)

flow_spel (SpEL规则)
```

## 最佳实践

### 1. 流程设计原则

**简化节点数量**
- 避免过于复杂的流程设计
- 一般业务流程节点控制在5-10个

**合理使用网关**
- 排他网关用于条件分支
- 并行网关用于多人同时处理不同任务

**明确办理人**
- 每个节点必须有明确的办理人配置
- 使用角色或部门配置便于维护

### 2. 业务集成规范

**启动流程**
```java
// 构建启动参数
StartProcessBo startProcessBo = new StartProcessBo();
startProcessBo.setBusinessId(String.valueOf(businessId));
startProcessBo.setFlowCode("leave_apply");

// 设置业务扩展信息
FlowInstanceBizExt bizExt = new FlowInstanceBizExt();
bizExt.setTitle("请假申请 - " + userName);
bizExt.setTableName("test_leave");
startProcessBo.setBizExt(bizExt);

// 设置流程变量
Map<String, Object> variables = new HashMap<>();
variables.put("days", leaveDays);
variables.put("leaveType", leaveType);
startProcessBo.setVariables(variables);

// 启动流程
StartProcessReturnDTO result = flwTaskService.startWorkFlow(startProcessBo);
```

**办理任务**
```java
// 构建办理参数
CompleteTaskBo completeTaskBo = new CompleteTaskBo();
completeTaskBo.setTaskId(taskId);
completeTaskBo.setMessage("同意");
completeTaskBo.setMessageType(Arrays.asList("1", "2")); // 站内信、邮件

// 办理任务
boolean result = flwTaskService.completeTask(completeTaskBo);
```

### 3. 事件监听扩展

**监听流程事件**
```java
@Component
public class LeaveProcessEventListener {

    @EventListener
    public void handleProcessEvent(ProcessEvent event) {
        String flowStatus = event.getFlowStatus();
        String businessId = event.getBusinessId();

        // 根据流程状态更新业务数据
        if ("finish".equals(flowStatus)) {
            // 流程完成，更新请假状态为已批准
            leaveService.updateStatus(businessId, LeaveStatus.APPROVED);
        } else if ("back".equals(flowStatus)) {
            // 流程退回，更新请假状态为已退回
            leaveService.updateStatus(businessId, LeaveStatus.REJECTED);
        }
    }
}
```

### 4. 错误处理

**常见异常处理**
```java
try {
    flwTaskService.completeTask(completeTaskBo);
} catch (ServiceException e) {
    if (e.getMessage().contains("流程任务不存在")) {
        // 任务已被他人处理
        throw new BusinessException("该任务已被处理，请刷新页面");
    } else if (e.getMessage().contains("权限不足")) {
        // 无权操作
        throw new BusinessException("您没有权限处理此任务");
    } else {
        throw e;
    }
}
```

## 常见问题

### 1. 如何自定义办理人规则？

**问题描述**：默认的用户、角色、部门、岗位配置无法满足需求，需要自定义办理人规则。

**解决方案**：使用 SpEL 表达式配置自定义规则。

```java
// 1. 在 flow_spel 表中添加自定义规则
INSERT INTO flow_spel (name, expression, return_type, remark)
VALUES ('部门主管', '#{getDeptLeader(initiatorDeptId)}', 'String', '获取发起人部门主管');

// 2. 在服务中实现表达式方法
@Component("spelFunctions")
public class SpelFunctions {

    @Autowired
    private UserService userService;

    public String getDeptLeader(Long deptId) {
        return userService.getDeptLeaderId(deptId);
    }
}

// 3. 在节点配置中使用
permissionFlag = "#{getDeptLeader(initiatorDeptId)}"
```

### 2. 如何实现多租户流程隔离？

**问题描述**：多租户环境下，不同租户的流程定义需要隔离。

**解决方案**：系统已内置多租户支持。

```java
// 新增租户时自动同步流程定义
@Override
public void syncDef(String tenantId) {
    // 切换到租户上下文
    TenantHelper.setDynamic(tenantId);

    // 从主租户复制流程定义
    List<FlowDefinition> definitions = defService.list();
    for (FlowDefinition def : definitions) {
        // 复制到当前租户
        defService.save(def);
    }
}
```

### 3. 如何处理会签中的加签减签？

**问题描述**：会签过程中需要临时增加或减少审批人。

**解决方案**：使用任务操作接口。

```java
// 加签 - 增加审批人
TaskOperationBo addBo = new TaskOperationBo();
addBo.setTaskId(taskId);
addBo.setUserIds(Arrays.asList("101", "102"));
addBo.setMessage("临时增加审批人");
flwTaskService.taskOperation(addBo, "addSignature");

// 减签 - 减少审批人
TaskOperationBo reduceBo = new TaskOperationBo();
reduceBo.setTaskId(taskId);
reduceBo.setUserIds(Arrays.asList("103"));
reduceBo.setMessage("移除审批人");
flwTaskService.taskOperation(reduceBo, "reductionSignature");
```

**注意事项**：
- 只有会签节点（nodeRatio > 0）才支持加签减签
- 减签后剩余人数必须大于0
- 加签减签操作会记录到历史任务中，`cooperate_type` 与 `flow_status` 分别为 `add_signer` / `remove_signer`

### 4. 如何实现自动审批？

**问题描述**：某些场景下需要系统自动完成审批。

**解决方案**：在流程设计器中开启流程定义的自动审批，引擎会写入 `def_config`：

```json
// flow_definition.def_config
{
    "autoPass": true
}
```

- 自动审批由 Warm-Flow 2.x 引擎在办理链内完成，本项目不再自行递归办理，也不再往流程变量里写 `autoPass`
- 自动通过的任务在历史中记为 `auto_pass`（字典标签「自动审批」）
- 后台「流程定义」表单中的自动审批勾选已移除，统一在设计器中配置；1.8.9 存量的 `ext.autoPass` 需执行升级脚本迁移到 `def_config`，否则自动审批失效

### 5. 如何获取流程审批历史？

**问题描述**：需要展示完整的审批流程轨迹。

**解决方案**：使用 `getFlowHistory` 接口。

```java
// 获取流程历史
Map<String, Object> history = flwInstanceService.getFlowHistory(businessId);

// 返回数据结构
{
    "flowChart": "流程图SVG",
    "hisTaskList": [
        {
            "nodeName": "申请人",
            "approverName": "张三",
            "message": "提交申请",
            "flowStatus": "pass",
            "updateTime": "2024-01-01 10:00:00"
        },
        {
            "nodeName": "部门主管",
            "approverName": "李四",
            "message": "同意",
            "flowStatus": "pass",
            "updateTime": "2024-01-01 11:00:00"
        }
    ]
}
```
