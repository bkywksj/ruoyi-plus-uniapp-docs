# 缓存策略

## 介绍

RuoYi-Plus-UniApp 采用 Redis + Caffeine 二级缓存架构，基于 Redisson 客户端实现完善的缓存策略，包括多级缓存、缓存问题防护、分布式锁和限流控制。

**核心特性:**

- **二级缓存架构** - L1 Caffeine 本地缓存 + L2 Redis 远程缓存
- **完善工具类** - RedisUtils 编程式缓存、Spring Cache 注解式缓存
- **问题防护** - 缓存穿透、击穿、雪崩解决方案
- **分布式支持** - Redisson 分布式锁、Lock4j 注解式锁、限流器

## 缓存架构

### 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| Redis | 7.x | 远程缓存服务器 |
| Redisson | 3.51.0 | Redis Java客户端 |
| Caffeine | 3.x | 本地缓存库 |
| Spring Cache | 3.x | 缓存抽象层 |

### 缓存层级

**L1 - 本地缓存 (Caffeine):**
- 进程内缓存，访问速度极快
- 容量有限，适合热点数据

**L2 - 远程缓存 (Redis):**
- 分布式缓存，容量大
- 多实例共享，支持持久化

### 应用场景

| 场景 | 说明 |
|------|------|
| 用户会话 | 登录信息、权限数据、菜单路由 |
| 字典数据 | 系统字典、配置参数、常量数据 |
| 业务数据 | 热点商品、文章详情、统计数据 |
| 分布式场景 | 分布式锁、分布式session、限流控制 |

## Redis配置

### Maven依赖

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.51.0</version>
</dependency>
```

### 配置文件

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      database: ${REDIS_DATABASE:0}
      timeout: 10s

redisson:
  threads: 16
  netty-threads: 32
  single-server-config:
    idle-connection-timeout: 10000
    connect-timeout: 10000
    timeout: 3000
    retry-attempts: 3
    connection-pool-size: 64
    connection-minimum-idle-size: 32
```

## 缓存工具类

### RedisUtils

```java
public class RedisUtils {

    // ==================== 基础操作 ====================

    // 缓存对象
    public static <T> void setCacheObject(String key, T value) {
        RBucket<T> bucket = CLIENT.getBucket(key);
        bucket.set(value);
    }

    // 缓存对象(带过期时间)
    public static <T> void setCacheObject(String key, T value, Duration duration) {
        RBucket<T> bucket = CLIENT.getBucket(key);
        bucket.set(value, duration);
    }

    // 获取缓存对象
    public static <T> T getCacheObject(String key) {
        RBucket<T> rBucket = CLIENT.getBucket(key);
        return rBucket.get();
    }

    // 删除缓存对象
    public static boolean deleteObject(String key) {
        return CLIENT.getBucket(key).delete();
    }

    // 检查是否存在
    public static boolean isExistsObject(String key) {
        return CLIENT.getBucket(key).isExists();
    }

    // 设置过期时间
    public static boolean expire(String key, Duration duration) {
        return CLIENT.getBucket(key).expire(duration);
    }

    // ==================== 集合操作 ====================

    // List操作
    public static <T> boolean setCacheList(String key, List<T> dataList) {
        return CLIENT.getList(key).addAll(dataList);
    }

    public static <T> List<T> getCacheList(String key) {
        return CLIENT.getList(key).readAll();
    }

    // Set操作
    public static <T> boolean setCacheSet(String key, Set<T> dataSet) {
        return CLIENT.getSet(key).addAll(dataSet);
    }

    public static <T> Set<T> getCacheSet(String key) {
        return CLIENT.getSet(key).readAll();
    }

    // Map操作
    public static <T> void setCacheMap(String key, Map<String, T> dataMap) {
        CLIENT.getMap(key).putAll(dataMap);
    }

    public static <T> Map<String, T> getCacheMap(String key) {
        RMap<String, T> rMap = CLIENT.getMap(key);
        return rMap.getAll(rMap.keySet());
    }

    // ==================== 原子操作 ====================

    public static long incrAtomicValue(String key) {
        return CLIENT.getAtomicLong(key).incrementAndGet();
    }

    public static long decrAtomicValue(String key) {
        return CLIENT.getAtomicLong(key).decrementAndGet();
    }

    // ==================== 限流与锁 ====================

    public static long rateLimiter(String key, RateType rateType, int rate, int rateInterval) {
        RRateLimiter rateLimiter = CLIENT.getRateLimiter(key);
        rateLimiter.trySetRate(rateType, rate, Duration.ofSeconds(rateInterval));
        return rateLimiter.tryAcquire() ? rateLimiter.availablePermits() : -1L;
    }

    public static RLock getLock(String key) {
        return CLIENT.getLock(key);
    }
}
```

### CacheUtils (Spring Cache)

```java
public class CacheUtils {

    // 获取缓存值
    public static <T> T get(String cacheNames, Object key) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            Cache.ValueWrapper wrapper = cache.get(key);
            return wrapper != null ? (T) wrapper.get() : null;
        }
        return null;
    }

    // 设置缓存值
    public static void put(String cacheNames, Object key, Object value) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            cache.put(key, value);
        }
    }

    // 删除缓存
    public static void evict(String cacheNames, Object key) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            cache.evict(key);
        }
    }

    // 清空缓存
    public static void clear(String cacheNames) {
        Cache cache = CACHE_MANAGER.getCache(cacheNames);
        if (cache != null) {
            cache.clear();
        }
    }
}
```

## 缓存使用场景

### 字典数据缓存

```java
@Service
public class SysDictTypeServiceImpl implements ISysDictTypeService {

    // 查询字典 - 自动缓存
    @Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
    public List<SysDictData> selectDictDataByType(String dictType) {
        return dictDataMapper.selectDictDataByType(dictType);
    }

    // 修改字典 - 清除缓存
    @CacheEvict(cacheNames = CacheNames.SYS_DICT, key = "#dictType.dictType")
    public int updateDictType(SysDictType dictType) {
        return baseMapper.updateById(dictType);
    }

    // 清空字典缓存
    public void clearDictCache() {
        CacheUtils.clear(CacheNames.SYS_DICT);
    }
}
```

### 配置参数缓存

```java
@Service
public class SysConfigServiceImpl implements ISysConfigService {

    @Cacheable(cacheNames = CacheNames.SYS_CONFIG, key = "#configKey")
    public String selectConfigByKey(String configKey) {
        SysConfig config = baseMapper.selectOne(
            new LambdaQueryWrapper<SysConfig>().eq(SysConfig::getConfigKey, configKey)
        );
        return config != null ? config.getConfigValue() : "";
    }

    @CachePut(cacheNames = CacheNames.SYS_CONFIG, key = "#config.configKey")
    public int updateConfig(SysConfig config) {
        return baseMapper.updateById(config);
    }
}
```

## 缓存更新策略

### Cache Aside Pattern (推荐)

```java
// 读: 先读缓存，未命中再读数据库
public User getUser(Long userId) {
    String cacheKey = "user:" + userId;
    User user = RedisUtils.getCacheObject(cacheKey);
    if (user != null) return user;

    user = userMapper.selectById(userId);
    if (user != null) {
        RedisUtils.setCacheObject(cacheKey, user, Duration.ofMinutes(30));
    }
    return user;
}

// 写: 先更新数据库，再删除缓存
@Transactional(rollbackFor = Exception.class)
public void updateUser(User user) {
    userMapper.updateById(user);
    RedisUtils.deleteObject("user:" + user.getUserId());
}
```

### 延迟双删策略

```java
@Transactional(rollbackFor = Exception.class)
public void updateUser(User user) {
    String cacheKey = "user:" + user.getUserId();

    // 1. 第一次删除缓存
    RedisUtils.deleteObject(cacheKey);

    // 2. 更新数据库
    userMapper.updateById(user);

    // 3. 延迟后再次删除缓存
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

## 缓存问题与解决

### 1. 缓存穿透

**问题:** 查询不存在的数据，每次请求都打到数据库。

**解决方案1: 缓存空值**

```java
public User getUser(Long userId) {
    String cacheKey = "user:" + userId;
    User user = RedisUtils.getCacheObject(cacheKey);

    if (user != null) {
        return user.getUserId() == null ? null : user;
    }

    user = userMapper.selectById(userId);
    if (user != null) {
        RedisUtils.setCacheObject(cacheKey, user, Duration.ofMinutes(30));
    } else {
        // 缓存空值(较短时间)
        RedisUtils.setCacheObject(cacheKey, new User(), Duration.ofMinutes(5));
    }
    return user;
}
```

**解决方案2: 布隆过滤器**

```java
@Component
public class UserBloomFilter {
    private final RBloomFilter<Long> bloomFilter;

    public UserBloomFilter(RedissonClient redissonClient) {
        this.bloomFilter = redissonClient.getBloomFilter("user:bloom");
        bloomFilter.tryInit(1000000, 0.01);
    }

    public void add(Long userId) { bloomFilter.add(userId); }
    public boolean mightContain(Long userId) { return bloomFilter.contains(userId); }
}
```

### 2. 缓存击穿

**问题:** 热点数据过期瞬间，大量请求同时打到数据库。

**解决方案: 互斥锁**

```java
public Product getProduct(Long productId) {
    String cacheKey = "product:" + productId;
    Product product = RedisUtils.getCacheObject(cacheKey);
    if (product != null) return product;

    String lockKey = "lock:product:" + productId;
    RLock lock = RedisUtils.getLock(lockKey);

    try {
        if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
            // 双重检查
            product = RedisUtils.getCacheObject(cacheKey);
            if (product != null) return product;

            product = productMapper.selectById(productId);
            if (product != null) {
                RedisUtils.setCacheObject(cacheKey, product, Duration.ofMinutes(30));
            }
            return product;
        }
        Thread.sleep(50);
        return getProduct(productId);
    } finally {
        if (lock.isHeldByCurrentThread()) lock.unlock();
    }
}
```

### 3. 缓存雪崩

**问题:** 大量缓存同时过期，请求全部打到数据库。

**解决方案:**

```java
// 1. 随机过期时间
public void cacheWithRandomExpire(String key, Object value) {
    int randomSeconds = ThreadLocalRandom.current().nextInt(0, 300);
    Duration duration = Duration.ofMinutes(30).plusSeconds(randomSeconds);
    RedisUtils.setCacheObject(key, value, duration);
}

// 2. 使用多级缓存
@Cacheable(cacheNames = "user", key = "#userId")
public User getUserWithMultiCache(Long userId) {
    return userMapper.selectById(userId);
}

// 3. 缓存预热
@PostConstruct
public void warmUpCache() {
    List<String> dictTypes = Arrays.asList("sys_user_sex", "sys_normal_disable");
    for (String dictType : dictTypes) {
        dictService.selectDictDataByType(dictType);
    }
}
```

## 分布式锁

### Redisson分布式锁

```java
public void createOrder(Long userId, Long productId) {
    String lockKey = "lock:order:" + userId + ":" + productId;
    RLock lock = RedisUtils.getLock(lockKey);

    try {
        if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
            // 业务逻辑
            Product product = productMapper.selectById(productId);
            if (product.getStock() <= 0) {
                throw new ServiceException("库存不足");
            }
            productMapper.decreaseStock(productId, 1);
            orderMapper.insert(new Order(userId, productId));
        }
    } catch (InterruptedException e) {
        throw new ServiceException("系统繁忙");
    } finally {
        if (lock.isHeldByCurrentThread()) lock.unlock();
    }
}
```

### Lock4j注解式锁

```java
@Lock4j(keys = {"#userId", "#productId"}, acquireTimeout = 10000, expire = 30000)
public void createOrder(Long userId, Long productId) {
    // Lock4j自动加锁/解锁
    Product product = productMapper.selectById(productId);
    if (product.getStock() <= 0) {
        throw new ServiceException("库存不足");
    }
    productMapper.decreaseStock(productId, 1);
    orderMapper.insert(new Order(userId, productId));
}
```

## 限流实现

### @RateLimiter注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimiter {
    String key() default "";      // 限流key
    int time() default 60;        // 限流时间(秒)
    int count() default 100;      // 限流次数
    LimitType limitType() default LimitType.DEFAULT;  // 限流类型
}

public enum LimitType {
    DEFAULT,  // 全局限流
    IP,       // 根据IP限流
    USER      // 根据用户限流
}
```

**使用示例:**

```java
@RestController
public class SysUserController {

    // 每个IP每分钟最多60次
    @RateLimiter(time = 60, count = 60, limitType = LimitType.IP)
    @GetMapping("/list")
    public TableDataInfo<UserVo> list(UserBo user, PageQuery pageQuery) {
        return userService.queryPageList(user, pageQuery);
    }

    // 每个用户每分钟最多10次
    @RateLimiter(time = 60, count = 10, limitType = LimitType.USER)
    @PostMapping
    public R<Void> add(@RequestBody UserBo user) {
        return toAjax(userService.insertUser(user));
    }
}
```

## 最佳实践

### 缓存Key设计

```
# 格式: {业务模块}:{实体}:{ID}:{属性}
user:info:1001                    # 用户信息
user:permissions:1001             # 用户权限
product:detail:2001               # 商品详情

# 带租户ID
tenant:000001:user:info:1001      # 租户1的用户信息
```

### 过期时间设置

```java
public class CacheConstants {
    public static final Duration USER_EXPIRE = Duration.ofMinutes(30);      // 用户信息
    public static final Duration DICT_EXPIRE = Duration.ofDays(1);          // 字典数据
    public static final Duration CONFIG_EXPIRE = Duration.ofHours(12);      // 配置参数
    public static final Duration HOT_PRODUCT_EXPIRE = Duration.ofHours(2);  // 热点商品
    public static final Duration CAPTCHA_EXPIRE = Duration.ofMinutes(5);    // 验证码
}
```

## 常见问题

### 1. 缓存一致性问题

**解决:** 先更新数据库，再删除缓存；高并发场景使用延迟双删。

### 2. Redis内存溢出

**解决:**
```yaml
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru  # 淘汰最少使用的key
```

### 3. 大Key问题

```java
// 拆分为多个小Key
for (User user : allUsers) {
    RedisUtils.setCacheObject("user:" + user.getUserId(), user);
}

// 或使用Hash结构
RedisUtils.setCacheMap("users", userMap);
```

## 总结

缓存策略核心要点:

1. **多级缓存架构** - L1 Caffeine + L2 Redis
2. **完善工具类** - RedisUtils 编程式 + Spring Cache 注解式
3. **缓存问题防护** - 穿透(空值/布隆)、击穿(互斥锁)、雪崩(随机过期)
4. **分布式支持** - Redisson 锁 + Lock4j 注解 + 限流器
5. **最佳实践** - 合理过期时间、先更新数据库再删缓存、缓存预热
