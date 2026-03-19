"""
Script to generate and store embeddings for all products in the database
Run this after setting up the database schema with embedding columns
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from models.embedding_model import EmbeddingModel
from services.supabase_service import SupabaseService
import requests
from PIL import Image
from io import BytesIO

# Load environment variables
load_dotenv()


async def generate_embeddings_for_all_products():
    """Generate and store embeddings for all products"""
    
    print("🚀 Starting embedding generation for all products...")
    
    # Initialize services
    print("📦 Loading embedding model...")
    embedding_model = EmbeddingModel()
    
    print("🔗 Connecting to Supabase...")
    supabase_service = SupabaseService()
    
    # Fetch all products
    print("📥 Fetching products from database...")
    products = await supabase_service.get_all_products()
    print(f"Found {len(products)} products")
    
    # Process each product
    success_count = 0
    error_count = 0
    
    for i, product in enumerate(products, 1):
        product_id = product["id"]
        product_name = product["name"]
        
        print(f"\n[{i}/{len(products)}] Processing: {product_name}")
        
        try:
            # Generate text embedding from product name and description
            text_parts = [product["name"]]
            
            # Add Thai name
            if product.get("name_th"):
                text_parts.append(product["name_th"])
            
            # Add description
            if product.get("description"):
                text_parts.append(product["description"])
            
            # Add category
            if product.get("category"):
                text_parts.append(f"Category: {product['category']}")
            
            # Combine all text
            combined_text = " | ".join(text_parts)
            
            print(f"  📝 Generating text embedding...")
            text_embedding = embedding_model.encode_text(combined_text)

            # Debug: Check text embedding
            import numpy as np
            if np.isnan(text_embedding).any():
                print(f"  ⚠️  DEBUG: Text embedding has NaN values!")
                print(f"  Text: {combined_text[:100]}...")
            if np.isinf(text_embedding).any():
                print(f"  ⚠️  DEBUG: Text embedding has Inf values!")
            
            # Generate image embedding if image URL exists
            image_embedding = None
            if product.get("image_url"):
                try:
                    print(f"  🖼️  Downloading and processing image...")
                    response = requests.get(product["image_url"], timeout=10)
                    if response.status_code == 200:
                        image = Image.open(BytesIO(response.content)).convert("RGB")
                        image_embedding = embedding_model.encode_image(image)

                        # Debug: Check image embedding
                        if np.isnan(image_embedding).any():
                            print(f"  ⚠️  DEBUG: Image embedding has NaN values!")
                            print(f"  Image URL: {product.get('image_url')}")
                        elif np.isinf(image_embedding).any():
                            print(f"  ⚠️  DEBUG: Image embedding has Inf values!")
                        else:
                            print(f"  ✅ Image embedding generated")
                    else:
                        print(f"  ⚠️  Failed to download image (status: {response.status_code})")
                except Exception as e:
                    print(f"  ⚠️  Error processing image: {e}")
            
            # Store embeddings in database
            print(f"  💾 Storing embeddings...")

            # Convert embeddings to lists and check for NaN/Inf values
            text_emb_list = text_embedding.tolist()
            image_emb_list = image_embedding.tolist() if image_embedding is not None else None

            # Check for NaN or Inf values
            import math
            if any(math.isnan(x) or math.isinf(x) for x in text_emb_list):
                print(f"  ⚠️  Warning: Text embedding contains NaN or Inf values, skipping...")
                continue

            if image_emb_list and any(math.isnan(x) or math.isinf(x) for x in image_emb_list):
                print(f"  ⚠️  Warning: Image embedding contains NaN or Inf values, using text only...")
                image_emb_list = None

            success = await supabase_service.store_product_embedding(
                product_id=product_id,
                text_embedding=text_emb_list,
                image_embedding=image_emb_list
            )
            
            if success:
                print(f"  ✅ Successfully stored embeddings for {product_name}")
                success_count += 1
            else:
                print(f"  ❌ Failed to store embeddings for {product_name}")
                error_count += 1
        
        except Exception as e:
            print(f"  ❌ Error processing {product_name}: {e}")
            error_count += 1
    
    # Summary
    print("\n" + "="*60)
    print("📊 SUMMARY")
    print("="*60)
    print(f"Total products: {len(products)}")
    print(f"✅ Successfully processed: {success_count}")
    print(f"❌ Errors: {error_count}")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(generate_embeddings_for_all_products())

