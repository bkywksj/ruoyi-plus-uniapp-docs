# H5 部署

## 介绍

H5 部署是将 UniApp 项目构建为标准的 Web 应用,通过浏览器访问。RuoYi-Plus-UniApp 的 H5 部署支持多种部署方式,包括传统服务器部署、CDN 部署、Docker 容器化部署等,适应不同的业务场景和技术栈需求。

**核心特性:**

- **跨平台访问** - 支持所有现代浏览器,包括移动端和桌面端
- **快速构建** - Vite 构建,速度快,优化好
- **灵活部署** - 支持多种部署方式和环境
- **SPA 架构** - 单页应用,路由由前端控制
- **资源优化** - 代码分割、懒加载、Gzip 压缩
- **SEO 支持** - 可配合预渲染或 SSR 优化 SEO
- **HTTPS 支持** - 安全的数据传输
- **CDN 加速** - 静态资源 CDN 分发

## 构建准备

### 环境检查

```bash
# 检查 Node.js 版本(需要 >=18)
node -v
# v18.x.x 或更高

# 检查 pnpm 版本(需要 >=7.30)
pnpm -v
# 7.30.0 或更高

# 检查项目依赖
cd plus-app
pnpm install
```

### 环境配置

#### 生产环境变量

编辑 `env/.env.production`:

```bash
# 环境标识
VITE_APP_ENV = 'production'

# API 基础路径(生产服务器)
VITE_APP_BASE_API = 'https://api.example.com'

# 公共资源基础路径
VITE_APP_PUBLIC_BASE = '/'

# 移除 console
VITE_DELETE_CONSOLE = true

# 关闭 SourceMap
VITE_SHOW_SOURCEMAP = false

# CDN 地址(可选)
VITE_APP_CDN = 'https://cdn.example.com'
```

**重要配置说明:**

1. **VITE_APP_BASE_API**: API 服务器地址
   - 必须是完整的 URL
   - 生产环境建议使用 HTTPS
   - 需要配置 CORS

2. **VITE_APP_PUBLIC_BASE**: 应用部署路径
   - 根目录部署: `/`
   - 子目录部署: `/app/`
   - **必须与 Nginx 配置一致**

3. **VITE_DELETE_CONSOLE**: 移除 console
   - 生产环境必须设为 `true`
   - 减小包体积,防止信息泄露

4. **VITE_SHOW_SOURCEMAP**: SourceMap
   - 生产环境必须设为 `false`
   - 防止源码泄露

### 构建命令

```bash
# 进入项目目录
cd plus-app

# 安装依赖(如果还没安装)
pnpm install

# 构建 H5 生产版本
pnpm build:h5

# 构建完成后,产物在 dist/build/h5 目录
```

### 构建产物

构建成功后的目录结构:

```text
dist/
└── build/
    └── h5/
        ├── index.html              # 入口 HTML 文件
        ├── assets/                 # 资源目录
        │   ├── css/
        │   │   ├── index.[hash].css
        │   │   └── vendor.[hash].css
        │   └── js/
        │       ├── index.[hash].js
        │       ├── vendor.[hash].js
        │       └── chunk.[hash].js
        ├── static/                 # 静态资源
        │   ├── images/
        │   ├── fonts/
        │   └── ...
        └── favicon.ico             # 网站图标
```

**产物说明:**

- **index.html**: 应用入口,SPA 单页面
- **assets/**: 打包后的 CSS 和 JS 文件
- **static/**: 原始静态资源(图片、字体等)
- **[hash]**: 文件哈希,用于缓存控制

## 部署方式

### 1. Nginx 部署(推荐)

#### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# macOS
brew install nginx
```

#### 上传构建产物

```bash
# 方式1: SCP 上传
scp -r dist/build/h5/* user@server:/var/www/html/app

# 方式2: rsync 同步
rsync -avz dist/build/h5/ user@server:/var/www/html/app

# 方式3: FTP 工具上传(FileZilla 等)
```

#### Nginx 配置

**根目录部署:**

```nginx
# /etc/nginx/sites-available/app.conf
server {
    listen 80;
    server_name app.example.com;

    # 网站根目录
    root /var/www/html/app;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理(可选)
    location /api/ {
        proxy_pass https://api.example.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**子目录部署:**

```nginx
# 应用部署在 /app/ 子目录
server {
    listen 80;
    server_name example.com;

    # 子目录部署
    location /app/ {
        alias /var/www/html/app/;
        index index.html;
        try_files $uri $uri/ /app/index.html;
    }

    # 静态资源
    location ~* ^/app/.*\.(js|css|png|jpg|jpeg|gif|ico)$ {
        alias /var/www/html/app/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**注意事项:**

1. 子目录部署时,`VITE_APP_PUBLIC_BASE` 必须设为 `/app/`
2. `alias` 路径必须以 `/` 结尾
3. `try_files` 的 fallback 路径必须与子目录一致

#### HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name app.example.com;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/html/app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 自动跳转 HTTPS
server {
    listen 80;
    server_name app.example.com;
    return 301 https://$server_name$request_uri;
}
```

#### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/app.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载配置
sudo nginx -s reload

# 或重启 Nginx
sudo systemctl restart nginx
```

### 2. Apache 部署

#### 安装 Apache

```bash
# Ubuntu/Debian
sudo apt install apache2

# CentOS/RHEL
sudo yum install httpd
```

#### Apache 配置

创建 `/etc/apache2/sites-available/app.conf`:

```apache
<VirtualHost *:80>
    ServerName app.example.com
    DocumentRoot /var/www/html/app

    <Directory /var/www/html/app>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA 路由支持
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Gzip 压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>

    # 静态资源缓存
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
    </IfModule>
</VirtualHost>
```

#### 启用配置

```bash
# 启用 rewrite 模块
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires

# 启用站点配置
sudo a2ensite app.conf

# 重启 Apache
sudo systemctl restart apache2
```

### 3. Docker 部署

#### Dockerfile

创建 `Dockerfile`:

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建 H5
RUN pnpm build:h5

# 运行阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx 配置文件

创建 `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai
```

#### 构建和运行

```bash
# 构建镜像
docker build -t ryplus-uni-h5 .

# 运行容器
docker run -d -p 80:80 --name app ryplus-uni-h5

# 或使用 docker-compose
docker-compose up -d
```

### 4. CDN 部署

#### 静态资源 CDN

**方式1: 第三方 CDN(阿里云 OSS、腾讯云 COS 等)**

```bash
# 1. 构建项目
pnpm build:h5

# 2. 上传静态资源到 OSS
# 使用 ossutil 工具
ossutil cp -r dist/build/h5/assets/ oss://bucket-name/app/assets/ --update

# 3. 更新 HTML 中的资源路径
# 修改 index.html,将 /assets/ 替换为 CDN 地址
# https://cdn.example.com/app/assets/
```

**方式2: 构建时配置 CDN**

修改 `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 自定义资源路径
        assetFileNames: (assetInfo) => {
          const cdn = 'https://cdn.example.com'
          return `${cdn}/assets/[name]-[hash][extname]`
        },
      },
    },
  },
})
```

#### Cloudflare Pages 部署

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 创建项目
wrangler pages project create ryplus-uni

# 4. 部署
wrangler pages publish dist/build/h5 --project-name=ryplus-uni
```

#### Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
cd dist/build/h5
vercel --prod
```

### 5. 对象存储部署

#### 阿里云 OSS

**安装 ossutil:**

```bash
# 下载并安装 ossutil
wget https://gosspublic.alicdn.com/ossutil/1.7.15/ossutil64
chmod 755 ossutil64

# 配置
./ossutil64 config
```

**上传文件:**

```bash
# 上传整个目录
./ossutil64 cp -r dist/build/h5/ oss://bucket-name/app/ --update

# 设置静态网站托管
./ossutil64 website --method put oss://bucket-name --index index.html --error index.html
```

#### 腾讯云 COS

**安装 COSCMD:**

```bash
pip install coscmd

# 配置
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>
```

**上传文件:**

```bash
# 上传目录
coscmd upload -r dist/build/h5/ /app/

# 设置静态网站
coscmd putbucketwebsite --index index.html --error index.html
```

## 自动化部署

### GitHub Actions

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy H5

on:
  push:
    branches: [ main, master ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build:h5

      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@v2
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          SOURCE: "dist/build/h5/"
          TARGET: "/var/www/html/app"
```

### GitLab CI/CD

创建 `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm build:h5
  artifacts:
    paths:
      - dist/build/h5
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache rsync openssh
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H $REMOTE_HOST >> ~/.ssh/known_hosts
  script:
    - rsync -avz --delete dist/build/h5/ $REMOTE_USER@$REMOTE_HOST:/var/www/html/app
  only:
    - main
    - master
```

### Jenkins Pipeline

创建 `Jenkinsfile`:

```groovy
pipeline {
    agent any

    environment {
        NODEJS_HOME = tool name: 'NodeJS 18'
        PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your/repo.git'
            }
        }

        stage('Install') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm build:h5'
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['server-credentials']) {
                    sh '''
                        rsync -avz --delete dist/build/h5/ \
                        user@server:/var/www/html/app
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

## 性能优化

### 1. 资源压缩

#### Gzip 压缩

**Nginx 配置:**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/rss+xml
    font/truetype
    font/opentype
    application/vnd.ms-fontobject
    image/svg+xml;
```

#### Brotli 压缩

```nginx
# 安装 brotli 模块
# Ubuntu: sudo apt install nginx-module-brotli

# 启用 brotli
brotli on;
brotli_comp_level 6;
brotli_types
    text/plain
    text/css
    application/json
    application/javascript
    text/xml
    application/xml
    application/xml+rss
    text/javascript;
```

### 2. 缓存策略

**HTTP 缓存头:**

```nginx
# index.html - 不缓存(始终检查更新)
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires 0;
}

# 带 hash 的资源 - 长期缓存
location ~* \.[0-9a-f]{8}\.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 图片等静态资源 - 中期缓存
location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public";
}
```

### 3. HTTP/2 支持

```nginx
server {
    listen 443 ssl http2;  # 启用 HTTP/2
    server_name app.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # HTTP/2 推送(可选)
    location = /index.html {
        http2_push /assets/index.js;
        http2_push /assets/index.css;
    }
}
```

### 4. 预加载和预连接

在 `index.html` 中添加:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 预连接 API 服务器 -->
    <link rel="preconnect" href="https://api.example.com">
    <link rel="dns-prefetch" href="https://api.example.com">

    <!-- 预连接 CDN -->
    <link rel="preconnect" href="https://cdn.example.com">

    <!-- 预加载关键资源 -->
    <link rel="preload" as="script" href="/assets/index.js">
    <link rel="preload" as="style" href="/assets/index.css">
</head>
</html>
```

## 域名和 SSL

### 域名配置

**1. 购买域名**
- 阿里云: https://wanwang.aliyun.com
- 腾讯云: https://dnspod.cloud.tencent.com
- GoDaddy: https://www.godaddy.com

**2. DNS 解析**

添加 A 记录:
```text
类型: A
主机记录: app (或 @)
记录值: 服务器IP
TTL: 600
```

添加 CNAME 记录(如果使用 CDN):
```text
类型: CNAME
主机记录: app
记录值: xxx.cdn.com
TTL: 600
```

### SSL 证书

#### Let's Encrypt 免费证书

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书(Nginx)
sudo certbot --nginx -d app.example.com

# 自动续期
sudo certbot renew --dry-run

# 设置自动续期 cron
0 0 * * * certbot renew --quiet
```

#### 手动配置 SSL

```bash
# 上传证书文件
scp cert.pem key.pem user@server:/etc/nginx/ssl/

# Nginx 配置
server {
    listen 443 ssl http2;
    server_name app.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL 优化
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

## 监控和维护

### 访问日志

**Nginx 日志配置:**

```nginx
# 访问日志
access_log /var/log/nginx/app-access.log combined;

# 错误日志
error_log /var/log/nginx/app-error.log warn;

# 自定义日志格式
log_format app_log '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   '$request_time';

access_log /var/log/nginx/app.log app_log;
```

**查看日志:**

```bash
# 实时查看访问日志
tail -f /var/log/nginx/app-access.log

# 查看错误日志
tail -f /var/log/nginx/app-error.log

# 统计访问量
cat /var/log/nginx/app-access.log | wc -l

# 统计 IP 访问次数
awk '{print $1}' /var/log/nginx/app-access.log | sort | uniq -c | sort -rn | head -10
```

### 性能监控

**安装监控工具:**

```bash
# 安装 GoAccess(日志分析)
sudo apt install goaccess

# 分析日志
goaccess /var/log/nginx/app-access.log -o /var/www/html/report.html --log-format=COMBINED
```

### 备份策略

**自动备份脚本:**

```bash
#!/bin/bash
# backup.sh

# 配置
APP_DIR="/var/www/html/app"
BACKUP_DIR="/backup/app"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
tar -czf $BACKUP_DIR/app_$DATE.tar.gz $APP_DIR

# 只保留最近7天的备份
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Backup completed: app_$DATE.tar.gz"
```

**设置定时备份:**

```bash
# 添加到 crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 常见问题

### 1. 页面刷新 404

**问题原因:**
- SPA 路由未配置
- Nginx 缺少 `try_files` 配置

**解决方案:**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. API 跨域问题

**问题原因:**
- CORS 未配置
- API 服务器不允许跨域请求

**解决方案:**

方式1: 后端配置 CORS

方式2: Nginx 代理

```nginx
location /api/ {
    proxy_pass https://api.example.com/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # CORS 配置
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';

    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### 3. 静态资源 404

**问题原因:**
- `VITE_APP_PUBLIC_BASE` 配置错误
- 资源路径不匹配

**解决方案:**

```bash
# 检查环境变量
# .env.production
VITE_APP_PUBLIC_BASE = '/'  # 根目录部署
# 或
VITE_APP_PUBLIC_BASE = '/app/'  # 子目录部署

# 重新构建
pnpm build:h5
```

### 4. HTTPS 混合内容警告

**问题原因:**
- HTTPS 页面加载 HTTP 资源

**解决方案:**

```bash
# 确保所有资源使用 HTTPS
# .env.production
VITE_APP_BASE_API = 'https://api.example.com'  # ✅
# 不要使用
VITE_APP_BASE_API = 'http://api.example.com'   # ❌
```

### 5. 构建后文件过大

**问题原因:**
- 未开启代码压缩
- SourceMap 未关闭
- 未进行代码分割

**解决方案:**

```bash
# 检查环境变量
# .env.production
VITE_DELETE_CONSOLE = true
VITE_SHOW_SOURCEMAP = false
VITE_MINIFY = true

# 分析包体积
pnpm build:h5 --report
```

## 部署检查清单

部署前检查:

- [ ] 环境变量配置正确
- [ ] API 地址正确
- [ ] `VITE_APP_PUBLIC_BASE` 与部署路径一致
- [ ] SourceMap 已关闭
- [ ] console 已移除
- [ ] 构建成功无错误

部署后检查:

- [ ] 首页可以正常访问
- [ ] 路由跳转正常
- [ ] API 请求正常
- [ ] 静态资源加载正常
- [ ] HTTPS 证书有效
- [ ] 移动端适配正常
- [ ] 性能指标达标

## 总结

RuoYi-Plus-UniApp 的 H5 部署提供了:

**核心优势:**

1. **多种部署方式** - Nginx、Apache、Docker、CDN 等
2. **自动化部署** - CI/CD 集成,一键部署
3. **性能优化** - Gzip、Brotli、HTTP/2、缓存策略
4. **安全保障** - HTTPS、证书管理、访问控制
5. **运维友好** - 日志监控、备份恢复、问题排查

**最佳实践:**

1. 生产环境必须使用 HTTPS
2. 配置合理的缓存策略
3. 启用 Gzip/Brotli 压缩
4. 使用 CDN 加速静态资源
5. 定期备份和监控
6. 配置自动化部署流程

通过合理的部署配置和优化,可以获得高性能、安全可靠的 H5 应用。
