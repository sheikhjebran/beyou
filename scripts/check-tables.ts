import mysql from 'mysql2/promise';

async function checkTables() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'beyou_db'
        });

        console.log('Checking admin_users table structure:');
        const [adminUsersStructure] = await connection.execute('DESC admin_users');
        console.log(adminUsersStructure);

        console.log('\nChecking if any admin users exist:');
        const [adminUsers] = await connection.execute('SELECT * FROM admin_users');
        console.log(adminUsers);

        await connection.end();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTables();