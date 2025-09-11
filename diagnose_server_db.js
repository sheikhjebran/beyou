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
    console.log(`Note: Could not load ${filePath}`);
  }
}

// Load environment files in order of priority
async function loadEnvironment() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = join(__dirname, "..", "..");

    await loadEnvFile(join(projectRoot, ".env"));
    await loadEnvFile(join(projectRoot, ".env.production"));
    await loadEnvFile(join(projectRoot, ".env.local"));
  } catch (error) {
    console.log("Note: Using system environment variables only");
  }
}

async function diagnoseDatabase() {
  await loadEnvironment();

  try {
    console.log("🔍 Diagnosing server database state...");
    console.log(`📍 Connecting to: ${process.env.MYSQL_HOST}:3306`);
    console.log(`👤 User: ${process.env.MYSQL_USER}`);
    console.log(`🗄️  Database: ${process.env.MYSQL_DATABASE}`);

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "beyou_db",
    });

    console.log("✅ Connected to server database");

    // Check what tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(`\n📊 Found ${tables.length} tables:`);
    tables.forEach((table) => {
      console.log("  - " + Object.values(table)[0]);
    });

    // Check migrations table
    console.log("\n📝 Migration history:");
    try {
      const [migrations] = await connection.execute(
        "SELECT * FROM migrations ORDER BY id"
      );
      if (migrations.length === 0) {
        console.log("  ❌ No migrations recorded");
      } else {
        migrations.forEach((migration) => {
          console.log(
            `  ✅ ${migration.id}: ${migration.name} (${migration.executed_at})`
          );
        });
      }
    } catch (error) {
      console.log("  ❌ Migrations table does not exist");
    }

    // Check if admin_users table was created and has data
    console.log("\n👥 Admin Users:");
    try {
      const [adminTable] = await connection.execute("DESCRIBE admin_users");
      console.log("  ✅ admin_users table exists with columns:");
      adminTable.forEach((col) =>
        console.log(`    - ${col.Field} (${col.Type})`)
      );

      const [adminCount] = await connection.execute(
        "SELECT COUNT(*) as count FROM admin_users"
      );
      console.log(`  📊 Records: ${adminCount[0].count}`);

      if (adminCount[0].count > 0) {
        const [adminUsers] = await connection.execute(
          "SELECT id, email, role FROM admin_users"
        );
        adminUsers.forEach((user) => {
          console.log(`    - ${user.email} (${user.role})`);
        });
      }
    } catch (error) {
      console.log("  ❌ admin_users table does not exist");
    }

    // Check core tables and their data
    console.log("\n📊 Data Summary:");
    const tablesToCheck = [
      "users",
      "products",
      "product_images",
      "banners",
      "category_images",
      "sales",
    ];
    for (const table of tablesToCheck) {
      try {
        const [count] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        console.log(`  ${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`  ${table}: ❌ table does not exist`);
      }
    }

    // Test a sample migration SQL to see if it would work
    console.log("\n🧪 Testing SQL execution:");
    try {
      await connection.execute("SELECT 1 as test");
      console.log("  ✅ Basic SQL execution works");
    } catch (error) {
      console.log("  ❌ SQL execution failed:", error.message);
    }

    await connection.end();
    console.log("\n🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Diagnosis failed:", error.message);
    console.error("Full error:", error);
  }
}

diagnoseDatabase();
