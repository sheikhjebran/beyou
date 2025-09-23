import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyAdminAuth } from '@/lib/server/admin-auth';

// For API routes
export async function withAdminAuth(request: NextRequest, handler: (request: NextRequest) => Promise<NextResponse>) {
  try {
    // Get the token from cookie
    const token = request.cookies.get('admin_token')?.value;
    console.log('Admin token from cookie:', token ? 'Present' : 'Not present');

    if (!token) {
      console.log('No auth token provided');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    try {
      // Verify the token and get admin data
      const admin = await verifyAdminAuth(request);
      
      if (!admin) {
        console.log('Admin verification failed');
        return NextResponse.json({ error: 'Unauthorized - Invalid admin token' }, { status: 401 });
      }
      
      console.log('Admin verified:', admin.email);

      // Add admin data to the request headers for use in the handler
      const requestWithAdmin = new Request(request.url, {
        method: request.method,
        headers: new Headers({
          ...Object.fromEntries(request.headers),
          'x-admin-id': admin.id,
          'x-admin-email': admin.email,
          'x-admin-role': admin.role,
        }),
      });

      // Continue to the handler if authenticated
      return await handler(requestWithAdmin as NextRequest);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in admin auth middleware:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
