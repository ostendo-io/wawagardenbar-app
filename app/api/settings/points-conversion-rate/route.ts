import { NextResponse } from 'next/server';
import { SystemSettingsService } from '@/services/system-settings-service';

/**
 * GET /api/settings/points-conversion-rate
 * Get current points conversion rate (public endpoint)
 */
export async function GET() {
  try {
    const rate = await SystemSettingsService.getPointsConversionRate();
    const setting = await SystemSettingsService.getSetting('points-conversion-rate');
    
    return NextResponse.json({
      rate,
      updatedAt: setting?.updatedAt || new Date(),
      updatedBy: setting?.updatedBy || null,
    });
  } catch (error) {
    console.error('Error fetching points conversion rate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion rate' },
      { status: 500 }
    );
  }
}
