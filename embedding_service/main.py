"""
Multimodal Embedding Service for twodirect
Uses Jina CLIP v2 for generating embeddings from text and images
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

from models.embedding_model import EmbeddingModel
from services.supabase_service import SupabaseService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="twodirect Embedding Service",
    description="Multimodal embedding generation using Jina CLIP v2",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
embedding_model = None
supabase_service = None


@app.on_event("startup")
async def startup_event():
    """Initialize model and services on startup"""
    global embedding_model, supabase_service
    
    print("🚀 Starting embedding service...")
    print(f"📦 Loading model: {os.getenv('MODEL_NAME', 'jinaai/jina-clip-v2')}")
    
    embedding_model = EmbeddingModel()
    supabase_service = SupabaseService()
    
    print("✅ Service ready!")


# Request/Response Models
class TextEmbedRequest(BaseModel):
    text: str
    normalize: bool = True


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    dimension: int


class SimilaritySearchRequest(BaseModel):
    query_embedding: Optional[List[float]] = None
    query_text: Optional[str] = None
    limit: int = 10
    threshold: float = 0.5


class ProductMatch(BaseModel):
    product_id: str
    similarity: float
    product: dict


class SimilaritySearchResponse(BaseModel):
    results: List[ProductMatch]
    count: int


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "twodirect Embedding Service",
        "status": "running",
        "model": os.getenv("MODEL_NAME", "jinaai/jina-clip-v2"),
        "version": "1.0.0"
    }


@app.post("/api/embed/text", response_model=EmbeddingResponse)
async def embed_text(request: TextEmbedRequest):
    """Generate embedding from text"""
    try:
        embedding = embedding_model.encode_text(request.text, normalize=request.normalize)
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            dimension=len(embedding)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")


@app.post("/api/embed/image", response_model=EmbeddingResponse)
async def embed_image(file: UploadFile = File(...)):
    """Generate embedding from image"""
    try:
        # Read image file
        image_bytes = await file.read()
        
        # Generate embedding
        embedding = embedding_model.encode_image(image_bytes)
        
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            dimension=len(embedding)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image embedding failed: {str(e)}")


@app.post("/api/search/similar", response_model=SimilaritySearchResponse)
async def search_similar(request: SimilaritySearchRequest):
    """Search for similar products using embedding similarity"""
    try:
        # Get query embedding
        if request.query_embedding:
            query_embedding = request.query_embedding
        elif request.query_text:
            query_embedding = embedding_model.encode_text(request.query_text).tolist()
        else:
            raise HTTPException(status_code=400, detail="Either query_embedding or query_text must be provided")
        
        # Search in database
        results = await supabase_service.search_similar_products(
            query_embedding=query_embedding,
            limit=request.limit,
            threshold=request.threshold
        )
        
        return SimilaritySearchResponse(
            results=results,
            count=len(results)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity search failed: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": embedding_model is not None,
        "database_connected": supabase_service is not None,
        "device": embedding_model.device if embedding_model else "unknown"
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

