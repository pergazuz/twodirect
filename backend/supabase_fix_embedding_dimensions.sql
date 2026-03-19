-- Fix: Update embedding dimensions from 768 to 1024 for Jina CLIP v2
-- The model actually produces 1024-dimensional embeddings, not 768

-- ============================================
-- 1. Drop existing columns and indexes
-- ============================================

-- Drop trigger first (it depends on the columns)
DROP TRIGGER IF EXISTS trigger_update_embedding_timestamp ON products;
DROP FUNCTION IF EXISTS update_embedding_timestamp();

-- Drop indexes
DROP INDEX IF EXISTS idx_products_text_embedding;
DROP INDEX IF EXISTS idx_products_image_embedding;

-- Drop the search function (it references the vector type)
DROP FUNCTION IF EXISTS search_products_by_embedding;

-- Drop columns
ALTER TABLE products DROP COLUMN IF EXISTS text_embedding;
ALTER TABLE products DROP COLUMN IF EXISTS image_embedding;

-- ============================================
-- 2. Add embedding columns with correct dimensions
-- ============================================

-- Add text embedding column (1024 dimensions for Jina CLIP v2)
ALTER TABLE products 
ADD COLUMN text_embedding vector(1024);

-- Add image embedding column (1024 dimensions for Jina CLIP v2)
ALTER TABLE products 
ADD COLUMN image_embedding vector(1024);

-- ============================================
-- 3. Recreate indexes for vector similarity search
-- ============================================

-- Index for text embedding similarity search using cosine distance
CREATE INDEX idx_products_text_embedding 
ON products 
USING ivfflat (text_embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for image embedding similarity search using cosine distance
CREATE INDEX idx_products_image_embedding 
ON products 
USING ivfflat (image_embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- 4. Recreate RPC function with correct dimensions
-- ============================================

-- Function to search products by embedding similarity
CREATE OR REPLACE FUNCTION search_products_by_embedding(
    query_embedding vector(1024),
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
-- 5. Recreate trigger to update embedding_updated_at
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

GRANT EXECUTE ON FUNCTION search_products_by_embedding TO anon, authenticated;

-- ============================================
-- 7. Update comments
-- ============================================

COMMENT ON COLUMN products.text_embedding IS 'Multimodal text embedding vector (1024-dim) generated from product name, description, and category using Jina CLIP v2';
COMMENT ON COLUMN products.image_embedding IS 'Multimodal image embedding vector (1024-dim) generated from product image using Jina CLIP v2';

-- ============================================
-- 8. Verify
-- ============================================

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE '%embedding%';

