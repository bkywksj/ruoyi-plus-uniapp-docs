# 快速启动

```bash
# 环境:node>=18 pnpm>=8 可下载安装nvm进行node版本切换和管理
# 如果没有 pnpm，请先安装: npm i -g pnpm
# (Unable to find the global bin directory)则执行 pnpm config set global-bin-dir "D:\software\dev\nvm\nodejs"(这里根据自己的目录更改)
# 执行更新 pnpm self-update

# 克隆项目
git clone xxx.git

# 安装依赖
pnpm i

# 启动h5端
pnpm run dev:h5
# 启动微信小程序端 会打包到/dist/dev/mp-weixin 下,打开微信开发者工具导入此目录
# 启动前在/env中配置一下环境如各端的appid
pnpm run dev:mp-weixin
# 启动app 会打包到/dist/dev/app下,需配合hbuilderX导入项目,然后连接手机基座运行
pnpm run dev:app
# 更多启动指令见根目录package.json

# 打包h5
pnpm run build:h5
# 打包微信小程序 会打包到/dist/build/mp-weixin 下,打开微信开发者工具导入此目录进行上传发布
pnpm run build:mp-weixin
# 启动app 会打包到/dist/build/app下,需配合hbuilderX导入项目,然后连接手机基座运行发布
# 更多打包指令见根目录package.json

# 前端访问地址 http://127.0.0.1:100
```
