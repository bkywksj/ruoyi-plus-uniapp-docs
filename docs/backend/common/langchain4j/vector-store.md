# 向量存储

## 介绍

向量存储是 RAG 系统的核心组件，用于存储文档的向量表示并提供高效的相似度检索功能。RuoYi-Plus 支持多种向量存储方案，满足不同场景的需求。

**核心特性:**

- **多存储支持** - 内存、Milvus、PgVector 三种方案
- **高效检索** - 基于向量相似度的快速检索
- **灵活切换** - 通过配置轻松切换存储方案
- **生产就绪** - Milvus 方案适合大规模生产环境

## 存储方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **内存存储** | 开发测试 | 零配置、启动快 | 数据不持久、容量有限 |
| **Milvus** | 大规模生产 | 高性能、分布式、支持海量数据 | 需要独立部署 |
| **PgVector** | 中小规模 | 利用现有 PostgreSQL | 性能略低于 Milvus |

## 内存存储

### 适用场景

- 开发和测试环境
- 文档数量少（< 1万）
- 对数据持久化无要求

### 配置

```yaml
langchain4j:
  rag:
    enabled: true
    vector-store-type: memory  # 使用内存存储
```

### 特点

- <Ok/> 零配置，开箱即用
- <Ok/> 启动速度快
- <No/> 重启后数据丢失
- <No/> 不支持分布式
- <No/> 内存容量有限

### 使用示例

```java
@Service
public class MemoryVectorService {

    @Autowired
    private RagService ragService;

    // 添加文档（存储在内存中）
    public void addDocuments() {
        ragService.addDocument("doc-1", "Spring Boot 文档内容...");
        ragService.addDocument("doc-2", "MyBatis 文档内容...");
        ragService.addDocument("doc-3", "Redis 文档内容...");
    }

    // 检索文档
    public List<DocumentReference> search(String query) {
        return ragService.retrieve(query, 5);
    }
}
```

## Milvus 存储

### 适用场景

- 生产环境
- 文档数量大（> 10万）
- 需要高性能检索
- 分布式部署

### 安装 Milvus

使用 Docker 快速部署：

```bash
# 下载 docker-compose 配置
wget https://github.com/milvus-io/milvus/releases/download/v2.3.0/milvus-standalone-docker-compose.yml -O docker-compose.yml

# 启动 Milvus
docker-compose up -d

# 检查状态
docker-compose ps
```

### 配置

```yaml
langchain4j:
  rag:
    enabled: true
    vector-store-type: milvus

    # Milvus 配置
    milvus:
      host: localhost
      port: 19530
      collection-name: documents
      database-name: default
```

### 特点

- <Ok/> 高性能，支持十亿级向量
- <Ok/> 分布式架构，可水平扩展
- <Ok/> 数据持久化
- <Ok/> 支持多种索引类型
- <No/> 需要独立部署和维护

### 使用示例

```java
@Service
public class MilvusVectorService {

    @Autowired
    private RagService ragService;

    /**
     * 批量导入大量文档
     */
    public void importLargeDataset(List<Document> documents) {
        log.info("开始导入 {} 个文档", documents.size());

        // 批量添加到 Milvus
        ragService.addDocuments(documents);

        log.info("文档导入完成");
    }

    /**
     * 高性能检索
     */
    public List<DocumentReference> searchWithHighPerformance(String query) {
        long startTime = System.currentTimeMillis();

        List<DocumentReference> results = ragService.retrieve(query, 10);

        long duration = System.currentTimeMillis() - startTime;
        log.info("检索耗时: {}ms", duration);

        return results;
    }
}
```

### 性能优化

```yaml
langchain4j:
  rag:
    milvus:
      # 连接池配置
      max-connections: 100
      # 超时设置
      timeout: 30s
      # 批量导入大小
      batch-size: 1000
```

## PgVector 存储

### 适用场景

- 已使用 PostgreSQL 数据库
- 中小规模应用（< 100万文档）
- 希望简化架构，不引入新组件

### 安装 PgVector

```sql
-- 启用 pgvector 扩展
CREATE EXTENSION vector;

-- 创建文档表
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding VECTOR(1536),
    metadata JSONB
);

-- 创建向量索引
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

### 配置

```yaml
langchain4j:
  rag:
    enabled: true
    vector-store-type: pgvector

# PostgreSQL 配置
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: postgres
    password: your-password
```

### 特点

- <Ok/> 利用现有 PostgreSQL 基础设施
- <Ok/> 数据持久化
- <Ok/> 支持 SQL 查询
- <Ok/> 无需额外部署
- <No/> 性能略低于专业向量数据库

### 使用示例

```java
@Service
public class PgVectorService {

    @Autowired
    private RagService ragService;

    /**
     * 导入文档到 PgVector
     */
    public void importDocuments(List<String> contents) {
        for (int i = 0; i < contents.size(); i++) {
            ragService.addDocument("doc-" + i, contents.get(i));
        }
    }

    /**
     * 组合查询（向量 + SQL）
     */
    public List<DocumentReference> hybridSearch(String query, String category) {
        // 向量检索
        List<DocumentReference> results = ragService.retrieve(query, 20);

        // 根据元数据过滤（这里简化处理）
        return results.stream()
            .filter(doc -> matchCategory(doc, category))
            .limit(5)
            .collect(Collectors.toList());
    }

    private boolean matchCategory(DocumentReference doc, String category) {
        // 检查文档元数据中的分类
        return true; // 实际实现根据业务逻辑
    }
}
```

## 存储方案选择

### 开发环境

```yaml
langchain4j:
  rag:
    vector-store-type: memory  # 快速开发
```

### 小型应用（< 10万文档）

```yaml
langchain4j:
  rag:
    vector-store-type: pgvector  # 利用现有数据库
```

### 大型应用（> 10万文档）

```yaml
langchain4j:
  rag:
    vector-store-type: milvus  # 专业向量数据库
```

## 数据管理

### 批量导入

```java
@Service
public class VectorDataManager {

    @Autowired
    private RagService ragService;

    /**
     * 从数据库批量导入
     */
    public void importFromDatabase() {
        List<Article> articles = articleRepository.findAll();

        for (Article article : articles) {
            String content = String.format("""
                标题: %s
                分类: %s
                内容: %s
                """,
                article.getTitle(),
                article.getCategory(),
                article.getContent()
            );

            ragService.addDocument("article-" + article.getId(), content);
        }

        log.info("导入完成: {} 篇文章", articles.size());
    }

    /**
     * 从文件批量导入
     */
    public void importFromFiles(String directory) throws IOException {
        Files.walk(Paths.get(directory))
            .filter(Files::isRegularFile)
            .filter(path -> path.toString().endsWith(".txt"))
            .forEach(path -> {
                try {
                    String content = Files.readString(path);
                    String docId = path.getFileName().toString();
                    ragService.addDocument(docId, content);
                } catch (IOException e) {
                    log.error("导入失败: {}", path, e);
                }
            });
    }
}
```

### 增量更新

```java
/**
 * 增量更新文档
 */
public void updateDocument(String docId, String newContent) {
    // 删除旧文档
    ragService.removeDocument(docId);

    // 添加新文档
    ragService.addDocument(docId, newContent);
}
```

### 定期清理

```java
/**
 * 清理过期文档
 */
@Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨3点
public void cleanExpiredDocuments() {
    // 清空所有文档
    ragService.clearAll();

    // 重新导入最新数据
    importFromDatabase();

    log.info("文档库已更新");
}
```

## 性能对比

### 检索性能测试

| 存储方案 | 文档数量 | 检索时间 | 说明 |
|---------|---------|---------|------|
| 内存 | 1,000 | 10ms | 快速 |
| 内存 | 10,000 | 50ms | 一般 |
| 内存 | 100,000 | 300ms | 较慢 |
| PgVector | 100,000 | 100ms | 中等 |
| Milvus | 100,000 | 30ms | 快速 |
| Milvus | 1,000,000 | 50ms | 快速 |

### 容量对比

| 存储方案 | 推荐容量 | 最大容量 |
|---------|---------|---------|
| 内存 | < 10,000 | 受内存限制 |
| PgVector | < 1,000,000 | 数百万 |
| Milvus | 无限制 | 数十亿 |

## 最佳实践

### 1. 选择合适的存储方案

```yaml
# 开发测试
vector-store-type: memory

# 中小应用
vector-store-type: pgvector

# 大型应用
vector-store-type: milvus
```

### 2. 合理设置批量大小

```java
// Milvus 批量导入
List<String> batch = new ArrayList<>();
for (String doc : documents) {
    batch.add(doc);

    if (batch.size() >= 1000) {
        // 批量处理
        processBatch(batch);
        batch.clear();
    }
}
```

### 3. 监控存储性能

```java
@Slf4j
@Component
public class VectorStoreMonitor {

    @Scheduled(fixedRate = 60000)  // 每分钟
    public void checkPerformance() {
        long startTime = System.currentTimeMillis();

        // 测试检索性能
        ragService.retrieve("测试查询", 10);

        long duration = System.currentTimeMillis() - startTime;

        if (duration > 1000) {
            log.warn("向量检索性能下降: {}ms", duration);
        }
    }
}
```

### 4. 定期备份数据

```bash
# 备份 Milvus 数据
milvus-backup backup --collection documents

# 备份 PgVector 数据
pg_dump -t documents > documents_backup.sql
```

## 常见问题

### 1. 如何切换存储方案

修改配置文件并重启应用：

```yaml
langchain4j:
  rag:
    vector-store-type: milvus  # 从 memory 切换到 milvus
```

### 2. 数据如何迁移

```java
// 从内存导出
List<DocumentReference> docs = ragService.retrieveAll();

// 切换到 Milvus
// 修改配置: vector-store-type: milvus

// 重新导入
for (DocumentReference doc : docs) {
    ragService.addDocument(doc.getId(), doc.getContent());
}
```

### 3. Milvus 连接失败

检查 Milvus 服务状态：

```bash
docker-compose ps
docker-compose logs milvus-standalone
```

### 4. PgVector 性能慢

创建向量索引：

```sql
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## 总结

选择合适的向量存储方案对 RAG 系统的性能至关重要。开发阶段使用内存存储快速迭代，生产环境根据数据规模选择 PgVector 或 Milvus，确保系统的稳定性和高性能。
