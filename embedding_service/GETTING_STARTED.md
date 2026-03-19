# Getting Started with the Embedding Service

This guide will get you up and running with the embedding service in under 5 minutes.

## 🎯 What This Service Does

The embedding service powers the hybrid search feature in twodirect by:
- Converting product names/descriptions into 768-dimensional vectors (text embeddings)
- Converting product images into 768-dimensional vectors (image embeddings)
- Enabling semantic search and visual similarity search

## ⚡ Quick Start (Recommended)

### 1. One-Command Setup

```bash
./start.sh
```

That's it! The script will:
- ✅ Install `uv` (ultra-fast Python package manager) if needed
- ✅ Create a virtual environment automatically
- ✅ Install all dependencies in seconds
- ✅ Download the Jina CLIP v2 model (~3.5GB)
- ✅ Start the service on http://localhost:8000

### 2. Configure Environment

If this is your first time, the script will create a `.env` file. Edit it with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
MODEL_NAME=jinaai/jina-clip-v2
EMBEDDING_DIMENSION=768
DEVICE=cpu  # or 'mps' for Apple Silicon, 'cuda' for NVIDIA GPU
PORT=8000
```

### 3. Generate Embeddings

In a new terminal, while the service is running:

```bash
./generate_embeddings.sh
```

This will process all products in your database and generate embeddings.

## 🔍 Verify It's Working

### Check Service Health

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

### View API Documentation

Open in your browser:
```
http://localhost:8000/docs
```

You'll see interactive API documentation where you can test endpoints.

### Test Text Embedding

```bash
curl -X POST http://localhost:8000/api/embed/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Coca Cola 500ml"}'
```

Should return a 768-dimensional embedding vector.

## 📚 API Endpoints

### Generate Text Embedding
```
POST /api/embed/text
Body: {"text": "product description"}
```

### Generate Image Embedding
```
POST /api/embed/image
Body: multipart/form-data with image file
```

### Search Similar Products
```
POST /api/search/similar
Body: {"query_embedding": [...], "limit": 10, "threshold": 0.7}
```

### Health Check
```
GET /api/health
```

## 🛠️ Manual Setup (Alternative)

If you prefer manual control:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies
uv sync

# Create .env
cp .env.example .env
# Edit .env with your credentials

# Start service
uv run python main.py
```

## 🚀 Performance Tips

### Use GPU for Faster Inference

If you have an NVIDIA GPU:
```env
DEVICE=cuda
```

If you have Apple Silicon (M1/M2/M3):
```env
DEVICE=mps
```

This can make embedding generation 5-10x faster!

### Batch Processing

When generating embeddings for many products, the script automatically processes them in batches for efficiency.

## 🐛 Troubleshooting

### Model Download Fails

If the model download is interrupted:
```bash
# Manually download
uv run python -c "from transformers import AutoModel; AutoModel.from_pretrained('jinaai/jina-clip-v2', trust_remote_code=True)"
```

### Out of Memory

If you run out of RAM:
- Close other applications
- Use a cloud instance with more RAM (8GB+ recommended)
- Process products in smaller batches

### Port Already in Use

If port 8000 is already in use, change it in `.env`:
```env
PORT=8001
```

### uv Not Found After Installation

Restart your terminal or run:
```bash
source $HOME/.cargo/env
```

## 📖 Next Steps

1. ✅ Service is running
2. ✅ Embeddings are generated
3. 🎯 Test the hybrid search in your Next.js app
4. 📊 Monitor search performance
5. 🚀 Deploy to production

## 🔗 Related Documentation

- [HYBRID_SEARCH_SETUP.md](../HYBRID_SEARCH_SETUP.md) - Complete setup guide
- [HYBRID_SEARCH_ARCHITECTURE.md](../docs/HYBRID_SEARCH_ARCHITECTURE.md) - System architecture
- [UV_MIGRATION.md](UV_MIGRATION.md) - Why we use uv
- [README.md](README.md) - Full API documentation

## 💡 Tips

- The first request takes ~5-10 seconds as the model loads into memory
- Subsequent requests are much faster (~100-200ms on CPU)
- The service caches the model in memory, so keep it running
- Use the `/docs` endpoint to explore and test the API interactively

Happy searching! 🎉

