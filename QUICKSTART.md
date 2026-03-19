# 🚀 Hybrid Search Quick Start

Get the hybrid search system running in 5 minutes!

## Prerequisites

- Python 3.10+ installed
- Supabase project credentials
- At least 4GB free RAM
- `uv` will be installed automatically

## Quick Setup

### 1. Database Setup (2 minutes)

```bash
# Open Supabase SQL Editor and run:
cat backend/supabase_embedding_migration.sql
# Copy and paste the SQL into Supabase SQL Editor, then execute
```

### 2. Start Embedding Service (2 minutes)

```bash
cd embedding_service

# Run the automated setup script
./start.sh

# The script will:
# - Install uv (fast Python package manager) if needed
# - Create virtual environment automatically
# - Install dependencies (10x faster than pip!)
# - Download Jina CLIP v2 model (~3.5GB)
# - Start the service on http://localhost:8000
```

### 3. Generate Embeddings (1 minute)

```bash
# In a new terminal, while embedding service is running:
cd embedding_service
./generate_embeddings.sh

# This will process all products and generate embeddings
```

### 4. Test the System

```bash
# Start your Next.js app
cd web
npm run dev

# Open http://localhost:3000
# Try searching for products or uploading an image!
```

## Verify It's Working

### Check Embedding Service
```bash
curl http://localhost:8000/api/health
# Should return: {"status": "healthy", "model_loaded": true}
```

### Check Database
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM products WHERE text_embedding IS NOT NULL;
-- Should return the number of products with embeddings
```

### Test Search
1. Go to http://localhost:3000
2. Search for "โค้ก" - should get instant results (text search)
3. Search for "refreshing drink" - should trigger embedding search
4. Click camera icon and upload a product image - should find similar products

## What's Next?

- Read [HYBRID_SEARCH_SETUP.md](HYBRID_SEARCH_SETUP.md) for detailed configuration
- Check [docs/HYBRID_SEARCH_ARCHITECTURE.md](docs/HYBRID_SEARCH_ARCHITECTURE.md) to understand the system
- Monitor search performance in browser console

## Troubleshooting

**Model download fails?**
```bash
# Manually download
python -c "from transformers import AutoModel; AutoModel.from_pretrained('jinaai/jina-clip-v2', trust_remote_code=True)"
```

**Out of memory?**
- Close other applications
- Use a cloud instance with more RAM

**Embedding service won't start?**
- Check `.env` file has correct Supabase credentials
- Ensure port 8000 is not in use

## Architecture at a Glance

```
User Search → Next.js API → Primary: Text Search (Fast)
                          ↓
                          Secondary: Embedding Search (Smart)
                          ↓
                          Supabase (pgvector) + Embedding Service (Jina CLIP v2)
```

## Key Features

✅ **Hybrid Search**: Text + AI embeddings  
✅ **Multilingual**: English + Thai support  
✅ **Image Search**: Upload photos to find products  
✅ **Fast**: < 100ms for text, < 500ms for embeddings  
✅ **Smart Fallback**: Uses AI only when needed  

Happy searching! 🎉

