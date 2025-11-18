'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { validateEmail, sanitizeEmail } from '@/lib/auth-utils';

interface GuestCheckoutResult {
  success: boolean;
  message: string;
}

export async function guestCheckoutAction(
  email: string
): Promise<GuestCheckoutResult> {
  try {
    if (!email || !validateEmail(email)) {
      return {
        success: false,
        message: 'Please provide a valid email address',
      };
    }

    const sanitizedEmail = sanitizeEmail(email);

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    session.email = sanitizedEmail;
    session.isGuest = true;
    session.isLoggedIn = true;
    session.createdAt = Date.now();

    await session.save();

    return {
      success: true,
      message: 'Guest session created successfully',
    };
  } catch (error) {
    console.error('Guest checkout error:', error);
    return {
      success: false,
      message: 'Failed to create guest session. Please try again.',
    };
  }
}
