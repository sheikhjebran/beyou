// Update MySQL database tables
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

async function updateTables() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'jebran',
    password: 'Arhaan@123',
    database: 'beyou_db'
  });

  try {
    // Read and execute update script
    const updatePath = path.join(process.cwd(), 'src', 'lib', 'update-products.sql');
    const updateScript = await fs.readFile(updatePath, 'utf8');
    
    // Split script into individual statements
    const statements = updateScript
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt + ';');

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim() !== ';') {
        console.log('Executing:', statement);
        await connection.query(statement);
      }
    }

    console.log('Database tables updated successfully');

  } catch (error) {
    console.error('Error updating database tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run update
updateTables().catch(console.error);
