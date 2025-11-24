'use server';

import { connectDB } from '@/lib/mongodb';
import UserModel from '@/models/user-model';
import { UserRole } from '@/interfaces/user.interface';

/**
 * Create test user with specific role
 * ⚠️ FOR DEVELOPMENT/TESTING ONLY - Remove in production
 */
export async function createTestUserAction(
  email: string,
  name: string,
  role: UserRole
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // ⚠️ SECURITY: Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Test user creation disabled in production',
      };
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    // Create user
    await UserModel.create({
      email,
      name,
      role,
      emailVerified: true,
    });

    return {
      success: true,
      message: `Test user created: ${email} (${role})`,
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    return {
      success: false,
      error: 'Failed to create test user',
    };
  }
}
