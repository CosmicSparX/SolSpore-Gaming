import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { username, email, password } = body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      // Default role is 'user' as defined in the schema
    });
    
    // Save the user
    await user.save();
    
    // Return user without sensitive information
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        }
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 