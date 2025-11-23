import { Types } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import TabModel from '@/models/tab-model';
import OrderModel from '@/models/order-model';
import { ITab, IOrder } from '@/interfaces';
import SettingsService from './settings-service';

/**
 * Tab Service
 * Handles all tab-related business logic for dine-in orders
 */
export class TabService {
  /**
   * Generate a unique tab number
   */
  private static generateTabNumber(tableNumber: string): string {
    const timestamp = Date.now().toString().slice(-6);
    return `TAB-${tableNumber}-${timestamp}`;
  }

  /**
   * Create a new tab
   */
  static async createTab(params: {
    tableNumber: string;
    userId?: string;
    openedByStaffId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }): Promise<ITab> {
    await connectDB();

    const tabNumber = this.generateTabNumber(params.tableNumber);

    const tab = await TabModel.create({
      tabNumber,
      tableNumber: params.tableNumber,
      userId: params.userId ? new Types.ObjectId(params.userId) : undefined,
      openedByStaffId: params.openedByStaffId
        ? new Types.ObjectId(params.openedByStaffId)
        : undefined,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      status: 'open',
      orders: [],
      subtotal: 0,
      serviceFee: 0,
      tax: 0,
      deliveryFee: 0,
      discountTotal: 0,
      tipAmount: 0,
      total: 0,
      paymentStatus: 'pending',
      openedAt: new Date(),
    });

    return JSON.parse(JSON.stringify(tab.toObject()));
  }

  /**
   * Get open tab for a user
   */
  static async getOpenTabForUser(userId: string): Promise<ITab | null> {
    await connectDB();

    const tab = await TabModel.findOne({
      userId: new Types.ObjectId(userId),
      status: 'open',
    })
      .populate('orders')
      .lean();

    return tab ? JSON.parse(JSON.stringify(tab)) : null;
  }

  /**
   * Get open tab for a table
   */
  static async getOpenTabForTable(tableNumber: string): Promise<ITab | null> {
    await connectDB();

    const tab = await TabModel.findOne({
      tableNumber,
      status: 'open',
    })
      .populate('orders')
      .lean();

    return tab ? JSON.parse(JSON.stringify(tab)) : null;
  }

  /**
   * Get tab by ID
   */
  static async getTabById(tabId: string): Promise<ITab | null> {
    await connectDB();

    const tab = await TabModel.findById(tabId).populate('orders').lean();

    return tab ? JSON.parse(JSON.stringify(tab)) : null;
  }

  /**
   * Add order to tab and recalculate totals
   */
  static async addOrderToTab(tabId: string, orderId: string): Promise<ITab> {
    await connectDB();

    const tab = await TabModel.findById(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    if (tab.status !== 'open') {
      throw new Error('Cannot add orders to a closed tab');
    }

    // Add order to tab
    if (!tab.orders.includes(new Types.ObjectId(orderId))) {
      tab.orders.push(new Types.ObjectId(orderId));
      await tab.save();
    }

    // Recalculate tab totals
    await this.recalculateTabTotals(tabId);

    // Get and return the updated tab
    const updatedTab = await TabModel.findById(tabId).lean();
    return JSON.parse(JSON.stringify(updatedTab));
  }

  /**
   * Recalculate tab totals based on all orders
   */
  static async recalculateTabTotals(tabId: string): Promise<ITab> {
    await connectDB();

    const tab = await TabModel.findById(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    // Get all orders for this tab (both from orders array and by tabId)
    const orders = await OrderModel.find({
      $or: [
        { _id: { $in: tab.orders } },
        { tabId: new Types.ObjectId(tabId) }
      ]
    }).lean();

    // Calculate subtotal from all orders
    const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);

    // Calculate fees using SettingsService (dine-in type)
    const totals = await SettingsService.calculateOrderTotals(
      subtotal,
      'dine-in'
    );

    // Update tab with calculated values
    tab.subtotal = subtotal;
    tab.serviceFee = totals.serviceFee;
    tab.tax = totals.tax;
    tab.deliveryFee = 0; // Always 0 for dine-in

    // Calculate total (subtotal + fees - discounts + tip)
    tab.total =
      tab.subtotal +
      tab.serviceFee +
      tab.tax -
      tab.discountTotal +
      tab.tipAmount;

    await tab.save();

    return JSON.parse(JSON.stringify(tab.toObject()));
  }

  /**
   * Prepare tab for checkout (calculate totals with rewards)
   */
  static async prepareTabForCheckout(
    tabId: string,
    tipAmount: number = 0
  ): Promise<{
    tab: ITab;
    eligibleRewards: any[];
  }> {
    await connectDB();

    const tab = await TabModel.findById(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    if (tab.status === 'closed') {
      throw new Error('Tab is already closed');
    }

    // Update tip amount
    tab.tipAmount = tipAmount;

    // Recalculate totals
    await this.recalculateTabTotals(tabId);

    // Get updated tab
    const updatedTab = await TabModel.findById(tabId).lean();

    // TODO: Get eligible rewards based on tab subtotal
    // This will be implemented when rewards service is extended
    const eligibleRewards: any[] = [];

    return JSON.parse(JSON.stringify({
      tab: updatedTab!,
      eligibleRewards,
    }));
  }

  /**
   * Apply discount to tab (from rewards)
   */
  static async applyDiscountToTab(
    tabId: string,
    discountAmount: number
  ): Promise<ITab> {
    await connectDB();

    const tab = await TabModel.findById(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    tab.discountTotal += discountAmount;

    // Recalculate total
    tab.total =
      tab.subtotal +
      tab.serviceFee +
      tab.tax -
      tab.discountTotal +
      tab.tipAmount;

    await tab.save();

    return JSON.parse(JSON.stringify(tab.toObject()));
  }

  /**
   * Mark tab as paid
   */
  static async markTabPaid(
    tabId: string,
    paymentReference: string,
    transactionReference: string
  ): Promise<ITab> {
    await connectDB();

    const tab = await TabModel.findById(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    tab.status = 'closed';
    tab.paymentStatus = 'paid';
    tab.paymentReference = paymentReference;
    tab.transactionReference = transactionReference;
    tab.paidAt = new Date();
    tab.closedAt = new Date();

    await tab.save();

    // Update all orders in the tab to paid status
    await OrderModel.updateMany(
      { _id: { $in: tab.orders } },
      {
        $set: {
          paymentStatus: 'paid',
          paidAt: new Date(),
          status: 'confirmed',
        },
      }
    );

    return JSON.parse(JSON.stringify(tab.toObject()));
  }

  /**
   * List all open tabs (for dashboard)
   */
  static async listOpenTabs(filters?: {
    tableNumber?: string;
    userId?: string;
    openedByStaffId?: string;
  }): Promise<ITab[]> {
    await connectDB();

    const query: any = { status: 'open' };

    if (filters?.tableNumber) {
      query.tableNumber = filters.tableNumber;
    }
    if (filters?.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }
    if (filters?.openedByStaffId) {
      query.openedByStaffId = new Types.ObjectId(filters.openedByStaffId);
    }

    const tabs = await TabModel.find(query)
      .sort({ openedAt: -1 })
      .lean();

    // Ensure complete serialization to prevent client component errors
    return JSON.parse(JSON.stringify(tabs));
  }

  /**
   * List all tabs for a user (regardless of status)
   */
  static async listAllTabsForUser(userId: string): Promise<ITab[]> {
    await connectDB();

    const tabs = await TabModel.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ openedAt: -1 })
      .lean();

    // Ensure complete serialization to prevent client component errors
    return JSON.parse(JSON.stringify(tabs));
  }

  /**
   * Get tab details with populated orders
   */
  static async getTabDetails(tabId: string): Promise<{
    tab: ITab;
    orders: IOrder[];
  }> {
    await connectDB();

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(tabId)) {
      throw new Error('Invalid tab ID format');
    }

    let tab = await TabModel.findById(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    // Get orders either from the orders array OR by tabId
    // This handles both old orders (with tabId but not in array) and new orders (in array)
    const orders = await OrderModel.find({
      $or: [
        { _id: { $in: tab.orders } },
        { tabId: new Types.ObjectId(tabId) }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    // Sync orders array if needed (for legacy data)
    const orderIds = orders.map(o => o._id.toString());
    const tabOrderIds = tab.orders.map(o => o.toString());
    const needsSync = orderIds.some(id => !tabOrderIds.includes(id));
    
    if (needsSync) {
      tab.orders = orders.map(o => new Types.ObjectId(o._id.toString()));
      await tab.save();
      // Recalculate totals with the synced orders
      await this.recalculateTabTotals(tabId);
      // Fetch updated tab
      tab = await TabModel.findById(tabId);
    }

    // Ensure complete serialization to prevent client component errors
    const result = {
      tab: tab!.toObject(),
      orders,
    };
    
    return JSON.parse(JSON.stringify(result));
  }

  /**
   * Close tab without payment (cancel)
   */
  static async closeTab(tabId: string): Promise<ITab> {
    await connectDB();

    const tab = await TabModel.findById(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    tab.status = 'closed';
    tab.closedAt = new Date();

    await tab.save();

    return JSON.parse(JSON.stringify(tab.toObject()));
  }
}
