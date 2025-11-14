'use server';

import { CategoryService } from '@/services/category-service';

export interface CartActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Validate item availability before adding to cart
 */
export async function validateCartItem(itemId: string, quantity: number): Promise<CartActionResult> {
  try {
    const availability = await CategoryService.checkAvailability(itemId);

    if (!availability.available) {
      return {
        success: false,
        message: 'This item is currently out of stock',
      };
    }

    if (availability.stockStatus === 'low-stock' && availability.currentStock) {
      if (quantity > availability.currentStock) {
        return {
          success: false,
          message: `Only ${availability.currentStock} items available`,
        };
      }
    }

    return {
      success: true,
      data: availability,
    };
  } catch (error) {
    console.error('Error validating cart item:', error);
    return {
      success: false,
      message: 'Failed to validate item availability',
    };
  }
}

/**
 * Validate entire cart before checkout
 */
export async function validateCart(items: Array<{ id: string; quantity: number }>): Promise<CartActionResult> {
  try {
    const validationResults = await Promise.all(
      items.map(async (item) => {
        const result = await validateCartItem(item.id, item.quantity);
        return {
          itemId: item.id,
          ...result,
        };
      })
    );

    const failedItems = validationResults.filter((result) => !result.success);

    if (failedItems.length > 0) {
      return {
        success: false,
        message: 'Some items in your cart are no longer available',
        data: failedItems,
      };
    }

    return {
      success: true,
      message: 'All items are available',
    };
  } catch (error) {
    console.error('Error validating cart:', error);
    return {
      success: false,
      message: 'Failed to validate cart',
    };
  }
}

/**
 * Calculate cart totals with delivery fee
 */
export async function calculateCartTotals(
  subtotal: number,
  orderType: 'dine-in' | 'pickup' | 'delivery'
): Promise<CartActionResult> {
  try {
    let deliveryFee = 0;
    let serviceFee = 0;

    // Calculate fees based on order type
    if (orderType === 'delivery') {
      // Base delivery fee (can be calculated based on distance in future)
      deliveryFee = subtotal >= 2000 ? 500 : 1000;
    }

    // Service fee (2% of subtotal)
    serviceFee = Math.round(subtotal * 0.02);

    const total = subtotal + deliveryFee + serviceFee;

    return {
      success: true,
      data: {
        subtotal,
        deliveryFee,
        serviceFee,
        total,
      },
    };
  } catch (error) {
    console.error('Error calculating cart totals:', error);
    return {
      success: false,
      message: 'Failed to calculate totals',
    };
  }
}

/**
 * Check minimum order requirement
 */
export async function checkMinimumOrder(
  subtotal: number,
  orderType: 'dine-in' | 'pickup' | 'delivery'
): Promise<CartActionResult> {
  const minimumOrders = {
    'dine-in': 0,
    pickup: 1000,
    delivery: 2000,
  };

  const minimum = minimumOrders[orderType];

  if (subtotal < minimum) {
    return {
      success: false,
      message: `Minimum order for ${orderType} is ₦${minimum.toLocaleString()}`,
      data: { minimum, current: subtotal, remaining: minimum - subtotal },
    };
  }

  return {
    success: true,
    message: 'Minimum order met',
  };
}
