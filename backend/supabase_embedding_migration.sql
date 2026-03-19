-- Migration: Add embedding support to twodirect database
-- This adds pgvector extension and embedding columns to products table

-- ============================================
-- 1. Enable pgvector extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 2. Add embedding columns to products table
-- ============================================

-- Add text embedding column (768 dimensions for Jina CLIP v2)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS text_embedding vector(768);

-- Add image embedding column (768 dimensions for Jina CLIP v2)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_embedding vector(768);

-- Add metadata columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 3. Create indexes for vector similarity search
-- ============================================

-- Index for text embedding similarity search using cosine distance
CREATE INDEX IF NOT EXISTS idx_products_text_embedding 
ON products 
USING ivfflat (text_embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for image embedding similarity search using cosine distance
CREATE INDEX IF NOT EXISTS idx_products_image_embedding 
ON products 
USING ivfflat (image_embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- 4. Create RPC function for similarity search
-- ============================================

-- Function to search products by text embedding similarity
CREATE OR REPLACE FUNCTION search_products_by_embedding(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10,
    embedding_column text DEFAULT 'text_embedding'
)
RETURNS TABLE (
    id uuid,
    name varchar,
    name_th varchar,
    description text,
    category varchar,
    image_url text,
    price decimal,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF embedding_column = 'image_embedding' THEN
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.name_th,
            p.description,
            p.category,
            p.image_url,
            p.price,
            1 - (p.image_embedding <=> query_embedding) as similarity
        FROM products p
        WHERE p.image_embedding IS NOT NULL
            AND 1 - (p.image_embedding <=> query_embedding) >= match_threshold
        ORDER BY p.image_embedding <=> query_embedding
        LIMIT match_count;
    ELSE
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.name_th,
            p.description,
            p.category,
            p.image_url,
            p.price,
            1 - (p.text_embedding <=> query_embedding) as similarity
        FROM products p
        WHERE p.text_embedding IS NOT NULL
            AND 1 - (p.text_embedding <=> query_embedding) >= match_threshold
        ORDER BY p.text_embedding <=> query_embedding
        LIMIT match_count;
    END IF;
END;
$$;

-- ============================================
-- 5. Create trigger to update embedding_updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_embedding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.embedding_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_embedding_timestamp
BEFORE UPDATE OF text_embedding, image_embedding ON products
FOR EACH ROW
EXECUTE FUNCTION update_embedding_timestamp();

-- ============================================
-- 6. Grant permissions
-- ============================================

-- Grant execute permission on the search function to anon and authenticated users
GRANT EXECUTE ON FUNCTION search_products_by_embedding TO anon, authenticated;

-- ============================================
-- 7. Comments for documentation
-- ============================================

COMMENT ON COLUMN products.text_embedding IS 'Multimodal text embedding vector (768-dim) generated from product name, description, and category using Jina CLIP v2';
COMMENT ON COLUMN products.image_embedding IS 'Multimodal image embedding vector (768-dim) generated from product image using Jina CLIP v2';
COMMENT ON COLUMN products.embedding_updated_at IS 'Timestamp when embeddings were last updated';
COMMENT ON FUNCTION search_products_by_embedding IS 'Search products using vector similarity (cosine distance) on embeddings';

-- ============================================
-- 8. Verify installation
-- ============================================

-- Check if pgvector is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE '%embedding%';

