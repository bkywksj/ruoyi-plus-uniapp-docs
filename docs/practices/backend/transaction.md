# 事务管理最佳实践

## 介绍

事务管理是企业级应用开发的核心内容,确保数据的一致性和完整性。RuoYi-Plus 框架基于 Spring 事务管理机制,提供了声明式和编程式两种事务管理方式,支持多数据源事务、分布式事务等高级特性。

**核心特性:**

- **声明式事务** - 通过 `@Transactional` 注解实现事务管理,简洁易用
- **编程式事务** - 通过 `TransactionTemplate` 实现精细化事务控制
- **多数据源事务** - 支持多数据源环境下的事务一致性
- **事务传播行为** - 支持 7 种事务传播行为,满足各种业务场景
- **事务隔离级别** - 支持 4 种标准隔离级别,控制并发访问
- **异常回滚策略** - 灵活配置回滚和不回滚的异常类型

## 声明式事务

### 基础用法

使用 `@Transactional` 注解声明事务边界:

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SysUserServiceImpl implements ISysUserService {

    private final ISysUserDao userDao;
    private final ISysUserRoleDao userRoleDao;

    /**
     * 新增用户 - 基础事务
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean insertUser(SysUserBo bo) {
        // 插入用户
        SysUser user = MapstructUtils.convert(bo, SysUser.class);
        boolean result = userDao.insert(user);

        // 插入用户角色关联
        if (result && CollUtil.isNotEmpty(bo.getRoleIds())) {
            insertUserRole(user.getUserId(), bo.getRoleIds());
        }

        return result;
    }

    /**
     * 插入用户角色关联
     */
    private void insertUserRole(Long userId, List<Long> roleIds) {
        List<SysUserRole> list = roleIds.stream()
            .map(roleId -> {
                SysUserRole ur = new SysUserRole();
                ur.setUserId(userId);
                ur.setRoleId(roleId);
                return ur;
            })
            .collect(Collectors.toList());

        userRoleDao.batchInsert(list);
    }
}
```

### 注解属性详解

```java
@Transactional(
    // 事务管理器名称(多数据源时使用)
    transactionManager = "transactionManager",

    // 事务传播行为
    propagation = Propagation.REQUIRED,

    // 事务隔离级别
    isolation = Isolation.DEFAULT,

    // 超时时间(秒),-1 表示使用默认
    timeout = -1,

    // 是否只读事务
    readOnly = false,

    // 回滚异常类型
    rollbackFor = Exception.class,

    // 不回滚异常类型
    noRollbackFor = {},

    // 回滚异常类名
    rollbackForClassName = {},

    // 不回滚异常类名
    noRollbackForClassName = {}
)
public void businessMethod() {
    // 业务逻辑
}
```

### 事务传播行为

| 传播行为 | 说明 | 使用场景 |
|---------|------|---------|
| `REQUIRED` | 存在事务则加入,否则创建新事务 | 默认行为,大多数业务方法 |
| `REQUIRES_NEW` | 总是创建新事务,挂起当前事务 | 独立记录操作日志 |
| `NESTED` | 嵌套事务,可独立回滚 | 部分业务失败不影响整体 |
| `SUPPORTS` | 存在事务则加入,否则非事务执行 | 查询方法 |
| `NOT_SUPPORTED` | 非事务执行,挂起当前事务 | 不需要事务的操作 |
| `MANDATORY` | 必须在事务中执行,否则抛异常 | 必须在事务中调用的方法 |
| `NEVER` | 非事务执行,存在事务则抛异常 | 禁止在事务中执行 |

```java
/**
 * REQUIRED - 默认传播行为
 */
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
public void createOrder(OrderBo bo) {
    // 创建订单
    orderDao.insert(order);

    // 扣减库存(同一事务)
    stockService.deductStock(bo.getProductId(), bo.getQuantity());

    // 创建支付记录(同一事务)
    paymentService.createPayment(order.getOrderId(), bo.getAmount());
}

/**
 * REQUIRES_NEW - 独立新事务
 */
@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
public void saveOperationLog(OperLogBo bo) {
    // 即使外层事务回滚,日志也会保存
    operLogDao.insert(MapstructUtils.convert(bo, SysOperLog.class));
}

/**
 * NESTED - 嵌套事务
 */
@Transactional(propagation = Propagation.NESTED, rollbackFor = Exception.class)
public void processSubTask(TaskBo bo) {
    // 子任务失败只回滚自己,不影响主事务
    taskDao.insert(MapstructUtils.convert(bo, Task.class));
}

/**
 * SUPPORTS - 支持事务
 */
@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
public SysUserVo getUserById(Long userId) {
    // 有事务则加入,无事务则非事务执行
    return MapstructUtils.convert(userDao.getById(userId), SysUserVo.class);
}
```

### 事务隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 说明 |
|---------|------|-----------|------|------|
| `READ_UNCOMMITTED` | 可能 | 可能 | 可能 | 最低隔离级别 |
| `READ_COMMITTED` | 不会 | 可能 | 可能 | Oracle 默认 |
| `REPEATABLE_READ` | 不会 | 不会 | 可能 | MySQL 默认 |
| `SERIALIZABLE` | 不会 | 不会 | 不会 | 最高隔离级别 |

```java
/**
 * 读已提交 - 防止脏读
 */
@Transactional(
    isolation = Isolation.READ_COMMITTED,
    rollbackFor = Exception.class
)
public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
    // 转账业务
}

/**
 * 可重复读 - 防止不可重复读
 */
@Transactional(
    isolation = Isolation.REPEATABLE_READ,
    rollbackFor = Exception.class
)
public void generateReport(Long deptId) {
    // 生成报表,需要多次读取相同数据
}

/**
 * 串行化 - 最高隔离级别
 */
@Transactional(
    isolation = Isolation.SERIALIZABLE,
    rollbackFor = Exception.class
)
public void criticalOperation() {
    // 关键操作,需要完全隔离
}
```

### 只读事务

```java
/**
 * 只读事务 - 查询优化
 */
@Transactional(readOnly = true)
public List<SysUserVo> listUsers(SysUserBo bo) {
    // 只读事务不需要写锁,提高查询性能
    PlusLambdaQuery<SysUser> wrapper = userDao.buildQueryWrapper(bo);
    List<SysUser> users = userDao.list(wrapper);
    return MapstructUtils.convert(users, SysUserVo.class);
}

/**
 * 分页查询 - 只读事务
 */
@Transactional(readOnly = true)
public PageResult<SysUserVo> pageUsers(SysUserBo bo, PageQuery pageQuery) {
    PlusLambdaQuery<SysUser> wrapper = userDao.buildQueryWrapper(bo);
    PageResult<SysUser> page = userDao.page(wrapper, pageQuery);
    return page.convert(SysUserVo.class);
}
```

## 编程式事务

### TransactionTemplate

使用 `TransactionTemplate` 实现编程式事务:

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final TransactionTemplate transactionTemplate;
    private final IOrderDao orderDao;
    private final IStockDao stockDao;

    /**
     * 创建订单 - 编程式事务
     */
    @Override
    public Long createOrder(OrderBo bo) {
        return transactionTemplate.execute(status -> {
            try {
                // 创建订单
                Order order = MapstructUtils.convert(bo, Order.class);
                orderDao.insert(order);

                // 扣减库存
                boolean success = stockDao.deductStock(
                    bo.getProductId(),
                    bo.getQuantity()
                );

                if (!success) {
                    // 手动回滚
                    status.setRollbackOnly();
                    throw ServiceException.of("库存不足");
                }

                return order.getOrderId();
            } catch (Exception e) {
                // 标记回滚
                status.setRollbackOnly();
                throw e;
            }
        });
    }

    /**
     * 批量处理 - 带超时控制
     */
    @Override
    public void batchProcess(List<OrderBo> orders) {
        transactionTemplate.setTimeout(60);  // 60秒超时

        transactionTemplate.execute(status -> {
            for (OrderBo order : orders) {
                try {
                    processOrder(order);
                } catch (Exception e) {
                    log.error("处理订单失败: {}", order.getOrderNo(), e);
                    // 单个失败不影响整体
                }
            }
            return null;
        });
    }
}
```

### TransactionManager

直接使用 `PlatformTransactionManager`:

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final PlatformTransactionManager transactionManager;
    private final IPaymentDao paymentDao;

    /**
     * 支付处理 - 完全控制事务
     */
    @Override
    public void processPayment(PaymentBo bo) {
        // 定义事务属性
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setName("payment-transaction");
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        def.setIsolationLevel(TransactionDefinition.ISOLATION_REPEATABLE_READ);
        def.setTimeout(30);

        // 开启事务
        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            // 业务处理
            Payment payment = MapstructUtils.convert(bo, Payment.class);
            paymentDao.insert(payment);

            // 调用第三方支付
            boolean success = callThirdPartyPayment(payment);

            if (!success) {
                throw ServiceException.of("支付失败");
            }

            // 提交事务
            transactionManager.commit(status);

        } catch (Exception e) {
            // 回滚事务
            transactionManager.rollback(status);
            throw e;
        }
    }
}
```

## 高级用法

### 多数据源事务

```java
import com.baomidou.dynamic.datasource.annotation.DS;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MultiDataSourceServiceImpl implements IMultiDataSourceService {

    private final IMasterDao masterDao;
    private final ISlaveDao slaveDao;

    /**
     * 主数据源事务
     */
    @DS("master")
    @Transactional(rollbackFor = Exception.class)
    public void masterOperation(DataBo bo) {
        masterDao.insert(MapstructUtils.convert(bo, Data.class));
    }

    /**
     * 从数据源事务
     */
    @DS("slave")
    @Transactional(rollbackFor = Exception.class)
    public void slaveOperation(DataBo bo) {
        slaveDao.insert(MapstructUtils.convert(bo, Data.class));
    }

    /**
     * 跨数据源操作 - 需要分布式事务
     */
    @DSTransactional  // 使用动态数据源的分布式事务注解
    public void crossDataSourceOperation(DataBo bo) {
        // 主库操作
        masterDao.insert(MapstructUtils.convert(bo, Data.class));

        // 从库操作
        slaveDao.insert(MapstructUtils.convert(bo, Data.class));
    }
}
```

### 事务事件监听

```java
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class OrderTransactionEventListener {

    /**
     * 事务提交后执行
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 发送订单创建通知
        sendNotification(event.getOrder());

        // 发送消息到 MQ
        sendToMQ(event.getOrder());
    }

    /**
     * 事务回滚后执行
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_ROLLBACK)
    public void handleOrderFailed(OrderCreatedEvent event) {
        // 记录失败日志
        logFailure(event.getOrder());
    }

    /**
     * 事务完成后执行(无论成功或失败)
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMPLETION)
    public void handleOrderCompleted(OrderCreatedEvent event) {
        // 清理资源
        cleanupResources(event.getOrder());
    }
}

// 发布事件
@Service
public class OrderServiceImpl {

    private final ApplicationEventPublisher eventPublisher;

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderBo bo) {
        Order order = orderDao.insert(MapstructUtils.convert(bo, Order.class));

        // 发布事件
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order));
    }
}
```

### 保存点(Savepoint)

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.SavepointManager;
import org.springframework.transaction.TransactionStatus;

@Service
public class BatchProcessServiceImpl {

    private final PlatformTransactionManager transactionManager;

    /**
     * 批量处理 - 使用保存点
     */
    public void batchProcessWithSavepoint(List<DataBo> dataList) {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        TransactionStatus status = transactionManager.getTransaction(def);

        Object savepoint = null;

        try {
            for (int i = 0; i < dataList.size(); i++) {
                // 每 100 条创建一个保存点
                if (i % 100 == 0) {
                    savepoint = status.createSavepoint();
                }

                try {
                    processData(dataList.get(i));
                } catch (Exception e) {
                    // 回滚到上一个保存点
                    if (savepoint != null) {
                        status.rollbackToSavepoint(savepoint);
                        log.warn("回滚到保存点,继续处理后续数据");
                    }
                }
            }

            transactionManager.commit(status);

        } catch (Exception e) {
            transactionManager.rollback(status);
            throw e;
        }
    }
}
```

### 异步事务

```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AsyncTransactionServiceImpl {

    /**
     * 异步事务方法
     * 注意: @Async 必须在 @Transactional 之前执行
     */
    @Async
    @Transactional(rollbackFor = Exception.class)
    public void asyncProcess(DataBo bo) {
        // 异步线程中的事务
        dataDao.insert(MapstructUtils.convert(bo, Data.class));
    }

    /**
     * 主事务调用异步方法
     */
    @Transactional(rollbackFor = Exception.class)
    public void mainProcess(DataBo bo) {
        // 主事务操作
        dataDao.insert(MapstructUtils.convert(bo, Data.class));

        // 异步处理(独立事务)
        asyncProcess(bo);
    }
}
```

## 最佳实践

### 1. 事务粒度控制

```java
// 正确: 事务粒度适中
@Transactional(rollbackFor = Exception.class)
public void createOrder(OrderBo bo) {
    // 创建订单
    Order order = orderDao.insert(MapstructUtils.convert(bo, Order.class));

    // 创建订单明细
    orderDetailService.batchInsert(order.getOrderId(), bo.getDetails());

    // 扣减库存
    stockService.batchDeduct(bo.getDetails());
}

// 错误: 事务粒度过大
@Transactional(rollbackFor = Exception.class)
public void processAllOrders() {
    List<Order> orders = orderDao.listPendingOrders();
    for (Order order : orders) {
        // 处理每个订单(应该每个订单一个事务)
        processOrder(order);
    }
}

// 错误: 事务粒度过小
public void createOrder(OrderBo bo) {
    // 每个操作一个事务,无法保证一致性
    orderService.insertOrder(bo);
    orderDetailService.insertDetails(bo.getDetails());
    stockService.deductStock(bo.getDetails());
}
```

### 2. 异常回滚配置

```java
// 正确: 明确指定回滚异常
@Transactional(rollbackFor = Exception.class)
public void businessMethod() {
    // 所有异常都回滚
}

// 正确: 排除特定异常不回滚
@Transactional(
    rollbackFor = Exception.class,
    noRollbackFor = {BusinessWarningException.class}
)
public void businessMethod() {
    // BusinessWarningException 不回滚
}

// 错误: 使用默认配置(只回滚 RuntimeException)
@Transactional
public void businessMethod() throws IOException {
    // IOException 不会触发回滚!
}
```

### 3. 避免事务失效

```java
// 正确: 事务方法必须是 public
@Transactional(rollbackFor = Exception.class)
public void publicMethod() {
    // 事务生效
}

// 错误: private 方法事务失效
@Transactional(rollbackFor = Exception.class)
private void privateMethod() {
    // 事务不生效!
}

// 错误: 同类内部调用事务失效
public void outerMethod() {
    // 直接调用本类方法,事务不生效
    innerMethod();
}

@Transactional(rollbackFor = Exception.class)
public void innerMethod() {
    // 事务不生效!
}

// 正确: 通过代理调用
@Autowired
private ApplicationContext context;

public void outerMethod() {
    // 获取代理对象调用
    MyService proxy = context.getBean(MyService.class);
    proxy.innerMethod();
}
```

### 4. 合理使用传播行为

```java
// 日志记录 - 使用 REQUIRES_NEW
@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
public void saveLog(LogBo bo) {
    // 独立事务,主业务失败也要保存日志
    logDao.insert(MapstructUtils.convert(bo, Log.class));
}

// 查询方法 - 使用 SUPPORTS
@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
public DataVo getData(Long id) {
    // 有事务则加入,无事务则非事务执行
    return MapstructUtils.convert(dataDao.getById(id), DataVo.class);
}

// 必须在事务中调用 - 使用 MANDATORY
@Transactional(propagation = Propagation.MANDATORY, rollbackFor = Exception.class)
public void mandatoryMethod() {
    // 如果没有外层事务则抛异常
}
```

### 5. 事务超时设置

```java
// 正确: 设置合理的超时时间
@Transactional(timeout = 30, rollbackFor = Exception.class)
public void normalOperation() {
    // 30秒超时
}

// 正确: 长事务设置更长超时
@Transactional(timeout = 300, rollbackFor = Exception.class)
public void longOperation() {
    // 5分钟超时
}

// 错误: 不设置超时,可能导致死锁
@Transactional(rollbackFor = Exception.class)
public void dangerousOperation() {
    // 可能永远不超时
}
```

## 常见问题

### 1. 事务不生效

**问题描述:**

添加了 `@Transactional` 注解但事务未生效。

**问题原因:**

- 方法不是 public
- 同类内部调用
- 异常被捕获未抛出
- 数据库引擎不支持事务

**解决方案:**

```java
// 检查1: 确保方法是 public
@Transactional(rollbackFor = Exception.class)
public void transactionalMethod() {
    // ...
}

// 检查2: 避免同类内部调用
@Service
public class MyServiceImpl {

    @Autowired
    private MyServiceImpl self;  // 注入自己

    public void outerMethod() {
        self.innerMethod();  // 通过代理调用
    }

    @Transactional(rollbackFor = Exception.class)
    public void innerMethod() {
        // 事务生效
    }
}

// 检查3: 确保异常抛出
@Transactional(rollbackFor = Exception.class)
public void businessMethod() {
    try {
        // 业务逻辑
    } catch (Exception e) {
        log.error("处理失败", e);
        throw e;  // 必须抛出异常才能回滚
    }
}

// 检查4: 确保使用 InnoDB 引擎
// MyISAM 不支持事务
```

### 2. 事务回滚失败

**问题描述:**

抛出异常但事务未回滚。

**问题原因:**

- 默认只回滚 RuntimeException
- 异常类型配置错误
- 使用了 noRollbackFor

**解决方案:**

```java
// 正确: 回滚所有异常
@Transactional(rollbackFor = Exception.class)
public void businessMethod() throws Exception {
    // 所有异常都会回滚
}

// 正确: 检查异常也回滚
@Transactional(rollbackFor = {IOException.class, SQLException.class})
public void businessMethod() throws IOException, SQLException {
    // 指定的检查异常也会回滚
}

// 错误: 忘记配置 rollbackFor
@Transactional
public void businessMethod() throws IOException {
    throw new IOException("IO错误");  // 不会回滚!
}
```

### 3. 嵌套事务问题

**问题描述:**

内层事务回滚导致外层事务也回滚。

**解决方案:**

```java
// 使用 NESTED 传播行为
@Service
public class OuterServiceImpl {

    @Autowired
    private InnerService innerService;

    @Transactional(rollbackFor = Exception.class)
    public void outerMethod() {
        // 外层操作
        outerDao.insert(data);

        try {
            // 内层操作(嵌套事务)
            innerService.innerMethod();
        } catch (Exception e) {
            // 内层失败,只回滚内层
            log.warn("内层操作失败,继续外层", e);
        }

        // 外层继续
        outerDao.update(data);
    }
}

@Service
public class InnerServiceImpl implements InnerService {

    @Transactional(propagation = Propagation.NESTED, rollbackFor = Exception.class)
    public void innerMethod() {
        // 嵌套事务,失败只回滚自己
        innerDao.insert(data);
    }
}
```

### 4. 长事务问题

**问题描述:**

事务执行时间过长,导致数据库连接耗尽或锁等待超时。

**解决方案:**

```java
// 拆分大事务
@Service
public class BatchServiceImpl {

    /**
     * 错误: 一个大事务
     */
    @Transactional(rollbackFor = Exception.class)
    public void processBigBatch(List<DataBo> dataList) {
        for (DataBo data : dataList) {
            processData(data);  // 可能执行很长时间
        }
    }

    /**
     * 正确: 拆分成多个小事务
     */
    public void processBigBatch(List<DataBo> dataList) {
        // 分批处理
        List<List<DataBo>> batches = ListUtil.partition(dataList, 100);

        for (List<DataBo> batch : batches) {
            processBatch(batch);  // 每批一个事务
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void processBatch(List<DataBo> batch) {
        for (DataBo data : batch) {
            processData(data);
        }
    }
}
```

### 5. 分布式事务问题

**问题描述:**

跨服务或跨数据库的事务一致性无法保证。

**解决方案:**

```java
// 方案1: 使用本地消息表
@Service
public class OrderServiceImpl {

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderBo bo) {
        // 创建订单
        Order order = orderDao.insert(MapstructUtils.convert(bo, Order.class));

        // 写入本地消息表
        LocalMessage message = new LocalMessage();
        message.setType("ORDER_CREATED");
        message.setPayload(JsonUtils.toJson(order));
        message.setStatus("PENDING");
        localMessageDao.insert(message);
    }
}

// 定时任务发送消息
@Scheduled(fixedRate = 5000)
public void sendPendingMessages() {
    List<LocalMessage> messages = localMessageDao.listPending();
    for (LocalMessage message : messages) {
        try {
            // 发送到 MQ
            mqTemplate.send(message.getPayload());
            // 更新状态
            localMessageDao.updateStatus(message.getId(), "SENT");
        } catch (Exception e) {
            log.error("发送消息失败", e);
        }
    }
}

// 方案2: 使用 Seata 分布式事务
@GlobalTransactional(timeoutMills = 60000, rollbackFor = Exception.class)
public void crossServiceOperation(DataBo bo) {
    // 本地服务操作
    localService.process(bo);

    // 远程服务操作
    remoteService.process(bo);
}
```

### 6. 死锁问题

**问题描述:**

多个事务相互等待对方释放锁,导致死锁。

**解决方案:**

```java
// 按固定顺序加锁
@Transactional(rollbackFor = Exception.class)
public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
    // 按 ID 顺序加锁,避免死锁
    Long firstId = Math.min(fromId, toId);
    Long secondId = Math.max(fromId, toId);

    // 先锁定 ID 小的账户
    Account first = accountDao.selectForUpdate(firstId);

    // 再锁定 ID 大的账户
    Account second = accountDao.selectForUpdate(secondId);

    // 执行转账
    if (fromId.equals(firstId)) {
        first.setBalance(first.getBalance().subtract(amount));
        second.setBalance(second.getBalance().add(amount));
    } else {
        first.setBalance(first.getBalance().add(amount));
        second.setBalance(second.getBalance().subtract(amount));
    }

    accountDao.updateById(first);
    accountDao.updateById(second);
}

// 使用锁超时
@Transactional(timeout = 10, rollbackFor = Exception.class)
public void operationWithTimeout() {
    // 10秒超时,避免长时间死锁
}
```

## 事务监控与调优

### 事务监控

#### 开启事务日志

在 `application.yml` 中配置事务日志:

```yaml
# Spring 事务日志
logging:
  level:
    org.springframework.jdbc.datasource.DataSourceTransactionManager: DEBUG
    org.springframework.transaction: DEBUG
```

日志输出示例:

```text
Creating new transaction with name [xxx.service.impl.UserServiceImpl.createUser]: PROPAGATION_REQUIRED,ISOLATION_DEFAULT,timeout_-1,readOnly_false
Acquired Connection [HikariProxyConnection@123456] for JDBC transaction
Switching JDBC Connection [HikariProxyConnection@123456] to manual commit
Initiating transaction commit
Committing JDBC transaction on Connection [HikariProxyConnection@123456]
Releasing JDBC Connection [HikariProxyConnection@123456] after transaction
```

#### 事务监控指标

```java
import org.springframework.boot.actuate.metrics.CounterService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class TransactionMonitor {

    /**
     * 监控事务执行
     */
    public void monitorTransaction(String txName) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            long startTime = System.currentTimeMillis();

            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronizationAdapter() {
                    @Override
                    public void afterCompletion(int status) {
                        long duration = System.currentTimeMillis() - startTime;

                        if (status == STATUS_COMMITTED) {
                            log.info("事务提交成功: {}, 耗时: {}ms", txName, duration);
                        } else if (status == STATUS_ROLLED_BACK) {
                            log.warn("事务回滚: {}, 耗时: {}ms", txName, duration);
                        }

                        // 记录慢事务
                        if (duration > 1000) {
                            log.warn("慢事务警告: {}, 耗时: {}ms", txName, duration);
                        }
                    }
                }
            );
        }
    }
}

// 使用监控
@Service
public class UserServiceImpl {

    @Autowired
    private TransactionMonitor transactionMonitor;

    @Transactional(rollbackFor = Exception.class)
    public void createUser(UserBo bo) {
        transactionMonitor.monitorTransaction("createUser");

        // 业务逻辑
        userDao.insert(MapstructUtils.convert(bo, User.class));
    }
}
```

### 性能优化

#### 1. 批量操作优化

```java
@Service
public class BatchOptimizationServiceImpl {

    /**
     * 错误: 每次循环一个事务
     */
    public void batchInsertWrong(List<DataBo> dataList) {
        for (DataBo data : dataList) {
            insertOne(data);  // 每次都开启新事务
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void insertOne(DataBo data) {
        dataDao.insert(MapstructUtils.convert(data, Data.class));
    }

    /**
     * 正确: 批量插入一个事务
     */
    @Transactional(rollbackFor = Exception.class)
    public void batchInsertRight(List<DataBo> dataList) {
        // 使用 MyBatis-Plus 批量插入
        List<Data> list = MapstructUtils.convertList(dataList, Data.class);
        dataDao.batchInsert(list);
    }

    /**
     * 最优: 分批插入,控制事务大小
     */
    public void batchInsertBest(List<DataBo> dataList) {
        // 每 1000 条一批
        List<List<DataBo>> batches = ListUtil.partition(dataList, 1000);

        for (List<DataBo> batch : batches) {
            batchInsertOneBatch(batch);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchInsertOneBatch(List<DataBo> batch) {
        List<Data> list = MapstructUtils.convertList(batch, Data.class);
        dataDao.batchInsert(list);
    }
}
```

#### 2. 读写分离优化

```java
import com.baomidou.dynamic.datasource.annotation.DS;

@Service
public class ReadWriteSplitServiceImpl {

    /**
     * 写操作 - 主库
     */
    @DS("master")
    @Transactional(rollbackFor = Exception.class)
    public void writeOperation(DataBo bo) {
        dataDao.insert(MapstructUtils.convert(bo, Data.class));
    }

    /**
     * 读操作 - 从库
     */
    @DS("slave")
    @Transactional(readOnly = true)
    public DataVo readOperation(Long id) {
        return MapstructUtils.convert(dataDao.getById(id), DataVo.class);
    }

    /**
     * 读写混合 - 必须全部使用主库
     */
    @DS("master")
    @Transactional(rollbackFor = Exception.class)
    public void mixedOperation(DataBo bo) {
        // 查询
        Data existing = dataDao.getById(bo.getId());

        // 更新
        existing.setName(bo.getName());
        dataDao.updateById(existing);
    }
}
```

#### 3. 连接池优化

```yaml
# HikariCP 连接池配置
spring:
  datasource:
    hikari:
      # 最小空闲连接数
      minimum-idle: 10
      # 最大连接池大小
      maximum-pool-size: 50
      # 连接超时时间(毫秒)
      connection-timeout: 30000
      # 空闲连接最大存活时间(毫秒)
      idle-timeout: 600000
      # 连接最大生命周期(毫秒)
      max-lifetime: 1800000
      # 连接测试查询
      connection-test-query: SELECT 1
      # 自动提交
      auto-commit: false
```

#### 4. 缓存优化

```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
public class CacheOptimizationServiceImpl {

    /**
     * 查询缓存 - 减少数据库事务
     */
    @Cacheable(value = "user", key = "#id")
    @Transactional(readOnly = true)
    public UserVo getUser(Long id) {
        return MapstructUtils.convert(userDao.getById(id), UserVo.class);
    }

    /**
     * 更新时清除缓存
     */
    @CacheEvict(value = "user", key = "#bo.id")
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(UserBo bo) {
        User user = MapstructUtils.convert(bo, User.class);
        userDao.updateById(user);
    }
}
```

### 事务调优建议

#### 1. 减少事务持有时间

```java
@Service
public class TransactionOptimizationServiceImpl {

    /**
     * 错误: 事务中包含远程调用
     */
    @Transactional(rollbackFor = Exception.class)
    public void createOrderWrong(OrderBo bo) {
        // 创建订单
        Order order = orderDao.insert(MapstructUtils.convert(bo, Order.class));

        // 远程调用支付服务(耗时操作)
        paymentClient.createPayment(order.getOrderNo(), bo.getAmount());  // 可能很慢

        // 更新订单状态
        order.setStatus("PAID");
        orderDao.updateById(order);
    }

    /**
     * 正确: 事务外执行远程调用
     */
    public void createOrderRight(OrderBo bo) {
        // 事务内创建订单
        Order order = createOrderInTransaction(bo);

        // 事务外调用支付服务
        PaymentVo payment = paymentClient.createPayment(order.getOrderNo(), bo.getAmount());

        // 事务内更新订单
        updateOrderStatus(order.getOrderId(), "PAID");
    }

    @Transactional(rollbackFor = Exception.class)
    private Order createOrderInTransaction(OrderBo bo) {
        Order order = MapstructUtils.convert(bo, Order.class);
        orderDao.insert(order);
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    private void updateOrderStatus(Long orderId, String status) {
        Order order = new Order();
        order.setOrderId(orderId);
        order.setStatus(status);
        orderDao.updateById(order);
    }
}
```

#### 2. 避免大事务

```java
/**
 * 错误: 一个大事务处理所有数据
 */
@Transactional(rollbackFor = Exception.class)
public void processBigData(List<DataBo> dataList) {
    for (DataBo data : dataList) {
        // 复杂处理
        complexProcess(data);
    }
}

/**
 * 正确: 分批处理
 */
public void processBigData(List<DataBo> dataList) {
    // 每 100 条一批
    List<List<DataBo>> batches = ListUtil.partition(dataList, 100);

    for (List<DataBo> batch : batches) {
        processBatch(batch);
    }
}

@Transactional(rollbackFor = Exception.class)
public void processBatch(List<DataBo> batch) {
    for (DataBo data : batch) {
        complexProcess(data);
    }
}
```

#### 3. 合理设置超时

```java
/**
 * 短事务: 5秒超时
 */
@Transactional(timeout = 5, rollbackFor = Exception.class)
public void shortTransaction() {
    // 简单操作
}

/**
 * 中等事务: 30秒超时
 */
@Transactional(timeout = 30, rollbackFor = Exception.class)
public void normalTransaction() {
    // 普通业务操作
}

/**
 * 长事务: 5分钟超时
 */
@Transactional(timeout = 300, rollbackFor = Exception.class)
public void longTransaction() {
    // 批量数据处理
}
```

#### 4. 使用只读事务

```java
/**
 * 查询统计 - 使用只读事务
 */
@Transactional(readOnly = true)
public StatisticsVo getStatistics(QueryBo bo) {
    // 只读事务,数据库不需要维护写锁
    // 提高查询性能
    List<Data> dataList = dataDao.list(buildQueryWrapper(bo));
    return buildStatistics(dataList);
}
```

## 总结

RuoYi-Plus 框架提供了完善的事务管理机制,通过 Spring 的声明式和编程式事务管理,实现了灵活、强大的事务控制能力。

**核心要点:**

1. **声明式事务** - 使用 `@Transactional` 注解,简洁易用,适合大多数场景
2. **编程式事务** - 使用 `TransactionTemplate` 或 `PlatformTransactionManager`,适合需要精细控制的场景
3. **传播行为** - 7 种传播行为满足不同业务需求,合理选择避免事务嵌套问题
4. **隔离级别** - 4 种标准隔离级别,平衡并发性能和数据一致性
5. **异常回滚** - 必须配置 `rollbackFor = Exception.class`,确保所有异常都回滚
6. **性能优化** - 减少事务持有时间、避免大事务、使用批量操作和只读事务

**最佳实践:**

- 事务方法必须是 public,避免同类内部调用
- 明确指定 rollbackFor,不依赖默认行为
- 控制事务粒度,避免过大或过小
- 合理使用传播行为,独立日志使用 REQUIRES_NEW
- 设置合理的超时时间,防止死锁和长时间等待
- 监控事务执行,及时发现和优化慢事务

通过遵循这些最佳实践,可以构建高性能、高可靠的事务管理体系,确保数据的一致性和完整性。
