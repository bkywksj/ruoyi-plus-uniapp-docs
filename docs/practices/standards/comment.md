# 注释规范

> **文档状态**: ✅ 已完成
>
> 本文档详细介绍 RuoYi-Plus-UniApp 项目的代码注释规范和文档注释标准。

## 介绍

良好的注释是代码可读性和可维护性的重要保障。注释应该：

**核心价值:**

- **提高可读性** - 帮助开发者快速理解代码意图和业务逻辑
- **便于维护** - 降低代码维护成本，减少理解时间
- **知识传承** - 将业务知识和设计思路传递给团队成员
- **API文档化** - 自动生成API文档，提供清晰的接口说明
- **减少沟通** - 减少团队成员之间的重复沟通
- **提升质量** - 促使开发者思考代码逻辑，提前发现问题

注释不是越多越好，而是要在合适的地方写合适的注释。本文档基于项目实际使用情况编写，所有示例均来源于真实代码。

参考: ruoyi-plus-uniapp框架实际代码注释风格

## 注释基本原则

### 何时需要注释

**必须添加注释的情况:**

1. **所有公共API** - 类、接口、方法、属性必须有文档注释
2. **复杂逻辑** - 不易理解的算法、业务逻辑需要说明
3. **重要决策** - 为什么这样做，而不是那样做
4. **业务规则** - 特定的业务约束和规则
5. **临时方案** - TODO、FIXME、HACK等标记
6. **关键配置** - 配置项的含义和影响
7. **废弃代码** - @deprecated标记及替代方案

**示例:**

```java
/**
 * 广告配置业务对象 b_ad
 *
 * @author 抓蛙师
 * @date 2025-07-17
 */
@Data
public class AdBo extends BaseEntity {
    /**
     * 广告名称
     */
    @Schema(description = "广告名称")
    @NotBlank(message = "广告名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String adName;
}
```

参考: ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/bo/AdBo.java:15-53

### 何时不需要注释

**不需要添加注释的情况:**

1. **显而易见的代码** - 代码本身已经清晰表达意图
2. **变量名已说明** - 变量名足够描述其用途
3. **简单的getter/setter** - 标准的访问器方法
4. **重复的信息** - 注释和代码表达相同的内容
5. **过时的注释** - 与代码不符的注释（应该删除或更新）

**错误示例:**

```java
// ❌ 不要这样写
// 设置用户名
public void setUsername(String username) {
    this.username = username;
}

// ❌ 不要这样写
// i 自增 1
i++;

// ❌ 不要这样写
// 返回用户ID
public Long getUserId() {
    return this.userId;
}
```

**正确做法:**

```java
// ✅ 简单方法不需要注释
public void setUsername(String username) {
    this.username = username;
}

// ✅ 代码本身已经清晰
i++;

// ✅ 只在必要时添加业务说明
/**
 * 获取用户ID
 * 注意：租户管理员返回租户ID，普通用户返回用户ID
 */
public Long getUserId() {
    return isTenantAdmin() ? getTenantId() : this.userId;
}
```

### 注释的黄金法则

1. **注释WHY，而非WHAT** - 说明为什么这样做，而不是做了什么
2. **保持同步** - 修改代码时同步更新注释
3. **避免冗余** - 不要重复代码已经表达的内容
4. **简洁明了** - 使用简洁清晰的语言
5. **中文优先** - 统一使用中文注释（专业术语除外）
6. **格式规范** - 遵循JavaDoc/JSDoc标准格式

## Java 注释规范

### 类注释

**格式要求:**

```java
/**
 * 类的功能描述
 *
 * @author 作者名称
 * @date 创建日期
 */
```

**完整示例:**

```java
/**
 * 广告配置业务对象 b_ad
 *
 * @author 抓蛙师
 * @date 2025-07-17
 */
@Data
public class AdBo extends BaseEntity {
    // ...
}
```

参考: ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/bo/AdBo.java:15-20

**规范说明:**

1. **必须包含**: 类的功能描述、@author、@date
2. **功能描述**: 简洁说明类的用途，如果是数据库实体，可标注表名
3. **@author**: 统一使用项目约定的作者名称（本项目使用"抓蛙师"）
4. **@date**: 使用 YYYY-MM-DD 格式，如 2025-07-17
5. **位置**: 类声明之前，所有注解之前

**不同类型的类注释:**

**1. Controller 类:**

```java
/**
 * 用户管理控制器
 * 提供用户的增删改查和权限管理接口
 *
 * @author 抓蛙师
 * @date 2025-07-15
 */
@RestController
@RequestMapping("/system/user")
public class UserController {
    // ...
}
```

**2. Service 接口:**

```java
/**
 * 广告配置服务接口
 *
 * @author 抓蛙师
 * @date 2025-07-17
 */
public interface IAdService {
    // ...
}
```

参考: ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/IAdService.java:12-17

**3. Service 实现类:**

```java
/**
 * 广告配置服务实现
 *
 * @author 抓蛙师
 * @date 2025-07-17
 */
@Service
public class AdServiceImpl implements IAdService {
    // ...
}
```

参考: ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/impl/AdServiceImpl.java:18-23

**4. 工具类:**

```java
/**
 * 字符串工具类
 * 提供常用的字符串处理方法
 *
 * @author 抓蛙师
 * @date 2025-01-10
 */
public class StringUtils {
    // ...
}
```

**5. 配置类:**

```java
/**
 * Redis 配置类
 * 配置 Redis 连接池和序列化方式
 *
 * @author 抓蛙师
 * @date 2025-01-10
 */
@Configuration
public class RedisConfig {
    // ...
}
```

### 方法注释

**格式要求:**

```java
/**
 * 方法功能描述
 *
 * @param 参数名 参数说明
 * @return 返回值说明
 * @throws 异常类型 异常说明（如果有）
 */
```

**完整示例:**

```java
/**
 * 根据ID查询
 *
 * @param id 主键ID
 * @return 视图对象
 */
AdVo get(Long id);
```

参考: ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/IAdService.java:18-24

**规范说明:**

1. **功能描述**: 第一行简洁说明方法的功能
2. **@param**: 每个参数一行，格式为 `@param 参数名 参数说明`
3. **@return**: 说明返回值的含义，如果返回void则省略
4. **@throws**: 如果抛出异常，说明异常类型和触发条件
5. **空行**: 功能描述和标签之间空一行

**不同场景的方法注释:**

**1. 查询方法:**

```java
/**
 * 分页查询广告配置列表
 *
 * @param query 查询条件
 * @return 分页结果
 */
PageResult<AdVo> pageAds(AdQuery query);
```

**2. 新增方法:**

```java
/**
 * 新增广告配置
 *
 * @param bo 业务对象
 * @return 是否成功
 */
Boolean insertByBo(AdBo bo);
```

**3. 更新方法:**

```java
/**
 * 修改广告配置
 *
 * @param bo 业务对象
 * @return 是否成功
 */
Boolean updateByBo(AdBo bo);
```

**4. 删除方法:**

```java
/**
 * 批量删除广告配置
 *
 * @param ids 主键ID集合
 * @return 是否成功
 */
Boolean deleteByIds(Collection<Long> ids);
```

**5. 复杂业务方法:**

```java
/**
 * 用户登录
 * 验证用户名密码，生成JWT令牌，记录登录日志
 *
 * @param username 用户名
 * @param password 密码
 * @param code 验证码
 * @param uuid 验证码唯一标识
 * @return 登录令牌和用户信息
 * @throws ServiceException 用户名或密码错误、验证码错误等
 */
LoginResult login(String username, String password, String code, String uuid);
```

**6. 带默认实现的接口方法:**

```java
/**
 * 检查用户是否有指定权限
 * 默认实现：超级管理员拥有所有权限
 *
 * @param permission 权限字符串
 * @return 是否有权限
 */
default boolean hasPermission(String permission) {
    return isSuperAdmin() || getPermissions().contains(permission);
}
```

### 字段注释

**格式要求:**

```java
/**
 * 字段说明
 */
```

**完整示例:**

```java
/**
 * 广告名称
 */
@Schema(description = "广告名称")
@NotBlank(message = "广告名称不能为空", groups = { AddGroup.class, EditGroup.class })
private String adName;

/**
 * appid
 */
@Schema(description = "appid")
private String appid;

/**
 * 是否启用（0否 1是）
 */
@Schema(description = "是否启用（0否 1是）")
private String status;
```

参考: ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/bo/AdBo.java:48-67

**规范说明:**

1. **简洁说明**: 一行说明字段的含义
2. **业务含义**: 如果字段有特定的业务规则，需要说明
3. **枚举值**: 如果是枚举类型或有固定值，需要列举可选值
4. **单位**: 如果有单位（如金额、时间），需要标注单位
5. **格式**: 如果有特定格式要求（如日期、手机号），需要说明

**不同类型的字段注释:**

**1. 普通字段:**

```java
/**
 * 用户名
 */
private String username;

/**
 * 邮箱地址
 */
private String email;
```

**2. 状态字段:**

```java
/**
 * 用户状态（0正常 1停用）
 */
private String status;

/**
 * 删除标志（0存在 1删除）
 */
private String delFlag;
```

**3. 枚举字段:**

```java
/**
 * 用户性别（0男 1女 2未知）
 */
private String sex;

/**
 * 广告位置（1首页轮播 2活动页 3详情页）
 */
private String position;
```

**4. 时间字段:**

```java
/**
 * 创建时间
 */
private Date createTime;

/**
 * 更新时间
 */
private Date updateTime;
```

**5. 金额字段:**

```java
/**
 * 订单金额（单位：元）
 */
private BigDecimal amount;

/**
 * 优惠金额（单位：分）
 */
private Long discountAmount;
```

**6. 关联字段:**

```java
/**
 * 用户ID
 */
private Long userId;

/**
 * 部门ID
 */
private Long deptId;

/**
 * 创建者ID
 */
private Long createBy;
```

### 常量注释

```java
/**
 * 超级管理员角色标识
 */
public static final String SUPER_ADMIN = "admin";

/**
 * 默认密码
 */
public static final String DEFAULT_PASSWORD = "123456";

/**
 * 用户状态：正常
 */
public static final String STATUS_NORMAL = "0";

/**
 * 用户状态：停用
 */
public static final String STATUS_DISABLE = "1";

/**
 * JWT令牌前缀
 */
public static final String TOKEN_PREFIX = "Bearer ";

/**
 * 验证码有效期（分钟）
 */
public static final int CAPTCHA_EXPIRATION = 2;
```

### 枚举注释

```java
/**
 * 用户状态枚举
 *
 * @author 抓蛙师
 * @date 2025-07-15
 */
public enum UserStatus {
    /**
     * 正常
     */
    NORMAL("0", "正常"),

    /**
     * 停用
     */
    DISABLE("1", "停用");

    /**
     * 状态码
     */
    private final String code;

    /**
     * 状态描述
     */
    private final String info;

    /**
     * 构造方法
     *
     * @param code 状态码
     * @param info 状态描述
     */
    UserStatus(String code, String info) {
        this.code = code;
        this.info = info;
    }

    /**
     * 根据状态码获取枚举
     *
     * @param code 状态码
     * @return 枚举对象，未找到返回null
     */
    public static UserStatus getByCode(String code) {
        for (UserStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }
}
```

### 代码块注释

**使用场景:**

1. 复杂逻辑块
2. 算法实现
3. 业务规则
4. 临时方案

**单行注释:**

```java
// 如果是超级管理员，直接返回
if (isSuperAdmin()) {
    return true;
}

// 检查用户权限
if (!hasPermission(permission)) {
    throw new ServiceException("无权限访问");
}

// TODO: 待实现的功能
// FIXME: 需要修复的问题
// HACK: 临时解决方案，后续需要优化
```

**多行注释:**

```java
/*
 * 用户登录逻辑：
 * 1. 验证验证码
 * 2. 验证用户名密码
 * 3. 生成JWT令牌
 * 4. 记录登录日志
 */

/*
 * 注意：此处使用了缓存优化
 * 缓存键格式：user:{userId}
 * 过期时间：30分钟
 */
```

### 特殊标记

```java
/**
 * @deprecated 此方法已废弃，请使用 {@link #newMethod(String)} 替代
 */
@Deprecated
public void oldMethod(String param) {
    // ...
}

/**
 * @see #relatedMethod() 相关方法
 * @since 1.0.0 版本说明
 */
public void someMethod() {
    // ...
}
```

## TypeScript/JavaScript 注释规范

### 函数注释

**格式要求:**

```typescript
/**
 * 函数功能描述
 * @param {类型} 参数名 参数说明
 * @returns {类型} 返回值说明
 */
```

**完整示例:**

```typescript
/**
 * 查询广告配置列表
 * @param query 查询参数
 * @returns {Result<PageResult<AdVo>>} 结果
 */
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => {
  return http.get<PageResult<AdVo>>('/base/ad/pageAds', query)
}
```

参考: plus-ui/src/api/business/base/ad/adApi.ts:3-10

**规范说明:**

1. **功能描述**: 第一行简洁说明函数的功能
2. **@param**: 每个参数一行，可选参数用?标记
3. **@returns**: 说明返回值类型和含义
4. **类型标注**: 使用 `{Type}` 格式标注类型

**不同场景的函数注释:**

**1. API 请求函数:**

```typescript
/**
 * 查询广告配置列表
 * @param query 查询参数
 * @returns {Result<PageResult<AdVo>>} 分页结果
 */
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => {
  return http.get<PageResult<AdVo>>('/base/ad/pageAds', query)
}

/**
 * 新增广告配置
 * @param data 广告数据
 * @returns {Result<void>} 操作结果
 */
export const addAd = (data: AdBo): Result<void> => {
  return http.post<void>('/base/ad', data)
}

/**
 * 修改广告配置
 * @param data 广告数据
 * @returns {Result<void>} 操作结果
 */
export const updateAd = (data: AdBo): Result<void> => {
  return http.put<void>('/base/ad', data)
}

/**
 * 删除广告配置
 * @param ids 主键ID数组
 * @returns {Result<void>} 操作结果
 */
export const deleteAd = (ids: string | number | Array<string | number>): Result<void> => {
  return http.delete<void>('/base/ad/' + ids)
}
```

**2. 工具函数（简单）:**

```typescript
/**
 * 检查值是否为真值
 * 支持多种真值表示形式：'1', 'true', 'yes', 'on', true, 1 等
 *
 * @param {any} value 要检查的值
 * @returns {boolean} 如果是真值则返回true，否则返回false
 */
export const isTrue = (value: any): boolean => {
  const trueValues = ['1', 'true', 'TRUE', 'True', 'yes', 'YES', 'Yes', 'on', 'ON', 'On', true, 1]
  return trueValues.includes(value)
}
```

参考: plus-ui/src/utils/boolean.ts:33-45

**3. 工具函数（详细示例）:**

```typescript
/**
 * 检查值是否为真值
 * 支持多种真值表示形式：'1', 'true', 'yes', 'on', true, 1 等
 *
 * @param {any} value 要检查的值
 * @returns {boolean} 如果是真值则返回true，否则返回false
 * @example
 * // 字符串形式
 * isTrue('1')        // true
 * isTrue('true')     // true
 * isTrue('TRUE')     // true
 * isTrue('yes')      // true
 * isTrue('on')       // true
 *
 * // 布尔值和数字
 * isTrue(true)       // true
 * isTrue(1)          // true
 *
 * // 假值
 * isTrue('0')        // false
 * isTrue('false')    // false
 * isTrue(false)      // false
 * isTrue(null)       // false
 * isTrue(undefined)  // false
 * isTrue('')         // false
 */
export const isTrue = (value: any): boolean => {
  const trueValues = ['1', 'true', 'TRUE', 'True', 'yes', 'YES', 'Yes', 'on', 'ON', 'On', true, 1]
  return trueValues.includes(value)
}
```

参考: plus-ui/src/utils/boolean.ts:33-82

**4. 模块级注释:**

```typescript
/**
 * 布尔值处理工具类
 *
 * 包含以下功能类别：
 * - 布尔判断：多格式真假值检查，支持字符串、数字、布尔值、null/undefined等各种输入
 *   (isTrue, isFalse)
 * - 类型转换：统一转换为标准布尔格式，输出 '1'/'0' 字符串或 boolean 类型
 *   (toBool, toBoolString)
 * - 状态切换：布尔状态切换，支持多种输入格式，输出标准 '1'/'0' 字符串
 *   (toggleStatus)
 *
 * 支持的真值格式：'1', 'true', 'TRUE', 'True', 'yes', 'YES', 'Yes', 'on', 'ON', 'On', true, 1
 * 支持的假值格式：'0', 'false', 'FALSE', 'False', 'no', 'NO', 'No', 'off', 'OFF', 'Off', false, 0, null, undefined, ''
 *
 * 使用示例：
 * ```typescript
 * // 多格式布尔判断
 * isTrue('1')        // true
 * isTrue('yes')      // true
 * isTrue(true)       // true
 * isFalse(null)      // true
 *
 * // 类型转换
 * toBool('1')        // true
 * toBoolString(true) // '1'
 *
 * // 状态切换
 * toggleStatus('1')  // '0'
 * toggleStatus('0')  // '1'
 * ```
 */
```

参考: plus-ui/src/utils/boolean.ts:1-30

### 接口和类型注释

**格式要求:**

```typescript
/** 接口/类型说明 */
export interface InterfaceName {
  /** 字段说明 */
  fieldName: Type
}
```

**完整示例:**

```typescript
/** 广告配置查询类型 */
export interface AdQuery extends PageQuery {
  /** 主键id */
  id?: string | number

  /** appid */
  appid?: string | number

  /** 广告名称 */
  adName?: string

  /** 是否启用（0否 1是） */
  status?: string
}

/** 广告配置业务对象类型 */
export interface AdBo {
  /** 主键id */
  id?: string | number

  /** 广告名称 */
  adName?: string

  /** appid */
  appid?: string | number

  /** 广告位置 */
  adPosition?: string

  /** 广告图片 */
  adImage?: string

  /** 跳转链接 */
  adLink?: string

  /** 是否启用（0否 1是） */
  status?: string
}

/** 广告配置视图对象类型 */
export interface AdVo {
  /** 主键id */
  id: string | number

  /** appid */
  appid: string | number

  /** 广告名称 */
  adName: string

  /** 广告位置 */
  adPosition: string

  /** 广告图片 */
  adImage: string

  /** 跳转链接 */
  adLink: string

  /** 是否启用（0否 1是） */
  status: string

  /** 创建时间 */
  createTime: Date
}
```

参考: plus-ui/src/api/business/base/ad/adTypes.ts:1-45

**规范说明:**

1. **接口注释**: 单行注释说明接口用途
2. **字段注释**: 每个字段都要有单行注释
3. **可选标记**: 可选字段使用 `?` 标记
4. **类型说明**: 复杂类型在注释中说明可选值

**类型别名注释:**

```typescript
/**
 * 按钮类型
 */
export type ButtonType = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'default' | 'text' | 'icon'

/**
 * 按钮尺寸
 */
export type ButtonSize = 'small' | 'medium' | 'large'

/**
 * 用户状态
 */
export type UserStatus = '0' | '1' // 0-正常 1-停用
```

### 变量注释

**Vue组件中的变量:**

```typescript
<script setup lang="ts" name="Ad">
// =========== 广告配置查询相关 ===========

/** 查询参数对象 */
const queryParams = ref<AdQuery>({
  pageNum: 1,
  pageSize: 10,
})

/** 日期范围选择器 */
const dateRangeCreateTime = ref<[ElDateModelType, ElDateModelType]>(['', ''])

/** 表单引用 */
const queryFormRef = ref<InstanceType<typeof ASearchForm>>()

// =========== 广告配置表格数据相关 ===========

/** 表格加载状态 */
const isLoading = ref(true)

/** 数据列表 */
const adList = ref<AdVo[]>([])

/** 总条数 */
const total = ref(0)

/** 选中的ID数组 */
const ids = ref<Array<string | number>>([])

/** 是否单选 */
const single = ref(true)

/** 是否多选 */
const multiple = ref(true)

// =========== 广告配置表单相关 ===========

/** 是否显示弹窗 */
const open = ref(false)

/** 表单标题 */
const title = ref('')

/** 表单数据 */
const form = ref<AdBo>({})

/** 表单引用 */
const adFormRef = ref<InstanceType<typeof AForm>>()
</script>
```

参考: plus-ui/src/views/business/base/ad/ad.vue:133-212

**规范说明:**

1. **分区注释**: 使用 `// ===== ... =====` 划分逻辑区域
2. **变量注释**: 每个变量使用 `/** ... */` 注释
3. **简洁说明**: 注释简洁明了，说明变量用途
4. **分类组织**: 相关变量放在同一区域

### Composable 函数注释

```typescript
/**
 * 认证与授权钩子 (useAuth)
 *
 * 提供用户认证与权限检查功能，包括权限字符串检查、角色校验和路由访问控制。
 * 此钩子集成了用户状态管理，简化了权限相关操作。
 *
 * 包含以下功能：
 * - 用户状态: 登录状态、管理员类型判断 (isLoggedIn, isSuperAdmin, isTenantAdmin)
 * - 权限检查: 单个或多个权限检查，支持OR和AND逻辑 (hasPermission, hasAllPermissions)
 * - 角色检查: 单个或多个角色检查，支持OR和AND逻辑 (hasRole, hasAllRoles)
 * - 租户权限: 租户上下文中的权限检查 (hasTenantPermission)
 * - 路由控制: 基于权限的路由访问控制 (canAccessRoute, filterAuthorizedRoutes)
 * - 用户信息检查: 检查用户信息完整性，支持弹窗和页面跳转授权 (hasUserInfo, navigateWithUserCheck)
 *
 * @returns 返回认证与授权相关的状态和方法
 *
 * @example
 * // 在组件中使用
 * import { useAuth } from '@/composables/useAuth';
 *
 * const { isLoggedIn, hasPermission, isSuperAdmin } = useAuth();
 *
 * // 检查登录状态
 * if (isLoggedIn.value) {
 *   console.log('用户已登录');
 * }
 *
 * // 检查权限
 * if (hasPermission('system:user:add')) {
 *   console.log('有添加用户权限');
 * }
 *
 * // 检查是否为超级管理员
 * if (isSuperAdmin()) {
 *   console.log('超级管理员');
 * }
 */
export const useAuth = () => {
  const userStore = useUserStore()

  /**
   * 当前用户登录状态
   * @description 表示用户是否已登录系统
   */
  const isLoggedIn = computed(() => {
    return userStore.token && userStore.token.length > 0
  })

  /**
   * 检查当前用户是否为超级管理员
   * @param roleToCheck 可选，要检查的超级管理员角色标识，不传则使用默认值
   * @returns 是否为超级管理员
   * @description 超级管理员具有所有权限，支持动态指定角色标识
   */
  const isSuperAdmin = (roleToCheck?: string): boolean => {
    const targetRole = roleToCheck || SUPER_ADMIN
    return userStore.roles.includes(targetRole)
  }

  // ...

  return {
    isLoggedIn,
    isSuperAdmin,
    // ...
  }
}
```

参考: plus-uniapp/src/composables/useAuth.ts:1-150

## Vue 组件注释规范

### 模板注释

**HTML 注释格式:**

```vue
<!-- Button 按钮 - 按钮用于触发一个操作，如提交表单或打开链接 -->
<template>
  <button>
    <view v-if="invisible !== true" class="wd-button__content">
      <!-- 加载中状态 -->
      <view v-if="loading" class="wd-button__loading">
        <view class="wd-button__loading-svg" :style="`background-image: url(${loadingIconSvg});`" />
      </view>
      <!-- 图标 -->
      <wd-icon v-else-if="icon" />
      <!-- 按钮文字 -->
      <view class="wd-button__text">
        <slot />
      </view>
    </view>
  </button>
</template>
```

参考: plus-uniapp/src/wd/components/wd-button/wd-button.vue:1-20

**规范说明:**

1. **组件描述**: 模板第一行注释说明组件名称和用途
2. **区域标注**: 关键DOM区域使用注释标注
3. **简洁明了**: 注释简洁，避免冗余
4. **注释格式**: 使用 `<!-- ... -->` HTML注释

**完整示例:**

```vue
<!-- 广告配置管理页面 -->
<template>
  <div class="app-container">
    <!-- 广告配置搜索栏 -->
    <ASearchForm ref="queryFormRef" v-model="queryParams" :visible="showSearch">
      <AFormInput label="模糊搜索" prop="searchValue" v-model="queryParams.searchValue" @input="handleQuery"></AFormInput>
      <AFormInput label="广告名称" prop="adName" v-model="queryParams.adName" @input="handleQuery"></AFormInput>
    </ASearchForm>

    <!-- 广告配置工具栏 -->
    <template #header>
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button type="danger" @click="handleDelete">删除</el-button>
    </template>

    <!-- 广告配置表格数据 -->
    <el-table ref="adTableRef" v-loading="isLoading" :data="adList">
      <el-table-column type="selection" width="55" />
      <el-table-column label="广告名称" prop="adName" />
      <el-table-column label="广告位置" prop="adPosition" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" link @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 广告配置表单弹窗 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <AForm ref="adFormRef" :model="form" :rules="rules">
        <AFormInput label="广告名称" prop="adName" v-model="form.adName" />
        <AFormInput label="广告位置" prop="adPosition" v-model="form.adPosition" />
      </AForm>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

参考: plus-ui/src/views/business/base/ad/ad.vue:3-128

### 脚本注释

**分区注释:**

```typescript
<script setup lang="ts" name="Ad">
import { ref, reactive, toRefs } from 'vue'
import { pageAds, getAd, addAd, updateAd, deleteAd } from '@/api/business/base/ad/adApi'
import type { AdQuery, AdBo, AdVo } from '@/api/business/base/ad/adTypes'

// =========== 广告配置查询相关 ===========

/** 查询参数对象 */
const queryParams = ref<AdQuery>({
  pageNum: 1,
  pageSize: 10,
})

/** 广告配置搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

/** 广告配置重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// =========== 广告配置表格数据相关 ===========

/** 表格加载状态 */
const isLoading = ref(true)

/** 数据列表 */
const adList = ref<AdVo[]>([])

/** 总条数 */
const total = ref(0)

/** 查询广告配置列表 */
const getList = async () => {
  isLoading.value = true
  const res = await pageAds(queryParams.value)
  adList.value = res.rows
  total.value = res.total
  isLoading.value = false
}

// =========== 广告配置表单相关 ===========

/** 是否显示弹窗 */
const open = ref(false)

/** 表单标题 */
const title = ref('')

/** 表单数据 */
const form = ref<AdBo>({})

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '新增广告配置'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AdVo) => {
  reset()
  const res = await getAd(row.id)
  form.value = res.data
  open.value = true
  title.value = '修改广告配置'
}

/** 提交按钮 */
const submitForm = async () => {
  if (!adFormRef.value) return
  await adFormRef.value.validate()

  if (form.value.id) {
    await updateAd(form.value)
    ElMessage.success('修改成功')
  } else {
    await addAd(form.value)
    ElMessage.success('新增成功')
  }

  open.value = false
  await getList()
}

// =========== 初始化 ===========

/** 页面加载时执行 */
onMounted(() => {
  getList()
})
</script>
```

参考: plus-ui/src/views/business/base/ad/ad.vue:133-394

**规范说明:**

1. **分区注释**: 使用 `// ===== ... =====` 划分逻辑区域
2. **变量注释**: 使用 `/** ... */` 注释变量
3. **方法注释**: 使用 `/** ... */` 注释方法
4. **逻辑分块**: 相关逻辑放在同一区域
5. **清晰命名**: 变量和方法名清晰，注释简洁

### 样式注释

```scss
```

参考: plus-uniapp/src/wd/components/wd-button/wd-button.vue:447-825

**规范说明:**

1. **分区注释**: 使用 `// ===== ... =====` 划分样式区域
2. **说明注释**: 使用 `//` 说明样式用途
3. **简洁明了**: 注释简洁，避免冗余
4. **重要说明**: 复杂样式或特殊处理需要注释说明

## 配置文件注释规范

### JSON 配置文件

```json
{
  "name": "ruoyi-plus-uniapp",
  "version": "1.0.0",
  "description": "RuoYi-Plus UniApp 移动端",
  "scripts": {
    "dev:h5": "uni",
    "dev:mp-weixin": "uni -p mp-weixin",
    "build:h5": "uni build",
    "build:mp-weixin": "uni build -p mp-weixin"
  },
  "dependencies": {
    "vue": "^3.4.21",
    "pinia": "^2.0.36"
  }
}
```

**注意**: JSON 不支持注释，描述信息应放在 README 或单独的文档中。

### YAML 配置文件

```yaml
# =========== 服务器配置 ===========
server:
  # 服务端口
  port: 8080
  # 应用上下文路径
  servlet:
    context-path: /

# =========== Spring 配置 ===========
spring:
  # 应用名称
  application:
    name: ruoyi-plus

  # 数据源配置
  datasource:
    # 数据库驱动
    driver-class-name: com.mysql.cj.jdbc.Driver
    # 数据库连接地址
    url: jdbc:mysql://localhost:3306/ry-plus?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
    # 数据库用户名
    username: root
    # 数据库密码
    password: password

# =========== MyBatis-Plus 配置 ===========
mybatis-plus:
  # Mapper XML 文件位置
  mapper-locations: classpath*:mapper/**/*Mapper.xml
  # 实体类扫描路径
  type-aliases-package: plus.ruoyi.**.domain

  # 全局配置
  global-config:
    # 数据库配置
    db-config:
      # 主键类型（使用数据库自增）
      id-type: auto
      # 逻辑删除字段名
      logic-delete-field: delFlag
      # 逻辑删除值（已删除）
      logic-delete-value: 1
      # 逻辑未删除值（未删除）
      logic-not-delete-value: 0
```

**规范说明:**

1. **分区注释**: 使用 `# ===== ... =====` 划分配置区域
2. **配置说明**: 每个配置项都添加注释说明
3. **格式统一**: 注释和配置项对齐
4. **简洁明了**: 注释简洁，说明配置用途

### Properties 配置文件

```properties
# =========== 服务器配置 ===========
# 服务端口
server.port=8080
# 应用上下文路径
server.servlet.context-path=/

# =========== 数据源配置 ===========
# 数据库驱动
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# 数据库连接地址
spring.datasource.url=jdbc:mysql://localhost:3306/ry-plus?useUnicode=true&characterEncoding=utf8
# 数据库用户名
spring.datasource.username=root
# 数据库密码（生产环境请使用加密配置）
spring.datasource.password=password

# =========== Redis 配置 ===========
# Redis 主机地址
spring.redis.host=localhost
# Redis 端口
spring.redis.port=6379
# Redis 密码（如果有）
spring.redis.password=
# Redis 数据库索引（默认为0）
spring.redis.database=0
```

## SQL 脚本注释规范

### 表定义注释

```sql
-- =========== 用户表 ===========
-- 存储系统用户基本信息，包括登录账号、密码、个人信息等
CREATE TABLE sys_user
(
    user_id     BIGINT      NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username    VARCHAR(30) NOT NULL COMMENT '用户账号',
    nickname    VARCHAR(30) NOT NULL COMMENT '用户昵称',
    email       VARCHAR(50) COMMENT '邮箱地址',
    phone       VARCHAR(11) COMMENT '手机号码',
    sex         CHAR(1) COMMENT '用户性别（0男 1女 2未知）',
    avatar      VARCHAR(255) COMMENT '头像地址',
    password    VARCHAR(100) COMMENT '密码',
    status      CHAR(1) DEFAULT '0' COMMENT '帐号状态（0正常 1停用）',
    del_flag    CHAR(1) DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
    login_ip    VARCHAR(128) COMMENT '最后登录IP',
    login_date  DATETIME COMMENT '最后登录时间',
    create_by   BIGINT COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by   BIGINT COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',
    remark      VARCHAR(500) COMMENT '备注'
) ENGINE = InnoDB COMMENT = '用户信息表';

-- =========== 角色表 ===========
-- 存储系统角色信息，用于权限控制
CREATE TABLE sys_role
(
    role_id     BIGINT      NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_name   VARCHAR(30) NOT NULL COMMENT '角色名称',
    role_key    VARCHAR(100) NOT NULL COMMENT '角色权限字符串',
    role_sort   INT         NOT NULL COMMENT '显示顺序',
    status      CHAR(1)     NOT NULL COMMENT '角色状态（0正常 1停用）',
    del_flag    CHAR(1) DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
    create_by   BIGINT COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by   BIGINT COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',
    remark      VARCHAR(500) COMMENT '备注'
) ENGINE = InnoDB COMMENT = '角色信息表';
```

参考: script/sql/oracle/oracle_ry_plus_new.sql:1-2

**规范说明:**

1. **表注释**: 使用 `-- ===== ... =====` 标注表名
2. **表说明**: 简要说明表的用途
3. **字段注释**: 每个字段使用 `COMMENT` 添加注释
4. **枚举说明**: 字段如果是枚举，在注释中说明可选值
5. **表注释**: 使用 `COMMENT` 说明表的用途

### 索引注释

```sql
-- =========== 用户表索引 ===========
-- 用户名唯一索引
CREATE UNIQUE INDEX uk_username ON sys_user (username);

-- 手机号唯一索引
CREATE UNIQUE INDEX uk_phone ON sys_user (phone);

-- 邮箱唯一索引
CREATE UNIQUE INDEX uk_email ON sys_user (email);

-- 状态索引（用于快速查询启用的用户）
CREATE INDEX idx_status ON sys_user (status);

-- 部门ID索引（用于部门用户查询）
CREATE INDEX idx_dept_id ON sys_user (dept_id);

-- 创建时间索引（用于时间范围查询）
CREATE INDEX idx_create_time ON sys_user (create_time);
```

### 数据初始化注释

```sql
-- =========== 初始化超级管理员 ===========
-- 用户名: admin, 密码: admin123
INSERT INTO sys_user (user_id, username, nickname, password, status, del_flag, create_time)
VALUES (1, 'admin', '超级管理员', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE/TP57Y5m6B5.', '0', '0', NOW());

-- =========== 初始化超级管理员角色 ===========
INSERT INTO sys_role (role_id, role_name, role_key, role_sort, status, del_flag, create_time)
VALUES (1, '超级管理员', 'admin', 1, '0', '0', NOW());

-- =========== 初始化用户角色关联 ===========
-- 将admin用户关联到超级管理员角色
INSERT INTO sys_user_role (user_id, role_id)
VALUES (1, 1);
```

### 数据库升级脚本注释

```sql
-- =========== v1.0.0 to v1.1.0 升级脚本 ===========
-- 执行日期: 2025-07-17
-- 修改内容: 添加用户表新字段、优化索引

-- 1. 添加用户表新字段
-- 添加用户类型字段（0普通用户 1管理员）
ALTER TABLE sys_user ADD COLUMN user_type CHAR(1) DEFAULT '0' COMMENT '用户类型（0普通用户 1管理员）';

-- 添加实名认证状态字段（0未认证 1已认证）
ALTER TABLE sys_user ADD COLUMN auth_status CHAR(1) DEFAULT '0' COMMENT '实名认证状态（0未认证 1已认证）';

-- 2. 优化索引
-- 删除旧索引
DROP INDEX idx_old_index ON sys_user;

-- 创建新的复合索引（用于状态+用户类型组合查询）
CREATE INDEX idx_status_type ON sys_user (status, user_type);

-- 3. 更新数据
-- 将已有管理员用户的user_type设置为1
UPDATE sys_user SET user_type = '1' WHERE role_key = 'admin';
```

## 注释模板

### Java 类模板

```java
/**
 * ${DESCRIPTION}
 *
 * @author 抓蛙师
 * @date ${DATE}
 */
public class ${NAME} {

}
```

### Java 方法模板

```java
/**
 * ${DESCRIPTION}
 *
 * @param ${PARAM} ${PARAM_DESCRIPTION}
 * @return ${RETURN_DESCRIPTION}
 */
public ${RETURN_TYPE} ${METHOD_NAME}(${PARAMS}) {

}
```

### TypeScript 函数模板

```typescript
/**
 * ${DESCRIPTION}
 * @param {${PARAM_TYPE}} ${PARAM} ${PARAM_DESCRIPTION}
 * @returns {${RETURN_TYPE}} ${RETURN_DESCRIPTION}
 */
export const ${FUNCTION_NAME} = (${PARAMS}): ${RETURN_TYPE} => {

}
```

### Vue 组件模板

```vue
<!-- ${COMPONENT_NAME} - ${DESCRIPTION} -->
<template>
  <div class="${COMPONENT_CLASS}">
    <!-- 主要内容 -->
  </div>
</template>

<script setup lang="ts" name="${COMPONENT_NAME}">
// =========== 数据定义 ===========

/** ${DESCRIPTION} */
const ${VAR_NAME} = ref()

// =========== 方法定义 ===========

/** ${DESCRIPTION} */
const ${METHOD_NAME} = () => {

}

// =========== 生命周期 ===========

/** 页面加载时执行 */
onMounted(() => {

})
</script>

```

## 注释生成工具

### IDEA 注释模板

**File > Settings > Editor > File and Code Templates**

**1. Class 模板:**

```java
/**
 * ${NAME}
 *
 * @author 抓蛙师
 * @date ${YEAR}-${MONTH}-${DAY}
 */
```

**2. Interface 模板:**

```java
/**
 * ${NAME}
 *
 * @author 抓蛙师
 * @date ${YEAR}-${MONTH}-${DAY}
 */
```

**3. Method 模板:**

快捷键: 输入 `/**` 然后按 Enter

IDEA 会自动生成方法注释模板，包括 @param 和 @return

### VS Code 注释模板

**安装插件:**

1. **Document This** - 自动生成 JSDoc 注释
2. **Comment Translate** - 注释翻译
3. **Better Comments** - 注释高亮

**配置 settings.json:**

```json
{
  "better-comments.tags": [
    {
      "tag": "!",
      "color": "#FF2D00",
      "strikethrough": false,
      "backgroundColor": "transparent"
    },
    {
      "tag": "?",
      "color": "#3498DB",
      "strikethrough": false,
      "backgroundColor": "transparent"
    },
    {
      "tag": "//",
      "color": "#474747",
      "strikethrough": true,
      "backgroundColor": "transparent"
    },
    {
      "tag": "todo",
      "color": "#FF8C00",
      "strikethrough": false,
      "backgroundColor": "transparent"
    },
    {
      "tag": "*",
      "color": "#98C379",
      "strikethrough": false,
      "backgroundColor": "transparent"
    }
  ]
}
```

**使用 Code Snippets:**

**File > Preferences > User Snippets > typescript.json**

```json
{
  "Function Comment": {
    "prefix": "fcom",
    "body": [
      "/**",
      " * ${1:功能描述}",
      " * @param {${2:type}} ${3:param} ${4:参数说明}",
      " * @returns {${5:type}} ${6:返回值说明}",
      " */"
    ],
    "description": "函数注释模板"
  },
  "Interface Comment": {
    "prefix": "icom",
    "body": [
      "/**",
      " * ${1:接口说明}",
      " */"
    ],
    "description": "接口注释模板"
  }
}
```

### JavaDoc 生成工具

**Maven 插件:**

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>3.5.0</version>
    <configuration>
        <encoding>UTF-8</encoding>
        <charset>UTF-8</charset>
        <docencoding>UTF-8</docencoding>
    </configuration>
    <executions>
        <execution>
            <id>attach-javadocs</id>
            <goals>
                <goal>jar</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**生成文档:**

```bash
mvn javadoc:javadoc
```

### TypeDoc 生成工具

**安装:**

```bash
pnpm install -D typedoc
```

**配置 typedoc.json:**

```json
{
  "entryPoints": ["src"],
  "out": "docs/api",
  "exclude": [
    "**/node_modules/**",
    "**/*.spec.ts"
  ],
  "theme": "default",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true
}
```

**生成文档:**

```bash
npx typedoc
```

## 注释最佳实践

### 1. 注释WHY而非WHAT

**❌ 不好的注释:**

```java
// 设置用户名为admin
username = "admin";

// 循环遍历用户列表
for (User user : userList) {
    // ...
}

// 如果状态等于1
if (status == 1) {
    // ...
}
```

**✅ 好的注释:**

```java
// 使用默认管理员账号进行系统初始化
username = "admin";

// 批量更新用户状态，避免单个更新导致的性能问题
for (User user : userList) {
    // ...
}

// 状态为1表示已审核通过，需要发送通知
if (status == 1) {
    sendNotification();
}
```

### 2. 保持注释和代码同步

**❌ 不好的做法:**

```java
/**
 * 获取用户列表
 * @return 用户列表
 */
public PageResult<User> getUsers() {
    // 实际代码已改为分页查询，但注释未更新
    return userService.pageUsers(query);
}
```

**✅ 好的做法:**

```java
/**
 * 分页查询用户列表
 * @param query 查询条件
 * @return 分页结果
 */
public PageResult<User> pageUsers(UserQuery query) {
    return userService.pageUsers(query);
}
```

### 3. 使用TODO、FIXME等标记

```java
// TODO: 待实现的功能
// 需要添加缓存优化性能
public List<User> getUsers() {
    return userMapper.selectList();
}

// FIXME: 需要修复的问题
// 此处可能存在SQL注入风险，需要使用参数化查询
public User getUser(String username) {
    return userMapper.selectOne("SELECT * FROM user WHERE username = '" + username + "'");
}

// HACK: 临时解决方案
// 这是临时方案，后续需要重构为使用消息队列
public void syncData() {
    // 同步逻辑
}

// OPTIMIZE: 性能优化点
// 此处查询可以优化，考虑添加索引
public List<Order> getOrders() {
    return orderMapper.selectList();
}

// DEPRECATED: 已废弃
// @deprecated 请使用 {@link #newMethod()} 替代
public void oldMethod() {
    // ...
}
```

### 4. 复杂逻辑添加示例

**✅ 好的做法:**

```typescript
/**
 * 计算订单总价
 *
 * 计算规则：
 * 1. 商品总价 = Σ(商品单价 × 数量)
 * 2. 优惠金额 = 满减优惠 + 优惠券优惠
 * 3. 运费 = 基础运费（满额免运费）
 * 4. 订单总价 = 商品总价 - 优惠金额 + 运费
 *
 * @param items 商品列表
 * @param coupon 优惠券
 * @param address 收货地址
 * @returns 订单总价
 *
 * @example
 * const items = [
 *   { price: 100, quantity: 2 },
 *   { price: 50, quantity: 1 }
 * ]
 * const coupon = { amount: 20 }
 * const address = { province: '广东' }
 *
 * const total = calculateTotal(items, coupon, address)
 * // total = (100*2 + 50*1) - 20 + 运费
 */
export const calculateTotal = (items, coupon, address) => {
  // 实现逻辑
}
```

### 5. 接口文档化

**✅ 好的做法:**

```java
/**
 * 用户服务接口
 * 提供用户的增删改查和权限管理功能
 *
 * @author 抓蛙师
 * @date 2025-07-15
 */
public interface IUserService {
    /**
     * 分页查询用户列表
     *
     * 支持以下查询条件：
     * - 用户名模糊查询
     * - 手机号精确查询
     * - 状态筛选
     * - 部门筛选
     * - 创建时间范围
     *
     * @param query 查询条件对象
     * @return 分页结果，包含用户列表和总数
     */
    PageResult<UserVo> pageUsers(UserQuery query);

    /**
     * 新增用户
     *
     * 业务规则：
     * 1. 用户名不能重复
     * 2. 手机号不能重复
     * 3. 邮箱不能重复
     * 4. 默认密码为123456
     * 5. 新用户状态默认为正常
     *
     * @param bo 用户业务对象
     * @return 新增成功返回true，失败返回false
     * @throws ServiceException 用户名/手机号/邮箱重复时抛出
     */
    Boolean insertUser(UserBo bo);

    /**
     * 修改用户
     *
     * 注意事项：
     * 1. 不能修改用户名
     * 2. 不能修改为其他用户已使用的手机号/邮箱
     * 3. 超级管理员不能被修改
     *
     * @param bo 用户业务对象
     * @return 修改成功返回true，失败返回false
     * @throws ServiceException 修改超级管理员、手机号/邮箱重复时抛出
     */
    Boolean updateUser(UserBo bo);

    /**
     * 删除用户
     *
     * 删除规则：
     * 1. 超级管理员不能删除
     * 2. 当前登录用户不能删除自己
     * 3. 逻辑删除，不会真正删除数据
     *
     * @param userId 用户ID
     * @return 删除成功返回true，失败返回false
     * @throws ServiceException 删除超级管理员或当前用户时抛出
     */
    Boolean deleteUser(Long userId);

    /**
     * 重置用户密码
     *
     * @param userId 用户ID
     * @param password 新密码（明文，会自动加密）
     * @return 重置成功返回true，失败返回false
     */
    Boolean resetPassword(Long userId, String password);

    /**
     * 检查用户是否有指定权限
     *
     * @param userId 用户ID
     * @param permission 权限字符串，如 "system:user:add"
     * @return 有权限返回true，无权限返回false
     */
    Boolean hasPermission(Long userId, String permission);
}
```

### 6. 避免冗余注释

**❌ 不好的注释:**

```java
// 获取用户ID
public Long getUserId() {
    return this.userId;
}

// 设置用户名
public void setUsername(String username) {
    this.username = username;
}

// i自增1
i++;

// 返回true
return true;
```

**✅ 好的做法:**

```java
// 简单的getter/setter不需要注释
public Long getUserId() {
    return this.userId;
}

public void setUsername(String username) {
    this.username = username;
}

// 简单的代码不需要注释
i++;

return true;
```

### 7. 注释的分层

**模块级注释:**

```java
/**
 * 用户管理模块
 *
 * 本模块提供用户的完整生命周期管理，包括：
 * - 用户注册和登录
 * - 用户信息维护
 * - 用户权限管理
 * - 用户状态管理
 *
 * 技术实现：
 * - 使用Spring Security进行安全控制
 * - 使用JWT进行无状态认证
 * - 使用Redis缓存用户信息
 * - 使用AOP记录操作日志
 *
 * @author 抓蛙师
 * @since 1.0.0
 */
package plus.ruoyi.system.user;
```

**类级注释:**

```java
/**
 * 用户服务实现类
 *
 * 实现了IUserService接口定义的所有用户管理功能
 * 采用缓存优化策略提升查询性能
 *
 * @author 抓蛙师
 * @date 2025-07-15
 */
@Service
public class UserServiceImpl implements IUserService {
}
```

**方法级注释:**

```java
/**
 * 分页查询用户列表
 *
 * @param query 查询条件
 * @return 分页结果
 */
public PageResult<UserVo> pageUsers(UserQuery query) {
}
```

**代码块注释:**

```java
public PageResult<UserVo> pageUsers(UserQuery query) {
    // 构建查询条件
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

    // 用户名模糊查询
    if (StringUtils.isNotBlank(query.getUsername())) {
        wrapper.like(User::getUsername, query.getUsername());
    }

    // 状态筛选
    if (StringUtils.isNotBlank(query.getStatus())) {
        wrapper.eq(User::getStatus, query.getStatus());
    }

    // 执行分页查询
    Page<User> page = userMapper.selectPage(query.build(), wrapper);

    // 转换为VO对象
    return PageResult.build(page, UserVo.class);
}
```

## 常见问题

### 1. 注释太多会影响代码可读性吗？

**问题原因:**

- 过度注释会让代码显得冗余
- 注释和代码混在一起难以阅读
- 注释质量低，只是重复代码

**解决方案:**

✅ 只在必要的地方添加注释
✅ 通过清晰的命名减少注释需求
✅ 注释说明WHY而非WHAT
✅ 定期清理过时的注释

**示例:**

```java
// ❌ 过度注释
// 创建用户对象
User user = new User();
// 设置用户名
user.setUsername("admin");
// 设置密码
user.setPassword("123456");
// 保存用户
userMapper.insert(user);

// ✅ 适度注释
// 创建默认管理员账号
User admin = new User();
admin.setUsername("admin");
admin.setPassword(passwordEncoder.encode("123456"));
userMapper.insert(admin);
```

### 2. 如何处理已过时的注释？

**问题原因:**

- 代码修改后忘记更新注释
- 注释和代码不一致，误导开发者

**解决方案:**

✅ 修改代码时同步更新注释
✅ 定期检查和清理注释
✅ 代码审查时检查注释准确性
✅ 使用@deprecated标记废弃方法

**示例:**

```java
// ❌ 错误做法：保留过时注释
/**
 * 获取所有用户
 * @return 用户列表
 */
public PageResult<User> getUsers(UserQuery query) {
    // 代码已改为分页查询，但注释未更新
    return userMapper.selectPage(query);
}

// ✅ 正确做法：更新或标记
/**
 * 分页查询用户列表
 * @param query 查询条件
 * @return 分页结果
 */
public PageResult<User> pageUsers(UserQuery query) {
    return userMapper.selectPage(query);
}

/**
 * 获取所有用户
 * @return 用户列表
 * @deprecated 请使用 {@link #pageUsers(UserQuery)} 替代
 */
@Deprecated
public List<User> getAllUsers() {
    return userMapper.selectList();
}
```

### 3. 中文注释还是英文注释？

**问题原因:**

- 团队成员语言能力不同
- 国际化需求
- 习惯差异

**解决方案:**

✅ 本项目统一使用中文注释
✅ 专业术语可保留英文
✅ 如有国际化需求，可使用英文
✅ 团队内部达成一致

**示例:**

```java
// ✅ 本项目推荐：中文注释
/**
 * 用户服务接口
 * 提供用户的增删改查和权限管理功能
 *
 * @author 抓蛙师
 * @date 2025-07-15
 */
public interface IUserService {
    /**
     * 分页查询用户列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    PageResult<UserVo> pageUsers(UserQuery query);
}

// 如果是国际化项目，可使用英文
/**
 * User Service Interface
 * Provides CRUD and permission management for users
 *
 * @author Author Name
 * @date 2025-07-15
 */
public interface IUserService {
    /**
     * Query users with pagination
     *
     * @param query Query parameters
     * @return Paginated result
     */
    PageResult<UserVo> pageUsers(UserQuery query);
}
```

### 4. 注释应该写在代码前还是后？

**问题原因:**

- 不同位置的注释有不同用途
- 需要根据场景选择

**解决方案:**

✅ 类、方法、字段注释写在代码前
✅ 行内注释可以写在代码后（简短说明）
✅ 代码块注释写在代码块前
✅ 保持一致性

**示例:**

```java
/**
 * 用户服务实现类
 * 写在类定义之前
 */
public class UserServiceImpl {

    /** 用户Mapper - 写在字段之前 */
    private UserMapper userMapper;

    /**
     * 分页查询用户
     * 写在方法之前
     */
    public PageResult<User> pageUsers(UserQuery query) {
        // 构建查询条件 - 写在代码块之前
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

        wrapper.like(User::getUsername, query.getUsername()); // 用户名模糊查询 - 写在代码之后（简短说明）
        wrapper.eq(User::getStatus, query.getStatus()); // 状态筛选

        return userMapper.selectPage(query.build(), wrapper);
    }
}
```

### 5. 如何为复杂算法添加注释？

**问题原因:**

- 算法逻辑复杂，难以理解
- 需要详细说明算法思路

**解决方案:**

✅ 先说明算法的目的和原理
✅ 分步骤说明算法流程
✅ 关键变量添加注释
✅ 提供示例或参考链接

**示例:**

```java
/**
 * 计算用户信用分
 *
 * 算法说明：
 * 1. 基础分为600分
 * 2. 登录天数加分：每天+1分，最高100分
 * 3. 订单完成加分：每单+2分，最高200分
 * 4. 好评率加分：好评率*100，最高100分
 * 5. 违规扣分：每次违规-50分
 *
 * 最终得分范围：0-1000分
 *
 * @param userId 用户ID
 * @return 信用分
 */
public int calculateCreditScore(Long userId) {
    // 基础分
    int score = 600;

    // 登录天数加分（最高100分）
    int loginDays = userMapper.getLoginDays(userId);
    score += Math.min(loginDays, 100);

    // 订单完成加分（每单2分，最高200分）
    int completedOrders = orderMapper.getCompletedCount(userId);
    score += Math.min(completedOrders * 2, 200);

    // 好评率加分（最高100分）
    double praiseRate = orderMapper.getPraiseRate(userId);
    score += (int) Math.min(praiseRate * 100, 100);

    // 违规扣分（每次-50分）
    int violations = userMapper.getViolationCount(userId);
    score -= violations * 50;

    // 确保分数在0-1000范围内
    return Math.max(0, Math.min(score, 1000));
}
```

## 总结

本文档详细介绍了 RuoYi-Plus-UniApp 项目的注释规范，包括：

1. **注释基本原则** - 何时需要注释、何时不需要、注释的黄金法则
2. **Java 注释规范** - 类、方法、字段、常量、枚举、代码块注释
3. **TypeScript 注释规范** - 函数、接口、类型、变量、Composable注释
4. **Vue 组件注释规范** - 模板、脚本、样式注释
5. **配置文件注释规范** - JSON、YAML、Properties配置注释
6. **SQL 脚本注释规范** - 表定义、索引、数据初始化、升级脚本注释
7. **注释模板** - Java、TypeScript、Vue组件注释模板
8. **注释生成工具** - IDEA、VS Code、JavaDoc、TypeDoc工具配置
9. **注释最佳实践** - 7个最佳实践指南
10. **常见问题** - 5个常见问题及解决方案

遵循这些规范，可以：

- ✅ 提高代码可读性
- ✅ 便于代码维护
- ✅ 知识传承更高效
- ✅ 自动生成API文档
- ✅ 减少团队沟通成本
- ✅ 提升代码质量

**记住**: 好的注释是代码的一部分，它应该帮助理解代码，而不是重复代码。注释WHY，而非WHAT。

---

**参考资料:**

- Java注释规范: https://www.oracle.com/java/technologies/javase/codeconventions-comments.html
- JSDoc规范: https://jsdoc.app/
- TSDoc规范: https://tsdoc.org/
- Google Java Style Guide: https://google.github.io/styleguide/javaguide.html

**文档维护:**

- 创建时间: 2025-11-02
- 最后更新: 2025-11-02
- 维护者: RuoYi-Plus-UniApp 开发团队
- 联系方式: 770492966 (微信/QQ)

---

*本文档将持续更新和完善，欢迎提出建议和改进意见。*
