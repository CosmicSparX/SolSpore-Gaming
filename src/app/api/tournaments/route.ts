import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all tournaments and populate the markets field
    const tournaments = await Tournament.find({})
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
    const { name, image, description, startDate, endDate, game } = body;
    
    // Validate required fields
    if (!name || !image || !description || !startDate || !endDate || !game) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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