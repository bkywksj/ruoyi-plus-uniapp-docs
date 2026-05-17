# 测试支持模块

## 模块简介

ruoyi-common-test 是 RuoYi-Plus 框架的**测试支持模块**，提供了一套完整的单元测试和集成测试基础设施。该模块基于 JUnit 5 和 Spring Boot Test 构建，封装了测试基类、测试数据工厂、测试配置管理等功能，帮助开发者快速编写高质量的测试代码。

**核心定位：**

- **测试基类体系** - 提供分层设计的测试基类，针对不同场景提供专用支持
- **测试数据工厂** - 基于 JavaFaker 的随机测试数据生成工具
- **测试目录管理** - 自动管理测试临时文件和目录
- **性能监控** - 内置测试执行时间监控和性能警告机制
- **事务回滚** - Service 层测试自动回滚，不污染数据库

**基本信息：**

| 属性 | 值 |
|------|------|
| 模块名称 | ruoyi-common-test |
| 所属分组 | plus.ruoyi |
| 核心依赖 | Spring Boot Test, JUnit 5, JavaFaker |
| 依赖范围 | test (不会打包到生产环境) |
| 适用版本 | Java 17+ |

## 核心特性

### 分层测试基类

模块提供四个分层设计的测试基类，覆盖从单元测试到集成测试的全部场景：

```text
BaseUnitTest (单元测试基类)
    │   - 不启动 Spring 容器
    │   - 极快启动 (< 1秒)
    │   - 适用于工具类、POJO、算法测试
    ↓
BaseSpringTest (Spring 测试基类)
    │   - 启动轻量级 Spring 容器
    │   - 不启动 Web 容器
    │   - 适用于需要依赖注入的测试
    ↓
BaseServiceTest (Service 测试基类)        BaseControllerTest (Controller 测试基类)
    - 继承 BaseSpringTest                     - 继承 BaseSpringTest
    - 事务自动回滚                            - 启动完整 Web 容器
    - 适用于 Service 层测试                    - 适用于 Controller 接口测试
```

### 测试数据工厂

TestDataBuilder 提供丰富的随机测试数据生成能力：

| 数据类型 | 方法示例 | 说明 |
|---------|---------|------|
| 用户信息 | `randomUserName()`, `randomChineseName()` | 用户名、中文姓名 |
| 联系方式 | `randomPhone()`, `randomEmail()` | 手机号、邮箱 |
| 地址信息 | `randomAddress()`, `randomCompany()` | 地址、公司名 |
| 网络信息 | `randomUrl()`, `randomIp()` | URL、IP 地址 |
| 基础类型 | `randomInt()`, `randomLong()`, `randomBoolean()` | 数值、布尔 |
| 日期时间 | `randomDateTime()`, `randomFutureDateTime()` | 过去/未来时间 |
| 集合生成 | `randomList()`, `randomSet()` | 列表、集合 |

### 性能监控

所有测试基类内置性能监控功能：

- **执行时间记录** - 自动记录每个测试方法的执行时间
- **性能警告** - 超过阈值时输出警告日志
- **可配置阈值** - 默认 3 秒，可自定义
- **可选关闭** - 支持禁用性能监控

```text
▶ 开始测试: 测试添加用户
✓ 测试添加用户 完成,耗时: 156ms

⚠️ 性能警告: 测试批量导入 执行时间 5234ms 超过阈值 3000ms
```

### 测试目录管理

TestConfig 提供统一的测试目录管理：

| 目录 | 路径 | 用途 |
|------|------|------|
| 临时根目录 | `{java.io.tmpdir}/ruoyi-test` | 测试临时文件根目录 |
| 输出目录 | `{临时根目录}/output` | 测试输出文件 |
| 上传目录 | `{临时根目录}/upload` | 测试上传文件 |

目录生命周期：
- **测试前** - 自动创建必需目录
- **测试后** - 自动清理临时文件

## 依赖配置

### Maven 依赖

在需要测试的模块 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-test</artifactId>
    <scope>test</scope>
</dependency>
```

**注意事项：**
- 必须指定 `<scope>test</scope>`，确保不会打包到生产环境
- 该模块会自动引入 JUnit 5、Mockito、AssertJ 等测试依赖

### 模块依赖树

ruoyi-common-test 自动引入以下测试依赖：

```text
ruoyi-common-test
├── spring-boot-starter-test      # Spring Boot 测试框架
│   ├── junit-jupiter             # JUnit 5 测试引擎
│   ├── mockito-core              # Mock 框架
│   ├── mockito-junit-jupiter     # Mockito JUnit 5 扩展
│   └── assertj-core              # 流式断言库
├── spring-web                    # Spring Web 支持
├── spring-tx                     # Spring 事务支持
├── jackson-databind              # JSON 序列化
├── javafaker                     # 测试数据生成
├── hutool-core                   # 核心工具类
├── hutool-http                   # HTTP 请求支持
├── hutool-json                   # JSON 处理
└── lombok                        # 代码简化
```

### 版本信息

| 依赖 | 版本 | 说明 |
|------|------|------|
| JUnit Jupiter | 5.10.5 | JUnit 5 测试引擎 |
| Mockito | 5.15.2 | Mock 框架 |
| AssertJ | 3.27.3 | 流式断言库 |
| JavaFaker | 1.0.2 | 测试数据生成 |
| Hutool | 5.8.40 | 工具类库 |

## 模块架构

### 目录结构

```text
ruoyi-common-test/
├── src/main/java/plus/ruoyi/common/test/
│   ├── TestApplication.java              # 测试启动类
│   ├── base/                              # 测试基类
│   │   ├── BaseUnitTest.java             # 单元测试基类
│   │   ├── BaseSpringTest.java           # Spring 测试基类
│   │   ├── BaseServiceTest.java          # Service 测试基类
│   │   ├── BaseControllerTest.java       # Controller 测试基类
│   │   └── TestDataBuilder.java          # 测试数据工厂
│   └── config/
│       └── TestConfig.java               # 测试配置类
├── src/test/java/plus/ruoyi/common/test/
│   ├── AssertUnitTest.java               # 断言示例测试
│   ├── DemoUnitTest.java                 # 演示测试
│   ├── ParamUnitTest.java                # 参数化测试示例
│   └── TagUnitTest.java                  # 标签测试示例
└── pom.xml
```

### 类继承关系

```java
// 单元测试 - 不启动 Spring
public abstract class BaseUnitTest {
    // 性能监控
    // 测试目录管理
    // setUp/tearDown 扩展点
}

// Spring 测试 - 轻量级容器
@SpringBootTest(webEnvironment = NONE)
public abstract class BaseSpringTest extends BaseUnitTest {
    // 继承性能监控和目录管理
    // 支持 @Autowired 注入
}

// Service 测试 - 事务回滚
@Transactional
public abstract class BaseServiceTest extends BaseSpringTest {
    // 测试后自动回滚事务
}

// Controller 测试 - 完整 Web 容器
@SpringBootTest(webEnvironment = RANDOM_PORT)
public abstract class BaseControllerTest extends BaseSpringTest {
    // 真实 HTTP 请求支持
    // doGet/doPost/doPut/doDelete 方法
}
```

## 快速上手

### 第一步：选择测试基类

根据测试场景选择合适的基类：

| 测试场景 | 推荐基类 | 原因 |
|---------|---------|------|
| 工具类测试 | `BaseUnitTest` | 无需 Spring，启动快 |
| POJO/DTO 测试 | `BaseUnitTest` | 纯逻辑测试 |
| 算法测试 | `BaseUnitTest` | 不需要依赖注入 |
| Redis 工具测试 | `BaseSpringTest` | 需要注入 Bean |
| 配置类测试 | `BaseSpringTest` | 需要 Spring 配置 |
| Service 业务逻辑 | `BaseServiceTest` | 需要事务回滚 |
| 数据库操作测试 | `BaseServiceTest` | 避免污染数据 |
| Controller 接口 | `BaseControllerTest` | 需要 HTTP 请求 |
| 拦截器/过滤器测试 | `BaseControllerTest` | 需要完整请求流程 |

### 第二步：编写测试类

**单元测试示例：**

```java
import plus.ruoyi.common.test.base.BaseUnitTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("字符串工具类测试")
class StringUtilsTest extends BaseUnitTest {

    @Test
    @DisplayName("测试字符串非空判断")
    void testIsNotBlank() {
        assertThat(StringUtils.isNotBlank("hello")).isTrue();
        assertThat(StringUtils.isNotBlank("")).isFalse();
        assertThat(StringUtils.isNotBlank(null)).isFalse();
    }

    @Test
    @DisplayName("测试字符串格式化")
    void testFormat() {
        String result = StringUtils.format("Hello, {}!", "World");
        assertThat(result).isEqualTo("Hello, World!");
    }
}
```

**Service 测试示例：**

```java
import plus.ruoyi.common.test.base.BaseServiceTest;
import plus.ruoyi.common.test.base.TestDataBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("用户服务测试")
class SysUserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试添加用户")
    void testInsertUser() {
        // 使用 TestDataBuilder 生成测试数据
        SysUserBo user = new SysUserBo();
        user.setUserName(TestDataBuilder.randomUserName());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setPassword("123456");

        // 执行业务逻辑
        Long userId = userService.insertUser(user);

        // 断言验证
        assertThat(userId).isNotNull();
        assertThat(userId).isGreaterThan(0);

        // 测试结束后自动回滚，数据不会保存到数据库
    }
}
```

**Controller 测试示例：**

```java
import plus.ruoyi.common.test.base.BaseControllerTest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("用户接口测试")
class SysUserControllerTest extends BaseControllerTest {

    @Test
    @DisplayName("测试获取用户列表")
    void testGetUserList() {
        // 发送 GET 请求
        HttpResponse response = doGet("/system/user/list?pageNum=1&pageSize=10");

        // 解析响应
        String body = response.body();
        int code = JSONUtil.parseObj(body).getInt("code");

        // 断言验证
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(code).isEqualTo(200);
    }

    @Test
    @DisplayName("测试添加用户")
    void testAddUser() {
        // 构建请求体
        String requestBody = """
            {
                "userName": "test_user",
                "nickName": "测试用户",
                "password": "123456"
            }
            """;

        // 发送 POST 请求
        HttpResponse response = doPost("/system/user", requestBody);

        // 断言验证
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
```

### 第三步：运行测试

**IDE 运行：**
- 在 IDEA 中右键点击测试类或方法
- 选择 "Run" 或 "Debug"

**Maven 运行：**

```bash
# 运行所有测试
mvn test

# 运行指定测试类
mvn test -Dtest=SysUserServiceTest

# 运行指定测试方法
mvn test -Dtest=SysUserServiceTest#testInsertUser

# 跳过测试
mvn clean install -DskipTests
```

## 测试基类详解

### BaseUnitTest - 单元测试基类

最轻量的测试基类，不启动任何容器，适合纯逻辑测试。

**核心能力：**

| 功能 | 说明 | 默认值 |
|------|------|--------|
| 性能监控 | 记录测试执行时间 | 启用 |
| 性能阈值 | 超过阈值输出警告 | 3000ms |
| 目录管理 | 自动创建/清理测试目录 | 启用 |
| 扩展点 | `setUp()` / `tearDown()` | 可重写 |

**配置方法：**

```java
class MyTest extends BaseUnitTest {

    // 自定义性能阈值
    @Override
    protected long getPerformanceThreshold() {
        return 5000L; // 5 秒
    }

    // 禁用性能监控
    @Override
    protected boolean isPerformanceMonitorEnabled() {
        return false;
    }

    // 禁用目录管理
    @Override
    protected boolean isTestDirManagementEnabled() {
        return false;
    }

    // 测试前置处理
    @Override
    protected void setUp() {
        // 初始化测试数据
    }

    // 测试后置处理
    @Override
    protected void tearDown() {
        // 清理测试数据
    }
}
```

### BaseSpringTest - Spring 测试基类

启动轻量级 Spring 容器，支持依赖注入，但不启动 Web 容器。

**核心配置：**

```java
@SpringBootTest(
    classes = TestApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.NONE
)
public abstract class BaseSpringTest extends BaseUnitTest {
    // 继承 BaseUnitTest 的所有功能
}
```

**使用示例：**

```java
@DisplayName("Redis 工具测试")
class RedisUtilsTest extends BaseSpringTest {

    @Autowired
    private RedisUtils redisUtils;

    @Test
    @DisplayName("测试 Redis 读写")
    void testSetAndGet() {
        redisUtils.set("test:key", "value");
        String result = redisUtils.get("test:key");
        assertThat(result).isEqualTo("value");
        redisUtils.del("test:key");
    }
}
```

**条件注入：**

```java
@DisplayName("MQTT 客户端测试")
class MqttClientTest extends BaseSpringTest {

    @Autowired(required = false)
    private MqttClientTemplate mqttClient;

    @Test
    void testPublish() {
        if (mqttClient == null) {
            log.warn("⏭️ MQTT 未启用，跳过测试");
            return;
        }
        mqttClient.publish("test/topic", "Hello");
    }
}
```

### BaseServiceTest - Service 测试基类

在 BaseSpringTest 基础上增加事务回滚支持，测试结束后自动回滚数据库变更。

**核心配置：**

```java
@Transactional  // 事务自动回滚
public abstract class BaseServiceTest extends BaseSpringTest {
    // 继承 BaseSpringTest 的所有功能
}
```

**事务回滚机制：**

```java
@Test
@DisplayName("测试添加用户")
void testInsertUser() {
    // 准备数据
    SysUserBo user = new SysUserBo();
    user.setUserName("test_user");

    // 插入数据 - 在事务中执行
    Long userId = userService.insertUser(user);

    // 查询验证 - 能查到数据
    SysUserVo saved = userService.selectUserById(userId);
    assertThat(saved).isNotNull();

    // 测试结束 - 自动回滚，数据库中不会有这条记录
}
```

### BaseControllerTest - Controller 测试基类

启动完整 Web 容器，使用真实 HTTP 请求进行测试。

**核心配置：**

```java
@SpringBootTest(
    classes = TestApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
public abstract class BaseControllerTest extends BaseSpringTest {

    @LocalServerPort
    protected int port;

    @Autowired
    protected ObjectMapper objectMapper;
}
```

**HTTP 请求方法：**

| 方法 | 说明 | 参数 |
|------|------|------|
| `doGet(path)` | GET 请求 | 路径 |
| `doGet(path, headers)` | GET 请求 + 自定义头 | 路径、请求头 |
| `doPost(path)` | POST 请求（无请求体） | 路径 |
| `doPost(path, body)` | POST 请求 | 路径、请求体 |
| `doPost(path, body, headers)` | POST 请求 + 自定义头 | 路径、请求体、请求头 |
| `doPut(path, body)` | PUT 请求 | 路径、请求体 |
| `doDelete(path)` | DELETE 请求 | 路径 |
| `doDelete(path, headers)` | DELETE 请求 + 自定义头 | 路径、请求头 |

**自定义请求头示例：**

```java
@Test
@DisplayName("测试 OpenAPI 接口")
void testOpenApi() {
    String requestBody = "{\"name\":\"test\"}";

    Map<String, String> headers = Map.of(
        "X-App-Key", "test-key",
        "X-Timestamp", String.valueOf(System.currentTimeMillis()),
        "X-Sign", "calculated-signature"
    );

    HttpResponse response = doPost("/openapi/resource", requestBody, headers);
    assertThat(response.getStatus()).isEqualTo(200);
}
```

**工具方法：**

```java
// 对象转 JSON
String json = toJson(userObject);

// JSON 转对象
SysUserVo user = fromJson(jsonString, SysUserVo.class);

// 获取基础 URL
String baseUrl = getBaseUrl(); // http://127.0.0.1:{port}
```

## 测试数据工厂

### 基本使用

TestDataBuilder 提供静态方法，无需实例化：

```java
import plus.ruoyi.common.test.base.TestDataBuilder;

// 生成单个数据
String userName = TestDataBuilder.randomUserName();
String phone = TestDataBuilder.randomPhone();
String email = TestDataBuilder.randomEmail();

// 生成列表数据
List<String> phones = TestDataBuilder.randomList(10, TestDataBuilder::randomPhone);

// 从选项中随机选择
String status = TestDataBuilder.randomChoice("待审核", "已通过", "已拒绝");
```

### API 分类

**用户信息：**

```java
// 用户名
String userName = TestDataBuilder.randomUserName();
// 结果: "john.doe123"

// 中文姓名
String name = TestDataBuilder.randomChineseName();
// 结果: "张伟"

// 密码 (8-16位，包含字母、数字、特殊字符)
String password = TestDataBuilder.randomPassword();
// 结果: "aB3$xY9z"
```

**联系方式：**

```java
// 手机号 (11位，格式: 1[3-9]xxxxxxxxx)
String phone = TestDataBuilder.randomPhone();
// 结果: "13812345678"

// 邮箱
String email = TestDataBuilder.randomEmail();
// 结果: "test123@example.com"

// 地址
String address = TestDataBuilder.randomAddress();
// 结果: "北京市朝阳区xxx街道"
```

**网络信息：**

```java
// URL
String url = TestDataBuilder.randomUrl();
// 结果: "https://example.com/path"

// IP 地址
String ip = TestDataBuilder.randomIp();
// 结果: "192.168.1.100"
```

**基础类型：**

```java
// 随机字符串
String str = TestDataBuilder.randomString(20);

// 随机整数
int age = TestDataBuilder.randomInt(18, 60);

// 随机长整数
long id = TestDataBuilder.randomLong(1L, 1000000L);

// 随机布尔值
boolean flag = TestDataBuilder.randomBoolean();
```

**日期时间：**

```java
// 过去一年内的随机时间
LocalDateTime past = TestDataBuilder.randomDateTime();

// 过去 30 天内的随机时间
LocalDateTime recent = TestDataBuilder.randomDateTime(30);

// 未来 7 天内的随机时间
LocalDateTime future = TestDataBuilder.randomFutureDateTime(7);
```

**集合生成：**

```java
// 生成列表
List<String> names = TestDataBuilder.randomList(10, TestDataBuilder::randomUserName);

// 生成不重复集合
Set<String> emails = TestDataBuilder.randomSet(5, TestDataBuilder::randomEmail);
```

**业务常用：**

```java
// 随机 ID (1-1000000)
Long id = TestDataBuilder.randomId();

// 随机状态 ("0" 或 "1")
String status = TestDataBuilder.randomStatus();

// 随机删除标志
String delFlag = TestDataBuilder.randomDelFlag();
```

### 复杂对象生成

```java
@Test
void testBatchInsert() {
    // 生成 10 个测试用户
    List<SysUserBo> users = TestDataBuilder.randomList(10, () -> {
        SysUserBo user = new SysUserBo();
        user.setUserName(TestDataBuilder.randomUserName());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setPassword("123456");
        user.setStatus(TestDataBuilder.randomStatus());
        return user;
    });

    int count = userService.batchInsert(users);
    assertThat(count).isEqualTo(10);
}
```

## 测试配置

### TestConfig 配置类

TestConfig 提供测试目录和文件管理功能：

```java
import plus.ruoyi.common.test.config.TestConfig;

// 获取测试目录路径
String tempDir = TestConfig.getTEST_TEMP_DIR();
String outputDir = TestConfig.getTEST_OUTPUT_DIR();
String uploadDir = TestConfig.getTEST_UPLOAD_DIR();

// 获取测试文件路径
String filePath = TestConfig.getTempFilePath("test.txt");
String outputPath = TestConfig.getOutputFilePath("result.json");
String uploadPath = TestConfig.getUploadFilePath("image.png");

// 创建测试子目录
String subDir = TestConfig.createTestSubDir("custom-dir");
```

### 目录生命周期

测试基类自动管理目录生命周期：

```java
// 测试开始前 - 自动调用
TestConfig.initTestDirs();

// ... 测试执行 ...

// 测试结束后 - 自动调用
TestConfig.cleanTestDirs();
```

### 测试配置文件

创建 `src/test/resources/application-test.yml`：

```yaml
spring:
  # 使用内存数据库
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:testdb;MODE=MySQL
    username: sa
    password:

  # Redis 测试配置
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      database: 15  # 使用单独的测试库

  # 关闭不必要的功能
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration

# 日志配置
logging:
  level:
    plus.ruoyi: DEBUG
    org.springframework: WARN
```

### TestApplication 启动类

模块提供统一的测试启动类：

```java
@SpringBootApplication
public class TestApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
```

所有继承 `BaseSpringTest` 的测试类都会使用此启动类，无需在每个测试类中指定。

## 断言库使用

### AssertJ 断言（推荐）

RuoYi-Plus 推荐使用 AssertJ，提供流式 API：

```java
import static org.assertj.core.api.Assertions.*;

// 基本断言
assertThat(actual).isEqualTo(expected);
assertThat(actual).isNotNull();
assertThat(actual).isTrue();

// 字符串断言
assertThat(str).isNotBlank();
assertThat(str).startsWith("test");
assertThat(str).contains("user");
assertThat(str).matches("\\d+");

// 数字断言
assertThat(count).isGreaterThan(0);
assertThat(count).isLessThanOrEqualTo(100);
assertThat(count).isBetween(1, 10);

// 集合断言
assertThat(list).isNotEmpty();
assertThat(list).hasSize(5);
assertThat(list).contains("apple", "banana");
assertThat(list).doesNotContain("orange");
assertThat(list).allMatch(item -> item.length() > 0);

// 对象断言
assertThat(user)
    .isNotNull()
    .extracting("userName", "nickName")
    .containsExactly("admin", "管理员");

// 异常断言
assertThatThrownBy(() -> service.delete(null))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessage("ID不能为空");

// 软断言（收集所有失败）
SoftAssertions.assertSoftly(softly -> {
    softly.assertThat(user.getUserName()).isEqualTo("admin");
    softly.assertThat(user.getStatus()).isEqualTo("0");
    softly.assertThat(user.getEmail()).contains("@");
});
```

### JUnit 断言

```java
import static org.junit.jupiter.api.Assertions.*;

assertEquals(expected, actual);
assertNotNull(object);
assertTrue(condition);
assertFalse(condition);
assertThrows(Exception.class, () -> doSomething());
assertTimeout(Duration.ofSeconds(1), () -> slowMethod());
assertAll(
    () -> assertEquals(1, result.getCode()),
    () -> assertNotNull(result.getData())
);
```

## JUnit 5 注解

### 常用注解

```java
@DisplayName("测试类描述")
class MyTest {

    @BeforeAll
    static void beforeAll() {
        // 所有测试前执行一次（静态方法）
    }

    @BeforeEach
    void beforeEach() {
        // 每个测试方法前执行
    }

    @Test
    @DisplayName("测试方法描述")
    void testMethod() {
        // 测试逻辑
    }

    @AfterEach
    void afterEach() {
        // 每个测试方法后执行
    }

    @AfterAll
    static void afterAll() {
        // 所有测试后执行一次（静态方法）
    }
}
```

### 条件执行

```java
@Disabled("暂时禁用")
@Test
void disabledTest() { }

@EnabledOnOs(OS.WINDOWS)
@Test
void windowsOnly() { }

@EnabledIfEnvironmentVariable(named = "CI", matches = "true")
@Test
void ciOnly() { }

@EnabledIf("customCondition")
@Test
void conditionalTest() { }
```

### 重复和超时

```java
@RepeatedTest(3)
@DisplayName("重复测试 3 次")
void repeatedTest(RepetitionInfo info) {
    System.out.println("第 " + info.getCurrentRepetition() + " 次");
}

@Timeout(value = 2, unit = TimeUnit.SECONDS)
@Test
void timeoutTest() {
    // 超过 2 秒则测试失败
}
```

### 参数化测试

```java
@ParameterizedTest
@ValueSource(strings = {"apple", "banana", "orange"})
void testWithStrings(String fruit) {
    assertThat(fruit).isNotBlank();
}

@ParameterizedTest
@CsvSource({
    "1, 2, 3",
    "10, 20, 30",
    "100, 200, 300"
})
void testWithCsv(int a, int b, int expected) {
    assertThat(a + b).isEqualTo(expected);
}

@ParameterizedTest
@MethodSource("userProvider")
void testWithMethod(SysUser user) {
    assertThat(user.getUserName()).isNotBlank();
}

static Stream<SysUser> userProvider() {
    return Stream.of(
        new SysUser("admin", "管理员"),
        new SysUser("user", "普通用户")
    );
}
```

### 测试标签

```java
@Tag("fast")
@Test
void fastTest() { }

@Tag("slow")
@Test
void slowTest() { }

// Maven 运行指定标签
// mvn test -Dgroups=fast
// mvn test -DexcludedGroups=slow
```

## 最佳实践

### 1. 合理选择测试基类

```java
// ✅ 工具类 → BaseUnitTest（快速）
class StringUtilsTest extends BaseUnitTest { }

// ✅ 需要注入 → BaseSpringTest
class RedisUtilsTest extends BaseSpringTest { }

// ✅ Service 测试 → BaseServiceTest（事务回滚）
class UserServiceTest extends BaseServiceTest { }

// ✅ Controller 测试 → BaseControllerTest（真实 HTTP）
class UserControllerTest extends BaseControllerTest { }
```

### 2. 使用 @DisplayName 提高可读性

```java
// ✅ 好的命名
@Test
@DisplayName("当用户名为空时，应该抛出参数异常")
void shouldThrowExceptionWhenUserNameIsNull() { }

// ❌ 差的命名
@Test
void test1() { }
```

### 3. 避免硬编码测试数据

```java
// ✅ 使用 TestDataBuilder
String phone = TestDataBuilder.randomPhone();
String email = TestDataBuilder.randomEmail();

// ❌ 硬编码
String phone = "13800138000";
String email = "test@example.com";
```

### 4. 测试数据隔离

```java
// ✅ 每个测试独立准备数据
@Test
void test1() {
    SysUser user = createTestUser("test1");
    // 测试逻辑
}

@Test
void test2() {
    SysUser user = createTestUser("test2");
    // 测试逻辑
}

// ❌ 共享可变状态
private SysUser sharedUser; // 避免
```

### 5. 使用 AAA 模式

```java
@Test
void testAddUser() {
    // Arrange - 准备数据
    SysUserBo user = new SysUserBo();
    user.setUserName(TestDataBuilder.randomUserName());

    // Act - 执行操作
    Long userId = userService.insertUser(user);

    // Assert - 验证结果
    assertThat(userId).isNotNull();
    assertThat(userId).isGreaterThan(0);
}
```

### 6. 性能阈值配置

```java
// 对于慢测试，提高阈值
class SlowServiceTest extends BaseServiceTest {
    @Override
    protected long getPerformanceThreshold() {
        return 10000L; // 10 秒
    }
}

// 对于不关心性能的测试，禁用监控
class SimpleTest extends BaseUnitTest {
    @Override
    protected boolean isPerformanceMonitorEnabled() {
        return false;
    }
}
```

## 常见问题

### 1. Spring Bean 注入失败

**问题原因：**
- 使用了 `BaseUnitTest` 但需要 Bean 注入
- 测试类没有继承正确的基类

**解决方案：**

```java
// ✅ 需要 Bean 注入时使用 BaseSpringTest 或子类
class MyTest extends BaseSpringTest {
    @Autowired
    private MyService myService;
}
```

### 2. 测试污染数据库

**问题原因：**
- Service 测试没有使用 `BaseServiceTest`
- 没有事务回滚机制

**解决方案：**

```java
// ✅ Service 测试继承 BaseServiceTest
class UserServiceTest extends BaseServiceTest {
    @Test
    void testAdd() {
        userService.add(user);
        // 测试结束后自动回滚
    }
}
```

### 3. Controller 测试 404

**问题原因：**
- 请求路径错误
- Controller 没有被扫描到

**解决方案：**

```java
// 检查请求路径是否正确
HttpResponse response = doGet("/system/user/list");

// 确保 TestApplication 能扫描到 Controller
@SpringBootApplication(scanBasePackages = "plus.ruoyi")
public class TestApplication { }
```

### 4. 性能警告频繁出现

**问题原因：**
- 默认阈值 3 秒太小
- 测试方法确实较慢

**解决方案：**

```java
// 方案1: 提高阈值
@Override
protected long getPerformanceThreshold() {
    return 10000L;
}

// 方案2: 禁用性能监控
@Override
protected boolean isPerformanceMonitorEnabled() {
    return false;
}

// 方案3: 优化测试逻辑
```

### 5. 测试临时文件未清理

**问题原因：**
- 测试异常中断
- 禁用了目录管理

**解决方案：**

```java
// 使用 TestConfig 管理测试文件
String filePath = TestConfig.getOutputFilePath("test.txt");
// 测试结束后会自动清理

// 手动清理
TestConfig.cleanTestDirs();
```

### 6. 条件 Bean 注入失败

**问题原因：**
- 某些 Bean 在测试环境不存在（如 MQTT、RabbitMQ）

**解决方案：**

```java
@Autowired(required = false)
private MqttClientTemplate mqttClient;

@Test
void testMqtt() {
    if (mqttClient == null) {
        log.warn("⏭️ MQTT 未启用，跳过测试");
        return;
    }
    // 测试逻辑
}
```

### 7. 事务回滚不生效

**问题原因：**
- 继承了错误的基类
- 使用了 `@Transactional(propagation = NOT_SUPPORTED)`

**解决方案：**

```java
// ✅ 确保继承 BaseServiceTest
class MyServiceTest extends BaseServiceTest { }

// ❌ 错误
class MyServiceTest extends BaseSpringTest { }
```

## 子文档导航

本模块包含以下详细文档：

| 文档 | 说明 |
|------|------|
| [快速开始](./test/quick-start.md) | 测试模块快速入门指南 |
| [测试基础类](./test/base-classes.md) | 四个测试基类的详细说明 |
| [测试数据工厂](./test/test-data-factory.md) | TestDataBuilder 完整 API 参考 |

## 总结

ruoyi-common-test 模块提供了完整的测试支持体系：

1. **分层测试基类** - 针对不同场景提供专用基类
2. **测试数据工厂** - 快速生成随机测试数据
3. **性能监控** - 自动记录执行时间并警告
4. **事务回滚** - Service 测试不污染数据库
5. **目录管理** - 自动管理测试临时文件

通过合理使用这些功能，可以大幅提升测试代码的编写效率和质量。
