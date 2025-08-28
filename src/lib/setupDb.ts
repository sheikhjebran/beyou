// MySQL database setup script
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function setupDatabase() {
  // Create connection without database specified
  const tempConnection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'jebran',
    password: 'Arhaan@123'
  });

  try {
    // Create database if it doesn't exist
    await tempConnection.query('CREATE DATABASE IF NOT EXISTS beyou_db');
    await tempConnection.query('USE beyou_db');

    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt + ';');

    // Execute each statement
    for (const statement of statements) {
      await tempConnection.query(statement);
    }

    // Create default admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('Arhaan@123', 10);
    
    await tempConnection.query(
      `INSERT INTO users (id, email, password_hash, display_name, role) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       password_hash = VALUES(password_hash),
       display_name = VALUES(display_name)`,
      [adminId, 'jebran@beyou.com', hashedPassword, 'Jebran', 'admin']
    );

    console.log('Database setup completed successfully');
    console.log('Default admin user created:');
    console.log('Email: jebran@beyou.com');
    console.log('Password: Arhaan@123');

  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await tempConnection.end();
  }
}

// Run setup
setupDatabase().catch(console.error);
