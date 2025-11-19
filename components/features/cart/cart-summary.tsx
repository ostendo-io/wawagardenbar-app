'use client';

import { useCartStore } from '@/stores/cart-store';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface CartSummaryProps {
  orderType?: 'dine-in' | 'pickup' | 'delivery';
  showFees?: boolean;
}

export function CartSummary({ orderType = 'dine-in', showFees = false }: CartSummaryProps) {
  const { getTotalPrice, getTotalItems } = useCartStore();

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();

  // Calculate fees
  // Note: This component uses hardcoded fees for immediate display
  // For accurate fees, use the fee calculator or settings API
  // TODO: Replace with real-time fee calculation from settings
  let deliveryFee = 0;
  let serviceFee = 0;
  let tax = 0;

  if (orderType) {
    if (orderType === 'delivery') {
      deliveryFee = subtotal >= 2000 ? 500 : 1000;
    }
    serviceFee = Math.round(subtotal * 0.02);
    // Tax calculation would go here if enabled
  }

  const total = subtotal + deliveryFee + serviceFee + tax;

  // Minimum order requirements
  const minimumOrders = {
    'dine-in': 0,
    pickup: 1000,
    delivery: 2000,
  };

  const minimum = minimumOrders[orderType];
  const meetsMinimum = subtotal >= minimum;
  const remaining = minimum - subtotal;

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="space-y-3">
      {/* Item Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Items</span>
        <span className="font-medium">{totalItems}</span>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-semibold">{formatPrice(subtotal)}</span>
      </div>

      {showFees && (
        <>
          {/* Delivery Fee */}
          {orderType === 'delivery' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
          )}

          {/* Service Fee */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Service Fee (2%)</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>
        </>
      )}

      {/* Minimum Order Warning */}
      {!meetsMinimum && minimum > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Minimum Order Not Met
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Add {formatPrice(remaining)} more to meet the minimum order of{' '}
                {formatPrice(minimum)} for {orderType}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Free Delivery Badge */}
      {orderType === 'delivery' && subtotal >= 2000 && showFees && (
        <Badge variant="secondary" className="w-full justify-center">
          🎉 Free Delivery Unlocked!
        </Badge>
      )}
    </div>
  );
}
