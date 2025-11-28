# 故障排查最佳实践

## 介绍

故障排查是运维工作中最关键的技能之一。本文档基于 RuoYi-Plus-UniApp 项目的实际生产经验,总结了常见故障场景的诊断方法和解决方案。通过系统化的排查流程、详细的诊断命令和真实的案例分析,帮助开发和运维团队快速定位并解决生产环境中的各类问题。

项目采用 Spring Boot 3.5.6 + MyBatis-Plus 3.5.14 + Redis 7.2.8 + Docker 容器化部署架构,集成了 Spring Boot Actuator、Prometheus、Logback 等完善的监控和日志系统。本文档覆盖应用启动、数据库连接、缓存故障、异常处理、性能问题、容器故障等全方位的排查场景。

**核心特性:**

- **系统化排查流程** - 提供标准的故障诊断步骤,从症状识别到根因分析
- **真实配置参考** - 所有诊断方法基于项目实际配置,可直接应用
- **命令行工具集** - 提供完整的诊断命令和脚本,快速定位问题
- **案例分析** - 真实生产故障案例,包含完整的排查过程和解决方案
- **监控集成** - 结合 Actuator、Prometheus、日志系统的综合诊断
- **自动化工具** - 提供故障自动诊断脚本,提升排查效率
- **预防措施** - 从架构设计和配置优化角度预防故障发生
- **应急预案** - 针对不同故障场景的快速恢复方案

## 故障排查总体流程

### 标准排查步骤

```
┌─────────────────────────────────────────────────────────────────┐
│                     故障排查标准流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 问题描述                                                     │
│     ├─ 收集故障现象                                             │
│     ├─ 确认影响范围                                             │
│     ├─ 记录发生时间                                             │
│     └─ 复现问题场景                                             │
│                                                                  │
│  2. 初步诊断                                                     │
│     ├─ 检查服务状态                                             │
│     ├─ 查看监控指标                                             │
│     ├─ 分析错误日志                                             │
│     └─ 检查资源使用                                             │
│                                                                  │
│  3. 深入分析                                                     │
│     ├─ 定位问题模块                                             │
│     ├─ 追踪调用链路                                             │
│     ├─ 分析根本原因                                             │
│     └─ 验证假设                                                 │
│                                                                  │
│  4. 解决方案                                                     │
│     ├─ 制定修复计划                                             │
│     ├─ 实施修复措施                                             │
│     ├─ 验证修复效果                                             │
│     └─ 记录处理过程                                             │
│                                                                  │
│  5. 预防措施                                                     │
│     ├─ 优化系统配置                                             │
│     ├─ 完善监控告警                                             │
│     ├─ 更新运维文档                                             │
│     └─ 团队知识分享                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 快速诊断清单

**应用层检查:**
```bash
# 1. 检查服务状态
systemctl status ruoyi-plus
docker ps | grep ruoyi

# 2. 检查端口监听
netstat -tlnp | grep -E "5503|8080|6379|3306"
ss -tlnp | grep -E "5503|8080"

# 3. 检查健康状态
curl http://localhost:5503/actuator/health
curl http://localhost:5503/actuator/info

# 4. 查看最近日志
tail -f /home/ubuntu/apps/ryplus_uni_workflow/logs/sys-console.log
tail -f /home/ubuntu/apps/ryplus_uni_workflow/logs/sys-error.log

# 5. 检查资源使用
top -p $(pgrep -f ryplus_uni_workflow)
df -h
free -h
```

**容器层检查:**
```bash
# 1. 容器状态
docker inspect ryplus_uni_workflow

# 2. 容器日志
docker logs --tail 100 ryplus_uni_workflow
docker logs --since 10m ryplus_uni_workflow

# 3. 容器资源
docker stats ryplus_uni_workflow --no-stream

# 4. 进入容器
docker exec -it ryplus_uni_workflow sh
```

## 应用启动故障

### 1. 端口被占用

**症状:**
```
Web server failed to start. Port 5503 was already in use.
```

**诊断步骤:**

```bash
# 1. 查找占用端口的进程
lsof -i :5503
netstat -tlnp | grep 5503
ss -tlnp | grep 5503

# 2. 查看进程详情
ps aux | grep 5503
ps -ef | grep java

# 3. 检查是否有僵尸进程
ps aux | grep defunct
```

**解决方案:**

```bash
# 方案1: 终止占用端口的进程
kill -9 <PID>

# 方案2: 修改应用端口
# application-dev.yml
server:
  port: 5504  # 改为其他可用端口

# 方案3: Docker容器端口映射
docker run -p 5504:5503 ryplus_uni_workflow

# 方案4: 清理所有相关进程
pkill -f ryplus_uni_workflow
```

**预防措施:**

```bash
# 启动脚本添加端口检查
#!/bin/bash
PORT=5503

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "错误: 端口 $PORT 已被占用"
    lsof -i :$PORT
    exit 1
fi

# 启动应用
java -jar ryplus_uni_workflow.jar
```

### 2. 配置文件错误

**症状:**
```
Failed to bind properties under 'spring.datasource.url' to java.lang.String
```

**诊断步骤:**

```bash
# 1. 验证配置文件语法
# application.yml 语法检查
cat application.yml | yq eval

# 2. 检查配置文件加载
java -jar app.jar --debug

# 3. 打印实际配置
curl http://localhost:5503/actuator/configprops

# 4. 检查环境变量
env | grep -E "DB_|REDIS_|SPRING_"
```

**常见配置错误:**

```yaml
# ❌ 错误: URL格式错误
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ryplus_uni_workflow  # 缺少参数

# ✅ 正确: 完整的URL配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ryplus_uni_workflow?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&autoReconnect=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true

# ❌ 错误: 缩进不正确
spring:
  redis:
  host: 127.0.0.1  # 缩进错误

# ✅ 正确: 正确的缩进
spring:
  redis:
    host: 127.0.0.1
```

**解决方案:**

```bash
# 1. 使用配置验证工具
# 创建 validate-config.sh
#!/bin/bash
CONFIG_FILE="application.yml"

# 检查YAML语法
if ! python3 -c "import yaml; yaml.safe_load(open('$CONFIG_FILE'))" 2>/dev/null; then
    echo "❌ YAML语法错误"
    exit 1
fi

# 检查必需配置项
REQUIRED_KEYS=(
    "spring.datasource.url"
    "spring.datasource.username"
    "spring.redis.host"
)

for key in "${REQUIRED_KEYS[@]}"; do
    if ! grep -q "$key" "$CONFIG_FILE"; then
        echo "⚠️  缺少配置: $key"
    fi
done

echo "✅ 配置验证通过"
```

### 3. 依赖注入失败

**症状:**
```
Field userService in plus.ruoyi.system.controller.SysUserController required a bean of type 'ISysUserService' that could not be found.
```

**诊断步骤:**

```bash
# 1. 检查Bean定义
grep -r "@Service\|@Component\|@Repository" src/

# 2. 检查包扫描路径
# application.yml
grep -A 5 "component-scan" src/main/resources/

# 3. 查看Bean加载日志
grep "Bean.*defined" logs/sys-console.log

# 4. 使用Actuator查看所有Bean
curl http://localhost:5503/actuator/beans | jq
```

**常见原因:**

1. **缺少注解**
```java
// ❌ 错误: 没有@Service注解
public class SysUserServiceImpl implements ISysUserService {
}

// ✅ 正确: 添加@Service注解
@Service
public class SysUserServiceImpl implements ISysUserService {
}
```

2. **包扫描路径错误**
```java
// ❌ 错误: 扫描路径不包含Service所在包
@SpringBootApplication
@ComponentScan("plus.ruoyi.web")
public class RuoYiApplication {
}

// ✅ 正确: 扫描路径包含所有模块
@SpringBootApplication
public class RuoYiApplication {
    // 默认扫描当前包及子包
}
```

3. **循环依赖**
```java
// ❌ 错误: A依赖B,B依赖A
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;  // A → B
}

@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA;  // B → A (循环依赖)
}

// ✅ 正确: 使用构造器注入或Lazy注解
@Service
public class ServiceA {
    @Lazy
    @Autowired
    private ServiceB serviceB;
}
```

**解决方案:**

```bash
# 1. 扫描所有Bean定义
find src/ -name "*.java" -exec grep -l "@Service\|@Component\|@Repository" {} \;

# 2. 检查循环依赖
# 启动时添加参数
java -jar app.jar --spring.main.allow-circular-references=true

# 3. 查看Bean创建过程
java -jar app.jar --debug --trace
```

### 4. 数据库连接失败

**症状:**
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**诊断步骤:**

```bash
# 1. 测试数据库连接
mysql -h127.0.0.1 -P3306 -uroot -p

# 2. 检查数据库状态
systemctl status mysql
docker ps | grep mysql

# 3. 检查网络连通性
ping 127.0.0.1
telnet 127.0.0.1 3306
nc -zv 127.0.0.1 3306

# 4. 查看MySQL错误日志
tail -f /var/log/mysql/error.log
docker logs mysql

# 5. 检查防火墙
iptables -L -n | grep 3306
firewall-cmd --list-all | grep 3306
```

**HikariCP 连接池配置:**

项目使用 HikariCP 作为连接池,配置如下:

**开发环境 (application-dev.yml):**
```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    hikari:
      maxPoolSize: 20          # 最大连接数
      minIdle: 10              # 最小空闲连接
      connectionTimeout: 30000  # 连接超时(30秒)
      validationTimeout: 5000   # 校验超时(5秒)
      idleTimeout: 600000       # 空闲连接存活时间(10分钟)
      maxLifetime: 1800000      # 连接最长生命周期(30分钟)
      keepaliveTime: 30000      # 保活检查时间(30秒)
      connectionTestQuery: SELECT 1
```

**生产环境 (application-prod.yml):**
```yaml
spring:
  datasource:
    hikari:
      maxPoolSize: 50          # 生产环境更大的连接池
      minIdle: 20
      connectionTimeout: 30000
      validationTimeout: 5000
      idleTimeout: 600000
      maxLifetime: 1800000
      keepaliveTime: 30000
```

**解决方案:**

```bash
# 1. 检查数据库URL配置
# application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/ryplus_uni_workflow?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&autoReconnect=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true

# 2. 验证用户权限
mysql -uroot -p -e "SHOW GRANTS FOR 'root'@'%';"

# 3. 调整连接池配置
spring:
  datasource:
    hikari:
      connectionTimeout: 60000  # 增加超时时间
      maxPoolSize: 30          # 调整连接池大小

# 4. 启用连接测试
spring:
  datasource:
    hikari:
      connectionTestQuery: SELECT 1
```

**监控连接池状态:**

```bash
# 访问Actuator端点
curl http://localhost:5503/actuator/metrics/hikaricp.connections.active
curl http://localhost:5503/actuator/metrics/hikaricp.connections.idle
curl http://localhost:5503/actuator/metrics/hikaricp.connections.max
curl http://localhost:5503/actuator/metrics/hikaricp.connections.pending
```

## 数据库故障排查

### 1. 连接池耗尽

**症状:**
```
HikariPool-1 - Connection is not available, request timed out after 30000ms.
```

**诊断步骤:**

```bash
# 1. 查看当前连接数
mysql -uroot -p -e "SHOW PROCESSLIST;"
mysql -uroot -p -e "SHOW STATUS LIKE 'Threads_connected';"

# 2. 查看连接池指标
curl http://localhost:5503/actuator/metrics/hikaricp.connections | jq

# 3. 分析慢查询
mysql -uroot -p -e "SELECT * FROM information_schema.processlist WHERE time > 5;"

# 4. 检查锁等待
mysql -uroot -p -e "SHOW ENGINE INNODB STATUS\G" | grep -A 20 "TRANSACTIONS"
```

**连接泄漏检测:**

HikariCP 提供了连接泄漏检测功能:

```yaml
spring:
  datasource:
    hikari:
      # 启用连接泄漏检测(开发环境)
      leakDetectionThreshold: 60000  # 60秒未归还视为泄漏
```

**解决方案:**

```java
// ❌ 错误: 没有关闭连接
public void badExample() {
    Connection conn = dataSource.getConnection();
    // 使用连接...
    // 忘记关闭,导致连接泄漏
}

// ✅ 正确: 使用try-with-resources自动关闭
public void goodExample() {
    try (Connection conn = dataSource.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        // 使用连接...
    } // 自动关闭
}

// ✅ 最佳: 使用MyBatis-Plus,自动管理连接
@Service
public class UserService extends ServiceImpl<UserMapper, User> {
    public List<User> getUsers() {
        return list();  // 框架自动管理连接
    }
}
```

**调整连接池配置:**

```yaml
# 根据实际负载调整
spring:
  datasource:
    hikari:
      # 计算公式: connections = ((core_count * 2) + effective_spindle_count)
      # 4核服务器: (4 * 2) + 1 = 9,可设置10-20
      # 8核服务器: (8 * 2) + 1 = 17,可设置20-40
      maxPoolSize: 50
      minIdle: 20

      # 优化超时配置
      connectionTimeout: 30000
      idleTimeout: 600000
      maxLifetime: 1800000
```

### 2. 慢SQL诊断

**症状:**
```
接口响应缓慢,数据库CPU使用率高
```

**开启SQL日志:**

项目使用 Logback 记录SQL日志,配置位于 `logback-plus.xml`:

```xml
<!-- SQL日志配置 -->
<appender name="file_sql" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_PATH}/${APP_NAME}-sql.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <fileNamePattern>${LOG_PATH}/%d{yyyy-MM, aux}/${APP_NAME}-sql.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
        <maxFileSize>100MB</maxFileSize>
        <maxHistory>60</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>%date [%thread] %-5level [%logger{50}] %file:%line - %msg%n</pattern>
    </encoder>
</appender>

<!-- SQL日志级别 -->
<logger name="plus.ruoyi" level="debug" additivity="false">
    <appender-ref ref="file_sql"/>
</logger>
```

**诊断步骤:**

```bash
# 1. 分析SQL日志
tail -f /home/ubuntu/apps/ryplus_uni_workflow/logs/ryplus_uni_workflow-sql.log

# 2. 查看慢查询日志
# my.cnf
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2  # 2秒以上的查询

# 查看慢查询
mysqldumpslow -t 10 /var/log/mysql/slow-query.log

# 3. 使用EXPLAIN分析
mysql -uroot -p -e "EXPLAIN SELECT * FROM sys_user WHERE user_name LIKE '%test%';"

# 4. 查看表索引
mysql -uroot -p -e "SHOW INDEX FROM sys_user;"

# 5. 查看表统计信息
mysql -uroot -p -e "ANALYZE TABLE sys_user;"
```

**优化方案:**

```sql
-- ❌ 错误: 全表扫描
SELECT * FROM sys_user WHERE user_name LIKE '%test%';

-- ✅ 正确: 使用索引
SELECT * FROM sys_user WHERE user_name LIKE 'test%';

-- ❌ 错误: 函数导致索引失效
SELECT * FROM sys_user WHERE DATE(create_time) = '2024-11-24';

-- ✅ 正确: 使用范围查询
SELECT * FROM sys_user WHERE create_time >= '2024-11-24 00:00:00'
  AND create_time < '2024-11-25 00:00:00';

-- ❌ 错误: N+1查询
for (User user : users) {
    List<Role> roles = roleMapper.selectByUserId(user.getId());
}

-- ✅ 正确: 使用JOIN或批量查询
SELECT u.*, r.* FROM sys_user u
LEFT JOIN sys_user_role ur ON u.user_id = ur.user_id
LEFT JOIN sys_role r ON ur.role_id = r.role_id;
```

### 3. 死锁问题

**症状:**
```
Deadlock found when trying to get lock; try restarting transaction
```

**诊断步骤:**

```bash
# 1. 查看死锁信息
mysql -uroot -p -e "SHOW ENGINE INNODB STATUS\G" | grep -A 50 "LATEST DETECTED DEADLOCK"

# 2. 查看当前锁等待
mysql -uroot -p -e "
SELECT
  r.trx_id waiting_trx_id,
  r.trx_mysql_thread_id waiting_thread,
  r.trx_query waiting_query,
  b.trx_id blocking_trx_id,
  b.trx_mysql_thread_id blocking_thread,
  b.trx_query blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
"

# 3. 查看长时间未提交的事务
mysql -uroot -p -e "
SELECT * FROM information_schema.innodb_trx
WHERE trx_started < DATE_SUB(NOW(), INTERVAL 60 SECOND);
"
```

**解决方案:**

```java
// ❌ 错误: 不一致的锁顺序
// 事务1: 先锁A再锁B
@Transactional
public void transfer1(Long fromId, Long toId) {
    Account from = accountMapper.selectById(fromId);  // 锁A
    Account to = accountMapper.selectById(toId);      // 锁B
}

// 事务2: 先锁B再锁A
@Transactional
public void transfer2(Long toId, Long fromId) {
    Account to = accountMapper.selectById(toId);      // 锁B
    Account from = accountMapper.selectById(fromId);  // 锁A
}

// ✅ 正确: 统一锁顺序
@Transactional
public void transfer(Long fromId, Long toId) {
    // 按ID升序加锁
    Long id1 = Math.min(fromId, toId);
    Long id2 = Math.max(fromId, toId);

    Account account1 = accountMapper.selectById(id1);
    Account account2 = accountMapper.selectById(id2);
}

// ✅ 最佳: 使用乐观锁
@Transactional
public void updateWithVersion(Account account) {
    int rows = accountMapper.update(account,
        new LambdaUpdateWrapper<Account>()
            .eq(Account::getId, account.getId())
            .eq(Account::getVersion, account.getVersion())  // 版本号
    );
    if (rows == 0) {
        throw new ServiceException("数据已被修改,请刷新后重试");
    }
}
```

## Redis故障排查

### 1. 连接失败

**症状:**
```
Unable to connect to Redis; nested exception is io.lettuce.core.RedisConnectionException: Unable to connect to 127.0.0.1:6379
```

**Redisson 连接配置:**

项目使用 Redisson 作为 Redis 客户端:

**开发环境 (application-dev.yml):**
```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password: ruoyi123
      database: 0
      timeout: 10s
      ssl:
        enabled: false
      lettuce:
        pool:
          # Lettuce连接池配置
          max-active: 8
          max-idle: 8
          min-idle: 0
          max-wait: -1ms

# Redisson配置
redisson:
  threads: 4                    # 业务线程数
  nettyThreads: 8               # Netty线程数
  singleServerConfig:
    address: "redis://127.0.0.1:6379"
    password: ruoyi123
    database: 0
    connectionMinimumIdleSize: 8   # 最小空闲连接
    connectionPoolSize: 32         # 连接池大小
    idleConnectionTimeout: 10000   # 空闲连接超时(10秒)
    connectTimeout: 10000          # 连接超时(10秒)
    timeout: 3000                  # 命令超时(3秒)
    subscriptionConnectionPoolSize: 50
```

**生产环境 (application-prod.yml):**
```yaml
redisson:
  threads: 16                   # 生产环境更多线程
  nettyThreads: 32
  singleServerConfig:
    connectionMinimumIdleSize: 32
    connectionPoolSize: 64
    idleConnectionTimeout: 10000
    timeout: 3000
```

**诊断步骤:**

```bash
# 1. 测试Redis连接
redis-cli -h 127.0.0.1 -p 6379 -a ruoyi123 ping

# 2. 检查Redis状态
systemctl status redis
docker ps | grep redis

# 3. 查看Redis日志
tail -f /var/log/redis/redis-server.log
docker logs redis

# 4. 检查网络
telnet 127.0.0.1 6379
nc -zv 127.0.0.1 6379

# 5. 查看Redis连接数
redis-cli -a ruoyi123 INFO clients | grep connected_clients

# 6. 查看慢日志
redis-cli -a ruoyi123 SLOWLOG GET 10
```

**解决方案:**

```bash
# 1. 检查Redis配置
# redis.conf
bind 0.0.0.0  # 允许远程连接
protected-mode no
requirepass ruoyi123
maxclients 10000

# 2. 检查防火墙
iptables -A INPUT -p tcp --dport 6379 -j ACCEPT
firewall-cmd --permanent --add-port=6379/tcp
firewall-cmd --reload

# 3. 重启Redis
systemctl restart redis
docker restart redis

# 4. 验证连接
redis-cli -h 127.0.0.1 -p 6379 -a ruoyi123 INFO server
```

### 2. 连接池耗尽

**症状:**
```
io.lettuce.core.RedisConnectionException: Unable to acquire connection from pool
```

**诊断步骤:**

```bash
# 1. 查看Redisson连接池状态
curl http://localhost:5503/actuator/metrics/redisson.pool.active
curl http://localhost:5503/actuator/metrics/redisson.pool.idle

# 2. 查看Redis客户端连接
redis-cli -a ruoyi123 CLIENT LIST

# 3. 查看Redis内存使用
redis-cli -a ruoyi123 INFO memory

# 4. 查看慢命令
redis-cli -a ruoyi123 SLOWLOG GET 10
```

**解决方案:**

```yaml
# 调整连接池配置
redisson:
  singleServerConfig:
    connectionPoolSize: 128        # 增加连接池大小
    connectionMinimumIdleSize: 64  # 增加最小空闲连接
    idleConnectionTimeout: 10000
    timeout: 5000                  # 增加命令超时
```

```java
// ❌ 错误: 阻塞操作占用连接
public void badExample() {
    RLock lock = redissonClient.getLock("myLock");
    lock.lock();
    try {
        // 长时间操作,占用连接
        Thread.sleep(60000);
    } finally {
        lock.unlock();
    }
}

// ✅ 正确: 使用超时锁
public void goodExample() {
    RLock lock = redissonClient.getLock("myLock");
    try {
        if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
            // 业务操作
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
```

### 3. 缓存击穿/穿透/雪崩

**缓存穿透 (查询不存在的数据):**

```java
// ❌ 错误: 没有缓存空值
public User getUser(Long id) {
    User user = redisCache.getCacheObject("user:" + id);
    if (user == null) {
        user = userMapper.selectById(id);  // 每次都查数据库
        if (user != null) {
            redisCache.setCacheObject("user:" + id, user);
        }
    }
    return user;
}

// ✅ 正确: 缓存空值
public User getUser(Long id) {
    User user = redisCache.getCacheObject("user:" + id);
    if (user == null) {
        user = userMapper.selectById(id);
        if (user != null) {
            redisCache.setCacheObject("user:" + id, user, 5, TimeUnit.MINUTES);
        } else {
            // 缓存空值,防止穿透
            redisCache.setCacheObject("user:" + id, new User(), 1, TimeUnit.MINUTES);
        }
    }
    return user.getId() == null ? null : user;
}

// ✅ 最佳: 使用布隆过滤器
@Autowired
private RBloomFilter<String> bloomFilter;

public User getUser(Long id) {
    String key = "user:" + id;

    // 布隆过滤器判断
    if (!bloomFilter.contains(key)) {
        return null;  // 一定不存在
    }

    // 可能存在,查缓存
    User user = redisCache.getCacheObject(key);
    if (user == null) {
        user = userMapper.selectById(id);
        if (user != null) {
            redisCache.setCacheObject(key, user, 5, TimeUnit.MINUTES);
        }
    }
    return user;
}
```

**缓存击穿 (热点数据过期):**

```java
// ❌ 错误: 没有加锁
public String getHotData(String key) {
    String value = redisCache.getCacheObject(key);
    if (value == null) {
        // 大量并发请求都查数据库
        value = loadFromDB(key);
        redisCache.setCacheObject(key, value, 5, TimeUnit.MINUTES);
    }
    return value;
}

// ✅ 正确: 使用分布式锁
public String getHotData(String key) {
    String value = redisCache.getCacheObject(key);
    if (value == null) {
        RLock lock = redissonClient.getLock("lock:" + key);
        try {
            if (lock.tryLock(10, TimeUnit.SECONDS)) {
                // 双重检查
                value = redisCache.getCacheObject(key);
                if (value == null) {
                    value = loadFromDB(key);
                    redisCache.setCacheObject(key, value, 5, TimeUnit.MINUTES);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
    return value;
}

// ✅ 最佳: 热点数据永不过期
public String getHotData(String key) {
    String value = redisCache.getCacheObject(key);
    if (value == null) {
        value = loadFromDB(key);
        // 永不过期,后台异步刷新
        redisCache.setCacheObject(key, value);
        scheduleRefresh(key);
    }
    return value;
}
```

**缓存雪崩 (大量缓存同时过期):**

```java
// ❌ 错误: 统一过期时间
public void cacheUsers(List<User> users) {
    for (User user : users) {
        redisCache.setCacheObject("user:" + user.getId(), user, 5, TimeUnit.MINUTES);
    }
}

// ✅ 正确: 随机过期时间
public void cacheUsers(List<User> users) {
    Random random = new Random();
    for (User user : users) {
        // 5分钟 + 随机0-60秒
        int ttl = 300 + random.nextInt(60);
        redisCache.setCacheObject("user:" + user.getId(), user, ttl, TimeUnit.SECONDS);
    }
}
```

### 4. Redis内存溢出

**症状:**
```
OOM command not allowed when used memory > 'maxmemory'
```

**诊断步骤:**

```bash
# 1. 查看内存使用
redis-cli -a ruoyi123 INFO memory

# 2. 分析大key
redis-cli -a ruoyi123 --bigkeys

# 3. 查看内存分析
redis-cli -a ruoyi123 MEMORY STATS

# 4. 查看淘汰策略
redis-cli -a ruoyi123 CONFIG GET maxmemory*
```

**解决方案:**

```bash
# redis.conf 配置
maxmemory 2gb
maxmemory-policy allkeys-lru  # LRU淘汰策略

# 淘汰策略说明:
# noeviction: 不淘汰,写入报错(默认)
# allkeys-lru: 所有key,LRU淘汰
# volatile-lru: 设置过期时间的key,LRU淘汰
# allkeys-random: 所有key,随机淘汰
# volatile-random: 设置过期时间的key,随机淘汰
# volatile-ttl: 设置过期时间的key,优先淘汰TTL短的

# 清理无用key
redis-cli -a ruoyi123 --scan --pattern "obsolete:*" | xargs redis-cli -a ruoyi123 DEL

# 优化数据结构
# ❌ 存储大JSON
SET user:1 '{"id":1,"name":"张三",...}'  # 大对象

# ✅ 使用Hash
HSET user:1 id 1
HSET user:1 name "张三"
```

## 异常处理与日志分析

### 1. 全局异常处理

项目使用 `GlobalExceptionHandler` 统一处理异常:

**关键异常处理器:**

1. **GlobalExceptionHandler** (ruoyi-common-web):
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 业务异常
    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e) {
        log.error("业务异常: {}", e.getMessage());
        return R.fail(e.getCode(), e.getMessage());
    }

    // 参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return R.fail(message);
    }

    // 未知异常
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常: ", e);
        return R.fail("系统异常,请联系管理员");
    }
}
```

2. **SaTokenExceptionHandler** (ruoyi-common-satoken):
```java
@RestControllerAdvice
public class SaTokenExceptionHandler {

    // 未登录
    @ExceptionHandler(NotLoginException.class)
    public R<Void> handleNotLoginException(NotLoginException e) {
        return R.fail(HttpStatus.UNAUTHORIZED, "未登录或登录已过期");
    }

    // 无权限
    @ExceptionHandler(NotPermissionException.class)
    public R<Void> handleNotPermissionException(NotPermissionException e) {
        return R.fail(HttpStatus.FORBIDDEN, "权限不足");
    }
}
```

3. **MybatisExceptionHandler** (ruoyi-common-mybatis):
```java
@RestControllerAdvice
public class MybatisExceptionHandler {

    // SQL异常
    @ExceptionHandler(MyBatisSystemException.class)
    public R<Void> handleMybatisException(MyBatisSystemException e) {
        log.error("MyBatis异常: ", e);
        return R.fail("数据库操作异常");
    }

    // 重复键异常
    @ExceptionHandler(DuplicateKeyException.class)
    public R<Void> handleDuplicateKeyException(DuplicateKeyException e) {
        return R.fail("数据已存在");
    }
}
```

**自定义异常类:**

```java
// ServiceException (业务异常)
public class ServiceException extends RuntimeException {
    private Integer code;
    private String message;

    public ServiceException(String message) {
        this.message = message;
        this.code = HttpStatus.ERROR;
    }

    public ServiceException(String message, Integer code) {
        this.message = message;
        this.code = code;
    }
}

// 使用示例
if (user == null) {
    throw new ServiceException("用户不存在");
}
```

### 2. 日志配置与分析

**logback-plus.xml 配置:**

项目日志配置位于 `ruoyi-admin/src/main/resources/logback-plus.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 日志存放路径 -->
    <property name="LOG_PATH" value="./logs"/>
    <!-- 应用名称 -->
    <property name="APP_NAME" value="ryplus_uni_workflow"/>

    <!-- 开发环境: 只输出到控制台 -->
    <springProfile name="dev">
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%red(%d{yyyy-MM-dd HH:mm:ss}) %green([%thread]) %highlight(%-5level) %boldMagenta(%logger{50}) - %msg%n</pattern>
            </encoder>
        </appender>

        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>

    <!-- 生产环境: 文件日志 -->
    <springProfile name="prod">
        <!-- 控制台日志 -->
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n</pattern>
            </encoder>
        </appender>

        <!-- INFO日志 -->
        <appender name="FILE_INFO" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>${LOG_PATH}/${APP_NAME}-info.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
                <fileNamePattern>${LOG_PATH}/%d{yyyy-MM, aux}/${APP_NAME}-info.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
                <maxFileSize>100MB</maxFileSize>
                <maxHistory>60</maxHistory>
            </rollingPolicy>
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n</pattern>
            </encoder>
            <filter class="ch.qos.logback.classic.filter.LevelFilter">
                <level>INFO</level>
                <onMatch>ACCEPT</onMatch>
                <onMismatch>DENY</onMismatch>
            </filter>
        </appender>

        <!-- ERROR日志 -->
        <appender name="FILE_ERROR" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>${LOG_PATH}/${APP_NAME}-error.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
                <fileNamePattern>${LOG_PATH}/%d{yyyy-MM, aux}/${APP_NAME}-error.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
                <maxFileSize>100MB</maxFileSize>
                <maxHistory>60</maxHistory>
            </rollingPolicy>
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n</pattern>
            </encoder>
            <filter class="ch.qos.logback.classic.filter.LevelFilter">
                <level>ERROR</level>
                <onMatch>ACCEPT</onMatch>
                <onMismatch>DENY</onMismatch>
            </filter>
        </appender>

        <!-- SQL日志 -->
        <appender name="FILE_SQL" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>${LOG_PATH}/${APP_NAME}-sql.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
                <fileNamePattern>${LOG_PATH}/%d{yyyy-MM, aux}/${APP_NAME}-sql.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
                <maxFileSize>100MB</maxFileSize>
                <maxHistory>60</maxHistory>
            </rollingPolicy>
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n</pattern>
            </encoder>
        </appender>

        <!-- 异步日志 (提升性能) -->
        <appender name="ASYNC_INFO" class="ch.qos.logback.classic.AsyncAppender">
            <discardingThreshold>0</discardingThreshold>
            <queueSize>512</queueSize>
            <appender-ref ref="FILE_INFO"/>
        </appender>

        <appender name="ASYNC_ERROR" class="ch.qos.logback.classic.AsyncAppender">
            <discardingThreshold>0</discardingThreshold>
            <queueSize>512</queueSize>
            <appender-ref ref="FILE_ERROR"/>
        </appender>

        <!-- SQL日志级别 -->
        <logger name="plus.ruoyi" level="DEBUG" additivity="false">
            <appender-ref ref="FILE_SQL"/>
        </logger>

        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="ASYNC_INFO"/>
            <appender-ref ref="ASYNC_ERROR"/>
        </root>
    </springProfile>
</configuration>
```

**日志分析技巧:**

```bash
# 1. 查看实时错误日志
tail -f /home/ubuntu/apps/ryplus_uni_workflow/logs/ryplus_uni_workflow-error.log

# 2. 统计错误类型
grep "Exception" ryplus_uni_workflow-error.log | awk '{print $NF}' | sort | uniq -c | sort -rn

# 3. 查找特定时间段的日志
sed -n '/2024-11-24 10:00/,/2024-11-24 11:00/p' ryplus_uni_workflow-info.log

# 4. 分析慢接口 (响应时间>1秒)
grep -E "cost=[0-9]{4,}" ryplus_uni_workflow-info.log

# 5. 统计接口调用量
grep "Request URI" ryplus_uni_workflow-info.log | awk '{print $(NF-1)}' | sort | uniq -c | sort -rn | head -20

# 6. 查找SQL慢查询
grep -E "Time:[0-9]{4,}" ryplus_uni_workflow-sql.log

# 7. 分析异常堆栈
awk '/Exception/,/^$/' ryplus_uni_workflow-error.log
```

**日志聚合分析脚本:**

```bash
#!/bin/bash
# log-analysis.sh - 日志分析脚本

LOG_DIR="/home/ubuntu/apps/ryplus_uni_workflow/logs"
DATE=$(date +%Y-%m-%d)

echo "===== 日志分析报告 (${DATE}) ====="

# 1. 错误统计
echo -e "\n【错误统计】"
ERROR_COUNT=$(grep -c "ERROR" ${LOG_DIR}/ryplus_uni_workflow-error.log 2>/dev/null || echo 0)
echo "错误总数: ${ERROR_COUNT}"

# 2. 错误类型排行
echo -e "\n【错误类型TOP10】"
grep "Exception" ${LOG_DIR}/ryplus_uni_workflow-error.log 2>/dev/null | \
    awk -F: '{print $NF}' | sort | uniq -c | sort -rn | head -10

# 3. 慢接口统计
echo -e "\n【慢接口TOP10】"
grep -oP 'URI:\K[^ ]+.*cost:\K[0-9]+' ${LOG_DIR}/ryplus_uni_workflow-info.log 2>/dev/null | \
    awk '{if($2>1000) print $1,$2}' | sort -k2 -rn | head -10

# 4. 接口调用量
echo -e "\n【接口调用TOP10】"
grep "Request URI" ${LOG_DIR}/ryplus_uni_workflow-info.log 2>/dev/null | \
    awk '{print $(NF-1)}' | sort | uniq -c | sort -rn | head -10

# 5. SQL慢查询
echo -e "\n【SQL慢查询】"
grep -E "Time:[0-9]{4,}" ${LOG_DIR}/ryplus_uni_workflow-sql.log 2>/dev/null | head -5

echo -e "\n===== 分析完成 ====="
```

## Docker容器故障排查

### 1. 容器启动失败

**症状:**
```
docker: Error response from daemon: driver failed programming external connectivity
```

**诊断步骤:**

```bash
# 1. 查看容器状态
docker ps -a | grep ryplus_uni_workflow

# 2. 查看容器日志
docker logs ryplus_uni_workflow
docker logs --tail 100 --since 10m ryplus_uni_workflow

# 3. 检查容器配置
docker inspect ryplus_uni_workflow

# 4. 查看Docker守护进程日志
journalctl -u docker -n 100 --no-pager

# 5. 检查端口占用
netstat -tlnp | grep -E "5503|8080"
```

**解决方案:**

```bash
# 1. 清理停止的容器
docker container prune -f

# 2. 重启Docker服务
systemctl restart docker

# 3. 检查Dockerfile配置
# ruoyi-admin/Dockerfile
FROM bellsoft/liberica-openjdk-rocky:21.0.8-cds

LABEL maintainer="抓蛙师"

RUN mkdir -p /ruoyi/server/logs \
    /ruoyi/server/upload \
    /ruoyi/server/temp

WORKDIR /ruoyi/server

# 环境变量
ENV SERVER_PORT=8080 \
    SNAIL_PORT=28080 \
    DEBUG_PORT=5005 \
    JAVA_OPTS="" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

# 暴露端口
EXPOSE ${SERVER_PORT}
EXPOSE ${SNAIL_PORT}
EXPOSE ${DEBUG_PORT}

# 复制JAR包
COPY ./target/ryplus_uni_workflow.jar /ruoyi/server/app.jar

# 启动命令
ENTRYPOINT ["sh", "-c", "cd /ruoyi/server && exec java \
    -Dserver.port=${SERVER_PORT} \
    -Dsnail-job.port=${SNAIL_PORT} \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} \
    -Duser.timezone=${TZ} \
    ${DEBUG_ARGS} \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/ruoyi/server/logs/ \
    -XX:+UseZGC \
    ${JAVA_OPTS} \
    -jar /ruoyi/server/app.jar"]

# 4. 重新构建镜像
docker build -t ryplus_uni_workflow:5.4.1 .

# 5. 启动容器
docker run -d \
    --name ryplus_uni_workflow \
    --network host \
    -e SERVER_PORT=5503 \
    -v /home/ubuntu/apps/ryplus_uni_workflow/logs:/ruoyi/server/logs \
    ryplus_uni_workflow:5.4.1
```

### 2. OOM问题诊断

**症状:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Dockerfile JVM配置:**

```dockerfile
ENTRYPOINT ["sh", "-c", "exec java \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/ruoyi/server/logs/ \
    -XX:+UseZGC \
    ${JAVA_OPTS} \
    -jar /ruoyi/server/app.jar"]
```

**诊断步骤:**

```bash
# 1. 查看容器内存限制
docker stats ryplus_uni_workflow --no-stream

# 2. 查看JVM堆内存
docker exec ryplus_uni_workflow jstat -gc <PID>

# 3. 查看堆转储文件
docker exec ryplus_uni_workflow ls -lh /ruoyi/server/logs/*.hprof

# 4. 下载堆转储文件分析
docker cp ryplus_uni_workflow:/ruoyi/server/logs/java_pid123.hprof ./

# 5. 使用MAT或JProfiler分析
# Eclipse MAT: https://www.eclipse.org/mat/
```

**解决方案:**

```bash
# 1. 设置合理的堆内存
docker run -d \
    --name ryplus_uni_workflow \
    -e JAVA_OPTS="-Xms2g -Xmx2g -XX:+UseZGC" \
    ryplus_uni_workflow:5.4.1

# 2. 限制容器内存 (Docker Compose)
services:
  ryplus_uni_workflow:
    image: ryplus_uni_workflow:5.4.1
    mem_limit: 4g
    mem_reservation: 2g
    environment:
      JAVA_OPTS: "-Xms2g -Xmx2g"

# 3. 监控内存使用
watch -n 1 'docker stats ryplus_uni_workflow --no-stream'
```

### 3. 容器网络问题

**症状:**
```
容器内应用无法连接外部服务 (MySQL/Redis)
```

**诊断步骤:**

```bash
# 1. 检查网络模式
docker inspect ryplus_uni_workflow | grep -i network

# 2. 测试容器内网络
docker exec ryplus_uni_workflow ping -c 3 127.0.0.1
docker exec ryplus_uni_workflow telnet 127.0.0.1 3306
docker exec ryplus_uni_workflow nc -zv 127.0.0.1 6379

# 3. 检查Docker网络
docker network ls
docker network inspect bridge

# 4. 查看容器IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ryplus_uni_workflow
```

**解决方案:**

项目使用 `host` 网络模式,容器直接使用宿主机网络:

```yaml
# docker-compose.yml
services:
  ryplus_uni_workflow:
    image: ryplus_uni_workflow:5.4.1
    container_name: ryplus_uni_workflow
    network_mode: "host"  # 使用宿主机网络
    environment:
      DB_HOST: 127.0.0.1
      REDIS_HOST: 127.0.0.1
```

```bash
# 使用bridge网络 (需要配置)
docker run -d \
    --name ryplus_uni_workflow \
    --network bridge \
    -p 5503:8080 \
    -e DB_HOST=host.docker.internal \
    ryplus_uni_workflow:5.4.1
```

## 性能问题排查

### 1. 慢接口诊断

**使用 Spring Boot Actuator 监控:**

项目配置了 Actuator 端点:

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: '*'  # 暴露所有端点
  endpoint:
    health:
      show-details: ALWAYS  # 显示详细健康信息
```

**访问监控端点:**

```bash
# 1. 健康检查
curl http://localhost:5503/actuator/health | jq

# 2. 应用信息
curl http://localhost:5503/actuator/info | jq

# 3. 指标查询
curl http://localhost:5503/actuator/metrics | jq
curl http://localhost:5503/actuator/metrics/jvm.memory.used | jq
curl http://localhost:5503/actuator/metrics/http.server.requests | jq

# 4. 线程信息
curl http://localhost:5503/actuator/threaddump > threaddump.txt

# 5. 堆信息
curl http://localhost:5503/actuator/heapdump -o heapdump.hprof

# 6. 日志级别
curl http://localhost:5503/actuator/loggers
curl -X POST http://localhost:5503/actuator/loggers/plus.ruoyi \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel":"DEBUG"}'
```

**接口性能分析:**

```bash
# 1. 使用wrk压测
wrk -t4 -c100 -d30s http://localhost:5503/api/user/list

# 2. 使用ab压测
ab -n 1000 -c 100 http://localhost:5503/api/user/list

# 3. 分析慢接口日志
grep -E "cost=[0-9]{4,}" logs/ryplus_uni_workflow-info.log | \
    awk '{print $NF}' | sort -t= -k2 -rn | head -20
```

### 2. JVM调优

**当前JVM配置 (Dockerfile):**

```dockerfile
-XX:+UseZGC                    # 使用ZGC垃圾收集器
-XX:+HeapDumpOnOutOfMemoryError  # OOM时生成堆转储
-XX:HeapDumpPath=/ruoyi/server/logs/
```

**推荐JVM参数:**

```bash
# 生产环境JVM参数
JAVA_OPTS="
  # 堆内存设置
  -Xms4g
  -Xmx4g
  -XX:MetaspaceSize=256m
  -XX:MaxMetaspaceSize=512m

  # GC设置 (ZGC)
  -XX:+UseZGC
  -XX:+ZGenerational
  -XX:MaxGCPauseMillis=50

  # GC日志
  -Xlog:gc*:file=/ruoyi/server/logs/gc.log:time,level,tags:filecount=10,filesize=100M

  # OOM处理
  -XX:+HeapDumpOnOutOfMemoryError
  -XX:HeapDumpPath=/ruoyi/server/logs/
  -XX:+ExitOnOutOfMemoryError

  # 性能优化
  -XX:+AlwaysPreTouch
  -XX:+UseStringDeduplication

  # 远程调试 (开发环境)
  -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
"
```

**GC日志分析:**

```bash
# 查看GC日志
tail -f /ruoyi/server/logs/gc.log

# GC分析工具
# 1. GCViewer: https://github.com/chewiebug/GCViewer
# 2. GCEasy: https://gceasy.io/
# 3. JClarity Censum: https://www.jclarity.com/censum/
```

### 3. 线程池监控

**诊断步骤:**

```bash
# 1. 查看线程状态
curl http://localhost:5503/actuator/threaddump | jq '.threads[] | select(.threadState=="BLOCKED")'

# 2. 统计线程状态
curl http://localhost:5503/actuator/threaddump | jq '.threads[].threadState' | sort | uniq -c

# 3. 查找死锁
curl http://localhost:5503/actuator/threaddump | jq '.threads[] | select(.lockedMonitors | length > 0)'

# 4. 使用jstack分析
docker exec ryplus_uni_workflow jstack <PID> > thread.dump
```

**线程池配置优化:**

```java
// 自定义线程池
@Configuration
public class ThreadPoolConfig {

    @Bean("taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 核心线程数 = CPU核心数 * 2
        executor.setCorePoolSize(Runtime.getRuntime().availableProcessors() * 2);

        // 最大线程数
        executor.setMaxPoolSize(200);

        // 队列容量
        executor.setQueueCapacity(1000);

        // 线程名前缀
        executor.setThreadNamePrefix("async-task-");

        // 拒绝策略: CallerRunsPolicy (调用者运行)
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        // 等待所有任务完成后关闭
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);

        executor.initialize();
        return executor;
    }
}
```

### 4. 数据库连接池监控

**HikariCP监控指标:**

```bash
# 活跃连接数
curl http://localhost:5503/actuator/metrics/hikaricp.connections.active | jq

# 空闲连接数
curl http://localhost:5503/actuator/metrics/hikaricp.connections.idle | jq

# 等待连接数
curl http://localhost:5503/actuator/metrics/hikaricp.connections.pending | jq

# 连接超时数
curl http://localhost:5503/actuator/metrics/hikaricp.connections.timeout | jq

# 连接使用时间
curl http://localhost:5503/actuator/metrics/hikaricp.connections.usage | jq
```

**告警阈值设置:**

```yaml
# Prometheus告警规则
groups:
  - name: hikaricp
    rules:
      # 连接池使用率超过80%
      - alert: HikariCPHighUsage
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "HikariCP连接池使用率过高"

      # 连接等待
      - alert: HikariCPPending
        expr: hikaricp_connections_pending > 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "HikariCP连接等待过多"
```

## 监控与健康检查

### 1. Spring Boot Actuator

**健康检查配置:**

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: '*'  # 暴露所有端点
      base-path: /actuator
  endpoint:
    health:
      show-details: ALWAYS    # 始终显示详细信息
      probes:
        enabled: true         # 启用探针
    logfile:
      external-file: ./logs/sys-console.log
```

**可用端点列表:**

```bash
# 查看所有端点
curl http://localhost:5503/actuator | jq '.\_links | keys'

# 常用端点:
# /actuator/health          - 健康状态
# /actuator/info            - 应用信息
# /actuator/metrics         - 指标数据
# /actuator/env             - 环境变量
# /actuator/beans           - Spring Bean列表
# /actuator/configprops     - 配置属性
# /actuator/threaddump      - 线程转储
# /actuator/heapdump        - 堆转储
# /actuator/loggers         - 日志配置
# /actuator/httptrace       - HTTP跟踪
# /actuator/scheduledtasks  - 定时任务
```

**健康检查响应:**

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 536870912000,
        "free": 268435456000,
        "threshold": 10485760
      }
    },
    "ping": {
      "status": "UP"
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "7.2.8"
      }
    }
  }
}
```

### 2. 自定义健康指标

```java
// 自定义健康检查
@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public Health health() {
        try {
            // 检查Redis连接
            String pong = redisTemplate.execute((RedisCallback<String>) connection -> {
                return connection.ping();
            });

            if ("PONG".equals(pong)) {
                return Health.up()
                    .withDetail("redis", "可用")
                    .withDetail("timestamp", System.currentTimeMillis())
                    .build();
            } else {
                return Health.down()
                    .withDetail("redis", "连接异常")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### 3. Liveness/Readiness探针

**Kubernetes配置:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ryplus-uni-workflow
spec:
  containers:
  - name: app
    image: ryplus_uni_workflow:5.4.1
    ports:
    - containerPort: 8080

    # 存活探针 (容器是否运行)
    livenessProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      initialDelaySeconds: 60
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3

    # 就绪探针 (容器是否准备好接收流量)
    readinessProbe:
      httpGet:
        path: /actuator/health/readiness
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
```

**Docker健康检查:**

```dockerfile
# Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

## 故障自动诊断脚本

**综合诊断脚本:**

```bash
#!/bin/bash
# auto-diagnose.sh - 自动故障诊断脚本

set -e

APP_NAME="ryplus_uni_workflow"
LOG_DIR="/home/ubuntu/apps/${APP_NAME}/logs"
REPORT_FILE="/tmp/diagnose_$(date +%Y%m%d_%H%M%S).txt"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${REPORT_FILE}"
}

log "========================================="
log "开始自动故障诊断"
log "========================================="

# 1. 应用状态检查
log ""
log "【1. 应用状态】"
if systemctl is-active --quiet ${APP_NAME} 2>/dev/null; then
    log "✅ 服务状态: 运行中"
elif docker ps | grep -q ${APP_NAME}; then
    log "✅ 容器状态: 运行中"
else
    log "❌ 服务状态: 已停止"
fi

# 2. 端口检查
log ""
log "【2. 端口监听】"
for port in 5503 8080 3306 6379; do
    if ss -tlnp | grep -q ":${port}"; then
        log "✅ 端口 ${port}: 监听中"
    else
        log "⚠️  端口 ${port}: 未监听"
    fi
done

# 3. 健康检查
log ""
log "【3. 健康检查】"
HEALTH_URL="http://localhost:5503/actuator/health"
if curl -sf "${HEALTH_URL}" >/dev/null; then
    HEALTH_STATUS=$(curl -s "${HEALTH_URL}" | jq -r '.status')
    log "✅ 健康状态: ${HEALTH_STATUS}"
else
    log "❌ 健康检查: 失败"
fi

# 4. 数据库连接
log ""
log "【4. 数据库连接】"
if mysql -h127.0.0.1 -uroot -p'password' -e "SELECT 1" >/dev/null 2>&1; then
    MYSQL_CONN=$(mysql -h127.0.0.1 -uroot -p'password' -e "SHOW STATUS LIKE 'Threads_connected'" | awk 'NR==2 {print $2}')
    log "✅ MySQL: 连接正常 (${MYSQL_CONN} 个连接)"
else
    log "❌ MySQL: 连接失败"
fi

# 5. Redis连接
log ""
log "【5. Redis连接】"
if redis-cli -a ruoyi123 --no-auth-warning ping >/dev/null 2>&1; then
    REDIS_CONN=$(redis-cli -a ruoyi123 --no-auth-warning INFO clients | grep connected_clients | awk -F: '{print $2}' | tr -d '\r')
    log "✅ Redis: 连接正常 (${REDIS_CONN} 个连接)"
else
    log "❌ Redis: 连接失败"
fi

# 6. 资源使用
log ""
log "【6. 资源使用】"
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

log "CPU使用率: ${CPU_USAGE}%"
log "内存使用率: ${MEM_USAGE}%"
log "磁盘使用率: ${DISK_USAGE}%"

if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    log "⚠️  CPU使用率过高"
fi
if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
    log "⚠️  内存使用率过高"
fi
if [ ${DISK_USAGE} -gt 80 ]; then
    log "⚠️  磁盘使用率过高"
fi

# 7. 最近错误
log ""
log "【7. 最近错误 (最近10条)】"
if [ -f "${LOG_DIR}/${APP_NAME}-error.log" ]; then
    tail -10 "${LOG_DIR}/${APP_NAME}-error.log" | tee -a "${REPORT_FILE}"
else
    log "未找到错误日志"
fi

# 8. 连接池状态
log ""
log "【8. 连接池状态】"
HIKARI_ACTIVE=$(curl -s http://localhost:5503/actuator/metrics/hikaricp.connections.active 2>/dev/null | jq -r '.measurements[0].value' || echo "N/A")
HIKARI_MAX=$(curl -s http://localhost:5503/actuator/metrics/hikaricp.connections.max 2>/dev/null | jq -r '.measurements[0].value' || echo "N/A")
log "HikariCP活跃连接: ${HIKARI_ACTIVE}/${HIKARI_MAX}"

# 9. JVM状态
log ""
log "【9. JVM状态】"
JVM_HEAP_USED=$(curl -s http://localhost:5503/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' || echo "N/A")
JVM_HEAP_MAX=$(curl -s http://localhost:5503/actuator/metrics/jvm.memory.max 2>/dev/null | jq -r '.measurements[0].value' || echo "N/A")
if [ "${JVM_HEAP_USED}" != "N/A" ] && [ "${JVM_HEAP_MAX}" != "N/A" ]; then
    JVM_USAGE=$(awk "BEGIN {printf \"%.1f\", ${JVM_HEAP_USED}/${JVM_HEAP_MAX}*100}")
    log "JVM堆内存使用: ${JVM_USAGE}%"
fi

# 10. 生成诊断建议
log ""
log "【10. 诊断建议】"
if [ ${DISK_USAGE} -gt 90 ]; then
    log "建议: 清理磁盘空间"
fi
if (( $(echo "$MEM_USAGE > 85" | bc -l) )); then
    log "建议: 检查内存泄漏,考虑增加内存或优化代码"
fi
if [ "${HEALTH_STATUS}" != "UP" ]; then
    log "建议: 检查应用日志,排查健康检查失败原因"
fi

log ""
log "========================================="
log "诊断完成"
log "报告保存: ${REPORT_FILE}"
log "========================================="

# 发送诊断报告 (可选)
# mail -s "故障诊断报告" admin@example.com < "${REPORT_FILE}"
```

**定时执行诊断:**

```bash
# 添加到crontab
# 每小时执行一次诊断
0 * * * * /opt/scripts/auto-diagnose.sh

# 或使用watch实时监控
watch -n 60 '/opt/scripts/auto-diagnose.sh'
```

## 常见问题快速参考

### 应用无法启动

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|---------|
| Port already in use | 端口被占用 | `lsof -i :5503` 查找并 `kill` 进程 |
| Failed to load ApplicationContext | 配置文件错误 | 检查 YAML 语法和配置项 |
| Communications link failure | 数据库连接失败 | 检查数据库状态和网络连通性 |
| Could not create bean | 依赖注入失败 | 检查 Bean 定义和包扫描路径 |

### 数据库问题

| 症状 | 可能原因 | 解决方案 |
|-----|---------|---------|
| Connection timeout | 连接池耗尽 | 增加 `maxPoolSize`,检查连接泄漏 |
| Deadlock found | 死锁 | 统一锁顺序,使用乐观锁 |
| Query timeout | 慢SQL | 添加索引,优化查询 |

### Redis问题

| 症状 | 可能原因 | 解决方案 |
|-----|---------|---------|
| Unable to connect | Redis未启动 | `systemctl start redis` |
| OOM command not allowed | 内存溢出 | 设置淘汰策略,清理无用key |
| Timeout acquiring lock | 锁竞争激烈 | 优化锁粒度,使用分段锁 |

### 性能问题

| 症状 | 可能原因 | 解决方案 |
|-----|---------|---------|
| 接口响应慢 | 慢SQL/缓存未命中 | 优化SQL,增加缓存 |
| CPU使用率高 | 死循环/GC频繁 | 排查代码,调整GC参数 |
| 内存溢出 | 内存泄漏 | 分析堆转储,修复泄漏 |

## 总结

本文档基于 RuoYi-Plus-UniApp 项目的实际配置,提供了全面的故障排查指南:

**核心能力:**
- ✅ 系统化排查流程 (5步标准流程)
- ✅ 应用启动诊断 (端口/配置/依赖/数据库)
- ✅ 数据库故障排查 (HikariCP 连接池配置)
- ✅ Redis故障排查 (Redisson 配置)
- ✅ 异常处理机制 (GlobalExceptionHandler等3个处理器)
- ✅ 日志分析技巧 (logback-plus.xml 配置)
- ✅ Docker容器诊断 (OOM/网络/启动故障)
- ✅ 性能问题排查 (JVM/线程池/连接池监控)
- ✅ Spring Boot Actuator (健康检查/指标监控)
- ✅ 自动化诊断脚本 (综合诊断工具)

**关键配置参考:**
- HikariCP: maxPoolSize=50, minIdle=20, timeout=30s (生产环境)
- Redisson: threads=16, poolSize=64, timeout=3000 (生产环境)
- Actuator: exposure.include=*, health.show-details=ALWAYS
- JVM: UseZGC, HeapDumpOnOutOfMemoryError
- Logback: CONSOLE + FILE + INFO + ERROR + SQL (异步日志)

通过本文档的系统化诊断流程、详细的配置说明和真实的案例分析,可以帮助团队快速定位和解决生产环境中的各类故障,提升系统稳定性和运维效率。
