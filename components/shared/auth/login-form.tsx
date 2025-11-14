'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendPinAction, verifyPinAction } from '@/app/actions/auth';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const pinSchema = z.object({
  pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PinFormData = z.infer<typeof pinSchema>;

interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export function LoginForm({ redirectTo = '/', onSuccess }: LoginFormProps) {
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const pinForm = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: '',
    },
  });

  async function handleEmailSubmit(data: EmailFormData) {
    setIsLoading(true);
    try {
      const result = await sendPinAction(data.email);
      
      if (result.success) {
        setEmail(data.email);
        setStep('pin');
        toast({
          title: 'PIN Sent',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePinSubmit(data: PinFormData) {
    setIsLoading(true);
    try {
      const result = await verifyPinAction(email, data.pin);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendPin() {
    setIsLoading(true);
    try {
      const result = await sendPinAction(email);
      
      if (result.success) {
        toast({
          title: 'PIN Resent',
          description: 'A new PIN has been sent to your email.',
        });
        pinForm.reset();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend PIN. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 'email') {
    return (
      <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...emailForm.register('email')}
            disabled={isLoading}
          />
          {emailForm.formState.errors.email && (
            <p className="text-sm text-red-500">
              {emailForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          We'll send a 4-digit PIN to your email
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={pinForm.handleSubmit(handlePinSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pin">Verification PIN</Label>
        <Input
          id="pin"
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="0000"
          className="text-center text-2xl tracking-widest"
          {...pinForm.register('pin')}
          disabled={isLoading}
          autoFocus
        />
        {pinForm.formState.errors.pin && (
          <p className="text-sm text-red-500">
            {pinForm.formState.errors.pin.message}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Enter the 4-digit PIN sent to {email}
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify & Login
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          Change email
        </button>
        <button
          type="button"
          onClick={handleResendPin}
          className="text-primary hover:underline"
          disabled={isLoading}
        >
          Resend PIN
        </button>
      </div>
    </form>
  );
}
