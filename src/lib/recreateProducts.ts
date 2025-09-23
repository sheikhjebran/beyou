// MySQL database setup script
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

async function recreateProducts() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'jebran',
    password: 'Arhaan@123',
    database: 'beyou_db'
  });

  try {
    // Read and execute recreate-products script
    const recreateProductsPath = path.join(process.cwd(), 'src', 'lib', 'recreate-products.sql');
    const recreateScript = await fs.readFile(recreateProductsPath, 'utf8');
    
    // Split script into individual statements
    const statements = recreateScript
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt + ';');

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim() !== ';') {
        await connection.query(statement);
      }
    }

    console.log('Products table recreated successfully');

  } catch (error) {
    console.error('Error recreating products table:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run setup
recreateProducts().catch(console.error);
