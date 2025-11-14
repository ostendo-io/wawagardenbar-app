'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models';
import { sessionOptions, SessionData } from '@/lib/session';

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    if (session.userId && !session.isGuest) {
      await connectDB();
      await UserModel.findByIdAndUpdate(session.userId, {
        sessionToken: null,
      });
    }

    session.destroy();
  } catch (error) {
    console.error('Logout error:', error);
  }

  redirect('/');
}
