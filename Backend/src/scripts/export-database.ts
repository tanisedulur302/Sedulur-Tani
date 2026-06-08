#!/usr/bin/env ts-node

/**
 * Script untuk export database MongoDB ke SQL
 *
 * Usage:
 *   npm run export:sql
 *   npm run export:sql -- --users --products
 *   npm run export:sql -- --output=./my-export.sql
 */

import { exportDatabaseToSQL, exportWithTimestamp } from "../utils/exportToSQL";
import path from "path";

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {
    includeUsers: args.includes("--users") || args.length === 0,
    includeProducts: args.includes("--products") || args.length === 0,
    includeOrders: args.includes("--orders") || args.length === 0,
    includeCategories: args.includes("--categories") || args.length === 0,
    includeAddresses: args.includes("--addresses") || args.length === 0,
  };

  // Check for custom output path
  const outputArg = args.find((arg) => arg.startsWith("--output="));
  const outputPath = outputArg ? outputArg.split("=")[1] : undefined;

  console.log("🚀 Starting database export...\n");
  console.log("Options:", options);
  console.log("");

  try {
    if (outputPath) {
      await exportDatabaseToSQL({ ...options, outputPath });
    } else {
      await exportWithTimestamp(options);
    }

    console.log("\n✅ Export completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Export failed:", error);
    process.exit(1);
  }
}

main();
