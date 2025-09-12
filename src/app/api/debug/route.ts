import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    console.log('=== DEBUG API TEST ===');
    
    // Test environment variables
    console.log('Environment variables:');
    console.log('- MYSQL_HOST:', process.env.MYSQL_HOST);
    console.log('- MYSQL_USER:', process.env.MYSQL_USER);
    console.log('- MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    
    // Test database connection
    console.log('\nTesting database connection...');
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'beyou_db'
    });
    
    console.log('Database connected successfully');

    // Test admin user query
    const [users] = await connection.execute(
      'SELECT id, email, role, password FROM admin_users WHERE email = ?',
      ['admin@beyou.com']
    );

    console.log('Query result count:', Array.isArray(users) ? users.length : 0);
    
    if (Array.isArray(users) && users.length > 0) {
      const user = users[0] as any;
      console.log('User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      });
      
      // Test password comparison
      const passwordMatch = await bcrypt.compare('Admin@123', user.password);
      console.log('Password comparison result:', passwordMatch);
    }

    await connection.end();
    
    return NextResponse.json({
      status: 'success',
      message: 'Debug test completed - check server logs',
      envVarsLoaded: {
        MYSQL_HOST: !!process.env.MYSQL_HOST,
        MYSQL_USER: !!process.env.MYSQL_USER,
        MYSQL_PASSWORD: !!process.env.MYSQL_PASSWORD,
        MYSQL_DATABASE: !!process.env.MYSQL_DATABASE,
        JWT_SECRET: !!process.env.JWT_SECRET
      },
      userCount: Array.isArray(users) ? users.length : 0
    });
    
  } catch (error) {
    console.error('DEBUG API ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      status: 'error',
      message: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}