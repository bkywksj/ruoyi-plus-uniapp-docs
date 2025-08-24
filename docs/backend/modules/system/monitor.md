# 系统监控 (monitor)

## 概述

监控模块是系统的重要组成部分，提供对系统运行状态、用户行为、缓存性能等多方面的监控功能。该模块主要包含缓存监控、登录日志监控、操作日志监控和在线用户监控四大功能模块。

## 模块结构

```
plus.ruoyi.system.monitor
├── controller/          # 控制层
│   ├── CacheController.java
│   ├── SysLoginLogController.java
│   ├── SysOperlogController.java
│   └── SysUserOnlineController.java
├── domain/              # 领域层
│   ├── bo/              # 业务对象
│   │   ├── SysLoginLogBo.java
│   │   └── SysOperLogBo.java
│   ├── entity/          # 实体对象
│   │   ├── SysLoginLog.java
│   │   └── SysOperLog.java
│   └── vo/              # 视图对象
│       ├── CacheMonitorVo.java
│       ├── SysLoginLogVo.java
│       └── SysOperLogVo.java
├── mapper/              # 数据访问层
│   ├── SysLoginLogMapper.java
│   ├── SysLoginLogMapper.xml
│   ├── SysOperLogMapper.java
│   └── SysOperLogMapper.xml
└── service/             # 服务层
    ├── ISysLoginLogService.java
    ├── ISysOperLogService.java
    └── impl/
        ├── SysLoginLogServiceImpl.java
        └── SysOperLogServiceImpl.java
```

## 功能模块详解

### 1. 缓存监控模块

**核心组件：** `CacheController`

**主要功能：**
- Redis服务器状态监控
- 缓存数据库大小统计
- 命令执行统计分析

**核心接口：**

#### 获取缓存监控信息
```java
@GetMapping("/getCacheInfo")
public R<CacheMonitorVo> getCacheInfo()
```

**功能说明：**
- 获取Redis服务器详细信息（内存、CPU、连接数等）
- 统计当前数据库键数量
- 分析各命令执行次数统计
- 权限要求：`monitor:cache:query`

**返回数据结构：**
- `info`: Redis服务器配置和运行状态
- `dbSize`: 数据库键总数
- `commandStats`: 命令执行统计（命令名称和执行次数）

### 2. 登录日志监控模块

**核心组件：** `SysLoginLogController`、`SysLoginLogServiceImpl`

**主要功能：**
- 用户登录行为记录
- 登录日志查询和管理
- 登录失败统计和账户锁定管理

**核心接口：**

#### 分页查询登录日志
```java
@GetMapping("/pageLoginLogs")
public R<PageResult<SysLoginLogVo>> pageLoginLogs(SysLoginLogBo loginLog, PageQuery pageQuery)
```

#### 批量删除登录日志
```java
@DeleteMapping("/deleteLoginLogs/{infoIds}")
public R<Void> deleteLoginLogs(@PathVariable Long[] infoIds)
```

#### 清理登录日志
```java
@DeleteMapping("/clearLoginLogs")
public R<Void> clearLoginLogs()
```

#### 账户解锁
```java
@GetMapping("/unlockLoginLog/{userName}")
public R<Void> unlockLoginLog(@PathVariable String userName)
```

#### 导出登录日志
```java
@PostMapping("/exportLoginLogs")
public void exportLoginLogs(SysLoginLogBo loginLogBo, PageQuery pageQuery, HttpServletResponse response)
```

**数据模型：**

**SysLoginLog 实体字段：**
- `infoId`: 访问ID（主键）
- `tenantId`: 租户ID
- `userId`: 用户ID
- `userName`: 用户账号
- `deviceType`: 设备类型
- `status`: 登录状态
- `ipaddr`: 登录IP地址
- `loginLocation`: 登录地点
- `browser`: 浏览器类型
- `os`: 操作系统
- `msg`: 提示消息
- `loginTime`: 访问时间

**特殊功能：**
- 支持基于IP、用户名、时间范围的复合查询
- 支持模糊搜索（用户名、IP、地点、消息等）
- 自动记录登录事件（通过事件监听器异步处理）
- 支持账户锁定和解锁机制

### 3. 操作日志监控模块

**核心组件：** `SysOperlogController`、`SysOperLogServiceImpl`

**主要功能：**
- 系统操作行为记录
- 操作日志查询和分析
- 操作统计和审计

**核心接口：**

#### 分页查询操作日志
```java
@GetMapping("/pageOperLogs")
public R<PageResult<SysOperLogVo>> pageOperLogs(SysOperLogBo operLog, PageQuery pageQuery)
```

#### 批量删除操作日志
```java
@DeleteMapping("/deleteOperLogs/{operIds}")
public R<Void> deleteOperLogs(@PathVariable Long[] operIds)
```

#### 清理操作日志
```java
@DeleteMapping("/clearOperLogs")
public R<Void> clearOperLogs()
```

#### 导出操作日志
```java
@PostMapping("/exportOperLogs")
public void exportOperLogs(SysOperLogBo bo, PageQuery pageQuery, HttpServletResponse response)
```

**数据模型：**

**SysOperLog 实体字段：**
- `operId`: 日志主键
- `tenantId`: 租户ID
- `title`: 操作模块
- `operType`: 操作类型
- `method`: 请求方法
- `requestMethod`: 请求方式
- `operatorType`: 操作用户类别
- `operName`: 操作人员
- `deptName`: 部门名称
- `operUrl`: 请求URL
- `operIp`: 操作地址
- `operLocation`: 操作地点
- `operParam`: 请求参数
- `jsonResult`: 返回参数
- `status`: 操作结果
- `errorMsg`: 错误消息
- `operTime`: 操作时间
- `costTime`: 消耗时间

**特殊功能：**
- 支持按操作类型、状态、操作人员等多维度查询
- 支持时间范围查询和模糊搜索
- 自动记录操作事件（通过事件监听器异步处理）
- 自动获取IP地址对应的地理位置信息

### 4. 在线用户监控模块

**核心组件：** `SysUserOnlineController`

**主要功能：**
- 在线用户状态监控
- 强制用户下线
- 多设备登录管理

**核心接口：**

#### 获取在线用户列表
```java
@GetMapping("/pageOnlineUsers")
public R<PageResult<SysUserOnlineVo>> pageOnlineUsers(String ipaddr, String userName)
```

#### 强制用户下线
```java
@DeleteMapping("/forceLogout/{tokenId}")
public R<Void> forceLogout(@PathVariable String tokenId)
```

#### 获取当前用户在线设备
```java
@GetMapping("/listCurrentUserOnlines")
public R<List<SysUserOnlineVo>> listCurrentUserOnlines()
```

#### 移除当前用户指定设备
```java
@DeleteMapping("/removeCurrentDevice/{tokenId}")
public R<Void> removeCurrentDevice(@PathVariable String tokenId)
```

**特殊功能：**
- 基于Redis缓存的在线状态管理
- 支持按IP地址和用户名过滤
- 自动过滤已过期的token
- 支持多设备登录管理

## 权限配置

| 功能模块 | 所需权限 | 说明 |
|---------|---------|------|
| 缓存监控 | `monitor:cache:query` | 查看缓存监控信息 |
| 登录日志查询 | `monitor:loginLog:query` | 查询登录日志 |
| 登录日志删除 | `monitor:loginLog:delete` | 删除和清理登录日志 |
| 登录日志导出 | `monitor:loginLog:export` | 导出登录日志 |
| 账户解锁 | `monitor:loginLog:unlock` | 解锁被锁定的账户 |
| 操作日志查询 | `monitor:operLog:query` | 查询操作日志 |
| 操作日志删除 | `monitor:operLog:delete` | 删除和清理操作日志 |
| 操作日志导出 | `monitor:operLog:export` | 导出操作日志 |
| 在线用户查询 | `monitor:online:query` | 查看在线用户 |
| 强制下线 | `monitor:online:forceLogout` | 强制用户下线 |

## 技术特性

### 1. 异步事件处理
- 使用`@EventListener`和`@Async`注解实现日志异步记录
- 避免日志记录影响主业务流程性能
- 支持自定义事件监听器

### 2. 分页查询支持
- 基于MyBatis-Plus的分页查询机制
- 支持动态条件查询和模糊搜索
- 提供统一的分页参数和返回格式

### 3. 数据导出功能
- 基于EasyExcel的数据导出功能
- 支持自定义导出字段和格式
- 支持字典数据转换

### 4. 缓存集成
- 基于Redis的数据缓存
- 支持Redisson连接池
- 提供缓存监控和统计功能

### 5. IP地理位置解析
- 自动解析IP地址对应的地理位置
- 支持登录和操作日志的位置记录

## 配置说明

### 1. 数据库配置
确保以下数据表存在：
- `sys_login_log`: 登录日志表
- `sys_oper_log`: 操作日志表

### 2. Redis配置
确保Redis服务正常运行，并配置Redisson连接工厂。

### 3. 权限配置
在权限管理系统中配置相应的监控权限。

## 使用示例

### 1. 查询登录日志
```java
// 构建查询条件
SysLoginLogBo loginLogBo = new SysLoginLogBo();
loginLogBo.setUserName("admin");
loginLogBo.setStatus("0"); // 成功登录
loginLogBo.setIpaddr("192.168.1.1");

// 分页参数
PageQuery pageQuery = new PageQuery();
pageQuery.setPageNum(1);
pageQuery.setPageSize(10);

// 执行查询
R<PageResult<SysLoginLogVo>> result = loginLogController.pageLoginLogs(loginLogBo, pageQuery);
```

### 2. 获取缓存监控信息
```java
R<CacheMonitorVo> result = cacheController.getCacheInfo();
CacheMonitorVo cacheInfo = result.getData();

// 获取Redis信息
Properties info = cacheInfo.getInfo();
// 获取数据库大小
Long dbSize = cacheInfo.getDbSize();
// 获取命令统计
List<Map<String, String>> commandStats = cacheInfo.getCommandStats();
```

### 3. 强制用户下线
```java
// 获取在线用户
R<PageResult<SysUserOnlineVo>> onlineUsers = userOnlineController.pageOnlineUsers("", "admin");

// 强制下线指定token
String tokenId = "your-token-id";
R<Void> result = userOnlineController.forceLogout(tokenId);
```

## 注意事项

1. **权限控制**：所有监控接口都需要相应的权限验证，确保只有授权用户才能访问敏感信息。

2. **性能考虑**：日志记录采用异步方式，避免影响主业务性能。大量数据查询时建议使用分页和筛选条件。

3. **数据清理**：定期清理历史日志数据，避免数据库存储压力过大。

4. **安全性**：登录日志包含敏感信息（IP地址、用户信息），需要严格控制访问权限。

5. **监控告警**：建议结合监控系统，对异常登录、频繁操作等行为进行告警。
