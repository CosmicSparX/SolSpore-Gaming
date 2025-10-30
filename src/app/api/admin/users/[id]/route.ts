import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user';
import { verify } from 'jsonwebtoken';

// Admin authentication middleware helper
const verifyAdmin = (request: NextRequest) => {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return { auth: false, error: 'Authentication required', status: 401 };
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    if (decoded.role !== 'admin') {
      return { auth: false, error: 'Admin privileges required', status: 403 };
    }
    
    return { auth: true, userId: decoded.id };
  } catch (err) {
    return { auth: false, error: 'Invalid token', status: 401 };
  }
};

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // Connect to database
    await dbConnect();
    
    // Find user
    const user = await User.findById(params.id).select('-password -salt');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// UPDATE user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { username, email, role } = body;
    
    // Validate data
    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    if (role && !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await User.findById(params.id);
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { username, email, role },
      { new: true, runValidators: true }
    ).select('-password -salt');
    
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      let duplicateField = 'field';
      if (error.keyPattern.username) duplicateField = 'username';
      if (error.keyPattern.email) duplicateField = 'email';
      
      return NextResponse.json(
        { error: `This ${duplicateField} is already in use` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // Connect to database
    await dbConnect();
    
    // Check if user exists
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === auth.userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Delete user
    await User.findByIdAndDelete(params.id);
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 