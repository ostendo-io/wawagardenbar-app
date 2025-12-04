'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/order-model';
import TabModel from '@/models/tab-model';
import { PaymentService } from '@/services/payment-service';
import { TabService, UserService } from '@/services';
import {
  PaymentInitializationResult,
  PaymentVerificationResult,
  PaymentMethod,
} from '@/interfaces/payment';
import { CartItem } from '@/stores/cart-store';

export interface CreateOrderInput {
  orderType: 'dine-in' | 'pickup' | 'delivery';
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryInfo?: {
    address: string;
    landmark?: string;
    instructions?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  pickupTime?: string;
  tableNumber?: string;
  specialInstructions?: string;
  tabId?: string;
  tipAmount?: number;
  savePhone?: boolean;
  saveAddress?: boolean;
  idempotencyKey: string;
}

export interface InitializePaymentInput {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentMethods: PaymentMethod[];
}

/**
 * Create order and prepare for payment
 */
export async function createOrder(input: CreateOrderInput): Promise<{
  success: boolean;
  message?: string;
  data?: { orderId: string };
}> {
  console.log('🚀 createOrder called at:', new Date().toISOString(), {
    orderType: input.orderType,
    items: input.items.map(i => `${i.quantity}x ${i.name}`),
    customerEmail: input.customerInfo.email,
    tabId: input.tabId,
    idempotencyKey: input.idempotencyKey,
  });
  
  try {
    await connectDB();
    
    // Check for existing order with same idempotency key
    const existingOrder = await Order.findOne({ idempotencyKey: input.idempotencyKey });
    if (existingOrder) {
      console.log('🔄 Returning existing order for idempotency key:', input.idempotencyKey);
      return {
        success: true,
        data: { orderId: existingOrder._id.toString() },
      };
    }

    // Check if user is logged in
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId;

    // Calculate totals using SettingsService
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const { SettingsService } = await import('@/services');
    const totals = await SettingsService.calculateOrderTotals(subtotal, input.orderType);
    
    const { serviceFee, deliveryFee, tax, total } = totals;

    // Generate order number with timestamp
    const timestamp = Date.now();
    const orderNumber = `WGB${timestamp.toString().slice(-8)}`;

    // Calculate estimated wait time (in minutes)
    let estimatedWaitTime = 30; // Default 30 minutes
    if (input.orderType === 'delivery') {
      estimatedWaitTime = 45;
    } else if (input.orderType === 'pickup') {
      estimatedWaitTime = 20;
    }

    // Prepare order data
    const orderData: any = {
      orderNumber,
      orderType: input.orderType,
      items: input.items.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        subtotal: item.price * item.quantity,
      })),
      // If user is logged in, use userId; otherwise use guest info
      ...(userId ? { userId } : {
        guestName: input.customerInfo.name,
        guestEmail: input.customerInfo.email,
        guestPhone: input.customerInfo.phone,
      }),
      subtotal,
      serviceFee,
      tax,
      deliveryFee,
      tipAmount: input.tipAmount || 0,
      total: total + (input.tipAmount || 0),
      estimatedWaitTime,
      specialInstructions: input.specialInstructions,
      status: 'pending',
      paymentStatus: 'pending',
      idempotencyKey: input.idempotencyKey,
      ...(input.tabId ? { tabId: input.tabId } : {}),
    };

    // Add order-type-specific details
    if (input.orderType === 'delivery' && input.deliveryInfo) {
      orderData.deliveryDetails = {
        address: {
          street: input.deliveryInfo.address,
          city: 'Lagos', // Default, could be extracted from address
          state: 'Lagos',
          postalCode: '100001',
          country: 'Nigeria',
        },
        deliveryInstructions: input.deliveryInfo.instructions,
      };
    } else if (input.orderType === 'pickup' && input.pickupTime) {
      orderData.pickupDetails = {
        preferredPickupTime: new Date(input.pickupTime),
      };
    } else if (input.orderType === 'dine-in' && input.tableNumber) {
      orderData.dineInDetails = {
        tableNumber: input.tableNumber,
        qrCodeScanned: false,
      };
    }

    // Create order
    const order = await Order.create(orderData);
    
    console.log('✅ Order created successfully:', {
      orderNumber: order.orderNumber,
      orderId: order._id.toString(),
      items: order.items.map(i => `${i.quantity}x ${i.name}`),
      total: order.total,
    });

    // If tabId provided, add order to tab
    if (input.tabId) {
      await TabService.addOrderToTab(input.tabId, order._id.toString());
    }

    // Update user profile if logged in and save flags are set
    if (userId && (input.savePhone || input.saveAddress)) {
      try {
        const nameParts = input.customerInfo.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        await UserService.updateProfileFromCheckout({
          userId,
          firstName,
          lastName,
          email: input.customerInfo.email,
          phone: input.customerInfo.phone,
          address: input.deliveryInfo ? {
            streetAddress: input.deliveryInfo.address,
            city: input.deliveryInfo.city || 'Lagos',
            state: input.deliveryInfo.state || 'Lagos',
            postalCode: input.deliveryInfo.postalCode || '100001',
            deliveryInstructions: input.deliveryInfo.instructions,
          } : undefined,
          savePhone: input.savePhone,
          saveAddress: input.saveAddress && !!input.deliveryInfo,
        });
      } catch (profileError) {
        // Log error but don't fail the order
        console.error('Error updating profile from checkout:', profileError);
      }
    }

    return {
      success: true,
      data: { orderId: order._id.toString() },
    };
  } catch (error: any) {
    // Handle duplicate idempotency key error specifically
    if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
      console.log('⚠️ Duplicate idempotency key detected via DB constraint:', input.idempotencyKey);
      
      // Try to find the existing order
      try {
        const existingOrder = await Order.findOne({ idempotencyKey: input.idempotencyKey });
        if (existingOrder) {
          return {
            success: true,
            data: { orderId: existingOrder._id.toString() },
          };
        }
      } catch (findError) {
        console.error('Error finding existing duplicate order:', findError);
      }
    }

    console.error('Error creating order:', error);
    return {
      success: false,
      message: 'Failed to create order. Please try again.',
    };
  }
}

/**
 * Initialize payment with Monnify
 */
export async function initializePayment(
  input: InitializePaymentInput
): Promise<PaymentInitializationResult> {
  try {
    await connectDB();

    // Get order
    const order = await Order.findById(input.orderId);
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      };
    }

    // Generate payment reference
    const paymentReference = PaymentService.generatePaymentReference(input.orderId);

    // Initialize payment with Monnify
    const response = await PaymentService.initializePayment({
      amount: input.amount,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      paymentReference,
      paymentDescription: `Order #${input.orderId.slice(-8)}`,
      paymentMethods: input.paymentMethods,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${input.orderId}?payment=success`,
      metadata: {
        orderId: input.orderId,
        orderType: order.orderType,
      },
    });

    if (!response.requestSuccessful) {
      return {
        success: false,
        message: response.responseMessage || 'Failed to initialize payment',
      };
    }

    // Update order with payment reference
    order.paymentReference = paymentReference;
    order.transactionReference = response.responseBody.transactionReference;
    await order.save();

    return {
      success: true,
      data: {
        transactionReference: response.responseBody.transactionReference,
        paymentReference,
        checkoutUrl: response.responseBody.checkoutUrl,
        enabledPaymentMethods: response.responseBody.enabledPaymentMethod,
      },
    };
  } catch (error) {
    console.error('Error initializing payment:', error);
    return {
      success: false,
      message: 'Failed to initialize payment. Please try again.',
    };
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  paymentReference: string
): Promise<PaymentVerificationResult> {
  try {
    await connectDB();

    // Verify with Monnify
    const response = await PaymentService.verifyPayment(paymentReference);

    if (!response.requestSuccessful) {
      return {
        success: false,
        message: response.responseMessage || 'Failed to verify payment',
      };
    }

    const paymentData = response.responseBody;

    // Try to find order first
    const order = await Order.findOne({ paymentReference });
    
    // If no order found, try to find tab
    const tab = !order ? await TabModel.findOne({ paymentReference }) : null;

    if (order) {
      const statusMap: Record<string, 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'> = {
        'PAID': 'paid',
        'OVERPAID': 'paid',
        'FAILED': 'failed',
        'CANCELLED': 'cancelled',
        'PENDING': 'pending',
        'PARTIALLY_PAID': 'pending',
        'EXPIRED': 'failed',
      };
      order.paymentStatus = statusMap[paymentData.paymentStatus] || 'pending';
      order.transactionReference = paymentData.transactionReference;
      order.paidAt = paymentData.paidOn ? new Date(paymentData.paidOn) : undefined;

      if (PaymentService.isPaymentSuccessful(paymentData.paymentStatus)) {
        order.status = 'confirmed';
      } else if (paymentData.paymentStatus === 'FAILED') {
        order.status = 'cancelled';
      }

      await order.save();
    } else if (tab) {
      // Handle tab payment
      if (PaymentService.isPaymentSuccessful(paymentData.paymentStatus)) {
        await TabService.markTabPaid(
          tab._id.toString(),
          paymentReference,
          paymentData.transactionReference
        );
      } else if (paymentData.paymentStatus === 'FAILED') {
        tab.paymentStatus = 'failed';
        tab.status = 'open'; // Reopen tab if payment failed
        await tab.save();
      }
    }

    return {
      success: true,
      data: {
        transactionReference: paymentData.transactionReference,
        paymentReference: paymentData.paymentReference,
        amountPaid: paymentData.amountPaid,
        paymentStatus: paymentData.paymentStatus,
        paymentMethod: paymentData.paymentMethod,
        paidOn: paymentData.paidOn,
      },
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      message: 'Failed to verify payment. Please try again.',
    };
  }
}

/**
 * Get order details
 */
export async function getOrder(orderId: string): Promise<{
  success: boolean;
  message?: string;
  data?: unknown;
}> {
  try {
    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      };
    }

    // Convert to plain object and serialize for client component
    const orderObj = order.toObject();
    const serializedOrder = {
      ...orderObj,
      _id: orderObj._id.toString(),
      id: orderObj._id.toString(),
      userId: orderObj.userId?.toString(),
      paymentId: orderObj.paymentId?.toString(),
      items: orderObj.items.map((item: any) => ({
        ...item,
        menuItemId: item.menuItemId.toString(),
      })),
      createdAt: orderObj.createdAt?.toISOString(),
      updatedAt: orderObj.updatedAt?.toISOString(),
      paidAt: orderObj.paidAt?.toISOString(),
      statusHistory: orderObj.statusHistory?.map((history: any) => ({
        status: history.status,
        timestamp: history.timestamp?.toISOString(),
        note: history.note,
      })),
      deliveryDetails: orderObj.deliveryDetails ? {
        ...orderObj.deliveryDetails,
        estimatedDeliveryTime: orderObj.deliveryDetails.estimatedDeliveryTime?.toISOString(),
        actualDeliveryTime: orderObj.deliveryDetails.actualDeliveryTime?.toISOString(),
      } : undefined,
      pickupDetails: orderObj.pickupDetails ? {
        ...orderObj.pickupDetails,
        preferredPickupTime: orderObj.pickupDetails.preferredPickupTime?.toISOString(),
        actualPickupTime: orderObj.pickupDetails.actualPickupTime?.toISOString(),
      } : undefined,
    };

    return {
      success: true,
      data: serializedOrder,
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return {
      success: false,
      message: 'Failed to get order details',
    };
  }
}

/**
 * Initialize payment for a tab
 */
export async function initializeTabPayment(params: {
  tabId: string;
  tipAmount?: number;
  rewardDiscount?: number;
  customerName: string;
  customerEmail: string;
  paymentMethods: PaymentMethod[];
}): Promise<PaymentInitializationResult> {
  try {
    await connectDB();

    // Prepare tab for checkout
    const { tab } = await TabService.prepareTabForCheckout(
      params.tabId,
      params.tipAmount || 0
    );

    // Apply reward discount if provided
    if (params.rewardDiscount && params.rewardDiscount > 0) {
      await TabService.applyDiscountToTab(params.tabId, params.rewardDiscount);
      // Reload tab with updated discount
      const updatedResult = await TabService.getTabById(params.tabId);
      if (updatedResult) {
        Object.assign(tab, updatedResult);
      }
    }

    if (!tab) {
      return {
        success: false,
        message: 'Tab not found',
      };
    }

    if (tab.status === 'closed') {
      return {
        success: false,
        message: 'Tab is already closed',
      };
    }

    // Generate payment reference
    const paymentReference = PaymentService.generatePaymentReference(params.tabId);

    // Initialize payment with Monnify
    const response = await PaymentService.initializePayment({
      amount: tab.total,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      paymentReference,
      paymentDescription: `Tab #${tab.tabNumber}`,
      paymentMethods: params.paymentMethods,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/tabs/${params.tabId}?payment=success`,
      metadata: {
        tabId: params.tabId,
        tableNumber: tab.tableNumber,
      },
    });

    if (!response.requestSuccessful) {
      return {
        success: false,
        message: response.responseMessage || 'Failed to initialize payment',
      };
    }

    // Update tab with payment reference
    const tabDoc = await TabModel.findById(params.tabId);
    if (tabDoc) {
      tabDoc.paymentReference = paymentReference;
      tabDoc.transactionReference = response.responseBody.transactionReference;
      tabDoc.status = 'settling';
      await tabDoc.save();
    }

    return {
      success: true,
      data: {
        transactionReference: response.responseBody.transactionReference,
        paymentReference,
        checkoutUrl: response.responseBody.checkoutUrl,
        enabledPaymentMethods: response.responseBody.enabledPaymentMethod,
      },
    };
  } catch (error) {
    console.error('Error initializing tab payment:', error);
    return {
      success: false,
      message: 'Failed to initialize tab payment. Please try again.',
    };
  }
}
