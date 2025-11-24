# JVM 性能调优最佳实践

## 概述

JVM(Java Virtual Machine)性能调优是提升 Java 应用性能的关键环节。本文档基于 RuoYi-Plus-UniApp 项目的实际生产配置,详细介绍 JVM 性能调优的最佳实践,包括内存管理、垃圾回收、线程配置、监控诊断等方面。

### 调优目标

**核心目标:**
- **降低延迟** - 减少 GC 停顿时间,提升系统响应速度
- **提高吞吐量** - 提升应用处理能力,支持更高并发
- **稳定运行** - 避免 OOM,减少 Full GC 频率
- **资源优化** - 合理利用内存和 CPU 资源

**性能指标:**
- **GC 停顿时间** < 100ms (P99)
- **GC 频率** - Young GC < 10次/分钟,Full GC < 1次/小时
- **堆内存使用率** < 80%
- **Metaspace 使用率** < 70%
- **线程数** < 500

### 技术栈环境

项目基于 Spring Boot 3.5.6 + Java 21,支持虚拟线程和现代化 GC 算法:

- **Java 版本**: Java 21 (LTS)
- **Spring Boot**: 3.5.6
- **Web 容器**: Undertow (高性能 NIO 容器)
- **数据库连接池**: HikariCP
- **缓存**: Redisson (Redis客户端)
- **消息队列**: RocketMQ 5.3.1

项目配置支持虚拟线程(Virtual Threads),大幅降低线程管理开销:

```yaml
spring:
  threads:
    virtual:
      enabled: true  # 仅JDK21可用
```

## JVM 内存模型

### 内存区域划分

JVM 内存主要分为以下几个区域:

**堆内存(Heap)**:
- **新生代(Young Generation)** - 存放新创建的对象
  - Eden 区 - 对象初始分配区域
  - Survivor 区(S0/S1) - Minor GC 后存活对象
- **老年代(Old Generation)** - 长期存活的对象

**非堆内存(Non-Heap)**:
- **Metaspace** - 类元数据(替代 PermGen)
- **Code Cache** - JIT 编译后的代码缓存
- **Direct Memory** - 堆外内存(NIO 使用)

**线程私有内存**:
- **栈(Stack)** - 方法调用栈帧
- **本地方法栈** - Native 方法栈
- **程序计数器** - 当前执行字节码位置

### 内存分配策略

**对象分配流程**:

1. **栈上分配** - 小对象且逃逸分析确定不逃逸
2. **TLAB 分配** - Thread Local Allocation Buffer,线程本地缓冲
3. **Eden 分配** - 大部分对象的首次分配
4. **老年代分配** - 大对象直接进入老年代

**晋升机制**:
- 对象在 Survivor 区每经历一次 Minor GC,年龄 +1
- 年龄达到阈值(默认15)晋升到老年代
- Survivor 区空间不足时提前晋升
- 动态年龄判断:同年龄对象大小总和 > Survivor 50%,则晋升

### 项目内存配置

项目启动脚本中定义了标准的内存配置:

**开发/测试环境**:
```bash
-Xms512m -Xmx1024m
-XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m
```

这种配置适合小规模测试,初始堆 512MB,最大堆 1GB。

**内存参数说明**:

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `-Xms` | 初始堆大小 | 与 -Xmx 相同 |
| `-Xmx` | 最大堆大小 | 物理内存 50-75% |
| `-Xmn` | 新生代大小 | 堆的 1/4 到 1/3 |
| `-XX:MetaspaceSize` | Metaspace 初始大小 | 128m |
| `-XX:MaxMetaspaceSize` | Metaspace 最大大小 | 256-512m |
| `-Xss` | 每个线程栈大小 | 默认1m |

**注意事项**:
- `-Xms` 和 `-Xmx` 设置相同,避免堆动态扩展带来的开销
- 新生代不宜过大,否则 Minor GC 时间变长
- Metaspace 设置上限,防止无限制增长导致 OOM

## 垃圾回收器选择

### GC 算法对比

Java 提供了多种 GC 算法,各有特点:

| GC 类型 | 停顿时间 | 吞吐量 | 适用场景 | Java 版本 |
|---------|---------|--------|---------|----------|
| Serial GC | 长 | 低 | 单核/小应用 | 所有版本 |
| Parallel GC | 长 | 高 | 批处理/后台任务 | Java 8+ |
| CMS | 短 | 中 | 低延迟应用 | Java 8-14 |
| G1 GC | 较短 | 高 | 通用场景 | Java 9+ |
| ZGC | 极短(<10ms) | 高 | 大内存/低延迟 | Java 15+ |
| Shenandoah | 极短 | 高 | 低延迟要求 | Java 12+ |

### ZGC 配置(推荐)

项目默认使用 **ZGC**(Z Garbage Collector),这是 Java 15+ 引入的低延迟垃圾回收器:

```bash
-XX:+UseZGC
```

**ZGC 特性**:
- **超低延迟** - 停顿时间 < 1ms,不随堆大小增长
- **并发回收** - 几乎所有工作并发进行,不阻塞应用线程
- **可扩展** - 支持 TB 级堆内存
- **内存整理** - 自动进行内存压缩,无碎片化问题

**ZGC 工作原理**:
1. **并发标记** - 标记存活对象
2. **并发预备重分配** - 选择回收集
3. **并发重分配** - 移动对象
4. **并发重映射** - 更新对象引用

**ZGC 适用场景**:
- 内存 > 4GB 的应用
- 对延迟敏感的在线服务
- 堆内存较大(8GB+)的应用

**ZGC 调优参数**:

```bash
# 基础配置
-XX:+UseZGC
-XX:ZCollectionInterval=120          # GC间隔时间(秒),0表示自动
-XX:ZAllocationSpikeTolerance=5      # 分配速率容忍度

# 高级配置
-XX:+UnlockExperimentalVMOptions
-XX:+UseZGC
-XX:ConcGCThreads=4                  # 并发GC线程数
-XX:ZUncommitDelay=300               # 内存归还延迟(秒)
```

### G1 GC 配置(备选)

如果使用 Java 11-17,推荐使用 **G1 GC**(Garbage-First):

```bash
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200             # 最大停顿时间目标(毫秒)
-XX:G1HeapRegionSize=16m             # Region大小(1-32MB)
-XX:InitiatingHeapOccupancyPercent=45  # 触发并发GC的堆占用阈值
-XX:G1ReservePercent=10              # 预留空间比例
-XX:+ParallelRefProcEnabled          # 并行处理引用对象
```

**G1 调优策略**:

1. **设置停顿时间目标**:
```bash
-XX:MaxGCPauseMillis=100  # 目标停顿时间100ms
```

2. **调整 Region 大小**:
```bash
# 堆 < 8GB: -XX:G1HeapRegionSize=4m
# 堆 8-16GB: -XX:G1HeapRegionSize=8m
# 堆 > 16GB: -XX:G1HeapRegionSize=16m
```

3. **调整并发标记阈值**:
```bash
-XX:InitiatingHeapOccupancyPercent=40  # 堆使用40%时开始并发标记
```

4. **启用字符串去重**:
```bash
-XX:+UseStringDeduplication  # 节省内存空间
```

### CMS GC 配置(已废弃)

CMS 在 Java 14 中已被移除,不推荐使用。如果必须使用 Java 8:

```bash
-XX:+UseConcMarkSweepGC
-XX:+UseCMSInitiatingOccupancyOnly
-XX:CMSInitiatingOccupancyFraction=70
-XX:+CMSScavengeBeforeRemark
-XX:+CMSParallelRemarkEnabled
-XX:+CMSClassUnloadingEnabled
```

## 环境配置方案

### 开发环境配置

**目标**: 快速启动,方便调试

```bash
#!/bin/bash
JVM_OPTS="
-Duser.timezone=Asia/Shanghai
-Xms512m
-Xmx1024m
-XX:MetaspaceSize=128m
-XX:MaxMetaspaceSize=256m
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./logs/heapdump.hprof
-XX:+UseZGC
"

java $JVM_OPTS -jar application.jar
```

**配置说明**:
- 堆内存 512MB-1GB,满足日常开发
- Metaspace 最大 256MB,足够加载开发期类
- 启用 OOM 时 Heap Dump,方便问题诊断
- 使用 ZGC 减少 GC 影响

### 测试环境配置

**目标**: 接近生产,压测验证

```bash
#!/bin/bash
JVM_OPTS="
-server
-Duser.timezone=Asia/Shanghai
-Xms2g
-Xmx2g
-Xmn1g
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./logs/heapdump-%t.hprof
-XX:+UseZGC
-XX:ZCollectionInterval=120
-Xlog:gc*:file=./logs/gc-%t.log:time,uptime,level,tags
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintFlagsFinal
"

java $JVM_OPTS -jar application.jar
```

**配置说明**:
- 堆内存 2GB,新生代 1GB (堆的50%)
- Metaspace 最大 512MB,加载更多类
- GC 日志输出到文件,方便分析
- 打印最终参数,确认配置生效

### 生产环境配置

**目标**: 高可用,低延迟,高吞吐

#### 小型应用(并发 < 100)

```bash
#!/bin/bash
APP_NAME=ryplus_uni_workflow.jar

JVM_OPTS="
-server
-Dname=$APP_NAME
-Duser.timezone=Asia/Shanghai
-Xms2g
-Xmx2g
-Xmn1g
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
-XX:+UseZGC
-XX:ZCollectionInterval=120
-XX:ZAllocationSpikeTolerance=5
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./logs/heapdump-%t.hprof
-XX:ErrorFile=./logs/hs_err_%p.log
-Xlog:gc*:file=./logs/gc-%t.log:time,uptime,level,tags:filecount=10,filesize=100m
-Xlog:safepoint:file=./logs/safepoint-%t.log:time,uptime:filecount=5,filesize=50m
-XX:+UnlockDiagnosticVMOptions
-XX:NativeMemoryTracking=summary
-XX:+PrintNMTStatistics
"

nohup java $JVM_OPTS -jar $APP_NAME > /dev/null 2>&1 &
```

#### 中型应用(并发 100-500)

```bash
#!/bin/bash
APP_NAME=ryplus_uni_workflow.jar

JVM_OPTS="
-server
-Dname=$APP_NAME
-Duser.timezone=Asia/Shanghai
-Xms4g
-Xmx4g
-Xmn2g
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
-XX:+UseZGC
-XX:ZCollectionInterval=120
-XX:ZAllocationSpikeTolerance=5
-XX:ConcGCThreads=4
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./logs/heapdump-%t.hprof
-XX:ErrorFile=./logs/hs_err_%p.log
-Xlog:gc*:file=./logs/gc-%t.log:time,uptime,level,tags:filecount=10,filesize=100m
-Xlog:safepoint:file=./logs/safepoint-%t.log:time,uptime:filecount=5,filesize=50m
-XX:+UnlockDiagnosticVMOptions
-XX:NativeMemoryTracking=summary
-XX:+FlightRecorder
"

nohup java $JVM_OPTS -jar $APP_NAME > /dev/null 2>&1 &
```

#### 大型应用(并发 > 500)

```bash
#!/bin/bash
APP_NAME=ryplus_uni_workflow.jar

JVM_OPTS="
-server
-Dname=$APP_NAME
-Duser.timezone=Asia/Shanghai
-Xms8g
-Xmx8g
-Xmn4g
-XX:MetaspaceSize=512m
-XX:MaxMetaspaceSize=1g
-XX:+UseZGC
-XX:ZCollectionInterval=180
-XX:ZAllocationSpikeTolerance=10
-XX:ConcGCThreads=8
-XX:ParallelGCThreads=16
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./logs/heapdump-%t.hprof
-XX:ErrorFile=./logs/hs_err_%p.log
-Xlog:gc*:file=./logs/gc-%t.log:time,uptime,level,tags:filecount=20,filesize=200m
-Xlog:safepoint:file=./logs/safepoint-%t.log:time,uptime:filecount=10,filesize=50m
-XX:+UnlockDiagnosticVMOptions
-XX:NativeMemoryTracking=detail
-XX:+FlightRecorder
-XX:FlightRecorderOptions=stackdepth=256
"

nohup java $JVM_OPTS -jar $APP_NAME > /dev/null 2>&1 &
```

**生产环境参数详解**:

| 参数 | 作用 | 说明 |
|------|------|------|
| `-server` | 服务器模式 | 启用更多优化,提升性能 |
| `-Duser.timezone` | 设置时区 | 统一时区为上海(UTC+8) |
| `-XX:+HeapDumpOnOutOfMemoryError` | OOM时Dump堆 | 自动生成堆快照文件 |
| `-XX:ErrorFile` | 错误日志 | 记录JVM崩溃信息 |
| `-Xlog:gc*` | GC日志 | 输出详细GC日志 |
| `-Xlog:safepoint` | 安全点日志 | 记录STW时间 |
| `-XX:NativeMemoryTracking` | 本地内存追踪 | 追踪JVM内存使用 |
| `-XX:+FlightRecorder` | JFR记录 | 启用Java飞行记录器 |

## 线程池配置

### Undertow 线程配置

项目使用 Undertow 作为 Web 容器,配置如下:

```yaml
server:
  undertow:
    buffer-size: 512              # 缓冲区大小
    direct-buffers: true          # 使用直接内存
    threads:
      io: 8                       # IO线程数
      worker: 256                 # 工作线程数
```

**配置建议**:

| 场景 | IO线程 | Worker线程 | 说明 |
|------|--------|-----------|------|
| 开发环境 | 4 | 64 | 轻量级配置 |
| 测试环境 | 8 | 128 | 中等配置 |
| 小型生产 | 8 | 256 | 并发<100 |
| 中型生产 | 16 | 512 | 并发100-500 |
| 大型生产 | 32 | 1024 | 并发>500 |

**线程数计算公式**:
- **IO 线程** = CPU 核心数 * 2
- **Worker 线程** = CPU 核心数 * 8 到 16

**注意事项**:
- IO 线程负责网络 IO,不应过多
- Worker 线程处理业务逻辑,根据业务特点调整
- 如果启用虚拟线程,Worker 线程数可适当减少

### Spring 异步线程池

Spring Boot 3.5+ 提供了内置线程池配置:

```yaml
spring:
  threads:
    virtual:
      enabled: true               # 启用虚拟线程
  task:
    execution:
      thread-name-prefix: async-  # 线程名前缀
      mode: force                 # 由Spring初始化线程池
```

项目中也保留了传统线程池配置(可选):

```yaml
thread-pool:
  enabled: false                  # JDK21推荐使用虚拟线程
  queueCapacity: 128              # 队列容量
  keepAliveSeconds: 300           # 空闲存活时间
```

**虚拟线程优势**:
- 创建和销毁成本极低
- 不受操作系统线程数限制
- 适合IO密集型任务
- 简化异步编程模型

**传统线程池参数**:
```java
@Configuration
@ConditionalOnProperty(prefix = "thread-pool", name = "enabled", havingValue = "true")
public class ThreadPoolConfig {

    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);           // 核心线程数
        executor.setMaxPoolSize(20);            // 最大线程数
        executor.setQueueCapacity(200);         // 队列容量
        executor.setKeepAliveSeconds(60);       // 空闲存活时间
        executor.setThreadNamePrefix("async-"); // 线程名前缀
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
        );
        executor.initialize();
        return executor;
    }
}
```

### 数据库连接池配置

项目使用 **HikariCP** 连接池,性能优异:

**开发环境**:
```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    dynamic:
      hikari:
        maxPoolSize: 20           # 最大连接数
        minIdle: 5                # 最小空闲连接
        connectionTimeout: 30000  # 连接超时(毫秒)
        idleTimeout: 600000       # 空闲超时(10分钟)
        maxLifetime: 1800000      # 连接最大生命周期(30分钟)
```

**生产环境**:
```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    dynamic:
      hikari:
        maxPoolSize: 50           # 最大连接数
        minIdle: 20               # 最小空闲连接
        connectionTimeout: 30000  # 连接超时
        validationTimeout: 5000   # 验证超时
        idleTimeout: 600000       # 空闲超时
        maxLifetime: 1800000      # 连接生命周期
        keepaliveTime: 30000      # 保活检测间隔
```

**连接池大小计算**:
```
连接数 = ((核心数 * 2) + 有效磁盘数)
```

例如:4核CPU,1个SSD:
```
最佳连接数 = (4 * 2) + 1 = 9
保险起见设置为 10-20
```

**注意事项**:
- 连接数不是越大越好,过多会增加数据库负担
- 根据数据库服务器性能调整
- 监控连接池使用情况,避免连接泄漏

### Redis 连接池配置

项目使用 **Redisson** 客户端连接 Redis:

**开发环境**:
```yaml
redisson:
  threads: 4                      # 线程池数量
  nettyThreads: 8                 # Netty线程池数量
  singleServerConfig:
    connectionMinimumIdleSize: 8  # 最小空闲连接
    connectionPoolSize: 32        # 连接池大小
    idleConnectionTimeout: 10000  # 空闲连接超时
    timeout: 3000                 # 命令超时
```

**生产环境**:
```yaml
redisson:
  keyPrefix: ryplus_uni_workflow  # Key前缀
  threads: 16                     # 线程池数量
  nettyThreads: 32                # Netty线程池数量
  singleServerConfig:
    clientName: ryplus_uni_workflow
    connectionMinimumIdleSize: 32  # 最小空闲连接
    connectionPoolSize: 64         # 连接池大小
    idleConnectionTimeout: 10000   # 空闲连接超时
    timeout: 3000                  # 命令超时
    subscriptionConnectionPoolSize: 50  # 订阅连接池
```

**配置建议**:

| 环境 | threads | nettyThreads | connectionPoolSize | 说明 |
|------|---------|--------------|-------------------|------|
| 开发 | 4 | 8 | 16 | 轻量级 |
| 测试 | 8 | 16 | 32 | 中等规模 |
| 小型生产 | 16 | 32 | 64 | 并发<100 |
| 中型生产 | 32 | 64 | 128 | 并发100-500 |
| 大型生产 | 64 | 128 | 256 | 并发>500 |

## 日志配置优化

### 异步日志配置

项目使用 **Logback** 实现异步日志,降低 IO 对性能的影响:

```xml
<appender name="async_info" class="ch.qos.logback.classic.AsyncAppender">
    <!-- 不丢失日志 -->
    <discardingThreshold>0</discardingThreshold>
    <!-- 队列深度 -->
    <queueSize>512</queueSize>
    <!-- 引用同步appender -->
    <appender-ref ref="file_info"/>
</appender>
```

**配置说明**:
- `discardingThreshold=0` - 队列满时不丢弃任何日志
- `queueSize=512` - 异步队列大小,平衡性能和内存
- 使用独立线程写日志文件

**队列大小选择**:

| 场景 | queueSize | 说明 |
|------|-----------|------|
| 低日志量 | 256 | 日志TPS<1000 |
| 中等日志量 | 512 | 日志TPS 1000-5000 |
| 高日志量 | 1024 | 日志TPS>5000 |
| 极高日志量 | 2048 | 日志TPS>10000 |

### 日志级别配置

**开发环境**:
```yaml
logging:
  level:
    plus.ruoyi: debug               # 应用日志DEBUG级别
    org.springframework: info       # Spring框架INFO
    org.mybatis.spring.mapper: debug  # SQL日志DEBUG
```

**生产环境**:
```yaml
logging:
  level:
    plus.ruoyi: info                # 应用日志INFO级别
    org.springframework: warn       # Spring框架WARN
    org.mybatis.spring.mapper: error  # SQL日志ERROR
    org.apache.fury: warn           # Fury日志WARN
```

**性能影响**:
- **TRACE/DEBUG** - 对性能影响最大,仅开发使用
- **INFO** - 适度影响,生产环境推荐
- **WARN/ERROR** - 影响很小,关键系统使用

**日志滚动策略**:
```xml
<rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
    <!-- 按天滚动 -->
    <fileNamePattern>${log.path}/sys-info.%d{yyyy-MM-dd}.log</fileNamePattern>
    <!-- 保留60天 -->
    <maxHistory>60</maxHistory>
</rollingPolicy>
```

### 日志输出优化

**避免字符串拼接**:
```java
// ❌ 不推荐
log.debug("User info: " + user.toString());

// ✅ 推荐
log.debug("User info: {}", user);
```

**使用条件判断**:
```java
// 复杂对象转换,避免不必要的计算
if (log.isDebugEnabled()) {
    log.debug("Complex data: {}", complexObject.toJson());
}
```

**异常日志最佳实践**:
```java
// ✅ 推荐:保留堆栈信息
log.error("Failed to process order: {}", orderId, exception);

// ❌ 不推荐:丢失堆栈信息
log.error("Failed to process order: " + exception.getMessage());
```

## 诊断与监控

### JVM 监控指标

**关键指标**:

| 指标类别 | 指标名称 | 健康范围 | 说明 |
|---------|---------|---------|------|
| **内存** | 堆使用率 | < 80% | 超过80%需要扩容 |
| | Metaspace使用率 | < 70% | 超过70%需关注 |
| | 堆外内存 | < 物理内存30% | 防止OS OOM |
| **GC** | Young GC频率 | < 10次/分 | 过高说明对象生成快 |
| | Young GC时间 | < 50ms | 影响响应时间 |
| | Full GC频率 | < 1次/小时 | 过高需调优 |
| | Full GC时间 | < 1s | 过长影响业务 |
| **线程** | 活跃线程数 | < 500 | 过多可能泄漏 |
| | 阻塞线程数 | < 10 | 关注死锁 |
| **类加载** | 已加载类 | 稳定 | 持续增长可能泄漏 |

### 监控工具使用

#### 1. JConsole

**启动方式**:
```bash
# 本地JVM
jconsole

# 远程JVM
jconsole <hostname>:<port>
```

**远程监控配置**:
```bash
-Dcom.sun.management.jmxremote=true
-Dcom.sun.management.jmxremote.port=9999
-Dcom.sun.management.jmxremote.ssl=false
-Dcom.sun.management.jmxremote.authenticate=false
-Djava.rmi.server.hostname=192.168.1.100
```

**监控内容**:
- 内存使用情况
- 线程状态
- 类加载统计
- MBean 管理

#### 2. VisualVM

**启动方式**:
```bash
jvisualvm
```

**功能特性**:
- 实时性能监控
- 线程 Dump 分析
- 堆 Dump 分析
- CPU/内存 Profiling
- 插件扩展支持

**推荐插件**:
- Visual GC - 可视化GC监控
- BTrace - 动态追踪
- MBeans浏览器

#### 3. Arthas

**启动方式**:
```bash
# 下载
curl -O https://arthas.aliyun.com/arthas-boot.jar

# 启动
java -jar arthas-boot.jar
```

**常用命令**:
```bash
# 查看JVM信息
dashboard

# 查看线程信息
thread

# 查看最繁忙的N个线程
thread -n 3

# 查看线程堆栈
thread <线程ID>

# 反编译类
jad com.example.MyClass

# 监控方法调用
monitor -c 5 com.example.Service method

# 查看方法参数返回值
watch com.example.Service method "{params,returnObj}"

# 追踪方法调用链路
trace com.example.Service method

# 查看JVM参数
sysprop | grep java
```

#### 4. Java Flight Recorder (JFR)

**启动JFR**:
```bash
# 启动时开启
-XX:+FlightRecorder
-XX:StartFlightRecording=duration=60s,filename=recording.jfr

# 运行时开启
jcmd <pid> JFR.start duration=60s filename=recording.jfr
```

**分析JFR文件**:
```bash
# 使用JDK Mission Control
jmc
```

**JFR记录内容**:
- GC 事件
- 线程事件
- 锁竞争
- IO 事件
- 方法调用
- 异常抛出

### Native Memory Tracking (NMT)

**启用NMT**:
```bash
-XX:NativeMemoryTracking=summary  # 或 detail
```

**查看内存使用**:
```bash
# 查看摘要
jcmd <pid> VM.native_memory summary

# 查看详情
jcmd <pid> VM.native_memory detail

# 对比差异(先baseline,再diff)
jcmd <pid> VM.native_memory baseline
jcmd <pid> VM.native_memory summary.diff
```

**NMT 分类**:
```
Total: reserved=5120MB, committed=2048MB
-                 Java Heap (reserved=2048MB, committed=1024MB)
-                     Class (reserved=128MB, committed=64MB)
-                    Thread (reserved=256MB, committed=128MB)
-                      Code (reserved=256MB, committed=128MB)
-                        GC (reserved=128MB, committed=64MB)
-                  Internal (reserved=64MB, committed=32MB)
-                    Symbol (reserved=32MB, committed=16MB)
-                     Other (reserved=16MB, committed=8MB)
```

## 问题诊断与解决

### OOM 问题诊断

#### 1. 堆内存溢出

**现象**:
```
java.lang.OutOfMemoryError: Java heap space
```

**诊断步骤**:

1. **生成 Heap Dump**:
```bash
# OOM时自动生成
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./logs/heapdump.hprof

# 手动生成
jmap -dump:live,format=b,file=heapdump.hprof <pid>
```

2. **分析 Heap Dump**:
```bash
# 使用 jhat (简单)
jhat heapdump.hprof
# 访问 http://localhost:7000

# 使用 MAT (推荐)
# Eclipse Memory Analyzer Tool
```

3. **查找内存泄漏**:
- 查看 Dominator Tree (支配树)
- 检查 Retained Heap 最大的对象
- 分析 GC Roots 引用链

**常见原因**:
- **集合类未清理** - List/Map 持续增长
- **缓存未设置过期** - 本地缓存无限增长
- **静态集合** - static 变量持有大对象
- **资源未关闭** - 数据库连接、文件流等
- **第三方库内存泄漏** - 某些框架的 Bug

**解决方案**:
```java
// ✅ 使用弱引用缓存
private static final Map<String, WeakReference<Object>> cache =
    new ConcurrentHashMap<>();

// ✅ 使用限制大小的缓存
private static final LRUCache<String, Object> cache =
    new LRUCache<>(1000);

// ✅ 及时清理集合
list.clear();
map.remove(key);

// ✅ 使用try-with-resources
try (Connection conn = dataSource.getConnection()) {
    // ...
}
```

#### 2. Metaspace 溢出

**现象**:
```
java.lang.OutOfMemoryError: Metaspace
```

**诊断步骤**:
```bash
# 查看类加载情况
jstat -class <pid> 1000 10

# 查看 Metaspace 使用
jcmd <pid> VM.metaspace

# 分析类加载器
jcmd <pid> GC.class_histogram
```

**常见原因**:
- **动态类生成** - CGLIB、ASM 等字节码框架
- **JSP 编译** - 每次改动重新编译
- **类加载器泄漏** - 热部署未清理旧类
- **大量反射** - 反射生成的代理类

**解决方案**:
```bash
# 1. 增大 Metaspace
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m

# 2. 启用类卸载
-XX:+CMSClassUnloadingEnabled  # CMS GC
# G1/ZGC 默认支持

# 3. 减少动态类生成
# 避免频繁创建代理类
# 复用类加载器
```

#### 3. 堆外内存溢出

**现象**:
```
java.lang.OutOfMemoryError: Direct buffer memory
```

**诊断步骤**:
```bash
# 查看堆外内存
jcmd <pid> VM.native_memory summary

# 查看 Direct Buffer
jmap -histo:live <pid> | grep DirectByteBuffer
```

**常见原因**:
- **NIO Buffer 未释放** - DirectByteBuffer 泄漏
- **Netty 使用不当** - 池化 Buffer 未回收
- **UnS** - 大量使用JUC工具类afe 操作** - 使用Unsafe直接操作内存

**解决方案**:
```bash
# 限制堆外内存大小
-XX:MaxDirectMemorySize=512m

# 手动触发清理
System.gc();  # 慎用!
```

```java
// ✅ 正确释放 Buffer
ByteBuffer buffer = ByteBuffer.allocateDirect(1024);
try {
    // 使用 buffer
} finally {
    ((DirectBuffer) buffer).cleaner().clean();
}

// ✅ Netty 池化 Buffer
ByteBuf buf = PooledByteBufAllocator.DEFAULT.directBuffer();
try {
    // 使用 buf
} finally {
    buf.release();
}
```

### GC 问题诊断

#### 1. GC 频繁

**现象**:
- Young GC 每秒多次
- CPU 使用率高
- 吞吐量下降

**诊断步骤**:
```bash
# 查看 GC 统计
jstat -gcutil <pid> 1000 10

# 示例输出
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT     GCT
  0.00  99.99  50.00  30.00  95.00  90.00   100    0.500     0    0.000    0.500

# S0/S1: Survivor 区使用率
# E: Eden 区使用率
# O: Old 区使用率
# M: Metaspace 使用率
# YGC: Young GC 次数
# YGCT: Young GC 总时间
# FGC: Full GC 次数
# FGCT: Full GC 总时间
```

**分析 GC 日志**:
```bash
# 启用详细 GC 日志
-Xlog:gc*:file=gc.log:time,uptime,level,tags

# 日志示例
[2025-11-24T10:30:00.123+0800][0.234s][info][gc] GC(0) Pause Young (Normal) 25M->3M(256M) 2.345ms
```

**解决方案**:

1. **增大新生代**:
```bash
-Xmn2g  # 新生代2GB
```

2. **调整对象晋升年龄**:
```bash
-XX:MaxTenuringThreshold=15  # 默认15
```

3. **优化代码**:
```java
// ❌ 频繁创建对象
for (int i = 0; i < 1000000; i++) {
    String s = new String("test");  // 每次循环new对象
}

// ✅ 复用对象
String s = "test";  // 字符串常量池
for (int i = 0; i < 1000000; i++) {
    // 使用 s
}

// ✅ 对象池化
private static final ObjectPool<StringBuilder> pool =
    new GenericObjectPool<>(new StringBuilderFactory());
```

#### 2. Full GC 频繁

**现象**:
- Full GC 每分钟多次
- 应用停顿时间长
- 老年代持续增长

**诊断步骤**:
```bash
# 查看老年代使用情况
jstat -gcold <pid> 1000 10

# 查看晋升速率
jstat -gcoldcapacity <pid> 1000 10
```

**常见原因**:
- **内存泄漏** - 对象无法被回收
- **对象过早晋升** - 新生代太小
- **大对象直接进入老年代** - 超过阈值
- **Metaspace 回收触发 Full GC**

**解决方案**:

1. **增大堆内存**:
```bash
-Xms4g -Xmx4g
```

2. **增大新生代比例**:
```bash
-XX:NewRatio=2  # 新生代:老年代 = 1:2
# 或直接指定大小
-Xmn2g
```

3. **调整大对象阈值** (G1 GC):
```bash
-XX:G1HeapRegionSize=16m  # Region大小
```

4. **使用 ZGC**:
```bash
-XX:+UseZGC  # 低延迟GC
```

#### 3. GC 停顿时间长

**现象**:
- 单次 GC 超过 100ms
- 应用出现明显卡顿
- 响应时间 P99 恶化

**诊断步骤**:
```bash
# 分析 GC 日志查看停顿时间
grep "Pause" gc.log

# 查看安全点日志
-Xlog:safepoint:file=safepoint.log:time,uptime
```

**常见原因**:
- **堆内存过大** - 扫描时间长
- **活跃对象多** - 标记时间长
- **引用处理慢** - WeakReference 等
- **安全点等待** - 线程进入安全点慢

**解决方案**:

1. **使用低延迟 GC**:
```bash
-XX:+UseZGC
-XX:MaxGCPauseMillis=10  # 目标停顿10ms
```

2. **并行处理引用**:
```bash
-XX:+ParallelRefProcEnabled
```

3. **减少活跃对象**:
- 及时清理缓存
- 减少长生命周期对象
- 使用对象池

4. **优化安全点**:
```bash
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintSafepointStatistics
-XX:PrintSafepointStatisticsCount=1
```

### 线程问题诊断

#### 1. 线程泄漏

**现象**:
- 线程数持续增长
- 最终达到系统限制
- 抛出 `OutOfMemoryError: unable to create new native thread`

**诊断步骤**:
```bash
# 查看线程数
jstack <pid> | grep "^\"" | wc -l

# 查看线程详情
jstack <pid> > threads.txt

# 分析线程状态分布
grep "java.lang.Thread.State" threads.txt | sort | uniq -c
```

**解决方案**:
```java
// ❌ 不使用线程池
for (int i = 0; i < 10000; i++) {
    new Thread(() -> {
        // 任务逻辑
    }).start();
}

// ✅ 使用线程池
ExecutorService executor = Executors.newFixedThreadPool(10);
for (int i = 0; i < 10000; i++) {
    executor.submit(() -> {
        // 任务逻辑
    });
}
executor.shutdown();

// ✅ 使用虚拟线程 (JDK 21+)
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
```

#### 2. 死锁

**现象**:
- 部分请求永久阻塞
- CPU 使用率低
- 线程栈显示 BLOCKED 状态

**诊断步骤**:
```bash
# 生成线程快照
jstack <pid> > deadlock.txt

# jstack 会自动检测死锁
grep -A 20 "Found one Java-level deadlock" deadlock.txt
```

**死锁示例**:
```
Found one Java-level deadlock:
=============================
"Thread-1":
  waiting to lock monitor 0x00007f8b8c004e80 (object 0x00000000d5f10000, a java.lang.Object),
  which is held by "Thread-2"
"Thread-2":
  waiting to lock monitor 0x00007f8b8c004f30 (object 0x00000000d5f10010, a java.lang.Object),
  which is held by "Thread-1"
```

**解决方案**:
```java
// ❌ 容易死锁
synchronized (lockA) {
    Thread.sleep(100);
    synchronized (lockB) {
        // 业务逻辑
    }
}

// ✅ 固定顺序加锁
Object first = lockA.hashCode() < lockB.hashCode() ? lockA : lockB;
Object second = first == lockA ? lockB : lockA;
synchronized (first) {
    synchronized (second) {
        // 业务逻辑
    }
}

// ✅ 使用 Lock 的 tryLock
if (lockA.tryLock(100, TimeUnit.MILLISECONDS)) {
    try {
        if (lockB.tryLock(100, TimeUnit.MILLISECONDS)) {
            try {
                // 业务逻辑
            } finally {
                lockB.unlock();
            }
        }
    } finally {
        lockA.unlock();
    }
}
```

#### 3. 线程阻塞

**现象**:
- 大量线程处于 WAITING 或 TIMED_WAITING
- 响应时间变长
- 吞吐量下降

**诊断步骤**:
```bash
# 找出最繁忙的线程
top -H -p <pid>

# 转换线程ID为16进制
printf "%x\n" <线程ID>

# 在 jstack 中查找
jstack <pid> | grep -A 30 <16进制线程ID>
```

**常见原因**:
- **等待锁** - synchronized 竞争激烈
- **等待IO** - 网络/磁盘IO阻塞
- **等待数据库** - SQL 执行慢
- **线程池满** - 任务堆积

**解决方案**:
```java
// ✅ 减小锁粒度
synchronized (lock) {
    // 只锁必要的代码
    criticalSection();
}
// 非关键代码放在锁外

// ✅ 使用读写锁
ReadWriteLock rwLock = new ReentrantReadWriteLock();
// 读操作
rwLock.readLock().lock();
try {
    // 读取数据
} finally {
    rwLock.readLock().unlock();
}

// ✅ 异步处理
CompletableFuture.supplyAsync(() -> {
    // 耗时操作
    return result;
}).thenAccept(result -> {
    // 处理结果
});
```

## 容器化部署优化

### Docker 容器 JVM 配置

**容器内存限制问题**:

Java 8u191 之前,JVM 无法正确识别容器内存限制,导致 OOM。

**解决方案**:

1. **使用 Java 11+**:
```dockerfile
FROM eclipse-temurin:21-jre-alpine
```

2. **显式设置内存**:
```bash
# 容器内存 2GB,JVM 堆配置 1.5GB
docker run -m 2g \
  -e JAVA_OPTS="-Xms1536m -Xmx1536m" \
  myapp:latest
```

3. **使用容器感知参数**:
```bash
-XX:+UseContainerSupport          # 启用容器支持(默认)
-XX:InitialRAMPercentage=60.0     # 初始堆为容器内存60%
-XX:MaxRAMPercentage=75.0         # 最大堆为容器内存75%
-XX:MinRAMPercentage=50.0         # 小内存容器的最小堆比例
```

**推荐配置**:
```dockerfile
FROM eclipse-temurin:21-jre-alpine

ENV JAVA_OPTS="\
-server \
-XX:+UseContainerSupport \
-XX:InitialRAMPercentage=70.0 \
-XX:MaxRAMPercentage=70.0 \
-XX:+UseZGC \
-XX:+HeapDumpOnOutOfMemoryError \
-XX:HeapDumpPath=/app/logs/heapdump.hprof \
-Xlog:gc*:file=/app/logs/gc.log:time,uptime,level,tags \
"

COPY target/app.jar /app/app.jar
WORKDIR /app

CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Kubernetes 环境配置

**资源限制**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:latest
    resources:
      requests:
        memory: "2Gi"
        cpu: "1000m"
      limits:
        memory: "4Gi"
        cpu: "2000m"
    env:
    - name: JAVA_OPTS
      value: >-
        -server
        -XX:+UseContainerSupport
        -XX:MaxRAMPercentage=75.0
        -XX:+UseZGC
        -XX:+HeapDumpOnOutOfMemoryError
        -XX:HeapDumpPath=/app/logs/heapdump.hprof
```

**JVM 与容器内存关系**:

| 容器内存 | JVM 堆内存 | Metaspace | 其他 | 说明 |
|---------|-----------|-----------|------|------|
| 512MB | 256MB | 128MB | 128MB | 小型应用 |
| 1GB | 512MB | 256MB | 256MB | 轻量应用 |
| 2GB | 1.5GB | 256MB | 256MB | 中型应用 |
| 4GB | 3GB | 512MB | 512MB | 大型应用 |
| 8GB | 6GB | 1GB | 1GB | 大规模应用 |

**健康检查配置**:
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 5503
  initialDelaySeconds: 60
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /actuator/health
    port: 5503
  initialDelaySeconds: 30
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

## 性能测试与基准

### 压力测试准备

**JVM 预热**:
```java
// 预热JIT编译
for (int i = 0; i < 10000; i++) {
    yourMethod();  // 重复调用,触发C1/C2编译
}
```

**禁用偏向锁** (压测时):
```bash
-XX:-UseBiasedLocking  # 避免锁升级影响测试
```

**固定 GC 行为**:
```bash
-XX:+AlwaysPreTouch   # 启动时预分配内存,避免首次GC影响
```

### JMH 基准测试

**添加依赖**:
```xml
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-core</artifactId>
    <version>1.37</version>
</dependency>
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-generator-annprocess</artifactId>
    <version>1.37</version>
</dependency>
```

**基准测试示例**:
```java
@BenchmarkMode(Mode.Throughput)
@OutputTimeUnit(TimeUnit.SECONDS)
@State(Scope.Thread)
@Fork(1)
@Warmup(iterations = 3, time = 1)
@Measurement(iterations = 5, time = 1)
public class StringConcatBenchmark {

    @Benchmark
    public String stringConcat() {
        String result = "";
        for (int i = 0; i < 100; i++) {
            result += "test";
        }
        return result;
    }

    @Benchmark
    public String stringBuilder() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100; i++) {
            sb.append("test");
        }
        return sb.toString();
    }
}
```

**运行测试**:
```bash
mvn clean install
java -jar target/benchmarks.jar
```

### 性能对比

**不同 GC 性能对比** (4GB 堆,中等负载):

| GC类型 | 平均停顿 | P99停顿 | 吞吐量 | 内存占用 |
|--------|---------|---------|--------|---------|
| Parallel GC | 50ms | 200ms | 98% | 4GB |
| G1 GC | 20ms | 100ms | 96% | 4.2GB |
| ZGC | 2ms | 5ms | 95% | 4.5GB |
| Shenandoah | 3ms | 10ms | 94% | 4.6GB |

**结论**:
- **批处理/后台任务** - Parallel GC (高吞吐)
- **在线服务(通用)** - G1 GC (平衡)
- **低延迟服务** - ZGC (P99 < 10ms)
- **实时系统** - ZGC/Shenandoah (极低延迟)

## 最佳实践总结

### 配置原则

**1. 环境分离**:
- 开发环境:快速启动,方便调试
- 测试环境:接近生产,压测验证
- 生产环境:高可用,低延迟,监控完善

**2. 渐进式调优**:
- 先监控,后调优
- 一次调整一个参数
- 压测验证效果
- 记录调优过程

**3. 预防性配置**:
```bash
-XX:+HeapDumpOnOutOfMemoryError   # OOM时Dump堆
-XX:ErrorFile=./logs/hs_err.log   # 崩溃日志
-Xlog:gc*:file=gc.log             # GC日志
-XX:NativeMemoryTracking=summary  # 内存追踪
```

### 开发规范

**1. 对象创建**:
```java
// ✅ 使用 StringBuilder 拼接字符串
StringBuilder sb = new StringBuilder();
sb.append("Hello").append(" ").append("World");

// ✅ 预估集合大小
List<String> list = new ArrayList<>(1000);
Map<String, Object> map = new HashMap<>(128);

// ✅ 使用原始类型
int count = 0;  // 而不是 Integer

// ✅ 及时释放大对象
largeObject = null;  // 帮助GC回收
```

**2. 资源管理**:
```java
// ✅ 使用 try-with-resources
try (InputStream in = new FileInputStream(file);
     OutputStream out = new FileOutputStream(output)) {
    // 使用流
} // 自动关闭

// ✅ 手动释放线程池
ExecutorService executor = Executors.newFixedThreadPool(10);
try {
    // 提交任务
} finally {
    executor.shutdown();
    executor.awaitTermination(1, TimeUnit.MINUTES);
}
```

**3. 缓存使用**:
```java
// ✅ 使用 Guava Cache
LoadingCache<String, Object> cache = CacheBuilder.newBuilder()
    .maximumSize(1000)                      // 最大条数
    .expireAfterWrite(10, TimeUnit.MINUTES) // 写入后10分钟过期
    .build(key -> loadFromDB(key));

// ✅ 使用 Caffeine
Cache<String, Object> cache = Caffeine.newBuilder()
    .maximumSize(1000)
    .expireAfterWrite(10, TimeUnit.MINUTES)
    .build();
```

### 监控告警

**关键指标告警阈值**:

| 指标 | Warning | Critical | 说明 |
|------|---------|----------|------|
| 堆使用率 | 70% | 85% | 需扩容 |
| Full GC 频率 | 1次/10分 | 1次/5分 | 可能泄漏 |
| GC 停顿时间 | 100ms | 500ms | 影响业务 |
| 线程数 | 300 | 500 | 可能泄漏 |
| CPU 使用率 | 70% | 90% | 需扩容 |
| OOM 次数 | 1次/天 | 1次/小时 | 紧急 |

**监控集成**:
```yaml
# Spring Boot Actuator
management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: always

# Prometheus + Grafana
# Micrometer 自动集成
```

### 故障预案

**1. OOM 应急**:
```bash
# 立即生成 Heap Dump
jmap -dump:live,format=b,file=emergency.hprof <pid>

# 重启应用(临时恢复服务)
./ry.sh restart

# 分析 Heap Dump
jhat emergency.hprof
# 或使用 MAT
```

**2. 高 GC 应急**:
```bash
# 查看 GC 统计
jstat -gcutil <pid> 1000 10

# 如果 Full GC 频繁
# 1. 增大堆内存(临时)
# 2. 重启应用
# 3. 分析 GC 日志
```

**3. 死锁应急**:
```bash
# 生成线程快照
jstack <pid> > deadlock.txt

# 检测死锁
grep "deadlock" deadlock.txt

# 重启应用
./ry.sh restart
```

## RocketMQ JVM 配置

项目集成了 RocketMQ 5.3.1 消息队列,各组件有独立的 JVM 配置:

### NameServer 配置

**开发环境**:
```bash
NAMESRV_JAVA_OPTS=-Xms256m -Xmx256m -Xmn128m
```

**生产环境**:
```bash
NAMESRV_JAVA_OPTS=-Xms512m -Xmx512m -Xmn256m
```

NameServer 负责路由管理,内存需求不大。

### Broker 配置

**Master Broker (主节点)**:

开发环境:
```bash
BROKER_MASTER_JAVA_OPTS=-Xms512m -Xmx512m -Xmn256m
```

生产环境:
```bash
BROKER_MASTER_JAVA_OPTS=-Xms1g -Xmx1g -Xmn512m
```

Master 负责接收写请求,内存配置应较大。

**Slave Broker (从节点)**:

开发环境:
```bash
BROKER_SLAVE_JAVA_OPTS=-Xms512m -Xmx512m -Xmn256m
```

生产环境:
```bash
BROKER_SLAVE_JAVA_OPTS=-Xms1g -Xmx1g -Xmn512m
```

Slave 从 Master 同步数据,只处理读请求。

### Dashboard 配置

**开发环境**:
```bash
DASHBOARD_JAVA_OPTS=-Xms128m -Xmx128m
```

**生产环境**:
```bash
DASHBOARD_JAVA_OPTS=-Xms256m -Xmx256m
```

Dashboard 是 Web 管理界面,内存需求最小。

### 大型项目配置

对于消息量大的生产环境:

```bash
# NameServer
NAMESRV_JAVA_OPTS=-Xms1g -Xmx1g -Xmn512m

# Broker Master
BROKER_MASTER_JAVA_OPTS=-Xms2g -Xmx2g -Xmn1g

# Broker Slave
BROKER_SLAVE_JAVA_OPTS=-Xms2g -Xmx2g -Xmn1g

# Dashboard
DASHBOARD_JAVA_OPTS=-Xms512m -Xmx512m
```

### 性能调优建议

**1. 消息堆积监控**:
```bash
# 查看 Broker 堆使用
jstat -gcutil <broker_pid>

# 如果 Old 区持续增长,说明消息堆积
```

**2. 磁盘 IO 优化**:
```bash
# RocketMQ 使用 mmap,建议:
# - 使用 SSD
# - 设置足够的 PageCache
```

**3. 网络优化**:
```yaml
# 增大发送/接收缓冲区
rocketmq:
  producer:
    send-message-timeout: 3000    # 发送超时
  consumer:
    pull-batch-size: 32           # 拉取批次大小
```

## 常见问题

### Q1: -Xms 和 -Xmx 必须相同吗?

**推荐相同**:
```bash
-Xms4g -Xmx4g  # ✅ 推荐
```

**原因**:
- 避免堆动态扩展,减少 GC 开销
- 提高性能稳定性
- 防止内存碎片

**例外情况**:
- 内存资源紧张
- 应用负载波动大
- 需要动态调整内存

### Q2: 如何选择 GC 算法?

**决策树**:
```
是否使用 Java 17+?
  是 → 使用 ZGC (低延迟优先)
  否 → 是否使用 Java 11+?
         是 → 使用 G1 GC (平衡选择)
         否 → 是否 Java 8?
                是 → 使用 CMS 或升级 Java 版本
                否 → 使用 Parallel GC (批处理)
```

**简化建议**:
- **默认选择**: G1 GC (Java 9+)
- **低延迟**: ZGC (Java 15+)
- **高吞吐**: Parallel GC

### Q3: Metaspace 会发生 OOM 吗?

**会的**:
```bash
-XX:MaxMetaspaceSize=512m  # 设置上限
```

**常见原因**:
- 动态类生成过多 (CGLIB, ASM)
- 类加载器泄漏
- JSP 频繁编译

**预防措施**:
- 设置合理上限 (256-512MB)
- 启用类卸载
- 监控类加载数量

### Q4: 虚拟线程有什么限制?

**优势**:
- 创建成本低 (微秒级)
- 不占用 OS 线程
- 适合 IO 密集型任务

**限制**:
- 不适合 CPU 密集型
- synchronized 块中会固定到 OS 线程
- 某些本地库不兼容

**使用建议**:
```java
// ✅ IO 密集型
Executors.newVirtualThreadPerTaskExecutor()
    .submit(() -> httpClient.get(url));

// ❌ CPU 密集型
// 仍使用传统线程池
Executors.newFixedThreadPool(CPU_COUNT)
    .submit(() -> heavyComputation());
```

### Q5: 如何减少 Full GC?

**根本原因分析**:
- 老年代空间不足
- Metaspace 回收
- System.gc() 调用
- CMS GC 失败 (Concurrent Mode Failure)

**解决方案**:

1. **增大堆内存**:
```bash
-Xms8g -Xmx8g
```

2. **增大新生代**:
```bash
-Xmn4g  # 堆的50%
```

3. **调整晋升阈值**:
```bash
-XX:MaxTenuringThreshold=15
```

4. **使用 ZGC**:
```bash
-XX:+UseZGC  # 消除 Full GC
```

5. **代码优化**:
```java
// 减少大对象创建
// 及时释放缓存
// 使用对象池
```

### Q6: Docker 容器 OOM 怎么办?

**问题诊断**:
```bash
# 查看容器日志
docker logs <container_id>

# 查看容器内存使用
docker stats <container_id>

# 进入容器查看 JVM 内存
docker exec -it <container_id> sh
jmap -heap <pid>
```

**解决方案**:

1. **增大容器内存**:
```yaml
resources:
  limits:
    memory: "4Gi"  # 从2Gi增到4Gi
```

2. **调整 JVM 堆比例**:
```bash
-XX:MaxRAMPercentage=70.0  # 从75降到70
```

3. **优化应用**:
- 减少内存使用
- 优化缓存策略
- 及时释放资源

### Q7: 如何监控 JVM 性能?

**开源方案**:

1. **Prometheus + Grafana**:
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

2. **Spring Boot Actuator**:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: metrics,health,info
```

3. **Arthas**:
```bash
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar
```

**商业方案**:
- APM 工具: Skywalking, Pinpoint, Zipkin
- 云服务: AWS CloudWatch, Alibaba ARMS

## 总结

JVM 性能调优是一个系统工程,需要:

**1. 理解原理** - 内存模型、GC 算法、线程管理
**2. 监控先行** - 建立完善的监控体系
**3. 渐进式调优** - 一次调整一个参数,验证效果
**4. 预防性配置** - 设置 Dump、日志、追踪
**5. 持续优化** - 根据业务发展不断调整

**核心要点**:
- 使用 Java 21 + ZGC,享受现代化 GC 红利
- 堆内存设置为物理内存 50-75%
- -Xms 和 -Xmx 设置相同
- 新生代设置为堆的 1/3 到 1/2
- 启用虚拟线程,降低线程管理开销
- 使用异步日志,减少 IO 影响
- 容器化部署使用 MaxRAMPercentage
- 建立监控告警,及时发现问题

**参考资源**:
- Java Platform, Standard Edition HotSpot Virtual Machine Garbage Collection Tuning Guide
- Java SE 21 Documentation
- Spring Boot 3.x Reference Documentation
- RuoYi-Plus-UniApp 项目源码

通过合理的 JVM 配置和持续优化,可以让应用在高并发、大流量场景下稳定高效运行。
