import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData, defaultSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    if (!session.isLoggedIn) {
      return NextResponse.json(defaultSession);
    }

    if (session.userId && !session.isGuest) {
      await connectDB();
      const user = await UserModel.findById(session.userId).select(
        'name email emailVerified role totalSpent rewardsEarned orderCount'
      );

      if (!user) {
        session.destroy();
        return NextResponse.json(defaultSession);
      }

      return NextResponse.json({
        isLoggedIn: true,
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        totalSpent: user.totalSpent,
        rewardsEarned: user.rewardsEarned,
        orderCount: user.orderCount,
        isGuest: false,
      });
    }

    return NextResponse.json({
      isLoggedIn: session.isLoggedIn,
      email: session.email,
      role: session.role,
      isGuest: session.isGuest,
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(defaultSession, { status: 500 });
  }
}
