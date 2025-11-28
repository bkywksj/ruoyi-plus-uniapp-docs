# 性能测试

## 介绍

性能测试是确保系统在各种负载条件下能够正常运行的重要手段。RuoYi-Plus 框架提供了完善的性能测试工具和方法,从单元级别的性能监控到集成级别的压力测试,全方位保障系统性能。

本文档将详细介绍 RuoYi-Plus 项目中的性能测试实践,涵盖性能监控、超时控制、重复测试、压力测试以及性能调优等方面。

**核心特性:**

- **自动性能监控** - 基于 BaseTest 的 StopWatch 计时器,自动记录每个测试方法的执行时间
- **性能阈值告警** - 自定义性能阈值,超过阈值自动输出警告日志
- **超时控制** - 使用 @Timeout 注解防止测试方法执行时间过长
- **重复测试** - 使用 @RepeatedTest 注解验证性能稳定性
- **并发测试** - 使用线程池模拟并发场景,测试系统并发处理能力
- **压力测试工具** - 集成 JMeter、Gatling 等专业压力测试工具

## 自动性能监控

### BaseTest 性能监控机制

RuoYi-Plus 的 `BaseTest` 类内置了性能监控功能,基于 Hutool 的 `StopWatch` 实现自动计时:

```java
/**
 * 基础测试类
 *
 * 功能特性:
 * - 自动记录每个测试方法的执行时间
 * - 超过性能阈值时输出警告日志
 * - 提供setUp/tearDown扩展点
 */
@Slf4j
@ExtendWith(SpringExtension.class)
@SpringBootTest
public abstract class BaseTest {

    /**
     * 性能监控计时器(线程隔离)
     */
    private final ThreadLocal<StopWatch> stopWatchHolder = new ThreadLocal<>();

    /**
     * 性能警告阈值(毫秒)
     * 默认3秒,子类可重写自定义阈值
     */
    protected long getPerformanceThreshold() {
        return 3000L;
    }

    /**
     * 是否启用性能监控
     * 默认启用,子类可重写关闭监控
     */
    protected boolean isPerformanceMonitorEnabled() {
        return true;
    }

    /**
     * 测试方法执行前 - 启动计时器
     */
    @BeforeEach
    public final void baseBeforeEach(TestInfo testInfo) {
        TestConfig.initTestDirs();

        if (isPerformanceMonitorEnabled()) {
            StopWatch stopWatch = new StopWatch(testInfo.getDisplayName());
            stopWatch.start();
            stopWatchHolder.set(stopWatch);
        }
        setUp();
    }

    /**
     * 测试方法执行后 - 记录执行时间
     */
    @AfterEach
    public final void baseAfterEach(TestInfo testInfo) {
        tearDown();
        TestConfig.cleanTestDirs();

        if (isPerformanceMonitorEnabled() && stopWatchHolder.get() != null) {
            StopWatch stopWatch = stopWatchHolder.get();
            stopWatch.stop();

            long totalTimeMillis = stopWatch.getTotalTimeMillis();
            String testName = testInfo.getDisplayName();

            // 性能警告判断
            if (totalTimeMillis > getPerformanceThreshold()) {
                log.warn("⚠️ 性能警告: {} 执行时间 {}ms 超过阈值 {}ms",
                    testName, totalTimeMillis, getPerformanceThreshold());
            } else {
                log.info("{} 执行完成,耗时: {}ms", testName, totalTimeMillis);
            }

            stopWatchHolder.remove();
        }
    }
}
```

**工作原理:**

```
[测试方法开始]
    ↓
[@BeforeEach 触发]
    ↓
[创建 StopWatch 计时器]
    ↓
[启动计时 - stopWatch.start()]
    ↓
[执行测试方法逻辑]
    ↓
[@AfterEach 触发]
    ↓
[停止计时 - stopWatch.stop()]
    ↓
[获取执行时间 - getTotalTimeMillis()]
    ↓
[判断是否超过阈值]
    ├─ 超过 → 输出警告日志 ⚠️
    └─ 未超过 → 输出普通日志 ℹ️
    ↓
[清理 StopWatch 资源]
    ↓
[测试结束]
```

### 使用自动性能监控

继承 `BaseTest` 的测试类自动获得性能监控功能:

```java
@SpringBootTest
@DisplayName("流工具类测试")
public class StreamUtilsTest extends BaseTest {

    @Test
    @DisplayName("测试filter-过滤集合")
    public void testFilter() {
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> result = StreamUtils.filter(list, num -> num > 2);

        assertEquals(3, result.size());
        // 测试结束后自动输出: testFilter 执行完成,耗时: 15ms
    }

    /**
     * 自定义性能阈值
     */
    @Override
    protected long getPerformanceThreshold() {
        return 1000L; // 1秒
    }
}
```

**执行结果示例:**

```
2025-11-25 14:30:00.123 INFO  - 测试filter-过滤集合 执行完成,耗时: 15ms
2025-11-25 14:30:01.456 WARN  - ⚠️ 性能警告: 测试groupBy2Key-按两个key分组 执行时间 1250ms 超过阈值 1000ms
```

### 自定义性能阈值

不同类型的测试对性能要求不同,可以通过重写 `getPerformanceThreshold()` 方法自定义阈值:

```java
@SpringBootTest
@DisplayName("数据库操作性能测试")
public class DatabasePerformanceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试批量插入性能")
    public void testBatchInsert() {
        // 插入1000条数据
        List<SysUserBo> users = generateTestUsers(1000);
        for (SysUserBo user : users) {
            userService.insertUser(user);
        }
        // 期望在5秒内完成
    }

    /**
     * 数据库操作允许较长的执行时间
     */
    @Override
    protected long getPerformanceThreshold() {
        return 5000L; // 5秒
    }
}
```

**推荐阈值设置:**

| 测试类型 | 推荐阈值 | 说明 |
|---------|---------|------|
| 工具类测试 | 100-500ms | 纯逻辑运算,应该很快 |
| Service 层测试 | 1000-3000ms | 涉及数据库操作,允许稍慢 |
| Controller 测试 | 500-1500ms | HTTP请求处理,不应过慢 |
| 集成测试 | 3000-10000ms | 涉及多个模块,可以较慢 |
| 批量操作测试 | 5000-30000ms | 大量数据处理,允许更长时间 |

### 禁用性能监控

对于某些特殊测试(如手动性能测试),可以禁用自动性能监控:

```java
@SpringBootTest
@DisplayName("手动性能测试")
public class ManualPerformanceTest extends BaseTest {

    @Test
    @DisplayName("手动测试性能")
    public void testManualPerformance() {
        long startTime = System.currentTimeMillis();

        // 执行测试逻辑
        performHeavyOperation();

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        System.out.println("执行时间: " + duration + "ms");
        assertTrue(duration < 5000, "执行时间应该小于5秒");
    }

    /**
     * 禁用自动性能监控
     */
    @Override
    protected boolean isPerformanceMonitorEnabled() {
        return false;
    }
}
```

## 超时控制

### @Timeout 注解

使用 JUnit 5 的 `@Timeout` 注解可以防止测试方法执行时间过长:

```java
@SpringBootTest
@DisplayName("超时控制测试")
public class TimeoutControlTest extends BaseTest {

    @Test
    @Timeout(value = 2L, unit = TimeUnit.SECONDS)
    @DisplayName("测试2秒超时控制")
    public void testTimeout() throws InterruptedException {
        // 执行耗时操作
        Thread.sleep(1000); // 1秒,不会超时

        // 如果超过2秒,测试会失败并抛出 TimeoutException
    }

    @Test
    @Timeout(value = 500L, unit = TimeUnit.MILLISECONDS)
    @DisplayName("测试500毫秒超时控制")
    public void testQuickOperation() {
        // 快速操作应该在500ms内完成
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> result = list.stream()
            .filter(n -> n > 2)
            .collect(Collectors.toList());

        assertEquals(3, result.size());
    }
}
```

**超时控制的好处:**

- **防止死循环** - 避免测试因死循环而永久挂起
- **提前发现性能问题** - 强制测试在规定时间内完成
- **提高测试效率** - 避免慢速测试拖慢整个测试套件
- **资源保护** - 防止测试占用过多系统资源

### 类级别超时控制

可以为整个测试类设置统一的超时时间:

```java
@SpringBootTest
@DisplayName("批量超时控制测试")
@Timeout(value = 5L, unit = TimeUnit.SECONDS) // 类级别超时
public class BatchTimeoutTest extends BaseTest {

    @Test
    @DisplayName("测试1")
    public void test1() {
        // 继承类级别超时: 5秒
    }

    @Test
    @DisplayName("测试2")
    @Timeout(value = 1L, unit = TimeUnit.SECONDS) // 方法级别超时覆盖类级别
    public void test2() {
        // 使用方法级别超时: 1秒
    }
}
```

## 重复测试

### @RepeatedTest 注解

使用 `@RepeatedTest` 注解可以重复执行测试,验证性能稳定性:

```java
@SpringBootTest
@DisplayName("重复测试示例")
public class RepeatedTestExample extends BaseTest {

    @RepeatedTest(10)
    @DisplayName("重复执行10次-测试性能稳定性")
    public void testPerformanceStability() {
        // 这个测试会执行10次
        List<String> list = generateRandomStrings(1000);
        List<String> sorted = StreamUtils.sorted(list, String::compareTo);

        assertEquals(1000, sorted.size());
        // 检查每次执行的性能是否稳定
    }

    @RepeatedTest(value = 5, name = "{displayName} - 第 {currentRepetition}/{totalRepetitions} 次")
    @DisplayName("自定义重复测试显示名称")
    public void testWithCustomName() {
        // 输出格式: 自定义重复测试显示名称 - 第 1/5 次
        performOperation();
    }
}
```

**重复测试的价值:**

- **验证稳定性** - 确保性能不会在重复执行中退化
- **发现间歇性问题** - 捕获偶发的性能问题
- **统计性能数据** - 获取平均执行时间、最大最小值等统计信息
- **预热测试** - JVM预热后的性能表现

### 性能统计分析

结合重复测试和手动计时,可以进行性能统计分析:

```java
@SpringBootTest
@DisplayName("性能统计测试")
public class PerformanceStatisticsTest extends BaseTest {

    private final List<Long> executionTimes = new ArrayList<>();

    @RepeatedTest(100)
    @DisplayName("收集性能数据")
    public void testCollectPerformanceData() {
        long startTime = System.nanoTime();

        // 执行测试操作
        List<Integer> result = StreamUtils.filter(
            IntStream.range(1, 10000).boxed().collect(Collectors.toList()),
            n -> n % 2 == 0
        );

        long endTime = System.nanoTime();
        long duration = (endTime - startTime) / 1000000; // 转换为毫秒

        executionTimes.add(duration);
    }

    @AfterAll
    public static void analyzePerformance(@Autowired PerformanceStatisticsTest test) {
        if (test.executionTimes.isEmpty()) return;

        // 计算统计数据
        long min = Collections.min(test.executionTimes);
        long max = Collections.max(test.executionTimes);
        double avg = test.executionTimes.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);

        System.out.println("=== 性能统计报告 ===");
        System.out.println("执行次数: " + test.executionTimes.size());
        System.out.println("最小时间: " + min + "ms");
        System.out.println("最大时间: " + max + "ms");
        System.out.println("平均时间: " + String.format("%.2f", avg) + "ms");
        System.out.println("时间波动: " + (max - min) + "ms");
    }
}
```

**执行结果示例:**

```
=== 性能统计报告 ===
执行次数: 100
最小时间: 8ms
最大时间: 45ms
平均时间: 12.35ms
时间波动: 37ms
```

## 并发性能测试

### 使用 ExecutorService 模拟并发

使用线程池模拟并发场景,测试系统并发处理能力:

```java
@SpringBootTest
@Transactional
@DisplayName("并发性能测试")
public class ConcurrencyPerformanceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试并发查询性能")
    public void testConcurrentQuery() throws InterruptedException {
        int threadCount = 50; // 50个并发线程
        int queryCountPerThread = 100; // 每个线程查询100次

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        long startTime = System.currentTimeMillis();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < queryCountPerThread; j++) {
                        // 查询系统用户
                        SysUserVo user = userService.getUserById(1L);
                        assertNotNull(user);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        // 等待所有线程完成
        latch.await();
        executor.shutdown();

        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        int totalQueries = threadCount * queryCountPerThread;

        System.out.println("=== 并发查询性能测试报告 ===");
        System.out.println("并发线程数: " + threadCount);
        System.out.println("总查询次数: " + totalQueries);
        System.out.println("总执行时间: " + totalTime + "ms");
        System.out.println("平均QPS: " + (totalQueries * 1000 / totalTime));

        // 断言性能要求
        assertTrue(totalTime < 30000, "30秒内应该完成所有查询");
    }

    @Test
    @DisplayName("测试并发插入性能")
    public void testConcurrentInsert() throws InterruptedException {
        int threadCount = 10;
        int insertCountPerThread = 50;

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        long startTime = System.currentTimeMillis();

        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < insertCountPerThread; j++) {
                        try {
                            SysUserBo user = UserTestDataBuilder.aUser()
                                .withUserName("test_t" + threadId + "_" + j + "_" + System.currentTimeMillis())
                                .withRandomData()
                                .build();

                            Long userId = userService.insertUser(user);
                            if (userId != null) {
                                successCount.incrementAndGet();
                            }
                        } catch (Exception e) {
                            failureCount.incrementAndGet();
                        }
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;

        System.out.println("=== 并发插入性能测试报告 ===");
        System.out.println("并发线程数: " + threadCount);
        System.out.println("成功插入: " + successCount.get());
        System.out.println("失败次数: " + failureCount.get());
        System.out.println("总执行时间: " + totalTime + "ms");
        System.out.println("平均TPS: " + (successCount.get() * 1000 / totalTime));

        // 验证成功率
        int expected = threadCount * insertCountPerThread;
        assertTrue(successCount.get() >= expected * 0.95,
            "成功率应该达到95%以上");

        // 测试结束自动回滚
    }
}
```

**并发测试输出示例:**

```
=== 并发查询性能测试报告 ===
并发线程数: 50
总查询次数: 5000
总执行时间: 2345ms
平均QPS: 2132

=== 并发插入性能测试报告 ===
并发线程数: 10
成功插入: 500
失败次数: 0
总执行时间: 15678ms
平均TPS: 31
```

### 并发测试最佳实践

```java
@SpringBootTest
@Transactional
@DisplayName("并发测试最佳实践")
public class ConcurrencyBestPracticeTest extends BaseServiceTest {

    @Test
    @DisplayName("并发测试框架示例")
    public void testConcurrencyFramework() throws Exception {
        // 1. 配置并发参数
        int threadCount = 20;
        int iterationsPerThread = 100;

        // 2. 创建线程池(使用固定大小线程池)
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);

        // 3. 使用 CountDownLatch 同步
        CountDownLatch startLatch = new CountDownLatch(1); // 启动信号
        CountDownLatch endLatch = new CountDownLatch(threadCount); // 结束信号

        // 4. 收集结果(线程安全)
        ConcurrentHashMap<String, Object> results = new ConcurrentHashMap<>();
        AtomicLong totalTime = new AtomicLong(0);

        // 5. 提交任务
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    // 等待所有线程就绪
                    startLatch.await();

                    long threadStartTime = System.currentTimeMillis();

                    // 执行测试逻辑
                    for (int j = 0; j < iterationsPerThread; j++) {
                        performOperation(threadId, j);
                    }

                    long threadEndTime = System.currentTimeMillis();
                    totalTime.addAndGet(threadEndTime - threadStartTime);

                    results.put("thread_" + threadId, "SUCCESS");
                } catch (Exception e) {
                    results.put("thread_" + threadId, "FAILURE: " + e.getMessage());
                } finally {
                    endLatch.countDown();
                }
            });
        }

        // 6. 同时启动所有线程
        long testStartTime = System.currentTimeMillis();
        startLatch.countDown();

        // 7. 等待所有线程完成(设置超时)
        boolean completed = endLatch.await(60, TimeUnit.SECONDS);
        assertTrue(completed, "测试应该在60秒内完成");

        long testEndTime = System.currentTimeMillis();

        // 8. 关闭线程池
        executor.shutdown();

        // 9. 分析结果
        analyzeResults(results, testStartTime, testEndTime, totalTime.get());
    }

    private void performOperation(int threadId, int iteration) {
        // 执行实际的测试逻辑
    }

    private void analyzeResults(ConcurrentHashMap<String, Object> results,
                                  long testStartTime, long testEndTime, long totalTime) {
        long wallClockTime = testEndTime - testStartTime;
        long successCount = results.values().stream()
            .filter(v -> "SUCCESS".equals(v))
            .count();

        System.out.println("=== 并发测试结果分析 ===");
        System.out.println("成功线程: " + successCount + "/" + results.size());
        System.out.println("总耗时(墙钟时间): " + wallClockTime + "ms");
        System.out.println("总耗时(线程累计): " + totalTime + "ms");
        System.out.println("并发度: " + String.format("%.2f", (double)totalTime / wallClockTime));
    }
}
```

## 压力测试工具

### Apache JMeter

JMeter 是业界标准的压力测试工具,适合进行 HTTP 接口压力测试:

**JMeter 测试计划示例:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="RuoYi-Plus 压力测试">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments">
          <elementProp name="host" elementType="Argument">
            <stringProp name="Argument.name">host</stringProp>
            <stringProp name="Argument.value">localhost</stringProp>
          </elementProp>
          <elementProp name="port" elementType="Argument">
            <stringProp name="Argument.name">port</stringProp>
            <stringProp name="Argument.value">8080</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    <hashTree>
      <!-- 线程组配置 -->
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="用户线程组">
        <stringProp name="ThreadGroup.num_threads">100</stringProp> <!-- 100个并发用户 -->
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>    <!-- 10秒内启动完成 -->
        <stringProp name="ThreadGroup.loops">10</stringProp>        <!-- 每个用户循环10次 -->
      </ThreadGroup>
      <hashTree>
        <!-- HTTP请求配置 -->
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="查询用户列表">
          <stringProp name="HTTPSampler.domain">${host}</stringProp>
          <stringProp name="HTTPSampler.port">${port}</stringProp>
          <stringProp name="HTTPSampler.path">/system/user/list</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

**JMeter 命令行执行:**

```bash
# 执行压力测试
jmeter -n -t test-plan.jmx -l result.jtl -e -o report

# 参数说明:
# -n: 非GUI模式
# -t: 测试计划文件
# -l: 结果文件
# -e: 生成报告
# -o: 报告输出目录
```

**JMeter 性能指标:**

| 指标 | 说明 | 目标值 |
|------|------|--------|
| 吞吐量 (TPS) | 每秒处理请求数 | ≥ 1000 TPS |
| 响应时间 (RT) | 平均响应时间 | ≤ 200ms |
| 错误率 | 失败请求百分比 | ≤ 0.1% |
| 90%线 | 90%请求的响应时间 | ≤ 500ms |
| 95%线 | 95%请求的响应时间 | ≤ 1000ms |

### Gatling

Gatling 是基于 Scala 的现代化压力测试工具,支持编写灵活的测试脚本:

**Gatling 测试脚本示例:**

```scala
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class RuoYiPlusSimulation extends Simulation {

  // HTTP协议配置
  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  // 场景1: 用户查询
  val userQuery = scenario("用户查询")
    .exec(http("查询用户列表")
      .get("/system/user/list")
      .queryParam("pageNum", "1")
      .queryParam("pageSize", "10")
      .check(status.is(200))
      .check(jsonPath("$.code").is("200")))

  // 场景2: 用户新增
  val userInsert = scenario("用户新增")
    .exec(http("新增用户")
      .post("/system/user")
      .body(StringBody("""{"userName":"test","nickName":"测试用户"}"""))
      .check(status.is(200)))

  // 负载模型
  setUp(
    // 阶梯式增加负载
    userQuery.inject(
      rampUsers(50) during (10 seconds),  // 10秒内从0增加到50用户
      constantUsersPerSec(100) during (30 seconds), // 保持100 QPS持续30秒
      rampUsers(200) during (20 seconds)  // 20秒内增加到200用户
    ),
    userInsert.inject(
      constantUsersPerSec(10) during (60 seconds) // 保持10 TPS持续60秒
    )
  ).protocols(httpProtocol)
    .assertions(
      global.responseTime.max.lt(2000),      // 最大响应时间 < 2000ms
      global.responseTime.mean.lt(500),      // 平均响应时间 < 500ms
      global.successfulRequests.percent.gt(99) // 成功率 > 99%
    )
}
```

**Gatling 执行命令:**

```bash
# 执行压力测试
./gatling.sh -s RuoYiPlusSimulation

# 查看测试报告
# 报告位置: target/gatling/ruoyiplussimulation-*/index.html
```

### Apache Bench (ab)

Apache Bench 是轻量级的压力测试工具,适合快速测试单个接口:

```bash
# 基本压力测试
ab -n 10000 -c 100 http://localhost:8080/system/user/list

# 参数说明:
# -n: 总请求数 (10000次请求)
# -c: 并发数 (100个并发)

# 带 POST 请求体的压力测试
ab -n 1000 -c 50 -p data.json -T application/json http://localhost:8080/system/user

# 参数说明:
# -p: POST请求体文件
# -T: Content-Type

# 输出结果示例:
# Requests per second:    1523.45 [#/sec] (mean)
# Time per request:       65.642 [ms] (mean)
# Time per request:       0.656 [ms] (mean, across all concurrent requests)
# Transfer rate:          1245.32 [Kbytes/sec] received
```

**ab 性能指标解读:**

```
Concurrency Level:      100              # 并发级别
Time taken for tests:   6.563 seconds    # 总测试时间
Complete requests:      10000            # 完成请求数
Failed requests:        0                # 失败请求数
Requests per second:    1523.45 [#/sec]  # QPS (每秒请求数)
Time per request:       65.642 [ms]      # 平均响应时间(用户视角)
Time per request:       0.656 [ms]       # 平均响应时间(服务器视角)

Percentage of requests served within a certain time (ms)
  50%     60    # 50%的请求在60ms内完成
  66%     65
  75%     68
  80%     70
  90%     75
  95%     82
  98%     95
  99%    105
 100%    250 (longest request)
```

## 性能基准测试

### 建立性能基准

性能基准是衡量系统性能的参考标准:

```java
@SpringBootTest
@DisplayName("性能基准测试")
public class PerformanceBenchmarkTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    /**
     * 单次查询性能基准
     */
    @Test
    @DisplayName("性能基准-单次查询")
    @RepeatedTest(100)
    public void benchmarkSingleQuery() {
        SysUserVo user = userService.getUserById(1L);
        assertNotNull(user);

        // 基准: 单次查询应该在50ms内完成
    }

    /**
     * 批量查询性能基准
     */
    @Test
    @DisplayName("性能基准-批量查询100条")
    public void benchmarkBatchQuery() {
        PageQuery pageQuery = new PageQuery(100, 1);
        PageResult<SysUserVo> result = DataPermissionHelper.ignore(() ->
            userService.pageUsers(new SysUserBo(), pageQuery)
        );

        assertNotNull(result);
        // 基准: 查询100条应该在200ms内完成
    }

    /**
     * 复杂查询性能基准
     */
    @Test
    @DisplayName("性能基准-复杂条件查询")
    public void benchmarkComplexQuery() {
        SysUserBo queryBo = new SysUserBo();
        queryBo.setUserName("admin");
        queryBo.setStatus("1");

        PageQuery pageQuery = new PageQuery(10, 1);
        PageResult<SysUserVo> result = DataPermissionHelper.ignore(() ->
            userService.pageUsers(queryBo, pageQuery)
        );

        assertNotNull(result);
        // 基准: 复杂查询应该在300ms内完成
    }

    @Override
    protected long getPerformanceThreshold() {
        return 300L; // 性能基准阈值
    }
}
```

**性能基准记录表:**

| 操作 | 基准时间 | 实际时间 | 状态 | 备注 |
|------|---------|---------|------|------|
| 单次查询 | 50ms | 35ms | ✅ | 正常 |
| 批量查询100条 | 200ms | 185ms | ✅ | 正常 |
| 复杂条件查询 | 300ms | 425ms | ⚠️ | 需优化 |
| 批量插入100条 | 2000ms | 1850ms | ✅ | 正常 |

### 性能回归测试

在代码变更后,运行性能回归测试确保性能不会退化:

```java
@SpringBootTest
@Transactional
@DisplayName("性能回归测试")
public class PerformanceRegressionTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    /**
     * 性能回归基准数据(毫秒)
     */
    private static final Map<String, Long> PERFORMANCE_BASELINE = Map.of(
        "singleQuery", 50L,
        "batchQuery", 200L,
        "batchInsert", 2000L
    );

    /**
     * 允许的性能波动百分比
     */
    private static final double TOLERANCE_PERCENT = 0.2; // 20%

    @Test
    @DisplayName("回归测试-单次查询")
    public void regressionTestSingleQuery() {
        long baseline = PERFORMANCE_BASELINE.get("singleQuery");

        long startTime = System.currentTimeMillis();
        SysUserVo user = userService.getUserById(1L);
        long endTime = System.currentTimeMillis();

        long actualTime = endTime - startTime;
        long threshold = (long)(baseline * (1 + TOLERANCE_PERCENT));

        System.out.println("单次查询 - 基准: " + baseline + "ms, 实际: " + actualTime + "ms");

        assertTrue(actualTime <= threshold,
            String.format("性能回归: 实际时间%dms超过阈值%dms", actualTime, threshold));
    }

    @Test
    @DisplayName("回归测试-批量插入")
    public void regressionTestBatchInsert() {
        long baseline = PERFORMANCE_BASELINE.get("batchInsert");

        List<SysUserBo> users = TestDataBuilder.randomList(100, () ->
            UserTestDataBuilder.aUser().withRandomData().build()
        );

        long startTime = System.currentTimeMillis();
        for (SysUserBo user : users) {
            userService.insertUser(user);
        }
        long endTime = System.currentTimeMillis();

        long actualTime = endTime - startTime;
        long threshold = (long)(baseline * (1 + TOLERANCE_PERCENT));

        System.out.println("批量插入 - 基准: " + baseline + "ms, 实际: " + actualTime + "ms");

        assertTrue(actualTime <= threshold,
            String.format("性能回归: 实际时间%dms超过阈值%dms", actualTime, threshold));
    }
}
```

## 性能优化建议

### 数据库层面优化

```java
@SpringBootTest
@Transactional
@DisplayName("数据库性能优化测试")
public class DatabaseOptimizationTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    /**
     * 优化前: N+1 查询问题
     */
    @Test
    @DisplayName("N+1查询问题演示(慢)")
    public void testNPlusOneQuery() {
        // 查询所有用户
        PageQuery pageQuery = new PageQuery(100, 1);
        PageResult<SysUserVo> result = DataPermissionHelper.ignore(() ->
            userService.pageUsers(new SysUserBo(), pageQuery)
        );

        // 为每个用户查询角色(N+1问题)
        for (SysUserVo user : result.getRecords()) {
            // 额外的N次查询
            // List<SysRoleVo> roles = roleService.listRolesByUserId(user.getUserId());
        }

        // 总查询次数: 1 + N
        // 性能差: ~2000ms
    }

    /**
     * 优化后: 批量查询
     */
    @Test
    @DisplayName("批量查询优化(快)")
    public void testBatchQuery() {
        // 查询所有用户
        PageQuery pageQuery = new PageQuery(100, 1);
        PageResult<SysUserVo> result = DataPermissionHelper.ignore(() ->
            userService.pageUsers(new SysUserBo(), pageQuery)
        );

        // 批量查询所有用户的角色
        List<Long> userIds = result.getRecords().stream()
            .map(SysUserVo::getUserId)
            .collect(Collectors.toList());

        // 一次查询获取所有角色
        // Map<Long, List<SysRoleVo>> userRolesMap = roleService.batchListRolesByUserIds(userIds);

        // 总查询次数: 2
        // 性能好: ~200ms
    }
}
```

### 缓存层面优化

```java
@SpringBootTest
@DisplayName("缓存性能优化测试")
public class CacheOptimizationTest extends BaseTest {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 优化前: 每次都查数据库
     */
    @Test
    @DisplayName("无缓存查询(慢)")
    public void testWithoutCache() {
        for (int i = 0; i < 100; i++) {
            // 每次都查数据库
            // SysDictDataVo dictData = dictDataService.getDictData(1L);
        }
        // 100次数据库查询: ~1500ms
    }

    /**
     * 优化后: 使用缓存
     */
    @Test
    @DisplayName("使用缓存查询(快)")
    public void testWithCache() {
        for (int i = 0; i < 100; i++) {
            String cacheKey = "dict:data:1";

            // 先查缓存
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached == null) {
                // 缓存未命中,查数据库
                // SysDictDataVo dictData = dictDataService.getDictData(1L);
                // redisTemplate.opsForValue().set(cacheKey, dictData, 30, TimeUnit.MINUTES);
            }
        }
        // 只有第1次查数据库,后99次命中缓存: ~50ms
    }
}
```

### 代码层面优化

```java
@SpringBootTest
@DisplayName("代码优化性能对比")
public class CodeOptimizationTest extends BaseTest {

    /**
     * 优化前: 使用 List 频繁查找
     */
    @Test
    @DisplayName("List查找(慢)")
    public void testListSearch() {
        List<Integer> list = IntStream.range(1, 10000)
            .boxed()
            .collect(Collectors.toList());

        for (int i = 0; i < 1000; i++) {
            // O(n) 时间复杂度
            boolean contains = list.contains(5000);
        }
        // 1000次查找: ~800ms
    }

    /**
     * 优化后: 使用 Set 快速查找
     */
    @Test
    @DisplayName("Set查找(快)")
    public void testSetSearch() {
        Set<Integer> set = IntStream.range(1, 10000)
            .boxed()
            .collect(Collectors.toSet());

        for (int i = 0; i < 1000; i++) {
            // O(1) 时间复杂度
            boolean contains = set.contains(5000);
        }
        // 1000次查找: ~5ms
    }

    /**
     * 优化前: 字符串拼接
     */
    @Test
    @DisplayName("String拼接(慢)")
    public void testStringConcat() {
        String result = "";
        for (int i = 0; i < 10000; i++) {
            result += "a"; // 每次创建新对象
        }
        // 性能差: ~1500ms
    }

    /**
     * 优化后: StringBuilder
     */
    @Test
    @DisplayName("StringBuilder拼接(快)")
    public void testStringBuilder() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10000; i++) {
            sb.append("a"); // 复用对象
        }
        String result = sb.toString();
        // 性能好: ~5ms
    }

    @Override
    protected long getPerformanceThreshold() {
        return 1000L;
    }
}
```

## 最佳实践

### 1. 为所有测试设置性能阈值

**推荐做法** ✅:

```java
@SpringBootTest
@DisplayName("用户服务测试")
public class SysUserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试查询用户")
    public void testGetUser() {
        SysUserVo user = userService.getUserById(1L);
        assertNotNull(user);
        // ✅ 自动监控性能,超过阈值会告警
    }

    /**
     * ✅ 根据测试类型设置合理的性能阈值
     */
    @Override
    protected long getPerformanceThreshold() {
        return 1000L; // Service层测试: 1秒
    }
}
```

**不推荐做法** ❌:

```java
@SpringBootTest
@DisplayName("用户服务测试")
public class SysUserServiceTest {
    // ❌ 没有继承BaseTest,缺少性能监控

    @Test
    @DisplayName("测试查询用户")
    public void testGetUser() {
        SysUserVo user = userService.getUserById(1L);
        assertNotNull(user);
        // ❌ 无法知道执行时间,可能存在性能问题
    }
}
```

### 2. 使用 @Timeout 防止测试超时

**推荐做法** ✅:

```java
@Test
@Timeout(value = 5L, unit = TimeUnit.SECONDS)
@DisplayName("测试批量操作")
public void testBatchOperation() {
    // ✅ 设置超时时间,防止测试无限挂起
    List<SysUserBo> users = generateTestUsers(1000);
    for (SysUserBo user : users) {
        userService.insertUser(user);
    }
    // 如果超过5秒,测试会失败
}
```

**不推荐做法** ❌:

```java
@Test
@DisplayName("测试批量操作")
public void testBatchOperation() {
    // ❌ 没有超时控制,可能因性能问题导致测试永久挂起
    List<SysUserBo> users = generateTestUsers(1000);
    for (SysUserBo user : users) {
        userService.insertUser(user);
    }
}
```

### 3. 使用重复测试验证性能稳定性

**推荐做法** ✅:

```java
@RepeatedTest(20)
@DisplayName("重复测试-验证性能稳定性")
public void testPerformanceStability() {
    // ✅ 重复执行20次,确保性能稳定
    List<Integer> result = StreamUtils.filter(largeList, n -> n > 1000);
    assertTrue(result.size() > 0);
    // 检查每次执行时间是否稳定在阈值内
}
```

**不推荐做法** ❌:

```java
@Test
@DisplayName("性能测试")
public void testPerformance() {
    // ❌ 只执行一次,无法发现性能波动问题
    List<Integer> result = StreamUtils.filter(largeList, n -> n > 1000);
    assertTrue(result.size() > 0);
}
```

### 4. 并发测试使用正确的同步机制

**推荐做法** ✅:

```java
@Test
@DisplayName("并发测试-正确的同步机制")
public void testConcurrency() throws InterruptedException {
    int threadCount = 50;
    ExecutorService executor = Executors.newFixedThreadPool(threadCount);
    CountDownLatch latch = new CountDownLatch(threadCount);

    // ✅ 使用 CountDownLatch 等待所有线程完成
    for (int i = 0; i < threadCount; i++) {
        executor.submit(() -> {
            try {
                performOperation();
            } finally {
                latch.countDown(); // ✅ 确保在finally中调用
            }
        });
    }

    latch.await(30, TimeUnit.SECONDS); // ✅ 设置超时时间
    executor.shutdown();
}
```

**不推荐做法** ❌:

```java
@Test
@DisplayName("并发测试-错误的同步机制")
public void testConcurrency() {
    // ❌ 没有使用 CountDownLatch,测试可能在线程执行完成前就结束
    for (int i = 0; i < 50; i++) {
        new Thread(() -> {
            performOperation();
        }).start();
    }
    // ❌ 主线程立即结束,无法等待所有线程完成
}
```

### 5. 压力测试前预热 JVM

**推荐做法** ✅:

```java
@SpringBootTest
@DisplayName("压力测试")
public class StressTest extends BaseServiceTest {

    @BeforeAll
    public static void warmUp(@Autowired ISysUserService userService) {
        // ✅ 预热JVM,避免JIT编译影响测试结果
        System.out.println("开始预热JVM...");
        for (int i = 0; i < 1000; i++) {
            userService.getUserById(1L);
        }
        System.out.println("预热完成");
    }

    @Test
    @DisplayName("压力测试-查询性能")
    public void testQueryPerformance() {
        // 开始真正的压力测试
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < 10000; i++) {
            userService.getUserById(1L);
        }
        long endTime = System.currentTimeMillis();

        System.out.println("10000次查询耗时: " + (endTime - startTime) + "ms");
    }
}
```

**不推荐做法** ❌:

```java
@Test
@DisplayName("压力测试-查询性能")
public void testQueryPerformance() {
    // ❌ 没有预热,JIT编译会影响前几次执行的性能
    long startTime = System.currentTimeMillis();
    for (int i = 0; i < 10000; i++) {
        userService.getUserById(1L);
    }
    long endTime = System.currentTimeMillis();

    System.out.println("10000次查询耗时: " + (endTime - startTime) + "ms");
    // ⚠️ 结果可能不准确,因为包含了JIT编译时间
}
```

## 常见问题

### 1. 性能测试结果不稳定

**问题原因:**

- JVM 未预热,JIT 编译影响性能
- 测试环境资源不足(CPU、内存、磁盘IO)
- 数据库缓存影响测试结果
- 测试数据量不一致

**解决方案:**

方案1: JVM 预热

```java
@BeforeAll
public static void warmUp(@Autowired ISysUserService userService) {
    System.out.println("开始预热JVM...");

    // 预热1: 执行1000次查询
    for (int i = 0; i < 1000; i++) {
        userService.getUserById(1L);
    }

    // 预热2: 强制垃圾回收
    System.gc();
    Thread.sleep(1000);

    System.out.println("预热完成");
}
```

方案2: 使用重复测试取平均值

```java
@RepeatedTest(50)
@DisplayName("重复测试-取平均值")
public void testWithAverage() {
    long startTime = System.nanoTime();
    performOperation();
    long endTime = System.nanoTime();

    times.add((endTime - startTime) / 1000000); // 转换为毫秒
}

@AfterAll
public static void analyzeResults() {
    // 去掉最高和最低的10%,计算平均值
    Collections.sort(times);
    int skip = times.size() / 10;
    double average = times.stream()
        .skip(skip)
        .limit(times.size() - 2 * skip)
        .mapToLong(Long::longValue)
        .average()
        .orElse(0.0);

    System.out.println("去除极值后的平均时间: " + average + "ms");
}
```

### 2. 并发测试出现死锁

**问题原因:**

- 多个线程竞争相同资源
- 锁的获取顺序不一致
- 事务隔离级别设置不当

**解决方案:**

方案1: 添加死锁检测

```java
@Test
@DisplayName("并发测试-死锁检测")
public void testWithDeadlockDetection() throws InterruptedException {
    ExecutorService executor = Executors.newFixedThreadPool(10);
    CountDownLatch latch = new CountDownLatch(10);

    // 启动死锁检测线程
    Thread deadlockDetector = new Thread(() -> {
        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
        while (!Thread.currentThread().isInterrupted()) {
            long[] deadlockedThreads = threadMXBean.findDeadlockedThreads();
            if (deadlockedThreads != null) {
                System.err.println("⚠️ 检测到死锁! 涉及线程数: " + deadlockedThreads.length);
                for (long threadId : deadlockedThreads) {
                    ThreadInfo info = threadMXBean.getThreadInfo(threadId);
                    System.err.println("线程ID: " + threadId + ", 名称: " + info.getThreadName());
                }
                Thread.currentThread().interrupt();
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                break;
            }
        }
    });
    deadlockDetector.start();

    // 执行并发测试...

    deadlockDetector.interrupt();
}
```

方案2: 使用超时避免死锁

```java
@Test
@Timeout(value = 30L, unit = TimeUnit.SECONDS)
@DisplayName("并发测试-超时保护")
public void testWithTimeout() throws InterruptedException {
    // 设置30秒超时,避免死锁导致测试永久挂起
    ExecutorService executor = Executors.newFixedThreadPool(10);
    // ...执行并发测试
}
```

### 3. 压力测试影响生产环境

**问题原因:**

- 压力测试连接到生产数据库
- 测试数据未隔离
- 压力过大导致服务崩溃

**解决方案:**

方案1: 使用专门的测试环境

```yaml
# application-perf-test.yml
spring:
  datasource:
    url: jdbc:mysql://test-db-server:3306/ruoyi_plus_test  # 测试数据库
    username: test_user
    password: test_password

  profiles:
    active: perf-test  # 性能测试专用配置
```

方案2: 使用 @ActiveProfiles 指定测试环境

```java
@SpringBootTest
@ActiveProfiles("perf-test")  // 使用性能测试配置
@DisplayName("压力测试")
public class StressTest extends BaseTest {

    @Test
    @DisplayName("压力测试-确保使用测试环境")
    public void testStress() {
        // 确保连接到测试环境
        assertNotEquals("production", System.getProperty("spring.profiles.active"));
    }
}
```

### 4. 性能测试数据不真实

**问题原因:**

- 测试数据量太小
- 测试数据分布不均匀
- 缓存命中率与生产环境差异大

**解决方案:**

方案1: 准备真实数据量

```java
@SpringBootTest
@Transactional
@DisplayName("真实数据量测试")
public class RealisticDataVolumeTest extends BaseServiceTest {

    @BeforeAll
    public static void prepareData(@Autowired ISysUserService userService) {
        System.out.println("准备测试数据...");

        // 插入10000条用户数据(模拟生产环境数据量)
        for (int i = 0; i < 10000; i++) {
            SysUserBo user = UserTestDataBuilder.aUser()
                .withUserName("perf_test_user_" + i)
                .withRandomData()
                .build();
            userService.insertUser(user);

            if (i % 1000 == 0) {
                System.out.println("已插入 " + i + " 条数据...");
            }
        }

        System.out.println("测试数据准备完成");
    }

    @Test
    @DisplayName("测试真实数据量下的查询性能")
    public void testQueryWithRealisticData() {
        // 在10000条数据中查询
        PageQuery pageQuery = new PageQuery(20, 1);
        PageResult<SysUserVo> result = DataPermissionHelper.ignore(() ->
            userService.pageUsers(new SysUserBo(), pageQuery)
        );

        assertTrue(result.getTotal() >= 10000);
        // 真实数据量下的性能表现
    }
}
```

方案2: 模拟真实访问模式

```java
@Test
@DisplayName("模拟真实访问模式")
public void testRealisticAccessPattern() {
    Random random = new Random();

    // 80%的查询集中在20%的热点数据上(符合二八定律)
    for (int i = 0; i < 1000; i++) {
        Long userId;
        if (random.nextDouble() < 0.8) {
            // 80%的请求访问热点数据(用户ID 1-200)
            userId = (long) (random.nextInt(200) + 1);
        } else {
            // 20%的请求访问长尾数据(用户ID 201-10000)
            userId = (long) (random.nextInt(9800) + 201);
        }

        SysUserVo user = userService.getUserById(userId);
        assertNotNull(user);
    }
}
```

### 5. 性能测试无法复现生产问题

**问题原因:**

- 测试环境配置与生产环境差异大
- 测试数据与生产数据特征不同
- 缺少真实的并发场景

**解决方案:**

方案1: 记录生产环境性能基线

```java
/**
 * 生产环境性能基线(从生产监控系统获取)
 */
private static final Map<String, PerformanceBaseline> PRODUCTION_BASELINE = Map.of(
    "getUserById", new PerformanceBaseline(25L, 50L, 100L), // P50, P90, P99
    "pageUsers", new PerformanceBaseline(80L, 150L, 300L),
    "insertUser", new PerformanceBaseline(120L, 200L, 400L)
);

@Test
@DisplayName("对比生产环境基线")
public void testAgainstProductionBaseline() {
    List<Long> times = new ArrayList<>();

    // 执行1000次测试
    for (int i = 0; i < 1000; i++) {
        long startTime = System.currentTimeMillis();
        userService.getUserById(1L);
        long endTime = System.currentTimeMillis();
        times.add(endTime - startTime);
    }

    // 计算P50, P90, P99
    Collections.sort(times);
    long p50 = times.get((int)(times.size() * 0.50));
    long p90 = times.get((int)(times.size() * 0.90));
    long p99 = times.get((int)(times.size() * 0.99));

    PerformanceBaseline baseline = PRODUCTION_BASELINE.get("getUserById");

    System.out.println("=== 性能对比 ===");
    System.out.println("P50: " + p50 + "ms (基线: " + baseline.p50 + "ms)");
    System.out.println("P90: " + p90 + "ms (基线: " + baseline.p90 + "ms)");
    System.out.println("P99: " + p99 + "ms (基线: " + baseline.p99 + "ms)");

    // 验证不超过生产基线的120%
    assertTrue(p50 <= baseline.p50 * 1.2, "P50超过基线");
    assertTrue(p90 <= baseline.p90 * 1.2, "P90超过基线");
    assertTrue(p99 <= baseline.p99 * 1.2, "P99超过基线");
}

static class PerformanceBaseline {
    long p50, p90, p99;
    PerformanceBaseline(long p50, long p90, long p99) {
        this.p50 = p50; this.p90 = p90; this.p99 = p99;
    }
}
```

---

## 总结

RuoYi-Plus 框架提供了完善的性能测试工具和方法,从自动性能监控到专业压力测试,全方位保障系统性能:

**核心工具:**

1. **BaseTest 性能监控** - 自动记录执行时间,超过阈值自动告警
2. **@Timeout 注解** - 防止测试方法执行时间过长
3. **@RepeatedTest 注解** - 验证性能稳定性
4. **并发测试框架** - ExecutorService + CountDownLatch
5. **压力测试工具** - JMeter、Gatling、Apache Bench

**最佳实践:**

- 为所有测试设置合理的性能阈值
- 使用 @Timeout 防止测试超时
- 使用重复测试验证性能稳定性
- 并发测试使用正确的同步机制
- 压力测试前预热 JVM
- 建立性能基准和回归测试
- 使用真实数据量和访问模式

**性能指标:**

- 响应时间: P50 ≤ 100ms, P90 ≤ 200ms, P99 ≤ 500ms
- 吞吐量: QPS ≥ 1000
- 错误率: ≤ 0.1%
- 并发能力: 支持 100+ 并发用户

遵循以上实践,可以确保系统性能满足生产要求,及时发现和解决性能问题。
