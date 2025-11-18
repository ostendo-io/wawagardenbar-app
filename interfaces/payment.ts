/**
 * Monnify Payment Interfaces
 * Based on: https://developers.monnify.com/docs/collections/one-time-payment
 */

export type PaymentMethod = 'CARD' | 'ACCOUNT_TRANSFER' | 'USSD' | 'PHONE_NUMBER';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'OVERPAID' 
  | 'PARTIALLY_PAID' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export interface MonnifyInitializePaymentRequest {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  currencyCode?: string;
  contractCode?: string;
  redirectUrl?: string;
  paymentMethods?: PaymentMethod[];
  incomeSplitConfig?: IncomeSplitConfig[];
  metadata?: Record<string, unknown>;
}

export interface IncomeSplitConfig {
  subAccountCode: string;
  feePercentage?: number;
  splitAmount?: number;
  feeBearer?: boolean;
}

export interface MonnifyInitializePaymentResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    merchantName: string;
    apiKey: string;
    enabledPaymentMethod: PaymentMethod[];
    checkoutUrl: string;
  };
}

export interface MonnifyPaymentStatusResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    amountPaid: number;
    totalPayable: number;
    settlementAmount: number;
    paidOn: string;
    paymentStatus: PaymentStatus;
    paymentDescription: string;
    currency: string;
    paymentMethod: PaymentMethod;
    product: {
      type: string;
      reference: string;
    };
    cardDetails?: {
      cardType: string;
      last4: string;
      bin: string;
      expiryMonth: string;
      expiryYear: string;
    };
    accountDetails?: {
      accountName: string;
      accountNumber: string;
      bankCode: string;
      amountPaid: number;
    };
    accountPayments?: Array<{
      accountName: string;
      accountNumber: string;
      bankCode: string;
      bankName: string;
      amountPaid: number;
      paidOn: string;
    }>;
    customer: {
      email: string;
      name: string;
    };
    metaData?: Record<string, unknown>;
  };
}

export interface MonnifyWebhookPayload {
  transactionReference: string;
  paymentReference: string;
  amountPaid: string;
  totalPayable: string;
  settlementAmount: string;
  paidOn: string;
  paymentStatus: PaymentStatus;
  paymentDescription: string;
  transactionHash: string;
  currency: string;
  paymentMethod: PaymentMethod;
  product: {
    type: string;
    reference: string;
  };
  cardDetails?: {
    cardType: string;
    last4: string;
    bin: string;
  };
  accountDetails?: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    amountPaid: string;
  };
  accountPayments?: Array<{
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    amountPaid: string;
    paidOn: string;
  }>;
  customer: {
    email: string;
    name: string;
  };
  metaData?: Record<string, unknown>;
}

export interface PaymentInitializationResult {
  success: boolean;
  message?: string;
  data?: {
    transactionReference: string;
    paymentReference: string;
    checkoutUrl: string;
    enabledPaymentMethods: PaymentMethod[];
  };
}

export interface PaymentVerificationResult {
  success: boolean;
  message?: string;
  data?: {
    transactionReference: string;
    paymentReference: string;
    amountPaid: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paidOn: string;
  };
}
