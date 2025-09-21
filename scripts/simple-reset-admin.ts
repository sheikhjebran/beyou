import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function simpleResetAdmin() {
    try {
        console.log('Attempting to connect to MySQL...');
        
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',  // Try empty password first
            database: 'beyou_db'
        });

        console.log('Connected to database successfully');

        // First, let's see what tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Existing tables:', tables);

        // Create admin_user table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin_user (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Admin_user table created/verified');

        // Delete existing admin from correct table name
        const deleteResult = await connection.execute('DELETE FROM admin_user WHERE email = ?', ['admin@beyoushop.in']);
        console.log('Deleted existing admin users:', deleteResult);

        // Create new admin with correct schema
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminId = uuidv4();
        
        const insertResult = await connection.execute(
            'INSERT INTO admin_user (id, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [adminId, 'admin@beyoushop.in', hashedPassword, 'admin']
        );

        console.log('Created new admin user:', insertResult);
        console.log('');
        console.log('✅ Admin user reset successfully!');
        console.log('🆔 ID:', adminId);
        console.log('📧 Email: admin@beyoushop.in');
        console.log('🔒 Password: admin123');
        console.log('👤 Role: admin');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

simpleResetAdmin();