# MQTT 客户端模块

物联网消息通信能力 - 基于 mica-mqtt 2.5.7 提供高性能 MQTT 客户端功能

## 模块简介

`ruoyi-common-mqtt` 模块集成了 Dromara 开源社区的 [mica-mqtt](https://github.com/dromara/mica-mqtt),提供开箱即用的 MQTT 客户端功能,适用于物联网设备通信、实时数据采集、消息推送等场景。

### 核心特性

- **高性能**: 基于 t-io 异步非阻塞,支持百万级并发连接
- **客户端模式**: 仅 Client 模式,连接外部 MQTT Broker (EMQX/Mosquitto等)
- **协议支持**: MQTT v3.1/v3.1.1/v5.0 完整支持
- **QoS 0/1/2**: 三种服务质量等级,灵活选择
- **自动订阅**: 支持配置文件自动订阅主题
- **遗嘱消息**: 支持 Last Will 异常断线通知
- **保留消息**: 支持 Retained Message 持久化
- **SSL/TLS**: 支持加密连接
- **集群部署**: 支持共享订阅实现负载均衡
- **多租户支持**: 通过 Topic 前缀实现租户隔离

::: warning 重要说明
本模块**不包含**内置 MQTT Broker,需要连接外部 MQTT 服务器 (如 EMQX、Mosquitto)。
:::

## 模块架构

### 整体架构

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     ruoyi-common-mqtt 模块架构                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Application Layer                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │ DeviceService│  │ SensorService│  │ MessageService│        │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │   │
│  └─────────┼────────────────┼────────────────┼──────────────────┘   │
│            │                │                │                      │
│  ┌─────────┴────────────────┴────────────────┴──────────────────┐   │
│  │                    MqttClientTemplate                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │  publish()  │  │  subQos*()  │  │ unSubscribe()│          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │                   Listener Layer                              │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐         │   │
│  │  │  ConnectListener     │  │  MessageListener      │         │   │
│  │  │  (连接/断开事件)       │  │  (消息接收处理)        │         │   │
│  │  └──────────────────────┘  └──────────────────────┘         │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │                   mica-mqtt-client                            │   │
│  │           基于 t-io 的高性能 MQTT 客户端                        │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │              External MQTT Broker                              │   │
│  │     ┌─────────┐  ┌─────────┐  ┌─────────┐                    │   │
│  │     │  EMQX   │  │Mosquitto│  │  HiveMQ │                    │   │
│  │     └─────────┘  └─────────┘  └─────────┘                    │   │
│  └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 模块依赖

```xml
<dependencies>
    <!-- 核心模块 - 提供基础功能支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <!-- Redis模块 - 提供分布式消息支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- JSON模块 - 提供消息序列化支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-json</artifactId>
    </dependency>

    <!-- mica-mqtt Client - 提供高性能MQTT客户端 -->
    <dependency>
        <groupId>org.dromara.mica-mqtt</groupId>
        <artifactId>mica-mqtt-client-spring-boot-starter</artifactId>
        <version>${mica-mqtt.version}</version>
    </dependency>
</dependencies>
```

### 核心类结构

| 类名 | 说明 |
|------|------|
| `MqttAutoConfiguration` | 自动配置类,注册默认监听器 |
| `DefaultMqttClientConnectListener` | 默认连接监听器,处理连接/断开事件 |
| `DefaultMqttClientMessageListener` | 默认消息监听器,处理接收消息 |
| `MqttClientTemplate` | MQTT 客户端模板类 (mica-mqtt 提供) |

## 快速开始

### 1. 准备外部 MQTT Broker

**方式1: Docker 快速启动 EMQX (推荐)**

```bash
# 启动 EMQX (包含 Web 管理界面)
docker run -d --name emqx \
  -p 1883:1883 \
  -p 18083:18083 \
  emqx/emqx:latest

# 访问管理界面: http://localhost:18083
# 默认账号: admin / public
```

**方式2: Docker 启动 Mosquitto**

```bash
# 启动 Mosquitto (轻量级)
docker run -d --name mosquitto \
  -p 1883:1883 \
  eclipse-mosquitto:latest
```

**方式3: 使用公共测试服务器**

```yaml
mqtt:
  client:
    ip: broker.emqx.io  # 公共测试 Broker
    port: 1883
```

### 2. 添加依赖

在需要使用 MQTT 的模块 `pom.xml` 中添加:

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mqtt</artifactId>
</dependency>
```

### 3. 配置文件

在 `application-dev.yml` 中配置:

```yaml
mqtt:
  client:
    enabled: true  # 启用 MQTT 客户端
    ip: 127.0.0.1  # MQTT Broker 地址
    port: 1883     # MQTT Broker 端口
    username: admin  # 用户名 (如果 Broker 需要认证)
    password: public  # 密码 (如果 Broker 需要认证)
    client-id: ${spring.application.name}-${random.value}  # 客户端 ID
    version: MQTT_5  # 协议版本: MQTT_3_1 / MQTT_3_1_1 / MQTT_5
    clean-start: true  # 是否清除会话

    # 全局订阅主题 (可选)
    global-subscribe:
      - topic: /device/+/status  # + 是单级通配符
        qos: QOS1
      - topic: /device/#  # # 是多级通配符
        qos: QOS1
```

::: tip 配置说明
- `+`: 单级通配符,匹配任意一个层级
- `#`: 多级通配符,匹配任意多个层级(必须在末尾)
- QoS 值必须是枚举: `QOS0`, `QOS1`, `QOS2`
:::

### 4. 发送消息

```java
import org.dromara.mica.mqtt.spring.client.MqttClientTemplate;
import org.dromara.mica.mqtt.codec.MqttQoS;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final MqttClientTemplate mqttClientTemplate;

    /**
     * 发送设备状态 (默认 QoS 0)
     */
    public void sendDeviceStatus(String deviceId, String status) {
        String topic = "/device/" + deviceId + "/status";
        mqttClientTemplate.publish(topic, status.getBytes());
    }

    /**
     * 发送 JSON 数据 (指定 QoS 1)
     */
    public void sendDeviceData(String deviceId, String jsonData) {
        String topic = "/device/" + deviceId + "/data";
        mqttClientTemplate.publish(topic, jsonData.getBytes(), MqttQoS.QOS1);
    }

    /**
     * 发送保留消息 (新订阅者会立即收到)
     */
    public void sendDeviceConfig(String deviceId, String config) {
        String topic = "/device/" + deviceId + "/config";
        mqttClientTemplate.publish(topic, config.getBytes(), MqttQoS.QOS1, true);
    }
}
```

### 5. 接收消息

**创建全局消息监听器** (处理所有订阅的消息)

```java
package plus.ruoyi.business.mqtt;

import lombok.extern.slf4j.Slf4j;
import org.dromara.mica.mqtt.codec.message.MqttPublishMessage;
import org.dromara.mica.mqtt.core.client.IMqttClientGlobalMessageListener;
import org.springframework.stereotype.Component;
import org.tio.core.ChannelContext;

import java.nio.charset.StandardCharsets;

/**
 * 自定义 MQTT 全局消息监听器
 * 注意: 创建此 Bean 会覆盖默认的 DefaultMqttClientMessageListener
 */
@Slf4j
@Component
public class MyMqttMessageListener implements IMqttClientGlobalMessageListener {

    @Override
    public void onMessage(ChannelContext context, String topic, MqttPublishMessage message, byte[] payload) {
        String payloadStr = new String(payload, StandardCharsets.UTF_8);

        log.info("========================================");
        log.info("MQTT 消息接收");
        log.info("Topic: {}", topic);
        log.info("QoS: {}", message.fixedHeader().qosLevel());
        log.info("Payload: {}", payloadStr);
        log.info("========================================");

        // 根据 topic 分发到不同的业务处理逻辑
        if (topic.startsWith("/device/")) {
            handleDeviceMessage(topic, payloadStr);
        } else if (topic.startsWith("/system/")) {
            handleSystemMessage(topic, payloadStr);
        }
    }

    /**
     * 处理设备消息
     */
    private void handleDeviceMessage(String topic, String payload) {
        // TODO: 解析 payload,更新设备状态到数据库
        log.info("处理设备消息 - Topic: {}, Payload: {}", topic, payload);
    }

    /**
     * 处理系统消息
     */
    private void handleSystemMessage(String topic, String payload) {
        // TODO: 处理系统通知
        log.info("处理系统消息 - Topic: {}, Payload: {}", topic, payload);
    }
}
```

## 自动配置

### MqttAutoConfiguration

模块提供了自动配置类,在 `mqtt.client.enabled=true` (默认启用) 时自动注册默认监听器:

```java
@Slf4j
@AutoConfiguration
@ConditionalOnProperty(prefix = "mqtt.client", name = "enabled", havingValue = "true", matchIfMissing = true)
public class MqttAutoConfiguration {

    public MqttAutoConfiguration() {
        log.info("========================================");
        log.info("MQTT 模块初始化");
        log.info("使用 mica-mqtt 2.5.7 官方配置");
        log.info("集群部署推荐: 使用共享订阅 $share/GroupName/Topic");
        log.info("配置前缀: mqtt.client");
        log.info("========================================");
    }

    /**
     * 注册默认连接监听器
     * 用户可通过自定义 Bean 覆盖此默认实现
     */
    @Bean
    @ConditionalOnMissingBean
    public IMqttClientConnectListener mqttClientConnectListener() {
        log.info("注册默认 MQTT 连接监听器");
        return new DefaultMqttClientConnectListener();
    }

    /**
     * 注册默认全局消息监听器
     * 用户可通过自定义 Bean 覆盖此默认实现
     */
    @Bean
    @ConditionalOnMissingBean
    public IMqttClientGlobalMessageListener mqttClientGlobalMessageListener() {
        log.info("注册默认 MQTT 全局消息监听器");
        log.info("集群部署推荐：使用共享订阅（$share/GroupName/Topic）");
        return new DefaultMqttClientMessageListener();
    }
}
```

### 默认连接监听器

`DefaultMqttClientConnectListener` 监听客户端连接/断开事件:

```java
@Slf4j
public class DefaultMqttClientConnectListener implements IMqttClientConnectListener {

    @Override
    public void onConnected(ChannelContext context, boolean isReconnect) {
        if (isReconnect) {
            log.info("MQTT 客户端重连成功: {}", context.getClientNode());
        } else {
            log.info("MQTT 客户端连接成功: {}", context.getClientNode());
        }
    }

    @Override
    public void onDisconnect(ChannelContext context, Throwable throwable, String remark, boolean isRemove) {
        if (throwable != null) {
            log.warn("MQTT 客户端断开连接: {}, 原因: {}, 异常: {}, 是否移除: {}",
                context.getClientNode(), remark, throwable.getMessage(), isRemove);
        } else {
            log.warn("MQTT 客户端断开连接: {}, 原因: {}, 是否移除: {}",
                context.getClientNode(), remark, isRemove);
        }
    }
}
```

### 默认消息监听器

`DefaultMqttClientMessageListener` 处理接收到的消息:

```java
@Slf4j
public class DefaultMqttClientMessageListener implements IMqttClientGlobalMessageListener {

    @Override
    public void onMessage(ChannelContext context, String topic, MqttPublishMessage message, byte[] payload) {
        log.info("========================================");
        log.info("MQTT 消息接收");
        log.info("Topic: {}", topic);
        log.info("QoS: {}", message.fixedHeader().qosLevel());
        log.info("Payload: {}", new String(payload, StandardCharsets.UTF_8));
        log.info("========================================");
    }
}
```

## 核心 API

### MqttClientTemplate

| 方法 | 说明 |
|------|------|
| `publish(topic, payload)` | 发送消息 (默认 QoS 0) |
| `publish(topic, payload, qos)` | 发送消息 (指定 QoS) |
| `publish(topic, payload, qos, retain)` | 发送消息 (完整参数) |
| `subQos0(topic, listener)` | 订阅主题 (QoS 0, 需要监听器) |
| `subQos1(topic, listener)` | 订阅主题 (QoS 1, 需要监听器) |
| `subQos2(topic, listener)` | 订阅主题 (QoS 2, 需要监听器) |
| `unSubscribe(topic...)` | 取消订阅 (可变参数) |
| `isConnected()` | 检查是否已连接 |
| `disconnect()` | 断开连接 |

::: tip 订阅建议
订阅方法需要提供 `IMqttClientMessageListener`,**推荐使用配置文件的 `global-subscribe` 方式**,由全局监听器统一处理。
:::

### QoS 服务质量等级

| 枚举值 | 等级 | 说明 | 适用场景 |
|--------|------|------|---------|
| `QOS0` | 0 | 最多一次,可能丢失 | 传感器数据采集 |
| `QOS1` | 1 | 至少一次,可能重复 | 大部分业务场景 (推荐) |
| `QOS2` | 2 | 恰好一次,性能较低 | 计费系统、金融交易 |
| `FAILURE` | 0x80 | 订阅失败 | 错误响应 |

### MQTT 协议版本

| 枚举值 | 协议名称 | 协议级别 | 说明 |
|--------|---------|---------|------|
| `MQTT_3_1` | MQIsdp | 3 | MQTT 3.1 版本 |
| `MQTT_3_1_1` | MQTT | 4 | MQTT 3.1.1 版本 |
| `MQTT_5` | MQTT | 5 | MQTT 5.0 版本 (推荐) |

## 高级配置

### 遗嘱消息 (Last Will)

当客户端异常断开时,Broker 会自动发送遗嘱消息:

```yaml
mqtt:
  client:
    will-message:
      topic: /system/offline
      message: '{"app":"ruoyi-plus","status":"offline"}'
      qos: QOS1
      retain: false
```

### SSL/TLS 加密连接

```yaml
mqtt:
  client:
    ssl:
      enabled: true
      keystore-path: classpath:/certs/keystore.jks
      keystore-pass: password
      truststore-path: classpath:/certs/truststore.jks
      truststore-pass: password
```

### 多租户隔离

通过 Topic 前缀实现多租户隔离:

```java
String tenantId = TenantHelper.getTenantId();
String topic = "/" + tenantId + "/device/123/status";
mqttClientTemplate.publish(topic, "online".getBytes());
```

### 动态订阅

```java
import org.dromara.mica.mqtt.spring.client.MqttClientTemplate;
import org.dromara.mica.mqtt.core.client.IMqttClientMessageListener;

@Service
@RequiredArgsConstructor
public class MqttSubscribeService {

    private final MqttClientTemplate mqttClientTemplate;

    /**
     * 动态订阅主题 (需要提供监听器)
     */
    public void subscribeDevice(String deviceId) {
        String topic = "/device/" + deviceId + "/status";

        // 创建消息监听器
        IMqttClientMessageListener listener = (context, topic1, message, payload) -> {
            String payloadStr = new String(payload, StandardCharsets.UTF_8);
            log.info("收到消息: topic={}, payload={}", topic1, payloadStr);
        };

        // 订阅主题并指定监听器
        mqttClientTemplate.subQos1(topic, listener);
    }

    /**
     * 取消订阅
     */
    public void unsubscribeDevice(String deviceId) {
        String topic = "/device/" + deviceId + "/status";
        mqttClientTemplate.unSubscribe(topic);  // 支持可变参数
    }
}
```

## 集群部署

### 共享订阅

在集群部署场景下,多个应用实例订阅同一主题时,每条消息会被所有实例重复接收。使用**共享订阅**可以实现负载均衡,每条消息只被一个实例处理。

**共享订阅格式**: `$share/<GroupName>/<Topic>`

```yaml
mqtt:
  client:
    global-subscribe:
      # 共享订阅格式: $share/组名/实际主题
      - topic: $share/backend-cluster/device/+/status
        qos: QOS1
      - topic: $share/backend-cluster/sensor/#
        qos: QOS1
```

### 共享订阅工作原理

```text
┌────────────────────────────────────────────────────────────────────┐
│                    共享订阅负载均衡示意图                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│    ┌─────────┐          ┌─────────────────────────┐               │
│    │ Device1 │──────────▶                         │               │
│    └─────────┘          │                         │               │
│    ┌─────────┐          │      MQTT Broker       │               │
│    │ Device2 │──────────▶      (EMQX/HiveMQ)     │               │
│    └─────────┘          │                         │               │
│    ┌─────────┐          │   共享订阅组:            │               │
│    │ Device3 │──────────▶   backend-cluster      │               │
│    └─────────┘          │                         │               │
│                         └───────────┬─────────────┘               │
│                                     │                              │
│                     消息轮询分发 (Round Robin)                      │
│                                     │                              │
│              ┌──────────────────────┼──────────────────────┐      │
│              │                      │                      │      │
│              ▼                      ▼                      ▼      │
│     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│     │   Instance 1    │  │   Instance 2    │  │   Instance 3    │ │
│     │ $share/backend- │  │ $share/backend- │  │ $share/backend- │ │
│     │ cluster/device/#│  │ cluster/device/#│  │ cluster/device/#│ │
│     │                 │  │                 │  │                 │ │
│     │  处理消息 1,4,7  │  │  处理消息 2,5,8  │  │  处理消息 3,6,9  │ │
│     └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 支持的 Broker

| Broker | 版本要求 | 共享订阅支持 |
|--------|---------|-------------|
| EMQX | 3.0+ | 原生支持 |
| Mosquitto | 2.0+ | 原生支持 |
| HiveMQ | 3.0+ | 原生支持 |
| VerneMQ | 所有版本 | 原生支持 |

## 使用示例

### 示例1: 发送普通消息

```java
@Test
@DisplayName("发送普通消息 (默认 QoS 0)")
void publishSimpleMessage() {
    String topic = "/test/simple";
    String message = "Hello MQTT!";

    // 发送消息 (默认 QoS 0)
    boolean success = mqttClientTemplate.publish(topic, message.getBytes(StandardCharsets.UTF_8));

    log.info("发送消息: Topic={}, Message={}, Success={}", topic, message, success);
}
```

### 示例2: 发送 JSON 数据

```java
@Test
@DisplayName("发送 JSON 数据 (QoS 1)")
void publishJsonWithQoS1() {
    String topic = "/device/001/data";
    String jsonData = "{\"deviceId\":\"001\",\"temperature\":25.5,\"humidity\":60}";

    // 发送 JSON 消息 (QoS 1 - 至少一次)
    boolean success = mqttClientTemplate.publish(
        topic,
        jsonData.getBytes(StandardCharsets.UTF_8),
        MqttQoS.QOS1
    );

    log.info("发送 JSON: Topic={}, Data={}, Success={}", topic, jsonData, success);
}
```

### 示例3: 发送保留消息

```java
@Test
@DisplayName("发送保留消息 (Retained)")
void publishRetainedMessage() {
    String topic = "/device/001/config";
    String config = "{\"interval\":10,\"enabled\":true}";

    // 发送保留消息 (新订阅者会立即收到)
    boolean success = mqttClientTemplate.publish(
        topic,
        config.getBytes(StandardCharsets.UTF_8),
        MqttQoS.QOS1,
        true  // retained = true
    );

    log.info("发送保留消息: Topic={}, Config={}, Success={}", topic, config, success);
}
```

### 示例4: 批量发送消息

```java
@Test
@DisplayName("批量发送消息")
void publishBatchMessages() {
    // 模拟发送多个设备状态
    for (int i = 1; i <= 5; i++) {
        String topic = "/device/" + String.format("%03d", i) + "/status";
        String status = i % 2 == 0 ? "online" : "offline";

        mqttClientTemplate.publish(
            topic,
            status.getBytes(StandardCharsets.UTF_8),
            MqttQoS.QOS1
        );

        log.info("发送设备状态: 设备{}, 状态={}", String.format("%03d", i), status);
    }
}
```

### 示例5: 模拟设备上线通知

```java
@Test
@DisplayName("模拟设备上线通知")
void deviceOnlineNotification() {
    String deviceId = "DEVICE-001";

    // 1. 发送上线通知 (使用保留消息)
    String statusTopic = "/device/" + deviceId + "/status";
    String onlineMessage = "{\"deviceId\":\"" + deviceId + "\",\"status\":\"online\",\"timestamp\":" + System.currentTimeMillis() + "}";
    mqttClientTemplate.publish(
        statusTopic,
        onlineMessage.getBytes(StandardCharsets.UTF_8),
        MqttQoS.QOS1,
        true  // 保留消息
    );
    log.info("设备上线: {}", onlineMessage);
}
```

### 示例6: 模拟传感器数据上报

```java
@Test
@DisplayName("模拟传感器数据上报")
void sensorDataReport() {
    String sensorId = "SENSOR-001";
    String topic = "/sensor/" + sensorId + "/data";

    // 模拟持续上报传感器数据 (3次)
    for (int i = 1; i <= 3; i++) {
        double temperature = 20 + Math.random() * 10;  // 20-30度
        double humidity = 50 + Math.random() * 20;     // 50-70%

        String sensorData = String.format(
            "{\"sensorId\":\"%s\",\"temperature\":%.2f,\"humidity\":%.2f,\"timestamp\":%d}",
            sensorId, temperature, humidity, System.currentTimeMillis()
        );

        mqttClientTemplate.publish(
            topic,
            sensorData.getBytes(StandardCharsets.UTF_8),
            MqttQoS.QOS0  // QoS 0 适合高频传感器数据
        );

        log.info("上报传感器数据 #{}: {}", i, sensorData);
    }
}
```

### 示例7: 检查连接状态

```java
@Test
@DisplayName("检查连接状态")
void checkConnectionStatus() {
    if (mqttClientTemplate == null) {
        log.warn("MqttClientTemplate 未注入");
        log.warn("请检查:");
        log.warn("  1. application-dev.yml 中 mqtt.client.enabled=true");
        log.warn("  2. 依赖中已添加 ruoyi-common-mqtt");
        return;
    }

    boolean connected = mqttClientTemplate.isConnected();

    if (connected) {
        log.info("MQTT 客户端已连接");
        log.info("可以开始发送和接收消息");
    } else {
        log.warn("MQTT 客户端未连接");
        log.warn("解决方案:");
        log.warn("  1. 启动 EMQX: docker run -d --name emqx -p 1883:1883 emqx/emqx:latest");
        log.warn("  2. 检查配置: mqtt.client.ip=127.0.0.1");
        log.warn("  3. 检查防火墙: 确保 1883 端口开放");
    }
}
```

### 示例8: 不同 QoS 级别对比

```java
@Test
@DisplayName("不同 QoS 级别对比")
void qosComparison() {
    String baseTopic = "/test/qos";

    // QoS 0 - 最多一次 (可能丢失)
    mqttClientTemplate.publish(
        baseTopic + "/0",
        "QoS 0 Message".getBytes(StandardCharsets.UTF_8),
        MqttQoS.QOS0
    );
    log.info("QoS 0: 最多一次，可能丢失，性能最好");

    // QoS 1 - 至少一次 (可能重复)
    mqttClientTemplate.publish(
        baseTopic + "/1",
        "QoS 1 Message".getBytes(StandardCharsets.UTF_8),
        MqttQoS.QOS1
    );
    log.info("QoS 1: 至少一次，可能重复，推荐使用");

    // QoS 2 - 恰好一次 (性能较低)
    mqttClientTemplate.publish(
        baseTopic + "/2",
        "QoS 2 Message".getBytes(StandardCharsets.UTF_8),
        MqttQoS.QOS2
    );
    log.info("QoS 2: 恰好一次，无重复，性能最低");

    log.info("建议: 一般业务使用 QoS 1，传感器数据使用 QoS 0，金融交易使用 QoS 2");
}
```

## 集成方案

### 集成 RocketMQ

MQTT 接收设备消息后,转发到 RocketMQ 做异步处理:

```java
@Slf4j
@Component
public class MqttToRocketMQListener implements IMqttClientGlobalMessageListener {

    @Override
    public void onMessage(ChannelContext context, String topic, MqttPublishMessage message, byte[] payload) {
        String payloadStr = new String(payload, StandardCharsets.UTF_8);

        // 转发到 RocketMQ 做异步处理
        RMSendUtil.asyncSend("device-message", payloadStr);

        log.info("MQTT 消息已转发到 RocketMQ: topic={}", topic);
    }
}
```

### 集成 Redis

使用 Redis 缓存设备状态:

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceStatusListener implements IMqttClientGlobalMessageListener {

    private final RedissonClient redissonClient;

    @Override
    public void onMessage(ChannelContext context, String topic, MqttPublishMessage message, byte[] payload) {
        // 解析设备 ID
        String[] parts = topic.split("/");
        if (parts.length >= 3 && "device".equals(parts[1])) {
            String deviceId = parts[2];
            String status = new String(payload, StandardCharsets.UTF_8);

            // 缓存设备状态到 Redis
            RBucket<String> bucket = redissonClient.getBucket("device:status:" + deviceId);
            bucket.set(status, Duration.ofHours(1));

            log.info("设备状态已缓存: deviceId={}, status={}", deviceId, status);
        }
    }
}
```

### 集成 WebSocket

将 MQTT 消息推送到前端:

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class MqttToWebSocketListener implements IMqttClientGlobalMessageListener {

    private final WebSocketMessageSender webSocketMessageSender;

    @Override
    public void onMessage(ChannelContext context, String topic, MqttPublishMessage message, byte[] payload) {
        String payloadStr = new String(payload, StandardCharsets.UTF_8);

        // 推送到 WebSocket
        webSocketMessageSender.sendToAll(payloadStr);

        log.info("MQTT 消息已推送到 WebSocket: topic={}", topic);
    }
}
```

## 最佳实践

### 1. 主题设计规范

```text
# 推荐的主题结构
/{租户ID}/{业务类型}/{设备ID}/{操作类型}

# 示例
/tenant001/device/DEVICE-001/status     # 设备状态
/tenant001/device/DEVICE-001/data       # 设备数据
/tenant001/device/DEVICE-001/config     # 设备配置
/tenant001/device/DEVICE-001/command    # 设备命令
/tenant001/sensor/SENSOR-001/telemetry  # 传感器遥测
```

### 2. QoS 选择建议

| 场景 | 推荐 QoS | 原因 |
|------|---------|------|
| 传感器数据采集 | QoS 0 | 高频数据,允许少量丢失 |
| 设备状态上报 | QoS 1 | 确保状态更新不丢失 |
| 设备配置下发 | QoS 1 | 确保配置送达 |
| 金融交易消息 | QoS 2 | 必须恰好一次 |
| 实时通知 | QoS 0/1 | 根据重要性选择 |

### 3. 连接参数优化

```yaml
mqtt:
  client:
    # 心跳间隔 (秒)
    keep-alive-secs: 60
    # 连接超时 (秒)
    timeout: 10
    # 重连间隔 (秒)
    reconnect-interval: 3
    # 最大重连次数 (0=无限)
    max-reconnect-times: 0
    # 缓冲区大小
    read-buffer-size: 8192
    write-buffer-size: 8192
```

### 4. 异常处理

```java
@Slf4j
@Component
public class RobustMqttMessageListener implements IMqttClientGlobalMessageListener {

    @Override
    public void onMessage(ChannelContext context, String topic, MqttPublishMessage message, byte[] payload) {
        try {
            String payloadStr = new String(payload, StandardCharsets.UTF_8);

            // 验证 JSON 格式
            if (!JsonUtils.isJson(payloadStr)) {
                log.warn("无效的 JSON 消息: topic={}, payload={}", topic, payloadStr);
                return;
            }

            // 业务处理
            processMessage(topic, payloadStr);

        } catch (Exception e) {
            // 记录异常但不抛出,避免影响其他消息处理
            log.error("处理 MQTT 消息异常: topic={}, error={}", topic, e.getMessage(), e);
        }
    }

    private void processMessage(String topic, String payload) {
        // 业务逻辑
    }
}
```

### 5. 自定义连接监听器

```java
@Slf4j
@Component
public class CustomConnectListener implements IMqttClientConnectListener {

    @Autowired
    private NotificationService notificationService;

    @Override
    public void onConnected(ChannelContext context, boolean isReconnect) {
        if (isReconnect) {
            log.info("MQTT 客户端重连成功");
            // 发送恢复通知
            notificationService.sendAlert("MQTT 连接已恢复");
        } else {
            log.info("MQTT 客户端首次连接成功");
        }
    }

    @Override
    public void onDisconnect(ChannelContext context, Throwable throwable, String remark, boolean isRemove) {
        log.error("MQTT 客户端断开连接: reason={}, error={}", remark,
            throwable != null ? throwable.getMessage() : "N/A");

        // 发送告警通知
        notificationService.sendAlert("MQTT 连接断开: " + remark);
    }
}
```

## 故障排查

### 1. 连接失败: "远程计算机拒绝网络连接"

**原因**: 外部 MQTT Broker 未启动

**解决方案**:
```bash
# 检查 Broker 是否启动
telnet 127.0.0.1 1883

# 或启动 Docker EMQX
docker run -d --name emqx -p 1883:1883 -p 18083:18083 emqx/emqx:latest
```

### 2. 配置后无法连接

- 检查防火墙是否开放 1883 端口
- 检查用户名密码是否正确
- 检查 `enabled: true` 是否生效

### 3. 订阅无效

- 检查主题通配符是否正确 (`+` 是单级, `#` 是多级)
- 检查 QoS 等级格式 (必须是 `QOS0`, `QOS1`, `QOS2`, 不是数字)

### 4. 消息未接收

- 检查是否实现了自定义 `IMqttClientGlobalMessageListener`
- 检查日志中是否有连接断开的警告
- 检查 `global-subscribe` 配置是否正确

### 5. MqttClientTemplate 未注入

**原因**: 配置未启用或依赖缺失

**解决方案**:
```yaml
# 确保配置正确
mqtt:
  client:
    enabled: true  # 必须显式启用
    ip: 127.0.0.1
    port: 1883
```

### 6. 集群环境消息重复处理

**原因**: 未使用共享订阅

**解决方案**:
```yaml
mqtt:
  client:
    global-subscribe:
      # 使用共享订阅格式
      - topic: $share/backend-cluster/device/+/status
        qos: QOS1
```

## 完整示例

项目提供了 12 个完整的使用示例,涵盖所有常用功能:

```text
ruoyi-common-mqtt/src/test/java/plus/ruoyi/common/mqtt/MqttClientUsageTest.java
```

**示例包含**:
- 发送普通消息 (默认 QoS 0)
- 发送 JSON 数据 (QoS 1)
- 发送保留消息 (Retained)
- 批量发送消息
- 配置文件订阅 (推荐方式)
- 取消订阅
- 模拟设备上线通知
- 模拟传感器数据上报
- 检查连接状态
- 发布/订阅模式完整示例
- 不同 QoS 级别对比

## 技术栈

- **mica-mqtt 2.5.7**: Dromara 开源高性能 MQTT 客户端
- **MQTT 协议**: v3.1/v3.1.1/v5.0
- **t-io**: 异步非阻塞 IO
