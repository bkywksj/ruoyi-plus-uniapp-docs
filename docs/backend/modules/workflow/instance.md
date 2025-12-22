# 流程实例

## 概述

流程实例是流程定义的具体执行，代表一次完整的业务流程执行过程。每当用户发起一个业务申请时，系统会创建一个对应的流程实例，并按照流程定义中配置的规则进行流转，直到流程结束。

本文档详细介绍流程实例的创建、管理、查询和操作方法。

## 流程实例结构

### 核心属性

```java
/**
 * 流程实例实体
 */
public class FlowInstance {
    /** 实例ID */
    private Long id;

    /** 流程定义ID */
    private Long definitionId;

    /** 业务ID（关联业务数据的唯一标识） */
    private String businessId;

    /** 节点类型 */
    private Integer nodeType;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 流程状态 */
    private String flowStatus;

    /** 流程变量（JSON格式） */
    private String variable;

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

    /** 表名（业务数据所在表） */
    private String tableName;

    /** 扩展信息（JSON格式） */
    private String ext;
}
```

### 流程实例状态

流程实例状态由 `BusinessStatusEnum` 枚举定义：

```java
public enum BusinessStatusEnum {
    /** 草稿 - 流程已创建但未提交 */
    DRAFT("draft", "草稿"),

    /** 待审核 - 流程正在审批中 */
    WAITING("waiting", "待审核"),

    /** 已完成 - 流程正常结束 */
    FINISH("finish", "已完成"),

    /** 已作废 - 流程被管理员作废 */
    INVALID("invalid", "已作废"),

    /** 已退回 - 流程被驳回到发起人 */
    BACK("back", "已退回"),

    /** 已终止 - 流程被办理人终止 */
    TERMINATION("termination", "已终止"),

    /** 已撤销 - 流程被发起人撤销 */
    CANCEL("cancel", "已撤销");

    /**
     * 运行中状态
     */
    public static List<String> runningStatus() {
        return List.of(DRAFT.status, WAITING.status, BACK.status);
    }

    /**
     * 已结束状态
     */
    public static List<String> finishStatus() {
        return List.of(FINISH.status, INVALID.status, TERMINATION.status, CANCEL.status);
    }
}
```

### 状态分类

| 分类 | 状态 | 说明 |
|------|------|------|
| 运行中 | draft, waiting, back | 流程仍可继续操作 |
| 已结束 | finish, invalid, termination, cancel | 流程已终结 |

## API 接口

### 查询正在运行的流程实例

**接口地址**: `GET /workflow/instance/pageRunningInstances`

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
                "title": "张三的请假申请",
                "nodeType": 1,
                "nodeCode": "manager",
                "nodeName": "部门经理",
                "flowStatus": "waiting",
                "createBy": 1,
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

**说明**: 查询状态为 finish、invalid、termination、cancel 的流程实例。

### 查询当前用户发起的流程

**接口地址**: `GET /workflow/instance/pageCurrentInstances`

**请求参数**: 同上

**说明**: 只查询当前登录用户作为发起人的流程实例。

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

**接口地址**: `GET /workflow/instance/getByBusinessId/{businessId}`

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
        "createBy": 1,
        "createTime": "2024-01-01 10:00:00"
    }
}
```

### 获取流程历史记录

**接口地址**: `GET /workflow/instance/getFlowHistory/{businessId}`

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
                "approver": "2",
                "flowStatus": "waiting",
                "createTime": "2024-01-01 10:30:00",
                "updateTime": null
            },
            {
                "id": 1,
                "nodeCode": "apply",
                "nodeName": "申请人",
                "approver": "1",
                "approverName": "张三",
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
    Long instanceId = flowInstance.getId();

    // 1. 组装待审批任务（运行中的任务）
    List<FlowHisTaskVo> runningTaskVos = new ArrayList<>();
    List<FlowTask> runningTasks = flwTaskService.listByInstanceId(instanceId);
    if (CollUtil.isNotEmpty(runningTasks)) {
        runningTaskVos = BeanUtil.copyToList(runningTasks, FlowHisTaskVo.class);
        // 获取办理人信息
        List<User> associatedUsers = FlowEngine.userService()
            .getByAssociateds(StreamUtils.toList(runningTasks, FlowTask::getId));
        // 设置状态为待审核
        for (FlowHisTaskVo vo : runningTaskVos) {
            vo.setFlowStatus(TaskStatusEnum.WAITING.getStatus());
            vo.setUpdateTime(null);
        }
    }

    // 2. 组装历史任务（已处理任务）
    List<FlowHisTask> hisTasks = flowHisTaskMapper.selectList(
        new LambdaQueryWrapper<FlowHisTask>()
            .eq(FlowHisTask::getInstanceId, instanceId)
            .eq(FlowHisTask::getNodeType, NodeType.BETWEEN.getKey())
            .orderByDesc(FlowHisTask::getUpdateTime));

    // 3. 合并结果：待审批任务在前，历史任务在后
    List<FlowHisTaskVo> combinedList = new ArrayList<>();
    combinedList.addAll(runningTaskVos);
    combinedList.addAll(hisTaskVos);

    return Map.of("list", combinedList, "instanceId", instanceId);
}
```

### 撤销流程

**接口地址**: `POST /workflow/instance/cancelInstance`

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
        throw new ServiceException("未找到对应的流程实例");
    }

    // 检查流程状态是否允许撤销
    BusinessStatusEnum.checkCancelStatus(instance.getFlowStatus());

    FlowParams flowParams = FlowParams.build()
        .message(bo.getMessage())
        .flowStatus(BusinessStatusEnum.CANCEL.getStatus())
        .hisStatus(BusinessStatusEnum.CANCEL.getStatus())
        .handler(LoginHelper.getUserIdStr())
        .ignore(true);

    taskService.revoke(instance.getId(), flowParams);
    return true;
}
```

**可撤销的状态**:
- draft（草稿）
- waiting（待审核）
- back（已退回）

**不可撤销的状态**:
- finish（已完成）
- invalid（已作废）
- termination（已终止）
- cancel（已撤销）

### 作废流程

**接口地址**: `POST /workflow/instance/invalidInstance`

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
        // 检查状态是否允许作废
        BusinessStatusEnum.checkInvalidStatus(instance.getFlowStatus());
    }

    FlowParams flowParams = FlowParams.build()
        .message(bo.getComment())
        .flowStatus(BusinessStatusEnum.INVALID.getStatus())
        .hisStatus(TaskStatusEnum.INVALID.getStatus())
        .ignore(true);

    taskService.terminationByInsId(bo.getId(), flowParams);
    return true;
}
```

**权限要求**:
- 通常需要管理员权限
- 或流程中配置了作废权限的办理人

### 删除流程实例

#### 按业务ID删除

**接口地址**: `DELETE /workflow/instance/deleteByBusinessIds`

**请求参数**:

```json
{
    "businessIds": ["1001", "1002"]
}
```

**说明**: 同时删除流程实例、任务、历史任务等关联数据。

#### 按实例ID删除

**接口地址**: `DELETE /workflow/instance/deleteByInstanceIds`

**请求参数**:

```json
{
    "instanceIds": [1, 2, 3]
}
```

**删除逻辑**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean deleteByInstanceIds(List<Long> instanceIds) {
    List<Instance> instances = insService.getByIds(instanceIds);
    if (CollUtil.isEmpty(instances)) {
        return false;
    }

    // 触发删除事件（通知业务系统）
    instances.forEach(instance -> {
        Definition definition = definitionMap.get(instance.getDefinitionId());
        flowProcessEventHandler.processDeleteHandler(
            definition.getFlowCode(),
            instance.getBusinessId()
        );
    });

    // 删除实例
    boolean remove = insService.remove(instanceIds);
    return remove;
}
```

#### 删除已完成的流程实例

**接口地址**: `DELETE /workflow/instance/deleteHisByInstanceIds`

**请求参数**:

```json
{
    "instanceIds": [1, 2, 3]
}
```

**说明**: 彻底清理已完成流程的所有数据，包括：
- 流程实例
- 待办任务
- 历史任务
- 任务办理人

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean deleteHisByInstanceIds(List<Long> instanceIds) {
    // 1. 触发删除事件
    instances.forEach(instance -> {
        flowProcessEventHandler.processDeleteHandler(
            definition.getFlowCode(),
            instance.getBusinessId()
        );
    });

    // 2. 删除任务办理人
    List<FlowTask> flowTaskList = flwTaskService.listByInstanceIds(instanceIds);
    if (CollUtil.isNotEmpty(flowTaskList)) {
        FlowEngine.userService().deleteByTaskIds(
            StreamUtils.toList(flowTaskList, FlowTask::getId));
    }

    // 3. 删除任务
    FlowEngine.taskService().deleteByInsIds(instanceIds);

    // 4. 删除历史任务
    FlowEngine.hisTaskService().deleteByInsIds(instanceIds);

    // 5. 删除实例
    FlowEngine.insService().removeByIds(instanceIds);

    return true;
}
```

### 获取流程变量

**接口地址**: `GET /workflow/instance/getVariable/{instanceId}`

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

**请求参数**:

```json
{
    "instanceId": 1,
    "key": "days",
    "value": 5
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| instanceId | Long | 是 | 流程实例ID |
| key | String | 是 | 变量名 |
| value | Object | 是 | 变量值 |

**更新规则**:
- 只能更新已存在的变量
- 不能新增变量

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean updateVariable(FlowVariableBo bo) {
    FlowInstance flowInstance = flowInstanceMapper.selectById(bo.getInstanceId());

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

**接口地址**: `PUT /workflow/instance/setVariable`

**请求参数**:

```json
{
    "instanceId": 1,
    "variable": {
        "newKey": "newValue",
        "days": 5
    }
}
```

**说明**: 与 `updateVariable` 不同，此接口可以新增变量。

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

    /** 表单路径 */
    private String formPath;

    /** 是否自定义表单 */
    private String formCustom;

    /** 流程分类 */
    private String category;

    /** 创建者ID */
    private Long createBy;

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
    @NotBlank(message = "业务ID不能为空")
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
    @NotNull(message = "实例ID不能为空")
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
    @NotNull(message = "实例ID不能为空")
    private Long instanceId;

    /** 变量名 */
    @NotBlank(message = "变量名不能为空")
    private String key;

    /** 变量值 */
    @NotNull(message = "变量值不能为空")
    private Object value;
}
```

## 状态流转

### 状态转换规则

```
                    ┌─────────────┐
                    │   草稿      │
                    │   (draft)   │
                    └──────┬──────┘
                           │ 提交申请
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   已撤销    │◄────│   待审核    │────►│   已完成    │
│  (cancel)   │ 撤销│  (waiting)  │审批  │  (finish)   │
└─────────────┘     └──────┬──────┘通过  └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │   已退回    │ │   已作废    │ │   已终止    │
       │   (back)    │ │  (invalid)  │ │(termination)│
       └──────┬──────┘ └─────────────┘ └─────────────┘
              │
              │ 重新提交
              └──────────────────────────────────────┐
                                                     │
                    ┌─────────────┐                  │
                    │   待审核    │◄─────────────────┘
                    │  (waiting)  │
                    └─────────────┘
```

### 状态校验方法

```java
public enum BusinessStatusEnum {
    // ...

    /**
     * 检查是否可以撤销
     */
    public static void checkCancelStatus(String flowStatus) {
        List<String> cancelableStatus = List.of(DRAFT.status, WAITING.status, BACK.status);
        if (!cancelableStatus.contains(flowStatus)) {
            throw new ServiceException("当前状态不允许撤销");
        }
    }

    /**
     * 检查是否可以作废
     */
    public static void checkInvalidStatus(String flowStatus) {
        List<String> invalidableStatus = List.of(DRAFT.status, WAITING.status, BACK.status);
        if (!invalidableStatus.contains(flowStatus)) {
            throw new ServiceException("当前状态不允许作废");
        }
    }

    /**
     * 检查是否可以退回
     */
    public static void checkBackStatus(String flowStatus) {
        if (!WAITING.status.equals(flowStatus)) {
            throw new ServiceException("当前状态不允许退回");
        }
    }

    /**
     * 检查是否可以启动
     */
    public static void checkStartStatus(String flowStatus) {
        List<String> startableStatus = List.of(DRAFT.status, BACK.status, CANCEL.status);
        if (!startableStatus.contains(flowStatus)) {
            throw new ServiceException("当前状态不允许重新启动");
        }
    }
}
```

## 事件机制

### 删除事件

当流程实例被删除时，系统会发布删除事件，通知业务系统：

```java
@Component
public class FlowProcessEventHandler {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * 发布删除事件
     */
    public void processDeleteHandler(String flowCode, String businessId) {
        ProcessDeleteEvent event = new ProcessDeleteEvent();
        event.setFlowCode(flowCode);
        event.setBusinessId(businessId);
        eventPublisher.publishEvent(event);
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
        task.getApproverName(),
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
bizExt.setTitle(leave.getApplicantName() + "的请假申请");
bizExt.setBusinessCode("LV" + System.currentTimeMillis());
bizExt.setTableName("test_leave");
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
        String flowStatus = event.getFlowStatus();

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
            case "invalid" -> LeaveStatus.INVALID;
            default -> LeaveStatus.DRAFT;
        };
    }
}
```

### 3. 查询优化

**使用联表查询提升性能**:
```xml
<select id="selectInstanceList" resultType="FlowInstanceVo">
    SELECT
        fi.id, fi.definition_id, fi.business_id,
        fi.node_type, fi.node_code, fi.node_name,
        fi.flow_status, fi.create_by, fi.create_time,
        fd.flow_code, fd.flow_name, fd.category,
        fbe.business_code, fbe.title
    FROM flow_instance fi
    LEFT JOIN flow_definition fd ON fi.definition_id = fd.id
    LEFT JOIN flow_instance_biz_ext fbe ON fi.id = fbe.instance_id
    ${ew.customSqlSegment}
</select>
```

## 常见问题

### 1. 流程实例无法撤销

**问题原因**:
- 流程状态不在可撤销范围内
- 当前用户不是流程发起人

**解决方案**:
```java
// 检查状态
Instance instance = insService.getById(instanceId);
if (!BusinessStatusEnum.runningStatus().contains(instance.getFlowStatus())) {
    throw new ServiceException("流程已结束，无法撤销");
}

// 检查权限
if (!instance.getCreateBy().equals(LoginHelper.getUserIdStr())) {
    throw new ServiceException("只有流程发起人才能撤销");
}
```

### 2. 删除流程实例失败

**问题原因**:
- 流程实例有关联的运行中任务
- 数据库外键约束

**解决方案**:
```java
// 使用 deleteHisByInstanceIds 彻底清理
// 该方法会按正确顺序删除所有关联数据
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
