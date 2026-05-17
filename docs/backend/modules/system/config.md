# 系统配置 (config)

## 1. 模块概述

系统配置模块负责管理系统运行所需的各种参数配置和通知公告功能。该模块提供了灵活的参数管理机制，支持动态配置更新、缓存优化，以及基于WebSocket和SSE的实时消息推送系统。通过统一的配置管理，实现了系统行为的可配置化和业务规则的灵活调整。

### 1.1 核心功能

- **参数配置管理**: 系统运行参数的集中存储和管理
- **通知公告系统**: 支持多目标、多方式的消息推送
- **配置缓存机制**: 基于Redis的高性能配置读取
- **动态配置更新**: 运行时配置修改无需重启应用

### 1.2 技术特点

- **缓存优先**: 配置读取优先从Redis缓存获取，提升性能
- **实时推送**: 集成WebSocket和SSE实现实时消息通知
- **多租户支持**: 支持租户级别的配置隔离
- **Excel集成**: 支持配置数据的导入导出

## 2. 核心组件

### 2.1 参数配置 (SysConfig)

#### 数据模型

参数配置实体继承自`TenantEntity`，支持多租户数据隔离：

```java
@TableName("sys_config")
public class SysConfig extends TenantEntity {
    @TableId(value = "config_id")
    private Long configId;      // 参数主键
    private String configName;  // 参数名称  
    private String configKey;   // 参数键名
    private String configValue; // 参数键值
    private String configType;  // 系统内置标识
    private String remark;      // 备注信息
}
```

#### 业务对象 (SysConfigBo)

包含完整的参数校验规则：

- **参数名称**: 长度限制1-100字符，不能为空
- **参数键名**: 长度限制1-100字符，必须唯一
- **参数键值**: 长度限制1-500字符，支持复杂配置
- **配置类型**: 区分系统内置和用户自定义配置

#### 核心服务接口

```java
public interface ISysConfigService extends IBaseService<SysConfig, SysConfigBo, SysConfigVo> {

    // 根据键名获取配置值（带缓存）
    String getConfigByKey(String configKey);

    // 获取注册开关状态
    boolean getRegisterEnabled(String tenantId);

    // 新增配置参数
    String insertConfig(SysConfigBo bo);

    // 修改配置参数  
    String updateConfig(SysConfigBo bo);

    // 批量删除配置
    void deleteConfigByIds(Long[] configIds);

    // 清除配置缓存
    void clearConfigCache();

    // 校验配置键名唯一性
    boolean checkConfigKeyUnique(SysConfigBo config);
}
```

### 2.2 缓存机制

#### 缓存策略

采用Spring Cache + Redis的多级缓存架构：

```java
// 查询时自动缓存
@Cacheable(cacheNames = CacheNames.SYS_CONFIG, key = "#configKey")
public String getConfigByKey(String configKey) {
    // 从数据库查询配置值
}

// 更新时自动刷新缓存
@CachePut(cacheNames = CacheNames.SYS_CONFIG, key = "#bo.configKey")
public String updateConfig(SysConfigBo bo) {
    // 更新配置并刷新缓存
}
```

#### 缓存管理

- **自动缓存**: 配置查询时自动加载到Redis
- **智能更新**: 配置修改时自动更新缓存
- **批量清理**: 支持手动清理全部配置缓存
- **缓存隔离**: 多租户环境下的缓存键隔离

### 2.3 配置分类

#### 系统内置配置

**核心系统配置**:
- `system.account.register-enabled`: 用户注册开关
- `system.captcha.enabled`: 验证码功能开关
- `system.tenant.enabled`: 多租户功能开关
- `system.oss.default-platform`: 默认存储平台

#### 业务配置参数

**可定制的业务规则**:
- 密码强度策略配置
- 会话超时时间设置
- 文件上传限制参数
- 系统功能开关控制

#### 配置类型管理

- **系统内置** (configType = "Y"): 系统核心配置，不可删除
- **用户自定义** (configType = "N"): 业务自定义配置，可以修改删除

## 3. 通知公告系统

### 3.1 公告管理 (SysNotice)

#### 数据模型

```java
@TableName("sys_notice") 
public class SysNotice extends TenantEntity {
    @TableId(value = "notice_id")
    private Long noticeId;          // 公告ID
    private String noticeTitle;     // 公告标题
    private String noticeContent;   // 公告内容
    private String noticeType;      // 公告类型 (1通知 2公告)
    private String targetConfig;    // 推送配置JSON
    private String targetUserIds;   // 目标用户ID列表
    private String readUserIds;     // 已读用户ID列表
    private String status;          // 公告状态
}
```

#### 公告类型

- **通知类型** (DictNoticeType.NOTICE): 一般性通知信息
- **公告类型** (DictNoticeType.ANNOUNCEMENT): 重要公告信息

#### 公告状态

- **草稿状态** (DictNoticeStatus.DRAFT): 编辑中，未发布
- **立即发送** (DictNoticeStatus.SEND_IMMEDIATELY): 已发布，立即推送

### 3.2 目标用户管理

#### 推送目标配置

支持灵活的目标用户选择机制：

```java
public class TargetConfigDto {
    private String type;           // 推送类型: ALL/DEPT/ROLE/USER
    private List<Long> deptIds;    // 目标部门ID列表
    private List<Long> roleIds;    // 目标角色ID列表  
    private List<Long> userIds;    // 目标用户ID列表
}
```

#### 目标用户解析

**推送范围类型**:
- **全部用户**: 向系统所有启用用户推送
- **指定部门**: 向选定部门的所有用户推送
- **指定角色**: 向拥有特定角色的用户推送
- **指定用户**: 向明确选择的用户推送

#### 用户列表生成

系统会根据推送配置自动解析出具体的目标用户ID列表：

```java
public void processTargetConfig(SysNoticeBo bo) {
    // 根据推送配置解析目标用户
    // 支持部门用户查询、角色用户查询、直接用户指定
    // 自动去重并生成最终的用户ID列表
}
```

### 3.3 实时消息推送

#### WebSocket推送

基于Spring WebSocket的实时消息推送：

```java
public void sendNoticeNotification(SysNoticeBo bo) {
    if (StringUtils.isNotBlank(bo.getTargetUserIds()) && 
        DictEnableStatus.isEnabled(bo.getStatus())) {
        
        String type = DictNoticeType.getByValue(bo.getNoticeType()).getLabel();
        String message = "[" + type + "] " + bo.getNoticeTitle();
        
        List<Long> userIds = StringUtils.splitToList(bo.getTargetUserIds(), Convert::toLong);
        WebSocketUtils.publishMessage(WebSocketMessageDto.of(userIds, message));
    }
}
```

#### SSE推送支持

Server-Sent Events提供了另一种实时推送方案：

- **长连接**: 服务器主动向客户端推送数据
- **轻量级**: 相比WebSocket更轻量，单向通信
- **兼容性**: 更好的浏览器兼容性

### 3.4 阅读状态管理

#### 已读状态跟踪

**已读标记机制**:
- **targetUserIds**: 可以接收此公告的用户ID列表
- **readUserIds**: 已经阅读此公告的用户ID列表
- **isRead**: 当前用户的阅读状态标识

#### 核心服务方法

```java
public interface ISysNoticeService {
    
    // 分页获取用户公告列表
    PageResult<UserNoticeVo> pageNoticesByUserId(Long userId, PageQuery pageQuery);
    
    // 获取用户公告详情
    UserNoticeVo getUserNoticeDetail(Long noticeId, Long userId);
    
    // 获取用户未读通知数量
    Long getUnreadCountByUserId(Long userId);
    
    // 标记公告为已读
    boolean markAsRead(Long noticeId, Long userId);
    
    // 标记所有公告为已读
    boolean markAllAsRead(Long userId);
}
```

#### 阅读统计

**统计维度**:
- **已读人数**: 已经阅读公告的用户数量
- **目标人数**: 应该接收公告的总用户数量
- **阅读率**: 已读人数/目标人数的百分比
- **未读用户**: 尚未阅读公告的用户列表

## 4. REST API接口

### 4.1 配置管理接口 (`/system/config`)

#### 基础CRUD操作

```http
# 分页查询参数配置列表
GET /system/config/pageConfigs
# 权限: system:config:query

# 获取参数配置详细信息
GET /system/config/getConfig/{configId}  
# 权限: system:config:query

# 根据参数键名查询参数值
GET /system/config/getByConfigKey/{configKey}
# 无权限要求，公开接口

# 新增参数配置
POST /system/config/addConfig
# 权限: system:config:add

# 修改参数配置
PUT /system/config/updateConfig
# 权限: system:config:update

# 根据参数键名修改参数配置
PUT /system/config/updateConfigByKey
# 权限: system:config:update

# 删除参数配置
DELETE /system/config/deleteConfigs/{configIds}
# 权限: system:config:delete

# 清除参数缓存
DELETE /system/config/clearConfigCache
# 权限: system:config:delete
```

#### Excel操作接口

```http
# 导出参数配置列表
POST /system/config/exportConfigs
# 权限: system:config:export

# 获取参数配置导入模板
POST /system/config/templateConfigs
# 无权限要求

# 导入参数配置
POST /system/config/importConfigs
# 权限: system:config:add
# Content-Type: multipart/form-data
```

### 4.2 通知公告接口 (`/system/notice`)

#### 管理端接口

```http
# 获取通知公告列表（分页）
GET /system/notice/pageNotices
# 权限: system:notice:query

# 根据公告编号获取详细信息
GET /system/notice/getNotice/{noticeId}
# 权限: system:notice:query

# 新增通知公告
POST /system/notice/addNotice
# 权限: system:notice:add
# 注解: @RepeatSubmit() 防重复提交

# 修改通知公告
PUT /system/notice/updateNotice  
# 权限: system:notice:update
# 注解: @RepeatSubmit() 防重复提交

# 删除通知公告
DELETE /system/notice/deleteNotices/{noticeIds}
# 权限: system:notice:delete

# 导出通知公告列表
POST /system/notice/exportNotices
# 权限: system:notice:export

# 获取通知公告导入模板
POST /system/notice/templateNotices
# 无权限要求

# 导入通知公告
POST /system/notice/importNotices
# 权限: system:notice:import
# Content-Type: multipart/form-data
```

#### 用户端接口（无需权限）

```http
# 获取当前用户的通知公告列表
GET /system/notice/pageUserNotices
# 自动获取当前登录用户ID

# 获取当前用户的未读通知数量
GET /system/notice/getNoticeUnreadCount
# 返回未读消息数量

# 获取用户公告详情（包含已读状态）
GET /system/notice/getUserNotice/{noticeId}
# 返回用户特定的公告详情

# 标记公告为已读
POST /system/notice/markNoticeAsRead/{noticeId}
# 标记特定公告为已读状态

# 标记所有公告为已读
POST /system/notice/markAllNoticesAsRead
# 批量标记当前用户所有公告为已读
```

### 4.3 OSS配置接口 (`/resource/oss-config`)

#### OSS配置管理

```http
# 查询对象存储配置列表
GET /resource/oss-config/pageOssConfigs
# 权限: system:ossConfig:query

# 获取对象存储配置详细信息
GET /resource/oss-config/getOssConfig/{ossConfigId}
# 权限: system:ossConfig:query

# 新增对象存储配置
POST /resource/oss-config/addOssConfig
# 权限: system:ossConfig:add
# 注解: @RepeatSubmit() 防重复提交

# 修改对象存储配置
PUT /resource/oss-config/updateOssConfig
# 权限: system:ossConfig:update
# 注解: @RepeatSubmit() 防重复提交

# 删除对象存储配置
DELETE /resource/oss-config/deleteOssConfigs/{ossConfigIds}
# 权限: system:ossConfig:delete

# OSS配置状态修改
PUT /resource/oss-config/changeOssConfigStatus
# 权限: system:ossConfig:update
```

### 4.4 验证码接口 (`/auth`)

#### 验证码生成接口

```http
# 生成图片验证码
GET /auth/imgCode
# 注解: @SaIgnore 无需认证
# 返回Base64图片和UUID

# 发送短信验证码  
GET /auth/smsCode
# 注解: @SaIgnore + @RateLimiter 限流保护

# 发送邮箱验证码
GET /auth/emailCode
# 注解: @SaIgnore + @RateLimiter 限流保护
```

## 5. 配置应用场景

### 5.1 系统开关控制

#### 功能开关配置

**注册功能控制**:
```java
// 检查租户注册开关
public boolean getRegisterEnabled(String tenantId) {
    SysConfig config = getConfigByKey("system.account.register-enabled");
    return Convert.toBool(config.getConfigValue());
}
```

**验证码开关**:
- `system.captcha.enabled`: 控制验证码功能启用
- `system.captcha.type`: 验证码类型 (MATH/CHAR/LINE)

#### 业务规则配置

**安全策略参数**:
- `system.user.password.maxRetryCount`: 密码错误最大重试次数
- `system.user.password.lockTime`: 账号锁定时间
- `system.session.timeout`: 会话超时时间

### 5.2 第三方服务配置

#### OSS存储配置

通过配置参数控制默认存储服务：
- `system.oss.default-platform`: 默认存储平台选择
- `system.oss.upload.maxFileSize`: 文件上传大小限制
- `system.oss.upload.allowedTypes`: 允许上传的文件类型

#### 邮件服务配置

- `system.mail.enabled`: 邮件功能开关
- `system.mail.host`: SMTP服务器地址
- `system.mail.port`: SMTP端口号

### 5.3 租户个性化配置

#### 租户级配置

每个租户可以有独立的配置参数：

```java
// 获取租户特定配置
TenantHelper.dynamic(tenantId, () -> {
    return configService.getConfigByKey("tenant.custom.setting");
});
```

**常见租户配置**:
- 租户Logo和主题色配置
- 租户功能模块开关
- 租户业务规则参数
- 租户对接配置信息

## 6. 通知公告详解

### 6.1 公告发布流程

#### 创建公告

**发布步骤**:
1. **编辑内容**: 设置公告标题、内容、类型
2. **选择目标**: 配置推送目标 (全员/部门/角色/用户)
3. **预览确认**: 预览公告内容和推送范围
4. **发布推送**: 发布公告并实时推送给目标用户

#### 目标用户处理

```java
public void processTargetConfig(SysNoticeBo bo) {
    TargetConfigDto targetConfig = JsonUtils.parseObject(bo.getTargetConfig(), TargetConfigDto.class);
    
    Set<Long> userIds = new HashSet<>();
    
    // 根据部门获取用户
    if (CollUtil.isNotEmpty(targetConfig.getDeptIds())) {
        userIds.addAll(getUserIdsByDeptIds(targetConfig.getDeptIds()));
    }
    
    // 根据角色获取用户  
    if (CollUtil.isNotEmpty(targetConfig.getRoleIds())) {
        userIds.addAll(getUserIdsByRoleIds(targetConfig.getRoleIds()));
    }
    
    // 直接指定的用户
    if (CollUtil.isNotEmpty(targetConfig.getUserIds())) {
        userIds.addAll(targetConfig.getUserIds());
    }
    
    bo.setTargetUserIds(StringUtils.join(userIds, ","));
}
```

### 6.2 消息推送机制

#### WebSocket推送

**推送流程**:
1. 公告发布时触发推送逻辑
2. 根据目标用户ID列表构建消息
3. 通过WebSocket向在线用户实时推送
4. 离线用户登录后获取未读消息

#### 消息格式

```java
// WebSocket消息结构
public class WebSocketMessageDto {
    private List<Long> userIds;    // 目标用户ID列表
    private String message;        // 消息内容
    private String type;           // 消息类型
    private Date timestamp;        // 推送时间
}
```

### 6.3 阅读状态管理

#### 已读机制

**状态更新流程**:
1. 用户点击查看公告详情
2. 系统自动调用markAsRead接口
3. 将用户ID添加到readUserIds字段
4. 更新用户的未读消息数量

#### 批量已读

```java
public boolean markAllAsRead(Long userId) {
    // 查询用户所有未读公告
    List<SysNotice> unreadNotices = selectUnreadNotices(userId);
    
    // 批量更新已读状态
    for (SysNotice notice : unreadNotices) {
        notice.setReadUserIds(
            StringUtils.addToCommaString(notice.getReadUserIds(), userId.toString())
        );
    }
    
    return batchUpdate(unreadNotices);
}
```

## 7. 数据安全与权限

### 7.1 配置权限控制

#### 权限注解

系统配置的访问控制：

```java
@SaCheckPermission("system:config:list")    // 查看配置列表
@SaCheckPermission("system:config:query")   // 查询配置详情  
@SaCheckPermission("system:config:add")     // 新增配置
@SaCheckPermission("system:config:edit")    // 修改配置
@SaCheckPermission("system:config:remove")  // 删除配置
```

#### 敏感配置保护

**内置配置保护**:
- 系统内置配置 (configType = "Y") 不允许删除
- 关键配置修改需要超级管理员权限
- 敏感配置值的显示脱敏处理

### 7.2 公告权限控制

#### 发布权限

```java
@SaCheckPermission("system:notice:add")     // 发布公告权限
@SaCheckPermission("system:notice:edit")    // 修改公告权限
@SaCheckPermission("system:notice:remove")  // 删除公告权限
```

#### 查看权限

- **管理员**: 可以查看所有公告的发布状态和统计信息
- **普通用户**: 只能查看发送给自己的公告列表
- **部门管理员**: 可以查看本部门相关的公告

## 8. 性能优化

### 8.1 配置缓存优化

#### 缓存策略

**多级缓存架构**:
- **L1缓存**: 应用内存缓存，提供最快访问
- **L2缓存**: Redis缓存，提供分布式共享
- **L3存储**: 数据库持久化存储

#### 缓存预热

```java
@PostConstruct
public void initConfigCache() {
    // 应用启动时预加载热点配置到缓存
    List<SysConfig> configs = baseMapper.selectList(null);
    for (SysConfig config : configs) {
        CacheUtils.put(CacheNames.SYS_CONFIG, config.getConfigKey(), config.getConfigValue());
    }
}
```

### 8.2 查询性能优化

#### 数据库索引

**关键索引设计**:
- `idx_config_key`: 配置键名索引，支持快速精确查询
- `idx_config_type`: 配置类型索引，支持分类查询
- `idx_tenant_id`: 租户ID索引，支持多租户数据隔离
- `idx_create_time`: 创建时间索引，支持时间范围查询

#### 分页查询优化

- **条件查询**: 支持配置名称、键名、键值的模糊搜索
- **复合索引**: 多字段联合查询的索引优化
- **查询缓存**: 频繁查询结果的缓存处理

## 9. 监控与运维

### 9.1 配置变更监控

#### 操作日志记录

所有配置操作自动记录操作日志：

```java
@Log(title = "参数管理", operType = DictOperType.UPDATE)
public String updateConfig(SysConfigBo bo) {
    // 配置修改操作，自动记录日志
}
```

**记录内容**:
- 操作人员和操作时间
- 修改前后的配置值对比
- 操作结果和异常信息
- 客户端IP和请求参数

#### 配置审计

**审计功能**:
- 配置修改历史追踪
- 敏感配置变更告警
- 配置回滚支持
- 变更影响分析

### 9.2 公告发送监控

#### 推送状态监控

**监控指标**:
- 公告发送成功率
- 消息推送延迟统计
- WebSocket连接状态
- 用户阅读率统计

#### 异常处理

**容错机制**:
- WebSocket连接异常时的重试机制
- 推送失败时的补偿机制
- 大量用户推送时的限流保护
- 异常情况的告警通知

## 10. 扩展开发

### 10.1 新增配置类型

#### 扩展配置分类

添加新的配置分类需要：

1. **定义配置键前缀**: 如 `business.order.` 前缀
2. **创建配置常量**: 定义配置键名常量
3. **实现配置服务**: 提供业务特定的配置获取方法
4. **添加配置界面**: 前端配置管理界面

#### 复杂配置支持

**JSON配置值**:
```java
// 支持复杂JSON配置
public <T> T getConfigObject(String configKey, Class<T> clazz) {
    String configValue = getConfigByKey(configKey);
    return JsonUtils.parseObject(configValue, clazz);
}
```

### 10.2 扩展推送方式

#### 新增推送渠道

支持扩展更多推送方式：

**短信推送**:
- 重要公告支持短信通知
- 集成SMS4J短信服务
- 支持短信模板管理

**邮件推送**:
- 公告内容邮件发送
- 邮件模板定制
- 附件支持

**第三方推送**:
- 企业微信推送
- 钉钉工作通知
- 飞书消息推送

## 11. 配置最佳实践

### 11.1 配置命名规范

#### 键名命名约定

**层级化命名**:
- `system.`: 系统级配置前缀
- `business.`: 业务级配置前缀
- `tenant.`: 租户级配置前缀
- `module.`: 模块级配置前缀

**示例命名**:
```text
system.account.register-enabled     # 注册开关
system.captcha.enabled             # 验证码开关
business.order.auto-confirm        # 订单自动确认
tenant.theme.primary-color         # 租户主题色
```

### 11.2 配置值规范

#### 数据类型约定

**基础类型**:
- `true/false`: 布尔开关配置
- `数字`: 数量、时间、限制等数值配置
- `字符串`: 名称、路径、模板等文本配置

**复杂类型**:
- `JSON对象`: 复杂配置结构
- `逗号分隔`: 多值列表配置
- `URL格式`: 地址、链接类配置

### 11.3 缓存使用建议

#### 缓存键设计

**缓存键规范**:
- 使用配置的configKey作为缓存键
- 多租户环境下包含租户ID
- 避免缓存键冲突和覆盖

#### 缓存更新策略

**更新时机**:
- 配置修改时立即更新缓存
- 配置删除时清除对应缓存
- 系统重启时重新加载所有配置
- 定期校验缓存与数据库一致性

## 12. 故障排查

### 12.1 常见问题

#### 配置不生效问题

**排查步骤**:
1. 检查配置是否正确保存到数据库
2. 验证缓存是否已更新
3. 确认应用是否正确读取配置
4. 检查多租户上下文是否正确

#### 消息推送失败

**故障排查**:
1. 检查WebSocket连接状态
2. 验证目标用户ID是否正确
3. 确认用户是否在线
4. 检查消息格式是否正确

### 12.2 性能问题

#### 配置查询慢

**优化方案**:
- 检查数据库索引是否有效
- 优化缓存命中率
- 减少不必要的配置查询
- 使用批量查询替代单个查询

#### 大量推送性能

**性能优化**:
- 异步批量推送处理
- 推送队列和限流控制
- WebSocket连接池管理
- 推送失败的重试机制

## 13. 总结

系统配置模块作为系统的"大脑中枢"，通过灵活的参数管理和强大的通知推送能力，为整个系统提供了：

**配置管理能力**: 统一的参数存储、缓存优化、动态更新，确保系统行为的可配置性和灵活性。

**消息通信能力**: 完善的通知公告系统，支持多种推送方式和目标选择，实现了高效的信息传递。

**运维支持能力**: 详细的操作日志、性能监控、异常处理，为系统运维提供了有力支撑。

**扩展适配能力**: 良好的扩展性设计，支持新配置类型、新推送方式的便捷接入。

该模块为系统的稳定运行和功能扩展提供了坚实的基础支撑。
