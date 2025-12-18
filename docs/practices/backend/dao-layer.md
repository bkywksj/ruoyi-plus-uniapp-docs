# DAO 层设计模式

本文档详细介绍 RuoYi-Plus-UniApp 项目中 DAO 层的设计模式和最佳实践，DAO 层是本项目区别于传统 RuoYi 框架的核心创新。

## 设计理念

### 为什么需要 DAO 层

传统 RuoYi 项目中，Service 层直接注入 Mapper：

```java
// ❌ 传统方式 - Service 直接使用 Mapper
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> {

    public List<UserVo> list(UserBo bo) {
        LambdaQueryWrapper<User> wrapper = Wrappers.<User>lambdaQuery()
            .like(StrUtil.isNotBlank(bo.getUserName()), User::getUserName, bo.getUserName());
        List<User> list = this.list(wrapper);
        return BeanUtil.copyToList(list, UserVo.class);
    }
}
```

这种方式的问题：
- Service 层包含过多数据访问细节
- 数据转换逻辑分散
- 查询条件构建重复
- 难以统一缓存处理

### 本项目的 DAO 层设计

```java
// ✅ 本项目方式 - 通过 DAO 层隔离
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final IUserDao userDao;

    public List<UserVo> list(UserBo bo) {
        return userDao.list(bo);  // 简洁，数据访问细节封装在 DAO
    }
}
```

## DAO 层架构

### 层次关系

```
Service 层
    ↓ 调用
DAO 接口 (IXxxDao)
    ↓ 实现
DAO 实现 (XxxDaoImpl)
    ↓ 调用
Mapper 接口 (XxxMapper)
    ↓ 执行
MyBatis XML / 注解
```

### 职责划分

| 层次 | 职责 |
|------|------|
| Service | 业务逻辑、事务管理 |
| DAO | 数据访问封装、转换、缓存 |
| Mapper | SQL 执行、结果映射 |

## 接口设计

### 标准 DAO 接口

```java
package plus.ruoyi.business.base.dao;

import plus.ruoyi.business.base.domain.bo.ProductBo;
import plus.ruoyi.business.base.domain.vo.ProductVo;
import plus.ruoyi.common.mybatis.core.page.PageQuery;
import plus.ruoyi.common.mybatis.core.page.PageResult;
import java.util.Collection;
import java.util.List;

/**
 * 产品数据访问接口
 *
 * @author 抓蛙师
 */
public interface IProductDao {

    /**
     * 根据ID查询
     */
    ProductVo get(Long id);

    /**
     * 查询列表
     */
    List<ProductVo> list(ProductBo bo);

    /**
     * 分页查询
     */
    PageResult<ProductVo> page(ProductBo bo, PageQuery pageQuery);

    /**
     * 新增
     */
    Long add(ProductBo bo);

    /**
     * 修改
     */
    boolean update(ProductBo bo);

    /**
     * 批量删除
     */
    boolean batchDelete(Collection<Long> ids);

    /**
     * 检查名称是否存在
     */
    boolean existsByName(String name);

    /**
     * 检查名称是否存在（排除指定ID）
     */
    boolean existsByName(String name, Long excludeId);
}
```

### 接口设计原则

1. **方法命名简洁**: `get`, `list`, `page`, `add`, `update`, `delete`
2. **参数使用 Bo**: 业务对象作为输入参数
3. **返回使用 Vo**: 视图对象作为返回值
4. **独立存在性检查**: `existsByXxx` 方法

## 实现类设计

### 标准实现类

```java
package plus.ruoyi.business.base.dao.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import plus.ruoyi.business.base.convert.ProductConvert;
import plus.ruoyi.business.base.dao.IProductDao;
import plus.ruoyi.business.base.domain.Product;
import plus.ruoyi.business.base.domain.bo.ProductBo;
import plus.ruoyi.business.base.domain.vo.ProductVo;
import plus.ruoyi.business.base.mapper.ProductMapper;
import plus.ruoyi.common.mybatis.core.page.PageQuery;
import plus.ruoyi.common.mybatis.core.page.PageResult;

import java.util.Collection;
import java.util.List;

/**
 * 产品数据访问实现
 *
 * @author 抓蛙师
 */
@Repository
@RequiredArgsConstructor
public class ProductDaoImpl implements IProductDao {

    private final ProductMapper productMapper;
    private final ProductConvert productConvert;

    @Override
    public ProductVo get(Long id) {
        Product entity = productMapper.selectById(id);
        return productConvert.toVo(entity);
    }

    @Override
    public List<ProductVo> list(ProductBo bo) {
        LambdaQueryWrapper<Product> wrapper = buildQueryWrapper(bo);
        List<Product> list = productMapper.selectList(wrapper);
        return productConvert.toVoList(list);
    }

    @Override
    public PageResult<ProductVo> page(ProductBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<Product> wrapper = buildQueryWrapper(bo);
        Page<Product> page = productMapper.selectPage(pageQuery.build(), wrapper);
        return PageResult.build(page, productConvert::toVo);
    }

    @Override
    public Long add(ProductBo bo) {
        Product entity = productConvert.toEntity(bo);
        productMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public boolean update(ProductBo bo) {
        Product entity = productConvert.toEntity(bo);
        return productMapper.updateById(entity) > 0;
    }

    @Override
    public boolean batchDelete(Collection<Long> ids) {
        return productMapper.deleteBatchIds(ids) > 0;
    }

    @Override
    public boolean existsByName(String name) {
        return productMapper.exists(
            Wrappers.<Product>lambdaQuery()
                .eq(Product::getName, name)
        );
    }

    @Override
    public boolean existsByName(String name, Long excludeId) {
        return productMapper.exists(
            Wrappers.<Product>lambdaQuery()
                .eq(Product::getName, name)
                .ne(Product::getId, excludeId)
        );
    }

    /**
     * 构建查询条件
     */
    private LambdaQueryWrapper<Product> buildQueryWrapper(ProductBo bo) {
        return Wrappers.<Product>lambdaQuery()
            .like(StrUtil.isNotBlank(bo.getName()), Product::getName, bo.getName())
            .eq(StrUtil.isNotBlank(bo.getStatus()), Product::getStatus, bo.getStatus())
            .ge(bo.getMinPrice() != null, Product::getPrice, bo.getMinPrice())
            .le(bo.getMaxPrice() != null, Product::getPrice, bo.getMaxPrice())
            .orderByDesc(Product::getCreateTime);
    }
}
```

## 数据转换

### MapStruct 转换器

```java
package plus.ruoyi.business.base.convert;

import org.mapstruct.Mapper;
import plus.ruoyi.business.base.domain.Product;
import plus.ruoyi.business.base.domain.bo.ProductBo;
import plus.ruoyi.business.base.domain.vo.ProductVo;

import java.util.List;

/**
 * 产品数据转换器
 *
 * @author 抓蛙师
 */
@Mapper(componentModel = "spring")
public interface ProductConvert {

    /**
     * Entity -> Vo
     */
    ProductVo toVo(Product entity);

    /**
     * Entity List -> Vo List
     */
    List<ProductVo> toVoList(List<Product> entityList);

    /**
     * Bo -> Entity
     */
    Product toEntity(ProductBo bo);
}
```

### 复杂转换处理

```java
@Mapper(componentModel = "spring")
public interface OrderConvert {

    @Mapping(target = "statusText", expression = "java(getStatusText(entity.getStatus()))")
    @Mapping(target = "totalAmountYuan", expression = "java(fenToYuan(entity.getTotalAmount()))")
    OrderVo toVo(Order entity);

    default String getStatusText(String status) {
        return OrderStatus.fromCode(status).getText();
    }

    default BigDecimal fenToYuan(Long fen) {
        if (fen == null) return BigDecimal.ZERO;
        return BigDecimal.valueOf(fen).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }
}
```

## 查询条件构建

### 基础条件构建

```java
private LambdaQueryWrapper<User> buildQueryWrapper(UserBo bo) {
    return Wrappers.<User>lambdaQuery()
        // 精确匹配
        .eq(StrUtil.isNotBlank(bo.getStatus()), User::getStatus, bo.getStatus())
        // 模糊匹配
        .like(StrUtil.isNotBlank(bo.getUserName()), User::getUserName, bo.getUserName())
        // 范围查询
        .ge(bo.getStartTime() != null, User::getCreateTime, bo.getStartTime())
        .le(bo.getEndTime() != null, User::getCreateTime, bo.getEndTime())
        // IN 查询
        .in(CollUtil.isNotEmpty(bo.getDeptIds()), User::getDeptId, bo.getDeptIds())
        // 排序
        .orderByDesc(User::getCreateTime);
}
```

### 动态排序

```java
private LambdaQueryWrapper<Product> buildQueryWrapper(ProductBo bo, PageQuery pageQuery) {
    LambdaQueryWrapper<Product> wrapper = Wrappers.<Product>lambdaQuery()
        .like(StrUtil.isNotBlank(bo.getName()), Product::getName, bo.getName());

    // 动态排序
    if (StrUtil.isNotBlank(pageQuery.getOrderByColumn())) {
        boolean isAsc = "asc".equalsIgnoreCase(pageQuery.getIsAsc());
        switch (pageQuery.getOrderByColumn()) {
            case "price" -> wrapper.orderBy(true, isAsc, Product::getPrice);
            case "createTime" -> wrapper.orderBy(true, isAsc, Product::getCreateTime);
            default -> wrapper.orderByDesc(Product::getCreateTime);
        }
    } else {
        wrapper.orderByDesc(Product::getCreateTime);
    }

    return wrapper;
}
```

## 复杂查询

### 关联查询

对于复杂的关联查询，在 Mapper 中使用 XML：

```java
// DAO 接口
public interface IOrderDao {
    OrderDetailVo getDetail(Long id);
}

// DAO 实现
@Override
public OrderDetailVo getDetail(Long id) {
    return orderMapper.selectDetailById(id);
}
```

```xml
<!-- OrderMapper.xml -->
<select id="selectDetailById" resultMap="OrderDetailResultMap">
    SELECT
        o.id, o.order_no, o.total_amount, o.status,
        u.user_name, u.nick_name,
        p.name as product_name, p.price
    FROM biz_order o
    LEFT JOIN sys_user u ON o.user_id = u.id
    LEFT JOIN biz_product p ON o.product_id = p.id
    WHERE o.id = #{id}
</select>
```

### 统计查询

```java
// DAO 接口
public interface IOrderDao {
    OrderStatVo getStatistics(OrderStatBo bo);
}

// DAO 实现
@Override
public OrderStatVo getStatistics(OrderStatBo bo) {
    return orderMapper.selectStatistics(bo);
}
```

```xml
<select id="selectStatistics" resultType="OrderStatVo">
    SELECT
        COUNT(*) as totalCount,
        SUM(total_amount) as totalAmount,
        COUNT(CASE WHEN status = '1' THEN 1 END) as paidCount,
        COUNT(CASE WHEN status = '2' THEN 1 END) as shippedCount
    FROM biz_order
    WHERE del_flag = '0'
    <if test="startTime != null">
        AND create_time >= #{startTime}
    </if>
    <if test="endTime != null">
        AND create_time &lt;= #{endTime}
    </if>
</select>
```

## 缓存处理

### 简单缓存

```java
@Repository
@RequiredArgsConstructor
public class ConfigDaoImpl implements IConfigDao {

    private final ConfigMapper configMapper;
    private final RedisCache redisCache;

    private static final String CACHE_KEY = "sys:config:";

    @Override
    public ConfigVo get(Long id) {
        String key = CACHE_KEY + id;
        ConfigVo vo = redisCache.getCacheObject(key);
        if (vo == null) {
            Config entity = configMapper.selectById(id);
            vo = configConvert.toVo(entity);
            redisCache.setCacheObject(key, vo, 30, TimeUnit.MINUTES);
        }
        return vo;
    }

    @Override
    public boolean update(ConfigBo bo) {
        Config entity = configConvert.toEntity(bo);
        boolean result = configMapper.updateById(entity) > 0;
        if (result) {
            redisCache.deleteObject(CACHE_KEY + bo.getId());
        }
        return result;
    }
}
```

### 使用 Spring Cache

```java
@Repository
@RequiredArgsConstructor
public class DictDaoImpl implements IDictDao {

    private final DictMapper dictMapper;

    @Override
    @Cacheable(value = "dict", key = "#dictType")
    public List<DictDataVo> listByType(String dictType) {
        List<DictData> list = dictMapper.selectList(
            Wrappers.<DictData>lambdaQuery()
                .eq(DictData::getDictType, dictType)
                .orderByAsc(DictData::getDictSort)
        );
        return dictConvert.toVoList(list);
    }

    @Override
    @CacheEvict(value = "dict", key = "#bo.dictType")
    public boolean update(DictDataBo bo) {
        DictData entity = dictConvert.toEntity(bo);
        return dictMapper.updateById(entity) > 0;
    }
}
```

## 批量操作

### 批量新增

```java
@Override
public boolean batchAdd(List<ProductBo> boList) {
    if (CollUtil.isEmpty(boList)) {
        return false;
    }
    List<Product> entityList = boList.stream()
        .map(productConvert::toEntity)
        .collect(Collectors.toList());
    return productMapper.insertBatch(entityList);
}
```

### 批量更新

```java
@Override
public boolean batchUpdate(List<ProductBo> boList) {
    if (CollUtil.isEmpty(boList)) {
        return false;
    }
    List<Product> entityList = boList.stream()
        .map(productConvert::toEntity)
        .collect(Collectors.toList());
    return productMapper.updateBatchById(entityList);
}
```

## 最佳实践

### 1. 接口设计

```java
// ✅ 好的接口设计
public interface IUserDao {
    UserVo get(Long id);
    List<UserVo> list(UserBo bo);
    PageResult<UserVo> page(UserBo bo, PageQuery pageQuery);
    Long add(UserBo bo);
    boolean update(UserBo bo);
    boolean batchDelete(Collection<Long> ids);
    boolean existsByUserName(String userName);
}

// ❌ 不好的接口设计
public interface IUserDao {
    User selectById(Long id);  // 返回 Entity 而不是 Vo
    List<User> selectList(LambdaQueryWrapper<User> wrapper);  // 暴露 Wrapper
}
```

### 2. 实现类设计

```java
// ✅ 好的实现
@Repository
@RequiredArgsConstructor
public class UserDaoImpl implements IUserDao {

    private final UserMapper userMapper;
    private final UserConvert userConvert;

    @Override
    public UserVo get(Long id) {
        User entity = userMapper.selectById(id);
        return userConvert.toVo(entity);  // 统一转换
    }
}

// ❌ 不好的实现
@Repository
public class UserDaoImpl implements IUserDao {

    @Autowired  // 应使用构造器注入
    private UserMapper userMapper;

    @Override
    public UserVo get(Long id) {
        User entity = userMapper.selectById(id);
        UserVo vo = new UserVo();
        BeanUtils.copyProperties(entity, vo);  // 应使用 MapStruct
        return vo;
    }
}
```

### 3. 查询条件构建

```java
// ✅ 好的条件构建
private LambdaQueryWrapper<User> buildQueryWrapper(UserBo bo) {
    return Wrappers.<User>lambdaQuery()
        .like(StrUtil.isNotBlank(bo.getUserName()), User::getUserName, bo.getUserName())
        .eq(StrUtil.isNotBlank(bo.getStatus()), User::getStatus, bo.getStatus())
        .orderByDesc(User::getCreateTime);
}

// ❌ 不好的条件构建
private LambdaQueryWrapper<User> buildQueryWrapper(UserBo bo) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    if (bo.getUserName() != null && !bo.getUserName().isEmpty()) {  // 冗长
        wrapper.like(User::getUserName, bo.getUserName());
    }
    return wrapper;
}
```

## 总结

DAO 层设计的核心要点：

1. **隔离数据访问**: Service 不直接操作 Mapper
2. **统一数据转换**: 使用 MapStruct 进行 Entity/Bo/Vo 转换
3. **封装查询条件**: 在 DAO 中构建 Wrapper
4. **支持缓存处理**: 可在 DAO 层添加缓存逻辑
5. **简化 Service**: Service 专注业务逻辑

通过 DAO 层的设计，实现了更清晰的代码结构和更好的可维护性。
