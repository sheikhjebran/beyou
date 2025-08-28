import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function createAdminUser() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'beyou_db'
        });

        // Create admin users table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if admin user already exists
        const [existingUsers] = await connection.execute(
            'SELECT * FROM admin_users WHERE email = ?',
            ['admin@beyou.com']
        );

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            console.log('Admin user already exists');
            await connection.end();
            return;
        }

        // Create admin user
        const password = 'Admin@123'; // You should change this password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await connection.execute(
            'INSERT INTO admin_users (id, email, password, role) VALUES (UUID(), ?, ?, ?)',
            ['admin@beyou.com', hashedPassword, 'admin']
        );

        console.log('Admin user created successfully');
        console.log('Email: admin@beyou.com');
        console.log('Password: Admin@123');

        await connection.end();
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
