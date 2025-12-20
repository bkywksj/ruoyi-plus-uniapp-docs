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

## 服务层设计模式

### 门面模式 (Facade Pattern)

服务层采用门面模式，为复杂的业务逻辑提供统一的访问入口：

```java
/**
 * 订单门面服务
 * 整合多个子服务，提供统一的订单处理入口
 */
@Service
@RequiredArgsConstructor
public class OrderFacadeService {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final UserService userService;
    private final DictService dictService;

    /**
     * 创建订单（门面方法）
     * 整合订单创建、库存扣减、用户通知等多个操作
     */
    @Transactional(rollbackFor = Exception.class)
    public OrderResult createOrder(OrderCreateDTO createDTO) {
        // 1. 验证用户
        UserDTO user = userService.listUsersByIds(
            Collections.singletonList(createDTO.getUserId())
        ).stream().findFirst().orElseThrow(() ->
            new ServiceException("用户不存在")
        );

        // 2. 检查库存
        boolean stockAvailable = inventoryService.checkStock(
            createDTO.getProductId(),
            createDTO.getQuantity()
        );
        if (!stockAvailable) {
            throw new ServiceException("库存不足");
        }

        // 3. 扣减库存
        inventoryService.deductStock(
            createDTO.getProductId(),
            createDTO.getQuantity()
        );

        // 4. 创建订单
        Order order = orderService.create(createDTO);

        // 5. 获取状态标签
        String statusLabel = dictService.getDictLabel(
            "sys_order_status",
            order.getStatus()
        );

        return OrderResult.builder()
            .orderId(order.getId())
            .orderNo(order.getOrderNo())
            .statusLabel(statusLabel)
            .userName(user.getNickName())
            .build();
    }
}
```

### 策略模式 (Strategy Pattern)

针对不同业务场景，服务层支持策略模式实现：

```java
/**
 * 支付策略接口
 */
public interface PayStrategy {

    /**
     * 获取支付类型
     */
    String getPayType();

    /**
     * 执行支付
     */
    PayResult pay(PayRequest request);

    /**
     * 查询支付结果
     */
    PayQueryResult query(String orderNo);

    /**
     * 退款
     */
    RefundResult refund(RefundRequest request);
}

/**
 * 微信支付策略实现
 */
@Service
public class WechatPayStrategy implements PayStrategy {

    @Override
    public String getPayType() {
        return "WECHAT";
    }

    @Override
    public PayResult pay(PayRequest request) {
        // 微信支付具体实现
        return new PayResult();
    }

    @Override
    public PayQueryResult query(String orderNo) {
        // 查询微信支付结果
        return new PayQueryResult();
    }

    @Override
    public RefundResult refund(RefundRequest request) {
        // 微信退款实现
        return new RefundResult();
    }
}

/**
 * 支付宝支付策略实现
 */
@Service
public class AlipayStrategy implements PayStrategy {

    @Override
    public String getPayType() {
        return "ALIPAY";
    }

    @Override
    public PayResult pay(PayRequest request) {
        // 支付宝支付具体实现
        return new PayResult();
    }

    @Override
    public PayQueryResult query(String orderNo) {
        // 查询支付宝支付结果
        return new PayQueryResult();
    }

    @Override
    public RefundResult refund(RefundRequest request) {
        // 支付宝退款实现
        return new RefundResult();
    }
}

/**
 * 支付策略上下文
 */
@Component
public class PayStrategyContext {

    private final Map<String, PayStrategy> strategyMap;

    public PayStrategyContext(List<PayStrategy> strategies) {
        this.strategyMap = strategies.stream()
            .collect(Collectors.toMap(
                PayStrategy::getPayType,
                Function.identity()
            ));
    }

    /**
     * 获取支付策略
     */
    public PayStrategy getStrategy(String payType) {
        PayStrategy strategy = strategyMap.get(payType);
        if (strategy == null) {
            throw new ServiceException("不支持的支付类型: " + payType);
        }
        return strategy;
    }

    /**
     * 执行支付
     */
    public PayResult pay(String payType, PayRequest request) {
        return getStrategy(payType).pay(request);
    }
}
```

### 模板方法模式 (Template Method Pattern)

服务层基类定义通用处理流程：

```java
/**
 * 抽象业务服务基类
 * 定义通用的业务处理模板
 */
public abstract class AbstractBusinessService<T, R> {

    /**
     * 执行业务处理（模板方法）
     */
    public final R execute(T request) {
        // 1. 前置校验
        validate(request);

        // 2. 前置处理
        beforeExecute(request);

        // 3. 核心业务逻辑
        R result = doExecute(request);

        // 4. 后置处理
        afterExecute(request, result);

        // 5. 返回结果
        return result;
    }

    /**
     * 参数校验（可重写）
     */
    protected void validate(T request) {
        // 默认无校验
    }

    /**
     * 前置处理（可重写）
     */
    protected void beforeExecute(T request) {
        // 默认无处理
    }

    /**
     * 核心业务逻辑（子类必须实现）
     */
    protected abstract R doExecute(T request);

    /**
     * 后置处理（可重写）
     */
    protected void afterExecute(T request, R result) {
        // 默认无处理
    }
}

/**
 * 订单创建服务（模板方法实现）
 */
@Service
@RequiredArgsConstructor
public class OrderCreateService extends AbstractBusinessService<OrderCreateDTO, Order> {

    private final OrderMapper orderMapper;
    private final UserService userService;

    @Override
    protected void validate(OrderCreateDTO request) {
        if (request.getProductId() == null) {
            throw new ServiceException("商品ID不能为空");
        }
        if (request.getQuantity() <= 0) {
            throw new ServiceException("购买数量必须大于0");
        }
    }

    @Override
    protected void beforeExecute(OrderCreateDTO request) {
        // 设置用户信息
        String userName = userService.getUserNameById(request.getUserId());
        request.setUserName(userName);
    }

    @Override
    protected Order doExecute(OrderCreateDTO request) {
        Order order = new Order();
        BeanUtils.copyProperties(request, order);
        order.setOrderNo(generateOrderNo());
        order.setStatus("0");
        orderMapper.insert(order);
        return order;
    }

    @Override
    protected void afterExecute(OrderCreateDTO request, Order result) {
        // 发送订单创建通知
        log.info("订单创建成功: {}", result.getOrderNo());
    }

    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis();
    }
}
```

## 服务组合与编排

### 服务组合器

```java
/**
 * 服务组合器
 * 将多个服务调用组合成一个完整的业务流程
 */
@Component
@RequiredArgsConstructor
public class ServiceComposer {

    private final UserService userService;
    private final DictService dictService;
    private final OssService ossService;

    /**
     * 组合用户详情信息
     * 将用户基础信息、字典翻译、头像URL等组合在一起
     */
    public UserDetailVO composeUserDetail(Long userId) {
        // 并行获取各项数据
        CompletableFuture<List<UserDTO>> userFuture = CompletableFuture.supplyAsync(() ->
            userService.listUsersByIds(Collections.singletonList(userId))
        );

        UserDTO user = userFuture.join().stream()
            .findFirst()
            .orElseThrow(() -> new ServiceException("用户不存在"));

        // 组合详情
        UserDetailVO detail = new UserDetailVO();
        detail.setUserId(user.getUserId());
        detail.setUserName(user.getUserName());
        detail.setNickName(user.getNickName());

        // 字典翻译
        detail.setSexLabel(dictService.getDictLabel("sys_user_sex", user.getSex()));
        detail.setStatusLabel(dictService.getDictLabel("sys_user_status", user.getStatus()));

        // 获取头像URL
        if (StringUtils.isNotBlank(user.getAvatar())) {
            detail.setAvatarUrl(ossService.getUrlsByIds(user.getAvatar()));
        }

        return detail;
    }

    /**
     * 批量组合用户信息
     */
    public List<UserDetailVO> composeUserDetails(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Collections.emptyList();
        }

        // 批量查询用户
        List<UserDTO> users = userService.listUsersByIds(userIds);

        // 预加载字典数据
        Map<String, String> sexDict = dictService.getAllDictByDictType("sys_user_sex");
        Map<String, String> statusDict = dictService.getAllDictByDictType("sys_user_status");

        // 批量获取头像URL
        String ossIds = users.stream()
            .map(UserDTO::getAvatar)
            .filter(StringUtils::isNotBlank)
            .collect(Collectors.joining(","));

        Map<String, String> ossUrlMap = new HashMap<>();
        if (StringUtils.isNotBlank(ossIds)) {
            List<OssDTO> ossList = ossService.listOssByIds(ossIds);
            ossUrlMap = ossList.stream()
                .collect(Collectors.toMap(
                    o -> String.valueOf(o.getOssId()),
                    OssDTO::getUrl
                ));
        }

        // 组合结果
        Map<String, String> finalOssUrlMap = ossUrlMap;
        return users.stream().map(user -> {
            UserDetailVO detail = new UserDetailVO();
            detail.setUserId(user.getUserId());
            detail.setUserName(user.getUserName());
            detail.setNickName(user.getNickName());
            detail.setSexLabel(sexDict.get(user.getSex()));
            detail.setStatusLabel(statusDict.get(user.getStatus()));
            detail.setAvatarUrl(finalOssUrlMap.get(user.getAvatar()));
            return detail;
        }).collect(Collectors.toList());
    }
}
```

### 流程编排器

```java
/**
 * 业务流程编排器
 * 支持复杂业务流程的编排执行
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BusinessFlowOrchestrator {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * 编排执行业务流程
     */
    public <T> FlowResult<T> orchestrate(BusinessFlow<T> flow) {
        FlowContext context = new FlowContext();
        context.setFlowId(UUID.randomUUID().toString());
        context.setStartTime(LocalDateTime.now());

        try {
            // 执行前置步骤
            for (FlowStep<T> step : flow.getPreSteps()) {
                executeStep(step, context);
            }

            // 执行主要步骤
            T result = null;
            for (FlowStep<T> step : flow.getMainSteps()) {
                result = executeStep(step, context);
            }

            // 执行后置步骤
            for (FlowStep<T> step : flow.getPostSteps()) {
                executeStep(step, context);
            }

            context.setEndTime(LocalDateTime.now());
            context.setSuccess(true);

            // 发布流程完成事件
            eventPublisher.publishEvent(new FlowCompletedEvent(context));

            return FlowResult.success(result, context);

        } catch (Exception e) {
            context.setEndTime(LocalDateTime.now());
            context.setSuccess(false);
            context.setErrorMessage(e.getMessage());

            // 执行补偿步骤
            for (FlowStep<T> step : flow.getCompensateSteps()) {
                try {
                    executeStep(step, context);
                } catch (Exception ex) {
                    log.error("补偿步骤执行失败", ex);
                }
            }

            // 发布流程失败事件
            eventPublisher.publishEvent(new FlowFailedEvent(context, e));

            return FlowResult.failure(e.getMessage(), context);
        }
    }

    private <T> T executeStep(FlowStep<T> step, FlowContext context) {
        log.info("执行步骤: {}", step.getName());
        StepResult<T> result = step.execute(context);
        context.addStepResult(step.getName(), result);
        if (!result.isSuccess()) {
            throw new FlowException("步骤执行失败: " + step.getName());
        }
        return result.getData();
    }
}

/**
 * 业务流程定义
 */
@Data
@Builder
public class BusinessFlow<T> {
    private String flowName;
    private List<FlowStep<T>> preSteps;
    private List<FlowStep<T>> mainSteps;
    private List<FlowStep<T>> postSteps;
    private List<FlowStep<T>> compensateSteps;
}

/**
 * 流程步骤接口
 */
public interface FlowStep<T> {
    String getName();
    StepResult<T> execute(FlowContext context);
}
```

## 服务事务管理

### 声明式事务

```java
/**
 * 服务事务管理示例
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionalService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final InventoryMapper inventoryMapper;

    /**
     * 默认事务传播行为（REQUIRED）
     * 如果当前存在事务则加入，否则创建新事务
     */
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderDTO orderDTO) {
        // 创建订单
        Order order = new Order();
        BeanUtils.copyProperties(orderDTO, order);
        orderMapper.insert(order);

        // 创建订单项
        for (OrderItemDTO itemDTO : orderDTO.getItems()) {
            OrderItem item = new OrderItem();
            BeanUtils.copyProperties(itemDTO, item);
            item.setOrderId(order.getId());
            orderItemMapper.insert(item);

            // 扣减库存
            deductInventory(itemDTO.getProductId(), itemDTO.getQuantity());
        }
    }

    /**
     * 独立事务（REQUIRES_NEW）
     * 始终创建新事务，挂起当前事务
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void deductInventory(Long productId, Integer quantity) {
        Inventory inventory = inventoryMapper.selectById(productId);
        if (inventory.getStock() < quantity) {
            throw new ServiceException("库存不足");
        }
        inventory.setStock(inventory.getStock() - quantity);
        inventoryMapper.updateById(inventory);
    }

    /**
     * 嵌套事务（NESTED）
     * 如果当前存在事务，则在嵌套事务内执行
     */
    @Transactional(propagation = Propagation.NESTED, rollbackFor = Exception.class)
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderMapper.selectById(orderId);
        order.setStatus(status);
        orderMapper.updateById(order);
    }

    /**
     * 只读事务（优化查询性能）
     */
    @Transactional(readOnly = true)
    public OrderVO getOrderDetail(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        List<OrderItem> items = orderItemMapper.selectByOrderId(orderId);
        return OrderVO.of(order, items);
    }

    /**
     * 指定异常回滚
     */
    @Transactional(
        rollbackFor = {ServiceException.class, DataAccessException.class},
        noRollbackFor = {BusinessWarningException.class}
    )
    public void processOrderWithSpecificRollback(OrderDTO orderDTO) {
        // 业务逻辑
    }

    /**
     * 超时事务
     */
    @Transactional(timeout = 30, rollbackFor = Exception.class)
    public void longRunningProcess() {
        // 长时间运行的业务逻辑
        // 超过30秒将抛出事务超时异常
    }
}
```

### 编程式事务

```java
/**
 * 编程式事务管理
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProgrammaticTransactionService {

    private final TransactionTemplate transactionTemplate;
    private final PlatformTransactionManager transactionManager;
    private final OrderMapper orderMapper;

    /**
     * 使用TransactionTemplate管理事务
     */
    public Order createOrderWithTemplate(OrderDTO orderDTO) {
        return transactionTemplate.execute(status -> {
            try {
                Order order = new Order();
                BeanUtils.copyProperties(orderDTO, order);
                orderMapper.insert(order);
                return order;
            } catch (Exception e) {
                status.setRollbackOnly();
                throw new ServiceException("创建订单失败", e);
            }
        });
    }

    /**
     * 使用TransactionManager手动管理事务
     */
    public void manualTransactionControl(List<OrderDTO> orders) {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setName("batchOrderTransaction");
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        def.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);

        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            for (OrderDTO orderDTO : orders) {
                Order order = new Order();
                BeanUtils.copyProperties(orderDTO, order);
                orderMapper.insert(order);
            }
            transactionManager.commit(status);
            log.info("批量订单创建成功，共{}条", orders.size());
        } catch (Exception e) {
            transactionManager.rollback(status);
            log.error("批量订单创建失败，已回滚", e);
            throw new ServiceException("批量创建订单失败", e);
        }
    }

    /**
     * 事务回调模式
     */
    public void executeInTransaction(Runnable action) {
        transactionTemplate.executeWithoutResult(status -> {
            try {
                action.run();
            } catch (Exception e) {
                status.setRollbackOnly();
                throw new RuntimeException(e);
            }
        });
    }
}
```

### 分布式事务

```java
/**
 * 分布式事务处理
 * 使用本地消息表实现最终一致性
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DistributedTransactionService {

    private final OrderMapper orderMapper;
    private final LocalMessageMapper messageMapper;
    private final RabbitTemplate rabbitTemplate;

    /**
     * 带本地消息表的订单创建
     * 保证订单创建和消息发送的原子性
     */
    @Transactional(rollbackFor = Exception.class)
    public Order createOrderWithMessage(OrderDTO orderDTO) {
        // 1. 创建订单
        Order order = new Order();
        BeanUtils.copyProperties(orderDTO, order);
        orderMapper.insert(order);

        // 2. 写入本地消息表
        LocalMessage message = new LocalMessage();
        message.setMessageId(UUID.randomUUID().toString());
        message.setMessageType("ORDER_CREATED");
        message.setMessageContent(JsonUtils.toJsonString(order));
        message.setStatus("PENDING");
        message.setRetryCount(0);
        messageMapper.insert(message);

        return order;
    }

    /**
     * 消息发送定时任务
     * 定时扫描本地消息表，发送未处理的消息
     */
    @Scheduled(fixedDelay = 5000)
    public void sendPendingMessages() {
        List<LocalMessage> messages = messageMapper.selectPendingMessages(100);

        for (LocalMessage message : messages) {
            try {
                // 发送消息
                rabbitTemplate.convertAndSend(
                    "order.exchange",
                    "order.created",
                    message.getMessageContent()
                );

                // 更新消息状态
                message.setStatus("SENT");
                message.setSentTime(LocalDateTime.now());
                messageMapper.updateById(message);

            } catch (Exception e) {
                log.error("消息发送失败: {}", message.getMessageId(), e);
                message.setRetryCount(message.getRetryCount() + 1);
                if (message.getRetryCount() >= 3) {
                    message.setStatus("FAILED");
                }
                messageMapper.updateById(message);
            }
        }
    }
}

/**
 * TCC模式事务协调器
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TccTransactionCoordinator {

    private final List<TccParticipant> participants;

    /**
     * 执行TCC事务
     */
    public void executeTcc(TccContext context) {
        // Try阶段
        List<TccParticipant> triedParticipants = new ArrayList<>();
        try {
            for (TccParticipant participant : participants) {
                participant.tryExecute(context);
                triedParticipants.add(participant);
            }

            // Confirm阶段
            for (TccParticipant participant : triedParticipants) {
                participant.confirm(context);
            }

        } catch (Exception e) {
            log.error("TCC事务执行失败，开始Cancel", e);

            // Cancel阶段（逆序执行）
            Collections.reverse(triedParticipants);
            for (TccParticipant participant : triedParticipants) {
                try {
                    participant.cancel(context);
                } catch (Exception ex) {
                    log.error("Cancel执行失败", ex);
                }
            }

            throw new ServiceException("分布式事务执行失败", e);
        }
    }
}

/**
 * TCC参与者接口
 */
public interface TccParticipant {
    void tryExecute(TccContext context);
    void confirm(TccContext context);
    void cancel(TccContext context);
}
```

## 服务缓存策略

### 基于注解的缓存

```java
/**
 * 服务缓存使用示例
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CachedUserService {

    private final UserMapper userMapper;
    private final DictService dictService;

    /**
     * 缓存用户信息
     * 使用用户ID作为缓存key
     */
    @Cacheable(
        cacheNames = "user:detail",
        key = "#userId",
        unless = "#result == null"
    )
    public UserDTO getUserById(Long userId) {
        log.info("从数据库查询用户: {}", userId);
        return userMapper.selectDtoById(userId);
    }

    /**
     * 更新用户信息并清除缓存
     */
    @CacheEvict(
        cacheNames = "user:detail",
        key = "#user.userId"
    )
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(UserDTO user) {
        userMapper.updateById(user.toEntity());
    }

    /**
     * 更新用户信息并刷新缓存
     */
    @CachePut(
        cacheNames = "user:detail",
        key = "#user.userId"
    )
    @Transactional(rollbackFor = Exception.class)
    public UserDTO updateAndRefreshCache(UserDTO user) {
        userMapper.updateById(user.toEntity());
        return user;
    }

    /**
     * 批量清除缓存
     */
    @CacheEvict(
        cacheNames = "user:detail",
        allEntries = true
    )
    public void clearAllUserCache() {
        log.info("清除所有用户缓存");
    }

    /**
     * 组合缓存操作
     */
    @Caching(
        cacheable = {
            @Cacheable(cacheNames = "user:detail", key = "#userId")
        },
        evict = {
            @CacheEvict(cacheNames = "user:list", allEntries = true)
        }
    )
    public UserDTO getAndEvictList(Long userId) {
        return userMapper.selectDtoById(userId);
    }

    /**
     * 条件缓存
     * 只缓存状态正常的用户
     */
    @Cacheable(
        cacheNames = "user:active",
        key = "#userId",
        condition = "#userId > 0",
        unless = "#result == null || #result.status != '0'"
    )
    public UserDTO getActiveUser(Long userId) {
        return userMapper.selectDtoById(userId);
    }
}
```

### 手动缓存管理

```java
/**
 * 手动缓存管理服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ManualCacheService {

    private final RedissonClient redissonClient;
    private final UserMapper userMapper;
    private final DictService dictService;

    private static final String USER_CACHE_KEY = "user:cache:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(2);

    /**
     * 获取用户（带缓存）
     */
    public UserDTO getUserWithCache(Long userId) {
        String cacheKey = USER_CACHE_KEY + userId;

        // 尝试从缓存获取
        RBucket<UserDTO> bucket = redissonClient.getBucket(cacheKey);
        UserDTO cached = bucket.get();

        if (cached != null) {
            log.debug("从缓存获取用户: {}", userId);
            return cached;
        }

        // 缓存未命中，从数据库查询
        UserDTO user = userMapper.selectDtoById(userId);
        if (user != null) {
            bucket.set(user, DEFAULT_TTL);
            log.debug("用户信息已缓存: {}", userId);
        }

        return user;
    }

    /**
     * 批量获取用户（带缓存优化）
     */
    public List<UserDTO> getUsersWithCache(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Collections.emptyList();
        }

        List<String> cacheKeys = userIds.stream()
            .map(id -> USER_CACHE_KEY + id)
            .collect(Collectors.toList());

        // 批量获取缓存
        RBuckets buckets = redissonClient.getBuckets();
        Map<String, UserDTO> cachedMap = buckets.get(cacheKeys.toArray(new String[0]));

        // 找出未命中的用户ID
        List<Long> missedIds = new ArrayList<>();
        List<UserDTO> result = new ArrayList<>();

        for (Long userId : userIds) {
            String key = USER_CACHE_KEY + userId;
            UserDTO cached = cachedMap.get(key);
            if (cached != null) {
                result.add(cached);
            } else {
                missedIds.add(userId);
            }
        }

        // 批量查询未命中的数据
        if (!missedIds.isEmpty()) {
            List<UserDTO> dbUsers = userMapper.selectDtoByIds(missedIds);

            // 写入缓存
            Map<String, UserDTO> toCache = new HashMap<>();
            for (UserDTO user : dbUsers) {
                toCache.put(USER_CACHE_KEY + user.getUserId(), user);
                result.add(user);
            }

            // 批量设置缓存
            if (!toCache.isEmpty()) {
                buckets.set(toCache);
            }
        }

        return result;
    }

    /**
     * 缓存预热
     */
    public void warmUpCache() {
        log.info("开始预热用户缓存...");

        List<UserDTO> hotUsers = userMapper.selectHotUsers(1000);

        RBatch batch = redissonClient.createBatch();
        for (UserDTO user : hotUsers) {
            batch.getBucket(USER_CACHE_KEY + user.getUserId())
                .setAsync(user, DEFAULT_TTL);
        }
        batch.execute();

        log.info("用户缓存预热完成，共{}条", hotUsers.size());
    }

    /**
     * 缓存失效处理
     */
    public void evictUserCache(Long userId) {
        String cacheKey = USER_CACHE_KEY + userId;
        redissonClient.getBucket(cacheKey).delete();
        log.debug("用户缓存已删除: {}", userId);
    }
}
```

## 服务异步处理

### 异步方法

```java
/**
 * 异步服务示例
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncService {

    private final UserService userService;
    private final EmailService emailService;
    private final SmsService smsService;

    /**
     * 简单异步方法
     */
    @Async
    public void asyncSendEmail(String email, String content) {
        log.info("异步发送邮件开始: {}", email);
        emailService.send(email, content);
        log.info("异步发送邮件完成: {}", email);
    }

    /**
     * 异步方法返回Future
     */
    @Async
    public CompletableFuture<UserDTO> asyncGetUser(Long userId) {
        log.info("异步获取用户: {}", userId);
        List<UserDTO> users = userService.listUsersByIds(
            Collections.singletonList(userId)
        );
        return CompletableFuture.completedFuture(
            users.stream().findFirst().orElse(null)
        );
    }

    /**
     * 指定线程池的异步方法
     */
    @Async("notificationExecutor")
    public void asyncSendNotification(NotificationDTO notification) {
        switch (notification.getType()) {
            case "EMAIL":
                emailService.send(notification.getTarget(), notification.getContent());
                break;
            case "SMS":
                smsService.send(notification.getTarget(), notification.getContent());
                break;
            default:
                log.warn("未知通知类型: {}", notification.getType());
        }
    }

    /**
     * 批量异步处理
     */
    public List<UserDTO> batchAsyncGetUsers(List<Long> userIds) {
        List<CompletableFuture<UserDTO>> futures = userIds.stream()
            .map(this::asyncGetUser)
            .collect(Collectors.toList());

        return futures.stream()
            .map(CompletableFuture::join)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
}

/**
 * 异步线程池配置
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Bean("notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("notification-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, objects) -> {
            log.error("异步方法执行异常: {} - {}", method.getName(), throwable.getMessage(), throwable);
        };
    }
}
```

### 响应式服务

```java
/**
 * 响应式服务示例
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReactiveService {

    private final UserService userService;
    private final DictService dictService;

    /**
     * 响应式获取用户详情
     */
    public Mono<UserDetailVO> getUserDetailReactive(Long userId) {
        return Mono.fromSupplier(() ->
            userService.listUsersByIds(Collections.singletonList(userId))
                .stream()
                .findFirst()
                .orElseThrow(() -> new ServiceException("用户不存在"))
        )
        .map(user -> {
            UserDetailVO detail = new UserDetailVO();
            detail.setUserId(user.getUserId());
            detail.setUserName(user.getUserName());
            detail.setSexLabel(dictService.getDictLabel("sys_user_sex", user.getSex()));
            return detail;
        })
        .subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * 响应式批量获取用户
     */
    public Flux<UserDetailVO> getUserDetailsReactive(List<Long> userIds) {
        return Flux.fromIterable(userIds)
            .flatMap(userId -> getUserDetailReactive(userId))
            .onErrorContinue((error, item) ->
                log.error("获取用户失败: {}", item, error)
            );
    }

    /**
     * 响应式并行处理
     */
    public Mono<AggregatedResult> aggregateDataReactive(Long userId) {
        Mono<UserDTO> userMono = Mono.fromSupplier(() ->
            userService.listUsersByIds(Collections.singletonList(userId))
                .stream()
                .findFirst()
                .orElse(null)
        ).subscribeOn(Schedulers.boundedElastic());

        Mono<Map<String, String>> dictMono = Mono.fromSupplier(() ->
            dictService.getAllDictByDictType("sys_user_sex")
        ).subscribeOn(Schedulers.boundedElastic());

        return Mono.zip(userMono, dictMono)
            .map(tuple -> {
                UserDTO user = tuple.getT1();
                Map<String, String> sexDict = tuple.getT2();

                AggregatedResult result = new AggregatedResult();
                result.setUser(user);
                result.setSexLabel(sexDict.get(user.getSex()));
                return result;
            });
    }
}
```

## 服务日志与审计

### 操作日志记录

```java
/**
 * 操作日志切面
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class OperationLogAspect {

    private final OperationLogMapper logMapper;
    private final UserService userService;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint point, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setTitle(operationLog.title());
        logEntity.setBusinessType(operationLog.businessType().ordinal());
        logEntity.setMethod(point.getSignature().toString());
        logEntity.setRequestMethod(getRequestMethod());
        logEntity.setOperatorType(operationLog.operatorType().ordinal());
        logEntity.setOperName(getCurrentUserName());
        logEntity.setOperUrl(getRequestUrl());
        logEntity.setOperIp(getRemoteIp());
        logEntity.setOperParam(getOperParam(point, operationLog));
        logEntity.setOperTime(new Date());

        Object result = null;
        try {
            result = point.proceed();
            logEntity.setStatus(0);
            logEntity.setJsonResult(toJsonString(result, operationLog));
        } catch (Exception e) {
            logEntity.setStatus(1);
            logEntity.setErrorMsg(StringUtils.substring(e.getMessage(), 0, 2000));
            throw e;
        } finally {
            logEntity.setCostTime(System.currentTimeMillis() - startTime);
            // 异步保存日志
            saveLogAsync(logEntity);
        }

        return result;
    }

    @Async
    public void saveLogAsync(OperationLogEntity logEntity) {
        try {
            logMapper.insert(logEntity);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    private String getCurrentUserName() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            return userService.getUserNameById(userId);
        } catch (Exception e) {
            return "匿名用户";
        }
    }

    // 其他辅助方法...
}

/**
 * 操作日志注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLog {
    /**
     * 模块
     */
    String title() default "";

    /**
     * 业务类型
     */
    BusinessType businessType() default BusinessType.OTHER;

    /**
     * 操作人类型
     */
    OperatorType operatorType() default OperatorType.MANAGE;

    /**
     * 是否保存请求参数
     */
    boolean isSaveRequestData() default true;

    /**
     * 是否保存响应数据
     */
    boolean isSaveResponseData() default true;

    /**
     * 排除指定的请求参数
     */
    String[] excludeParamNames() default {};
}

/**
 * 业务类型枚举
 */
public enum BusinessType {
    OTHER,      // 其他
    INSERT,     // 新增
    UPDATE,     // 修改
    DELETE,     // 删除
    EXPORT,     // 导出
    IMPORT,     // 导入
    GRANT,      // 授权
    FORCE,      // 强制
    CLEAN       // 清空
}
```

### 审计服务

```java
/**
 * 数据审计服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogMapper auditLogMapper;
    private final DictService dictService;

    /**
     * 记录数据变更审计
     */
    public void auditDataChange(AuditContext context) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAuditId(IdUtil.getSnowflakeNextId());
        auditLog.setTableName(context.getTableName());
        auditLog.setRecordId(context.getRecordId());
        auditLog.setOperationType(context.getOperationType());
        auditLog.setOperator(context.getOperator());
        auditLog.setOperateTime(LocalDateTime.now());

        // 记录变更前后的数据
        if (context.getOldData() != null) {
            auditLog.setOldData(JsonUtils.toJsonString(context.getOldData()));
        }
        if (context.getNewData() != null) {
            auditLog.setNewData(JsonUtils.toJsonString(context.getNewData()));
        }

        // 计算数据差异
        if (context.getOldData() != null && context.getNewData() != null) {
            Map<String, Object> diff = calculateDiff(context.getOldData(), context.getNewData());
            auditLog.setDiffData(JsonUtils.toJsonString(diff));
        }

        auditLogMapper.insert(auditLog);
    }

    /**
     * 计算数据差异
     */
    private Map<String, Object> calculateDiff(Object oldData, Object newData) {
        Map<String, Object> diff = new LinkedHashMap<>();

        Map<String, Object> oldMap = BeanUtil.beanToMap(oldData);
        Map<String, Object> newMap = BeanUtil.beanToMap(newData);

        for (Map.Entry<String, Object> entry : newMap.entrySet()) {
            String key = entry.getKey();
            Object newValue = entry.getValue();
            Object oldValue = oldMap.get(key);

            if (!Objects.equals(oldValue, newValue)) {
                Map<String, Object> change = new HashMap<>();
                change.put("old", oldValue);
                change.put("new", newValue);
                diff.put(key, change);
            }
        }

        return diff;
    }

    /**
     * 查询审计记录
     */
    public PageResult<AuditLogVO> queryAuditLogs(AuditQueryDTO query) {
        Page<AuditLog> page = auditLogMapper.selectPage(
            new Page<>(query.getPageNum(), query.getPageSize()),
            new LambdaQueryWrapper<AuditLog>()
                .eq(StringUtils.isNotBlank(query.getTableName()), AuditLog::getTableName, query.getTableName())
                .eq(query.getRecordId() != null, AuditLog::getRecordId, query.getRecordId())
                .eq(StringUtils.isNotBlank(query.getOperationType()), AuditLog::getOperationType, query.getOperationType())
                .between(query.getStartTime() != null && query.getEndTime() != null,
                    AuditLog::getOperateTime, query.getStartTime(), query.getEndTime())
                .orderByDesc(AuditLog::getOperateTime)
        );

        List<AuditLogVO> records = page.getRecords().stream()
            .map(this::toVO)
            .collect(Collectors.toList());

        return PageResult.of(records, page.getTotal());
    }

    private AuditLogVO toVO(AuditLog auditLog) {
        AuditLogVO vo = new AuditLogVO();
        BeanUtils.copyProperties(auditLog, vo);
        vo.setOperationTypeLabel(dictService.getDictLabel("sys_audit_type", auditLog.getOperationType()));
        return vo;
    }
}
```

## 服务监控与健康检查

### 服务健康检查

```java
/**
 * 服务健康检查指示器
 */
@Component
public class ServiceHealthIndicator implements HealthIndicator {

    @Autowired
    private UserService userService;

    @Autowired
    private DictService dictService;

    @Autowired
    private ConfigService configService;

    @Override
    public Health health() {
        Map<String, Object> details = new LinkedHashMap<>();
        boolean allHealthy = true;

        // 检查UserService
        try {
            userService.getUserNameById(1L);
            details.put("userService", "UP");
        } catch (Exception e) {
            details.put("userService", "DOWN: " + e.getMessage());
            allHealthy = false;
        }

        // 检查DictService
        try {
            dictService.getDictLabel("sys_user_sex", "1");
            details.put("dictService", "UP");
        } catch (Exception e) {
            details.put("dictService", "DOWN: " + e.getMessage());
            allHealthy = false;
        }

        // 检查ConfigService
        try {
            configService.getConfigValue("sys.index.skinName", "default");
            details.put("configService", "UP");
        } catch (Exception e) {
            details.put("configService", "DOWN: " + e.getMessage());
            allHealthy = false;
        }

        if (allHealthy) {
            return Health.up().withDetails(details).build();
        } else {
            return Health.down().withDetails(details).build();
        }
    }
}
```

### 服务指标收集

```java
/**
 * 服务指标收集器
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceMetricsCollector {

    private final MeterRegistry meterRegistry;

    private Counter serviceCallCounter;
    private Timer serviceCallTimer;
    private DistributionSummary responseSizeDistribution;

    @PostConstruct
    public void init() {
        serviceCallCounter = Counter.builder("service.calls.total")
            .description("服务调用总次数")
            .register(meterRegistry);

        serviceCallTimer = Timer.builder("service.calls.duration")
            .description("服务调用耗时")
            .register(meterRegistry);

        responseSizeDistribution = DistributionSummary.builder("service.response.size")
            .description("响应数据大小")
            .baseUnit("bytes")
            .register(meterRegistry);
    }

    /**
     * 记录服务调用
     */
    public void recordServiceCall(String serviceName, String methodName, long duration, boolean success) {
        serviceCallCounter.increment();

        Timer.builder("service.calls.duration")
            .tag("service", serviceName)
            .tag("method", methodName)
            .tag("success", String.valueOf(success))
            .register(meterRegistry)
            .record(duration, TimeUnit.MILLISECONDS);
    }

    /**
     * 记录响应大小
     */
    public void recordResponseSize(String serviceName, int size) {
        DistributionSummary.builder("service.response.size")
            .tag("service", serviceName)
            .baseUnit("bytes")
            .register(meterRegistry)
            .record(size);
    }

    /**
     * 记录活跃用户数
     */
    public void recordActiveUsers(int count) {
        Gauge.builder("service.active.users", () -> count)
            .description("活跃用户数")
            .register(meterRegistry);
    }
}

/**
 * 服务调用监控切面
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceMetricsAspect {

    private final ServiceMetricsCollector metricsCollector;

    @Around("execution(* org.dromara..*Service.*(..))")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        String serviceName = point.getTarget().getClass().getSimpleName();
        String methodName = point.getSignature().getName();

        long startTime = System.currentTimeMillis();
        boolean success = true;

        try {
            return point.proceed();
        } catch (Exception e) {
            success = false;
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            metricsCollector.recordServiceCall(serviceName, methodName, duration, success);
        }
    }
}
```

## 服务Mock测试

### 单元测试Mock

```java
/**
 * 服务单元测试示例
 */
@ExtendWith(MockitoExtension.class)
class BusinessServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private DictService dictService;

    @Mock
    private ConfigService configService;

    @InjectMocks
    private BusinessService businessService;

    @Test
    void testProcessUserData() {
        // Given
        Long userId = 1L;
        UserDTO mockUser = new UserDTO();
        mockUser.setUserId(userId);
        mockUser.setUserName("testUser");
        mockUser.setNickName("测试用户");
        mockUser.setSex("1");

        when(userService.listUsersByIds(Collections.singletonList(userId)))
            .thenReturn(Collections.singletonList(mockUser));

        when(dictService.getDictLabel("sys_user_sex", "1"))
            .thenReturn("男");

        // When
        UserDetailVO result = businessService.getUserDetail(userId);

        // Then
        assertNotNull(result);
        assertEquals("testUser", result.getUserName());
        assertEquals("测试用户", result.getNickName());
        assertEquals("男", result.getSexLabel());

        verify(userService).listUsersByIds(Collections.singletonList(userId));
        verify(dictService).getDictLabel("sys_user_sex", "1");
    }

    @Test
    void testProcessUserData_UserNotFound() {
        // Given
        Long userId = 999L;
        when(userService.listUsersByIds(Collections.singletonList(userId)))
            .thenReturn(Collections.emptyList());

        // When & Then
        assertThrows(ServiceException.class, () -> {
            businessService.getUserDetail(userId);
        });
    }

    @Test
    void testBatchProcessUsers() {
        // Given
        List<Long> userIds = Arrays.asList(1L, 2L, 3L);

        List<UserDTO> mockUsers = userIds.stream().map(id -> {
            UserDTO user = new UserDTO();
            user.setUserId(id);
            user.setUserName("user" + id);
            user.setSex("1");
            return user;
        }).collect(Collectors.toList());

        when(userService.listUsersByIds(userIds))
            .thenReturn(mockUsers);

        when(dictService.getAllDictByDictType("sys_user_sex"))
            .thenReturn(Map.of("1", "男", "0", "女"));

        // When
        List<UserDetailVO> results = businessService.getUserDetails(userIds);

        // Then
        assertEquals(3, results.size());
        assertTrue(results.stream().allMatch(u -> "男".equals(u.getSexLabel())));
    }
}
```

### 集成测试

```java
/**
 * 服务集成测试示例
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private DictService dictService;

    @Autowired
    private ConfigService configService;

    @Autowired
    private BusinessService businessService;

    @Test
    void testUserServiceIntegration() {
        // Given
        Long userId = 1L;

        // When
        String userName = userService.getUserNameById(userId);
        String nickName = userService.getNickNameById(userId);

        // Then
        assertNotNull(userName);
        assertNotNull(nickName);
    }

    @Test
    void testDictServiceIntegration() {
        // Given
        String dictType = "sys_user_sex";

        // When
        Map<String, String> allDict = dictService.getAllDictByDictType(dictType);
        String label = dictService.getDictLabel(dictType, "1");

        // Then
        assertFalse(allDict.isEmpty());
        assertNotNull(label);
    }

    @Test
    void testConfigServiceIntegration() {
        // Given
        String configKey = "sys.index.skinName";

        // When
        String value = configService.getConfigValue(configKey);
        String valueWithDefault = configService.getConfigValue("nonexistent.key", "default");

        // Then
        assertNotNull(value);
        assertEquals("default", valueWithDefault);
    }

    @Test
    void testFullBusinessFlow() {
        // Given
        Long userId = 1L;

        // When
        UserDetailVO detail = businessService.getUserDetail(userId);

        // Then
        assertNotNull(detail);
        assertNotNull(detail.getUserName());
        assertNotNull(detail.getSexLabel());
    }
}
```

## 服务降级与熔断

### 熔断器配置

```java
/**
 * 熔断器服务包装
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResilientUserService {

    private final UserService userService;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    /**
     * 带熔断的用户查询
     */
    public UserDTO getUserWithCircuitBreaker(Long userId) {
        CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker("userService");

        return Try.ofSupplier(
            CircuitBreaker.decorateSupplier(circuitBreaker, () ->
                userService.listUsersByIds(Collections.singletonList(userId))
                    .stream()
                    .findFirst()
                    .orElse(null)
            )
        ).recover(throwable -> {
            log.warn("用户服务调用失败，使用降级策略: {}", throwable.getMessage());
            return getFallbackUser(userId);
        }).get();
    }

    /**
     * 降级用户信息
     */
    private UserDTO getFallbackUser(Long userId) {
        UserDTO fallback = new UserDTO();
        fallback.setUserId(userId);
        fallback.setUserName("用户" + userId);
        fallback.setNickName("临时用户");
        fallback.setStatus("1");
        return fallback;
    }
}

/**
 * 熔断器配置
 */
@Configuration
public class CircuitBreakerConfig {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)                     // 失败率阈值50%
            .waitDurationInOpenState(Duration.ofSeconds(30)) // 熔断30秒
            .slidingWindowSize(10)                        // 滑动窗口大小10
            .minimumNumberOfCalls(5)                      // 最少5次调用才计算失败率
            .permittedNumberOfCallsInHalfOpenState(3)    // 半开状态允许3次调用
            .automaticTransitionFromOpenToHalfOpenEnabled(true)
            .build();

        return CircuitBreakerRegistry.of(config);
    }
}
```

### 限流与降级

```java
/**
 * 限流降级服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitedService {

    private final UserService userService;
    private final RateLimiterRegistry rateLimiterRegistry;

    /**
     * 带限流的用户批量查询
     */
    public List<UserDTO> getUsersWithRateLimit(List<Long> userIds) {
        RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter("userQueryRateLimiter");

        return Try.ofSupplier(
            RateLimiter.decorateSupplier(rateLimiter, () ->
                userService.listUsersByIds(userIds)
            )
        ).recover(RequestNotPermitted.class, throwable -> {
            log.warn("请求被限流: {}", throwable.getMessage());
            return Collections.emptyList();
        }).get();
    }
}

/**
 * 限流器配置
 */
@Configuration
public class RateLimiterConfig {

    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitRefreshPeriod(Duration.ofSeconds(1))  // 每秒刷新
            .limitForPeriod(100)                         // 每秒100个请求
            .timeoutDuration(Duration.ofMillis(500))    // 等待超时500ms
            .build();

        return RateLimiterRegistry.of(config);
    }
}
```

## 注意事项

### 1. 服务接口设计原则

- **单一职责**：每个服务接口只负责一个领域的功能
- **接口隔离**：不要创建臃肿的通用接口，应该拆分成多个小接口
- **依赖倒置**：高层模块不依赖低层模块，都依赖于抽象
- **默认方法**：合理使用 default 方法提供默认实现，保证向后兼容

### 2. 事务管理注意事项

- **避免大事务**：将大事务拆分成多个小事务
- **只读事务**：查询操作使用 `@Transactional(readOnly = true)`
- **事务传播**：根据业务需求选择合适的传播行为
- **异常回滚**：明确指定需要回滚的异常类型

### 3. 缓存使用建议

- **缓存穿透**：使用空值缓存或布隆过滤器
- **缓存雪崩**：设置随机过期时间，避免同时失效
- **缓存击穿**：使用分布式锁保护热点数据
- **缓存一致性**：使用延迟双删或订阅binlog方案

### 4. 异步处理注意事项

- **线程池配置**：根据业务场景配置合适的线程池参数
- **异常处理**：配置异步异常处理器，避免异常丢失
- **事务边界**：异步方法中的事务是独立的
- **上下文传递**：注意 `SecurityContext` 和 `RequestContext` 的传递

### 5. 服务监控要点

- **关键指标**：监控调用次数、成功率、响应时间等
- **日志规范**：统一日志格式，包含请求ID便于追踪
- **告警阈值**：设置合理的告警阈值，避免告警疲劳
- **健康检查**：实现服务健康检查接口，配合容器编排使用

### 6. 服务测试策略

- **单元测试**：使用 Mock 隔离外部依赖
- **集成测试**：测试服务间的交互
- **契约测试**：验证服务接口契约
- **性能测试**：验证服务在高并发下的表现

这些通用服务接口构成了系统的基础服务层，为上层业务逻辑提供了统一、规范的数据访问方式。通过合理的设计模式、事务管理、缓存策略、异步处理和监控机制，可以构建出高可用、高性能的服务层架构。
