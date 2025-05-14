import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';
import mongoose from 'mongoose';
import { verify } from 'jsonwebtoken';

// Helper to verify admin
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

// GET tournament by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Await params before using its properties
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Find tournament by ID and populate markets
    const tournament = await Tournament.findById(id)
      .populate('markets')
      .lean();
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Use type assertion to access image property
    const tournamentData = tournament as any;
    console.log('Tournament image in API:', tournamentData.image);
    
    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}

// UPDATE tournament (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    await dbConnect();
    
    // Await params before using its properties
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
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
    
    // Find and update tournament
    const tournament = await Tournament.findByIdAndUpdate(
      id,
      {
        name,
        image,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        game,
        type: type || 'official'
      },
      { new: true, runValidators: true }
    );
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}

// DELETE tournament (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const auth = verifyAdmin(request);
    if (!auth.auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    await dbConnect();
    
    // Await params before using its properties
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Find tournament
    const tournament = await Tournament.findById(id);
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Delete tournament
    await Tournament.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Tournament deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
} 