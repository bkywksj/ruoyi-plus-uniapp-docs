# 测试数据工厂

## 介绍

TestDataBuilder 是 RuoYi-Plus 提供的测试数据生成工具，基于 JavaFaker 实现，可以快速生成各种类型的随机测试数据，避免硬编码测试数据，提高测试代码的可维护性。

**核心特性:**

- **丰富的数据类型** - 支持姓名、手机、邮箱、地址等常用数据
- **中文支持** - 支持生成中文姓名、地址等
- **随机性** - 每次生成的数据都不同，避免数据冲突
- **易于使用** - 静态方法调用，无需实例化
- **可扩展** - 支持自定义数据生成器

## 基本用法

### 生成单个数据

```java
import plus.ruoyi.common.test.base.TestDataBuilder;

// 生成随机用户名
String userName = TestDataBuilder.randomUserName();
// 结果: "john.doe123"

// 生成中文姓名
String chineseName = TestDataBuilder.randomChineseName();
// 结果: "张伟"

// 生成手机号
String phone = TestDataBuilder.randomPhone();
// 结果: "13812345678"

// 生成邮箱
String email = TestDataBuilder.randomEmail();
// 结果: "test@example.com"
```

### 生成列表数据

```java
// 生成 10 个随机用户名
List<String> userNames = TestDataBuilder.randomList(10,
    TestDataBuilder::randomUserName);

// 生成 5 个随机手机号
List<String> phones = TestDataBuilder.randomList(5,
    TestDataBuilder::randomPhone);
```

### 生成复杂对象

```java
// 生成单个用户对象
SysUserBo user = createRandomUser();

// 生成 10 个用户对象
List<SysUserBo> users = TestDataBuilder.randomList(10,
    this::createRandomUser);

private SysUserBo createRandomUser() {
    SysUserBo user = new SysUserBo();
    user.setUserName(TestDataBuilder.randomUserName());
    user.setNickName(TestDataBuilder.randomChineseName());
    user.setEmail(TestDataBuilder.randomEmail());
    user.setPhone(TestDataBuilder.randomPhone());
    user.setPassword(TestDataBuilder.randomPassword());
    return user;
}
```

## API 参考

### 用户相关

| 方法 | 说明 | 示例结果 |
|------|------|---------|
| `randomUserName()` | 生成随机用户名 | `"john.doe123"` |
| `randomChineseName()` | 生成随机中文姓名 | `"张伟"` |
| `randomPassword()` | 生成随机密码(8-16位) | `"aB3$xY9z"` |

**使用示例:**

```java
String userName = TestDataBuilder.randomUserName();
String name = TestDataBuilder.randomChineseName();
String password = TestDataBuilder.randomPassword();
```

### 联系方式

| 方法 | 说明 | 示例结果 |
|------|------|---------|
| `randomPhone()` | 生成随机手机号(11位) | `"13812345678"` |
| `randomEmail()` | 生成随机邮箱 | `"test@example.com"` |
| `randomAddress()` | 生成随机地址 | `"北京市朝阳区xxx街道"` |

**使用示例:**

```java
String phone = TestDataBuilder.randomPhone();
String email = TestDataBuilder.randomEmail();
String address = TestDataBuilder.randomAddress();
```

### 公司相关

| 方法 | 说明 | 示例结果 |
|------|------|---------|
| `randomCompany()` | 生成随机公司名 | `"阿里巴巴科技有限公司"` |

**使用示例:**

```java
String company = TestDataBuilder.randomCompany();
```

### 网络相关

| 方法 | 说明 | 示例结果 |
|------|------|---------|
| `randomUrl()` | 生成随机 URL | `"https://example.com"` |
| `randomIp()` | 生成随机 IP 地址 | `"192.168.1.100"` |

**使用示例:**

```java
String url = TestDataBuilder.randomUrl();
String ip = TestDataBuilder.randomIp();
```

### 基础数据类型

| 方法 | 说明 | 示例 |
|------|------|------|
| `randomString(length)` | 生成指定长度的随机字符串 | `randomString(10)` → `"abcdefghij"` |
| `randomInt(min, max)` | 生成指定范围的随机整数 | `randomInt(1, 100)` → `42` |
| `randomLong(min, max)` | 生成指定范围的随机长整数 | `randomLong(1L, 1000L)` → `567L` |
| `randomBoolean()` | 生成随机布尔值 | `true` 或 `false` |

**使用示例:**

```java
String str = TestDataBuilder.randomString(20);
int age = TestDataBuilder.randomInt(18, 60);
long id = TestDataBuilder.randomLong(1L, 1000000L);
boolean status = TestDataBuilder.randomBoolean();
```

### 日期时间

| 方法 | 说明 | 示例 |
|------|------|------|
| `randomDateTime()` | 生成过去一年内的随机日期时间 | `randomDateTime()` |
| `randomDateTime(days)` | 生成过去指定天数内的随机日期时间 | `randomDateTime(30)` |
| `randomFutureDateTime(days)` | 生成未来指定天数内的随机日期时间 | `randomFutureDateTime(7)` |

**使用示例:**

```java
// 过去一年内
LocalDateTime pastDate = TestDataBuilder.randomDateTime();

// 过去 30 天内
LocalDateTime recent = TestDataBuilder.randomDateTime(30);

// 未来 7 天内
LocalDateTime futureDate = TestDataBuilder.randomFutureDateTime(7);
```

### 选择器

| 方法 | 说明 | 示例 |
|------|------|------|
| `randomChoice(items...)` | 从数组中随机选择一个元素 | `randomChoice("A", "B", "C")` |
| `randomChoice(list)` | 从列表中随机选择一个元素 | `randomChoice(list)` |

**使用示例:**

```java
// 从数组中选择
String type = TestDataBuilder.randomChoice("admin", "user", "guest");

// 从列表中选择
List<String> roles = Arrays.asList("管理员", "普通用户", "访客");
String role = TestDataBuilder.randomChoice(roles);
```

### 集合生成

| 方法 | 说明 | 示例 |
|------|------|------|
| `randomList(size, generator)` | 生成指定大小的随机列表 | `randomList(10, TestDataBuilder::randomUserName)` |
| `randomSet(size, generator)` | 生成指定大小的随机集合 | `randomSet(10, TestDataBuilder::randomEmail)` |

**使用示例:**

```java
// 生成 10 个用户名列表
List<String> userNames = TestDataBuilder.randomList(10,
    TestDataBuilder::randomUserName);

// 生成 5 个邮箱集合(去重)
Set<String> emails = TestDataBuilder.randomSet(5,
    TestDataBuilder::randomEmail);
```

### 业务常用

| 方法 | 说明 | 示例结果 |
|------|------|---------|
| `randomId()` | 生成随机 ID (1-1000000) | `123456L` |
| `randomStatus()` | 生成随机状态 ("0"或"1") | `"0"` 或 `"1"` |
| `randomDelFlag()` | 生成随机删除标志 | `"0"` 或 `"1"` |

**使用示例:**

```java
Long userId = TestDataBuilder.randomId();
String status = TestDataBuilder.randomStatus();
String delFlag = TestDataBuilder.randomDelFlag();
```

## 实战案例

### 案例1: Service 测试

```java
import plus.ruoyi.common.test.base.BaseServiceTest;
import plus.ruoyi.common.test.base.TestDataBuilder;

@DisplayName("用户服务测试")
class UserServiceTest extends BaseServiceTest {

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
        user.setPassword(TestDataBuilder.randomPassword());

        // 执行测试
        Long userId = userService.insertUser(user);

        // 断言
        assertThat(userId).isNotNull();
        assertThat(userId).isGreaterThan(0);
    }

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
    }
}
```

### 案例2: Controller 测试

```java
import plus.ruoyi.common.test.base.BaseControllerTest;
import plus.ruoyi.common.test.base.TestDataBuilder;

@DisplayName("广告接口测试")
class AdControllerTest extends BaseControllerTest {

    @Test
    @DisplayName("测试添加广告")
    void testAddAd() {
        // 构建请求数据
        Map<String, Object> ad = new HashMap<>();
        ad.put("adName", "广告-" + TestDataBuilder.randomString(10));
        ad.put("adUrl", TestDataBuilder.randomUrl());
        ad.put("adImage", TestDataBuilder.randomUrl() + "/image.jpg");
        ad.put("status", TestDataBuilder.randomStatus());

        // 发送请求
        HttpResponse response = doPost("/ad/add", toJson(ad));

        // 断言
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
```

### 案例3: 生成测试订单

```java
@Test
@DisplayName("测试订单创建")
void testCreateOrder() {
    // 生成订单数据
    OrderBo order = new OrderBo();
    order.setOrderNo("ORD" + System.currentTimeMillis());
    order.setUserId(TestDataBuilder.randomId());
    order.setUserName(TestDataBuilder.randomChineseName());
    order.setPhone(TestDataBuilder.randomPhone());
    order.setAddress(TestDataBuilder.randomAddress());
    order.setTotalAmount(TestDataBuilder.randomInt(100, 10000));
    order.setStatus(TestDataBuilder.randomChoice("待支付", "已支付", "已发货"));
    order.setCreateTime(TestDataBuilder.randomDateTime(30));

    // 执行测试
    Long orderId = orderService.createOrder(order);

    // 断言
    assertThat(orderId).isNotNull();
}
```

### 案例4: 生成测试文章

```java
@Test
@DisplayName("测试发布文章")
void testPublishArticle() {
    // 生成文章数据
    ArticleBo article = new ArticleBo();
    article.setTitle("文章-" + TestDataBuilder.randomString(20));
    article.setAuthor(TestDataBuilder.randomChineseName());
    article.setContent(TestDataBuilder.randomString(500));
    article.setTags(TestDataBuilder.randomList(3,
        () -> TestDataBuilder.randomChoice("技术", "生活", "旅游", "美食")));
    article.setPublishTime(TestDataBuilder.randomDateTime(7));

    // 执行测试
    Long articleId = articleService.publish(article);

    // 断言
    assertThat(articleId).isNotNull();
}
```

### 案例5: 生成测试日志

```java
@Test
@DisplayName("测试记录操作日志")
void testLogOperation() {
    // 生成 100 条操作日志
    List<OperLogBo> logs = TestDataBuilder.randomList(100, () -> {
        OperLogBo log = new OperLogBo();
        log.setTitle(TestDataBuilder.randomChoice("添加用户", "修改角色", "删除菜单"));
        log.setOperName(TestDataBuilder.randomChineseName());
        log.setOperIp(TestDataBuilder.randomIp());
        log.setOperTime(TestDataBuilder.randomDateTime(30));
        log.setStatus(TestDataBuilder.randomStatus());
        return log;
    });

    // 批量插入
    int count = operLogService.batchInsert(logs);

    // 断言
    assertThat(count).isEqualTo(100);
}
```

## 高级用法

### 自定义数据生成器

```java
// 自定义生成器 - 生成带前缀的用户名
private String generateUserNameWithPrefix() {
    return "test_" + TestDataBuilder.randomUserName();
}

// 使用自定义生成器
List<String> userNames = TestDataBuilder.randomList(10,
    this::generateUserNameWithPrefix);
```

### 生成符合业务规则的数据

```java
// 生成符合规则的订单号
private String generateOrderNo() {
    return "ORD" + System.currentTimeMillis() +
           TestDataBuilder.randomInt(1000, 9999);
}

// 生成符合规则的商品编码
private String generateProductCode() {
    String category = TestDataBuilder.randomChoice("A", "B", "C");
    int serial = TestDataBuilder.randomInt(10000, 99999);
    return category + serial;
}
```

### 组合使用

```java
@Test
@DisplayName("测试完整用户注册流程")
void testUserRegister() {
    // 组合使用多个数据生成方法
    RegisterBo register = new RegisterBo();
    register.setUserName(TestDataBuilder.randomUserName());
    register.setPassword(TestDataBuilder.randomPassword());
    register.setEmail(TestDataBuilder.randomEmail());
    register.setPhone(TestDataBuilder.randomPhone());
    register.setRealName(TestDataBuilder.randomChineseName());
    register.setAddress(TestDataBuilder.randomAddress());
    register.setCompany(TestDataBuilder.randomCompany());
    register.setRegisterIp(TestDataBuilder.randomIp());
    register.setRegisterTime(TestDataBuilder.randomDateTime());

    // 执行注册
    Long userId = userService.register(register);

    // 断言
    assertThat(userId).isNotNull();
}
```

## 最佳实践

### 1. 避免硬编码测试数据

```java
// ✅ 推荐: 使用 TestDataBuilder
String phone = TestDataBuilder.randomPhone();
String email = TestDataBuilder.randomEmail();

// ❌ 不推荐: 硬编码
String phone = "13800138000";
String email = "test@example.com";
```

### 2. 生成有意义的数据

```java
// ✅ 推荐: 生成符合业务规则的数据
SysUserBo user = new SysUserBo();
user.setUserName(TestDataBuilder.randomUserName());
user.setNickName(TestDataBuilder.randomChineseName());
user.setEmail(TestDataBuilder.randomEmail());

// ❌ 不推荐: 使用无意义的数据
user.setUserName("test");
user.setNickName("测试");
user.setEmail("test@test.com");
```

### 3. 批量生成时使用 Lambda

```java
// ✅ 推荐: 使用 Lambda 表达式
List<SysUserBo> users = TestDataBuilder.randomList(10, () -> {
    SysUserBo user = new SysUserBo();
    user.setUserName(TestDataBuilder.randomUserName());
    user.setEmail(TestDataBuilder.randomEmail());
    return user;
});

// ❌ 不推荐: 手动循环
List<SysUserBo> users = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    SysUserBo user = new SysUserBo();
    user.setUserName("test" + i);
    users.add(user);
}
```

### 4. 使用 randomChoice 模拟枚举

```java
// ✅ 推荐: 使用 randomChoice 选择状态
String status = TestDataBuilder.randomChoice("待审核", "已通过", "已拒绝");
String type = TestDataBuilder.randomChoice("A", "B", "C", "D");

// ❌ 不推荐: 固定值
String status = "待审核";
```

### 5. 生成时间范围数据

```java
// ✅ 推荐: 生成最近 30 天的数据
LocalDateTime createTime = TestDataBuilder.randomDateTime(30);

// ✅ 推荐: 生成未来 7 天的数据
LocalDateTime scheduleTime = TestDataBuilder.randomFutureDateTime(7);

// ❌ 不推荐: 使用固定时间
LocalDateTime createTime = LocalDateTime.now();
```

## 常见问题

### 1. 手机号格式不符合要求

TestDataBuilder 生成的手机号格式为 `1[3-9]xxxxxxxxx`，符合中国大陆手机号规范。

```java
String phone = TestDataBuilder.randomPhone();
// 示例: "13812345678", "15987654321"
```

### 2. 如何生成固定格式的数据

可以结合 TestDataBuilder 和自定义逻辑：

```java
// 生成固定前缀的用户名
String userName = "user_" + TestDataBuilder.randomString(8);

// 生成固定格式的订单号
String orderNo = "ORD" + System.currentTimeMillis();

// 生成固定范围的金额
int amount = TestDataBuilder.randomInt(100, 10000);
```

### 3. 如何避免数据重复

使用 `randomSet` 生成不重复的数据：

```java
// 生成 10 个不重复的邮箱
Set<String> emails = TestDataBuilder.randomSet(10,
    TestDataBuilder::randomEmail);

// 生成 5 个不重复的用户名
Set<String> userNames = TestDataBuilder.randomSet(5,
    TestDataBuilder::randomUserName);
```

### 4. 性能问题

JavaFaker 生成数据的性能较好，但大批量生成时可能较慢：

```java
// ✅ 小批量(< 1000)直接生成
List<String> names = TestDataBuilder.randomList(100,
    TestDataBuilder::randomChineseName);

// ⚠️ 大批量(> 10000)考虑性能
// 可以分批生成或使用更简单的数据
```

### 5. 中文数据质量

JavaFaker 的中文支持有限，生成的中文姓名可能不够真实：

```java
// 方案1: 使用 randomChineseName
String name = TestDataBuilder.randomChineseName();

// 方案2: 自定义中文姓名列表
String name = TestDataBuilder.randomChoice(
    "张三", "李四", "王五", "赵六"
);
```

## 总结

TestDataBuilder 提供了丰富的测试数据生成方法，可以：

1. <Ok/> 快速生成各种类型的测试数据
2. <Ok/> 避免硬编码测试数据
3. <Ok/> 提高测试代码的可维护性
4. <Ok/> 支持批量生成和自定义生成器
5. <Ok/> 生成符合业务规则的测试数据

通过合理使用 TestDataBuilder，可以大幅提升测试代码的编写效率！
