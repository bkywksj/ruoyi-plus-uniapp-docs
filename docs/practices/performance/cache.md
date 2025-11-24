# 缓存性能优化

## 介绍

缓存性能优化是提升系统性能的核心手段之一。RuoYi-Plus 采用多级缓存架构,结合 Caffeine 本地缓存和 Redisson 分布式缓存,实现高性能的数据访问。通过合理的缓存策略配置、缓存预热、缓存更新机制,可以显著降低数据库访问压力,提升系统响应速度。

本文档详细介绍缓存性能优化的各个方面,包括缓存架构设计、配置优化、使用最佳实践、性能监控等内容,帮助开发者构建高性能的缓存系统。

**核心特性:**

- **多级缓存架构** - Caffeine 本地缓存 + Redisson 分布式缓存,兼顾性能和一致性
- **动态缓存配置** - 支持通过缓存名称动态配置 TTL、MaxIdleTime、MaxSize 等参数
- **Spring Cache 集成** - 基于注解的声明式缓存,简化缓存操作
- **缓存穿透防护** - 空值缓存机制,防止缓存穿透攻击
- **缓存失效策略** - 支持主动失效、被动过期、LRU 淘汰等多种策略
- **缓存预热机制** - 应用启动时预加载热点数据,提升初始访问性能
- **监控与诊断** - 提供缓存命中率统计、慢查询监控等工具

## 缓存架构设计

### 多级缓存架构

RuoYi-Plus 采用两级缓存架构:

```
┌─────────────┐
│  应用层请求  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│       PlusSpringCacheManager        │  Spring Cache Manager
└──────┬─────────────┬────────────────┘
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────────────┐
│   Caffeine  │  │      Redisson       │  Cache Backend
│  本地缓存    │  │    分布式缓存        │
└─────────────┘  └─────────────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐  ┌─────────────────────┐
│  本地内存    │  │    Redis 服务器      │  Storage
└─────────────┘  └─────────────────────┘
       │                    │
       └──────────┬─────────┘
                  ▼
          ┌──────────────┐
          │   数据库层    │  Database Layer
          └──────────────┘
```

**工作流程:**

1. **一级缓存 (Caffeine 本地缓存)**:
   - 存储在 JVM 堆内存中
   - 访问速度极快 (纳秒级)
   - 容量有限,受 JVM 内存限制
   - 适合存储热点数据、只读数据

2. **二级缓存 (Redisson 分布式缓存)**:
   - 存储在 Redis 服务器
   - 访问速度快 (毫秒级)
   - 容量大,可扩展
   - 支持集群部署,数据共享
   - 适合存储共享数据、用户会话

3. **数据库层**:
   - 持久化数据存储
   - 缓存未命中时查询数据库
   - 查询结果回填到缓存

### 缓存配置架构

RuoYi-Plus 提供灵活的缓存配置机制,支持通过缓存名称动态配置参数:

**CacheNames 常量定义:**

系统在 `CacheNames.java` 中定义了所有缓存名称常量,每个常量包含完整的缓存配置。

```java
/**
 * 缓存组名称常量
 * key 格式: cacheNames#ttl#maxIdleTime#maxSize#local
 *
 * ttl: 过期时间,0表示永不过期,默认0
 * maxIdleTime: 最大空闲时间,根据LRU算法清理,0表示不检测,默认0
 * maxSize: 组最大长度,根据LRU算法清理溢出数据,0表示无限长,默认0
 * local: 是否启用本地缓存,可选参数
 *
 * 示例:
 * - test#60s - 60秒过期
 * - test#0#60s - 最大空闲60秒
 * - test#0#1m#1000 - 最大1000个,空闲1分钟淘汰
 * - test#1h#0#500 - 1小时过期,最多500个
 * - test#1h#0#500#local - 1小时过期,最多500个,启用本地缓存
 */
```

**配置示例:**

```java
// 系统配置缓存 - 长期缓存,相对稳定
String SYS_CONFIG = "sys_config#5d#2d#500";
// TTL: 5天
// MaxIdleTime: 2天 (2天未访问则淘汰)
// MaxSize: 500个 (超过500个则LRU淘汰)

// 数据字典缓存 - 中期缓存,访问频繁
String SYS_DICT = "sys_dict#1d#12h#1000";
// TTL: 1天
// MaxIdleTime: 12小时
// MaxSize: 1000个

// 用户昵称缓存 - 中期缓存,数据量大
String SYS_NICKNAME = "sys_nickname#5d#2d#5000";
// TTL: 5天
// MaxIdleTime: 2天
// MaxSize: 5000个

// OSS目录缓存 - 短期缓存,变化频繁
String SYS_OSS_DIRECTORY = "sys_oss_directory#10s#5s#500";
// TTL: 10秒
// MaxIdleTime: 5秒
// MaxSize: 500个

// 首页统计缓存 - 实时性要求高
String HOME_STATISTICS = "home_statistics#20s#10s#100";
// TTL: 20秒
// MaxIdleTime: 10秒
// MaxSize: 100个
```

**时间单位支持:**

- `s` / `S`: 秒
- `m` / `M`: 分钟
- `h` / `H`: 小时
- `d` / `D`: 天

### 缓存名称解析

PlusSpringCacheManager 负责解析缓存名称并创建相应的缓存实例:

```java
public Cache getCache(String name) {
    // 解析缓存名称: cacheName#ttl#maxIdleTime#maxSize#local
    String[] array = StringUtils.delimitedListToStringArray(name, "#");
    String cacheName = array[0];

    // 解析 TTL (过期时间)
    Duration ttl = parseDuration(array, 1);

    // 解析 MaxIdleTime (最大空闲时间)
    Duration maxIdleTime = parseDuration(array, 2);

    // 解析 MaxSize (最大数量)
    Integer maxSize = parseMaxSize(array, 3);

    // 解析 local 标志 (是否启用本地缓存)
    boolean useLocalCache = parseLocalFlag(array, 4);

    // 创建缓存配置
    CacheConfig cacheConfig = new CacheConfig(ttl, maxIdleTime, maxSize);

    // 创建缓存实例
    return createCache(cacheName, cacheConfig, useLocalCache);
}
```

## Spring Cache 注解使用

### @Cacheable - 查询缓存

`@Cacheable` 用于缓存方法返回值,下次相同参数调用时直接返回缓存结果。

**字典数据查询:**

```java
/**
 * 根据字典类型查询字典数据
 * 缓存配置: sys_dict#1d#12h#1000
 * - TTL: 1天
 * - MaxIdleTime: 12小时
 * - MaxSize: 1000个
 */
@Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
@Override
public List<SysDictDataVo> listDictDataByType(String dictType) {
    if (StringUtils.isBlank(dictType)) {
        return Collections.emptyList();
    }

    List<SysDictData> dictDataList = dictDataDao.listDictDataByType(dictType);
    if (CollUtil.isEmpty(dictDataList)) {
        // 返回空列表,防止缓存穿透
        return Collections.emptyList();
    }
    return MapstructUtils.convert(dictDataList, SysDictDataVo.class);
}
```

**用户昵称查询:**

```java
/**
 * 根据用户ID获取用户昵称
 * 缓存配置: sys_nickname#5d#2d#5000
 * - TTL: 5天
 * - MaxIdleTime: 2天 (2天未访问则淘汰)
 * - MaxSize: 5000个
 */
@Cacheable(cacheNames = CacheNames.SYS_NICKNAME, key = "#userId")
@Override
public String selectNicknameById(Long userId) {
    SysUser user = userDao.getById(userId);
    return user != null ? user.getNickName() : null;
}
```

**租户信息查询 (全局缓存):**

```java
/**
 * 根据租户ID查询租户信息
 * 缓存配置: global:sys_tenant#5d#2d#100
 * - 使用全局缓存键,跨租户共享
 * - TTL: 5天
 * - MaxIdleTime: 2天
 * - MaxSize: 100个
 */
@Cacheable(cacheNames = CacheNames.SYS_TENANT, key = "#tenantId")
@Override
public SysTenantVo queryByTenantId(String tenantId) {
    SysTenant tenant = tenantDao.getByTenantId(tenantId);
    return MapstructUtils.convert(tenant, SysTenantVo.class);
}
```

**条件缓存:**

```java
/**
 * 查询角色自定义权限
 * 只缓存 roleId 不为 null 的查询结果
 */
@Cacheable(
    cacheNames = CacheNames.SYS_ROLE_CUSTOM,
    key = "#roleId",
    condition = "#roleId != null"
)
@Override
public SysDataScopeVo selectRoleCustom(Long roleId) {
    if (roleId == null) {
        return null;
    }
    return dataScopeDao.selectRoleCustom(roleId);
}
```

### @CachePut - 更新缓存

`@CachePut` 用于更新缓存,方法每次都会执行,并将返回值更新到缓存。

**字典类型新增:**

```java
/**
 * 新增字典类型
 * 使用 @CachePut 将空列表写入缓存,防止缓存穿透
 */
@CachePut(cacheNames = CacheNames.SYS_DICT, key = "#bo.dictType")
@Override
public List<SysDictDataVo> insertDictType(SysDictTypeBo bo) {
    SysDictType dictType = MapstructUtils.convert(bo, SysDictType.class);
    boolean success = dictTypeDao.insert(dictType);
    if (success) {
        bo.setDictId(dictType.getDictId());
        // 新增类型下无数据,返回空列表防止缓存穿透
        return Collections.emptyList();
    }
    throw ServiceException.of("新增字典类型失败");
}
```

**字典类型修改:**

```java
/**
 * 修改字典类型
 * 更新字典类型信息,同时更新缓存
 */
@CachePut(cacheNames = CacheNames.SYS_DICT, key = "#bo.dictType")
@Override
@Transactional(rollbackFor = Exception.class)
public List<SysDictDataVo> updateDictType(SysDictTypeBo bo) {
    SysDictType newDictType = MapstructUtils.convert(bo, SysDictType.class);
    SysDictType oldDictType = dictTypeDao.getById(newDictType.getDictId());

    if (oldDictType == null) {
        throw ServiceException.of("字典类型不存在");
    }

    // 更新关联的字典数据
    if (!Objects.equals(oldDictType.getDictType(), newDictType.getDictType())) {
        dictDataDao.updateDictType(oldDictType.getDictType(), newDictType.getDictType());
    }

    // 更新字典类型
    boolean success = dictTypeDao.updateById(newDictType);
    if (success) {
        // 清理旧缓存
        evictDictCache(oldDictType.getDictType());

        // 返回新的字典数据,更新缓存
        List<SysDictData> dictDataList = dictDataDao.listDictDataByType(newDictType.getDictType());
        return MapstructUtils.convert(dictDataList, SysDictDataVo.class);
    }
    throw ServiceException.of("修改字典类型失败");
}
```

**系统配置修改:**

```java
/**
 * 修改系统配置
 * 使用 @CachePut 更新缓存中的配置值
 */
@CachePut(cacheNames = CacheNames.SYS_CONFIG, key = "#bo.configKey")
@Override
public String updateConfig(SysConfigBo bo) {
    SysConfig config = MapstructUtils.convert(bo, SysConfig.class);
    boolean success = configDao.updateById(config);
    if (success) {
        return config.getConfigValue();
    }
    throw ServiceException.of("修改配置失败");
}
```

### @CacheEvict - 清除缓存

`@CacheEvict` 用于删除缓存,支持删除单个缓存或清空整个缓存组。

**用户更新 - 单个缓存清除:**

```java
/**
 * 更新用户信息
 * 清除用户昵称缓存
 */
@CacheEvict(cacheNames = CacheNames.SYS_NICKNAME, key = "#user.userId")
@Override
public boolean updateUser(SysUser user) {
    return userDao.updateById(user);
}
```

**部门更新 - 多个缓存清除:**

```java
/**
 * 修改部门信息
 * 同时清除部门缓存和部门子级缓存
 */
@Caching(evict = {
    @CacheEvict(cacheNames = CacheNames.SYS_DEPT, key = "#bo.deptId"),
    @CacheEvict(cacheNames = CacheNames.SYS_DEPT_AND_CHILD, allEntries = true)
})
@Override
public boolean updateDept(SysDeptBo bo) {
    SysDept dept = MapstructUtils.convert(bo, SysDept.class);
    return deptDao.updateById(dept);
}
```

**部门新增 - 清空整个缓存组:**

```java
/**
 * 新增部门
 * 清空所有部门子级缓存 (因为新增部门可能影响任何父级部门的子级列表)
 */
@CacheEvict(cacheNames = CacheNames.SYS_DEPT_AND_CHILD, allEntries = true)
@Override
public boolean insertDept(SysDeptBo bo) {
    SysDept dept = MapstructUtils.convert(bo, SysDept.class);
    return deptDao.insert(dept);
}
```

**角色删除 - 删除指定缓存:**

```java
/**
 * 删除角色
 * 删除角色自定义权限缓存
 */
@CacheEvict(cacheNames = CacheNames.SYS_ROLE_CUSTOM, key = "#roleId")
@Override
public boolean deleteRoleById(Long roleId) {
    return roleDao.deleteById(roleId);
}
```

**批量删除 - 清空整个缓存组:**

```java
/**
 * 批量删除角色
 * 清空所有角色自定义权限缓存
 */
@CacheEvict(cacheNames = CacheNames.SYS_ROLE_CUSTOM, allEntries = true)
@Override
public boolean batchDeleteRole(List<Long> roleIds) {
    return roleDao.deleteByIds(roleIds);
}
```

### @Caching - 组合注解

`@Caching` 用于组合多个缓存注解,实现复杂的缓存操作。

**租户更新 - 多缓存失效:**

```java
/**
 * 修改租户信息
 * 同时清除租户ID缓存和域名缓存
 */
@Caching(evict = {
    @CacheEvict(cacheNames = CacheNames.SYS_TENANT, key = "#bo.tenantId"),
    @CacheEvict(cacheNames = CacheNames.SYS_TENANT, key = "'domain:' + #bo.domain",
                condition = "#bo.domain != null")
})
@Override
public boolean updateTenant(SysTenantBo bo) {
    SysTenant tenant = MapstructUtils.convert(bo, SysTenant.class);
    return tenantDao.updateById(tenant);
}
```

**复杂查询缓存:**

```java
/**
 * 查询用户详情
 * 同时缓存用户名、昵称、头像
 */
@Caching(cacheable = {
    @Cacheable(cacheNames = CacheNames.SYS_USER_NAME, key = "#userId"),
    @Cacheable(cacheNames = CacheNames.SYS_NICKNAME, key = "#userId"),
    @Cacheable(cacheNames = CacheNames.SYS_AVATAR, key = "#userId")
})
@Override
public SysUserVo selectUserDetail(Long userId) {
    SysUser user = userDao.getById(userId);
    return MapstructUtils.convert(user, SysUserVo.class);
}
```

## CacheUtils 工具类使用

CacheUtils 提供了统一的缓存操作接口,基于 Spring Cache 抽象层。

### 基本操作

**获取缓存值:**

```java
/**
 * 获取缓存值
 * @param cacheNames 缓存名称 (如: CacheNames.SYS_CONFIG)
 * @param key 缓存键
 * @return 缓存值,不存在返回 null
 */
String configValue = CacheUtils.get(CacheNames.SYS_CONFIG, "sys.user.initPassword");

// 泛型支持
List<SysDictDataVo> dictList = CacheUtils.get(CacheNames.SYS_DICT, "sys_user_sex");

// 示例:获取用户昵称
String nickname = CacheUtils.get(CacheNames.SYS_NICKNAME, userId);
```

**设置缓存值:**

```java
/**
 * 设置缓存值
 * @param cacheNames 缓存名称
 * @param key 缓存键
 * @param value 缓存值
 */
CacheUtils.put(CacheNames.SYS_CONFIG, "sys.user.initPassword", "123456");

// 示例:缓存用户昵称
CacheUtils.put(CacheNames.SYS_NICKNAME, userId, "张三");

// 示例:缓存字典数据
CacheUtils.put(CacheNames.SYS_DICT, "sys_user_sex", dictList);
```

**删除缓存:**

```java
/**
 * 删除单个缓存
 * @param cacheNames 缓存名称
 * @param key 缓存键
 */
CacheUtils.evict(CacheNames.SYS_CONFIG, "sys.user.initPassword");

// 示例:删除用户昵称缓存
CacheUtils.evict(CacheNames.SYS_NICKNAME, userId);

// 示例:删除字典缓存
CacheUtils.evict(CacheNames.SYS_DICT, "sys_user_sex");
```

**清空缓存组:**

```java
/**
 * 清空整个缓存组
 * @param cacheNames 缓存名称
 */
CacheUtils.clear(CacheNames.SYS_CONFIG);

// 示例:清空所有字典缓存
CacheUtils.clear(CacheNames.SYS_DICT);
CacheUtils.clear(CacheNames.SYS_DICT_TYPE);

// 示例:重置字典缓存 (服务层方法)
public void resetDictCache() {
    CacheUtils.clear(CacheNames.SYS_DICT);
    CacheUtils.clear(CacheNames.SYS_DICT_TYPE);
}
```

### 高级操作

**批量删除缓存:**

```java
/**
 * 批量删除缓存 (自定义实现)
 */
public void evictMultiple(String cacheNames, Collection<Object> keys) {
    for (Object key : keys) {
        CacheUtils.evict(cacheNames, key);
    }
}

// 示例:批量删除用户缓存
List<Long> userIds = Arrays.asList(1L, 2L, 3L);
userIds.forEach(userId -> {
    CacheUtils.evict(CacheNames.SYS_USER_NAME, userId);
    CacheUtils.evict(CacheNames.SYS_NICKNAME, userId);
    CacheUtils.evict(CacheNames.SYS_AVATAR, userId);
});
```

**条件性缓存操作:**

```java
/**
 * 条件性更新缓存
 */
public void updateUserCache(Long userId, SysUser user) {
    // 只有昵称发生变化时才更新缓存
    String oldNickname = CacheUtils.get(CacheNames.SYS_NICKNAME, userId);
    if (!Objects.equals(oldNickname, user.getNickName())) {
        CacheUtils.put(CacheNames.SYS_NICKNAME, userId, user.getNickName());
    }

    // 只有头像发生变化时才更新缓存
    String oldAvatar = CacheUtils.get(CacheNames.SYS_AVATAR, userId);
    if (!Objects.equals(oldAvatar, user.getAvatar())) {
        CacheUtils.put(CacheNames.SYS_AVATAR, userId, user.getAvatar());
    }
}
```

**缓存预热:**

```java
/**
 * 缓存预热 - 应用启动时加载热点数据
 */
@PostConstruct
public void initCache() {
    // 预热系统配置
    List<SysConfig> configs = configDao.list();
    configs.forEach(config -> {
        CacheUtils.put(CacheNames.SYS_CONFIG, config.getConfigKey(), config.getConfigValue());
    });

    // 预热数据字典
    List<SysDictType> dictTypes = dictTypeDao.list();
    dictTypes.forEach(dictType -> {
        List<SysDictDataVo> dictDataList = listDictDataByType(dictType.getDictType());
        CacheUtils.put(CacheNames.SYS_DICT, dictType.getDictType(), dictDataList);
    });

    log.info("缓存预热完成: 配置项{}个, 字典{}个", configs.size(), dictTypes.size());
}
```

## RedisUtils 工具类使用

RedisUtils 基于 Redisson 客户端,提供更底层的 Redis 操作能力。

### String 操作

**基本存取:**

```java
// 永久缓存
RedisUtils.setCacheObject("user:token:" + userId, token);

// 带过期时间缓存
RedisUtils.setCacheObject("sms:code:" + phone, code, Duration.ofMinutes(5));

// 获取缓存
String token = RedisUtils.getCacheObject("user:token:" + userId);

// 删除缓存
RedisUtils.deleteObject("user:token:" + userId);
```

**保留 TTL 的更新:**

```java
// 更新值但保留原有过期时间 (需要 Redis 6.0+)
RedisUtils.setCacheObject("user:token:" + userId, newToken, true);

// 如果 Redis 版本 < 6.0,会自动降级为:
// 1. 获取原有 TTL
// 2. 设置新值时使用原有 TTL
```

**条件设置:**

```java
// 仅当 key 不存在时设置 (分布式锁场景)
boolean success = RedisUtils.setObjectIfAbsent(
    "lock:order:" + orderId,
    Thread.currentThread().getId(),
    Duration.ofSeconds(30)
);

if (success) {
    try {
        // 执行业务逻辑
        processOrder(orderId);
    } finally {
        // 释放锁
        RedisUtils.deleteObject("lock:order:" + orderId);
    }
}

// 仅当 key 存在时设置
boolean updated = RedisUtils.setObjectIfExists(
    "user:session:" + sessionId,
    newSessionData,
    Duration.ofMinutes(30)
);
```

**过期时间操作:**

```java
// 获取剩余存活时间 (毫秒)
long ttl = RedisUtils.getTimeToLive("user:token:" + userId);
if (ttl > 0 && ttl < 300000) { // 剩余时间 < 5分钟
    // 续期
    RedisUtils.expire("user:token:" + userId, Duration.ofMinutes(30));
}

// 设置过期时间
RedisUtils.expire("cache:data:" + key, 3600); // 秒
RedisUtils.expire("cache:data:" + key, Duration.ofHours(1)); // Duration

// 检查 key 是否存在
boolean exists = RedisUtils.isExistsObject("user:token:" + userId);
```

### List 操作

**列表缓存:**

```java
// 缓存完整列表
List<String> messageList = Arrays.asList("msg1", "msg2", "msg3");
RedisUtils.setCacheList("user:messages:" + userId, messageList);

// 缓存列表并设置过期时间
RedisUtils.setCacheList("user:notifications:" + userId, notificationList, Duration.ofDays(7));

// 追加单个元素
RedisUtils.addCacheList("user:messages:" + userId, "new message");

// 获取完整列表
List<String> messages = RedisUtils.getCacheList("user:messages:" + userId);

// 获取指定范围
List<String> recentMessages = RedisUtils.getCacheListRange("user:messages:" + userId, 0, 9);
```

**消息队列场景:**

```java
// 生产者 - 追加消息
public void sendMessage(Long userId, String message) {
    RedisUtils.addCacheList("mq:user:" + userId, message);
}

// 消费者 - 读取消息
public List<String> consumeMessages(Long userId, int batchSize) {
    return RedisUtils.getCacheListRange("mq:user:" + userId, 0, batchSize - 1);
}
```

### Set 操作

**集合缓存:**

```java
// 缓存集合
Set<Long> userIds = new HashSet<>(Arrays.asList(1L, 2L, 3L));
RedisUtils.setCacheSet("online:users", userIds);

// 添加单个元素
boolean added = RedisUtils.addCacheSet("online:users", 4L);

// 获取集合
Set<Long> onlineUsers = RedisUtils.getCacheSet("online:users");

// 检查元素是否存在 (通过 Redisson API)
RSet<Long> rSet = RedisUtils.getClient().getSet("online:users");
boolean isOnline = rSet.contains(userId);
```

**用户标签场景:**

```java
// 添加用户标签
public void addUserTag(Long userId, String tag) {
    RedisUtils.addCacheSet("user:tags:" + userId, tag);
}

// 获取用户所有标签
public Set<String> getUserTags(Long userId) {
    return RedisUtils.getCacheSet("user:tags:" + userId);
}

// 检查用户是否有某个标签
public boolean hasTag(Long userId, String tag) {
    RSet<String> tags = RedisUtils.getClient().getSet("user:tags:" + userId);
    return tags.contains(tag);
}
```

### Map 操作

**Hash 缓存:**

```java
// 缓存整个 Map
Map<String, Object> userInfo = new HashMap<>();
userInfo.put("name", "张三");
userInfo.put("age", 25);
userInfo.put("email", "zhangsan@example.com");
RedisUtils.setCacheMap("user:info:" + userId, userInfo);

// 获取整个 Map
Map<String, Object> info = RedisUtils.getCacheMap("user:info:" + userId);

// 设置单个字段
RedisUtils.setCacheMapValue("user:info:" + userId, "phone", "13800138000");

// 获取单个字段
String phone = RedisUtils.getCacheMapValue("user:info:" + userId, "phone");

// 删除单个字段
RedisUtils.delCacheMapValue("user:info:" + userId, "email");

// 批量获取字段
Set<String> fields = new HashSet<>(Arrays.asList("name", "age"));
Map<String, Object> partialInfo = RedisUtils.getMultiCacheMapValue("user:info:" + userId, fields);

// 批量删除字段
Set<String> fieldsToDelete = new HashSet<>(Arrays.asList("email", "phone"));
RedisUtils.delMultiCacheMapValue("user:info:" + userId, fieldsToDelete);
```

**购物车场景:**

```java
// 添加商品到购物车
public void addToCart(Long userId, Long productId, Integer quantity) {
    RedisUtils.setCacheMapValue("cart:" + userId, productId.toString(), quantity);
}

// 获取购物车商品数量
public Integer getCartItemCount(Long userId, Long productId) {
    return RedisUtils.getCacheMapValue("cart:" + userId, productId.toString());
}

// 获取整个购物车
public Map<String, Integer> getCart(Long userId) {
    return RedisUtils.getCacheMap("cart:" + userId);
}

// 清空购物车
public void clearCart(Long userId) {
    RedisUtils.deleteObject("cart:" + userId);
}
```

### 原子操作

**计数器:**

```java
// 初始化计数器
RedisUtils.setAtomicValue("counter:page:views:" + pageId, 0L);

// 递增
long views = RedisUtils.incrAtomicValue("counter:page:views:" + pageId);

// 递减
long stock = RedisUtils.decrAtomicValue("stock:product:" + productId);

// 获取当前值
long currentViews = RedisUtils.getAtomicValue("counter:page:views:" + pageId);
```

**限流场景:**

```java
// 用户操作计数
public boolean checkUserActionLimit(Long userId, String action, int maxCount) {
    String key = "limit:" + action + ":" + userId;
    long count = RedisUtils.incrAtomicValue(key);

    // 第一次访问时设置过期时间
    if (count == 1) {
        RedisUtils.expire(key, Duration.ofMinutes(1));
    }

    return count <= maxCount;
}
```

### 限流控制

**基于令牌桶的限流:**

```java
// 限流配置: 每秒允许 10 次请求
long permits = RedisUtils.rateLimiter(
    "ratelimit:api:" + apiPath,
    RateType.OVERALL,      // 全局限流
    10,                    // 速率: 10次
    1                      // 时间间隔: 1秒
);

if (permits >= 0) {
    // 通过限流检查,剩余令牌数: permits
    processRequest();
} else {
    // 触发限流
    throw new ServiceException("请求过于频繁,请稍后再试");
}

// 带超时的限流
long permits = RedisUtils.rateLimiter(
    "ratelimit:api:" + apiPath,
    RateType.PER_CLIENT,   // 客户端级别限流
    5,                     // 速率: 5次
    1,                     // 时间间隔: 1秒
    3                      // 超时: 3秒
);
```

**接口限流示例:**

```java
@RestController
public class ApiController {

    /**
     * 限流保护的 API 接口
     */
    @GetMapping("/api/data")
    public R<List<DataVo>> getData() {
        // 限流检查: 每个用户每秒最多 5 次请求
        Long userId = LoginHelper.getUserId();
        long permits = RedisUtils.rateLimiter(
            "ratelimit:api:getData:" + userId,
            RateType.PER_CLIENT,
            5,
            1
        );

        if (permits < 0) {
            return R.fail("请求过于频繁,请稍后再试");
        }

        // 执行业务逻辑
        List<DataVo> dataList = dataService.list();
        return R.ok(dataList);
    }
}
```

### 发布订阅

**基本用法:**

```java
// 订阅消息
RedisUtils.subscribe("channel:system:notice", String.class, message -> {
    log.info("收到系统通知: {}", message);
    // 处理通知消息
    handleSystemNotice(message);
});

// 发布消息
RedisUtils.publish("channel:system:notice", "系统将于今晚22:00进行维护");

// 发布消息并执行自定义处理
RedisUtils.publish("channel:cache:refresh", "SYS_DICT", cacheName -> {
    log.info("触发缓存刷新: {}", cacheName);
    CacheUtils.clear(cacheName);
});
```

**实时消息推送:**

```java
/**
 * 用户消息推送服务
 */
@Service
public class UserMessageService {

    @PostConstruct
    public void init() {
        // 订阅用户消息频道
        RedisUtils.subscribe("channel:user:message", UserMessage.class, this::handleMessage);
    }

    /**
     * 发送消息给用户
     */
    public void sendMessage(Long userId, String content) {
        UserMessage message = new UserMessage();
        message.setUserId(userId);
        message.setContent(content);
        message.setTimestamp(System.currentTimeMillis());

        // 发布到消息频道
        RedisUtils.publish("channel:user:message", message);
    }

    /**
     * 处理接收到的消息
     */
    private void handleMessage(UserMessage message) {
        log.info("用户 {} 收到消息: {}", message.getUserId(), message.getContent());

        // 推送给在线用户 (WebSocket/SSE)
        messageNotifyService.notifyUser(message.getUserId(), message);
    }
}
```

### Key 管理

**模式匹配查询:**

```java
// 查询所有用户 token
Collection<String> tokenKeys = RedisUtils.keys("user:token:*");

// 查询指定前缀的 key
Collection<String> cacheKeys = RedisUtils.keys("cache:*");

// 高级扫描参数
KeysScanOptions options = KeysScanOptions.defaults()
    .pattern("session:*")    // 匹配模式
    .chunkSize(1000)         // 每次扫描块大小
    .limit(10000);           // 限制返回数量

Collection<String> sessionKeys = RedisUtils.keys(options);
```

**批量删除:**

```java
// 删除所有匹配的 key (谨慎使用!)
RedisUtils.deleteKeys("temp:*");

// 示例:清理过期会话
public void cleanExpiredSessions() {
    // 查找所有会话 key
    Collection<String> sessionKeys = RedisUtils.keys("session:*");

    // 检查并删除过期会话
    for (String key : sessionKeys) {
        long ttl = RedisUtils.getTimeToLive(key);
        if (ttl == -2) { // key 不存在
            RedisUtils.deleteObject(key);
        }
    }
}
```

**分布式锁:**

```java
// 获取锁对象
RLock lock = RedisUtils.getLock("lock:order:" + orderId);

try {
    // 尝试加锁,最多等待 10 秒,锁定 30 秒后自动释放
    boolean locked = lock.tryLock(10, 30, TimeUnit.SECONDS);

    if (locked) {
        try {
            // 执行业务逻辑
            processOrder(orderId);
        } finally {
            // 释放锁
            lock.unlock();
        }
    } else {
        throw new ServiceException("获取锁失败,订单正在处理中");
    }
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    throw new ServiceException("获取锁被中断");
}
```

## 缓存最佳实践

### 1. 缓存粒度选择

**细粒度缓存 vs 粗粒度缓存:**

```java
// ❌ 粗粒度缓存 - 缓存整个用户对象
@Cacheable(cacheNames = "user", key = "#userId")
public SysUser getUserById(Long userId) {
    return userDao.getById(userId);
}
// 问题:
// 1. 更新任何字段都需要清除整个缓存
// 2. 浪费内存存储不常用的字段
// 3. 缓存失效影响范围大

// ✅ 细粒度缓存 - 分别缓存常用字段
@Cacheable(cacheNames = CacheNames.SYS_USER_NAME, key = "#userId")
public String getUserName(Long userId) {
    SysUser user = userDao.getById(userId);
    return user != null ? user.getUserName() : null;
}

@Cacheable(cacheNames = CacheNames.SYS_NICKNAME, key = "#userId")
public String getNickname(Long userId) {
    SysUser user = userDao.getById(userId);
    return user != null ? user.getNickName() : null;
}

@Cacheable(cacheNames = CacheNames.SYS_AVATAR, key = "#userId")
public String getAvatar(Long userId) {
    SysUser user = userDao.getById(userId);
    return user != null ? user.getAvatar() : null;
}
// 优点:
// 1. 更新昵称只需清除昵称缓存
// 2. 节省内存,只缓存需要的字段
// 3. 缓存失效影响范围小
```

### 2. 缓存 Key 设计

**良好的 Key 命名规范:**

```java
// ✅ 推荐的 Key 格式: 业务模块:操作对象:唯一标识
"sys_config:initPassword"           // 系统配置
"sys_dict:sys_user_sex"             // 数据字典
"sys_user:name:1001"                // 用户名称
"sys_dept:info:5"                   // 部门信息
"sys_role:custom:10"                // 角色自定义权限

// ✅ 使用常量定义 CacheName
public interface CacheNames {
    String SYS_CONFIG = "sys_config#5d#2d#500";
    String SYS_DICT = "sys_dict#1d#12h#1000";
    String SYS_USER_NAME = "sys_user_name#5d#2d#5000";
}

// ✅ 在代码中使用
@Cacheable(cacheNames = CacheNames.SYS_CONFIG, key = "#configKey")

// ❌ 避免硬编码
@Cacheable(cacheNames = "config", key = "#configKey")  // 不推荐
```

**Key 唯一性保证:**

```java
// ✅ 使用唯一标识作为 key
@Cacheable(cacheNames = CacheNames.SYS_USER_NAME, key = "#userId")
public String getUserName(Long userId) { ... }

// ✅ 组合多个参数作为 key
@Cacheable(cacheNames = "query_result", key = "#type + ':' + #status")
public List<DataVo> queryByTypeAndStatus(String type, Integer status) { ... }

// ✅ 使用 SpEL 表达式生成复杂 key
@Cacheable(cacheNames = "user_permission",
           key = "#userId + ':' + #resource + ':' + #action")
public boolean hasPermission(Long userId, String resource, String action) { ... }

// ❌ 避免 key 冲突
@Cacheable(cacheNames = "data", key = "#type")  // 不同对象可能重名!
```

### 3. 缓存过期时间设置

**根据数据特性设置合理的过期时间:**

```java
// ✅ 长期稳定数据 - 长过期时间
String SYS_CONFIG = "sys_config#5d#2d#500";     // 5天过期
String SYS_TENANT = "sys_tenant#5d#2d#100";     // 5天过期

// ✅ 中等变化数据 - 中等过期时间
String SYS_DICT = "sys_dict#1d#12h#1000";       // 1天过期
String SYS_USER_NAME = "sys_user_name#5d#2d#5000";  // 5天过期

// ✅ 频繁变化数据 - 短过期时间
String SYS_OSS_DIRECTORY = "sys_oss_directory#10s#5s#500";  // 10秒过期
String HOME_STATISTICS = "home_statistics#20s#10s#100";     // 20秒过期

// ✅ 临时数据 - 极短过期时间
String SMS_CODE = "sms_code#5m#0#1000";         // 5分钟过期
String CAPTCHA = "captcha#2m#0#1000";           // 2分钟过期
```

**动态调整过期时间:**

```java
/**
 * 根据访问频率动态调整缓存时间
 */
public void setCacheWithDynamicTTL(String key, Object value, long accessCount) {
    Duration ttl;
    if (accessCount > 1000) {
        ttl = Duration.ofHours(24);    // 高频访问,缓存24小时
    } else if (accessCount > 100) {
        ttl = Duration.ofHours(6);     // 中频访问,缓存6小时
    } else {
        ttl = Duration.ofHours(1);     // 低频访问,缓存1小时
    }
    RedisUtils.setCacheObject(key, value, ttl);
}
```

### 4. 缓存穿透防护

**空值缓存:**

```java
// ✅ 缓存空结果,防止缓存穿透
@Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
@Override
public List<SysDictDataVo> listDictDataByType(String dictType) {
    if (StringUtils.isBlank(dictType)) {
        return Collections.emptyList();  // 返回空列表而不是 null
    }

    List<SysDictData> dictDataList = dictDataDao.listDictDataByType(dictType);
    if (CollUtil.isEmpty(dictDataList)) {
        // 即使查询结果为空,也缓存空列表,防止缓存穿透
        return Collections.emptyList();
    }
    return MapstructUtils.convert(dictDataList, SysDictDataVo.class);
}

// ✅ 新增数据时缓存空值
@CachePut(cacheNames = CacheNames.SYS_DICT, key = "#bo.dictType")
@Override
public List<SysDictDataVo> insertDictType(SysDictTypeBo bo) {
    SysDictType dictType = MapstructUtils.convert(bo, SysDictType.class);
    boolean success = dictTypeDao.insert(dictType);
    if (success) {
        // 新增类型下无数据,返回空列表防止缓存穿透
        return Collections.emptyList();
    }
    throw ServiceException.of("新增字典类型失败");
}
```

**布隆过滤器 (高级):**

```java
/**
 * 使用布隆过滤器防止缓存穿透
 */
@Service
public class UserService {

    private RBloomFilter<Long> userIdFilter;

    @PostConstruct
    public void init() {
        // 初始化布隆过滤器
        userIdFilter = RedisUtils.getClient().getBloomFilter("bloomfilter:userId");
        userIdFilter.tryInit(10000000L, 0.01);  // 预期元素数量,误判率

        // 加载所有用户ID到布隆过滤器
        List<Long> userIds = userDao.listAllUserIds();
        userIds.forEach(userIdFilter::add);
    }

    public SysUserVo getUser(Long userId) {
        // 先检查布隆过滤器
        if (!userIdFilter.contains(userId)) {
            // 不存在,直接返回 null,避免查询数据库
            return null;
        }

        // 可能存在,继续查询缓存和数据库
        SysUserVo user = CacheUtils.get(CacheNames.SYS_USER, userId);
        if (user == null) {
            user = userDao.getById(userId);
            if (user != null) {
                CacheUtils.put(CacheNames.SYS_USER, userId, user);
            }
        }
        return user;
    }
}
```

### 5. 缓存雪崩防护

**过期时间加随机值:**

```java
/**
 * 批量缓存数据时,添加随机过期时间,避免同时失效
 */
public void batchCacheDictData() {
    List<SysDictType> dictTypes = dictTypeDao.list();

    for (SysDictType dictType : dictTypes) {
        List<SysDictDataVo> dataList = listDictDataByType(dictType.getDictType());

        // 基础过期时间 1 天
        long baseTTL = Duration.ofDays(1).getSeconds();
        // 添加随机时间 0-2 小时
        long randomSeconds = ThreadLocalRandom.current().nextLong(0, 7200);
        Duration ttl = Duration.ofSeconds(baseTTL + randomSeconds);

        // 使用 RedisUtils 直接设置缓存
        RedisUtils.setCacheObject("sys_dict:" + dictType.getDictType(), dataList, ttl);
    }
}
```

**缓存预热:**

```java
/**
 * 应用启动时预热缓存,避免启动后大量缓存失效
 */
@Component
public class CacheWarmUpRunner implements CommandLineRunner {

    @Autowired
    private SysDictTypeService dictTypeService;

    @Autowired
    private SysConfigService configService;

    @Override
    public void run(String... args) {
        log.info("开始缓存预热...");

        // 预热系统配置
        warmUpConfig();

        // 预热数据字典
        warmUpDict();

        log.info("缓存预热完成");
    }

    private void warmUpConfig() {
        List<SysConfig> configs = configService.listAll();
        configs.forEach(config -> {
            CacheUtils.put(CacheNames.SYS_CONFIG, config.getConfigKey(), config.getConfigValue());
        });
        log.info("预热系统配置: {} 个", configs.size());
    }

    private void warmUpDict() {
        List<String> dictTypes = dictTypeService.listAllDictTypes();
        dictTypes.forEach(dictType -> {
            List<SysDictDataVo> dataList = dictTypeService.listDictDataByType(dictType);
            CacheUtils.put(CacheNames.SYS_DICT, dictType, dataList);
        });
        log.info("预热数据字典: {} 个", dictTypes.size());
    }
}
```

### 6. 缓存更新策略

**Cache-Aside 模式 (旁路缓存):**

```java
/**
 * 读操作: 先查缓存,未命中再查数据库
 */
public SysConfigVo getConfig(String configKey) {
    // 1. 查询缓存
    String configValue = CacheUtils.get(CacheNames.SYS_CONFIG, configKey);
    if (configValue != null) {
        return new SysConfigVo(configKey, configValue);
    }

    // 2. 缓存未命中,查询数据库
    SysConfig config = configDao.getByConfigKey(configKey);
    if (config == null) {
        return null;
    }

    // 3. 写入缓存
    CacheUtils.put(CacheNames.SYS_CONFIG, configKey, config.getConfigValue());

    return MapstructUtils.convert(config, SysConfigVo.class);
}

/**
 * 写操作: 先更新数据库,再删除缓存
 */
@CacheEvict(cacheNames = CacheNames.SYS_CONFIG, key = "#bo.configKey")
public boolean updateConfig(SysConfigBo bo) {
    SysConfig config = MapstructUtils.convert(bo, SysConfig.class);
    // 1. 更新数据库
    boolean success = configDao.updateById(config);
    // 2. @CacheEvict 自动删除缓存
    return success;
}
```

**Write-Through 模式 (直写缓存):**

```java
/**
 * 写操作: 同时更新数据库和缓存
 */
@CachePut(cacheNames = CacheNames.SYS_CONFIG, key = "#bo.configKey")
public String updateConfigValue(SysConfigBo bo) {
    SysConfig config = MapstructUtils.convert(bo, SysConfig.class);
    // 1. 更新数据库
    boolean success = configDao.updateById(config);
    if (!success) {
        throw ServiceException.of("更新配置失败");
    }
    // 2. @CachePut 自动更新缓存
    return config.getConfigValue();
}
```

**延迟双删策略:**

```java
/**
 * 延迟双删 - 解决数据库主从延迟导致的缓存不一致
 */
@Transactional(rollbackFor = Exception.class)
public boolean updateUser(SysUserBo bo) {
    Long userId = bo.getUserId();

    // 1. 第一次删除缓存
    CacheUtils.evict(CacheNames.SYS_USER_NAME, userId);
    CacheUtils.evict(CacheNames.SYS_NICKNAME, userId);

    // 2. 更新数据库
    SysUser user = MapstructUtils.convert(bo, SysUser.class);
    boolean success = userDao.updateById(user);

    if (success) {
        // 3. 延迟第二次删除缓存 (异步)
        CompletableFuture.runAsync(() -> {
            try {
                // 延迟 500ms,等待主从同步
                Thread.sleep(500);
                CacheUtils.evict(CacheNames.SYS_USER_NAME, userId);
                CacheUtils.evict(CacheNames.SYS_NICKNAME, userId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("延迟删除缓存失败", e);
            }
        });
    }

    return success;
}
```

### 7. 批量操作优化

**批量查询缓存:**

```java
/**
 * 批量获取用户昵称
 */
public Map<Long, String> batchGetNicknames(List<Long> userIds) {
    Map<Long, String> resultMap = new HashMap<>();
    List<Long> missedIds = new ArrayList<>();

    // 1. 批量查询缓存
    for (Long userId : userIds) {
        String nickname = CacheUtils.get(CacheNames.SYS_NICKNAME, userId);
        if (nickname != null) {
            resultMap.put(userId, nickname);
        } else {
            missedIds.add(userId);
        }
    }

    // 2. 缓存未命中的从数据库查询
    if (!missedIds.isEmpty()) {
        List<SysUser> users = userDao.listByIds(missedIds);
        for (SysUser user : users) {
            resultMap.put(user.getUserId(), user.getNickName());
            // 3. 回填缓存
            CacheUtils.put(CacheNames.SYS_NICKNAME, user.getUserId(), user.getNickName());
        }
    }

    return resultMap;
}
```

**批量更新缓存:**

```java
/**
 * 批量更新用户缓存
 */
public void batchUpdateUserCache(List<SysUser> users) {
    // 使用 Redisson 批量操作提升性能
    RBatch batch = RedisUtils.getClient().createBatch();

    for (SysUser user : users) {
        String nameKey = "sys_user_name:" + user.getUserId();
        String nicknameKey = "sys_nickname:" + user.getUserId();
        String avatarKey = "sys_avatar:" + user.getUserId();

        batch.getBucket(nameKey).setAsync(user.getUserName(), Duration.ofDays(5));
        batch.getBucket(nicknameKey).setAsync(user.getNickName(), Duration.ofDays(5));
        batch.getBucket(avatarKey).setAsync(user.getAvatar(), Duration.ofDays(5));
    }

    // 批量执行
    batch.execute();

    log.info("批量更新用户缓存: {} 个", users.size());
}
```

### 8. 缓存监控

**自定义缓存统计:**

```java
/**
 * 缓存统计信息
 */
@Service
public class CacheStatisticsService {

    private final AtomicLong hitCount = new AtomicLong(0);
    private final AtomicLong missCount = new AtomicLong(0);

    /**
     * 记录缓存命中
     */
    public void recordHit(String cacheName) {
        hitCount.incrementAndGet();
        log.debug("缓存命中: {}", cacheName);
    }

    /**
     * 记录缓存未命中
     */
    public void recordMiss(String cacheName) {
        missCount.incrementAndGet();
        log.debug("缓存未命中: {}", cacheName);
    }

    /**
     * 获取缓存命中率
     */
    public double getHitRate() {
        long total = hitCount.get() + missCount.get();
        if (total == 0) {
            return 0.0;
        }
        return (double) hitCount.get() / total * 100;
    }

    /**
     * 重置统计信息
     */
    public void reset() {
        hitCount.set(0);
        missCount.set(0);
    }

    /**
     * 获取统计报告
     */
    public String getStatisticsReport() {
        long hit = hitCount.get();
        long miss = missCount.get();
        long total = hit + miss;
        double hitRate = getHitRate();

        return String.format(
            "缓存统计: 总请求=%d, 命中=%d, 未命中=%d, 命中率=%.2f%%",
            total, hit, miss, hitRate
        );
    }
}

/**
 * 带统计的缓存查询
 */
public String getConfigWithStats(String configKey) {
    String value = CacheUtils.get(CacheNames.SYS_CONFIG, configKey);

    if (value != null) {
        cacheStatisticsService.recordHit(CacheNames.SYS_CONFIG);
        return value;
    }

    cacheStatisticsService.recordMiss(CacheNames.SYS_CONFIG);

    SysConfig config = configDao.getByConfigKey(configKey);
    if (config != null) {
        CacheUtils.put(CacheNames.SYS_CONFIG, configKey, config.getConfigValue());
        return config.getConfigValue();
    }

    return null;
}
```

**定时输出缓存统计:**

```java
/**
 * 定时输出缓存统计报告
 */
@Component
public class CacheStatisticsTask {

    @Autowired
    private CacheStatisticsService statisticsService;

    /**
     * 每小时输出一次缓存统计
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void reportStatistics() {
        String report = statisticsService.getStatisticsReport();
        log.info(report);

        // 输出到监控系统 (如: Prometheus, Grafana)
        // metricsService.recordCacheHitRate(statisticsService.getHitRate());
    }
}
```

## 缓存配置优化

### Caffeine 本地缓存配置

**application.yml 配置:**

```yaml
# Caffeine 本地缓存配置
spring:
  cache:
    type: caffeine
    caffeine:
      # 初始容量
      initial-capacity: 100
      # 最大容量
      maximum-size: 1000
      # 写入后过期时间 (秒)
      expire-after-write: 30
      # 访问后过期时间 (秒)
      expire-after-access: 120
```

**Java 配置:**

```java
@Configuration
public class CaffeineConfig {

    /**
     * Caffeine 缓存实例
     */
    @Bean
    public Cache<Object, Object> caffeine() {
        return Caffeine.newBuilder()
            // 初始容量
            .initialCapacity(100)
            // 最大容量 (基于容量淘汰)
            .maximumSize(1000)
            // 写入后过期时间
            .expireAfterWrite(30, TimeUnit.SECONDS)
            // 访问后过期时间
            .expireAfterAccess(120, TimeUnit.SECONDS)
            // 移除监听器
            .removalListener((key, value, cause) -> {
                log.debug("Caffeine 缓存移除: key={}, cause={}", key, cause);
            })
            // 启用统计
            .recordStats()
            .build();
    }
}
```

### Redisson 配置优化

**application.yml 配置:**

```yaml
# Redisson 配置
redisson:
  # 单机模式
  single-server-config:
    # 连接地址
    address: redis://127.0.0.1:6379
    # 数据库索引
    database: 0
    # 连接池大小
    connection-pool-size: 64
    # 最小空闲连接数
    connection-minimum-idle-size: 10
    # 连接超时 (毫秒)
    connect-timeout: 3000
    # 响应超时 (毫秒)
    timeout: 3000
    # 重试次数
    retry-attempts: 3
    # 重试间隔 (毫秒)
    retry-interval: 1500

  # 集群模式
  cluster-servers-config:
    # 节点地址
    node-addresses:
      - redis://127.0.0.1:7001
      - redis://127.0.0.1:7002
      - redis://127.0.0.1:7003
    # 扫描间隔 (毫秒)
    scan-interval: 2000
    # 主节点连接池大小
    master-connection-pool-size: 64
    # 从节点连接池大小
    slave-connection-pool-size: 64
    # 读取模式: MASTER (主节点), SLAVE (从节点), MASTER_SLAVE (主从节点)
    read-mode: SLAVE
```

### 缓存大小限制

**基于容量淘汰:**

```java
// CacheNames 配置中指定 maxSize
String SYS_CONFIG = "sys_config#5d#2d#500";  // 最多 500 个
String SYS_DICT = "sys_dict#1d#12h#1000";    // 最多 1000 个
String SYS_NICKNAME = "sys_nickname#5d#2d#5000";  // 最多 5000 个
```

**基于内存淘汰:**

```java
/**
 * Caffeine 基于内存大小淘汰
 */
@Bean
public Cache<Object, Object> caffeineByWeight() {
    return Caffeine.newBuilder()
        // 最大权重 (字节数)
        .maximumWeight(10_000_000)  // 10 MB
        // 权重计算器
        .weigher((key, value) -> {
            // 估算对象大小
            int keySize = key.toString().length();
            int valueSize = estimateSize(value);
            return keySize + valueSize;
        })
        .build();
}

private int estimateSize(Object value) {
    if (value == null) return 0;
    if (value instanceof String) {
        return ((String) value).length() * 2;  // 字符占 2 字节
    }
    // 其他类型估算
    return 100;  // 默认 100 字节
}
```

### 缓存预热策略

**应用启动预热:**

```java
@Component
public class CacheWarmUpInitializer implements ApplicationListener<ContextRefreshedEvent> {

    @Autowired
    private SysDictTypeService dictTypeService;

    @Autowired
    private SysConfigService configService;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (event.getApplicationContext().getParent() == null) {
            warmUpCache();
        }
    }

    private void warmUpCache() {
        log.info("开始预热缓存...");
        long startTime = System.currentTimeMillis();

        // 预热系统配置
        int configCount = warmUpConfig();

        // 预热数据字典
        int dictCount = warmUpDict();

        long elapsed = System.currentTimeMillis() - startTime;
        log.info("缓存预热完成: 配置{}个, 字典{}个, 耗时{}ms",
                 configCount, dictCount, elapsed);
    }

    private int warmUpConfig() {
        List<SysConfig> configs = configService.listAll();
        configs.forEach(config -> {
            CacheUtils.put(CacheNames.SYS_CONFIG,
                           config.getConfigKey(),
                           config.getConfigValue());
        });
        return configs.size();
    }

    private int warmUpDict() {
        List<SysDictType> dictTypes = dictTypeService.listAll();
        dictTypes.forEach(dictType -> {
            List<SysDictDataVo> dataList =
                dictTypeService.listDictDataByType(dictType.getDictType());
            CacheUtils.put(CacheNames.SYS_DICT, dictType.getDictType(), dataList);
        });
        return dictTypes.size();
    }
}
```

**定时刷新缓存:**

```java
/**
 * 定时刷新热点数据缓存
 */
@Component
public class CacheRefreshTask {

    @Autowired
    private SysDictTypeService dictTypeService;

    /**
     * 每天凌晨 2 点刷新字典缓存
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void refreshDictCache() {
        log.info("开始刷新字典缓存...");

        List<SysDictType> dictTypes = dictTypeService.listAll();
        for (SysDictType dictType : dictTypes) {
            List<SysDictDataVo> dataList =
                dictTypeService.listDictDataByType(dictType.getDictType());
            CacheUtils.put(CacheNames.SYS_DICT, dictType.getDictType(), dataList);
        }

        log.info("字典缓存刷新完成: {} 个", dictTypes.size());
    }

    /**
     * 每小时刷新统计数据缓存
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void refreshStatisticsCache() {
        log.info("开始刷新统计数据缓存...");

        // 刷新首页统计数据
        CacheUtils.clear(CacheNames.HOME_STATISTICS);

        log.info("统计数据缓存刷新完成");
    }
}
```

## 性能监控与诊断

### 缓存命中率监控

**Caffeine 统计信息:**

```java
/**
 * 获取 Caffeine 缓存统计
 */
@Service
public class CaffeineMonitorService {

    @Autowired
    private Cache<Object, Object> caffeine;

    /**
     * 获取缓存统计信息
     */
    public CacheStats getCacheStats() {
        return caffeine.stats();
    }

    /**
     * 输出缓存统计报告
     */
    public void printStats() {
        CacheStats stats = caffeine.stats();

        log.info("Caffeine 缓存统计:");
        log.info("  命中次数: {}", stats.hitCount());
        log.info("  未命中次数: {}", stats.missCount());
        log.info("  命中率: {:.2f}%", stats.hitRate() * 100);
        log.info("  驱逐次数: {}", stats.evictionCount());
        log.info("  加载成功次数: {}", stats.loadSuccessCount());
        log.info("  加载失败次数: {}", stats.loadFailureCount());
        log.info("  平均加载时间: {}ns", stats.averageLoadPenalty());
    }
}
```

**Redis 监控:**

```java
/**
 * Redis 监控服务
 */
@Service
public class RedisMonitorService {

    /**
     * 获取 Redis 信息
     */
    public Map<String, String> getRedisInfo() {
        RedissonClient client = RedisUtils.getClient();
        RKeys keys = client.getKeys();

        Map<String, String> info = new HashMap<>();
        info.put("dbSize", String.valueOf(keys.count()));
        // 更多统计信息...

        return info;
    }

    /**
     * 获取缓存 Key 数量
     */
    public long getCacheKeyCount(String pattern) {
        Collection<String> keys = RedisUtils.keys(pattern);
        return keys.size();
    }

    /**
     * 获取缓存内存使用情况
     */
    public String getCacheMemoryUsage() {
        RedissonClient client = RedisUtils.getClient();
        // 通过 Redisson 获取 Redis INFO 命令结果
        // ...
        return "Redis 内存使用: ...";
    }
}
```

### 慢查询监控

**缓存操作耗时监控:**

```java
/**
 * 缓存操作耗时监控
 */
@Aspect
@Component
public class CachePerformanceMonitor {

    private static final long SLOW_THRESHOLD = 100;  // 慢查询阈值 (毫秒)

    /**
     * 监控 @Cacheable 方法
     */
    @Around("@annotation(org.springframework.cache.annotation.Cacheable)")
    public Object monitorCacheable(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();

        try {
            return pjp.proceed();
        } finally {
            long elapsed = System.currentTimeMillis() - startTime;
            if (elapsed > SLOW_THRESHOLD) {
                String methodName = pjp.getSignature().toShortString();
                log.warn("缓存查询慢操作: 方法={}, 耗时={}ms", methodName, elapsed);
            }
        }
    }

    /**
     * 监控 CacheUtils 操作
     */
    @Around("execution(* plus.ruoyi.common.redis.utils.CacheUtils.*(..))")
    public Object monitorCacheUtils(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = pjp.getSignature().getName();

        try {
            return pjp.proceed();
        } finally {
            long elapsed = System.currentTimeMillis() - startTime;
            if (elapsed > SLOW_THRESHOLD) {
                Object[] args = pjp.getArgs();
                log.warn("CacheUtils 慢操作: 方法={}, 参数={}, 耗时={}ms",
                         methodName, Arrays.toString(args), elapsed);
            }
        }
    }
}
```

### 缓存大小监控

**监控缓存容量:**

```java
/**
 * 缓存容量监控
 */
@Service
public class CacheSizeMonitorService {

    /**
     * 获取指定缓存组的大小
     */
    public long getCacheSize(String cacheName) {
        String pattern = cacheName + ":*";
        Collection<String> keys = RedisUtils.keys(pattern);
        return keys.size();
    }

    /**
     * 获取所有缓存组的大小
     */
    public Map<String, Long> getAllCacheSizes() {
        Map<String, Long> sizeMap = new LinkedHashMap<>();

        sizeMap.put("SYS_CONFIG", getCacheSize("sys_config"));
        sizeMap.put("SYS_DICT", getCacheSize("sys_dict"));
        sizeMap.put("SYS_DICT_TYPE", getCacheSize("sys_dict_type"));
        sizeMap.put("SYS_USER_NAME", getCacheSize("sys_user_name"));
        sizeMap.put("SYS_NICKNAME", getCacheSize("sys_nickname"));
        sizeMap.put("SYS_AVATAR", getCacheSize("sys_avatar"));
        sizeMap.put("SYS_DEPT", getCacheSize("sys_dept"));

        return sizeMap;
    }

    /**
     * 检查缓存是否超限
     */
    @Scheduled(cron = "0 */10 * * * ?")  // 每10分钟检查一次
    public void checkCacheLimit() {
        Map<String, Long> sizeMap = getAllCacheSizes();

        sizeMap.forEach((name, size) -> {
            // 获取配置的最大大小
            long maxSize = getConfiguredMaxSize(name);
            if (size > maxSize * 0.8) {  // 超过 80% 发出警告
                log.warn("缓存容量警告: {} 当前大小={}, 最大大小={}, 使用率={:.2f}%",
                         name, size, maxSize, (double) size / maxSize * 100);
            }
        });
    }

    private long getConfiguredMaxSize(String cacheName) {
        // 从 CacheNames 常量解析最大大小
        // 例如: "sys_config#5d#2d#500" → 500
        switch (cacheName) {
            case "SYS_CONFIG": return 500;
            case "SYS_DICT": return 1000;
            case "SYS_DICT_TYPE": return 200;
            case "SYS_USER_NAME": return 5000;
            case "SYS_NICKNAME": return 5000;
            case "SYS_AVATAR": return 5000;
            case "SYS_DEPT": return 1000;
            default: return 1000;
        }
    }
}
```

## 常见问题

### 1. 缓存不生效

**问题原因:**

- Spring Cache 注解未生效 (方法内部调用)
- 缓存配置错误
- 缓存名称拼写错误
- 缓存过期时间设置过短

**解决方案:**

```java
// ❌ 错误: 内部方法调用,注解不生效
public class SysDictTypeServiceImpl implements ISysDictTypeService {

    public List<SysDictDataVo> queryDictData(String dictType) {
        // 直接调用本类方法,@Cacheable 不生效!
        return this.listDictDataByType(dictType);
    }

    @Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
    public List<SysDictDataVo> listDictDataByType(String dictType) {
        // ...
    }
}

// ✅ 正确: 通过 AOP 代理调用
public class SysDictTypeServiceImpl implements ISysDictTypeService {

    public List<SysDictDataVo> queryDictData(String dictType) {
        // 通过 Spring AOP 代理调用,注解生效!
        return SpringUtils.getAopProxy(this).listDictDataByType(dictType);
    }

    @Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
    public List<SysDictDataVo> listDictDataByType(String dictType) {
        // ...
    }
}

// ✅ 正确: 注入自己,通过代理调用
@Service
public class SysDictTypeServiceImpl implements ISysDictTypeService {

    @Autowired
    private ISysDictTypeService self;  // 注入接口,获取代理对象

    public List<SysDictDataVo> queryDictData(String dictType) {
        // 通过代理对象调用
        return self.listDictDataByType(dictType);
    }

    @Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
    public List<SysDictDataVo> listDictDataByType(String dictType) {
        // ...
    }
}
```

### 2. 缓存数据不一致

**问题原因:**

- 更新数据库后未清除缓存
- 主从数据库延迟
- 缓存更新失败

**解决方案:**

```java
// ✅ 方案1: 先更新数据库,再删除缓存
@CacheEvict(cacheNames = CacheNames.SYS_NICKNAME, key = "#user.userId")
@Transactional(rollbackFor = Exception.class)
public boolean updateUser(SysUser user) {
    // 1. 更新数据库
    boolean success = userDao.updateById(user);
    // 2. @CacheEvict 自动删除缓存
    return success;
}

// ✅ 方案2: 延迟双删,解决主从延迟
@Transactional(rollbackFor = Exception.class)
public boolean updateUserWithDoubleDelete(SysUser user) {
    Long userId = user.getUserId();

    // 1. 第一次删除缓存
    CacheUtils.evict(CacheNames.SYS_NICKNAME, userId);

    // 2. 更新数据库
    boolean success = userDao.updateById(user);

    if (success) {
        // 3. 延迟第二次删除
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(500);  // 等待主从同步
                CacheUtils.evict(CacheNames.SYS_NICKNAME, userId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    return success;
}

// ✅ 方案3: 使用 @CachePut 直接更新缓存
@CachePut(cacheNames = CacheNames.SYS_NICKNAME, key = "#user.userId")
@Transactional(rollbackFor = Exception.class)
public String updateUserNickname(SysUser user) {
    userDao.updateById(user);
    // 返回值会自动更新到缓存
    return user.getNickName();
}
```

### 3. 缓存雪崩

**问题原因:**

- 大量缓存同时过期
- 缓存服务宕机
- 缓存未预热

**解决方案:**

```java
// ✅ 方案1: 添加随机过期时间
public void batchCacheWithRandomTTL(Map<String, Object> dataMap) {
    for (Map.Entry<String, Object> entry : dataMap.entrySet()) {
        long baseTTL = Duration.ofHours(1).getSeconds();
        long randomSeconds = ThreadLocalRandom.current().nextLong(0, 600);  // 0-10分钟
        Duration ttl = Duration.ofSeconds(baseTTL + randomSeconds);

        RedisUtils.setCacheObject(entry.getKey(), entry.getValue(), ttl);
    }
}

// ✅ 方案2: 应用启动时预热缓存
@Component
public class CacheWarmUpRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        log.info("开始缓存预热...");
        // 预热热点数据
        warmUpHotData();
        log.info("缓存预热完成");
    }

    private void warmUpHotData() {
        // 预热系统配置
        List<SysConfig> configs = configDao.list();
        configs.forEach(config -> {
            CacheUtils.put(CacheNames.SYS_CONFIG,
                           config.getConfigKey(),
                           config.getConfigValue());
        });
    }
}

// ✅ 方案3: 缓存降级 - Redis 不可用时使用本地缓存
public String getConfigWithFallback(String configKey) {
    try {
        // 尝试从 Redis 获取
        String value = CacheUtils.get(CacheNames.SYS_CONFIG, configKey);
        if (value != null) {
            return value;
        }
    } catch (Exception e) {
        log.error("Redis 不可用,降级到本地缓存", e);
    }

    // 降级到本地缓存 (Caffeine)
    String value = localCache.get(configKey);
    if (value != null) {
        return value;
    }

    // 查询数据库
    SysConfig config = configDao.getByConfigKey(configKey);
    if (config != null) {
        // 同时更新本地缓存
        localCache.put(configKey, config.getConfigValue());
        return config.getConfigValue();
    }

    return null;
}
```

### 4. 缓存穿透

**问题原因:**

- 查询不存在的数据
- 恶意攻击

**解决方案:**

```java
// ✅ 方案1: 缓存空值
@Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
public List<SysDictDataVo> listDictDataByType(String dictType) {
    List<SysDictData> dataList = dictDataDao.listDictDataByType(dictType);
    if (CollUtil.isEmpty(dataList)) {
        // 即使查询结果为空,也缓存空列表
        return Collections.emptyList();
    }
    return MapstructUtils.convert(dataList, SysDictDataVo.class);
}

// ✅ 方案2: 布隆过滤器
@Service
public class UserServiceWithBloomFilter {

    private RBloomFilter<Long> userIdFilter;

    @PostConstruct
    public void init() {
        userIdFilter = RedisUtils.getClient().getBloomFilter("bloomfilter:userId");
        userIdFilter.tryInit(10000000L, 0.01);

        // 加载所有用户ID
        List<Long> userIds = userDao.listAllUserIds();
        userIds.forEach(userIdFilter::add);
    }

    public SysUserVo getUser(Long userId) {
        // 先检查布隆过滤器
        if (!userIdFilter.contains(userId)) {
            // 不存在,直接返回
            return null;
        }

        // 可能存在,继续查询
        SysUserVo user = CacheUtils.get("sys_user", userId);
        if (user == null) {
            SysUser entity = userDao.getById(userId);
            if (entity != null) {
                user = MapstructUtils.convert(entity, SysUserVo.class);
                CacheUtils.put("sys_user", userId, user);
            }
        }
        return user;
    }

    /**
     * 新增用户时添加到布隆过滤器
     */
    public boolean addUser(SysUser user) {
        boolean success = userDao.insert(user);
        if (success) {
            // 添加到布隆过滤器
            userIdFilter.add(user.getUserId());
        }
        return success;
    }
}

// ✅ 方案3: 参数校验
public List<SysDictDataVo> listDictDataByType(String dictType) {
    // 参数校验,拦截非法请求
    if (StringUtils.isBlank(dictType)) {
        return Collections.emptyList();
    }

    // 校验字典类型格式
    if (!dictType.matches("^[a-z_]{1,100}$")) {
        throw new ServiceException("字典类型格式不正确");
    }

    // 继续查询
    return SpringUtils.getAopProxy(this).listDictDataByTypeCached(dictType);
}

@Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
public List<SysDictDataVo> listDictDataByTypeCached(String dictType) {
    // ...
}
```

### 5. 缓存击穿

**问题原因:**

- 热点数据过期
- 大量并发请求同时查询

**解决方案:**

```java
// ✅ 方案1: 热点数据永不过期
public void cacheHotDataForever() {
    // 不设置过期时间
    RedisUtils.setCacheObject("hot:data:key", hotData);
}

// ✅ 方案2: 分布式锁 - 只允许一个请求查询数据库
public SysConfigVo getConfigWithLock(String configKey) {
    // 先查缓存
    String value = CacheUtils.get(CacheNames.SYS_CONFIG, configKey);
    if (value != null) {
        return new SysConfigVo(configKey, value);
    }

    // 缓存未命中,获取锁
    RLock lock = RedisUtils.getLock("lock:config:" + configKey);

    try {
        // 尝试加锁
        boolean locked = lock.tryLock(5, 10, TimeUnit.SECONDS);
        if (!locked) {
            throw new ServiceException("获取配置失败,请稍后重试");
        }

        try {
            // 双重检查,避免重复查询
            value = CacheUtils.get(CacheNames.SYS_CONFIG, configKey);
            if (value != null) {
                return new SysConfigVo(configKey, value);
            }

            // 查询数据库
            SysConfig config = configDao.getByConfigKey(configKey);
            if (config != null) {
                // 更新缓存
                CacheUtils.put(CacheNames.SYS_CONFIG, configKey, config.getConfigValue());
                return MapstructUtils.convert(config, SysConfigVo.class);
            }

            return null;
        } finally {
            lock.unlock();
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new ServiceException("获取配置被中断");
    }
}

// ✅ 方案3: 提前刷新缓存
@Scheduled(cron = "0 */5 * * * ?")  // 每5分钟刷新一次
public void refreshHotDataCache() {
    List<String> hotConfigKeys = getHotConfigKeys();

    for (String configKey : hotConfigKeys) {
        SysConfig config = configDao.getByConfigKey(configKey);
        if (config != null) {
            // 刷新缓存
            CacheUtils.put(CacheNames.SYS_CONFIG, configKey, config.getConfigValue());
        }
    }

    log.info("刷新热点配置缓存: {} 个", hotConfigKeys.size());
}

private List<String> getHotConfigKeys() {
    // 返回热点配置 key 列表
    return Arrays.asList(
        "sys.user.initPassword",
        "sys.index.skinName",
        "sys.account.captchaEnabled"
    );
}
```

### 6. 大 Key 问题

**问题原因:**

- 单个缓存值过大 (如: 超大列表、复杂对象)
- 影响 Redis 性能
- 网络传输慢

**解决方案:**

```java
// ❌ 错误: 缓存整个大列表
@Cacheable(cacheNames = "user_list", key = "'all'")
public List<SysUserVo> listAllUsers() {
    // 如果有 100 万用户,缓存会非常大!
    return userDao.list();
}

// ✅ 正确: 分页缓存
@Cacheable(cacheNames = "user_list_page", key = "#pageNum + ':' + #pageSize")
public PageResult<SysUserVo> listUsersByPage(int pageNum, int pageSize) {
    // 只缓存单页数据
    PageQuery pageQuery = new PageQuery(pageNum, pageSize);
    return userDao.page(pageQuery);
}

// ✅ 正确: 拆分缓存
public List<SysUserVo> listAllUsersOptimized() {
    List<SysUserVo> allUsers = new ArrayList<>();

    // 分批查询,避免大 Key
    int batchSize = 1000;
    int pageNum = 1;
    while (true) {
        List<SysUserVo> batch = listUsersByPageCached(pageNum, batchSize);
        if (CollUtil.isEmpty(batch)) {
            break;
        }
        allUsers.addAll(batch);
        pageNum++;
    }

    return allUsers;
}

@Cacheable(cacheNames = "user_list_batch", key = "#pageNum")
public List<SysUserVo> listUsersByPageCached(int pageNum, int batchSize) {
    int offset = (pageNum - 1) * batchSize;
    return userDao.list(new LambdaQueryWrapper<SysUser>()
        .last("LIMIT " + offset + "," + batchSize));
}

// ✅ 正确: 使用 Hash 结构
public void cacheUserMapAsHash(Long userId, Map<String, Object> userInfo) {
    // 不要缓存整个 Map,使用 Redis Hash
    RedisUtils.setCacheMap("user:info:" + userId, userInfo);

    // 可以单独获取某个字段,不需要取整个对象
    String nickname = RedisUtils.getCacheMapValue("user:info:" + userId, "nickname");
}
```

### 7. 缓存内存占用过高

**问题原因:**

- 缓存数据过多
- 过期策略不合理
- 缓存未设置大小限制

**解决方案:**

```java
// ✅ 方案1: 设置合理的 MaxSize 限制
// CacheNames 配置
String SYS_CONFIG = "sys_config#5d#2d#500";      // 最多 500 个
String SYS_DICT = "sys_dict#1d#12h#1000";        // 最多 1000 个
String SYS_NICKNAME = "sys_nickname#5d#2d#5000"; // 最多 5000 个

// ✅ 方案2: 设置合理的过期时间
String SYS_OSS_DIRECTORY = "sys_oss_directory#10s#5s#500";  // 10秒过期
String HOME_STATISTICS = "home_statistics#20s#10s#100";     // 20秒过期

// ✅ 方案3: 定时清理过期缓存
@Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨 3 点清理
public void cleanExpiredCache() {
    log.info("开始清理过期缓存...");

    // 清理临时缓存
    RedisUtils.deleteKeys("temp:*");

    // 清理过期会话
    RedisUtils.deleteKeys("session:expired:*");

    log.info("过期缓存清理完成");
}

// ✅ 方案4: 监控并告警
@Scheduled(cron = "0 */10 * * * ?")  // 每10分钟检查
public void monitorCacheMemory() {
    Map<String, Long> sizeMap = cacheSizeMonitorService.getAllCacheSizes();

    long totalSize = sizeMap.values().stream().mapToLong(Long::longValue).sum();
    long threshold = 1000000;  // 100 万条

    if (totalSize > threshold) {
        log.warn("缓存数量超限: 当前{}条, 阈值{}条", totalSize, threshold);
        // 发送告警
        alertService.sendAlert("缓存数量超限",
            String.format("当前缓存数量: %d, 超过阈值: %d", totalSize, threshold));
    }
}
```

---

## 总结

本文档详细介绍了 RuoYi-Plus 框架中的缓存性能优化策略,包括:

- **多级缓存架构**: Caffeine 本地缓存 + Redisson 分布式缓存
- **动态缓存配置**: 基于缓存名称的灵活配置机制
- **Spring Cache 注解**: `@Cacheable`、`@CachePut`、`@CacheEvict` 使用详解
- **工具类使用**: CacheUtils 和 RedisUtils 的各种操作
- **最佳实践**: 缓存粒度、Key设计、过期时间、穿透防护等
- **性能监控**: 命中率监控、慢查询监控、容量监控
- **常见问题**: 缓存雪崩、穿透、击穿、大Key等解决方案

通过合理使用缓存,可以显著提升系统性能,降低数据库压力。建议在实际项目中根据业务特点,选择合适的缓存策略和配置参数。
