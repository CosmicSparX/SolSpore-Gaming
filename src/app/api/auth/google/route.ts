import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user';
import { sign } from 'jsonwebtoken';

// Add a GET handler to fix build issues
export async function GET() {
  return NextResponse.json({ message: 'Google Auth API endpoint' });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse request body containing Google user info
    const body = await request.json();
    const { email, name, googleId, picture } = body;
    
    // Validate required fields
    if (!email || !googleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.profileImage) {
          user.profileImage = picture;
        }
        await user.save();
      }
    } else {
      // Create new user with Google info
      // Generate a username based on the email
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      // Check if username exists, if so, append a number
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      user = new User({
        username,
        email,
        googleId,
        profileImage: picture || undefined,
        // Default role is 'user' as defined in the schema
      });
      
      await user.save();
    }
    
    // Create JWT token
    const token = sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
    
    // Set cookie with JWT token
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error with Google authentication:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
} 