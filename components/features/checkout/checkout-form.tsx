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
import { TabOptionsStep } from './tab-options-step';
import { TipInputStep } from './tip-input-step';
import { OrderSummary } from './order-summary';
import { createOrder, initializePayment } from '@/app/actions/payment/payment-actions';
import { createTabAction, getOpenTabForUserAction } from '@/app/actions/tabs/tab-actions';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { ITab } from '@/interfaces';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  // Tab options (for dine-in only)
  useTab: z.enum(['pay-now', 'new-tab', 'existing-tab']).optional(),
  
  // Tip
  tipAmount: z.number().min(0).optional(),
  
  // Payment
  paymentMethod: z.enum(['CARD', 'ACCOUNT_TRANSFER', 'USSD', 'PHONE_NUMBER'], {
    required_error: 'Please select a payment method',
  }).optional(),
  
  // Save preferences
  savePhone: z.boolean().optional(),
  saveAddress: z.boolean().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const baseSteps = [
  { id: 1, name: 'Customer Info', description: 'Your contact details' },
  { id: 2, name: 'Order Details', description: 'Delivery or pickup info' },
  { id: 3, name: 'Payment Options', description: 'Tab or pay now' },
  { id: 4, name: 'Tip', description: 'Add a tip (optional)' },
  { id: 5, name: 'Payment', description: 'Choose payment method' },
];

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated, isLoading: isLoadingUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [existingTab, setExistingTab] = useState<ITab | null>(null);
  const [steps, setSteps] = useState(baseSteps);
  const [isPreFilled, setIsPreFilled] = useState(false);

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
      useTab: 'pay-now',
      tipAmount: 0,
      savePhone: true,
      saveAddress: true,
    },
  });

  const orderType = form.watch('orderType');
  const useTab = form.watch('useTab');
  const tableNumber = form.watch('tableNumber');

  // Pre-populate form with user data
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasData = user.name || user.phone || user.email;
      if (hasData) {
        setIsPreFilled(true);
        if (user.name) form.setValue('customerName', user.name);
        if (user.email) form.setValue('customerEmail', user.email);
        if (user.phone) form.setValue('customerPhone', user.phone);
      }
    }
  }, [isAuthenticated, user, form]);

  // Fetch existing tab for user when dine-in is selected
  useEffect(() => {
    async function fetchExistingTab() {
      if (orderType === 'dine-in' && tableNumber) {
        const result = await getOpenTabForUserAction();
        if (result.success && result.data?.tab) {
          setExistingTab(result.data.tab);
        }
      }
    }
    fetchExistingTab();
  }, [orderType, tableNumber]);

  // Adjust steps based on order type and tab choice
  useEffect(() => {
    if (orderType === 'dine-in') {
      // Include all steps for dine-in
      setSteps(baseSteps);
    } else {
      // For pickup/delivery, skip tab options step
      setSteps([
        baseSteps[0], // Customer Info
        baseSteps[1], // Order Details
        baseSteps[3], // Tip
        baseSteps[4], // Payment
      ]);
    }
  }, [orderType]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/menu');
    }
  }, [items.length, router]);

  // Reset submission state when component mounts/unmounts
  useEffect(() => {
    return () => {
      setHasSubmitted(false);
      setIsSubmitting(false);
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  async function onSubmit(data: CheckoutFormData) {
    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      console.log('Preventing duplicate submission:', { isSubmitting, hasSubmitted });
      return;
    }
    
    console.log('Starting order submission');
    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // Handle tab creation if needed
      let tabId: string | undefined;
      
      if (data.orderType === 'dine-in' && data.useTab !== 'pay-now') {
        if (data.useTab === 'new-tab') {
          // Create new tab with customer details
          const tabResult = await createTabAction({
            tableNumber: data.tableNumber || '',
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
          });
          
          if (!tabResult.success || !tabResult.data) {
            toast({
              title: 'Error',
              description: tabResult.error || 'Failed to create tab',
              variant: 'destructive',
            });
            setIsSubmitting(false);
            setHasSubmitted(false);
            return;
          }
          
          tabId = tabResult.data.tab._id.toString();
        } else if (data.useTab === 'existing-tab' && existingTab) {
          tabId = existingTab._id.toString();
        }
      }

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
        tabId,
        tipAmount: data.tipAmount || 0,
        savePhone: data.savePhone,
        saveAddress: data.saveAddress,
      });

      if (!orderResult.success || !orderResult.data) {
        toast({
          title: 'Error',
          description: orderResult.message || 'Failed to create order',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setHasSubmitted(false);
        return;
      }

      const { orderId } = orderResult.data;

      // If using a tab, don't initialize payment yet
      if (tabId) {
        toast({
          title: 'Order Added to Tab',
          description: 'Your order has been added to your tab. You can add more orders or pay when ready.',
        });
        
        // Show profile update success if applicable
        if (isAuthenticated && (data.savePhone || data.saveAddress)) {
          setTimeout(() => {
            toast({
              title: 'Profile Updated',
              description: 'Your information has been saved for future orders.',
            });
          }, 1000);
        }
        
        clearCart();
        router.push('/orders');
        return;
      }

      // Step 2: Initialize payment (only if not using tab)
      if (!data.paymentMethod) {
        toast({
          title: 'Error',
          description: 'Please select a payment method',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setHasSubmitted(false);
        return;
      }

      const paymentResult = await initializePayment({
        orderId,
        amount: getTotalPrice() + (data.tipAmount || 0),
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
        setHasSubmitted(false);
        return;
      }

      // Step 3: Redirect to Monnify checkout
      const { checkoutUrl } = paymentResult.data;
      
      // Show profile update success if applicable
      if (isAuthenticated && (data.savePhone || data.saveAddress)) {
        toast({
          title: 'Profile Updated',
          description: 'Your information has been saved for future orders.',
        });
      }
      
      // Clear cart
      clearCart();

      // Small delay to show toast before redirect
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 500);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setHasSubmitted(false);
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
      const currentOrderType = form.getValues('orderType');
      
      if (currentOrderType === 'delivery') {
        fieldsToValidate.push('deliveryAddress');
      } else if (currentOrderType === 'pickup') {
        fieldsToValidate.push('pickupTime');
      } else if (currentOrderType === 'dine-in') {
        fieldsToValidate.push('tableNumber');
      }
    } else if (currentStep === 3 && orderType === 'dine-in') {
      // Tab options step for dine-in
      fieldsToValidate = ['useTab'];
    } else if (currentStep === 4) {
      // Tip step - optional, no validation needed
      fieldsToValidate = [];
    } else if (currentStep === 5 || (currentStep === 4 && orderType !== 'dine-in')) {
      // Payment method step - only validate if paying now
      if (useTab === 'pay-now' || orderType !== 'dine-in') {
        fieldsToValidate = ['paymentMethod'];
      }
    }
    
    // Trigger validation for current step fields
    const isValid = fieldsToValidate.length === 0 || await form.trigger(fieldsToValidate);
    
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
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center min-w-0">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 text-sm md:text-base ${
                    currentStep >= step.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs md:text-sm font-medium truncate max-w-[80px] md:max-w-none">
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 md:mx-4 h-0.5 flex-1 min-w-[20px] ${
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
                  {currentStep === 1 && isLoadingUser ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    currentStep === 1 && <CustomerInfoStep form={form} isPreFilled={isPreFilled} />
                  )}
                  {currentStep === 2 && <OrderDetailsStep form={form} />}
                  {currentStep === 3 && orderType === 'dine-in' && (
                    <TabOptionsStep
                      form={form}
                      existingTab={existingTab}
                      tableNumber={tableNumber || ''}
                    />
                  )}
                  {currentStep === 4 && <TipInputStep form={form} subtotal={getTotalPrice()} />}
                  {currentStep === 5 && useTab === 'pay-now' && <PaymentMethodStep form={form} />}
                  {currentStep === 3 && orderType !== 'dine-in' && <TipInputStep form={form} subtotal={getTotalPrice()} />}
                  {currentStep === 4 && orderType !== 'dine-in' && <PaymentMethodStep form={form} />}

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
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
