-- Supabase Schema for twodirect
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branches table (7-Eleven stores)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    address_th TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    opening_hours VARCHAR(100) DEFAULT '24 ชั่วโมง',
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch inventory (stock per branch per product)
CREATE TABLE branch_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, product_id)
);

-- Promotions table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_th VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percent INTEGER,
    discount_amount DECIMAL(10, 2),
    valid_until DATE,
    is_twodirect_exclusive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_name_th ON products(name_th);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_branches_location ON branches(latitude, longitude);
CREATE INDEX idx_branch_inventory_product ON branch_inventory(product_id);
CREATE INDEX idx_branch_inventory_branch ON branch_inventory(branch_id);
CREATE INDEX idx_promotions_product ON promotions(product_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public read access for inventory" ON branch_inventory FOR SELECT USING (true);
CREATE POLICY "Public read access for promotions" ON promotions FOR SELECT USING (true);

