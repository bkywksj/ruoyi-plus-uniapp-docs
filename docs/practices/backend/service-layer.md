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

## 代码检查清单

开发 Service 层代码时,请确认以下事项:

- [ ] ✅ Service 实现类不继承任何基类
- [ ] ✅ 使用 `@RequiredArgsConstructor` 进行依赖注入
- [ ] ✅ 只注入 DAO 层接口,不直接注入 Mapper
- [ ] ✅ 查询条件通过 DAO 的 `buildQueryWrapper()` 构建
- [ ] ✅ 对象转换统一使用 `MapstructUtils.convert()`
- [ ] ✅ 写操作添加 `@Transactional(rollbackFor = Exception.class)`
- [ ] ✅ 使用 `ServiceException.of()` 抛出业务异常
- [ ] ✅ 实现 `beforeSave()` 和 `beforeDelete()` 钩子方法
- [ ] ✅ 参数校验完整(非空、格式、业务规则)
- [ ] ✅ 异常信息清晰明确
- [ ] ✅ 避免 N+1 查询问题
- [ ] ✅ 批量操作使用批量方法

---

## 总结

**Service 层核心原则**:
1. **不继承基类** - 保持简洁独立
2. **只注入 DAO** - 清晰的分层依赖
3. **使用 MapstructUtils** - 统一对象转换
4. **钩子方法** - beforeSave/beforeDelete 扩展点
5. **事务管理** - 写操作必加事务
6. **异常处理** - 使用 ServiceException

遵循这些原则,可以编写出清晰、可维护、高性能的 Service 层代码。
