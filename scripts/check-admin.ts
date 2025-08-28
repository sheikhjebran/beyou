import mysql from 'mysql2/promise';

async function checkAdminUser() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'beyou_db'
        });

        console.log('Connected to database');

        // Check if admin users table exists
        const [tables] = await connection.execute(
            'SHOW TABLES LIKE "admin_users"'
        );
        console.log('Tables like admin_users:', tables);

        if (Array.isArray(tables) && tables.length > 0) {
            // Check admin users
            const [users] = await connection.execute(
                'SELECT * FROM admin_users'
            );
            console.log('Admin users:', users);
        } else {
            console.log('admin_users table does not exist');
        }

        await connection.end();
    } catch (error) {
        console.error('Error checking admin user:', error);
        process.exit(1);
    }
}

checkAdminUser();
