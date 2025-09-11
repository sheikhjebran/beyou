import pool from './server/mysql';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function initializeDatabase() {
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    const connection = await pool.getConnection();
    
    try {
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      
      // Create default admin user
      const adminExists = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        ['jebran@beyou.com']
      );
      
      if (!adminExists[0] || !(adminExists[0] as any[]).length) {
        const hashedPassword = await bcrypt.hash('Arhaan@123', 10);
        await connection.query(
          'INSERT INTO users (id, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), 'jebran@beyou.com', hashedPassword, 'Jebran', 'admin']
        );
        console.log('Default admin user created');
      }
      
      console.log('Database initialized successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
