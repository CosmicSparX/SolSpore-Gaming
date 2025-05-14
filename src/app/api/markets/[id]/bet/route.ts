import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Market } from '@/models/tournament';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID from params using proper destructuring
    const { id } = params;
    
    // Validate that marketId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid market ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { outcome, amount } = body;
    
    // Validate required fields
    if (!outcome || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate outcome
    if (outcome !== 'yes' && outcome !== 'no') {
      return NextResponse.json(
        { error: 'Invalid outcome. Must be "yes" or "no"' },
        { status: 400 }
      );
    }
    
    // Validate amount
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      );
    }
    
    // Find the market
    const market = await Market.findById(id);
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }
    
    // Check if market is closed
    const now = new Date();
    if (market.closeTime < now) {
      return NextResponse.json(
        { error: 'Market is closed' },
        { status: 400 }
      );
    }
    
    // Update the appropriate stake based on outcome
    if (outcome === 'yes') {
      market.yesStake += betAmount;
    } else {
      market.noStake += betAmount;
    }
    
    // Recalculate odds based on stakes
    const totalStake = market.yesStake + market.noStake;
    const baseOdds = 1.0;
    
    // Calculate new odds (with some bias to ensure profit margin for the platform)
    // Adding a 5% margin
    const margin = 0.05;
    
    if (market.yesStake > 0 && market.noStake > 0) {
      market.yesOdds = (baseOdds / (market.yesStake / totalStake)) * (1 - margin);
      market.noOdds = (baseOdds / (market.noStake / totalStake)) * (1 - margin);
      
      // Apply limits to odds (between 1.1 and 10.0)
      market.yesOdds = Math.max(1.1, Math.min(10.0, market.yesOdds));
      market.noOdds = Math.max(1.1, Math.min(10.0, market.noOdds));
      
      // Round to 2 decimal places
      market.yesOdds = Math.round(market.yesOdds * 100) / 100;
      market.noOdds = Math.round(market.noOdds * 100) / 100;
    }
    
    // Save the updated market
    await market.save();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Bet placed successfully',
        market: {
          id: market._id,
          yesOdds: market.yesOdds,
          noOdds: market.noOdds,
          yesStake: market.yesStake,
          noStake: market.noStake
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { error: 'Failed to place bet' },
      { status: 500 }
    );
  }
} 