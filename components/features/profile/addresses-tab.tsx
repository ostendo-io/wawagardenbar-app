'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IAddress } from '@/interfaces';
import { AddressCard } from './address-card';
import { AddressFormDialog } from './address-form-dialog';

interface AddressesTabProps {
  addresses: IAddress[];
}

/**
 * Addresses tab component
 */
export function AddressesTab({ addresses: initialAddresses }: AddressesTabProps) {
  const [addresses, setAddresses] = useState<IAddress[]>(initialAddresses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);

  const handleAddressAdded = (newAddress: IAddress) => {
    setAddresses([...addresses, newAddress]);
    setIsAddDialogOpen(false);
  };

  const handleAddressUpdated = (updatedAddress: IAddress) => {
    setAddresses(
      addresses.map((addr) =>
        addr._id?.toString() === updatedAddress._id?.toString()
          ? updatedAddress
          : addr
      )
    );
    setEditingAddress(null);
  };

  const handleAddressDeleted = (addressId: string) => {
    setAddresses(addresses.filter((addr) => addr._id?.toString() !== addressId));
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr._id?.toString() === addressId,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {addresses.length === 0
              ? 'No saved addresses yet'
              : `${addresses.length} saved ${addresses.length === 1 ? 'address' : 'addresses'}`}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven't added any delivery addresses yet
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address._id?.toString()}
              address={address}
              onEdit={() => setEditingAddress(address)}
              onDelete={handleAddressDeleted}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Add Address Dialog */}
      <AddressFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddressAdded}
      />

      {/* Edit Address Dialog */}
      {editingAddress && (
        <AddressFormDialog
          open={!!editingAddress}
          onOpenChange={(open) => !open && setEditingAddress(null)}
          address={editingAddress}
          onSuccess={handleAddressUpdated}
        />
      )}
    </div>
  );
}
