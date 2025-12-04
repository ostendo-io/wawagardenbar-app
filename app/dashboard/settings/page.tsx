import { requireSuperAdmin } from '@/lib/auth-middleware';
import { SettingsService } from '@/services';
import { SystemSettingsService } from '@/services/system-settings-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/features/admin/settings-form';

export const metadata = {
  title: 'Settings | Admin Dashboard',
  description: 'Manage application settings',
};

/**
 * Settings management page
 * Super-admin only
 */
export default async function SettingsPage() {
  await requireSuperAdmin();

  // Get current settings
  const [settings, notificationSettings] = await Promise.all([
    SettingsService.getSettings(),
    SystemSettingsService.getNotificationSettings()
  ]);

  // Serialize for client - use JSON.parse(JSON.stringify()) to remove Mongoose metadata
  const plainSettings = JSON.parse(JSON.stringify(settings));
  
  const serializedSettings = {
    serviceFeePercentage: plainSettings.serviceFeePercentage,
    deliveryFeeBase: plainSettings.deliveryFeeBase,
    deliveryFeeReduced: plainSettings.deliveryFeeReduced,
    freeDeliveryThreshold: plainSettings.freeDeliveryThreshold,
    minimumOrderAmount: plainSettings.minimumOrderAmount,
    taxPercentage: plainSettings.taxPercentage,
    taxEnabled: plainSettings.taxEnabled,
    estimatedPreparationTime: plainSettings.estimatedPreparationTime,
    maxOrdersPerHour: plainSettings.maxOrdersPerHour,
    allowGuestCheckout: plainSettings.allowGuestCheckout,
    deliveryRadius: plainSettings.deliveryRadius,
    deliveryEnabled: plainSettings.deliveryEnabled,
    pickupEnabled: plainSettings.pickupEnabled,
    dineInEnabled: plainSettings.dineInEnabled,
    businessHours: plainSettings.businessHours,
    contactEmail: plainSettings.contactEmail,
    contactPhone: plainSettings.contactPhone,
    address: plainSettings.address,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage application settings and configuration
        </p>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure fees, business hours, and other application settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm 
            initialSettings={serializedSettings} 
            notificationSettings={notificationSettings}
          />
        </CardContent>
      </Card>
    </div>
  );
}
