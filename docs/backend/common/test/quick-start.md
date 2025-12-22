# 快速开始

## 介绍

RuoYi-Plus 提供了完整的测试支持框架，基于 JUnit 5 构建，提供了一套开箱即用的测试基类和工具，帮助开发者快速编写单元测试和集成测试。

**核心特性:**

- **分层测试基类** - 针对不同测试场景提供专用基类
- **自动性能监控** - 自动记录测试执行时间并发出性能警告
- **事务自动回滚** - Service 测试自动回滚，不污染数据库
- **HTTP 测试支持** - 内置 HTTP 请求工具，测试 Controller 接口
- **测试数据工厂** - 快速生成测试数据，基于 JavaFaker
- **测试目录管理** - 自动管理测试临时文件和目录

## 环境要求

| 项目 | 要求 | 说明 |
|------|------|------|
| Java | 17+ | JUnit 5 要求 |
| Spring Boot | 3.5.6 | 框架版本 |
| JUnit | 5.10.5 | 测试框架 |
| AssertJ | 3.27.3 | 断言库 |

## 第一步：添加依赖

在需要测试的模块 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-test</artifactId>
    <scope>test</scope>
</dependency>
```

## 第二步：选择测试基类

根据测试场景选择合适的基类：

| 基类 | 启动 Spring | 启动 Web | 事务回滚 | 适用场景 |
|------|------------|----------|---------|---------|
| `BaseUnitTest` | ❌ | ❌ | ❌ | 工具类、POJO、算法 |
| `BaseSpringTest` | ✅ | ❌ | ❌ | 需要依赖注入的测试 |
| `BaseServiceTest` | ✅ | ❌ | ✅ | Service 层业务逻辑 |
| `BaseControllerTest` | ✅ | ✅ | ❌ | Controller 接口测试 |

## 第三步：编写第一个测试

### 单元测试示例

```java
import plus.ruoyi.common.test.base.BaseUnitTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("工具类测试")
class StringUtilsTest extends BaseUnitTest {

    @Test
    @DisplayName("测试字符串非空判断")
    void testIsNotBlank() {
        // 准备测试数据
        String text = "Hello";

        // 执行测试
        boolean result = StringUtils.isNotBlank(text);

        // 断言验证
        assertThat(result).isTrue();
    }
}
```

**测试输出:**
```
▶ 开始测试: 测试字符串非空判断
✓ 测试字符串非空判断 完成,耗时: 5ms
```

### Service 测试示例

```java
import plus.ruoyi.common.test.base.BaseServiceTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("用户服务测试")
class UserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试添加用户")
    void testAddUser() {
        // 准备测试数据
        SysUserBo user = new SysUserBo();
        user.setUserName("test_user");
        user.setNickName("测试用户");
        user.setPassword("123456");

        // 执行业务逻辑
        Long userId = userService.insertUser(user);

        // 断言验证
        assertThat(userId).isNotNull();
        assertThat(userId).isGreaterThan(0);

        // 测试结束后自动回滚,数据不会真正保存到数据库
    }
}
```

### Controller 测试示例

```java
import plus.ruoyi.common.test.base.BaseControllerTest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

@DisplayName("用户接口测试")
class UserControllerTest extends BaseControllerTest {

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

## 第四步：使用测试数据工厂

```java
import plus.ruoyi.common.test.base.TestDataBuilder;

@Test
@DisplayName("测试批量添加用户")
void testBatchAddUser() {
    // 快速生成 10 个测试用户
    List<SysUserBo> users = TestDataBuilder.randomList(10, () -> {
        SysUserBo user = new SysUserBo();
        user.setUserName(TestDataBuilder.randomUserName());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        return user;
    });

    // 批量插入
    int count = userService.batchInsert(users);

    // 断言
    assertThat(count).isEqualTo(10);
}
```

## 第五步：运行测试

### 使用 IDE 运行

在 IDEA 中右键点击测试类或测试方法，选择 "Run" 即可。

### 使用 Maven 运行

```bash
# 运行所有测试
mvn test

# 运行指定测试类
mvn test -Dtest=UserServiceTest

# 运行指定测试方法
mvn test -Dtest=UserServiceTest#testAddUser

# 跳过测试
mvn clean install -DskipTests
```

## 常用断言

### AssertJ 断言库

RuoYi-Plus 推荐使用 AssertJ，提供流式 API 和丰富的断言：

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

// 数字断言
assertThat(count).isGreaterThan(0);
assertThat(count).isLessThanOrEqualTo(100);
assertThat(count).isBetween(1, 10);

// 集合断言
assertThat(list).isNotEmpty();
assertThat(list).hasSize(5);
assertThat(list).contains("apple", "banana");
assertThat(list).doesNotContain("orange");

// 对象断言
assertThat(user)
    .isNotNull()
    .extracting("userName", "nickName")
    .containsExactly("admin", "管理员");

// 异常断言
assertThatThrownBy(() -> service.delete(null))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessage("ID不能为空");
```

### JUnit 断言

```java
import static org.junit.jupiter.api.Assertions.*;

assertEquals(expected, actual);
assertNotNull(object);
assertTrue(condition);
assertFalse(condition);
assertThrows(Exception.class, () -> doSomething());
```

## JUnit 5 常用注解

```java
import org.junit.jupiter.api.*;

@DisplayName("测试类名称")  // 设置测试类的显示名称
class MyTest {

    @BeforeAll
    static void beforeAll() {
        // 所有测试前执行一次(静态方法)
    }

    @BeforeEach
    void beforeEach() {
        // 每个测试方法前执行
    }

    @Test
    @DisplayName("测试方法名称")
    void testMethod() {
        // 测试方法
    }

    @RepeatedTest(3)
    @DisplayName("重复测试 3 次")
    void repeatedTest() {
        // 重复执行 3 次
    }

    @Disabled("暂时禁用")
    @Test
    void disabledTest() {
        // 此测试会被跳过
    }

    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    @Test
    void timeoutTest() {
        // 超过 2 秒则测试失败
    }

    @AfterEach
    void afterEach() {
        // 每个测试方法后执行
    }

    @AfterAll
    static void afterAll() {
        // 所有测试后执行一次(静态方法)
    }
}
```

## 最佳实践

### 1. 合理选择测试基类

```java
// ✅ 工具类使用 BaseUnitTest (快速、轻量)
class StringUtilsTest extends BaseUnitTest { }

// ✅ Service 使用 BaseServiceTest (事务回滚)
class UserServiceTest extends BaseServiceTest { }

// ✅ Controller 使用 BaseControllerTest (真实 HTTP)
class UserControllerTest extends BaseControllerTest { }
```

### 2. 使用 @DisplayName 增加可读性

```java
// ✅ 好的示例
@Test
@DisplayName("当用户名为空时,应该抛出参数异常")
void shouldThrowExceptionWhenUserNameIsNull() { }

// ❌ 不好的示例
@Test
void test1() { }
```

### 3. 测试数据隔离

```java
// ✅ 每个测试方法独立准备数据
@Test
void testMethod1() {
    SysUser user = new SysUser();
    user.setUserName("test1");
    // 测试逻辑
}

@Test
void testMethod2() {
    SysUser user = new SysUser();
    user.setUserName("test2");
    // 测试逻辑
}
```

### 4. 使用测试数据工厂

```java
// ✅ 使用 TestDataBuilder
String phone = TestDataBuilder.randomPhone();
String email = TestDataBuilder.randomEmail();

// ❌ 硬编码测试数据
String phone = "13800138000";
String email = "test@example.com";
```

### 5. 性能监控

```java
class SlowServiceTest extends BaseServiceTest {

    // 自定义性能阈值
    @Override
    protected long getPerformanceThreshold() {
        return 5000L; // 5秒
    }

    @Test
    void testSlowOperation() {
        // 如果超过 5 秒,会输出性能警告
        service.slowMethod();
    }
}
```

## 常见问题

### 1. Spring Bean 注入失败

**原因:**
- 使用了 `BaseUnitTest` 但需要注入 Bean
- 测试类没有继承正确的基类

**解决方案:**
```java
// ✅ 需要 Bean 注入时使用 BaseSpringTest
class MyTest extends BaseSpringTest {

    @Autowired
    private MyService myService;

    @Test
    void test() {
        myService.doSomething();
    }
}
```

### 2. 测试污染数据库

**原因:**
- Service 测试没有使用 `BaseServiceTest`
- 没有事务回滚机制

**解决方案:**
```java
// ✅ Service 测试继承 BaseServiceTest
class UserServiceTest extends BaseServiceTest {

    @Test
    void testAdd() {
        // 测试结束后自动回滚
        userService.add(user);
    }
}
```

### 3. Controller 测试 404

**原因:**
- 请求路径错误
- Controller 没有被扫描到

**解决方案:**
```java
// ✅ 检查请求路径
HttpResponse response = doGet("/system/user/list");

// ✅ 确保 TestApplication 能扫描到 Controller
@SpringBootApplication(scanBasePackages = "plus.ruoyi")
public class TestApplication { }
```

### 4. 性能警告频繁出现

**原因:**
- 默认阈值 3 秒太小
- 测试方法确实较慢

**解决方案:**
```java
// 方案1: 提高阈值
@Override
protected long getPerformanceThreshold() {
    return 10000L; // 10秒
}

// 方案2: 关闭性能监控
@Override
protected boolean isPerformanceMonitorEnabled() {
    return false;
}
```

### 5. 测试临时文件未清理

**原因:**
- 测试异常中断
- 禁用了目录管理

**解决方案:**
```java
// ✅ 使用 TestConfig 管理测试文件
String filePath = TestConfig.getOutputFilePath("test.txt");

// 测试结束后会自动清理
```

## 总结

通过本文档，你已经学会了：

1. ✅ 添加测试依赖
2. ✅ 选择合适的测试基类
3. ✅ 编写单元测试和集成测试
4. ✅ 使用测试数据工厂
5. ✅ 运行和调试测试
6. ✅ 使用断言库进行验证
7. ✅ 最佳实践和问题排查

现在你可以在项目中编写高质量的测试代码了！
