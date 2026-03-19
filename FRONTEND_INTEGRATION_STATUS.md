# Frontend Integration Status

## ✅ What's Working

### 1. Embedding Service
- ✅ **Service running**: http://localhost:8000
- ✅ **Model loaded**: Jina CLIP v2 (768 dimensions) on MPS device
- ✅ **Database connected**: Connected to Supabase
- ✅ **Health check**: All systems operational

### 2. Frontend Configuration
- ✅ **Environment variable set**: `EMBEDDING_SERVICE_URL=http://localhost:8000` in `web/.env.local`
- ✅ **API route configured**: `web/src/app/api/products/search/route.ts` uses the embedding service
- ✅ **Hybrid search implemented**: 2-tier search (text → embeddings)

### 3. Search Logic
The frontend implements intelligent hybrid search:

1. **Primary Search**: Traditional text-based (ILIKE)
   - Searches `name` and `name_th` columns
   - Fast and works for exact/partial matches

2. **Secondary Search**: Embedding similarity (automatic fallback)
   - Triggers when primary search returns < 5 results
   - Uses semantic similarity for better results
   - Can be forced with `?use_embedding=true` parameter

## ⚠️ Action Required

### Fix Supabase Service Key

The embedding service is using the **publishable key** instead of the **service role key**. This prevents it from writing embeddings to the database.

**To fix:**

1. Get your **service role key** from Supabase:
   - Go to https://supabase.com/dashboard/project/ncjszzjzluhbqavalnty/settings/api
   - Copy the **service_role** key (NOT the anon/publishable key)

2. Update `embedding_service/.env`:
   ```env
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```
   (Replace with your actual service role key - it's much longer than the publishable key)

3. Restart the embedding service:
   ```bash
   cd embedding_service
   # Press Ctrl+C to stop the current service
   ./start.sh
   ```

### Generate Embeddings

Once the service key is fixed, generate embeddings for all products:

```bash
cd embedding_service
./generate_embeddings.sh
```

This will:
- Fetch all products from Supabase
- Generate text embeddings for each product
- Download and process product images
- Generate image embeddings
- Store all embeddings in the database

Expected time: ~2-5 minutes for 10 products

## 🧪 Testing the Frontend

Once embeddings are generated, test the hybrid search:

### 1. Start the Frontend

```bash
cd web
npm run dev
```

Frontend will be at http://localhost:3000

### 2. Test Search Scenarios

**Scenario A: Text search (should work immediately)**
- Search for "Coke" or "โค้ก"
- Should return results using traditional ILIKE search

**Scenario B: Semantic search (requires embeddings)**
- Search for "refreshing drink" or "เครื่องดื่มชูกำลัง"
- Should trigger embedding search if < 5 text results
- Returns semantically similar products

**Scenario C: Force embedding search**
- Add `?use_embedding=true` to the URL
- Example: http://localhost:3000/search?query=snack&use_embedding=true

### 3. Monitor the Logs

Watch the embedding service logs to see API calls:
```
🔍 Primary search: "refreshing drink"
🧠 Triggering embedding search (found 0 results from text search)
📊 Embedding search returned 5 results
```

## 📊 Current Architecture

```
User Search Query
       ↓
Next.js Frontend (localhost:3000)
       ↓
API Route (/api/products/search)
       ↓
   ┌──────────────────────┐
   │  1. Text Search      │ ← Supabase (ILIKE)
   │  (Primary)           │
   └──────────────────────┘
       ↓ (if < 5 results)
   ┌──────────────────────┐
   │  2. Get Embedding    │ ← Embedding Service (localhost:8000)
   │  (Secondary)         │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │  3. Vector Search    │ ← Supabase (pgvector)
   │  (Similarity)        │
   └──────────────────────┘
       ↓
   Results to User
```

## 🚀 Next Steps

1. ✅ Embedding service is running
2. ⚠️ **Fix service role key** (see above)
3. ⏳ Generate embeddings for products
4. ✅ Frontend is already configured
5. 🧪 Test the hybrid search
6. 📊 Monitor performance and adjust thresholds

## 📝 Notes

- The embedding service uses **MPS** (Apple Silicon GPU) for fast inference
- Model size: 1.73GB (cached after first download)
- Embedding dimension: 768
- Search threshold: 0.5 (cosine similarity)
- Minimum results to trigger embedding search: 5

## 🔗 Related Documentation

- [HYBRID_SEARCH_SETUP.md](HYBRID_SEARCH_SETUP.md) - Complete setup guide
- [embedding_service/GETTING_STARTED.md](embedding_service/GETTING_STARTED.md) - Service quick start
- [embedding_service/TROUBLESHOOTING.md](embedding_service/TROUBLESHOOTING.md) - Common issues
- [docs/HYBRID_SEARCH_ARCHITECTURE.md](docs/HYBRID_SEARCH_ARCHITECTURE.md) - System architecture

