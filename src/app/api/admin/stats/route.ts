import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';
import { User } from '@/models/user';
import { Market } from '@/models/tournament';
import { verify } from 'jsonwebtoken';

// Admin authentication middleware helper
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

// GET admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // Connect to database
    await dbConnect();
    
    // Get counts from various collections
    const totalUsers = await User.countDocuments();
    const totalTournaments = await Tournament.countDocuments();
    
    // Count markets across all tournaments
    const tournaments = await Tournament.find({}).lean();
    const marketIds = tournaments.reduce((acc: any[], tournament) => {
      return acc.concat(tournament.markets || []);
    }, []);
    const totalMarkets = marketIds.length;
    
    // For now, we don't have actual bets in the system, so we'll estimate
    // In a real system, you'd count from a Bets collection
    const totalBets = totalMarkets * 3; // Placeholder: assume average 3 bets per market
    
    // Return the stats
    return NextResponse.json({
      stats: {
        totalUsers,
        totalTournaments,
        totalMarkets,
        totalBets
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 