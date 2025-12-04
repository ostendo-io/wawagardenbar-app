'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { requireSuperAdmin } from '@/lib/auth-middleware';
import { SystemSettingsService } from '@/services/system-settings-service';
import { SMSService } from '@/lib/sms';
import { revalidatePath } from 'next/cache';

export async function updateNotificationSettingsAction(settings: {
  smsEnabled: boolean;
  emailEnabled: boolean;
  channels: {
    auth: 'email' | 'sms' | 'both';
    orders: 'email' | 'sms' | 'both';
  };
}) {
  try {
    await requireSuperAdmin();
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await SystemSettingsService.updateNotificationSettings(settings, session.userId);
    
    revalidatePath('/dashboard/settings/notifications');
    return { success: true, message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Update notification settings error:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

export async function sendTestSMSAction(phone: string) {
  try {
    await requireSuperAdmin();
    
    const result = await SMSService.sendSMS(
      phone, 
      'This is a test message from Wawa Garden Bar SMS System.'
    );

    if (result.success) {
      return { success: true, message: 'Test SMS sent successfully' };
    } else {
      // Provide detailed error message
      let errorMessage = result.message || 'Failed to send SMS';
      
      if (result.errorCode === 'DND_REJECTION') {
        errorMessage += ' - For sandbox mode, register this phone number in your Africa\'s Talking dashboard.';
      } else if (result.errorCode === 'SERVICE_DISABLED') {
        errorMessage += ' - Check ENABLE_SMS_NOTIFICATIONS in your environment variables.';
      } else if (result.errorCode === 'MISSING_API_KEY') {
        errorMessage += ' - Check AFRICASTALKING_API_KEY in your environment variables.';
      }
      
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Test SMS error:', error);
    return { success: false, error: 'Error sending test SMS' };
  }
}
