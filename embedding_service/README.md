# Multimodal Embedding Service for twodirect

## Overview

This service provides multimodal embedding generation for the twodirect product search feature using **Jina CLIP v2**, a state-of-the-art vision-language model.

## Why Jina CLIP v2?

After researching SOTA models in 2026, Jina CLIP v2 is the best choice for this use case:

- **Multimodal**: Handles both text and images
- **Multilingual**: Supports 89 languages including Thai (critical for twodirect)
- **High Resolution**: 512x512 image processing (vs 224x224 for OpenAI CLIP)
- **Optimized for Search**: Specifically designed for retrieval tasks
- **Free & Open Source**: Can run locally on Mac without API costs
- **Efficient**: 900M parameters - good balance of performance and resource usage
- **Matryoshka Representations**: Flexible embedding dimensions

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Search API     │◄────►│  Supabase DB     │
│  (Next.js/Rust) │      │  (pgvector)      │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Embedding      │
│  Service        │
│  (FastAPI)      │
└─────────────────┘
```

## Hybrid Search Strategy

1. **Primary Search**: Traditional text-based search (current implementation)
   - Fast ILIKE queries on `name` and `name_th` fields
   - Returns exact and partial matches

2. **Secondary Search**: Multimodal embedding similarity search
   - Triggered when text search returns < 5 results
   - Supports both text and image queries
   - Uses cosine similarity on embedding vectors

## Installation

### Prerequisites

- Python 3.10+
- At least 4GB RAM for model inference
- `uv` (will be installed automatically if not present)

### Quick Setup (Recommended)

The easiest way to get started is using the provided scripts:

```bash
cd embedding_service

# Start the service (installs uv and dependencies automatically)
./start.sh
```

This will:
- Install `uv` if not already installed
- Create a virtual environment automatically
- Install all dependencies (much faster than pip!)
- Start the service on port 8000

### Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies (creates venv automatically)
uv sync

# Create .env file
cp .env.example .env
# Edit with your credentials

# Start the service
uv run python main.py
```

### Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
MODEL_NAME=jinaai/jina-clip-v2
EMBEDDING_DIMENSION=768
DEVICE=cpu  # or 'mps' for Apple Silicon, 'cuda' for NVIDIA GPU
PORT=8000
```

## API Endpoints

### 1. Generate Text Embedding

```bash
POST /api/embed/text
Content-Type: application/json

{
  "text": "Coca Cola 500ml"
}

Response:
{
  "embedding": [0.123, -0.456, ...],
  "dimension": 768
}
```

### 2. Generate Image Embedding

```bash
POST /api/embed/image
Content-Type: multipart/form-data

file: <image_file>

Response:
{
  "embedding": [0.123, -0.456, ...],
  "dimension": 768
}
```

### 3. Search by Similarity

```bash
POST /api/search/similar
Content-Type: application/json

{
  "query_embedding": [0.123, -0.456, ...],
  "limit": 10,
  "threshold": 0.7
}

Response:
{
  "results": [
    {
      "product_id": "uuid",
      "similarity": 0.95,
      "product": {...}
    }
  ]
}
```

## Running the Service

### Development

Using the start script (recommended):
```bash
./start.sh
```

Or manually:
```bash
uv run python main.py
```

Or with auto-reload:
```bash
uv run uvicorn main:app --reload --port 8000
```

### Production

```bash
uv run gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Performance Considerations

- **Model Loading**: First request takes ~5-10 seconds to load model
- **Inference Time**: ~100-200ms per embedding on CPU, ~20-50ms on GPU
- **Memory Usage**: ~2GB for model + ~1GB for runtime
- **Batch Processing**: Supports batch embedding generation for efficiency

## Next Steps

1. Generate embeddings for all existing products
2. Set up automatic embedding generation for new products
3. Implement caching for frequently searched queries
4. Consider GPU deployment for production scale

