import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Market, Tournament } from '@/models/tournament';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { tournamentId, question, teamA, teamB, closeTime } = body;
    
    // Validate required fields
    if (!tournamentId || !question || !teamA || !teamB || !closeTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate that tournamentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }
    
    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Create new market
    const market = new Market({
      question,
      teamA,
      teamB,
      closeTime: new Date(closeTime),
      yesOdds: 2.0,  // Default initial odds
      noOdds: 2.0,   // Default initial odds
      yesStake: 0,   // Initial stake is zero
      noStake: 0,    // Initial stake is zero
    });
    
    // Save the market
    await market.save();
    
    // Add market to tournament's markets array
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
  } catch (error) {
    console.error('Error creating market:', error);
    return NextResponse.json(
      { error: 'Failed to create market' },
      { status: 500 }
    );
  }
} 