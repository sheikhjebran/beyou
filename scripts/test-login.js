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

async function testLogin() {
  await loadEnvironment();

  try {
    console.log("🧪 Testing login API logic...");
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

    const testEmail = "admin@beyou.com";
    const testPassword = "Admin@123";

    console.log(`\n🔍 Looking for user: ${testEmail}`);

    // Test the same query as the API
    const [users] = await connection.execute(
      "SELECT * FROM admin_users WHERE email = ?",
      [testEmail]
    );

    console.log(
      `📊 Query result: Found ${Array.isArray(users) ? users.length : 0} users`
    );

    if (!Array.isArray(users) || users.length === 0) {
      console.log("❌ No user found with that email");

      // Check what users actually exist
      const [allUsers] = await connection.execute(
        "SELECT id, email, role FROM admin_users"
      );
      console.log("\n👥 All admin users in database:");
      if (Array.isArray(allUsers)) {
        allUsers.forEach((user, index) => {
          console.log(
            `  ${index + 1}. ${user.email} (${user.role}) - ID: ${user.id}`
          );
        });
      }

      await connection.end();
      return;
    }

    const user = users[0];
    console.log(`\n👤 Found user:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(
      `   Password hash: ${
        user.password ? user.password.substring(0, 20) + "..." : "NULL"
      }`
    );

    // Test password comparison
    console.log(`\n🔐 Testing password comparison...`);
    console.log(`   Input password: ${testPassword}`);

    if (user.password) {
      const passwordMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Password match: ${passwordMatch ? "✅ YES" : "❌ NO"}`);

      if (passwordMatch) {
        console.log("\n🎉 Login should work! The API logic is correct.");
      } else {
        console.log("\n❌ Password mismatch - this is the issue!");

        // Test creating a new hash
        console.log("\n🔄 Creating new hash for comparison...");
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log(`   New hash: ${newHash.substring(0, 20)}...`);
        const newHashMatch = await bcrypt.compare(testPassword, newHash);
        console.log(`   New hash match: ${newHashMatch ? "✅ YES" : "❌ NO"}`);
      }
    } else {
      console.log("   ❌ User has no password hash stored!");
    }

    // Test JWT_SECRET
    console.log(
      `\n🔑 JWT_SECRET: ${process.env.JWT_SECRET ? "SET" : "NOT SET"}`
    );

    await connection.end();
    console.log("\n🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testLogin();
