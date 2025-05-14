import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Create response
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });
  
  // Clear the auth cookie
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  return response;
} 