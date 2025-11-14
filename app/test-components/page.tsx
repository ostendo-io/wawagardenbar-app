'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from '@/components/shared/auth';
import { TextField, SelectField, SubmitButton } from '@/components/shared/forms';
import { EmptyState } from '@/components/shared/ui';
import { InlineErrorState } from '@/components/shared/errors';
import { MenuItemSkeleton, OrderSkeleton } from '@/components/shared/skeletons';
import { ShoppingCart, AlertCircle } from 'lucide-react';

export default function TestComponentsPage() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Component Showcase</h1>
        <p className="text-muted-foreground">
          Testing all UI components to verify they're working correctly
        </p>
      </div>

      <Separator />

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <SubmitButton isLoading>Loading...</SubmitButton>
        </div>
      </section>

      <Separator />

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This is the card content area.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>With a badge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge>New</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Form Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Form Components</h2>
        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Standard Input</Label>
              <Input id="test-input" placeholder="Enter text..." />
            </div>

            <TextField
              label="Text Field Component"
              placeholder="With label and error support"
              description="This is a helper text"
            />

            <SelectField
              label="Select Field"
              options={[
                { value: '1', label: 'Option 1' },
                { value: '2', label: 'Option 2' },
                { value: '3', label: 'Option 3' },
              ]}
              placeholder="Choose an option"
            />

            <SubmitButton>Submit Form</SubmitButton>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Toast Notifications */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() =>
              toast({
                title: 'Success!',
                description: 'This is a success message',
              })
            }
          >
            Show Success Toast
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast({
                title: 'Error!',
                description: 'This is an error message',
                variant: 'destructive',
              })
            }
          >
            Show Error Toast
          </Button>
        </div>
      </section>

      <Separator />

      {/* Auth Dialog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Auth Dialog</h2>
        <Button onClick={() => setShowAuthDialog(true)}>
          Open Auth Dialog
        </Button>
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          redirectTo="/menu"
        />
      </section>

      <Separator />

      {/* Loading Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading Skeletons</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-medium">Menu Item Skeleton</h3>
            <MenuItemSkeleton />
          </div>
          <div>
            <h3 className="mb-2 font-medium">Order Skeleton</h3>
            <OrderSkeleton />
          </div>
          <div>
            <h3 className="mb-2 font-medium">Basic Skeleton</h3>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>

      <Separator />

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Empty State</h2>
        <EmptyState
          icon={ShoppingCart}
          title="No items in cart"
          description="Add items from the menu to get started"
          action={{
            label: 'Browse Menu',
            onClick: () => alert('Navigate to menu'),
          }}
        />
      </section>

      <Separator />

      {/* Error States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Error States</h2>
        <div className="space-y-4">
          <InlineErrorState
            message="Failed to load data"
            onRetry={() => alert('Retry clicked')}
          />
        </div>
      </section>

      <Separator />

      {/* Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Icons (Lucide)</h2>
        <div className="flex gap-4">
          <ShoppingCart className="h-8 w-8" />
          <AlertCircle className="h-8 w-8" />
        </div>
      </section>
    </div>
  );
}
