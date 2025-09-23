import mysql from "mysql2/promise";

async function getTableInfo() {
  try {
    // Create the connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "beyou_db",
    });

    // Get all tables
    const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'beyou_db'
        `);

    console.log("Tables in beyou_db:");
    for (const table of tables) {
      console.log(`\nTable: ${table.table_name}`);

      // Get table structure
      const [columns] = await connection.query(
        `
                SELECT 
                    column_name,
                    column_type,
                    is_nullable,
                    column_key,
                    column_default,
                    extra
                FROM information_schema.columns
                WHERE table_schema = 'beyou_db'
                AND table_name = ?
                ORDER BY ordinal_position
            `,
        [table.table_name]
      );

      console.log("Columns:");
      columns.forEach((col) => {
        console.log(`  ${col.column_name}:`);
        console.log(`    Type: ${col.column_type}`);
        console.log(`    Nullable: ${col.is_nullable}`);
        console.log(`    Key: ${col.column_key}`);
        if (col.column_default !== null) {
          console.log(`    Default: ${col.column_default}`);
        }
        if (col.extra) {
          console.log(`    Extra: ${col.extra}`);
        }
      });
    }

    await connection.end();
  } catch (error) {
    console.error("Error:", error);
  }
}

getTableInfo();
