"""
Supabase Service for embedding storage and similarity search
Uses pgvector extension for efficient vector similarity search
"""

import os
from typing import List, Dict, Any
from supabase import create_client, Client
import numpy as np


class SupabaseService:
    """Service for interacting with Supabase database"""
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
    
    async def store_product_embedding(
        self,
        product_id: str,
        text_embedding: List[float] = None,
        image_embedding: List[float] = None
    ) -> bool:
        """
        Store embeddings for a product
        
        Args:
            product_id: UUID of the product
            text_embedding: Text embedding vector
            image_embedding: Image embedding vector
            
        Returns:
            True if successful
        """
        try:
            update_data = {}
            
            if text_embedding:
                update_data["text_embedding"] = text_embedding
            
            if image_embedding:
                update_data["image_embedding"] = image_embedding
            
            if not update_data:
                return False
            
            result = self.client.table("products").update(update_data).eq("id", product_id).execute()
            
            return True
        except Exception as e:
            print(f"❌ Error storing embedding for product {product_id}: {e}")
            return False
    
    async def search_similar_products(
        self,
        query_embedding: List[float],
        limit: int = 10,
        threshold: float = 0.5,
        use_image_embedding: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Search for similar products using vector similarity
        
        Args:
            query_embedding: Query embedding vector
            limit: Maximum number of results
            threshold: Minimum similarity threshold (0-1)
            use_image_embedding: Whether to search using image embeddings
            
        Returns:
            List of product matches with similarity scores
        """
        try:
            # Choose which embedding column to search
            embedding_column = "image_embedding" if use_image_embedding else "text_embedding"
            
            # Use pgvector's cosine similarity search
            # Note: This uses Supabase's RPC function for vector similarity
            result = self.client.rpc(
                "search_products_by_embedding",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": threshold,
                    "match_count": limit,
                    "embedding_column": embedding_column
                }
            ).execute()
            
            # Format results
            matches = []
            for row in result.data:
                matches.append({
                    "product_id": row["id"],
                    "similarity": row["similarity"],
                    "product": {
                        "id": row["id"],
                        "name": row["name"],
                        "name_th": row["name_th"],
                        "description": row.get("description"),
                        "category": row["category"],
                        "image_url": row.get("image_url"),
                        "price": row["price"]
                    }
                })
            
            return matches
        except Exception as e:
            print(f"❌ Error searching similar products: {e}")
            # Fallback to manual similarity calculation if RPC not available
            return await self._fallback_similarity_search(
                query_embedding, limit, threshold, use_image_embedding
            )
    
    async def _fallback_similarity_search(
        self,
        query_embedding: List[float],
        limit: int,
        threshold: float,
        use_image_embedding: bool
    ) -> List[Dict[str, Any]]:
        """
        Fallback similarity search using client-side calculation
        Used when pgvector RPC function is not available
        """
        try:
            # Fetch all products with embeddings
            embedding_column = "image_embedding" if use_image_embedding else "text_embedding"
            
            result = self.client.table("products").select("*").not_(embedding_column, "is", None).execute()
            
            # Calculate similarities
            query_vec = np.array(query_embedding)
            query_vec = query_vec / np.linalg.norm(query_vec)  # Normalize
            
            matches = []
            for product in result.data:
                embedding = product.get(embedding_column)
                if not embedding:
                    continue
                
                # Calculate cosine similarity
                product_vec = np.array(embedding)
                product_vec = product_vec / np.linalg.norm(product_vec)
                similarity = float(np.dot(query_vec, product_vec))
                
                if similarity >= threshold:
                    matches.append({
                        "product_id": product["id"],
                        "similarity": similarity,
                        "product": {
                            "id": product["id"],
                            "name": product["name"],
                            "name_th": product["name_th"],
                            "description": product.get("description"),
                            "category": product["category"],
                            "image_url": product.get("image_url"),
                            "price": product["price"]
                        }
                    })
            
            # Sort by similarity and limit
            matches.sort(key=lambda x: x["similarity"], reverse=True)
            return matches[:limit]
        
        except Exception as e:
            print(f"❌ Fallback search failed: {e}")
            return []
    
    async def get_all_products(self) -> List[Dict[str, Any]]:
        """Get all products from database"""
        try:
            result = self.client.table("products").select("*").execute()
            return result.data
        except Exception as e:
            print(f"❌ Error fetching products: {e}")
            return []

