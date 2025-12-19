# JSON处理模块

## 概述

JSON处理模块（`ruoyi-common-json`）提供了基于Jackson的JSON序列化和反序列化功能，是整个框架中处理JSON数据的核心组件。该模块主要解决以下问题：

- **JavaScript精度丢失**: 大数值超出JavaScript安全整数范围时自动转换为字符串
- **时间格式统一**: 提供统一的日期时间序列化格式
- **多格式日期解析**: 支持多种日期格式的自动识别和解析
- **精度保持**: BigDecimal类型序列化为字符串避免精度问题
- **JSON格式校验**: 提供 `@JsonPattern` 注解校验字符串是否为合法JSON

## 核心特性

- **大数值序列化**: 自动检测数值范围，超出安全范围转为字符串
- **时间类型统一**: 统一使用 `yyyy-MM-dd HH:mm:ss` 格式
- **智能日期解析**: 基于Hutool支持多种日期格式自动识别
- **JSON工具类**: 封装常用JSON操作，支持泛型和复杂类型
- **参数校验注解**: `@JsonPattern` 注解校验JSON格式
- **Spring Boot集成**: 自动配置，开箱即用

## 模块结构

```
ruoyi-common-json/
├── pom.xml                                    # Maven配置文件
├── src/main/java/plus/ruoyi/common/json/
│   ├── config/
│   │   └── JsonAutoConfiguration.java         # Jackson自动配置类
│   ├── handler/
│   │   ├── BigNumberSerializer.java           # 大数值序列化器
│   │   └── CustomDateDeserializer.java        # 自定义日期反序列化器
│   ├── utils/
│   │   └── JsonUtils.java                     # JSON工具类
│   └── validate/
│       ├── JsonPattern.java                   # JSON校验注解
│       ├── JsonType.java                      # JSON类型枚举
│       └── JsonPatternValidator.java          # JSON校验器实现
├── src/test/java/plus/ruoyi/common/json/
│   └── utils/
│       └── JsonUtilsTest.java                 # 单元测试
└── src/main/resources/META-INF/
    └── spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 依赖关系

### Maven依赖

```xml
<dependencies>
    <!-- 内部模块依赖 -->
    <!-- 核心模块 - 提供基础功能支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <!-- JSON处理依赖 -->
    <!-- Jackson数据绑定 - 核心JSON处理库 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>

    <!-- Jackson JSR310支持 - 提供Java 8日期时间类型的序列化支持 -->
    <dependency>
        <groupId>com.fasterxml.jackson.datatype</groupId>
        <artifactId>jackson-datatype-jsr310</artifactId>
    </dependency>

    <!-- 测试依赖 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    ruoyi-common-json                        │
├─────────────────────────────────────────────────────────────┤
│  JsonAutoConfiguration   JsonUtils   @JsonPattern          │
│         │                    │            │                 │
│         ▼                    ▼            ▼                 │
│  ┌──────────────┐    ┌──────────────┐ ┌─────────────┐      │
│  │ BigNumber    │    │ ObjectMapper │ │  Validator  │      │
│  │ Serializer   │    │   (Spring)   │ │   (JSR380)  │      │
│  └──────────────┘    └──────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │      ruoyi-common-core       │
          │  (StringUtils, ObjectUtils)  │
          └──────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │        Jackson + Hutool      │
          │  (序列化 + 日期解析)          │
          └──────────────────────────────┘
```

## 核心组件

### 1. 自动配置类 (JsonAutoConfiguration)

负责Jackson ObjectMapper的自定义配置，在Spring Boot的Jackson自动配置之前执行：

```java
@Slf4j
@AutoConfiguration(before = JacksonAutoConfiguration.class)
public class JsonAutoConfiguration {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer customizer() {
        return builder -> {
            // 创建 Java 时间模块
            JavaTimeModule javaTimeModule = new JavaTimeModule();

            // 配置大数值序列化器，避免 JavaScript 精度丢失
            javaTimeModule.addSerializer(Long.class, BigNumberSerializer.INSTANCE);
            javaTimeModule.addSerializer(Long.TYPE, BigNumberSerializer.INSTANCE);
            javaTimeModule.addSerializer(BigInteger.class, BigNumberSerializer.INSTANCE);

            // BigDecimal 序列化为字符串，保持精度
            javaTimeModule.addSerializer(BigDecimal.class, ToStringSerializer.instance);

            // 配置 LocalDateTime 格式
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            javaTimeModule.addSerializer(LocalDateTime.class,
                new LocalDateTimeSerializer(formatter));
            javaTimeModule.addDeserializer(LocalDateTime.class,
                new LocalDateTimeDeserializer(formatter));

            // 配置 Date 类型反序列化器，支持多种日期格式
            javaTimeModule.addDeserializer(Date.class, new CustomDateDeserializer());

            // 应用模块配置
            builder.modules(javaTimeModule);
            // 设置默认时区
            builder.timeZone(TimeZone.getDefault());

            log.info("初始化 jackson 配置");
        };
    }
}
```

**配置特性:**

| 特性 | 说明 |
|------|------|
| 加载顺序 | 在 Spring Boot JacksonAutoConfiguration 之前加载 |
| Long类型 | 超出安全范围时序列化为字符串 |
| BigInteger | 始终序列化为字符串 |
| BigDecimal | 始终序列化为字符串（保持精度） |
| LocalDateTime | 格式化为 `yyyy-MM-dd HH:mm:ss` |
| Date | 支持多种格式智能解析 |
| 时区 | 使用系统默认时区 |

### 2. 大数值序列化器 (BigNumberSerializer)

解决JavaScript数值精度丢失问题：

```java
@JacksonStdImpl
public class BigNumberSerializer extends NumberSerializer {

    /**
     * JavaScript 最大安全整数: 2^53 - 1
     * 对应 Number.MAX_SAFE_INTEGER
     */
    private static final long MAX_SAFE_INTEGER = 9007199254740991L;

    /**
     * JavaScript 最小安全整数: -(2^53 - 1)
     * 对应 Number.MIN_SAFE_INTEGER
     */
    private static final long MIN_SAFE_INTEGER = -9007199254740991L;

    /**
     * 全局单例实例
     */
    public static final BigNumberSerializer INSTANCE = new BigNumberSerializer(Number.class);

    public BigNumberSerializer(Class<? extends Number> rawType) {
        super(rawType);
    }

    @Override
    public void serialize(Number value, JsonGenerator gen, SerializerProvider provider)
            throws IOException {
        // 判断是否在 JavaScript 安全整数范围内
        if (value.longValue() > MIN_SAFE_INTEGER && value.longValue() < MAX_SAFE_INTEGER) {
            // 在安全范围内，使用数值类型
            super.serialize(value, gen, provider);
        } else {
            // 超出安全范围，序列化为字符串
            gen.writeString(value.toString());
        }
    }
}
```

**JavaScript安全整数说明:**

JavaScript的Number类型采用IEEE 754双精度浮点数标准：

| 类型 | 值 | 说明 |
|------|-----|------|
| MAX_SAFE_INTEGER | `9007199254740991` | 2^53 - 1 |
| MIN_SAFE_INTEGER | `-9007199254740991` | -(2^53 - 1) |

超出此范围的整数在JavaScript中会丢失精度，例如：
```javascript
// JavaScript 中的精度问题
9007199254740992 === 9007199254740993  // true (精度丢失)
```

**序列化效果对比:**

```json
{
  "smallId": 123456,                    // 安全范围内，保持数值类型
  "bigId": "9007199254740992",          // 超出范围，转为字符串
  "bigInteger": "12345678901234567890", // BigInteger 转为字符串
  "amount": "123.456789012345678901"    // BigDecimal 转为字符串保持精度
}
```

### 3. 自定义日期反序列化器 (CustomDateDeserializer)

支持多种日期格式的智能解析：

```java
public class CustomDateDeserializer extends JsonDeserializer<Date> {

    @Override
    public Date deserialize(JsonParser p, DeserializationContext ctxt)
            throws IOException {
        // 基于 Hutool DateUtil 的智能日期解析
        DateTime parse = DateUtil.parse(p.getText());
        if (ObjectUtils.isNull(parse)) {
            return null;
        }
        return parse.toJdkDate();
    }
}
```

**支持的日期格式:**

| 格式示例 | 说明 |
|---------|------|
| `2025-01-01 10:30:00` | 标准日期时间格式 |
| `2025-01-01` | 仅日期 |
| `2025/01/01 10:30:00` | 斜杠分隔 |
| `2025/01/01` | 斜杠仅日期 |
| `20250101` | 纯数字日期 |
| `1704096600000` | 毫秒时间戳 |
| `Jan 1, 2025` | 英文格式 |
| 其他常见格式 | Hutool自动识别 |

### 4. JSON工具类 (JsonUtils)

封装常用JSON操作的工具类：

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class JsonUtils {

    /**
     * 全局 ObjectMapper 实例，从 Spring 容器中获取
     */
    private static final ObjectMapper OBJECT_MAPPER = SpringUtils.getBean(ObjectMapper.class);

    /**
     * 获取 ObjectMapper 实例
     */
    public static ObjectMapper getObjectMapper() {
        return OBJECT_MAPPER;
    }

    /**
     * 对象序列化为JSON字符串
     */
    public static String toJsonString(Object object) {
        if (ObjectUtil.isNull(object)) {
            return null;
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * JSON字符串反序列化为对象
     */
    public static <T> T parseObject(String text, Class<T> clazz) {
        if (StringUtils.isEmpty(text)) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(text, clazz);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 字节数组反序列化为对象
     */
    public static <T> T parseObject(byte[] bytes, Class<T> clazz) {
        if (ArrayUtil.isEmpty(bytes)) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(bytes, clazz);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 复杂类型反序列化（支持泛型）
     */
    public static <T> T parseObject(String text, TypeReference<T> typeReference) {
        if (StringUtils.isBlank(text)) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(text, typeReference);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * JSON字符串解析为Dict对象
     */
    public static Dict parseMap(String text) {
        if (StringUtils.isBlank(text)) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(text,
                OBJECT_MAPPER.getTypeFactory().constructType(Dict.class));
        } catch (MismatchedInputException e) {
            return null;  // 类型不匹配说明不是JSON格式
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * JSON数组解析为Dict列表
     */
    public static List<Dict> parseArrayMap(String text) {
        if (StringUtils.isBlank(text)) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(text,
                OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, Dict.class));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * JSON数组解析为指定类型列表
     */
    public static <T> List<T> parseArray(String text, Class<T> clazz) {
        if (StringUtils.isEmpty(text)) {
            return new ArrayList<>();
        }
        try {
            return OBJECT_MAPPER.readValue(text,
                OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, clazz));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 判断字符串是否为合法JSON
     */
    public static boolean isJson(String str) {
        if (StringUtils.isBlank(str)) {
            return false;
        }
        try {
            OBJECT_MAPPER.readTree(str);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断是否为JSON对象 ({})
     */
    public static boolean isJsonObject(String str) {
        if (StringUtils.isBlank(str)) {
            return false;
        }
        try {
            JsonNode node = OBJECT_MAPPER.readTree(str);
            return node.isObject();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断是否为JSON数组 ([])
     */
    public static boolean isJsonArray(String str) {
        if (StringUtils.isBlank(str)) {
            return false;
        }
        try {
            JsonNode node = OBJECT_MAPPER.readTree(str);
            return node.isArray();
        } catch (Exception e) {
            return false;
        }
    }
}
```

**API方法一览:**

| 方法 | 说明 | 返回值 |
|------|------|-------|
| `toJsonString(Object)` | 对象转JSON字符串 | JSON字符串或null |
| `parseObject(String, Class)` | JSON转对象 | 对象或null |
| `parseObject(byte[], Class)` | 字节数组转对象 | 对象或null |
| `parseObject(String, TypeReference)` | JSON转复杂类型 | 对象或null |
| `parseMap(String)` | JSON转Dict | Dict或null |
| `parseArrayMap(String)` | JSON数组转Dict列表 | Dict列表或null |
| `parseArray(String, Class)` | JSON数组转对象列表 | 对象列表（空时返回空列表） |
| `isJson(String)` | 判断是否为合法JSON | boolean |
| `isJsonObject(String)` | 判断是否为JSON对象 | boolean |
| `isJsonArray(String)` | 判断是否为JSON数组 | boolean |

### 5. JSON校验注解 (@JsonPattern)

提供参数校验时的JSON格式验证：

```java
@Documented
@Target({ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = JsonPatternValidator.class)
public @interface JsonPattern {

    /**
     * 限制JSON类型，默认为ANY（对象或数组都允许）
     */
    JsonType type() default JsonType.ANY;

    /**
     * 校验失败时的提示消息
     */
    String message() default "不是有效的 JSON 格式";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

**JsonType枚举:**

```java
public enum JsonType {

    /**
     * JSON对象，例如 {"a":1}
     */
    OBJECT,

    /**
     * JSON数组，例如 [1,2,3]
     */
    ARRAY,

    /**
     * 任意JSON类型
     */
    ANY
}
```

**校验器实现:**

```java
public class JsonPatternValidator implements ConstraintValidator<JsonPattern, String> {

    private JsonType jsonType;

    @Override
    public void initialize(JsonPattern annotation) {
        this.jsonType = annotation.type();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (StringUtils.isBlank(value)) {
            // 交给 @NotBlank 或 @NotNull 控制是否允许为空
            return true;
        }
        // 根据JSON类型进行不同的校验
        return switch (jsonType) {
            case ANY -> JsonUtils.isJson(value);
            case OBJECT -> JsonUtils.isJsonObject(value);
            case ARRAY -> JsonUtils.isJsonArray(value);
        };
    }
}
```

## 使用指南

### 1. 模块引入

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-json</artifactId>
</dependency>
```

### 2. 基本使用

```java
// 对象转JSON字符串
User user = new User("张三", 25);
String json = JsonUtils.toJsonString(user);
// 输出: {"name":"张三","age":25}

// JSON字符串转对象
String json = "{\"name\":\"张三\",\"age\":25}";
User user = JsonUtils.parseObject(json, User.class);

// JSON数组转对象列表
String listJson = "[{\"name\":\"张三\"},{\"name\":\"李四\"}]";
List<User> users = JsonUtils.parseArray(listJson, User.class);
```

### 3. 复杂类型转换

```java
// 泛型类型转换
String json = "{\"code\":0,\"data\":{\"name\":\"张三\"}}";
TypeReference<R<User>> typeRef = new TypeReference<R<User>>() {};
R<User> result = JsonUtils.parseObject(json, typeRef);

// 转换为Dict对象（Hutool增强Map）
Dict dict = JsonUtils.parseMap(json);
String name = dict.getStr("name");
Integer age = dict.getInt("age");

// JSON数组转Dict列表
String arrayJson = "[{\"name\":\"张三\"},{\"name\":\"李四\"}]";
List<Dict> dicts = JsonUtils.parseArrayMap(arrayJson);
```

### 4. JSON格式校验

```java
// 校验任意JSON格式
@Data
public class ConfigRequest {

    @NotBlank(message = "配置内容不能为空")
    @JsonPattern(message = "配置内容必须是有效的JSON格式")
    private String configJson;
}

// 校验必须是JSON对象
@Data
public class RuleRequest {

    @NotBlank
    @JsonPattern(type = JsonType.OBJECT, message = "规则必须是JSON对象格式")
    private String rule;
}

// 校验必须是JSON数组
@Data
public class BatchRequest {

    @NotBlank
    @JsonPattern(type = JsonType.ARRAY, message = "批量数据必须是JSON数组格式")
    private String items;
}
```

### 5. JSON格式判断

```java
// 判断是否为合法JSON
boolean isValid = JsonUtils.isJson("{\"name\":\"张三\"}");  // true
boolean isValid2 = JsonUtils.isJson("not a json");           // false

// 判断是否为JSON对象
boolean isObj = JsonUtils.isJsonObject("{\"name\":\"张三\"}"); // true
boolean isObj2 = JsonUtils.isJsonObject("[1,2,3]");            // false

// 判断是否为JSON数组
boolean isArr = JsonUtils.isJsonArray("[1,2,3]");              // true
boolean isArr2 = JsonUtils.isJsonArray("{\"a\":1}");           // false
```

### 6. 实体类示例

```java
@Data
public class OrderInfo {
    private Long id;                    // 可能超出JavaScript精度范围
    private String orderNo;
    private BigDecimal amount;          // 金额，需要保持精度
    private LocalDateTime createTime;   // 创建时间
    private Date updateTime;            // 更新时间
}
```

**序列化结果:**

```java
OrderInfo order = new OrderInfo();
order.setId(9007199254740992L);           // 超出JavaScript安全范围
order.setOrderNo("ORD20250101001");
order.setAmount(new BigDecimal("99.99"));
order.setCreateTime(LocalDateTime.now());
order.setUpdateTime(new Date());

String json = JsonUtils.toJsonString(order);
```

输出:
```json
{
  "id": "9007199254740992",
  "orderNo": "ORD20250101001",
  "amount": "99.99",
  "createTime": "2025-01-01 10:30:00",
  "updateTime": "2025-01-01 10:30:00"
}
```

### 7. 反序列化多种日期格式

```java
// 支持多种日期格式输入
String json1 = "{\"updateTime\":\"2025-01-01 10:30:00\"}";
String json2 = "{\"updateTime\":\"2025/01/01 10:30:00\"}";
String json3 = "{\"updateTime\":\"2025-01-01\"}";
String json4 = "{\"updateTime\":\"1704096600000\"}";  // 时间戳

// 都能正确解析
OrderInfo order1 = JsonUtils.parseObject(json1, OrderInfo.class);
OrderInfo order2 = JsonUtils.parseObject(json2, OrderInfo.class);
OrderInfo order3 = JsonUtils.parseObject(json3, OrderInfo.class);
OrderInfo order4 = JsonUtils.parseObject(json4, OrderInfo.class);
```

## 配置说明

### 自动配置

模块通过Spring Boot自动配置机制加载：

```
# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
plus.ruoyi.common.json.config.JsonAutoConfiguration
```

### 应用配置

在 `application.yml` 中的相关配置：

```yaml
spring:
  # JSON序列化配置
  jackson:
    # 日期格式化（被模块覆盖）
    date-format: yyyy-MM-dd HH:mm:ss
    serialization:
      # 格式化输出（生产环境建议关闭）
      indent_output: false
      # 忽略无法转换的对象
      fail_on_empty_beans: false
    deserialization:
      # 允许对象忽略json中不存在的属性
      fail_on_unknown_properties: false
  mvc:
    format:
      # 日期时间格式
      date-time: yyyy-MM-dd HH:mm:ss
```

## 最佳实践

### 1. 前端处理大数值

后端返回的大数值已转为字符串，前端需要相应处理：

```typescript
// TypeScript 接口定义
interface Order {
  id: string;          // 大数值作为字符串接收
  orderNo: string;
  amount: string;      // BigDecimal 作为字符串接收
  createTime: string;
}

// 使用时转换
const orderId = BigInt(order.id);           // 使用 BigInt 处理大数值
const amount = parseFloat(order.amount);     // 金额转为浮点数
```

### 2. 避免精度丢失的最佳实践

```java
@Data
public class FinancialData {
    // 推荐：金额字段使用 BigDecimal
    private BigDecimal amount;

    // 推荐：ID字段如果可能超出安全范围，使用 Long
    private Long orderId;

    // 不推荐：金额使用 double
    // private double amount;
}
```

### 3. 日期处理最佳实践

```java
@Data
public class TimeEntity {
    // 推荐：使用 LocalDateTime（Java 8+）
    private LocalDateTime createTime;

    // 兼容：旧系统的 Date 类型
    private Date updateTime;

    // 不推荐：使用字符串存储日期
    // private String createTimeStr;
}
```

### 4. JSON校验与@NotNull组合使用

```java
@Data
public class ConfigRequest {

    // 必填 + JSON格式校验
    @NotNull(message = "配置不能为空", groups = AddGroup.class)
    @JsonPattern(type = JsonType.OBJECT, message = "配置必须是JSON对象")
    private String configJson;

    // 选填 + JSON格式校验（为空时不校验JSON格式）
    @JsonPattern(type = JsonType.ARRAY, message = "标签必须是JSON数组")
    private String tags;
}
```

### 5. 获取ObjectMapper进行高级操作

```java
@Service
public class AdvancedJsonService {

    public JsonNode parseToTree(String json) {
        try {
            return JsonUtils.getObjectMapper().readTree(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public String prettyPrint(Object obj) {
        try {
            return JsonUtils.getObjectMapper()
                .writerWithDefaultPrettyPrinter()
                .writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
```

## 常见问题

### Q1: 为什么Long类型有时是数值有时是字符串？

**原因:** BigNumberSerializer会根据数值大小自动判断：
- 在安全范围内（±9007199254740991）: 保持数值类型
- 超出安全范围: 转为字符串

**解决方案:** 前端统一使用字符串类型接收，或使用BigInt处理。

### Q2: 如何全部Long都转为字符串？

如果需要所有Long都转为字符串，可以自定义配置：

```java
@Configuration
public class CustomJsonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer alwaysStringForLong() {
        return builder -> {
            SimpleModule module = new SimpleModule();
            // 所有Long都序列化为字符串
            module.addSerializer(Long.class, ToStringSerializer.instance);
            module.addSerializer(Long.TYPE, ToStringSerializer.instance);
            builder.modules(module);
        };
    }
}
```

### Q3: 日期格式解析失败怎么办？

**原因:** 输入的日期格式不在Hutool支持范围内。

**解决方案:**
1. 使用标准格式 `yyyy-MM-dd HH:mm:ss`
2. 使用时间戳（毫秒）
3. 自定义反序列化器

```java
public class CustomDateDeserializer extends JsonDeserializer<Date> {
    @Override
    public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        // 自定义解析逻辑
        return parseDate(text);
    }
}
```

### Q4: JSON校验注解不生效？

**检查项:**
1. 确保启用了参数校验：`@Validated` 注解
2. 确保字段不为空（@JsonPattern对空值返回true）
3. 检查是否正确引入了依赖

```java
@RestController
@Validated  // 必须添加
public class ConfigController {

    @PostMapping("/save")
    public R<Void> save(@Valid @RequestBody ConfigRequest request) {
        // ...
    }
}
```

### Q5: 如何处理循环引用？

```java
@Data
public class Parent {
    private String name;

    @JsonManagedReference  // 父对象标注
    private List<Child> children;
}

@Data
public class Child {
    private String name;

    @JsonBackReference  // 子对象标注
    private Parent parent;
}
```

## 注意事项

### 1. 空值处理

| 方法 | 输入为null/空 | 返回值 |
|------|-------------|-------|
| `toJsonString(null)` | null | `null` |
| `parseObject("", Class)` | 空字符串 | `null` |
| `parseArray("", Class)` | 空字符串 | `[]`（空列表） |
| `parseMap("")` | 空字符串 | `null` |

### 2. 异常处理

所有IOException都被包装为RuntimeException：

```java
try {
    return OBJECT_MAPPER.readValue(text, clazz);
} catch (IOException e) {
    throw new RuntimeException(e);  // 包装为运行时异常
}
```

### 3. 线程安全

- `JsonUtils` 使用Spring管理的单例 `ObjectMapper`
- `ObjectMapper` 是线程安全的
- 可以放心在多线程环境使用

### 4. 性能考虑

- 避免频繁创建ObjectMapper实例
- 使用 `JsonUtils.getObjectMapper()` 获取共享实例
- 大量JSON处理时考虑使用流式API
