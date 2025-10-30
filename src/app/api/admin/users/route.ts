import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user';
import { verify } from 'jsonwebtoken';

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify that the request comes from an admin
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get all users (except password and salt)
    const users = await User.find({})
      .select('-password -salt')
      .sort({ createdAt: -1 }) // Newest first
      .lean(); // Convert to plain JavaScript objects
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 