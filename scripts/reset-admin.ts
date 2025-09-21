import mysql from 'mysql2/promise';import        const connection = await mysql.createConnection({

import bcrypt from 'bcrypt';            host: process.env.MYSQL_HOST || 'localhost',

            user: process.env.MYSQL_USER || 'root',

async function resetAdminUser() {            password: process.env.MYSQL_PASSWORD || '',

    try {            database: process.env.MYSQL_DATABASE || 'beyou_db',

        // Create connection            connectTimeout: 60000,

        const connection = await mysql.createConnection({        });rom 'mysql2/promise';

            host: process.env.MYSQL_HOST || 'localhost',import bcrypt from 'bcrypt';

            user: process.env.MYSQL_USER || 'root',

            password: process.env.MYSQL_PASSWORD || '',async function resetAdminUser() {

            database: process.env.MYSQL_DATABASE || 'beyou_db',    try {

            connectTimeout: 60000,        // Create connection

        });        const connection = await mysql.createConnection({

            host: process.env.MYSQL_HOST || 'localhost',

        // Delete existing admin user            user: process.env.MYSQL_USER || 'root',

        await connection.execute(            password: process.env.MYSQL_PASSWORD || '',

            'DELETE FROM admin_users WHERE email = ?',            database: process.env.MYSQL_DATABASE || 'beyou_db',

            ['admin@beyou.com']            connectTimeout: 60000,

        );            acquireTimeout: 60000

        });

        // Hash the password

        const saltRounds = 10;        // Delete existing admin user

        const hashedPassword = await bcrypt.hash('admin123', saltRounds);        await connection.execute(

            'DELETE FROM admin_users WHERE email = ?',

        // Create new admin user            ['admin@beyou.com']

        const [result] = await connection.execute(        );

            'INSERT INTO admin_users (id, email, password) VALUES (?, ?, ?)',

            ['admin-001', 'admin@beyou.com', hashedPassword]        // Create new admin user

        );        const password = 'Admin@123';

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Admin user reset successfully!');        

        console.log('Email: admin@beyou.com');        await connection.execute(

        console.log('Password: admin123');            'INSERT INTO admin_users (id, email, password, role) VALUES (UUID(), ?, ?, ?)',

        console.log('Result:', result);            ['admin@beyou.com', hashedPassword, 'admin']

        );

        await connection.end();

    } catch (error) {        console.log('Admin user reset successfully');

        console.error('Error resetting admin user:', error);        console.log('Email: admin@beyou.com');

    }        console.log('Password: Admin@123');

}

        await connection.end();

// Run the function    } catch (error) {

resetAdminUser();        console.error('Error resetting admin user:', error);
        process.exit(1);
    }
}

resetAdminUser();
