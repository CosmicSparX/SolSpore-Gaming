import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user';
import { Bet } from '@/models/bet';
import mongoose, { Types } from 'mongoose';

// Define interfaces for better type safety
interface UserDoc {
  _id: Types.ObjectId;
  username: string;
  walletAddress: string;
  profileImage?: string;
}

interface UserStats {
  userId: Types.ObjectId;
  totalBets: number;
  winningBets: number;
  winRate: number;
  totalWinnings: number;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Try to connect to database with graceful error handling
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return empty data with success=true instead of an error
      return NextResponse.json(
        { 
          success: true,
          message: 'No data available',
          leaderboard: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            pages: 0
          }
        },
        { status: 200 }
      );
    }
    
    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Find all users with wallet address (we only care about users who potentially placed bets)
    let usersRaw;
    try {
      usersRaw = await User.find({ walletAddress: { $exists: true, $ne: null } })
        .select('username walletAddress profileImage')
        .limit(limit)
        .skip(skip)
        .lean();
    } catch (userQueryError) {
      console.error('Error querying users:', userQueryError);
      // Return empty data instead of error
      return NextResponse.json(
        { 
          success: true,
          message: 'Error retrieving user data',
          leaderboard: [],
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0
          }
        },
        { status: 200 }
      );
    }
    
    // Convert to our expected type
    const users = usersRaw as unknown as UserDoc[];
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { 
          success: true,
          message: 'No users found',
          leaderboard: [],
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0
          }
        },
        { status: 200 }
      );
    }
    
    // Get all user IDs
    const userIds = users.map(user => user._id);
    
    // For each user, get their bet statistics - with robust error handling
    const userStats = await Promise.all(
      userIds.map(async (userId) => {
        try {
          let totalBets = 0;
          let winningBets = 0;
          let totalWinnings = 0;
          
          try {
            // Get total bets
            totalBets = await Bet.countDocuments({ userId });
            
            // Get winning bets
            winningBets = await Bet.countDocuments({ 
              userId, 
              status: 'settled',
              result: 'win'
            });
            
            // Get total won amount
            const winningsAggregation = await Bet.aggregate([
              { 
                $match: { 
                  userId: new mongoose.Types.ObjectId(userId.toString()),
                  status: 'settled',
                  result: 'win'
                } 
              },
              {
                $group: {
                  _id: null,
                  totalWinnings: { $sum: '$payout' }
                }
              }
            ]);
            
            totalWinnings = winningsAggregation.length > 0 
              ? winningsAggregation[0].totalWinnings 
              : 0;
          } catch (betQueryError) {
            console.error(`Error querying bets for user ${userId}:`, betQueryError);
            // Continue with default values (all zeros)
          }
          
          // Calculate win rate
          const winRate = totalBets > 0 ? (winningBets / totalBets) * 100 : 0;
          
          return { userId, totalBets, winningBets, winRate, totalWinnings } as UserStats;
        } catch (error) {
          console.error(`Error getting stats for user ${userId}:`, error);
          return { 
            userId,
            totalBets: 0,
            winningBets: 0,
            winRate: 0,
            totalWinnings: 0,
            error: 'Failed to calculate stats'
          } as UserStats;
        }
      })
    );
    
    // Combine user data with stats - with fallbacks for each field
    const leaderboardData = users.map(user => {
      const stats = userStats.find(
        stat => stat && stat.userId && user && user._id && 
          stat.userId.toString() === user._id.toString()
      ) || {
        totalBets: 0,
        winningBets: 0, 
        winRate: 0,
        totalWinnings: 0
      };
      
      return {
        userId: user._id || 'unknown',
        username: user.username || 'Anonymous User',
        walletAddress: user.walletAddress || '',
        profileImage: user.profileImage || '/images/default-avatar.png',
        totalBets: stats.totalBets || 0,
        winningBets: stats.winningBets || 0,
        winRate: parseFloat((stats.winRate || 0).toFixed(2)),
        totalWinnings: parseFloat((stats.totalWinnings || 0).toFixed(4))
      };
    });
    
    // Sort by total winnings (descending)
    // Filter out any potential undefined/null entries before sorting
    const validData = leaderboardData.filter(item => item && typeof item === 'object');
    validData.sort((a, b) => (b.totalWinnings || 0) - (a.totalWinnings || 0));
    
    // Add rank property
    const rankedData = validData.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));
    
    // Get total count for pagination with fallback
    let totalUsers = 0;
    try {
      totalUsers = await User.countDocuments({ 
        walletAddress: { $exists: true, $ne: null } 
      });
    } catch (countError) {
      console.error('Error counting users:', countError);
      // Use the current page data length as fallback
      totalUsers = users.length;
    }
    
    return NextResponse.json(
      { 
        success: true,
        leaderboard: rankedData,
        pagination: {
          total: totalUsers,
          page,
          limit,
          pages: Math.max(1, Math.ceil(totalUsers / limit))
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    // Instead of returning an error, return empty data with status 200
    return NextResponse.json(
      { 
        success: true,
        message: 'No data available at this time',
        leaderboard: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          pages: 0
        }
      },
      { status: 200 }
    );
  }
} 