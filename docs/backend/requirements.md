# 环境要求

## 开发环境

* jdk使用OpenJDK21+ [JDK下载地址](https://bell-sw.com/pages/downloads/)
* mysql 8.0+ （其他数据库 oracle >= 12c，postgres 13 14 15，sqlserver 2017 2019）
* redis 6.X 7.X(禁止使用7.4版本) ([win redis 下载地址](https://github.com/zkteco-home/redis-windows))
* 支持本地上传 可使用阿里/腾讯/七牛云等一切支持S3协议的云存储 minio（可不装-最后一个可用版本2025-04-22T22-12-26Z
  再往上功能被阉割）
* nodejs >= 18.18，npm >= 8.X，pnpm >=7.30
* idea 推荐使用2025.1+ （非必要不使用2023）
* 后端 前端 移动端均使用idea进行开发 如开发app则需要下载HBuilderX

## Idea插件推荐

* Show comment 插件 支持代码注释的显示
* MybatisX 插件 支持mybatis mapper xml 文件的代码提示和跳转
* CodeGlancePro 插件 支持代码预览和快速拖动
* Rainbow Brackets Lite 插件 支持代码括号高亮
* UnoCss 插件 支持UnoCss语法提示

## idea配置

#### 项目编码配置

* File->Settings->Editor->File Encodings ，
    - Global Encoding: UTF-8
    - Project Encoding: UTF-8
    - Default encoding for properties files: UTF-8

#### 配置运行看板

* View->Tool Windows->Services
* 在 Services 窗口中右键点击 + 号，选择 Run Configuration Type -> Spring Boot
* 在 Services 窗口中右键点击 + 号，选择 Run Configuration Type -> Docker 可以查看Docker构建配置
