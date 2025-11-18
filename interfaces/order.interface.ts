import { Types } from 'mongoose';

export type OrderType = 'dine-in' | 'pickup' | 'delivery';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  customizations: {
    name: string;
    option: string;
    price: number;
  }[];
  specialInstructions?: string;
  subtotal: number;
}

export interface IDeliveryDetails {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryInstructions?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
}

export interface IPickupDetails {
  preferredPickupTime: Date;
  actualPickupTime?: Date;
}

export interface IDineInDetails {
  tableNumber: string;
  qrCodeScanned: boolean;
}

export interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  userId?: Types.ObjectId;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  orderType: OrderType;
  status: OrderStatus;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentId?: Types.ObjectId;
  paymentReference?: string;
  transactionReference?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paidAt?: Date;
  deliveryDetails?: IDeliveryDetails;
  pickupDetails?: IPickupDetails;
  dineInDetails?: IDineInDetails;
  specialInstructions?: string;
  estimatedWaitTime: number;
  actualWaitTime?: number;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }[];
  rating?: number;
  review?: string;
  inventoryDeducted: boolean;
  inventoryDeductedAt?: Date;
  inventoryDeductedBy?: Types.ObjectId;
  estimatedCompletionTime?: Date;
  preparationStartedAt?: Date;
  kitchenPriority?: 'normal' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}
