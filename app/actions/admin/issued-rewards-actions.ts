'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-middleware';
import Reward from '@/models/reward-model';
import User from '@/models/user-model';
import Order from '@/models/order-model';
import { IReward } from '@/interfaces';

/**
 * Action result type
 */
interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Paginated result type
 */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filters for issued rewards
 */
interface IssuedRewardsFilters {
  status?: 'active' | 'redeemed' | 'expired';
  rewardType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Detailed reward information
 */
interface RewardDetails extends IReward {
  userEmail?: string;
  userName?: string;
  earnedFromOrder?: {
    orderNumber: string;
    total: number;
    date: Date;
  };
  usedInOrder?: {
    orderNumber: string;
    discountApplied: number;
    date: Date;
  };
  ruleName?: string;
  ruleDescription?: string;
}

/**
 * Get issued rewards with filters and pagination
 */
export async function getIssuedRewardsAction(
  filters: IssuedRewardsFilters = {},
  page: number = 1,
  limit: number = 50
): Promise<ActionResult<PaginatedResult<IReward>>> {
  try {
    // Verify admin access
    await requireAdmin();

    await connectDB();

    // Build query
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.rewardType) {
      query.rewardType = filters.rewardType;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Handle search (by user email or reward code)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      
      // If search looks like a reward code
      if (searchLower.startsWith('rwd-')) {
        query.code = { $regex: searchLower, $options: 'i' };
      } else {
        // Search by user email
        const users = await User.find({
          email: { $regex: searchLower, $options: 'i' },
        })
          .select('_id')
          .lean();

        if (users.length > 0) {
          query.userId = { $in: users.map((u) => u._id) };
        } else {
          // No users found, return empty result
          return {
            success: true,
            data: {
              data: [],
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }
      }
    }

    // Get total count
    const total = await Reward.countDocuments(query);

    // Get paginated rewards
    const rewards = await Reward.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'email name')
      .populate('ruleId', 'name')
      .lean();

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        data: rewards as IReward[],
        total,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error getting issued rewards:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get issued rewards',
    };
  }
}

/**
 * Get detailed information about a single reward
 */
export async function getRewardDetailsAction(
  rewardId: string
): Promise<ActionResult<RewardDetails>> {
  try {
    // Verify admin access
    await requireAdmin();

    await connectDB();

    // Get reward with populated data
    const reward = await Reward.findById(rewardId)
      .populate('userId', 'email name')
      .populate('ruleId', 'name description')
      .lean();

    if (!reward) {
      return {
        success: false,
        error: 'Reward not found',
      };
    }

    // Get earning order details
    let earnedFromOrder;
    if (reward.orderId) {
      const order = await Order.findById(reward.orderId)
        .select('orderNumber total createdAt')
        .lean();
      
      if (order) {
        earnedFromOrder = {
          orderNumber: order.orderNumber,
          total: order.total,
          date: order.createdAt,
        };
      }
    }

    // Get redemption order details
    let usedInOrder;
    if (reward.redeemedInOrderId) {
      const order = await Order.findById(reward.redeemedInOrderId)
        .select('orderNumber total createdAt')
        .lean();
      
      if (order) {
        usedInOrder = {
          orderNumber: order.orderNumber,
          discountApplied: reward.rewardValue,
          date: order.createdAt,
        };
      }
    }

    const details: RewardDetails = {
      ...reward,
      userEmail: (reward.userId as any)?.email,
      userName: (reward.userId as any)?.name,
      ruleName: (reward.ruleId as any)?.name,
      ruleDescription: (reward.ruleId as any)?.description,
      earnedFromOrder,
      usedInOrder,
    } as RewardDetails;

    return {
      success: true,
      data: details,
    };
  } catch (error) {
    console.error('Error getting reward details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get reward details',
    };
  }
}

/**
 * Manually expire a reward (admin override)
 */
export async function expireRewardAction(
  rewardId: string
): Promise<ActionResult> {
  try {
    // Verify admin access
    await requireAdmin();

    await connectDB();

    // Find and update reward
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      return {
        success: false,
        error: 'Reward not found',
      };
    }

    if (reward.status !== 'active') {
      return {
        success: false,
        error: 'Only active rewards can be expired',
      };
    }

    reward.status = 'expired';
    await reward.save();

    // Revalidate paths
    revalidatePath('/dashboard/rewards');
    revalidatePath('/dashboard/rewards/issued');

    return {
      success: true,
      message: 'Reward expired successfully',
    };
  } catch (error) {
    console.error('Error expiring reward:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to expire reward',
    };
  }
}

/**
 * Export issued rewards to CSV
 */
export async function exportIssuedRewardsAction(
  filters: IssuedRewardsFilters = {}
): Promise<ActionResult<string>> {
  try {
    // Verify admin access
    await requireAdmin();

    await connectDB();

    // Build query (same as getIssuedRewardsAction)
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.rewardType) {
      query.rewardType = filters.rewardType;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Get all matching rewards (no pagination for export)
    const rewards = await Reward.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'email name')
      .populate('ruleId', 'name')
      .populate('orderId', 'orderNumber')
      .populate('redeemedInOrderId', 'orderNumber')
      .lean();

    // Generate CSV
    const headers = [
      'Reward Code',
      'User Email',
      'User Name',
      'Reward Type',
      'Reward Value',
      'Status',
      'Issued Date',
      'Expires Date',
      'Redeemed Date',
      'Earned From Order',
      'Used In Order',
      'Rule Name',
    ];

    const rows = rewards.map((reward) => [
      reward.code,
      (reward.userId as any)?.email || '',
      (reward.userId as any)?.name || '',
      reward.rewardType,
      reward.rewardValue.toString(),
      reward.status,
      new Date(reward.createdAt).toISOString(),
      new Date(reward.expiresAt).toISOString(),
      reward.redeemedAt ? new Date(reward.redeemedAt).toISOString() : '',
      (reward.orderId as any)?.orderNumber || '',
      (reward.redeemedInOrderId as any)?.orderNumber || '',
      (reward.ruleId as any)?.name || '',
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return {
      success: true,
      data: csvContent,
      message: `Exported ${rewards.length} rewards`,
    };
  } catch (error) {
    console.error('Error exporting rewards:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export rewards',
    };
  }
}
