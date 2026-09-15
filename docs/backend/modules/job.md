# 定时任务模块 (ruoyi-job)

## 概述

`ruoyi-job` 是框架内置的**轻量级分布式定时任务模块**。自包含、可插拔：无需独立 Server 进程，仅依赖项目已有的 MySQL 与 Redis（Redisson），从 `pom.xml` 中删除依赖即可整体移除，不留残余。

模块提供完整的任务定义、cron 调度、集群互斥、广播路由、失败重试、超时中断、执行日志与管理端页面，覆盖绝大多数「按时跑一段业务代码」的需求。

### 与 SnailJob 的关系

框架同时集成了 SnailJob（`ruoyi-common-job` + `ruoyi-snailjob-server`），两者是**并存的选型关系**，不是替代：

| 维度 | ruoyi-job（内置） | SnailJob |
|------|------------------|----------|
| 部署形态 | 随应用启动，无额外进程 | 需独立部署 Server 端 |
| 外部依赖 | 复用项目现有 MySQL + Redis | 独立数据库 + 长连接心跳 |
| 调度粒度 | 分钟级 cron（扫描间隔默认 5 秒） | 秒级、工作流编排 |
| 能力范围 | 定时触发、重试、广播、超时 | 分布式分片、任务编排、可视化重试队列、告警 |
| 适用场景 | 中小型项目、单体部署、不想多维护一个服务 | 任务量大、需要分片与复杂调度策略 |

选择原则：**只是想定时跑点东西，用 `ruoyi-job`；需要分片、编排、独立运维台，用 SnailJob。** 两者可同时启用，互不干扰。

### 核心特性

- **无主从的平等调度** - 集群内各节点地位相同，不需要选主，任何节点挂掉都不影响其余节点继续调度
- **双重互斥保证不重复执行** - Redisson 锁快速过滤 + 数据库 CAS 兜底，Redis 故障时仍不会重复执行
- **两种路由策略** - 集群（只跑一个节点）与广播（所有节点各跑一次）
- **看门狗式并发控制** - 「禁止并发」用自动续期锁，业务跑多久持有多久，不会因固定 TTL 提前失效
- **失败重试与超时中断** - 独立重试池与看门狗池，不占用业务线程
- **优雅停机** - 停机时等待在途任务收尾，超时才中断，并把残留日志标记为「已中断」
- **注解式执行器** - 业务方标注 `@JobHandler` 即可，无需依赖调度模块本身
- **可插拔** - 默认关闭；建表脚本独立成文件，不启用就不建表

### 模块结构

```
ruoyi-job/
├── config/
│   ├── JobAutoConfiguration.java   # 自动装配，条件开关
│   └── JobProperties.java          # ruoyi.job.* 配置
├── constant/JobConstants.java      # Redis 键（唯一的分支差异点）
├── core/
│   ├── JobScheduler.java           # 调度核心：扫描 + 互斥 + 推进
│   ├── JobInvoker.java             # 分发执行：路由、并发、重试、超时
│   ├── JobHandlerRegistry.java     # 启动期扫描注册执行器
│   ├── JobPlatformContext.java     # 平台级上下文（绕开数据过滤）
│   ├── CronUtils.java              # cron 解析与时区
│   └── NodeIdUtils.java            # 节点唯一标识
├── controller/  service/  dao/  mapper/  domain/   # 标准四层 CRUD
└── handler/JobLogCleanHandler.java # 内置：清理过期日志
```

执行器契约（`@JobHandler` 注解与 `JobContext`）放在 `ruoyi-common-core` 的 `scheduler` 包下，任何业务模块依赖 core 即可编写执行器，**无需依赖调度模块本身**。

---

## 快速开始

### 第一步：启用模块

模块**默认关闭**，在 `application.yml` 中开启：

```yaml
ruoyi:
  job:
    enabled: true
```

默认关闭是刻意的——避免升级框架后，已有部署毫无预期地多出一个后台调度线程和两张表。

### 第二步：执行建表脚本

建表脚本独立成文件，四种数据库各一份：

```
script/sql/ry_plus_job_lite.sql                      # MySQL
script/sql/oracle/oracle_ry_plus_job_lite.sql        # Oracle
script/sql/postgres/postgres_ry_plus_job_lite.sql    # PostgreSQL
script/sql/sqlserver/sqlserver_ry_plus_job_lite.sql  # SQL Server
```

脚本一个文件搞定 `job_info` + `job_log` + 字典 + 菜单 + 示例任务数据，幂等可重复执行。

两点注意：

- **前置依赖**：需先执行 `ry_plus_sys.sql`，因为本脚本要写 `sys_dict_type` / `sys_dict_data` / `sys_menu`。
- **破坏性**：脚本开头会 `DROP` 两张表，重复执行将清空已有任务定义与全部历史日志，**生产环境慎用**。

### 第三步：编写执行器

在任意 Spring Bean 的方法上标注 `@JobHandler`：

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderJobHandler {

    private final IOrderService orderService;

    /**
     * 取消超时未支付订单
     */
    @JobHandler(value = "cancelTimeoutOrder", desc = "取消超时未支付订单", sampleCron = "0 0/10 * * * ?")
    public void cancelTimeoutOrder() {
        int count = orderService.cancelTimeout();
        log.info("取消超时订单 {} 笔", count);
    }
}
```

### 第四步：在管理端创建任务

进入「系统监控 → 调度任务」，新增任务时在「执行器」下拉中选中 `cancelTimeoutOrder`——注解里的 `desc` 会作为友好名称展示，`sampleCron` 会自动带出建议的 cron 表达式。

保存后把状态置为「运行」，调度器会在下一个扫描轮次接管它。

---

## 配置项

全部配置以 `ruoyi.job` 为前缀：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enabled` | `boolean` | `false` | 是否启用内置调度器 |
| `scan-interval` | `Duration` | `5s` | 调度扫描间隔 |
| `pool-size` | `int` | `10` | 业务执行线程池核心线程数 |
| `misfire-threshold` | `Duration` | `60s` | 「错过执行」判定阈值 |
| `shutdown-timeout` | `Duration` | `30s` | 停机时等待在途任务的宽限期 |

完整示例：

```yaml
ruoyi:
  job:
    enabled: true
    scan-interval: 5s
    pool-size: 10
    misfire-threshold: 60s
    shutdown-timeout: 30s
```

几个取值上的注意事项：

- **`scan-interval`** 决定调度精度。到分钟级 cron 足够；需要秒级触发或延迟队列，应改用 Redisson 延迟队列，而不是把这个值调到极小。
- **`misfire-threshold` 不能小于 `scan-interval`**。否则每次正常触发都会因为扫描间隔造成的抖动被误判为「错过执行」。
- **`shutdown-timeout` 要权衡**：过短起不到保护作用，过长会拖慢发版——容器编排的停机超时通常在 30~60 秒，超过这个值就会被强杀，宽限期形同虚设。

---

## 执行器开发

### @JobHandler 注解

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `value` | `String` | 是 | 执行器唯一标识，对应 `job_info.invoke_target`，全局唯一 |
| `desc` | `String` | 否 | 中文说明，用于管理端「执行器下拉」的友好展示 |
| `sampleCron` | `String` | 否 | 建议的 cron 表达式，新增任务选中该执行器时前端自动带出 |

### 两种方法签名

签名只允许以下两种，写错会在启动时报错：

```java
// ① 无参：适合不需要上下文的简单任务
@JobHandler(value = "sampleHello", desc = "示例-最简任务", sampleCron = "0 * * * * ?")
public void sampleHello() {
    log.info("hello");
}

// ② 带上下文：需要参数、节点、重试信息时使用
@JobHandler(value = "sampleSyncData", desc = "示例-参数透传", sampleCron = "0 0 2 * * ?")
public void sampleSyncData(JobContext ctx) {
    log.info("参数={} 节点={}", ctx.getJobParams(), ctx.getExecuteNode());
}
```

### JobContext 上下文

| 字段 | 类型 | 说明 |
|------|------|------|
| `jobId` | `Long` | 任务ID |
| `jobName` | `String` | 任务名称 |
| `jobParams` | `String` | 任务参数，`job_info.job_params` 原样透传 |
| `executeNode` | `String` | 本次执行节点标识 `IP:port` |
| `retryCount` | `int` | 当前重试次数，0 表示首次执行 |
| `triggerTime` | `long` | 本次触发时刻（毫秒时间戳） |

`triggerTime` 值得特别说明：**业务可以拿它作为幂等键**，避免广播或重试导致的重复处理。同一次触发在所有节点、所有重试轮次上的 `triggerTime` 都相同。

`jobParams` 是纯字符串透传。若存的是 JSON，业务侧自行解析：

```java
@JobHandler(value = "syncByConfig", desc = "按配置同步")
public void syncByConfig(JobContext ctx) {
    SyncConfig config = JsonUtils.parseObject(ctx.getJobParams(), SyncConfig.class);
    // ...
}
```

`JobContext` 放在 `common-core`（最底层，不依赖 JSON 模块），所以没有内置 JSON 解析方法。各业务模块均可依赖 `ruoyi-common-json`，一行 `JsonUtils.parseObject` 即可。

### 执行器标识重复会启动失败

`JobHandlerRegistry` 在注册时发现重名直接抛异常：

```java
if (holderMap.containsKey(name)) {
    throw new IllegalStateException("重复的 @JobHandler 执行器标识: " + name);
}
```

这是 fail-fast 的刻意设计。若允许后者覆盖前者，管理端配置的任务会调用到一个你以为不存在的方法，且完全没有提示。

### 懒加载 Bean 里的执行器不会被注册

注册发生在所有单例初始化完成之后（`SmartInitializingSingleton`），此时对懒加载 Bean 调 `getBean` 会强制提前实例化，既拖慢启动，也让 `@Lazy` 失去意义。因此注册表**跳过所有懒加载 Bean**：

```java
if (isLazyInit(beanFactory, beanName)) {
    continue;
}
```

代价是 `@Lazy` Bean 里的 `@JobHandler` 不会被注册。执行器本就应是随应用常驻的组件，不应声明为懒加载——如果你的执行器"没生效"，先检查它所在的 Bean 是不是懒加载的。

---

## 调度原理

### 无主从的平等扫描

集群内**没有主从之分**，每个应用节点都独立、周期性地扫描到期任务：

```
节点A ──┐
节点B ──┼──► 各自扫描 job_info ──► 抢同一个触发锁 ──► 只有一个胜出
节点C ──┘
```

好处是不需要选主机制，任何节点挂掉都不影响其余节点继续调度；代价是每个节点都要扫库，因此扫描 SQL 的效率很关键（见下文索引设计）。

调度器启动时首次延迟 10 秒再开始扫描，留给 `JobHandlerRegistry` 完成执行器注册。

### 两道互斥

同一次触发只被一个节点执行，靠两道独立的互斥保证：

**第一道：Redisson 锁**，幂等键为 `job:trigger:{任务ID}:{触发时刻}`

```java
String triggerKey = JobConstants.TRIGGER_LOCK_PREFIX + job.getId() + ":" + triggerTime;
RLock lock = RedisUtils.getLock(triggerKey);
locked = lock.tryLock(0, 60, TimeUnit.SECONDS);   // 非阻塞
if (!locked) {
    return;  // 本次触发已被其他节点占有
}
```

**第二道：数据库 CAS**，按「期望值 = 本次触发时刻」推进 `next_execute_time`

```java
private boolean advanceNextTime(Long jobId, Date expected, Date next) {
    int rows = jobInfoDao.lambdaUpdate()
        .set(JobInfo::getNextExecuteTime, next)
        .eq(JobInfo::getId, jobId)
        .eq(JobInfo::getNextExecuteTime, expected)   // ← CAS 条件
        .update();
    return rows > 0;
}
```

只有 `rows > 0` 的节点才真正拥有本次触发的执行权。

### 为什么需要第二道

Redis 锁只是**快速过滤**，避免多节点同时打数据库。真正的正确性由数据库 CAS 兜底：

- Redis 整体故障时，所有节点的 `tryLock` 都可能失败或异常，但 CAS 仍然只会有一个节点成功
- 锁租约提前失效（60 秒到期而节点仍在处理）时，第二个节点抢到锁也过不了 CAS

这两层的分工是：**Redis 管性能，数据库管正确性。** 只留一层都不够——只有 Redis 锁则 Redis 故障时会重复执行；只有 CAS 则每轮扫描所有节点都要打一次数据库写。

### 扫描 SQL 的索引设计

```java
List<JobInfo> jobs = jobInfoDao.list(PlusLambdaQuery.<JobInfo>of()
    .eq(JobInfo::getStatus, "1")
    .and(w -> w.le(JobInfo::getNextExecuteTime, now).or().isNull(JobInfo::getNextExecuteTime)));
```

到期条件**下推给数据库**而不是拉回内存判断，为的是命中 `idx_status_next (status, next_execute_time)` 索引。绝大多数扫描轮次会直接返回空集，避免把全部启用任务（含 `job_params`、`remark` 等大字段）反复捞回内存。

额外带上 `next_execute_time IS NULL` 分支，是为了兜住手工改库等异常数据——查出来后交由初始化逻辑补算下次执行时间。

初始化写入同样带 `IS NULL` 条件，保证多节点同时发现未初始化任务时只有一个写入成功。

### 触发语义：最多一次

这是必须明确的语义边界：

> 推进成功后、分发执行前节点崩溃，这次触发会**丢失且不会被其他节点补偿**。

也就是说 `ruoyi-job` 提供的是 **at-most-once**（最多一次），不是 at-least-once。对于「漏跑一次会造成业务损失」的场景，业务侧需要自行设计补偿机制，例如下一次执行时回扫未处理的数据。

### 时钟同步要求

到期判断依赖**各节点本地时钟**。集群部署务必保证节点间时钟同步（NTP），否则触发时刻会由跑得最快的那个节点主导——它先判定到期、先抢到锁、先推进 `next_execute_time`，其余节点的判断就全部作废。

### 错过执行（misfire）

迟到超过 `ruoyi.job.misfire-threshold`（默认 60 秒）才判定为「错过执行」：

```java
long delayMs = now.getTime() - job.getNextExecuteTime().getTime();
boolean misfired = delayMs > jobProperties.getMisfireThreshold().toMillis();
```

策略取自 `job_info.misfire_policy`：

| 取值 | 含义 | 引擎行为 |
|------|------|---------|
| `1` | 立即补一次 | 顺延的同时补跑一次 |
| `2` | 放弃执行 | 只顺延，不补跑 |
| `3` | 顺延到下次（默认） | 只顺延，不补跑 |

**引擎只判断是否等于 `1`**，`2` 与 `3` 的实际行为完全一致。默认给 `3` 是为了防止停机恢复后大量任务集中补偿执行压垮系统——设想停机两小时，十个每分钟执行的任务在恢复瞬间要补跑 1200 次。

被跳过的触发会留下一条跳过日志，管理端可以看到原因。

### 调度线程的自我保护

`ScheduledExecutorService` 的周期任务有一个著名陷阱：**一旦抛出任何 `Throwable`，后续执行会被永久取消，且异常被 `FutureTask` 吞掉不留任何日志。** 表现为进程活着、接口正常，但定时任务再也不跑，没有任何错误信息——这是最难排查的故障形态。

模块做了两层防护：

```java
private void safeScan() {
    try {
        JobPlatformContext.run(this::scan);
    } catch (Throwable t) {   // ← 必须是 Throwable 而非 Exception
        log.error("[job] 调度扫描异常（已拦截，调度继续）", t);
    }
}
```

以及一个每 60 秒运行一次的自检守护，发现扫描任务已终止就自动重建：

```java
private void reviveIfDead(long intervalMs) {
    ScheduledFuture<?> current = scanFuture;
    if (current != null && !current.isDone()) {
        return;
    }
    log.error("[job] 检测到调度扫描任务已终止，正在自动重建");
    scanFuture = scanExecutor.scheduleWithFixedDelay(this::safeScan, 0, intervalMs, TimeUnit.MILLISECONDS);
}
```

---

## 路由策略

`job_info.route_strategy` 决定任务在集群中怎么跑：

| 取值 | 策略 | 行为 |
|------|------|------|
| `1` | 集群（默认） | 抢到触发锁的那个节点在本地执行，全集群只跑一次 |
| `2` | 广播 | 通过 Redis pub/sub 通知所有节点（含自己）各执行一次 |

### 集群模式

适用于绝大多数业务任务：对账、清理、同步、发送通知。跑一次就够，多跑就是重复处理。

### 广播模式

适用于**每个节点都要做一遍**的场景，典型的是刷新本地缓存：

```java
@JobHandler(value = "sampleBroadcast", desc = "示例-广播刷缓存", sampleCron = "0 0/30 * * * ?")
public void sampleBroadcast(JobContext ctx) {
    localCache.reload();   // 每个节点都要刷自己的本地缓存
}
```

### 节点标识如何确定

广播模式下，「执行中」锁的 key 会拼上节点标识以按节点隔离。**一旦两个节点算出相同标识，广播任务会退化成只有一个节点真正执行，且不报任何错**——所以节点标识的唯一性至关重要。

取值按优先级：

1. 系统属性或环境变量 `ruoyi.job.node-id` 显式指定（运维兜底）
2. `HOSTNAME` 环境变量：Docker 下是容器 ID、K8s 下是 Pod 名，天然唯一
3. 本机 IP：仅裸机 / host 网络下可靠

最后统一拼上端口，区分同一主机上的多实例；整体长度截断到 64 字符，对齐 `job_log.execute_node` 的列宽。

**为什么不能只用 IP**：Docker 默认 bridge 网络下，不同宿主机上的容器 IP 普遍都是 `172.17.0.2`，端口也相同，三个节点会算出完全一样的标识。

---

## 并发控制

`job_info.concurrent` 控制同一个任务是否允许并发执行：

| 取值 | 含义 |
|------|------|
| `0` | 禁止并发（默认） |
| `1` | 允许并发 |

### 看门狗锁

禁止并发时，执行前须抢到 Redis 上的「执行中」锁 `job:running:{任务ID}`（广播模式再拼节点标识）。抢不到说明上一轮还没结束，跳过本次并留一条跳过日志。

锁由 **Redisson 看门狗自动续期**：业务跑多久就持有多久；节点崩溃时看门狗随进程消失，锁自动释放，不会永久卡死。

### 为什么不用固定 TTL

假设给锁一个固定的 5 分钟 TTL，而某次业务实际跑了 8 分钟：

```
第 0 分钟  任务开始，拿到锁，TTL 5 分钟
第 5 分钟  锁自动过期 —— 但业务还在跑
第 5 分钟  下一轮触发抢到锁，第二个实例开始跑   ← 真并发发生了
第 10 分钟 第三个实例开始跑                    ← 并发度级联发散
```

「禁止并发」的配置形同虚设，而且越慢的任务并发越严重。看门狗的自动续期 + 持有者校验正是为了消除这个失效窗口。

---

## 线程模型

模块维护三个独立的线程池，职责严格分离：

| 线程池 | 线程名前缀 | 职责 |
|--------|-----------|------|
| 调度扫描 | `job-scheduler-scan` | 单线程，周期扫描到期任务并抢锁推进 |
| 业务执行 | `job-biz-exec` | 实际跑 `@JobHandler` 方法 |
| 失败重试 | `job-retry` | 2 线程，延迟投递重试 |
| 超时看门狗 | `job-timeout-watchdog` | 单线程，置超时标志 + 中断业务线程 |

业务执行池的参数：

```java
this.bizPool = new ThreadPoolExecutor(
    core, core * 2, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(core * 4),
    new NamedThreadFactory("job-biz-exec"),
    new ThreadPoolExecutor.AbortPolicy());
```

### 队列容量为什么是 core * 4

`LinkedBlockingQueue` 满了才会扩容线程到 `maximumPoolSize`。队列过大会让 `maximumPoolSize` 永远不可达——线程数卡在核心值，任务全在队列里排队。

### 拒绝策略为什么必须是 AbortPolicy

**绝不能用 `CallerRunsPolicy`。** 调用方分别是：

- 调度扫描线程（单线程）→ 让它代跑业务会造成**调度整体停摆**
- Redisson 消息分发线程 → 会**拖垮全应用的 Redis 订阅**，包括框架其它订阅通道
- 重试线程、Tomcat 请求线程 → 阻塞重试调度或 HTTP 请求

被拒绝的触发由 `execute()` 捕获并记一条跳过日志，比拖垮整个应用要好得多。

### 看门狗为什么要 removeOnCancelPolicy

```java
watchdogPool.setRemoveOnCancelPolicy(true);
```

任务正常完成时会 `cancel` 看门狗。默认策略下被取消的任务要等到原定触发时刻才出队，期间一直强引用 `Thread` 与 `JobContext`。长超时任务高频执行时会持续堆积，形成内存泄漏。

### 广播回调不能做阻塞 IO

订阅广播频道的回调运行在 **Redisson 的消息分发线程**上，此处绝不能做阻塞 IO——数据库慢查询会拖住该线程，进而影响整个应用的 Redis 订阅。因此回调本身只做一次入队，查任务与执行都切到业务线程池内完成。

---

## 失败重试与超时

### 重试

由 `job_info` 的两个字段控制：

| 字段 | 默认值 | 说明 |
|------|--------|------|
| `max_retry` | `0` | 最大重试次数，0 表示不重试 |
| `retry_interval` | `10` | 重试间隔（秒） |

```java
private void scheduleRetryIfNeeded(JobInfo job, long triggerTime, int retryCount) {
    int max = job.getMaxRetry() == null ? 0 : job.getMaxRetry();
    if (retryCount >= max) {
        return;
    }
    int interval = job.getRetryInterval() == null ? 10 : job.getRetryInterval();
    retryPool.schedule(() -> execute(job, triggerTime, retryCount + 1), interval, TimeUnit.SECONDS);
}
```

三个要点：

- 重试是**固定间隔**，不做指数退避
- 重试投递到独立的 `job-retry` 池，不占用调度扫描线程
- 重试沿用**同一个 `triggerTime`**，所以用它做幂等键时，重试不会被误判为新的一次触发

每次重试都会写一条独立的 `job_log`，`retry_count` 字段标明这是第几次。

### 超时

`timeout` 字段单位为秒，`0` 或 `null` 表示不限制。

超时判定**不是**把业务丢到另一个线程再 `Future.get(timeout)`。源码里明确否定了那种写法：那样每个任务会占用两个线程，外层全部阻塞、内层排队无线程可用时会集体卡到超时才恢复，造成大面积伪超时失败。

实际做法是看门狗给**当前业务线程**发中断信号：

```java
Thread worker = Thread.currentThread();
AtomicBoolean timedOut = new AtomicBoolean(false);
ScheduledFuture<?> watchdog = timeoutPool.schedule(() -> {
    timedOut.set(true);
    worker.interrupt();
    log.warn("[job] 任务[{}]执行超过 {}s，已发出中断信号", ctx.getJobName(), timeout);
}, timeout, TimeUnit.SECONDS);
```

### 超时后业务不响应中断会怎样

Java 无法强杀线程，`interrupt()` 只是发信号（与 `Future.cancel(true)` 语义一致）。如果业务代码没有响应中断的逻辑（比如正卡在一个没有超时设置的 HTTP 调用里），本方法会**继续等它跑完**。

这是有意的：提前放行会让「执行中」日志和「禁止并发」标记在业务仍在运行时就被释放，导致同一任务出现真并发。宁可等，也不能制造并发。

等它跑完之后仍然按超时失败处理：

```java
if (timedOut.get()) {
    throw new RuntimeException("任务执行超时(" + timeout + "s)，业务未响应中断但已执行完毕");
}
```

这样重试与告警链路照常生效——任务已经超出了约定耗时，这个事实不应该因为它最终跑完了就被掩盖。

### 中断标志的清理

`finally` 块里有一段容易被忽略但很关键的处理：

```java
watchdog.cancel(false);
boolean interrupted = Thread.interrupted();   // 读取并清除
if (interrupted && !timedOut.get()) {
    worker.interrupt();                        // 中断另有来源，恢复标志位
}
```

`Thread.interrupted()` 会读取并**清除**中断标志。不清除的话，这个线程被线程池复用给下一个任务时会立刻抛 `InterruptedException`，表现为「毫不相干的任务随机失败」。

但如果中断另有来源（比如应用正在关闭），标志位要恢复回去交由线程池处理，不能被这里吞掉。

### 异常归因

由超时中断引发的异常统一归因为超时：

```java
throw timedOut.get() ? new RuntimeException("任务执行超时(" + timeout + "s)", e) : e;
```

否则管理端会显示一个 `InterruptedException`，对使用者来说完全不知道发生了什么。原异常作为 cause 保留在堆栈里。

---

## 优雅停机

停机分两步，顺序不能颠倒：

**第一步，调度器停止接收新触发。** `JobScheduler.stop()` 先 `shutdown()` 停止后续周期，再给当前这一轮扫描最多 5 秒收尾。

这个等待是必要的：扫描线程可能正持有某个任务的触发锁并处于「CAS 推进 `next_execute_time`」的中途，直接强杀会让锁只能等租约到期，期间该任务**在整个集群里都无法被触发**。

等待上限刻意取得比 `shutdown-timeout` 短——调度扫描本身很轻（抢锁 + 两次数据库操作），留几秒足够，剩余的宽限时间应该留给真正在跑业务的执行器。

**第二步，执行器收尾。** 先停重试池与看门狗池，再 `shutdown` 业务池并 `awaitTermination` 等在途任务跑完，超时才强制中断。最后把本节点残留的「执行中」日志标记为已中断。

最后这步很重要：否则管理端会永远看到一批状态停在「执行中」的日志，无法区分「真的还在跑」和「上次停机时被杀掉了」。

---

## 租户与数据权限

这一节是使用 `ruoyi-job` 最容易踩坑的地方，务必读完。

### 两张表为什么没有 tenant_id

定时任务是**平台级**能力，由平台运维统一管理，不做租户隔离，因此 `job_info` 与 `job_log` 都没有 `tenant_id` 列。

理由也很实际：执行器是随应用部署的 Java 代码，租户无法自行新增；让每个租户维护一份任务定义没有意义。需要按租户处理业务时，由执行器内部遍历租户。

两表已**硬编码**进 `PlusTenantLineHandler.SYSTEM_EXCLUDE_TABLES`，不交由 `application.yml` 维护。租户拦截器按表名判断，实体不继承 `TenantEntity` 并不会让过滤失效，故必须在拦截器内登记。

硬编码而非配置化是刻意的：漏配即报错（`Unknown column 'tenant_id'`），立刻暴露；写在 yml 里被人误删则会静默出错。

### 平台级上下文

引擎线程（调度扫描、业务执行池、Redisson 消息分发、看门狗）都**没有登录态**。而 `PlusDataPermissionHandler` 取不到 `LoginUser` 时会拼一个 `1=0` 的永假条件拒绝所有数据，是**静默出错**而非报错。

因此引擎对 `job_info` / `job_log` 的所有读写一律通过 `JobPlatformContext` 包裹：

```java
public static <T> T call(Supplier<T> action) {
    return DataPermissionHelper.ignore(action);
}

public static void run(Runnable action) {
    DataPermissionHelper.ignore(action);
}
```

当前 job 的 DAO 未标注 `@DataPermission` 故尚未触发，但本项目是供下游二次开发的框架模板。一旦有人为「按部门查看任务」加上该注解，调度扫描会立刻查不到任何任务、任务日志会突然全部写不进去，表现为**定时任务集体停摆，却只有一行 warn**。这层包裹是提前铺好的防护。

### 为什么不需要 TenantHelper.ignore

源码里特意注明了「勿补回来」。租户过滤有两条彼此独立的关闭路径：

1. **表级**：`PlusTenantLineHandler.ignoreTable()` 读排除表集合，两表已在其中，**已经生效**
2. **全局标志**：`TenantHelper.ignore` 走 MyBatis-Plus 的 `InterceptorIgnoreHelper` 让拦截器整体跳过，**纯属冗余**

更关键的是：两张表没有 `tenant_id` 列，万一排除配置被破坏，SQL 会直接报 `Unknown column 'tenant_id'` 而立刻暴露；加上 `ignore` 反而会把这种配置损坏**静默掩盖**。

### 业务执行器必须自行处理上下文

`JobPlatformContext` **绝不能用来包裹业务执行器的调用**，那会让业务代码的查询意外跨部门（多租户版还会跨租户）拿到全量数据。

保护只覆盖引擎自身。业务执行是异步投递到线程池的，`ThreadLocal` 不会传递过去，所以需要按上下文过滤数据的执行器必须自行处理。

### 多租户遍历样板

```java
@JobHandler(value = "sampleTenantLoop", desc = "示例-多租户遍历", sampleCron = "0 0 1 * * ?")
public void sampleTenantLoop(JobContext ctx) {
    // 用 ignore 把租户列表捞全，查租户表本身不能带租户条件
    List<String> tenantIds = TenantHelper.ignore(() ->
        tenantService.listAllEnabledTenantIds());

    // 逐个切换上下文，在其中执行真正的业务逻辑
    for (String tenantId : tenantIds) {
        TenantHelper.dynamic(tenantId, () -> {
            orderService.cancelTimeout();
        });
    }
}
```

两步缺一不可：直接在无登录态的线程里调 `TenantHelper.getTenantId()` 拿不到任何值。

---

## cron 表达式

### 6 位含秒

解析器是 Spring 的 `CronExpression`，**6 位格式**：

```
秒 分 时 日 月 周

0 0 3 * * ?        每天凌晨 3 点
0 0/10 * * * ?     每 10 分钟
0 * * * * ?        每分钟
```

**不支持** Quartz 的 7 位（带年）与 `W` 字符。从 SnailJob / Quartz 迁移表达式时需要注意。

### 时区固定为 Asia/Shanghai

```java
private static final String DEFAULT_ZONE = "Asia/Shanghai";
public static final ZoneId ZONE = resolveZone();
```

**刻意不用 `ZoneId.systemDefault()`。** 项目的 Dockerfile 与 `script/bin/ry.sh` 确实设了 `TZ`，但只要换一种部署方式（K8s manifest 未写 `TZ`、裸 `java -jar`、CI 容器里跑集成测试），JVM 就会退回 UTC。

届时 `0 0 3 * * ?` 会在北京时间 11 点触发，**不报错、不告警，只是所有任务的执行时间集体偏移 8 小时**，属于极难察觉的故障。

需要跨时区部署时用系统属性覆盖，配置非法时回退默认值而非启动失败：

```bash
java -jar -Druoyi.job.zone-id=UTC ruoyi-admin.jar
```

### 为什么要抽出 CronUtils

调度引擎与管理端预览曾各自用 `ZoneId.systemDefault()` 算下次执行时间，且各有一份几乎相同的计算代码。改一处漏一处会导致管理端显示的「预览时间」与实际执行时间对不上。

模块自带 `CronUtilsTest` 共 17 个用例，且测试 JVM 固定为 UTC 运行，只有这样时区断言才是真实有效的。

---

## 数据表结构

### job_info 任务定义表

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `BIGINT` | - | 任务ID，雪花ID |
| `job_name` | `VARCHAR(64)` | - | 任务名称 |
| `job_group` | `VARCHAR(64)` | `DEFAULT` | 任务分组 |
| `invoke_target` | `VARCHAR(200)` | - | 执行器标识，对应注解的 value |
| `job_params` | `VARCHAR(2000)` | `NULL` | 任务参数，透传给执行器 |
| `cron_expression` | `VARCHAR(64)` | `NULL` | cron 表达式，6 位含秒 |
| `route_strategy` | `CHAR(1)` | `1` | 路由策略：1集群 2广播 |
| `misfire_policy` | `CHAR(1)` | `3` | 错过执行策略 |
| `max_retry` | `INT` | `0` | 失败最大重试次数，0 不重试 |
| `retry_interval` | `INT` | `10` | 重试间隔（秒） |
| `timeout` | `INT` | `0` | 执行超时（秒），0 不限制 |
| `concurrent` | `CHAR(1)` | `0` | 是否允许并发：0禁止 1允许 |
| `next_execute_time` | `DATETIME` | `NULL` | 下次执行时间，引擎维护 |
| `status` | `CHAR(1)` | `0` | 任务状态：0暂停 1运行 |

索引 `idx_status_next (status, next_execute_time)`，服务于调度扫描。

### job_log 执行日志表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `BIGINT` | 日志ID |
| `job_id` | `BIGINT` | 任务ID |
| `job_name` / `job_group` / `invoke_target` / `job_params` | - | 冗余快照，任务改名后历史日志仍可追溯 |
| `job_message` | `VARCHAR(500)` | 日志信息，引擎截断到 480 字符 |
| `status` | `CHAR(1)` | 执行状态：0失败 1成功 2执行中 |
| `exception_info` | `TEXT` | 异常堆栈，引擎截断到 4000 字符 |
| `execute_node` | `VARCHAR(64)` | 执行节点 IP:port |
| `retry_count` | `INT` | 当前重试次数 |
| `start_time` / `stop_time` / `cost_time` | - | 开始、结束时间与耗时（毫秒） |

索引 `idx_job_id (job_id)`。

### 字典项

脚本会写入三组字典：

| 字典类型 | 取值 |
|---------|------|
| `job_route_strategy` | 1=集群（集群内只跑一个节点）、2=广播（所有节点各跑一次） |
| `job_execute_status` | 0=失败、1=成功、2=执行中 |
| `job_misfire_policy` | 1=立即补一次、2=放弃执行、3=顺延到下次 |

ID 段占用：菜单 `2200~2222`（已避开商城模块的 `2110~2126`）、字典类型 `2000~2002`、字典数据 `2000~2006`、示例任务 `9001~9005`。

---

## 内置执行器

模块自带一个执行器，开箱可用：

```java
@JobHandler(value = "cleanJobLog", desc = "清理过期调度日志", sampleCron = "0 0 3 * * ?")
public void cleanJobLog(JobContext ctx) { ... }
```

保留天数默认 30 天，可通过任务参数调整。清理采用**分批物理删除**（每批 5000 行），避免单事务大删除长时间锁表，那会阻塞调度器自身写日志，形成死结。

`ruoyi-business` 模块另有 `SampleJobHandler`，提供五个示例执行器覆盖典型用法：

| 标识 | 演示内容 |
|------|---------|
| `sampleHello` | 最简无参任务 |
| `sampleSyncData` | 参数透传 |
| `sampleRetry` | 失败重试 |
| `sampleBroadcast` | 广播刷缓存 |
| `sampleTenantLoop` | 多租户遍历 |

---

## 分支差异

框架有 5 个分支变体，`ruoyi-job` 在各分支间**只有一个文件不同**：`JobConstants`。

多租户分支（master / workflow / 6.x）的三个 Redis 键都带 `GlobalConstants.GLOBAL_REDIS_KEY` 前缀：

```java
String BROADCAST_CHANNEL   = GlobalConstants.GLOBAL_REDIS_KEY + "job:broadcast";
String TRIGGER_LOCK_PREFIX = GlobalConstants.GLOBAL_REDIS_KEY + "job:trigger:";
String RUNNING_KEY_PREFIX  = GlobalConstants.GLOBAL_REDIS_KEY + "job:running:";
```

这个前缀让键不参与租户隔离。调度是平台级能力，而 `TenantKeyPrefixHandler` 会按调用线程的租户上下文给键加前缀，导致引擎线程（无登录态）与管理端 HTTP 线程（有登录态）算出的键不同，后果是：

- 各节点抢的不是同一把锁，造成重复执行
- 广播收发两端对不上，广播任务收不到

且**没有任何错误日志**。

单租户分支（single / 6.x-single）的同名文件不带该前缀，因为其 `KeyPrefixHandler` 只认配置的应用级前缀，不识别 `global:`。

跨分支同步 `ruoyi-job` 时，整个模块只需比对 `JobConstants` 一个文件，其余源码与 `pom.xml` 全分支逐字节一致，可整体复制。

---

## 管理端与接口

### 页面入口

建表脚本会写入两个菜单，位于「系统监控」下：

| 页面 | 说明 |
|------|------|
| 调度任务 | 任务的增删改查、启停、手动执行一次 |
| 调度日志 | 执行日志查询、删除、清空 |

新增任务时，「执行器」是一个下拉框而非手填输入框，选项来自运行时注册表——注解的 `desc` 作展示名，选中后 `sampleCron` 自动填入 cron 输入框。这样避免了手填 `invoke_target` 拼错却要等到下次触发才发现的问题。

cron 输入框带**实时预览**：输入表达式后立即展示未来 5 次的执行时间，表达式非法会当场提示。

### 任务管理接口

| 方法 | 路径 | 权限标识 | 说明 |
|------|------|---------|------|
| GET | `/job/info/pageJobInfos` | `job:info:query` | 分页查询任务 |
| GET | `/job/info/getJobInfo/{id}` | `job:info:query` | 查询任务详情 |
| POST | `/job/info/addJobInfo` | `job:info:add` | 新增任务 |
| PUT | `/job/info/updateJobInfo` | `job:info:update` | 修改任务 |
| DELETE | `/job/info/deleteJobInfos/{ids}` | `job:info:remove` | 批量删除任务 |
| PUT | `/job/info/changeJobInfoStatus` | `job:info:changeStatus` | 启停任务 |
| PUT | `/job/info/runJobInfo/{id}` | `job:info:run` | 手动执行一次 |
| GET | `/job/info/previewJobInfoTriggers` | `job:info:query` | 预览 cron 未来 N 次执行时间 |
| GET | `/job/info/listJobHandlers` | `job:info:query` | 列出已注册执行器 |

增删改与手动执行都标了 `@Log`，会写入操作日志；新增、修改、手动执行还加了 `@RepeatSubmit` 防重复提交。

### 日志接口

| 方法 | 路径 | 权限标识 | 说明 |
|------|------|---------|------|
| GET | `/job/log/pageJobLogs` | `job:log:query` | 分页查询执行日志 |
| DELETE | `/job/log/deleteJobLogs/{ids}` | `job:log:remove` | 批量删除日志 |
| DELETE | `/job/log/cleanJobLogs` | `job:log:remove` | 清空日志，返回清理条数 |

### 预览接口的参数约束

```java
@GetMapping("/previewJobInfoTriggers")
public R<List<String>> previewJobInfoTriggers(
        @NotBlank(message = "cron 表达式不能为空") @RequestParam String cron,
        @Min(value = 1, message = "预览次数至少为 1")
        @Max(value = 20, message = "预览次数最多为 20")
        @RequestParam(defaultValue = "5") int count) {
    return R.ok(jobInfoService.previewNextTriggers(cron, count));
}
```

预览次数上限 20 是必要的防护：cron 计算是逐次向后推演的，不限制次数时一个 `0 0 0 29 2 ?`（闰年 2 月 29 日）这样的稀疏表达式会让服务端空转很久。

### 启停接口为什么不做分组校验

```java
@PutMapping("/changeJobInfoStatus")
public R<Void> changeJobInfoStatus(@RequestBody JobInfoBo bo) {
```

注意这里的 `@RequestBody` 没有跟 `@Validated(EditGroup.class)`。启停只传 `id` 与 `status` 两个字段，套用编辑分组会因为 `jobName` 为空而误报「任务名称不能为空」。`id` 与 `status` 的校验放在 Service 层完成。

项目内的 `changeUserStatus` / `changeRoleStatus` 也是同样的处理方式，保持一致。

### 手动执行一次的语义

手动执行**不影响** `next_execute_time`，也就是不会打乱既定的调度节奏；它走的是与定时触发相同的分发链路，因此同样遵守路由策略与并发控制——一个正在运行且禁止并发的任务，手动触发会被跳过并记一条跳过日志。

---

## 部署与运维

### 集群部署检查清单

上线前逐项确认，这几项出问题都不会有明显报错：

- [ ] **各节点时钟已同步**（NTP）。不同步时触发时刻由最快的节点主导
- [ ] **各节点连的是同一个 Redis**。连到不同实例等于没有互斥，会重复执行
- [ ] **各节点连的是同一个数据库**。CAS 兜底依赖同一张 `job_info`
- [ ] **节点标识唯一**。容器部署下确认 `HOSTNAME` 已注入，或用 `ruoyi.job.node-id` 显式指定
- [ ] **各节点是同一个分支的构建产物**。混用多租户与单租户分支会让 Redis 键前缀不一致
- [ ] **`shutdown-timeout` 不超过编排平台的停机超时**，否则宽限期形同虚设

### 观察调度是否正常

启动阶段看两行日志：

```
[job] 注册执行器: cancelTimeoutOrder -> OrderJobHandler#cancelTimeoutOrder
[job] 调度器已启动，扫描间隔 5000ms
```

前者每个执行器一行，后者全局一行。缺了前者说明执行器没被扫到，缺了后者说明模块没启用。

运行期需要关注的日志：

| 日志片段 | 含义 | 处理 |
|---------|------|------|
| `调度扫描异常（已拦截，调度继续）` | 扫描轮次出错但已兜住 | 看堆栈，通常是数据库连接问题 |
| `检测到调度扫描任务已终止，正在自动重建` | 扫描线程意外死亡 | 属于严重信号，必须查明原因 |
| `本次触发已被其他节点推进，放弃本次执行` | 正常的集群互斥 | 无需处理，频繁出现说明节点时钟有偏差 |
| `错过执行` | 迟到超过阈值 | 偶发正常；持续出现说明调度被堵塞 |

建议把「自动重建」这条接入告警——它意味着调度曾经完全停摆过。

### 完全移除模块

模块设计成可插拔，移除干净只需三步：

1. `application.yml` 里设 `ruoyi.job.enabled: false`（或直接删掉该段配置）
2. `ruoyi-admin/pom.xml` 中移除 `ruoyi-job` 依赖
3. 按需清理数据库：`job_info`、`job_log` 两张表，以及脚本写入的菜单（`2200~2222`）与字典（`job_route_strategy`、`job_execute_status`、`job_misfire_policy`）

业务侧写的 `@JobHandler` 方法不需要动——注解定义在 `ruoyi-common-core`，移除调度模块后它只是一个无人读取的普通注解，不会导致编译失败。这也是把注解放在 core 而非调度模块里的原因之一。

### 与 SnailJob 并存

两套调度可以同时启用，互不干扰：

- 各自独立的表（`job_info`/`job_log` 与 SnailJob 的独立库）
- 各自独立的线程池与触发机制
- 权限标识不冲突（`job:info:*` 与 SnailJob 的菜单权限）

唯一需要留意的是**别把同一个业务同时配到两边**，那会造成实打实的重复执行——两套引擎互相不知道对方的存在，任何互斥机制都不会生效。

迁移时的建议顺序：先在 `ruoyi-job` 建好任务但保持「暂停」，确认执行器注册成功后，暂停 SnailJob 侧的对应任务，再启用这边。

### 备份注意事项

若用 `script/backup/backup.sh` 做数据库备份，`job_info` 与 `job_log` 在主库里，会随主库一起备份，无需额外配置。

注意 SnailJob 用的是**独立库**，需要在 `backup.env` 里填 `JOB_DB_NAME` 才会被备份——这一项和 `ruoyi-job` 无关，两者容易混淆。

---

## 最佳实践

### 1. 执行器保持幂等

调度语义是「最多一次」，但广播模式、失败重试都可能让同一批数据被处理多次。用 `JobContext` 的 `triggerTime` 作幂等键：

```java
@JobHandler(value = "settleOrder", desc = "订单结算")
public void settleOrder(JobContext ctx) {
    String idempotentKey = "settle:" + ctx.getTriggerTime();
    if (!RedisUtils.setObjectIfAbsent(idempotentKey, "1", Duration.ofHours(1))) {
        return;   // 本次触发已被处理
    }
    // 业务逻辑
}
```

同一次触发在所有节点、所有重试轮次上的 `triggerTime` 都相同，正适合做幂等键。

### 2. 长任务务必设置超时

`timeout` 默认 0（不限制）。一个卡死的任务在「禁止并发」下会让该任务**永久不再执行**：看门狗锁一直续期，后续触发全部被跳过。给长任务设一个合理超时，让它能被中断掉。

### 3. 不要在执行器里捕获并吞掉异常

```java
// 不推荐：吞掉异常，管理端永远显示成功，重试也不会触发
@JobHandler(value = "badExample")
public void badExample() {
    try {
        doSomething();
    } catch (Exception e) {
        log.error("出错了", e);
    }
}

// 推荐：让异常抛出，引擎记录堆栈并按策略重试
@JobHandler(value = "goodExample")
public void goodExample() {
    doSomething();
}
```

### 4. 批量任务自己控制批次大小

引擎不限制单次执行处理多少数据。一次捞十万条记录会长时间占用业务线程并撑爆内存，应在执行器内分页处理。

### 5. 生产环境不要重复执行建表脚本

脚本开头会 `DROP TABLE`，重跑等于清空全部任务定义与历史日志。升级时按需手工比对表结构差异。

---

## 常见问题

### 启用了但任务不执行

按以下顺序排查：

1. `ruoyi.job.enabled` 是否为 `true`，默认是 `false`
2. 建表脚本是否执行过，`job_info` / `job_log` 是否存在
3. 任务 `status` 是否为 `1`（运行），`0` 是暂停
4. 启动日志里有没有「调度器已启动，扫描间隔 xxxms」
5. 启动日志里有没有「注册执行器」，没有说明执行器没被扫到

### 执行器没被注册

最常见原因是执行器所在的 Bean 被声明为 `@Lazy`。注册表会跳过所有懒加载 Bean，这是为了避免强制提前实例化。把 `@Lazy` 去掉即可。

其次检查方法签名：只允许无参或唯一入参为 `JobContext`，其余签名会在启动时报错。

### 集群里任务被执行了多次

先确认节点间**时钟是否同步**。时钟不同步时各节点对「是否到期」的判断不一致，虽然有双重互斥兜底，但会造成触发时刻紊乱。

若是广播模式，确认各节点的节点标识是否唯一。Docker bridge 网络下容器 IP 可能完全相同，用 `ruoyi.job.node-id` 显式指定可以彻底解决。

### 禁止并发却还是并发了

检查是否有节点用的是**另一个分支**的 `JobConstants`。多租户分支的键带 `global:` 前缀，单租户分支不带，混用会让两边抢的不是同一把锁。

### 任务执行时间比 cron 写的晚 8 小时

JVM 时区退回了 UTC。模块已把调度时区固定为 `Asia/Shanghai`，如果仍出现偏移，检查是不是有人用 `ruoyi.job.zone-id` 覆盖成了 UTC。

### 管理端有一批日志永远停在「执行中」

正常情况下停机会把残留日志标记为「已中断」。如果出现永久「执行中」，说明进程是被 `kill -9` 或 OOM 强杀的，没走到 `@PreDestroy`。这些是脏数据，可以手工清理。

### 日志表涨得太快

启用内置的 `cleanJobLog` 执行器，默认保留 30 天。高频任务（如每分钟执行）一天就是 1440 条，建议把保留天数调小。

### 从 SnailJob 迁移，cron 表达式报非法

`ruoyi-job` 用 Spring 的 `CronExpression`，6 位格式，不支持 7 位（带年）和 `W` 字符。把年份字段去掉即可。

### 任务被跳过并记录「错过执行」

说明实际触发比计划时间晚超过了 `misfire-threshold`（默认 60 秒）。常见于停机恢复后，或调度线程被大量任务堵塞。若希望补跑，把该任务的 `misfire_policy` 改为 `1`。

注意不要把 `misfire-threshold` 配得比 `scan-interval` 还小，否则每次正常触发都会被误判为错过。
