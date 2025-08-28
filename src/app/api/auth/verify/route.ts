import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    console.log('Verifying token...');
    const cookiesList = await cookies();
    const token = await cookiesList.get('admin_token');
    
    if (!token?.value) {
      console.log('No token found in cookies');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      console.log('Token found, verifying...');
      const decoded = verify(token.value, JWT_SECRET);
      console.log('Token verified successfully:', decoded);
      return NextResponse.json({ 
        valid: true, 
        user: decoded 
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
