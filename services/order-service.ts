import { Types } from 'mongoose';
import Order from '@/models/order-model';
import { IOrder, OrderStatus, OrderType } from '@/interfaces';
import { connectDB } from '@/lib/mongodb';

/**
 * Service for order CRUD operations
 */
export class OrderService {
  /**
   * Generate unique order number
   */
  private static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await Order.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    return `WG${year}${month}${day}${sequence}`;
  }

  /**
   * Calculate estimated wait time based on order type and current queue
   */
  private static async calculateEstimatedWaitTime(
    orderType: OrderType,
    itemCount: number
  ): Promise<number> {
    // Base preparation time per item (in minutes)
    const baseTimePerItem = 5;
    
    // Get active orders count
    const activeOrders = await Order.countDocuments({
      status: { $in: ['confirmed', 'preparing'] },
    });
    
    // Calculate base time
    let estimatedTime = itemCount * baseTimePerItem;
    
    // Add queue time (2 minutes per active order)
    estimatedTime += activeOrders * 2;
    
    // Add delivery time if applicable
    if (orderType === 'delivery') {
      estimatedTime += 30; // 30 minutes for delivery
    } else if (orderType === 'pickup') {
      estimatedTime += 5; // 5 minutes buffer for pickup
    }
    
    // Minimum wait time
    return Math.max(estimatedTime, 15);
  }

  /**
   * Create a new order
   */
  static async createOrder(orderData: {
    userId?: string;
    guestEmail?: string;
    guestName?: string;
    guestPhone?: string;
    orderType: OrderType;
    items: IOrder['items'];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
    deliveryDetails?: IOrder['deliveryDetails'];
    pickupDetails?: IOrder['pickupDetails'];
    dineInDetails?: IOrder['dineInDetails'];
    specialInstructions?: string;
  }): Promise<IOrder> {
    await connectDB();

    const orderNumber = await this.generateOrderNumber();
    const estimatedWaitTime = await this.calculateEstimatedWaitTime(
      orderData.orderType,
      orderData.items.length
    );

    const order = await Order.create({
      ...orderData,
      userId: orderData.userId ? new Types.ObjectId(orderData.userId) : undefined,
      orderNumber,
      estimatedWaitTime,
      status: 'pending',
      paymentStatus: 'pending',
    });

    return order.toObject();
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<IOrder | null> {
    await connectDB();

    if (!Types.ObjectId.isValid(orderId)) {
      return null;
    }

    const order = await Order.findById(orderId).lean();
    return order;
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
    await connectDB();

    const order = await Order.findOne({ orderNumber }).lean();
    return order;
  }

  /**
   * Get orders by user ID
   */
  static async getOrdersByUserId(
    userId: string,
    options?: {
      limit?: number;
      skip?: number;
      status?: OrderStatus;
    }
  ): Promise<{ orders: IOrder[]; total: number }> {
    await connectDB();

    if (!Types.ObjectId.isValid(userId)) {
      return { orders: [], total: 0 };
    }

    const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (options?.status) {
      query.status = options.status;
    }

    console.log('OrderService.getOrdersByUserId query:', {
      userId,
      query,
      options,
    });

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .limit(options?.limit || 10)
        .skip(options?.skip || 0)
        .lean(),
      Order.countDocuments(query),
    ]);

    console.log('OrderService.getOrdersByUserId result:', {
      ordersFound: orders.length,
      total,
      firstOrderUserId: orders[0]?.userId?.toString(),
    });

    return { orders, total };
  }

  /**
   * Get orders by guest email
   */
  static async getOrdersByGuestEmail(
    email: string,
    options?: {
      limit?: number;
      skip?: number;
    }
  ): Promise<{ orders: IOrder[]; total: number }> {
    await connectDB();

    const query = { guestEmail: email.toLowerCase() };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .limit(options?.limit || 10)
        .skip(options?.skip || 0)
        .lean(),
      Order.countDocuments(query),
    ]);

    return { orders, total };
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string
  ): Promise<IOrder | null> {
    await connectDB();

    if (!Types.ObjectId.isValid(orderId)) {
      return null;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            note,
          },
        },
      },
      { new: true }
    ).lean();

    return order;
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentData: {
      paymentStatus: IOrder['paymentStatus'];
      paymentReference?: string;
      transactionReference?: string;
      paidAt?: Date;
    }
  ): Promise<IOrder | null> {
    await connectDB();

    if (!Types.ObjectId.isValid(orderId)) {
      return null;
    }

    const updateData: Record<string, unknown> = {
      paymentStatus: paymentData.paymentStatus,
    };

    if (paymentData.paymentReference) {
      updateData.paymentReference = paymentData.paymentReference;
    }
    if (paymentData.transactionReference) {
      updateData.transactionReference = paymentData.transactionReference;
    }
    if (paymentData.paidAt) {
      updateData.paidAt = paymentData.paidAt;
    }

    // If payment is successful, update order status to confirmed
    if (paymentData.paymentStatus === 'paid') {
      updateData.status = 'confirmed';
      updateData.$push = {
        statusHistory: {
          status: 'confirmed',
          timestamp: new Date(),
          note: 'Payment confirmed',
        },
      };
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).lean();

    return order;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<IOrder | null> {
    await connectDB();

    if (!Types.ObjectId.isValid(orderId)) {
      return null;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return null;
    }

    // Only allow cancellation of pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Order cancelled by customer',
    });

    await order.save();
    return order.toObject();
  }

  /**
   * Add rating and review to completed order
   */
  static async addReview(
    orderId: string,
    rating: number,
    review?: string
  ): Promise<IOrder | null> {
    await connectDB();

    if (!Types.ObjectId.isValid(orderId)) {
      return null;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return null;
    }

    // Only allow reviews for completed orders
    if (order.status !== 'completed') {
      throw new Error('Can only review completed orders');
    }

    order.rating = rating;
    if (review) {
      order.review = review;
    }

    await order.save();
    return order.toObject();
  }

  /**
   * Get active orders (for kitchen/admin dashboard)
   */
  static async getActiveOrders(orderType?: OrderType): Promise<IOrder[]> {
    await connectDB();

    const query: Record<string, unknown> = {
      status: { $in: ['confirmed', 'preparing', 'ready', 'out-for-delivery'] },
    };

    if (orderType) {
      query.orderType = orderType;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: 1 })
      .lean();

    return orders;
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(limit: number = 10): Promise<IOrder[]> {
    await connectDB();

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return orders;
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByType: Record<OrderType, number>;
  }> {
    await connectDB();

    const dateQuery: Record<string, unknown> = {};
    if (startDate || endDate) {
      const createdAtQuery: Record<string, Date> = {};
      if (startDate) {
        createdAtQuery.$gte = startDate;
      }
      if (endDate) {
        createdAtQuery.$lte = endDate;
      }
      dateQuery.createdAt = createdAtQuery;
    }

    const [totalStats, statusStats, typeStats] = await Promise.all([
      Order.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
          },
        },
      ]),
      Order.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$orderType',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = totalStats[0] || { totalOrders: 0, totalRevenue: 0 };
    const ordersByStatus = statusStats.reduce(
      (acc, item) => {
        acc[item._id as OrderStatus] = item.count;
        return acc;
      },
      {} as Record<OrderStatus, number>
    );
    const ordersByType = typeStats.reduce(
      (acc, item) => {
        acc[item._id as OrderType] = item.count;
        return acc;
      },
      {} as Record<OrderType, number>
    );

    return {
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      averageOrderValue:
        stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0,
      ordersByStatus,
      ordersByType,
    };
  }
}
