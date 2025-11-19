import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { RewardsService } from '@/services';

/**
 * POST /api/rewards/validate
 * Validate a reward code
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { valid: false, message: 'User must be logged in' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Reward code is required' },
        { status: 400 }
      );
    }
    
    const result = await RewardsService.validateRewardCode(session.userId, code);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating reward code:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to validate reward code' },
      { status: 500 }
    );
  }
}
