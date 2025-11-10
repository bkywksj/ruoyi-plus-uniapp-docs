# 缓存策略

> **文档状态**: ✅ 已完成
>
> **作者**: 抓蛙师
>
> **最后更新**: 2025-11-10

缓存是提升系统性能的重要手段。RuoYi-Plus-UniApp项目采用Redis作为缓存中间件，基于Redisson客户端实现了完善的缓存策略，包括多级缓存、缓存预热、缓存更新、缓存穿透/击穿/雪崩防护等。本文档详细介绍项目中的缓存使用策略和最佳实践。

## 缓存概述

### 缓存架构

RuoYi-Plus-UniApp采用**Redis + Caffeine**的二级缓存架构:

```
┌──────────────────────────────────────────────────┐
│                  应用层                            │
├──────────────────────────────────────────────────┤
│  ┌────────────────┐      ┌──────────────────┐   │
│  │  Spring Cache  │  or  │  RedisUtils      │   │
│  │  注解式缓存     │      │  编程式缓存       │   │
│  └────────┬───────┘      └────────┬─────────┘   │
│           │                       │             │
│           ▼                       ▼             │
│  ┌────────────────────────────────────────┐    │
│  │      CacheManager (缓存管理器)          │    │
│  └────────┬───────────────────────────────┘    │
│           │                                     │
│    ┌──────┴──────┐                             │
│    ▼             ▼                             │
│  ┌───────┐   ┌────────┐                        │
│  │L1缓存 │   │L2缓存  │                         │
│  │Caffeine│  │ Redis  │                        │
│  │本地缓存│  │远程缓存 │                         │
│  └───────┘   └────────┘                        │
└──────────────────────────────────────────────────┘
```

**缓存层级:**

1. **L1 - 本地缓存 (Caffeine)**
   - 进程内缓存
   - 访问速度极快
   - 容量有限
   - 适合热点数据

2. **L2 - 远程缓存 (Redis)**
   - 分布式缓存
   - 容量大
   - 多实例共享
   - 支持持久化

### 核心技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| **Redis** | 7.x | 远程缓存服务器 |
| **Redisson** | 3.51.0 | Redis Java客户端 |
| **Caffeine** | 3.x | 本地缓存库 |
| **Spring Cache** | 3.x | 缓存抽象层 |

参考: ruoyi-plus-uniapp/pom.xml:264-269

### 缓存应用场景

RuoYi-Plus-UniApp在以下场景使用缓存:

**1. 用户会话缓存**
- 用户登录信息
- 用户权限数据
- 用户菜单路由

**2. 字典数据缓存**
- 系统字典
- 配置参数
- 常量数据

**3. 业务数据缓存**
- 热点商品
- 文章详情
- 统计数据

**4. 分布式场景**
- 分布式锁
- 分布式session
- 限流控制

---

## Redis配置

### Maven依赖

```xml
<!-- Redisson客户端 -->
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.51.0</version>
</dependency>

<!-- Spring Data Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- Caffeine本地缓存 -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

参考: ruoyi-common/ruoyi-common-redis/pom.xml

### application.yml配置

```yaml
# Redis配置
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      database: ${REDIS_DATABASE:0}
      timeout: 10s
      lettuce:
        pool:
          # 连接池最大连接数
          max-active: 200
          # 连接池最大阻塞等待时间
          max-wait: -1ms
          # 连接池中的最大空闲连接
          max-idle: 10
          # 连接池中的最小空闲连接
          min-idle: 0

# Redisson配置
redisson:
  # 线程池数量
  threads: 16
  # Netty线程池数量
  netty-threads: 32
  # 单机配置
  single-server-config:
    # 连接空闲超时时间
    idle-connection-timeout: 10000
    # 连接超时时间
    connect-timeout: 10000
    # 命令等待超时时间
    timeout: 3000
    # 命令失败重试次数
    retry-attempts: 3
    # 命令重试发送时间间隔
    retry-interval: 1500
    # 单个连接最大订阅数量
    subscriptions-per-connection: 5
    # 连接池大小
    connection-pool-size: 64
    # 最小空闲连接数
    connection-minimum-idle-size: 32
```

参考: ruoyi-admin/src/main/resources/application.yml

### Redis自动配置类

```java
package plus.ruoyi.common.redis.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.redisson.spring.starter.RedissonAutoConfigurationCustomizer;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import plus.ruoyi.common.redis.config.properties.RedissonProperties;
import plus.ruoyi.common.redis.handler.KeyPrefixHandler;
import plus.ruoyi.common.redis.manager.PlusSpringCacheManager;

/**
 * Redis配置类
 *
 * @author Lion Li
 */
@AutoConfiguration
@EnableCaching
public class RedisAutoConfiguration {

    /**
     * 自定义Redisson配置
     * 增加JSON序列化支持
     */
    @Bean
    public RedissonAutoConfigurationCustomizer redissonCustomizer(RedissonProperties redissonProperties) {
        return config -> {
            ObjectMapper objectMapper = new ObjectMapper();
            // 支持Java 8时间API
            objectMapper.registerModule(new JavaTimeModule());

            // 自定义序列化编解码器
            config.setCodec(new JsonJacksonCodec(objectMapper));

            // 设置key前缀(支持多租户)
            config.setNameMapper(new KeyPrefixHandler(redissonProperties.getKeyPrefix()));
        };
    }

    /**
     * 缓存管理器
     * 整合Caffeine本地缓存 + Redis远程缓存
     */
    @Bean
    public CacheManager cacheManager() {
        return new PlusSpringCacheManager();
    }
}
```

参考: ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/config/RedisAutoConfiguration.java:1-65

---

## 缓存工具类

### RedisUtils工具类

RuoYi-Plus提供了`RedisUtils`工具类，封装了常用的Redis操作:

```java
package plus.ruoyi.common.redis.utils;

import org.redisson.api.*;
import java.time.Duration;
import java.util.Collection;

/**
 * Redis工具类
 * 基于Redisson实现
 *
 * @author Lion Li
 */
public class RedisUtils {

    private static final RedissonClient CLIENT = SpringUtils.getBean(RedissonClient.class);

    // ==================== 基础缓存操作 ====================

    /**
     * 缓存基本对象
     *
     * @param key   缓存的键值
     * @param value 缓存的值
     */
    public static <T> void setCacheObject(final String key, final T value) {
        RBucket<T> bucket = CLIENT.getBucket(key);
        bucket.set(value);
    }

    /**
     * 缓存基本对象并设置过期时间
     *
     * @param key      缓存的键值
     * @param value    缓存的值
     * @param duration 过期时间
     */
    public static <T> void setCacheObject(final String key, final T value, final Duration duration) {
        RBucket<T> bucket = CLIENT.getBucket(key);
        bucket.set(value, duration);
    }

    /**
     * 获取缓存的基本对象
     *
     * @param key 缓存键值
     * @return 缓存键值对应的数据
     */
    public static <T> T getCacheObject(final String key) {
        RBucket<T> rBucket = CLIENT.getBucket(key);
        return rBucket.get();
    }

    /**
     * 删除单个缓存对象
     *
     * @param key 缓存的键值
     */
    public static boolean deleteObject(final String key) {
        return CLIENT.getBucket(key).delete();
    }

    /**
     * 检查缓存对象是否存在
     *
     * @param key 缓存的键值
     */
    public static boolean isExistsObject(final String key) {
        return CLIENT.getBucket(key).isExists();
    }

    /**
     * 设置key的过期时间
     *
     * @param key      Redis键
     * @param duration 超时时间
     */
    public static boolean expire(final String key, final Duration duration) {
        RBucket rBucket = CLIENT.getBucket(key);
        return rBucket.expire(duration);
    }

    // ==================== List操作 ====================

    /**
     * 缓存List数据
     */
    public static <T> boolean setCacheList(final String key, final List<T> dataList) {
        RList<T> rList = CLIENT.getList(key);
        return rList.addAll(dataList);
    }

    /**
     * 获取缓存的List数据
     */
    public static <T> List<T> getCacheList(final String key) {
        RList<T> rList = CLIENT.getList(key);
        return rList.readAll();
    }

    // ==================== Set操作 ====================

    /**
     * 缓存Set数据
     */
    public static <T> boolean setCacheSet(final String key, final Set<T> dataSet) {
        RSet<T> rSet = CLIENT.getSet(key);
        return rSet.addAll(dataSet);
    }

    /**
     * 获取缓存的Set数据
     */
    public static <T> Set<T> getCacheSet(final String key) {
        RSet<T> rSet = CLIENT.getSet(key);
        return rSet.readAll();
    }

    // ==================== Map操作 ====================

    /**
     * 缓存Map数据
     */
    public static <T> void setCacheMap(final String key, final Map<String, T> dataMap) {
        if (dataMap != null) {
            RMap<String, T> rMap = CLIENT.getMap(key);
            rMap.putAll(dataMap);
        }
    }

    /**
     * 获取缓存的Map数据
     */
    public static <T> Map<String, T> getCacheMap(final String key) {
        RMap<String, T> rMap = CLIENT.getMap(key);
        return rMap.getAll(rMap.keySet());
    }

    /**
     * 设置Map中的单个值
     */
    public static <T> void setCacheMapValue(final String key, final String hKey, final T value) {
        RMap<String, T> rMap = CLIENT.getMap(key);
        rMap.put(hKey, value);
    }

    /**
     * 获取Map中的单个值
     */
    public static <T> T getCacheMapValue(final String key, final String hKey) {
        RMap<String, T> rMap = CLIENT.getMap(key);
        return rMap.get(hKey);
    }

    // ==================== 原子操作 ====================

    /**
     * 原子递增操作
     *
     * @param key Redis键
     * @return 递增后的值
     */
    public static long incrAtomicValue(String key) {
        RAtomicLong atomic = CLIENT.getAtomicLong(key);
        return atomic.incrementAndGet();
    }

    /**
     * 原子递减操作
     *
     * @param key Redis键
     * @return 递减后的值
     */
    public static long decrAtomicValue(String key) {
        RAtomicLong atomic = CLIENT.getAtomicLong(key);
        return atomic.decrementAndGet();
    }

    // ==================== 限流控制 ====================

    /**
     * 限流控制
     *
     * @param key          限流key
     * @param rateType     限流类型
     * @param rate         允许的速率
     * @param rateInterval 速率间隔(秒)
     * @return 剩余令牌数，-1表示获取失败
     */
    public static long rateLimiter(String key, RateType rateType, int rate, int rateInterval) {
        RRateLimiter rateLimiter = CLIENT.getRateLimiter(key);
        rateLimiter.trySetRate(rateType, rate, Duration.ofSeconds(rateInterval));
        if (rateLimiter.tryAcquire()) {
            return rateLimiter.availablePermits();
        } else {
            return -1L;
        }
    }

    /**
     * 获取锁
     */
    public static RLock getLock(String key) {
        return CLIENT.getLock(key);
    }
}
```

参考: ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/utils/RedisUtils.java:1-627

### CacheUtils工具类

```java
package plus.ruoyi.common.redis.utils;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

/**
 * Spring Cache工具类
 *
 * @author Lion Li
 */
public class CacheUtils {

    private static final CacheManager CACHE_MANAGER = SpringUtils.getBean(CacheManager.class);

    /**
     * 获取缓存值
     *
     * @param cacheNames 缓存名称
     * @param key        缓存键
     */
    public static <T> T get(String cacheNames, Object key) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            Cache.ValueWrapper wrapper = cache.get(key);
            if (wrapper != null) {
                return (T) wrapper.get();
            }
        }
        return null;
    }

    /**
     * 设置缓存值
     *
     * @param cacheNames 缓存名称
     * @param key        缓存键
     * @param value      缓存值
     */
    public static void put(String cacheNames, Object key, Object value) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            cache.put(key, value);
        }
    }

    /**
     * 删除缓存
     *
     * @param cacheNames 缓存名称
     * @param key        缓存键
     */
    public static void evict(String cacheNames, Object key) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            cache.evict(key);
        }
    }

    /**
     * 清空缓存
     *
     * @param cacheNames 缓存名称
     */
    public static void clear(String cacheNames) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            cache.clear();
        }
    }
}
```

参考: ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/utils/CacheUtils.java:1-98

---

## 缓存使用场景

### 1. 用户会话缓存

#### Sa-Token集成Redis

项目使用Sa-Token + Redis存储用户会话信息:

```java
/**
 * Sa-Token配置类
 */
@Configuration
public class SaTokenConfig {

    /**
     * Sa-Token整合Redis (使用Redisson客户端)
     */
    @Bean
    public SaTokenDao saTokenDao(RedissonClient redissonClient) {
        return new SaTokenDaoRedisson(redissonClient);
    }
}
```

**会话数据结构:**

```
# 用户Token信息
satoken:login:token:{tokenValue}
  ├── userId: 用户ID
  ├── userName: 用户名
  ├── tenantId: 租户ID
  ├── loginTime: 登录时间
  └── expireTime: 过期时间

# 用户权限信息
satoken:login:user:{userId}
  ├── permissions: 权限列表
  ├── roles: 角色列表
  └── menuIds: 菜单ID列表
```

参考: ruoyi-common/ruoyi-common-satoken/src/main/java/plus/ruoyi/common/satoken/config/SaTokenConfig.java

#### 获取当前用户信息

```java
/**
 * 登录助手工具类
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class LoginHelper {

    /**
     * 获取用户ID
     */
    public static Long getUserId() {
        return getLoginUser().getUserId();
    }

    /**
     * 获取租户ID
     */
    public static String getTenantId() {
        return getLoginUser().getTenantId();
    }

    /**
     * 获取用户账号
     */
    public static String getUsername() {
        return getLoginUser().getUsername();
    }

    /**
     * 获取登录用户信息
     * 从Redis中获取,性能高效
     */
    public static LoginUser getLoginUser() {
        LoginUser loginUser = (LoginUser) StpUtil.getTokenSession().get(LOGIN_USER_KEY);
        if (ObjectUtil.isNull(loginUser)) {
            throw new NotLoginException("登录状态已过期");
        }
        return loginUser;
    }
}
```

参考: ruoyi-common/ruoyi-common-satoken/src/main/java/plus/ruoyi/common/satoken/utils/LoginHelper.java:1-203

### 2. 字典数据缓存

#### 字典缓存策略

字典数据是典型的"读多写少"场景,适合缓存:

```java
/**
 * 字典服务实现类
 */
@RequiredArgsConstructor
@Service
public class SysDictTypeServiceImpl implements ISysDictTypeService {

    private final SysDictTypeMapper baseMapper;
    private final SysDictDataMapper dictDataMapper;

    /**
     * 根据字典类型查询字典数据
     * 使用Spring Cache注解
     */
    @Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
    @Override
    public List<SysDictData> selectDictDataByType(String dictType) {
        List<SysDictData> dictDatas = dictDataMapper.selectDictDataByType(dictType);
        if (CollUtil.isNotEmpty(dictDatas)) {
            return dictDatas;
        }
        return null;
    }

    /**
     * 新增字典类型
     * 无需清理缓存(字典数据是懒加载)
     */
    @Override
    public int insertDictType(SysDictType dictType) {
        int row = baseMapper.insert(dictType);
        if (row > 0) {
            // 发布字典刷新事件(可选)
            SpringUtils.context().publishEvent(new DictRefreshEvent(this));
        }
        return row;
    }

    /**
     * 修改字典类型
     * 清除相关缓存
     */
    @CacheEvict(cacheNames = CacheNames.SYS_DICT, key = "#dictType.dictType")
    @Override
    public int updateDictType(SysDictType dictType) {
        int row = baseMapper.updateById(dictType);
        if (row > 0) {
            // 发布字典刷新事件
            SpringUtils.context().publishEvent(new DictRefreshEvent(this));
        }
        return row;
    }

    /**
     * 删除字典类型
     * 清除相关缓存
     */
    @Override
    public void deleteDictTypeByIds(Long[] dictIds) {
        for (Long dictId : dictIds) {
            SysDictType dictType = baseMapper.selectById(dictId);
            if (ObjectUtil.isNotNull(dictType)) {
                // 清除字典缓存
                CacheUtils.evict(CacheNames.SYS_DICT, dictType.getDictType());
            }
        }
        baseMapper.deleteBatchIds(Arrays.asList(dictIds));
    }

    /**
     * 清空字典缓存
     */
    @Override
    public void clearDictCache() {
        CacheUtils.clear(CacheNames.SYS_DICT);
    }

    /**
     * 重置字典缓存
     */
    @Override
    public void resetDictCache() {
        clearDictCache();
        // 重新加载所有字典到缓存
        List<SysDictType> dictTypes = baseMapper.selectList(null);
        for (SysDictType dictType : dictTypes) {
            List<SysDictData> dictDatas = dictDataMapper.selectDictDataByType(dictType.getDictType());
            if (CollUtil.isNotEmpty(dictDatas)) {
                CacheUtils.put(CacheNames.SYS_DICT, dictType.getDictType(), dictDatas);
            }
        }
    }
}
```

**字典缓存Key设计:**

```
# 字典数据缓存
sys_dict:{dictType}  -> List<SysDictData>

# 示例
sys_dict:sys_user_sex -> [{dictCode:1, dictLabel:"男"}, {dictCode:2, dictLabel:"女"}]
sys_dict:sys_normal_disable -> [{dictCode:0, dictLabel:"正常"}, {dictCode:1, dictLabel:"停用"}]
```

参考: ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/service/impl/SysDictTypeServiceImpl.java

### 3. 配置参数缓存

```java
/**
 * 参数配置服务实现类
 */
@RequiredArgsConstructor
@Service
public class SysConfigServiceImpl implements ISysConfigService {

    private final SysConfigMapper baseMapper;

    /**
     * 根据键名查询参数配置值
     * 使用Spring Cache注解缓存
     */
    @Cacheable(cacheNames = CacheNames.SYS_CONFIG, key = "#configKey")
    @Override
    public String selectConfigByKey(String configKey) {
        SysConfig config = baseMapper.selectOne(
            new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, configKey)
        );
        return ObjectUtil.isNotNull(config) ? config.getConfigValue() : StringUtils.EMPTY;
    }

    /**
     * 新增参数配置
     */
    @CachePut(cacheNames = CacheNames.SYS_CONFIG, key = "#config.configKey")
    @Override
    public int insertConfig(SysConfig config) {
        int row = baseMapper.insert(config);
        if (row > 0) {
            // 发布配置刷新事件
            SpringUtils.context().publishEvent(new ConfigRefreshEvent(this));
        }
        return row;
    }

    /**
     * 修改参数配置
     * 更新缓存
     */
    @CachePut(cacheNames = CacheNames.SYS_CONFIG, key = "#config.configKey")
    @Override
    public int updateConfig(SysConfig config) {
        int row = baseMapper.updateById(config);
        if (row > 0) {
            // 发布配置刷新事件
            SpringUtils.context().publishEvent(new ConfigRefreshEvent(this));
        }
        return row;
    }

    /**
     * 删除参数配置
     * 清除缓存
     */
    @Override
    public void deleteConfigByIds(Long[] configIds) {
        for (Long configId : configIds) {
            SysConfig config = baseMapper.selectById(configId);
            if (ObjectUtil.isNotNull(config)) {
                // 清除缓存
                CacheUtils.evict(CacheNames.SYS_CONFIG, config.getConfigKey());
            }
        }
        baseMapper.deleteBatchIds(Arrays.asList(configIds));
    }

    /**
     * 清空参数缓存
     */
    @Override
    public void clearConfigCache() {
        CacheUtils.clear(CacheNames.SYS_CONFIG);
    }
}
```

**配置缓存Key设计:**

```
# 配置参数缓存
sys_config:{configKey} -> {configValue}

# 示例
sys_config:sys.user.initPassword -> "123456"
sys_config:sys.account.captchaEnabled -> "true"
```

### 4. OSS文件缓存

```java
/**
 * OSS服务实现类
 */
@RequiredArgsConstructor
@Service
public class SysOssServiceImpl implements ISysOssService {

    /**
     * 查询OSS对象
     * 缓存文件URL(30分钟)
     */
    @Cacheable(cacheNames = CacheNames.SYS_OSS, key = "#ossId",
               unless = "#result == null")
    @Override
    public SysOss selectById(Long ossId) {
        return baseMapper.selectVoById(ossId);
    }

    /**
     * 上传文件
     * 缓存文件信息
     */
    @CachePut(cacheNames = CacheNames.SYS_OSS, key = "#result.ossId",
              unless = "#result == null")
    @Override
    public SysOss upload(MultipartFile file) {
        // 上传文件到OSS
        String url = ossClient.upload(file);

        // 保存文件记录
        SysOss oss = new SysOss();
        oss.setUrl(url);
        oss.setOriginalName(file.getOriginalFilename());
        oss.setFileSize(file.getSize());
        baseMapper.insert(oss);

        return oss;
    }

    /**
     * 删除OSS对象
     * 清除缓存
     */
    @CacheEvict(cacheNames = CacheNames.SYS_OSS, key = "#ossId")
    @Override
    public Boolean deleteByIds(Collection<Long> ids) {
        for (Long id : ids) {
            SysOss oss = baseMapper.selectById(id);
            if (ObjectUtil.isNotNull(oss)) {
                // 删除OSS文件
                ossClient.delete(oss.getUrl());
            }
        }
        return baseMapper.deleteBatchIds(ids) > 0;
    }
}
```

---

## 缓存更新策略

### 常见更新策略

#### 1. Cache Aside Pattern (旁路缓存模式)

**项目默认策略,读写分离:**

```java
/**
 * Cache Aside Pattern
 * 读: 先读缓存,未命中再读数据库,然后写入缓存
 * 写: 先更新数据库,然后删除缓存
 */
@Service
public class UserService {

    /**
     * 查询用户 - 旁路缓存读
     */
    public User getUser(Long userId) {
        // 1. 查询缓存
        String cacheKey = "user:" + userId;
        User user = RedisUtils.getCacheObject(cacheKey);

        // 2. 缓存命中,直接返回
        if (user != null) {
            return user;
        }

        // 3. 缓存未命中,查询数据库
        user = userMapper.selectById(userId);

        // 4. 写入缓存(设置30分钟过期)
        if (user != null) {
            RedisUtils.setCacheObject(cacheKey, user, Duration.ofMinutes(30));
        }

        return user;
    }

    /**
     * 更新用户 - 旁路缓存写
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(User user) {
        // 1. 先更新数据库
        userMapper.updateById(user);

        // 2. 删除缓存
        String cacheKey = "user:" + user.getUserId();
        RedisUtils.deleteObject(cacheKey);

        // 下次查询时会重新加载到缓存
    }
}
```

**优点:**
- ✅ 实现简单
- ✅ 缓存与数据库一致性好
- ✅ 适合读多写少场景

**缺点:**
- ❌ 首次查询会穿透到数据库
- ❌ 缓存失效瞬间并发压力大

#### 2. Read/Write Through Pattern (读写穿透模式)

使用Spring Cache注解实现:

```java
/**
 * Read/Write Through Pattern
 * 读写操作都经过缓存层
 */
@Service
public class DictService {

    /**
     * 查询字典 - 自动缓存
     */
    @Cacheable(cacheNames = "sys_dict", key = "#dictType")
    public List<DictData> getDictData(String dictType) {
        // Spring Cache自动管理缓存
        // 缓存命中: 直接返回
        // 缓存未命中: 执行方法,然后缓存结果
        return dictDataMapper.selectByType(dictType);
    }

    /**
     * 更新字典 - 自动更新缓存
     */
    @CachePut(cacheNames = "sys_dict", key = "#dictData.dictType")
    public DictData updateDictData(DictData dictData) {
        // 更新数据库
        dictDataMapper.updateById(dictData);
        // Spring Cache自动更新缓存
        return dictData;
    }

    /**
     * 删除字典 - 自动清除缓存
     */
    @CacheEvict(cacheNames = "sys_dict", key = "#dictType")
    public void deleteDictData(String dictType) {
        // 删除数据库
        dictDataMapper.deleteByType(dictType);
        // Spring Cache自动清除缓存
    }
}
```

**优点:**
- ✅ 业务代码与缓存解耦
- ✅ 声明式缓存,代码简洁
- ✅ AOP自动管理缓存

**缺点:**
- ❌ 灵活性较差
- ❌ 复杂场景支持有限

#### 3. Write Behind Pattern (异步写模式)

适合写密集场景:

```java
/**
 * Write Behind Pattern
 * 先写缓存,异步批量写数据库
 */
@Service
public class StatisticsService {

    private final ExecutorService executor = Executors.newFixedThreadPool(10);

    /**
     * 增加访问统计
     * 先更新Redis计数器,异步批量写入MySQL
     */
    public void incrementPageView(Long articleId) {
        // 1. 立即更新Redis计数器
        String cacheKey = "article:pv:" + articleId;
        RedisUtils.incrAtomicValue(cacheKey);

        // 2. 异步批量更新数据库(每100次或每5分钟)
        executor.submit(() -> {
            // 批量更新逻辑
            flushPageViewToDatabase();
        });
    }

    /**
     * 批量刷新到数据库
     */
    @Scheduled(fixedRate = 300000) // 每5分钟执行一次
    public void flushPageViewToDatabase() {
        // 获取所有文章的浏览量
        Collection<String> keys = RedisUtils.keys("article:pv:*");

        for (String key : keys) {
            Long articleId = Long.parseLong(key.replace("article:pv:", ""));
            Long pvCount = RedisUtils.getAtomicValue(key);

            // 批量更新数据库
            articleMapper.updatePageView(articleId, pvCount);

            // 重置计数器
            RedisUtils.deleteObject(key);
        }
    }
}
```

**优点:**
- ✅ 写入性能极高
- ✅ 减少数据库写压力
- ✅ 适合高并发写场景

**缺点:**
- ❌ 数据可能丢失(Redis宕机)
- ❌ 一致性较弱
- ❌ 实现复杂

### 缓存更新最佳实践

#### 1. 更新数据库后删除缓存

```java
// ✅ 推荐: 先更新数据库,再删除缓存
@Transactional(rollbackFor = Exception.class)
public void updateUser(User user) {
    // 1. 更新数据库
    userMapper.updateById(user);

    // 2. 删除缓存
    RedisUtils.deleteObject("user:" + user.getUserId());
}

// ❌ 不推荐: 先删除缓存,再更新数据库(可能导致脏数据)
@Transactional(rollbackFor = Exception.class)
public void updateUser(User user) {
    // 如果先删缓存,更新数据库失败,缓存也没了
    RedisUtils.deleteObject("user:" + user.getUserId());
    userMapper.updateById(user);
}
```

#### 2. 延迟双删策略

解决并发场景下的缓存不一致问题:

```java
/**
 * 延迟双删策略
 * 适用于读写并发场景
 */
@Transactional(rollbackFor = Exception.class)
public void updateUser(User user) {
    String cacheKey = "user:" + user.getUserId();

    // 1. 第一次删除缓存
    RedisUtils.deleteObject(cacheKey);

    // 2. 更新数据库
    userMapper.updateById(user);

    // 3. 延迟后再次删除缓存(500ms)
    CompletableFuture.runAsync(() -> {
        try {
            Thread.sleep(500);
            RedisUtils.deleteObject(cacheKey);
        } catch (InterruptedException e) {
            log.error("延迟删除缓存失败", e);
        }
    });
}
```

#### 3. 设置合理的过期时间

```java
// ✅ 不同数据设置不同过期时间
RedisUtils.setCacheObject("user:" + userId, user, Duration.ofMinutes(30)); // 用户信息: 30分钟
RedisUtils.setCacheObject("hot:article:" + id, article, Duration.ofHours(2)); // 热点文章: 2小时
RedisUtils.setCacheObject("dict:" + type, dictList, Duration.ofDays(1)); // 字典数据: 1天
RedisUtils.setCacheObject("config:" + key, value, Duration.ofHours(12)); // 配置参数: 12小时
```

---

## 多级缓存

### Caffeine + Redis二级缓存

#### PlusSpringCacheManager实现

```java
package plus.ruoyi.common.redis.manager;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Spring Cache管理器
 * 整合Caffeine(L1) + Redis(L2)实现二级缓存
 *
 * @author Lion Li
 */
public class PlusSpringCacheManager implements CacheManager {

    /**
     * 缓存容器
     * cacheNames -> Cache实例
     */
    private final ConcurrentMap<String, Cache> cacheMap = new ConcurrentHashMap<>();

    /**
     * Caffeine缓存配置
     */
    private static final int DEFAULT_MAX_SIZE = 1000; // 最大缓存数量
    private static final Duration DEFAULT_EXPIRE = Duration.ofMinutes(10); // 默认过期时间

    @Override
    public org.springframework.cache.Cache getCache(String name) {
        // 获取或创建缓存
        Cache caffeineCache = cacheMap.computeIfAbsent(name, key -> {
            return Caffeine.newBuilder()
                .maximumSize(DEFAULT_MAX_SIZE)
                .expireAfterWrite(DEFAULT_EXPIRE)
                .recordStats() // 记录统计信息
                .build();
        });

        // 装饰为Spring Cache
        return new CaffeineCacheDecorator(name, caffeineCache);
    }

    @Override
    public Collection<String> getCacheNames() {
        return cacheMap.keySet();
    }
}
```

参考: ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/manager/PlusSpringCacheManager.java

#### 二级缓存流程

```
┌──────────────────┐
│  请求查询数据      │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────┐
│  1. 查询L1缓存(Caffeine)    │
└────────┬───────────────────┘
         │
    命中? ├─是─> 返回数据
         │
        否│
         ▼
┌────────────────────────────┐
│  2. 查询L2缓存(Redis)       │
└────────┬───────────────────┘
         │
    命中? ├─是─> 写入L1缓存 -> 返回数据
         │
        否│
         ▼
┌────────────────────────────┐
│  3. 查询数据库              │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  4. 写入L2缓存(Redis)       │
│  5. 写入L1缓存(Caffeine)    │
└────────┬───────────────────┘
         │
         ▼
    返回数据
```

### 使用示例

```java
/**
 * 使用二级缓存
 */
@Service
public class UserService {

    /**
     * 查询用户 - 自动使用二级缓存
     * L1: Caffeine本地缓存
     * L2: Redis远程缓存
     */
    @Cacheable(cacheNames = "user", key = "#userId")
    public User getUser(Long userId) {
        // 方法只有在两级缓存都未命中时才会执行
        return userMapper.selectById(userId);
    }

    /**
     * 更新用户 - 自动清除两级缓存
     */
    @CacheEvict(cacheNames = "user", key = "#user.userId")
    public void updateUser(User user) {
        userMapper.updateById(user);
    }
}
```

### 二级缓存优势

**L1本地缓存(Caffeine):**
- ✅ 访问速度极快(纳秒级)
- ✅ 减少网络开销
- ✅ 适合热点数据
- ❌ 容量有限
- ❌ 无法跨实例共享

**L2远程缓存(Redis):**
- ✅ 容量大
- ✅ 多实例共享
- ✅ 持久化
- ❌ 访问速度较慢(毫秒级)
- ❌ 有网络开销

**组合优势:**
- ✅ 兼顾性能和容量
- ✅ 热点数据极速访问
- ✅ 冷数据也有缓存
- ✅ 降低Redis压力

---

## 缓存问题与解决方案

### 1. 缓存穿透

#### 问题描述

查询一个不存在的数据,缓存和数据库都没有,每次请求都会打到数据库。

**攻击场景:**
```
请求查询userId=999999 (不存在的用户)
  ↓
Redis缓存未命中
  ↓
查询MySQL数据库 (频繁查询)
  ↓
返回null
```

#### 解决方案1: 缓存空值

```java
/**
 * 缓存空值防止穿透
 */
public User getUser(Long userId) {
    String cacheKey = "user:" + userId;

    // 1. 查询缓存
    User user = RedisUtils.getCacheObject(cacheKey);

    // 2. 缓存命中(包括空值)
    if (user != null) {
        // 空值对象,返回null
        return user.getUserId() == null ? null : user;
    }

    // 3. 查询数据库
    user = userMapper.selectById(userId);

    // 4. 缓存结果(即使为null也缓存)
    if (user != null) {
        // 正常数据,缓存30分钟
        RedisUtils.setCacheObject(cacheKey, user, Duration.ofMinutes(30));
    } else {
        // 空值,缓存5分钟(较短时间)
        RedisUtils.setCacheObject(cacheKey, new User(), Duration.ofMinutes(5));
    }

    return user;
}
```

#### 解决方案2: 布隆过滤器

```java
/**
 * 布隆过滤器防止穿透
 */
@Component
public class UserBloomFilter {

    private static final int EXPECTED_INSERTIONS = 1000000; // 预计元素数量
    private static final double FPP = 0.01; // 误判率

    private final RBloomFilter<Long> bloomFilter;

    public UserBloomFilter(RedissonClient redissonClient) {
        // 初始化布隆过滤器
        this.bloomFilter = redissonClient.getBloomFilter("user:bloom");
        bloomFilter.tryInit(EXPECTED_INSERTIONS, FPP);
    }

    /**
     * 添加用户ID到布隆过滤器
     */
    public void add(Long userId) {
        bloomFilter.add(userId);
    }

    /**
     * 判断用户ID是否可能存在
     */
    public boolean mightContain(Long userId) {
        return bloomFilter.contains(userId);
    }

    /**
     * 初始化布隆过滤器(加载所有用户ID)
     */
    @PostConstruct
    public void init() {
        List<Long> userIds = userMapper.selectAllUserIds();
        for (Long userId : userIds) {
            bloomFilter.add(userId);
        }
        log.info("布隆过滤器初始化完成,共加载{}个用户ID", userIds.size());
    }
}

/**
 * 使用布隆过滤器
 */
@Service
public class UserService {

    @Autowired
    private UserBloomFilter userBloomFilter;

    public User getUser(Long userId) {
        // 1. 先判断布隆过滤器
        if (!userBloomFilter.mightContain(userId)) {
            // 布隆过滤器判定不存在,直接返回null
            return null;
        }

        // 2. 布隆过滤器判定可能存在,继续查询
        String cacheKey = "user:" + userId;
        User user = RedisUtils.getCacheObject(cacheKey);
        if (user != null) {
            return user;
        }

        // 3. 查询数据库
        user = userMapper.selectById(userId);
        if (user != null) {
            RedisUtils.setCacheObject(cacheKey, user, Duration.ofMinutes(30));
        }

        return user;
    }
}
```

### 2. 缓存击穿

#### 问题描述

热点数据过期瞬间,大量并发请求同时打到数据库。

**场景:**
```
热点商品缓存过期
  ↓
1000个并发请求同时查询
  ↓
Redis缓存未命中
  ↓
1000个请求同时查询MySQL (数据库压力激增)
```

#### 解决方案1: 互斥锁

```java
/**
 * 使用互斥锁防止缓存击穿
 */
public Product getProduct(Long productId) {
    String cacheKey = "product:" + productId;

    // 1. 查询缓存
    Product product = RedisUtils.getCacheObject(cacheKey);
    if (product != null) {
        return product;
    }

    // 2. 缓存未命中,使用分布式锁
    String lockKey = "lock:product:" + productId;
    RLock lock = RedisUtils.getLock(lockKey);

    try {
        // 尝试获取锁(最多等待10秒,锁30秒自动释放)
        if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
            // 获取锁成功

            // 3. 双重检查缓存(DCL)
            product = RedisUtils.getCacheObject(cacheKey);
            if (product != null) {
                return product;
            }

            // 4. 查询数据库
            product = productMapper.selectById(productId);

            // 5. 写入缓存
            if (product != null) {
                RedisUtils.setCacheObject(cacheKey, product, Duration.ofMinutes(30));
            }

            return product;
        } else {
            // 获取锁失败,稍后重试
            Thread.sleep(50);
            return getProduct(productId);
        }
    } catch (InterruptedException e) {
        log.error("获取锁失败", e);
        return null;
    } finally {
        // 释放锁
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
```

#### 解决方案2: 永不过期

```java
/**
 * 逻辑过期防止击穿
 * 缓存永不过期,通过逻辑字段判断是否需要更新
 */
public class CacheData<T> {
    private T data;           // 实际数据
    private Long expireTime;  // 逻辑过期时间
}

public Product getProduct(Long productId) {
    String cacheKey = "product:" + productId;

    // 1. 查询缓存(永不过期)
    CacheData<Product> cacheData = RedisUtils.getCacheObject(cacheKey);

    // 2. 缓存未命中,查询数据库
    if (cacheData == null) {
        Product product = productMapper.selectById(productId);
        cacheData = new CacheData<>();
        cacheData.setData(product);
        cacheData.setExpireTime(System.currentTimeMillis() + 30 * 60 * 1000); // 30分钟后过期
        RedisUtils.setCacheObject(cacheKey, cacheData); // 不设置Redis过期时间
        return product;
    }

    // 3. 判断逻辑过期时间
    if (cacheData.getExpireTime() < System.currentTimeMillis()) {
        // 逻辑已过期,异步更新缓存
        CompletableFuture.runAsync(() -> {
            String lockKey = "lock:product:" + productId;
            RLock lock = RedisUtils.getLock(lockKey);
            try {
                if (lock.tryLock(0, 30, TimeUnit.SECONDS)) {
                    // 重新查询数据库
                    Product product = productMapper.selectById(productId);
                    CacheData<Product> newCacheData = new CacheData<>();
                    newCacheData.setData(product);
                    newCacheData.setExpireTime(System.currentTimeMillis() + 30 * 60 * 1000);
                    RedisUtils.setCacheObject(cacheKey, newCacheData);
                }
            } catch (InterruptedException e) {
                log.error("异步更新缓存失败", e);
            } finally {
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
        });
    }

    // 4. 返回数据(即使逻辑过期也先返回旧数据)
    return cacheData.getData();
}
```

### 3. 缓存雪崩

#### 问题描述

大量缓存同时过期,请求全部打到数据库。

**场景:**
```
凌晨0点,所有缓存同时过期
  ↓
早上8点,大量用户访问
  ↓
Redis缓存大面积未命中
  ↓
MySQL数据库压力激增,可能宕机
```

#### 解决方案

```java
/**
 * 防止缓存雪崩的策略
 */
@Service
public class CacheService {

    /**
     * 方案1: 随机过期时间
     * 在基础过期时间上增加随机值
     */
    public void cacheWithRandomExpire(String key, Object value, Duration baseDuration) {
        // 基础时间 + 随机时间(0-300秒)
        int randomSeconds = ThreadLocalRandom.current().nextInt(0, 300);
        Duration finalDuration = baseDuration.plusSeconds(randomSeconds);

        RedisUtils.setCacheObject(key, value, finalDuration);
    }

    /**
     * 方案2: 多级缓存
     * L1(Caffeine) + L2(Redis) + L3(MySQL)
     */
    @Cacheable(cacheNames = "user", key = "#userId")
    public User getUserWithMultiCache(Long userId) {
        // Spring Cache自动使用二级缓存
        // 即使Redis挂了,Caffeine还能提供服务
        return userMapper.selectById(userId);
    }

    /**
     * 方案3: 服务降级
     * Redis不可用时,返回默认数据或错误提示
     */
    public List<Product> getHotProducts() {
        try {
            List<Product> products = RedisUtils.getCacheObject("hot:products");
            if (products != null) {
                return products;
            }

            // 查询数据库
            products = productMapper.selectHotProducts();
            RedisUtils.setCacheObject("hot:products", products, Duration.ofMinutes(30));
            return products;

        } catch (Exception e) {
            log.error("Redis异常,使用降级数据", e);
            // 返回默认数据
            return getDefaultProducts();
        }
    }

    /**
     * 方案4: 缓存预热
     * 系统启动时预先加载热点数据到缓存
     */
    @PostConstruct
    public void warmUpCache() {
        log.info("开始缓存预热...");

        // 加载热点商品
        List<Product> hotProducts = productMapper.selectHotProducts();
        for (Product product : hotProducts) {
            String cacheKey = "product:" + product.getProductId();
            // 设置随机过期时间
            cacheWithRandomExpire(cacheKey, product, Duration.ofHours(2));
        }

        // 加载字典数据
        List<DictType> dictTypes = dictTypeMapper.selectList(null);
        for (DictType dictType : dictTypes) {
            List<DictData> dictDatas = dictDataMapper.selectByType(dictType.getDictType());
            String cacheKey = "dict:" + dictType.getDictType();
            cacheWithRandomExpire(cacheKey, dictDatas, Duration.ofDays(1));
        }

        log.info("缓存预热完成!");
    }
}
```

---

## 分布式锁

### Redisson分布式锁

#### 基本使用

```java
/**
 * 使用Redisson分布式锁
 */
@Service
public class OrderService {

    /**
     * 创建订单 - 使用分布式锁防止重复下单
     */
    public void createOrder(Long userId, Long productId) {
        // 获取锁
        String lockKey = "lock:order:" + userId + ":" + productId;
        RLock lock = RedisUtils.getLock(lockKey);

        try {
            // 尝试加锁,最多等待10秒,锁30秒后自动释放
            boolean locked = lock.tryLock(10, 30, TimeUnit.SECONDS);

            if (!locked) {
                throw new ServiceException("系统繁忙,请稍后重试");
            }

            // 业务逻辑
            // 1. 检查库存
            Product product = productMapper.selectById(productId);
            if (product.getStock() <= 0) {
                throw new ServiceException("商品库存不足");
            }

            // 2. 扣减库存
            productMapper.decreaseStock(productId, 1);

            // 3. 创建订单
            Order order = new Order();
            order.setUserId(userId);
            order.setProductId(productId);
            orderMapper.insert(order);

        } catch (InterruptedException e) {
            log.error("获取锁失败", e);
            throw new ServiceException("系统繁忙");
        } finally {
            // 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

#### Lock4j注解式分布式锁

项目集成了Lock4j,支持注解式分布式锁:

```java
/**
 * 使用Lock4j注解
 */
@Service
public class OrderService {

    /**
     * @Lock4j注解自动加分布式锁
     *
     * @param keys 锁的key,支持SpEL表达式
     * @param acquireTimeout 获取锁超时时间(毫秒)
     * @param expire 锁过期时间(毫秒)
     */
    @Lock4j(keys = {"#userId", "#productId"}, acquireTimeout = 10000, expire = 30000)
    public void createOrder(Long userId, Long productId) {
        // Lock4j自动加锁/解锁
        // 业务逻辑
        Product product = productMapper.selectById(productId);
        if (product.getStock() <= 0) {
            throw new ServiceException("商品库存不足");
        }

        productMapper.decreaseStock(productId, 1);

        Order order = new Order();
        order.setUserId(userId);
        order.setProductId(productId);
        orderMapper.insert(order);
    }
}
```

参考: ruoyi-plus-uniapp/pom.xml:271-275

### 分布式锁最佳实践

#### 1. 锁的粒度要细

```java
// ❌ 锁粒度太粗,影响并发
@Lock4j(keys = {"order"})
public void createOrder(Long userId, Long productId) {
    // 所有订单创建都会互斥
}

// ✅ 锁粒度细化,只锁定特定用户+商品
@Lock4j(keys = {"order", "#userId", "#productId"})
public void createOrder(Long userId, Long productId) {
    // 不同用户/商品的订单创建不会互斥
}
```

#### 2. 设置合理的超时时间

```java
// ✅ 设置获取锁超时时间
RLock lock = RedisUtils.getLock(lockKey);
boolean locked = lock.tryLock(
    10, // 最多等待10秒
    30, // 锁30秒后自动释放
    TimeUnit.SECONDS
);

// ❌ 不设置超时时间,可能永久阻塞
lock.lock(); // 不推荐
```

#### 3. 确保锁一定会释放

```java
// ✅ 使用try-finally确保释放锁
RLock lock = RedisUtils.getLock(lockKey);
try {
    if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
        // 业务逻辑
    }
} finally {
    // 一定要在finally中释放锁
    if (lock.isHeldByCurrentThread()) {
        lock.unlock();
    }
}

// ❌ 业务异常导致锁未释放
RLock lock = RedisUtils.getLock(lockKey);
if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
    // 业务逻辑
    lock.unlock(); // 如果上面抛异常,这行不会执行
}
```

---

## 限流实现

### 基于Redis的限流

```java
/**
 * 限流控制
 * 使用Redis的RateLimiter实现令牌桶算法
 */
@Service
public class RateLimitService {

    /**
     * API限流
     * 每个用户每分钟最多请求100次
     *
     * @param userId 用户ID
     * @return true-允许访问, false-超出限制
     */
    public boolean checkRateLimit(Long userId) {
        String key = "rate_limit:user:" + userId;

        // 使用Redis RateLimiter
        // 每60秒允许100个令牌
        long result = RedisUtils.rateLimiter(
            key,
            RateType.OVERALL, // 全局限流
            100,              // 速率: 100个令牌
            60                // 时间间隔: 60秒
        );

        // 返回值: 剩余令牌数, -1表示获取失败
        return result >= 0;
    }

    /**
     * IP限流
     * 每个IP每分钟最多请求200次
     */
    public boolean checkIpRateLimit(String ip) {
        String key = "rate_limit:ip:" + ip;
        long result = RedisUtils.rateLimiter(key, RateType.OVERALL, 200, 60);
        return result >= 0;
    }

    /**
     * 接口限流
     * 某个接口每秒最多请求10次
     */
    public boolean checkApiRateLimit(String apiPath) {
        String key = "rate_limit:api:" + apiPath;
        long result = RedisUtils.rateLimiter(key, RateType.OVERALL, 10, 1);
        return result >= 0;
    }
}
```

参考: ruoyi-common/ruoyi-common-redis/src/main/java/plus/ruoyi/common/redis/utils/RedisUtils.java:58-80

### RateLimiter注解

项目提供了`@RateLimiter`注解,方便对接口进行限流:

```java
/**
 * 限流注解
 * 基于Redis实现分布式限流
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimiter {

    /**
     * 限流key
     */
    String key() default "";

    /**
     * 限流时间(秒)
     */
    int time() default 60;

    /**
     * 限流次数
     */
    int count() default 100;

    /**
     * 限流类型
     */
    LimitType limitType() default LimitType.DEFAULT;
}

/**
 * 限流类型
 */
public enum LimitType {
    /**
     * 默认策略(全局限流)
     */
    DEFAULT,

    /**
     * 根据IP限流
     */
    IP,

    /**
     * 根据用户限流
     */
    USER
}
```

**使用示例:**

```java
/**
 * 用户控制器
 */
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    /**
     * 查询用户列表
     * 每个IP每分钟最多请求60次
     */
    @RateLimiter(time = 60, count = 60, limitType = LimitType.IP)
    @GetMapping("/list")
    public TableDataInfo<UserVo> list(UserBo user, PageQuery pageQuery) {
        return userService.queryPageList(user, pageQuery);
    }

    /**
     * 新增用户
     * 每个用户每分钟最多提交10次
     */
    @RateLimiter(time = 60, count = 10, limitType = LimitType.USER)
    @PostMapping
    public R<Void> add(@Validated @RequestBody UserBo user) {
        return toAjax(userService.insertUser(user));
    }

    /**
     * 发送验证码
     * 全局限流,每秒最多100次
     */
    @RateLimiter(time = 1, count = 100, limitType = LimitType.DEFAULT)
    @PostMapping("/sendCode")
    public R<Void> sendCode(@RequestParam String mobile) {
        smsService.sendCode(mobile);
        return R.ok();
    }
}
```

参考: ruoyi-common/ruoyi-common-ratelimiter/

---

## 最佳实践

### 1. 缓存Key设计规范

**命名规范:**

```
# 格式: {业务模块}:{实体}:{ID}:{属性}
user:info:1001                    # 用户信息
user:permissions:1001             # 用户权限
product:detail:2001               # 商品详情
order:list:user:1001:page:1       # 用户订单列表第1页

# 带租户ID
tenant:000001:user:info:1001      # 租户1的用户信息
tenant:000001:dict:sys_user_sex   # 租户1的字典数据
```

**Key设计原则:**

1. **层级清晰**: 使用冒号`:`分隔层级
2. **语义明确**: Key能清楚表达缓存内容
3. **避免过长**: Key长度控制在100字符内
4. **避免特殊字符**: 不使用空格、换行等特殊字符

### 2. 缓存过期时间设置

```java
/**
 * 不同数据设置不同的过期时间
 */
public class CacheConstants {

    // 用户信息: 30分钟
    public static final Duration USER_EXPIRE = Duration.ofMinutes(30);

    // 字典数据: 1天
    public static final Duration DICT_EXPIRE = Duration.ofDays(1);

    // 配置参数: 12小时
    public static final Duration CONFIG_EXPIRE = Duration.ofHours(12);

    // 热点商品: 2小时
    public static final Duration HOT_PRODUCT_EXPIRE = Duration.ofHours(2);

    // 验证码: 5分钟
    public static final Duration CAPTCHA_EXPIRE = Duration.ofMinutes(5);

    // 短信验证码: 10分钟
    public static final Duration SMS_CODE_EXPIRE = Duration.ofMinutes(10);
}
```

### 3. 缓存更新时机

```java
/**
 * 明确缓存更新时机
 */
@Service
public class UserService {

    /**
     * 查询用户 - 懒加载,使用时才加载到缓存
     */
    @Cacheable(cacheNames = "user", key = "#userId")
    public User getUser(Long userId) {
        return userMapper.selectById(userId);
    }

    /**
     * 更新用户 - 先更新数据库,再删除缓存
     */
    @CacheEvict(cacheNames = "user", key = "#user.userId")
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(User user) {
        userMapper.updateById(user);
    }

    /**
     * 删除用户 - 同时删除缓存
     */
    @CacheEvict(cacheNames = "user", key = "#userId")
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long userId) {
        userMapper.deleteById(userId);
    }

    /**
     * 批量删除 - 清空整个缓存空间
     */
    @CacheEvict(cacheNames = "user", allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public void batchDelete(List<Long> userIds) {
        userMapper.deleteBatchIds(userIds);
    }
}
```

### 4. 避免缓存雪崩

```java
/**
 * 防止缓存雪崩的措施
 */
@Service
public class CacheService {

    /**
     * 1. 设置随机过期时间
     */
    public void setCacheWithRandomExpire(String key, Object value) {
        // 基础30分钟 + 0-5分钟随机
        int randomMinutes = ThreadLocalRandom.current().nextInt(0, 5);
        Duration duration = Duration.ofMinutes(30 + randomMinutes);
        RedisUtils.setCacheObject(key, value, duration);
    }

    /**
     * 2. 不同类型数据设置不同过期时间
     */
    public void setCacheByType(String key, Object value, String dataType) {
        Duration duration;
        switch (dataType) {
            case "user":
                duration = Duration.ofMinutes(30);
                break;
            case "product":
                duration = Duration.ofHours(2);
                break;
            case "dict":
                duration = Duration.ofDays(1);
                break;
            default:
                duration = Duration.ofMinutes(10);
        }
        RedisUtils.setCacheObject(key, value, duration);
    }

    /**
     * 3. 使用多级缓存
     */
    @Cacheable(cacheNames = "user", key = "#userId")
    public User getUserWithMultiCache(Long userId) {
        // 自动使用 Caffeine + Redis 二级缓存
        return userMapper.selectById(userId);
    }
}
```

### 5. 缓存监控

```java
/**
 * 缓存监控和统计
 */
@Component
@Slf4j
public class CacheMonitor {

    /**
     * 定时输出缓存统计信息
     */
    @Scheduled(cron = "0 */10 * * * ?") // 每10分钟
    public void monitorCache() {
        // 获取Redis信息
        RedissonClient client = RedisUtils.getClient();

        // 输出统计信息
        log.info("=== Redis缓存监控 ===");
        log.info("连接数: {}", getConnectionCount());
        log.info("内存使用: {}", getMemoryUsage());
        log.info("命中率: {}%", getCacheHitRate());
        log.info("Keys数量: {}", getKeysCount());
    }

    /**
     * 获取缓存命中率
     */
    private double getCacheHitRate() {
        // 实现缓存命中率统计逻辑
        return 0.0;
    }
}
```

---

## 常见问题

### 1. 缓存一致性问题

**问题: 缓存和数据库数据不一致怎么办?**

**原因:**
- 更新数据库和缓存的顺序不当
- 并发更新导致
- 缓存更新失败

**解决方案:**

```java
// ✅ 推荐: 先更新数据库,再删除缓存
@Transactional(rollbackFor = Exception.class)
public void updateUser(User user) {
    // 1. 更新数据库
    userMapper.updateById(user);

    // 2. 删除缓存
    String cacheKey = "user:" + user.getUserId();
    RedisUtils.deleteObject(cacheKey);

    // 下次查询时会重新加载
}

// ✅ 高并发场景: 延迟双删
@Transactional(rollbackFor = Exception.class)
public void updateUserWithDelay(User user) {
    String cacheKey = "user:" + user.getUserId();

    // 1. 第一次删除缓存
    RedisUtils.deleteObject(cacheKey);

    // 2. 更新数据库
    userMapper.updateById(user);

    // 3. 延迟后再次删除缓存(500ms)
    CompletableFuture.runAsync(() -> {
        try {
            Thread.sleep(500);
            RedisUtils.deleteObject(cacheKey);
        } catch (InterruptedException e) {
            log.error("延迟删除缓存失败", e);
        }
    });
}
```

### 2. Redis内存溢出

**问题: Redis内存不足怎么办?**

**解决方案:**

```yaml
# redis.conf配置
# 1. 设置最大内存
maxmemory 2gb

# 2. 设置淘汰策略
maxmemory-policy allkeys-lru

# 淘汰策略说明:
# noeviction: 不淘汰,内存满时拒绝写入
# allkeys-lru: 淘汰所有key中最少使用的
# allkeys-lfu: 淘汰所有key中最不常用的
# volatile-lru: 只淘汰设置了过期时间的key中最少使用的
# volatile-lfu: 只淘汰设置了过期时间的key中最不常用的
# volatile-ttl: 淘汰即将过期的key
# allkeys-random: 随机淘汰
# volatile-random: 随机淘汰设置了过期时间的key
```

```java
// 代码层面:
// 1. 所有缓存都设置过期时间
RedisUtils.setCacheObject(key, value, Duration.ofMinutes(30));

// 2. 定期清理无用缓存
@Scheduled(cron = "0 0 3 * * ?") // 每天凌晨3点
public void clearExpiredCache() {
    // 清理7天前的日志缓存
    Collection<String> keys = RedisUtils.keys("log:*");
    // ...清理逻辑
}
```

### 3. 缓存预热

**问题: 系统启动时缓存是空的,首次访问很慢?**

**解决方案:**

```java
/**
 * 缓存预热
 * 系统启动时预先加载热点数据
 */
@Component
@Slf4j
public class CacheWarmUp {

    @Autowired
    private UserService userService;
    @Autowired
    private DictService dictService;
    @Autowired
    private ConfigService configService;

    /**
     * 系统启动后执行缓存预热
     */
    @PostConstruct
    @Async
    public void init() {
        log.info("开始缓存预热...");

        try {
            // 1. 预热字典数据
            warmUpDict();

            // 2. 预热配置数据
            warmUpConfig();

            // 3. 预热热点用户
            warmUpHotUsers();

            log.info("缓存预热完成!");
        } catch (Exception e) {
            log.error("缓存预热失败", e);
        }
    }

    /**
     * 预热字典数据
     */
    private void warmUpDict() {
        List<String> dictTypes = Arrays.asList(
            "sys_user_sex",
            "sys_normal_disable",
            "sys_yes_no"
        );

        for (String dictType : dictTypes) {
            dictService.selectDictDataByType(dictType);
        }
    }

    /**
     * 预热配置数据
     */
    private void warmUpConfig() {
        List<String> configKeys = Arrays.asList(
            "sys.user.initPassword",
            "sys.account.captchaEnabled"
        );

        for (String configKey : configKeys) {
            configService.selectConfigByKey(configKey);
        }
    }

    /**
     * 预热热点用户(根据业务需求)
     */
    private void warmUpHotUsers() {
        // 加载VIP用户到缓存
        List<Long> vipUserIds = userService.selectVipUserIds();
        for (Long userId : vipUserIds) {
            userService.getUser(userId);
        }
    }
}
```

### 4. 大Key问题

**问题: 某个Key占用内存很大,读写很慢?**

**解决方案:**

```java
// ❌ 不要存储大对象
List<User> allUsers = userMapper.selectList(null); // 可能有10万条
RedisUtils.setCacheObject("all_users", allUsers); // 不推荐

// ✅ 拆分为多个小Key
for (User user : allUsers) {
    RedisUtils.setCacheObject("user:" + user.getUserId(), user);
}

// ✅ 或者使用Hash结构
Map<String, User> userMap = allUsers.stream()
    .collect(Collectors.toMap(u -> String.valueOf(u.getUserId()), u -> u));
RedisUtils.setCacheMap("users", userMap);

// ✅ 分页缓存
RedisUtils.setCacheObject("users:page:1", users.subList(0, 1000));
RedisUtils.setCacheObject("users:page:2", users.subList(1000, 2000));
```

---

## 总结

缓存是提升系统性能的关键技术,RuoYi-Plus-UniApp项目通过以下策略实现高效缓存:

**核心特性:**

1. **多级缓存架构**
   - L1: Caffeine本地缓存(热点数据)
   - L2: Redis远程缓存(共享数据)

2. **完善的工具类**
   - RedisUtils: 编程式缓存操作
   - CacheUtils: Spring Cache抽象层
   - Spring Cache注解: 声明式缓存

3. **缓存问题防护**
   - 缓存穿透: 空值缓存 + 布隆过滤器
   - 缓存击穿: 分布式锁 + 逻辑过期
   - 缓存雪崩: 随机过期 + 多级缓存

4. **分布式支持**
   - Redisson分布式锁
   - Lock4j注解式锁
   - Redis限流器

**最佳实践:**

✅ 合理设置过期时间
✅ 使用多级缓存
✅ 防止缓存穿透/击穿/雪崩
✅ 先更新数据库再删除缓存
✅ 缓存预热热点数据
✅ 监控缓存命中率
✅ 避免大Key和热Key

通过遵循本文档的缓存策略和最佳实践,可以构建高性能、高可用的缓存系统。

