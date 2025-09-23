import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function resetAdminUsers() {
    try {
        console.log('Attempting to connect to MySQL...');
        
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'beyou_db'
        });

        console.log('Connected to database successfully');

        // Delete existing admin users
        const deleteResult = await connection.execute('DELETE FROM admin_users WHERE role = ?', ['admin']);
        console.log('Deleted existing admin users:', (deleteResult[0] as any).affectedRows, 'users');

        // Create new admin with correct schema
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminId = uuidv4();
        
        const insertResult = await connection.execute(
            'INSERT INTO admin_users (id, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [adminId, 'admin@beyoushop.in', hashedPassword, 'admin']
        );

        console.log('Created new admin user successfully');
        console.log('');
        console.log('✅ Admin user reset successfully!');
        console.log('🆔 ID:', adminId);
        console.log('📧 Email: admin@beyoushop.in');
        console.log('🔒 Password: admin123');
        console.log('👤 Role: admin');
        console.log('');
        console.log('You can now login at: http://localhost:3000/admin');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

resetAdminUsers();