import { Types } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IPaymentMethod {
  type: 'card' | 'transfer' | 'ussd' | 'phone';
  details: string;
  isDefault: boolean;
}

export type UserRole = 'customer' | 'admin' | 'super-admin';

export interface IUser {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  role: UserRole;
  verificationPin?: string;
  pinExpiresAt?: Date;
  sessionToken?: string;
  addresses: IAddress[];
  paymentMethods: IPaymentMethod[];
  totalSpent: number;
  rewardsEarned: number;
  loyaltyPoints: number;
  orderCount: number;
  isGuest: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
