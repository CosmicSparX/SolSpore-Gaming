import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the ID from params using proper destructuring
    const id = context.params.id;
    
    // Validate that id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find the tournament by ID and populate its markets
    const tournament = await Tournament.findById(id)
      .populate('markets')
      .lean();
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
} 