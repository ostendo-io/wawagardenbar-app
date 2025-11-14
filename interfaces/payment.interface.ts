import { Types } from 'mongoose';

export type PaymentMethod = 'card' | 'transfer' | 'ussd' | 'phone';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially-refunded';

export interface IMonnifyResponse {
  transactionReference: string;
  paymentReference: string;
  amountPaid: number;
  totalPayable: number;
  settlementAmount: number;
  paidOn: string;
  paymentStatus: string;
  paymentDescription: string;
  currency: string;
  paymentMethod: string;
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
    bankName: string;
  };
}

export interface IPayment {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId?: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentReference: string;
  transactionReference?: string;
  monnifyResponse?: IMonnifyResponse;
  webhookData?: Record<string, unknown>;
  failureReason?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  paidAt?: Date;
  metadata: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
