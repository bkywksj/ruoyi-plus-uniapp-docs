# 任务管理

## 概述

任务管理是工作流系统的核心功能，负责处理流程执行过程中的待办任务。当流程流转到需要人工处理的节点时，系统会创建待办任务并分配给相应的办理人。本文档详细介绍任务的创建、查询、办理、驳回、转办、委派等操作。

## 任务结构

### 待办任务

```java
/**
 * 流程任务实体
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

    /** 表单自定义 */
    private String formCustom;

    /** 表单路径 */
    private String formPath;

    /** 租户ID */
    private String tenantId;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
```

### 历史任务

```java
/**
 * 历史任务实体
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

    /** 协作方式 */
    private Integer cooperateType;

    /** 审批意见 */
    private String message;

    /** 流程状态 */
    private String flowStatus;

    /** 扩展信息（如附件ID） */
    private String ext;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间（办理时间） */
    private Date updateTime;

    /** 运行时长 */
    private String runDuration;
}
```

### 任务状态

```java
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
}
```

## API 接口

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
        "title": "张三的请假申请",
        "businessCode": "LV20240101001",
        "tableName": "test_leave"
    }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| businessId | String | 是 | 业务ID |
| flowCode | String | 是 | 流程定义编码 |
| handler | String | 否 | 办理人（覆盖节点配置） |
| variables | Map | 否 | 流程变量 |
| bizExt | Object | 否 | 业务扩展信息 |

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

    // 设置内置变量
    Map<String, Object> variables = startProcessBo.getVariables();
    variables.put(INITIATOR, LoginHelper.getUserIdStr());        // 发起人
    variables.put(INITIATOR_DEPT_ID, LoginHelper.getDeptId());   // 发起人部门
    variables.put(BUSINESS_ID, businessId);                       // 业务ID

    // 检查是否已有流程实例
    FlowInstance flowInstance = flowInstanceMapper.selectOne(
        new LambdaQueryWrapper<>(FlowInstance.class)
            .eq(FlowInstance::getBusinessId, businessId));

    if (ObjectUtil.isNotNull(flowInstance)) {
        // 已存在流程，检查状态是否允许重新提交
        BusinessStatusEnum.checkStartStatus(flowInstance.getFlowStatus());
        // 更新变量并返回
        taskService.mergeVariable(flowInstance, variables);
        insService.updateById(flowInstance);
        return buildReturnDTO(flowInstance);
    }

    // 获取流程定义
    Definition definition = FlowEngine.defService()
        .getPublishByFlowCode(startProcessBo.getFlowCode());
    if (ObjectUtil.isNull(definition)) {
        throw new ServiceException("流程未发布");
    }

    // 读取扩展配置
    Dict dict = JsonUtils.parseMap(definition.getExt());
    boolean autoPass = dict.getBool(FlowConstant.AUTO_PASS);
    variables.put(FlowConstant.AUTO_PASS, autoPass);

    // 启动流程
    FlowParams flowParams = FlowParams.build()
        .handler(startProcessBo.getHandler())
        .flowCode(startProcessBo.getFlowCode())
        .variable(variables)
        .flowStatus(BusinessStatusEnum.DRAFT.getStatus());

    Instance instance = insService.start(businessId, flowParams);

    // 保存业务扩展信息
    this.buildFlowInstanceBizExt(instance, startProcessBo.getBizExt());

    return buildReturnDTO(instance);
}
```

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
| assigneeMap | Map | 否 | 下一节点办理人（弹窗选人） |

**办理任务核心逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean completeTask(CompleteTaskBo completeTaskBo) {
    Long taskId = completeTaskBo.getTaskId();

    // 获取任务
    FlowTask flowTask = flowTaskMapper.selectById(taskId);
    if (ObjectUtil.isNull(flowTask)) {
        throw new ServiceException("流程任务不存在或任务已审批！");
    }

    Instance ins = insService.getById(flowTask.getInstanceId());

    // 设置变量
    Map<String, Object> variables = completeTaskBo.getVariables();
    variables.put(FlowConstant.FLOW_COPY_LIST, completeTaskBo.getFlowCopyList());
    variables.put(FlowConstant.MESSAGE_TYPE, completeTaskBo.getMessageType());
    variables.put(FlowConstant.MESSAGE_NOTICE, completeTaskBo.getNotice());

    // 检查是否为提交操作（草稿/撤销/退回状态）
    if (BusinessStatusEnum.isDraftOrCancelOrBack(ins.getFlowStatus())) {
        variables.put(FlowConstant.SUBMIT, true);
    }

    // 设置弹窗选择的办理人
    Map<String, Object> assigneeMap = setPopAssigneeMap(
        completeTaskBo.getAssigneeMap(),
        ins.getVariableMap()
    );
    if (CollUtil.isNotEmpty(assigneeMap)) {
        variables.putAll(assigneeMap);
    }

    // 构建流程参数
    FlowParams flowParams = FlowParams.build()
        .handler(completeTaskBo.getHandler())
        .variable(variables)
        .skipType(SkipType.PASS.getKey())
        .message(completeTaskBo.getMessage())
        .flowStatus(BusinessStatusEnum.WAITING.getStatus())
        .hisStatus(TaskStatusEnum.PASS.getStatus())
        .hisTaskExt(completeTaskBo.getFileId());

    // 执行任务跳转
    Boolean autoPass = Convert.toBool(variables.getOrDefault(AUTO_PASS, false));
    skipTask(taskId, flowParams, flowTask.getInstanceId(), autoPass);

    return true;
}
```

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

    FlowParams flowParams = FlowParams.build()
        .nodeCode(bo.getNodeCode())
        .variable(Map.of(
            "messageType", bo.getMessageType(),
            "notice", bo.getNotice()
        ))
        .message(bo.getMessage())
        .skipType(SkipType.REJECT.getKey())
        // 如果退回到申请节点，状态为"已退回"，否则为"待审核"
        .flowStatus(applyNodeCode.equals(bo.getNodeCode())
            ? TaskStatusEnum.BACK.getStatus()
            : TaskStatusEnum.WAITING.getStatus())
        .hisStatus(TaskStatusEnum.BACK.getStatus())
        .hisTaskExt(bo.getFileId());

    taskService.skip(task.getId(), flowParams);
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

    // 获取当前节点配置
    List<Node> nodeCodes = nodeService.getByNodeCodes(
        Collections.singletonList(nowNodeCode),
        task.getDefinitionId()
    );

    // 检查是否为委托任务（委托任务只能退回到委托人）
    List<User> userList = FlowEngine.userService()
        .getByAssociateds(Collections.singletonList(task.getId()), UserType.DEPUTE.getKey());
    if (CollUtil.isNotEmpty(userList)) {
        return nodeCodes;
    }

    // 检查是否配置了固定驳回节点
    Node node = nodeCodes.get(0);
    if (StringUtils.isNotBlank(node.getAnyNodeSkip())) {
        return nodeService.getByNodeCodes(
            Collections.singletonList(node.getAnyNodeSkip()),
            task.getDefinitionId()
        );
    }

    // 获取历史任务中的前置节点
    List<Node> nodes = nodeService.previousNodeList(task.getDefinitionId(), nowNodeCode);
    List<HisTask> taskList = hisTaskService.getByInsId(task.getInstanceId());

    // 只返回已执行过的前置节点
    Map<String, Node> nodeMap = StreamUtils.toIdentityMap(nodes, Node::getNodeCode);
    List<Node> backNodeList = new ArrayList<>();
    for (HisTask hisTask : taskList) {
        Node nodeValue = nodeMap.get(hisTask.getNodeCode());
        if (nodeValue != null) {
            backNodeList.add(nodeValue);
        }
    }

    // 只返回中间节点（审批节点）
    if (CollUtil.isNotEmpty(backNodeList)) {
        List<Node> prefixOrSuffixNodes = StreamUtils.filter(
            backNodeList,
            e -> NodeType.BETWEEN.getKey().equals(e.getNodeType())
        );
        Collections.reverse(prefixOrSuffixNodes);
        return prefixOrSuffixNodes;
    }

    return nodes;
}
```

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

    FlowParams flowParams = FlowParams.build()
        .message(bo.getComment())
        .flowStatus(BusinessStatusEnum.TERMINATION.getStatus())
        .hisStatus(TaskStatusEnum.TERMINATION.getStatus());

    taskService.termination(taskId, flowParams);
    return true;
}
```

### 任务操作（委派/转办/加签/减签）

**接口地址**: `POST /workflow/task/taskOperation/{taskOperation}`

**操作类型**:

| 操作类型 | 标识 | 说明 |
|----------|------|------|
| 委派 | delegateTask | 委托他人代为办理，完成后回到委托人 |
| 转办 | transferTask | 完全转交给他人办理 |
| 加签 | addSignature | 在会签节点增加办理人 |
| 减签 | reductionSignature | 在会签节点减少办理人 |

**请求参数**:

```json
{
    "taskId": 101,
    "userId": "5",
    "userIds": ["5", "6"],
    "message": "请帮忙审批"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |
| userId | String | 否 | 目标用户ID（委派/转办） |
| userIds | List | 否 | 目标用户ID列表（加签/减签） |
| message | String | 否 | 操作说明 |

**任务操作核心逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean taskOperation(TaskOperationBo bo, String taskOperation) {
    FlowParams flowParams = FlowParams.build().message(bo.getMessage());

    // 管理员可以忽略权限检查
    if (LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin()) {
        flowParams.ignore(true);
    }

    // 根据操作类型设置参数
    switch (taskOperation) {
        case DELEGATE_TASK, TRANSFER_TASK -> {
            flowParams.addHandlers(Collections.singletonList(bo.getUserId()));
        }
        case ADD_SIGNATURE -> {
            flowParams.addHandlers(bo.getUserIds());
        }
        case REDUCTION_SIGNATURE -> {
            flowParams.reductionHandlers(bo.getUserIds());
        }
    }

    Long taskId = bo.getTaskId();
    Task task = taskService.getById(taskId);
    FlowNode flowNode = getByNodeCode(task.getNodeCode(), task.getDefinitionId());

    // 加签/减签只能在会签节点使用
    if ("addSignature".equals(taskOperation) || "reductionSignature".equals(taskOperation)) {
        if (flowNode.getNodeRatio().compareTo(BigDecimal.ZERO) == 0) {
            throw new ServiceException(task.getNodeName() + "不是会签节点！");
        }
    }

    // 执行对应操作
    switch (taskOperation) {
        case DELEGATE_TASK -> {
            flowParams.hisStatus(TaskStatusEnum.DEPUTE.getStatus());
            return taskService.depute(taskId, flowParams);
        }
        case TRANSFER_TASK -> {
            flowParams.hisStatus(TaskStatusEnum.TRANSFER.getStatus());
            return taskService.transfer(taskId, flowParams);
        }
        case ADD_SIGNATURE -> {
            flowParams.hisStatus(TaskStatusEnum.SIGN.getStatus());
            return taskService.addSignature(taskId, flowParams);
        }
        case REDUCTION_SIGNATURE -> {
            flowParams.hisStatus(TaskStatusEnum.SIGN_OFF.getStatus());
            return taskService.reductionSignature(taskId, flowParams);
        }
    }
    return false;
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

### 查询已办任务

**接口地址**: `GET /workflow/task/pageFinishedTasks`

**请求参数**: 同待办任务

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "records": [
            {
                "id": 1,
                "taskId": 100,
                "instanceId": 1,
                "nodeCode": "apply",
                "nodeName": "申请人",
                "approver": "1",
                "approverName": "张三",
                "message": "提交申请",
                "flowStatus": "pass",
                "flowStatusName": "通过",
                "createTime": "2024-01-01 10:00:00",
                "updateTime": "2024-01-01 10:00:00"
            }
        ],
        "total": 1
    }
}
```

### 查询抄送任务

**接口地址**: `GET /workflow/task/pageCopyTasks`

**请求参数**: 同待办任务

**说明**: 查询抄送给当前用户的任务。

### 查询所有待办任务（管理员）

**接口地址**: `GET /workflow/task/pageAllWaitingTasks`

**说明**: 查询所有用户的待办任务，通常用于管理员监控。

### 查询所有已办任务（管理员）

**接口地址**: `GET /workflow/task/pageAllFinishedTasks`

**说明**: 查询所有用户的已办任务。

### 获取任务详情

**接口地址**: `GET /workflow/task/getTask/{taskId}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | Long | 是 | 任务ID |

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
        "assigneeIds": "5",
        "buttonList": ["back", "file", "copy", "transfer"],
        "copyList": [
            {"userId": 10, "userName": "王五"}
        ],
        "varList": [],
        "nodeRatio": 0,
        "applyNode": false,
        "createTime": "2024-01-01 10:30:00"
    }
}
```

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

**请求参数**:

```json
[101, 102, 103]
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskIdList | List | 是 | 任务ID列表（请求体） |
| userId | String | 是 | 新的办理人ID（路径参数） |

**说明**: 批量修改任务的办理人，通常用于管理员重新分配任务。

### 获取任务办理人

**接口地址**: `GET /workflow/task/listTaskAssignees/{taskId}`

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

    /** 流程状态 */
    private String flowStatus;

    /** 流程版本 */
    private String version;

    /** 办理人ID列表（逗号分隔） */
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

    /** 协作方式 */
    private Integer cooperateType;

    /** 审批人ID */
    private String approver;

    /** 审批人名称 */
    private String approverName;

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

    /** 运行时长 */
    private String runDuration;
}
```

## 抄送机制

### 抄送实现

```java
@Override
public void setCopy(Task task, List<FlowCopyBo> flowCopyList) {
    if (CollUtil.isEmpty(flowCopyList)) {
        return;
    }

    // 获取历史任务
    FlowHisTask flowHisTask = flowHisTaskMapper.selectList(
        new LambdaQueryWrapper<>(FlowHisTask.class)
            .eq(FlowHisTask::getTaskId, task.getId())).get(0);

    // 生成新的任务ID
    long taskId = identifierGenerator.nextId(null).longValue();
    task.setId(taskId);
    task.setNodeName("【抄送】" + task.getNodeName());

    // 构建历史任务
    FlowParams flowParams = FlowParams.build()
        .skipType(SkipType.NONE.getKey())
        .hisStatus(TaskStatusEnum.COPY.getStatus())
        .message("【抄送给】" + StreamUtils.join(flowCopyList, FlowCopyBo::getUserName));

    HisTask hisTask = hisTaskService.setSkipHisTask(task, flowNode, flowParams);
    hisTaskService.save(hisTask);

    // 保存抄送人
    List<User> userList = StreamUtils.toList(flowCopyList, x ->
        new FlowUser()
            .setType(TaskAssigneeType.COPY.getCode())
            .setProcessedBy(Convert.toStr(x.getUserId()))
            .setAssociated(taskId));
    FlowEngine.userService().saveBatch(userList);
}
```

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

当流程配置了 `autoPass=true` 时，如果下一节点的办理人包含当前用户，则自动完成审批。

```java
private void skipTask(Long taskId, FlowParams flowParams, Long instanceId, Boolean autoPass) {
    // 执行任务跳转
    taskService.skip(taskId, flowParams);

    // 获取下一节点任务
    List<FlowTask> flowTaskList = listByInstanceId(instanceId);
    if (CollUtil.isEmpty(flowTaskList)) {
        return;
    }

    // 获取任务办理人
    List<User> userList = FlowEngine.userService()
        .getByAssociateds(StreamUtils.toList(flowTaskList, FlowTask::getId));

    for (FlowTask task : flowTaskList) {
        if (!task.getId().equals(taskId) && autoPass) {
            // 检查当前用户是否是下一节点办理人
            List<User> users = StreamUtils.filter(userList,
                e -> ObjectUtil.equals(task.getId(), e.getAssociated())
                    && ObjectUtil.equal(e.getProcessedBy(), LoginHelper.getUserIdStr()));

            if (CollUtil.isEmpty(users)) {
                continue;
            }

            // 自动审批
            flowParams
                .message("流程引擎自动审批！")
                .variable(Map.of(
                    FlowConstant.SUBMIT, false,
                    FlowConstant.FLOW_COPY_LIST, Collections.emptyList(),
                    FlowConstant.MESSAGE_NOTICE, StringUtils.EMPTY
                ));
            skipTask(task.getId(), flowParams, instanceId, true);
        }
    }
}
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
approveBo.setFlowCopyList(List.of(new FlowCopyBo(10L, "HR专员")));
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

**问题原因**: 节点不是会签节点

**解决方案**: 检查节点的 `nodeRatio` 配置

```java
FlowNode flowNode = getByNodeCode(nodeCode, definitionId);
if (flowNode.getNodeRatio().compareTo(BigDecimal.ZERO) == 0) {
    throw new ServiceException("该节点不支持加签减签操作");
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
