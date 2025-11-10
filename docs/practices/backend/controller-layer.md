# Controller 层最佳实践

本文档详细介绍 ruoyi-plus-uniapp 项目中 Controller 层的设计原则和最佳实践。

## 核心设计原则

### 1. Controller 职责

Controller 层作为请求入口,主要职责包括:
- **请求接收**: 接收HTTP请求并解析参数
- **参数校验**: 使用注解进行参数验证
- **权限控制**: 使用Sa-Token进行权限检查
- **调用Service**: 调用Service层处理业务逻辑
- **返回结果**: 统一封装返回结果

**关键原则**: Controller 层只做调度,不写业务逻辑。

---

## Controller 类设计

### 标准Controller定义

```java
@Validated                          // ✅ 启用参数校验
@RequiredArgsConstructor            // ✅ 构造函数注入
@RestController                     // ✅ RESTful API
@RequestMapping("/base/ad")         // ✅ 统一请求前缀
public class AdController {

    private final IAdService adService;  // ✅ 只注入Service

    // 方法实现...
}
```

**设计要点**:
- ✅ 使用 `@Validated` 启用类级别参数校验
- ✅ 使用 `@RequiredArgsConstructor` 进行依赖注入
- ✅ 使用 `@RestController` 自动序列化JSON
- ✅ 只注入 Service 层接口
- ❌ 不注入 DAO 或 Mapper

---

## 标准CRUD接口

### 1. 分页查询

```java
/**
 * 查询广告配置列表
 */
@SaCheckPermission("base:ad:query")
@GetMapping("/pageAds")
@OpenApi(value = "查询广告配置列表")
public R<PageResult<AdVo>> pageAds(AdBo bo, PageQuery pageQuery) {
    return R.ok(adService.page(bo, pageQuery));
}
```

**实现要点**:
- ✅ 使用 `@GetMapping` 进行查询操作
- ✅ 添加 `@SaCheckPermission` 权限控制
- ✅ 添加 `@OpenApi` 支持开放平台
- ✅ 使用 `R.ok()` 封装成功结果
- ✅ 参数使用 Bo 和 PageQuery 对象

---

### 2. 单条查询

```java
/**
 * 获取广告配置详细信息
 */
@SaCheckPermission("base:ad:query")
@GetMapping("/getAd/{id}")
@OpenApi(value = "获取广告配置详细信息")
public R<AdVo> getAd(@NotNull(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long id) {
    return R.ok(adService.get(id));
}
```

**实现要点**:
- ✅ 使用 `@PathVariable` 接收路径参数
- ✅ 使用 `@NotNull` 校验ID不为空
- ✅ 使用 `I18nKeys` 支持国际化
- ✅ 返回具体的 Vo 对象

---

### 3. 新增

```java
/**
 * 新增广告配置
 */
@SaCheckPermission("base:ad:add")
@Log(title = "广告配置", operType = DictOperType.INSERT)
@RepeatSubmit()
@PostMapping("/addAd")
@OpenApi(value = "添加广告配置")
public R<Long> addAd(@Validated(AddGroup.class) @RequestBody AdBo bo) {
    return R.ok(adService.add(bo));
}
```

**实现要点**:
- ✅ 使用 `@PostMapping` 进行新增操作
- ✅ 添加 `@Log` 记录操作日志
- ✅ 添加 `@RepeatSubmit` 防重复提交
- ✅ 使用 `@Validated(AddGroup.class)` 分组校验
- ✅ 使用 `@RequestBody` 接收JSON参数
- ✅ 返回新增记录的ID

---

### 4. 修改

```java
/**
 * 修改广告配置
 */
@SaCheckPermission("base:ad:update")
@Log(title = "广告配置", operType = DictOperType.UPDATE)
@RepeatSubmit()
@PutMapping("/updateAd")
public R<Void> updateAd(@Validated(EditGroup.class) @RequestBody AdBo bo) {
    return R.status(adService.update(bo));
}
```

**实现要点**:
- ✅ 使用 `@PutMapping` 进行修改操作
- ✅ 使用 `@Validated(EditGroup.class)` 分组校验
- ✅ 使用 `R.status()` 返回操作结果
- ✅ 返回类型为 `R<Void>`

---

### 5. 删除

```java
/**
 * 删除广告配置
 */
@SaCheckPermission("base:ad:delete")
@Log(title = "广告配置", operType = DictOperType.DELETE)
@DeleteMapping("/deleteAds/{ids}")
public R<Void> deleteAds(@NotEmpty(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long[] ids) {
    return R.status(adService.batchDelete(List.of(ids)));
}
```

**实现要点**:
- ✅ 使用 `@DeleteMapping` 进行删除操作
- ✅ 使用 `@NotEmpty` 校验ID数组不为空
- ✅ 支持批量删除
- ✅ 使用 `List.of(ids)` 转换数组为集合

---

## 高级功能接口

### 1. 数据导出

```java
/**
 * 导出广告配置列表
 */
@SaCheckPermission("base:ad:export")
@Log(title = "广告配置", operType = DictOperType.EXPORT)
@PostMapping("/exportAds")
public void exportAds(AdBo bo, PageQuery pageQuery, HttpServletResponse response) {
    PageResult<AdVo> pageResult = adService.page(bo, pageQuery);
    ExcelUtil.exportExcel(pageResult.getRecords(), "广告配置", AdVo.class, response);
}
```

**实现要点**:
- ✅ 返回类型为 `void`,直接写入response
- ✅ 使用 `ExcelUtil.exportExcel()` 导出Excel
- ✅ 第一个参数是数据列表
- ✅ 第二个参数是工作表名称
- ✅ 第三个参数是导出的类(通常是Vo)

---

### 2. 导出模板

```java
/**
 * 获取广告配置导入模板
 */
@PostMapping("/templateAds")
public void templateAds(HttpServletResponse response) {
    ExcelUtil.exportExcel(new ArrayList<>(), "广告配置模板", AdVo.class, response);
}
```

**实现要点**:
- ✅ 传入空列表导出模板
- ✅ 模板名称使用"xxx模板"格式
- ✅ 通常不需要权限控制

---

### 3. 数据导入

```java
/**
 * 导入广告配置
 */
@Log(title = "广告配置", operType = DictOperType.IMPORT)
@SaCheckPermission("base:ad:import")
@PostMapping(value = "/importAds", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public R<Void> importAds(MultipartFile file) throws Exception {
    ExcelResult<AdVo> excelResult = ExcelUtil.importExcel(file.getInputStream(), AdVo.class, true);
    List<AdBo> boList = MapstructUtils.convert(excelResult.getList(), AdBo.class);
    adService.batchSave(boList);
    return R.ok(excelResult.getAnalysis());
}
```

**实现要点**:
- ✅ 使用 `consumes = MediaType.MULTIPART_FORM_DATA_VALUE` 接收文件
- ✅ 使用 `ExcelUtil.importExcel()` 解析Excel
- ✅ 第三个参数 `true` 表示跳过第一行标题
- ✅ 使用 `MapstructUtils.convert()` 转换对象
- ✅ 返回导入分析结果

---

## 参数校验

### 1. 路径参数校验

```java
// 单个ID参数
@GetMapping("/getAd/{id}")
public R<AdVo> getAd(@NotNull(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long id) {
    return R.ok(adService.get(id));
}

// ID数组参数
@DeleteMapping("/deleteAds/{ids}")
public R<Void> deleteAds(@NotEmpty(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long[] ids) {
    return R.status(adService.batchDelete(List.of(ids)));
}
```

**校验注解**:
- ✅ `@NotNull` - 不能为null
- ✅ `@NotEmpty` - 集合/数组不能为空
- ✅ 使用 `I18nKeys` 常量定义错误信息

---

### 2. 请求体参数校验

```java
// 新增时的校验
@PostMapping("/addAd")
public R<Long> addAd(@Validated(AddGroup.class) @RequestBody AdBo bo) {
    return R.ok(adService.add(bo));
}

// 修改时的校验
@PutMapping("/updateAd")
public R<Void> updateAd(@Validated(EditGroup.class) @RequestBody AdBo bo) {
    return R.status(adService.update(bo));
}
```

**分组校验**:
- ✅ `AddGroup.class` - 新增时的校验规则
- ✅ `EditGroup.class` - 修改时的校验规则
- ✅ 不同分组可以有不同的校验要求

---

### 3. Bo对象校验规则

```java
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMappers({
    @AutoMapper(target = Ad.class, reverseConvertGenerate = false),
    @AutoMapper(target = AdVo.class)
})
public class AdBo extends BaseEntity {

    /**
     * 主键id
     */
    @NotNull(message = "主键id不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 广告名称
     */
    @NotBlank(message = "广告名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String adName;

    /**
     * 状态
     */
    private String status;
}
```

**校验规则说明**:
- ✅ `id` 字段只在 `EditGroup` 组校验(修改时必须有ID)
- ✅ `adName` 字段在 `AddGroup` 和 `EditGroup` 组都校验
- ✅ `status` 字段不强制校验(允许为空)

---

## 权限控制

### 使用 Sa-Token 权限注解

```java
@SaCheckPermission("base:ad:query")   // 查询权限
@SaCheckPermission("base:ad:add")     // 新增权限
@SaCheckPermission("base:ad:update")  // 修改权限
@SaCheckPermission("base:ad:delete")  // 删除权限
@SaCheckPermission("base:ad:export")  // 导出权限
@SaCheckPermission("base:ad:import")  // 导入权限
```

**权限字符串规范**:
- 格式: `模块:功能:操作`
- 示例: `base:ad:query` 表示"基础模块-广告-查询"
- ✅ 每个接口都应该有权限控制
- ✅ 权限字符串要与前端菜单配置一致

---

## 操作日志

### 使用 @Log 注解

```java
@Log(title = "广告配置", operType = DictOperType.INSERT)
@Log(title = "广告配置", operType = DictOperType.UPDATE)
@Log(title = "广告配置", operType = DictOperType.DELETE)
@Log(title = "广告配置", operType = DictOperType.EXPORT)
@Log(title = "广告配置", operType = DictOperType.IMPORT)
```

**参数说明**:
- `title` - 操作模块名称
- `operType` - 操作类型(增删改查导入导出等)

**操作类型枚举**:
```java
public interface DictOperType {
    String INSERT = "INSERT";   // 新增
    String UPDATE = "UPDATE";   // 修改
    String DELETE = "DELETE";   // 删除
    String EXPORT = "EXPORT";   // 导出
    String IMPORT = "IMPORT";   // 导入
    String QUERY  = "QUERY";    // 查询
}
```

---

## 防重复提交

### 使用 @RepeatSubmit 注解

```java
@RepeatSubmit()
@PostMapping("/addAd")
public R<Long> addAd(@Validated(AddGroup.class) @RequestBody AdBo bo) {
    return R.ok(adService.add(bo));
}

@RepeatSubmit()
@PutMapping("/updateAd")
public R<Void> updateAd(@Validated(EditGroup.class) @RequestBody AdBo bo) {
    return R.status(adService.update(bo));
}
```

**使用场景**:
- ✅ 新增操作 - 防止重复提交
- ✅ 修改操作 - 防止重复提交
- ✅ 删除操作 - 可选(根据业务需求)
- ❌ 查询操作 - 不需要

**原理**: 使用Redis存储请求标识,在指定时间内(默认5秒)相同请求会被拒绝。

---

## 统一返回值

### R 工具类使用

```java
// 返回成功结果 - 带数据
R.ok(data)

// 返回成功结果 - 无数据
R.ok()

// 返回操作状态
R.status(boolean result)

// 返回失败结果
R.fail("错误信息")

// 返回失败结果 - 指定状态码
R.fail(500, "服务器错误")
```

**返回类型规范**:
- `R<PageResult<Vo>>` - 分页查询
- `R<Vo>` - 单条查询
- `R<Long>` - 新增(返回ID)
- `R<Void>` - 修改/删除
- `void` - 文件导出

---

## OpenAPI 开放平台支持

### 使用 @OpenApi 注解

```java
@OpenApi(value = "查询广告配置列表")
@GetMapping("/pageAds")
public R<PageResult<AdVo>> pageAds(AdBo bo, PageQuery pageQuery) {
    return R.ok(adService.page(bo, pageQuery));
}
```

**说明**:
- ✅ 添加此注解后,接口可以通过开放平台访问
- ✅ `value` 参数为接口描述
- ✅ 适用于需要对外开放的API
- ❌ 内部接口不需要添加

---

## 常见业务场景

### 1. 状态变更接口

```java
/**
 * 修改广告状态
 */
@SaCheckPermission("base:ad:update")
@Log(title = "广告配置", operType = DictOperType.UPDATE)
@PutMapping("/changeAdStatus")
public R<Void> changeAdStatus(@RequestParam Long id, @RequestParam String status) {
    return R.status(adService.changeStatus(id, status));
}
```

---

### 2. 批量操作接口

```java
/**
 * 批量修改状态
 */
@SaCheckPermission("base:ad:update")
@Log(title = "广告配置", operType = DictOperType.UPDATE)
@PutMapping("/batchChangeStatus")
public R<Void> batchChangeStatus(@RequestBody List<Long> ids, @RequestParam String status) {
    return R.status(adService.batchChangeStatus(ids, status));
}
```

---

### 3. 详情查询(含关联数据)

```java
/**
 * 获取广告配置详情(含关联数据)
 */
@SaCheckPermission("base:ad:query")
@GetMapping("/getAdWithDetails/{id}")
public R<AdVo> getAdWithDetails(@NotNull(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long id) {
    return R.ok(adService.getWithDetails(id));
}
```

---

### 4. 列表查询(不分页)

```java
/**
 * 查询广告配置列表(不分页)
 */
@SaCheckPermission("base:ad:query")
@GetMapping("/listAds")
public R<List<AdVo>> listAds(AdBo bo) {
    return R.ok(adService.list(bo));
}
```

---

## 异常处理

### 统一异常处理机制

Controller 层不需要 try-catch,异常会被全局异常处理器捕获:

```java
// ✅ 正确 - 让异常向上抛出
@PostMapping("/addAd")
public R<Long> addAd(@Validated(AddGroup.class) @RequestBody AdBo bo) {
    return R.ok(adService.add(bo));
}

// ❌ 错误 - 不要在Controller层捕获异常
@PostMapping("/addAd")
public R<Long> addAd(@Validated(AddGroup.class) @RequestBody AdBo bo) {
    try {
        return R.ok(adService.add(bo));
    } catch (Exception e) {
        return R.fail(e.getMessage());
    }
}
```

**异常处理原则**:
- ✅ Service层抛出 `ServiceException`
- ✅ Controller层不捕获异常
- ✅ 全局异常处理器统一处理
- ✅ 返回统一格式的错误信息

---

## 代码检查清单

开发 Controller 层代码时,请确认以下事项:

- [ ] ✅ 类上添加 `@Validated` 注解
- [ ] ✅ 类上添加 `@RequiredArgsConstructor` 注解
- [ ] ✅ 类上添加 `@RestController` 和 `@RequestMapping` 注解
- [ ] ✅ 只注入 Service 层接口
- [ ] ✅ 每个方法都有 `@SaCheckPermission` 权限控制
- [ ] ✅ 写操作添加 `@Log` 记录日志
- [ ] ✅ 新增/修改操作添加 `@RepeatSubmit` 防重复提交
- [ ] ✅ 参数使用合适的校验注解
- [ ] ✅ 新增/修改使用分组校验
- [ ] ✅ 统一使用 `R<T>` 封装返回值
- [ ] ✅ 路径参数使用 `@PathVariable` 接收
- [ ] ✅ JSON参数使用 `@RequestBody` 接收
- [ ] ✅ 不在Controller层写业务逻辑
- [ ] ✅ 不捕获异常,让异常向上抛出

---

## 总结

**Controller 层核心原则**:
1. **职责清晰** - 只做调度,不写业务逻辑
2. **权限控制** - 每个接口都要有权限检查
3. **参数校验** - 使用注解进行参数验证
4. **防重复提交** - 写操作使用 @RepeatSubmit
5. **操作日志** - 写操作使用 @Log 记录
6. **统一返回值** - 使用 R<T> 封装结果
7. **RESTful规范** - 使用合适的HTTP方法
8. **异常处理** - 不捕获异常,让全局处理器统一处理

遵循这些原则,可以编写出清晰、规范、易维护的 Controller 层代码。

---
*参考: [Service层最佳实践](./service-layer.md) | [数据校验最佳实践](./validation.md) | [异常处理机制](./exception-handling.md)*
