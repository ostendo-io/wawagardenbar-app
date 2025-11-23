'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { completeTabPaymentManuallyAction } from '@/app/actions/tabs/tab-actions';
import { Loader2, CreditCard, Receipt, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdminPayTabDialogProps {
  tabId: string;
  tabNumber: string;
  tableNumber: string;
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Admin dialog for processing tab payments
 * Allows manual payment entry or full checkout process
 */
export function AdminPayTabDialog({
  tabId,
  tabNumber,
  tableNumber,
  total,
  open,
  onOpenChange,
}: AdminPayTabDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'checkout'>('manual');
  const [paymentType, setPaymentType] = useState<'cash' | 'transfer' | 'card'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleManualPayment() {
    if (!paymentReference.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a payment or transfer reference',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await completeTabPaymentManuallyAction({
        tabId,
        paymentType,
        paymentReference: paymentReference.trim(),
        comments: comments.trim(),
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Tab payment completed successfully',
        });
        setPaymentReference('');
        setComments('');
        onOpenChange(false);
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to complete payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCheckoutRedirect() {
    onOpenChange(false);
    router.push(`/dashboard/orders/tabs/${tabId}/checkout`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Tab Payment
          </DialogTitle>
          <DialogDescription>
            Complete payment for Tab #{tabNumber} (Table {tableNumber}) - Total: ₦{total.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'manual' | 'checkout')}>
              <Card className={paymentMethod === 'manual' ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="manual" id="manual" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="manual" className="cursor-pointer font-semibold">
                        Manual Payment Entry
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter payment/transfer reference for cash or bank transfer payments
                      </p>
                    </div>
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className={paymentMethod === 'checkout' ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="checkout" id="checkout" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="checkout" className="cursor-pointer font-semibold">
                        Full Checkout Process
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete checkout with payment gateway (card, transfer, USSD)
                      </p>
                    </div>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          {/* Manual Payment Form */}
          {paymentMethod === 'manual' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type *</Label>
                <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as 'cash' | 'transfer' | 'card')}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="cursor-pointer">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="cursor-pointer">Bank Transfer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="cursor-pointer">Card (POS)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">
                  {paymentType === 'cash' ? 'Receipt Number' : 'Transfer/Transaction Reference'} *
                </Label>
                <Input
                  id="reference"
                  placeholder={
                    paymentType === 'cash' 
                      ? 'Enter receipt number...' 
                      : 'Enter transfer or transaction reference...'
                  }
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Add any additional notes about this payment..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleManualPayment}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Payment & Close Tab
              </Button>
            </div>
          )}

          {/* Checkout Process */}
          {paymentMethod === 'checkout' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                You will be redirected to the checkout page where you can complete the payment process 
                with the customer using the payment gateway (card, transfer, USSD, or phone number).
              </p>
              <Button 
                className="w-full" 
                onClick={handleCheckoutRedirect}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Go to Checkout
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
