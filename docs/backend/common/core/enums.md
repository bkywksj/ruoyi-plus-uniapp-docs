# 字典枚举 (Dictionary & Enum System)

## 概述

字典枚举系统是ruoyi-plus-uniapp中的一个重要设计模式，用于管理系统中的各种状态值、类型码和选项数据。该系统通过枚举类的方式提供类型安全、易于维护的字典数据管理，同时支持前端组件的数据绑定和国际化。

## 设计理念

### 核心原则

- **类型安全**: 使用枚举替代魔法字符串和数字
- **统一规范**: 所有字典都遵循相同的设计模式
- **易于维护**: 集中管理，便于修改和扩展
- **前端友好**: 提供标准的标签-值对结构
- **国际化支持**: 配合国际化系统使用

### 设计模式

所有字典枚举都遵循统一的设计模式：

```java
@Getter
@AllArgsConstructor
public enum DictXxx {
    ITEM1("value1", "标签1"),
    ITEM2("value2", "标签2");
    
    public static final String DICT_TYPE = "dict_type_code";
    
    private final String value;
    private final String label;
    
    // 标准方法
    public static DictXxx getByValue(String value) { }
    public static DictXxx getByLabel(String label) { }
    public static boolean isXxx(String value) { }
}
```

## 系统内置字典

### 1. 用户相关字典

#### 用户性别 (DictUserGender)

```java
@Getter
@AllArgsConstructor
public enum DictUserGender {
    FEMALE("0", "女"),
    MALE("1", "男"), 
    UNKNOWN("2", "未知");
    
    public static final String DICT_TYPE = "sys_user_gender";
    
    private final String value;
    private final String label;
}
```

**使用场景:**
- 用户注册/编辑性别选择
- 用户列表性别显示
- 统计报表性别分组

#### 用户类型 (UserType)

```java
@Getter
@AllArgsConstructor
public enum UserType {
    PC_USER("pc", "pc_user", 43200, 604800),
    MOBILE_USER("mobile", "mobile_user", 172800, 2592000);
    
    private final String deviceType;
    private final String userType;
    private final int activeTimeout;
    private final int timeout;
}
```

**特点:**
- 针对不同设备类型的用户体系
- 包含会话超时配置
- 支持多端登录管理

### 2. 状态相关字典

#### 启用状态 (DictEnableStatus)

```java
@Getter
@AllArgsConstructor
public enum DictEnableStatus {
    ENABLE("1", "启用"),
    DISABLED("0", "禁用");
    
    public static final String DICT_TYPE = "sys_enable_status";
    
    // 便捷方法
    public static boolean isEnabled(String value) {
        return ENABLE.getValue().equals(value);
    }
    
    public static boolean isDisabled(String value) {
        return DISABLED.getValue().equals(value);
    }
}
```

#### 显示设置 (DictDisplaySetting)

```java
@Getter
@AllArgsConstructor
public enum DictDisplaySetting {
    SHOW("1", "显示"),
    HIDE("0", "隐藏");
    
    public static boolean isShow(String value) {
        return SHOW.getValue().equals(value);
    }
    
    public static boolean isHide(String value) {
        return HIDE.getValue().equals(value);
    }
}
```

#### 逻辑标志 (DictBooleanFlag)

```java
@Getter
@AllArgsConstructor
public enum DictBooleanFlag {
    YES("1", "是"),
    NO("0", "否");
    
    public static boolean isYes(String value) {
        return YES.getValue().equals(value);
    }
    
    public static boolean isNo(String value) {
        return NO.getValue().equals(value);
    }
}
```

### 3. 业务流程字典

#### 审核状态 (DictAuditStatus)

```java
@Getter
@AllArgsConstructor
public enum DictAuditStatus {
    PENDING("0", "待审核"),
    APPROVED("1", "通过"),
    REJECTED("2", "驳回"),
    DENIED("3", "拒绝");
    
    public static final String DICT_TYPE = "sys_audit_status";
    
    public static boolean isApproved(String value) {
        return APPROVED.getValue().equals(value);
    }
    
    public static boolean isPending(String value) {
        return PENDING.getValue().equals(value);
    }
}
```

#### 订单状态 (DictOrderStatus)

```java
@Getter
@AllArgsConstructor
public enum DictOrderStatus {
    PENDING("pending", "待支付"),
    PAID("paid", "已支付"),
    DELIVERED("delivered", "已发货"),
    COMPLETED("completed", "已完成"),
    CANCELLED("cancelled", "已取消"),
    REFUNDED("refunded", "已退款");
    
    // 业务逻辑方法
    public boolean canPay() {
        return this == PENDING;
    }
    
    public boolean canCancel() {
        return this == PENDING;
    }
    
    public boolean canDeliver() {
        return this == PAID;
    }
    
    public boolean canComplete() {
        return this == DELIVERED;
    }
    
    public boolean canRefund() {
        return this == PAID || this == DELIVERED;
    }
    
    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED || this == REFUNDED;
    }
}
```

### 4. 支付相关字典

#### 支付方式 (DictPaymentMethod)

```java
@Getter
@AllArgsConstructor
public enum DictPaymentMethod {
    WECHAT("wechat", "微信支付"),
    ALIPAY("alipay", "支付宝"),
    UNIONPAY("unionpay", "银联"),
    BALANCE("balance", "余额支付"),
    POINTS("points", "积分抵扣");
    
    public static final String DICT_TYPE = "sys_payment_method";
    
    public static boolean isOnlinePayment(String value) {
        return WECHAT.getValue().equals(value) ||
               ALIPAY.getValue().equals(value) ||
               UNIONPAY.getValue().equals(value);
    }
}
```

### 5. 平台相关字典

#### 平台类型 (DictPlatformType)

```java
@Getter
@AllArgsConstructor
public enum DictPlatformType {
    MP_WEIXIN("mp-weixin", "微信小程序"),
    MP_OFFICIAL_ACCOUNT("mp-official-account", "微信公众号"),
    MP_QQ("mp-qq", "QQ小程序"),
    MP_ALIPAY("mp-alipay", "支付宝小程序"),
    MP_JD("mp-jd", "京东小程序"),
    MP_KUAISHOU("mp-kuaishou", "快手小程序"),
    MP_LARK("mp-lark", "飞书小程序"),
    MP_BAIDU("mp-baidu", "百度小程序"),
    MP_TOUTIAO("mp-toutiao", "头条小程序"),
    MP_XHS("mp-xhs", "小红书小程序");
    
    public static boolean isWechatPlatform(String value) {
        return MP_WEIXIN.getValue().equals(value) ||
               MP_OFFICIAL_ACCOUNT.getValue().equals(value);
    }
}
```

#### 消息类型 (DictMessageType)

```java
@Getter
@AllArgsConstructor
public enum DictMessageType {
    SYSTEM("system", "系统通知"),
    ACTIVITY("activity", "活动通知"),
    AUDIT("audit", "审核通知"),
    ACCOUNT("account", "账户通知"),
    PRIVATE("private", "私信");
    
    public static boolean isSystemLevel(String value) {
        return SYSTEM.getValue().equals(value) ||
               AUDIT.getValue().equals(value) ||
               ACCOUNT.getValue().equals(value);
    }
}
```

### 6. 系统操作字典

#### 操作类型 (DictOperType)

```java
@Getter
@AllArgsConstructor
public enum DictOperType {
    INSERT("1", "新增"),
    UPDATE("2", "修改"),
    DELETE("3", "删除"),
    GRANT("4", "授权"),
    EXPORT("5", "导出"),
    IMPORT("6", "导入"),
    FORCE("7", "强退"),
    GENCODE("8", "生成代码"),
    CLEAN("9", "清空数据"),
    OTHER("99", "其他");
    
    public static final String DICT_TYPE = "sys_oper_type";
}
```

#### 操作结果 (DictOperResult)

```java
@Getter
@AllArgsConstructor
public enum DictOperResult {
    SUCCESS("1", "成功"),
    FAIL("0", "失败");
    
    public static final String DICT_TYPE = "sys_oper_result";
}
```

### 7. 文件相关字典

#### 文件类型 (DictFileType)

```java
@Getter
@AllArgsConstructor
public enum DictFileType {
    IMAGE("image", "图片"),
    DOCUMENT("document", "文档"),
    VIDEO("video", "视频"),
    AUDIO("audio", "音频"),
    ARCHIVE("archive", "压缩包"),
    OTHER("other", "其他");
    
    public static boolean isMediaFile(String value) {
        return IMAGE.getValue().equals(value) ||
               VIDEO.getValue().equals(value) ||
               AUDIO.getValue().equals(value);
    }
}
```

### 8. 通知相关字典

#### 通知类型 (DictNoticeType)

```java
@Getter
@AllArgsConstructor
public enum DictNoticeType {
    NOTICE("1", "通知"),
    ANNOUNCEMENT("2", "公告");
    
    public static boolean isNotice(String value) {
        return NOTICE.getValue().equals(value);
    }
    
    public static boolean isAnnouncement(String value) {
        return ANNOUNCEMENT.getValue().equals(value);
    }
}
```

#### 通知状态 (DictNoticeStatus)

```java
@Getter
@AllArgsConstructor
public enum DictNoticeStatus {
    SEND_IMMEDIATELY("1", "立即发送"),
    SAVE_AS_DRAFT("0", "保存为草稿");
    
    public static boolean isSendImmediately(String value) {
        return SEND_IMMEDIATELY.getValue().equals(value);
    }
    
    public static boolean isDraft(String value) {
        return SAVE_AS_DRAFT.getValue().equals(value);
    }
}
```

## 认证类型枚举

### 认证类型 (AuthType)

```java
@Getter
@AllArgsConstructor
public enum AuthType {
    PASSWORD(I18nKeys.User.PASSWORD_RETRY_LOCKED, I18nKeys.User.PASSWORD_RETRY_COUNT),
    SMS(I18nKeys.VerifyCode.SMS_RETRY_LOCKED, I18nKeys.VerifyCode.SMS_RETRY_COUNT),
    EMAIL(I18nKeys.VerifyCode.EMAIL_RETRY_LOCKED, I18nKeys.VerifyCode.EMAIL_RETRY_COUNT),
    MINIAPP("", ""),
    MP("", ""),
    SOCIAL("", "");
    
    private final String retryLimitExceed;
    private final String retryLimitCount;
}
```

**特点:**
- 与国际化系统集成
- 包含重试限制配置
- 支持多种认证方式

## 配合校验使用

### 字典值校验注解

```java
@DictPattern(dictType = "sys_user_sex", message = "性别字典值无效")
private String gender;

@DictPattern(dictType = "sys_user_status", separator = ";", message = "状态值无效")
private String statusList;
```

### 枚举值校验注解

```java
@EnumPattern(type = DictUserGender.class, fieldName = "value", message = "性别值无效")
private String gender;

@EnumPattern(type = DictOrderStatus.class, fieldName = "value")
private String orderStatus;
```

## 前端使用

### Vue组件绑定

```vue
<template>
  <el-select v-model="form.gender" placeholder="请选择性别">
    <el-option
      v-for="item in genderOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
export default {
  data() {
    return {
      genderOptions: [
        { value: '0', label: '女' },
        { value: '1', label: '男' },
        { value: '2', label: '未知' }
      ]
    }
  }
}
</script>
```

### 字典标签组件

```vue
<template>
  <el-tag 
    :type="getTagType(status)"
    :class="getTagClass(status)"
  >
    {{ getDictLabel('sys_user_status', status) }}
  </el-tag>
</template>
```

## 最佳实践

### 1. 命名规范

```java
// 字典枚举类命名
DictXxx         // 通用字典
Dict + 业务域 + 类型名

// 示例
DictUserGender    // 用户性别
DictOrderStatus   // 订单状态
DictPaymentMethod // 支付方式
```

### 2. 结构规范

```java
@Getter
@AllArgsConstructor
public enum DictExample {
    // 枚举项定义
    ITEM1("value1", "标签1"),
    ITEM2("value2", "标签2");
    
    // 字典类型常量
    public static final String DICT_TYPE = "dict_type_code";
    
    // 基础字段
    private final String value;
    private final String label;
    
    // 标准查找方法
    public static DictExample getByValue(String value) {
        for (DictExample item : values()) {
            if (item.getValue().equals(value)) {
                return item;
            }
        }
        return DEFAULT_VALUE; // 或抛出异常
    }
    
    public static DictExample getByLabel(String label) {
        for (DictExample item : values()) {
            if (item.getLabel().equals(label)) {
                return item;
            }
        }
        return DEFAULT_VALUE;
    }
    
    // 业务判断方法
    public static boolean isSpecialType(String value) {
        return ITEM1.getValue().equals(value);
    }
}
```

### 3. 异常处理策略

#### 策略一：返回默认值

```java
public static DictUserGender getByValue(String value) {
    for (DictUserGender gender : values()) {
        if (gender.getValue().equals(value)) {
            return gender;
        }
    }
    return UNKNOWN; // 返回默认值
}
```

#### 策略二：抛出异常

```java
public static DictPaymentMethod getByValue(String value) {
    for (DictPaymentMethod method : values()) {
        if (method.getValue().equals(value)) {
            return method;
        }
    }
    throw new ServiceException(StringUtils.format("不支持的支付类型:{}", value));
}
```

### 4. 业务逻辑集成

```java
// 在枚举中包含业务逻辑
public enum DictOrderStatus {
    // ...枚举定义
    
    // 业务状态判断
    public boolean canPay() {
        return this == PENDING;
    }
    
    // 状态流转验证
    public boolean canTransitionTo(DictOrderStatus target) {
        return switch (this) {
            case PENDING -> target == PAID || target == CANCELLED;
            case PAID -> target == DELIVERED || target == REFUNDED;
            case DELIVERED -> target == COMPLETED;
            default -> false;
        };
    }
}
```

### 5. 缓存优化

```java
// 使用静态缓存提高查找性能
public enum DictExample {
    // 枚举定义...
    
    private static final Map<String, DictExample> VALUE_MAP = 
        Arrays.stream(values())
              .collect(Collectors.toMap(DictExample::getValue, Function.identity()));
    
    public static DictExample getByValue(String value) {
        return VALUE_MAP.getOrDefault(value, DEFAULT_VALUE);
    }
}
```

## 扩展字典

### 1. 添加新字典

```java
@Getter
@AllArgsConstructor
public enum DictCustomType {
    TYPE1("1", "类型1"),
    TYPE2("2", "类型2");
    
    public static final String DICT_TYPE = "custom_type";
    
    private final String value;
    private final String label;
    
    // 实现标准方法...
}
```

### 2. 复杂字典支持

```java
@Getter
@AllArgsConstructor
public enum DictComplexType {
    ITEM1("value1", "标签1", "描述1", "#ff0000"),
    ITEM2("value2", "标签2", "描述2", "#00ff00");
    
    private final String value;
    private final String label;
    private final String description;
    private final String color;
    
    // 扩展查找方法
    public static List<DictComplexType> getByColor(String color) {
        return Arrays.stream(values())
                     .filter(item -> item.getColor().equals(color))
                     .collect(Collectors.toList());
    }
}
```

### 3. 分组字典

```java
@Getter
@AllArgsConstructor
public enum DictGroupedType {
    GROUP1_ITEM1("g1_i1", "组1项1", "group1"),
    GROUP1_ITEM2("g1_i2", "组1项2", "group1"),
    GROUP2_ITEM1("g2_i1", "组2项1", "group2");
    
    private final String value;
    private final String label;
    private final String group;
    
    // 按组查找
    public static List<DictGroupedType> getByGroup(String group) {
        return Arrays.stream(values())
                     .filter(item -> item.getGroup().equals(group))
                     .collect(Collectors.toList());
    }
}
```

## 国际化支持

### 1. 标签国际化

```java
@Getter
@AllArgsConstructor
public enum DictI18nType {
    ITEM1("value1", "dict.i18n.type.item1"),
    ITEM2("value2", "dict.i18n.type.item2");
    
    private final String value;
    private final String labelKey; // 国际化键
    
    public String getLocalizedLabel() {
        return MessageUtils.message(labelKey);
    }
}
```

### 2. 配置文件

```properties
# messages_zh_CN.properties
dict.i18n.type.item1=项目1
dict.i18n.type.item2=项目2

# messages_en_US.properties
dict.i18n.type.item1=Item 1
dict.i18n.type.item2=Item 2
```

## 数据库同步

### 1. 字典数据初始化

```sql
-- 初始化字典类型
INSERT INTO sys_dict_type (dict_type, dict_name, status) 
VALUES ('sys_user_gender', '用户性别', '0');

-- 初始化字典数据
INSERT INTO sys_dict_data (dict_type, dict_label, dict_value, dict_sort, status) 
VALUES 
('sys_user_gender', '男', '1', 1, '0'),
('sys_user_gender', '女', '0', 2, '0'),
('sys_user_gender', '未知', '2', 3, '0');
```

### 2. 同步脚本

```java
@Component
public class DictSyncService {
    
    public void syncEnumToDatabase() {
        // 遍历所有字典枚举
        for (DictUserGender gender : DictUserGender.values()) {
            // 同步到数据库
            syncDictData(DictUserGender.DICT_TYPE, 
                        gender.getValue(), 
                        gender.getLabel());
        }
    }
}
```

## 枚举设计模式

### 策略模式与枚举结合

枚举非常适合实现策略模式，每个枚举项代表一种策略实现：

```java
/**
 * 计价策略枚举
 */
@Getter
@AllArgsConstructor
public enum PricingStrategy {

    /**
     * 正常价格策略
     */
    NORMAL("normal", "正常价格") {
        @Override
        public BigDecimal calculate(BigDecimal price, int quantity) {
            return price.multiply(BigDecimal.valueOf(quantity));
        }
    },

    /**
     * 会员折扣策略
     */
    VIP("vip", "会员折扣") {
        @Override
        public BigDecimal calculate(BigDecimal price, int quantity) {
            return price.multiply(BigDecimal.valueOf(quantity))
                       .multiply(BigDecimal.valueOf(0.8));
        }
    },

    /**
     * 满减策略
     */
    FULL_REDUCTION("full_reduction", "满减活动") {
        @Override
        public BigDecimal calculate(BigDecimal price, int quantity) {
            BigDecimal total = price.multiply(BigDecimal.valueOf(quantity));
            // 满100减20
            if (total.compareTo(BigDecimal.valueOf(100)) >= 0) {
                return total.subtract(BigDecimal.valueOf(20));
            }
            return total;
        }
    },

    /**
     * 阶梯定价策略
     */
    TIERED("tiered", "阶梯定价") {
        @Override
        public BigDecimal calculate(BigDecimal price, int quantity) {
            // 阶梯定价：1-10件原价，11-50件9折，50件以上8折
            if (quantity <= 10) {
                return price.multiply(BigDecimal.valueOf(quantity));
            } else if (quantity <= 50) {
                BigDecimal first10 = price.multiply(BigDecimal.valueOf(10));
                BigDecimal rest = price.multiply(BigDecimal.valueOf(0.9))
                                       .multiply(BigDecimal.valueOf(quantity - 10));
                return first10.add(rest);
            } else {
                BigDecimal first10 = price.multiply(BigDecimal.valueOf(10));
                BigDecimal mid40 = price.multiply(BigDecimal.valueOf(0.9))
                                        .multiply(BigDecimal.valueOf(40));
                BigDecimal rest = price.multiply(BigDecimal.valueOf(0.8))
                                       .multiply(BigDecimal.valueOf(quantity - 50));
                return first10.add(mid40).add(rest);
            }
        }
    };

    private final String value;
    private final String label;

    /**
     * 计算价格的抽象方法
     */
    public abstract BigDecimal calculate(BigDecimal price, int quantity);

    /**
     * 根据值获取策略
     */
    public static PricingStrategy getByValue(String value) {
        for (PricingStrategy strategy : values()) {
            if (strategy.getValue().equals(value)) {
                return strategy;
            }
        }
        return NORMAL;
    }
}
```

**使用示例：**

```java
@Service
@RequiredArgsConstructor
public class OrderPricingService {

    /**
     * 计算订单总价
     */
    public BigDecimal calculateOrderPrice(Order order, String strategyType) {
        PricingStrategy strategy = PricingStrategy.getByValue(strategyType);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            BigDecimal itemPrice = strategy.calculate(
                item.getUnitPrice(),
                item.getQuantity()
            );
            totalPrice = totalPrice.add(itemPrice);
        }

        return totalPrice;
    }
}
```

### 工厂模式与枚举结合

使用枚举实现工厂模式，创建不同类型的对象：

```java
/**
 * 消息发送器工厂枚举
 */
@Getter
@AllArgsConstructor
public enum MessageSenderFactory {

    SMS("sms", "短信发送") {
        @Override
        public MessageSender createSender() {
            return new SmsSender();
        }
    },

    EMAIL("email", "邮件发送") {
        @Override
        public MessageSender createSender() {
            return new EmailSender();
        }
    },

    WECHAT("wechat", "微信消息") {
        @Override
        public MessageSender createSender() {
            return new WechatSender();
        }
    },

    APP_PUSH("app_push", "APP推送") {
        @Override
        public MessageSender createSender() {
            return new AppPushSender();
        }
    };

    private final String value;
    private final String label;

    /**
     * 创建发送器的抽象方法
     */
    public abstract MessageSender createSender();

    /**
     * 根据类型获取发送器
     */
    public static MessageSender getSender(String type) {
        for (MessageSenderFactory factory : values()) {
            if (factory.getValue().equals(type)) {
                return factory.createSender();
            }
        }
        throw new ServiceException("不支持的消息类型: " + type);
    }

    /**
     * 批量创建发送器
     */
    public static List<MessageSender> createSenders(List<String> types) {
        return types.stream()
                    .map(MessageSenderFactory::getSender)
                    .collect(Collectors.toList());
    }
}

/**
 * 消息发送器接口
 */
public interface MessageSender {
    void send(String target, String content);
    boolean supports(String target);
}

/**
 * 短信发送器实现
 */
public class SmsSender implements MessageSender {
    @Override
    public void send(String target, String content) {
        // 调用短信接口发送
        log.info("发送短信到: {}, 内容: {}", target, content);
    }

    @Override
    public boolean supports(String target) {
        return target.matches("^1[3-9]\\d{9}$");
    }
}
```

### 状态机模式与枚举结合

使用枚举实现状态机，管理状态流转：

```java
/**
 * 工单状态枚举（状态机实现）
 */
@Getter
@AllArgsConstructor
public enum WorkOrderStatus {

    CREATED("created", "已创建") {
        @Override
        public Set<WorkOrderStatus> allowedTransitions() {
            return EnumSet.of(ASSIGNED, CANCELLED);
        }
    },

    ASSIGNED("assigned", "已分配") {
        @Override
        public Set<WorkOrderStatus> allowedTransitions() {
            return EnumSet.of(IN_PROGRESS, CANCELLED, CREATED);
        }
    },

    IN_PROGRESS("in_progress", "处理中") {
        @Override
        public Set<WorkOrderStatus> allowedTransitions() {
            return EnumSet.of(PENDING_REVIEW, ASSIGNED);
        }
    },

    PENDING_REVIEW("pending_review", "待审核") {
        @Override
        public Set<WorkOrderStatus> allowedTransitions() {
            return EnumSet.of(COMPLETED, IN_PROGRESS);
        }
    },

    COMPLETED("completed", "已完成") {
        @Override
        public Set<WorkOrderStatus> allowedTransitions() {
            return EnumSet.noneOf(WorkOrderStatus.class);
        }
    },

    CANCELLED("cancelled", "已取消") {
        @Override
        public Set<WorkOrderStatus> allowedTransitions() {
            return EnumSet.noneOf(WorkOrderStatus.class);
        }
    };

    private final String value;
    private final String label;

    /**
     * 获取允许流转的目标状态
     */
    public abstract Set<WorkOrderStatus> allowedTransitions();

    /**
     * 检查是否可以流转到目标状态
     */
    public boolean canTransitionTo(WorkOrderStatus target) {
        return allowedTransitions().contains(target);
    }

    /**
     * 执行状态流转
     */
    public WorkOrderStatus transitionTo(WorkOrderStatus target) {
        if (!canTransitionTo(target)) {
            throw new ServiceException(
                String.format("状态[%s]不能流转到[%s]", this.label, target.label)
            );
        }
        return target;
    }

    /**
     * 是否为终态
     */
    public boolean isFinalState() {
        return allowedTransitions().isEmpty();
    }

    /**
     * 是否为活跃状态
     */
    public boolean isActive() {
        return this == IN_PROGRESS || this == PENDING_REVIEW;
    }

    /**
     * 根据值获取状态
     */
    public static WorkOrderStatus getByValue(String value) {
        for (WorkOrderStatus status : values()) {
            if (status.getValue().equals(value)) {
                return status;
            }
        }
        throw new ServiceException("未知的工单状态: " + value);
    }
}
```

**使用示例：**

```java
@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;

    /**
     * 工单状态变更
     */
    @Transactional
    public void changeStatus(Long workOrderId, String targetStatus) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
            .orElseThrow(() -> new ServiceException("工单不存在"));

        WorkOrderStatus currentStatus = WorkOrderStatus.getByValue(workOrder.getStatus());
        WorkOrderStatus newStatus = WorkOrderStatus.getByValue(targetStatus);

        // 状态机验证并流转
        WorkOrderStatus finalStatus = currentStatus.transitionTo(newStatus);

        workOrder.setStatus(finalStatus.getValue());
        workOrder.setStatusLabel(finalStatus.getLabel());
        workOrder.setUpdateTime(LocalDateTime.now());

        workOrderRepository.save(workOrder);

        // 发布状态变更事件
        publishStatusChangeEvent(workOrder, currentStatus, finalStatus);
    }
}
```

## 动态字典系统

### 数据库字典与枚举结合

在实际项目中，需要将静态枚举与动态数据库字典结合使用：

```java
/**
 * 字典数据服务
 */
@Service
@RequiredArgsConstructor
public class DictDataService {

    private final SysDictDataMapper dictDataMapper;
    private final RedissonClient redissonClient;

    /**
     * 字典缓存前缀
     */
    private static final String DICT_CACHE_PREFIX = "dict:data:";

    /**
     * 获取字典数据列表
     */
    public List<SysDictData> getDictByType(String dictType) {
        String cacheKey = DICT_CACHE_PREFIX + dictType;
        RList<SysDictData> cachedList = redissonClient.getList(cacheKey);

        if (cachedList.isExists() && !cachedList.isEmpty()) {
            return cachedList.readAll();
        }

        // 从数据库加载
        LambdaQueryWrapper<SysDictData> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysDictData::getDictType, dictType)
               .eq(SysDictData::getStatus, "0")
               .orderByAsc(SysDictData::getDictSort);

        List<SysDictData> dataList = dictDataMapper.selectList(wrapper);

        // 写入缓存
        if (CollUtil.isNotEmpty(dataList)) {
            cachedList.addAll(dataList);
            cachedList.expire(Duration.ofHours(24));
        }

        return dataList;
    }

    /**
     * 获取字典标签
     */
    public String getDictLabel(String dictType, String dictValue) {
        List<SysDictData> dataList = getDictByType(dictType);
        return dataList.stream()
                       .filter(data -> data.getDictValue().equals(dictValue))
                       .map(SysDictData::getDictLabel)
                       .findFirst()
                       .orElse("");
    }

    /**
     * 获取字典值
     */
    public String getDictValue(String dictType, String dictLabel) {
        List<SysDictData> dataList = getDictByType(dictType);
        return dataList.stream()
                       .filter(data -> data.getDictLabel().equals(dictLabel))
                       .map(SysDictData::getDictValue)
                       .findFirst()
                       .orElse("");
    }

    /**
     * 刷新字典缓存
     */
    public void refreshCache(String dictType) {
        String cacheKey = DICT_CACHE_PREFIX + dictType;
        redissonClient.getList(cacheKey).delete();
        getDictByType(dictType); // 重新加载
    }

    /**
     * 刷新所有字典缓存
     */
    public void refreshAllCache() {
        redissonClient.getKeys().deleteByPattern(DICT_CACHE_PREFIX + "*");
    }
}
```

### 字典包装器

将枚举与数据库字典统一为相同接口：

```java
/**
 * 字典项接口
 */
public interface DictItem {
    String getValue();
    String getLabel();
    default String getDescription() { return ""; }
    default Integer getSort() { return 0; }
    default String getCssClass() { return ""; }
    default String getListClass() { return ""; }
}

/**
 * 枚举字典包装器
 */
public class EnumDictWrapper<E extends Enum<E>> {

    private final Class<E> enumClass;
    private final Function<E, String> valueExtractor;
    private final Function<E, String> labelExtractor;

    public EnumDictWrapper(
            Class<E> enumClass,
            Function<E, String> valueExtractor,
            Function<E, String> labelExtractor) {
        this.enumClass = enumClass;
        this.valueExtractor = valueExtractor;
        this.labelExtractor = labelExtractor;
    }

    /**
     * 获取所有字典项
     */
    public List<DictItem> getAllItems() {
        return Arrays.stream(enumClass.getEnumConstants())
                     .map(this::toDictItem)
                     .collect(Collectors.toList());
    }

    /**
     * 转换为字典项
     */
    private DictItem toDictItem(E enumValue) {
        return new DictItem() {
            @Override
            public String getValue() {
                return valueExtractor.apply(enumValue);
            }

            @Override
            public String getLabel() {
                return labelExtractor.apply(enumValue);
            }

            @Override
            public Integer getSort() {
                return enumValue.ordinal();
            }
        };
    }

    /**
     * 根据值查找枚举
     */
    public E getByValue(String value) {
        for (E enumValue : enumClass.getEnumConstants()) {
            if (valueExtractor.apply(enumValue).equals(value)) {
                return enumValue;
            }
        }
        return null;
    }

    /**
     * 根据标签查找枚举
     */
    public E getByLabel(String label) {
        for (E enumValue : enumClass.getEnumConstants()) {
            if (labelExtractor.apply(enumValue).equals(label)) {
                return enumValue;
            }
        }
        return null;
    }
}
```

**使用示例：**

```java
@Configuration
public class DictConfig {

    @Bean
    public EnumDictWrapper<DictUserGender> userGenderWrapper() {
        return new EnumDictWrapper<>(
            DictUserGender.class,
            DictUserGender::getValue,
            DictUserGender::getLabel
        );
    }

    @Bean
    public EnumDictWrapper<DictOrderStatus> orderStatusWrapper() {
        return new EnumDictWrapper<>(
            DictOrderStatus.class,
            DictOrderStatus::getValue,
            DictOrderStatus::getLabel
        );
    }
}
```

### 混合字典服务

统一处理枚举字典和数据库字典：

```java
/**
 * 混合字典服务
 */
@Service
@RequiredArgsConstructor
public class HybridDictService {

    private final DictDataService dictDataService;
    private final Map<String, EnumDictWrapper<?>> enumWrappers;

    /**
     * 枚举字典类型映射
     */
    private static final Map<String, Class<?>> ENUM_DICT_TYPES = Map.of(
        "sys_user_gender", DictUserGender.class,
        "sys_order_status", DictOrderStatus.class,
        "sys_payment_method", DictPaymentMethod.class
    );

    /**
     * 获取字典数据（自动判断来源）
     */
    public List<DictItem> getDictItems(String dictType) {
        // 优先从枚举获取
        EnumDictWrapper<?> wrapper = enumWrappers.get(dictType);
        if (wrapper != null) {
            return wrapper.getAllItems();
        }

        // 从数据库获取
        return dictDataService.getDictByType(dictType)
                              .stream()
                              .map(this::toDictItem)
                              .collect(Collectors.toList());
    }

    /**
     * 获取字典标签
     */
    public String getDictLabel(String dictType, String value) {
        List<DictItem> items = getDictItems(dictType);
        return items.stream()
                    .filter(item -> item.getValue().equals(value))
                    .map(DictItem::getLabel)
                    .findFirst()
                    .orElse("");
    }

    /**
     * 批量获取字典标签
     */
    public Map<String, String> getDictLabels(String dictType, Collection<String> values) {
        List<DictItem> items = getDictItems(dictType);
        Map<String, String> labelMap = items.stream()
            .collect(Collectors.toMap(DictItem::getValue, DictItem::getLabel));

        return values.stream()
                     .distinct()
                     .collect(Collectors.toMap(
                         Function.identity(),
                         value -> labelMap.getOrDefault(value, "")
                     ));
    }

    private DictItem toDictItem(SysDictData data) {
        return new DictItem() {
            @Override
            public String getValue() { return data.getDictValue(); }
            @Override
            public String getLabel() { return data.getDictLabel(); }
            @Override
            public String getDescription() { return data.getRemark(); }
            @Override
            public Integer getSort() { return data.getDictSort(); }
            @Override
            public String getCssClass() { return data.getCssClass(); }
            @Override
            public String getListClass() { return data.getListClass(); }
        };
    }
}
```

## 字典与Excel导入导出

### Excel字典转换器

在Excel导入导出时，自动转换字典值和标签：

```java
/**
 * Excel字典转换器
 */
public class ExcelDictConverter implements Converter<String> {

    private static HybridDictService dictService;

    /**
     * 设置字典服务（通过静态注入）
     */
    public static void setDictService(HybridDictService service) {
        dictService = service;
    }

    private final String dictType;

    public ExcelDictConverter(String dictType) {
        this.dictType = dictType;
    }

    @Override
    public Class<?> supportJavaTypeKey() {
        return String.class;
    }

    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        return CellDataTypeEnum.STRING;
    }

    /**
     * 读取Excel时：标签 -> 值
     */
    @Override
    public String convertToJavaData(ReadCellData<?> cellData,
                                    ExcelContentProperty contentProperty,
                                    GlobalConfiguration globalConfiguration) {
        String label = cellData.getStringValue();
        if (StringUtils.isBlank(label)) {
            return "";
        }
        return dictService.getDictItems(dictType).stream()
                          .filter(item -> item.getLabel().equals(label))
                          .map(DictItem::getValue)
                          .findFirst()
                          .orElse(label);
    }

    /**
     * 写入Excel时：值 -> 标签
     */
    @Override
    public WriteCellData<?> convertToExcelData(String value,
                                               ExcelContentProperty contentProperty,
                                               GlobalConfiguration globalConfiguration) {
        if (StringUtils.isBlank(value)) {
            return new WriteCellData<>("");
        }
        String label = dictService.getDictLabel(dictType, value);
        return new WriteCellData<>(StringUtils.isNotBlank(label) ? label : value);
    }
}
```

### 字典转换注解

自定义注解简化Excel字典配置：

```java
/**
 * Excel字典转换注解
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@ExcelProperty
public @interface ExcelDictField {

    /**
     * 字典类型
     */
    String dictType();

    /**
     * 列名
     */
    String value() default "";

    /**
     * 列索引
     */
    int index() default -1;
}

/**
 * 用户导出VO
 */
@Data
public class UserExportVo {

    @ExcelProperty("用户名")
    private String username;

    @ExcelProperty("姓名")
    private String nickname;

    @ExcelDictField(dictType = "sys_user_gender", value = "性别")
    private String gender;

    @ExcelDictField(dictType = "sys_enable_status", value = "状态")
    private String status;

    @ExcelProperty("创建时间")
    private LocalDateTime createTime;
}
```

### Excel字典处理器

处理字典注解的Excel读写：

```java
/**
 * 字典Excel处理器
 */
@Component
@RequiredArgsConstructor
public class DictExcelHandler {

    private final HybridDictService dictService;

    /**
     * 导出时处理字典字段
     */
    public <T> List<T> processExportData(List<T> dataList) {
        if (CollUtil.isEmpty(dataList)) {
            return dataList;
        }

        Class<?> clazz = dataList.get(0).getClass();
        Map<Field, String> dictFields = getDictFields(clazz);

        for (T data : dataList) {
            for (Map.Entry<Field, String> entry : dictFields.entrySet()) {
                Field field = entry.getKey();
                String dictType = entry.getValue();

                try {
                    field.setAccessible(true);
                    Object value = field.get(data);
                    if (value instanceof String) {
                        String label = dictService.getDictLabel(dictType, (String) value);
                        field.set(data, StringUtils.isNotBlank(label) ? label : value);
                    }
                } catch (IllegalAccessException e) {
                    log.warn("字典字段处理失败: {}", field.getName(), e);
                }
            }
        }

        return dataList;
    }

    /**
     * 导入时处理字典字段
     */
    public <T> List<T> processImportData(List<T> dataList) {
        if (CollUtil.isEmpty(dataList)) {
            return dataList;
        }

        Class<?> clazz = dataList.get(0).getClass();
        Map<Field, String> dictFields = getDictFields(clazz);

        for (T data : dataList) {
            for (Map.Entry<Field, String> entry : dictFields.entrySet()) {
                Field field = entry.getKey();
                String dictType = entry.getValue();

                try {
                    field.setAccessible(true);
                    Object label = field.get(data);
                    if (label instanceof String) {
                        String value = getDictValue(dictType, (String) label);
                        field.set(data, StringUtils.isNotBlank(value) ? value : label);
                    }
                } catch (IllegalAccessException e) {
                    log.warn("字典字段处理失败: {}", field.getName(), e);
                }
            }
        }

        return dataList;
    }

    /**
     * 获取类的字典字段
     */
    private Map<Field, String> getDictFields(Class<?> clazz) {
        Map<Field, String> dictFields = new HashMap<>();

        for (Field field : clazz.getDeclaredFields()) {
            ExcelDictField annotation = field.getAnnotation(ExcelDictField.class);
            if (annotation != null) {
                dictFields.put(field, annotation.dictType());
            }
        }

        return dictFields;
    }

    /**
     * 根据标签获取值
     */
    private String getDictValue(String dictType, String label) {
        return dictService.getDictItems(dictType).stream()
                          .filter(item -> item.getLabel().equals(label))
                          .map(DictItem::getValue)
                          .findFirst()
                          .orElse("");
    }
}
```

## 字典权限控制

### 根据角色过滤字典项

某些字典项可能需要根据用户角色进行过滤：

```java
/**
 * 字典权限服务
 */
@Service
@RequiredArgsConstructor
public class DictPermissionService {

    private final HybridDictService dictService;

    /**
     * 字典权限配置
     */
    private static final Map<String, Map<String, Set<String>>> DICT_PERMISSIONS = Map.of(
        // 订单状态字典：不同角色可见不同状态
        "sys_order_status", Map.of(
            "admin", Set.of("pending", "paid", "delivered", "completed", "cancelled", "refunded"),
            "operator", Set.of("pending", "paid", "delivered", "completed"),
            "customer", Set.of("pending", "paid", "delivered", "completed")
        ),
        // 审核状态字典：管理员可见所有，普通用户仅可见部分
        "sys_audit_status", Map.of(
            "admin", Set.of("0", "1", "2", "3"),
            "auditor", Set.of("0", "1", "2"),
            "user", Set.of("0", "1")
        )
    );

    /**
     * 获取用户可见的字典项
     */
    public List<DictItem> getVisibleDictItems(String dictType, String roleKey) {
        List<DictItem> allItems = dictService.getDictItems(dictType);

        // 检查是否有权限配置
        Map<String, Set<String>> rolePermissions = DICT_PERMISSIONS.get(dictType);
        if (rolePermissions == null) {
            return allItems; // 无权限配置，返回全部
        }

        // 获取角色可见的值集合
        Set<String> visibleValues = rolePermissions.get(roleKey);
        if (visibleValues == null) {
            visibleValues = rolePermissions.get("default");
        }
        if (visibleValues == null) {
            return allItems; // 无默认配置，返回全部
        }

        Set<String> finalVisibleValues = visibleValues;
        return allItems.stream()
                       .filter(item -> finalVisibleValues.contains(item.getValue()))
                       .collect(Collectors.toList());
    }

    /**
     * 检查用户是否可以使用某字典值
     */
    public boolean canUseValue(String dictType, String value, String roleKey) {
        Map<String, Set<String>> rolePermissions = DICT_PERMISSIONS.get(dictType);
        if (rolePermissions == null) {
            return true;
        }

        Set<String> visibleValues = rolePermissions.get(roleKey);
        if (visibleValues == null) {
            return true;
        }

        return visibleValues.contains(value);
    }

    /**
     * 获取当前用户可见的字典项
     */
    public List<DictItem> getCurrentUserDictItems(String dictType) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        if (loginUser == null) {
            return Collections.emptyList();
        }

        // 获取用户最高权限角色
        String roleKey = loginUser.getRoles().stream()
                                  .map(RoleDto::getRoleKey)
                                  .min(Comparator.comparingInt(this::getRolePriority))
                                  .orElse("user");

        return getVisibleDictItems(dictType, roleKey);
    }

    /**
     * 角色优先级（越小越高）
     */
    private int getRolePriority(String roleKey) {
        return switch (roleKey) {
            case "admin" -> 1;
            case "auditor", "operator" -> 2;
            default -> 3;
        };
    }
}
```

### 字典接口权限控制

```java
/**
 * 字典控制器（带权限控制）
 */
@RestController
@RequestMapping("/dict")
@RequiredArgsConstructor
public class DictController {

    private final DictPermissionService dictPermissionService;

    /**
     * 获取字典数据（根据用户角色过滤）
     */
    @GetMapping("/data/{dictType}")
    public R<List<DictItem>> getDictData(@PathVariable String dictType) {
        List<DictItem> items = dictPermissionService.getCurrentUserDictItems(dictType);
        return R.ok(items);
    }

    /**
     * 获取字典数据（管理员专用，返回全部）
     */
    @GetMapping("/data/all/{dictType}")
    @PreAuthorize("@ss.hasRole('admin')")
    public R<List<DictItem>> getAllDictData(@PathVariable String dictType) {
        List<DictItem> items = dictPermissionService.getVisibleDictItems(dictType, "admin");
        return R.ok(items);
    }
}
```

## 字典变更审计

### 字典变更事件

记录字典数据的变更历史：

```java
/**
 * 字典变更事件
 */
@Getter
public class DictChangeEvent extends ApplicationEvent {

    private final String dictType;
    private final String dictValue;
    private final ChangeType changeType;
    private final Object oldValue;
    private final Object newValue;
    private final String operator;
    private final LocalDateTime changeTime;

    public DictChangeEvent(Object source, String dictType, String dictValue,
                           ChangeType changeType, Object oldValue, Object newValue) {
        super(source);
        this.dictType = dictType;
        this.dictValue = dictValue;
        this.changeType = changeType;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.operator = SecurityUtils.getUsername();
        this.changeTime = LocalDateTime.now();
    }

    public enum ChangeType {
        CREATE, UPDATE, DELETE
    }
}

/**
 * 字典变更监听器
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DictChangeListener {

    private final DictChangeLogMapper changeLogMapper;

    @EventListener
    @Async
    public void handleDictChange(DictChangeEvent event) {
        log.info("字典变更: type={}, value={}, changeType={}",
                 event.getDictType(), event.getDictValue(), event.getChangeType());

        // 记录变更日志
        DictChangeLog changeLog = new DictChangeLog();
        changeLog.setDictType(event.getDictType());
        changeLog.setDictValue(event.getDictValue());
        changeLog.setChangeType(event.getChangeType().name());
        changeLog.setOldValue(JsonUtils.toJsonString(event.getOldValue()));
        changeLog.setNewValue(JsonUtils.toJsonString(event.getNewValue()));
        changeLog.setOperator(event.getOperator());
        changeLog.setChangeTime(event.getChangeTime());

        changeLogMapper.insert(changeLog);
    }
}
```

### 字典变更日志表

```sql
-- 字典变更日志表
CREATE TABLE sys_dict_change_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    dict_type VARCHAR(100) NOT NULL COMMENT '字典类型',
    dict_value VARCHAR(100) COMMENT '字典值',
    change_type VARCHAR(20) NOT NULL COMMENT '变更类型(CREATE/UPDATE/DELETE)',
    old_value TEXT COMMENT '变更前值(JSON)',
    new_value TEXT COMMENT '变更后值(JSON)',
    operator VARCHAR(64) NOT NULL COMMENT '操作人',
    change_time DATETIME NOT NULL COMMENT '变更时间',
    INDEX idx_dict_type (dict_type),
    INDEX idx_change_time (change_time)
) COMMENT='字典变更日志表';
```

## 注意事项

### 1. 性能考虑

- 使用静态缓存Map提高查找性能
- 避免在循环中频繁调用getByValue方法
- 考虑使用枚举序号进行比较
- 字典数据加载时使用懒加载策略
- 批量查询时使用缓存预热

### 2. 兼容性

- 新增枚举项时考虑向后兼容
- 删除枚举项需要检查现有数据
- 修改枚举值需要同步更新数据库
- 版本升级时提供数据迁移脚本

### 3. 维护性

- 保持枚举命名的一致性
- 及时更新相关文档
- 定期检查未使用的枚举项
- 枚举类应包含完整的JavaDoc注释

### 4. 测试覆盖

```java
@Test
public void testDictUserGender() {
    // 测试值查找
    assertEquals(DictUserGender.MALE, DictUserGender.getByValue("1"));
    assertEquals(DictUserGender.UNKNOWN, DictUserGender.getByValue("invalid"));

    // 测试标签查找
    assertEquals(DictUserGender.FEMALE, DictUserGender.getByLabel("女"));

    // 测试业务方法
    assertTrue(DictUserGender.MALE.getValue().equals("1"));
}

@Test
public void testWorkOrderStatusTransition() {
    // 测试状态机流转
    WorkOrderStatus created = WorkOrderStatus.CREATED;

    // 可以流转到ASSIGNED
    assertTrue(created.canTransitionTo(WorkOrderStatus.ASSIGNED));

    // 不能直接流转到COMPLETED
    assertFalse(created.canTransitionTo(WorkOrderStatus.COMPLETED));

    // 测试流转异常
    assertThrows(ServiceException.class, () -> {
        created.transitionTo(WorkOrderStatus.COMPLETED);
    });
}

@Test
public void testPricingStrategy() {
    // 测试不同定价策略
    BigDecimal price = BigDecimal.valueOf(100);
    int quantity = 5;

    assertEquals(BigDecimal.valueOf(500),
                 PricingStrategy.NORMAL.calculate(price, quantity));
    assertEquals(BigDecimal.valueOf(400),
                 PricingStrategy.VIP.calculate(price, quantity));
}
```

### 5. 安全性考虑

```java
/**
 * 字典值安全校验
 */
@Component
public class DictValueValidator {

    /**
     * 校验字典值是否合法
     */
    public boolean isValidValue(String dictType, String value) {
        if (StringUtils.isBlank(value)) {
            return false;
        }

        // 检查特殊字符
        if (containsSpecialChars(value)) {
            return false;
        }

        // 检查长度
        if (value.length() > 100) {
            return false;
        }

        return true;
    }

    /**
     * 检查是否包含危险字符
     */
    private boolean containsSpecialChars(String value) {
        String pattern = "[<>\"'&;]";
        return Pattern.compile(pattern).matcher(value).find();
    }

    /**
     * 清理字典值
     */
    public String sanitizeValue(String value) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        return value.replaceAll("[<>\"'&;]", "")
                    .trim()
                    .substring(0, Math.min(value.length(), 100));
    }
}
```

## 总结

字典枚举系统为ruoyi-plus-uniapp提供了统一、类型安全的字典数据管理方案，通过规范的设计模式和丰富的内置字典，大大提高了开发效率和代码质量。合理使用字典枚举可以有效避免魔法字符串，提升代码的可读性和维护性。

本文档涵盖了字典枚举的核心功能：

1. **基础设计模式** - 统一的枚举结构规范
2. **策略模式集成** - 在枚举中实现业务策略
3. **工厂模式应用** - 使用枚举创建对象实例
4. **状态机实现** - 管理复杂的状态流转逻辑
5. **动态字典系统** - 数据库字典与枚举的结合
6. **Excel集成** - 字典与导入导出的自动转换
7. **权限控制** - 根据角色过滤字典项
8. **变更审计** - 记录字典数据的变更历史

通过这些功能的合理运用，可以构建出灵活、可维护、高性能的字典管理体系。
