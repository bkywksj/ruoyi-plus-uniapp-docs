# 多租户架构

> **RuoYi-Plus-UniApp 全栈框架多租户架构设计方案**
>
> 本文档详细介绍项目的多租户架构设计,包括数据隔离方案、租户管理、权限控制、缓存隔离等多租户特性的完整实现与最佳实践。

---

## 架构概览

### 多租户架构设计

RuoYi-Plus-UniApp采用**共享数据库共享表(Shared Database Shared Table)** 的多租户模式,通过`tenant_id`字段实现数据隔离。

```
┌─────────────────────────────────────────────────────────────────┐
│                      多租户架构设计                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    租户识别层                             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │  域名识别   │  │  请求头识别 │  │  用户识别   │         │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘         │   │
│  │        │                │                │                │   │
│  │        └────────────────┴────────────────┘                │   │
│  │                         │                                  │   │
│  │                    ┌────▼────┐                            │   │
│  │                    │TenantHelper│                         │   │
│  │                    └────┬────┘                            │   │
│  └─────────────────────────┼─────────────────────────────────┘   │
│                             │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐   │
│  │                    数据隔离层                              │   │
│  │           ┌─────────────┼─────────────┐                   │   │
│  │           │             │             │                   │   │
│  │      ┌────▼────┐   ┌────▼────┐   ┌───▼──────┐            │   │
│  │      │  数据库  │   │  Redis  │   │  应用层   │            │   │
│  │      │ tenant_id│   │tenantId:│   │TenantHelper│         │   │
│  │      │  字段过滤 │   │key前缀  │   │ 租户上下文 │            │   │
│  │      └─────────┘   └─────────┘   └──────────┘            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    租户管理层                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │租户创建  │  │套餐管理  │  │数据同步  │  │权限控制  │ │   │
│  │  │租户配置  │  │菜单分配  │  │角色同步  │  │数据隔离  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 核心特性

RuoYi-Plus-UniApp的多租户设计具有以下核心特性:

- **共享数据库共享表** - 通过tenant_id字段隔离数据,成本低扩展性好
- **自动租户过滤** - MyBatis-Plus拦截器自动添加租户条件
- **缓存隔离** - Redis键自动添加租户前缀,实现缓存隔离
- **动态租户切换** - 支持超级管理员动态切换租户身份
- **租户套餐管理** - 灵活的套餐机制控制租户权限
- **域名识别** - 支持通过域名自动识别租户身份
- **数据同步** - 字典、配置、角色等数据自动同步到新租户

参考: `ruoyi-common/ruoyi-common-tenant/src/main/java/plus/ruoyi/common/tenant/helper/TenantHelper.java:1-303`

---

## 多租户模式

### 三种多租户模式对比

| 模式 | 独立数据库 | 独立Schema | 共享表 |
|------|-----------|-----------|--------|
| **隔离级别** | 最高 | 中等 | 最低 |
| **成本** | 最高 | 中等 | 最低 |
| **扩展性** | 最低 | 中等 | 最高 |
| **维护成本** | 最高 | 中等 | 最低 |
| **性能** | 最好 | 中等 | 取决于数据量 |
| **适用场景** | 大客户 | 中型客户 | 小型客户 |

### RuoYi-Plus-UniApp的选择

项目选择**共享数据库共享表**模式,原因如下:

1. **成本优势**: 单个数据库实例,降低运维成本
2. **扩展性强**: 轻松支持数千个租户
3. **维护简单**: 统一的数据库结构,方便升级维护
4. **开发便捷**: 通过ORM拦截器自动处理租户过滤

```
共享数据库共享表模式示意图:

┌───────────────────────────────────────┐
│          MySQL Database               │
├───────────────────────────────────────┤
│                                       │
│  ┌─────────────────────────────────┐ │
│  │        sys_user 表               │ │
│  ├───────┬──────────┬───────┬──────┤ │
│  │user_id│tenant_id │name   │...   │ │
│  ├───────┼──────────┼───────┼──────┤ │
│  │ 1     │ 000000   │张三   │...   │ │ ← 默认租户数据
│  │ 2     │ 123456   │李四   │...   │ │ ← 租户123456数据
│  │ 3     │ 123456   │王五   │...   │ │ ← 租户123456数据
│  │ 4     │ 789012   │赵六   │...   │ │ ← 租户789012数据
│  └───────┴──────────┴───────┴──────┘ │
│                                       │
│  查询时自动添加条件:                   │
│  SELECT * FROM sys_user               │
│  WHERE tenant_id = '123456'           │
│  AND ...其他条件                       │
│                                       │
└───────────────────────────────────────┘
```

---

## 数据隔离

### MyBatis-Plus租户拦截器

**1. 自动租户过滤**

项目使用MyBatis-Plus的`TenantLineHandler`自动为SQL添加租户条件:

```java
package plus.ruoyi.common.tenant.handle;

import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.StringValue;
import plus.ruoyi.common.tenant.helper.TenantHelper;

/**
 * 自定义多租户SQL处理器（始终启用）
 * <p>
 * 始终为SQL添加租户条件，永远不返回NullValue
 * 这样可以避免开关租户功能导致的数据混乱
 *
 * @author Lion Li
 */
@Slf4j
public class PlusTenantLineHandler implements TenantLineHandler {

    /**
     * 系统固定排除表（硬编码，防止用户误配置）
     */
    private static final Set<String> SYSTEM_EXCLUDE_TABLES = Set.of(
        "sys_tenant",              // 租户表本身
        "sys_tenant_package",      // 租户套餐表
        "sys_gen_table",           // 代码生成表
        "sys_gen_table_column",    // 代码生成列表
        "sys_menu",                // 菜单表(所有租户共享)
        "sys_role_menu",           // 角色菜单关联表
        "sys_role_dept",           // 角色部门关联表
        "sys_user_role",           // 用户角色关联表
        "sys_user_post",           // 用户岗位关联表
        "sys_oss_config"           // OSS配置表
    );

    /**
     * 所有排除表的集合（系统表 + 配置表）
     */
    private final Set<String> excludeTables;

    public PlusTenantLineHandler(TenantProperties tenantProperties) {
        // 合并系统排除表和配置排除表
        this.excludeTables = Stream.concat(
                SYSTEM_EXCLUDE_TABLES.stream(),
                tenantProperties.getExcludes() != null ?
                    tenantProperties.getExcludes().stream() : Stream.empty()
            )
            .map(String::toLowerCase)
            .collect(Collectors.toSet());

        log.info("多租户拦截器已启用（始终生效），排除表: {}", excludeTables);
    }

    /**
     * 获取租户ID表达式（始终返回有效值）
     * <p>
     * 无论租户功能是否开启，都返回有效的租户ID
     * 这样可以确保所有数据都有明确的租户归属
     *
     * @return 租户ID的SQL表达式，永远不为null
     */
    @Override
    public Expression getTenantId() {
        // 直接使用TenantHelper.getTenantId()，它已经保证返回有效值
        return new StringValue(TenantHelper.getTenantId());
    }

    /**
     * 判断是否忽略指定表的租户过滤
     *
     * @param tableName 表名
     * @return true：忽略租户过滤，false：应用租户过滤
     */
    @Override
    public boolean ignoreTable(String tableName) {
        if (StringUtils.isBlank(tableName)) {
            return true;
        }

        return excludeTables.contains(tableName.toLowerCase());
    }
}
```

参考: `ruoyi-common/ruoyi-common-tenant/src/main/java/plus/ruoyi/common/tenant/handle/PlusTenantLineHandler.java:1-91`

**2. SQL自动改写示例**

```java
/**
 * 原始SQL:
 * SELECT * FROM sys_user WHERE user_name = '张三'
 *
 * 自动改写后:
 * SELECT * FROM sys_user
 * WHERE tenant_id = '123456' AND user_name = '张三'
 *
 * INSERT语句:
 * INSERT INTO sys_user (user_name, phone)
 * VALUES ('张三', '13800138000')
 *
 * 自动改写后:
 * INSERT INTO sys_user (tenant_id, user_name, phone)
 * VALUES ('123456', '张三', '13800138000')
 *
 * UPDATE语句:
 * UPDATE sys_user SET phone = '13900139000'
 * WHERE user_id = 100
 *
 * 自动改写后:
 * UPDATE sys_user SET phone = '13900139000'
 * WHERE tenant_id = '123456' AND user_id = 100
 *
 * DELETE语句:
 * DELETE FROM sys_user WHERE user_id = 100
 *
 * 自动改写后:
 * DELETE FROM sys_user
 * WHERE tenant_id = '123456' AND user_id = 100
 */
```

**3. 租户字段配置**

```yaml
# application.yml
################## 租户配置 ##################
--- # 租户配置
tenant:
  # 是否开启租户模式
  enable: true
  # 租户字段名称
  column: tenant_id
  # 排除不进行租户隔离的表
  excludes:
    - sys_dict_type
    - sys_dict_data
    - sys_config
    - sys_oss
```

### TenantHelper工具类

**1. 核心方法**

```java
package plus.ruoyi.common.tenant.helper;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.convert.Convert;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import plus.ruoyi.common.core.constant.TenantConstants;
import plus.ruoyi.common.core.utils.SpringUtils;
import plus.ruoyi.common.core.utils.StringUtils;
import plus.ruoyi.common.redis.utils.RedisUtils;
import plus.ruoyi.common.satoken.utils.LoginHelper;

/**
 * 租户助手
 * <p>
 * 提供租户相关的核心功能：
 * - 租户ID获取
 * - 动态租户切换
 * - 租户忽略
 *
 * @author Lion Li
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class TenantHelper {

    /**
     * 租户功能是否开启
     */
    private static final String TENANT_KEY = "tenant";

    /**
     * 动态租户的ThreadLocal变量
     */
    private static final ThreadLocal<String> TEMP_TENANT_ID = new ThreadLocal<>();

    /**
     * 租户忽略标记的ThreadLocal变量
     */
    private static final ThreadLocal<Boolean> IGNORE = new ThreadLocal<>();

    /**
     * 租户是否启用
     */
    public static boolean isEnable() {
        return Convert.toBool(RedisUtils.getCacheObject(TENANT_KEY), false);
    }

    /**
     * 开启租户
     */
    public static void enable() {
        RedisUtils.setCacheObject(TENANT_KEY, true);
    }

    /**
     * 关闭租户
     */
    public static void disable() {
        RedisUtils.setCacheObject(TENANT_KEY, false);
    }

    /**
     * 获取当前租户ID
     * <p>
     * 优先级：动态租户 > 登录用户租户 > 请求头租户
     * 始终保证返回有效的租户ID，最低返回默认租户ID
     *
     * @return 租户ID，永远不为null
     */
    public static String getTenantId() {
        // 如果租户功能未启用，返回默认租户ID
        if (!isEnable()) {
            return TenantConstants.DEFAULT_TENANT_ID;
        }

        // 1. 优先使用动态租户ID
        String tenantId = getDynamic();
        if (StringUtils.isBlank(tenantId)) {
            // 2. 从登录用户中获取租户ID
            tenantId = LoginHelper.getTenantId();
        }

        if (StringUtils.isBlank(tenantId)) {
            // 3. 从请求中获取租户ID(域名或请求头)
            try {
                tenantId = SpringUtils.getBean(TenantService.class)
                    .getTenantIdByRequest();
            } catch (Exception ignored) {
            }
        }

        // 4. 保底返回默认租户ID
        return StringUtils.isNotBlank(tenantId) ?
            tenantId : TenantConstants.DEFAULT_TENANT_ID;
    }

    /**
     * 获取动态租户ID
     *
     * @return 动态租户ID
     */
    public static String getDynamic() {
        return TEMP_TENANT_ID.get();
    }

    /**
     * 设置动态租户ID
     * <p>
     * 用于超级管理员临时切换租户身份
     *
     * @param tenantId 租户ID
     */
    public static void setDynamic(String tenantId) {
        TEMP_TENANT_ID.set(tenantId);
        log.debug("设置动态租户ID: {}", tenantId);
    }

    /**
     * 清除动态租户ID
     */
    public static void clearDynamic() {
        TEMP_TENANT_ID.remove();
        log.debug("清除动态租户ID");
    }

    /**
     * 在指定租户下执行操作
     * <p>
     * 临时切换到指定租户，执行完成后恢复原租户
     *
     * @param tenantId 租户ID
     * @param handle   执行逻辑
     */
    public static void dynamic(String tenantId, Runnable handle) {
        String originalTenantId = getDynamic();
        try {
            setDynamic(tenantId);
            handle.run();
        } finally {
            // 恢复原租户ID
            if (StringUtils.isBlank(originalTenantId)) {
                clearDynamic();
            } else {
                setDynamic(originalTenantId);
            }
        }
    }

    /**
     * 启用租户忽略
     * <p>
     * 忽略租户过滤，查询所有租户的数据
     */
    public static void enableIgnore() {
        IGNORE.set(true);
    }

    /**
     * 禁用租户忽略
     */
    public static void disableIgnore() {
        IGNORE.remove();
    }

    /**
     * 判断是否忽略租户
     *
     * @return true：忽略租户过滤，false：不忽略
     */
    public static boolean isIgnore() {
        return Convert.toBool(IGNORE.get(), false);
    }

    /**
     * 忽略租户执行操作
     * <p>
     * 在操作中忽略租户过滤，可以查询所有租户的数据
     *
     * @param handle 执行逻辑
     */
    public static void ignore(Runnable handle) {
        enableIgnore();
        try {
            handle.run();
        } finally {
            disableIgnore();
        }
    }

    /**
     * 忽略租户执行操作（有返回值）
     *
     * @param handle 执行逻辑
     * @param <T>    返回值类型
     * @return 执行结果
     */
    public static <T> T ignore(Supplier<T> handle) {
        enableIgnore();
        try {
            return handle.get();
        } finally {
            disableIgnore();
        }
    }
}
```

参考: `ruoyi-common/ruoyi-common-tenant/src/main/java/plus/ruoyi/common/tenant/helper/TenantHelper.java:1-303`

**2. 使用示例**

```java
/**
 * 基本用法示例
 */
@Service
public class UserService {

    /**
     * 查询用户
     * 自动添加租户条件
     */
    public List<User> listUsers() {
        // SQL: SELECT * FROM sys_user WHERE tenant_id = '当前租户ID'
        return userMapper.selectList(null);
    }

    /**
     * 查询所有租户的用户
     * 忽略租户过滤
     */
    public List<User> listAllTenantUsers() {
        return TenantHelper.ignore(() -> {
            // SQL: SELECT * FROM sys_user (不添加tenant_id条件)
            return userMapper.selectList(null);
        });
    }

    /**
     * 切换到指定租户查询
     * 动态租户切换
     */
    public List<User> listUsersByTenantId(String tenantId) {
        return TenantHelper.dynamic(tenantId, () -> {
            // SQL: SELECT * FROM sys_user WHERE tenant_id = '指定的租户ID'
            return userMapper.selectList(null);
        });
    }
}
```

---

## 缓存隔离

### Redis键前缀处理

**1. TenantKeyPrefixHandler**

项目通过Redis键前缀实现缓存隔离:

```java
package plus.ruoyi.common.tenant.handle;

import plus.ruoyi.common.redis.handler.KeyPrefixHandler;
import plus.ruoyi.common.tenant.helper.TenantHelper;

/**
 * 多租户Redis键前缀处理器
 * <p>
 * 为Redis键添加租户前缀，实现Redis数据的租户隔离
 *
 * @author Lion Li
 */
@Slf4j
public class TenantKeyPrefixHandler extends KeyPrefixHandler {

    public TenantKeyPrefixHandler(String keyPrefix) {
        super(keyPrefix);
    }

    /**
     * 为Redis键添加租户前缀
     *
     * @param name 原始键名
     * @return 添加租户前缀后的键名
     */
    @Override
    public String map(String name) {
        if (StringUtils.isBlank(name)) {
            return null;
        }

        try {
            // 检查是否忽略租户处理
            if (InterceptorIgnoreHelper.willIgnoreTenantLine("")) {
                return super.map(name);
            }
        } catch (NoClassDefFoundError ignore) {
            // 某些服务不需要MyBatis-Plus，忽略类找不到的错误
        }

        // 全局键不需要租户前缀
        if (StringUtils.contains(name, GlobalConstants.GLOBAL_REDIS_KEY)) {
            return super.map(name);
        }

        // 获取租户ID（永远不为null）
        String tenantId = TenantHelper.getTenantId();
        log.debug("Redis键添加租户前缀: {} -> {}:{}", name, tenantId, name);

        // 如果已经包含租户前缀，直接返回
        if (StringUtils.startsWith(name, tenantId + StringUtils.EMPTY)) {
            return super.map(name);
        }

        // 添加租户前缀
        return super.map(tenantId + ":" + name);
    }

    /**
     * 从Redis键中移除租户前缀
     *
     * @param name 包含前缀的键名
     * @return 移除租户前缀后的键名
     */
    @Override
    public String unmap(String name) {
        String unmap = super.unmap(name);
        if (StringUtils.isBlank(unmap)) {
            return null;
        }

        try {
            // 检查是否忽略租户处理
            if (InterceptorIgnoreHelper.willIgnoreTenantLine("")) {
                return unmap;
            }
        } catch (NoClassDefFoundError ignore) {
        }

        // 全局键不处理租户前缀
        if (StringUtils.contains(name, GlobalConstants.GLOBAL_REDIS_KEY)) {
            return unmap;
        }

        // 获取租户ID
        String tenantId = TenantHelper.getTenantId();

        // 移除租户前缀
        if (StringUtils.startsWith(unmap, tenantId + StringUtils.EMPTY)) {
            return unmap.substring((tenantId + ":").length());
        }

        return unmap;
    }
}
```

参考: `ruoyi-common/ruoyi-common-tenant/src/main/java/plus/ruoyi/common/tenant/handle/TenantKeyPrefixHandler.java:1-102`

**2. Redis键隔离示例**

```java
/**
 * Redis键自动添加租户前缀
 */
@Service
public class CacheService {

    /**
     * 缓存用户信息
     * 键自动添加租户前缀
     */
    public void cacheUser(User user) {
        // 实际存储的键: 123456:user:100 (租户ID:原始键)
        RedisUtils.setCacheObject("user:" + user.getUserId(), user);
    }

    /**
     * 获取用户信息
     * 键自动添加租户前缀
     */
    public User getUser(Long userId) {
        // 实际查询的键: 123456:user:100
        return RedisUtils.getCacheObject("user:" + userId);
    }

    /**
     * 全局缓存(所有租户共享)
     * 使用GLOBAL标记
     */
    public void cacheGlobalConfig(String key, Object value) {
        // 实际存储的键: global:config:xxx (不添加租户前缀)
        RedisUtils.setCacheObject(
            GlobalConstants.GLOBAL_REDIS_KEY + key,
            value
        );
    }
}
```

**3. 缓存隔离示意图**

```
Redis存储结构:

┌────────────────────────────────────┐
│          Redis Database            │
├────────────────────────────────────┤
│                                    │
│  租户123456的数据:                  │
│  123456:user:1 -> {user data}     │
│  123456:user:2 -> {user data}     │
│  123456:config:xxx -> {config}    │
│                                    │
│  租户789012的数据:                  │
│  789012:user:1 -> {user data}     │
│  789012:user:2 -> {user data}     │
│  789012:config:xxx -> {config}    │
│                                    │
│  全局数据(所有租户共享):             │
│  global:dict:xxx -> {dict data}   │
│  global:config:yyy -> {config}    │
│                                    │
└────────────────────────────────────┘
```

---

## 租户管理

### 租户实体

**1. SysTenant实体**

```java
package plus.ruoyi.system.tenant.domain;

/**
 * 租户对象 sys_tenant
 *
 * @author Michelle.Chung
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_tenant")
public class SysTenant extends BaseEntity {

    /**
     * id
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 租户id(6位随机数字)
     */
    private String tenantId;

    /**
     * 联系人
     */
    private String contactUserName;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 企业名称
     */
    private String companyName;

    /**
     * 统一社会信用代码
     */
    private String licenseNumber;

    /**
     * 地址
     */
    private String address;

    /**
     * 域名(用于域名识别租户)
     */
    private String domain;

    /**
     * 企业简介
     */
    private String intro;

    /**
     * 备注
     */
    private String remark;

    /**
     * 租户套餐编号
     */
    private Long packageId;

    /**
     * 过期时间
     */
    private Date expireTime;

    /**
     * 用户数量（-1不限制）
     */
    private Long accountCount;

    /**
     * 租户状态
     */
    private String status;

    /**
     * 是否删除
     */
    @TableLogic
    private String isDeleted;
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/domain/SysTenant.java:1-104`

### 租户创建

**1. 创建租户流程**

```java
/**
 * 新增租户
 * <p>
 * 自动完成以下操作:
 * 1. 生成随机租户ID(6位数字)
 * 2. 创建租户管理员角色
 * 3. 创建租户部门
 * 4. 创建租户管理员用户
 * 5. 复制默认租户的字典和配置到新租户
 * 6. 同步默认租户的普通业务角色到新租户
 *
 * @param bo 租户业务对象
 * @return 是否成功
 */
@Override
@Transactional(rollbackFor = Exception.class)
public boolean insertTenant(SysTenantBo bo) {
    SysTenant add = MapstructUtils.convert(bo, SysTenant.class);

    // 1. 生成租户ID
    List<String> tenantIds = tenantDao.listAllTenantIds();
    String tenantId = generateTenantId(tenantIds);
    add.setTenantId(tenantId);

    // 2. 处理域名
    add.setDomain(StringUtils.contains(add.getDomain(), "//") ?
        StringUtils.splitToList(add.getDomain(), "//").get(1) : add.getDomain());

    // 3. 保存租户信息
    boolean flag = tenantDao.insert(add);
    if (!flag) {
        throw ServiceException.of("创建租户失败");
    }

    // 4. 根据套餐创建角色
    Long roleId = createTenantRole(tenantId, bo.getPackageId());

    // 5. 同步默认租户的普通业务角色到新租户
    syncDefaultRolesToNewTenant(tenantId, bo.getPackageId());

    // 6. 创建部门: 公司名是部门名称
    SysDept dept = new SysDept();
    dept.setTenantId(tenantId);
    dept.setDeptName(bo.getCompanyName());
    dept.setParentId(Constants.TOP_PARENT_ID);
    dept.setAncestors(Constants.TOP_PARENT_ID.toString());
    deptDao.insert(dept);
    Long deptId = dept.getDeptId();

    // 7. 角色和部门关联
    SysRoleDept roleDept = new SysRoleDept();
    roleDept.setRoleId(roleId);
    roleDept.setDeptId(deptId);
    roleDeptDao.insert(roleDept);

    // 8. 创建系统用户(租户管理员)
    SysUser user = new SysUser();
    user.setTenantId(tenantId);
    user.setUserName(bo.getUserName());
    user.setNickName(bo.getUserName());
    user.setPassword(BCrypt.hashpw(bo.getPassword()));
    user.setDeptId(deptId);
    user.setUserType(UserType.PC_USER.getUserType());
    userDao.insert(user);

    // 9. 设置部门负责人
    SysDept sd = new SysDept();
    sd.setLeader(user.getUserId());
    sd.setDeptId(deptId);
    deptDao.updateById(sd);

    // 10. 用户和角色关联
    SysUserRole userRole = new SysUserRole();
    userRole.setUserId(user.getUserId());
    userRole.setRoleId(roleId);
    userRoleDao.insert(userRole);

    // 11. 从默认租户复制字典和配置数据到新租户
    String defaultTenantId = TenantConstants.DEFAULT_TENANT_ID;

    List<SysDictType> dictTypeList = dictTypeDao.listByTenantId(defaultTenantId);
    List<SysDictData> dictDataList = dictDataDao.listByTenantId(defaultTenantId);
    List<SysConfig> sysConfigList = configDao.listByTenantId(defaultTenantId);

    // 12. 修改租户ID并清空审计字段
    for (SysDictType dictType : dictTypeList) {
        dictType.setDictId(null);
        dictType.setTenantId(tenantId);
        dictType.setCreateDept(null);
        dictType.setCreateBy(null);
        dictType.setCreateTime(null);
        dictType.setUpdateBy(null);
        dictType.setUpdateTime(null);
    }

    for (SysDictData dictData : dictDataList) {
        dictData.setDictDataId(null);
        dictData.setTenantId(tenantId);
        dictData.setCreateDept(null);
        dictData.setCreateBy(null);
        dictData.setCreateTime(null);
        dictData.setUpdateBy(null);
        dictData.setUpdateTime(null);
    }

    for (SysConfig config : sysConfigList) {
        config.setConfigId(null);
        config.setTenantId(tenantId);
        config.setCreateDept(null);
        config.setCreateBy(null);
        config.setCreateTime(null);
        config.setUpdateBy(null);
        config.setUpdateTime(null);
    }

    // 13. 批量插入到新租户
    dictTypeDao.batchInsert(dictTypeList);
    dictDataDao.batchInsert(dictDataList);
    configDao.batchInsert(sysConfigList);

    return true;
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/service/impl/SysTenantServiceImpl.java:220-322`

**2. 租户ID生成**

```java
/**
 * 生成租户id
 * <p>
 * 生成6位随机数字作为租户ID
 * 如果重复则重新生成
 *
 * @param tenantIds 已有租户id列表
 * @return 租户id
 */
private String generateTenantId(List<String> tenantIds) {
    // 随机生成6位数字
    String numbers = RandomUtil.randomNumbers(6);

    // 判断是否存在，如果存在则重新生成
    if (tenantIds.contains(numbers)) {
        return generateTenantId(tenantIds);
    }

    return numbers;
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/service/impl/SysTenantServiceImpl.java:330-338`

### 租户校验

**1. 租户状态校验**

```java
/**
 * 校验租户
 * <p>
 * 验证租户是否存在、是否启用、是否过期
 *
 * @param tenantId 租户ID
 * @throws TenantException 如果租户校验失败
 */
public void checkTenant(String tenantId) {
    // 如果租户功能未启用，直接返回
    if (!TenantHelper.isEnable()) {
        return;
    }

    // 验证租户ID不能为空
    if (StringUtils.isBlank(tenantId)) {
        throw new TenantException(I18nKeys.Tenant.ID_REQUIRED);
    }

    // 默认租户不需要校验
    if (TenantConstants.DEFAULT_TENANT_ID.equals(tenantId)) {
        return;
    }

    // 查询租户信息
    SysTenantVo tenant = tenantService.getTenantByTenantId(tenantId);

    // 租户不存在
    if (ObjectUtil.isNull(tenant)) {
        log.info("登录租户：{} 不存在.", tenantId);
        throw new TenantException(I18nKeys.Tenant.NOT_EXISTS);
    }
    // 租户被停用
    else if (DictEnableStatus.DISABLED.getValue().equals(tenant.getStatus())) {
        log.info("登录租户：{} 已被停用.", tenantId);
        throw new TenantException(I18nKeys.Tenant.DISABLED);
    }
    // 租户已过期
    else if (ObjectUtil.isNotNull(tenant.getExpireTime())
        && new Date().after(tenant.getExpireTime())) {
        log.info("登录租户：{} 已超过有效期.", tenantId);
        throw new TenantException(I18nKeys.Tenant.EXPIRED);
    }
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/auth/service/SysLoginService.java:280-313`

**2. 账户余额校验**

```java
/**
 * 校验账号余额
 * <p>
 * 检查租户是否还有可用的用户账号名额
 *
 * @param tenantId 租户ID
 * @return true: 有余额, false: 无余额
 */
@Override
public boolean checkAccountBalance(String tenantId) {
    SysTenantVo tenant = SpringUtils.getAopProxy(this)
        .getTenantByTenantId(tenantId);

    // 如果余额为-1代表不限制
    if (tenant.getAccountCount() == -1) {
        return true;
    }

    // 查询当前租户的用户数量
    Long userNumber = userDao.count(null);

    // 如果余额大于0代表还有可用名额
    return tenant.getAccountCount() - userNumber > 0;
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/service/impl/SysTenantServiceImpl.java:507-520`

---

## 租户套餐

### 套餐管理

**1. 套餐实体**

```java
/**
 * 租户套餐
 * <p>
 * 控制租户可以使用的菜单权限
 */
@Data
@TableName("sys_tenant_package")
public class SysTenantPackage {

    /**
     * 租户套餐id
     */
    @TableId
    private Long packageId;

    /**
     * 套餐名称
     */
    private String packageName;

    /**
     * 关联的菜单id(逗号分隔)
     */
    private String menuIds;

    /**
     * 备注
     */
    private String remark;

    /**
     * 状态（0正常 1停用）
     */
    private String status;
}
```

**2. 创建租户角色**

```java
/**
 * 根据租户套餐创建租户管理员角色
 * <p>
 * 套餐中配置的菜单权限会分配给租户管理员角色
 *
 * @param tenantId  租户id
 * @param packageId 租户套餐id
 * @return 角色id
 */
private Long createTenantRole(String tenantId, Long packageId) {
    // 1. 获取租户套餐
    SysTenantPackage tenantPackage = tenantPackageDao.getById(packageId);
    if (ObjectUtil.isNull(tenantPackage)) {
        throw ServiceException.of("套餐不存在");
    }

    // 2. 获取套餐菜单id
    List<Long> menuIds = StringUtils.splitToList(
        tenantPackage.getMenuIds(),
        Convert::toLong
    );

    // 3. 创建租户管理员角色
    SysRole role = new SysRole();
    role.setTenantId(tenantId);
    role.setRoleName(TenantConstants.TENANT_ADMIN_ROLE_NAME);
    role.setRoleKey(TenantConstants.TENANT_ADMIN_ROLE_KEY);
    role.setRoleSort(1);
    role.setStatus(DictEnableStatus.ENABLE.getValue());
    roleDao.insert(role);
    Long roleId = role.getRoleId();

    // 4. 创建角色菜单关联
    List<SysRoleMenu> roleMenus = new ArrayList<>(menuIds.size());
    menuIds.forEach(menuId -> {
        SysRoleMenu roleMenu = new SysRoleMenu();
        roleMenu.setRoleId(roleId);
        roleMenu.setMenuId(menuId);
        roleMenus.add(roleMenu);
    });
    roleMenuDao.batchInsert(roleMenus);

    return roleId;
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/service/impl/SysTenantServiceImpl.java:347-377`

**3. 同步租户套餐**

```java
/**
 * 同步租户套餐
 * <p>
 * 当租户套餐更新后，同步套餐权限到租户角色
 *
 * @param tenantId  租户ID
 * @param packageId 套餐ID
 * @return 是否成功
 */
@Override
@Transactional(rollbackFor = Exception.class)
public boolean syncTenantPackage(String tenantId, Long packageId) {
    // 1. 获取租户套餐
    SysTenantPackage tenantPackage = tenantPackageDao.getById(packageId);
    List<Long> menuIds = StringUtils.splitToList(
        tenantPackage.getMenuIds(),
        Convert::toLong
    );

    // 2. 查询租户所有角色
    List<SysRole> roles = roleDao.listByTenantId(tenantId);
    List<Long> roleIds = new ArrayList<>(roles.size() - 1);

    // 3. 更新租户管理员角色的菜单权限
    roles.forEach(item -> {
        if (TenantConstants.TENANT_ADMIN_ROLE_KEY.equals(item.getRoleKey())) {
            // 租户管理员角色: 完全同步套餐菜单权限
            List<SysRoleMenu> roleMenus = new ArrayList<>(menuIds.size());
            menuIds.forEach(menuId -> {
                SysRoleMenu roleMenu = new SysRoleMenu();
                roleMenu.setRoleId(item.getRoleId());
                roleMenu.setMenuId(menuId);
                roleMenus.add(roleMenu);
            });

            // 删除旧的角色菜单关联
            roleMenuDao.deleteByRoleId(item.getRoleId());
            // 插入新的角色菜单关联
            roleMenuDao.batchInsert(roleMenus);
        } else {
            // 普通角色: 记录角色ID
            roleIds.add(item.getRoleId());
        }
    });

    // 4. 删除普通角色中超出套餐范围的菜单权限
    if (!roleIds.isEmpty() && !menuIds.isEmpty()) {
        roleMenuDao.deleteByRoleIdsExcludeMenuIds(roleIds, menuIds);
    }

    return true;
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/service/impl/SysTenantServiceImpl.java:539-565`

---

## 动态租户

### 超级管理员切换租户

**1. 动态租户切换**

```java
/**
 * 超级管理员查看其他租户数据
 */
@Service
public class AdminService {

    /**
     * 超级管理员查看指定租户的用户
     * <p>
     * 使用动态租户切换
     *
     * @param tenantId 租户ID
     * @return 用户列表
     */
    public List<User> listUsersByTenant(String tenantId) {
        // 临时切换到指定租户
        return TenantHelper.dynamic(tenantId, () -> {
            // 在这个代码块中，所有数据库操作和缓存操作
            // 都会使用指定的租户ID
            return userMapper.selectList(null);
        });
    }

    /**
     * 超级管理员统计所有租户数据
     * <p>
     * 忽略租户过滤
     *
     * @return 统计结果
     */
    public Map<String, Long> statisticsAllTenants() {
        return TenantHelper.ignore(() -> {
            // 查询所有租户的数据
            List<User> allUsers = userMapper.selectList(null);

            // 按租户ID分组统计
            return allUsers.stream()
                .collect(Collectors.groupingBy(
                    User::getTenantId,
                    Collectors.counting()
                ));
        });
    }
}
```

**2. 动态租户实现原理**

```java
/**
 * TenantHelper动态租户实现
 */
public class TenantHelper {

    /**
     * 动态租户的ThreadLocal变量
     */
    private static final ThreadLocal<String> TEMP_TENANT_ID = new ThreadLocal<>();

    /**
     * 获取当前租户ID
     * <p>
     * 优先级: 动态租户 > 登录用户租户 > 请求头租户
     */
    public static String getTenantId() {
        if (!isEnable()) {
            return TenantConstants.DEFAULT_TENANT_ID;
        }

        // 1. 优先使用动态租户ID
        String tenantId = getDynamic();
        if (StringUtils.isBlank(tenantId)) {
            // 2. 从登录用户中获取租户ID
            tenantId = LoginHelper.getTenantId();
        }

        if (StringUtils.isBlank(tenantId)) {
            // 3. 从请求中获取租户ID
            try {
                tenantId = SpringUtils.getBean(TenantService.class)
                    .getTenantIdByRequest();
            } catch (Exception ignored) {
            }
        }

        // 4. 保底返回默认租户ID
        return StringUtils.isNotBlank(tenantId) ?
            tenantId : TenantConstants.DEFAULT_TENANT_ID;
    }

    /**
     * 在指定租户下执行操作
     *
     * @param tenantId 租户ID
     * @param handle   执行逻辑
     */
    public static void dynamic(String tenantId, Runnable handle) {
        String originalTenantId = getDynamic();
        try {
            // 设置动态租户ID
            setDynamic(tenantId);
            handle.run();
        } finally {
            // 恢复原租户ID
            if (StringUtils.isBlank(originalTenantId)) {
                clearDynamic();
            } else {
                setDynamic(originalTenantId);
            }
        }
    }
}
```

---

## 租户识别

### 多种识别方式

**1. 域名识别**

```java
/**
 * 根据域名获取租户ID
 * <p>
 * 支持通过域名自动识别租户身份
 * 例如: tenant1.example.com -> 租户ID: 123456
 *
 * @param domain 域名
 * @return 匹配的租户ID，如果没有匹配则返回null
 */
@Cacheable(cacheNames = CacheNames.SYS_TENANT, key = "'domain:' + #domain")
public String getTenantIdByDomain(String domain) {
    if (StringUtils.isBlank(domain)) {
        return null;
    }

    // 根据域名和状态查询租户信息
    SysTenant tenant = tenantDao.getByDomainAndStatus(
        domain,
        DictEnableStatus.ENABLE.getValue(),
        false
    );

    if (ObjectUtil.isNotNull(tenant)) {
        return tenant.getTenantId();
    }

    return null;
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/service/impl/SysTenantServiceImpl.java:955-966`

**2. 请求头识别**

```java
/**
 * 根据请求获取租户ID
 * <p>
 * 专门处理从请求中提取租户信息的逻辑：域名识别 + 请求头获取
 *
 * @return 租户ID，如果获取不到返回null
 */
@Override
public String getTenantIdByRequest() {
    // 获取当前请求对象
    HttpServletRequest request = ServletUtils.getRequest();
    if (!TenantHelper.isEnable() || request == null) {
        return null;
    }

    // 1. 优先通过域名识别租户
    String host = extractHostFromRequest(request);
    String tenantId = SpringUtils.getAopProxy(this).getTenantIdByDomain(host);

    if (StringUtils.isNotBlank(tenantId)) {
        return tenantId;
    }

    // 2. 从请求头 X-Tenant-Id 获取
    try {
        tenantId = request.getHeader("X-Tenant-Id");
        if (StringUtils.isNotBlank(tenantId)) {
            return tenantId;
        }
    } catch (Exception ignored) {
    }

    return null;
}

/**
 * 从请求中提取域名
 *
 * @param request HTTP请求对象
 * @return 域名
 */
private String extractHostFromRequest(HttpServletRequest request) {
    try {
        String referer = request.getHeader("referer");
        if (StringUtils.isNotBlank(referer)) {
            // 从referer中取值，方便本地环境使用hosts添加虚拟域名调试
            return referer.split("//")[1].split("/")[0];
        } else {
            // 从请求URL中提取域名
            return URI.create(request.getRequestURL().toString()).getHost();
        }
    } catch (Exception e) {
        return null;
    }
}
```

参考: `ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/tenant/service/impl/SysTenantServiceImpl.java:922-987`

**3. 用户登录识别**

```java
/**
 * 用户登录时获取租户ID
 */
public class LoginService {

    /**
     * 登录
     * <p>
     * 登录成功后，租户ID存储在Token中
     *
     * @param username 用户名
     * @param password 密码
     * @return 登录结果
     */
    public LoginVo login(String username, String password) {
        // 1. 获取租户ID(从请求中)
        String tenantId = tenantService.getTenantIdByRequest();

        // 2. 校验租户
        sysLoginService.checkTenant(tenantId);

        // 3. 查询用户(自动添加租户条件)
        SysUser user = userMapper.selectUserByUserName(username);

        // 4. 校验密码
        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new ServiceException("密码错误");
        }

        // 5. 创建登录用户对象(包含租户ID)
        LoginUser loginUser = createLoginUser(user);
        loginUser.setTenantId(tenantId);

        // 6. 生成Token(租户ID存储在Token中)
        LoginHelper.loginByDevice(loginUser, DeviceType.PC);

        // 7. 返回登录信息
        LoginVo loginVo = new LoginVo();
        loginVo.setAccessToken(StpUtil.getTokenValue());
        loginVo.setTenantId(tenantId);
        return loginVo;
    }
}
```

### 租户识别优先级

```
租户ID获取优先级:

1. 动态租户 (TenantHelper.setDynamic)
   ↓ (最高优先级)
   用于超级管理员临时切换租户身份

2. 登录用户租户 (LoginHelper.getTenantId)
   ↓
   从Token中获取登录用户的租户ID

3. 请求头租户 (X-Tenant-Id)
   ↓
   从HTTP请求头中获取租户ID

4. 域名识别 (request.getServerName())
   ↓
   通过访问域名识别租户

5. 默认租户 (TenantConstants.DEFAULT_TENANT_ID)
   ↓ (最低优先级)
   保底返回默认租户ID: 000000
```

---

## 最佳实践

### 1. 数据隔离原则

```java
// ✅ 推荐: 让框架自动处理租户过滤
@Service
public class UserService {
    public List<User> listUsers() {
        // 自动添加租户条件
        return userMapper.selectList(null);
    }
}

// ❌ 不推荐: 手动添加租户条件
@Service
public class UserService {
    public List<User> listUsers() {
        // 不要手动添加租户条件
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getTenantId, TenantHelper.getTenantId());
        return userMapper.selectList(wrapper);
    }
}
```

### 2. 租户忽略使用

```java
// ✅ 推荐: 使用TenantHelper.ignore
@Service
public class StatisticsService {
    public Map<String, Long> statisticsAllTenants() {
        return TenantHelper.ignore(() -> {
            // 查询所有租户数据
            List<User> allUsers = userMapper.selectList(null);
            return groupByTenant(allUsers);
        });
    }
}

// ❌ 不推荐: 使用@InterceptorIgnore注解
@Service
public class StatisticsService {
    @InterceptorIgnore(tenantLine = "true")  // 不推荐
    public List<User> listAllUsers() {
        return userMapper.selectList(null);
    }
}
```

### 3. 动态租户使用

```java
// ✅ 推荐: 使用TenantHelper.dynamic
@Service
public class AdminService {
    public User getUserFromTenant(String tenantId, Long userId) {
        return TenantHelper.dynamic(tenantId, () -> {
            return userMapper.selectById(userId);
        });
    }
}

// ❌ 不推荐: 手动设置和清除
@Service
public class AdminService {
    public User getUserFromTenant(String tenantId, Long userId) {
        try {
            TenantHelper.setDynamic(tenantId);
            return userMapper.selectById(userId);
        } finally {
            TenantHelper.clearDynamic();  // 容易忘记清除
        }
    }
}
```

### 4. 缓存隔离使用

```java
// ✅ 推荐: 让框架自动添加租户前缀
@Service
public class CacheService {
    public void cacheUser(User user) {
        // 自动添加租户前缀: 123456:user:100
        RedisUtils.setCacheObject("user:" + user.getUserId(), user);
    }
}

// ❌ 不推荐: 手动添加租户前缀
@Service
public class CacheService {
    public void cacheUser(User user) {
        // 不要手动添加租户前缀
        String key = TenantHelper.getTenantId() + ":user:" + user.getUserId();
        RedisUtils.setCacheObject(key, user);
    }
}
```

---

## 常见问题

### 1. 新租户没有数据怎么办?

**问题**: 创建新租户后,租户没有字典、配置等基础数据

**原因**: 新租户创建时未同步默认租户的数据

**解决方案**:

```java
/**
 * 方案1: 创建租户时自动同步(推荐)
 * 已在insertTenant方法中实现
 */
@Override
@Transactional(rollbackFor = Exception.class)
public boolean insertTenant(SysTenantBo bo) {
    // ... 创建租户逻辑

    // 从默认租户复制字典和配置数据到新租户
    String defaultTenantId = TenantConstants.DEFAULT_TENANT_ID;

    List<SysDictType> dictTypeList = dictTypeDao.listByTenantId(defaultTenantId);
    List<SysDictData> dictDataList = dictDataDao.listByTenantId(defaultTenantId);
    List<SysConfig> sysConfigList = configDao.listByTenantId(defaultTenantId);

    // 批量插入到新租户
    dictTypeDao.batchInsert(dictTypeList);
    dictDataDao.batchInsert(dictDataList);
    configDao.batchInsert(sysConfigList);

    return true;
}

/**
 * 方案2: 手动同步已有租户
 * 调用同步接口
 */
@RestController
@RequestMapping("/system/tenant")
public class SysTenantController {

    /**
     * 同步租户字典
     */
    @PostMapping("/syncDict")
    public R<Void> syncDict() {
        tenantService.syncTenantDicts();
        return R.ok();
    }

    /**
     * 同步租户配置
     */
    @PostMapping("/syncConfig")
    public R<Void> syncConfig() {
        tenantService.syncTenantConfigs();
        return R.ok();
    }
}
```

### 2. 如何查询所有租户的数据?

**问题**: 需要统计所有租户的数据

**解决方案**:

```java
/**
 * 使用TenantHelper.ignore忽略租户过滤
 */
@Service
public class StatisticsService {

    /**
     * 统计所有租户的用户数量
     */
    public Map<String, Long> statisticsAllUsers() {
        return TenantHelper.ignore(() -> {
            // 查询所有租户的用户
            List<User> allUsers = userMapper.selectList(null);

            // 按租户分组统计
            return allUsers.stream()
                .collect(Collectors.groupingBy(
                    User::getTenantId,
                    Collectors.counting()
                ));
        });
    }

    /**
     * 查询所有租户信息
     */
    public List<SysTenant> listAllTenants() {
        // 租户表本身不需要租户过滤
        return tenantMapper.selectList(null);
    }
}
```

### 3. 租户表结构如何设计?

**问题**: 哪些表需要租户字段,哪些不需要?

**原则**:

1. **需要租户字段的表**:
   - 业务数据表(用户、部门、角色、订单等)
   - 租户私有的配置表(字典数据、参数配置等)

2. **不需要租户字段的表**:
   - 租户管理表(租户表、套餐表)
   - 共享配置表(菜单表)
   - 关联表(角色菜单关联、用户角色关联等)
   - 代码生成表

**示例**:

```sql
-- ✅ 需要tenant_id字段
CREATE TABLE sys_user (
    user_id bigint PRIMARY KEY,
    tenant_id varchar(20) NOT NULL,  -- 租户ID
    user_name varchar(30),
    ...
    INDEX idx_tenant_id (tenant_id)  -- 建议添加索引
);

-- ✅ 需要tenant_id字段
CREATE TABLE sys_dept (
    dept_id bigint PRIMARY KEY,
    tenant_id varchar(20) NOT NULL,
    dept_name varchar(30),
    ...
    INDEX idx_tenant_id (tenant_id)
);

-- ❌ 不需要tenant_id字段
CREATE TABLE sys_menu (
    menu_id bigint PRIMARY KEY,
    menu_name varchar(50),
    ...
    -- 所有租户共享菜单
);

-- ❌ 不需要tenant_id字段
CREATE TABLE sys_tenant (
    id bigint PRIMARY KEY,
    tenant_id varchar(20) UNIQUE,
    company_name varchar(50),
    ...
    -- 租户表本身不需要租户字段
);
```

### 4. 租户数据如何备份?

**问题**: 需要备份单个租户的数据

**解决方案**:

```java
/**
 * 导出租户数据
 */
@Service
public class TenantBackupService {

    /**
     * 导出指定租户的所有数据
     *
     * @param tenantId 租户ID
     * @return 备份文件路径
     */
    @Transactional(readOnly = true)
    public String exportTenantData(String tenantId) {
        return TenantHelper.dynamic(tenantId, () -> {
            // 1. 导出用户数据
            List<User> users = userMapper.selectList(null);

            // 2. 导出部门数据
            List<Dept> depts = deptMapper.selectList(null);

            // 3. 导出角色数据
            List<Role> roles = roleMapper.selectList(null);

            // 4. 导出其他业务数据
            // ...

            // 5. 生成备份文件
            String backupFile = generateBackupFile(tenantId, users, depts, roles);

            return backupFile;
        });
    }

    /**
     * 导入租户数据
     *
     * @param tenantId    租户ID
     * @param backupFile  备份文件
     */
    @Transactional(rollbackFor = Exception.class)
    public void importTenantData(String tenantId, String backupFile) {
        TenantHelper.dynamic(tenantId, () -> {
            // 1. 解析备份文件
            TenantBackupData data = parseBackupFile(backupFile);

            // 2. 导入用户数据
            userMapper.batchInsert(data.getUsers());

            // 3. 导入部门数据
            deptMapper.batchInsert(data.getDepts());

            // 4. 导入角色数据
            roleMapper.batchInsert(data.getRoles());

            // 5. 导入其他业务数据
            // ...
        });
    }
}
```

### 5. 如何处理租户间的数据迁移?

**问题**: 需要将一个租户的数据迁移到另一个租户

**解决方案**:

```java
/**
 * 租户数据迁移
 */
@Service
public class TenantMigrationService {

    /**
     * 迁移用户数据
     *
     * @param fromTenantId 源租户ID
     * @param toTenantId   目标租户ID
     * @param userIds      用户ID列表
     */
    @Transactional(rollbackFor = Exception.class)
    public void migrateUsers(String fromTenantId, String toTenantId,
                            List<Long> userIds) {
        // 1. 从源租户查询用户数据
        List<User> users = TenantHelper.dynamic(fromTenantId, () -> {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(User::getUserId, userIds);
            return userMapper.selectList(wrapper);
        });

        // 2. 修改租户ID
        users.forEach(user -> {
            user.setUserId(null);  // 清空ID,插入时自动生成
            user.setTenantId(toTenantId);
        });

        // 3. 插入到目标租户
        TenantHelper.dynamic(toTenantId, () -> {
            userMapper.batchInsert(users);
        });

        // 4. 删除源租户的用户(可选)
        TenantHelper.dynamic(fromTenantId, () -> {
            userMapper.deleteBatchIds(userIds);
        });
    }
}
```
