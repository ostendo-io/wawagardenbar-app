'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { validateEmail, sanitizeEmail } from '@/lib/auth-utils';
import { randomUUID } from 'crypto';

interface GuestCheckoutResult {
  success: boolean;
  message: string;
}

export async function guestCheckoutAction(
  email?: string,
  name?: string
): Promise<GuestCheckoutResult> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    // If email is provided, validate it
    if (email) {
      if (!validateEmail(email)) {
        return {
          success: false,
          message: 'Please provide a valid email address',
        };
      }
      session.email = sanitizeEmail(email);
    }

    if (name) {
      session.name = name;
    }

    // Generate a unique guest ID if one doesn't exist
    if (!session.guestId) {
      session.guestId = randomUUID();
    }

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
