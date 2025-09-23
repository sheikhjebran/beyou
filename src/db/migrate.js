// Database migration runner - JavaScript version for server deployment
import mysql from "mysql2/promise";
import { promises as fs } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables from .env files manually
async function loadEnvFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch (error) {
    // File doesn't exist or can't be read, ignore
    console.log(`Note: Could not load ${filePath}`);
  }
}

// Load environment files in order of priority
async function loadEnvironment() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = join(__dirname, "..", "..");

    // Load .env files in priority order
    await loadEnvFile(join(projectRoot, ".env"));
    await loadEnvFile(join(projectRoot, ".env.production"));
    await loadEnvFile(join(projectRoot, ".env.local"));
  } catch (error) {
    console.log("Note: Using system environment variables only");
  }
}

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

        // Parse SQL statements properly
        const statements = [];
        const lines = migrationSQL.split("\n");
        let currentStatement = "";

        for (const line of lines) {
          const trimmedLine = line.trim();

          // Skip empty lines and comments
          if (!trimmedLine || trimmedLine.startsWith("--")) {
            continue;
          }

          // Skip problematic database-level commands
          if (
            trimmedLine.toUpperCase().includes("CREATE DATABASE") ||
            trimmedLine.toUpperCase().startsWith("USE ")
          ) {
            continue;
          }

          currentStatement += line + "\n";

          // If line ends with semicolon, we have a complete statement
          if (trimmedLine.endsWith(";")) {
            const stmt = currentStatement.trim();
            if (stmt && stmt.length > 1) {
              statements.push(stmt);
            }
            currentStatement = "";
          }
        }

        // Add any remaining statement
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }

        console.log(`📝 Executing ${statements.length} SQL statements...`);

        for (const statement of statements) {
          if (statement.trim()) {
            console.log(`   → ${statement.substring(0, 50)}...`);
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

// Main execution
async function main() {
  await loadEnvironment();

  // Check if reset flags are passed
  const shouldReset = process.argv.includes("--reset");
  const shouldForceReset = process.argv.includes("--force-reset");

  if (shouldForceReset) {
    console.log(
      "🔥 Force reset flag detected - will drop all tables and re-run all migrations"
    );
    await forceResetDatabase();
  } else if (shouldReset) {
    console.log(
      "🔄 Reset flag detected - will clear migration history and re-run all migrations"
    );
    await resetMigrations();
  } else {
    await runMigrations();
  }
}

async function forceResetDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
  });

  try {
    await connection.query(`USE ${process.env.MYSQL_DATABASE || "beyou_db"}`);

    console.log("🗑️  Dropping all tables...");

    // Get all tables
    const [tables] = await connection.query("SHOW TABLES");

    if (tables.length > 0) {
      // Disable foreign key checks
      await connection.query("SET FOREIGN_KEY_CHECKS = 0");

      // Drop all tables
      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0];
        console.log(`  🗑️  Dropping table: ${tableName}`);
        await connection.query(`DROP TABLE ${tableName}`);
      }

      // Re-enable foreign key checks
      await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    console.log("✅ All tables dropped, now running migrations...");
    await connection.end();

    // Now run migrations normally
    await runMigrations();
  } catch (error) {
    console.error("❌ Force reset failed:", error.message);
    await connection.end();
    throw error;
  }
}

async function resetMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
  });

  try {
    await connection.query(`USE ${process.env.MYSQL_DATABASE || "beyou_db"}`);

    console.log("🗑️  Clearing migration history...");
    await connection.query("DELETE FROM migrations");

    console.log("✅ Migration history cleared, now running migrations...");
    await connection.end();

    // Now run migrations normally
    await runMigrations();
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    await connection.end();
    throw error;
  }
}

// Run migrations
main()
  .then(() => {
    console.log("✨ Migration process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration process failed:", error.message);
    process.exit(1);
  });
