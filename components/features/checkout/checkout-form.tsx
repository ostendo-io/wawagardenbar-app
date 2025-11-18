'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CustomerInfoStep } from './customer-info-step';
import { OrderDetailsStep } from './order-details-step';
import { PaymentMethodStep } from './payment-method-step';
import { OrderSummary } from './order-summary';
import { createOrder, initializePayment } from '@/app/actions/payment/payment-actions';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const checkoutSchema = z.object({
  // Customer Info
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  
  // Order Details (conditional based on order type)
  orderType: z.enum(['dine-in', 'pickup', 'delivery']),
  tableNumber: z.string().optional(),
  pickupTime: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryLandmark: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // Payment
  paymentMethod: z.enum(['CARD', 'ACCOUNT_TRANSFER', 'USSD', 'PHONE_NUMBER'], {
    required_error: 'Please select a payment method',
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const steps = [
  { id: 1, name: 'Customer Info', description: 'Your contact details' },
  { id: 2, name: 'Order Details', description: 'Delivery or pickup info' },
  { id: 3, name: 'Payment', description: 'Choose payment method' },
];

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      orderType: 'dine-in',
      tableNumber: '',
      pickupTime: '',
      deliveryAddress: '',
      deliveryLandmark: '',
      deliveryInstructions: '',
      specialInstructions: '',
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/menu');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  async function onSubmit(data: CheckoutFormData) {
    setIsSubmitting(true);

    try {
      // Step 1: Create order
      const orderResult = await createOrder({
        orderType: data.orderType,
        items,
        customerInfo: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
        deliveryInfo: data.orderType === 'delivery' ? {
          address: data.deliveryAddress || '',
          landmark: data.deliveryLandmark,
          instructions: data.deliveryInstructions,
        } : undefined,
        pickupTime: data.pickupTime,
        tableNumber: data.tableNumber,
        specialInstructions: data.specialInstructions,
      });

      if (!orderResult.success || !orderResult.data) {
        toast({
          title: 'Error',
          description: orderResult.message || 'Failed to create order',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const { orderId } = orderResult.data;

      // Step 2: Initialize payment
      const paymentResult = await initializePayment({
        orderId,
        amount: getTotalPrice(),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        paymentMethods: [data.paymentMethod],
      });

      if (!paymentResult.success || !paymentResult.data) {
        toast({
          title: 'Error',
          description: paymentResult.message || 'Failed to initialize payment',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Step 3: Redirect to Monnify checkout
      const { checkoutUrl } = paymentResult.data;
      
      // Clear cart
      clearCart();

      // Redirect to Monnify payment page
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  async function handleNext() {
    // Validate current step before proceeding
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];
    
    if (currentStep === 1) {
      // Customer Info step
      fieldsToValidate = ['customerName', 'customerEmail', 'customerPhone'];
    } else if (currentStep === 2) {
      // Order Details step
      fieldsToValidate = ['orderType'];
      const orderType = form.getValues('orderType');
      
      if (orderType === 'delivery') {
        fieldsToValidate.push('deliveryAddress');
      } else if (orderType === 'pickup') {
        fieldsToValidate.push('pickupTime');
      } else if (orderType === 'dine-in') {
        fieldsToValidate.push('tableNumber');
      }
    } else if (currentStep === 3) {
      // Payment Method step - should not reach here as step 3 is the last step
      fieldsToValidate = ['paymentMethod'];
    }
    
    // Trigger validation for current step fields
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 flex-1 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{steps[currentStep - 1].name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStep === 1 && <CustomerInfoStep form={form} />}
                  {currentStep === 2 && <OrderDetailsStep form={form} />}
                  {currentStep === 3 && <PaymentMethodStep form={form} />}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                    {currentStep < steps.length ? (
                      <Button type="button" onClick={handleNext}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <OrderSummary orderType={form.watch('orderType')} />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
