import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  console.log('===== LOGIN API CALLED =====');
  
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for:', email);
    
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'beyou_db'
    });
    
    console.log('Database connection established');

    // Get user from database
    const [users] = await connection.execute(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    await connection.end();

    if (!Array.isArray(users) || users.length === 0) {
      console.log('No user found with email:', email);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0] as any;
    console.log('User found, testing password...');
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (passwordMatch) {
      console.log('Creating JWT token...');
      const token = sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      console.log('Login successful!');
      return response;
    }

    console.log('Password mismatch');
    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
