'use client';

import { useCartStore } from '@/stores/cart-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface OrderSummaryProps {
  orderType: 'dine-in' | 'pickup' | 'delivery';
}

export function OrderSummary({ orderType }: OrderSummaryProps) {
  const { items, getTotalPrice, getTotalItems } = useCartStore();

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();

  // Calculate fees
  let deliveryFee = 0;
  if (orderType === 'delivery') {
    deliveryFee = subtotal >= 2000 ? 500 : 1000;
  }

  const serviceFee = Math.round(subtotal * 0.02);
  const total = subtotal + deliveryFee + serviceFee;

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <ScrollArea className="max-h-64">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">
                    {item.quantity}x {formatPrice(item.price)}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-xs text-muted-foreground italic mt-1">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items ({totalItems})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {orderType === 'delivery' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service Fee (2%)</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        {/* Free Delivery Badge */}
        {orderType === 'delivery' && subtotal >= 2000 && (
          <Badge variant="secondary" className="w-full justify-center">
            🎉 Free Delivery!
          </Badge>
        )}

        {/* Minimum Order Warning */}
        {orderType === 'delivery' && subtotal < 2000 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900 dark:bg-yellow-950">
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              Add {formatPrice(2000 - subtotal)} more for free delivery
            </p>
          </div>
        )}

        {orderType === 'pickup' && subtotal < 1000 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900 dark:bg-yellow-950">
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              Minimum order: {formatPrice(1000)}
            </p>
            <p className="text-yellow-800 dark:text-yellow-200">
              Add {formatPrice(1000 - subtotal)} more
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
