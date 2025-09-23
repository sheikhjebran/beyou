import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
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

// Load environment files
async function loadEnvironment() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = join(__dirname, "..");

    await loadEnvFile(join(projectRoot, ".env"));
    await loadEnvFile(join(projectRoot, ".env.production"));
    await loadEnvFile(join(projectRoot, ".env.local"));
  } catch (error) {
    console.log("Note: Using system environment variables only");
  }
}

async function resetAdminUser() {
  await loadEnvironment();

  try {
    console.log("🔧 Resetting admin user...");
    console.log(`📍 Connecting to: ${process.env.MYSQL_HOST}:3306`);
    console.log(`👤 User: ${process.env.MYSQL_USER}`);
    console.log(`🗄️  Database: ${process.env.MYSQL_DATABASE}`);

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "beyou_db",
    });

    console.log("✅ Connected to database");

    // Admin credentials
    const adminEmail = "admin@beyou.com";
    const adminPassword = "Admin@123";

    // Hash the password
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin_users table exists and reset admin
    try {
      console.log("🗑️  Removing existing admin user...");
      await connection.execute("DELETE FROM admin_users WHERE email = ?", [
        adminEmail,
      ]);

      console.log("👤 Creating new admin user...");
      await connection.execute(
        "INSERT INTO admin_users (id, email, password, role, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())",
        [adminEmail, hashedPassword, "admin"]
      );

      console.log("✅ Admin user in admin_users table updated");
    } catch (error) {
      if (error.code === "ER_NO_SUCH_TABLE") {
        console.log("❌ admin_users table does not exist - creating it...");

        // Create admin_users table
        await connection.execute(`
          CREATE TABLE admin_users (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);

        console.log("✅ admin_users table created");

        // Insert admin user
        await connection.execute(
          "INSERT INTO admin_users (email, password, role) VALUES (?, ?, ?)",
          [adminEmail, hashedPassword, "admin"]
        );

        console.log("✅ Admin user created");
      } else {
        throw error;
      }
    }

    // Also check/update regular users table if admin exists there
    try {
      console.log("🔍 Checking users table for admin...");
      const [existingUser] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [adminEmail]
      );

      if (existingUser.length > 0) {
        console.log("🔄 Updating admin in users table...");
        await connection.execute(
          "UPDATE users SET password_hash = ?, role = 'admin', updated_at = NOW() WHERE email = ?",
          [hashedPassword, adminEmail]
        );
      } else {
        try {
          console.log("➕ Adding admin to users table...");
          await connection.execute(
            "INSERT INTO users (id, email, password_hash, display_name, role, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())",
            [adminEmail, hashedPassword, "Admin", "admin"]
          );
        } catch (insertError) {
          console.log(
            "ℹ️  Could not insert into users table (table may not exist or have different schema)"
          );
        }
      }
    } catch (error) {
      console.log(
        "ℹ️  users table does not exist or has different schema - skipping"
      );
    }

    console.log("\n🎉 Admin user reset successfully!");
    console.log("\n📧 Login Credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n🔐 You can now log in to the admin panel");

    await connection.end();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Admin reset failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

resetAdminUser();
