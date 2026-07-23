# 代码生成器模块概览

## 简介

若依代码生成器（Generator）是一个强大的开发工具，旨在帮助开发者快速生成标准化的业务代码，大幅提升开发效率。该模块基于数据库表结构自动生成完整的前后端代码，包括实体类、Service层、Controller层、Mapper层、前端页面等。

## 核心功能

### 智能代码生成
- **全栈代码生成**：一键生成前后端完整代码
- **多模板支持**：支持单表CRUD、树形结构、主子表三种模板类型
- **自定义配置**：灵活的字段配置和生成选项

### 数据库支持
- **多数据源**：支持MySQL、PostgreSQL、Oracle、SQL Server等主流数据库
- **智能识别**：自动识别数据库表结构和字段类型
- **结构同步**：支持数据库结构变更后的同步更新

### 代码规范
- **统一标准**：生成的代码遵循项目既定的编码规范
- **注释完善**：自动生成详细的代码注释
- **类型映射**：智能的数据库类型到Java类型的映射

## 架构设计

### 模块结构

```text
ruoyi-generator/
├── src/main/java/
│   └── plus/ruoyi/generator/
│       ├── config/              # 配置类
│       │   └── GenConfig.java   # 生成器配置
│       ├── constant/            # 常量定义
│       │   └── GenConstants.java # 生成器常量
│       ├── controller/          # 控制器层
│       │   └── GenController.java # 主控制器
│       ├── domain/              # 实体类
│       │   ├── GenTable.java    # 表配置实体
│       │   └── GenTableColumn.java # 字段配置实体
│       ├── mapper/              # 数据访问层
│       │   ├── GenTableMapper.java
│       │   └── GenTableColumnMapper.java
│       ├── service/             # 业务层
│       │   ├── IGenTableService.java
│       │   └── impl/
│       └── util/                # 工具类
│           ├── GenUtils.java    # 生成工具类
│           ├── VelocityUtils.java # 模板工具类
│           └── VelocityInitializer.java # 模板引擎初始化
└── src/main/resources/
    ├── mapper/                  # MyBatis映射文件
    ├── vm/                      # 代码模板
    │   ├── java/               # Java代码模板
    │   ├── vue/                # Vue页面模板
    │   ├── ts/                 # TypeScript模板
    │   └── sql/                # SQL脚本模板
    └── generator.yml           # 生成器配置文件
```

### 核心组件

#### 1. 配置管理
- **GenConfig**：生成器全局配置管理
- **GenConstants**：常量定义，包含模板类型、字段类型映射等

#### 2. 数据模型
- **GenTable**：代码生成表配置，包含表信息、生成选项等
- **GenTableColumn**：字段配置，包含字段类型、显示方式、权限等

#### 3. 业务服务
- **GenTableService**：核心业务逻辑，处理表导入、配置管理、代码生成等

#### 4. 模板引擎
- **Velocity模板引擎**：基于Apache Velocity实现代码模板渲染
- **模板工具类**：提供模板变量准备、文件生成等功能

## 技术栈

### 后端技术
- **Spring Boot**：基础框架
- **MyBatis-Plus**：数据访问层
- **Apache Velocity**：模板引擎
- **Dynamic DataSource**：多数据源支持
- **AnyLine**：数据库元数据获取

### 前端技术
- **Vue 3**：前端框架
- **Element Plus**：UI组件库
- **TypeScript**：类型安全支持
- **Vite**：构建工具

## 生成代码结构

### Java后端代码
```text
generated-code/
├── domain/
│   ├── entity/          # 实体类
│   ├── vo/             # 视图对象
│   └── bo/             # 业务对象
├── mapper/             # 数据访问接口
├── service/            # 业务接口和实现
├── controller/         # 控制器
└── sql/               # SQL脚本（菜单配置）
```

### 前端代码
```text
frontend-code/
├── api/               # API接口定义
│   ├── xxxApi.ts      # 接口调用方法
│   └── xxxTypes.ts    # TypeScript类型定义
└── views/             # 页面组件
    └── xxx/
        ├── xxx.vue    # 主页面
        └── xxxChild.vue # 子表页面（主子表模式）
```

## 模板类型

### 1. 单表CRUD模板（crud）
适用于简单的增删改查业务场景，生成标准的CRUD操作页面。

**特点：**
- 标准的列表、新增、编辑、删除功能
- 支持分页、搜索、排序
- 支持数据导入导出

### 2. 树形结构模板（tree）
适用于具有层次关系的数据，如组织架构、菜单管理等。

**特点：**
- 树形展示和操作
- 支持节点的增删改查
- 支持树形结构的展开折叠

### 3. 主子表模板（sub）
适用于一对多的业务关系，如订单和订单明细。

**特点：**
- 主表和子表的关联管理
- 支持在同一页面管理主子表数据
- 自动处理主子表的数据关联

## 工作流程

### 1. 表导入阶段
```mermaid
graph LR
    A[选择数据源] --> B[扫描数据库表]
    B --> C[选择要导入的表]
    C --> D[自动分析表结构]
    D --> E[生成基础配置]
```

### 2. 配置阶段
```mermaid
graph LR
    A[基础配置] --> B[字段配置]
    B --> C[模板选择]
    C --> D[生成选项]
    D --> E[预览确认]
```

### 3. 代码生成阶段
```mermaid
graph LR
    A[模板渲染] --> B[代码生成]
    B --> C[文件输出]
    C --> D[ZIP打包]
    D --> E[下载或保存]
```

## 配置选项

### 全局配置
```yaml
# generator.yml
gen:
  # 作者信息
  author: 抓蛙师
  # 默认包路径
  packageName: plus.ruoyi.business.base
  # 自动去除表前缀
  autoRemovePre: true
  # 表前缀配置
  tablePrefix: sys_,a_,b_,c_,d_,e_,f_,g_,h_,i_,j_,k_,l_,m_,n_,o_,p_,q_,r_,s_,t_,u_,v_,w_,x_,y_,z_,
```

### 表级配置
- **基础信息**：表名、注释、类名等
- **生成选项**：包路径、模块名、业务名等
- **模板类型**：单表、树表、主子表选择
- **关联配置**：子表关联、树形字段配置

### 字段级配置
- **基础属性**：字段名、类型、注释等
- **权限控制**：增删改查权限设置
- **显示配置**：HTML控件类型、字典配置
- **验证规则**：必填、长度等验证配置


通过代码生成器模块，开发者可以快速构建标准化的业务功能，显著提升开发效率，减少重复性工作，让开发团队更专注于业务逻辑的实现。
