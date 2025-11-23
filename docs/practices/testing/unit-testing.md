# 单元测试最佳实践

## 概述

单元测试是保障代码质量的第一道防线。RuoYi-Plus-UniApp 项目基于 Spring Boot Test + JUnit 5 构建了完整的测试框架，提供了丰富的测试基类、工具类和数据生成器，支持从简单的工具类测试到复杂的集成测试场景。

**核心价值:**

- **质量保障** - 及早发现缺陷，降低修复成本
- **重构信心** - 有测试保护的代码可以放心重构
- **文档作用** - 测试用例是最好的使用示例
- **设计驱动** - 编写测试促进更好的代码设计

**测试框架技术栈:**

| 框架/工具 | 版本 | 说明 |
|---------|------|------|
| Spring Boot Test | 3.5.6 | 测试启动器，集成多种测试工具 |
| JUnit 5 (Jupiter) | 5.10+ | 现代化单元测试框架 |
| Mockito | 5.x | Mock框架，模拟依赖对象 |
| AssertJ | 3.x | 流畅的断言库 |
| JavaFaker | 1.0.2 | 测试数据生成器 |
| Maven Surefire | 3.5.3 | 测试运行器插件 |

---

## 测试框架架构

### 测试分层结构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              测试分层架构                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     集成测试 (Integration Test)                      │   │
│   │   - 完整HTTP请求/响应测试                                            │   │
│   │   - 多模块协作测试                                                   │   │
│   │   - 端到端流程测试                                                   │   │
│   │   基类: BaseControllerTest                                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                                    │                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     服务层测试 (Service Test)                        │   │
│   │   - 业务逻辑测试                                                     │   │
│   │   - 数据库操作测试                                                   │   │
│   │   - 事务自动回滚                                                     │   │
│   │   基类: BaseServiceTest                                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                                    │                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     单元测试 (Unit Test)                             │   │
│   │   - 工具类测试                                                       │   │
│   │   - 纯函数测试                                                       │   │
│   │   - 无外部依赖                                                       │   │
│   │   基类: BaseTest                                                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 测试目录结构

```
ruoyi-admin/src/test/
├── java/
│   └── plus/ruoyi/
│       ├── business/                    # 业务模块测试
│       │   ├── integration/             # 集成测试
│       │   │   ├── SystemFeatureIntegrationTest.java
│       │   │   ├── HomeIntegrationTest.java
│       │   │   └── AiChatIntegrationTest.java
│       │   ├── service/                 # 服务层测试
│       │   │   ├── base/
│       │   │   │   └── AdServiceTest.java
│       │   │   └── mall/
│       │   │       ├── OrderServiceTest.java
│       │   │       └── GoodsServiceTest.java
│       │   └── client/                  # API客户端
│       │       ├── BusinessApiClient.java
│       │       └── SystemApiClient.java
│       └── common/                      # 通用模块测试
│           ├── core/utils/              # 工具类测试
│           │   ├── DateUtilsTest.java
│           │   ├── StringUtilsTest.java
│           │   └── StreamUtilsTest.java
│           ├── encrypt/                 # 加密工具测试
│           │   └── EncryptUtilsTest.java
│           └── json/utils/              # JSON工具测试
│               └── JsonUtilsTest.java
└── resources/
    └── cleanup_test_data.sql            # 测试数据清理脚本
```

---

## 测试基类详解

### BaseTest - 基础测试类

所有测试类的基类，提供性能监控和生命周期管理：

```java
package plus.ruoyi.common.test.base;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.util.StopWatch;

/**
 * 基础测试类
 *
 * 功能:
 * - 自动性能监控(StopWatch)
 * - 性能阈值警告(默认3秒)
 * - setUp/tearDown 生命周期方法
 * - 线程隔离的计时器
 */
public abstract class BaseTest {

    /** 线程本地的计时器,保证线程安全 */
    private static final ThreadLocal<StopWatch> STOP_WATCH =
        ThreadLocal.withInitial(StopWatch::new);

    /** 性能监控开关,默认开启 */
    private boolean enablePerformanceMonitor = true;

    /**
     * 获取性能阈值(毫秒)
     * 子类可重写此方法自定义阈值
     */
    protected long getPerformanceThreshold() {
        return 3000L; // 默认3秒
    }

    /**
     * 测试前置处理
     * 子类可重写此方法进行初始化
     */
    protected void setUp() {
        // 子类可重写
    }

    /**
     * 测试后置处理
     * 子类可重写此方法进行清理
     */
    protected void tearDown() {
        // 子类可重写
    }

    @BeforeEach
    public final void beforeEach() {
        if (enablePerformanceMonitor) {
            StopWatch sw = STOP_WATCH.get();
            if (sw.isRunning()) {
                sw.stop();
            }
            sw.start();
        }
        setUp();
    }

    @AfterEach
    public final void afterEach() {
        tearDown();
        if (enablePerformanceMonitor) {
            StopWatch sw = STOP_WATCH.get();
            if (sw.isRunning()) {
                sw.stop();
            }
            long time = sw.getLastTaskTimeMillis();
            if (time > getPerformanceThreshold()) {
                System.out.println("[性能警告] 测试执行时间: " + time + "ms, " +
                    "超过阈值: " + getPerformanceThreshold() + "ms");
            }
        }
    }
}
```

**使用示例:**

```java
class DateUtilsTest extends BaseTest {

    @Override
    protected long getPerformanceThreshold() {
        return 1000L; // 工具类测试阈值设为1秒
    }

    @Override
    protected void setUp() {
        // 初始化测试数据
    }

    @Test
    @DisplayName("测试日期格式化")
    void testDateFormat() {
        String result = DateUtils.format(new Date(), "yyyy-MM-dd");
        assertNotNull(result);
        assertTrue(result.matches("\\d{4}-\\d{2}-\\d{2}"));
    }
}
```

### BaseServiceTest - 服务层测试基类

提供事务自动回滚和数据库操作测试支持：

```java
package plus.ruoyi.common.test.base;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

/**
 * 服务层测试基类
 *
 * 功能:
 * - 自动事务回滚保护
 * - 真实数据库操作测试
 * - 外部依赖Mock支持
 */
@SpringBootTest
@Transactional
@Rollback
public abstract class BaseServiceTest extends BaseTest {

    /**
     * 获取性能阈值
     * 服务层测试涉及数据库,默认5秒
     */
    @Override
    protected long getPerformanceThreshold() {
        return 5000L;
    }
}
```

**使用示例:**

```java
class OrderServiceTest extends BaseServiceTest {

    @Autowired
    private OrderService orderService;

    @Test
    @DisplayName("测试新增订单")
    void testAddOrder() {
        // 准备测试数据
        OrderBo order = createTestOrder("测试订单");

        // 执行测试
        Long orderId = orderService.add(order);

        // 验证结果
        assertNotNull(orderId);
        assertTrue(orderId > 0);

        // 验证可以查询到
        OrderVo orderVo = orderService.get(orderId);
        assertNotNull(orderVo);
        assertEquals(order.getOrderNo(), orderVo.getOrderNo());

        // 测试结束后事务自动回滚,不会污染数据库
    }

    private OrderBo createTestOrder(String remark) {
        OrderBo order = new OrderBo();
        order.setOrderNo(TestDataBuilder.randomString(20));
        order.setUserId(TestDataBuilder.randomId());
        order.setTotalAmount(TestDataBuilder.randomBigDecimal(100, 10000));
        order.setRemark(remark);
        return order;
    }
}
```

### BaseControllerTest - 控制器测试基类

提供 MockMvc 和 HTTP 请求工具方法：

```java
package plus.ruoyi.common.test.base;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 控制器测试基类
 *
 * 功能:
 * - MockMvc HTTP请求模拟
 * - JSON序列化/反序列化
 * - 完整的CRUD请求方法
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public abstract class BaseControllerTest extends BaseTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * 执行GET请求
     */
    protected MvcResult performGet(String url) throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.get(url)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();
    }

    /**
     * 执行GET请求(带参数)
     */
    protected MvcResult performGet(String url, Object... params) throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.get(url, params)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();
    }

    /**
     * 执行POST请求
     */
    protected MvcResult performPost(String url) throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.post(url)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();
    }

    /**
     * 执行POST请求(带请求体)
     */
    protected MvcResult performPost(String url, Object body) throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(body)))
            .andExpect(status().isOk())
            .andReturn();
    }

    /**
     * 执行PUT请求
     */
    protected MvcResult performPut(String url, Object body) throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.put(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(body)))
            .andExpect(status().isOk())
            .andReturn();
    }

    /**
     * 执行DELETE请求
     */
    protected MvcResult performDelete(String url) throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.delete(url)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();
    }

    /**
     * 对象转JSON字符串
     */
    protected String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    /**
     * JSON字符串转对象
     */
    protected <T> T fromJson(String json, Class<T> clazz) throws Exception {
        return objectMapper.readValue(json, clazz);
    }

    /**
     * 从MvcResult提取响应体
     */
    protected <T> T getResponseBody(MvcResult result, Class<T> clazz) throws Exception {
        String content = result.getResponse().getContentAsString();
        return fromJson(content, clazz);
    }
}
```

---

## 测试数据生成器

### TestDataBuilder 工具类

提供 50+ 种随机数据生成方法，基于 JavaFaker 库：

```java
package plus.ruoyi.common.test.base;

import com.github.javafaker.Faker;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 测试数据生成工具类
 *
 * 功能:
 * - 用户数据: 姓名、手机号、邮箱、密码
 * - 位置数据: 地址、IP
 * - 企业数据: 公司名称
 * - 网络数据: URL
 * - 文本数据: 随机字符串
 * - 数值数据: 整数、长整数、浮点数
 * - 时间数据: 日期时间
 * - 集合工具: 列表、集合生成
 */
public class TestDataBuilder {

    private static final Faker FAKER = new Faker(Locale.CHINA);
    private static final Random RANDOM = new Random();

    // ==================== 用户数据 ====================

    /** 生成随机用户名 */
    public static String randomUserName() {
        return FAKER.name().username();
    }

    /** 生成随机中文姓名 */
    public static String randomChineseName() {
        return FAKER.name().fullName();
    }

    /** 生成随机手机号 */
    public static String randomPhone() {
        return FAKER.phoneNumber().cellPhone();
    }

    /** 生成随机邮箱 */
    public static String randomEmail() {
        return FAKER.internet().emailAddress();
    }

    /** 生成随机密码(包含大小写字母、数字、特殊字符) */
    public static String randomPassword() {
        return FAKER.internet().password(8, 16, true, true, true);
    }

    // ==================== 位置数据 ====================

    /** 生成随机地址 */
    public static String randomAddress() {
        return FAKER.address().fullAddress();
    }

    /** 生成随机IP地址 */
    public static String randomIp() {
        return FAKER.internet().ipV4Address();
    }

    // ==================== 企业数据 ====================

    /** 生成随机公司名称 */
    public static String randomCompany() {
        return FAKER.company().name();
    }

    // ==================== 网络数据 ====================

    /** 生成随机URL */
    public static String randomUrl() {
        return FAKER.internet().url();
    }

    // ==================== 文本数据 ====================

    /** 生成指定长度的随机字符串 */
    public static String randomString(int length) {
        return FAKER.lorem().characters(length);
    }

    /** 生成随机UUID */
    public static String randomUuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    // ==================== 数值数据 ====================

    /** 生成随机整数 */
    public static int randomInt() {
        return RANDOM.nextInt();
    }

    /** 生成指定范围的随机整数 */
    public static int randomInt(int min, int max) {
        return RANDOM.nextInt(max - min + 1) + min;
    }

    /** 生成随机长整数 */
    public static long randomLong() {
        return RANDOM.nextLong();
    }

    /** 生成正数随机ID */
    public static Long randomId() {
        return Math.abs(RANDOM.nextLong() % 1000000) + 1;
    }

    /** 生成随机布尔值 */
    public static boolean randomBoolean() {
        return RANDOM.nextBoolean();
    }

    /** 生成随机BigDecimal */
    public static BigDecimal randomBigDecimal(int min, int max) {
        double value = min + (max - min) * RANDOM.nextDouble();
        return BigDecimal.valueOf(value).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    // ==================== 时间数据 ====================

    /** 生成随机日期时间(过去一年内) */
    public static LocalDateTime randomDateTime() {
        return LocalDateTime.now()
            .minusDays(RANDOM.nextInt(365))
            .minusHours(RANDOM.nextInt(24))
            .minusMinutes(RANDOM.nextInt(60));
    }

    /** 生成随机未来日期时间 */
    public static LocalDateTime randomFutureDateTime() {
        return LocalDateTime.now()
            .plusDays(RANDOM.nextInt(365) + 1)
            .plusHours(RANDOM.nextInt(24));
    }

    // ==================== 业务数据 ====================

    /** 生成随机状态(0-正常, 1-停用) */
    public static String randomStatus() {
        return RANDOM.nextBoolean() ? "0" : "1";
    }

    /** 生成随机删除标志(0-未删除, 2-已删除) */
    public static String randomDelFlag() {
        return "0"; // 测试数据默认未删除
    }

    // ==================== 集合工具 ====================

    /** 从列表中随机选择一个元素 */
    public static <T> T randomChoice(List<T> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.get(RANDOM.nextInt(list.size()));
    }

    /** 生成随机列表 */
    public static <T> List<T> randomList(int size, java.util.function.Supplier<T> supplier) {
        List<T> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            list.add(supplier.get());
        }
        return list;
    }

    /** 生成随机集合 */
    public static <T> Set<T> randomSet(int size, java.util.function.Supplier<T> supplier) {
        Set<T> set = new HashSet<>();
        while (set.size() < size) {
            set.add(supplier.get());
        }
        return set;
    }
}
```

**使用示例:**

```java
@Test
void testCreateUser() {
    // 使用 TestDataBuilder 生成测试数据
    UserBo user = new UserBo();
    user.setUserName(TestDataBuilder.randomUserName());
    user.setNickName(TestDataBuilder.randomChineseName());
    user.setEmail(TestDataBuilder.randomEmail());
    user.setPhoneNumber(TestDataBuilder.randomPhone());
    user.setPassword(TestDataBuilder.randomPassword());

    // 执行测试
    Long userId = userService.insertUser(user);
    assertNotNull(userId);
}
```

---

## 测试用例编写规范

### 命名规范

```java
// 测试类命名: 被测类名 + Test
class OrderServiceTest extends BaseServiceTest { }
class DateUtilsTest extends BaseTest { }

// 测试方法命名: test + 方法名 + 场景描述(可选)
@Test
@DisplayName("测试新增订单-正常场景")
void testAdd() { }

@Test
@DisplayName("测试新增订单-参数为空")
void testAddWithNullParam() { }

@Test
@DisplayName("测试新增订单-重复订单号")
void testAddWithDuplicateOrderNo() { }
```

### AAA 模式

遵循 Arrange-Act-Assert 模式编写测试：

```java
@Test
@DisplayName("测试订单金额计算")
void testCalculateOrderAmount() {
    // ========== Arrange (准备) ==========
    OrderBo order = new OrderBo();
    order.setQuantity(10);
    order.setUnitPrice(new BigDecimal("99.99"));

    // ========== Act (执行) ==========
    BigDecimal totalAmount = orderService.calculateAmount(order);

    // ========== Assert (验证) ==========
    assertEquals(new BigDecimal("999.90"), totalAmount);
}
```

### 断言最佳实践

```java
// ========== JUnit 5 断言 ==========
import static org.junit.jupiter.api.Assertions.*;

// 基础断言
assertNotNull(result, "结果不应为空");
assertEquals(expected, actual, "值应该相等");
assertTrue(condition, "条件应为真");
assertFalse(condition, "条件应为假");

// 集合断言
assertIterableEquals(expectedList, actualList);

// 异常断言
assertThrows(IllegalArgumentException.class, () -> {
    service.processInvalidData(null);
}, "应抛出参数异常");

// 超时断言
assertTimeout(Duration.ofSeconds(5), () -> {
    service.longRunningTask();
}, "操作应在5秒内完成");

// ========== AssertJ 流畅断言(推荐) ==========
import static org.assertj.core.api.Assertions.*;

// 字符串断言
assertThat(result)
    .isNotNull()
    .isNotEmpty()
    .startsWith("prefix")
    .contains("keyword")
    .hasSize(10);

// 数值断言
assertThat(amount)
    .isPositive()
    .isGreaterThan(BigDecimal.ZERO)
    .isLessThanOrEqualTo(new BigDecimal("1000"));

// 集合断言
assertThat(list)
    .isNotEmpty()
    .hasSize(5)
    .contains(item1, item2)
    .doesNotContain(item3)
    .extracting("name")
    .containsExactly("Alice", "Bob");

// 对象断言
assertThat(user)
    .isNotNull()
    .extracting("name", "age")
    .containsExactly("张三", 25);

// 异常断言
assertThatThrownBy(() -> service.process(null))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessage("参数不能为空");
```

---

## 常见测试场景

### 1. 工具类测试

```java
class DateUtilsTest extends BaseTest {

    @Test
    @DisplayName("测试日期格式化")
    void testFormat() {
        Date date = DateUtils.parseDate("2024-01-15 10:30:00");

        String result = DateUtils.format(date, "yyyy-MM-dd");

        assertEquals("2024-01-15", result);
    }

    @Test
    @DisplayName("测试解析多种日期格式")
    void testParseDate() {
        // 测试标准格式
        Date date1 = DateUtils.parseDate("2024-01-15");
        assertNotNull(date1);

        // 测试带时间格式
        Date date2 = DateUtils.parseDate("2024-01-15 10:30:00");
        assertNotNull(date2);

        // 测试无效格式
        assertThrows(IllegalArgumentException.class, () -> {
            DateUtils.parseDate("invalid-date");
        });
    }

    @Test
    @DisplayName("测试计算日期差")
    void testDateDiff() {
        Date start = DateUtils.parseDate("2024-01-01");
        Date end = DateUtils.parseDate("2024-01-15");

        long days = DateUtils.daysBetween(start, end);

        assertEquals(14, days);
    }
}
```

### 2. 服务层测试

```java
class OrderServiceTest extends BaseServiceTest {

    @Autowired
    private OrderService orderService;

    private OrderBo testOrder;

    @Override
    protected void setUp() {
        testOrder = createTestOrder("测试订单");
    }

    @Test
    @DisplayName("测试新增订单")
    void testAdd() {
        Long orderId = orderService.add(testOrder);

        assertNotNull(orderId);
        assertTrue(orderId > 0);

        OrderVo saved = orderService.get(orderId);
        assertNotNull(saved);
        assertEquals(testOrder.getOrderNo(), saved.getOrderNo());
    }

    @Test
    @DisplayName("测试查询订单详情")
    void testGet() {
        Long orderId = orderService.add(testOrder);

        OrderVo result = orderService.get(orderId);

        assertNotNull(result);
        assertEquals(orderId, result.getId());
        assertEquals(testOrder.getRemark(), result.getRemark());
    }

    @Test
    @DisplayName("测试分页查询订单")
    void testPage() {
        // 创建多个测试订单
        for (int i = 0; i < 15; i++) {
            orderService.add(createTestOrder("订单" + i));
        }

        OrderQuery query = new OrderQuery();
        query.setPageNum(1);
        query.setPageSize(10);

        TableDataInfo<OrderVo> page = orderService.page(query);

        assertNotNull(page);
        assertEquals(10, page.getRows().size());
        assertTrue(page.getTotal() >= 15);
    }

    @Test
    @DisplayName("测试更新订单")
    void testUpdate() {
        Long orderId = orderService.add(testOrder);

        OrderBo updateBo = new OrderBo();
        updateBo.setId(orderId);
        updateBo.setRemark("更新后的备注");

        boolean result = orderService.update(updateBo);

        assertTrue(result);

        OrderVo updated = orderService.get(orderId);
        assertEquals("更新后的备注", updated.getRemark());
    }

    @Test
    @DisplayName("测试删除订单")
    void testDelete() {
        Long orderId = orderService.add(testOrder);

        boolean result = orderService.delete(orderId);

        assertTrue(result);

        OrderVo deleted = orderService.get(orderId);
        assertNull(deleted);
    }

    @Test
    @DisplayName("测试批量删除订单")
    void testBatchDelete() {
        List<Long> ids = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            ids.add(orderService.add(createTestOrder("批量删除测试" + i)));
        }

        boolean result = orderService.batchDelete(ids);

        assertTrue(result);

        for (Long id : ids) {
            assertNull(orderService.get(id));
        }
    }

    private OrderBo createTestOrder(String remark) {
        OrderBo order = new OrderBo();
        order.setOrderNo(TestDataBuilder.randomString(20));
        order.setUserId(TestDataBuilder.randomId());
        order.setTotalAmount(TestDataBuilder.randomBigDecimal(100, 10000));
        order.setStatus("0");
        order.setRemark(remark);
        return order;
    }
}
```

### 3. 加密工具测试

```java
class EncryptUtilsTest extends BaseTest {

    private String testData;
    private String aes16Key;
    private String aes24Key;
    private String aes32Key;
    private String sm4Key;

    @Override
    protected void setUp() {
        testData = "Hello, RuoYi-Plus!";
        aes16Key = TestDataBuilder.randomString(16);
        aes24Key = TestDataBuilder.randomString(24);
        aes32Key = TestDataBuilder.randomString(32);
        sm4Key = TestDataBuilder.randomString(16);
    }

    @Test
    @DisplayName("测试Base64编解码")
    void testBase64() {
        String encoded = EncryptUtils.encryptByBase64(testData);
        String decoded = EncryptUtils.decryptByBase64(encoded);

        assertEquals(testData, decoded);
    }

    @Test
    @DisplayName("测试AES-16位密钥加解密")
    void testAes16() {
        String encrypted = EncryptUtils.encryptByAes(testData, aes16Key);
        String decrypted = EncryptUtils.decryptByAes(encrypted, aes16Key);

        assertNotEquals(testData, encrypted);
        assertEquals(testData, decrypted);
    }

    @Test
    @DisplayName("测试AES-24位密钥加解密")
    void testAes24() {
        String encrypted = EncryptUtils.encryptByAes(testData, aes24Key);
        String decrypted = EncryptUtils.decryptByAes(encrypted, aes24Key);

        assertEquals(testData, decrypted);
    }

    @Test
    @DisplayName("测试AES-32位密钥加解密")
    void testAes32() {
        String encrypted = EncryptUtils.encryptByAes(testData, aes32Key);
        String decrypted = EncryptUtils.decryptByAes(encrypted, aes32Key);

        assertEquals(testData, decrypted);
    }

    @Test
    @DisplayName("测试AES无效密钥长度")
    void testAesInvalidKeyLength() {
        String invalidKey = TestDataBuilder.randomString(15);

        assertThrows(IllegalArgumentException.class, () -> {
            EncryptUtils.encryptByAes(testData, invalidKey);
        });
    }

    @Test
    @DisplayName("测试SM4国密加解密")
    void testSm4() {
        String encrypted = EncryptUtils.encryptBySm4(testData, sm4Key);
        String decrypted = EncryptUtils.decryptBySm4(encrypted, sm4Key);

        assertEquals(testData, decrypted);
    }

    @Test
    @DisplayName("测试RSA非对称加解密")
    void testRsa() {
        Map<String, String> keyPair = EncryptUtils.generateRsaKey();
        String publicKey = keyPair.get("publicKey");
        String privateKey = keyPair.get("privateKey");

        String encrypted = EncryptUtils.encryptByRsa(testData, publicKey);
        String decrypted = EncryptUtils.decryptByRsa(encrypted, privateKey);

        assertEquals(testData, decrypted);
    }

    @Test
    @DisplayName("测试MD5哈希")
    void testMd5() {
        String hash1 = EncryptUtils.encryptByMd5(testData);
        String hash2 = EncryptUtils.encryptByMd5(testData);

        assertNotNull(hash1);
        assertEquals(32, hash1.length());
        assertEquals(hash1, hash2); // 相同输入应产生相同哈希
    }

    @Test
    @DisplayName("测试SHA256哈希")
    void testSha256() {
        String hash = EncryptUtils.encryptBySha256(testData);

        assertNotNull(hash);
        assertEquals(64, hash.length());
    }
}
```

### 4. 集成测试

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
class SystemFeatureIntegrationTest extends BaseControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private SystemApiClient systemApiClient;

    @Test
    @DisplayName("测试获取系统配置")
    void testGetConfig() throws Exception {
        MvcResult result = performGet("/system/config/list");

        String content = result.getResponse().getContentAsString();
        R<?> response = fromJson(content, R.class);

        assertEquals(200, response.getCode());
        assertNotNull(response.getData());
    }

    @Test
    @DisplayName("测试用户登录流程")
    void testLoginFlow() throws Exception {
        // 准备登录参数
        LoginBody loginBody = new LoginBody();
        loginBody.setUsername("admin");
        loginBody.setPassword("admin123");

        // 执行登录
        MvcResult result = performPost("/auth/login", loginBody);

        // 验证响应
        String content = result.getResponse().getContentAsString();
        R<LoginVo> response = fromJson(content, new TypeReference<R<LoginVo>>() {});

        assertEquals(200, response.getCode());
        assertNotNull(response.getData().getToken());
    }

    @Test
    @DisplayName("测试完整的CRUD流程")
    void testCrudFlow() throws Exception {
        // 1. 创建
        DictTypeBo createBo = new DictTypeBo();
        createBo.setDictName("测试字典");
        createBo.setDictType("test_dict_" + TestDataBuilder.randomString(6));

        MvcResult createResult = performPost("/system/dict/type", createBo);
        R<Long> createResponse = fromJson(
            createResult.getResponse().getContentAsString(),
            new TypeReference<R<Long>>() {}
        );
        Long dictId = createResponse.getData();
        assertNotNull(dictId);

        // 2. 查询
        MvcResult getResult = performGet("/system/dict/type/" + dictId);
        R<DictTypeVo> getResponse = fromJson(
            getResult.getResponse().getContentAsString(),
            new TypeReference<R<DictTypeVo>>() {}
        );
        assertEquals(createBo.getDictName(), getResponse.getData().getDictName());

        // 3. 更新
        DictTypeBo updateBo = new DictTypeBo();
        updateBo.setDictId(dictId);
        updateBo.setDictName("更新后的字典名");

        performPut("/system/dict/type", updateBo);

        // 4. 验证更新
        MvcResult verifyResult = performGet("/system/dict/type/" + dictId);
        R<DictTypeVo> verifyResponse = fromJson(
            verifyResult.getResponse().getContentAsString(),
            new TypeReference<R<DictTypeVo>>() {}
        );
        assertEquals("更新后的字典名", verifyResponse.getData().getDictName());

        // 5. 删除
        performDelete("/system/dict/type/" + dictId);
    }
}
```

---

## Mock 技术

### Mockito 基础用法

```java
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class OrderServiceMockTest extends BaseTest {

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @BeforeEach
    void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("测试订单创建-Mock外部依赖")
    void testCreateOrderWithMock() {
        // 配置Mock行为
        when(userService.getUser(anyLong())).thenReturn(new UserVo());
        when(orderMapper.insert(any(Order.class))).thenReturn(1);

        // 执行测试
        OrderBo order = new OrderBo();
        order.setUserId(1L);
        Long result = orderService.add(order);

        // 验证结果
        assertNotNull(result);

        // 验证Mock调用
        verify(userService, times(1)).getUser(1L);
        verify(orderMapper, times(1)).insert(any(Order.class));
    }

    @Test
    @DisplayName("测试订单查询-Mock返回数据")
    void testGetOrderWithMock() {
        // 准备Mock数据
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderNo("TEST001");

        when(orderMapper.selectById(1L)).thenReturn(mockOrder);

        // 执行测试
        OrderVo result = orderService.get(1L);

        // 验证
        assertNotNull(result);
        assertEquals("TEST001", result.getOrderNo());
    }

    @Test
    @DisplayName("测试Mock异常场景")
    void testMockException() {
        // 配置抛出异常
        when(orderMapper.selectById(anyLong()))
            .thenThrow(new RuntimeException("数据库异常"));

        // 验证异常
        assertThrows(ServiceException.class, () -> {
            orderService.get(1L);
        });
    }
}
```

### @MockBean 注解

```java
@SpringBootTest
class OrderServiceSpringMockTest extends BaseServiceTest {

    @Autowired
    private OrderService orderService;

    @MockBean  // Spring管理的Mock Bean
    private ExternalPaymentService paymentService;

    @Test
    @DisplayName("测试订单支付-Mock外部支付服务")
    void testPayOrder() {
        // Mock外部支付服务
        when(paymentService.pay(any())).thenReturn(PayResult.success());

        // 执行测试
        boolean result = orderService.payOrder(1L);

        assertTrue(result);
        verify(paymentService).pay(any());
    }
}
```

---

## 参数化测试

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

class CalculatorTest extends BaseTest {

    @ParameterizedTest
    @DisplayName("测试加法运算")
    @CsvSource({
        "1, 1, 2",
        "2, 3, 5",
        "10, -5, 5",
        "0, 0, 0",
        "-1, -1, -2"
    })
    void testAdd(int a, int b, int expected) {
        assertEquals(expected, Calculator.add(a, b));
    }

    @ParameterizedTest
    @DisplayName("测试字符串验证")
    @ValueSource(strings = {"", "   ", "\t", "\n"})
    void testIsBlank(String input) {
        assertTrue(StringUtils.isBlank(input));
    }

    @ParameterizedTest
    @DisplayName("测试非空字符串")
    @ValueSource(strings = {"hello", "world", "test"})
    void testIsNotBlank(String input) {
        assertTrue(StringUtils.isNotBlank(input));
    }

    @ParameterizedTest
    @DisplayName("测试空值处理")
    @NullSource
    @EmptySource
    @NullAndEmptySource
    void testNullAndEmpty(String input) {
        assertTrue(StringUtils.isBlank(input));
    }

    @ParameterizedTest
    @DisplayName("测试枚举值")
    @EnumSource(OrderStatus.class)
    void testAllOrderStatus(OrderStatus status) {
        assertNotNull(status.getCode());
        assertNotNull(status.getDesc());
    }

    @ParameterizedTest
    @DisplayName("测试方法源")
    @MethodSource("provideOrderTestData")
    void testOrderValidation(OrderBo order, boolean expected) {
        assertEquals(expected, orderValidator.isValid(order));
    }

    static Stream<Arguments> provideOrderTestData() {
        return Stream.of(
            Arguments.of(createValidOrder(), true),
            Arguments.of(createInvalidOrder(), false),
            Arguments.of(null, false)
        );
    }
}
```

---

## Maven 测试配置

### pom.xml 配置

```xml
<!-- 测试依赖 -->
<dependencies>
    <!-- Spring Boot Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- 测试数据生成 -->
    <dependency>
        <groupId>com.github.javafaker</groupId>
        <artifactId>javafaker</artifactId>
        <version>1.0.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>

<!-- 测试插件配置 -->
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.5.3</version>
            <configuration>
                <argLine>-Dfile.encoding=UTF-8 -XX:+EnableDynamicAgentLoading</argLine>
                <!-- 执行@Tag注解标注的指定环境的测试 -->
                <groups>${profiles.active}</groups>
                <!-- 排除标签 -->
                <excludedGroups>exclude</excludedGroups>
                <!-- 并行执行 -->
                <parallel>methods</parallel>
                <threadCount>4</threadCount>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 测试执行命令

```bash
# 执行所有测试
mvn test

# 执行指定测试类
mvn test -Dtest=OrderServiceTest

# 执行指定测试方法
mvn test -Dtest=OrderServiceTest#testAdd

# 跳过测试
mvn package -DskipTests

# 执行带标签的测试
mvn test -Dgroups=dev

# 排除特定标签
mvn test -DexcludedGroups=slow

# 生成测试报告
mvn surefire-report:report
```

---

## 测试覆盖率

### JaCoCo 配置

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <id>prepare-agent</id>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.70</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### 生成覆盖率报告

```bash
# 生成覆盖率报告
mvn test jacoco:report

# 报告位置
target/site/jacoco/index.html
```

---

## 最佳实践

### 1. 测试独立性

```java
// 好的实践 - 每个测试独立运行
@Test
void testA() {
    // 测试A的数据准备和验证
}

@Test
void testB() {
    // 测试B的数据准备和验证,不依赖testA
}

// 坏的实践 - 测试之间有依赖
@Test
@Order(1)
void testCreateUser() {
    userId = userService.create(user);
}

@Test
@Order(2)
void testGetUser() {
    // 依赖testCreateUser的结果,这是不好的
    User user = userService.get(userId);
}
```

### 2. 测试命名清晰

```java
// 好的命名
@Test
@DisplayName("创建订单-商品库存不足时应抛出异常")
void testCreateOrder_WhenStockInsufficient_ShouldThrowException() { }

// 坏的命名
@Test
void test1() { }
```

### 3. 只测试一件事

```java
// 好的实践 - 一个测试验证一个行为
@Test
void testOrderAmountCalculation() {
    // 只验证金额计算
}

@Test
void testOrderStatusChange() {
    // 只验证状态变更
}

// 坏的实践 - 一个测试验证多个行为
@Test
void testOrderCreation() {
    // 验证创建
    // 验证金额计算
    // 验证状态
    // 验证通知发送
    // ...太多了
}
```

### 4. 使用有意义的测试数据

```java
// 好的实践 - 有业务含义的数据
OrderBo order = new OrderBo();
order.setOrderNo("ORD-2024-001");
order.setTotalAmount(new BigDecimal("999.00"));

// 坏的实践 - 无意义的数据
OrderBo order = new OrderBo();
order.setOrderNo("aaa");
order.setTotalAmount(new BigDecimal("1"));
```

### 5. 清理测试数据

```java
// 好的实践 - 使用事务回滚
@Transactional
@Rollback
class OrderServiceTest { }

// 或手动清理
@AfterEach
void cleanup() {
    orderRepository.deleteAll();
}
```

---

## 常见问题

### 1. 测试数据库污染

**问题:** 测试后数据库中残留测试数据

**解决方案:**

```java
// 方案1: 使用@Transactional自动回滚
@SpringBootTest
@Transactional
@Rollback
class MyServiceTest { }

// 方案2: 使用@AfterEach清理
@AfterEach
void cleanup() {
    jdbcTemplate.execute("DELETE FROM orders WHERE remark LIKE '%测试%'");
}

// 方案3: 使用内存数据库
spring.datasource.url=jdbc:h2:mem:testdb
```

### 2. 测试执行慢

**问题:** 集成测试启动Spring容器慢

**解决方案:**

```java
// 方案1: 使用@MockBean减少真实Bean
@MockBean
private HeavyService heavyService;

// 方案2: 使用切片测试
@WebMvcTest(OrderController.class)  // 只加载Web层
@DataJpaTest  // 只加载数据层

// 方案3: 共享测试上下文
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
```

### 3. Mock不生效

**问题:** @Mock或@MockBean不生效

**解决方案:**

```java
// 方案1: 初始化Mockito
@BeforeEach
void initMocks() {
    MockitoAnnotations.openMocks(this);
}

// 方案2: 使用@ExtendWith
@ExtendWith(MockitoExtension.class)
class MyTest { }

// 方案3: 检查注入方式
@InjectMocks  // 确保使用InjectMocks
private OrderService orderService;
```

### 4. 异步测试问题

**问题:** 异步方法测试不稳定

**解决方案:**

```java
// 方案1: 使用Awaitility
import static org.awaitility.Awaitility.*;

@Test
void testAsyncOperation() {
    service.asyncProcess();

    await().atMost(5, TimeUnit.SECONDS)
           .until(() -> service.isProcessed());
}

// 方案2: 使用CountDownLatch
@Test
void testAsync() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);

    service.asyncProcess(() -> latch.countDown());

    assertTrue(latch.await(5, TimeUnit.SECONDS));
}
```

---

## 总结

单元测试是保障代码质量的重要手段。通过本文档介绍的最佳实践:

1. **分层测试** - BaseTest、BaseServiceTest、BaseControllerTest 三层架构
2. **数据生成** - TestDataBuilder 提供 50+ 种随机数据生成方法
3. **规范编写** - AAA 模式、清晰命名、独立测试
4. **Mock技术** - Mockito 隔离外部依赖
5. **参数化测试** - 提高测试覆盖率
6. **覆盖率监控** - JaCoCo 确保代码质量

建议在实际开发中:
- 新功能开发同步编写测试
- 修复Bug时补充回归测试
- 定期检查测试覆盖率
- 持续集成中必须通过测试
