'use client';

import { useState } from 'react';
import { MapPin, MoreVertical, Pencil, Trash2, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { IAddress } from '@/interfaces';
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/app/actions/profile/profile-actions';

interface AddressCardProps {
  address: IAddress;
  onEdit: () => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

/**
 * Address card component
 */
export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    if (!address._id) return;

    setIsDeleting(true);
    try {
      const result = await deleteAddressAction(address._id.toString());

      if (result.success) {
        onDelete(address._id.toString());
        toast({
          title: 'Address deleted',
          description: 'The address has been removed from your account.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete address',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSetDefault = async () => {
    if (!address._id || address.isDefault) return;

    setIsSettingDefault(true);
    try {
      const result = await setDefaultAddressAction(address._id.toString());

      if (result.success) {
        onSetDefault(address._id.toString());
        toast({
          title: 'Default address updated',
          description: 'This address is now your default delivery address.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to set default address',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSettingDefault(false);
    }
  };

  return (
    <>
      <Card className={address.isDefault ? 'border-primary' : ''}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{address.label}</p>
                  {address.isDefault && (
                    <Badge variant="secondary" className="mt-1">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Default
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!address.isDefault && (
                    <DropdownMenuItem
                      onClick={handleSetDefault}
                      disabled={isSettingDefault}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Address Details */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{address.streetAddress}</p>
              <p>
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p>{address.country}</p>
              {address.deliveryInstructions && (
                <p className="mt-2 italic text-xs">
                  Note: {address.deliveryInstructions}
                </p>
              )}
            </div>

            {/* Last Used */}
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
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{address.label}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
