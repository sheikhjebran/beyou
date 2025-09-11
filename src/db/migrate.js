// Database migration runner - JavaScript version for server deployment
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { promises as fs } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables
dotenv.config();

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
  });

  try {
    console.log("🚀 Starting database migration...");
    console.log(
      `📍 Connecting to: ${process.env.MYSQL_HOST}:${
        process.env.MYSQL_PORT || "3306"
      }`
    );
    console.log(`👤 User: ${process.env.MYSQL_USER}`);
    console.log(`🗄️  Database: ${process.env.MYSQL_DATABASE || "beyou_db"}`);

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${
        process.env.MYSQL_DATABASE || "beyou_db"
      }`
    );
    await connection.query(`USE ${process.env.MYSQL_DATABASE || "beyou_db"}`);

    console.log("✅ Database created/connected successfully");

    // Create migrations table if it doesn't exist
    await connection.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    console.log("✅ Migrations table ready");

    // Get list of executed migrations
    const [rows] = await connection.query(
      "SELECT * FROM migrations ORDER BY id"
    );
    const executedMigrations = new Set(rows.map((row) => row.id));

    // Read migration files
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const migrationsDir = join(__dirname, "migrations");
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter((f) => f.endsWith(".sql")).sort(); // Ensure ordered execution

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Execute new migrations
    for (const file of migrationFiles) {
      // Extract migration ID from filename (e.g., "001_initial_schema.sql" -> 1)
      const match = file.match(/^(\d+)_/);
      if (!match) {
        console.warn(`⚠️  Skipping file with invalid format: ${file}`);
        continue;
      }

      const migrationId = parseInt(match[1]);

      if (executedMigrations.has(migrationId)) {
        console.log(`⏭️  Skipping already executed migration: ${file}`);
        continue;
      }

      console.log(`📄 Executing migration: ${file}`);

      try {
        const migrationPath = join(migrationsDir, file);
        const migrationSQL = await fs.readFile(migrationPath, "utf8");

        // Split by semicolon and execute each statement
        const statements = migrationSQL
          .split(";")
          .map((stmt) => stmt.trim())
          .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

        for (const statement of statements) {
          if (statement.trim()) {
            await connection.query(statement);
          }
        }

        // Record the migration as executed
        await connection.query(
          "INSERT INTO migrations (id, name) VALUES (?, ?)",
          [migrationId, file]
        );

        console.log(`✅ Migration completed: ${file}`);
      } catch (migrationError) {
        console.error(`❌ Migration failed: ${file}`);
        console.error("Error:", migrationError.message);
        throw migrationError;
      }
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Error details:", error);
    throw error;
  } finally {
    await connection.end();
    console.log("🔒 Database connection closed");
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log("✨ Migration process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration process failed:", error.message);
    process.exit(1);
  });
