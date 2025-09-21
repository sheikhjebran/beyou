import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function resetAdminUser() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'ayesha',
            password: process.env.MYSQL_PASSWORD || 'ayesha@beyou',
            database: process.env.MYSQL_DATABASE || 'beyou_db',
            connectTimeout: 60000,
        });

        // Delete existing admin user
        await connection.execute(
            'DELETE FROM admin_users WHERE email = ?',
            ['admin@beyou.com']
        );

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        // Create new admin user
        const [result] = await connection.execute(
            'INSERT INTO admin_users (id, email, password) VALUES (?, ?, ?)',
            ['admin-001', 'admin@beyou.com', hashedPassword]
        );

        console.log('Admin user reset successfully!');
        console.log('Email: admin@beyou.com');
        console.log('Password: admin123');
        console.log('Result:', result);

        await connection.end();

    } catch (error) {
        console.error('Error resetting admin user:', error);
        process.exit(1);
    }
}

// Run the function
resetAdminUser();
