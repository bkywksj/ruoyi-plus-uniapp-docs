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

# 启动服务
pnpm run dev

# 构建生产环境
pnpm run build:prod

# 前端访问地址 http://localhost:80
```
