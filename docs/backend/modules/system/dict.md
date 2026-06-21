# 字典管理模块

## 介绍

字典管理模块是RuoYi-Plus系统的核心基础模块,提供完整的数据字典管理功能。该模块采用字典类型和字典数据两级结构设计,支持系统级字典和租户自定义字典的分离管理,为整个系统提供统一的枚举值管理和标签值转换服务。

**核心特性:**

- **两级结构设计** - 字典类型(Type)和字典数据(Data)分离,便于分类管理和维护
- **系统级字典保护** - 通过`isSystem`字段区分系统级字典和租户自定义字典,防止租户误操作系统核心字典
- **多租户数据隔离** - 继承`TenantEntity`,自动实现租户级数据隔离,支持租户自定义字典
- **高性能缓存机制** - 基于Redis的多级缓存策略,支持字典类型和字典数据的独立缓存管理
- **标签值双向转换** - 提供字典值到标签、标签到字典值的双向转换服务,支持批量转换
- **完整的CRUD操作** - 支持字典类型和字典数据的增删改查、分页查询、批量操作
- **Excel导入导出** - 支持字典类型和字典数据的Excel批量导入导出,提供标准模板
- **权限精细控制** - 基于Sa-Token的权限控制,支持查询、新增、修改、删除、导出等细粒度权限
- **数据完整性保护** - 删除字典类型时自动检查关联的字典数据,防止数据孤岛
- **防重复提交** - 使用`@RepeatSubmit`注解防止表单重复提交,保证数据一致性

字典管理模块广泛应用于系统的各个业务场景,如用户性别、用户状态、订单状态、支付方式等枚举值的统一管理。通过字典管理,可以实现前端下拉框、单选框等组件的动态数据源,避免硬编码,提高系统的可维护性和灵活性。

## 模块结构

```text
plus.ruoyi.system.dict/
├── controller/                          # 控制层
│   ├── SysDictTypeController.java      # 字典类型控制器
│   └── SysDictDataController.java      # 字典数据控制器
├── domain/                              # 领域模型
│   ├── SysDictType.java                # 字典类型实体
│   ├── SysDictData.java                # 字典数据实体
│   ├── bo/                             # 业务对象
│   │   ├── SysDictTypeBo.java          # 字典类型业务对象
│   │   └── SysDictDataBo.java          # 字典数据业务对象
│   └── vo/                             # 视图对象
│       ├── SysDictTypeVo.java          # 字典类型视图对象
│       └── SysDictDataVo.java          # 字典数据视图对象
├── dao/                                 # 数据访问层
│   ├── ISysDictTypeDao.java            # 字典类型DAO接口
│   ├── ISysDictDataDao.java            # 字典数据DAO接口
│   └── impl/                           # DAO实现
│       ├── SysDictTypeDaoImpl.java     # 字典类型DAO实现
│       └── SysDictDataDaoImpl.java     # 字典数据DAO实现
├── mapper/                              # MyBatis映射器
│   ├── SysDictTypeMapper.java          # 字典类型Mapper
│   └── SysDictDataMapper.java          # 字典数据Mapper
├── service/                             # 业务层
│   ├── ISysDictTypeService.java        # 字典类型服务接口
│   ├── ISysDictDataService.java        # 字典数据服务接口
│   └── impl/                           # 服务实现
│       ├── SysDictTypeServiceImpl.java # 字典类型服务实现
│       └── SysDictDataServiceImpl.java # 字典数据服务实现
└── resources/mapper/dict/               # MyBatis XML映射文件
    ├── SysDictTypeMapper.xml           # 字典类型映射文件
    └── SysDictDataMapper.xml           # 字典数据映射文件
```

**架构说明:**

1. **Controller层**: 提供RESTful API接口,处理HTTP请求和响应
2. **Service层**: 实现业务逻辑,包括缓存管理、数据校验、事务控制
3. **DAO层**: 封装数据访问逻辑,提供统一的数据操作接口
4. **Mapper层**: MyBatis映射器,执行SQL操作
5. **Domain层**: 包含实体类(Entity)、业务对象(Bo)、视图对象(Vo)

## 数据模型

### 字典类型实体 (SysDictType)

字典类型表用于定义字典的分类,每个字典类型可以包含多个字典数据项。

**表名**: `sys_dict_type`

**字段说明**:

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| dict_id | Long | 字典主键 | 主键,自增 |
| dict_name | String | 字典名称 | 非空,用于显示 |
| dict_type | String | 字典编码 | 非空,唯一,用于标识（前端表单统一显示为"字典编码"，避免与模块名混淆） |
| status | String | 状态 | 0=正常,1=停用 |
| is_system | String | 是否系统级字典 | 0=租户自定义,1=系统级 |
| remark | String | 备注 | 可选 |
| create_dept | Long | 创建部门 | 继承自TenantEntity |
| create_by | Long | 创建者 | 继承自TenantEntity |
| create_time | Date | 创建时间 | 继承自TenantEntity |
| update_by | Long | 更新者 | 继承自TenantEntity |
| update_time | Date | 更新时间 | 继承自TenantEntity |
| tenant_id | String | 租户ID | 继承自TenantEntity |

**实体类定义**:

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dict_type")
public class SysDictType extends TenantEntity {

    /**
     * 字典主键
     */
    @TableId(value = "dict_id")
    private Long dictId;

    /**
     * 字典名称
     */
    private String dictName;

    /**
     * 字典类型
     */
    private String dictType;

    /**
     * 状态
     */
    private String status;

    /**
     * 是否系统级字典
     * 0 - 租户自定义字典(允许修改)
     * 1 - 系统级字典(租户不允许修改)
     */
    private String isSystem;

    /**
     * 备注
     */
    private String remark;
}
```

**关键字段说明**:

- **dict_type**: 字典类型的唯一标识,建议使用模块前缀命名,如`sys_user_gender`、`biz_order_status`
- **is_system**: 系统级字典标识,用于保护系统核心字典不被租户误删除或修改
- **status**: 字典状态,停用后前端将无法获取该字典类型下的数据

### 字典数据实体 (SysDictData)

字典数据表存储具体的字典项,每个字典数据项属于一个字典类型。

**表名**: `sys_dict_data`

**字段说明**:

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| dict_data_id | Long | 字典编码 | 主键,自增 |
| dict_sort | Integer | 字典排序 | 用于前端显示排序 |
| dict_label | String | 字典标签 | 非空,显示值 |
| dict_value | String | 字典键值 | 非空,存储值 |
| dict_type | String | 字典类型 | 非空,关联字典类型 |
| css_class | String | 样式属性 | 可选,扩展样式 |
| list_class | String | 表格字典样式 | 可选,如default/primary/success等 |
| is_default | String | 是否默认 | Y=是,N=否 |
| status | String | 状态 | 0=正常,1=停用 |
| remark | String | 备注 | 可选 |
| create_dept | Long | 创建部门 | 继承自TenantEntity |
| create_by | Long | 创建者 | 继承自TenantEntity |
| create_time | Date | 创建时间 | 继承自TenantEntity |
| update_by | Long | 更新者 | 继承自TenantEntity |
| update_time | Date | 更新时间 | 继承自TenantEntity |
| tenant_id | String | 租户ID | 继承自TenantEntity |

**实体类定义**:

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dict_data")
public class SysDictData extends TenantEntity {

    /**
     * 字典编码
     */
    @TableId(value = "dict_data_id")
    private Long dictDataId;

    /**
     * 字典排序
     */
    private Integer dictSort;

    /**
     * 字典标签
     */
    private String dictLabel;

    /**
     * 字典键值
     */
    private String dictValue;

    /**
     * 字典类型
     */
    private String dictType;

    /**
     * 样式属性(其他样式扩展)
     */
    private String cssClass;

    /**
     * 表格字典样式
     */
    private String listClass;

    /**
     * 是否默认(Y是 N否)
     */
    private String isDefault;

    /**
     * 状态
     */
    private String status;

    /**
     * 备注
     */
    private String remark;
}
```

**关键字段说明**:

- **dict_label**: 字典标签,用于前端显示,如"男"、"女"
- **dict_value**: 字典键值,用于后端存储和传输,如"1"、"2"
- **dict_sort**: 排序字段,数值越小越靠前
- **list_class**: 表格样式类,支持Element Plus的标签类型,如`default`、`primary`、`success`、`info`、`warning`、`danger`
- **is_default**: 默认值标识,用于前端组件的默认选中

## 核心功能

### 1. 字典类型管理

字典类型管理提供字典分类的完整生命周期管理功能。

#### 1.1 分页查询字典类型

支持按字典名称、字典类型、状态等条件进行分页查询。

**接口**: `GET /system/dictType/pageDictTypes`

**权限**: `system:dict:query`

**请求参数**:

```java
public class SysDictTypeBo {
    private String dictName;    // 字典名称(模糊查询)
    private String dictType;    // 字典类型(模糊查询)
    private String status;      // 状态(精确查询)
    private String isSystem;    // 是否系统级字典
}
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "records": [
      {
        "dictId": 1,
        "dictName": "用户性别",
        "dictType": "sys_user_gender",
        "status": "0",
        "isSystem": "1",
        "remark": "用户性别列表",
        "createTime": "2024-01-01 00:00:00"
      }
    ],
    "total": 1,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

#### 1.2 查询字典类型详情

根据字典ID查询字典类型的详细信息。

**接口**: `GET /system/dictType/getDictType/{dictId}`

**权限**: `system:dict:query`

**路径参数**:
- `dictId`: 字典类型ID

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "dictId": 1,
    "dictName": "用户性别",
    "dictType": "sys_user_gender",
    "status": "0",
    "isSystem": "1",
    "remark": "用户性别列表"
  }
}
```

#### 1.3 新增字典类型

创建新的字典类型,系统会自动校验字典类型的唯一性。

**接口**: `POST /system/dictType/addDictType`

**权限**: `system:dict:add`

**请求体**:

```json
{
  "dictName": "订单状态",
  "dictType": "biz_order_status",
  "status": "0",
  "isSystem": "0",
  "remark": "订单状态字典"
}
```

**业务逻辑**:

1. 校验字典类型唯一性(同一租户下`dict_type`不能重复)
2. 自动填充创建人、创建时间、租户ID等信息
3. 返回新创建的字典类型ID

**响应示例**:

```json
{
  "code": 200,
  "msg": "新增成功",
  "data": 100
}
```

#### 1.4 修改字典类型

更新字典类型信息,支持修改字典名称、状态、备注等字段。

**接口**: `PUT /system/dictType/updateDictType`

**权限**: `system:dict:update`

**请求体**:

```json
{
  "dictId": 100,
  "dictName": "订单状态(修改)",
  "dictType": "biz_order_status",
  "status": "0",
  "remark": "订单状态字典(已修改)"
}
```

**业务逻辑**:

1. 校验字典类型唯一性(排除自身)
2. 如果修改了`dict_type`,会同步更新所有关联的字典数据
3. 自动更新缓存
4. 记录操作日志

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

#### 1.5 删除字典类型

批量删除字典类型,删除前会检查是否存在关联的字典数据。

**接口**: `DELETE /system/dictType/deleteDictTypes/{dictIds}`

**权限**: `system:dict:delete`

**路径参数**:
- `dictIds`: 字典类型ID数组,多个ID用逗号分隔,如`1,2,3`

**业务逻辑**:

1. 检查是否存在关联的字典数据,如果存在则拒绝删除
2. 检查是否为系统级字典,系统级字典不允许删除
3. 批量删除字典类型
4. 清除相关缓存
5. 记录操作日志

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

#### 1.6 刷新字典缓存

手动刷新字典缓存,清除所有字典类型和字典数据的缓存。

**接口**: `DELETE /system/dictType/refreshDictCache`

**权限**: `system:dict:delete`

**业务逻辑**:

1. 清除所有字典类型缓存
2. 清除所有字典数据缓存
3. 记录操作日志

**使用场景**:
- 批量导入字典数据后
- 直接修改数据库后
- 缓存数据异常时

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

#### 1.7 获取字典类型选项列表

获取所有字典类型的简化列表,用于前端下拉框等组件。

**接口**: `GET /system/dictType/getDictTypeOptions`

**权限**: 无需权限

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "dictId": 1,
      "dictName": "用户性别",
      "dictType": "sys_user_gender"
    },
    {
      "dictId": 2,
      "dictName": "用户状态",
      "dictType": "sys_user_status"
    }
  ]
}
```

#### 1.8 导出字典类型

导出字典类型数据为Excel文件,支持按条件筛选导出。

**接口**: `POST /system/dictType/exportDictTypes`

**权限**: `system:dict:export`

**请求参数**:

```java
public class SysDictTypeBo {
    private String dictName;    // 字典名称(模糊查询)
    private String dictType;    // 字典类型(模糊查询)
    private String status;      // 状态(精确查询)
}
```

**业务逻辑**:

1. 根据查询条件获取字典类型列表
2. 使用ExcelUtil工具类生成Excel文件
3. 设置响应头,触发浏览器下载
4. 记录导出操作日志

**响应**: Excel文件下载

#### 1.9 下载字典类型导入模板

下载字典类型的Excel导入模板,用于批量导入。

**接口**: `POST /system/dictType/templateDictTypes`

**权限**: 无需权限

**业务逻辑**:

1. 生成空的Excel模板文件
2. 包含所有必填字段的表头
3. 可选包含示例数据

**响应**: Excel模板文件下载

#### 1.10 导入字典类型

批量导入字典类型数据,支持Excel文件上传。

**接口**: `POST /system/dictType/importDictTypes`

**权限**: `system:dict:add`

**请求参数**:
- `file`: MultipartFile类型,Excel文件

**业务逻辑**:

1. 解析Excel文件,读取字典类型数据
2. 校验数据格式和必填字段
3. 校验字典类型唯一性
4. 批量保存字典类型
5. 返回导入结果统计

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": "共导入10条数据,成功8条,失败2条"
}
```

### 2. 字典数据管理

字典数据管理提供字典项的完整生命周期管理功能。

#### 2.1 分页查询字典数据

支持按字典标签、字典类型、状态等条件进行分页查询。

**接口**: `GET /system/dictData/pageDictDatas`

**权限**: `system:dict:query`

**请求参数**:

```java
public class SysDictDataBo {
    private String dictLabel;   // 字典标签(模糊查询)
    private String dictType;    // 字典类型(精确查询)
    private String status;      // 状态(精确查询)
}
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "records": [
      {
        "dictDataId": 1,
        "dictSort": 1,
        "dictLabel": "男",
        "dictValue": "1",
        "dictType": "sys_user_gender",
        "listClass": "primary",
        "isDefault": "Y",
        "status": "0",
        "createTime": "2024-01-01 00:00:00"
      },
      {
        "dictDataId": 2,
        "dictSort": 2,
        "dictLabel": "女",
        "dictValue": "2",
        "dictType": "sys_user_gender",
        "listClass": "danger",
        "isDefault": "N",
        "status": "0",
        "createTime": "2024-01-01 00:00:00"
      }
    ],
    "total": 2,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

#### 2.2 查询字典数据详情

根据字典数据ID查询详细信息。

**接口**: `GET /system/dictData/getDictData/{dictDataId}`

**权限**: `system:dict:query`

**路径参数**:
- `dictDataId`: 字典数据ID

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "dictDataId": 1,
    "dictSort": 1,
    "dictLabel": "男",
    "dictValue": "1",
    "dictType": "sys_user_gender",
    "cssClass": "",
    "listClass": "primary",
    "isDefault": "Y",
    "status": "0",
    "remark": "性别男"
  }
}
```

#### 2.3 根据字典类型查询字典数据

根据字典类型查询该类型下的所有字典数据,这是前端最常用的接口。

**接口**: `GET /system/dictData/listDictDatasByDictType/{dictType}`

**权限**: 无需权限

**路径参数**:
- `dictType`: 字典类型,如`sys_user_gender`

**业务逻辑**:

1. 查询字典类型信息,检查状态是否正常
2. 如果字典类型停用,返回空列表
3. 从缓存中获取字典数据列表
4. 只返回状态为正常的字典数据
5. 按`dict_sort`字段升序排序

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "dictDataId": 1,
      "dictSort": 1,
      "dictLabel": "男",
      "dictValue": "1",
      "dictType": "sys_user_gender",
      "listClass": "primary",
      "isDefault": "Y",
      "status": "0"
    },
    {
      "dictDataId": 2,
      "dictSort": 2,
      "dictLabel": "女",
      "dictValue": "2",
      "dictType": "sys_user_gender",
      "listClass": "danger",
      "isDefault": "N",
      "status": "0"
    }
  ]
}
```

**前端使用示例**:

```javascript
// Vue 3 + Element Plus
import { ref, onMounted } from 'vue'
import { getDictDataByType } from '@/api/system/dict'

const sexOptions = ref([])

onMounted(async () => {
  const res = await getDictDataByType('sys_user_gender')
  sexOptions.value = res.data
})
```

```vue
<template>
  <el-select v-model="form.sex" placeholder="请选择性别">
    <el-option
      v-for="item in sexOptions"
      :key="item.dictValue"
      :label="item.dictLabel"
      :value="item.dictValue"
    />
  </el-select>
</template>
```

#### 2.4 新增字典数据

创建新的字典数据项,系统会自动校验字典值的唯一性。

**接口**: `POST /system/dictData/addDictData`

**权限**: `system:dict:add`

**请求体**:

```json
{
  "dictSort": 3,
  "dictLabel": "未知",
  "dictValue": "0",
  "dictType": "sys_user_gender",
  "cssClass": "",
  "listClass": "info",
  "isDefault": "N",
  "status": "0",
  "remark": "性别未知"
}
```

**业务逻辑**:

1. 校验字典值唯一性(同一字典类型下`dict_value`不能重复)
2. 自动填充创建人、创建时间、租户ID等信息
3. 保存字典数据
4. 更新字典类型对应的缓存
5. 返回新创建的字典数据列表

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

#### 2.5 修改字典数据

更新字典数据信息,支持修改所有字段。

**接口**: `PUT /system/dictData/updateDictData`

**权限**: `system:dict:update`

**请求体**:

```json
{
  "dictDataId": 3,
  "dictSort": 3,
  "dictLabel": "保密",
  "dictValue": "0",
  "dictType": "sys_user_gender",
  "listClass": "warning",
  "isDefault": "N",
  "status": "0",
  "remark": "性别保密"
}
```

**业务逻辑**:

1. 校验字典值唯一性(排除自身)
2. 更新字典数据
3. 更新字典类型对应的缓存
4. 记录操作日志

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

#### 2.6 删除字典数据

批量删除字典数据,删除后会自动更新缓存。

**接口**: `DELETE /system/dictData/deleteDictDatas/{dictDataIds}`

**权限**: `system:dict:delete`

**路径参数**:
- `dictDataIds`: 字典数据ID数组,多个ID用逗号分隔,如`1,2,3`

**业务逻辑**:

1. 批量删除字典数据
2. 清除对应字典类型的缓存
3. 记录操作日志

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

#### 2.7 导出字典数据

导出字典数据为Excel文件,支持按条件筛选导出。

**接口**: `POST /system/dictData/exportDictDatas`

**权限**: `system:dict:export`

**请求参数**:

```java
public class SysDictDataBo {
    private String dictLabel;   // 字典标签(模糊查询)
    private String dictType;    // 字典类型(精确查询)
    private String status;      // 状态(精确查询)
}
```

**业务逻辑**:

1. 根据查询条件获取字典数据列表
2. 使用ExcelUtil工具类生成Excel文件
3. 设置响应头,触发浏览器下载
4. 记录导出操作日志

**响应**: Excel文件下载

#### 2.8 下载字典数据导入模板

下载字典数据的Excel导入模板,用于批量导入。

**接口**: `POST /system/dictData/templateDictDatas`

**权限**: 无需权限

**业务逻辑**:

1. 生成空的Excel模板文件
2. 包含所有必填字段的表头
3. 可选包含示例数据

**响应**: Excel模板文件下载

#### 2.9 导入字典数据

批量导入字典数据,支持Excel文件上传。

**接口**: `POST /system/dictData/importDictDatas`

**权限**: `system:dict:add`

**请求参数**:
- `file`: MultipartFile类型,Excel文件
- `dictType`: 字典类型(可选),如果提供则为所有导入数据设置该字典类型

**业务逻辑**:

1. 解析Excel文件,读取字典数据
2. 如果提供了`dictType`参数,为所有数据设置该字典类型
3. 校验数据格式和必填字段
4. 校验字典值唯一性
5. 批量保存字典数据
6. 更新对应字典类型的缓存
7. 返回导入结果统计

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": "共导入20条数据,成功18条,失败2条"
}
```

## 缓存机制

字典模块使用Redis缓存提升查询性能,采用多级缓存策略。

### 缓存键定义

系统使用`CacheNames`常量类定义缓存键:

```java
public class CacheNames {
    /**
     * 字典类型缓存
     */
    public static final String SYS_DICT_TYPE = "sys_dict_type";

    /**
     * 字典数据缓存
     */
    public static final String SYS_DICT = "sys_dict";
}
```

### 缓存策略

#### 1. 字典数据缓存

字典数据按字典类型进行缓存,缓存键为`sys_dict:{dictType}`。

**缓存查询**:

```java
@Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
public List<SysDictDataVo> listDictDataByType(String dictType) {
    // 查询数据库
    PlusLambdaQuery<SysDictData> wrapper = dictDataDao.buildQueryWrapper(
        new SysDictDataBo().setDictType(dictType).setStatus("0")
    );
    List<SysDictData> dataList = dictDataDao.list(wrapper);
    return MapstructUtils.convert(dataList, SysDictDataVo.class);
}
```

**缓存更新**:

```java
@CachePut(cacheNames = CacheNames.SYS_DICT, key = "#bo.dictType")
public List<SysDictDataVo> insertDictData(SysDictDataBo bo) {
    // 新增字典数据
    SysDictData entity = MapstructUtils.convert(bo, SysDictData.class);
    dictDataDao.save(entity);

    // 返回更新后的字典数据列表
    return listDictDataByType(bo.getDictType());
}

@CachePut(cacheNames = CacheNames.SYS_DICT, key = "#bo.dictType")
public List<SysDictDataVo> updateDictData(SysDictDataBo bo) {
    // 修改字典数据
    SysDictData entity = MapstructUtils.convert(bo, SysDictData.class);
    dictDataDao.updateById(entity);

    // 返回更新后的字典数据列表
    return listDictDataByType(bo.getDictType());
}
```

**缓存删除**:

```java
public void deleteDictDataByIds(List<Long> dictDataIds) {
    // 获取要删除的字典数据
    List<SysDictData> dictDataList = dictDataDao.listByIds(dictDataIds);

    // 批量删除
    dictDataDao.deleteByIds(dictDataIds);

    // 清除缓存
    Set<String> dictTypes = StreamUtils.toSet(dictDataList, SysDictData::getDictType);
    for (String dictType : dictTypes) {
        CacheUtils.evict(CacheNames.SYS_DICT, dictType);
    }
}
```

#### 2. 字典类型缓存

字典类型缓存用于存储字典类型信息,缓存键为`sys_dict_type:{dictType}`。

**缓存查询**:

```java
@Cacheable(cacheNames = CacheNames.SYS_DICT_TYPE, key = "#dictType")
public SysDictTypeVo getDictTypeByType(String dictType) {
    // 查询数据库
    PlusLambdaQuery<SysDictType> wrapper = dictTypeDao.buildQueryWrapper(
        new SysDictTypeBo().setDictType(dictType)
    );
    SysDictType entity = dictTypeDao.getOne(wrapper);
    return MapstructUtils.convert(entity, SysDictTypeVo.class);
}
```

#### 3. 缓存刷新

系统提供手动刷新缓存的功能,清除所有字典相关缓存。

```java
public void resetDictCache() {
    // 清除所有字典类型缓存
    CacheUtils.clear(CacheNames.SYS_DICT_TYPE);

    // 清除所有字典数据缓存
    CacheUtils.clear(CacheNames.SYS_DICT);
}
```

### 缓存优势

1. **性能提升**: 字典数据访问频繁,缓存可大幅提升查询性能
2. **减少数据库压力**: 避免重复查询数据库
3. **自动更新**: 增删改操作自动更新缓存,保证数据一致性
4. **按类型缓存**: 每个字典类型独立缓存,互不影响
5. **支持集群**: 基于Redis的分布式缓存,支持多节点部署

## 标签值转换服务

字典模块实现了`DictService`接口,提供字典标签和值的双向转换功能。

### DictService接口

```java
public interface DictService {

    /**
     * 根据字典类型和字典值获取字典标签
     *
     * @param dictType  字典类型
     * @param dictValue 字典值
     * @param separator 分隔符
     * @return 字典标签
     */
    String getDictLabel(String dictType, String dictValue, String separator);

    /**
     * 根据字典类型和字典标签获取字典值
     *
     * @param dictType  字典类型
     * @param dictLabel 字典标签
     * @param separator 分隔符
     * @return 字典值
     */
    String getDictValue(String dictType, String dictLabel, String separator);

    /**
     * 获取字典类型下所有字典数据的映射
     *
     * @param dictType 字典类型
     * @return Map<字典值, 字典标签>
     */
    Map<String, String> getAllDictByDictType(String dictType);
}
```

### 使用示例

#### 1. 单值转换

```java
// 值转标签
String label = dictTypeService.getDictLabel("sys_user_gender", "1", ",");
// 结果: "男"

// 标签转值
String value = dictTypeService.getDictValue("sys_user_gender", "男", ",");
// 结果: "1"
```

#### 2. 多值转换

```java
// 多个值转标签(用逗号分隔)
String labels = dictTypeService.getDictLabel("sys_user_status", "0,1", ",");
// 结果: "正常,停用"

// 多个标签转值
String values = dictTypeService.getDictValue("sys_user_status", "正常,停用", ",");
// 结果: "0,1"
```

#### 3. 获取字典映射

```java
// 获取字典类型下所有数据的映射
Map<String, String> dictMap = dictTypeService.getAllDictByDictType("sys_user_gender");
// 结果: {"1": "男", "2": "女", "0": "未知"}

// 使用映射进行批量转换
List<User> users = userService.list();
for (User user : users) {
    String sexLabel = dictMap.get(user.getSex());
    user.setSexLabel(sexLabel);
}
```

#### 4. 在业务代码中使用

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final ISysDictTypeService dictTypeService;

    public List<UserVo> getUserList() {
        List<User> users = userDao.list();
        List<UserVo> userVos = MapstructUtils.convert(users, UserVo.class);

        // 批量转换字典标签
        Map<String, String> sexDict = dictTypeService.getAllDictByDictType("sys_user_gender");
        Map<String, String> statusDict = dictTypeService.getAllDictByDictType("sys_user_status");

        for (UserVo vo : userVos) {
            vo.setSexLabel(sexDict.get(vo.getSex()));
            vo.setStatusLabel(statusDict.get(vo.getStatus()));
        }

        return userVos;
    }
}
```

## 最佳实践

### 1. 字典类型命名规范

**建议使用模块前缀命名**:

```java
// ✅ 推荐
sys_user_gender        // 系统模块-用户性别
sys_user_status     // 系统模块-用户状态
biz_order_status    // 业务模块-订单状态
biz_pay_method      // 业务模块-支付方式

// ❌ 不推荐
user_sex           // 缺少模块前缀
status             // 过于通用,容易冲突
```

**命名规则**:
- 使用小写字母和下划线
- 格式: `{模块}_{业务}_{属性}`
- 避免使用过于通用的名称
- 保持命名的一致性

### 2. 字典数据排序

**合理设置排序值**:

```java
// ✅ 推荐 - 使用10的倍数,便于后续插入
dictSort = 10   // 第一项
dictSort = 20   // 第二项
dictSort = 30   // 第三项

// ❌ 不推荐 - 使用连续数字,不便于插入
dictSort = 1
dictSort = 2
dictSort = 3
```

### 3. 系统级字典保护

**正确使用isSystem字段**:

```java
// 系统核心字典,租户不可修改
SysDictTypeBo dictType = new SysDictTypeBo();
dictType.setDictType("sys_user_gender");
dictType.setIsSystem("1");  // 标记为系统级

// 租户自定义字典,可以修改
SysDictTypeBo customDict = new SysDictTypeBo();
customDict.setDictType("custom_category");
customDict.setIsSystem("0");  // 标记为租户级
```

### 4. 缓存使用优化

**批量查询时使用字典映射**:

```java
// ✅ 推荐 - 一次性获取字典映射,批量转换
Map<String, String> sexDict = dictTypeService.getAllDictByDictType("sys_user_gender");
for (UserVo vo : userList) {
    vo.setSexLabel(sexDict.get(vo.getSex()));
}

// ❌ 不推荐 - 循环中多次调用,性能差
for (UserVo vo : userList) {
    String label = dictTypeService.getDictLabel("sys_user_gender", vo.getSex(), ",");
    vo.setSexLabel(label);
}
```

### 5. 前端字典组件封装

**封装字典选择组件**:

```vue
<template>
  <el-select v-model="modelValue" @change="handleChange">
    <el-option
      v-for="item in dictOptions"
      :key="item.dictValue"
      :label="item.dictLabel"
      :value="item.dictValue"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDictDataByType } from '@/api/system/dict'

const props = defineProps({
  modelValue: [String, Number],
  dictType: { type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const dictOptions = ref([])

onMounted(async () => {
  const res = await getDictDataByType(props.dictType)
  dictOptions.value = res.data
})

const handleChange = (value) => {
  emit('update:modelValue', value)
}
</script>
```

## 常见问题

### 1. 字典缓存不更新

**问题描述**:
修改了字典数据,但前端获取的数据仍然是旧数据。

**问题原因**:
- 缓存未正确更新
- 集群环境下缓存同步问题
- 直接修改数据库导致缓存未刷新

**解决方案**:

```java
// 方案1: 手动刷新缓存
dictTypeService.resetDictCache();

// 方案2: 清除指定字典类型的缓存
CacheUtils.evict(CacheNames.SYS_DICT, "sys_user_gender");

// 方案3: 使用正确的API接口修改数据(会自动更新缓存)
dictDataService.updateDictData(dictDataBo);
```

### 2. 字典类型唯一性校验失败

**问题描述**:
新增字典类型时提示"字典类型已存在",但在列表中找不到该字典类型。

**问题原因**:
- 多租户环境下,其他租户已使用该字典类型
- 数据库中存在已删除但未物理删除的记录
- 字典类型大小写不一致

**解决方案**:

```java
// 检查数据库中是否存在该字典类型
SELECT * FROM sys_dict_type WHERE dict_type = 'sys_user_gender';

// 如果是软删除导致,可以修改字典类型名称
UPDATE sys_dict_type SET dict_type = 'sys_user_gender_old' WHERE dict_type = 'sys_user_gender' AND del_flag = '1';

// 或者使用不同的字典类型名称
dictType.setDictType("sys_user_gender_v2");
```

### 3. 字典数据排序不生效

**问题描述**:
设置了`dict_sort`字段,但前端显示的顺序不正确。

**问题原因**:
- 前端未按`dict_sort`排序
- 缓存中的数据未排序
- 数据库查询未添加排序条件

**解决方案**:

```java
// 后端查询时添加排序
PlusLambdaQuery<SysDictData> wrapper = dictDataDao.buildQueryWrapper(bo);
wrapper.orderByAsc(SysDictData::getDictSort);
List<SysDictData> dataList = dictDataDao.list(wrapper);

// 前端排序
dictOptions.value = res.data.sort((a, b) => a.dictSort - b.dictSort);
```

### 4. 删除字典类型失败

**问题描述**:
删除字典类型时提示失败,无法删除。

**问题原因**:
- 字典类型下存在关联的字典数据
- 字典类型被标记为系统级字典
- 权限不足

**解决方案**:

```java
// 先删除字典类型下的所有字典数据
List<SysDictData> dataList = dictDataDao.list(
    new PlusLambdaQuery<SysDictData>()
        .eq(SysDictData::getDictType, "sys_user_gender")
);
List<Long> dataIds = StreamUtils.toList(dataList, SysDictData::getDictDataId);
dictDataService.deleteDictDataByIds(dataIds);

// 再删除字典类型
dictTypeService.deleteDictTypeByIds(List.of(dictId));
```

### 5. 多租户环境下字典数据混乱

**问题描述**:
多租户环境下,租户A能看到租户B的字典数据。

**问题原因**:
- 未正确配置多租户插件
- 字典类型被标记为系统级,导致所有租户共享
- 缓存键未包含租户ID

**解决方案**:

```java
// 确保实体类继承TenantEntity
public class SysDictType extends TenantEntity {
    // ...
}

// 确保字典类型的isSystem字段设置正确
// 系统级字典(所有租户共享): isSystem = "1"
// 租户级字典(租户隔离): isSystem = "0"

// 检查多租户配置
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加多租户插件
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor());
        return interceptor;
    }
}
```

### 6. Excel导入失败

**问题描述**:
导入Excel文件时提示失败或部分数据导入失败。

**问题原因**:
- Excel文件格式不正确
- 数据格式不符合要求
- 字典值重复
- 必填字段为空

**解决方案**:

```java
// 下载标准模板
dictDataController.templateDictDatas(response);

// 检查Excel数据格式
// 1. 字典类型必须存在
// 2. 字典标签和字典值不能为空
// 3. 同一字典类型下字典值不能重复
// 4. 字典排序必须为数字

// 导入前先校验数据
ExcelResult<SysDictDataVo> excelResult = ExcelUtil.importExcel(
    file.getInputStream(),
    SysDictDataVo.class,
    true  // 开启校验
);

// 查看导入结果
String analysis = excelResult.getAnalysis();
System.out.println(analysis);
```

### 7. 字典标签显示为字典值

**问题描述**:
前端显示的是字典值(如"1")而不是字典标签(如"男")。

**问题原因**:
- 未进行字典值转换
- 字典类型不存在或停用
- 字典数据不存在

**解决方案**:

```java
// 后端转换
Map<String, String> dictMap = dictTypeService.getAllDictByDictType("sys_user_gender");
for (UserVo vo : userList) {
    vo.setSexLabel(dictMap.getOrDefault(vo.getSex(), vo.getSex()));
}

// 前端转换
const getDictLabel = (dictType, dictValue) => {
  const dict = dictStore.getDict(dictType);
  const item = dict.find(d => d.dictValue === dictValue);
  return item ? item.dictLabel : dictValue;
}
```

## 总结

字典管理模块是RuoYi-Plus系统的核心基础模块,提供了完整的数据字典管理功能。通过本文档,您应该已经了解了:

1. **模块架构**: 字典类型和字典数据的两级结构设计
2. **核心功能**: 完整的CRUD操作、缓存机制、标签值转换
3. **系统级字典**: 通过`isSystem`字段实现系统级字典和租户自定义字典的分离管理
4. **多租户支持**: 继承`TenantEntity`实现租户级数据隔离
5. **高性能缓存**: 基于Redis的多级缓存策略,支持自动更新
6. **Excel导入导出**: 支持批量导入导出,提供标准模板
7. **最佳实践**: 命名规范、缓存优化、组件封装等实用技巧
8. **常见问题**: 缓存更新、唯一性校验、多租户等常见问题的解决方案

字典管理模块为整个系统提供了统一的枚举值管理和标签值转换服务,是构建灵活、可维护系统的重要基础。合理使用字典管理功能,可以大幅提升系统的可维护性和用户体验。
