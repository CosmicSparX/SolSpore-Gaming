import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Market } from '@/models/tournament';
import { Bet } from '@/models/bet';
import mongoose from 'mongoose';
import { User } from '@/models/user';

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
        { 
          success: false,
          error: 'Invalid market ID',
          message: 'The provided market ID is not in a valid format.'
        },
        { status: 400 }
      );
    }
    
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          message: 'Could not connect to the database. Please try again later.'
        },
        { status: 503 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'The request body is not valid JSON.'
        },
        { status: 400 }
      );
    }
    
    const { outcome, amount, tournamentId, transactionSignature, odds, smartContractAddress, walletAddress } = body;
    
    // Validate required fields
    if (!outcome || !amount || !tournamentId || !transactionSignature || !walletAddress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Please provide all required fields: outcome, amount, tournamentId, transactionSignature, and walletAddress.'
        },
        { status: 400 }
      );
    }
    
    // Validate outcome
    if (outcome !== 'yes' && outcome !== 'no') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid outcome. Must be "yes" or "no"',
          message: 'The outcome must be either "yes" or "no".'
        },
        { status: 400 }
      );
    }
    
    // Validate amount
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid amount. Must be a positive number',
          message: 'The bet amount must be a positive number greater than zero.'
        },
        { status: 400 }
      );
    }
    
    // Find user by wallet address
    // In a real system you'd verify a wallet signature as well
    let user;
    try {
      user = await User.findOne({ walletAddress });
      
      // If no user found, create a guest user record
      if (!user) {
        try {
          user = await User.create({
            username: `guest_${walletAddress.substring(0, 8)}`,
            email: `guest_${walletAddress.substring(0, 8)}@solspore.com`,
            walletAddress,
            role: 'user'
          });
        } catch (userCreateError: any) {
          // Check if it's a duplicate key error
          if (userCreateError.code === 11000) {
            // Try to find again - someone else might have created it
            user = await User.findOne({ walletAddress });
            if (!user) {
              throw new Error('Failed to create user account');
            }
          } else {
            throw userCreateError;
          }
        }
      }
    } catch (userError) {
      console.error('Error with user account:', userError);
      return NextResponse.json(
        { 
          success: false,
          error: 'User account error',
          message: 'Could not find or create a user account for this wallet.'
        },
        { status: 500 }
      );
    }
    
    // Find the market
    let market;
    try {
      market = await Market.findById(id);
      if (!market) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Market not found',
            message: 'The specified betting market could not be found.'
          },
          { status: 404 }
        );
      }
    } catch (marketError) {
      console.error('Error finding market:', marketError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          message: 'Error occurred while retrieving market information.'
        },
        { status: 500 }
      );
    }
    
    // Check if market is closed
    const now = new Date();
    if (market.closeTime < now) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Market is closed',
          message: 'This market is no longer accepting bets as it has closed.'
        },
        { status: 400 }
      );
    }
    
    // Check if market is not open
    if (market.status !== 'open') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Market not available',
          message: `This market is not open for betting. Current status: ${market.status}.`
        },
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
    try {
      await market.save();
    } catch (marketSaveError) {
      console.error('Error saving market:', marketSaveError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          message: 'Error occurred while updating market odds.'
        },
        { status: 500 }
      );
    }
    
    // Create the bet record
    let bet;
    try {
      bet = new Bet({
        userId: user._id,
        marketId: id,
        tournamentId,
        outcome,
        stake: betAmount,
        odds: odds || (outcome === 'yes' ? market.yesOdds : market.noOdds),
        timestamp: new Date(),
        status: 'active',
        transactionSignature,
        smartContractAddress
      });
      
      // Save the bet
      await bet.save();
    } catch (betSaveError) {
      console.error('Error saving bet:', betSaveError);
      
      // Try to rollback the market update
      try {
        if (outcome === 'yes') {
          market.yesStake -= betAmount;
        } else {
          market.noStake -= betAmount;
        }
        await market.save();
      } catch (rollbackError) {
        console.error('Error rolling back market update:', rollbackError);
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to save bet',
          message: 'Your bet was processed but could not be saved in our records.'
        },
        { status: 500 }
      );
    }
    
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
        },
        bet: {
          id: bet._id,
          outcome: bet.outcome,
          stake: bet.stake,
          odds: bet.odds,
          status: bet.status,
          transactionSignature: bet.transactionSignature
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unhandled error placing bet:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to place bet',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while processing your bet.'
      },
      { status: 500 }
    );
  }
} 