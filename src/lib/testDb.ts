// MySQL connection test script
import pool from './server/mysql';

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database!');
    
    // Test query
    const [result] = await connection.query('SELECT NOW() as now');
    console.log('Current database time:', (result as any[])[0].now);
    
    connection.release();
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await pool.end();
  }
}

testConnection().catch(console.error);
