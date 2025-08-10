# 通用服务接口

core 模块定义了一系列通用服务接口，为系统各模块提供统一的数据访问和业务处理规范。这些接口采用依赖注入的方式，实现了模块间的松耦合设计。

## 设计理念

### 接口优先原则

所有业务逻辑都通过接口定义，具体实现由各业务模块提供，确保了：

- **模块解耦**：core 模块不依赖具体实现
- **灵活扩展**：可以轻松替换不同的实现方式
- **统一规范**：所有模块遵循相同的接口契约

### 默认方法支持

接口中大量使用 Java 8+ 的默认方法特性，提供：

- **向后兼容**：新增方法不会破坏现有实现
- **便捷重载**：提供多种参数形式的便捷方法
- **降级处理**：为可选功能提供默认实现

## 核心服务接口

### 用户服务 (UserService)

用户相关的数据查询和管理服务。

#### 基础查询方法

```java
/**
 * 通过用户ID查询用户账户
 */
String getUserNameById(Long userId);

/**
 * 通过用户ID查询用户昵称
 */
String getNickNameById(Long userId);

/**
 * 通过用户ID查询用户头像
 */
String getAvatarById(Long userId);
```

#### 批量查询方法

```java
/**
 * 通过用户ID列表查询用户昵称列表
 * @param userIds 用户ID，多个用逗号隔开
 * @return 用户昵称，多个用逗号隔开
 */
String getNickNamesByIds(String userIds);

/**
 * 通过用户ID查询用户列表
 */
List<UserDTO> listUsersByIds(List<Long> userIds);
```

#### 关联查询方法

```java
/**
 * 通过角色ID查询用户
 */
List<UserDTO> listUsersByRoleIds(List<Long> roleIds);

/**
 * 通过部门ID查询用户
 */
List<UserDTO> listUsersByDeptIds(List<Long> deptIds);

/**
 * 通过岗位ID查询用户
 */
List<UserDTO> listUsersByPostIds(List<Long> postIds);
```

#### 映射关系方法

```java
/**
 * 根据用户ID列表查询用户名称映射关系
 * @return Map，key为用户ID，value为对应的用户名称
 */
Map<Long, String> mapUserNames(List<Long> userIds);

/**
 * 根据角色ID列表查询角色名称映射关系
 */
Map<Long, String> mapRoleNames(List<Long> roleIds);
```

#### 使用示例

```java
@Service
public class BusinessService {

    @Autowired
    private UserService userService;

    public void processUserData() {
        // 单个查询
        String userName = userService.getUserNameById(1L);

        // 批量查询
        List<Long> userIds = Arrays.asList(1L, 2L, 3L);
        List<UserDTO> users = userService.listUsersByIds(userIds);

        // 映射关系
        Map<Long, String> userNameMap = userService.mapUserNames(userIds);

        // 关联查询
        List<UserDTO> deptUsers = userService.listUsersByDeptIds(Arrays.asList(1L, 2L));
    }
}
```

### 字典服务 (DictService)

系统字典数据的查询和转换服务。

#### 核心转换方法

```java
/**
 * 根据字典类型和字典值获取字典标签
 * @param dictType 字典类型，如 "sys_user_sex"
 * @param dictValue 字典值，如 "1"
 * @return 字典标签，如 "男"
 */
String getDictLabel(String dictType, String dictValue);

/**
 * 根据字典类型和字典标签获取字典值（反向查询）
 * @param dictType 字典类型
 * @param dictLabel 字典标签，如 "男"
 * @return 字典值，如 "1"
 */
String getDictValue(String dictType, String dictLabel);
```

#### 批量转换方法

```java
/**
 * 支持多值转换，使用指定分隔符
 * @param dictType 字典类型
 * @param dictValue 字典值，支持多个值用分隔符分割，如 "1,2"
 * @param separator 分隔符，默认为逗号
 * @return 字典标签，如 "男,女"
 */
String getDictLabel(String dictType, String dictValue, String separator);
```

#### 数据获取方法

```java
/**
 * 获取字典下所有的字典值与标签映射
 * @param dictType 字典类型
 * @return Map，key为字典值，value为字典标签
 */
Map<String, String> getAllDictByDictType(String dictType);

/**
 * 根据字典类型查询字典数据列表
 */
List<DictDataDTO> getDictData(String dictType);

/**
 * 根据字典类型查询详细信息
 */
DictTypeDTO getDictType(String dictType);
```

#### 使用示例

```java
@Service
public class UserBusinessService {
    
    @Autowired
    private DictService dictService;
    
    public void processUserData() {
        // 单值转换
        String genderLabel = dictService.getDictLabel("sys_user_sex", "1");
        // 结果: "男"
        
        // 多值转换
        String statusLabels = dictService.getDictLabel("sys_user_status", "1,2", ",");
        // 结果: "正常,停用"
        
        // 反向查询
        String genderValue = dictService.getDictValue("sys_user_sex", "男");
        // 结果: "1"
        
        // 获取所有字典项
        Map<String, String> genderDict = dictService.getAllDictByDictType("sys_user_sex");
        // 结果: {"0": "女", "1": "男", "2": "未知"}
    }
}
```

#### 常用字典类型

```java
// 系统基础字典
sys_user_sex      // 用户性别
sys_enable_status // 启用状态
sys_user_status   // 用户状态
sys_boolean_flag  // 逻辑标志

// 业务字典
sys_payment_method // 支付方式
sys_order_status   // 订单状态
sys_message_type   // 消息类型
sys_notice_type    // 通知类型
```

### 部门服务 (DeptService)

部门组织架构的查询服务。

```java
public interface DeptService {
    /**
     * 通过部门ID查询部门名称
     * @param deptIds 部门ID串，逗号分隔
     * @return 部门名称串，逗号分隔
     */
    String getDeptNameByIds(String deptIds);

    /**
     * 根据部门ID查询部门负责人
     * @param deptId 部门ID
     * @return 负责人用户ID
     */
    Long getDeptLeaderById(Long deptId);

    /**
     * 查询所有正常状态的部门
     * @return 部门列表
     */
    List<DeptDTO> listNormalDepts();
}
```

### 配置服务 (ConfigService)

系统参数配置的查询服务。

#### 基础配置查询

```java
/**
 * 根据参数key获取参数值
 * @param configKey 参数key，如 "sys.account.registerUser"
 * @return 参数值
 */
String getConfigValue(String configKey);
```

#### 默认值支持

```java
/**
 * 根据参数key获取参数值，支持默认值
 * @param configKey 参数key
 * @param defaultValue 默认值
 * @return 参数值，如果为空则返回默认值
 */
default String getConfigValue(String configKey, String defaultValue) {
    String value = getConfigValue(configKey);
    return StringUtils.isNotBlank(value) ? value : defaultValue;
}
```

#### 类型转换方法

```java
/**
 * 根据参数key获取布尔参数值
 * @param configKey 参数key
 * @return 布尔参数值
 */
default boolean getBooleanValue(String configKey) {
    return BooleanUtil.toBoolean(getConfigValue(configKey));
}

/**
 * 根据参数key获取布尔参数值，支持默认值
 */
default boolean getBooleanValue(String configKey, boolean defaultValue) {
    String value = getConfigValue(configKey);
    return StringUtils.isNotBlank(value) ? BooleanUtil.toBoolean(value) : defaultValue;
}
```

#### 使用示例

```java
@Service
public class SystemConfigService {
    
    @Autowired
    private ConfigService configService;
    
    public void checkSystemConfig() {
        // 基础查询
        String siteName = configService.getConfigValue("sys.index.skinName");
        
        // 带默认值查询
        String uploadPath = configService.getConfigValue("sys.uploadPath", "/upload");
        
        // 布尔值查询
        boolean registerEnabled = configService.getBooleanValue("sys.account.registerUser");
        
        // 布尔值带默认值查询
        boolean captchaEnabled = configService.getBooleanValue("sys.account.captchaEnabled", true);
    }
}
```

#### 常用配置项

```java
// 系统基础配置
sys.index.skinName          // 系统皮肤
sys.account.registerUser    // 是否允许注册
sys.account.captchaEnabled  // 是否启用验证码
sys.uploadPath              // 上传路径

// 安全配置
sys.user.initPassword       // 用户初始密码
sys.account.maxRetryCount    // 最大重试次数
sys.account.lockTime         // 锁定时间（分钟）
```

### 权限服务 (PermissionService)

用户权限信息的查询服务。

```java
public interface PermissionService {
    /**
     * 获取角色数据权限列表
     * @param userId 用户id
     * @return 角色权限信息
     */
    Set<String> listRolePermissions(Long userId);

    /**
     * 获取菜单数据权限列表
     * @param userId 用户id
     * @return 菜单权限信息
     */
    Set<String> listMenuPermissions(Long userId);
}
```

### 文件存储服务 (OssService)

对象存储服务的查询接口。

```java
public interface OssService {
    /**
     * 通过ossId查询对应的url
     * @param ossIds ossId串，逗号分隔
     * @return url串，逗号分隔
     */
    String getUrlsByIds(String ossIds);

    /**
     * 通过ossId查询列表
     * @param ossIds ossId串，逗号分隔
     * @return OSS对象列表
     */
    List<OssDTO> listOssByIds(String ossIds);

    /**
     * 根据目录id查询目录名称
     * @param directoryId 目录id
     * @return 目录名称
     */
    String getDirectoryNameById(Long directoryId);
}
```

## 支付与平台服务

### 支付服务 (PaymentService)

支付配置的查询和管理服务。

#### 核心查询方法

```java
/**
 * 根据商户号获取支付配置
 * @param mchId 商户号
 * @return 支付配置，如果不存在返回null
 */
PaymentDTO getByMchId(String mchId);

/**
 * 根据支付配置ID获取支付配置
 * @param paymentId 支付配置ID
 * @return 支付配置，如果不存在返回null
 */
PaymentDTO getById(Long paymentId);
```

#### 分类查询方法

```java
/**
 * 根据支付类型获取支付配置列表
 * @param type 支付类型（如：WECHAT, ALIPAY等）
 * @param tenantId 租户id
 * @return 支付配置列表
 */
List<PaymentDTO> listPaymentByType(String type, String tenantId);
```

#### 验证方法

```java
/**
 * 检查商户号是否存在且有效
 * @param mchId 商户号
 * @return true-存在且有效，false-不存在或无效
 */
boolean existsValidMchId(String mchId);

/**
 * 获取支付配置总数
 * @return 支付配置总数
 */
long countPayments();
```

#### 使用示例

```java
@Service
public class PaymentBusinessService {
    
    @Autowired
    private PaymentService paymentService;
    
    public void processPayment(String mchId) {
        // 根据商户号查询配置
        PaymentDTO payment = paymentService.getByMchId(mchId);
        if (payment != null && payment.isEnabled()) {
            // 处理支付逻辑
            if (payment.isWechatPayment()) {
                // 微信支付处理
            } else if (payment.isAlipayPayment()) {
                // 支付宝支付处理
            }
        }
        
        // 查询租户下的微信支付配置
        List<PaymentDTO> wechatPayments = paymentService.listPaymentByType("WECHAT", "000000");
        
        // 验证商户号
        boolean isValid = paymentService.existsValidMchId(mchId);
    }
}
```

#### 支付类型说明

```java
// 主要支付类型
WECHAT    // 微信支付
ALIPAY    // 支付宝支付
UNIONPAY  // 银联支付
BALANCE   // 余额支付
```

### 平台服务 (PlatformService)

多平台应用配置的管理服务。

```java
public interface PlatformService {
    /**
     * 根据平台类型获取平台配置列表
     * @param type 平台类型（如：mp-weixin, mp-alipay）
     * @param tenantId 租户id
     * @return 平台配置列表
     */
    default List<PlatformDTO> listPlatformsByType(String type, String tenantId) {
        return Collections.emptyList();
    }

    /**
     * 根据appid和平台类型获取平台配置
     * @param appid 应用ID
     * @param type 平台类型
     * @return 平台配置
     */
    default PlatformDTO getPlatformByAppidAndType(String appid, String type) {
        return null;
    }

    /**
     * 根据appid获取平台配置（跨租户查询）
     * @param appid 应用ID
     * @param tenantId 租户id
     * @return 平台配置
     */
    default PlatformDTO getPlatformByAppid(String appid, String tenantId) {
        return null;
    }
}
```

### 租户服务 (TenantService)

多租户环境下的租户信息服务。

```java
public interface TenantService {
    /**
     * 获取当前租户id
     * @return 租户id
     */
    String getTenantId();

    /**
     * 根据请求获取租户ID
     * 专门处理从请求中提取租户信息的逻辑：域名识别 + 请求头获取
     * @return 租户ID，如果获取不到返回null
     */
    String getTenantIdByRequest();
}
```

## 其他服务接口

### 角色服务 (RoleService)

```java
public interface RoleService {
    // 当前为空接口，预留扩展
}
```

### 岗位服务 (PostService)

```java
public interface PostService {
    // 当前为空接口，预留扩展
}
```

### OSS配置服务 (OssConfigService)

```java
public interface OssConfigService {
    /**
     * 初始化OSS配置
     */
    void initOssConfig();
}
```

## 使用指南

### 1. 依赖注入使用

```java
@Service
@RequiredArgsConstructor
public class BusinessService {

    private final UserService userService;

    private final DictService dictService;

    private final ConfigService configService;

    // 业务逻辑实现
}
```

### 2. 条件注入

```java
@Service
@RequiredArgsConstructor
@ConditionalOnBean(PaymentService.class)
public class PaymentBusinessService {

    private final PaymentService paymentService;

    // 只有当PaymentService存在时才创建此服务
}
```

### 3. 默认实现

如果某个服务接口没有具体实现，可以提供默认的空实现：

```java
@Service
@ConditionalOnMissingBean(PaymentService.class)
public class DefaultPaymentService implements PaymentService {

    @Override
    public PaymentDTO getByMchId(String mchId) {
        return null; // 默认返回空
    }

    // 其他方法的默认实现
}
```

## 设计优势

- **松耦合**：各模块只依赖接口，不依赖具体实现
- **可测试**：便于进行单元测试和Mock
- **可扩展**：新增功能只需扩展接口，不影响现有代码
- **统一规范**：所有模块遵循相同的接口设计原则
- **向后兼容**：使用默认方法确保接口演进的兼容性

这些通用服务接口构成了系统的基础服务层，为上层业务逻辑提供了统一、规范的数据访问方式。
