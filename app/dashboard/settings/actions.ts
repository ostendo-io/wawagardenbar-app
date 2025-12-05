'use server';

import { requireSuperAdmin } from '@/lib/auth-middleware';
import { SystemSettingsService } from '@/services/system-settings-service';
import { revalidatePath } from 'next/cache';

export async function updatePaymentSettingsAction(settings: {
  activeProvider: 'monnify' | 'paystack';
  paystack: {
    enabled: boolean;
    mode: 'test' | 'live';
    publicKey: string;
    secretKey: string;
  };
}) {
  const session = await requireSuperAdmin();
  
  await SystemSettingsService.updatePaymentSettings(settings, session.userId!);
  
  revalidatePath('/dashboard/settings');
  return { success: true };
}
