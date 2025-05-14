import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';
import { Market } from '@/models/market';
import { verify } from 'jsonwebtoken';

interface TournamentDoc {
  _id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  image?: string;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

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
    
    // Fetch all tournaments
    const tournaments = await Tournament.find({})
      .sort({ createdAt: -1 })
      .lean() as TournamentDoc[];
    
    // Get market counts for each tournament
    const tournamentIds = tournaments.map(t => t._id);
    const marketCounts = await Market.aggregate([
      { $match: { tournamentId: { $in: tournamentIds } } },
      { $group: { _id: '$tournamentId', count: { $sum: 1 } } }
    ]);
    
    // Create a map of tournament ID to market count
    const marketCountMap = marketCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);
    
    // Add market count to each tournament
    const tournamentsWithCounts = tournaments.map(tournament => ({
      ...tournament,
      marketCount: marketCountMap[tournament._id.toString()] || 0
    }));
    
    return NextResponse.json({ tournaments: tournamentsWithCounts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    // Parse request body
    const body = await request.json();
    const { name, description, startDate, endDate, image, status } = body;
    
    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }
    
    // Create new tournament
    const tournament = new Tournament({
      name,
      description,
      startDate,
      endDate,
      image,
      status: status || 'upcoming',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await tournament.save();
    
    return NextResponse.json(
      { tournament, message: 'Tournament created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
} 