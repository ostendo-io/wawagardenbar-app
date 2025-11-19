import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { PointsService } from '@/services/points-service';

/**
 * GET /api/points/balance
 * Get user's points balance
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const balance = await PointsService.getBalance(session.userId);
    
    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error fetching points balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points balance' },
      { status: 500 }
    );
  }
}
