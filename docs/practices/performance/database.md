# 数据库性能优化最佳实践

## 概述

数据库性能优化是系统优化中最关键的环节之一。RuoYi-Plus-UniApp 项目基于 MySQL 8.0+ 和 MyBatis-Plus 构建数据访问层,提供了丰富的优化策略和工具。本文档介绍数据库性能优化的核心技术和最佳实践。

**核心价值:**

- **响应速度** - 降低查询延迟,提升用户体验
- **吞吐能力** - 提高并发处理能力
- **资源利用** - 合理使用数据库资源
- **可扩展性** - 支持业务增长

**技术栈:**

| 组件 | 版本 | 说明 |
|-----|------|------|
| MySQL | 8.0+ | 关系型数据库 |
| MyBatis-Plus | 3.5.14 | ORM框架增强 |
| Druid | 1.2.23 | 数据库连接池 |
| p6spy | 3.9.1 | SQL监控和分析 |
| Redisson | 3.51.0 | 缓存层支持 |

---

## 索引优化

### 索引设计原则

```sql
-- ==================== 主键索引 ====================
-- 使用自增主键或雪花ID
CREATE TABLE sys_user (
    user_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    ...
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

-- ==================== 唯一索引 ====================
-- 对唯一字段创建唯一索引
ALTER TABLE sys_user ADD UNIQUE INDEX uk_user_name (user_name);
ALTER TABLE sys_user ADD UNIQUE INDEX uk_phone (phone);
ALTER TABLE sys_user ADD UNIQUE INDEX uk_email (email);

-- ==================== 普通索引 ====================
-- 对高频查询字段创建索引
ALTER TABLE sys_user ADD INDEX idx_dept_id (dept_id);
ALTER TABLE sys_user ADD INDEX idx_status (status);
ALTER TABLE sys_user ADD INDEX idx_create_time (create_time);

-- ==================== 联合索引 ====================
-- 遵循最左前缀原则
ALTER TABLE sys_user ADD INDEX idx_dept_status (dept_id, status);
ALTER TABLE sys_oper_log ADD INDEX idx_module_type_time (module, business_type, oper_time);
```

### 索引选择策略

```sql
-- 好的实践: 覆盖索引
-- 查询字段都在索引中,无需回表
CREATE INDEX idx_user_cover ON sys_user(dept_id, status, user_name, nick_name);

SELECT user_name, nick_name FROM sys_user
WHERE dept_id = 100 AND status = '0';

-- 好的实践: 前缀索引(针对长字符串)
ALTER TABLE sys_oss ADD INDEX idx_url_prefix (url(50));

-- 避免: 在索引列上使用函数
-- 坏的实践
SELECT * FROM sys_user WHERE YEAR(create_time) = 2024;

-- 好的实践
SELECT * FROM sys_user
WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01';
```

### 索引监控和分析

```sql
-- 查看表索引
SHOW INDEX FROM sys_user;

-- 查看索引使用情况
SELECT
    table_name,
    index_name,
    stat_value AS pages,
    ROUND(stat_value * @@innodb_page_size / 1024 / 1024, 2) AS size_mb
FROM mysql.innodb_index_stats
WHERE database_name = 'ruoyi'
  AND stat_name = 'size';

-- 分析查询执行计划
EXPLAIN SELECT * FROM sys_user WHERE dept_id = 100;
EXPLAIN ANALYZE SELECT * FROM sys_user WHERE user_name LIKE 'admin%';

-- 查看慢查询
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 20;
```

---

## SQL 优化

### 查询优化

```java
// ==================== 分页优化 ====================

// 坏的实践: 深度分页
@Select("SELECT * FROM sys_user ORDER BY user_id LIMIT 100000, 10")
List<SysUser> badDeepPaging();

// 好的实践: 游标分页
@Select("SELECT * FROM sys_user WHERE user_id > #{lastId} ORDER BY user_id LIMIT 10")
List<SysUser> goodCursorPaging(@Param("lastId") Long lastId);

// 好的实践: 延迟关联
@Select("""
    SELECT u.* FROM sys_user u
    INNER JOIN (
        SELECT user_id FROM sys_user ORDER BY user_id LIMIT #{offset}, #{limit}
    ) t ON u.user_id = t.user_id
    """)
List<SysUser> goodDeferredJoin(@Param("offset") int offset, @Param("limit") int limit);
```

### MyBatis-Plus 优化

```java
// ==================== 条件构造器优化 ====================

// 好的实践: 只查询需要的字段
public List<SysUserVo> listUserOptions() {
    return userMapper.selectList(
        Wrappers.<SysUser>lambdaQuery()
            .select(SysUser::getUserId, SysUser::getUserName, SysUser::getNickName)
            .eq(SysUser::getStatus, "0")
            .eq(SysUser::getDelFlag, "0")
    );
}

// 好的实践: 使用exists替代in(大数据量)
public List<SysUser> listUsersByRoles(List<Long> roleIds) {
    return userMapper.selectList(
        Wrappers.<SysUser>lambdaQuery()
            .exists(
                "SELECT 1 FROM sys_user_role ur " +
                "WHERE ur.user_id = sys_user.user_id " +
                "AND ur.role_id IN (" + StringUtils.join(roleIds, ",") + ")"
            )
    );
}

// 好的实践: 批量操作
public void batchInsertUsers(List<SysUser> users) {
    // 分批插入,每批1000条
    int batchSize = 1000;
    for (int i = 0; i < users.size(); i += batchSize) {
        List<SysUser> batch = users.subList(i, Math.min(i + batchSize, users.size()));
        userMapper.insertBatch(batch);
    }
}
```

### 复杂查询优化

```java
// ==================== 多表关联优化 ====================

// 好的实践: 使用数据权限注解
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "create_by")
})
public PageResult<SysUserVo> selectPageUserList(SysUserQuery query, PageQuery pageQuery) {
    return userMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(query));
}

// 好的实践: 避免N+1查询
// 一次性查询关联数据
public List<SysUserVo> listUsersWithDept() {
    // 查询用户
    List<SysUser> users = userMapper.selectList(null);
    if (CollUtil.isEmpty(users)) {
        return Collections.emptyList();
    }

    // 批量查询部门
    Set<Long> deptIds = users.stream()
        .map(SysUser::getDeptId)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());

    Map<Long, SysDept> deptMap = deptMapper.selectBatchIds(deptIds)
        .stream()
        .collect(Collectors.toMap(SysDept::getDeptId, Function.identity()));

    // 组装结果
    return users.stream()
        .map(user -> {
            SysUserVo vo = BeanUtil.toBean(user, SysUserVo.class);
            vo.setDept(deptMap.get(user.getDeptId()));
            return vo;
        })
        .collect(Collectors.toList());
}
```

---

## 连接池优化

### Druid 配置

```yaml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      # 初始化连接数
      initial-size: 10
      # 最小空闲连接数
      min-idle: 10
      # 最大活跃连接数
      max-active: 100
      # 获取连接等待超时时间(毫秒)
      max-wait: 60000

      # 连接有效性检测
      validation-query: SELECT 1
      validation-query-timeout: 5
      # 申请连接时执行检测
      test-on-borrow: false
      # 归还连接时执行检测
      test-on-return: false
      # 空闲时执行检测
      test-while-idle: true

      # 空闲连接回收(毫秒)
      time-between-eviction-runs-millis: 60000
      # 连接最小空闲时间(毫秒)
      min-evictable-idle-time-millis: 300000
      # 连接最大存活时间(毫秒)
      max-evictable-idle-time-millis: 900000

      # 开启PSCache(提升prepared statement性能)
      pool-prepared-statements: true
      max-pool-prepared-statement-per-connection-size: 50

      # 防火墙(防SQL注入)
      filters: stat,wall

      # 监控统计
      stat-view-servlet:
        enabled: true
        url-pattern: /druid/*
        login-username: admin
        login-password: admin123
```

### 连接池监控

```java
/**
 * Druid连接池监控
 */
@Component
@Slf4j
public class DruidMonitor {

    @Autowired
    private DruidDataSource dataSource;

    /**
     * 获取连接池状态
     */
    public DruidPoolStats getPoolStats() {
        DruidPoolStats stats = new DruidPoolStats();
        stats.setActiveCount(dataSource.getActiveCount());
        stats.setPoolingCount(dataSource.getPoolingCount());
        stats.setWaitThreadCount(dataSource.getWaitThreadCount());
        stats.setConnectCount(dataSource.getConnectCount());
        stats.setCloseCount(dataSource.getCloseCount());
        stats.setConnectErrorCount(dataSource.getConnectErrorCount());
        return stats;
    }

    /**
     * 定时检查连接池健康状态
     */
    @Scheduled(fixedRate = 60000)
    public void checkPoolHealth() {
        int activeCount = dataSource.getActiveCount();
        int maxActive = dataSource.getMaxActive();
        double usage = (double) activeCount / maxActive;

        if (usage > 0.8) {
            log.warn("连接池使用率过高: {}%, active={}, max={}",
                String.format("%.1f", usage * 100), activeCount, maxActive);
        }

        int waitThreadCount = dataSource.getWaitThreadCount();
        if (waitThreadCount > 0) {
            log.warn("存在等待获取连接的线程: {}", waitThreadCount);
        }
    }
}
```

---

## 缓存策略

### 多级缓存架构

```java
/**
 * 多级缓存配置
 * L1: 本地缓存(Caffeine)
 * L2: 分布式缓存(Redis)
 */
@Configuration
public class MultiLevelCacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        // 本地缓存配置
        Caffeine<Object, Object> caffeine = Caffeine.newBuilder()
            .initialCapacity(100)
            .maximumSize(1000)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .recordStats();

        // Redis缓存配置
        RedisCacheConfiguration redisConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        return new TwoLevelCacheManager(caffeine, factory, redisConfig);
    }
}
```

### 缓存使用示例

```java
@Service
@Slf4j
public class SysDictDataServiceImpl implements ISysDictDataService {

    @Autowired
    private SysDictDataMapper dictDataMapper;

    @Autowired
    private RedisCache redisCache;

    private static final String DICT_CACHE_KEY = "sys_dict:";

    /**
     * 根据字典类型查询字典数据
     * 优先从缓存获取
     */
    @Override
    public List<SysDictDataVo> selectDictDataByType(String dictType) {
        String cacheKey = DICT_CACHE_KEY + dictType;

        // 优先从缓存获取
        List<SysDictDataVo> cached = redisCache.getCacheList(cacheKey);
        if (CollUtil.isNotEmpty(cached)) {
            return cached;
        }

        // 缓存未命中,查询数据库
        List<SysDictDataVo> list = dictDataMapper.selectVoList(
            Wrappers.<SysDictData>lambdaQuery()
                .eq(SysDictData::getDictType, dictType)
                .eq(SysDictData::getStatus, "0")
                .orderByAsc(SysDictData::getDictSort)
        );

        // 写入缓存
        if (CollUtil.isNotEmpty(list)) {
            redisCache.setCacheList(cacheKey, list);
        }

        return list;
    }

    /**
     * 清理字典缓存
     */
    @Override
    public void clearDictCache() {
        Collection<String> keys = redisCache.keys(DICT_CACHE_KEY + "*");
        redisCache.deleteObject(keys);
    }

    /**
     * 新增/修改/删除时清理缓存
     */
    @CacheEvict(cacheNames = "sys_dict", allEntries = true)
    @Override
    public int insertDictData(SysDictDataBo bo) {
        SysDictData data = BeanUtil.toBean(bo, SysDictData.class);
        return dictDataMapper.insert(data);
    }
}
```

### 热点数据缓存

```java
/**
 * 热点数据预热
 */
@Component
@Slf4j
public class HotDataWarmer implements ApplicationRunner {

    @Autowired
    private ISysDictTypeService dictTypeService;

    @Autowired
    private ISysConfigService configService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("开始预热热点数据缓存...");

        // 预热字典缓存
        warmDictCache();

        // 预热系统配置缓存
        warmConfigCache();

        log.info("热点数据缓存预热完成");
    }

    private void warmDictCache() {
        List<SysDictType> dictTypes = dictTypeService.selectDictTypeAll();
        for (SysDictType dictType : dictTypes) {
            dictTypeService.selectDictDataByType(dictType.getDictType());
        }
        log.info("字典缓存预热完成,共{}个字典类型", dictTypes.size());
    }

    private void warmConfigCache() {
        configService.selectConfigList(new SysConfigQuery());
        log.info("系统配置缓存预热完成");
    }
}
```

---

## 分页优化

### 深度分页优化

```java
/**
 * 分页查询优化
 */
@Service
public class PaginationOptimizer {

    /**
     * 传统分页(小数据量)
     */
    public <T> PageResult<T> normalPage(IPage<T> page) {
        return new PageResult<>(page.getRecords(), page.getTotal());
    }

    /**
     * 游标分页(大数据量,无需总数)
     */
    public <T> CursorResult<T> cursorPage(BaseMapper<T> mapper,
            Wrapper<T> wrapper, Long lastId, int size) {

        List<T> records = mapper.selectList(
            ((LambdaQueryWrapper<T>) wrapper)
                .gt(lastId != null, "id", lastId)
                .last("LIMIT " + size)
        );

        Long nextCursor = null;
        if (CollUtil.isNotEmpty(records) && records.size() == size) {
            // 获取最后一条记录的ID作为下一页游标
            T last = records.get(records.size() - 1);
            nextCursor = ReflectUtil.getFieldValue(last, "id");
        }

        return new CursorResult<>(records, nextCursor);
    }

    /**
     * 延迟关联分页(大数据量,需要总数)
     */
    public <T> PageResult<T> deferredJoinPage(BaseMapper<T> mapper,
            String tableName, Wrapper<T> wrapper, PageQuery pageQuery) {

        // 先查询ID列表
        String idSql = String.format(
            "SELECT id FROM %s %s ORDER BY id LIMIT %d, %d",
            tableName,
            wrapper.getCustomSqlSegment(),
            (pageQuery.getPageNum() - 1) * pageQuery.getPageSize(),
            pageQuery.getPageSize()
        );

        // 再根据ID查询完整数据
        // ...

        return null;
    }
}
```

### 分页查询最佳实践

```java
/**
 * 用户列表查询(分页优化版)
 */
@Override
public PageResult<SysUserVo> selectPageUserList(SysUserQuery query, PageQuery pageQuery) {

    // 构建查询条件
    LambdaQueryWrapper<SysUser> wrapper = Wrappers.<SysUser>lambdaQuery()
        .like(StringUtils.isNotBlank(query.getUserName()), SysUser::getUserName, query.getUserName())
        .like(StringUtils.isNotBlank(query.getNickName()), SysUser::getNickName, query.getNickName())
        .like(StringUtils.isNotBlank(query.getPhone()), SysUser::getPhone, query.getPhone())
        .eq(query.getDeptId() != null, SysUser::getDeptId, query.getDeptId())
        .eq(StringUtils.isNotBlank(query.getStatus()), SysUser::getStatus, query.getStatus())
        .between(query.getBeginTime() != null && query.getEndTime() != null,
            SysUser::getCreateTime, query.getBeginTime(), query.getEndTime())
        .eq(SysUser::getDelFlag, "0")
        .orderByDesc(SysUser::getCreateTime);

    // 大数据量时使用COUNT优化
    if (pageQuery.getPageNum() > 100) {
        // 深度分页时,先查询是否有数据
        Long count = userMapper.selectCount(wrapper);
        if (count == 0) {
            return PageResult.empty();
        }
    }

    // 执行分页查询
    IPage<SysUserVo> page = userMapper.selectVoPage(pageQuery.build(), wrapper);

    return new PageResult<>(page.getRecords(), page.getTotal());
}
```

---

## 读写分离

### 动态数据源配置

```java
/**
 * 动态数据源配置
 */
@Configuration
public class DynamicDataSourceConfig {

    @Bean
    @Primary
    public DataSource dynamicDataSource(
            @Qualifier("masterDataSource") DataSource master,
            @Qualifier("slaveDataSource") DataSource slave) {

        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put(DataSourceType.MASTER, master);
        targetDataSources.put(DataSourceType.SLAVE, slave);

        DynamicRoutingDataSource dataSource = new DynamicRoutingDataSource();
        dataSource.setDefaultTargetDataSource(master);
        dataSource.setTargetDataSources(targetDataSources);

        return dataSource;
    }
}

/**
 * 数据源切换注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataSource {
    DataSourceType value() default DataSourceType.MASTER;
}

/**
 * 数据源切换AOP
 */
@Aspect
@Component
public class DataSourceAspect {

    @Around("@annotation(ds)")
    public Object around(ProceedingJoinPoint point, DataSource ds) throws Throwable {
        DataSourceContextHolder.setDataSourceType(ds.value());
        try {
            return point.proceed();
        } finally {
            DataSourceContextHolder.clearDataSourceType();
        }
    }
}
```

### 读写分离使用

```java
@Service
public class SysUserServiceImpl implements ISysUserService {

    /**
     * 写操作 - 使用主库
     */
    @DataSource(DataSourceType.MASTER)
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int insertUser(SysUserBo user) {
        return userMapper.insert(BeanUtil.toBean(user, SysUser.class));
    }

    /**
     * 读操作 - 使用从库
     */
    @DataSource(DataSourceType.SLAVE)
    @Override
    public SysUserVo selectUserById(Long userId) {
        return userMapper.selectVoById(userId);
    }

    /**
     * 复杂读操作 - 使用从库
     */
    @DataSource(DataSourceType.SLAVE)
    @Override
    public PageResult<SysUserVo> selectPageUserList(SysUserQuery query, PageQuery pageQuery) {
        return userMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(query));
    }
}
```

---

## 慢查询优化

### 慢查询监控

```yaml
# MySQL慢查询配置
# my.cnf
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_queries_not_using_indexes = 1
```

```java
/**
 * P6Spy SQL监控配置
 */
@Configuration
public class P6SpyConfig {

    @Bean
    public P6SpyCustomizer p6SpyCustomizer() {
        return options -> {
            // SQL执行时间阈值(毫秒)
            options.setExecutionThreshold(1000);
            // 日志格式
            options.setLogMessageFormat(CustomLineFormat.class);
        };
    }
}

/**
 * 自定义SQL日志格式
 */
public class CustomLineFormat implements MessageFormattingStrategy {

    @Override
    public String formatMessage(int connectionId, String now, long elapsed,
            String category, String prepared, String sql, String url) {

        if (elapsed > 1000) {
            return String.format("[慢查询] 耗时:%dms SQL:%s", elapsed, sql);
        }
        return String.format("[SQL] 耗时:%dms SQL:%s", elapsed, sql);
    }
}
```

### 慢查询分析

```sql
-- 分析慢查询
EXPLAIN SELECT u.*, d.dept_name
FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
WHERE u.status = '0'
ORDER BY u.create_time DESC
LIMIT 10000, 20;

-- 查看执行计划详情
EXPLAIN FORMAT=JSON SELECT ...;

-- 使用ANALYZE获取真实执行情况
EXPLAIN ANALYZE SELECT ...;

-- 查看表统计信息
ANALYZE TABLE sys_user;
SHOW TABLE STATUS LIKE 'sys_user';
```

---

## 批量操作优化

### 批量插入

```java
/**
 * 批量插入优化
 */
@Service
public class BatchOperationService {

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

    /**
     * 批量插入(MyBatis-Plus方式)
     */
    public void batchInsertByMybatisPlus(List<SysUser> users) {
        // 分批插入,每批500条
        int batchSize = 500;
        for (int i = 0; i < users.size(); i += batchSize) {
            List<SysUser> batch = users.subList(i, Math.min(i + batchSize, users.size()));
            userMapper.insertBatch(batch);
        }
    }

    /**
     * 批量插入(原生JDBC方式,性能最优)
     */
    public void batchInsertByJdbc(List<SysUser> users) {
        String sql = "INSERT INTO sys_user (user_name, nick_name, dept_id, status) VALUES (?, ?, ?, ?)";

        try (SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH)) {
            Connection conn = session.getConnection();
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                int count = 0;
                for (SysUser user : users) {
                    ps.setString(1, user.getUserName());
                    ps.setString(2, user.getNickName());
                    ps.setLong(3, user.getDeptId());
                    ps.setString(4, user.getStatus());
                    ps.addBatch();

                    if (++count % 500 == 0) {
                        ps.executeBatch();
                        ps.clearBatch();
                    }
                }
                ps.executeBatch();
            }
            session.commit();
        } catch (SQLException e) {
            throw new RuntimeException("批量插入失败", e);
        }
    }
}
```

### 批量更新

```java
/**
 * 批量更新优化
 */
public void batchUpdate(List<SysUser> users) {
    // 方案1: CASE WHEN批量更新
    String sql = """
        UPDATE sys_user SET
            nick_name = CASE user_id
                WHEN 1 THEN '昵称1'
                WHEN 2 THEN '昵称2'
            END,
            status = CASE user_id
                WHEN 1 THEN '0'
                WHEN 2 THEN '1'
            END
        WHERE user_id IN (1, 2)
        """;

    // 方案2: 临时表批量更新
    String batchUpdateSql = """
        UPDATE sys_user u
        INNER JOIN temp_update t ON u.user_id = t.user_id
        SET u.nick_name = t.nick_name, u.status = t.status
        """;
}
```

---

## 表结构优化

### 表设计规范

```sql
-- 好的表设计示例
CREATE TABLE sys_user (
    -- 主键使用BIGINT
    user_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',

    -- 字符串字段合理设置长度
    user_name VARCHAR(64) NOT NULL COMMENT '用户名',
    nick_name VARCHAR(64) DEFAULT '' COMMENT '昵称',
    email VARCHAR(128) DEFAULT '' COMMENT '邮箱',
    phone VARCHAR(20) DEFAULT '' COMMENT '手机号',

    -- 状态字段使用CHAR(1)
    status CHAR(1) DEFAULT '0' COMMENT '状态(0正常 1停用)',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志(0存在 2删除)',

    -- 时间字段使用DATETIME
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 大文本单独存储
    remark VARCHAR(500) DEFAULT '' COMMENT '备注',

    PRIMARY KEY (user_id),
    UNIQUE KEY uk_user_name (user_name),
    KEY idx_dept_id (dept_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 垂直拆分

```sql
-- 主表: 存储高频访问字段
CREATE TABLE sys_user (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(64) NOT NULL,
    nick_name VARCHAR(64),
    status CHAR(1) DEFAULT '0',
    PRIMARY KEY (user_id)
);

-- 扩展表: 存储低频访问字段
CREATE TABLE sys_user_ext (
    user_id BIGINT NOT NULL,
    avatar VARCHAR(500),
    profile TEXT,
    preferences JSON,
    PRIMARY KEY (user_id)
);
```

---

## 监控与诊断

### 性能监控指标

```java
/**
 * 数据库性能监控
 */
@Component
@Slf4j
public class DatabaseMetrics {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 获取MySQL状态
     */
    public Map<String, Object> getMysqlStatus() {
        Map<String, Object> status = new HashMap<>();

        // 连接数
        status.put("connections", jdbcTemplate.queryForObject(
            "SHOW STATUS LIKE 'Threads_connected'",
            (rs, rowNum) -> rs.getString("Value")));

        // 慢查询数
        status.put("slowQueries", jdbcTemplate.queryForObject(
            "SHOW STATUS LIKE 'Slow_queries'",
            (rs, rowNum) -> rs.getString("Value")));

        // QPS
        status.put("queries", jdbcTemplate.queryForObject(
            "SHOW STATUS LIKE 'Queries'",
            (rs, rowNum) -> rs.getString("Value")));

        // 缓冲池命中率
        Long reads = jdbcTemplate.queryForObject(
            "SHOW STATUS LIKE 'Innodb_buffer_pool_reads'",
            (rs, rowNum) -> Long.parseLong(rs.getString("Value")));
        Long requests = jdbcTemplate.queryForObject(
            "SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests'",
            (rs, rowNum) -> Long.parseLong(rs.getString("Value")));
        status.put("bufferPoolHitRate",
            String.format("%.2f%%", (1 - (double) reads / requests) * 100));

        return status;
    }

    /**
     * 检查表空间使用情况
     */
    public List<Map<String, Object>> getTableSpaceUsage() {
        return jdbcTemplate.queryForList("""
            SELECT
                table_name,
                ROUND(data_length / 1024 / 1024, 2) AS data_mb,
                ROUND(index_length / 1024 / 1024, 2) AS index_mb,
                table_rows
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            ORDER BY data_length DESC
            LIMIT 20
            """);
    }
}
```

---

## 最佳实践清单

### 索引优化

- [x] 主键使用自增或雪花ID
- [x] 高频查询字段建立索引
- [x] 联合索引遵循最左前缀原则
- [x] 避免冗余索引
- [x] 定期分析索引使用情况

### SQL优化

- [x] 只查询需要的字段
- [x] 避免SELECT *
- [x] 使用EXPLAIN分析执行计划
- [x] 深度分页使用游标分页
- [x] 批量操作分批执行

### 缓存策略

- [x] 热点数据缓存预热
- [x] 合理设置缓存过期时间
- [x] 缓存更新时清理失效数据
- [x] 使用多级缓存

### 连接池

- [x] 合理配置连接池大小
- [x] 开启连接有效性检测
- [x] 监控连接池使用情况
- [x] 设置合理的超时时间

---

## 常见问题

### 1. 查询变慢

**原因分析:**
- 缺少索引
- 索引失效
- 数据量增长
- 锁等待

**解决方案:**
```sql
-- 分析查询
EXPLAIN ANALYZE SELECT ...;

-- 检查索引
SHOW INDEX FROM table_name;

-- 检查锁等待
SHOW ENGINE INNODB STATUS;
SELECT * FROM information_schema.INNODB_LOCKS;
```

### 2. 连接池耗尽

**原因分析:**
- 连接泄露
- 慢查询阻塞
- 并发过高

**解决方案:**
```java
// 检查连接泄露
druid.removeAbandoned = true
druid.removeAbandonedTimeout = 180

// 增加连接池大小
druid.maxActive = 200
```

### 3. 死锁问题

**原因分析:**
- 事务过大
- 锁顺序不一致
- 索引不当

**解决方案:**
```sql
-- 查看死锁日志
SHOW ENGINE INNODB STATUS;

-- 减小事务粒度
-- 统一资源访问顺序
-- 使用乐观锁
```

---

## 总结

数据库性能优化是一个系统工程,需要从多个维度进行:

1. **索引优化** - 合理设计索引,避免全表扫描
2. **SQL优化** - 编写高效SQL,减少不必要的查询
3. **连接池优化** - 合理配置连接池参数
4. **缓存策略** - 使用缓存减轻数据库压力
5. **分页优化** - 深度分页使用游标分页
6. **读写分离** - 分散读写压力
7. **监控诊断** - 持续监控,及时发现问题

建议定期进行:
- 慢查询日志分析
- 索引使用情况评估
- 表空间和数据量监控
- 连接池健康检查
