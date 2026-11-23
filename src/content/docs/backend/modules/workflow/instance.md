---
title: "流程实例"
description: "流程实例是流程定义的具体执行，代表一次完整的业务流程执行过程。每当用户发起一个业务申请时，系统会创建一个对应的流程实例，并按照流程定义中配置的规则进行流转，直到流程结束。"
---
# 流程实例

## 概述

流程实例是流程定义的具体执行，代表一次完整的业务流程执行过程。每当用户发起一个业务申请时，系统会创建一个对应的流程实例，并按照流程定义中配置的规则进行流转，直到流程结束。

本文档详细介绍流程实例的创建、管理、查询和操作方法。

## 流程实例结构

### 核心属性

流程实例对应 warm-flow 2.x 的 `org.dromara.warm.flow.orm.entity.FlowInstance`（表 `flow_instance`），主要字段：

```java
/**
 * 流程实例实体（warm-flow 2.x，表 flow_instance）
 */
public class FlowInstance {
    /** 实例ID */
    private Long id;

    /** 流程定义ID */
    private Long definitionId;

    /** 流程名称 */
    private String flowName;

    /** 业务ID（关联业务数据的唯一标识） */
    private String businessId;

    /** 节点类型（实例当前所在节点） */
    private Integer nodeType;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 流程状态（见 BusinessStatusEnum） */
    private String flowStatus;

    /** 流程激活状态（0 挂起 1 激活） */
    private Integer activityStatus;

    /** 流程变量（JSON格式） */
    private String variable;

    /** 审批表单是否自定义 / 审批表单路径 */
    private String formCustom;
    private String formPath;

    /** 流程定义 JSON 快照 */
    private String defJson;

    /** 扩展信息 */
    private String ext;

    /** 是否删除 */
    private String delFlag;

    /** 租户ID */
    private String tenantId;

    /** 创建者（发起人ID） */
    private String createBy;

    /** 创建时间 */
    private Date createTime;

    /** 更新者 */
    private String updateBy;

    /** 更新时间 */
    private Date updateTime;
}
```

### 业务扩展表

为了更好地关联业务数据，系统提供了流程实例业务扩展表：

```java
/**
 * 流程实例业务扩展（表 flow_instance_biz_ext）
 */
public class FlowInstanceBizExt extends TenantEntity {
    /** 主键ID */
    @TableId(value = "id")
    private Long id;

    /** 流程实例ID */
    private Long instanceId;

    /** 业务ID */
    private String businessId;

    /** 业务编码（未传时启动流程自动生成） */
    private String businessCode;

    /** 业务标题 */
    private String businessTitle;

    /** 删除标志（0 存在 1 删除） */
    @TableLogic
    private String delFlag;
}
```

### 流程实例状态

流程实例状态由 `plus.ruoyi.common.core.enums.BusinessStatusEnum` 枚举定义：

```java
public enum BusinessStatusEnum {
    /** 已撤销 - 流程被发起人撤销 */
    CANCEL("cancel", "已撤销"),

    /** 草稿 - 流程已创建但未提交 */
    DRAFT("draft", "草稿"),

    /** 待审核 - 流程正在审批中 */
    WAITING("waiting", "待审核"),

    /** 已完成 - 流程到达结束节点 */
    FINISH("finish", "已完成"),

    /** 已作废 - 流程被管理员作废 */
    INVALID("invalid", "已作废"),

    /** 已退回 - 流程被驳回到申请人 */
    BACK("back", "已退回"),

    /** 已终止 - 流程被办理人终止 */
    TERMINATION("termination", "已终止"),

    /** 已重启 - warm-flow 2.x 新增编码，当前引擎版本不会主动写入，仅用于状态描述与字典翻译 */
    RESTART("restart", "已重启");

    /**
     * 运行中状态
     */
    public static List<String> runningStatus() {
        return List.of(DRAFT.status, WAITING.status, BACK.status, CANCEL.status);
    }

    /**
     * 已结束状态
     */
    public static List<String> finishStatus() {
        return List.of(FINISH.status, INVALID.status, TERMINATION.status);
    }
}
```

### 状态分类

| 分类 | 状态 | 说明 |
|------|------|------|
| 运行中 | draft, waiting, back, cancel | 流程仍可继续操作（撤销 / 退回后可重新提交） |
| 已结束 | finish, invalid, termination | 流程已终结 |

`restart` 不纳入上述两类，避免改变现有查询口径。

> 实例完成以**到达结束节点**为准：全局监听器 `WorkflowGlobalListener` 只在实例当前节点为结束节点、且已无待办任务时才把状态置为 `finish` 并发布完成事件。warm-flow 2.x 的流程可能停在定时 / 消息等待事件上，此时虽无待办，实例仍保持 `waiting`。

## API 接口

接口统一位于 `FlwInstanceController`（前缀 `/workflow/instance`），一览如下：

| 接口 | 方法 | 权限标识 | 说明 |
|------|------|---------|------|
| `/pageRunningInstances` | GET | `workflow:instance:query` | 运行中的实例 |
| `/pageFinishedInstances` | GET | `workflow:instance:query` | 已结束的实例 |
| `/pageCurrentInstances` | GET | `workflow:instance:query` | 我发起的实例 |
| `/getInstance/{businessId}` | GET | `workflow:instance:query` | 按业务ID查询实例 |
| `/getFlowHistory/{businessId}` | GET | `workflow:instance:query` | 流程图 / 审批记录 |
| `/cancelInstance` | PUT | `workflow:instance:cancel` | 撤销流程 |
| `/invalidInstance` | POST | `workflow:instance:invalid` | 作废流程 |
| `/activeInstance/{id}` | PUT | `workflow:instance:active` | 激活 / 挂起实例 |
| `/deleteByBusinessIds/{businessIds}` | DELETE | `workflow:instance:delete` | 按业务ID删除 |
| `/deleteByInstanceIds/{instanceIds}` | DELETE | `workflow:instance:delete` | 按实例ID删除 |
| `/deleteHisByInstanceIds/{instanceIds}` | DELETE | `workflow:instance:delete` | 删除已完成实例 |
| `/getVariable/{instanceId}` | GET | `workflow:instance:variableQuery` | 获取流程变量 |
| `/updateVariable` | PUT | `workflow:instance:variable` | 修改流程变量 |

### 查询正在运行的流程实例

**接口地址**: `GET /workflow/instance/pageRunningInstances`

**权限标识**: `workflow:instance:query`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| flowCode | String | 否 | 流程编码（模糊查询） |
| flowName | String | 否 | 流程名称（模糊查询） |
| nodeName | String | 否 | 当前节点名称 |
| category | String | 否 | 流程分类ID |
| businessId | String | 否 | 业务ID |
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
                "id": 1,
                "definitionId": 100,
                "flowCode": "leave_apply",
                "flowName": "请假申请",
                "businessId": "1001",
                "businessCode": "LV20240101001",
                "businessTitle": "张三的请假申请",
                "nodeType": 1,
                "nodeCode": "manager",
                "nodeName": "部门经理",
                "flowStatus": "waiting",
                "activityStatus": 1,
                "createBy": "1",
                "createByName": "张三",
                "createTime": "2024-01-01 10:00:00",
                "updateTime": "2024-01-01 10:30:00"
            }
        ],
        "total": 1
    }
}
```

### 查询已结束的流程实例

**接口地址**: `GET /workflow/instance/pageFinishedInstances`

**请求参数**: 同上

**权限标识**: `workflow:instance:query`

**说明**: 查询状态为 finish、invalid、termination 的流程实例（`BusinessStatusEnum.finishStatus()`）。运行中实例查询则对应 draft、waiting、back、cancel。

### 查询当前用户发起的流程

**接口地址**: `GET /workflow/instance/pageCurrentInstances`

**权限标识**: `workflow:instance:query`

**请求参数**: 同上

**说明**: 只查询当前登录用户作为发起人的流程实例，不限状态。

```java
@Override
public PageResult<FlowInstanceVo> pageCurrentInstances(FlowInstanceBo instanceBo, PageQuery pageQuery) {
    QueryWrapper<FlowInstanceBo> queryWrapper = buildQueryWrapper(instanceBo);
    // 只查询当前用户发起的流程
    queryWrapper.eq("fi.create_by", LoginHelper.getUserIdStr());
    Page<FlowInstanceVo> pageVo = flwInstanceMapper.selectInstanceList(pageQuery.build(), queryWrapper);
    return PageResult.of(pageVo);
}
```

### 根据业务ID查询流程实例

**接口地址**: `GET /workflow/instance/getInstance/{businessId}`

**权限标识**: `workflow:instance:query`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| businessId | Long | 是 | 业务ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "definitionId": 100,
        "flowCode": "leave_apply",
        "flowName": "请假申请",
        "version": "1",
        "businessId": "1001",
        "nodeType": 1,
        "nodeCode": "manager",
        "nodeName": "部门经理",
        "flowStatus": "waiting",
        "formPath": "/business/leave/apply",
        "formCustom": "Y",
        "category": "100",
        "createBy": "1",
        "createTime": "2024-01-01 10:00:00"
    }
}
```

### 获取流程历史记录

**接口地址**: `GET /workflow/instance/getFlowHistory/{businessId}`

**权限标识**: `workflow:instance:query`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| businessId | String | 是 | 业务ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "instanceId": 1,
        "list": [
            {
                "id": 101,
                "nodeCode": "manager",
                "nodeName": "部门经理",
                "approver": "2,3",
                "flowStatus": "pending",
                "createTime": "2024-01-01 10:30:00",
                "updateTime": null
            },
            {
                "id": 1,
                "nodeCode": "apply",
                "nodeName": "申请人",
                "approver": "1",
                "cooperateType": "none",
                "message": "提交申请",
                "flowStatus": "pass",
                "createTime": "2024-01-01 10:00:00",
                "updateTime": "2024-01-01 10:00:00"
            }
        ]
    }
}
```

**处理逻辑**:

```java
@Override
public Map<String, Object> getFlowHistory(String businessId) {
    FlowInstance flowInstance = this.getInstanceByBusinessId(businessId);
    if (ObjectUtil.isNull(flowInstance)) {
        throw new ServiceException(ExceptionCons.NOT_FOUNT_INSTANCE);
    }
    Long instanceId = flowInstance.getId();

    // 1. 组装待审批任务（运行中的任务）
    List<FlowHisTaskVo> runningTaskVos = new ArrayList<>();
    List<FlowTask> runningTasks = flwTaskService.listByInstanceId(instanceId);
    if (CollUtil.isNotEmpty(runningTasks)) {
        runningTaskVos = BeanUtil.copyToList(runningTasks, FlowHisTaskVo.class);
        // 获取办理人信息
        List<User> associatedUsers = FlowEngine.userService()
            .getByAssociateds(StreamUtils.toList(runningTasks, FlowTask::getId));
        Map<Long, List<User>> taskUserMap = StreamUtils.groupByKey(associatedUsers, User::getAssociated);
        for (FlowHisTaskVo vo : runningTaskVos) {
            // 状态列保留待办任务自身的 flow_status（pending 待审批 / back 退回），
            // 不覆盖成实例维度编码：审批记录这一列用任务状态字典渲染
            vo.setUpdateTime(null);
            vo.setRunDuration(null);
            List<User> users = taskUserMap.get(vo.getId());
            if (CollUtil.isNotEmpty(users)) {
                vo.setApprover(StreamUtils.join(users, User::getProcessedBy));
            }
        }
    }

    // 2. 组装历史任务（已处理任务，仅中间节点）
    List<FlowHisTaskVo> hisTaskVos = new ArrayList<>();
    List<FlowHisTask> hisTasks = flowHisTaskMapper.selectList(
        new LambdaQueryWrapper<FlowHisTask>()
            .eq(FlowHisTask::getInstanceId, instanceId)
            .eq(FlowHisTask::getNodeType, NodeType.BETWEEN.getKey())
            .orderByDesc(FlowHisTask::getUpdateTime));
    if (CollUtil.isNotEmpty(hisTasks)) {
        hisTaskVos = BeanUtil.copyToList(hisTasks, FlowHisTaskVo.class);
    }

    // 3. 合并结果：待审批任务在前，历史任务在后
    List<FlowHisTaskVo> combinedList = new ArrayList<>();
    combinedList.addAll(runningTaskVos);
    combinedList.addAll(hisTaskVos);

    return Map.of("list", combinedList, "instanceId", instanceId);
}
```

### 撤销流程

**接口地址**: `PUT /workflow/instance/cancelInstance`

**权限标识**: `workflow:instance:cancel`

**请求参数**:

```json
{
    "businessId": "1001",
    "message": "申请有误，撤销重新提交"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| businessId | String | 是 | 业务ID |
| message | String | 否 | 撤销原因 |

**撤销规则**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean cancelInstance(FlowCancelBo bo) {
    Instance instance = getInstanceByBusinessId(bo.getBusinessId());
    if (instance == null) {
        throw new ServiceException(ExceptionCons.NOT_FOUNT_INSTANCE);
    }

    // 只有流程发起人或超级管理员可以撤销
    String userIdStr = LoginHelper.getUserIdStr();
    if (!LoginHelper.isSuperAdmin() && !instance.getCreateBy().equals(userIdStr)) {
        throw new ServiceException("权限不足，无法撤销流程!");
    }

    // 检查流程状态是否允许撤销
    BusinessStatusEnum.checkCancelStatus(instance.getFlowStatus());

    // 撤销由引擎把实例置为 cancel；任务侧显式写 cancel，审批记录里才能看出是撤销而不是普通办理
    RevokeCommand command = new RevokeCommand();
    OperatorContext operator = new OperatorContext(userIdStr);
    operator.setIgnore(true);
    command.setOperator(operator);
    command.setInstanceId(instance.getId());
    command.setMessage(bo.getMessage());
    command.setTaskStatus(BusinessStatusEnum.CANCEL.getStatus());
    FlowEngine.workflow().revoke(command);
    return true;
}
```

**可撤销的状态**:
- draft（草稿）
- waiting（待审核）

**不可撤销的状态**:
- back（已退回）
- finish（已完成）
- invalid（已作废）
- termination（已终止）
- cancel（已撤销）

撤销后实例状态为 `cancel`，仍属于运行中状态，申请人可以修改后重新提交。

### 作废流程

**接口地址**: `POST /workflow/instance/invalidInstance`

**权限标识**: `workflow:instance:invalid`

**请求参数**:

```json
{
    "id": 1,
    "comment": "业务变更，作废该流程"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程实例ID |
| comment | String | 否 | 作废原因 |

**作废逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean invalidInstance(FlowInvalidBo bo) {
    Instance instance = insService.getById(bo.getId());
    if (instance != null) {
        // 检查状态是否允许作废（已完成 / 已作废 / 已终止不可作废）
        BusinessStatusEnum.checkInvalidStatus(instance.getFlowStatus());
    }

    // 作废复用引擎的终止命令，按实例执行，并显式指定实例 / 任务状态为 invalid
    TerminateCommand command = new TerminateCommand();
    OperatorContext operator = new OperatorContext(LoginHelper.getUserIdStr());
    operator.setIgnore(true);
    command.setOperator(operator);
    command.setInstanceId(bo.getId());
    command.setMessage(bo.getComment());
    command.setFlowStatus(BusinessStatusEnum.INVALID.getStatus());
    command.setTaskStatus(TaskStatus.INVALID.getKey());
    FlowEngine.workflow().terminate(command);
    return true;
}
```

**权限要求**:
- 需要 `workflow:instance:invalid` 权限标识
- 命令设置了 `operator.setIgnore(true)`，跳过引擎的办理人校验

### 激活 / 挂起流程实例

**接口地址**: `PUT /workflow/instance/activeInstance/{id}?active=true`

**权限标识**: `workflow:instance:active`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程实例ID（路径参数） |
| active | boolean | 是 | `true` 激活，`false` 挂起（查询参数） |

**说明**: 直接调用引擎 `insService.active(id)` / `insService.unActive(id)`，修改实例的 `activityStatus`（1 激活 / 0 挂起），返回 `R<Boolean>`。

### 删除流程实例

三个删除接口都需要 `workflow:instance:delete` 权限，且在 Service 内再校验：只有**流程发起人或超级管理员**才能删除，否则抛出「权限不足，无法删除流程实例信息!」。删除前会逐个发布 `ProcessDeleteEvent` 通知业务系统。

#### 按业务ID删除

**接口地址**: `DELETE /workflow/instance/deleteByBusinessIds/{businessIds}`

**请求参数**: 路径参数 `businessIds`，多个以逗号分隔，如 `/workflow/instance/deleteByBusinessIds/1001,1002`

**说明**: 删除流程实例及其任务、历史任务等关联数据（`insService.remove`），并额外清理抄送人记录。

#### 按实例ID删除

**接口地址**: `DELETE /workflow/instance/deleteByInstanceIds/{instanceIds}`

**请求参数**: 路径参数 `instanceIds`，多个以逗号分隔，如 `/workflow/instance/deleteByInstanceIds/1,2,3`

**删除逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean deleteByInstanceIds(List<Long> instanceIds) {
    List<FlowInstance> flowInstances = flowInstanceMapper.selectByIds(instanceIds);
    if (CollUtil.isEmpty(flowInstances)) {
        return false;
    }

    // 权限校验（发起人或超管）+ 发布删除事件
    processDeleteHandler(flowInstances);

    // 以查到的实例为准（入参可能含不存在的 id）
    List<Long> validInstanceIds = StreamUtils.toList(flowInstances, FlowInstance::getId);
    // 抄送记录只在历史表、抄送人挂在抄送历史主键上，insService.remove 不会清理，需单独删除
    deleteCopyTaskUsers(validInstanceIds);
    return insService.remove(validInstanceIds);
}
```

#### 删除已完成的流程实例

**接口地址**: `DELETE /workflow/instance/deleteHisByInstanceIds/{instanceIds}`

**请求参数**: 路径参数 `instanceIds`，多个以逗号分隔

**说明**: 彻底清理流程的所有数据，包括：
- 流程实例
- 待办任务
- 历史任务
- 任务办理人与抄送人（`flow_user`）

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean deleteHisByInstanceIds(List<Long> instanceIds) {
    List<FlowInstance> flowInstances = flowInstanceMapper.selectByIds(instanceIds);
    if (CollUtil.isEmpty(flowInstances)) {
        return false;
    }

    // 1. 权限校验 + 发布删除事件
    processDeleteHandler(flowInstances);
    List<Long> validInstanceIds = StreamUtils.toList(flowInstances, FlowInstance::getId);

    // 2. 删除运行中任务的办理人 + 抄送历史关联的抄送人
    List<FlowTask> flowTaskList = flwTaskService.listByInstanceIds(validInstanceIds);
    List<Long> taskIds = new ArrayList<>(StreamUtils.toList(flowTaskList, FlowTask::getId));
    taskIds.addAll(selectCopyHisIds(validInstanceIds));
    deleteTaskUsers(taskIds);

    // 3. 删除任务、历史任务、实例
    FlowEngine.taskService().deleteByInsIds(validInstanceIds);
    FlowEngine.hisTaskService().deleteByInsIds(validInstanceIds);
    FlowEngine.insService().removeByIds(validInstanceIds);
    return true;
}
```

> `selectCopyHisIds` 查询的是 `flow_his_task` 中 `flow_status = copy` 的记录主键：抄送人 `flow_user.associated` 关联的是抄送历史主键 `his_task.id`，而不是 `task_id`。

### 获取流程变量

**接口地址**: `GET /workflow/instance/getVariable/{instanceId}`

**权限标识**: `workflow:instance:variableQuery`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| instanceId | Long | 是 | 流程实例ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "variableList": [
            {"key": "initiator", "value": "1"},
            {"key": "initiatorDeptId", "value": "100"},
            {"key": "businessId", "value": "1001"},
            {"key": "days", "value": 3},
            {"key": "leaveType", "value": "annual"}
        ],
        "variable": "{\"initiator\":\"1\",\"initiatorDeptId\":\"100\",...}"
    }
}
```

### 更新流程变量

**接口地址**: `PUT /workflow/instance/updateVariable`

**权限标识**: `workflow:instance:variable`

**请求参数**:

```json
{
    "instanceId": 1,
    "key": "days",
    "value": "5"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| instanceId | Long | 是 | 流程实例ID |
| key | String | 是 | 变量名 |
| value | String | 是 | 变量值（以字符串写入） |

**更新规则**:
- 只能更新已存在的变量
- 不能新增变量

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean updateVariable(FlowVariableBo bo) {
    FlowInstance flowInstance = flowInstanceMapper.selectById(bo.getInstanceId());
    if (flowInstance == null) {
        throw new ServiceException(ExceptionCons.NOT_FOUNT_INSTANCE);
    }

    Map<String, Object> variableMap = new HashMap<>(
        Optional.ofNullable(flowInstance.getVariableMap()).orElse(Collections.emptyMap()));

    // 检查变量是否存在
    if (!variableMap.containsKey(bo.getKey())) {
        log.error("变量不存在: {}", bo.getKey());
        return false;
    }

    // 更新变量
    variableMap.put(bo.getKey(), bo.getValue());
    flowInstance.setVariable(FlowEngine.jsonConvert.objToStr(variableMap));
    flowInstanceMapper.updateById(flowInstance);
    return true;
}
```

### 设置流程变量

**说明**: `IFlwInstanceService#setVariable(Long instanceId, Map<String, Object> variable)` 仅作为 Service 方法供后端代码调用，**没有对应的 HTTP 接口**。与 `updateVariable` 不同，它可以新增变量（合并覆盖）。

```java
@Override
public void setVariable(Long instanceId, Map<String, Object> variable) {
    Instance instance = insService.getById(instanceId);
    if (instance != null) {
        // 合并变量（新增或覆盖）
        taskService.mergeVariable(instance, variable);
        insService.updateById(instance);
    }
}
```

## 视图对象

### 流程实例视图

```java
@Data
public class FlowInstanceVo {
    /** 实例ID */
    private Long id;

    /** 流程定义ID */
    private Long definitionId;

    /** 流程编码 */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 流程版本 */
    private String version;

    /** 业务ID */
    private String businessId;

    /** 业务编码 */
    private String businessCode;

    /** 业务标题 */
    private String businessTitle;

    /** 节点类型 */
    private Integer nodeType;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 流程变量 */
    private String variable;

    /** 流程状态 */
    private String flowStatus;

    /** 流程状态名称 */
    private String flowStatusName;

    /** 流程激活状态（0 挂起 1 激活） */
    private Integer activityStatus;

    /** 表单路径 */
    private String formPath;

    /** 是否自定义表单 */
    private String formCustom;

    /** 扩展字段 */
    private String ext;

    /** 流程分类ID / 名称 */
    private String category;
    private String categoryName;

    /** 创建者ID */
    private String createBy;

    /** 创建者名称 */
    private String createByName;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
```

### 请求对象

#### 撤销流程请求

```java
@Data
public class FlowCancelBo {
    /** 业务ID */
    @NotBlank(message = "业务ID不能为空", groups = AddGroup.class)
    private String businessId;

    /** 撤销原因 */
    private String message;
}
```

#### 作废流程请求

```java
@Data
public class FlowInvalidBo {
    /** 流程实例ID */
    @NotNull(message = "流程实例id为空", groups = AddGroup.class)
    private Long id;

    /** 作废原因 */
    private String comment;
}
```

#### 流程变量请求

```java
@Data
public class FlowVariableBo {
    /** 流程实例ID */
    @NotNull(message = "流程实例id为空", groups = AddGroup.class)
    private Long instanceId;

    /** 变量名 */
    @NotNull(message = "流程变量key为空", groups = AddGroup.class)
    private String key;

    /** 变量值 */
    @NotNull(message = "流程变量value为空", groups = AddGroup.class)
    private String value;
}
```

## 状态流转

### 状态转换规则

```text
                    ┌─────────────┐
                    │   草稿      │
                    │   (draft)   │
                    └──────┬──────┘
                           │ 提交申请
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   已撤销    │◄────│   待审核    │────►│   已完成    │
│  (cancel)   │ 撤销│  (waiting)  │到达  │  (finish)   │
└──────┬──────┘     └──────┬──────┘结束  └─────────────┘
       │                   │      节点
       │      ┌────────────┼────────────┐
       │      │ 驳回到     │ 作废       │ 终止
       │      ▼ 申请人     ▼            ▼
       │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │ │   已退回    │ │   已作废    │ │   已终止    │
       │ │   (back)    │ │  (invalid)  │ │(termination)│
       │ └──────┬──────┘ └─────────────┘ └─────────────┘
       │        │
       │        │ 重新提交
       └────────┴─────────────────────────────────────┐
                                                      │
                    ┌─────────────┐                   │
                    │   待审核    │◄──────────────────┘
                    │  (waiting)  │
                    └─────────────┘
```

- 撤销（cancel）与退回（back）后都可由申请人重新提交，重新提交时会触发提交事件
- 驳回到中间节点时实例仍为 `waiting`，只有驳回到申请人节点才变为 `back`
- 作废 / 终止对除已完成、已作废、已终止外的状态都可执行

### 状态校验方法

```java
public enum BusinessStatusEnum {
    // ...

    /**
     * 启动流程校验：waiting / finish / invalid / termination / 空 不允许
     */
    public static void checkStartStatus(String status) {
        if (WAITING.getStatus().equals(status)) {
            throw new ServiceException("该单据已提交过申请,正在审批中！");
        } else if (FINISH.getStatus().equals(status)) {
            throw new ServiceException("该单据已完成申请！");
        } else if (INVALID.getStatus().equals(status)) {
            throw new ServiceException("该单据已作废！");
        } else if (TERMINATION.getStatus().equals(status)) {
            throw new ServiceException("该单据已终止！");
        } else if (StringUtils.isBlank(status)) {
            throw new ServiceException("流程状态为空！");
        }
    }

    /**
     * 撤销流程校验：cancel / finish / invalid / termination / back / 空 不允许
     */
    public static void checkCancelStatus(String status) { /* 逐一判断并抛出对应提示 */ }

    /**
     * 驳回流程校验：back / finish / invalid / termination / cancel / 空 不允许
     */
    public static void checkBackStatus(String status) { /* 逐一判断并抛出对应提示 */ }

    /**
     * 作废、终止流程校验：finish / invalid / termination / 空 不允许
     */
    public static void checkInvalidStatus(String status) { /* 逐一判断并抛出对应提示 */ }

    /**
     * 是否为草稿、已撤销或已退回（办理时据此判断是否为申请人提交）
     */
    public static boolean isDraftOrCancelOrBack(String status) {
        return DRAFT.status.equals(status) || CANCEL.status.equals(status) || BACK.status.equals(status);
    }

    /**
     * 是否为撤销、退回、作废、终止
     */
    public static boolean initialState(String status) {
        return CANCEL.status.equals(status) || BACK.status.equals(status)
            || INVALID.status.equals(status) || TERMINATION.status.equals(status);
    }
}
```

| 校验方法 | 允许的状态 | 提示示例 |
|---------|-----------|---------|
| `checkStartStatus` | draft、cancel、back | 该单据已提交过申请,正在审批中！ |
| `checkCancelStatus` | draft、waiting | 该单据已退回！ |
| `checkBackStatus` | draft、waiting | 该单据已撤销！ |
| `checkInvalidStatus` | draft、waiting、back、cancel | 该单据已完成申请！ |

## 事件机制

`FlowProcessEventHandler` 负责发布三类 Spring 事件（位于 `plus.ruoyi.common.core.domain.event`），业务模块用 `@EventListener` 监听即可：

| 事件 | 发布时机 | 主要字段 |
|------|---------|---------|
| `ProcessEvent` | 流程状态变化：申请人提交、撤销、退回、作废、终止、完成 | tenantId、flowCode、instanceId、businessId、nodeType、nodeCode、nodeName、status、params、submit |
| `ProcessTaskEvent` | 流转后生成下一节点任务 | tenantId、flowCode、instanceId、businessId、nodeCode、nodeName、taskId、status、params |
| `ProcessDeleteEvent` | 删除流程实例 | tenantId、flowCode、businessId |

`ProcessEvent` 与 `ProcessTaskEvent` 由全局监听器 `WorkflowGlobalListener` 在任务完成（`finish`）阶段触发；其中「已完成」只在实例到达结束节点且无待办时发布。

### 删除事件

当流程实例被删除时，系统会发布删除事件，通知业务系统：

```java
@Component
public class FlowProcessEventHandler {

    /**
     * 删除流程监听
     */
    public void processDeleteHandler(String flowCode, String businessId) {
        String tenantId = TenantHelper.getTenantId();
        ProcessDeleteEvent processDeleteEvent = new ProcessDeleteEvent();
        processDeleteEvent.setTenantId(tenantId);
        processDeleteEvent.setFlowCode(flowCode);
        processDeleteEvent.setBusinessId(businessId);
        SpringUtils.context().publishEvent(processDeleteEvent);
    }
}
```

### 监听删除事件

业务系统可以监听删除事件，进行相应的数据清理：

```java
@Component
public class LeaveProcessEventListener {

    @Autowired
    private LeaveService leaveService;

    @EventListener
    public void handleDeleteEvent(ProcessDeleteEvent event) {
        String flowCode = event.getFlowCode();
        String businessId = event.getBusinessId();

        if ("leave_apply".equals(flowCode)) {
            // 删除请假业务数据
            leaveService.deleteById(Long.valueOf(businessId));
        }
    }
}
```

## 使用示例

### 查询我发起的流程

```java
// 前端调用
GET /workflow/instance/pageCurrentInstances?pageNum=1&pageSize=10

// 后端实现
@Override
public PageResult<FlowInstanceVo> pageCurrentInstances(FlowInstanceBo instanceBo, PageQuery pageQuery) {
    QueryWrapper<FlowInstanceBo> queryWrapper = buildQueryWrapper(instanceBo);
    queryWrapper.eq("fi.create_by", LoginHelper.getUserIdStr());
    Page<FlowInstanceVo> pageVo = flwInstanceMapper.selectInstanceList(pageQuery.build(), queryWrapper);
    return PageResult.of(pageVo);
}
```

### 撤销流程

```java
// 构建撤销参数
FlowCancelBo cancelBo = new FlowCancelBo();
cancelBo.setBusinessId("1001");
cancelBo.setMessage("信息填写有误，需要修改");

// 撤销流程
boolean result = flwInstanceService.cancelInstance(cancelBo);
if (result) {
    // 撤销成功，更新业务数据状态
    leaveService.updateStatus(1001L, LeaveStatus.CANCELED);
}
```

### 获取流程审批进度

```java
// 获取流程历史
Map<String, Object> history = flwInstanceService.getFlowHistory("1001");

List<FlowHisTaskVo> taskList = (List<FlowHisTaskVo>) history.get("list");
Long instanceId = (Long) history.get("instanceId");

// 展示审批进度
for (FlowHisTaskVo task : taskList) {
    System.out.println(String.format(
        "节点: %s, 办理人: %s, 状态: %s, 意见: %s",
        task.getNodeName(),
        task.getApprover(),
        task.getFlowStatus(),
        task.getMessage()
    ));
}
```

### 动态修改流程变量

```java
// 场景：审批过程中需要修改请假天数
FlowVariableBo variableBo = new FlowVariableBo();
variableBo.setInstanceId(1L);
variableBo.setKey("days");
variableBo.setValue(5);

boolean result = flwInstanceService.updateVariable(variableBo);
```

## 最佳实践

### 1. 业务数据关联

**使用业务扩展表**:
```java
// 启动流程时设置业务扩展信息
StartProcessBo startProcessBo = new StartProcessBo();
startProcessBo.setBusinessId(String.valueOf(leave.getId()));
startProcessBo.setFlowCode("leave_apply");

FlowInstanceBizExt bizExt = new FlowInstanceBizExt();
bizExt.setBusinessTitle(leave.getApplicantName() + "的请假申请");
// 不设置时启动流程会自动生成业务编码
bizExt.setBusinessCode("LV" + System.currentTimeMillis());
startProcessBo.setBizExt(bizExt);
```

### 2. 状态同步

**监听流程事件更新业务状态**:
```java
@Component
public class LeaveFlowListener {

    @EventListener
    public void handleProcessEvent(ProcessEvent event) {
        if (!"leave_apply".equals(event.getFlowCode())) {
            return;
        }

        String businessId = event.getBusinessId();
        // ProcessEvent 的状态字段为 status，取值见 BusinessStatusEnum
        String flowStatus = event.getStatus();

        // 同步更新请假单状态
        LeaveStatus leaveStatus = mapFlowStatusToLeaveStatus(flowStatus);
        leaveService.updateStatus(Long.valueOf(businessId), leaveStatus);
    }

    private LeaveStatus mapFlowStatusToLeaveStatus(String flowStatus) {
        return switch (flowStatus) {
            case "waiting" -> LeaveStatus.PENDING;
            case "finish" -> LeaveStatus.APPROVED;
            case "back" -> LeaveStatus.REJECTED;
            case "cancel" -> LeaveStatus.CANCELED;
            case "invalid", "termination" -> LeaveStatus.INVALID;
            default -> LeaveStatus.DRAFT;
        };
    }
}
```

### 3. 查询优化

**使用联表查询提升性能**:
```xml
<select id="selectInstanceList" resultMap="FlowInstanceResult">
    select fi.id, fi.create_time, fi.update_time, fi.tenant_id, fi.del_flag,
           fi.definition_id, fi.business_id,
           fi.node_type, fi.node_code, fi.node_name,
           fi.variable, fi.flow_status, fi.activity_status, fi.create_by, fi.ext,
           fd.flow_name, fd.flow_code, fd.version, fd.form_custom, fd.form_path, fd.category,
           biz.business_code, biz.business_title
    from flow_instance fi
             left join flow_definition fd on fi.definition_id = fd.id
             left join flow_instance_biz_ext biz on biz.instance_id = fi.id
    ${ew.getCustomSqlSegment}
</select>
```

> 查询条件由 `buildQueryWrapper` 构建，固定附加 `fi.del_flag = '0'` 并按 `fi.create_time` 倒序。

## 常见问题

### 1. 流程实例无法撤销

**问题原因**:
- 流程状态不在可撤销范围内（只有 draft、waiting 可撤销，已退回的单据不能撤销）
- 当前用户既不是流程发起人，也不是超级管理员
- 缺少 `workflow:instance:cancel` 权限标识

**解决方案**:
```java
// 检查状态（不允许时抛出「该单据已退回！」等提示）
Instance instance = insService.getById(instanceId);
BusinessStatusEnum.checkCancelStatus(instance.getFlowStatus());

// 检查权限
if (!LoginHelper.isSuperAdmin() && !instance.getCreateBy().equals(LoginHelper.getUserIdStr())) {
    throw new ServiceException("权限不足，无法撤销流程!");
}
```

### 2. 删除流程实例失败

**问题原因**:
- 当前用户不是流程发起人或超级管理员（提示「权限不足，无法删除流程实例信息!」）
- 缺少 `workflow:instance:delete` 权限标识
- 传入的 ID 均不存在（返回 false）

**解决方案**:
```java
// 使用 deleteHisByInstanceIds 彻底清理
// 该方法会一并删除任务、历史任务、办理人与抄送人记录
flwInstanceService.deleteHisByInstanceIds(instanceIds);
```

### 3. 流程变量丢失

**问题原因**:
- 流程变量未正确传递
- JSON 序列化问题

**解决方案**:
```java
// 启动流程时确保变量正确设置
Map<String, Object> variables = new HashMap<>();
variables.put("days", leave.getDays());
variables.put("leaveType", leave.getLeaveType());
// 过滤空值
variables.entrySet().removeIf(entry -> Objects.isNull(entry.getValue()));
startProcessBo.setVariables(variables);
```

### 4. 并发操作冲突

**问题描述**:
- 多人同时操作同一流程实例

**解决方案**:
```java
// 使用乐观锁或分布式锁
@Transactional(rollbackFor = Exception.class)
public boolean cancelInstance(FlowCancelBo bo) {
    // 获取锁
    String lockKey = "workflow:instance:" + bo.getBusinessId();
    boolean locked = redissonClient.getLock(lockKey).tryLock();
    if (!locked) {
        throw new ServiceException("流程正在被其他用户操作，请稍后重试");
    }
    try {
        // 执行撤销操作
        return doCancelInstance(bo);
    } finally {
        redissonClient.getLock(lockKey).unlock();
    }
}
```
