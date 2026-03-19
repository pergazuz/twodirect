# Hybrid Search System Setup Guide

This guide will help you set up the hybrid search system for twodirect, combining traditional text search with multimodal embedding search using Jina CLIP v2.

## 🎯 Overview

The hybrid search system provides:
1. **Primary Search**: Fast traditional text-based search (ILIKE queries)
2. **Secondary Search**: AI-powered multimodal embedding search for better semantic matching
3. **Image Search**: Search products by uploading photos

## 📋 Prerequisites

- Python 3.10+ installed
- Supabase project with admin access
- At least 4GB RAM for running the embedding model
- (Optional) GPU for faster inference
- `uv` will be installed automatically by the setup script

## 🚀 Step-by-Step Setup

### Step 1: Set Up Database Schema

1. Open your Supabase SQL Editor
2. Run the migration script:

```bash
# Navigate to backend directory
cd backend

# Copy the SQL migration file content
cat supabase_embedding_migration.sql
```

3. Paste and execute the SQL in Supabase SQL Editor
4. Verify the setup:

```sql
-- Check if pgvector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if embedding columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE '%embedding%';
```

### Step 2: Set Up Embedding Service

1. Navigate to the embedding service directory:

```bash
cd embedding_service
```

2. Run the automated setup script:

```bash
./start.sh
```

The script will automatically:
- Install `uv` (fast Python package manager) if not present
- Create a virtual environment
- Install all dependencies (much faster than pip!)
- Prompt you to configure `.env` if it doesn't exist
- Download the Jina CLIP v2 model (~3.5GB) on first run
- Start the API server on http://localhost:8000

3. If prompted, edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
MODEL_NAME=jinaai/jina-clip-v2
EMBEDDING_DIMENSION=768
DEVICE=cpu  # or 'mps' for Apple Silicon, 'cuda' for NVIDIA GPU
PORT=8000
```

**Alternative Manual Setup:**

If you prefer manual control:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies
uv sync

# Create and edit .env
cp .env.example .env
# Edit .env with your credentials

# Start the service
uv run python main.py
```

### Step 3: Generate Embeddings for Existing Products

1. With the embedding service running, open a new terminal
2. Navigate to the embedding service directory
3. Run the embedding generation script:

```bash
cd embedding_service
./generate_embeddings.sh
```

This will:
- Fetch all products from your database
- Generate text embeddings from product names, descriptions, and categories
- Download product images and generate image embeddings
- Store embeddings in the database

Expected output:
```
🚀 Starting embedding generation for all products...
📦 Loading embedding model...
🔗 Connecting to Supabase...
📥 Fetching products from database...
Found 10 products

[1/10] Processing: Coke Zero 500ml
  📝 Generating text embedding...
  🖼️  Downloading and processing image...
  ✅ Image embedding generated
  💾 Storing embeddings...
  ✅ Successfully stored embeddings for Coke Zero 500ml
...
```

### Step 4: Configure Next.js Application

1. Add the embedding service URL to your environment:

```bash
# In web/.env.local
EMBEDDING_SERVICE_URL=http://localhost:8000
```

2. For production deployment, update to your deployed embedding service URL

### Step 5: Test the System

1. Start your Next.js application:

```bash
cd web
npm run dev
```

2. Test text search:
   - Go to http://localhost:3000
   - Search for a product (e.g., "โค้ก")
   - Should see results from traditional search

3. Test hybrid search:
   - Search for a vague term (e.g., "refreshing drink")
   - If < 5 results from text search, embedding search will activate
   - Check browser console for logs: `🧠 Triggering embedding search`

4. Test image search:
   - Click the camera icon in the search bar
   - Upload a product image or take a photo
   - Should see visually similar products

## 🔧 Configuration Options

### Adjust Search Thresholds

In `web/src/app/api/products/search/route.ts`:

```typescript
const MIN_RESULTS_THRESHOLD = 5;  // Trigger embedding search if < 5 results
```

In embedding search calls:

```typescript
await searchByEmbedding(supabase, queryEmbedding, 20, 0.5);
//                                                 ^^  ^^^
//                                                 |   similarity threshold (0-1)
//                                                 max results
```

### Optimize Performance

For production:

1. **Use GPU**: Set `DEVICE=cuda` in `.env` for 5-10x faster inference
2. **Deploy embedding service**: Use Railway, Render, or AWS
3. **Enable caching**: Implement Redis for frequently searched queries
4. **Batch processing**: Generate embeddings in batches for new products

## 📊 Monitoring

Check embedding service health:

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "database_connected": true,
  "device": "cpu"
}
```

## 🐛 Troubleshooting

### Model Download Issues

If model download fails:
```bash
# Manually download model
python -c "from transformers import AutoModel; AutoModel.from_pretrained('jinaai/jina-clip-v2', trust_remote_code=True)"
```

### Memory Issues

If you run out of memory:
- Close other applications
- Use a smaller batch size
- Consider using a cloud instance with more RAM

### Embedding Search Not Working

Check:
1. Embedding service is running: `curl http://localhost:8000`
2. Environment variable is set: `echo $EMBEDDING_SERVICE_URL`
3. Database has embeddings: `SELECT COUNT(*) FROM products WHERE text_embedding IS NOT NULL;`

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Text search returns results instantly
- ✅ Vague queries trigger embedding search (check console logs)
- ✅ Image search returns visually similar products
- ✅ Search results are more semantically relevant

## 📚 Next Steps

- Set up automatic embedding generation for new products
- Implement embedding caching
- Add analytics to track search performance
- Consider fine-tuning the model on your product catalog

