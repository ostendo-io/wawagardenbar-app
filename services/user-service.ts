import { connectDB } from '@/lib/mongodb';
import UserModel from '@/models/user-model';
import { IUser, IAddress } from '@/interfaces';

export interface UpdateProfileFromCheckoutData {
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    label?: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  savePhone?: boolean;
  saveAddress?: boolean;
}

export class UserService {
  /**
   * Update user profile from checkout data
   */
  static async updateProfileFromCheckout(
    data: UpdateProfileFromCheckoutData
  ): Promise<IUser | null> {
    await connectDB();

    const user = await UserModel.findById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updates: Partial<IUser> = {};

    // Update phone if provided and save requested
    if (data.phone && data.savePhone) {
      updates.phone = data.phone;
    }

    // Update name if provided
    if (data.firstName && data.lastName) {
      updates.firstName = data.firstName;
      updates.lastName = data.lastName;
    }

    // Add delivery address if provided and save requested
    if (data.address && data.saveAddress) {
      const isFirstAddress = user.addresses.length === 0;

      const newAddress: IAddress = {
        label: data.address.label || 'Home',
        streetAddress: data.address.streetAddress,
        city: data.address.city,
        state: data.address.state,
        postalCode: data.address.postalCode,
        country: 'Nigeria',
        deliveryInstructions: data.address.deliveryInstructions,
        isDefault: isFirstAddress,
        lastUsedAt: new Date(),
      };

      user.addresses.push(newAddress);
    }

    // Apply updates
    Object.assign(user, updates);
    await user.save();

    return user;
  }

  /**
   * Get user's default address
   */
  static async getDefaultAddress(userId: string): Promise<IAddress | null> {
    await connectDB();

    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }

    const defaultAddr = user.addresses.find((addr) => addr.isDefault);
    return defaultAddr || (user.addresses.length > 0 ? user.addresses[0] : null);
  }

  /**
   * Get user profile with all details
   */
  static async getUserProfile(userId: string): Promise<IUser | null> {
    await connectDB();

    const user = await UserModel.findById(userId).select(
      '-verificationPin -pinExpiresAt -sessionToken'
    );

    return user;
  }

  /**
   * Update user profile fields
   */
  static async updateUserProfile(
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    await connectDB();

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-verificationPin -pinExpiresAt -sessionToken');

    return user;
  }
}
