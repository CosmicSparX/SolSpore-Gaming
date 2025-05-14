import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Redirect to the login page we created with the redirect parameter
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));
    }
    
    try {
      // Verify the token
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      
      // Check if user is an admin
      if (decoded.role !== 'admin') {
        // Redirect to home if not an admin
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));
    }
  }
  
  // Allow all other requests
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
}; 