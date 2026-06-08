import prisma from "../database/prisma";
import fs from "fs";
import path from "path";

/**
 * Utility untuk export data MongoDB ke format SQL
 * untuk keperluan laporan dan backup
 */

interface ExportOptions {
  includeUsers?: boolean;
  includeProducts?: boolean;
  includeOrders?: boolean;
  includeCategories?: boolean;
  includeAddresses?: boolean;
  outputPath?: string;
}

/**
 * Escape string untuk SQL
 */
function escapeSQLString(str: string | null | undefined): string {
  if (!str) return "NULL";
  return `'${str.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
}

/**
 * Format date untuk SQL
 */
function formatSQLDate(date: Date | null | undefined): string {
  if (!date) return "NULL";
  return `'${date.toISOString().slice(0, 19).replace("T", " ")}'`;
}

/**
 * Export Users ke SQL
 */
async function exportUsers(): Promise<string> {
  const users = await prisma.user.findMany();

  let sql = `-- =============================================\n`;
  sql += `-- Export Users Table\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- =============================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS users (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  email VARCHAR(255) UNIQUE NOT NULL,\n`;
  sql += `  phone VARCHAR(50),\n`;
  sql += `  role ENUM('buyer', 'seller') NOT NULL,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  if (users.length > 0) {
    sql += `INSERT INTO users (id, name, email, phone, role, created_at, updated_at) VALUES\n`;

    const values = users.map((user, index) => {
      const isLast = index === users.length - 1;
      return `  (${escapeSQLString(user.id)}, ${escapeSQLString(user.name)}, ${escapeSQLString(user.email)}, ${escapeSQLString(user.phone)}, ${escapeSQLString(user.role)}, ${formatSQLDate(user.created_at)}, ${formatSQLDate(user.updated_at)})${isLast ? ";" : ","}`;
    });

    sql += values.join("\n") + "\n\n";
  }

  return sql;
}

/**
 * Export Categories ke SQL
 */
async function exportCategories(): Promise<string> {
  const categories = await prisma.category.findMany();

  let sql = `-- =============================================\n`;
  sql += `-- Export Categories Table\n`;
  sql += `-- =============================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS categories (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  slug VARCHAR(255) UNIQUE NOT NULL,\n`;
  sql += `  description TEXT,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  if (categories.length > 0) {
    sql += `INSERT INTO categories (id, name, slug, description, created_at, updated_at) VALUES\n`;

    const values = categories.map((cat, index) => {
      const isLast = index === categories.length - 1;
      return `  (${escapeSQLString(cat.id)}, ${escapeSQLString(cat.name)}, ${escapeSQLString(cat.slug)}, ${escapeSQLString(cat.description)}, ${formatSQLDate(cat.created_at)}, ${formatSQLDate(cat.updated_at)})${isLast ? ";" : ","}`;
    });

    sql += values.join("\n") + "\n\n";
  }

  return sql;
}

/**
 * Export Products ke SQL
 */
async function exportProducts(): Promise<string> {
  const products = await prisma.product.findMany();

  let sql = `-- =============================================\n`;
  sql += `-- Export Products Table\n`;
  sql += `-- =============================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS products (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  description TEXT,\n`;
  sql += `  price DECIMAL(10, 2) NOT NULL,\n`;
  sql += `  stock INT NOT NULL DEFAULT 0,\n`;
  sql += `  weight INT DEFAULT 0,\n`;
  sql += `  category VARCHAR(255),\n`;
  sql += `  image_url TEXT,\n`;
  sql += `  seller_id VARCHAR(255),\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL\n`;
  sql += `);\n\n`;

  if (products.length > 0) {
    sql += `INSERT INTO products (id, name, description, price, stock, weight, category, image_url, seller_id, created_at, updated_at) VALUES\n`;

    const values = products.map((product, index) => {
      const isLast = index === products.length - 1;
      return `  (${escapeSQLString(product.id)}, ${escapeSQLString(product.name)}, ${escapeSQLString(product.description)}, ${product.price}, ${product.stock}, ${product.weight || 0}, ${escapeSQLString(product.category)}, ${escapeSQLString(product.image_url)}, ${escapeSQLString(product.seller_id)}, ${formatSQLDate(product.created_at)}, ${formatSQLDate(product.updated_at)})${isLast ? ";" : ","}`;
    });

    sql += values.join("\n") + "\n\n";
  }

  return sql;
}

/**
 * Export Addresses ke SQL
 */
async function exportAddresses(): Promise<string> {
  const addresses = await prisma.address.findMany();

  let sql = `-- =============================================\n`;
  sql += `-- Export Addresses Table\n`;
  sql += `-- =============================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS addresses (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  user_id VARCHAR(255) NOT NULL,\n`;
  sql += `  label VARCHAR(100),\n`;
  sql += `  recipient_name VARCHAR(255) NOT NULL,\n`;
  sql += `  phone VARCHAR(50) NOT NULL,\n`;
  sql += `  province VARCHAR(255) NOT NULL,\n`;
  sql += `  city VARCHAR(255) NOT NULL,\n`;
  sql += `  district VARCHAR(255) NOT NULL,\n`;
  sql += `  postal_code VARCHAR(10),\n`;
  sql += `  full_address TEXT NOT NULL,\n`;
  sql += `  is_default BOOLEAN DEFAULT FALSE,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n`;
  sql += `);\n\n`;

  if (addresses.length > 0) {
    sql += `INSERT INTO addresses (id, user_id, label, recipient_name, phone, province, city, district, postal_code, full_address, is_default, created_at, updated_at) VALUES\n`;

    const values = addresses.map((addr, index) => {
      const isLast = index === addresses.length - 1;
      return `  (${escapeSQLString(addr.id)}, ${escapeSQLString(addr.user_id)}, ${escapeSQLString(addr.label)}, ${escapeSQLString(addr.recipient_name)}, ${escapeSQLString(addr.phone)}, ${escapeSQLString(addr.province)}, ${escapeSQLString(addr.city)}, ${escapeSQLString(addr.district)}, ${escapeSQLString(addr.postal_code)}, ${escapeSQLString(addr.full_address)}, ${addr.is_default ? 1 : 0}, ${formatSQLDate(addr.created_at)}, ${formatSQLDate(addr.updated_at)})${isLast ? ";" : ","}`;
    });

    sql += values.join("\n") + "\n\n";
  }

  return sql;
}

/**
 * Export Orders ke SQL
 */
async function exportOrders(): Promise<string> {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
  });

  let sql = `-- =============================================\n`;
  sql += `-- Export Orders Table\n`;
  sql += `-- =============================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS orders (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  user_id VARCHAR(255) NOT NULL,\n`;
  sql += `  total_amount DECIMAL(10, 2) NOT NULL,\n`;
  sql += `  shipping_cost DECIMAL(10, 2) DEFAULT 0,\n`;
  sql += `  status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',\n`;
  sql += `  payment_status ENUM('pending', 'paid', 'failed', 'expired') DEFAULT 'pending',\n`;
  sql += `  shipping_address TEXT,\n`;
  sql += `  notes TEXT,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS order_items (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  order_id VARCHAR(255) NOT NULL,\n`;
  sql += `  product_id VARCHAR(255) NOT NULL,\n`;
  sql += `  quantity INT NOT NULL,\n`;
  sql += `  price DECIMAL(10, 2) NOT NULL,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,\n`;
  sql += `  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE\n`;
  sql += `);\n\n`;

  if (orders.length > 0) {
    sql += `INSERT INTO orders (id, user_id, total_amount, shipping_cost, status, payment_status, shipping_address, notes, created_at, updated_at) VALUES\n`;

    const orderValues = orders.map((order, index) => {
      const isLast = index === orders.length - 1;
      return `  (${escapeSQLString(order.id)}, ${escapeSQLString(order.user_id)}, ${order.total_amount}, ${order.shipping_cost || 0}, ${escapeSQLString(order.status)}, ${escapeSQLString(order.payment_status)}, ${escapeSQLString(order.shipping_address)}, ${escapeSQLString(order.notes)}, ${formatSQLDate(order.created_at)}, ${formatSQLDate(order.updated_at)})${isLast ? ";" : ","}`;
    });

    sql += orderValues.join("\n") + "\n\n";

    // Export order items
    const allItems = orders.flatMap((order) => order.items);
    if (allItems.length > 0) {
      sql += `INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at) VALUES\n`;

      const itemValues = allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        return `  (${escapeSQLString(item.id)}, ${escapeSQLString(item.order_id)}, ${escapeSQLString(item.product_id)}, ${item.quantity}, ${item.price}, ${formatSQLDate(item.created_at)})${isLast ? ";" : ","}`;
      });

      sql += itemValues.join("\n") + "\n\n";
    }
  }

  return sql;
}

/**
 * Main export function
 */
export async function exportDatabaseToSQL(
  options: ExportOptions = {},
): Promise<string> {
  const {
    includeUsers = true,
    includeProducts = true,
    includeOrders = true,
    includeCategories = true,
    includeAddresses = true,
    outputPath,
  } = options;

  let fullSQL = `-- =============================================\n`;
  fullSQL += `-- Sedulur Tani Database Export\n`;
  fullSQL += `-- MongoDB to MySQL/MariaDB\n`;
  fullSQL += `-- Generated: ${new Date().toLocaleString("id-ID")}\n`;
  fullSQL += `-- =============================================\n\n`;
  fullSQL += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

  try {
    if (includeUsers) {
      console.log("Exporting users...");
      fullSQL += await exportUsers();
    }

    if (includeCategories) {
      console.log("Exporting categories...");
      fullSQL += await exportCategories();
    }

    if (includeProducts) {
      console.log("Exporting products...");
      fullSQL += await exportProducts();
    }

    if (includeAddresses) {
      console.log("Exporting addresses...");
      fullSQL += await exportAddresses();
    }

    if (includeOrders) {
      console.log("Exporting orders...");
      fullSQL += await exportOrders();
    }

    fullSQL += `\nSET FOREIGN_KEY_CHECKS=1;\n`;
    fullSQL += `\n-- Export completed successfully\n`;

    // Save to file if path provided
    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, fullSQL, "utf-8");
      console.log(`✅ SQL file saved to: ${outputPath}`);
    }

    return fullSQL;
  } catch (error) {
    console.error("Error exporting database:", error);
    throw error;
  }
}

/**
 * Export dengan nama file otomatis
 */
export async function exportWithTimestamp(
  options: ExportOptions = {},
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const filename = `sedulur-tani-export-${timestamp}.sql`;
  const outputPath = path.join(process.cwd(), "exports", filename);

  return await exportDatabaseToSQL({
    ...options,
    outputPath,
  });
}
