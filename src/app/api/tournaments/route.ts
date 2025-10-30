import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    // Build query object based on filters
    let query: any = {};
    if (type && (type === 'official' || type === 'custom')) {
      query.type = type;
    }
    
    // Get all tournaments and populate the markets field
    const tournaments = await Tournament.find(query)
      .populate('markets')
      .sort({ startDate: 1 })  // Sort by startDate ascending
      .lean(); // Convert mongoose documents to plain JS objects
    
    return NextResponse.json({ tournaments }, { status: 200 });
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
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { name, image, description, startDate, endDate, game, type } = body;
    
    // Validate required fields
    if (!name || !image || !description || !startDate || !endDate || !game) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate tournament type if provided
    if (type && !['official', 'custom'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid tournament type. Must be "official" or "custom"' },
        { status: 400 }
      );
    }
    
    // Create new tournament
    const tournament = new Tournament({
      name,
      image,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      game,
      type: type || 'official', // Default to official if not specified
      markets: [], // Initially empty markets array
    });
    
    // Save the tournament
    await tournament.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Tournament created successfully', 
        tournament 
      }, 
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