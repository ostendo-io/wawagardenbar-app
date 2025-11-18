import crypto from 'crypto';
import {
  MonnifyInitializePaymentRequest,
  MonnifyInitializePaymentResponse,
  MonnifyPaymentStatusResponse,
  PaymentMethod,
  PaymentStatus,
} from '@/interfaces/payment';

/**
 * PaymentService for Monnify API integration
 * Documentation: https://developers.monnify.com/docs/collections/one-time-payment
 */
export class PaymentService {
  private static readonly BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';
  private static readonly API_KEY = process.env.MONNIFY_API_KEY!;
  private static readonly SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;
  private static readonly CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE!;

  /**
   * Get authentication token from Monnify
   */
  private static async getAuthToken(): Promise<string> {
    const credentials = Buffer.from(`${this.API_KEY}:${this.SECRET_KEY}`).toString('base64');

    const response = await fetch(`${this.BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Monnify');
    }

    const data = await response.json();
    return data.responseBody.accessToken;
  }

  /**
   * Initialize a payment transaction
   */
  static async initializePayment(
    params: Omit<MonnifyInitializePaymentRequest, 'contractCode'>
  ): Promise<MonnifyInitializePaymentResponse> {
    const token = await this.getAuthToken();

    const payload: MonnifyInitializePaymentRequest = {
      ...params,
      contractCode: this.CONTRACT_CODE,
      currencyCode: params.currencyCode || 'NGN',
    };

    const response = await fetch(`${this.BASE_URL}/api/v1/merchant/transactions/init-transaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.responseMessage || 'Failed to initialize payment');
    }

    return response.json();
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(paymentReference: string): Promise<MonnifyPaymentStatusResponse> {
    const token = await this.getAuthToken();

    const response = await fetch(
      `${this.BASE_URL}/api/v2/transactions/${encodeURIComponent(paymentReference)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.responseMessage || 'Failed to verify payment');
    }

    return response.json();
  }

  /**
   * Generate payment reference
   */
  static generatePaymentReference(orderId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WAWA-${orderId}-${timestamp}-${random}`;
  }

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.SECRET_KEY)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Check if payment is successful
   */
  static isPaymentSuccessful(status: PaymentStatus): boolean {
    return status === 'PAID' || status === 'OVERPAID';
  }

  /**
   * Get payment method display name
   */
  static getPaymentMethodName(method: PaymentMethod): string {
    const names: Record<PaymentMethod, string> = {
      CARD: 'Card Payment',
      ACCOUNT_TRANSFER: 'Bank Transfer',
      USSD: 'USSD',
      PHONE_NUMBER: 'Phone Number',
    };
    return names[method];
  }

  /**
   * Get payment method instructions
   */
  static getPaymentMethodInstructions(method: PaymentMethod): string {
    const instructions: Record<PaymentMethod, string> = {
      CARD: 'Pay securely with your debit or credit card',
      ACCOUNT_TRANSFER: 'Transfer from your bank account to the provided account details',
      USSD: 'Dial the USSD code from your mobile phone to complete payment',
      PHONE_NUMBER: 'Enter your phone number to receive payment instructions',
    };
    return instructions[method];
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate payment fees (if applicable)
   */
  static calculatePaymentFee(amount: number, method: PaymentMethod): number {
    // Monnify typically charges fees, but this depends on your agreement
    // Adjust based on your actual fee structure
    const feeRates: Record<PaymentMethod, number> = {
      CARD: 0.015, // 1.5%
      ACCOUNT_TRANSFER: 0.01, // 1%
      USSD: 0.01, // 1%
      PHONE_NUMBER: 0.01, // 1%
    };

    const fee = amount * feeRates[method];
    const maxFee = 2000; // Cap at ₦2,000

    return Math.min(Math.round(fee), maxFee);
  }
}
