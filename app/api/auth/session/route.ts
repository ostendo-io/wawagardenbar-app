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

    console.log('Session API Debug:', {
      isLoggedIn: session.isLoggedIn,
      userId: session.userId,
      isGuest: session.isGuest,
      email: session.email
    });

    if (!session.isLoggedIn) {
      return NextResponse.json(defaultSession);
    }

    if (session.userId && !session.isGuest) {
      await connectDB();
      const user = await UserModel.findById(session.userId).select(
        'firstName lastName name email emailVerified role totalSpent rewardsEarned totalOrders'
      );

      if (!user) {
        session.destroy();
        return NextResponse.json(defaultSession);
      }

      // Compute full name from firstName and lastName
      const fullName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.name || user.email.split('@')[0];

      return NextResponse.json({
        isLoggedIn: true,
        userId: user._id.toString(),
        email: user.email,
        name: fullName,
        emailVerified: user.emailVerified,
        role: user.role,
        totalSpent: user.totalSpent,
        rewardsEarned: user.rewardsEarned,
        orderCount: user.totalOrders,
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
