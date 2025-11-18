import mongoose, { Schema, Model } from 'mongoose';
import { IUser, IAddress, IPaymentMethod } from '@/interfaces';

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Nigeria' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    type: {
      type: String,
      enum: ['card', 'transfer', 'ussd', 'phone'],
      required: true,
    },
    details: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['customer', 'admin', 'super-admin'],
      default: 'customer',
    },
    verificationPin: { type: String, select: false },
    pinExpiresAt: { type: Date, select: false },
    sessionToken: { type: String, select: false },
    addresses: { type: [addressSchema], default: [] },
    paymentMethods: { type: [paymentMethodSchema], default: [] },
    totalSpent: { type: Number, default: 0, min: 0 },
    rewardsEarned: { type: Number, default: 0, min: 0 },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 },
    isGuest: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ sessionToken: 1 });
userSchema.index({ createdAt: -1 });

userSchema.methods.incrementOrderCount = function incrementOrderCount(): void {
  this.orderCount += 1;
};

userSchema.methods.addToTotalSpent = function addToTotalSpent(
  amount: number
): void {
  this.totalSpent += amount;
};

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default UserModel;
