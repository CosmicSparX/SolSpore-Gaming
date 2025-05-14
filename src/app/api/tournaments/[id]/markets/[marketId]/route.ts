import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament, Market } from '@/models/tournament';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';

// Helper to verify admin
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
    
    return { auth: true };
  } catch (err) {
    return { auth: false, error: 'Invalid token', status: 401 };
  }
};

// GET a single market
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, marketId: string } }
) {
  try {
    await dbConnect();
    
    const { marketId } = params;
    
    // Validate market ID
    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      return NextResponse.json(
        { error: 'Invalid market ID' },
        { status: 400 }
      );
    }
    
    // Find the market
    const market = await Market.findById(marketId);
    
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ market }, { status: 200 });
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market' },
      { status: 500 }
    );
  }
}

// DELETE a market
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, marketId: string } }
) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const { id: tournamentId, marketId } = params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(tournamentId) || !mongoose.Types.ObjectId.isValid(marketId)) {
      return NextResponse.json(
        { error: 'Invalid tournament or market ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find the tournament
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Check if market exists
    const market = await Market.findById(marketId);
    
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }
    
    // Check if market belongs to the tournament
    if (!tournament.markets.includes(marketId)) {
      return NextResponse.json(
        { error: 'Market does not belong to this tournament' },
        { status: 400 }
      );
    }
    
    // Remove market from tournament
    tournament.markets = tournament.markets.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== marketId
    );
    await tournament.save();
    
    // Delete the market
    await Market.findByIdAndDelete(marketId);
    
    return NextResponse.json(
      { message: 'Market deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting market:', error);
    return NextResponse.json(
      { error: 'Failed to delete market' },
      { status: 500 }
    );
  }
} 