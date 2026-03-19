# Hybrid Search Architecture

## System Overview

The twodirect hybrid search system combines traditional text-based search with AI-powered multimodal embedding search to provide the best search experience.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                         (Next.js App)                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Text Search  │  │ Image Upload │  │ Voice Search │        │
│  │   Input      │  │   (Camera)   │  │  (Future)    │        │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘        │
└─────────┼──────────────────┼──────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Search API Layer                             │
│                  (Next.js API Routes)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  /api/products/search (GET)                              │ │
│  │  - Primary: Text-based search (ILIKE)                    │ │
│  │  - Secondary: Embedding similarity (if < 5 results)      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  /api/products/search-by-image (POST)                    │ │
│  │  - Image embedding generation                            │ │
│  │  - Visual similarity search                              │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────┬───────────────────────────────┬─────────────────────┘
          │                               │
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│  Supabase Database  │         │   Embedding Service         │
│   (PostgreSQL +     │◄────────┤   (FastAPI + Jina CLIP)     │
│     pgvector)       │         │                             │
│                     │         │  ┌────────────────────────┐ │
│  ┌──────────────┐  │         │  │ Jina CLIP v2 Model     │ │
│  │  Products    │  │         │  │ - 900M parameters      │ │
│  │  ├─ name     │  │         │  │ - 89 languages         │ │
│  │  ├─ name_th  │  │         │  │ - 512x512 images       │ │
│  │  ├─ text_emb │  │         │  │ - 768-dim embeddings   │ │
│  │  └─ img_emb  │  │         │  └────────────────────────┘ │
│  └──────────────┘  │         │                             │
│                     │         │  Endpoints:                 │
│  ┌──────────────┐  │         │  - POST /api/embed/text     │
│  │  Branches    │  │         │  - POST /api/embed/image    │
│  └──────────────┘  │         │  - POST /api/search/similar │
│                     │         └─────────────────────────────┘
│  ┌──────────────┐  │
│  │  Inventory   │  │
│  └──────────────┘  │
└─────────────────────┘
```

## Search Flow

### 1. Text Search Flow

```
User enters query "โค้ก"
    │
    ▼
Next.js API: /api/products/search?query=โค้ก
    │
    ├─► PRIMARY SEARCH (Traditional)
    │   └─► Supabase: SELECT * FROM products 
    │       WHERE name ILIKE '%โค้ก%' OR name_th ILIKE '%โค้ก%'
    │
    ├─► Check result count
    │   │
    │   ├─► If >= 5 results: Return immediately ✅
    │   │
    │   └─► If < 5 results: Trigger SECONDARY SEARCH
    │       │
    │       ├─► Embedding Service: Generate text embedding
    │       │   POST /api/embed/text { "text": "โค้ก" }
    │       │   Returns: [0.123, -0.456, ..., 0.789] (768 dims)
    │       │
    │       └─► Supabase: Vector similarity search
    │           SELECT * FROM search_products_by_embedding(
    │               query_embedding := [0.123, ...],
    │               match_threshold := 0.5,
    │               match_count := 20
    │           )
    │
    └─► Merge results (deduplicate)
        │
        └─► Return to user
```

### 2. Image Search Flow

```
User uploads product image
    │
    ▼
Next.js API: /api/products/search-by-image
    │
    ├─► Embedding Service: Generate image embedding
    │   POST /api/embed/image (multipart/form-data)
    │   │
    │   ├─► Jina CLIP v2: Process image
    │   │   - Resize to 512x512
    │   │   - Normalize
    │   │   - Generate embedding
    │   │
    │   └─► Returns: [0.234, -0.567, ..., 0.890] (768 dims)
    │
    └─► Supabase: Vector similarity search
        SELECT * FROM search_products_by_embedding(
            query_embedding := [0.234, ...],
            match_threshold := 0.6,
            match_count := 20,
            embedding_column := 'image_embedding'
        )
        │
        └─► Return visually similar products
```

## Key Components

### 1. Jina CLIP v2 Model

**Why Jina CLIP v2?**
- **Multimodal**: Handles both text and images in the same embedding space
- **Multilingual**: Supports 89 languages including Thai
- **High Resolution**: 512x512 image processing (vs 224x224 for OpenAI CLIP)
- **Optimized for Search**: Specifically designed for retrieval tasks
- **Free & Open Source**: No API costs, can run locally
- **Efficient**: 900M parameters - good balance of performance and resource usage

### 2. pgvector Extension

**Features:**
- Efficient vector storage and indexing
- Cosine similarity search using `<=>` operator
- IVFFlat index for fast approximate nearest neighbor search
- Native PostgreSQL integration

**Index Configuration:**
```sql
CREATE INDEX idx_products_text_embedding 
ON products 
USING ivfflat (text_embedding vector_cosine_ops)
WITH (lists = 100);
```

### 3. Hybrid Search Strategy

**Priority:**
1. **Primary**: Traditional text search (fast, exact matches)
2. **Secondary**: Embedding search (semantic, fuzzy matches)

**Advantages:**
- Fast response for common queries
- Better results for vague/semantic queries
- Graceful degradation if embedding service is down
- Cost-effective (only use AI when needed)

## Performance Characteristics

### Text Search (Primary)
- **Latency**: 50-100ms
- **Accuracy**: High for exact/partial matches
- **Cost**: Very low (database query)

### Embedding Search (Secondary)
- **Latency**: 200-500ms (includes embedding generation)
- **Accuracy**: High for semantic matches
- **Cost**: Medium (model inference)

### Image Search
- **Latency**: 300-700ms (includes image processing)
- **Accuracy**: High for visual similarity
- **Cost**: Medium (model inference)

## Scalability Considerations

### Current Setup (Development)
- Embedding service: Single instance, CPU
- Database: Supabase free tier
- Suitable for: < 1000 products, < 100 searches/day

### Production Recommendations
- **Embedding Service**: 
  - Deploy on GPU instance (5-10x faster)
  - Use load balancer for multiple instances
  - Implement caching (Redis) for frequent queries
  
- **Database**:
  - Upgrade to Supabase Pro for better performance
  - Optimize pgvector index parameters
  - Consider read replicas for high traffic

- **Monitoring**:
  - Track search latency
  - Monitor embedding service health
  - Log search quality metrics

## Future Enhancements

1. **Automatic Embedding Generation**: Trigger on product insert/update
2. **Embedding Caching**: Cache frequently searched query embeddings
3. **Model Fine-tuning**: Fine-tune on your product catalog
4. **Voice Search**: Add speech-to-text for voice queries
5. **Personalization**: Use user history to improve results
6. **A/B Testing**: Compare traditional vs hybrid search performance

