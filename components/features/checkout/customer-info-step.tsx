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
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Phone, CheckCircle2 } from 'lucide-react';

interface CustomerInfoStepProps {
  form: UseFormReturn<any>;
  isPreFilled?: boolean;
}

export function CustomerInfoStep({ form, isPreFilled = false }: CustomerInfoStepProps) {
  return (
    <div className="space-y-4">
      {isPreFilled && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>Using saved information from your profile</span>
        </div>
      )}
      <FormField
        control={form.control}
        name="customerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="John Doe" className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormDescription>
              Your name as it should appear on the order
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customerEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription>
              We'll send your order confirmation here
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customerPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  className="pl-10"
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription>
              For order updates and delivery coordination
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="savePhone"
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
                Save phone number for future orders
              </FormLabel>
              <FormDescription>
                We'll pre-fill this information next time you checkout
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
