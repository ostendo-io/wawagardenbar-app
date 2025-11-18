'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { revalidatePath } from 'next/cache';
import { RewardsService } from '@/services';
import { sessionOptions, SessionData } from '@/lib/session';
import { IReward } from '@/interfaces';

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Calculate reward for an order (called after order creation)
 * Server-side only to prevent manipulation
 */
export async function calculateRewardAction(
  orderId: string,
  spendAmount: number
): Promise<ActionResult<{ reward: IReward | null }>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in to earn rewards',
      };
    }

    const reward = await RewardsService.calculateReward(
      userId,
      orderId,
      spendAmount
    );

    if (reward) {
      revalidatePath('/profile/rewards');
      return {
        success: true,
        data: { reward },
        message: 'Congratulations! You earned a reward!',
      };
    }

    return {
      success: true,
      data: { reward: null },
      message: 'No reward earned this time',
    };
  } catch (error) {
    console.error('Error calculating reward:', error);
    return {
      success: false,
      error: 'Failed to calculate reward',
    };
  }
}

/**
 * Get user's active rewards
 */
export async function getUserActiveRewardsAction(): Promise<
  ActionResult<{ rewards: IReward[] }>
> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in',
      };
    }

    const rewards = await RewardsService.getUserActiveRewards(userId);

    return {
      success: true,
      data: { rewards },
    };
  } catch (error) {
    console.error('Error getting active rewards:', error);
    return {
      success: false,
      error: 'Failed to get active rewards',
    };
  }
}

/**
 * Get user's reward history
 */
export async function getUserRewardHistoryAction(
  limit = 20,
  skip = 0
): Promise<ActionResult<{ rewards: IReward[]; total: number }>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in',
      };
    }

    const { rewards, total } = await RewardsService.getUserRewardHistory(
      userId,
      { limit, skip }
    );

    return {
      success: true,
      data: { rewards, total },
    };
  } catch (error) {
    console.error('Error getting reward history:', error);
    return {
      success: false,
      error: 'Failed to get reward history',
    };
  }
}

/**
 * Validate reward code
 */
export async function validateRewardCodeAction(
  code: string
): Promise<ActionResult<{ reward: IReward }>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in',
      };
    }

    const result = await RewardsService.validateRewardCode(userId, code);

    if (!result.valid) {
      return {
        success: false,
        error: result.message,
      };
    }

    return {
      success: true,
      data: { reward: result.reward! },
      message: 'Reward code is valid',
    };
  } catch (error) {
    console.error('Error validating reward code:', error);
    return {
      success: false,
      error: 'Failed to validate reward code',
    };
  }
}

/**
 * Redeem a reward (called during checkout)
 */
export async function redeemRewardAction(
  rewardId: string,
  orderId: string
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in',
      };
    }

    const result = await RewardsService.redeemReward(rewardId, orderId);

    if (!result.success) {
      return {
        success: false,
        error: result.message,
      };
    }

    revalidatePath('/profile/rewards');
    revalidatePath('/checkout');

    return {
      success: true,
      message: 'Reward redeemed successfully',
    };
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return {
      success: false,
      error: 'Failed to redeem reward',
    };
  }
}

/**
 * Calculate discount amount for a reward
 */
export async function calculateDiscountAmountAction(
  rewardId: string,
  subtotal: number
): Promise<ActionResult<{ discountAmount: number }>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in',
      };
    }

    // Get reward
    const rewards = await RewardsService.getUserActiveRewards(userId);
    const reward = rewards.find((r) => r._id.toString() === rewardId);

    if (!reward) {
      return {
        success: false,
        error: 'Reward not found',
      };
    }

    const discountAmount = RewardsService.calculateDiscountAmount(
      reward,
      subtotal
    );

    return {
      success: true,
      data: { discountAmount },
    };
  } catch (error) {
    console.error('Error calculating discount amount:', error);
    return {
      success: false,
      error: 'Failed to calculate discount amount',
    };
  }
}

/**
 * Get user reward statistics
 */
export async function getUserRewardStatsAction(): Promise<
  ActionResult<{
    totalEarned: number;
    totalRedeemed: number;
    activeRewards: number;
    expiredRewards: number;
    totalSavings: number;
    loyaltyPoints: number;
  }>
> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in',
      };
    }

    const stats = await RewardsService.getUserRewardStats(userId);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error getting reward stats:', error);
    return {
      success: false,
      error: 'Failed to get reward stats',
    };
  }
}
