import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { RewardsService } from '@/services';

/**
 * GET /api/rewards/active
 * Get user's active rewards
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ rewards: [] });
    }
    
    const rewards = await RewardsService.getUserActiveRewards(session.userId);
    
    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching active rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active rewards' },
      { status: 500 }
    );
  }
}
