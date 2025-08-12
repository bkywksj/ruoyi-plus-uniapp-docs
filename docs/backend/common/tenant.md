# 多租户 (tenant) 

## 概述

租户插件模块（`ruoyi-common-tenant`）是一个完整的多租户解决方案，提供了数据库、缓存、认证等多个层面的租户隔离功能。该模块确保不同租户的数据完全隔离，避免数据泄露和混淆。

## 核心特性

- **数据库隔离**：自动为SQL查询添加租户条件
- **缓存隔离**：Redis缓存和Spring Cache支持租户前缀
- **认证隔离**：SaToken认证数据支持租户隔离
- **动态租户**：支持运行时切换租户上下文
- **忽略机制**：支持跳过租户过滤的场景
- **配置灵活**：可配置排除表和开关控制

## 模块结构

```text
ruoyi-common-tenant/
├── config/                 # 配置类
│   └── TenantConfig.java
├── core/                   # 核心组件
│   ├── TenantEntity.java
│   └── TenantSaTokenDao.java
├── exception/              # 异常类
│   └── TenantException.java
├── handle/                 # 处理器
│   ├── PlusTenantLineHandler.java
│   └── TenantKeyPrefixHandler.java
├── helper/                 # 工具类
│   └── TenantHelper.java
├── manager/                # 管理器
│   └── TenantSpringCacheManager.java
└── properties/             # 配置属性
    └── TenantProperties.java
```

## 快速开始

### 1. 添加依赖

在 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-tenant</artifactId>
</dependency>
```

### 2. 配置文件

在 `application.yml` 中添加配置：

```yaml
# 多租户配置
tenant:
  # 是否启用多租户功能
  enable: true
  # 排除表列表（这些表不会应用租户过滤）
  excludes:
    - sys_user
    - sys_role
    - sys_config
```

### 3. 实体类配置

继承 `TenantEntity` 类：

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("your_table")
public class YourEntity extends TenantEntity {
    // 你的字段
    private String name;
    private String description;
}
```

## 核心组件

### TenantHelper

租户助手工具类，提供租户相关的核心操作：

#### 基础功能

```java
// 检查多租户功能是否启用
boolean enabled = TenantHelper.isEnable();

// 获取当前租户ID
String tenantId = TenantHelper.getTenantId();
```

#### 忽略租户模式

在某些场景下需要跳过租户过滤：

```java
// 在忽略模式下执行代码
TenantHelper.ignore(() -> {
    // 这里的数据库操作不会添加租户条件
    userService.getAllUsers();
});

// 带返回值的忽略模式
List<User> allUsers = TenantHelper.ignore(() -> {
    return userService.getAllUsers();
});

// 手动控制忽略模式
TenantHelper.enableIgnore();
try {
    // 业务代码
} finally {
    TenantHelper.disableIgnore();
}
```

#### 动态租户切换

运行时切换到指定租户：

```java
// 临时切换到指定租户执行代码
TenantHelper.dynamic("tenant123", () -> {
    // 这里的操作都在tenant123租户下执行
    dataService.queryData();
});

// 带返回值的动态租户切换
List<Data> data = TenantHelper.dynamic("tenant123", () -> {
    return dataService.queryData();
});

// 手动设置动态租户
TenantHelper.setDynamic("tenant123");
try {
    // 业务代码
} finally {
    TenantHelper.clearDynamic();
}

// 全局设置动态租户（存储到Redis）
TenantHelper.setDynamic("tenant123", true);
```

### TenantEntity

多租户实体基类：

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class TenantEntity extends BaseEntity {
    /**
     * 租户ID - 自动管理，无需手动设置
     */
    private String tenantId;
}
```

### 数据库隔离

#### PlusTenantLineHandler

自动为SQL添加租户条件：

```java
// 原始SQL
SELECT * FROM user WHERE status = 1

// 自动添加租户条件后
SELECT * FROM user WHERE status = 1 AND tenant_id = 'current_tenant_id'
```

#### 排除表配置

某些系统表不需要租户隔离：

```java
// 系统固定排除表（硬编码）
- sys_tenant
- sys_tenant_package  
- sys_gen_table
- sys_gen_table_column
- sys_menu
- sys_role_menu
- sys_role_dept
- sys_user_role
- sys_user_post
- sys_oss_config

// 配置文件排除表
tenant:
  excludes:
    - your_global_table
    - another_global_table
```

### 缓存隔离

#### Redis缓存隔离

```java
// 原始Redis键
user:info:123

// 自动添加租户前缀
tenant123:user:info:123
```

#### Spring Cache隔离

```java
@Cacheable(value = "userCache", key = "#userId")
public User getUser(String userId) {
    // 缓存键自动添加租户前缀
    // 实际缓存键：tenant123:userCache::userId
    return userRepository.findById(userId);
}
```

### 认证隔离

SaToken认证数据自动添加全局前缀，确保不同租户的认证信息隔离。

## 配置说明

### TenantProperties

```java
@ConfigurationProperties(prefix = "tenant")
public class TenantProperties {
    /**
     * 是否启用多租户功能
     */
    private Boolean enable;
    
    /**
     * 多租户排除表列表
     */
    private List<String> excludes;
}
```

### 配置示例

```yaml
tenant:
  # 启用多租户
  enable: true
  # 排除表配置
  excludes:
    - sys_config      # 系统配置表
    - sys_dict_type   # 字典类型表
    - sys_dict_data   # 字典数据表
    - sys_notice      # 通知公告表（如果是全局通知）
```

## 使用场景

### 1. SaaS应用

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    // 查询当前租户的订单 - 自动添加租户条件
    public List<Order> getCurrentTenantOrders() {
        return orderMapper.selectList(null);
    }
    
    // 管理员查看所有租户的订单
    public List<Order> getAllTenantsOrders() {
        return TenantHelper.ignore(() -> {
            return orderMapper.selectList(null);
        });
    }
    
    // 数据迁移：将数据从一个租户转移到另一个租户
    public void migrateData(String fromTenant, String toTenant) {
        List<Order> orders = TenantHelper.dynamic(fromTenant, () -> {
            return orderMapper.selectList(null);
        });
        
        TenantHelper.dynamic(toTenant, () -> {
            orders.forEach(order -> {
                order.setId(null); // 清除ID，插入新记录
                orderMapper.insert(order);
            });
        });
    }
}
```

### 2. 多租户报表

```java
@Service
public class ReportService {
    
    // 生成当前租户报表
    @Cacheable(value = "report", key = "#type")
    public Report generateReport(String type) {
        // 缓存键自动添加租户前缀
        return reportGenerator.generate(type);
    }
    
    // 生成全局报表（所有租户）
    public Report generateGlobalReport(String type) {
        return TenantHelper.ignore(() -> {
            return reportGenerator.generateGlobal(type);
        });
    }
}
```

### 3. 系统管理功能

```java
@Service
public class SystemService {
    
    // 系统配置管理（全局，不受租户影响）
    public void updateSystemConfig(String key, String value) {
        TenantHelper.ignore(() -> {
            configMapper.updateByKey(key, value);
        });
    }
    
    // 租户特定配置
    public void updateTenantConfig(String key, String value) {
        // 自动应用租户条件
        tenantConfigMapper.updateByKey(key, value);
    }
}
```

## 最佳实践

### 1. 数据库设计

```sql
-- 租户表需要包含tenant_id字段
CREATE TABLE user_info (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(20) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    create_time DATETIME,
    INDEX idx_tenant_id (tenant_id)
);

-- 全局表不包含tenant_id字段
CREATE TABLE sys_config (
    id BIGINT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    create_time DATETIME
);
```

### 2. 实体类设计

```java
// 租户相关实体
@TableName("user_info")
public class UserInfo extends TenantEntity {
    private String username;
    private String email;
    // 不需要手动设置tenantId
}

// 全局实体
@TableName("sys_config")
public class SysConfig extends BaseEntity {
    private String configKey;
    private String configValue;
    // 不继承TenantEntity
}
```

### 3. 服务层设计

```java
@Service
public class UserService {
    
    // 常规业务方法 - 自动应用租户过滤
    public List<UserInfo> getUserList() {
        return userMapper.selectList(null);
    }
    
    // 系统管理方法 - 需要忽略租户过滤
    public List<UserInfo> getAllUsersForAdmin() {
        return TenantHelper.ignore(() -> {
            return userMapper.selectList(null);
        });
    }
    
    // 跨租户操作 - 使用动态租户
    public void syncUserData(String sourceTenant, String targetTenant) {
        List<UserInfo> users = TenantHelper.dynamic(sourceTenant, () -> {
            return userMapper.selectList(null);
        });
        
        TenantHelper.dynamic(targetTenant, () -> {
            users.forEach(user -> {
                user.setId(null);
                userMapper.insert(user);
            });
        });
    }
}
```

### 4. 缓存使用

```java
@Service
public class CacheService {
    
    // 租户级缓存
    @Cacheable(value = "userData", key = "#userId")
    public UserData getUserData(String userId) {
        // 缓存键：tenantId:userData::userId
        return userDataMapper.selectById(userId);
    }
    
    // 全局缓存
    @Cacheable(value = "global:systemData", key = "#key")
    public SystemData getSystemData(String key) {
        return TenantHelper.ignore(() -> {
            // 缓存键：global:systemData::key（不添加租户前缀）
            return systemDataMapper.selectByKey(key);
        });
    }
}
```

## 注意事项

### 1. 数据一致性

- 所有租户相关的表都必须包含 `tenant_id` 字段
- 建议为 `tenant_id` 字段创建索引以提高查询性能
- 数据库迁移时要注意租户数据的完整性

### 2. 性能考虑

- 合理使用缓存来减少数据库查询
- 大量数据查询时考虑分页处理
- 监控SQL执行计划，确保租户条件使用了索引

### 3. 安全注意

- 严格控制 `TenantHelper.ignore()` 的使用范围
- 跨租户操作需要有适当的权限控制
- 定期审计租户数据访问日志

### 4. 开发规范

- 新增实体类时明确是否需要继承 `TenantEntity`
- 系统级功能要明确是否需要忽略租户过滤
- 测试时要验证租户隔离的有效性

## 故障排除

### 常见问题

1. **数据查询不到**
    - 检查是否正确设置了租户ID
    - 确认表是否包含 `tenant_id` 字段
    - 验证表是否被错误地加入了排除列表

2. **缓存数据错乱**
    - 检查缓存键是否正确添加了租户前缀
    - 确认全局缓存是否正确使用了 `global:` 前缀

3. **认证异常**
    - 检查SaToken配置是否正确
    - 确认多租户SaTokenDao是否正常工作

### 调试方法

启用SQL日志查看实际执行的SQL：

```yaml
logging:
  level:
    com.baomidou.mybatisplus: DEBUG
```

查看租户ID获取过程：

```java
String tenantId = TenantHelper.getTenantId();
log.info("当前租户ID: {}", tenantId);
```
