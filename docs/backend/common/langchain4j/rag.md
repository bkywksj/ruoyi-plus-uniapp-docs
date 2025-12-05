# RAG 检索增强

## 介绍

RAG（Retrieval-Augmented Generation）检索增强生成是一种结合信息检索和生成式 AI 的技术。RagService 为 AI 提供知识库支持，让 AI 能够基于你的文档数据回答问题，大大提升回答的准确性和专业性。

**核心特性:**

- **文档向量化** - 自动将文档转换为向量表示
- **智能检索** - 根据问题检索最相关的文档片段
- **知识增强** - 基于检索结果生成更准确的回答
- **灵活存储** - 支持内存、Milvus、PgVector 等存储方案

## 工作原理

```
用户问题 → 向量化 → 检索相关文档 → 构建提示词 → AI生成回答
```

1. **文档准备**: 将文档分块并向量化存储
2. **问题检索**: 将用户问题向量化，检索相关文档
3. **上下文增强**: 将检索到的文档作为上下文提供给 AI
4. **生成回答**: AI 基于上下文生成准确回答

## 快速开始

### 1. 启用 RAG 功能

```yaml
langchain4j:
  rag:
    enabled: true             # 启用RAG
    max-results: 5            # 检索文档数量
    min-score: 0.7            # 最小相似度
    chunk-size: 500           # 文档分块大小
    chunk-overlap: 50         # 分块重叠大小
    vector-store-type: memory # 向量存储类型
```

### 2. 添加文档

```java
@Autowired
private RagService ragService;

// 添加单个文档
public void addDocument() {
    String docId = "doc-001";
    String content = """
        Spring Boot 是一个基于 Spring 框架的开源项目，
        旨在简化 Spring 应用的初始搭建和开发过程。
        它提供了自动配置、起步依赖等特性。
        """;

    ragService.addDocument(docId, content);
}
```

### 3. 检索文档

```java
// 检索相关文档
public List<DocumentReference> search(String query) {
    return ragService.retrieve(query, 3);
}

// 使用示例
List<DocumentReference> results = search("什么是 Spring Boot？");
for (DocumentReference doc : results) {
    System.out.println("相似度: " + doc.getScore());
    System.out.println("内容: " + doc.getContent());
}
```

### 4. RAG 对话

```java
public String ragChat(String sessionId, String question) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSessionId(sessionId)
        .setMessage(question)
        .setMode(ChatMode.RAG)        // RAG 模式
        .setStream(false);

    ChatResponse response = chatService.chat(request);
    return response.getContent();
}
```

## 实战案例

### 技术文档问答

构建基于技术文档的问答系统：

```java
@Service
@RequiredArgsConstructor
public class TechDocService {

    private final RagService ragService;
    private final ChatService chatService;

    /**
     * 初始化文档库
     */
    @PostConstruct
    public void initDocuments() {
        // 添加 Spring Boot 文档
        ragService.addDocument("spring-boot-intro", """
            Spring Boot 简化了 Spring 应用的开发。
            主要特性包括：
            1. 自动配置
            2. 起步依赖
            3. 内嵌服务器
            4. 生产就绪特性
            """);

        // 添加 MyBatis 文档
        ragService.addDocument("mybatis-intro", """
            MyBatis 是一个优秀的持久层框架。
            它支持自定义 SQL、存储过程和高级映射。
            MyBatis 避免了几乎所有的 JDBC 代码和手动设置参数。
            """);

        // 添加 Redis 文档
        ragService.addDocument("redis-intro", """
            Redis 是一个开源的内存数据结构存储系统。
            可以用作数据库、缓存和消息代理。
            支持字符串、哈希、列表、集合等数据类型。
            """);
    }

    /**
     * 基于文档回答问题
     */
    public String askQuestion(String question) {
        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setMessage(question)
            .setMode(ChatMode.RAG)
            .setStream(false);

        return chatService.chat(request).getContent();
    }
}
```

**使用效果：**

```java
// 问题1
String answer1 = techDocService.askQuestion("Spring Boot 有哪些特性？");
// AI 会基于文档回答：自动配置、起步依赖、内嵌服务器、生产就绪特性

// 问题2
String answer2 = techDocService.askQuestion("什么是 MyBatis？");
// AI 会基于文档准确回答 MyBatis 的定义和特性
```

### 产品知识库

构建产品客服知识库：

```java
@Service
public class ProductKnowledgeService {

    @Autowired
    private RagService ragService;

    /**
     * 批量导入产品文档
     */
    public void importProducts(List<Product> products) {
        for (Product product : products) {
            String content = String.format("""
                产品名称: %s
                产品类别: %s
                产品价格: %s
                产品描述: %s
                使用说明: %s
                """,
                product.getName(),
                product.getCategory(),
                product.getPrice(),
                product.getDescription(),
                product.getManual()
            );

            ragService.addDocument("product-" + product.getId(), content);
        }
    }

    /**
     * 客服问答
     */
    public String customerService(String userId, String question) {
        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setSessionId("customer-" + userId)
            .setSystemPrompt("你是一个专业的产品客服，基于产品知识库回答客户问题。")
            .setMessage(question)
            .setMode(ChatMode.RAG)
            .setStream(false);

        return chatService.chat(request).getContent();
    }
}
```

### 企业规章制度查询

```java
@Service
public class PolicyService {

    @Autowired
    private RagService ragService;

    /**
     * 导入规章制度文档
     */
    public void importPolicies() {
        // 导入员工手册
        ragService.addDocument("handbook", loadDocument("员工手册.pdf"));

        // 导入考勤制度
        ragService.addDocument("attendance", loadDocument("考勤制度.pdf"));

        // 导入薪酬福利
        ragService.addDocument("salary", loadDocument("薪酬福利.pdf"));
    }

    /**
     * 查询规章制度
     */
    public String queryPolicy(String question) {
        // 先检索相关文档
        List<DocumentReference> docs = ragService.retrieve(question, 3);

        // 构建上下文
        String context = docs.stream()
            .map(DocumentReference::getContent)
            .collect(Collectors.joining("\n\n"));

        // 基于上下文回答
        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setSystemPrompt("基于以下规章制度文档回答问题：\n" + context)
            .setMessage(question)
            .setMode(ChatMode.SINGLE)
            .setStream(false);

        return chatService.chat(request).getContent();
    }

    private String loadDocument(String filename) {
        // 实现文档加载逻辑
        return "...";
    }
}
```

## 配置说明

### RAG 配置

```yaml
langchain4j:
  rag:
    # 是否启用 RAG
    enabled: true

    # 检索结果数量
    max-results: 5

    # 最小相似度分数（0-1）
    min-score: 0.7

    # 文档分块大小
    chunk-size: 500

    # 分块重叠大小
    chunk-overlap: 50

    # 向量存储类型: memory, milvus, pgvector
    vector-store-type: memory
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | Boolean | `false` | 是否启用 RAG |
| `max-results` | Integer | `5` | 检索文档数量 |
| `min-score` | Double | `0.7` | 最小相似度（0-1） |
| `chunk-size` | Integer | `500` | 文档分块大小（字符） |
| `chunk-overlap` | Integer | `50` | 分块重叠大小（字符） |
| `vector-store-type` | String | `memory` | 向量存储类型 |

### Milvus 配置

使用 Milvus 作为向量数据库：

```yaml
langchain4j:
  rag:
    vector-store-type: milvus
    milvus:
      host: localhost
      port: 19530
      collection-name: documents
      database-name: default
```

## API 说明

### 添加文档

```java
// 单个文档
ragService.addDocument(String docId, String content)

// 批量文档
ragService.addDocuments(List<Document> documents)
```

### 检索文档

```java
// 检索相关文档
List<DocumentReference> results = ragService.retrieve(String query, int maxResults)

// 文档引用包含
DocumentReference {
    String content;     // 文档内容
    Double score;       // 相似度分数
    Map metadata;       // 文档元数据
}
```

### 删除文档

```java
// 删除指定文档
ragService.removeDocument(String docId)

// 清空所有文档
ragService.clearAll()
```

## 最佳实践

### 1. 合理设置分块大小

```yaml
rag:
  chunk-size: 500      # 一般场景
  # chunk-size: 300    # 短文本场景
  # chunk-size: 1000   # 长文档场景
  chunk-overlap: 50    # 保留上下文连续性
```

### 2. 调整相似度阈值

```yaml
rag:
  min-score: 0.7   # 标准要求
  # min-score: 0.8 # 高精度要求
  # min-score: 0.6 # 召回率优先
```

### 3. 优化文档内容

```java
// 添加结构化信息
String content = String.format("""
    标题: %s
    分类: %s
    关键词: %s
    内容: %s
    """,
    title, category, keywords, body
);
```

### 4. 使用持久化存储

生产环境建议使用 Milvus 或 PgVector：

```yaml
rag:
  vector-store-type: milvus  # 生产环境
  # vector-store-type: memory  # 仅开发环境
```

### 5. 定期更新文档

```java
@Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点
public void updateDocuments() {
    // 清空旧文档
    ragService.clearAll();

    // 重新导入最新文档
    importLatestDocuments();
}
```

## 常见问题

### 1. RAG 效果不好

**原因：**
- 文档分块不合理
- 相似度阈值过高
- 检索数量过少

**解决：**

```yaml
rag:
  chunk-size: 300      # 减小分块
  min-score: 0.6       # 降低阈值
  max-results: 10      # 增加检索数量
```

### 2. 检索速度慢

**原因：**
- 使用内存存储，文档量大
- 未使用专业向量数据库

**解决：**

```yaml
# 使用 Milvus
rag:
  vector-store-type: milvus
```

### 3. 文档内容过长

**解决：**
- 自动分块处理，无需手动切分
- 调整 `chunk-size` 参数

### 4. 如何导入 PDF 文档

使用文档解析库：

```java
// 使用 Apache PDFBox
String content = extractTextFromPdf(pdfFile);
ragService.addDocument(docId, content);
```

## 总结

RAG 技术让 AI 能够基于你的私有知识库回答问题，大大提升了回答的准确性和专业性。通过合理配置和使用 RagService，你可以快速构建出强大的知识库问答系统。
