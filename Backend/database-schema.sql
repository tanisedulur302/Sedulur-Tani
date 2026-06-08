-- =============================================
-- Sedulur Tani Database Schema
-- MySQL/MariaDB Version
-- Generated: 2024
-- =============================================

-- Disable foreign key checks untuk import
SET FOREIGN_KEY_CHECKS=0;

-- Drop tables jika sudah ada (opsional)
-- DROP TABLE IF EXISTS payment_notifications;
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS shipments;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS checkouts;
-- DROP TABLE IF EXISTS cart_items;
-- DROP TABLE IF EXISTS carts;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS user_addresses;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS categories;

-- =============================================
-- Table: users
-- =============================================
CREATE TABLE users (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('buyer', 'seller') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: user_addresses
-- =============================================
CREATE TABLE user_addresses (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    label VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: categories
-- =============================================
CREATE TABLE categories (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: products
-- =============================================
CREATE TABLE products (
    id VARCHAR(24) PRIMARY KEY,
    seller_id VARCHAR(24) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    weight INT NOT NULL DEFAULT 0 COMMENT 'Weight in grams',
    price DECIMAL(12, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: carts
-- =============================================
CREATE TABLE carts (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: cart_items
-- =============================================
CREATE TABLE cart_items (
    id VARCHAR(24) PRIMARY KEY,
    cart_id VARCHAR(24) NOT NULL,
    product_id VARCHAR(24) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id),
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: checkouts
-- =============================================
CREATE TABLE checkouts (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    shipping_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    status ENUM('pending', 'paid', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: orders
-- =============================================
CREATE TABLE orders (
    id VARCHAR(24) PRIMARY KEY,
    checkout_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    product_id VARCHAR(24) NOT NULL,
    quantity INT NOT NULL,
    price_each DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'processed', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (checkout_id) REFERENCES checkouts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_checkout_id (checkout_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: shipments
-- =============================================
CREATE TABLE shipments (
    id VARCHAR(24) PRIMARY KEY,
    order_id VARCHAR(24) NOT NULL,
    courier_name VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(255),
    status ENUM('packing', 'shipping', 'delivered') DEFAULT 'packing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_tracking_number (tracking_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: payments
-- =============================================
CREATE TABLE payments (
    id VARCHAR(24) PRIMARY KEY,
    checkout_id VARCHAR(24) NOT NULL,
    xendit_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    gross_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(100),
    transaction_status VARCHAR(50) NOT NULL,
    transaction_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (checkout_id) REFERENCES checkouts(id) ON DELETE CASCADE,
    INDEX idx_checkout_id (checkout_id),
    INDEX idx_xendit_invoice_id (xendit_invoice_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_transaction_status (transaction_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: payment_notifications
-- =============================================
CREATE TABLE payment_notifications (
    id VARCHAR(24) PRIMARY KEY,
    payment_id VARCHAR(24) NOT NULL,
    raw_body TEXT NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_received_at (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enable foreign key checks kembali
SET FOREIGN_KEY_CHECKS=1;

-- =============================================
-- Views untuk Laporan (Optional)
-- =============================================

-- View: Ringkasan Produk per Kategori
CREATE OR REPLACE VIEW v_products_by_category AS
SELECT 
    category,
    COUNT(*) as total_products,
    SUM(stock) as total_stock,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products
GROUP BY category;

-- View: Ringkasan Penjualan per Seller
CREATE OR REPLACE VIEW v_sales_by_seller AS
SELECT 
    u.id as seller_id,
    u.name as seller_name,
    u.email as seller_email,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_price) as total_revenue,
    AVG(o.total_price) as avg_order_value
FROM users u
INNER JOIN products p ON u.id = p.seller_id
INNER JOIN orders o ON p.id = o.product_id
WHERE u.role = 'seller'
GROUP BY u.id, u.name, u.email;

-- View: Status Pesanan Terkini
CREATE OR REPLACE VIEW v_order_status_summary AS
SELECT 
    status,
    COUNT(*) as total_orders,
    SUM(total_price) as total_value
FROM orders
GROUP BY status;

-- View: Produk Stok Rendah (≤ 10)
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.stock,
    p.price,
    u.name as seller_name,
    u.email as seller_email
FROM products p
INNER JOIN users u ON p.seller_id = u.id
WHERE p.stock <= 10 AND p.stock > 0
ORDER BY p.stock ASC;

-- View: Produk Stok Habis
CREATE OR REPLACE VIEW v_out_of_stock_products AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    u.name as seller_name,
    u.email as seller_email
FROM products p
INNER JOIN users u ON p.seller_id = u.id
WHERE p.stock = 0;

-- =============================================
-- Sample Queries untuk Laporan
-- =============================================

-- Query 1: Total Penjualan per Bulan
-- SELECT 
--     DATE_FORMAT(created_at, '%Y-%m') as month,
--     COUNT(*) as total_orders,
--     SUM(total_price) as total_revenue
-- FROM orders
-- WHERE status != 'cancelled'
-- GROUP BY DATE_FORMAT(created_at, '%Y-%m')
-- ORDER BY month DESC;

-- Query 2: Top 10 Produk Terlaris
-- SELECT 
--     p.name,
--     p.category,
--     SUM(o.quantity) as total_sold,
--     SUM(o.total_price) as total_revenue
-- FROM products p
-- INNER JOIN orders o ON p.id = o.product_id
-- WHERE o.status != 'cancelled'
-- GROUP BY p.id, p.name, p.category
-- ORDER BY total_sold DESC
-- LIMIT 10;

-- Query 3: Pembeli Paling Aktif
-- SELECT 
--     u.name,
--     u.email,
--     COUNT(DISTINCT c.id) as total_checkouts,
--     SUM(c.grand_total) as total_spent
-- FROM users u
-- INNER JOIN checkouts c ON u.id = c.user_id
-- WHERE u.role = 'buyer' AND c.status = 'paid'
-- GROUP BY u.id, u.name, u.email
-- ORDER BY total_spent DESC
-- LIMIT 10;

-- =============================================
-- End of Schema
-- =============================================
