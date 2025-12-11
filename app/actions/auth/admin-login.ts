'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { connectDB } from '@/lib/mongodb';
import { AdminService } from '@/services/admin-service';
import { sessionOptions, SessionData } from '@/lib/session';

interface AdminLoginResult {
  success: boolean;
  message: string;
  mustChangePassword?: boolean;
  redirectTo?: string;
}

export async function adminLoginAction(
  username: string,
  password: string
): Promise<AdminLoginResult> {
  try {
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required',
      };
    }

    await connectDB();

    // Authenticate admin
    const admin = await AdminService.authenticate(username, password);

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    session.userId = admin._id.toString();
    session.email = admin.email || undefined;
    session.name = admin.name || admin.username;
    session.role = admin.role;
    session.isGuest = false;
    session.isLoggedIn = true;
    session.createdAt = Date.now();

    await session.save();

    // Check if password change required
    if (admin.mustChangePassword) {
      return {
        success: true,
        message: 'Login successful. Please change your password.',
        mustChangePassword: true,
        redirectTo: '/admin/change-password',
      };
    }

    return {
      success: true,
      message: 'Login successful',
      mustChangePassword: false,
      redirectTo: '/dashboard',
    };
  } catch (error: any) {
    console.error('Admin login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed. Please try again.',
    };
  }
}
