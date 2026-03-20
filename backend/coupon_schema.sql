-- Coupon Schema for TwoDirect
-- Run this in your Supabase SQL Editor

-- Coupons table (available coupons that users can collect)
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_th VARCHAR(255) NOT NULL,
    description TEXT,
    description_th TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User collected coupons
CREATE TABLE user_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    reservation_id UUID,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, coupon_id)
);

-- Indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_until);
CREATE INDEX idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_coupon ON user_coupons(coupon_id);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- Public read access for coupons
CREATE POLICY "Public read access for coupons" ON coupons FOR SELECT USING (true);

-- Users can read their own collected coupons
CREATE POLICY "Users can read own coupons" ON user_coupons FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own coupons
CREATE POLICY "Users can collect coupons" ON user_coupons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own coupons (mark as used)
CREATE POLICY "Users can update own coupons" ON user_coupons FOR UPDATE USING (auth.uid() = user_id);

-- Seed some example coupons
INSERT INTO coupons (code, title, title_th, description_th, discount_type, discount_value, min_purchase, max_discount, usage_limit, per_user_limit, valid_until, category) VALUES
('WELCOME10', 'Welcome 10% Off', 'สมาชิกใหม่ลด 10%', 'สำหรับสมาชิกใหม่ ลด 10% เมื่อสั่งซื้อครั้งแรก', 'percent', 10, 0, 50, 1000, 1, NOW() + INTERVAL '90 days', 'new_user'),
('SAVE20', 'Save 20 Baht', 'ลด 20 บาท', 'ลด 20 บาท เมื่อซื้อขั้นต่ำ 100 บาท', 'fixed', 20, 100, NULL, 500, 1, NOW() + INTERVAL '30 days', 'general'),
('DRINK15', 'Drinks 15% Off', 'เครื่องดื่มลด 15%', 'ลด 15% สำหรับหมวดเครื่องดื่ม สูงสุด 30 บาท', 'percent', 15, 0, 30, 300, 1, NOW() + INTERVAL '14 days', 'beverages'),
('SNACK10', 'Snacks 10 Baht Off', 'ขนมลด 10 บาท', 'ลด 10 บาท สำหรับหมวดขนม', 'fixed', 10, 50, NULL, 500, 1, NOW() + INTERVAL '21 days', 'snacks'),
('MEAL25', 'Ready Meals 25% Off', 'อาหารพร้อมทานลด 25%', 'ลด 25% สำหรับอาหารพร้อมทาน สูงสุด 40 บาท', 'percent', 25, 0, 40, 200, 1, NOW() + INTERVAL '7 days', 'ready-meals'),
('SUPER50', 'Super Deal 50 Baht', 'ดีลสุดคุ้ม ลด 50 บาท', 'ลด 50 บาท เมื่อซื้อขั้นต่ำ 200 บาท', 'fixed', 50, 200, NULL, 100, 1, NOW() + INTERVAL '10 days', 'general'),
('MIDNIGHT', 'Midnight Special', 'โปรดึก ลด 20%', 'ลด 20% สำหรับออเดอร์ช่วงเที่ยงคืน-ตี 5 สูงสุด 35 บาท', 'percent', 20, 0, 35, 200, 1, NOW() + INTERVAL '30 days', 'general'),
('TWODIRECT', 'TwoDirect Exclusive', 'สิทธิพิเศษ TwoDirect ลด 30%', 'ลด 30% เฉพาะผู้ใช้ TwoDirect สูงสุด 60 บาท เมื่อซื้อขั้นต่ำ 150 บาท', 'percent', 30, 150, 60, 50, 1, NOW() + INTERVAL '60 days', 'exclusive');
