import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Get the token from cookie
  const token = request.cookies.get('admin_token')?.value

  // Define protected routes
  const protectedRoutes = ['/admin', '/api/admin']

  // Check if the path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // If it's a protected route and there's no token, handle appropriately
  if (isProtectedRoute && !token) {
    // For API routes, return 401 Unauthorized
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    // For page routes, redirect to login
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If it's the login page and there is a token, redirect to admin dashboard
  if (path === '/login' && token) {
    // Decode token to verify it's valid
    try {
      const [userId, timestamp] = Buffer.from(token, 'base64').toString().split(':')
      const tokenAge = Date.now() - parseInt(timestamp, 10)
      
      // If token is less than 24 hours old, redirect to admin
      if (tokenAge < 24 * 60 * 60 * 1000) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } catch (e) {
      // If token is invalid, clear it and continue to login page
      const response = NextResponse.next()
      response.cookies.delete('admin_token')
      return response
    }
  }

  // For protected routes with a token, verify the token
  if (isProtectedRoute && token) {
    try {
      const [userId, timestamp] = Buffer.from(token, 'base64').toString().split(':')
      const tokenAge = Date.now() - parseInt(timestamp, 10)
      
      // If token is more than 24 hours old, clear it and redirect to login
      if (tokenAge > 24 * 60 * 60 * 1000) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth_token')
        return response
      }
      
      // Token is valid, add user info to request headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', userId)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    } catch (e) {
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/login']
}
