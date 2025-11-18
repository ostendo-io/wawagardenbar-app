'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models';
import { sessionOptions, SessionData } from '@/lib/session';
import {
  generateSessionToken,
  isPinExpired,
  sanitizeEmail,
} from '@/lib/auth-utils';

interface VerifyPinResult {
  success: boolean;
  message: string;
  userId?: string;
}

export async function verifyPinAction(
  email: string,
  pin: string
): Promise<VerifyPinResult> {
  try {
    if (!email || !pin) {
      return {
        success: false,
        message: 'Email and PIN are required',
      };
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return {
        success: false,
        message: 'Invalid PIN format',
      };
    }

    const sanitizedEmail = sanitizeEmail(email);

    await connectDB();

    const user = await UserModel.findOne({ email: sanitizedEmail }).select(
      '+verificationPin +pinExpiresAt'
    );

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    if (!user.verificationPin || !user.pinExpiresAt) {
      return {
        success: false,
        message: 'No verification PIN found. Please request a new one.',
      };
    }

    if (isPinExpired(user.pinExpiresAt)) {
      return {
        success: false,
        message: 'PIN has expired. Please request a new one.',
      };
    }

    if (user.verificationPin !== pin) {
      return {
        success: false,
        message: 'Invalid PIN',
      };
    }

    const sessionToken = generateSessionToken();
    user.sessionToken = sessionToken;
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    user.verificationPin = undefined;
    user.pinExpiresAt = undefined;
    await user.save();

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    session.userId = user._id.toString();
    session.email = user.email;
    session.role = user.role;
    session.isGuest = false;
    session.isLoggedIn = true;
    session.createdAt = Date.now();

    await session.save();

    return {
      success: true,
      message: 'Successfully logged in',
      userId: user._id.toString(),
    };
  } catch (error) {
    console.error('Verify PIN error:', error);
    return {
      success: false,
      message: 'Failed to verify PIN. Please try again.',
    };
  }
}
