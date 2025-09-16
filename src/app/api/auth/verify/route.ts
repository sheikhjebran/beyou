import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { executeQuery } from '@/lib/server/mysql';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    console.log('Verifying token...');
    const cookiesList = await cookies();
    const token = cookiesList.get('admin_token');
    
    if (!token?.value) {
      console.log('No token found in cookies');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      console.log('Token found, verifying...');
      const decoded = verify(token.value, JWT_SECRET) as any;
      
      // Verify this is an admin token
      if (decoded.type !== 'admin') {
        console.log('Token is not an admin token');
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }

      // Verify admin exists in database
      const [admin] = await executeQuery<any[]>(
        'SELECT id, email, role FROM admin_users WHERE id = ? AND role = ?',
        [decoded.id, 'admin']
      );

      if (!admin) {
        console.log('Admin not found in database');
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }

      console.log('Token verified successfully:', decoded);
      return NextResponse.json({ 
        valid: true, 
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
