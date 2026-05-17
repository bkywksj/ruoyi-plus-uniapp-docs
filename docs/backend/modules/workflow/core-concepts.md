# 工作流核心概念

## 概述

工作流模块的核心概念是理解和使用工作流功能的基础。本文档详细介绍了工作流系统中的关键概念，包括流程定义、流程实例、任务、节点类型、办理人机制、任务状态等核心要素。掌握这些概念，将帮助开发者更好地设计和实现业务流程自动化。

RuoYi-Plus 工作流模块基于 Warm-Flow 1.8.1 轻量级工作流引擎构建，在保持轻量化的同时，提供了丰富的企业级功能扩展，包括多租户支持、消息通知、权限控制等。

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

### 流程定义扩展属性

流程定义的 `ext` 字段存储 JSON 格式的扩展属性：

```json
{
    "autoPass": true,
    "formType": "custom",
    "formPath": "/business/leave/apply"
}
```

| 扩展属性 | 类型 | 说明 |
|----------|------|------|
| `autoPass` | Boolean | 申请人自动审批，当流程流转到申请人节点时自动通过 |
| `formType` | String | 表单类型：custom（自定义表单）、dynamic（动态表单） |
| `formPath` | String | 表单路径，用于渲染业务表单 |

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

流程实例状态由 `BusinessStatusEnum` 枚举定义：

```java
public enum BusinessStatusEnum {
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

    /** 已撤销 */
    CANCEL("cancel", "已撤销");
}
```

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

任务状态由 `TaskStatusEnum` 枚举定义，共12种状态：

```java
public enum TaskStatusEnum {
    /** 撤销 */
    CANCEL("cancel", "撤销"),

    /** 通过 */
    PASS("pass", "通过"),

    /** 待审核 */
    WAITING("waiting", "待审核"),

    /** 作废 */
    INVALID("invalid", "作废"),

    /** 退回 */
    BACK("back", "退回"),

    /** 终止 */
    TERMINATION("termination", "终止"),

    /** 转办 */
    TRANSFER("transfer", "转办"),

    /** 委托 */
    DEPUTE("depute", "委托"),

    /** 抄送 */
    COPY("copy", "抄送"),

    /** 加签 */
    SIGN("sign", "加签"),

    /** 减签 */
    SIGN_OFF("sign_off", "减签"),

    /** 超时 */
    TIMEOUT("timeout", "超时");
}
```

### 任务状态说明

| 状态 | 标识 | 说明 | 触发场景 |
|------|------|------|----------|
| 撤销 | cancel | 发起人撤销流程 | 发起人在流程未结束前主动撤销 |
| 通过 | pass | 任务审批通过 | 办理人点击"通过"按钮 |
| 待审核 | waiting | 等待办理 | 任务创建后等待办理人处理 |
| 作废 | invalid | 流程被作废 | 管理员或有权限的人作废流程 |
| 退回 | back | 任务被驳回 | 办理人将任务退回给前一节点 |
| 终止 | termination | 流程终止 | 办理人直接终止整个流程 |
| 转办 | transfer | 任务转办 | 将任务转交给其他人办理 |
| 委托 | depute | 任务委托 | 将任务委托给他人代为办理 |
| 抄送 | copy | 任务抄送 | 办理时抄送给相关人员 |
| 加签 | sign | 加签 | 在会签节点增加办理人 |
| 减签 | sign_off | 减签 | 在会签节点减少办理人 |
| 超时 | timeout | 任务超时 | 任务超过设定时间未处理 |

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

Warm-Flow 定义了5种节点类型：

```java
public enum NodeType {
    /** 开始节点 */
    START(0, "开始节点"),

    /** 中间节点（审批节点） */
    BETWEEN(1, "中间节点"),

    /** 结束节点 */
    END(2, "结束节点"),

    /** 排他网关 */
    SERIAL(3, "排他网关"),

    /** 并行网关 */
    PARALLEL(4, "并行网关");
}
```

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

    /** 扩展信息（JSON格式） */
    private String ext;
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

系统通过 `WorkflowPermissionHandler` 处理办理人权限转换：

```java
@Component
public class WorkflowPermissionHandler implements PermissionHandler {

    private final UserService userService;

    @Override
    public List<String> permissions(List<String> permissionFlags) {
        // 将角色、部门、岗位转换为用户ID列表
        Set<String> userIds = new HashSet<>();
        for (String permissionFlag : permissionFlags) {
            if (permissionFlag.startsWith("role:")) {
                // 查询角色下的用户
                String roleIds = permissionFlag.substring(5);
                userIds.addAll(userService.listUserIdsByRoleIds(roleIds));
            } else if (permissionFlag.startsWith("dept:")) {
                // 查询部门下的用户
                String deptIds = permissionFlag.substring(5);
                userIds.addAll(userService.listUserIdsByDeptIds(deptIds));
            } else if (permissionFlag.startsWith("post:")) {
                // 查询岗位下的用户
                String postIds = permissionFlag.substring(5);
                userIds.addAll(userService.listUserIdsByPostIds(postIds));
            } else {
                // 直接是用户ID
                userIds.add(permissionFlag);
            }
        }
        return new ArrayList<>(userIds);
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

按钮权限存储在节点的扩展信息中：

```java
public class NodeExtVo {
    /** 按钮权限列表 */
    private List<String> buttonPermissions;

    /** 抄送设置 */
    private List<String> copySettings;

    /** 变量列表 */
    private List<VariablesEnum> variables;
}
```

**节点扩展配置示例：**

```json
{
    "buttonPermissions": ["back", "file", "copy", "transfer"],
    "copySettings": ["1", "2", "3"],
    "variables": []
}
```

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

// 自动审批标识
variables.put("autoPass", autoPass);

// 业务编号
variables.put("businessCode", businessCode);
```

### 常量定义

```java
public class FlowConstant {
    /** 流程发起人 */
    public static final String INITIATOR = "initiator";

    /** 发起人部门 */
    public static final String INITIATOR_DEPT_ID = "initiatorDeptId";

    /** 业务ID */
    public static final String BUSINESS_ID = "businessId";

    /** 业务编号 */
    public static final String BUSINESS_CODE = "businessCode";

    /** 自动审批 */
    public static final String AUTO_PASS = "autoPass";

    /** 提交标识 */
    public static final String SUBMIT = "submit";

    /** 抄送列表 */
    public static final String FLOW_COPY_LIST = "flowCopyList";

    /** 消息类型 */
    public static final String MESSAGE_TYPE = "messageType";

    /** 消息通知内容 */
    public static final String MESSAGE_NOTICE = "notice";

    /** 委派任务 */
    public static final String DELEGATE_TASK = "delegateTask";

    /** 转办任务 */
    public static final String TRANSFER_TASK = "transferTask";

    /** 加签 */
    public static final String ADD_SIGNATURE = "addSignature";

    /** 减签 */
    public static final String REDUCTION_SIGNATURE = "reductionSignature";
}
```

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

系统实现了 `GlobalListener` 接口，监听流程执行的关键节点：

```java
@Component
public class WorkflowGlobalListener implements GlobalListener {

    /**
     * 任务创建监听
     * 触发时机：新任务生成时
     */
    @Override
    public void create(CreateListener createListener) {
        // 处理任务创建事件
    }

    /**
     * 流程启动监听
     * 触发时机：流程实例创建时
     */
    @Override
    public void start(StartListener startListener) {
        // 处理流程启动事件
    }

    /**
     * 任务分配监听
     * 触发时机：任务分配给办理人时
     */
    @Override
    public void assignment(AssignmentListener assignmentListener) {
        // 处理任务分配事件
    }

    /**
     * 任务完成监听
     * 触发时机：任务办理完成时
     */
    @Override
    public void finish(FinishListener finishListener) {
        // 处理任务完成事件
    }
}
```

### 监听器处理逻辑

```java
@Override
public void finish(FinishListener finishListener) {
    Instance instance = finishListener.getInstance();
    HisTask hisTask = finishListener.getHisTask();

    // 1. 处理抄送
    List<FlowCopyBo> flowCopyList = (List<FlowCopyBo>)
        finishListener.getVariable().get(FlowConstant.FLOW_COPY_LIST);
    if (CollUtil.isNotEmpty(flowCopyList)) {
        flwTaskService.setCopy(hisTask, flowCopyList);
    }

    // 2. 发送消息通知
    List<String> messageType = (List<String>)
        finishListener.getVariable().get(FlowConstant.MESSAGE_TYPE);
    String notice = (String)
        finishListener.getVariable().get(FlowConstant.MESSAGE_NOTICE);
    sendNotification(messageType, notice, instance);

    // 3. 更新流程状态
    updateFlowStatus(instance, hisTask);
}
```

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

    /** 协作方式 */
    private Integer cooperateType;

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
            └── flow_his_task (历史任务)

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
- 加签减签操作会记录到历史任务中

### 4. 如何实现自动审批？

**问题描述**：某些场景下需要系统自动完成审批。

**解决方案**：配置 `autoPass` 参数。

```java
// 在流程定义的 ext 中配置
{
    "autoPass": true
}

// 启动流程时会自动判断
Boolean autoPass = Convert.toBool(variables.getOrDefault(AUTO_PASS, false));

// 如果下一节点办理人是当前用户，自动审批
if (autoPass && nextAssignee.equals(currentUser)) {
    flowParams.message("流程引擎自动审批！");
    skipTask(nextTaskId, flowParams, instanceId, true);
}
```

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
