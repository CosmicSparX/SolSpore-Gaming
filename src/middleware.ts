import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Check if the request is for an admin API route
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Return unauthorized for API requests
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      // Verify the token
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        // Return forbidden for non-admin users
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      // Allow admin users to access admin API routes
      return NextResponse.next();
    } catch (error) {
      // Token is invalid
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }
  
  // Allow all other requests
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/api/admin/:path*'],
}; 