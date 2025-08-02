# 快速开始

1. 开发项目前学会idea操作git管理等技巧 可参考视频: https://www.bilibili.com/video/BV1RM411o7kN

2. 使用idea打开项目根目录 等待安装maven依赖 如未安装右上角刷新依赖

3. 点击菜单file -> Project Structure -> Project Setting -> Project -> SDK设置为 >= jdk21

4. 如果是开发新项目, 则应为新项目制定一个唯一标识符, 最后是不超过8个长度的英文字母下划线组合如mall,
   全局搜索ryplus_uni并全部替换为新的唯一标识符,
   标识符与数据库名称,redis前缀,前端缓存前缀,反向代理地址紧密相关,因为标识符需要唯一且符合项目含义(
   如果只是学习项目则可以跳过此步骤)
   同时全局搜索端口5500 注意勾选W整词搜索 替换为一个唯一的端口口(不同项目使用不同的端口号)

5. 执行根目录/script下sql语句 sys为系统表 job为定时任务表 app为移动端表 根据需求安装 定时任务数据不建议与主数据库同一个库名

6. 右上角启动RuoyiPlus 如果未存在则在ruoyi-admin/src/main/java/plus/ruoyi下打开RuoyiPlus并启动
   在ruoyi-extend下可启动定时任务和admin监控
