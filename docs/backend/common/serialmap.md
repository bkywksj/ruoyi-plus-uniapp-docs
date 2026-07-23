# 序列化映射 (serialmap)

## 1. 概述

序列化映射模块是 RuoYi-Plus-Uniapp 框架的核心功能模块，提供了强大的数据字典翻译和字段映射功能。该模块通过注解驱动的方式，在 JSON 序列化过程中自动将原始数据转换为用户友好的显示数据，大幅简化了前端数据展示的复杂度。

### 1.1 核心特性

- **注解驱动**：通过 `@SerialMap` 注解实现零侵入式的数据转换
- **高性能缓存**：内置 Redis 缓存机制，显著提升转换性能
- **灵活扩展**：支持自定义转换器，满足各种业务场景
- **类型安全**：完整的泛型支持和类型检查
- **线程安全**：基于 ThreadLocal 的上下文管理

### 1.2 应用场景

- ID 转名称：用户 ID → 用户名、部门 ID → 部门名称
- 字典翻译：状态码 → 状态描述、性别码 → 性别标签
- 资源映射：文件 ID → 访问 URL、图片 ID → 图片链接
- 对象映射：关联 ID → 完整对象、ID 列表 → 对象列表

## 2. 快速开始

### 2.1 模块依赖

序列化映射模块已内置在框架中，默认包含以下依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-serialmap</artifactId>
</dependency>
```

### 2.2 基础使用

在 VO 类中使用 `@SerialMap` 注解：

```java
public class UserVo {
    private Long userId;

    // 用户ID转用户名
    @SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
    private String userName;

    private Long deptId;

    // 部门ID转部门名称
    @SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME)
    private String deptName;

    // 字典翻译：性别
    @SerialMap(converter = SerialMapConstant.DICT_TYPE_TO_LABEL, param = "sys_user_sex")
    private String sex;
}
```

## 3. 注解详解

### 3.1 @SerialMap 注解

`@SerialMap` 是核心注解，用于标记需要进行映射转换的字段。

#### 主要参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| converter | String | 是 | 转换器类型标识 |
| source | String | 否 | 源字段名称，默认使用当前字段 |
| param | String | 否 | 转换器额外参数 |
| entityClass | Class<?> | 否 | 数据源实体类 |
| targetField | String | 否 | 目标映射字段 |

#### 使用示例

```java
public class OrderVo {
    private Long userId;
    private Long deptId;
    private String status;
    private String fileIds;

    // 基础映射：用户ID → 用户名
    @SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
    private String userName;

    // 源字段映射：从deptId字段获取值转换为部门名称
    @SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME, source = "deptId")
    private String deptName;

    // 带参数映射：字典转换
    @SerialMap(converter = SerialMapConstant.DICT_TYPE_TO_LABEL, param = "sys_order_status")
    private String statusLabel;

    // 文件ID转URL
    @SerialMap(converter = SerialMapConstant.OSS_ID_TO_URL, source = "fileIds")
    private String fileUrls;
}
```

### 3.2 @SerialMapType 注解

用于标识转换器实现类的类型，建立转换器与标识的映射关系。

```java
@SerialMapType(type = "custom_converter")
@Component
public class CustomConverter implements SerialMapInterface<String> {
    @Override
    public String convert(Object key, String param) {
        // 转换逻辑
        return convertLogic(key, param);
    }
}
```

## 4. 内置转换器

框架提供了丰富的内置转换器，覆盖常见的业务场景。

### 4.1 转换器类型总览

| 转换器标识 | 功能描述 | 支持类型 |
|------------|----------|----------|
| `field_map` | 通用字段映射 | 单字段、对象、集合 |
| `user_id_to_name` | 用户ID转账号 | Long |
| `user_id_to_nickname` | 用户ID转昵称 | Long、String |
| `user_id_to_avatar` | 用户ID转头像 | Long、String |
| `dept_id_to_name` | 部门ID转名称 | Long、String |
| `dict_type_to_label` | 字典值转标签 | String |
| `oss_id_to_url` | OSS文件ID转URL | Long、String |
| `directory_id_directory_name` | 目录ID转名称 | Long |

### 4.2 用户相关转换器

#### 用户ID转用户名
```java
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
private String userName;
```

#### 用户ID转昵称（支持批量）
```java
// 单个用户ID
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME)
private String userNickName;

// 多个用户ID（逗号分隔）
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME)
private String userNickNames; // "1,2,3" → "张三,李四,王五"
```

#### 用户ID转头像
```java
@SerialMap(converter = SerialMapConstant.USER_ID_TO_AVATAR)
private String userAvatar;
```

### 4.3 部门转换器

#### 部门ID转名称（支持批量）
```java
// 单个部门ID
@SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME)
private String deptName;

// 多个部门ID
@SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME)
private String deptNames; // "1,2,3" → "总经办,技术部,销售部"
```

### 4.4 字典转换器

#### 字典值转标签
```java
// 性别字典
@SerialMap(converter = SerialMapConstant.DICT_TYPE_TO_LABEL, param = "sys_user_sex")
private String sexLabel;

// 状态字典
@SerialMap(converter = SerialMapConstant.DICT_TYPE_TO_LABEL, param = "sys_common_status")
private String statusLabel;
```

### 4.5 文件相关转换器

#### OSS文件ID转URL
```java
// 单个文件ID
@SerialMap(converter = SerialMapConstant.OSS_ID_TO_URL)
private String fileUrl;

// 多个文件ID
@SerialMap(converter = SerialMapConstant.OSS_ID_TO_URL)
private String fileUrls; // "1,2,3" → "url1,url2,url3"
```

#### 目录ID转名称
```java
@SerialMap(converter = SerialMapConstant.DIRECTORY_ID_DIRECTORY_NAME)
private String directoryName;
```

## 5. 通用字段映射转换器

`field_map` 是最强大的内置转换器，支持多种映射模式。

### 5.1 单字段映射

将关联ID转换为实体的指定字段值。

```java
public class UserVo {
    private Long userId;

    // 获取用户表的nickName字段
    @SerialMap(converter = SerialMapConstant.FIELD_MAP,
            source = "userId",
            entityClass = SysUser.class,
            targetField = "nickName")
    private String nickName;

    // 获取用户表的email字段
    @SerialMap(converter = SerialMapConstant.FIELD_MAP,
            source = "userId",
            entityClass = SysUser.class,
            targetField = "email")
    private String email;
}
```

### 5.2 对象映射

将关联ID转换为完整的对象或VO。

```java
public class UserVo {
    private Long deptId;

    // 映射为部门对象
    @SerialMap(converter = SerialMapConstant.FIELD_MAP,
            source = "deptId",
            entityClass = SysDept.class)
    private SysDeptVo deptVo;

    // 映射为用户对象
    @SerialMap(converter = SerialMapConstant.FIELD_MAP,
            source = "userId",
            entityClass = SysUser.class)
    private SysUserVo userVo;
}
```

### 5.3 集合映射

将ID列表转换为对象列表。

```java
public class UserVo {
    private List<Long> roleIds;

    // ID列表映射为角色对象列表
    @SerialMap(converter = SerialMapConstant.FIELD_MAP,
            source = "roleIds",
            entityClass = SysRole.class)
    private List<SysRoleVo> roles;

    // 字符串ID列表（逗号分隔）映射为对象列表
    private String menuIds; // "1,2,3"

    @SerialMap(converter = SerialMapConstant.FIELD_MAP,
            source = "menuIds",
            entityClass = SysMenu.class)
    private List<SysMenuVo> menus;
}
```

### 5.4 智能字段匹配

`field_map` 支持智能字段名匹配，自动处理多种命名规则：

```java
// 实体类字段名：user_name, userName, USER_NAME
// 目标字段名：username
// 系统会自动匹配以下规则：
// 1. 精确匹配：username
// 2. 驼峰转换：userName
// 3. 下划线转换：user_name
// 4. 模糊匹配：包含关键词的字段

@SerialMap(converter = SerialMapConstant.FIELD_MAP,
        entityClass = SysUser.class,
        targetField = "username") // 自动匹配 userName 字段
private String userName;
```

## 6. 高级用法

### 6.1 方法级注解

除了字段，还可以在getter方法上使用注解：

```java
public class UserVo {
    private Long userId;

    @SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
    public String getUserName() {
        return null; // 返回值会被转换器覆盖
    }
}
```

### 6.2 复杂映射场景

```java
public class ComplexVo {
    private Long userId;
    private String roleIds; // "1,2,3"
    private String status;

    // 多级映射：用户 → 部门 → 部门名称
    @SerialMap(converter = SerialMapConstant.FIELD_MAP,
            source = "userId",
            entityClass = SysUser.class,
            targetField = "dept.deptName")
    private String userDeptName;

    // 条件映射：根据状态显示不同内容
    @SerialMap(converter = "custom_status_converter", param = "user_status")
    private String statusDescription;

    // 组合映射：角色ID列表 → 角色名称列表 → 逗号分隔字符串
    @SerialMap(converter = "role_ids_to_names")
    private String roleNames;
}
```

### 6.3 性能优化技巧

#### 批量查询优化
```java
// 推荐：使用支持批量的转换器
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME) // 支持 "1,2,3"
private String userNames;

// 不推荐：多个单独字段（会产生多次数据库查询）
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME)
private String userName1;
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME)
private String userName2;
```

#### 缓存利用
```java
// 相同的转换会被缓存，第二次调用直接从缓存获取
@SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME)
private String deptName1;

@SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME, source = "parentDeptId")
private String parentDeptName; // 如果ID相同，会命中缓存
```

## 7. 自定义转换器

### 7.1 实现转换器接口

创建自定义转换器需要实现 `SerialMapInterface` 接口：

```java
package com.example.converter;

import plus.ruoyi.common.serialmap.core.SerialMapInterface;
import plus.ruoyi.common.serialmap.annotation.SerialMapType;
import plus.ruoyi.common.serialmap.constant.SerialMapConstant;
import org.springframework.stereotype.Component;

/**
 * 自定义转换器示例：订单状态转换
 */
@Component
@SerialMapType(type = "order_status_converter")
public class OrderStatusConverter implements SerialMapInterface<String> {

    @Override
    public String convert(Object key, String param) {
        if (key == null) {
            return null;
        }

        String status = key.toString();
        return switch (status) {
            case "0" -> "待支付";
            case "1" -> "已支付";
            case "2" -> "已发货";
            case "3" -> "已完成";
            case "4" -> "已取消";
            default -> "未知状态";
        };
    }
}
```

### 7.2 复杂业务转换器

```java
/**
 * 复杂业务转换器：用户积分等级转换
 */
@Component
@SerialMapType(type = "user_level_converter")
@AllArgsConstructor
public class UserLevelConverter implements SerialMapInterface<Map<String, Object>> {

    private final UserService userService;
    private final PointService pointService;

    @Override
    public Map<String, Object> convert(Object key, String param) {
        if (!(key instanceof Long userId)) {
            return null;
        }

        // 获取用户积分
        Integer points = pointService.getUserPoints(userId);

        // 计算等级信息
        Map<String, Object> levelInfo = new HashMap<>();
        if (points >= 10000) {
            levelInfo.put("level", "钻石");
            levelInfo.put("levelCode", "diamond");
            levelInfo.put("color", "#FF6B6B");
        } else if (points >= 5000) {
            levelInfo.put("level", "黄金");
            levelInfo.put("levelCode", "gold");
            levelInfo.put("color", "#FFD93D");
        } else if (points >= 1000) {
            levelInfo.put("level", "白银");
            levelInfo.put("levelCode", "silver");
            levelInfo.put("color", "#C0C0C0");
        } else {
            levelInfo.put("level", "青铜");
            levelInfo.put("levelCode", "bronze");
            levelInfo.put("color", "#CD7F32");
        }

        levelInfo.put("points", points);
        return levelInfo;
    }
}
```

### 7.3 带缓存的转换器

```java
/**
 * 带缓存的转换器示例
 */
@Component
@SerialMapType(type = "cached_converter")
@AllArgsConstructor
public class CachedConverter implements SerialMapInterface<String> {

    private final ExternalApiService externalApiService;

    @Override
    public String convert(Object key, String param) {
        String cacheKey = "external_api:" + key;

        // 尝试从缓存获取
        String cachedResult = CacheUtils.get(CacheNames.EXTERNAL_API, cacheKey);
        if (cachedResult != null) {
            return cachedResult;
        }

        // 缓存未命中，调用外部API
        String result = externalApiService.getData(key.toString());

        // 缓存结果
        if (result != null) {
            CacheUtils.put(CacheNames.EXTERNAL_API, cacheKey, result, Duration.ofMinutes(30));
        }

        return result;
    }
}
```

### 7.4 使用自定义转换器

```java
public class OrderVo {
    private String status;
    private Long userId;

    // 使用自定义状态转换器
    @SerialMap(converter = "order_status_converter")
    private String statusLabel;

    // 使用复杂业务转换器
    @SerialMap(converter = "user_level_converter", source = "userId")
    private Map<String, Object> userLevel;
}
```

## 8. 配置与缓存

### 8.1 缓存配置

序列化映射模块使用Redis进行缓存，相关配置在 `CacheNames` 中定义：

```java
public interface CacheNames {
    /**
     * 字段映射缓存
     */
    String FIELD_MAP = "field_map";
}
```

### 8.2 缓存策略

- **缓存键格式**：`实体类名:ID:后缀`
- **缓存时间**：默认使用Redis配置的过期时间
- **缓存更新**：数据变更时自动清除相关缓存

### 8.3 性能监控

```yaml
# 开启DEBUG日志可以监控缓存命中情况
logging:
  level:
    plus.ruoyi.common.serialmap: DEBUG
```

## 9. 最佳实践

### 9.1 命名规范

#### 转换器类型命名
- 使用小写字母和下划线
- 格式：`源_to_目标` 或 `业务_功能`
- 示例：`user_id_to_name`、`dict_type_to_label`

#### 字段命名
```java
// 推荐：语义明确的字段名
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
private String creatorName; // 而不是 creator

@SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME)
private String belongDeptName; // 而不是 dept
```

### 9.2 性能优化

#### 批量处理优先
```java
// 推荐：支持批量处理
private String userIds; // "1,2,3"
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME)
private String userNames; // "张三,李四,王五"

// 不推荐：多个单独字段
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME, source = "userId1")
private String userName1;
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NICKNAME, source = "userId2")
private String userName2;
```

#### 合理使用缓存
```java
// 对于频繁访问的数据，利用缓存优势
@SerialMap(converter = SerialMapConstant.DICT_TYPE_TO_LABEL, param = "sys_user_sex")
private String sex; // 字典数据通常变化较少，缓存效果好
```

### 9.3 错误处理

#### 空值处理
```java
// 框架会自动处理null值，无需额外判断
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
private String userName; // userId为null时，userName也为null
```

#### 异常容错
```java
// 转换异常时会保留原值，不会中断序列化过程
@SerialMap(converter = "custom_converter")
private String customValue; // 转换失败时保持原值
```

### 9.4 代码组织

#### VO类设计
```java
public class UserVo {
    // 原始数据字段
    private Long userId;
    private Long deptId;
    private String sex;

    // 映射字段（建议放在一起）
    @SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
    private String userName;

    @SerialMap(converter = SerialMapConstant.DEPT_ID_TO_NAME)
    private String deptName;

    @SerialMap(converter = SerialMapConstant.DICT_TYPE_TO_LABEL, param = "sys_user_sex")
    private String sexLabel;
}
```

#### 转换器分包管理
```text
com.example.converter/
├── user/           # 用户相关转换器
│   ├── UserStatusConverter.java
│   └── UserLevelConverter.java
├── order/          # 订单相关转换器
│   ├── OrderStatusConverter.java
│   └── PaymentMethodConverter.java
└── common/         # 通用转换器
    ├── DateFormatConverter.java
    └── MoneyFormatConverter.java
```

## 10. 常见问题

### 10.1 转换器未生效

**问题**：标注了`@SerialMap`注解但转换不生效

**排查步骤**：
1. 确认转换器已注册为Spring Bean（使用`@Component`等注解）
2. 确认转换器标注了`@SerialMapType`注解
3. 确认converter值与转换器类型一致
4. 查看启动日志，确认转换器已加载

```java
// 错误示例：未标注@Component
@SerialMapType(type = "custom_converter")
public class CustomConverter implements SerialMapInterface<String> { ... }

// 正确示例
@Component
@SerialMapType(type = "custom_converter")
public class CustomConverter implements SerialMapInterface<String> { ... }
```

### 10.2 空指针异常

**问题**：转换过程中出现空指针异常

**解决方案**：在转换器中添加空值检查

```java
@Override
public String convert(Object key, String param) {
    // 添加空值检查
    if (key == null) {
        return null;
    }

    // 类型转换前进行检查
    if (!(key instanceof Long)) {
        return null;
    }

    Long id = (Long) key;
    return someService.getNameById(id);
}
```

### 10.3 性能问题

**问题**：大量数据转换导致性能下降

**优化方案**：
1. 使用支持批量处理的转换器
2. 合理利用缓存机制
3. 避免在循环中使用单个ID转换

```java
// 优化前：N次数据库查询
List<UserVo> users = userList.stream().map(user -> {
            UserVo vo = new UserVo();
            vo.setUserId(user.getId());
            // 这里会触发N次数据库查询
            return vo;
        }).collect(Collectors.toList());

// 优化后：使用field_map进行批量处理
// 或者预先批量查询相关数据
```

### 10.4 循环依赖问题

**问题**：转换器中注入Service时出现循环依赖

**解决方案**：
1. 使用`@Lazy`注解延迟初始化
2. 使用ApplicationContext手动获取Bean
3. 重新设计依赖关系

```java
@Component
@SerialMapType(type = "user_converter")
public class UserConverter implements SerialMapInterface<String> {

    // 方案1：使用@Lazy注解
    @Lazy
    private final UserService userService;

    // 方案2：使用ApplicationContext
    private final ApplicationContext applicationContext;

    @Override
    public String convert(Object key, String param) {
        UserService service = applicationContext.getBean(UserService.class);
        return service.getUserNameById((Long) key);
    }
}
```

## 11. 工作原理

### 11.1 架构设计

```text
┌─────────────────────────────────────────────────────────────┐
│                    序列化映射模块架构                         │
├─────────────────────────────────────────────────────────────┤
│  @SerialMap 注解  │  SerialMapHandler  │  转换器注册表        │
│       ↓           │        ↓           │        ↓            │
│   字段标记         │    序列化处理       │    转换器映射        │
│                   │                    │                    │
│ SerialMapContext  │  转换器接口实现     │   Redis缓存         │
│       ↓           │        ↓           │        ↓            │
│   上下文管理       │    业务转换逻辑     │    性能优化          │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 执行流程

1. **注解扫描**：Spring启动时扫描所有`@SerialMap`注解
2. **转换器注册**：将标注`@SerialMapType`的转换器注册到映射表
3. **序列化触发**：JSON序列化时触发`SerialMapHandler`
4. **上下文创建**：创建线程级上下文，存储字段信息
5. **转换执行**：根据转换器类型执行相应转换逻辑
6. **缓存处理**：查询缓存或将结果存入缓存
7. **结果输出**：输出转换后的值，清理上下文

### 11.3 缓存机制

```java
// 缓存键生成规则
String cacheKey = entityClass.getSimpleName() + ":" + id + ":" + suffix;

// 缓存查询优先级
1. 检查Redis缓存是否存在
2. 缓存命中：直接返回缓存结果
3. 缓存未命中：执行数据库查询
4. 将查询结果存入Redis缓存
5. 返回查询结果
```

## 12. 扩展开发

### 12.1 自定义注解

可以基于`@SerialMap`创建更具体的业务注解：

```java
/**
 * 用户信息转换注解
 */
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME)
public @interface UserName {
}

/**
 * 字典转换注解
 */
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@SerialMap(converter = SerialMapConstant.DICT_TYPE_TO_LABEL)
public @interface DictLabel {
    String value(); // 字典类型
}

// 使用示例
public class UserVo {
    @UserName  // 等价于 @SerialMap(converter = "user_id_to_name")
    private String creatorName;

    @DictLabel("sys_user_sex")  // 等价于 @SerialMap(converter = "dict_type_to_label", param = "sys_user_sex")
    private String sex;
}
```

### 12.2 转换器继承

创建转换器基类，简化开发：

```java
/**
 * 抽象转换器基类
 */
public abstract class AbstractSerialMapConverter<T> implements SerialMapInterface<T> {

    protected final Logger log = LoggerFactory.getLogger(this.getClass());

    @Override
    public final T convert(Object key, String param) {
        if (key == null) {
            return null;
        }

        try {
            return doConvert(key, param);
        } catch (Exception e) {
            log.error("转换失败: key={}, param={}, error={}", key, param, e.getMessage());
            return getDefaultValue();
        }
    }

    /**
     * 执行具体转换逻辑
     */
    protected abstract T doConvert(Object key, String param);

    /**
     * 获取默认值（转换失败时返回）
     */
    protected T getDefaultValue() {
        return null;
    }
}

/**
 * 字典转换器基类
 */
public abstract class AbstractDictConverter extends AbstractSerialMapConverter<String> {

    @Autowired
    private DictService dictService;

    @Override
    protected String doConvert(Object key, String param) {
        if (StringUtils.isBlank(param)) {
            log.warn("字典类型参数为空");
            return key.toString();
        }

        return dictService.getDictLabel(param, key.toString());
    }
}
```

### 12.3 条件转换器

支持条件判断的转换器：

```java
/**
 * 条件转换器：根据不同条件返回不同结果
 */
@Component
@SerialMapType(type = "conditional_converter")
public class ConditionalConverter implements SerialMapInterface<String> {

    @Override
    public String convert(Object key, String param) {
        // param格式：condition1:result1,condition2:result2,default:defaultResult
        if (StringUtils.isBlank(param)) {
            return key.toString();
        }

        String keyStr = key.toString();
        String[] conditions = param.split(",");

        for (String condition : conditions) {
            String[] parts = condition.split(":");
            if (parts.length == 2) {
                if ("default".equals(parts[0]) || keyStr.equals(parts[0])) {
                    return parts[1];
                }
            }
        }

        return keyStr;
    }
}

// 使用示例
@SerialMap(converter = "conditional_converter",
        param = "1:启用,0:禁用,default:未知")
private String statusText;
```

### 12.4 组合转换器

支持多个转换器组合使用：

```java
/**
 * 组合转换器：支持多个转换器链式调用
 */
@Component
@SerialMapType(type = "composite_converter")
public class CompositeConverter implements SerialMapInterface<String> {

    @Override
    public String convert(Object key, String param) {
        // param格式：converter1|converter2|converter3
        if (StringUtils.isBlank(param)) {
            return key.toString();
        }

        String[] converters = param.split("\\|");
        Object currentValue = key;

        for (String converterType : converters) {
            SerialMapInterface<?> converter = SerialMapHandler.CONVERTERS.get(converterType);
            if (converter != null) {
                currentValue = converter.convert(currentValue, "");
            }
        }

        return currentValue != null ? currentValue.toString() : null;
    }
}

// 使用示例：先转换为用户名，再转换为大写
@SerialMap(converter = "composite_converter",
        param = "user_id_to_name|uppercase_converter")
private String upperUserName;
```

## 13. 测试指南

### 13.1 单元测试

```java
@SpringBootTest
class SerialMapTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testUserNameConvert() throws Exception {
        UserVo userVo = new UserVo();
        userVo.setUserId(1L);

        String json = objectMapper.writeValueAsString(userVo);

        // 验证转换结果
        JsonNode jsonNode = objectMapper.readTree(json);
        assertThat(jsonNode.get("userName").asText()).isEqualTo("admin");
    }

    @Test
    void testDictConvert() throws Exception {
        UserVo userVo = new UserVo();
        userVo.setSex("1");

        String json = objectMapper.writeValueAsString(userVo);
        JsonNode jsonNode = objectMapper.readTree(json);

        assertThat(jsonNode.get("sexLabel").asText()).isEqualTo("男");
    }

    @Test
    void testFieldMapConvert() throws Exception {
        UserVo userVo = new UserVo();
        userVo.setUserId(1L);

        String json = objectMapper.writeValueAsString(userVo);
        JsonNode jsonNode = objectMapper.readTree(json);

        // 验证对象映射
        assertThat(jsonNode.has("userInfo")).isTrue();
        assertThat(jsonNode.get("userInfo").get("nickName").asText()).isNotEmpty();
    }
}
```

### 13.2 集成测试

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.redis.host=localhost",
        "spring.redis.port=6379"
})
class SerialMapIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testApiResponse() {
        ResponseEntity<String> response = restTemplate.getForEntity("/user/list", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // 验证返回的JSON中包含转换后的字段
        String body = response.getBody();
        assertThat(body).contains("userName");
        assertThat(body).contains("deptName");
        assertThat(body).contains("sexLabel");
    }
}
```

### 13.3 性能测试

```java
@Component
class SerialMapPerformanceTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testPerformance() throws Exception {
        List<UserVo> users = generateTestData(1000);

        long startTime = System.currentTimeMillis();

        for (UserVo user : users) {
            objectMapper.writeValueAsString(user);
        }

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        System.out.println("转换1000个对象耗时: " + duration + "ms");

        // 验证性能指标
        assertThat(duration).isLessThan(5000); // 应该在5秒内完成
    }

    private List<UserVo> generateTestData(int count) {
        return IntStream.range(1, count + 1)
                .mapToObj(i -> {
                    UserVo user = new UserVo();
                    user.setUserId((long) i);
                    user.setDeptId((long) (i % 10 + 1));
                    user.setSex(i % 2 == 0 ? "1" : "0");
                    return user;
                })
                .collect(Collectors.toList());
    }
}
```

## 14. 监控与调试

### 14.1 日志配置

```yaml
# application.yml
logging:
  level:
    plus.ruoyi.common.serialmap: DEBUG
    plus.ruoyi.common.serialmap.core.handler: TRACE
    plus.ruoyi.common.serialmap.core.impl: DEBUG
```

### 14.2 监控指标

```java
/**
 * 转换器性能监控
 */
@Component
public class SerialMapMetrics {

    private final MeterRegistry meterRegistry;
    private final Counter conversionCounter;
    private final Timer conversionTimer;

    public SerialMapMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.conversionCounter = Counter.builder("serialmap.conversions.total")
                .description("Total number of conversions")
                .register(meterRegistry);
        this.conversionTimer = Timer.builder("serialmap.conversion.duration")
                .description("Conversion duration")
                .register(meterRegistry);
    }

    public void recordConversion(String converterType, Duration duration) {
        conversionCounter.increment(Tags.of("converter", converterType));
        conversionTimer.record(duration);
    }
}
```

### 14.3 调试技巧

```java
// 开启详细日志
@Component
@Slf4j
public class DebugConverter implements SerialMapInterface<String> {

    @Override
    public String convert(Object key, String param) {
        log.debug("转换开始 - key: {}, param: {}", key, param);

        try {
            String result = doActualConversion(key, param);
            log.debug("转换成功 - 结果: {}", result);
            return result;
        } catch (Exception e) {
            log.error("转换失败 - key: {}, param: {}, error: {}", key, param, e.getMessage(), e);
            throw e;
        }
    }

    private String doActualConversion(Object key, String param) {
        // 实际转换逻辑
        return "converted_" + key;
    }
}
```

## 16. FAQ

### Q1: 为什么转换器不生效？
**A**: 检查以下几点：
1. 转换器类是否标注了`@Component`和`@SerialMapType`注解
2. 注解中的type值是否与使用时的converter值一致
3. 检查Spring容器是否成功加载了转换器（查看启动日志）

### Q2: 如何提高转换性能？
**A**: 性能优化建议：
1. 使用批量转换器（如支持逗号分隔ID的转换器）
2. 合理利用Redis缓存
3. 避免在循环中进行单个转换
4. 考虑使用`field_map`进行批量对象查询

### Q3: 转换结果为null是正常的吗？
**A**: 以下情况会返回null：
1. 源字段值为null
2. 转换器查询不到对应数据
3. 转换过程中发生异常（会有错误日志）
4. 转换器主动返回null

### Q4: 可以在转换器中注入其他Service吗？
**A**: 可以，但需要注意：
1. 使用`@Lazy`注解避免循环依赖
2. 考虑使用ApplicationContext手动获取Bean
3. 避免在转换器中进行复杂的业务逻辑处理

### Q5: 如何处理大数据量的转换？
**A**: 大数据量处理策略：
1. 使用分页处理，避免一次性加载过多数据
2. 实现异步转换机制
3. 使用Redis集群提高缓存性能
4. 考虑将转换逻辑移至数据库层面

### Q6: 转换器支持国际化吗？
**A**: 支持，可以这样实现：
```java
@Component
@SerialMapType(type = "i18n_converter")
public class I18nConverter implements SerialMapInterface<String> {
    
    @Autowired
    private MessageSource messageSource;
    
    @Override
    public String convert(Object key, String param) {
        Locale locale = LocaleContextHolder.getLocale();
        return messageSource.getMessage(param + "." + key, null, locale);
    }
}
```
