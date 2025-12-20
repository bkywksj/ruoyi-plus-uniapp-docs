# 后端开发概览

RuoYi-Plus-UniApp 后端开发最佳实践体系，基于 Spring Boot 3.x + MyBatis-Plus 技术栈，涵盖分层架构、设计模式和编码规范。

## 架构概述

### 分层架构

```
┌─────────────────────────────────────────────────┐
│                  Controller 层                   │
│         接口定义 / 参数校验 / 权限控制            │
├─────────────────────────────────────────────────┤
│                   Service 层                     │
│         业务逻辑 / 事务管理 / 数据转换            │
├─────────────────────────────────────────────────┤
│                    DAO 层                        │
│          数据访问 / SQL 封装 / 缓存处理           │
├─────────────────────────────────────────────────┤
│                   Mapper 层                      │
│           MyBatis 映射 / SQL 执行                │
└─────────────────────────────────────────────────┘
```

### 核心特点

本项目与传统 RuoYi-Vue-Plus 的关键区别：

| 特性 | 本项目 | 传统方式 |
|------|--------|----------|
| Service 基类 | **不继承任何基类** | 继承 `ServiceImpl` |
| DAO 层 | **独立 DAO 接口** | 直接使用 Mapper |
| 数据转换 | **MapStruct 转换** | 手动转换或 BeanUtils |
| 事务管理 | **Service 层管理** | 分散在各层 |

## 各层职责

### Controller 层

**职责范围**:
- 接收和解析 HTTP 请求
- 参数校验和格式转换
- 权限控制和认证检查
- 调用 Service 层
- 返回统一响应格式

```java
@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class SysUserController {

    private final ISysUserService userService;

    @GetMapping("/{id}")
    @SaCheckPermission("system:user:query")
    public R<SysUserVo> get(@PathVariable Long id) {
        return R.ok(userService.get(id));
    }

    @PostMapping
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    public R<Long> add(@Validated @RequestBody SysUserBo bo) {
        return R.ok(userService.add(bo));
    }

    @GetMapping("/page")
    @SaCheckPermission("system:user:list")
    public R<PageResult<SysUserVo>> page(SysUserBo bo, PageQuery pageQuery) {
        return R.ok(userService.page(bo, pageQuery));
    }
}
```

**设计要点**:
- 使用 `@RequiredArgsConstructor` 注入依赖
- 使用 `@SaCheckPermission` 进行权限控制
- 使用 `@Validated` 进行参数校验
- 使用 `@Log` 记录操作日志
- 返回统一的 `R<T>` 响应格式

### Service 层

**职责范围**:
- 业务逻辑处理
- 事务边界管理
- 数据校验和转换
- 调用 DAO 层
- 跨模块协调

```java
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl implements ISysUserService {

    private final ISysUserDao userDao;
    private final ISysRoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public SysUserVo get(Long id) {
        return userDao.get(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long add(SysUserBo bo) {
        // 1. 业务校验
        checkUserNameUnique(bo.getUserName());
        checkPhoneUnique(bo.getPhone());

        // 2. 密码加密
        bo.setPassword(passwordEncoder.encode(bo.getPassword()));

        // 3. 保存用户
        Long userId = userDao.add(bo);

        // 4. 保存用户角色关联
        if (CollUtil.isNotEmpty(bo.getRoleIds())) {
            roleService.saveUserRoles(userId, bo.getRoleIds());
        }

        return userId;
    }

    @Override
    public PageResult<SysUserVo> page(SysUserBo bo, PageQuery pageQuery) {
        return userDao.page(bo, pageQuery);
    }

    private void checkUserNameUnique(String userName) {
        if (userDao.existsByUserName(userName)) {
            throw new ServiceException("用户名已存在");
        }
    }
}
```

**设计要点**:
- **不继承任何基类**，这是本项目的核心特点
- 使用 `@Transactional` 管理事务边界
- 业务逻辑集中在 Service 层
- 通过 DAO 层访问数据

### DAO 层

**职责范围**:
- 封装数据访问逻辑
- SQL 条件构建
- 数据类型转换
- 缓存处理
- 调用 Mapper 层

```java
@Repository
@RequiredArgsConstructor
public class SysUserDaoImpl implements ISysUserDao {

    private final SysUserMapper userMapper;
    private final SysUserConvert userConvert;

    @Override
    public SysUserVo get(Long id) {
        SysUser entity = userMapper.selectById(id);
        return userConvert.toVo(entity);
    }

    @Override
    public Long add(SysUserBo bo) {
        SysUser entity = userConvert.toEntity(bo);
        userMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public PageResult<SysUserVo> page(SysUserBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<SysUser> wrapper = buildQueryWrapper(bo);
        Page<SysUser> page = userMapper.selectPage(pageQuery.build(), wrapper);
        return PageResult.build(page, userConvert::toVo);
    }

    private LambdaQueryWrapper<SysUser> buildQueryWrapper(SysUserBo bo) {
        return Wrappers.<SysUser>lambdaQuery()
            .like(StrUtil.isNotBlank(bo.getUserName()), SysUser::getUserName, bo.getUserName())
            .like(StrUtil.isNotBlank(bo.getNickName()), SysUser::getNickName, bo.getNickName())
            .eq(StrUtil.isNotBlank(bo.getStatus()), SysUser::getStatus, bo.getStatus())
            .orderByDesc(SysUser::getCreateTime);
    }
}
```

**设计要点**:
- DAO 层封装所有数据访问细节
- 使用 MapStruct 进行数据转换
- 使用 LambdaQueryWrapper 构建查询条件
- Service 层不直接操作 Mapper

## 数据模型规范

### 实体类 (Entity)

```java
@Data
@TableName("sys_user")
public class SysUser extends BaseEntity {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String userName;

    private String nickName;

    private String password;

    private String status;
}
```

### 业务对象 (Bo)

```java
@Data
public class SysUserBo {

    private Long id;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 30, message = "用户名长度必须在2-30之间")
    private String userName;

    @NotBlank(message = "昵称不能为空")
    private String nickName;

    private String password;

    private String status;

    private List<Long> roleIds;
}
```

### 视图对象 (Vo)

```java
@Data
public class SysUserVo {

    private Long id;

    private String userName;

    private String nickName;

    private String status;

    private String statusText;

    private LocalDateTime createTime;

    private List<SysRoleVo> roles;
}
```

### 数据转换 (Convert)

```java
@Mapper(componentModel = "spring")
public interface SysUserConvert {

    SysUserVo toVo(SysUser entity);

    SysUser toEntity(SysUserBo bo);

    List<SysUserVo> toVoList(List<SysUser> entityList);
}
```

## 统一响应格式

### 成功响应

```java
// 返回数据
R.ok(data);

// 返回消息
R.ok("操作成功");

// 返回数据和消息
R.ok(data, "查询成功");
```

### 失败响应

```java
// 返回错误消息
R.fail("用户名已存在");

// 返回错误码和消息
R.fail(500, "系统异常");
```

### 响应结构

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { }
}
```

## 异常处理

### 业务异常

```java
// 抛出业务异常
throw new ServiceException("用户名已存在");

// 带错误码的异常
throw new ServiceException("用户不存在", 404);
```

### 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e) {
        return R.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .findFirst()
            .orElse("参数校验失败");
        return R.fail(message);
    }
}
```

## 事务管理

### 事务注解使用

```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderBo bo) {
        // 1. 创建订单
        Long orderId = orderDao.add(bo);

        // 2. 扣减库存
        stockService.deduct(bo.getProductId(), bo.getQuantity());

        // 3. 创建支付记录
        paymentService.createPayment(orderId, bo.getAmount());

        return orderId;
    }
}
```

### 事务传播行为

| 传播行为 | 说明 | 使用场景 |
|---------|------|---------|
| REQUIRED | 默认，有事务加入，无事务创建 | 大多数业务方法 |
| REQUIRES_NEW | 总是创建新事务 | 独立事务，如日志记录 |
| NESTED | 嵌套事务 | 部分回滚场景 |

## 参数校验

### 常用校验注解

```java
@Data
public class UserBo {

    @NotNull(message = "ID不能为空", groups = Update.class)
    private Long id;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 30, message = "用户名长度2-30")
    private String userName;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @Range(min = 0, max = 150, message = "年龄范围0-150")
    private Integer age;
}
```

### 分组校验

```java
// Controller 中使用分组
@PostMapping
public R<Long> add(@Validated(Add.class) @RequestBody UserBo bo) { }

@PutMapping
public R<Boolean> update(@Validated(Update.class) @RequestBody UserBo bo) { }
```

## 开发流程

### 1. 创建数据表

```sql
CREATE TABLE biz_product (
    id          BIGINT       NOT NULL COMMENT '产品ID',
    name        VARCHAR(100) NOT NULL COMMENT '产品名称',
    price       DECIMAL(10,2) DEFAULT NULL COMMENT '价格',
    status      CHAR(1)      DEFAULT '0' COMMENT '状态',
    create_by   VARCHAR(64)  DEFAULT NULL COMMENT '创建者',
    create_time DATETIME     DEFAULT NULL COMMENT '创建时间',
    update_by   VARCHAR(64)  DEFAULT NULL COMMENT '更新者',
    update_time DATETIME     DEFAULT NULL COMMENT '更新时间',
    del_flag    CHAR(1)      DEFAULT '0' COMMENT '删除标志',
    PRIMARY KEY (id)
) COMMENT '产品表';
```

### 2. 生成代码

使用代码生成器生成基础代码：
- Entity 实体类
- Mapper 接口和 XML
- Service 接口和实现
- Controller 控制器
- DAO 接口和实现
- Convert 转换器
- Bo/Vo 数据对象

### 3. 业务开发

在生成代码的基础上：
1. 完善业务校验逻辑
2. 添加事务管理
3. 实现复杂查询
4. 添加权限控制

### 4. 测试验证

```java
@SpringBootTest
class ProductServiceTest {

    @Autowired
    private IProductService productService;

    @Test
    void testAdd() {
        ProductBo bo = new ProductBo();
        bo.setName("测试产品");
        bo.setPrice(BigDecimal.valueOf(99.9));

        Long id = productService.add(bo);
        assertNotNull(id);
    }
}
```

## 最佳实践清单

### Controller 层

- [x] 使用 `@RequiredArgsConstructor` 注入依赖
- [x] 使用 `@Validated` 校验参数
- [x] 使用 `@SaCheckPermission` 控制权限
- [x] 使用 `@Log` 记录操作日志
- [x] 返回统一响应格式 `R<T>`

### Service 层

- [x] 不继承任何基类
- [x] 使用 `@Transactional` 管理事务
- [x] 业务逻辑集中处理
- [x] 合理拆分私有方法
- [x] 异常使用 `ServiceException`

### DAO 层

- [x] 封装所有数据访问逻辑
- [x] 使用 MapStruct 进行转换
- [x] 使用 LambdaQueryWrapper 构建条件
- [x] 复杂查询使用 XML

### 通用规范

- [x] 遵循命名规范
- [x] 添加必要注释
- [x] 避免硬编码
- [x] 合理处理异常
- [x] 编写单元测试

## 性能优化

### 数据库查询优化

**1. 按需查询字段**

```java
@Repository
public class SysUserDaoImpl implements ISysUserDao {

    // ✅ 只查询需要的字段
    @Override
    public List<SysUserSimpleVo> getSimpleList() {
        return userMapper.selectList(Wrappers.<SysUser>lambdaQuery()
            .select(SysUser::getId, SysUser::getUserName, SysUser::getNickName)
            .eq(SysUser::getStatus, "0")
        ).stream()
            .map(userConvert::toSimpleVo)
            .collect(Collectors.toList());
    }

    // ❌ 避免 SELECT *
    @Override
    public List<SysUserVo> getList() {
        return userMapper.selectList(null) // 查询所有字段
            .stream()
            .map(userConvert::toVo)
            .collect(Collectors.toList());
    }
}
```

**2. 批量查询替代循环查询**

```java
@Service
public class OrderServiceImpl implements IOrderService {

    // ✅ 批量查询
    @Override
    public List<OrderVo> getOrdersWithUser(List<Long> orderIds) {
        // 1. 批量查询订单
        List<Order> orders = orderDao.listByIds(orderIds);

        // 2. 提取用户ID，批量查询用户
        Set<Long> userIds = orders.stream()
            .map(Order::getUserId)
            .collect(Collectors.toSet());
        Map<Long, SysUserVo> userMap = userService.getByIds(userIds);

        // 3. 组装数据
        return orders.stream()
            .map(order -> {
                OrderVo vo = orderConvert.toVo(order);
                vo.setUser(userMap.get(order.getUserId()));
                return vo;
            })
            .collect(Collectors.toList());
    }

    // ❌ 避免循环中单条查询 (N+1 问题)
    @Override
    public List<OrderVo> getOrdersWithUserBad(List<Long> orderIds) {
        List<Order> orders = orderDao.listByIds(orderIds);
        return orders.stream()
            .map(order -> {
                OrderVo vo = orderConvert.toVo(order);
                vo.setUser(userService.get(order.getUserId())); // 每次循环都查询
                return vo;
            })
            .collect(Collectors.toList());
    }
}
```

**3. 分页查询优化**

```java
@Repository
public class SysUserDaoImpl implements ISysUserDao {

    @Override
    public PageResult<SysUserVo> page(SysUserBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<SysUser> wrapper = Wrappers.<SysUser>lambdaQuery()
            // 使用索引字段作为查询条件
            .eq(StrUtil.isNotBlank(bo.getStatus()), SysUser::getStatus, bo.getStatus())
            .eq(ObjectUtil.isNotNull(bo.getDeptId()), SysUser::getDeptId, bo.getDeptId())
            // 模糊查询放在后面
            .like(StrUtil.isNotBlank(bo.getUserName()), SysUser::getUserName, bo.getUserName())
            // 合理的排序
            .orderByDesc(SysUser::getCreateTime);

        // 使用 MyBatis-Plus 分页插件
        Page<SysUser> page = userMapper.selectPage(pageQuery.build(), wrapper);
        return PageResult.build(page, userConvert::toVo);
    }
}
```

### 缓存策略

**1. 使用 Spring Cache**

```java
@Service
@RequiredArgsConstructor
public class SysDictServiceImpl implements ISysDictService {

    private final ISysDictDao dictDao;

    // 查询时使用缓存
    @Override
    @Cacheable(cacheNames = "dict", key = "#dictType")
    public List<SysDictDataVo> getByType(String dictType) {
        return dictDao.getByType(dictType);
    }

    // 更新时清除缓存
    @Override
    @CacheEvict(cacheNames = "dict", key = "#bo.dictType")
    @Transactional(rollbackFor = Exception.class)
    public boolean update(SysDictDataBo bo) {
        return dictDao.update(bo);
    }

    // 删除时清除所有缓存
    @Override
    @CacheEvict(cacheNames = "dict", allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        return dictDao.delete(id);
    }
}
```

**2. 使用 Redisson 缓存**

```java
@Service
@RequiredArgsConstructor
public class ConfigServiceImpl implements IConfigService {

    private final IConfigDao configDao;

    private static final String CACHE_KEY_PREFIX = "config:";
    private static final Duration CACHE_DURATION = Duration.ofHours(1);

    @Override
    public String getConfigValue(String key) {
        String cacheKey = CACHE_KEY_PREFIX + key;

        // 先从缓存获取
        String value = RedisUtils.getCacheObject(cacheKey);
        if (StrUtil.isNotBlank(value)) {
            return value;
        }

        // 缓存未命中，从数据库查询
        SysConfigVo config = configDao.getByKey(key);
        if (config != null) {
            value = config.getConfigValue();
            // 写入缓存
            RedisUtils.setCacheObject(cacheKey, value, CACHE_DURATION);
        }

        return value;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateConfig(SysConfigBo bo) {
        boolean result = configDao.update(bo);
        if (result) {
            // 更新后清除缓存
            RedisUtils.deleteObject(CACHE_KEY_PREFIX + bo.getConfigKey());
        }
        return result;
    }
}
```

**3. 缓存使用原则**

| 原则 | 说明 |
|------|------|
| 适合缓存 | 读多写少的数据、计算结果、配置信息 |
| 不适合缓存 | 频繁变化的数据、实时性要求高的数据 |
| 缓存时间 | 根据数据更新频率设置合理的过期时间 |
| 缓存穿透 | 缓存空值或使用布隆过滤器 |
| 缓存雪崩 | 设置随机过期时间，避免同时失效 |
| 缓存击穿 | 使用互斥锁或逻辑过期 |

### 批量操作

```java
@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements IBatchService {

    private final SysUserMapper userMapper;

    /**
     * 批量插入 - 分批处理
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchInsert(List<SysUserBo> users) {
        List<SysUser> entities = users.stream()
            .map(userConvert::toEntity)
            .collect(Collectors.toList());

        // 分批插入，每批 500 条
        List<List<SysUser>> batches = ListUtil.partition(entities, 500);
        for (List<SysUser> batch : batches) {
            userMapper.insertBatch(batch);
        }
        return true;
    }

    /**
     * 批量更新 - 使用 CASE WHEN
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateStatus(Map<Long, String> statusMap) {
        if (CollUtil.isEmpty(statusMap)) {
            return false;
        }
        return userMapper.batchUpdateStatus(statusMap);
    }

    /**
     * 批量删除
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDelete(List<Long> ids) {
        // 分批删除，每批 1000 条
        List<List<Long>> batches = ListUtil.partition(ids, 1000);
        for (List<Long> batch : batches) {
            userMapper.deleteBatchIds(batch);
        }
        return true;
    }
}
```

## 日志规范

### 日志级别使用

```java
@Slf4j
@Service
public class OrderServiceImpl implements IOrderService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderBo bo) {
        // DEBUG: 详细的调试信息
        log.debug("开始创建订单, 参数: {}", bo);

        // INFO: 重要的业务操作
        log.info("创建订单, 用户: {}, 产品: {}, 金额: {}",
            bo.getUserId(), bo.getProductId(), bo.getAmount());

        try {
            Long orderId = orderDao.add(bo);

            // INFO: 操作结果
            log.info("订单创建成功, 订单ID: {}", orderId);
            return orderId;

        } catch (Exception e) {
            // ERROR: 异常信息
            log.error("订单创建失败, 用户: {}, 产品: {}, 异常: {}",
                bo.getUserId(), bo.getProductId(), e.getMessage(), e);
            throw new ServiceException("订单创建失败");
        }
    }

    @Override
    public OrderVo get(Long id) {
        // WARN: 警告信息
        OrderVo order = orderDao.get(id);
        if (order == null) {
            log.warn("订单不存在, 订单ID: {}", id);
            return null;
        }
        return order;
    }
}
```

### 日志最佳实践

```java
@Slf4j
@Service
public class PaymentServiceImpl implements IPaymentService {

    // ✅ 使用占位符，避免字符串拼接
    log.info("支付请求, 订单: {}, 金额: {}", orderId, amount);

    // ❌ 避免字符串拼接
    log.info("支付请求, 订单: " + orderId + ", 金额: " + amount);

    // ✅ 敏感信息脱敏
    log.info("用户登录, 用户名: {}, 手机号: {}",
        username, DesensitizedUtil.mobilePhone(phone));

    // ❌ 避免记录敏感信息
    log.info("用户登录, 用户名: {}, 密码: {}", username, password);

    // ✅ 异常日志记录完整堆栈
    log.error("支付异常, 订单: {}", orderId, e);

    // ❌ 只记录消息，丢失堆栈
    log.error("支付异常: " + e.getMessage());
}
```

## 安全规范

### SQL 注入防护

```java
@Repository
public class SysUserDaoImpl implements ISysUserDao {

    // ✅ 使用参数化查询
    @Override
    public SysUserVo getByUserName(String userName) {
        return userMapper.selectOne(Wrappers.<SysUser>lambdaQuery()
            .eq(SysUser::getUserName, userName));
    }

    // ✅ 使用 MyBatis #{} 参数
    // Mapper XML:
    // <select id="selectByUserName">
    //     SELECT * FROM sys_user WHERE user_name = #{userName}
    // </select>

    // ❌ 避免使用 ${} 拼接SQL
    // <select id="selectByUserName">
    //     SELECT * FROM sys_user WHERE user_name = '${userName}'
    // </select>
}
```

### 敏感数据处理

```java
@Data
public class SysUserVo {

    private Long id;

    private String userName;

    // 使用脱敏注解
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phone;

    @Sensitive(strategy = SensitiveStrategy.EMAIL)
    private String email;

    @Sensitive(strategy = SensitiveStrategy.ID_CARD)
    private String idCard;

    // 不返回密码
    @JsonIgnore
    private String password;
}
```

### 权限控制

```java
@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class SysUserController {

    // 接口级别权限控制
    @GetMapping("/{id}")
    @SaCheckPermission("system:user:query")
    public R<SysUserVo> get(@PathVariable Long id) {
        return R.ok(userService.get(id));
    }

    // 多权限校验 (OR 关系)
    @PostMapping
    @SaCheckPermission(value = {"system:user:add", "system:user:edit"}, mode = SaMode.OR)
    public R<Long> add(@RequestBody SysUserBo bo) {
        return R.ok(userService.add(bo));
    }

    // 角色校验
    @DeleteMapping("/{id}")
    @SaCheckRole("admin")
    public R<Boolean> delete(@PathVariable Long id) {
        return R.ok(userService.delete(id));
    }
}
```

## 并发处理

### 分布式锁

```java
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements IStockService {

    private final RedissonClient redissonClient;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deduct(Long productId, Integer quantity) {
        String lockKey = "stock:deduct:" + productId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁，等待 5 秒，锁持有 30 秒
            if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                try {
                    // 检查库存
                    Stock stock = stockDao.getByProductId(productId);
                    if (stock.getQuantity() < quantity) {
                        throw new ServiceException("库存不足");
                    }

                    // 扣减库存
                    return stockDao.deduct(productId, quantity);
                } finally {
                    lock.unlock();
                }
            } else {
                throw new ServiceException("系统繁忙，请稍后重试");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServiceException("操作被中断");
        }
    }
}
```

### 幂等性处理

```java
@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

    // 使用幂等注解防止重复提交
    @PostMapping
    @RepeatSubmit(interval = 5000, message = "请勿重复提交")
    public R<Long> createOrder(@RequestBody OrderBo bo) {
        return R.ok(orderService.create(bo));
    }
}

// 业务层幂等处理
@Service
public class OrderServiceImpl implements IOrderService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(OrderBo bo) {
        // 使用唯一业务ID防止重复创建
        String bizKey = "order:" + bo.getUserId() + ":" + bo.getProductId();

        if (RedisUtils.hasKey(bizKey)) {
            throw new ServiceException("订单正在处理中，请勿重复提交");
        }

        try {
            // 设置处理标识，5 分钟过期
            RedisUtils.setCacheObject(bizKey, "1", Duration.ofMinutes(5));

            // 创建订单
            return orderDao.add(bo);
        } finally {
            // 处理完成后删除标识
            RedisUtils.deleteObject(bizKey);
        }
    }
}
```

## 监控与调试

### SQL 执行监控

```yaml
# application.yml
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 开发环境
```

```java
// 使用 p6spy 监控 SQL 执行时间
// pom.xml 添加依赖后配置 spy.properties
```

### 接口耗时监控

```java
@Aspect
@Component
@Slf4j
public class ApiTimeAspect {

    @Around("@annotation(org.springframework.web.bind.annotation.RequestMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.GetMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PostMapping)")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = point.getSignature().getName();

        try {
            return point.proceed();
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            if (costTime > 3000) {
                log.warn("接口执行缓慢, 方法: {}, 耗时: {}ms", methodName, costTime);
            } else {
                log.debug("接口执行完成, 方法: {}, 耗时: {}ms", methodName, costTime);
            }
        }
    }
}
```

### 健康检查

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    @Autowired
    private DataSource dataSource;

    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(1)) {
                return Health.up()
                    .withDetail("database", "MySQL")
                    .withDetail("status", "connected")
                    .build();
            }
        } catch (SQLException e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

## 异步处理

### 使用 @Async

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("asyncExecutor")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    @Async("asyncExecutor")
    @Override
    public void sendEmailAsync(String email, String subject, String content) {
        log.info("异步发送邮件: {}", email);
        // 发送邮件逻辑
    }

    @Async("asyncExecutor")
    @Override
    public CompletableFuture<Boolean> sendSmsAsync(String phone, String content) {
        log.info("异步发送短信: {}", phone);
        // 发送短信逻辑
        return CompletableFuture.completedFuture(true);
    }
}
```

### 事件驱动

```java
// 定义事件
public class UserCreatedEvent extends ApplicationEvent {
    private final SysUserVo user;

    public UserCreatedEvent(Object source, SysUserVo user) {
        super(source);
        this.user = user;
    }

    public SysUserVo getUser() {
        return user;
    }
}

// 发布事件
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl implements ISysUserService {

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long add(SysUserBo bo) {
        Long userId = userDao.add(bo);

        // 发布用户创建事件
        SysUserVo user = userDao.get(userId);
        eventPublisher.publishEvent(new UserCreatedEvent(this, user));

        return userId;
    }
}

// 监听事件
@Component
@RequiredArgsConstructor
public class UserEventListener {

    private final INotificationService notificationService;

    @Async("asyncExecutor")
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        SysUserVo user = event.getUser();
        log.info("处理用户创建事件: {}", user.getUserName());

        // 发送欢迎邮件
        notificationService.sendWelcomeEmail(user.getEmail());

        // 初始化用户配置
        // ...
    }
}
```

## 代码组织规范

### 包结构

```
com.ruoyi.system
├── controller          # 控制器层
│   └── SysUserController.java
├── service             # 服务层
│   ├── ISysUserService.java
│   └── impl
│       └── SysUserServiceImpl.java
├── dao                 # 数据访问层
│   ├── ISysUserDao.java
│   └── impl
│       └── SysUserDaoImpl.java
├── mapper              # Mapper层
│   └── SysUserMapper.java
├── domain              # 领域模型
│   ├── entity
│   │   └── SysUser.java
│   ├── bo
│   │   └── SysUserBo.java
│   ├── vo
│   │   └── SysUserVo.java
│   └── convert
│       └── SysUserConvert.java
└── constants           # 常量定义
    └── SysUserConstants.java
```

### 类命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| Controller | XxxController | SysUserController |
| Service 接口 | IXxxService | ISysUserService |
| Service 实现 | XxxServiceImpl | SysUserServiceImpl |
| DAO 接口 | IXxxDao | ISysUserDao |
| DAO 实现 | XxxDaoImpl | SysUserDaoImpl |
| Mapper | XxxMapper | SysUserMapper |
| Entity | XxxEntity 或 Xxx | SysUser |
| Bo | XxxBo | SysUserBo |
| Vo | XxxVo | SysUserVo |
| Convert | XxxConvert | SysUserConvert |

## 总结

后端开发遵循以下核心原则：

1. **分层清晰**: 各层职责明确，不越界调用
2. **不继承基类**: Service 和 DAO 不继承基类，依赖注入
3. **数据转换**: 使用 MapStruct 进行 Entity/Bo/Vo 转换
4. **统一规范**: 响应格式、异常处理、参数校验统一
5. **事务管理**: 事务边界在 Service 层管理
6. **性能优先**: 合理使用缓存、批量操作、异步处理
7. **安全第一**: 防止SQL注入、权限校验、数据脱敏
8. **可观测性**: 完善的日志记录、监控指标、健康检查
