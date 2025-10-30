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

// POST - Create a new market for a tournament
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const tournamentId = params.id;
    
    // Validate tournament ID
    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { question, teamA, teamB, closeTime, yesOdds, noOdds } = body;
    
    // Validate required fields
    if (!question || !teamA || !teamB || !closeTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new market
    const market = new Market({
      question,
      teamA,
      teamB,
      closeTime: new Date(closeTime),
      yesOdds: yesOdds || 2.0,
      noOdds: noOdds || 2.0,
      yesStake: 0, // Initial stakes
      noStake: 0,  // Initial stakes
    });
    
    // Save the market
    await market.save();
    
    // Add market to tournament
    tournament.markets.push(market._id);
    await tournament.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Market created successfully',
        market 
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating market:', error);
    return NextResponse.json(
      { error: 'Failed to create market' },
      { status: 500 }
    );
  }
} 