# 字典管理 (dict)

## 概述

字典模块是一个完整的数据字典管理系统，提供字典类型和字典数据的增删改查功能，支持缓存机制、Excel导入导出、权限控制等特性。该模块采用Spring Boot + MyBatis Plus架构，支持多租户。

## 模块结构

```
plus.ruoyi.system.dict/
├── controller/          # 控制层
│   ├── SysDictDataController.java      # 字典数据控制器
│   └── SysDictTypeController.java      # 字典类型控制器
├── domain/             # 领域模型
│   ├── entity/         # 实体类
│   │   ├── SysDictData.java           # 字典数据实体
│   │   └── SysDictType.java           # 字典类型实体
│   ├── bo/             # 业务对象
│   │   ├── SysDictDataBo.java         # 字典数据业务对象
│   │   └── SysDictTypeBo.java         # 字典类型业务对象
│   └── vo/             # 视图对象
│       ├── SysDictDataVo.java         # 字典数据视图对象
│       └── SysDictTypeVo.java         # 字典类型视图对象
├── mapper/             # 数据访问层
│   ├── SysDictDataMapper.java         # 字典数据Mapper
│   ├── SysDictDataMapper.xml          # 字典数据Mapper XML
│   ├── SysDictTypeMapper.java         # 字典类型Mapper
│   └── SysDictTypeMapper.xml          # 字典类型Mapper XML
└── service/            # 业务层
    ├── ISysDictDataService.java       # 字典数据服务接口
    ├── ISysDictTypeService.java       # 字典类型服务接口
    └── impl/           # 实现类
        ├── SysDictDataServiceImpl.java # 字典数据服务实现
        └── SysDictTypeServiceImpl.java # 字典类型服务实现
```

## 核心功能

### 1. 字典类型管理

#### 1.1 实体设计

**SysDictType（字典类型表）**
```java
@TableName("sys_dict_type")
public class SysDictType extends TenantEntity {
    @TableId(value = "dict_id")
    private Long dictId;        // 字典主键
    private String dictName;    // 字典名称
    private String dictType;    // 字典类型（唯一标识）
    private String status;      // 状态（0正常 1停用）
    private String remark;      // 备注
}
```

#### 1.2 主要功能

- **分页查询**：支持按名称、类型、状态等条件查询
- **详情查询**：根据ID或类型查询字典类型详情
- **新增/修改**：支持字典类型的创建和更新
- **删除**：批量删除字典类型（检查关联数据）
- **缓存刷新**：重置字典相关缓存
- **导入导出**：支持Excel格式的导入导出

#### 1.3 API接口

| 接口 | 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|------|
| 分页查询 | GET | `/system/dict-type/pageDictTypes` | 查询字典类型列表 | system:dict:query |
| 详情查询 | GET | `/system/dict-type/getDictType/{dictId}` | 获取字典类型详情 | system:dict:query |
| 新增 | POST | `/system/dict-type/addDictType` | 新增字典类型 | system:dict:add |
| 修改 | PUT | `/system/dict-type/updateDictType` | 修改字典类型 | system:dict:update |
| 删除 | DELETE | `/system/dict-type/deleteDictTypes/{dictIds}` | 删除字典类型 | system:dict:delete |
| 缓存刷新 | DELETE | `/system/dict-type/refreshDictCache` | 刷新缓存 | system:dict:delete |
| 选项列表 | GET | `/system/dict-type/getDictTypeOptions` | 获取字典类型选项 | 无 |
| 导出 | POST | `/system/dict-type/exportDictTypes` | 导出字典类型 | system:dict:export |
| 模板下载 | POST | `/system/dict-type/templateDictTypes` | 下载导入模板 | 无 |
| 导入 | POST | `/system/dict-type/importDictTypes` | 导入字典类型 | system:dict:add |

### 2. 字典数据管理

#### 2.1 实体设计

**SysDictData（字典数据表）**
```java
@TableName("sys_dict_data")
public class SysDictData extends TenantEntity {
    @TableId(value = "dict_data_id")
    private Long dictDataId;    // 字典编码
    private Integer dictSort;   // 字典排序
    private String dictLabel;   // 字典标签
    private String dictValue;   // 字典键值
    private String dictType;    // 字典类型
    private String cssClass;    // 样式属性
    private String listClass;   // 表格字典样式
    private String isDefault;   // 是否默认（Y是 N否）
    private String status;      // 状态
    private String remark;      // 备注
}
```

#### 2.2 主要功能

- **分页查询**：支持按标签、类型、状态等条件查询
- **类型查询**：根据字典类型查询对应的字典数据
- **详情查询**：根据ID查询字典数据详情
- **新增/修改**：支持字典数据的创建和更新
- **删除**：批量删除字典数据
- **唯一性校验**：校验字典键值在同类型下的唯一性
- **导入导出**：支持Excel格式的导入导出

#### 2.3 API接口

| 接口 | 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|------|
| 分页查询 | GET | `/system/dict-data/pageDictDatas` | 查询字典数据列表 | system:dict:query |
| 详情查询 | GET | `/system/dict-data/getDictData/{dictDataId}` | 获取字典数据详情 | system:dict:query |
| 类型查询 | GET | `/system/dict-data/listDictDatasByDictType/{dictType}` | 根据类型查询数据 | 无 |
| 新增 | POST | `/system/dict-data/addDictData` | 新增字典数据 | system:dict:add |
| 修改 | PUT | `/system/dict-data/updateDictData` | 修改字典数据 | system:dict:update |
| 删除 | DELETE | `/system/dict-data/deleteDictDatas/{dictDataIds}` | 删除字典数据 | system:dict:delete |
| 导出 | POST | `/system/dict-data/exportDictDatas` | 导出字典数据 | system:dict:export |
| 模板下载 | POST | `/system/dict-data/templateDictDatas` | 下载导入模板 | 无 |
| 导入 | POST | `/system/dict-data/importDictDatas` | 导入字典数据 | system:dict:add |

## 业务特性

### 1. 缓存机制

系统使用Redis缓存提升查询性能：

- **字典类型缓存**：`CacheNames.SYS_DICT_TYPE`
- **字典数据缓存**：`CacheNames.SYS_DICT`

#### 缓存策略

```java
// 查询时缓存
@Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
public List<SysDictDataVo> listDictDataByType(String dictType);

// 更新时刷新缓存
@CachePut(cacheNames = CacheNames.SYS_DICT, key = "#bo.dictType")
public List<SysDictDataVo> updateDictData(SysDictDataBo bo);

// 删除时清除缓存
CacheUtils.evict(CacheNames.SYS_DICT, dictType);
```

### 2. 标签值转换服务

系统提供字典标签与值的双向转换功能：

```java
// 根据字典值获取标签
String getDictLabel(String dictType, String dictValue, String separator);

// 根据字典标签获取值
String getDictValue(String dictType, String dictLabel, String separator);

// 获取字典类型下所有映射
Map<String, String> getAllDictByDictType(String dictType);
```

#### 使用示例

```java
// 单值转换
String label = dictTypeService.getDictLabel("sys_user_sex", "1", ",");
// 结果: "男"

// 多值转换
String labels = dictTypeService.getDictLabel("sys_user_status", "1,2", ",");
// 结果: "正常,停用"

// 反向转换
String value = dictTypeService.getDictValue("sys_user_sex", "男", ",");
// 结果: "1"
```

### 3. 数据校验

#### 字典类型校验

- **唯一性校验**：字典类型编码在系统中必须唯一
- **格式校验**：字典类型必须以字母开头，只能包含小写字母、数字、下划线
- **关联检查**：删除字典类型时检查是否有关联的字典数据

#### 字典数据校验

- **唯一性校验**：同一字典类型下的字典值必须唯一
- **必填校验**：字典标签、字典值、字典类型为必填项
- **长度校验**：各字段有相应的长度限制

### 4. 权限控制

系统使用Sa-Token进行权限控制：

- `system:dict:query` - 查询权限
- `system:dict:add` - 新增权限
- `system:dict:update` - 修改权限
- `system:dict:delete` - 删除权限
- `system:dict:export` - 导出权限

### 5. 多租户支持

实体类继承`TenantEntity`，自动支持多租户数据隔离：

```java
public class SysDictType extends TenantEntity {
    // 自动包含租户相关字段
}
```

### 6. Excel导入导出

#### 导出功能

- 支持分页导出
- 自定义导出字段
- 字典值自动转换为标签显示

#### 导入功能

- 模板下载
- 数据校验
- 批量保存
- 错误信息反馈

```java
// 导入示例
@PostMapping("/importDictDatas")
public R<Void> importDictDatas(MultipartFile file) throws Exception {
    ExcelResult<SysDictDataVo> excelResult = 
        ExcelUtil.importExcel(file.getInputStream(), SysDictDataVo.class, true);
    dictDataService.batchSave(MapstructUtils.convert(excelResult.getList(), SysDictData.class));
    return R.ok(excelResult.getAnalysis());
}
```

## 核心服务方法

### ISysDictTypeService

```java
public interface ISysDictTypeService extends IBaseService<SysDictType, SysDictTypeBo, SysDictTypeVo>, DictService {
    
    // 根据字典类型查询字典数据
    List<SysDictDataVo> listDictDataByType(String dictType);
    
    // 根据字典类型查询类型信息
    SysDictTypeVo getDictTypeByType(String dictType);
    
    // 批量删除字典类型
    void deleteDictTypeByIds(Long[] dictIds);
    
    // 重置字典缓存
    void resetDictCache();
    
    // 新增字典类型
    List<SysDictDataVo> insertDictType(SysDictTypeBo bo);
    
    // 修改字典类型
    List<SysDictDataVo> updateDictType(SysDictTypeBo bo);
    
    // 校验字典类型唯一性
    boolean checkDictTypeUnique(SysDictTypeBo dictType);
}
```

### ISysDictDataService

```java
public interface ISysDictDataService extends IBaseService<SysDictData, SysDictDataBo, SysDictDataVo> {
    
    // 根据字典类型和值获取标签
    String getDictLabel(String dictType, String dictValue);
    
    // 批量删除字典数据
    void deleteDictDataByIds(Long[] dictDataIds);
    
    // 新增字典数据
    List<SysDictDataVo> insertDictData(SysDictDataBo bo);
    
    // 修改字典数据
    List<SysDictDataVo> updateDictData(SysDictDataBo bo);
    
    // 校验字典数据唯一性
    boolean checkDictDataUnique(SysDictDataBo dict);
    
    // 根据类型和标签查询数据
    SysDictDataVo getDictDataByTypeAndLabel(String dictType, String dictLabel);
}
```

## 使用示例

### 1. 创建字典类型

```java
// 创建字典类型
SysDictTypeBo dictTypeBo = new SysDictTypeBo();
dictTypeBo.setDictName("用户性别");
dictTypeBo.setDictType("sys_user_sex");
dictTypeBo.setStatus("0");
dictTypeBo.setRemark("用户性别字典");

dictTypeService.insertDictType(dictTypeBo);
```

### 2. 添加字典数据

```java
// 添加字典数据
SysDictDataBo dictDataBo = new SysDictDataBo();
dictDataBo.setDictSort(1);
dictDataBo.setDictLabel("男");
dictDataBo.setDictValue("1");
dictDataBo.setDictType("sys_user_sex");
dictDataBo.setStatus("0");
dictDataBo.setIsDefault("N");

dictDataService.insertDictData(dictDataBo);
```

### 3. 查询字典数据

```java
// 根据类型查询所有字典数据
List<SysDictDataVo> dataList = dictTypeService.listDictDataByType("sys_user_sex");

// 获取字典标签
String label = dictTypeService.getDictLabel("sys_user_sex", "1", ",");
```

### 4. 前端使用

```javascript
// 获取字典数据
axios.get('/system/dict-data/listDictDatasByDictType/sys_user_sex')
  .then(response => {
    const dictData = response.data.data;
    // 使用字典数据渲染下拉框等组件
  });
```

## 注意事项

1. **缓存一致性**：修改字典数据时会自动更新缓存，但集群环境需要考虑缓存同步
2. **性能优化**：大量字典数据建议分页查询，避免一次性加载过多数据
3. **数据完整性**：删除字典类型前会检查关联的字典数据，确保数据完整性
4. **权限控制**：所有操作都有相应的权限控制，需要配置对应的角色权限
5. **多租户隔离**：系统自动处理多租户数据隔离，无需手动处理
6. **字典类型规范**：字典类型命名建议使用模块前缀，如`sys_`、`biz_`等

## 扩展建议

1. **字典分组**：可以考虑增加字典分组功能，便于管理大量字典
2. **字典树形结构**：支持层级字典，适用于地区、部门等场景
3. **字典国际化**：支持多语言字典标签
4. **字典版本控制**：记录字典变更历史，支持版本回退
5. **字典同步**：提供字典数据在不同环境间的同步功能

## 总结

字典模块是系统的基础模块，提供了完整的字典管理功能，具有良好的扩展性和稳定性。通过缓存机制提升性能，通过权限控制确保安全，通过多租户支持适应不同的部署场景。该模块可以很好地支持系统中各种枚举值的管理和使用。
