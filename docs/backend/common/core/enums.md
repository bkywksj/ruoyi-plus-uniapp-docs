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

## 注意事项

### 1. 性能考虑

- 使用静态缓存Map提高查找性能
- 避免在循环中频繁调用getByValue方法
- 考虑使用枚举序号进行比较

### 2. 兼容性

- 新增枚举项时考虑向后兼容
- 删除枚举项需要检查现有数据
- 修改枚举值需要同步更新数据库

### 3. 维护性

- 保持枚举命名的一致性
- 及时更新相关文档
- 定期检查未使用的枚举项

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
```

## 总结

字典枚举系统为ruoyi-plus-uniapp提供了统一、类型安全的字典数据管理方案，通过规范的设计模式和丰富的内置字典，大大提高了开发效率和代码质量。合理使用字典枚举可以有效避免魔法字符串，提升代码的可读性和维护性。
