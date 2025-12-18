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

## 总结

后端开发遵循以下核心原则：

1. **分层清晰**: 各层职责明确，不越界调用
2. **不继承基类**: Service 和 DAO 不继承基类，依赖注入
3. **数据转换**: 使用 MapStruct 进行 Entity/Bo/Vo 转换
4. **统一规范**: 响应格式、异常处理、参数校验统一
5. **事务管理**: 事务边界在 Service 层管理
