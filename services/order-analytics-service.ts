import { connectDB } from '@/lib/mongodb';
import OrderModel from '@/models/order-model';

export class OrderAnalyticsService {
  /**
   * Get today's order statistics
   */
  static async getTodayStats() {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, totalRevenue, avgOrderValue, completedOrders] = await Promise.all([
      OrderModel.countDocuments({ createdAt: { $gte: today } }),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: today }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: today }, status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$total' } } },
      ]),
      OrderModel.countDocuments({ createdAt: { $gte: today }, status: 'completed' }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgOrderValue: avgOrderValue[0]?.avg || 0,
      completedOrders,
    };
  }

  /**
   * Get orders by status for a date range
   */
  static async getOrdersByStatus(startDate: Date, endDate: Date) {
    await connectDB();

    const result = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return result.map((item) => ({
      status: item._id,
      count: item.count,
    }));
  }

  /**
   * Get orders by type for a date range
   */
  static async getOrdersByType(startDate: Date, endDate: Date) {
    await connectDB();

    const result = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$orderType',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]);

    return result.map((item) => ({
      type: item._id,
      count: item.count,
      revenue: item.revenue,
    }));
  }

  /**
   * Get revenue by day for the last N days
   */
  static async getRevenueByDay(days: number) {
    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return result.map((item) => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
    }));
  }

  /**
   * Get most popular menu items
   */
  static async getPopularItems(limit: number = 10) {
    await connectDB();

    const result = await OrderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map((item) => ({
      name: item._id,
      count: item.count,
      revenue: item.revenue,
    }));
  }

  /**
   * Get peak hours (orders by hour of day)
   */
  static async getPeakHours() {
    await connectDB();

    const result = await OrderModel.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((item) => ({
      hour: item._id,
      count: item.count,
    }));
  }

  /**
   * Get average preparation time
   */
  static async getAveragePreparationTime() {
    await connectDB();

    const result = await OrderModel.aggregate([
      {
        $match: {
          status: 'completed',
          preparationStartedAt: { $exists: true },
        },
      },
      {
        $project: {
          prepTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$preparationStartedAt'] },
              60000, // Convert to minutes
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgPrepTime: { $avg: '$prepTime' },
        },
      },
    ]);

    return result[0]?.avgPrepTime || 0;
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(startDate: Date, endDate: Date) {
    await connectDB();

    const [totalCustomers, returningCustomers] = await Promise.all([
      OrderModel.distinct('customer.email', {
        createdAt: { $gte: startDate, $lte: endDate },
        'customer.email': { $exists: true, $ne: null },
      }),
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            'customer.email': { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$customer.email',
            orderCount: { $sum: 1 },
          },
        },
        {
          $match: {
            orderCount: { $gt: 1 },
          },
        },
      ]),
    ]);

    return {
      totalCustomers: totalCustomers.length,
      returningCustomers: returningCustomers.length,
      newCustomers: totalCustomers.length - returningCustomers.length,
    };
  }
}
