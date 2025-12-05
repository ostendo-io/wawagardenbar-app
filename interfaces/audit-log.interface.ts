import { Types } from 'mongoose';

export type AuditAction =
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.delete_request'
  | 'user.role-change'
  | 'menu.create'
  | 'menu.update'
  | 'menu.delete'
  | 'inventory.update'
  | 'order.update'
  | 'order.cancel'
  | 'reward.create'
  | 'reward.update'
  | 'reward.delete'
  | 'settings.update'
  | 'tab.manual_payment'
  | 'admin.login'
  | 'admin.logout';

export interface IAuditLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
