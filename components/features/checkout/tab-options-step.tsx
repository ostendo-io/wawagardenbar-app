'use client';

import { UseFormReturn } from 'react-hook-form';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard, Receipt, AlertCircle, ArrowRight } from 'lucide-react';
import { ITab } from '@/interfaces';

interface TabOptionsStepProps {
  form: UseFormReturn<any>;
  existingTab?: ITab | null;
  tableNumber: string;
}

export function TabOptionsStep({ form, existingTab, tableNumber }: TabOptionsStepProps) {
  const useTab = form.watch('useTab');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Options</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to handle payment for this order
        </p>
      </div>

      {existingTab && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">You have an open tab</h4>
              <p className="text-sm text-amber-700 mt-1">
                Please add this order to your existing tab, or close it first to start a new order.
              </p>
              <Link href={`/orders/tabs/${existingTab._id}`}>
                <Button variant="link" className="h-auto p-0 text-amber-800 font-semibold mt-2">
                  View / Close Tab <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <RadioGroup
        value={useTab}
        onValueChange={(value) => form.setValue('useTab', value)}
        className="space-y-3"
      >
        {/* Pay Now Option */}
        <Card className={`${useTab === 'pay-now' ? 'border-primary' : ''} ${existingTab ? 'opacity-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem 
                value="pay-now" 
                id="pay-now" 
                className="mt-1" 
                disabled={!!existingTab}
              />
              <div className="flex-1">
                <Label 
                  htmlFor="pay-now" 
                  className={`flex items-center gap-2 ${existingTab ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-semibold">Pay Now</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {existingTab 
                    ? "Close your existing tab to use this option"
                    : "Complete payment immediately for this order only"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add to Existing Tab Option */}
        {existingTab && (
          <Card className={useTab === 'existing-tab' ? 'border-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="existing-tab" id="existing-tab" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="existing-tab" className="flex items-center gap-2 cursor-pointer">
                    <Receipt className="h-5 w-5" />
                    <span className="font-semibold">Add to Existing Tab</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add this order to your open tab for Table {existingTab.tableNumber}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Current tab total: ₦{existingTab.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Open New Tab Option */}
        <Card className={`${useTab === 'new-tab' ? 'border-primary' : ''} ${existingTab ? 'opacity-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem 
                value="new-tab" 
                id="new-tab" 
                className="mt-1"
                disabled={!!existingTab}
              />
              <div className="flex-1">
                <Label 
                  htmlFor="new-tab" 
                  className={`flex items-center gap-2 ${existingTab ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Receipt className="h-5 w-5" />
                  <span className="font-semibold">Open a Tab</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {existingTab
                    ? "You already have an open tab"
                    : `Start a new tab for Table ${tableNumber} and add this order to it. Pay later when you're ready to close the tab.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>

      {(useTab === 'new-tab' || useTab === 'existing-tab') && (
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm">
            <strong>Note:</strong> You can add multiple orders to your tab and pay once when you're ready to leave.
          </p>
        </div>
      )}
    </div>
  );
}
