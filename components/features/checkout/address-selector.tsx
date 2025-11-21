'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { IAddress } from '@/interfaces';

interface AddressSelectorProps {
  addresses: IAddress[];
  onSelectAddress: (address: IAddress) => void;
  onAddNew: () => void;
  selectedAddressId?: string;
}

export function AddressSelector({
  addresses,
  onSelectAddress,
  onAddNew,
  selectedAddressId,
}: AddressSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedAddressId || '');

  function handleSelectAddress(addressId: string) {
    setSelected(addressId);
    const address = addresses.find((addr) => addr._id?.toString() === addressId);
    if (address) {
      onSelectAddress(address);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Delivery Address</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {addresses.length > 0 ? (
        <RadioGroup value={selected} onValueChange={handleSelectAddress}>
          <div className="space-y-3">
            {addresses.map((address) => {
              const addressId = address._id?.toString() || '';
              const isSelected = selected === addressId;

              return (
                <Card
                  key={addressId}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectAddress(addressId)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={addressId} id={addressId} />
                      <Label
                        htmlFor={addressId}
                        className="flex-1 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{address.label || 'Address'}</span>
                          {address.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.streetAddress}
                          {address.city && `, ${address.city}`}
                          {address.state && `, ${address.state}`}
                        </p>
                        {address.deliveryInstructions && (
                          <p className="text-xs text-muted-foreground italic">
                            Note: {address.deliveryInstructions}
                          </p>
                        )}
                        {address.lastUsedAt && (
                          <p className="text-xs text-muted-foreground">
                            Last used:{' '}
                            {new Date(address.lastUsedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </Label>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
      ) : (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-muted-foreground">No saved addresses</p>
              <p className="text-sm text-muted-foreground">
                Add your first address to save time on future orders
              </p>
            </div>
            <Button type="button" variant="default" onClick={onAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
