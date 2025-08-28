import pool from '@/lib/server/mysql';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const connection = await pool.getConnection();
        console.log('Successfully connected to database');

        // Test products table
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
        console.log('Products count:', products[0].count);

        connection.release();
        console.log('Database connection test completed successfully');
    } catch (error) {
        console.error('Database connection test failed:', error);
    } finally {
        process.exit();
    }
}

testConnection();
