import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';
import { User } from '@/models/user';
import { Market } from '@/models/market';
import { Bet } from '@/models/bet';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        stats: {
          totalUsers: 0,
          totalTournaments: 0,
          totalMarkets: 0,
          totalBets: 0
        },
        error: 'Authentication required'
      }, { status: 200 }); // Return 200 with empty stats instead of 401
    }
    
    // Verify the token and check admin role
    let isAdmin = false;
    try {
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      isAdmin = decoded.role === 'admin';
    } catch (error) {
      return NextResponse.json({ 
        stats: {
          totalUsers: 0,
          totalTournaments: 0,
          totalMarkets: 0,
          totalBets: 0
        },
        error: 'Invalid token'
      }, { status: 200 }); // Return 200 with empty stats instead of 401
    }
    
    if (!isAdmin) {
      return NextResponse.json({ 
        stats: {
          totalUsers: 0,
          totalTournaments: 0,
          totalMarkets: 0,
          totalBets: 0
        },
        error: 'Admin access required'
      }, { status: 200 }); // Return 200 with empty stats instead of 403
    }
    
    await dbConnect();
    
    // Fetch statistics in parallel
    const [userCount, tournamentCount, marketCount, betCount] = await Promise.all([
      User.countDocuments({}),
      Tournament.countDocuments({}),
      Market.countDocuments({}),
      Bet.countDocuments({})
    ]);
    
    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        totalTournaments: tournamentCount,
        totalMarkets: marketCount,
        totalBets: betCount
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      stats: {
        totalUsers: 0,
        totalTournaments: 0,
        totalMarkets: 0,
        totalBets: 0
      },
      error: 'Failed to fetch statistics'
    }, { status: 200 }); // Return 200 with empty stats instead of 500
  }
} 