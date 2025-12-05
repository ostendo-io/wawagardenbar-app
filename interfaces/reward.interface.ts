import { Types } from 'mongoose';

export type RewardType = 'discount-percentage' | 'discount-fixed' | 'free-item' | 'loyalty-points';

export type RewardStatus = 'pending' | 'active' | 'redeemed' | 'expired';

export type RewardTriggerType = 'transaction' | 'social_instagram';

export interface ISocialRewardConfig {
  platform: 'instagram';
  hashtag: string;
  minViews: number;
  maxPostsPerPeriod: number;
  periodType: 'weekly' | 'monthly' | 'campaign_duration';
  pointsAwarded: number;
}

export interface IRewardRule {
  _id: Types.ObjectId;
  name: string;
  description: string;
  isActive: boolean;
  spendThreshold: number;
  rewardType: RewardType;
  triggerType?: RewardTriggerType;
  socialConfig?: ISocialRewardConfig;
  rewardValue: number;
  freeItemId?: Types.ObjectId;
  probability: number;
  maxRedemptionsPerUser?: number;
  validityDays: number;
  startDate?: Date; // Deprecated: use campaignDates for multiple ranges
  endDate?: Date;   // Deprecated: use campaignDates for multiple ranges
  campaignDates?: Array<{ from: Date; to: Date }>; // Multiple date ranges
  createdAt: Date;
  updatedAt: Date;
}

export interface IReward {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  ruleId: Types.ObjectId;
  orderId: Types.ObjectId;
  tabId?: Types.ObjectId;
  rewardType: RewardType;
  rewardValue: number;
  freeItemId?: Types.ObjectId;
  status: RewardStatus;
  code: string;
  expiresAt: Date;
  redeemedAt?: Date;
  redeemedInOrderId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
