'use server';

import { connectDB } from '@/lib/mongodb';
import { requireSuperAdmin } from '@/lib/auth-middleware';
import AuditLogModel from '@/models/audit-log-model';
import User from '@/models/user-model';
import { AuditLogService } from '@/services/audit-log-service';
import { revalidatePath } from 'next/cache';
import { sendAccountDeletionEmail } from '@/lib/email';

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get pending deletion requests
 */
export async function getDeletionRequestsAction() {
  await requireSuperAdmin();
  await connectDB();

  // Find audit logs for deletion requests
  // Ideally, we would have a status on the request, but for now we look for the log
  // and perhaps cross-reference if the user still exists.
  const logs = await AuditLogModel.find({
    action: 'user.delete_request',
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
    
  // Check if users still exist
  const enrichedLogs = await Promise.all(logs.map(async (log) => {
    // Check if user is already deleted
    const user = await User.findById(log.userId).select('_id email').lean();
    return {
      ...JSON.parse(JSON.stringify(log)),
      userExists: !!user,
    };
  }));

  return {
    success: true,
    data: enrichedLogs,
  };
}

/**
 * Approve deletion request (Delete User)
 */
export async function approveDeletionRequestAction(userId: string, logId: string): Promise<ActionResult> {
  try {
    const admin = await requireSuperAdmin();
    await connectDB();

    const user = await User.findById(userId);
    
    if (!user) {
        // Even if user doesn't exist, we might want to mark the log as handled if we had a status
        return { success: true, message: 'User already deleted' };
    }
    
    // Send email notification before deletion (if email exists)
    if (user.email) {
      try {
        await sendAccountDeletionEmail(user.email);
      } catch (emailError) {
        console.error('Failed to send account deletion email:', emailError);
        // Continue with deletion even if email fails
      }
    }

    // Perform deletion logic here (e.g., anonymize data, delete record)
    // For this implementation, we will delete the user record.
    // In a real system, we might want to cascade delete or soft delete.
    await User.findByIdAndDelete(userId);
    
    // Log the admin action
    await AuditLogService.createLog({
        userId: admin.userId!,
        userEmail: admin.email!,
        userRole: 'super-admin',
        action: 'user.delete',
        resource: 'user',
        resourceId: userId,
        details: { 
            reason: 'Approved data deletion request',
            originalRequestId: logId
        }
    });

    revalidatePath('/dashboard/settings/data-requests');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
