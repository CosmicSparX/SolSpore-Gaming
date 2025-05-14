import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Bet } from '@/models/bet';
import { User } from '@/models/user';
import { Market } from '@/models/market';
import { Tournament } from '@/models/tournament';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the token and check admin role
    try {
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    // Build query
    const query: any = {};
    if (status && ['pending', 'won', 'lost', 'canceled'].includes(status)) {
      query.status = status;
    }
    
    // Fetch bets
    const bets = await Bet.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Fetch related data
    const userIds = [...new Set(bets.map(bet => bet.userId))];
    const marketIds = [...new Set(bets.map(bet => bet.marketId))];
    
    const [users, markets] = await Promise.all([
      User.find({ _id: { $in: userIds } }).lean(),
      Market.find({ _id: { $in: marketIds } }).lean()
    ]);
    
    // Create maps for quick lookup
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {} as Record<string, any>);
    
    const marketMap = markets.reduce((acc, market) => {
      acc[market._id.toString()] = market;
      return acc;
    }, {} as Record<string, any>);
    
    // Get tournament IDs
    const tournamentIds = [...new Set(markets.map(market => market.tournamentId))];
    
    // Fetch tournaments
    const tournaments = await Tournament.find({ _id: { $in: tournamentIds } }).lean();
    
    // Create tournament map
    const tournamentMap = tournaments.reduce((acc, tournament) => {
      acc[tournament._id.toString()] = tournament;
      return acc;
    }, {} as Record<string, any>);
    
    // Enrich bet data
    const enrichedBets = bets.map(bet => {
      const user = userMap[bet.userId.toString()];
      const market = marketMap[bet.marketId.toString()];
      const tournament = market ? tournamentMap[market.tournamentId.toString()] : null;
      
      return {
        ...bet,
        username: user?.username || 'Unknown User',
        marketName: market?.name || 'Unknown Market',
        tournamentId: market?.tournamentId || '',
        tournamentName: tournament?.name || 'Unknown Tournament'
      };
    });
    
    return NextResponse.json({ bets: enrichedBets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
} 