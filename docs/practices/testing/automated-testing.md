# 自动化测试最佳实践

本文档详细介绍 RuoYi-Plus-UniApp 项目的自动化测试体系,包括测试框架、测试策略、测试编写规范和持续集成实践。

## 介绍

自动化测试是保障代码质量、提升开发效率、降低维护成本的重要手段。RuoYi-Plus-UniApp 项目构建了完善的自动化测试体系,涵盖单元测试、集成测试、性能测试等多个维度,确保系统的稳定性和可靠性。

**核心特性:**

- **分层测试体系** - 提供 BaseTest、BaseServiceTest、BaseControllerTest 三层测试基类,支持不同粒度的测试需求
- **自动事务回滚** - Service 层测试自动回滚事务,避免污染测试数据库
- **性能监控机制** - 内置测试执行时间监控,自动识别性能瓶颈
- **测试数据构造器** - 基于 JavaFaker 提供丰富的测试数据生成工具
- **MockMvc 支持** - Controller 测试支持 HTTP 接口模拟调用
- **Forest 客户端集成** - 集成测试支持真实 HTTP 调用
- **JUnit 5 测试框架** - 使用最新的 JUnit 5 框架,支持参数化测试、动态测试等特性

## 测试框架架构

### 技术栈

RuoYi-Plus-UniApp 项目使用以下测试技术栈:

| 技术 | 版本 | 用途 |
|------|------|------|
| JUnit 5 | 5.10+ | 测试框架核心,提供测试生命周期管理 |
| Spring Boot Test | 3.5.6 | Spring 应用测试支持,提供上下文加载 |
| Mockito | 5.7+ | Mock 框架,用于模拟外部依赖 |
| AssertJ | 3.24+ | 断言库,提供流式断言API |
| JavaFaker | 1.0.2 | 测试数据生成器,生成随机测试数据 |
| Hutool | 5.8.40 | 工具库,提供 StopWatch 等测试辅助工具 |
| MockMvc | - | Spring MVC 测试支持,模拟 HTTP 请求 |
| Forest | 1.6.9 | HTTP 客户端,用于集成测试真实调用 |

### 模块结构

测试相关代码组织在 `ruoyi-common-test` 模块中:

```
ruoyi-common-test/
├── pom.xml                          # 测试依赖配置
└── src/main/java/
    └── plus/ruoyi/common/test/
        ├── base/
        │   ├── BaseTest.java        # 测试基类(提供性能监控)
        │   ├── BaseServiceTest.java # Service测试基类(事务回滚)
        │   ├── BaseControllerTest.java # Controller测试基类(MockMvc)
        │   └── TestDataBuilder.java # 测试数据构造器
        └── config/
            └── TestConfig.java      # 测试配置类(目录管理)
```

### 依赖配置

`ruoyi-common-test/pom.xml` 配置示例:

```xml
<dependencies>
    <!-- Spring Boot 测试框架 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <exclusions>
            <!-- 排除JUnit4,使用JUnit5 -->
            <exclusion>
                <groupId>org.junit.vintage</groupId>
                <artifactId>junit-vintage-engine</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <!-- Spring 事务支持 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-tx</artifactId>
    </dependency>

    <!-- JavaFaker - 测试数据生成 -->
    <dependency>
        <groupId>com.github.javafaker</groupId>
        <artifactId>javafaker</artifactId>
        <version>1.0.2</version>
    </dependency>

    <!-- 核心模块依赖 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-http</artifactId>
    </dependency>

    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-web</artifactId>
    </dependency>
</dependencies>
```

**说明:**
- `spring-boot-starter-test` 包含了 JUnit 5、Mockito、AssertJ 等核心测试库
- 排除了 `junit-vintage-engine` 避免 JUnit 4 和 JUnit 5 冲突
- `javafaker` 用于生成随机测试数据

## 测试基类体系

### BaseTest 基础测试类

`BaseTest` 是所有测试类的基类,提供 Spring 上下文支持和性能监控功能。

**核心实现:**

```java
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
     * 测试方法执行前
     * 自动启动计时器、初始化测试目录并调用setUp()
     */
    @BeforeEach
    public final void baseBeforeEach(TestInfo testInfo) {
        // 初始化测试目录
        TestConfig.initTestDirs();

        if (isPerformanceMonitorEnabled()) {
            StopWatch stopWatch = new StopWatch(testInfo.getDisplayName());
            stopWatch.start();
            stopWatchHolder.set(stopWatch);
        }
        setUp();
    }

    /**
     * 测试方法执行后
     * 自动记录执行时间、清理测试文件并调用tearDown()
     */
    @AfterEach
    public final void baseAfterEach(TestInfo testInfo) {
        tearDown();

        // 清理测试临时文件
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

    /**
     * 测试前置处理
     * 子类可重写此方法实现自定义初始化逻辑
     */
    protected void setUp() {
        // 子类可重写
    }

    /**
     * 测试后置处理
     * 子类可重写此方法实现自定义清理逻辑
     */
    protected void tearDown() {
        // 子类可重写
    }
}
```

**使用示例:**

```java
@SpringBootTest
public class MyServiceTest extends BaseTest {

    @Autowired
    private MyService myService;

    @Test
    public void testMethod() {
        // 测试逻辑
        // 执行完成后会自动输出: testMethod 执行完成,耗时: 125ms
    }

    // 自定义性能阈值
    @Override
    protected long getPerformanceThreshold() {
        return 5000L; // 5秒
    }
}
```

**特性说明:**
- 自动记录每个测试方法的执行时间
- 超过性能阈值时输出警告日志
- 自动初始化和清理测试临时目录
- 提供 `setUp()` 和 `tearDown()` 扩展点

### BaseServiceTest Service层测试基类

`BaseServiceTest` 继承自 `BaseTest`,专门用于 Service 层测试,提供自动事务回滚功能。

**核心实现:**

```java
@SpringBootTest
@Transactional // 测试方法执行后自动回滚
public abstract class BaseServiceTest extends BaseTest {

    /**
     * 每个测试方法执行前调用
     */
    @BeforeEach
    public void baseSetUp() {
        setUp();
    }
}
```

**使用示例:**

```java
public class UserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    public void testAddUser() {
        UserBo user = new UserBo();
        user.setUserName("test");
        user.setNickName("测试用户");

        // 执行业务逻辑
        Long userId = userService.add(user);

        // 断言
        assertNotNull(userId);
        assertTrue(userId > 0);

        // 测试结束后自动回滚,数据不会真正保存
    }

    @Test
    public void testUpdateUser() {
        // 先插入测试数据
        UserBo user = createTestUser();
        Long userId = userService.add(user);

        // 修改数据
        user.setId(userId);
        user.setNickName("修改后的昵称");
        boolean result = userService.update(user);

        // 断言
        assertTrue(result);

        // 验证修改是否生效
        UserVo updatedUser = userService.get(userId);
        assertEquals("修改后的昵称", updatedUser.getNickName());
    }
}
```

**特性说明:**
- 测试方法执行后自动回滚事务,不污染数据库
- 可以进行真实数据库操作测试
- 支持 Mock 外部依赖

### BaseControllerTest Controller层测试基类

`BaseControllerTest` 继承自 `BaseTest`,提供 MockMvc 支持,用于测试 Controller 层接口。

**核心实现:**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public abstract class BaseControllerTest extends BaseTest {

    @LocalServerPort  // 获取随机端口
    private int port;

    @Autowired
    protected ForestConfiguration forestConfiguration;

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * 每个测试方法执行前调用
     */
    @BeforeEach
    public void baseSetUp() {
        setUp();
        // 动态设置 baseURL
        String baseUrl = "http://127.0.0.1:" + port;
        forestConfiguration.setVariable("baseUrl", baseUrl);
    }

    /**
     * 执行GET请求
     */
    protected ResultActions performGet(String url) throws Exception {
        return mockMvc.perform(get(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON));
    }

    /**
     * 执行POST请求
     */
    protected ResultActions performPost(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)));
    }

    /**
     * 执行PUT请求
     */
    protected ResultActions performPut(String url, Object body) throws Exception {
        return mockMvc.perform(put(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)));
    }

    /**
     * 执行DELETE请求
     */
    protected ResultActions performDelete(String url) throws Exception {
        return mockMvc.perform(delete(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON));
    }

    /**
     * 将对象转换为JSON字符串
     */
    protected String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    /**
     * 将JSON字符串转换为对象
     */
    protected <T> T fromJson(String json, Class<T> clazz) throws Exception {
        return objectMapper.readValue(json, clazz);
    }
}
```

**使用示例:**

```java
@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest extends BaseControllerTest {

    @MockitoBean  // Spring Boot 3.4.0+ 使用 @MockitoBean 替代 @MockBean
    private ISysUserService userService;

    @Test
    public void testGetUser() throws Exception {
        // Mock数据
        when(userService.getUserById(1L)).thenReturn(mockUser);

        // GET请求
        performGet("/system/user/1")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));

        // POST请求
        UserBo user = new UserBo();
        user.setUserName("test");
        performPost("/system/user", user)
            .andExpect(status().isOk());
    }
}
```

**特性说明:**
- 使用随机端口启动测试服务器,避免端口冲突
- 提供 `performGet/Post/Put/Delete` 封装方法
- 支持 JSON 序列化/反序列化
- 支持 Forest 客户端动态配置

### TestConfig 测试配置类

`TestConfig` 统一管理测试相关的配置,避免硬编码路径。

**核心实现:**

```java
public class TestConfig {

    /**
     * 测试临时文件根目录
     * 所有测试生成的临时文件都应该放在这个目录下
     */
    @Getter
    private static final String TEST_TEMP_DIR =
        System.getProperty("java.io.tmpdir") + File.separator + "ruoyi-test";

    /**
     * 测试资源目录
     */
    @Getter
    private static final String TEST_RESOURCE_DIR = "src/test/resources";

    /**
     * 测试输出目录
     */
    @Getter
    private static final String TEST_OUTPUT_DIR =
        TEST_TEMP_DIR + File.separator + "output";

    /**
     * 测试上传目录
     */
    @Getter
    private static final String TEST_UPLOAD_DIR =
        TEST_TEMP_DIR + File.separator + "upload";

    /**
     * 初始化测试目录
     */
    public static void initTestDirs() {
        FileUtil.mkdir(TEST_TEMP_DIR);
        FileUtil.mkdir(TEST_OUTPUT_DIR);
        FileUtil.mkdir(TEST_UPLOAD_DIR);
    }

    /**
     * 清理测试目录
     */
    public static void cleanTestDirs() {
        if (FileUtil.exist(TEST_TEMP_DIR)) {
            FileUtil.del(TEST_TEMP_DIR);
        }
    }

    /**
     * 获取测试临时文件路径
     */
    public static String getTempFilePath(String fileName) {
        return TEST_TEMP_DIR + File.separator + fileName;
    }

    /**
     * 创建测试子目录
     */
    public static String createTestSubDir(String subDir) {
        String subDirPath = TEST_TEMP_DIR + File.separator + subDir;
        FileUtil.mkdir(subDirPath);
        return subDirPath;
    }
}
```

**使用示例:**

```java
@Test
public void testFileUpload() {
    // 获取测试上传文件路径
    String filePath = TestConfig.getUploadFilePath("test.jpg");

    // 创建测试文件
    File file = new File(filePath);
    // ... 文件操作

    // 测试结束后会自动清理
}
```

### TestDataBuilder 测试数据构造器

`TestDataBuilder` 基于 JavaFaker 提供丰富的测试数据生成工具。

**核心实现:**

```java
public class TestDataBuilder {

    private static final Faker FAKER = new Faker(Locale.CHINA);
    private static final Random RANDOM = new Random();

    /**
     * 生成随机用户名
     */
    public static String randomUserName() {
        return FAKER.name().username();
    }

    /**
     * 生成随机中文姓名
     */
    public static String randomChineseName() {
        return FAKER.name().lastName() + FAKER.name().firstName();
    }

    /**
     * 生成随机手机号(11位)
     * 格式: 1[3-9]xxxxxxxxx
     */
    public static String randomPhone() {
        return "1" + (3 + RANDOM.nextInt(7))
            + String.format("%09d", RANDOM.nextInt(1_000_000_000));
    }

    /**
     * 生成随机邮箱
     */
    public static String randomEmail() {
        return FAKER.internet().emailAddress();
    }

    /**
     * 生成随机密码
     */
    public static String randomPassword() {
        return FAKER.internet().password(8, 16, true, true);
    }

    /**
     * 生成随机地址
     */
    public static String randomAddress() {
        return FAKER.address().fullAddress();
    }

    /**
     * 生成随机日期时间
     */
    public static LocalDateTime randomDateTime() {
        Date date = FAKER.date().past(365, TimeUnit.DAYS);
        return LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
    }

    /**
     * 从数组中随机选择一个元素
     */
    @SafeVarargs
    public static <T> T randomChoice(T... items) {
        if (items == null || items.length == 0) {
            return null;
        }
        return items[RANDOM.nextInt(items.length)];
    }

    /**
     * 生成随机列表
     */
    public static <T> List<T> randomList(int size,
                                          java.util.function.Supplier<T> generator) {
        List<T> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            list.add(generator.get());
        }
        return list;
    }

    /**
     * 生成随机ID
     */
    public static Long randomId() {
        return randomLong(1L, 1000000L);
    }
}
```

**使用示例:**

```java
@Test
public void testAddUser() {
    // 生成随机测试数据
    UserBo user = new UserBo();
    user.setUserName(TestDataBuilder.randomUserName());
    user.setNickName(TestDataBuilder.randomChineseName());
    user.setPhone(TestDataBuilder.randomPhone());
    user.setEmail(TestDataBuilder.randomEmail());

    // 执行测试
    Long userId = userService.add(user);
    assertNotNull(userId);
}

@Test
public void testBatchInsert() {
    // 生成随机列表
    List<String> userNames = TestDataBuilder.randomList(
        10,
        TestDataBuilder::randomUserName
    );

    // 批量插入
    userNames.forEach(name -> {
        UserBo user = new UserBo();
        user.setUserName(name);
        userService.add(user);
    });
}
```

**可用方法列表:**

| 方法 | 说明 | 示例结果 |
|------|------|----------|
| `randomUserName()` | 生成随机用户名 | `john.smith123` |
| `randomChineseName()` | 生成随机中文姓名 | `张伟` |
| `randomPhone()` | 生成随机手机号 | `13812345678` |
| `randomEmail()` | 生成随机邮箱 | `test@example.com` |
| `randomPassword()` | 生成随机密码 | `Ab#12345` |
| `randomAddress()` | 生成随机地址 | `北京市朝阳区xx街道` |
| `randomCompany()` | 生成随机公司名 | `阿里巴巴集团` |
| `randomUrl()` | 生成随机URL | `https://example.com` |
| `randomIp()` | 生成随机IP | `192.168.1.100` |
| `randomString(length)` | 生成随机字符串 | `abc123xyz` |
| `randomInt(min, max)` | 生成随机整数 | `42` |
| `randomLong(min, max)` | 生成随机Long | `1234567890L` |
| `randomBoolean()` | 生成随机布尔值 | `true` |
| `randomDateTime()` | 生成随机日期时间 | `2024-01-15 10:30:00` |
| `randomChoice(items)` | 从数组中随机选择 | - |
| `randomList(size, generator)` | 生成随机列表 | - |
| `randomId()` | 生成随机ID | `123456L` |
| `randomStatus()` | 生成随机状态(0或1) | `"1"` |

## 单元测试实践

### JUnit 5 注解说明

RuoYi-Plus-UniApp 项目使用 JUnit 5 测试框架,以下是常用注解说明:

| 注解 | 说明 | 使用场景 |
|------|------|----------|
| `@Test` | 标记测试方法 | 所有测试方法必须添加此注解 |
| `@DisplayName` | 设置测试显示名称 | 提供可读性强的测试描述 |
| `@BeforeEach` | 每个测试方法执行前调用 | 初始化测试数据 |
| `@AfterEach` | 每个测试方法执行后调用 | 清理测试资源 |
| `@BeforeAll` | 所有测试方法执行前调用一次 | 初始化共享资源(静态方法) |
| `@AfterAll` | 所有测试方法执行后调用一次 | 清理共享资源(静态方法) |
| `@Disabled` | 禁用测试方法 | 临时跳过某个测试 |
| `@Timeout` | 设置测试超时时间 | 防止测试长时间阻塞 |
| `@RepeatedTest` | 重复执行测试 | 测试稳定性和随机性 |
| `@ParameterizedTest` | 参数化测试 | 使用不同参数执行同一测试 |
| `@Tag` | 测试标签 | 用于分组和过滤测试 |
| `@Order` | 指定测试执行顺序 | 有依赖关系的测试 |

**完整示例:**

```java
@SpringBootTest
@DisplayName("单元测试案例")
public class DemoUnitTest {

    @Autowired
    private CaptchaProperties captchaProperties;

    @DisplayName("测试 @Test 和 @DisplayName 注解")
    @Test
    public void testTest() {
        System.out.println(captchaProperties);
    }

    @Disabled
    @DisplayName("测试 @Disabled 注解")
    @Test
    public void testDisabled() {
        System.out.println(captchaProperties);
    }

    @Timeout(value = 2L, unit = TimeUnit.SECONDS)
    @DisplayName("测试 @Timeout 注解")
    @Test
    public void testTimeout() throws InterruptedException {
        Thread.sleep(1000);
        System.out.println(captchaProperties);
    }

    @DisplayName("测试 @RepeatedTest 注解")
    @RepeatedTest(3)
    public void testRepeatedTest() {
        System.out.println(666);
    }

    @BeforeAll
    public static void testBeforeAll() {
        System.out.println("@BeforeAll ==================");
    }

    @BeforeEach
    public void testBeforeEach() {
        System.out.println("@BeforeEach ==================");
    }

    @AfterEach
    public void testAfterEach() {
        System.out.println("@AfterEach ==================");
    }

    @AfterAll
    public static void testAfterAll() {
        System.out.println("@AfterAll ==================");
    }
}
```

### 断言方法

JUnit 5 提供了丰富的断言方法,配合 AssertJ 可以实现更强大的断言能力。

**JUnit 5 基础断言:**

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
public void testAssertions() {
    // 相等断言
    assertEquals(expected, actual);
    assertEquals(expected, actual, "错误消息");

    // 不相等断言
    assertNotEquals(unexpected, actual);

    // null 断言
    assertNull(object);
    assertNotNull(object);

    // 布尔断言
    assertTrue(condition);
    assertFalse(condition);

    // 数组断言
    assertArrayEquals(expectedArray, actualArray);

    // 异常断言
    assertThrows(IllegalArgumentException.class, () -> {
        // 应该抛出异常的代码
    });

    // 超时断言
    assertTimeout(Duration.ofSeconds(1), () -> {
        // 应该在1秒内完成的代码
    });

    // 组合断言(所有断言都执行,收集所有失败信息)
    assertAll("用户信息",
        () -> assertEquals("张三", user.getName()),
        () -> assertEquals(25, user.getAge()),
        () -> assertNotNull(user.getEmail())
    );
}
```

**AssertJ 流式断言:**

```java
import static org.assertj.core.api.Assertions.*;

@Test
public void testAssertJ() {
    // 字符串断言
    assertThat(str)
        .isNotNull()
        .isNotEmpty()
        .startsWith("Hello")
        .endsWith("World")
        .contains("test");

    // 数字断言
    assertThat(number)
        .isPositive()
        .isGreaterThan(0)
        .isLessThanOrEqualTo(100)
        .isBetween(1, 100);

    // 集合断言
    assertThat(list)
        .isNotEmpty()
        .hasSize(5)
        .contains("item1", "item2")
        .doesNotContainNull()
        .allMatch(item -> item.length() > 0);

    // 对象断言
    assertThat(user)
        .isNotNull()
        .extracting("name", "age")
        .containsExactly("张三", 25);

    // 异常断言
    assertThatThrownBy(() -> service.throwException())
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("参数错误")
        .hasMessageContaining("参数");
}
```

### Service 层测试示例

**用户服务测试:**

```java
@SpringBootTest
@DisplayName("用户服务测试")
public class SysUserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试查询用户信息")
    public void testGetUserInfo() {
        // 查询用户ID为1的用户
        SysUserVo user = userService.selectUserById(1L);

        // 断言
        assertThat(user)
            .isNotNull()
            .extracting("userId", "userName")
            .doesNotContainNull();

        log.info("查询用户成功: {}", user.getUserName());
    }

    @Test
    @DisplayName("测试添加用户")
    public void testAddUser() {
        // 构造测试数据
        SysUserBo user = new SysUserBo();
        user.setUserName(TestDataBuilder.randomUserName());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setDeptId(100L);

        // 执行插入
        Long userId = userService.insertUser(user);

        // 断言
        assertThat(userId).isNotNull().isPositive();

        // 验证数据
        SysUserVo savedUser = userService.selectUserById(userId);
        assertThat(savedUser)
            .isNotNull()
            .extracting("userName", "nickName")
            .containsExactly(user.getUserName(), user.getNickName());

        // 测试结束后自动回滚,数据不会真正保存
    }

    @Test
    @DisplayName("测试更新用户")
    public void testUpdateUser() {
        // 先插入测试数据
        SysUserBo user = createTestUser();
        Long userId = userService.insertUser(user);

        // 修改用户信息
        user.setUserId(userId);
        user.setNickName("修改后的昵称");
        int result = userService.updateUser(user);

        // 断言更新成功
        assertThat(result).isEqualTo(1);

        // 验证修改是否生效
        SysUserVo updatedUser = userService.selectUserById(userId);
        assertThat(updatedUser.getNickName()).isEqualTo("修改后的昵称");
    }

    @Test
    @DisplayName("测试删除用户")
    public void testDeleteUser() {
        // 先插入测试数据
        SysUserBo user = createTestUser();
        Long userId = userService.insertUser(user);

        // 删除用户
        int result = userService.deleteUserById(userId);

        // 断言删除成功
        assertThat(result).isEqualTo(1);

        // 验证用户已删除
        SysUserVo deletedUser = userService.selectUserById(userId);
        assertThat(deletedUser).isNull();
    }

    @Test
    @DisplayName("测试参数校验")
    public void testValidation() {
        // 测试用户名为空的情况
        SysUserBo user = new SysUserBo();
        user.setNickName("测试");
        user.setDeptId(100L);

        // 断言抛出异常
        assertThatThrownBy(() -> userService.insertUser(user))
            .isInstanceOf(ServiceException.class)
            .hasMessageContaining("用户名不能为空");
    }

    /**
     * 创建测试用户
     */
    private SysUserBo createTestUser() {
        SysUserBo user = new SysUserBo();
        user.setUserName(TestDataBuilder.randomUserName());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setDeptId(100L);
        return user;
    }
}
```

**字典服务测试:**

```java
@SpringBootTest
@DisplayName("字典数据服务测试")
public class SysDictDataServiceTest extends BaseServiceTest {

    @Autowired
    private ISysDictDataService dictDataService;

    @Test
    @DisplayName("测试根据类型查询字典数据")
    public void testSelectDictDataByType() {
        // 查询系统状态字典
        List<SysDictDataVo> dictList =
            dictDataService.selectDictDataByType("sys_normal_disable");

        // 断言
        assertThat(dictList)
            .isNotEmpty()
            .hasSizeGreaterThanOrEqualTo(2)
            .allMatch(dict -> dict.getDictType().equals("sys_normal_disable"));

        log.info("查询字典数据成功,数量: {}", dictList.size());
    }

    @Test
    @DisplayName("测试添加字典数据")
    public void testInsertDictData() {
        // 构造测试数据
        SysDictDataBo dictData = new SysDictDataBo();
        dictData.setDictType("test_type");
        dictData.setDictLabel("测试标签");
        dictData.setDictValue("test_value");
        dictData.setDictSort(1);

        // 执行插入
        int result = dictDataService.insertDictData(dictData);

        // 断言
        assertThat(result).isEqualTo(1);
        assertThat(dictData.getDictCode()).isNotNull();

        // 验证数据
        List<SysDictDataVo> dictList =
            dictDataService.selectDictDataByType("test_type");
        assertThat(dictList)
            .isNotEmpty()
            .anyMatch(dict -> dict.getDictLabel().equals("测试标签"));
    }
}
```

### Controller 层测试示例

**用户控制器测试:**

```java
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("用户控制器测试")
public class SysUserControllerTest extends BaseControllerTest {

    @MockitoBean
    private ISysUserService userService;

    @Test
    @DisplayName("测试获取用户信息")
    public void testGetUser() throws Exception {
        // Mock 数据
        SysUserVo user = new SysUserVo();
        user.setUserId(1L);
        user.setUserName("admin");
        user.setNickName("管理员");

        when(userService.selectUserById(1L)).thenReturn(user);

        // 执行 GET 请求
        performGet("/system/user/1")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.userName").value("admin"))
            .andExpect(jsonPath("$.data.nickName").value("管理员"));

        // 验证 Service 方法被调用
        verify(userService, times(1)).selectUserById(1L);
    }

    @Test
    @DisplayName("测试添加用户")
    public void testAddUser() throws Exception {
        // 构造请求数据
        SysUserBo user = new SysUserBo();
        user.setUserName("testuser");
        user.setNickName("测试用户");
        user.setDeptId(100L);

        // Mock Service 返回
        when(userService.insertUser(any(SysUserBo.class))).thenReturn(1L);

        // 执行 POST 请求
        performPost("/system/user", user)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));

        // 验证 Service 方法被调用
        verify(userService, times(1)).insertUser(any(SysUserBo.class));
    }

    @Test
    @DisplayName("测试更新用户")
    public void testUpdateUser() throws Exception {
        // 构造请求数据
        SysUserBo user = new SysUserBo();
        user.setUserId(1L);
        user.setNickName("更新后的昵称");

        // Mock Service 返回
        when(userService.updateUser(any(SysUserBo.class))).thenReturn(1);

        // 执行 PUT 请求
        performPut("/system/user", user)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("测试删除用户")
    public void testDeleteUser() throws Exception {
        // Mock Service 返回
        when(userService.deleteUserById(1L)).thenReturn(1);

        // 执行 DELETE 请求
        performDelete("/system/user/1")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));

        // 验证 Service 方法被调用
        verify(userService, times(1)).deleteUserById(1L);
    }

    @Test
    @DisplayName("测试参数校验")
    public void testValidation() throws Exception {
        // 构造非法请求数据(缺少必填字段)
        SysUserBo user = new SysUserBo();
        user.setNickName("测试");

        // 执行 POST 请求,应该返回参数校验错误
        performPost("/system/user", user)
            .andExpect(status().isBadRequest());
    }
}
```

## 集成测试实践

集成测试用于测试多个组件协同工作的场景,通常涉及真实的数据库、HTTP 调用等。

### 业务接口集成测试

**首页接口集成测试示例:**

```java
@Slf4j
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("首页接口集成测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class HomeIntegrationTest extends BaseControllerTest {

    @Autowired
    private BusinessApiClient apiClient;

    @Test
    @Order(1)
    @DisplayName("测试根据appid获取租户标识")
    public void testGetTenantIdByAppid() {
        log.info("测试根据appid获取租户标识");

        // 使用测试appid (注意: 需要在b_platform表中配置)
        String testAppid = "test_appid_123";
        ForestResponse<R<String>> response =
            apiClient.getTenantIdByAppid(testAppid);

        // 验证HTTP响应
        assertTrue(response.isSuccess());
        R<String> result = response.getResult();
        assertNotNull(result);

        // 注意: 如果platform表中没有该appid配置,会返回失败
        if (result.getCode() == 200) {
            assertNotNull(result.getData());
            log.info("查询成功: tenantId={}", result.getData());
        } else {
            log.warn("平台配置不存在: {}", result.getMsg());
        }
    }

    @Test
    @Order(2)
    @DisplayName("测试查询广告列表")
    public void testListAds() {
        log.info("测试查询广告列表");

        // 查询所有广告 (不指定position)
        ForestResponse<R<List<Object>>> response = apiClient.listAds(null);

        // 验证响应
        assertTrue(response.isSuccess());
        R<List<Object>> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证数据
        List<Object> ads = result.getData();
        assertNotNull(ads, "广告列表不应为null");

        log.info("查询成功: 广告数量={}", ads.size());
    }

    @Test
    @Order(3)
    @DisplayName("测试按位置查询广告")
    public void testListAdsByPosition() {
        log.info("测试按位置查询广告");

        // 查询首页广告位的广告
        ForestResponse<R<List<Object>>> response = apiClient.listAds("home");

        // 验证响应
        assertTrue(response.isSuccess());
        R<List<Object>> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        log.info("查询成功: 首页广告数量={}",
            result.getData() != null ? result.getData().size() : 0);
    }

    @Test
    @Order(4)
    @DisplayName("测试分页查询商品")
    public void testPageGoods() {
        log.info("测试分页查询商品");

        // 查询第1页,每页10条
        ForestResponse<R<PageResult<Object>>> response =
            apiClient.pageGoods(1, 10);

        // 验证响应
        assertTrue(response.isSuccess());
        R<PageResult<Object>> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证分页数据
        PageResult<Object> pageResult = result.getData();
        assertNotNull(pageResult);
        assertTrue(pageResult.getTotal() >= 0);

        log.info("查询成功: 总记录数={}, 当前页记录数={}",
            pageResult.getTotal(),
            pageResult.getRecords() != null ?
                pageResult.getRecords().size() : 0);
    }

    @AfterAll
    public static void afterAll() {
        log.info("========== 首页接口测试结束 ==========");
    }
}
```

**系统功能集成测试示例:**

```java
@Slf4j
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("系统功能集成测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SystemFeatureIntegrationTest extends BaseControllerTest {

    @Autowired
    private SystemApiClient apiClient;

    @Test
    @Order(1)
    @DisplayName("测试用户登录")
    public void testLogin() {
        log.info("测试用户登录");

        // 构造登录请求
        LoginBo loginBo = new LoginBo();
        loginBo.setUsername("admin");
        loginBo.setPassword("admin123");

        // 执行登录
        ForestResponse<R<LoginVo>> response = apiClient.login(loginBo);

        // 验证响应
        assertTrue(response.isSuccess());
        R<LoginVo> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证 Token
        LoginVo loginVo = result.getData();
        assertNotNull(loginVo.getAccessToken());
        assertThat(loginVo.getAccessToken()).isNotEmpty();

        log.info("登录成功,Token: {}", loginVo.getAccessToken());
    }

    @Test
    @Order(2)
    @DisplayName("测试获取用户信息")
    public void testGetUserInfo() {
        log.info("测试获取用户信息");

        // 先登录获取 Token
        LoginBo loginBo = new LoginBo();
        loginBo.setUsername("admin");
        loginBo.setPassword("admin123");
        ForestResponse<R<LoginVo>> loginResponse = apiClient.login(loginBo);
        String token = loginResponse.getResult().getData().getAccessToken();

        // 获取用户信息
        ForestResponse<R<UserInfoVo>> response =
            apiClient.getUserInfo(token);

        // 验证响应
        assertTrue(response.isSuccess());
        R<UserInfoVo> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证用户信息
        UserInfoVo userInfo = result.getData();
        assertNotNull(userInfo);
        assertThat(userInfo.getUserName()).isEqualTo("admin");

        log.info("获取用户信息成功: {}", userInfo.getUserName());
    }

    @Test
    @Order(3)
    @DisplayName("测试用户权限")
    public void testUserPermissions() {
        log.info("测试用户权限");

        // 先登录
        LoginBo loginBo = new LoginBo();
        loginBo.setUsername("admin");
        loginBo.setPassword("admin123");
        ForestResponse<R<LoginVo>> loginResponse = apiClient.login(loginBo);
        String token = loginResponse.getResult().getData().getAccessToken();

        // 获取用户权限
        ForestResponse<R<Set<String>>> response =
            apiClient.getUserPermissions(token);

        // 验证响应
        assertTrue(response.isSuccess());
        R<Set<String>> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证权限
        Set<String> permissions = result.getData();
        assertNotNull(permissions);
        assertThat(permissions).isNotEmpty();
        assertThat(permissions).contains("*:*:*"); // 超级管理员权限

        log.info("获取用户权限成功,权限数量: {}", permissions.size());
    }
}
```

### 缓存集成测试

**Redis 缓存测试示例:**

```java
@Slf4j
@SpringBootTest
@DisplayName("缓存集成测试")
public class CacheIntegrationTest extends BaseTest {

    @Autowired
    private RedisUtils redisUtils;

    @Autowired
    private ISysConfigService configService;

    @Test
    @DisplayName("测试缓存设置和获取")
    public void testCacheSetAndGet() {
        String key = "test:cache:key";
        String value = "test_value";

        // 设置缓存
        redisUtils.setCacheObject(key, value);

        // 获取缓存
        String cachedValue = redisUtils.getCacheObject(key);

        // 断言
        assertThat(cachedValue).isEqualTo(value);

        // 清理缓存
        redisUtils.deleteObject(key);
    }

    @Test
    @DisplayName("测试缓存过期时间")
    public void testCacheExpire() throws InterruptedException {
        String key = "test:cache:expire";
        String value = "test_value";
        long ttl = 2L; // 2秒过期

        // 设置缓存(带过期时间)
        redisUtils.setCacheObject(key, value, ttl, TimeUnit.SECONDS);

        // 立即获取,应该存在
        String cachedValue1 = redisUtils.getCacheObject(key);
        assertThat(cachedValue1).isEqualTo(value);

        // 等待3秒后获取,应该已过期
        Thread.sleep(3000);
        String cachedValue2 = redisUtils.getCacheObject(key);
        assertThat(cachedValue2).isNull();
    }

    @Test
    @DisplayName("测试配置缓存")
    public void testConfigCache() {
        String configKey = "sys.test.config";
        String configValue = "test_value";

        // 先清理缓存
        redisUtils.deleteObject(CacheConstants.SYS_CONFIG_KEY + configKey);

        // 查询配置(会自动缓存)
        String value1 = configService.selectConfigByKey(configKey);

        // 再次查询(应该从缓存获取)
        String value2 = configService.selectConfigByKey(configKey);

        // 断言两次查询结果一致
        assertThat(value1).isEqualTo(value2);

        // 验证缓存存在
        String cachedValue = redisUtils.getCacheObject(
            CacheConstants.SYS_CONFIG_KEY + configKey
        );
        assertThat(cachedValue).isEqualTo(value1);
    }

    @Test
    @DisplayName("测试缓存穿透")
    public void testCachePenetration() {
        String configKey = "sys.not.exist.config";

        // 查询不存在的配置
        String value = configService.selectConfigByKey(configKey);

        // 断言返回 null
        assertThat(value).isNull();

        // 验证缓存中也不存在(防止缓存穿透)
        boolean exists = redisUtils.hasKey(
            CacheConstants.SYS_CONFIG_KEY + configKey
        );
        assertThat(exists).isFalse();
    }
}
```

### 字典集成测试

**字典服务集成测试示例:**

```java
@Slf4j
@SpringBootTest
@DisplayName("字典集成测试")
public class SysDictIntegrationTest extends BaseServiceTest {

    @Autowired
    private ISysDictTypeService dictTypeService;

    @Autowired
    private ISysDictDataService dictDataService;

    @Test
    @DisplayName("测试完整的字典流程")
    public void testCompleteDictFlow() {
        // 1. 创建字典类型
        SysDictTypeBo dictType = new SysDictTypeBo();
        dictType.setDictName("测试字典");
        dictType.setDictType("test_dict_type");
        dictType.setRemark("集成测试字典");

        Long dictId = dictTypeService.insertDictType(dictType);
        assertThat(dictId).isNotNull().isPositive();
        log.info("创建字典类型成功,ID: {}", dictId);

        // 2. 添加字典数据
        for (int i = 1; i <= 3; i++) {
            SysDictDataBo dictData = new SysDictDataBo();
            dictData.setDictType("test_dict_type");
            dictData.setDictLabel("测试选项" + i);
            dictData.setDictValue("value" + i);
            dictData.setDictSort(i);

            int result = dictDataService.insertDictData(dictData);
            assertThat(result).isEqualTo(1);
        }
        log.info("创建字典数据成功,数量: 3");

        // 3. 查询字典数据
        List<SysDictDataVo> dictList =
            dictDataService.selectDictDataByType("test_dict_type");
        assertThat(dictList)
            .isNotEmpty()
            .hasSize(3)
            .allMatch(dict -> dict.getDictType().equals("test_dict_type"));
        log.info("查询字典数据成功,数量: {}", dictList.size());

        // 4. 更新字典数据
        SysDictDataVo firstDict = dictList.get(0);
        SysDictDataBo updateBo = new SysDictDataBo();
        updateBo.setDictCode(firstDict.getDictCode());
        updateBo.setDictLabel("更新后的标签");

        int updateResult = dictDataService.updateDictData(updateBo);
        assertThat(updateResult).isEqualTo(1);
        log.info("更新字典数据成功");

        // 5. 删除字典数据
        int deleteResult = dictDataService.deleteDictDataByIds(
            new Long[]{firstDict.getDictCode()}
        );
        assertThat(deleteResult).isEqualTo(1);
        log.info("删除字典数据成功");

        // 6. 删除字典类型
        int deleteTypeResult = dictTypeService.deleteDictTypeByIds(
            new Long[]{dictId}
        );
        assertThat(deleteTypeResult).isEqualTo(1);
        log.info("删除字典类型成功");

        // 测试结束后自动回滚
    }
}
```

## 测试编写规范

### 测试命名规范

**测试类命名:**
- 单元测试: `{ClassName}Test`
- Service 层测试: `{ServiceName}ServiceTest`
- Controller 层测试: `{ControllerName}ControllerTest`
- 集成测试: `{ModuleName}IntegrationTest`

**测试方法命名:**
- 使用 `test` 前缀: `testMethodName()`
- 使用 `should` 风格: `shouldReturnUserWhenValidId()`
- 使用 `given_when_then` 风格: `givenValidUser_whenSave_thenSuccess()`

**示例:**

```java
// 推荐命名方式1: test前缀
@Test
@DisplayName("测试添加用户")
public void testAddUser() { }

// 推荐命名方式2: should风格
@Test
@DisplayName("当用户名重复时应该抛出异常")
public void shouldThrowExceptionWhenDuplicateUsername() { }

// 推荐命名方式3: given_when_then风格
@Test
@DisplayName("给定有效用户,当保存时,应该成功")
public void givenValidUser_whenSave_thenSuccess() { }
```

### 测试组织规范

**测试类结构:**

```java
@SpringBootTest
@DisplayName("用户服务测试")
public class UserServiceTest extends BaseServiceTest {

    // 1. 依赖注入
    @Autowired
    private ISysUserService userService;

    @MockitoBean
    private ISysRoleService roleService;

    // 2. 测试数据准备
    private SysUserBo testUser;

    @BeforeEach
    public void prepare() {
        testUser = createTestUser();
    }

    // 3. 正常场景测试
    @Nested
    @DisplayName("正常场景测试")
    class NormalScenarioTests {

        @Test
        @DisplayName("测试添加用户成功")
        public void testAddUserSuccess() { }

        @Test
        @DisplayName("测试查询用户成功")
        public void testGetUserSuccess() { }
    }

    // 4. 异常场景测试
    @Nested
    @DisplayName("异常场景测试")
    class ExceptionScenarioTests {

        @Test
        @DisplayName("测试用户名重复时抛出异常")
        public void testDuplicateUsernameThrowsException() { }

        @Test
        @DisplayName("测试参数为空时抛出异常")
        public void testNullParameterThrowsException() { }
    }

    // 5. 边界条件测试
    @Nested
    @DisplayName("边界条件测试")
    class BoundaryTests {

        @Test
        @DisplayName("测试用户名长度边界")
        public void testUsernameLengthBoundary() { }
    }

    // 6. 辅助方法
    private SysUserBo createTestUser() {
        SysUserBo user = new SysUserBo();
        user.setUserName(TestDataBuilder.randomUserName());
        user.setNickName(TestDataBuilder.randomChineseName());
        return user;
    }
}
```

### AAA 模式

测试代码应遵循 AAA (Arrange-Act-Assert) 模式:

**Arrange (准备)** - 准备测试数据和环境
**Act (执行)** - 执行被测试的代码
**Assert (断言)** - 验证执行结果

**示例:**

```java
@Test
@DisplayName("测试添加用户")
public void testAddUser() {
    // === Arrange (准备) ===
    SysUserBo user = new SysUserBo();
    user.setUserName("testuser");
    user.setNickName("测试用户");
    user.setDeptId(100L);

    // === Act (执行) ===
    Long userId = userService.insertUser(user);

    // === Assert (断言) ===
    assertThat(userId).isNotNull().isPositive();

    SysUserVo savedUser = userService.selectUserById(userId);
    assertThat(savedUser)
        .isNotNull()
        .extracting("userName", "nickName")
        .containsExactly("testuser", "测试用户");
}
```

### Mock 使用规范

**Mock 原则:**
- 只 Mock 外部依赖和不稳定的依赖
- 不要 Mock 被测试的对象
- 使用 `@MockitoBean` 替代 `@MockBean` (Spring Boot 3.4.0+)

**Mock 示例:**

```java
@SpringBootTest
public class UserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @MockitoBean  // 使用 @MockitoBean 替代 @MockBean
    private ISysRoleService roleService;

    @MockitoBean
    private ISysDeptService deptService;

    @Test
    @DisplayName("测试添加用户时分配默认角色")
    public void testAddUserWithDefaultRole() {
        // Mock 角色查询
        SysRoleVo defaultRole = new SysRoleVo();
        defaultRole.setRoleId(2L);
        defaultRole.setRoleName("普通用户");
        when(roleService.selectRoleByKey("common_user"))
            .thenReturn(defaultRole);

        // Mock 部门查询
        SysDeptVo dept = new SysDeptVo();
        dept.setDeptId(100L);
        dept.setDeptName("测试部门");
        when(deptService.selectDeptById(100L))
            .thenReturn(dept);

        // 执行测试
        SysUserBo user = createTestUser();
        user.setDeptId(100L);
        Long userId = userService.insertUser(user);

        // 断言
        assertThat(userId).isNotNull();

        // 验证 Mock 方法被调用
        verify(roleService, times(1))
            .selectRoleByKey("common_user");
        verify(deptService, times(1))
            .selectDeptById(100L);
    }
}
```

**常用 Mockito 方法:**

```java
// 设置 Mock 返回值
when(service.method(any())).thenReturn(result);
when(service.method(anyLong())).thenReturn(result);
when(service.method(eq(1L))).thenReturn(result);

// 抛出异常
when(service.method(any()))
    .thenThrow(new RuntimeException("错误"));

// 多次调用返回不同结果
when(service.method())
    .thenReturn(result1)
    .thenReturn(result2);

// 验证方法调用
verify(service).method();
verify(service, times(2)).method();
verify(service, never()).method();
verify(service, atLeast(1)).method();
verify(service, atMost(3)).method();

// 参数捕获
ArgumentCaptor<UserBo> captor =
    ArgumentCaptor.forClass(UserBo.class);
verify(service).insertUser(captor.capture());
UserBo capturedUser = captor.getValue();
assertThat(capturedUser.getUserName()).isEqualTo("test");
```

### 测试覆盖率要求

**覆盖率目标:**
- 核心业务逻辑: ≥ 80%
- Service 层: ≥ 70%
- Controller 层: ≥ 60%
- 工具类: ≥ 90%

**测试优先级:**
1. 核心业务逻辑(最高优先级)
2. 复杂算法和计算
3. 异常处理逻辑
4. 边界条件
5. 简单 CRUD 操作(最低优先级)

**覆盖率统计:**

使用 JaCoCo 插件统计代码覆盖率:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
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
    </executions>
</plugin>
```

运行测试并生成覆盖率报告:

```bash
mvn clean test
mvn jacoco:report
```

查看覆盖率报告:

```
target/site/jacoco/index.html
```

## 性能测试实践

### 性能监控机制

BaseTest 提供了内置的性能监控机制,自动记录测试执行时间。

**默认配置:**
- 性能阈值: 3000ms
- 超过阈值会输出警告日志

**自定义阈值:**

```java
@SpringBootTest
public class PerformanceTest extends BaseTest {

    @Override
    protected long getPerformanceThreshold() {
        return 5000L; // 设置为5秒
    }

    @Test
    public void testSlowOperation() {
        // 如果执行时间超过5秒,会输出警告
        slowService.process();
    }
}
```

**禁用性能监控:**

```java
@SpringBootTest
public class NoPerformanceMonitorTest extends BaseTest {

    @Override
    protected boolean isPerformanceMonitorEnabled() {
        return false; // 禁用性能监控
    }

    @Test
    public void testMethod() {
        // 不会记录执行时间
    }
}
```

### 性能测试示例

**Service 性能测试:**

```java
@SpringBootTest
@DisplayName("用户服务性能测试")
public class UserServicePerformanceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Override
    protected long getPerformanceThreshold() {
        return 1000L; // 1秒阈值
    }

    @Test
    @DisplayName("测试批量查询用户性能")
    public void testBatchQueryPerformance() {
        // 查询100条用户数据
        SysUserBo query = new SysUserBo();
        query.setPageNum(1);
        query.setPageSize(100);

        PageResult<SysUserVo> result = userService.selectUserList(query);

        assertThat(result.getRecords()).isNotEmpty();
        // 如果查询时间超过1秒,会输出性能警告
    }

    @Test
    @DisplayName("测试批量插入用户性能")
    @Disabled("性能测试,手动执行")
    public void testBatchInsertPerformance() {
        // 插入1000条用户数据
        for (int i = 0; i < 1000; i++) {
            SysUserBo user = createTestUser();
            userService.insertUser(user);
        }
        // 会自动记录总执行时间
    }

    @Test
    @DisplayName("测试并发查询性能")
    @Disabled("性能测试,手动执行")
    public void testConcurrentQueryPerformance() throws Exception {
        int threadCount = 10;
        int loopCount = 100;

        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            new Thread(() -> {
                for (int j = 0; j < loopCount; j++) {
                    userService.selectUserById(1L);
                }
                latch.countDown();
            }).start();
        }

        latch.await();
        // 会记录总执行时间
    }
}
```

### 压力测试

使用 JMeter 或 Gatling 进行压力测试。

**JMeter 压力测试步骤:**

1. **安装 JMeter**

```bash
# 下载并解压 JMeter
wget https://dlcdn.apache.org//jmeter/binaries/apache-jmeter-5.6.2.tgz
tar -xzf apache-jmeter-5.6.2.tgz
cd apache-jmeter-5.6.2/bin
./jmeter
```

2. **创建测试计划**

创建 `user-api-test.jmx`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="用户API压力测试">
      <elementProp name="TestPlan.user_defined_variables"
                   elementType="Arguments">
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
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup"
                   testname="用户查询压测">
        <intProp name="ThreadGroup.num_threads">100</intProp>
        <intProp name="ThreadGroup.ramp_time">10</intProp>
        <longProp name="ThreadGroup.duration">60</longProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy>
          <stringProp name="HTTPSampler.domain">${host}</stringProp>
          <stringProp name="HTTPSampler.port">${port}</stringProp>
          <stringProp name="HTTPSampler.path">/system/user/1</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

3. **执行压力测试**

```bash
# 命令行模式执行
./jmeter -n -t user-api-test.jmx -l result.jtl -e -o report

# 参数说明:
# -n: 命令行模式
# -t: 测试计划文件
# -l: 结果文件
# -e: 生成测试报告
# -o: 报告输出目录
```

4. **查看测试报告**

打开 `report/index.html` 查看压力测试报告。

## 持续集成(CI)

### Maven 配置

在项目根目录的 `pom.xml` 中配置测试插件:

```xml
<build>
    <plugins>
        <!-- Maven Surefire 插件 - 执行单元测试 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.0.0-M9</version>
            <configuration>
                <!-- 并行执行测试 -->
                <parallel>methods</parallel>
                <threadCount>4</threadCount>

                <!-- 测试失败时不停止构建 -->
                <testFailureIgnore>false</testFailureIgnore>

                <!-- 包含的测试 -->
                <includes>
                    <include>**/*Test.java</include>
                    <include>**/*Tests.java</include>
                </includes>

                <!-- 排除的测试 -->
                <excludes>
                    <exclude>**/*IntegrationTest.java</exclude>
                </excludes>
            </configuration>
        </plugin>

        <!-- Maven Failsafe 插件 - 执行集成测试 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-failsafe-plugin</artifactId>
            <version>3.0.0-M9</version>
            <configuration>
                <includes>
                    <include>**/*IntegrationTest.java</include>
                </includes>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>integration-test</goal>
                        <goal>verify</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>

        <!-- JaCoCo 插件 - 代码覆盖率 -->
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.10</version>
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
                                <element>PACKAGE</element>
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
    </plugins>
</build>
```

### 命令行执行测试

**执行所有测试:**

```bash
mvn clean test
```

**执行单元测试:**

```bash
mvn test
```

**执行集成测试:**

```bash
mvn verify
```

**跳过测试:**

```bash
mvn clean install -DskipTests
```

**执行指定测试类:**

```bash
mvn test -Dtest=UserServiceTest
```

**执行指定测试方法:**

```bash
mvn test -Dtest=UserServiceTest#testAddUser
```

**执行多个测试类:**

```bash
mvn test -Dtest=UserServiceTest,RoleServiceTest
```

**生成覆盖率报告:**

```bash
mvn clean test jacoco:report
```

### GitLab CI/CD 配置

创建 `.gitlab-ci.yml` 文件:

```yaml
# 定义阶段
stages:
  - build
  - test
  - deploy

# 定义变量
variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
  MAVEN_CLI_OPTS: "--batch-mode --errors --fail-at-end --show-version"

# 缓存配置
cache:
  paths:
    - .m2/repository
    - target/

# 构建阶段
build:
  stage: build
  image: maven:3.9-eclipse-temurin-21
  script:
    - mvn $MAVEN_CLI_OPTS clean compile
  artifacts:
    paths:
      - target/
    expire_in: 1 hour

# 单元测试阶段
unit-test:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  dependencies:
    - build
  script:
    - mvn $MAVEN_CLI_OPTS test
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    when: always
    reports:
      junit:
        - target/surefire-reports/TEST-*.xml
    paths:
      - target/site/jacoco/
    expire_in: 30 days

# 集成测试阶段
integration-test:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  dependencies:
    - build
  services:
    - redis:latest
    - mysql:8.0
  variables:
    MYSQL_ROOT_PASSWORD: root
    MYSQL_DATABASE: ruoyi_test
    REDIS_PASSWORD: ""
  script:
    - mvn $MAVEN_CLI_OPTS verify
  artifacts:
    when: always
    reports:
      junit:
        - target/failsafe-reports/TEST-*.xml
    expire_in: 30 days
  only:
    - merge_requests
    - master

# 代码覆盖率检查
coverage-check:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  dependencies:
    - unit-test
  script:
    - mvn jacoco:check
  coverage: '/Total.*?([0-9]{1,3})%/'
  allow_failure: true

# 部署阶段(仅主分支)
deploy:
  stage: deploy
  image: maven:3.9-eclipse-temurin-21
  dependencies:
    - build
  script:
    - mvn $MAVEN_CLI_OPTS clean package -DskipTests
  artifacts:
    paths:
      - target/*.jar
    expire_in: 7 days
  only:
    - master
```

### GitHub Actions 配置

创建 `.github/workflows/test.yml` 文件:

```yaml
name: Test

on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      redis:
        image: redis:latest
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: ruoyi_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd "mysqladmin ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven

    - name: Cache Maven packages
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2

    - name: Run unit tests
      run: mvn clean test

    - name: Run integration tests
      run: mvn verify

    - name: Generate coverage report
      run: mvn jacoco:report

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./target/site/jacoco/jacoco.xml
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: false

    - name: Publish test results
      uses: dorny/test-reporter@v1
      if: always()
      with:
        name: Test Results
        path: target/surefire-reports/*.xml
        reporter: java-junit
        fail-on-error: false

    - name: Archive test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          target/surefire-reports/
          target/failsafe-reports/
          target/site/jacoco/
        retention-days: 30
```

### Jenkins 配置

创建 `Jenkinsfile`:

```groovy
pipeline {
    agent any

    tools {
        maven 'Maven 3.9'
        jdk 'JDK 21'
    }

    environment {
        MAVEN_OPTS = '-Dmaven.repo.local=.m2/repository'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }

        stage('Unit Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                    jacoco(
                        execPattern: 'target/jacoco.exec',
                        classPattern: 'target/classes',
                        sourcePattern: 'src/main/java'
                    )
                }
            }
        }

        stage('Integration Test') {
            steps {
                sh 'mvn verify'
            }
            post {
                always {
                    junit 'target/failsafe-reports/*.xml'
                }
            }
        }

        stage('Code Coverage Check') {
            steps {
                sh 'mvn jacoco:check'
            }
        }

        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '测试通过!'
        }
        failure {
            echo '测试失败!'
            emailext (
                subject: "测试失败: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "构建失败,请查看: ${env.BUILD_URL}",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
    }
}
```

## 测试最佳实践

### 测试独立性

每个测试方法应该相互独立,不依赖其他测试的执行结果。

**错误示例:**

```java
private Long userId; // 在测试间共享状态

@Test
@Order(1)
public void testAddUser() {
    userId = userService.add(user);  // 保存到实例变量
}

@Test
@Order(2)
public void testGetUser() {
    SysUserVo user = userService.get(userId);  // 依赖前一个测试
}
```

**正确示例:**

```java
@Test
public void testAddUser() {
    Long userId = userService.add(user);
    assertNotNull(userId);
    // 测试结束,不保存状态
}

@Test
public void testGetUser() {
    // 独立准备测试数据
    Long userId = userService.add(createTestUser());
    SysUserVo user = userService.get(userId);
    assertNotNull(user);
}
```

### 测试数据隔离

使用 `@Transactional` 注解实现测试数据自动回滚。

```java
@SpringBootTest
@Transactional  // 测试结束后自动回滚
public class UserServiceTest extends BaseServiceTest {

    @Test
    public void testAddUser() {
        userService.add(user);
        // 测试结束后数据自动回滚,不会污染数据库
    }
}
```

### 测试可重复性

测试应该可以重复执行,每次执行结果一致。

**避免使用随机数据导致不可重复:**

```java
// 错误: 使用当前时间戳,每次执行结果不同
@Test
public void testAddUser() {
    user.setUserName("user_" + System.currentTimeMillis());
    // 可能导致测试不稳定
}

// 正确: 使用固定种子的随机数据
@Test
public void testAddUser() {
    user.setUserName(TestDataBuilder.randomUserName());
    // TestDataBuilder 使用固定种子,结果可重复
}
```

### 测试速度优化

**优化策略:**

1. **使用 Mock 替代真实依赖**

```java
// 慢: 真实数据库查询
@Test
public void testSlowMethod() {
    List<User> users = userService.queryAll();  // 查询数据库
    // ...
}

// 快: 使用 Mock
@Test
public void testFastMethod() {
    when(userService.queryAll()).thenReturn(mockUsers);
    // ...
}
```

2. **并行执行测试**

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <parallel>methods</parallel>
        <threadCount>4</threadCount>
    </configuration>
</plugin>
```

3. **使用内存数据库**

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
```

4. **缓存 Spring 上下文**

```java
// 使用相同的 @SpringBootTest 配置,Spring 会缓存上下文
@SpringBootTest
public class Test1 { }

@SpringBootTest
public class Test2 { }  // 复用 Test1 的上下文
```

### 测试文档化

使用 `@DisplayName` 提供清晰的测试描述。

```java
@Test
@DisplayName("当用户名重复时,应该抛出 ServiceException 异常")
public void shouldThrowServiceExceptionWhenDuplicateUsername() {
    // 给定: 已存在的用户名
    String existingUsername = "admin";

    // 当: 尝试添加重复用户名的用户
    SysUserBo user = new SysUserBo();
    user.setUserName(existingUsername);

    // 则: 应该抛出异常
    assertThatThrownBy(() -> userService.add(user))
        .isInstanceOf(ServiceException.class)
        .hasMessageContaining("用户名已存在");
}
```

### 异常测试

**测试异常抛出:**

```java
@Test
@DisplayName("测试参数为空时抛出异常")
public void testNullParameterThrowsException() {
    // JUnit 5 异常断言
    assertThrows(IllegalArgumentException.class, () -> {
        userService.add(null);
    });

    // AssertJ 异常断言(推荐)
    assertThatThrownBy(() -> userService.add(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("用户信息不能为空")
        .hasMessageContaining("用户信息");
}
```

**测试异常不抛出:**

```java
@Test
@DisplayName("测试正常参数不抛出异常")
public void testValidParameterDoesNotThrowException() {
    SysUserBo user = createTestUser();

    // 断言不抛出任何异常
    assertDoesNotThrow(() -> {
        userService.add(user);
    });
}
```

### 参数化测试

使用 `@ParameterizedTest` 测试多组参数。

**基础参数化测试:**

```java
@ParameterizedTest
@ValueSource(strings = {"admin", "user", "guest"})
@DisplayName("测试不同用户名的验证")
public void testUsernameValidation(String username) {
    boolean isValid = ValidationUtils.isValidUsername(username);
    assertTrue(isValid);
}

@ParameterizedTest
@ValueSource(ints = {1, 2, 3, 5, 10})
@DisplayName("测试不同页码的分页查询")
public void testPagination(int pageNum) {
    PageResult<SysUserVo> result =
        userService.selectUserList(pageNum, 10);
    assertThat(result.getRecords()).isNotEmpty();
}
```

**CSV 参数化测试:**

```java
@ParameterizedTest
@CsvSource({
    "admin, 管理员, 1",
    "user, 普通用户, 2",
    "guest, 访客, 3"
})
@DisplayName("测试不同用户信息的添加")
public void testAddUserWithDifferentData(
    String username, String nickname, Long roleId) {
    SysUserBo user = new SysUserBo();
    user.setUserName(username);
    user.setNickName(nickname);
    user.setRoleId(roleId);

    Long userId = userService.add(user);
    assertNotNull(userId);
}
```

**方法源参数化测试:**

```java
@ParameterizedTest
@MethodSource("provideUsers")
@DisplayName("测试批量添加用户")
public void testBatchAddUsers(SysUserBo user) {
    Long userId = userService.add(user);
    assertNotNull(userId);
}

static Stream<SysUserBo> provideUsers() {
    return Stream.of(
        createUser("user1", "用户1"),
        createUser("user2", "用户2"),
        createUser("user3", "用户3")
    );
}

private static SysUserBo createUser(String username, String nickname) {
    SysUserBo user = new SysUserBo();
    user.setUserName(username);
    user.setNickName(nickname);
    user.setDeptId(100L);
    return user;
}
```

### 动态测试

使用 `@TestFactory` 创建动态测试。

```java
@TestFactory
@DisplayName("动态测试字典数据")
Stream<DynamicTest> testDictDataDynamically() {
    // 查询所有字典类型
    List<String> dictTypes = Arrays.asList(
        "sys_normal_disable",
        "sys_user_sex",
        "sys_notice_type"
    );

    // 为每个字典类型创建测试
    return dictTypes.stream()
        .map(dictType -> DynamicTest.dynamicTest(
            "测试字典类型: " + dictType,
            () -> {
                List<SysDictDataVo> dictList =
                    dictDataService.selectDictDataByType(dictType);
                assertThat(dictList).isNotEmpty();
            }
        ));
}
```

## 常见问题

### 1. 测试执行缓慢

**问题原因:**
- 频繁启动 Spring 上下文
- 使用真实数据库查询
- 测试串行执行

**解决方案:**

```java
// 1. 统一测试配置,复用 Spring 上下文
@SpringBootTest  // 所有测试类使用相同配置
public class BaseTest { }

// 2. 使用 Mock 替代真实依赖
@MockitoBean
private ISysUserService userService;

// 3. 配置并行执行
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <parallel>methods</parallel>
        <threadCount>4</threadCount>
    </configuration>
</plugin>

// 4. 使用内存数据库
spring:
  datasource:
    url: jdbc:h2:mem:testdb
```

### 2. 测试数据污染

**问题原因:**
- 测试未使用事务回滚
- 测试间共享状态
- 缓存未清理

**解决方案:**

```java
// 1. 使用 @Transactional 自动回滚
@SpringBootTest
@Transactional
public class UserServiceTest extends BaseServiceTest {
    // 测试结束后自动回滚
}

// 2. 每个测试独立准备数据
@BeforeEach
public void setUp() {
    testUser = createTestUser();  // 每个测试创建新数据
}

// 3. 清理缓存
@AfterEach
public void tearDown() {
    redisUtils.deleteObject("cache:key");
}
```

### 3. Mock 未生效

**问题原因:**
- 使用了错误的 Mock 注解
- Mock 对象未注入到被测试对象
- Mock 方法签名不匹配

**解决方案:**

```java
// 1. Spring Boot 3.4.0+ 使用 @MockitoBean
@MockitoBean  // 不是 @MockBean
private ISysUserService userService;

// 2. 确保 Mock 对象注入
@Autowired
private UserController controller;  // controller 会自动注入 Mock 的 userService

// 3. 使用正确的 Mockito 匹配器
when(userService.selectUserById(any()))  // ❌ 错误
    .thenReturn(user);

when(userService.selectUserById(anyLong()))  // ✅ 正确
    .thenReturn(user);
```

### 4. 集成测试找不到 Bean

**问题原因:**
- 测试类不在正确的包路径下
- 缺少 `@SpringBootTest` 注解
- 组件扫描路径配置错误

**解决方案:**

```java
// 1. 确保测试类在正确的包路径下
// src/test/java/plus/ruoyi/...  (与主代码包路径一致)

// 2. 添加 @SpringBootTest 注解
@SpringBootTest  // 加载完整的 Spring 上下文
public class UserServiceTest { }

// 3. 指定主配置类
@SpringBootTest(classes = RuoYiApplication.class)
public class UserServiceTest { }
```

### 5. 测试覆盖率不准确

**问题原因:**
- JaCoCo 配置错误
- 排除规则过多
- 测试未正确执行

**解决方案:**

```xml
<!-- 1. 配置 JaCoCo 插件 -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
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
    </executions>
    <configuration>
        <!-- 排除不需要测试的类 -->
        <excludes>
            <exclude>**/domain/**</exclude>
            <exclude>**/config/**</exclude>
        </excludes>
    </configuration>
</plugin>

<!-- 2. 执行测试并生成报告 -->
mvn clean test jacoco:report

<!-- 3. 查看报告 -->
target/site/jacoco/index.html
```

## 总结

自动化测试是保障软件质量的重要手段。RuoYi-Plus-UniApp 项目提供了完善的测试框架和工具,支持单元测试、集成测试、性能测试等多种测试类型。

**核心要点:**

1. **测试分层** - BaseTest、BaseServiceTest、BaseControllerTest 三层测试基类
2. **自动回滚** - Service 层测试自动回滚事务,不污染数据库
3. **性能监控** - 内置性能监控机制,自动识别慢测试
4. **数据构造** - TestDataBuilder 提供丰富的测试数据生成工具
5. **Mock 支持** - 使用 Mockito 模拟外部依赖
6. **持续集成** - 支持 GitLab CI/CD、GitHub Actions、Jenkins 等 CI 工具
7. **代码覆盖** - 使用 JaCoCo 统计代码覆盖率,目标 ≥ 70%

**测试金字塔:**

```
           /\
          /  \    E2E测试
         /    \   (少量)
        /------\
       /        \  集成测试
      /          \ (适量)
     /------------\
    /              \ 单元测试
   /                \ (大量)
  /------------------\
```

遵循测试金字塔原则:
- 单元测试: 70%
- 集成测试: 20%
- E2E 测试: 10%

通过持续的自动化测试实践,可以有效提升代码质量、减少线上故障、加快交付速度。
