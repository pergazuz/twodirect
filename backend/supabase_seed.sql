-- Seed data for twodirect MVP
-- Run this after creating the schema
-- Safe to re-run: clears existing data first

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE promotions CASCADE;
TRUNCATE TABLE branch_inventory CASCADE;
TRUNCATE TABLE branches CASCADE;
TRUNCATE TABLE products CASCADE;

-- Insert Products (Popular 7-Eleven items)
-- Image URLs point to Supabase Storage: https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/
INSERT INTO products (id, name, name_th, description, category, image_url, price) VALUES
('11111111-1111-1111-1111-111111111111', 'Coke Zero 500ml', 'โค้ก ซีโร่ 500ml', 'น้ำอัดลมไม่มีน้ำตาล', 'beverages', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/coke-zero.jpg', 25),
('22222222-2222-2222-2222-222222222222', 'Lay''s Original 75g', 'เลย์ รสดั้งเดิม 75g', 'มันฝรั่งทอดกรอบ', 'snacks', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/lays.jpg', 35),
('33333333-3333-3333-3333-333333333333', 'Mama Shrimp Tom Yum', 'มาม่า รสต้มยำกุ้ง', 'บะหมี่กึ่งสำเร็จรูป', 'instant-food', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/mama.jpg', 8),
('44444444-4444-4444-4444-444444444444', 'All Cafe Latte', 'ออลคาเฟ่ ลาเต้', 'กาแฟสดชงใหม่', 'beverages', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/allcafe.jpg', 45),
('55555555-5555-5555-5555-555555555555', 'Chicken Rice', 'ข้าวมันไก่', 'ข้าวมันไก่พร้อมทาน', 'ready-meals', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/chicken-rice.jpg', 59),
('66666666-6666-6666-6666-666666666666', 'Onigiri Salmon', 'โอนิกิริ แซลมอน', 'ข้าวปั้นญี่ปุ่นไส้แซลมอน', 'ready-meals', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/onigiri.jpg', 39),
('77777777-7777-7777-7777-777777777777', 'Meiji Fresh Milk 450ml', 'เมจิ นมสด 450ml', 'นมสดพาสเจอไรซ์', 'dairy', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/meiji-milk.jpg', 32),
('88888888-8888-8888-8888-888888888888', 'Couque D''asse White', 'คุกกี้ดัส ไวท์', 'คุกกี้สอดไส้ครีมขาว', 'snacks', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/couque.jpg', 69),
('99999999-9999-9999-9999-999999999999', 'Red Bull 250ml', 'กระทิงแดง 250ml', 'เครื่องดื่มชูกำลัง', 'beverages', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/redbull.jpg', 15),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sausage Bun', 'ขนมปังไส้กรอก', 'ขนมปังนิ่มไส้กรอก', 'bakery', 'https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products/sausage-bun.jpg', 29);

-- Insert Branches (7-Eleven locations in Bangkok)
INSERT INTO branches (id, name, name_th, address, address_th, latitude, longitude, opening_hours, phone) VALUES
('b1111111-1111-1111-1111-111111111111', '7-Eleven Silom Soi 4', '7-Eleven สีลม ซอย 4', 'Silom Soi 4, Bangrak, Bangkok', 'สีลม ซอย 4 บางรัก กรุงเทพฯ', 13.7262, 100.5318, '24 ชั่วโมง', '02-234-5678'),
('b2222222-2222-2222-2222-222222222222', '7-Eleven Siam Square', '7-Eleven สยามสแควร์', 'Siam Square Soi 3, Pathumwan, Bangkok', 'สยามสแควร์ ซอย 3 ปทุมวัน กรุงเทพฯ', 13.7450, 100.5341, '24 ชั่วโมง', '02-251-1234'),
('b3333333-3333-3333-3333-333333333333', '7-Eleven Sukhumvit 21', '7-Eleven สุขุมวิท 21', 'Sukhumvit Soi 21 (Asoke), Bangkok', 'สุขุมวิท ซอย 21 (อโศก) กรุงเทพฯ', 13.7380, 100.5610, '24 ชั่วโมง', '02-259-9876'),
('b4444444-4444-4444-4444-444444444444', '7-Eleven Thonglor', '7-Eleven ทองหล่อ', 'Thonglor Soi 10, Watthana, Bangkok', 'ทองหล่อ ซอย 10 วัฒนา กรุงเทพฯ', 13.7320, 100.5780, '24 ชั่วโมง', '02-381-5555'),
('b5555555-5555-5555-5555-555555555555', '7-Eleven Chatuchak', '7-Eleven จตุจักร', 'Phahonyothin Road, Chatuchak, Bangkok', 'ถนนพหลโยธิน จตุจักร กรุงเทพฯ', 13.7990, 100.5500, '24 ชั่วโมง', '02-272-1111'),
('b6666666-6666-6666-6666-666666666666', '7-Eleven Ratchada', '7-Eleven รัชดา', 'Ratchadaphisek Road Soi 3, Bangkok', 'รัชดาภิเษก ซอย 3 กรุงเทพฯ', 13.7610, 100.5740, '24 ชั่วโมง', '02-276-3333'),
('b7777777-7777-7777-7777-777777777777', '7-Eleven Ari', '7-Eleven อารีย์', 'Phahonyothin Soi 7 (Ari), Bangkok', 'พหลโยธิน ซอย 7 (อารีย์) กรุงเทพฯ', 13.7790, 100.5440, '24 ชั่วโมง', '02-279-8888'),
('b8888888-8888-8888-8888-888888888888', '7-Eleven Ekkamai', '7-Eleven เอกมัย', 'Ekkamai Soi 5, Watthana, Bangkok', 'เอกมัย ซอย 5 วัฒนา กรุงเทพฯ', 13.7230, 100.5850, '24 ชั่วโมง', '02-391-7777'),
-- เขตราษฎร์บูรณะ branches
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '7-Eleven Rat Burana', '7-Eleven ราษฎร์บูรณะ', 'Rat Burana Road, Rat Burana, Bangkok', 'ถนนราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพฯ', 13.6795, 100.5015, '24 ชั่วโมง', '02-427-1111'),
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '7-Eleven Suksawat 30', '7-Eleven สุขสวัสดิ์ 30', 'Suksawat Road Soi 30, Rat Burana, Bangkok', 'ถนนสุขสวัสดิ์ ซอย 30 ราษฎร์บูรณะ กรุงเทพฯ', 13.6720, 100.5085, '24 ชั่วโมง', '02-427-2222'),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '7-Eleven Pracha Uthit', '7-Eleven ประชาอุทิศ', 'Pracha Uthit Road, Rat Burana, Bangkok', 'ถนนประชาอุทิศ ราษฎร์บูรณะ กรุงเทพฯ', 13.6850, 100.5120, '24 ชั่วโมง', '02-427-3333'),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '7-Eleven Rama 2 Soi 33', '7-Eleven พระราม 2 ซอย 33', 'Rama 2 Road Soi 33, Rat Burana, Bangkok', 'ถนนพระราม 2 ซอย 33 ราษฎร์บูรณะ กรุงเทพฯ', 13.6680, 100.4950, '24 ชั่วโมง', '02-427-4444');

-- Insert Branch Inventory (randomized stock levels)
INSERT INTO branch_inventory (branch_id, product_id, quantity) VALUES
-- Silom branch
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 15),
('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 8),
('b1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 25),
('b1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 10),
('b1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 5),
-- Siam branch
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 20),
('b2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 15),
('b2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 12),
('b2222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 8),
-- Sukhumvit branch
('b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 10),
('b3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 7),
('b3333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 5),
('b3333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 30),
-- Thonglor branch
('b4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 0),
('b4444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 18),
('b4444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 12),
('b4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 6),
-- Chatuchak branch
('b5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 50),
('b5555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 8),
('b5555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 25),
-- Ratchada branch
('b6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 12),
('b6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 15),
('b6666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 3),
('b6666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 9),
-- Ari branch
('b7777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 20),
('b7777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 7),
('b7777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 15),
('b7777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10),
-- Ekkamai branch
('b8888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 8),
('b8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 20),
('b8888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 4),
('b8888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', 18),
-- Rat Burana branch (ราษฎร์บูรณะ)
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 25),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 18),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 40),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 15),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 12),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 8),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777777', 20),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', 35),
-- Suksawat 30 branch (สุขสวัสดิ์ 30)
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 18),
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 30),
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 12),
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 8),
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 15),
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', 6),
('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10),
-- Pracha Uthit branch (ประชาอุทิศ)
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 22),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 14),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 35),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 18),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 10),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 25),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', 28),
('bcccccc1-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 12),
-- Rama 2 Soi 33 branch (พระราม 2 ซอย 33)
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 30),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 20),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 45),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 20),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 15),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', 12),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 18),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '88888888-8888-8888-8888-888888888888', 8),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', '99999999-9999-9999-9999-999999999999', 40),
('bdddddd1-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 14);

-- Insert Promotions
INSERT INTO promotions (product_id, title, title_th, description, discount_percent, is_twodirect_exclusive) VALUES
(NULL, '10% off via twodirect', 'ลด 10% ผ่าน twodirect', 'ส่วนลดพิเศษเมื่อสั่งผ่านแอป twodirect', 10, true),
('11111111-1111-1111-1111-111111111111', 'Buy 2 Get 1 Free', 'ซื้อ 2 แถม 1', 'โค้ก ซีโร่ โปรโมชันพิเศษ', NULL, false),
('44444444-4444-4444-4444-444444444444', 'All Cafe 15% off', 'ออลคาเฟ่ ลด 15%', 'ลดเฉพาะสั่งผ่าน twodirect', 15, true),
('55555555-5555-5555-5555-555555555555', 'Lunch Special', 'โปรมื้อกลางวัน', 'ข้าวมันไก่ลด 10 บาท 11:00-14:00', NULL, false);

