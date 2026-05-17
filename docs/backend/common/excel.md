# Excel处理 (excel)

Excel处理模块基于FastExcel（原EasyExcel）框架，提供了完整的Excel导入导出解决方案，支持数据校验、格式转换、单元格合并、下拉选项、动态数据源等高级功能。

## 模块概述

### 核心功能

- **Excel导入**：支持同步/异步导入，数据校验，错误收集，自定义监听器
- **Excel导出**：支持基础导出、模板导出、多Sheet导出、单元格合并
- **数据转换**：字典转换、枚举转换、大数字处理、自定义转换器
- **界面增强**：下拉选项、级联下拉、单元格合并、批注、必填标识
- **模板支持**：单表模板、多表模板、多Sheet模板填充
- **动态下拉**：支持从数据库动态获取下拉选项数据

### 技术特性

- 基于FastExcel（原EasyExcel）框架
- 支持大文件流式处理，内存占用低
- 注解驱动，配置简单
- 完善的异常处理和错误收集机制
- 灵活的扩展能力，支持自定义监听器和转换器

### 模块结构

```text
ruoyi-common-excel
├── annotation/                    # 注解定义
│   ├── CellMerge.java            # 单元格合并注解
│   ├── ExcelDictFormat.java      # 字典格式化注解
│   ├── ExcelEnumFormat.java      # 枚举格式化注解
│   ├── ExcelNotation.java        # 批注注解
│   ├── ExcelRequired.java        # 必填标识注解
│   └── ExcelDynamicOptions.java  # 动态下拉选项注解
├── convert/                       # 转换器
│   ├── ExcelDictConvert.java     # 字典转换器
│   ├── ExcelEnumConvert.java     # 枚举转换器
│   └── ExcelBigNumberConvert.java # 大数字转换器
├── core/                          # 核心类
│   ├── DefaultExcelListener.java # 默认导入监听器
│   ├── DefaultExcelResult.java   # 导入结果封装
│   ├── DropDownOptions.java      # 下拉选项配置
│   ├── CellMergeStrategy.java    # 单元格合并策略
│   ├── CellMergeHandler.java     # 单元格合并处理器
│   ├── ExcelDownHandler.java     # 下拉选项处理器
│   ├── ExcelListener.java        # 监听器接口
│   ├── ExcelResult.java          # 结果接口
│   └── ExcelOptionsProvider.java # 动态选项提供者接口
├── handler/                       # 处理器
│   └── DataWriteHandler.java     # 数据写入处理器
└── utils/
    └── ExcelUtil.java            # 核心工具类
```

## 快速开始

### 基础导入示例

```java
// 1. 定义实体类
@Data
public class UserImportVo {
    @ExcelProperty("姓名")
    @NotBlank(message = "姓名不能为空")
    private String name;

    @ExcelProperty("年龄")
    @Min(value = 0, message = "年龄不能为负数")
    private Integer age;

    @ExcelProperty("邮箱")
    @Email(message = "邮箱格式不正确")
    private String email;

    @ExcelProperty("性别")
    @ExcelDictFormat(dictType = "sys_user_gender")
    private String gender;
}

// 2. 执行导入（带数据校验）
@PostMapping("/import")
public R<String> importUser(@RequestParam("file") MultipartFile file) throws IOException {
    ExcelResult<UserImportVo> result = ExcelUtil.importExcel(
        file.getInputStream(),
        UserImportVo.class,
        true  // 启用数据校验
    );

    // 获取成功数据
    List<UserImportVo> successList = result.getList();

    // 获取错误信息
    List<String> errorList = result.getErrorList();

    if (!errorList.isEmpty()) {
        return R.fail("导入失败：" + String.join("<br/>", errorList));
    }

    // 处理导入的数据
    userService.batchInsert(successList);
    return R.ok(result.getAnalysis());  // 如：读取完成！成功100条，失败0条
}
```

### 基础导出示例

```java
@GetMapping("/export")
public void exportUser(HttpServletResponse response) {
    List<UserExportVo> users = userService.selectExportList();
    ExcelUtil.exportExcel(users, "用户信息", UserExportVo.class, response);
}

// 导出实体类
@Data
public class UserExportVo {
    @ExcelProperty("用户ID")
    private Long userId;

    @ExcelProperty("姓名")
    private String name;

    @ExcelProperty("性别")
    @ExcelDictFormat(dictType = "sys_user_gender")
    private String gender;

    @ExcelProperty("状态")
    @ExcelEnumFormat(enumClass = UserStatus.class, valueField = "value", labelField = "label")
    private Integer status;

    @ExcelProperty("创建时间")
    private Date createTime;
}
```

## 详细功能

### 1. Excel导入

#### 1.1 同步导入

适用于小数据量（建议1000条以内）的简单导入场景，不进行数据校验。

```java
// 导入为Map集合（不需要实体类）
List<Map<Integer, String>> mapData = ExcelUtil.importExcel(inputStream);

// 导入为实体对象（不校验）
List<User> users = ExcelUtil.importExcel(inputStream, User.class);
```

#### 1.2 异步导入（推荐）

支持数据校验，提供详细的错误信息，适用于生产环境。

```java
// 启用数据校验的导入
ExcelResult<User> result = ExcelUtil.importExcel(inputStream, User.class, true);

// 获取成功数据
List<User> successList = result.getList();

// 获取错误信息列表
List<String> errors = result.getErrorList();

// 获取统计信息
String analysis = result.getAnalysis(); // 如：读取完成！成功100条，失败5条
```

**错误处理机制：**

DefaultExcelListener提供了完善的错误处理：

```java
// 数据类型转换异常处理
// 输出格式：第X行-第Y列-表头Z: 解析异常
if (exception instanceof ExcelDataConvertException excelDataConvertException) {
    Integer rowIndex = excelDataConvertException.getRowIndex();
    Integer columnIndex = excelDataConvertException.getColumnIndex();
    errMsg = StrUtil.format("第{}行-第{}列-表头{}: 解析异常<br/>",
        rowIndex + 1, columnIndex + 1, headMap.get(columnIndex));
}

// Bean Validation校验异常处理
// 输出格式：第X行数据校验异常: 字段1错误, 字段2错误
if (exception instanceof ConstraintViolationException constraintViolationException) {
    Set<ConstraintViolation<?>> constraintViolations = constraintViolationException.getConstraintViolations();
    String constraintViolationsMsg = StreamUtils.join(constraintViolations, ConstraintViolation::getMessage, ", ");
    errMsg = StrUtil.format("第{}行数据校验异常: {}",
        context.readRowHolder().getRowIndex() + 1, constraintViolationsMsg);
}
```

#### 1.3 自定义监听器

对于复杂的导入逻辑，可以继承DefaultExcelListener实现自定义监听器。

```java
public class CustomUserListener extends DefaultExcelListener<User> {

    private final UserService userService;
    private final int BATCH_SIZE = 500;
    private List<User> batchList = new ArrayList<>();

    public CustomUserListener(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void invoke(User user, AnalysisContext context) {
        // 自定义数据预处理逻辑
        if (StringUtils.isNotBlank(user.getPhone())) {
            user.setPhone(formatPhone(user.getPhone()));
        }

        // 调用父类方法执行默认处理（包含校验）
        super.invoke(user, context);

        // 分批处理大数据量导入
        batchList.add(user);
        if (batchList.size() >= BATCH_SIZE) {
            userService.batchSave(batchList);
            batchList.clear();
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 处理剩余数据
        if (!batchList.isEmpty()) {
            userService.batchSave(batchList);
        }
        super.doAfterAllAnalysed(context);
    }

    @Override
    public void onException(Exception exception, AnalysisContext context) {
        // 自定义异常处理逻辑
        log.error("数据处理异常，行号：{}", context.readRowHolder().getRowIndex(), exception);
        super.onException(exception, context);
    }

    private String formatPhone(String phone) {
        // 格式化手机号逻辑
        return phone.replaceAll("[^0-9]", "");
    }
}

// 使用自定义监听器
CustomUserListener listener = new CustomUserListener(userService);
ExcelResult<User> result = ExcelUtil.importExcel(inputStream, User.class, listener);
```

### 2. Excel导出

#### 2.1 基础导出

```java
// 导出到HTTP响应
ExcelUtil.exportExcel(userList, "用户信息", User.class, response);

// 导出到输出流
ExcelUtil.exportExcel(userList, "用户信息", User.class, outputStream);
```

**导出时自动注册的处理器：**

```java
ExcelWriterSheetBuilder builder = FastExcel.write(os, clazz)
    .autoCloseStream(false)
    // 自动列宽
    .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
    // 大数字转换器（防止精度丢失）
    .registerConverter(new ExcelBigNumberConvert())
    // 批注和必填标识处理器
    .registerWriteHandler(new DataWriteHandler(clazz))
    // 默认样式
    .registerWriteHandler(initCellStyle())
    .sheet(sheetName);
```

#### 2.2 单元格合并导出

适用于相同数据需要合并显示的场景，如部门统计报表。

```java
// 实体类配置
@Data
public class DepartmentUserVo {
    @CellMerge  // 相同部门的单元格将被合并
    @ExcelProperty("部门")
    private String department;

    @CellMerge(mergeBy = {"department"})  // 在同一部门内合并相同团队
    @ExcelProperty("团队")
    private String team;

    @CellMerge(mergeBy = {"department", "team"})  // 在同一部门同一团队内合并
    @ExcelProperty("职位")
    private String position;

    @ExcelProperty("姓名")
    private String name;

    @ExcelProperty("薪资")
    private BigDecimal salary;
}

// 导出时启用合并
ExcelUtil.exportExcel(deptUsers, "部门用户", DepartmentUserVo.class, true, response);
```

**合并算法原理：**

CellMergeHandler通过以下步骤计算合并区域：

1. 扫描实体类中带有@CellMerge注解的字段
2. 遍历数据列表，对比相邻行的字段值
3. 如果指定了mergeBy属性，还需对比依赖字段的值
4. 相同值的连续行将被合并为一个单元格

```java
// 合并条件判断逻辑
private boolean isMerge(Object currentRow, Object preRow, CellMerge cellMerge) {
    final String[] mergeBy = cellMerge.mergeBy();
    if (StrUtil.isAllNotBlank(mergeBy)) {
        // 比对当前行和上一行的依赖字段值
        for (String fieldName : mergeBy) {
            final Object valCurrent = ReflectUtil.getFieldValue(currentRow, fieldName);
            final Object valPre = ReflectUtil.getFieldValue(preRow, fieldName);
            if (!Objects.equals(valPre, valCurrent)) {
                // 依赖字段如有任一不等值,则标记为不可合并
                return false;
            }
        }
    }
    return true;
}
```

#### 2.3 下拉选项导出

为Excel添加下拉选择功能，提升数据录入体验。

```java
// 创建下拉选项
List<DropDownOptions> options = Arrays.asList(
    new DropDownOptions(2, Arrays.asList("男", "女")),           // 第3列性别下拉
    new DropDownOptions(3, Arrays.asList("在职", "离职", "试用")) // 第4列状态下拉
);

ExcelUtil.exportExcel(userList, "用户信息", User.class, response, options);
```

**下拉选项处理策略：**

ExcelDownHandler根据选项数量自动选择最优策略：

1. **选项数量 ≤ 10个**：使用简单下拉框，直接嵌入数据校验
2. **选项数量 > 10个**：使用额外Sheet存储选项，通过名称管理器引用
3. **级联下拉**：使用INDIRECT函数实现二级联动

```java
if (options.size() > 20) {
    // 使用额外表形式，避免Excel打开缓慢
    dropDownWithSheet(helper, workbook, sheet, index, options);
} else {
    // 使用固定值形式
    dropDownWithSimple(helper, sheet, index, options);
}
```

#### 2.4 级联下拉选项

支持二级联动下拉选择，如省市级联。

```java
// 构建省市数据
List<Province> provinceList = Arrays.asList(
    new Province(1L, "北京"),
    new Province(2L, "上海"),
    new Province(3L, "广东")
);

List<City> cityList = Arrays.asList(
    new City(1L, 1L, "朝阳区"),
    new City(2L, 1L, "海淀区"),
    new City(3L, 2L, "浦东新区"),
    new City(4L, 2L, "静安区"),
    new City(5L, 3L, "广州市"),
    new City(6L, 3L, "深圳市")
);

// 构建级联下拉选项
DropDownOptions cascadeOptions = DropDownOptions.buildLinkedOptions(
    provinceList,                // 省份列表
    1,                           // 省份列索引（第2列）
    cityList,                    // 城市列表
    2,                           // 城市列索引（第3列）
    Province::getId,             // 省份ID获取方法
    City::getProvinceId,         // 城市获取省份ID方法
    province -> DropDownOptions.createOptionValue(province.getId(), province.getName())
);

ExcelUtil.exportExcel(addressList, "地址信息", Address.class, response,
    Arrays.asList(cascadeOptions));
```

**级联下拉实现原理：**

1. 创建隐藏的linkedOptions_X工作表存储级联数据
2. 第一行存储一级选项（省份）
3. 每一列存储对应省份下的二级选项（城市）
4. 使用名称管理器定义数据区域
5. 二级下拉使用INDIRECT函数动态引用一级选择的结果

```java
// 二级下拉公式：=INDIRECT(A2)，其中A列是一级选项所在列
String secondOptionsFunction = String.format("=INDIRECT(%s%d)",
    mainSheetFirstOptionsColumnName, i + 1);
markLinkedOptionsToSheet(helper, sheet, i, options.getNextIndex(),
    helper.createFormulaListConstraint(secondOptionsFunction));
```

#### 2.5 动态下拉选项

支持从数据库动态获取下拉选项数据。

```java
// 1. 实现ExcelOptionsProvider接口
@Component
public class DeptOptionsProvider implements ExcelOptionsProvider {

    @Resource
    private ISysDeptService deptService;

    @Override
    public Set<String> getOptions() {
        return deptService.list().stream()
            .map(SysDept::getDeptName)
            .collect(Collectors.toSet());
    }
}

// 2. 在实体类中使用@ExcelDynamicOptions注解
@Data
public class UserExportVo {
    @ExcelProperty("姓名")
    private String name;

    @ExcelProperty("部门")
    @ExcelDynamicOptions(providerClass = DeptOptionsProvider.class)
    private String deptName;

    @ExcelProperty("职位")
    @ExcelDynamicOptions(providerClass = PositionOptionsProvider.class)
    private String position;
}

// 3. 导出时自动加载动态选项
ExcelUtil.exportExcel(userList, "用户信息", UserExportVo.class, response);
```

### 3. 模板导出

适用于格式固定的报表导出，支持复杂的Excel布局。

#### 3.1 单表模板导出

```java
// 模板文件：resources/templates/user-report.xlsx
// 模板内容使用 {.属性名} 作为占位符
// 例如：姓名：{.name}，年龄：{.age}，部门：{.department}

List<User> users = userService.getReportData();
ExcelUtil.exportTemplate(users, "用户报表", "templates/user-report.xlsx", response);
```

#### 3.2 多表模板导出

在一个模板中填充多个不同类型的数据。

```java
// 模板内容使用 {key.属性名} 作为占位符
// 报表标题：{header.title} {header.date}
// 用户信息：{userInfo.name} {userInfo.department}
// 订单列表：{orders.orderNo} {orders.amount}
// 汇总信息：{summary.total} {summary.average}

Map<String, Object> data = new HashMap<>();
data.put("header", headerObject);        // 报表头信息
data.put("userInfo", userObject);        // 单个对象
data.put("orders", orderList);           // 列表数据
data.put("summary", summaryObject);      // 汇总信息

ExcelUtil.exportTemplateMultiList(data, "综合报表", "templates/multi-report.xlsx", response);
```

#### 3.3 多Sheet模板导出

使用相同模板生成多个工作表。

```java
List<Map<String, Object>> sheetDataList = new ArrayList<>();

// 第一个Sheet的数据（研发部）
Map<String, Object> sheet1Data = new HashMap<>();
sheet1Data.put("deptName", "研发部");
sheet1Data.put("users", dept1Users);
sheet1Data.put("summary", dept1Summary);
sheetDataList.add(sheet1Data);

// 第二个Sheet的数据（市场部）
Map<String, Object> sheet2Data = new HashMap<>();
sheet2Data.put("deptName", "市场部");
sheet2Data.put("users", dept2Users);
sheet2Data.put("summary", dept2Summary);
sheetDataList.add(sheet2Data);

// 第三个Sheet的数据（财务部）
Map<String, Object> sheet3Data = new HashMap<>();
sheet3Data.put("deptName", "财务部");
sheet3Data.put("users", dept3Users);
sheet3Data.put("summary", dept3Summary);
sheetDataList.add(sheet3Data);

ExcelUtil.exportTemplateMultiSheet(sheetDataList, "各部门报表", "templates/dept-report.xlsx", response);
```

## 注解详解

### 1. @ExcelProperty

FastExcel原生注解，用于定义Excel列映射。

```java
public class User {
    // 基本用法
    @ExcelProperty(value = "姓名", index = 0)
    private String name;

    // 多级表头
    @ExcelProperty(value = {"基本信息", "年龄"}, index = 1)
    private Integer age;

    // 指定转换器
    @ExcelProperty(value = "创建时间", converter = LocalDateTimeConverter.class)
    private LocalDateTime createTime;
}
```

### 2. @ExcelDictFormat

字典格式化注解，支持字典值与显示文本的双向转换。

```java
public class User {
    // 使用系统字典
    @ExcelDictFormat(dictType = "sys_user_gender")
    @ExcelProperty("性别")
    private String gender;

    // 使用自定义表达式
    @ExcelDictFormat(readConverterExp = "0=正常,1=停用,2=删除")
    @ExcelProperty("状态")
    private String status;

    // 多值字段（如角色，多个值用逗号分隔）
    @ExcelDictFormat(dictType = "sys_role", separator = ",")
    @ExcelProperty("角色")
    private String roles;
}
```

**转换逻辑：**

```java
// 导出时：数据库code值 → Excel显示文本
// 例如：gender = "0" → Excel显示"男"
@Override
public WriteCellData<String> convertToExcelData(Object object, ...) {
    ExcelDictFormat anno = getAnnotation(contentProperty.getField());
    String type = anno.dictType();
    String value = Convert.toStr(object);
    String label;
    if (StringUtils.isBlank(type)) {
        // 使用表达式转换
        label = ExcelUtil.convertByExp(value, anno.readConverterExp(), anno.separator());
    } else {
        // 使用字典服务转换
        label = SpringUtils.getBean(DictService.class).getDictLabel(type, value, anno.separator());
    }
    return new WriteCellData<>(label);
}

// 导入时：Excel显示文本 → 数据库code值
// 例如：Excel的"男" → gender = "0"
@Override
public Object convertToJavaData(ReadCellData<?> cellData, ...) {
    ExcelDictFormat anno = getAnnotation(contentProperty.getField());
    String type = anno.dictType();
    String label = cellData.getStringValue();
    String value;
    if (StringUtils.isBlank(type)) {
        value = ExcelUtil.reverseByExp(label, anno.readConverterExp(), anno.separator());
    } else {
        value = SpringUtils.getBean(DictService.class).getDictValue(type, label, anno.separator());
    }
    return Convert.convert(contentProperty.getField().getType(), value);
}
```

### 3. @ExcelEnumFormat

枚举格式化注解，支持枚举类型的双向转换。

```java
// 枚举定义
public enum UserStatus {
    ACTIVE(1, "激活"),
    INACTIVE(0, "禁用"),
    LOCKED(2, "锁定");

    private final Integer value;
    private final String label;

    UserStatus(Integer value, String label) {
        this.value = value;
        this.label = label;
    }

    // getter方法...
}

// 实体类使用
public class User {
    @ExcelProperty("状态")
    @ExcelEnumFormat(
        enumClass = UserStatus.class,
        valueField = "value",   // 枚举中存储值的字段名
        labelField = "label"    // 枚举中显示文本的字段名
    )
    private Integer status;  // 存储枚举的value值(0/1/2)
}

// 导出时：status=1 → Excel显示"激活"
// 导入时：Excel的"激活" → status=1
```

**转换实现：**

```java
// 构建枚举值到标签的映射
private Map<Object, String> beforeConvert(ExcelContentProperty contentProperty) {
    ExcelEnumFormat anno = getAnnotation(contentProperty.getField());
    Map<Object, String> enumValueMap = new HashMap<>();

    // 获取枚举类的所有常量
    Enum<?>[] enumConstants = anno.enumClass().getEnumConstants();

    for (Enum<?> enumConstant : enumConstants) {
        // 通过反射获取枚举的value字段值
        Object value = ReflectUtils.invokeGetter(enumConstant, anno.valueField());
        // 通过反射获取枚举的label字段值
        String label = ReflectUtils.invokeGetter(enumConstant, anno.labelField());
        enumValueMap.put(value, label);
    }
    return enumValueMap;
}
```

### 4. @CellMerge

单元格合并注解，用于合并相同值的相邻单元格。

```java
public class SalesReport {
    @CellMerge  // 基本用法：相同值自动合并
    @ExcelProperty("区域")
    private String region;

    @CellMerge(index = 1)  // 指定列索引
    @ExcelProperty("省份")
    private String province;

    @CellMerge(mergeBy = {"region"})  // 依赖区域字段
    @ExcelProperty("城市")
    private String city;

    @CellMerge(mergeBy = {"region", "province", "city"})  // 多级依赖
    @ExcelProperty("门店")
    private String store;

    @ExcelProperty("销售额")
    private BigDecimal sales;
}
```

**注解属性：**

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|--------|-----|
| index | int | -1 | 列索引，-1表示自动推断 |
| mergeBy | String[] | {} | 依赖的字段名列表 |

### 5. @ExcelRequired

必填字段标识注解，用于标记必填列，在表头显示特殊颜色提醒。

```java
public class User {
    @ExcelRequired  // 使用默认红色字体
    @ExcelProperty("姓名")
    private String name;

    @ExcelRequired(fontColor = IndexedColors.BLUE)  // 自定义蓝色字体
    @ExcelProperty("邮箱")
    private String email;

    @ExcelRequired(fontColor = IndexedColors.ORANGE)
    @ExcelProperty("手机号")
    private String phone;
}
```

**处理逻辑：**

```java
// DataWriteHandler中处理必填标识
if (CollUtil.isNotEmpty(headColumnMap) && headColumnMap.containsKey(cell.getStringCellValue())) {
    WriteFont headWriteFont = new WriteFont();
    headWriteFont.setBold(true);
    // 设置必填字段的字体颜色
    headWriteFont.setColor(headColumnMap.get(cell.getStringCellValue()));
    writeCellStyle.setWriteFont(headWriteFont);
}
```

### 6. @ExcelNotation

批注注解，为Excel单元格添加批注说明。

```java
public class User {
    @ExcelNotation("请填写真实姓名，2-20个字符")
    @ExcelProperty("姓名")
    private String name;

    @ExcelNotation("格式：yyyy-MM-dd，例如：2024-01-15")
    @ExcelProperty("出生日期")
    private Date birthDate;

    @ExcelNotation("请选择正确的性别")
    @ExcelProperty("性别")
    @ExcelDictFormat(dictType = "sys_user_gender")
    private String gender;
}
```

**批注创建逻辑：**

```java
if (CollUtil.isNotEmpty(notationMap) && notationMap.containsKey(cell.getStringCellValue())) {
    String notationContext = notationMap.get(cell.getStringCellValue());
    // 创建绘图对象
    Comment comment = drawing.createCellComment(
        new XSSFClientAnchor(0, 0, 0, 0, (short) cell.getColumnIndex(), 0, (short) 5, 5)
    );
    comment.setString(new XSSFRichTextString(notationContext));
    cell.setCellComment(comment);
}
```

### 7. @ExcelDynamicOptions

动态下拉选项注解，支持从数据库动态获取下拉选项。

```java
// 1. 定义选项提供者
@Component
public class RoleOptionsProvider implements ExcelOptionsProvider {

    @Resource
    private ISysRoleService roleService;

    @Override
    public Set<String> getOptions() {
        return roleService.selectRoleAll().stream()
            .map(SysRole::getRoleName)
            .collect(Collectors.toSet());
    }
}

// 2. 在实体类中使用
public class UserExportVo {
    @ExcelProperty("角色")
    @ExcelDynamicOptions(providerClass = RoleOptionsProvider.class)
    private String roleName;
}
```

## 高级特性

### 1. 大数字处理

ExcelBigNumberConvert自动处理长整型数据，防止Excel显示科学计数法或精度丢失。

```java
public class Order {
    @ExcelProperty("订单ID")
    private Long orderId;  // 如：1234567890123456789L
    // 自动转为字符串格式导出，保证显示完整

    @ExcelProperty("手机号")
    private Long phone;    // 13812345678L
    // 自动处理，保证显示完整
}
```

**转换阈值：**

```java
// 超过15位数字时自动转为字符串
// JavaScript安全整数范围：-9007199254740991 ~ 9007199254740991
public class ExcelBigNumberConvert implements Converter<Long> {
    @Override
    public WriteCellData<Object> convertToExcelData(Long value, ...) {
        if (value != null && String.valueOf(value).length() > 15) {
            return new WriteCellData<>(String.valueOf(value));
        }
        return new WriteCellData<>(value);
    }
}
```

### 2. 数据校验

支持Bean Validation校验注解，导入时自动校验数据有效性。

```java
public class UserImportVo {
    @NotBlank(message = "姓名不能为空")
    @Length(min = 2, max = 50, message = "姓名长度必须在2-50之间")
    @ExcelProperty("姓名")
    private String name;

    @NotNull(message = "年龄不能为空")
    @Min(value = 0, message = "年龄不能为负数")
    @Max(value = 150, message = "年龄不能超过150")
    @ExcelProperty("年龄")
    private Integer age;

    @Email(message = "邮箱格式不正确")
    @ExcelProperty("邮箱")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    @ExcelProperty("手机号")
    private String phone;

    @NotBlank(message = "身份证号不能为空")
    @Size(min = 18, max = 18, message = "身份证号必须为18位")
    @ExcelProperty("身份证号")
    private String idCard;
}

// 导入时校验
ExcelResult<UserImportVo> result = ExcelUtil.importExcel(inputStream, UserImportVo.class, true);
// 校验失败的数据会被记录到errorList中
List<String> errors = result.getErrorList();
```

### 3. 自定义样式

```java
// 获取默认样式策略
HorizontalCellStyleStrategy styleStrategy = ExcelUtil.initCellStyle();

// 自定义表头样式
WriteCellStyle headStyle = new WriteCellStyle();
headStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
headStyle.setFillPatternType(FillPatternType.SOLID_FOREGROUND);
headStyle.setHorizontalAlignment(HorizontalAlignment.CENTER);
headStyle.setVerticalAlignment(VerticalAlignment.CENTER);

WriteFont headFont = new WriteFont();
headFont.setColor(IndexedColors.WHITE.getIndex());
headFont.setBold(true);
headFont.setFontHeightInPoints((short) 12);
headStyle.setWriteFont(headFont);

// 自定义内容样式
WriteCellStyle contentStyle = new WriteCellStyle();
contentStyle.setHorizontalAlignment(HorizontalAlignment.LEFT);
contentStyle.setVerticalAlignment(VerticalAlignment.CENTER);

WriteFont contentFont = new WriteFont();
contentFont.setFontHeightInPoints((short) 11);
contentStyle.setWriteFont(contentFont);

// 应用自定义样式
HorizontalCellStyleStrategy customStyle = new HorizontalCellStyleStrategy(headStyle, contentStyle);
```

### 4. 错误处理最佳实践

```java
@PostMapping("/import")
public R<ImportResult> importUsers(@RequestParam("file") MultipartFile file) {
    try {
        // 文件校验
        if (file.isEmpty()) {
            return R.fail("上传文件不能为空");
        }
        String filename = file.getOriginalFilename();
        if (!StringUtils.endsWith(filename, ".xlsx") && !StringUtils.endsWith(filename, ".xls")) {
            return R.fail("仅支持Excel文件格式");
        }

        // 执行导入
        ExcelResult<UserImportVo> result = ExcelUtil.importExcel(
            file.getInputStream(),
            UserImportVo.class,
            true
        );

        List<UserImportVo> successList = result.getList();
        List<String> errorList = result.getErrorList();

        // 构建返回结果
        ImportResult importResult = new ImportResult();
        importResult.setSuccessCount(successList.size());
        importResult.setErrorCount(errorList.size());

        if (!errorList.isEmpty()) {
            // 有错误数据
            importResult.setErrors(errorList);
            if (successList.isEmpty()) {
                // 全部失败
                return R.fail("导入失败", importResult);
            }
            // 部分成功
            userService.batchSave(successList);
            return R.ok("部分数据导入成功", importResult);
        }

        // 全部成功
        userService.batchSave(successList);
        return R.ok(result.getAnalysis(), importResult);

    } catch (IOException e) {
        log.error("导入用户失败", e);
        return R.fail("文件读取失败：" + e.getMessage());
    } catch (Exception e) {
        log.error("导入用户异常", e);
        return R.fail("导入失败：" + e.getMessage());
    }
}
```

## 性能优化建议

### 1. 大文件分批导入

```java
public class BatchUserListener extends DefaultExcelListener<User> {
    private final int BATCH_SIZE = 1000;
    private final UserService userService;
    private List<User> batchList = new ArrayList<>();
    private int totalSuccess = 0;

    public BatchUserListener(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void invoke(User user, AnalysisContext context) {
        // 添加到批次列表
        batchList.add(user);

        if (batchList.size() >= BATCH_SIZE) {
            // 分批保存
            saveBatch();
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 处理剩余数据
        if (!batchList.isEmpty()) {
            saveBatch();
        }
        log.info("所有数据导入完成，成功：{}条", totalSuccess);
    }

    private void saveBatch() {
        try {
            userService.batchSave(batchList);
            totalSuccess += batchList.size();
            log.info("批量保存成功，本批次：{}条，累计：{}条", batchList.size(), totalSuccess);
        } catch (Exception e) {
            log.error("批量保存失败", e);
        } finally {
            batchList.clear();
        }
    }
}
```

### 2. 大数据量导出优化

```java
@GetMapping("/export-large")
public void exportLargeData(HttpServletResponse response) {
    // 设置响应头
    ExcelUtil.resetResponse("大数据导出", response);

    try (ServletOutputStream os = response.getOutputStream()) {
        ExcelWriter excelWriter = FastExcel.write(os, User.class)
            .autoCloseStream(false)
            .build();
        WriteSheet writeSheet = FastExcel.writerSheet("用户数据").build();

        int pageSize = 10000;
        int pageNum = 1;
        List<User> users;

        do {
            // 分页查询数据
            users = userService.getUsers(pageNum, pageSize);
            if (!users.isEmpty()) {
                // 分批写入
                excelWriter.write(users, writeSheet);
            }
            pageNum++;

            // 清理引用，帮助GC
            users = null;

        } while (users == null || users.size() == pageSize);

        excelWriter.finish();

    } catch (IOException e) {
        log.error("导出失败", e);
    }
}
```

### 3. 内存优化技巧

```java
// 1. 使用SXSSF模式（流式写入）
// FastExcel默认支持，无需额外配置

// 2. 限制下拉选项行数
// ExcelDownHandler中只校验前1000行
CellRangeAddressList addressList = new CellRangeAddressList(1, 1000, celIndex, celIndex);

// 3. 避免一次性加载全部数据
// 使用分页查询 + 流式写入

// 4. 及时关闭流
try (InputStream is = file.getInputStream()) {
    ExcelResult<User> result = ExcelUtil.importExcel(is, User.class, true);
    // ...
}

// 5. 使用对象池或复用实例
// FastExcel内部已优化，无需手动处理
```

## 常见问题

### Q1: 日期格式问题

```java
public class User {
    // 使用FastExcel的DateTimeFormat注解
    @DateTimeFormat("yyyy-MM-dd")
    @ExcelProperty("入职日期")
    private LocalDate joinDate;

    // 或使用Java自带的注解配合转换器
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;
}
```

### Q2: 数字精度问题

长整型数据自动使用ExcelBigNumberConvert转换器处理，无需额外配置。

```java
public class Order {
    @ExcelProperty("订单号")
    private Long orderNo;  // 超过15位自动转字符串
}
```

### Q3: 中文乱码问题

确保响应头设置正确：

```java
// ExcelUtil.resetResponse方法已处理
response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
response.setCharacterEncoding("UTF-8");
String fileName = URLEncoder.encode(filename, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
response.setHeader("Content-Disposition", "attachment;filename=" + fileName + ".xlsx");
```

### Q4: 模板路径问题

模板文件放在`src/main/resources`目录下：

```java
// 正确的路径写法
ExcelUtil.exportTemplate(data, "报表", "templates/report.xlsx", response);

// 模板文件位置
// src/main/resources/templates/report.xlsx
```

### Q5: 字典转换不生效

确保：
1. DictService已正确配置且Spring容器中存在对应的Bean
2. 字典类型（dictType）在系统中存在
3. 字典数据已正确配置

```java
// 检查字典服务是否正常
DictService dictService = SpringUtils.getBean(DictService.class);
String label = dictService.getDictLabel("sys_user_gender", "0", ",");
```

### Q6: 合并单元格不生效

检查：
1. 数据是否按合并字段排序
2. mergeBy属性是否正确配置
3. 导出时是否启用了合并参数

```java
// 数据必须按合并字段排序
List<DepartmentUser> sortedList = deptUsers.stream()
    .sorted(Comparator.comparing(DepartmentUser::getDepartment)
        .thenComparing(DepartmentUser::getTeam))
    .collect(Collectors.toList());

// 导出时启用合并
ExcelUtil.exportExcel(sortedList, "部门用户", DepartmentUser.class, true, response);
```

### Q7: 下拉选项过多导致Excel打开慢

ExcelDownHandler已自动处理：
- 选项数量 ≤ 20个：使用简单下拉
- 选项数量 > 20个：使用额外Sheet存储

如果仍然很慢，可以限制选项数量或使用数据校验提示替代下拉。

## 最佳实践

### 1. 实体类设计原则

```java
@Data
public class UserExcelVo {
    // 1. 使用明确的类型，避免Object
    @ExcelProperty("用户ID")
    private Long userId;

    // 2. 字符串类型字段添加长度校验
    @Length(max = 50, message = "姓名长度不能超过50")
    @ExcelProperty("姓名")
    private String name;

    // 3. 字典字段使用@ExcelDictFormat
    @ExcelDictFormat(dictType = "sys_user_gender")
    @ExcelProperty("性别")
    private String gender;

    // 4. 枚举字段使用@ExcelEnumFormat
    @ExcelEnumFormat(enumClass = UserStatus.class)
    @ExcelProperty("状态")
    private Integer status;

    // 5. 必填字段添加@ExcelRequired和校验注解
    @ExcelRequired
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @ExcelProperty("邮箱")
    private String email;

    // 6. 添加批注说明复杂字段
    @ExcelNotation("格式：yyyy-MM-dd")
    @ExcelProperty("出生日期")
    private LocalDate birthDate;
}
```

### 2. 异常处理规范

```java
// 1. 使用统一的结果封装
@Data
public class ImportResult {
    private int successCount;
    private int errorCount;
    private List<String> errors;
}

// 2. 分级处理错误
public R<ImportResult> importUsers(MultipartFile file) {
    // 文件级校验
    if (file.isEmpty()) {
        return R.fail("文件不能为空");
    }

    // 数据级校验（自动）
    ExcelResult<UserImportVo> result = ExcelUtil.importExcel(...);

    // 业务级校验
    List<UserImportVo> validList = result.getList().stream()
        .filter(this::validateBusiness)
        .collect(Collectors.toList());

    // 返回详细结果
    return R.ok(buildImportResult(result, validList));
}
```

### 3. 性能优化策略

```java
// 1. 大数据量分批处理
// 导入：使用自定义监听器分批保存
// 导出：使用分页查询+流式写入

// 2. 合理设置批次大小
private static final int IMPORT_BATCH_SIZE = 1000;  // 导入批次
private static final int EXPORT_PAGE_SIZE = 10000;  // 导出分页

// 3. 避免复杂计算
// 将复杂的格式转换放在数据库查询层面
// 避免在导出时进行大量的数据转换

// 4. 使用缓存
// 字典数据使用Redis缓存
// 下拉选项数据预加载
```

### 4. 模板设计规范

```text
# 模板占位符规范
{.field}           # 单条数据字段
{key.field}        # 多数据源字段
{list.field}       # 列表数据字段

# 模板文件组织
resources/
└── templates/
    ├── user-report.xlsx      # 用户报表模板
    ├── order-export.xlsx     # 订单导出模板
    └── dept-summary.xlsx     # 部门汇总模板
```

## 总结

Excel处理模块提供了完整的Excel导入导出解决方案：

1. **导入功能**：支持同步/异步导入、数据校验、错误收集、自定义监听器
2. **导出功能**：支持基础导出、单元格合并、下拉选项、模板导出
3. **数据转换**：字典转换、枚举转换、大数字处理
4. **界面增强**：必填标识、批注说明、级联下拉
5. **扩展能力**：自定义监听器、转换器、选项提供者

通过合理使用各种注解和配置，可以满足绝大多数业务场景的需求。模块设计注重性能和易用性，支持大数据量处理，是企业级应用的理想选择。
