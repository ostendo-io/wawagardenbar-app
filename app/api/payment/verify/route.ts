import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/app/actions/payment/payment-actions';

/**
 * API endpoint to verify payment status
 * POST /api/payment/verify
 */
export async function POST(request: NextRequest) {
  try {
    const { paymentReference } = await request.json();

    if (!paymentReference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const result = await verifyPayment(paymentReference);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in verify payment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
