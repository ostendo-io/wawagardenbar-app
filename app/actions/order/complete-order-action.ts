'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { revalidatePath } from 'next/cache';
import { sessionOptions, SessionData } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import OrderModel from '@/models/order-model';
import { InventoryService } from '@/services';
import { AuditLogService } from '@/services/audit-log-service';

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Complete order and deduct inventory
 * This action should be called when order status changes to 'completed'
 */
export async function completeOrderAndDeductStockAction(
  orderId: string
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    // Allow both admin and system to complete orders
    if (!session.userId && !session.isLoggedIn) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    // Get order
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Check if already completed
    if (order.status === 'completed') {
      return {
        success: true,
        message: 'Order already completed',
        data: { inventoryDeducted: order.inventoryDeducted },
      };
    }

    // Update order status to completed
    const previousStatus = order.status;
    order.status = 'completed';

    // Add to status history
    order.statusHistory.push({
      status: 'completed',
      timestamp: new Date(),
      note: session.role ? `Completed by ${session.role}` : 'Completed',
    });

    // Deduct inventory if not already done
    if (!order.inventoryDeducted) {
      try {
        await InventoryService.deductStockForOrder(orderId);

        order.inventoryDeducted = true;
        order.inventoryDeductedAt = new Date();
        order.inventoryDeductedBy = session.userId
          ? session.userId as any
          : undefined;
      } catch (error) {
        console.error('Error deducting inventory:', error);
        // Continue with order completion even if inventory deduction fails
        // This prevents blocking order completion due to inventory issues
      }
    }

    await order.save();

    // Create audit log
    if (session.userId && session.role) {
      await AuditLogService.createLog({
        userId: session.userId,
        userEmail: session.email || '',
        userRole: session.role,
        action: 'order.update',
        resource: 'order',
        resourceId: orderId,
        details: {
          previousStatus,
          newStatus: 'completed',
          inventoryDeducted: order.inventoryDeducted,
        },
      });
    }

    revalidatePath('/dashboard/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/dashboard/inventory');

    return {
      success: true,
      message: 'Order completed successfully',
      data: {
        orderId: order._id.toString(),
        inventoryDeducted: order.inventoryDeducted,
      },
    };
  } catch (error) {
    console.error('Error completing order:', error);
    return {
      success: false,
      error: 'Failed to complete order',
    };
  }
}

/**
 * Update order status with optional inventory deduction
 * Generic action for updating order status
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  note?: string
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.userId || !session.role || !['admin', 'super-admin'].includes(session.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const previousStatus = order.status;
    order.status = newStatus as any;

    // Add to status history
    order.statusHistory.push({
      status: newStatus as any,
      timestamp: new Date(),
      note: note || `Updated by ${session.role}`,
    });

    // If status is being set to completed, deduct inventory
    if (newStatus === 'completed' && !order.inventoryDeducted) {
      try {
        await InventoryService.deductStockForOrder(orderId);

        order.inventoryDeducted = true;
        order.inventoryDeductedAt = new Date();
        order.inventoryDeductedBy = session.userId as any;
      } catch (error) {
        console.error('Error deducting inventory:', error);
        // Continue with status update even if inventory deduction fails
      }
    }

    await order.save();

    // Create audit log
    await AuditLogService.createLog({
      userId: session.userId,
      userEmail: session.email || '',
      userRole: session.role,
      action: 'order.update',
      resource: 'order',
      resourceId: orderId,
      details: {
        previousStatus,
        newStatus,
        note,
        inventoryDeducted: order.inventoryDeducted,
      },
    });

    revalidatePath('/dashboard/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/dashboard/inventory');

    return {
      success: true,
      message: `Order status updated to ${newStatus}`,
      data: {
        orderId: order._id.toString(),
        status: order.status,
        inventoryDeducted: order.inventoryDeducted,
      },
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: 'Failed to update order status',
    };
  }
}
