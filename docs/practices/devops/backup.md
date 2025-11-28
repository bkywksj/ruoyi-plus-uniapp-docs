# 数据备份最佳实践

## 概述

数据是企业最宝贵的资产,完善的备份策略是保障业务连续性的关键。RuoYi-Plus-UniApp 项目涉及多种数据类型,包括关系型数据库、缓存数据、文件存储和配置信息。本文档详细介绍针对不同数据类型的备份策略、自动化方案和灾难恢复流程。

**核心目标:**

- **数据安全** - 防止数据丢失、损坏或被恶意篡改
- **业务连续性** - 快速恢复服务,最小化停机时间
- **合规性** - 满足法律法规对数据保护的要求
- **可靠性** - 验证备份可恢复性,定期演练恢复流程
- **效率** - 自动化备份流程,减少人工干预

**备份策略核心指标:**

| 指标 | 说明 | 目标值 |
|------|------|--------|
| **RPO** (恢复点目标) | 允许丢失的最大数据量 | ≤ 1小时 |
| **RTO** (恢复时间目标) | 系统恢复所需的最大时间 | ≤ 4小时 |
| **备份频率** | 执行备份的时间间隔 | 核心数据:每日;全量:每周 |
| **保留周期** | 备份数据的保存时间 | 日备:30天;周备:90天;月备:1年 |
| **存储成本** | 备份存储的费用投入 | 合理控制 |

---

## 备份架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         备份架构全景图                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    生产环境数据源                            │   │
│   ├─────────────────────────────────────────────────────────────┤   │
│   │  MySQL (3306)   Redis (6379)   MinIO (9000)   应用日志      │   │
│   └──────┬────────────────┬────────────────┬────────────┬───────┘   │
│          │                │                │            │           │
│          ▼                ▼                ▼            ▼           │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────────┐   │
│   │ 全量备份     │ │ 增量备份     │ │ 快照备份 │ │ 归档备份    │   │
│   │ (每周日)     │ │ (每日)       │ │ (每小时) │ │ (每月)      │   │
│   └──────┬───────┘ └──────┬───────┘ └────┬─────┘ └──────┬──────┘   │
│          │                │               │              │          │
│          └────────────────┴───────────────┴──────────────┘          │
│                                    │                                │
│                                    ▼                                │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      备份存储层                              │   │
│   ├─────────────────────────────────────────────────────────────┤   │
│   │  本地存储(快速恢复) → 远程存储(灾备) → 对象存储(归档)       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 备份策略矩阵

| 数据类型 | 备份方式 | 备份频率 | 保留周期 | 存储位置 | 优先级 |
|---------|---------|----------|---------|----------|--------|
| MySQL数据库 | 全量+增量 | 全量:周;增量:日 | 30天+90天 | 本地+远程 | P0 |
| Redis缓存 | RDB+AOF | RDB:日;AOF:实时 | 7天 | 本地 | P1 |
| MinIO文件 | 同步复制 | 实时 | 永久 | 远程MinIO | P0 |
| 应用日志 | 归档压缩 | 日 | 90天 | 本地 | P2 |
| 配置文件 | 版本控制 | 变更时 | 永久 | Git仓库 | P1 |
| 数据库结构 | DDL导出 | 周 | 永久 | Git+本地 | P1 |

---

## MySQL 数据库备份

### 1. 全量备份

**备份策略:** 每周日凌晨 2:00 执行全量备份

**备份脚本:**

```bash
#!/bin/bash
# mysql_full_backup.sh - MySQL全量备份脚本

set -e

# ==================== 配置区 ====================
# 数据库配置
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_USER="backup_user"
DB_PASSWORD="your-backup-password"
DB_NAME="ryplus_uni_workflow"

# 备份目录
BACKUP_ROOT="/backup/mysql"
BACKUP_DIR="${BACKUP_ROOT}/full"
LOG_DIR="${BACKUP_ROOT}/logs"

# 保留策略
RETENTION_DAYS=90  # 保留90天

# 通知配置
ALERT_EMAIL="admin@example.com"
WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"

# ==================== 初始化 ====================
mkdir -p "${BACKUP_DIR}" "${LOG_DIR}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_full_${TIMESTAMP}.sql.gz"
LOG_FILE="${LOG_DIR}/backup_${TIMESTAMP}.log"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# 错误处理
handle_error() {
    log "ERROR: 备份失败 - $1"
    # 发送告警
    curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"MySQL备份失败: $1\"}}"
    exit 1
}

# ==================== 备份执行 ====================
log "开始MySQL全量备份"

# 检查数据库连接
if ! mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SELECT 1" > /dev/null 2>&1; then
    handle_error "数据库连接失败"
fi

# 检查磁盘空间(至少需要10GB)
AVAILABLE_SPACE=$(df -BG "${BACKUP_DIR}" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "${AVAILABLE_SPACE}" -lt 10 ]; then
    handle_error "磁盘空间不足,剩余 ${AVAILABLE_SPACE}GB"
fi

# 执行备份
log "正在备份数据库: ${DB_NAME}"
START_TIME=$(date +%s)

mysqldump \
    -h"${DB_HOST}" \
    -P"${DB_PORT}" \
    -u"${DB_USER}" \
    -p"${DB_PASSWORD}" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --default-character-set=utf8mb4 \
    --set-gtid-purged=OFF \
    --databases "${DB_NAME}" \
    2>>"${LOG_FILE}" | gzip > "${BACKUP_FILE}"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    handle_error "mysqldump执行失败"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 验证备份文件
if [ ! -s "${BACKUP_FILE}" ]; then
    handle_error "备份文件为空"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | awk '{print $1}')
log "备份完成: ${BACKUP_FILE}"
log "备份大小: ${BACKUP_SIZE}"
log "耗时: ${DURATION}秒"

# ==================== 备份验证 ====================
log "开始验证备份文件完整性"

# 测试压缩文件
if ! gzip -t "${BACKUP_FILE}" 2>>"${LOG_FILE}"; then
    handle_error "备份文件损坏(压缩验证失败)"
fi

# 验证SQL内容(解压前100行)
if ! zcat "${BACKUP_FILE}" | head -100 | grep -q "CREATE DATABASE"; then
    handle_error "备份文件损坏(SQL内容验证失败)"
fi

log "备份验证通过"

# ==================== 生成MD5校验 ====================
log "生成MD5校验文件"
md5sum "${BACKUP_FILE}" > "${BACKUP_FILE}.md5"

# ==================== 远程备份 ====================
log "开始远程备份"
REMOTE_SERVER="backup.example.com"
REMOTE_DIR="/remote-backup/mysql"

# 使用rsync传输
rsync -avz --progress \
    "${BACKUP_FILE}" "${BACKUP_FILE}.md5" \
    "${REMOTE_SERVER}:${REMOTE_DIR}/" \
    >> "${LOG_FILE}" 2>&1

if [ $? -eq 0 ]; then
    log "远程备份成功"
else
    log "WARNING: 远程备份失败,仅保留本地备份"
fi

# ==================== 清理旧备份 ====================
log "清理${RETENTION_DAYS}天前的旧备份"
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;
find "${BACKUP_DIR}" -name "*.md5" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

# ==================== 备份元数据 ====================
cat > "${BACKUP_DIR}/backup_${TIMESTAMP}.meta" <<EOF
{
  "database": "${DB_NAME}",
  "backup_type": "full",
  "timestamp": "${TIMESTAMP}",
  "file": "${BACKUP_FILE}",
  "size": "${BACKUP_SIZE}",
  "duration": "${DURATION}s",
  "md5": "$(cat ${BACKUP_FILE}.md5 | awk '{print $1}')",
  "mysql_version": "$(mysql -V | awk '{print $5}')",
  "host": "$(hostname)"
}
EOF

# ==================== 成功通知 ====================
log "备份流程完成"

# 发送成功通知
curl -X POST "${WEBHOOK_URL}" \
    -H 'Content-Type: application/json' \
    -d "{\"msgtype\":\"markdown\",\"markdown\":{\"content\":\"✅ MySQL备份成功\n>数据库: ${DB_NAME}\n>大小: ${BACKUP_SIZE}\n>耗时: ${DURATION}秒\n>时间: ${TIMESTAMP}\"}}"

exit 0
```

**脚本说明:**

| 参数 | 说明 |
|------|------|
| `--single-transaction` | 使用事务保证数据一致性(InnoDB) |
| `--quick` | 快速导出,逐行读取避免缓冲 |
| `--lock-tables=false` | 不锁表,减少对业务影响 |
| `--routines` | 备份存储过程和函数 |
| `--triggers` | 备份触发器 |
| `--events` | 备份事件调度器 |
| `--hex-blob` | BLOB数据使用十六进制 |
| `--set-gtid-purged=OFF` | 关闭GTID导出(单机) |

### 2. 增量备份

**备份策略:** 每日凌晨 3:00 执行二进制日志归档

```bash
#!/bin/bash
# mysql_incremental_backup.sh - MySQL增量备份(binlog)

set -e

BACKUP_DIR="/backup/mysql/incremental"
BINLOG_DIR="/var/lib/mysql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}/${TIMESTAMP}"

# 刷新并切换binlog
mysql -u backup_user -p'password' -e "FLUSH BINARY LOGS"

# 查找并归档昨天的binlog
YESTERDAY=$(date -d "1 day ago" +%Y%m%d)

find "${BINLOG_DIR}" -name "mysql-bin.*" -newermt "${YESTERDAY} 00:00:00" ! -newermt "${YESTERDAY} 23:59:59" \
    -exec cp {} "${BACKUP_DIR}/${TIMESTAMP}/" \;

# 压缩归档
tar -czf "${BACKUP_DIR}/binlog_${TIMESTAMP}.tar.gz" -C "${BACKUP_DIR}" "${TIMESTAMP}"
rm -rf "${BACKUP_DIR}/${TIMESTAMP}"

echo "Binlog备份完成: ${BACKUP_DIR}/binlog_${TIMESTAMP}.tar.gz"
```

### 3. 定时任务配置

```bash
# 编辑crontab
crontab -e

# 添加定时任务
# 每周日凌晨2点执行全量备份
0 2 * * 0 /opt/scripts/mysql_full_backup.sh

# 每天凌晨3点执行增量备份
0 3 * * * /opt/scripts/mysql_incremental_backup.sh

# 每天凌晨4点清理30天前的日志
0 4 * * * find /backup/mysql/logs -name "*.log" -mtime +30 -delete
```

### 4. 备份用户权限

```sql
-- 创建专用备份用户
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';

-- 授予必要权限
GRANT SELECT, RELOAD, LOCK TABLES, REPLICATION CLIENT, SHOW VIEW, EVENT, TRIGGER ON *.*
TO 'backup_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```

### 5. Docker 容器备份

```bash
#!/bin/bash
# docker_mysql_backup.sh - Docker容器MySQL备份

CONTAINER_NAME="mysql"
BACKUP_FILE="/backup/mysql/docker_$(date +%Y%m%d_%H%M%S).sql.gz"

# 使用docker exec执行备份
docker exec "${CONTAINER_NAME}" mysqldump \
    -uroot -p'mysql123456' \
    --all-databases \
    --single-transaction \
    --quick \
    --lock-tables=false \
    | gzip > "${BACKUP_FILE}"

echo "Docker MySQL备份完成: ${BACKUP_FILE}"
```

---

## Redis 数据备份

### 1. RDB 快照备份

**Redis 配置 (redis.conf):**

```ini
# RDB持久化配置
save 900 1        # 900秒内至少1个key变化
save 300 10       # 300秒内至少10个key变化
save 60 10000     # 60秒内至少10000个key变化

# RDB文件配置
dbfilename dump.rdb
dir /redis/data/
rdbcompression yes
rdbchecksum yes

# 后台保存失败时停止写入
stop-writes-on-bgsave-error yes
```

**手动备份脚本:**

```bash
#!/bin/bash
# redis_rdb_backup.sh - Redis RDB备份

set -e

REDIS_CLI="redis-cli -a ruoyi123"
REDIS_DIR="/docker/redis/data"
BACKUP_DIR="/backup/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}"

echo "触发Redis BGSAVE..."
${REDIS_CLI} BGSAVE

# 等待BGSAVE完成
while true; do
    STATUS=$(${REDIS_CLI} LASTSAVE)
    sleep 2
    NEW_STATUS=$(${REDIS_CLI} LASTSAVE)
    if [ "${STATUS}" != "${NEW_STATUS}" ]; then
        break
    fi
done

echo "BGSAVE完成,复制RDB文件..."
cp "${REDIS_DIR}/dump.rdb" "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb"

# 压缩备份
gzip "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb"

echo "Redis RDB备份完成: ${BACKUP_DIR}/dump_${TIMESTAMP}.rdb.gz"

# 清理7天前的备份
find "${BACKUP_DIR}" -name "dump_*.rdb.gz" -mtime +7 -delete
```

### 2. AOF 持久化

**Redis 配置:**

```ini
# 开启AOF
appendonly yes
appendfilename "appendonly.aof"

# AOF同步策略
appendfsync everysec  # 每秒同步一次(推荐)
# appendfsync always  # 每次写入同步(最安全但慢)
# appendfsync no      # 由OS决定(最快但不安全)

# AOF重写配置
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 加载时AOF文件损坏处理
aof-load-truncated yes
```

**AOF 备份脚本:**

```bash
#!/bin/bash
# redis_aof_backup.sh - Redis AOF备份

REDIS_DIR="/docker/redis/data"
BACKUP_DIR="/backup/redis/aof"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}"

# 触发AOF重写
redis-cli -a ruoyi123 BGREWRITEAOF

# 等待重写完成
sleep 5

# 复制AOF文件
cp "${REDIS_DIR}/appendonly.aof" "${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof"
gzip "${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof"

echo "Redis AOF备份完成: ${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof.gz"
```

### 3. Docker 容器备份

```bash
#!/bin/bash
# docker_redis_backup.sh - Docker Redis备份

CONTAINER_NAME="redis"
BACKUP_DIR="/backup/redis/docker"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}"

# 触发SAVE
docker exec "${CONTAINER_NAME}" redis-cli -a ruoyi123 SAVE

# 复制数据文件
docker cp "${CONTAINER_NAME}:/redis/data/dump.rdb" "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb"
docker cp "${CONTAINER_NAME}:/redis/data/appendonly.aof" "${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof"

# 压缩
tar -czf "${BACKUP_DIR}/redis_${TIMESTAMP}.tar.gz" \
    -C "${BACKUP_DIR}" \
    "dump_${TIMESTAMP}.rdb" "appendonly_${TIMESTAMP}.aof"

rm -f "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb" "${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof"

echo "Docker Redis备份完成: ${BACKUP_DIR}/redis_${TIMESTAMP}.tar.gz"
```

---

## MinIO 对象存储备份

### 1. MinIO 镜像同步

**使用 mc mirror 实时同步:**

```bash
#!/bin/bash
# minio_mirror.sh - MinIO数据镜像

# 配置源和目标MinIO
mc alias set source http://127.0.0.1:9000 ruoyi ruoyi123
mc alias set backup http://backup-server:9000 backup_user backup_pass

# 镜像同步(增量)
mc mirror --watch --remove source/ryplus backup/ryplus

# 说明:
# --watch: 持续监听变化
# --remove: 同步删除操作
```

**定时全量同步:**

```bash
#!/bin/bash
# minio_full_sync.sh - MinIO定时全量同步

set -e

SOURCE_ALIAS="source"
SOURCE_BUCKET="ryplus"
BACKUP_ALIAS="backup"
BACKUP_BUCKET="ryplus-backup"
LOG_FILE="/var/log/minio_sync_$(date +%Y%m%d).log"

echo "[$(date)] 开始MinIO全量同步" | tee -a "${LOG_FILE}"

# 同步
mc mirror \
    --overwrite \
    --preserve \
    "${SOURCE_ALIAS}/${SOURCE_BUCKET}" \
    "${BACKUP_ALIAS}/${BACKUP_BUCKET}" \
    2>&1 | tee -a "${LOG_FILE}"

echo "[$(date)] MinIO同步完成" | tee -a "${LOG_FILE}"
```

### 2. MinIO 数据导出

```bash
#!/bin/bash
# minio_export.sh - MinIO数据导出到本地

BUCKET="ryplus"
EXPORT_DIR="/backup/minio/export"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_PATH="${EXPORT_DIR}/${TIMESTAMP}"

mkdir -p "${EXPORT_PATH}"

# 下载整个bucket
mc cp --recursive source/${BUCKET}/ "${EXPORT_PATH}/"

# 打包压缩
tar -czf "${EXPORT_DIR}/minio_${BUCKET}_${TIMESTAMP}.tar.gz" \
    -C "${EXPORT_DIR}" "${TIMESTAMP}"

rm -rf "${EXPORT_PATH}"

echo "MinIO导出完成: ${EXPORT_DIR}/minio_${BUCKET}_${TIMESTAMP}.tar.gz"

# 清理30天前的导出文件
find "${EXPORT_DIR}" -name "minio_*.tar.gz" -mtime +30 -delete
```

### 3. MinIO 版本控制

**启用bucket版本控制:**

```bash
# 启用版本控制
mc version enable source/ryplus

# 查看版本状态
mc version info source/ryplus

# 列出对象所有版本
mc ls --versions source/ryplus/path/to/file
```

---

## 应用日志备份

### 1. 日志归档脚本

```bash
#!/bin/bash
# logs_archive.sh - 应用日志归档

set -e

LOG_DIRS=(
    "/home/ubuntu/apps/ryplus_uni_workflow/logs"
    "/home/ubuntu/apps/monitor/logs"
    "/home/ubuntu/apps/snailjob/logs"
)

ARCHIVE_DIR="/backup/logs"
TIMESTAMP=$(date +%Y%m%d)
RETENTION_DAYS=90

mkdir -p "${ARCHIVE_DIR}"

for LOG_DIR in "${LOG_DIRS[@]}"; do
    if [ ! -d "${LOG_DIR}" ]; then
        echo "跳过不存在的目录: ${LOG_DIR}"
        continue
    fi

    # 获取服务名称
    SERVICE_NAME=$(basename $(dirname "${LOG_DIR}"))

    echo "归档 ${SERVICE_NAME} 日志..."

    # 查找昨天的日志文件
    find "${LOG_DIR}" -name "*.log*" -mtime +0 -mtime -1 \
        -exec tar -czf "${ARCHIVE_DIR}/${SERVICE_NAME}_${TIMESTAMP}.tar.gz" {} +

    # 删除已归档的日志
    find "${LOG_DIR}" -name "*.log.*" -mtime +7 -delete
done

# 清理旧归档
find "${ARCHIVE_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "日志归档完成"
```

### 2. Logrotate 配置

```bash
# /etc/logrotate.d/ruoyi-plus
/home/ubuntu/apps/*/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    dateext
    dateformat -%Y%m%d
    sharedscripts
    postrotate
        # 归档到备份目录
        /opt/scripts/logs_archive.sh
    endscript
}
```

---

## 配置文件备份

### 1. Git 版本控制

```bash
#!/bin/bash
# config_backup.sh - 配置文件Git备份

CONFIG_DIRS=(
    "/docker/nginx/conf"
    "/docker/mysql/conf"
    "/docker/redis/conf"
    "/etc/systemd/system"
)

BACKUP_REPO="/backup/configs"

# 初始化Git仓库(首次)
if [ ! -d "${BACKUP_REPO}/.git" ]; then
    mkdir -p "${BACKUP_REPO}"
    cd "${BACKUP_REPO}"
    git init
    git config user.name "Backup System"
    git config user.email "backup@example.com"
fi

cd "${BACKUP_REPO}"

# 复制配置文件
for CONFIG_DIR in "${CONFIG_DIRS[@]}"; do
    if [ -d "${CONFIG_DIR}" ]; then
        TARGET_DIR="${BACKUP_REPO}/$(echo ${CONFIG_DIR} | sed 's/^\/*//')"
        mkdir -p "$(dirname ${TARGET_DIR})"
        cp -r "${CONFIG_DIR}" "${TARGET_DIR}"
    fi
done

# 提交变更
git add .
git diff --quiet && git diff --staged --quiet || \
    git commit -m "Config backup at $(date '+%Y-%m-%d %H:%M:%S')"

# 推送到远程仓库
git push origin master 2>/dev/null || echo "远程推送跳过"

echo "配置文件备份完成"
```

### 2. Docker Compose 配置备份

```bash
#!/bin/bash
# compose_backup.sh - Docker Compose配置备份

COMPOSE_DIR="/opt/docker-compose"
BACKUP_DIR="/backup/compose"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}"

# 备份所有compose文件和环境变量
tar -czf "${BACKUP_DIR}/compose_${TIMESTAMP}.tar.gz" \
    -C "$(dirname ${COMPOSE_DIR})" \
    "$(basename ${COMPOSE_DIR})"

echo "Compose配置备份完成: ${BACKUP_DIR}/compose_${TIMESTAMP}.tar.gz"
```

---

## 数据库结构备份

### 1. DDL 导出

```bash
#!/bin/bash
# schema_backup.sh - 数据库结构备份

DB_NAME="ryplus_uni_workflow"
BACKUP_DIR="/backup/schema"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}"

# 仅导出表结构(不含数据)
mysqldump \
    -h127.0.0.1 \
    -ubackup_user \
    -p'password' \
    --no-data \
    --routines \
    --triggers \
    --events \
    "${DB_NAME}" > "${BACKUP_DIR}/schema_${TIMESTAMP}.sql"

echo "数据库结构备份完成: ${BACKUP_DIR}/schema_${TIMESTAMP}.sql"

# Git版本控制
cd "${BACKUP_DIR}"
git add "schema_${TIMESTAMP}.sql"
git commit -m "Schema backup ${TIMESTAMP}"
```

---

## 自动化备份系统

### 1. 统一备份编排

```bash
#!/bin/bash
# master_backup.sh - 主备份脚本(编排所有备份任务)

set -e

SCRIPT_DIR="/opt/backup-scripts"
LOG_FILE="/var/log/backup/master_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$(dirname ${LOG_FILE})"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# 错误处理
handle_error() {
    log "ERROR: $1"
    # 发送告警
    curl -X POST "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx" \
        -H 'Content-Type: application/json' \
        -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"备份任务失败: $1\"}}"
    exit 1
}

log "========== 开始备份任务 =========="

# 1. MySQL备份
log "执行MySQL备份..."
if ! "${SCRIPT_DIR}/mysql_full_backup.sh" >> "${LOG_FILE}" 2>&1; then
    handle_error "MySQL备份失败"
fi

# 2. Redis备份
log "执行Redis备份..."
if ! "${SCRIPT_DIR}/redis_rdb_backup.sh" >> "${LOG_FILE}" 2>&1; then
    handle_error "Redis备份失败"
fi

# 3. MinIO备份
log "执行MinIO备份..."
if ! "${SCRIPT_DIR}/minio_full_sync.sh" >> "${LOG_FILE}" 2>&1; then
    handle_error "MinIO备份失败"
fi

# 4. 日志归档
log "执行日志归档..."
if ! "${SCRIPT_DIR}/logs_archive.sh" >> "${LOG_FILE}" 2>&1; then
    log "WARNING: 日志归档失败"
fi

# 5. 配置备份
log "执行配置备份..."
if ! "${SCRIPT_DIR}/config_backup.sh" >> "${LOG_FILE}" 2>&1; then
    log "WARNING: 配置备份失败"
fi

log "========== 备份任务完成 =========="

# 生成备份报告
"${SCRIPT_DIR}/backup_report.sh" >> "${LOG_FILE}" 2>&1

# 发送成功通知
curl -X POST "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx" \
    -H 'Content-Type: application/json' \
    -d "{\"msgtype\":\"markdown\",\"markdown\":{\"content\":\"✅ 备份任务完成\n>时间: $(date '+%Y-%m-%d %H:%M:%S')\n>详情: ${LOG_FILE}\"}}"

exit 0
```

### 2. Systemd 定时器

**创建服务单元:**

```ini
# /etc/systemd/system/backup.service
[Unit]
Description=RuoYi-Plus Backup Service
After=network.target mysql.service redis.service

[Service]
Type=oneshot
ExecStart=/opt/backup-scripts/master_backup.sh
User=root
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**创建定时器:**

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=RuoYi-Plus Backup Timer
Requires=backup.service

[Timer]
# 每天凌晨2点执行
OnCalendar=*-*-* 02:00:00
# 错过后立即执行
Persistent=true

[Install]
WantedBy=timers.target
```

**启用定时器:**

```bash
# 重载systemd配置
systemctl daemon-reload

# 启用并启动定时器
systemctl enable backup.timer
systemctl start backup.timer

# 查看定时器状态
systemctl status backup.timer

# 查看下次执行时间
systemctl list-timers backup.timer
```

### 3. 备份监控脚本

```bash
#!/bin/bash
# backup_monitor.sh - 备份监控和告警

BACKUP_ROOT="/backup"
ALERT_THRESHOLD_HOURS=26  # 26小时内未备份则告警

check_backup() {
    local backup_type=$1
    local backup_dir=$2

    # 查找最新备份文件
    local latest_backup=$(find "${backup_dir}" -type f -name "*.gz" -o -name "*.sql" | sort -r | head -1)

    if [ -z "${latest_backup}" ]; then
        echo "❌ ${backup_type}: 未找到备份文件"
        return 1
    fi

    # 检查备份时间
    local backup_time=$(stat -c %Y "${latest_backup}")
    local current_time=$(date +%s)
    local diff_hours=$(( (current_time - backup_time) / 3600 ))

    if [ ${diff_hours} -gt ${ALERT_THRESHOLD_HOURS} ]; then
        echo "⚠️ ${backup_type}: 备份过期(${diff_hours}小时前)"
        return 1
    else
        echo "✅ ${backup_type}: 正常(${diff_hours}小时前)"
        return 0
    fi
}

echo "===== 备份状态检查 ====="
check_backup "MySQL" "${BACKUP_ROOT}/mysql/full"
check_backup "Redis" "${BACKUP_ROOT}/redis"
check_backup "MinIO" "${BACKUP_ROOT}/minio/export"
```

---

## 数据恢复流程

### 1. MySQL 数据恢复

**全量恢复:**

```bash
#!/bin/bash
# mysql_restore.sh - MySQL数据恢复

set -e

BACKUP_FILE=$1

if [ -z "${BACKUP_FILE}" ]; then
    echo "用法: $0 <backup_file.sql.gz>"
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "错误: 备份文件不存在"
    exit 1
fi

echo "警告: 此操作将覆盖现有数据库!"
read -p "确认恢复? (yes/no): " confirm

if [ "${confirm}" != "yes" ]; then
    echo "取消恢复"
    exit 0
fi

echo "开始恢复数据库..."

# 解压并恢复
zcat "${BACKUP_FILE}" | mysql -h127.0.0.1 -uroot -p'password'

echo "数据库恢复完成"

# 验证
mysql -h127.0.0.1 -uroot -p'password' -e "SHOW DATABASES;"
```

**PITR (点时间恢复):**

```bash
#!/bin/bash
# mysql_pitr.sh - MySQL点时间恢复

FULL_BACKUP=$1
BINLOG_DIR=$2
TARGET_TIME=$3  # 格式: '2024-11-24 10:30:00'

# 1. 恢复全量备份
zcat "${FULL_BACKUP}" | mysql -uroot -p'password'

# 2. 应用binlog到指定时间点
for binlog in ${BINLOG_DIR}/mysql-bin.*; do
    mysqlbinlog --stop-datetime="${TARGET_TIME}" "${binlog}" | \
        mysql -uroot -p'password'
done

echo "PITR恢复完成,数据恢复到: ${TARGET_TIME}"
```

### 2. Redis 数据恢复

```bash
#!/bin/bash
# redis_restore.sh - Redis数据恢复

BACKUP_FILE=$1
REDIS_DIR="/docker/redis/data"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "错误: 备份文件不存在"
    exit 1
fi

# 停止Redis
docker stop redis

# 解压恢复RDB
gunzip -c "${BACKUP_FILE}" > "${REDIS_DIR}/dump.rdb"

# 启动Redis
docker start redis

echo "Redis恢复完成"

# 验证
redis-cli -a ruoyi123 PING
```

### 3. MinIO 数据恢复

```bash
#!/bin/bash
# minio_restore.sh - MinIO数据恢复

BACKUP_FILE=$1  # tar.gz归档文件
TEMP_DIR="/tmp/minio_restore"

# 解压备份
mkdir -p "${TEMP_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"

# 恢复到MinIO
mc cp --recursive "${TEMP_DIR}/" source/ryplus/

rm -rf "${TEMP_DIR}"

echo "MinIO恢复完成"
```

### 4. 灾难恢复完整流程

```bash
#!/bin/bash
# disaster_recovery.sh - 完整灾难恢复

set -e

echo "===== 灾难恢复流程 ====="

# 1. 恢复MySQL
echo "步骤 1/4: 恢复MySQL数据库..."
MYSQL_BACKUP=$(ls -t /backup/mysql/full/*.sql.gz | head -1)
./mysql_restore.sh "${MYSQL_BACKUP}"

# 2. 恢复Redis
echo "步骤 2/4: 恢复Redis数据..."
REDIS_BACKUP=$(ls -t /backup/redis/dump_*.rdb.gz | head -1)
./redis_restore.sh "${REDIS_BACKUP}"

# 3. 恢复MinIO
echo "步骤 3/4: 恢复MinIO数据..."
MINIO_BACKUP=$(ls -t /backup/minio/export/*.tar.gz | head -1)
./minio_restore.sh "${MINIO_BACKUP}"

# 4. 恢复配置文件
echo "步骤 4/4: 恢复配置文件..."
cd /backup/configs
git pull origin master
# 手动检查并应用配置

echo "===== 灾难恢复完成 ====="
echo "请验证系统功能并检查数据完整性"
```

---

## 备份验证

### 1. 自动化验证脚本

```bash
#!/bin/bash
# backup_verify.sh - 备份验证

set -e

BACKUP_DIR="/backup"
VERIFY_LOG="/var/log/backup/verify_$(date +%Y%m%d).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${VERIFY_LOG}"
}

# 验证MySQL备份
verify_mysql() {
    log "验证MySQL备份..."

    local latest_backup=$(ls -t ${BACKUP_DIR}/mysql/full/*.sql.gz | head -1)

    # 验证压缩文件
    if ! gzip -t "${latest_backup}"; then
        log "ERROR: MySQL备份文件损坏"
        return 1
    fi

    # 验证SQL内容
    if ! zcat "${latest_backup}" | head -100 | grep -q "CREATE DATABASE"; then
        log "ERROR: MySQL备份内容异常"
        return 1
    fi

    # 验证MD5
    if [ -f "${latest_backup}.md5" ]; then
        cd "$(dirname ${latest_backup})"
        if ! md5sum -c "$(basename ${latest_backup}).md5"; then
            log "ERROR: MySQL备份MD5校验失败"
            return 1
        fi
    fi

    log "✅ MySQL备份验证通过"
    return 0
}

# 验证Redis备份
verify_redis() {
    log "验证Redis备份..."

    local latest_backup=$(ls -t ${BACKUP_DIR}/redis/dump_*.rdb.gz | head -1)

    # 验证压缩文件
    if ! gzip -t "${latest_backup}"; then
        log "ERROR: Redis备份文件损坏"
        return 1
    fi

    log "✅ Redis备份验证通过"
    return 0
}

# 验证MinIO备份
verify_minio() {
    log "验证MinIO备份..."

    # 检查最近24小时内的同步
    local sync_log=$(ls -t /var/log/minio_sync_*.log | head -1)

    if [ -z "${sync_log}" ]; then
        log "WARNING: 未找到MinIO同步日志"
        return 1
    fi

    if grep -q "error" "${sync_log}"; then
        log "WARNING: MinIO同步存在错误"
        return 1
    fi

    log "✅ MinIO备份验证通过"
    return 0
}

# 执行验证
log "========== 开始备份验证 =========="
verify_mysql
verify_redis
verify_minio
log "========== 备份验证完成 =========="
```

### 2. 定期恢复演练

```bash
#!/bin/bash
# recovery_drill.sh - 恢复演练(在测试环境执行)

DRILL_DB="drill_recovery_test"
DRILL_LOG="/var/log/backup/drill_$(date +%Y%m%d_%H%M%S).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${DRILL_LOG}"
}

log "===== 开始恢复演练 ====="

# 1. 创建测试数据库
log "创建测试数据库: ${DRILL_DB}"
mysql -uroot -p'password' -e "CREATE DATABASE IF NOT EXISTS ${DRILL_DB}"

# 2. 恢复备份到测试数据库
log "恢复备份数据..."
LATEST_BACKUP=$(ls -t /backup/mysql/full/*.sql.gz | head -1)
zcat "${LATEST_BACKUP}" | sed "s/ryplus_uni_workflow/${DRILL_DB}/g" | mysql -uroot -p'password'

# 3. 验证数据完整性
log "验证数据完整性..."
TABLE_COUNT=$(mysql -uroot -p'password' -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DRILL_DB}'")
log "表数量: ${TABLE_COUNT}"

if [ ${TABLE_COUNT} -lt 50 ]; then
    log "ERROR: 表数量异常,恢复可能失败"
    exit 1
fi

# 4. 清理测试数据库
log "清理测试数据库..."
mysql -uroot -p'password' -e "DROP DATABASE ${DRILL_DB}"

log "===== 恢复演练完成 ====="
log "演练成功,备份数据可用"
```

---

## 存储管理

### 1. 磁盘空间监控

```bash
#!/bin/bash
# disk_monitor.sh - 磁盘空间监控

THRESHOLD=80  # 告警阈值(%)
BACKUP_DIRS=(
    "/backup/mysql"
    "/backup/redis"
    "/backup/minio"
    "/backup/logs"
)

for dir in "${BACKUP_DIRS[@]}"; do
    if [ ! -d "${dir}" ]; then
        continue
    fi

    usage=$(df "${dir}" | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ ${usage} -gt ${THRESHOLD} ]; then
        echo "⚠️ 警告: ${dir} 磁盘使用率 ${usage}%"

        # 发送告警
        curl -X POST "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx" \
            -H 'Content-Type: application/json' \
            -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"磁盘空间不足: ${dir} 使用率 ${usage}%\"}}"
    fi
done
```

### 2. 自动清理策略

```bash
#!/bin/bash
# backup_cleanup.sh - 备份清理

# MySQL备份清理(保留30天全量+7天增量)
find /backup/mysql/full -name "*.sql.gz" -mtime +30 -delete
find /backup/mysql/incremental -name "*.tar.gz" -mtime +7 -delete

# Redis备份清理(保留7天)
find /backup/redis -name "dump_*.rdb.gz" -mtime +7 -delete

# MinIO导出清理(保留30天)
find /backup/minio/export -name "minio_*.tar.gz" -mtime +30 -delete

# 日志归档清理(保留90天)
find /backup/logs -name "*.tar.gz" -mtime +90 -delete

# 清理备份日志(保留30天)
find /var/log/backup -name "*.log" -mtime +30 -delete

echo "备份清理完成"
```

### 3. 存储成本优化

**冷热数据分离:**

```bash
#!/bin/bash
# cold_storage.sh - 冷数据归档到低成本存储

COLD_DAYS=90  # 90天前的备份视为冷数据
HOT_DIR="/backup"
COLD_DIR="/archive"  # 可以是NFS、对象存储等

# 移动冷数据
find "${HOT_DIR}/mysql" -name "*.sql.gz" -mtime +${COLD_DAYS} \
    -exec mv {} "${COLD_DIR}/mysql/" \;

echo "冷数据归档完成"
```

---

## 监控告警

### 1. 备份状态监控

**Prometheus 监控指标:**

```bash
#!/bin/bash
# backup_metrics.sh - 生成Prometheus指标

METRICS_FILE="/var/lib/node_exporter/textfile_collector/backup.prom"

cat > "${METRICS_FILE}" << EOF
# HELP backup_last_success_timestamp 最后一次成功备份时间戳
# TYPE backup_last_success_timestamp gauge
backup_last_success_timestamp{type="mysql"} $(stat -c %Y $(ls -t /backup/mysql/full/*.sql.gz | head -1) 2>/dev/null || echo 0)
backup_last_success_timestamp{type="redis"} $(stat -c %Y $(ls -t /backup/redis/dump_*.rdb.gz | head -1) 2>/dev/null || echo 0)

# HELP backup_size_bytes 备份文件大小
# TYPE backup_size_bytes gauge
backup_size_bytes{type="mysql"} $(stat -c %s $(ls -t /backup/mysql/full/*.sql.gz | head -1) 2>/dev/null || echo 0)
backup_size_bytes{type="redis"} $(stat -c %s $(ls -t /backup/redis/dump_*.rdb.gz | head -1) 2>/dev/null || echo 0)

# HELP backup_disk_usage_percent 备份目录磁盘使用率
# TYPE backup_disk_usage_percent gauge
backup_disk_usage_percent $(df /backup | awk 'NR==2 {print $5}' | sed 's/%//')
EOF
```

**告警规则 (Prometheus):**

```yaml
# backup_alerts.yml
groups:
  - name: backup
    interval: 5m
    rules:
      # 备份过期告警
      - alert: BackupTooOld
        expr: (time() - backup_last_success_timestamp) > 86400
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "备份数据过期"
          description: "{{ $labels.type }} 备份已超过24小时未更新"

      # 磁盘空间告警
      - alert: BackupDiskFull
        expr: backup_disk_usage_percent > 85
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "备份磁盘空间不足"
          description: "备份目录磁盘使用率 {{ $value }}%"
```

### 2. 告警通知

**企业微信告警:**

```bash
#!/bin/bash
# alert_wechat.sh - 企业微信告警

WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"

send_alert() {
    local title=$1
    local content=$2
    local level=$3  # info, warning, error

    local emoji
    case ${level} in
        info) emoji="ℹ️" ;;
        warning) emoji="⚠️" ;;
        error) emoji="❌" ;;
        *) emoji="📢" ;;
    esac

    curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
            \"msgtype\": \"markdown\",
            \"markdown\": {
                \"content\": \"${emoji} **${title}**\n\n${content}\n\n---\n时间: $(date '+%Y-%m-%d %H:%M:%S')\"
            }
        }"
}

# 示例调用
send_alert "备份任务完成" "MySQL备份成功\n大小: 2.3GB\n耗时: 180秒" "info"
```

---

## 最佳实践总结

### 1. 3-2-1 备份原则

- **3 份副本** - 保留至少3份数据副本(1份生产+2份备份)
- **2 种介质** - 使用至少2种不同存储介质(本地磁盘+网络存储)
- **1 份异地** - 至少1份备份存储在异地(云存储/远程机房)

### 2. 备份检查清单

| 检查项 | 频率 | 责任人 |
|--------|------|--------|
| 验证备份完整性 | 每日 | 运维 |
| 测试恢复流程 | 每周 | 运维 |
| 恢复演练 | 每月 | 运维+开发 |
| 审查备份策略 | 每季度 | 技术负责人 |
| 灾难恢复演练 | 每半年 | 全员 |

### 3. 安全建议

**DO (推荐做法):**

- ✅ 加密备份文件(特别是远程传输)
- ✅ 限制备份文件访问权限(chmod 600)
- ✅ 使用专用备份用户,最小权限原则
- ✅ 定期轮换备份密钥
- ✅ 监控备份任务执行状态
- ✅ 记录备份和恢复操作日志
- ✅ 异地存储关键备份
- ✅ 自动化备份流程

**DON'T (避免做法):**

- ❌ 不要在生产高峰期执行全量备份
- ❌ 不要将备份文件存储在同一物理设备
- ❌ 不要忽略备份验证
- ❌ 不要在备份脚本中硬编码密码
- ❌ 不要忽略备份失败告警
- ❌ 不要长期不演练恢复流程
- ❌ 不要备份临时文件和缓存
- ❌ 不要过度依赖自动备份(定期人工检查)

### 4. 性能优化

**MySQL 备份优化:**

```bash
# 使用并行压缩
mysqldump ... | pigz -p 4 > backup.sql.gz

# 分表备份(大表)
for table in $(mysql -N -e "SHOW TABLES FROM ${DB}"); do
    mysqldump ${DB} ${table} | gzip > ${table}.sql.gz
done

# 使用 mydumper (多线程)
mydumper -h 127.0.0.1 -u backup_user -p password \
    -B ryplus_uni_workflow \
    -o /backup/mysql \
    -t 4 \
    -c
```

**网络传输优化:**

```bash
# 使用 rsync 增量传输
rsync -avz --bwlimit=10000 /backup/ remote:/backup/

# 使用 ssh 压缩传输
tar -czf - /backup/mysql | ssh remote "cat > /backup/mysql.tar.gz"

# 分片上传到对象存储
split -b 1G backup.sql.gz backup.part_
for part in backup.part_*; do
    mc cp ${part} remote/bucket/
done
```

### 5. 常见问题

**问题 1: 备份时间过长影响业务**

**解决方案:**
- 使用增量备份代替频繁全量备份
- 优化备份时间窗口(业务低峰期)
- 使用 `--single-transaction` 避免锁表
- 考虑使用物理备份工具(XtraBackup)

**问题 2: 备份文件占用空间过大**

**解决方案:**
- 启用压缩(`gzip`、`pigz`)
- 实施冷热数据分离
- 合理设置保留周期
- 定期清理无用备份

**问题 3: 恢复时间过长**

**解决方案:**
- 定期测试恢复流程,优化恢复脚本
- 使用增量恢复减少数据量
- 提前准备恢复环境
- 考虑使用快照技术

**问题 4: 备份失败未及时发现**

**解决方案:**
- 配置监控告警
- 备份脚本返回明确状态码
- 记录详细日志
- 每日检查备份状态

---

## 附录

### 附录 A: 备份脚本目录结构

```
/opt/backup-scripts/
├── master_backup.sh          # 主备份脚本
├── mysql_full_backup.sh      # MySQL全量备份
├── mysql_incremental_backup.sh  # MySQL增量备份
├── mysql_restore.sh          # MySQL恢复
├── redis_rdb_backup.sh       # Redis备份
├── redis_restore.sh          # Redis恢复
├── minio_full_sync.sh        # MinIO同步
├── minio_restore.sh          # MinIO恢复
├── logs_archive.sh           # 日志归档
├── config_backup.sh          # 配置备份
├── backup_verify.sh          # 备份验证
├── backup_monitor.sh         # 备份监控
├── backup_cleanup.sh         # 备份清理
├── disaster_recovery.sh      # 灾难恢复
└── README.md                 # 使用说明
```

### 附录 B: 备份数据目录结构

```
/backup/
├── mysql/
│   ├── full/                 # 全量备份
│   │   ├── ryplus_uni_workflow_full_20241124_020000.sql.gz
│   │   └── ryplus_uni_workflow_full_20241124_020000.sql.gz.md5
│   ├── incremental/          # 增量备份(binlog)
│   │   └── binlog_20241124_030000.tar.gz
│   └── logs/                 # 备份日志
│       └── backup_20241124_020000.log
├── redis/
│   ├── dump_20241124_020000.rdb.gz
│   └── appendonly_20241124_020000.aof.gz
├── minio/
│   └── export/
│       └── minio_ryplus_20241124_020000.tar.gz
├── logs/
│   ├── ryplus_uni_workflow_20241124.tar.gz
│   └── monitor_20241124.tar.gz
├── configs/                  # Git仓库
│   ├── .git/
│   ├── docker/
│   └── etc/
└── schema/                   # 数据库结构
    └── schema_20241124_020000.sql
```

### 附录 C: 恢复时间估算

| 数据量 | 全量恢复 | 增量恢复 | 总计 |
|--------|---------|---------|------|
| 10GB | 30分钟 | 10分钟 | 40分钟 |
| 50GB | 2小时 | 30分钟 | 2.5小时 |
| 100GB | 4小时 | 1小时 | 5小时 |
| 500GB | 20小时 | 5小时 | 25小时 |

*注: 恢复时间受硬件性能、网络带宽、数据复杂度等因素影响*

---

## 总结

完善的备份策略是保障 RuoYi-Plus-UniApp 项目数据安全的基石。通过本文档介绍的:

1. **分层备份** - MySQL全量+增量、Redis RDB+AOF、MinIO镜像同步
2. **自动化流程** - Systemd定时器、主备份脚本、监控告警
3. **验证机制** - 备份完整性验证、定期恢复演练
4. **灾难恢复** - PITR点时间恢复、完整恢复流程

建议在实际部署中:
- 根据业务重要性调整备份频率和保留周期
- 定期(至少每月)进行恢复演练
- 持续监控备份任务执行状态
- 建立完善的备份管理制度和应急预案
- 定期审查和优化备份策略
