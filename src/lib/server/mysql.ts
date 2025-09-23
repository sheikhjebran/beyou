import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'beyou_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;

// Helper to execute queries with proper error handling
export async function executeQuery<T>(
    query: string, 
    params: any[] = []
): Promise<T> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(query, params);
        return rows as T;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        connection.release();
    }
}

export { pool };
