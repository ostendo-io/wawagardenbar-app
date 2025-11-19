import { Types } from 'mongoose';
import SystemSettingsModel, { ISystemSettings } from '@/models/system-settings-model';
import { connectDB } from '@/lib/mongodb';

/**
 * Service for managing system settings
 */
export class SystemSettingsService {
  /**
   * Get points conversion rate (public)
   */
  static async getPointsConversionRate(): Promise<number> {
    await connectDB();
    
    const setting = await SystemSettingsModel.findOne({
      key: 'points-conversion-rate',
    });
    
    // Default to 100 points = ₦1 if not set
    return setting?.value ?? 100;
  }
  
  /**
   * Get a system setting by key
   */
  static async getSetting(
    key: 'points-conversion-rate' | 'service-fee' | 'tax-rate'
  ): Promise<ISystemSettings | null> {
    await connectDB();
    
    return await SystemSettingsModel.findOne({ key });
  }
  
  /**
   * Update points conversion rate (admin only)
   */
  static async updatePointsConversionRate(
    newRate: number,
    adminUserId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    rate: number;
    previousRate?: number;
    affectedItems: number;
  }> {
    await connectDB();
    
    // Validate rate
    if (newRate < 1 || newRate > 1000) {
      throw new Error('Conversion rate must be between 1 and 1000 points per ₦1');
    }
    
    const MenuItemModel = (await import('@/models/menu-item-model')).default;
    
    // Get current setting
    const currentSetting = await SystemSettingsModel.findOne({
      key: 'points-conversion-rate',
    });
    
    const previousRate = currentSetting?.value ?? 100;
    
    // Count affected menu items
    const affectedItems = await MenuItemModel.countDocuments({
      pointsRedeemable: true,
    });
    
    // Update or create setting
    const updated = await SystemSettingsModel.findOneAndUpdate(
      { key: 'points-conversion-rate' },
      {
        $set: {
          value: newRate,
          updatedBy: new Types.ObjectId(adminUserId as string),
          updatedAt: new Date(),
          previousValue: previousRate,
        },
        $push: {
          changeHistory: {
            value: newRate,
            changedBy: new Types.ObjectId(adminUserId as string),
            changedAt: new Date(),
            reason: reason || 'Rate updated',
          },
        },
      },
      { upsert: true, new: true }
    );
    
    return {
      success: true,
      rate: updated.value,
      previousRate,
      affectedItems,
    };
  }
  
  /**
   * Get impact analysis for a potential rate change
   */
  static async getConversionRateImpact(newRate: number): Promise<{
    currentRate: number;
    newRate: number;
    affectedMenuItems: number;
    exampleChanges: Array<{
      itemName: string;
      price: number;
      currentPoints: number;
      newPoints: number;
    }>;
    customerImpact: string;
  }> {
    await connectDB();
    
    const MenuItemModel = (await import('@/models/menu-item-model')).default;
    
    const currentRate = await this.getPointsConversionRate();
    
    // Get affected menu items
    const affectedCount = await MenuItemModel.countDocuments({
      pointsRedeemable: true,
    });
    
    // Get sample items for examples
    const sampleItems = await MenuItemModel.find({
      pointsRedeemable: true,
    })
      .limit(3)
      .select('name price pointsValue');
    
    const exampleChanges = sampleItems.map((item) => ({
      itemName: item.name,
      price: item.price,
      currentPoints: item.pointsValue || item.price * currentRate,
      newPoints: item.price * newRate,
    }));
    
    // Determine customer impact
    let customerImpact: string;
    if (newRate < currentRate) {
      customerImpact = 'Points will be worth MORE';
    } else if (newRate > currentRate) {
      customerImpact = 'Points will be worth LESS';
    } else {
      customerImpact = 'No change';
    }
    
    return {
      currentRate,
      newRate,
      affectedMenuItems: affectedCount,
      exampleChanges,
      customerImpact,
    };
  }
  
  /**
   * Initialize default settings
   */
  static async initializeDefaults(): Promise<void> {
    await connectDB();
    
    const existingRate = await SystemSettingsModel.findOne({
      key: 'points-conversion-rate',
    });
    
    if (!existingRate) {
      await SystemSettingsModel.create({
        key: 'points-conversion-rate',
        value: 100,
        description: 'Number of loyalty points equal to ₦1',
        updatedAt: new Date(),
        changeHistory: [
          {
            value: 100,
            changedAt: new Date(),
            reason: 'Initial setup',
          },
        ],
      });
    }
  }
}
