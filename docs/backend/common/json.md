# JSON处理模块

## 概述

JSON处理模块（`ruoyi-common-json`）提供了基于Jackson的JSON序列化和反序列化功能，主要解决以下问题：

- **JavaScript精度丢失**：大数值超出JavaScript安全整数范围时自动转换为字符串
- **时间格式统一**：提供统一的日期时间序列化格式
- **多格式日期解析**：支持多种日期格式的自动识别和解析
- **精度保持**：BigDecimal类型序列化为字符串避免精度问题

## 模块结构

```
ruoyi-common-json/
├── config/
│   └── JacksonConfig.java          # Jackson配置类
├── handler/
│   ├── BigNumberSerializer.java    # 大数值序列化器
│   └── CustomDateDeserializer.java # 自定义日期反序列化器
└── utils/
    └── JsonUtils.java              # JSON工具类
```

## 核心功能

### 1. 大数值处理

#### JavaScript精度问题

JavaScript中的Number类型采用IEEE 754双精度浮点数标准，安全整数范围为：
- **最大安全整数**：`9007199254740991` (2^53-1)
- **最小安全整数**：`-9007199254740991` (-(2^53-1))

超出此范围的整数在JavaScript中会丢失精度。

#### 解决方案

`BigNumberSerializer` 自动检测数值范围：

```java
@JacksonStdImpl
public class BigNumberSerializer extends NumberSerializer {
    private static final long MAX_SAFE_INTEGER = 9007199254740991L;
    private static final long MIN_SAFE_INTEGER = -9007199254740991L;

    @Override
    public void serialize(Number value, JsonGenerator gen, SerializerProvider provider) {
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

#### 序列化效果

```json
{
  "smallNumber": 123456,                    // 安全范围内，保持数值类型
  "bigNumber": "9007199254740992",          // 超出范围，转为字符串
  "bigInteger": "12345678901234567890",     // BigInteger 转为字符串
  "bigDecimal": "123.456789012345678901"    // BigDecimal 转为字符串保持精度
}
```

### 2. 时间类型处理

#### 统一时间格式

系统统一使用 `yyyy-MM-dd HH:mm:ss` 格式：

```java
// LocalDateTime 序列化配置
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(formatter));
javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(formatter));
```

#### 多格式日期解析

`CustomDateDeserializer` 支持多种日期格式自动识别：

```java
public class CustomDateDeserializer extends JsonDeserializer<Date> {
    @Override
    public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        return DateUtil.parse(p.getText()); // 基于Hutool的智能解析
    }
}
```

支持的格式包括：
- `yyyy-MM-dd HH:mm:ss`
- `yyyy-MM-dd`
- `yyyy/MM/dd HH:mm:ss`
- 时间戳（毫秒）
- 其他常见日期格式

### 3. JSON工具类

#### 基本用法

```java
// 对象转JSON字符串
User user = new User("张三", 25);
String json = JsonUtils.toJsonString(user);

// JSON字符串转对象
String json = "{\"name\":\"张三\",\"age\":25}";
User user = JsonUtils.parseObject(json, User.class);

// 复杂类型转换
String listJson = "[{\"name\":\"张三\"},{\"name\":\"李四\"}]";
List<User> users = JsonUtils.parseArray(listJson, User.class);
```

#### 高级用法

```java
// 泛型类型转换
String json = "{\"users\":[{\"name\":\"张三\"}],\"total\":1}";
TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {};
Map<String, Object> result = JsonUtils.parseObject(json, typeRef);

// 转换为Dict对象（Hutool增强Map）
Dict dict = JsonUtils.parseMap(json);
String name = dict.getStr("name");
Integer age = dict.getInt("age");

// JSON数组转Dict列表
String arrayJson = "[{\"name\":\"张三\"},{\"name\":\"李四\"}]";
List<Dict> dicts = JsonUtils.parseArrayMap(arrayJson);
```

#### 字节数组支持

```java
// 字节数组转对象
byte[] bytes = json.getBytes();
User user = JsonUtils.parseObject(bytes, User.class);
```

## 配置说明

### 自动配置

模块通过Spring Boot自动配置机制加载：

```java
@AutoConfiguration(before = JacksonAutoConfiguration.class)
public class JacksonConfig {
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer customizer() {
        // 配置逻辑
    }
}
```

配置文件：`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`

```
plus.ruoyi.common.json.config.JacksonConfig
```

### 应用配置

在 `application.yml` 中的相关配置：

```yaml
spring:
  # JSON序列化配置
  jackson:
    # 日期格式化
    date-format: yyyy-MM-dd HH:mm:ss
    serialization:
      # 格式化输出
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

## 使用示例

### 实体类定义

```java
@Data
public class OrderInfo {
    private Long id;                    // 可能超出JavaScript精度范围
    private String orderNo;
    private BigDecimal amount;          // 金额，需要保持精度
    private LocalDateTime createTime;   // 创建时间
    private Date updateTime;           // 更新时间
}
```

### 序列化结果

```java
OrderInfo order = new OrderInfo();
order.setId(9007199254740992L);           // 超出JavaScript安全范围
order.setOrderNo("ORD20250101001");
order.setAmount(new BigDecimal("99.99")); 
order.setCreateTime(LocalDateTime.now());
order.setUpdateTime(new Date());

String json = JsonUtils.toJsonString(order);
```

输出结果：
```json
{
  "id": "9007199254740992",               // 大数值转为字符串
  "orderNo": "ORD20250101001",
  "amount": "99.99",                      // BigDecimal保持精度
  "createTime": "2025-01-01 10:30:00",    // 统一时间格式
  "updateTime": "2025-01-01 10:30:00"     // 自动格式化
}
```

### 反序列化示例

```java
// 支持多种日期格式输入
String json1 = "{\"updateTime\":\"2025-01-01 10:30:00\"}";
String json2 = "{\"updateTime\":\"2025/01/01 10:30:00\"}";
String json3 = "{\"updateTime\":\"2025-01-01\"}";
String json4 = "{\"updateTime\":\"1704096600000\"}"; // 时间戳

// 都能正确解析
OrderInfo order1 = JsonUtils.parseObject(json1, OrderInfo.class);
OrderInfo order2 = JsonUtils.parseObject(json2, OrderInfo.class);
OrderInfo order3 = JsonUtils.parseObject(json3, OrderInfo.class);
OrderInfo order4 = JsonUtils.parseObject(json4, OrderInfo.class);
```

## 注意事项

### 1. 精度处理

- 超出JavaScript安全整数范围的Long/BigInteger会被序列化为字符串
- BigDecimal始终序列化为字符串以保持精度
- 前端接收时需要相应处理字符串形式的数值

### 2. 日期处理

- 系统统一使用 `yyyy-MM-dd HH:mm:ss` 格式
- 反序列化支持多种格式自动识别
- 使用系统默认时区

### 3. 异常处理

工具类中的所有IOException都被包装为RuntimeException：

```java
try {
    return OBJECT_MAPPER.readValue(text, clazz);
} catch (IOException e) {
    throw new RuntimeException(e);
}
```

### 4. 空值处理

- `toJsonString(null)` 返回 `null`
- `parseObject("", Class)` 返回 `null`
- `parseArray("", Class)` 返回空列表

## 依赖信息

### Maven坐标

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-json</artifactId>
    <version>${revision}</version>
</dependency>
```

### 核心依赖

```xml
<!-- Jackson数据绑定 -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>

<!-- Jackson JSR310支持 -->
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
</dependency>
```

## 扩展指南

### 自定义序列化器

如需要自定义序列化行为，可以仿照 `BigNumberSerializer` 实现：

```java
public class CustomSerializer extends JsonSerializer<YourType> {
    @Override
    public void serialize(YourType value, JsonGenerator gen, SerializerProvider serializers) 
            throws IOException {
        // 自定义序列化逻辑
    }
}

// 在JacksonConfig中注册
javaTimeModule.addSerializer(YourType.class, new CustomSerializer());
```

### 自定义反序列化器

```java
public class CustomDeserializer extends JsonDeserializer<YourType> {
    @Override
    public YourType deserialize(JsonParser p, DeserializationContext ctxt) 
            throws IOException {
        // 自定义反序列化逻辑
        return new YourType();
    }
}

// 注册反序列化器
javaTimeModule.addDeserializer(YourType.class, new CustomDeserializer());
```

## 总结

JSON处理模块通过合理的配置和自定义处理器，有效解决了以下关键问题：

1. **精度安全**：防止大数值在前后端传输过程中丢失精度
2. **格式统一**：提供统一的时间格式和灵活的解析能力
3. **易用性**：封装简洁的工具类，简化JSON操作
4. **扩展性**：支持自定义序列化器，满足特殊需求

该模块是系统中处理JSON数据的核心组件，为前后端数据交互提供了可靠的基础支撑。
