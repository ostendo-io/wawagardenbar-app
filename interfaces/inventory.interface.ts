import { Types } from 'mongoose';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface IStockHistory {
  quantity: number;
  type: 'addition' | 'deduction' | 'adjustment';
  reason: string;
  performedBy: Types.ObjectId;
  timestamp: Date;
}

export interface IInventory {
  _id: Types.ObjectId;
  menuItemId: Types.ObjectId;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  status: StockStatus;
  lastRestocked?: Date;
  stockHistory: IStockHistory[];
  autoReorderEnabled: boolean;
  reorderQuantity: number;
  supplier?: string;
  costPerUnit: number;
  createdAt: Date;
  updatedAt: Date;
}
