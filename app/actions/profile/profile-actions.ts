'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ProfileService } from '@/services';
import { sessionOptions, SessionData } from '@/lib/session';
import { IUser, IAddress } from '@/interfaces';
import { AuditLogService } from '@/services/audit-log-service';

/**
 * Action result type
 */
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validation schemas
 */
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 format
});

const addressSchema = z.object({
  label: z.string().min(1).max(50),
  streetAddress: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().min(2).max(100).default('Nigeria'),
  deliveryInstructions: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

const preferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).optional(),
  communicationPreferences: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }).optional(),
  language: z.string().optional(),
});

/**
 * Get user profile
 */
export async function getUserProfileAction(): Promise<ActionResult<IUser>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const profile = await ProfileService.getUserProfile(session.userId);

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    // Serialize to plain object
    const serializedProfile = JSON.parse(JSON.stringify(profile));

    return {
      success: true,
      data: serializedProfile,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: 'Failed to get profile',
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfileAction(
  data: z.infer<typeof updateProfileSchema>
): Promise<ActionResult<IUser>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Validate input
    const validated = updateProfileSchema.parse(data);

    // Update profile
    const updatedProfile = await ProfileService.updateProfile(
      session.userId,
      validated
    );

    if (!updatedProfile) {
      return {
        success: false,
        error: 'Failed to update profile',
      };
    }

    // Log audit
    await AuditLogService.createLog({
      userId: session.userId,
      userEmail: session.email || '',
      userRole: session.role || 'customer',
      action: 'user.update',
      resource: 'user_profile',
      resourceId: session.userId,
      details: { fields: Object.keys(validated) },
    });

    revalidatePath('/profile');

    // Serialize to plain object
    const serializedProfile = JSON.parse(JSON.stringify(updatedProfile));

    return {
      success: true,
      data: serializedProfile,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: 'Failed to update profile',
    };
  }
}

/**
 * Update preferences
 */
export async function updatePreferencesAction(
  data: z.infer<typeof preferencesSchema>
): Promise<ActionResult<IUser>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Validate input
    const validated = preferencesSchema.parse(data);

    // Update profile
    const updatedProfile = await ProfileService.updateProfile(
      session.userId,
      { preferences: validated }
    );

    if (!updatedProfile) {
      return {
        success: false,
        error: 'Failed to update preferences',
      };
    }

    revalidatePath('/profile');

    // Serialize to plain object
    const serializedProfile = JSON.parse(JSON.stringify(updatedProfile));

    return {
      success: true,
      data: serializedProfile,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Error updating preferences:', error);
    return {
      success: false,
      error: 'Failed to update preferences',
    };
  }
}

/**
 * Upload profile picture
 */
export async function uploadProfilePictureAction(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    const result = await ProfileService.uploadProfilePicture(session.userId, file);

    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Failed to upload picture',
      };
    }

    // Log audit
    await AuditLogService.createLog({
      userId: session.userId,
      userEmail: session.email || '',
      userRole: session.role || 'customer',
      action: 'user.update',
      resource: 'user_profile_picture',
      resourceId: session.userId,
    });

    revalidatePath('/profile');

    return {
      success: true,
      data: { url: result.url! },
    };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return {
      success: false,
      error: 'Failed to upload picture',
    };
  }
}

/**
 * Add address
 */
export async function addAddressAction(
  data: z.infer<typeof addressSchema>
): Promise<ActionResult<IUser>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Validate input
    const validated = addressSchema.parse(data);

    // Add address
    const updatedProfile = await ProfileService.addAddress(
      session.userId,
      validated
    );

    if (!updatedProfile) {
      return {
        success: false,
        error: 'Failed to add address',
      };
    }

    // Log audit
    await AuditLogService.createLog({
      userId: session.userId,
      userEmail: session.email || '',
      userRole: session.role || 'customer',
      action: 'user.update',
      resource: 'user_address',
      resourceId: session.userId,
      details: { action: 'add', label: validated.label },
    });

    revalidatePath('/profile');

    // Serialize to plain object
    const serializedProfile = JSON.parse(JSON.stringify(updatedProfile));

    return {
      success: true,
      data: serializedProfile,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Error adding address:', error);
    return {
      success: false,
      error: 'Failed to add address',
    };
  }
}

/**
 * Update address
 */
export async function updateAddressAction(
  addressId: string,
  data: Partial<z.infer<typeof addressSchema>>
): Promise<ActionResult<IUser>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Update address
    const updatedProfile = await ProfileService.updateAddress(
      session.userId,
      addressId,
      data
    );

    if (!updatedProfile) {
      return {
        success: false,
        error: 'Failed to update address',
      };
    }

    // Log audit
    await AuditLogService.createLog({
      userId: session.userId,
      userEmail: session.email || '',
      userRole: session.role || 'customer',
      action: 'user.update',
      resource: 'user_address',
      resourceId: session.userId,
      details: { action: 'update', addressId },
    });

    revalidatePath('/profile');

    // Serialize to plain object
    const serializedProfile = JSON.parse(JSON.stringify(updatedProfile));

    return {
      success: true,
      data: serializedProfile,
    };
  } catch (error) {
    console.error('Error updating address:', error);
    return {
      success: false,
      error: 'Failed to update address',
    };
  }
}

/**
 * Delete address
 */
export async function deleteAddressAction(
  addressId: string
): Promise<ActionResult<IUser>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Delete address
    const updatedProfile = await ProfileService.deleteAddress(
      session.userId,
      addressId
    );

    if (!updatedProfile) {
      return {
        success: false,
        error: 'Failed to delete address',
      };
    }

    // Log audit
    await AuditLogService.createLog({
      userId: session.userId,
      userEmail: session.email || '',
      userRole: session.role || 'customer',
      action: 'user.update',
      resource: 'user_address',
      resourceId: session.userId,
      details: { action: 'delete', addressId },
    });

    revalidatePath('/profile');

    // Serialize to plain object
    const serializedProfile = JSON.parse(JSON.stringify(updatedProfile));

    return {
      success: true,
      data: serializedProfile,
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    return {
      success: false,
      error: 'Failed to delete address',
    };
  }
}

/**
 * Set default address
 */
export async function setDefaultAddressAction(
  addressId: string
): Promise<ActionResult<IUser>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Set default address
    const updatedProfile = await ProfileService.setDefaultAddress(
      session.userId,
      addressId
    );

    if (!updatedProfile) {
      return {
        success: false,
        error: 'Failed to set default address',
      };
    }

    revalidatePath('/profile');

    // Serialize to plain object
    const serializedProfile = JSON.parse(JSON.stringify(updatedProfile));

    return {
      success: true,
      data: serializedProfile,
    };
  } catch (error) {
    console.error('Error setting default address:', error);
    return {
      success: false,
      error: 'Failed to set default address',
    };
  }
}

/**
 * Get user addresses
 */
export async function getUserAddressesAction(): Promise<ActionResult<IAddress[]>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const addresses = await ProfileService.getAddresses(session.userId);

    // Serialize to plain object
    const serializedAddresses = JSON.parse(JSON.stringify(addresses));

    return {
      success: true,
      data: serializedAddresses,
    };
  } catch (error) {
    console.error('Error getting addresses:', error);
    return {
      success: false,
      error: 'Failed to get addresses',
    };
  }
}

/**
 * Claim guest orders
 */
export async function claimGuestOrdersAction(
  email: string
): Promise<ActionResult<{ ordersLinked: number }>> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const result = await ProfileService.claimGuestOrders(session.userId, email);

    if (!result.success) {
      return {
        success: false,
        error: 'Failed to claim guest orders',
      };
    }

    // Log audit
    await AuditLogService.createLog({
      userId: session.userId,
      userEmail: session.email || '',
      userRole: session.role || 'customer',
      action: 'user.update',
      resource: 'user_guest_conversion',
      resourceId: session.userId,
      details: { ordersLinked: result.ordersLinked },
    });

    revalidatePath('/profile');
    revalidatePath('/orders');

    return {
      success: true,
      data: { ordersLinked: result.ordersLinked },
    };
  } catch (error) {
    console.error('Error claiming guest orders:', error);
    return {
      success: false,
      error: 'Failed to claim guest orders',
    };
  }
}
