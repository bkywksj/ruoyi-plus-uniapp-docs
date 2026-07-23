# 测试基础类

## 介绍

RuoYi-Plus 提供了四个测试基类，采用分层设计，每个基类针对不同的测试场景提供专门的功能支持。通过继承合适的基类，可以快速编写高质量的测试代码。

**测试基类层次:**

```text
BaseUnitTest (单元测试基类)
    ↓ 继承
BaseSpringTest (Spring 测试基类)
    ↓ 继承
BaseServiceTest (Service 测试基类)

BaseSpringTest (Spring 测试基类)
    ↓ 继承
BaseControllerTest (Controller 测试基类)
```

## BaseUnitTest - 单元测试基类

### 适用场景

- <Ok/> 工具类测试 (`StringUtils`, `DateUtils` 等)
- <Ok/> 枚举类测试
- <Ok/> POJO 测试 (DTO, VO, Entity)
- <Ok/> 算法逻辑测试
- <No/> 不适合需要依赖注入的测试

### 核心特性

- **极快启动** - 不启动 Spring 容器，启动时间 < 1 秒
- **性能监控** - 自动记录每个测试方法的执行时间
- **性能警告** - 执行时间超过阈值时输出警告
- **测试目录管理** - 自动创建和清理测试临时文件
- **扩展点** - 提供 `setUp()` 和 `tearDown()` 方法

### 基本用法

```java
import plus.ruoyi.common.test.base.BaseUnitTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("StringUtils 工具类测试")
class StringUtilsTest extends BaseUnitTest {

    @Test
    @DisplayName("测试 isBlank 方法")
    void testIsBlank() {
        assertThat(StringUtils.isBlank(null)).isTrue();
        assertThat(StringUtils.isBlank("")).isTrue();
        assertThat(StringUtils.isBlank("   ")).isTrue();
        assertThat(StringUtils.isBlank("hello")).isFalse();
    }

    @Test
    @DisplayName("测试 format 方法")
    void testFormat() {
        String result = StringUtils.format("Hello, {}!", "World");
        assertThat(result).isEqualTo("Hello, World!");
    }
}
```

**测试输出:**
```text
▶ 开始测试: 测试 isBlank 方法
✓ 测试 isBlank 方法 完成,耗时: 8ms
▶ 开始测试: 测试 format 方法
✓ 测试 format 方法 完成,耗时: 5ms
```

### 自定义性能阈值

```java
@DisplayName("复杂算法测试")
class ComplexAlgorithmTest extends BaseUnitTest {

    // 自定义性能阈值为 5 秒
    @Override
    protected long getPerformanceThreshold() {
        return 5000L;
    }

    @Test
    @DisplayName("测试复杂排序算法")
    void testComplexSort() {
        // 执行复杂算法
        List<Integer> result = ComplexSorter.sort(largeList);

        // 如果超过 5 秒,会输出性能警告
        assertThat(result).isSorted();
    }
}
```

**性能警告输出:**
```text
⚠️ 性能警告: 测试复杂排序算法 执行时间 6543ms 超过阈值 5000ms
```

### 禁用性能监控

```java
class SimpleTest extends BaseUnitTest {

    // 禁用性能监控
    @Override
    protected boolean isPerformanceMonitorEnabled() {
        return false;
    }

    @Test
    void testMethod() {
        // 不会输出性能信息
    }
}
```

### 使用 setUp 和 tearDown

```java
@DisplayName("数据处理测试")
class DataProcessorTest extends BaseUnitTest {

    private DataProcessor processor;
    private List<String> testData;

    @Override
    protected void setUp() {
        // 每个测试方法执行前调用
        processor = new DataProcessor();
        testData = Arrays.asList("data1", "data2", "data3");
        System.out.println("测试数据准备完成");
    }

    @Override
    protected void tearDown() {
        // 每个测试方法执行后调用
        processor = null;
        testData = null;
        System.out.println("测试数据清理完成");
    }

    @Test
    void testProcess() {
        List<String> result = processor.process(testData);
        assertThat(result).hasSize(3);
    }
}
```

## BaseSpringTest - Spring 测试基类

### 适用场景

- <Ok/> 需要 `@Autowired` 注入 Bean 的测试
- <Ok/> 需要 Spring 配置的测试
- <Ok/> 集成测试 (但不测试 HTTP 接口)
- <No/> 不适合纯单元测试 (使用 `BaseUnitTest` 更快)

### 核心特性

- **轻量级 Spring 容器** - 不启动 Web 容器 (Tomcat/Jetty)
- **依赖注入支持** - 可以使用 `@Autowired` 注入 Bean
- **性能优化** - 比完整 SpringBootTest 快 30%-50%
- **继承 BaseUnitTest** - 拥有性能监控和测试目录管理功能
- **测试环境隔离** - 使用 `@ActiveProfiles("test")` 激活测试配置

### 基本用法

```java
import plus.ruoyi.common.test.base.BaseSpringTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("Redis 工具测试")
class RedisUtilsTest extends BaseSpringTest {

    @Autowired
    private RedisUtils redisUtils;

    @Test
    @DisplayName("测试 Redis 读写")
    void testRedisSetAndGet() {
        // 写入数据
        redisUtils.set("test:key", "test_value");

        // 读取数据
        String value = redisUtils.get("test:key");

        // 断言
        assertThat(value).isEqualTo("test_value");

        // 清理数据
        redisUtils.del("test:key");
    }
}
```

### 条件注入测试

有些 Bean 可能在测试环境中不存在(如 MQTT、RabbitMQ 等)，可以使用 `required = false`:

```java
@DisplayName("MQTT 客户端测试")
class MqttClientTest extends BaseSpringTest {

    @Autowired(required = false)
    private MqttClientTemplate mqttClient;

    @Test
    @DisplayName("测试发布消息")
    void testPublish() {
        // 检查 Bean 是否存在
        if (mqttClient == null) {
            log.warn("⏭️ MQTT 未启用,跳过测试");
            return;
        }

        // 执行测试
        mqttClient.publish("test/topic", "Hello MQTT");
    }
}
```

### 测试配置文件

创建 `src/test/resources/application-test.yml`:

```yaml
spring:
  # 使用内存数据库
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:testdb
    username: sa
    password:

  # Redis 配置
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      database: 15  # 使用单独的测试库

# 日志配置
logging:
  level:
    plus.ruoyi: DEBUG
```

## BaseServiceTest - Service 测试基类

### 适用场景

- <Ok/> Service 层业务逻辑测试
- <Ok/> 需要真实数据库操作的测试
- <Ok/> 需要事务回滚的测试
- <No/> 不适合 Controller 接口测试 (使用 `BaseControllerTest`)

### 核心特性

- **继承 BaseSpringTest** - 拥有 Spring 容器和性能监控功能
- **事务自动回滚** - 测试方法执行后自动回滚，不污染数据库
- **真实数据库操作** - 可以执行 INSERT、UPDATE、DELETE 等操作
- **支持 Mock** - 可以 Mock 外部依赖

### 基本用法

```java
import plus.ruoyi.common.test.base.BaseServiceTest;
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
        // 准备测试数据
        SysUserBo user = new SysUserBo();
        user.setUserName("test_user");
        user.setNickName("测试用户");
        user.setPassword("123456");
        user.setEmail("test@example.com");

        // 执行业务逻辑
        Long userId = userService.insertUser(user);

        // 断言验证
        assertThat(userId).isNotNull();
        assertThat(userId).isGreaterThan(0);

        // 查询验证
        SysUserVo savedUser = userService.selectUserById(userId);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getUserName()).isEqualTo("test_user");

        // 测试结束后自动回滚,数据不会真正保存到数据库
    }

    @Test
    @DisplayName("测试更新用户")
    void testUpdateUser() {
        // 先查询一个用户
        SysUserVo user = userService.selectUserById(1L);
        assertThat(user).isNotNull();

        // 修改数据
        SysUserBo updateUser = new SysUserBo();
        updateUser.setUserId(user.getUserId());
        updateUser.setNickName("新昵称");

        // 执行更新
        int rows = userService.updateUser(updateUser);

        // 断言
        assertThat(rows).isEqualTo(1);

        // 验证更新结果
        SysUserVo updatedUser = userService.selectUserById(1L);
        assertThat(updatedUser.getNickName()).isEqualTo("新昵称");

        // 测试结束后自动回滚
    }

    @Test
    @DisplayName("测试删除用户")
    void testDeleteUser() {
        // 先添加一个测试用户
        SysUserBo user = new SysUserBo();
        user.setUserName("to_delete");
        user.setNickName("待删除用户");
        user.setPassword("123456");
        Long userId = userService.insertUser(user);

        // 执行删除
        int rows = userService.deleteUserById(userId);

        // 断言
        assertThat(rows).isEqualTo(1);

        // 验证删除结果
        SysUserVo deletedUser = userService.selectUserById(userId);
        assertThat(deletedUser).isNull();

        // 测试结束后自动回滚
    }
}
```

### 使用测试数据工厂

```java
import plus.ruoyi.common.test.base.TestDataBuilder;

@Test
@DisplayName("测试批量添加用户")
void testBatchInsert() {
    // 生成 10 个测试用户
    List<SysUserBo> users = TestDataBuilder.randomList(10, () -> {
        SysUserBo user = new SysUserBo();
        user.setUserName(TestDataBuilder.randomUserName());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setPassword("123456");
        return user;
    });

    // 批量插入
    int count = userService.batchInsert(users);

    // 断言
    assertThat(count).isEqualTo(10);

    // 测试结束后自动回滚
}
```

### 异常测试

```java
@Test
@DisplayName("测试用户名重复异常")
void testDuplicateUserName() {
    // 准备测试数据
    SysUserBo user1 = new SysUserBo();
    user1.setUserName("duplicate_user");
    user1.setNickName("用户1");
    user1.setPassword("123456");

    // 添加第一个用户
    userService.insertUser(user1);

    // 尝试添加同名用户
    SysUserBo user2 = new SysUserBo();
    user2.setUserName("duplicate_user");
    user2.setNickName("用户2");
    user2.setPassword("123456");

    // 断言抛出异常
    assertThatThrownBy(() -> userService.insertUser(user2))
        .isInstanceOf(ServiceException.class)
        .hasMessageContaining("用户名已存在");
}
```

## BaseControllerTest - Controller 测试基类

### 适用场景

- <Ok/> Controller 接口测试
- <Ok/> 完整请求流程测试 (包括拦截器、过滤器)
- <Ok/> HTTP 接口测试
- <Ok/> OpenAPI 接口测试 (支持自定义请求头)
- <No/> 不适合纯业务逻辑测试 (使用 `BaseServiceTest` 更快)

### 核心特性

- **继承 BaseSpringTest** - 拥有 Spring 容器和性能监控功能
- **启动 Web 容器** - 使用随机端口启动完整 Web 容器
- **真实 HTTP 请求** - 使用 Hutool HttpRequest 发送真实请求
- **便捷方法** - 提供 `doGet`, `doPost`, `doPut`, `doDelete` 方法
- **自定义请求头** - 支持添加自定义 Header (如签名、Token)

### 基本用法

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

        // 断言
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(code).isEqualTo(200);
    }

    @Test
    @DisplayName("测试获取单个用户")
    void testGetUserById() {
        // 发送 GET 请求
        HttpResponse response = doGet("/system/user/1");

        // 解析响应
        String body = response.body();

        // 断言
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(body).contains("userName");
    }

    @Test
    @DisplayName("测试添加用户")
    void testAddUser() {
        // 构建请求体
        String requestBody = """
            {
                "userName": "test_user",
                "nickName": "测试用户",
                "password": "123456",
                "email": "test@example.com"
            }
            """;

        // 发送 POST 请求
        HttpResponse response = doPost("/system/user", requestBody);

        // 断言
        assertThat(response.getStatus()).isEqualTo(200);

        String body = response.body();
        int code = JSONUtil.parseObj(body).getInt("code");
        assertThat(code).isEqualTo(200);
    }

    @Test
    @DisplayName("测试更新用户")
    void testUpdateUser() {
        // 构建请求体
        String requestBody = """
            {
                "userId": 1,
                "nickName": "新昵称"
            }
            """;

        // 发送 PUT 请求
        HttpResponse response = doPut("/system/user", requestBody);

        // 断言
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    @DisplayName("测试删除用户")
    void testDeleteUser() {
        // 发送 DELETE 请求
        HttpResponse response = doDelete("/system/user/100");

        // 断言
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
```

### 自定义请求头

```java
@Test
@DisplayName("测试 OpenAPI 接口(带签名)")
void testOpenApiWithSign() {
    // 构建请求体
    String requestBody = """
        {
            "adName": "测试广告"
        }
        """;

    // 自定义请求头
    Map<String, String> headers = Map.of(
        "X-App-Key", "test-app-key",
        "X-Timestamp", String.valueOf(System.currentTimeMillis()),
        "X-Sign", "calculated-signature"
    );

    // 发送 POST 请求
    HttpResponse response = doPost("/openapi/ad/add", requestBody, headers);

    // 断言
    assertThat(response.getStatus()).isEqualTo(200);
}
```

### 使用对象作为请求体

```java
@Test
@DisplayName("测试添加用户(使用对象)")
void testAddUserWithObject() {
    // 构建用户对象
    SysUserBo user = new SysUserBo();
    user.setUserName("test_user");
    user.setNickName("测试用户");
    user.setPassword("123456");

    // 发送 POST 请求(对象自动序列化为 JSON)
    HttpResponse response = doPost("/system/user", user);

    // 断言
    assertThat(response.getStatus()).isEqualTo(200);
}
```

### 解析响应数据

```java
@Test
@DisplayName("测试获取用户详情")
void testGetUserDetail() {
    // 发送 GET 请求
    HttpResponse response = doGet("/system/user/1");

    // 解析响应为对象
    String body = response.body();
    SysUserVo user = fromJson(
        JSONUtil.parseObj(body).getStr("data"),
        SysUserVo.class
    );

    // 断言
    assertThat(user).isNotNull();
    assertThat(user.getUserId()).isEqualTo(1L);
    assertThat(user.getUserName()).isNotBlank();
}
```

## 测试基类对比

| 基类 | Spring容器 | Web容器 | 事务回滚 | 启动速度 | 适用场景 |
|------|-----------|---------|---------|---------|---------|
| `BaseUnitTest` | 否 | 否 | 否 | <Icon icon="lucide:zap" /><Icon icon="lucide:zap" /><Icon icon="lucide:zap" /> | 工具类、POJO、算法 |
| `BaseSpringTest` | 是 | 否 | 否 | <Icon icon="lucide:zap" /><Icon icon="lucide:zap" /> | 需要依赖注入的测试 |
| `BaseServiceTest` | 是 | 否 | 是 | <Icon icon="lucide:zap" /><Icon icon="lucide:zap" /> | Service 业务逻辑 |
| `BaseControllerTest` | 是 | 是 | 否 | <Icon icon="lucide:zap" /> | Controller 接口 |

## 最佳实践

### 1. 根据场景选择基类

```java
// ✅ 工具类 → BaseUnitTest
class StringUtilsTest extends BaseUnitTest { }

// ✅ 需要注入 → BaseSpringTest
class RedisUtilsTest extends BaseSpringTest { }

// ✅ Service 测试 → BaseServiceTest
class UserServiceTest extends BaseServiceTest { }

// ✅ Controller 测试 → BaseControllerTest
class UserControllerTest extends BaseControllerTest { }
```

### 2. 性能优化

```java
// ✅ 对于慢测试，提高阈值避免警告
@Override
protected long getPerformanceThreshold() {
    return 10000L; // 10秒
}

// ✅ 对于不关心性能的测试，禁用监控
@Override
protected boolean isPerformanceMonitorEnabled() {
    return false;
}
```

### 3. 测试数据隔离

```java
// ✅ 每个测试独立准备数据
@Test
void test1() {
    SysUser user = new SysUser();
    user.setUserName("test1");
    // ...
}

// ❌ 不要在多个测试间共享可变数据
private SysUser sharedUser; // 避免这样做
```

## 常见问题

### 1. 何时使用哪个基类？

**BaseUnitTest:**
- 测试不需要 Spring 容器
- 测试执行速度要求高
- 纯逻辑测试

**BaseSpringTest:**
- 需要注入 Bean
- 不需要 Web 环境
- 不需要事务回滚

**BaseServiceTest:**
- 测试 Service 层
- 需要数据库操作
- 需要事务回滚

**BaseControllerTest:**
- 测试 Controller 接口
- 需要完整的 HTTP 请求流程
- 测试拦截器、过滤器

### 2. 性能警告如何处理？

```java
// 方案1: 提高阈值
@Override
protected long getPerformanceThreshold() {
    return 5000L;
}

// 方案2: 禁用监控
@Override
protected boolean isPerformanceMonitorEnabled() {
    return false;
}

// 方案3: 优化测试逻辑
```

### 3. 事务回滚不生效？

确保使用了 `BaseServiceTest`:

```java
// ✅ 正确
class MyServiceTest extends BaseServiceTest { }

// ❌ 错误
class MyServiceTest extends BaseSpringTest { }
```

## 总结

RuoYi-Plus 提供的四个测试基类，各司其职：

- **BaseUnitTest** - 快速、轻量的单元测试
- **BaseSpringTest** - 带依赖注入的集成测试
- **BaseServiceTest** - 带事务回滚的 Service 测试
- **BaseControllerTest** - 完整的 HTTP 接口测试

选择合适的基类，可以让测试更高效、更可靠！
