import mysql from "mysql2/promise";

async function testServerConnection() {
  try {
    const connection = await mysql.createConnection({
      host: "66.116.198.204",
      user: "ayesha",
      password: "ayesha@beyou",
      database: "beyou_db",
    });

    console.log("✅ Connected to server database");

    // Check what tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log("Current tables:");
    tables.forEach((table) => {
      console.log("- " + Object.values(table)[0]);
    });

    // Check migrations table
    const [migrations] = await connection.execute(
      "SELECT * FROM migrations ORDER BY id"
    );
    console.log("\nMigrations executed:");
    migrations.forEach((migration) => {
      console.log(
        `- ${migration.id}: ${migration.name} (${migration.executed_at})`
      );
    });

    // Check if admin_users table was created
    try {
      const [adminTable] = await connection.execute("DESCRIBE admin_users");
      console.log("\n✅ admin_users table exists with columns:");
      adminTable.forEach((col) =>
        console.log(`  - ${col.Field} (${col.Type})`)
      );
    } catch (error) {
      console.log("\n❌ admin_users table does not exist");
    }

    // Count records in key tables
    const tablesToCheck = ["users", "products", "banners", "category_images"];
    for (const table of tablesToCheck) {
      try {
        const [count] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        console.log(`${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`${table}: table does not exist`);
      }
    }

    await connection.end();
  } catch (error) {
    console.error("Connection error:", error.message);
  }
}

testServerConnection();
