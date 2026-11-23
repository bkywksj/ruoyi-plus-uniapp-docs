---
title: "流程定义"
description: "流程定义是工作流系统的核心组成部分，它描述了业务流程的结构、节点、流转规则等信息。流程定义是流程实例的模板，一个流程定义可以创建多个流程实例。本文档详细介绍流程定义的管理、配置和使用方法。"
---
# 流程定义

## 概述

流程定义是工作流系统的核心组成部分，它描述了业务流程的结构、节点、流转规则等信息。流程定义是流程实例的模板，一个流程定义可以创建多个流程实例。本文档详细介绍流程定义的管理、配置和使用方法。

## 流程定义结构

### 核心属性

```java
/**
 * 流程定义实体
 */
public class FlowDefinition {
    /** 主键ID */
    private Long id;

    /** 流程编码（唯一标识） */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 设计器模型（CLASSICS-经典模型，MIMIC-仿钉钉模型） */
    private String modelValue;

    /** 流程版本 */
    private String version;

    /** 是否发布（0-未发布，1-已发布，9-已失效） */
    private Integer isPublish;

    /** 流程分类 */
    private String category;

    /** 表单路径 */
    private String formPath;

    /** 表单类型（是否自定义表单） */
    private String formCustom;

    /** 是否激活（0-挂起，1-激活） */
    private Integer activityStatus;

    /** 流程级监听器类型，多个以英文逗号分隔，与 listenerPath 按下标一一对应 */
    private String listenerType;

    /** 流程级监听器路径（类路径），多个以 @@ 分隔，与 listenerType 按下标一一对应 */
    private String listenerPath;

    /** 扩展信息（业务扩展属性，引擎不解析） */
    private String ext;

    /** 流程定义配置（JSON格式，自动审批等引擎配置，由流程设计器写入） */
    private String defConfig;

    /** 租户ID */
    private String tenantId;

    /** 创建者 */
    private String createBy;

    /** 创建时间 */
    private Date createTime;

    /** 更新者 */
    private String updateBy;

    /** 更新时间 */
    private Date updateTime;
}
```

### 发布状态

流程定义有三种发布状态（引擎枚举 `org.dromara.warm.flow.core.enums.PublishStatus`）：

```java
public enum PublishStatus {
    /** 已失效（新版本发布后旧版本自动失效） */
    EXPIRED(9, "已失效"),

    /** 未发布 */
    UNPUBLISHED(0, "未发布"),

    /** 已发布 */
    PUBLISHED(1, "已发布");
}
```

| 状态 | 值 | 说明 | 可执行操作 |
|------|----|----|------------|
| 未发布 | 0 | 草稿状态，可编辑修改 | 编辑、删除、发布、复制 |
| 已发布 | 1 | 正式状态，可创建实例 | 停用、导出、复制、激活/挂起 |
| 已失效 | 9 | 已有新版本发布 | 查看、删除 |

### 扩展属性与流程配置

流程定义上有两个容易混淆的 JSON 字段：

| 字段 | 列名 | 写入方 | 说明 |
|------|------|--------|------|
| `ext` | `ext` | 业务方 | 业务扩展属性，引擎不解析。管理端「流程定义」弹窗提交时原样回写，不会覆盖其中的内容 |
| `defConfig` | `def_config` | 流程设计器 | 引擎读取的流程级配置，自动审批即存于此 |

**自动审批**：引擎从 `def_config` 顶层键 `autoPass` 读取开关（`FlowCons.DEF_CONFIG_AUTO_PASS`），为 `true` 时下一节点办理人与当前办理人相同则自动通过，历史任务状态记为 `auto_pass`。

```json
{
    "autoPass": true
}
```

> **注意**：流程定义新增/修改弹窗里已没有「自动审批」勾选，`ext.autoPass` 也不再被读取。自动审批统一在流程设计器中配置（写入 `def_config`），避免两处配置互相覆盖。旧库里 `ext.autoPass = true` 的流程，由升级脚本迁到 `def_config.autoPass`，`ext` 原值保留不动。

### 流程级监听器

`flow_definition` 表的 `listener_type` / `listener_path` 用于配置对整条流程生效的监听器（节点级监听器在流程设计器的节点属性里单独配置）。按 Warm-Flow 的约定，多个监听器被压缩成两个字符串存储，按下标一一配对：

| 字段 | 分隔符 | 示例 |
|------|--------|------|
| `listenerType` | 英文逗号 `,` | `start,finish` |
| `listenerPath` | `@@` | `plus.ruoyi.workflow.listener.AListener@@plus.ruoyi.workflow.listener.BListener` |

监听器类型由引擎固定为四种触发时机，不走字典表：

| 值 | 说明 |
|----|------|
| `start` | 开始 |
| `assignment` | 分派 |
| `finish` | 完成 |
| `create` | 创建 |

管理端「流程定义」新增/修改弹窗提供「监听器配置」表格，可逐行选择类型、填写监听器类路径并增删行：

- 提交时过滤掉整行留空的记录，再把剩余行分别以 `,` 和 `@@` 拼接写入 `listenerType` / `listenerPath`
- 只填了类型或只填了路径的行会被拦下并提示「监听器的类型和路径必须同时填写」，避免两个压缩串长度不等导致引擎侧类型与路径错位
- 编辑时按 `,` 与 `@@` 拆分，再按下标配对还原成可编辑的行

同一弹窗中「设计器模式」（经典模式：自由拖拽连线；仿钉钉模式：类钉钉审批流、上下结构布局）与「是否动态表单」（是：由流程设计器动态渲染表单；否：使用表单路径指定的页面）以卡片式单选展示并附带用途说明。设计器模式决定节点结构，保存后不支持修改，编辑态会禁用并给出提示。

弹窗只维护流程的基本信息（编码、名称、分类、设计器模式、表单、监听器）。自动审批、节点抄送等引擎配置不在此弹窗中，统一到流程设计器里配置，详见 [流程设计器](#流程设计器)。

## API 接口

### 查询已发布流程定义

**接口地址**: `GET /workflow/definition/pageFlowDefinitions`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| flowCode | String | 否 | 流程编码（模糊查询） |
| flowName | String | 否 | 流程名称（模糊查询） |
| category | String | 否 | 流程分类ID |
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
                "flowCode": "leave_apply",
                "flowName": "请假申请",
                "category": "100",
                "categoryName": "OA办公",
                "version": "1",
                "isPublish": 1,
                "formPath": "/business/leave/apply",
                "formCustom": "Y",
                "createTime": "2024-01-01 10:00:00"
            }
        ],
        "total": 1
    }
}
```

### 查询未发布流程定义

**接口地址**: `GET /workflow/definition/pageUnpublishedDefinitions`

**请求参数**: 同上

**说明**: 查询状态为"未发布"或"已失效"的流程定义，用于流程设计器管理界面。

### 获取流程定义详情

**接口地址**: `GET /workflow/definition/getFlowDefinition/{id}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程定义ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "flowCode": "leave_apply",
        "flowName": "请假申请",
        "version": "1",
        "isPublish": 1,
        "category": "100",
        "formPath": "/business/leave/apply",
        "formCustom": "Y",
        "defConfig": "{\"autoPass\":true}",
        "nodeList": [
            {
                "nodeCode": "start",
                "nodeName": "开始",
                "nodeType": 0
            },
            {
                "nodeCode": "apply",
                "nodeName": "申请人",
                "nodeType": 1,
                "permissionFlag": "${initiator}"
            },
            {
                "nodeCode": "manager",
                "nodeName": "部门经理",
                "nodeType": 1,
                "permissionFlag": "role:3"
            },
            {
                "nodeCode": "end",
                "nodeName": "结束",
                "nodeType": 2
            }
        ],
        "skipList": [
            {
                "nowNodeCode": "start",
                "nextNodeCode": "apply"
            },
            {
                "nowNodeCode": "apply",
                "nextNodeCode": "manager"
            },
            {
                "nowNodeCode": "manager",
                "nextNodeCode": "end"
            }
        ]
    }
}
```

### 新增流程定义

**接口地址**: `POST /workflow/definition/addFlowDefinition`

**请求参数**:

```json
{
    "flowCode": "leave_apply",
    "flowName": "请假申请",
    "category": "100",
    "formPath": "/business/leave/apply",
    "formCustom": "Y",
    "nodeList": [
        {
            "nodeCode": "start",
            "nodeName": "开始",
            "nodeType": 0,
            "coordinate": "100,100"
        },
        {
            "nodeCode": "apply",
            "nodeName": "申请人",
            "nodeType": 1,
            "permissionFlag": "${initiator}",
            "coordinate": "250,100"
        },
        {
            "nodeCode": "manager",
            "nodeName": "部门经理",
            "nodeType": 1,
            "permissionFlag": "role:3",
            "coordinate": "400,100"
        },
        {
            "nodeCode": "end",
            "nodeName": "结束",
            "nodeType": 2,
            "coordinate": "550,100"
        }
    ],
    "skipList": [
        {
            "nowNodeCode": "start",
            "nextNodeCode": "apply",
            "skipType": "PASS"
        },
        {
            "nowNodeCode": "apply",
            "nextNodeCode": "manager",
            "skipType": "PASS"
        },
        {
            "nowNodeCode": "manager",
            "nextNodeCode": "end",
            "skipType": "PASS"
        }
    ]
}
```

**参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| flowCode | String | 是 | 流程编码（唯一） |
| flowName | String | 是 | 流程名称 |
| category | String | 否 | 流程分类ID |
| formPath | String | 否 | 表单路径 |
| formCustom | String | 否 | 是否自定义表单（Y/N） |
| listenerType | String | 否 | 流程级监听器类型，多个以 `,` 分隔 |
| listenerPath | String | 否 | 流程级监听器类路径，多个以 `@@` 分隔，与 listenerType 按下标对应 |
| ext | String | 否 | 业务扩展信息（引擎不解析；自动审批不写在这里，见 [扩展属性与流程配置](#扩展属性与流程配置)） |
| nodeList | Array | 是 | 节点列表 |
| skipList | Array | 是 | 流转规则列表 |

### 修改流程定义

**接口地址**: `PUT /workflow/definition/updateFlowDefinition`

**请求参数**: 同新增，需包含 `id` 字段

**注意事项**:
- 已发布的流程定义不能直接修改
- 修改已发布流程会创建新版本

### 发布流程定义

**接口地址**: `PUT /workflow/definition/publishDefinition/{id}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程定义ID |

**说明**: 流程设计器只负责保存流程图（引擎接口 `POST /warm-flow/save-json`），没有发布入口；流程定义的发布统一走本接口，由 `FlwDefinitionServiceImpl.publishDefinition` 先做校验，全部通过后再调用引擎 `defService.publish(id)`。

**发布校验规则**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean publishDefinition(Long id) {
    List<FlowNode> flowNodes = flowNodeMapper.selectList(
        new LambdaQueryWrapper<FlowNode>().eq(FlowNode::getDefinitionId, id));
    List<String> errorMsg = new ArrayList<>();
    if (CollUtil.isNotEmpty(flowNodes)) {
        String applyNodeCode = flwCommonService.applyNodeCode(id);
        for (FlowNode flowNode : flowNodes) {
            // 第一步：中间审批节点必须配置办理人
            if (requiresAssignee(flowNode, applyNodeCode) && StringUtils.isBlank(flowNode.getPermissionFlag())) {
                errorMsg.add(flowNode.getNodeName());
            }
        }
        if (CollUtil.isNotEmpty(errorMsg)) {
            throw new ServiceException("节点【{}】未配置办理人!", StringUtils.joinComma(errorMsg));
        }
        // 第二步：拦截本系统尚未接入的事件节点与服务任务
        checkUnsupportedNodes(flowNodes);
    }
    return defService.publish(id);
}

/**
 * 只有中间审批节点需要办理人：申请人节点由发起人办理，
 * 事件节点（event_type 非空）由引擎驱动，都不要求配置
 */
static boolean requiresAssignee(FlowNode node, String applyNodeCode) {
    return NodeType.BETWEEN.getKey().equals(node.getNodeType())
        && !applyNodeCode.equals(node.getNodeCode())
        && StringUtils.isBlank(node.getEventType());
}

private void checkUnsupportedNodes(List<FlowNode> flowNodes) {
    boolean timerEnabled = FlowEngine.getFlowConfig() != null && FlowEngine.getFlowConfig().isTimerEnabled();
    List<String> errors = new ArrayList<>();
    for (FlowNode node : flowNodes) {
        String eventType = node.getEventType();
        if (StringUtils.startsWith(eventType, "TIMER_") && !timerEnabled) {
            errors.add(StringUtils.format("【{}】是定时事件，需先开启 warm-flow.timer-enabled", node.getNodeName()));
        } else if (StringUtils.startsWith(eventType, "MESSAGE_") || StringUtils.startsWith(eventType, "ERROR_")) {
            errors.add(StringUtils.format("【{}】是消息 / 错误事件，本系统尚未接入触发接口", node.getNodeName()));
        } else if (NodeType.isService(node.getNodeType())) {
            String reason = checkServiceTask(node);
            if (reason != null) {
                errors.add(StringUtils.format("【{}】是服务任务，{}", node.getNodeName(), reason));
            }
        }
    }
    if (CollUtil.isNotEmpty(errors)) {
        throw new ServiceException("以下节点暂不支持，无法发布：{}", String.join("；", errors));
    }
}
```

**校验规则**:

| 序号 | 规则 | 不通过时的提示 |
|------|------|----------------|
| 1 | 中间节点（`node_type = 1`）必须配置办理人 `permissionFlag`；申请人节点、事件节点（`event_type` 非空）除外 | `节点【xxx】未配置办理人!` |
| 2 | 定时事件（`event_type` 以 `TIMER_` 开头）要求开启 `warm-flow.timer-enabled`（默认关闭） | `【xxx】是定时事件，需先开启 warm-flow.timer-enabled` |
| 3 | 消息事件、错误事件（`event_type` 以 `MESSAGE_` / `ERROR_` 开头）一律拦截，本系统尚未提供触发接口 | `【xxx】是消息 / 错误事件，本系统尚未接入触发接口` |
| 4 | 服务任务（`node_type = 6`）按类名方式配置时，处理器类必须存在且实现 `ServiceTaskHandler` | `【xxx】是服务任务，未配置处理器类` / `处理器类 xxx 不存在` / `处理器类 xxx 未实现 ServiceTaskHandler` / `配置无效：...` |
| 5 | 终止结束（`TERMINATE_END`）只是结束节点的一种，不依赖触发器，直接放行 | - |

规则 2～4 的同类问题会汇总成一条提示：`以下节点暂不支持，无法发布：【A】...；【B】...`。

**服务任务校验细节**（`checkServiceTask`）：

- 配置来自节点的 `node_config.serviceTask`，由引擎 `ServiceTaskConfig.parse()` 解析，字段为 `type` / `handler` / `expression` / `resultVariable`
- 只校验「类名」方式：`type` 为空或为 `class` 时，`handler` 必须是可加载的类，且实现 `org.dromara.warm.flow.core.service.task.ServiceTaskHandler`
- `type` 为 `expression` / `delegateExpression` 时要到运行时才能求值，发布时不做判断

```json
{
    "serviceTask": {
        "type": "class",
        "handler": "plus.ruoyi.business.xxx.handler.XxxServiceTaskHandler"
    }
}
```

> **注意**：设计器能画出引擎 2.x 的全部事件节点与服务任务，但本系统只接入了基础审批能力。不在发布时拦截的话，流程能发布、能发起，却会永远停在等待节点，或办理到该步时才报错回滚。

### 取消发布流程定义

**接口地址**: `PUT /workflow/definition/unpublishDefinition/{id}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程定义ID |

**注意事项**:
- 取消发布后流程定义变为未发布状态
- 正在运行的流程实例不受影响

### 删除流程定义

**接口地址**: `DELETE /workflow/definition/deleteFlowDefinitions/{ids}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | List | 是 | 流程定义ID列表 |

**删除校验**:

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean deleteDefinitions(List<Long> ids) {
    // 检查是否有历史任务关联
    LambdaQueryWrapper<FlowHisTask> wrapper = Wrappers.lambdaQuery();
    wrapper.in(FlowHisTask::getDefinitionId, ids);
    List<FlowHisTask> flowHisTasks = flowHisTaskMapper.selectList(wrapper);

    if (CollUtil.isNotEmpty(flowHisTasks)) {
        List<FlowDefinition> flowDefinitions = flowDefinitionMapper.selectByIds(
            StreamUtils.toList(flowHisTasks, FlowHisTask::getDefinitionId));
        if (CollUtil.isNotEmpty(flowDefinitions)) {
            String join = StreamUtils.join(flowDefinitions, FlowDefinition::getFlowCode);
            throw new ServiceException("流程定义【{}】已被使用不可被删除！", join);
        }
    }
    defService.removeDef(ids);
    return true;
}
```

**删除规则**:
- 已被使用（有历史任务）的流程定义不能删除
- 删除操作会同时删除关联的节点和流转规则

### 复制流程定义

**接口地址**: `POST /workflow/definition/copyFlowDefinition/{id}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程定义ID |

**说明**:
- 复制后生成新的流程定义
- 流程编码自动添加"_copy"后缀
- 复制的流程默认为未发布状态

### 导入流程定义

**接口地址**: `POST /workflow/definition/importFlowDefinition`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | MultipartFile | 是 | JSON文件 |
| category | String | 否 | 流程分类ID |

**导入文件格式**:

```json
{
    "flowCode": "leave_apply",
    "flowName": "请假申请",
    "version": "1",
    "category": "100",
    "nodeList": [...],
    "skipList": [...]
}
```

### 导出流程定义

**接口地址**: `POST /workflow/definition/exportFlowDefinition/{id}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程定义ID |

**响应**: 下载 JSON 文件

### 获取流程定义JSON

**接口地址**: `GET /workflow/definition/getFlowDefinitionJson/{id}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程定义ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": "{\"flowCode\":\"leave_apply\",\"flowName\":\"请假申请\",...}"
}
```

### 激活/挂起流程定义

**接口地址**: `PUT /workflow/definition/activeFlowDefinition/{id}`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 流程定义ID |
| active | Boolean | 是 | true-激活，false-挂起 |

**说明**:
- 挂起后的流程定义不能创建新实例
- 已有实例不受影响

## 流程节点

### 节点结构

```java
/**
 * 流程节点实体
 */
public class FlowNode {
    /** 节点ID */
    private Long id;

    /** 流程定义ID */
    private Long definitionId;

    /** 节点编码 */
    private String nodeCode;

    /** 节点名称 */
    private String nodeName;

    /** 节点类型（0-开始，1-中间，2-结束，3-排他网关，4-并行网关，5-包容网关，6-服务任务） */
    private Integer nodeType;

    /** 权限标识（办理人配置） */
    private String permissionFlag;

    /** 节点签署比例（node_ratio varchar(200)："0" 或签，"100" 会签，1 ~ 99 票签通过百分比，另支持 passCount= / rejectCount= 等票签规则） */
    private String nodeRatio;

    /** 任意跳转节点编码 */
    private String anyNodeSkip;

    /** 坐标位置 */
    private String coordinate;

    /** 扩展信息（按钮权限、自定义参数，见下文「节点扩展配置」） */
    private String ext;

    /** 节点配置（JSON，抄送、服务任务、事件等引擎配置） */
    private String nodeConfig;

    /** 事件类型（为空表示普通节点） */
    private String eventType;

    /** 事件名称（消息事件使用） */
    private String eventName;

    /** 边界事件附着的任务节点编码 */
    private String attachedToNodeCode;

    /** 边界事件是否中断型 */
    private Boolean interrupting;

    /** 租户ID */
    private String tenantId;
}
```

> **说明**：节点表 `flow_node` 已不再有 `version` 列，节点通过 `definition_id` 归属到具体版本的流程定义。

### 节点类型

| 类型 | 值 | 说明 |
|------|----|----|
| 开始节点 | 0 | 流程入口 |
| 中间节点 | 1 | 审批节点 |
| 结束节点 | 2 | 流程出口 |
| 排他网关 | 3 | 条件分支 |
| 并行网关 | 4 | 并行分支 |
| 包容网关 | 5 | 满足条件的分支都执行 |
| 服务任务 | 6 | 由 `ServiceTaskHandler` 自动执行，发布时校验处理器类（见 [发布流程定义](#发布流程定义)） |

### 事件节点

事件节点通过 `flow_node.event_type` 标识（为空即普通节点），边界事件另用 `attached_to_node_code` / `interrupting` 记录附着的任务节点与是否中断：

| 事件类型 | 说明 | 发布时 |
|----------|------|--------|
| `TIMER_START` / `TIMER_CATCH` / `TIMER_BOUNDARY` | 定时启动 / 定时捕获 / 定时边界 | 需开启 `warm-flow.timer-enabled` |
| `MESSAGE_START` / `MESSAGE_CATCH` / `MESSAGE_THROW` / `MESSAGE_BOUNDARY` / `MESSAGE_END` | 消息类事件 | 拦截 |
| `ERROR_CATCH` / `ERROR_BOUNDARY` | 错误类事件 | 拦截 |
| `TERMINATE_END` | 终止结束 | 放行 |

需要「等待」的事件（定时、消息等）运行时落在 `flow_event_wait` 表，等待状态为 `WAITING` / `RUNNING` / `CANCELLED` / `RETRY` / `DEAD`，独立于实例的流程状态。`warm-flow.timer-enabled` 未开启（默认）时引擎不扫描该表。

### 节点扩展配置

节点的 `ext` 字段由设计器「基础设置」「权限」两个页签写入，格式为 `code` / `value` 数组，由 `FlwNodeExtServiceImpl.parseNodeExt()` 解析成 `NodeExtVo`（`buttonPermissions` 按钮权限列表、`variables` 自定义参数）：

```json
[
    {"code": "ButtonPermissionEnum", "value": "back,termination"},
    {"code": "VariablesEnum", "value": "key1=value1,key2=value2"}
]
```

| 页签 | code | 说明 |
|------|------|------|
| 基础设置 | `VariablesEnum` | 自定义参数，`key=value` 以逗号分隔 |
| 权限 | `ButtonPermissionEnum` | 节点可用的操作按钮 |

### 节点抄送

节点扩展里的「抄送对象」已移除，`NodeExtVo` 也不再有 `copySettings`。节点抄送改由引擎内置能力承载，在设计器的抄送配置中设置，存于 `node_config.copy`：

```json
{
    "copy": {
        "handlers": ["1", "2"]
    }
}
```

- `handlers` 必须是数组，元素按字符串处理，经 `PermissionHandler` 展开为实际抄送人；不带前缀的 ID 视为用户 ID
- 旧数据 `ext` 里残留的 `CopySettingEnum` 项会被静默跳过；纯数字用户 ID 的抄送配置由升级脚本迁到 `node_config.copy`，带角色 / 部门前缀的需人工处理

## 流程跳转规则

### 跳转规则结构

```java
/**
 * 流程跳转规则实体
 */
public class FlowSkip {
    /** 跳转规则ID */
    private Long id;

    /** 流程定义ID */
    private Long definitionId;

    /** 当前节点编码 */
    private String nowNodeCode;

    /** 当前节点类型 */
    private Integer nowNodeType;

    /** 下一节点编码 */
    private String nextNodeCode;

    /** 下一节点类型 */
    private Integer nextNodeType;

    /** 跳转名称 */
    private String skipName;

    /** 跳转类型 */
    private String skipType;

    /** 跳转条件（SpEL表达式） */
    private String skipCondition;

    /** 坐标信息 */
    private String coordinate;

    /** 租户ID */
    private String tenantId;
}
```

### 跳转类型

```java
public enum SkipType {
    /** 通过 */
    PASS("pass", "通过"),

    /** 驳回 */
    REJECT("reject", "驳回"),

    /** 不执行跳转（用于抄送等） */
    NONE("none", "不跳转");
}
```

### 条件表达式

跳转条件支持 SpEL 表达式：

```java
// 请假天数大于3天走总经理审批
"${days > 3}"

// 请假类型为年假
"${leaveType == 'annual'}"

// 金额大于10000且部门为销售部
"${amount > 10000 && deptId == 101}"
```

## 流程分类

### 分类结构

```java
/**
 * 流程分类实体
 */
public class FlowCategory extends TenantEntity {
    /** 分类ID */
    private Long categoryId;

    /** 分类名称 */
    private String categoryName;

    /** 父分类ID */
    private Long parentId;

    /** 排序 */
    private Long orderNum;

    // 租户ID tenantId 继承自 TenantEntity
}
```

### 分类管理

流程分类支持树形结构，便于组织和管理大量流程定义。

## 多租户支持

### 租户流程同步

新增租户时，可以从默认租户同步流程定义：

```java
@Override
@Transactional(rollbackFor = Exception.class)
public void syncDef(String tenantId) {
    // 查询默认租户的流程定义
    List<FlowDefinition> flowDefinitions = flowDefinitionMapper.selectList(
        new LambdaQueryWrapper<FlowDefinition>()
            .eq(FlowDefinition::getTenantId, TenantConstants.DEFAULT_TENANT_ID));

    if (CollUtil.isEmpty(flowDefinitions)) {
        return;
    }

    // 同步流程分类
    FlowCategory flowCategory = flwCategoryMapper.selectOne(
        new LambdaQueryWrapper<FlowCategory>()
            .eq(FlowCategory::getTenantId, TenantConstants.DEFAULT_TENANT_ID)
            .eq(FlowCategory::getCategoryId, FlowConstant.FLOW_CATEGORY_ID));
    flowCategory.setCategoryId(null);
    flowCategory.setTenantId(tenantId);
    flwCategoryMapper.insert(flowCategory);

    // 同步流程定义、节点、跳转规则
    for (FlowDefinition definition : flowDefinitions) {
        FlowDefinition flowDefinition = BeanUtil.toBean(definition, FlowDefinition.class);
        flowDefinition.setId(null);
        flowDefinition.setTenantId(tenantId);
        flowDefinition.setIsPublish(0); // 默认未发布
        flowDefinition.setCategory(Convert.toStr(flowCategory.getCategoryId()));
        flowDefinitionMapper.insert(flowDefinition);

        // 同步节点（清空办理人配置，需要租户自行配置）
        // 同步跳转规则
        // ...
    }
}
```

**同步特点**:
- 同步后的流程定义默认为未发布状态
- 节点的办理人配置会被清空，需要租户自行配置
- 保持流程结构和跳转规则不变

## 使用示例

### 创建简单审批流程

```java
// 1. 构建流程定义
FlowDefinition definition = new FlowDefinition();
definition.setFlowCode("simple_approve");
definition.setFlowName("简单审批流程");
definition.setCategory("100");

// 2. 构建节点列表
List<FlowNode> nodeList = new ArrayList<>();

// 开始节点
FlowNode startNode = new FlowNode();
startNode.setNodeCode("start");
startNode.setNodeName("开始");
startNode.setNodeType(0);
nodeList.add(startNode);

// 申请人节点
FlowNode applyNode = new FlowNode();
applyNode.setNodeCode("apply");
applyNode.setNodeName("申请人");
applyNode.setNodeType(1);
applyNode.setPermissionFlag("${initiator}");
nodeList.add(applyNode);

// 审批人节点
FlowNode approveNode = new FlowNode();
approveNode.setNodeCode("approve");
approveNode.setNodeName("审批人");
approveNode.setNodeType(1);
approveNode.setPermissionFlag("role:3"); // 部门经理角色
nodeList.add(approveNode);

// 结束节点
FlowNode endNode = new FlowNode();
endNode.setNodeCode("end");
endNode.setNodeName("结束");
endNode.setNodeType(2);
nodeList.add(endNode);

// 3. 构建跳转规则
List<FlowSkip> skipList = new ArrayList<>();
skipList.add(createSkip("start", "apply", "PASS"));
skipList.add(createSkip("apply", "approve", "PASS"));
skipList.add(createSkip("approve", "end", "PASS"));

// 4. 保存流程定义
definition.setNodeList(nodeList);
definition.setSkipList(skipList);
defService.checkAndSave(definition);

// 5. 发布流程定义
flwDefinitionService.publishDefinition(definition.getId());
```

### 创建带条件分支的流程

```java
// 构建排他网关流程
// 开始 -> 申请人 -> 排他网关 -> (条件1)主管审批 -> 结束
//                           -> (条件2)经理审批 -> 结束

// 排他网关节点
FlowNode gatewayNode = new FlowNode();
gatewayNode.setNodeCode("gateway");
gatewayNode.setNodeName("金额判断");
gatewayNode.setNodeType(3); // 排他网关

// 跳转规则（带条件）
FlowSkip toManagerSkip = new FlowSkip();
toManagerSkip.setNowNodeCode("gateway");
toManagerSkip.setNextNodeCode("manager");
toManagerSkip.setSkipType("PASS");
toManagerSkip.setSkipCondition("${amount > 5000}"); // 金额大于5000走经理审批

FlowSkip toLeaderSkip = new FlowSkip();
toLeaderSkip.setNowNodeCode("gateway");
toLeaderSkip.setNextNodeCode("leader");
toLeaderSkip.setSkipType("PASS");
toLeaderSkip.setSkipCondition("${amount <= 5000}"); // 金额小于等于5000走主管审批
```

### 创建会签流程

```java
// 会签节点配置
FlowNode signNode = new FlowNode();
signNode.setNodeCode("sign");
signNode.setNodeName("会签审批");
signNode.setNodeType(1);
signNode.setPermissionFlag("1,2,3"); // 多个用户
signNode.setNodeRatio("100"); // 会签：字符串 "100"，全部通过才能继续

// 票签节点配置（50%通过即可）
FlowNode voteNode = new FlowNode();
voteNode.setNodeCode("vote");
voteNode.setNodeName("投票表决");
voteNode.setNodeType(1);
voteNode.setPermissionFlag("role:5"); // 委员会角色
voteNode.setNodeRatio("50"); // 票签：1 ~ 99 为通过百分比，"50" 即 50% 通过即可
```

## 最佳实践

### 1. 流程编码规范

**命名规范**:
- 使用小写字母和下划线
- 以业务模块为前缀
- 示例：`leave_apply`、`expense_reimburse`、`contract_approve`

**版本管理**:
- 重大变更创建新流程
- 小改动使用版本号区分

### 2. 节点设计原则

**简化节点数量**:
- 每个流程节点控制在5-10个
- 复杂流程拆分为子流程

**合理配置办理人**:
- 优先使用角色配置
- 避免硬编码用户ID
- 使用 SpEL 表达式实现动态办理人

### 3. 条件表达式设计

**清晰的条件逻辑**:
```java
// 好的写法
"${amount > 10000}"

// 避免复杂嵌套
"${(amount > 10000 && deptId == 101) || (priority == 'high' && days > 5)}"
```

**使用流程变量**:
- 在启动流程时传入必要变量
- 避免在条件中使用复杂计算

### 4. 测试发布流程

**发布前检查**:
1. 验证所有节点配置正确
2. 测试各条件分支路径
3. 确认办理人配置生效

**灰度发布**:
- 先在测试环境验证
- 使用复制功能创建测试版本

## 常见问题

### 1. 发布失败：节点未配置办理人

**问题原因**:
- 中间节点（非申请节点、非事件节点）未配置 `permissionFlag`

**解决方案**:
```java
// 检查节点配置（事件节点 event_type 非空，不要求办理人）
for (FlowNode node : nodeList) {
    if (node.getNodeType() == 1 && StringUtils.isBlank(node.getEventType())
        && StringUtils.isBlank(node.getPermissionFlag())) {
        // 配置办理人
        node.setPermissionFlag("role:xxx");
    }
}
```

### 1.1 发布失败：以下节点暂不支持

**问题原因**:
- 流程里用了定时事件，但未开启 `warm-flow.timer-enabled`
- 流程里用了消息事件或错误事件（本系统尚未接入触发接口）
- 服务任务未配置处理器类、类不存在或未实现 `ServiceTaskHandler`

**解决方案**:
- 定时事件：在 `application.yml` 的 `warm-flow` 下开启 `timer-enabled: true` 后再发布
- 消息 / 错误事件：从流程图中移除，或改用普通审批节点
- 服务任务：实现 `ServiceTaskHandler` 并在设计器中填写完整类名

```yaml
warm-flow:
  # 开启定时事件扫描（默认 false）
  timer-enabled: true
```

> **注意**：定时线程没有登录上下文，多租户模式下 `flow_event_wait` 的轮询会被租户拦截器限定在默认租户，非默认租户的定时事件不会触发。多租户项目开启前需自行处理租户上下文。

### 2. 流程定义无法删除

**问题原因**:
- 该流程定义已有历史任务记录

**解决方案**:
- 确认流程确实不再需要
- 可以取消发布而不是删除
- 如必须删除，需先清理相关历史数据

### 3. 导入流程失败

**问题原因**:
- JSON 格式错误
- 流程编码重复

**解决方案**:
```java
// 导入前检查
try {
    DefJson defJson = JsonUtils.parseObject(file.getBytes(), DefJson.class);
    // 检查流程编码是否存在
    FlowDefinition existing = flowDefinitionMapper.selectOne(
        new LambdaQueryWrapper<FlowDefinition>()
            .eq(FlowDefinition::getFlowCode, defJson.getFlowCode()));
    if (existing != null) {
        // 生成新的流程编码
        defJson.setFlowCode(defJson.getFlowCode() + "_" + System.currentTimeMillis());
    }
    defService.importDef(defJson);
} catch (Exception e) {
    throw new ServiceException("导入失败：" + e.getMessage());
}
```

### 4. 多租户流程隔离

**问题描述**:
- 不同租户看到了其他租户的流程

**解决方案**:
- 确保查询时带上租户过滤条件
- 检查多租户插件配置是否正确

```java
// 查询时自动带上租户条件
@Override
public PageResult<FlowDefinitionVo> pageFlowDefinitions(...) {
    // MyBatis-Plus 多租户插件会自动添加租户条件
    LambdaQueryWrapper<FlowDefinition> wrapper = buildQueryWrapper(flowDefinition);
    // ...
}
```

### 5. 条件分支未生效

**问题原因**:
- SpEL 表达式语法错误
- 流程变量未传入

**解决方案**:
```java
// 确保启动流程时传入条件变量
Map<String, Object> variables = new HashMap<>();
variables.put("amount", 15000);
variables.put("days", 5);
variables.put("leaveType", "annual");

StartProcessBo bo = new StartProcessBo();
bo.setFlowCode("leave_apply");
bo.setBusinessId(businessId);
bo.setVariables(variables);

flwTaskService.startWorkFlow(bo);
```

### 6. 会签比例配置无效

**问题原因**:
- `nodeRatio` 设置为 `"0"` 或未设置
- 按小数写成了 `"0.6"` 之类的值（引擎按百分比解释，`"0.6"` 表示 0.6%）
- 办理人只配置了一个用户

**解决方案**:
```java
// 正确配置票签节点：nodeRatio 是字符串，按百分比取值
FlowNode signNode = new FlowNode();
signNode.setNodeCode("sign");
signNode.setNodeType(1);
signNode.setPermissionFlag("1,2,3,4,5"); // 多个用户
signNode.setNodeRatio("60"); // 票签，60% 通过即可

// 取值语义（引擎 CooperateType 判定）：
// "0"        → 或签（isOrSign，任一人审批即可）
// "100"      → 会签（isCountersign，全部通过）
// "1" ~ "99" → 票签通过百分比（isVoteSignPassRatio）
// 以 "passCount=" / "rejectCount=" 开头 → 按通过 / 驳回人数判定；以 "@@sequence" 结尾为顺序签
```

## 版本管理

### 版本机制

流程定义支持版本管理，当修改已发布的流程时会创建新版本：

```java
/**
 * 版本号生成规则
 */
public String generateVersion(String flowCode) {
    // 查询当前最大版本号
    FlowDefinition latest = flowDefinitionMapper.selectOne(
        new LambdaQueryWrapper<FlowDefinition>()
            .eq(FlowDefinition::getFlowCode, flowCode)
            .orderByDesc(FlowDefinition::getVersion)
            .last("LIMIT 1"));

    if (latest == null) {
        return "1";
    }
    return String.valueOf(Integer.parseInt(latest.getVersion()) + 1);
}
```

### 版本状态流转

```text
┌──────────┐    发布    ┌──────────┐
│  未发布  │ ────────> │  已发布  │
│ (v1 草稿)│           │ (v1 生效)│
└──────────┘           └──────────┘
                            │
                       创建新版本
                            │
                            v
┌──────────┐    发布    ┌──────────┐
│  未发布  │ ────────> │  已发布  │
│ (v2 草稿)│           │ (v2 生效)│
└──────────┘           └──────────┘
                            │
                       旧版本失效
                            │
                            v
                       ┌──────────┐
                       │  已失效  │
                       │ (v1 归档)│
                       └──────────┘
```

### 版本查询

```java
// 查询流程的所有版本
List<FlowDefinition> versions = flowDefinitionMapper.selectList(
    new LambdaQueryWrapper<FlowDefinition>()
        .eq(FlowDefinition::getFlowCode, "leave_apply")
        .orderByDesc(FlowDefinition::getVersion));

// 获取最新发布版本
FlowDefinition latestPublished = flowDefinitionMapper.selectOne(
    new LambdaQueryWrapper<FlowDefinition>()
        .eq(FlowDefinition::getFlowCode, "leave_apply")
        .eq(FlowDefinition::getIsPublish, 1)
        .orderByDesc(FlowDefinition::getVersion)
        .last("LIMIT 1"));
```

## 流程设计器

### 打开与保存

管理端「流程定义」列表中，未发布的流程显示「流程设计」按钮，其余显示「查看流程」，两者都跳转到 `/workflow/design/index`（`design.vue`），以 iframe 嵌入引擎自带的设计器页面：

```text
{baseUrl}/warm-flow-ui/index.html?id={definitionId}&Authorization=Bearer {token}
```

- 不再传 `onlyDesignShow` 参数，设计器完整显示引擎 2.x 的配置面板（自动审批、抄送等）
- 设计器里的「保存」只调用引擎接口 `POST /warm-flow/save-json` 保存流程图，**没有发布入口**；画完后回到列表点击「发布流程」（调用 [发布流程定义](#发布流程定义) 接口），发布前会执行校验

### 在设计器中配置的内容

| 配置项 | 存储位置 | 说明 |
|--------|----------|------|
| 自动审批 | `flow_definition.def_config.autoPass` | 流程级开关，替代原流程定义表单里的勾选 |
| 节点抄送 | `flow_node.node_config.copy` | 替代原节点扩展里的「抄送对象」 |
| 服务任务处理器 | `flow_node.node_config.serviceTask` | 发布时校验 |
| 事件节点 | `flow_node.event_type` 等列 | 发布时按事件类型校验 |
| 自定义参数 | `flow_node.ext`（`VariablesEnum`） | 「基础设置」页签 |
| 按钮权限 | `flow_node.ext`（`ButtonPermissionEnum`） | 「权限」页签 |

流程级监听器在流程定义弹窗中配置（见 [流程级监听器](#流程级监听器)），节点级监听器在设计器的节点属性中配置。

### 设计器数据格式

流程设计器使用 JSON 格式存储流程图数据：

```json
{
    "nodes": [
        {
            "id": "node_001",
            "type": "start",
            "x": 100,
            "y": 100,
            "properties": {
                "nodeCode": "start",
                "nodeName": "开始"
            }
        },
        {
            "id": "node_002",
            "type": "task",
            "x": 250,
            "y": 100,
            "properties": {
                "nodeCode": "apply",
                "nodeName": "申请人",
                "permissionFlag": "${initiator}"
            }
        }
    ],
    "edges": [
        {
            "id": "edge_001",
            "source": "node_001",
            "target": "node_002",
            "properties": {
                "skipType": "PASS"
            }
        }
    ]
}
```

### 坐标转换

设计器坐标与节点坐标的转换：

```java
/**
 * 解析坐标信息
 */
public void parseCoordinate(FlowNode node) {
    String coordinate = node.getCoordinate();
    if (StringUtils.isNotBlank(coordinate)) {
        String[] parts = coordinate.split(",");
        int x = Integer.parseInt(parts[0]);
        int y = Integer.parseInt(parts[1]);
        // 用于前端设计器渲染
    }
}
```

## 性能优化

### 查询优化

```java
// 使用索引优化查询
// 建议在以下字段建立索引：
// - flow_code
// - is_publish
// - tenant_id
// - category

// 分页查询优化
@Override
public PageResult<FlowDefinitionVo> pageFlowDefinitions(FlowDefinition flowDefinition, PageQuery pageQuery) {
    LambdaQueryWrapper<FlowDefinition> wrapper = buildQueryWrapper(flowDefinition);
    wrapper.eq(FlowDefinition::getIsPublish, PublishStatus.PUBLISHED.getKey());
    // 可选：只查询列表需要的字段（项目默认实现未做裁剪）
    wrapper.select(FlowDefinition::getId, FlowDefinition::getFlowCode,
        FlowDefinition::getFlowName, FlowDefinition::getVersion,
        FlowDefinition::getIsPublish, FlowDefinition::getCategory);

    Page<FlowDefinition> page = flowDefinitionMapper.selectPage(pageQuery.build(), wrapper);
    PageResult<FlowDefinitionVo> pageResult = PageResult.of();
    pageResult.setRecords(BeanUtil.copyToList(page.getRecords(), FlowDefinitionVo.class));
    pageResult.setTotal(page.getTotal());
    return pageResult;
}
```

### 缓存策略

```java
/**
 * 流程定义缓存
 */
@Cacheable(value = "workflow:definition", key = "#flowCode")
public FlowDefinition getDefinitionByCode(String flowCode) {
    return flowDefinitionMapper.selectOne(
        new LambdaQueryWrapper<FlowDefinition>()
            .eq(FlowDefinition::getFlowCode, flowCode)
            .eq(FlowDefinition::getIsPublish, 1));
}

/**
 * 发布时清除缓存
 */
@CacheEvict(value = "workflow:definition", key = "#flowCode")
public void publishDefinition(String flowCode, Long id) {
    // 发布逻辑
}
```

### 批量操作

```java
// 批量删除优化
@Override
@Transactional(rollbackFor = Exception.class)
public boolean batchDelete(List<Long> ids) {
    if (CollUtil.isEmpty(ids)) {
        return false;
    }
    // 批量检查
    List<FlowHisTask> tasks = flowHisTaskMapper.selectList(
        new LambdaQueryWrapper<FlowHisTask>()
            .in(FlowHisTask::getDefinitionId, ids)
            .last("LIMIT 1"));

    if (CollUtil.isNotEmpty(tasks)) {
        throw new ServiceException("存在已使用的流程定义，无法删除");
    }

    // 批量删除
    flowDefinitionMapper.deleteBatchIds(ids);
    flowNodeMapper.delete(new LambdaQueryWrapper<FlowNode>()
        .in(FlowNode::getDefinitionId, ids));
    flowSkipMapper.delete(new LambdaQueryWrapper<FlowSkip>()
        .in(FlowSkip::getDefinitionId, ids));

    return true;
}
```

## 类型定义

### 请求对象

```java
/**
 * 本项目没有单独的流程定义 BO：分页查询、新增、修改都直接使用引擎实体
 * org.dromara.warm.flow.orm.entity.FlowDefinition（见 FlwDefinitionController）
 */
public class FlowDefinition implements Definition {
    /** 流程定义ID（修改时必填） */
    private Long id;

    /** 流程编码（查询条件 / 新增必填） */
    private String flowCode;

    /** 流程名称（查询条件 / 新增必填） */
    private String flowName;

    /** 流程分类（查询条件） */
    private String category;

    /** 流程版本 */
    private String version;

    /** 发布状态（0未发布 1已发布 9失效） */
    private Integer isPublish;

    /** 审批表单是否自定义（Y是 N否） */
    private String formCustom;

    /** 表单路径 */
    private String formPath;

    /** 流程激活状态（0挂起 1激活） */
    private Integer activityStatus;

    /** 流程定义级监听器类型 / 路径 */
    private String listenerType;
    private String listenerPath;

    /** 扩展信息 */
    private String ext;

    /** 流程定义配置（JSON，2.x 新增，如自动审批 autoPass） */
    private String defConfig;

    /** 节点列表（设计器保存时随定义一起提交） */
    private List<Node> nodeList;
}

// 控制器入参（FlwDefinitionController）
public R<PageResult<FlowDefinitionVo>> pageFlowDefinitions(FlowDefinition flowDefinition, PageQuery pageQuery);
public R<Boolean> addFlowDefinition(@RequestBody FlowDefinition flowDefinition);
public R<Boolean> updateFlowDefinition(@RequestBody FlowDefinition flowDefinition);
```

### 响应对象

```java
/**
 * 流程定义视图对象
 */
@Data
public class FlowDefinitionVo {
    /** 流程定义ID */
    private Long id;

    /** 流程编码 */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 版本号 */
    private String version;

    /** 发布状态（0未发布 1已发布 9失效） */
    private Integer isPublish;

    /** 流程分类ID */
    private String category;

    /** 流程分类名称 */
    private String categoryName;

    /** 表单路径 */
    private String formPath;

    /** 是否自定义表单 */
    private String formCustom;

    /** 激活状态 */
    private Integer activityStatus;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
```
