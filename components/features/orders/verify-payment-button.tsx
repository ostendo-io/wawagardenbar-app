'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { verifyPayment } from '@/app/actions/payment/payment-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface VerifyPaymentButtonProps {
  paymentReference: string;
}

/**
 * Button to manually verify payment status
 */
export function VerifyPaymentButton({ paymentReference }: VerifyPaymentButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  async function handleVerify() {
    setIsVerifying(true);
    
    try {
      const result = await verifyPayment(paymentReference);
      
      if (result.success) {
        toast.success('Payment verified successfully!');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('An error occurred while verifying payment');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVerify}
      disabled={isVerifying}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
      {isVerifying ? 'Verifying...' : 'Verify Payment'}
    </Button>
  );
}
