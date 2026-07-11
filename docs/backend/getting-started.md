# 快速启动

本章节将带你快速启动 Ruoyi-Plus-Uniapp 后端项目，包含完整的环境配置和启动流程。

::: tip 💡 新手建议
开发项目前建议学习 IDEA 操作和 Git 管理等技巧，可参考教学视频: [IDEA 使用教程](https://www.bilibili.com/video/BV1RM411o7kN)
:::

## 🎯 环境要求

在开始之前，请确保你的开发环境已满足以下要求：

### 核心环境
- **Java**: JDK 17+
  - 📥 [Eclipse Temurin JDK 17 下载地址](https://adoptium.net/temurin/releases/?version=17) (开源免费、免登录，推荐)
  - 📥 [Oracle JDK 17 下载地址](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) (官方，需登录 Oracle 账号)
  - 支持 JDK 17 及以上版本

> **分支提示**：以上为 3.5.x 主线（master）要求。Spring Boot 4 分支（6.x / 6.x-single）环境要求相同，仅框架版本升级至 4.1.0（JDK 21）。各分支差异详见 [分支说明](/changelog#分支说明)。

- **数据库**:
  - **MySQL 5.7+** (推荐)
  - Oracle >= 12c
  - PostgreSQL >=13
  - SQL Server 2017/2019

- **缓存**: Redis 6.x / 7.x
  - ⚠️ **注意**: 禁止使用 Redis 7.4 版本
  - 📥 [Windows Redis 下载地址](https://github.com/redis-windows/redis-windows)

- **构建工具**: Maven 3.6+

### 文件存储（可选）
支持多种存储方式：
- **本地上传**: 支持本地文件系统存储
- **云存储**: 阿里云OSS / 腾讯云COS / 七牛云等一切支持 S3 协议的云存储
- **MinIO**: 私有对象存储
  - 可选安装，最后推荐版本：2025-04-22T22-12-26Z
  - 更高版本功能被阉割，不推荐使用

### 开发工具
- **IntelliJ IDEA**: 2025.1+ (强烈推荐)
  - ⚠️ **避免使用** IDEA 2023 版本
  
- **HBuilderX**: 仅在开发 App 时需要

## 🔌 IDEA 插件推荐

安装以下插件可显著提升开发效率：

### 代码增强插件
- **Show Comment**: 支持代码注释的可视化显示
- **MybatisX**: 支持 MyBatis mapper 与 XML 文件的代码提示和跳转
- **CodeGlancePro**: 提供代码预览和快速拖动功能
- **Rainbow Brackets Lite**: 代码括号高亮显示
- **Unocss**: 支持 UnoCss 语法提示和补全

## ⚙️ IDEA 配置

### 项目编码配置
确保项目使用正确的字符编码：

1. 打开设置：`File` → `Settings` → `Editor` → `File Encodings`

2. 配置以下选项：
   ```
   Global Encoding: UTF-8
   Project Encoding: UTF-8
   Default encoding for properties files: UTF-8
   ```

### 配置运行看板
为了更好地管理和监控项目运行状态：

#### 启用 Services 窗口
1. 点击菜单：`View` → `Tool Windows` → `Services`

#### 添加 Spring Boot 配置
1. 在 Services 窗口中右键点击 `+` 号
2. 选择 `Run Configuration Type` → `Spring Boot`
3. 可以查看和管理所有 Spring Boot 应用的运行状态

#### 添加 Docker 配置（可选）
1. 在 Services 窗口中右键点击 `+` 号
2. 选择 `Run Configuration Type` → `Docker`
3. 可以查看 Docker 构建配置和容器状态

## 📁 项目结构

```text
ruoyi-plus-uniapp/
├── ruoyi-admin/              # 后端主应用模块
├── ruoyi-common/             # 公共模块
├── ruoyi-extend/             # 扩展模块
├── ruoyi-modules/            # 业务模块
├── script/                   # 脚本文件
│   ├── sql/                  # 数据库脚本
│   └── docker/               # Docker 配置
└── pom.xml                   # Maven 父级配置
```

## 🚀 快速启动步骤

### 步骤1：项目导入与环境配置

#### 1.1 导入项目
1. 使用 IntelliJ IDEA 打开项目根目录
2. 等待自动安装 Maven 依赖，如未自动安装请点击右上角刷新依赖图标

#### 1.2 配置 JDK
1. 点击菜单 `File` → `Project Structure`
2. 在左侧选择 `Project Settings` → `Project`
3. 将 `SDK` 设置为 **JDK 17 或更高版本**

### 步骤2：项目标识符配置（新项目必需）

> ⚠️ **注意**：如果只是学习现有项目，可以跳过此步骤

如果是开发新项目，需要为项目制定唯一标识符：

#### 标识符要求
- **长度**：不宜过长, 建议20个字符以内
- **格式**：英文字母和下划线组合
- **示例**：`mall`、`crm_sys`、`blog_app`

#### 全局替换操作
1. **替换项目标识符**
   ```
   全局搜索：ryplus_uni
   替换为：your_project_name
   ```

2. **替换端口号**
   ```
   全局搜索：5500
   替换为：your_unique_port
   ```

::: warning 📌 重要说明
项目标识符将影响以下配置，请确保唯一性：
- 应用名称
- 数据库名称
- Redis前缀
- 浏览器缓存前缀
- 客户端名称
- 文件上传前缀目录
- snailjob分组名称
:::

### 步骤3：数据库配置

#### 3.1 数据库脚本说明
根目录 `script/` 下包含以下 SQL 脚本：

| 脚本文件 | 说明 | 是否必需 |
|---------|------|----------|
| `ry_plus_sys.sql` | 系统核心表 | ✅ 必需 |
| `ry_plus_job.sql` | 定时任务表 | 🔧 按需安装 |
| `ry_plus_app.sql` | 移动端业务表 | 📱 按需安装 |

::: tip 💡 数据库建议
- 定时任务数据建议与主数据库使用**不同的库名**
- 使用 `utf8mb4` 字符集，排序规则为 `utf8mb4_general_ci`
- 请手动创建数据库并执行对应的 SQL 脚本
:::

### 步骤4：配置应用参数

编辑 `ruoyi-admin/src/main/resources/application-dev.yml` 中的配置：

#### 4.1 配置 API 基础路径
```yaml
app:
  base-api: http://localhost:5500  # 如无内网映射使用此地址
  # base-api: https://your-domain.com  # 如有内网映射则修改为映射基础路径
```

::: warning 📌 重要说明
- **无内网映射**：使用 `http://localhost:5500`
- **有内网映射**：修改为你的内网映射基础路径，如 `https://your-domain.com`
:::

### 步骤5：启动应用

#### 5.1 启动主应用
1. **方式一**：在右上角找到 `RuoyiPlus` 启动配置并点击启动
2. **方式二**：如果不存在启动配置，请找到以下文件并启动：
   ```
   ruoyi-admin/src/main/java/plus/ruoyi/RuoyiPlus.java
   ```
   右键选择 `Run 'RuoyiPlus'`

#### 5.2 启动扩展服务（可选）
在 `ruoyi-extend` 目录下可以启动：
- 🕐 **定时任务服务**：分布式任务调度
- 📊 **Admin 监控服务**：应用监控管理

启动成功后访问：**http://localhost:5500**

::: tip 🎉 恭喜完成！
如果以上步骤都成功完成，说明你已经成功启动了 Ruoyi-Plus-Uniapp 后端项目！现在可以开始后端开发了。
:::
