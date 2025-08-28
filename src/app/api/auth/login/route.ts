import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt:', { email });

    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'beyou_db'
    });
    
    console.log('Database connected successfully');

    // Get user from database
    const [users] = await connection.execute(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    console.log('Query result:', { userCount: Array.isArray(users) ? users.length : 0 });

    await connection.end();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0] as any;
    console.log('Stored password hash:', user.password);
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', passwordMatch);

    if (passwordMatch) {
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

      return response;
    }

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
