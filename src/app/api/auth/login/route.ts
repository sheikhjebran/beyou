import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    console.log('=== LOGIN API CALLED ===');
    const { email, password } = await request.json();
    
    console.log('Login attempt:', { email });
    console.log('Environment check:', {
      MYSQL_HOST: process.env.MYSQL_HOST || 'undefined',
      MYSQL_USER: process.env.MYSQL_USER || 'undefined', 
      MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'undefined',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    });

    // Create database connection
    console.log('Creating database connection...');
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'beyou_db'
    });
    
    console.log('Database connected successfully');

    // Get user from database
    console.log('Executing query for user:', email);
    const [users] = await connection.execute(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    console.log('Query result:', { userCount: Array.isArray(users) ? users.length : 0 });

    await connection.end();

    if (!Array.isArray(users) || users.length === 0) {
      console.log('No user found with email:', email);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0] as any;
    console.log('Found user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });
    
    console.log('Testing password comparison...');
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', passwordMatch);

    if (passwordMatch) {
      console.log('Password match successful, creating token...');
      // Create a token
      const token = sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Token created, setting up response...');
      // Create the response
      const response = NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

      // Set HTTP-only cookie in the response
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      console.log('Login successful for user:', email);
      return response;
    }

    console.log('Password mismatch for user:', email);
    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
