-- Migration: 006_seed_initial_data
-- Created at: 2025-09-12
-- Description: Seed initial data from local development database

-- Insert admin user
INSERT INTO admin_users (id, email, password, role, created_at, updated_at) VALUES 
('dfab8f36-85c8-11f0-b04d-244bfe876704', 'admin@beyou.com', '$2a$10$mS09NhsDm7In6XValBywQOfNv7NQxZ3O8G2pgpFMpArpE.OPGF5yu', 'admin', '2025-08-30 17:43:43', '2025-08-30 17:43:43')
ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at);

-- Insert regular user
INSERT INTO users (id, email, password_hash, display_name, profile_image_path, role, created_at, updated_at) VALUES 
('af65ed3e-7654-4cd9-aff7-7978d0b49ae2', 'jebran@beyou.com', '$2a$10$mS09NhsDm7In6XValBywQOfNv7NQxZ3O8G2pgpFMpArpE.OPGF5yu', 'Jebran', NULL, 'admin', '2025-08-27 09:37:33', '2025-08-28 17:05:36')
ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at);

-- Insert test product
INSERT INTO products (id, name, description, price, stock_quantity, category, subcategory, primary_image_path, is_best_seller, created_at, updated_at) VALUES 
('c2956e11-59bc-46d1-8666-8f8a987a518f', 'test', 'as dfas asd as dfasf sa s as dfas fa update', 450.00, 900, 'K-Beauty', 'Lip Gloss', '/uploads/products/5244c145-8dd7-4cfa-adab-f3217c063d81.jpg', 1, '2025-08-30 15:44:37', '2025-08-30 16:43:17')
ON DUPLICATE KEY UPDATE 
name = VALUES(name),
description = VALUES(description),
price = VALUES(price),
stock_quantity = VALUES(stock_quantity),
category = VALUES(category),
subcategory = VALUES(subcategory),
primary_image_path = VALUES(primary_image_path),
is_best_seller = VALUES(is_best_seller),
updated_at = VALUES(updated_at);

-- Insert product images
INSERT INTO product_images (id, product_id, image_path, is_primary, created_at, updated_at) VALUES 
('0d17a38a-7cbf-4db1-b24e-6ae95ec87f02', 'c2956e11-59bc-46d1-8666-8f8a987a518f', '/uploads/products/3b3151e4-0a9f-4410-9173-a9d0926f24e0.jpg', 0, '2025-08-30 15:44:37', '2025-08-30 15:54:29'),
('9500884e-521f-4aa4-b80f-d470c914f9ae', 'c2956e11-59bc-46d1-8666-8f8a987a518f', '/uploads/products/5244c145-8dd7-4cfa-adab-f3217c063d81.jpg', 1, '2025-08-30 15:44:37', '2025-08-30 15:54:29')
ON DUPLICATE KEY UPDATE 
image_path = VALUES(image_path),
is_primary = VALUES(is_primary),
updated_at = VALUES(updated_at);

-- Insert banners
INSERT INTO banners (id, title, subtitle, image_path, created_at, updated_at) VALUES 
('329ecd60-02cd-47e8-a145-a2aac9991d94', NULL, NULL, '/uploads/banners/329ecd60-02cd-47e8-a145-a2aac9991d94/655ba29b-3e0c-4e98-826d-3f2479fb2dd1.jpg', '2025-08-30 12:59:05', '2025-08-30 12:59:05'),
('88fead77-c7e0-4b87-93f5-4dd0bfdd622c', NULL, NULL, '/uploads/banners/88fead77-c7e0-4b87-93f5-4dd0bfdd622c/d35ca5a2-71a1-4250-b443-1ac14b364154.jpg', '2025-08-28 16:33:47', '2025-08-28 16:33:47')
ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at);

-- Insert category images
INSERT INTO category_images (id, category_name, image_path, created_at, updated_at) VALUES 
('411d3644-85a1-11f0-b04d-244bfe876704', 'other', '/uploads/categories/other/25603c1b-ad5d-4a75-9cde-837825b69223.jpeg', '2025-08-30 13:00:07', '2025-08-30 13:00:07'),
('7143dc06-842e-11f0-bab4-244bfe876704', 'nails', '/uploads/categories/nails/a117ac4d-34ca-4b08-a288-58ce74b75eaa.jpg', '2025-08-28 16:45:45', '2025-08-28 16:45:45'),
('787d7d36-842e-11f0-bab4-244bfe876704', 'brands', '/uploads/categories/brands/a570b00f-0d43-404f-965c-5398ae52871a.jpg', '2025-08-28 16:45:57', '2025-08-28 16:45:57'),
('7dddd308-842e-11f0-bab4-244bfe876704', 'exciting-combos', '/uploads/categories/exciting-combos/15c74661-ae92-4e4e-abd9-5eab8555588f.jpg', '2025-08-28 16:46:06', '2025-08-28 16:46:06'),
('830a0cbb-842e-11f0-bab4-244bfe876704', 'custom-prints', '/uploads/categories/custom-prints/722dce15-d253-4310-b353-1196b118d895.jpg', '2025-08-28 16:46:15', '2025-08-28 16:46:15'),
('d0d003eb-842c-11f0-bab4-244bfe876704', 'k-beauty', '/uploads/categories/k-beauty/26c66a9c-40ca-4b9b-a232-8a9349154f20.jpg', '2025-08-28 16:34:06', '2025-08-28 16:45:19')
ON DUPLICATE KEY UPDATE 
image_path = VALUES(image_path),
updated_at = VALUES(updated_at);

-- Insert sales data
INSERT INTO sales (id, product_id, quantity_sold, sale_price_per_unit, total_amount, sale_date) VALUES 
('22f23f00-85c0-11f0-b04d-244bfe876704', 'c2956e11-59bc-46d1-8666-8f8a987a518f', 1, 450.00, 450.00, '2025-08-30 16:41:11'),
('6de46a80-85c0-11f0-b04d-244bfe876704', 'c2956e11-59bc-46d1-8666-8f8a987a518f', 99, 450.00, 44550.00, '2025-08-30 16:43:17')
ON DUPLICATE KEY UPDATE 
quantity_sold = VALUES(quantity_sold),
sale_price_per_unit = VALUES(sale_price_per_unit),
total_amount = VALUES(total_amount);