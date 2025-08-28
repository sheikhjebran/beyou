import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';

import { verifyUser } from '@/services/server/authService';

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
      // Verify the token and get user data
      const user = await verifyUser(token);
      console.log('User verified:', user.email);

      // Add user data to the request headers for use in the handler
      const requestWithUser = new Request(request.url, {
        headers: new Headers({
          ...Object.fromEntries(request.headers),
          'x-user-id': user.id,
          'x-user-email': user.email,
        }),
      });

      // Continue to the handler if authenticated
      return await handler(requestWithUser as NextRequest);
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
