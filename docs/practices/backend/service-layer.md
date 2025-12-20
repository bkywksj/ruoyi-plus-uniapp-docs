# Service 层最佳实践

本文档详细介绍 ruoyi-plus-uniapp 项目中 Service 层的设计原则和最佳实践。

## 核心设计原则

### 1. 不继承任何基类

**重要**: 本项目的 Service 实现类**不继承任何基类**,这是与 ruoyi-vue-plus 框架的核心区别。

```java
// ✅ 正确 - 本项目的做法
@Service
@RequiredArgsConstructor
public class AdServiceImpl implements IAdService {
    private final IAdDao adDao;
    // ...
}

// ❌ 错误 - 不要这样做
@Service
public class AdServiceImpl extends ServiceImpl<AdMapper, Ad> implements IAdService {
    // 本项目不使用这种继承方式
}
```

**设计理由**:
- 更清晰的依赖关系
- 避免继承带来的隐式依赖
- 更灵活的方法定义
- 更符合组合优于继承的原则

---

## Service 接口设计

### 标准接口定义

```java
package plus.ruoyi.business.base.service;

import plus.ruoyi.business.base.domain.bo.AdBo;
import plus.ruoyi.business.base.domain.vo.AdVo;
import plus.ruoyi.common.mybatis.core.page.PageQuery;
import plus.ruoyi.common.mybatis.core.page.PageResult;
import java.util.Collection;
import java.util.List;

/**
 * 广告配置服务接口
 *
 * @author 抓蛙师
 */
public interface IAdService {

    /**
     * 根据ID查询
     */
    AdVo get(Long id);

    /**
     * 查询列表
     */
    List<AdVo> list(AdBo bo);

    /**
     * 分页查询
     */
    PageResult<AdVo> page(AdBo bo, PageQuery pageQuery);

    /**
     * 新增
     */
    Long add(AdBo bo);

    /**
     * 修改
     */
    boolean update(AdBo bo);

    /**
     * 批量删除
     */
    boolean batchDelete(Collection<Long> ids);

    /**
     * 批量保存
     */
    boolean batchSave(List<AdBo> boList);
}
```

**接口设计要点**:
- ✅ 不继承 `IBaseService`
- ✅ 方法命名简洁清晰
- ✅ 返回值明确具体
- ✅ 参数使用业务对象(Bo)

---

## Service 实现类设计

### 1. 依赖注入 - 只注入 DAO

```java
@Service
@RequiredArgsConstructor  // Lombok 生成构造函数
public class AdServiceImpl implements IAdService {

    private final IAdDao adDao;  // ✅ 只注入 DAO,不注入 Mapper

    // ...
}
```

**关键原则**:
- ✅ 使用 `@RequiredArgsConstructor` 进行构造函数注入
- ✅ 依赖字段使用 `final` 修饰
- ✅ 只注入 DAO 层接口,不直接注入 Mapper
- ❌ 不使用 `@Autowired` 字段注入

---

### 2. 查询方法实现

#### 单条查询

```java
@Override
public AdVo get(Long id) {
    Ad entity = adDao.getById(id);
    return MapstructUtils.convert(entity, AdVo.class);
}
```

**实现要点**:
- DAO 层获取实体
- 使用 `MapstructUtils.convert()` 转换为 VO
- 简洁明了,无需额外逻辑

---

#### 列表查询

```java
@Override
public List<AdVo> list(AdBo bo) {
    // 1. 通过 DAO 构建查询条件
    PlusLambdaQuery<Ad> wrapper = adDao.buildQueryWrapper(bo);

    // 2. 执行查询
    List<Ad> entities = adDao.list(wrapper);

    // 3. 转换为 VO 列表
    return MapstructUtils.convert(entities, AdVo.class);
}
```

**实现要点**:
- ✅ 调用 DAO 的 `buildQueryWrapper()` 构建查询
- ✅ Service 层不直接构建查询条件
- ✅ 使用 `MapstructUtils.convert()` 批量转换

---

#### 分页查询

```java
@Override
public PageResult<AdVo> page(AdBo bo, PageQuery pageQuery) {
    // 1. 构建查询条件
    PlusLambdaQuery<Ad> wrapper = adDao.buildQueryWrapper(bo);

    // 2. 执行分页查询
    PageResult<Ad> entityPage = adDao.page(wrapper, pageQuery);

    // 3. 转换分页结果
    return entityPage.convert(AdVo.class);
}
```

**实现要点**:
- ✅ 使用 `PageResult` 的 `convert()` 方法转换
- ✅ 自动处理分页信息(总数、页码等)
- ✅ 一行代码完成类型转换

---

### 3. 新增方法实现

```java
@Override
@Transactional(rollbackFor = Exception.class)
public Long add(AdBo bo) {
    // 1. BO 转换为 Entity
    Ad entity = MapstructUtils.convert(bo, Ad.class);

    // 2. 调用保存前钩子
    beforeSave(entity);

    // 3. 插入数据库
    adDao.insert(entity);

    // 4. 返回生成的 ID
    return entity.getId();
}
```

**实现要点**:
- ✅ 必须添加 `@Transactional(rollbackFor = Exception.class)`
- ✅ 使用 `beforeSave()` 钩子方法
- ✅ 插入后自动回填主键 ID
- ✅ 返回新生成的主键

---

### 4. 修改方法实现

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean update(AdBo bo) {
    // 1. 参数校验
    if (bo.getId() == null) {
        throw ServiceException.of("广告配置ID不能为空");
    }

    // 2. 存在性校验
    if (!adDao.exists(bo.getId())) {
        throw ServiceException.of("广告配置不存在");
    }

    // 3. BO 转换为 Entity
    Ad entity = MapstructUtils.convert(bo, Ad.class);

    // 4. 调用保存前钩子
    beforeSave(entity);

    // 5. 更新数据库
    return adDao.updateById(entity);
}
```

**实现要点**:
- ✅ 先校验 ID 是否为空
- ✅ 校验记录是否存在
- ✅ 使用 `ServiceException.of()` 抛出异常
- ✅ 调用 `beforeSave()` 钩子
- ✅ 使用 `updateById()` 更新

---

### 5. 删除方法实现

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean batchDelete(Collection<Long> ids) {
    // 1. 参数校验
    if (CollUtil.isEmpty(ids)) {
        throw ServiceException.of("ID集合不能为空");
    }

    // 2. 调用删除前钩子
    beforeDelete(ids);

    // 3. 批量删除
    return adDao.deleteByIds(ids);
}
```

**实现要点**:
- ✅ 使用 `CollUtil.isEmpty()` 校验集合
- ✅ 调用 `beforeDelete()` 钩子
- ✅ 支持批量删除

---

### 6. 批量保存方法实现

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean batchSave(List<AdBo> boList) {
    // 1. 空集合快速返回
    if (CollUtil.isEmpty(boList)) {
        return true;
    }

    // 2. 批量转换 + 钩子调用
    List<Ad> entities = new ArrayList<>(boList.size());
    for (AdBo bo : boList) {
        Ad entity = MapstructUtils.convert(bo, Ad.class);
        beforeSave(entity);  // 每条记录调用钩子
        entities.add(entity);
    }

    // 3. 批量保存
    return adDao.batchSave(entities);
}
```

**实现要点**:
- ✅ 空集合快速返回
- ✅ 预分配 ArrayList 容量
- ✅ 每条记录调用 `beforeSave()` 钩子
- ✅ 使用 DAO 的 `batchSave()` 方法

---

## 钩子方法设计

### 保存前钩子

```java
/**
 * 保存前钩子方法
 * 子类可重写此方法实现数据校验、默认值设置等逻辑
 *
 * @param entity 实体对象
 */
protected void beforeSave(Ad entity) {
    // 默认实现为空,子类按需重写
}
```

**使用场景**:
- 数据校验
- 设置默认值
- 数据补全
- 业务规则检查

**示例 - 设置默认值**:

```java
@Override
protected void beforeSave(Ad entity) {
    // 设置默认状态
    if (entity.getStatus() == null) {
        entity.setStatus("1");  // 默认启用
    }

    // 设置默认排序
    if (entity.getOrderNum() == null) {
        entity.setOrderNum(0);
    }
}
```

**示例 - 业务校验**:

```java
@Override
protected void beforeSave(Ad entity) {
    // 校验广告名称唯一性
    if (adDao.existsByName(entity.getAdName(), entity.getId())) {
        throw ServiceException.of("广告名称已存在");
    }

    // 校验时间范围
    if (entity.getEndTime() != null &&
        entity.getStartTime() != null &&
        entity.getEndTime().before(entity.getStartTime())) {
        throw ServiceException.of("结束时间不能早于开始时间");
    }
}
```

---

### 删除前钩子

```java
/**
 * 删除前钩子方法
 * 子类可重写此方法实现关联数据校验、清理等逻辑
 *
 * @param ids 待删除的ID集合
 */
protected void beforeDelete(Collection<Long> ids) {
    // 默认实现为空,子类按需重写
}
```

**使用场景**:
- 关联数据检查
- 级联删除
- 删除权限校验
- 删除日志记录

**示例 - 关联数据检查**:

```java
@Override
protected void beforeDelete(Collection<Long> ids) {
    // 检查是否有关联的订单
    long orderCount = orderDao.countByAdIds(ids);
    if (orderCount > 0) {
        throw ServiceException.of("存在关联订单,无法删除");
    }
}
```

**示例 - 级联删除**:

```java
@Override
protected void beforeDelete(Collection<Long> ids) {
    // 删除关联的广告图片
    adImageDao.deleteByAdIds(ids);

    // 删除关联的广告统计数据
    adStatDao.deleteByAdIds(ids);
}
```

---

## 对象转换规范

### 使用 MapstructUtils

本项目统一使用 `MapstructUtils.convert()` 进行对象转换。

#### 单对象转换

```java
// Bo -> Entity
Ad entity = MapstructUtils.convert(bo, Ad.class);

// Entity -> Vo
AdVo vo = MapstructUtils.convert(entity, AdVo.class);
```

#### 列表转换

```java
// List<Entity> -> List<Vo>
List<Ad> entities = adDao.list(wrapper);
List<AdVo> voList = MapstructUtils.convert(entities, AdVo.class);
```

#### 分页结果转换

```java
// PageResult<Entity> -> PageResult<Vo>
PageResult<Ad> entityPage = adDao.page(wrapper, pageQuery);
PageResult<AdVo> voPage = entityPage.convert(AdVo.class);
```

**为什么使用 MapstructUtils**:
- ✅ 编译期生成代码,性能高
- ✅ 类型安全,编译检查
- ✅ 代码简洁,一行搞定
- ✅ 支持嵌套对象转换
- ❌ 不使用 BeanUtils.copyProperties()

---

## 事务管理

### 事务注解规范

```java
@Override
@Transactional(rollbackFor = Exception.class)
public Long add(AdBo bo) {
    // ...
}
```

**事务配置要点**:
- ✅ 所有写操作(增删改)必须加 `@Transactional`
- ✅ 必须指定 `rollbackFor = Exception.class`
- ✅ 查询操作不需要事务注解
- ✅ 事务粒度控制在单个 Service 方法

---

## 异常处理

### 使用 ServiceException

```java
// 抛出业务异常
if (bo.getId() == null) {
    throw ServiceException.of("广告配置ID不能为空");
}

// 条件判断抛出
if (!adDao.exists(bo.getId())) {
    throw ServiceException.of("广告配置不存在");
}

// 使用 throwIf 简化
ServiceException.throwIf(bo.getId() == null, "广告配置ID不能为空");

// 使用 notNull 校验
ServiceException.notNull(bo.getId(), "广告配置ID不能为空");
```

**异常处理原则**:
- ✅ 使用 `ServiceException.of()` 创建异常
- ✅ 异常信息清晰明确
- ✅ 在 Service 层抛出,Controller 层统一处理
- ❌ 不使用 `RuntimeException`
- ❌ 不吞异常

---

## 常见业务场景

### 1. 状态变更

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean changeStatus(Long id, String status) {
    // 1. 存在性校验
    Ad entity = adDao.getById(id);
    ServiceException.notNull(entity, "广告不存在");

    // 2. 状态校验
    if (entity.getStatus().equals(status)) {
        throw ServiceException.of("状态未发生变化");
    }

    // 3. 更新状态
    entity.setStatus(status);
    return adDao.updateById(entity);
}
```

---

### 2. 数据导入

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean importData(List<AdBo> boList) {
    if (CollUtil.isEmpty(boList)) {
        return true;
    }

    // 1. 数据校验
    for (AdBo bo : boList) {
        validateImportData(bo);
    }

    // 2. 批量保存
    return batchSave(boList);
}

private void validateImportData(AdBo bo) {
    // 必填字段校验
    ServiceException.notNull(bo.getAdName(), "广告名称不能为空");

    // 数据格式校验
    if (bo.getAdName().length() > 100) {
        throw ServiceException.of("广告名称长度不能超过100");
    }
}
```

---

### 3. 关联查询

```java
@Override
public AdVo getWithDetails(Long id) {
    // 1. 查询主表
    Ad entity = adDao.getById(id);
    ServiceException.notNull(entity, "广告不存在");

    // 2. 转换为 VO
    AdVo vo = MapstructUtils.convert(entity, AdVo.class);

    // 3. 查询关联数据
    List<AdImage> images = adImageDao.listByAdId(id);
    vo.setImages(MapstructUtils.convert(images, AdImageVo.class));

    // 4. 统计数据
    AdStat stat = adStatDao.getByAdId(id);
    vo.setStat(MapstructUtils.convert(stat, AdStatVo.class));

    return vo;
}
```

---

## 多 DAO 协作模式

在复杂的业务场景中，一个 Service 可能需要协调多个 DAO 完成业务操作。

### 多 DAO 注入示例

```java
@Slf4j
@RequiredArgsConstructor
@Service
public class SysUserServiceImpl implements ISysUserService, UserService {

    // 注入多个 DAO
    private final ISysDeptDao deptDao;
    private final ISysRoleDao roleDao;
    private final ISysPostDao postDao;
    private final ISysUserDao userDao;
    private final ISysUserRoleDao userRoleDao;
    private final ISysUserPostDao userPostDao;

    // Service 方法实现...
}
```

**设计要点**:
- ✅ 每个 DAO 负责一个表的操作
- ✅ Service 层协调多个 DAO 完成复杂业务
- ✅ 使用 `@RequiredArgsConstructor` 统一注入
- ✅ 所有 DAO 使用 `final` 修饰

---

### 辅助方法处理复杂逻辑

```java
/**
 * Service层辅助方法：处理部门树查询
 */
private void processDeptIds(SysUserBo user) {
    if (ObjectUtil.isNotNull(user.getDeptId())) {
        // 查询子部门ID列表
        List<Long> deptIds = deptDao.listChildrenDeptIds(user.getDeptId());
        deptIds.add(user.getDeptId());
        user.setDeptIds(deptIds);
    }
}

@Override
public PageResult<SysUserVo> pageUsers(SysUserBo user, PageQuery pageQuery) {
    // 使用辅助方法处理复杂逻辑
    processDeptIds(user);
    return userDao.pageWithPermission(user, pageQuery.build());
}
```

---

## 缓存集成

### 使用 Spring Cache 注解

```java
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import plus.ruoyi.common.core.constant.CacheNames;

@Service
public class SysUserServiceImpl implements ISysUserService {

    /**
     * 缓存查询 - 通过用户ID查询用户名
     */
    @Cacheable(cacheNames = CacheNames.SYS_USER_NAME, key = "#userId")
    @Override
    public String getUserNameById(Long userId) {
        return userDao.getUserNameById(userId);
    }

    /**
     * 缓存查询 - 通过用户ID查询昵称
     */
    @Override
    @Cacheable(cacheNames = CacheNames.SYS_NICKNAME, key = "#userId")
    public String getNickNameById(Long userId) {
        return userDao.getNickNameById(userId);
    }

    /**
     * 缓存清除 - 更新用户时清除缓存
     */
    @Override
    @CacheEvict(cacheNames = CacheNames.SYS_NICKNAME, key = "#user.userId")
    @Transactional(rollbackFor = Exception.class)
    public boolean updateUser(SysUserBo user) {
        // 更新用户逻辑...
        return userDao.updateById(sysUser);
    }
}
```

**缓存注解说明**:

| 注解 | 说明 | 使用场景 |
|------|------|----------|
| `@Cacheable` | 读取缓存,不存在则执行方法并缓存 | 查询操作 |
| `@CacheEvict` | 清除缓存 | 更新/删除操作 |
| `@CachePut` | 执行方法并更新缓存 | 更新操作 |
| `@Caching` | 组合多个缓存注解 | 复杂缓存场景 |

---

### AOP 代理调用缓存方法

```java
/**
 * 通过用户ID串查询用户昵称
 */
@Override
public String getNickNamesByIds(String userIds) {
    List<String> list = new ArrayList<>();
    for (Long id : StringUtils.splitToList(userIds, Convert::toLong)) {
        // ✅ 使用 AOP 代理调用,确保缓存生效
        String nickname = SpringUtils.getAopProxy(this).getNickNameById(id);
        if (StringUtils.isNotBlank(nickname)) {
            list.add(nickname);
        }
    }
    return StringUtils.joinComma(list);
}
```

**关键点**:
- ✅ 同类方法调用必须使用 `SpringUtils.getAopProxy(this)` 获取代理对象
- ❌ 直接调用 `this.getNickNameById(id)` 不会触发缓存

---

### 缓存常量定义

```java
/**
 * 缓存名称常量
 */
public interface CacheNames {
    /** 用户名缓存 */
    String SYS_USER_NAME = "sys:user:name";

    /** 昵称缓存 */
    String SYS_NICKNAME = "sys:user:nickname";

    /** 头像缓存 */
    String SYS_AVATAR = "sys:user:avatar";

    /** 字典缓存 */
    String SYS_DICT = "sys:dict";

    /** 配置缓存 */
    String SYS_CONFIG = "sys:config";
}
```

---

## 唯一性校验

### 标准唯一性校验方法

```java
/**
 * 判断用户名称是否唯一
 *
 * @param userName 用户名
 * @param userId   用户ID（可为null，新增时传null）
 * @return true表示唯一，false表示重复
 */
@Override
public boolean isUserNameUnique(String userName, Long userId) {
    return userDao.checkUserNameUnique(userName, userId);
}

/**
 * 判断手机号码是否唯一
 */
@Override
public boolean isPhoneUnique(String phone, Long userId) {
    return userDao.checkPhoneUnique(phone, userId);
}

/**
 * 判断email是否唯一
 */
@Override
public boolean isEmailUnique(String email, Long userId) {
    return userDao.checkEmailUnique(email, userId);
}
```

**设计要点**:
- ✅ 新增时 userId 传 null,更新时传实际ID
- ✅ 校验逻辑在 DAO 层实现
- ✅ 返回 boolean 类型便于调用方判断

---

### DAO 层唯一性校验实现

```java
// DAO 接口
public interface ISysUserDao extends IBaseDao<SysUser> {

    /**
     * 检查用户名是否唯一
     * @param userName 用户名
     * @param excludeUserId 排除的用户ID(更新时排除自身)
     * @return true-唯一 false-重复
     */
    boolean checkUserNameUnique(String userName, Long excludeUserId);
}

// DAO 实现
@Override
public boolean checkUserNameUnique(String userName, Long excludeUserId) {
    return !exists(new LambdaQueryWrapper<SysUser>()
        .eq(SysUser::getUserName, userName)
        .ne(excludeUserId != null, SysUser::getUserId, excludeUserId));
}
```

---

## 权限校验

### 操作权限校验

```java
/**
 * 校验用户是否允许操作
 *
 * @param userId 用户ID
 */
@Override
public void checkUserAllowed(Long userId) {
    if (ObjectUtil.isNotNull(userId) && LoginHelper.isSuperAdmin(userId)) {
        throw ServiceException.of("不允许操作超级管理员用户");
    }
}
```

---

### 数据权限校验

```java
/**
 * 校验用户是否有数据权限
 *
 * @param userId 用户ID
 */
@Override
public void checkUserDataScope(Long userId) {
    // 空ID直接返回
    if (ObjectUtil.isNull(userId)) {
        return;
    }

    // 超管跳过校验
    if (LoginHelper.isSuperAdmin()) {
        return;
    }

    // 检查当前用户是否有权限访问目标用户数据
    if (userDao.countUserById(userId) == 0) {
        throw ServiceException.of("没有权限访问用户数据！");
    }
}
```

---

### 批量操作前权限校验

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean deleteUserByIds(Long[] userIds) {
    // 1. 逐个校验权限
    for (Long userId : userIds) {
        checkUserAllowed(userId);
        checkUserDataScope(userId);
    }

    List<Long> ids = List.of(userIds);

    // 2. 删除关联数据
    userRoleDao.batchDeleteByUserIds(ids);
    userPostDao.batchDeleteByUserIds(ids);

    // 3. 删除用户
    boolean success = userDao.deleteByIds(ids);
    if (!success) {
        throw ServiceException.of("删除用户失败!");
    }
    return true;
}
```

---

## 名称映射查询

### 批量查询ID到名称的映射

```java
/**
 * 根据用户ID列表查询用户名称映射关系
 *
 * @param userIds 用户ID列表
 * @return Map，其中key为用户ID，value为对应的用户名称
 */
@Override
public Map<Long, String> mapUserNames(List<Long> userIds) {
    if (CollUtil.isEmpty(userIds)) {
        return Collections.emptyMap();
    }

    return userDao.listUserNamesById(userIds)
        .stream()
        .collect(Collectors.toMap(
            SysUser::getUserId,
            SysUser::getNickName
        ));
}

/**
 * 根据角色ID列表查询角色名称映射关系
 */
@Override
public Map<Long, String> mapRoleNames(List<Long> roleIds) {
    if (CollUtil.isEmpty(roleIds)) {
        return Collections.emptyMap();
    }

    return roleDao.listRoleNamesById(roleIds)
        .stream()
        .collect(Collectors.toMap(
            SysRole::getRoleId,
            SysRole::getRoleName
        ));
}

/**
 * 根据部门ID列表查询部门名称映射关系
 */
@Override
public Map<Long, String> mapDeptNames(List<Long> deptIds) {
    if (CollUtil.isEmpty(deptIds)) {
        return Collections.emptyMap();
    }

    return deptDao.listDeptNamesById(deptIds)
        .stream()
        .collect(Collectors.toMap(
            SysDept::getDeptId,
            SysDept::getDeptName
        ));
}
```

**使用场景**:
- 列表数据中需要显示关联名称(如用户列表显示部门名称)
- 避免 N+1 查询问题
- 一次查询获取所有需要的名称映射

---

## 事件发布与异步处理

### 事件发布模式

```java
@Slf4j
@RequiredArgsConstructor
@Service
public class OrderServiceImpl implements IOrderService {

    private final IOrderDao orderDao;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 从支付平台同步支付状态
     */
    private void syncPaymentStatusFromPlatform(Order order) {
        // 查询支付平台状态...

        // 如果支付成功,发布支付成功事件
        if ("SUCCESS".equals(tradeState)) {
            PaySuccessEvent event = PaySuccessEvent.builder()
                .source(this)
                .outTradeNo(order.getOrderNo())
                .transactionId(response.getTransactionId())
                .totalFee(String.valueOf(PayUtils.yuanToFen(response.getTotalAmount())))
                .paymentMethod(paymentMethod.getValue())
                .appId(appid)
                .build();

            // 发布事件
            eventPublisher.publishEvent(event);
            log.info("支付状态同步成功: orderNo={}, 已发布支付成功事件",
                order.getOrderNo());
        }
    }
}
```

---

### 事件监听器

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPaymentEventListener {

    private final IOrderService orderService;

    /**
     * 处理支付成功事件
     */
    @EventListener
    @Transactional(rollbackFor = Exception.class)
    public void handlePaySuccess(PaySuccessEvent event) {
        log.info("收到支付成功事件: orderNo={}, transactionId={}",
            event.getOutTradeNo(), event.getTransactionId());

        // 更新订单状态
        orderService.updateOrderByOutTradeNo(
            event.getOutTradeNo(),
            DictOrderStatus.PAID.getValue(),
            event.getTransactionId(),
            event.getPaymentMethod()
        );

        // 可以在这里添加其他后续逻辑
        // - 发送支付成功通知
        // - 更新库存
        // - 记录支付日志等
    }
}
```

**事件模式优点**:
- ✅ 解耦业务逻辑
- ✅ 便于扩展(添加新监听器无需修改原代码)
- ✅ 支持异步处理(`@Async`)
- ✅ 事务隔离

---

## 可选依赖注入

### 使用 @Autowired(required = false)

```java
@Slf4j
@RequiredArgsConstructor
@Service
public class OrderServiceImpl implements IOrderService {

    private final IOrderDao orderDao;

    /**
     * 支付服务(可选注入,用于查询支付状态)
     */
    @Autowired(required = false)
    private PayService payService;

    private void syncPaymentStatusFromPlatform(Order order) {
        // 1. 检查支付服务是否可用
        if (payService == null) {
            log.warn("支付服务未启用,无法同步支付状态: {}", order.getOrderNo());
            return;
        }

        // 使用支付服务...
    }
}
```

**使用场景**:
- 可选模块依赖(如支付模块)
- 扩展功能依赖
- 避免缺少 Bean 时启动失败

---

## 多租户处理

### 忽略租户隔离

```java
/**
 * 根据商户订单号更新订单状态
 * <p>
 * 注意: 此方法用于支付回调场景,会忽略租户隔离
 * 原因: 支付回调请求来自第三方支付平台,没有用户登录上下文
 */
@Override
@Transactional(rollbackFor = Exception.class)
public boolean updateOrderByOutTradeNo(String outTradeNo, String orderStatus,
                                        String transactionId, String paymentMethod) {
    // 支付回调时忽略租户隔离
    return TenantHelper.ignore(() -> {
        try {
            // 业务逻辑...
            Order existingOrder = orderDao.getByOrderNo(outTradeNo);
            if (existingOrder == null) {
                throw new ServiceException("未找到订单: " + outTradeNo);
            }

            // 更新订单...
            return true;
        } catch (Exception e) {
            log.error("更新订单状态失败: {}", e.getMessage(), e);
            return false;
        }
    });
}
```

**使用场景**:
- 第三方回调(支付回调、消息推送回调)
- 定时任务处理跨租户数据
- 系统级操作

---

## JSON 数据处理

### 扩展信息存储与读取

```java
/**
 * 创建订单 - 处理扩展信息
 */
@Override
@Transactional(rollbackFor = Exception.class)
public CreateOrderVo createOrder(CreateOrderBo bo) {
    Order order = new Order();
    // 基本信息设置...

    // 处理扩展信息
    if (bo.getOrderExtInfo() == null) {
        bo.setOrderExtInfo(new OrderExtInfoDto());
    }

    // 自动设置appid
    try {
        if (LoginHelper.isLogin()) {
            String appid = LoginHelper.getAppid();
            if (StringUtils.isNotBlank(appid)) {
                bo.getOrderExtInfo().setAppid(appid);
            }
        }
    } catch (Exception e) {
        log.warn("获取登录用户appid失败: {}", e.getMessage());
    }

    // 序列化扩展信息
    order.setOrderExtInfo(JsonUtils.toJsonString(bo.getOrderExtInfo()));

    // 保存订单...
    orderDao.insert(order);

    return vo;
}
```

---

### 读取 JSON 扩展信息

```java
/**
 * 获取订单对应的appid
 */
private String getAppidForOrder(Order order) {
    // 从订单扩展信息中获取appid
    if (StringUtils.isNotBlank(order.getOrderExtInfo())) {
        try {
            OrderExtInfoDto extInfo = JsonUtils.parseObject(
                order.getOrderExtInfo(),
                OrderExtInfoDto.class
            );
            if (extInfo != null && StringUtils.isNotBlank(extInfo.getAppid())) {
                return extInfo.getAppid();
            }
        } catch (Exception e) {
            log.warn("解析订单扩展信息失败: orderNo={}, error={}",
                order.getOrderNo(), e.getMessage());
        }
    }

    return null;
}
```

---

## 订单状态机模式

### 状态变更方法

```java
/**
 * 取消订单
 */
@Override
@Transactional(rollbackFor = Exception.class)
public boolean cancelOrder(String orderNo, Long userId) {
    log.info("开始取消订单: orderNo={}, userId={}", orderNo, userId);

    // 1. 参数校验
    if (StringUtils.isBlank(orderNo)) {
        throw ServiceException.of("订单号不能为空");
    }

    // 2. 查询订单(带用户权限校验)
    Order existingOrder = orderDao.getByOrderNoAndUserId(orderNo, userId);
    if (existingOrder == null) {
        throw ServiceException.of("未找到订单或无权限操作: " + orderNo);
    }

    // 3. 检查订单状态(状态机校验)
    if (!DictOrderStatus.PENDING.getValue().equals(existingOrder.getOrderStatus())) {
        throw ServiceException.of("订单状态不允许取消，当前状态: " +
            existingOrder.getOrderStatus());
    }

    // 4. 更新订单状态
    existingOrder.setOrderStatus(DictOrderStatus.CANCELLED.getValue());
    return orderDao.updateById(existingOrder);
}
```

---

### 发货操作

```java
/**
 * 订单发货
 */
@Override
@Transactional(rollbackFor = Exception.class)
public boolean deliverOrder(Long orderId, String shippingInfo) {
    log.info("开始订单发货: orderId={}", orderId);

    // 1. 参数校验
    if (orderId == null) {
        throw ServiceException.of("订单ID不能为空");
    }
    if (StringUtils.isBlank(shippingInfo)) {
        throw ServiceException.of("物流信息不能为空");
    }

    // 2. 查询订单
    Order existingOrder = orderDao.getById(orderId);
    if (existingOrder == null) {
        throw ServiceException.of("未找到订单: " + orderId);
    }

    // 3. 状态机校验 - 只有已支付的订单才能发货
    if (!DictOrderStatus.PAID.getValue().equals(existingOrder.getOrderStatus())) {
        throw ServiceException.of(
            "订单状态不允许发货，当前状态: " + existingOrder.getOrderStatus() +
            "，只有已支付的订单才能发货"
        );
    }

    // 4. 更新状态和物流信息
    existingOrder.setOrderStatus(DictOrderStatus.DELIVERED.getValue());
    existingOrder.setShippingInfo(shippingInfo);

    return orderDao.updateById(existingOrder);
}
```

**状态机设计要点**:
- ✅ 明确定义状态转换规则
- ✅ 每次状态变更前校验当前状态
- ✅ 使用枚举管理状态值
- ✅ 记录状态变更日志

---

## 性能优化建议

### 1. 批量操作优化

```java
// ❌ 错误 - 循环调用单条插入
for (AdBo bo : boList) {
    add(bo);
}

// ✅ 正确 - 使用批量保存
batchSave(boList);
```

---

### 2. 避免 N+1 查询

```java
// ❌ 错误 - N+1 查询
List<Ad> ads = adDao.list(wrapper);
for (Ad ad : ads) {
    List<AdImage> images = adImageDao.listByAdId(ad.getId());  // N 次查询
    // ...
}

// ✅ 正确 - 批量查询
List<Ad> ads = adDao.list(wrapper);
List<Long> adIds = ads.stream().map(Ad::getId).collect(Collectors.toList());
List<AdImage> allImages = adImageDao.listByAdIds(adIds);  // 1 次查询
Map<Long, List<AdImage>> imageMap = allImages.stream()
    .collect(Collectors.groupingBy(AdImage::getAdId));
```

---

### 3. 分页查询优化

```java
// ✅ 只查询必要的字段
@Override
public PageResult<AdSimpleVo> pageSimple(AdBo bo, PageQuery pageQuery) {
    PlusLambdaQuery<Ad> wrapper = adDao.buildQueryWrapper(bo);

    // 只查询必要字段
    wrapper.select(Ad::getId, Ad::getAdName, Ad::getStatus, Ad::getCreateTime);

    PageResult<Ad> entityPage = adDao.page(wrapper, pageQuery);
    return entityPage.convert(AdSimpleVo.class);
}
```

---

### 4. 使用 Stream API 优化集合处理

```java
// ✅ 使用 Stream API
List<Long> userIds = users.stream()
    .map(SysUser::getUserId)
    .collect(Collectors.toList());

// ✅ 使用工具类简化
List<Long> userIds = StreamUtils.toList(users, SysUser::getUserId);
Set<Long> userIdSet = StreamUtils.toSet(users, SysUser::getUserId);
String names = StreamUtils.join(users, SysUser::getNickName);
```

---

### 5. 空集合快速返回

```java
@Override
public List<UserDTO> listUsersByIds(List<Long> userIds) {
    // ✅ 空集合快速返回
    if (CollUtil.isEmpty(userIds)) {
        return List.of();
    }

    List<SysUser> list = userDao.listByIds(userIds);
    return BeanUtil.copyToList(
        MapstructUtils.convert(list, SysUserVo.class),
        UserDTO.class
    );
}
```

---

## 日志记录最佳实践

### 使用 Slf4j 注解

```java
@Slf4j  // Lombok 自动生成 log 对象
@RequiredArgsConstructor
@Service
public class OrderServiceImpl implements IOrderService {

    /**
     * 创建订单 - 完整的日志记录示例
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public CreateOrderVo createOrder(CreateOrderBo bo) {
        try {
            // 入口日志 - 记录关键参数
            log.info("开始创建订单: goodsId={}, goodsName={}, userId={}",
                bo.getGoodsId(), bo.getGoodsName(), bo.getUserId());

            // 业务逻辑...

            // 成功日志
            log.info("订单创建成功: orderId={}, orderNo={}",
                order.getId(), bo.getOrderNo());

            return vo;

        } catch (Exception e) {
            // 异常日志 - 包含完整堆栈
            log.error("创建订单失败: goodsId={}, userId={}, 错误: {}",
                bo.getGoodsId(), bo.getUserId(), e.getMessage(), e);
            throw new ServiceException("创建订单失败: " + e.getMessage());
        }
    }
}
```

---

### 日志级别使用规范

| 级别 | 使用场景 | 示例 |
|------|----------|------|
| `error` | 影响业务的异常 | 订单创建失败、支付回调处理异常 |
| `warn` | 潜在问题但不影响主流程 | 可选服务不可用、数据格式不完整 |
| `info` | 关键业务节点 | 订单创建成功、支付完成、状态变更 |
| `debug` | 调试信息 | 参数值、中间计算结果 |
| `trace` | 详细追踪 | 循环内部状态(生产环境通常关闭) |

---

### 日志参数化

```java
// ✅ 正确 - 使用占位符,延迟字符串拼接
log.info("用户登录: userId={}, userName={}", userId, userName);

// ❌ 错误 - 字符串拼接,即使日志级别关闭也会执行
log.info("用户登录: userId=" + userId + ", userName=" + userName);

// ✅ 条件日志 - 避免不必要的对象创建
if (log.isDebugEnabled()) {
    log.debug("详细数据: {}", JsonUtils.toJsonString(complexObject));
}
```

---

## 单元测试

### Service 层测试结构

```java
@SpringBootTest
@ActiveProfiles("test")
class AdServiceImplTest {

    @Autowired
    private IAdService adService;

    @MockBean
    private IAdDao adDao;

    @Test
    @DisplayName("根据ID查询广告 - 成功")
    void get_shouldReturnAdVo_whenAdExists() {
        // Arrange
        Long adId = 1L;
        Ad mockAd = new Ad();
        mockAd.setId(adId);
        mockAd.setAdName("测试广告");
        mockAd.setStatus("1");

        when(adDao.getById(adId)).thenReturn(mockAd);

        // Act
        AdVo result = adService.get(adId);

        // Assert
        assertNotNull(result);
        assertEquals(adId, result.getId());
        assertEquals("测试广告", result.getAdName());
        verify(adDao, times(1)).getById(adId);
    }

    @Test
    @DisplayName("根据ID查询广告 - 不存在")
    void get_shouldReturnNull_whenAdNotExists() {
        // Arrange
        Long adId = 999L;
        when(adDao.getById(adId)).thenReturn(null);

        // Act
        AdVo result = adService.get(adId);

        // Assert
        assertNull(result);
    }
}
```

---

### 新增操作测试

```java
@Test
@DisplayName("新增广告 - 成功")
void add_shouldReturnId_whenValidBo() {
    // Arrange
    AdBo bo = new AdBo();
    bo.setAdName("新广告");
    bo.setStatus("1");

    // 模拟 DAO 层行为
    doAnswer(invocation -> {
        Ad entity = invocation.getArgument(0);
        entity.setId(100L);  // 模拟主键回填
        return true;
    }).when(adDao).insert(any(Ad.class));

    // Act
    Long resultId = adService.add(bo);

    // Assert
    assertEquals(100L, resultId);
    verify(adDao, times(1)).insert(any(Ad.class));
}
```

---

### 异常场景测试

```java
@Test
@DisplayName("更新广告 - ID为空抛出异常")
void update_shouldThrowException_whenIdIsNull() {
    // Arrange
    AdBo bo = new AdBo();
    bo.setId(null);

    // Act & Assert
    ServiceException exception = assertThrows(
        ServiceException.class,
        () -> adService.update(bo)
    );

    assertEquals("广告配置ID不能为空", exception.getMessage());
    verify(adDao, never()).updateById(any());
}

@Test
@DisplayName("更新广告 - 广告不存在抛出异常")
void update_shouldThrowException_whenAdNotExists() {
    // Arrange
    AdBo bo = new AdBo();
    bo.setId(999L);

    when(adDao.exists(999L)).thenReturn(false);

    // Act & Assert
    ServiceException exception = assertThrows(
        ServiceException.class,
        () -> adService.update(bo)
    );

    assertEquals("广告配置不存在", exception.getMessage());
}
```

---

### 事务测试

```java
@Test
@DisplayName("批量删除 - 事务回滚测试")
void batchDelete_shouldRollback_whenDeleteFails() {
    // Arrange
    List<Long> ids = List.of(1L, 2L, 3L);

    // 模拟删除失败
    when(adDao.deleteByIds(ids)).thenThrow(
        new RuntimeException("数据库异常")
    );

    // Act & Assert
    assertThrows(RuntimeException.class, () -> adService.batchDelete(ids));

    // 验证事务回滚 - 关联数据应该没有被删除
    // (实际测试中可能需要检查数据库状态)
}
```

---

## 数据导入处理

### Excel 导入示例

```java
@Override
@Transactional(rollbackFor = Exception.class)
public ImportResult importData(List<AdImportBo> importList) {
    ImportResult result = new ImportResult();

    if (CollUtil.isEmpty(importList)) {
        result.setSuccess(true);
        result.setMessage("导入数据为空");
        return result;
    }

    List<String> successList = new ArrayList<>();
    List<String> failList = new ArrayList<>();

    for (int i = 0; i < importList.size(); i++) {
        AdImportBo importBo = importList.get(i);
        int rowNum = i + 2;  // Excel 行号(从第2行开始)

        try {
            // 1. 数据校验
            validateImportRow(importBo, rowNum);

            // 2. 转换并保存
            AdBo bo = convertToAdBo(importBo);
            add(bo);

            successList.add("第" + rowNum + "行导入成功");
        } catch (ServiceException e) {
            failList.add("第" + rowNum + "行: " + e.getMessage());
        } catch (Exception e) {
            failList.add("第" + rowNum + "行: 系统异常");
            log.error("导入第{}行失败: {}", rowNum, e.getMessage(), e);
        }
    }

    // 构建结果
    result.setSuccess(failList.isEmpty());
    result.setSuccessCount(successList.size());
    result.setFailCount(failList.size());
    result.setSuccessMessages(successList);
    result.setFailMessages(failList);

    return result;
}

/**
 * 校验导入行数据
 */
private void validateImportRow(AdImportBo importBo, int rowNum) {
    if (StringUtils.isBlank(importBo.getAdName())) {
        throw ServiceException.of("广告名称不能为空");
    }

    if (importBo.getAdName().length() > 100) {
        throw ServiceException.of("广告名称长度不能超过100");
    }

    // 唯一性校验
    if (!isAdNameUnique(importBo.getAdName(), null)) {
        throw ServiceException.of("广告名称已存在: " + importBo.getAdName());
    }
}
```

---

## 代码检查清单

开发 Service 层代码时,请确认以下事项:

### 基础规范

- [ ] Service 实现类不继承任何基类
- [ ] 使用 `@RequiredArgsConstructor` 进行依赖注入
- [ ] 只注入 DAO 层接口,不直接注入 Mapper
- [ ] 所有 DAO 字段使用 `final` 修饰
- [ ] 类上添加 `@Slf4j` 注解

### 查询方法

- [ ] 查询条件通过 DAO 的 `buildQueryWrapper()` 构建
- [ ] 对象转换统一使用 `MapstructUtils.convert()`
- [ ] 分页结果使用 `PageResult.convert()` 方法
- [ ] 空集合快速返回避免无效查询

### 写操作

- [ ] 所有写操作添加 `@Transactional(rollbackFor = Exception.class)`
- [ ] 实现 `beforeSave()` 钩子方法
- [ ] 实现 `beforeDelete()` 钩子方法
- [ ] 新增后返回生成的主键ID

### 校验与异常

- [ ] 使用 `ServiceException.of()` 抛出业务异常
- [ ] 参数校验完整(非空、格式、业务规则)
- [ ] 唯一性校验在保存前执行
- [ ] 异常信息清晰明确

### 缓存

- [ ] 查询热点数据使用 `@Cacheable`
- [ ] 更新/删除时使用 `@CacheEvict` 清除缓存
- [ ] 同类方法调用使用 AOP 代理

### 性能

- [ ] 避免 N+1 查询问题
- [ ] 批量操作使用批量方法
- [ ] 使用 Stream API 处理集合
- [ ] 只查询必要的字段

### 日志

- [ ] 记录关键业务操作日志
- [ ] 异常日志包含完整堆栈
- [ ] 使用占位符而非字符串拼接

### 安全

- [ ] 敏感操作添加权限校验
- [ ] 删除操作检查数据权限
- [ ] 不允许操作系统管理员数据

---

## 常见问题与解决方案

### 1. 事务不生效

**问题原因**:
- 方法不是 public
- 同类方法直接调用(未通过代理)
- 异常被 catch 但未重新抛出

**解决方案**:

```java
// ❌ 错误 - 同类方法调用事务不生效
public void outerMethod() {
    this.innerMethod();  // 事务不生效
}

@Transactional
public void innerMethod() {
    // ...
}

// ✅ 正确 - 使用代理调用
public void outerMethod() {
    SpringUtils.getAopProxy(this).innerMethod();  // 事务生效
}
```

---

### 2. 缓存不生效

**问题原因**:
- 同类方法直接调用
- key 生成不正确
- 缓存配置问题

**解决方案**:

```java
// ✅ 使用 AOP 代理
String nickname = SpringUtils.getAopProxy(this).getNickNameById(id);

// ✅ 明确指定 key
@Cacheable(cacheNames = CacheNames.SYS_NICKNAME, key = "#userId")
```

---

### 3. 循环依赖

**问题原因**:
- Service A 依赖 Service B,Service B 又依赖 Service A

**解决方案**:

```java
// 方案1: 使用 @Lazy 延迟加载
@RequiredArgsConstructor
@Service
public class ServiceA {
    @Lazy
    private final ServiceB serviceB;
}

// 方案2: 抽取公共逻辑到独立 Service
// 方案3: 使用事件机制解耦
```

---

### 4. 事务传播问题

**问题原因**:
- 嵌套事务处理不当
- 内部事务失败导致外部事务回滚

**解决方案**:

```java
// 使用 REQUIRES_NEW 开启新事务
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void independentOperation() {
    // 独立事务,失败不影响外部事务
}

// 使用 try-catch 处理可失败的操作
try {
    optionalService.doSomething();
} catch (Exception e) {
    log.warn("可选操作失败,继续执行: {}", e.getMessage());
}
```

---

## 总结

### Service 层核心原则

| 原则 | 说明 | 好处 |
|------|------|------|
| **不继承基类** | 实现类独立,不继承 ServiceImpl | 代码简洁,依赖清晰 |
| **只注入 DAO** | 依赖 DAO 层接口,不直接依赖 Mapper | 分层明确,便于测试 |
| **使用 MapstructUtils** | 统一对象转换工具 | 性能好,类型安全 |
| **钩子方法** | beforeSave/beforeDelete 扩展点 | 逻辑复用,易于扩展 |
| **事务管理** | 写操作必加事务注解 | 数据一致性保障 |
| **异常处理** | 使用 ServiceException | 统一异常处理 |
| **缓存集成** | 热点数据使用 Spring Cache | 提升性能 |
| **权限校验** | 敏感操作检查权限 | 数据安全 |

### 标准 Service 方法模板

```java
@Slf4j
@RequiredArgsConstructor
@Service
public class XxxServiceImpl implements IXxxService {

    private final IXxxDao xxxDao;

    // 查询单条
    @Override
    public XxxVo get(Long id) {
        Xxx entity = xxxDao.getById(id);
        return MapstructUtils.convert(entity, XxxVo.class);
    }

    // 分页查询
    @Override
    public PageResult<XxxVo> page(XxxBo bo, PageQuery pageQuery) {
        PlusLambdaQuery<Xxx> wrapper = xxxDao.buildQueryWrapper(bo);
        PageResult<Xxx> entityPage = xxxDao.page(wrapper, pageQuery);
        return entityPage.convert(XxxVo.class);
    }

    // 新增
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long add(XxxBo bo) {
        Xxx entity = MapstructUtils.convert(bo, Xxx.class);
        beforeSave(entity);
        xxxDao.insert(entity);
        return entity.getId();
    }

    // 修改
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(XxxBo bo) {
        ServiceException.notNull(bo.getId(), "ID不能为空");
        if (!xxxDao.exists(bo.getId())) {
            throw ServiceException.of("数据不存在");
        }
        Xxx entity = MapstructUtils.convert(bo, Xxx.class);
        beforeSave(entity);
        return xxxDao.updateById(entity);
    }

    // 删除
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDelete(Collection<Long> ids) {
        if (CollUtil.isEmpty(ids)) {
            throw ServiceException.of("ID集合不能为空");
        }
        beforeDelete(ids);
        return xxxDao.deleteByIds(ids);
    }

    // 保存前钩子
    protected void beforeSave(Xxx entity) {
        // 数据校验、默认值设置
    }

    // 删除前钩子
    protected void beforeDelete(Collection<Long> ids) {
        // 关联数据检查、级联删除
    }
}
```

遵循这些原则和模式,可以编写出清晰、可维护、高性能的 Service 层代码。
