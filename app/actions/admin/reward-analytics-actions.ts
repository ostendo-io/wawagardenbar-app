'use server';

import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-middleware';
import Reward from '@/models/reward-model';
import { RewardsService } from '@/services/rewards-service';

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
 * Reward statistics for dashboard
 */
interface RewardStatistics {
  totalRulesActive: number;
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
  totalRewardsExpired: number;
  activeRewards: number;
  totalValueRedeemed: number;
  redemptionRate: number;
}

/**
 * Rewards issued over time data point
 */
interface RewardsOverTimeData {
  date: string;
  issued: number;
  redeemed: number;
}

/**
 * Rewards by type data
 */
interface RewardsByTypeData {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Top performing rule data
 */
interface TopPerformingRule {
  ruleId: string;
  ruleName: string;
  issued: number;
  redeemed: number;
  rate: number;
  totalValue: number;
}

/**
 * Get reward statistics for dashboard
 */
export async function getRewardStatisticsAction(): Promise<ActionResult<RewardStatistics>> {
  try {
    // Verify admin access
    await requireAdmin();

    // Get base statistics from service
    const baseStats = await RewardsService.getRewardStatistics();

    // Get active rewards count
    await connectDB();
    const activeRewards = await Reward.countDocuments({ status: 'active' });

    const stats: RewardStatistics = {
      ...baseStats,
      activeRewards,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error getting reward statistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get reward statistics',
    };
  }
}

/**
 * Get rewards issued over time
 */
export async function getRewardsIssuedOverTimeAction(
  days: number = 30
): Promise<ActionResult<RewardsOverTimeData[]>> {
  try {
    // Verify admin access
    await requireAdmin();

    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Reward.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          issued: { $sum: 1 },
          redeemed: {
            $sum: { $cond: [{ $eq: ['$status', 'redeemed'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          issued: 1,
          redeemed: 1,
        },
      },
    ]);

    return {
      success: true,
      data: data as RewardsOverTimeData[],
    };
  } catch (error) {
    console.error('Error getting rewards over time:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get rewards over time',
    };
  }
}

/**
 * Get rewards distribution by type
 */
export async function getRewardsByTypeAction(): Promise<ActionResult<RewardsByTypeData[]>> {
  try {
    // Verify admin access
    await requireAdmin();

    await connectDB();

    const data = await Reward.aggregate([
      {
        $group: {
          _id: '$rewardType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + (item.count as number), 0);

    const result: RewardsByTypeData[] = data.map((item) => ({
      type: item._id as string,
      count: item.count as number,
      percentage: total > 0 ? ((item.count as number) / total) * 100 : 0,
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error getting rewards by type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get rewards by type',
    };
  }
}

/**
 * Get top performing rules
 */
export async function getTopPerformingRulesAction(
  limit: number = 10
): Promise<ActionResult<TopPerformingRule[]>> {
  try {
    // Verify admin access
    await requireAdmin();

    await connectDB();

    const data = await Reward.aggregate([
      {
        $group: {
          _id: '$ruleId',
          issued: { $sum: 1 },
          redeemed: {
            $sum: { $cond: [{ $eq: ['$status', 'redeemed'] }, 1, 0] },
          },
          totalValue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'redeemed'] }, '$rewardValue', 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'rewardrules',
          localField: '_id',
          foreignField: '_id',
          as: 'rule',
        },
      },
      { $unwind: '$rule' },
      {
        $project: {
          ruleId: { $toString: '$_id' },
          ruleName: '$rule.name',
          issued: 1,
          redeemed: 1,
          totalValue: 1,
          rate: {
            $cond: [
              { $gt: ['$issued', 0] },
              { $multiply: [{ $divide: ['$redeemed', '$issued'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { rate: -1 } },
      { $limit: limit },
    ]);

    return {
      success: true,
      data: data as TopPerformingRule[],
    };
  } catch (error) {
    console.error('Error getting top performing rules:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get top performing rules',
    };
  }
}

/**
 * Get redemption rate by rule (for bar chart)
 */
export async function getRedemptionRateByRuleAction(): Promise<ActionResult<TopPerformingRule[]>> {
  try {
    // Verify admin access
    await requireAdmin();

    // Reuse the top performing rules logic
    const result = await getTopPerformingRulesAction(10);
    return result;
  } catch (error) {
    console.error('Error getting redemption rate by rule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get redemption rate by rule',
    };
  }
}
