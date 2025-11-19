import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { PointsService } from '@/services/points-service';

/**
 * GET /api/points/eligible-items
 * Get items user can redeem with points
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const items = await PointsService.getEligibleItems(session.userId);
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching eligible items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eligible items' },
      { status: 500 }
    );
  }
}
