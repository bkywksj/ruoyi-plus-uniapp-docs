---
title: "任务管理"
description: "任务管理是工作流系统的核心功能，负责处理流程执行过程中的待办任务。当流程流转到需要人工处理的节点时，系统会创建待办任务并分配给相应的办理人。本文档详细介绍任务的创建、查询、办理、驳回、转办、委派等操作。"
---
# 任务管理

## 概述

任务管理是工作流系统的核心功能，负责处理流程执行过程中的待办任务。当流程流转到需要人工处理的节点时，系统会创建待办任务并分配给相应的办理人。本文档详细介绍任务的创建、查询、办理、驳回、转办、委派等操作。

## 任务结构

### 待办任务

待办任务对应 warm-flow 的 `org.dromara.warm.flow.orm.entity.FlowTask`（表 `flow_task`），以下为主要字段：

```java
/**
 * 流程任务实体（warm-flow 2.x，表 flow_task）
 */
public class FlowTask {
    /** 任务ID */
    private Long id;

    /** 流程实例ID */
    private Long instanceId;

    /** 流程定义ID */
    private Long definitionId;

    /** 流程名称 */
    private String flowName;

    /** 业务ID */
    private String businessId;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 节点类型 */
    private Integer nodeType;

    /** 任务状态（pending 待审批 / back 退回等，见下文 TaskStatusEnum） */
    private String flowStatus;

    /** 表单自定义 */
    private String formCustom;

    /** 表单路径 */
    private String formPath;

    /** 租户ID */
    private String tenantId;

    /** 删除标记（逻辑删除，0 正常 1 删除） */
    private String delFlag;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
```

> **已办任务的逻辑删除**：warm-flow 2.x 中 `flow_task.del_flag` 为逻辑删除字段（`@TableLogic`），任务办结后待办记录被标记为 `del_flag = '1'`，而不是物理删除。项目自定义的待办 / 已办 / 抄送查询 SQL（`FlwTaskMapper.xml`）都带了 `del_flag = '0'` 过滤，自己写 SQL 关联 `flow_task` / `flow_his_task` 时也要加上这个条件。

### 历史任务

历史任务对应 `org.dromara.warm.flow.orm.entity.FlowHisTask`（表 `flow_his_task`）：

```java
/**
 * 历史任务实体（warm-flow 2.x，表 flow_his_task）
 */
public class FlowHisTask {
    /** 历史任务ID */
    private Long id;

    /** 任务ID */
    private Long taskId;

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

    /** 目标节点编码 */
    private String targetNodeCode;

    /** 目标节点名称 */
    private String targetNodeName;

    /** 审批人ID */
    private String approver;

    /** 协作人（转办、委派、加减签时的目标人） */
    private String collaborator;

    /** 协作方式（none / transfer / delegate / add_signer / remove_signer） */
    private String cooperateType;

    /** 跳转类型（PASS 通过 / REJECT 退回 / NONE 无动作） */
    private String skipType;

    /** 审批意见 */
    private String message;

    /** 任务状态（pass / back / auto_pass / copy 等，见下文 TaskStatusEnum） */
    private String flowStatus;

    /** 扩展信息（本项目存附件 ossId，逗号分隔） */
    private String ext;

    /** 删除标记（逻辑删除） */
    private String delFlag;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间（办理时间） */
    private Date updateTime;
}
```

### 任务状态

任务状态写在 `flow_task.flow_status` / `flow_his_task.flow_status`，取值与 warm-flow 2.x 引擎 `TaskStatus` 的编码一致，另加本项目主动写入的「撤销」「终止」：

```java
public enum TaskStatusEnum {
    PENDING("pending", "待审批"),       // 运行中的待办任务
    PASS("pass", "通过"),
    AUTO_PASS("auto_pass", "自动审批"),  // 引擎按流程定义 def_config 自动通过
    BACK("back", "退回"),
    INVALID("invalid", "失效"),         // 任务被作废 / 会签票签中被其他人决定后失效
    TAKE_BACK("take_back", "拿回"),     // 办理人把已办任务拿回重新处理
    COPY("copy", "抄送"),
    CANCEL("cancel", "撤销"),           // 撤销流程时本项目显式写入
    TERMINATION("termination", "终止");
}
```

### 协作方式

委派、转办、加签、减签**不再写任务状态**，而是由引擎记录在历史任务的 `cooperate_type` 字段（对应引擎 `CooperateType` 枚举），`FlowHisTaskVo` 会据此填充 `cooperateTypeName`：

| cooperate_type | 说明 |
|----------------|------|
| none | 无协作（普通办理） |
| transfer | 转办 |
| delegate | 委派 |
| add_signer | 加签 |
| remove_signer | 减签 |

## API 接口

接口统一位于 `FlwTaskController`（前缀 `/workflow/task`），一览如下：

| 接口 | 方法 | 权限标识 | 说明 |
|------|------|---------|------|
| `/startWorkFlow` | POST | - | 启动流程 |
| `/completeTask` | POST | - | 办理任务 |
| `/rejectTask` | POST | - | 驳回任务 |
| `/listRejectableNodes/{taskId}/{nowNodeCode}` | GET | - | 获取可驳回节点 |
| `/terminateTask` | POST | - | 终止任务 |
| `/taskOperation/{taskOperation}` | POST | - | 委派 / 转办 / 加签 / 减签 |
| `/pageWaitingTasks` | GET | - | 当前用户待办 |
| `/pageFinishedTasks` | GET | - | 当前用户已办 |
| `/pageCopyTasks` | GET | - | 当前用户抄送 |
| `/pageAllWaitingTasks` | GET | `workflow:task:allWaiting` | 所有待办（监控） |
| `/pageAllFinishedTasks` | GET | `workflow:task:allWaiting` | 所有已办（监控） |
| `/getTask/{taskId}` | GET | - | 任务详情（按关系人校验） |
| `/listNextNodes` | POST | - | 获取下一节点 |
| `/updateAssignee/{userId}` | PUT | `workflow:task:updateAssignee` | 修改办理人 |
| `/listTaskAssignees/{taskId}` | GET | - | 任务办理人（按关系人校验） |
| `/urgeTask` | POST | `workflow:task:urge` | 催办 |

### 启动流程

**接口地址**: `POST /workflow/task/startWorkFlow`

**请求参数**:

```json
{
    "businessId": "1001",
    "flowCode": "leave_apply",
    "handler": null,
    "variables": {
        "days": 3,
        "leaveType": "annual",
        "reason": "家中有事"
    },
    "bizExt": {
        "businessTitle": "张三的请假申请",
        "businessCode": "LV20240101001"
    }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| businessId | String | 是 | 业务ID |
| flowCode | String | 是 | 流程定义编码 |
| handler | String | 否 | 办理人（覆盖节点配置） |
| variables | Map | 否 | 流程变量（值为 null 的项会被过滤） |
| bizExt | Object | 否 | 业务扩展信息（`businessCode` 业务编码、`businessTitle` 业务标题；编码为空时自动生成） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "提交成功",
    "data": {
        "processInstanceId": 1,
        "taskId": 101
    }
}
```

**启动流程核心逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public StartProcessReturnDTO startWorkFlow(StartProcessBo startProcessBo) {
    String businessId = startProcessBo.getBusinessId();
    if (StringUtils.isBlank(businessId)) {
        throw new ServiceException("启动工作流时必须包含业务ID");
    }

    // 设置内置变量
    Map<String, Object> variables = startProcessBo.getVariables();
    variables.put(INITIATOR, LoginHelper.getUserIdStr());        // 发起人
    variables.put(INITIATOR_DEPT_ID, LoginHelper.getDeptId());   // 发起人部门
    variables.put(BUSINESS_ID, businessId);                       // 业务ID
    FlowInstanceBizExt bizExt = startProcessBo.getBizExt();

    // 检查是否已有流程实例
    FlowInstance flowInstance = flowInstanceMapper.selectOne(
        new LambdaQueryWrapper<>(FlowInstance.class)
            .eq(FlowInstance::getBusinessId, businessId));

    if (ObjectUtil.isNotNull(flowInstance)) {
        // 已存在流程（草稿 / 撤销 / 退回后再次提交），检查状态是否允许
        BusinessStatusEnum.checkStartStatus(flowInstance.getFlowStatus());
        List<Task> taskList = taskService.list(new FlowTask().setInstanceId(flowInstance.getId()));
        // 合并变量、保存业务扩展信息，返回现有的申请人任务
        taskService.mergeVariable(flowInstance, variables);
        insService.updateById(flowInstance);
        this.buildFlowInstanceBizExt(flowInstance, bizExt);
        return buildReturnDTO(flowInstance.getId(), taskList.get(0).getId());
    }

    // 获取已发布的流程定义
    Definition definition = FlowEngine.defService()
        .getPublishByFlowCode(startProcessBo.getFlowCode());
    if (ObjectUtil.isNull(definition)) {
        throw new ServiceException("流程【" + startProcessBo.getFlowCode() + "】未发布，请先在流程设计器中发布流程定义");
    }
    // 自动审批由引擎按流程定义 def_config.autoPass 处理，这里不再写入实例变量
    variables.put(BUSINESS_CODE, this.generateBusinessCode(bizExt));

    // 启动流程（2.x Command API）
    StartCommand command = new StartCommand();
    command.setBusinessId(businessId);
    command.setFlowCode(startProcessBo.getFlowCode());
    command.setOperator(new OperatorContext(startProcessBo.getHandler()));
    command.setVariables(variables);
    command.setFlowStatus(BusinessStatusEnum.DRAFT.getStatus());
    command.setTaskStatus(TaskStatus.PASS.getKey());
    WorkflowResult result = FlowEngine.workflow().start(command);
    Instance instance = insService.getById(result.getInstanceId());

    // 保存业务扩展信息
    this.buildFlowInstanceBizExt(instance, bizExt);

    // 第一个节点必须是申请人节点（只生成一个任务）
    List<Task> taskList = taskService.list(new FlowTask().setInstanceId(instance.getId()));
    if (taskList.size() > 1) {
        throw new ServiceException("请检查流程第一个环节是否为申请人！");
    }
    return buildReturnDTO(instance.getId(), taskList.get(0).getId());
}
```

> 以上为精简示意（`buildReturnDTO` 为示意写法，实际代码直接组装 `StartProcessReturnDTO`），完整实现见 `FlwTaskServiceImpl#startWorkFlow`。启动后实例状态为 `draft`，申请人还需调用「办理任务」提交。

### 办理任务

**接口地址**: `POST /workflow/task/completeTask`

**请求参数**:

```json
{
    "taskId": 101,
    "message": "同意",
    "fileId": "1,2,3",
    "flowCopyList": [
        {"userId": 10, "userName": "王五"}
    ],
    "messageType": ["1", "2"],
    "notice": "请注意查收",
    "handler": null,
    "variables": {},
    "assigneeMap": {
        "manager": "5,6"
    }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |
| message | String | 否 | 审批意见 |
| fileId | String | 否 | 附件ID（逗号分隔） |
| flowCopyList | List | 否 | 抄送人列表 |
| messageType | List | 否 | 消息类型（1-站内信，2-邮件，3-短信） |
| notice | String | 否 | 通知内容 |
| handler | String | 否 | 办理人（覆盖配置） |
| variables | Map | 否 | 流程变量 |
| assigneeMap | Map | 否 | 下一节点办理人（弹窗选人），key 为办理人变量名，value 为逗号分隔的用户ID |

**办理任务核心逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean completeTask(CompleteTaskBo completeTaskBo) {
    Long taskId = completeTaskBo.getTaskId();

    // 抄送人、消息类型、通知内容放进变量，由全局监听器在办理后统一处理
    Map<String, Object> variables = completeTaskBo.getVariables();
    variables.put(FLOW_COPY_LIST, completeTaskBo.getFlowCopyList());
    variables.put(MESSAGE_TYPE, completeTaskBo.getMessageType());
    variables.put(MESSAGE_NOTICE, completeTaskBo.getNotice());

    FlowTask flowTask = flowTaskMapper.selectById(taskId);
    if (ObjectUtil.isNull(flowTask)) {
        throw new ServiceException("流程任务不存在或任务已审批！");
    }
    Instance ins = insService.getById(flowTask.getInstanceId());

    // 草稿 / 已撤销 / 已退回状态下的办理视为申请人提交，触发提交事件
    if (BusinessStatusEnum.isDraftOrCancelOrBack(ins.getFlowStatus())) {
        variables.put(SUBMIT, true);
    }

    // 弹窗选择的办理人：按「pass:变量名」「back:变量名」两种 key 写入，
    // 全局监听器 assignment 阶段据此覆盖下一节点办理人
    Map<String, Object> assigneeMap = setPopAssigneeMap(completeTaskBo.getAssigneeMap(), ins.getVariableMap());
    if (CollUtil.isNotEmpty(assigneeMap)) {
        variables.putAll(assigneeMap);
    }

    // 构建办理命令（2.x Command API）
    CompleteCommand command = new CompleteCommand();
    command.setOperator(new OperatorContext(completeTaskBo.getHandler()));
    command.setTaskId(taskId);
    command.setVariables(variables);
    command.setMessage(completeTaskBo.getMessage());
    command.setExt(completeTaskBo.getFileId());
    // 全局监听器靠 context.taskStatus 判断「通过 / 退回」来决定是否抄送和发通知，必须显式声明 PASS
    command.setTaskStatus(TaskStatus.PASS.getKey());
    // 实例状态（waiting / finish）与自动审批（def_config.autoPass）都由引擎在办理链内处理
    FlowEngine.workflow().complete(command);
    return true;
}
```

> 实例是否完成以**到达结束节点**为准：全局监听器 `WorkflowGlobalListener` 在任务完成后判断实例当前节点为结束节点且已无待办，才把实例置为 `finish` 并发布完成事件。warm-flow 2.x 的流程可能停在定时 / 消息等待事件上，此时同样没有待办，但不会被误判为已完成。

### 驳回任务

**接口地址**: `POST /workflow/task/rejectTask`

**请求参数**:

```json
{
    "taskId": 101,
    "nodeCode": "apply",
    "message": "信息不完整，请补充",
    "fileId": null,
    "messageType": ["1"],
    "notice": "您的申请已被退回",
    "variables": {}
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |
| nodeCode | String | 否 | 驳回到的节点编码 |
| message | String | 否 | 驳回原因 |
| fileId | String | 否 | 附件ID |
| messageType | List | 否 | 消息类型 |
| notice | String | 否 | 通知内容 |
| variables | Map | 否 | 流程变量 |

**驳回逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean rejectTask(BackProcessBo bo) {
    Long taskId = bo.getTaskId();

    FlowTask task = flowTaskMapper.selectById(taskId);
    if (ObjectUtil.isNull(task)) {
        throw new ServiceException("任务不存在！");
    }

    Instance inst = insService.getById(task.getInstanceId());
    BusinessStatusEnum.checkBackStatus(inst.getFlowStatus());

    // 获取申请节点编码
    String applyNodeCode = flwCommonService.applyNodeCode(task.getDefinitionId());

    Map<String, Object> variable = new HashMap<>();
    variable.put(MESSAGE_TYPE, bo.getMessageType());
    variable.put(MESSAGE_NOTICE, bo.getNotice());

    RejectCommand command = new RejectCommand();
    command.setOperator(new OperatorContext(LoginHelper.getUserIdStr()));
    command.setTaskId(task.getId());
    command.setTargetNodeCode(bo.getNodeCode());
    command.setVariables(variable);
    command.setMessage(bo.getMessage());
    command.setExt(bo.getFileId());
    // 退回到申请人节点时实例置为 back，退回到中间节点仍是 waiting
    command.setFlowStatus(applyNodeCode.equals(bo.getNodeCode())
        ? FlowStatus.BACK.getKey()
        : FlowStatus.WAITING.getKey());
    command.setTaskStatus(TaskStatus.BACK.getKey());
    FlowEngine.workflow().reject(command);
    return true;
}
```

### 获取可驳回节点

**接口地址**: `GET /workflow/task/listRejectableNodes/{taskId}/{nowNodeCode}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |
| nowNodeCode | String | 是 | 当前节点编码 |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "nodeCode": "apply",
            "nodeName": "申请人",
            "nodeType": 1
        },
        {
            "nodeCode": "leader",
            "nodeName": "部门主管",
            "nodeType": 1
        }
    ]
}
```

**获取可驳回节点逻辑**:

```java
@Override
public List<Node> listRejectableNodes(Long taskId, String nowNodeCode) {
    FlowTask task = flowTaskMapper.selectById(taskId);
    if (ObjectUtil.isNull(task)) {
        throw new ServiceException("任务不存在！");
    }

    // 获取当前节点配置
    List<Node> nodeCodes = nodeService.getByNodeCodes(
        Collections.singletonList(nowNodeCode), task.getDefinitionId());
    if (CollUtil.isEmpty(nodeCodes)) {
        return nodeCodes;
    }

    // 委派任务只能退回到委派人（返回当前节点）
    List<User> userList = FlowEngine.userService()
        .getByAssociateds(Collections.singletonList(task.getId()), UserType.DEPUTE.getKey());
    if (CollUtil.isNotEmpty(userList)) {
        return nodeCodes;
    }

    // 节点配置了固定驳回节点时直接返回
    Node node = nodeCodes.get(0);
    if (StringUtils.isNotBlank(node.getAnyNodeSkip())) {
        return nodeService.getByNodeCodes(
            Collections.singletonList(node.getAnyNodeSkip()), task.getDefinitionId());
    }

    // 静态前置节点：沿跳转线从当前节点反向 BFS 收集
    FlowCombine flowCombine = defService.getFlowCombineNoDef(task.getDefinitionId());
    Map<String, Node> nodeMap = getPreviousNodeMap(nowNodeCode, flowCombine);
    List<HisTask> hisTaskList = hisTaskService.getByInsId(task.getInstanceId());

    // 可达节点：用当前流程变量从开始节点正向模拟「通过」，排除互斥分支上从未经过的节点
    Set<String> reachableNodeCodes = new HashSet<>();
    if (CollUtil.isNotEmpty(hisTaskList)) {
        Instance instance = insService.getById(task.getInstanceId());
        collectReachableNodeCodes(reachableNodeCodes, instance, flowCombine);
        // 当前节点本身都不可达，说明变量已无法复现历史路径，放弃可达性过滤
        if (!reachableNodeCodes.contains(nowNodeCode)) {
            reachableNodeCodes.clear();
        }
    }

    // 静态前置节点 ∩ 历史经过的节点 ∩ 可达节点，只保留中间节点并去重
    Set<String> added = new HashSet<>();
    List<Node> backNodeList = new ArrayList<>();
    for (HisTask hisTask : hisTaskList) {
        Node nodeValue = nodeMap.get(hisTask.getNodeCode());
        if (nodeValue != null
            && NodeType.BETWEEN.getKey().equals(nodeValue.getNodeType())
            && (CollUtil.isEmpty(reachableNodeCodes) || reachableNodeCodes.contains(nodeValue.getNodeCode()))
            && added.add(nodeValue.getNodeCode())) {
            backNodeList.add(nodeValue);
        }
    }
    if (CollUtil.isNotEmpty(backNodeList)) {
        Collections.reverse(backNodeList);
        return backNodeList;
    }
    // 有历史任务却筛不出可退回节点时返回空，而不是全部静态前置节点
    if (CollUtil.isNotEmpty(hisTaskList)) {
        return Collections.emptyList();
    }
    return StreamUtils.filter(nodeMap.values(), e -> NodeType.BETWEEN.getKey().equals(e.getNodeType()));
}
```

> 不再直接使用 `nodeService.previousNodeList`：它只按跳转线静态回溯，不区分条件分支，会把互斥分支上从未真正经过的节点也列为可退回目标。

### 终止任务

**接口地址**: `POST /workflow/task/terminateTask`

**请求参数**:

```json
{
    "taskId": 101,
    "comment": "业务变更，终止流程"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |
| comment | String | 否 | 终止原因 |

**终止逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean terminateTask(FlowTerminationBo bo) {
    Long taskId = bo.getTaskId();

    Task task = taskService.getById(taskId);
    if (task == null) {
        throw new ServiceException("任务不存在！");
    }

    Instance instance = insService.getById(task.getInstanceId());
    if (ObjectUtil.isNotNull(instance)) {
        BusinessStatusEnum.checkInvalidStatus(instance.getFlowStatus());
    }

    // 实例与任务的终止状态（termination）由引擎写入，这里不再自己指定
    TerminateCommand command = new TerminateCommand();
    command.setOperator(new OperatorContext(LoginHelper.getUserIdStr()));
    command.setTaskId(taskId);
    command.setMessage(bo.getComment());
    FlowEngine.workflow().terminate(command);
    return true;
}
```

> 终止与作废共用 `TerminateCommand`：终止按 `taskId` 执行、状态由引擎写为 `termination`；作废（见流程实例文档）按 `instanceId` 执行并显式指定实例 / 任务状态为 `invalid`。

### 任务操作（委派/转办/加签/减签）

**接口地址**: `POST /workflow/task/taskOperation/{taskOperation}`

**操作类型**:

| 操作类型 | 标识 | 说明 | 历史记录 cooperate_type |
|----------|------|------|------|
| 委派 | delegateTask | 委托他人代为办理，完成后回到委托人 | delegate |
| 转办 | transferTask | 完全转交给他人办理 | transfer |
| 加签 | addSignature | 在会签 / 票签节点增加办理人 | add_signer |
| 减签 | reductionSignature | 在会签 / 票签节点减少办理人 | remove_signer |

操作标识由 `TaskOperationEnum` 定义，传入未知标识会抛出 `Invalid operation type` 异常。

**请求参数**:

```json
{
    "taskId": 101,
    "userId": "5",
    "userIds": ["5", "6"],
    "messageType": ["1"],
    "message": "请帮忙审批"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |
| userId | String | 委派/转办必填 | 目标用户ID（`AddGroup` 校验） |
| userIds | List | 加签/减签必填 | 目标用户ID列表（`EditGroup` 校验） |
| messageType | List | 否 | 消息类型，传入时操作成功后通知目标用户 |
| message | String | 否 | 操作说明 |

**任务操作核心逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean taskOperation(TaskOperationBo bo, String taskOperation) {
    TaskOperationEnum op = TaskOperationEnum.getByCode(taskOperation);
    if (op == null) {
        throw new ServiceException("Invalid operation type " + taskOperation);
    }

    OperatorContext operator = new OperatorContext(LoginHelper.getUserIdStr());
    // 超管 / 租户管理员可代办任意任务，跳过办理人权限校验
    operator.setIgnore(LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin());

    // 按操作类型分组校验参数
    switch (op) {
        case DELEGATE_TASK, TRANSFER_TASK -> ValidatorUtils.validate(bo, AddGroup.class);
        case ADD_SIGNATURE, REDUCTION_SIGNATURE -> ValidatorUtils.validate(bo, EditGroup.class);
    }

    Long taskId = bo.getTaskId();
    Task task = taskService.getById(taskId);
    FlowNode flowNode = getByNodeCode(task.getNodeCode(), task.getDefinitionId());

    // 加签 / 减签只能在会签或票签节点使用（或签节点不支持）
    if (op == TaskOperationEnum.ADD_SIGNATURE || op == TaskOperationEnum.REDUCTION_SIGNATURE) {
        if (CooperateType.isOrSign(flowNode.getNodeRatio())) {
            throw new ServiceException(task.getNodeName() + "不是会签或票签节点！");
        }
    }

    // 协作方式由引擎写入历史记录的 cooperate_type，不再借用任务状态字段
    boolean result = false;
    switch (op) {
        case DELEGATE_TASK -> {
            DelegateCommand command = new DelegateCommand();
            command.setOperator(operator);
            command.setTaskId(taskId);
            command.setTargetHandler(bo.getUserId());
            command.setMessage(bo.getMessage());
            result = FlowEngine.workflow().delegate(command).isSuccess();
        }
        case TRANSFER_TASK -> {
            TransferCommand command = new TransferCommand();
            command.setOperator(operator);
            command.setTaskId(taskId);
            command.setTargetHandler(bo.getUserId());
            command.setMessage(bo.getMessage());
            result = FlowEngine.workflow().transfer(command).isSuccess();
        }
        case ADD_SIGNATURE -> {
            AddSignerCommand command = new AddSignerCommand();
            command.setOperator(operator);
            command.setTaskId(taskId);
            command.setTargetHandlers(bo.getUserIds());
            command.setMessage(bo.getMessage());
            result = FlowEngine.workflow().addSigner(command).isSuccess();
        }
        case REDUCTION_SIGNATURE -> {
            RemoveSignerCommand command = new RemoveSignerCommand();
            command.setOperator(operator);
            command.setTaskId(taskId);
            command.setTargetHandlers(bo.getUserIds());
            command.setMessage(bo.getMessage());
            result = FlowEngine.workflow().removeSigner(command).isSuccess();
        }
    }

    // 操作成功且指定了消息类型时，通知目标用户（「单据「委派」提醒」等）
    if (result && CollUtil.isNotEmpty(bo.getMessageType())) {
        // ... 收集 userId / userIds 后调用 flwCommonService.sendMessage(...)
    }
    return result;
}
```

### 查询待办任务

**接口地址**: `GET /workflow/task/pageWaitingTasks`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| flowCode | String | 否 | 流程编码 |
| flowName | String | 否 | 流程名称 |
| nodeName | String | 否 | 节点名称 |
| category | String | 否 | 流程分类 |
| createByIds | List | 否 | 发起人ID列表 |
| pageNum | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页数量 |

**说明**: 只查询当前用户是办理人（`flow_user.processed_by`，类型为审批人 / 转办人 / 委托人）、所在实例状态为 `waiting` 的中间节点待办。`category` 会连同其子分类一起查询。

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "records": [
            {
                "id": 101,
                "instanceId": 1,
                "definitionId": 100,
                "flowCode": "leave_apply",
                "flowName": "请假申请",
                "businessId": "1001",
                "businessCode": "LV20240101001",
                "businessTitle": "张三的请假申请",
                "nodeCode": "manager",
                "nodeName": "部门经理",
                "nodeType": 1,
                "flowStatus": "waiting",
                "assigneeIds": "5,6",
                "createTime": "2024-01-01 10:30:00"
            }
        ],
        "total": 1
    }
}
```

> 待办列表中的 `flowStatus` 取自流程实例（`flow_instance.flow_status`），表示实例状态而非任务状态。

### 查询已办任务

**接口地址**: `GET /workflow/task/pageFinishedTasks`

**请求参数**: 同待办任务

**说明**: 查询当前用户作为审批人（`flow_his_task.approver`）的历史记录，抄送记录（`flow_status = copy`）不计入已办。

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "records": [
            {
                "id": 1,
                "instanceId": 1,
                "nodeCode": "apply",
                "nodeName": "申请人",
                "approver": "1",
                "cooperateType": "none",
                "message": "提交申请",
                "flowStatus": "waiting",
                "flowTaskStatus": "pass",
                "businessCode": "LV20240101001",
                "businessTitle": "张三的请假申请",
                "createTime": "2024-01-01 10:00:00",
                "updateTime": "2024-01-01 10:00:00",
                "runDuration": "0秒"
            }
        ],
        "total": 1
    }
}
```

> 已办列表中 `flowTaskStatus` 是该条历史任务的任务状态（pass / back / auto_pass 等），`flowStatus` 是所在流程实例的状态；委派、转办、加减签看 `cooperateType`。

### 查询抄送任务

**接口地址**: `GET /workflow/task/pageCopyTasks`

**请求参数**: 同待办任务

**说明**: 查询抄送给当前用户的记录。抄送人存于 `flow_user`（`type = '4'`），其 `associated` 关联的是抄送历史任务的主键 `flow_his_task.id`（不是 `task_id`）。

### 查询所有待办任务（管理员）

**接口地址**: `GET /workflow/task/pageAllWaitingTasks`

**权限标识**: `workflow:task:allWaiting`

**说明**: 查询所有用户的待办任务，用于流程监控。

### 查询所有已办任务（管理员）

**接口地址**: `GET /workflow/task/pageAllFinishedTasks`

**权限标识**: `workflow:task:allWaiting`

**说明**: 查询所有用户的已办任务，用于流程监控。

### 获取任务详情

**接口地址**: `GET /workflow/task/getTask/{taskId}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |

**访问控制**: 任务详情同时服务于审批与监控，仅靠菜单权限拦不住「知道 taskId 就能看任意任务」，因此按关系人校验，满足任一条件才可读取，否则抛出 `NotPermissionException`（「无权访问该流程任务」）：

- 超级管理员，或拥有 `workflow:task:allWaiting` / `workflow:task:updateAssignee` / `workflow:task:urge` 任一流程监控权限
- 当前用户是该任务的审批人 / 转办人 / 委托人 / 抄送人
- 当前用户是该任务抄送记录的接收人（按抄送历史主键查找）
- 当前用户是流程发起人

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 101,
        "instanceId": 1,
        "definitionId": 100,
        "flowCode": "leave_apply",
        "flowName": "请假申请",
        "version": "1",
        "businessId": "1001",
        "nodeCode": "manager",
        "nodeName": "部门经理",
        "nodeType": 1,
        "flowStatus": "waiting",
        "buttonList": [
            {"code": "back", "show": true}
        ],
        "copyList": [
            {"userId": 10, "userName": null}
        ],
        "varList": {},
        "nodeRatio": "0",
        "applyNode": false,
        "createTime": "2024-01-01 10:30:00"
    }
}
```

| 字段 | 说明 |
|------|------|
| flowStatus | 流程实例状态 |
| buttonList | 节点扩展配置中的按钮权限（`ButtonPermissionVo`：code 按钮编码 / show 是否显示） |
| copyList | 节点抄送人，读取引擎节点配置 `node_config.copy`，并按办理人规则展开（角色 / 部门 → 用户） |
| varList | 节点扩展配置中的自定义变量（key=value） |
| nodeRatio | 会签 / 票签比例，`0` 为或签 |
| applyNode | 当前节点是否为申请人节点 |

### 获取下一节点信息

**接口地址**: `POST /workflow/task/listNextNodes`

**请求参数**:

```json
{
    "taskId": 101,
    "variables": {
        "amount": 15000
    }
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "nodeCode": "gm",
            "nodeName": "总经理",
            "nodeType": 1,
            "permissionFlag": "5,6,7"
        }
    ]
}
```

**说明**: 根据当前变量计算下一个流转节点，用于弹窗选人场景。

### 修改任务办理人

**接口地址**: `PUT /workflow/task/updateAssignee/{userId}`

**权限标识**: `workflow:task:updateAssignee`

**请求参数**:

```json
[101, 102, 103]
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskIdList | List | 是 | 任务ID列表（请求体） |
| userId | String | 是 | 新的办理人ID（路径参数） |

**说明**: 批量修改任务的办理人，通常用于管理员重新分配任务。会先删除这些任务现有的办理人记录，再以审批人类型（`type = '1'`）写入新办理人。

### 获取任务办理人

**接口地址**: `GET /workflow/task/listTaskAssignees/{taskId}`

**访问控制**: Controller 在查询前调用 `checkTaskReadAccess(taskIds)`，校验规则与「获取任务详情」一致。校验放在 HTTP 边界而不是 Service 的 `listTaskAssignees` 内：该方法还被流转后的消息通知链路调用，此时登录用户是上一节点办理人，若在其中校验会导致整个办理事务回滚。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "userId": 5,
            "userName": "李四",
            "nickName": "部门经理",
            "deptName": "技术部"
        }
    ]
}
```

### 催办任务

**接口地址**: `POST /workflow/task/urgeTask`

**权限标识**: `workflow:task:urge`

**请求参数**:

```json
{
    "taskIdList": [101, 102],
    "messageType": ["1", "2"],
    "message": "请尽快处理待办任务"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskIdList | List | 是 | 任务ID列表 |
| messageType | List | 是 | 消息类型 |
| message | String | 是 | 催办内容 |

**催办逻辑**:

```java
@Override
public boolean urgeTask(FlowUrgeTaskBo bo) {
    if (CollUtil.isEmpty(bo.getTaskIdList())) {
        return false;
    }

    // 获取任务办理人
    List<UserDTO> userList = this.listTaskAssignees(bo.getTaskIdList());
    if (CollUtil.isEmpty(userList)) {
        return false;
    }

    // 发送消息
    flwCommonService.sendMessage(
        bo.getMessageType(),
        bo.getMessage(),
        "单据审批提醒",
        userList
    );

    return true;
}
```

## 视图对象

### 待办任务视图

以下为主要字段（完整定义见 `FlowTaskVo`）：

```java
@Data
public class FlowTaskVo {
    /** 任务ID */
    private Long id;

    /** 流程实例ID */
    private Long instanceId;

    /** 流程定义ID */
    private Long definitionId;

    /** 流程编码 */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 业务ID */
    private String businessId;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 节点类型 */
    private Integer nodeType;

    /** 流程状态（实例状态） */
    private String flowStatus;

    /** 流程状态名称 */
    private String flowStatusName;

    /** 流程版本 */
    private String version;

    /** 流程分类ID / 名称 */
    private String category;
    private String categoryName;

    /** 办理人ID列表（逗号分隔） / 办理人名称 */
    private String assigneeIds;
    private String assigneeNames;

    /** 抄送人ID / 名称（抄送列表使用） */
    private String processedBy;
    private String processedByName;

    /** 申请人ID / 名称 */
    private String createBy;
    private String createByName;

    /** 按钮权限列表 */
    private List<ButtonPermissionVo> buttonList;

    /** 抄送对象（读取引擎节点配置 node_config.copy 并展开） */
    private List<FlowCopyVo> copyList;

    /** 节点自定义参数 key=value */
    private Map<String, String> varList;

    /** 流程签署比例值（字符串）："0" 或签，"100" 会签，1 ~ 99 票签通过百分比 */
    private String nodeRatio;

    /** 是否为申请节点 */
    private Boolean applyNode;

    /** 业务编码 / 业务标题（来自 flow_instance_biz_ext） */
    private String businessCode;
    private String businessTitle;

    /** 创建时间 */
    private Date createTime;
}
```

### 历史任务视图

```java
@Data
public class FlowHisTaskVo {
    /** 历史任务ID */
    private Long id;

    /** 任务ID */
    private Long taskId;

    /** 流程实例ID */
    private Long instanceId;

    /** 流程定义ID */
    private Long definitionId;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 协作方式（none / transfer / delegate / add_signer / remove_signer） */
    private String cooperateType;

    /** 协作方式展示名，由 cooperateType 翻译而来 */
    private String cooperateTypeName;

    /** 审批人ID */
    private String approver;

    /** 审批人名称 */
    private String approveName;

    /** 协作人（转办、会签、票签、委派） */
    private String collaborator;

    /** 目标节点编码 */
    private String targetNodeCode;

    /** 目标节点名称 */
    private String targetNodeName;

    /** 审批意见 */
    private String message;

    /** 流程状态（实例状态） */
    private String flowStatus;

    /** 任务状态（pass / back / auto_pass 等） */
    private String flowTaskStatus;

    /** 流程状态描述 */
    private String flowStatusName;

    /** 附件等扩展信息 */
    private String ext;

    /** 业务编码 / 业务标题 */
    private String businessCode;
    private String businessTitle;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;

    /** 运行时长 */
    private String runDuration;
}
```

## 抄送机制

抄送有两个来源，最终都由引擎写入抄送留痕：

| 来源 | 配置位置 | 处理方式 |
|------|---------|---------|
| 节点抄送 | 设计器中节点的抄送配置，存于引擎 `node_config.copy` | 引擎在流转时自动抄送，按办理人规则展开（角色 / 部门 → 用户） |
| 办理时手动抄送 | 办理任务时传入 `flowCopyList` | 全局监听器 `finish` 阶段调用 `setCopy`，内部使用 `taskService.copy` |

抄送留痕的数据结构：

- 历史任务表写入一条 `flow_status = copy` 的抄送记录
- 抄送人写入 `flow_user`（`type = '4'`），`associated` 关联**抄送历史任务的主键 `flow_his_task.id`**，不是 `task_id`
- 同一待办 + 同一人幂等，流程办结后仍可补抄送

### 抄送实现

手动抄送只在任务以「通过」或「退回」收口时触发（监听器依据 `WorkflowContext.taskStatus` 判断，所以办理 / 驳回命令都显式设置了 `taskStatus`）：

```java
@Override
public void setCopy(Task task, List<FlowCopyBo> flowCopyList) {
    if (CollUtil.isEmpty(flowCopyList)) {
        return;
    }
    WorkflowContext context = new WorkflowContext();
    context.setHandler(LoginHelper.getUserIdStr());
    context.setMessage("【抄送给】" + StreamUtils.join(flowCopyList, FlowCopyBo::getUserName));
    // 抄送历史与抄送人记录都交给引擎生成，不再自己拼装
    taskService.copy(task.getId(),
        StreamUtils.toList(flowCopyList, x -> Convert.toStr(x.getUserId())), context);
}
```

> 删除流程实例时，项目会额外按抄送历史主键清理 `flow_user` 中的抄送人记录（引擎删除实例时不会处理这部分），详见流程实例文档。

### 抄送请求对象

```java
@Data
public class FlowCopyBo {
    /** 用户ID */
    private Long userId;

    /** 用户名称 */
    private String userName;
}
```

## 自动审批

### 自动审批逻辑

自动审批由 warm-flow 2.x 引擎内置处理，开关配置在流程定义的 `def_config.autoPass`（在流程设计器中配置），项目代码不再自行实现：

- 发起流程时不再把 `autoPass` 写入实例变量，办理任务时也不再递归跳转下一节点
- 引擎在办理链内判断是否满足自动审批条件并自动通过，对应的历史任务状态记为 `auto_pass`（`TaskStatusEnum.AUTO_PASS`）
- 流程定义页面不再提供「自动审批」勾选，`ext.autoPass` 不再生效；存量数据由 `script/sql/update/*_workflow_warmflow2.sql` 迁移到 `def_config`

```java
// 办理任务时只需正常提交 CompleteCommand，自动审批由引擎按 def_config.autoPass 完成
CompleteCommand command = new CompleteCommand();
command.setOperator(new OperatorContext(handler));
command.setTaskId(taskId);
command.setTaskStatus(TaskStatus.PASS.getKey());
FlowEngine.workflow().complete(command);
```

## 使用示例

### 完整的审批流程

```java
// 1. 启动流程
StartProcessBo startBo = new StartProcessBo();
startBo.setBusinessId("1001");
startBo.setFlowCode("leave_apply");
startBo.setVariables(Map.of("days", 3, "leaveType", "annual"));
StartProcessReturnDTO result = flwTaskService.startWorkFlow(startBo);

// 2. 提交申请（办理第一个任务）
CompleteTaskBo completeBo = new CompleteTaskBo();
completeBo.setTaskId(result.getTaskId());
completeBo.setMessage("提交请假申请");
flwTaskService.completeTask(completeBo);

// 3. 部门经理审批
CompleteTaskBo approveBo = new CompleteTaskBo();
approveBo.setTaskId(nextTaskId);
approveBo.setMessage("同意");
FlowCopyBo copyBo = new FlowCopyBo();
copyBo.setUserId(10L);
copyBo.setUserName("HR专员");
approveBo.setFlowCopyList(List.of(copyBo));
flwTaskService.completeTask(approveBo);
```

### 驳回并重新提交

```java
// 1. 驳回到申请人
BackProcessBo backBo = new BackProcessBo();
backBo.setTaskId(taskId);
backBo.setNodeCode("apply");
backBo.setMessage("请补充请假原因");
flwTaskService.rejectTask(backBo);

// 2. 申请人修改后重新提交
CompleteTaskBo resubmitBo = new CompleteTaskBo();
resubmitBo.setTaskId(newTaskId);
resubmitBo.setMessage("已补充请假原因");
resubmitBo.setVariables(Map.of("reason", "详细的请假原因说明"));
flwTaskService.completeTask(resubmitBo);
```

### 委派和转办

```java
// 委派任务
TaskOperationBo delegateBo = new TaskOperationBo();
delegateBo.setTaskId(taskId);
delegateBo.setUserId("10");
delegateBo.setMessage("请帮忙审核技术方案");
flwTaskService.taskOperation(delegateBo, "delegateTask");

// 转办任务
TaskOperationBo transferBo = new TaskOperationBo();
transferBo.setTaskId(taskId);
transferBo.setUserId("11");
transferBo.setMessage("该事项由新负责人处理");
flwTaskService.taskOperation(transferBo, "transferTask");
```

## 最佳实践

### 1. 任务查询优化

```java
// 使用分页查询，避免一次加载过多数据
PageQuery pageQuery = new PageQuery();
pageQuery.setPageNum(1);
pageQuery.setPageSize(20);

FlowTaskBo taskBo = new FlowTaskBo();
taskBo.setCategory("100"); // 按分类筛选

PageResult<FlowTaskVo> result = flwTaskService.pageWaitingTasks(taskBo, pageQuery);
```

### 2. 批量操作

```java
// 批量催办
FlowUrgeTaskBo urgeBo = new FlowUrgeTaskBo();
urgeBo.setTaskIdList(List.of(101L, 102L, 103L));
urgeBo.setMessageType(List.of("1")); // 站内信
urgeBo.setMessage("请尽快处理待办任务");
flwTaskService.urgeTask(urgeBo);

// 批量修改办理人
List<Long> taskIds = List.of(101L, 102L);
flwTaskService.updateAssignee(taskIds, "5");
```

### 3. 错误处理

```java
try {
    flwTaskService.completeTask(completeBo);
} catch (ServiceException e) {
    String message = e.getMessage();
    if (message.contains("任务不存在")) {
        // 任务已被他人处理
        log.warn("任务已被处理: {}", completeBo.getTaskId());
    } else if (message.contains("权限")) {
        // 无权操作
        log.warn("无权操作任务: {}", completeBo.getTaskId());
    }
    throw e;
}
```

## 常见问题

### 1. 任务已被处理

**问题原因**: 多人同时操作同一任务

**解决方案**:
- 前端刷新任务列表
- 后端使用乐观锁

### 2. 加签减签失败

**问题原因**: 节点是或签节点（`nodeRatio` 为 0），不是会签或票签节点

**解决方案**: 检查节点的 `nodeRatio` 配置

```java
FlowNode flowNode = getByNodeCode(nodeCode, definitionId);
if (CooperateType.isOrSign(flowNode.getNodeRatio())) {
    throw new ServiceException(flowNode.getNodeName() + "不是会签或票签节点！");
}
```

### 3. 驳回节点为空

**问题原因**: 第一个审批节点无法驳回

**解决方案**: 只能撤销流程

```java
List<Node> nodes = flwTaskService.listRejectableNodes(taskId, nodeCode);
if (CollUtil.isEmpty(nodes)) {
    // 无可驳回节点，提示用户撤销流程
    throw new ServiceException("当前节点无法驳回，请使用撤销功能");
}
```
