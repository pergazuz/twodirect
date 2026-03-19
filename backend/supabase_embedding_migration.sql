-- Migration: Add pgvector support for hybrid search
-- Run this in your Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding columns to products table (512 dimensions for CLIP model)
-- text_embedding: generated from product name/description text
-- image_embedding: generated from product image
ALTER TABLE products ADD COLUMN IF NOT EXISTS text_embedding vector(512);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_embedding vector(512);
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP WITH TIME ZONE;

-- 3. Create HNSW indexes for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_products_text_embedding
ON products USING hnsw (text_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_products_image_embedding
ON products USING hnsw (image_embedding vector_cosine_ops);

-- 4. Create function to search products by text embedding similarity
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name varchar,
  name_th varchar,
  description text,
  category varchar,
  image_url text,
  price decimal,
  created_at timestamptz,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.name_th,
    p.description,
    p.category,
    p.image_url,
    p.price,
    p.created_at,
    1 - (p.text_embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE p.text_embedding IS NOT NULL
    AND 1 - (p.text_embedding <=> query_embedding) > match_threshold
  ORDER BY p.text_embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. Grant access to the function for anonymous users (needed for PostgREST)
GRANT EXECUTE ON FUNCTION match_products(vector, float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_products(vector, float, int) TO authenticated;
