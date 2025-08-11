# Excel处理 (excel)

Excel处理模块基于EasyExcel框架，提供了完整的Excel导入导出解决方案，支持数据校验、格式转换、单元格合并、下拉选项等高级功能。

## 模块概述

### 核心功能

- **Excel导入**：支持同步/异步导入，数据校验，错误收集
- **Excel导出**：支持基础导出、模板导出、多Sheet导出
- **数据转换**：字典转换、枚举转换、大数字处理
- **界面增强**：下拉选项、单元格合并、批注、必填标识
- **模板支持**：单表模板、多表模板、多Sheet模板

### 技术特性

- 基于EasyExcel 3.x版本
- 支持大文件处理，内存占用低
- 注解驱动，配置简单
- 完善的异常处理机制
- 灵活的扩展能力

## 快速开始

### 基础导入示例

```java
// 1. 定义实体类
public class User {
    @ExcelProperty("姓名")
    private String name;
    
    @ExcelProperty("年龄")
    private Integer age;
    
    @ExcelProperty("邮箱")
    @Email(message = "邮箱格式不正确")
    private String email;
}

// 2. 执行导入
@PostMapping("/import")
public Result<String> importUser(@RequestParam("file") MultipartFile file) {
    List<User> users = ExcelUtil.importExcel(file.getInputStream(), User.class);
    // 处理导入的数据
    userService.batchInsert(users);
    return Result.success("导入成功，共" + users.size() + "条数据");
}
```

### 基础导出示例

```java
// 导出用户列表
@GetMapping("/export")
public void exportUser(HttpServletResponse response) {
    List<User> users = userService.list();
    ExcelUtil.exportExcel(users, "用户信息", User.class, response);
}
```

## 详细功能

### 1. Excel导入

#### 1.1 同步导入

适用于小数据量（建议1000条以内）的简单导入场景。

```java
// 导入为Map集合（不需要实体类）
List<Map<Integer, String>> mapData = ExcelUtil.importExcel(inputStream);

// 导入为实体对象
List<User> users = ExcelUtil.importExcel(inputStream, User.class);
```

#### 1.2 异步导入（推荐）

支持数据校验，提供详细的错误信息，适用于生产环境。

```java
// 启用数据校验的导入
ExcelResult<User> result = ExcelUtil.importExcel(inputStream, User.class, true);

// 获取成功数据
List<User> successList = result.getList();

// 获取错误信息
List<String> errors = result.getErrorList();

// 获取统计信息
String analysis = result.getAnalysis(); // 如：读取完成！成功100条，失败5条
```

#### 1.3 自定义监听器

对于复杂的导入逻辑，可以实现自定义监听器。

```java
public class CustomUserListener extends DefaultExcelListener<User> {
    
    @Override
    public void invoke(User user, AnalysisContext context) {
        // 自定义数据处理逻辑
        if (StringUtils.isNotBlank(user.getPhone())) {
            user.setPhone(formatPhone(user.getPhone()));
        }
        
        // 调用父类方法执行默认处理
        super.invoke(user, context);
    }
    
    @Override
    public void onException(Exception exception, AnalysisContext context) {
        // 自定义异常处理
        log.error("数据处理异常", exception);
        super.onException(exception, context);
    }
}

// 使用自定义监听器
CustomUserListener listener = new CustomUserListener();
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

#### 2.2 单元格合并导出

适用于相同数据需要合并显示的场景，如部门统计报表。

```java
// 实体类配置
public class DepartmentUser {
    @CellMerge // 相同部门的单元格将被合并
    @ExcelProperty("部门")
    private String department;
    
    @CellMerge(mergeBy = {"department"}) // 在同一部门内合并相同团队
    @ExcelProperty("团队")
    private String team;
    
    @ExcelProperty("姓名")
    private String name;
}

// 导出时启用合并
ExcelUtil.exportExcel(deptUsers, "部门用户", DepartmentUser.class, true, response);
```

#### 2.3 下拉选项导出

为Excel添加下拉选择功能，提升数据录入体验。

```java
// 创建下拉选项
List<DropDownOptions> options = Arrays.asList(
    new DropDownOptions(2, Arrays.asList("男", "女")), // 第3列性别下拉
    new DropDownOptions(3, Arrays.asList("在职", "离职", "试用")) // 第4列状态下拉
);

ExcelUtil.exportExcel(userList, "用户信息", User.class, response, options);
```

#### 2.4 级联下拉选项

支持二级联动下拉选择，如省市级联。

```java
// 构建级联下拉选项
DropDownOptions cascadeOptions = DropDownOptions.buildLinkedOptions(
    provinceList,    // 省份列表
    1,               // 省份列索引
    cityList,        // 城市列表  
    2,               // 城市列索引
    Province::getId, // 省份ID获取方法
    City::getProvinceId, // 城市获取省份ID方法
    province -> DropDownOptions.createOptionValue(province.getId(), province.getName()) // 选项生成方法
);

ExcelUtil.exportExcel(addressList, "地址信息", Address.class, response, 
    Arrays.asList(cascadeOptions));
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
// 用户信息：{userInfo.name} {userInfo.department}
// 订单列表：{orders.orderNo} {orders.amount}

Map<String, Object> data = new HashMap<>();
data.put("userInfo", userObject);      // 单个对象
data.put("orders", orderList);         // 列表数据
data.put("summary", summaryObject);    // 汇总信息

ExcelUtil.exportTemplateMultiList(data, "综合报表", "templates/multi-report.xlsx", response);
```

#### 3.3 多Sheet模板导出

使用相同模板生成多个工作表。

```java
List<Map<String, Object>> sheetDataList = new ArrayList<>();

// 第一个Sheet的数据
Map<String, Object> sheet1Data = new HashMap<>();
sheet1Data.put("users", dept1Users);
sheet1Data.put("summary", dept1Summary);
sheetDataList.add(sheet1Data);

// 第二个Sheet的数据  
Map<String, Object> sheet2Data = new HashMap<>();
sheet2Data.put("users", dept2Users);
sheet2Data.put("summary", dept2Summary);
sheetDataList.add(sheet2Data);

ExcelUtil.exportTemplateMultiSheet(sheetDataList, "各部门报表", "templates/dept-report.xlsx", response);
```

## 注解详解

### 1. @ExcelProperty

EasyExcel原生注解，用于定义Excel列映射。

```java
public class User {
    @ExcelProperty(value = "姓名", index = 0)
    private String name;
    
    @ExcelProperty(value = {"基本信息", "年龄"}, index = 1) // 多级表头
    private Integer age;
}
```

### 2. @ExcelDictFormat

字典格式化注解，支持字典值转换。

```java
public class User {
    // 使用系统字典
    @ExcelDictFormat(dictType = "sys_user_gender")
    @ExcelProperty("性别")
    private String gender;
    
    // 使用自定义映射
    @ExcelDictFormat(readConverterExp = "0=正常,1=停用,2=删除")
    @ExcelProperty("状态")  
    private String status;
    
    // 多值字段（如角色）
    @ExcelDictFormat(dictType = "sys_role", separator = ",")
    @ExcelProperty("角色")
    private String roles;
}
```

**转换逻辑：**
- **导出时**：数据库的code值（如"0"）转换为显示文本（如"正常"）
- **导入时**：Excel的显示文本（如"正常"）转换为code值（如"0"）

### 3. @ExcelEnumFormat

枚举格式化注解，支持枚举类型转换。

```java
// 枚举定义
public enum UserStatus {
    ACTIVE(1, "激活"),
    INACTIVE(0, "禁用");
    
    private final Integer value;
    private final String label;
    
    // 构造函数和getter方法...
}

// 实体类使用
public class User {
    @ExcelEnumFormat(enumClass = UserStatus.class, valueField = "value", labelField = "label")
    @ExcelProperty("状态")
    private Integer status; // 存储枚举的value值
}
```

### 4. @CellMerge

单元格合并注解，用于合并相同值的单元格。

```java
public class DepartmentUser {
    @CellMerge
    @ExcelProperty("部门")
    private String department;
    
    @CellMerge(mergeBy = {"department"}) // 依赖部门字段
    @ExcelProperty("团队") 
    private String team;
    
    @ExcelProperty("姓名")
    private String name;
}
```

### 5. @ExcelRequired

必填字段标识注解，用于标记必填列。

```java
public class User {
    @ExcelRequired // 使用默认红色字体
    @ExcelProperty("姓名")
    private String name;
    
    @ExcelRequired(fontColor = IndexedColors.BLUE)
    @ExcelProperty("邮箱")
    private String email;
}
```

### 6. @ExcelNotation

批注注解，为Excel单元格添加批注说明。

```java
public class User {
    @ExcelNotation("请填写真实姓名")
    @ExcelProperty("姓名")
    private String name;
    
    @ExcelNotation("格式：yyyy-MM-dd")
    @ExcelProperty("出生日期")
    private Date birthDate;
}
```

## 高级特性

### 1. 大数字处理

自动处理长整型数据，防止Excel显示科学计数法。

```java
public class User {
    @ExcelProperty("用户ID")
    private Long userId; // 如：1234567890123456789L，自动转为字符串防止精度丢失
    
    @ExcelProperty("手机号")
    private Long phone;   // 自动处理，保证显示完整
}
```

### 2. 数据校验

支持Bean Validation校验注解。

```java
public class User {
    @NotBlank(message = "姓名不能为空")
    @Length(max = 50, message = "姓名长度不能超过50")
    @ExcelProperty("姓名")
    private String name;
    
    @Min(value = 0, message = "年龄不能为负数")
    @Max(value = 150, message = "年龄不能超过150")
    @ExcelProperty("年龄")
    private Integer age;
    
    @Email(message = "邮箱格式不正确")
    @ExcelProperty("邮箱")
    private String email;
}
```

### 3. 自定义样式

```java
// 自定义表头和内容样式
HorizontalCellStyleStrategy styleStrategy = ExcelUtil.initCellStyle();

// 或者完全自定义
WriteCellStyle headStyle = new WriteCellStyle();
headStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
WriteFont headFont = new WriteFont();
headFont.setColor(IndexedColors.WHITE.getIndex());
headFont.setBold(true);
headStyle.setWriteFont(headFont);

HorizontalCellStyleStrategy customStyle = new HorizontalCellStyleStrategy(headStyle, null);
```

### 4. 错误处理和日志

```java
@PostMapping("/import")
public Result<ImportResult> importUsers(@RequestParam("file") MultipartFile file) {
    try {
        ExcelResult<User> result = ExcelUtil.importExcel(file.getInputStream(), User.class, true);
        
        List<User> successList = result.getList();
        List<String> errorList = result.getErrorList();
        
        if (!errorList.isEmpty()) {
            // 返回部分成功的结果
            return Result.success(ImportResult.builder()
                .successCount(successList.size())
                .errorCount(errorList.size())
                .errors(errorList)
                .build());
        }
        
        // 批量保存成功数据
        userService.batchSave(successList);
        
        return Result.success("导入成功，共" + successList.size() + "条数据");
        
    } catch (Exception e) {
        log.error("导入用户失败", e);
        return Result.error("导入失败：" + e.getMessage());
    }
}
```

## 性能优化建议

### 1. 大文件处理

```java
// 对于大文件导入，使用自定义监听器分批处理
public class BatchUserListener extends DefaultExcelListener<User> {
    private final int BATCH_SIZE = 1000;
    private List<User> batchList = new ArrayList<>();
    
    @Override
    public void invoke(User user, AnalysisContext context) {
        batchList.add(user);
        if (batchList.size() >= BATCH_SIZE) {
            // 分批保存
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
    }
}
```

### 2. 内存优化

```java
// 导出大量数据时，避免一次性加载所有数据
@GetMapping("/export-large")
public void exportLargeData(HttpServletResponse response) {
    ExcelUtil.resetResponse("大数据导出", response);
    
    try (ServletOutputStream os = response.getOutputStream()) {
        ExcelWriter excelWriter = FastExcel.write(os, User.class).build();
        WriteSheet writeSheet = FastExcel.writerSheet("用户数据").build();
        
        int pageSize = 10000;
        int pageNum = 1;
        List<User> users;
        
        do {
            // 分页查询数据
            users = userService.getUsers(pageNum, pageSize);
            if (!users.isEmpty()) {
                excelWriter.write(users, writeSheet);
            }
            pageNum++;
        } while (users.size() == pageSize);
        
        excelWriter.finish();
    }
}
```

## 常见问题

### Q1: 日期格式问题

```java
public class User {
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @ExcelProperty("入职日期")
    private Date joinDate;
}
```

### Q2: 数字精度问题

长整型数据自动使用`ExcelBigNumberConvert`转换器处理，无需额外配置。

### Q3: 中文乱码问题

确保使用UTF-8编码：

```java
response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8");
```

### Q4: 模板路径问题

模板文件放在`src/main/resources`目录下：

```java
// 正确的路径写法
ExcelUtil.exportTemplate(data, "报表", "templates/report.xlsx", response);
```

### Q5: 字典转换不生效

确保字典服务`DictService`已正确配置且Spring容器中存在对应的Bean。

## 最佳实践

1. **实体类设计**：合理使用注解，字段命名清晰
2. **异常处理**：使用异步导入，妥善处理错误信息
3. **性能考虑**：大文件分批处理，避免内存溢出
4. **用户体验**：提供下拉选项，添加必填标识和批注
5. **模板设计**：模板格式简洁，占位符命名规范

## 总结

Excel处理模块提供了完整的Excel导入导出解决方案，通过合理使用各种注解和配置，可以满足绝大多数业务场景的需求。模块设计注重性能和易用性，支持灵活扩展，是企业级应用的理想选择。
