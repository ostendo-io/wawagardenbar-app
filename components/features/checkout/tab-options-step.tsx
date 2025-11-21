'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Receipt } from 'lucide-react';
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

      <RadioGroup
        value={useTab}
        onValueChange={(value) => form.setValue('useTab', value)}
        className="space-y-3"
      >
        {/* Pay Now Option */}
        <Card className={useTab === 'pay-now' ? 'border-primary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="pay-now" id="pay-now" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="pay-now" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-semibold">Pay Now</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete payment immediately for this order only
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
        <Card className={useTab === 'new-tab' ? 'border-primary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="new-tab" id="new-tab" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="new-tab" className="flex items-center gap-2 cursor-pointer">
                  <Receipt className="h-5 w-5" />
                  <span className="font-semibold">
                    {existingTab ? 'Open Another Tab' : 'Open a Tab'}
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a new tab for Table {tableNumber} and add this order to it. Pay later when you're ready to close the tab.
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
