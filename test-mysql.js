// Quick MySQL connection test
import "dotenv/config";
import mysql from "mysql2/promise";

async function testConnection() {
  try {
    console.log("Testing MySQL connection...");
    console.log("Host:", process.env.MYSQL_HOST);
    console.log("User:", process.env.MYSQL_USER);
    console.log("Database:", process.env.MYSQL_DATABASE);

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      port: parseInt(process.env.MYSQL_PORT || "3306"),
    });

    console.log("✅ Connected successfully!");

    // Test basic query
    const [rows] = await connection.query("SELECT 1 as test");
    console.log("✅ Query test:", rows);

    await connection.end();
    console.log("✅ Connection closed successfully");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("Error code:", error.code);
  }
}

testConnection();
