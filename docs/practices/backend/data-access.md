# 数据访问最佳实践

## 介绍

数据访问层是后端应用的核心组成部分,负责与数据库的交互操作。RuoYi-Plus 框架基于 MyBatis-Plus 构建了一套完善的数据访问体系,通过分层架构(Mapper → DAO → Service)实现代码复用和职责分离,提供了丰富的工具类和约定规范来简化数据库操作。

**核心特性:**

- **三层数据访问架构** - Mapper(SQL映射)、DAO(数据访问对象)、Service(业务服务)分层设计
- **BaseMapperPlus 扩展** - 增强的 Mapper 基类,提供实体-视图对象自动转换和批量操作
- **智能查询构造器** - PlusLambdaQuery 自动处理空值、智能降级条件、聚合函数支持
- **统一分页机制** - PageQuery 和 PageResult 标准化分页查询和响应
- **自动字段填充** - 创建人、创建时间、更新人、更新时间自动填充
- **类型安全查询** - Lambda 表达式替代字符串列名,编译期检查

## 架构设计

### 分层架构

```text
┌─────────────────────────────────────────┐
│              Controller                  │  请求入口
├─────────────────────────────────────────┤
│                Service                   │  业务逻辑
├─────────────────────────────────────────┤
│                  DAO                     │  数据访问封装
├─────────────────────────────────────────┤
│                Mapper                    │  SQL 映射
├─────────────────────────────────────────┤
│               Database                   │  数据库
└─────────────────────────────────────────┘
```

**各层职责:**

| 层次 | 职责 | 示例类 |
|------|------|--------|
| Mapper | SQL 映射、基础 CRUD | `SysConfigMapper` |
| DAO | 查询条件构建、复杂数据操作 | `SysConfigDaoImpl` |
| Service | 业务逻辑、事务管理、数据转换 | `SysConfigServiceImpl` |

### 核心组件

```text
BaseMapperPlus<M, T, V>
    ├── 泛型参数: M=Mapper, T=Entity, V=VO
    ├── 实体-视图转换
    ├── 批量操作
    └── 查询构造器工厂

IBaseDao<T> / BaseDaoImpl<M, T>
    ├── 标准 CRUD 封装
    ├── 分页查询
    └── 条件查询

PlusLambdaQuery<T>
    ├── Lambda 类型安全
    ├── 空值自动处理
    └── 聚合函数支持
```

## 基础用法

### Mapper 层定义

Mapper 接口继承 `BaseMapper`,定义基础的数据库映射:

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import plus.ruoyi.system.config.domain.SysConfig;

/**
 * 参数配置 Mapper 接口
 */
@Mapper
public interface SysConfigMapper extends BaseMapper<SysConfig> {

    // 自定义复杂查询可在 XML 中定义
    // List<SysConfig> selectCustomList(@Param("query") SysConfigQuery query);
}
```

**使用说明:**

- 继承 `BaseMapper<T>` 即可获得基础 CRUD 方法
- 复杂 SQL 可通过 XML 文件定义
- `@Mapper` 注解用于 MyBatis 扫描识别

### DAO 层实现

DAO 层继承 `BaseDaoImpl`,封装数据访问逻辑:

```java
import org.springframework.stereotype.Repository;
import plus.ruoyi.common.mybatis.core.dao.impl.BaseDaoImpl;
import plus.ruoyi.common.mybatis.core.query.PlusLambdaQuery;
import plus.ruoyi.system.config.dao.ISysConfigDao;
import plus.ruoyi.system.config.domain.SysConfig;
import plus.ruoyi.system.config.domain.bo.SysConfigBo;
import plus.ruoyi.system.config.mapper.SysConfigMapper;

import java.util.Map;

/**
 * 参数配置 DAO 实现
 */
@Repository
public class SysConfigDaoImpl extends BaseDaoImpl<SysConfigMapper, SysConfig>
    implements ISysConfigDao {

    /**
     * 构建查询条件
     */
    @Override
    public PlusLambdaQuery<SysConfig> buildQueryWrapper(SysConfigBo bo) {
        Map<String, Object> params = bo.getParams();

        PlusLambdaQuery<SysConfig> lqw = PlusLambdaQuery.of(SysConfig.class);

        // 模糊查询
        lqw.like(SysConfig::getConfigName, bo.getConfigName());
        lqw.like(SysConfig::getConfigKey, bo.getConfigKey());

        // 精确匹配
        lqw.eq(SysConfig::getConfigType, bo.getConfigType());

        // 时间范围查询
        lqw.between(SysConfig::getCreateTime,
            params.get("beginTime"),
            params.get("endTime"));

        // 排序
        lqw.orderByAsc(SysConfig::getConfigId);

        return lqw;
    }

    /**
     * 根据配置键查询
     */
    @Override
    public SysConfig getByConfigKey(String configKey) {
        PlusLambdaQuery<SysConfig> lqw = PlusLambdaQuery.of(SysConfig.class)
            .eq(SysConfig::getConfigKey, configKey);
        return getOne(lqw);
    }

    /**
     * 根据配置键更新
     */
    @Override
    public boolean updateByConfigKey(SysConfig config, String configKey) {
        PlusLambdaQuery<SysConfig> lqw = PlusLambdaQuery.of(SysConfig.class)
            .eq(SysConfig::getConfigKey, configKey);
        return update(config, lqw);
    }
}
```

### Service 层调用

Service 层注入 DAO,处理业务逻辑:

```java
import cn.hutool.core.collection.CollUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import plus.ruoyi.common.core.exception.ServiceException;
import plus.ruoyi.common.core.utils.MapstructUtils;
import plus.ruoyi.common.mybatis.core.page.PageQuery;
import plus.ruoyi.common.mybatis.core.page.PageResult;
import plus.ruoyi.common.mybatis.core.query.PlusLambdaQuery;
import plus.ruoyi.system.config.dao.ISysConfigDao;
import plus.ruoyi.system.config.domain.SysConfig;
import plus.ruoyi.system.config.domain.bo.SysConfigBo;
import plus.ruoyi.system.config.domain.vo.SysConfigVo;
import plus.ruoyi.system.config.service.ISysConfigService;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 参数配置 Service 实现
 */
@Service
@RequiredArgsConstructor
public class SysConfigServiceImpl implements ISysConfigService {

    private final ISysConfigDao configDao;

    /**
     * 根据 ID 查询
     */
    @Override
    public SysConfigVo get(Long configId) {
        SysConfig entity = configDao.getById(configId);
        return MapstructUtils.convert(entity, SysConfigVo.class);
    }

    /**
     * 条件查询列表
     */
    @Override
    public List<SysConfigVo> list(SysConfigBo bo) {
        PlusLambdaQuery<SysConfig> wrapper = configDao.buildQueryWrapper(bo);
        List<SysConfig> entities = configDao.list(wrapper);
        return MapstructUtils.convert(entities, SysConfigVo.class);
    }

    /**
     * 分页查询
     */
    @Override
    public PageResult<SysConfigVo> page(SysConfigBo bo, PageQuery pageQuery) {
        PlusLambdaQuery<SysConfig> wrapper = configDao.buildQueryWrapper(bo);
        PageResult<SysConfig> entityPage = configDao.page(wrapper, pageQuery);
        return entityPage.convert(SysConfigVo.class);
    }

    /**
     * 新增配置
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean insert(SysConfigBo bo) {
        SysConfig entity = MapstructUtils.convert(bo, SysConfig.class);
        return configDao.insert(entity);
    }

    /**
     * 更新配置
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(SysConfigBo bo) {
        SysConfig entity = MapstructUtils.convert(bo, SysConfig.class);
        return configDao.updateById(entity);
    }

    /**
     * 批量删除
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDelete(Collection<Long> ids) {
        if (CollUtil.isEmpty(ids)) {
            throw ServiceException.of("ID集合不能为空");
        }
        return configDao.deleteByIds(ids);
    }

    /**
     * 批量保存
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchSave(List<SysConfigBo> boList) {
        if (CollUtil.isEmpty(boList)) {
            return true;
        }

        List<SysConfig> entities = new ArrayList<>(boList.size());
        for (SysConfigBo bo : boList) {
            SysConfig entity = MapstructUtils.convert(bo, SysConfig.class);
            entities.add(entity);
        }

        return configDao.batchSave(entities);
    }
}
```

## 查询构造器

### PlusLambdaQuery 基础用法

PlusLambdaQuery 是框架增强的 Lambda 查询构造器,自动处理空值:

```java
import plus.ruoyi.common.mybatis.core.query.PlusLambdaQuery;

// 创建查询构造器
PlusLambdaQuery<SysUser> query = PlusLambdaQuery.of(SysUser.class);

// 等值查询 - 自动忽略 null 值
query.eq(SysUser::getStatus, status);

// 模糊查询 - 自动忽略 null 和空字符串
query.like(SysUser::getUserName, userName);
query.likeLeft(SysUser::getNickName, nickName);
query.likeRight(SysUser::getEmail, email);

// 范围查询
query.gt(SysUser::getAge, 18);
query.ge(SysUser::getCreateTime, startTime);
query.lt(SysUser::getAge, 60);
query.le(SysUser::getUpdateTime, endTime);

// BETWEEN 查询 - 智能降级
// 当 val1 为空时退化为 le,val2 为空时退化为 ge
query.between(SysUser::getCreateTime, beginTime, endTime);

// IN 查询 - 自动过滤 null 元素
query.in(SysUser::getDeptId, deptIds);
query.notIn(SysUser::getRoleId, excludeRoleIds);

// 排序
query.orderByAsc(SysUser::getOrderNum);
query.orderByDesc(SysUser::getCreateTime);

// 执行查询
List<SysUser> users = userDao.list(query);
```

### 复杂条件组合

```java
public PlusLambdaQuery<SysDept> buildQueryWrapper(SysDeptBo bo) {
    PlusLambdaQuery<SysDept> lqw = PlusLambdaQuery.of(SysDept.class);

    // 基础条件
    lqw.eq(SysDept::getIsDeleted, DictBooleanFlag.NO.getValue());
    lqw.eq(SysDept::getDeptId, bo.getDeptId());
    lqw.eq(SysDept::getParentId, bo.getParentId());
    lqw.eq(SysDept::getStatus, bo.getStatus());

    // 模糊匹配
    lqw.like(SysDept::getDeptName, bo.getDeptName());
    lqw.like(SysDept::getDeptCategory, bo.getDeptCategory());

    // 多字段排序
    lqw.orderByAsc(SysDept::getAncestors);
    lqw.orderByAsc(SysDept::getParentId);
    lqw.orderByAsc(SysDept::getOrderNum);
    lqw.orderByAsc(SysDept::getDeptId);

    // 嵌套 AND 条件 - 部门树查询
    if (ObjectUtil.isNotNull(bo.getBelongDeptId())) {
        lqw.and(w -> {
            Long parentId = bo.getBelongDeptId();
            List<SysDept> childDeptList = selectListByParentId(parentId);
            List<Long> deptIds = StreamUtils.toList(childDeptList, SysDept::getDeptId);
            deptIds.add(parentId);
            w.in(SysDept::getDeptId, deptIds);
        });
    }

    // 嵌套 OR 条件 - 多字段模糊搜索
    String searchValue = bo.getSearchValue();
    if (StringUtils.isNotBlank(searchValue)) {
        lqw.and(w -> w
            .like(SysDept::getDeptName, searchValue)
            .or()
            .like(SysDept::getDeptCategory, searchValue)
            .or()
            .like(SysDept::getDeptId, searchValue)
        );
    }

    return lqw;
}
```

### 字段选择查询

```java
// 只查询需要的字段,减少数据传输
public List<SysDept> listNormalDeptsByIds(List<Long> deptIds) {
    PlusLambdaQuery<SysDept> lqw = PlusLambdaQuery.of(SysDept.class)
        .select(SysDept::getDeptId, SysDept::getDeptName, SysDept::getLeader)
        .eq(SysDept::getStatus, DictEnableStatus.ENABLE.getValue())
        .in(SysDept::getDeptId, deptIds);
    return list(lqw);
}

// 排除某些字段
public List<SysUser> listUsersWithoutPassword() {
    PlusLambdaQuery<SysUser> lqw = PlusLambdaQuery.of(SysUser.class)
        .select(SysUser.class, info -> !info.getColumn().equals("password"));
    return list(lqw);
}
```

### 聚合函数

```java
// SUM 求和
PlusLambdaQuery<Order> sumQuery = PlusLambdaQuery.of(Order.class)
    .sum(Order::getAmount);
BigDecimal totalAmount = orderMapper.selectOne(sumQuery).getAmount();

// COUNT 计数
PlusLambdaQuery<SysUser> countQuery = PlusLambdaQuery.of(SysUser.class)
    .count(SysUser::getUserId)
    .eq(SysUser::getStatus, "0");
Long activeCount = userMapper.selectCount(countQuery);

// MIN/MAX
PlusLambdaQuery<Order> minQuery = PlusLambdaQuery.of(Order.class)
    .min(Order::getCreateTime);
Date firstOrderTime = orderMapper.selectOne(minQuery).getCreateTime();

// AVG 平均值
PlusLambdaQuery<Product> avgQuery = PlusLambdaQuery.of(Product.class)
    .avg(Product::getPrice, Product::getAvgPrice)
    .groupBy(Product::getCategoryId);
```

### 数据库函数

```java
// 使用 FIND_IN_SET 函数查询树形结构
public List<Long> listChildrenDeptIds(Long deptId) {
    PlusLambdaQuery<SysDept> lqw = PlusLambdaQuery.of(SysDept.class)
        .select(SysDept::getDeptId)
        .eq(SysDept::getStatus, DictEnableStatus.ENABLE.getValue())
        .apply(DataBaseHelper.findInSet(deptId, "ancestors"));
    return baseMapper.selectObjs(lqw);
}

// 使用原生 SQL 片段
public List<SysUser> listUsersByCustomCondition(String customSql) {
    PlusLambdaQuery<SysUser> lqw = PlusLambdaQuery.of(SysUser.class)
        .apply(StringUtils.isNotBlank(customSql), customSql);
    return list(lqw);
}
```

## 分页查询

### PageQuery 和 PageResult

**PageQuery** - 分页请求参数:

```java
import plus.ruoyi.common.mybatis.core.page.PageQuery;

public class PageQuery implements Serializable {

    /** 分页大小 */
    private Integer pageSize;

    /** 当前页数 */
    private Integer pageNum;

    /** 排序列 */
    private String orderByColumn;

    /** 排序方向 (asc/desc) */
    private String isAsc;

    // 默认值
    public static final int DEFAULT_PAGE_NUM = 1;
    public static final int DEFAULT_PAGE_SIZE = Integer.MAX_VALUE;

    /**
     * 构建 MyBatis-Plus 分页对象
     */
    public <T> Page<T> build() {
        Integer pageNum = ObjectUtil.defaultIfNull(getPageNum(), DEFAULT_PAGE_NUM);
        Integer pageSize = ObjectUtil.defaultIfNull(getPageSize(), DEFAULT_PAGE_SIZE);
        if (pageNum <= 0) {
            pageNum = DEFAULT_PAGE_NUM;
        }
        Page<T> page = new Page<>(pageNum, pageSize);
        List<OrderItem> orderItems = buildOrderItem();
        if (CollUtil.isNotEmpty(orderItems)) {
            page.addOrder(orderItems);
        }
        return page;
    }
}
```

**PageResult** - 分页响应结果:

```java
import plus.ruoyi.common.mybatis.core.page.PageResult;

public class PageResult<T> implements Serializable {

    /** 数据记录列表 */
    private List<T> records;

    /** 总记录数 */
    private long total;

    /** 当前页码 */
    private long current;

    /** 每页大小 */
    private long size;

    /** 是否为最后一页 */
    private boolean last;

    /**
     * 从 IPage 创建分页结果
     */
    public static <T> PageResult<T> of(IPage<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(page.getRecords());
        result.setTotal(page.getTotal());
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setLast(page.getCurrent() >= page.getPages());
        return result;
    }

    /**
     * 转换为目标类型
     */
    public <R> PageResult<R> convert(Class<R> targetClass) {
        List<R> targetRecords = MapstructUtils.convert(this.records, targetClass);
        PageResult<R> result = new PageResult<>();
        result.setRecords(targetRecords);
        result.setTotal(this.total);
        result.setCurrent(this.current);
        result.setSize(this.size);
        result.setLast(this.last);
        return result;
    }

    /**
     * 使用函数转换
     */
    public <R> PageResult<R> map(Function<T, R> converter) {
        List<R> targetRecords = this.records.stream()
            .map(converter)
            .collect(Collectors.toList());
        PageResult<R> result = new PageResult<>();
        result.setRecords(targetRecords);
        result.setTotal(this.total);
        result.setCurrent(this.current);
        result.setSize(this.size);
        result.setLast(this.last);
        return result;
    }
}
```

### 分页查询实现

**DAO 层:**

```java
@Override
public PageResult<SysConfig> page(PlusLambdaQuery<SysConfig> wrapper, PageQuery pageQuery) {
    Page<SysConfig> page = baseMapper.selectPage(pageQuery.build(), wrapper);
    return PageResult.of(page);
}
```

**Service 层:**

```java
@Override
public PageResult<SysConfigVo> page(SysConfigBo bo, PageQuery pageQuery) {
    // 构建查询条件
    PlusLambdaQuery<SysConfig> wrapper = configDao.buildQueryWrapper(bo);

    // 执行分页查询
    PageResult<SysConfig> entityPage = configDao.page(wrapper, pageQuery);

    // 转换为 VO
    return entityPage.convert(SysConfigVo.class);
}
```

**Controller 层:**

```java
@GetMapping("/list")
public R<PageResult<SysConfigVo>> list(SysConfigBo bo, PageQuery pageQuery) {
    return R.ok(sysConfigService.page(bo, pageQuery));
}
```

### 多表关联分页

```java
// 自定义 XML 分页查询
public PageResult<SysUserVo> pageUserWithDept(SysUserBo bo, PageQuery pageQuery) {
    Page<SysUserVo> page = pageQuery.build();

    // 调用 XML 中定义的关联查询
    List<SysUserVo> list = baseMapper.selectUserWithDept(page, bo);
    page.setRecords(list);

    return PageResult.of(page);
}

// XML 定义
/*
<select id="selectUserWithDept" resultType="SysUserVo">
    SELECT u.*, d.dept_name
    FROM sys_user u
    LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
    WHERE u.is_deleted = 0
    <if test="bo.userName != null and bo.userName != ''">
        AND u.user_name LIKE CONCAT('%', #{bo.userName}, '%')
    </if>
</select>
*/
```

## 批量操作

### 批量插入

```java
// DAO 层方法
@Override
public boolean batchInsert(Collection<SysConfig> entities) {
    if (CollUtil.isEmpty(entities)) {
        return true;
    }
    return Db.saveBatch(entities);
}

// 指定批次大小
@Override
public boolean batchInsert(Collection<SysConfig> entities, int batchSize) {
    if (CollUtil.isEmpty(entities)) {
        return true;
    }
    return Db.saveBatch(entities, batchSize);
}

// Service 层调用
@Transactional(rollbackFor = Exception.class)
public boolean batchInsert(List<SysConfigBo> boList) {
    List<SysConfig> entities = MapstructUtils.convert(boList, SysConfig.class);
    return configDao.batchInsert(entities);
}
```

### 批量更新

```java
// 根据 ID 批量更新
@Override
public boolean batchUpdateById(Collection<SysConfig> entities) {
    if (CollUtil.isEmpty(entities)) {
        return true;
    }
    return Db.updateBatchById(entities);
}

// 指定批次大小
@Override
public boolean batchUpdateById(Collection<SysConfig> entities, int batchSize) {
    if (CollUtil.isEmpty(entities)) {
        return true;
    }
    return Db.updateBatchById(entities, batchSize);
}
```

### 批量保存(插入或更新)

```java
// 根据主键判断:有主键则更新,无主键则插入
@Override
public boolean batchSave(Collection<SysConfig> entities) {
    if (CollUtil.isEmpty(entities)) {
        return true;
    }
    return Db.saveOrUpdateBatch(entities);
}

// Service 层实现
@Transactional(rollbackFor = Exception.class)
public boolean batchSave(List<SysConfigBo> boList) {
    if (CollUtil.isEmpty(boList)) {
        return true;
    }

    List<SysConfig> entities = new ArrayList<>(boList.size());
    for (SysConfigBo bo : boList) {
        SysConfig entity = MapstructUtils.convert(bo, SysConfig.class);
        // 前置处理
        beforeSave(entity);
        entities.add(entity);
    }

    return configDao.batchSave(entities);
}
```

### 批量删除

```java
// 根据 ID 集合删除
@Override
public boolean deleteByIds(Collection<? extends Serializable> ids) {
    if (CollUtil.isEmpty(ids)) {
        return true;
    }
    return baseMapper.deleteByIds(ids) > 0;
}

// Service 层实现
@Transactional(rollbackFor = Exception.class)
public boolean batchDelete(Collection<Long> ids) {
    if (CollUtil.isEmpty(ids)) {
        throw ServiceException.of("ID集合不能为空");
    }

    // 前置校验
    beforeDelete(ids);

    return configDao.deleteByIds(ids);
}
```

## 实体设计

### BaseEntity 基类

所有实体类应继承 `BaseEntity`,自动处理公共字段:

```java
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.apache.ibatis.type.JdbcType;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 实体基类
 */
@Data
public class BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 搜索值(非数据库字段)
     */
    @JsonIgnore
    @TableField(exist = false)
    private String searchValue;

    /**
     * 创建部门
     */
    @TableField(fill = FieldFill.INSERT, jdbcType = JdbcType.BIGINT)
    private Long createDept;

    /**
     * 创建者
     */
    @TableField(fill = FieldFill.INSERT, jdbcType = JdbcType.BIGINT)
    private Long createBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT, jdbcType = JdbcType.TIMESTAMP)
    private Date createTime;

    /**
     * 更新者
     */
    @TableField(fill = FieldFill.INSERT_UPDATE, jdbcType = JdbcType.BIGINT)
    private Long updateBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE, jdbcType = JdbcType.TIMESTAMP)
    private Date updateTime;

    /**
     * 请求参数(非数据库字段)
     */
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @TableField(exist = false)
    private Map<String, Object> params = new HashMap<>();
}
```

### 实体类定义

```java
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import plus.ruoyi.common.mybatis.core.domain.BaseEntity;

/**
 * 参数配置实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_config")
public class SysConfig extends BaseEntity {

    /**
     * 参数主键
     */
    @TableId(value = "config_id", type = IdType.AUTO)
    private Long configId;

    /**
     * 参数名称
     */
    private String configName;

    /**
     * 参数键名
     */
    private String configKey;

    /**
     * 参数键值
     */
    private String configValue;

    /**
     * 系统内置(Y是 N否)
     */
    private String configType;

    /**
     * 备注
     */
    private String remark;
}
```

### BO(业务对象)定义

```java
import lombok.Data;
import lombok.EqualsAndHashCode;
import plus.ruoyi.common.mybatis.core.domain.BaseEntity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 参数配置业务对象
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysConfigBo extends BaseEntity {

    /**
     * 参数主键
     */
    private Long configId;

    /**
     * 参数名称
     */
    @NotBlank(message = "参数名称不能为空")
    @Size(min = 0, max = 100, message = "参数名称长度不能超过{max}个字符")
    private String configName;

    /**
     * 参数键名
     */
    @NotBlank(message = "参数键名不能为空")
    @Size(min = 0, max = 100, message = "参数键名长度不能超过{max}个字符")
    private String configKey;

    /**
     * 参数键值
     */
    @NotBlank(message = "参数键值不能为空")
    @Size(min = 0, max = 500, message = "参数键值长度不能超过{max}个字符")
    private String configValue;

    /**
     * 系统内置
     */
    private String configType;

    /**
     * 备注
     */
    private String remark;
}
```

### VO(视图对象)定义

```java
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 参数配置视图对象
 */
@Data
public class SysConfigVo implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 参数主键
     */
    private Long configId;

    /**
     * 参数名称
     */
    private String configName;

    /**
     * 参数键名
     */
    private String configKey;

    /**
     * 参数键值
     */
    private String configValue;

    /**
     * 系统内置(Y是 N否)
     */
    private String configType;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}
```

## 高级特性

### 条件更新

```java
// 使用 LambdaUpdateWrapper
public int batchEnableParentDepts(Long[] parentDeptIds) {
    return baseMapper.update(null, new LambdaUpdateWrapper<SysDept>()
        .set(SysDept::getStatus, DictEnableStatus.ENABLE.getValue())
        .in(SysDept::getDeptId, List.of(parentDeptIds)));
}

// 部分字段更新
public boolean updateStatus(Long userId, String status) {
    return baseMapper.update(null, new LambdaUpdateWrapper<SysUser>()
        .set(SysUser::getStatus, status)
        .set(SysUser::getUpdateTime, new Date())
        .eq(SysUser::getUserId, userId)) > 0;
}

// 使用 DAO 的 lambdaUpdate
public boolean updateUserPassword(Long userId, String password) {
    return update(null, lambdaUpdate()
        .set(SysUser::getPassword, password)
        .eq(SysUser::getUserId, userId));
}
```

### 存在性检查

```java
// 检查 ID 是否存在
public boolean exists(Serializable id) {
    return baseMapper.exists(new LambdaQueryWrapper<T>()
        .eq(getPrimaryKeyColumn(), id));
}

// 检查条件是否存在
public boolean exists(PlusLambdaQuery<T> wrapper) {
    return baseMapper.exists(wrapper);
}

// 使用示例
public boolean checkConfigKeyUnique(SysConfigBo bo) {
    Long configId = ObjectUtil.isNull(bo.getConfigId()) ? -1L : bo.getConfigId();

    PlusLambdaQuery<SysConfig> lqw = PlusLambdaQuery.of(SysConfig.class)
        .eq(SysConfig::getConfigKey, bo.getConfigKey())
        .ne(SysConfig::getConfigId, configId);

    return !configDao.exists(lqw);
}
```

### 数据映射转换

```java
// 使用 mapList 进行复杂转换
public List<TreeNode> listDeptTree() {
    PlusLambdaQuery<SysDept> lqw = PlusLambdaQuery.of(SysDept.class)
        .eq(SysDept::getStatus, DictEnableStatus.ENABLE.getValue())
        .orderByAsc(SysDept::getOrderNum);

    return deptDao.mapList(lqw, dept -> {
        TreeNode node = new TreeNode();
        node.setId(((SysDept) dept).getDeptId());
        node.setLabel(((SysDept) dept).getDeptName());
        node.setParentId(((SysDept) dept).getParentId());
        return node;
    });
}
```

### 自定义 SQL

```java
// 在 Mapper XML 中定义复杂查询
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    /**
     * 根据条件分页查询用户列表(关联部门和角色)
     */
    List<SysUserVo> selectUserList(
        @Param("page") Page<SysUserVo> page,
        @Param("user") SysUserBo user
    );

    /**
     * 根据用户名查询用户(包含角色和权限)
     */
    SysUserVo selectUserByUserName(@Param("userName") String userName);
}
```

```xml
<!-- SysUserMapper.xml -->
<select id="selectUserList" resultType="SysUserVo">
    SELECT u.user_id, u.dept_id, u.nick_name, u.user_name, u.email,
           u.avatar, u.phonenumber, u.sex, u.status, u.login_ip, u.login_date,
           u.create_by, u.create_time, u.remark, d.dept_name, d.leader
    FROM sys_user u
    LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
    WHERE u.is_deleted = 0
    <if test="user.userId != null and user.userId != 0">
        AND u.user_id = #{user.userId}
    </if>
    <if test="user.userName != null and user.userName != ''">
        AND u.user_name LIKE CONCAT('%', #{user.userName}, '%')
    </if>
    <if test="user.status != null and user.status != ''">
        AND u.status = #{user.status}
    </if>
    <if test="user.phonenumber != null and user.phonenumber != ''">
        AND u.phonenumber LIKE CONCAT('%', #{user.phonenumber}, '%')
    </if>
    <if test="user.params.beginTime != null and user.params.beginTime != ''">
        AND date_format(u.create_time,'%Y%m%d') &gt;= date_format(#{user.params.beginTime},'%Y%m%d')
    </if>
    <if test="user.params.endTime != null and user.params.endTime != ''">
        AND date_format(u.create_time,'%Y%m%d') &lt;= date_format(#{user.params.endTime},'%Y%m%d')
    </if>
    <if test="user.deptId != null and user.deptId != 0">
        AND (u.dept_id = #{user.deptId} OR u.dept_id IN
            (SELECT t.dept_id FROM sys_dept t WHERE find_in_set(#{user.deptId}, ancestors)))
    </if>
    ORDER BY u.create_time DESC
</select>
```

## 最佳实践

### 1. 遵循分层架构

```java
// 正确: 分层清晰,职责明确
@Repository
public class SysConfigDaoImpl extends BaseDaoImpl<SysConfigMapper, SysConfig> {
    // DAO 层: 查询条件构建、数据访问
    public PlusLambdaQuery<SysConfig> buildQueryWrapper(SysConfigBo bo) { ... }
}

@Service
public class SysConfigServiceImpl {
    private final ISysConfigDao configDao;
    // Service 层: 业务逻辑、事务、数据转换
    public SysConfigVo get(Long configId) { ... }
}

// 错误: 在 Service 中直接使用 Mapper
@Service
public class SysConfigServiceImpl {
    @Autowired
    private SysConfigMapper configMapper;  // 应该通过 DAO 访问
}
```

### 2. 使用 Lambda 类型安全查询

```java
// 正确: Lambda 表达式,编译期检查
PlusLambdaQuery<SysUser> query = PlusLambdaQuery.of(SysUser.class)
    .eq(SysUser::getStatus, status)
    .like(SysUser::getUserName, userName);

// 错误: 字符串列名,运行时才发现错误
QueryWrapper<SysUser> query = new QueryWrapper<>()
    .eq("statuss", status)  // 拼写错误,运行时才报错
    .like("user_name", userName);
```

### 3. 统一使用 BO/VO 进行数据传输

```java
// 正确: 使用 BO 接收,VO 返回
public SysConfigVo get(Long configId) {
    SysConfig entity = configDao.getById(configId);
    return MapstructUtils.convert(entity, SysConfigVo.class);
}

public boolean insert(SysConfigBo bo) {
    SysConfig entity = MapstructUtils.convert(bo, SysConfig.class);
    return configDao.insert(entity);
}

// 错误: 直接返回实体
public SysConfig get(Long configId) {
    return configDao.getById(configId);  // 可能暴露敏感字段
}
```

### 4. 批量操作使用事务

```java
// 正确: 批量操作添加事务
@Transactional(rollbackFor = Exception.class)
public boolean batchSave(List<SysConfigBo> boList) {
    List<SysConfig> entities = MapstructUtils.convert(boList, SysConfig.class);
    return configDao.batchSave(entities);
}

// 错误: 批量操作无事务
public boolean batchSave(List<SysConfigBo> boList) {
    List<SysConfig> entities = MapstructUtils.convert(boList, SysConfig.class);
    return configDao.batchSave(entities);  // 部分失败无法回滚
}
```

### 5. 合理使用分页

```java
// 正确: 大数据量必须分页
public PageResult<SysUserVo> page(SysUserBo bo, PageQuery pageQuery) {
    PlusLambdaQuery<SysUser> wrapper = userDao.buildQueryWrapper(bo);
    PageResult<SysUser> entityPage = userDao.page(wrapper, pageQuery);
    return entityPage.convert(SysUserVo.class);
}

// 错误: 大表全量查询
public List<SysUserVo> list(SysUserBo bo) {
    PlusLambdaQuery<SysUser> wrapper = userDao.buildQueryWrapper(bo);
    List<SysUser> entities = userDao.list(wrapper);  // 可能 OOM
    return MapstructUtils.convert(entities, SysUserVo.class);
}
```

## 常见问题

### 1. 查询条件不生效

**问题描述:**

使用 `PlusLambdaQuery` 构建的条件未生效。

**问题原因:**

- 条件值为 null 或空字符串(会被自动忽略)
- 条件构造器未正确传递
- 多个条件之间逻辑关系错误

**解决方案:**

```java
// 检查条件值
PlusLambdaQuery<SysUser> query = PlusLambdaQuery.of(SysUser.class);

// eq/like 等方法自动忽略 null 和空字符串
query.eq(SysUser::getStatus, status);  // status 为 null 时不生效

// 强制添加条件
if (status != null) {
    query.eq(SysUser::getStatus, status);
}

// 或使用 isNotBlank 判断
query.eq(StringUtils.isNotBlank(status), SysUser::getStatus, status);
```

### 2. 分页查询总数为 0

**问题描述:**

分页查询返回 total 为 0,但实际有数据。

**问题原因:**

- COUNT 查询与数据查询条件不一致
- 使用了不支持分页的方法

**解决方案:**

```java
// 正确: 使用 pageQuery.build() 构建分页对象
public PageResult<SysConfig> page(PlusLambdaQuery<SysConfig> wrapper, PageQuery pageQuery) {
    Page<SysConfig> page = baseMapper.selectPage(pageQuery.build(), wrapper);
    return PageResult.of(page);
}

// 错误: 手动构建 Page 对象
public PageResult<SysConfig> page(PlusLambdaQuery<SysConfig> wrapper, PageQuery pageQuery) {
    Page<SysConfig> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
    // 缺少排序等配置
    baseMapper.selectPage(page, wrapper);
    return PageResult.of(page);
}
```

### 3. 批量操作性能差

**问题描述:**

批量插入/更新数据时性能很差。

**问题原因:**

- 批次大小设置不当
- 未开启批量执行
- 逐条执行 SQL

**解决方案:**

```java
// 正确: 使用合适的批次大小
public boolean batchInsert(Collection<SysConfig> entities) {
    // 默认批次大小为 1000,根据数据量调整
    return Db.saveBatch(entities, 500);
}

// 配置批量执行
// application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db?rewriteBatchedStatements=true

// 错误: 循环单条插入
public boolean batchInsert(List<SysConfig> entities) {
    for (SysConfig entity : entities) {
        baseMapper.insert(entity);  // 性能极差
    }
    return true;
}
```

### 4. 乐观锁更新失败

**问题描述:**

使用乐观锁更新时频繁失败。

**解决方案:**

```java
// 实体添加版本号字段
@Version
private Integer version;

// 更新时自动使用版本号
public boolean updateById(SysConfig entity) {
    int rows = baseMapper.updateById(entity);
    if (rows == 0) {
        throw ServiceException.of("数据已被修改,请刷新后重试");
    }
    return true;
}

// 或使用重试机制
@Retryable(value = OptimisticLockException.class, maxAttempts = 3)
public boolean updateWithRetry(SysConfig entity) {
    return baseMapper.updateById(entity) > 0;
}
```

### 5. N+1 查询问题

**问题描述:**

查询列表时每条记录都触发额外查询。

**解决方案:**

```java
// 错误: N+1 查询
public List<SysUserVo> listWithDept() {
    List<SysUser> users = userDao.list();
    for (SysUser user : users) {
        // 每个用户都查询一次部门,N+1 问题
        SysDept dept = deptDao.getById(user.getDeptId());
        user.setDeptName(dept.getDeptName());
    }
}

// 正确: 使用 JOIN 查询
public List<SysUserVo> listWithDept() {
    return userMapper.selectUserWithDept();  // 一次 JOIN 查询
}

// 或批量查询后组装
public List<SysUserVo> listWithDept() {
    List<SysUser> users = userDao.list();

    // 批量查询部门
    List<Long> deptIds = users.stream()
        .map(SysUser::getDeptId)
        .distinct()
        .collect(Collectors.toList());

    Map<Long, SysDept> deptMap = deptDao.listByIds(deptIds).stream()
        .collect(Collectors.toMap(SysDept::getDeptId, Function.identity()));

    // 组装数据
    return users.stream().map(user -> {
        SysUserVo vo = MapstructUtils.convert(user, SysUserVo.class);
        SysDept dept = deptMap.get(user.getDeptId());
        if (dept != null) {
            vo.setDeptName(dept.getDeptName());
        }
        return vo;
    }).collect(Collectors.toList());
}
```

### 6. 数据权限未生效

**问题描述:**

配置了数据权限但查询未过滤。

**解决方案:**

```java
// 确保 Mapper 方法添加了数据权限注解
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "user_id")
})
List<SysUser> selectUserList(@Param("user") SysUserBo user);

// 或在 Service 中手动添加权限条件
public List<SysUserVo> list(SysUserBo bo) {
    PlusLambdaQuery<SysUser> wrapper = userDao.buildQueryWrapper(bo);

    // 添加数据权限过滤
    DataScopeHelper.addDataScope(wrapper, "dept_id", "user_id");

    List<SysUser> entities = userDao.list(wrapper);
    return MapstructUtils.convert(entities, SysUserVo.class);
}
```
