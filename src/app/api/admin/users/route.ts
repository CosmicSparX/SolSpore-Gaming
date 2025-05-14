import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the token and check admin role
    try {
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Fetch all users
    const users = await User.find({})
      .select('username email role createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 