# 多阶段构建：Node 构建静态站 → nginx 托管
# 数据同步（pnpm sync）不在镜像里跑：数据在本地/CI 同步并提交后再构建，保证同一提交构建出同一站点。

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# 类型检查（astro check）属于提交前验证门，镜像里只做构建，缩短发布时间
RUN pnpm build:fast

FROM nginx:1.27-alpine
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
