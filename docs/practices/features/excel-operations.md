# Excel 操作最佳实践

本文档详细介绍 RuoYi-Plus 框架中 Excel 导入导出的最佳实践，包括注解配置、数据转换、样式定制、大数据处理等核心功能的使用指南。

## 概述

RuoYi-Plus 框架基于 FastExcel（原 EasyExcel）封装了功能完善的 Excel 处理模块，提供注解驱动的导入导出方案，支持字典转换、数据校验、单元格合并、下拉框等高级特性。

### 核心特性

- **注解驱动** - 通过注解配置字段映射、格式转换、样式定制
- **字典转换** - 自动将字典编码转换为可读文本
- **数据校验** - 集成 Bean Validation，支持导入数据校验
- **大数值处理** - 自动处理超过 15 位的大数值防止精度丢失
- **单元格合并** - 支持相同值自动合并
- **下拉框支持** - 支持单级和级联下拉框
- **批注提示** - 支持单元格批注说明

### 模块结构

```text
ruoyi-common-excel/
├── annotation/                # 注解定义
│   ├── ExcelDictFormat.java  # 字典格式化注解
│   ├── ExcelEnumFormat.java  # 枚举格式化注解
│   ├── ExcelRequired.java    # 必填字段注解
│   ├── ExcelNotation.java    # 批注注解
│   └── CellMerge.java        # 单元格合并注解
├── convert/                   # 转换器
│   ├── ExcelDictConvert.java # 字典转换器
│   ├── ExcelEnumConvert.java # 枚举转换器
│   └── ExcelBigNumberConvert.java # 大数值转换器
├── core/                      # 核心类
│   ├── DefaultExcelListener.java  # 默认导入监听器
│   ├── ExcelResult.java      # 导入结果
│   ├── CellMergeHandler.java # 合并处理器
│   ├── CellMergeStrategy.java # 合并策略
│   ├── DataWriteHandler.java # 数据写入处理器
│   ├── ExcelDownHandler.java # 下拉框处理器
│   └── DropDownOptions.java  # 下拉框配置
├── handler/                   # 处理器
│   └── ExcelNamedHandler.java
└── utils/                     # 工具类
    └── ExcelUtil.java        # Excel工具类
```

---

## 基础配置

### 依赖引入

```xml
<!-- ruoyi-common-excel 模块 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-excel</artifactId>
</dependency>
```

### 核心工具类

`ExcelUtil` 是所有 Excel 操作的入口，提供了丰富的导入导出方法：

```java
public class ExcelUtil {

    /**
     * 导出Excel
     *
     * @param list      数据列表
     * @param sheetName Sheet名称
     * @param clazz     实体类型
     * @param response  响应对象
     */
    public static <T> void exportExcel(List<T> list, String sheetName,
                                       Class<T> clazz, HttpServletResponse response);

    /**
     * 导入Excel
     *
     * @param is    输入流
     * @param clazz 实体类型
     * @return 数据列表
     */
    public static <T> List<T> importExcel(InputStream is, Class<T> clazz);

    /**
     * 导入Excel（带校验）
     *
     * @param is        输入流
     * @param clazz     实体类型
     * @param isValidate 是否启用校验
     * @return 导入结果
     */
    public static <T> ExcelResult<T> importExcel(InputStream is,
                                                  Class<T> clazz, boolean isValidate);
}
```

---

## 导出功能

### 基础导出

#### 实体类定义

使用 `@ExcelProperty` 注解标注需要导出的字段：

```java
@Data
public class SysUserExportVo {

    /** 用户ID */
    @ExcelProperty(value = "用户ID")
    private Long userId;

    /** 用户账号 */
    @ExcelProperty(value = "用户账号")
    private String userName;

    /** 用户昵称 */
    @ExcelProperty(value = "用户昵称")
    private String nickName;

    /** 用户邮箱 */
    @ExcelProperty(value = "用户邮箱")
    private String email;

    /** 手机号码 */
    @ExcelProperty(value = "手机号码")
    private String phonenumber;

    /** 用户性别 */
    @ExcelProperty(value = "用户性别", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "sys_user_sex")
    private String sex;

    /** 帐号状态 */
    @ExcelProperty(value = "帐号状态", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "sys_normal_disable")
    private String status;

    /** 创建时间 */
    @ExcelProperty(value = "创建时间")
    private Date createTime;
}
```

#### Controller 实现

```java
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    @Resource
    private ISysUserService userService;

    /**
     * 导出用户列表
     */
    @PostMapping("/export")
    public void export(SysUserBo bo, HttpServletResponse response) {
        List<SysUserVo> list = userService.selectUserList(bo);

        // 转换为导出VO
        List<SysUserExportVo> exportList = BeanUtil.copyToList(list, SysUserExportVo.class);

        // 导出Excel
        ExcelUtil.exportExcel(exportList, "用户数据", SysUserExportVo.class, response);
    }
}
```

### 字典转换

#### @ExcelDictFormat 注解

用于配置字典转换规则：

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelDictFormat {

    /**
     * 字典类型（从系统字典获取）
     * 如果设置了 dictType，优先使用系统字典
     */
    String dictType() default "";

    /**
     * 读取转换表达式
     * 格式：0=男,1=女,2=未知
     * 用于导入时将文本转换为编码
     */
    String readConverterExp() default "";

    /**
     * 分隔符（用于多选字典）
     * 默认为逗号
     */
    String separator() default ",";
}
```

#### 使用系统字典

```java
// 使用系统字典类型
@ExcelProperty(value = "用户性别", converter = ExcelDictConvert.class)
@ExcelDictFormat(dictType = "sys_user_sex")
private String sex;

// 使用自定义字典表达式
@ExcelProperty(value = "状态", converter = ExcelDictConvert.class)
@ExcelDictFormat(readConverterExp = "0=禁用,1=启用")
private String status;
```

#### 字典转换器实现

```java
public class ExcelDictConvert implements Converter<Object> {

    @Override
    public Class<?> supportJavaTypeKey() {
        return Object.class;
    }

    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        return null;
    }

    /**
     * 导入时：Excel文本 → Java对象
     */
    @Override
    public Object convertToJavaData(ReadCellData<?> cellData,
            ExcelContentProperty contentProperty,
            GlobalConfiguration globalConfiguration) {
        ExcelDictFormat annotation = getAnnotation(contentProperty);
        String label = cellData.getStringValue();

        // 文本转编码
        String dictType = annotation.dictType();
        if (StringUtils.isNotBlank(dictType)) {
            // 从系统字典获取
            return DictUtils.getDictValue(dictType, label);
        } else {
            // 使用转换表达式
            return ExcelUtil.reverseByExp(label, annotation.readConverterExp(),
                    annotation.separator());
        }
    }

    /**
     * 导出时：Java对象 → Excel文本
     */
    @Override
    public WriteCellData<?> convertToExcelData(Object value,
            ExcelContentProperty contentProperty,
            GlobalConfiguration globalConfiguration) {
        if (ObjectUtil.isNull(value)) {
            return new WriteCellData<>("");
        }

        ExcelDictFormat annotation = getAnnotation(contentProperty);
        String dictType = annotation.dictType();

        String label;
        if (StringUtils.isNotBlank(dictType)) {
            // 从系统字典获取标签
            label = DictUtils.getDictLabel(dictType, value.toString());
        } else {
            // 使用转换表达式
            label = ExcelUtil.convertByExp(value.toString(),
                    annotation.readConverterExp(), annotation.separator());
        }

        return new WriteCellData<>(label);
    }
}
```

### 枚举转换

#### @ExcelEnumFormat 注解

用于枚举值与标签的转换：

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelEnumFormat {

    /**
     * 枚举类
     */
    Class<? extends Enum<?>> enumClass();

    /**
     * 枚举标签字段名
     * 默认为 "label"
     */
    String labelField() default "label";

    /**
     * 枚举值字段名
     * 默认为 "value"
     */
    String valueField() default "value";
}
```

#### 使用示例

```java
// 定义枚举
public enum UserStatus {
    NORMAL("0", "正常"),
    DISABLE("1", "停用");

    private final String value;
    private final String label;

    // getter...
}

// 实体类使用
@ExcelProperty(value = "状态", converter = ExcelEnumConvert.class)
@ExcelEnumFormat(enumClass = UserStatus.class)
private String status;
```

### 大数值处理

#### 问题背景

Excel 对数值类型的精度限制为 15 位，超过 15 位的数值（如用户 ID、身份证号、订单号）会出现精度丢失问题。

#### 解决方案

使用 `ExcelBigNumberConvert` 转换器自动处理：

```java
public class ExcelBigNumberConvert implements Converter<Long> {

    @Override
    public WriteCellData<?> convertToExcelData(Long value,
            ExcelContentProperty contentProperty,
            GlobalConfiguration globalConfiguration) {

        if (ObjectUtil.isNull(value)) {
            return new WriteCellData<>("");
        }

        // 判断数值长度
        String strValue = value.toString();
        if (strValue.length() > 15) {
            // 超过15位，使用字符串格式防止精度丢失
            return new WriteCellData<>(strValue);
        } else {
            // 15位以内，使用数值格式便于计算
            WriteCellData<Long> cellData = new WriteCellData<>(BigDecimal.valueOf(value));
            cellData.setType(CellDataTypeEnum.NUMBER);
            return cellData;
        }
    }
}
```

#### 使用示例

```java
// 用户ID（可能超过15位）
@ExcelProperty(value = "用户ID", converter = ExcelBigNumberConvert.class)
private Long userId;

// 订单号
@ExcelProperty(value = "订单号", converter = ExcelBigNumberConvert.class)
private Long orderId;
```

### 必填字段标识

#### @ExcelRequired 注解

用于标识必填字段，导出时显示红色字体：

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelRequired {

    /**
     * 字体颜色（RGB）
     * 默认红色
     */
    short fontColor() default IndexedColors.RED.getIndex();
}
```

#### 使用示例

```java
@ExcelRequired  // 表头显示红色字体
@ExcelProperty(value = "用户名")
private String userName;

@ExcelRequired
@ExcelProperty(value = "手机号")
private String phone;
```

### 批注提示

#### @ExcelNotation 注解

用于添加单元格批注说明：

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelNotation {

    /**
     * 批注内容
     */
    String value();
}
```

#### 使用示例

```java
@ExcelNotation(value = "请填写真实姓名，长度2-20个字符")
@ExcelProperty(value = "姓名")
private String name;

@ExcelNotation(value = "格式：yyyy-MM-dd，如：2024-01-01")
@ExcelProperty(value = "出生日期")
private Date birthday;
```

### 单元格合并

#### @CellMerge 注解

用于相同值自动合并单元格：

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CellMerge {

    /**
     * 列索引（从0开始）
     * 默认-1表示使用字段顺序
     */
    int index() default -1;

    /**
     * 合并依据字段
     * 可指定多个字段作为合并条件
     */
    String[] mergeBy() default {};
}
```

#### 使用示例

```java
@Data
public class OrderExportVo {

    @CellMerge  // 相同订单号自动合并
    @ExcelProperty(value = "订单号")
    private String orderNo;

    @CellMerge  // 相同客户名称自动合并
    @ExcelProperty(value = "客户名称")
    private String customerName;

    @ExcelProperty(value = "商品名称")
    private String productName;

    @ExcelProperty(value = "数量")
    private Integer quantity;

    @ExcelProperty(value = "单价")
    private BigDecimal price;
}
```

#### 合并处理器

```java
public class CellMergeHandler {

    /**
     * 计算需要合并的单元格区域
     *
     * @param list 数据列表
     * @param clazz 实体类
     * @return 合并区域列表
     */
    public static List<CellRangeAddress> handle(List<?> list, Class<?> clazz) {
        List<CellRangeAddress> mergeList = new ArrayList<>();

        if (CollUtil.isEmpty(list)) {
            return mergeList;
        }

        // 获取带有 @CellMerge 注解的字段
        Field[] fields = clazz.getDeclaredFields();

        for (int i = 0; i < fields.length; i++) {
            Field field = fields[i];
            CellMerge cellMerge = field.getAnnotation(CellMerge.class);

            if (cellMerge != null) {
                // 计算该列的合并区域
                int colIndex = cellMerge.index() >= 0 ? cellMerge.index() : i;
                mergeList.addAll(calculateMergeRegions(list, field, colIndex));
            }
        }

        return mergeList;
    }

    private static List<CellRangeAddress> calculateMergeRegions(
            List<?> list, Field field, int colIndex) {
        List<CellRangeAddress> regions = new ArrayList<>();
        field.setAccessible(true);

        int startRow = 1; // 从第二行开始（第一行是表头）
        Object prevValue = null;
        int mergeStart = startRow;

        for (int i = 0; i < list.size(); i++) {
            try {
                Object currentValue = field.get(list.get(i));
                int currentRow = startRow + i;

                if (i == 0) {
                    prevValue = currentValue;
                } else if (!Objects.equals(prevValue, currentValue)) {
                    // 值变化，记录合并区域
                    if (currentRow - mergeStart > 1) {
                        regions.add(new CellRangeAddress(
                            mergeStart, currentRow - 1, colIndex, colIndex));
                    }
                    mergeStart = currentRow;
                    prevValue = currentValue;
                }

                // 最后一行特殊处理
                if (i == list.size() - 1 && currentRow - mergeStart >= 1) {
                    regions.add(new CellRangeAddress(
                        mergeStart, currentRow, colIndex, colIndex));
                }
            } catch (IllegalAccessException e) {
                // 忽略
            }
        }

        return regions;
    }
}
```

### 下拉框支持

#### DropDownOptions 配置

用于配置单元格下拉框选项：

```java
public class DropDownOptions {

    /** 列索引（从0开始） */
    private int index;

    /** 下拉选项列表 */
    private List<String> options;

    /** 父级下拉框配置（用于级联） */
    private DropDownOptions parent;

    /**
     * 创建单级下拉框
     */
    public DropDownOptions(int index, List<String> options) {
        this.index = index;
        this.options = options;
    }

    /**
     * 构建级联下拉框
     */
    public static <P, S> List<DropDownOptions> buildLinkedOptions(
            List<P> parentList,
            int parentIndex,
            List<S> sonList,
            int sonIndex,
            Function<P, Object> parentIdFunc,
            Function<S, Object> sonParentIdFunc,
            Function<?, String> optionBuildFunc) {
        // 构建父子级联关系
        // ...
    }
}
```

#### 使用示例

```java
// 在Controller中设置下拉框
@PostMapping("/export")
public void export(HttpServletResponse response) {
    List<UserExportVo> list = userService.getExportList();

    // 配置下拉框选项
    List<DropDownOptions> dropDownOptions = new ArrayList<>();

    // 性别下拉框（第3列）
    dropDownOptions.add(new DropDownOptions(2, Arrays.asList("男", "女", "未知")));

    // 状态下拉框（第4列）
    dropDownOptions.add(new DropDownOptions(3, Arrays.asList("正常", "停用")));

    // 导出带下拉框的Excel
    ExcelUtil.exportExcel(list, "用户数据", UserExportVo.class,
            response, dropDownOptions);
}
```

#### 级联下拉框

```java
// 省市级联下拉框示例
@PostMapping("/exportWithCascade")
public void exportWithCascade(HttpServletResponse response) {
    List<AddressExportVo> list = addressService.getExportList();

    // 获取省份和城市数据
    List<Province> provinces = areaService.getProvinces();
    List<City> cities = areaService.getCities();

    // 构建级联下拉框
    List<DropDownOptions> dropDownOptions = DropDownOptions.buildLinkedOptions(
        provinces,      // 父数据
        1,              // 省份列索引
        cities,         // 子数据
        2,              // 城市列索引
        Province::getId,    // 获取省份ID
        City::getProvinceId, // 获取城市的省份ID
        area -> area.getName() // 构建选项文本
    );

    ExcelUtil.exportExcel(list, "地址数据", AddressExportVo.class,
            response, dropDownOptions);
}
```

### 模板导出

#### 基础模板导出

```java
/**
 * 使用模板导出
 *
 * @param templatePath 模板路径
 * @param data 填充数据
 * @param response 响应对象
 */
public static void exportTemplate(String templatePath,
        Map<String, Object> data, HttpServletResponse response) {
    try {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("导出数据", StandardCharsets.UTF_8);
        response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

        InputStream templateStream = ExcelUtil.class.getClassLoader()
                .getResourceAsStream(templatePath);

        ExcelWriter excelWriter = FastExcel.write(response.getOutputStream())
                .withTemplate(templateStream)
                .build();

        WriteSheet writeSheet = FastExcel.writerSheet().build();
        excelWriter.fill(data, writeSheet);
        excelWriter.finish();
    } catch (IOException e) {
        throw new RuntimeException("模板导出失败", e);
    }
}
```

#### 使用示例

```java
@PostMapping("/exportByTemplate")
public void exportByTemplate(Long orderId, HttpServletResponse response) {
    // 获取订单数据
    OrderVo order = orderService.getById(orderId);

    // 准备填充数据
    Map<String, Object> data = new HashMap<>();
    data.put("orderNo", order.getOrderNo());
    data.put("customerName", order.getCustomerName());
    data.put("createTime", order.getCreateTime());
    data.put("totalAmount", order.getTotalAmount());
    data.put("items", order.getItems()); // 明细列表

    // 使用模板导出
    ExcelUtil.exportTemplate("templates/order_template.xlsx", data, response);
}
```

---

## 导入功能

### 基础导入

#### 实体类定义

```java
@Data
public class SysUserImportVo {

    @ExcelProperty(value = "用户账号")
    @NotBlank(message = "用户账号不能为空")
    @Size(min = 2, max = 20, message = "用户账号长度必须在2-20个字符之间")
    private String userName;

    @ExcelProperty(value = "用户昵称")
    @NotBlank(message = "用户昵称不能为空")
    private String nickName;

    @ExcelProperty(value = "用户邮箱")
    @Email(message = "邮箱格式不正确")
    private String email;

    @ExcelProperty(value = "手机号码")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phonenumber;

    @ExcelProperty(value = "用户性别", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "sys_user_sex")
    private String sex;

    @ExcelProperty(value = "帐号状态", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "sys_normal_disable")
    private String status;
}
```

#### Controller 实现

```java
@PostMapping("/import")
public R<String> importData(@RequestPart("file") MultipartFile file,
                            @RequestParam(defaultValue = "false") boolean updateSupport)
        throws Exception {

    // 导入并校验
    ExcelResult<SysUserImportVo> result = ExcelUtil.importExcel(
            file.getInputStream(),
            SysUserImportVo.class,
            true  // 启用校验
    );

    // 获取成功数据和错误信息
    List<SysUserImportVo> userList = result.getList();
    List<String> errorList = result.getErrorList();

    // 处理错误
    if (CollUtil.isNotEmpty(errorList)) {
        return R.fail(String.join("\n", errorList));
    }

    // 执行导入
    String message = userService.importUser(userList, updateSupport);
    return R.ok(message);
}
```

### 导入监听器

#### DefaultExcelListener

默认导入监听器，支持数据校验和错误收集：

```java
public class DefaultExcelListener<T> extends AnalysisEventListener<T> {

    /** 成功数据列表 */
    private final List<T> list = new ArrayList<>();

    /** 错误信息列表 */
    private final List<String> errorList = new ArrayList<>();

    /** 是否启用校验 */
    private final boolean isValidate;

    /** 校验器 */
    private final Validator validator;

    /** 当前行号 */
    private int rowIndex = 1;

    public DefaultExcelListener(boolean isValidate) {
        this.isValidate = isValidate;
        this.validator = SpringUtils.getBean(Validator.class);
    }

    @Override
    public void invoke(T data, AnalysisContext context) {
        rowIndex++;

        if (isValidate) {
            // 执行Bean校验
            Set<ConstraintViolation<T>> violations = validator.validate(data);
            if (CollUtil.isNotEmpty(violations)) {
                // 收集校验错误
                for (ConstraintViolation<T> violation : violations) {
                    String error = String.format("第%d行: %s",
                            rowIndex, violation.getMessage());
                    errorList.add(error);
                }
                return;
            }
        }

        list.add(data);
    }

    @Override
    public void onException(Exception exception, AnalysisContext context) {
        String error;

        if (exception instanceof ExcelDataConvertException convertException) {
            // 类型转换异常
            Integer columnIndex = convertException.getColumnIndex();
            error = String.format("第%d行第%d列: 数据格式错误",
                    rowIndex, columnIndex + 1);
        } else {
            error = String.format("第%d行: %s", rowIndex, exception.getMessage());
        }

        errorList.add(error);
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 解析完成后的处理
    }

    /**
     * 获取导入结果
     */
    public ExcelResult<T> getExcelResult() {
        return new ExcelResult<>(list, errorList, getAnalysis());
    }

    private String getAnalysis() {
        int successCount = list.size();
        int errorCount = errorList.size();
        return String.format("导入完成，成功%d条，失败%d条", successCount, errorCount);
    }
}
```

### 导入结果

#### ExcelResult 类

封装导入结果，包含成功数据、错误信息和分析报告：

```java
@Data
@AllArgsConstructor
public class ExcelResult<T> {

    /** 成功数据列表 */
    private List<T> list;

    /** 错误信息列表 */
    private List<String> errorList;

    /** 分析报告 */
    private String analysis;

    /**
     * 是否全部成功
     */
    public boolean isSuccess() {
        return CollUtil.isEmpty(errorList);
    }

    /**
     * 获取成功数量
     */
    public int getSuccessCount() {
        return list != null ? list.size() : 0;
    }

    /**
     * 获取失败数量
     */
    public int getErrorCount() {
        return errorList != null ? errorList.size() : 0;
    }
}
```

### 自定义导入监听器

对于复杂的导入场景，可以自定义监听器：

```java
public class UserImportListener extends AnalysisEventListener<SysUserImportVo> {

    private final ISysUserService userService;
    private final List<SysUserImportVo> list = new ArrayList<>();
    private final List<String> errorList = new ArrayList<>();
    private final boolean updateSupport;
    private int rowIndex = 1;

    public UserImportListener(ISysUserService userService, boolean updateSupport) {
        this.userService = userService;
        this.updateSupport = updateSupport;
    }

    @Override
    public void invoke(SysUserImportVo data, AnalysisContext context) {
        rowIndex++;

        // 业务校验
        try {
            // 检查用户名是否存在
            SysUser existUser = userService.selectUserByUserName(data.getUserName());
            if (existUser != null && !updateSupport) {
                errorList.add(String.format("第%d行: 用户账号'%s'已存在",
                        rowIndex, data.getUserName()));
                return;
            }

            // 检查手机号是否存在
            if (StringUtils.isNotEmpty(data.getPhonenumber())) {
                SysUser phoneUser = userService.selectUserByPhone(data.getPhonenumber());
                if (phoneUser != null &&
                        (existUser == null || !phoneUser.getUserId().equals(existUser.getUserId()))) {
                    errorList.add(String.format("第%d行: 手机号'%s'已被使用",
                            rowIndex, data.getPhonenumber()));
                    return;
                }
            }

            list.add(data);

        } catch (Exception e) {
            errorList.add(String.format("第%d行: %s", rowIndex, e.getMessage()));
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 批量保存
        if (CollUtil.isNotEmpty(list)) {
            userService.batchImport(list, updateSupport);
        }
    }

    // getter...
}
```

---

## 样式定制

### 表头样式

默认表头样式（灰色背景、白色文字、微软雅黑字体）：

```java
public class DataWriteHandler implements SheetWriteHandler, CellWriteHandler {

    @Override
    public void afterCellDispose(CellWriteHandlerContext context) {
        Cell cell = context.getCell();
        Workbook workbook = context.getWriteWorkbookHolder().getWorkbook();

        // 表头行处理
        if (context.getHead()) {
            CellStyle style = workbook.createCellStyle();

            // 背景色：灰色
            style.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // 字体：白色、微软雅黑
            Font font = workbook.createFont();
            font.setColor(IndexedColors.WHITE.getIndex());
            font.setFontName("微软雅黑");
            font.setBold(true);
            style.setFont(font);

            // 边框
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            style.setBorderTop(BorderStyle.THIN);

            // 居中
            style.setAlignment(HorizontalAlignment.CENTER);
            style.setVerticalAlignment(VerticalAlignment.CENTER);

            cell.setCellStyle(style);
        }
    }
}
```

### 必填字段样式

为必填字段添加红色字体：

```java
@Override
public void afterCellDispose(CellWriteHandlerContext context) {
    if (context.getHead()) {
        Cell cell = context.getCell();
        int columnIndex = cell.getColumnIndex();

        // 获取字段注解
        Field field = getFieldByIndex(context, columnIndex);
        if (field != null && field.isAnnotationPresent(ExcelRequired.class)) {
            ExcelRequired required = field.getAnnotation(ExcelRequired.class);

            // 设置红色字体
            Workbook workbook = context.getWriteWorkbookHolder().getWorkbook();
            CellStyle style = cell.getCellStyle();

            Font font = workbook.createFont();
            font.setColor(required.fontColor());
            font.setFontName("微软雅黑");
            font.setBold(true);
            style.setFont(font);

            cell.setCellStyle(style);
        }
    }
}
```

### 添加批注

为字段添加批注提示：

```java
@Override
public void afterCellDispose(CellWriteHandlerContext context) {
    if (context.getHead()) {
        Cell cell = context.getCell();
        int columnIndex = cell.getColumnIndex();

        Field field = getFieldByIndex(context, columnIndex);
        if (field != null && field.isAnnotationPresent(ExcelNotation.class)) {
            ExcelNotation notation = field.getAnnotation(ExcelNotation.class);

            // 创建批注
            Sheet sheet = cell.getSheet();
            Drawing<?> drawing = sheet.createDrawingPatriarch();

            CreationHelper factory = sheet.getWorkbook().getCreationHelper();
            ClientAnchor anchor = factory.createClientAnchor();

            // 设置批注位置
            anchor.setCol1(columnIndex);
            anchor.setCol2(columnIndex + 2);
            anchor.setRow1(cell.getRowIndex());
            anchor.setRow2(cell.getRowIndex() + 3);

            Comment comment = drawing.createCellComment(anchor);
            comment.setString(factory.createRichTextString(notation.value()));
            cell.setCellComment(comment);
        }
    }
}
```

---

## 大数据量处理

### 分页导出

对于大数据量导出，使用分页查询避免内存溢出：

```java
@PostMapping("/exportLarge")
public void exportLarge(SysUserBo bo, HttpServletResponse response) throws IOException {
    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setCharacterEncoding("utf-8");
    String fileName = URLEncoder.encode("用户数据", StandardCharsets.UTF_8);
    response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

    // 使用流式写入
    try (ExcelWriter excelWriter = FastExcel.write(response.getOutputStream(),
            SysUserExportVo.class).build()) {

        WriteSheet writeSheet = FastExcel.writerSheet("用户数据").build();

        // 分页导出
        int pageNum = 1;
        int pageSize = 5000;

        while (true) {
            PageQuery pageQuery = new PageQuery();
            pageQuery.setPageNum(pageNum);
            pageQuery.setPageSize(pageSize);

            List<SysUserVo> list = userService.selectUserList(bo, pageQuery);

            if (CollUtil.isEmpty(list)) {
                break;
            }

            // 转换并写入
            List<SysUserExportVo> exportList = BeanUtil.copyToList(list, SysUserExportVo.class);
            excelWriter.write(exportList, writeSheet);

            if (list.size() < pageSize) {
                break;
            }

            pageNum++;
        }
    }
}
```

### 多 Sheet 导出

```java
@PostMapping("/exportMultiSheet")
public void exportMultiSheet(HttpServletResponse response) throws IOException {
    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setCharacterEncoding("utf-8");
    String fileName = URLEncoder.encode("多Sheet数据", StandardCharsets.UTF_8);
    response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

    try (ExcelWriter excelWriter = FastExcel.write(response.getOutputStream()).build()) {
        // Sheet1: 用户数据
        List<SysUserExportVo> userList = userService.getExportList();
        WriteSheet userSheet = FastExcel.writerSheet(0, "用户数据")
                .head(SysUserExportVo.class).build();
        excelWriter.write(userList, userSheet);

        // Sheet2: 部门数据
        List<SysDeptExportVo> deptList = deptService.getExportList();
        WriteSheet deptSheet = FastExcel.writerSheet(1, "部门数据")
                .head(SysDeptExportVo.class).build();
        excelWriter.write(deptList, deptSheet);

        // Sheet3: 角色数据
        List<SysRoleExportVo> roleList = roleService.getExportList();
        WriteSheet roleSheet = FastExcel.writerSheet(2, "角色数据")
                .head(SysRoleExportVo.class).build();
        excelWriter.write(roleList, roleSheet);
    }
}
```

### 异步导出

对于耗时的导出任务，使用异步处理：

```java
@PostMapping("/exportAsync")
public R<String> exportAsync(SysUserBo bo) {
    // 生成任务ID
    String taskId = IdUtil.fastSimpleUUID();

    // 异步执行导出
    CompletableFuture.runAsync(() -> {
        try {
            // 查询数据
            List<SysUserVo> list = userService.selectUserList(bo);
            List<SysUserExportVo> exportList = BeanUtil.copyToList(list, SysUserExportVo.class);

            // 导出到临时文件
            String filePath = "/tmp/export/" + taskId + ".xlsx";
            FastExcel.write(filePath, SysUserExportVo.class)
                    .sheet("用户数据")
                    .doWrite(exportList);

            // 上传到OSS
            OssClient ossClient = OssFactory.instance();
            UploadResult result = ossClient.uploadFile(
                    new File(filePath), "export/" + taskId + ".xlsx", null);

            // 更新任务状态
            exportTaskService.updateStatus(taskId, "completed", result.getUrl());

            // 删除临时文件
            FileUtil.del(filePath);

        } catch (Exception e) {
            exportTaskService.updateStatus(taskId, "failed", e.getMessage());
        }
    });

    return R.ok("导出任务已提交，任务ID：" + taskId);
}

@GetMapping("/exportStatus/{taskId}")
public R<ExportTaskVo> getExportStatus(@PathVariable String taskId) {
    ExportTaskVo task = exportTaskService.getById(taskId);
    return R.ok(task);
}
```

---

## 前端集成

### Element Plus 导入组件

```vue
<template>
  <el-dialog v-model="visible" title="导入数据" width="500px">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      class="upload-demo"
      drag
      :action="uploadUrl"
      :headers="headers"
      :accept="'.xlsx,.xls'"
      :limit="1"
      :auto-upload="false"
      :on-change="handleChange"
      :on-success="handleSuccess"
      :on-error="handleError"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          只能上传 xlsx/xls 文件，且不超过10MB
        </div>
      </template>
    </el-upload>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="info" @click="downloadTemplate">下载模板</el-button>
      <el-button type="primary" @click="submitUpload" :loading="loading">
        确认导入
      </el-button>
    </template>
  </el-dialog>

  <!-- 导入结果 -->
  <el-dialog v-model="resultVisible" title="导入结果" width="600px">
    <el-result
      :icon="result.success ? 'success' : 'warning'"
      :title="result.title"
      :sub-title="result.subTitle"
    >
      <template #extra>
        <div v-if="result.errors.length > 0" class="error-list">
          <el-alert
            v-for="(error, index) in result.errors"
            :key="index"
            :title="error"
            type="error"
            :closable="false"
          />
        </div>
      </template>
    </el-result>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { downloadTemplate as downloadTemplateApi } from '@/api/system/user'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const uploadRef = ref()
const fileList = ref([])
const loading = ref(false)
const resultVisible = ref(false)
const result = ref({
  success: false,
  title: '',
  subTitle: '',
  errors: [] as string[]
})

const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/system/user/import`
})

const headers = computed(() => ({
  Authorization: 'Bearer ' + getToken()
}))

const handleChange = (file: any) => {
  // 文件类型校验
  const isExcel = /\.(xlsx|xls)$/.test(file.name)
  if (!isExcel) {
    ElMessage.error('只能上传 xlsx/xls 格式的文件')
    fileList.value = []
    return false
  }

  // 文件大小校验
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    fileList.value = []
    return false
  }

  return true
}

const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  loading.value = true
  uploadRef.value.submit()
}

const handleSuccess = (response: any) => {
  loading.value = false

  if (response.code === 200) {
    result.value = {
      success: true,
      title: '导入成功',
      subTitle: response.msg || '数据已成功导入',
      errors: []
    }
    emit('success')
  } else {
    const errors = response.msg?.split('\n') || ['导入失败']
    result.value = {
      success: false,
      title: '导入失败',
      subTitle: `共${errors.length}条数据导入失败`,
      errors: errors
    }
  }

  resultVisible.value = true
  fileList.value = []
}

const handleError = () => {
  loading.value = false
  ElMessage.error('导入失败，请检查文件格式')
  fileList.value = []
}

const downloadTemplate = async () => {
  try {
    await downloadTemplateApi()
    ElMessage.success('模板下载成功')
  } catch (error) {
    ElMessage.error('模板下载失败')
  }
}
</script>

<style scoped>
.error-list {
  max-height: 300px;
  overflow-y: auto;
}

.error-list .el-alert {
  margin-bottom: 8px;
}
</style>
```

### 导出按钮封装

```vue
<template>
  <el-button type="warning" @click="handleExport" :loading="exporting">
    <el-icon><Download /></el-icon>
    导出
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { exportUser } from '@/api/system/user'

const props = defineProps<{
  queryParams: Record<string, any>
}>()

const exporting = ref(false)

const handleExport = async () => {
  try {
    await ElMessageBox.confirm('是否确认导出用户数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    exporting.value = true
    await exportUser(props.queryParams)
    ElMessage.success('导出成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('导出失败')
    }
  } finally {
    exporting.value = false
  }
}
</script>
```

---

## 最佳实践

### 1. 使用专用的导入导出 VO

不要直接使用实体类进行导入导出，应定义专用的 VO 类：

```java
// 导出VO - 只包含需要导出的字段
@Data
public class SysUserExportVo {
    @ExcelProperty("用户账号")
    private String userName;

    @ExcelProperty("用户昵称")
    private String nickName;
    // ...
}

// 导入VO - 包含校验注解
@Data
public class SysUserImportVo {
    @NotBlank(message = "用户账号不能为空")
    @ExcelProperty("用户账号")
    private String userName;
    // ...
}
```

### 2. 合理配置字典转换

优先使用系统字典，保持数据一致性：

```java
// 推荐：使用系统字典
@ExcelDictFormat(dictType = "sys_user_sex")

// 不推荐：硬编码转换表达式（除非是临时需求）
@ExcelDictFormat(readConverterExp = "0=男,1=女")
```

### 3. 大数据量导出优化

```java
// 推荐：分页查询 + 流式写入
try (ExcelWriter writer = FastExcel.write(outputStream, clazz).build()) {
    int pageNum = 1;
    while (true) {
        List<T> list = queryByPage(pageNum, 5000);
        if (CollUtil.isEmpty(list)) break;
        writer.write(list, writeSheet);
        pageNum++;
    }
}

// 不推荐：一次性加载所有数据
List<T> allData = queryAll(); // 可能导致OOM
ExcelUtil.exportExcel(allData, ...);
```

### 4. 导入数据校验

```java
// 推荐：使用Bean Validation + 业务校验
@NotBlank(message = "用户账号不能为空")
@Size(min = 2, max = 20)
@ExcelProperty("用户账号")
private String userName;

// 在监听器中进行业务校验
if (userService.checkUserNameExists(userName)) {
    errorList.add("用户账号已存在");
}
```

### 5. 错误信息友好化

```java
// 推荐：提供清晰的错误位置和原因
String.format("第%d行第%d列【%s】: %s", rowIndex, colIndex, headerName, message)
// 输出：第5行第3列【手机号】: 手机号格式不正确

// 不推荐：笼统的错误信息
"数据格式错误"
```

---

## 常见问题

### 1. 导出的 Excel 打开提示"文件损坏"

**问题原因：**
- 响应头设置错误
- 流未正确关闭
- 异常未正确处理

**解决方案：**

```java
@PostMapping("/export")
public void export(HttpServletResponse response) {
    try {
        // 设置响应头
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("数据", StandardCharsets.UTF_8);
        response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

        // 导出
        ExcelUtil.exportExcel(list, "数据", clazz, response);

    } catch (Exception e) {
        // 清空响应，返回错误信息
        response.reset();
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        response.getWriter().write(JsonUtils.toJsonString(R.fail("导出失败")));
    }
}
```

### 2. 导入时字典转换失败

**问题原因：**
- 字典类型不存在
- Excel 中的文本与字典标签不匹配

**解决方案：**

```java
// 确保字典类型存在
@ExcelDictFormat(dictType = "sys_user_sex") // 检查字典是否已配置

// 导入前提示用户使用正确的字典值
// 可以在模板中添加数据有效性（下拉框）
```

### 3. 大数值精度丢失

**问题原因：**
- Excel 数值类型最多支持 15 位精度

**解决方案：**

```java
// 使用 ExcelBigNumberConvert 转换器
@ExcelProperty(value = "用户ID", converter = ExcelBigNumberConvert.class)
private Long userId;
```

### 4. 中文文件名乱码

**问题原因：**
- 文件名编码问题

**解决方案：**

```java
String fileName = URLEncoder.encode("用户数据", StandardCharsets.UTF_8)
        .replaceAll("\\+", "%20");
response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");
```

### 5. 内存溢出（OOM）

**问题原因：**
- 数据量过大，一次性加载到内存

**解决方案：**

```java
// 使用分页导出
// 使用流式读取导入
// 调整JVM内存参数
```

---

## 总结

RuoYi-Plus Excel 模块提供了完整的导入导出解决方案：

1. **注解驱动** - 通过注解配置，减少样板代码
2. **转换器丰富** - 字典、枚举、大数值自动转换
3. **校验完善** - 集成 Bean Validation，支持业务校验
4. **样式定制** - 支持表头样式、必填标识、批注提示
5. **性能优化** - 支持分页导出、流式处理、异步导出

合理使用这些特性，可以快速实现各种 Excel 导入导出需求。
