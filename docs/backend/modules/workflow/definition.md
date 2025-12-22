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

    /** 流程版本 */
    private String version;

    /** 是否发布（0-未发布，1-已发布，2-已失效） */
    private Integer isPublish;

    /** 流程分类 */
    private String category;

    /** 表单路径 */
    private String formPath;

    /** 表单类型（是否自定义表单） */
    private String formCustom;

    /** 是否激活（0-挂起，1-激活） */
    private Integer activityStatus;

    /** 扩展信息（JSON格式） */
    private String ext;

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

流程定义有三种发布状态：

```java
public enum PublishStatus {
    /** 未发布 */
    UNPUBLISHED(0, "未发布"),

    /** 已发布 */
    PUBLISHED(1, "已发布"),

    /** 已失效（新版本发布后旧版本自动失效） */
    EXPIRED(2, "已失效");
}
```

| 状态 | 值 | 说明 | 可执行操作 |
|------|----|----|------------|
| 未发布 | 0 | 草稿状态，可编辑修改 | 编辑、删除、发布、复制 |
| 已发布 | 1 | 正式状态，可创建实例 | 停用、导出、复制、激活/挂起 |
| 已失效 | 2 | 已有新版本发布 | 查看、删除 |

### 扩展属性

流程定义的 `ext` 字段存储 JSON 格式的扩展配置：

```json
{
    "autoPass": true,
    "formType": "custom",
    "formPath": "/business/leave/apply",
    "listenerClass": "plus.ruoyi.workflow.listener.LeaveListener"
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `autoPass` | Boolean | 申请人自动审批开关 |
| `formType` | String | 表单类型：custom/dynamic |
| `formPath` | String | 表单组件路径 |
| `listenerClass` | String | 自定义监听器类名 |

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
        "ext": "{\"autoPass\":true}",
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
    "ext": "{\"autoPass\":true}",
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
| ext | String | 否 | 扩展信息（JSON） |
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
            // 检查中间节点是否配置了办理人（申请节点除外）
            if (StringUtils.isBlank(flowNode.getPermissionFlag())
                && !applyNodeCode.equals(flowNode.getNodeCode())
                && NodeType.BETWEEN.getKey().equals(flowNode.getNodeType())) {
                errorMsg.add(flowNode.getNodeName());
            }
        }
        if (CollUtil.isNotEmpty(errorMsg)) {
            throw new ServiceException("节点【{}】未配置办理人!", StringUtils.joinComma(errorMsg));
        }
    }
    return defService.publish(id);
}
```

**校验规则**:
1. 所有中间节点（申请节点除外）必须配置办理人
2. 流程必须包含开始节点和结束节点
3. 所有节点必须有完整的流转路径

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

    /** 节点类型（0-开始，1-中间，2-结束，3-排他网关，4-并行网关） */
    private Integer nodeType;

    /** 权限标识（办理人配置） */
    private String permissionFlag;

    /** 节点比例（会签比例，0表示非会签） */
    private BigDecimal nodeRatio;

    /** 任意跳转节点编码 */
    private String anyNodeSkip;

    /** 坐标位置 */
    private String coordinate;

    /** 跳过第一个节点（是否跳过申请节点） */
    private String skipFirstNode;

    /** 扩展信息 */
    private String ext;

    /** 租户ID */
    private String tenantId;
}
```

### 节点类型

| 类型 | 值 | 说明 |
|------|----|----|
| 开始节点 | 0 | 流程入口 |
| 中间节点 | 1 | 审批节点 |
| 结束节点 | 2 | 流程出口 |
| 排他网关 | 3 | 条件分支 |
| 并行网关 | 4 | 并行分支 |

### 节点扩展配置

节点的 `ext` 字段存储按钮权限等扩展配置：

```json
{
    "buttonPermissions": ["back", "file", "copy", "transfer"],
    "copySettings": ["1", "2", "3"],
    "variables": []
}
```

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
public class FlowCategory {
    /** 分类ID */
    private Long categoryId;

    /** 分类名称 */
    private String categoryName;

    /** 父分类ID */
    private Long parentId;

    /** 排序 */
    private Integer orderNum;

    /** 租户ID */
    private String tenantId;
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
signNode.setNodeRatio(new BigDecimal("1.0")); // 100%通过才能继续

// 票签节点配置（50%通过即可）
FlowNode voteNode = new FlowNode();
voteNode.setNodeCode("vote");
voteNode.setNodeName("投票表决");
voteNode.setNodeType(1);
voteNode.setPermissionFlag("role:5"); // 委员会角色
voteNode.setNodeRatio(new BigDecimal("0.5")); // 50%通过即可
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
- 中间节点（非申请节点）未配置 `permissionFlag`

**解决方案**:
```java
// 检查节点配置
for (FlowNode node : nodeList) {
    if (node.getNodeType() == 1 && StringUtils.isBlank(node.getPermissionFlag())) {
        // 配置办理人
        node.setPermissionFlag("role:xxx");
    }
}
```

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
- `nodeRatio` 设置为 0 或未设置
- 办理人只配置了一个用户

**解决方案**:
```java
// 正确配置会签节点
FlowNode signNode = new FlowNode();
signNode.setNodeCode("sign");
signNode.setNodeType(1);
signNode.setPermissionFlag("1,2,3,4,5"); // 多个用户
signNode.setNodeRatio(new BigDecimal("0.6")); // 60%通过

// 注意：nodeRatio > 0 时为会签模式
// nodeRatio = 0 或 null 时为或签模式（任一人审批即可）
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

```
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
public PageResult<FlowDefinitionVo> pageFlowDefinitions(FlowDefinitionBo bo, PageQuery pageQuery) {
    LambdaQueryWrapper<FlowDefinition> wrapper = buildQueryWrapper(bo);
    // 只查询必要字段
    wrapper.select(FlowDefinition::getId, FlowDefinition::getFlowCode,
        FlowDefinition::getFlowName, FlowDefinition::getVersion,
        FlowDefinition::getIsPublish, FlowDefinition::getCategory);

    Page<FlowDefinition> page = flowDefinitionMapper.selectPage(pageQuery.build(), wrapper);
    return PageResult.build(page, FlowDefinitionVo.class);
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
 * 流程定义查询对象
 */
@Data
public class FlowDefinitionBo {
    /** 流程编码 */
    private String flowCode;

    /** 流程名称 */
    private String flowName;

    /** 流程分类 */
    private String category;

    /** 发布状态 */
    private Integer isPublish;
}

/**
 * 流程定义新增/修改对象
 */
@Data
public class FlowDefinitionSaveBo {
    /** 流程定义ID（修改时必填） */
    private Long id;

    /** 流程编码 */
    @NotBlank(message = "流程编码不能为空")
    private String flowCode;

    /** 流程名称 */
    @NotBlank(message = "流程名称不能为空")
    private String flowName;

    /** 流程分类 */
    private String category;

    /** 表单路径 */
    private String formPath;

    /** 扩展信息 */
    private String ext;

    /** 节点列表 */
    @NotEmpty(message = "节点列表不能为空")
    private List<FlowNodeBo> nodeList;

    /** 跳转规则列表 */
    @NotEmpty(message = "跳转规则不能为空")
    private List<FlowSkipBo> skipList;
}
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

    /** 发布状态 */
    private Integer isPublish;

    /** 发布状态名称 */
    private String isPublishName;

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
