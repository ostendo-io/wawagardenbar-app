'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatusAction } from '@/app/actions/admin/order-management-actions';
import {
  Clock,
  User,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: any;
  isSelected?: boolean;
  onSelect?: (orderId: string) => void;
  showCheckbox?: boolean;
}

/**
 * Order card component
 * Displays individual order with status and actions
 */
export function OrderCard({ order, isSelected, onSelect, showCheckbox }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-cyan-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'preparing':
        return 'default';
      case 'ready':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dine-in':
        return '🍽️';
      case 'pickup':
        return '🛍️';
      case 'delivery':
        return '🚚';
      default:
        return '📦';
    }
  };

  async function handleStatusUpdate(newStatus: string) {
    setIsUpdating(true);
    try {
      const result = await updateOrderStatusAction(order._id, newStatus);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const canTransitionTo = (currentStatus: string, newStatus: string) => {
    const transitions: Record<string, string[]> = {
      pending: ['preparing', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    return transitions[currentStatus]?.includes(newStatus);
  };

  return (
    <Card className={`relative ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {showCheckbox && (
        <div className="absolute top-4 left-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect?.(order._id)}
          />
        </div>
      )}

      <CardHeader className={showCheckbox ? 'pl-12' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
            <div>
              <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{getTypeIcon(order.orderType)}</span>
                <span className="capitalize">{order.orderType}</span>
                {order.tableNumber && (
                  <>
                    <span>•</span>
                    <span>Table {order.tableNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
              {order.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order._id}`)}>
                  View Details
                </DropdownMenuItem>
                {canTransitionTo(order.status, 'preparing') && (
                  <DropdownMenuItem onClick={() => handleStatusUpdate('preparing')}>
                    Mark as Preparing
                  </DropdownMenuItem>
                )}
                {canTransitionTo(order.status, 'ready') && (
                  <DropdownMenuItem onClick={() => handleStatusUpdate('ready')}>
                    Mark as Ready
                  </DropdownMenuItem>
                )}
                {canTransitionTo(order.status, 'completed') && (
                  <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>
                    Mark as Completed
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className={showCheckbox ? 'pl-12' : ''}>
        {/* Customer Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{order.customer.name}</span>
          </div>
          {order.customer.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{order.customer.phone}</span>
            </div>
          )}
          {order.customer.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{order.customer.email}</span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="space-y-1 mb-4">
          {order.items.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{item.quantity}x</span> {item.name}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-sm text-muted-foreground">
              +{order.items.length - 3} more items
            </div>
          )}
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="mb-4 p-2 bg-muted rounded text-sm">
            <span className="font-medium">Note:</span> {order.specialInstructions}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
          </div>
          <div className="text-lg font-bold">₦{order.total.toLocaleString()}</div>
        </div>

        {/* Quick Actions */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="flex gap-2 mt-4">
            {(order.status === 'pending' || order.status === 'confirmed') && canTransitionTo(order.status, 'preparing') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate('preparing')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Start Preparing'
                )}
              </Button>
            )}
            {canTransitionTo(order.status, 'ready') && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate('ready')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Ready
                  </>
                )}
              </Button>
            )}
            {canTransitionTo(order.status, 'completed') && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
