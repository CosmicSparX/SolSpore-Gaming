import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Tournament } from '@/models/tournament';
import { Market } from '@/models/market';
import { verify } from 'jsonwebtoken';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    if (decoded.role !== 'admin') {
      return { error: 'Forbidden', status: 403 };
    }
    return { success: true };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// Get single tournament
export async function GET(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const verification = await verifyAdminToken(request);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }
    
    const { tournamentId } = params;
    
    await dbConnect();
    
    // Find tournament
    const tournament = await Tournament.findById(tournamentId).lean();
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Get market count
    const marketCount = await Market.countDocuments({ tournamentId });
    
    return NextResponse.json({
      tournament: {
        ...tournament,
        marketCount
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}

// Update tournament
export async function PUT(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const verification = await verifyAdminToken(request);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }
    
    const { tournamentId } = params;
    const body = await request.json();
    const { name, description, startDate, endDate, image, status } = body;
    
    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find and update tournament
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    tournament.name = name;
    tournament.description = description;
    tournament.startDate = new Date(startDate);
    tournament.endDate = new Date(endDate);
    tournament.status = status;
    if (image) tournament.image = image;
    tournament.updatedAt = new Date();
    
    await tournament.save();
    
    return NextResponse.json(
      { tournament, message: 'Tournament updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}

// Delete tournament
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const verification = await verifyAdminToken(request);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }
    
    const { tournamentId } = params;
    
    await dbConnect();
    
    // Find and delete tournament
    const tournament = await Tournament.findByIdAndDelete(tournamentId);
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Delete associated markets
    await Market.deleteMany({ tournamentId });
    
    return NextResponse.json(
      { message: 'Tournament and associated markets deleted successfully' },
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