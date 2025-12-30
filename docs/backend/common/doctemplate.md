# 文档模板 (doctemplate)

## 模块概述

`ruoyi-common-doctemplate` 是基于 POI-TL 的 Word 文档模板处理模块，提供了简洁优雅的 API 来实现 Word 文档的占位符替换、图片插入、表格循环等功能。该模块采用建造者模式设计，支持链式调用，让文档生成变得简单高效。

**核心特性：**

- **文本替换** - 使用 <code v-pre>{{name}}</code> 语法替换文本占位符
- **对象属性** - 支持 <code v-pre>{{obj.field}}</code> 访问对象属性
- **图片插入** - 使用 <code v-pre>{{@imgKey}}</code> 插入图片，支持多种图片来源和尺寸控制
- **表格循环** - 使用 <code v-pre>{{tableKey}}</code> + `[field]` 语法实现表格行动态循环
- **多种输入源** - 支持文件、文件路径、字节数组、输入流、URL 加载模板
- **多种输出方式** - 输出到字节数组、文件、输出流
- **链式调用** - 建造者模式设计，代码简洁易读

## 技术依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| POI-TL | 1.12.2 | Word 文档模板引擎 |
| ruoyi-common-core | - | 核心模块依赖 |

## 快速开始

### 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-doctemplate</artifactId>
</dependency>
```

### 基础使用示例

```java
import plus.ruoyi.common.doctemplate.builder.DocTemplateBuilder;

// 从文件加载模板并替换占位符
byte[] result = DocTemplateBuilder.of(new File("template.docx"))
    .data("title", "报告标题")
    .data("author", "张三")
    .data("date", "2025-01-01")
    .build();

// 保存到文件
DocTemplateBuilder.of(new File("template.docx"))
    .data("name", "李四")
    .buildToFile("output.docx");
```

## 模板语法

### 文本占位符

在 Word 模板中使用 <code v-pre>{{key}}</code> 语法定义文本占位符：

```text
尊敬的 {{name}} 先生/女士：

您好！感谢您于 {{date}} 提交的申请。
```

**替换代码：**

```java
DocTemplateBuilder.of(templateFile)
    .data("name", "王五")
    .data("date", "2025-12-29")
    .build();
```

### 对象属性访问

支持使用点语法访问对象属性 <code v-pre>{{obj.field}}</code>：

```text
用户信息：
- 姓名：{{user.name}}
- 年龄：{{user.age}}
- 邮箱：{{user.email}}
```

**替换代码：**

```java
@Data
public class UserInfo {
    private String name;
    private Integer age;
    private String email;
}

UserInfo user = new UserInfo();
user.setName("张三");
user.setAge(25);
user.setEmail("zhangsan@example.com");

DocTemplateBuilder.of(templateFile)
    .data("user", user)
    .build();
```

### 图片占位符

使用 <code v-pre>{{@key}}</code> 语法定义图片占位符。在 Word 模板中，可以通过以下方式设置图片占位符：

1. 直接在文本中输入 <code v-pre>{{@logo}}</code>
2. 或插入一张占位图片，在图片的"替代文字"中填写 <code v-pre>{{@logo}}</code>

**从 URL 插入图片：**

```java
DocTemplateBuilder.of(templateFile)
    .data("title", "公司介绍")
    .image("logo", "https://example.com/logo.png")
    .build();
```

**从字节数组插入图片：**

```java
byte[] imageBytes = Files.readAllBytes(Paths.get("logo.png"));

DocTemplateBuilder.of(templateFile)
    .image("logo", imageBytes)
    .build();
```

**指定图片尺寸：**

```java
// 指定宽高（像素）
DocTemplateBuilder.of(templateFile)
    .image("logo", "https://example.com/logo.png", 100, 80)
    .build();

// 居中显示
DocTemplateBuilder.of(templateFile)
    .imageCenter("logo", "https://example.com/logo.png", 100, 80)
    .build();

// 适应模板占位符大小（推荐）
DocTemplateBuilder.of(templateFile)
    .imageFitSize("logo", "https://example.com/logo.png")
    .build();
```

### 表格行循环

使用 `LoopRowTableRenderPolicy` 实现表格行动态循环。模板需要采用**3行结构**：

**模板格式要求：**

<div v-pre>

| 序号 | 名称 | 金额 |
|------|------|------|
| {{items}} | | |
| [no] | [name] | [amount] |

</div>

**结构说明：**

- **第1行（表头行）**：正常的表格标题
- **第2行（标记行）**：第一列放 <code v-pre>{{items}}</code>，其他列留空，渲染后此行会被删除
- **第3行（模板行）**：使用 `[字段名]` 格式引用数据属性，此行会被循环复制

**替换代码：**

```java
List<Map<String, Object>> items = new ArrayList<>();

Map<String, Object> item1 = new HashMap<>();
item1.put("no", 1);
item1.put("name", "商品A");
item1.put("amount", 100.00);
items.add(item1);

Map<String, Object> item2 = new HashMap<>();
item2.put("no", 2);
item2.put("name", "商品B");
item2.put("amount", 200.00);
items.add(item2);

DocTemplateBuilder.of(templateFile)
    .data("title", "销售报表")
    .table("items", items)  // 使用 table() 方法自动配置 LoopRowTableRenderPolicy
    .build();
```

**生成结果：**

| 序号 | 名称 | 金额 |
|------|------|------|
| 1 | 商品A | 100.00 |
| 2 | 商品B | 200.00 |

**使用 POJO 对象：**

```java
@Data
public class OrderItem {
    private Integer no;
    private String name;
    private BigDecimal amount;
}

List<OrderItem> items = orderService.getItems(orderId);

DocTemplateBuilder.of(templateFile)
    .table("items", items)  // 支持 List<POJO>
    .build();
```

## API 详解

### DocTemplateBuilder 类

文档模板构建器，提供链式调用 API。

#### 创建构建器

| 方法 | 说明 |
|------|------|
| `of(InputStream templateStream)` | 从输入流创建构建器 |
| `of(byte[] templateBytes)` | 从字节数组创建构建器 |
| `of(File templateFile)` | 从文件创建构建器 |
| `of(String templatePath)` | 从文件路径创建构建器 |
| `ofUrl(String templateUrl)` | 从 URL 地址创建构建器 |
| `ofUrl(URL templateUrl)` | 从 URL 对象创建构建器 |

#### 数据绑定

| 方法 | 说明 |
|------|------|
| `data(String key, Object value)` | 添加单个数据，支持文本、数字、对象 |
| `data(Map<String, Object> data)` | 批量添加数据 |

#### 图片插入

| 方法 | 说明 |
|------|------|
| `image(String key, byte[] imageBytes)` | 从字节数组插入图片 |
| `image(String key, InputStream imageStream)` | 从输入流插入图片 |
| `image(String key, String imageUrl)` | 从 URL 插入图片 |
| `image(String key, String imageUrl, int width, int height)` | 从 URL 插入图片并指定尺寸 |
| `image(String key, byte[] imageBytes, int width, int height)` | 从字节数组插入图片并指定尺寸 |
| `imageFitSize(String key, String imageUrl)` | 插入图片并适应占位符大小 |
| `imageFitSize(String key, byte[] imageBytes)` | 插入图片并适应占位符大小 |
| `imageFitSize(String key, InputStream imageStream)` | 插入图片并适应占位符大小 |
| `imageCenter(String key, String imageUrl, int width, int height)` | 插入图片并居中显示 |
| `imageCenter(String key, byte[] imageBytes, int width, int height)` | 插入图片并居中显示 |

#### 表格循环

| 方法 | 说明 |
|------|------|
| `table(String key, List<?> list)` | 添加表格行循环数据 |

#### 构建输出

| 方法 | 说明 |
|------|------|
| `build()` | 构建并返回字节数组 |
| `buildToStream(OutputStream outputStream)` | 构建并写入输出流 |
| `buildToFile(File outputFile)` | 构建并保存到文件 |
| `buildToFile(String outputPath)` | 构建并保存到文件路径 |

### DocTemplateException 类

文档模板处理异常类，继承自 `RuntimeException`。

```java
try {
    DocTemplateBuilder.of(templateFile)
        .data("name", "测试")
        .build();
} catch (DocTemplateException e) {
    log.error("文档生成失败: {}", e.getMessage(), e);
}
```

## 使用场景

### 合同生成

```java
@Service
public class ContractService {

    public byte[] generateContract(ContractVo contract) {
        return DocTemplateBuilder.of(getTemplate("contract.docx"))
            .data("contractNo", contract.getContractNo())
            .data("partyA", contract.getPartyA())
            .data("partyB", contract.getPartyB())
            .data("amount", contract.getAmount())
            .data("signDate", contract.getSignDate())
            .image("signatureA", contract.getSignatureA())
            .image("signatureB", contract.getSignatureB())
            .build();
    }
}
```

### 报表导出

```java
@Service
public class ReportService {

    public void exportSalesReport(String outputPath, SalesReportVo report) {
        DocTemplateBuilder.of(getTemplate("sales_report.docx"))
            .data("title", report.getTitle())
            .data("period", report.getPeriod())
            .data("totalAmount", report.getTotalAmount())
            .table("items", report.getItems())
            .image("chart", report.getChartImage())
            .buildToFile(outputPath);
    }
}
```

### 证书打印

```java
@Service
public class CertificateService {

    public byte[] generateCertificate(CertificateVo cert) {
        return DocTemplateBuilder.of(getTemplate("certificate.docx"))
            .data("name", cert.getName())
            .data("course", cert.getCourse())
            .data("issueDate", cert.getIssueDate())
            .data("certificateNo", cert.getCertificateNo())
            .imageFitSize("photo", cert.getPhotoUrl())
            .imageFitSize("seal", cert.getSealUrl())
            .build();
    }
}
```

### 从 OSS 加载模板

结合 OSS 存储模块，可以从云存储加载模板：

```java
@Service
public class DocumentService {

    @Autowired
    private OssClient ossClient;

    public byte[] generateDocument(String templateKey, Map<String, Object> data) {
        // 从 OSS 获取模板 URL
        String templateUrl = ossClient.getObjectUrl(templateKey);

        // 使用 URL 加载模板
        DocTemplateBuilder builder = DocTemplateBuilder.ofUrl(templateUrl);

        // 绑定数据
        data.forEach(builder::data);

        return builder.build();
    }
}
```

## 最佳实践

### 1. 模板设计规范

- 占位符命名使用小驼峰格式：<code v-pre>{{userName}}</code>、<code v-pre>{{orderDate}}</code>
- 图片占位符添加 `@` 前缀：<code v-pre>{{@logo}}</code>、<code v-pre>{{@signature}}</code>
- 表格循环使用3行结构：标记行 <code v-pre>{{items}}</code> + 模板行 `[field]`
- 在 Word 中预先设置好字体、字号、对齐方式等样式

### 2. 图片处理建议

```java
// 推荐使用 imageFitSize 让图片自动适应模板大小
DocTemplateBuilder.of(templateFile)
    .imageFitSize("logo", logoUrl)
    .build();

// 对于签名等需要精确控制大小的图片，使用固定尺寸
DocTemplateBuilder.of(templateFile)
    .image("signature", signatureBytes, 120, 40)
    .build();
```

### 3. 错误处理

```java
public byte[] safeGenerateDocument(File template, Map<String, Object> data) {
    try {
        DocTemplateBuilder builder = DocTemplateBuilder.of(template);
        data.forEach(builder::data);
        return builder.build();
    } catch (DocTemplateException e) {
        log.error("文档生成失败: {}", e.getMessage(), e);
        throw new ServiceException("文档生成失败，请检查模板格式");
    }
}
```

### 4. 大文件处理

对于大文件，建议直接输出到文件而非内存：

```java
// 直接输出到文件，避免内存占用过大
DocTemplateBuilder.of(templateFile)
    .data("data", largeDataObject)
    .table("items", largeList)
    .buildToFile(outputPath);
```

## 常见问题

### 1. 占位符未被替换

**可能原因：**
- Word 中的占位符被拆分成多个 Run（文本块）
- 占位符格式不正确

**解决方案：**
- 在 Word 中选中整个占位符，删除后重新输入
- 使用"查找替换"功能统一替换占位符
- 确保占位符格式正确：<code v-pre>{{key}}</code>

### 2. 图片无法显示

**可能原因：**
- 图片 URL 无法访问
- 图片格式不支持
- 图片占位符格式错误

**解决方案：**
- 检查图片 URL 是否可访问
- 确保图片格式为 PNG、JPG 等常见格式
- 图片占位符使用 <code v-pre>{{@key}}</code> 格式

### 3. 表格循环不生效

**可能原因：**
- 表格结构不正确（必须是3行结构）
- 标记行或模板行格式错误
- 未使用 `table()` 方法绑定数据

**解决方案：**

1. 确保表格采用3行结构：
   - 第1行：表头
   - 第2行：标记行（第一列放 <code v-pre>{{items}}</code>，其他列留空）
   - 第3行：模板行（使用 `[field]` 格式引用字段）

2. 使用 `table()` 方法而非 `data()` 方法绑定列表数据：
   ```java
   // 正确
   builder.table("items", itemList);

   // 错误
   builder.data("items", itemList);
   ```

3. 确保数据列表不为空

### 4. 中文乱码

**可能原因：**
- 模板文件编码问题

**解决方案：**
- 使用 UTF-8 编码保存模板
- 确保 Word 模板使用支持中文的字体

## 类型定义

```java
/**
 * Word 文档模板构建器
 * <p>
 * 基于 POI-TL 实现 Word 文档的占位符替换功能，支持：
 * <ul>
 *     <li>文本替换：{@code {{name}}}</li>
 *     <li>对象属性：{@code {{obj.field}}}</li>
 *     <li>图片插入：{@code {{@imgKey}}}</li>
 *     <li>表格行循环：{@code {{tableKey}}} + {@code [field]}</li>
 * </ul>
 */
public class DocTemplateBuilder {

    /**
     * 从 InputStream 创建构建器
     *
     * @param templateStream 模板输入流
     * @return 构建器实例
     */
    public static DocTemplateBuilder of(InputStream templateStream);

    /**
     * 从字节数组创建构建器
     *
     * @param templateBytes 模板字节数组
     * @return 构建器实例
     */
    public static DocTemplateBuilder of(byte[] templateBytes);

    /**
     * 从文件创建构建器
     *
     * @param templateFile 模板文件
     * @return 构建器实例
     */
    public static DocTemplateBuilder of(File templateFile);

    /**
     * 从文件路径创建构建器
     *
     * @param templatePath 模板文件路径
     * @return 构建器实例
     */
    public static DocTemplateBuilder of(String templatePath);

    /**
     * 从 URL 创建构建器
     *
     * @param templateUrl 模板 URL 地址
     * @return 构建器实例
     */
    public static DocTemplateBuilder ofUrl(String templateUrl);

    /**
     * 从 URL 对象创建构建器
     *
     * @param templateUrl 模板 URL 对象
     * @return 构建器实例
     */
    public static DocTemplateBuilder ofUrl(URL templateUrl);

    /**
     * 添加单个数据
     *
     * @param key   占位符名称
     * @param value 替换值
     * @return 当前构建器实例
     */
    public DocTemplateBuilder data(String key, Object value);

    /**
     * 批量添加数据
     *
     * @param data 数据映射
     * @return 当前构建器实例
     */
    public DocTemplateBuilder data(Map<String, Object> data);

    /**
     * 添加图片（从字节数组）
     *
     * @param key        图片占位符名称
     * @param imageBytes 图片字节数组
     * @return 当前构建器实例
     */
    public DocTemplateBuilder image(String key, byte[] imageBytes);

    /**
     * 添加图片（从 URL，指定尺寸）
     *
     * @param key      图片占位符名称
     * @param imageUrl 图片 URL 地址
     * @param width    图片宽度（像素）
     * @param height   图片高度（像素）
     * @return 当前构建器实例
     */
    public DocTemplateBuilder image(String key, String imageUrl, int width, int height);

    /**
     * 添加图片（适应模板占位符大小）- 推荐方式
     *
     * @param key      图片占位符名称
     * @param imageUrl 图片 URL 地址
     * @return 当前构建器实例
     */
    public DocTemplateBuilder imageFitSize(String key, String imageUrl);

    /**
     * 添加图片（居中显示，指定尺寸）
     *
     * @param key      图片占位符名称
     * @param imageUrl 图片 URL 地址
     * @param width    图片宽度（像素）
     * @param height   图片高度（像素）
     * @return 当前构建器实例
     */
    public DocTemplateBuilder imageCenter(String key, String imageUrl, int width, int height);

    /**
     * 添加表格行循环数据
     * <p>
     * 使用 LoopRowTableRenderPolicy 实现表格行循环。
     * 模板格式要求（3行结构）：
     * - 第1行：表头
     * - 第2行：标记行（第一列放 {{key}}，其他列留空）
     * - 第3行：模板行（使用 [字段名] 引用数据）
     *
     * @param key  表格占位符名称
     * @param list 数据列表（支持 List<Map> 或 List<POJO>）
     * @return 当前构建器实例
     */
    public DocTemplateBuilder table(String key, List<?> list);

    /**
     * 构建文档并返回字节数组
     *
     * @return 生成的 Word 文档字节数组
     */
    public byte[] build();

    /**
     * 构建文档并写入输出流
     *
     * @param outputStream 目标输出流
     */
    public void buildToStream(OutputStream outputStream);

    /**
     * 构建文档并保存到文件
     *
     * @param outputFile 目标文件
     */
    public void buildToFile(File outputFile);

    /**
     * 构建文档并保存到文件路径
     *
     * @param outputPath 目标文件路径
     */
    public void buildToFile(String outputPath);
}

/**
 * 文档模板处理异常
 */
public class DocTemplateException extends RuntimeException {

    public DocTemplateException(String message);

    public DocTemplateException(String message, Throwable cause);

    public DocTemplateException(Throwable cause);
}
```

## 与其他模块集成

### 与 OSS 模块集成

```java
@Service
public class DocumentExportService {

    @Autowired
    private OssClient ossClient;

    /**
     * 生成文档并上传到 OSS
     */
    public String generateAndUpload(String templateKey, Map<String, Object> data) {
        // 从 OSS 获取模板
        String templateUrl = ossClient.getObjectUrl(templateKey);

        // 生成文档
        byte[] document = DocTemplateBuilder.ofUrl(templateUrl)
            .data(data)
            .build();

        // 上传到 OSS
        String fileName = "documents/" + UUID.randomUUID() + ".docx";
        return ossClient.upload(document, fileName, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }
}
```

### 与 Excel 模块配合

```java
@Service
public class ReportExportService {

    /**
     * 导出包含图表的 Word 报告
     */
    public byte[] exportReport(ReportData data) {
        // 先用 Excel 模块生成图表图片
        byte[] chartImage = generateChartImage(data.getChartData());

        // 再用文档模板生成 Word
        return DocTemplateBuilder.of(getTemplate("report.docx"))
            .data("title", data.getTitle())
            .data("summary", data.getSummary())
            .table("details", data.getDetails())
            .imageFitSize("chart", chartImage)
            .build();
    }
}
```

### Controller 层示例

```java
@RestController
@RequestMapping("/document")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    /**
     * 生成并下载文档
     */
    @GetMapping("/export/{templateId}")
    public void exportDocument(
            @PathVariable Long templateId,
            @RequestParam Map<String, Object> params,
            HttpServletResponse response) throws IOException {

        byte[] document = documentService.generate(templateId, params);

        response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        response.setHeader("Content-Disposition", "attachment; filename=\"document.docx\"");
        response.getOutputStream().write(document);
    }
}
```
