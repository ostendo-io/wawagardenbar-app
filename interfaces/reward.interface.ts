import { Types } from 'mongoose';

export type RewardType = 'discount-percentage' | 'discount-fixed' | 'free-item' | 'loyalty-points';

export type RewardStatus = 'pending' | 'active' | 'redeemed' | 'expired';

export interface IRewardRule {
  _id: Types.ObjectId;
  name: string;
  description: string;
  isActive: boolean;
  spendThreshold: number;
  rewardType: RewardType;
  rewardValue: number;
  freeItemId?: Types.ObjectId;
  probability: number;
  maxRedemptionsPerUser?: number;
  validityDays: number;
  startDate?: Date;
  endDate?: Date;
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
