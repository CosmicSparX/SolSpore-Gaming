import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Bet } from '@/models/bet';
import { verify } from 'jsonwebtoken';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    if (decoded.role !== 'admin') {
      return { error: 'Forbidden', status: 403 };
    }
    return { success: true };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// Update bet
export async function PUT(
  request: NextRequest,
  { params }: { params: { betId: string } }
) {
  try {
    const verification = await verifyAdminToken(request);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }
    
    const { betId } = params;
    const body = await request.json();
    const { status } = body;
    
    // Validate status
    if (!['pending', 'won', 'lost', 'canceled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find and update bet
    const bet = await Bet.findById(betId);
    
    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }
    
    bet.status = status;
    bet.updatedAt = new Date();
    await bet.save();
    
    return NextResponse.json(
      { message: 'Bet updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating bet:', error);
    return NextResponse.json(
      { error: 'Failed to update bet' },
      { status: 500 }
    );
  }
} 