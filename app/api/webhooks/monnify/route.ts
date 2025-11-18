import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/order-model';
import { PaymentService } from '@/services/payment-service';
import { MonnifyWebhookPayload } from '@/interfaces/payment';

/**
 * Monnify Webhook Handler
 * Receives payment notifications from Monnify
 * Documentation: https://developers.monnify.com/docs/collections/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('monnify-signature') || '';

    // Verify webhook signature
    if (!PaymentService.validateWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const webhookData = JSON.parse(rawBody);
    
    // Monnify sends data in eventData wrapper
    const payload: MonnifyWebhookPayload = webhookData.eventData || webhookData;

    console.log('Monnify webhook received:', {
      eventType: webhookData.eventType,
      paymentReference: payload.paymentReference,
      status: payload.paymentStatus,
      amount: payload.amountPaid,
    });

    // Connect to database
    await connectDB();

    // Find order by payment reference
    const order = await Order.findOne({
      paymentReference: payload.paymentReference,
    });

    if (!order) {
      console.error('Order not found for payment reference:', payload.paymentReference);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Map Monnify status to order status
    const statusMap: Record<string, 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'> = {
      'PAID': 'paid',
      'OVERPAID': 'paid',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled',
      'PENDING': 'pending',
      'PARTIALLY_PAID': 'pending',
      'EXPIRED': 'failed',
    };

    // Update order with payment information
    order.paymentStatus = statusMap[payload.paymentStatus] || 'pending';
    order.transactionReference = payload.transactionReference;
    order.paidAt = payload.paidOn ? new Date(payload.paidOn) : undefined;

    // Update order status based on payment
    if (PaymentService.isPaymentSuccessful(payload.paymentStatus)) {
      order.status = 'confirmed';
      
      // Add to status history
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: `Payment confirmed via ${PaymentService.getPaymentMethodName(payload.paymentMethod)}`,
      });

      console.log('Order confirmed:', order._id);
    } else if (payload.paymentStatus === 'FAILED') {
      order.status = 'cancelled';
      
      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        note: 'Payment failed',
      });

      console.log('Order cancelled due to payment failure:', order._id);
    }

    await order.save();

    // TODO: Send confirmation email/SMS to customer
    // TODO: Notify kitchen/admin of new order
    // TODO: Update inventory if needed

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Error processing Monnify webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Monnify webhook endpoint is active',
  });
}
