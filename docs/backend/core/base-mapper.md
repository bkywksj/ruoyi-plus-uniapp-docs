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

## 🔗 自定义SQL查询

### XML映射文件

```xml
<!-- SysUserMapper.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.system.mapper.SysUserMapper">

    <!-- 结果映射 -->
    <resultMap id="UserVoResultMap" type="com.ruoyi.system.domain.vo.UserVo">
        <id column="user_id" property="userId"/>
        <result column="user_name" property="userName"/>
        <result column="nick_name" property="nickName"/>
        <result column="email" property="email"/>
        <result column="dept_name" property="deptName"/>
        <result column="status" property="status"/>
        <result column="create_time" property="createTime"/>
    </resultMap>

    <!-- 关联查询 -->
    <select id="selectUserWithDept" resultMap="UserVoResultMap">
        SELECT
            u.user_id,
            u.user_name,
            u.nick_name,
            u.email,
            u.status,
            u.create_time,
            d.dept_name
        FROM sys_user u
        LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
        WHERE u.del_flag = '0'
        <if test="userName != null and userName != ''">
            AND u.user_name LIKE CONCAT('%', #{userName}, '%')
        </if>
        <if test="status != null and status != ''">
            AND u.status = #{status}
        </if>
        ORDER BY u.create_time DESC
    </select>

    <!-- 批量查询 -->
    <select id="selectUsersByIds" resultMap="UserVoResultMap">
        SELECT
            u.user_id,
            u.user_name,
            u.nick_name,
            u.email,
            u.status
        FROM sys_user u
        WHERE u.user_id IN
        <foreach collection="ids" item="id" open="(" separator="," close=")">
            #{id}
        </foreach>
        AND u.del_flag = '0'
    </select>

    <!-- 统计查询 -->
    <select id="selectUserStatistics" resultType="com.ruoyi.system.domain.vo.UserStatVo">
        SELECT
            u.dept_id,
            d.dept_name,
            COUNT(u.user_id) as user_count,
            SUM(CASE WHEN u.status = '0' THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN u.status = '1' THEN 1 ELSE 0 END) as disabled_count
        FROM sys_user u
        LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
        WHERE u.del_flag = '0'
        GROUP BY u.dept_id, d.dept_name
        ORDER BY user_count DESC
    </select>

</mapper>
```

### Mapper接口定义

```java
@Mapper
public interface SysUserMapper extends BaseMapperPlus<SysUser, UserVo> {

    /**
     * 关联查询用户和部门
     */
    List<UserVo> selectUserWithDept(@Param("userName") String userName,
                                     @Param("status") String status);

    /**
     * 批量查询用户
     */
    List<UserVo> selectUsersByIds(@Param("ids") List<Long> ids);

    /**
     * 用户统计
     */
    List<UserStatVo> selectUserStatistics();

    /**
     * 使用注解方式定义SQL
     */
    @Select("SELECT * FROM sys_user WHERE user_name = #{userName} AND del_flag = '0'")
    SysUser selectByUserName(@Param("userName") String userName);

    /**
     * 动态SQL注解
     */
    @Select("<script>" +
            "SELECT * FROM sys_user WHERE del_flag = '0'" +
            "<if test='status != null'> AND status = #{status}</if>" +
            "<if test='deptId != null'> AND dept_id = #{deptId}</if>" +
            "ORDER BY create_time DESC" +
            "</script>")
    List<SysUser> selectByCondition(@Param("status") String status,
                                     @Param("deptId") Long deptId);

    /**
     * 更新注解
     */
    @Update("UPDATE sys_user SET login_date = #{loginDate}, login_ip = #{loginIp} " +
            "WHERE user_id = #{userId}")
    int updateLoginInfo(@Param("userId") Long userId,
                        @Param("loginDate") Date loginDate,
                        @Param("loginIp") String loginIp);
}
```

### 多表关联查询

```java
@Service
public class UserServiceImpl {

    @Resource
    private SysUserMapper userMapper;

    /**
     * 复杂多表关联查询
     */
    public List<UserDetailVo> selectUserDetails(UserQueryBo query) {
        // 使用MyBatis-Plus的Wrapper进行关联查询
        return userMapper.selectJoinList(UserDetailVo.class,
            new MPJLambdaWrapper<SysUser>()
                .selectAll(SysUser.class)
                .selectAs(SysDept::getDeptName, UserDetailVo::getDeptName)
                .selectAs(SysRole::getRoleName, UserDetailVo::getRoleNames)
                .leftJoin(SysDept.class, SysDept::getDeptId, SysUser::getDeptId)
                .leftJoin(SysUserRole.class, SysUserRole::getUserId, SysUser::getUserId)
                .leftJoin(SysRole.class, SysRole::getRoleId, SysUserRole::getRoleId)
                .like(StringUtils.isNotBlank(query.getUserName()),
                    SysUser::getUserName, query.getUserName())
                .eq(StringUtils.isNotBlank(query.getStatus()),
                    SysUser::getStatus, query.getStatus())
                .eq(SysUser::getDelFlag, "0")
                .groupBy(SysUser::getUserId)
                .orderByDesc(SysUser::getCreateTime)
        );
    }

    /**
     * 子查询
     */
    public List<UserVo> selectUsersWithSubQuery() {
        return userMapper.selectVoList(
            new LambdaQueryWrapper<SysUser>()
                .inSql(SysUser::getDeptId,
                    "SELECT dept_id FROM sys_dept WHERE status = '0'")
                .eq(SysUser::getDelFlag, "0")
        );
    }

    /**
     * EXISTS子句
     */
    public List<UserVo> selectUsersWithExists() {
        return userMapper.selectVoList(
            new LambdaQueryWrapper<SysUser>()
                .exists("SELECT 1 FROM sys_user_role WHERE sys_user.user_id = sys_user_role.user_id")
                .eq(SysUser::getDelFlag, "0")
        );
    }
}
```

## 🗑️ 软删除处理

### 配置软删除

```java
/**
 * 实体基类，包含软删除字段
 */
@Data
public class BaseEntity implements Serializable {

    /** 删除标志（0代表存在 1代表删除） */
    @TableLogic(value = "0", delval = "1")
    @TableField("del_flag")
    private String delFlag;

    /** 创建者 */
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /** 更新者 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
```

### 软删除操作

```java
@Service
public class UserServiceImpl {

    @Resource
    private SysUserMapper userMapper;

    /**
     * 软删除用户
     */
    public Boolean deleteUser(Long userId) {
        // 直接调用deleteById，MyBatis-Plus会自动转换为UPDATE语句
        // UPDATE sys_user SET del_flag = '1' WHERE user_id = ?
        return userMapper.deleteById(userId) > 0;
    }

    /**
     * 批量软删除
     */
    public Boolean batchDelete(List<Long> userIds) {
        // 批量软删除
        return userMapper.deleteBatchIds(userIds) > 0;
    }

    /**
     * 查询已删除的数据
     */
    public List<SysUser> selectDeletedUsers() {
        // 使用自定义SQL查询已删除数据
        return userMapper.selectList(
            new QueryWrapper<SysUser>()
                .eq("del_flag", "1")
                // 忽略逻辑删除
                .last("/* 忽略逻辑删除 */")
        );
    }

    /**
     * 恢复已删除的数据
     */
    public Boolean restoreUser(Long userId) {
        SysUser user = new SysUser();
        user.setUserId(userId);
        user.setDelFlag("0");

        // 使用update语句恢复
        return userMapper.update(user,
            new UpdateWrapper<SysUser>()
                .eq("user_id", userId)
                .eq("del_flag", "1")
                .last("/* 忽略逻辑删除 */")
        ) > 0;
    }

    /**
     * 物理删除（谨慎使用）
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean physicalDelete(Long userId) {
        // 使用原生SQL物理删除
        return SqlHelper.execute(SysUser.class, mapper -> {
            return mapper.delete(
                new QueryWrapper<SysUser>()
                    .eq("user_id", userId)
                    .last("/* 忽略逻辑删除 */")
            ) > 0;
        });
    }
}
```

## 🔒 乐观锁实现

### 配置乐观锁

```java
/**
 * 实体类添加版本字段
 */
@Data
@TableName("sys_config")
public class SysConfig extends BaseEntity {

    @TableId(value = "config_id")
    private Long configId;

    private String configName;

    private String configKey;

    private String configValue;

    /** 乐观锁版本号 */
    @Version
    @TableField("version")
    private Integer version;
}

/**
 * MyBatis-Plus配置乐观锁插件
 */
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));

        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());

        // 防止全表更新与删除插件
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());

        return interceptor;
    }
}
```

### 乐观锁使用

```java
@Service
@Slf4j
public class ConfigServiceImpl {

    @Resource
    private SysConfigMapper configMapper;

    /**
     * 更新配置（带乐观锁）
     */
    public Boolean updateConfig(ConfigBo bo) {
        // 查询当前数据
        SysConfig config = configMapper.selectById(bo.getConfigId());
        if (config == null) {
            throw new ServiceException("配置不存在");
        }

        // 更新数据
        config.setConfigValue(bo.getConfigValue());
        config.setRemark(bo.getRemark());
        // version字段不需要手动设置，插件会自动处理

        // 执行更新
        // UPDATE sys_config SET config_value = ?, remark = ?, version = version + 1
        // WHERE config_id = ? AND version = ?
        int result = configMapper.updateById(config);

        if (result == 0) {
            throw new ServiceException("数据已被其他用户修改，请刷新后重试");
        }

        return true;
    }

    /**
     * 带重试的更新
     */
    @Retryable(value = ServiceException.class, maxAttempts = 3, backoff = @Backoff(delay = 100))
    public Boolean updateConfigWithRetry(ConfigBo bo) {
        return updateConfig(bo);
    }

    /**
     * 手动处理乐观锁冲突
     */
    public Boolean updateConfigWithConflictHandle(ConfigBo bo) {
        int maxRetries = 3;
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                // 查询最新数据
                SysConfig config = configMapper.selectById(bo.getConfigId());
                if (config == null) {
                    throw new ServiceException("配置不存在");
                }

                // 更新数据
                config.setConfigValue(bo.getConfigValue());
                int result = configMapper.updateById(config);

                if (result > 0) {
                    return true;
                }

                // 更新失败，可能是版本冲突
                attempt++;
                log.warn("乐观锁冲突，重试第{}次", attempt);

                if (attempt < maxRetries) {
                    Thread.sleep(100 * attempt); // 退避等待
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ServiceException("操作被中断");
            }
        }

        throw new ServiceException("更新失败，请稍后重试");
    }
}
```

## ✨ 自动填充

### 配置自动填充处理器

```java
/**
 * MyBatis-Plus 自动填充处理器
 */
@Slf4j
@Component
public class CreateAndUpdateMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        try {
            // 创建时间
            if (metaObject.hasSetter("createTime")) {
                this.strictInsertFill(metaObject, "createTime", Date.class, new Date());
            }

            // 创建者
            if (metaObject.hasSetter("createBy")) {
                String username = getUsername();
                this.strictInsertFill(metaObject, "createBy", String.class, username);
            }

            // 部门ID
            if (metaObject.hasSetter("createDept")) {
                Long deptId = getDeptId();
                this.strictInsertFill(metaObject, "createDept", Long.class, deptId);
            }

            // 更新时间（插入时也填充）
            if (metaObject.hasSetter("updateTime")) {
                this.strictInsertFill(metaObject, "updateTime", Date.class, new Date());
            }

            // 更新者
            if (metaObject.hasSetter("updateBy")) {
                String username = getUsername();
                this.strictInsertFill(metaObject, "updateBy", String.class, username);
            }

            // 删除标志
            if (metaObject.hasSetter("delFlag")) {
                this.strictInsertFill(metaObject, "delFlag", String.class, "0");
            }

            // 租户ID
            if (metaObject.hasSetter("tenantId")) {
                String tenantId = getTenantId();
                this.strictInsertFill(metaObject, "tenantId", String.class, tenantId);
            }
        } catch (Exception e) {
            log.error("自动填充异常: {}", e.getMessage());
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        try {
            // 更新时间
            if (metaObject.hasSetter("updateTime")) {
                this.strictUpdateFill(metaObject, "updateTime", Date.class, new Date());
            }

            // 更新者
            if (metaObject.hasSetter("updateBy")) {
                String username = getUsername();
                this.strictUpdateFill(metaObject, "updateBy", String.class, username);
            }
        } catch (Exception e) {
            log.error("自动填充异常: {}", e.getMessage());
        }
    }

    /**
     * 获取当前登录用户名
     */
    private String getUsername() {
        try {
            LoginUser loginUser = LoginHelper.getLoginUser();
            return loginUser != null ? loginUser.getUsername() : "system";
        } catch (Exception e) {
            return "system";
        }
    }

    /**
     * 获取当前部门ID
     */
    private Long getDeptId() {
        try {
            LoginUser loginUser = LoginHelper.getLoginUser();
            return loginUser != null ? loginUser.getDeptId() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 获取当前租户ID
     */
    private String getTenantId() {
        try {
            return TenantHelper.getTenantId();
        } catch (Exception e) {
            return null;
        }
    }
}
```

### 实体类配置

```java
/**
 * 实体基类
 */
@Data
public class BaseEntity implements Serializable {

    /** 创建者 */
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /** 创建部门 */
    @TableField(fill = FieldFill.INSERT)
    private Long createDept;

    /** 更新者 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    /** 删除标志 */
    @TableLogic(value = "0", delval = "1")
    @TableField(value = "del_flag", fill = FieldFill.INSERT)
    private String delFlag;

    /** 租户ID */
    @TableField(fill = FieldFill.INSERT)
    private String tenantId;
}
```

## 🔄 类型处理器

### 自定义类型处理器

```java
/**
 * JSON类型处理器
 * 用于处理JSON字段的序列化和反序列化
 */
@MappedTypes({Object.class})
@MappedJdbcTypes(JdbcType.VARCHAR)
public class JsonTypeHandler<T> extends BaseTypeHandler<T> {

    private final Class<T> type;

    public JsonTypeHandler(Class<T> type) {
        this.type = type;
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, T parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, JsonUtils.toJsonString(parameter));
    }

    @Override
    public T getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        return parseJson(json);
    }

    @Override
    public T getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String json = rs.getString(columnIndex);
        return parseJson(json);
    }

    @Override
    public T getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String json = cs.getString(columnIndex);
        return parseJson(json);
    }

    private T parseJson(String json) {
        if (StringUtils.isBlank(json)) {
            return null;
        }
        return JsonUtils.parseObject(json, type);
    }
}

/**
 * List<String> 类型处理器
 */
@MappedTypes({List.class})
@MappedJdbcTypes(JdbcType.VARCHAR)
public class StringListTypeHandler extends BaseTypeHandler<List<String>> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter,
            JdbcType jdbcType) throws SQLException {
        ps.setString(i, String.join(",", parameter));
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return parseList(value);
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return parseList(value);
    }

    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex)
            throws SQLException {
        String value = cs.getString(columnIndex);
        return parseList(value);
    }

    private List<String> parseList(String value) {
        if (StringUtils.isBlank(value)) {
            return new ArrayList<>();
        }
        return Arrays.asList(value.split(","));
    }
}

/**
 * 加密字段类型处理器
 */
@MappedTypes({String.class})
@MappedJdbcTypes(JdbcType.VARCHAR)
public class EncryptTypeHandler extends BaseTypeHandler<String> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, String parameter,
            JdbcType jdbcType) throws SQLException {
        // 写入数据库时加密
        ps.setString(i, EncryptUtils.encrypt(parameter));
    }

    @Override
    public String getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return decrypt(value);
    }

    @Override
    public String getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return decrypt(value);
    }

    @Override
    public String getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return decrypt(value);
    }

    private String decrypt(String value) {
        if (StringUtils.isBlank(value)) {
            return value;
        }
        try {
            return EncryptUtils.decrypt(value);
        } catch (Exception e) {
            return value; // 解密失败返回原值
        }
    }
}
```

### 实体类使用类型处理器

```java
@Data
@TableName(value = "sys_config", autoResultMap = true)
public class SysConfig extends BaseEntity {

    @TableId(value = "config_id")
    private Long configId;

    private String configName;

    private String configKey;

    /** JSON配置值 */
    @TableField(typeHandler = JsonTypeHandler.class)
    private Map<String, Object> configJson;

    /** 标签列表 */
    @TableField(typeHandler = StringListTypeHandler.class)
    private List<String> tags;

    /** 加密字段 */
    @TableField(typeHandler = EncryptTypeHandler.class)
    private String secretValue;
}
```

## 🛡️ 数据权限

### 数据权限处理器

```java
/**
 * 数据权限处理器
 */
@Component
@Slf4j
public class DataPermissionHandler implements DataPermissionInterceptor {

    @Override
    public Expression getSqlSegment(Expression where, String mappedStatementId) {
        // 获取当前登录用户
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.isAdmin()) {
            // 未登录或管理员，不过滤
            return where;
        }

        // 获取数据权限配置
        DataScope dataScope = getDataScope(mappedStatementId);
        if (dataScope == null) {
            return where;
        }

        // 构建数据权限SQL
        Expression dataPermissionExpression = buildDataPermission(loginUser, dataScope);

        if (where == null) {
            return dataPermissionExpression;
        }

        // 合并条件
        return new AndExpression(where, dataPermissionExpression);
    }

    /**
     * 构建数据权限表达式
     */
    private Expression buildDataPermission(LoginUser user, DataScope dataScope) {
        switch (dataScope.getType()) {
            case ALL:
                // 全部数据权限
                return null;
            case DEPT:
                // 本部门数据
                return new EqualsTo(
                    new Column(dataScope.getDeptColumn()),
                    new LongValue(user.getDeptId())
                );
            case DEPT_AND_CHILD:
                // 本部门及子部门数据
                return new InExpression(
                    new Column(dataScope.getDeptColumn()),
                    buildDeptSubQuery(user.getDeptId())
                );
            case SELF:
                // 仅本人数据
                return new EqualsTo(
                    new Column(dataScope.getUserColumn()),
                    new LongValue(user.getUserId())
                );
            case CUSTOM:
                // 自定义数据权限
                return buildCustomPermission(user, dataScope);
            default:
                return null;
        }
    }

    /**
     * 构建部门子查询
     */
    private SubSelect buildDeptSubQuery(Long deptId) {
        PlainSelect selectBody = new PlainSelect();
        selectBody.setSelectItems(Collections.singletonList(new AllColumns()));
        selectBody.setFromItem(new Table("sys_dept"));
        selectBody.setWhere(new LikeExpression(
            new Column("ancestors"),
            new StringValue("%" + deptId + "%")
        ));

        SubSelect subSelect = new SubSelect();
        subSelect.setSelectBody(selectBody);
        return subSelect;
    }
}

/**
 * 数据权限注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataScope {

    /**
     * 权限类型
     */
    DataScopeType type() default DataScopeType.DEPT;

    /**
     * 部门表别名
     */
    String deptAlias() default "";

    /**
     * 部门字段名
     */
    String deptColumn() default "dept_id";

    /**
     * 用户字段名
     */
    String userColumn() default "user_id";
}

/**
 * 数据权限类型
 */
public enum DataScopeType {
    /** 全部数据权限 */
    ALL,
    /** 本部门数据权限 */
    DEPT,
    /** 本部门及子部门数据权限 */
    DEPT_AND_CHILD,
    /** 仅本人数据权限 */
    SELF,
    /** 自定义数据权限 */
    CUSTOM
}
```

### 使用数据权限

```java
@Service
public class UserServiceImpl {

    @Resource
    private SysUserMapper userMapper;

    /**
     * 查询用户列表（自动应用数据权限）
     */
    @DataScope(type = DataScopeType.DEPT_AND_CHILD, deptColumn = "dept_id")
    public List<UserVo> selectUserList(UserBo bo) {
        return userMapper.selectVoList(
            new LambdaQueryWrapper<SysUser>()
                .like(StringUtils.isNotBlank(bo.getUserName()),
                    SysUser::getUserName, bo.getUserName())
                .eq(SysUser::getDelFlag, "0")
        );
    }

    /**
     * 查询本人数据
     */
    @DataScope(type = DataScopeType.SELF, userColumn = "user_id")
    public List<UserVo> selectMyData() {
        return userMapper.selectVoList(null);
    }
}
```

## 🔐 SQL注入防护

### 参数校验

```java
/**
 * SQL注入防护工具类
 */
public final class SqlInjectionUtils {

    private SqlInjectionUtils() {}

    /** SQL注入关键字正则 */
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "('.+--)|(--)|(\\|)|(%7C)|(;)|" +
        "(\\bselect\\b)|" +
        "(\\binsert\\b)|" +
        "(\\bdelete\\b)|" +
        "(\\bupdate\\b)|" +
        "(\\bdrop\\b)|" +
        "(\\btruncate\\b)|" +
        "(\\bcreate\\b)|" +
        "(\\balter\\b)|" +
        "(\\bexec\\b)|" +
        "(\\bunion\\b)|" +
        "(\\bor\\b)|" +
        "(\\band\\b)",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * 检查是否包含SQL注入风险
     */
    public static boolean hasSqlInjection(String value) {
        if (StringUtils.isBlank(value)) {
            return false;
        }
        return SQL_INJECTION_PATTERN.matcher(value).find();
    }

    /**
     * 检查参数并抛出异常
     */
    public static void checkSqlInjection(String... values) {
        for (String value : values) {
            if (hasSqlInjection(value)) {
                throw new ServiceException("参数存在SQL注入风险");
            }
        }
    }

    /**
     * 过滤SQL注入字符
     */
    public static String filterSqlInjection(String value) {
        if (StringUtils.isBlank(value)) {
            return value;
        }
        return value.replaceAll("(?i)(select|insert|delete|update|drop|truncate|" +
            "create|alter|exec|union|and|or|--|;)", "");
    }

    /**
     * 转义特殊字符
     */
    public static String escapeSql(String value) {
        if (StringUtils.isBlank(value)) {
            return value;
        }
        return value.replace("'", "''")
                    .replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");
    }
}
```

### 安全查询

```java
@Service
public class SafeQueryService {

    @Resource
    private SysUserMapper userMapper;

    /**
     * 安全的动态排序查询
     */
    public List<UserVo> safeOrderQuery(String orderByColumn, String orderDirection) {
        // 校验排序字段（白名单方式）
        Set<String> allowedColumns = Set.of("user_id", "user_name", "create_time");
        if (!allowedColumns.contains(orderByColumn)) {
            throw new ServiceException("不支持的排序字段: " + orderByColumn);
        }

        // 校验排序方向
        String direction = "desc".equalsIgnoreCase(orderDirection) ? "desc" : "asc";

        return userMapper.selectVoList(
            new QueryWrapper<SysUser>()
                .eq("del_flag", "0")
                .orderBy(true, "asc".equals(direction), orderByColumn)
        );
    }

    /**
     * 安全的模糊查询
     */
    public List<UserVo> safeLikeQuery(String keyword) {
        // 转义特殊字符
        String safeKeyword = SqlInjectionUtils.escapeSql(keyword);

        return userMapper.selectVoList(
            new LambdaQueryWrapper<SysUser>()
                .like(SysUser::getUserName, safeKeyword)
                .eq(SysUser::getDelFlag, "0")
        );
    }

    /**
     * 使用参数化查询
     */
    public SysUser safeParameterizedQuery(String userName) {
        // 使用MyBatis-Plus的条件构造器，自动参数化
        return userMapper.selectOne(
            new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUserName, userName)
                .eq(SysUser::getDelFlag, "0")
        );
    }
}
```

## 📝 事务管理

### 事务配置

```java
@Service
@Slf4j
public class TransactionalService {

    @Resource
    private SysUserMapper userMapper;

    @Resource
    private SysUserRoleMapper userRoleMapper;

    /**
     * 基础事务
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean createUser(UserBo bo) {
        // 新增用户
        SysUser user = BeanUtil.copyProperties(bo, SysUser.class);
        userMapper.insert(user);

        // 新增用户角色关联
        if (CollUtil.isNotEmpty(bo.getRoleIds())) {
            List<SysUserRole> userRoles = bo.getRoleIds().stream()
                .map(roleId -> {
                    SysUserRole ur = new SysUserRole();
                    ur.setUserId(user.getUserId());
                    ur.setRoleId(roleId);
                    return ur;
                })
                .collect(Collectors.toList());

            userRoleMapper.insertBatch(userRoles);
        }

        return true;
    }

    /**
     * 只读事务
     */
    @Transactional(readOnly = true)
    public UserVo queryUser(Long userId) {
        return userMapper.selectVoById(userId);
    }

    /**
     * 独立事务
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void logOperation(String operation) {
        // 独立事务记录操作日志
        // 即使外层事务回滚，这里的日志也会保存
    }

    /**
     * 嵌套事务
     */
    @Transactional(propagation = Propagation.NESTED, rollbackFor = Exception.class)
    public void nestedOperation() {
        // 嵌套事务
        // 可以独立回滚到保存点，不影响外层事务
    }

    /**
     * 手动控制事务
     */
    public Boolean manualTransaction(List<UserBo> boList) {
        TransactionStatus status = TransactionHelper.begin();
        try {
            for (UserBo bo : boList) {
                SysUser user = BeanUtil.copyProperties(bo, SysUser.class);
                userMapper.insert(user);
            }
            TransactionHelper.commit(status);
            return true;
        } catch (Exception e) {
            TransactionHelper.rollback(status);
            throw e;
        }
    }
}
```

## 📋 注意事项

### 1. 性能注意事项

- **避免N+1查询**: 使用批量查询代替循环单条查询
- **只查询需要的字段**: 使用select()方法指定字段
- **合理使用索引**: 确保WHERE条件字段有索引
- **分页查询大数据**: 避免一次性查询全部数据
- **使用缓存**: 对热点数据使用Redis缓存

```java
// ❌ 不推荐：N+1查询
for (Long userId : userIds) {
    UserVo user = userMapper.selectVoById(userId);
}

// ✅ 推荐：批量查询
List<UserVo> users = userMapper.selectVoList(
    new LambdaQueryWrapper<SysUser>().in(SysUser::getUserId, userIds)
);
```

### 2. 安全注意事项

- **使用参数化查询**: 避免SQL拼接
- **校验用户输入**: 防止SQL注入
- **限制返回字段**: 不返回敏感字段
- **数据权限控制**: 根据用户权限过滤数据
- **操作日志记录**: 记录敏感数据操作

### 3. 代码规范

- **统一使用LambdaQueryWrapper**: 避免硬编码字段名
- **VO与Entity分离**: 查询返回VO，更新使用Entity
- **事务边界清晰**: Service层统一管理事务
- **异常处理规范**: 捕获并转换数据库异常

### 4. 批量操作注意事项

- **批量大小控制**: 单次批量不超过1000条
- **事务分割**: 超大批量操作分批提交
- **主键生成**: 批量插入使用数据库自增或UUID
- **异常处理**: 批量操作失败需要回滚

```java
// 分批处理大数据量
public void batchProcess(List<UserBo> boList) {
    int batchSize = 500;
    List<List<UserBo>> batches = ListUtil.split(boList, batchSize);

    for (List<UserBo> batch : batches) {
        processBatch(batch);
    }
}

@Transactional(rollbackFor = Exception.class)
public void processBatch(List<UserBo> batch) {
    List<SysUser> users = BeanUtil.copyToList(batch, SysUser.class);
    userMapper.insertBatch(users);
}
```

### 5. 软删除注意事项

- **统一使用del_flag**: 所有表保持一致的软删除字段
- **唯一索引处理**: 软删除数据可能影响唯一索引
- **关联删除**: 关联表需要同步软删除
- **数据清理**: 定期清理已删除数据

### 6. 乐观锁注意事项

- **version字段类型**: 推荐使用Integer类型
- **并发冲突处理**: 提供友好的错误提示
- **重试机制**: 关键操作添加重试逻辑
- **version更新**: 只有updateById和update会触发version更新