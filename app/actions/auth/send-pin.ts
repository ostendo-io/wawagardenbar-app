'use server';

import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models';
import { sendVerificationPinEmail, sendWelcomeEmail } from '@/lib/email';
import {
  generatePin,
  getPinExpirationTime,
  sanitizeEmail,
  validateEmail,
} from '@/lib/auth-utils';

interface SendPinResult {
  success: boolean;
  message: string;
  isNewUser?: boolean;
}

export async function sendPinAction(email: string): Promise<SendPinResult> {
  try {
    if (!email || !validateEmail(email)) {
      return {
        success: false,
        message: 'Please provide a valid email address',
      };
    }

    const sanitizedEmail = sanitizeEmail(email);

    await connectDB();

    let user = await UserModel.findOne({ email: sanitizedEmail });
    const isNewUser = !user;

    if (!user) {
      user = await UserModel.create({
        email: sanitizedEmail,
        emailVerified: false,
        isGuest: false,
      });
    }

    const pin = generatePin();
    const pinExpiresAt = getPinExpirationTime();

    user.verificationPin = pin;
    user.pinExpiresAt = pinExpiresAt;
    await user.save();

    await sendVerificationPinEmail(sanitizedEmail, pin);

    if (isNewUser) {
      try {
        await sendWelcomeEmail(sanitizedEmail, user.name);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    return {
      success: true,
      message: 'Verification PIN sent to your email',
      isNewUser,
    };
  } catch (error) {
    console.error('Send PIN error:', error);
    return {
      success: false,
      message: 'Failed to send verification PIN. Please try again.',
    };
  }
}
