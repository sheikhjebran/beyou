import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function resetAdminUser() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'beyou_db'
        });

        // Delete existing admin user
        await connection.execute(
            'DELETE FROM admin_users WHERE email = ?',
            ['admin@beyou.com']
        );

        // Create new admin user
        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await connection.execute(
            'INSERT INTO admin_users (id, email, password, role) VALUES (UUID(), ?, ?, ?)',
            ['admin@beyou.com', hashedPassword, 'admin']
        );

        console.log('Admin user reset successfully');
        console.log('Email: admin@beyou.com');
        console.log('Password: Admin@123');

        await connection.end();
    } catch (error) {
        console.error('Error resetting admin user:', error);
        process.exit(1);
    }
}

resetAdminUser();
