# RAG 检索增强

## 介绍

RAG（Retrieval-Augmented Generation）检索增强生成是一种结合信息检索和生成式 AI 的技术。RagService 为 AI 提供知识库支持，让 AI 能够基于你的文档数据回答问题，大大提升回答的准确性和专业性。通过文档向量化和语义检索，RAG 技术使 AI 能够理解并利用企业私有知识库中的信息。

**核心特性:**

- **文档向量化** - 自动将文档转换为向量表示
- **智能检索** - 根据问题检索最相关的文档片段
- **知识增强** - 基于检索结果生成更准确的回答
- **灵活存储** - 支持内存、Milvus、PgVector 等存储方案
- **文档分块** - 智能分割长文档，保持上下文完整性
- **批量处理** - 支持大批量文档的高效向量化

## 模块架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     RAG 检索增强架构                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      应用层                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐    │   │
│  │  │ ChatService │  │ RagService  │  │ 文档管理接口  │    │   │
│  │  └──────┬──────┘  └──────┬──────┘  └───────┬───────┘    │   │
│  └─────────┼────────────────┼─────────────────┼─────────────┘   │
│            │                │                 │                 │
│            ▼                ▼                 ▼                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     RAG 服务层                           │   │
│  │  ┌───────────────┐    ┌───────────────────────────┐     │   │
│  │  │   RagService  │    │      EmbeddingService     │     │   │
│  │  │   检索增强    │◄──►│      向量嵌入服务         │     │   │
│  │  └───────┬───────┘    └───────────┬───────────────┘     │   │
│  │          │                        │                      │   │
│  │          ▼                        ▼                      │   │
│  │  ┌───────────────┐    ┌───────────────────────────┐     │   │
│  │  │ DocumentSplit │    │     EmbeddingModel        │     │   │
│  │  │   文档分割    │    │     向量模型             │     │   │
│  │  └───────────────┘    └───────────────────────────┘     │   │
│  └──────────────────────────────┬───────────────────────────┘   │
│                                 │                               │
│                                 ▼                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     向量存储层                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │   │
│  │  │   Memory   │  │   Milvus   │  │     PgVector     │   │   │
│  │  │   内存     │  │   向量库   │  │   PostgreSQL     │   │   │
│  │  └────────────┘  └────────────┘  └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 核心组件说明

| 组件 | 类名 | 职责 |
|------|------|------|
| RAG 服务 | `RagService` | 文档管理、向量检索、RAG 提示词构建 |
| 嵌入服务 | `EmbeddingService` | 文本向量化、批量嵌入、相似度计算 |
| 文档分割 | `DocumentSplitters` | 长文档智能分割，保持上下文完整性 |
| 向量存储 | `EmbeddingStore` | 向量数据的存储和检索 |
| 知识文档 | `KnowledgeDocument` | 知识库文档实体管理 |

### 数据流转图

```
┌──────────────────────────────────────────────────────────────────┐
│                      文档导入流程                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   原始文档                                                        │
│      │                                                           │
│      ▼                                                           │
│  ┌───────────────┐                                               │
│  │   文档分割    │ ───► 按 chunkSize 分割，chunkOverlap 重叠     │
│  └───────┬───────┘                                               │
│          │                                                       │
│          ▼                                                       │
│  ┌───────────────┐                                               │
│  │  文本向量化   │ ───► EmbeddingService.embedSegments()         │
│  └───────┬───────┘                                               │
│          │                                                       │
│          ▼                                                       │
│  ┌───────────────┐                                               │
│  │  向量存储     │ ───► EmbeddingStore.addAll()                  │
│  └───────────────┘                                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      检索问答流程                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   用户问题                                                        │
│      │                                                           │
│      ▼                                                           │
│  ┌───────────────┐                                               │
│  │  问题向量化   │ ───► EmbeddingService.embed()                 │
│  └───────┬───────┘                                               │
│          │                                                       │
│          ▼                                                       │
│  ┌───────────────┐                                               │
│  │  向量检索     │ ───► EmbeddingStore.search()                  │
│  └───────┬───────┘                                               │
│          │                                                       │
│          ▼                                                       │
│  ┌───────────────┐                                               │
│  │  构建提示词   │ ───► buildRagPrompt()                         │
│  └───────┬───────┘                                               │
│          │                                                       │
│          ▼                                                       │
│  ┌───────────────┐                                               │
│  │  AI 生成回答  │ ───► ChatService.chat()                       │
│  └───────────────┘                                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 工作原理

```
用户问题 → 向量化 → 检索相关文档 → 构建提示词 → AI生成回答
```

**详细流程:**

1. **文档准备**: 将文档按配置的分块大小进行分割，每个分块转换为向量存储
2. **问题检索**: 将用户问题转换为向量，在向量库中检索最相似的文档片段
3. **上下文增强**: 将检索到的文档片段作为上下文组装成增强提示词
4. **生成回答**: AI 基于增强的上下文生成准确、专业的回答

### 向量检索原理

```
┌─────────────────────────────────────────────────────────────────┐
│                      向量检索原理                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  用户问题: "Spring Boot 有哪些特性?"                             │
│                                                                 │
│         ▼ 向量化                                                │
│                                                                 │
│  问题向量: [0.12, -0.34, 0.56, ..., 0.78]                       │
│                                                                 │
│         ▼ 余弦相似度计算                                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 文档1向量: [0.11, -0.33, 0.55, ...]  相似度: 0.95        │   │
│  │ 文档2向量: [0.45, -0.12, 0.23, ...]  相似度: 0.72        │   │
│  │ 文档3向量: [-0.08, 0.67, -0.11, ...]  相似度: 0.45       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         ▼ 按相似度排序，过滤低于 minScore 的结果                  │
│                                                                 │
│  返回: 文档1 (相似度 0.95), 文档2 (相似度 0.72)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

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

## 核心实现

### RagService 实现

```java
/**
 * RAG检索增强生成服务
 * 提供文档向量化、检索等功能
 */
@Slf4j
public class RagService {

    private final LangChain4jProperties properties;
    private final EmbeddingService embeddingService;
    private final EmbeddingStore<TextSegment> embeddingStore;

    /**
     * 添加文档到向量库
     */
    public void addDocument(String documentId, String content) {
        // 1. 分割文档
        List<TextSegment> segments = splitDocument(content, documentId);

        // 2. 批量向量化
        List<Embedding> embeddings = embeddingService.embedSegments(segments);

        // 3. 存储到向量库
        embeddingStore.addAll(embeddings, segments);

        log.info("Added document {} with {} segments", documentId, segments.size());
    }

    /**
     * 检索相关文档
     */
    public List<DocumentReference> retrieve(String query, int maxResults) {
        // 1. 向量化查询
        List<Float> queryEmbedding = embeddingService.embed(query);

        // 2. 转换为 Embedding 对象
        float[] floatArray = new float[queryEmbedding.size()];
        for (int i = 0; i < queryEmbedding.size(); i++) {
            floatArray[i] = queryEmbedding.get(i);
        }
        Embedding embedding = new Embedding(floatArray);

        // 3. 向量检索
        List<EmbeddingMatch<TextSegment>> matches = embeddingStore.search(
            EmbeddingSearchRequest.builder()
                .queryEmbedding(embedding)
                .maxResults(maxResults)
                .minScore(properties.getRag().getMinScore())
                .build()
        ).matches();

        // 4. 转换为响应对象
        return matches.stream()
            .map(this::convertToReference)
            .collect(Collectors.toList());
    }

    /**
     * 构建RAG提示词
     */
    public String buildRagPrompt(String query, List<DocumentReference> references) {
        if (CollUtil.isEmpty(references)) {
            return query;
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("参考以下信息回答问题：\n\n");

        for (int i = 0; i < references.size(); i++) {
            DocumentReference ref = references.get(i);
            prompt.append(String.format("[文档%d] %s\n", i + 1, ref.getContent()));
        }

        prompt.append("\n问题：").append(query);
        prompt.append("\n\n请基于以上参考信息，准确、详细地回答问题。");
        prompt.append("如果参考信息不足以回答问题，请明确说明。");

        return prompt.toString();
    }

    /**
     * 分割文档
     */
    private List<TextSegment> splitDocument(String content, String documentId) {
        // 创建元数据
        Metadata metadata = new Metadata();
        metadata.put("id", documentId);

        Document document = Document.from(content, metadata);

        // 使用递归分割器
        DocumentSplitter splitter = DocumentSplitters.recursive(
            properties.getRag().getChunkSize(),
            properties.getRag().getChunkOverlap()
        );

        return splitter.split(document);
    }
}
```

### EmbeddingService 实现

```java
/**
 * 向量嵌入服务
 * 将文本转换为向量表示
 */
@Slf4j
public class EmbeddingService {

    private final LangChain4jProperties properties;
    private volatile EmbeddingModel embeddingModel;

    /**
     * 嵌入单个文本
     */
    public List<Float> embed(String text) {
        Response<Embedding> response = getEmbeddingModel().embed(text);
        return response.content().vectorAsList();
    }

    /**
     * 批量嵌入文本段落
     */
    public List<Embedding> embedSegments(List<TextSegment> segments) {
        if (CollUtil.isEmpty(segments)) {
            return List.of();
        }

        int batchSize = properties.getEmbedding().getBatchSize();
        List<Embedding> allEmbeddings = CollUtil.newArrayList();

        // 分批处理，避免单次请求过大
        for (int i = 0; i < segments.size(); i += batchSize) {
            int end = Math.min(i + batchSize, segments.size());
            List<TextSegment> batch = segments.subList(i, end);

            Response<List<Embedding>> response = getEmbeddingModel().embedAll(batch);
            allEmbeddings.addAll(response.content());

            log.debug("Embedded batch {}-{} of {}", i, end, segments.size());
        }

        return allEmbeddings;
    }

    /**
     * 计算余弦相似度
     */
    public double cosineSimilarity(List<Float> vector1, List<Float> vector2) {
        if (vector1.size() != vector2.size()) {
            throw new IllegalArgumentException("Vector dimensions must match");
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < vector1.size(); i++) {
            dotProduct += vector1.get(i) * vector2.get(i);
            norm1 += vector1.get(i) * vector1.get(i);
            norm2 += vector2.get(i) * vector2.get(i);
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * 创建嵌入模型
     */
    private EmbeddingModel createEmbeddingModel() {
        String provider = properties.getDefaultProvider();

        return switch (provider) {
            case "openai", "deepseek" -> createOpenAiEmbeddingModel();
            default -> createLocalEmbeddingModel();
        };
    }

    private EmbeddingModel createOpenAiEmbeddingModel() {
        var config = properties.getOpenai();

        return OpenAiEmbeddingModel.builder()
            .apiKey(config.getApiKey())
            .baseUrl(config.getBaseUrl())
            .modelName(properties.getEmbedding().getModelName())
            .timeout(properties.getTimeout())
            .maxRetries(properties.getMaxRetries())
            .logRequests(log.isDebugEnabled())
            .logResponses(log.isDebugEnabled())
            .build();
    }
}
```

## 数据传输对象

### DocumentReference 文档引用

```java
/**
 * 文档引用 - 检索结果
 */
@Data
public class DocumentReference implements Serializable {

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 文档名称
     */
    private String documentName;

    /**
     * 文档内容（检索到的片段）
     */
    private String content;

    /**
     * 相似度分数 (0-1)
     */
    private Double score;
}
```

### KnowledgeDocument 知识文档

```java
/**
 * 知识文档实体
 */
@Data
@Accessors(chain = true)
public class KnowledgeDocument implements Serializable {

    /**
     * 文档ID
     */
    private Long id;

    /**
     * 知识库ID
     */
    private Long knowledgeBaseId;

    /**
     * 文档名称
     */
    private String name;

    /**
     * 文档内容
     */
    private String content;

    /**
     * 文件路径
     */
    private String filePath;

    /**
     * 文档类型
     */
    private String fileType;

    /**
     * 文件大小
     */
    private Long fileSize;

    /**
     * 分块数量
     */
    private Integer chunkCount;

    /**
     * 向量化状态: 0-待处理, 1-处理中, 2-已完成, 3-失败
     */
    private Integer embeddingStatus;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
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

    @Autowired
    private ChatService chatService;

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
                常见问题: %s
                """,
                product.getName(),
                product.getCategory(),
                product.getPrice(),
                product.getDescription(),
                product.getManual(),
                product.getFaq()
            );

            ragService.addDocument("product-" + product.getId(), content);
        }
    }

    /**
     * 客服问答
     */
    public String customerService(String userId, String question) {
        // 先检索相关文档
        List<DocumentReference> docs = ragService.retrieve(question, 3);

        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setSessionId("customer-" + userId)
            .setSystemPrompt("你是一个专业的产品客服，基于产品知识库回答客户问题。")
            .setMessage(ragService.buildRagPrompt(question, docs))
            .setMode(ChatMode.CONTINUOUS)
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

    @Autowired
    private ChatService chatService;

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

        // 导入请假流程
        ragService.addDocument("leave", loadDocument("请假流程.pdf"));
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
            .setSystemPrompt("""
                你是企业规章制度咨询助手。
                请基于提供的规章制度文档准确回答问题。
                如果文档中没有相关信息，请明确告知用户。
                """)
            .setMessage("参考资料:\n" + context + "\n\n问题：" + question)
            .setMode(ChatMode.SINGLE)
            .setStream(false);

        return chatService.chat(request).getContent();
    }

    private String loadDocument(String filename) {
        // 实现文档加载逻辑（PDF解析等）
        return "...";
    }
}
```

### 带引用的问答系统

```java
@Service
@RequiredArgsConstructor
public class ReferenceQAService {

    private final RagService ragService;
    private final ChatService chatService;

    /**
     * 带引用的问答
     */
    public QAResult answerWithReferences(String question) {
        // 1. 检索相关文档
        List<DocumentReference> references = ragService.retrieve(question, 5);

        if (references.isEmpty()) {
            return new QAResult("抱歉，未找到相关信息。", List.of());
        }

        // 2. 构建 RAG 提示词
        String prompt = ragService.buildRagPrompt(question, references);

        // 3. 调用 AI 生成回答
        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setMessage(prompt)
            .setMode(ChatMode.SINGLE)
            .setTemperature(0.3)
            .setStream(false);

        ChatResponse response = chatService.chat(request);

        // 4. 返回回答和引用
        return new QAResult(response.getContent(), references);
    }

    @Data
    @AllArgsConstructor
    public static class QAResult {
        private String answer;
        private List<DocumentReference> references;
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

### 嵌入配置

```yaml
langchain4j:
  embedding:
    # 嵌入模型名称
    model-name: text-embedding-3-small

    # 向量维度
    dimension: 1536

    # 批处理大小
    batch-size: 100
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

### 不同场景配置示例

```yaml
# 开发环境 - 内存存储
langchain4j:
  rag:
    enabled: true
    vector-store-type: memory
    chunk-size: 500
    min-score: 0.6

# 生产环境 - Milvus
langchain4j:
  rag:
    enabled: true
    vector-store-type: milvus
    chunk-size: 500
    min-score: 0.7
    milvus:
      host: milvus-server
      port: 19530
      collection-name: knowledge_base

# 高精度场景
langchain4j:
  rag:
    min-score: 0.85     # 高相似度阈值
    max-results: 3      # 只返回最相关的
    chunk-size: 300     # 更小的分块

# 高召回场景
langchain4j:
  rag:
    min-score: 0.5      # 低相似度阈值
    max-results: 10     # 返回更多结果
    chunk-size: 800     # 更大的分块
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
    Long documentId;     // 文档ID
    String documentName; // 文档名称
    String content;      // 文档内容
    Double score;        // 相似度分数
}
```

### 构建提示词

```java
// 构建 RAG 增强提示词
String ragPrompt = ragService.buildRagPrompt(String query, List<DocumentReference> references)
```

### 删除文档

```java
// 删除指定文档
ragService.removeDocument(String docId)

// 清空所有文档
ragService.clearAll()
```

## 文档分块策略

### 分块参数说明

```
┌─────────────────────────────────────────────────────────────────┐
│                      文档分块示意图                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  原始文档（2000字符）:                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ AAAAAAAAAA BBBBBBBBBB CCCCCCCCCC DDDDDDDDDD EEEEEEEEEE │   │
│  │ FFFFFFFFFF GGGGGGGGGG HHHHHHHHHH IIIIIIIIII JJJJJJJJJJ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  配置: chunk-size=500, chunk-overlap=50                         │
│                                                                 │
│  分块结果:                                                       │
│  ┌────────────────────┐                                         │
│  │ 块1: AAAA...BBBB   │  (0-500字符)                           │
│  └────────────────────┘                                         │
│         ┌────────────────────┐                                  │
│         │ 块2: BBBB...CCCC   │  (450-950字符，重叠50字符)       │
│         └────────────────────┘                                  │
│                ┌────────────────────┐                           │
│                │ 块3: CCCC...DDDD   │  (900-1400字符)           │
│                └────────────────────┘                           │
│                       ┌────────────────────┐                    │
│                       │ 块4: DDDD...EEEE   │  (1350-1850字符)   │
│                       └────────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 分块大小选择指南

| 场景 | chunk-size | chunk-overlap | 说明 |
|------|------------|---------------|------|
| 短文本（FAQ） | 200-300 | 20-30 | 问答内容简短，小分块 |
| 技术文档 | 400-600 | 50-80 | 保持代码块完整 |
| 长文章 | 800-1200 | 100-150 | 保持段落完整性 |
| 对话记录 | 300-500 | 30-50 | 保持对话上下文 |

## 向量存储对比

```
┌─────────────────────────────────────────────────────────────────┐
│                      向量存储方案对比                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Memory    │  │    Milvus    │  │      PgVector        │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────────────┤  │
│  │ ✓ 零配置    │  │ ✓ 高性能    │  │ ✓ 与数据库集成       │  │
│  │ ✓ 快速启动  │  │ ✓ 大规模    │  │ ✓ 事务支持           │  │
│  │ ✓ 开发调试  │  │ ✓ 分布式    │  │ ✓ SQL查询            │  │
│  │ ✗ 重启丢失  │  │ ✗ 需独立部署│  │ ✗ 性能相对较低       │  │
│  │ ✗ 容量受限  │  │ ✗ 运维复杂  │  │ ✗ 大规模性能下降     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  推荐场景:                                                       │
│  Memory: 开发测试、原型验证、小规模（<10万向量）                  │
│  Milvus: 生产环境、大规模（百万级向量）、高性能要求              │
│  PgVector: 已有 PostgreSQL、中等规模、需要关系查询               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
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
// 添加结构化信息提高检索质量
String content = String.format("""
    标题: %s
    分类: %s
    关键词: %s
    摘要: %s
    正文: %s
    """,
    title, category, keywords, summary, body
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

### 6. 监控检索质量

```java
@Aspect
@Component
@Slf4j
public class RagQualityMonitor {

    @Around("execution(* *..RagService.retrieve(..))")
    public Object monitorRetrieval(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = pjp.proceed();

        List<DocumentReference> refs = (List<DocumentReference>) result;
        long duration = System.currentTimeMillis() - startTime;

        // 记录检索质量
        if (refs.isEmpty()) {
            log.warn("RAG检索无结果，耗时: {}ms", duration);
        } else {
            double avgScore = refs.stream()
                .mapToDouble(DocumentReference::getScore)
                .average()
                .orElse(0.0);
            log.info("RAG检索结果: {}条，平均相似度: {:.2f}，耗时: {}ms",
                refs.size(), avgScore, duration);
        }

        return result;
    }
}
```

### 7. 处理大文档

```java
/**
 * 导入大文档（分批处理）
 */
public void importLargeDocument(String docId, String content) {
    // 对于超大文档，先进行预处理
    if (content.length() > 100000) {
        // 按章节或段落分割
        List<String> sections = splitBySections(content);

        for (int i = 0; i < sections.size(); i++) {
            String sectionId = docId + "-section-" + i;
            ragService.addDocument(sectionId, sections.get(i));
        }
    } else {
        ragService.addDocument(docId, content);
    }
}
```

### 8. 多知识库管理

```java
/**
 * 多知识库检索
 */
public List<DocumentReference> searchMultipleKnowledgeBases(
    String query,
    List<Long> knowledgeBaseIds) {

    List<DocumentReference> allResults = new ArrayList<>();

    for (Long kbId : knowledgeBaseIds) {
        // 设置当前知识库上下文
        setCurrentKnowledgeBase(kbId);

        // 检索
        List<DocumentReference> results = ragService.retrieve(query, 3);
        allResults.addAll(results);
    }

    // 按相似度排序，取前N个
    return allResults.stream()
        .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
        .limit(5)
        .collect(Collectors.toList());
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
- 嵌入模型响应慢

**解决：**

```yaml
# 使用 Milvus
rag:
  vector-store-type: milvus

# 增加批处理大小
embedding:
  batch-size: 200
```

### 3. 文档内容过长

**解决：**
- 自动分块处理，无需手动切分
- 调整 `chunk-size` 参数
- 对超长文档进行预处理

```java
// 对超长文档进行预处理
if (content.length() > 50000) {
    // 按章节分割
    List<String> chapters = splitByChapters(content);
    for (String chapter : chapters) {
        ragService.addDocument(docId + "-" + index, chapter);
    }
}
```

### 4. 如何导入 PDF 文档

使用文档解析库：

```java
// 使用 Apache PDFBox
public String extractTextFromPdf(File pdfFile) throws IOException {
    try (PDDocument document = PDDocument.load(pdfFile)) {
        PDFTextStripper stripper = new PDFTextStripper();
        return stripper.getText(document);
    }
}

// 导入
String content = extractTextFromPdf(pdfFile);
ragService.addDocument(docId, content);
```

### 5. 检索结果重复

**原因：**
- 分块重叠导致相似内容
- 相同文档被多次导入

**解决：**

```java
// 检索后去重
List<DocumentReference> uniqueResults = results.stream()
    .filter(distinctByKey(ref -> ref.getContent().hashCode()))
    .collect(Collectors.toList());

private static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
    Set<Object> seen = ConcurrentHashMap.newKeySet();
    return t -> seen.add(keyExtractor.apply(t));
}
```

### 6. 向量维度不匹配

**原因：**
- 更换了嵌入模型
- 配置的维度与模型不一致

**解决：**

```yaml
embedding:
  model-name: text-embedding-3-small
  dimension: 1536  # 确保与模型匹配
```

```java
// 更换模型后清空重建索引
ragService.clearAll();
reimportAllDocuments();
```

### 7. 嵌入 API 调用失败

**原因：**
- API 密钥无效
- 网络问题
- 请求频率过高

**解决：**

```yaml
langchain4j:
  max-retries: 5          # 增加重试次数
  timeout: 120s           # 增加超时时间

embedding:
  batch-size: 50          # 减小批处理大小
```

### 8. 检索结果不相关

**解决思路：**

1. 检查文档内容质量
2. 调整分块策略
3. 优化提示词构建
4. 考虑使用混合检索（关键词+向量）

```java
// 混合检索示例
public List<DocumentReference> hybridSearch(String query) {
    // 向量检索
    List<DocumentReference> vectorResults = ragService.retrieve(query, 5);

    // 关键词检索（假设有实现）
    List<DocumentReference> keywordResults = keywordSearch(query, 5);

    // 合并结果
    return mergeAndRank(vectorResults, keywordResults);
}
```

## 总结

RAG 技术让 AI 能够基于你的私有知识库回答问题，大大提升了回答的准确性和专业性。通过合理配置和使用 RagService，你可以快速构建出强大的知识库问答系统。

**核心要点:**

1. **合理分块** - 根据文档类型选择合适的分块大小和重叠
2. **质量监控** - 监控检索质量，及时调整参数
3. **持久化存储** - 生产环境使用 Milvus 等专业向量数据库
4. **定期更新** - 定期同步最新文档，保持知识库时效性
5. **结构化内容** - 添加标题、分类等结构化信息提高检索质量
