import { Types } from 'mongoose';
import PointsTransactionModel, {
  IPointsTransaction,
  PointsTransactionType,
} from '@/models/points-transaction-model';
import UserModel from '@/models/user-model';
import { connectDB } from '@/lib/mongodb';
import { SystemSettingsService } from './system-settings-service';

/**
 * Service for managing loyalty points
 */
export class PointsService {
  /**
   * Award points to a user
   */
  static async awardPoints(
    userId: Types.ObjectId | string,
    amount: number,
    orderId?: Types.ObjectId | string,
    rewardId?: Types.ObjectId | string,
    description?: string
  ): Promise<IPointsTransaction> {
    await connectDB();
    
    const userIdObj = new Types.ObjectId(userId as string);
    
    // Update user's points balance
    const user = await UserModel.findByIdAndUpdate(
      userIdObj,
      {
        $inc: {
          loyaltyPoints: amount,
          totalPointsEarned: amount,
        },
      },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create transaction record
    const transaction = await PointsTransactionModel.create({
      userId: userIdObj,
      type: 'earned' as PointsTransactionType,
      amount,
      orderId: orderId ? new Types.ObjectId(orderId as string) : undefined,
      rewardId: rewardId ? new Types.ObjectId(rewardId as string) : undefined,
      description: description || `Earned ${amount} points`,
      balanceAfter: user.loyaltyPoints,
    });
    
    return transaction;
  }
  
  /**
   * Deduct points from a user
   */
  static async deductPoints(
    userId: Types.ObjectId | string,
    amount: number,
    orderId?: Types.ObjectId | string,
    description?: string
  ): Promise<IPointsTransaction> {
    await connectDB();
    
    const userIdObj = new Types.ObjectId(userId as string);
    
    // Check if user has sufficient points
    const user = await UserModel.findById(userIdObj);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.loyaltyPoints < amount) {
      throw new Error('Insufficient points balance');
    }
    
    // Update user's points balance
    const updatedUser = await UserModel.findByIdAndUpdate(
      userIdObj,
      {
        $inc: {
          loyaltyPoints: -amount,
          totalPointsSpent: amount,
        },
      },
      { new: true }
    );
    
    if (!updatedUser) {
      throw new Error('Failed to update user points');
    }
    
    // Create transaction record
    const transaction = await PointsTransactionModel.create({
      userId: userIdObj,
      type: 'spent' as PointsTransactionType,
      amount: -amount,
      orderId: orderId ? new Types.ObjectId(orderId as string) : undefined,
      description: description || `Spent ${amount} points`,
      balanceAfter: updatedUser.loyaltyPoints,
    });
    
    return transaction;
  }
  
  /**
   * Get user's points balance
   */
  static async getBalance(userId: Types.ObjectId | string): Promise<{
    balance: number;
    totalEarned: number;
    totalSpent: number;
    nairaValue: number;
    conversionRate: number;
  }> {
    await connectDB();
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const conversionRate = await SystemSettingsService.getPointsConversionRate();
    const nairaValue = user.loyaltyPoints / conversionRate;
    
    return {
      balance: user.loyaltyPoints,
      totalEarned: user.totalPointsEarned,
      totalSpent: user.totalPointsSpent,
      nairaValue,
      conversionRate,
    };
  }
  
  /**
   * Get user's points transaction history
   */
  static async getTransactionHistory(
    userId: Types.ObjectId | string,
    limit = 50,
    skip = 0
  ): Promise<{
    transactions: IPointsTransaction[];
    total: number;
  }> {
    await connectDB();
    
    const userIdObj = new Types.ObjectId(userId as string);
    
    const [transactions, total] = await Promise.all([
      PointsTransactionModel.find({ userId: userIdObj })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('orderId', 'orderNumber')
        .populate('rewardId', 'code rewardType'),
      PointsTransactionModel.countDocuments({ userId: userIdObj }),
    ]);
    
    return {
      transactions,
      total,
    };
  }
  
  /**
   * Calculate points required for a menu item
   */
  static async calculatePointsForItem(price: number): Promise<number> {
    const conversionRate = await SystemSettingsService.getPointsConversionRate();
    return price * conversionRate;
  }
  
  /**
   * Check if user can redeem an item with points
   */
  static async canRedeemItem(
    userId: Types.ObjectId | string,
    pointsRequired: number
  ): Promise<boolean> {
    await connectDB();
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return false;
    }
    
    return user.loyaltyPoints >= pointsRequired;
  }
  
  /**
   * Get eligible items for points redemption
   */
  static async getEligibleItems(userId: Types.ObjectId | string): Promise<
    Array<{
      itemId: string;
      name: string;
      price: number;
      pointsRequired: number;
      canRedeem: boolean;
    }>
  > {
    await connectDB();
    
    const MenuItemModel = (await import('@/models/menu-item-model')).default;
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const items = await MenuItemModel.find({
      pointsRedeemable: true,
      isAvailable: true,
    }).select('name price pointsValue');
    
    return items.map((item) => ({
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      pointsRequired: item.pointsValue || 0,
      canRedeem: user.loyaltyPoints >= (item.pointsValue || 0),
    }));
  }
  
  /**
   * Adjust points (admin only)
   */
  static async adjustPoints(
    userId: Types.ObjectId | string,
    amount: number,
    reason: string,
    _adminUserId: Types.ObjectId | string
  ): Promise<IPointsTransaction> {
    await connectDB();
    
    const userIdObj = new Types.ObjectId(userId as string);
    
    // Update user's points balance
    const user = await UserModel.findByIdAndUpdate(
      userIdObj,
      {
        $inc: {
          loyaltyPoints: amount,
          ...(amount > 0 ? { totalPointsEarned: amount } : { totalPointsSpent: Math.abs(amount) }),
        },
      },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create transaction record
    const transaction = await PointsTransactionModel.create({
      userId: userIdObj,
      type: 'adjusted' as PointsTransactionType,
      amount,
      description: `Admin adjustment: ${reason}`,
      balanceAfter: user.loyaltyPoints,
    });
    
    return transaction;
  }
}
