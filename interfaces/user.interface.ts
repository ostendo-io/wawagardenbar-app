import { Types } from 'mongoose';

export interface IAddress {
  _id?: Types.ObjectId;
  label: string; // e.g., "Home", "Work", "Mom's House"
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt?: Date;
  lastUsedAt?: Date;
}

export interface IPreferences {
  dietaryRestrictions: string[]; // e.g., ["vegetarian", "gluten-free"]
  favoriteItems: Types.ObjectId[]; // references to MenuItem
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
}

export interface IPaymentMethod {
  type: 'card' | 'transfer' | 'ussd' | 'phone';
  details: string;
  isDefault: boolean;
}

export type UserRole = 'customer' | 'admin' | 'super-admin';

export interface ISocialProfile {
  handle: string;
  lastCheckedAt?: Date;
  verified?: boolean;
  profileUrl?: string;
}

export interface ISocialProfiles {
  instagram?: ISocialProfile;
  twitter?: ISocialProfile;
  facebook?: ISocialProfile;
}

export interface IUser {
  _id: Types.ObjectId;
  // Basic Information
  firstName?: string;
  lastName?: string;
  name?: string; // Computed from firstName + lastName
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified?: boolean;
  profilePicture?: string;
  
  // Social Profiles
  socialProfiles?: ISocialProfiles;

  // Authentication
  role: UserRole;
  verificationPin?: string;
  pinExpiresAt?: Date;
  sessionToken?: string;
  
  // Addresses & Payment
  addresses: IAddress[];
  paymentMethods: IPaymentMethod[];
  
  // Preferences
  preferences?: IPreferences;
  
  // Account Metadata
  accountStatus: 'active' | 'suspended' | 'deleted';
  totalSpent: number;
  totalOrders: number; // Renamed from orderCount for clarity
  rewardsEarned: number;
  loyaltyPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  profileCompletionPercentage?: number;
  
  // Guest Conversion
  isGuest: boolean;
  guestOrderIds?: Types.ObjectId[];
  claimedAt?: Date;
  
  // Timestamps
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  incrementOrderCount?: () => void;
  addToTotalSpent?: (amount: number) => void;
  getDefaultAddress?: () => IAddress | null;
  getFullName?: () => string;
}
