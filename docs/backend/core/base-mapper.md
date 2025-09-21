# BaseMapper 基础映射器

RuoYi-Plus 提供的增强型 MyBatis-Plus BaseMapper，扩展了更多实用的数据访问方法。

## 📋 基础用法

### 接口继承

```java
// 实体类
@Data
@TableName("sys_user")
public class SysUser extends BaseEntity {

    @TableId(value = "user_id")
    private Long userId;

    @TableField("user_name")
    private String userName;

    @TableField("nick_name")
    private String nickName;

    @TableField("email")
    private String email;

    @TableField("status")
    private String status;
}

// Mapper接口
@Mapper
public interface SysUserMapper extends BaseMapperPlus<SysUser, UserVo> {

    // 继承BaseMapperPlus后，自动获得所有增强方法
    // 无需编写基础CRUD方法
}

// VO类
@Data
public class UserVo {
    private Long userId;
    private String userName;
    private String nickName;
    private String email;
    private String status;
    private String statusName; // 字典转换后的状态名称
    private Date createTime;
}
```

### 基础操作

```java
@Service
public class UserServiceImpl implements IUserService {

    @Resource
    private SysUserMapper userMapper;

    public void basicOperations() {
        // 1. 插入数据
        SysUser user = new SysUser();
        user.setUserName("admin");
        user.setNickName("管理员");
        userMapper.insert(user);

        // 2. 根据ID查询
        SysUser found = userMapper.selectById(1L);

        // 3. 查询VO对象
        UserVo userVo = userMapper.selectVoById(1L);

        // 4. 条件查询
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getStatus, "0");
        List<SysUser> users = userMapper.selectList(wrapper);

        // 5. 查询VO列表
        List<UserVo> userVos = userMapper.selectVoList(wrapper);

        // 6. 分页查询
        Page<UserVo> page = new Page<>(1, 10);
        Page<UserVo> result = userMapper.selectVoPage(page, wrapper);

        // 7. 更新数据
        user.setNickName("超级管理员");
        userMapper.updateById(user);

        // 8. 删除数据
        userMapper.deleteById(1L);
    }
}
```

## 🎯 核心方法

### BaseMapperPlus 接口

```java
/**
 * 自定义 Mapper 接口, 实现 自定义扩展
 */
public interface BaseMapperPlus<T, V> extends BaseMapper<T> {

    /**
     * 根据 entity 条件，查询全部记录（并翻译）
     */
    default List<V> selectVoList(AbstractWrapper<T, String, ?> wrapper) {
        return selectVoList(wrapper, this.currentVoClass());
    }

    /**
     * 根据 entity 条件，查询全部记录（并翻译）
     */
    <C> List<C> selectVoList(AbstractWrapper<T, String, ?> wrapper, Class<C> clazz);

    /**
     * 根据 Wrapper 条件，查询总记录数
     */
    default Long selectVoCount(AbstractWrapper<T, String, ?> wrapper) {
        return selectCount(wrapper);
    }

    /**
     * 根据 ID 查询一条数据（并翻译）
     */
    default V selectVoById(Serializable id) {
        return selectVoById(id, this.currentVoClass());
    }

    /**
     * 根据 ID 查询一条数据（并翻译）
     */
    <C> C selectVoById(Serializable id, Class<C> clazz);

    /**
     * 根据 entity 条件，查询一条记录（并翻译）
     */
    default V selectVoOne(AbstractWrapper<T, String, ?> wrapper) {
        return selectVoOne(wrapper, this.currentVoClass());
    }

    /**
     * 根据 entity 条件，查询一条记录（并翻译）
     */
    <C> C selectVoOne(AbstractWrapper<T, String, ?> wrapper, Class<C> clazz);

    /**
     * 根据 entity 条件，分页查询记录（并翻译）
     */
    default Page<V> selectVoPage(IPage<T> page, AbstractWrapper<T, String, ?> wrapper) {
        return selectVoPage(page, wrapper, this.currentVoClass());
    }

    /**
     * 根据 entity 条件，分页查询记录（并翻译）
     */
    <C> Page<C> selectVoPage(IPage<T> page, AbstractWrapper<T, String, ?> wrapper, Class<C> clazz);

    /**
     * 批量新增数据，含主键返回
     */
    int insertBatch(Collection<T> entityList);

    /**
     * 批量新增或修改数据
     */
    int insertOrUpdateBatch(Collection<T> entityList);

    /**
     * 获取当前VO类型
     */
    Class<V> currentVoClass();
}
```

### 实现原理

```java
/**
 * 自定义 Mapper 接口实现
 */
public class BaseMapperPlusImpl<T, V> implements BaseMapperPlus<T, V> {

    @Override
    public <C> List<C> selectVoList(AbstractWrapper<T, String, ?> wrapper, Class<C> clazz) {
        List<T> list = this.selectList(wrapper);
        if (CollUtil.isEmpty(list)) {
            return CollUtil.newArrayList();
        }
        return BeanUtil.copyToList(list, clazz);
    }

    @Override
    public <C> C selectVoById(Serializable id, Class<C> clazz) {
        T obj = this.selectById(id);
        if (ObjectUtil.isNull(obj)) {
            return null;
        }
        return BeanUtil.copyProperties(obj, clazz);
    }

    @Override
    public <C> Page<C> selectVoPage(IPage<T> page, AbstractWrapper<T, String, ?> wrapper, Class<C> clazz) {
        Page<T> result = this.selectPage(page, wrapper);
        return PageUtil.build(result, clazz);
    }

    @Override
    public int insertBatch(Collection<T> entityList) {
        // 使用MyBatis-Plus的批量插入
        return mybatisBatch(entityList, (sqlSession, entity) -> {
            String mapperName = this.getClass().getName();
            sqlSession.insert(mapperName + ".insert", entity);
        });
    }

    @Override
    public Class<V> currentVoClass() {
        return (Class<V>) ReflectUtil.getTypeArgument(this.getClass(), 1);
    }
}
```

## 🔧 高级功能

### 条件构造器

```java
@Service
public class UserServiceImpl {

    @Resource
    private SysUserMapper userMapper;

    /**
     * 复杂条件查询
     */
    public List<UserVo> complexQuery(UserBo bo) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<SysUser>()
            // 等值查询
            .eq(StringUtils.isNotBlank(bo.getUserName()), SysUser::getUserName, bo.getUserName())
            .eq(StringUtils.isNotBlank(bo.getStatus()), SysUser::getStatus, bo.getStatus())

            // 模糊查询
            .like(StringUtils.isNotBlank(bo.getNickName()), SysUser::getNickName, bo.getNickName())

            // 范围查询
            .between(ObjectUtil.isAllNotEmpty(bo.getBeginTime(), bo.getEndTime()),
                SysUser::getCreateTime, bo.getBeginTime(), bo.getEndTime())

            // 排序
            .orderByDesc(SysUser::getCreateTime)
            .orderByAsc(SysUser::getUserId);

        return userMapper.selectVoList(wrapper);
    }

    /**
     * 动态条件查询
     */
    public List<UserVo> dynamicQuery(UserBo bo) {
        // 使用PlusLambdaQuery构建动态条件
        return userMapper.selectVoList(
            PlusLambdaQuery.lambdaQuery(SysUser.class)
                .like(SysUser::getUserName, bo.getUserName())
                .like(SysUser::getNickName, bo.getNickName())
                .eq(SysUser::getStatus, bo.getStatus())
                .between(SysUser::getCreateTime, bo.getBeginTime(), bo.getEndTime())
                .orderByDesc(SysUser::getCreateTime)
        );
    }
}
```

### 批量操作

```java
@Service
public class UserServiceImpl {

    @Resource
    private SysUserMapper userMapper;

    /**
     * 批量插入
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchInsert(List<UserBo> boList) {
        List<SysUser> users = BeanUtil.copyToList(boList, SysUser.class);

        // 方式1：使用增强的批量插入
        int result = userMapper.insertBatch(users);

        // 方式2：使用MyBatis-Plus的saveBatch
        // return this.saveBatch(users);

        return result > 0;
    }

    /**
     * 批量更新
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchUpdate(List<UserBo> boList) {
        List<SysUser> users = BeanUtil.copyToList(boList, SysUser.class);

        // 批量更新
        return this.updateBatchById(users);
    }

    /**
     * 批量删除
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchDelete(List<Long> ids, Boolean isValid) {
        if (isValid) {
            // 业务验证
            for (Long id : ids) {
                SysUser user = userMapper.selectById(id);
                if (ObjectUtil.isNull(user)) {
                    throw new ServiceException("用户不存在");
                }
                if ("admin".equals(user.getUserName())) {
                    throw new ServiceException("系统管理员不能删除");
                }
            }
        }

        // 批量删除
        return userMapper.deleteBatchIds(ids) > 0;
    }

    /**
     * 批量插入或更新
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchInsertOrUpdate(List<UserBo> boList) {
        List<SysUser> users = BeanUtil.copyToList(boList, SysUser.class);

        // 使用增强的批量插入或更新
        int result = userMapper.insertOrUpdateBatch(users);

        return result > 0;
    }
}
```

### 分页查询

```java
@Service
public class UserServiceImpl {

    @Resource
    private SysUserMapper userMapper;

    /**
     * 分页查询
     */
    public PageResult<UserVo> queryPageList(UserBo bo, PageQuery pageQuery) {
        // 构建查询条件
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<SysUser>()
            .like(StringUtils.isNotBlank(bo.getUserName()), SysUser::getUserName, bo.getUserName())
            .eq(StringUtils.isNotBlank(bo.getStatus()), SysUser::getStatus, bo.getStatus())
            .orderByDesc(SysUser::getCreateTime);

        // 分页查询并转换为VO
        Page<UserVo> result = userMapper.selectVoPage(pageQuery.build(), wrapper);

        return PageResult.build(result);
    }

    /**
     * 自定义分页查询
     */
    public PageResult<UserVo> customPageQuery(UserBo bo, PageQuery pageQuery) {
        // 构建分页对象
        Page<SysUser> page = pageQuery.build();

        // 设置不查询总数，提升性能
        page.setSearchCount(false);

        // 执行查询
        Page<UserVo> result = userMapper.selectVoPage(page,
            new LambdaQueryWrapper<SysUser>()
                .like(StringUtils.isNotBlank(bo.getUserName()), SysUser::getUserName, bo.getUserName())
                .orderByDesc(SysUser::getCreateTime)
        );

        return PageResult.build(result);
    }
}
```

## 🔄 数据转换

### VO转换

```java
// 自动转换配置
@Configuration
public class MapperConfig {

    /**
     * 自定义类型转换器
     */
    @Bean
    public DefaultConversionService conversionService() {
        DefaultConversionService conversionService = new DefaultConversionService();

        // 添加自定义转换器
        conversionService.addConverter(new StringToDateConverter());
        conversionService.addConverter(new DateToStringConverter());

        return conversionService;
    }
}

// VO转换示例
@Service
public class UserServiceImpl {

    /**
     * 实体转VO（自动字典翻译）
     */
    public UserVo convertToVo(SysUser user) {
        // 基础属性复制
        UserVo vo = BeanUtil.copyProperties(user, UserVo.class);

        // 字典翻译
        vo.setStatusName(DictUtils.getDictLabel("sys_user_status", user.getStatus()));
        vo.setSexName(DictUtils.getDictLabel("sys_user_sex", user.getSex()));

        // 关联数据查询
        if (ObjectUtil.isNotNull(user.getDeptId())) {
            SysDept dept = deptMapper.selectById(user.getDeptId());
            vo.setDeptName(dept.getDeptName());
        }

        return vo;
    }

    /**
     * 批量转换
     */
    public List<UserVo> convertToVoList(List<SysUser> users) {
        if (CollUtil.isEmpty(users)) {
            return CollUtil.newArrayList();
        }

        return users.stream()
            .map(this::convertToVo)
            .collect(Collectors.toList());
    }
}
```

### 字典翻译

```java
// 字典翻译注解
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface DictTranslate {

    /**
     * 字典类型
     */
    String dictType();

    /**
     * 翻译字段名（默认为当前字段名+Name）
     */
    String targetField() default "";
}

// VO类使用字典翻译
@Data
public class UserVo {

    private Long userId;
    private String userName;

    @DictTranslate(dictType = "sys_user_status")
    private String status;
    private String statusName; // 自动翻译字段

    @DictTranslate(dictType = "sys_user_sex", targetField = "sexLabel")
    private String sex;
    private String sexLabel; // 自定义翻译字段名
}

// 自动翻译处理器
@Component
public class DictTranslateProcessor {

    /**
     * 处理字典翻译
     */
    public <T> T translate(T obj) {
        if (ObjectUtil.isNull(obj)) {
            return obj;
        }

        Class<?> clazz = obj.getClass();
        Field[] fields = clazz.getDeclaredFields();

        for (Field field : fields) {
            DictTranslate annotation = field.getAnnotation(DictTranslate.class);
            if (annotation != null) {
                try {
                    field.setAccessible(true);
                    Object value = field.get(obj);

                    if (ObjectUtil.isNotNull(value)) {
                        String dictLabel = DictUtils.getDictLabel(annotation.dictType(), String.valueOf(value));

                        // 确定目标字段名
                        String targetFieldName = StringUtils.isNotBlank(annotation.targetField())
                            ? annotation.targetField()
                            : field.getName() + "Name";

                        // 设置翻译值
                        Field targetField = clazz.getDeclaredField(targetFieldName);
                        targetField.setAccessible(true);
                        targetField.set(obj, dictLabel);
                    }
                } catch (Exception e) {
                    log.warn("字典翻译失败: {}", e.getMessage());
                }
            }
        }

        return obj;
    }

    /**
     * 批量翻译
     */
    public <T> List<T> translateList(List<T> list) {
        if (CollUtil.isEmpty(list)) {
            return list;
        }

        return list.stream()
            .map(this::translate)
            .collect(Collectors.toList());
    }
}
```

## 🔍 性能优化

### 查询优化

```java
@Service
public class UserServiceImpl {

    /**
     * 只查询需要的字段
     */
    public List<UserVo> selectSpecificColumns() {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<SysUser>()
            .select(SysUser::getUserId, SysUser::getUserName, SysUser::getNickName, SysUser::getStatus)
            .eq(SysUser::getStatus, "0");

        return userMapper.selectVoList(wrapper);
    }

    /**
     * 避免N+1查询
     */
    public List<UserVo> avoidN1Query() {
        // 一次性查询所有用户
        List<SysUser> users = userMapper.selectList(null);

        // 一次性查询所有部门
        List<Long> deptIds = users.stream()
            .map(SysUser::getDeptId)
            .filter(ObjectUtil::isNotNull)
            .distinct()
            .collect(Collectors.toList());

        Map<Long, SysDept> deptMap = CollUtil.isNotEmpty(deptIds)
            ? deptMapper.selectBatchIds(deptIds).stream()
                .collect(Collectors.toMap(SysDept::getDeptId, Function.identity()))
            : new HashMap<>();

        // 组装VO
        return users.stream().map(user -> {
            UserVo vo = BeanUtil.copyProperties(user, UserVo.class);
            SysDept dept = deptMap.get(user.getDeptId());
            if (dept != null) {
                vo.setDeptName(dept.getDeptName());
            }
            return vo;
        }).collect(Collectors.toList());
    }

    /**
     * 使用缓存
     */
    @Cacheable(value = "user", key = "#id")
    public UserVo selectUserById(Long id) {
        return userMapper.selectVoById(id);
    }

    /**
     * 流式查询大数据量
     */
    public void processLargeData() {
        userMapper.selectList(new LambdaQueryWrapper<SysUser>()
            .eq(SysUser::getStatus, "0"))
            .stream()
            .forEach(user -> {
                // 处理每个用户
                processUser(user);
            });
    }

    private void processUser(SysUser user) {
        // 用户处理逻辑
    }
}
```

BaseMapper 为 RuoYi-Plus 提供了强大的数据访问能力，通过增强的方法和自动化转换，大大提升了开发效率和代码质量。