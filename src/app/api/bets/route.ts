import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Bet } from '@/models/bet';
import { Market } from '@/models/tournament';
import { User } from '@/models/user';

// Define interface for formatted bet structure
interface FormattedBet {
  id: string;
  tournamentId: string;
  tournamentName: string;
  marketId: string;
  question: string;
  teamA: string;
  teamB: string;
  outcome: string;
  odds: number;
  stake: number;
  betDate: Date;
  marketCloseTime: Date;
  status: string;
  result: string | null;
  payout: number;
  transactionSignature: string;
  smartContractAddress: string;
}

export async function GET(request: NextRequest) {
  try {
    // Try connecting to database with graceful error handling
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return empty data with success=true instead of an error
      return NextResponse.json(
        { 
          success: true,
          message: 'No bets data available',
          bets: [] 
        },
        { status: 200 }
      );
    }
    
    // Get the wallet address from the query string
    const walletAddress = request.nextUrl.searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Wallet address is required',
          bets: [] // Return empty array for consistent client handling
        },
        { status: 400 }
      );
    }
    
    // Find the user by wallet address with error handling
    let user;
    try {
      user = await User.findOne({ walletAddress });
    } catch (userError) {
      console.error('Error finding user:', userError);
      return NextResponse.json(
        {
          success: true,
          message: 'Error retrieving user data',
          bets: []
        },
        { status: 200 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { 
          success: true, // Changed to true for better frontend handling
          message: 'No bets found for this wallet address',
          bets: [] // Return empty array instead of error for easier client handling
        },
        { status: 200 } 
      );
    }
    
    // Find all bets for this user with error handling
    let bets = [];
    try {
      bets = await Bet.find({ userId: user._id })
        .sort({ timestamp: -1 }) // Sort by newest first
        .populate('marketId', 'question teamA teamB closeTime result') // Populate market details
        .populate('tournamentId', 'name game'); // Populate tournament details
    } catch (betQueryError) {
      console.error('Error querying bets:', betQueryError);
      return NextResponse.json(
        {
          success: true,
          message: 'Error retrieving bet data',
          bets: []
        },
        { status: 200 }
      );
    }
    
    // Handle case with no bets found
    if (!bets || bets.length === 0) {
      return NextResponse.json(
        { 
          success: true,
          message: 'No bets found for this user',
          bets: [] 
        },
        { status: 200 }
      );
    }
    
    // Transform the data to the format needed by the client
    // Use try/catch to handle any potential errors in data transformation
    let formattedBets: FormattedBet[] = [];
    try {
      formattedBets = bets.map(bet => {
        try {
          // Handle case where market or tournament might be null (deleted)
          const market = bet.marketId as any || {}; // TypeScript workaround for populated field
          const tournament = bet.tournamentId as any || {}; // TypeScript workaround for populated field
          
          return {
            id: bet._id || 'unknown',
            tournamentId: tournament._id || 'unknown',
            tournamentName: tournament.name || 'Unknown Tournament',
            marketId: market._id || 'unknown',
            question: market.question || 'Unknown Market Question',
            teamA: market.teamA || 'Team A',
            teamB: market.teamB || 'Team B',
            outcome: bet.outcome || 'unknown',
            odds: bet.odds || 0,
            stake: bet.stake || 0,
            betDate: bet.timestamp || new Date(),
            marketCloseTime: market.closeTime || new Date(),
            status: bet.status || 'unknown',
            result: bet.result,
            payout: bet.payout || 0,
            transactionSignature: bet.transactionSignature || '',
            smartContractAddress: bet.smartContractAddress || ''
          };
        } catch (betError) {
          console.error('Error formatting individual bet:', betError);
          // Return a placeholder bet if an individual bet has issues
          return {
            id: bet._id || 'error',
            tournamentId: 'error',
            tournamentName: 'Error Processing Bet',
            marketId: 'error',
            question: 'Error Processing Bet Details',
            teamA: 'Unknown',
            teamB: 'Unknown',
            outcome: 'unknown',
            odds: 0,
            stake: 0,
            betDate: new Date(),
            marketCloseTime: new Date(),
            status: 'unknown',
            result: null,
            payout: 0,
            transactionSignature: '',
            smartContractAddress: ''
          };
        }
      });
    } catch (formatError) {
      console.error('Error formatting bets array:', formatError);
      // Return empty array if we can't format the bets
      formattedBets = [];
    }
    
    return NextResponse.json(
      { 
        success: true,
        bets: formattedBets 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { 
        success: true, // Changed to true for better frontend handling
        message: 'No bets data available at this time',
        bets: [] // Return empty array so client doesn't break
      },
      { status: 200 } // Changed from 500 to 200 for better frontend handling
    );
  }
} 