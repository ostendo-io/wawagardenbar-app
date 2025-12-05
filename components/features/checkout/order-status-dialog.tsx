'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'success' | 'error';
  title: string;
  message: string;
  redirectUrl?: string;
  redirectLabel?: string;
}

/**
 * Dialog to display order creation success or failure status
 */
export function OrderStatusDialog({
  open,
  onOpenChange,
  status,
  title,
  message,
  redirectUrl,
  redirectLabel = 'View Order',
}: OrderStatusDialogProps) {
  const router = useRouter();
  const { clearCart } = useCartStore();

  function handleRedirect() {
    // Clear cart before navigating to order/tab page
    if (status === 'success') {
      clearCart();
    }
    // Don't close the dialog - let the navigation handle unmounting
    // This prevents the parent's onOpenChange from triggering a redirect to /menu
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }

  function handleClose() {
    // Clear cart before navigating to menu
    if (status === 'success') {
      clearCart();
      router.push('/menu');
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">
            {status === 'success' ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {status === 'success' && redirectUrl && (
            <Button onClick={handleRedirect} className="w-full">
              {redirectLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button
            variant={status === 'success' ? 'outline' : 'default'}
            onClick={handleClose}
            className="w-full"
          >
            {status === 'success' ? 'Continue Shopping' : 'Try Again'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
