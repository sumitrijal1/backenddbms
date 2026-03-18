-- ============================================================
--  E-COMMERCE SHOP MANAGEMENT SYSTEM  –  MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS shopdb;
USE shopdb;

-- ─── Users / Customers ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','customer') DEFAULT 'customer',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE
);

-- ─── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  stock        INT NOT NULL DEFAULT 0,
  category_id  INT,
  image_url    VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ─── Orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status       ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Order Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Cart ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  UNIQUE KEY unique_cart (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Seed Data ───────────────────────────────────────────────
INSERT IGNORE INTO categories (name) VALUES
  ('Electronics'), ('Clothing'), ('Books'), ('Home & Kitchen'), ('Sports');

INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@shop.com', '$2b$10$rQZ8K1mN2pL4vX6yA9bC8OdJkFgHiMnOpQrStUvWxYzAbCdEfGhIj', 'admin'),
  ('John Doe',   'john@example.com', '$2b$10$rQZ8K1mN2pL4vX6yA9bC8OdJkFgHiMnOpQrStUvWxYzAbCdEfGhIj', 'customer');

INSERT IGNORE INTO products (name, description, price, stock, category_id, image_url) VALUES
  ('Wireless Headphones', 'Premium noise-cancelling headphones with 30hr battery', 4999.00, 50, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
  ('Running Shoes',       'Lightweight breathable mesh running shoes',             2499.00, 100, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
  ('JavaScript Book',     'Complete guide to modern JavaScript (ES2024)',          899.00,  30, 3,  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
  ('Coffee Maker',        'Programmable 12-cup coffee maker with thermal carafe',  3299.00, 25, 4,  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'),
  ('Smart Watch',         'Fitness tracker with heart rate monitor & GPS',         7999.00, 40, 1,  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
  ('Cotton T-Shirt',      'Premium 100% organic cotton unisex t-shirt',            599.00, 200, 2,  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400');
