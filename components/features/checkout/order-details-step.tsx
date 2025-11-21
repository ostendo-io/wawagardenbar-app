'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UtensilsCrossed, Package, Truck, MapPin, Clock } from 'lucide-react';

interface OrderDetailsStepProps {
  form: UseFormReturn<any>;
}

export function OrderDetailsStep({ form }: OrderDetailsStepProps) {
  const orderType = form.watch('orderType');

  return (
    <div className="space-y-6">
      {/* Order Type Selection */}
      <FormField
        control={form.control}
        name="orderType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Order Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid gap-4 sm:grid-cols-3"
              >
                <Label
                  htmlFor="dine-in"
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    field.value === 'dine-in'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="dine-in" id="dine-in" className="sr-only" />
                  <UtensilsCrossed className="h-6 w-6" />
                  <span className="font-medium">Dine In</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Eat at the restaurant
                  </span>
                </Label>

                <Label
                  htmlFor="pickup"
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    field.value === 'pickup'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                  <Package className="h-6 w-6" />
                  <span className="font-medium">Pickup</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Collect your order
                  </span>
                </Label>

                <Label
                  htmlFor="delivery"
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    field.value === 'delivery'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                  <Truck className="h-6 w-6" />
                  <span className="font-medium">Delivery</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Delivered to you
                  </span>
                </Label>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dine-in: Table Number */}
      {orderType === 'dine-in' && (
        <FormField
          control={form.control}
          name="tableNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., T12" {...field} />
              </FormControl>
              <FormDescription>
                Enter your table number or scan the QR code
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Pickup: Preferred Time */}
      {orderType === 'pickup' && (
        <FormField
          control={form.control}
          name="pickupTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Pickup Time</FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="datetime-local" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                When would you like to pick up your order?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Delivery: Address Details */}
      {orderType === 'delivery' && (
        <>
          <FormField
            control={form.control}
            name="deliveryAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Enter your full delivery address"
                      className="pl-10 min-h-[80px]"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Include street name, house number, and area
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryLandmark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Landmark (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Near City Mall" {...field} />
                </FormControl>
                <FormDescription>
                  Help us find you easier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Instructions (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Call when you arrive, Ring the doorbell"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saveAddress"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 touch-manipulation">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1 h-5 w-5"
                  />
                </FormControl>
                <div className="space-y-1 leading-none flex-1">
                  <FormLabel className="cursor-pointer">
                    Save this address for future orders
                  </FormLabel>
                  <FormDescription>
                    We'll pre-fill this address next time you order delivery
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </>
      )}

      {/* Special Instructions (All Types) */}
      <FormField
        control={form.control}
        name="specialInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Special Instructions (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any special requests for your order?"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Dietary requirements, allergies, or other requests
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
